"""Tectonic & Messinian ("Shiveria") Evaporite-Basin Remodeling for the East Abyss & SE Desert Corridor.

Implements Proposal 2 (`east-abyss-shiveria-proposal.md`) on the unified `2 km/cell` full-resolution height grid
(`1393 x 1549`, `su = 1.0, sv = 1.0`):
  - Stage 1: 5 en-echelon master normal fault segments (`F1..F5`), tilted relay ramps (including the 44-deg Verge
    fault-relay spur at `px 991..999, py 616..624` and the `+740 m` Locus eastern horizon shelf at
    `px 999..1006, py 695..730`), and wine-glass triangular faceted spurs replacing the uniform bathtub rim.
  - Stage 2: Oblique N35W Tamadart-Mungo horst sill (`py 492..542`) with an axial caravan wind-gap col replacing the
    1D horizontal `hump()`, plus the N42E Bowl-Locus En-Echelon Transfer Belt & Fossil Overflow Spillway
    (`px 915..978, py 705..808`) linking The Bowl (`-945 m` sill) through Lakes #48 (`-1,434 m`) and #46 (`-1,908 m`)
    down into the Locus red-brine basin (#45, `-2,400 m`).
  - Stage 3: Two-tiered stepped East Rim (`rmuvkd2jtd3zm`) with a Lower Abyssal Savanna (`XV`) bench (`-1,600 to
    -1,150 m`, rising at ~6 deg from 1.5 km east of Mungo) and an Upper Steppe-Savanna (`BSh`/`Aw`) caprock bench
    (`-550 to -100 m`).
  - Stage 4: Headward-recessed Shiveria cataract gorges (`16-35 km` upstream incision eliminating the 1-cell
    `789-1,337 m` waterfalls on `r255`, `r264`, `r165`, `r197`, `r114`, `r079`, `r067`, `r053`, `r037`, `r019`, etc.)
    paired with lobate canyon-mouth alluvial megafans (`+40 to +125 m` apex cones).
  - Stage 5: Concentric Messinian evaporite bull's-eye benches (`inner halite flat`, `middle strand bench`, `outer
    gypsum apron`), asymmetric half-graben lake bathymetry (preserving shallow 3 m reed shelves at Reed and Mungo),
    and N25W kalut yardang corridors in the hyper-arid western floor of The Bowl, while locking all 10 corridor
    settlement pins (Furrow, Reed, Mungo, Shade, Verge, Locus, Yuni, Mantis, Arcbeam, Talia).
"""
import math
import numpy as np
from scipy import ndimage as nd
from . import geom as G

# Canonical full-resolution map dimensions (2 km/px)
REF_W = 1550.0
REF_H = 1394.0

# 10 Corridor Settlement Protection Pins: (name, px_x, px_y, r_inner_px, r_outer_px)
# At 2 km/px, r_inner_px=4.5..7.0 locks the immediate settlement footprint,
# feathering smoothly out to r_outer_px=10.5..16.0.
SETTLEMENT_PINS = [
    ("Furrow",  1004.0, 309.0,  4.5, 11.0),
    ("Reed",    1005.0, 346.0,  5.5, 12.0),
    ("Mungo",   1049.0, 495.0,  5.5, 12.0),
    ("Shade",    957.0, 555.0,  6.5, 14.0),
    ("Verge",    991.0, 616.0,  3.5,  9.0),
    ("Locus",    995.0, 713.0,  5.0, 11.5),
    ("Yuni",     991.0, 759.0,  6.5, 14.0),
    ("Mantis",   841.0, 834.0,  6.5, 14.0),
    ("Arcbeam",  744.0, 728.0,  7.0, 16.0),
    ("Talia",    801.0, 609.0,  7.0, 16.0),
]

# Target rim-crossing perennial rivers for cataract gorge incision & canyon-mouth megafans
CATARACT_RIVER_IDS = {
    "r019", "r037", "r050", "r053", "r067", "r077", "r079", "r102",
    "r114", "r127", "r158", "r165", "r184", "r188", "r197", "r200",
    "r226", "r228", "r229", "r232", "r251", "r255", "r264",
}

# 5 En-Echelon Master Normal Fault Segments along the East Abyss Rift Margin:
# (x0, y0, x1, y1, dip_dir_x, throw_m, has_relay_ramp_south)
MASTER_FAULT_SEGMENTS = [
    # F1: Locus-Asolt Southern Graben Segment (steep W and E walls)
    (960.0, 735.0,  988.0, 665.0, +1.0, 1850.0, True),
    # F2: Verge Master Border Fault Segment (sheer W scarp + 44-deg Verge relay spur at 991, 616)
    (984.0, 670.0,  996.0, 575.0, +1.0, 2150.0, True),
    # F3: Tamadart-Shade Master Scarp (sheer W border wall below Shade at 957, 555)
    (982.0, 580.0, 1008.0, 495.0, +1.0, 2300.0, True),
    # F4: Mungo-Solt Asymmetric Half-Graben Master Fault (W master wall opposite stepped East Rim)
    (1002.0, 505.0, 1022.0, 415.0, +1.0, 2050.0, True),
    # F5: Reed-Furrow Propagating Rift Tip & Horse-Tail Splay
    (1012.0, 420.0,  995.0, 305.0, +1.0, 1750.0, False),
]

# Horse-tail normal fault splays at the northern propagating rift tip (Sub-Basin V)
NORTH_HORSETAIL_SPLAYS = [
    (988.0, 368.0, 965.0, 310.0, 650.0),
    (999.0, 352.0, 982.0, 305.0, 550.0),
]


def _fbm2(px, py, scale=24.0, seed=424):
    """Deterministic multi-octave spatial noise evaluated on full-resolution map pixel coordinates `(px, py)`."""
    val = np.zeros_like(px, dtype=np.float64)
    amp = 0.5
    freq = 1.0 / float(scale)
    for oct_i in range(4):
        ph_x = (seed * (oct_i + 1) * 1.37) % (2.0 * math.pi)
        ph_y = (seed * (oct_i + 1) * 2.93) % (2.0 * math.pi)
        n = np.sin(px * freq + ph_x) * np.cos(py * freq + ph_y)
        n += 0.5 * np.sin((px * 0.8 - py * 0.6) * freq * 1.7 + ph_y)
        val += amp * n
        amp *= 0.5
        freq *= 2.07
    return val


