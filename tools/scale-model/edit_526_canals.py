#!/usr/bin/env python3
"""Scale model 5.1, edit 26 (2026-11-23 re-run): continental-scope's canal network, its edit_523 step 2, traced on the merged model.
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


def main():
    dry = '--dry-run' in sys.argv
    D = P.load(DATA_DIR)
    if D.get('canals') and '--force' not in sys.argv:
        sys.exit('edit_526_canals has run already (DATA.canals is set)')
    En, _ = P.heights(D)
    whas, wlev = P.water_levels(D)
    canals_out = []
    for sp in CANAL_SPECS:
        pts, hs, km = trace_canal_alignment(En, whas, wlev, sp['wps'], max_elev_cap=sp['cap_m'])
        canals_out.append({'id': sp['id'], 'name': sp['name'], 'polity': sp['polity'], 'culture': sp['culture'], 'kind': sp['kind'],
                           'width_m': sp['width_m'], 'barge_t': sp['barge_t'], 'locks': sp['locks'], 'length_km': km,
                           'start_m': round(hs[0], 1), 'summit_m': round(max(hs), 1), 'end_m': round(hs[-1], 1), 'px': pts,
                           'notes': sp['notes']})
    rep = {'edit': '5.1 edit 26 (continental-scope edit_523 step 2, re-run)', 'canals': [
        {'id': c['id'], 'km': c['length_km'], 'summit_m': c['summit_m'], 'points': len(c['px'])} for c in canals_out]}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    if dry:
        return
    D['canals'] = canals_out
    P.save(D, DATA_DIR)
    json.dump(rep, open(os.path.join(HERE, 'edit_526_canals.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
