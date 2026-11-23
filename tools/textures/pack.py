#!/usr/bin/env python3
"""Pack a build's library textures (core/materials/PLAN.md, GODOT-PLAN.md Phase 3).

    python3 tools/textures/pack.py settlements/girder          # reads materials.json, writes tex/
    python3 tools/textures/pack.py settlements/girder --check  # says whether tex/ matches materials.json
    python3 tools/textures/pack.py settlements/xanadu --page settlements/thalaba/dist/thalaba.html --out <dir>
                                                               # only the families that page keeps (tools/textures/page_pack.py)

A build's `materials.json` is its adapter: per material family the library set it uses and how (scale in world
metres per tile, how much of the set's own colour survives the build's tint, how much to lift roughness, metal).
This script reads each set from core/materials/library/<lib>/ (1024 px albedo.jpg, normal.jpg, roughness.png),
and writes small processed copies into <build>/tex/ (WebP, `size` px, default 512) plus tex/pack.json.

The build reads only those committed files (build.py inlines them as data URLs), so the build stays
deterministic on every machine; this script is run again only when materials.json or a library set changes.
Image encoders differ by version, so a re-pack on another machine may change bytes: commit tex/ with the change.

Processing, per family:
  albedo   tint mode (default): luminance L and colour C, both normalised so the mean luminance is `tint.mean`
           (default 0.78, the brightness of the procedural greys the builds were tuned on); out = L*(1-keep) + C*keep.
           keep 0 is a pure grey detail map that the vertex or instance colour colours; keep 1 keeps the set's hue.
           tint.contrast (default 1) scales each pixel's distance from the mean first: a set that reads flat at a
           distance gets its furrows and seams back. tint.colour ('#rrggbb', optional) gives the grey part a hue at the
           same brightness: for builds whose procedural maps carry their colour (Reed Lake's straw), so a grey set
           matches the map it replaces under the same instance tint.
  normal   resized and renormalised (OpenGL convention, as the library and Godot use); written as LOSSLESS WebP of its
           channels kept to 6 bits (NORMAL_BITS: 0.7 degrees mean error, 40% smaller than 8 bits)
  rough    r + (1 - r) * roughLift: the scan sets read wet under a sun with no environment map
  lib      a library id, or a pattern sheet as 'patterns/<culture>/<name>'
  size     per family: overrides the build's map size; [w, h] keeps a sheet's shape (a dome's sky, not a tile)
  mapOnly  `"mapOnly": true` writes the colour map only (a sheet the build uses as a plain texture, not a lit material)
  optional a family with `"optional": true` is skipped (with a note) while its library set does not exist yet: the build
           then runs on whatever it did before (fauna sheets are wired this way before they are generated)
  cell     `"cell": [x0, y0, x1, y1]` (fractions from the sheet's top left): the host shows one cell of a card sheet (a
           single plant from a nine-plant sheet); passed through to the pack entry
  base     `"base": "bottom"` (top, left, right, centre): the edge of the cell (or the whole image) where its plant attaches;
           core/biome's BIO.def turns a geometry that holds a plant by one end (frond, ribbon, hang, clump) so its own end
           meets it, and spans the plant once down a frond or ribbon. tools/textures/check_cells.py proposes cell and base
  card     (record.kind 'card', from tools/textures/cards.py) an alpha cut-out: RGBA WebP with lossless alpha
           and the colour kept under it; no normal or roughness map; brightness measured over the opaque pixels.
           tint.mean null keeps the set's own brightness (a colour card such as a flower).
  own      `"own": true` marks a family only the kit's own page uses (the variants of a card, a surface a kit-only fragment
           swaps in): tools/textures/matlib_pack.py leaves it out of the pack a host that vendors the kit inlines, unless the
           kit's own build.py asks for it (`fragment(HERE, key, own=True)`), so that host's page keeps its bytes.
  height   `"height": true` packs the set's height map (its source's `disp` extra, saved in the set as height.png, or the
           file meta.json 'maps.heightMap' names) into the colour map's ALPHA: an RGBA WebP whose alpha is the height about
           its mean (0.5, the 1st to 99th percentile spanning one unit, clamped to 0.02..1, as KGROUND's luminance height
           is). core/terrain's KGROUND reads it with a layer's `h: {from: 'a'}`; the pack entry says `"height": true`.
           A set without a height map is packed as before, with a note, and the entry has no `height` (keep `h` on lum).

A build's materials.json may also hold `"decals": { "<texture id>": { "size": 1024, "culture": "xanadu" } }`: delivered PICTURES
for the catalog's painted panels (core/catalog/krator-furniture-core.js mkDecal, whose key is the texture id). Each is packed
from the set's albedo at its OWN aspect (the long side `size` px, default 1024), its colours as they are (no tint), into
tex/decal.<id>.albedo.webp and pack.json "decals" (written only when one is packed). A decal whose set is not delivered yet
is skipped with a note: the page keeps the painted stand-in. `culture` lets kits/catalog/furniture_bundle.py inline only the
decals of the cultures a build bundles.
Requires numpy and Pillow.
"""
import argparse, base64, hashlib, io, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib  # noqa: E402

