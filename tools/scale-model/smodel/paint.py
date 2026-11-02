"""The painted maps (st satellite, t relief, rt rain, ct climate) after an edit: re-shading where the ground moved,
retinting where it moved far, repainting the rain and climate maps where their key changed, repainting the satellite for
a new climate, inpainting, and drawing rivers.

Lifted unchanged from history/edit_heights.py (ramp, repaint, relight, paint_river), history/edit_422.py (retint,
desert, by_climate) and history/edit_rivers.py (inpaint, lake_style).
"""
import base64, io

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

from .geom import sstep
from .page import b64


RAIN_RAMP = [(0, (214, 178, 120)), (240, (222, 205, 150)), (600, (190, 210, 150)), (1000, (120, 190, 170)),
             (1600, (60, 150, 170)), (2400, (30, 95, 160)), (4000, (20, 40, 110))]   # the page's rain legend


def ramp(v):
    xs = [r[0] for r in RAIN_RAMP]
    return np.stack([np.interp(v, xs, [r[1][k] for r in RAIN_RAMP]) for k in range(3)], -1)


def repaint(D, key, old_col, new_col, mask):
    """repaint a painted map where its colour key changed: each pixel scaled by new over old colour, so the relief
    shading baked into the paint is kept"""
    src = Image.open(io.BytesIO(base64.b64decode(D[key])))
    im = np.array(src.convert('RGB')).astype(float)
    f = np.clip((new_col + 8) / (old_col + 8), .3, 3.0)
    im[mask] = np.clip(im[mask] * f[mask], 0, 255)
    q = getattr(src, 'quantization', None)
    return b64(Image.fromarray(im.round().astype(np.uint8)), 'JPEG', **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}))


def relight(D, Eo, En, keys=('st', 't', 'rt', 'ct')):
    """re-shade the painted images where the heights changed (the light fitted to each image, as assemble.py does)"""
    FH, FW = D['fullH'], D['fullW']
    zoom = (FH / Eo.shape[0], FW / Eo.shape[1])
    EoF, EnF = nd.zoom(Eo, zoom, order=1), nd.zoom(En, zoom, order=1)
    region = nd.binary_dilation(np.abs(EnF - EoF) > 1, iterations=3)

    def lam(E, zf, az, alt=45):
        gy, gx = np.gradient(E / 1000 * zf, 2.0)
        a, l = np.radians(az), np.radians(alt)
        lx, ly, lz = np.cos(l) * np.sin(a), -np.cos(l) * np.cos(a), np.sin(l)
        return (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1)
    out = {}
    for k in keys:
        src = Image.open(io.BytesIO(base64.b64decode(D[k])))
        im = np.array(src.convert('RGB')).astype(float)
        Lm = im.mean(-1)
        Ll = nd.uniform_filter(Lm, 25) + 1
        mfit = nd.binary_dilation(region, iterations=20)
        y = (Lm / Ll - 1)[mfit]
        best = None
        for az in range(255, 390, 15):
            for zf in [1, 2, 3, 5, 10]:
                so = lam(EoF, zf, az)
                x = (so - nd.uniform_filter(so, 25))[mfit]
                g = float((x * y).sum() / (x * x).sum())
                r = np.corrcoef(x, y)[0, 1]
                if best is None or r > best[0]:
                    best = (r, az, zf, g)
        r, az, zf, g = best
        f = np.clip(1 + g * (lam(EnF, zf, az) - lam(EoF, zf, az)), .55, 1.7)
        res = im.copy()
        res[region] = res[region] * f[region, None]
        q = getattr(src, 'quantization', None)
        out[k] = b64(Image.fromarray(np.clip(res, 0, 255).round().astype(np.uint8)), 'JPEG',
                     **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}))
        print('  relit %s: light az %d, zf %d, gain %.2f (corr %.2f)' % (k, az, zf, g, r))
    return out, EoF, EnF


def paint_river(D, key, pts_px, width=1.6, colour=(63, 111, 134)):
    """a river drawn on a painted map: a line along its smoothed course, blended over the paint"""
    src = Image.open(io.BytesIO(base64.b64decode(D[key])))
    im = src.convert('RGB')
    over = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ImageDraw.Draw(over).line([tuple(p) for p in pts_px], fill=colour + (205,), width=max(1, int(round(width))), joint='curve')
    over = over.filter(ImageFilter.GaussianBlur(.6))
    im = Image.alpha_composite(im.convert('RGBA'), over).convert('RGB')
    q = getattr(src, 'quantization', None)
    return b64(im, 'JPEG', **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}))


