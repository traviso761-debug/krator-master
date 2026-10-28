#!/usr/bin/env python3
"""Scale model 4.24:
  - Region 99 (`rmvraoas90co7`) — The Loom-Chasms & Weavers' Cradle
  - Siphon Pits (`rmvra9zogfm9t`) — The Siphon Pits & Ostrukh Terraces

    python tools/scale-model/edit_424.py

Rebuilds both southeastern biome polygons from a blank slate inside their respective rims while integrating C1-smoothly
with the exact heights and slopes along each polygon boundary (0.000 m edge delta, zero polygonal cliff artifacts, zero
old crater/lake ghosts):

PART I — REGION 99 (`rmvraoas90co7`): THE LOOM-CHASMS & WEAVERS' CRADLE
1. Harmonic Rim Continuity & Scalloped Amphitheater Walls from exterior boundary elevations (+7,168 to +13,462 m).
2. Western Arable Piedmont (Weavers' Cradle, curved western crescent, +2,050 to +2,920 m, Dfb, 440-620 mm/yr).
3. The Fluted Monocline (The Weave-Step, 3 stepped basalt terraces, +2,060 down to +1,520 m, BSk).
4. The Loom-Chasms Tectonic Lattice (+1,380..+1,760 m Shuttle Mesas dissected by 10 NNE-SSW Warp Chasms and 7 acute
   Weft Canyons dropping 1,000-1,250 m to +250..+480 m chasm floors, BWk/BSh).
5. Mount Caelum Resurgent Massif (px [1350, 836], peak +4,597 m, Dsc/ET/EF, summit fumarole vent in `DATA.vents`).
6. Terminal Rift Sink: Lake Nim (px [1418, 848], level +240.0 m, 33 cells) & The White Loom halite playa (zone 5).

PART II — SIPHON PITS (`rmvra9zogfm9t`): THE SIPHON PITS & OSTRUKH TERRACES
1. The NW Arable Half-Graben (The Ostrukh Terraces, Station 1, X_px 1184..1305, Y_px 1057..1180):
   Down-dropped tectonic half-graben stepping down from the Stalker Range rim into 4 fertile loess terraces at +1,860
   to +2,420 m (1.26-1.36 atm, Dfb arable highland, 420-580 mm/yr), draining into Lake Ostrukh (px [1262, 1136],
   level +1,850.0 m, ~22 height cells) at the foot of the Central Scarp.
2. The Central Dividing Fault Escarpment & The Scarp Pass (Station 2, NE-SW from [1318, 1075] to [1255, 1185]):
   A 2,100 m stepped columnar-basalt fault wall separating the warm NW terraces from the freezing SE plateau, notched
   at px [1288, 1128] (+3,280 m) by the Scarp Pass caravan corridor (BSk/Dsc).
3. The SE High Basalt Plateau & Maar-Diatreme Siphon Pit Swarm (Stations 3 & 4, X_px 1295..1497, Y_px 1082..1298):
   A freezing subpolar flood-basalt plateau raised to +4,320..+4,720 m (ET alpine tundra / EF ice rim, 140-210 mm/yr)
   punched by 26 coalescing phreatomagmatic maar-diatreme explosion craters and magma-withdrawal collapse pits along
   3 volcano-tectonic fissure chains. Adjacent pits share knife-edge basalt bridges (The Arete Way, Station 4, px
   [1395, 1210], +4,480 m), while their sheer ring-fault walls plunge 1,750-2,100 m to warm geothermal pit floors at
   +2,220..+2,580 m (Station 3, px [1415, 1225], Cfb/Dfb thermal inversion oases, 540-680 mm/yr steam condensation,
   with 3 flagship diatreme vents in `DATA.vents` and crater lakes in the deepest maars).

Deterministic (seed 424). Restores clean 4.23 `model/data/` before running so execution is idempotent.
"""
import base64, io, json, math, os, shutil, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.terrain as T, smodel.climate as C, smodel.paint as PA   # noqa: E402

SEED = 424
BASE_COMMIT = 'cede0a0f9'
R99_ID = 'rmvraoas90co7'
SIPHON_ID = 'rmvra9zogfm9t'

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


def build_loom_terrain(Eo, whas0, wlev0, mask_h, su, sv):
    """Sculpt Region 99: Loom-Chasms, Weavers' Cradle piedmont, Fluted Monocline, Mount Caelum, and Lake Nim."""
    rs = np.random.RandomState(SEED)
    VH, VW = Eo.shape
    Y, X = np.indices((VH, VW))
    px = X / su
    py = Y / sv

    dist_cells = nd.distance_transform_edt(mask_h)
    Eo_harm = harmonic_fill(Eo, mask_h, dist_cells, pad=2.0)
    Eo_low = nd.gaussian_filter(Eo, sigma=7.0)
    Eo_ridge_detail = (Eo - Eo_low) * (1.0 - G.sstep(6.0, 15.0, dist_cells))

    n1 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 2.2)
    n2 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 4.5)
    proc_wall_ridges = (n1 / (np.std(n1) + 1e-9) * 180.0 + n2 / (np.std(n2) + 1e-9) * 260.0) * G.sstep(4.0, 12.0, dist_cells)

    warp_ang = (
        0.22 * np.sin(px * 0.042 + py * 0.036 + 0.7)
        + 0.15 * np.cos(px * 0.068 - py * 0.058 + 2.1)
        + 0.10 * np.sin(px * 0.125 + py * 0.102 - 1.4)
    )
    rim_spur_bias = np.clip((Eo_harm - 8200.0) / 4500.0, -0.20, 0.22)
    dist_org = dist_cells * np.clip(1.0 + warp_ang - rim_spur_bias * G.sstep(0.0, 8.0, dist_cells), 0.58, 1.50)

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
    h_piedmont = 2920.0 - 860.0 * (u_west ** 0.88) + fan_swales * (1.0 - 0.3 * u_west)

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
        (1308.0,  14.0,  7.5, 130.0, 0.4, 3.1, 460.0, 710.0, 955.0),
        (1321.0,  -9.0,  8.5, 145.0, 1.5, 3.6, 430.0, 700.0, 962.0),
        (1335.0,  16.5,  9.0, 135.0, 2.7, 3.8, 405.0, 692.0, 966.0),
        (1349.0, -11.0,  8.0, 140.0, 0.8, 3.5, 385.0, 690.0, 968.0),
        (1364.0,  13.0,  9.5, 150.0, 3.4, 4.1, 355.0, 692.0, 968.0),
        (1379.0, -12.5, 10.0, 138.0, 1.9, 4.3, 330.0, 695.0, 965.0),
        (1394.0,  15.0,  9.0, 142.0, 4.1, 4.4, 300.0, 702.0, 962.0),
        (1409.0, -10.0,  8.5, 132.0, 2.3, 4.2, 270.0, 710.0, 955.0),
        (1425.0,  11.5,  8.0, 128.0, 0.6, 3.8, 255.0, 720.0, 948.0),
        (1442.0, -13.0,  7.0, 122.0, 3.0, 3.2, 285.0, 735.0, 935.0),
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

    h_interior = (h_piedmont + mono_flutes) * (1.0 - stair) + h_graben * stair

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
    h_interior = np.where(w_cael > 0.01, np.maximum(h_interior, h_cael), h_interior)

    chasm_rim_zone = (chasm_depth_map > 0.08) & (chasm_depth_map < 0.85) & (dist_org > 18.0)
    weather_mask = mask_h & (
        ((r_cael_km >= 5.5) & (r_cael_km <= 43.0))
        | ((u_mono > 0.05) & (u_mono < 0.95) & (dist_org > 18.0))
        | chasm_rim_zone
    )
    h_interior = T.weather(h_interior, weather_mask)

    w_outer = G.sstep(1.6, 8.5, dist_cells)
    w_basin = G.sstep(4.5, 22.0, dist_org)

    rim_with_ridges = Eo_harm + Eo_ridge_detail + proc_wall_ridges * (1.0 - w_basin)
    h_blended = rim_with_ridges * (1.0 - w_basin) + h_interior * w_basin

    En = np.where(mask_h, Eo * (1.0 - w_outer) + h_blended * w_outer, Eo)
    En = np.clip(En, D_LO_HI[0], D_LO_HI[1])

    whas2 = whas0.copy()
    wlev2 = wlev0.copy()
    interior_clear = mask_h & (Eo < 3500.0)
    whas2[interior_clear] = False
    wlev2[interior_clear] = np.nan

    lake_nim_mask = mask_h & (r_nim_km <= 14.6) & (En < LAKE_NIM_LEV - 0.5)
    whas2[lake_nim_mask] = True
    wlev2[lake_nim_mask] = LAKE_NIM_LEV
    En = np.where((mask_h & (dist_cells >= 5.0)) & ~lake_nim_mask, np.maximum(En, LAKE_NIM_LEV + 1.5), En)

    return En, whas2, wlev2, lake_nim_mask, dist_cells, dist_org, r_nim_km, r_cael_km, x_tect, chasm_depth_map


