"""Tranche-2 Biome Geomorphological Landform Upgrades on the unified 2 km/cell (`1393 x 1549`) height grid:
  1. `Tiers` (`rmvp5il0uz1yf` / `rmucfm4y5yd6y`), `N Outlands` (`rmvp5489oiy6z`), `S Outlands` (`rmvp52gbbc8pf`),
     & `stalker range` (`rmvkknh1am4fw`):
     - 6 grand structural staircase benches descending NE-to-SW across `Tiers` (+5,200 m, +4,000 m, +2,900 m,
       +1,900 m, +900 m, and 0 m treads with steep basalt/sandstone risers)
     - 3 branched, flat-floored intermontane graben valleys in `N Outlands` and `S Outlands` stepped with
       basalt-capped mesas, inselberg tors on the N plains, copper-stained mesas/fins in the S4 gem hills,
       and the half-cave shelf at Trickster's House (1240, 330)
     - Ridged-multifractal alpine horn/arête sharpener (>7,500 m) and radial glacial troughs in `stalker range`.
  2. `floodzone` (`rmvflvh2enyr6`), `n semiarid` (`rmuqm5qn5ek5g`), `dam` (`rmuwd1zs29sya`), `dam 2` (`rmuwd2cwvipmq`),
     `NW lowlands` (`rmuqlni4tiwqm`), `SW lowlands` (`rmuqlp4ejzqp4`), `ancient's valley` (`rmvowuvfa6urs`),
     `NW outer wall` (`rmuqm8dxeuvhi`), & `Farside` (`rmuqm7asgyd3l`):
     - East & West Breach Channeled Scabland basalt coulees (140-260 m deep box canyons along `floods`),
       90-110 m horseshoe dry falls cataracts, and +80 m streamlined teardrop *Steamboat Rock* loess islands
     - Palaeolake wave-cut shoreline benches at +900 m (West Dam), +1,050 m (East Dam 2), and +834 m
       (Lake Lewis slackwater rhythmite bench in `NW lowlands`), plus the Pantanal wetland plain (+435..+465 m)
     - Coastal bayou shelf (+18..+32 m) & oxbow sloughs in `SW lowlands`, plus 7 shallow circular Cataclysm
       weapon-blast basins and rectilinear Ancient causeway embankments in `ancient's valley`
     - Two-step permafrost bench (+4,200 m forest-steppe bench vs. +5,100 m taiga bench with 18 circular
       thermokarst *alas* depressions) in `NW outer wall`, and stepped marine/fluvial benches in `Farside`.
  3. `sedesert` (`rmuqlrsc52nhl`), `e badlands` (`rmuqm20f95x4v`), `Yuni Valley` (`rmuvlpgkd7v7w`), &
     `painted highlands` (`rmvkam8s13kwu`):
     - 42 flat-topped Monument-Valley sandstone mesas/buttes (+120..+260 m), east-flowing wadi box canyons,
       and sharpened East Abyss cataract rim scarp in `sedesert`
     - 5 Grand-Staircase formation steps (+900..+4,000 m) and dendritic badland gully dissection in `e badlands`,
       plus graded alluvial floor and +40 m agricultural terraces in `Yuni Valley`
     - Folded NNW-SSE Danxia cuesta hogbacks, 4 flat superbloom playas, and the 600 m-deep Painted Canyon in
       `painted highlands`.
"""
import math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from . import geom as G
from .tier1_biomes import _norm_gauss, _settlement_guard, _polyline_dist_px


SEED_TRANCHE2 = 20261102


