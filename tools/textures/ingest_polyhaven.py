#!/usr/bin/env python3
"""Reduce a folder of Poly Haven texture downloads to 1024 px material-library sets.

    python3 tools/textures/ingest_polyhaven.py DOWNLOADS OUT [--catalog-only] [--only a,b] [--match str]

Runs on the machine that holds the downloads (they are gigabytes; OUT is small). Needs Python, numpy and
Pillow; OpenEXR (or opencv) is optional and only used to read .exr maps (see "Formats").

DOWNLOADS  any folder tree (and .zip files in it): per-asset folders, Poly Haven's "textures/" folders or a
           flat pile. Maps are found by file name: <slug>_<map>_<res>.<ext>, e.g. rock_wall_08_diff_2k.jpg.
OUT        sets/<slug>/{albedo.jpg, normal.png, roughness.png, meta.json}   (same layout as process.py)
           catalog/sheet-NN.jpg + summary.tsv + summary.json               (what was found and skipped)

Per asset:
  colour      diff / diffuse / col / albedo   (a "col_02" variant is used only if there is no col_01)
  normal      nor_gl ONLY. nor_dx is never used, never flipped: an asset with only nor_dx is skipped.
  roughness   rough, or the GREEN channel of an ARM pack (R = AO, G = roughness, B = metal)
  Any resolution is accepted: the smallest one at or above 1024 px is read (else the largest).
Resizing is wrap-aware (the image is padded with wrapped copies before filtering), so a tiling source still
tiles at 1024 px. Normals are re-normalised after resizing. EXR colour is converted from linear to sRGB.

Formats: jpg, png, tif always; exr when `import OpenEXR` or `import cv2` works. Prefer downloading the
jpg (colour) and png (normal, roughness) variants: if only an exr exists for a map and no reader is
installed, that asset is skipped with the reason "exr, no reader".

meta.json: {record, maps, source, processing} as process.py writes it. source = Poly Haven, the slug, its URL,
licence CC0. record.tint is a first guess from the name and the measured saturation (metals, rust: false);
the measured numbers are in processing.stats. record.id is the slug until a set is mapped to a library id
(tools/textures/adopt.py). Deterministic: the same downloads give the same bytes.

--catalog-only writes only the catalog (192 px thumbnails on contact sheets with the slug, the tint guess and
the suggested library id), which is a few MB for hundreds of assets. Run it first, upload that, pick, then
rerun with --only for the chosen slugs.
"""
import argparse, hashlib, io, json, os, re, sys, zipfile
from concurrent.futures import ProcessPoolExecutor
import numpy as np
from PIL import Image, ImageDraw, ImageFile

Image.MAX_IMAGE_PIXELS = None
ImageFile.MAXBLOCK = 1 << 26          # optimized JPEG/PNG of noisy maps overflow the default buffer
SIZE = 1024
THUMB = 192
VERSION = 1

EXTS = ('jpg', 'jpeg', 'png', 'exr', 'tif', 'tiff')
MAPS = ('nor_gl', 'nor_dx', 'diffuse', 'diff', 'color', 'colour', 'col', 'albedo', 'rough', 'roughness', 'arm',
        'rma', 'orm', 'disp', 'displacement', 'height', 'ao', 'metal', 'metallic', 'metalness', 'spec', 'bump',
        'opacity', 'alpha', 'mask', 'translucent', 'sss', 'nor', 'normal')
NAME_RE = re.compile(r'^(?P<slug>.+?)_(?P<map>%s)(?P<var>_?\d{1,2})?(?:_(?P<res>\d+k|\d{3,5}))?\.(?P<ext>%s)$'
                     % ('|'.join(MAPS), '|'.join(EXTS)), re.I)
CANON = {'diffuse': 'diff', 'color': 'diff', 'colour': 'diff', 'col': 'diff', 'albedo': 'diff',
         'roughness': 'rough', 'rma': 'arm', 'orm': 'arm', 'displacement': 'disp', 'height': 'disp',
         'metallic': 'metal', 'metalness': 'metal', 'normal': 'nor', 'nor': 'nor'}
