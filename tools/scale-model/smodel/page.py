"""The model's data: loading it, its grids, its rasters, and writing it back.

`D` is the `DATA` object exactly as the page holds it (rasters as base64 strings), whether it was read from the build's
`model/data/` folder or from a saved page, so an edit reads and assigns `D[key]` and never touches a page string.

    D = load()                          # model/data (the build's source); or load('<page.html>')
    E, water = heights(D)               # height grid, metres; the B-channel water flag
    D['h'] = encode_heights(D, En, water)
    save(D)                             # back to model/data; then model/build.py writes the page

Heights are 16 bits over [D['lo'], D['hi']] (R high byte, G low byte). Read the range from D: 4.23 raised `hi` from
17,100 to 27,000 m, and the old scripts' constants (history/) still say 17,100.
"""
import base64, glob, io, json, os, sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.path.join(os.path.dirname(HERE), 'model')
sys.path.insert(0, MODEL)
import build   # noqa: E402  (model/build.py: the data folder's format)

DATA_DIR = build.DATA_DIR
LEGACY_SHIFT = (272, 330)
LEGACY_FULL_SIZE = (1549, 1393)
INLINE_KEYS = {'legacy_shift', 'tsunami_farside'}


def legacy_px(px, py=None, D=None):
    """Shift 4.23/4.24 map-pixel coordinates (1549x1393) onto the 5.1 canvas (1821x1723) by (+272, +330)."""
    shift = (D or {}).get('legacy_shift') if isinstance(D, dict) else None
    if isinstance(shift, (list, tuple)) and len(shift) >= 2:
        dx, dy = shift[0], shift[1]
    elif isinstance(shift, dict) and 'dx' in shift:
        dx, dy = shift['dx'], shift['dy']
    else:
        dx, dy = LEGACY_SHIFT
    if py is None:
        return [px[0] + dx, px[1] + dy]
    return px + dx, py + dy


def load(path=DATA_DIR):
    """D from the build's data folder (default) or from a saved page (the artifact's `read` file or a built page)"""
    if os.path.isdir(path):
        return build.load_data(path)
    page = build.strip_wrapper(open(path, encoding='utf-8', newline='').read())
    line = next(l for l in page.split('\n') if l.startswith(build.DATA_PREFIX))
    return json.loads(line[len(build.DATA_PREFIX):line.rindex('}') + 1])


def version(path=DATA_DIR):
    """the model's version ('5.1'), from the page's title block: the saved page's, or the build's src/ for a data folder"""
    import re
    src = os.path.join(build.SRC, '10-panel.html') if os.path.isdir(path) else path
    m = re.search(r'scale model (\d+\.\d+) ', open(src, encoding='utf-8').read())
    return m.group(1) if m else '?'


def save(D, folder=DATA_DIR):
    """D back into a data folder: each key to the file model.json names for it (a new key is added as a scalar, or as
    its own JSON file when it is a list or an object), rasters written as their decoded bytes"""
    mpath = os.path.join(folder, 'model.json')
    order = json.load(open(mpath, encoding='utf-8'))['keys'] if os.path.exists(mpath) else []
    known = {o['key']: o for o in order}
    for k in D:
        if k not in known:
            if k in INLINE_KEYS or not isinstance(D[k], (list, dict)):
                o = {'key': k, 'value': D[k]}
            else:
                o = {'key': k, 'file': k + '.json'}
            order.append(o)
            known[k] = o
    order = [o for o in order if o['key'] in D]
    for o in order:
        v = D[o['key']]
        if 'value' in o:
            o['value'] = v
        elif o['file'].endswith('.json'):
            build.write_json(os.path.join(folder, o['file']), v)
        else:
            open(os.path.join(folder, o['file']), 'wb').write(base64.b64decode(v))
    build.write_json(mpath, {'keys': order})


def raster(D, key, mode='RGB'):
    return np.array(Image.open(io.BytesIO(base64.b64decode(D[key]))).convert(mode))


def b64(img, fmt='PNG', **kw):
    buf = io.BytesIO()
    img.save(buf, fmt, **kw)
    return base64.b64encode(buf.getvalue()).decode()


def jpeg_like(D, key, arr):
    """a painted map (st, t, rt, ct) written back as JPEG with the quantisation tables it was read with"""
    src = Image.open(io.BytesIO(base64.b64decode(D[key])))
    q = getattr(src, 'quantization', None)
    return b64(Image.fromarray(np.asarray(arr).astype(np.uint8)), 'JPEG',
               **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}))