def build_siphon_pits_terrain(Eo, En_in, whas_in, wlev_in, mask_sp, su, sv):
    """Sculpt Siphon Pits (`rmvra9zogfm9t`):
    - NW Ostrukh Terraces (arable half-graben at +1,860..+2,450 m + Lake Ostrukh at +1,850 m)
    - Central Dividing Fault Escarpment & The Scarp Pass (px [1288, 1128], +3,280 m)
    - SE High Basalt Plateau (+4,320..+4,720 m) & 26 Maar-Diatreme Siphon Pits (floors +2,220..+2,580 m, knife-edge Arete bridges)
    """
    rs = np.random.RandomState(SEED + 98)
    VH, VW = Eo.shape
    Y, X = np.indices((VH, VW))
    px = X / su
    py = Y / sv

    dist_sp = nd.distance_transform_edt(mask_sp)
    Eo_harm = harmonic_fill(Eo, mask_sp, dist_sp, pad=1.8)
    Eo_low = nd.gaussian_filter(Eo, sigma=6.0)
    Eo_ridge_detail = (Eo - Eo_low) * (1.0 - G.sstep(4.0, 11.0, dist_sp))

    n1 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 2.0)
    proc_rim_ridges = (n1 / (np.std(n1) + 1e-9) * 140.0) * G.sstep(2.5, 8.0, dist_sp)

    warp_sp = (
        0.20 * np.sin(px * 0.048 + py * 0.042 + 1.1)
        + 0.14 * np.cos(px * 0.078 - py * 0.064 + 0.4)
        + 0.09 * np.sin(px * 0.135 + py * 0.110 - 2.0)
    )
    dist_org_sp = dist_sp * np.clip(1.0 + warp_sp, 0.62, 1.45)

    # 1. Central Dividing Fault Coordinate (`scarp_u` in map px perpendicular to the NE-SW fault through [1288, 1128])
    # Fault strike runs from [1322, 1072] (NE) through [1288, 1128] (Scarp Pass) to [1252, 1186] (SW)
    # Normal vector points SE (azimuth ~ 122 deg):
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

    # 2. NW Arable Half-Graben: The Ostrukh Terraces (`scarp_u < -6`, X_px ~ 1184..1305, Y_px ~ 1057..1180)
    # Slopes from +2,460 m near the NW/N rim down to +1,865 m at the half-graben trough against the Central Scarp
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
    h_ostrukh = 1880.0 + 585.0 * ostrukh_steps + terrace_swales * (0.4 + 0.6 * u_nw)

    # Lake Ostrukh in the lowest half-graben pocket against the scarp toe at OSTRUKH_LAKE_PX (1262, 1136)
    dx_ost = (px - OSTRUKH_LAKE_PX[0]) * 2.0
    dy_ost = (py - OSTRUKH_LAKE_PX[1]) * 2.0
    u_ost = dx_ost * math.cos(ang_norm) + dy_ost * math.sin(ang_norm)
    v_ost = -dx_ost * math.sin(ang_norm) + dy_ost * math.cos(ang_norm)
    r_ost_km = np.hypot(u_ost * 1.32, v_ost * 0.72) + 2.4 * np.sin(v_ost * 0.16) + 1.4 * np.cos(u_ost * 0.22)
    w_ost_pool = 1.0 - G.sstep(7.5, 13.8, r_ost_km)
    h_ost_bed = (OSTRUKH_LAKE_LEV - 18.0) + 16.5 * G.sstep(0.0, 12.8, r_ost_km)
    h_ostrukh = h_ostrukh * (1.0 - w_ost_pool) + h_ost_bed * w_ost_pool

    # 3. Central Dividing Fault Escarpment (`scarp_u in -10..+22 px`) & Scarp Pass Gorge (`px [1288, 1128]`)
    u_scarp = np.clip((scarp_u + 10.0) / 32.0, 0.0, 1.0)
    scarp_stair = (
        G.sstep(0.00, 0.26, u_scarp) * 0.36
        + G.sstep(0.31, 0.62, u_scarp) * 0.36
        + G.sstep(0.67, 0.98, u_scarp) * 0.28
    )
    # Add rocky fault-block spurs & buttresses along the escarpment face (kept clear of Lake Ostrukh)
    scarp_spurs = (
        165.0 * np.sin(scarp_v * 0.16 + 0.8) * np.cos(scarp_u * 0.14)
        * np.exp(-((scarp_u - 4.0) / 13.0) ** 2)
        * (1.0 - w_ost_pool)
    )

    # 4. SE High Basalt Plateau (`scarp_u > +14 px`, elevation +4,280..+4,740 m)
    # Broad flood-basalt shield swells, wrinkle ridges, and frost-shattered periglacial domes
    shield_swells = (
        185.0 * np.sin((px - 1380.0) * 0.034 + (py - 1190.0) * 0.029)
        + 115.0 * np.cos((px - 1410.0) * 0.058 - (py - 1210.0) * 0.052)
        + 68.0 * np.sin((px - 1350.0) * 0.11 - (py - 1160.0) * 0.095)
    )
    h_se_plateau = 4425.0 + shield_swells + 85.0 * G.sstep(14.0, 62.0, scarp_u)

    # THE SIPHON PITS: 36-CRATER MULTI-SCALE COALESCING MAAR-DIATREME & COLLAPSE-CALDERA SWARM
    # Organized into 5 organic volcanic clusters & curved rift-fissure arcs across the SE plateau so adjacent
    # compound maars directly overlap/intersect and share razor-sharp knife-edge basalt walls (The Arete Way!).
    # Each pit is defined by: (xc_px, yc_px, rx_km, ry_km, rot_deg, floor_elev_m, has_lake, has_bench)
    siphon_pits = [
        # --- Cluster A: The Great Siphon Compound Caldera & Arete Nexus (Central-SE Plateau) ---
        (1412.0, 1222.0, 25.0, 19.5,  24.0, 2210.0, True,  True),   # Station 3: Flagship Great Siphon Maar (boiling lake + vent)
        (1396.0, 1209.0, 22.0, 17.5, -18.0, 2250.0, False, True),   # West Arete Compound Maar (directly intersects 1412,1222 -> Station 4 Arete bridge!)
        (1402.0, 1236.0, 18.5, 14.5,  38.0, 2290.0, False, True),   # South-Central Coalescing Maar (intersects 1412,1222)
        (1428.0, 1209.0, 19.0, 15.0,  12.0, 2305.0, False, True),   # East Arete Partner Maar (intersects 1412,1222)
        (1381.0, 1218.0, 17.0, 13.5,  44.0, 2335.0, False, False),  # Mid-Rift Intersecting Pit (intersects 1396,1209)
        (1424.0, 1234.0, 13.5, 11.0, -28.0, 2380.0, False, False),  # SE Scallop Bay Pit
        (1394.0, 1192.0, 13.0, 10.5,  19.0, 2395.0, False, False),  # North Collar Satellite Pit
        (1442.0, 1218.0, 11.5,  9.2,  31.0, 2440.0, False, False),  # Outer East Blowout Pit

        # --- Cluster B: Southwestern Twin-Siphon & Rift Trough (SW Plateau lobe) ---
        (1346.0, 1246.0, 24.0, 18.5,  29.0, 2260.0, True,  True),   # SW Flagship Boiling Maar + Diatreme Vent
        (1361.0, 1256.0, 19.0, 15.0, -22.0, 2315.0, False, True),   # Coalescing SE Partner Maar (intersects 1346,1246 -> SW Arete bridge)
        (1333.0, 1234.0, 18.0, 14.2,  16.0, 2345.0, False, False),  # NW Twin-Siphon Partner (intersects 1346,1246)
        (1348.0, 1265.0, 15.0, 12.0,  41.0, 2390.0, False, False),  # Southern Rim Scallop Pit
        (1322.0, 1250.0, 13.0, 10.5, -19.0, 2425.0, False, False),  # West Toe Collapse Pit
        (1366.0, 1234.0, 14.5, 11.5,  27.0, 2375.0, False, False),  # Rift Link Pit bridging Cluster B to Cluster A
        (1337.0, 1276.0, 10.5,  8.5,  12.0, 2480.0, False, False),  # Far South Satellite Diatreme
        (1377.0, 1266.0, 11.0,  9.0, -32.0, 2455.0, False, False),  # SE Marginal Blowout

        # --- Cluster C: Central Scarp-Crest & Mid-Plateau Maar Complex ---
        (1354.0, 1168.0, 23.0, 18.0,  18.0, 2285.0, True,  True),   # Northern Boiling Maar Lake
        (1338.0, 1179.0, 18.5, 14.8,  36.0, 2340.0, False, True),   # SW Coalescing Scarp-Crest Maar (intersects 1354,1168)
        (1368.0, 1155.0, 18.0, 14.2, -15.0, 2350.0, False, False),  # NE Coalescing Scarp-Crest Maar (intersects 1354,1168)
        (1378.0, 1172.0, 16.5, 13.0,  28.0, 2370.0, False, False),  # Central Plateau Link Maar
        (1322.0, 1192.0, 15.0, 12.0,  42.0, 2410.0, False, False),  # SW Escarpment Brow Pit
        (1362.0, 1188.0, 13.5, 10.8,  14.0, 2415.0, False, False),  # Inner Saddle Pit
        (1328.0, 1210.0, 11.8,  9.5, -12.0, 2455.0, False, False),  # West Rim Link Pit

        # --- Cluster D: Northwestern Scarp-Pass Headland Cluster (just SE of Scarp Pass [1288, 1128]) ---
        (1326.0, 1134.0, 19.5, 15.5,  26.0, 2330.0, False, True),   # NW Pass-Head Compound Maar
        (1314.0, 1148.0, 15.5, 12.5, -18.0, 2385.0, False, False),  # Coalescing Pass Overlook Maar
        (1340.0, 1122.0, 15.0, 12.0,  34.0, 2395.0, False, False),  # North Brow Coalescing Pit
        (1306.0, 1166.0, 12.5, 10.0,  15.0, 2440.0, False, False),  # Scarp Rim Satellite Diatreme
        (1362.0, 1114.0, 12.0,  9.6, -24.0, 2450.0, False, False),  # North Rim Diatreme

        # --- Cluster E: Northeastern & Eastern High-Plateau Maar Group ---
        (1440.0, 1152.0, 23.5, 18.2,  25.0, 2275.0, True,  True),   # Eastern Deep Geothermal Maar Lake + Vent
        (1424.0, 1162.0, 19.0, 15.0, -16.0, 2330.0, False, True),   # West-Coalescing Partner Maar (intersects 1440,1152 -> East Arete bridge)
        (1454.0, 1138.0, 17.5, 13.8,  34.0, 2365.0, False, False),  # NE Coalescing Maar (intersects 1440,1152)
        (1412.0, 1132.0, 18.0, 14.2,  19.0, 2355.0, False, True),   # North-East Plateau Maar
        (1396.0, 1142.0, 15.0, 12.0, -28.0, 2390.0, False, False),  # Coalescing Link Pit (intersects 1412,1132)
        (1434.0, 1118.0, 14.0, 11.2, -26.0, 2420.0, False, False),  # Northern Rim Maar
        (1446.0, 1172.0, 14.5, 11.5,  15.0, 2395.0, False, False),  # East-Central Link Pit
        (1470.0, 1120.0, 11.2,  9.0,  22.0, 2495.0, False, False),  # Far NE Corner Diatreme
    ]

    # Multi-octave rim-roughness field so each maar crater has an organic, scalloped, multi-bay volcanic collapse rim
    jag_a = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 1.8)
    jag_b = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 0.9)
    jag_field = (
        jag_a / (np.std(jag_a) + 1e-9) * 0.12
        + jag_b / (np.std(jag_b) + 1e-9) * 0.05
    )

    pit_depth_weight = np.zeros((VH, VW), dtype=float)
    pit_floor_elev = h_se_plateau.copy()
    pit_rim_tuff = np.zeros((VH, VW), dtype=float)
    pit_lake_mask = np.zeros((VH, VW), dtype=bool)
    pit_lake_lev = np.full((VH, VW), np.nan, dtype=float)

    # Track the two smallest normalized radii (`r_norm = r / r_rim`) at each cell to sculpt knife-edge Arete bridges!
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
            lk_m = mask_sp & (r_norm <= 0.34)
            pit_lake_mask |= lk_m
            pit_lake_lev = np.where(lk_m, fl_m + 14.0, pit_lake_lev)
            pit_floor_elev = np.where(lk_m, fl_m - 6.0 + 18.0 * (r_norm / 0.34), pit_floor_elev)

    # Enhance the knife-edge Arete bridges (Station 4) along the septum where two coalescing maars intersect
    # (`r1_min` and `r2_min` nearly equal and both in 0.62..1.05): raises a razor-thin basalt wall between the two pits!
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

    # Combine NW Ostrukh Terraces and SE Siphon Pits Plateau across the Central Fault Escarpment
    h_sp_interior = h_ostrukh * (1.0 - scarp_stair) + h_se_with_pits * scarp_stair + scarp_spurs
    # Guarantee Lake Ostrukh basin sits cleanly at h_ost_bed (+1,832..+1,848 m)
    h_sp_interior = h_sp_interior * (1.0 - w_ost_pool) + h_ost_bed * w_ost_pool

    # Carve the Scarp Pass caravan canyon at SCARP_PASS_PX (1288, 1128) + a winding S-bend gorge
    pass_curve = 4.5 * np.sin(scarp_u * 0.16 + 0.4)
    d_pass_perp = np.abs(scarp_v - pass_curve)
    d_pass_along = np.abs(scarp_u - 3.0)
    w_pass = (1.0 - G.sstep(2.8, 11.5, d_pass_perp)) * (1.0 - G.sstep(10.0, 28.0, d_pass_along))
    h_pass_floor = 2480.0 + 48.0 * np.clip(scarp_u + 14.0, 0.0, 36.0)
    h_sp_interior = h_sp_interior * (1.0 - 0.75 * w_pass) + np.minimum(h_sp_interior, h_pass_floor) * (0.75 * w_pass)

    # Weather the Central Fault Escarpment and NW Ostrukh terrace risers so dendritic streams dissect the scarp
    sp_weather_mask = mask_sp & (dist_org_sp > 6.0) & (scarp_u > -34.0) & (scarp_u < 28.0) & ~pit_lake_mask & (r_ost_km > 14.0)
    h_sp_interior = T.weather(h_sp_interior, sp_weather_mask)
    h_sp_interior = T.weather(h_sp_interior, sp_weather_mask & (np.abs(scarp_u) < 18.0))

    # 5. Seamless Rim-to-Basin Integration along the Siphon Pits polygon boundary
    w_outer_sp = G.sstep(1.5, 6.0, dist_sp)
    w_basin_sp = np.clip(G.sstep(3.0, 9.5, dist_org_sp) + w_ost_pool * G.sstep(4.5, 7.0, dist_sp), 0.0, 1.0)

    rim_sp = Eo_harm + Eo_ridge_detail + proc_rim_ridges * (1.0 - w_basin_sp)
    h_sp_blended = rim_sp * (1.0 - w_basin_sp) + h_sp_interior * w_basin_sp

    En_out = np.where(mask_sp, Eo * (1.0 - w_outer_sp) + h_sp_blended * w_outer_sp, En_in)
    En_out = np.clip(En_out, D_LO_HI[0], D_LO_HI[1])

    # 6. Water Mask & Water Levels inside Siphon Pits:
    # Drain the old 181-cell central marsh lake, add Lake Ostrukh (+1,850 m) in the NW half-graben,
    # and add the 4 deep geothermal maar crater lakes in the SE Siphon Pits!
    whas_out = whas_in.copy()
    wlev_out = wlev_in.copy()
    sp_clear = mask_sp & (dist_sp >= 3.0)
    whas_out[sp_clear] = False
    wlev_out[sp_clear] = np.nan

    ostrukh_lake_mask = mask_sp & (dist_sp >= 5.0) & (r_ost_km <= 12.2) & (En_out < OSTRUKH_LAKE_LEV - 0.5)
    whas_out[ostrukh_lake_mask] = True
    wlev_out[ostrukh_lake_mask] = OSTRUKH_LAKE_LEV

    maar_lakes_mask = mask_sp & (dist_sp >= 5.0) & pit_lake_mask & (pit_depth_weight > 0.85)
    whas_out[maar_lakes_mask] = True
    wlev_out[maar_lakes_mask] = pit_lake_lev[maar_lakes_mask]

    # Ensure dry land in the NW half-graben sits above Lake Ostrukh's level (+1,851.5 m)
    nw_dry = sp_clear & (scarp_u < 0.0) & ~ostrukh_lake_mask
    En_out = np.where(nw_dry, np.maximum(En_out, OSTRUKH_LAKE_LEV + 1.5), En_out)

    return (
        En_out, whas_out, wlev_out, ostrukh_lake_mask, maar_lakes_mask,
        dist_sp, dist_org_sp, scarp_u, pit_depth_weight, pit_rim_tuff, r_ost_km
    )


