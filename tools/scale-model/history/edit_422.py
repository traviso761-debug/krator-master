#!/usr/bin/env python3
"""Scale model 4.22: six of the owner's 2026-10-23 edits (tools/scale-model/README.md, "4.22"), with the rivers rerouted.

    python3 tools/scale-model/edit_422.py <4.21 page.html> <regions.json> <settlements.json> <out page.html> [--rain <page>]

Edits the 4.21 page (not an older one: edit_rivers.py is the 4.21 edit itself and is not rerun). Writes the new page and
beside it <out>.report.json and <out>.rivers.png (the network over the relief map, the edited places ringed).
Deterministic. Run it twice, the second time with --rain <the first run's page>: the climate step then knows where the
rerouted lakes stand (the first run guesses them), as 4.21's --rain let its rivers run on the rain of the land they cut.

1. THE HEIGHTS.
   - THE CUT (biomes/cut/PLAN.md): its floor raised CUT['raise_m'] on a smoothstep of the radius from the centre to the
     lip (1 inside `inner` x lip, 0 at the lip; the lip per bearing, the crest of the bowl's walls), then a mouth cut
     north through the lip: the bowl's curved floor continued to a sill at the lowlands' own level on the lip's line, the
     pass floor running on at that level to the lowland slope, ~30 km wide there and widening into the bowl, its walls
     eased. The bowl's drawn lakes are taken away and settle by the routing.
   - THE GREAT LAKE at the Rift's western head (biomes/riftrim/PLAN.md): the 3.3 km hollow inside its 1,312 m spill (the
     through lake 4.21 found) rebuilt as a basin plain rising from a shore at GREAT['shore'] to ~1,250 m at the walls'
     foot, a lake bed falling to GREAT['deep'] in the north-west against the north cliff, and an outlet gorge cut from it
     (edit_rivers.cut_channel) through the notch, past Chimes, to the Rift's trough lake. The routing fills the lake.
   - THE YETI'S VALLEY (biomes/nwouterwall/PLAN.md section 1): the trough round the frozen lake lowered YETI['lower'] m
     by height alone (full from 5.8 to 6.6 km, eased in from 4.4 km and out to the ranges at 7.4 km, so no hollow is
     made), in its box, joined to the lake; its lake taken away to settle.
2. THE CLIMATE. The temperatures lapse with the new surface (6.5 C per km, the edited places' 4.21 temperatures being
   their ground's), then the corrections the plans ask for: the Cut's closed basin (afternoon cloud on the highs, cold air
   pooling on the lows, weighted by the raise's own strength), the Yeti's sheltered valley (summer sun trap, winter
   pooling), the Catch's clear dry floor (hotter summers, colder winters), the Bowl's shore (the lake's thermal mass).
   Rain, class and zone are recomputed where the heights moved (edit_heights.reclimate); rain is set from outside where
   a plan says what it is (reclimate's force_rain, the class following it):
   - Pinnacle Rock's knoll blended into the monsoon country round it (PINNACLE);
   - the Bowl's lake effect: the eastern abyss's (edit_rivers.lake_rain's table) damped to BOWL['damp'] of its lift for a
     hypersaline lake, shifted downwind (north-west wind), never under 4.21's rain (the south-west shore's green pockets
     where Mantis stands stay as they are);
   - the Catch, a sealed basin: rain by height (CATCH['rain']), never over 4.21's on the floor and the foothills; its
     walls take the table (~100-130 mm), enough for ~30 m3/s of snowmelt rivers;
   - the Cut's bowl and the Yeti's valley keep their 4.21 rain (the class follows their new temperatures).
3. THE RIVERS (reroute): edit_rivers.py's routing, audit and designation, re-run on the 4.22 heights and rain with none
   of 4.21's own edits (they are in the 4.21 page already). Two things differ from a first routing: 4.21's through
   lakes, drawn now, are kept open (through_cells; edit_rivers.setup would close them), and each sealed basin keeps
   4.21's rain scale but the Catch's, whose rain is set (books_422). The water books closed basin by basin, the
   Yuni river held to its drawn course, rounds of routing and cutting until no course climbs, the check that every
   course falls, DATA.rivers rebuilt. A course that matches a 4.21 course (half of either's cells shared) keeps its id,
   name, tongue and gloss; a new one gets a new id and, in a region whose tongue is on record, a name in it
   (river_names.py's words). DATA.basins: 4.21's records outside the edited places, and this routing's lakes in them.
   New lakes (and lakes laid dry) are written to the water raster and the heights' water flag.
4. THE PAINT. The satellite and relief maps re-lit where the heights moved and re-tinted where they moved more than
   150 m (retint); water laid dry is repainted from the land round it, new water from the lake paint round it (the
   Catch's in the Bowl's salt-lake look); the rivers whose course or stroke changed are erased (painted from
   the land round them) and drawn again; the rain and climate maps repainted.
5. THE CHECKS (asserted): the great lake holds at its sill and drains through its gorge; the Cut stays endorheic (no
   course leaves the bowl; its lakes balance under their spill); every course falls from its source to its mouth.
"""
import io, json, math, os, re, sys, base64
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edit_heights import LO, HI, load, raster, b64, chaikin, meander, reclimate, repaint, ramp, relight, sstep   # noqa: E402
from edit_dams import set_data   # noqa: E402
import edit_rivers as ER   # noqa: E402
import river_names as RN   # noqa: E402
import hydro   # noqa: E402

VERSION = '4.22'
# 1. Pinnacle Rock's knoll (px 755,351): 4.21 reads ~640 mm on it against ~1,100-1,400 round it. Its rain within
# `core` px (a smoothstep over `fade` px more) blends to the median of its ring (`ring` px, not the drier north within
# `north` deg of north), held in [lo, hi]; never drier than 4.21
PINNACLE = dict(px=(755, 351), core=6.0, fade=3.0, ring=(9.0, 16.0), north=60.0, lo=1100.0, hi=1400.0)
# 2. the Cut (centre px 460,302): the floor raised `raise_m` on smoothstep(lip, inner x lip) of the radius (map px), the lip
# per bearing the crest of the walls `lip_px` from the centre (smoothed over `lip_deg`); the closed basin's correction on
# the temperatures (C at the centre, x the raise's weight: the plan's targets on the floor after the lapse); the north
# mouth: along the axis x = `axis_x`, the bowl's floor from radius r1 rising (power p) to the sill, `sill_m`, at the
# lip's line, the pass floor then falling `fall` m north to where the lowland slope falls to it (the divide at the lip:
# a floor sloping into the bowl from a sill at the lowland end takes the ridge's north flank into the bowl, ~6,000 km2
# and ~100 m3/s on the first run, and its lake spreads over most of the floor), the floor `half` px either side of the
# axis (at r1, at the lowland end), the walls rising `wall` m a px beyond it
CUT = dict(centre=(460, 302), raise_m=600.0, inner=0.35, lip_px=(25.0, 60.0), lip_deg=8.0,
           corr=dict(tm=-2.5, tw=-3.5, tc=-3.0, th=-4.5, tl=-1.0),
           mouth=dict(axis_x=460.0, r1=18.0, taper=10.0, sill_m=700.0, fall=30.0, half=(15.0, 7.5), wall=220.0, p=1.6, past=6.0))
# 3. the great lake: the hollow inside the 4.21 through lake's spill (`level`, the lake found at `seed`) rebuilt: the lake
# an ellipse (`lake_c` px, semi-axes `lake_ax` px, its long axis `lake_deg` deg clockwise from east) against the north
# cliff, its shore at `shore` m, its bed down to `deep` m `bed_r` cells in; the plain rising from shore + 10 m to `foot`
# m at the hollow's edge (power `plain_p`), its edge eased; the gorge to the Rift trough's lake at `to`
GREAT = dict(seed=(170, 1030), level=1312.0, lake_c=(165, 1013), lake_ax=(19.0, 10.5), lake_deg=40.0, shore=300.0,
             deep=-300.0, bed_r=5.0, foot=1250.0, plain_p=1.3, to=(214, 1079))
# Ledge's point, moved to the north cliff over the lake (riftrim PLAN section 12; the artifact's settlements collection)
LEDGE = (165, 1000)
# 4. the Yeti's valley: in its box (map px x0, x1, y0, y1), the ground joined to the lake at `px` between `ramp`[0] and
# `walls`[1] m, lowered by height alone: `lower` m from `ramp`[1] to `walls`[0], easing in from `ramp`[0] and out to
# `walls`[1] (both slopes under 1 m a m, so the lowering keeps every height's order and makes no hollow; the ranges
# over `walls`[1] untouched), faded over `feather` cells at the box's edge; the sheltered valley's correction (C, x the
# lowering's share). `band`: the floor the report reads (4.21's ~19,600 km2 trough). A smoothstep in from the trough's
# edge (the first run) left the lake, at the range's foot, lowered a third, and closed the trough's ends into new lakes
YETI = dict(px=(143, 177), box=(78, 225, 86, 253), band=(5800.0, 6600.0), ramp=(4400.0, 5800.0), walls=(6600.0, 7400.0),
            lower=800.0, feather=4.0, corr=dict(tw=2.0, th=2.0, tc=-2.0, tl=-2.0))
# 5. the Bowl's lake effect: the abyss's lift damped to `damp` (a hypersaline lake; a third gave ~590 mm on the downwind
# shore on the first run, over the plan's 400-550), the water seen `shift` px upwind
# (`down` of it from upwind, the rest the lake round the cell), over the region `region` faded `feather` px; the shore's
# extremes moderated `moderate` C where water is `wet` of the ground round it
BOWL = dict(region='The Bowl', damp=0.22, shift=4.0, down=0.6, feather=3.0, moderate=1.5, wet=0.25,
            flats=(10.0, 6.0))   # the satellite's recolour stays off the salt flats: none within 10 px, full by 16 px