def grid(D):
    """(su, sv): map px (the full grid, fullW x fullH, 2 km) times these is a height cell (w x hh, ~4 km)"""
    return (D['w'] - 1) / (D['fullW'] - 1), (D['hh'] - 1) / (D['fullH'] - 1)


def _dec(D, a):
    return D['lo'] + ((a[..., 0].astype(np.int64) << 8) | a[..., 1]) / 65535 * (D['hi'] - D['lo'])


def _enc(D, v):
    q = np.round(np.clip((np.asarray(v, float) - D['lo']) / (D['hi'] - D['lo']), 0, 1) * 65535).astype(np.int64)
    return q >> 8, q & 255


def heights(D):
    """(E metres, water bool) on the height grid, from `h`"""
    h = raster(D, 'h')
    return _dec(D, h), h[..., 2] > 127


def water_levels(D):
    """(whas bool, wlev metres, NaN where no water) on the height grid, from `wl`"""
    wl = raster(D, 'wl')
    whas = wl[..., 2] > 127
    return whas, np.where(whas, _dec(D, wl), np.nan)


def encode_heights(D, E, water=None):
    """`h` for heights E (clamped to [lo, hi]: a carve below lo would wrap); the water flag kept unless given"""
    E = np.asarray(E, float)
    VH, VW = E.shape
    h_raw = raster(D, 'h')
    if h_raw.shape[:2] == (VH, VW):
        h = h_raw.copy()
    else:
        h = np.zeros((VH, VW, 3), dtype=np.uint8)
    h[..., 0], h[..., 1] = _enc(D, E)
    if water is not None:
        h[..., 2] = np.where(water, 255, 0)
    out = b64(Image.fromarray(h.astype(np.uint8), 'RGB'), optimize=True)
    back = _dec(D, raster({'h': out}, 'h'))
    assert np.abs(back - np.clip(E, D['lo'], D['hi'])).max() <= (D['hi'] - D['lo']) / 65535, 'height encoding'
    return out


def encode_levels(D, whas, wlev):
    """`wl` for water levels wlev where whas. A dry cell keeps whatever level `wl` held there (2,056 dry cells of 4.23
    still carry an old lake's; the page reads the level only where B says water), so writing back unchanged levels gives
    the same raster"""
    whas = np.asarray(whas, bool)
    VH, VW = whas.shape
    wl_raw = raster(D, 'wl')
    if wl_raw.shape[:2] == (VH, VW):
        wl = wl_raw.astype(np.int64)
    else:
        wl = np.zeros((VH, VW, 3), dtype=np.int64)
    r, g = _enc(D, np.where(whas, wlev, D['lo']))
    wl[..., 0], wl[..., 1] = np.where(whas, r, wl[..., 0]), np.where(whas, g, wl[..., 1])
    wl[..., 2] = np.where(whas, 255, 0)
    return b64(Image.fromarray(wl.astype(np.uint8), 'RGB'), optimize=True)


def gpx(su, sv):
    """map px -> height cell, and height cell -> map px"""
    return (lambda x, y: (int(round(y * sv)), int(round(x * su)))), (lambda j, i: [round(i / su, 1), round(j / sv, 1)])


def up(a, OH, OW, order=0):
    """a height-grid field on the full-res map grid"""
    from scipy import ndimage as nd
    return nd.zoom(a.astype(float), (OH / a.shape[0], OW / a.shape[1]), order=order)[:OH, :OW]


def regions():
    """the page's own region defaults (model/src/51-region-store.js, `defRegs`): the model's regions on its own canvas.
    openworld/little-demo/source/regions.json was their copy until it was retired to archive/ (5be246474)"""
    import re
    s = open(os.path.join(build.SRC, '51-region-store.js'), encoding='utf-8').read()
    return json.loads(re.search(r'const defRegs = (\[.*?\]);\n', s).group(1))


def settlements():
    """the page's own settlement defaults (model/src/60-settlements.js, `defSetts`)"""
    import re
    s = open(os.path.join(build.SRC, '60-settlements.js'), encoding='utf-8').read()
    return json.loads(re.search(r'const defSetts = (\[.*?\]);\n', s).group(1))


def docs(folder):
    """a collection (regions, settlements) as a folder of one JSON file per document, or one JSON list of documents (each
    with its 'id'): the page's Copy JSON buttons give the list"""
    if os.path.isfile(folder):
        return json.load(open(folder, encoding='utf8'))
    out = []
    for f in sorted(glob.glob(os.path.join(folder, '*.json'))):
        d = json.load(open(f, encoding='utf8'))
        d['id'] = os.path.splitext(os.path.basename(f))[0]
        out.append(d)
    return out
