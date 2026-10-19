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
import base64, bisect, io, json, math, os, shutil, struct, subprocess, sys
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import decimate
import giant
import glbio
import mods
import make_pieces as mp

HERE = mp.HERE
# MPFB's glTF export already faces +Z with its left side on +X (the convention every piece here uses); kept as a hook
# in case a future export needs turning
RY = np.eye(3)


# the tint the page multiplies in (skin tone, hair colour) needs a neutral texture: skin keeps its detail but its mean
# becomes grey TINT_MEAN['skin'] (sRGB); hair, brows and beards turn grey with their median at TINT_MEAN['hair']
TINT_MEAN = {'skin': 0.80, 'hair': 0.72, 'eye': 0.5}
# items exported but left out: they render broken on this body (the same asset can fit the other one)
SKIP = {'male': ('culturalibre_hair_13', 'half_bald', 'punkduck_alpha7_long2'), 'female': ('elvs_wavy_bob',)}
RENAME = {'culturalibre_hair_13': 'Short crop'}     # a label the export got wrong (mpfb_build.py has it right now)
# items far denser than they look (twice the body's triangles in a pair of shoes): kept to this share of their
# triangles by decimate.py, which keeps a subset of their own vertices, so the morph deltas still match
DECIMATE = {'grinsegold_female_pirate_boots': 0.1, 'toigo_flats': 0.1}
EYES = 'low-poly'               # the eye mesh's material (MakeHuman's low-poly eyes)
SKIN_PARTS = ('body', 'nipple', 'lips', 'fingernails', 'toenails', 'ears')     # the base's MakeSkin slots on one texture


def srgb_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def iris_mask(rgb, alpha=None):
    """0..1 per pixel: the irises of a MakeHuman eye texture (two discs, one per eye in its UV layout). Each pupil is a
    dark blob; its iris runs out to where the ring around it turns pale (the sclera)"""
    from scipy import ndimage
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    dark = lum < 0.06
    if alpha is not None:               # a transparent corner (the cornea's disc) is black too: not a pupil
        dark &= alpha > 0.5
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
        m = iris_mask(rgb, a[..., 3] if a.shape[2] == 4 else None)
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
        if a.shape[2] == 4:
            # the clear texels take the strands' grey: their colour is black in many assets, and a texture that is
            # mostly clear (the BHL beards: 5 % strands) averages to near-black in its smaller mips
            clear = a[..., 3] < 0.12
            lum[clear] = TINT_MEAN['hair']
        rgb = np.repeat(lum[..., None], 3, 2)
    a[..., :3] = rgb
    return Image.fromarray(np.rint(a * 255).astype(np.uint8), img.mode)


def turn_glb(src, out, max_px=1024, role=lambda mat: None, skirt=None, cloth=None, body=None, head_above=None):
    """role(material name) -> 'skin', 'hair' or None: that material's colour texture is made neutral (neutral()).
    skirt: a height (glTF y) below which the item hangs as one piece (skirt_weights). cloth: (item id, its
    make_garments.py chain spec): bone chains are added (cloth_bones), and what the kit needs of them is put in
    cloth['out']. Returns {material name: role} for the materials that got one"""
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
    if skirt is not None:
        skirt_weights(j, b, skirt)
    if head_above is not None:
        head_weights(j, b, head_above)
    cloth_blobs = {}
    if cloth is not None:
        cloth['out'] = cloth_bones(j, b, cloth['id'], cloth['spec'], cloth_blobs, body)
    # textures: smaller; PNG kept where the image has alpha (hair cards, lashes)
    blobs, holes, means, soft = dict(cloth_blobs), {}, {}, {}
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
        if alpha:                       # strand cards drawn for blending: most of their alpha sits under one half
            al = np.asarray(img)[..., 3]
            soft[ii] = float((al > 128).mean()) < 0.4 * float((al > 13).mean())
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
    # a hair or beard with no texture at all (a solid-colour mesh) gets a flat grey one at the neutral level, so the
    # page's tint (calibrated on neutral textures) lands as it does on the others
    flat = [m for m in j.get('materials', []) if role(m.get('name', '')) == 'hair'
            and 'baseColorTexture' not in m.get('pbrMetallicRoughness', {})]
    if flat:
        bio = io.BytesIO()
        Image.new('L', (4, 4), int(round(TINT_MEAN['hair'] * 255))).save(bio, 'PNG')
        j['bufferViews'].append({'buffer': 0, 'byteOffset': 0, 'byteLength': 0})
        blobs[len(j['bufferViews']) - 1] = bio.getvalue()
        j.setdefault('images', []).append({'bufferView': len(j['bufferViews']) - 1, 'mimeType': 'image/png', 'name': 'flat_grey'})
        if not j.get('samplers'):
            j['samplers'] = [{}]
        j.setdefault('textures', []).append({'source': len(j['images']) - 1, 'sampler': 0})
        for m in flat:
            m.setdefault('pbrMetallicRoughness', {})['baseColorTexture'] = {'index': len(j['textures']) - 1}
            roles[m['name']] = 'hair'
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
            src = j['textures'][t['index']]['source']
            cut = 0.2 if 'eyebrow' in m.get('name', '') else 0.12 if soft.get(src) and roles.get(m['name']) == 'hair' else 0.5
            m['alphaMode'], m['alphaCutoff'], m['doubleSided'] = 'MASK', cut, True
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


def body_contact(path):
    """for cloth_bones: the base skin's points (a KD tree) and, per point, how much of its weight is on the legs"""
    j, b = glbio.read_glb(open(path, 'rb').read())
    node = next(n for n in j['nodes'] if 'mesh' in n and 'skin' in n)
    names = [j['nodes'][k].get('name', '').split(':')[-1] for k in j['skins'][node['skin']]['joints']]
    leg = np.array([any(x in n for x in ('UpLeg', 'Leg', 'Foot', 'Toe')) for n in names])
    for m in j['meshes']:
        for p in m['primitives']:
            if 'material' in p and j['materials'][p['material']]['name'].endswith('.body'):
                at = p['attributes']
                P = glbio.accessor(j, b, at['POSITION']).astype(float)
                JJ = glbio.accessor(j, b, at['JOINTS_0']).astype(int)
                WW = glbio.accessor(j, b, at['WEIGHTS_0']).astype(float)
                return cKDTree(P), (WW * leg[JJ]).sum(1) / np.maximum(WW.sum(1), 1e-9)
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


SKIRT_KEEP = 0.8           # the share of the legs' pull a skirt keeps (split evenly between the thighs)
SKIRT_POOL = 0.65          # how much of a vertex's own pull gives way to the pooled one (the rest still follows its side's leg)