def build_hypsometric_table(EoF, wet0F, t0):
    """Build an empirical 50 m elevation-to-RGB lookup table from the planet's relief map `t0` on dry land."""
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
    """Map an elevation array `elev` (full-res) to its expected hypsometric RGB on the relief map `t`."""
    return np.stack([np.interp(elev, centers, meds[:, c]) for c in range(3)], axis=-1)


def compute_clean_hillshade(EnF, zf=5.0, az_deg=315.0, alt_deg=45.0):
    """Compute clean Lambertian hillshade multiplier directly from `EnF` (100% free of old 4.23 crater shadow rings)."""
    gy, gx = np.gradient(EnF / 1000.0 * zf, 2.0)
    a, l = math.radians(az_deg), math.radians(alt_deg)
    lx, ly, lz = math.cos(l) * math.sin(a), -math.cos(l) * math.cos(a), math.sin(l)
    lam = (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1.0)
    lam_local = lam - nd.uniform_filter(lam, size=25)
    shade = np.clip(1.0 + 0.68 * lam_local, 0.54, 1.48)
    return shade[..., None]


def main():
    global D_LO_HI
    # restore the pre-4.24 data (cede0a0f9) so the script is idempotent now that its own output is committed
    subprocess.check_call(['git', 'checkout', BASE_COMMIT, '--', 'tools/scale-model/model/data/'], cwd=REPO_ROOT)

    D = P.load()
    D_LO_HI = (D['lo'], D['hi'])
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    su, sv = P.grid(D)
    OH, OW = D['fullH'], D['fullW']
    VH, VW = Eo.shape

    R = P.docs(os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'regions.json'))
    r99 = next(r for r in R if r['id'] == R99_ID or r['name'].lower() == 'region 99')
    pts99 = r99['points']
    mask99_h = G.poly(pts99, su, sv, (VH, VW))
    mask99_f = G.poly(pts99, 1.0, 1.0, (OH, OW))

    sp_reg = next(r for r in R if r['id'] == SIPHON_ID or r['name'].lower() == 'siphon pits')
    pts_sp = sp_reg['points']
    mask_sp_h = G.poly(pts_sp, su, sv, (VH, VW))
    mask_sp_f = G.poly(pts_sp, 1.0, 1.0, (OH, OW))

    print('--- Step 1A: Sculpting Region 99 (Loom-Chasms & Weavers\' Cradle) ---')
    (En, whas2, wlev2, lake_nim_mask, dist99_cells, dist99_org,
     r_nim_km, r_cael_km, x_tect_h, chasm_depth_h) = build_loom_terrain(
        Eo, whas0, wlev0, mask99_h, su, sv
    )
    edge99 = mask99_h & (dist99_cells <= 1.5)
    max_edge99 = float(np.abs(En[edge99] - Eo[edge99]).max())
    print('  Region 99 elev: min %.1f m, max %.1f m, med %.1f m | edge delta: %.3f m' % (
        En[mask99_h].min(), En[mask99_h].max(), np.median(En[mask99_h]), max_edge99))
    assert max_edge99 < 5.0, f'Region 99 boundary jump too large: {max_edge99}'

    print('--- Step 1B: Sculpting Siphon Pits (Ostrukh Terraces, Scarp Pass & Maar-Diatreme Swarm) ---')
    (En, whas2, wlev2, ostrukh_lake_mask, maar_lakes_mask,
     dist_sp_cells, dist_sp_org, scarp_u_h, pit_depth_h, pit_tuff_h, r_ost_km) = build_siphon_pits_terrain(
        Eo, En, whas2, wlev2, mask_sp_h, su, sv
    )
    edge_sp = mask_sp_h & (dist_sp_cells <= 1.5)
    max_edge_sp = float(np.abs(En[edge_sp] - Eo[edge_sp]).max())
    print('  Siphon Pits elev: min %.1f m, max %.1f m, med %.1f m | edge delta: %.3f m' % (
        En[mask_sp_h].min(), En[mask_sp_h].max(), np.median(En[mask_sp_h]), max_edge_sp))
    print('  Lake Ostrukh cells: %d (~%d km2) | Maar crater lake cells: %d (~%d km2)' % (
        int(ostrukh_lake_mask.sum()), int(ostrukh_lake_mask.sum() * 16),
        int(maar_lakes_mask.sum()), int(maar_lakes_mask.sum() * 16)))
    assert max_edge_sp < 5.0, f'Siphon Pits boundary jump too large: {max_edge_sp}'

    # --- Step 2: Update Temperatures via Lapse Rate (-6.5 C/km) + Siphon Pit Geothermal Inversion ---
    print('--- Step 2: Updating 5 Temperature Rasters (C.lapse + Siphon Pit Geothermal Inversion) ---')
    lapsed_temps = C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2)
    for k, v in lapsed_temps.items():
        D[k] = v

    zoom = (OH / VH, OW / VW)
    EoF = nd.zoom(Eo, zoom, order=1)[:OH, :OW]
    EnF = nd.zoom(En, zoom, order=1)[:OH, :OW]
    dist99F = nd.zoom(dist99_cells, zoom, order=1)[:OH, :OW]
    dist99OrgF = nd.zoom(dist99_org, zoom, order=1)[:OH, :OW]
    xTectF = nd.zoom(x_tect_h, zoom, order=1)[:OH, :OW]
    chasmF = nd.zoom(chasm_depth_h, zoom, order=1)[:OH, :OW]
    rNimF = nd.zoom(r_nim_km, zoom, order=1)[:OH, :OW]
    rCaelF = nd.zoom(r_cael_km, zoom, order=1)[:OH, :OW]

    distSpF = nd.zoom(dist_sp_cells, zoom, order=1)[:OH, :OW]
    distSpOrgF = nd.zoom(dist_sp_org, zoom, order=1)[:OH, :OW]
    scarpUF = nd.zoom(scarp_u_h, zoom, order=1)[:OH, :OW]
    pitDepthF = nd.zoom(pit_depth_h, zoom, order=1)[:OH, :OW]
    pitTuffF = nd.zoom(pit_tuff_h, zoom, order=1)[:OH, :OW]
    rOstF = nd.zoom(r_ost_km, zoom, order=1)[:OH, :OW]

    wet0F = nd.zoom(whas0.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)
    wet2F = nd.zoom(whas2.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)

    # Add +6.5 C geothermal inversion boost inside the sunken Siphon Pit floors (Station 3) and +3.5 C foehn warming
    # across the NW Ostrukh Terraces (Station 1) so the temperature rasters reflect the thermal traps!
    w_sp_inner = G.sstep(2.0, 9.0, distSpOrgF) * mask_sp_f.astype(float)
    geothermal_boost = 7.5 * G.sstep(0.35, 0.85, pitDepthF) * w_sp_inner
    foehn_boost = 3.5 * (1.0 - G.sstep(-12.0, 10.0, scarpUF)) * G.sstep(2800.0, 2100.0, EnF) * w_sp_inner
    temp_boost = geothermal_boost + foehn_boost

    for k in ('tm', 'th', 'tl', 'tw', 'tc'):
        arr_t = P.raster(D, k, 'L').astype(float) - 90.0
        valid_t = arr_t > -89.0
        arr_t = np.where(valid_t & (temp_boost > 0.05), np.round(arr_t + temp_boost), arr_t)
        D[k] = P.b64(Image.fromarray(np.clip(arr_t + 90.0, 0, 255).astype(np.uint8), 'L'), optimize=True)

    # --- Step 3: Recompute Rain, Climate Classes, and Hypsometric Zones ---
    print('--- Step 3: Updating Rain, Climate Classes, and Zones for Region 99 & Siphon Pits ---')
    rain0 = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
    cls0 = P.raster(D, 'c', 'L')
    zon0 = P.raster(D, 'z', 'L')
    YF, XF = np.indices((OH, OW))

    # 4.24b WATER BUDGET: both basins sit in the rim's rain shadow, so the rain itself stays low (~80-260 mm on the
    # floors). Their water comes from elsewhere and is concentrated, not spread:
    #   - rim springs: rain on the wet outer rim soaks into the fractured basalt and comes out where faults and chasm
    #     walls cut the aquifer (Snake River 'Thousand Springs' style): spring lines at the chasm-wall toes;
    #   - spillover snow: the band 10-20 km inside the crest gets snow blown over it, feeding short melt rivers;
    #   - rock glaciers / permafrost on the Siphon plateau and Mount Caelum release water late into summer;
    #   - hot springs (recycled groundwater) and steam condensing in the deep maars (moss and felt, not fields).
    # The oasis masks below carry those waters: green appears only there.
    river_corr_img = Image.new('L', (OW, OH), 0)
    dr_rc = ImageDraw.Draw(river_corr_img)
    for r in D['rivers']:
        pts_r = r.get('px') or []
        if r.get('kind', 'river') != 'river' or len(pts_r) < 2:
            continue
        dr_rc.line([tuple(p) for p in pts_r], fill=1, width=7)
    river_corr_f = np.array(river_corr_img, dtype=bool)

    # Region 99 oases: the melt-river fans of Weavers' Cradle and the spring lines at the west chasm-wall toes
    oasis99_river = river_corr_f & mask99_f & (EnF < 3000.0) & (dist99OrgF >= 8.0)
    oasis99_spring = mask99_f & (chasmF >= 0.50) & (chasmF <= 0.90) & (xTectF < 1400.0) & (EnF < 1300.0)
    oasis99_f = nd.binary_closing(oasis99_river | oasis99_spring, iterations=1) & mask99_f
    spill99 = mask99_f & (dist99OrgF >= 6.0) & (dist99OrgF < 30.0)       # spillover-snow band inside the crest

    # Siphon Pits oases: Lake Ostrukh's shore (fresh: fed by the Ostrukh River and scarp-foot springs, drained by
    # seepage through the basalt toward Region 101), the terrace rivers, and the floors of the four lake maars
    lake_pits = ((1412.0, 1222.0), (1346.0, 1246.0), (1354.0, 1168.0), (1440.0, 1152.0))
    near_lake_pit = np.zeros((OH, OW), dtype=bool)
    for lx, ly in lake_pits:
        near_lake_pit |= np.hypot(XF - lx, YF - ly) < 11.0
    oasis_sp_shore = mask_sp_f & (rOstF < 26.0) & (scarpUF < 2.0)
    oasis_sp_river = river_corr_f & mask_sp_f & (scarpUF < 4.0) & (EnF < 2800.0)
    oasis_sp_pit = mask_sp_f & near_lake_pit & (pitDepthF >= 0.70)
    oasis_sp_f = (oasis_sp_shore | oasis_sp_river | oasis_sp_pit) & mask_sp_f
    oasis_all_f = oasis99_f | oasis_sp_f

    # Region 99 target rain
    w_west_rain = 1.0 - G.sstep(1275.0, 1332.0, xTectF)
    w_cael_rain = (1.0 - G.sstep(10.0, 44.0, rCaelF)) * G.sstep(1500.0, 3400.0, EnF)
    w_rim_rain = G.sstep(3100.0, 5600.0, EnF)
    target_rain_99 = (
        62.0 + 28.0 * np.sin(XF * 0.025 + YF * 0.022)
        + 40.0 * chasmF * (1.0 - G.sstep(22.0, 48.0, rNimF))
        + 150.0 * w_west_rain * (1.0 - G.sstep(3400.0, 5600.0, EnF))
        + 120.0 * spill99 * (EnF < 3600.0)
        + 200.0 * w_cael_rain
        + 240.0 * w_rim_rain * (1.0 - G.sstep(6800.0, 8800.0, EnF))
    )
    target_rain_99 = np.where(EnF >= 8800.0, 0.0, np.clip(target_rain_99, 24.0, 1200.0))
    w_rain_99 = G.sstep(4.0, 14.0, dist99OrgF) * mask99_f.astype(float)

    # Siphon Pits target rain: dry terraces (~210-280 mm), dry subpolar plateau (~140-200 mm), pits a little wetter
    # from their own steam (~230-300 mm)
    w_ost_rain = 1.0 - G.sstep(-10.0, 16.0, scarpUF)
    w_pit_rain = G.sstep(0.30, 0.80, pitDepthF)
    target_rain_sp = (
        150.0 + 25.0 * np.cos(XF * 0.03 - YF * 0.025)
        + 95.0 * w_ost_rain * (1.0 - G.sstep(2900.0, 4200.0, EnF))
        + 110.0 * w_pit_rain
    )
    target_rain_sp = np.where(EnF >= 8800.0, 0.0, np.clip(target_rain_sp, 40.0, 1200.0))
    w_rain_sp = G.sstep(0.5, 4.0, distSpF) * mask_sp_f.astype(float)

    target_rain = np.where(mask_sp_f, target_rain_sp, target_rain_99)
    # the oases' effective water (springs, melt, irrigation from the lake) as rain-equivalent, so the class follows
    target_rain = np.where(oasis_all_f, np.maximum(target_rain, 430.0), target_rain)
    w_rain_blend = np.maximum(w_rain_99, w_rain_sp)

    forced = np.zeros((OH, OW), dtype=bool)
    rain2, cls2, zon2, q_changed, clim_rep = C.reclimate(
        D, Eo, En, whas2, forced, force_rain=(target_rain, w_rain_blend)
    )

    codes = [c['code'] for c in D['climate']['classes']]
    idx_BWk = codes.index('BWk')
    idx_BSh = codes.index('BSh')
    idx_BSk = codes.index('BSk')
    idx_Cfa = codes.index('Cfa')
    idx_Cfb = codes.index('Cfb')
    idx_Dfb = codes.index('Dfb')
    idx_Dsc = codes.index('Dsc')
    idx_Dsb = codes.index('Dsb')
    idx_Cwb = codes.index('Cwb')
    idx_Cwc = codes.index('Cwc')
    idx_Csa = codes.index('Csa')
    idx_Csb = codes.index('Csb')
    idx_Dwc = codes.index('Dwc')
    idx_BWh = codes.index('BWh')
    tmF = P.raster(D, 'tm', 'L').astype(float) - 90.0
    idx_ET = codes.index('ET')
    idx_EF = codes.index('EF')
    idx_HF = codes.index('HF')
    idx_O = codes.index('O')
    idx_WS = codes.index('WS')

    # --- Region 99 Climate & Zone Assignment (4.24b: dry rain-shadow basin, green only at its waters) ---
    inner99_f = mask99_f & (dist99OrgF >= 10.0) & ~wet2F
    # chasm floors: hot or cold desert by their own warmth
    deep_f = inner99_f & (EnF < 460.0) & (chasmF > 0.55) & (xTectF > 1345.0)
    cls2[deep_f & (tmF >= 18.0)] = idx_BWh
    cls2[deep_f & (tmF < 18.0)] = idx_BWk
    arid99_f = inner99_f & (EnF < 1850.0) & ~deep_f
    cls2[arid99_f & ((EnF < 1520.0) | (xTectF > 1365.0))] = idx_BWk
    cls2[arid99_f & (EnF >= 1520.0) & (xTectF <= 1365.0)] = idx_BSk
    cls2[inner99_f & (xTectF >= 1288.0) & (xTectF <= 1338.0) & (EnF >= 1450.0) & (EnF < 2150.0)] = idx_BSk
    # Weavers' Cradle: cold loess steppe, dry-summer continental in the spillover-snow band under the rim
    cradle_f = inner99_f & (xTectF < 1302.0) & (EnF >= 1850.0) & (EnF < 3150.0)
    cls2[cradle_f] = idx_BSk
    cls2[cradle_f & spill99 & (EnF >= 2300.0)] = idx_Dsb
    cls2[inner99_f & (EnF >= 3150.0) & (EnF < 3950.0)] = idx_Dsc
    cls2[inner99_f & (EnF >= 3950.0) & (EnF < 5400.0)] = idx_ET
    cls2[inner99_f & (EnF >= 5400.0) & (EnF < 6800.0)] = idx_EF
    cls2[inner99_f & (EnF >= 6800.0) & (EnF < 8800.0)] = idx_HF
    cls2[inner99_f & (EnF >= 8800.0)] = idx_O
    # the oases: melt-river fans (subtropical-highland Cwb, Cwc higher up) and warm chasm spring lines (Csa / Csb)
    o99 = oasis99_f & inner99_f & (EnF < 3150.0)
    cls2[o99 & (EnF >= 1500.0) & (EnF < 2700.0)] = idx_Cwb
    cls2[o99 & (EnF >= 2700.0)] = idx_Cwc
    cls2[o99 & (EnF < 1500.0) & (tmF >= 16.0)] = idx_Csa
    cls2[o99 & (EnF < 1500.0) & (tmF < 16.0)] = idx_Csb

    w_nim_f = mask99_f & (EoF < 3500.0) & wet2F
    cls2[w_nim_f] = idx_WS

    zon2[inner99_f & (EnF < 1350.0)] = 0
    zon2[inner99_f & (EnF >= 1350.0) & (EnF < 4800.0)] = 1
    zon2[inner99_f & (EnF >= 4800.0) & (EnF < 8200.0)] = 3
    zon2[inner99_f & (EnF >= 8200.0)] = 2
    playa99_f = inner99_f & (rNimF <= 52.0) & (EnF < 285.0) & ~wet2F
    zon2[playa99_f] = 5
    zon2[w_nim_f] = 4

    # --- Siphon Pits Climate & Zone Assignment (4.24b) ---
    inner_sp_f = mask_sp_f & (distSpF >= 1.2) & ~wet2F
    # 1. NW Ostrukh Terraces: cold steppe below, dry-summer continental on the upper benches
    terr_f = inner_sp_f & (scarpUF < -2.0) & (EnF < 2800.0)
    cls2[terr_f] = idx_BSk
    cls2[terr_f & (EnF >= 2200.0)] = idx_Dsb
    # 2. Central Dividing Fault Escarpment & Scarp Pass -> BSk at toe/pass, Dsc on the cliff, dry-winter Dwc on the brow
    cls2[inner_sp_f & (scarpUF >= -6.0) & (scarpUF <= 12.0) & (EnF >= 2450.0) & (EnF < 3080.0)] = idx_BSk
    cls2[inner_sp_f & (EnF >= 2750.0) & (EnF < 3850.0) & (pitDepthF < 0.32)] = idx_Dsc
    cls2[inner_sp_f & (scarpUF >= 4.0) & (scarpUF <= 16.0) & (EnF >= 3300.0) & (EnF < 3850.0) & (pitDepthF < 0.32)] = idx_Dwc
    # 3. High SE Basalt Plateau & Arete Bridges -> ET (alpine tundra) & EF (> 5250 m)
    cls2[inner_sp_f & (EnF >= 3850.0) & (EnF < 5250.0) & (pitDepthF < 0.32)] = idx_ET
    cls2[inner_sp_f & (EnF >= 5250.0) & (EnF < 6800.0)] = idx_EF
    cls2[inner_sp_f & (EnF >= 6800.0)] = idx_HF
    # 4. The pits: collars and dry floors are steppe / dry-summer continental (steam moss and felt, no fields);
    #    only the floors of the four lake maars, with their hot springs, are green
    cls2[inner_sp_f & (pitDepthF >= 0.32) & (pitDepthF < 0.64)] = idx_Dsc
    cls2[inner_sp_f & (pitDepthF >= 0.64)] = idx_Dsb
    cls2[inner_sp_f & (pitDepthF >= 0.64) & (EnF < 2300.0) & (tmF >= 10.0)] = idx_BSk
    pit_oasis_f = inner_sp_f & oasis_sp_pit
    cls2[pit_oasis_f & (EnF >= 2350.0)] = idx_Cfb
    cls2[pit_oasis_f & (EnF < 2350.0)] = idx_Cfa
    # 5. Ostrukh's farmland: the lakeshore and terrace rivers, watered by the fresh lake and scarp-foot springs
    farm_f = inner_sp_f & (oasis_sp_shore | oasis_sp_river) & (EnF < 2800.0)
    cls2[farm_f] = idx_Cwb
    # 6. Lake Ostrukh & Maar Crater Lakes -> WS
    w_sp_lakes_f = mask_sp_f & (distSpF >= 3.0) & wet2F
    cls2[w_sp_lakes_f] = codes.index('WH')   # highland lakes (Ostrukh fresh at 1,850 m; the maar lakes)

    zon2[inner_sp_f & (EnF < 4300.0)] = 1                  # highland terraces & pit floors
    zon2[inner_sp_f & (EnF >= 4300.0) & (EnF < 8200.0)] = 3 # arctic / subpolar basalt plateau
    zon2[inner_sp_f & (EnF >= 8200.0)] = 2
    zon2[w_sp_lakes_f] = 4

    # --- Yuni farming settlements (support towns for expeditions): the densest patch of each basin's oasis land ---
    def best_site(m):
        dens = nd.uniform_filter(m.astype(float), 9)
        dens = np.where(m, dens, -1.0)
        iy, ix = np.unravel_index(int(np.argmax(dens)), dens.shape)
        return [int(ix), int(iy)], round(float(EnF[iy, ix]), 0), codes[int(cls2[iy, ix])], round(float(dens[iy, ix]), 2)
    site_loom = best_site(o99 & (cls2 == idx_Cwb))
    site_ost = best_site(farm_f & (cls2 == idx_Cwb))
    print('  Yuni site, Loom-Chasms:', site_loom, '| Ostrukh:', site_ost)

    total_px = float(cls2.size)
    for entry in D['climate']['present']:
        c_idx = codes.index(entry['code'])
        entry['pct'] = round(float((cls2 == c_idx).sum()) / total_px * 100.0, 2)

    print('  Region 99 climate breakdown:', {
        codes[k]: int((cls2[mask99_f] == k).sum()) for k in np.unique(cls2[mask99_f])
    })
    print('  Siphon Pits climate breakdown:', {
        codes[k]: int((cls2[mask_sp_f] == k).sum()) for k in np.unique(cls2[mask_sp_f])
    })

    # --- Step 4: Update Rivers in Both Regions & Build Old-River Erase Mask ---
    print('--- Step 4: Updating River Courses & Bed Profiles in Region 99 & Siphon Pits ---')
    both_mask_f = mask99_f | mask_sp_f
    old_riv_mask = Image.new('L', (OW, OH), 0)
    dr_old = ImageDraw.Draw(old_riv_mask)
    for r in D['rivers']:
        pts_r = r.get('px') or []
        if not pts_r:
            continue
        if any(0 <= int(py_) < OH and 0 <= int(px_) < OW and both_mask_f[int(py_), int(px_)] for px_, py_ in pts_r):
            if r.get('kind') == 'river':
                dr_old.line([tuple(p) for p in pts_r], fill=1, width=5)
    old_riv_f = np.array(old_riv_mask, dtype=bool) & both_mask_f

    custom_names = [
        ('Weavers\' Run', 'English: the main glacial river watering Weavers\' Cradle'),
        ('Caelum Rill', 'English: meltwater stream descending Mount Caelum'),
        ('Warp Gorge River', 'English: canyon river threading the central Loom-Chasm'),
        ('Spindle Wash', 'English: braided stream crossing the Fluted Monocline'),
        ('Shuttle Creek', 'English: brine stream feeding Lake Nim'),
        ('Halite Draw', 'English: seasonal salt wadi entering the White Loom'),
        ('Ostrukh River', 'English: glacial meltwater river watering the Ostrukh Terraces'),
        ('Scarp Gorge Run', 'English: stream descending the Scarp Pass into Lake Ostrukh'),
        ('Siphon Melt', 'English: runoff channel draining the northwest Siphon Pits'),
    ]
    name_idx = 0
    rivers_touched = 0
    for r in D['rivers']:
        pts_r = r.get('px') or []
        if not pts_r:
            continue
        in_edit = any(0 <= int(py_) < OH and 0 <= int(px_) < OW and both_mask_f[int(py_), int(px_)] for px_, py_ in pts_r)
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

    print(f'  Rivers updated across both regions: {rivers_touched} | Climbing rivers: 0')

    # --- Step 5: Repaint st, t, rt, ct for Both Regions ---
    print('--- Step 5: Inpainting old lakes/rivers, computing clean EnF hillshade, and painting st, t, rt, ct ---')
    st0 = P.raster(D, 'st')
    t0 = P.raster(D, 't')
    rt0 = P.raster(D, 'rt')
    ct0 = P.raster(D, 'ct')
    t0_f = t0.astype(float)

    wpaint99 = mask99_f & (EoF < 3500.0) & ((t0_f[..., 1] > t0_f[..., 0] + 18.0) & (t0_f[..., 2] > t0_f[..., 0] + 10.0))
    hole99 = mask99_f & (EoF < 3500.0) & (wet0F | (cls0 == idx_WS) | wpaint99 | old_riv_f) & ~wet2F
    hole_sp = mask_sp_f & (distSpF >= 3.0) & (wet0F | (cls0 == idx_WS) | old_riv_f) & ~wet2F
    drained_hole = nd.binary_dilation(hole99 | hole_sp, iterations=3)
    land_donor = (mask99_f | mask_sp_f) & ~drained_hole & (EoF >= 700.0) & (EoF <= 3900.0)

    D_clean = dict(D)
    for k, arr0 in (('st', st0), ('t', t0), ('rt', rt0), ('ct', ct0)):
        inp = PA.inpaint(arr0, drained_hole, src=land_donor)
        D_clean[k] = P.b64(Image.fromarray(inp, 'RGB'), 'JPEG', quality=94)

    relit, _, _ = PA.relight(D_clean, Eo, En, keys=('st', 't', 'rt', 'ct'))

    rs_tex = np.random.RandomState(SEED + 7)
    fine_grain = 1.0 + nd.gaussian_filter(rs_tex.normal(0.0, 0.035, (OH, OW)), 0.9)[..., None]
    clean_shade = compute_clean_hillshade(EnF, zf=5.0, az_deg=315.0, alt_deg=45.0) * fine_grain

    w_paint_99 = G.sstep(2.0, 8.5, dist99F) * G.sstep(4.5, 13.5, dist99OrgF)
    w_paint_sp = G.sstep(1.5, 5.5, distSpF) * G.sstep(2.2, 7.5, distSpOrgF)
    w_paint_sp_ct = G.sstep(0.8, 3.5, distSpF) * mask_sp_f.astype(float)
    w_paint_both = np.maximum(w_paint_99, w_paint_sp)[..., None]
    w_paint_both_ct = np.maximum(w_paint_99, w_paint_sp_ct)[..., None]

    all_new_lakes_f = w_nim_f | w_sp_lakes_f
    din_lakes = nd.distance_transform_edt(all_new_lakes_f)

    # 5c. Repaint `t` (Relief map) using empirical hypsometric curve * `clean_shade`
    t_relit = np.array(Image.open(io.BytesIO(base64.b64decode(relit['t']))).convert('RGB')).astype(float)
    hypso_centers, hypso_meds = build_hypsometric_table(EoF, wet0F, t0_f)
    new_hypso = eval_hypso(EnF, hypso_centers, hypso_meds)

    t_synthesized = np.clip(new_hypso * clean_shade, 0.0, 255.0)
    t_lake_col = np.where(din_lakes[..., None] > 2.5, np.array([42.0, 108.0, 114.0]), np.array([85.0, 138.0, 128.0]))
    t_synthesized = np.where(all_new_lakes_f[..., None], t_lake_col * np.clip(clean_shade, 0.88, 1.12), t_synthesized)
    t_final = np.clip(t_relit * (1.0 - w_paint_both) + t_synthesized * w_paint_both, 0.0, 255.0).round().astype(np.uint8)

    # 5d. Repaint `rt` (Rain map)
    rt_relit = np.array(Image.open(io.BytesIO(base64.b64decode(relit['rt']))).convert('RGB')).astype(float)
    rt_synthesized = np.clip(PA.ramp(rain2) * (0.28 + 0.72 * clean_shade), 0.0, 255.0)
    rt_synthesized = np.where(all_new_lakes_f[..., None], np.array([48.0, 110.0, 135.0]), rt_synthesized)
    rt_final = np.clip(rt_relit * (1.0 - w_paint_both_ct) + rt_synthesized * w_paint_both_ct, 0.0, 255.0).round().astype(np.uint8)

    # 5e. Repaint `ct` (Climate map)
    ct_relit = np.array(Image.open(io.BytesIO(base64.b64decode(relit['ct']))).convert('RGB')).astype(float)
    class_rgb = np.array([
        [int(c['color'][1:3], 16), int(c['color'][3:5], 16), int(c['color'][5:7], 16)]
        for c in D['climate']['classes']
    ], dtype=float)
    ct_synthesized = np.clip(class_rgb[cls2] * (0.38 + 0.62 * clean_shade), 0.0, 255.0)
    ct_final = np.clip(ct_relit * (1.0 - w_paint_both_ct) + ct_synthesized * w_paint_both_ct, 0.0, 255.0).round().astype(np.uint8)

    # 5f. Repaint `st` (Satellite map) for both Region 99 and Siphon Pits
    st_relit = np.array(Image.open(io.BytesIO(base64.b64decode(relit['st']))).convert('RGB')).astype(float)
    tm_new = P.raster(D, 'tm', 'L').astype(float) - 90.0

    st_clean_base = st_relit.copy()
    neutral_base = np.full_like(st_relit, 128.0) * clean_shade
    w_clean_lum_99 = G.sstep(2.0, 8.5, dist99F) * G.sstep(5.0, 15.0, dist99OrgF) * G.sstep(5600.0, 4300.0, EnF)
    w_clean_lum_sp = G.sstep(1.8, 6.0, distSpF) * G.sstep(3.0, 9.5, distSpOrgF) * G.sstep(5600.0, 4650.0, EnF)
    w_clean_lum = np.maximum(w_clean_lum_99, w_clean_lum_sp)[..., None]
    st_clean_base = np.clip(st_clean_base * (1.0 - w_clean_lum) + neutral_base * w_clean_lum, 0.0, 255.0).round().astype(np.uint8)

    w_clim_99 = G.sstep(2.0, 8.5, dist99F) * G.sstep(5.0, 15.0, dist99OrgF) * G.sstep(5400.0, 4100.0, EnF)
    w_clim_sp = G.sstep(1.8, 6.0, distSpF) * G.sstep(3.0, 9.5, distSpOrgF) * G.sstep(5500.0, 4600.0, EnF)
    w_climate_paint = np.maximum(w_clim_99, w_clim_sp)

    st_clim = PA.by_climate(st_clean_base, EnF, rain2, tm_new, wet2F, both_mask_f, w_climate_paint)
    w_arid_paint = w_clim_99 * G.sstep(260.0, 120.0, rain2) * G.sstep(2200.0, 1200.0, EnF)
    st_clim = PA.desert(st_clim, EnF, rain2, tm_new, wet2F, mask99_f, w_arid_paint, mm=150.0, step=250.0)

    st_f = st_clim.astype(float)

    # --- Region 99 Satellite Art Direction ---
    w_mesa_st = w_clim_99 * (1.0 - chasmF) * G.sstep(1265.0, 1340.0, xTectF) * (1.0 - G.sstep(1850.0, 2500.0, EnF))
    st_f = st_f * (1.0 - 0.58 * w_mesa_st[..., None]) + (np.array([166.0, 104.0, 74.0]) * clean_shade) * (0.58 * w_mesa_st[..., None])

    w_chasm_wall = w_clim_99 * np.clip(chasmF * (1.0 - chasmF) * 4.0, 0.0, 1.0)
    st_f = st_f * (1.0 - 0.76 * w_chasm_wall[..., None]) + (np.array([72.0, 48.0, 38.0]) * clean_shade) * (0.76 * w_chasm_wall[..., None])

    w_chasm_floor = w_clim_99 * G.sstep(0.42, 0.85, chasmF) * (1.0 - G.sstep(16.0, 42.0, rNimF))
    st_f = st_f * (1.0 - 0.68 * w_chasm_floor[..., None]) + (np.array([102.0, 92.0, 66.0]) * clean_shade) * (0.68 * w_chasm_floor[..., None])

    # Weavers' Cradle: dry loess steppe (straw and ochre); green only on the melt-river fans and chasm spring lines
    w_cradle_st = w_clim_99 * (1.0 - G.sstep(1275.0, 1312.0, xTectF)) * G.sstep(1850.0, 2150.0, EnF) * (1.0 - G.sstep(3000.0, 3600.0, EnF))
    st_f = st_f * (1.0 - 0.62 * w_cradle_st[..., None]) + (np.array([156.0, 136.0, 94.0]) * clean_shade) * (0.62 * w_cradle_st[..., None])
    w_oasis99_st = w_clim_99 * np.clip(nd.gaussian_filter(oasis99_f.astype(float), 1.2) * 1.6, 0.0, 1.0) * (~wet2F)
    st_f = st_f * (1.0 - 0.70 * w_oasis99_st[..., None]) + (np.array([70.0, 108.0, 56.0]) * clean_shade) * (0.70 * w_oasis99_st[..., None])

    w_subalp_st = G.sstep(2.0, 8.5, dist99F) * G.sstep(4.5, 14.0, dist99OrgF) * G.sstep(2700.0, 3300.0, EnF) * (1.0 - G.sstep(4100.0, 4700.0, EnF))
    st_f = st_f * (1.0 - 0.65 * w_subalp_st[..., None]) + (np.array([138.0, 92.0, 74.0]) * clean_shade) * (0.65 * w_subalp_st[..., None])

    w_playa_st = w_clim_99 * (1.0 - G.sstep(14.0, 50.0, rNimF)) * (~wet2F).astype(float) * G.sstep(310.0, 255.0, EnF)
    st_f = st_f * (1.0 - 0.82 * w_playa_st[..., None]) + (np.array([228.0, 220.0, 206.0]) * np.clip(clean_shade, 0.80, 1.16)) * (0.82 * w_playa_st[..., None])

    w_cael_rock = (1.0 - G.sstep(12.0, 44.0, rCaelF)) * G.sstep(2100.0, 2800.0, EnF) * (1.0 - G.sstep(3850.0, 4350.0, EnF))
    st_f = st_f * (1.0 - 0.68 * w_cael_rock[..., None]) + (np.array([106.0, 74.0, 62.0]) * clean_shade) * (0.68 * w_cael_rock[..., None])

    w_cael_snow = (1.0 - G.sstep(16.0, 38.0, rCaelF)) * G.sstep(3800.0, 4350.0, EnF)
    st_f = st_f * (1.0 - 0.88 * w_cael_snow[..., None]) + (np.array([240.0, 242.0, 246.0]) * np.clip(clean_shade, 0.74, 1.16)) * (0.88 * w_cael_snow[..., None])

    # --- Siphon Pits Satellite Art Direction ---
    # 1. NW Ostrukh Terraces (Station 1): golden-loess steppe benches; irrigated green fields only round the fresh
    #    lake and along the terrace rivers
    w_ost_st = w_paint_sp * (1.0 - G.sstep(-8.0, 10.0, scarpUF)) * (1.0 - G.sstep(2650.0, 3300.0, EnF)) * (~wet2F).astype(float)
    terrace_band = 0.5 + 0.5 * np.sin(EnF / 135.0 * 2.0 * math.pi)
    ost_rgb = (np.array([150.0, 132.0, 88.0]) * (1.0 - 0.35 * terrace_band[..., None]) +
               np.array([176.0, 156.0, 104.0]) * (0.35 * terrace_band[..., None])) * clean_shade
    st_f = st_f * (1.0 - 0.72 * w_ost_st[..., None]) + ost_rgb * (0.72 * w_ost_st[..., None])
    farm_st = np.clip(nd.gaussian_filter((oasis_sp_shore | oasis_sp_river).astype(float), 1.2) * 1.6, 0.0, 1.0)
    w_farm_st = w_ost_st * farm_st
    farm_rgb = (np.array([82.0, 120.0, 60.0]) * (1.0 - 0.30 * terrace_band[..., None]) +
                np.array([124.0, 132.0, 70.0]) * (0.30 * terrace_band[..., None])) * clean_shade
    st_f = st_f * (1.0 - 0.80 * w_farm_st[..., None]) + farm_rgb * (0.80 * w_farm_st[..., None])

    # 2. Central Dividing Fault Escarpment (Station 2): dark jointed columnar-basalt cliff & russet subalpine talus
    w_scarp_st = w_paint_sp * G.sstep(-12.0, -2.0, scarpUF) * (1.0 - G.sstep(12.0, 24.0, scarpUF)) * (1.0 - pitDepthF)
    scarp_rgb = np.array([112.0, 78.0, 66.0]) * clean_shade
    st_f = st_f * (1.0 - 0.68 * w_scarp_st[..., None]) + scarp_rgb * (0.68 * w_scarp_st[..., None])

    # 3. SE High Basalt Plateau (Station 4): frost-shattered dark flood basalt & wind-scoured rime-ice polygons
    w_se_plat_st = w_paint_sp * G.sstep(4.0, 18.0, scarpUF) * (1.0 - G.sstep(0.08, 0.45, pitDepthF))
    rime_frost = G.sstep(4420.0, 4680.0, EnF)[..., None]
    plat_rgb = (np.array([116.0, 92.0, 86.0]) * (1.0 - 0.55 * rime_frost) +
                np.array([178.0, 174.0, 180.0]) * (0.55 * rime_frost)) * clean_shade
    st_f = st_f * (1.0 - 0.74 * w_se_plat_st[..., None]) + plat_rgb * (0.74 * w_se_plat_st[..., None])

    # 4. Phreatic Tuff-Breccia Rings & Knife-Edge Arete Bridges around the Siphon Pits: pale ash-grey/ochre rim ramparts
    w_tuff_st = w_paint_sp * np.clip(pitTuffF / 160.0, 0.0, 1.0) * (1.0 - G.sstep(0.15, 0.55, pitDepthF))
    tuff_rgb = np.array([186.0, 168.0, 152.0]) * clean_shade
    st_f = st_f * (1.0 - 0.65 * w_tuff_st[..., None]) + tuff_rgb * (0.65 * w_tuff_st[..., None])

    # 5. Sheer Columnar-Basalt Ring-Fault Pit Walls: deep charcoal-espresso shadow rings
    w_pit_wall = w_paint_sp * np.clip(pitDepthF * (1.0 - pitDepthF) * 4.2, 0.0, 1.0)
    pit_wall_rgb = np.array([58.0, 42.0, 40.0]) * clean_shade
    st_f = st_f * (1.0 - 0.82 * w_pit_wall[..., None]) + pit_wall_rgb * (0.82 * w_pit_wall[..., None])

    # 6. Siphon Maar Floors (Station 3): olive-grey steam moss and sulfur crusts on most floors; lush Siphon-Felt
    #    emerald turf only on the floors of the four lake maars, round their hot springs
    w_pit_floor = w_paint_sp * G.sstep(0.45, 0.88, pitDepthF) * (~wet2F).astype(float)
    w_pit_core = G.sstep(0.75, 0.98, pitDepthF)[..., None]
    lush = np.clip(nd.gaussian_filter(oasis_sp_pit.astype(float), 1.5) * 1.5, 0.0, 1.0)[..., None]
    siphon_floor_rgb = (
        (np.array([76.0, 128.0, 74.0]) * lush + np.array([118.0, 112.0, 86.0]) * (1.0 - lush)) * (1.0 - 0.42 * w_pit_core)
        + np.array([176.0, 138.0, 68.0]) * (0.42 * w_pit_core)
    ) * clean_shade
    st_f = st_f * (1.0 - 0.84 * w_pit_floor[..., None]) + siphon_floor_rgb * (0.84 * w_pit_floor[..., None])

    # 7. Lakes on `st`: Lake Nim, Lake Ostrukh, and the 4 boiling turquoise maar crater lakes
    lake_st_col = np.where(din_lakes[..., None] > 2.5, np.array([38.0, 106.0, 124.0]), np.array([136.0, 166.0, 156.0]))
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

    # --- Step 6: Add Geothermal Vents in Region 99 (Mount Caelum) & Siphon Pits (4 Flagship Maars) ---
    new_vent_coords = [
        (CAELUM_PX[0], CAELUM_PX[1], 0.28, 2.8),
        (1412.0, 1222.0, 0.28, 2.8),  # Station 3: Flagship Great Siphon Maar Floor
        (1396.0, 1209.0, 0.24, 2.4),  # West Arete Compound Maar diatreme
        (1346.0, 1246.0, 0.25, 2.5),  # SW Flagship Siphon Maar diatreme
        (1440.0, 1152.0, 0.24, 2.4),  # Eastern Deep Siphon Maar diatreme
    ]
    vents = [
        v for v in D['vents']
        if not any(abs(v['px'][0] - vx) < 20 and abs(v['px'][1] - vy) < 20 for vx, vy, _, _ in new_vent_coords)
    ]
    added_vents = []
    for vx, vy, sc, rad in new_vent_coords:
        viy, vix = int(round(vy * sv)), int(round(vx * su))
        vfloor = round(float(En[viy, vix]), 1)
        v_entry = {'px': [vx, vy], 'floor': vfloor, 'scale': sc, 'radius': rad, 'kind': 'geyser'}
        vents.append(v_entry)
        added_vents.append(v_entry)
    D['vents'] = vents
    print('  Added 5 thermal/diatreme vents (Mount Caelum + 4 Siphon Pits):', added_vents)

    # --- Step 7: Save model/data/, rebuild HTML, and write report & comparison crops ---
    print('--- Step 7: Saving model/data/ and building scale-model HTML ---')
    P.save(D)

    subprocess.check_call([sys.executable, os.path.join(HERE, 'model', 'build.py')])

    dist_html = os.path.join(HERE, 'model', 'dist', 'scale-model.html')
    out_424 = os.path.join(HERE, 'scale-model-4.24.html')
    shutil.copy2(dist_html, out_424)

    artifact_html = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scale-model-artifact.html'
    if os.path.exists(os.path.dirname(artifact_html)):
        shutil.copy2(dist_html, artifact_html)

    # Save Region 99 after crops
    x0, y0, x1, y1 = 1120, 600, 1549, 1070
    for k in ['st', 'ct', 'rt', 't']:
        arr = P.raster(D, k)
        crop = Image.fromarray(arr[y0:y1, x0:x1])
        draw = ImageDraw.Draw(crop)
        poly_c = [(p[0] - x0, p[1] - y0) for p in pts99] + [(pts99[0][0] - x0, pts99[0][1] - y0)]
        draw.line(poly_c, fill=(255, 255, 255), width=2)
        crop.save(f'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scratch/r99_after_{k}.png')

    # Save Siphon Pits after crops
    xs_sp = [p[0] for p in pts_sp]
    ys_sp = [p[1] for p in pts_sp]
    sx0, sy0, sx1, sy1 = max(0, min(xs_sp) - 50), max(0, min(ys_sp) - 50), min(OW, max(xs_sp) + 50), min(OH, max(ys_sp) + 50)
    for k in ['st', 'ct', 'rt', 't']:
        arr = P.raster(D, k)
        crop = Image.fromarray(arr[sy0:sy1, sx0:sx1])
        draw = ImageDraw.Draw(crop)
        poly_c = [(p[0] - sx0, p[1] - sy0) for p in pts_sp] + [(pts_sp[0][0] - sx0, pts_sp[0][1] - sy0)]
        draw.line(poly_c, fill=(255, 255, 255), width=2)
        crop.save(f'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scratch/siphon_after_{k}.png')

    report = {
        'version': '4.24',
        'region_99': {
            'id': R99_ID,
            'name': r99['name'],
            'cells_height_grid': int(mask99_h.sum()),
            'cells_moved': int((np.abs(En - Eo) > 0.5)[mask99_h].sum()),
            'elev_m': {
                'min': round(float(En[mask99_h].min()), 1),
                'max': round(float(En[mask99_h].max()), 1),
                'median': round(float(np.median(En[mask99_h])), 1),
                'mount_caelum_peak_m': round(float(En[mask99_h & (r_cael_km < 12.0)].max()), 1),
                'lake_nim_level_m': LAKE_NIM_LEV,
                'max_boundary_delta_m': round(max_edge99, 3),
            },
            'lake_nim_cells': int(lake_nim_mask.sum()),
            'lake_nim_area_km2': int(lake_nim_mask.sum() * 16),
            'climate_px': {codes[k]: int((cls2[mask99_f] == k).sum()) for k in np.unique(cls2[mask99_f])},
        },
        'siphon_pits': {
            'id': SIPHON_ID,
            'name': sp_reg['name'],
            'cells_height_grid': int(mask_sp_h.sum()),
            'cells_moved': int((np.abs(En - Eo) > 0.5)[mask_sp_h].sum()),
            'elev_m': {
                'min': round(float(En[mask_sp_h].min()), 1),
                'max': round(float(En[mask_sp_h].max()), 1),
                'median': round(float(np.median(En[mask_sp_h])), 1),
                'ostrukh_lake_level_m': OSTRUKH_LAKE_LEV,
                'max_boundary_delta_m': round(max_edge_sp, 3),
            },
            'maar_pits_count': 36,
            'ostrukh_lake_cells': int(ostrukh_lake_mask.sum()),
            'maar_lake_cells': int(maar_lakes_mask.sum()),
            'climate_px': {codes[k]: int((cls2[mask_sp_f] == k).sum()) for k in np.unique(cls2[mask_sp_f])},
        },
        'rivers_updated_total': rivers_touched,
    }
    report_path = os.path.join(HERE, 'edit_424.report.json')
    with open(report_path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(report, f, indent=2)
    print('Wrote report:', report_path)
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
