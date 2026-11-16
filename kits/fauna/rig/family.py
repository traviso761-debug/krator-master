#!/usr/bin/env python3
"""Merge rigged models of one lineage into a family: python3 rig/family.py <family>

A family is one model file many species share. rig/families/<family>.json names its sources (each a rig/sources/<key>/rig-meshy71.glb) and its
picks: a species is a choice of body (thorax, legs and their clips), abdomen, jaws and eyes, three tints and a scale. Parts sit on their own pivots, so a
part of one source fits the joint of another. Nothing is duplicated, so ten spiders cost about what two would.

  sizes     every source is scaled to one thorax length, so parts of different sources are the same size to begin with
  tints     each colour map is taken down to its grey and brightened, so a tint multiplied over it reads as that colour and the markings stay
  eyes      glossy beads, not paint, so they swap with the rest. Each layout is a list of (x, z, r) on the thorax, x and r as shares of its length (x of 0.36 of it, about the carapace's half width: its box can run out along the leg sockets), z of its
            length from the back; each bead drops onto the carapace from above and hangs from a pivot of its own

Runs models_pack.py on each source, then writes models/<family>.json. Then rig/fit_anchors.js, rig/patch_models.py and tests/test-models.js, as for any model.
Needs numpy and Pillow.
"""
import base64, io, json, os, subprocess, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
b64 = lambda s, t: np.frombuffer(base64.b64decode(s), t)
enc = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode('ascii')


def neutral(url, q=84):
    """the colour map's value alone, its mean brought to about 0.8, as a JPEG data URL: a tint multiplies it"""
    im = Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('L'); a = np.asarray(im, float) / 255
    m = np.median(a[a > 0.04]); a = np.clip(a * (0.8 / max(m, 1e-3)), 0, 1)
    out = io.BytesIO(); Image.fromarray((a * 255).astype(np.uint8)).convert('RGB').save(out, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(out.getvalue()).decode('ascii')


def scale_track_units(M, k):
    """multiply a packed model's lengths by k"""
    for nd in M['nodes']:
        nd['t'] = [x * k for x in nd['t']]
    for m in M['meshes'].values():
        m['min'] = [x * k for x in m['min']]; m['size'] = [x * k for x in m['size']]
    for an in M['anims'].values():
        for tr in an['tracks']:
            if tr['path'] == 'position':
                tr['v'] = enc(b64(tr['v'], '<f4') * k)
        ex = an.get('extras')
        if ex:
            for q in ('speed', 'stride', 'ground'):
                if q in ex:
                    ex[q] = ex[q] * k
    r = M['rest']; r['ground'] *= k; r['center'] = [x * k for x in r['center']]
    for q in ('w', 'd', 'h'):
        r[q] *= k; r['extent'][q] *= k


def thorax_extent(M):
    m = M['meshes']['thorax']; return m['size']


def bead(cx, cy, cz, r, n=1):
    """a low icosphere: (positions, normals, indices)"""
    t = (1 + 5 ** 0.5) / 2
    V = np.array([[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]], float)
    F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]]
    V /= np.linalg.norm(V, axis=1, keepdims=True); V = list(map(tuple, V))
    for _ in range(n):
        G, mid = [], {}
        def m(a, b):
            k = tuple(sorted((a, b)))
            if k not in mid:
                p = (np.array(V[a]) + np.array(V[b])) / 2; p /= np.linalg.norm(p); mid[k] = len(V); V.append(tuple(p))
            return mid[k]
        for a, b, c in F:
            ab, bc, ca = m(a, b), m(b, c), m(c, a); G += [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]
        F = G
    V = np.array(V); return V * r + np.array([cx, cy, cz]), V, np.array(F)


def pack_mesh(P, N, F):
    lo, hi = P.min(0), P.max(0); sc = np.maximum(hi - lo, 1e-9); q = np.round((P - lo) / sc * 65535).astype('<u2'); nq = np.round(np.clip(N, -1, 1) * 127).astype('i1')
    return {'n': len(P), 'min': [float(x) for x in lo], 'size': [float(x) for x in sc], 'pos': enc(q), 'nrm': enc(nq), 'uv': enc(np.zeros((len(P), 2), '<u2')), 'idx': enc(F.astype('<u2')), 'wide': False, 'src': 'eye'}