# ==============================================================================
# 1. The Tiers (`Tiers`), `N Outlands`, `S Outlands`, & `stalker range`
# ==============================================================================
def _sculpt_outlands_and_tiers(Eo, whas, wlev, regs_list, px, py, rivers_list, sett_guard, rs):
    """Sculpt `Tiers`, `N Outlands`, `S Outlands`, and `stalker range`."""
    VH, VW = Eo.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0

    mask_tiers = (
        G.region_mask(regs_list, 'Tiers', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'The Tiers', su, sv, (VH, VW))
    )
    mask_nout = G.region_mask(regs_list, 'N Outlands', su, sv, (VH, VW))
    mask_sout = G.region_mask(regs_list, 'S Outlands', su, sv, (VH, VW))
    mask_stalker = G.region_mask(regs_list, 'stalker range', su, sv, (VH, VW))

    En = Eo.copy()

    # --- 1A. The Tiers: 6 Grand Structural Staircase Benches (+5200, +4000, +2900, +1900, +900, 0 m) ---
    if mask_tiers.any():
        d_in_tiers = nd.distance_transform_edt(mask_tiers)
        d_water_t = nd.distance_transform_edt(~(whas & mask_tiers))
        w_tiers = G.sstep(0.0, 5.5, d_in_tiers) * G.sstep(1.2, 3.5, d_water_t) * (~whas) * sett_guard

        # Protect The Gate (1136, 84) and Hub 02 / Coyote towns
        w_gate_keep = G.sstep(2.5, 6.5, np.hypot(px - 1136.0, py - 84.0))
        w_tiers = w_tiers * w_gate_keep

        # Quantize regional elevation into 6 structural bench treads separated by steep basalt/sandstone risers
        Eo_base = nd.gaussian_filter(Eo, sigma=5.0) + 75.0 * _norm_gauss(rs, (VH, VW), 2.5)
        treads = [0.0, 900.0, 1900.0, 2900.0, 4000.0, 5200.0]
        h_stair = Eo.copy()
        for t_elev in treads:
            # Pull elevations within +/- 460 m of `t_elev` toward a gently tilted structural bench tread
            dist_e = Eo_base - t_elev
            w_tread = np.exp(-((dist_e / 370.0) ** 2))
            tread_target = t_elev + 0.22 * dist_e + 32.0 * _norm_gauss(rs, (VH, VW), 1.6)
            h_stair = h_stair * (1.0 - 0.68 * w_tread) + tread_target * (0.68 * w_tread)

        # Incise NE-SW canyon notches along Tiers rivers/wadis so streams drop over risers as waterfalls
        tiers_rivs = [
            rv['px'] for rv in (rivers_list or ())
            if any(865 <= p[0] <= 1130 and 45 <= p[1] <= 295 for p in rv.get('px', []))
        ]
        d_triv = _polyline_dist_px(px, py, tiers_rivs, bbox_pad=14.0)
        w_tgorge = 1.0 - G.sstep(1.0, 3.4, d_triv)
        h_stair = h_stair - w_tgorge * 165.0

        En = En + w_tiers * (h_stair - Eo)

    # --- 1B. N Outlands & S Outlands: Branched Intermontane Graben Valleys, Gem Mesas & Inselberg Tors ---
    mask_out = mask_nout | mask_sout
    if mask_out.any():
        d_in_out = nd.distance_transform_edt(mask_out)
        d_water_out = nd.distance_transform_edt(~(whas & mask_out))
        w_out = G.sstep(0.0, 6.0, d_in_out) * G.sstep(1.5, 4.5, d_water_out) * (~whas) * sett_guard

        # Protect Trickster's House (1240, 330) quay while steepening its west-wall half-cave cliff
        d_trick = np.hypot(px - 1240.0, py - 330.0)
        w_out = w_out * G.sstep(2.0, 5.0, d_trick)

        # Define 3 branched intermontane graben axes in N Outlands and S Outlands
        graben_axes = [
            # N Outlands main graben & NE branch (feeding the 2,241 m salt lake at 1314, 320 and 2,345 m lake at 1316, 186)
            [(1175.0, 205.0), (1235.0, 225.0), (1295.0, 250.0), (1314.0, 305.0)],
            [(1245.0, 145.0), (1285.0, 172.0), (1316.0, 195.0), (1355.0, 225.0)],
            # S Outlands perennial river graben & gem-hills branch (feeding the 705 m lake at 1382, 371)
            [(1265.0, 465.0), (1315.0, 435.0), (1358.0, 402.0), (1382.0, 375.0)],
            [(1435.0, 485.0), (1395.0, 445.0), (1368.0, 405.0)],
        ]
        d_grab_px = _polyline_dist_px(px, py, graben_axes, bbox_pad=24.0)
        # Flat-floored graben profile (half-width ~5.5 px = 11 km) with stepped basalt-capped mesa walls (6..11 px)
        w_gfloor = 1.0 - G.sstep(3.2, 7.5, d_grab_px)
        w_gwall = G.sstep(5.5, 8.0, d_grab_px) * (1.0 - G.sstep(11.0, 15.0, d_grab_px))

        Eo_smooth_out = nd.gaussian_filter(Eo, sigma=7.0)
        # Graben floor sits 320..520 m below the regional smoothed height, clamped above local lakes (+720 m in S, +2,260 m in N)
        min_floor = np.where(py > 345.0, 740.0, 2265.0)
        h_gfloor = np.maximum(Eo_smooth_out - 410.0 + 25.0 * _norm_gauss(rs, (VH, VW), 1.8), min_floor)

        # Basalt-capped mesa steps along graben shoulders (+165 m flat-topped caprock ledges)
        mesa_pat = 0.65 * _norm_gauss(rs, (VH, VW), 5.0) + 0.35 * _norm_gauss(rs, (VH, VW), 2.5)
        dh_gwall = w_gwall * (150.0 * G.sstep(0.10, 0.55, mesa_pat))

        # Inselberg granite domes & tors on the N Outlands steppe plains (`px 1250..1390, py 120..260`)
        w_nplains = mask_nout & (Eo > 2400.0) & (Eo < 4300.0)
        tor_field = np.clip(_norm_gauss(rs, (VH, VW), 2.8) - 1.15, 0.0, 2.0)
        dh_tors = np.where(w_nplains, 125.0 * (tor_field ** 1.25), 0.0)

        # Gem Hills (`S4`, around `px 1352, py 391`): copper-stained mesas, fins, and stepped open-cast benches
        r_gem_km = np.hypot((px - 1352.0) * 2.0, (py - 391.0) * 2.0)
        w_gem = (1.0 - G.sstep(16.0, 32.0, r_gem_km)) * mask_sout
        fin_wave = 1.0 - np.abs(_norm_gauss(rs, (VH, VW), 2.6))
        dh_gem = w_gem * (155.0 * G.sstep(0.48, 0.78, fin_wave) - 55.0 * (1.0 - G.sstep(0.22, 0.48, fin_wave)))

        # Wadis across Outlands: incise shallow braided channels (-55 m) along dry valleys
        out_wadis = [
            rv['px'] for rv in (rivers_list or ())
            if any(1120 <= p[0] <= 1480 and 100 <= p[1] <= 550 for p in rv.get('px', []))
        ]
        d_owadi = _polyline_dist_px(px, py, out_wadis, bbox_pad=12.0)
        dh_owadi = -65.0 * (1.0 - G.sstep(0.8, 2.6, d_owadi))

        dh_out = w_gfloor * (h_gfloor - Eo) + dh_gwall + dh_tors + dh_gem + dh_owadi
        En = En + w_out * dh_out

    # --- 1C. Stalker Range: Alpine Horn/Arête Sharpener (>7,500 m) & Radial Glacial Troughs ---
    if mask_stalker.any():
        d_in_st = nd.distance_transform_edt(mask_stalker)
        w_stalk = G.sstep(0.0, 5.0, d_in_st) * (~whas) * sett_guard

        # High alpine zone above 7,200 m: ridged multifractal arête crests
        w_alpine = G.sstep(6800.0, 7800.0, Eo)
        ridge1 = np.clip(1.0 - np.abs(_norm_gauss(rs, (VH, VW), 2.2)), 0.0, 1.0)
        ridge2 = np.clip(1.0 - np.abs(_norm_gauss(rs, (VH, VW), 1.2)), 0.0, 1.0)
        arete = np.maximum(0.0, 0.62 * ridge1 + 0.38 * ridge2) ** 1.5
        dh_arete = w_alpine * (460.0 * (arete - 0.38))

        # Scooped glacial cirques and radial U-troughs between 4,500 m and 7,800 m
        w_cirque_belt = G.sstep(4200.0, 5200.0, Eo) * (1.0 - G.sstep(7600.0, 8600.0, Eo))
        st_rivs = [
            rv['px'] for rv in (rivers_list or ())
            if any(980 <= p[0] <= 1360 and 820 <= p[1] <= 1180 for p in rv.get('px', []))
        ]
        d_sriv = _polyline_dist_px(px, py, st_rivs, bbox_pad=14.0)
        w_utrough = 1.0 - G.sstep(1.4, 4.5, d_sriv)
        dh_utrough = -240.0 * w_utrough * w_cirque_belt

        En = En + w_stalk * (dh_arete + dh_utrough)

    return En


