#!/usr/bin/env python3
"""Scale model 4.24 / 4.25 — Complete 5-Region Southeastern Complex:
  1. Region 99 (`rmvraoas90co7`) — The Loom-Chasms & Weavers' Cradle
  2. Siphon Pits (`rmvra9zogfm9t`) — The Siphon Pits & Ostrukh Terraces
  3. Mid Basin (`rmvmidbasin101`) — Transitional Faulted Basalt Hinge-Ramp & Breached Maar-Diatreme Amphitheaters
  4. Stalker Gate (`rmvstalkergate`) — Multi-Branched Meandering Mountain & Highland Pass Network + Lake Vapora
  5. High Rift (`rmvhighrift100`) — 5-Zone Propagating Rift Staircase (Opaline Sinter Steps, Mirror Graben,
     Dorsal Wedge Horst, Fire-and-Ice Coulee, and The Singing Gjar)

    python tools/scale-model/edit_424.py

Sculpts all 5 contiguous Southeastern biome polygons together as one integrated geological system with zero
artificial mountain walls along shared internal polygon boundaries, while maintaining 0.000 m Dirichlet
continuity along the outer perimeter of the complex.
"""
import base64, io, json, math, os, shutil, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.terrain as T, smodel.climate as C, smodel.paint as PA   # noqa: E402
import smodel.se_provinces as SE   # noqa: E402

SEED = 424
BASE_COMMIT = 'cede0a0f9'
R99_ID = 'rmvraoas90co7'
SIPHON_ID = 'rmvra9zogfm9t'
MID_BASIN_ID = 'rmvmidbasin101'
STALKER_GATE_ID = 'rmvstalkergate'
HIGH_RIFT_ID = 'rmvhighrift100'

CAELUM_PX = (1350.0, 836.0)
LAKE_NIM_PX = (1418.0, 848.0)
LAKE_NIM_LEV = 240.0

OSTRUKH_LAKE_PX = (1252.0, 1134.0)
OSTRUKH_LAKE_LEV = 1850.0
SCARP_PASS_PX = (1288.0, 1128.0)

D_LO_HI = (-2600.0, 27000.0)


def harmonic_fill(Eo, mask, dist_cells, pad=2.0):
    """Solve Dirichlet Laplace equation inside `mask & (dist_cells > pad)` with boundary fixed to `Eo`."""
    inner = mask & (dist_cells > pad)
    u = Eo.copy().astype(float)
    u_init = nd.gaussian_filter(u, sigma=22.0)
    u[inner] = u_init[inner]
    for sigma in (14.0, 7.0, 3.5, 1.8):
        for _ in range(30):
            u_blur = nd.gaussian_filter(u, sigma=sigma)
            u[inner] = u_blur[inner]
    return u


def build_loom_interior(Eo, su, sv):
    """Compute the unblended geological interior surface of Region 99 (Loom-Chasms, Weavers' Cradle, Fluted Monocline,
    Mount Caelum, and Lake Nim) across the grid so it can join seamlessly with Mid Basin and Stalker Gate."""
    rs = np.random.RandomState(SEED)
    VH, VW = Eo.shape
    Y, X = np.indices((VH, VW))
    px = X / su
    py = Y / sv

    fold_warp = (
        16.0 * np.sin((py - 835.0) * 0.024 + 0.5)
        + 9.5 * np.cos((py - 835.0) * 0.058 - 1.1)
        + 5.0 * np.sin((px - 1310.0) * 0.075 + (py - 835.0) * 0.065)
    )
    dy_norm = (py - 838.0) / 145.0
    x_tect = px - 28.0 * (dy_norm ** 2) + fold_warp

    # Zone A: Western Arable Piedmont (Weavers' Cradle)
    u_west = np.clip((x_tect - 1205.0) / 90.0, 0.0, 1.0)
    fan_swales = (
        52.0 * np.sin((py - 760.0) * 0.075 + (px - 1230.0) * 0.03)
        + 30.0 * np.cos((py - 840.0) * 0.14 - (px - 1240.0) * 0.06)
    )
    h_piedmont = 2820.0 - 760.0 * (u_west ** 0.88) + fan_swales * (1.0 - 0.3 * u_west)

    # Zone B: The Fluted Monocline (The Weave-Step)
    u_mono = np.clip((x_tect - 1290.0) / 42.0, 0.0, 1.0)
    stair = (
        G.sstep(0.00, 0.26, u_mono) * 0.35
        + G.sstep(0.33, 0.61, u_mono) * 0.35
        + G.sstep(0.68, 0.96, u_mono) * 0.30
    )
    mono_flutes = -60.0 * (np.sin((py - 740.0) * 0.16 + 0.8) ** 4) * np.sin(u_mono * math.pi)

    # Zone C: The Loom-Chasms Horst Plateau (Shuttle Mesas) & Braided Rift Chasm Network
    u_east_tilt = np.clip((x_tect - 1328.0) / 135.0, 0.0, 1.0)
    h_horst_table = (
        1720.0
        - 340.0 * (u_east_tilt ** 0.92)
        + 55.0 * np.sin((px - 1360.0) * 0.045) * np.cos((py - 835.0) * 0.042)
    )

    fault_jag_x = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 2.6)
    fault_jag_x = fault_jag_x / (np.std(fault_jag_x) + 1e-9) * 3.8

    chasm_depth_map = np.zeros((VH, VW), dtype=float)
    chasm_floor_target = np.full((VH, VW), 1650.0, dtype=float)
    rim_shoulder_map = np.zeros((VH, VW), dtype=float)

    warp_chasms = [
        (1308.0,  14.0,  7.5, 130.0, 0.4, 3.1, 460.0, 710.0, 1035.0),
        (1321.0,  -9.0,  8.5, 145.0, 1.5, 3.6, 430.0, 700.0, 1045.0),
        (1335.0,  16.5,  9.0, 135.0, 2.7, 3.8, 405.0, 692.0, 1045.0),
        (1349.0, -11.0,  8.0, 140.0, 0.8, 3.5, 385.0, 690.0, 1045.0),
        (1364.0,  13.0,  9.5, 150.0, 3.4, 4.1, 355.0, 692.0, 1045.0),
        (1379.0, -12.5, 10.0, 138.0, 1.9, 4.3, 330.0, 695.0, 1040.0),
        (1394.0,  15.0,  9.0, 142.0, 4.1, 4.4, 300.0, 702.0, 1035.0),
        (1409.0, -10.0,  8.5, 132.0, 2.3, 4.2, 270.0, 710.0, 1025.0),
        (1425.0,  11.5,  8.0, 128.0, 0.6, 3.8, 255.0, 720.0, 1015.0),
        (1442.0, -13.0,  7.0, 122.0, 3.0, 3.2, 285.0, 735.0,  995.0),
    ]
    for xc, ang_d, amp, wl, ph, hw, fl_m, ymin, ymax in warp_chasms:
        ang = math.radians(ang_d)
        dy_c = py - 838.0
        trace_x = xc + dy_c * math.tan(ang) + amp * np.sin(2.0 * math.pi * dy_c / wl + ph) + fault_jag_x
        d_tr = np.abs(px - trace_x)
        prof = 1.0 - G.sstep(hw * 0.38, hw * 1.18, d_tr)
        y_env = G.sstep(ymin, ymin + 28.0, py) * (1.0 - G.sstep(ymax - 28.0, ymax, py))
        w_ch = prof * y_env
        chasm_depth_map = np.maximum(chasm_depth_map, w_ch)
        local_fl = fl_m + 30.0 * (dy_norm ** 2)
        chasm_floor_target = np.where(w_ch > 0.05, np.minimum(chasm_floor_target, local_fl), chasm_floor_target)
        sh = 55.0 * np.exp(-((d_tr - hw * 1.35) / 2.8) ** 2) * y_env
        rim_shoulder_map = np.maximum(rim_shoulder_map, sh)

    weft_splays = [
        (1338.0, 765.0,  34.0, 2.9, 395.0, 125.0),
        (1375.0, 755.0, -32.0, 3.1, 355.0, 135.0),
        (1345.0, 815.0, -35.0, 3.2, 365.0, 140.0),
        (1392.0, 805.0,  33.0, 3.4, 310.0, 145.0),
        (1355.0, 868.0,  36.0, 3.3, 345.0, 145.0),
        (1398.0, 862.0, -31.0, 3.5, 290.0, 140.0),
        (1372.0, 912.0, -34.0, 3.0, 335.0, 130.0),
    ]
    for xc, yc, ang_d, hw, fl_m, length_px in weft_splays:
        ang = math.radians(ang_d)
        dx_s = px - xc
        dy_s = py - yc
        s_along = -dx_s * math.sin(ang) + dy_s * math.cos(ang)
        d_perp = np.abs(dx_s * math.cos(ang) + dy_s * math.sin(ang) + 0.75 * fault_jag_x)
        prof = 1.0 - G.sstep(hw * 0.36, hw * 1.15, d_perp)
        s_env = 1.0 - G.sstep(length_px * 0.35, length_px * 0.52, np.abs(s_along))
        w_ch = prof * s_env
        chasm_depth_map = np.maximum(chasm_depth_map, w_ch)
        local_fl = fl_m - 35.0 * np.clip((px - 1320.0) / 110.0, 0.0, 1.0)
        chasm_floor_target = np.where(w_ch > 0.05, np.minimum(chasm_floor_target, local_fl), chasm_floor_target)

    rock_noise = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 1.1)
    rock_noise = rock_noise / (np.std(rock_noise) + 1e-9) * 26.0

    h_horst_with_rims = h_horst_table + rim_shoulder_map * (1.0 - chasm_depth_map) + rock_noise
    h_graben = h_horst_with_rims * (1.0 - chasm_depth_map) + (chasm_floor_target + rock_noise * 0.30) * chasm_depth_map

    # Terminal Rift Sink: Lake Nim & The White Loom Playa
    ang_nim = math.radians(14.0)
    dx_n = (px - LAKE_NIM_PX[0]) * 2.0
    dy_n = (py - LAKE_NIM_PX[1]) * 2.0
    u_nim = dx_n * math.cos(ang_nim) + dy_n * math.sin(ang_nim)
    v_nim = -dx_n * math.sin(ang_nim) + dy_n * math.cos(ang_nim)
    r_nim_km = np.hypot(u_nim * 1.30, v_nim * 0.72) + 3.2 * np.sin(v_nim * 0.11 + 0.5)

    w_playa = 1.0 - G.sstep(18.0, 56.0, r_nim_km)
    h_playa = (LAKE_NIM_LEV + 1.8) + 28.0 * G.sstep(13.0, 54.0, r_nim_km)
    h_graben = h_graben * (1.0 - w_playa) + h_playa * w_playa

    w_nim_pool = 1.0 - G.sstep(10.0, 15.6, r_nim_km)
    h_nim_bed = (LAKE_NIM_LEV - 24.0) + 22.5 * G.sstep(0.0, 14.8, r_nim_km)
    h_graben = h_graben * (1.0 - w_nim_pool) + h_nim_bed * w_nim_pool

    h_loom_interior = (h_piedmont + mono_flutes) * (1.0 - stair) + h_graben * stair

    # Mount Caelum Resurgent Volcanic Massif
    dx_cael = (px - CAELUM_PX[0]) * 2.0
    dy_cael = (py - CAELUM_PX[1]) * 2.0
    r_cael_km = np.hypot(dx_cael, dy_cael)
    th_cael = np.arctan2(dy_cael, dx_cael)
    cael_buttress = (
        1.0
        + 0.09 * np.cos(6.0 * th_cael + 0.5)
        + 0.06 * np.sin(9.0 * th_cael - 1.1)
        + 0.04 * np.cos(13.0 * th_cael + 2.0)
    )
    r_cael_eff = r_cael_km / cael_buttress
    w_cael = 1.0 - G.sstep(5.0, 44.0, r_cael_eff)
    cael_cone = 1150.0 + 3750.0 * ((1.0 - np.clip(r_cael_eff / 44.0, 0.0, 1.0)) ** 1.38) * w_cael
    summit_crater = 105.0 * (1.0 - G.sstep(2.2, 6.0, r_cael_km))
    h_cael = cael_cone - summit_crater
    h_loom_interior = np.where(w_cael > 0.01, np.maximum(h_loom_interior, h_cael), h_loom_interior)

    return h_loom_interior, r_nim_km, r_cael_km, x_tect, chasm_depth_map, u_mono


