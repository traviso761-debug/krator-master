#!/usr/bin/env python3
"""Scale model 5.1, edit 23 (2026-11-23): Continental Canal Networks (`DATA.canals` /
`canals.json` across Eternal State, Ria Civilization, Empire of Iziz, Hykkousoi League,
and Kingdom of Voth), the 4 disjoint `[D]` Settlement-Fit Micro-Surgeries (`Almua` spit +
`Dip Rivrh`, `The Beacon` `+868 m` knoll, `Dalab` `Wind Bruk` delta grading, `Locus`
scarp-foot stream), `[B]` Pin Relocations, and Unpinned Settlement Registration.

Usage:
    python3 tools/scale-model/edit_523_canals_and_settlements.py --in-place
    python3 tools/scale-model/edit_523_canals_and_settlements.py --dry-run
"""

import argparse
import json
import math
import os
import re
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import smodel.climate as C  # noqa: E402
import smodel.page as P     # noqa: E402
import smodel.paint as PA   # noqa: E402

SRC_DIR = os.path.join(HERE, 'model', 'src')
DATA_DIR = os.path.join(HERE, 'model', 'data')
SETT_VER = '5.1e23'


def trace_canal_alignment(E, whas, wlev, waypoints, max_elev_cap=None, allow_end_wet=True, pad=28):
    """Find a smooth, terrain-following minimum-climb canal alignment on the 2 km grid,
    strictly avoiding interior open water while allowing terminal harbour/lake lock basins."""
    VH, VW = E.shape
    xs = [p[0] for p in waypoints]
    ys = [p[1] for p in waypoints]
    x0 = max(0, int(min(xs)) - pad)
    x1 = min(VW - 1, int(max(xs)) + pad)
    y0 = max(0, int(min(ys)) - pad)
    y1 = min(VH - 1, int(max(ys)) + pad)
    W = x1 - x0 + 1
    H = y1 - y0 + 1

    subE = E[y0:y1 + 1, x0:x1 + 1]
    subW = whas[y0:y1 + 1, x0:x1 + 1].copy()
    if allow_end_wet:
        for px, py in (waypoints[0], waypoints[-1]):
            ix, iy = int(round(px)) - x0, int(round(py)) - y0
            if 0 <= iy < H and 0 <= ix < W:
                subW[iy, ix] = False

    ref_e = min(float(subE[int(round(py)) - y0, int(round(px)) - x0]) for px, py in waypoints)
    rows, cols, costs = [], [], []
    dirs = [
        (-1, 0, 2.0), (1, 0, 2.0), (0, -1, 2.0), (0, 1, 2.0),
        (-1, -1, 2.828), (-1, 1, 2.828), (1, -1, 2.828), (1, 1, 2.828),
    ]
    for dy, dx, d_km in dirs:
        j_a = np.arange(max(0, -dy), min(H, H - dy))
        i_a = np.arange(max(0, -dx), min(W, W - dx))
        ja, ia = np.meshgrid(j_a, i_a, indexing='ij')
        jb, ib = ja + dy, ia + dx
        a = (ja * W + ia).ravel()
        b = (jb * W + ib).ravel()
        dz = np.abs(subE[jb, ib] - subE[ja, ia]).ravel()
        exc = np.maximum(0.0, 0.5 * (subE[ja, ia] + subE[jb, ib]) - ref_e).ravel()
        w_pen = np.where(subW[jb, ib].ravel(), 25000.0, 0.0)
        cap_pen = np.where((subE[jb, ib] > max_elev_cap).ravel(), 25000.0, 0.0) if max_elev_cap is not None else 0.0
        c = d_km + 0.65 * dz + 0.045 * exc * d_km + w_pen + cap_pen
        rows.append(a)
        cols.append(b)
        costs.append(c)

    G = coo_matrix((np.concatenate(costs), (np.concatenate(rows), np.concatenate(cols))), shape=(H * W, H * W)).tocsr()
    full_px = []
    for k in range(len(waypoints) - 1):
        ax, ay = int(round(waypoints[k][0])) - x0, int(round(waypoints[k][1])) - y0
        bx, by = int(round(waypoints[k + 1][0])) - x0, int(round(waypoints[k + 1][1])) - y0
        ca, cb = ay * W + ax, by * W + bx
        _, pred = dijkstra(G, directed=True, indices=ca, return_predecessors=True)
        seg = []
        cur = cb
        while cur >= 0 and cur != ca:
            cj, ci = divmod(int(cur), W)
            seg.append([round(float(ci + x0), 1), round(float(cj + y0), 1)])
            cur = int(pred[cur])
        seg.append([round(float(ax + x0), 1), round(float(ay + y0), 1)])
        seg.reverse()
        full_px.extend(seg if not full_px else seg[1:])

    # Light rectilinear/masonry smoothing (1 pass preserving endpoints & dry cells)
    sm = [list(p) for p in full_px]
    for i in range(1, len(sm) - 1):
        nx_ = round(0.22 * full_px[i - 1][0] + 0.56 * full_px[i][0] + 0.22 * full_px[i + 1][0], 2)
        ny_ = round(0.22 * full_px[i - 1][1] + 0.56 * full_px[i][1] + 0.22 * full_px[i + 1][1], 2)
        if not whas[int(round(ny_)), int(round(nx_))]:
            sm[i] = [nx_, ny_]
    sm[0] = [round(float(waypoints[0][0]), 2), round(float(waypoints[0][1]), 2)]
    sm[-1] = [round(float(waypoints[-1][0]), 2), round(float(waypoints[-1][1]), 2)]

    hs = [
        float(wlev[int(round(y)), int(round(x))] if whas[int(round(y)), int(round(x))] else E[int(round(y)), int(round(x))])
        for x, y in sm
    ]
    km = round(sum(2.0 * math.hypot(sm[i + 1][0] - sm[i][0], sm[i + 1][1] - sm[i][1]) for i in range(len(sm) - 1)), 1)
    return sm, hs, km


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in-place', action='store_true', help='Write updated rasters, canals.json & pins to model/')
    ap.add_argument('--dry-run', action='store_true', help='Verify invariants and print report JSON without writing')
    args = ap.parse_args()

    D = P.load(DATA_DIR)
    E0, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    En = E0.copy()
    whas = whas0.copy()
    wlev = wlev0.copy()
    VH, VW = En.shape
    yy, xx = np.mgrid[0:VH, 0:VW]

    # =========================================================================
    # STEP 1: The 4 Disjoint `[D]` Settlement-Fit Micro-Surgeries
    # =========================================================================
    surg_mask = np.zeros((VH, VW), dtype=bool)

    # [D1] Dalab Delta Plain Grading (`px 473..480 x 1105..1111` around `477, 1108`)
    # Flatten excess hill relief on dry cells & fill the -12 m dry pit at (477, 1107) while preserving lakes & river descent
    for y in range(1105, 1112):
        for x in range(473, 481):
            if whas[y, x]:
                continue
            d = math.hypot(x - 477.0, y - 1108.0)
            if d <= 3.8:
                w_b = max(0.0, 1.0 - (d / 3.8) ** 2)
                target_h = 6.5 + 1.8 * max(0.0, x - 476.0) + 1.4 * abs(y - 1108.0)
                En[y, x] = (1.0 - 0.82 * w_b) * max(En[y, x], 4.5) + (0.82 * w_b) * target_h
                surg_mask[y, x] = True
    En[1107, 477] = max(En[1107, 477], 6.8)
    En[1108, 477] = 7.5

    # [D2] The Beacon Sightline Knoll Restoration (`px 851..857 x 1536..1545` around `854, 1540`)
    # Strictly y >= 1536 so Erewhon's caldera lake (y <= 1534) is 100% untouched!
    for y in range(1536, 1546):
        for x in range(851, 858):
            if whas[y, x]:
                continue
            rx = (x - 853.6) / 2.8
            ry = (y - 1540.2) / 4.2
            r2 = rx * rx + ry * ry
            if r2 < 1.0:
                w_k = (1.0 - r2) ** 1.5
                knoll_h = 845.0 + 40.0 * w_k
                if knoll_h > En[y, x]:
                    En[y, x] = knoll_h
                    surg_mask[y, x] = True
    En[1540, 853] = max(En[1540, 853], 868.0)
    En[1540, 854] = max(En[1540, 854], 884.0)

    # [D3] Almua Spit Harbour & `r863 Dip Rivrh` Mouth Routing (`px 715..728 x 876..892`)
    # Ensure `(723, 885)` is dry shore (`~ -1,442 m`) with a sheltered 2-px Ring Sea spit harbour at `(722, 884)` (`-1,508 m`)
    En[885, 723] = -1442.0
    whas[885, 723] = False
    for hx, hy, hh_m in ((722, 884, -1509.0), (721, 884, -1514.0)):
        En[hy, hx] = min(En[hy, hx], hh_m)
        whas[hy, hx] = True
        wlev[hy, hx] = -1500.2
        surg_mask[hy, hx] = True
    surg_mask[885, 723] = True

    # Route `r863 Dip Rivrh` cleanly from its broken end `[688.5, 910.8]` along dry coastal plain to `[722.0, 884.0]`
    r863 = next((r for r in D['rivers'] if str(r.get('id')) in ('r863', '863')), None)
    if r863 is not None:
        dip_wps = [(688.5, 912.5), (696.0, 906.0), (705.0, 899.0), (714.0, 892.0), (720.0, 887.0), (722.5, 885.5)]
        dip_pts, _, _ = trace_canal_alignment(En, whas, wlev, dip_wps, max_elev_cap=-1250.0, allow_end_wet=False, pad=12)
        # Ensure ground along Dip Rivrh descends gently to -1,496 m at mouth without >50 m climbs
        n_dp = len(dip_pts)
        dip_beds = []
        dip_qs = []
        for idx_p, (px, py) in enumerate(dip_pts):
            ix, iy = int(round(px)), int(round(py))
            t = idx_p / max(1, n_dp - 1)
            target_bed = -1392.0 * (1.0 - t) + (-1499.0) * t
            if not whas[iy, ix] and En[iy, ix] > target_bed + 32.0:
                En[iy, ix] = target_bed + 12.0
                surg_mask[iy, ix] = True
            elif not whas[iy, ix] and En[iy, ix] < -1499.5:
                En[iy, ix] = -1496.0
                surg_mask[iy, ix] = True
            dip_beds.append(round(target_bed, 2))
            dip_qs.append(round(28.0 + 10.3 * t, 1))
        # Terminal sea-mouth vertex in spit harbour (722.0, 884.0)
        dip_pts.append([722.0, 884.0])
        dip_beds.append(-1500.2)
        dip_qs.append(38.3)
        r863['px'] = dip_pts
        r863['bed_m'] = dip_beds
        r863['q_m3s'] = dip_qs
        r863['q_mouth_m3s'] = 38.3
        r863['source_m'] = dip_beds[0]
        r863['length_km'] = round(sum(2.0 * math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(dip_pts[:-1], dip_pts[1:])), 1)
        r863['to'] = {'sea': 'Ring Sea', 'at_px': [722.0, 884.0]}

    # [D4] Locus Perennial Scarp-Foot Stream `r_locus_delta` (`px 1268..1275 x 1042..1043` -> `(1268, 1043)`)
    # Keep `E[1043, 1267] = -2,402.6 m` 100% untouched (test_smodel.py line 801)!
    locus_pts = [[1275.0, 1042.0], [1273.5, 1042.0], [1272.0, 1042.0], [1270.5, 1042.0], [1269.0, 1042.0], [1268.0, 1043.0]]
    locus_es = []
    m_loc = float(En[1042, 1275])
    for px, py in locus_pts:
        iy, ix = int(round(py)), int(round(px))
        if En[iy, ix] > m_loc + 5.0 and not whas[iy, ix] and (ix, iy) != (1267, 1043):
            En[iy, ix] = m_loc - 4.0
            surg_mask[iy, ix] = True
        m_loc = min(m_loc, float(En[iy, ix]))
        locus_es.append(float(En[iy, ix]))
    # Enforce strictly non-increasing bed_m along natural scarp descent
    locus_beds = []
    cur_b = locus_es[0] - 2.0
    for e_v in locus_es:
        cur_b = min(cur_b - 1.5, e_v - 2.0)
        locus_beds.append(round(cur_b, 2))
    D['rivers'] = [r for r in D['rivers'] if str(r.get('id')) != 'r_locus_delta']
    D['rivers'].append({
        'id': 'r_locus_delta',
        'name': 'Wādī al-Naft',
        'tongue': 'dasri',
        'kind': 'river',
        'perennial': True,
        'px': locus_pts,
        'bed_m': locus_beds,
        'q_m3s': [6.5, 8.2, 10.4, 12.1, 13.8, 15.2],
        'q_mouth_m3s': 15.2,
        'width_m': 18.0,
        'source_m': locus_beds[0],
        'catchment_km2': 420,
        'length_km': 15.0,
        'settlements': ['Locus'],
        'to': {'lake_m': -2405, 'at_px': [1267.6, 1043.0]},
    })

    # Ensure no existing river accidentally gained a >50 m climb on the 3 tiny [D] boxes
    for rv in D['rivers']:
        pts_r = rv.get('px') or []
        if not any(surg_mask[int(round(py)), int(round(px))] for px, py in pts_r):
            continue
        m_e = float(En[int(round(pts_r[0][1])), int(round(pts_r[0][0]))])
        for px, py in pts_r[1:]:
            iy, ix = int(round(py)), int(round(px))
            if En[iy, ix] < m_e:
                m_e = float(En[iy, ix])
            elif En[iy, ix] - m_e > 35.0 and not whas[iy, ix]:
                En[iy, ix] = m_e + 10.0

    # =========================================================================
    # STEP 2: Build the 22-Canal Continental Network (`DATA.canals` -> `canals.json`)
    # =========================================================================
    CANAL_SPECS = [
        # --- 1. ETERNAL STATE (8 Extensive Imperial Bronze-Miter-Lock Canals) ---
        {
            'id': 'cn_et_lingkou',
            'name': 'Līng-Kǒu Grand Outlet Canal',
            'polity': 'Eternal State',
            'culture': 'eternian',
            'kind': 'grand_lock_canal',
            'width_m': 22,
            'barge_t': 45,
            'locks': 6,
            'wps': [(447, 647), (445, 645), (432, 636), (419, 628), (409, 621)],
            'cap_m': 135.0,
            'notes': 'Breaches the +54 m Ling-Mouth sill out of Mirror Sea (+45.9 m) and locks 45 t state barges beside Ling-Ma straight into Fulcrum.',
        },
        {
            'id': 'cn_et_lingma_lateral',
            'name': 'Lower Līng-Mā Lateral Canal',
            'polity': 'Eternal State',
            'culture': 'eternian',
            'kind': 'lateral_navigation_canal',
            'width_m': 22,
            'barge_t': 45,
            'locks': 8,
            'wps': [(409, 621), (376, 611), (342, 603), (302, 594), (264, 588), (246, 586)],
            'cap_m': 180.0,
            'notes': 'Floodplain bypass canal & miter-lock cuts along lower Ling-Ma linking Fulcrum to Farport lower harbour.',
        },
        {
            'id': 'cn_et_farside',
            'name': 'Farside Tsunami-Shelter Canal',
            'polity': 'Eternal State',
            'culture': 'eternian',
            'kind': 'coastal_polder_canal',
            'width_m': 18,
            'barge_t': 35,
            'locks': 4,
            'wps': [(249, 585), (249, 571), (247, 558)],
            'cap_m': 160.0,
            'notes': 'Sheltered coastal rice-and-salt canal behind Farside seawalls linking Farport estuary to Tong-Sek-Ma out of reach of Yonni sea-raids.',
        },
        {
            'id': 'cn_et_shuangzha',
            'name': 'Shuāng-Zhá Twin-Locks Canal',
            'polity': 'Eternal State',
            'culture': 'eternian',
            'kind': 'stepped_polder_canal',
            'width_m': 20,
            'barge_t': 45,
            'locks': 4,
            'wps': [(453, 783), (450.5, 782.0), (449, 776), (447, 773)],
            'cap_m': 165.0,
            'notes': 'Canonical Eternian canal testbed (settlements/eternian-canal): Hak-Ma diversion weir, Lok-Ma 3-arch aqueduct & paired bronze miter-locks into Mirror Sea.',
        },
        {
            'id': 'cn_et_wuxi',
            'name': 'Wū-Xī Colliery & Carcosa Canal',
            'polity': 'Eternal State',
            'culture': 'eternian',
            'kind': 'colliery_lock_canal',
            'width_m': 20,
            'barge_t': 45,
            'locks': 12,
            'wps': [(422, 776), (416, 782), (404, 795), (395, 812)],
            'cap_m': 220.0,
            'notes': 'Carries #1 Eternian coal & kaolin/fireclay from Black-Seam Colliery and licensed Yusar trade from Carcosa into SW Mirror Sea.',
        },
        {
            'id': 'cn_et_lux_east',
            'name': 'Lux Dragon-Kiln Polder Canal',
            'polity': 'Eternal State',
            'culture': 'eternian',
            'kind': 'polder_trunk_canal',
            'width_m': 20,
            'barge_t': 45,
            'locks': 12,
            'wps': [(495, 644), (498, 644), (495, 670), (500, 688), (494, 693)],
            'cap_m': 220.0,
            'notes': 'Links Lux porcelain kilns along the eastern Mirror Sea mulberry terrace to Tseng-Ke, Hong-Ma Wharf and Kam-Ma.',
        },
        {
            'id': 'cn_et_hongma',
            'name': 'Hōng-Mā Valley Lock-Canal',
            'polity': 'Eternal State',
            'culture': 'eternian',
            'kind': 'valley_lock_canal',
            'width_m': 18,
            'barge_t': 30,
            'locks': 14,
            'wps': [(496, 688), (500, 688), (509, 690), (516, 692)],
            'cap_m': 380.0,
            'notes': 'Canalized lower Hong-Ma timber & tea navigation below Corpus.',
        },
        {
            'id': 'cn_et_palewharf',
            'name': 'Palewharf Split-Jetty Lock-Cut',
            'polity': 'Eternal State',
            'culture': 'eternian',
            'kind': 'quarantine_lock_cut',
            'width_m': 18,
            'barge_t': 45,
            'locks': 6,
            'wps': [(556, 603), (561, 603), (565, 604)],
            'cap_m': 680.0,
            'notes': '5.2 m-gauge Sanctum quarantine lock & incline basin linking Jimjam Lake (lbl=77) to Palewharf (Ruling #66).',
        },
        # --- 2. RIA CIVILIZATION (7 Extensive Dynastic Canals) ---
        {
            'id': 'cn_ria_iron_gates',
            'name': 'Mā-Kōu ("Iron Gates") Lock-Bypass Canal',
            'polity': 'Neutral Ria Charter (Seal-Bank & Pioneers)',
            'culture': 'ria',
            'kind': 'gorge_bypass_canal',
            'width_m': 26,
            'barge_t': 60,
            'locks': 10,
            'wps': [(731, 184), (703, 184), (674, 178)],
            'cap_m': 240.0,
            'notes': 'Paktong-gated stone lock canal with Pioneer eddy-current capstans bypassing the 4,210 m3/s Iron Gates hogback water-gap.',
        },
        {
            'id': 'cn_ria_tongqu',
            'name': 'Tōng-Qū Three-Rivers Grand Canal',
            'polity': 'Lower Ria Dynasty / Arcflow Republics',
            'culture': 'ria',
            'kind': 'inter_basin_grand_canal',
            'width_m': 24,
            'barge_t': 50,
            'locks': 18,
            'wps': [(627, 140), (648, 133), (664, 108), (718, 124)],
            'cap_m': 260.0,
            'notes': 'Transverse inland Grand Canal uniting Ma-Ria (Ria Sound foot), Mo-Ma (Mo-Veche) and Pak-Ma (Pak-Veche) behind the Double Delta Ghost-Tsunami zone.',
        },
        {
            'id': 'cn_ria_kuluna',
            'name': 'Kulūną Southern Heartland Loess Canal',
            'polity': 'Lower Ria Dynasty',
            'culture': 'ria',
            'kind': 'irrigation_barge_canal',
            'width_m': 22,
            'barge_t': 50,
            'locks': 14,
            'wps': [(853, 184), (797, 178), (735, 183)],
            'cap_m': 320.0,
            'notes': '245 km gravity irrigation & grain-barge trunk watering the 580 mm/yr rain-shadowed Heartland loess plain.',
        },
        {
            'id': 'cn_ria_harta',
            'name': 'Hārta Northern Heartland Terrace Canal',
            'polity': 'Lower Ria Dynasty',
            'culture': 'ria',
            'kind': 'irrigation_barge_canal',
            'width_m': 20,
            'barge_t': 45,
            'locks': 12,
            'wps': [(856, 181), (796, 174), (750, 178)],
            'cap_m': 320.0,
            'notes': 'Dujiangyan-style northern diversion & barge canal feeding Heartland capital arcology.',
        },
        {
            'id': 'cn_ria_liwa_kompa',
            'name': 'Līwa-Kōmpa Summit Canal',
            'polity': 'Upper Ria Dynasty / Compass Hills',
            'culture': 'ria',
            'kind': 'summit_pound_canal',
            'width_m': 18,
            'barge_t': 35,
            'locks': 14,
            'wps': [(1022, 152), (1042, 188), (1055, 219), (1058, 224)],
            'cap_m': 780.0,
            'notes': 'Lingqu-style 72 m summit-pound canal (strictly non-ferrous bronze lock-gates near Lodestone!) linking Ma-Ria to Ham-Tsek Silk Post and Lodestone.',
        },
        {
            'id': 'cn_ria_sikwingi',
            'name': 'Sikwīngi Karst Boat-Lift Canal',
            'polity': 'Upper Ria Dynasty / Pioneers',
            'culture': 'ria',
            'kind': 'boat_lift_canal',
            'width_m': 18,
            'barge_t': 35,
            'locks': 11,
            'wps': [(1124, 134), (1135, 153), (1162, 136), (1186, 118)],
            'cap_m': 1380.0,
            'notes': 'Connects Ching-Ma to Pioneer HQ Springhollows (1135,153) and Upper Ria capital via counterweight karst shut-in boat-lifts.',
        },
        {
            'id': 'cn_ria_akwala',
            'name': 'Ākwala Upper-Reach Basin Canal',
            'polity': 'Upper Ria Dynasty',
            'culture': 'ria',
            'kind': 'lateral_navigation_canal',
            'width_m': 18,
            'barge_t': 40,
            'locks': 12,
            'wps': [(1186, 118), (1227, 109), (1281, 99), (1305, 100)],
            'cap_m': 1420.0,
            'notes': 'Porphyry-lined upper-reach canal linking Upper Ria capital to Kwaluna-Liwa, Akwala-Gela and Step Ruin.',
        },
        # --- 3. EMPIRE OF IZIZ (2 Imperial Ship & Delta Canals) ---
        {
            'id': 'cn_iz_fossa_iziz',
            'name': 'Fosa Imperial de Iziz',
            'polity': 'Empire of Iziz',
            'culture': 'iziz',
            'kind': 'imperial_ship_canal',
            'width_m': 24,
            'barge_t': 60,
            'locks': 8,
            'wps': [(963, 985), (961, 977), (956, 945)],
            'cap_m': -1380.0,
            'notes': 'Ferrocrete-and-orange-brick Imperial canal linking Iziz outer moat (-1,428 m) via Bruk Falz to Port Tobin and the Ring Sea.',
        },
        {
            'id': 'cn_iz_canal_atton',
            'name': 'Canal Costero de Atton',
            'polity': 'Empire of Iziz',
            'culture': 'iziz',
            'kind': 'coastal_lagoon_canal',
            'width_m': 20,
            'barge_t': 50,
            'locks': 6,
            'wps': [(993, 991), (1008, 972), (1023, 955), (1044, 952)],
            'cap_m': -1280.0,
            'notes': 'Lowland delta barge canal uniting Rrivar Goulda, Atton, Rrivar Grin and Stump behind coastal mangrove bars.',
        },
        # --- 4. HYKKOUSOI / LEAGUE OF AMPHITRITON (2 Classical Dioryx & Ore Canals) ---
        {
            'id': 'cn_hyk_dioryx_ys',
            'name': 'Dioryx of Ys–Visas',
            'polity': 'League of Amphitriton',
            'culture': 'ys',
            'kind': 'isthmus_dioryx',
            'width_m': 20,
            'barge_t': 50,
            'locks': 4,
            'wps': [(788, 741), (792, 726), (800, 712)],
            'cap_m': -1320.0,
            'notes': 'Rock-cut classical Dioryx & coastal lagoon cut between Ys and Port Visas shielding coasters from exposed headlands and Screamer raid-barges.',
        },
        {
            'id': 'cn_hyk_sideros',
            'name': 'Sideros–Tethis Ore Canal',
            'polity': 'League of Amphitriton',
            'culture': 'ys',
            'kind': 'colliery_lock_canal',
            'width_m': 16,
            'barge_t': 35,
            'locks': 8,
            'wps': [(744, 784), (739, 780), (734, 776)],
            'cap_m': -1220.0,
            'notes': 'Ashlar lock-canal carrying mainland Sideros iron & coal (Ruling #13) down to Tethis shipyards.',
        },
        # --- 5. KINGDOM OF VOTH (3 Breadbasket, Chinampa & Canton Canals) ---
        {
            'id': 'cn_vo_grut_gracht',
            'name': 'Grüt-Gracht (Voth–Torus Canal)',
            'polity': 'Vothic Kingdom',
            'culture': 'voth',
            'kind': 'breadbasket_canal',
            'width_m': 20,
            'barge_t': 45,
            'locks': 14,
            'wps': [(747, 1017), (764, 1017), (775, 1015), (777, 1003)],
            'cap_m': -850.0,
            'notes': 'Sheltered inland canal bringing Forest-Ring grain tithes from Torus to Bay of Voth safe from Izani wartime sea raiders.',
        },
        {
            'id': 'cn_vo_shim_chinampa',
            'name': 'Shim–Sethas Chinampa Canal',
            'polity': 'Vothic Kingdom',
            'culture': 'shim',
            'kind': 'chinampa_trunk_canal',
            'width_m': 22,
            'barge_t': 50,
            'locks': 4,
            'wps': [(655, 1111), (671, 1119), (685, 1138), (688, 1141)],
            'cap_m': 140.0,
            'notes': 'Old Chichani lake-plain chinampa, Blitrit dye, cotton & rattlepod barge canal linking Shim (655,1111) and Sethas.',
        },
        {
            'id': 'cn_vo_almua_canton',
            'name': 'Almua–Kowld Canton Canal',
            'polity': 'Vothic Kingdom',
            'culture': 'voth',
            'kind': 'coastal_lagoon_canal',
            'width_m': 18,
            'barge_t': 40,
            'locks': 2,
            'wps': [(723, 885), (711, 889), (699, 890)],
            'cap_m': -1320.0,
            'notes': 'Coastal feeder & harbour-flushing canal linking Kowld Bruk to Almua waterfront cantons.',
        },
    ]

    canals_out = []
    for sp in CANAL_SPECS:
        pts, hs, km = trace_canal_alignment(En, whas, wlev, sp['wps'], max_elev_cap=sp['cap_m'])
        canals_out.append({
            'id': sp['id'],
            'name': sp['name'],
            'polity': sp['polity'],
            'culture': sp['culture'],
            'kind': sp['kind'],
            'width_m': sp['width_m'],
            'barge_t': sp['barge_t'],
            'locks': sp['locks'],
            'length_km': km,
            'start_m': round(hs[0], 1),
            'summit_m': round(max(hs), 1),
            'end_m': round(hs[-1], 1),
            'px': pts,
            'notes': sp['notes'],
        })
    D['canals'] = canals_out

    # =========================================================================
    # STEP 3: Re-encode `h` & `wl`, Update Lapse, Relight & Paint Canals on `st`/`t`
    # =========================================================================
    D['h'] = P.encode_heights(D, En, whas)
    D['wl'] = P.encode_levels(D, whas, np.nan_to_num(wlev, nan=D['lo']))

    moved = np.abs(En - E0) > 0.5
    if moved.any():
        relit_out, EoF, EnF = PA.relight(D, E0, En)
        D.update(relit_out)
        lap = C.lapse(D, E0, En, whas0, np.nan_to_num(wlev0, nan=0.0), whas, np.nan_to_num(wlev, nan=0.0))
        for tk, tv in lap.items():
            D[tk] = tv
        st_arr = P.raster(D, 'st')
        st_arr = PA.retint(st_arr, EoF, EnF, moved, ~moved, 150.0)
    else:
        st_arr = P.raster(D, 'st')

    # Paint subtle masonry-edged turquoise canal threads onto `st` and `t` so satellite & relief views show them too
    for key_img, base_arr in (('st', st_arr), ('t', P.raster(D, 't'))):
        im = Image.fromarray(base_arr.astype(np.uint8), 'RGB')
        dr = ImageDraw.Draw(im)
        for cn in canals_out:
            cpts = [(float(p[0]), float(p[1])) for p in cn['px']]
            dr.line(cpts, fill=(46, 126, 138), width=2)
            dr.line(cpts, fill=(68, 182, 188), width=1)
        D[key_img] = P.jpeg_like(D, key_img, np.array(im))

    # =========================================================================
    # STEP 4: Update `60-settlements.js` (`[B]` Relocations + Unpinned Settlements)
    # =========================================================================
    sett_path = os.path.join(SRC_DIR, '60-settlements.js')
    sett_src = open(sett_path, encoding='utf-8').read()
    m_sett = re.search(r'const defSetts = (\[.*?\]);\n', sett_src)
    assert m_sett, 'Could not parse defSetts in 60-settlements.js'
    def_setts = json.loads(m_sett.group(1))
    by_id = {s['id']: s for s in def_setts}

    MOVES_523 = [
        ('sshimrest01', 655, 1111, 'Snapped out of -461 m lake onto +9 m dry shore beside Shim/klir Rivrh (5,744 m3/s)'),
        ('s5x27pj6hn', 792, 860, 'Snapped 6 km W down Throne flank onto -1,444 m dry Ring Sea coast'),
        ('s427qb1kma', 411.4, 508.1, 'Synced from +6,030 m cliff rim onto +5,702 m Cold Lake coulee fan (30-ql-layout.js)'),
        ('sn6y4sx8tr', 819, 552, 'Snapped onto r024 Mekam-aru (16.8 m3/s) valley bench'),
        ('sirb5um6cr', 671, 930, 'Snapped off valley wall onto r058 Drim Rivrh (49.9 m3/s) floor'),
        ('sy42jwlyk4', 777, 1003, 'Snapped onto r072 Tors Rivrh (59.3 m3/s) breadbasket terrace'),
        ('sjau3958qz', 723, 885, 'Snapped out of -2,013 m Ring Sea onto -1,442 m dry N-facing shore at Dip Rivrh spit harbour'),
    ]
    moved_recs = []
    for sid, nx_, ny_, note_add in MOVES_523:
        if sid in by_id:
            s = by_id[sid]
            s['px'] = nx_
            s['py'] = ny_
            if note_add not in (s.get('notes') or ''):
                s['notes'] = ((s.get('notes') or '').rstrip() + ' | 5.1e23: ' + note_add).lstrip(' |')
            moved_recs.append({'id': sid, 'px': nx_, 'py': ny_})

    ADDS_523 = [
        {'id': 'sshuangzha1', 'name': 'Shuāng-Zhá', 'type': 'town', 'px': 450.5, 'py': 782.0, 'notes': 'Eternian Twin-Locks canal burgh (settlements/eternian-canal, 6,800 pop)'},
        {'id': 'slingkou001', 'name': 'Līng-Kǒu', 'type': 'town', 'px': 445, 'py': 645, 'notes': 'Mirror Sea Grand Canal outlet lock-town (5,500 pop)'},
        {'id': 'swuxicoll01', 'name': 'Wū-Xī (Black-Seam)', 'type': 'town', 'px': 416, 'py': 782, 'notes': 'Eternian #1 coal & fireclay canal colliery wharf (4,800 pop)'},
        {'id': 'shongmawhf1', 'name': 'Hōng-Mā Wharf', 'type': 'town', 'px': 500, 'py': 688, 'notes': 'Eternian timber, tea & canal transshipment wharf below Corpus (4,500 pop)'},
        {'id': 'smakouiron1', 'name': 'Mā-Kōu (Iron Gates)', 'type': 'city', 'px': 702, 'py': 182, 'notes': 'Neutral Ria hogback water-gap lock-city: PN-02 Pioneers Flux Tower & AS-02 Court of the Amber Seal Clearinghouse'},
        {'id': 'sblakhed001', 'name': 'Blakhed', 'type': 'town', 'px': 441, 'py': 1400, 'notes': 'South Dalab High-Rift gateway & Great Caravan stage (settlements/blakhed)'},
        {'id': 'sbeacon0001', 'name': 'The Beacon', 'type': 'monastery', 'px': 853, 'py': 1540, 'notes': 'Order of the Beacon & Sultanate watch fort on +868 m knoll (HM-07, settlements/beacon)'},
        {'id': 'sflasheye01', 'name': 'Red Monastery (Flashing Eye)', 'type': 'monastery', 'px': 881, 'py': 1527.1, 'notes': 'Order of the Flashing Eye scoria-cone monastery (HM-06, settlements/flashing-eye)'},
        {'id': 'sviridian01', 'name': 'Misṭ-Gārḍan (Viridian)', 'type': 'monastery', 'px': 962, 'py': 1562, 'notes': 'Order of Viridian Thought tea & medicinal estate on misty Xanadu N scarp (settlements/viridian)'},
        {'id': 'siridesc001', 'name': 'Rēnbō-Phāl (Iridescent)', 'type': 'monastery', 'px': 1016, 'py': 1655, 'notes': 'Iridescent Order waterfall monastery below Opal Valley Terrace II (settlements/iridescent)'},
        {'id': 'sgihon00001', 'name': 'Gihon', 'type': 'city', 'px': 955, 'py': 1608, 'notes': 'Sultanate Mint, Forbidden City garrison & Golden Tears Head House at Opal River mouth (settlements/gihon)'},
        {'id': 'slanding001', 'name': 'The Landing', 'type': 'town', 'px': 932, 'py': 1600, 'notes': 'Monumental twin-pier Alph mouth barge portage town on Lower Xanadu Lake (settlements/gihon)'},
        {'id': 'sdevisers01', 'name': "Rare Devisers' Camp", 'type': 'outpost', 'px': 839, 'py': 1398, 'notes': 'Godshearth thermal-lake fumarole sulfur & rarities camp (settlements/devisers-camp)'},
    ]
    added_recs = []
    for rec in ADDS_523:
        ix, iy = int(round(rec['px'])), int(round(rec['py']))
        assert not whas[iy, ix], f"New pin {rec['id']} ({rec['name']}) at ({rec['px']},{rec['py']}) is on water!"
        if rec['id'] not in by_id:
            def_setts.append(rec)
            by_id[rec['id']] = rec
            added_recs.append(rec)
        else:
            by_id[rec['id']].update(rec)

    for sid, nx_, ny_, _ in MOVES_523:
        ix, iy = int(round(nx_)), int(round(ny_))
        assert not whas[iy, ix], f"Moved pin {sid} at ({nx_},{ny_}) is on water!"

    new_sett_line = 'const defSetts = ' + json.dumps(def_setts, ensure_ascii=False) + ';\n'
    sett_out = sett_src[:m_sett.start()] + new_sett_line + sett_src[m_sett.end():]
    if f"'{SETT_VER}':" not in sett_out:
        m_add_end = re.search(r'(\n  \};\n  Object\.keys\(SETT_ADDED\))', sett_out)
        assert m_add_end
        sett_out = sett_out[:m_add_end.start()] + f",\n    '{SETT_VER}':{json.dumps(ADDS_523, ensure_ascii=False)}" + sett_out[m_add_end.start():]
        m_mov_end = re.search(r'(\n  \};\n  Object\.keys\(SETT_MOVED\))', sett_out)
        assert m_mov_end
        sett_out = sett_out[:m_mov_end.start()] + f",\n    '{SETT_VER}':{json.dumps(moved_recs, ensure_ascii=False)}" + sett_out[m_mov_end.start():]

    rep = {
        'edit': '5.1e23: 22-Canal Continental Network (Eternia, Ria, Iziz, Hykkousoi, Voth), 4 [D] Micro-Surgeries & [B] Pin Sync',
        'version_tag': SETT_VER,
        'canal_count': len(canals_out),
        'total_canal_km': round(sum(c['length_km'] for c in canals_out), 1),
        'total_locks': sum(c['locks'] for c in canals_out),
        'canals_by_culture': {
            k: [c['name'] for c in canals_out if c['culture'] == k or (k == 'voth' and c['culture'] == 'shim')]
            for k in ('eternian', 'ria', 'iziz', 'ys', 'voth')
        },
        'micro_surgeries_pixels_changed': int(moved.sum()),
        'pins_relocated': moved_recs,
        'pins_added_count': len(ADDS_523),
    }

    if args.dry_run:
        print(json.dumps(rep, indent=2, ensure_ascii=False))
        return

    if args.in_place:
        P.save(D, DATA_DIR)
        with open(sett_path, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(sett_out)
        rep_path = os.path.join(HERE, 'edit_523_canals_and_settlements.report.json')
        with open(rep_path, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(rep, fh, indent=2, ensure_ascii=False)
            fh.write('\n')

    print(json.dumps(rep, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
