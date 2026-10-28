#!/usr/bin/env python3
"""Scale model 4.24d: Unified Contiguous Southeastern Mega-Basin & Alpine Pass Network

Key Architectural Principles:
  1. Contiguous Basin: Region 99 (Loom-Chasms), Region 101, and Siphon Pits form ONE CONTIGUOUS BASIN.
     NO MOUNTAINS on the northern or southern aspects of Region 101!
     The harmonic rim Dirichlet boundary is anchored ONLY to the outer perimeter of the mega-basin.
  2. Stalker Gate: Natural winding alpine pass corridors with parabolic cross-sections and stepped structural benches,
     NOT straight geometric trenches or flat highway slots.
  3. Region 101: Continuous western loess corridor (+1,950..+2,250 m) directly joining Weavers' Cradle to Ostrukh Terraces;
     stepped central fault bench (+2,100..+2,500 m) with 4 organic breached maar-diatreme calderas.
  4. High Rift: Propagating rift staircase, Opaline Sinter Cataract into Oidong (+2,060 m), North Mirror Graben (Lake Verdigris & Lake Cinnabar),
     and Median Dorsal Wedge horst.
  5. Photorealistic Texturing: eval_hypso hypsometry, clean Lambertian hillshade with micro-grain, PA.retint rock preservation,
     and multi-tone mineral/loess/alluvial palettes with zero flat polygon fills.
"""
import base64, io, json, math, os, shutil, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.terrain as T, smodel.climate as C, smodel.paint as PA

SEED = 424

PTS_HR = [
    [1029, 1309], [1062, 1316], [1082, 1318], [1108, 1308], [1117, 1288],
    [1167, 1288], [1216, 1289], [1233, 1300], [1263, 1288], [1329, 1280],
    [1345, 1296], [1354, 1325], [1302, 1344], [1244, 1359], [1184, 1374],
    [1134, 1374], [1068, 1371], [1040, 1362], [1033, 1350], [1022, 1332],
    [1029, 1322]
]

PTS_SG = [
    [1083, 763], [1135, 781], [1189, 741], [1172, 830], [1172, 846],
    [1226, 956], [1252, 1057], [1219, 1077], [1197, 1098], [1190, 1121],
    [1167, 1063], [1153, 1027], [1132, 959], [1090, 911], [1075, 853],
    [1061, 810]
]

PTS_R101 = [
    [1226, 956], [1289, 1004], [1390, 1021], [1494, 963], [1510, 1010],
    [1497, 1091], [1453, 1082], [1425, 1101], [1378, 1098], [1328, 1081],
    [1299, 1078], [1252, 1057]
]

def harmonic_fill(Eo, mask, dist_cells, pad=2.0):
    inner = mask & (dist_cells > pad)
    u = Eo.copy().astype(float)
    u_init = nd.gaussian_filter(u, sigma=22.0)
    u[inner] = u_init[inner]
    for sigma in (14.0, 7.0, 3.5, 1.8):
        for _ in range(25):
            u_blur = nd.gaussian_filter(u, sigma=sigma)
            u[inner] = u_blur[inner]
    return u

def dist_curve(px, py, pts, n_eval=60):
    pts = np.asarray(pts, float)
    t_vals = np.linspace(0, len(pts) - 1, n_eval)
    cx = np.interp(t_vals, np.arange(len(pts)), pts[:, 0])
    cy = np.interp(t_vals, np.arange(len(pts)), pts[:, 1])
    d_min = np.full(px.shape, 999.0, dtype=float)
    t_min = np.zeros(px.shape, dtype=float)
    for idx in range(len(t_vals)):
        d = np.hypot(px - cx[idx], py - cy[idx])
        closer = d < d_min
        d_min = np.where(closer, d, d_min)
        t_min = np.where(closer, t_vals[idx] / (len(pts) - 1), t_min)
    return d_min, t_min

def build_hypsometric_table(EoF, wet0F, t0):
    bins = np.arange(-2600.0, 14500.0, 50.0)
    meds = []
    for b in bins:
        m = (~wet0F) & (EoF >= b) & (EoF < b + 50.0)
        if m.sum() >= 25:
            meds.append(np.median(t0[m], axis=0))
        else:
            meds.append(meds[-1] if meds else np.array([165.0, 194.0, 73.0]))
    meds = np.array(meds, dtype=float)
    for c in range(3):
        meds[:, c] = nd.gaussian_filter1d(meds[:, c], sigma=1.2)
    return bins + 25.0, meds

def eval_hypso(elev, centers, meds):
    return np.stack([np.interp(elev, centers, meds[:, c]) for c in range(3)], axis=-1)

def compute_clean_hillshade(EnF, zf=5.0, az_deg=315.0, alt_deg=45.0):
    gy, gx = np.gradient(EnF / 1000.0 * zf, 2.0)
    a, l = math.radians(az_deg), math.radians(alt_deg)
    lx, ly, lz = math.cos(l) * math.sin(a), -math.cos(l) * math.cos(a), math.sin(l)
    lam = (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1.0)
    lam_local = lam - nd.uniform_filter(lam, size=25)
    shade = np.clip(1.0 + 0.68 * lam_local, 0.54, 1.48)
    return shade[..., None]

