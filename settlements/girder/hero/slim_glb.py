#!/usr/bin/env python3
"""Slim a hero GLB (prep_model.py output) for a host with a per-file size limit (build_hero.py --slim).

Roughly a third of the bytes, at a cost seen only up close:
  - the normal map dropped (the fine surface relief goes; the shading follows the mesh's own normals);
  - the colour map to COLOUR_PX, the metal/roughness map to AUX_PX, JPEG at JPEG_Q;
  - TANGENT dropped (three.js derives tangent space for the normal map from screen-space derivatives);
  - NORMAL as normalized int8, TEXCOORD_0 as normalized uint16 (when the UVs are inside 0..1), WEIGHTS_0 as
    normalized uint8 (KHR_mesh_quantization, which three r128's GLTFLoader reads).
Usage as a module: slim(glb_bytes) -> glb_bytes.   As a script: python3 hero/slim_glb.py in.glb out.glb
"""
import io, json, struct, sys
import numpy as np
from PIL import Image

COLOUR_PX, AUX_PX, JPEG_Q = 1024, 512, 76
F32, I8, U8, U16 = 5126, 5120, 5121, 5123
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
DT = {F32: '<f4', I8: 'i1', U8: 'u1', U16: '<u2', 5125: '<u4', 5122: '<i2'}


def read_glb(data):
    jl = struct.unpack('<I', data[12:16])[0]
    j = json.loads(data[20:20 + jl])
    o = 20 + jl
    bl = struct.unpack('<I', data[o:o + 4])[0]
    return j, data[o + 8:o + 8 + bl]


def slim(data):
    j, b = read_glb(data)
    views = j['bufferViews']

    def acc_array(ai):
        a = j['accessors'][ai]
        v = views[a['bufferView']]
        o = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        n = a['count'] * NCOMP[a['type']]
        return np.frombuffer(b, dtype=DT[a['componentType']], count=n, offset=o).reshape(a['count'], -1)

    blobs = {}                                   # bufferView index -> new bytes
    drop = set()

    def put(ai, arr, ctype, normalized=True, pad_to=None):
        a = j['accessors'][ai]
        arr = np.ascontiguousarray(arr)
        if pad_to:                               # vertex attributes: each element 4-byte aligned
            arr = np.concatenate([arr, np.zeros((arr.shape[0], pad_to - arr.shape[1]), arr.dtype)], 1)
            views[a['bufferView']]['byteStride'] = arr.shape[1] * arr.itemsize
        blobs[a['bufferView']] = arr.tobytes()
        a['componentType'] = ctype
        a['normalized'] = normalized
        a.pop('byteOffset', None)
        a.pop('min', None); a.pop('max', None)

    for m in j['meshes']:
        for p in m['primitives']:
            at = p['attributes']
            if 'TANGENT' in at:
                drop.add(j['accessors'][at.pop('TANGENT')]['bufferView'])
            if 'NORMAL' in at:
                n = acc_array(at['NORMAL']).astype(np.float32)
                put(at['NORMAL'], np.clip(np.round(n * 127), -127, 127).astype(np.int8), I8, pad_to=4)
            if 'TEXCOORD_0' in at:
                uv = acc_array(at['TEXCOORD_0']).astype(np.float32)
                if uv.min() >= 0 and uv.max() <= 1:
                    put(at['TEXCOORD_0'], np.round(uv * 65535).astype(np.uint16), U16)
            if 'WEIGHTS_0' in at and j['accessors'][at['WEIGHTS_0']]['componentType'] == F32:
                w = acc_array(at['WEIGHTS_0']).astype(np.float64)
                q = np.floor(w * 255).astype(np.int32)
                rest = 255 - q.sum(1)                # hand the rounding loss to each vertex's heaviest joint
                q[np.arange(len(q)), w.argmax(1)] += rest
                put(at['WEIGHTS_0'], np.clip(q, 0, 255).astype(np.uint8), U8)

    for m in j['materials']:
        nt = m.pop('normalTexture', None)
        if nt is not None:
            src = j['textures'][nt['index']]['source']
            if not any(src == j['textures'][t['index']]['source'] for mm in j['materials']
                       for t in [mm.get('pbrMetallicRoughness', {}).get(k) for k in ('baseColorTexture', 'metallicRoughnessTexture')] if t):
                drop.add(j['images'][src]['bufferView'])
                j['images'][src]['dropped'] = True
    colour = {j['textures'][m['pbrMetallicRoughness']['baseColorTexture']['index']]['source']
              for m in j['materials'] if 'baseColorTexture' in m.get('pbrMetallicRoughness', {})}
    for i, im in enumerate(j['images']):
        if im.pop('dropped', False):
            continue                             # its view is emptied below; the texture entry stays, unused
        v = views[im['bufferView']]
        img = Image.open(io.BytesIO(b[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']])).convert('RGB')
        px = COLOUR_PX if i in colour else AUX_PX
        if img.size[0] > px:
            img = img.resize((px, px * img.size[1] // img.size[0]), Image.LANCZOS)
        jb = io.BytesIO(); img.save(jb, 'JPEG', quality=JPEG_Q, optimize=True)
        blobs[im['bufferView']] = jb.getvalue()
        im['mimeType'] = 'image/jpeg'

    # lay the buffer out again (dropped views kept as empty placeholders so indices stay put)
    out = bytearray()
    for k, v in enumerate(views):
        while len(out) % 4:
            out.append(0)
        if k in drop:
            data_k = b''
        elif k in blobs:
            data_k = blobs[k]
        else:
            data_k = b[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']]
        v['byteOffset'] = len(out); v['byteLength'] = max(len(data_k), 4)
        out += data_k if data_k else b'\0\0\0\0'
    while len(out) % 4:
        out.append(0)
    j['buffers'] = [{'byteLength': len(out)}]
    used = set(j.get('extensionsUsed', [])) | {'KHR_mesh_quantization'}
    j['extensionsUsed'] = sorted(used)
    j['extensionsRequired'] = sorted(set(j.get('extensionsRequired', [])) | {'KHR_mesh_quantization'})
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((4 - len(js) % 4) % 4)
    glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(out))
    return glb + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(out), 0x004E4942) + bytes(out)


if __name__ == '__main__':
    src = open(sys.argv[1], 'rb').read()
    res = slim(src)
    open(sys.argv[2], 'wb').write(res)
    print('%s: %.0f KB -> %.0f KB' % (sys.argv[1], len(src) / 1024, len(res) / 1024))