def _reg_mask_by_id(regs_list, reg_id, su, sv, shape):
    """Rasterize a region polygon by its `id` (or fallback `name`) onto `shape`."""
    rec = next((r for r in regs_list if r.get("id") == reg_id), None)
    if rec is None:
        rec = next((r for r in regs_list if r.get("name", "").strip() == reg_id), None)
    if rec is None:
        return np.zeros(shape, dtype=bool)
    return G.poly(rec["points"], su, sv, shape)


def _build_protection_mask(px, py, whas, px_per_cell):
    """Return a smooth multiplier in `[0, 1]` that is `0.0` on existing water cells (`whas`) and at all 10
    settlement pins, rising smoothly to `1.0` outside the protection buffers."""
    allow = np.ones_like(px, dtype=np.float64)
    # 1. Shoreline buffer around all existing lakes (1.2 to 3.8 map px)
    shore_dist_px = nd.distance_transform_edt(~whas) * px_per_cell
    allow *= G.sstep(1.2, 3.8, shore_dist_px)
    # 2. Settlement pin buffers
    for _, sx, sy, r_in, r_out in SETTLEMENT_PINS:
        d_px = np.hypot(px - sx, py - sy)
        allow *= G.sstep(r_in, r_out, d_px)
    return allow


def _relax_cataract_profile_1d(r_el, locked_mask, max_step_m=175.0, n_iters=220):
    """Given a 1D river elevation array `r_el` along its vertex sequence, compute a cataract-incised longitudinal
    profile `prof` that:
      1. Respects locked vertices (`locked_mask`, e.g., lake cells and exact settlement pin centers),
      2. Smoothly redistributes any single-step waterfall drop `> max_step_m` both headward (incising a recessed
         cataract canyon into the plateau lip) and tailward (building an alluvial fan apron at the canyon toe), and
      3. Superimposes a subtle 7-cataract staircase modulation along deep gorges without creating boundary jumps.
    """
    prof = r_el.copy().astype(np.float64)
    n = len(prof)
    if n < 3:
        return prof

    # Enforce monotonic non-increasing base profile first
    for i in range(1, n):
        if prof[i] > prof[i - 1] and not locked_mask[i]:
            prof[i] = prof[i - 1]

    # Symmetric excess-drop relaxation: spread steep drops across both upstream canyon & downstream fan
    for _ in range(n_iters):
        changed = False
        for i in range(n - 1):
            drop = prof[i] - prof[i + 1]
            if drop <= max_step_m:
                continue
            excess = drop - max_step_m
            u_lock = bool(locked_mask[i])
            d_lock = bool(locked_mask[i + 1])
            if not u_lock and not d_lock:
                # 65% headward canyon incision, 35% tailward fan aggradation (capped at r_el + 240m)
                prof[i] -= 0.45 * excess
                new_dn = min(r_el[i + 1] + 240.0, prof[i + 1] + 0.25 * excess)
                if new_dn > prof[i + 1]:
                    prof[i + 1] = new_dn
                changed = True
            elif not u_lock and d_lock:
                prof[i] -= 0.55 * excess
                changed = True
            elif u_lock and not d_lock:
                new_dn = min(r_el[i + 1] + 320.0, prof[i + 1] + 0.55 * excess)
                if new_dn > prof[i + 1]:
                    prof[i + 1] = new_dn
                    changed = True
        if not changed:
            break

    # Subtle 7-cataract step modulation inside incised gorge segments
    incision = np.abs(r_el - prof)
    if np.max(incision) > 60.0:
        s_idx = np.arange(n, dtype=np.float64) / max(1.0, float(n - 1))
        ripple = 10.0 * np.sin(2.0 * math.pi * 7.0 * s_idx) * np.clip(incision / 300.0, 0.0, 1.0)
        ripple[locked_mask] = 0.0
        prof_r = prof + ripple
        # Ensure ripple never increases max step drop above `max_step_m + 18 m`
        for _ in range(40):
            for i in range(n - 1):
                drop = prof_r[i] - prof_r[i + 1]
                if drop > max_step_m + 18.0:
                    ex = drop - (max_step_m + 18.0)
                    if not locked_mask[i]:
                        prof_r[i] -= 0.5 * ex
                    if not locked_mask[i + 1]:
                        prof_r[i + 1] += 0.5 * ex
        prof = prof_r

    return prof