def retint(arr, EoF, EnF, ok, src, step=150.0):
    """the satellite and relief maps tinted for the new height where the ground moved more than `step` m (relight only
    shades them; a 3.8 km mouth would keep its snow): each pixel scaled by the colour of the unmoved land of its new
    height round it over that of its old height (the 12 nearest in place and height, 60 km and 120 m apart weighing
    alike), so its own texture and shading stay; eased in over `step` to 2 x `step` m"""
    from scipy.spatial import cKDTree
    d = np.abs(EnF - EoF)
    mv = ok & (d > step)
    if not mv.any():
        return arr
    yy, xx = np.mgrid[0:arr.shape[0], 0:arr.shape[1]]
    don = src & (d < 10) & ((yy % 2) == 0) & ((xx % 2) == 0)
    near = nd.binary_dilation(mv, iterations=40)
    don &= near
    a = arr.astype(float)
    ft = lambda m, H: np.stack([xx[m] / 30.0, yy[m] / 30.0, H[m] / 120.0], 1)
    tree = cKDTree(ft(don, EoF))
    cols = a[don]
    _, i_new = tree.query(ft(mv, EnF), k=12)
    _, i_old = tree.query(ft(mv, EoF), k=12)
    f = np.clip((cols[i_new].mean(1) + 8) / (cols[i_old].mean(1) + 8), .4, 2.5)
    w = sstep(step, 2 * step, d[mv])[:, None]
    a[mv] = a[mv] * (1 - w) + np.clip(a[mv] * f, 0, 255) * w
    return np.clip(a, 0, 255).round().astype(np.uint8)


def desert(arr, EF, rain, tm, skip, region, w, mm=150.0, step=250.0):
    """the satellite map in `region` repainted as the map's own hyperarid desert: the median colour, by height (bins of
    `step` m), of the land elsewhere with under `mm` of rain (not snow), laid under each pixel's own
    brightness detail (its brightness over the local mean), so the texture and the relief's shading stay and the
    vegetation's colour goes; blended by `w` (0-1)"""
    a = arr.astype(float)
    lum0 = a.mean(-1)
    don = (rain < mm) & (tm > -85) & ~skip & ~region & (EF < 6000) & (lum0 < 170)
    w = w * sstep(205, 175, lum0)                        # snow and ice keep their white
    hb = np.floor(np.clip(EF, -2000, 5000) / step).astype(int)
    bins = np.unique(hb[w > 0]) if (w > 0).any() else []
    target = np.zeros_like(a)
    have = {b: np.median(a[don & (hb == b)], 0) for b in np.unique(hb[don]) if (don & (hb == b)).sum() >= 200}
    if not have:
        return arr
    keys = np.array(sorted(have))
    for b in bins:
        m = (hb == b) & (w > 0)
        target[m] = have[int(keys[np.argmin(np.abs(keys - b))])]
    lum = a.mean(-1)
    det = np.clip((lum + 4) / (nd.gaussian_filter(lum, 6.0) + 4), .6, 1.5)[..., None]
    w3 = np.clip(w, 0, 1)[..., None]
    return np.clip(a * (1 - w3) + target * det * w3, 0, 255).round().astype(np.uint8)


def by_climate(arr, EF, rain, tm, skip, region, w, rstep=100.0, hstep=500.0, tstep=4.0, least=150):
    """the satellite map in `region` repainted for its climate: each pixel takes the median colour of the land elsewhere
    of its rain, height and mean temperature (bins of `rstep` mm, `hstep` m, `tstep` C; the nearest bin held by
    `least` pixels or more), laid under its own brightness detail as desert() does; blended by `w` (0-1)"""
    a = arr.astype(float)
    lum0 = a.mean(-1)
    w = w * sstep(205, 175, lum0)
    if not (w > 0.01).any():
        return arr
    key = lambda m: np.stack([np.floor(rain[m] / rstep), np.floor(np.clip(EF[m], -2600, 9000) / hstep),
                              np.floor(tm[m] / tstep)], 1).astype(int)
    don = ~skip & ~region & (lum0 < 170) & (tm > -85)
    kd = key(don)
    uniq, inv, cnt = np.unique(kd, axis=0, return_inverse=True, return_counts=True)
    cols = a[don]
    ok = np.nonzero(cnt >= least)[0]
    med = np.array([np.median(cols[inv.ravel() == u], 0) for u in ok])
    have = uniq[ok]
    tg = w > 0.01
    kt = key(tg)
    from scipy.spatial import cKDTree
    _, nn = cKDTree(have * np.array([1.0, 1.0, 1.0])).query(kt, k=1)
    target = np.zeros_like(a)
    target[tg] = med[nn]
    lum = a.mean(-1)
    det = np.clip((lum + 4) / (nd.gaussian_filter(lum, 6.0) + 4), .6, 1.5)[..., None]
    w3 = np.where(tg, np.clip(w, 0, 1), 0)[..., None]
    return np.clip(a * (1 - w3) + target * det * w3, 0, 255).round().astype(np.uint8)