LIB = os.path.join(ROOT, 'core', 'materials', 'library')
MATS = os.path.join(ROOT, 'core', 'materials')


def set_dir(lib):
    """A family's set: a library id (core/materials/library/<id>) or a pattern sheet ('patterns/<culture>/<name>')."""
    return os.path.join(MATS, lib) if lib.startswith('patterns/') else os.path.join(LIB, lib)


def sha1(path):
    return hashlib.sha1(open(path, 'rb').read()).hexdigest()


def load(path, size, mode):
    if buildlib.is_pointer(path):    # a pack written from a pointer would be black in every page that takes it
        buildlib.refuse_pointer(path, 'tools/textures/pack.py')
    im = Image.open(path).convert(mode)
    wh = tuple(size) if isinstance(size, (list, tuple)) else (size, size)
    if im.size != wh:
        if mode == 'RGBA':      # Pillow resizes RGBA premultiplied, which blanks the colour under alpha 0 (a card's bleed)
            rgb = im.convert('RGB').resize(wh, Image.LANCZOS)
            al = im.getchannel('A').resize(wh, Image.LANCZOS)
            im = Image.merge('RGBA', rgb.split() + (al,))
        else:
            im = im.resize(wh, Image.LANCZOS)
    return np.asarray(im).astype(np.float64) / 255.0


NORMAL_BITS = 6   # a normal's channels kept to 6 bits (each value the middle of its step): lossless WebP of it is 40%
                  # smaller than of 8 bits, for 0.7 degrees mean error (1.3 at the 99th percentile; brick at 512 px,
                  # 2026-10-14). The pages were three times their lossy size with 8-bit lossless normals


def quantize(a, bits):
    s = 8 - bits
    return a if s <= 0 else (((a >> s) << s) + (1 << (s - 1))).astype(np.uint8)


def webp(arr, quality, mode, lossless=False, bits=8):
    a = quantize(np.clip(np.rint(arr * 255.0), 0, 255).astype(np.uint8), bits)
    im = Image.fromarray(a, mode)
    buf = io.BytesIO()
    if lossless:
        im.save(buf, 'WEBP', lossless=True, quality=100, method=6)
    else:
        im.save(buf, 'WEBP', quality=quality, method=6, alpha_quality=100, exact=(mode == 'RGBA'))
    return buf.getvalue()


def webp_bytes(u8_arr, quality, mode, lossless=False):
    im = Image.fromarray(u8_arr, mode)
    buf = io.BytesIO()
    if lossless:
        im.save(buf, 'WEBP', lossless=True, quality=100, method=6)
    else:
        im.save(buf, 'WEBP', quality=quality, method=6, alpha_quality=100, exact=(mode == 'RGBA'))
    return buf.getvalue()


def reconstruct_height_from_normal(n):
    """Exact periodic Frankot-Chellappa integration of a tangent-space OpenGL normal map (+X right, +Y up, +Z out)
    inverting process.py's central-difference operator on the torus."""
    H, W = n.shape[:2]
    nz = np.maximum(n[..., 2], 0.08)
    p = -n[..., 0] / nz
    q = n[..., 1] / nz
    sx = np.sin(2.0 * np.pi * np.fft.fftfreq(W))[None, :]
    sy = np.sin(2.0 * np.pi * np.fft.fftfreq(H))[:, None]
    denom = sx * sx + sy * sy
    denom[0, 0] = 1.0
    fh = (-1j * sx * np.fft.fft2(p) - 1j * sy * np.fft.fft2(q)) / denom
    fh[0, 0] = 0.0
    hm = np.real(np.fft.ifft2(fh))
    lo, hi = np.percentile(hm, [1, 99])
    span = max(float(hi - lo), 1e-4)
    return np.clip(0.5 + (hm - hm.mean()) / span, 0.02, 1.0)


