#!/usr/bin/env python3
"""Scale model 5.1, edit 2 (2026-11-09): the owner's decisions on the Firebliss Range (biomes/firebliss/PLAN.md).

    python3 tools/scale-model/edit_513.py            # edits model/data in place, writes edit_513.report.json

1. Copper Glacier's region (`rmvcopperglacier`) trimmed to the Firebliss Range's north edge: it overlapped 57% of the
   range (15,868 cells: three of its five volcanoes, two of its four valleys). The page's default regions are edited
   here, with a one-time reconcile for browsers holding a saved copy (`krator.regMerged.5.1e3`); the Firebliss and Copper
   Glacier notes are written.
2. The Firebliss rivers (`r_fb_west` Yan Warra, `r_fb_central` Tlahn Warra, `r_fb_east` Weyt Warra) were notched into the
   ground at their vertices only: between them the ground rose 300-590 m (the Labyrinth's pass rebuilt its mesas over
   the build's gorges), so the valleys' lakes had no outlet and the rivers ran uphill. Each is rerouted by the least-cut
   route from its lake (through Solfatara Glen for the Tlahn) to the build's own target, and carved so it falls the whole
   way: the bed at the lake's level at the outlet, linear in length to the next lake's level (or the target's ground),
   never above the ground, never rising; a channel one cell wide with walls at 25 degrees, the ground beside it lowered
   by no more than the course was. No lake is lowered (a rim cell taken under its level is held at it: the outlet's lip).
   The old strokes are painted out of `st` and `t` and the new ones painted in with the build's strokes. The records take
   the new course, the carved bed, their `region` and a `to`. The Labyrinth's own four rivers have the same fault and are
   left to its edit (reported in biomes/firebliss/PLAN.md).
3. Temperatures: the five rasters lapsed with the carve (-6.5 C/km). The hottest afternoon and the coldest night (`th`,
   `tl`) were 0-coded (no data) on 215,770 land cells (the 5.0/5.1 blocks set only `tm`, `tw`, `tc`), stale in the
   Firebliss and Labyrinth block, and contradicted their own months on 400,000 more (a hottest afternoon under the warm
   month, mostly in the 5.0 expansion strips the later passes warmed). They are set by 5.0's own rule
   (`climate.extend_latitude_temps_and_wind`): `th = tw + d`, `tl = tc - d`, the diurnal half-swing
   `d = clip(6.2 (1 - .42 m) + 2.2, 2.2, 11)`, `m = exp(-km to water / 76)`. A cell whose `th` and `tl` agree with its
   months keeps them.
4. Rain, class and zone re-derived where the carve moved the ground (`climate.reclimate`); the paints relit and retinted.
5. The five Firebliss vent records given a crater floor, radius and scale (the page drew them at no height; the resource
   bake's volcanic field reached 22 km round each, now 39-45 km: about each cone's base).

Every other cell of every raster is checked unchanged at the end. Refuses to run twice (Copper Glacier's trimmed edge is
the marker).
"""
import json, math, os, re, sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')
CG_ID, FB_ID, LAB_ID = 'rmvcopperglacier', 'rmw8hj62nmugn', 'rmw8bqrn3dnx4'
# Copper Glacier's south edge (362,1268 -> 235,1265 -> 195,1345 -> 48,1345) replaced by Firebliss's north edge from
# 307,1268 round to 48,1255. The strip west of Firebliss's west edge (x 48-73, y 1287-1345, 806 cells: 63% airless O,
# the rest HF, EF and HT on the barrier) is cut off from Copper Glacier's body by Firebliss's corner and left to neither.
CG_NEW = [[52, 1088], [195, 1088], [255, 1185], [365, 1215], [362, 1268], [307, 1268], [305, 1263], [234, 1237],
          [211, 1256], [155, 1269], [92, 1237], [48, 1255]]
