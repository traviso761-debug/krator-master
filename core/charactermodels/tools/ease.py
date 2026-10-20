# Ease across items worn together (HANDOFF-CLOTHING.md 1.3): for every outfit in data/peoples.json, where an under-item
# stands outside the item over it (legs under torso under head, as the figure ranks them: tools/layers.py), at rest on the base body.
#   python3 tools/ease.py <export dir> male|female [--all] [--where] [--objs <MPFB clothes dir>]
# The export dir is mpfb_build.py's (base.glb, <item>.glb, morphs.npz). Each garment vertex is measured as its height
# above the skin along the skin's normal at its nearest body vertex; an under-item's vertex fails where it is higher than
# the lowest over-item vertex over the same spot (2 cm round it). Hems hanging clear of the body (over 25 cm) are not
# counted. The fit across slider ends needs no such table: MPFB's refit keeps them within a few vertices of the rest
# (README, "Clothing fit.").
import json, os, sys
import numpy as np
from scipy.spatial import cKDTree
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
import glbio
import layers

RANK = layers.RANK
CLEAR = 0.25            # a vertex this far off the skin hangs clear of it
REACH = 0.02            # the over-item covers a spot when one of its vertices lies over a body point this near


def mesh(path, want=None):
    """positions, Blender indices (_VIDX) and triangles (in Blender indices) of a GLB's meshes, or its node want's"""
    j, b = glbio.read_glb(open(path, 'rb').read())
    P, V, F = [], [], []
    for nd in j['nodes']:
        if 'mesh' not in nd or (want and nd.get('name') != want):
            continue
        for p in j['meshes'][nd['mesh']]['primitives']:
            if '_VIDX' not in p['attributes']:
                continue
            pos = glbio.accessor(j, b, p['attributes']['POSITION']).reshape(-1, 3)
            vid = np.rint(glbio.accessor(j, b, p['attributes']['_VIDX']).reshape(-1)).astype(int)
            idx = glbio.accessor(j, b, p['indices']).reshape(-1, 3) if 'indices' in p else np.arange(len(pos)).reshape(-1, 3)
            P.append(pos); V.append(vid); F.append(vid[idx])
    return np.concatenate(P), np.concatenate(V), np.concatenate(F)


def vertex_normals(X, F, n):
    N = np.zeros((n, 3))
    fn = np.cross(X[F[:, 1]] - X[F[:, 0]], X[F[:, 2]] - X[F[:, 0]])
    for k in range(3):
        np.add.at(N, F[:, k], fn)
    return N / np.maximum(1e-12, np.linalg.norm(N, axis=1, keepdims=True))


def obj_positions(path):
    return np.array([[float(x) for x in ln.split()[1:4]] for ln in open(path, encoding='utf-8') if ln.startswith('v ')])


def table(src, sex, objs=None):
    """[(people, tier, under, over, failing vertices, counted vertices, worst excess m, their heights)] for one export;
    objs: MPFB's clothes folder, to read a garment from make_garments.py's own .obj where it has one (the same
    coordinates as the export's to 0.2 mm: a garment change is checked in minutes, before the pipeline)"""
    BP, BV, BF = mesh(os.path.join(src, 'base.glb'), 'Human')
    nb = int(max(BV.max(), BF.max())) + 1
    B = np.zeros((nb, 3)); B[BV] = BP
    used = np.unique(BF)
    N = vertex_normals(B, BF, nb)
    tree = cKDTree(B[used])
    cache = {}

    def item(iid):
        if iid not in cache:
            p = os.path.join(src, iid + '.glb')
            o = os.path.join(objs, iid, iid + '.obj') if objs else None
            if not os.path.exists(p) and not (o and os.path.exists(o)):
                cache[iid] = None
            else:
                G = obj_positions(o) if o and os.path.exists(o) else mesh(p)[0]
                n = used[tree.query(G)[1]]
                # each vertex's layer (make_garments.py's <gid>.layers.npz beside the .obj: 3 x the slot's rank plus
                # the part's layer), so a pair is judged part by part
                L = None
                lz = os.path.join(objs, iid, iid + '.layers.npz') if objs else None
                if o and os.path.exists(o) and lz and os.path.exists(lz):
                    L = np.load(lz)['L']
                    L = L if len(L) == len(G) else None
                cache[iid] = (B[n], ((G - B[n]) * N[n]).sum(1), cKDTree(B[n]), L)
        return cache[iid]
    rows, seen = [], set()
    for pe in json.load(open(os.path.join(HERE, 'data', 'peoples.json'), encoding='utf-8'))['peoples']:
        for tier, o in (pe.get('outfits') or {}).get(sex, {}).items():
            slots = sorted([s for s in o if s in RANK and o[s]], key=lambda s: layers.rank(o[s], s))
            pairs = []
            for a in range(len(slots)):
                for b in range(a + 1, len(slots)):
                    u, v = o[slots[a]], o[slots[b]]
                    pairs.append((u, v))
                    if layers.rank(u, slots[a]) == layers.rank(v, slots[b]):
                        pairs.append((v, u))       # one rank: the parts' layers say which lies over which
            for u, v in pairs:
                U, O = item(u), item(v)
                if (u, v) in seen or not U or not O:
                    continue
                seen.add((u, v))
                by_part = U[3] is not None and O[3] is not None
                if (u, v) in [(x, y) for x, y in pairs if (y, x) in pairs] and not by_part:
                    continue                   # one rank and no layers to judge by
                on = np.nonzero(U[1] < CLEAR)[0]
                bad, worst, ys = 0, 0.0, []
                for k, near in zip(on, O[2].query_ball_point(U[0][on], REACH)):
                    if by_part:
                        near = [q for q in near if O[3][q] > U[3][k]]
                    if near:
                        ex = U[1][k] - O[1][near].min()
                        if ex > 0:
                            bad += 1
                            worst = max(worst, float(ex))
                            ys.append(float(U[0][k][1]))
                rows.append((pe['id'], tier, u, v, bad, len(on), worst, ys))
    return rows


if __name__ == '__main__':
    objs = sys.argv[sys.argv.index('--objs') + 1] if '--objs' in sys.argv else None
    rows = table(sys.argv[1], sys.argv[2], objs)
    for r in sorted(rows, key=lambda r: -r[4]):
        if r[4] or '--all' in sys.argv:
            print('%-14s %-12s %-30s under %-30s %5d of %5d outside, worst %.1f cm' % (r[0], r[1], r[2], r[3], r[4], r[5], r[6] * 100))
            if r[4] and '--where' in sys.argv:          # at which heights on the body (10 cm bands, from the floor)
                h = np.bincount((np.array(r[7]) / 0.1).astype(int))
                print('    ' + '  '.join('%d-%d cm: %d' % (10 * i, 10 * i + 10, n) for i, n in enumerate(h) if n))
    print('ease: %d pairs, %d with the under-item outside' % (len(rows), sum(1 for r in rows if r[4])))