def remodel_east_abyss(Eo, whas0, wlev0, regs_list, rivers_list):
    """Execute the 5-stage Failed Continental Rift (Aulacogen) & Shiveria remodeling on `Eo`.

    Parameters
    ----------
    Eo : np.ndarray, shape (VH, VW)
        Input elevation grid in meters (typically `1393 x 1549` at `2 km/cell`).
    whas0 : np.ndarray of bool, shape (VH, VW)
        Existing water presence mask.
    wlev0 : np.ndarray of float, shape (VH, VW)
        Existing water surface elevations in meters.
    regs_list : list of dict
        Regions from `regions.json` / `DATA.regions`.
    rivers_list : list of dict
        Rivers from `DATA.rivers`.

    Returns
    -------
    En : np.ndarray of float32, shape (VH, VW)
        Remodeled elevation grid in meters.
    whas2 : np.ndarray of bool, shape (VH, VW)
        Preserved water presence mask (`100%` identical to `whas0` across the corridor).
    wlev2 : np.ndarray of float32, shape (VH, VW)
        Preserved water level grid (`100%` identical to `wlev0` across the corridor).
    changed_mask : np.ndarray of bool, shape (VH, VW)
        Cells where `|En - Eo| > 1.0 m`.
    meta_dict : dict
        Diagnostic and geomorphic weight maps for `update_east_abyss_climate`.
    """
    E = np.asarray(Eo, dtype=np.float64).copy()
    whas2 = np.asarray(whas0, dtype=bool).copy()
    wlev2 = np.asarray(wlev0, dtype=np.float64).copy()

    VH, VW = E.shape
    # If Eo is the canonical 1393 x 1549 full-res grid, su = sv = 1.0 (1 cell = 1 map px = 2 km).
    if VH == 1393 and VW == 1549:
        su, sv = 1.0, 1.0
        px_per_cell = 1.0
    else:
        su, sv = VW / REF_W, VH / REF_H
        px_per_cell = 1.0 / su

    hv, hu = np.indices((VH, VW))
    px = hu / su
    py = hv / sv

    # Region polygon masks on (VH, VW)
    m_eabysss = _reg_mask_by_id(regs_list, "rmuqltx63f4do", su, sv, (VH, VW))  # e abysss
    m_eabyss2 = _reg_mask_by_id(regs_list, "rmv8b6ktg4rwg", su, sv, (VH, VW))  # e abyss
    m_sedes   = _reg_mask_by_id(regs_list, "rmuqlrsc52nhl", su, sv, (VH, VW))  # sedesert
    m_bowl_b  = _reg_mask_by_id(regs_list, "rmvka5413efyi", su, sv, (VH, VW))  # the bowl (biome)
    m_bowl_g  = _reg_mask_by_id(regs_list, "rmuc6vtafysgi", su, sv, (VH, VW))  # The Bowl (geographic)
    m_lower   = _reg_mask_by_id(regs_list, "rmvelil63yc5b", su, sv, (VH, VW))  # lower
    m_lower2  = _reg_mask_by_id(regs_list, "rmveljn8z2uq6", su, sv, (VH, VW))  # lower2
    m_erim    = _reg_mask_by_id(regs_list, "rmuvkd2jtd3zm", su, sv, (VH, VW))  # east rim
    m_ebad    = _reg_mask_by_id(regs_list, "rmuqm20f95x4v", su, sv, (VH, VW))  # e badlands
    m_yuni    = _reg_mask_by_id(regs_list, "rmuvlpgkd7v7w", su, sv, (VH, VW))  # Yuni Valley

    m_abyss_all = m_eabysss | m_eabyss2 | m_lower | m_lower2
    m_bowl_all  = m_bowl_b | m_bowl_g
    corridor_mask = m_abyss_all | m_bowl_all | m_erim | m_sedes | m_yuni

    allow = _build_protection_mask(px, py, whas2, px_per_cell)

    # Smooth perimeter feathering so outer boundary of corridor has 0.000 m jump
    dist_corridor_px = nd.distance_transform_edt(corridor_mask) * px_per_cell
    corridor_env = G.sstep(1.5, 8.0, dist_corridor_px)
    allow_corr = allow * corridor_env

    # =========================================================================
    # STAGE 1: 5 En-Echelon Master Fault Segments, Relay Ramps, Verge Spur,
    #          Locus +740m Eastern Horizon Shelf, and Faceted Wine-Glass Spurs
    # =========================================================================
    # 1A. Locus Eastern Horizon Shelf (px 999..1006, py 694..736):
    # Locus (px 995, 713, E = -1549 m on 2 km grid) sits on the NE delta of the red salt lake (#45, -2399.9 m)
    # with a close ~740 m abyssal bench to the east (at px 1001..1005, E ~ -800 to -740 m, i.e., +750 m above Locus,
    # forming the 10.5-deg eastern shelf silhouette in `settlements/locus/LOCUS-NOTES.md`).
    locus_shelf_w = (
        G.sstep(999.0, 1001.5, px)
        * (1.0 - G.sstep(1004.5, 1007.5, px))
        * G.sstep(695.0, 702.0, py)
        * (1.0 - G.sstep(725.0, 734.0, py))
    )
    target_locus_shelf = -790.0 + 45.0 * _fbm2(px, py, scale=10.0, seed=101)
    # Lock Locus (995, 713) up to r=4 px, then allow the shelf bench at px=1001..1005
    d_locus_px = np.hypot(px - 995.0, py - 713.0)
    shelf_allow = G.sstep(4.0, 6.0, d_locus_px) * (~whas2)
    E = np.where(
        locus_shelf_w > 0.0,
        E + locus_shelf_w * shelf_allow * 0.85 * (target_locus_shelf - E),
        E,
    )

    # 1B. Verge Fault-Relay Buttress Spur (px 991..999, py 616..625):
    # South of the Verge cataract gorge (`r255`), the escarpment descends as a stepped, bedded rock buttress
    # spur (`settlements/verge/DESIGN.md`) connecting Upper Verge (px 991, 616) to Lower Verge (~ -1950 m)
    # with rest-stop ledges at 200, 400, 600, 800 m of fall.
    in_verge_spur = (
        (px >= 990.5) & (px <= 1000.5)
        & (py >= 615.5) & (py <= 626.5)
        & (~whas2)
    )
    u_vspur = np.clip((px - 991.0) / 7.5, 0.0, 1.0)
    v_vspur = np.exp(-0.5 * ((py - 619.5) / 2.8) ** 2)
    spur_stair = u_vspur - 0.045 * np.sin(4.0 * math.pi * u_vspur)
    z_vspur = -150.0 - 1750.0 * spur_stair
    w_vspur = v_vspur * G.sstep(0.12, 0.28, u_vspur) * (1.0 - G.sstep(0.85, 1.0, u_vspur))
    E = np.where(in_verge_spur, E + w_vspur * allow_corr * 0.65 * (z_vspur - E), E)

    # 1C. En-Echelon Master Normal Fault Segments (F1..F5) & Overlapping Relay Ramps
    f_noise = _fbm2(px, py, scale=26.0, seed=115)
    for idx_f, (fx0, fy0, fx1, fy1, dip_x, throw_m, has_relay) in enumerate(MASTER_FAULT_SEGMENTS):
        vx, vy = fx1 - fx0, fy1 - fy0
        seg_len = math.hypot(vx, vy) + 1e-9
        ux, uy = vx / seg_len, vy / seg_len
        s_along = (px - fx0) * ux + (py - fy0) * uy
        d_perp = ((px - fx0) * (-uy) + (py - fy0) * ux) * np.sign(dip_x)

        s_norm = s_along / seg_len
        in_seg = (s_norm >= -0.08) & (s_norm <= 1.08) & (np.abs(d_perp) <= 22.0)
        if not np.any(in_seg):
            continue

        tip_taper = np.sin(np.clip(s_norm, 0.0, 1.0) * math.pi) ** 0.85
        spur_wave = np.abs(np.sin(math.pi * s_along / 7.0 + 1.1 * f_noise + idx_f)) ** 1.65
        scarp_band = np.exp(-0.5 * ((d_perp - 2.5) / 4.2) ** 2) * tip_taper

        footwall_up = 85.0 * np.exp(-0.5 * ((d_perp + 5.5) / 3.8) ** 2) * tip_taper
        spur_relief = 135.0 * (spur_wave - 0.42) * scarp_band

        relay_zone = (
            np.exp(-0.5 * ((s_norm - 0.05) / 0.12) ** 2)
            + np.exp(-0.5 * ((s_norm - 0.95) / 0.12) ** 2)
        )
        wall_t = np.clip((E - (-1600.0)) / 2000.0, 0.0, 1.0)
        relay_bench = -110.0 * np.sin(2.0 * math.pi * wall_t) * np.clip(relay_zone, 0.0, 1.0) * scarp_band

        delta_f = (footwall_up + spur_relief + relay_bench) * G.sstep(-1900.0, -1100.0, E) * (1.0 - G.sstep(900.0, 1600.0, E))
        E = np.where(in_seg & (~m_erim) & (~whas2), E + allow_corr * delta_f, E)

    # 1D. Northern Propagating Rift Tip Horse-Tail Normal Fault Splays (Sub-Basin V: Furrow & Reed Lake)
    for hx0, hy0, hx1, hy1, h_throw in NORTH_HORSETAIL_SPLAYS:
        vx, vy = hx1 - hx0, hy1 - hy0
        hlen = math.hypot(vx, vy) + 1e-9
        s_h = ((px - hx0) * vx + (py - hy0) * vy) / (hlen * hlen)
        d_h = ((px - hx0) * (-vy / hlen) + (py - hy0) * (vx / hlen))
        env_h = (
            G.sstep(-0.05, 0.15, s_h)
            * (1.0 - G.sstep(0.85, 1.05, s_h))
            * np.exp(-0.5 * (d_h / 4.5) ** 2)
        )
        splay_step = -95.0 * np.sin(math.pi * np.clip(d_h / 4.5, -1.0, 1.0)) * env_h
        E = np.where((env_h > 0.02) & (~whas2), E + allow_corr * splay_step, E)

    # =========================================================================
    # STAGE 2: Oblique N35W Tamadart-Mungo Horst Sill & Bowl-Locus Transfer Belt
    # =========================================================================
    # 2A. Oblique N35W Tamadart-Mungo Accommodation Horst Sill (py 492..542)
    dx_s = px - 1026.0
    dy_s = py - 518.0
    th_s = math.radians(35.0)
    u_perp =  dx_s * math.cos(th_s) + dy_s * math.sin(th_s)
    v_para = -dx_s * math.sin(th_s) + dy_s * math.cos(th_s)
    sill_env = np.exp(-0.5 * (u_perp / 10.5) ** 2) * np.exp(-0.5 * (v_para / 18.0) ** 2)
    col_notch = 1.0 - 0.48 * np.exp(-0.5 * ((v_para - 3.0) / 5.0) ** 2)
    sill_delta = (
        (225.0 * col_notch - 140.0 * (1.0 - col_notch)) * sill_env
        + 55.0 * sill_env * _fbm2(px, py, scale=12.0, seed=202)
    )
    sill_horst_mask = m_abyss_all & (py >= 492.0) & (py <= 542.0) & (E < -1200.0) & (~whas2)
    E = np.where(sill_horst_mask, E + allow_corr * sill_delta, E)

    # 2B. Bowl-Locus En-Echelon Transfer Belt & Fossil Overflow Spillway (px 915..978, py 705..808)
    in_transfer_box = (px >= 914.0) & (px <= 980.0) & (py >= 704.0) & (py <= 810.0) & (~whas2)
    th_tr = math.radians(42.0)
    utr = (px - 946.0) * math.cos(th_tr) + (py - 756.0) * math.sin(th_tr)
    vtr = -(px - 946.0) * math.sin(th_tr) + (py - 756.0) * math.cos(th_tr)
    env_tr = (
        np.exp(-0.5 * (utr / 18.0) ** 2)
        * np.exp(-0.5 * (vtr / 28.0) ** 2)
        * G.sstep(-1950.0, -700.0, E)
        * (1.0 - G.sstep(850.0, 1500.0, E))
    )
    horst_graben_wave = 115.0 * np.sin(2.0 * math.pi * utr / 13.0 + 0.4 * _fbm2(px, py, scale=16.0, seed=250))
    E = np.where(in_transfer_box, E + allow_corr * env_tr * horst_graben_wave, E)

    spill_pts = np.array([
        [945.0, 798.0,  -945.0],
        [943.0, 760.0, -1180.0],
        [943.6, 719.4, -1434.2],
        [956.7, 711.9, -1907.6],
        [975.0, 713.0, -2380.0],
    ], dtype=np.float64)

    transfer_spill_mask = np.zeros((VH, VW), dtype=bool)
    for i in range(len(spill_pts) - 1):
        x0, y0, z0 = spill_pts[i]
        x1, y1, z1 = spill_pts[i + 1]
        vx, vy = x1 - x0, y1 - y0
        seg_l2 = vx * vx + vy * vy + 1e-9
        t_seg = np.clip(((px - x0) * vx + (py - y0) * vy) / seg_l2, 0.0, 1.0)
        m_off = 1.6 * np.sin(t_seg * math.pi * 2.0 + i * 1.3) * np.sin(t_seg * math.pi)
        nx_s, ny_s = -vy / math.sqrt(seg_l2), vx / math.sqrt(seg_l2)
        cx_s = x0 + t_seg * vx + nx_s * m_off
        cy_s = y0 + t_seg * vy + ny_s * m_off
        d_seg = np.hypot(px - cx_s, py - cy_s)
        z_thal = z0 + (z1 - z0) * t_seg + 32.0 * _fbm2(px, py, scale=14.0, seed=303 + i)
        canyon_w = np.exp(-0.5 * (d_seg / 4.2) ** 2)
        carve = np.maximum(0.0, E - (z_thal + 45.0 * (d_seg / 4.2) ** 1.5))
        in_seg_c = in_transfer_box & (d_seg < 12.0)
        transfer_spill_mask |= (in_seg_c & (d_seg < 6.5))
        E = np.where(in_seg_c, E - allow_corr * canyon_w * carve * 0.78, E)

    transfer_relay_mask = in_transfer_box & ((env_tr > 0.15) | transfer_spill_mask)

    # =========================================================================
    # STAGE 3: Two-Tiered Stepped East Rim Savanna Benches (`rmuvkd2jtd3zm`)
    # =========================================================================
    in_erim_ramp = m_erim & (E > -1760.0) & (E < 980.0) & (~whas2)
    tau = np.clip((E - (-1760.0)) / 2740.0, 0.0, 1.0)
    tau_step = (
        0.22 * G.sstep(0.00, 0.12, tau)
        + 0.33 * G.sstep(0.34, 0.48, tau)
        + 0.45 * G.sstep(0.72, 0.88, tau)
    )
    E_stepped = (
        -1760.0
        + 2740.0 * (0.64 * tau_step + 0.36 * tau)
        + 42.0 * _fbm2(px, py, scale=16.0, seed=404)
    )
    E = np.where(in_erim_ramp, E + allow_corr * 0.76 * (E_stepped - E), E)

    dx_mungo = px - 1049.75
    dy_mungo = py - 495.0
    in_mungo_east_slope = (
        (dx_mungo > 0.5) & (dx_mungo < 14.0)
        & (np.abs(dy_mungo) < 14.0)
        & (~whas2)
    )
    w_mungo_slope = (
        G.sstep(0.5, 2.5, dx_mungo)
        * (1.0 - G.sstep(9.0, 14.0, dx_mungo))
        * np.exp(-0.5 * (dy_mungo / 8.0) ** 2)
    )
    z_mungo_ramp = -1800.0 + 185.0 * dx_mungo * (1.0 - 0.025 * dx_mungo)
    E = np.where(
        in_mungo_east_slope,
        E + w_mungo_slope * allow_corr * 0.55 * (z_mungo_ramp - E),
        E,
    )

    lower_erim_bench = (m_erim | m_abyss_all) & (~whas2) & (E >= -1680.0) & (E <= -1020.0) & (px >= 1018.0)
    upper_erim_bench = m_erim & (~whas2) & (E > -1020.0) & (E <= 250.0)

    # =========================================================================
    # STAGE 4: Headward-Recessed Shiveria Cataract Gorges & Alluvial Megafans
    # =========================================================================
    megafan_w = np.zeros((VH, VW), dtype=np.float64)
    canyon_w  = np.zeros((VH, VW), dtype=np.float64)

    # Precompute a tight 1.8-px pin-core lock mask so river thalwegs never alter exact settlement pin coordinates
    pin_core_lock = np.zeros((VH, VW), dtype=bool)
    for _, sx, sy, _, _ in SETTLEMENT_PINS:
        pin_core_lock |= (np.hypot(px - sx, py - sy) <= 1.8)

    # Store per-river relaxed profiles so we can re-assert exact thalweg monotonicity after Stage 5
    relaxed_river_cells = []

    for rv in rivers_list:
        rid = str(rv.get("id", ""))
        if rid not in CATARACT_RIVER_IDS:
            continue
        raw_pts = rv.get("px") if rv.get("px") is not None else rv.get("pts")
        if not raw_pts or len(raw_pts) < 5:
            continue
        pts = np.asarray(raw_pts, dtype=np.float64)  # (N, 2) in full-res map px

        r_hu = np.clip(np.round(pts[:, 0] * su).astype(int), 0, VW - 1)
        r_hv = np.clip(np.round(pts[:, 1] * sv).astype(int), 0, VH - 1)
        r_el = E[r_hv, r_hu]

        # Identify which vertices along `pts` are locked (water cells or settlement pin centers)
        v_locked = np.zeros(len(pts), dtype=bool)
        v_locked[-1] = True
        for vi in range(len(pts)):
            if whas2[r_hv[vi], r_hu[vi]] or pin_core_lock[r_hv[vi], r_hu[vi]]:
                v_locked[vi] = True

        # Compute the relaxed 1D cataract profile along the river vertices (max step drop <= 175 m)
        r_prof = _relax_cataract_profile_1d(r_el, v_locked, max_step_m=175.0, n_iters=220)
        el_diff = np.abs(r_el - r_prof)
        if np.max(el_diff) < 10.0:
            continue

        relaxed_river_cells.append((r_hv, r_hu, r_prof, v_locked))

        # Find active gorge span [k_start .. k_end] where profile was modified
        active_idx = np.nonzero(el_diff > 5.0)[0]
        k_start = max(0, int(active_idx[0]) - 2)
        k_end   = min(len(pts) - 1, int(active_idx[-1]) + 2)

        # Build dense sub-pixel samples (every 0.6 px = 1.2 km) along the active segment
        gorge_pts = pts[k_start:k_end + 1]
        gorge_prof = r_prof[k_start:k_end + 1]
        diffs = np.diff(gorge_pts, axis=0)
        seg_ds = np.hypot(diffs[:, 0], diffs[:, 1])
        cum_s = np.r_[0.0, np.cumsum(seg_ds)]
        tot_s = max(float(cum_s[-1]), 1.0)

        n_dense = max(20, int(math.ceil(tot_s / 0.6)))
        s_grid = np.linspace(0.0, tot_s, n_dense)
        gx_dense = np.interp(s_grid, cum_s, gorge_pts[:, 0])
        gy_dense = np.interp(s_grid, cum_s, gorge_pts[:, 1])
        gz_dense = np.interp(s_grid, cum_s, gorge_prof)

        pad_px = 14.0
        xmin_b = max(0, int((gx_dense.min() - pad_px) * su))
        xmax_b = min(VW, int((gx_dense.max() + pad_px) * su) + 1)
        ymin_b = max(0, int((gy_dense.min() - pad_px) * sv))
        ymax_b = min(VH, int((gy_dense.max() + pad_px) * sv) + 1)

        sub_px = px[ymin_b:ymax_b, xmin_b:xmax_b]
        sub_py = py[ymin_b:ymax_b, xmin_b:xmax_b]
        sub_E  = E[ymin_b:ymax_b, xmin_b:xmax_b]
        sub_wh = whas2[ymin_b:ymax_b, xmin_b:xmax_b]
        sub_pin = pin_core_lock[ymin_b:ymax_b, xmin_b:xmax_b]
        sub_canyon_w = canyon_w[ymin_b:ymax_b, xmin_b:xmax_b]

        d2_min = np.full(sub_px.shape, 1e12, dtype=np.float64)
        z_thalweg = sub_E.copy()
        s_frac_near = np.zeros(sub_px.shape, dtype=np.float64)
        for si in range(n_dense):
            d2 = (sub_px - gx_dense[si]) ** 2 + (sub_py - gy_dense[si]) ** 2
            better = d2 < d2_min
            d2_min = np.where(better, d2, d2_min)
            z_thalweg = np.where(better, gz_dense[si], z_thalweg)
            s_frac_near = np.where(better, s_grid[si] / tot_s, s_frac_near)

        d_gorge_px = np.sqrt(d2_min)
        # Half-width widens from 2.4 px (4.8 km) at upper lip to 5.4 px (10.8 km) at the wine-glass canyon mouth
        hw_px = 2.4 + 3.0 * s_frac_near
        w_slot = 1.0 - G.sstep(0.8, hw_px * 1.85, d_gorge_px)

        # Smooth V-to-box canyon wall blending from `z_thalweg` at `d_gorge_px <= 1.1 px` to `sub_E` at `hw_px * 1.85`
        wall_blend = G.sstep(1.1, hw_px * 1.85, d_gorge_px)
        z_canyon = z_thalweg * (1.0 - wall_blend) + sub_E * wall_blend
        can_edit = (d_gorge_px < hw_px * 1.9) & (~sub_wh) & (~sub_pin)
        sub_E = np.where(can_edit, z_canyon, sub_E)

        # Also explicitly set the exact river vertex cells (outside lakes & pin cores) to `r_prof`
        for vi in range(k_start, k_end + 1):
            vy_i, vx_i = r_hv[vi], r_hu[vi]
            if not whas2[vy_i, vx_i] and not pin_core_lock[vy_i, vx_i]:
                if ymin_b <= vy_i < ymax_b and xmin_b <= vx_i < xmax_b:
                    sub_E[vy_i - ymin_b, vx_i - xmin_b] = r_prof[vi]

        E[ymin_b:ymax_b, xmin_b:xmax_b] = sub_E
        canyon_w[ymin_b:ymax_b, xmin_b:xmax_b] = np.maximum(sub_canyon_w, w_slot * (~sub_wh))

        # 4B. Canyon-Mouth Alluvial Megafan Cone (+40 to +120 m apex cone at the gorge toe)
        drops_orig = r_el[:-1] - r_el[1:]
        k_knick = int(np.argmax(drops_orig))
        k_mouth = min(len(pts) - 1, k_knick + 3)
        mx, my = float(pts[k_mouth, 0]), float(pts[k_mouth, 1])
        k_dir_prev = max(0, k_mouth - 4)
        vx_f = mx - float(pts[k_dir_prev, 0])
        vy_f = my - float(pts[k_dir_prev, 1])
        vn_f = math.hypot(vx_f, vy_f) + 1e-9
        ux_f, uy_f = vx_f / vn_f, vy_f / vn_f

        q_list = rv.get("q_m3s")
        if q_list and len(q_list) > 0:
            q_m3s = max(10.0, float(max(q_list)))
        else:
            q_m3s = max(10.0, float(rv.get("order", 25.0)))

        h_apex = 28.0 + 16.0 * math.log10(q_m3s)
        r_fan_px = 10.0 + 3.2 * math.log10(q_m3s)

        dx_f = px - mx
        dy_f = py - my
        r_f = np.hypot(dx_f, dy_f)
        cos_th = (dx_f * ux_f + dy_f * uy_f) / (r_f + 1e-9)
        th_f = np.arccos(np.clip(cos_th, -1.0, 1.0))

        radial_env = (np.maximum(0.0, 1.0 - r_f / r_fan_px) ** 1.35) * np.exp(-0.5 * (th_f / (math.pi / 3.1)) ** 2)
        lobe_mod = 1.0 - 0.16 * np.cos(7.0 * th_f)
        fan_cone = h_apex * radial_env * lobe_mod

        # Deposit fan cone outside the incised river channel (`canyon_w < 0.25`) so it never blocks the river
        fan_gate = G.sstep(2.5, 5.0, r_f) * (1.0 - np.clip(canyon_w * 2.0, 0.0, 1.0)) * ((E < -850.0) & (~whas2))
        E = np.where(fan_gate > 0.0, E + allow_corr * fan_gate * fan_cone * 0.55, E)
        megafan_w = np.maximum(megafan_w, radial_env * ((~whas2) & (E < -850.0)))

    # =========================================================================
    # STAGE 5: Concentric Messinian Evaporite Bull's-Eye Benches, Asymmetric
    #          Half-Graben Bathymetry & Western Bowl Kalut Yardang Corridors
    # =========================================================================
    wet_corridor = whas2 & (wlev2 < -800.0)
    _, nearest_idx = nd.distance_transform_edt(~wet_corridor, return_indices=True)
    nearest_wlev = wlev2[nearest_idx[0], nearest_idx[1]]
    ref_wlev = nd.gaussian_filter(nearest_wlev, sigma=6.0 / px_per_cell)
    dh_lake = np.maximum(0.0, E - ref_wlev)

    dist_to_lake_px = nd.distance_transform_edt(~whas2) * px_per_cell
    in_abyss_evap = m_abyss_all & (~whas2) & (E < -1420.0) & (dist_to_lake_px < 28.0) & (dh_lake < 145.0)
    h_bench = (
        11.0 * G.sstep(0.0, 16.0, dh_lake)
        + 34.0 * G.sstep(20.0, 52.0, dh_lake)
        + 76.0 * G.sstep(58.0, 135.0, dh_lake)
        + np.maximum(0.0, dh_lake - 135.0)
    )
    E_evap = ref_wlev + h_bench + 1.4 * _fbm2(px, py, scale=6.0, seed=505)
    evap_weight = allow_corr * 0.68 * (1.0 - 0.85 * np.clip(megafan_w + canyon_w, 0.0, 1.0))
    E = np.where(in_abyss_evap, E + evap_weight * (E_evap - E), E)

    # 5B. N25W Kalut Yardang Corridors in the Hyper-Arid Western Floor of The Bowl (px 665..760, py 760..845)
    kalut_mask = (
        m_bowl_all & (~whas2)
        & (px >= 665.0) & (px <= 760.0)
        & (py >= 760.0) & (py <= 845.0)
        & (E < -915.0)
    )
    th_k = math.radians(25.0)
    uk_perp =  (px - 715.0) * math.cos(th_k) + (py - 805.0) * math.sin(th_k)
    uk_para = -(px - 715.0) * math.sin(th_k) + (py - 805.0) * math.cos(th_k)
    kalut_ridge = 36.0 * (np.sin(math.pi * uk_perp / 4.4) ** 4 - 0.35) * (0.7 + 0.3 * np.sin(uk_para / 9.0))
    w_kalut = (
        G.sstep(665.0, 680.0, px)
        * (1.0 - G.sstep(745.0, 760.0, px))
        * G.sstep(760.0, 772.0, py)
        * (1.0 - G.sstep(834.0, 845.0, py))
        * G.sstep(-915.0, -1005.0, E)
        * (1.0 - np.clip(canyon_w, 0.0, 1.0))
    )
    E = np.where(kalut_mask, E + allow_corr * w_kalut * kalut_ridge, E)

    # 5C. Asymmetric Half-Graben Bathymetry inside existing lakes (`whas2 == True`)
    # Preserves shallow 3.0 m reed-island shelves at Reed (1005, 346) and Mungo (1049, 495)
    for _, sx, sy in [("Reed", 1005.0, 346.0), ("Mungo", 1049.0, 495.0)]:
        d_s = np.hypot(px - sx, py - sy)
        shallow_shelf = whas2 & (d_s < 8.0)
        target_bed = wlev2 - (3.0 + 12.0 * G.sstep(2.0, 8.0, d_s))
        E = np.where(shallow_shelf, np.maximum(E, target_bed), E)

    # Safety clamp:
    E = np.where(whas2, np.minimum(E, wlev2 - 1.5), E)
    dry_sub_lake = corridor_mask & (~whas2) & (dist_to_lake_px < 10.0) & (Eo > ref_wlev + 0.5)
    E = np.where(dry_sub_lake, np.maximum(E, ref_wlev + 1.0), E)

    # Re-assert exact relaxed cataract thalweg heights on the river vertex cells (outside lakes & pin cores)
    for r_hv, r_hu, r_prof, v_locked in relaxed_river_cells:
        for vi in range(len(r_prof)):
            if not v_locked[vi]:
                E[r_hv[vi], r_hu[vi]] = r_prof[vi]

    dh_lake = np.maximum(0.0, E - ref_wlev)
    lower_erim_bench = m_erim & (~whas2) & (dh_lake >= 90.0) & (E >= -1580.0) & (E <= -1020.0) & (px >= 1020.0)
    En = E.astype(np.float32)
    changed_mask = np.abs(En - Eo) > 1.0

    meta_dict = {
        "megafan_w": megafan_w.astype(np.float32),
        "canyon_w": canyon_w.astype(np.float32),
        "lower_erim_bench": lower_erim_bench,
        "upper_erim_bench": upper_erim_bench,
        "sill_horst_mask": sill_horst_mask,
        "transfer_relay_mask": transfer_relay_mask,
        "kalut_mask": kalut_mask,
        "dh_lake": dh_lake.astype(np.float32),
        "ref_wlev": ref_wlev.astype(np.float32),
        "corridor_mask": corridor_mask,
        "m_abyss_all": m_abyss_all,
        "m_bowl_all": m_bowl_all,
        "m_erim": m_erim,
        "m_sedes": m_sedes,
        "m_yuni": m_yuni,
    }
    return En, whas2, wlev2.astype(np.float32), changed_mask, meta_dict