# ==============================================================================
# 2. Scablands (`floodzone`), Dam Basins (`dam`, `dam 2`), Lowlands, Farside & NW Outer Wall
# ==============================================================================
def _sculpt_nw_sw_basins_and_walls(Eo, whas, wlev, regs_list, px, py, rivers_list, floods_list, sett_guard, rs):
    """Sculpt `floodzone` / `n semiarid` coulees, `dam` & `dam 2` wave-cut benches, `NW lowlands` Pantanal &
    Lake Lewis bench, `SW lowlands` & `ancient's valley` craters/causeways, `NW outer wall` *alas* bench, and `Farside`."""
    VH, VW = Eo.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    En = Eo.copy()

    mask_flood = G.region_mask(regs_list, 'floodzone', su, sv, (VH, VW))
    mask_nsemi = G.region_mask(regs_list, 'n semiarid', su, sv, (VH, VW))
    mask_dam1 = G.region_mask(regs_list, 'dam', su, sv, (VH, VW))
    mask_dam2 = G.region_mask(regs_list, 'dam 2', su, sv, (VH, VW))
    mask_nwlow = G.region_mask(regs_list, 'NW lowlands', su, sv, (VH, VW))
    mask_swlow = G.region_mask(regs_list, 'SW lowlands', su, sv, (VH, VW))
    mask_anc = (
        G.region_mask(regs_list, "ancient's valley", su, sv, (VH, VW))
        | G.region_mask(regs_list, "Ancient's Valley", su, sv, (VH, VW))
    )
    mask_nwow = (
        G.region_mask(regs_list, 'NW outer wall', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'Yeti Kingdom', su, sv, (VH, VW))
    )
    mask_far = G.region_mask(regs_list, 'Farside', su, sv, (VH, VW))

    # --- 2A. Channeled Scablands (`floodzone` & `n semiarid`): Coulees, Dry Falls Cataracts, & Loess Islands ---
    mask_scab = mask_flood | mask_nsemi
    if mask_scab.any():
        d_water_s = nd.distance_transform_edt(~(whas & mask_scab))
        w_scab = G.sstep(1.2, 3.8, d_water_s) * (~whas) * sett_guard * mask_scab

        # Extract flood paths from `floods_list` (East Breach & West Breach + anastomosing coulee branches)
        flood_paths = []
        for fl in (floods_list or ()):
            if isinstance(fl, dict) and 'px' in fl:
                flood_paths.append(fl['px'])
            elif isinstance(fl, list) and len(fl) >= 2:
                flood_paths.append(fl)
        # Ensure canonical East Breach `(497,74)->(382,232)` and West Breach `(295,198)->(205,312)` + anastomosing arms
        flood_paths.extend([
            [(497.0, 74.0), (472.0, 112.0), (445.0, 152.0), (415.0, 192.0), (382.0, 232.0)],
            [(482.0, 92.0), (462.0, 134.0), (432.0, 176.0), (398.0, 214.0)],
            [(295.0, 198.0), (268.0, 235.0), (238.0, 274.0), (205.0, 312.0)],
            [(282.0, 212.0), (252.0, 255.0), (222.0, 292.0)],
        ])
        d_coulee = _polyline_dist_px(px, py, flood_paths, bbox_pad=18.0)

        # Flat-bottomed box-canyon coulees (width 4-10 km = 2-5 px, depth 160-230 m) with steep columnar-basalt walls
        w_coulee_box = 1.0 - G.sstep(1.6, 3.4, d_coulee)
        Eo_scab_smooth = nd.gaussian_filter(Eo, sigma=4.0)
        coulee_depth = 185.0 + 45.0 * G.sstep(500.0, 950.0, Eo)

        # Horseshoe Dry Falls cataract steps along East Breach (near (468, 118) & (454, 138)) and West Breach ((245, 265))
        d_cat1 = np.hypot(px - 468.0, py - 118.0)
        d_cat2 = np.hypot(px - 454.0, py - 138.0)
        d_cat3 = np.hypot(px - 245.0, py - 265.0)
        cat_plunge = (
            95.0 * (1.0 - G.sstep(2.0, 5.5, d_cat1))
            + 105.0 * (1.0 - G.sstep(2.0, 5.5, d_cat2))
            + 95.0 * (1.0 - G.sstep(2.0, 5.5, d_cat3))
        )

        # Streamlined teardrop Palouse loess islands (*Steamboat Rock* mesas, +75 m) on interfluves (`d_coulee` 3.8..7.5 px)
        w_interfluve = G.sstep(3.5, 4.8, d_coulee) * (1.0 - G.sstep(7.2, 9.8, d_coulee))
        loess_isl = np.clip(0.5 + 0.42 * _norm_gauss(rs, (VH, VW), 4.5), 0.0, 1.0)
        dh_loess = w_interfluve * (72.0 * (loess_isl ** 0.85))

        dh_scab = -w_coulee_box * (coulee_depth + cat_plunge) + dh_loess
        En = En + w_scab * dh_scab
        # Keep coulee floors above local downstream lake/river levels (+440 m)
        En = np.where((w_scab > 0.01) & (Eo > 445.0), np.maximum(En, 442.0), En)

    # --- 2B. Dam Basins (`dam` & `dam 2`): +900 m & +1,050 m Wave-Cut Shoreline Benches & Playas ---
    mask_dams = mask_dam1 | mask_dam2
    if mask_dams.any():
        d_water_d = nd.distance_transform_edt(~(whas & mask_dams))
        w_dams = G.sstep(1.5, 4.0, d_water_d) * (~whas) * sett_guard * mask_dams
        # Protect Boatmurder at (494, 74)
        w_dams = w_dams * G.sstep(2.0, 5.0, np.hypot(px - 494.0, py - 74.0))

        # West Dam (`dam`): full-pool wave-cut strandline bench at +900 m and recessed +780 m terrace
        # East Dam (`dam 2`): full-pool wave-cut strandline bench at +1,050 m and recessed +920 m terrace
        for m_d, benches in ((mask_dam1, (900.0, 780.0)), (mask_dam2, (1050.0, 920.0))):
            for b_elev in benches:
                de = En - b_elev
                w_bench = np.exp(-((de / 38.0) ** 2)) * m_d * w_dams
                # Flatten slope by 65% across the wave-cut terrace
                En = En - w_bench * (0.65 * de)

        # Wind-scoured yardang & ship-graveyard silt flats on the lower drained floors (< 760 m in dam1, < 890 m in dam2)
        Eo_dam_s = nd.gaussian_filter(En, sigma=4.5)
        w_floor_d = (
            (mask_dam1 & (En > 585.0) & (En < 755.0))
            | (mask_dam2 & (En > 765.0) & (En < 890.0))
        ) * w_dams
        yardang_r = 10.0 * _norm_gauss(rs, (VH, VW), 3.5)
        En = np.where(w_floor_d > 0.01, En * (1.0 - 0.65 * w_floor_d) + (Eo_dam_s + yardang_r) * (0.65 * w_floor_d), En)

    # --- 2C. NW Lowlands (`NW lowlands`): +834 m Lake Lewis Rhythmite Bench & +435..+465 m Pantanal Plain ---
    if mask_nwlow.any():
        d_in_nw = nd.distance_transform_edt(mask_nwlow)
        d_water_nw = nd.distance_transform_edt(~(whas & mask_nwlow))
        w_nw = G.sstep(0.0, 5.5, d_in_nw) * G.sstep(1.5, 4.2, d_water_nw) * (~whas) * sett_guard

        # +834 m Lake Lewis slackwater rhythmite terrace bench (Touchet Beds analogue)
        de_834 = En - 834.0
        w_834 = np.exp(-((de_834 / 42.0) ** 2)) * w_nw
        En = En - w_834 * (0.65 * de_834)

        # Pantanal seasonal wetland plain (+435..+465 m around Lake Jimjam +433 m) with +8 m *cordilheira* sand strings
        w_pantanal = G.sstep(434.0, 440.0, En) * (1.0 - G.sstep(475.0, 520.0, En)) * w_nw
        Eo_pan_s = np.clip(nd.gaussian_filter(En, sigma=5.0), 436.0, 468.0)
        cordilheira = 6.5 * np.clip(_norm_gauss(rs, (VH, VW), 4.2), -0.4, 1.0)
        En = En * (1.0 - 0.72 * w_pantanal) + (Eo_pan_s + cordilheira) * (0.72 * w_pantanal)

    # --- 2D. SW Lowlands & Ancient's Valley: Bayou Shelf, 7 Cataclysm Blast Craters, & Causeway Earthworks ---
    mask_sw_all = mask_swlow | mask_anc
    if mask_sw_all.any():
        d_in_sw = nd.distance_transform_edt(mask_sw_all)
        d_water_sw = nd.distance_transform_edt(~(whas & mask_sw_all))
        w_sw = G.sstep(0.0, 5.0, d_in_sw) * G.sstep(1.5, 4.0, d_water_sw) * (~whas) * sett_guard

        # Bayou coastal shelf within +18..+65 m of the +17 m western lake in `SW lowlands`
        w_bayou = mask_swlow * G.sstep(18.0, 24.0, En) * (1.0 - G.sstep(55.0, 95.0, En)) * w_sw
        oxbow_tex = 3.5 * _norm_gauss(rs, (VH, VW), 3.8)
        bayou_target = 24.0 + 0.25 * (En - 24.0) + oxbow_tex
        En = En * (1.0 - 0.70 * w_bayou) + np.maximum(bayou_target, 19.5) * (0.70 * w_bayou)

        # 7 shallow circular Cataclysm weapon-blast basins (`D = 8..16 km`, depth `-45..-85 m`, `+25 m` vitrified rim)
        # in `ancient's valley` (`px 110..215, py 560..670`), avoiding Nazar (174, 597), Carcosa (123, 482), Henge (185, 405)
        blast_craters = [
            (134.0, 578.0, 6.5, 68.0),
            (156.0, 618.0, 7.5, 78.0),
            (126.0, 636.0, 5.5, 58.0),
            (188.0, 632.0, 7.0, 72.0),
            (204.0, 585.0, 6.0, 62.0),
            (148.0, 654.0, 6.5, 65.0),
            (178.0, 566.0, 5.0, 52.0),
        ]
        dh_craters = np.zeros((VH, VW), dtype=float)
        for cx, cy, rad_km, depth_m in blast_craters:
            r_km = np.hypot((px - cx) * 2.0, (py - cy) * 2.0)
            u_r = r_km / rad_km
            bowl = np.where(u_r < 1.0, -depth_m * (np.maximum(0.0, 1.0 - (u_r ** 2)) ** 0.75), 0.0)
            rim = 26.0 * np.exp(-(((u_r - 1.08) / 0.22) ** 2))
            dh_craters += bowl + rim

        # Rectilinear Ancient causeway embankments (+16 m geometric raised corridors radiating from Nazar `174, 597`)
        causeways = [
            [(123.0, 482.0), (154.0, 545.0), (174.0, 597.0), (192.0, 655.0)],
            [(115.0, 608.0), (174.0, 597.0), (225.0, 588.0)],
        ]
        d_cway = _polyline_dist_px(px, py, causeways, bbox_pad=10.0)
        dh_cway = 18.0 * (1.0 - G.sstep(0.6, 1.8, d_cway)) * mask_anc

        En = En + w_sw * (dh_craters * mask_anc + dh_cway)
        En = np.where((w_sw > 0.01) & (Eo > 18.0), np.maximum(En, 19.0), En)

    # --- 2E. NW Outer Wall (`NW outer wall` / `Yeti Kingdom`) & `Farside` ---
    if mask_nwow.any():
        d_in_yw = nd.distance_transform_edt(mask_nwow)
        d_water_yw = nd.distance_transform_edt(~(whas & mask_nwow))
        w_yw = G.sstep(0.0, 5.0, d_in_yw) * G.sstep(1.5, 4.0, d_water_yw) * (~whas) * sett_guard
        # Protect Leng (218, 224) and Yeti capital Qoold Lheek
        w_yw = w_yw * G.sstep(2.0, 5.0, np.hypot(px - 218.0, py - 224.0))

        # Concentric megacrater listric slump steps & permafrost benches:
        # Step 0: +3,350 m lower listric fault-scarp bench above NW Lowlands
        # Step 1: +4,200 m back-tilted forest-steppe rotational slump bench around Leng
        # Step 2: +5,100 m alas taiga rotational slump bench (`px 185..340, py 140..215`) separated by a 400 m pseudotachylite fault scarp
        # Step 3: +6,050 m upper impact-megabreccia headwall terrace
        for b_elev, b_width in ((3350.0, 320.0), (4200.0, 420.0), (5100.0, 460.0), (6050.0, 380.0)):
            de = En - b_elev
            w_b = np.exp(-((de / b_width) ** 2)) * w_yw
            En = En - w_b * (0.56 * de)

        # Antislope sackung trenches (-32 m) along the back-tilted listric slump hinges (+3,800 m & +4,750 m)
        for s_elev in (3800.0, 4750.0):
            w_sack = np.exp(-(((En - s_elev) / 95.0) ** 2)) * w_yw
            En = En - 32.0 * w_sack

        # Shallow thermokarst *alas* depressions (`-35..-55 m`) on the +4,600..+5,500 m bench
        w_alas_belt = G.sstep(4450.0, 4750.0, En) * (1.0 - G.sstep(5450.0, 5800.0, En)) * w_yw
        alas_field = 0.65 * _norm_gauss(rs, (VH, VW), 4.5) + 0.35 * _norm_gauss(rs, (VH, VW), 2.4)
        alas_pits = -48.0 * (np.clip(alas_field - 0.65, 0.0, 1.0) ** 1.35)
        En = En + w_alas_belt * alas_pits

    if mask_far.any():
        d_in_far = nd.distance_transform_edt(mask_far)
        d_water_far = nd.distance_transform_edt(~(whas & mask_far))
        w_far = G.sstep(0.0, 4.5, d_in_far) * G.sstep(1.5, 4.0, d_water_far) * (~whas) * sett_guard
        # Protect Farport (27, 260) and smooth the N/W expansion seam (`px < 40` or `py < 40`)
        w_far = w_far * G.sstep(2.5, 6.0, np.hypot(px - 27.0, py - 260.0)) * G.sstep(15.0, 45.0, px) * G.sstep(15.0, 45.0, py)

        # Stepped spray-coral & land-kelp marine terraces at +160 m, +280 m, and +400 m
        for t_elev in (160.0, 280.0, 400.0):
            de = En - t_elev
            w_t = np.exp(-((de / 48.0) ** 2)) * w_far
            En = En - w_t * (0.58 * de)

    return En