def main():
    name = sys.argv[1]
    cfg = json.load(open(os.path.join(HERE, 'families', name + '.json'), encoding='utf-8'))
    packs = {}
    for tag, key in cfg['sources'].items():
        out = os.path.join(HERE, 'sources', key, 'pack-meshy71.json')
        r = subprocess.run([sys.executable, os.path.join(KIT, 'models_pack.py'), os.path.join(HERE, 'sources', key, 'rig-meshy71.glb'), out, '--key', key, '--group', cfg['group'], '--scale', '1', '--truthful-sides', '--source', 'source-meshy71.json', '--tex', str(cfg['tex'][tag]), '--nrmtex', str(cfg.get('nrmtex', 512))], capture_output=True, text=True, encoding='utf-8')
        if r.returncode:
            sys.exit(r.stderr[-400:])
        packs[tag] = json.load(open(out, encoding='utf-8'))
    ref = cfg['unit']      # every source's thorax is made this long (z)
    swap = cfg.get('swap', ['abd', 'jaw'])
    F = {'format': 2, 'family': True, 'swap': swap, 'opts': {n: [] for n in swap}, 'key': name, 'group': cfg['group'], 'scale': 1, 'tex': {}, 'meshes': {}, 'bodies': {}, 'source': {}, 'picks': {}}
    for tag, M in packs.items():
        k = ref / thorax_extent(M)[2]; scale_track_units(M, k)
        F['tex'][tag] = {'map': neutral(M['tex']['map']), 'nrm': M['tex']['nrm'], 'mr': M['tex']['mr']}; F['source'][tag] = M['source']
        for n, m in M['meshes'].items():
            m['src'] = tag; F['meshes'][n + '~' + tag] = m
        for n in swap:
            F['opts'][n].append(tag)
        if tag not in cfg['bodies']:      # parts only: its legs are not offered, so they are not kept
            F['meshes'] = {n: m for n, m in F['meshes'].items() if not n.endswith('~' + tag) or n.startswith(tuple(q + '~' for q in swap))}
            continue
        byname = {nd['name']: nd for nd in M['nodes']}
        F['bodies'][tag] = {'nodes': [dict(nd) for nd in M['nodes'] if nd['name'] not in swap], 'anims': M['anims'], 'rest': M['rest'], 'at': {n: byname[n]['t'] for n in swap}, 'par': {n: M['nodes'][byname[n]['parent']]['name'] for n in swap}, 'thorax': M['meshes']['thorax']['size'], 'thoraxMin': M['meshes']['thorax']['min']}
        for i, nd in enumerate(F['bodies'][tag]['nodes']):
            nd['_parent'] = None if nd['parent'] < 0 else M['nodes'][nd['parent']]['name']; del nd['parent']
    # the eyes: beads on the thorax's front, per layout, one mesh in the thorax's frame (each body's thorax is the same length; its width sets x)
    F['eyes'] = dict.fromkeys(cfg.get('eyes', {}), True)
    for layout, pts in cfg.get('eyes', {}).items():
        for tag, b in F['bodies'].items():
            mn, sz = np.array(b['thoraxMin']), np.array(b['thorax']); Ps, Ns, Fs, base = [], [], [], 0
            T = F['meshes']['thorax~' + tag]; Q = mn + b64(T['pos'], '<u2').reshape(-1, 3) / 65535 * sz
            for x, z, r in pts:
                for s in ((1, -1) if x else (1,)):
                    cx, cz = mn[0] + sz[0] / 2 + s * x * 0.36 * sz[2], mn[2] + sz[2] * (z + cfg.get('eyeShift', {}).get(tag, 0)); d = np.hypot(Q[:, 0] - cx, Q[:, 2] - cz); near = Q[d < max(0.07 * sz[2], d.min() * 1.5), 1]
                    p, nn, f = bead(cx, near.max() - 0.35 * r * sz[2], cz, r * sz[2])
                    Ps.append(p); Ns.append(nn); Fs.append(f + base); base += len(p)
            P = np.vstack(Ps); at = (P.min(0) + P.max(0)) / 2
            m = pack_mesh(P - at, np.vstack(Ns), np.vstack(Fs)); m['at'] = [float(q) for q in at]; F['meshes']['eyes~%s~%s' % (layout, tag)] = m
    F['picks'] = cfg['picks']
    if cfg.get('merge'):
        F['merge'] = True
    path = os.path.join(KIT, 'models', name + '.json')
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(F, fh, sort_keys=True, separators=(',', ':'))
    print('%s: %d sources, %d picks, %.2f MB' % (name, len(packs), len(cfg['picks']), os.path.getsize(path) / 1e6))


if __name__ == '__main__':
    main()
