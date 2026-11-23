#!/usr/bin/env python3
"""Gates 1 and 3 on the M1 classes (settlements/xanadu/STACK-PLAN.md sections 5 and 8; GRAPHICS-TERRAIN-PROPOSAL.md 9.2).

For every family of the named builds' materials.json, the stack's own packer (tools/textures/pack.py's `process` with
packFormat 2; before Stage 8 merges the stack, read from --ref) packs it IN MEMORY under its class, writing nothing:
  - Gate 1: pack.py's assert_pack_physics, with the class's `flat` (core/materials/classes/m1-classes.json through
    mclass.py), on the web encoding (xy8 for glazed, xy6 for the rest) and on Godot's (oct8): a card never gets a height in
    its alpha, no NaN, roughness in 0..1, normal error under 3.5 degrees, a height range unless flat;
  - Gate 3 (handedness): a synthetic dome through each encoding (xy6, xy8, oct8) leans outward and its Poisson height
    peaks (the DirectX green, the negative, must fail); and per family, the height pack.py rebuilds from the class-encoded
    normal correlates with the one rebuilt from the unquantised normal (none of these sets has a height map of its own,
    so Stage 8 derives every height this way: heightSource 'normalPoisson').
Nothing is written: the packs are Stage 8's (the owner: data now, looks after).

    python3 tools/textures/m1_class_gates.py --ref origin/claude/vertical-stack kits/xanadu kits/qiblai ...
    python3 tools/textures/m1_class_gates.py kits/xanadu      # once the stack is merged: today's pack.py
"""
import io, json, os, subprocess, sys, types
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import mclass  # noqa: E402


def packer(ref):
    """tools/textures/pack.py at `ref` (or today's) as a module, for its process() and assert_pack_physics."""
    if not ref:
        import pack as P
    else:
        src = subprocess.run(['git', 'show', '%s:tools/textures/pack.py' % ref], cwd=ROOT, capture_output=True, text=True,
                             encoding='utf-8', check=True).stdout
        P = types.ModuleType('pack_at_ref')
        P.__file__ = os.path.join(HERE, 'pack.py')
        exec(compile(src, 'pack.py@' + ref, 'exec'), P.__dict__)
    # nothing is written, so the image encoders are not run: Gate 1 checks the arrays before they are encoded
    P.webp = lambda *a, **k: b''
    P.webp_bytes = lambda *a, **k: b''
    if not hasattr(P, 'assert_pack_physics'):
        sys.exit('m1_class_gates: pack.py%s has no packFormat 2 (assert_pack_physics): pass --ref origin/claude/vertical-stack'
                 % (' at ' + ref if ref else ''))
    return P