CG_OLD = [[52, 1088], [195, 1088], [255, 1185], [365, 1215], [362, 1268], [235, 1265], [195, 1345], [48, 1345]]
FB_NOTE = ("A glaciovolcanic arc on the Labyrinth's northern rim: five ice-capped stratovolcanoes (Mount Pyre 6,650 m, "
           "Cinder-Crown, Firebliss Mons, Brimstone Spire, Copper-Fissure Vent) on a 4-5 km plateau of tundra and ice, and "
           "under the spine four warm valleys with geothermal lakes (West Bliss Cauldron 2,640 m, Great Firebliss Vale "
           "2,280 m, Solfatara Glen 2,120 m, East Bliss Vale 1,960 m; Cfb, Cfa at East Bliss), drained south-east by the Yan, "
           "Tlahn and Weyt Warra into the Labyrinth. The vents' plume blows SE over the Labyrinth. Nobody lives here; "
           "Fellgang and Kimr bands pass through semi-regularly (the owner, 2026-11-09). biomes/firebliss/PLAN.md.")
CG_NOTE_ADD = (" Trimmed 2026-11-09 (scale model 5.1 edit 3) to the Firebliss Range's north edge: the range's cones and "
               "valleys are Firebliss's.")
# The Firebliss rivers, rerouted: each leaves its lake by the route that needs the least cutting (a step costs its length
# times 1 + its cut over the lake's level per CUT_PER_DOUBLE metres) through the lakes named, to the build's own target.
#   (id, [the lakes it leaves and crosses, by a point in each], the target: a lake's point, or a point and a radius)
FB_RIVERS = [
    ('r_fb_west', [(125, 1343)], ('point', (182, 1404), 2.0)),          # West Bliss to the Labyrinth's north-branch head
    ('r_fb_central', [(184, 1318), (238, 1322)], ('lake', (234, 1424))),  # Great Vale, Solfatara Glen, the Labyrinth's Lake 3
    ('r_fb_east', [(284, 1318)], ('lake', (284, 1418))),                 # East Bliss to the Labyrinth's Lake 6
]
REGION = 'Firebliss Range'
# the five cones' crater floor (m) and rim radius (px): build_425_master.py step 9E, fb_volc_specs
FB_VENTS = {'Mount Pyre': (5820.0, 3.6), 'Cinder-Crown': (5320.0, 3.4), 'Firebliss Mons': (5480.0, 4.4),
            'Brimstone Spire': (5180.0, 3.2), 'Copper-Fissure Vent': (4680.0, 3.0)}
CUT_PER_DOUBLE = 100.0
BOX = (40, 1220, 380, 1450)                 # x0, y0, x1, y1: where the router may go
WALL = 2000.0 * math.tan(math.radians(25.0))  # the channel's floor one cell wide, its walls rising at 25 degrees
PAINT = {'st': (1.7, (52, 162, 158)), 't': (1.5, (58, 112, 132))}   # the build's Labyrinth/Firebliss river strokes


def hexrgb(h):
    return [int(h[i:i + 2], 16) for i in (1, 3, 5)]


