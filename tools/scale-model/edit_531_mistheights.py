#!/usr/bin/env python3
"""Scale model 5.1, edit 31 (2026-11-25): Mistheights, a carve through the W outer wall (the owner: "a carve through the W
outer wall that is just positioned to funnel damp warm air up a pass to the south, where it keeps a high altitude area in
a sort of alaskan panhandle type climate (if plausible). getting out to the east the way is as difficult as the white
pass, but is much easier on the west side").

    python tools/scale-model/edit_531_mistheights.py [--dry]

The polygon is the live map's (edit_531_live.json): a corridor along the W outer wall's western crest (8.3-9.8 km, airless),
two fingers reaching down its western flank in the north-west, a fork at its south end. At the model's 2 km cells, never
raising the wall, a U-valley on the corridor's centre lines whose floor falls or rises along each:
- the two entry valleys from their tips on the western flank (the land there) up to 3,900 m at the junction: the funnel
  the north-westerlies drive warm damp air up;
- the main corridor south from the junction, 3,900 to 4,300 m: the misty high country, ~0.93 atm, far below the airless
  crest that walls it;
- the west way out: the south-western arm down from 4,300 m to ~3,000 m at its tip (the low country lies below it);
- the east way out: the eastern arm up to a 5,400 m col at its tip, as hard as White Pass, the interior below it.
The sides rise to the crest across the corridor's half width. The valley floors under 4,800 m are Cfc (subpolar oceanic,
the Alaska panhandle's) with ~3,500 mm; temperatures lapsed; rain, class and zone re-derived elsewhere where the land
moved; the floors painted a mossy conifer green, the walls tinted to their new height and relit. The polygon becomes a
default biome region (reconcile key 5.1e27). Refuses to run twice (the junction under 4,500 m is its marker).
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.spatial import cKDTree
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C, smodel.geom as G   # noqa: E402

KEY = '5.1e27'
LIVE = json.load(open(os.path.join(HERE, 'edit_531_live.json'), encoding='utf-8'))
MIST = LIVE['regions'][0]
SRC = os.path.join(HERE, 'model', 'src')
J = (238.0, 742.0)          # the junction of the two entry valleys
BASIN = (252.0, 822.0)      # the high country's south end, where the fork parts
# the centre lines: (points, floor at the first point or None for the land there, floor at the last point or None)
LINES = [
    ([(225, 662), (230, 690), (235, 718), J], None, 3900.0),                    # the north entry
    ([(199, 712), (214, 722), (228, 733), J], None, 3900.0),                    # the west entry
    ([J, (247, 765), (250, 790), (251, 808), BASIN], 3900.0, 4300.0),          # the high country
    ([BASIN, (244, 838), (232, 850), (222, 858)], 4300.0, 3000.0),             # the west way out
    ([BASIN, (264, 836), (285, 845)], 4300.0, 5400.0),                         # the east way out, up to its col
    ([(285, 845), (305, 852)], 5400.0, None),                                   # and down to the interior side
]


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    if E0[int(J[1]), int(J[0])] < 4500:
        sys.exit('edit_531 has run already (the junction is under 4,500 m)')
    sh = E0.shape
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]
    poly = G.poly([tuple(p) for p in MIST['points']], 1.0, 1.0, sh)
    # the centre lines resampled every 0.5 px, each point with its floor
    pts, fl = [], []
    for line, f0, f1 in LINES:
        L = np.array(line, float)
        seg = np.r_[0, np.cumsum(np.hypot(*np.diff(L, axis=0).T))]
        t = np.linspace(0, seg[-1], max(2, int(seg[-1] / 0.5)))
        x = np.interp(t, seg, L[:, 0]); y = np.interp(t, seg, L[:, 1])
        a = E0[int(round(y[0])), int(round(x[0]))] if f0 is None else f0
        b = E0[int(round(y[-1])), int(round(x[-1]))] if f1 is None else f1
        f = a + (b - a) * t / seg[-1]
        f = np.minimum(f, E0[np.round(y).astype(int), np.round(x).astype(int)])   # never above the land
        pts += list(zip(x, y)); fl += list(f)
    pts = np.array(pts); fl = np.array(fl)
    region = nd.binary_dilation(poly, iterations=2)
    dedge = nd.distance_transform_edt(poly)
    cells = np.stack([XX[region], YY[region]], 1)
    d, ix = cKDTree(pts).query(cells)
    hw = np.maximum(3.0, nd.maximum_filter(dedge, size=9)[region])
    rise = 1800.0 * np.clip(d / hw, 0, 1.6) ** 2
    val = fl[ix] + rise
    En = E0.copy()
    En[region] = np.minimum(E0[region], val)
    floor_mask = np.zeros(sh, bool)
    floor_mask[region] = (d <= np.maximum(1.2, 0.45 * hw)) & (En[region] < 4800)
    rep = {'edit': '5.1 edit 31: Mistheights', 'date': '2026-11-25',
           'junction_m': round(float(En[int(J[1]), int(J[0])])), 'basin_m': round(float(En[int(BASIN[1]), int(BASIN[0])])),
           'east_col_m': round(float(En[852, 305])), 'west_tip_m': round(float(En[858, 222])),
           'land_moved_cells': int((np.abs(En - E0) > 1).sum()), 'lowered_m_max': round(float((E0 - En).max())),
           'floor_cells': int(floor_mask.sum())}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    json.dump(rep, open(os.path.join(HERE, 'edit_531_mistheights.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return
    codes = [c['code'] for c in D['climate']['classes']]
    raw0 = {k: P.raster(D, k, 'L') for k in ('p', 'c', 'z')}
    D['h'] = P.encode_heights(D, En, W0)
    lap = C.lapse(D, E0, En, whas0, wlev0)
    for k in C.TEMPS:
        D[k] = lap[k]
    # the corridor was cut into the airless crest (its temperatures a flat -90 C, which a lapse leaves alone): every moved
    # cell still airless takes the temperatures of the nearby land of its new height (the 12 nearest in place and height),
    # the hottest afternoon held over the warm month and the coldest night under the cold one
    T5 = {k: P.raster(D, k, 'L').astype(float) - 90 for k in C.TEMPS}
    moved0 = np.abs(En - E0) > 1
    airless = np.zeros(sh, bool)
    for k in C.TEMPS:
        airless |= T5[k] <= -89.5
    fix = moved0 & airless & ~whas0
    if fix.any():
        win = nd.binary_dilation(fix, iterations=80)
        pool = win & ~airless & ~whas0 & ~moved0
        py_, px_ = np.nonzero(pool); ty_, tx_ = np.nonzero(fix)
        ft = lambda X, Y, H: np.stack([X / 40.0, Y / 40.0, H / 350.0], 1)
        dk, ik = cKDTree(ft(px_, py_, E0[pool])).query(ft(tx_, ty_, En[fix]), k=12)
        wk = 1.0 / (dk + .25)
        for k in C.TEMPS:
            T5[k][fix] = (T5[k][pool][ik] * wk).sum(1) / wk.sum(1)
    # on every moved land cell (a lapse moves each temperature by its own lapse rate): the hottest afternoon over the warm
    # month, the coldest night under the cold one
    mv = moved0 & ~whas0 & (T5['tm'] > -89.5)
    T5['th'][mv] = np.maximum(T5['th'][mv], T5['tw'][mv] + 1)
    T5['tl'][mv] = np.minimum(T5['tl'][mv], T5['tc'][mv] - 1)
    for k in C.TEMPS:
        D[k] = P.b64(Image.fromarray(np.clip(np.round(T5[k] + 90), 0, 255).astype(np.uint8), 'L'), optimize=True)
    rep['airless_cells_given_air'] = int(fix.sum())
    if fix.any():
        rep['floor_temps_C'] = {k: round(float(np.median(T5[k][fix & floor_mask])), 1) for k in C.TEMPS} if (fix & floor_mask).any() else None
    import edit_532_sw_wall_trigemini as T32
    rep['class_O_let_go'] = T32.unair(D, E0, En, whas0)   # the reclimate skips O cells: the cut's own air classed from its climate
    rain2, cls2, zon2, _, crep = C.reclimate(D, E0, En, whas0, whas0.copy())
    rep['reclimate'] = crep
    cls2[floor_mask] = codes.index('Cfc')
    rain2[floor_mask] = np.maximum(rain2[floor_mask], 3500.0)
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
    rng = np.random.default_rng(53101)
    moved = np.abs(En - E0) > 1
    for key in ('st', 't'):
        arr = P.raster(D, key)
        arr = PA.retint(arr, E0, En, moved & ~floor_mask, ~moved, 150.0)
        a = arr.astype(float)
        moss = np.array([46.0, 82.0, 58.0])
        tex = nd.gaussian_filter(rng.standard_normal(sh), 1.0)[..., None] * 8.0
        w = nd.gaussian_filter(floor_mask.astype(float), 0.8)[..., None]
        a = a * (1 - w) + np.clip(moss + tex, 0, 255) * w
        D[key] = P.jpeg_like(D, key, np.clip(a, 0, 255).astype(np.uint8))
    relit, _, _ = PA.relight(D, E0, En)
    for k_, v in relit.items():
        D[k_] = v
    D['h'] = P.encode_heights(D, En, W0)
    P.save(D)
    # the page: the polygon as a default biome region, and its reconcile key
    fr = os.path.join(SRC, '51-region-store.js')
    s = open(fr, encoding='utf-8', newline='').read()
    i = s.index('const defRegs = ') + len('const defRegs = ')
    j = s.index('\n', i)
    regs = json.loads(s[i:j].rstrip()[:-1])
    rec = {'id': MIST['id'], 'name': MIST['name'], 'color': MIST['color'], 'points': MIST['points'], 'kind': MIST['kind'],
           'notes': "A carve through the W outer wall: warm damp north-westerly air funnelled up two valleys from the western flank into a misty high country (~3,900-4,300 m, Cfc, ~3,500 mm, an Alaska-panhandle climate) far below the airless crest; out to the west easily, to the east over a 5,400 m col (the owner, 2026-11-25)."}
    old = next((x for x in regs if x['id'] == rec['id']), None)
    if old:
        old.update(rec)
    else:
        regs.append(rec)
    s = s[:i] + json.dumps(regs, ensure_ascii=False) + ';' + s[j:]
    block = ("      if(localStorage.getItem('krator.regMerged.%s')!=='1'){   /* %s: Mistheights from the live map (edit 31, 2026-11-25) */\n"
             "        [\"%s\"].forEach(id=>{ const d=defMap.get(id); if(d) regions.set(id,d); });\n"
             "        localStorage.setItem('krator.regMerged.%s','1');\n        localSave();\n      }\n") % (KEY, KEY, MIST['id'], KEY)
    anchor = "    }catch(e){}"
    k_ = s.index(anchor, s.index("krator.regMerged.5.1e24"))
    s = s[:k_] + block + s[k_:]
    open(fr, 'w', encoding='utf-8', newline='\n').write(s)
    json.dump(rep, open(os.path.join(HERE, 'edit_531_mistheights.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print('saved')


if __name__ == '__main__':
    main()