def skirt_weights(j, b, y0, band=0.12):
    """a garment hanging below the crotch (a skirt, a robe's or a cloak's hem) takes its skin weights from MakeHuman's
    skirt helper, which follows each thigh: in a stride the cloth parts like trousers. Below y0 (fading in over 'band')
    the legs' weights are partly pooled (SKIRT_POOL): SKIRT_KEEP of them shared evenly by both thighs (the hem still
    sways front to back), the rest given to the hips; the remainder still follows its own side's leg, so a stride
    stretches the cloth instead of splitting it. Edits JOINTS_0 / WEIGHTS_0 in place (b: the GLB's bytearray)"""
    def arr(ai):
        a = j['accessors'][ai]
        v = j['bufferViews'][a['bufferView']]
        dt = glbio.CT[a['componentType']]
        n = glbio.NC[a['type']]
        off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        if v.get('byteStride') not in (None, np.dtype(dt).itemsize * n):
            raise SystemExit('make_mpfb.py: strided skin attributes')
        return a, dt, off, np.frombuffer(b, dt, a['count'] * n, off).reshape(a['count'], n).copy()
    for ni, node in enumerate(j.get('nodes', [])):
        if 'mesh' not in node or 'skin' not in node:
            continue
        names = [j['nodes'][k].get('name', '') for k in j['skins'][node['skin']]['joints']]
        idx = lambda key: [k for k, nm in enumerate(names) if nm.split(':')[-1] == key]
        hips = idx('Hips')
        lup, rup = idx('LeftUpLeg'), idx('RightUpLeg')
        chain = {k for key in ('LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase') for k in idx(key)}
        if not (hips and lup and rup):
            continue
        for p in j['meshes'][node['mesh']]['primitives']:
            at = p['attributes']
            if 'JOINTS_0' not in at or 'WEIGHTS_0' not in at:
                continue
            P = glbio.accessor(j, bytes(b), at['POSITION'])
            aj, dj, oj, JJ = arr(at['JOINTS_0'])
            aw, dw, ow, WW = arr(at['WEIGHTS_0'])
            Wf = WW.astype(np.float64) / (np.iinfo(dw).max if aw.get('normalized') else 1.0)
            f = np.clip((y0 - P[:, 1]) / band, 0, 1) * SKIRT_POOL
            for v in np.nonzero(f > 0)[0]:
                dense = {}
                for jj, ww in zip(JJ[v], Wf[v]):
                    if ww > 0: dense[int(jj)] = dense.get(int(jj), 0) + ww
                legs = sum(w for k, w in dense.items() if k in chain)
                if legs <= 0:
                    continue
                want = {k: w for k, w in dense.items() if k not in chain}
                want[hips[0]] = want.get(hips[0], 0) + legs * (1 - SKIRT_KEEP)
                want[lup[0]] = want.get(lup[0], 0) + legs * SKIRT_KEEP / 2
                want[rup[0]] = want.get(rup[0], 0) + legs * SKIRT_KEEP / 2
                mix = {k: dense.get(k, 0) * (1 - f[v]) + want.get(k, 0) * f[v] for k in set(dense) | set(want)}
                top = sorted(mix.items(), key=lambda kv: -kv[1])[:4]
                tot = sum(w for _, w in top) or 1.0
                top += [(0, 0.0)] * (4 - len(top))
                JJ[v] = [k for k, _ in top]
                Wf[v] = [w / tot for _, w in top]
            WW = (np.round(Wf * np.iinfo(dw).max) if aw.get('normalized') else Wf).astype(dw)
            b[oj:oj + JJ.nbytes] = JJ.astype(dj).tobytes()
            b[ow:ow + WW.nbytes] = WW.tobytes()


def head_weights(j, b, y0):
    """headgear moves with the head: every vertex above height y0 (glTF y, a little above the neck joint) takes its
    weight from the Head joint alone. MakeHuman weights a garment from the skin nearest it, so a wide brim, a wing or
    a flap that reaches down beside the neck took the shoulders' and arms' weights and bent as they moved (the Yuni
    hat's brim, the Beast Rider chieftess's wings: a third of their weight on the arms). A hood's cowl, below y0, keeps
    following the neck and shoulders"""
    for node in j['nodes']:
        if 'mesh' not in node or 'skin' not in node:
            continue
        names = [j['nodes'][k].get('name', '').split(':')[-1] for k in j['skins'][node['skin']]['joints']]
        if 'Head' not in names:
            continue
        hj = names.index('Head')
        for prim in j['meshes'][node['mesh']]['primitives']:
            at = prim['attributes']
            P = glbio.accessor(j, bytes(b), at['POSITION'])
            aj, aw = j['accessors'][at['JOINTS_0']], j['accessors'][at['WEIGHTS_0']]
            JJ = glbio.accessor(j, bytes(b), at['JOINTS_0']).copy()
            WW = glbio.accessor(j, bytes(b), at['WEIGHTS_0']).copy()
            dw = glbio.CT[aw['componentType']]
            if aw.get('normalized'):                    # the accessor gave them as fractions: back to the stored integers
                WW = np.round(WW * np.iinfo(dw).max).astype(dw)
            up = P[:, 1] > y0
            if not up.any():
                continue
            one = np.iinfo(WW.dtype).max if np.issubdtype(WW.dtype, np.integer) else 1.0
            JJ[up] = 0; WW[up] = 0
            JJ[up, 0] = hj; WW[up, 0] = one
            for acc, arr in ((aj, JJ), (aw, WW)):
                bv = j['bufferViews'][acc['bufferView']]
                if bv.get('byteStride') and bv['byteStride'] != arr.itemsize * 4:
                    raise SystemExit('make_mpfb.py head_weights: interleaved attributes are not handled')
                off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
                b[off:off + arr.nbytes] = arr.astype(glbio.CT[acc['componentType']]).tobytes()


def take_weights(JJ, WW, gi, src, f):
    """vertex gi's weights moved toward vertex src's by f (the four heaviest kept, normalized)"""
    mix = {}
    for jj, ww in zip(JJ[gi], WW[gi]):
        mix[int(jj)] = mix.get(int(jj), 0) + ww * (1 - f)
    for jj, ww in zip(JJ[src], WW[src]):
        mix[int(jj)] = mix.get(int(jj), 0) + ww * f
    top = sorted(mix.items(), key=lambda kv: -kv[1])[:4]
    tot = sum(x for _, x in top) or 1.0
    top += [(0, 0.0)] * (4 - len(top))
    JJ[gi] = [q for q, _ in top]
    WW[gi] = [x / tot for _, x in top]


