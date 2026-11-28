#!/usr/bin/env python3
"""Each lab's share of a body's clips, cut from its published anims (data/clips.json 'labs'):

  python3 tools/anims_subset.py            # dist/pieces/<body>/anims.txt -> anims_<lab>.txt for every lab and body

A published lab holds at most 256 MiB, and the clothes fill most of it; the Combat Lab and the Animation Lab (work,
daily life, social) each load only their own clips' tracks (`labs.<lab>.anims`), so neither carries the other's. The
full anims.glb stays what the games, Godot and the settlements load. An anims GLB holds the skeleton's nodes and one
animation per clip, each sampler its own accessor and buffer view: the subset keeps the nodes and the lab's
animations, and repacks their accessors and views in order."""
import base64, gzip, json, os, struct

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BODIES = ('mpfb_male', 'mpfb_female')


def read_txt(path):
    return gzip.decompress(base64.b64decode(open(path, encoding='utf-8').read().split('\n')[0]))


def split_glb(raw):
    n = struct.unpack('<I', raw[12:16])[0]
    J = json.loads(raw[20:20 + n])
    m = struct.unpack('<I', raw[20 + n:24 + n])[0]
    return J, raw[28 + n:28 + n + m]


def pack_glb(J, B):
    js = json.dumps(J, separators=(',', ':')).encode()
    js += b' ' * ((4 - len(js) % 4) % 4)
    B += b'\0' * ((4 - len(B) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(B)
    return (struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(js), 0x4E4F534A) + js +
            struct.pack('<II', len(B), 0x004E4942) + B)


def subset(raw, keep):
    """the GLB with only the animations named in keep, their accessors and views repacked"""
    J, B = split_glb(raw)
    anims = [a for a in J['animations'] if a['name'] in keep]
    acc_map, views, accs, out = {}, [], [], bytearray()
    for a in anims:
        for s in a['samplers']:
            for k in ('input', 'output'):
                i = s[k]
                if i not in acc_map:
                    acc = dict(J['accessors'][i])
                    v = J['bufferViews'][acc['bufferView']]
                    while len(out) % 4:
                        out.append(0)
                    off = len(out)
                    out += B[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']]
                    nv = {'buffer': 0, 'byteOffset': off, 'byteLength': v['byteLength']}
                    if 'byteStride' in v:
                        nv['byteStride'] = v['byteStride']
                    views.append(nv)
                    acc['bufferView'] = len(views) - 1
                    accs.append(acc)
                    acc_map[i] = len(accs) - 1
                s[k] = acc_map[i]
    J2 = {k: v for k, v in J.items() if k not in ('animations', 'accessors', 'bufferViews', 'buffers')}
    J2['animations'], J2['accessors'], J2['bufferViews'] = anims, accs, views
    J2['buffers'] = [{'byteLength': len(out)}]
    return pack_glb(J2, bytes(out))


def main():
    clips = json.load(open(os.path.join(HERE, 'data', 'clips.json'), encoding='utf-8'))
    labs = clips.get('labs') or {}
    for body in BODIES:
        src = os.path.join(HERE, 'dist', 'pieces', body, 'anims.txt')
        if not os.path.exists(src):
            print('no %s: skipped' % src)
            continue
        raw = read_txt(src)
        groups = {c['name']: c.get('group') for c in json.load(open(os.path.join(HERE, 'data', body, 'skeleton.json')))['clips']}
        for lab, spec in labs.items():
            keep = {n for n, g in groups.items() if g in spec['groups']}
            glb = subset(raw, keep)
            dst = os.path.join(HERE, 'dist', 'pieces', body, spec['anims'] + '.txt')
            with open(dst, 'w', encoding='utf-8', newline='\n') as f:
                f.write(base64.b64encode(gzip.compress(glb, 9, mtime=0)).decode())
            print('%s %s: %d of %d clips, %.1f MB' % (body, spec['anims'], len(keep), len(groups), os.path.getsize(dst) / 1e6))


if __name__ == '__main__':
    main()
