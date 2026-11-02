"""Rain, climate class and zone where the heights changed (reclimate), the temperatures' lapse with the surface (lapse),
and a lake's rain (lake_rain).

The generator that first made the climate is not in the repo: reclimate re-derives a changed cell from the unchanged
land most like it (history/edit_heights.py, 4.18-4.19, lifted unchanged); lake_rain from history/edit_rivers.py.
"""
import numpy as np
from PIL import Image
from scipy import ndimage as nd

from .page import b64, raster

TEMPS = ('tm', 'th', 'tl', 'tw', 'tc')     # mean, hottest afternoon, coldest night, warmest month, coldest month
LAPSE_C_PER_KM = 6.5
AIRLESS_MEAN_C = -75.0                      # 4.23: past ~17 km the ground's temperature is the sun's, not the air's


def lapse(D, E, En, whas, wlev, whas2=None, wlev2=None):
    """the five temperature rasters lapsed with the surface (the water's level where there is water): -6.5 C per km
    the surface rose, on the full grid; airless cells (a byte of 0, -90 C) stay. Returns {key: base64 PNG}
    (history/edit_heights.py 4.19, as a function)."""
    whas2 = whas if whas2 is None else whas2
    wlev2 = wlev if wlev2 is None else wlev2
    OH, OW = D['fullH'], D['fullW']
    surf = lambda Ex, w, lev: np.where(w, np.fmax(Ex, np.nan_to_num(lev, nan=-1e9)), Ex)
    zoom = (OH / E.shape[0], OW / E.shape[1])
    DS = nd.zoom(surf(En, whas2, wlev2) - surf(E, whas, wlev), zoom, order=1)[:OH, :OW]
    out = {}
    for k in TEMPS:
        v = raster(D, k, 'L').astype(float) - 90
        ok = (v > -89) & (np.abs(DS) > 1)
        v2 = np.where(ok, np.round(v - LAPSE_C_PER_KM * DS / 1000), v)
        out[k] = b64(Image.fromarray(np.clip(v2 + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    return out


def reclimate(D, E, En, whas, forced, cap=None, force_rain=None):
    """4.18: rain, climate class and zone recomputed where the heights changed (the model's own generator is not in the
    repo, so they are re-derived from the model itself). A changed cell takes the rain, class and zone of the unchanged
    land cells most like it nearby: the nearest in (place, height, windward slope under the north-west wind, mean
    temperature), so new mountains get the rain and the cold classes the model gives mountains round them, a basin cut
    into the abyss gets the abyss's. `forced` (full-res bool) is left alone (a cut's own classes). Returns the new
    full-res rain (mm), class and zone, the changed mask and a report."""
    from scipy.spatial import cKDTree
    OH, OW = D['fullH'], D['fullW']
    zoom = (OH / E.shape[0], OW / E.shape[1])
    Eo, Ef = nd.zoom(E, zoom, order=1)[:OH, :OW], nd.zoom(En, zoom, order=1)[:OH, :OW]
    wetF = nd.zoom(whas.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)
    rain = raster(D, 'p', 'L').astype(float) / 255 * 4000
    cls = raster(D, 'c', 'L')
    zon = raster(D, 'z', 'L')
    tm = raster(D, 'tm', 'L').astype(float) - 90

    def windward(H):
        gy, gx = np.gradient(nd.gaussian_filter(H, 2.0), 2000.0)
        return (gx + gy) / np.sqrt(2) * 1000            # m per km rising toward the south-east (the wind's way)
    wo, wn = windward(Eo), windward(Ef)
    changed = nd.binary_dilation(np.abs(Ef - Eo) > 40, iterations=2) & ~wetF & ~forced
    codes = [c['code'] for c in D['climate']['classes']]
    airless = cls == codes.index('O') if 'O' in codes else np.zeros(cls.shape, bool)
    pool = ~changed & ~wetF & ~airless & (tm > -89) & ~forced   # a cut's forced class is no twin
    yy, xx = np.mgrid[0:OH, 0:OW]
    feat = lambda m, H, W: np.stack([xx[m] / 40.0, yy[m] / 40.0, H[m] / 350.0, W[m] / 60.0, tm[m] / 2.5], 1)
    tree = cKDTree(feat(pool, Eo, wo))
    pr, pc, pz = rain[pool], cls[pool], zon[pool]
    q = changed & ~airless
    d, idx = tree.query(feat(q, Ef, wn), k=12)
    w = 1.0 / (d + .25)
    nrain = (pr[idx] * w).sum(1) / w.sum(1)

    def vote(v):
        out = np.empty(len(v), np.uint8)
        for r in range(len(v)):
            sc = {}
            for k_ in range(v.shape[1]):
                sc[v[r, k_]] = sc.get(v[r, k_], 0) + w[r, k_]
            out[r] = max(sc, key=sc.get)
        return out
    rain2, cls2, zon2 = rain.copy(), cls.copy(), zon.copy()
    rain2[q] = nrain
    zon2[q] = vote(pz[idx])
    # one cell's own slope makes the rain banded: it is smoothed over the cells recomputed
    rs = nd.gaussian_filter(rain2, 2.5)
    rain2[q] = rs[q]
    if cap is not None:     # a cut's dry rain (main): over the cut and its eased edge, which are recomputed with it
        dry, k = cap
        rain2 = rain2 + k * (np.minimum(rain2, dry) - rain2)
        q = q | (k > 0) & ~forced & ~airless & ~wetF
    if force_rain is not None:   # (rain, weight): a rain set from outside (4.21's abyss floor), the class following it
        fr_, k = force_rain
        rain2 = rain2 + k * (fr_ - rain2)
        q = q | (k > 0) & ~forced & ~airless & ~wetF
    # 4.19: THE CLASS FOLLOWS THE CELL'S OWN CLIMATE. 4.18 voted the class from its look-alikes apart from the rain, so a
    # cell could take a wet rain and a desert class (abyssal desert at 1,400 mm). Now each recomputed cell takes the class
    # the model gives the unchanged land with the same climate: the nearest in (rain, mean, warmest and coldest
    # temperature, air pressure), so the model's own thresholds decide (its XW stays under ~400 mm, its XA over ~1,300).
    tw = raster(D, 'tw', 'L').astype(float) - 90
    tc = raster(D, 'tc', 'L').astype(float) - 90
    prs = lambda H: np.exp(-H / 8000.0) * 1.6
    cfeat = lambda m, H, Rn: np.stack([Rn[m] / 120.0, tm[m] / 2.0, tw[m] / 2.5, tc[m] / 2.5, prs(H)[m] / .04], 1)
    ctree = cKDTree(cfeat(pool, Eo, rain))
    d2, idx2 = ctree.query(cfeat(q, Ef, rain2), k=40)
    # and never a class whose rain the cell is outside: each class's 2nd to 98th percentile of rain over the land kept,
    # so the hottest abyss floor, whose only twins are dry, cannot take abyssal desert at 1,500 mm
    lo_, hi_ = np.full(256, 0.0), np.full(256, 1e9)
    for k_ in np.unique(pc):
        r_ = rain[pool][pc == k_]
        if len(r_) > 50:
            lo_[k_], hi_[k_] = np.percentile(r_, 2), np.percentile(r_, 98)
    rq = rain2[q][:, None]
    fits = (rq >= lo_[pc[idx2]]) & (rq <= hi_[pc[idx2]])
    w = 1.0 / (d2 + .2) * np.where(fits.any(1, keepdims=True), fits, 1.0)
    out_ = vote(pc[idx2])
    # none of the 40 fits (the hottest floor, 35 C and over, has dry twins only): the nearest twin of any class that does
    none = np.nonzero(~fits.any(1))[0]
    if len(none):
        fq = cfeat(q, Ef, rain2)[none]
        best_ = np.full(len(none), np.inf)
        for k_ in np.unique(pc):
            ok_ = (rq[none, 0] >= lo_[k_]) & (rq[none, 0] <= hi_[k_])
            if not ok_.any():
                continue
            dk, _ = cKDTree(cfeat(pool, Eo, rain)[pc == k_]).query(fq[ok_], k=1)
            rows = np.nonzero(ok_)[0]
            better = dk < best_[rows]
            best_[rows[better]] = dk[better]
            out_[none[rows[better]]] = k_
    cls2[q] = out_
    ys_, xs_ = np.nonzero(q)
    y0, y1, x0, x1 = max(0, ys_.min() - 3), ys_.max() + 4, max(0, xs_.min() - 3), xs_.max() + 4
    for arr in (zon2,):   # the class is now decided by the climate itself and needs no smoothing of its own
        sub = arr[y0:y1, x0:x1]
        best, cnt = sub.copy(), np.zeros(sub.shape)
        for k in np.unique(sub[q[y0:y1, x0:x1]]):
            c = nd.uniform_filter((sub == k).astype(float), 5)
            better = c > cnt
            best[better], cnt[better] = k, c[better]
        m = q[y0:y1, x0:x1]
        sub[m] = best[m]
    moved = cls2 != cls
    rep = {'cells': int(q.sum()), 'class_changed': int(moved.sum()),
           'rain_mean_before_mm': round(float(rain[q].mean()), 0) if q.any() else 0,
           'rain_mean_after_mm': round(float(rain2[q].mean()), 0) if q.any() else 0,
           'classes_now': {codes[k]: int(((cls2 == k) & q).sum()) for k in np.unique(cls2[q])} if q.any() else {}}
    return rain2, cls2, zon2, q, rep


def lake_rain(rain0, wet0, wet, zr, sig=6.0, bg_sig=15.0):
    """the abyss floor's rain from 4.20's own lake effect (its floor is wet beside its lakes, ~1,500 mm within 4 km, and
    dry far from them, ~200-450 mm): a dry background (4.20's rain on floor land far from its water, spread over the
    floor) times the ratio 4.20's floor land shows at each share of water round it (a gaussian of `sig` px), made
    monotone; applied to today's water `wet` over the floor `zr` (full-res masks). Returns (rain, the table)"""
    fr0 = nd.gaussian_filter(wet0.astype(float), sig)
    fr = nd.gaussian_filter(wet.astype(float), sig)
    land0 = zr & ~wet0
    far0 = land0 & (fr0 < 0.03)
    num = nd.gaussian_filter(np.where(far0, rain0, 0.0), bg_sig)
    den = nd.gaussian_filter(far0.astype(float), bg_sig)
    bg = np.where(den > 1e-3, num / np.maximum(den, 1e-6), np.median(rain0[far0]))
    edges = np.array([0, .02, .05, .1, .15, .2, .3, .4, .55, .7, 1.01])
    cent, med = [], []
    q = rain0 / np.maximum(bg, 50)
    for a, b in zip(edges[:-1], edges[1:]):
        m = land0 & (fr0 >= a) & (fr0 < b)
        if m.sum() > 30:
            cent.append(float(np.median(fr0[m])))
            med.append(float(np.median(q[m])))
    med = np.maximum.accumulate(np.array(med))
    med = med / med[0]
    return bg * np.interp(fr, cent, med), [[round(c, 3), round(float(m), 2)] for c, m in zip(cent, med)]


def extend_latitude_temps_and_wind(D_old, E_old, En_exp, whas0, wlev0, whas2, wlev2, dy_h, dx_h, dy_f, dx_f):
    """Synthesize baseline temperature rasters (`tm`, `th`, `tl`, `tw`, `tc` on the expanded full grid) and wind (`wd`
    on the expanded height grid) when the map canvas is extended northward (`dy_f` px toward the equator) and westward
    (`dx_f` px into the Steaming Sea / storm track).

    - Fits the planet's latitudinal sea-level datum temperature and seasonal amplitude from the existing map (`D_old`),
      extrapolates northward (`y < dy_f`, ~ +4.2 C warmer at the new northern edge, with reduced seasonal swing closer
      to the equator) and westward (`x < dx_f`, marine moderation over the ocean and Arch).
    - Preserves untouched interior cells of the original map verbatim, and applies `-6.5 C/km` lapse where existing
      heights changed.
    """
    VH, VW = En_exp.shape
    OH0, OW0 = D_old['fullH'], D_old['fullW']
    OH, OW = OH0 + dy_f, OW0 + dx_f
    zoom = (OH / VH, OW / VW)

    surf_exp = np.where(whas2, np.fmax(En_exp, np.nan_to_num(wlev2, nan=-1e9)), En_exp)
    Sf = nd.zoom(surf_exp, zoom, order=1)[:OH, :OW]
    Ef = nd.zoom(En_exp, zoom, order=1)[:OH, :OW]
    wet2F = nd.zoom(whas2.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)

    # Distance to water (km) for coastal/marine thermal moderation in the new territory
    d_sea_px = nd.distance_transform_edt(~wet2F)
    marine_mod = np.exp(-d_sea_px / 38.0)  # 1.0 on water, decays over ~75 km inland

    # Fit sea-level equivalent temperatures along the northern & western margins of D_old
    zoom0 = (OH0 / E_old.shape[0], OW0 / E_old.shape[1])
    surf0 = np.where(whas0, np.fmax(E_old, np.nan_to_num(wlev0, nan=-1e9)), E_old)
    S0f = nd.zoom(surf0, zoom0, order=1)[:OH0, :OW0]

    Yf, Xf = np.indices((OH, OW), dtype=np.float32)
    # Normalized latitude coordinate: y_old = 0 was ~30 S, y_old = 1393 was ~58 S; y_new = 0 is ~23.4 S
    # Equatorward warming: +0.0095 C per full-res px northward from y = dy_f (+3.1 C at y=0),
    # plus tropical/subtropical low-elevation warmth in the Ria Valley & Steaming Sea
    lat_shift_px = (dy_f - Yf)  # positive in the northern extension (y < dy_f), negative southward

    # Base sea-level mean temperature field across the expanded canvas:
    # At y = dy_f (old top edge), sea-level T_mean is ~22.5 C in the west (ocean) and ~20.5 C in the east;
    # At y = 0 (new northern edge, ~23.4 S), sea-level T_mean reaches ~25.5 C;
    # At y = OH (southern edge, ~58 S), sea-level T_mean is ~13.5 C.
    tm_sl = 21.8 + 0.0082 * lat_shift_px - 0.0014 * (Xf - dx_f) + 1.4 * marine_mod
    # Seasonal half-swing (TW - TM and TM - TC): smaller near the equator and over the ocean, larger inland & poleward
    seas_amp = np.clip((4.8 - 0.0028 * lat_shift_px) * (1.0 - 0.48 * marine_mod) + 1.8, 1.8, 13.5)
    # Diurnal / extreme half-swing (TH - TW and TC - TL)
    diurn_amp = np.clip(6.2 * (1.0 - 0.42 * marine_mod) + 2.2, 2.2, 11.0)

    # Effective lapse rate (-6.2 C/km up to 9 km)
    lapse_drop = LAPSE_C_PER_KM * (Sf / 1000.0)
    tm_syn = tm_sl - lapse_drop
    tw_syn = tm_syn + seas_amp
    tc_syn = tm_syn - seas_amp
    th_syn = tw_syn + diurn_amp
    tl_syn = tc_syn - diurn_amp

    syn_map = {'tm': tm_syn, 'tw': tw_syn, 'tc': tc_syn, 'th': th_syn, 'tl': tl_syn}

    # Build padded old surface height to seamlessly blend along the red boundary line
    S0_pad = np.pad(S0f, ((dy_f, 0), (dx_f, 0)), mode='edge')
    DS_old = Sf - S0_pad

    out_temps = {}
    for k in TEMPS:
        v0 = raster(D_old, k, 'L').astype(float) - 90.0
        # Pad v0 into the new canvas using edge values as a starting reference, then blend with latitudinal model
        v0_pad = np.pad(v0, ((dy_f, 0), (dx_f, 0)), mode='edge')
        ok0 = v0_pad > -89.0
        # Lapsed edge continuation from old boundary + latitudinal equatorward shift
        d_lat_from_edge = np.maximum(0.0, dy_f - Yf)
        equator_boost = 0.0085 * d_lat_from_edge
        if k == 'tc' or k == 'tl':
            equator_boost = 0.0110 * d_lat_from_edge  # winters warm fastest toward the equator!
        elif k == 'tw' or k == 'th':
            equator_boost = 0.0065 * d_lat_from_edge

        v_edge_lapsed = v0_pad - LAPSE_C_PER_KM * (DS_old / 1000.0) + equator_boost
        v_new_combined = np.where(ok0, 0.55 * v_edge_lapsed + 0.45 * syn_map[k], syn_map[k])

        # Inside the original box [dy_f:, dx_f:], apply exact C.lapse where heights changed, keep untouched exact!
        v_old_lapsed = np.where((v0 > -89.0) & (np.abs(DS_old[dy_f:, dx_f:]) > 1.0),
                                np.round(v0 - LAPSE_C_PER_KM * DS_old[dy_f:, dx_f:] / 1000.0), v0)

        v_full = np.round(v_new_combined)
        v_full[dy_f:, dx_f:] = v_old_lapsed

        # Airless above 9,000 m on newly created mountains (byte 0 -> -90 C)
        in_new = np.ones((OH, OW), dtype=bool)
        in_new[dy_f:, dx_f:] = False
        v_full = np.where(in_new & (Ef > 9000.0), -90.0, v_full)

        out_temps[k] = np.clip(v_full, -90.0, 165.0)

    # Also extend `wd.png` (wind on the height grid: R=power, G=speed, B=airless)
    wd0 = raster(D_old, 'wd', 'RGB')
    if wd0.shape[0] != VH - dy_h or wd0.shape[1] != VW - dx_h:
        wd0 = np.array(Image.fromarray(wd0, 'RGB').resize((VW - dx_h, VH - dy_h), Image.Resampling.BILINEAR))
    wd_pad = np.pad(wd0, ((dy_h, 0), (dx_h, 0), (0, 0)), mode='edge')
    gy_h, gx_h = np.gradient(nd.gaussian_filter(En_exp, 1.5), 4000.0)
    slope_nw = (gx_h + gy_h) / np.sqrt(2.0)
    elev_factor = np.clip((En_exp + 500.0) / 4500.0, 0.25, 1.85)
    sea_fetch = nd.gaussian_filter(whas2.astype(float), 6.0)
    v_syn = np.clip(6.8 * elev_factor + 3.4 * sea_fetch + 18.0 * np.maximum(0.0, slope_nw), 1.8, 24.0)
    g_syn = np.clip(np.round(v_syn / D_old.get('wdvmax', 25.0) * 255.0), 0, 255).astype(np.uint8)
    p_syn = np.clip((v_syn / 11.5) ** 3 * 650.0 * np.exp(-np.maximum(0.0, En_exp) / 8000.0), 10.0, 2950.0)
    r_syn = np.clip(np.round((p_syn / D_old.get('wdmax', 3000.0)) ** (1.0 / D_old.get('wdgam', 2.2)) * 255.0), 0, 255).astype(np.uint8)
    b_syn = np.where(En_exp > 9000.0, 255, 0).astype(np.uint8)
    wd_syn = np.stack([r_syn, g_syn, b_syn], axis=-1)

    # Smooth transition across the old boundary for wd
    in_old_h = np.zeros((VH, VW), dtype=bool)
    in_old_h[dy_h:, dx_h:] = True
    dist_into_old_h = nd.distance_transform_edt(in_old_h)
    w_wd_old = np.clip((dist_into_old_h - 1.0) / 8.0, 0.0, 1.0)[..., None]
    wd_new = np.clip(np.round(wd_syn * (1.0 - w_wd_old) + wd_pad * w_wd_old), 0, 255).astype(np.uint8)
    wd_new[dy_h + 8:, dx_h + 8:] = wd0[8:, 8:]
    wd_new[..., 2] = np.where(En_exp > 9000.0, 255, wd_new[..., 2])

    return out_temps, wd_new