def inpaint(arr, hole, src=None):
    """the pixels of `hole` painted from the picture round them: each from the nearest scale of a normalized blur
    that reaches enough of it (fine at the edges, broad inside), then blended in over a pixel; `src`: the pixels it may
    take colour from (all outside the hole by default)"""
    out = arr.astype(float).copy()
    valid = (~hole if src is None else ~hole & src).astype(float)
    done = np.zeros(hole.shape, bool)
    for sg in (1.5, 3.0, 6.0, 12.0, 24.0, 48.0):
        w = nd.gaussian_filter(valid, sg)
        ok = hole & ~done & (w > 0.15)
        if ok.any():
            for c in range(out.shape[2]):
                out[..., c][ok] = (nd.gaussian_filter(arr[..., c].astype(float) * valid, sg)[ok] / w[ok])
            done |= ok
    if (hole & ~done).any():
        _, (iy, ix) = nd.distance_transform_edt(valid < 0.5, return_indices=True)
        out[hole & ~done] = arr[iy, ix][hole & ~done]
    soft = np.clip(nd.gaussian_filter(hole.astype(float), 1.0) * 1.5, 0, 1)[..., None]
    return np.clip(arr * (1 - soft) + out * soft, 0, 255).astype(np.uint8)


def lake_style(arr, arr0, poly, wet0, wet, reach_in=8, reach_out=14):
    """the region's lakes painted as its own lakes were (the Bowl's: an ochre salt rim inside the shore, a teal core,
    a pale salt flat outside fading into the ground): the colour at each distance from the shore, inside and out, is
    sampled from the old picture `arr0` round the old water `wet0`, and laid over today's water `wet` and its shores
    (the rim narrowed on water too narrow for it), the picture's fine texture kept. Full-res masks; returns the picture"""
    w0 = wet0 & poly
    if w0.sum() < 50:
        return arr
    din0, dout0 = nd.distance_transform_edt(w0), nd.distance_transform_edt(~w0)
    a0 = arr0.astype(float)
    prof_in = []
    for d in range(1, reach_in + 1):
        m = w0 & (np.abs(din0 - d) < 0.5) if d < reach_in else w0 & (din0 >= reach_in - 0.5)
        prof_in.append(np.median(a0[m], 0) if m.sum() > 10 else (prof_in[-1] if prof_in else a0[w0].mean(0)))
    prof_out = []
    for d in range(1, reach_out + 1):
        m = poly & ~wet0 & (np.abs(dout0 - d) < 0.5)
        prof_out.append(np.median(a0[m], 0) if m.sum() > 10 else prof_out[-1])
    prof_in, prof_out = np.array(prof_in), np.array(prof_out)
    w = wet & poly
    din, dout = nd.distance_transform_edt(w), nd.distance_transform_edt(~w)
    # water narrower than the old lakes' rim and core: its distances stretched, so it keeps a core
    half = nd.maximum_filter(np.where(w, din, 0), size=9)
    din_eff = np.where(w, din / np.clip(half / reach_in, 0.35, 1.0), 0)
    a = arr.astype(float)
    col = np.zeros_like(a)
    ii = np.clip(np.round(din_eff).astype(int), 1, reach_in) - 1
    oo = np.clip(np.round(dout).astype(int), 1, reach_out) - 1
    col[w] = prof_in[ii[w]]
    shore = poly & ~w & (dout <= reach_out)
    col[shore] = prof_out[oo[shore]]
    wgt = np.where(w, 1.0, np.where(shore, np.clip(1 - (dout - 1) / reach_out, 0, 1), 0.0))
    wgt = nd.gaussian_filter(wgt, 0.8) * (nd.gaussian_filter(poly.astype(float), 2.0) > 0.5)
    detail = a - nd.gaussian_filter(a, (1.5, 1.5, 0))
    new = col + 0.6 * detail
    return np.clip(a * (1 - wgt[..., None]) + new * wgt[..., None], 0, 255).astype(np.uint8)
