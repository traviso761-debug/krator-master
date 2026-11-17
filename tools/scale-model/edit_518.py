#!/usr/bin/env python3
"""Scale model 5.1, edit 8 (Gemini 2026-11-13 as its edit_517; re-run 2026-11-16 after Erewhon's lake and Phēr): secondary ejecta craters, arch basalt horsts, evaporite strandlines,
Ring Sea carbonate benches & turquoise shoals, Firebliss pancake domes, and Rift Rim planar fault facets.

    python tools/scale-model/edit_518.py

Implements the six deterministic 5.1 terrain, hydrography, and surface-albedo passes on top of edit_511..edit_516:
  Pass 1 - Spider Lake secondary ejecta crater, NW boulder-breccia rampart sealing the Ria divide, SW 9102 bedrock
           spillway notch at (1246, 232), and strictly monotonic seaward/lakeward river bed grades (9101, 9102, 9106, 9109).
  Pass 2 - SE Outer Wall / unmarked SE Tharn 108 km (r = 27 px) secondary ejecta crater at (1375, 1525) (floor 6,880 m,
           raised rim 7,950-11,400+ m) with central 24 km (r = 6 px) cryo-fumarole tarn (wl = 6,910 m), vent, and basin.
  Pass 3 - The Arch onshore flood-basalt horsts across SW Crookshore and NE Double Delta / N Ria, twin circular 24-26 km
           drowned secondary-ejecta bays indenting Crookshore, and Copper Tarn secondary-crater collar + verdigris tint.
  Pass 4 - n semiarid closed dam-relic salt lakes (~716,420 and ~872,442) 360-degree wave-cut shoreline benches (+60 m,
           +140 m, +230 m above lake wl), salt-lake basin records, and crisp high-albedo evaporite strandline rings.
  Pass 5 - ringisles non-tower carbonate benches (+8 to +35 m) & shallow turquoise shoals (-2 to -18 m) outside tower-karst
           cores (Kautoa, Western Spice / Pontus outer islets, Shell / Port Goto-Crescent, Talon), plus Port Goto (920, 703)
           clean 1-px coastal water adjacency.
  Pass 6 - firebliss 3 flat-topped circular 18-22 km (380-490 m relief) silicic/obsidian pancake domes on untouched plain
           cells, planar normal-fault footwall facets along untouched riftrim scarps, and the 2-cell neouterwall cauldron
           shore-apron alignment owed from f124d9ff5.

Writes updated model/data/*, tools/scale-model/edit_518.report.json, and tools/scale-model/edit_518.crops.jpg.
Refuses to run twice (`lf_spider_crater` in DATA.landforms is the marker).
"""
import glob
import json
import math
import os
import sys
from collections import Counter

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.climate as C  # noqa: E402
import smodel.geom as G  # noqa: E402
import smodel.page as P  # noqa: E402
import smodel.paint as PA  # noqa: E402
import smodel.terrain as T  # noqa: E402
from edit_511 import gh_weight, hexrgb  # noqa: E402

MARKER_ID = 'lf_spider_crater'


