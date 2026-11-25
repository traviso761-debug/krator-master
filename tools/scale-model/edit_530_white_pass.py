#!/usr/bin/env python3
"""Scale model 5.1, edit 30 (2026-11-25): White Pass through the NW outer wall, White Lake, Matron's Coast and Arkerum (the
owner: "carve a pass thru the nw outer wall at 'white pass', carve out a secondary, smaller Yeti settlement at the polygon
'white lake' (which will be made like one of the sasquatch lakes); the yetis will toll the white pass, anchored at its
other end by Arkerum, a spear-queen city in a protected ejecta crate formed within the new biome "Matron's Coas", which
will be a temperate rainforest biome hosting famously giant snails and crawling mollsucs. the biome polygon needs to be
dredged out of the sea; farside has also been re adjusted"; the pass ~5.4 km; Farside the polygon only).

    python tools/scale-model/edit_530_white_pass.py [--dry]

The polygons and the pin are the live map's (edit_530_live.json). At the model's 2 km cells, never raising the wall:
1. **Matron's Coast** raised from the sea inside its polygon (its sea cells, smoothed): a coastal plain rising ~11 m a px
   from the new shore with low hills, joining the coast it had; temperate rainforest, Cfb with ~2,800 mm, its paint a dark
   rainforest green.
2. **Arkerum's crater** at the pin (459,340): an ejecta crater 10 km across inside a raised rim (+430 m over its floor at
   60 m), its apron fading out by 18 km; one narrow breach on the seaward side to 25 m, the city's harbour gate.
3. **White Pass** along its polygon: a U-trough on the polygon's centre line whose floor is the land or a tent rising
   from both ends to a 5,400 m summit on the crest, whichever is lower; the walls rise 2,000 m across the polygon's half
   width (never above the land).
4. **White Lake** inside its polygon, as the Sasquatch troughs were made (smodel/nw_expansion.py, 8B): a glacial trough
   along the polygon's long axis, its floor at 5,900 m, its walls flaring 2,150 m to the snow peaks; a half-frozen tarn
   (7 by 4 km, level 5,890 m, class WH) in it; the Yeti town of Whitelake on its shore, which tolls the pass.
5. Rain, class and zone re-derived where the land moved (Matron's Coast held to Cfb, the tarn WH); temperatures lapsed;
   the paint relit; the new water and land painted.
6. The page: the five polygons (White Pass, whitelake, Matron's Coast, farside, Farside) as the defaults and reconcile key
   5.1e26 for them; Arkerum (Spear-Queens of Yonni) and Whitelake (Yeti Kingdom) in defSetts and SETT_ADDED 5.1e26.
Refuses to run twice (the Whitelake pin).
"""
import json, math, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C, smodel.geom as G   # noqa: E402

KEY = '5.1e26'
LIVE = json.load(open(os.path.join(HERE, 'edit_530_live.json'), encoding='utf-8'))
REG = {r['name']: r for r in LIVE['regions']}
ARK = LIVE['settlements'][0]
SRC = os.path.join(HERE, 'model', 'src')


def mask(pts, shape):
    return G.poly([tuple(p) for p in pts], 1.0, 1.0, shape)


def pca_axis(pts):
    P_ = np.array(pts, float); c = P_.mean(0)
    w, v = np.linalg.eigh(np.cov((P_ - c).T))
    a = v[:, np.argmax(w)]
    t = (P_ - c) @ a
    return c, a, t.min(), t.max()