def dome_probe(P, enc, flip_green=False, n=128):
    """Gate 3 through one encoding: a synthetic dome's normals (pack.py's convention: n.x = -dh/dcol, n.y = +dh/drow),
    encoded and decoded, lean outward at the four probe points, and pack.py's Poisson height rebuilt from them peaks at the
    centre (the height Stage 8 derives for every set without a height map of its own). flip_green: the DirectX convention,
    the negative that must fail."""
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float64)
    r2 = ((xx - n / 2) ** 2 + (yy - n / 2) ** 2) / (n * 0.22) ** 2
    h = np.exp(-r2)
    dx = 0.5 * (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * n * 0.08
    dy = 0.5 * (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * n * 0.08
    nf = np.stack([-dx, dy * (-1 if flip_green else 1), np.ones_like(h)], -1)
    nf /= np.linalg.norm(nf, axis=-1, keepdims=True)
    _, dec = P.encode_normal_rg(nf, enc)
    c, q = n // 2, int(n * 0.18)
    # right of the peak the normal leans +X, left -X; above it (a smaller row, +Y up) +Y, below it -Y
    lean = dec[c, c + q, 0] > 0.05 and dec[c, c - q, 0] < -0.05 and dec[c - q, c, 1] > 0.05 and dec[c + q, c, 1] < -0.05
    hr = P.reconstruct_height_from_normal(dec)
    peak = hr[c, c] > hr[0, 0] + 0.2 and hr[c, c] > hr[c, 0] + 0.2
    return bool(lean and peak)


def gate3(P, fc, size, enc):
    """Per family: the height Stage 8 rebuilds from the class-encoded normal has the sign of the one rebuilt from the
    unquantised normal (the encoding flips no relief). (ok, corr), or None for a family with no lit normal."""
    d = P.set_dir(fc['lib'])
    meta = json.load(io.open(os.path.join(d, 'meta.json'), encoding='utf-8'))
    pn = os.path.join(d, (meta.get('maps') or {}).get('normalMap', 'normal.jpg'))
    if not os.path.isfile(pn) or fc.get('mapOnly'):
        return None
    n = P.load(pn, size, 'RGB') * 2.0 - 1.0
    n /= np.maximum(np.linalg.norm(n, axis=2, keepdims=True), 1e-6)
    _, dec = P.encode_normal_rg(n, enc)
    c = float(np.corrcoef(P.reconstruct_height_from_normal(n).ravel(), P.reconstruct_height_from_normal(dec).ravel())[0, 1])
    return c > 0.9, round(c, 4)


def run(builds, ref, size=None):
    P = packer(ref)
    tab = mclass.table()
    rows, fails = [], 0
    for enc in ('xy6', 'xy8', 'oct8'):
        ok, neg = dome_probe(P, enc), dome_probe(P, enc, flip_green=True)
        rows.append(('(probe)', enc, '', 'gate 3 dome: %s; DirectX green (the negative): %s' % (
            'ok' if ok else 'FAIL', 'caught' if not neg else 'NOT CAUGHT')))
        fails += (not ok) + bool(neg)
    for b in builds:
        cfg = json.load(io.open(os.path.join(ROOT, b, 'materials.json'), encoding='utf-8'))
        sz = size or int(cfg.get('size', 512))
        for fam in sorted(cfg['families']):
            fc = dict(cfg['families'][fam])
            if fc.get('optional') and not os.path.isfile(os.path.join(P.set_dir(fc['lib']), 'meta.json')):
                rows.append((b, fam, fc.get('class'), 'skipped: library set not delivered (optional)'))
                continue
            S = mclass.settings(fc, tab)
            fc['flat'] = bool(fc.get('flat')) or S['flat']
            out = []
            for eng, enc in (('web', S['web']['normal'] or 'xy6'), ('godot', S['godot']['normal'] or 'oct8')):
                try:
                    e, _ = P.process(fam, fc, sz, pack_format=2, normal_enc=enc)
                    err = e.get('normalError', {}).get('meanDeg')
                    out.append('%s %s %s%s' % (eng, enc, e.get('alphaMode'), '' if err is None else ' %.2f deg' % err))
                    if S['cls'] == 'card' and e.get('alphaMode') == 'height':
                        raise ValueError('a card packed with a height in its alpha')
                except Exception as x:   # Gate 1 refuses by raising ValueError
                    fails += 1
                    out.append('%s %s GATE 1 FAIL: %s' % (eng, enc, x))
            g3 = gate3(P, fc, sz, S['web']['normal'] or 'xy6') if S['cls'] != 'card' else None
            if g3 is not None and not g3[0]:
                fails += 1
            out.append('gate 3: ' + ('no lit normal' if g3 is None else ('ok' if g3[0] else 'FAIL') + ' (height corr %.4f)' % g3[1]))
            rows.append((b, fam, S['cls'], '; '.join(out)))
    return rows, fails


def main(argv):
    ref = argv[argv.index('--ref') + 1] if '--ref' in argv else None
    size = int(argv[argv.index('--size') + 1]) if '--size' in argv else None
    skip = {ref, str(size)}
    builds = [a for a in argv if not a.startswith('--') and a not in skip]
    rows, fails = run(builds, ref, size)
    for r in rows:
        print('%-26s %-11s %-7s %s' % r)
    fams = [r for r in rows if r[0] != '(probe)']
    g3 = [r for r in fams if 'gate 3: ok' in r[3] or 'gate 3: FAIL' in r[3]]
    print('%d families; Gate 1 and Gate 3 failures: %d; Gate 3 per family on %d (the rest: cards and mapOnly sheets)'
          % (len(fams), fails, len(g3)))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
