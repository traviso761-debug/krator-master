#!/usr/bin/env python3
"""MakeHuman (MPFB2) bodies for the editor: the base and its library items, made in Blender, packed for the page.

  blender -b --python tools/mpfb_build.py -- <male|female> <export dir>    # the Blender half (needs MPFB2 + asset packs)
  python3 tools/make_mpfb.py <male|female> <export dir>                      # this half

The Blender half builds an MPFB human on the Mixamo rig with a skin, loads library clothes, hair, brows and lashes
(MPFB fits them to the body and interpolates their weights from it), and exports the base and each item as its own
GLB on that rig, with each item's delete group (the base vertices it covers) as positions.

This half, per GLB: applies RY (identity: MPFB already faces +Z; positions, normals, tangents and inverse binds would
be rewritten, since the page builds its bones from skeleton.json), shrinks its textures (JPEG,
or PNG where there is alpha: hair, lashes), and writes pieces/mpfb_<body>/<id>.glb. The base's rig becomes the body's
canonical skeleton (data/mpfb_<body>/skeleton.json) and every clip is retargeted onto it (make_pieces.write_anims).
Each delete group becomes a bitset over the triangles of the base's skin primitive (material 'Human.body'):
data/mpfb_<body>/kit.json, read by KCHAR (kit.style 'mpfb').
"""
import base64, io, json, os, struct, subprocess, sys
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import glbio
import make_pieces as mp

HERE = mp.HERE
# MPFB's glTF export already faces +Z with its left side on +X (the convention every piece here uses); kept as a hook
# in case a future export needs turning
RY = np.eye(3)


# the tint the page multiplies in (skin tone, hair colour) needs a neutral texture: skin keeps its detail but its mean
# becomes grey TINT_MEAN['skin'] (sRGB); hair, brows and beards turn grey with their median at TINT_MEAN['hair']
TINT_MEAN = {'skin': 0.80, 'hair': 0.72, 'eye': 0.5}
EYES = 'low-poly'               # the eye mesh's material (MakeHuman's low-poly eyes)
SKIN_PARTS = ('body', 'nipple', 'lips', 'fingernails', 'toenails', 'ears')     # the base's MakeSkin slots on one texture