def compute_cavity_from_normal(n):
    """Concave-only pore/joint occlusion (M4: cavity never brightens or darkens convex ridges).
    Laplacian d2h/dx2 + d2h/dy2 > 0 marks local minima (mortar joints, pits, furrows)."""
    nz = np.maximum(n[..., 2], 0.08)
    p = -n[..., 0] / nz
    q = n[..., 1] / nz
    lap1 = 0.5 * ((np.roll(p, -1, 1) - np.roll(p, 1, 1)) + (np.roll(q, -1, 0) - np.roll(q, 1, 0)))
    lap3 = 0.25 * ((np.roll(p, -3, 1) - np.roll(p, 3, 1)) + (np.roll(q, -3, 0) - np.roll(q, 3, 0))) / 3.0
    conc = np.maximum(0.0, 0.55 * lap1 + 0.45 * lap3)
    p98 = float(np.percentile(conc, 98))
    if p98 < 0.015:
        return np.ones(n.shape[:2], dtype=np.float64)
    return np.clip(1.0 - 0.62 * (conc / max(p98, 0.05)), 0.18, 1.0)


def compute_wear_from_normal(n):
    """Convex-only edge wear (M4, the twin of compute_cavity_from_normal): a negative Laplacian of the integrated height marks
    ridges and arrises, the edges a hand or a boot wears pale. 0 none .. 1 most worn."""
    nz = np.maximum(n[..., 2], 0.08)
    p = -n[..., 0] / nz
    q = n[..., 1] / nz
    lap1 = 0.5 * ((np.roll(p, -1, 1) - np.roll(p, 1, 1)) + (np.roll(q, -1, 0) - np.roll(q, 1, 0)))
    lap3 = 0.25 * ((np.roll(p, -3, 1) - np.roll(p, 3, 1)) + (np.roll(q, -3, 0) - np.roll(q, 3, 0))) / 3.0
    conv = np.maximum(0.0, -(0.55 * lap1 + 0.45 * lap3))
    p98 = float(np.percentile(conv, 98))
    if p98 < 0.015:
        return np.zeros(n.shape[:2], dtype=np.float64)
    return np.clip(conv / max(p98, 0.05), 0.0, 1.0)


def compute_mip_variance(n):
    """M2 Specular AA: Toksvig/Kaplanyan normal variance (1 - ||E[n]||) / ||E[n]|| per mip level from float normals
    before quantising (zero image bytes; shared in pack.json between web and Godot)."""
    cur = n.astype(np.float64)
    out = [0.0]
    while cur.shape[0] >= 2 and cur.shape[1] >= 2 and len(out) < 10:
        h2, w2 = cur.shape[0] // 2, cur.shape[1] // 2
        cur = 0.25 * (cur[0:h2 * 2:2, 0:w2 * 2:2] + cur[1:h2 * 2:2, 0:w2 * 2:2] +
                      cur[0:h2 * 2:2, 1:w2 * 2:2] + cur[1:h2 * 2:2, 1:w2 * 2:2])
        rlen = np.clip(np.linalg.norm(cur, axis=2), 1e-3, 1.0)
        var = float(np.mean((1.0 - rlen) / rlen))
        out.append(round(var, 5))
    return out


def oct_encode_u8(n):
    """Cigolle et al. (JCGT 2014, Sec. 3.2) 8-bit Hemisphere Octahedral normal encoding into uint8 [H, W, 2].
    Maps the upper hemisphere (nz >= 0) bijectively onto [-1, 1]^2 (100% codeword utilisation, branchless decode)."""
    nz = np.maximum(n[..., 2], 0.0)
    l1 = np.maximum(np.abs(n[..., 0]) + np.abs(n[..., 1]) + nz, 1e-8)
    px = n[..., 0] / l1
    py = n[..., 1] / l1
    eu = px + py
    ev = px - py
    u = np.clip(np.rint((eu * 0.5 + 0.5) * 255.0), 0, 255).astype(np.uint8)
    v = np.clip(np.rint((ev * 0.5 + 0.5) * 255.0), 0, 255).astype(np.uint8)
    return np.stack([u, v], axis=-1)