def main():
    print('=== Building Unified Contiguous Southeastern Mega-Basin & Pass Network ===')
    D = P.load()
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    su, sv = P.grid(D)
    OH, OW = D['fullH'], D['fullW']
    VH, VW = Eo.shape

    Y, X = np.indices((VH, VW))
    px = X / su
    py = Y / sv

    regs = json.load(open(os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'regions.json'), encoding='utf-8'))
    by_id = {r['id']: r for r in regs}
    r99_pts = by_id['rmvraoas90co7']['points']
    sp_pts = by_id['rmvra9zogfm9t']['points']

    m99_h = G.poly(r99_pts, su, sv, (VH, VW))
    m99_f = G.poly(r99_pts, 1.0, 1.0, (OH, OW))

    msp_h = G.poly(sp_pts, su, sv, (VH, VW))
    msp_f = G.poly(sp_pts, 1.0, 1.0, (OH, OW))

    m101_h = G.poly(PTS_R101, su, sv, (VH, VW))
    m101_f = G.poly(PTS_R101, 1.0, 1.0, (OH, OW))

    msg_h = G.poly(PTS_SG, su, sv, (VH, VW))
    msg_f = G.poly(PTS_SG, 1.0, 1.0, (OH, OW))

    mhr_h = G.poly(PTS_HR, su, sv, (VH, VW))
    mhr_f = G.poly(PTS_HR, 1.0, 1.0, (OH, OW))

    # --- PART 1: THE UNIFIED SOUTHEASTERN PROVINCE (MEGA-BASIN + STALKER GATE + HIGH RIFT) ---
    # Form ONE CONTIGUOUS PROVINCE: Region 99, Region 101, and Siphon Pits form one contiguous mega-basin.
    # Stalker Gate and High Rift connect seamlessly with zero internal mountain barriers.
    # The harmonic rim Dirichlet boundary is anchored ONLY to the true outer perimeter of m_se_h!
    print('1. Solving harmonic outer rim for entire unified southeastern province...')
    m_mega_h = m99_h | m101_h | msp_h
    m_mega_f = m99_f | m101_f | msp_f
    m_se_h = m_mega_h | msg_h | mhr_h
    m_se_f = m_mega_f | msg_f | mhr_f

    dist_se = nd.distance_transform_edt(m_se_h)
    Eo_harm_se = harmonic_fill(Eo, m_se_h, dist_se, pad=2.0)
    Eo_low_se = nd.gaussian_filter(Eo, sigma=6.0)
    Eo_ridge_se = (Eo - Eo_low_se) * (1.0 - G.sstep(3.5, 9.5, dist_se))

    rs = np.random.RandomState(SEED + 50)
    n1 = nd.gaussian_filter(rs.normal(0, 1, (VH, VW)), 1.8) * 85.0
    n2 = nd.gaussian_filter(rs.normal(0, 1, (VH, VW)), 3.5) * 160.0
    basin_micro = n1 + n2

    # A. Northern Basin: Loom-Chasms (py < 980)
    # Western Cradle piedmont: +2,050..+2,900 m (px < 1310)
    u_cradle_x = np.clip((px - 1205.0) / 95.0, 0.0, 1.0)
    h_cradle = 2920.0 - 860.0 * (u_cradle_x ** 0.88)

    # Monocline & Shuttle mesas (+1,380..+1,760 m)
    u_loom_east = np.clip((px - 1320.0) / 140.0, 0.0, 1.0)
    h_loom_table = 1720.0 - 340.0 * (u_loom_east ** 0.92)

    # 10 Warp Chasms & 7 Weft Canyons dropping to +240..+480 m
    chasm_depth = np.zeros((VH, VW), dtype=float)
    warp_chasms = [
        (1308.0,  14.0, 460.0), (1321.0,  -9.0, 430.0), (1335.0,  16.5, 405.0),
        (1349.0, -11.0, 385.0), (1364.0,  13.0, 355.0), (1379.0, -12.5, 330.0),
        (1394.0,  15.0, 300.0), (1409.0, -10.0, 270.0), (1425.0,  11.5, 255.0),
        (1442.0, -13.0, 285.0),
    ]
    for xc, ang_d, fl_m in warp_chasms:
        ang = math.radians(ang_d)
        dy_c = py - 838.0
        trace_x = xc + dy_c * math.tan(ang) + 4.5 * np.sin(dy_c * 0.04)
        d_tr = np.abs(px - trace_x)
        w_ch = (1.0 - G.sstep(3.2, 11.0, d_tr)) * G.sstep(690.0, 725.0, py) * (1.0 - G.sstep(1040.0, 1080.0, py))
        chasm_depth = np.maximum(chasm_depth, w_ch)

    # Lake Nim & White Loom Playa at [1418, 848]
    r_nim_km = np.hypot((px - 1418.0) * 2.6, (py - 848.0) * 1.5)
    w_nim_lake = 1.0 - G.sstep(9.5, 15.0, r_nim_km)
    h_nim_bed = 216.0 + 22.0 * G.sstep(0.0, 14.0, r_nim_km)

    # Mount Caelum resurgent massif at [1350, 836] (+4,597 m)
    r_cael_km = np.hypot((px - 1350.0) * 2.0, (py - 836.0) * 2.0)
    w_cael = 1.0 - G.sstep(5.0, 42.0, r_cael_km)
    h_cael = 1150.0 + 3447.0 * ((1.0 - np.clip(r_cael_km / 42.0, 0.0, 1.0)) ** 1.38) * w_cael

    h_loom_interior = np.where(px < 1310.0, h_cradle, h_loom_table)
    h_loom_interior = h_loom_interior * (1.0 - chasm_depth) + 360.0 * chasm_depth
    h_loom_interior = h_loom_interior * (1.0 - w_nim_lake) + h_nim_bed * w_nim_lake
    h_loom_interior = np.where(w_cael > 0.01, np.maximum(h_loom_interior, h_cael), h_loom_interior)

    # B. Transitional Basin: Region 101 (py in 950..1080)
    # NO MOUNTAINS NORTH OR SOUTH!
    # West: wide open loess corridor (+1,950..+2,250 m) directly joining Weavers' Cradle to Ostrukh Terraces
    u_101_y = np.clip((py - 950.0) / 130.0, 0.0, 1.0)
    u_101_x = np.clip((px - 1240.0) / 240.0, 0.0, 1.0)
    h_101_corridor = 1950.0 + 650.0 * u_101_x + 120.0 * np.sin(u_101_y * math.pi)

    # 4 Breached Maar Diatremes in Region 101 (scalloped calderas, NO mountain walls)
    diatremes_101 = [
        (1308.0, 1022.0, 18.0, 14.0, 2180.0),
        (1368.0, 1048.0, 21.0, 16.0, 2340.0),
        (1424.0, 1032.0, 19.5, 15.0, 2620.0),
        (1468.0, 1052.0, 17.0, 13.0, 2920.0),
    ]
    w_pit_101 = np.zeros((VH, VW), dtype=float)
    h_pit_101 = h_101_corridor.copy()
    for idx_d, (xc, yc, rx, ry, fl_m) in enumerate(diatremes_101):
        d_p = np.hypot((px - xc) * 2.0 / rx, (py - yc) * 2.0 / ry)
        w_d = 1.0 - G.sstep(0.55, 1.05, d_p)
        w_pit_101 = np.maximum(w_pit_101, w_d)
        h_d = fl_m + 55.0 * (np.clip(d_p / 0.65, 0.0, 1.0) ** 2)
        h_pit_101 = np.where(w_d > 0.02, np.minimum(h_pit_101, h_d), h_pit_101)

    h_101_interior = h_101_corridor * (1.0 - w_pit_101) + h_pit_101 * w_pit_101

    # C. Southern Basin: Siphon Pits (py > 1060)
    # NW Ostrukh Terraces: +1,860..+2,420 m (px < 1310)
    u_ost_x = np.clip((px - 1185.0) / 120.0, 0.0, 1.0)
    h_ostrukh = 1880.0 + 540.0 * (u_ost_x ** 0.9)
    # Lake Ostrukh at [1244, 1141] (+1,850.0 m)
    r_ost_km = np.hypot((px - 1244.0) * 2.4, (py - 1141.0) * 1.5)
    w_ost_lake = 1.0 - G.sstep(8.5, 15.0, r_ost_km)
    h_ost_bed = 1832.0 + 16.0 * G.sstep(0.0, 14.0, r_ost_km)
    h_ostrukh = h_ostrukh * (1.0 - w_ost_lake) + h_ost_bed * w_ost_lake

    # Central dividing fault scarp and SE Basalt Plateau (+4,200..+4,600 m) with the 36 maar pits
    fault_scarp_x = 1290.0 + 0.35 * (py - 1120.0)
    u_scarp = G.sstep(fault_scarp_x - 15.0, fault_scarp_x + 25.0, px)
    h_se_plateau = 4420.0 + 180.0 * np.sin(px * 0.04 - py * 0.03)

    # 4 flagship boiling maars in SE plateau (+2,210..+2,285 m floors)
    flagship_maars = [
        (1412.0, 1222.0, 25.0, 19.5, 2210.0),
        (1346.0, 1246.0, 24.0, 18.5, 2260.0),
        (1354.0, 1168.0, 23.0, 18.0, 2285.0),
        (1440.0, 1152.0, 23.5, 18.2, 2275.0),
    ]
    w_maars = np.zeros((VH, VW), dtype=float)
    h_maar_floors = h_se_plateau.copy()
    maar_lake_mask = np.zeros((VH, VW), dtype=bool)
    maar_lake_lev = np.full((VH, VW), np.nan, dtype=float)

    for mx, my, mrx, mry, mfl in flagship_maars:
        d_m = np.hypot((px - mx) * 2.0 / mrx, (py - my) * 2.0 / mry)
        w_m = 1.0 - G.sstep(0.55, 1.02, d_m)
        w_maars = np.maximum(w_maars, w_m)
        fl_loc = mfl + 50.0 * (d_m ** 2)
        h_maar_floors = np.where(w_m > 0.02, np.minimum(h_maar_floors, fl_loc), h_maar_floors)
        lk_m = (d_m <= 0.35) & msp_h
        maar_lake_mask |= lk_m
        maar_lake_lev = np.where(lk_m, mfl + 14.0, maar_lake_lev)
        h_maar_floors = np.where(lk_m, mfl - 5.0 + 16.0 * (d_m / 0.35), h_maar_floors)

    h_siphon_interior = h_ostrukh * (1.0 - u_scarp) + (h_se_plateau * (1.0 - w_maars) + h_maar_floors * w_maars) * u_scarp

    # D. Stalker Gate: Winding Alpine Pass Network
    dist_to_101 = nd.distance_transform_edt(~m101_h)
    u_east_taper = G.sstep(0.0, 18.0, dist_to_101)
    h_massif_sg = (2450.0 + 3400.0 * u_east_taper) + 400.0 * np.sin(px * 0.045 + py * 0.038) + (n1 * 1.2 + n2 * 1.5)

    curve_p1 = [[1066.0, 768.0], [1085.0, 792.0], [1108.0, 824.0], [1128.0, 862.0], [1152.0, 908.0]]
    d_p1, t_p1 = dist_curve(px, py, curve_p1)
    h_floor_p1 = 1680.0 + 400.0 * t_p1
    hw_p1 = 8.5 + 4.0 * np.sin(t_p1 * math.pi)
    u_p1_wall = np.clip(d_p1 / hw_p1, 0.0, 2.5)
    h_canyon_p1 = h_floor_p1 + 950.0 * (u_p1_wall ** 1.6)
    w_p1 = 1.0 - G.sstep(0.85, 2.2, u_p1_wall)

    r_cen_km = np.hypot((px - 1152.0) * 1.8, (py - 908.0) * 2.2)
    w_cen = 1.0 - G.sstep(16.0, 48.0, r_cen_km)
    h_cen_floor = 1940.0 + 160.0 * ((r_cen_km / 48.0) ** 1.8)
    w_vap_pool = 1.0 - G.sstep(9.5, 18.0, r_cen_km)
    h_vap_bed = 1892.0 + 16.0 * G.sstep(0.0, 17.5, r_cen_km)
    h_cen_interior = h_cen_floor * (1.0 - w_vap_pool) + h_vap_bed * w_vap_pool

    curve_p2 = [[1152.0, 908.0], [1174.0, 882.0], [1198.0, 856.0], [1226.0, 840.0]]
    d_p2, t_p2 = dist_curve(px, py, curve_p2)
    h_floor_p2 = 1940.0 + 260.0 * np.sin(t_p2 * math.pi) + 180.0 * t_p2
    hw_p2 = 7.5 + 3.0 * np.sin(t_p2 * math.pi)
    u_p2_wall = np.clip(d_p2 / hw_p2, 0.0, 2.5)
    h_canyon_p2 = h_floor_p2 + 880.0 * (u_p2_wall ** 1.6)
    w_p2 = 1.0 - G.sstep(0.85, 2.2, u_p2_wall)

    curve_p3 = [[1152.0, 908.0], [1170.0, 955.0], [1198.0, 1015.0], [1232.0, 1060.0], [1252.0, 1075.0]]
    d_p3, t_p3 = dist_curve(px, py, curve_p3)
    h_floor_p3 = 1940.0 + 320.0 * np.sin(t_p3 * math.pi) + 140.0 * t_p3
    hw_p3 = 9.0 + 4.5 * np.sin(t_p3 * math.pi) + 4.0 * t_p3
    u_p3_wall = np.clip(d_p3 / hw_p3, 0.0, 2.5)
    h_canyon_p3 = h_floor_p3 + 820.0 * (u_p3_wall ** 1.6)
    w_p3 = 1.0 - G.sstep(0.85, 2.2, u_p3_wall)

    curve_p4 = [[1152.0, 908.0], [1138.0, 950.0], [1118.0, 1005.0], [1092.0, 1048.0], [1072.0, 1081.0]]
    d_p4, t_p4 = dist_curve(px, py, curve_p4)
    h_floor_p4 = 1940.0 + 1210.0 * (t_p4 ** 0.85)
    hw_p4 = 7.0 + 3.0 * np.sin(t_p4 * math.pi)
    u_p4_wall = np.clip(d_p4 / hw_p4, 0.0, 2.5)
    h_canyon_p4 = h_floor_p4 + 980.0 * (u_p4_wall ** 1.6)
    w_p4 = 1.0 - G.sstep(0.85, 2.2, u_p4_wall)

    h_sg_interior = h_massif_sg
    for w_p, h_c in ((w_p1, h_canyon_p1), (w_cen, h_cen_interior), (w_p2, h_canyon_p2), (w_p3, h_canyon_p3), (w_p4, h_canyon_p4)):
        h_sg_interior = np.where(w_p > 0.01, h_sg_interior * (1.0 - w_p) + np.minimum(h_sg_interior, h_c) * w_p, h_sg_interior)

    # E. High Rift: Propagating Rift Staircase
    u_x_hr = np.clip((px - 1025.0) / 325.0, 0.0, 1.0)
    axis_y_hr = 1330.0 + 8.5 * np.sin(u_x_hr * math.pi * 1.5)
    dy_hr = py - axis_y_hr

    h_floor_hr = 2250.0 + 1050.0 * (u_x_hr ** 0.85) + 650.0 * G.sstep(0.70, 0.98, u_x_hr)
    u_horst = G.sstep(1105.0, 1145.0, px) * (1.0 - G.sstep(1235.0, 1265.0, px))
    w_dorsal = u_horst * np.exp(-((dy_hr + 2.0) / 7.5) ** 2)
    h_horst_elev = 950.0 * w_dorsal

    w_ng = G.sstep(1090.0, 1135.0, px) * (1.0 - G.sstep(1255.0, 1285.0, px)) * np.exp(-((dy_hr + 15.0) / 8.5) ** 2)
    w_sg = G.sstep(1100.0, 1145.0, px) * (1.0 - G.sstep(1255.0, 1285.0, px)) * np.exp(-((dy_hr - 16.0) / 9.0) ** 2)
    fissures = 140.0 * (np.sin(px * 0.45) ** 4) * G.sstep(1255.0, 1295.0, px) * np.exp(-((dy_hr) / 18.0) ** 2)

    h_hr_interior = h_floor_hr + h_horst_elev - 280.0 * w_ng - 220.0 * w_sg - fissures

    u_w_hr = np.clip((px - 1025.0) / 90.0, 0.0, 1.0)
    h_hr_interior = np.where(px < 1115.0, h_hr_interior + 45.0 * np.sin(u_w_hr * 8.0 * math.pi) * (1.0 - u_w_hr), h_hr_interior)

    r_verd = np.hypot((px - 1158.0) * 1.4, (py - 1306.0) * 3.0)
    w_verd = 1.0 - G.sstep(8.5, 16.5, r_verd)
    h_hr_interior = h_hr_interior * (1.0 - w_verd) + (2865.0 + 12.0 * G.sstep(0.0, 15.0, r_verd)) * w_verd

    r_cinn = np.hypot((px - 1222.0) * 1.6, (py - 1304.0) * 3.2)
    w_cinn = 1.0 - G.sstep(6.5, 12.5, r_cinn)
    h_hr_interior = h_hr_interior * (1.0 - w_cinn) + (3105.0 + 12.0 * G.sstep(0.0, 11.5, r_cinn)) * w_cinn

    r_cald = np.hypot((px - 1082.0) * 1.8, (py - 1332.0) * 2.6)
    w_cald = 1.0 - G.sstep(5.5, 11.0, r_cald)
    h_hr_interior = h_hr_interior * (1.0 - w_cald) + (2568.0 + 10.0 * G.sstep(0.0, 10.0, r_cald)) * w_cald

    # Seamless Combination of All Five Biomes
    w_to_101_from_99 = G.sstep(940.0, 985.0, py)
    w_to_sp_from_101 = G.sstep(1050.0, 1090.0, py)

    h_mega_comb = h_loom_interior * (1.0 - w_to_101_from_99) + h_101_interior * w_to_101_from_99
    h_mega_comb = h_mega_comb * (1.0 - w_to_sp_from_101) + h_siphon_interior * w_to_sp_from_101

    w_sg_core = nd.gaussian_filter(msg_h.astype(float), 2.0)
    w_hr_core = nd.gaussian_filter(mhr_h.astype(float), 2.0)
    w_basin_core = nd.gaussian_filter((m99_h | m101_h | msp_h).astype(float), 2.0)

    tot_w = w_sg_core + w_hr_core + w_basin_core + 1e-6
    h_se_interior = h_mega_comb * (w_basin_core / tot_w) + h_sg_interior * (w_sg_core / tot_w) + h_hr_interior * (w_hr_core / tot_w)
    h_se_interior = h_se_interior + basin_micro * 0.4

    # Run hydraulic weathering across the entire SE province
    print('2. Running hydraulic weathering on unified SE province...')
    weather_m = m_se_h & (dist_se > 3.0) & (h_se_interior < 4500.0)
    h_se_interior = T.weather(h_se_interior, weather_m)

    # Blend to OUTER rim
    print('3. Blending to outer province rim...')
    w_outer_se = G.sstep(1.5, 5.5, dist_se)
    w_basin_se = G.sstep(3.2, 9.0, dist_se)
    rim_blended_se = Eo_harm_se + Eo_ridge_se
    h_se_blended = rim_blended_se * (1.0 - w_basin_se) + h_se_interior * w_basin_se

    En = np.where(m_se_h, Eo * (1.0 - w_outer_se) + h_se_blended * w_outer_se, Eo)

    # Water bodies:
    whas = whas0.copy()
    wlev = wlev0.copy()

    # Clear old water inside SE province
    whas[m_se_h & (dist_se >= 3.0)] = False
    wlev[m_se_h & (dist_se >= 3.0)] = np.nan

    # Lake Nim (+240 m)
    lake_nim_m = m99_h & (r_nim_km <= 14.5) & (En < 240.0)
    whas[lake_nim_m] = True; wlev[lake_nim_m] = 240.0; En = np.where(lake_nim_m, np.fmin(En, 239.5), En)

    # Lake Ostrukh (+1,850 m fresh)
    lake_ost_m = msp_h & (r_ost_km <= 14.0) & (En < 1850.0)
    whas[lake_ost_m] = True; wlev[lake_ost_m] = 1850.0; En = np.where(lake_ost_m, np.fmin(En, 1849.5), En)

    # 4 Maar Lakes (+2,224..+2,299 m)
    whas[maar_lake_mask] = True; wlev[maar_lake_mask] = maar_lake_lev[maar_lake_mask]
    En = np.where(maar_lake_mask, np.fmin(En, maar_lake_lev - 0.5), En)

    # Lake Vapora (+1,910 m)
    lake_vap_m = msg_h & (dist_se >= 2.0) & (r_cen_km <= 17.5) & (En < 1910.0)
    whas[lake_vap_m] = True; wlev[lake_vap_m] = 1910.0; En = np.where(lake_vap_m, np.fmin(En, 1909.5), En)

    # High Rift Lakes: Lake Verdigris, Lake Cinnabar, Caldron Pool
    lake_verd_m = mhr_h & (dist_se >= 2.0) & (r_verd <= 15.0) & (En < 2880.0)
    lake_cinn_m = mhr_h & (dist_se >= 2.0) & (r_cinn <= 11.5) & (En < 3120.0)
    lake_cald_m = mhr_h & (dist_se >= 2.0) & (r_cald <= 10.0) & (En < 2580.0)
    whas[lake_verd_m] = True; wlev[lake_verd_m] = 2880.0; En = np.where(lake_verd_m, np.fmin(En, 2879.5), En)
    whas[lake_cinn_m] = True; wlev[lake_cinn_m] = 3120.0; En = np.where(lake_cinn_m, np.fmin(En, 3119.5), En)
    whas[lake_cald_m] = True; wlev[lake_cald_m] = 2580.0; En = np.where(lake_cald_m, np.fmin(En, 2579.5), En)

    edge_se = m_se_h & (dist_se <= 1.5)
    max_d_se = float(np.abs(En[edge_se] - Eo[edge_se]).max())
    print(f'   Unified SE province edge delta: {max_d_se:.3f} m')

    # --- PART 4: TEMPERATURE LAPSE (-6.5 C/km) ---
    print('4. Updating temperatures with lapse rate...')
    lapsed_temps = C.lapse(D, Eo, En, water0, np.where(water0, Eo, np.nan), whas, wlev)
    for k, v in lapsed_temps.items():
        D[k] = v

    # --- PART 5: RECLIMATE (RAIN, CLIMATE CLASSES, ZONES) ---
    print('5. Recomputing rain and climate...')
    zoom = (OH / VH, OW / VW)
    EnF = nd.zoom(En, zoom, order=1)[:OH, :OW]
    wetF = nd.zoom(whas.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)
    wet0F = nd.zoom(water0.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)
    EoF = nd.zoom(Eo, zoom, order=1)[:OH, :OW]
    YF, XF = np.indices((OH, OW))

    all_se_f = m_mega_f | msg_f | mhr_f

    target_rain = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
    # Contiguous basin rain: dry rain shadow (180..320 mm), oases (420..540 mm)
    target_rain = np.where(m_mega_f, np.where(EnF < 2800.0, 240.0, 160.0), target_rain)
    target_rain = np.where(msg_f, np.where(EnF < 3200.0, 320.0, 160.0), target_rain)
    target_rain = np.where(mhr_f, np.where(XF < 1120.0, 450.0, 220.0), target_rain)

    # Oasis wetness along rivers & lakes
    near_lakes = nd.distance_transform_edt(~wetF) < 14.0
    target_rain = np.where(all_se_f & near_lakes, np.maximum(target_rain, 440.0), target_rain)

    w_blend = G.sstep(1.5, 6.0, nd.zoom(nd.distance_transform_edt(m_mega_h | msg_h | mhr_h), zoom, order=1)[:OH, :OW])
    forced = np.zeros((OH, OW), dtype=bool)
    rain2, cls2, zon2, q, rep = C.reclimate(D, Eo, En, whas, forced, force_rain=(target_rain, w_blend))

    codes = [c['code'] for c in D['climate']['classes']]

    # Climate assignments:
    # 1. Contiguous basin (99 + 101 + Siphon Pits):
    # Loess valleys/terraces -> BSk (cold steppe), Dsb (dry-summer continental)
    cls2[m_mega_f & (EnF < 2300.0) & ~wetF] = codes.index('BSk')
    cls2[m_mega_f & (EnF >= 2300.0) & (EnF < 3300.0) & ~wetF] = codes.index('Dsb')
    cls2[m_mega_f & (EnF >= 3300.0) & (EnF < 4200.0) & ~wetF] = codes.index('Dsc')
    cls2[m_mega_f & (EnF >= 4200.0) & (EnF < 5400.0) & ~wetF] = codes.index('ET')
    cls2[m_mega_f & (EnF >= 5400.0) & ~wetF] = codes.index('EF')

    # Oases (Lake Ostrukh shore, Spindle Fan, Loom spring lines): Cwb (subtropical highland)
    cls2[m_mega_f & near_lakes & (EnF >= 1800.0) & (EnF < 2800.0) & ~wetF] = codes.index('Cwb')
    # Deepest Loom Chasms (< 460m): BWh / BWk
    cls2[m99_f & (EnF < 460.0) & ~wetF] = codes.index('BWk')
    # Lakes: WH (highland lakes) / WS
    cls2[m_mega_f & wetF] = codes.index('WH')
    cls2[lake_nim_m[:OH, :OW] if lake_nim_m.shape == (OH, OW) else nd.zoom(lake_nim_m, zoom, order=0)[:OH, :OW]] = codes.index('WS')

    # 2. Stalker Gate:
    cls2[msg_f & (EnF < 2200.0) & ~wetF] = codes.index('BSk')
    cls2[msg_f & (EnF >= 2200.0) & (EnF < 3000.0) & ~wetF] = codes.index('Dsb')
    cls2[msg_f & (EnF >= 3000.0) & (EnF < 4000.0) & ~wetF] = codes.index('Dsc')
    cls2[msg_f & (EnF >= 4000.0) & (EnF < 5400.0) & ~wetF] = codes.index('ET')
    cls2[msg_f & (EnF >= 5400.0) & ~wetF] = codes.index('EF')
    cls2[msg_f & wetF] = codes.index('WH')

    # 3. High Rift:
    cls2[mhr_f & (EnF < 2700.0) & ~wetF] = codes.index('Cfb')
    cls2[mhr_f & (EnF >= 2700.0) & (EnF < 3400.0) & ~wetF] = codes.index('Dfb')
    cls2[mhr_f & (EnF >= 3400.0) & (EnF < 4200.0) & ~wetF] = codes.index('Dsc')
    cls2[mhr_f & (EnF >= 4200.0) & ~wetF] = codes.index('ET')
    cls2[mhr_f & wetF] = codes.index('WH')

    # Zones
    zon2[all_se_f & (EnF < 3400.0)] = 1
    zon2[all_se_f & (EnF >= 3400.0)] = 3
    zon2[all_se_f & wetF] = 4

    tot_px = float(cls2.size)
    for entry in D['climate']['present']:
        c_i = codes.index(entry['code'])
        entry['pct'] = round(float((cls2 == c_i).sum()) / tot_px * 100.0, 2)

    # --- PART 6: PHOTOREALISTIC TEXTURING & RELIGHTING ---
    print('6. Repainting st, t, rt, ct maps (with fine grain and retinting)...')
    st0 = P.raster(D, 'st')
    t0 = P.raster(D, 't')
    rt0 = P.raster(D, 'rt')
    ct0 = P.raster(D, 'ct')

    rs_tex = np.random.RandomState(SEED + 99)
    fine_grain = 1.0 + nd.gaussian_filter(rs_tex.normal(0.0, 0.035, (OH, OW)), 0.9)[..., None]
    clean_shade = compute_clean_hillshade(EnF, zf=5.0, az_deg=315.0, alt_deg=45.0) * fine_grain

    # Relief map (t)
    hypso_centers, hypso_meds = build_hypsometric_table(EoF, wet0F, t0.astype(float))
    t_hypso = eval_hypso(EnF, hypso_centers, hypso_meds)
    t_synth = np.clip(t_hypso * clean_shade, 0, 255).astype(np.uint8)
    t_synth = np.where(wetF[..., None], np.array([45, 110, 125], dtype=np.uint8), t_synth)
    w_paint = np.clip(nd.gaussian_filter(all_se_f.astype(float), 1.5) * 1.5, 0.0, 1.0)[..., None]
    t_final = np.clip(t0 * (1.0 - w_paint) + t_synth * w_paint, 0, 255).astype(np.uint8)

    # Rain map (rt)
    rt_synth = np.clip(PA.ramp(rain2) * (0.28 + 0.72 * clean_shade), 0, 255).astype(np.uint8)
    rt_final = np.where(all_se_f[..., None], rt_synth, rt0).astype(np.uint8)

    # Climate map (ct)
    class_rgb = np.array([[int(c['color'][1:3], 16), int(c['color'][3:5], 16), int(c['color'][5:7], 16)] for c in D['climate']['classes']], dtype=float)
    ct_synth = np.clip(class_rgb[cls2] * (0.38 + 0.62 * clean_shade), 0, 255).astype(np.uint8)
    ct_final = np.where(all_se_f[..., None], ct_synth, ct0).astype(np.uint8)

    # Satellite map (st) using retinting and natural mineral/loess palettes
    D_tmp = dict(D)
    relit, _, _ = PA.relight(D_tmp, Eo, En, keys=('st',))
    st_relit = np.array(Image.open(io.BytesIO(base64.b64decode(relit['st']))).convert('RGB')).astype(float)
    st_retint = PA.retint(st_relit, EoF, EnF, ok=all_se_f, src=~all_se_f, step=120.0).astype(float)

    # Slope-based cliff shading (dark espresso/charcoal on steep scarps)
    gy_m, gx_m = np.gradient(EnF, 2.0)
    slope_deg = np.degrees(np.arctan(np.hypot(gx_m, gy_m) / 2000.0 * 5.0))
    is_cliff = G.sstep(24.0, 44.0, slope_deg)[..., None]
    cliff_col = np.array([68.0, 52.0, 46.0]) * clean_shade

    # Valley floor loess / alluvial fan on basin and pass floors (< 2,400m)
    is_floor = (all_se_f & (EnF < 2400.0) & ~wetF)[..., None]
    loess_col = np.array([162.0, 142.0, 102.0]) * clean_shade

    # Greener vegetation on oases / river corridors
    is_oasis = (all_se_f & near_lakes & (EnF < 2800.0) & ~wetF)[..., None]
    oasis_col = np.array([84.0, 124.0, 68.0]) * clean_shade

    # Alpine tundra (3,600..5,200m)
    is_tundra = (all_se_f & (EnF >= 3600.0) & (EnF < 5200.0) & ~wetF)[..., None]
    tundra_col = np.array([124.0, 116.0, 94.0]) * clean_shade

    # Summit ice (> 5,200m)
    is_ice = (all_se_f & (EnF >= 5200.0) & ~wetF)[..., None]
    ice_col = np.array([238.0, 242.0, 248.0]) * np.clip(clean_shade, 0.75, 1.15)

    st_art = st_retint
    st_art = np.where(is_floor, st_art * 0.35 + loess_col * 0.65, st_art)
    st_art = np.where(is_oasis, st_art * 0.25 + oasis_col * 0.75, st_art)
    st_art = np.where(is_tundra, st_art * 0.40 + tundra_col * 0.60, st_art)
    st_art = np.where(is_cliff > 0.05, st_art * (1.0 - 0.70 * is_cliff) + cliff_col * (0.70 * is_cliff), st_art)
    st_art = np.where(is_ice, st_art * 0.15 + ice_col * 0.85, st_art)

    # Lakes on st: turquoise water with shallow edges
    lake_st_col = np.array([38.0, 108.0, 126.0]) * np.clip(clean_shade, 0.84, 1.15)
    st_art = np.where(wetF[..., None] & all_se_f[..., None], lake_st_col, st_art)

    st_final = np.clip(st0 * (1.0 - w_paint) + st_art * w_paint, 0, 255).astype(np.uint8)

    # Save to D
    D['h'] = P.encode_heights(D, En, whas)
    D['wl'] = P.encode_levels(D, whas, wlev)
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    D['st'] = P.b64(Image.fromarray(st_final, 'RGB'), 'JPEG', quality=92)
    D['t'] = P.b64(Image.fromarray(t_final, 'RGB'), 'JPEG', quality=92)
    D['rt'] = P.b64(Image.fromarray(rt_final, 'RGB'), 'JPEG', quality=92)
    D['ct'] = P.b64(Image.fromarray(ct_final, 'RGB'), 'JPEG', quality=92)

    # Vents
    new_vents = [
        {'px': [1188.0, 1326.0], 'floor': 3100.0, 'scale': 0.25, 'radius': 2.5, 'kind': 'geyser'}, # High Rift
        {'px': [1152.0, 908.0], 'floor': 1895.0, 'scale': 0.26, 'radius': 2.6, 'kind': 'geyser'},  # Lake Vapora
        {'px': [1365.0, 1045.0], 'floor': 2340.0, 'scale': 0.24, 'radius': 2.4, 'kind': 'geyser'}, # Region 101 maar
    ]
    cur_vents = D.get('vents', [])
    for nv in new_vents:
        if not any(abs(v['px'][0] - nv['px'][0]) < 10 and abs(v['px'][1] - nv['px'][1]) < 10 for v in cur_vents):
            cur_vents.append(nv)
    D['vents'] = cur_vents

    P.save(D)

    # Update regions.json
    regs_path = os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'regions.json')
    regs = json.load(open(regs_path, encoding='utf-8'))
    reg_dict = {r['id']: r for r in regs}

    new_reg_defs = [
        {
            'id': 'rmvhighrift100',
            'name': 'High Rift',
            'kind': 'biome',
            'color': '#b87333',
            'points': PTS_HR,
            'notes': 'The East Oidong Propagating Rift Zipper: ascending 3-step rift staircase (+2,250m to +4,250m), median Dorsal Wedge horst, Lake Verdigris and Lake Cinnabar, and western Opaline Cataract into Oidong Valley.',
            'createdAt': '2026-10-28T13:00:00.000Z'
        },
        {
            'id': 'rmvstalkergate',
            'name': 'Stalker Gate',
            'kind': 'biome',
            'color': '#8a9e8c',
            'points': PTS_SG,
            'notes': 'The 4-Way Graben-to-Highlands Pass Network (+1,680m to +3,150m) connecting Yuni, Loom-Chasms, Siphon Pits, and the Stalker Range, centered on the Gatehouse Pull-Apart and steaming Lake Vapora.',
            'createdAt': '2026-10-28T13:00:00.000Z'
        },
        {
            'id': 'rmvregion101',
            'name': 'Region 101',
            'kind': 'biome',
            'color': '#b89e82',
            'points': PTS_R101,
            'notes': 'Breached Diatremes & Contiguous Basin Threshold: intermediate tectonic threshold seamlessly joining Loom-Chasms and Siphon Pits as one contiguous mega-basin, with 4 breached explosion maars and connecting gorges.',
            'createdAt': '2026-10-28T13:00:00.000Z'
        }
    ]

    for nrd in new_reg_defs:
        if nrd['id'] not in reg_dict:
            regs.append(nrd)
            reg_dict[nrd['id']] = nrd
        else:
            reg_dict[nrd['id']].update(nrd)
    json.dump(regs, open(regs_path, 'w', encoding='utf-8'), indent=1)

    # Update defRegs in model/src/51-region-store.js
    store_path = os.path.join(HERE, 'model', 'src', '51-region-store.js')
    store_src = open(store_path, encoding='utf-8').read()
    import re
    m_def = re.search(r'const defRegs = (\[[\s\S]*?\]);', store_src)
    if m_def:
        store_src = store_src[:m_def.start(1)] + json.dumps(regs) + store_src[m_def.end(1):]
        open(store_path, 'w', encoding='utf-8').write(store_src)

    # Build HTML
    print('7. Building scale-model.html...')
    subprocess.check_call([sys.executable, os.path.join(HERE, 'model', 'build.py')])
    dist_html = os.path.join(HERE, 'model', 'dist', 'scale-model.html')
    shutil.copy2(dist_html, os.path.join(HERE, 'scale-model-4.24.html'))
    shutil.copy2(dist_html, 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scale-model-artifact.html')

    # Save visual verification crop of the whole SE region
    scratch_dir = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scratch'
    os.makedirs(scratch_dir, exist_ok=True)
    crop_st = Image.fromarray(st_final[700:1390, 1000:1549])
    crop_st.save(os.path.join(scratch_dir, 'contiguous_basin_st.png'))

    crop_t = Image.fromarray(t_final[700:1390, 1000:1549])
    crop_t.save(os.path.join(scratch_dir, 'contiguous_basin_t.png'))
    print('=== Contiguous Mega-Basin & Pass Network Build Complete! ===')

if __name__ == '__main__':
    main()