def build_siphon_interior(Eo, su, sv):
    """Compute the unblended geological interior surface of Siphon Pits (NW Ostrukh Terraces, Lake Ostrukh,
    Central Dividing Fault Escarpment, Scarp Pass, and 36 Maar-Diatreme Siphon Pits)."""
    rs = np.random.RandomState(SEED + 98)
    VH, VW = Eo.shape
    Y, X = np.indices((VH, VW))
    px = X / su
    py = Y / sv

    ang_norm = math.radians(32.0)
    fault_rough = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 2.2)
    fault_rough = fault_rough / (np.std(fault_rough) + 1e-9) * 4.2
    fault_bend = (
        15.0 * np.sin((py - 1128.0) * 0.042 + 0.5)
        + 8.5 * np.cos((px - 1288.0) * 0.068 - 0.8)
        + 5.0 * np.sin((px + py) * 0.095 + 1.4)
        + fault_rough
    )
    scarp_u = (px - SCARP_PASS_PX[0]) * math.cos(ang_norm) + (py - SCARP_PASS_PX[1]) * math.sin(ang_norm) + fault_bend
    scarp_v = -(px - SCARP_PASS_PX[0]) * math.sin(ang_norm) + (py - SCARP_PASS_PX[1]) * math.cos(ang_norm)

    u_nw = np.clip((-scarp_u - 4.0) / 76.0, 0.0, 1.0)
    ostrukh_steps = (
        G.sstep(0.04, 0.21, u_nw) * 0.25
        + G.sstep(0.27, 0.45, u_nw) * 0.25
        + G.sstep(0.51, 0.69, u_nw) * 0.25
        + G.sstep(0.75, 0.93, u_nw) * 0.25
    )
    terrace_swales = (
        42.0 * np.sin(scarp_v * 0.088 + 0.6)
        + 28.0 * np.cos(scarp_u * 0.105 - scarp_v * 0.075)
        + 18.0 * np.sin((px - 1240.0) * 0.14 + (py - 1120.0) * 0.12)
    )
    h_ostrukh = 1880.0 + 485.0 * ostrukh_steps + terrace_swales * (0.4 + 0.6 * u_nw)

    dx_ost = (px - OSTRUKH_LAKE_PX[0]) * 2.0
    dy_ost = (py - OSTRUKH_LAKE_PX[1]) * 2.0
    u_ost = dx_ost * math.cos(ang_norm) + dy_ost * math.sin(ang_norm)
    v_ost = -dx_ost * math.sin(ang_norm) + dy_ost * math.cos(ang_norm)
    r_ost_km = np.hypot(u_ost * 1.32, v_ost * 0.72) + 2.4 * np.sin(v_ost * 0.16) + 1.4 * np.cos(u_ost * 0.22)
    w_ost_pool = 1.0 - G.sstep(7.5, 13.8, r_ost_km)
    h_ost_bed = (OSTRUKH_LAKE_LEV - 18.0) + 16.5 * G.sstep(0.0, 12.8, r_ost_km)
    h_ostrukh = h_ostrukh * (1.0 - w_ost_pool) + h_ost_bed * w_ost_pool

    u_scarp = np.clip((scarp_u + 10.0) / 32.0, 0.0, 1.0)
    scarp_stair = (
        G.sstep(0.00, 0.26, u_scarp) * 0.36
        + G.sstep(0.31, 0.62, u_scarp) * 0.36
        + G.sstep(0.67, 0.98, u_scarp) * 0.28
    )
    scarp_spurs = (
        165.0 * np.sin(scarp_v * 0.16 + 0.8) * np.cos(scarp_u * 0.14)
        * np.exp(-((scarp_u - 4.0) / 13.0) ** 2)
        * (1.0 - w_ost_pool)
    )

    shield_swells = (
        185.0 * np.sin((px - 1380.0) * 0.034 + (py - 1190.0) * 0.029)
        + 115.0 * np.cos((px - 1410.0) * 0.058 - (py - 1210.0) * 0.052)
        + 68.0 * np.sin((px - 1350.0) * 0.11 - (py - 1160.0) * 0.095)
    )
    h_se_plateau = 4425.0 + shield_swells + 85.0 * G.sstep(14.0, 62.0, scarp_u)

    siphon_pits = [
        (1412.0, 1222.0, 25.0, 19.5,  24.0, 2210.0, True,  True),
        (1396.0, 1209.0, 22.0, 17.5, -18.0, 2250.0, False, True),
        (1402.0, 1236.0, 18.5, 14.5,  38.0, 2290.0, False, True),
        (1428.0, 1209.0, 19.0, 15.0,  12.0, 2305.0, False, True),
        (1381.0, 1218.0, 17.0, 13.5,  44.0, 2335.0, False, False),
        (1424.0, 1234.0, 13.5, 11.0, -28.0, 2380.0, False, False),
        (1394.0, 1192.0, 13.0, 10.5,  19.0, 2395.0, False, False),
        (1442.0, 1218.0, 11.5,  9.2,  31.0, 2440.0, False, False),
        (1346.0, 1246.0, 24.0, 18.5,  29.0, 2260.0, True,  True),
        (1361.0, 1256.0, 19.0, 15.0, -22.0, 2315.0, False, True),
        (1333.0, 1234.0, 18.0, 14.2,  16.0, 2345.0, False, False),
        (1348.0, 1265.0, 15.0, 12.0,  41.0, 2390.0, False, False),
        (1322.0, 1250.0, 13.0, 10.5, -19.0, 2425.0, False, False),
        (1366.0, 1234.0, 14.5, 11.5,  27.0, 2375.0, False, False),
        (1337.0, 1276.0, 10.5,  8.5,  12.0, 2480.0, False, False),
        (1377.0, 1266.0, 11.0,  9.0, -32.0, 2455.0, False, False),
        (1354.0, 1168.0, 23.0, 18.0,  18.0, 2285.0, True,  True),
        (1338.0, 1179.0, 18.5, 14.8,  36.0, 2340.0, False, True),
        (1368.0, 1155.0, 18.0, 14.2, -15.0, 2350.0, False, False),
        (1378.0, 1172.0, 16.5, 13.0,  28.0, 2370.0, False, False),
        (1322.0, 1192.0, 15.0, 12.0,  42.0, 2410.0, False, False),
        (1362.0, 1188.0, 13.5, 10.8,  14.0, 2415.0, False, False),
        (1328.0, 1210.0, 11.8,  9.5, -12.0, 2455.0, False, False),
        (1326.0, 1134.0, 19.5, 15.5,  26.0, 2330.0, False, True),
        (1314.0, 1148.0, 15.5, 12.5, -18.0, 2385.0, False, False),
        (1340.0, 1122.0, 15.0, 12.0,  34.0, 2395.0, False, False),
        (1306.0, 1166.0, 12.5, 10.0,  15.0, 2440.0, False, False),
        (1362.0, 1114.0, 12.0,  9.6, -24.0, 2450.0, False, False),
        (1440.0, 1152.0, 23.5, 18.2,  25.0, 2275.0, True,  True),
        (1424.0, 1162.0, 19.0, 15.0, -16.0, 2330.0, False, True),
        (1454.0, 1138.0, 17.5, 13.8,  34.0, 2365.0, False, False),
        (1412.0, 1132.0, 18.0, 14.2,  19.0, 2355.0, False, True),
        (1396.0, 1142.0, 15.0, 12.0, -28.0, 2390.0, False, False),
        (1434.0, 1118.0, 14.0, 11.2, -26.0, 2420.0, False, False),
        (1446.0, 1172.0, 14.5, 11.5,  15.0, 2395.0, False, False),
        (1470.0, 1120.0, 11.2,  9.0,  22.0, 2495.0, False, False),
    ]

    jag_a = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 1.8)
    jag_b = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 0.9)
    jag_field = jag_a / (np.std(jag_a) + 1e-9) * 0.12 + jag_b / (np.std(jag_b) + 1e-9) * 0.05

    pit_depth_weight = np.zeros((VH, VW), dtype=float)
    pit_floor_elev = h_se_plateau.copy()
    pit_rim_tuff = np.zeros((VH, VW), dtype=float)
    pit_lake_mask = np.zeros((VH, VW), dtype=bool)
    pit_lake_lev = np.full((VH, VW), np.nan, dtype=float)

    r1_min = np.full((VH, VW), 99.0, dtype=float)
    r2_min = np.full((VH, VW), 99.0, dtype=float)

    for idx_p, (xc, yc, rx, ry, rot_d, fl_m, has_lk, has_bench) in enumerate(siphon_pits):
        ang = math.radians(rot_d)
        dx_p = (px - xc) * 2.0
        dy_p = (py - yc) * 2.0
        u_p = dx_p * math.cos(ang) + dy_p * math.sin(ang)
        v_p = -dx_p * math.sin(ang) + dy_p * math.cos(ang)
        theta_p = np.arctan2(v_p, u_p)
        lobe_warp = (
            1.0
            + 0.10 * np.cos(2.0 * theta_p + idx_p * 1.3)
            + 0.07 * np.sin(3.0 * theta_p - idx_p * 0.7)
            + jag_field
        )
        r_norm = np.hypot(u_p / rx, v_p / ry) * np.clip(lobe_warp, 0.72, 1.30)

        swap = r_norm < r1_min
        r2_min = np.where(swap, r1_min, np.minimum(r2_min, r_norm))
        r1_min = np.where(swap, r_norm, r1_min)

        if has_bench:
            w_inner_floor = 1.0 - G.sstep(0.52, 0.74, r_norm)
            w_outer_wall = 1.0 - G.sstep(0.76, 1.04, r_norm)
            w_pit = 0.74 * w_outer_wall + 0.26 * w_inner_floor
        else:
            w_pit = 1.0 - G.sstep(0.54, 1.02, r_norm)

        pit_depth_weight = np.maximum(pit_depth_weight, w_pit)
        fl_local = fl_m + 52.0 * np.clip(r_norm / 0.64, 0.0, 1.0) ** 2
        pit_floor_elev = np.where(w_pit > 0.02, np.minimum(pit_floor_elev, fl_local), pit_floor_elev)

        tuff_amp = 160.0 if rx >= 18.0 else 115.0
        tuff_ring = tuff_amp * np.exp(-((r_norm - 1.08) / 0.22) ** 2)
        pit_rim_tuff = np.maximum(pit_rim_tuff, tuff_ring)

        if has_lk:
            lk_m = (r_norm <= 0.34)
            pit_lake_mask |= lk_m
            pit_lake_lev = np.where(lk_m, fl_m + 14.0, pit_lake_lev)
            pit_floor_elev = np.where(lk_m, fl_m - 6.0 + 18.0 * (r_norm / 0.34), pit_floor_elev)

    septum_match = np.exp(-((r1_min - r2_min) / 0.11) ** 2)
    septum_zone = np.exp(-((0.5 * (r1_min + r2_min) - 0.82) / 0.18) ** 2)
    arete_bridge_w = septum_match * septum_zone
    pit_depth_weight = np.clip(pit_depth_weight * (1.0 - 0.82 * arete_bridge_w), 0.0, 1.0)
    pit_rim_tuff = pit_rim_tuff + 175.0 * arete_bridge_w

    basalt_micro = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 1.1)
    basalt_micro = basalt_micro / (np.std(basalt_micro) + 1e-9) * 28.0

    h_se_with_pits = (
        (h_se_plateau + pit_rim_tuff + basalt_micro) * (1.0 - pit_depth_weight)
        + (pit_floor_elev + basalt_micro * 0.25) * pit_depth_weight
    )

    h_sp_interior = h_ostrukh * (1.0 - scarp_stair) + h_se_with_pits * scarp_stair + scarp_spurs
    h_sp_interior = h_sp_interior * (1.0 - w_ost_pool) + h_ost_bed * w_ost_pool

    pass_curve = 4.5 * np.sin(scarp_u * 0.16 + 0.4)
    d_pass_perp = np.abs(scarp_v - pass_curve)
    d_pass_along = np.abs(scarp_u - 3.0)
    w_pass = (1.0 - G.sstep(2.8, 11.5, d_pass_perp)) * (1.0 - G.sstep(10.0, 28.0, d_pass_along))
    h_pass_floor = 2480.0 + 48.0 * np.clip(scarp_u + 14.0, 0.0, 36.0)
    h_sp_interior = h_sp_interior * (1.0 - 0.75 * w_pass) + np.minimum(h_sp_interior, h_pass_floor) * (0.75 * w_pass)

    return (
        h_sp_interior, scarp_u, pit_depth_weight, pit_rim_tuff,
        pit_lake_mask, pit_lake_lev, r_ost_km, w_ost_pool
    )


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
    global D_LO_HI
    subprocess.check_call(['git', 'checkout', BASE_COMMIT, '--', 'tools/scale-model/model/data/'], cwd=REPO_ROOT)

    D = P.load()
    D_LO_HI = (D['lo'], D['hi'])
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    su, sv = P.grid(D)
    OH, OW = D['fullH'], D['fullW']
    VH, VW = Eo.shape
    Y, X = np.indices((VH, VW))
    px = X / su
    py = Y / sv

    R = P.docs(os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'regions.json'))
    r99 = next(r for r in R if r['id'] == R99_ID)
    sp_reg = next(r for r in R if r['id'] == SIPHON_ID)
    mb_reg = next(r for r in R if r['id'] == MID_BASIN_ID)
    sg_reg = next(r for r in R if r['id'] == STALKER_GATE_ID)
    hr_reg = next(r for r in R if r['id'] == HIGH_RIFT_ID)

    pts99, pts_sp, pts_mb, pts_sg, pts_hr = (
        r99['points'], sp_reg['points'], mb_reg['points'], sg_reg['points'], hr_reg['points']
    )

    mask99_h = G.poly(pts99, su, sv, (VH, VW))
    mask_sp_h = G.poly(pts_sp, su, sv, (VH, VW))
    mask_mb_h = G.poly(pts_mb, su, sv, (VH, VW))
    mask_sg_h = G.poly(pts_sg, su, sv, (VH, VW))
    mask_hr_h = G.poly(pts_hr, su, sv, (VH, VW))

    mask99_f = G.poly(pts99, 1.0, 1.0, (OH, OW))
    mask_sp_f = G.poly(pts_sp, 1.0, 1.0, (OH, OW))
    mask_mb_f = G.poly(pts_mb, 1.0, 1.0, (OH, OW))
    mask_sg_f = G.poly(pts_sg, 1.0, 1.0, (OH, OW))
    mask_hr_f = G.poly(pts_hr, 1.0, 1.0, (OH, OW))

    # Include the circular Hub 01 high valley in Stalker Range (`px [1072, 1081]`) so Pass 4A connects cleanly
    hub_mask_h = np.hypot((px - 1072.0) * 2.0, (py - 1081.0) * 2.0) <= 38.0
    hub_mask_f = np.hypot(( np.indices((OH, OW))[1] - 1072.0) * 2.0, (np.indices((OH, OW))[0] - 1081.0) * 2.0) <= 38.0

    # Union mask across all 5 contiguous Southeastern regions (closing 1-cell shared polygon seams!)
    union_raw_h = mask99_h | mask_sp_h | mask_mb_h | mask_sg_h | mask_hr_h | hub_mask_h
    mask_union_h = nd.binary_closing(union_raw_h, iterations=2)
    mask_union_f = nd.binary_closing(mask99_f | mask_sp_f | mask_mb_f | mask_sg_f | mask_hr_f | hub_mask_f, iterations=3)

    dist_union_h = nd.distance_transform_edt(mask_union_h)
    Eo_harm_union = harmonic_fill(Eo, mask_union_h, dist_union_h, pad=1.8)
    Eo_low = nd.gaussian_filter(Eo, sigma=6.5)
    Eo_ridge_detail = (Eo - Eo_low) * (1.0 - G.sstep(4.5, 13.0, dist_union_h))

    rs_main = np.random.RandomState(SEED)
    n1 = nd.gaussian_filter(rs_main.normal(0.0, 1.0, (VH, VW)), 2.1)
    proc_rim_ridges = (n1 / (np.std(n1) + 1e-9) * 165.0) * G.sstep(2.5, 9.5, dist_union_h)

    warp_u = (
        0.21 * np.sin(px * 0.044 + py * 0.038 + 0.8)
        + 0.14 * np.cos(px * 0.072 - py * 0.060 + 1.7)
        + 0.09 * np.sin(px * 0.130 + py * 0.105 - 1.5)
    )
    dist_union_org = dist_union_h * np.clip(1.0 + warp_u, 0.60, 1.48)

    print('--- Step 1: Sculpting Integrated 5-Region Southeastern Complex ---')
    # 1A. Loom-Chasms interior
    h_loom_int, r_nim_km, r_cael_km, x_tect_h, chasm_depth_h, u_mono_h = build_loom_interior(Eo, su, sv)

    # 1B. Siphon Pits interior
    (h_sp_int, scarp_u_h, pit_depth_h, pit_tuff_h,
     pit_lake_mask, pit_lake_lev, r_ost_km, w_ost_pool) = build_siphon_interior(Eo, su, sv)

    # 1C. Mid Basin interior (transitional hinge zone between Siphon Pits and Loom-Chasms)
    (h_mb_int, mb_pit_weight_h, mb_tuff_h,
     mb_pool_mask, mb_pool_lev, v_hinge_h) = SE.build_mid_basin_terrain(
        px, py, np.random.RandomState(SEED + 101), x_tect_h, chasm_depth_h, scarp_u_h
    )

    # 1D. Stalker Gate interior (domain-warped meandering mountain & highland pass network)
    (h_sg_int, sg_pass_w_h, sg_dnorm_h,
     r_vap_km, vap_lev, r_tarn_km, tarn_lev, w_hub_h) = SE.build_stalker_gate_terrain(
        px, py, Eo, mask_sg_h | hub_mask_h, np.random.RandomState(SEED + 102)
    )

    # 1E. High Rift interior (5-zone propagating rift staircase)
    (h_hr_int, hr_north_g_h, hr_south_g_h, hr_horst_h, hr_gjar_h,
     r_cald_km, cald_lev, r_verd_km, verd_lev, r_cinn_km, cinn_lev) = SE.build_high_rift_terrain(
        px, py, Eo, mask_hr_h, np.random.RandomState(SEED + 100)
    )

    # Smooth partition-of-unity weights across the 5 contiguous regions so internal polygon seams have ZERO cliff jumps!
    w99 = nd.gaussian_filter(mask99_h.astype(float), sigma=4.2)
    wmb = nd.gaussian_filter(mask_mb_h.astype(float), sigma=4.2)
    wsp = nd.gaussian_filter(mask_sp_h.astype(float), sigma=4.2)
    wsg = nd.gaussian_filter((mask_sg_h | hub_mask_h).astype(float), sigma=3.8)
    whr = nd.gaussian_filter(mask_hr_h.astype(float), sigma=3.5)

    w_sum = np.maximum(w99 + wmb + wsp + wsg + whr, 1e-6)
    h_combined_int = (
        w99 * h_loom_int
        + wmb * h_mb_int
        + wsp * h_sp_int
        + wsg * h_sg_int
        + whr * h_hr_int
    ) / w_sum

    # Where Stalker Gate's meandering passes cross into Weavers' Cradle, Mid Basin, or Ostrukh Terraces,
    # ensure the pass thalwegs remain completely open and unblocked across the boundary!
    pass_bridge_zone = (wsg > 0.08) & (sg_pass_w_h > 0.25)
    h_combined_int = np.where(
        pass_bridge_zone,
        h_combined_int * (1.0 - 0.65 * sg_pass_w_h) + np.minimum(h_combined_int, h_sg_int) * (0.65 * sg_pass_w_h),
        h_combined_int
    )

    # Fluvial Stream-Power Weathering (`T.weather`) across the transitions, scarps, and Stalker Gate passes
    # so dendritic valleys and alluvial fans look 100% natural!
    all_lake_beds_h = (
        (r_nim_km <= 15.5) | (r_ost_km <= 13.5) | pit_lake_mask | mb_pool_mask
        | (r_vap_km <= 12.0) | (r_tarn_km <= 7.5)
        | (r_cald_km <= 9.5) | (r_verd_km <= 13.5) | (r_cinn_km <= 10.5)
    )
    weather_zone = mask_union_h & (dist_union_h > 4.0) & ~all_lake_beds_h & (
        mask_sg_h | mask_mb_h | mask_hr_h
        | ((r_cael_km >= 5.5) & (r_cael_km <= 43.0))
        | ((u_mono_h > 0.05) & (u_mono_h < 0.95))
        | ((scarp_u_h > -32.0) & (scarp_u_h < 26.0))
    )
    h_combined_int = T.weather(h_combined_int, weather_zone)
    h_combined_int = T.weather(h_combined_int, weather_zone & (mask_sg_h | mask_mb_h | mask_hr_h))

    # Outer Perimeter Rim Blending:
    # - Along the high outer crater wall & Stalker Range peaks, blend smoothly from `Eo` at `dist_union_h <= 1.5`
    #   into `h_combined_int` over `dist_union_org` (wider amphitheater wall in Region 99 NE/E, tighter in High Rift
    #   and pass mouths where the exterior terrain is already at ~1,700-2,200 m!).
    is_pass_throat_h = (
        # Oidong Valley West Gate of High Rift (`px 1020..1048, py 1305..1355`)
        ((px <= 1048.0) & (py >= 1304.0) & (py <= 1356.0))
        # Yuni / Krikki NW Gate of Stalker Gate (`px 1058..1115, py 760..815`)
        | ((px <= 1118.0) & (py >= 758.0) & (py <= 818.0))
        # Hub 01 SW Valley connection (`px 1050..1105, py 1050..1110`)
        | hub_mask_h
    )
    rim_ne_w = (1.0 - G.sstep(870.0, 955.0, py)) * G.sstep(1210.0, 1265.0, px)
    rim_width_scale = np.where(
        is_pass_throat_h,
        0.25,
        0.48 + 0.52 * rim_ne_w
    )
    eff_dist_org = dist_union_org / np.maximum(rim_width_scale, 0.20)

    w_outer = G.sstep(1.5, 5.8, dist_union_h)
    w_basin = G.sstep(3.8, 17.5, eff_dist_org)

    rim_with_ridges = Eo_harm_union + Eo_ridge_detail + proc_rim_ridges * (1.0 - w_basin)
    h_blended = rim_with_ridges * (1.0 - w_basin) + h_combined_int * w_basin

    En = np.where(mask_union_h, Eo * (1.0 - w_outer) + h_blended * w_outer, Eo)
    En = np.clip(En, D_LO_HI[0], D_LO_HI[1])

    # Set Water Masks & Exact Lake Levels across all 5 regions
    whas2 = whas0.copy()
    wlev2 = wlev0.copy()
    clear_water = mask_union_h & (dist_union_h >= 3.0)
    whas2[clear_water] = False
    wlev2[clear_water] = np.nan

    # 1. Lake Nim (+240.0 m, `WX` hypersaline playa sink in Region 99)
    lake_nim_mask = mask99_h & (r_nim_km <= 14.6) & (En < LAKE_NIM_LEV - 0.5)
    whas2[lake_nim_mask] = True
    wlev2[lake_nim_mask] = LAKE_NIM_LEV
    En = np.where((mask99_h & (dist_union_h >= 4.5)) & ~lake_nim_mask, np.maximum(En, LAKE_NIM_LEV + 1.5), En)

    # 2. Fresh Lake Ostrukh (+1,850.0 m, `WH` in NW Siphon Pits) & 4 Maar Crater Lakes (`WH` in SE Siphon Pits)
    ostrukh_lake_mask = mask_sp_h & (dist_union_h >= 4.0) & (r_ost_km <= 12.2) & (En < OSTRUKH_LAKE_LEV - 0.5)
    whas2[ostrukh_lake_mask] = True
    wlev2[ostrukh_lake_mask] = OSTRUKH_LAKE_LEV

    maar_lakes_mask = mask_sp_h & (dist_union_h >= 4.0) & pit_lake_mask & (pit_depth_h > 0.82)
    whas2[maar_lakes_mask] = True
    wlev2[maar_lakes_mask] = pit_lake_lev[maar_lakes_mask]

    nw_sp_dry = mask_sp_h & (dist_union_h >= 3.5) & (scarp_u_h < 0.0) & ~ostrukh_lake_mask
    En = np.where(nw_sp_dry, np.maximum(En, OSTRUKH_LAKE_LEV + 1.5), En)

    # 3. Mid Basin: Siphon-Breach Artesian Pool (+2,040.0 m, `WH` at `[1312, 1018]`)
    mb_lake_mask = mask_mb_h & mb_pool_mask & (mb_pit_weight_h > 0.80)
    whas2[mb_lake_mask] = True
    wlev2[mb_lake_mask] = mb_pool_lev[mb_lake_mask]

    # 4. Stalker Gate: Lake Vapora (+1,910.0 m, `WH` at `[1152, 908]`) & Gate Tarn (+2,460.0 m, `WH` at `[1172, 816]`)
    vapora_mask = mask_sg_h & (dist_union_h >= 3.5) & (r_vap_km <= 10.8)
    En = np.where(vapora_mask, np.minimum(En, vap_lev - 6.0), En)
    whas2[vapora_mask] = True
    wlev2[vapora_mask] = vap_lev

    tarn_mask = mask_sg_h & (dist_union_h >= 3.5) & (r_tarn_km <= 6.2)
    En = np.where(tarn_mask, np.minimum(En, tarn_lev - 5.0), En)
    whas2[tarn_mask] = True
    wlev2[tarn_mask] = tarn_lev

    # 5. High Rift: The Caldron Pool (+2,580 m), Lake Verdigris (+2,880 m), and Lake Cinnabar (+3,120 m)
    cald_mask = mask_hr_h & (dist_union_h >= 2.8) & (r_cald_km <= 7.8)
    En = np.where(cald_mask, np.minimum(En, cald_lev - 6.0), En)
    whas2[cald_mask] = True
    wlev2[cald_mask] = cald_lev

    verd_mask = mask_hr_h & (dist_union_h >= 2.8) & (r_verd_km <= 11.2)
    En = np.where(verd_mask, np.minimum(En, verd_lev - 8.0), En)
    whas2[verd_mask] = True
    wlev2[verd_mask] = verd_lev

    cinn_mask = mask_hr_h & (dist_union_h >= 2.8) & (r_cinn_km <= 8.5)
    En = np.where(cinn_mask, np.minimum(En, cinn_lev - 6.0), En)
    whas2[cinn_mask] = True
    wlev2[cinn_mask] = cinn_lev

    edge_union = mask_union_h & (dist_union_h <= 1.5)
    max_edge_delta = float(np.abs(En[edge_union] - Eo[edge_union]).max())
    print('  Union outer boundary delta: %.3f m' % max_edge_delta)
    for nm, m_ in (
        ('Region 99 (Loom-Chasms)', mask99_h),
        ('Siphon Pits', mask_sp_h),
        ('Mid Basin', mask_mb_h),
        ('Stalker Gate', mask_sg_h),
        ('High Rift', mask_hr_h),
    ):
        print('  %-25s elev: min %6.1f m | med %6.1f m | max %7.1f m' % (
            nm, En[m_].min(), np.median(En[m_]), En[m_].max()
        ))
    assert max_edge_delta < 5.0, f'Outer boundary jump too large: {max_edge_delta}'

    # --- Step 2: Update Temperatures via Lapse Rate (-6.5 C/km) + Geothermal & Foehn Boosts ---
    print('--- Step 2: Updating 5 Temperature Rasters (C.lapse + Geothermal & Foehn Microclimates) ---')
    lapsed_temps = C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2)
    for k, v in lapsed_temps.items():
        D[k] = v

    zoom = (OH / VH, OW / VW)
    EoF = nd.zoom(Eo, zoom, order=1)[:OH, :OW]
    EnF = nd.zoom(En, zoom, order=1)[:OH, :OW]
    distUnionF = nd.zoom(dist_union_h, zoom, order=1)[:OH, :OW]
    distUnionOrgF = nd.zoom(dist_union_org, zoom, order=1)[:OH, :OW]

    xTectF = nd.zoom(x_tect_h, zoom, order=1)[:OH, :OW]
    chasmF = nd.zoom(chasm_depth_h, zoom, order=1)[:OH, :OW]
    rNimF = nd.zoom(r_nim_km, zoom, order=1)[:OH, :OW]
    rCaelF = nd.zoom(r_cael_km, zoom, order=1)[:OH, :OW]

    scarpUF = nd.zoom(scarp_u_h, zoom, order=1)[:OH, :OW]
    pitDepthF = nd.zoom(pit_depth_h, zoom, order=1)[:OH, :OW]
    pitTuffF = nd.zoom(pit_tuff_h, zoom, order=1)[:OH, :OW]
    rOstF = nd.zoom(r_ost_km, zoom, order=1)[:OH, :OW]

    mbPitF = nd.zoom(mb_pit_weight_h, zoom, order=1)[:OH, :OW]
    mbTuffF = nd.zoom(mb_tuff_h, zoom, order=1)[:OH, :OW]
    vHingeF = nd.zoom(v_hinge_h, zoom, order=1)[:OH, :OW]

    sgPassWF = nd.zoom(sg_pass_w_h, zoom, order=1)[:OH, :OW]
    rVapF = nd.zoom(r_vap_km, zoom, order=1)[:OH, :OW]

    hrNorthGF = nd.zoom(hr_north_g_h, zoom, order=1)[:OH, :OW]
    hrSouthGF = nd.zoom(hr_south_g_h, zoom, order=1)[:OH, :OW]
    hrHorstF = nd.zoom(hr_horst_h, zoom, order=1)[:OH, :OW]
    hrGjarF = nd.zoom(hr_gjar_h, zoom, order=1)[:OH, :OW]

    wet0F = nd.zoom(whas0.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)
    wet2F = nd.zoom(whas2.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)

    w_inner_u = G.sstep(2.0, 8.0, distUnionOrgF) * mask_union_f.astype(float)
    geothermal_boost = (
        7.5 * G.sstep(0.35, 0.85, pitDepthF) * mask_sp_f
        + 6.0 * G.sstep(0.35, 0.85, mbPitF) * mask_mb_f
        + 4.5 * (1.0 - G.sstep(8.0, 28.0, rVapF)) * mask_sg_f
        + 4.0 * np.maximum(hrNorthGF, hrSouthGF) * mask_hr_f
    ) * w_inner_u
    foehn_boost = (
        3.5 * (1.0 - G.sstep(-12.0, 10.0, scarpUF)) * G.sstep(2800.0, 2100.0, EnF) * (mask_sp_f | mask_mb_f)
        + 3.0 * sgPassWF * G.sstep(2600.0, 1950.0, EnF) * mask_sg_f
    ) * w_inner_u
    temp_boost = geothermal_boost + foehn_boost

    for k in ('tm', 'th', 'tl', 'tw', 'tc'):
        arr_t = P.raster(D, k, 'L').astype(float) - 90.0
        valid_t = arr_t > -89.0
        arr_t = np.where(valid_t & (temp_boost > 0.05), np.round(arr_t + temp_boost), arr_t)
        D[k] = P.b64(Image.fromarray(np.clip(arr_t + 90.0, 0, 255).astype(np.uint8), 'L'), optimize=True)

    # --- Step 3: Add New Monotone River Courses Across Stalker Gate, Mid Basin & High Rift ---
    print('--- Step 3: Routing Rivers Across Stalker Gate, Mid Basin & High Rift ---')
    def _meander_pts(ctrl_pts, seed_r=0):
        arr = SE._catmull_rom_chain([(p[0], p[1], 0.0, 0.0) for p in ctrl_pts], n_per_seg=10)[:, :2]
        out = []
        n_tot = len(arr)
        for i, (rx_, ry_) in enumerate(arr):
            if 0 < i < n_tot - 1:
                tx = arr[min(n_tot - 1, i + 1), 0] - arr[max(0, i - 1), 0]
                ty = arr[min(n_tot - 1, i + 1), 1] - arr[max(0, i - 1), 1]
                ln = math.hypot(tx, ty) + 1e-6
                nx, ny = -ty / ln, tx / ln
                env = math.sin(math.pi * i / float(n_tot - 1))
                wob = env * (2.6 * math.sin(i * 0.65 + seed_r) + 1.4 * math.cos(i * 1.15 - seed_r * 0.7))
                rx_ += nx * wob
                ry_ += ny * wob
            out.append([round(float(rx_), 1), round(float(ry_), 1)])
        return out

    new_rivers = [
        {
            'id': 'r_sg_vapora_bigga',
            'name': 'Krikki Gorge Run',
            'tongue': 'english',
            'gloss': 'English: river draining Lake Vapora through the Krikki Winding Gorge into the Bigga',
            'kind': 'river',
            'px': _meander_pts([[1150.0, 902.0], [1134.0, 876.0], [1124.0, 854.0], [1112.0, 818.0], [1084.0, 790.0], [1060.0, 781.0]], 1),
        },
        {
            'id': 'r_mb_siphon_breach',
            'name': 'Siphon-Breach Cascade',
            'tongue': 'english',
            'gloss': 'English: artesian spring river rising in Mid Basin\'s breached maar and cascading into the Loom-Chasms',
            'kind': 'river',
            'px': _meander_pts([[1354.0, 1036.0], [1332.0, 1029.0], [1312.0, 1018.0], [1319.0, 986.0], [1314.0, 952.0], [1331.0, 918.0], [1346.0, 884.0]], 2),
        },
        {
            'id': 'r_hr_verdigris',
            'name': 'Verdigris Run',
            'tongue': 'english',
            'gloss': 'English: axial rift river linking the Singing Gjar, Lake Cinnabar, Lake Verdigris, and the Opaline Cataract into Oidong Valley',
            'kind': 'river',
            'px': _meander_pts([[1296.0, 1310.0], [1258.0, 1306.0], [1220.0, 1304.0], [1188.0, 1305.0], [1158.0, 1306.0], [1122.0, 1314.0], [1082.0, 1331.0], [1054.0, 1326.0], [1028.0, 1321.0]], 3),
        },
        {
            'id': 'r_hr_jokulhlaup',
            'name': 'Fire-Ice Torrent',
            'tongue': 'english',
            'gloss': 'English: sub-glacial geothermal stream draining the South Fire-and-Ice Coulee into the Caldron Pool',
            'kind': 'river',
            'px': _meander_pts([[1232.0, 1354.0], [1192.0, 1354.0], [1148.0, 1352.0], [1112.0, 1344.0], [1082.0, 1331.0]], 4),
        },
    ]
    existing_r_ids = {r.get('id') for r in D['rivers']}
    for nr in new_rivers:
        if nr['id'] not in existing_r_ids:
            D['rivers'].append(nr)

    old_riv_mask = Image.new('L', (OW, OH), 0)
    dr_old = ImageDraw.Draw(old_riv_mask)
    for r in D['rivers']:
        pts_r = r.get('px') or []
        if not pts_r:
            continue
        if any(0 <= int(py_) < OH and 0 <= int(px_) < OW and mask_union_f[int(py_), int(px_)] for px_, py_ in pts_r):
            if r.get('kind') == 'river' and not str(r.get('id', '')).startswith('r_'):
                dr_old.line([tuple(p) for p in pts_r], fill=1, width=5)
    old_riv_f = np.array(old_riv_mask, dtype=bool) & mask_union_f

    custom_names = [
        ('Weavers\' Run', 'English: the main glacial river watering Weavers\' Cradle'),
        ('Caelum Rill', 'English: meltwater stream descending Mount Caelum'),
        ('Warp Gorge River', 'English: canyon river threading the central Loom-Chasm'),
        ('Spindle Wash', 'English: braided stream crossing Mid Basin and the Fluted Monocline'),
        ('Shuttle Creek', 'English: brine stream feeding Lake Nim'),
        ('Halite Draw', 'English: seasonal salt wadi entering the White Loom'),
        ('Ostrukh River', 'English: glacial meltwater river watering the Ostrukh Terraces'),
        ('Scarp Gorge Run', 'English: stream descending the Scarp Pass into Lake Ostrukh'),
        ('Siphon Melt', 'English: runoff channel draining the northwest Siphon Pits'),
        ('Vapora Creek', 'English: stream feeding Lake Vapora in Stalker Gate'),
        ('Ostrukh Sill Wash', 'English: wadi threading the Ostrukh Meander pass'),
    ]
    name_idx = 0
    rivers_touched = 0
    for r in D['rivers']:
        pts_r = r.get('px') or []
        if not pts_r:
            continue
        in_edit = any(0 <= int(py_) < OH and 0 <= int(px_) < OW and mask_union_f[int(py_), int(px_)] for px_, py_ in pts_r)
        if not in_edit:
            continue
        rivers_touched += 1
        beds = []
        for px_, py_ in pts_r:
            iy = min(OH - 1, max(0, int(round(py_))))
            ix = min(OW - 1, max(0, int(round(px_))))
            beds.append(round(float(EnF[iy, ix]), 1))
        for i in range(1, len(beds)):
            if beds[i] > beds[i - 1]:
                beds[i] = beds[i - 1]
        r['bed_m'] = beds
        r['source_m'] = beds[0]
        r['mouth_m'] = beds[-1]
        if r.get('name', '').startswith('unnamed') and name_idx < len(custom_names):
            nm, gl = custom_names[name_idx]
            name_idx += 1
            r['name'] = nm
            r['tongue'] = 'english'
            r['gloss'] = gl

    print(f'  Rivers updated across 5-region complex: {rivers_touched} | Climbing rivers: 0')

    # --- Step 4: Recompute Rain, Exotic Climate Classes, and Hypsometric Zones ---
    print('--- Step 4: Updating Rain, Exotic Climate Classes, and Zones Across All 5 Regions ---')
    cls0 = P.raster(D, 'c', 'L')
    YF, XF = np.indices((OH, OW))

    river_corr_img = Image.new('L', (OW, OH), 0)
    dr_rc = ImageDraw.Draw(river_corr_img)
    for r in D['rivers']:
        pts_r = r.get('px') or []
        if r.get('kind', 'river') != 'river' or len(pts_r) < 5:
            continue
        # Only draw multi-vertex natural rivers outside Region 99 into the broad river-corridor mask
        if str(r.get('id', '')).startswith('r_'):
            continue
        if any(0 <= int(py_) < OH and 0 <= int(px_) < OW and mask99_f[int(py_), int(px_)] for px_, py_ in pts_r):
            continue
        dr_rc.line([tuple(p) for p in pts_r], fill=1, width=5)
    # In Region 99 (Weavers' Cradle), place a braided alluvial snowmelt fan around Spindle Fan [1289, 810]
    dx_sf = XF - 1272.0
    dy_sf = YF - 810.0
    ang_sf = np.arctan2(dy_sf, np.maximum(dx_sf, 1.0))
    r_sf = np.hypot(dx_sf * 0.95, dy_sf * 1.15) * (1.0 + 0.28 * np.cos(5.0 * ang_sf + 0.4) + 0.18 * np.sin(8.0 * ang_sf))
    spindle_fan_oasis = mask99_f & (dx_sf >= -6.0) & (r_sf <= 22.0) & (EnF >= 1820.0) & (EnF <= 2480.0)
    oas_noise = nd.gaussian_filter(np.random.RandomState(SEED + 33).normal(0.0, 1.0, (OH, OW)), 2.5)
    river_corr_f = ((np.array(river_corr_img, dtype=float) + 0.35 * oas_noise) > 0.45) | spindle_fan_oasis

    # Oases in Region 99: restricted to Spindle Fan snowmelt bajada, Mount Caelum's radial glacial meltwater apron,
    # and the westernmost piedmont spring-line alcoves (leaving the central/eastern Warp Chasms as dry rock gorges!)
    oasis99_river = spindle_fan_oasis & (distUnionOrgF >= 6.0)
    oasis99_caelum = mask99_f & (rCaelF >= 14.0) & (rCaelF <= 34.0) & (chasmF >= 0.48) & (EnF < 1650.0)
    oasis99_spring = mask99_f & (chasmF >= 0.55) & (xTectF < 1334.0) & (YF >= 785.0) & (YF <= 885.0) & (EnF < 1250.0)
    oasis99_f = nd.binary_closing(oasis99_river | oasis99_caelum | oasis99_spring, iterations=1) & mask99_f
    spill99 = mask99_f & (distUnionOrgF >= 5.0) & (distUnionOrgF < 28.0)

    # Oases in Siphon Pits
    lake_pits = ((1412.0, 1222.0), (1346.0, 1246.0), (1354.0, 1168.0), (1440.0, 1152.0))
    near_lake_pit = np.zeros((OH, OW), dtype=bool)
    for lx, ly in lake_pits:
        near_lake_pit |= np.hypot(XF - lx, YF - ly) < 11.0
    oasis_sp_shore = mask_sp_f & (rOstF < 26.0) & (scarpUF < 2.0)
    oasis_sp_river = river_corr_f & mask_sp_f & (scarpUF < 4.0) & (EnF < 2800.0)
    oasis_sp_pit = mask_sp_f & near_lake_pit & (pitDepthF >= 0.70)
    oasis_sp_f = (oasis_sp_shore | oasis_sp_river | oasis_sp_pit) & mask_sp_f

    # Oases in Mid Basin (concentrated in the breached maar amphitheater floors, not straight lines!)
    oasis_mb_f = mask_mb_f & (mbPitF >= 0.65)

    # Oases in Stalker Gate (Lake Vapora shore & Weavers' Breach spring fan)
    oasis_sg_f = mask_sg_f & ((rVapF < 18.0) | (river_corr_f & (EnF < 2250.0) & (sgPassWF > 0.55)))

    # Oases in High Rift (Opaline Sinter Staircase & Lake Verdigris / Cinnabar shores)
    oasis_hr_f = mask_hr_f & ((XF < 1112.0) & (EnF < 2850.0) | (hrNorthGF > 0.45) & (EnF < 3180.0))

    oasis_all_f = oasis99_f | oasis_sp_f | oasis_mb_f | oasis_sg_f | oasis_hr_f

    # Target rain across the 5-region complex
    w_west_rain = 1.0 - G.sstep(1275.0, 1332.0, xTectF)
    w_cael_rain = (1.0 - G.sstep(10.0, 44.0, rCaelF)) * G.sstep(1500.0, 3400.0, EnF)
    w_rim_rain = G.sstep(3100.0, 5600.0, EnF)
    rain_99 = (
        62.0 + 28.0 * np.sin(XF * 0.025 + YF * 0.022)
        + 40.0 * chasmF * (1.0 - G.sstep(22.0, 48.0, rNimF))
        + 150.0 * w_west_rain * (1.0 - G.sstep(3400.0, 5600.0, EnF))
        + 120.0 * spill99 * (EnF < 3600.0)
        + 200.0 * w_cael_rain
        + 240.0 * w_rim_rain * (1.0 - G.sstep(6800.0, 8800.0, EnF))
    )
    rain_sp = (
        150.0 + 25.0 * np.cos(XF * 0.03 - YF * 0.025)
        + 95.0 * (1.0 - G.sstep(-10.0, 16.0, scarpUF)) * (1.0 - G.sstep(2900.0, 4200.0, EnF))
        + 110.0 * G.sstep(0.30, 0.80, pitDepthF)
    )
    rain_mb = (
        165.0 + 30.0 * np.sin(XF * 0.03 + YF * 0.025)
        + 85.0 * (1.0 - G.sstep(-8.0, 16.0, scarpUF))
        + 135.0 * G.sstep(0.30, 0.80, mbPitF)
    )
    rain_sg = (
        220.0 + 180.0 * (1.0 - G.sstep(1070.0, 1185.0, XF)) * (1.0 - G.sstep(765.0, 920.0, YF))
        + 130.0 * sgPassWF
    )
    rain_hr = (
        220.0 + 280.0 * (1.0 - G.sstep(1025.0, 1145.0, XF))
        + 120.0 * np.maximum(hrNorthGF, hrSouthGF)
    )

    # Smooth full-resolution partition-of-unity weights so internal polygon transitions have zero straight color seams!
    w99_f_raw = nd.gaussian_filter(mask99_f.astype(float), sigma=12.0)
    wsp_f_raw = nd.gaussian_filter(mask_sp_f.astype(float), sigma=12.0)
    wmb_f_raw = nd.gaussian_filter(mask_mb_f.astype(float), sigma=12.0)
    wsg_f_raw = nd.gaussian_filter((mask_sg_f | hub_mask_f).astype(float), sigma=10.0)
    whr_f_raw = nd.gaussian_filter(mask_hr_f.astype(float), sigma=10.0)
    w_tot_f = np.maximum(w99_f_raw + wsp_f_raw + wmb_f_raw + wsg_f_raw + whr_f_raw, 1e-6)
    p99_f = w99_f_raw / w_tot_f
    psp_f = wsp_f_raw / w_tot_f
    pmb_f = wmb_f_raw / w_tot_f
    psg_f = wsg_f_raw / w_tot_f
    phr_f = whr_f_raw / w_tot_f

    target_rain = (
        p99_f * rain_99
        + psp_f * rain_sp
        + pmb_f * rain_mb
        + psg_f * rain_sg
        + phr_f * rain_hr
    )
    target_rain = np.where(oasis_all_f, np.maximum(target_rain, 440.0), target_rain)
    target_rain = np.where(EnF >= 8800.0, 0.0, np.clip(target_rain, 24.0, 1200.0))
    w_rain_blend = G.sstep(1.2, 5.5, distUnionF) * mask_union_f.astype(float)

    forced = np.zeros((OH, OW), dtype=bool)
    rain2, cls2, zon2, q_changed, clim_rep = C.reclimate(
        D, Eo, En, whas2, forced, force_rain=(target_rain, w_rain_blend)
    )

    codes = [c['code'] for c in D['climate']['classes']]
    idx = {c: i for i, c in enumerate(codes)}
    tmF = P.raster(D, 'tm', 'L').astype(float) - 90.0

    # --- 4A. Region 99 Climate & Exotic Classes (`WX`, `XS`, `XW`, `Cwb`, `Cwc`, `Csa`, `Csb`, `Dsb`, `Dsc`, `HT`) ---
    inner99_f = mask99_f & (distUnionF >= 1.5) & ~wet2F
    # Deepest eastern chasm trenches -> Exotic `XW` (abyssal desert) & `BWh`/`BWk`
    deep_f = inner99_f & (EnF < 460.0) & (chasmF > 0.55) & (xTectF > 1345.0)
    cls2[deep_f & (EnF < 375.0) & (chasmF > 0.62)] = idx['XW']
    cls2[deep_f & ~((EnF < 375.0) & (chasmF > 0.62)) & (tmF >= 18.0)] = idx['BWh']
    cls2[deep_f & ~((EnF < 375.0) & (chasmF > 0.62)) & (tmF < 18.0)] = idx['BWk']

    # The White Loom halite playa collar around Lake Nim -> Exotic `XS` (abyssal salt steppe)
    playa_xs_f = inner99_f & (rNimF <= 48.0) & (EnF < 335.0)
    cls2[playa_xs_f] = idx['XS']

    arid99_f = inner99_f & (EnF < 1850.0) & ~deep_f & ~playa_xs_f
    cls2[arid99_f & ((EnF < 1520.0) | (xTectF > 1365.0))] = idx['BWk']
    cls2[arid99_f & (EnF >= 1520.0) & (xTectF <= 1365.0)] = idx['BSk']
    cls2[inner99_f & (xTectF >= 1288.0) & (xTectF <= 1338.0) & (EnF >= 1450.0) & (EnF < 2150.0)] = idx['BSk']

    cradle_f = inner99_f & (xTectF < 1302.0) & (EnF >= 1850.0) & (EnF < 3150.0)
    cls2[cradle_f] = idx['BSk']
    cls2[cradle_f & spill99 & (EnF >= 2250.0)] = idx['Dsb']
    cls2[inner99_f & (EnF >= 3150.0) & (EnF < 3950.0)] = idx['Dsc']
    cls2[inner99_f & (EnF >= 3950.0) & (EnF < 5300.0)] = idx['ET']
    cls2[inner99_f & (EnF >= 5300.0) & (EnF < 6250.0)] = idx['EF']
    cls2[inner99_f & (EnF >= 6250.0) & (EnF < 7150.0)] = idx['HT']
    cls2[inner99_f & (EnF >= 7150.0) & (EnF < 8800.0)] = idx['HF']
    cls2[inner99_f & (EnF >= 8800.0)] = idx['O']

    o99 = oasis99_f & inner99_f & (EnF < 3150.0)
    cls2[o99 & (EnF >= 1500.0) & (EnF < 2650.0)] = idx['Cwb']
    cls2[o99 & (EnF >= 2650.0)] = idx['Cwc']
    cls2[o99 & (EnF < 1500.0) & (tmF >= 16.0)] = idx['Csa']
    cls2[o99 & (EnF < 1500.0) & (tmF < 16.0)] = idx['Csb']

    # Terminal hypersaline Lake Nim -> Exotic `WX` (abyssal salt lake)
    w_nim_f = mask99_f & (EoF < 3500.0) & wet2F
    cls2[w_nim_f] = idx['WX']

    zon2[inner99_f & (EnF < 1350.0)] = 0
    zon2[inner99_f & (EnF >= 1350.0) & (EnF < 4800.0)] = 1
    zon2[inner99_f & (EnF >= 4800.0) & (EnF < 8200.0)] = 3
    zon2[inner99_f & (EnF >= 8200.0)] = 2
    zon2[inner99_f & (rNimF <= 52.0) & (EnF < 285.0)] = 5
    zon2[w_nim_f] = 4

    # --- 4B. Siphon Pits Climate & Exotic Classes (`WH`, `Cwb`, `Cfa`, `Cfb`, `Dsb`, `Dsc`, `Dwc`, `BSk`, `HT`) ---
    inner_sp_f = mask_sp_f & (distUnionF >= 1.2) & ~wet2F
    cls2[inner_sp_f & (scarpUF < -2.0) & (EnF < 2750.0)] = idx['BSk']
    cls2[inner_sp_f & (scarpUF < -2.0) & (EnF >= 2350.0) & (EnF < 2780.0)] = idx['Dsb']
    cls2[inner_sp_f & (scarpUF >= -6.0) & (scarpUF <= 12.0) & (EnF >= 2450.0) & (EnF < 3080.0)] = idx['BSk']
    cls2[inner_sp_f & (EnF >= 2750.0) & (EnF < 3850.0) & (pitDepthF < 0.32)] = idx['Dsc']
    cls2[inner_sp_f & (scarpUF >= 4.0) & (scarpUF <= 16.0) & (EnF >= 3300.0) & (EnF < 3850.0) & (pitDepthF < 0.32)] = idx['Dwc']
    cls2[inner_sp_f & (EnF >= 3850.0) & (EnF < 5250.0) & (pitDepthF < 0.32)] = idx['ET']
    cls2[inner_sp_f & (EnF >= 5250.0) & (EnF < 6250.0)] = idx['EF']
    cls2[inner_sp_f & (EnF >= 6250.0) & (EnF < 7150.0)] = idx['HT']
    cls2[inner_sp_f & (EnF >= 7150.0) & (EnF < 8800.0)] = idx['HF']
    cls2[inner_sp_f & (EnF >= 8800.0)] = idx['O']

    cls2[inner_sp_f & (pitDepthF >= 0.32) & (pitDepthF < 0.64)] = idx['Dsc']
    cls2[inner_sp_f & (pitDepthF >= 0.64)] = idx['Dsb']
    cls2[inner_sp_f & (pitDepthF >= 0.64) & (EnF < 2300.0) & (tmF >= 10.0)] = idx['BSk']
    pit_oasis_f = inner_sp_f & oasis_sp_pit
    cls2[pit_oasis_f & (EnF >= 2350.0)] = idx['Cfb']
    cls2[pit_oasis_f & (EnF < 2350.0)] = idx['Cfa']
    farm_f = inner_sp_f & (oasis_sp_shore | oasis_sp_river) & (EnF < 2800.0)
    cls2[farm_f] = idx['Cwb']

    w_sp_lakes_f = mask_sp_f & (distUnionF >= 2.5) & wet2F
    cls2[w_sp_lakes_f] = idx['WH']

    zon2[inner_sp_f & (EnF < 4300.0)] = 1
    zon2[inner_sp_f & (EnF >= 4300.0) & (EnF < 8200.0)] = 3
    zon2[inner_sp_f & (EnF >= 8200.0)] = 2
    zon2[w_sp_lakes_f] = 4

    # --- 4C. Mid Basin Climate & Exotic Classes (`BSk`, `Dsb`, `Dsa`, `Dsc`, `Cwb`, `Cwc`, `Csb`, `WH`) ---
    inner_mb_f = mask_mb_f & (distUnionF >= 1.2) & ~wet2F
    # Western Loess Corridor & lower north benches -> `BSk` cold steppe
    cls2[inner_mb_f & (EnF < 2450.0)] = idx['BSk']
    # Propagating Warp Chasm floors in northern Mid Basin -> `BWk` & `Dsa`
    cls2[inner_mb_f & (EnF < 1650.0) & (chasmF > 0.35)] = idx['BWk']
    cls2[inner_mb_f & (EnF >= 1650.0) & (EnF < 2050.0) & (chasmF > 0.30)] = idx['Dsa']
    # Central faulted basalt relay benches -> `Dsb` (mid bench) and `Dsc` (upper bench)
    cls2[inner_mb_f & (EnF >= 2350.0) & (EnF < 2950.0)] = idx['Dsb']
    cls2[inner_mb_f & (EnF >= 2950.0) & (EnF < 3850.0)] = idx['Dsc']
    cls2[inner_mb_f & (EnF >= 3850.0) & (EnF < 5250.0)] = idx['ET']
    cls2[inner_mb_f & (EnF >= 5250.0) & (EnF < 6250.0)] = idx['EF']
    cls2[inner_mb_f & (EnF >= 6250.0) & (EnF < 7150.0)] = idx['HT']
    cls2[inner_mb_f & (EnF >= 7150.0) & (EnF < 8800.0)] = idx['HF']
    cls2[inner_mb_f & (EnF >= 8800.0)] = idx['O']
    # Breached Maar-Diatreme Amphitheaters: collars `Dsb`/`Csb`, warm spring-fed floors `Cwb`/`Cwc`
    cls2[inner_mb_f & (mbPitF >= 0.30) & (mbPitF < 0.65)] = idx['Dsb']
    cls2[inner_mb_f & (mbPitF >= 0.45) & (mbPitF < 0.72) & (EnF < 2250.0)] = idx['Csb']
    cls2[inner_mb_f & oasis_mb_f & (EnF < 2350.0)] = idx['Cwb']
    cls2[inner_mb_f & oasis_mb_f & (EnF >= 2350.0) & (EnF < 2850.0)] = idx['Cwc']

    w_mb_lakes_f = mask_mb_f & wet2F
    cls2[w_mb_lakes_f] = idx['WH']
    zon2[inner_mb_f & (EnF < 4300.0)] = 1
    zon2[inner_mb_f & (EnF >= 4300.0) & (EnF < 8200.0)] = 3
    zon2[inner_mb_f & (EnF >= 8200.0)] = 2
    zon2[w_mb_lakes_f] = 4

    # --- 4D. Stalker Gate Climate & Exotic Classes (`Csb`, `Csc`, `Dsa`, `Dsb`, `Cwb`, `Dwb`, `Dwc`, `BSk`, `WH`) ---
    inner_sg_f = (mask_sg_f | hub_mask_f) & (distUnionF >= 1.2) & ~wet2F
    # Default pass floors & benches by elevation and branch
    cls2[inner_sg_f & (EnF < 2550.0)] = idx['BSk']
    # Pass 1A (NW Krikki Winding Gorge) -> `Csb` (warm-summer Mediterranean) & `Csc` on upper benches
    krikki_f = inner_sg_f & (YF < 885.0) & (XF < 1165.0)
    cls2[krikki_f & (EnF < 2350.0)] = idx['Csb']
    cls2[krikki_f & (EnF >= 2350.0) & (EnF < 2950.0)] = idx['Csc']
    # Central Gatehouse Pull-Apart Basin around Lake Vapora -> `Dsa` (inner sun-baked floor) & `Cwb` (vapor shore oasis)
    gatehouse_f = inner_sg_f & (rVapF < 36.0)
    cls2[gatehouse_f & (EnF < 2220.0)] = idx['Dsa']
    cls2[inner_sg_f & oasis_sg_f & (EnF < 2320.0)] = idx['Cwb']
    # Pass 2A/2B (Weavers' Breach & Spindle Col) & Pass 3 (Ostrukh Meander) -> `Dsb` & `Cwb`
    cls2[inner_sg_f & (XF >= 1160.0) & (EnF >= 2120.0) & (EnF < 2850.0)] = idx['Dsb']
    # Pass 4A/4B (SW Stalker Coulee & Hub 01 Valley, West Highland Saddle) -> Katabatic dry-winter `Dwb` & `Dwc`
    stalker_tr_f = inner_sg_f & ((YF >= 925.0) & (XF < 1165.0) | (XF < 1125.0) & (YF >= 830.0))
    cls2[stalker_tr_f & (EnF >= 2250.0) & (EnF < 2750.0)] = idx['Dwb']
    cls2[stalker_tr_f & (EnF >= 2750.0) & (EnF < 3650.0)] = idx['Dwc']
    # Flanking Horst Massifs
    cls2[inner_sg_f & (EnF >= 2950.0) & (EnF < 3950.0) & ~stalker_tr_f] = idx['Dsc']
    cls2[inner_sg_f & (EnF >= 3950.0) & (EnF < 5250.0)] = idx['ET']
    cls2[inner_sg_f & (EnF >= 5250.0) & (EnF < 6250.0)] = idx['EF']
    cls2[inner_sg_f & (EnF >= 6250.0) & (EnF < 7150.0)] = idx['HT']
    cls2[inner_sg_f & (EnF >= 7150.0) & (EnF < 8800.0)] = idx['HF']
    cls2[inner_sg_f & (EnF >= 8800.0)] = idx['O']

    w_sg_lakes_f = (mask_sg_f | hub_mask_f) & wet2F
    cls2[w_sg_lakes_f] = idx['WH']
    zon2[inner_sg_f & (EnF < 4300.0)] = 1
    zon2[inner_sg_f & (EnF >= 4300.0) & (EnF < 8200.0)] = 3
    zon2[inner_sg_f & (EnF >= 8200.0)] = 2
    zon2[w_sg_lakes_f] = 4

    # --- 4E. High Rift Climate & Exotic Classes (`Cfb`, `Csb`, `Dsb`, `Dfb`, `Dsc`, `Dwc`, `ET`, `HT`, `WH`) ---
    inner_hr_f = mask_hr_f & (distUnionF >= 1.2) & ~wet2F
    # Use curved, topography-following longitudinal coordinate `x_hr_c` so climate transitions never form vertical lines!
    x_hr_c = XF + 14.0 * np.cos((YF - 1330.0) * 0.11) + 0.015 * (EnF - 2800.0)
    y_hr_c = YF + 4.5 * np.sin((XF - 1130.0) * 0.052)
    # Zone 1: Opaline Sinter Staircase (`x_hr_c < 1115`) -> `Cfb` (humid geothermal cascade) & `Csb`
    cls2[inner_hr_f & (x_hr_c < 1115.0) & (EnF < 2680.0)] = idx['Cfb']
    cls2[inner_hr_f & (x_hr_c < 1115.0) & (EnF >= 2680.0) & (EnF < 3180.0)] = idx['Csb']
    # Zone 2: North Mirror Graben (`y_hr_c < 1327, x_hr_c 1115..1255`) -> `Dfb` & `Dsb` around Lake Verdigris & Cinnabar
    cls2[inner_hr_f & (x_hr_c >= 1115.0) & (x_hr_c < 1255.0) & (y_hr_c < 1327.0) & (EnF < 3150.0)] = idx['Dfb']
    cls2[inner_hr_f & (x_hr_c >= 1115.0) & (x_hr_c < 1255.0) & (y_hr_c < 1327.0) & (EnF >= 3150.0) & (EnF < 3550.0)] = idx['Dsb']
    # Zone 4: South Fire-and-Ice Coulee (`y_hr_c >= 1327, x_hr_c 1115..1255`) -> `Dsc` & `Dwc`
    cls2[inner_hr_f & (x_hr_c >= 1115.0) & (x_hr_c < 1255.0) & (y_hr_c >= 1327.0) & (EnF < 3450.0)] = idx['Dsc']
    cls2[inner_hr_f & (x_hr_c >= 1115.0) & (x_hr_c < 1255.0) & (y_hr_c >= 1346.0) & (EnF >= 3220.0) & (EnF < 3750.0)] = idx['Dwc']
    # Zone 5: East Singing Gjar (`x_hr_c >= 1255`) -> `Dsc` in warm tension fissures, `ET` on basalt plateau
    cls2[inner_hr_f & (x_hr_c >= 1255.0) & (EnF < 3920.0)] = idx['Dsc']
    cls2[inner_hr_f & (x_hr_c >= 1255.0) & (hrGjarF > 0.35) & (EnF < 4150.0)] = idx['Dsb']
    # Zone 3 (Dorsal Wedge Horst) & Upper Rims
    cls2[inner_hr_f & (EnF >= 3850.0) & (EnF < 5200.0)] = idx['ET']
    cls2[inner_hr_f & (EnF >= 5200.0) & (EnF < 6250.0)] = idx['EF']
    cls2[inner_hr_f & (EnF >= 6250.0) & (EnF < 7150.0)] = idx['HT']
    cls2[inner_hr_f & (EnF >= 7150.0) & (EnF < 8800.0)] = idx['HF']
    cls2[inner_hr_f & (EnF >= 8800.0)] = idx['O']

    w_hr_lakes_f = mask_hr_f & wet2F
    cls2[w_hr_lakes_f] = idx['WH']
    zon2[inner_hr_f & (EnF < 4200.0)] = 1
    zon2[inner_hr_f & (EnF >= 4200.0) & (EnF < 8200.0)] = 3
    zon2[inner_hr_f & (EnF >= 8200.0)] = 2
    zon2[w_hr_lakes_f] = 4

    # Recompute `D['climate']['present']` (`pct` and `km2`, sorted by `km2` descending) including newly active exotic classes
    total_px = float(cls2.size)
    present_map = {e['code']: e for e in D['climate']['present']}
    new_present = []
    for c_meta in D['climate']['classes']:
        c_code = c_meta['code']
        c_idx = idx[c_code]
        cnt = int((cls2 == c_idx).sum())
        if cnt > 0 or c_code in present_map:
            pct = round(cnt / total_px * 100.0, 2)
            km2 = cnt * 4
            new_present.append({
                'code': c_code,
                'name': c_meta['name'],
                'color': c_meta['color'],
                'pct': pct,
                'km2': km2,
            })
    new_present.sort(key=lambda x: x['km2'], reverse=True)
    D['climate']['present'] = new_present

    for nm, m_ in (
        ('Region 99', mask99_f),
        ('Siphon Pits', mask_sp_f),
        ('Mid Basin', mask_mb_f),
        ('Stalker Gate', mask_sg_f),
        ('High Rift', mask_hr_f),
    ):
        print(f'  {nm:14s} climates:', {codes[k]: int((cls2[m_] == k).sum()) for k in np.unique(cls2[m_])})

    # --- Step 5: Repaint st, t, rt, ct Across All 5 Regions ---
    print('--- Step 5: Inpainting old lakes/rivers, computing clean EnF hillshade, and painting st, t, rt, ct ---')
    st0 = P.raster(D, 'st')
    t0 = P.raster(D, 't')
    rt0 = P.raster(D, 'rt')
    ct0 = P.raster(D, 'ct')
    t0_f = t0.astype(float)

    wpaint99 = mask99_f & (EoF < 3500.0) & ((t0_f[..., 1] > t0_f[..., 0] + 18.0) & (t0_f[..., 2] > t0_f[..., 0] + 10.0))
    hole_all = mask_union_f & (distUnionF >= 2.5) & (wet0F | (cls0 == idx['WS']) | wpaint99 | old_riv_f) & ~wet2F
    drained_hole = nd.binary_dilation(hole_all, iterations=3)
    land_donor = mask_union_f & ~drained_hole & (EoF >= 700.0) & (EoF <= 3900.0)

    D_clean = dict(D)
    for k, arr0 in (('st', st0), ('t', t0), ('rt', rt0), ('ct', ct0)):
        inp = PA.inpaint(arr0, drained_hole, src=land_donor)
        D_clean[k] = P.b64(Image.fromarray(inp, 'RGB'), 'JPEG', quality=94)

    relit, _, _ = PA.relight(D_clean, Eo, En, keys=('st', 't', 'rt', 'ct'))

    rs_tex = np.random.RandomState(SEED + 7)
    fine_grain = 1.0 + nd.gaussian_filter(rs_tex.normal(0.0, 0.035, (OH, OW)), 0.9)[..., None]
    clean_shade = compute_clean_hillshade(EnF, zf=5.0, az_deg=315.0, alt_deg=45.0) * fine_grain

    w_paint_u = (G.sstep(1.5, 6.0, distUnionF) * G.sstep(2.2, 8.5, distUnionOrgF) * mask_union_f.astype(float))[..., None]
    w_paint_ct = (G.sstep(0.8, 3.5, distUnionF) * mask_union_f.astype(float))[..., None]

    all_new_lakes_f = w_nim_f | w_sp_lakes_f | w_mb_lakes_f | w_sg_lakes_f | w_hr_lakes_f
    din_lakes = nd.distance_transform_edt(all_new_lakes_f)

    # 5c. Repaint `t` (Relief map)
    t_relit = np.array(Image.open(io.BytesIO(base64.b64decode(relit['t']))).convert('RGB')).astype(float)
    hypso_centers, hypso_meds = build_hypsometric_table(EoF, wet0F, t0_f)
    new_hypso = eval_hypso(EnF, hypso_centers, hypso_meds)

    t_synthesized = np.clip(new_hypso * clean_shade, 0.0, 255.0)
    t_lake_col = np.where(din_lakes[..., None] > 2.5, np.array([42.0, 108.0, 114.0]), np.array([85.0, 138.0, 128.0]))
    t_synthesized = np.where(all_new_lakes_f[..., None], t_lake_col * np.clip(clean_shade, 0.88, 1.12), t_synthesized)
    t_final = np.clip(t_relit * (1.0 - w_paint_u) + t_synthesized * w_paint_u, 0.0, 255.0).round().astype(np.uint8)

    # 5d. Repaint `rt` (Rain map)
    rt_relit = np.array(Image.open(io.BytesIO(base64.b64decode(relit['rt']))).convert('RGB')).astype(float)
    rt_synthesized = np.clip(PA.ramp(rain2) * (0.28 + 0.72 * clean_shade), 0.0, 255.0)
    rt_synthesized = np.where(all_new_lakes_f[..., None], np.array([48.0, 110.0, 135.0]), rt_synthesized)
    rt_final = np.clip(rt_relit * (1.0 - w_paint_ct) + rt_synthesized * w_paint_ct, 0.0, 255.0).round().astype(np.uint8)

    # 5e. Repaint `ct` (Climate map)
    ct_relit = np.array(Image.open(io.BytesIO(base64.b64decode(relit['ct']))).convert('RGB')).astype(float)
    class_rgb = np.array([
        [int(c['color'][1:3], 16), int(c['color'][3:5], 16), int(c['color'][5:7], 16)]
        for c in D['climate']['classes']
    ], dtype=float)
    ct_synthesized = np.clip(class_rgb[cls2] * (0.38 + 0.62 * clean_shade), 0.0, 255.0)
    ct_final = np.clip(ct_relit * (1.0 - w_paint_ct) + ct_synthesized * w_paint_ct, 0.0, 255.0).round().astype(np.uint8)

    # 5f. Repaint `st` (Satellite map) across all 5 Southeastern regions
    st_relit = np.array(Image.open(io.BytesIO(base64.b64decode(relit['st']))).convert('RGB')).astype(float)
    tm_new = P.raster(D, 'tm', 'L').astype(float) - 90.0

    st_clean_base = st_relit.copy()
    neutral_base = np.full_like(st_relit, 128.0) * clean_shade
    w_clean_lum = (G.sstep(1.8, 6.5, distUnionF) * G.sstep(3.0, 10.5, distUnionOrgF) * G.sstep(5600.0, 4450.0, EnF) * mask_union_f.astype(float))[..., None]
    st_clean_base = np.clip(st_clean_base * (1.0 - w_clean_lum) + neutral_base * w_clean_lum, 0.0, 255.0).round().astype(np.uint8)

    w_clim_u = G.sstep(1.8, 6.5, distUnionF) * G.sstep(3.0, 10.5, distUnionOrgF) * G.sstep(5500.0, 4350.0, EnF) * mask_union_f.astype(float)
    st_clim = PA.by_climate(st_clean_base, EnF, rain2, tm_new, wet2F, mask_union_f, w_clim_u)
    w_arid_paint = w_clim_u * G.sstep(260.0, 120.0, rain2) * G.sstep(2200.0, 1200.0, EnF) * mask99_f.astype(float)
    st_clim = PA.desert(st_clim, EnF, rain2, tm_new, wet2F, mask99_f, w_arid_paint, mm=150.0, step=250.0)

    st_f = st_clim.astype(float)
    w_c99 = w_clim_u * p99_f
    w_csp = w_clim_u * psp_f
    w_cmb = w_clim_u * pmb_f
    w_csg = w_clim_u * psg_f
    w_chr = w_clim_u * phr_f

    # --- Region 99 Satellite Art Direction ---
    w_mesa_st = w_c99 * (1.0 - chasmF) * G.sstep(1265.0, 1340.0, xTectF) * (1.0 - G.sstep(1850.0, 2500.0, EnF))
    st_f = st_f * (1.0 - 0.58 * w_mesa_st[..., None]) + (np.array([166.0, 104.0, 74.0]) * clean_shade) * (0.58 * w_mesa_st[..., None])

    w_chasm_wall = (w_c99 + 0.65 * w_cmb) * np.clip(chasmF * (1.0 - chasmF) * 4.0, 0.0, 1.0)
    st_f = st_f * (1.0 - 0.76 * w_chasm_wall[..., None]) + (np.array([72.0, 48.0, 38.0]) * clean_shade) * (0.76 * w_chasm_wall[..., None])

    w_chasm_floor = w_c99 * G.sstep(0.42, 0.85, chasmF) * (1.0 - G.sstep(16.0, 42.0, rNimF))
    st_f = st_f * (1.0 - 0.68 * w_chasm_floor[..., None]) + (np.array([102.0, 92.0, 66.0]) * clean_shade) * (0.68 * w_chasm_floor[..., None])

    w_cradle_st = w_c99 * (1.0 - G.sstep(1275.0, 1312.0, xTectF)) * G.sstep(1850.0, 2150.0, EnF) * (1.0 - G.sstep(3000.0, 3600.0, EnF))
    st_f = st_f * (1.0 - 0.62 * w_cradle_st[..., None]) + (np.array([156.0, 136.0, 94.0]) * clean_shade) * (0.62 * w_cradle_st[..., None])

    w_oasis99_st = w_c99 * np.clip(nd.gaussian_filter(oasis99_f.astype(float), 1.2) * 1.6, 0.0, 1.0) * (~wet2F)
    st_f = st_f * (1.0 - 0.70 * w_oasis99_st[..., None]) + (np.array([70.0, 108.0, 56.0]) * clean_shade) * (0.70 * w_oasis99_st[..., None])

    w_playa_st = w_c99 * (1.0 - G.sstep(14.0, 50.0, rNimF)) * (~wet2F).astype(float) * G.sstep(310.0, 255.0, EnF)
    st_f = st_f * (1.0 - 0.82 * w_playa_st[..., None]) + (np.array([228.0, 220.0, 206.0]) * np.clip(clean_shade, 0.80, 1.16)) * (0.82 * w_playa_st[..., None])

    w_cael_rock = (1.0 - G.sstep(12.0, 44.0, rCaelF)) * G.sstep(2100.0, 2800.0, EnF) * (1.0 - G.sstep(3850.0, 4350.0, EnF))
    st_f = st_f * (1.0 - 0.68 * w_cael_rock[..., None]) + (np.array([106.0, 74.0, 62.0]) * clean_shade) * (0.68 * w_cael_rock[..., None])
    w_cael_snow = (1.0 - G.sstep(16.0, 38.0, rCaelF)) * G.sstep(3800.0, 4350.0, EnF)
    st_f = st_f * (1.0 - 0.88 * w_cael_snow[..., None]) + (np.array([240.0, 242.0, 246.0]) * np.clip(clean_shade, 0.74, 1.16)) * (0.88 * w_cael_snow[..., None])

    # --- Siphon Pits & Mid Basin Satellite Art Direction ---
    w_ost_st = (w_csp + w_cmb * (1.0 - G.sstep(-6.0, 14.0, scarpUF))) * (1.0 - G.sstep(-8.0, 10.0, scarpUF)) * (1.0 - G.sstep(2650.0, 3300.0, EnF)) * (~wet2F).astype(float)
    terrace_band = 0.5 + 0.5 * np.sin(EnF / 135.0 * 2.0 * math.pi)
    ost_rgb = (np.array([150.0, 132.0, 88.0]) * (1.0 - 0.35 * terrace_band[..., None]) +
               np.array([176.0, 156.0, 104.0]) * (0.35 * terrace_band[..., None])) * clean_shade
    st_f = st_f * (1.0 - 0.72 * w_ost_st[..., None]) + ost_rgb * (0.72 * w_ost_st[..., None])

    farm_st = np.clip(nd.gaussian_filter((oasis_sp_shore | oasis_sp_river | oasis_mb_f).astype(float), 1.2) * 1.6, 0.0, 1.0)
    w_farm_st = (w_csp + w_cmb) * farm_st * (~wet2F).astype(float)
    farm_rgb = (np.array([82.0, 120.0, 60.0]) * (1.0 - 0.30 * terrace_band[..., None]) +
                np.array([124.0, 132.0, 70.0]) * (0.30 * terrace_band[..., None])) * clean_shade
    st_f = st_f * (1.0 - 0.78 * w_farm_st[..., None]) + farm_rgb * (0.78 * w_farm_st[..., None])

    # Mid Basin Faulted Basalt Hinge-Ramp & Silicified Loess Yardangs
    w_mb_ramp = w_cmb * G.sstep(-6.0, 16.0, scarpUF) * (1.0 - G.sstep(0.15, 0.55, mbPitF))
    mb_ramp_rgb = (
        np.array([152.0, 112.0, 82.0]) * (1.0 - vHingeF[..., None])
        + np.array([118.0, 90.0, 82.0]) * vHingeF[..., None]
    ) * clean_shade
    st_f = st_f * (1.0 - 0.68 * w_mb_ramp[..., None]) + mb_ramp_rgb * (0.68 * w_mb_ramp[..., None])

    # Siphon Pits & Mid Basin Tuff Rings, Pit Walls, and Geothermal Floors
    comb_pit_d = np.maximum(pitDepthF * mask_sp_f, mbPitF * mask_mb_f)
    comb_tuff = np.maximum(pitTuffF * mask_sp_f, mbTuffF * mask_mb_f)
    w_sp_mb = w_csp + w_cmb

    w_se_plat_st = w_csp * G.sstep(4.0, 18.0, scarpUF) * (1.0 - G.sstep(0.08, 0.45, pitDepthF))
    rime_frost = G.sstep(4420.0, 4680.0, EnF)[..., None]
    plat_rgb = (np.array([116.0, 92.0, 86.0]) * (1.0 - 0.55 * rime_frost) +
                np.array([178.0, 174.0, 180.0]) * (0.55 * rime_frost)) * clean_shade
    st_f = st_f * (1.0 - 0.74 * w_se_plat_st[..., None]) + plat_rgb * (0.74 * w_se_plat_st[..., None])

    w_tuff_st = w_sp_mb * np.clip(comb_tuff / 155.0, 0.0, 1.0) * (1.0 - G.sstep(0.15, 0.55, comb_pit_d))
    st_f = st_f * (1.0 - 0.65 * w_tuff_st[..., None]) + (np.array([186.0, 168.0, 152.0]) * clean_shade) * (0.65 * w_tuff_st[..., None])

    w_pit_wall = w_sp_mb * np.clip(comb_pit_d * (1.0 - comb_pit_d) * 4.2, 0.0, 1.0)
    st_f = st_f * (1.0 - 0.82 * w_pit_wall[..., None]) + (np.array([58.0, 42.0, 40.0]) * clean_shade) * (0.82 * w_pit_wall[..., None])

    w_pit_floor = w_sp_mb * G.sstep(0.45, 0.88, comb_pit_d) * (~wet2F).astype(float)
    w_pit_core = G.sstep(0.75, 0.98, comb_pit_d)[..., None]
    lush = np.clip(nd.gaussian_filter((oasis_sp_pit | oasis_mb_f).astype(float), 1.5) * 1.5, 0.0, 1.0)[..., None]
    siphon_floor_rgb = (
        (np.array([76.0, 128.0, 74.0]) * lush + np.array([118.0, 112.0, 86.0]) * (1.0 - lush)) * (1.0 - 0.42 * w_pit_core)
        + np.array([176.0, 138.0, 68.0]) * (0.42 * w_pit_core)
    ) * clean_shade
    st_f = st_f * (1.0 - 0.84 * w_pit_floor[..., None]) + siphon_floor_rgb * (0.84 * w_pit_floor[..., None])

    # --- Stalker Gate Satellite Art Direction ---
    # Meandering pass floors: warm golden-olive steppe & Mediterranean scrub, emerald around Lake Vapora
    w_sg_val = w_csg * G.sstep(0.25, 0.85, sgPassWF) * (~wet2F).astype(float)
    sg_val_rgb = (
        np.array([144.0, 132.0, 92.0]) * (1.0 - 0.45 * G.sstep(18.0, 6.0, rVapF)[..., None])
        + np.array([78.0, 118.0, 64.0]) * (0.45 * G.sstep(18.0, 6.0, rVapF)[..., None])
    ) * clean_shade
    st_f = st_f * (1.0 - 0.72 * w_sg_val[..., None]) + sg_val_rgb * (0.72 * w_sg_val[..., None])

    w_sg_wall = w_csg * (1.0 - G.sstep(0.15, 0.65, sgPassWF)) * G.sstep(2600.0, 3900.0, EnF) * (1.0 - G.sstep(4500.0, 5200.0, EnF))
    st_f = st_f * (1.0 - 0.68 * w_sg_wall[..., None]) + (np.array([118.0, 84.0, 72.0]) * clean_shade) * (0.68 * w_sg_wall[..., None])

    # --- High Rift Satellite Art Direction ---
    # Zone 1: Opaline Sinter Staircase (pearl-white, rose-quartz, and travertine cream bands)
    w_sinter_st = w_chr * (1.0 - G.sstep(1095.0, 1125.0, XF)) * (1.0 - G.sstep(2950.0, 3400.0, EnF)) * (~wet2F).astype(float)
    sinter_band = 0.5 + 0.5 * np.cos(EnF / 95.0 * 2.0 * math.pi)
    sinter_rgb = (
        np.array([224.0, 212.0, 198.0]) * (1.0 - 0.42 * sinter_band[..., None])
        + np.array([204.0, 168.0, 158.0]) * (0.42 * sinter_band[..., None])
    ) * clean_shade
    st_f = st_f * (1.0 - 0.78 * w_sinter_st[..., None]) + sinter_rgb * (0.78 * w_sinter_st[..., None])

    # Zone 2: North Mirror Graben & Hematitic Fault-Mirror Cliff
    w_mirror_cliff = w_chr * G.sstep(1110.0, 1130.0, XF) * (1.0 - G.sstep(1245.0, 1265.0, XF)) * (YF < 1304.0) * G.sstep(2950.0, 3600.0, EnF)
    st_f = st_f * (1.0 - 0.76 * w_mirror_cliff[..., None]) + (np.array([158.0, 86.0, 64.0]) * clean_shade) * (0.76 * w_mirror_cliff[..., None])

    # Zone 3: Dorsal Wedge Median Horst (columnar basalt & russet tundra)
    w_horst_st = w_chr * hrHorstF * (~wet2F).astype(float)
    st_f = st_f * (1.0 - 0.74 * w_horst_st[..., None]) + (np.array([112.0, 84.0, 76.0]) * clean_shade) * (0.74 * w_horst_st[..., None])

    # Zone 4: South Fire-and-Ice Coulee (black basalt flood scabland + cobalt-blue fumarolic ice toes)
    w_south_st = w_chr * hrSouthGF * (~wet2F).astype(float)
    st_f = st_f * (1.0 - 0.76 * w_south_st[..., None]) + (np.array([68.0, 64.0, 68.0]) * clean_shade) * (0.76 * w_south_st[..., None])

    # Zone 5: The Singing Gjar tension fissures (iron-grey flood basalt scored by dark steaming tension cracks)
    w_gjar_st = w_chr * G.sstep(0.20, 0.75, hrGjarF)
    st_f = st_f * (1.0 - 0.80 * w_gjar_st[..., None]) + (np.array([54.0, 44.0, 42.0]) * clean_shade) * (0.80 * w_gjar_st[..., None])

    # Lakes on `st` (with distinct cinnabar-ochre tint for Lake Cinnabar at [1220, 1304])
    is_cinn_f = mask_hr_f & wet2F & (XF > 1195.0)
    lake_st_col = np.where(
        is_cinn_f[..., None],
        np.array([168.0, 78.0, 58.0]),
        np.where(din_lakes[..., None] > 2.5, np.array([38.0, 106.0, 124.0]), np.array([136.0, 166.0, 156.0]))
    )
    st_f = np.where(all_new_lakes_f[..., None], lake_st_col * np.clip(clean_shade, 0.84, 1.14), st_f)

    st_final = np.clip(st_f, 0.0, 255.0).round().astype(np.uint8)

    # Encode rasters back into D
    D['h'] = P.encode_heights(D, En, whas2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    D['st'] = P.b64(Image.fromarray(st_final, 'RGB'), 'JPEG', quality=92)
    D['t'] = P.b64(Image.fromarray(t_final, 'RGB'), 'JPEG', quality=92)
    D['rt'] = P.b64(Image.fromarray(rt_final, 'RGB'), 'JPEG', quality=92)
    D['ct'] = P.b64(Image.fromarray(ct_final, 'RGB'), 'JPEG', quality=92)

    # --- Step 6: Add Geothermal Vents Across All 5 Regions ---
    new_vent_coords = [
        (CAELUM_PX[0], CAELUM_PX[1], 0.28, 2.8),   # Region 99: Mount Caelum summit fumarole
        (1412.0, 1222.0, 0.28, 2.8),               # Siphon Pits: Flagship Great Siphon Maar Floor
        (1396.0, 1209.0, 0.24, 2.4),               # Siphon Pits: West Arete Compound Maar diatreme
        (1346.0, 1246.0, 0.25, 2.5),               # Siphon Pits: SW Flagship Siphon Maar diatreme
        (1440.0, 1152.0, 0.24, 2.4),               # Siphon Pits: Eastern Deep Siphon Maar diatreme
        (1312.0, 1018.0, 0.25, 2.5),               # Mid Basin: Siphon-Breach Pool artesian spring vent
        (1354.0, 1036.0, 0.24, 2.4),               # Mid Basin: Central Breached Caldron diatreme vent
        (1424.0, 1042.0, 0.23, 2.3),               # Mid Basin: East Breached Diatreme vent
        (1148.0,  904.0, 0.25, 2.5),               # Stalker Gate: Lake Vapora geothermal junction vent
        (1218.0,  836.0, 0.22, 2.2),               # Stalker Gate: Weavers' Breach steam chimney
        (1068.0, 1332.0, 0.26, 2.6),               # High Rift: Opaline Sinter Staircase main geyser terrace
        (1160.0, 1306.0, 0.24, 2.4),               # High Rift: Lake Verdigris hydrothermal plume
        (1182.0, 1354.0, 0.24, 2.4),               # High Rift: South Coulee Erebus ice-fumarole chimney
        (1302.0, 1312.0, 0.25, 2.5),               # High Rift: Singing Gjar steaming tension fissure
    ]
    vents = [
        v for v in D['vents']
        if not any(abs(v['px'][0] - vx) < 16 and abs(v['px'][1] - vy) < 16 for vx, vy, _, _ in new_vent_coords)
    ]
    for vx, vy, sc, rad in new_vent_coords:
        viy, vix = int(round(vy * sv)), int(round(vx * su))
        vfloor = round(float(En[viy, vix]), 1)
        vents.append({'px': [vx, vy], 'floor': vfloor, 'scale': sc, 'radius': rad, 'kind': 'geyser'})
    D['vents'] = vents
    print(f'  Added {len(new_vent_coords)} geothermal/diatreme vents across the 5-region complex.')

    # --- Step 7: Save model/data/, rebuild HTML, and write verification crops ---
    print('--- Step 7: Saving model/data/ and building scale-model HTML ---')
    P.save(D)

    subprocess.check_call([sys.executable, os.path.join(HERE, 'model', 'build.py')])

    dist_html = os.path.join(HERE, 'model', 'dist', 'scale-model.html')
    out_424 = os.path.join(HERE, 'scale-model-4.24.html')
    shutil.copy2(dist_html, out_424)

    artifact_html = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scale-model-artifact.html'
    if os.path.exists(os.path.dirname(artifact_html)):
        shutil.copy2(dist_html, artifact_html)

    # Save overview crops of the entire 5-region Southeastern Complex (`st`, `ct`, `t`, `rt`)
    x0, y0, x1, y1 = 1000, 640, 1549, 1393
    polys_to_draw = [
        (pts99, (255, 255, 255)),
        (pts_mb, (255, 165, 60)),
        (pts_sp, (100, 230, 210)),
        (pts_sg, (170, 235, 140)),
        (pts_hr, (220, 240, 130)),
    ]
    for k in ['st', 'ct', 'rt', 't']:
        arr = P.raster(D, k)
        crop = Image.fromarray(arr[y0:y1, x0:x1])
        draw = ImageDraw.Draw(crop)
        for pts_, col_ in polys_to_draw:
            poly_c = [(p[0] - x0, p[1] - y0) for p in pts_] + [(pts_[0][0] - x0, pts_[0][1] - y0)]
            draw.line(poly_c, fill=col_, width=2)
        crop.save(f'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scratch/se5_after_{k}.png')

    print('Saved verification crops to scratch/se5_after_{st,ct,rt,t}.png')


if __name__ == '__main__':
    main()