def oct_decode_u8(uv_u8):
    """Decode uint8 [H, W, 2] Hemisphere Octahedral normals back to unit float64 [H, W, 3] (branchless)."""
    e = uv_u8.astype(np.float64) / 255.0 * 2.0 - 1.0
    vx = (e[..., 0] + e[..., 1]) * 0.5
    vy = (e[..., 0] - e[..., 1]) * 0.5
    vz = np.maximum(0.0, 1.0 - np.abs(vx) - np.abs(vy))
    out = np.stack([vx, vy, vz], axis=-1)
    return out / np.maximum(np.linalg.norm(out, axis=-1, keepdims=True), 1e-8)


def encode_normal_rg(n, enc):
    """Encode float unit normal [H, W, 3] into uint8 [H, W, 2] and return (rg_u8, n_decoded)."""
    if enc == 'oct8':
        rg = oct_encode_u8(n)
        return rg, oct_decode_u8(rg)
    bits = 6 if enc == 'xy6' else 8
    raw = quantize(np.clip(np.rint((n[..., :2] * 0.5 + 0.5) * 255.0), 0, 255).astype(np.uint8), bits)
    xy = raw.astype(np.float64) / 255.0 * 2.0 - 1.0
    nz = np.sqrt(np.maximum(0.0, 1.0 - xy[..., 0] ** 2 - xy[..., 1] ** 2))
    dec = np.stack([xy[..., 0], xy[..., 1], nz], axis=-1)
    dec /= np.maximum(np.linalg.norm(dec, axis=-1, keepdims=True), 1e-8)
    return raw, dec


def normal_error_stats(n_ref, n_dec):
    dots = np.clip(np.sum(n_ref * n_dec, axis=-1), -1.0, 1.0)
    deg = np.degrees(np.arccos(dots))
    return {
        'meanDeg': round(float(deg.mean()), 4),
        'p95Deg': round(float(np.percentile(deg, 95)), 4),
        'p99Deg': round(float(np.percentile(deg, 99)), 4),
        'maxDeg': round(float(deg.max()), 4),
    }


def assert_pack_physics(fam, cfg, card, alpha_mode, h_arr, n_ref, n_dec, r_arr, cav_arr):
    """Section 9.2 Gate 1: channel physics check at write time (honouring flat declarations and never putting height in a card)."""
    if card and alpha_mode == 'height':
        raise ValueError('%s: Gate 1 violation — height must never overwrite alpha on a cut-out card' % fam)
    for nm, arr in (('height', h_arr), ('normal', n_dec), ('roughness', r_arr), ('cavity', cav_arr)):
        if arr is not None and not np.all(np.isfinite(arr)):
            raise ValueError('%s: Gate 1 violation — NaN/Inf in %s' % (fam, nm))
    if r_arr is not None and (float(r_arr.min()) < 0.0 or float(r_arr.max()) > 1.0001):
        raise ValueError('%s: Gate 1 violation — roughness outside [0, 1]' % fam)
    if n_ref is not None and n_dec is not None:
        st = normal_error_stats(n_ref, n_dec)
        if st['meanDeg'] > 3.5:
            raise ValueError('%s: Gate 1 violation — normal quantisation mean error %.2f deg > 3.5 deg' % (fam, st['meanDeg']))
    if h_arr is not None and not cfg.get('flat') and not card:
        span = float(np.percentile(h_arr, 99) - np.percentile(h_arr, 1))
        if span < 0.02:
            raise ValueError('%s: Gate 1 violation — height p99-p01 %.4f < 0.02 without "flat": true' % (fam, span))