# preferred extension per map: highest quality first
FMT_PREF = {'nor_gl': ('exr', 'png', 'tif', 'tiff', 'jpg', 'jpeg'), 'rough': ('exr', 'png', 'tif', 'tiff', 'jpg', 'jpeg'),
            'arm': ('png', 'tif', 'tiff', 'jpg', 'jpeg', 'exr'), 'diff': ('jpg', 'jpeg', 'png', 'tif', 'tiff', 'exr')}

# first match wins; a suggestion for the selection step only (ids from core/materials/PLAN.md)
SUGGEST = [
    ('concrete.cracked', r'concrete.*(crack|damag|broken|rebar|stain)|(crack|damag).*concrete'),
    ('concrete', r'concrete|cement|plaster_?concrete'),
    ('steel.rust', r'rust|corrod|oxid'),
    ('metal.corrugated', r'corrugat|sheet_?metal|metal_?sheet'),
    ('metal.grating', r'grat|mesh|metal_?grid|chain_?link|diamond_?plate|metal_?plate_?\d'),
    ('metal.gold', r'gold|gilt'),
    ('metal.bronze', r'bronze|brass|copper|verdigris'),
    ('metal.iron', r'iron|wrought|cast_?iron'),
    ('steel.painted', r'painted_?metal|metal_?paint|steel|metal|hull|car_?paint'),
    ('roof.tile', r'roof_?til|terracotta|clay_?til|roofing'),
    ('tile.glazed', r'tile|ceramic|glaz|mosaic|zellige|azulejo|porcelain'),
    ('brick', r'brick'),
    ('stone.coral', r'coral|limestone|sandstone_?block'),
    ('paving', r'cobble|paving|pavement|flagstone|sett|street_?stone|concrete_?floor'),
    ('stone.cut', r'ashlar|stone_?brick|stone_?wall|castle|block|masonry|marble|granite|slate'),
    ('stone.rubble', r'rubble|rough_?stone|dry_?stone|stone_?wall_?\d|rock_?wall|boulder_?wall'),
    ('rock', r'rock|cliff|boulder|stone|gravel|pebble|mountain'),
    ('earth.adobe', r'adobe|rammed|cob|clay|mud_?brick|banco|earth_?wall'),
    ('plaster', r'plaster|stucco|render|wall_?(white|paint)|painted_?wall|whitewash|lime'),
    ('ground.sand', r'sand|desert|dune|beach'),
    ('ground.moss', r'moss|lichen'),
    ('ground.turf', r'grass|turf|lawn|meadow|clover'),
    ('ground.dirt', r'dirt|soil|mud|ground|earth|forest_?floor|leaf_?litter|dry_?ground|gravel'),
    ('wood.bamboo', r'bamboo'),
    ('wood.log', r'bark|log|trunk|tree'),
    ('wood.plank', r'plank|floor|board|parquet|decking|fence|shutter'),
    ('wood.beam', r'beam|timber|lumber|wood'),
    ('leaf', r'leaf|leaves|foliage|plant|fern|ivy|hedge|palm|frond'),
    ('hide', r'leather|hide|fur|skin'),
    ('cloth.canvas', r'canvas|burlap|hessian|tarp|sack'),
    ('cloth.plain', r'fabric|cloth|linen|cotton|wool|denim|knit|felt|carpet|rug|velvet|silk|curtain|towel'),
    ('fibre.cane', r'wicker|rattan|cane|basket'),
    ('fibre.rope', r'rope|net|twine'),
    ('roof.thatch', r'thatch|straw|reed|hay'),
]
UNTINTED = re.compile(r'rust|corrod|gold|brass|bronze|copper|iron|steel|metal|chrome|silver|aluminium|aluminum|grat|mesh')


# ---------------------------------------------------------------- finding assets
def scan(root):
    """slug -> {map: [candidate, ...]}; a candidate is {src, ext, res, var, size}. src is a path or (zip, member)."""
    found = {}

    def add(name, src, size):
        m = NAME_RE.match(os.path.basename(name))
        if not m:
            return
        mp = m.group('map').lower()
        mp = CANON.get(mp, mp)
        res = m.group('res')
        px = int(res[:-1]) * 1024 if res and res.lower().endswith('k') else (int(res) if res else 0)
        var = int(m.group('var').lstrip('_') or 0) if m.group('var') else 0
        found.setdefault(m.group('slug'), {}).setdefault(mp, []).append(
            dict(src=src, ext=m.group('ext').lower(), res=px, var=var, size=size))

    for dp, dn, fn in os.walk(root):
        dn.sort()
        for f in sorted(fn):
            p = os.path.join(dp, f)
            if f.lower().endswith('.zip'):
                try:
                    with zipfile.ZipFile(p) as z:
                        for zi in z.infolist():
                            if not zi.is_dir():
                                add(zi.filename, (p, zi.filename), zi.file_size)
                except zipfile.BadZipFile:
                    print('warning: bad zip', p, file=sys.stderr)
            else:
                add(f, p, os.path.getsize(p))
    return found