def srgb_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def iris_mask(rgb):
    """0..1 per pixel: the irises of a MakeHuman eye texture (two discs, one per eye in its UV layout). Each pupil is a
    dark blob; its iris runs out to where the ring around it turns pale (the sclera)"""
    from scipy import ndimage
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    dark = lum < 0.06
    lab, n = ndimage.label(dark)
    sizes = ndimage.sum(dark, lab, range(1, n + 1))
    H, W = lum.shape
    yy, xx = np.mgrid[:H, :W]
    mask = np.zeros((H, W), np.float32)
    step = max(1, H // 256)
    for k in np.argsort(sizes)[::-1][:2] + 1:
        cy, cx = ndimage.center_of_mass(dark, lab, k)
        r = np.hypot(yy - cy, xx - cx)
        edge = next((q for q in range(int(np.sqrt(sizes[k - 1] / np.pi)), H // 2, step)
                     if lum[(r >= q) & (r < q + step)].mean() > 0.3), H // 8)
        mask = np.maximum(mask, np.clip((edge - r) / (0.08 * edge), 0, 1))
    return mask


def neutral(img, role):
    a = np.asarray(img).astype(np.float32) / 255
    if role == 'eye':
        # the iris turns grey (median TINT_MEAN['eye']) and its mask goes in alpha: the page tints by it, the rest stays
        rgb = a[..., :3]
        m = iris_mask(rgb)
        lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        grey = np.clip(lum / max(np.median(lum[m > 0.5]), 0.02) * TINT_MEAN['eye'], 0, 1)
        out = np.concatenate([rgb * (1 - m[..., None]) + grey[..., None] * m[..., None], m[..., None]], 2)
        return Image.fromarray(np.rint(out * 255).astype(np.uint8), 'RGBA')
    rgb = a[..., :3]
    seen = (a[..., 3] > 0.5) if a.shape[2] == 4 else (rgb.max(2) > 0.04)
    if role == 'skin':
        mean = rgb[seen].mean(0)
        rgb = np.clip(rgb / mean * TINT_MEAN['skin'], 0, 1)
    else:
        lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        lum = np.clip(lum / max(np.median(lum[seen]), 0.02) * TINT_MEAN['hair'], 0, 1)
        rgb = np.repeat(lum[..., None], 3, 2)
    a[..., :3] = rgb
    return Image.fromarray(np.rint(a * 255).astype(np.uint8), img.mode)


def turn_glb(src, out, max_px=1024, role=lambda mat: None):
    """role(material name) -> 'skin', 'hair' or None: that material's colour texture is made neutral (neutral()).
    Returns {material name: role} for the materials that got one"""
    j, b = glbio.read_glb(open(src, 'rb').read())
    b = bytearray(b)
    roles, img_role = {}, {}
    for m in j.get('materials', []):
        r = role(m.get('name', ''))
        t = m.get('pbrMetallicRoughness', {}).get('baseColorTexture')
        if r:
            roles[m['name']] = r
            m.setdefault('pbrMetallicRoughness', {})['baseColorFactor'] = [1, 1, 1, 1]
            if t is not None:
                img_role[j['textures'][t['index']]['source']] = r

    def view(ai):
        a = j['accessors'][ai]
        v = j['bufferViews'][a['bufferView']]
        off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        if v.get('byteStride') not in (None, 12, 16, 64) and a['type'] in ('VEC3', 'VEC4', 'MAT4'):
            raise SystemExit('make_mpfb.py: strided %s in %s' % (a['type'], src))
        n = {'VEC3': 3, 'VEC4': 4, 'MAT4': 16}[a['type']]
        return a, np.frombuffer(b, np.float32, a['count'] * n, off).reshape(a['count'], n).copy(), off
    done = set()
    for m in j.get('meshes', []):
        for p in m['primitives']:
            for att in ('POSITION', 'NORMAL', 'TANGENT'):
                ai = p['attributes'].get(att)
                if ai is None or ai in done:
                    continue
                done.add(ai)
                a, arr, off = view(ai)
                arr[:, :3] = arr[:, :3] @ RY.T
                b[off:off + arr.nbytes] = arr.astype(np.float32).tobytes()
                if att == 'POSITION':
                    a['min'] = [float(x) for x in arr.min(0)]
                    a['max'] = [float(x) for x in arr.max(0)]
    for s in j.get('skins', []):
        ai = s['inverseBindMatrices']
        if ai in done:
            continue
        done.add(ai)
        a, arr, off = view(ai)
        M = arr.reshape(-1, 4, 4).transpose(0, 2, 1).astype(float)
        R4 = np.eye(4)
        R4[:3, :3] = RY
        M = M @ R4.T                                # IBM' = IBM inv(R): vertices and joints both turned by R
        b[off:off + arr.nbytes] = M.transpose(0, 2, 1).astype(np.float32).tobytes()
    # textures: smaller; PNG kept where the image has alpha (hair cards, lashes)
    blobs, holes, means = {}, {}, {}
    eye_imgs = set()
    for m in j.get('materials', []):
        if EYES in m.get('name', ''):
            for k in ('baseColorTexture',):
                t = m.get('pbrMetallicRoughness', {}).get(k)
                if t is not None:
                    eye_imgs.add(j['textures'][t['index']]['source'])
    for ii, im in enumerate(j.get('images', [])):
        v = j['bufferViews'][im['bufferView']]
        o = v.get('byteOffset', 0)
        raw = bytes(b[o:o + v['byteLength']])
        try:
            img = Image.open(io.BytesIO(raw))
            img.load()
        except Exception:                   # a few community PNGs carry a chunk with a bad CRC; ImageMagick shrugs it off
            img = Image.open(io.BytesIO(subprocess.run(['convert', '-', 'png:-'], input=raw, capture_output=True, check=True).stdout))
        alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
        img = img.convert('RGBA' if alpha else 'RGB')
        if alpha and np.asarray(img)[..., 3].min() >= 250:       # an alpha channel with nothing in it: a JPEG will do
            alpha, img = False, img.convert('RGB')
        holes[ii] = alpha and float((np.asarray(img)[..., 3] < 128).mean()) > 0.02
        means[ii] = np.asarray(img)[..., :3].reshape(-1, 3).mean(0)
        px = 256 if ii in eye_imgs else max_px                    # the eyes are a few centimetres across
        if max(img.size) > px:
            img = img.resize((px, px), Image.LANCZOS)
        if ii in img_role:
            img = neutral(img, img_role[ii])
        bio = io.BytesIO()
        if img_role.get(ii) == 'eye':                             # the iris mask rides in alpha (the material is opaque)
            img.save(bio, 'PNG', optimize=True)
            im['mimeType'] = 'image/png'
        elif alpha:
            # hair, brows and beards are grey once neutral (the page tints them): grey + alpha; anything else with
            # holes keeps its colours in a 256-entry palette
            img = img.convert('LA') if img_role.get(ii) == 'hair' else img.quantize(256, method=Image.FASTOCTREE)
            img.save(bio, 'PNG', optimize=True)
            im['mimeType'] = 'image/png'
        else:
            img.save(bio, 'JPEG', quality=86)
            im['mimeType'] = 'image/jpeg'
        blobs[im['bufferView']] = bio.getvalue()
    # Blender 4.5's exporter marks every MakeHuman material BLEND, which three.js sorts as transparent (the skin shows
    # its inside through itself): a texture with real holes (hair cards, lashes, beards) cuts out, the rest is opaque
    # and it sometimes files a colour image (MakeHuman brows: black) as the normal map: a normal map is bluish
    for m in j.get('materials', []):
        n = m.get('normalTexture')
        if n is not None:
            r, g, bl = means[j['textures'][n['index']]['source']]
            if not (bl > 170 and 90 < r < 170 and 90 < g < 170):
                del m['normalTexture']
    for m in j.get('materials', []):
        t = m.get('pbrMetallicRoughness', {}).get('baseColorTexture')
        if t is not None and holes.get(j['textures'][t['index']]['source']):
            # brows are soft strokes: at 0.5 only their cores would stay
            m['alphaMode'], m['alphaCutoff'], m['doubleSided'] = 'MASK', 0.2 if 'eyebrow' in m.get('name', '') else 0.5, True
        else:
            m.pop('alphaMode', None)
            m.pop('alphaCutoff', None)
    parts, off = [], 0
    for k, v in enumerate(j['bufferViews']):
        o = v.get('byteOffset', 0)
        data = blobs.get(k, bytes(b[o:o + v['byteLength']]))
        pad = (-off) % 4
        parts.append(b'\0' * pad)
        off += pad
        v['byteOffset'], v['byteLength'] = off, len(data)
        parts.append(data)
        off += len(data)
    binb = b''.join(parts) + b'\0' * ((-off) % 4)
    j['buffers'] = [{'byteLength': len(binb)}]
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(out, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + binb)
    return roles


def body_primitive(path):
    """positions and triangles of the base's skin primitive (material 'Human.body')"""
    j, b = glbio.read_glb(open(path, 'rb').read())
    for m in j['meshes']:
        for p in m['primitives']:
            mat = j['materials'][p['material']]['name'] if 'material' in p else ''
            if mat.endswith('.body'):
                P = glbio.accessor(j, b, p['attributes']['POSITION']).astype(float)
                T = glbio.accessor(j, b, p['indices']).reshape(-1, 3).astype(int)
                return mat, P, T
    raise SystemExit('make_mpfb.py: no body primitive in ' + path)


def all_triangles(path):
    """positions and triangles of every primitive of a GLB, as one mesh"""
    j, b = glbio.read_glb(open(path, 'rb').read())
    Ps, Ts, n = [], [], 0
    for m in j['meshes']:
        for p in m['primitives']:
            P = glbio.accessor(j, b, p['attributes']['POSITION']).astype(float)
            Ps.append(P)
            Ts.append(glbio.accessor(j, b, p['indices']).reshape(-1, 3).astype(int) + n)
            n += len(P)
    return np.concatenate(Ps), np.concatenate(Ts)


def covered(BP, BT, path, out=0.025, inward=0.02):
    """the base triangles an item covers when it has no delete group: each base vertex casts a ray out along its normal
    (the garment lies over it) and one in (the skin already pokes through it); a triangle whose three vertices both
    find the garment close is hidden"""
    from make_kit import ray_hits
    N = np.zeros_like(BP)
    fn = np.cross(BP[BT[:, 1]] - BP[BT[:, 0]], BP[BT[:, 2]] - BP[BT[:, 0]])
    for k in range(3):
        np.add.at(N, BT[:, k], fn)
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)
    AP, AT = all_triangles(path)
    t_out, _ = ray_hits(BP, N, AP, AT, out, step=0.01)
    t_in, _ = ray_hits(BP, -N, AP, AT, inward, step=0.01)
    hit = np.isfinite(t_out) | np.isfinite(t_in)
    return np.nonzero(hit[BT].all(1))[0]


def bits(n, idx):
    a = np.zeros((n + 7) // 8 * 8, np.uint8)
    a[np.asarray(idx, int)] = 1
    return base64.b64encode(np.packbits(a, bitorder='little').tobytes()).decode()


# ---- morphs (mpfb_build.py writes morphs.npz: per slider endpoint, how far every vertex of every mesh and every
# joint moved, after MPFB refitted clothes, hair and rig) ----
LABELS = {'nose-scale-horiz': 'Nose width', 'nose-scale-vert': 'Nose length', 'nose-scale-depth': 'Nose depth',
          'nose-hump': 'Nose hump', 'nose-curve': 'Nose curve', 'nose-point-width': 'Nose tip', 'nose-nostrils-width':
          'Nostrils', 'nose-trans': 'Nose height', 'mouth-scale-horiz': 'Mouth width', 'mouth-lowerlip-volume':
          'Lower lip', 'mouth-upperlip-volume': 'Upper lip', 'mouth-angles': 'Mouth corners', 'eye-scale': 'Eye size',
          'eye-trans-in-out': 'Eye spacing', 'eye-trans-down-up': 'Eye height', 'eye-epicanthus': 'Epicanthic fold',
          'eye-eyefold-angle': 'Eye slant', 'eye-bag': 'Eye bags', 'eyebrows-trans': 'Brow height', 'eyebrows-angle':
          'Brow angle', 'chin-width': 'Chin width', 'chin-height': 'Chin height', 'chin-prominent': 'Chin forward',
          'chin-bones': 'Jaw width', 'cheek-bones': 'Cheekbones', 'cheek-volume': 'Cheeks', 'forehead-scale-vert':
          'Forehead height', 'forehead-trans': 'Forehead slope', 'head-scale-horiz': 'Head width', 'head-scale-vert':
          'Head height', 'head-fat': 'Face fat', 'head-angle': 'Head angle', 'ear-scale': 'Ear size', 'ear-lobe':
          'Ear lobes', 'ear-shape-pointed-triangle': 'Pointed ears', 'measure-neck-circ': 'Neck girth',
          'age': 'Age', 'muscle': 'Muscle', 'weight': 'Weight', 'height': 'Height', 'proportions': 'Proportions',
          'cupsize': 'Bust', 'firmness': 'Firmness'}
# a slider's reach: at +-1 it weighs its end target by this (height's full ends blend to 2.4 m and 1.3 m)
REACH = {'height': 0.5}
UNIT = 1e-4            # deltas in 0.1 mm steps (int16: +-3.2 m)


def label(cat):
    for k in sorted(LABELS, key=len, reverse=True):
        if cat.startswith(k):
            return LABELS[k]
    return cat.replace('-decr-incr', '').replace('-', ' ').capitalize()


def mesh_entries(path, key):
    """[(npz key, material names, Blender indices used)] per mesh of a GLB; key(node name) names its npz key or None"""
    j, b = glbio.read_glb(open(path, 'rb').read())
    out = []
    for nd in j['nodes']:
        k = key(nd.get('name', '')) if 'mesh' in nd else None
        if k is None:
            continue
        mats, vid = [], []
        for p in j['meshes'][nd['mesh']]['primitives']:
            if 'material' in p:
                mats.append(j['materials'][p['material']]['name'])
            if '_VIDX' in p['attributes']:
                vid.append(np.rint(glbio.accessor(j, b, p['attributes']['_VIDX']).reshape(-1)).astype(int))
        if vid:
            out.append((k, mats, np.unique(np.concatenate(vid))))
    return out


def pack_morphs(entries, npz):
    """KMR1, little endian, unaligned: u16 entries; per entry: u16 len + its material names ('\\n'-joined, utf8),
    u32 n + n x u32 the Blender vertex indices it uses, u16 targets; per target: u16 index, u32 count, then when
    count has the top bit set, deltas for all n vertices in that order, else count x u32 indices; then deltas as
    3 x i16 each (UNIT metres). A vertex that moves under 0.2 mm is left out"""
    out = [b'KMR1', struct.pack('<H', len(entries))]
    for key, mats, used in entries:
        D = npz['d_' + key]                          # targets x vertices x 3
        name = '\n'.join(mats).encode()
        blocks = []
        for t in range(D.shape[0]):
            d = D[t, used]
            moved = np.abs(d).max(1) > 2e-4
            if not moved.any():
                continue
            q = lambda x: np.clip(np.rint(x / UNIT), -32767, 32767).astype(np.int16).tobytes()
            if moved.mean() > 0.6:
                blocks.append(struct.pack('<HI', t, 0x80000000) + q(d))
            else:
                blocks.append(struct.pack('<HI', t, int(moved.sum())) + used[moved].astype(np.uint32).tobytes() + q(d[moved]))
        out.append(struct.pack('<H', len(name)) + name + struct.pack('<I', len(used)) + used.astype(np.uint32).tobytes()
                   + struct.pack('<H', len(blocks)) + b''.join(blocks))
    return b''.join(out)


def godot_shapes(path, key, npz, tri_mask=None, skin_mat=None):
    """GSH1: what the Godot twin (godot/krator/character/kchar_figure.gd) needs to make a piece's blend shapes without
    looping over deltas in GDScript. Per mesh (keyed by its first material), the targets that move it and per surface
    each target's offsets (float32 xyz, in the glTF's vertex order, which Godot's importer keeps: a RELATIVE blend
    shape in Godot is base + weight * shape). The skin
    surface (skin_mat) is split into regions by tri_mask (per triangle, the bits of the items that cover it): per
    region its triangles, the vertices they use (keep) and the shapes over those. Also the skin's 64 lowest vertices
    and how each target moves them (the ground). Layout: b'GSH1', u32 json length, json, pad to 4, blob."""
    j, b = glbio.read_glb(open(path, 'rb').read())
    blob, out = bytearray(), {'meshes': {}}

    def put(arr, dt):
        while len(blob) % 4:
            blob.append(0)
        a = np.ascontiguousarray(arr, dt)
        off = len(blob)
        blob.extend(a.tobytes())
        return off
    for nd in j['nodes']:
        k = key(nd.get('name', '')) if 'mesh' in nd else None
        if k is None:
            continue
        D = npz['d_' + k]
        prims = []
        for p in j['meshes'][nd['mesh']]['primitives']:
            mat = j['materials'][p['material']]['name']
            P = glbio.accessor(j, b, p['attributes']['POSITION']).astype(np.float32)
            vid = np.rint(glbio.accessor(j, b, p['attributes']['_VIDX']).reshape(-1)).astype(int)
            T = glbio.accessor(j, b, p['indices']).reshape(-1, 3).astype(int)
            prims.append((mat, P, vid, T))
        moved = sorted({t for t in range(D.shape[0]) for _, _, vid, _ in prims if np.abs(D[t, vid]).max() > 2e-4})
        surfs = []
        for mat, P, vid, T in prims:
            parts = [(None, None, None)]
            if tri_mask is not None and mat == skin_mat:
                parts = []
                for m in np.unique(tri_mask):
                    tris = np.nonzero(tri_mask == m)[0]
                    keep = np.array(list(dict.fromkeys(T[tris].reshape(-1).tolist())), int)
                    parts.append((int(m), tris, keep))
                low = np.argsort(P[:, 1])[:64]
                out['ground'] = {'y0': [float(x) for x in P[low, 1]],
                                 'dy': {str(t): [round(float(x), 6) for x in D[t, vid[low], 1]] for t in moved}}
            for m, tris, keep in parts:
                sel = keep if keep is not None else np.arange(len(P))
                sf = {'material': mat, 'n': int(len(sel)), 'region': m,
                      'pos': [put(D[t, vid[sel]], np.float32) for t in moved]}
                if keep is not None:
                    sf['keep'] = put(keep, np.uint32)
                    sf['tris'] = [put(tris, np.uint32), int(len(tris))]
                surfs.append(sf)
        out['meshes'][prims[0][0]] = {'shapes': moved, 'surfaces': surfs}
    js = json.dumps(out, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    return b'GSH1' + struct.pack('<I', len(js)) + js + bytes(blob)


def morph_kit(npz, J):
    """the sliders (kit.morphs), the ancestry triple, and per target the joints that move"""
    targets = [str(t) for t in npz['targets']]
    sliders, anc, by = [], {}, {}
    for i, t in enumerate(targets):
        kind, name = t.split(':')[0], t.split(':')[1]
        if kind == 'race':
            anc[name] = i
            continue
        end = t.split(':')[2]
        s = by.get(name)
        if s is None:
            s = by[name] = {'id': name, 'label': label(name), 'group': 'Body' if kind == 'macro' else 'Face'}
            if name in REACH:
                s['reach'] = REACH[name]
            sliders.append(s)
        s['minus' if end in ('min', 'negative') else 'plus'] = i
    bones = [glbio.short(str(b)) for b in npz['bones']]
    D = npz['d_joints']
    joints = {}
    for t in range(D.shape[0]):
        rows = [[J[bn]] + [round(float(x), 5) for x in D[t, k]] for k, bn in enumerate(bones)
                if bn in J and np.abs(D[t, k]).max() > 1e-4]
        if rows:
            joints[str(t)] = rows
    race0 = [float(x) for x in npz['race0']]
    follow = sorted(i for n, i in J.items() if n not in bones)      # joints the rig lacks (face points): ride their parent
    return {'targets': targets, 'morphs': sliders,
            'ancestry': {'african': anc.get('african'), 'asian': anc.get('asian'), 'caucasian': anc.get('caucasian'),
                         'base': race0},
            'morph_joints': joints, 'follow': follow}


def main():
    body, src = sys.argv[1], sys.argv[2]
    name = 'mpfb_' + body
    pieces = os.path.join(HERE, 'pieces', name)
    data = os.path.join(HERE, 'data', name)
    os.makedirs(pieces, exist_ok=True)
    os.makedirs(data, exist_ok=True)
    man = json.load(open(os.path.join(src, 'manifest.json')))
    dg = json.load(open(os.path.join(src, 'delete_groups.json')))
    roles = turn_glb(os.path.join(src, 'base.glb'), os.path.join(pieces, 'base.glb'),
                     role=lambda m: 'skin' if m.split('.')[-1] in SKIN_PARTS else 'hair' if 'eyebrow' in m else
                     'eye' if EYES in m else None)
    c = mp.load(os.path.join(pieces, 'base.glb'))
    c.J = {n: i for i, n in enumerate(c.joints)}
    mat, BP, BT = body_primitive(os.path.join(pieces, 'base.glb'))
    tree = cKDTree(BP)
    items = []
    for it in man['items']:
        r = turn_glb(os.path.join(src, it['glb']), os.path.join(pieces, it['id'] + '.glb'),
                     role=lambda m: 'hair' if it['slot'] in ('hair', 'beard') else None)
        roles.update(r)
        entry = {'id': it['id'], 'name': it['name'], 'slot': it['slot'], 'glb': 'pieces/%s/%s.glb' % (name, it['id'])}
        pts = np.array(dg.get(it['id'], []), float)
        if len(pts):
            # Blender world (Z up) -> glTF (Y up: x, z, -y) -> half a turn
            g = np.stack([pts[:, 0], pts[:, 2], -pts[:, 1]], 1) @ RY.T
            d, k = tree.query(g)
            hit = np.zeros(len(BP), bool)
            hit[k[d < 1e-3]] = True
            # MPFB's mask drops a face when any of its vertices is in the group
            tris = np.nonzero(hit[BT].any(1))[0]
            entry['hide'] = bits(len(BT), tris)
            entry['hides'] = int(len(tris))
        elif it['slot'] in ('torso', 'legs', 'feet'):
            tris = covered(BP, BT, os.path.join(pieces, it['id'] + '.glb'))
            entry['hide'] = bits(len(BT), tris)
            entry['hides'] = int(len(tris))
            entry['hide_by'] = 'rays'          # no delete group in the asset: covered() found it
        items.append(entry)
        print('%-8s %-6s %-34s hides %5d' % (name, it['slot'], it['id'], entry.get('hides', 0)))
    npz_path = os.path.join(src, 'morphs.npz')
    morph = {}
    if os.path.exists(npz_path):
        npz = np.load(npz_path)
        always = man.get('always', [])
        ents = mesh_entries(os.path.join(pieces, 'base.glb'), lambda n: 'base' if n == 'Human' else
                            '_always%d' % always.index(n) if n in always else None)
        open(os.path.join(pieces, 'base.morph.bin'), 'wb').write(pack_morphs(ents, npz))
        for it in man['items']:
            ents = mesh_entries(os.path.join(pieces, it['id'] + '.glb'), lambda n: it['id'])
            open(os.path.join(pieces, it['id'] + '.morph.bin'), 'wb').write(pack_morphs(ents, npz))
        # the Godot twin's blend shapes (godot_shapes): the base's skin split by which items cover each triangle
        tri_mask = np.zeros(len(BT), np.int64)
        for i, e in enumerate(items):
            if 'hide' in e:
                hb = np.unpackbits(np.frombuffer(base64.b64decode(e['hide']), np.uint8), bitorder='little')[:len(BT)]
                tri_mask[hb.astype(bool)] |= 1 << i
        open(os.path.join(pieces, 'base.gshapes.bin'), 'wb').write(godot_shapes(
            os.path.join(pieces, 'base.glb'), lambda n: 'base' if n == 'Human' else
            '_always%d' % always.index(n) if n in always else None, npz, tri_mask, mat))
        for it in man['items']:
            open(os.path.join(pieces, it['id'] + '.gshapes.bin'), 'wb').write(godot_shapes(
                os.path.join(pieces, it['id'] + '.glb'), lambda n: it['id'], npz))
        morph = True
        print(name, '%.1f MB of morph deltas' % (sum(os.path.getsize(os.path.join(pieces, f)) for f in os.listdir(pieces)
                                          if f.endswith('.morph.bin')) / 1e6))
    clips = mp.write_anims(os.path.join(pieces, 'anims.glb'), c)
    names, parents, jnodes, W = mp.skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in mp.FACE})
    if morph:
        morph = morph_kit(npz, {n['name']: i for i, n in enumerate(jnodes)})
    json.dump({'joints': [{'name': n['name'], 'parent': parents[i], 't': n['translation'], 'r': n['rotation']}
                          for i, n in enumerate(jnodes)], 'clips': clips},
              open(os.path.join(data, 'skeleton.json'), 'w'), indent=1)
    json.dump({'body': name, 'style': 'mpfb', 'label': 'MakeHuman ' + body, 'base_glb': 'pieces/%s/base.glb' % name,
               'base_material': mat, 'base_tris': int(len(BT)), 'items': items, 'morph': morph,
               'tint': {'roles': roles, 'gain': {k: round(1 / srgb_lin(v), 4) for k, v in TINT_MEAN.items()}}},
              open(os.path.join(data, 'kit.json'), 'w'), indent=1)
    print(name, 'height %.2f m' % (c.jpos[c.J['HeadTop_End']][1] if 'HeadTop_End' in c.J else -1), len(items), 'items')


if __name__ == '__main__':
    main()