def process(fam, cfg, size, pack_format=1, normal_enc='xy6'):
    lib = cfg['lib']
    d = set_dir(lib)
    sz = cfg.get('size', size)                # a family may ask for a smaller map (a detail map on small furniture), or [w, h]
    size = [int(v) for v in sz] if isinstance(sz, list) else int(sz)
    meta = json.load(open(os.path.join(d, 'meta.json'), encoding='utf-8'))
    rec = meta.get('record', {})
    # map paths come from meta.json 'maps' (a neutral copy points at its sibling's normal and roughness)
    mp = meta.get('maps') or {}
    path = lambda k, default: os.path.normpath(os.path.join(d, mp.get(k, default)))
    pa, pn, pr = path('map', 'albedo.jpg'), path('normalMap', 'normal.jpg'), path('roughnessMap', 'roughness.png')
    out, files = {}, {}
    card = rec.get('kind') == 'card'
    # albedo (a card keeps its alpha; its statistics are taken over the opaque pixels only)
    a = load(pa, size, 'RGBA' if card else 'RGB')
    alpha = a[..., 3] if card else None
    if card:
        a = a[..., :3]
    t = cfg.get('tint', {})
    keep = float(t.get('keep', 0.0))
    L = a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722
    m = float(L[alpha > 0.5].mean() if card else L.mean()) or 1.0
    target = float(t['mean']) if t.get('mean') is not None else m   # mean null: keep the set's own brightness
    con = float(t.get('contrast', 1.0))            # >1 deepens the set's own light and dark around its mean
    k = (m + (L - m) * con) / np.maximum(L, 1e-4)  # per-pixel factor that applies the contrast to L and to the colour
    grey = np.repeat((L * k / m * target)[..., None], 3, axis=2)
    if t.get('colour'):   # a hue for the grey part: the procedural map's mean colour, at the same mean brightness
        hx = t['colour'].lstrip('#')
        c = np.array([int(hx[i:i + 2], 16) / 255.0 for i in (0, 2, 4)])
        grey = grey * (c / max(float(c @ np.array([0.2126, 0.7152, 0.0722])), 1e-4))
    col = a * k[..., None] / m * target
    rgb = grey * (1 - keep) + col * keep
    ph = path('heightMap', 'height.png')
    has_lit = os.path.isfile(pn) and not card and not cfg.get('mapOnly')

    if pack_format == 2:
        n_float, n_dec, r_final, cav_arr, h_arr, mip_var = None, None, None, None, None, None
        if has_lit:
            n_float = load(pn, size, 'RGB') * 2.0 - 1.0
            n_float /= np.maximum(np.linalg.norm(n_float, axis=2, keepdims=True), 1e-6)
            mip_var = compute_mip_variance(n_float)
            cav_arr = compute_cavity_from_normal(n_float)
            if os.path.isfile(ph):
                hm = load(ph, size, 'L')
                lo, hi = np.percentile(hm, [1, 99])
                h_arr = np.clip(0.5 + (hm - hm.mean()) / max(float(hi - lo), 1e-4), 0.02, 1.0)
                h_from = 'heightMap'
            else:
                h_arr = reconstruct_height_from_normal(n_float)
                h_from = 'normalPoisson'
            if os.path.isfile(pr):
                r_raw = load(pr, size, 'L')
                lift = float(cfg.get('roughLift', 0.0))
                r_final = np.clip(r_raw + (1.0 - r_raw) * lift, 0.0, 1.0)
            else:
                r_final = np.full(n_float.shape[:2], 0.85, dtype=np.float64)
            rg_u8, n_dec = encode_normal_rg(n_float, normal_enc)
            r_u8 = quantize(np.clip(np.rint(r_final * 255.0), 0, 255).astype(np.uint8), 7 if normal_enc == 'xy6' else 8)
            c_u8 = quantize(np.clip(np.rint(cav_arr * 255.0), 0, 255).astype(np.uint8), 7 if normal_enc == 'xy6' else 8)
            nrc_u8 = np.concatenate([rg_u8, r_u8[..., None], c_u8[..., None]], axis=-1)
            out['nrcMap'] = webp_bytes(nrc_u8, 100, 'RGBA', lossless=True)
        if card:
            alpha_mode = 'cutout'
            out['map'] = webp(np.concatenate([rgb, alpha[..., None]], -1), 85, 'RGBA')
        elif h_arr is not None:
            alpha_mode = 'height'
            out['map'] = webp(np.concatenate([rgb, h_arr[..., None]], -1), 82, 'RGBA')
        else:
            alpha_mode = 'none'
            out['map'] = webp(rgb, 82, 'RGB')
        assert_pack_physics(fam, cfg, card, alpha_mode, h_arr, n_float, n_dec, r_final, cav_arr)
        height = (alpha_mode == 'height')
    else:
        height = bool(cfg.get('height')) and not card and os.path.isfile(ph)
        if cfg.get('height') and not height:
            print('note: %s asks for a height channel but %s has no height map (%s); packed without one' % (fam, lib, os.path.basename(ph)))
        if card:
            out['map'] = webp(np.concatenate([rgb, alpha[..., None]], -1), 85, 'RGBA')
        elif cfg.get('pom') and has_lit:   # M3: the height for the parallax march in the colour map's alpha (the set's own, else
            n_pom = load(pn, size, 'RGB') * 2 - 1   # integrated from its normals); a masonry family's pomDepth says how deep
            n_pom /= np.maximum(np.linalg.norm(n_pom, axis=2, keepdims=True), 1e-6)
            if os.path.isfile(ph):
                hm = load(ph, size, 'L')
                lo, hi = np.percentile(hm, [1, 99])
                h = np.clip(0.5 + (hm - hm.mean()) / max(float(hi - lo), 1e-4), 0.02, 1.0)
            else:
                h = reconstruct_height_from_normal(n_pom)
            out['map'] = webp(np.concatenate([rgb, h[..., None]], -1), 82, 'RGBA')
        elif height:          # the height in the colour map's alpha, for KGROUND's h: {from: 'a'}
            hm = load(ph, size, 'L')
            lo, hi = np.percentile(hm, [1, 99])
            h = np.clip(0.5 + (hm - hm.mean()) / max(float(hi - lo), 1e-4), 0.02, 1.0)
            out['map'] = webp(np.concatenate([rgb, h[..., None]], -1), 82, 'RGBA')
        else:
            out['map'] = webp(rgb, 82, 'RGB')
        # normal
        if has_lit:
            n = load(pn, size, 'RGB') * 2 - 1
            n /= np.maximum(np.linalg.norm(n, axis=2, keepdims=True), 1e-6)
            # lossless: lossy WebP is always 4:2:0, which halves the X and Y the normal keeps in red and green (measured on
            # wood.timber at 512 px: lossy q92 10.9 degrees mean error, 136 KB; lossless 0.14 degrees, 550 KB; 2026-10-08),
            # its channels kept to NORMAL_BITS
            out['normalMap'] = webp(n * 0.5 + 0.5, 92, 'RGB', lossless=True, bits=NORMAL_BITS)
            # M2: the normal map's variance per mip level, from the float normals before quantising: the shader adds it to the
            # roughness at the mip it samples (specular anti-aliasing, no new bytes; core/materials/record 25-matlib-host.js)
            if cfg.get('specAA'):
                mip_v1 = compute_mip_variance(n)
            # M4: cavity and wear as two masks (one channel cannot say both): R concave pores and joints (1 open, darker in),
            # G worn convex edges (0 none .. 1 worn): the shader darkens the one and lifts the other
            if cfg.get('m4'):
                cw = np.stack([compute_cavity_from_normal(n), compute_wear_from_normal(n), np.zeros(n.shape[:2])], -1)
                out['cwMap'] = webp(cw, 90, 'RGB', lossless=True)
        # roughness
        if os.path.isfile(pr) and not card and not cfg.get('mapOnly'):
            r = load(pr, size, 'L')
            lift = float(cfg.get('roughLift', 0.0))
            out['roughnessMap'] = webp(r + (1 - r) * lift, 85, 'L')

    entry = {
        'lib': lib,
        'size': size,
        'scale': cfg.get('scale', rec.get('scale', [2, 2])),
        'metal': cfg.get('metal', rec.get('metal', 0)),
        'normalScale': cfg.get('normalScale', 1.0),
        'specular': cfg.get('specular', 0.5),
        'breakup': cfg.get('breakup'),
        'card': card,
        'tint': dict({'keep': keep, 'mean': target, 'contrast': con, 'sourceMean': round(m, 4)},
                     **({'colour': t['colour']} if t.get('colour') else {})),
        'roughLift': cfg.get('roughLift', 0.0),
        'source': {k: sha1(f) for k, f in (('albedo', pa), ('normal', pn), ('roughness', pr)) +
                   ((('height', ph),) if (height and os.path.isfile(ph)) else ()) if os.path.isfile(f)},
        'files': {},
    }
    if height:
        entry['height'] = True
    if pack_format != 2 and has_lit and cfg.get('specAA'):
        entry['mipVariance'] = mip_v1
    if pack_format != 2 and has_lit and cfg.get('pom') and not card:
        entry['pomDepth'] = float(cfg['pom'])
    if pack_format == 2:
        entry['packVersion'] = 2
        entry['alphaMode'] = alpha_mode
        if has_lit:
            entry['normalEncoding'] = normal_enc
            entry['heightSource'] = h_from
            entry['mipVariance'] = mip_var
            entry['normalError'] = normal_error_stats(n_float, n_dec)
    if cfg.get('own'):    # the kit's own page only: matlib_pack leaves it out of a host's copy of the pack (see `own` above)
        entry['own'] = True
    if cfg.get('cell'):   # a card shown one cell at a time [x0, y0, x1, y1], fractions of the sheet from its top left
        entry['cell'] = cfg['cell']
    if cfg.get('base'):   # the edge of the cell its plant attaches at: core/biome turns a frond, strand or clump to meet it
        entry['base'] = cfg['base']
    for k in ('stems', 'rise'):   # a crown's sprigs held by their stems (core/biome BIO.geo.stemClump)
        if cfg.get(k) is not None:
            entry[k] = cfg[k]
    if card:   # what the image is (core/biome's card guard reads it): how many plants, where cards.py anchored a lone one
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import check_cells
        ps = check_cells.plants(cfg['lib'])
        if ps is not None:
            entry['plants'] = len(ps)
        anchor = check_cells.meta_anchor(cfg['lib'])
        if anchor:
            entry['anchor'] = anchor
        if cfg.get('sheet'):
            entry['sheet'] = cfg['sheet']
    slot_suffix = {'map': 'albedo', 'normalMap': 'normal', 'roughnessMap': 'rough', 'nrcMap': 'nrc', 'cwMap': 'cw'}
    for k, data in out.items():
        name = '%s.%s.webp' % (fam, slot_suffix[k])
        entry['files'][k] = name
        files[name] = data
    return entry, files