def route(E, ok, src, dst, L0):
    """the least-cut route on the grid from any cell of src to any of dst (bool masks), 8-neighbour steps of 2 km (2.83 on
    the diagonal) costing 1 + max(0, E - L0) / CUT_PER_DOUBLE each; ok: where it may go. Returns the cells, src to dst"""
    import heapq
    x0, y0, x1, y1 = BOX
    sub = lambda a: a[y0:y1, x0:x1]
    Es, oks, ss, ds = sub(E), sub(ok | src | dst), sub(src), sub(dst)
    H, W = Es.shape
    pen = 1.0 + np.maximum(0.0, Es - L0) / CUT_PER_DOUBLE
    dist = np.full((H, W), np.inf); prev = -np.ones((H, W), np.int64)
    pq = []
    for y, x in zip(*np.nonzero(ss)):
        dist[y, x] = 0.0
        heapq.heappush(pq, (0.0, int(y), int(x)))
    steps = [(dy, dx, 2.0 * math.hypot(dy, dx)) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx]
    end = None
    while pq:
        d, y, x = heapq.heappop(pq)
        if d > dist[y, x]:
            continue
        if ds[y, x] and not ss[y, x]:
            end = (y, x)
            break
        for dy, dx, km in steps:
            v, u = y + dy, x + dx
            if 0 <= v < H and 0 <= u < W and oks[v, u]:
                nd_ = d + km * pen[v, u]
                if nd_ < dist[v, u]:
                    dist[v, u] = nd_; prev[v, u] = y * W + x
                    heapq.heappush(pq, (nd_, v, u))
    assert end is not None, 'no route'
    path = [end]
    while prev[path[-1]] >= 0:
        k = int(prev[path[-1]]); path.append((k // W, k % W))
    path.reverse()
    # from the last source cell on (a route may wander inside its own lake first)
    last = max(i for i, c in enumerate(path) if ss[c])
    return [(c[0] + y0, c[1] + x0) for c in path[last:]]


def carve(En, whas, cells, bed, sh):
    """En lowered to the course: each dry course cell to its bed, the ground beside it to walls rising at 25 degrees"""
    dry = [(c, b) for c, b in zip(cells, bed) if not whas[c]]
    cy = np.array([c[0] for c, _ in dry]); cx = np.array([c[1] for c, _ in dry]); cb = np.array([b for _, b in dry])
    R = 16
    y0, y1 = max(0, cy.min() - R), min(sh[0], cy.max() + R + 1)
    x0, x1 = max(0, cx.min() - R), min(sh[1], cx.max() + R + 1)
    sub = np.zeros((y1 - y0, x1 - x0), bool); subb = np.full(sub.shape, np.inf)
    sub[cy - y0, cx - x0] = True
    subb[cy - y0, cx - x0] = np.minimum(subb[cy - y0, cx - x0], cb)
    d, (iy, ix) = nd.distance_transform_edt(~sub, return_indices=True)
    prof = subb[iy, ix] + WALL * np.maximum(0.0, d - 1.0)
    blk = En[y0:y1, x0:x1]
    # beside the course the ground is lowered by no more than the course was: a canyon's own walls stay as steep as they were
    subc = np.zeros(sub.shape)
    subc[cy - y0, cx - x0] = np.maximum(0.0, blk[cy - y0, cx - x0] - cb)
    newv = np.where(~whas[y0:y1, x0:x1], np.minimum(blk, np.maximum(prof, blk - subc[iy, ix])), blk)
    moved = np.zeros(sh, bool)
    moved[y0:y1, x0:x1] = newv < blk - 0.01
    En[y0:y1, x0:x1] = newv
    return moved


def lake_ids(whas):
    lab, n = nd.label(whas, structure=np.ones((3, 3)))
    return lab


def main():
    D = P.load()
    src = open(os.path.join(SRC, '51-region-store.js'), encoding='utf-8', newline='').read()
    if json.dumps(CG_NEW) in src:
        sys.exit('edit_513 has run already (Copper Glacier is trimmed in 51-region-store.js)')
    rep = {'edit': '5.1 edit 3', 'date': '2026-11-09'}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    assert sh == (D['fullH'], D['fullW']), 'the 5.1 grid is the full one'
    codes = [c['code'] for c in D['climate']['classes']]
    raw0 = {k: P.raster(D, k, 'L' if k in ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc') else 'RGB')
            for k in ('h', 'wl', 'p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc', 'st', 't', 'rt', 'ct')}
    En = Eo.copy()
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]]
    lab = lake_ids(whas0)
    level = lambda k: float(np.nanmedian(wlev0[lab == k]))
    rv = {r['id']: r for r in D['rivers']}

    # ---- 1. the Firebliss rivers rerouted and carved
    rep['rivers'] = {}
    courses = {}
    carved = np.zeros(sh, bool)
    old_px = {}
    lake_at = lambda x, y: lab == lab[y, x]
    for rid, lakes, tgt in FB_RIVERS:
        r = rv[rid]
        old_px[rid] = r['px']
        was_km = r.get('length_km')
        for x, y in lakes:
            assert whas0[y, x], (rid, x, y)
        if tgt[0] == 'lake':
            assert whas0[tgt[1][1], tgt[1][0]]
            ends = [lake_at(*tgt[1])]
            end_level = level(lab[tgt[1][1], tgt[1][0]])
        else:
            (tx, ty), rr = tgt[1], tgt[2]
            ends = [(np.hypot(xx - tx, yy - ty) <= rr) & ~whas0]
            end_level = float(Eo[ty, tx])
        legs = [lake_at(x, y) for x, y in lakes] + ends
        cells, bed = [], []
        for a, b in zip(legs[:-1], legs[1:]):
            L0 = float(np.nanmedian(wlev0[a]))
            Lb = float(np.nanmedian(wlev0[b])) if whas0[b].any() else end_level
            ok = ~whas0 & (Eo < 8800.0)
            leg = route(Eo, ok, a, b, L0)
            # the bed: the lake's level at the outlet, falling linearly in length to the next lake's level (or the target's
            # ground), never above the ground, never rising
            km = np.concatenate([[0.0], np.cumsum([2.0 * math.hypot(p[0] - q[0], p[1] - q[1]) for p, q in zip(leg[:-1], leg[1:])])])
            lin = L0 + (Lb - L0) * km / max(km[-1], 1e-9)
            bd = np.array([lin[k] if whas0[c] else min(lin[k], float(Eo[c])) for k, c in enumerate(leg)])
            bd = np.minimum.accumulate(bd)
            if cells:
                bd = np.minimum(bd, bed[-1])
            cells += leg; bed += list(bd)
        bed = np.array(bed)
        moved = carve(En, whas0, cells, bed, sh)
        carved |= moved
        courses[rid] = cells
        # the record: the new course, every cell (a line between cells further apart would cross ground the carve left)
        keep = list(range(len(cells)))
        r['px'] = [[float(cells[k][1]), float(cells[k][0])] for k in keep]
        r['bed_m'] = [round(float(bed[k]), 1) for k in keep]
        r['source_m'], r['mouth_m'] = r['bed_m'][0], r['bed_m'][-1]
        r['length_km'] = round(sum(2.0 * math.hypot(p[0] - q[0], p[1] - q[1]) for p, q in zip(r['px'][:-1], r['px'][1:])), 1)
        qm = float(r['q_mouth_m3s'])
        r['q_m3s'] = [round(18.0 + (qm - 18.0) * k / (len(r['px']) - 1), 1) for k in range(len(r['px']))]
        r['region'] = REGION
        if tgt[0] == 'lake':
            k = lab[tgt[1][1], tgt[1][0]]
            through = any(rv2['id'] not in (rid,) and any(0 <= int(round(q[1])) < sh[0] and lab[int(round(q[1])), int(round(q[0]))] == k
                                                         for q in rv2['px'][:-1]) for rv2 in D['rivers'])
            r['to'] = {'lake_m': int(round(level(k))), 'through': bool(through), 'at_px': r['px'][-1]}
        else:
            trunk = rv['r_lab_chaos_n']
            r['to'] = {'river': trunk['id'], 'name': trunk['name'], 'at_px': r['px'][-1]}
        cut = Eo - En
        rep['rivers'][rid] = {'name': r['name'], 'length_km': r['length_km'], 'was_km': was_km,
                              'source_m': r['source_m'], 'mouth_m': r['mouth_m'], 'to': r['to'],
                              'deepest_cut_m': round(float(cut[moved].max()), 1) if moved.any() else 0.0,
                              'course_cut_m_p50_p95_max': [round(float(np.percentile([cut[c] for c in cells], q)), 1) for q in (50, 95, 100)],
                              'cells_cut_over_200m': int((moved & (cut > 200)).sum())}
    rep['cells_carved'] = int(carved.sum())
    rep['carve_max_m'] = round(float((Eo - En).max()), 1)

    # no lake lowered: a rim cell the carve took under its lake's level is held at the level (an outlet is a lip)
    for k in np.unique(lab[nd.binary_dilation(carved, iterations=2) & whas0]):
        if k == 0:
            continue
        lk = lab == k
        rim = nd.binary_dilation(lk, structure=np.ones((3, 3))) & ~whas0
        lv = level(k)
        hold = rim & (En < lv - 0.5) & (Eo >= lv - 0.5)
        En[hold] = lv
        rep.setdefault('lakes', []).append({'level_m': round(lv), 'cells': int(lk.sum()), 'rim_held_cells': int(hold.sum()),
                                            'rim_under_level_before': int((rim & (Eo < lv - 0.5)).sum())})
    # every course falls the whole way on its dry cells
    for rid, cells in courses.items():
        dry = [float(En[c]) for c in cells if not whas0[c]]
        rise = max([0.0] + [b - min(dry[:k + 1]) for k, b in enumerate(dry)])
        rep['rivers'][rid]['rise_after_m'] = round(rise, 2)
        assert rise <= 0.5, '%s still climbs %.1f m' % (rid, rise)

    # ---- 2. temperatures lapsed with the carve, then rain, class and zone where it moved the ground
    lap = C.lapse(D, Eo, En, whas0, wlev0)
    for k, v in lap.items():
        D[k] = v
    forced = np.zeros(sh, bool)
    rain2, cls2, zon2, q, crep = C.reclimate(D, Eo, En, whas0, forced)
    rep['reclimate'] = crep

    # ---- 3. th and tl: filled where 0-coded on land, and reset in the Firebliss-Labyrinth block
    T = {k: P.raster(D, k, 'L').astype(float) - 90 for k in C.TEMPS}
    airless = cls2 == codes.index('O')
    land = ~nd.zoom(whas0.astype(np.uint8), (sh[0] / whas0.shape[0], sh[1] / whas0.shape[1]), order=0).astype(bool)
    have = (T['tm'] > -89) & (T['tw'] > -89) & (T['tc'] > -89)
    missing = land & ~airless & have & ((T['th'] <= -89) | (T['tl'] <= -89))
    src_regs = json.loads(re.search(r'const defRegs = (\[.*?\]);', src, re.S).group(1))
    poly_of = {rr['id']: rr['points'] for rr in src_regs}
    block = nd.binary_dilation((G.poly(poly_of[FB_ID], 1, 1, sh) > .5) | (G.poly(poly_of[LAB_ID], 1, 1, sh) > .5),
                               iterations=30) & land & ~airless & have
    contra = land & ~airless & have & ~missing & ((T['th'] < T['tw']) | (T['tl'] > T['tc']))   # under its own warm month, over its cold
    fix = missing | block | contra
    d_water = nd.distance_transform_edt(land)            # px (2 km) to the nearest water
    marine = np.exp(-d_water / 38.0)
    dhalf = np.clip(6.2 * (1.0 - 0.42 * marine) + 2.2, 2.2, 11.0)
    th = np.where(fix, np.round(T['tw'] + dhalf), T['th'])
    tl = np.where(fix, np.round(T['tc'] - dhalf), T['tl'])
    for k, v in (('th', th), ('tl', tl)):
        D[k] = P.b64(Image.fromarray(np.clip(v + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    ok = land & ~airless & have & ~fix
    rep['th_tl'] = {'filled_missing_cells': int(missing.sum()), 'reset_in_block_cells': int((block & ~missing).sum()),
                    'reset_contradicting_cells': int((contra & ~block).sum()),
                    'diurnal_half_swing_C': [round(float(np.percentile(dhalf[fix], p)), 1) for p in (5, 50, 95)],
                    'kept_cells': int(ok.sum()),
                    'kept_tc_minus_tl_over_20': int((ok & (T['tc'] - T['tl'] > 20)).sum())}

    # ---- 4. the paint
    D['h'] = P.encode_heights(D, En, water0)
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    rain0 = raw0['p'].astype(float) / 255 * 4000
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], cnow != raw0['c'])
    relit, EoF, EnF = PA.relight(D, Eo, En)
    for k, v in relit.items():
        D[k] = v
    nearc = nd.binary_dilation(carved, iterations=3)
    # the old courses' strokes painted out (not where another river's stroke or water is), the new ones painted in
    from PIL import ImageDraw
    def stroke(pts_list, width):
        im = Image.new('L', (sh[1], sh[0]), 0)
        dr = ImageDraw.Draw(im)
        for pts in pts_list:
            dr.line([tuple(p) for p in pts], fill=255, width=width, joint='curve')
        return np.array(im) > 0
    others = stroke([r_['px'] for r_ in D['rivers'] if r_['id'] not in old_px], 3)
    hole = nd.binary_dilation(stroke(old_px.values(), 2), iterations=1) & ~nd.binary_dilation(others, iterations=1) & \
        ~nd.binary_dilation(whas0, iterations=1)
    rep['old_strokes_painted_out_px'] = int(hole.sum())
    for k in ('st', 't'):
        a = PA.retint(P.raster(D, k), EoF, EnF, nearc, ~nearc, 150.0)
        a = PA.inpaint(a, hole)
        D[k] = P.jpeg_like(D, k, a)
        w, colr = PAINT[k]
        for rid in old_px:
            D[k] = PA.paint_river(D, k, rv[rid]['px'], width=w, colour=colr)
    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)

    # ---- 5. nothing else moved (the paint excepted)
    a = P.raster(D, 'h')
    assert not (np.any(a != raw0['h'], -1) & ~carved).any(), 'h changed outside the channels'
    assert (P.raster(D, 'wl') == raw0['wl']).all(), 'wl changed'
    tsite = nd.binary_dilation(carved, iterations=4) | q
    for k in ('tm', 'tw', 'tc', 'p', 'c', 'z'):
        assert not ((P.raster(D, k, 'L') != raw0[k]) & ~tsite).any(), k + ' changed outside the channels'
    for k in ('th', 'tl'):
        assert not ((P.raster(D, k, 'L') != raw0[k]) & ~tsite & ~fix).any(), k + ' changed outside the fill'
    rep['cells_changed'] = {k: int((P.raster(D, k, 'L') != raw0[k]).sum()) for k in ('tm', 'tw', 'tc', 'th', 'tl', 'p', 'c', 'z')}

    # ---- 6. the five Firebliss vent records: build_425_master.py wrote name, px, peak, kind and region only. The page draws a
    # vent's lava disc at its `floor` (none: NaN, so the five were not drawn) and the resource bake's volcanic field reaches
    # 10 + 4 radius km (no radius: 3, 22 km, 7% of the range). Given as the Throne's records are: the crater's floor and
    # radius (km) from the build's spec, so the field reaches 39-45 km, about each cone's base; scale .4, as degassing cones
    rep['vents'] = []
    for name, (floor, rr_px) in FB_VENTS.items():
        v = next(v for v in D['vents'] if v.get('name') == name and v.get('region') == 'Firebliss Range')
        assert 'floor' not in v and 'radius' not in v, name
        v.update({'floor': floor, 'scale': 0.4, 'radius': round(2.0 * rr_px, 1)})
        rep['vents'].append(v)

    # ---- 7. the page's default regions (checked before anything is written)
    rep['records'], writes = records(src)
    writes.append(names_table(D, rep))
    P.save(D)
    for path, text in writes:
        open(path, 'w', encoding='utf-8', newline='').write(text)
    json.dump(rep, open(os.path.join(HERE, 'edit_513.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


def names_table(D, rep):
    """river-names-5.1.md: every row's length, source -> mouth and "Drains To" from the records (the generator read
    "Drains To" from `to.name` or `to.kind` only, so every river ending in a lake or a basin read "sea")"""
    from smodel.river_names import drains_to
    path = os.path.join(HERE, 'river-names-5.1.md')
    by = {str(r['id']): r for r in D['rivers']}
    out, n = [], 0
    for line in open(path, encoding='utf-8', newline='').read().split('\n'):
        m = re.match(r'^\| `([^`]+)` \| (.*?) \| (.*?) \| (.*?) \| (.*?) \| ([0-9]+) \| `(-?[0-9]+) -> (-?[0-9]+)` \| (.*?) \| (.*)$', line)
        if m and m.group(1) in by:
            r = by[m.group(1)]
            new = '| `%s` | %s | %s | %s | %s | %.0f | `%.0f -> %.0f` | %s | %s' % (
                m.group(1), m.group(2), m.group(3), m.group(4), m.group(5), float(r.get('length_km') or 0.0),
                r.get('source_m', 0), r.get('mouth_m', 0), drains_to(r.get('to')), m.group(10))
            n += new != line
            line = new
        out.append(line)
    rep['river_names_rows_changed'] = n
    return path, '\n'.join(out)


def records(s):
    out = {}
    path = os.path.join(SRC, '51-region-store.js')
    m = re.search(r'const defRegs = (\[.*?\]);\n', s, re.S)
    regs = json.loads(m.group(1))
    assert json.dumps(regs) == m.group(1), 'the default regions would reformat'
    R = {rr['id']: rr for rr in regs}
    assert R[CG_ID]['points'] == CG_OLD, 'Copper Glacier is not the polygon this edit expects'
    assert R[FB_ID]['notes'] == '', 'Firebliss has a note already'
    R[CG_ID]['points'] = CG_NEW
    R[CG_ID]['notes'] = R[CG_ID]['notes'] + CG_NOTE_ADD
    R[FB_ID]['notes'] = FB_NOTE
    s = s[:m.start(1)] + json.dumps(regs) + s[m.end(1):]
    old = "      if(localStorage.getItem('krator.regMerged.5.1e1')!=='1'){"
    i = s.index(old)
    j = s.index('      }\n', i) + len('      }\n')
    add = ("      if(localStorage.getItem('krator.regMerged.5.1e3')!=='1'){   // 5.1 edit 3: Copper Glacier trimmed to the Firebliss Range; Firebliss's note\n"
           '        ["%s", "%s"].forEach(id=>{ const d=defMap.get(id); if(d) regions.set(id,d); });\n'
           "        localStorage.setItem('krator.regMerged.5.1e3','1');\n"
           '        localSave();\n'
           '      }\n') % (CG_ID, FB_ID)
    s = s[:j] + add + s[j:]
    regs = json.loads(re.search(r'const defRegs = (\[.*?\]);', s, re.S).group(1))
    R = {rr['id']: rr for rr in regs}
    sh = (1723, 1821)
    mcg, mfb = G.poly(R[CG_ID]['points'], 1, 1, sh) > .5, G.poly(R[FB_ID]['points'], 1, 1, sh) > .5
    out['cg_fb_overlap_cells'] = int((mcg & mfb).sum())           # the shared edge's cells only
    out['cg_cells'] = int(mcg.sum())
    assert out['cg_fb_overlap_cells'] < 150
    for nm, (x, y) in {'Mount Pyre': (104, 1304), 'Firebliss Mons': (206, 1284), 'Great Firebliss Vale': (184, 1318),
                       'West Bliss Cauldron': (126, 1344), 'Copper Tarn': (148, 1148)}.items():
        out[nm] = {'copper_glacier': bool(mcg[y, x]), 'firebliss': bool(mfb[y, x])}
    assert not mcg[1304, 104] and mcg[1148, 148]
    return out, [(path, s)]


if __name__ == '__main__':
    main()
