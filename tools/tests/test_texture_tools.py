#!/usr/bin/env python3
"""The texture tools' survey fixes (BUGS-2026-11-15.md T16, T18, T19), each with its negative control, on made-up sets in a
temporary folder (no library image is read):
  - preview.py takes a card set (albedo.png with alpha, no normal.jpg) and draws it over grey; a set that is not a card
    and has no normal.jpg still fails, as it should;
  - pack.py names every LFS pointer its families read, with the family and one pull, and never reads a set no family
    names (a pointer there no longer aborts the pack);
  - pack.py reads the M1 classes (Stage 8 B11): a glazed family's web normal at 8 bits, an unclassed, flat or relief one
    byte for byte as before; a cut-out class never takes a height in its alpha (Gate 1); roughScale scales the roughness;
  - check_prompts.py fails a block that runs into the next heading, an odd fence count and a count line that is off, and
    passes a file that holds together.

    python3 tools/tests/test_texture_tools.py
"""
import contextlib, io, json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import pack, check_prompts  # noqa: E402

POINTER = 'version https://git-lfs.github.com/spec/v1\noid sha256:%s\nsize 99999\n' % ('cd' * 32)
checks = []


def ok(name, cond):
    checks.append((name, bool(cond)))


def write_json(p, v):
    with open(p, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(v, fh)


def surface(d, sid, pointer_normal=False):
    os.makedirs(d, exist_ok=True)
    rng = np.random.default_rng(3)
    Image.fromarray((rng.random((32, 32, 3)) * 255).astype(np.uint8)).save(os.path.join(d, 'albedo.jpg'))
    if pointer_normal:
        with open(os.path.join(d, 'normal.jpg'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(POINTER)
    else:
        Image.fromarray(np.full((32, 32, 3), (128, 128, 255), np.uint8)).save(os.path.join(d, 'normal.jpg'))
    Image.fromarray(np.full((32, 32), 200, np.uint8)).save(os.path.join(d, 'roughness.png'))
    write_json(os.path.join(d, 'meta.json'), {'record': {'id': sid}, 'maps': {'map': 'albedo.jpg', 'normalMap': 'normal.jpg', 'roughnessMap': 'roughness.png'}})


def card(d, sid, kind='card'):
    os.makedirs(d, exist_ok=True)
    a = np.zeros((32, 32, 4), np.uint8)
    a[8:24, 12:20] = (40, 140, 50, 255)
    Image.fromarray(a, 'RGBA').save(os.path.join(d, 'albedo.png'))
    rec = {'id': sid}
    if kind:
        rec['kind'] = kind
    write_json(os.path.join(d, 'meta.json'), {'record': rec, 'maps': {'map': 'albedo.png'}})


def test_preview(tmp):
    cd, sd = os.path.join(tmp, 'card.test'), os.path.join(tmp, 'notcard.test')
    card(cd, 'card.test')
    card(sd, 'notcard.test', kind=None)
    out = os.path.join(tmp, 'sheet.jpg')
    run = lambda *sets: subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'textures', 'preview.py'), out] + list(sets),
                                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    r = run(cd)
    good = r.returncode == 0 and os.path.isfile(out)
    if good:
        im = np.asarray(Image.open(out).convert('RGB')).astype(int)
        # the first panel: mid grey round the card, the card's green in the middle
        y0, P = 16, 360
        corner, mid = im[y0 + 10, 10], im[y0 + P // 2, P // 2]
        good = abs(corner - 128).max() < 12 and mid[1] > mid[0] + 40
    ok('preview.py draws a card set (no normal.jpg) over grey, its plant in the middle', good)
    os.remove(out) if os.path.isfile(out) else None
    r = run(sd)
    ok('negative control: a set that is not a card and has no normal.jpg still fails', r.returncode != 0 and 'normal.jpg' in r.stderr)


def test_pack(tmp):
    lib = os.path.join(tmp, 'library')
    surface(os.path.join(lib, 'set.good'), 'set.good')
    surface(os.path.join(lib, 'set.ptr'), 'set.ptr', pointer_normal=True)
    surface(os.path.join(lib, 'set.unnamed'), 'set.unnamed', pointer_normal=True)   # in the library, named by no family
    build = os.path.join(tmp, 'build')
    os.makedirs(build)
    old = pack.LIB
    pack.LIB = lib
    try:
        def run(fams):
            write_json(os.path.join(build, 'materials.json'), {'build': 'test', 'size': 32, 'families': fams})
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                try:
                    code = pack.main([build])
                except SystemExit as e:
                    code = 'exit: %s' % e
            return code, buf.getvalue()
        code, out = run({'stone': {'lib': 'set.good'}, 'wall': {'lib': 'set.ptr'}})
        ok('pack.py names the family and set that read a pointer, and the pull', code == 1 and 'family wall (set set.ptr)' in out
           and 'set.ptr/normal.jpg' in out and 'git lfs pull' in out and 'stone' not in out)
        ok('...and writes no pack', not os.path.isfile(os.path.join(build, 'tex', 'pack.json')))
        ok('...and does not mention the pointer set no family names', 'set.unnamed' not in out)
        code, out = run({'stone': {'lib': 'set.good'}})
        ok('a pointer in a set no family names does not abort the pack', code == 0 and os.path.isfile(os.path.join(build, 'tex', 'pack.json')))
        code, out = run({'wall': {'lib': 'set.ptr', 'mapOnly': True}})
        ok('negative control: a family that reads only the map of a set with a pointer normal packs', code == 0)
    finally:
        pack.LIB = old


def test_class(tmp):
    """Stage 8 B11: process() reads the family's M1 class through tools/textures/mclass.py. The made-up set's normal is flat
    (128, 128, 255; the JPEG keeps red at 128): kept to 6 bits every channel value is the middle of its step (128 -> 130),
    at 8 bits red stays 128."""
    lib = os.path.join(tmp, 'library-class')
    surface(os.path.join(lib, 'set.lit'), 'set.lit')
    old = pack.LIB
    pack.LIB = lib
    try:
        def run(fc, fmt=1):
            try:
                return pack.process('f', dict({'lib': 'set.lit'}, **fc), 32, pack_format=fmt)
            except ValueError as e:
                return 'refused: %s' % e
        def normal(r):
            return np.asarray(Image.open(io.BytesIO(r[1]['f.normal.webp'])).convert('RGB'))
        base = run({})
        ok('an unclassed family packs its web normal at 6 bits, as before B11', (normal(base) % 4 == 2).all())
        for cls in ('flat', 'relief'):
            r = run({'class': cls})
            ok('a %s family packs byte for byte as an unclassed one (its class settings are today\'s)' % cls,
               r[1] == base[1] and json.dumps(r[0], sort_keys=True) == json.dumps(base[0], sort_keys=True))
        g = run({'class': 'glazed'})
        ok('a glazed family packs its web normal at 8 bits (xy8, D4), and its entry says so',
           (normal(g)[..., 0] == 128).all() and not (normal(g) % 4 == 2).all() and g[0].get('normalBits') == 8)
        ok('...its colour and roughness maps as an unclassed family\'s',
           g[1]['f.albedo.webp'] == base[1]['f.albedo.webp'] and g[1]['f.rough.webp'] == base[1]['f.rough.webp'])
        ok('a cut-out family asked for a parallax height is refused (Gate 1: alphaTest reads that alpha)',
           str(run({'class': 'cutout', 'cutout': True, 'pom': 0.02})).startswith('refused') and 'Gate 1' in str(run({'class': 'cutout', 'cutout': True, 'pom': 0.02})))
        ok('negative control: the same family classed relief takes the height into its alpha',
           not isinstance(run({'class': 'relief', 'pom': 0.02}), str)
           and Image.open(io.BytesIO(run({'class': 'relief', 'pom': 0.02})[1]['f.albedo.webp'])).mode == 'RGBA')
        c2, f2 = run({'class': 'cutout', 'cutout': True}, 2), run({'class': 'flat'}, 2)
        ok('packFormat 2: a cut-out family packs alphaMode none (no height in its alpha, Gate 1)',
           not isinstance(c2, str) and c2[0]['alphaMode'] == 'none')
        ok('negative control: packFormat 2 puts the Poisson height in a flat family\'s alpha',
           not isinstance(f2, str) and f2[0]['alphaMode'] == 'height')
        ok('an unknown class is refused, not packed as unclassed', str(run({'class': 'shiny'})).startswith('refused'))
        s = run({'roughScale': 0.5})
        rough = lambda r: float(np.asarray(Image.open(io.BytesIO(r[1]['f.rough.webp'])).convert('L')).mean())
        ok('roughScale scales the packed roughness (200 -> 100) and the entry records it',
           abs(rough(s) - 100) < 2 and abs(rough(base) - 200) < 2 and s[0].get('roughScale') == 0.5 and 'roughScale' not in base[0])
    finally:
        pack.LIB = old


GOOD = """# Prompts
**Count: 3 prompts** (any prose here)

## 1. One
`a.b`:
```
prompt one
```

## 2. Two
| id | Material line |
|---|---|
| `c.d` | a row |
| `e.f` | another |
"""


def test_prompts():
    p, b, r, n = check_prompts.check(GOOD)
    ok('check_prompts passes a file that holds together (1 block + 2 rows = 3)', not p and (b, r, n) == (1, 2, 3))
    broken = GOOD.replace('prompt one\n```\n', 'prompt one\n')
    p = check_prompts.check(broken)[0]
    ok('a block that runs into the next heading fails, naming both lines', any('opened at line 6' in x and 'heading at line 9' in x for x in p))
    ok('...and the odd fence count fails', any('odd count' in x for x in p))
    p = check_prompts.check(GOOD.replace('Count: 3', 'Count: 21'))[0]
    ok('a count line that is off fails with the real count', any('says 21 prompts; the file holds 3' in x for x in p))
    p = check_prompts.check(GOOD.replace('**Count: 3 prompts**', 'Count unknown'))[0]
    ok('a file with no count line fails', any('no count line' in x for x in p))
    with open(check_prompts.FILE, encoding='utf-8') as fh:
        ok("the repo's PROMPTS-NEEDED.md passes", not check_prompts.check(fh.read())[0])


def main():
    with tempfile.TemporaryDirectory() as tmp:
        test_preview(tmp)
        test_pack(tmp)
        test_class(tmp)
    test_prompts()
    bad = 0
    for name, good in checks:
        bad += not good
        print('%s  %s' % ('ok  ' if good else 'FAIL', name))
    print('%d checks, %d wrong' % (len(checks), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