def family_reads(cfg):
    """The image files one family's pack reads (what process() opens), as absolute paths."""
    d = set_dir(cfg['lib'])
    with open(os.path.join(d, 'meta.json'), encoding='utf-8') as fh:
        meta = json.load(fh)
    mp = meta.get('maps') or {}
    path = lambda k, default: os.path.normpath(os.path.join(d, mp.get(k, default)))
    card = meta.get('record', {}).get('kind') == 'card'
    out = [path('map', 'albedo.jpg')]
    if not card and not cfg.get('mapOnly'):
        out += [p for p in (path('normalMap', 'normal.jpg'), path('roughnessMap', 'roughness.png')) if os.path.isfile(p)]
    if cfg.get('height') and not card and os.path.isfile(path('heightMap', 'height.png')):
        out.append(path('heightMap', 'height.png'))
    return out


def pointer_families(cfg):
    """[(family, library set, repo path)] of every LFS pointer the build's families would read (T18: one pointer used to
    abort the pack at the first, without the family that asked for it). A set no family names is never read."""
    out = []
    for fam in sorted(cfg['families']):
        fc = cfg['families'][fam]
        if fc.get('optional') and not os.path.isfile(os.path.join(set_dir(fc['lib']), 'meta.json')):
            continue
        for p in family_reads(fc):
            if buildlib.is_pointer(p):
                out.append((fam, fc['lib'], buildlib.rel(p) or p.replace(os.sep, '/')))
    return out