def update_east_abyss_climate(En, whas2, wlev2, rain2, cls2, zon2, tmF, idx, regs_list, meta_dict):
    """Organically derive Shiveria / Failed-Rift climate classes (`WX`, `XW`, `XS`, `XA`, `XV`, `BWh`, `BSh`, `Aw`)
    and evaporite zones (`zone 5`, `zone 4`, `zone 0`) across the remodeled East Abyss & Bowl corridor while
    preserving the immediate canonical environs of Mungo, Verge, Locus, Reed, Furrow, and Mantis.
    """
    rain_out = rain2.copy().astype(np.float64)
    cls_out  = cls2.copy()
    zon_out  = zon2.copy()

    OH, OW = En.shape
    hv, hu = np.indices((OH, OW))
    su, sv = (1.0, 1.0) if (OH == 1393 and OW == 1549) else (OW / REF_W, OH / REF_H)
    px = hu / su
    py = hv / sv

    def _to_full(arr, is_bool=False):
        if arr.shape == (OH, OW):
            return arr.astype(bool) if is_bool else arr
        zoom = (OH / arr.shape[0], OW / arr.shape[1])
        if is_bool:
            return nd.zoom(arr.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)
        return nd.zoom(arr, zoom, order=1)[:OH, :OW]

    megafan_w           = _to_full(meta_dict["megafan_w"], is_bool=False)
    canyon_w            = _to_full(meta_dict["canyon_w"], is_bool=False)
    lower_erim_bench    = _to_full(meta_dict["lower_erim_bench"], is_bool=True)
    upper_erim_bench    = _to_full(meta_dict["upper_erim_bench"], is_bool=True)
    sill_horst_mask     = _to_full(meta_dict["sill_horst_mask"], is_bool=True)
    transfer_relay_mask = _to_full(meta_dict["transfer_relay_mask"], is_bool=True)
    kalut_mask          = _to_full(meta_dict["kalut_mask"], is_bool=True)
    dh_lake             = _to_full(meta_dict["dh_lake"], is_bool=False)
    m_abyss_all         = _to_full(meta_dict["m_abyss_all"], is_bool=True)
    m_bowl_all          = _to_full(meta_dict["m_bowl_all"], is_bool=True)
    m_erim              = _to_full(meta_dict["m_erim"], is_bool=True)
    m_sedes             = _to_full(meta_dict["m_sedes"], is_bool=True)

    wet_abyss = whas2 & (wlev2 < -800.0)
    dist_lake_px = nd.distance_transform_edt(~wet_abyss)
    lake_steam = np.exp(-dist_lake_px / 5.5)

    # -------------------------------------------------------------------------
    # 1. Canonical Settlement Environs Masks (Mungo, Verge, Locus, Reed, Mantis)
    # -------------------------------------------------------------------------
    d_locus = np.hypot(px - 995.0, py - 713.0)
    locus_environs_xa = (~whas2) & (d_locus <= 14.0) & (En < -1150.0)

    d_verge_pool = np.hypot(px - 996.0, py - 616.0)
    verge_lower_xa = (~whas2) & (d_verge_pool <= 11.0) & (En < -1250.0)

    d_mungo = np.hypot(px - 1049.0, py - 495.0)
    mungo_marsh_xa = (~whas2) & (d_mungo <= 10.0) & (En < -1520.0)
    mungo_bench_xv = (~whas2) & (d_mungo > 4.0) & (d_mungo <= 18.0) & (px >= 1048.0) & (En >= -1680.0) & (En < -950.0)

    d_reed = np.hypot(px - 1002.0, py - 347.0)
    reed_plume_xa = (~whas2) & (d_reed <= 13.0) & (En < -1500.0)

    d_mantis = np.hypot(px - 841.0, py - 834.0)
    mantis_oasis_aw = (~whas2) & (d_mantis <= 11.5) & (En < -750.0)

    orig_xa = (cls2 == idx["XA"]) & (~whas2) & (En < -1050.0)
    orig_xv = (cls2 == idx["XV"]) & (~whas2) & (En < -900.0)

    # -------------------------------------------------------------------------
    # 2. Shiveria Bull's-Eye Evaporite Zonation in the East Abyss (`e abysss`)
    # -------------------------------------------------------------------------
    abyss_dry = (m_abyss_all | (m_erim & (En < -1050.0))) & (~whas2)

    is_megafan_xa = (
        abyss_dry
        & (En < -1200.0)
        & ((megafan_w >= 0.42) | ((canyon_w >= 0.55) & (En < -1350.0)) | ((megafan_w >= 0.25) & (lake_steam >= 0.55)))
    )
    target_xa = orig_xa | is_megafan_xa | locus_environs_xa | verge_lower_xa | mungo_marsh_xa | reed_plume_xa

    is_bench_xv = (
        (~whas2)
        & (~target_xa)
        & (En < -950.0)
        & (
            lower_erim_bench
            | mungo_bench_xv
            | (sill_horst_mask & (dh_lake >= 65.0))
            | (transfer_relay_mask & (En < -1050.0))
            | (abyss_dry & (megafan_w >= 0.22) & (megafan_w < 0.42) & (dh_lake >= 55.0))
        )
    )
    target_xv = (orig_xv | is_bench_xv) & (~target_xa)

    target_xw_abyss = (
        abyss_dry
        & (~target_xa)
        & (~target_xv)
        & (En < -1500.0)
        & ((dh_lake <= 58.0) | (cls2 == idx["XW"]))
    )

    target_xs_abyss = (
        abyss_dry
        & (~target_xa)
        & (~target_xv)
        & (~target_xw_abyss)
        & (En < -1280.0)
        & ((dh_lake <= 165.0) | (cls2 == idx["XS"]) | (zon2 == 5))
    )

    cls_out[target_xw_abyss] = idx["XW"]
    zon_out[target_xw_abyss] = 5
    rain_out[target_xw_abyss] = np.minimum(rain_out[target_xw_abyss], 185.0)

    cls_out[target_xs_abyss] = idx["XS"]
    zon_out[target_xs_abyss] = 5
    rain_out[target_xs_abyss] = np.clip(rain_out[target_xs_abyss], 190.0, 380.0)

    cls_out[target_xv] = idx["XV"]
    zon_out[target_xv & (En < -1250.0)] = 5
    rain_out[target_xv] = np.clip(np.maximum(rain_out[target_xv], 580.0 + 240.0 * megafan_w[target_xv]), 520.0, 1050.0)

    cls_out[target_xa] = idx["XA"]
    zon_out[target_xa & (En < -1300.0)] = np.where(zon2[target_xa & (En < -1300.0)] == 5, 5, zon_out[target_xa & (En < -1300.0)])
    rain_out[target_xa] = np.maximum(rain_out[target_xa], 1380.0 + 380.0 * np.clip(megafan_w[target_xa] + lake_steam[target_xa], 0.0, 1.2))

    # -------------------------------------------------------------------------
    # 3. Upper East Rim Caprock Bench (`rmuvkd2jtd3zm`) & Bowl-Locus Relay
    # -------------------------------------------------------------------------
    erim_upper_dry = upper_erim_bench & (~whas2) & (~target_xa) & (~target_xv)
    erim_aw = erim_upper_dry & (En < -380.0) & (rain_out >= 520.0)
    erim_bsh = erim_upper_dry & (~erim_aw) & (En < 150.0)
    cls_out[erim_aw] = idx["Aw"]
    cls_out[erim_bsh] = idx["BSh"]

    # -------------------------------------------------------------------------
    # 4. The Bowl Half-Graben (`rmvka5413efyi` / `rmuc6vtafysgi`)
    # -------------------------------------------------------------------------
    bowl_dry = m_bowl_all & (~whas2) & (~mantis_oasis_aw)
    bowl_inner_xw = bowl_dry & (En < -955.0) & ((dh_lake <= 22.0) | kalut_mask) & (rain_out < 210.0)
    bowl_strand_xs = bowl_dry & (~bowl_inner_xw) & (En < -910.0) & (dh_lake <= 55.0) & (rain_out < 260.0)

    cls_out[bowl_inner_xw] = idx["XW"]
    zon_out[bowl_inner_xw] = 5
    rain_out[bowl_inner_xw] = np.minimum(rain_out[bowl_inner_xw], 145.0)

    cls_out[bowl_strand_xs] = idx["XS"]
    zon_out[bowl_strand_xs] = 5
    rain_out[bowl_strand_xs] = np.clip(rain_out[bowl_strand_xs], 150.0, 250.0)

    cls_out[mantis_oasis_aw] = idx["Aw"]
    rain_out[mantis_oasis_aw] = np.maximum(rain_out[mantis_oasis_aw], 1180.0)

    # -------------------------------------------------------------------------
    # 5. Terminal Hypersaline Brine Lakes (`WX` & `zone 4`)
    # -------------------------------------------------------------------------
    corridor_brine_lakes = (m_abyss_all | m_bowl_all | m_erim | m_sedes) & whas2 & (wlev2 < -900.0)
    cls_out[corridor_brine_lakes] = idx["WX"]
    zon_out[corridor_brine_lakes] = np.where(zon2[corridor_brine_lakes] == 5, 5, 4)

    for _, sx, sy, r_in, _ in SETTLEMENT_PINS:
        d_pin = np.hypot(px - sx, py - sy)
        pin_core = d_pin <= min(r_in, 5.0)
        cls_out[pin_core] = cls2[pin_core]
        zon_out[pin_core] = zon2[pin_core]

    return rain_out, cls_out, zon_out