def cover_weights(P, V, where, spec, JJ, WW, names=()):
    """a skirt (layer 0) under an over-tier or an apron of the same garment (layer 1): each of its vertices the outer
    part covers takes the nearest outer vertex's weights, faded in over 6 cm above the outer hem and out past 6 cm
    from it, so where the two overlap they move as one and the under-tier cannot swing through.
    A part that does not hang (the grand boubou's under-tunic, a robe's body under its mantle) under one that does
    over the arms (layer 2): each of its vertices inside the outer part and within 8 cm of it takes the nearest outer
    vertex's weights (in full within 5 cm), so a seated or crouching body cannot carry it out through the sheet the
    chains hold. Sleeves (weighted to the arms) and what lies outside the outer part (a belt, a collar) keep theirs"""
    layer = [pt.get('layer', 0) for pt in spec['parts']]
    part = np.array([where.get(int(v), (-1,))[0] for v in V])
    arm = [any(s in n for s in ('Arm', 'Hand')) for n in names]
    free = [gi for gi in np.nonzero(part == -1)[0]
            if sum(w for jj, w in zip(JJ[gi], WW[gi]) if int(jj) < len(arm) and arm[int(jj)]) < 0.5]
    rad = np.hypot(P[:, 0], P[:, 2])
    for po in [q for q in range(len(layer)) if layer[q] == 2]:
        O = np.nonzero(part == po)[0]
        if not len(O):
            continue
        for gi in free:
            d = np.linalg.norm(P[O] - P[gi], axis=1)
            k = int(np.argmin(d))
            f = float(np.clip((0.08 - d[k]) / 0.03, 0, 1))
            out = np.array([P[gi, 0], 0, P[gi, 2]]) / max(rad[gi], 1e-6)
            # covered: the outer vertex lies outward of it, not off to one side (a belt across an open coat's gap)
            if f > 0 and rad[gi] < rad[O[k]] - 0.005 and (P[O[k]] - P[gi]) @ out > 0.6 * d[k]:
                take_weights(JJ, WW, gi, O[k], f)
    for po in [q for q in range(len(layer)) if layer[q] == 1]:
        O = np.nonzero(part == po)[0]
        if not len(O):
            continue
        hem = P[O, 1].min()
        for pi in [q for q in range(len(layer)) if layer[q] == 0]:
            for gi in np.nonzero(part == pi)[0]:
                d = np.linalg.norm(P[O] - P[gi], axis=1)
                k = int(np.argmin(d))
                f = float(np.clip((P[gi, 1] - hem - 0.02) / 0.06, 0, 1) * np.clip((0.09 - d[k]) / 0.03, 0, 1))
                if f > 0:
                    take_weights(JJ, WW, gi, O[k], f)


# metres off the skin: cloth nearer than the first keeps the body's weights, past the second the chains'. Wide: a cloak
# hung plumb from the shoulder blades stands 4-6 cm off the small of the back, and on chains held by the chest it
# swung into the back as the idle leaned forward; above the seat cloth now moves with the body, below it swings
CONTACT = (0.04, 0.09)


def cloth_bones(j, b, item, spec, blobs, body=None):
    """the garment's hanging parts as bone chains (spec: make_garments.py's, by the garment's own vertex order, which
    the export keeps as _VIDX). Per chain a joint per bone, named 'cloth:<item>:<chain>:<bone>', a child of the spine
    joint it hangs from, its inverse bind T(-p) at its anchor vertex; the vertices below each chain's top weighted to
    the two chains either side of them (by column) and the bone of their stretch (by row), faded in over two rows from
    the top. Returns the kit entry: per chain its parent joint and anchor vertices (glTF indices, so the page and Godot
    can read the morphed rest from their own meshes), per part its chains and whether they close round.
    body (body_contact): cloth that lies on the skin (within CONTACT[0], fading out by CONTACT[1]) keeps the body's
    weights, so a cloak or a mantle lying on the back and shoulders moves with them; only cloth hanging clear goes to
    the chains. Not over the legs: a skirt lying on a thigh at rest leaves it as the leg swings (skirt_weights)"""
    node = next((n for n in j['nodes'] if 'mesh' in n and 'skin' in n), None)
    if node is None:
        return None
    skin = j['skins'][node['skin']]
    prim = j['meshes'][node['mesh']]['primitives'][0]
    at = prim['attributes']
    vid_key = '_VIDX' if '_VIDX' in at else next((k for k in at if k.upper() == '_VIDX'), None)
    P = glbio.accessor(j, bytes(b), at['POSITION']).astype(float)
    V = np.rint(glbio.accessor(j, bytes(b), at[vid_key])[:, 0]).astype(int)
    first = {}
    for gi, v in enumerate(V):
        first.setdefault(int(v), gi)
    names = [j['nodes'][k].get('name', '').split(':')[-1] for k in skin['joints']]
    # the chains, their joints
    chains, parts_out, new_nodes, new_ibm = [], [], [], []
    where = {}                                   # garment vertex -> (part, row, col)
    # a grid index -> the mesh's vertex: shifted past the vertices a four-armed top's holes dropped (make_garments.py)
    gone = spec.get('gone', [])
    gset = set(gone)
    def vid(g):
        return None if g in gset else g - bisect.bisect_left(gone, g)
    for pi, part in enumerate(spec['parts']):
        R, Cn, off = part['rows'], part['cols'], part['offset']
        for r in range(R):
            for c in range(Cn):
                if vid(off + r * Cn + c) is not None:
                    where[vid(off + r * Cn + c)] = (pi, r, c)
        ids = []
        for ch in part['chains']:
            pts = [first.get(vid(off + r * Cn + ch['col'])) for r in ch['rows']]
            if any(x is None for x in pts) or ch['parent'] not in names:
                continue
            g = len(chains)
            jidx = []
            for k in range(len(pts) - 1):
                nm = 'cloth:%s:%d:%d' % (item, g, k)
                j['nodes'].append({'name': nm})
                ni = len(j['nodes']) - 1
                par = skin['joints'][names.index(ch['parent'])] if k == 0 else new_nodes[-1]
                j['nodes'][par].setdefault('children', []).append(ni)
                new_nodes.append(ni)
                M = np.eye(4)
                M[:3, 3] = -P[pts[k]]
                new_ibm.append(M.T.reshape(-1))       # column-major
                jidx.append(len(skin['joints']) + len(new_nodes) - 1)
            chains.append({'parent': ch['parent'], 'pts': [int(x) for x in pts], 'part': pi, 'col': ch['col'],
                           'rows': ch['rows'], 'joints': jidx})
            ids.append(g)
        parts_out.append({'closed': part['closed'], 'chains': ids, 'stiff': part['stiff'], 'layer': part.get('layer', 0)})
    if not chains:
        return None
    skin['joints'] += new_nodes
    a = j['accessors'][skin['inverseBindMatrices']]
    old = glbio.accessor(j, bytes(b), skin['inverseBindMatrices']).reshape(-1, 16)
    ibm = np.concatenate([old, np.array(new_ibm)]).astype(np.float32)
    a['count'] = len(ibm)
    blobs[a['bufferView']] = ibm.tobytes()
    # the weights
    aj, aw = j['accessors'][at['JOINTS_0']], j['accessors'][at['WEIGHTS_0']]
    JJ = glbio.accessor(j, bytes(b), at['JOINTS_0']).astype(int)
    WW = glbio.accessor(j, bytes(b), at['WEIGHTS_0']).astype(float)
    by_part = {}
    for ci, ch in enumerate(chains):
        by_part.setdefault(ch['part'], []).append(ci)

    def chain_w(ch, r):
        """one chain's bones for a vertex in row r, and how much the chain has it (0 above its top)"""
        rows = ch['rows']
        if r < rows[0]:
            return {}, 0.0
        k = len(rows) - 2
        sfrac = 1.0
        for q in range(len(rows) - 1):
            if rows[q] <= r < rows[q + 1]:
                k, sfrac = q, (r - rows[q]) / max(1, rows[q + 1] - rows[q])
                break
        out = {ch['joints'][k]: 1.0}
        if k > 0 and sfrac < 0.35:
            bl = (0.35 - sfrac) / 0.35 * 0.5
            out = {ch['joints'][k]: 1 - bl, ch['joints'][k - 1]: bl}
        return out, float(np.clip((r - rows[0]) / 2.0, 0, 1))
    if body is not None:
        gap, near = body[0].query(P)
        lying = np.clip((gap - CONTACT[0]) / (CONTACT[1] - CONTACT[0]), 0, 1)
        lying[body[1][near] > 0.5] = 1.0
    for gi in range(len(P)):
        w = where.get(int(V[gi]))
        if w is None or w[0] not in by_part:
            continue
        pi, r, c = w
        Cn = spec['parts'][pi]['cols']
        cs = sorted(by_part[pi], key=lambda q: chains[q]['col'])
        cols = [chains[q]['col'] for q in cs]
        if spec['parts'][pi]['closed']:
            lo = max([q for q in range(len(cs)) if cols[q] <= c], default=len(cs) - 1)
            hi = (lo + 1) % len(cs)
            span = (cols[hi] - cols[lo]) % Cn or Cn
            t = ((c - cols[lo]) % Cn) / span
        else:
            if c <= cols[0]: lo = hi = 0; t = 0.0
            elif c >= cols[-1]: lo = hi = len(cs) - 1; t = 0.0
            else:
                lo = max(q for q in range(len(cs)) if cols[q] <= c); hi = lo + 1
                t = (c - cols[lo]) / max(1, cols[hi] - cols[lo])
        wa, fa = chain_w(chains[cs[lo]], r)
        wb, fb = chain_w(chains[cs[hi]], r)
        share = (1 - t) * fa + t * fb
        if body is not None:
            share *= lying[gi]
        if share <= 0:
            continue
        mix = {}
        for jj, ww in zip(JJ[gi], WW[gi]):
            if ww > 0: mix[int(jj)] = mix.get(int(jj), 0) + ww * (1 - share)
        for d, f, k in ((wa, fa, 1 - t), (wb, fb, t)):
            for jj, ww in d.items():
                mix[jj] = mix.get(jj, 0) + ww * f * k
        top = sorted(mix.items(), key=lambda kv: -kv[1])[:4]
        tot = sum(x for _, x in top) or 1.0
        top += [(0, 0.0)] * (4 - len(top))
        JJ[gi] = [q for q, _ in top]
        WW[gi] = [x / tot for _, x in top]
    cover_weights(P, V, where, spec, JJ, WW, names)
    big = JJ.max() > 255
    jt = np.uint16 if big else glbio.CT[aj['componentType']]
    if big:
        aj['componentType'] = 5123
    blobs[aj['bufferView']] = JJ.astype(jt).tobytes()
    if aw['componentType'] == 5126:
        blobs[aw['bufferView']] = WW.astype(np.float32).tobytes()
    else:
        dt = glbio.CT[aw['componentType']]
        blobs[aw['bufferView']] = np.round(WW * np.iinfo(dt).max).astype(dt).tobytes()
    for k in ('byteStride',):
        j['bufferViews'][aj['bufferView']].pop(k, None)
        j['bufferViews'][aw['bufferView']].pop(k, None)
    return {'chains': [{'parent': ch['parent'], 'pts': ch['pts']} for ch in chains], 'parts': parts_out}


