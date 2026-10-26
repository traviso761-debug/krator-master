"""Non-human parts on the bodies as they stand (a spike for the Lizardmen, LORE 6.20): no Blender, no export.

  python3 tools/nonhuman.py [male female giant]

For each body, from its pieces (pieces/mpfb_<body>/base.glb and base.morph.bin: the published lab's, rebuilt from its
pieces/<body>/<name>.txt) and its data (data/mpfb_<body>/kit.json, skeleton.json):
  - the tail's joints (tools/tail.py) appended to skeleton.json after every other joint (no index moves), with their
    morph deltas in kit.json morph_joints (the skin over the sacrum's, scaled about the root with the legs)
  - mod_tail and mod_head_lizard (tools/mods.py tail_piece, lizard_head) beside the other pieces: GLB, KMR1 morph
    deltas (each vertex's from its recipe: mods.Recipe) and the Godot twin's GSH1 shapes
  - their kit items (slot mods; the head's hide and hide_parts; the motion each takes in the figure) and tint roles
Run again, it replaces what it wrote. A whole rebuild (make_mpfb.py) does the same from Blender's export (main: the
tail joints, mods.make_all: the pieces, NpzAlias extra: their deltas)."""
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
import glbio  # noqa: E402
import mods  # noqa: E402
import tail as TL  # noqa: E402

from make_mpfb import unpack_morphs as read_kmr1, dense_morphs as dense  # noqa: E402


def fk(J):
    """skeleton.json joints -> world matrices at rest (4 x 4 each)"""
    W = []
    for j in J:
        x, y, z, w = j['r']
        R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                      [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                      [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
        L = np.eye(4)
        L[:3, :3], L[:3, 3] = R, j['t']
        W.append(L if j['parent'] < 0 else W[j['parent']] @ L)
    return W


def joint_delta_fn(kit, J):
    """name -> targets x 3: a joint's morph delta (kit morph_joints; a joint that follows its parent rides it)"""
    T = len(kit['morph']['targets'])
    D = np.zeros((T, len(J), 3))
    for t, rows in kit['morph']['morph_joints'].items():
        for r in rows:
            D[int(t), r[0]] = r[1:4]
    for i in kit['morph']['follow']:
        if J[i]['parent'] >= 0:
            D[:, i] = D[:, J[i]['parent']]
    byn = {j['name']: i for i, j in enumerate(J)}
    return lambda n: D[:, byn[n]], D


def strip(kit, skel):
    """what an earlier run added: the tail joints, their morph rows, the two items and their roles"""
    J = skel['joints']
    keep = [i for i, j in enumerate(J) if not j['name'].startswith('Tail')]
    assert keep == list(range(len(keep))), 'the tail joints are not last'
    gone = set(range(len(keep), len(J)))
    skel['joints'] = J[:len(keep)]
    mj = kit['morph']['morph_joints']
    for t in list(mj):
        mj[t] = [r for r in mj[t] if r[0] not in gone]
        if not mj[t]:
            del mj[t]
    kit['items'] = [it for it in kit['items'] if it['id'] not in ('mod_tail', 'mod_head_lizard')]
    for m in list(kit['tint']['roles']):
        if m.startswith('Mod.tail') or m.startswith('Mod.head_lizard'):
            del kit['tint']['roles'][m]


def write_deltas(path, key, rec, d_base, d_joint, s):
    """the piece's KMR1 (beside it: .morph.bin) and its Godot shapes (.gshapes.bin) from its recipe"""
    import make_mpfb as mm
    D = rec.deltas(d_base, d_joint, s)
    npz = {'d_' + key: D}
    ents = mm.mesh_entries(path, lambda n: key)
    open(path[:-4] + '.morph.bin', 'wb').write(mm.pack_morphs(ents, npz))
    open(path[:-4] + '.gshapes.bin', 'wb').write(mm.godot_shapes(path, lambda n: key, npz))
    return float(np.abs(D).max())


def run(body):
    name = 'mpfb_' + body
    pieces, data = os.path.join(HERE, 'pieces', name), os.path.join(HERE, 'data', name)
    kp, sp = os.path.join(data, 'kit.json'), os.path.join(data, 'skeleton.json')
    kit = json.load(open(kp, encoding='utf-8'))
    skel = json.load(open(sp, encoding='utf-8'))
    strip(kit, skel)
    J = skel['joints']
    byn = {j['name']: i for i, j in enumerate(J)}
    W = fk(J)
    b = mods.Body(os.path.join(pieces, 'base.glb'))
    assert np.abs(b.bind[b.jidx['Hips']] - W[byn['Hips']]).max() < 1e-4, 'the base and skeleton.json disagree'
    entries, roles, recipes, tl = mods.nonhuman(b, pieces, name)
    hips = W[byn['Hips']]
    J += TL.skeleton_joints(len(J), byn['Hips'], tl['root'], hips[1, 3], hips)
    W = fk(J)
    for n in TL.names() + ['face_jaw']:          # the pieces' binds are the skeleton's
        assert np.abs(b.bind[b.jidx[n]] - W[[j['name'] for j in J].index(n)]).max() < 1e-4, n
    # the deltas: the base skin's (by Blender index) and the joints'
    T = len(kit['morph']['targets'])
    ents = read_kmr1(open(os.path.join(pieces, 'base.morph.bin'), 'rb').read())
    d_base = dense(next(e for e in ents if 'Human.body' in e[0]), T)
    d_joint, _ = joint_delta_fn(kit, J)
    mods.tail_rows(kit['morph'], [j['name'] for j in J], hips[1, 3], tl['root'], tl['b_root'], d_base, d_joint)
    s = d_joint('Hips')[:, 1] / hips[1, 3]
    big = [write_deltas(os.path.join(pieces, mid + '.glb'), mid, rec, d_base, d_joint, s) for mid, rec in recipes.items()]
    kit['items'] += entries
    kit['tint']['roles'].update(roles)
    with open(kp, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(kit, f, indent=1)
    with open(sp, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(skel, f, indent=1)
    print('%-12s tail root %s, joints %d..%d; head hides %d triangles; deltas at most %s m'
          % (name, np.round(tl['root'], 3).tolist(), len(J) - TL.N, len(J) - 1, entries[1]['hides'], ' / '.join('%.3f' % x for x in big)))


if __name__ == '__main__':
    for bd in (sys.argv[1:] or ['male', 'female', 'giant']):
        run(bd)
