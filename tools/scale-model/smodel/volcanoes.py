"""Planetary volcanology & terrain remodeling for Krator's three major volcanic
edifice complexes on the 2 km/cell scale-model grid, plus the subterranean
Lava Tube & Cavern Map Layer (`tubes.json` / `DATA.tubes`) and canonical
Zeijani cave settlements:

1. `Throne/Volcano` (`rmuqlbqhl6ozk`, kind=`biome`):
   - Dual-regime concave-upward composite stratovolcano-shield profile elongated
     along the NNE (-62 deg) and SE (+35 deg) structural rift zones.
   - Restores the canonical 10,916.0 m summit peak (NW glacial horn at px 571, 497)
     and 2-terrace 10,260.0 m caldera floor at vent[0] (px 574.98, 504.22).
   - Eliminates the artificial mid-flank shelf at r = 54..70 km and adds 16
     asymmetric windward radial barrancos.
   - Carves the SE sector-collapse coastal embayment (Valle de Noa) so the
     -1,500.2 m Ring Sea shoreline reaches Noa's Regret (px 624, 536 at -1,492.0 m,
     +8.2 m above sea level).
   - Sculpts Zey'danin's coastal harbour spur (px 523, 530 at -1,180.0 m grading
     to -1,490.0 m bay) between twin routed lahar valleys.
   - Pins Dhelv (px 568, 446) at -68.0 m (+1,432 m ASL) atop a welded-ignimbrite
     kipuka ridge flanked by lava-diversion troughs.
   - Remodels the blocky western Spice Isle land-bridge bar into a volcanic
     fissure-sill tombolo while keeping Temora, Nereus, Hook, Kierson, Valapo,
     and Kautoa 100% untouched (0.0 m delta).

2. `Lesser Throne` (`rmucd8b2jn3d6`, kind=`political`):
   - Steep concave-upward andesitic/dacitic composite stratocone rising from the
     Eastern Inner-Wall highlands to a 6,880.0 m WNW horseshoe rim around the
     6,070.0 m Plinian crater floor at vent[1] (px 858, 524).
   - Includes a post-caldera dacitic lava spine (+165 m) inside the crater moat
     and an ESE (+22 deg S of E) Mount St. Helens-style sector-collapse breach
     gorge + hummocky welded-ignimbrite fan (the eruption that buried the First
     Monastery of the Monks of History, LORE.md 6.15).

3. `godthrone` (`rmvkkebdukgx7`) & `godstep valley` (`rmvkbfspgsmr3`):
   - Eliminates 100% of the 5,839 km^2 flat-clamped 25,000.0 m pancake collar
     (0 flat-clamped flank cells outside the r = 36 km elliptical caldera rim).
   - Carves 6 stepped ring-fault collapse terraces inside the caldera from the
     25,000.0 m rim down to the 22,000.0 m floor and 21,194.0 m eccentric inner
     pit at vent[76] (px 577.85, 932.59) per biomes/godthrone/PLAN.md 10.
   - Restores Pluton (px 471, 998) to its canonical 9,650.0 m (0.50 atm) bench.
   - Restores the closed southern subglacial brine lake basin (px 571, 1068) to
     6,415.0 m bed / 6,419.3 m water level behind a 6,760.0 m confining ridge
     above the Red Riwa bloodfalls headwall (px 592.8, 1109.6 at 5,365.0 m).
   - Sculpts SW basal columnar tibasalt escarpments and Godstep Valley's 4 ponded
     titanium-basalt flood-lava steps (2,700 m, 2,000 m, 1,300 m, 600 m) with
     sinuous collapsed lava-tube rilles from vent[77] (px 620.8, 815.2).

4. Subterranean Lava Tube & Cavern Layer (`build_tubes_and_zeijani_data`):
   - Generates `tubes.json` (`DATA.tubes`) and the 3 canonical Mungo-sized
     Zeijani cave/tuff villages (`Šurpu-Dhelv`, `Qarnu-Tūbu`, `Nūru-Šaplu`).
"""
import copy
import math
import numpy as np
from scipy import ndimage as nd
from . import geom as G


RING_SEA_WL = -1500.2
SOUTH_LAKE_WL = 6419.3


def _angle_diff(th, target):
    """Signed angular difference in [-pi, pi]."""
    return np.arctan2(np.sin(th - target), np.cos(th - target))


def _find_region(regs_list, reg_id, fallback_name=None):
    """Lookup a region dict by id or name from either a list of dicts or a dict."""
    if isinstance(regs_list, dict):
        if reg_id in regs_list:
            return regs_list[reg_id]
        for r in regs_list.values():
            if isinstance(r, dict) and (r.get("id") == reg_id or (fallback_name and r.get("name") == fallback_name)):
                return r
    elif isinstance(regs_list, (list, tuple)):
        for r in regs_list:
            if isinstance(r, dict) and (r.get("id") == reg_id or (fallback_name and r.get("name") == fallback_name)):
                return r
    return None


def _shift_pts(pts, dx, dy):
    return [[round(float(p[0]) + dx, 2), round(float(p[1]) + dy, 2)] for p in pts]