# ==============================================================================
# 3. SE Desert (`sedesert`), E Badlands (`e badlands`), Yuni Valley & Painted Highlands
# ==============================================================================
def _sculpt_eastern_deserts_and_painted(Eo, whas, wlev, regs_list, px, py, rivers_list, sett_guard, rs):
    """Sculpt `sedesert` Monument-Valley mesas & wadi box canyons, `e badlands` & `Yuni Valley` Grand-Staircase
    formation benches & badland gullies, and `painted highlands` Danxia cuesta hogbacks, superbloom playas, and
    the 600 m-deep Painted Canyon."""
    VH, VW = Eo.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    En = Eo.copy()

    mask_sedes = G.region_mask(regs_list, 'sedesert', su, sv, (VH, VW))
    mask_ebad = G.region_mask(regs_list, 'e badlands', su, sv, (VH, VW))
    mask_yuni = G.region_mask(regs_list, 'Yuni Valley', su, sv, (VH, VW))
    mask_paint = G.region_mask(regs_list, 'painted highlands', su, sv, (VH, VW))

    # --- 3A. SE Desert (`sedesert`): Monument-Valley Mesas/Buttes, Wadi Box Canyons, & Cataract Rim Scarp ---
    if mask_sedes.any():
        d_in_se = nd.distance_transform_edt(mask_sedes)
        d_water_se = nd.distance_transform_edt(~(whas & mask_sedes))
        w_se = G.sstep(0.0, 5.0, d_in_se) * G.sstep(1.5, 4.0, d_water_se) * (~whas) * sett_guard

        # East-flowing wadis & rivers across sedesert: incise 90-150 m flat-floored sandstone box canyons
        se_rivs = [
            rv['px'] for rv in (rivers_list or ())
            if any(835 <= p[0] <= 965 and 350 <= p[1] <= 730 for p in rv.get('px', []))
        ]
        d_seriv = _polyline_dist_px(px, py, se_rivs, bbox_pad=14.0)
        w_se_wadi = 1.0 - G.sstep(0.9, 2.8, d_seriv)

        # Monument-Valley flat-topped sandstone mesas & spire-buttes (+130 to +210 m caprock tables)
        # across the +150 to +1,650 m desert plateau, suppressed inside wadi canyons
        mesa_fbm = 0.65 * _norm_gauss(rs, (VH, VW), 5.2) + 0.35 * _norm_gauss(rs, (VH, VW), 2.6)
        mesa_raw = np.clip(0.5 + 0.45 * mesa_fbm, 0.0, 1.0)
        # Steep talus riser between 0.55 and 0.72, flat caprock table above 0.72
        w_mesa_cap = G.sstep(0.55, 0.72, mesa_raw) * (1.0 - w_se_wadi)
        w_pediment = (1.0 - G.sstep(0.35, 0.55, mesa_raw)) * (1.0 - w_se_wadi)
        dh_mesas = 165.0 * w_mesa_cap - 32.0 * w_pediment

        # Sharpen the eastern cataract cliff scarp along the East Abyss rim (`px 918..958, py 360..690`)
        w_rim_edge = (
            G.sstep(912.0, 926.0, px) * (1.0 - G.sstep(948.0, 962.0, px))
            * G.sstep(360.0, 385.0, py) * (1.0 - G.sstep(675.0, 700.0, py))
            * (1.0 - w_se_wadi)
        )
        dh_rim_lip = 85.0 * G.sstep(-150.0, 350.0, En) * w_rim_edge

        dh_se = dh_mesas + dh_rim_lip - 125.0 * w_se_wadi
        En = En + w_se * dh_se

    # --- 3B. E Badlands (`e badlands`) & `Yuni Valley`: 5 Grand-Staircase Steps & Badland Gully Dissection ---
    mask_eb_all = mask_ebad | mask_yuni
    if mask_eb_all.any():
        d_in_eb = nd.distance_transform_edt(mask_eb_all)
        d_water_eb = nd.distance_transform_edt(~(whas & mask_eb_all))
        w_eb = G.sstep(0.0, 5.5, d_in_eb) * G.sstep(1.5, 4.0, d_water_eb) * (~whas) * sett_guard

        # 5 Grand-Staircase / Bryce-to-Zion structural formation steps across +500 to +4,500 m
        Eo_eb_base = nd.gaussian_filter(En, sigma=4.5)
        h_eb_stair = En.copy()
        for f_elev in (900.0, 1650.0, 2400.0, 3200.0, 4000.0):
            de = Eo_eb_base - f_elev
            w_f = np.exp(-((de / 290.0) ** 2))
            f_target = f_elev + 0.25 * de
            h_eb_stair = h_eb_stair * (1.0 - 0.62 * w_f) + f_target * (0.62 * w_f)

        # Dendritic badland gully dissection in the dry BSh/BSk belt (< 2,850 m) using non-periodic ridged noise
        w_badland_belt = (1.0 - G.sstep(2500.0, 3100.0, En)) * mask_ebad
        gully_r = 0.6 * np.abs(_norm_gauss(rs, (VH, VW), 2.2)) + 0.4 * np.abs(_norm_gauss(rs, (VH, VW), 4.0))
        badland_cut = -72.0 * (1.0 - G.sstep(0.15, 0.55, gully_r))

        # Yuni Valley (`px 953..1022, py 729..794`): graded alluvial floor + terraced agricultural canyon-wall benches
        yuni_axis = [(1016.0, 778.0), (995.0, 766.0), (977.0, 756.0), (958.0, 742.0)]
        d_yuni_ax = _polyline_dist_px(px, py, [yuni_axis], bbox_pad=16.0)
        w_yuni_floor = (1.0 - G.sstep(1.2, 3.2, d_yuni_ax)) * mask_yuni
        w_yuni_terr = G.sstep(2.5, 4.2, d_yuni_ax) * (1.0 - G.sstep(7.5, 11.0, d_yuni_ax)) * mask_yuni
        terr_step = 28.0 * _norm_gauss(rs, (VH, VW), 3.2)

        En_eb_new = (
            h_eb_stair
            + w_badland_belt * badland_cut
            - w_yuni_floor * 55.0
            + w_yuni_terr * terr_step
        )
        En = En * (1.0 - w_eb) + En_eb_new * w_eb

    # --- 3C. Painted Highlands (`painted highlands`): Danxia Cuesta Hogbacks, 4 Playas, & 600 m Painted Canyon ---
    if mask_paint.any():
        d_in_ph = nd.distance_transform_edt(mask_paint)
        d_water_ph = nd.distance_transform_edt(~(whas & mask_paint))
        w_ph = G.sstep(0.0, 5.0, d_in_ph) * G.sstep(1.5, 4.0, d_water_ph) * (~whas) * sett_guard

        # Folded NNW-SSE Danxia cuesta hogback ridges (`lambda = 10 km = 5 px`, +210 m asymmetric scarp)
        u_hog = (px - 750.0) * 0.88 + (py - 280.0) * 0.47 + 1.6 * _norm_gauss(rs, (VH, VW), 2.5)
        phase_hog = (2.0 * math.pi * u_hog / 5.0) % (2.0 * math.pi)
        # Asymmetric cuesta wave: steep eastern scarp (0..1.2 rad), gentle western dip slope (1.2..2*pi rad)
        cuesta_wave = np.where(
            phase_hog < 1.25,
            -1.0 + 2.0 * (phase_hog / 1.25),
            1.0 - 2.0 * ((phase_hog - 1.25) / (2.0 * math.pi - 1.25))
        )
        dh_danxia = 165.0 * cuesta_wave

        # 4 flat snowmelt superbloom playas (+3,200..+3,450 m) in synclinal basins
        playas = [
            (702.0, 264.0, 9.0, 3260.0),
            (736.0, 296.0, 10.0, 3320.0),
            (788.0, 268.0, 8.5, 3380.0),
            (822.0, 306.0, 9.5, 3240.0),
        ]
        w_playa_tot = np.zeros((VH, VW), dtype=float)
        h_playa_tot = En.copy()
        for px0, py0, r_km, p_elev in playas:
            r_p = np.hypot((px - px0) * 2.0, (py - py0) * 2.0)
            w_p = 1.0 - G.sstep(r_km * 0.65, r_km * 1.15, r_p)
            w_playa_tot = np.maximum(w_playa_tot, w_p)
            h_playa_tot = h_playa_tot * (1.0 - w_p) + (p_elev + 0.12 * (En - p_elev)) * w_p

        # 600 m-deep axial Painted Canyon draining eastward from `(745, 282)` to `(852, 294)` into Korona's western moat
        painted_canyon_pts = [(735.0, 278.0), (762.0, 285.0), (795.0, 289.0), (826.0, 292.0), (854.0, 294.0)]
        d_pcanyon = _polyline_dist_px(px, py, [painted_canyon_pts], bbox_pad=16.0)
        w_pcanyon = 1.0 - G.sstep(1.1, 3.6, d_pcanyon)
        # Stepped canyon walls (-580 m at thalweg, with a mid-wall sandstone bench)
        canyon_cut = -560.0 * (1.0 - G.sstep(0.0, 1.8, d_pcanyon)) - 220.0 * G.sstep(1.4, 2.2, d_pcanyon) * (1.0 - G.sstep(2.6, 3.6, d_pcanyon))

        dh_ph = dh_danxia * (1.0 - 0.85 * w_playa_tot) * (1.0 - 0.90 * w_pcanyon) + w_playa_tot * (h_playa_tot - En) + canyon_cut
        En = En + w_ph * dh_ph

    return En