def pick(cands, kind):
    """Best candidate of one map: lowest variant number, then the smallest res >= SIZE (else the largest),
    then the preferred format."""
    if not cands:
        return None
    pref = FMT_PREF.get(kind, EXTS)
    v0 = min(c['var'] for c in cands)
    cs = [c for c in cands if c['var'] == v0]
    ge = sorted(c['res'] for c in cs if c['res'] >= SIZE)
    want = ge[0] if ge else max(c['res'] for c in cs)
    cs = [c for c in cs if c['res'] == want] or cs
    cs.sort(key=lambda c: pref.index(c['ext']) if c['ext'] in pref else 99)
    return cs[0]


def opener(src):
    if isinstance(src, tuple):
        with zipfile.ZipFile(src[0]) as z:
            return io.BytesIO(z.read(src[1]))
    return src


def sha1_of(src):
    h = hashlib.sha1()
    if isinstance(src, tuple):
        h.update(opener(src).getvalue())
    else:
        with open(src, 'rb') as fh:
            for b in iter(lambda: fh.read(1 << 20), b''):
                h.update(b)
    return h.hexdigest()


# ---------------------------------------------------------------- reading maps
def read_exr(src):
    """float32 HxWx3 (or HxW) from an exr, or raise RuntimeError('exr, no reader')."""
    path = src
    if isinstance(src, tuple):                       # readers want a file
        import tempfile
        tf = tempfile.NamedTemporaryFile(suffix='.exr', delete=False)
        tf.write(opener(src).getvalue()); tf.close(); path = tf.name
    try:
        try:
            import OpenEXR
            if hasattr(OpenEXR, 'File'):             # OpenEXR 3.3+
                ch = OpenEXR.File(path).channels()
                if 'RGB' in ch:
                    return np.asarray(ch['RGB'].pixels, dtype=np.float32)
                if all(k in ch for k in 'RGB'):
                    return np.stack([np.asarray(ch[k].pixels, dtype=np.float32) for k in 'RGB'], -1)
                k = sorted(ch)[0]
                return np.asarray(ch[k].pixels, dtype=np.float32)
            import Imath
            f = OpenEXR.InputFile(path)
            dw = f.header()['dataWindow']; w, h = dw.max.x - dw.min.x + 1, dw.max.y - dw.min.y + 1
            pt = Imath.PixelType(Imath.PixelType.FLOAT)
            names = [c for c in 'RGB' if c in f.header()['channels']] or sorted(f.header()['channels'])[:1]
            arr = [np.frombuffer(f.channel(c, pt), dtype=np.float32).reshape(h, w) for c in names]
            return arr[0] if len(arr) == 1 else np.stack(arr, -1)
        except ImportError:
            pass
        try:
            os.environ.setdefault('OPENCV_IO_ENABLE_OPENEXR', '1')
            import cv2
            im = cv2.imread(path, cv2.IMREAD_UNCHANGED | cv2.IMREAD_ANYDEPTH)
            if im is None:
                raise RuntimeError('exr, unreadable')
            im = im.astype(np.float32)
            return im[..., ::-1] if im.ndim == 3 else im
        except ImportError:
            raise RuntimeError('exr, no reader')
    finally:
        if isinstance(src, tuple):
            os.unlink(path)