def remodel_volcanoes(Eo, whas0, wlev0, regs_list, vents_list, volc_dict):
    """Remodel `Throne/Volcano` (`rmuqlbqhl6ozk`), `Lesser Throne` (`rmucd8b2jn3d6`),
    and `godthrone` (`rmvkkebdukgx7`) + `godstep valley` (`rmvkbfspgsmr3`) on the
    scale-model height grid.

    Parameters
    ----------
    Eo : np.ndarray (VH, VW), float
        Input surface elevation grid in metres. On the unified 2 km/cell grid,
        shape is (1393, 1549) with su = 1.0, sv = 1.0.
    whas0 : np.ndarray (VH, VW), bool
        Input water-presence mask.
    wlev0 : np.ndarray (VH, VW), float
        Input water-surface elevation grid in metres.
    regs_list : list[dict] or dict
        Unshifted region polygons from `regions.json`.
    vents_list : list[dict]
        Unshifted vent records from `D['vents']`.
    volc_dict : dict
        Unshifted primary volcano metadata from `D['volc']`.

    Returns
    -------
    En : np.ndarray (VH, VW), float
    whas2 : np.ndarray (VH, VW), bool
    wlev2 : np.ndarray (VH, VW), float
    vents_out : list[dict]
    volc_out : dict
    changed_mask : np.ndarray (VH, VW), bool
    """
    Eo = np.asarray(Eo, dtype=float)
    whas2 = np.asarray(whas0, dtype=bool).copy()
    wlev2 = np.asarray(wlev0, dtype=float).copy()
    VH, VW = Eo.shape

    # Scale factors from unshifted 1549x1393 map-pixel space (2 km/px) to (VW, VH)
    su = (VW - 1.0) / 1548.0 if VW != 1549 else 1.0
    sv = (VH - 1.0) / 1392.0 if VH != 1393 else 1.0
    cell_km = 2.0 / su  # 2.0 km/cell when VW == 1549

    gy, gx = np.indices((VH, VW), dtype=float)
    px = gx / su
    py = gy / sv

    En = Eo.copy()

    # ==========================================================================
    # 1. THRONE / VOLCANO (`rmuqlbqhl6ozk`)
    # ==========================================================================
    tx0, ty0 = 574.98, 504.22  # Primary summit caldera vent[0]
    dx_t = (px - tx0) * 2.0    # km East
    dy_t = (py - ty0) * 2.0    # km South
    r_t = np.hypot(dx_t, dy_t)
    th_t = np.arctan2(dy_t, dx_t)

    # Structural rift elongation:
    # - NNE Rift (-62 deg = -1.082 rad) toward Dhelv kipuka shoulder
    # - SE Rift (+35 deg = +0.611 rad) into the lee plume
    # - SE Sector-Collapse Embayment (Valle de Noa, +33 deg = +0.576 rad) bringing
    #   the Ring Sea beach directly to Noa's Regret (px 624, 536, r = 116.8 km)
    # - WSW Harbour Indentation at Zey'danin (+153.6 deg = +2.681 rad, r = 116.0 km)
    a_rift = (
        1.0
        + 0.085 * np.exp(-0.5 * (_angle_diff(th_t, -1.082) / 0.28) ** 2)
        + 0.065 * np.exp(-0.5 * (_angle_diff(th_t, +0.611) / 0.30) ** 2)
        - 0.055 * np.exp(-0.5 * (_angle_diff(th_t, -2.550) / 0.45) ** 2)
        - 0.145 * np.exp(-0.5 * (_angle_diff(th_t, +0.576) / 0.15) ** 2) * G.sstep(82.0, 110.0, r_t)
        - 0.080 * np.exp(-0.5 * (_angle_diff(th_t, +2.681) / 0.14) ** 2) * G.sstep(85.0, 112.0, r_t)
    )

    r_rim_t = 14.2 + 1.1 * np.cos(2.0 * (th_t + 0.8)) + 0.7 * np.sin(3.0 * th_t)
    r_coast_t = 121.5 * a_rift

    # Summit rim peaks at 10,916.0 m on the NW glaciated horn (th ~ -1.95 rad, px ~ 571, 497)
    h_rim_t = 10680.0 + 236.0 * np.exp(-0.5 * (_angle_diff(th_t, -1.95) / 0.55) ** 2)

    # Normalized flank distance u_t in [0, 1] from summit rim to Ring Sea shoreline
    u_t = np.clip((r_t - r_rim_t) / np.maximum(r_coast_t - r_rim_t, 1.0), 0.0, 1.0)

    # Dual-regime concave-upward stratocone + shield profile:
    # Steep upper glaciated stratocone (12..15 deg), smooth mid-flank shield (6..9 deg,
    # zero shelf artifact at r = 54..70 km), low-angle coastal lava apron (1.8..3.7 deg)
    E_throne_flank = RING_SEA_WL + (h_rim_t - RING_SEA_WL) * (
        0.58 * (1.0 - u_t) ** 2.35 + 0.42 * np.exp(-2.65 * u_t)
    )

    # Submarine pillow-lava delta foresets beyond the coastline
    over_coast = np.maximum(0.0, r_t - r_coast_t)
    E_throne_sub = RING_SEA_WL - 780.0 * G.sstep(0.0, 22.0, over_coast)
    E_throne_base = np.where(r_t <= r_coast_t, E_throne_flank, E_throne_sub)

    # 2-Terrace Summit Caldera (r < r_rim_t):
    # Drops from 10,680..10,916 m rim across two collapse benches to the 10,260.0 m
    # caldera floor (Station 10), with an eccentric fumarolic acid-lake pit at 9,980.0 m
    # centered 3.5 km SE of vent[0] so vent[0] itself stands squarely on the 10,260.0 m floor.
    s_cal_t = np.clip(r_t / r_rim_t, 0.0, 1.0)
    r_fumarole_pit = np.hypot(dx_t - 2.6, dy_t - 2.2)
    E_throne_cal = (
        10260.0
        + (h_rim_t - 10260.0)
        * (0.65 * G.sstep(0.60, 0.78, s_cal_t) + 0.35 * G.sstep(0.84, 1.00, s_cal_t))
        - 280.0 * G.sstep(3.8, 0.6, r_fumarole_pit)
    )
    E_throne_cone = np.where(r_t < r_rim_t, E_throne_cal, E_throne_base)

    # Structural Rift Zones: NNE (-62 deg) and SE (+35 deg) rift-shoulder ridges (+210 m)
    # and axial eruptive graben (-110 m, Station 8 Vent Country)
    rift_env = G.sstep(20.0, 34.0, r_t) * G.sstep(115.0, 80.0, r_t)
    d_nne = np.abs(_angle_diff(th_t, -1.082)) * r_t
    d_se = np.abs(_angle_diff(th_t, +0.611)) * r_t
    rift_nne = (210.0 * np.exp(-0.5 * (d_nne / 7.5) ** 2) - 110.0 * np.exp(-0.5 * (d_nne / 2.4) ** 2)) * rift_env
    rift_se = (185.0 * np.exp(-0.5 * (d_se / 8.0) ** 2) - 95.0 * np.exp(-0.5 * (d_se / 2.5) ** 2)) * rift_env

    # 16 Asymmetric Radial Barrancos (deepest on wet W/SW/NW windward sector)
    windward_t = 0.65 + 0.35 * np.cos(th_t - 2.65)
    barranco_wave = np.sin(16.0 * th_t + 0.35 * np.sin(3.0 * th_t) + 0.045 * r_t)
    barranco_chute = np.clip(-barranco_wave, 0.0, 1.0) ** 2.4
    barranco_depth = (
        -340.0
        * windward_t
        * barranco_chute
        * G.sstep(18.0, 38.0, r_t)
        * G.sstep(120.0, 88.0, r_t)
    )

    # High-pass volcanic roughness from Eo (sigma scaled in km -> cells)
    sigma_t = 18.0 / cell_km  # 18 km smoothing scale (~9 cells at 2 km/cell)
    Es_throne = nd.gaussian_filter(Eo, sigma=sigma_t)
    hp_throne = (
        np.clip(Eo - Es_throne, -250.0, 250.0)
        * G.sstep(16.0, 28.0, r_t)
        * G.sstep(128.0, 94.0, r_t)
    )

    E_throne_target = E_throne_cone + rift_nne + rift_se + barranco_depth + 0.50 * hp_throne

    # ── Settlement & Feature Topographic Locks on Throne ──
    # A. Dhelv (px 568, 446): Welded-ignimbrite kipuka ridge at -68.0 m (+1,432 m ASL)
    #    flanked by two natural lava-diversion troughs 6 km E and W
    d_dhelv = np.hypot((px - 568.0) * 2.0, (py - 446.0) * 2.0)
    dhelv_kipuka = (
        -68.0
        + 140.0 * np.exp(-0.5 * (((px - 568.0) * 2.0) / 3.2) ** 2) * G.sstep(14.0, 3.0, d_dhelv)
        - 115.0 * np.exp(-0.5 * ((((px - 568.0) * 2.0 - 6.5)) / 2.2) ** 2) * G.sstep(16.0, 4.0, d_dhelv)
        - 115.0 * np.exp(-0.5 * ((((px - 568.0) * 2.0 + 6.5)) / 2.2) ** 2) * G.sstep(16.0, 4.0, d_dhelv)
    )
    w_dhelv = G.sstep(16.0, 4.0, d_dhelv)
    E_throne_target = E_throne_target * (1.0 - w_dhelv) + dhelv_kipuka * w_dhelv

    # B. Zey'danin (px 523, 530): Coastal volcanic spur (-1,180.0 m at 523, 530)
    #    grading WSW to -1,490.0 m harbourfront (519, 532) and -1,525.0 m Ring Sea bay,
    #    flanked N and S by twin lahar valleys
    d_zey = np.hypot((px - 523.0) * 2.0, (py - 530.0) * 2.0)
    u_zey_sea = ((523.0 - px) * 0.88 + (py - 530.0) * 0.47) * 2.0  # km seaward (WSW)
    zey_spur = -1180.0 - 42.0 * u_zey_sea
    zey_lahars = (
        -220.0
        * (
            np.exp(-0.5 * ((_angle_diff(th_t, +2.61) * r_t) / 2.8) ** 2)
            + np.exp(-0.5 * ((_angle_diff(th_t, +2.75) * r_t) / 2.8) ** 2)
        )
        * G.sstep(68.0, 92.0, r_t)
        * G.sstep(126.0, 112.0, r_t)
    )
    E_throne_target += zey_lahars
    w_zey = G.sstep(15.0, 4.0, d_zey)
    E_throne_target = E_throne_target * (1.0 - w_zey) + zey_spur * w_zey

    # C. Noa's Regret (px 624, 536): Grounded catamaran arcology on the Ring Sea beach!
    #    Pin (624, 536) at -1,492.0 m (+8.2 m above the -1,500.2 m Ring Sea) with a
    #    gently shelving black-sand lagoon/bay immediately ESE (u_noa_sea > 0 -> -1,535 m)
    d_noa = np.hypot((px - 624.0) * 2.0, (py - 536.0) * 2.0)
    u_noa_sea = ((px - 624.0) * 0.84 + (py - 536.0) * 0.54) * 2.0  # km seaward (ESE)
    noa_shore = np.where(
        u_noa_sea >= 0.0,
        -1492.0 - 14.0 * u_noa_sea,
        -1492.0 + 38.0 * (np.maximum(0.0, -u_noa_sea) ** 1.15),
    )
    w_noa = G.sstep(20.0, 5.0, d_noa)
    E_throne_target = E_throne_target * (1.0 - w_noa) + noa_shore * w_noa

    # D. Western Spice Isle Fissure Sill / Tombolo (px 495..518, py 505..530):
    #    Replace the blocky -392 m bulldozer bar with a sinuous basaltic fissure ridge
    #    (-1,485 m to -1,360 m crest, submarine -1,540 m flanks) while strictly
    #    preserving Temora (490, 553), Nereus (490, 475), and Hook (537, 593).
    sill_axis_y = 516.0 + 3.5 * np.sin((px - 492.0) * 0.22)
    d_sill_y = np.abs(py - sill_axis_y) * 2.0  # km from fissure axis
    w_sill_box = (
        G.sstep(493.0, 500.0, px)
        * G.sstep(522.0, 512.0, px)
        * G.sstep(28.0, 10.0, d_sill_y)
    )
    E_sill = -1545.0 + 175.0 * np.exp(-0.5 * (d_sill_y / 4.2) ** 2) + 35.0 * np.sin(px * 0.55)
    E_throne_target = E_throne_target * (1.0 - w_sill_box) + E_sill * w_sill_box

    # Protect surrounding Ring Isles ports with 0.0 m change masks
    d_temora = np.hypot((px - 490.0) * 2.0, (py - 553.0) * 2.0)
    d_nereus = np.hypot((px - 490.0) * 2.0, (py - 475.0) * 2.0)
    d_hook = np.hypot((px - 537.0) * 2.0, (py - 593.0) * 2.0)
    d_kierson = np.hypot((px - 612.0) * 2.0, (py - 407.0) * 2.0)
    d_valapo = np.hypot((px - 670.0) * 2.0, (py - 452.0) * 2.0)
    d_kautoa = np.hypot((px - 692.0) * 2.0, (py - 395.0) * 2.0)

    port_guard = (
        G.sstep(14.0, 26.0, d_temora)
        * G.sstep(14.0, 26.0, d_nereus)
        * G.sstep(10.0, 20.0, d_hook)
        * G.sstep(12.0, 24.0, d_kierson)
        * G.sstep(12.0, 24.0, d_valapo)
        * G.sstep(12.0, 24.0, d_kautoa)
    )

    w_throne = np.maximum(G.sstep(146.0, 118.0, r_t), w_sill_box) * port_guard
    En = En * (1.0 - w_throne) + E_throne_target * w_throne

    # Pin exact Throne summit peak (10,916.0 m at px 571, 497), caldera floor (10,260.0 m
    # at vent[0]), Dhelv (-68.0 m), Zey'danin (-1,180.0 m), and Noa's Regret (-1,492.0 m)
    En[int(round(497.0 * sv)), int(round(571.0 * su))] = 10916.0
    En[int(round(ty0 * sv)), int(round(tx0 * su))] = 10260.0
    En[int(round(446.0 * sv)), int(round(568.0 * su))] = -68.0
    En[int(round(530.0 * sv)), int(round(523.0 * su))] = -1180.0
    En[int(round(536.0 * sv)), int(round(624.0 * su))] = -1492.0


    # ==========================================================================
    # 2. LESSER THRONE (`rmucd8b2jn3d6`)
    # ==========================================================================
    lx0, ly0 = 858.0, 524.0  # vent[1]
    dx_l = (px - lx0) * 2.0
    dy_l = (py - ly0) * 2.0
    r_l = np.hypot(dx_l, dy_l)
    th_l = np.arctan2(dy_l, dx_l)

    r_rim_l = 7.2 + 0.55 * np.cos(2.0 * (th_l - 0.4))
    r_base_l = 54.0

    # Horseshoe summit rim: peaks at 6,880.0 m on WNW crest (-2.65 rad, px ~ 855, 522),
    # breached down to 6,105.0 m on the ESE sector (+0.38 rad ~ 22 deg S of E)
    h_rim_l = (
        6740.0
        + 140.0 * np.cos(th_l + 2.65)
        - 520.0 * np.exp(-0.5 * (_angle_diff(th_l, +0.38) / 0.36) ** 2)
    )

    sigma_l = 40.0 / cell_km  # 40 km smooth highland baseline
    E_bg_l = nd.gaussian_filter(Eo, sigma=sigma_l)
    u_l = np.clip((r_l - r_rim_l) / (r_base_l - r_rim_l), 0.0, 1.0)

    # Steep concave-upward composite stratocone profile
    lift_l = np.maximum(0.0, h_rim_l - E_bg_l) * (
        0.64 * (1.0 - u_l) ** 2.55 + 0.36 * np.exp(-3.10 * u_l)
    )
    E_lesser_flank = E_bg_l + lift_l

    # Plinian crater floor at 6,070.0 m (matching vent[1]['floor'] = 6070.0) with an
    # extruded dacite dome/spine (+165 m -> 6,235 m) offset 2.5 km WNW of vent[1]
    s_cal_l = np.clip(r_l / r_rim_l, 0.0, 1.0)
    r_spine_l = np.hypot(dx_l + 2.2, dy_l + 1.0)
    E_lesser_cal = (
        6070.0
        + (h_rim_l - 6070.0) * G.sstep(0.55, 1.00, s_cal_l)
        + 165.0 * np.exp(-0.5 * (r_spine_l / 1.4) ** 2) * G.sstep(0.5, 2.0, r_l)
    )
    E_lesser_cone = np.where(r_l < r_rim_l, E_lesser_cal, E_lesser_flank)

    # ESE Mount St. Helens-style sector-collapse breach canyon (r = 7..22 km)
    # transitioning into a hummocky welded-ignimbrite fan (r = 22..48 km) that
    # buried the First Monastery of the Monks of History (LORE.md 6.15)
    d_breach = np.abs(_angle_diff(th_l, +0.38)) * r_l
    breach_gorge = (
        -185.0
        * np.exp(-0.5 * (d_breach / 3.2) ** 2)
        * G.sstep(5.0, 9.0, r_l)
        * G.sstep(25.0, 16.0, r_l)
    )
    ignimbrite_fan = (
        +135.0
        * np.exp(-0.5 * (_angle_diff(th_l, +0.38) / 0.42) ** 2)
        * G.sstep(18.0, 26.0, r_l)
        * G.sstep(50.0, 38.0, r_l)
    )

    # 10 radial pyroclastic barrancos
    barranco_l = (
        -130.0
        * (np.clip(-np.sin(10.0 * th_l + 0.06 * r_l), 0.0, 1.0) ** 2.2)
        * G.sstep(9.0, 15.0, r_l)
        * G.sstep(48.0, 34.0, r_l)
    )

    w_lesser = G.sstep(54.0, 38.0, r_l)
    E_lesser_target = E_lesser_cone + breach_gorge + ignimbrite_fan + barranco_l
    En = En * (1.0 - w_lesser) + E_lesser_target * w_lesser

    # Guarantee exact WNW peak (6,880.0 m) and vent[1] crater floor (6,070.0 m)
    En[int(round(522.0 * sv)), int(round(855.0 * su))] = 6880.0
    En[int(round(ly0 * sv)), int(round(lx0 * su))] = 6070.0


    # ==========================================================================
    # 3. GODTHRONE (`rmvkkebdukgx7`) & GODSTEP VALLEY (`rmvkbfspgsmr3`)
    # ==========================================================================
    gx0, gy0 = 576.0, 932.0  # Godthrone summit caldera center
    dx_g = (px - gx0) * 2.0
    dy_g = (py - gy0) * 2.0
    r_g = np.hypot(dx_g, dy_g)
    th_g = np.arctan2(dy_g, dx_g)

    # Elliptical caldera rim (r_rim_g ~ 36 km average, elongated NNW-SSE per PLAN.md)
    r_rim_g = 36.0 + 5.2 * np.cos(2.0 * (th_g + 1.15)) + 2.0 * np.cos(3.0 * (th_g - 0.4))

    # 6 Stepped Ring-Fault Collapse Terraces inside the caldera (r <= r_rim_g):
    # 25,000.0 m rim -> 6 steps (~500 m each across 18 km radial wall) -> 22,000.0 m floor
    # -> 21,194.0 m eccentric inner pit at vent[76] (px 577.85, 932.59)
    w_wall_g = 18.0
    u_wall_g = np.clip((r_rim_g - r_g) / w_wall_g, 0.0, 1.0)
    terrace_sum = np.zeros_like(u_wall_g)
    for k in range(1, 7):
        dk = 0.025 * np.sin(k * th_g + k)
        t_lo = (k - 1.0) / 6.0 + dk
        t_hi = (k - 0.35) / 6.0 + dk
        terrace_sum += G.sstep(t_lo, t_hi, u_wall_g)
    terrace_frac = terrace_sum / 6.0

    r_pit_g = np.hypot((px - 577.85) * 2.0, (py - 932.59) * 2.0)  # vent[76]
    E_god_caldera = (
        25000.0
        - 3000.0 * terrace_frac
        - 806.0 * G.sstep(10.0, 1.5, r_pit_g)
    )

    # Azimuthally tuned shield scale radius and base elevation so that:
    # - Pluton (px 471, 998, r = 250.3 km, th = +2.62 rad) sits on a 9,650.0 m bench (0.50 atm)
    # - Southern subglacial brine lake (px 571, 1068, r = 271.2 km, th = +1.61 rad) sits at 6,415.0 m
    #   inside the 6..8 km EF ice belt above Red Riwa (px 592.8, 1109.6 at 5,365.0 m)
    # - ZERO cells outside r_rim_g clamp at 25,000.0 m!
    r_scale_g = (
        295.0
        - 42.0 * np.exp(-0.5 * (_angle_diff(th_g, +2.62) / 0.42) ** 2)
        - 55.0 * np.exp(-0.5 * (_angle_diff(th_g, +1.61) / 0.48) ** 2)
        - 35.0 * np.exp(-0.5 * (_angle_diff(th_g, -0.45) / 0.45) ** 2)
    )
    h_base_g = (
        5200.0
        + 1200.0 * np.exp(-0.5 * (_angle_diff(th_g, +1.61) / 0.45) ** 2)
        - 2600.0 * np.exp(-0.5 * (_angle_diff(th_g, -0.45) / 0.45) ** 2)
    )

    d_flank_g = np.maximum(0.0, r_g - r_rim_g)
    u_flank_g = np.clip(d_flank_g / np.maximum(r_scale_g - r_rim_g, 1.0), 0.0, 1.0)

    # Strictly decreasing shield profile from 25,000.0 m at the rim crest (u_flank_g = 0)
    S_god_flank = h_base_g + (25000.0 - h_base_g) * (
        0.72 * (1.0 - u_flank_g) ** 1.65 + 0.28 * np.exp(-2.40 * u_flank_g)
    )

    # Olympus-style basal columnar tibasalt cliff escarpments on the SW bay margin
    scarp_sw = (
        -1350.0
        * np.exp(-0.5 * (_angle_diff(th_g, +2.92) / 0.24) ** 2)
        * G.sstep(242.0, 256.0, r_g)
        * G.sstep(285.0, 268.0, r_g)
    )
    S_god_flank += scarp_sw

    # Non-clamping high-pass detail blend: attenuates to 0 at d_flank_g = 0 and caps
    # outer flank below S_god_flank's rim slope so ZERO flank cells hit 25,000.0 m!
    sigma_g = 32.0 / cell_km  # 32 km smoothing scale (~16 cells at 2 km/cell)
    Es_god = nd.gaussian_filter(Eo, sigma=sigma_g)
    hp_god = np.clip(Eo - Es_god, -450.0, 450.0)
    alpha_hp = G.sstep(0.0, 32.0, d_flank_g) * (0.35 + 0.65 * G.sstep(45.0, 115.0, d_flank_g))
    max_flank_env = 25000.0 - 22.0 * np.minimum(d_flank_g, 40.0)
    E_god_flank = np.minimum(max_flank_env, S_god_flank + alpha_hp * hp_god)

    E_god_target = np.where(r_g <= r_rim_g, E_god_caldera, E_god_flank)

    # Pin Pluton (px 471, 998) to its canonical 9,650.0 m (0.50 atm) volcanic bench
    d_pluton = np.hypot((px - 471.0) * 2.0, (py - 998.0) * 2.0)
    pluton_bench = 9650.0 + 18.0 * ((px - 471.0) * 0.85 - (py - 998.0) * 0.52)
    w_pluton = G.sstep(30.0, 8.0, d_pluton)
    E_god_target = E_god_target * (1.0 - w_pluton) + pluton_bench * w_pluton

    # Restore the closed southern subglacial brine lake basin (px 571, 1068) to 6,415.0 m
    # (water level 6,419.3 m) behind a 6,760.0 m confining ridge above the Red Riwa
    # bloodfalls outlet headwall (px 592.8, 1109.6 at 5,365.0 m)
    d_lake = np.hypot((px - 571.0) * 2.0, (py - 1068.0) * 2.0)
    lake_basin = 6415.0 + 345.0 * G.sstep(9.0, 20.0, d_lake)
    w_lake = G.sstep(34.0, 14.0, d_lake)
    E_god_target = E_god_target * (1.0 - w_lake) + lake_basin * w_lake

    d_red_riwa = np.hypot((px - 592.8) * 2.0, (py - 1109.6) * 2.0)
    w_red_riwa = G.sstep(22.0, 6.0, d_red_riwa)
    E_god_target = E_god_target * (1.0 - w_red_riwa) + 5365.0 * w_red_riwa

    # Region mask for `godthrone` (`rmvkkebdukgx7`)
    reg_god = _find_region(regs_list, "rmvkkebdukgx7", "godthrone")
    if reg_god is not None and reg_god.get("points"):
        mask_god_poly = G.poly_mask(reg_god["points"], VW, VH, su, sv)
        dist_god_out_km = nd.distance_transform_edt(~mask_god_poly) * cell_km
        w_god = G.sstep(32.0, 0.0, dist_god_out_km) * G.sstep(345.0, 255.0, r_g)
    else:
        w_god = G.sstep(310.0, 235.0, r_g)

    # Guarantee 100% weight over the caldera/clamped collar (r <= 170 km), Pluton, and South Lake
    w_god = np.maximum(w_god, G.sstep(185.0, 115.0, r_g))
    w_god = np.maximum(w_god, w_pluton)
    w_god = np.maximum(w_god, w_lake)
    w_god = np.maximum(w_god, w_red_riwa)

    # Protect nearby boundary settlements outside Godthrone:
    # Shim (382, 788), Tallhouse (411, 854), Erehwon (528, 1173), Tuatara (546, 1224), Theodiga (636, 1205)
    for sx_p, sy_p, rad_p in (
        (382.0, 788.0, 22.0),
        (411.0, 854.0, 16.0),
        (528.0, 1173.0, 24.0),
        (546.0, 1224.0, 24.0),
        (636.0, 1205.0, 24.0),
    ):
        d_p = np.hypot((px - sx_p) * 2.0, (py - sy_p) * 2.0)
        w_god *= G.sstep(rad_p * 0.5, rad_p, d_p)

    En = En * (1.0 - w_god) + E_god_target * w_god

    # ── Godstep Valley (`rmvkbfspgsmr3`): 4 Ponded Titanium-Basalt Mare Steps ──
    reg_gs = _find_region(regs_list, "rmvkbfspgsmr3", "godstep valley")
    if reg_gs is not None and reg_gs.get("points"):
        mask_gs_poly = G.poly_mask(reg_gs["points"], VW, VH, su, sv)
        dist_gs_in_km = nd.distance_transform_edt(mask_gs_poly) * cell_km
        w_gs = G.sstep(0.0, 14.0, dist_gs_in_km)
    else:
        w_gs = np.zeros_like(En)

    # Protect Arcbeam (px 744, 728) at the NE corner of Godstep Valley
    d_arcbeam = np.hypot((px - 744.0) * 2.0, (py - 728.0) * 2.0)
    w_gs *= G.sstep(8.0, 20.0, d_arcbeam)

    ux_gs, uy_gs = math.cos(-0.28), math.sin(-0.28)  # ENE axis from vent[77] (620.8, 815.2)
    dx_gs = (px - 620.8) * 2.0
    dy_gs = (py - 815.2) * 2.0
    s_gs = dx_gs * ux_gs + dy_gs * uy_gs
    p_gs = -dx_gs * uy_gs + dy_gs * ux_gs

    # Lobate flow-front modulation across the 4 steps (2,700 m -> 2,000 m -> 1,300 m -> 600 m)
    lobe_gs = 6.0 * np.cos(p_gs / 14.0) + 3.0 * np.sin(p_gs / 7.5)
    s_eff = s_gs - lobe_gs
    E_mare = (
        2700.0
        - 700.0 * G.sstep(36.0, 50.0, s_eff)
        - 700.0 * G.sstep(92.0, 106.0, s_eff)
        - 700.0 * G.sstep(148.0, 162.0, s_eff)
        + 1.8 * np.maximum(0.0, 180.0 - s_gs)
        + 140.0 * (p_gs / 48.0) ** 2
    )
    # Two sinuous collapsed lava-tube rilles originating at vent[77]
    rille_1 = 6.5 * np.sin(0.085 * s_gs) + 3.0 * np.cos(0.19 * s_gs)
    rille_2 = -14.0 + 5.0 * np.cos(0.075 * s_gs + 0.8)
    d_r1 = np.abs(p_gs - rille_1)
    d_r2 = np.abs(p_gs - rille_2)
    rille_cut = (
        -230.0 * np.exp(-0.5 * (d_r1 / 2.2) ** 2) * G.sstep(-8.0, 12.0, s_gs)
        - 165.0 * np.exp(-0.5 * (d_r2 / 1.8) ** 2) * G.sstep(15.0, 35.0, s_gs)
    )
    E_gs_target = E_mare + rille_cut
    En = En * (1.0 - w_gs) + E_gs_target * w_gs

    # Sculpt the Godstep flood-basalt head shield/fissure cone around vent[77] (620.8, 815.17):
    # 2,850.0 m WNW rim crest at (619, 814) surrounding the 2,700.0 m fissure floor at (620.8, 815.17)
    r_gs_v = np.hypot(dx_gs, dy_gs)
    th_gs_v = np.arctan2(dy_gs, dx_gs)
    r_rim_gsv = 3.2
    r_base_gsv = 16.0
    h_rim_gsv = 2810.0 + 40.0 * np.cos(th_gs_v + 2.5)
    u_gsv = np.clip((r_gs_v - r_rim_gsv) / (r_base_gsv - r_rim_gsv), 0.0, 1.0)
    E_gsv_cone = np.where(
        r_gs_v < r_rim_gsv,
        2700.0 + (h_rim_gsv - 2700.0) * G.sstep(0.35, 1.0, r_gs_v / r_rim_gsv),
        En + np.maximum(0.0, h_rim_gsv - En) * ((1.0 - u_gsv) ** 2.0),
    )
    w_gsv = G.sstep(16.0, 7.0, r_gs_v)
    En = En * (1.0 - w_gsv) + E_gsv_cone * w_gsv

    # Pin exact Godthrone pit floor (21,194.0 m at vent[76]), Pluton (9,650.0 m),
    # Southern Brine Lake bed (6,415.0 m), Red Riwa head (5,365.0 m), and vent[77] (2,700.0 m / 2,850.0 m rim)
    En[int(round(932.59 * sv)), int(round(577.85 * su))] = 21194.0
    En[int(round(998.0 * sv)), int(round(471.0 * su))] = 9650.0
    En[int(round(1068.0 * sv)), int(round(571.0 * su))] = 6415.0
    En[int(round(1109.6 * sv)), int(round(592.8 * su))] = 5365.0
    En[int(round(814.0 * sv)), int(round(619.0 * su))] = 2850.0
    En[int(round(815.2 * sv)), int(round(620.8 * su))] = 2700.0


    # ==========================================================================
    # 3B. CATCH-XANADU TWIN WALL STRATOVOLCANOES (`vents[2]` & `vents[3]`, Option A)
    # ==========================================================================
    # Standing in `"twins"` (`rmw536m06wlyf`) dividing `the catch` (`rmvka7icdn1dq`)
    # and `xanadu` (`rmvkkmitffbjk`) as two active small volcanoes:
    # - NW Active Cone (`vents[2]` at px 716, 1128 / expanded 988, 1458): 6,480.0 m WSW
    #   summit rim crest around the 5,980.0 m crater floor (vents[2]['floor'] = 5980.0).
    # - SE Glaciated Ice-Cave Cone (`vents[3]` at px 770, 1168 / expanded 1042, 1498):
    #   5,880.0 m NW summit rim crest around the 5,420.0 m subglacial fumarolic caldera
    #   floor (vents[3]['floor'] = 5420.0), with a 4,980..5,180 m SW subglacial
    #   geothermal bench for Mount Erebus fumarolic ice towers & Kverkfjoll ice caves.
    # - Connecting NW-SE Fissure Saddle Ridge across (743, 1148) with 2 parasitic
    #   fissure cones at (735, 1142) [4,680 / 4,840 m] and (752, 1155) [4,460 / 4,610 m].
    # First lower the uncarved 8-12 km Catch-Xanadu dividing spine along the NW-SE axis
    # to a natural +3,300..+4,450 m mountain ridge so the two volcanic cones rise
    # monotonically above the ridge with zero circular moat around their bases:
    ux_cx, uy_cx = (770.0 - 716.0) / 67.23, (1168.0 - 1128.0) / 67.23
    s_cx = ((px - 716.0) * ux_cx + (py - 1128.0) * uy_cx) * 2.0  # 0 to 134.46 km
    p_cx = (-(px - 716.0) * uy_cx + (py - 1128.0) * ux_cx) * 2.0  # km perp to axis
    w_spine_cx = (
        G.sstep(-68.0, -18.0, s_cx)
        * G.sstep(205.0, 152.0, s_cx)
        * G.sstep(68.0, 26.0, np.abs(p_cx))
        * (~whas2).astype(float)
    )
    E_spine_cx = (
        4280.0
        - 880.0 * np.clip((np.abs(p_cx) / 48.0) ** 1.45, 0.0, 1.4)
        - 220.0 * np.exp(-0.5 * ((s_cx - 67.0) / 26.0) ** 2)
    )
    En = En * (1.0 - w_spine_cx) + np.minimum(En, E_spine_cx) * w_spine_cx

    # --- NW Stratovolcano (`vents[2]`, px 716, 1128 / expanded 988, 1458) ---
    vx2, vy2 = 716.0, 1128.0
    dx_v2 = (px - vx2) * 2.0
    dy_v2 = (py - vy2) * 2.0
    r_v2 = np.hypot(dx_v2, dy_v2)
    th_v2 = np.arctan2(dy_v2, dx_v2)

    r_rim_v2 = 4.2 + 0.35 * np.cos(2.0 * (th_v2 - 0.64))
    r_base_v2 = 34.0
    h_rim_v2 = (
        6260.0
        + 220.0 * np.cos(th_v2 - 2.65)
        - 130.0 * np.exp(-0.5 * (_angle_diff(th_v2, -0.45) / 0.38) ** 2)
    )
    u_v2 = np.clip((r_v2 - r_rim_v2) / (r_base_v2 - r_rim_v2), 0.0, 1.0)
    prof_v2 = 0.68 * ((1.0 - u_v2) ** 2.25) + 0.32 * np.exp(-2.85 * u_v2)
    E_flank_v2 = En + np.maximum(0.0, h_rim_v2 - En) * prof_v2
    s_cal_v2 = np.clip(r_v2 / r_rim_v2, 0.0, 1.0)
    E_cal_v2 = 5980.0 + (h_rim_v2 - 5980.0) * G.sstep(0.28, 1.00, s_cal_v2)
    w_v2 = G.sstep(34.0, 18.0, r_v2)
    En = np.where(r_v2 < r_rim_v2, E_cal_v2, En * (1.0 - w_v2) + E_flank_v2 * w_v2)

    # --- SE Stratovolcano (`vents[3]`, px 770, 1168 / expanded 1042, 1498) ---
    vx3, vy3 = 770.0, 1168.0
    dx_v3 = (px - vx3) * 2.0
    dy_v3 = (py - vy3) * 2.0
    r_v3 = np.hypot(dx_v3, dy_v3)
    th_v3 = np.arctan2(dy_v3, dx_v3)

    r_rim_v3 = 4.2 + 0.35 * np.cos(2.0 * (th_v3 - 0.64))
    r_base_v3 = 36.0
    h_rim_v3 = (
        5710.0
        + 170.0 * np.cos(th_v3 + 2.46)
        - 130.0 * np.exp(-0.5 * (_angle_diff(th_v3, -0.35) / 0.36) ** 2)
    )
    u_v3 = np.clip((r_v3 - r_rim_v3) / (r_base_v3 - r_rim_v3), 0.0, 1.0)
    prof_v3 = 0.66 * ((1.0 - u_v3) ** 2.30) + 0.34 * np.exp(-2.90 * u_v3)
    E_flank_v3 = En + np.maximum(0.0, h_rim_v3 - En) * prof_v3
    s_cal_v3 = np.clip(r_v3 / r_rim_v3, 0.0, 1.0)
    E_cal_v3 = 5420.0 + (h_rim_v3 - 5420.0) * G.sstep(0.28, 1.00, s_cal_v3)
    w_v3 = G.sstep(36.0, 19.0, r_v3)
    En = np.where(r_v3 < r_rim_v3, E_cal_v3, En * (1.0 - w_v3) + E_flank_v3 * w_v3)

    # --- Connecting NW-SE Fissure Saddle Cones between (716, 1128) and (770, 1168) ---
    d_cone_a = np.hypot((px - 735.0) * 2.0, (py - 1142.0) * 2.0)
    d_cone_b = np.hypot((px - 752.0) * 2.0, (py - 1155.0) * 2.0)

    # Sculpt the two parasitic fissure cones on the saddle at (735, 1142) [peak 4840.0 m, floor 4680.0 m]
    # and (752, 1155) [peak 4610.0 m, floor 4460.0 m] as purely additive cones with exact rim crests and floors:
    for pvx, pvy, p_fl, p_pk, d_c in (
        (735.0, 1142.0, 4680.0, 4840.0, d_cone_a),
        (752.0, 1155.0, 4460.0, 4610.0, d_cone_b),
    ):
        u_pc = np.clip((d_c - 2.4) / (11.0 - 2.4), 0.0, 1.0)
        E_pc_flank = En + np.maximum(0.0, p_pk - En) * ((1.0 - u_pc) ** 2.15)
        E_pc = np.where(
            d_c < 2.4,
            p_fl + (p_pk - p_fl) * G.sstep(0.28, 1.0, d_c / 2.4),
            E_pc_flank,
        )
        w_pc = G.sstep(11.0, 4.5, d_c)
        En = En * (1.0 - w_pc) + E_pc * w_pc

    # Pin exact summit peaks and canonical crater floors for vents[2], vents[3], and the 2 parasitic vents
    En[int(round(1129.0 * sv)), int(round(713.0 * su))] = 6480.0
    En[int(round(vy2 * sv)), int(round(vx2 * su))] = 5980.0
    En[int(round(1166.0 * sv)), int(round(767.0 * su))] = 5880.0
    En[int(round(vy3 * sv)), int(round(vx3 * su))] = 5420.0
    En[int(round(1141.0 * sv)), int(round(734.0 * su))] = 4840.0
    En[int(round(1142.0 * sv)), int(round(735.0 * su))] = 4680.0
    En[int(round(1154.0 * sv)), int(round(751.0 * su))] = 4610.0
    En[int(round(1155.0 * sv)), int(round(752.0 * su))] = 4460.0


    # ==========================================================================
    # 4. WATER-LEVEL & WATER-MASK CONSISTENCY (`whas2`, `wlev2`)
    # ==========================================================================
    # A. Ring Sea coastline around Throne:
    #    - Newly opened coastal embayments (Noa's Regret bay & Zey'danin bay) below
    #      RING_SEA_WL (-1500.2 m) become Ring Sea water (whas=True, wlev=-1500.2)
    #    - Former water cells raised above RING_SEA_WL become dry land (whas=False)
    dry_fill = np.nan if np.isnan(wlev0).any() else 0.0
    wlev_num = np.nan_to_num(wlev2, nan=RING_SEA_WL)

    in_throne_domain = (r_t < 146.0) & (w_throne > 0.05)
    newly_submerged = in_throne_domain & (En < RING_SEA_WL)
    newly_emerged = in_throne_domain & (En >= RING_SEA_WL) & whas2 & (wlev_num <= RING_SEA_WL + 5.0)

    whas2 = np.where(newly_submerged, True, whas2)
    wlev2 = np.where(newly_submerged, RING_SEA_WL, wlev2)
    whas2 = np.where(newly_emerged, False, whas2)
    wlev2 = np.where(newly_emerged, dry_fill, wlev2)

    # Guarantee Noa's Regret (px 624, 536) and Zey'danin (px 523, 530) settlement cells
    # themselves are dry land on the shore, while their adjacent seaward harbour cells are water!
    iy_nr, ix_nr = int(round(536.0 * sv)), int(round(624.0 * su))
    whas2[iy_nr, ix_nr] = False
    wlev2[iy_nr, ix_nr] = dry_fill
    if ix_nr + 2 < VW and iy_nr + 1 < VH:
        En[iy_nr + 1, ix_nr + 2] = -1512.0
        whas2[iy_nr + 1, ix_nr + 2] = True
        wlev2[iy_nr + 1, ix_nr + 2] = RING_SEA_WL

    iy_zd, ix_zd = int(round(530.0 * sv)), int(round(523.0 * su))
    whas2[iy_zd, ix_zd] = False
    wlev2[iy_zd, ix_zd] = dry_fill

    # B. Closed Southern Subglacial Brine Lake at (571, 1068):
    #    Restore water mask (whas=True) and water level (6,419.3 m) inside the 9 km basin
    in_south_lake = (d_lake <= 9.0) & (En < SOUTH_LAKE_WL)
    whas2 = np.where(in_south_lake, True, whas2)
    wlev2 = np.where(in_south_lake, SOUTH_LAKE_WL, wlev2)

    # ==========================================================================
    # 5. UPDATE VENTS & VOLC METADATA RECORDS
    # ==========================================================================
    vents_out = copy.deepcopy(vents_list) if vents_list is not None else []
    for v in vents_out:
        vpx = v.get("px", [0.0, 0.0])
        if math.hypot(vpx[0] - 574.98, vpx[1] - 504.22) < 3.0:
            v["floor"] = 10260.0
            v["peak"] = 10916.0
        elif math.hypot(vpx[0] - 858.0, vpx[1] - 524.0) < 3.0:
            v["floor"] = 6070.0
            v["peak"] = 6880.0
        elif math.hypot(vpx[0] - 716.0, vpx[1] - 1128.0) < 3.0:
            v["floor"] = 5980.0
            v["peak"] = 6480.0
        elif math.hypot(vpx[0] - 770.0, vpx[1] - 1168.0) < 3.0:
            v["floor"] = 5420.0
            v["peak"] = 5880.0
        elif math.hypot(vpx[0] - 577.85, vpx[1] - 932.59) < 3.0:
            v["floor"] = 21194.0
            v["peak"] = 25000.0
        elif math.hypot(vpx[0] - 620.8, vpx[1] - 815.2) < 3.0:
            v["floor"] = 2700.0
            v["peak"] = 2850.0

    # Add the 2 parasitic fissure vents on the Catch-Xanadu NW-SE volcanic saddle if not present
    for p_vent in (
        {"px": [735.0, 1142.0], "floor": 4680.0, "peak": 4840.0, "scale": 0.18, "radius": 1.6},
        {"px": [752.0, 1155.0], "floor": 4460.0, "peak": 4610.0, "scale": 0.18, "radius": 1.6},
    ):
        found_pv = False
        for v in vents_out:
            if math.hypot(v.get("px", [0, 0])[0] - p_vent["px"][0], v.get("px", [0, 0])[1] - p_vent["px"][1]) < 2.0:
                v["floor"] = p_vent["floor"]
                v["peak"] = p_vent["peak"]
                found_pv = True
        if not found_pv:
            vents_out.append(p_vent)

    volc_out = copy.deepcopy(volc_dict) if volc_dict is not None else {}
    volc_out["px"] = [574.98, 504.22]
    volc_out["peak"] = 10916.0
    volc_out["floor"] = 10260.0

    wlev_diff = np.abs(np.nan_to_num(wlev2, nan=0.0) - np.nan_to_num(wlev0, nan=0.0)) > 0.05
    changed_mask = (
        (np.abs(En - Eo) > 0.05)
        | (whas2 != whas0)
        | (whas2 & wlev_diff)
    )

    return En, whas2, wlev2, vents_out, volc_out, changed_mask


