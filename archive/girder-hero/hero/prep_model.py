#!/usr/bin/env python3
"""Pack a Meshy character export into one small GLB for the hero build (build_hero.py).

A Meshy export is one GLB per animation (each ~25 MB: the same skinned mesh, the same textures, one clip). This
keeps one mesh and skin, takes the named clips (channels matched to the skeleton by node name), re-encodes every
texture as a JPEG no larger than MAX_PX (the colour map) or AUX_PX (normal, metal/roughness), and drops what the
page does not use: an emissive map (Meshy's warrior set its albedo as a full-strength emissive, so it glowed at
night), the KHR_materials_* extensions.

Usage:  python3 hero/prep_model.py <export.zip or folder> <out.glb> <clip>=<suffix> [<clip>=<suffix> ...]
  <suffix> is the part of the export's file name between "_Animation_" and "_withSkin.glb".
The ones in use (hero/README.md):
  python3 hero/prep_model.py "styv (2).zip" hero/styv.glb idle=Idle_03 walk=Walking run=Running
  python3 hero/prep_model.py phil.zip       hero/phil.glb idle=Idle_02
"""
import io, json, os, struct, sys, zipfile
from PIL import Image

MAX_PX, AUX_PX, JPEG_Q = 2048, 1024, 86


def read_glb(data):
    jl = struct.unpack('<I', data[12:16])[0]
    j = json.loads(data[20:20 + jl])
    o = 20 + jl
    bl = struct.unpack('<I', data[o:o + 4])[0]
    return j, data[o + 8:o + 8 + bl]


def view_bytes(j, b, vi):
    v = j['bufferViews'][vi]
    o = v.get('byteOffset', 0)
    return b[o:o + v['byteLength']]


def sources(path, clips):
    """{clip name: glb bytes} from the export zip or an unzipped folder"""
    if os.path.isdir(path):
        names = [(n, lambda n=n: open(os.path.join(path, n), 'rb').read()) for n in os.listdir(path)]
    else:
        z = zipfile.ZipFile(path)
        names = [(n, lambda n=n: z.read(n)) for n in z.namelist()]
    out = {}
    for n, rd in names:
        for clip, suf in clips:
            if n.endswith('_Animation_%s_withSkin.glb' % suf):
                out[clip] = rd()
    missing = [c for c, _ in clips if c not in out]
    if missing:
        sys.exit('prep_model.py: no GLB for %s in %s' % (', '.join(missing), path))
    return out


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    src_path, out_path = sys.argv[1], sys.argv[2]
    clips = [a.split('=', 1) for a in sys.argv[3:]]
    src = sources(src_path, clips)
    base, bbin = read_glb(src[clips[0][0]])
    names = [n.get('name') for n in base['nodes']]

    blobs, views, accs = [], [], []

    def add_view(data, target=None):
        views.append(dict({'buffer': 0, 'byteLength': len(data)}, **({'target': target} if target else {})))
        blobs.append(bytes(data))
        return len(views) - 1

    def copy_acc(j, b, ai):
        a = dict(j['accessors'][ai])
        v = j['bufferViews'][a['bufferView']]
        if 'byteStride' in v:
            sys.exit('prep_model.py: strided view; not handled')
        a['bufferView'] = add_view(view_bytes(j, b, a['bufferView']), v.get('target'))
        accs.append(a)
        return len(accs) - 1

    meshes = base['meshes']
    for m in meshes:
        for p in m['primitives']:
            p['attributes'] = {k: copy_acc(base, bbin, ai) for k, ai in p['attributes'].items()}
            if 'indices' in p:
                p['indices'] = copy_acc(base, bbin, p['indices'])
            p.pop('targets', None)
    skins = base['skins']
    for s in skins:
        s['inverseBindMatrices'] = copy_acc(base, bbin, s['inverseBindMatrices'])

    # the materials: as exported, less the emissive map and the extensions
    mats = []
    for m in base['materials']:
        m = dict(m)
        for k in ('emissiveTexture', 'emissiveFactor', 'extensions'):
            m.pop(k, None)
        m['doubleSided'] = False
        mats.append(m)
    colour = {m['pbrMetallicRoughness']['baseColorTexture']['index'] for m in mats
              if 'baseColorTexture' in m.get('pbrMetallicRoughness', {})}
    colour_src = {base['textures'][t]['source'] for t in colour}

    # the textures: every image to a JPEG, the colour map at MAX_PX, the rest at AUX_PX
    images = []
    for i, im in enumerate(base['images']):
        img = Image.open(io.BytesIO(view_bytes(base, bbin, im['bufferView']))).convert('RGB')
        px = MAX_PX if i in colour_src else AUX_PX
        if img.size[0] > px:
            img = img.resize((px, px * img.size[1] // img.size[0]), Image.LANCZOS)
        jb = io.BytesIO(); img.save(jb, 'JPEG', quality=JPEG_Q, optimize=True)
        images.append({'bufferView': add_view(jb.getvalue()), 'mimeType': 'image/jpeg', 'name': im.get('name', 'tex%d' % i)})
    used = {m['normalTexture']['index'] for m in mats if 'normalTexture' in m} | colour | \
           {m['pbrMetallicRoughness']['metallicRoughnessTexture']['index'] for m in mats
            if 'metallicRoughnessTexture' in m.get('pbrMetallicRoughness', {})}
    textures = [{'sampler': 0, 'source': t['source']} if k in used else {'sampler': 0, 'source': 0}
                for k, t in enumerate(base['textures'])]

    # the clips, every file's, retargeted to the base's nodes by name
    anims = []
    for clip, _ in clips:
        j, b = read_glb(src[clip])
        a = j['animations'][0]
        samplers = [{'input': copy_acc(j, b, s['input']), 'output': copy_acc(j, b, s['output']),
                     'interpolation': s.get('interpolation', 'LINEAR')} for s in a['samplers']]
        chans = []
        for c in a['channels']:
            nm = j['nodes'][c['target']['node']].get('name')
            if nm not in names:
                sys.exit('prep_model.py: %s animates node %s, which the base has not' % (clip, nm))
            chans.append({'sampler': c['sampler'], 'target': {'node': names.index(nm), 'path': c['target']['path']}})
        anims.append({'name': clip, 'samplers': samplers, 'channels': chans})

    # lay the buffer out, 4-byte aligned
    binb = bytearray()
    for v, blob in zip(views, blobs):
        while len(binb) % 4:
            binb.append(0)
        v['byteOffset'] = len(binb)
        binb += blob
    while len(binb) % 4:
        binb.append(0)

    out = {'asset': {'version': '2.0', 'generator': 'krator hero/prep_model.py'},
           'scene': 0, 'scenes': base['scenes'], 'nodes': base['nodes'], 'meshes': meshes, 'skins': skins,
           'materials': mats, 'textures': textures, 'images': images,
           'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 33071, 'wrapT': 33071}],
           'animations': anims, 'accessors': accs, 'bufferViews': views, 'buffers': [{'byteLength': len(binb)}]}
    js = json.dumps(out, separators=(',', ':')).encode()
    js += b' ' * ((4 - len(js) % 4) % 4)
    glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(binb))
    glb += struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb)
    with open(out_path, 'wb') as fh:
        fh.write(glb)
    print('wrote %s  (%.0f KB; clips %s)' % (out_path, len(glb) / 1024, ', '.join(a['name'] for a in anims)))


if __name__ == '__main__':
    main()
