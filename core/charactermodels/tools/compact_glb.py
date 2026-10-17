#!/usr/bin/env python3
"""Shrink a donor GLB in place for the repo: every texture re-encoded as a JPEG no larger than 2048 px (the colour map,
the material's baseColorTexture) or 1024 px (the rest). Geometry, skin and nodes are untouched; the buffer is rebuilt.

  python3 tools/compact_glb.py donors/<id>.glb [...]
meshy.py runs it on every download. make_pieces.py cuts the pieces' maps down further (1024 / 512 px).
"""
import io, json, struct, sys
from PIL import Image

sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import glbio


def compact(path, color_px=2048, aux_px=1024, q=88):
    j, b = glbio.read_glb(open(path, 'rb').read())
    color = set()
    for m in j.get('materials', []):
        t = m.get('pbrMetallicRoughness', {}).get('baseColorTexture')
        if t:
            color.add(j['textures'][t['index']]['source'])
    redo = {}
    for i, im in enumerate(j.get('images', [])):
        v = j['bufferViews'][im['bufferView']]
        o = v.get('byteOffset', 0)
        img = Image.open(io.BytesIO(b[o:o + v['byteLength']])).convert('RGB')
        px = color_px if i in color else aux_px
        if max(img.size) > px:
            img = img.resize((px, px), Image.LANCZOS)
        out = io.BytesIO()
        img.save(out, 'JPEG', quality=q)
        redo[im['bufferView']] = out.getvalue()
        im['mimeType'] = 'image/jpeg'
    blobs, off = [], 0
    for k, v in enumerate(j['bufferViews']):
        o = v.get('byteOffset', 0)
        data = redo.get(k, b[o:o + v['byteLength']])
        pad = (-off) % 4
        blobs.append(b'\0' * pad)
        off += pad
        v['byteOffset'], v['byteLength'] = off, len(data)
        blobs.append(data)
        off += len(data)
    binb = b''.join(blobs) + b'\0' * ((-off) % 4)
    j['buffers'] = [{'byteLength': len(binb)}]
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + binb)


if __name__ == '__main__':
    for p in sys.argv[1:]:
        compact(p)
        print(p, '%.1f MB' % (__import__('os').path.getsize(p) / 1e6))
