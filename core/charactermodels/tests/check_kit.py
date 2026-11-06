#!/usr/bin/env python3
"""The kit's entries against the pieces on disk (build.py runs it before packing a page; REVIEW-GARMENTS-2026-11-06.md,
section 3, the integrity gate). For every body's data/mpfb_<body>/kit.json:

  - every entry's GLB is here, or build-manifest.json carries its hash from a build that had it (a piece this checkout
    does not have: the nonhuman heads, a partial checkout), and its .morph.bin is beside it when the kit has morphs
  - an entry with cloth chains has exactly their bones in the GLB's skin (cloth:<id>:<chain>:<bone>), every chain's
    anchor index is inside the mesh, and the root bone's inverse bind sits on its anchor vertex within TOL

A chain whose indices run past the mesh, or whose bones bind 0.6 m from their anchors, tears the garment on the page
(the Dalab robe, the giant's chief4: the review, section 1). Exit 1 and the list of faults when any entry fails;
tests/kit-known-bad.json names entries allowed to fail for now, each with its reason, so the list only shrinks.

  python3 tests/check_kit.py            # every body
  python3 tests/check_kit.py mpfb_male  # one
"""
import json, os, struct, sys
import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
import glbio

TOL = 0.0015


def read_glb(path):
    d = open(path, 'rb').read()
    ln = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20 + ln])
    off = 20 + ln
    bl = struct.unpack('<I', d[off:off + 4])[0]
    return j, d[off + 8:off + 8 + bl]


def check_body(body, manifest, known):
    kit = json.load(open(os.path.join(HERE, 'data', body, 'kit.json'), encoding='utf-8'))
    faults, n_cloth = [], 0
    for it in kit['items']:
        if 'glb' not in it:
            continue
        glb = os.path.join(HERE, it['glb'])
        if not os.path.exists(glb):
            if it['glb'] not in manifest:
                faults.append((body, it['id'], 'no GLB and no hash of one in build-manifest.json'))
            continue
        if kit.get('morph') and not os.path.exists(glb[:-4] + '.morph.bin'):
            faults.append((body, it['id'], 'no .morph.bin beside the GLB'))
        if 'cloth' not in it:
            continue
        n_cloth += 1
        j, b = read_glb(glb)
        node = next((n for n in j['nodes'] if 'mesh' in n and 'skin' in n), None)
        if node is None:
            faults.append((body, it['id'], 'cloth chains on a GLB with no skin'))
            continue
        skin = j['skins'][node['skin']]
        names = [j['nodes'][k].get('name', '') for k in skin['joints']]
        prim = j['meshes'][node['mesh']]['primitives'][0]
        P = glbio.accessor(j, b, prim['attributes']['POSITION'])
        ibm = glbio.accessor(j, b, skin['inverseBindMatrices']).reshape(-1, 4, 4)
        bones = sum(len(ch['pts']) - 1 for ch in it['cloth']['chains'])
        have = sum(1 for n in names if n.startswith('cloth:%s:' % it['id']))
        if have != bones:
            faults.append((body, it['id'], 'the kit has %d chain bones, the skin %d' % (bones, have)))
            continue
        worst, oob = 0.0, 0
        for g, ch in enumerate(it['cloth']['chains']):
            if max(ch['pts']) >= len(P):
                oob += 1
                continue
            jn = 'cloth:%s:%d:0' % (it['id'], g)
            if jn in names:
                worst = max(worst, float(np.linalg.norm(-ibm[names.index(jn)][3, :3] - P[ch['pts'][0]])))
        if oob:
            faults.append((body, it['id'], '%d chains index past the mesh (%d vertices)' % (oob, len(P))))
        elif worst > TOL:
            faults.append((body, it['id'], 'a chain root binds %.3f m from its anchor' % worst))
    return len(kit['items']), n_cloth, faults


def main(bodies):
    man_path = os.path.join(HERE, 'build-manifest.json')
    manifest = json.load(open(man_path, encoding='utf-8')) if os.path.exists(man_path) else {}
    kb_path = os.path.join(HERE, 'tests', 'kit-known-bad.json')
    known = json.load(open(kb_path, encoding='utf-8')) if os.path.exists(kb_path) else {}
    total = n_cloth = 0
    faults = []
    for body in bodies:
        n, c, f = check_body(body, manifest, known)
        total += n
        n_cloth += c
        faults += f
    new = [f for f in faults if '%s/%s' % (f[0], f[1]) not in known]
    allowed = [f for f in faults if '%s/%s' % (f[0], f[1]) in known]
    fixed = [k for k in known if not any('%s/%s' % (f[0], f[1]) == k for f in faults) and k.split('/')[0] in bodies]
    for f in allowed:
        print('check_kit: allowed  %s/%s: %s (%s)' % (f[0], f[1], f[2], known['%s/%s' % (f[0], f[1])]))
    for f in new:
        print('check_kit: FAIL     %s/%s: %s' % f)
    for k in fixed:
        print('check_kit: %s no longer fails: take it out of tests/kit-known-bad.json' % k)
    print('check_kit: %d entries, %d with chains, %d faults (%d allowed)' % (total, n_cloth, len(faults), len(allowed)))
    return 1 if new or fixed else 0


if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if not x.startswith('-')]
    bodies = a or sorted(b for b in os.listdir(os.path.join(HERE, 'data')) if b.startswith('mpfb_') and os.path.exists(os.path.join(HERE, 'data', b, 'kit.json')))
    sys.exit(main(bodies))