# 6. the Catch, sealed: the basin under its spill (`spill` m, joined to its lowest point `px`), faded over `fade` cells
# inside its edge; rain by height (m, mm), never over 4.21's under `cap_under` m; over it the walls take the band (4.21
# gives the inner walls ~80 mm, which feeds no river; the plan asks for 100-250 mm there and ~30 m3/s of snowmelt rivers
# in all: Turc's runoff on this table is ~31 m3/s, the walls ~100-130 mm, falling to nothing up the high walls as the
# plan's table has it; 250 mm over 5.5 km gave ~175 m3/s and terminal lakes of ~6,500 km2 on the first run); the floor
# (under `floor_m`, eased to `floor_top`) warmer in summer and colder in winter (C)
CATCH = dict(px=(762, 1067), spill=6150.0, fade=5.0,
             rain=[(0, 10), (900, 25), (1100, 40), (3000, 100), (4500, 130), (5500, 100), (6200, 30), (9000, 0)],
             cap_under=3000.0, floor_m=900.0, floor_top=1600.0, corr=dict(tw=4.0, th=4.0, tc=-3.5, tl=-3.5),
             # the satellite map painted as the map's own hyperarid desert (the owner, 2026-10-23: the Taklamakan is not
             # this green; 4.21's paint kept the wet hot spot's vegetation round Stair and an olive cast on the floor):
             # under `desert_full` m fully, fading out by `desert_top` m (the snowy walls keep theirs)
             desert_full=4500.0, desert_top=5500.0)


def gpx(su, sv):
    """map px -> height cell, and height cell -> map px"""
    return (lambda x, y: (int(round(y * sv)), int(round(x * su)))), (lambda j, i: [round(i / su, 1), round(j / sv, 1)])


def region_mask(R, nm, su, sv, shape, full=False):
    r_ = next((r for r in R if r.get('name', '').strip() == nm), None)
    if r_ is None:
        sys.exit('no region named %r' % nm)
    im = Image.new('L', (shape[1], shape[0]), 0)
    ImageDraw.Draw(im).polygon([(a, b) if full else (a * su, b * sv) for a, b in r_['points']], fill=1)
    return np.array(im).astype(bool)


def up(a, OH, OW, order=0):
    """a height-grid field on the full-res map grid"""
    return nd.zoom(a.astype(float), (OH / a.shape[0], OW / a.shape[1]), order=order)[:OH, :OW]


def bearing(dx, dy):
    """deg clockwise from north (map y grows south)"""
    return np.degrees(np.arctan2(dx, -dy)) % 360


def cut_lip(EF, c):
    """the lip of the Cut per whole degree: the radius (map px) of the highest ground on the ray within CUT['lip_px'],
    smoothed round the circle"""
    cx, cy = c
    rs = np.arange(CUT['lip_px'][0], CUT['lip_px'][1], 0.5)
    lip = np.zeros(360)
    for b in range(360):
        t = np.radians(b)
        xs, ys = cx + rs * np.sin(t), cy - rs * np.cos(t)
        hv = EF[np.clip(np.round(ys).astype(int), 0, EF.shape[0] - 1), np.clip(np.round(xs).astype(int), 0, EF.shape[1] - 1)]
        lip[b] = rs[int(np.argmax(hv))]
    return nd.gaussian_filter1d(lip, CUT['lip_deg'], mode='wrap')


def cut_weight(xx, yy, c, lip):
    """the raise's strength at map px (xx, yy): 1 within inner x lip, 0 from the lip out"""
    r = np.hypot(xx - c[0], yy - c[1])
    L = np.interp(bearing(xx - c[0], yy - c[1]), np.arange(361), np.r_[lip, lip[0]])
    return sstep(L, CUT['inner'] * L, r), r, L


def books_422(G, old, redo):
    """edit_rivers.closed_books on the 4.22 ground, each sealed basin's rain scale kept from 4.21 unless it holds a cell
    of `redo` (the Catch, whose rain 4.22 sets): 4.21's books were closed on 4.20's water, and closed again on 4.21's own
    new lakes every sealed basin's scale moves (the south-eastern plateau's from 0.06 to 0.23 on the first run, and its
    hollows fill). The crater's evaporation is calibrated again, as 4.21 does."""
    k, books, Pe = ER.closed_books(G)
    E, whas, P, T, wlev = G['E'], G['whas'], G['P'], G['T'], G['wlev']
    air = T > -85
    S = np.where(whas, np.fmax(wlev, E), E)
    bl, bn = nd.label(air & (S < ER.BARRIER_M), structure=np.ones((3, 3)))
    sizes = nd.sum(np.ones(E.shape), bl, range(1, bn + 1))
    big = [b + 1 for b in range(bn) if sizes[b] >= 50]
    _, (iy, ix) = nd.distance_transform_edt(~np.isin(bl, big), return_indices=True)
    basin = np.where(air, bl[iy, ix], 0)
    for rec in books['sealed']:
        j, i = int(round(rec['at_px'][1] * G['sv'])), int(round(rec['at_px'][0] * G['su']))
        m = basin == basin[j, i]
        o = min(old['sealed'], key=lambda b: math.hypot(b['at_px'][0] - rec['at_px'][0], b['at_px'][1] - rec['at_px'][1]))
        if math.hypot(o['at_px'][0] - rec['at_px'][0], o['at_px'][1] - rec['at_px'][1]) < 40 and abs(o['km2'] / rec['km2'] - 1) < .15:
            Pe[m] = P[m] * o['rain_scale']
            rec['rain_scale_closed_now'] = rec['rain_scale']
            rec['rain_scale'] = o['rain_scale']
        if (m & redo).any():
            # the rain 4.22 sets (the Catch's, `redo`) is the basin's own: not scaled (scaled to what its land
            # evaporates with no lake yet, 5%, it feeds no river and no lake ever forms); its terminal lake closes the
            # books (the routing's balance). The rest of the sealed basin (its walls over the spill) keeps 4.21's scale
            Pe[m & redo] = P[m & redo]
            rec['rain_scale_set_ground'] = 1.0
            rec['recomputed_422'] = 'rain as set under the spill; the books close through its terminal lake'
    return k, books, Pe


def through_cells(G, basins, take):
    """the water bodies 4.21 drew as through lakes (DATA.basins 'through lake': a hollow a course fills to its spill and
    runs out of), outside the water taken away. edit_rivers.setup calls a drawn lake closed when the basin it lies in
    spills far over it, which in a closed basin (the Rift's spills at 7,121 m) is every lake: drawn, 4.21's through
    lakes would end flow, and the rivers below them (the Rift river, Folriba) would vanish"""
    lab, _ = nd.label(G['whas'] & ~take, structure=np.ones((3, 3)))
    out = np.zeros(G['E'].shape, bool)
    ys, xs = np.nonzero(lab > 0)
    for b_ in basins:
        if b_.get('kind') != 'through lake':
            continue
        j, i = b_['at_px'][1] * G['sv'], b_['at_px'][0] * G['su']
        d2 = (ys - j) ** 2 + (xs - i) ** 2
        n = int(np.argmin(d2))
        if d2[n] > 36:
            continue
        m = lab == lab[ys[n], xs[n]]
        if abs(float(np.nanmedian(G['wlev'][m])) - b_['level_m']) < 3:
            out |= m
    return out


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


def strokes(rec):
    """the pieces 4.21 paints a river with: [(points, width, alpha)] (edit_rivers step 6)"""
    pts = rec['drawn_px'] if 'drawn_px' in rec else meander(chaikin([tuple(p) for p in rec['px']], 2), .35)
    qs, n, out = rec['q_m3s'], len(pts), []
    for a in range(0, n - 1, 4):
        q = qs[min(len(qs) - 1, int(a / max(1, n - 1) * (len(qs) - 1)))]
        out.append((tuple((round(x, 2), round(y, 2)) for x, y in pts[a:a + 5]), 1 if q < 100 else 2 if q < 800 else 3,
                    150 if q < 50 else 205))
    return out