def process_decal(tid, cfg):
    """A delivered picture for a painted panel: the set's albedo at its own aspect, long side cfg size (1024), colours kept."""
    d = set_dir(tid)
    meta = json.load(open(os.path.join(d, 'meta.json'), encoding='utf-8'))
    pa = os.path.normpath(os.path.join(d, (meta.get('maps') or {}).get('map', 'albedo.jpg')))
    if buildlib.is_pointer(pa):
        buildlib.refuse_pointer(pa, 'tools/textures/pack.py')
    iw, ih = Image.open(pa).size
    long_side = int(cfg.get('size', 1024))
    k = min(1.0, float(long_side) / max(iw, ih))
    wh = [max(1, int(round(iw * k))), max(1, int(round(ih * k)))]
    name = 'decal.%s.albedo.webp' % tid.replace('/', '.')
    entry = {'lib': tid, 'size': wh, 'source': {'albedo': sha1(pa)}, 'files': {'map': name}}
    if cfg.get('culture'):
        entry['culture'] = cfg['culture']
    return entry, {name: webp(load(pa, wh, 'RGB'), 88, 'RGB')}


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('build')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--format', type=int, choices=(1, 2), default=None, help='override packFormat (1=three maps, 2=M1 two maps)')
    ap.add_argument('--normal-enc', choices=('xy6', 'xy8', 'oct8'), default=None, help='packFormat 2 normal encoding')
    # per-page packs (tools/textures/page_pack.py; opt-in until Stage 8): only the families one page keeps of this build's
    # pack, written to --out (never over tex/, which every other page of the build reads)
    ap.add_argument('--page', help='a page (repo path of its .html) whose row in the pages file lists the families to pack')
    ap.add_argument('--pages', help='the pages file (default settlements/xanadu/page-packs.json)')
    ap.add_argument('--key', help='the pack key the page lists them under (default: materials.json "build")')
    ap.add_argument('--out', help='with --page: the folder to write into')
    a = ap.parse_args(argv)
    bdir = os.path.join(ROOT, a.build) if not os.path.isabs(a.build) else a.build
    cfg = json.load(open(os.path.join(bdir, 'materials.json'), encoding='utf-8'))
    size = int(cfg.get('size', 512))
    pfmt = int(a.format if a.format is not None else cfg.get('packFormat', 1))
    nenc = str(a.normal_enc if a.normal_enc is not None else cfg.get('normalEncoding', 'xy6'))
    tdir = os.path.join(bdir, 'tex')
    only = None
    if a.page:
        import page_pack
        if not a.out:
            sys.exit('pack.py --page writes a page\'s pack apart: give --out <folder>')
        e = page_pack.load(a.pages).get('pages', {}).get(page_pack.rel(os.path.join(ROOT, a.page)))
        only = (e or {}).get('packs', {}).get(a.key or cfg['build'])
        if only is None:
            sys.exit('pack.py --page: %s keeps no list for the pack %s' % (a.page, a.key or cfg['build']))
        tdir = os.path.abspath(a.out)
    pack = {'what': 'generated by tools/textures/pack.py from materials.json; do not edit', 'build': cfg['build'],
            'size': size, 'families': {}}
    if pfmt == 2:
        pack['packVersion'] = 2
        pack['normalEncoding'] = nenc
    ptr = pointer_families(cfg)
    if ptr:   # every one at once, each with the family that reads it, and one pull for all
        for fam, lib, p in ptr:
            print('pack.py: family %s (set %s) reads %s, a Git LFS pointer, not the file' % (fam, lib, p))
        print('a pack written from a pointer is black in every page that takes it. Run: %s' % buildlib.pull_hint([p for _, _, p in ptr]))
        return 1
    allfiles = {}
    for fam in sorted(cfg['families']):
        if only is not None and fam not in only:
            continue
        fc = cfg['families'][fam]
        if fc.get('optional') and not os.path.isfile(os.path.join(set_dir(fc['lib']), 'meta.json')):
            print('skipped %s: library set %s not delivered yet (optional)' % (fam, fc['lib']))
            continue
        e, files = process(fam, fc, size, pack_format=pfmt, normal_enc=nenc)
        pack['families'][fam] = e
        allfiles.update(files)
    decals = {}
    for tid in sorted(cfg.get('decals') or {}):
        if not os.path.isfile(os.path.join(set_dir(tid), 'meta.json')):
            print('skipped decal %s: not delivered yet (the page keeps its painted stand-in)' % tid)
            continue
        e, files = process_decal(tid, cfg['decals'][tid])
        decals[tid] = e
        allfiles.update(files)
    if decals:
        pack['decals'] = decals
    pj = json.dumps(pack, indent=1, sort_keys=True) + '\n'
    if a.check:
        old = open(os.path.join(tdir, 'pack.json'), encoding='utf-8').read() if os.path.isfile(os.path.join(tdir, 'pack.json')) else ''
        strip = lambda s: ({f: {k: v for k, v in e.items()} for f, e in json.loads(s)['families'].items()},
                           json.loads(s).get('decals', {})) if s else ({}, {})
        same = strip(old) == strip(pj)
        print('tex/ matches materials.json' if same else 'tex/ is stale: rerun tools/textures/pack.py ' + a.build)
        return 0 if same else 1
    os.makedirs(tdir, exist_ok=True)
    for f in os.listdir(tdir):
        if f.endswith('.webp') and f not in allfiles:
            os.remove(os.path.join(tdir, f))
    for name, data in allfiles.items():
        open(os.path.join(tdir, name), 'wb').write(data)
    with open(os.path.join(tdir, 'pack.json'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(pj)
    kb = sum(len(d) for d in allfiles.values()) / 1024
    print('packed %d families into %s (%d files, %.0f KB)' % (len(pack['families']), os.path.relpath(tdir, ROOT), len(allfiles), kb))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