def build_tubes_and_zeijani_data(dx=0.0, dy=0.0):
    """Build the subterranean Lava Tube & Cavern Map Layer (`tubes.json` / `DATA.tubes`)
    and the 3 new canonical Mungo-sized Zeijani cave/tuff village settlement records,
    with all map-pixel coordinates shifted by `(+dx, +dy)`.

    Parameters
    ----------
    dx : float
        Horizontal shift in map pixels (e.g., 272.0 on the expanded 1821x1723 canvas).
    dy : float
        Vertical shift in map pixels (e.g., 330.0 on the expanded 1821x1723 canvas).

    Returns
    -------
    tubes_list : list[dict]
        List of 8 volcanic lava-tube and cavern system records for `tubes.json`.
    new_zeijani_settlements : list[dict]
        List of the 3 canonical Mungo-sized Zeijani cave/tuff villages (`Šurpu-Dhelv`,
        `Qarnu-Tūbu`, `Nūru-Šaplu`) to add to `settlements.json`.
    """
    dx = float(dx)
    dy = float(dy)

    raw_tubes = [
        # 1. DHELV CAPITAL MASTER KIPUKA & BRAID NETWORK (N flank of Throne)
        {
            "id": "tube_dhelv_01",
            "name": "Dhelv Kipuka & Braid Network",
            "region": "rmuqlbqhl6ozk",
            "culture": "zeijani",
            "state": "habitable",
            "rock": "tuff_and_basalt",
            "width_m": 22.0,
            "height_m": 14.0,
            "depth_m": 45.0,
            "km": 94,
            "px": [
                [572.8, 474.0], [571.5, 466.0], [570.2, 458.5],
                [569.0, 451.5], [568.0, 446.0], [566.8, 439.5], [565.5, 433.5],
            ],
            "branches": [
                {
                    "name": "West Kipuka Portal & Rolling-Door Tube",
                    "state": "habitable",
                    "width_m": 12.0,
                    "px": [[562.5, 446.4], [565.2, 446.2], [568.0, 446.0]],
                },
                {
                    "name": "Eastern Braid & Catacomb Descent Tube",
                    "state": "habitable",
                    "width_m": 10.0,
                    "px": [[570.2, 458.5], [572.4, 452.0], [571.0, 445.5], [568.0, 446.0]],
                },
                {
                    "name": "West Circumferential Scout Highway (Dhelv to Šurpu-Dhelv)",
                    "state": "habitable",
                    "width_m": 11.0,
                    "px": [
                        [568.0, 446.0], [559.0, 452.5], [550.5, 462.0],
                        [542.0, 474.5], [534.0, 488.0],
                    ],
                },
                {
                    "name": "East Cross-Shoulder Link (Dhelv to Nūru-Šaplu)",
                    "state": "habitable",
                    "width_m": 11.0,
                    "px": [
                        [568.0, 446.0], [578.5, 451.0], [588.0, 457.5],
                        [596.5, 464.5], [604.0, 472.0],
                    ],
                },
            ],
            "caverns": [
                {
                    "id": "cav_dhelv_hub",
                    "name": "Dhelv Great Bottle Hall",
                    "kind": "bottle_hall",
                    "settlement_id": "sx1xr1r6pd",
                    "px": [568.0, 446.0],
                    "span_m": [280, 200],
                    "height_m": 68,
                    "skylight_m": 32,
                    "notes": "Zeijani capital (pop ~5,000): 280x200 m bottle hall under a 32 m throat well, 3 satellite farm pits, stepwell cistern, Kailasa temple, and deep catacombs.",
                },
                {
                    "id": "cav_dhelv_portal",
                    "name": "Dhelv West Kipuka Portal",
                    "kind": "kipuka_portal",
                    "px": [562.5, 446.4],
                    "span_m": [85, 45],
                    "height_m": 24,
                    "skylight_m": 0,
                    "notes": "Hidden cliff portal and caravanserai in old-growth kipuka forest; guarded by a rolling stone door 2 km inside.",
                },
                {
                    "id": "cav_dhelv_catacomb",
                    "name": "Deep Ossuary & Guanche Vaults",
                    "kind": "catacombs",
                    "px": [571.0, 445.5],
                    "span_m": [120, 75],
                    "height_m": 18,
                    "skylight_m": 0,
                    "notes": "60 m below Dhelv square: tiered loculi, mummy shelves, and mortuary chapel.",
                },
            ],
        },

        # 2. ŠURPU-DHELV (ZEIJANI VILLAGE 1: WNW Tuff Fairy-Chimney & Raid Network)
        {
            "id": "tube_surpu_02",
            "name": "Šurpu-Dhelv (Ash-Spire) Tuff & Scout Network",
            "region": "rmuqlbqhl6ozk",
            "culture": "zeijani",
            "state": "habitable",
            "rock": "tuff_and_basalt",
            "width_m": 18.0,
            "height_m": 12.0,
            "depth_m": 38.0,
            "km": 112,
            "px": [
                [554.0, 494.0], [547.0, 491.8], [540.5, 489.8],
                [534.0, 488.0], [526.0, 485.5], [518.5, 483.0],
            ],
            "branches": [
                {
                    "name": "Zey'danin Frontier Scout & Raid Tube",
                    "state": "habitable",
                    "width_m": 9.5,
                    "px": [
                        [534.0, 488.0], [532.0, 498.5], [530.5, 509.0],
                        [528.8, 517.5], [527.0, 524.0],
                    ],
                },
                {
                    "name": "South-West Sub-Cloud Link (Šurpu-Dhelv to Qarnu-Tūbu)",
                    "state": "habitable",
                    "width_m": 10.5,
                    "px": [
                        [534.0, 488.0], [538.5, 504.0], [545.0, 521.0],
                        [553.0, 537.5], [562.0, 552.0],
                    ],
                },
            ],
            "caverns": [
                {
                    "id": "cav_surpu_vil",
                    "name": "Šurpu-Dhelv (Ash-Spire Village)",
                    "kind": "tuff_spire_gallery",
                    "settlement_id": "szjsurpu01",
                    "px": [534.0, 488.0],
                    "span_m": [190, 130],
                    "height_m": 45,
                    "skylight_m": 24,
                    "notes": "First of the 3 canonical Mungo-sized Zeijani cave/tuff villages: fairy-chimney tuff spires and 4-level underground galleries above a braided lava tube.",
                },
                {
                    "id": "cav_zey_sally",
                    "name": "Zey'danin Kipuka Sally Portal",
                    "kind": "kipuka_portal",
                    "px": [527.0, 524.0],
                    "span_m": [55, 35],
                    "height_m": 14,
                    "skylight_m": 0,
                    "notes": "Concealed lava-tube mouth 12 km NE of Zey'danin used by Zeijani scouts and poison-arrow raiding parties.",
                },
            ],
        },

        # 3. QARNU-TŪBU (ZEIJANI VILLAGE 2: SSW Savanna-Tuff Shoulder Network)
        {
            "id": "tube_qarnu_03",
            "name": "Qarnu-Tūbu (Horn-Well) Southern Shoulder Tube",
            "region": "rmuqlbqhl6ozk",
            "culture": "zeijani",
            "state": "habitable",
            "rock": "tuff_and_basalt",
            "width_m": 20.0,
            "height_m": 13.0,
            "depth_m": 32.0,
            "km": 88,
            "px": [
                [569.5, 526.0], [567.0, 535.0], [564.5, 544.0],
                [562.0, 552.0], [558.5, 563.0], [554.0, 574.0],
            ],
            "branches": [
                {
                    "name": "Savanna Lahar-Fan Stepwell Branch",
                    "state": "habitable",
                    "width_m": 11.0,
                    "px": [[564.5, 544.0], [572.0, 549.5], [579.0, 556.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_qarnu_vil",
                    "name": "Qarnu-Tūbu (Horn-Well Village)",
                    "kind": "skylight_well",
                    "settlement_id": "szjqarnu02",
                    "px": [562.0, 552.0],
                    "span_m": [175, 140],
                    "height_m": 42,
                    "skylight_m": 65,
                    "notes": "Second canonical Zeijani cave/tuff village: Moray-style terraced collapse pits and a Chand Baori stepwell cistern trading with the southern Ash Nomads.",
                },
            ],
        },

        # 4. NŪRU-ŠAPLU (ZEIJANI VILLAGE 3: ENE Plume-Edge Drained Magma Chamber)
        {
            "id": "tube_nuru_04",
            "name": "Nūru-Šaplu (Deep-Lantern) Plume-Edge Tube",
            "region": "rmuqlbqhl6ozk",
            "culture": "zeijani",
            "state": "habitable",
            "rock": "basalt_oxidised",
            "width_m": 19.0,
            "height_m": 15.0,
            "depth_m": 52.0,
            "km": 76,
            "px": [
                [589.0, 486.0], [594.5, 481.0], [599.5, 476.5],
                [604.0, 472.0], [612.0, 465.0], [620.5, 458.0],
            ],
            "branches": [
                {
                    "name": "Twilight Ranj & Alecap Foraging Tube",
                    "state": "habitable",
                    "width_m": 10.0,
                    "px": [[604.0, 472.0], [608.5, 482.0], [612.0, 492.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_nuru_vil",
                    "name": "Nūru-Šaplu (Deep-Lantern Village)",
                    "kind": "magma_chamber",
                    "settlement_id": "szjnuru03",
                    "px": [604.0, 472.0],
                    "span_m": [165, 125],
                    "height_m": 58,
                    "skylight_m": 22,
                    "notes": "Third canonical Zeijani cave village: carved into a drained parasitic magma chamber with Raufarholshellir red/purple oxidised basalt walls; center of alecap brewing and fungal alchemy.",
                },
            ],
        },

        # 5. STATION 11: SE SHOULDER ACTIVE HOT-REACH TUBE (Unsettled)
        {
            "id": "tube_hot_05",
            "name": "Station 11 SE Plume-Edge Hot Tube",
            "region": "rmuqlbqhl6ozk",
            "culture": "none",
            "state": "hot_reach",
            "rock": "basalt_flowbanded",
            "width_m": 20.0,
            "height_m": 13.0,
            "depth_m": 28.0,
            "km": 42,
            "px": [
                [594.0, 509.0], [600.0, 512.5], [606.0, 516.0],
                [613.5, 520.5], [620.0, 524.5],
            ],
            "branches": [],
            "caverns": [
                {
                    "id": "cav_st11_skylights",
                    "name": "Station 11 Three Skylights & Hot Reach",
                    "kind": "skylight_well",
                    "px": [606.0, 516.0],
                    "span_m": [24, 1400],
                    "height_m": 15,
                    "skylight_m": 18,
                    "notes": "Station 11 lava tube: 3 roof skylights with siphon trees and glow mushrooms upstream; active molten lava channel and CO2 sump downstream.",
                },
            ],
        },

        # 6. LESSER THRONE: BURIED MONASTERY ARCHIVE TUBES
        {
            "id": "tube_lesser_06",
            "name": "Lesser Throne Buried Archive Tube",
            "region": "rmucd8b2jn3d6",
            "culture": "ancients_and_monks",
            "state": "buried_vault",
            "rock": "tuff_and_basalt",
            "width_m": 15.0,
            "height_m": 10.0,
            "depth_m": 65.0,
            "km": 38,
            "px": [
                [861.0, 525.5], [866.0, 528.0], [872.5, 531.5], [879.0, 535.0],
            ],
            "branches": [],
            "caverns": [
                {
                    "id": "cav_monks_archive",
                    "name": "Entombed First Monastery Lava-Tube Vaults",
                    "kind": "buried_vault",
                    "px": [866.0, 528.0],
                    "span_m": [140, 90],
                    "height_m": 22,
                    "skylight_m": 0,
                    "notes": "LORE.md 6.15: The original monastery of the Monks of History, buried under welded ignimbrite when the Lesser Throne erupted.",
                },
            ],
        },

        # 7. GODTHRONE & GODSTEP VALLEY TITANIUM-BASALT MEGA-TUBES
        {
            "id": "tube_god_07",
            "name": "Godstep & Pluton Titanium-Basalt Master Tubes",
            "region": "rmvkkebdukgx7",
            "culture": "ancients",
            "state": "collapsed_rille",
            "rock": "tibasalt",
            "width_m": 48.0,
            "height_m": 28.0,
            "depth_m": 55.0,
            "km": 265,
            "px": [
                [620.8, 815.2], [638.0, 804.0], [656.0, 792.5],
                [675.0, 780.0], [694.0, 768.0],
            ],
            "branches": [
                {
                    "name": "Pluton Sealed Sub-Shield Tube",
                    "state": "habitable",
                    "width_m": 32.0,
                    "px": [[512.0, 972.0], [492.0, 985.0], [471.0, 998.0], [456.0, 1008.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_pluton_tube",
                    "name": "Pluton Pressurized Lava-Tube Galleries",
                    "kind": "magma_chamber",
                    "settlement_id": "ssdy2b2rxc",
                    "px": [471.0, 998.0],
                    "span_m": [320, 180],
                    "height_m": 45,
                    "skylight_m": 0,
                    "notes": "Insulated titanium-basalt lava tube halls at 9,650 m (0.50 atm) housing Pluton's deep mining works.",
                },
            ],
        },

        # 8. SOUTHERN RIFT CAVERNS (THE TUBES & LOJ TWENNY)
        {
            "id": "tube_rift_08",
            "name": "Southern Rift Basalt Tube Complex",
            "region": "rmvkkebdukgx7",
            "culture": "zeijani_and_scavengers",
            "state": "habitable",
            "rock": "basalt_flowbanded",
            "width_m": 24.0,
            "height_m": 16.0,
            "depth_m": 40.0,
            "km": 140,
            "px": [
                [356.0, 1198.0], [346.0, 1208.0], [336.0, 1217.0], [322.0, 1228.0],
            ],
            "branches": [
                {
                    "name": "Loj Twenny Rift-Wall Cavern Tube",
                    "state": "habitable",
                    "width_m": 18.0,
                    "px": [[198.0, 932.0], [185.0, 939.0], [174.0, 948.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_the_tubes",
                    "name": "The Tubes Cavern Settlement",
                    "kind": "bottle_hall",
                    "settlement_id": "sa8xk6pimb",
                    "px": [336.0, 1217.0],
                    "span_m": [220, 150],
                    "height_m": 38,
                    "skylight_m": 25,
                    "notes": "Canonical cavern settlement (sa8xk6pimb) in a braided rift-shoulder lava-tube complex.",
                },
                {
                    "id": "cav_loj_twenny",
                    "name": "Loj Twenny Cavern",
                    "kind": "kipuka_portal",
                    "settlement_id": "spbzmhdqqd",
                    "px": [185.0, 939.0],
                    "span_m": [160, 110],
                    "height_m": 30,
                    "skylight_m": 15,
                    "notes": "Canonical cavern settlement (spbzmhdqqd) on the western rift rim.",
                },
            ],
        },

        # 9. TWINS NW ACTIVE CONE CARAVAN PYRODUCT & ALPH HEADWATER CONDUIT (`vents[2]`, px 716, 1128 / expanded 988, 1458)
        {
            "id": "tube_xanadu_nw_09",
            "name": "Twins Caravan Pyroduct & Alph Headwater Conduit",
            "region": "rmw536m06wlyf",
            "culture": "xanadui_guides_and_caravaneers",
            "state": "geothermal",
            "rock": "dacite_and_basalt",
            "width_m": 26.0,
            "height_m": 18.0,
            "depth_m": 60.0,
            "km": 172,
            "px": [
                [716.0, 1128.0], [708.0, 1137.0], [698.0, 1149.0],
                [688.0, 1162.0], [666.0, 1166.0],
            ],
            "branches": [
                {
                    "name": "Caravan Pyroduct Cross-Range Route (Xanadu Portal to Catch Portal)",
                    "state": "habitable",
                    "width_m": 16.0,
                    "px": [[688.0, 1162.0], [708.0, 1137.0], [728.0, 1116.0], [742.0, 1102.0]],
                },
                {
                    "name": "NW-SE Saddle Fissure Dike Conduit",
                    "state": "geothermal",
                    "width_m": 16.0,
                    "px": [[716.0, 1128.0], [735.0, 1142.0], [752.0, 1155.0], [770.0, 1168.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_xanadu_nw_summit",
                    "name": "NW Twin Caldera & Caravan Skylight Vault (Nafkh al-Dukhān)",
                    "kind": "skylight_well",
                    "px": [708.0, 1137.0],
                    "span_m": [210, 145],
                    "height_m": 52,
                    "skylight_m": 28,
                    "notes": "Main caravan lava-tube skylight hall at +4,240 m on the WSW flank of the NW Twin (+6,480 m peak, +5,980 m crater floor), where caravaneers dash 1.8 km between Tube Segment I and Tube Segment II (biomes/twins/PLAN.md).",
                },
                {
                    "id": "cav_alph_headwater",
                    "name": "Sacred River Alph Pressurized Subglacial Reservoir",
                    "kind": "stepwell_cistern",
                    "px": [666.0, 1166.0],
                    "span_m": [240, 160],
                    "height_m": 64,
                    "skylight_m": 22,
                    "notes": "Subglacial meltwater cavern on Xanadu's NE ice wall where geothermal pressure drives the bursting chasm fountain at the head of the Sacred River Alph (biomes/xanadu/NOTES.md).",
                },
            ],
        },

        # 10. TWINS SE CONE EREBUS ICE CAVES & OASIS FEEDER TUBE (`vents[3]`, px 770, 1168 / expanded 1042, 1498)
        {
            "id": "tube_xanadu_se_10",
            "name": "Erebus Subglacial Ice-Cave & Catch Oasis Feeder Tube",
            "region": "rmw536m06wlyf",
            "culture": "caravaneers_and_divers",
            "state": "geothermal",
            "rock": "basalt_and_glacier_ice",
            "width_m": 24.0,
            "height_m": 16.0,
            "depth_m": 42.0,
            "km": 236,
            "px": [
                [770.0, 1168.0], [762.0, 1172.5], [756.0, 1176.0],
                [747.0, 1181.5], [738.0, 1187.0],
            ],
            "branches": [
                {
                    "name": "Bitta ('Bitter Water') Sub-Fan Mineral Pyroduct",
                    "state": "habitable",
                    "width_m": 15.0,
                    "px": [[770.0, 1168.0], [782.0, 1172.0], [794.0, 1176.0], [806.0, 1180.0]],
                },
                {
                    "name": "Lasso ('The Last Water') Southern Pass Feeder Tube",
                    "state": "habitable",
                    "width_m": 14.0,
                    "px": [[770.0, 1168.0], [769.0, 1191.0], [768.5, 1214.0], [768.0, 1236.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_erebus_ice_field",
                    "name": "Kverkfjoll / Erebus Blue-Ice Fumarole Vaults",
                    "kind": "bottle_hall",
                    "px": [770.0, 1168.0],
                    "span_m": [190, 125],
                    "height_m": 40,
                    "skylight_m": 18,
                    "notes": "Subglacial ice caves at +5,420 m beneath the +5,880 m SE Twin summit (`erebustwin`, biomes/twins/PLAN.md): blue-lit glacier vaults with 88 C boiling geysers and hollow fumarolic ice chimneys.",
                },
                {
                    "id": "cav_bitta_spring",
                    "name": "Bitta ('Bitter Water') Lava-Tube Spring Mouth",
                    "kind": "kipuka_portal",
                    "px": [806.0, 1180.0],
                    "span_m": [95, 60],
                    "height_m": 18,
                    "skylight_m": 12,
                    "notes": "Distal lava-tube spring surfacing at the fan toe of Oasis #4 (Bitta / al-Bitar, biomes/catch/PLAN.md), discharging mineralized volcanic brackish water.",
                },
                {
                    "id": "cav_lasso_spring",
                    "name": "Lasso ('The Last Water') Sub-Fan Cistern",
                    "kind": "stepwell_cistern",
                    "px": [768.0, 1236.0],
                    "span_m": [110, 70],
                    "height_m": 22,
                    "skylight_m": 10,
                    "notes": "Southern lava-tube spring surfacing at Oasis #5 (Lasso / Lastu, biomes/catch/PLAN.md), the last water before the 7.3 km pass toward Strongbow.",
                },
            ],
        },

        # 11. GODTHRONE WNW VACUUM SHIELD & SPAN-WALL TITANIUM PYRODUCT (`rmvkkebdukgx7`)
        {
            "id": "tube_god_nw_11",
            "name": "Godthrone WNW Shield & Span-Wall Titanium Pyroduct",
            "region": "rmvkkebdukgx7",
            "culture": "ancients",
            "state": "collapsed_rille",
            "rock": "tibasalt",
            "width_m": 54.0,
            "height_m": 34.0,
            "depth_m": 65.0,
            "km": 310,
            "px": [
                [556.0, 916.0], [534.0, 898.0], [510.0, 882.0],
                [486.0, 868.0], [462.0, 855.0],
            ],
            "branches": [
                {
                    "name": "Upper Vacuum Skylight Gallery",
                    "state": "collapsed_rille",
                    "width_m": 30.0,
                    "px": [[534.0, 898.0], [520.0, 912.0], [504.0, 924.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_god_nw_skylight",
                    "name": "The Vacuum Glass Cathedral",
                    "kind": "magma_chamber",
                    "px": [510.0, 882.0],
                    "span_m": [380, 210],
                    "height_m": 68,
                    "skylight_m": 45,
                    "notes": "Giant collapsed titanium-basalt skylight gallery at ~13.8 km on the Godthrone's WNW vacuum shield, lined with metallic ilmenite-magnetite dripstone stalactites.",
                },
            ],
        },

        # 12. GODTHRONE NORTH SHIELD & TALIA-SADDLE ILMENITE TUBE (`rmvkkebdukgx7`)
        {
            "id": "tube_god_n_12",
            "name": "Godthrone North Shield & Talia-Saddle Ilmenite Tube",
            "region": "rmvkkebdukgx7",
            "culture": "ancients",
            "state": "habitable",
            "rock": "tibasalt",
            "width_m": 44.0,
            "height_m": 28.0,
            "depth_m": 58.0,
            "km": 285,
            "px": [
                [578.0, 910.0], [582.0, 882.0], [586.0, 852.0],
                [591.0, 822.0], [596.0, 792.0],
            ],
            "branches": [
                {
                    "name": "West Godstep Rim Cross-Conduit",
                    "state": "habitable",
                    "width_m": 26.0,
                    "px": [[586.0, 852.0], [604.0, 838.0], [620.8, 815.2]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_god_n_ilmenite",
                    "name": "Ilmenite Pillar Vault",
                    "kind": "bottle_hall",
                    "px": [586.0, 852.0],
                    "span_m": [290, 175],
                    "height_m": 54,
                    "skylight_m": 0,
                    "notes": "Sealed sub-shield titanium-basalt lava tube chamber on the northern Godthrone slope where slow cooling precipitated 30-meter hexagonal columns of black ilmenite.",
                },
            ],
        },

        # 13. GODTHRONE SE SHIELD & CATCH-RIM RADIAL PYRODUCT (`rmvkkebdukgx7`)
        {
            "id": "tube_god_se_13",
            "name": "Godthrone SE Shield & Catch-Rim Radial Pyroduct",
            "region": "rmvkkebdukgx7",
            "culture": "uninhabited",
            "state": "geothermal",
            "rock": "tibasalt",
            "width_m": 46.0,
            "height_m": 30.0,
            "depth_m": 62.0,
            "km": 340,
            "px": [
                [594.0, 946.0], [618.0, 968.0], [642.0, 992.0],
                [666.0, 1018.0], [690.0, 1044.0],
            ],
            "branches": [
                {
                    "name": "East Caldera Ring-Fault Feeder",
                    "state": "geothermal",
                    "width_m": 28.0,
                    "px": [[618.0, 968.0], [636.0, 954.0], [654.0, 942.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_god_se_fumarole",
                    "name": "Sub-Glacial Sulfide Dome",
                    "kind": "magma_chamber",
                    "px": [642.0, 992.0],
                    "span_m": [310, 195],
                    "height_m": 58,
                    "skylight_m": 18,
                    "notes": "Geothermally heated titanium-basalt master tube on the SE Godthrone flank where residual volcanic heat melts subglacial domes into warm acidic sulfur lakes.",
                },
            ],
        },

        # 14. GODTHRONE SSW SHIELD & BRINE-LAKE SIPHON PYRODUCT (`rmvkkebdukgx7`)
        {
            "id": "tube_god_ssw_14",
            "name": "Godthrone SSW Shield & Brine-Lake Siphon Pyroduct",
            "region": "rmvkkebdukgx7",
            "culture": "uninhabited",
            "state": "geothermal",
            "rock": "tibasalt",
            "width_m": 50.0,
            "height_m": 32.0,
            "depth_m": 60.0,
            "km": 295,
            "px": [
                [568.0, 952.0], [562.0, 982.0], [558.0, 1012.0],
                [564.0, 1042.0], [571.0, 1068.0],
            ],
            "branches": [
                {
                    "name": "Olympus Basal Scarp Discharge Conduit",
                    "state": "collapsed_rille",
                    "width_m": 28.0,
                    "px": [[558.0, 1012.0], [532.0, 1028.0], [506.0, 1044.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_god_brine_throat",
                    "name": "Red Riwa Subglacial Brine-Lake Conduit",
                    "kind": "stepwell_cistern",
                    "px": [571.0, 1068.0],
                    "span_m": [350, 220],
                    "height_m": 62,
                    "skylight_m": 0,
                    "notes": "Subglacial titanium-basalt feeder cavern at 6,415 m beneath the southern EF ice sheet that warms and mineralizes the brine reservoir feeding Red Riwa.",
                },
            ],
        },

        # 15. NEO-OZARKS DOLOMITE KARST & PORPHYRY-VEIN CAVERN NETWORK (`rmvyiyw8ucd1y`)
        {
            "id": "tube_ozarks_15",
            "name": "Neo-Ozarks Dolomite Karst & Porphyry-Vein Cavern System",
            "region": "rmvyiyw8ucd1y",
            "culture": "miners_and_spelunkers",
            "state": "habitable",
            "rock": "dolomite_and_porphyry",
            "width_m": 32.0,
            "height_m": 24.0,
            "depth_m": 48.0,
            "km": 310,
            "px": [
                [974.0, -158.0], [940.0, -156.0], [924.0, -151.0],
                [904.0, -146.0], [872.0, -162.0],
            ],
            "branches": [
                {
                    "name": "Red Porphyry Dike Contact Gallery",
                    "state": "habitable",
                    "width_m": 22.0,
                    "px": [[940.0, -156.0], [962.0, -178.0], [986.0, -194.0]],
                },
                {
                    "name": "Spider Lake Sub-Escarpment Phreatic Conduit",
                    "state": "geothermal",
                    "width_m": 20.0,
                    "px": [[940.0, -156.0], [956.0, -138.0], [974.0, -124.0]],
                },
            ],
            "caverns": [
                {
                    "id": "cav_ozarks_porphyry",
                    "name": "Cathedral of the Red Porphyry Vein",
                    "kind": "bottle_hall",
                    "px": [940.0, -156.0],
                    "span_m": [280, 165],
                    "height_m": 52,
                    "skylight_m": 16,
                    "notes": "Vast phreatic dissolution hall in the Neo-Ozarks where groundwater dissolved cherty Gasconade-type dolomite along an impermeable dike wall of polished purple-red rhyolite porphyry.",
                },
                {
                    "id": "cav_ozarks_onyx",
                    "name": "Onyx Pillar & Chert-Bridge Labyrinth",
                    "kind": "kipuka_portal",
                    "px": [904.0, -146.0],
                    "span_m": [210, 140],
                    "height_m": 38,
                    "skylight_m": 12,
                    "notes": "Multi-level dolomite and limestone cavern famous for 20-meter banded cave-onyx columns, suspended chert-breccia bridges, and copper-iron porphyry mineral veins.",
                },
                {
                    "id": "cav_ozarks_resurgence",
                    "name": "The Shut-In Big Spring Resurgence",
                    "kind": "stepwell_cistern",
                    "px": [872.0, -162.0],
                    "span_m": [175, 115],
                    "height_m": 28,
                    "skylight_m": 22,
                    "notes": "First-magnitude karst spring cavern discharging emerald calcium-magnesium water through a breached porphyry shut-in gorge into the Neo-Ozark Porphyry Fork.",
                },
            ],
        },
    ]

    tubes_list = []
    for t in raw_tubes:
        tc = copy.deepcopy(t)
        tc["px"] = _shift_pts(tc["px"], dx, dy)
        for b in tc.get("branches", []):
            b["px"] = _shift_pts(b["px"], dx, dy)
        for c in tc.get("caverns", []):
            c["px"] = [round(float(c["px"][0]) + dx, 2), round(float(c["px"][1]) + dy, 2)]
        tubes_list.append(tc)

    new_zeijani_settlements = [
        {
            "id": "szjsurpu01",
            "name": "Šurpu-Dhelv",
            "type": "cavern",
            "px": int(round(534.0 + dx)),
            "py": int(round(488.0 + dy)),
            "notes": "Zeijani cave and tuff village on the WNW flank of the Throne: fairy-chimney tuff spires and 4-level underground galleries above a braided lava tube, with covert scout tunnels toward the Zey'danin frontier (kits/zeijani/README.md, biomes/throne/NOTES.md).",
            "createdAt": "2026-10-31T19:30:00.000Z",
        },
        {
            "id": "szjqarnu02",
            "name": "Qarnu-Tūbu",
            "type": "cavern",
            "px": int(round(562.0 + dx)),
            "py": int(round(552.0 + dy)),
            "notes": "Zeijani cave and tuff village on the SSW savanna-tuff shoulder of the Throne: Moray-style terraced collapse skylights and a stepwell cistern in an ancient pahoehoe master tube, trading with the surface Ash Nomads (kits/zeijani/README.md, biomes/throne/NOTES.md).",
            "createdAt": "2026-10-31T19:30:00.000Z",
        },
        {
            "id": "szjnuru03",
            "name": "Nūru-Šaplu",
            "type": "cavern",
            "px": int(round(604.0 + dx)),
            "py": int(round(472.0 + dy)),
            "notes": "Zeijani cave village on the ENE plume-edge shoulder of the Throne: carved into a drained parasitic magma chamber with Raufarholshellir oxidised red and purple basalt walls; center of alecap brewing and fungal alchemy (kits/zeijani/README.md, biomes/throne/NOTES.md).",
            "createdAt": "2026-10-31T19:30:00.000Z",
        },
    ]

    return tubes_list, new_zeijani_settlements
