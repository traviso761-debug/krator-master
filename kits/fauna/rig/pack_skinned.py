#!/usr/bin/env python3
"""Pack a skinned GLB (one mesh on a skeleton, as Tripo's web app rigs a creature) into a kit model: models/<key>.json with M.skin.

    python3 rig/pack_skinned.py rig/sources/skin-bat/skin-tripo.glb models/giant-bat.json --key giant-bat --group flyers --span 9 \
        --srcdir skin-bat --source source-tripo.json --drop fold \
        --name head=tripo::Head_1 --name body=tripo::Spine_1 --name legL=tripo::0_Left_Limb_1 --name legR=tripo::0_Right_Limb_0 \
        --name wingL=tripo::Spine_4 --name wingR=bone_26 --feet tripo::0_Left_Limb_3,tripo::0_Right_Limb_2

models_pack.py packs a tree of rigid parts; this packs one mesh whose every vertex follows up to four bones. The file is the same format (1) with:
  nodes   each {name, parent, t, r, s}: a bone's rest translation, rotation and scale (r and s left out when they are the identity)
  skin    {mesh: the one mesh (quantized as models_pack's, plus j: four node indices and w: four weights out of 255 a vertex),
           parts: which nodes are the kit's head, body, legs, wings, feet: the bones the runtime hands out as userData.parts}
  meshes  {} : there are no rigid parts
The mesh is stored bound: its vertices where the skeleton's rest pose puts them (glTF's joint matrix times inverse bind matrix, which the packer
checks is one matrix for every joint), so a bone's inverse is the inverse of its rest world matrix and the runtime and the gate compute it.

The kit's frame is +z the snout, y up, +x the animal's left: the packer finds the snout (the head bones' vertices against the whole body's middle)
and turns the model about y to face +z, under a new root node 'creature'. Names with characters three.js reads as a path ('::', '.', '/', '[', ']')
are made plain ('tripo::Head_1' becomes 'tripo_Head_1'); --name gives a bone a kit name (legL, wingR, head ...), and a name ending in L must be on +x.
--span sets the scale so the bind pose (a rig is bound with its wings spread) is that many metres across (or --scale, metres per unit). The walk's speed and stride are measured: the
feet's lowest vertices while down, so the planted foot holds still when the root moves at that speed. Tracks that never leave the rest pose are
dropped. Needs numpy and PIL; deterministic.
"""
import argparse, json, math, os, re, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(HERE))
from models_pack import load_glb, b64, jpeg, webp_lossless, source_record