def sstep(a, b, x):
    t = np.clip((np.asarray(x, float) - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def resample_list(vals, new_n):
    if not vals:
        return [0.0] * new_n
    if len(vals) == new_n:
        return list(vals)
    xs_old = np.linspace(0.0, 1.0, len(vals))
    xs_new = np.linspace(0.0, 1.0, new_n)
    return [round(float(v), 1) for v in np.interp(xs_new, xs_old, vals)]


def poly_mask(regions_by_id, rid, sh):
    r = regions_by_id.get(rid)
    if r is None:
        return np.zeros(sh, bool)
    return G.poly(r['points'], 1.0, 1.0, sh) > 0.5


def build_river_corridor(rivers, sh, radius_px=3, exclude_ids=()):
    m = np.zeros(sh, bool)
    ex = {str(x) for x in exclude_ids}
    for r in rivers:
        if str(r.get('id')) in ex:
            continue
        pts = r.get('px') or []
        for a, b in zip(pts, pts[1:]):
            steps = max(1, int(math.ceil(max(abs(b[0] - a[0]), abs(b[1] - a[1])))))
            for k in range(steps + 1):
                x = int(round(a[0] + (b[0] - a[0]) * k / steps))
                y = int(round(a[1] + (b[1] - a[1]) * k / steps))
                if 0 <= y < sh[0] and 0 <= x < sh[1]:
                    m[y, x] = True
    if radius_px > 0:
        m = nd.binary_dilation(m, iterations=radius_px)
    return m


def tint_with_detail(arr, target_rgb, weight, blur_sig=5.0):
    """Blend RGB target over `arr` modulated by local luminance detail so hillshading and micro-texture stay crisp."""
    a = arr.astype(float)
    lum = a.mean(-1)
    det = np.clip((lum + 6.0) / (nd.gaussian_filter(lum, blur_sig) + 6.0), 0.72, 1.32)[..., None]
    tgt = np.asarray(target_rgb, float)[None, None, :] * det
    w3 = np.clip(weight, 0.0, 1.0)[..., None]
    return np.clip(a * (1.0 - w3) + tgt * w3, 0.0, 255.0)


def main():
    D = P.load()
    LFDOC = D.get('landforms') or {'format': 'krator-landforms', 'version': 1, 'landforms': []}
    if isinstance(LFDOC, list):
        LFDOC = {'format': 'krator-landforms', 'version': 1, 'landforms': LFDOC}
    if any(lf.get('id') == MARKER_ID for lf in LFDOC['landforms']):
        sys.exit('edit_518 has run already (%s exists in landforms)' % MARKER_ID)

    rng = np.random.default_rng(517)
    rep = {'edit': '5.1 edit 8', 'date': '2026-11-13'}

    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]]

    raw0 = {
        k: P.raster(D, k, 'L' if k in ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc') else 'RGB')
        for k in ('h', 'wl', 'p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc', 'st', 't', 'rt', 'ct')
    }

    regions = P.regions()
    byid = {r['id']: r for r in regions}
    setts = P.settlements()
    lab0, _ = nd.label(whas0, structure=np.ones((3, 3)))

    En = Eo.copy()
    whas2 = whas0.copy()
    wlev2 = wlev0.copy()
    landforms = list(LFDOC['landforms'])

    # Global hard protection mask for stations, settlements, vents, and tested features
    protect = np.zeros(sh, bool)
    # Settlements (keep a 1-px safety halo on dry/wet settlements, except Port Goto's explicit shoreline tune)
    for s in setts:
        sx, sy = int(round(s['px'])), int(round(s['py']))
        if 0 <= sy < sh[0] and 0 <= sx < sh[1]:
            protect[max(0, sy - 1):min(sh[0], sy + 2), max(0, sx - 1):min(sh[1], sx + 2)] = True
    # Biome station JSON pins
    for st_path in sorted(glob.glob(os.path.join(REPO, 'biomes', '**', 'station*.json'), recursive=True)):
        st_doc = json.load(open(st_path, encoding='utf-8'))
        site = st_doc.get('site', {})
        if 'px' not in site or 'py' not in site:
            continue
        raw_px, raw_py = float(site['px']), float(site['py'])
        if '4.2' in st_doc.get('source', '') and '5.' not in st_doc.get('canvas', ''):
            raw_px, raw_py = P.legacy_px(raw_px, raw_py, D)
        spx, spy = int(round(raw_px)), int(round(raw_py))
        if 0 <= spy < sh[0] and 0 <= spx < sh[1]:
            protect[max(0, spy - 2):min(sh[0], spy + 3), max(0, spx - 2):min(sh[1], spx + 3)] = True
    # Tested vents with peaks
    for v in [D.get('volc', {})] + list(D.get('vents', [])):
        if 'px' not in v:
            continue
        vx, vy = float(v['px'][0]), float(v['px'][1])
        rad = 8.0 if 'peak' in v else 3.0
        protect |= np.hypot(xx - vx, yy - vy) <= rad
    # Portal Valley & Epidote Cave (edit_511)
    protect[290:342, 1322:1348] = True
    # Stalker Peaks 4 summits & Hub 01 (edit_515)
    for px_s, py_s in [(1287, 1293), (1321, 1481), (1397, 1505), (1411, 1409), (1344, 1409)]:
        protect |= np.hypot(xx - px_s, yy - py_s) <= 3.5
    # Protected reshaped polygons from edit_511..516
    for pid in ('rmw4wou2y1hhc', 'rmvkbfspgsmr3', 'rmvka7icdn1dq', 'rmw5s3ktxgv0d',
                'rmw8bqrn3dnx4', 'rmvkkmitffbjk', 'rmw5n1w1rx0u2', 'rmvhighrift100'):
        protect |= poly_mask(byid, pid, sh)

    rivers_by_id = {str(r['id']): r for r in D['rivers']}
    riv_corr_all = build_river_corridor(D['rivers'], sh, radius_px=3)

    # =========================================================================
    # PASS 1: Spider Lake Secondary Ejecta Crater, NW Rampart, SW 9102 Spillway
    # =========================================================================
    sp_lbl = lab0[212, 1295]
    sp_orig = lab0 == sp_lbl
    SP_WL = 1460.0
    # Secondary ejecta crater centered at (1289.0, 213.5), minor radius r = 21.5 px (D ~ 86 km), major rx = 29.5 px
    cx1, cy1 = 1289.0, 213.5
    ang1 = math.radians(-20.0)
    ca1, sa1 = math.cos(ang1), math.sin(ang1)
    dx1 = xx - cx1
    dy1 = yy - cy1
    u1 = dx1 * ca1 + dy1 * sa1
    v1 = -dx1 * sa1 + dy1 * ca1
    rx1, ry1 = 29.5, 21.5
    rell1 = np.hypot(u1 / rx1, v1 / ry1)
    theta1 = np.degrees(np.arctan2(dy1, dx1))  # -180..180: N=-90, NW=-135, W=180/-180, SW=+148, ESE=+15

    # Low-frequency radial hummock noise for ejecta blanket & crater rim
    n1_fine = nd.gaussian_filter(rng.standard_normal(sh), 1.8)
    n1_fine_std = float(n1_fine.std()) or 1.0
    n1_fine = n1_fine / n1_fine_std
    n1_med = nd.gaussian_filter(rng.standard_normal(sh), 4.2)
    n1_med = n1_med / (float(n1_med.std()) or 1.0)
    rays1 = np.cos(14.0 * np.arctan2(v1, u1) + 0.5 * n1_med)

    # ESE inflow corridor for 9106 (Hau-Gel entering around 1328..1358, 227..234)
    r9106 = rivers_by_id['9106']
    corr_9106 = build_river_corridor([r9106], sh, radius_px=4)

    # SW spillway corridor (7 px = 14 km wide) from SW crater shore (1266, 221) through (1246, 232) to (1231.5, 232.0)
    spill_pts = [
        (1269.0, 219.0), (1266.0, 221.0), (1262.0, 223.5), (1258.0, 226.0),
        (1254.0, 228.2), (1250.0, 230.2), (1246.0, 232.0), (1242.0, 232.2),
        (1238.0, 232.2), (1234.5, 232.1), (1231.5, 232.0),
    ]
    d_spill = np.full(sh, 1e9)
    s_spill = np.zeros(sh, float)
    for k_sp, (ax, ay) in enumerate(spill_pts[:-1]):
        bx, by = spill_pts[k_sp + 1]
        vx_, vy_ = bx - ax, by - ay
        l2 = vx_ * vx_ + vy_ * vy_
        t_ = np.clip(((xx - ax) * vx_ + (yy - ay) * vy_) / max(l2, 1e-9), 0.0, 1.0)
        d_ = np.hypot(xx - (ax + t_ * vx_), yy - (ay + t_ * vy_))
        upd = d_ < d_spill
        d_spill = np.where(upd, d_, d_spill)
        s_spill = np.where(upd, (k_sp + t_) / (len(spill_pts) - 1), s_spill)

    # Crater lake interior (rell1 <= 0.80, united with core of original Spider Lake inside rell1 <= 0.90)
    lake1 = ((rell1 <= 0.79) | (sp_orig & (rell1 <= 0.90))) & ~protect
    # Keep 4 emergent rocky MVT / megabreccia silk-weir stacks in the central narrows (away from 9106 mouth & spillway)
    stacks1 = np.zeros(sh, bool)
    for sx_st, sy_st, sr_st, sh_st in [
        (1285.0, 210.0, 1.4, 1478.0),
        (1292.0, 215.0, 1.5, 1486.0),
        (1299.0, 209.0, 1.3, 1474.0),
        (1305.0, 214.0, 1.2, 1471.0),
    ]:
        st_m = np.hypot(xx - sx_st, yy - sy_st) <= sr_st
        stacks1 |= st_m
    lake1 &= ~stacks1

    # Update Spider Lake water mask inside Pass 1 box (1220..1360 x 175..248)
    p1_water_box = (xx >= 1255) & (xx <= 1335) & (yy >= 188) & (yy <= 236) & ~protect
    whas2[p1_water_box] = False
    whas2[lake1] = True
    wlev2[lake1] = SP_WL

    # Sedimented flat crater floor (1,396-1,434 m, shallowing near shore to 1,448 m)
    floor_depth = 58.0 * (1.0 - sstep(0.0, 0.79, rell1)) + 12.0 + 5.5 * n1_fine
    En = np.where(lake1, np.clip(SP_WL - floor_depth, 1396.0, 1451.0), En)
    for sx_st, sy_st, sr_st, sh_st in [
        (1285.0, 210.0, 1.4, 1478.0),
        (1292.0, 215.0, 1.5, 1486.0),
        (1299.0, 209.0, 1.3, 1474.0),
        (1305.0, 214.0, 1.2, 1471.0),
    ]:
        d_st = np.hypot(xx - sx_st, yy - sy_st)
        m_st = d_st <= sr_st
        En = np.where(m_st, sh_st - 10.0 * (d_st / sr_st) ** 2, En)

    # Steep inner crater wall (rell1 = 0.79..1.04, ~5 px) + asymmetric ejecta rim + radial hummocky blanket (to rell1 ~ 1.95)
    # Asymmetric factor: strongest on NW/N downrange arc (theta in [-165, -35]), modest on S/SE
    nw_az = np.exp(-0.5 * (((theta1 + 112.0 + 180.0) % 360.0 - 180.0) / 52.0) ** 2)
    rim_target = 1960.0 + 420.0 * nw_az + 65.0 * n1_med + 35.0 * n1_fine
    wall_t = sstep(0.79, 1.03, rell1)
    wall_bench = 45.0 * np.sin(wall_t * math.pi * 2.0) * (wall_t > 0.1) * (wall_t < 0.85)
    inner_wall_h = (SP_WL + 14.0) + (rim_target - (SP_WL + 14.0)) * wall_t + wall_bench

    # Outer radial hummocky ejecta blanket (rell1 = 1.03..1.95, ~22-38 px from center)
    blanket_decay = (1.0 - sstep(1.03, 1.95, rell1)) ** 1.6
    ejecta_add = blanket_decay * (360.0 + 240.0 * nw_az + 55.0 * rays1 + 42.0 * n1_fine)

    # Gate attenuations so 9106 ESE inflow and SW spillway are not dammed by the rim
    inflow_gate = sstep(2.0, 6.5, nd.distance_transform_edt(~corr_9106))
    spill_gate = sstep(3.6, 7.5, d_spill)
    gate1 = inflow_gate * spill_gate

    in_wall = (rell1 > 0.79) & (rell1 <= 1.03) & ~lake1 & ~stacks1 & ~protect & (gate1 > 0.05)
    En = np.where(in_wall, En * (1.0 - gate1) + np.maximum(En, inner_wall_h) * gate1, En)

    in_blanket = (rell1 > 1.03) & (rell1 < 1.95) & ~lake1 & ~protect & (yy >= 122) & (yy <= 284)
    # Keep Ria trunk 9101 (around y=93..125) and downstream 9109 (x < 1210) untouched by blanket
    r9101 = rivers_by_id['9101']
    r9109 = rivers_by_id['9109']
    corr_ria = build_river_corridor([r9101], sh, radius_px=5)
    in_blanket &= ~corr_ria
    En = np.where(in_blanket, En + ejecta_add * gate1, En)

    # Explicit NW boulder-breccia ejecta rampart ridge from (1268, 182) -> (1222, 166) -> (1200, 152)
    ramp_pts = [(1268.0, 182.0), (1252.0, 175.0), (1236.0, 170.5), (1222.0, 166.0), (1211.0, 159.0), (1200.0, 152.0)]
    d_ramp = np.full(sh, 1e9)
    for (ax, ay), (bx, by) in zip(ramp_pts[:-1], ramp_pts[1:]):
        vx_, vy_ = bx - ax, by - ay
        l2 = vx_ * vx_ + vy_ * vy_
        t_ = np.clip(((xx - ax) * vx_ + (yy - ay) * vy_) / max(l2, 1e-9), 0.0, 1.0)
        d_ramp = np.minimum(d_ramp, np.hypot(xx - (ax + t_ * vx_), yy - (ay + t_ * vy_)))
    ramp_bell = np.exp(-0.5 * (d_ramp / 4.8) ** 2) * (1.0 - sstep(7.0, 12.5, d_ramp))
    # Do not raise SW of y >= 173 where x <= 1210 (9109 new source at 1208.8, 174.6)
    ramp_safe = ~protect & ~corr_ria & ~((xx <= 1211) & (yy >= 172))
    ramp_lift = (275.0 + 38.0 * n1_fine) * ramp_bell
    En = np.where(ramp_safe & (ramp_bell > 0.01), np.maximum(En + ramp_lift, 1940.0 * (d_ramp <= 3.2)), En)

    # Ensure every non-spillway shore cell of Spider Lake stands >= SP_WL + 12 m (except 9106 ESE mouth >= SP_WL + 2 m)
    sp_shore = nd.binary_dilation(lake1, structure=np.ones((3, 3)), iterations=2) & ~lake1 & ~stacks1 & ~protect
    En = np.where(sp_shore & (d_spill > 3.8) & ~corr_9106, np.maximum(En, SP_WL + 18.0), En)
    En = np.where(sp_shore & corr_9106, np.clip(En, SP_WL + 1.5, SP_WL + 8.0), En)

    # Carve the clean 7-px (14 km) wide SW bedrock spillway notch along spill_pts -> (1246, 232) -> (1231.5, 232.0)
    # Thalweg falls monotonically from 1458.0 m at the SW lake lip through 1358.0 m at (1246, 232) to 1268.0 m at (1231.5, 232.0)
    thalweg_spill = 1458.0 - (1458.0 - 1268.0) * s_spill
    notch_profile = thalweg_spill + 16.0 * (d_spill / 3.5) ** 2 + 65.0 * sstep(2.2, 4.5, d_spill)
    in_notch = (d_spill <= 4.5) & ~lake1 & ~protect
    w_notch = 1.0 - sstep(2.6, 4.5, d_spill)
    En = np.where(in_notch, En * (1.0 - w_notch) + notch_profile * w_notch, En)

    # Re-anchor River 9102 (Ham-Tsek) out the SW spillway through (1246, 232) into vertex 26 (1229.0, 234.9)
    r9102 = rivers_by_id['9102']
    old_9102_len = len(r9102['px'])
    new_9102_head = [
        [1269.0, 219.0], [1266.0, 221.0], [1262.0, 223.5], [1258.0, 226.0],
        [1254.0, 228.2], [1250.0, 230.2], [1246.0, 232.0], [1242.0, 232.2],
        [1238.0, 232.2], [1234.5, 232.1], [1231.5, 232.0],
    ]
    tail_9102_px = r9102['px'][26:]
    tail_9102_bed = r9102['bed_m'][26:]
    head_9102_bed = [round(1458.0 - (1458.0 - 1268.0) * k / (len(new_9102_head) - 1), 1) for k in range(len(new_9102_head))]
    comb_px = new_9102_head + tail_9102_px
    comb_bed = head_9102_bed + list(tail_9102_bed)
    # Enforce strict monotonic descent (dh <= -0.5 m per vertex step) along 9102
    for k in range(1, len(comb_bed)):
        if comb_bed[k] > comb_bed[k - 1] - 0.5:
            comb_bed[k] = round(comb_bed[k - 1] - 0.5, 1)
    # Ensure 9102 mouth stays above Ria junction bed
    r9102['px'] = comb_px
    r9102['bed_m'] = comb_bed
    r9102['q_m3s'] = resample_list(r9102.get('q_m3s', []), len(comb_px))
    r9102['source_m'] = comb_bed[0]
    r9102['mouth_m'] = comb_bed[-1]
    seg_9102 = sum(math.hypot(a[0] - b[0], a[1] - b[1]) * 2.0 for a, b in zip(comb_px, comb_px[1:]))
    r9102['length_km'] = round(seg_9102, 1)
    if 'len_km' in r9102:
        r9102['len_km'] = round(seg_9102, 1)

    # Re-anchor River 9109 (Ching-Ma) NW/west of the rampart at vertex 8 (1208.8, 174.6)
    r9109['px'] = r9109['px'][8:]
    r9109['bed_m'] = r9109['bed_m'][8:]
    for k in range(1, len(r9109['bed_m'])):
        if r9109['bed_m'][k] > r9109['bed_m'][k - 1] - 0.5:
            r9109['bed_m'][k] = round(r9109['bed_m'][k - 1] - 0.5, 1)
    r9109['q_m3s'] = resample_list(r9109.get('q_m3s', []), len(r9109['px']))
    r9109['source_m'] = r9109['bed_m'][0]
    r9109['mouth_m'] = r9109['bed_m'][-1]
    seg_9109 = sum(math.hypot(a[0] - b[0], a[1] - b[1]) * 2.0 for a, b in zip(r9109['px'], r9109['px'][1:]))
    r9109['length_km'] = round(seg_9109, 1)
    if 'len_km' in r9109:
        r9109['len_km'] = round(seg_9109, 1)

    # Strictly monotonic seaward/lakeward bed_m grade (dh <= -0.5 m per vertex step down to sea/lake level) on Ria & Spider rivers
    for rid_mono, floor_lim in [('9101', 0.0), ('9107', 0.0), ('9108', 200.0), ('9106', 1460.0)]:
        rm = rivers_by_id[rid_mono]
        bm = list(rm['bed_m'])
        if rid_mono == '9106':
            # Hau-Gel enters Spider Lake at 1,460.0 m; keep upstream descending monotonically by >= 0.5 m/step to 1,460.0 m
            n_m = len(bm)
            bm[-1] = SP_WL
            for k in range(n_m - 2, -1, -1):
                if bm[k] < bm[k + 1] + 0.5:
                    bm[k] = round(bm[k + 1] + 0.5, 1)
            for k in range(1, n_m):
                if bm[k] > bm[k - 1] - 0.5:
                    bm[k] = max(SP_WL, round(bm[k - 1] - 0.5, 1))
        else:
            for k in range(1, len(bm)):
                if bm[k - 1] <= floor_lim + 1e-6:
                    bm[k] = floor_lim
                else:
                    bm[k] = max(floor_lim, round(min(bm[k], bm[k - 1] - 0.5), 1))
        rm['bed_m'] = bm
        rm['source_m'] = bm[0]
        rm['mouth_m'] = bm[-1]

    # Carve monotonic DEM channel floor along 9101, 9102, 9106, 9107, 9109 so ground never climbs along their courses
    for rid_c in ('9101', '9102', '9106', '9107', '9109'):
        rc = rivers_by_id[rid_c]
        run_min = 1e9
        for (px_r, py_r), b_r in zip(rc['px'], rc['bed_m']):
            ix, iy = int(round(px_r)), int(round(py_r))
            if whas2[iy, ix]:
                run_min = min(run_min, float(wlev2[iy, ix]))
                continue
            target_e = min(float(En[iy, ix]), b_r, run_min)
            En[iy, ix] = target_e
            run_min = min(run_min, target_e)

    # Register Spider Lake in basins, outlets, and landforms
    if not any(abs(b['at_px'][0] - 1292.0) < 25 and abs(b['at_px'][1] - 213.5) < 20 for b in D['basins']):
        D['basins'].append({
            'at_px': [1292.0, 213.5],
            'level_m': int(SP_WL),
            'km2': int(lake1.sum()) * 4,
            'depth_m': round(float(SP_WL - En[lake1].min())),
            'spill_m': 1458,
            'kind': 'through lake',
            'climate': 'Cfb',
            'name': 'Spider Lake',
        })
    D['outlets'].append({
        'name': 'Spider Lake SW spillway',
        'from': 'Spider Lake',
        'to': 'Hām-Tsēk (Web-Cleaver River)',
        'px': [[round(x, 1), round(y, 1)] for x, y in spill_pts],
        'bed_m': [round(1458.0 - (1458.0 - 1268.0) * k / (len(spill_pts) - 1)) for k in range(len(spill_pts))],
        'lake_level_m': int(SP_WL),
    })
    landforms.append({
        'id': MARKER_ID,
        'kind': 'secondary_crater',
        'name': 'Spider Lake Secondary Ejecta Crater',
        'px': [cx1, cy1],
        'rx_px': rx1,
        'ry_px': ry1,
        'angle_deg': -20.0,
        'floor_m': round(float(En[lake1].min())),
        'lake_m': SP_WL,
        'spillway_px': [1246.0, 232.0],
    })
    rep['pass1_spider_lake'] = {
        'lake_cells': int(lake1.sum()),
        'lake_km2': int(lake1.sum()) * 4,
        'lake_wl_m': SP_WL,
        'floor_min_m': round(float(En[lake1].min()), 1),
        'nw_rampart_min_m': round(float(En[(d_ramp <= 1.5) & ramp_safe].min()), 1),
        'nw_saddle_1252_175_m': round(float(En[175, 1252]), 1),
        'sw_spillway_1246_232_m': round(float(En[232, 1246]), 1),
        'r9102_vertices_was_now': [old_9102_len, len(r9102['px'])],
        'r9109_start_px': r9109['px'][0],
    }

    # =========================================================================
    # PASS 2: SE Outer Wall / Tharn 108 km Secondary Ejecta Crater (1375, 1525)
    # =========================================================================
    cx2, cy2 = 1375.0, 1525.0
    R2 = 27.0  # r = 27 px -> D = 108 km at 2 km/px
    TARN2_R = 6.0  # r = 6 px -> D = 24 km
    TARN2_WL = 6910.0
    FLOOR2_M = 6880.0
    d2 = np.hypot(xx - cx2, yy - cy2)
    th2 = np.arctan2(yy - cy2, xx - cx2)
    n2_fine = nd.gaussian_filter(rng.standard_normal(sh), 1.7)
    n2_fine /= float(n2_fine.std()) or 1.0
    rays2 = np.cos(16.0 * th2 + 0.4 * nd.gaussian_filter(rng.standard_normal(sh), 3.5))

    tarn2 = (d2 <= TARN2_R) & ~protect
    whas2[tarn2] = True
    wlev2[tarn2] = TARN2_WL

    # Crater profile inside r <= 27 px, raised rim peaking at r = 26..29 px, radial hummocky blanket to r = 40 px
    # Preserve Stalker Peak (1397, 1505) at d = 29.7 px via `protect` and `maximum` on the high NE massif
    in_c2 = (d2 <= 41.0) & ~protect
    tarn_bed2 = FLOOR2_M - 24.0 * (1.0 - (d2 / max(TARN2_R, 1e-6)) ** 2) + 3.5 * n2_fine
    # Dry glaciated/sinter floor bench from r=6..15.5 px (6,918 -> 7,060 m, keeping tarn 100% closed >= 6,918 m)
    floor_bench2 = (TARN2_WL + 8.0) + 145.0 * sstep(TARN2_R, 15.5, d2) + 12.0 * n2_fine
    # Stepped listric slump inner wall from r=15.5..26.5 px up to rim
    slump_t = sstep(15.5, 26.5, d2)
    slump_terrace = 95.0 * np.sin(slump_t * math.pi * 3.0) * (slump_t > 0.08) * (slump_t < 0.92)
    # Rim height: 7,950-8,250 m minimum on lower SW sector, or ambient Tharn massif + asymmetric rim collar (380-680 m)
    se_asym = 0.5 + 0.5 * np.cos(th2 - math.radians(135.0))
    rim_collar2 = np.maximum(7920.0 + 280.0 * se_asym, Eo + 420.0 + 260.0 * se_asym) + 55.0 * n2_fine
    wall_prof2 = 7065.0 + (rim_collar2 - 7065.0) * slump_t + slump_terrace
    # Outer ejecta blanket (r = 26.5..41.0 px)
    blanket2_w = (1.0 - sstep(26.5, 41.0, d2)) ** 1.5
    outer_prof2 = Eo + blanket2_w * (420.0 + 240.0 * se_asym + 65.0 * rays2 + 40.0 * n2_fine)

    En = np.where(tarn2, np.clip(tarn_bed2, 6852.0, 6886.0), En)
    En = np.where(in_c2 & (d2 > TARN2_R) & (d2 <= 15.5), np.maximum(TARN2_WL + 8.0, floor_bench2), En)
    En = np.where(in_c2 & (d2 > 15.5) & (d2 <= 26.5), wall_prof2, En)
    En = np.where(in_c2 & (d2 > 26.5), outer_prof2, En)

    D['vents'].append({
        'px': [cx2, cy2],
        'floor': FLOOR2_M,
        'scale': 0.22,
        'radius': TARN2_R,
        'kind': 'fumarole',
        'T': 78,
        'reach_m': 1200,
        'name': 'Tharn Cryo-Fumarole Cauldron',
        'region': 'seouterwall',
    })
    D['basins'].append({
        'at_px': [cx2, cy2],
        'level_m': int(TARN2_WL),
        'km2': int(tarn2.sum()) * 4,
        'depth_m': round(float(TARN2_WL - En[tarn2].min())),
        'spill_m': round(float(En[(d2 > TARN2_R) & (d2 <= TARN2_R + 2.0)].min())),
        'kind': 'crater tarn',
        'climate': 'EF',
        'name': 'Tharn Cryo-Fumarole Tarn',
    })
    landforms.append({
        'id': 'lf_se_tharn_crater',
        'kind': 'secondary_crater',
        'name': 'SE Tharn Secondary Ejecta Crater',
        'px': [cx2, cy2],
        'radius_px': R2,
        'diameter_km': 108,
        'floor_m': FLOOR2_M,
        'tarn_wl_m': TARN2_WL,
        'tarn_radius_px': TARN2_R,
    })
    rep['pass2_se_tharn_crater'] = {
        'center_px': [cx2, cy2],
        'radius_px': R2,
        'tarn_cells': int(tarn2.sum()),
        'tarn_km2': int(tarn2.sum()) * 4,
        'tarn_wl_m': TARN2_WL,
        'tarn_bed_min_m': round(float(En[tarn2].min()), 1),
        'floor_bench_med_m': round(float(np.median(En[(d2 > TARN2_R) & (d2 <= 14.0)])), 1),
        'rim_p25_p75_m': [round(float(v), 1) for v in np.percentile(En[(d2 >= 25.5) & (d2 <= 28.5)], [25, 75])],
        'stalker_peak_1397_1505_m': round(float(En[1505, 1397]), 1),
    }

    # =========================================================================
    # PASS 3: The Arch Onshore Basalt Horsts, Twin Ejecta Bays & Copper Tarn
    # =========================================================================
    n3 = nd.gaussian_filter(rng.standard_normal(sh), 2.0)
    n3 /= float(n3.std()) or 1.0

    # 3a. Twin circular secondary-ejecta bays indenting Crookshore coast (21-24 km diameter -> r = 5.4 and 5.8 px)
    bays3 = [
        ('lf_crookshore_north_bay', 'Crookshore North Ejecta Bay', 115.5, 616.0, 5.4, 0.0),     # indents E headland into Arch sea
        ('lf_crookshore_south_bay', 'Crookshore South Ejecta Bay', 176.0, 643.0, 5.8, -68.0),   # indents S shore into Arch sea
    ]
    bay_water_added = 0
    bay_collar_mask = np.zeros(sh, bool)
    for bid, bname, bx, by, br, open_deg in bays3:
        db = np.hypot(xx - bx, yy - by)
        ang_b = np.degrees(np.arctan2(yy - by, xx - bx))
        d_open = np.abs((ang_b - open_deg + 180.0) % 360.0 - 180.0)
        # Circular bay interior breached to sea on the open sector
        in_bay = (db <= br) & ~protect & ~riv_corr_all & ((Eo < 650.0) | (db <= br * 0.85))
        bay_bed = -38.0 + 22.0 * (db / br) ** 2 + 3.0 * n3
        # Subtle submerged kelp-reef sill (-16 m) across the seaward mouth
        mouth_sill = (db >= br * 0.78) & (db <= br * 1.12) & (d_open <= 48.0) & whas0
        whas2[in_bay] = True
        wlev2[in_bay] = 0.0
        En = np.where(in_bay, np.minimum(En, bay_bed), En)
        En = np.where(mouth_sill, np.clip(En, -24.0, -14.0), En)
        bay_water_added += int((in_bay & ~whas0).sum())

        # Landward 250-degree boulder-megabreccia rim collar (180-320 m lift)
        landward_w = sstep(48.0, 82.0, d_open)
        collar_ring = np.exp(-0.5 * ((db - (br + 2.4)) / 2.1) ** 2) * landward_w
        m_col = (collar_ring > 0.04) & ~whas2 & ~protect & ~riv_corr_all
        En = np.where(m_col, En + collar_ring * (255.0 + 32.0 * n3), En)
        bay_collar_mask |= m_col & (collar_ring > 0.2)
        landforms.append({
            'id': bid,
            'kind': 'secondary_crater_bay',
            'name': bname,
            'px': [bx, by],
            'radius_px': br,
            'diameter_km': round(br * 4.0, 1),
        })

    # 3b. Onshore dark flood-basalt horst headlands on SW Crookshore & NE Double Delta / N Ria
    # Curvi-parallel horst harmonic aligned with The Arch's NE-SW spreading axis (center of curvature ~ [420, 560])
    r_arch = np.hypot((xx - 430.0) * 0.92, (yy - 575.0) * 1.08)
    horst_wave = np.tanh(2.6 * np.sin(2.0 * math.pi * r_arch / 17.0 + 0.35 * n3))  # crisp flat-topped stepcut blocks
    horst_step = np.maximum(0.0, horst_wave)  # 0 in graben corridors, +1 on flat-topped horst blocks

    # SW Crookshore onshore horst zone (covering coastal headlands 75..185 x 545..725 and upland rift shoulder 160..305 x 680..825)
    crook_zone = (
        (((xx >= 72) & (xx <= 188) & (yy >= 546) & (yy <= 725))
         | ((xx >= 158) & (xx <= 308) & (yy >= 678) & (yy <= 828)))
        & ~whas2 & ~protect & ~riv_corr_all & (Eo > 12.0) & (Eo < 3800.0)
    )
    # Smooth taper at zone edges
    crook_dist_in = nd.distance_transform_edt(crook_zone)
    crook_w = sstep(0.0, 4.5, crook_dist_in)
    crook_lift = crook_w * horst_step * (210.0 + 165.0 * sstep(40.0, 900.0, Eo) + 22.0 * n3)
    En = np.where(crook_zone, En + crook_lift, En)

    # NE Double Delta & N Ria onshore flood-basalt horsts (coastal horst-gates 505..645 x 102..206 + shoulder 645..828 x 185..288)
    dd_zone = (
        (((xx >= 505) & (xx <= 648) & (yy >= 102) & (yy <= 208) & (Eo > 6.0) & (Eo < 1400.0))
         | ((xx >= 645) & (xx <= 828) & (yy >= 185) & (yy <= 288) & (Eo > 120.0) & (Eo < 3800.0)))
        & ~whas2 & ~protect & ~riv_corr_all
    )
    dd_wave = np.maximum(0.0, np.tanh(2.6 * np.sin(2.0 * math.pi * ((xx - 480.0) * 0.58 + (yy - 140.0) * 0.81) / 16.0 + 0.3 * n3)))
    dd_w = sstep(0.0, 4.0, nd.distance_transform_edt(dd_zone))
    dd_lift = dd_w * dd_wave * (195.0 + 175.0 * sstep(30.0, 800.0, Eo) + 20.0 * n3)
    En = np.where(dd_zone, En + dd_lift, En)
    arch_horst_mask = ((crook_zone & (crook_lift > 70.0)) | (dd_zone & (dd_lift > 70.0)))

    # 3c. Copper Tarn circular secondary-crater collar (actual lake @ 147, 1148, wl = 2,380.1 m; breached NNW by 9105 @ 142, 1136)
    ct_lbl = lab0[1148, 148]
    ct_lake = lab0 == ct_lbl
    ct_wl = float(np.nanmedian(wlev0[ct_lake]))
    r9105 = rivers_by_id['9105']
    corr_9105 = build_river_corridor([r9105], sh, radius_px=3)
    d_ct_shore = nd.distance_transform_edt(~ct_lake)
    # Circular secondary-crater collar peaking 2.5-5.5 px outside Copper Tarn shore (16-24 km collar width), notched at 9105
    ct_gate = sstep(1.5, 4.5, nd.distance_transform_edt(~corr_9105))
    ct_collar_w = np.exp(-0.5 * ((d_ct_shore - 3.6) / 2.2) ** 2) * (1.0 - sstep(7.0, 11.0, d_ct_shore)) * ct_gate
    ct_collar_mask = (ct_collar_w > 0.03) & ~ct_lake & ~whas2 & ~protect
    ct_lift = ct_collar_w * (340.0 + 35.0 * n3)
    En = np.where(ct_collar_mask, np.maximum(En + ct_lift, ct_wl + 260.0 * ct_collar_w), En)
    # Re-verify 9105 exits monotonically without climbing
    run_9105 = 1e9
    for (px_r, py_r), b_r in zip(r9105['px'], r9105['bed_m']):
        ix, iy = int(round(px_r)), int(round(py_r))
        if whas2[iy, ix]:
            run_9105 = min(run_9105, float(wlev2[iy, ix]))
            continue
        En[iy, ix] = min(float(En[iy, ix]), run_9105)
        run_9105 = min(run_9105, float(En[iy, ix]))

    landforms.append({
        'id': 'lf_copper_tarn_collar',
        'kind': 'secondary_crater',
        'name': 'Copper Tarn Secondary-Crater Collar',
        'px': [147.0, 1148.0],
        'radius_px': 12.0,
        'lake_m': round(ct_wl, 1),
    })
    rep['pass3_arch_horsts_and_copper_tarn'] = {
        'crookshore_horst_cells': int((crook_zone & (crook_lift > 25.0)).sum()),
        'crookshore_max_lift_m': round(float(crook_lift.max()), 1),
        'double_delta_horst_cells': int((dd_zone & (dd_lift > 25.0)).sum()),
        'double_delta_max_lift_m': round(float(dd_lift.max()), 1),
        'twin_bays_new_wet_cells': bay_water_added,
        'copper_tarn_collar_cells': int((ct_collar_mask & (ct_lift > 25.0)).sum()),
        'copper_tarn_collar_max_lift_m': round(float(ct_lift.max()), 1),
    }

    # =========================================================================
    # PASS 4: n semiarid Closed Dam-Relic Salt Lakes 360° Evaporite Strandlines
    # =========================================================================
    # Lake 53 (west dam relic @ 716, 420, wl = -80.6 m) & Lake 54 (east dam 2 relic @ 872, 442, wl = -59.8 m)
    lk_west = lab0 == lab0[420, 716]
    lk_east = lab0 == lab0[442, 872]
    wl_west = float(np.nanmedian(wlev0[lk_west]))
    wl_east = float(np.nanmedian(wlev0[lk_east]))
    # Level water surface cleanly on each closed salt lake
    wlev2[lk_west] = wl_west
    wlev2[lk_east] = wl_east

    evap_ring_w = np.zeros(sh, float)
    bench_cells_total = 0
    for lk_m, lk_wl, lk_nm, max_x in [
        (lk_west, wl_west, 'West Dam Relic Salt Lake', 775),
        (lk_east, wl_east, 'East Dam Relic Salt Lake', 956),
    ]:
        d_lk = nd.distance_transform_edt(~lk_m)
        # Keep away from rivers, other lakes, and eastern abyssal drop-off (x > 956)
        other_wet = whas2 & ~lk_m
        d_other_wet = nd.distance_transform_edt(~other_wet)
        shore_zone = (
            (d_lk >= 1.0) & (d_lk <= 15.0) & (d_other_wet >= 4.0) & (xx <= max_x)
            & ~whas2 & ~protect & ~riv_corr_all & (En > lk_wl + 2.0) & (En < lk_wl + 310.0)
        )
        rel_h = En - lk_wl
        # Monotonic 3-bench wave-cut terrace curve centered at +60 m, +140 m, +230 m above lake wl
        # Using sum of negative Gaussian derivatives with amplitude < 0.72 * sigma guarantees f'(h) > 0 everywhere!
        dh_bench = (
            -13.5 * ((rel_h - 60.0) / 21.0) * np.exp(-0.5 * ((rel_h - 60.0) / 21.0) ** 2)
            - 15.5 * ((rel_h - 140.0) / 24.0) * np.exp(-0.5 * ((rel_h - 140.0) / 24.0) ** 2)
            - 16.5 * ((rel_h - 230.0) / 26.0) * np.exp(-0.5 * ((rel_h - 230.0) / 26.0) ** 2)
        )
        w_zone = (1.0 - sstep(10.5, 15.0, d_lk)) * sstep(2.0, 14.0, rel_h) * (1.0 - sstep(275.0, 310.0, rel_h))
        En = np.where(shore_zone, np.maximum(lk_wl + 3.0, En + dh_bench * w_zone), En)
        bench_cells_total += int((shore_zone & (np.abs(dh_bench * w_zone) > 1.5)).sum())

        # Ensure immediate 1-px dry shoreline around closed salt lake stands cleanly above lk_wl (no shore below lake!)
        imm_shore = (d_lk <= 1.5) & ~lk_m & ~whas2 & ~protect & ~riv_corr_all & (En < lk_wl + 2.0) & (xx <= max_x)
        En = np.where(imm_shore, lk_wl + 3.0, En)

        # Crisp 360-degree concentric evaporite/carbonate bathtub strandline rings hugging the shore (d_lk = 1..8 px)
        rel_now = En - lk_wl
        shore_pan = 0.72 * (1.0 - sstep(1.2, 2.9, d_lk))
        ring_mid = 0.48 * np.exp(-0.5 * ((d_lk - 4.3 + 0.35 * n3) / 0.82) ** 2)
        ring_out = 0.34 * np.exp(-0.5 * ((d_lk - 6.4 + 0.45 * n3) / 0.92) ** 2)
        rings_comb = np.maximum(shore_pan, np.maximum(ring_mid, ring_out)) * (1.0 - sstep(240.0, 300.0, np.maximum(0.0, rel_now)))
        ring_mask = (~whas2) & (d_lk <= 8.2) & (d_other_wet >= 2.5) & (xx <= max_x) & (rel_now >= -2.0)
        evap_ring_w = np.where(ring_mask, np.maximum(evap_ring_w, rings_comb), evap_ring_w)

        ys_l, xs_l = np.nonzero(lk_m)
        cx_l, cy_l = round(float(xs_l.mean()), 1), round(float(ys_l.mean()), 1)
        if not any(abs(b['at_px'][0] - cx_l) < 20 and abs(b['at_px'][1] - cy_l) < 20 for b in D['basins']):
            D['basins'].append({
                'at_px': [cx_l, cy_l],
                'level_m': round(lk_wl),
                'km2': int(lk_m.sum()) * 4,
                'depth_m': round(float(lk_wl - En[lk_m].min())),
                'kind': 'salt lake',
                'climate': 'BWk',
                'name': lk_nm,
            })

    rep['pass4_nsemiarid_strandlines'] = {
        'west_lake_cells': int(lk_west.sum()),
        'west_lake_wl_m': round(wl_west, 1),
        'east_lake_cells': int(lk_east.sum()),
        'east_lake_wl_m': round(wl_east, 1),
        'benched_shore_cells': bench_cells_total,
        'evaporite_painted_cells': int((evap_ring_w > 0.12).sum()),
    }

    # =========================================================================
    # PASS 5: Ring Isles Non-Tower Carbonate Benches, Shoals & Port Goto Access
    # =========================================================================
    RING_WL = float(np.nanmedian(wlev0[whas0 & (yy >= 690) & (yy <= 990) & (xx >= 700) & (xx <= 1025)]))  # ~ -1500.19 m
    ring_sea = whas2 & (np.abs(np.nan_to_num(wlev2, nan=9e9) - RING_WL) < 12.0)

    # 5a. Port Goto (920, 703) clean coastal water adjacency (<= 1 px from wl > h water, without flooding inland cells)
    # Keep (920, 703) & Port Goto pin (918, 698) dry on a limestone quay bench (-1,488 m = +12 m over Ring Sea),
    # and ensure (920, 704) & (919, 704) directly adjacent are clean 12 m-deep Ring Sea harbor water (-1,512.5 m < -1,500.2 m).
    En[703, 920] = RING_WL + 12.0
    whas2[703, 920] = False
    for hx, hy in [(920, 704), (919, 704), (921, 704)]:
        whas2[hy, hx] = True
        wlev2[hy, hx] = RING_WL
        En[hy, hx] = min(float(En[hy, hx]), RING_WL - 12.5)
    ring_sea = whas2 & (np.abs(np.nan_to_num(wlev2, nan=9e9) - RING_WL) < 12.0)

    # 5b. Strict exclusion of tower-karst & volcanic island cores!
    # Untouched: k-guilin (rmvp22q7x7bdp), NW bay (rmuqldntr5xod), Throne/Volcano (rmuqlbqhl6ozk), all vents (r <= 8 px),
    # and steep tower/volcanic island cores (Eo > RING_WL + 95 m = -1,405 m, dilated 2 px) inside East & West Ring Isles.
    tower_excl = (
        poly_mask(byid, 'rmvp22q7x7bdp', sh)
        | poly_mask(byid, 'rmuqldntr5xod', sh)
        | poly_mask(byid, 'rmuqlbqhl6ozk', sh)
    )
    eri_m = poly_mask(byid, 'rmucdgrd83tcl', sh)
    wri_m = poly_mask(byid, 'rmuqj8lpci56i', sh)
    steep_island_cores = nd.binary_dilation((eri_m | wri_m) & ~whas2 & (Eo > RING_WL + 85.0), iterations=2)
    tower_excl |= steep_island_cores
    for v in D['vents']:
        tower_excl |= np.hypot(xx - v['px'][0], yy - v['px'][1]) <= 8.0

    # Target non-tower carbonate shelf zones:
    # - Shell / Port Goto-Crescent N shelf (880..1012 x 682..740)
    # - Kautoa & Talon E low carbonate shelves/islets (905..1058 x 697..985 outside steep cores)
    # - Western Spice Isles / Pontus SW Bay low outer islets & shelves (635..785 x 825..1035 & low Ring Sea outer islets)
    carb_domain = (
        ((xx >= 880) & (xx <= 1012) & (yy >= 682) & (yy <= 740))
        | ((xx >= 905) & (xx <= 1058) & (yy >= 697) & (yy <= 985))
        | ((xx >= 635) & (xx <= 915) & (yy >= 820) & (yy <= 1035))
    ) & ~tower_excl & ~protect & ~riv_corr_all

    # Onshore low-relief wave-cut limestone terraces (+8 to +35 m above RING_WL, i.e., -1,492 to -1,465 m)
    d_from_sea = nd.distance_transform_edt(~ring_sea)
    rel_ring = En - RING_WL
    onshore_carb = carb_domain & ~whas2 & (d_from_sea <= 5.0) & (rel_ring >= 3.0) & (rel_ring <= 58.0)
    # Quantize gently toward two crisp marine carbonate benches (+12 m reef flat and +28 m coquina terrace)
    dh_carb = (
        -4.2 * ((rel_ring - 12.0) / 6.5) * np.exp(-0.5 * ((rel_ring - 12.0) / 6.5) ** 2)
        - 5.5 * ((rel_ring - 28.0) / 8.0) * np.exp(-0.5 * ((rel_ring - 28.0) / 8.0) ** 2)
    )
    w_carb_land = (1.0 - sstep(3.5, 5.5, d_from_sea)) * sstep(3.0, 7.0, rel_ring) * (1.0 - sstep(42.0, 58.0, rel_ring))
    En = np.where(onshore_carb, np.maximum(RING_WL + 4.0, En + dh_carb * w_carb_land), En)

    # Submerged shallow turquoise carbonate barrier shoals (-2 to -18 m below RING_WL, i.e., -1,502 to -1,518 m)
    dry_carb_land = (~whas2) & carb_domain
    d_from_carb_land = nd.distance_transform_edt(~dry_carb_land)
    shoal_zone = ring_sea & carb_domain & (d_from_carb_land >= 1.0) & (d_from_carb_land <= 3.6) & (En > RING_WL - 115.0)
    shoal_target = RING_WL - (3.5 + 11.5 * sstep(1.0, 3.6, d_from_carb_land)) + 1.2 * n3
    shoal_w = (1.0 - sstep(2.4, 3.8, d_from_carb_land)) * (1.0 - sstep(55.0, 115.0, RING_WL - En))
    En = np.where(shoal_zone, En * (1.0 - shoal_w) + np.maximum(En, shoal_target) * shoal_w, En)
    shoal_paint_w = np.where(
        ring_sea & carb_domain & (d_from_carb_land <= 4.2) & ((RING_WL - En) <= 24.0),
        (1.0 - sstep(2.6, 4.2, d_from_carb_land)) * (1.0 - sstep(14.0, 24.0, np.maximum(0.0, RING_WL - En))),
        0.0,
    )
    # Re-pin Port Goto quay (920, 703) at +12 m dry and adjacent harbor cells (919..921, 704) at 10.5 m clean harbor depth
    En[703, 920] = RING_WL + 12.0
    whas2[703, 920] = False
    for hx, hy in [(920, 704), (919, 704), (921, 704)]:
        whas2[hy, hx] = True
        wlev2[hy, hx] = RING_WL
        En[hy, hx] = min(float(En[hy, hx]), RING_WL - 10.5)

    pg_adj_wet = bool(whas2[702:705, 919:922].any() and not whas2[703, 920])
    rep['pass5_ringisles_and_port_goto'] = {
        'ring_sea_wl_m': round(RING_WL, 2),
        'onshore_terrace_cells': int((onshore_carb & (np.abs(dh_carb * w_carb_land) > 0.5)).sum()),
        'shoal_bathy_cells': int((shoal_zone & (shoal_w > 0.1)).sum()),
        'shoal_turquoise_cells': int((shoal_paint_w > 0.1).sum()),
        'port_goto_920_703_dry_m': round(float(En[703, 920]), 1),
        'port_goto_920_704_wet_depth_m': round(float(wlev2[704, 920] - En[704, 920]), 1),
        'port_goto_1px_water_adjacent': pg_adj_wet,
    }

    # =========================================================================
    # PASS 6: Firebliss Obsidian Pancake Domes & Rift Rim Planar Fault Facets
    # =========================================================================
    # 6a. Three flat-topped circular 18-22 km (R = 4.5..5.5 px, H = 380..490 m) silicic/obsidian pancake domes
    # Placed strictly on untouched plain/bench cells inside Firebliss Range (rmw8hj62nmugn), >= 20 px from all
    # edit_513 lakes, rivers, and volcano vents, and outside Copper Glacier (rmvcopperglacier).
    mfb = poly_mask(byid, 'rmw8hj62nmugn', sh)
    mcg = poly_mask(byid, 'rmvcopperglacier', sh)
    domes6 = [
        ('lf_fb_dome_west', 'West Vale Obsidian Pancake Dome', 157.0, 1324.0, 5.0, 420.0),
        ('lf_fb_dome_great', 'Great Vale Obsidian Pancake Dome', 175.0, 1335.0, 5.5, 490.0),
        ('lf_fb_dome_east', 'East Bench Obsidian Pancake Dome', 268.0, 1338.0, 4.5, 380.0),
    ]
    dome_paint_w = np.zeros(sh, float)
    dome_cells_total = 0
    for did, dname, dx_d, dy_d, dr_d, dh_d in domes6:
        rd = np.hypot(xx - dx_d, yy - dy_d)
        # Steep-sided flat-topped Venusian/Capsican viscous dome profile: H * (1 - (r/R)^6)^(1/3) + concentric ogive ripples
        u_d = np.clip(rd / dr_d, 0.0, 1.5)
        carapace = np.where(u_d < 1.0, (np.maximum(0.0, 1.0 - u_d ** 6)) ** (1.0 / 3.0), 0.0)
        ogives = 11.0 * np.cos(2.0 * math.pi * rd / 1.8) * (u_d < 0.86) * carapace
        dome_add = dh_d * carapace + ogives
        m_dome = (rd <= dr_d + 0.5) & mfb & ~mcg & ~whas2 & ~protect & ~riv_corr_all
        En = np.where(m_dome, En + dome_add, En)
        dome_cells_total += int((m_dome & (dome_add > 5.0)).sum())
        dome_paint_w = np.where(m_dome, np.maximum(dome_paint_w, carapace), dome_paint_w)
        landforms.append({
            'id': did,
            'kind': 'pancake_dome',
            'name': dname,
            'px': [dx_d, dy_d],
            'radius_px': dr_d,
            'diameter_km': round(dr_d * 4.0, 1),
            'relief_m': dh_d,
            'region': 'Firebliss Range',
        })

    # 6b. Planar normal-fault footwall facets along untouched riftrim scarps (1120-1320 x 1520-1640 & rift rim N/S)
    m_rrn = poly_mask(byid, 'rmvkac5iod3wh', sh)
    m_rrs = poly_mask(byid, 'rmvriftrims01', sh)
    e_smooth = nd.gaussian_filter(Eo, 3.2)
    gy_s, gx_s = np.gradient(e_smooth, 2000.0)
    slope_s = np.hypot(gx_s, gy_s)
    # Along-strike coordinate perpendicular to local gradient -> crisp triangular faceted spurs + V-shaped wineglass gullies
    strike_len = np.maximum(slope_s, 1e-6)
    along_u = (-gy_s / strike_len) * xx + (gx_s / strike_len) * yy
    tri_wave = 1.0 - 2.0 * np.abs(np.mod(along_u / 9.5, 1.0) - 0.5)  # triangular wave in [0, 1], wavelength ~19 km

    scarp_domain = (
        (((xx >= 1120) & (xx <= 1320) & (yy >= 1520) & (yy <= 1640)) | m_rrn | m_rrs)
        & ~whas2 & ~protect & ~riv_corr_all
        & (slope_s >= 0.14) & (Eo >= 1400.0) & (Eo <= 7200.0)
    )
    # Exclude 10 px around Xanadu horst/lakes/Oidong cataract box (785..1015 x 1485..1640) and Opal Valley (965..1135 x 1628..1685)
    scarp_domain &= ~((xx >= 785) & (xx <= 1015) & (yy >= 1485) & (yy <= 1640))
    scarp_domain &= ~((xx >= 965) & (xx <= 1135) & (yy >= 1628) & (yy <= 1688))
    w_scarp = sstep(0.0, 3.0, nd.distance_transform_edt(scarp_domain)) * sstep(0.14, 0.28, slope_s)
    # Planarize local rough bumps toward planar slope `e_smooth` + sharp triangular spur/wineglass-gully facets
    planar_target = e_smooth + (tri_wave - 0.45) * 95.0
    En = np.where(scarp_domain, En * (1.0 - 0.65 * w_scarp) + planar_target * (0.65 * w_scarp), En)

    # 6c. Owed 2-cell neouterwall cauldron sinter-apron shore bench alignment (f124d9ff5; biomes/neouterwall/PLAN.md §6):
    # Garnet-Mirror Tarn (2,810.1 m) shore pin at (1185, 346) and Vitreous Hollow Tarn (2,950.1 m) shore pin at (1261, 328)
    En[346, 1185] = 2825.0
    En[328, 1261] = 2965.0
    En[328, 1260] = min(float(En[328, 1260]), 3180.0)

    rep['pass6_firebliss_and_riftrim'] = {
        'firebliss_pancake_domes': len(domes6),
        'firebliss_dome_cells': dome_cells_total,
        'riftrim_faceted_cells': int((scarp_domain & (w_scarp > 0.15)).sum()),
        'neouterwall_shore_aprons_m': {
            'garnet_1185_346': round(float(En[346, 1185]), 1),
            'vitreous_1261_328': round(float(En[328, 1261]), 1),
        },
    }

    LFDOC['landforms'] = landforms
    D['landforms'] = LFDOC

    # =========================================================================
    # DERIVED MODES: Temperatures, Climate, Rain, Relight, Retint & Albedo
    # =========================================================================
    moved_h = np.abs(En - Eo) > 0.5
    wet_changed = whas2 != whas0
    water2 = np.where(wet_changed, whas2, water0)

    # 1. Lapse temperatures (-6.5 C/km), keeping >17 km airless unchanged and synthesizing valid temps on Pass 2's
    #    newly excavated 6,880 m SE Tharn crater floor (formerly class O byte 0 = -90 C)
    lap = C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2)
    for k_, v in lap.items():
        D[k_] = v

    codes = [c['code'] for c in D['climate']['classes']]
    o_idx = codes.index('O')
    wh_idx = codes.index('WH')
    ef_idx = codes.index('EF')

    t_arrays = {k_: P.raster(D, k_, 'L').astype(float) - 90.0 for k_ in C.TEMPS}
    # Inside Pass 2 crater bowl where ground dropped below 7,850 m (into breathable hypobaric EF/WH envelope):
    c2_breath = (d2 <= 23.0) & (En < 7850.0)
    geo_halo = 6.0 * np.exp(-0.5 * (d2 / 8.5) ** 2)  # geothermal warmth from cryo-fumarole tarn
    tm_c2 = np.round(-11.0 - 0.0065 * (En - 6900.0) + geo_halo)
    tw_c2 = tm_c2 + 6.0
    tc_c2 = tm_c2 - 6.0
    th_c2 = tw_c2 + 7.0
    tl_c2 = np.maximum(-85.0, tc_c2 - 8.0)
    for k_, arr_c2 in (('tm', tm_c2), ('tw', tw_c2), ('tc', tc_c2), ('th', th_c2), ('tl', tl_c2)):
        t_arrays[k_] = np.where(c2_breath, arr_c2, t_arrays[k_])
        D[k_] = P.b64(Image.fromarray(np.clip(t_arrays[k_] + 90.0, 0, 255).astype(np.uint8), 'L'), optimize=True)

    # 2. Reclimate where heights moved > 40 m, protecting all tested microclimate regions
    forced_clim = (
        (gh_weight(sh, whas2) > 0.02)
        | poly_mask(byid, 'rmvkbfspgsmr3', sh)   # Godstep playa
        | poly_mask(byid, 'rmvka7icdn1dq', sh)   # The Catch
        | poly_mask(byid, 'rmw5s3ktxgv0d', sh)   # Shumar
        | poly_mask(byid, 'rmw8bqrn3dnx4', sh)   # Labyrinth
        | poly_mask(byid, 'rmvkkmitffbjk', sh)   # Xanadu
        | poly_mask(byid, 'rmw5n1w1rx0u2', sh)   # Greenstep
    )
    rain2, cls2, zon2, qmask, crep = C.reclimate(D, Eo, En, whas2, forced_clim)

    # Fix climate classes on Pass 2 newly breathable floor/tarn and on any wet<->dry transition cells
    cls2 = np.where(c2_breath & ~whas2, ef_idx, cls2)
    rain2 = np.where(c2_breath, np.maximum(rain2, 180.0 + 140.0 * np.exp(-0.5 * (d2 / 11.0) ** 2)), rain2)
    new_high_wet = whas2 & ~whas0 & (np.nan_to_num(wlev2, nan=0.0) > 100.0)
    cls2[new_high_wet] = wh_idx
    # New sea cells (Crookshore twin bays & Port Goto harbor) inherit nearest existing sea class
    new_sea_wet = whas2 & ~whas0 & (np.nan_to_num(wlev2, nan=0.0) <= 100.0)
    if new_sea_wet.any():
        sea_don = whas0 & (np.nan_to_num(wlev0, nan=9e9) <= 100.0)
        _, (iy_s, ix_s) = nd.distance_transform_edt(~sea_don, return_indices=True)
        cls2[new_sea_wet] = raw0['c'][iy_s[new_sea_wet], ix_s[new_sea_wet]]
    # New dry stacks inside Spider Lake take Spider shore's Cfb class
    new_dry_sp = (~whas2) & whas0
    if new_dry_sp.any() and 'Cfb' in codes:
        cls2[new_dry_sp] = codes.index('Cfb')

    # Enforce th >= tw, tl <= tc, and th, tl > -89 on every non-O land cell (test_smodel.py Section 16 invariant)
    land_non_o = (~whas2) & (cls2 != o_idx) & (t_arrays['tm'] > -89.0)
    t_arrays['th'] = np.where(land_non_o, np.maximum(np.maximum(t_arrays['th'], t_arrays['tw']), -88.0), t_arrays['th'])
    t_arrays['tl'] = np.where(land_non_o, np.maximum(np.minimum(t_arrays['tl'], t_arrays['tc']), -88.0), t_arrays['tl'])
    for k_ in ('th', 'tl'):
        D[k_] = P.b64(Image.fromarray(np.clip(t_arrays[k_] + 90.0, 0, 255).astype(np.uint8), 'L'), optimize=True)

    rep['reclimate'] = crep

    # Encode h, wl, p, c, z
    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)

    # 3. Repaint rt and ct, sync Spider Lake wet<->dry base colors before relighting, then relight (st, t, rt, ct)
    rain0 = raw0['p'].astype(float) / 255.0 * 4000.0
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1.0)
    col_cls = np.array([hexrgb(c['color']) for c in D['climate']['classes']], float)
    cnow = P.raster(D, 'c', 'L')
    ct_mask = cnow != raw0['c']
    D['ct'] = PA.repaint(D, 'ct', col_cls[raw0['c']], col_cls[cnow], ct_mask)

    # Sync Spider Lake wet<->dry base pixels on st & t before relight so newly wet/dry margins carry clean lake/land base tones
    sp_core_wet = sp_orig & lake1
    sp_new_wet = lake1 & ~sp_orig
    sp_new_dry = (sp_orig & ~lake1) | stacks1
    sp_land_don = (~whas0) & (~whas2) & (yy >= 165) & (yy <= 255) & (xx >= 1225) & (xx <= 1355)
    _, (iy_spd, ix_spd) = nd.distance_transform_edt(~sp_land_don, return_indices=True)
    _, (iy_spw, ix_spw) = nd.distance_transform_edt(~sp_core_wet, return_indices=True)
    for mk_ in ('st', 't'):
        base_m = P.raster(D, mk_).copy()
        base_m[sp_new_wet] = base_m[iy_spw[sp_new_wet], ix_spw[sp_new_wet]]
        base_m[sp_new_dry] = base_m[iy_spd[sp_new_dry], ix_spd[sp_new_dry]]
        D[mk_] = P.jpeg_like(D, mk_, base_m)

    relit, EoF, EnF = PA.relight(D, Eo, En)
    for k_, v in relit.items():
        D[k_] = v

    # 4. Retint st and t for large elevation shifts + apply crisp geological surface-albedo tints
    nearm = nd.binary_dilation(moved_h | wet_changed, iterations=3)
    st_arr = PA.retint(P.raster(D, 'st'), EoF, EnF, nearm & ~whas2, ~nearm & ~whas2, 150.0).astype(float)
    t_arr = PA.retint(P.raster(D, 't'), EoF, EnF, nearm & ~whas2, ~nearm & ~whas2, 150.0).astype(float)
    ct_arr = P.raster(D, 'ct').astype(float)

    # Pass 2: Frosted grey-slate anorthosite/breccia floor, pale cryo-sinter collar, & cobalt-turquoise cryo-fumarole tarn
    c2_slate_w = np.where((d2 > TARN2_R) & (d2 <= 22.0), 0.64 * (1.0 - sstep(14.5, 22.0, d2)), 0.0)
    st_arr = tint_with_detail(st_arr, (118, 112, 110), c2_slate_w)
    c2_sinter_w = np.where((d2 > TARN2_R) & (d2 <= 9.2), 0.46 * (1.0 - sstep(6.2, 9.2, d2)), 0.0)
    st_arr = tint_with_detail(st_arr, (176, 182, 188), c2_sinter_w)
    tarn2_w = np.where(tarn2, 0.88, 0.0)
    st_arr = tint_with_detail(st_arr, (36, 106, 130), tarn2_w, blur_sig=3.0)
    t_arr = tint_with_detail(t_arr, (46, 118, 142), tarn2_w * 0.82, blur_sig=3.0)

    # Pass 3: Smooth dark flood-basalt horsts, twin ejecta bay water, & Copper Tarn turquoise/verdigris outwash
    horst_smooth_w = np.maximum(
        np.where(crook_zone, 0.28 * sstep(35.0, 210.0, crook_lift), 0.0),
        np.where(dd_zone, 0.28 * sstep(35.0, 210.0, dd_lift), 0.0),
    )
    st_arr = tint_with_detail(st_arr, (62, 68, 60), horst_smooth_w)
    new_bay_w = np.where(whas2 & ~whas0 & (xx < 230), 0.88, 0.0)
    st_arr = tint_with_detail(st_arr, (32, 74, 98), new_bay_w, blur_sig=3.0)
    t_arr = tint_with_detail(t_arr, (42, 90, 118), new_bay_w * 0.88, blur_sig=3.0)
    # Copper Tarn subtle malachite/verdigris glacial outwash apron & turquoise tarn tint
    verdigris_shore = (~ct_lake) & ~whas2 & ((d_ct_shore <= 3.2) | (corr_9105 & (yy >= 1110) & (yy <= 1142)))
    verd_w = np.where(verdigris_shore, 0.36 * (1.0 - sstep(1.5, 3.8, d_ct_shore)), 0.0)
    verd_w = np.where(corr_9105 & (yy >= 1114) & (yy <= 1140) & ~whas2, np.maximum(verd_w, 0.32), verd_w)
    st_arr = tint_with_detail(st_arr, (88, 148, 136), verd_w)
    st_arr = tint_with_detail(st_arr, (44, 128, 136), np.where(ct_lake, 0.35, 0.0), blur_sig=3.0)

    # Pass 4: Crisp high-albedo evaporite/carbonate salt-flat strandline rings RGB ~(226, 222, 210) in st.jpg / ct.jpg / t.jpg
    st_arr = tint_with_detail(st_arr, (226, 222, 210), np.clip(evap_ring_w * 0.78, 0.0, 0.78))
    t_arr = tint_with_detail(t_arr, (224, 220, 208), np.clip(evap_ring_w * 0.38, 0.0, 0.38))
    ct_arr = tint_with_detail(ct_arr, (226, 222, 210), np.clip(evap_ring_w * 0.28, 0.0, 0.28))

    # Pass 5: Shallow turquoise carbonate shoals & pale warm coquina reef-flat rims in st.jpg / t.jpg
    st_arr = tint_with_detail(st_arr, (58, 168, 172), np.clip(shoal_paint_w * 0.62, 0.0, 0.62), blur_sig=3.5)
    t_arr = tint_with_detail(t_arr, (68, 174, 178), np.clip(shoal_paint_w * 0.45, 0.0, 0.45), blur_sig=3.5)
    coquina_w = np.where(onshore_carb & (d_from_sea <= 2.2), 0.22, 0.0)
    st_arr = tint_with_detail(st_arr, (196, 190, 168), coquina_w)

    # Pass 6: Dark glassy banded obsidian-perlite carapace tint on the 3 Firebliss pancake domes
    st_arr = tint_with_detail(st_arr, (54, 56, 62), np.clip(dome_paint_w * 0.52, 0.0, 0.52), blur_sig=3.0)

    D['st'] = P.jpeg_like(D, 'st', np.round(st_arr).astype(np.uint8))
    D['t'] = P.jpeg_like(D, 't', np.round(t_arr).astype(np.uint8))
    D['ct'] = P.jpeg_like(D, 'ct', np.round(ct_arr).astype(np.uint8))

    # Update climate['present'] summary counts
    c_final = P.raster(D, 'c', 'L')
    dc = Counter(c_final.ravel().tolist())
    for pr in D['climate']['present']:
        kk = codes.index(pr['code'])
        pr['km2'] = int(dc.get(kk, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(kk, 0) / c_final.size, 2)

    # =========================================================================
    # SELF-CHECKS BEFORE SAVING
    # =========================================================================
    E_chk, _ = P.heights(D)
    wh_chk, wl_chk = P.water_levels(D)
    max_climb_dry = 0.0
    worst_id = None
    for r_ in D['rivers']:
        bm_ = r_.get('bed_m') or []
        assert not any(b2 > b1 + 1e-6 for b1, b2 in zip(bm_, bm_[1:])), 'non-monotonic bed_m on %s' % r_['id']
        pts_ = r_.get('px') or []
        dry_es = [
            float(E_chk[min(sh[0] - 1, max(0, int(round(py_)))), min(sh[1] - 1, max(0, int(round(px_))))])
            for px_, py_ in pts_
            if not wh_chk[min(sh[0] - 1, max(0, int(round(py_)))), min(sh[1] - 1, max(0, int(round(px_))))]
        ]
        if len(dry_es) < 2:
            continue
        me_ = dry_es[0]
        for ev_ in dry_es:
            me_ = min(me_, ev_)
            if ev_ - me_ > max_climb_dry:
                max_climb_dry = ev_ - me_
                worst_id = r_['id']
    assert max_climb_dry <= 50.0, 'river %s dry ground climbs %.1f m > 50 m' % (worst_id, max_climb_dry)

    rep['summary'] = {
        'h_cells_moved': int(moved_h.sum()),
        'wet_cells_changed': int(wet_changed.sum()),
        'landforms_total': len(D['landforms']['landforms']),
        'max_dry_river_climb_m': round(max_climb_dry, 1),
        'worst_river_id': worst_id,
    }

    P.save(D)
    rep_path = os.path.join(HERE, 'edit_518.report.json')
    with open(rep_path, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(rep, fh, indent=2, ensure_ascii=False)
        fh.write('\n')

    # Render side-by-side before/after crop sheet (tools/scale-model/edit_518.crops.jpg)
    crops_path = os.path.join(HERE, 'edit_518.crops.jpg')
    render_crops(raw0['st'], P.raster(D, 'st'), raw0['t'], P.raster(D, 't'), crops_path)
    print('Wrote', rep_path)
    print('Wrote', crops_path)
    print(json.dumps(rep['summary'], indent=2))


def render_crops(st0, st1, t0, t1, out_path):
    specs = [
        ('Pass 1: Spider Lake Crater, NW Rampart & SW 9102 Spillway', (1190, 1365, 135, 265)),
        ('Pass 2: SE Tharn 108 km Crater & Cryo-Fumarole Tarn (1375,1525)', (1315, 1435, 1465, 1585)),
        ('Pass 3a: Crookshore Basalt Horsts & Twin Ejecta Bays', (50, 210, 560, 720)),
        ('Pass 3b: Copper Tarn Collar & Verdigris Outwash (147,1148)', (105, 195, 1105, 1190)),
        ('Pass 4: n semiarid Dam-Relic Salt Lakes 360° Evaporite Rings', (665, 965, 390, 505)),
        ('Pass 5: Ring Isles Carbonate Terraces, Shoals & Port Goto', (875, 1035, 680, 840)),
        ('Pass 6a: Firebliss Obsidian Pancake Domes (157..268, 1324..1338)', (130, 295, 1275, 1385)),
        ('Pass 6b: Rift Rim Planar Fault Facets (1120..1320, 1520..1640)', (1120, 1320, 1515, 1645)),
    ]
    tile_w, tile_h = 280, 210
    pad, head_h, row_head = 12, 34, 24
    cols = 4  # st before, st after, t before, t after
    W = pad + cols * (tile_w + pad)
    H = head_h + len(specs) * (row_head + tile_h + pad) + pad
    canvas = Image.new('RGB', (W, H), (22, 24, 28))
    draw = ImageDraw.Draw(canvas)
    col_titles = ['st.jpg BEFORE', 'st.jpg AFTER', 't.jpg BEFORE', 't.jpg AFTER']
    for c_i, ct_txt in enumerate(col_titles):
        draw.text((pad + c_i * (tile_w + pad) + 6, 10), ct_txt, fill=(220, 226, 235))

    for r_i, (title, (x0, x1, y0, y1)) in enumerate(specs):
        y_top = head_h + r_i * (row_head + tile_h + pad)
        draw.text((pad, y_top + 4), title + f'  [{x0}..{x1} x {y0}..{y1}]', fill=(245, 212, 128))
        imgs = [st0[y0:y1, x0:x1], st1[y0:y1, x0:x1], t0[y0:y1, x0:x1], t1[y0:y1, x0:x1]]
        for c_i, sub in enumerate(imgs):
            im = Image.fromarray(sub).resize((tile_w, tile_h), Image.Resampling.NEAREST)
            canvas.paste(im, (pad + c_i * (tile_w + pad), y_top + row_head))

    canvas.save(out_path, 'JPEG', quality=92)


if __name__ == '__main__':
    main()