def main():
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    page, rpath, spath, out = sys.argv[1:5]
    prev = sys.argv[sys.argv.index('--rain') + 1] if '--rain' in sys.argv else None
    lines, li, D = load(page)
    R = json.load(open(rpath, encoding='utf8'))
    REG = [r for r in R if not ER.TOOL_REGIONS.match(r.get('name', '').strip())]
    SET = json.load(open(spath, encoding='utf8'))
    for s_ in SET:                                       # Ledge on its new point (written to the collection too)
        if s_['name'] == 'Ledge':
            s_['px'], s_['py'] = LEDGE
    OW, OH = D['fullW'], D['fullH']
    VW, VH = D['w'], D['hh']
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    g, px = gpx(su, sv)
    KM, KM2 = 2 / su, (2 / su) * (2 / sv)
    h = raster(D, 'h').astype(np.int64)
    wl = raster(D, 'wl').astype(np.int64)
    E = LO + ((h[..., 0] << 8) | h[..., 1]) / 65535 * (HI - LO)
    water0 = h[..., 2] > 127
    whas0 = wl[..., 2] > 127
    wlev0 = np.where(whas0, LO + ((wl[..., 0] << 8) | wl[..., 1]) / 65535 * (HI - LO), np.nan)
    EF0 = up(E, OH, OW, 1)
    jj, ii = np.mgrid[0:E.shape[0], 0:E.shape[1]]
    cx_, cy_ = ii / su, jj / sv                          # each height cell's map px
    yy, xx = np.mgrid[0:OH, 0:OW].astype(float)
    report = {'version': VERSION, 'from': '4.21'}
    lab_w, _ = nd.label(whas0, structure=np.ones((3, 3)))
    sea = np.zeros(E.shape, bool)
    for k in np.unique(lab_w[whas0 & (np.abs(np.nan_to_num(wlev0, nan=9e9) + 1500) < 1)]):
        sea |= lab_w == k
    En = E.copy()
    take = np.zeros(E.shape, bool)                       # drawn water taken away, to settle by the routing
    zones = {}

    # ---- 1a. the Cut: the floor raised, then the north mouth
    c = CUT['centre']
    lip = cut_lip(EF0, c)
    w_cut, r_cut, L_cut = cut_weight(cx_, cy_, c, lip)
    bowl = r_cut < L_cut
    En = En + CUT['raise_m'] * w_cut * bowl
    cutw = whas0 & bowl & ~sea
    take |= cutw
    m_ = CUT['mouth']
    d_ = cx_ - m_['axis_x']
    r_ = c[1] - cy_                                      # px north of the centre
    ax_r = np.arange(0, 120, 0.5)
    ax_h = np.array([En[g(m_['axis_x'], c[1] - r)] for r in ax_r])
    beyond = ax_r > lip[0]
    rs_ = float(ax_r[np.nonzero(beyond & (ax_h <= m_['sill_m']))[0][0]])
    z1 = float(En[g(m_['axis_x'], c[1] - m_['r1'])])
    rl_ = float(lip[0])
    t_ = np.clip((r_ - m_['r1']) / (rl_ - m_['r1']), 0, 1)
    zr = np.where(r_ <= rl_, z1 + (m_['sill_m'] - z1) * t_ ** m_['p'],
                  np.where(r_ <= rs_, m_['sill_m'] - m_['fall'] * (r_ - rl_) / max(1.0, rs_ - rl_),
                           m_['sill_m'] - m_['fall'] - 20.0 * (r_ - rs_)))
    half = np.interp(r_, [m_['r1'], rs_], m_['half'])
    tgt = zr + np.maximum(0, np.abs(d_) - half) * m_['wall']
    mouth = (r_ >= m_['r1']) & (r_ <= rs_ + m_['past']) & (tgt < En)
    before_m = En.copy()
    # eased in from the bowl, and out over `past` px beyond the lowland end (no step where the cut stops)
    w_m = sstep(m_['r1'], m_['r1'] + m_['taper'], r_) * sstep(rs_ + m_['past'], rs_, r_)
    En = np.where(mouth, En + w_m * (tgt - En), En)
    prof = [(float(r), float(En[g(m_['axis_x'], c[1] - r)])) for r in np.arange(m_['r1'], rs_ + 0.01, 1.0)]
    assert max(h_ for _, h_ in prof) <= m_['sill_m'] + 5, "the Cut's north mouth is not open: %s" % [p for p in prof if p[1] > m_['sill_m'] + 5][:4]
    report['cut'] = {'lip_px': {str(b): round(float(lip[b]), 1) for b in range(0, 360, 30)}, 'raise_m': CUT['raise_m'],
                     'raised_km2': round(float((w_cut * bowl > 0.01).sum() * KM2)),
                     'floor_before_m': round(float(np.median(E[bowl & (w_cut > .99)]))),
                     'floor_after_m': round(float(np.median(En[bowl & (w_cut > .99)]))),
                     'lakes_taken_km2': round(float(cutw.sum() * KM2)),
                     'mouth': {'sill_px': [m_['axis_x'], round(c[1] - rl_, 1)], 'lowland_end_px': [m_['axis_x'], round(c[1] - rs_, 1)],
                               'sill_m': m_['sill_m'], 'r1_floor_m': round(z1),
                               'cells': int(mouth.sum()), 'km2': round(float(mouth.sum() * KM2)),
                               'cut_most_m': round(float((before_m - En)[mouth].max())),
                               'lip_before_m': round(float(ax_h[np.argmin(np.abs(ax_r - lip[0]))])),
                               'axis_floor_m': [[round(r), round(h_)] for r, h_ in prof[::3]]}}
    sett = {s_['name']: s_ for s_ in SET}
    if 'Dilihan' in sett:
        report['cut']['dilihan_moved_m'] = round(float((En - E)[g(sett['Dilihan']['px'], sett['Dilihan']['py'])]))
    zones['cut'] = bowl | nd.binary_dilation(mouth, iterations=2)
    print('the Cut: floor %(floor_before_m)d -> %(floor_after_m)d m; ' % report['cut'] +
          'north mouth to a sill of %d m at px %s, cut up to %d m' % (m_['sill_m'], report['cut']['mouth']['sill_px'],
                                                                      report['cut']['mouth']['cut_most_m']))

    # ---- 1b. the great lake: the hollow rebuilt as a basin plain, the lake in its north-west, the gorge
    G_ = GREAT
    B = lab_w == lab_w[g(*G_['seed'])]
    assert abs(float(np.nanmedian(wlev0[B])) - G_['level']) < 2, 'the great lake is not where 4.21 drew it'
    take |= B
    ang = np.radians(G_['lake_deg'])
    u_ = (cx_ - G_['lake_c'][0]) * np.cos(ang) + (cy_ - G_['lake_c'][1]) * np.sin(ang)
    v_ = -(cx_ - G_['lake_c'][0]) * np.sin(ang) + (cy_ - G_['lake_c'][1]) * np.cos(ang)
    Lk = ER.biggest(B & ((u_ / G_['lake_ax'][0]) ** 2 + (v_ / G_['lake_ax'][1]) ** 2 <= 1))
    dS = nd.distance_transform_edt(~Lk)
    dW = nd.distance_transform_edt(B)
    tpl = np.clip(dS / (dS + dW + 1e-9), 0, 1)
    plain = G_['shore'] + 10 + (G_['foot'] - G_['shore'] - 10) * tpl ** G_['plain_p']
    dIn = nd.distance_transform_edt(Lk)
    bed = G_['shore'] - 3 - (G_['shore'] - G_['deep'] - 3) * sstep(0, G_['bed_r'], dIn - 1)
    En = np.where(B, np.where(Lk, bed, plain), En)
    edge = nd.binary_dilation(B, iterations=2) & ~nd.binary_erosion(B, iterations=1)
    En = np.where(edge & ~Lk, np.minimum(En, 0.5 * En + 0.5 * nd.gaussian_filter(En, 1.0)), En)
    north_cliff = nd.binary_dilation(Lk, structure=np.ones((3, 3))) & ~B
    towns = np.zeros(E.shape, bool)
    for s_ in SET:
        towns[min(E.shape[0] - 1, int(round(s_['py'] * sv))), min(E.shape[1] - 1, int(round(s_['px'] * su)))] = True
    towns = nd.binary_dilation(towns, structure=np.ones((3, 3)))
    tgt_l = lab_w == lab_w[g(*G_['to'])]
    rift_lv = float(np.nanmedian(wlev0[tgt_l]))
    blk = (whas0 & ~tgt_l & ~B) | towns
    gpath, gend, gover, gcut = ER.cut_channel(En, Lk, G_['shore'], tgt_l, blk)
    report['great_lake'] = {'hollow_km2': round(float(B.sum() * KM2)), 'hollow_floor_before_m': round(float(E[B].min())),
                            'lake_design_km2': round(float(Lk.sum() * KM2)), 'plain_km2': round(float((B & ~Lk).sum() * KM2)),
                            'shore_m': G_['shore'], 'bed_min_m': round(float(En[Lk].min())),
                            'lake_cells_on_the_cliff': int(north_cliff.sum()),
                            'gorge': {'length_km': round(len(gpath) * KM), 'cut_km': round(gover * KM), 'deepest_cut_m': round(gcut),
                                      'ends_px': px(*gend), 'rift_lake_m': round(rift_lv),
                                      'notch_before_m': round(float(max(E[p] for p in gpath))),
                                      'cut_under_4_21_ground_m': round(float(max(E[p] - En[p] for p in gpath))),
                                      'chimes_km': round(min(math.hypot(px(*p)[0] - 196, px(*p)[1] - 1062) for p in gpath) * 2, 1)}}
    gmask = np.zeros(E.shape, bool)
    for p_ in gpath:
        gmask[p_] = True
    zones['great'] = nd.binary_dilation(B | gmask, iterations=2)
    print('great lake: hollow %d km2 (floor %d m) -> lake %d km2 + plain %d km2; gorge %d km, cut up to %d m to the Rift lake (%d m)' % (
        B.sum() * KM2, E[B].min(), Lk.sum() * KM2, (B & ~Lk).sum() * KM2, len(gpath) * KM, gcut, rift_lv))

    # ---- 1c. the Yeti's valley lowered
    Y_ = YETI
    box = (cx_ >= Y_['box'][0]) & (cx_ <= Y_['box'][1]) & (cy_ >= Y_['box'][2]) & (cy_ <= Y_['box'][3])
    yl = lab_w == lab_w[g(*Y_['px'])]
    take |= yl
    lb, _ = nd.label(((E > Y_['band'][0]) & (E < Y_['band'][1]) & box) | yl, structure=np.ones((3, 3)))
    Ym = lb == lb[g(*Y_['px'])]
    la, _ = nd.label(((E > Y_['ramp'][0]) & (E < Y_['walls'][1]) & box) | yl, structure=np.ones((3, 3)))
    Ya = la == la[g(*Y_['px'])]
    fE = np.clip((E - Y_['ramp'][0]) / (Y_['ramp'][1] - Y_['ramp'][0]), 0, 1) * (1 - sstep(Y_['walls'][0], Y_['walls'][1], E))
    edge_b = np.minimum.reduce([cx_ - Y_['box'][0], Y_['box'][1] - cx_, cy_ - Y_['box'][2], Y_['box'][3] - cy_]) * su
    w_y = fE * sstep(0, Y_['feather'], edge_b) * Ya
    En = En - Y_['lower'] * w_y
    report['yeti'] = {'trough_km2': round(float(Ym.sum() * KM2)), 'floor_before_m': round(float(np.median(E[Ym]))),
                      'floor_after_m': round(float(np.median(En[Ym]))), 'lake_before_m': round(float(np.nanmedian(wlev0[yl]))),
                      'lowest_after_m': round(float(En[Ym].min())), 'lowered_km2': round(float((w_y > .01).sum() * KM2)),
                      'lowered_800_km2': round(float((w_y > .99).sum() * KM2))}
    zones['yeti'] = nd.binary_dilation(Ym | (w_y > .25), iterations=2)
    print('Yeti valley: %(trough_km2)d km2, floor %(floor_before_m)d -> %(floor_after_m)d m' % report['yeti'])

    # ---- 1d. the Catch's basin (no height edit)
    C_ = CATCH
    lc, _ = nd.label(E < C_['spill'], structure=np.ones((3, 3)))
    Cm = lc == lc[g(*C_['px'])]
    assert Cm.sum() * KM2 < 3e5, 'the Catch is not closed under %d m' % C_['spill']
    w_c = sstep(0, C_['fade'], nd.distance_transform_edt(Cm) - 0.5) * Cm
    zones['catch'] = Cm
    zones['bowl'] = region_mask(R, BOWL['region'], su, sv, E.shape)
    zones['pinnacle'] = np.hypot(cx_ - PINNACLE['px'][0], cy_ - PINNACLE['px'][1]) < PINNACLE['ring'][1]
    En = np.clip(En, LO + 1, HI - 1)
    report['heights'] = {'cells_raised': int((En > E + 10).sum()), 'cells_lowered': int((En < E - 10).sum()),
                         'highest_raise_m': round(float((En - E).max())), 'deepest_cut_m': round(float((E - En).max()))}

    # ---- 2. the climate
    # the water the climate step sees: the 4.21 water less what settles again; in the edited places what this run
    # expects (first run: the Cut's lakes risen with the floor, the great lake's design) or what the earlier run found
    whasR = whas0 & ~take
    wlevR = np.where(take, np.nan, wlev0)
    expw, expl = np.zeros(E.shape, bool), np.full(E.shape, np.nan)
    if prev:
        _, _, Dp = load(prev)
        wlp = raster(Dp, 'wl').astype(np.int64)
        pw = (wlp[..., 2] > 127) & np.logical_or.reduce([zones[k] for k in ('cut', 'great', 'yeti', 'catch')])
        expw, expl = pw, np.where(pw, LO + ((wlp[..., 0] << 8) | wlp[..., 1]) / 65535 * (HI - LO), np.nan)
    else:
        expw = cutw | Lk
        expl = np.where(cutw, wlev0 + CUT['raise_m'] * w_cut, np.where(Lk, G_['shore'], np.nan))
    surf0 = E                                                   # 4.21's temperatures there are their ground's
    surf1 = np.where(expw, np.fmax(En, np.nan_to_num(expl, nan=-9e9)), En)
    edited = np.logical_or.reduce([zones[k] for k in ('cut', 'great', 'yeti')])
    DS = up(np.where(edited, surf1 - surf0, 0.0), OH, OW, 1)
    wF = lambda k: up(np.where(zones[k], 1.0, 0.0), OH, OW, 0) > .5
    sF, _, _ = cut_weight(xx, yy, c, lip)
    sF = sF * (np.hypot(xx - c[0], yy - c[1]) < np.interp(bearing(xx - c[0], yy - c[1]), np.arange(361), np.r_[lip, lip[0]]))
    yF = up(w_y, OH, OW, 1)
    EFn = up(En, OH, OW, 1)
    cF = up(w_c, OH, OW, 1) * sstep(C_['floor_top'], C_['floor_m'], EFn)
    # the Bowl: its water's share round each pixel (the lake's own, and seen upwind)
    bowlF = region_mask(R, BOWL['region'], su, sv, (OH, OW), full=True)
    kB = np.clip(nd.gaussian_filter(bowlF.astype(float), BOWL['feather']) * 2 - 1, 0, 1) * bowlF
    wet21 = up(whas0, OH, OW, 0) > .5
    bw = wet21 & bowlF
    fr_ = nd.gaussian_filter(bw.astype(float), 6.0)
    fr_dn = nd.shift(fr_, (BOWL['shift'], BOWL['shift']), order=1, mode='nearest')
    fr_eff = BOWL['down'] * fr_dn + (1 - BOWL['down']) * fr_
    temps = {}
    corr_log = {}
    for k in ['tm', 'th', 'tl', 'tw', 'tc']:
        v = raster(D, k, 'L').astype(float) - 90
        ok = v > -89
        dv = -6.5 * DS / 1000
        dv = dv + CUT['corr'].get(k, 0.0) * sF + YETI['corr'].get(k, 0.0) * yF + CATCH['corr'].get(k, 0.0) * cF
        mod = BOWL['moderate'] * np.clip(fr_ / BOWL['wet'], 0, 1) * kB * ~wet21
        dv = dv + {'th': -mod, 'tl': mod}.get(k, 0.0)
        v2 = np.where(ok & (np.abs(dv) > 0.05), np.round(v + dv), v)
        temps[k] = v2
    report['temps'] = {}
    floors = {'cut': (sF > .95) & (EFn < -1000), 'yeti': yF > .95, 'catch': cF > .95, 'great_plain': wF('great') & (EFn > G_['shore'] + 5)}
    for nm, m in floors.items():
        report['temps'][nm] = {k: [float(np.median(raster(D, k, 'L')[m].astype(float) - 90)), float(np.median(temps[k][m]))]
                               for k in ('tm', 'tw', 'tc', 'th', 'tl')}
        report['temps'][nm]['air_atm'] = round(float(np.median(np.exp(-EFn[m] / 8000.0) * 1.6)), 2)
    print('temperatures (4.21 -> 4.22, median):', json.dumps(report['temps']))
    enc8 = lambda v: b64(Image.fromarray(np.clip(v + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    rep = {k: enc8(temps[k]) for k in temps}
    rain0 = raster(D, 'p', 'L').astype(float) / 255 * 4000
    FR, K = rain0.copy(), np.zeros((OH, OW))
    # Pinnacle Rock's knoll
    P_ = PINNACLE
    rP = np.hypot(xx - P_['px'][0], yy - P_['px'][1])
    bP = bearing(xx - P_['px'][0], yy - P_['px'][1])
    northP = np.minimum(bP, 360 - bP) < P_['north']
    ring = (rP >= P_['ring'][0]) & (rP <= P_['ring'][1]) & ~northP & ~wet21
    tP = float(np.clip(np.median(rain0[ring]), P_['lo'], P_['hi']))
    kP = sstep(P_['core'] + P_['fade'], P_['core'], rP)
    FR = np.where(kP > 0, np.maximum(rain0, tP), FR)
    K = np.maximum(K, kP)
    report['pinnacle'] = {'ring_median_mm': round(float(np.median(rain0[ring]))), 'target_mm': round(tP),
                          'knoll_before_mm': round(float(np.median(rain0[rP < 2]))), 'within_4km_before_mm': round(float(rain0[rP < 2].mean()))}
    # the Bowl: the abyss's lake effect, damped
    ab = region_mask(R, ER.ABYSS_LAKES['region'], su, sv, (OH, OW), full=True)
    zr = nd.binary_dilation(ab, iterations=8) & (EF0 < ER.ABYSS_LAKES['zone_m'])
    _, table = ER.lake_rain(rain0, wet21, wet21, zr)
    fr0 = nd.gaussian_filter(wet21.astype(float), 6.0)
    far_ab = zr & ~wet21 & (fr0 < 0.03)
    bgA = float(np.median(rain0[far_ab]))
    farB = bowlF & ~wet21 & (fr_ < 0.03)
    num = nd.gaussian_filter(np.where(farB, rain0, 0.0), 15.0)
    den = nd.gaussian_filter(farB.astype(float), 15.0)
    bgB = np.where(den > 1e-3, num / np.maximum(den, 1e-6), float(np.median(rain0[farB])))
    cent, med = np.array(table).T
    lift = (np.interp(fr_eff, cent, med) - 1) * bgA * BOWL['damp']
    bowl_rain = bgB + lift
    FR = np.where(kB > 0, np.maximum(rain0, bowl_rain), FR)
    K = np.maximum(K, kB * (bowl_rain > rain0))
    # the Catch: rain by height, never over 4.21's
    hz, rz = np.array(C_['rain']).T
    band_r = np.interp(EFn, hz, rz)
    catch_rain = np.where(EFn < C_['cap_under'], np.minimum(rain0, band_r), band_r)
    kC = up(w_c, OH, OW, 1)
    FR = np.where(kC > 0, rain0 + kC * (catch_rain - rain0), FR)
    K = np.maximum(K, (kC > 0).astype(float))
    # the Cut's bowl (not its mouth) and the Yeti's valley keep their rain
    # (blended across the mouth's edge: its own rain is recomputed, the bowl's kept)
    mouthF = np.clip(nd.gaussian_filter((up(mouth, OH, OW, 0) > .5).astype(float), 3.0) * 2, 0, 1)
    kk = np.maximum(np.where(sF > 0, 1 - mouthF, 0.0), (yF > 0).astype(float))
    FR = np.where(kk > 0, rain0, FR)                     # (no other forcing reaches the Cut or the Yeti's valley)
    K = np.where(kk > 0, kk, K)
    DC = dict(D, **{k: rep[k] for k in ('tm', 'tw', 'tc')})
    wclim = whasR | expw
    rain2, cls2, zon2, _, report['climate'] = reclimate(DC, E, En, wclim, np.zeros((OH, OW), bool), None, (FR, K))
    print('climate:', report['climate'])
    codes = [c_['code'] for c_ in D['climate']['classes']]
    c0 = raster(D, 'c', 'L')
    rr = lambda m: {'rain_mm': [round(float(np.median(rain0[m]))), round(float(np.median(rain2[m])))],
                    'classes': {codes[k]: int(((cls2 == k) & m).sum()) for k in np.unique(cls2[m])}}
    shoreB = bowlF & ~wet21 & nd.binary_dilation(bw, iterations=10)
    se = shoreB & ((xx - 855) + (yy - 815) > 0)
    nw = shoreB & ((xx - 855) + (yy - 815) <= 0)
    pocket = (xx >= 831) & (xx <= 846) & (yy >= 812) & (yy <= 844) & ~wet21
    report['rain'] = {'pinnacle_4km': rr(rP < 2), 'pinnacle_12km': rr(rP < 6), 'bowl_shore_downwind': rr(se),
                      'bowl_shore_upwind': rr(nw), 'mantis_pocket': rr(pocket), 'catch_floor': rr(cF > .95),
                      'catch_foothills': rr((kC > .95) & (EFn >= 1000) & (EFn < 3000)),
                      'catch_walls': rr((kC > .95) & (EFn >= 3000) & (EFn < 5500)),
                      'great_plain': rr(wF('great') & ~(up(Lk, OH, OW, 0) > .5) & (EFn > G_['shore'])),
                      'cut_floor': rr(floors['cut']), 'yeti_floor': rr(floors['yeti'])}
    assert (rain2[pocket] >= rain0[pocket] - 1).all(), "the Bowl's green pocket got drier"
    for k_, v_ in report['rain'].items():
        print('  rain %s: %s' % (k_, v_))

    # ---- 3. the rivers, rerouted on the 4.22 heights and rain
    ny, nx = E.shape
    gx = np.clip(np.round(np.arange(nx) / su).astype(int), 0, OW - 1)
    gy = np.clip(np.round(np.arange(ny) / sv).astype(int), 0, OH - 1)
    P = rain2[np.ix_(gy, gx)]
    T = temps['tm'][np.ix_(gy, gx)]
    G = dict(su=su, sv=sv, h=h, E=En, water=water0 & ~take, whas=whasR.copy(), wlev=wlevR.copy(), P=P, T=T, P_drawn=P)
    G['evap_k'], G['books'], G['P'] = books_422(G, D['hydro']['books'], Cm)
    report['books'] = G['books']
    print('water books: evaporation x %.3f (4.21: %.3f)' % (G['evap_k'], D['hydro']['evap_k']))
    open_ = through_cells(G, D['basins'], take)
    report['through_lakes_4_21_open_km2'] = round(float(open_.sum() * KM2))

    def setup422(G_):
        H_ = ER.setup(G_)
        H_['term'] = H_['term'] & ~open_
        return H_
    H = setup422(G)
    liquid = ~H['frozen']
    # the Yuni river held to its drawn course (edit_rivers main)
    force = []
    yuni = next((r for r in D.get('rivers', []) if r['name'] == 'Yuni river'), None)
    if yuni:
        cells = []
        for x, y in yuni['drawn_px']:
            c2 = (int(round(y * sv)), int(round(x * su)))
            c2 = min(((c2[0] + dj, c2[1] + di) for dj in (-1, 0, 1) for di in (-1, 0, 1)), key=lambda q: (En[q], q))
            while cells and max(abs(c2[0] - cells[-1][0]), abs(c2[1] - cells[-1][1])) > 1:
                l_ = cells[-1]
                cells.append((l_[0] + int(np.sign(c2[0] - l_[0])), l_[1] + int(np.sign(c2[1] - l_[1]))))
            if not cells or c2 != cells[-1]:
                cells.append(c2)
        k = next((n for n, c2 in enumerate(cells) if G['whas'][c2]), None)
        cells = cells[:k]
        seen, path = {}, []
        for c2 in cells:
            if c2 in seen:
                path = path[:seen[c2] + 1]
                seen = {q: n for n, q in enumerate(path)}
                continue
            seen[c2] = len(path)
            path.append(c2)
        bedv, most = None, 0.0
        for c2 in path:
            bedv = En[c2] if bedv is None else min(En[c2], bedv - 1.0)
            most = max(most, En[c2] - bedv)
            En[c2] = bedv
        force = [path]
        report['yuni_course'] = {'cells': len(path), 'cut_most_m': round(most, 1)}

    def courses(rt, chan, key):
        return [c2 for c2 in ER.trace(rt, chan, key) if len(c2[0]) >= ER.MIN_CELLS or (len(c2[0]) >= 2 and key[c2[0][-1]] >= ER.Q_KEEP)]

    def network(G_, H_, extra_lake, extra_level):
        S_ = np.where(extra_lake, extra_level, H_['S'])
        rt = hydro.route(S_, H_['term'], H_['R'], H_['PL'], H_['lake'] | extra_lake, H_['frozen'], force=force)
        Q = ER.qcells(rt['acc'])
        area = hydro.accumulate_area(rt['order'], rt['rec'], np.where(rt['term'], 0.0, KM2))
        lake = G_['whas'] | extra_lake | rt['term']
        chan = (Q >= ER.Q_RIVER) & liquid & ~lake
        wadi = (area >= ER.A_WADI) & (Q < ER.Q_RIVER) & liquid & ~lake & ~chan
        return rt, Q, area, lake, chan, courses(rt, chan, Q), courses(rt, wadi, area)

    def rises(path, S, water):
        return [(n, float(S[path[n]] - S[path[n - 1]])) for n in range(1, len(path))
                if S[path[n]] > S[path[n - 1]] + 0.5 and not water[path[n]]]

    through = np.zeros(E.shape, bool)
    through_lv = np.zeros(E.shape)
    hollows = []
    for rnd in range(1, 9):
        print('round %d: routing' % rnd)
        G2 = dict(G, E=En)
        H2 = setup422(G2)
        rt, Q, area, lake, chan, riv, wad = network(G2, H2, through, through_lv)
        S0 = rt['S']
        water = G['whas'] | through
        found = {}
        hol, _ = nd.label((rt['F'] - S0 > 0.5) & ~water, structure=np.ones((3, 3)))
        for kind, cs in (('river', riv), ('wadi', wad)):
            for path, mouth_, _ in cs:
                for n, up_ in rises(path, S0, water):
                    k = hol[path[n - 1]] or hol[path[n]]
                    if not k:
                        sys.exit('a course climbs outside any hollow at %s' % px(*path[n]))
                    h_ = found.setdefault(k, dict(kind=kind, q=0.0))
                    h_['q'] = max(h_['q'], float(Q[path[n]]))
                    if kind == 'river':
                        h_['kind'] = 'river'
        if not found:
            break
        boxes = nd.find_objects(hol)
        deep = set()
        for k, h_ in found.items():
            sl = boxes[k - 1]
            m = hol[sl] == k
            spill = float(rt['F'][sl][m].max())
            floor = float(S0[sl][m].min())
            j, i = np.argwhere(m)[np.argmin(S0[sl][m])]
            act = 'cut' if spill - floor <= ER.BREACH_M else 'lake'
            if act == 'lake':
                deep.add(k)
                mm = np.zeros(E.shape, bool)
                mm[sl] = m
                through |= mm
                through_lv[mm] = spill
            hollows.append(dict(round=rnd, course=h_['kind'], q_m3s=round(h_['q'], 1), depth_m=round(spill - floor, 1),
                                spill_m=round(spill), floor_m=round(floor), cells=int(m.sum()),
                                at_px=px(j + sl[0].start, i + sl[1].start), action=act))
        ncut = 0
        for path, mouth_, _ in riv + wad:
            bedv, prev_u = None, 0
            for c2 in path:
                u = hol[c2]
                if water[c2] or rt['term'][c2]:
                    bedv, prev_u = S0[c2], u
                    continue
                s_ = En[c2]
                if bedv is None or s_ <= bedv + 0.5:
                    bedv = s_ if bedv is None else min(bedv, s_)
                elif (u or prev_u) in deep or u in deep:
                    bedv = s_
                else:
                    bedv -= 1.0
                    En[c2] = bedv
                    ncut += 1
                prev_u = u
        print('  %d hollows on courses: %d cut (%d cells lowered), %d made lakes' % (len(found), len(found) - len(deep), ncut, len(deep)))
    else:
        sys.exit('courses still climb after 8 rounds')
    report['hollows'] = sorted(hollows, key=lambda h_: -h_['depth_m'])
    for kind, cs in (('river', riv), ('wadi', wad)):
        for path, mouth_, _ in cs:
            r_ = rises(path, S0, water)
            assert not r_, '%s at %s still climbs %s m' % (kind, px(*path[r_[0][0]]), r_[0][1])
    print('check: every course falls to its mouth')
    rt2, Q2, area2, chan2, riv2, wad2 = rt, Q, area, chan, riv, wad

    # the lakes this routing found: endorheic (ends) and through lakes, with the water they add
    CLS = cls2
    newlake, newlv = np.zeros(E.shape, bool), np.zeros(E.shape)
    basins = []
    for e in rt2['ends']:
        m = e['cells'] & ~G['whas']
        if not m.any():
            continue
        j, i = np.argwhere(m).mean(0)
        km2 = float(m.sum() * KM2)
        if km2 < 30 and not e.get('shut'):
            continue
        cl = codes[int(CLS[int(round(j / sv)), int(round(i / su))])]
        b_ = dict(at_px=px(round(j), round(i)), level_m=round(e['level']), km2=round(km2), spill_m=round(e['spill']), climate=cl,
                  kind='unbalanced' if e.get('shut') and e.get('surplus', 0) > 0 else ('salt lake' if cl.startswith(('B', 'X')) else 'lake'),
                  surplus_m3s=round(float(ER.qcells(e.get('surplus', 0.0))), 1), _cells=m)
        basins.append(b_)
        if b_['kind'] != 'unbalanced':
            newlake |= m
            newlv[m] = e['level']
    tl_, tn = nd.label(through, structure=np.ones((3, 3)))
    for k in range(1, tn + 1):
        m = tl_ == k
        j, i = np.argwhere(m).mean(0)
        lv = float(through_lv[m].max())
        basins.append(dict(at_px=px(round(j), round(i)), level_m=round(lv), km2=round(float(m.sum() * KM2)),
                           depth_m=round(float((lv - En[m]).max())), kind='through lake',
                           climate=codes[int(CLS[int(round(j / sv)), int(round(i / su))])], _cells=m))
        newlake |= m
        newlv[m] = lv
    allz = np.logical_or.reduce(list(zones.values()))
    # the Bowl's drawn lakes (closed: they end flow as drawn): what reaches them now, against their own balance
    bl_, bn_ = nd.label(G['whas'] & zones['bowl'], structure=np.ones((3, 3)))
    report['bowl_lakes'] = []
    for k in range(1, bn_ + 1):
        m = bl_ == k
        if m.sum() < 3:
            continue
        ring_ = nd.binary_dilation(m, structure=np.ones((3, 3))) & ~m
        into = sum(max(float(rt2['acc'][c2]), 0.0) for c2 in zip(*np.nonzero(ring_)) if rt2['rec'][c2][0] >= 0 and m[tuple(rt2['rec'][c2])])
        j, i = np.argwhere(m).mean(0)
        report['bowl_lakes'].append({'at_px': px(round(j), round(i)), 'km2': round(float(m.sum() * KM2)),
                                     'inflow_m3s': round(float(ER.qcells(into)), 1),
                                     'balance_m3s': round(float(ER.qcells(into + float(H2['PL'][m].sum()))), 1)})
    report['new_water'] = {'km2': round(float(newlake.sum() * KM2)),
                           'outside_edited_km2': round(float((newlake & ~nd.binary_dilation(allz, iterations=3)).sum() * KM2)),
                           'laid_dry_km2': round(float((take & ~newlake).sum() * KM2))}
    print('new water: %(km2)d km2 (%(outside_edited_km2)d outside the edited places); laid dry %(laid_dry_km2)d km2' % report['new_water'])
    whas2 = G['whas'] | newlake
    wlev2 = np.where(newlake, newlv, G['wlev'])
    report['places'] = {}
    for nm in ('cut', 'great', 'yeti', 'catch', 'bowl'):
        report['places'][nm] = [{k_: v_ for k_, v_ in b_.items() if k_ != '_cells'} for b_ in basins if (b_['_cells'] & zones[nm]).any()]
        print('  lakes in %s: %s' % (nm, report['places'][nm]))

    # ---- the checks: the great lake holds at its sill and drains through its gorge; the Cut stays endorheic
    gl = [b_ for b_ in basins if (b_['_cells'] & Lk).any()]
    assert len(gl) == 1 and gl[0]['kind'] == 'through lake', 'the great lake is not one lake spilling through: %s' % gl
    glm = gl[0]['_cells']
    sill = max(En[p] for p in gpath if not glm[p])
    assert abs(gl[0]['level_m'] - G_['shore']) < 15 and gl[0]['level_m'] >= sill - 1, 'the great lake does not stand at its sill'
    ringg = nd.binary_dilation(glm, structure=np.ones((3, 3))) & ~glm
    gp = set(gpath)
    low = [c2 for c2 in zip(*np.nonzero(ringg & (En < gl[0]['level_m'] - 0.5))) if c2 not in gp]
    assert not low, 'the great lake has a shore under its level off the gorge at %s' % [px(*c2) for c2 in low[:3]]
    # the lake's water leaves by the gorge: follow the routing down from the lake's exit
    down_, best_acc = None, -1.0
    for c2 in zip(*np.nonzero(glm)):
        a_, b2 = rt2['rec'][c2]
        if a_ >= 0 and not glm[a_, b2] and rt2['acc'][c2] > best_acc:
            down_, best_acc = (a_, b2), float(rt2['acc'][c2])
    walk, c2 = [], down_
    while c2 is not None and not tgt_l[c2] and len(walk) < 400:
        walk.append(c2)
        a_, b2 = rt2['rec'][c2]
        c2 = (a_, b2) if a_ >= 0 else None
    on_gorge = sum(w2 in gp for w2 in walk) / max(1, len(walk))
    q_out = float(Q2[walk[0]]) if walk else 0.0
    report['great_lake'].update(level_m=gl[0]['level_m'], km2=gl[0]['km2'], depth_m=gl[0]['depth_m'], sill_m=round(float(sill)),
                                outflow_m3s=round(q_out, 1), outflow_on_gorge=round(on_gorge, 2),
                                reaches_rift_lake=bool(c2 is not None and tgt_l[c2]))
    print('great lake: %d m over %d km2, sill %d m, %.0f m3/s out, %.0f%% of its way down the gorge' % (
        gl[0]['level_m'], gl[0]['km2'], sill, q_out, 100 * on_gorge))
    assert c2 is not None and tgt_l[c2] and on_gorge > .6 and q_out > 100, 'the great lake does not drain through its gorge'
    # the Cut: its lakes balance under their spill, and the water of its floor (where 4.21's lakes were) ends in the bowl
    for b_ in report['places']['cut']:
        assert b_['kind'] in ('salt lake', 'lake'), 'a lake in the Cut is not endorheic: %s' % b_
    assert report['places']['cut'], 'no lake in the Cut'
    for c2 in zip(*np.nonzero(cutw)):
        n_ = 0
        while not rt2['term'][c2] and n_ < 2000:
            a_, b2 = rt2['rec'][c2]
            if a_ < 0:
                break
            c2, n_ = (a_, b2), n_ + 1
        assert bowl[c2], "the Cut's floor drains out of the bowl to px %s" % px(*c2)
    print('check: the Cut stays endorheic')
    yl2 = [b_ for b_ in report['places']['yeti']]
    report['yeti']['lakes'] = yl2

    # ---- the courses as data (edit_rivers step 5)
    order = hydro.strahler(rt2['order'], rt2['rec'], chan2)
    regs = []
    for r in REG:
        im = Image.new('L', (E.shape[1], E.shape[0]), 0)
        ImageDraw.Draw(im).polygon([(a * su, b * sv) for a, b in r['points']], fill=1)
        regs.append((r['name'].strip(), r.get('kind'), np.array(im).astype(bool)))

    def region_of(path):
        best = None
        for nm, kind, m in regs:
            share = sum(m[c2] for c2 in path) / len(path)
            if share >= .5 and (best is None or m.sum() < best[0]):
                best = (m.sum(), nm)
        return best[1] if best else None

    setts = [s_ for s_ in SET if s_.get('px') is not None]
    recs = []
    allc = [('river', c2) for c2 in riv2] + [('wadi', c2) for c2 in wad2]
    # the named courses (edit_rivers NAMED_COURSES): the 4.21 page holds them; a course routed down their valley that
    # reaches the mouth keeps the name by matching below, and one drawn as a course of its own is traced again here
    named_at = {}
    keep_named = []
    taken_cells = {c2: n_ for n_, (_, (p_, _m, _j)) in enumerate(allc) for c2 in p_}
    for nm, nc in ER.NAMED_COURSES.items():
        j0, i0 = int(round(nc['near'][1] * sv)), int(round(nc['near'][0] * su))
        rr_ = int(math.ceil(nc['reach'] * su))
        best = None
        for j in range(max(1, j0 - rr_), min(ny - 1, j0 + rr_ + 1)):
            for i in range(max(1, i0 - rr_), min(nx - 1, i0 + rr_ + 1)):
                a_, b2 = rt2['rec'][j, i]
                if not rt2['term'][j, i] and a_ >= 0 and (H2['sea'][a_, b2] or G['whas'][a_, b2]) and \
                        (best is None or area2[j, i] > area2[best]):
                    best = (j, i)
        ups = {}
        for (j, i) in zip(*np.nonzero(area2 > 0)):
            a_, b2 = rt2['rec'][j, i]
            if a_ >= 0:
                ups.setdefault((a_, b2), []).append((j, i))
        path = [best]
        while ups.get(path[-1]):
            path.append(max(ups[path[-1]], key=lambda c3: area2[c3]))
        path = path[::-1]
        if path[-1] in taken_cells:
            m_ = taken_cells[path[-1]]
            allc[m_] = ('river', allc[m_][1])
            named_at[m_] = nm
            continue
        shared = [n_ for n_, c3 in enumerate(path) if c3 in taken_cells]
        if shared:
            path = path[shared[-1] + 1:]
        wet_ = [n_ for n_, c3 in enumerate(path) if G['whas'][c3] or open_[c3]]
        if wet_:                                         # from the water it leaves (4.21: Drim Rivrh's lake)
            path = path[wet_[-1] + 1:]
        if len(path) < 2:                                # nothing left off the water: 4.21's record stands
            keep_named.append(next(o for o in D['rivers'] if o['name'] == nm))
            continue
        for n_ in range(1, len(path)):
            c3, p_ = path[n_], path[n_ - 1]
            S_ = rt2['S']
            if not G['whas'][c3] and S_[c3] > S_[p_] - 0.5:
                lo_ = S_[p_] - 0.5
                En[c3] = min(En[c3], lo_)
                S_[c3] = lo_
        assert not rises(path, rt2['S'], G['whas']), '%s climbs' % nm
        named_at[len(allc)] = nm
        allc.append(('river', (path, tuple(rt2['rec'][best]), False)))
    for kind, (path, mouth_, joins) in allc:
        recs.append(dict(kind=kind, path=path, mouth=mouth_, joins=joins))
    cell_of = {}
    for k, r in enumerate(recs):
        for c2 in r['path']:
            cell_of.setdefault(c2, k)
    yuni_k = None
    if yuni:
        fp = set(force[0])
        best_, yuni_k = max((sum(c2 in fp for c2 in r['path']), k) for k, r in enumerate(recs) if r['kind'] == 'river')
        if best_ < .8 * len(fp):
            sys.exit('the routing does not follow the Yuni river (%d of %d cells)' % (best_, len(fp)))
    for k, r in enumerate(recs):
        path = r['path']
        q = [float(Q2[c2]) for c2 in path]
        bedl = [float(rt2['S'][c2]) for c2 in path]
        lenkm = sum(math.hypot(a[0] - b2[0], a[1] - b2[1]) for a, b2 in zip(path[:-1], path[1:])) * KM
        mouth_ = r['mouth']
        if r['joins']:
            to = {'river': None, 'at_px': px(*mouth_)}
            r['_to_cell'] = mouth_
        elif mouth_ is None:
            to = {'edge': True}
        elif H2['sea'][mouth_]:
            to = {'sea': 'Ring Sea' if abs(G['wlev'][mouth_] + 1500) < 1 else 'ocean', 'at_px': px(*mouth_)}
        elif whas2[mouth_] and not through[mouth_] and not newlake[mouth_]:
            to = dict({'lake_m': round(float(wlev2[mouth_]))}, **({'through': True} if open_[mouth_] else {}), at_px=px(*mouth_))
        elif through[mouth_]:
            to = {'lake_m': round(float(through_lv[mouth_])), 'through': True, 'at_px': px(*mouth_)}
        elif newlake[mouth_]:
            to = {'lake_m': round(float(newlv[mouth_])), 'at_px': px(*mouth_)}
        elif rt2['term'][mouth_]:
            to = {'basin_m': round(float(rt2['S'][mouth_])), 'at_px': px(*mouth_)}
        elif H2['frozen'][mouth_]:
            to = {'ice': True, 'at_px': px(*mouth_)}
        else:
            to = {'at_px': px(*mouth_)}
        P_ = [px(*c2) for c2 in path]
        near = sorted(set(s_['name'] for s_ in setts
                          if min(math.hypot(s_['px'] - x, s_['py'] - y) for x, y in P_) * 2 <= ER.SETTLE_KM))
        rec = dict(id=None, name=None, kind=r['kind'], perennial=r['kind'] == 'river',
                   order=int(order[path[-1]]) if r['kind'] == 'river' else 0,
                   length_km=round(lenkm), catchment_km2=round(float(area2[path[-1]])),
                   q_mouth_m3s=round(q[-1], 1), source_m=round(bedl[0]), mouth_m=round(bedl[-1]),
                   region=region_of(path), to=to, settlements=near,
                   px=P_, bed_m=[round(v) for v in bedl], q_m3s=[round(v, 1) for v in q])
        if r['kind'] == 'river':
            rec['width_m'] = round(4.5 * q[-1] ** .5)
            rec['depth_m'] = round(.35 * q[-1] ** .38, 1)
            rec['width_src_m'] = round(4.5 * q[0] ** .5)
        else:
            rec['width_m'] = round(3 * float(area2[path[-1]]) ** .35)
            rec['depth_m'] = 0.0
        r['rec'] = rec
    # ids and names: a course sharing half of its cells (or half of a 4.21 course's) with a 4.21 course is that course
    old = D['rivers']
    oldc = [set(tuple(p) for p in o['px']) for o in old]
    where = {}
    for n_, s_ in enumerate(oldc):
        for p_ in s_:
            where.setdefault(p_, []).append(n_)
    pairs = []
    for k, r in enumerate(recs):
        cnt = {}
        for p_ in r['rec']['px']:
            for n_ in where.get(tuple(p_), ()):
                cnt[n_] = cnt.get(n_, 0) + 1
        for n_, v in cnt.items():
            if v >= .5 * len(r['rec']['px']) or v >= .5 * len(oldc[n_]):
                if old[n_]['kind'] == r['rec']['kind'] or old[n_].get('name_fixed') or v >= .8 * len(oldc[n_]):
                    pairs.append((-v, k, n_))
    pairs.sort()
    got, used_old = {}, set()
    for v, k, n_ in pairs:
        if k in got or n_ in used_old:
            continue
        got[k] = n_
        used_old.add(n_)
    if yuni_k is not None:
        yo = next(n_ for n_, o in enumerate(old) if o['name'] == 'Yuni river')
        if got.get(yuni_k) != yo:
            for k_, n_ in list(got.items()):
                if n_ == yo:
                    del got[k_]
            got[yuni_k] = yo
    # a course with no match that ends where an unmatched 4.21 course of its kind ended is that course, rerouted
    # upstream (Jimjam's river, now fed by the Cut's north mouth)
    for k, r in enumerate(recs):
        if k in got:
            continue
        mo = r['rec']['px'][-1]
        for n_, o in enumerate(old):
            if n_ not in used_old and o['kind'] == r['rec']['kind'] and math.hypot(o['px'][-1][0] - mo[0], o['px'][-1][1] - mo[1]) < 2.5:
                got[k] = n_
                used_old.add(n_)
                break
    # the great lake's outflow keeps 4.21's name (the gorge goes round Chimes, so it shares few cells with 4.21's course)
    nearL = nd.binary_dilation(Lk, iterations=1)
    for k, r in enumerate(recs):
        if r['kind'] == 'river' and nearL[r['path'][0]] and k not in got:
            on = next(n_ for n_, o in enumerate(old) if o['id'] == 'r005')
            if on not in got.values():
                got[k] = on
                used_old.add(on)
    for k in named_at:
        on = next((n_ for n_, o in enumerate(old) if o['name'] == named_at[k]), None)
        if on is not None and got.get(k) != on:
            for k_, n_ in list(got.items()):
                if n_ == on:
                    del got[k_]
            got[k] = on
    next_id = max(int(o['id'][1:]) for o in old) + 1
    names_t = {}
    for o in old:
        names_t.setdefault(o.get('tongue'), set()).add(o['name'])
    tmasks = []
    for nm in RN.TONGUE:
        for r in R:
            if r.get('name', '').strip() == nm:
                im = Image.new('L', (OW, OH), 0)
                ImageDraw.Draw(im).polygon([tuple(p) for p in r['points']], fill=1)
                tmasks.append((nm, np.array(im).astype(bool)))
    at = lambda a, p: a[min(OH - 1, int(round(p[1]))), min(OW - 1, int(round(p[0])))]
    prov = {}
    for o in old:
        mo = re.match(r'^(.*?)(?: (\d+))?$', o['name'])
        prov[mo.group(1)] = max(prov.get(mo.group(1), 1), int(mo.group(2) or 1))
    newly = []
    for k, r in enumerate(recs):
        rec = r['rec']
        if k in got:
            o = old[got[k]]
            rec['id'], rec['name'] = o['id'], o['name']
            for f_ in ('tongue', 'gloss', 'name_fixed', 'drawn_px'):
                if f_ in o:
                    rec[f_] = o[f_]
            if o['name'] == 'Yuni river':
                rec['to'] = dict(rec['to'], **({'named': o['to']['named']} if o['to'].get('named') else {}))
            continue
        rec['id'] = 'r%03d' % next_id
        next_id += 1
        newly.append(k)
    # a new course: named in its region's tongue (river_names.py's words, one not yet used there), else provisionally
    for k in sorted(newly, key=lambda k: (recs[k]['rec']['kind'] != 'river', -(recs[k]['rec']['q_mouth_m3s'] if
                    recs[k]['rec']['kind'] == 'river' else recs[k]['rec']['catchment_km2']))):
        rec = recs[k]['rec']
        best = None
        for nm, m in tmasks:
            share = sum(at(m, p) for p in rec['px']) / len(rec['px'])
            if share >= .5 and (best is None or m.sum() < best[1]):
                best = (nm, m.sum())
        t = RN.TONGUE[best[0]] if best else None
        name = gloss = None
        if t:
            ki = 2 if rec['kind'] == 'wadi' else (1 if rec['q_mouth_m3s'] < 50 else 0)
            word = RN.W_[t][ki]
            cand = []
            for s_ in rec['settlements']:
                cand.append((RN.compose_place(t, RN.PLACE.get(s_, {}).get(t, s_), word), '%s %s' % (s_, RN.EN_WORD[ki])))
            clim = [codes[int(at(cls2, p))] for p in rec['px']]
            tmp = [int(at(temps['tm'], p)) for p in rec['px']]
            for d_ in (RN.traits(rec, clim, tmp) if t != 'screamer' else []) + RN.POOL[t]:
                if d_ in RN.D_[t]:
                    cand.append((RN.compose(t, RN.D_[t][d_], word, rec['kind']), '%s %s' % (RN.EN.get(d_, d_), RN.EN_WORD[ki])))
            words = [d_ for d_ in RN.POOL[t] + list(RN.D_[t]) if d_ in RN.D_[t]]
            for a_ in words:
                for b2 in words:
                    if a_ != b2:
                        cand.append((RN.compose(t, RN.D_[t][a_] + ('' if t in ('dalab', 'republic') else ' ') + RN.D_[t][b2],
                                                word, rec['kind']), '%s %s %s' % (RN.EN.get(a_, a_), RN.EN.get(b2, b2), RN.EN_WORD[ki])))
            for nm_, gl_ in cand:
                if nm_ not in names_t.setdefault(t, set()):
                    name, gloss = nm_, gl_
                    break
            if t == 'screamer' and name:
                gloss = "the caravans' name: the Screamers name nothing"
        if name:
            rec.update(name=name, tongue=t, gloss=gloss)
            names_t[t].add(name)
        else:
            word = {'wadi': 'wadi'}.get(rec['kind'], 'river' if rec['q_mouth_m3s'] >= 50 else 'stream')
            base = '%s %s' % (rec['region'] or 'unnamed', word)
            prov[base] = prov.get(base, 0) + 1
            rec['name'] = base if prov[base] == 1 else '%s %d' % (base, prov[base])
    for r in recs:
        if '_to_cell' in r:
            c2 = r['_to_cell']
            while c2 not in cell_of and c2 is not None:
                a_, b2 = rt2['rec'][c2]
                c2 = (a_, b2) if a_ >= 0 else None
            if c2 is None:
                r['rec']['to'] = {'at_px': r['rec']['to']['at_px']}
                continue
            p_ = recs[cell_of[c2]]['rec']
            r['rec']['to'] = {'river': p_['id'], 'name': p_['name'], 'at_px': r['rec']['to']['at_px']}
    out_recs = [r['rec'] for r in recs] + [o for o in keep_named if o['id'] not in {r['rec']['id'] for r in recs}]
    out_recs.sort(key=lambda r: (r['kind'] != 'river', -(r['q_mouth_m3s'] if r['kind'] == 'river' else r['catchment_km2'])))
    gone = [o for n_, o in enumerate(old) if n_ not in used_old and n_ not in got.values() and o not in keep_named]
    report['courses'] = {'rivers': sum(r['kind'] == 'river' for r in out_recs), 'wadis': sum(r['kind'] == 'wadi' for r in out_recs),
                         'kept_from_4_21': len(got), 'new': [(recs[k]['rec']['id'], recs[k]['rec']['name'], recs[k]['rec']['kind'],
                                                              recs[k]['rec']['q_mouth_m3s'], recs[k]['rec']['px'][-1]) for k in newly],
                         'gone': [(o['id'], o['name'], o['kind'], o['q_mouth_m3s'], o['px'][-1]) for o in gone]}
    print('designated: %(rivers)d rivers, %(wadis)d dry valleys; %(kept_from_4_21)d are 4.21 courses' % report['courses'],
          '%d new, %d gone' % (len(newly), len(gone)))
    for nm, zm in zones.items():
        zF = up(zm, OH, OW, 0) > .5
        inz = [r for r in out_recs if np.mean([at(zF, p) for p in r['px']]) > .5]
        report['places'].setdefault(nm + '_courses', [(r['id'], r['name'], r['kind'], r['q_mouth_m3s'], r['catchment_km2']) for r in inz[:30]])
    CmF = up(Cm, OH, OW, 0) > .5
    catch_q = sum(r['q_mouth_m3s'] for r in out_recs if r['kind'] == 'river' and np.mean([at(CmF, p) for p in r['px']]) > .5
                  and 'river' not in r['to'])
    report['places']['catch_river_q_m3s'] = round(catch_q, 1)

    # ---- 4. the page
    s = lines[li]
    enc16 = lambda v: np.round(np.clip((v - LO) / (HI - LO), 0, 1) * 65535).astype(np.int64)
    h2 = h.copy()
    q_ = np.where(np.abs(En - E) > 0.05, enc16(En), (h2[..., 0] << 8) | h2[..., 1])
    h2[..., 0], h2[..., 1] = q_ >> 8, q_ & 255
    h2[..., 2] = np.where(take & ~whas2, 0, h2[..., 2])
    h2[..., 2] = np.where(newlake, 255, h2[..., 2])
    rep['h'] = b64(Image.fromarray(h2.astype(np.uint8), 'RGB'), optimize=True)
    wl2 = wl.copy()
    wl2[..., 2] = np.where(take, 0, wl2[..., 2])
    ew = enc16(newlv)
    for ch, v in ((0, ew >> 8), (1, ew & 255), (2, np.full(ew.shape, 255))):
        wl2[..., ch] = np.where(newlake, v, wl2[..., ch])
    rep['wl'] = b64(Image.fromarray(wl2.astype(np.uint8), 'RGB'), optimize=True)
    lit = relight(D, E, En)[0]
    pal = np.array([[int(c_['color'][i:i + 2], 16) for i in (1, 3, 5)] for c_ in D['climate']['classes']], float)
    rep['ct'] = repaint(dict(D, ct=lit['ct']), 'ct', pal[c0], pal[cls2], cls2 != c0)
    rep['rt'] = repaint(dict(D, rt=lit['rt']), 'rt', ramp(rain0), ramp(rain2), np.abs(rain2 - rain0) > 15)
    rep['p'] = b64(Image.fromarray(np.clip(np.round(rain2 / 4000 * 255), 0, 255).astype(np.uint8), 'L'), optimize=True)
    rep['c'] = b64(Image.fromarray(cls2, 'L'), optimize=True)
    rep['z'] = b64(Image.fromarray(zon2, 'L'), optimize=True)
    # the water and the rivers on the satellite and relief maps
    wetF2 = up(whas2, OH, OW, 0) > .5
    dryF = wet21 & ~wetF2
    addF = wetF2 & ~wet21
    os_ = {o['id']: strokes(o) for o in old}
    ns_ = {r['id']: strokes(r) for r in out_recs}
    sig = lambda st: tuple(st)
    redraw = [r for r in out_recs if r['kind'] == 'river' and (r['id'] not in os_ or sig(os_[r['id']]) != sig(ns_[r['id']])
                                                              or next(o for o in old if o['id'] == r['id'])['kind'] != 'river')]
    erase_ids = [o['id'] for o in old if o['kind'] == 'river' and (o['id'] not in ns_ or sig(os_[o['id']]) != sig(ns_[o['id']])
                                                                   or next(r for r in out_recs if r['id'] == o['id'])['kind'] != 'river')]
    em = Image.new('L', (OW, OH), 0)
    de = ImageDraw.Draw(em)
    for i_ in erase_ids:
        for pts, w_, al in os_[i_]:
            de.line(list(pts), fill=1, width=w_ + 2, joint='curve')
    eraseF = np.array(em).astype(bool)
    am = Image.new('L', (OW, OH), 0)
    da = ImageDraw.Draw(am)
    for o in old:
        if o['kind'] == 'river':
            for pts, w_, al in os_[o['id']]:
                da.line(list(pts), fill=1, width=w_ + 2, joint='curve')
    allriv = np.array(am).astype(bool)
    report['paint'] = {'rivers_erased': len(erase_ids), 'rivers_drawn': len(redraw), 'dry_px': int(dryF.sum()), 'wet_px': int(addF.sum()),
                       'erased_px': int(eraseF.sum())}
    EFp = up(En, OH, OW, 1)
    kC_paint = kC * sstep(C_['desert_top'], C_['desert_full'], EFp) * ~wetF2
    for key in ('st', 't'):
        src = Image.open(io.BytesIO(base64.b64decode(lit[key])))
        arr = np.array(src.convert('RGB'))
        a0 = np.array(Image.open(io.BytesIO(base64.b64decode(D[key]))).convert('RGB')).astype(float)
        wpaint = (a0[..., 2] - a0[..., 0] > 35) & (a0[..., 1] > a0[..., 0] + 20)
        land_src = ~nd.binary_dilation(wet21 | wetF2, iterations=1) & ~wpaint & ~allriv
        hole = (nd.binary_dilation(dryF, iterations=1) & ~wetF2) | (eraseF & ~wetF2 & ~wet21)
        arr = retint(arr, EF0, EFp, ~wetF2 & ~hole, land_src)
        if hole.any():
            arr = ER.inpaint(arr, hole, land_src)
        if key == 'st':
            arr = desert(arr, EFp, rain2, temps['tm'], wetF2 | allriv, CmF, kC_paint)
            # the Bowl's shore, wetter on 4.22 (the owner, 2026-10-23): painted for its new climate where its rain rose
            # (Mantis's pocket and the south wall's wet foot, which keep 4.21's rain, keep their paint), off the salt
            # flats round the lake (4.21's LAKE_STYLE, ~14 px)
            flats = np.clip((nd.distance_transform_edt(~(wet21 & bowlF)) - BOWL['flats'][0]) / BOWL['flats'][1], 0, 1)
            kB_paint = kB * sstep(40.0, 120.0, rain2 - rain0) * flats * ~wetF2
            arr = by_climate(arr, EFp, rain2, temps['tm'], wetF2 | allriv, bowlF, kB_paint)
            report['paint']['bowl_recoloured_px'] = int((kB_paint > .5).sum())
            report['paint']['catch_recoloured_px'] = int((kC_paint > .5).sum())
        water_src = wet21 & wetF2 & ~allriv
        if addF.any():
            arr = ER.inpaint(arr, addF, water_src)
            # the Catch's new terminal lakes have no lake paint near them: painted as the Bowl's salt lakes are
            arr = ER.lake_style(arr, a0.astype(np.uint8), bowlF | CmF, bw, addF & CmF)
        im = Image.fromarray(arr).convert('RGBA')
        over = Image.new('RGBA', im.size, (0, 0, 0, 0))
        dr = ImageDraw.Draw(over)
        for r in sorted(redraw, key=lambda r: r['q_mouth_m3s']):
            for pts, w_, al in ns_[r['id']]:
                dr.line(list(pts), fill=ER.RIVER_RGB + (al,), width=w_, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(.5))
        im = Image.alpha_composite(im, over).convert('RGB')
        qt = getattr(src, 'quantization', None)
        rep[key] = b64(im, 'JPEG', **({'qtables': qt, 'subsampling': 2} if qt else {'quality': 90}))
    for k, v in rep.items():
        key = '"%s": "' % k
        assert s.count(key) == 1, k
        a_ = s.index(key) + len(key)
        s = s[:a_] + v + s[s.index('"', a_):]
    # DATA: the rivers, the basins (4.21's outside the edited places and not found again, this routing's), the outlets
    zall = nd.binary_dilation(np.logical_or.reduce([zones[k] for k in ('cut', 'great', 'yeti', 'catch')]), iterations=1)
    keepb = []
    for b_ in D['basins']:
        c3 = g(*b_['at_px'])
        if zall[c3] or any(nd.binary_dilation(n_['_cells'], iterations=1)[c3] for n_ in basins):
            continue
        keepb.append(b_)
    nb = [{k_: v_ for k_, v_ in b_.items() if k_ != '_cells'} for b_ in basins]
    allb = sorted(keepb + nb, key=lambda b_: -b_['km2'])
    report['basins'] = {'kept_from_4_21': len(keepb), 'from_this_routing': len(nb), 'dropped_4_21': len(D['basins']) - len(keepb)}
    outlets = [o for o in D['outlets']] + [{'name': 'great lake (Rift head) outlet', 'from': 'great lake (Rift head)',
                                            'to': 'the Rift trough lake at px %s' % (list(G_['to']),), 'px': [px(*p_) for p_ in gpath],
                                            'bed_m': [round(float(En[p_])) for p_ in gpath], 'lake_level_m': round(G_['shore'])}]
    s = set_data(s, 'rivers', out_recs)
    s = set_data(s, 'basins', allb)
    s = set_data(s, 'outlets', outlets)
    hyd = dict(D['hydro'], version=VERSION, evap_k=round(G['evap_k'], 3), books=G['books'])
    s = set_data(s, 'hydro', hyd)
    lines[li] = s
    html = '\n'.join(lines)
    html, n = re.subn(r'scale model 4\.\d+ ·', 'scale model %s ·' % VERSION, html)
    assert n >= 1, 'version label not found'
    open(out, 'w', encoding='utf8').write(html)
    stem = os.path.splitext(out)[0]
    if prev:
        _, _, Dp = load(prev)
        rp = raster(Dp, 'p', 'L').astype(float) / 255 * 4000
        report['passes'] = {'rain_vs_previous_mm': {'mean_abs': round(float(np.abs(rp - rain2).mean()), 3),
                                                    'max_abs': round(float(np.abs(rp - rain2).max()))},
                            'water_cells_differ': int(((raster(Dp, 'wl')[..., 2] > 127) != whas2).sum())}
        print('against the previous run:', report['passes'])
    report['ledge'] = {'px': list(LEDGE), 'ground_m': round(float(En[g(*LEDGE)])), 'water_below': bool(
        nd.binary_dilation(whas2, iterations=2)[g(*LEDGE)])}
    json.dump(report, open(stem + '.report.json', 'w', encoding='utf-8', newline='\n'), indent=1)
    base = np.array(Image.open(io.BytesIO(base64.b64decode(rep['t']))).convert('RGB')).astype(float) * .8
    im = Image.fromarray(base.astype(np.uint8))
    dr = ImageDraw.Draw(im)
    for r in out_recs:
        if r['kind'] == 'wadi':
            dr.line([tuple(p) for p in r['px']], fill=(225, 190, 120), width=1)
    for r in out_recs:
        if r['kind'] == 'river':
            q = r['q_mouth_m3s']
            dr.line([tuple(p) for p in r['px']], fill=(20, 60, 200) if q >= 100 else (80, 150, 240), width=3 if q >= 1000 else 2 if q >= 100 else 1)
    for nm, zm in zones.items():
        j_, i_ = np.argwhere(zm).mean(0)
        x_, y_ = i_ / su, j_ / sv
        rr_ = max(12, (zm.sum() * KM2 / 3.14) ** .5 / 2)
        dr.ellipse([x_ - rr_, y_ - rr_, x_ + rr_, y_ + rr_], outline=(255, 0, 255), width=2)
    im.save(stem + '.rivers.png', optimize=True)
    print('wrote %s (%d bytes); report and picture beside it' % (out, len(html)))


if __name__ == '__main__':
    main()