CT = {5121: '<u1', 5123: '<u2', 5125: '<u4', 5126: '<f4'}; NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def acc(J, BIN, i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; n = NC[a['type']]; dt = np.dtype(CT[a['componentType']])
    stride = v.get('byteStride', 0) or dt.itemsize * n; off = v['byteOffset'] + a.get('byteOffset', 0)
    out = np.ndarray((a['count'], n), dt, BIN, off, (stride, dt.itemsize)).copy()
    if a.get('normalized'):
        out = out.astype(np.float64) / np.iinfo(dt).max
    return out


def qmat(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def trs(t, q, s):
    M = np.eye(4); M[:3, :3] = qmat(q) @ np.diag(s); M[:3, 3] = t; return M


def plain(n):
    return re.sub(r'[\[\]./:]+', '_', n)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('glb'); ap.add_argument('out')
    ap.add_argument('--key', required=True); ap.add_argument('--group', required=True)
    ap.add_argument('--scale', type=float, help='metres per model unit'); ap.add_argument('--span', type=float, help='or: the bind pose across (wings spread), metres')
    ap.add_argument('--srcdir', help='rig/sources/<srcdir> holds the source record (default: the key)'); ap.add_argument('--source', default='source.json')
    ap.add_argument('--drop', default='', help='clips not to pack, comma separated (a clip kept to measure)')
    ap.add_argument('--name', action='append', default=[], help='kit=bone: give a bone a kit name (head, body, legL, legR, wingL, wingR)')
    ap.add_argument('--feet', required=True, help='the bones whose subtrees are the feet, comma separated')
    ap.add_argument('--debug-walk', action='store_true', help='print the height and z of each foot over the walk')
    ap.add_argument('--tex', type=int, default=1024); ap.add_argument('--nrmtex', type=int, default=0, help='normal map size (px), when lossless is too large at --tex'); ap.add_argument('--mrtex', type=int, default=512)
    a = ap.parse_args()
    J, BIN = load_glb(a.glb); nodes = J['nodes']; parent = {c: i for i, nd in enumerate(nodes) for c in nd.get('children', [])}
    meshn = [i for i, nd in enumerate(nodes) if 'mesh' in nd]
    if len(meshn) != 1 or 'skin' not in nodes[meshn[0]] or len(J['meshes'][nodes[meshn[0]]['mesh']]['primitives']) != 1:
        sys.exit('pack_skinned: one skinned mesh of one primitive, please (found %d mesh nodes)' % len(meshn))
    mi = meshn[0]; skin = J['skins'][nodes[mi]['skin']]; prim = J['meshes'][nodes[mi]['mesh']]['primitives'][0]; at = prim['attributes']
    if any('matrix' in nd for nd in nodes):
        sys.exit('pack_skinned: a node has a matrix, not TRS')
    T = {i: (np.array(nd.get('translation', [0, 0, 0]), float), np.array(nd.get('rotation', [0, 0, 0, 1]), float), np.array(nd.get('scale', [1, 1, 1]), float)) for i, nd in enumerate(nodes)}

    def worlds(over=None):
        W = {}
        def go(i):
            if i in W:
                return W[i]
            t, q, s = T[i]
            if over:
                t = over.get((i, 'translation'), t); q = over.get((i, 'rotation'), q); s = over.get((i, 'scale'), s)
            L = trs(t, q / np.linalg.norm(q), s); W[i] = L if i not in parent else go(parent[i]) @ L; return W[i]
        for i in range(len(nodes)):
            go(i)
        return W
    W0 = worlds(); joints = skin['joints']
    IBM = acc(J, BIN, skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)
    B = [W0[j] @ IBM[k] for k, j in enumerate(joints)]; M0 = B[0]; err = max(np.abs(b - M0).max() for b in B)
    if err > 1e-4:
        sys.exit('pack_skinned: the rest pose is not the bind pose (joint x inverse bind differs by %.2g)' % err)

    P = acc(J, BIN, at['POSITION']).astype(float); N = acc(J, BIN, at['NORMAL']).astype(float); UV = acc(J, BIN, at['TEXCOORD_0']).astype(float)
    IDX = acc(J, BIN, prim['indices']).reshape(-1); JI = acc(J, BIN, at['JOINTS_0']).astype(int); WT = acc(J, BIN, at['WEIGHTS_0']).astype(float)
    if 'JOINTS_1' in at:
        sys.exit('pack_skinned: more than four weights a vertex')
    P = (np.c_[P, np.ones(len(P))] @ M0.T)[:, :3]; R0 = M0[:3, :3] / np.cbrt(np.linalg.det(M0[:3, :3])); N = N @ R0.T; N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
    WT = WT / np.maximum(WT.sum(1, keepdims=True), 1e-9); JN = np.array(joints)[JI]       # node index of each influence
    dom = JN[np.arange(len(JN)), WT.argmax(1)]

    # which way the snout points: the head bones' vertices against the whole body's middle, in the ground plane (y up)
    named = dict(x.split('=', 1) for x in a.name); byname = {nd.get('name', '#%d' % i): i for i, nd in enumerate(nodes)}
    for k, v in named.items():
        if v not in byname:
            sys.exit('pack_skinned: no bone %s (for %s)' % (v, k))
    def subtree(i):
        out = {i}
        for c in nodes[i].get('children', []):
            out |= subtree(c)
        return out
    head = subtree(byname[named['head']]); hv = np.isin(dom, list(head))
    d = P[hv].mean(0) - P.mean(0); ang = math.radians(90 * round(math.degrees(math.atan2(d[0], d[2])) / 90))      # the snout's heading from +z, about y, to the nearest quarter turn (a rig is cut square to its axes)
    c, s_ = math.cos(-ang), math.sin(-ang); RF = np.array([[c, 0, s_], [0, 1, 0], [-s_, 0, c]]); qF = [0, math.sin(-ang / 2), 0, math.cos(-ang / 2)]
    P = P @ RF.T; N = N @ RF.T

    # the new tree: 'creature' (the turn) over the file's roots; the mesh node goes
    keep = [i for i in range(len(nodes)) if i != mi]; NI = {old: k + 1 for k, old in enumerate(keep)}
    kitname = {v: k for k, v in named.items()}
    names = ['creature'] + [kitname.get(nodes[i].get('name', '#%d' % i), plain(nodes[i].get('name', 'node%d' % i))) for i in keep]
    if len(set(names)) != len(names):
        sys.exit('pack_skinned: two nodes share a name once made plain')
    out_nodes = [{'name': 'creature', 'parent': -1, 't': [0, 0, 0], 'r': [round(x, 7) for x in qF]}]
    for i in keep:
        t, q, s = T[i]; nd = {'name': names[NI[i]], 'parent': NI[parent[i]] if i in parent else 0, 't': [round(float(x), 6) for x in t]}
        if abs(q[3]) < 1 - 1e-9:
            nd['r'] = [round(float(x), 7) for x in q]
        if np.abs(s - 1).max() > 1e-5:
            nd['s'] = [round(float(x), 6) for x in s]
        out_nodes.append(nd)
    # a node's rest, as the file now has it (rounded), and world matrices in the new tree
    def tree_worlds(over=None):
        W = [None] * len(out_nodes)
        def go(k):      # a parent may come after its child in a glTF file: resolve lazily
            if W[k] is not None:
                return W[k]
            nd = out_nodes[k]; t, q, s = nd['t'], nd.get('r', [0, 0, 0, 1]), nd.get('s', [1, 1, 1])
            if over and k in over:
                t, q, s = over[k].get('position', t), over[k].get('quaternion', q), over[k].get('scale', s)
            q = np.array(q, float); L = trs(np.array(t, float), q / np.linalg.norm(q), np.array(s, float)); W[k] = L if nd['parent'] < 0 else go(nd['parent']) @ L; return W[k]
        for k in range(len(out_nodes)):
            go(k)
        return W
    WR = tree_worlds(); INV = [np.linalg.inv(w) for w in WR]
    JK = np.vectorize(lambda o: NI[o])(JN)            # influences as new node indices
    # check: at rest the bound mesh stays put (the turn applied to both the bones and the vertices)
    def skinned(Wp):
        Mx = np.stack([Wp[k] @ INV[k] for k in range(len(out_nodes))]); Ph = np.c_[P, np.ones(len(P))]; out = np.zeros_like(P)
        for c4 in range(4):
            out += WT[:, c4:c4 + 1] * np.einsum('nij,nj->ni', Mx[JK[:, c4]], Ph)[:, :3]
        return out
    assert np.abs(skinned(WR) - P).max() < 1e-6

    # the clips: tracks by new node index; a track that never leaves the rest pose is dropped
    drop = set(x for x in a.drop.split(',') if x); anims = {}; poses = {}
    for an in J.get('animations', []):
        if an['name'] in drop:
            continue
        tracks, over_keys = [], []
        t0 = min(float(acc(J, BIN, an['samplers'][c['sampler']]['input']).min()) for c in an['channels'])
        for ch in an['channels']:
            n = ch['target']['node']
            if n == mi:
                continue
            smp = an['samplers'][ch['sampler']]; t = acc(J, BIN, smp['input']).reshape(-1) - t0; v = acc(J, BIN, smp['output']).astype(float); path = ch['target']['path']
            if smp.get('interpolation', 'LINEAR') != 'LINEAR' and np.abs(v - v[0]).max() > 1e-7:      # Blender writes a channel that holds still as STEP
                sys.exit('pack_skinned: %s interpolation in %s' % (smp.get('interpolation'), an['name']))
            k = NI[n]; nd = out_nodes[k]
            if path == 'rotation':
                rq = np.array(nd.get('r', [0, 0, 0, 1])); v = v * np.sign((v * rq).sum(1, keepdims=True) + 1e-12)      # one hemisphere, nearest the rest
                if np.abs(np.abs(v @ rq) - 1).max() < 1e-7:
                    continue
            elif path == 'translation':
                if np.abs(v - np.array(nd['t'])).max() < 1e-6:
                    continue
            elif path == 'scale':
                if np.abs(v - np.array(nd.get('s', [1, 1, 1]))).max() < 1e-5:
                    continue
            kp = {'rotation': 'quaternion', 'translation': 'position', 'scale': 'scale'}[path]
            tracks.append({'node': names[k], 'path': kp, 't': b64(t.astype('<f4')), 'v': b64(v.astype('<f4'))}); over_keys.append((k, kp, t, v))
        dur = max(float(acc(J, BIN, an['samplers'][c['sampler']]['input']).max()) for c in an['channels']) - t0
        anims[an['name']] = {'dur': round(dur, 6), 'tracks': tracks}; poses[an['name']] = (dur, over_keys)
    def at_time(name, tm):
        dur, ks = poses[name]; ov = {}
        for k, kp, t, v in ks:
            i = int(np.searchsorted(t, tm, 'right')) - 1; i = max(0, min(i, len(t) - 1)); j = min(i + 1, len(t) - 1); f = 0 if j == i else (tm - t[i]) / max(t[j] - t[i], 1e-9)
            x = v[i] * (1 - f) + v[j] * f
            if kp == 'quaternion':
                x = x / np.linalg.norm(x)
            ov.setdefault(k, {})[kp] = x
        return skinned(tree_worlds(ov))

    # the feet, the rest pose, the box any pose fills
    feet_b = set()
    for f in a.feet.split(','):
        feet_b |= subtree(byname[f])
    feet = np.isin(dom, list(feet_b))
    if 'perch' not in poses or 'walk' not in poses:
        sys.exit('pack_skinned: the kit needs perch and walk clips')
    rest = at_time('perch', 0.0); lo, hi = rest.min(0), rest.max(0); ground = float(rest[feet, 1].min())
    alo, ahi = lo.copy(), hi.copy()
    for name, (dur, _) in poses.items():
        for tm in np.linspace(0, dur, 9):
            q = at_time(name, tm); alo = np.minimum(alo, q.min(0)); ahi = np.maximum(ahi, q.max(0))
    S = a.scale or a.span / float(P[:, 0].max() - P[:, 0].min())      # the span is the bind pose's, wings flat out (a flapping wing's tips rise, and narrow the widest pose)
    info = {'ground': round(ground, 6), 'center': [round(float(lo[0] + hi[0]) / 2, 6), round(float(lo[2] + hi[2]) / 2, 6)],
            'w': round(float(hi[0] - lo[0]) * S, 3), 'd': round(float(hi[2] - lo[2]) * S, 3), 'h': round(float(hi[1] - ground) * S, 3),
            'extent': {'w': round(float(ahi[0] - alo[0]) * S, 3), 'd': round(float(ahi[2] - alo[2]) * S, 3), 'h': round(float(ahi[1] - min(alo[1], ground)) * S, 3)}}

    # the walk: while a foot is down (within 0.004 of its lowest), its lowest vertex should move back at one speed
    wdur = poses['walk'][0]; ts = np.linspace(0, wdur, 49)[:-1]; Q = [at_time('walk', tm) for tm in ts]; vel, down = [], 0
    for side in ('L', 'R'):
        leg = byname[named['leg' + side]]; mask = feet & np.isin(dom, list(subtree(leg)))
        ys = np.array([q[mask, 1].min() for q in Q]); kst = int(ys.argmin()); tip = np.flatnonzero(mask)[int(Q[kst][mask, 1].argmin())]
        dn = ys <= ys.min() + 0.004; down += dn.sum()
        if a.debug_walk:
            print(side, 'foot height by 48ths of the walk:', ' '.join('%.3f' % y for y in ys)); print('  tip z:', ' '.join('%.3f' % q[tip, 2] for q in Q))
        for k in range(len(ts)):
            k2 = (k + 1) % len(ts)
            if dn[k] and dn[k2]:
                vel.append((Q[k2][tip, 2] - Q[k][tip, 2]) / (wdur / len(ts)))
    speed = -float(np.median(vel)) if vel else 0.0
    anims['walk']['extras'] = {'speed': round(speed, 6), 'stride': round(speed * wdur, 6), 'duty': round(down / (2 * len(ts)), 3), 'ground': round(ground, 6),
                               'note': 'walk in place; drive the root forward at "speed" units per second so planted feet do not slide (measured by rig/pack_skinned.py)'}

    # the mesh, quantized as models_pack.py's, with four influences a vertex
    lo3, hi3 = P.min(0), P.max(0); sc = np.maximum(hi3 - lo3, 1e-9)
    if len(out_nodes) > 255:
        sys.exit('pack_skinned: more than 255 nodes')
    wq = np.floor(WT * 255).astype(int); r = 255 - wq.sum(1); wq[np.arange(len(wq)), WT.argmax(1)] += r
    mesh = {'n': int(len(P)), 'min': [round(float(x), 6) for x in lo3], 'size': [round(float(x), 6) for x in sc],
            'pos': b64(np.round((P - lo3) / sc * 65535).astype('<u2')), 'nrm': b64(np.round(np.clip(N, -1, 1) * 127).astype('i1')),
            'uv': b64(np.round(np.clip(UV, 0, 1) * 65535).astype('<u2')), 'idx': b64(IDX.astype('<u2') if len(P) < 65536 else IDX.astype('<u4')), 'wide': bool(len(P) >= 65536),
            'j': b64(JK.astype('u1')), 'w': b64(wq.astype('u1'))}
    parts = {k: k for k in named}
    parts['legs'] = [k for k in ('legL', 'legR') if k in named]; parts['feet'] = [names[NI[byname[f]]] for f in a.feet.split(',')]
    for k in [k for k in named if k.startswith('leg')]:
        parts.pop(k)
    # +x is the animal's left
    for k in named:
        m = re.match(r'^(.*)L$', k)
        if m and m.group(1) + 'R' in named and not WR[names.index(k)][0, 3] > WR[names.index(m.group(1) + 'R')][0, 3]:
            sys.exit('pack_skinned: %s is not on +x of %sR (the animal\'s left is +x): swap the --name pair' % (k, m.group(1)))

    mat = J['materials'][prim.get('material', 0)]; pbr = mat['pbrMetallicRoughness']
    def data(texinfo):
        im = J['images'][J['textures'][texinfo['index']]['source']]; v = J['bufferViews'][im['bufferView']]; return BIN[v['byteOffset']:v['byteOffset'] + v['byteLength']]
    tex = {'map': jpeg(data(pbr['baseColorTexture']), a.tex, 84), 'nrm': webp_lossless(data(mat['normalTexture']), a.nrmtex or a.tex), 'mr': jpeg(data(pbr['metallicRoughnessTexture']), a.mrtex, 84)}
    doc = {'format': 1, 'key': a.key, 'group': a.group, 'scale': round(S, 6), 'tris': int(len(IDX) // 3), 'rest': info, 'nodes': out_nodes, 'meshes': {}, 'anims': anims, 'tex': tex,
           'skin': {'mesh': mesh, 'parts': parts}, 'renamed': {}, 'source': source_record(a.srcdir or a.key, a.source)}
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(doc, fh, sort_keys=True, separators=(',', ':'))
    print('%s: %d tris, %d bones, clips %s (%d tracks), scale %.3f, rest %sx%sx%s m, any pose %sx%sx%s m, snout turned %.0f deg, walk %.4f u/s duty %.2f, %.2f MB' % (
        a.key, doc['tris'], len(out_nodes), sorted(anims), sum(len(x['tracks']) for x in anims.values()), S, info['w'], info['d'], info['h'], info['extent']['w'], info['extent']['d'],
        info['extent']['h'], math.degrees(ang), speed, anims['walk']['extras']['duty'], os.path.getsize(a.out) / 1e6))


if __name__ == '__main__':
    main()