# the capsules a garment's chains are kept out of: per joint pair, the base radius and how far each morph target moves
# it (KCHAR.colliders: r + sum of weight x dr). Measured on the base skin: the vertices nearest each pair's segment
CAPSULES = [('LeftUpLeg', 'LeftLeg'), ('RightUpLeg', 'RightLeg'), ('LeftLeg', 'LeftFoot'), ('RightLeg', 'RightFoot'),
            ('Hips', 'Spine1'), ('Spine1', 'Neck'), ('LeftArm', 'LeftForeArm'), ('RightArm', 'RightForeArm'),
            ('LeftForeArm', 'LeftHand'), ('RightForeArm', 'RightHand')]


def colliders(c, J, base_glb, npz):
    jj, bb = glbio.read_glb(open(base_glb, 'rb').read())
    prim = next(p for m in jj['meshes'] for p in m['primitives']
                if 'material' in p and jj['materials'][p['material']]['name'].endswith('.body'))
    at = prim['attributes']
    P = glbio.accessor(jj, bb, at['POSITION']).astype(float)
    V = np.rint(glbio.accessor(jj, bb, at[next(k for k in at if k.upper() == '_VIDX')])[:, 0]).astype(int)
    A = np.array([c.jpos[c.J[a]] for a, _ in CAPSULES]); B = np.array([c.jpos[c.J[b]] for _, b in CAPSULES])

    def seg(p, a, bq):
        d = bq - a
        t = np.clip(((p - a) @ d) / (d @ d), 0, 1)
        return np.linalg.norm(p - (a + np.outer(t, d)), axis=1), t
    D = np.stack([seg(P, A[k], B[k])[0] for k in range(len(CAPSULES))], 1)
    own = D.argmin(1)
    tgts = list(npz['targets']) if npz is not None else []
    bones = [glbio.short(str(x)) for x in npz['bones']] if npz is not None else []
    out = []
    for k, (a, b2) in enumerate(CAPSULES):
        d, t = seg(P, A[k], B[k])
        sel = np.nonzero((own == k) & (t > 0.15) & (t < 0.85))[0]
        if len(sel) > 60:
            sel = sel[np.linspace(0, len(sel) - 1, 60).astype(int)]
        r0 = float(np.quantile(d[sel], 0.65))
        dr = {}
        if npz is not None and len(sel):
            Db = npz['d_base']
            for ti in range(len(tgts)):
                dv = Db[ti, V[sel]] @ RY.T
                da = npz['d_joints'][ti, bones.index(a)] @ RY.T if a in bones else 0
                db = npz['d_joints'][ti, bones.index(b2)] @ RY.T if b2 in bones else 0
                r1 = float(np.quantile(seg(P[sel] + dv, A[k] + da, B[k] + db)[0], 0.65))
                if abs(r1 - r0) > 2e-4:
                    dr[str(ti)] = round(r1 - r0, 4)
        # the push's radii at each end (the 90th percentile near it): a limb tapers, and at one radius the calf and the
        # top of the thigh stood out through a robe (the GPU push in 50-figure.js; the chains keep r)
        ends = []
        for lo, hi in ((0.1, 0.35), (0.65, 0.9)):       # inside the limb: past its ends lie the foot, the hand, the trunk
            e = np.nonzero((own == k) & (t >= lo) & (t <= hi))[0]
            ends.append(round(float(min(np.quantile(d[e], 0.9), 1.6 * r0)), 4) if len(e) > 10 else round(r0, 4))
        out.append({'a': J[a], 'b': J[b2], 'r': round(r0, 4), 'dr': dr, 'ra': ends[0], 'rb': ends[1]})
    # the lower pair's joints (mods.py, on every body) are copies of the upper: the same capsules on their own joints
    for k, (a, b2) in enumerate(CAPSULES):
        if 'Arm' in a and mods.lower(a) in J and mods.lower(b2) in J:
            out.append(dict(out[k], a=J[mods.lower(a)], b=J[mods.lower(b2)]))
    out += seat(c, J, P, V, npz, tgts, bones)
    return out