# ==============================================================================
# Public Entry Point
# ==============================================================================
def remodel_tranche2_biomes(Eo, whas0, wlev0, regs_list, settlements_list, rivers_list, floods_list=None):
    """Apply all Tranche-2 biome landform upgrades on the `2 km/cell` height grid `Eo` (`1393 x 1549`)."""
    VH, VW = Eo.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    Y, X = np.indices((VH, VW))
    px = X.astype(float) / su
    py = Y.astype(float) / sv

    rs = np.random.RandomState(SEED_TRANCHE2)
    En = Eo.copy().astype(float)
    whas2 = whas0.copy().astype(bool)
    wlev2 = wlev0.copy().astype(float)

    if isinstance(regs_list, dict):
        regs_list = regs_list.get('docs', [])
    if isinstance(settlements_list, dict):
        settlements_list = settlements_list.get('docs', [])

    sett_guard = _settlement_guard(
        px, py, settlements_list,
        extra_pts=[(1136.0, 84.0), (1240.0, 330.0), (494.0, 74.0), (772.0, 446.0)],
        r_inner_px=3.0, r_outer_px=7.5
    )

    # 1. Outlands, The Tiers, & Stalker Range
    En = _sculpt_outlands_and_tiers(En, whas2, wlev2, regs_list, px, py, rivers_list, sett_guard, rs)

    # 2. Scablands, Dam Basins, NW/SW Lowlands, Ancient's Valley, NW Outer Wall, & Farside
    En = _sculpt_nw_sw_basins_and_walls(En, whas2, wlev2, regs_list, px, py, rivers_list, floods_list, sett_guard, rs)

    # 3. SE Desert, E Badlands, Yuni Valley, & Painted Highlands
    En = _sculpt_eastern_deserts_and_painted(En, whas2, wlev2, regs_list, px, py, rivers_list, sett_guard, rs)

    En = np.clip(En, -2600.0, 27000.0)
    changed_mask = (np.abs(En - Eo) > 0.5) | (whas2 != whas0)
    return En, whas2, wlev2, changed_mask