def main():
    dry = '--dry' in sys.argv
    rng = np.random.default_rng(53001)
    D = P.load()
    S = P.settlements()
    if any(s.get('id') == 'swhitelake01' for s in S):
        sys.exit('edit_530 has run already (Whitelake is on the map)')
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = E0.shape
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]
    lab, _ = nd.label(whas0); size = np.bincount(lab.ravel()); size[0] = 0
    sea = whas0 & (size[lab] > 20000)
    En, whas, wlev, W1 = E0.copy(), whas0.copy(), wlev0.copy(), W0.copy()
    rep = {'edit': "5.1 edit 30: White Pass, White Lake, Matron's Coast, Arkerum", 'date': '2026-11-25'}
    codes = [c['code'] for c in D['climate']['classes']]

    # ---- 1. Matron's Coast from the sea
    Mpoly = mask(REG["Matron's Coast"]['points'], sh)
    newland = nd.binary_opening(nd.binary_closing(Mpoly & sea, iterations=2), iterations=1) & sea
    still_sea = sea & ~newland
    dsea = nd.distance_transform_edt(~still_sea)
    old_land = ~whas0
    dold, (oy, ox) = nd.distance_transform_edt(~old_land, return_indices=True)
    hold = np.clip(E0[oy, ox], 3.0, 200.0)                  # the old shore's own height, so its rivers run on downhill
    frac = dsea / (dsea + dold + 1e-9)
    hills = nd.gaussian_filter(rng.standard_normal(sh), 4.0); hills /= hills.std() + 1e-9
    mid = np.clip(np.minimum(dsea, dold) / 6.0, 0, 1)
    h_new = 3.0 + (hold - 3.0) * frac + 45.0 * np.clip(hills, -1.0, 2.0) * mid
    h_new = np.clip(h_new, 2.0, 400.0)
    En[newland] = h_new[newland]
    whas[newland] = False; wlev[newland] = np.nan; W1[newland] = False
    rep['matron_new_land_cells'] = int(newland.sum())
    rep['matron_new_land_km2'] = int(newland.sum() * 4)

    # ---- 2. Arkerum's crater
    ax, ay = float(ARK['px']), float(ARK['py'])
    r = np.hypot(XX - ax, YY - ay)
    near = r <= 9.5
    ground = np.where(near, En, np.nan)
    base = float(np.nanmedian(np.where((r > 7) & (r <= 9.5) & ~whas, En, np.nan)))
    rim_top = 60.0 + 430.0
    prof = np.where(r <= 3.6, 60.0 + 8.0 * (r / 3.6) ** 2,
           np.where(r <= 5.0, 68.0 + (rim_top - 68.0) * G.sstep(3.6, 5.0, r),
           rim_top - (rim_top - base) * G.sstep(5.0, 9.0, r)))
    # the breach toward the nearest open sea
    sd, (sy, sx) = nd.distance_transform_edt(~still_sea, return_indices=True)
    tx, ty = sx[int(ay), int(ax)] - ax, sy[int(ay), int(ax)] - ay
    nrm = math.hypot(tx, ty) or 1.0; ux, uy = tx / nrm, ty / nrm
    along = (XX - ax) * ux + (YY - ay) * uy; across = np.abs(-(XX - ax) * uy + (YY - ay) * ux)
    gate = (along > 2.5) & (along < 9.0) & (across < 0.9)
    prof = np.where(gate, np.minimum(prof, 25.0), prof)
    crater = near & ~still_sea
    inner = crater & (r <= 5.0)
    En[inner] = prof[inner]                                   # the bowl and rim as made
    apron = crater & (r > 5.0)
    En[apron] = np.maximum(En[apron], prof[apron]) if True else En[apron]   # the apron raised over the plain, not cut
    En[crater & gate] = np.minimum(En[crater & gate], 25.0)
    rep['arkerum'] = {'floor_m': 60, 'rim_m': int(rim_top), 'apron_base_m': round(base), 'breach_toward': [round(ux, 2), round(uy, 2)]}

    # ---- 3. White Pass
    Ppoly = mask(REG['White Pass']['points'], sh)
    ys = np.nonzero(Ppoly.any(1))[0]
    cl = np.array([[XX[y][Ppoly[y]].mean(), y] for y in ys], float)
    cl[:, 0] = nd.uniform_filter1d(cl[:, 0], 7, mode='nearest')
    s_ = np.r_[0, np.cumsum(np.hypot(*np.diff(cl, axis=0).T))]
    eline = nd.uniform_filter1d(np.array([En[int(round(y)), int(round(x))] for x, y in cl]), 5, mode='nearest')
    ic = int(np.argmax(eline)); sc, Lc = s_[ic], s_[-1]
    SUM = 5400.0
    en_n, en_s = eline[0], eline[-1]
    tent = np.minimum.reduce([np.full_like(s_, SUM), en_n + (SUM - en_n) * s_ / max(sc, 1e-6),
                              en_s + (SUM - en_s) * (Lc - s_) / max(Lc - sc, 1e-6)])
    floor = np.minimum(eline, tent)
    hw = nd.distance_transform_edt(Ppoly)
    from scipy.spatial import cKDTree
    region = nd.binary_dilation(Ppoly, iterations=3)
    pts_r = np.stack([XX[region], YY[region]], 1)
    d, ix = cKDTree(cl).query(pts_r)
    hw_loc = np.array([max(3.0, hw[int(round(cl[i, 1])), int(round(cl[i, 0]))]) for i in ix])
    trough = floor[ix] + 2000.0 * np.clip(d / hw_loc, 0, 1.6) ** 2
    En[region] = np.minimum(En[region], trough)
    rep['white_pass'] = {'summit_m': round(float(floor.max())), 'crest_was_m': round(float(eline.max())), 'length_km': round(float(Lc * 2)),
                         'north_end_m': round(float(en_n)), 'south_end_m': round(float(en_s))}

    # ---- 4. White Lake
    Lpts = REG['whitelake']['points']
    Lpoly = mask(Lpts, sh)
    c, a, t0, t1 = pca_axis(Lpts)
    p0 = c + a * t0 * 0.75; p1 = c + a * t1 * 0.75
    dxv, dyv = p1 - p0; L2 = dxv * dxv + dyv * dyv
    tp = np.clip(((XX - p0[0]) * dxv + (YY - p0[1]) * dyv) / L2, 0, 1)
    dperp = np.hypot(XX - (p0[0] + tp * dxv), YY - (p0[1] + tp * dyv))
    hwv = 6.0 * (0.58 + 0.42 * G.sstep(0.0, 0.25, np.minimum(tp, 1 - tp)))
    u = dperp / np.maximum(hwv, 1.5)
    env = nd.gaussian_filter(Lpoly.astype(float), 3.0)
    wv = ((1.0 - G.sstep(0.0, 2.15, u)) ** 1.35) * env
    hprof = 5900.0 + 2150.0 * (G.sstep(0.0, 2.05, u) ** 1.45)
    # the full trough at its middle (the Sasquatch troughs blended 0.88 into 7-8 km ridges; this shoulder stands ~9.5 km, and
    # 0.88 left the floor ~400 m over the tarn)
    En = En * (1 - wv) + np.minimum(En, hprof) * wv
    # the tarn: an ellipse along the axis at the polygon's middle
    ang = math.atan2(a[1], a[0])
    xr = (XX - c[0]) * math.cos(ang) + (YY - c[1]) * math.sin(ang)
    yr = -(XX - c[0]) * math.sin(ang) + (YY - c[1]) * math.cos(ang)
    tarn = (np.hypot(xr / 3.6, yr / 2.0) <= 1.0) & Lpoly
    TL = 5890.0
    whas[tarn] = True; wlev[tarn] = TL; W1[tarn] = True
    En[tarn] = np.minimum(En[tarn], TL - 12.0)
    shore = nd.binary_dilation(tarn, iterations=2) & ~tarn & Lpoly
    En[shore] = np.maximum(En[shore], TL + 2.0)
    # the town: on the shore, toward the pass (the trough's end nearest the pass's centre line)
    sy_, sx_ = np.nonzero(shore)
    pc = cl.mean(0)
    low = En[sy_, sx_] <= TL + 200.0           # the shore's own level ground, not the trough's wall
    if not low.any():
        low = En[sy_, sx_] <= En[sy_, sx_].min() + 1.0
    sy_, sx_ = sy_[low], sx_[low]
    k = int(np.argmin(np.hypot(sx_ - pc[0], sy_ - pc[1])))
    wl_pin = (int(sx_[k]), int(sy_[k]))
    rep['white_lake'] = {'tarn_cells': int(tarn.sum()), 'level_m': TL, 'floor_m': 5900, 'centre': [round(float(c[0]), 1), round(float(c[1]), 1)],
                         'town_px': list(wl_pin), 'town_m': round(float(En[wl_pin[1], wl_pin[0]]))}

    # (after the crater, the pass and the lake, on the finished land) the rivers that met the old shore run on across the new plain to the new coast (least cost to the sea), their
    # channels cut to their running low over the new land
    import edit_528_ria_network as N
    xs_, ys_ = np.nonzero(Mpoly.T)
    N.WIN = (max(0, int(xs_.min()) - 12), max(0, int(ys_.min()) - 12), min(sh[1], int(xs_.max()) + 13), min(sh[0], int(ys_.max()) + 13))
    router = N.Router(En, whas, wlev, rng)
    sea_cells = np.nonzero(still_sea[N.WIN[1]:N.WIN[3], N.WIN[0]:N.WIN[2]].ravel())[0]
    extended = []
    for rv in D['rivers']:
        t_ = rv.get('to') or {}
        if not (t_.get('sea') or t_.get('kind') == 'sea') or not rv.get('px'):
            continue
        ex, ey = rv['px'][-1]
        jy, ix_ = int(round(ey)), int(round(ex))
        if not newland[max(0, jy - 2):jy + 3, max(0, ix_ - 2):ix_ + 3].any():
            continue
        s0, dist, pred = router.search((ex, ey), router.G)
        g = sea_cells[np.argmin(dist[sea_cells])]
        path = router.path(s0, pred, g)
        add = N.resample(G.chaikin([(ex, ey)] + [tuple(map(float, c)) for c in path[1:]], 2), 1.0)[1:]
        if len(add) == 0:
            continue
        b_last = (rv.get('bed_m') or [3.0])[-1]
        q_last = (rv.get('q_m3s') or [10.0])[-1]
        n_ = len(add)
        rv['px'] = rv['px'] + [[round(float(x), 2), round(float(y), 2)] for x, y in add]
        if rv.get('bed_m'):
            rv['bed_m'] = rv['bed_m'] + [round(float(v), 1) for v in np.linspace(min(b_last, 2.0), -1.0, n_)]
        if rv.get('q_m3s'):
            rv['q_m3s'] = rv['q_m3s'] + [round(float(q_last), 1)] * n_
        L = float(np.hypot(*np.diff(np.array(rv['px'], float), axis=0).T).sum()) * 2
        for f in ('length_km', 'len_km'):
            if f in rv:
                rv[f] = round(L, 1)
        rv['to'] = dict(t_, at_px=[round(float(add[-1][0]), 2), round(float(add[-1][1]), 2)])
        if 'mouth_m' in rv:
            rv['mouth_m'] = -1.0
        extended.append(rv['id'])
    for rv in D['rivers']:
        p = rv.get('px') or []
        if len(p) < 2:
            continue
        P_ = np.round(np.array(p, float), 2)
        jj = np.clip(np.round(P_[:, 1]).astype(int), 0, sh[0] - 1); ii = np.clip(np.round(P_[:, 0]).astype(int), 0, sh[1] - 1)
        if not newland[jj, ii].any():
            continue
        cur = np.inf
        for k_, (j_, i_) in enumerate(zip(jj, ii)):
            if not whas[j_, i_]:
                cur = min(cur, En[j_, i_])
                if newland[j_, i_]:
                    En[j_, i_] = min(En[j_, i_], cur)
    rep['rivers_extended_to_the_new_coast'] = extended
    moved = np.abs(En - E0) > 1
    rep['land_moved_cells'] = int(moved.sum())
    rep['lowered_cells'] = int((En < E0 - 1).sum()); rep['raised_cells'] = int((En > E0 + 1).sum())
    for nm, (x, y) in {'Arkerum': (int(ax), int(ay)), 'Whitelake': wl_pin}.items():
        rep.setdefault('pins', {})[nm] = {'m': round(float(En[y, x])), 'water': bool(whas[y, x])}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    json.dump(rep, open(os.path.join(HERE, 'edit_530_white_pass.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return

    # ---- 5. the rasters
    raw0 = {k: P.raster(D, k, 'L') for k in ('p', 'c', 'z')}
    D['h'] = P.encode_heights(D, En, W1)
    D['wl'] = P.encode_levels(D, whas, wlev)
    lap = C.lapse(D, E0, En, whas0, wlev0, whas, wlev)
    for k in C.TEMPS:
        D[k] = lap[k]
    forced = whas.copy()
    rain2, cls2, zon2, _, crep = C.reclimate(D, E0, En, whas, forced)
    rep['reclimate'] = crep
    Mland = Mpoly & ~whas & (En < 1500)
    cls2[Mland] = codes.index('Cfb')
    rain2[Mland] = np.maximum(rain2[Mland], 2800.0)
    if 'WH' in codes:
        cls2[tarn] = codes.index('WH')
    zcoast = raw0['z'][Mpoly & ~whas0]
    zon2[newland] = int(np.bincount(zcoast).argmax()) if zcoast.size else zon2[newland]
    zon2[tarn] = int(np.bincount(raw0['z'][whas0 & (wlev0 > 3000)]).argmax()) if (whas0 & (wlev0 > 3000)).any() else zon2[tarn]
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    rain0 = raw0['p'].astype(float) / 255 * 4000
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    hexrgb = lambda h: tuple(int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
    col = np.array([hexrgb(cc['color']) for cc in D['climate']['classes']])
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], cnow != raw0['c'])
    # the satellite and relief: the new coast's rainforest, the tarn's ice-blue water
    for key in ('st', 't'):
        arr = P.raster(D, key).astype(float)
        old_land = Mpoly & ~whas0 & (E0 < 800)
        base_col = np.median(arr[old_land], 0) if old_land.any() else np.array([52.0, 92.0, 50.0])
        rain_col = np.array([34.0, 78.0, 42.0]) * 0.55 + base_col * 0.45
        tex = nd.gaussian_filter(rng.standard_normal(sh), 1.2)[..., None] * 9.0
        arr[newland] = np.clip(rain_col + tex[newland], 0, 255)
        lake_col = np.median(arr[whas0 & (wlev0 > 3000)], 0) if (whas0 & (wlev0 > 3000)).any() else np.array([120.0, 150.0, 170.0])
        arr[tarn] = lake_col
        D[key] = P.jpeg_like(D, key, np.clip(arr, 0, 255).astype(np.uint8))
    relit, _, _ = PA.relight(D, E0, En)
    for k_, v in relit.items():
        D[k_] = v
    D['h'] = P.encode_heights(D, En, W1)
    P.save(D)

    # ---- 6. the page: the polygons as defaults, the reconcile key, the two pins
    fr = os.path.join(SRC, '51-region-store.js')
    s = open(fr, encoding='utf-8', newline='').read()
    i = s.index('const defRegs = ') + len('const defRegs = ')
    j = s.index('\n', i)
    line = s[i:j].rstrip()
    assert line.endswith(';')
    regs = json.loads(line[:-1])
    for rr in LIVE['regions']:
        rec = {'id': rr['id'], 'name': rr['name'], 'color': rr['color'], 'points': rr['points'], 'kind': rr['kind'], 'notes': rr['notes']}
        old = next((x for x in regs if x['id'] == rr['id']), None)
        if old:
            old.update(rec)
        else:
            regs.append(rec)
    s = s[:i] + json.dumps(regs, ensure_ascii=False) + ';' + s[j:]
    block = ("      if(localStorage.getItem('krator.regMerged.%s')!=='1'){   /* %s: White Pass, whitelake, Matron's Coast and the adjusted "
             "Farside polygons from the live map (edit 30, 2026-11-25) */\n        %s.forEach(id=>{ const d=defMap.get(id); if(d) regions.set(id,d); });\n"
             "        localStorage.setItem('krator.regMerged.%s','1');\n        localSave();\n      }\n") % (
        KEY, KEY, json.dumps([r['id'] for r in LIVE['regions']]), KEY)
    anchor = "    }catch(e){}"
    k_ = s.index(anchor, s.index("krator.regMerged.5.1e24"))
    s = s[:k_] + block + s[k_:]
    open(fr, 'w', encoding='utf-8', newline='\n').write(s)
    pins = [{'id': ARK['id'], 'name': 'Arkerum', 'type': 'city', 'px': ARK['px'], 'py': ARK['py'],
             'notes': "A Spear-Queen city in a sheltered ejecta crater on Matron's Coast (the temperate rainforest of the giant snails and the crawling molluscs), its harbour through a breach in the rim; the seaward anchor of White Pass, whose tolls it shares with the Yeti of Whitelake (the owner, 2026-11-25).",
             'createdAt': ARK.get('createdAt') or '2026-11-25T06:24:02.971Z', 'polity': 'Spear-Queens of Yonni'},
            {'id': 'swhitelake01', 'name': 'Whitelake', 'type': 'town', 'px': wl_pin[0], 'py': wl_pin[1],
             'notes': "The Yeti Kingdom's second, smaller town, on the shore of a half-frozen tarn in a glacial trough of the NW outer wall (as the Sasquatch troughs are), 5,890 m; it holds and tolls White Pass, whose seaward end is Arkerum (the owner, 2026-11-25).",
             'createdAt': '2026-11-25T00:00:00.000Z', 'polity': 'Yeti Kingdom'}]
    fs = os.path.join(SRC, '60-settlements.js')
    s = open(fs, encoding='utf-8', newline='').read()
    i = s.index('const defSetts = ') + len('const defSetts = ')
    j = s.index(';', s.index('\n', i) - 2) if False else s.index('\n', i)
    line = s[i:j].rstrip()
    assert line.endswith(';')
    ds = json.loads(line[:-1])
    ds = [x for x in ds if x['id'] not in {p['id'] for p in pins}] + pins
    s = s[:i] + json.dumps(ds, ensure_ascii=False) + ';' + s[j:]
    a_ = s.index('const SETT_ADDED={') + len('const SETT_ADDED={')
    s = s[:a_] + "\n    '%s':%s," % (KEY, json.dumps(pins, ensure_ascii=False)) + s[a_:]
    open(fs, 'w', encoding='utf-8', newline='\n').write(s)
    json.dump(rep, open(os.path.join(HERE, 'edit_530_white_pass.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print('saved')


if __name__ == '__main__':
    main()