def seat(c, J, P, V, npz, tgts, bones):
    """the buttocks, which neither a thigh's capsule (down the femur) nor the trunk's (up the spine) covers: per side
    an upright capsule behind the hip joint, from just above it to most of the way down to the fold under the buttock
    (14 cm below the joint on the man), its back at the skin's (the 85th
    percentile of how far back the seat's skin reaches). Its ends are rest points (pa, pb: the base's model space)
    carried by the Hips joint (KCHAR.colliders); dr per target from the morphed skin, as the others'"""
    hj = c.jpos[c.J['Hips']]
    toe, foot = c.jpos[c.J['LeftToeBase']], c.jpos[c.J['LeftFoot']]
    fwd = np.array([0.0, 0.0, 1.0 if toe[2] > foot[2] else -1.0])
    out = []
    for s in ('Left', 'Right'):
        hip = c.jpos[c.J[s + 'UpLeg']]
        side = np.sign(hip[0] - hj[0])
        k = c.jpos[c.J[s + 'Leg']]
        fold = hip[1] - 0.16 * (hip[1] - k[1]) / 0.45           # the fold under the buttock, scaled by the thigh's length
        sel = np.nonzero((P[:, 1] > fold) & (P[:, 1] < hip[1] + 0.03) & ((P[:, 0] - hj[0]) * side > 0.01) &
                         ((P[:, 2] - hip[2]) * fwd[2] < -0.03))[0]
        if len(sel) < 20:
            continue
        back = np.quantile(-(P[sel, 2] - hip[2]) * fwd[2], 0.85)       # how far behind the hip joint the seat reaches
        x = float(np.median(P[sel, 0]))
        r0 = 0.075
        zc = hip[2] - fwd[2] * (back - r0)
        pa = np.array([x, hip[1] + 0.02, zc]); pb = np.array([x, fold + 0.05, zc])
        dr = {}
        if npz is not None:
            Db = npz['d_base']
            ha = npz['d_joints'][:, bones.index('Hips')] @ RY.T if 'Hips' in bones else np.zeros((len(tgts), 3))
            for ti in range(len(tgts)):
                q = P[sel] + Db[ti, V[sel]] @ RY.T
                b1 = np.quantile(-(q[:, 2] - (hip[2] + ha[ti][2])) * fwd[2], 0.85)
                if abs(b1 - back) > 2e-4:
                    dr[str(ti)] = round(float(b1 - back), 4)
        out.append({'a': J['Hips'], 'b': J['Hips'], 'r': r0, 'dr': dr,
                    'pa': [round(float(v), 4) for v in pa], 'pb': [round(float(v), 4) for v in pb]})
    if len(out) == 2:                     # the pair mirrored about the hips (a hip's flare pulled one side's median out)
        w = (abs(out[0]['pa'][0] - hj[0]) + abs(out[1]['pa'][0] - hj[0])) / 2
        for o in out:
            sx = 1 if o['pa'][0] > hj[0] else -1
            o['pa'][0] = o['pb'][0] = round(float(hj[0] + sx * w), 4)
    return out


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


def encloses(c, path, rise=(0.02, 0.08), n=24):
    """whether a top closes all round the body just above the hips (rays out from the hips' vertical axis at two
    heights, all but one of each ring meeting it), so trousers or a skirt worn under it can be tucked in: an open
    cloak or a cape leaves the waist in view"""
    from make_kit import ray_hits
    AP, AT = all_triangles(path)
    h = c.jpos[c.J['Hips']]
    a = np.arange(n) * 2 * np.pi / n
    D = np.stack([np.cos(a), np.zeros(n), np.sin(a)], 1)
    for dy in rise:
        O = np.tile([h[0], h[1] + dy, h[2]], (n, 1))
        t, _ = ray_hits(O, D, AP, AT, 0.45, step=0.02)
        if np.isfinite(t).sum() < n - 1:
            return False
    return True


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