def load(src, ext, target=SIZE):
    """-> (float32 array in 0..1, HxWx3 or HxW; is_float_linear; source size). Big 8-bit JPEGs are decoded
    at reduced size where Pillow allows (draft), which is the fast path for 4k/8k maps."""
    if ext == 'exr':
        a = read_exr(src)
        return a, True, a.shape[1]
    im = Image.open(opener(src))
    w0 = im.size[0]
    if im.format == 'JPEG' and w0 >= target * 2:
        scale = 1
        while w0 // (scale * 2) >= target * 1.0:
            scale *= 2
        im.draft('RGB', (w0 // min(scale, 4), im.size[1] // min(scale, 4)))
    if im.mode in ('I;16', 'I;16B', 'I;16L', 'I'):
        a = np.asarray(im).astype(np.float32) / 65535.0
    elif im.mode == 'F':
        a = np.asarray(im).astype(np.float32)
    elif im.mode in ('L', 'LA'):
        a = np.asarray(im.convert('L')).astype(np.float32) / 255.0
    else:
        a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    return a, False, w0


def srgb_encode(a):
    a = np.clip(a, 0, 1)
    return np.where(a <= 0.0031308, a * 12.92, 1.055 * np.power(a, 1 / 2.4) - 0.055)


def resize_wrap(a, size=SIZE):
    """Wrap-aware resize of a float32 HxW or HxWxC array to size x size."""
    h, w = a.shape[:2]
    if (h, w) == (size, size):
        return a
    pad = int(min(h, w) // 2, ) if False else int(min(max(8, np.ceil(3.0 * max(h, w) / size) + 2), h // 2, w // 2))
    chans = [a] if a.ndim == 2 else [a[..., c] for c in range(a.shape[2])]
    out = []
    for c in chans:
        p = np.pad(c, pad, mode='wrap').astype(np.float32)
        im = Image.fromarray(p, 'F')
        W2, H2 = int(round((w + 2 * pad) * size / w)), int(round((h + 2 * pad) * size / h))
        q = np.asarray(im.resize((W2, H2), Image.LANCZOS), dtype=np.float32)
        ox, oy = int(round(pad * size / w)), int(round(pad * size / h))
        out.append(q[oy:oy + size, ox:ox + size])
    return out[0] if a.ndim == 2 else np.stack(out, -1)


def lum(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def sat_of(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1)
    return float(np.mean((mx - mn) / np.maximum(mx, 1e-4)))


def suggest_id(slug):
    s = slug.lower()
    for sid, rx in SUGGEST:
        if re.search(rx, s):
            return sid
    return ''


# ---------------------------------------------------------------- one asset
def process_asset(job):
    slug, maps, out_dir, catalog_only = job
    res = dict(slug=slug, status='ok', reason='', src_res=0, maps='', tint=None, sat=0.0, lum=0.0, suggest=suggest_id(slug))
    dc = pick(maps.get('diff'), 'diff')
    ng = pick(maps.get('nor_gl'), 'nor_gl')
    rg = pick(maps.get('rough'), 'rough')
    am = pick(maps.get('arm'), 'arm')
    res['maps'] = ','.join(k for k in ('diff', 'nor_gl', 'nor_dx', 'rough', 'arm', 'disp', 'ao', 'metal') if k in maps)
    if not dc:
        return dict(res, status='skipped', reason='no colour map')
    res['src_res'] = dc['res']
    try:
        col, lin, w0 = load(dc['src'], dc['ext'])
        if lin:
            col = srgb_encode(col)
        if col.ndim == 2:
            col = np.stack([col] * 3, -1)
        res['sat'] = round(sat_of(col), 3); res['lum'] = round(float(lum(col).mean()), 3)
        tint = not UNTINTED.search(slug.lower())
        res['tint'] = tint
        thumb = Image.fromarray((np.clip(resize_wrap(col, 256 if False else THUMB), 0, 1) * 255 + 0.5).astype(np.uint8))
        res['thumb'] = thumb.tobytes(); res['thumb_size'] = thumb.size
        if catalog_only:
            if not (ng or (not maps.get('nor_gl') and False)):
                res['status'] = 'skipped'
                res['reason'] = 'only nor_dx' if 'nor_dx' in maps else 'no nor_gl'
            elif not (rg or am):
                res['status'] = 'skipped'; res['reason'] = 'no roughness / ARM'
            return res
        if not ng:
            return dict(res, status='skipped', reason='only nor_dx (never used)' if 'nor_dx' in maps else 'no nor_gl')
        if not (rg or am):
            return dict(res, status='skipped', reason='no roughness or ARM map')

        nor, nlin, _ = load(ng['src'], ng['ext'])
        if nor.ndim == 2:
            return dict(res, status='skipped', reason='normal map is single channel')
        nor = resize_wrap(nor[..., :3])
        v = nor * 2 - 1
        v /= np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-6)

        metal = 0.0
        if rg:
            r, rlin, _ = load(rg['src'], rg['ext'])
            r = r if r.ndim == 2 else r[..., 1] if False else r.mean(-1)
            rough_from = 'rough'
        else:
            r, _, _ = load(am['src'], am['ext'])
            if r.ndim == 2:
                return dict(res, status='skipped', reason='ARM map is single channel')
            metal = float(resize_wrap(r[..., 2]).mean()) if r.shape[-1] > 2 else 0.0
            r = r[..., 1]
            rough_from = 'arm.G'
        r = np.clip(resize_wrap(r), 0, 1)
        if rg and 'metal' in maps:
            mm = pick(maps['metal'], 'rough')
            try:
                m, _, _ = load(mm['src'], mm['ext'])
                metal = float((m if m.ndim == 2 else m.mean(-1)).mean())
            except Exception:
                pass
        col = np.clip(resize_wrap(col), 0, 1)

        os.makedirs(out_dir, exist_ok=True)
        Image.fromarray((col * 255 + 0.5).astype(np.uint8)).save(
            os.path.join(out_dir, 'albedo.jpg'), quality=92, subsampling=0, optimize=True)
        Image.fromarray(((v * 0.5 + 0.5) * 255 + 0.5).astype(np.uint8)).save(os.path.join(out_dir, 'normal.png'), optimize=True)
        Image.fromarray((r * 255 + 0.5).astype(np.uint8), 'L').save(os.path.join(out_dir, 'roughness.png'), optimize=True)

        files = {k: os.path.basename(c['src'][1] if isinstance(c['src'], tuple) else c['src'])
                 for k, c in (('diff', dc), ('nor_gl', ng), ('rough', rg), ('arm', am)) if c and (k != 'arm' or not rg)}
        meta = {
            'record': {'id': slug, 'family': (res['suggest'] or 'unsorted').split('.')[0], 'colour': '#ffffff',
                       'roughness': round(float(r.mean()), 3), 'metal': round(metal, 2) if metal > 0.05 else 0,
                       'scale': [2.0, 2.0], 'tint': tint},
            'maps': {'map': 'albedo.jpg', 'normalMap': 'normal.png', 'roughnessMap': 'roughness.png'},
            'source': {'library': 'Poly Haven', 'asset': slug, 'url': 'https://polyhaven.com/a/' + slug,
                       'licence': 'CC0', 'file': files['diff'], 'sha1': sha1_of(dc['src']), 'files': files},
            'processing': {'script': 'tools/textures/ingest_polyhaven.py', 'version': VERSION,
                           'options': {'size': SIZE, 'roughness_from': rough_from, 'normal': 'nor_gl'},
                           'log': {'source_res': dc['res'], 'source_size': w0, 'colour_format': dc['ext'],
                                   'normal_format': ng['ext'], 'roughness_format': (rg or am)['ext'],
                                   'extras_available': [k for k in ('disp', 'ao', 'metal') if k in maps]},
                           'stats': {'mean_saturation': res['sat'], 'mean_luminance': res['lum'],
                                     'tint_guess': 'name and saturation; metals and rust false', 'scale_note':
                                     'scale [2,2] is a placeholder: set metres per tile from the Poly Haven page'}},
        }
        with open(os.path.join(out_dir, 'meta.json'), 'w') as fh:
            json.dump(meta, fh, indent=1, sort_keys=True)
        return res
    except RuntimeError as e:
        return dict(res, status='skipped', reason=str(e))
    except Exception as e:                           # one bad asset must not stop the run
        return dict(res, status='skipped', reason='error: %s: %s' % (type(e).__name__, e))


# ---------------------------------------------------------------- catalog
def contact_sheets(rows, out_dir, per_row=6, per_sheet=24):
    os.makedirs(out_dir, exist_ok=True)
    rows = [r for r in rows if r.get('thumb')]
    names = []
    cw, ch = THUMB, THUMB + 28
    for si in range(0, len(rows), per_sheet):
        chunk = rows[si:si + per_sheet]
        nrow = (len(chunk) + per_row - 1) // per_row
        sheet = Image.new('RGB', (per_row * cw, nrow * ch), (24, 24, 24))
        d = ImageDraw.Draw(sheet)
        for i, r in enumerate(chunk):
            x, y = (i % per_row) * cw, (i // per_row) * ch
            sheet.paste(Image.frombytes('RGB', r['thumb_size'], r['thumb']), (x, y))
            tag = '' if r['status'] == 'ok' else ' [skip]'
            d.text((x + 3, y + THUMB + 2), (r['slug'] + tag)[:32], fill=(235, 235, 235))
            d.text((x + 3, y + THUMB + 14), '%s s%.2f %s' % ('T' if r['tint'] else '-', r['sat'], r['suggest'])[:32],
                   fill=(150, 190, 150))
        n = 'sheet-%02d.jpg' % (si // per_sheet + 1)
        sheet.save(os.path.join(out_dir, n), quality=82)
        names.append(n)
    return names


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('downloads'); ap.add_argument('out')
    ap.add_argument('--catalog-only', action='store_true', help='thumbnails and the summary only, no sets')
    ap.add_argument('--only', help='comma-separated slugs')
    ap.add_argument('--match', help='only slugs containing this text (e.g. bark)')
    ap.add_argument('--jobs', type=int, default=max(1, min(4, os.cpu_count() or 1)))
    a = ap.parse_args()

    found = scan(a.downloads)
    slugs = sorted(found)
    if a.only:
        want = set(a.only.replace(' ', '').split(','))
        miss = sorted(want - set(slugs))
        if miss:
            print('not found in downloads:', ', '.join(miss), file=sys.stderr)
        slugs = [s for s in slugs if s in want]
    if a.match:
        slugs = [s for s in slugs if a.match.lower() in s.lower()]
    print('%d assets found (%d after filters)' % (len(found), len(slugs)))
    jobs = [(s, found[s], os.path.join(a.out, 'sets', s), a.catalog_only) for s in slugs]
    if a.jobs > 1 and len(jobs) > 1:
        with ProcessPoolExecutor(a.jobs) as ex:
            rows = list(ex.map(process_asset, jobs, chunksize=2))
    else:
        rows = [process_asset(j) for j in jobs]

    cat = os.path.join(a.out, 'catalog')
    sheets = contact_sheets(rows, cat)
    summary = [{k: v for k, v in r.items() if k not in ('thumb', 'thumb_size')} for r in rows]
    os.makedirs(cat, exist_ok=True)
    with open(os.path.join(cat, 'summary.json'), 'w') as fh:
        json.dump(summary, fh, indent=1)
    cols = ['slug', 'status', 'src_res', 'maps', 'tint', 'sat', 'lum', 'suggest', 'reason']
    with open(os.path.join(cat, 'summary.tsv'), 'w') as fh:
        fh.write('\t'.join(cols) + '\n')
        for r in summary:
            fh.write('\t'.join(str(r.get(c, '')) for c in cols) + '\n')

    w = max([len(r['slug']) for r in summary] + [4])
    print('\n%-*s  %-7s %5s  %-22s %-4s %5s  %-18s %s' % (w, 'slug', 'status', 'res', 'maps', 'tint', 'sat', 'suggested id', 'reason'))
    for r in summary:
        print('%-*s  %-7s %5s  %-22s %-4s %5.2f  %-18s %s' % (
            w, r['slug'], r['status'], (str(r['src_res'] // 1024) + 'k') if r['src_res'] else '?', r['maps'],
            'yes' if r['tint'] else ('no' if r['tint'] is False else '?'), r['sat'], r['suggest'] or '-', r['reason']))
    ok = sum(r['status'] == 'ok' for r in summary)
    print('\n%d ok, %d skipped. Catalog: %s (%d sheets)%s' % (
        ok, len(summary) - ok, cat, len(sheets), '' if a.catalog_only else '; sets: ' + os.path.join(a.out, 'sets')))
    if a.catalog_only:
        print('(catalog-only: "ok" means the maps are all there; no sets were written)')


if __name__ == '__main__':
    main()