def godot_shapes(path, key, npz, tri_mask=None, skin_mat=None, cover=None):
    """GSH1: what the Godot twin (godot/krator/character/kchar_figure.gd) needs to make a piece's blend shapes without
    looping over deltas in GDScript. Per mesh (keyed by its first material), the targets that move it and per surface
    each target's shape whole (float32 xyz, in the glTF's vertex order, which Godot's importer keeps): its positions
    (base + delta) and its normals (the base's turned by how the target turns the faces, summed per source vertex so
    a UV seam's halves agree). Godot blends them in NORMALIZED mode, base * (1 - sum w) + sum w * shape, which for
    normals is the linear blend the page gets by re-summing them (a RELATIVE shape's normal is made unit before it
    is added, so a small turn cannot be given that way). The skin
    surface (skin_mat) is split into regions by tri_mask (per triangle, its region; cover: per region, the indices in
    kit.items of the items that hide it): per region its triangles, the vertices they use (keep) and the shapes over
    those; Godot joins them into one surface again and hides a region by its index (kchar_skin.gdshader). Also the skin's 64 lowest vertices
    and how each target moves them (the ground). Layout: b'GSH1', u32 json length, json, pad to 4, blob."""
    j, b = glbio.read_glb(open(path, 'rb').read())
    blob, out = bytearray(), {'meshes': {}, 'whole': True}
    if cover is not None:
        out['cover'] = cover

    def vnormals(P, T, vid):
        f = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]])
        n = np.zeros((vid.max() + 1, 3))
        for k in range(3):
            for a in range(3):
                n[:, a] += np.bincount(vid[T[:, k]], f[:, a], minlength=len(n))
        n = n[vid]
        return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)

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
            NG = glbio.accessor(j, b, p['attributes']['NORMAL']).astype(float)
            prims.append((mat, P, vid, T, NG))
        moved = sorted({t for t in range(D.shape[0]) for _, _, vid, _, _ in prims if np.abs(D[t, vid]).max() > 2e-4})
        surfs = []
        for mat, P, vid, T, NG in prims:
            N0 = vnormals(P.astype(float), T, vid)
            sgn = np.where((N0 * NG).sum(1, keepdims=True) < 0, -1.0, 1.0)      # the file's winding, whichever way
            NT = {}
            for t in moved:
                n = NG + sgn * (vnormals(P + D[t, vid], T, vid) - N0)
                NT[t] = n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
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
                      'pos': [put(P[sel] + D[t, vid[sel]], np.float32) for t in moved],
                      'nrm': [put(NT[t][sel], np.float32) for t in moved]}
                if keep is not None:
                    sf['keep'] = put(keep, np.uint32)
                    sf['tris'] = [put(tris, np.uint32), int(len(tris))]
                surfs.append(sf)
        out['meshes'][prims[0][0]] = {'shapes': moved, 'surfaces': surfs}
    js = json.dumps(out, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    return b'GSH1' + struct.pack('<I', len(js)) + js + bytes(blob)


class NpzAlias:
    """morphs.npz with some keys standing for others (a mod's deltas are the base's)"""
    def __init__(self, npz, alias):
        self.npz, self.alias = npz, alias

    def __getitem__(self, k):
        return self.npz[self.alias.get(k, k)]

    def __contains__(self, k):
        return self.alias.get(k, k) in self.npz.files


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
    # the lower pair's joints (mods.py) move as the joints they copy
    alias = [(J[mods.lower(bn)], k) for k, bn in enumerate(bones) if mods.lower(bn) in J and mods.lower(bn) != bn]
    for t in range(D.shape[0]):
        rows = [[J[bn]] + [round(float(x), 5) for x in D[t, k]] for k, bn in enumerate(bones)
                if bn in J and np.abs(D[t, k]).max() > 1e-4]
        rows += [[i] + [round(float(x), 5) for x in D[t, k]] for i, k in alias if np.abs(D[t, k]).max() > 1e-4]
        if rows:
            joints[str(t)] = rows
    race0 = [float(x) for x in npz['race0']]
    copied = {i for i, _ in alias}
    follow = sorted(i for n, i in J.items() if n not in bones and i not in copied)   # joints the rig lacks (face points): ride their parent
    return {'targets': targets, 'morphs': sliders,
            'ancestry': {'african': anc.get('african'), 'asian': anc.get('asian'), 'caucasian': anc.get('caucasian'),
                         'base': race0},
            'morph_joints': joints, 'follow': follow}


def hands(c, J):
    """per hand, what the figure needs to hold a prop (tools/make_props.py): the grip frame in the hand bone's own
    space (origin in the closed hand, +Y along the handle out past the index finger, +Z the way the fingers point,
    +X out of the palm) and, per finger joint, the local rotation that closes the hand round a handle"""
    out = {}
    for side, S in (('R', 'Right'), ('L', 'Left'), ('R2', 'Right2'), ('L2', 'Left2')):
        if S + 'Hand' not in c.J:
            continue
        hand = c.jpos[c.J[S + 'Hand']]
        G = mp.grip_frame(c, S)
        X, Y = G[:3, 0], G[:3, 1]
        H = np.eye(4)
        H[:3, :3] = c.jrot[c.J[S + 'Hand']]
        H[:3, 3] = hand
        L = np.linalg.inv(H) @ G
        curls = {}
        for style, fingers in GRIP_STYLES.items():
            curl = curls[style] = []
            for f, ang in fingers:
                for k, a in enumerate(ang):
                    n = S + 'Hand%s%d' % (f, k + 1)
                    if n not in c.J or n not in J:
                        continue
                    i = c.J[n]
                    ch = S + 'Hand%s%d' % (f, k + 2)
                    d = (c.jpos[c.J[ch]] if ch in c.J else c.jpos[i] + (c.jpos[i] - c.jpos[c.parents[i]])) - c.jpos[i]
                    ax = Y if f != 'Thumb' else np.cross(d / np.linalg.norm(d), X)
                    ax = ax / np.linalg.norm(ax)
                    th = math.radians(a)
                    Gr = rot_axis(ax, th)
                    if (Gr @ d).dot(X) < d.dot(X):          # bend toward the palm, not away
                        Gr = rot_axis(ax, -th)
                    W = c.jrot[i]
                    curl.append([J[n]] + [round(float(x), 6) for x in glbio.mat_quat(W.T @ Gr @ W)])
        out[side] = {'bone': J[S + 'Hand'], 'grip': [round(float(x), 6) for x in L[:3, 3]] +
                     [round(float(x), 6) for x in glbio.mat_quat(L[:3, :3])], 'curls': curls,
                     'arm': [J[S + 'Arm'], J[S + 'ForeArm'], J[S + 'Hand']]}
    return out


# per grip style, per finger, how far (degrees) each joint closes: fist round a handle; trigger leaves the index
# finger along a gun's barrel; wide wraps a cup
_FIST = (('Index', (62, 78, 45)), ('Middle', (66, 80, 45)), ('Ring', (70, 80, 45)), ('Pinky', (74, 80, 45)),
         ('Thumb', (20, 30, 25)))
# headgear that covers the hair (KCHAR.parts leaves the hair out), and library items that hang loose over the legs
COVERS_HAIR = {'voth_m_trade_wrap', 'voth_f_trade_wrap', 'iziz_m_peasant_hood', 'iziz_f_peasant_hood', 'beast_m_trade_hat', 'beast_f_trade_hat',
               'beast_m_noble_horns', 'beast_f_noble_wings', 'hykk_m_trade_helm', 'hykk_f_trade_helm', 'hykk_m_peasant_hat', 'hykk_f_peasant_hat',
               'dalab_m_trade_cap', 'dalab_f_trade_cap', 'dalab_m_noble_mitre', 'dalab_f_noble_mitre', 'yuni_m_peasant_hat', 'yuni_f_peasant_wrap',
               'yuni_m_trade_kufi', 'yuni_f_trade_gele', 'yuni_m_noble_hyperboloid', 'yuni_f_noble_hyperboloid',
               'rep_m_peasant_cap', 'rep_f_peasant_platok', 'rep_m_trade_ushanka', 'rep_f_trade_ushanka', 'rep_m_noble_papakha',
               'rep_f_noble_papakha', 'rep_m_fest_peasant_cap', 'rep_f_fest_peasant_platok', 'rep_m_fest_trade_ushanka',
               'rep_m_fest_noble_papakha'}
# the clothing tools/make_garments.py makes, by prefix: the people whose strangers draw it
CULTURE = {'giant_dalab_': 'giants', 'giant_free_': 'free_giants', 'rep_': 'iron_republic', 'voth_': 'chichani', 'iziz_': 'izani', 'beast_': 'beast_riders', 'hykk_': 'hykkousoi', 'dalab_': 'dalabites',
           'yuni_': 'yuni'}


def culture_of(iid):
    return next((v for k, v in CULTURE.items() if iid.startswith(k)), None)


def hangs(it):
    """a made garment that hangs from the waist or shoulders (a tunic, coat, robe or skirt, not trousers): its legs'
    weights pool below the crotch, it is pushed out of the legs, and it hides no skin below half the body's height"""
    return culture_of(it['id']) is not None and it['slot'] in ('torso', 'legs') and 'trousers' not in it['id']
LOOSE = {'mindfront_kimono', 'toigo_long_full_skirt', 'toigo_tiered_mini_skirt'}
GRIP_STYLES = {'fist': _FIST,
               # a bow drawn with three fingers on the string, the thumb and little finger tucked
               'draw': (('Index', (30, 40, 25)), ('Middle', (32, 42, 25)), ('Ring', (40, 50, 30)), ('Pinky', (75, 85, 50)),
                        ('Thumb', (25, 35, 30))),
               'trigger': (('Index', (14, 22, 10)),) + _FIST[1:],
               'wide': tuple((f, tuple(round(a * 0.55) for a in ang)) for f, ang in _FIST)}


def rot_axis(a, t):
    a = a / np.linalg.norm(a)
    K = np.array([[0, -a[2], a[1]], [a[2], 0, -a[0]], [-a[1], a[0], 0]])
    return np.eye(3) + math.sin(t) * K + (1 - math.cos(t)) * K @ K


def main():
    body, src = sys.argv[1], sys.argv[2]
    name = 'mpfb_' + body
    big = body == 'giant'              # giant.py: the man's export, made big
    pieces = os.path.join(HERE, 'pieces', name)
    data = os.path.join(HERE, 'data', name)
    if os.path.isdir(pieces):          # nothing left over from items no longer in the export
        shutil.rmtree(pieces)
    os.makedirs(pieces, exist_ok=True)
    os.makedirs(data, exist_ok=True)
    man = json.load(open(os.path.join(src, 'manifest.json')))
    dg = json.load(open(os.path.join(src, 'delete_groups.json')))
    roles = turn_glb(os.path.join(src, 'base.glb'), os.path.join(pieces, 'base.glb'),
                     role=lambda m: 'skin' if m.split('.')[-1] in SKIN_PARTS else 'hair' if 'eyebrow' in m else
                     'eye' if EYES in m else None)
    # every body's skeleton has a second pair of arms' joints, drawn only when a mod is worn (mods.py)
    print(name, 'lower-arm joints:', len(mods.add_joints(os.path.join(pieces, 'base.glb'))))
    c = mp.load(os.path.join(pieces, 'base.glb'))
    c.J = {n: i for i, n in enumerate(c.joints)}
    mat, BP, BT = body_primitive(os.path.join(pieces, 'base.glb'))
    tree = cKDTree(BP)
    contact = body_contact(os.path.join(pieces, 'base.glb'))
    items = []
    man['items'] = [it for it in man['items'] if it['id'] not in SKIP.get(body, ())]
    if big:
        man['items'] = [it for it in man['items'] if giant.wears(it['id'])]
    crotch = c.jpos[c.J['LeftUpLeg']][1] - 0.06
    # the mods (mods.py: a second pair of arms, flesh or cybernetic; rib gills), worn like items in slot 'mods'
    mod_items, mod_roles = mods.make_all(os.path.join(pieces, 'base.glb'), pieces, name)
    roles.update(mod_roles)
    print(name, 'mods:', ', '.join(m['id'] for m in mod_items))
    for it in man['items']:
        cl = None
        if it.get('cloth') and os.path.exists(os.path.join(src, it['cloth'])):
            cl = {'id': it['id'], 'spec': json.load(open(os.path.join(src, it['cloth'])))}
        r = turn_glb(os.path.join(src, it['glb']), os.path.join(pieces, it['id'] + '.glb'),
                     role=lambda m: 'hair' if it['slot'] in ('hair', 'beard') else None,
                     skirt=crotch if hangs(it) else None, cloth=cl, body=contact,
                     head_above=c.jpos[c.J['Neck']][1] + 0.06 if it['slot'] == 'head' else None)
        roles.update(r)
        if it['id'] in DECIMATE:
            print('%-8s decimated %s: %d -> %d triangles' % ((name, it['id']) + decimate.decimate_glb(os.path.join(pieces, it['id'] + '.glb'), DECIMATE[it['id']])))
        entry = {'id': it['id'], 'name': RENAME.get(it['id'], it['name']), 'slot': it['slot'], 'glb': 'pieces/%s/%s.glb' % (name, it['id'])}
        if cl and cl['spec'].get('arms') == 4:
            # a four-armed top (make_garments.py four_armed): only a four-armed body wears it (KCHAR.fits); its lower
            # sleeves follow the lower arms
            entry['arms'] = 4
            print('%-8s %s: %d vertices on the lower arms' % (name, it['id'], mods.fit_four(os.path.join(pieces, it['id'] + '.glb'),
                  os.path.join(pieces, 'mod_arms_flesh.glb'), cl['spec'].get('lower', []))))
            # the lower sleeves as a piece of their own, which a cybernetic pair leaves off
            if mods.split_lower(os.path.join(pieces, it['id'] + '.glb'), os.path.join(pieces, it['id'] + '.sleeves2.glb'),
                                cl['spec'].get('lower', [])):
                entry['sleeves2'] = 'pieces/%s/%s.sleeves2.glb' % (name, it['id'])
        if cl and cl.get('out'):
            entry['cloth'] = cl['out']
        if culture_of(it['id']):
            entry['culture'] = culture_of(it['id'])   # a stranger of another people never draws it (KCHAR.stranger)
        if big and it['slot'] not in ('hair', 'beard'):
            # on the giant: the giants' own clothes keep their people (giant_dalab_, giant_free_); the man's others
            # are the Dalab giants'
            entry['culture'] = culture_of(it['id']) if it['id'].startswith(giant.PREFIX) else 'giants'
        if it['id'] in COVERS_HAIR:
            entry['covers_hair'] = True
        if it['slot'] == 'torso' and encloses(c, os.path.join(pieces, it['id'] + '.glb')):
            entry['tucks'] = True          # closed round the waist: a waistband under it is drawn in (KCHAR tuck)
        if it['id'] in LOOSE or hangs(it):
            entry['loose'] = True          # the figure pushes its vertices out of the legs (50-figure.js clothPush)
            if it['slot'] == 'torso' and all_triangles(os.path.join(pieces, it['id'] + '.glb'))[0][:, 1].min() < c.jpos[c.J['LeftLeg']][1]:
                entry['long'] = True       # below the knees: trousers under it are drawn in to the legs (KCHAR squeeze)
        pts = np.array(dg.get(it['id'], []), float)
        if len(pts):
            # Blender world (Z up) -> glTF (Y up: x, z, -y) -> half a turn
            g = np.stack([pts[:, 0], pts[:, 2], -pts[:, 1]], 1) @ RY.T
            d, k = tree.query(g)
            hit = np.zeros(len(BP), bool)
            hit[k[d < 1e-3]] = True
            # MPFB's mask drops a face when any of its vertices is in the group
            tris = np.nonzero(hit[BT].any(1))[0]
            if it['slot'] == 'torso':
                # and what the top lies close over besides: a delete group stops short of the shoulders and the chest
                # in places, and the skin there came through the shirt (a loose one hides nothing below mid-height,
                # as hangs() below)
                more = covered(BP, BT, os.path.join(pieces, it['id'] + '.glb'))
                if it['id'] in LOOSE:
                    top = BP[:, 1].max() - BP[:, 1].min()
                    more = more[(BP[BT[more], 1] > BP[:, 1].min() + 0.5 * top).all(1)]
                tris = np.union1d(tris, more)
            entry['hide'] = bits(len(BT), tris)
            entry['hides'] = int(len(tris))
        elif it['slot'] in ('torso', 'legs', 'feet'):
            tris = covered(BP, BT, os.path.join(pieces, it['id'] + '.glb'))
            if hangs(it):
                # made clothing (make_garments.py) that hangs loose below the hips: a flap or a skirt that lies over a
                # thigh at rest leaves it as the leg swings, so it hides no skin below half the body's height
                top = BP[:, 1].max() - BP[:, 1].min()
                tris = tris[(BP[BT[tris], 1] > BP[:, 1].min() + 0.5 * top).all(1)]
            entry['hide'] = bits(len(BT), tris)
            entry['hides'] = int(len(tris))
            entry['hide_by'] = 'rays'          # no delete group in the asset: covered() found it
        items.append(entry)
        print('%-8s %-6s %-34s hides %5d' % (name, it['slot'], it['id'], entry.get('hides', 0)))
    items += mod_items
    npz_path = os.path.join(src, 'morphs.npz')
    morph = {}
    if os.path.exists(npz_path):
        # a mod's vertices name the MakeHuman vertex whose deltas move them: their deltas are the base's
        npz = NpzAlias(np.load(npz_path), {'d_' + m['id']: 'd_base' for m in mod_items})
        always = man.get('always', [])
        ents = mesh_entries(os.path.join(pieces, 'base.glb'), lambda n: 'base' if n == 'Human' else
                            '_always%d' % always.index(n) if n in always else None)
        open(os.path.join(pieces, 'base.morph.bin'), 'wb').write(pack_morphs(ents, npz))
        for it in man['items'] + mod_items:
            for f in (it['id'], it['id'] + '.sleeves2'):
                if os.path.exists(os.path.join(pieces, f + '.glb')):
                    ents = mesh_entries(os.path.join(pieces, f + '.glb'), lambda n: it['id'])
                    open(os.path.join(pieces, f + '.morph.bin'), 'wb').write(pack_morphs(ents, npz))
        # the Godot twin's blend shapes (godot_shapes): the base's skin split by which items cover each triangle
        # (a region per set of covering items: tri_mask is the region of each triangle, cover the items of each region,
        # by their index in kit.items; there are more items than a 64-bit mask holds)
        hid = [i for i, e in enumerate(items) if 'hide' in e]
        H = np.zeros((len(BT), len(hid)), bool)
        for k, i in enumerate(hid):
            H[:, k] = np.unpackbits(np.frombuffer(base64.b64decode(items[i]['hide']), np.uint8), bitorder='little')[:len(BT)].astype(bool)
        rows, tri_mask = np.unique(H, axis=0, return_inverse=True)
        cover = [[hid[k] for k in np.nonzero(r)[0]] for r in rows]
        open(os.path.join(pieces, 'base.gshapes.bin'), 'wb').write(godot_shapes(
            os.path.join(pieces, 'base.glb'), lambda n: 'base' if n == 'Human' else
            '_always%d' % always.index(n) if n in always else None, npz, tri_mask.reshape(-1), mat, cover))
        for it in man['items'] + mod_items:
            for f in (it['id'], it['id'] + '.sleeves2'):
                if os.path.exists(os.path.join(pieces, f + '.glb')):
                    open(os.path.join(pieces, f + '.gshapes.bin'), 'wb').write(godot_shapes(
                        os.path.join(pieces, f + '.glb'), lambda n: it['id'], npz))
        morph = True
        print(name, '%.1f MB of morph deltas' % (sum(os.path.getsize(os.path.join(pieces, f)) for f in os.listdir(pieces)
                                          if f.endswith('.morph.bin')) / 1e6))
    if big:
        # the man's clips, as they are: the giant is his skeleton plus the lower arms, which no clip moves
        clips = json.load(open(os.path.join(HERE, 'data', 'mpfb_male', 'skeleton.json')))['clips']
    else:
        clips = mp.write_anims(os.path.join(pieces, 'anims.glb'), c)
    names, parents, jnodes, W = mp.skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in mp.FACE})
    if morph:
        morph = morph_kit(npz, {n['name']: i for i, n in enumerate(jnodes)})
    json.dump({'joints': [{'name': n['name'], 'parent': parents[i], 't': n['translation'], 'r': n['rotation']}
                          for i, n in enumerate(jnodes)], 'clips': clips,
               'hands': hands(c, {n['name']: i for i, n in enumerate(jnodes)}),
               'colliders': colliders(c, {n['name']: i for i, n in enumerate(jnodes)}, os.path.join(pieces, 'base.glb'),
                                      npz if morph else None)},
              open(os.path.join(data, 'skeleton.json'), 'w'), indent=1)
    kit = {'body': name, 'style': 'mpfb', 'label': 'MakeHuman ' + body, 'base_glb': 'pieces/%s/base.glb' % name,
           'base_material': mat, 'base_tris': int(len(BT)), 'items': items, 'morph': morph,
           'tint': {'roles': roles, 'gain': {k: round(1 / srgb_lin(v), 4) for k, v in TINT_MEAN.items()}}}
    if big:
        kit.update(giant.kit_extra())
    json.dump(kit, open(os.path.join(data, 'kit.json'), 'w'), indent=1)
    print(name, 'height %.2f m' % (c.jpos[c.J['HeadTop_End']][1] if 'HeadTop_End' in c.J else -1), len(items), 'items')


if __name__ == '__main__':
    main()
