"""Tranche-3 Biome Geomorphological Landform Upgrades on the unified 2 km/cell (`1393 x 1549`) height grid:
  1. Inner Wall Highland Arc (`n highlands`, `s highlands`, `e inner wall`):
     - `n highlands`: Alpine cirque & U-valley glacial dissection (>3,800 m), Yosemite-style granite batholith
       domes (+200..+380 m) in the Dsb/Csb belt (2,400..3,800 m), and 2 concentric crag-step waterfall scarps on
       the wet NW flank
     - `s highlands`: Steep northern cloud-deck escarpment (+1,120 m, y ~ 612..680) cut by 12 deep north-draining
       ravines, rolling Afroalpine/Andean paramo bog-and-tor tableland (+1,500..+2,700 m) with spiral *Whorl Stone*
       tors, and glaciated spiral-peak massifs (>4,000 m)
     - `e inner wall`: West-shifted divide escarpment incised by deep V-gorges along Rrivar Falz/Isguifta/Grin/Loña,
       dry east Puna/Altiplano cushion tableland (+3,600..+4,600 m), and a flat geothermal geyser basin at (858, 524).
  2. Southern Rift, Sky Islands, Rift Rim, Xanadu, Oidong Valley & The Catch:
     - `rift`: Flatten Cube's Plateau (px 427..464, py 1197..1271 around Arccube) toward -250 m with sheer
       1,200..1,600 m fault cliffs, and sculpt stepped cloud-forest horst benches (+1,200 m Band A, +1,650 m Band B,
       flat mesa caps) on the Sky-Island massifs (Central 356,1163; West 264,1175; East 448,1240)
     - `rift rim N`, `rift rim S`, `w rift highland`: 3 normal-fault hanging-valley terrace steps (+2,200, +3,200,
       +4,200 m) and high glacial cirque headwalls (>4,000 m)
     - `xanadu` & `Oidong Valley`: Xanadu SE outlet cataract cliff step (px 635..670, py 1230..1265) & south-shore
       Sacred River (Ālph) chasm amphitheatre (575, 1198); Oidong 4-stepped U-shaped mirror-pool floor (+2,800..+3,400 m)
       below a +300 m eastern headwall cataract, flanked by smooth south-wall piedmont gravel fans
     - `the catch`: Coalescing piedmont bajada fans, deflated star-dune erg bowl east of Catch Lake (785..825, 1085..1118),
       NE-SW Lop-Nur yardang fleets (755..795, 1045..1075), and the 500 m-deep Red Canyon water gap at (825, 1068).
  3. Inner Crater Abyss, Rim Savannahs, Ring Isles, Steampits & Bays:
     - `hyperjungle`: `hyperjungle S` flat várzea scroll-bar floodplain & oxbow sloughs; `savage hyperjungle` 20 flat-topped
       micro-tepui outliers (+180..+320 m) & 35 karst/laterite sinkholes; `hyperjungle N` ENE laterite whaleback ridges
     - `crater drylands N & S`: N asymmetric cuesta firebreak ridges (+85 m), granite *Hopi* kopjes (+140 m), and
       -1,285 m salt-pan playa (485, 375); S 4 stepped basalt mallee benches and 3 incised NW-SE gallery-forest ravines
     - `abyssal-savannah` (`e savannah rim`, `se savannah rim`, `ne rim`): 4-tier sandstone caprock terrace staircase
       across -1,300 to +600 m incised by 120..180 m transverse gallery-forest canyons
     - `ringisles` & `Steampits`: Windward island sea-cliffs, vent summit craters, and 3 sinter terrace steps
       (-1,480, -1,450, -1,420 m) around the 8 vents in `Steampits`
     - `SW Bay` & `NW bay`: SW Bay two-tier coastal bench, +350 m cataract scarp, parasol-savannah terrace, and +400 m
       Vothic coastal stratovolcano cone at (482, 662); NW Bay Krabi coastal tower karst stacks, inland *tsingy*
       limestone plateau bench, 84 m-deep *tiankeng* doline at (408, 428), and stepped travertine valley.
"""
import math
import numpy as np
from scipy import ndimage as nd
from . import geom as G
from .tier1_biomes import _norm_gauss, _settlement_guard, _polyline_dist_px


SEED_TRANCHE3 = 20261103


# ==============================================================================
# 1. Inner Wall Highland Arc (`n highlands`, `s highlands`, `e inner wall`)
# ==============================================================================
def _sculpt_inner_wall_highlands(Eo, whas, wlev, regs_list, px, py, rivers_list, sett_guard, rs):
    """Sculpt `n highlands`, `s highlands`, and `e inner wall`."""
    VH, VW = Eo.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    En = Eo.copy()

    mask_nh = G.region_mask(regs_list, 'n highlands', su, sv, (VH, VW))
    mask_sh = G.region_mask(regs_list, 's highlands', su, sv, (VH, VW))
    mask_eh = G.region_mask(regs_list, 'e inner wall', su, sv, (VH, VW))

    # --- 1A. Northern Highlands (`n highlands`): Alpine Cirques, Yosemite Granite Domes, & NW Crag Steps ---
    if mask_nh.any():
        d_in_nh = nd.distance_transform_edt(mask_nh)
        d_water_nh = nd.distance_transform_edt(~(whas & mask_nh))
        w_nh = G.sstep(0.0, 5.5, d_in_nh) * G.sstep(1.5, 4.2, d_water_nh) * (~whas) * sett_guard

        # Alpine ridge-and-cirque dissection (>3,800 m)
        w_nh_alp = G.sstep(3600.0, 4300.0, En)
        arete_f = np.clip(1.0 - np.abs(_norm_gauss(rs, (VH, VW), 1.8)), 0.0, 1.0)
        dh_nh_alp = w_nh_alp * (310.0 * ((arete_f ** 1.4) - 0.42))

        # U-shaped glacial valley troughs along Republican rivers
        nh_rivs = [
            rv['px'] for rv in (rivers_list or ())
            if any(260 <= p[0] <= 720 and 220 <= p[1] <= 480 for p in rv.get('px', []))
        ]
        d_nhriv = _polyline_dist_px(px, py, nh_rivs, bbox_pad=16.0)
        w_nh_uval = (1.0 - G.sstep(1.2, 3.8, d_nhriv)) * G.sstep(1800.0, 2800.0, En)

        # Yosemite-style granite batholith exfoliation domes (+180..+260 m) in the Dsb/Csb belt (2,400..3,800 m)
        w_dome_belt = G.sstep(2300.0, 2700.0, En) * (1.0 - G.sstep(3650.0, 4100.0, En)) * (1.0 - w_nh_uval)
        dome_raw = 0.65 * _norm_gauss(rs, (VH, VW), 5.0) + 0.35 * _norm_gauss(rs, (VH, VW), 2.8)
        dh_domes = w_dome_belt * (185.0 * (np.clip(dome_raw - 0.35, 0.0, 1.2) / 1.2) ** 0.9)

        # 2 concentric crag-step waterfall scarps (+1,400 m and +2,300 m) on the wet NW flank
        dh_crag_steps = np.zeros((VH, VW), dtype=float)
        for c_elev in (1400.0, 2300.0):
            de = En - c_elev
            w_c = np.exp(-((de / 220.0) ** 2))
            dh_crag_steps -= 0.55 * w_c * de

        En = En + w_nh * (dh_nh_alp + dh_domes + dh_crag_steps - 175.0 * w_nh_uval)

    # --- 1B. Southern Highlands (`s highlands`): +1,120 m Cloud-Deck Scarp, Paramo Bog-and-Tor Table, & Spiral Peaks ---
    if mask_sh.any():
        d_in_sh = nd.distance_transform_edt(mask_sh)
        d_water_sh = nd.distance_transform_edt(~(whas & mask_sh))
        w_sh = G.sstep(0.0, 5.5, d_in_sh) * G.sstep(1.5, 4.0, d_water_sh) * (~whas) * sett_guard
        # Protect Daridel (528, 687)
        w_sh = w_sh * G.sstep(2.5, 6.0, np.hypot(px - 528.0, py - 687.0))

        # Northern cloud-deck escarpment around +1,120 m (`py ~ 610..685`): steepen scarp & cut north-draining ravines
        de_cloud = En - 1120.0
        w_cloud_scarp = np.exp(-((de_cloud / 380.0) ** 2)) * (1.0 - G.sstep(675.0, 710.0, py))
        ravine_wave = _norm_gauss(rs, (VH, VW), 2.8)
        dh_ravines = -125.0 * w_cloud_scarp * (np.clip(ravine_wave - 0.45, 0.0, 1.2) / 1.2) ** 1.3

        # Rolling Afroalpine/Andean paramo bog-and-tor tableland (+1,500..+2,750 m) with natural granite tors
        w_paramo = G.sstep(1450.0, 1750.0, En) * (1.0 - G.sstep(2650.0, 3050.0, En))
        Eo_sh_s = nd.gaussian_filter(En, sigma=4.5)
        tor_whorl = 0.65 * _norm_gauss(rs, (VH, VW), 4.8) + 0.35 * _norm_gauss(rs, (VH, VW), 2.5)
        dh_tors = 135.0 * (np.clip(tor_whorl - 0.48, 0.0, 1.2) / 1.2) ** 1.15
        dh_bogs = -42.0 * (np.clip(-tor_whorl - 0.40, 0.0, 1.2) / 1.2)
        dh_paramo = w_paramo * (0.58 * (Eo_sh_s - En) + dh_tors + dh_bogs)

        # Glaciated spiral-peak massifs (>3,800 m)
        w_sh_peaks = G.sstep(3650.0, 4300.0, En)
        dh_sh_peaks = w_sh_peaks * (210.0 * (1.0 - np.abs(_norm_gauss(rs, (VH, VW), 2.2)) - 0.40))

        En = En + w_sh * (dh_ravines + dh_paramo + dh_sh_peaks)

    # --- 1C. Eastern Inner Wall (`e inner wall`): West-Shifted Escarpment V-Gorges & Dry East Cushion Altiplano ---
    if mask_eh.any():
        d_in_eh = nd.distance_transform_edt(mask_eh)
        d_water_eh = nd.distance_transform_edt(~(whas & mask_eh))
        w_eh = G.sstep(0.0, 5.5, d_in_eh) * G.sstep(1.5, 4.0, d_water_eh) * (~whas) * sett_guard

        # Deep V-gorges along the wet western windward face (`px < 828`) for Rrivar Falz, Isguifta, Grin, Loña
        eh_rivs = [
            rv['px'] for rv in (rivers_list or ())
            if any(740 <= p[0] <= 845 and 380 <= p[1] <= 660 for p in rv.get('px', []))
        ]
        d_ehriv = _polyline_dist_px(px, py, eh_rivs, bbox_pad=16.0)
        w_vgorge = (1.0 - G.sstep(0.9, 3.2, d_ehriv)) * (1.0 - G.sstep(818.0, 842.0, px))
        dh_vgorge = -245.0 * w_vgorge

        # High wind-scoured Puna/Altiplano cushion tableland (+3,600..+4,600 m) on the dry east side (`px >= 815`)
        w_altiplano = G.sstep(805.0, 832.0, px) * G.sstep(3200.0, 3650.0, En) * (1.0 - G.sstep(4750.0, 5200.0, En))
        Eo_eh_s = np.clip(nd.gaussian_filter(En, sigma=5.5), 3650.0, 4550.0)
        cushion_hills = 48.0 * _norm_gauss(rs, (VH, VW), 4.5)
        dh_alti = w_altiplano * (0.68 * (Eo_eh_s + cushion_hills - En))

        # Flat geothermal geyser & cushion-bog basin at `(858, 524)` (+3,850 m)
        r_geyser_km = np.hypot((px - 858.0) * 2.0, (py - 524.0) * 2.0)
        w_geyser = 1.0 - G.sstep(10.0, 20.0, r_geyser_km)
        dh_geyser = w_geyser * (3850.0 + 0.15 * (En - 3850.0) - En)

        En = En + w_eh * (dh_vgorge + dh_alti * (1.0 - w_geyser) + dh_geyser)

    return En


# ==============================================================================
# 2. Southern Rift, Sky Islands, Rift Rim, Xanadu, Oidong Valley & The Catch
# ==============================================================================
def _sculpt_southern_rift_xanadu_catch(Eo, whas, wlev, regs_list, px, py, rivers_list, sett_guard, rs):
    """Sculpt `rift`, `rift rim N/S`, `w rift highland`, `xanadu`, `Oidong Valley`, and `the catch`."""
    VH, VW = Eo.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    En = Eo.copy()

    mask_rift = (
        G.region_mask(regs_list, 'rift', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'The Rift', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'Lizardmen', su, sv, (VH, VW))
    )
    mask_rrim = (
        G.region_mask(regs_list, 'rift rim N', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'rift rim S', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'w rift highland', su, sv, (VH, VW))
    )
    mask_xan = (
        G.region_mask(regs_list, 'xanadu', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'Vale of Xanadu', su, sv, (VH, VW))
    )
    mask_oid = G.region_mask(regs_list, 'Oidong Valley', su, sv, (VH, VW))
    mask_catch = (
        G.region_mask(regs_list, 'the catch', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'The Catch', su, sv, (VH, VW))
    )

    # --- 2A. The Rift (`rift`): Cube's Plateau (-250 m Horst) & Stepped Sky-Island Cloud-Forest Benches ---
    if mask_rift.any():
        d_in_rf = nd.distance_transform_edt(mask_rift)
        d_water_rf = nd.distance_transform_edt(~(whas & mask_rift))
        w_rf = G.sstep(0.0, 5.0, d_in_rf) * G.sstep(1.5, 4.0, d_water_rf) * (~whas) * sett_guard

        # Cube's Plateau (`px 427..464, py 1197..1271` around Arccube): flatten horst table toward -250 m
        dx_cube = (px - 445.5) / 17.5
        dy_cube = (py - 1234.0) / 34.0
        r_cube = np.hypot(dx_cube, dy_cube) + 0.12 * np.sin(np.arctan2(dy_cube, dx_cube) * 3.0)
        w_cube_top = (1.0 - G.sstep(0.68, 0.96, r_cube)) * G.sstep(-900.0, -350.0, En) * w_rf
        h_cube_target = -250.0 + 0.18 * (En - (-250.0)) + 16.0 * _norm_gauss(rs, (VH, VW), 1.5)
        En = En * (1.0 - 0.78 * w_cube_top) + h_cube_target * (0.78 * w_cube_top)

        # Sky-Island massifs: Central Cloud Island (356, 1163), Western Massif (264, 1175), East Massif (448, 1240)
        # Sculpt stepped cloud-forest horst benches at +1,200 m (Band A) and +1,650 m (Band B)
        for b_elev in (1200.0, 1650.0):
            de = En - b_elev
            w_b = np.exp(-((de / 240.0) ** 2)) * w_rf
            En = En - w_b * (0.62 * de)

    # --- 2B. Rift Rim (`rift rim N`, `rift rim S`, `w rift highland`): 3 Normal-Fault Steps & High Cirques ---
    if mask_rrim.any():
        d_in_rr = nd.distance_transform_edt(mask_rrim)
        d_water_rr = nd.distance_transform_edt(~(whas & mask_rrim))
        w_rr = G.sstep(0.0, 5.0, d_in_rr) * G.sstep(1.8, 4.5, d_water_rr) * (~whas) * sett_guard
        # Protect Ledge (165, 1004), Chimes (196, 1062), and the +298 m Great Lake basin plain (< 1,400 m)
        w_rr = (
            w_rr
            * G.sstep(2.5, 6.0, np.hypot(px - 165.0, py - 1004.0))
            * G.sstep(2.5, 6.0, np.hypot(px - 196.0, py - 1062.0))
            * G.sstep(1450.0, 1950.0, En)
        )

        # 3 normal-fault terrace steps at +2,200 m, +3,200 m, and +4,200 m
        for f_elev in (2200.0, 3200.0, 4200.0):
            de = En - f_elev
            w_f = np.exp(-((de / 260.0) ** 2)) * w_rr
            En = En - w_f * (0.58 * de)

        # High glacial cirque hollows & arête crests above 4,400 m
        w_rr_alp = G.sstep(4300.0, 4900.0, En) * w_rr
        cirque_f = _norm_gauss(rs, (VH, VW), 1.8)
        dh_rr_alp = np.where(cirque_f > 0.0, 210.0 * cirque_f, 165.0 * cirque_f)
        En = En + w_rr_alp * dh_rr_alp

    # --- 2C. Xanadu (`xanadu`) & `Oidong Valley`: Alph Chasm, SE Cataract, & 4-Stepped Mirror-Pool U-Valley ---
    if mask_xan.any():
        d_in_x = nd.distance_transform_edt(mask_xan)
        d_water_x = nd.distance_transform_edt(~(whas & mask_xan))
        w_x = G.sstep(0.0, 4.5, d_in_x) * G.sstep(1.5, 4.0, d_water_x) * (~whas) * sett_guard

        # Xanadu SE outlet cataract cliff step (`px 635..670, py 1230..1265`)
        r_se_cat = np.hypot((px - 652.0) * 2.0, (py - 1248.0) * 2.0)
        w_se_cat = (1.0 - G.sstep(14.0, 28.0, r_se_cat)) * w_x
        u_cat = (px - 652.0) * 0.72 + (py - 1248.0) * 0.69
        dh_se_cat = -240.0 * G.sstep(-4.0, 4.0, u_cat) * w_se_cat

        # South-shore Sacred River (`Ālph`) chasm amphitheatre at `(575, 1198)`
        r_alph = np.hypot((px - 575.0) * 2.0, (py - 1198.0) * 2.0)
        w_alph = (1.0 - G.sstep(8.0, 18.0, r_alph)) * w_x
        dh_alph = -195.0 * w_alph

        En = En + dh_se_cat + dh_alph
        # Keep Xanadu land above the +1,277 m lake level
        En = np.where((w_x > 0.01) & (Eo > 1280.0), np.maximum(En, 1285.0), En)

    if mask_oid.any():
        d_in_oid = nd.distance_transform_edt(mask_oid)
        d_water_oid = nd.distance_transform_edt(~(whas & mask_oid))
        w_oid = G.sstep(0.0, 4.0, d_in_oid) * G.sstep(1.5, 3.8, d_water_oid) * (~whas) * sett_guard
        # Protect Longsong at (954, 1296)
        w_oid = w_oid * G.sstep(3.0, 7.0, np.hypot(px - 954.0, py - 1296.0))

        # Oidong axial U-valley centerline (`px 780..910, py 1255..1285`)
        oid_axis = [(912.0, 1278.0), (875.0, 1272.0), (835.0, 1268.0), (795.0, 1264.0), (762.0, 1258.0)]
        d_oid_ax = _polyline_dist_px(px, py, [oid_axis], bbox_pad=18.0)
        w_oid_floor = (1.0 - G.sstep(1.8, 4.8, d_oid_ax)) * w_oid

        # 4 stepped mirror-pool valley-floor terraces (+3,350, +3,160, +2,980, +2,800 m from E to W)
        t_along = np.clip((910.0 - px) / 140.0, 0.0, 1.0)
        step_idx = np.floor(t_along * 4.0)
        step_frac = (t_along * 4.0) - step_idx
        step_smooth = step_idx + G.sstep(0.75, 0.98, step_frac)
        h_oid_steps = 3360.0 - 140.0 * step_smooth + 0.15 * (En - 3100.0)

        # +300 m eastern headwall cataract around `px = 905..922`
        w_headwall = G.sstep(898.0, 916.0, px) * (1.0 - G.sstep(924.0, 940.0, px)) * w_oid_floor
        h_oid_steps = h_oid_steps + 280.0 * w_headwall

        # Smooth south-wall piedmont gravel fans (`py > 1272`, `d_oid_ax` 3.5..8.0 px)
        w_sfan = G.sstep(3.0, 5.0, d_oid_ax) * (1.0 - G.sstep(7.5, 11.0, d_oid_ax)) * G.sstep(1268.0, 1278.0, py) * w_oid
        Eo_oid_s = nd.gaussian_filter(En, sigma=4.0)

        En = En * (1.0 - 0.78 * w_oid_floor) + h_oid_steps * (0.78 * w_oid_floor)
        En = En * (1.0 - 0.55 * w_sfan) + Eo_oid_s * (0.55 * w_sfan)

    # --- 2D. The Catch (`the catch`): Piedmont Bajadas, Star-Dune Erg, Lop-Nur Yardangs, & Red Canyon ---
    if mask_catch.any():
        d_in_c = nd.distance_transform_edt(mask_catch)
        d_water_c = nd.distance_transform_edt(~(whas & mask_catch))
        w_c = G.sstep(0.0, 5.0, d_in_c) * G.sstep(1.5, 4.0, d_water_c) * (~whas) * sett_guard

        # Deflated star-dune erg bowl east of Catch Lake (`px 785..825, py 1085..1118` at +550..+850 m)
        r_erg_km = np.hypot((px - 805.0) * 2.0, (py - 1102.0) * 2.4)
        w_erg = (1.0 - G.sstep(22.0, 42.0, r_erg_km)) * w_c
        # Star-dune ridge relief (+45..+75 m) inside a deflated -85 m basin pocket
        star_dunes = 65.0 * (1.0 - np.abs(_norm_gauss(rs, (VH, VW), 2.6)))
        dh_erg = w_erg * (-85.0 + star_dunes)

        # NE-SW Lop-Nur yardang ridge-and-trough fleets (`px 755..795, py 1045..1075`)
        r_yard_km = np.hypot((px - 775.0) * 2.0, (py - 1060.0) * 2.2)
        w_yard = (1.0 - G.sstep(20.0, 38.0, r_yard_km)) * w_c
        dh_yard = w_yard * (32.0 * _norm_gauss(rs, (VH, VW), 3.0))

        # 500 m-deep Red Canyon water-gap gorge through the central range at `(825, 1068)`
        red_canyon_pts = [(848.0, 1062.0), (834.0, 1066.0), (825.0, 1068.0), (812.0, 1072.0), (798.0, 1078.0)]
        d_rcan = _polyline_dist_px(px, py, [red_canyon_pts], bbox_pad=14.0)
        w_rcan = (1.0 - G.sstep(0.9, 3.0, d_rcan)) * w_c
        dh_rcan = -460.0 * (1.0 - G.sstep(0.0, 1.8, d_rcan)) * w_rcan

        # Coalescing piedmont bajada alluvial fans along the mountain apron (+900..+2,200 m)
        w_bajada = G.sstep(900.0, 1200.0, En) * (1.0 - G.sstep(2100.0, 2600.0, En)) * (1.0 - w_rcan) * w_c
        Eo_catch_s = nd.gaussian_filter(En, sigma=4.5)
        dh_bajada = w_bajada * (0.55 * (Eo_catch_s - En))

        En = En + dh_erg + dh_yard + dh_rcan + dh_bajada
        # Keep Catch floor above the +453 m Catch Lake level
        En = np.where((w_c > 0.01) & (Eo > 455.0), np.maximum(En, 458.0), En)

    return En


# ==============================================================================
# 3. Inner Crater Abyss, Rim Savannahs, Ring Isles, Steampits & Bays
# ==============================================================================
def _sculpt_inner_crater_savannahs_isles_bays(Eo, whas, wlev, regs_list, px, py, rivers_list, vents_list, sett_guard, rs):
    """Sculpt `hyperjungle S/N/savage`, `crater drylands N/S`, `abyssal-savannah`, `ringisles`, `Steampits`,
    `SW Bay`, and `NW bay`."""
    VH, VW = Eo.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    En = Eo.copy()

    mask_hjs = G.region_mask(regs_list, 'hyperjungle S', su, sv, (VH, VW))
    mask_hjsav = G.region_mask(regs_list, 'savage hyperjungle', su, sv, (VH, VW))
    mask_hjn = G.region_mask(regs_list, 'hyperjungle N', su, sv, (VH, VW))
    mask_cdn = G.region_mask(regs_list, 'crater drylands N', su, sv, (VH, VW))
    mask_cds = G.region_mask(regs_list, 'crater drylands S', su, sv, (VH, VW))
    mask_sav = (
        G.region_mask(regs_list, 'e savannah rim', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'se savannah rim', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'ne rim', su, sv, (VH, VW))
    )
    mask_isles = (
        G.region_mask(regs_list, 'East Ring Isles', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'West Ring isles', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'Kautoa', su, sv, (VH, VW))
    )
    mask_steam = G.region_mask(regs_list, 'Steampits', su, sv, (VH, VW))
    mask_swbay = G.region_mask(regs_list, 'SW Bay', su, sv, (VH, VW))
    mask_nwbay = G.region_mask(regs_list, 'NW bay', su, sv, (VH, VW))

    # --- 3A. Hyperjungle (`hyperjungle S`, `savage hyperjungle`, `hyperjungle N`) ---
    mask_hj_all = mask_hjs | mask_hjsav | mask_hjn
    if mask_hj_all.any():
        d_water_hj = nd.distance_transform_edt(~(whas & mask_hj_all))
        w_hj = G.sstep(1.2, 3.8, d_water_hj) * (~whas) * sett_guard

        # 1. `hyperjungle S`: flat várzea scroll-bar floodplain & oxbow depressions within -1,495..-1,410 m
        w_varzea = mask_hjs * (1.0 - G.sstep(-1410.0, -1320.0, En)) * w_hj
        scroll_bars = 5.5 * _norm_gauss(rs, (VH, VW), 3.8)
        varzea_target = np.maximum(-1482.0 + 0.25 * (En - (-1482.0)) + scroll_bars, -1492.0)
        En = En * (1.0 - 0.72 * w_varzea) + varzea_target * (0.72 * w_varzea)

        # 2. `savage hyperjungle`: steep-sided flat-topped micro-tepui outliers (+160..+220 m) & sinkholes (-55..-75 m)
        d_in_savj = nd.distance_transform_edt(mask_hjsav)
        w_savj = G.sstep(0.0, 4.5, d_in_savj) * w_hj
        tepui_f = 0.65 * _norm_gauss(rs, (VH, VW), 4.8) + 0.35 * _norm_gauss(rs, (VH, VW), 2.5)
        dh_mtepui = 195.0 * G.sstep(0.55, 0.85, tepui_f)
        sink_f = _norm_gauss(rs, (VH, VW), 3.2)
        dh_sinks = -65.0 * (np.clip(sink_f - 0.75, 0.0, 1.0) ** 1.3)
        En = En + w_savj * (dh_mtepui + dh_sinks)

        # 3. `hyperjungle N`: ENE-aligned laterite *meias-laranjas* whaleback ridges (+55 m) & seasonal flood pans
        d_in_hjn = nd.distance_transform_edt(mask_hjn)
        w_hjn = G.sstep(0.0, 4.5, d_in_hjn) * w_hj
        whaleback = 48.0 * _norm_gauss(rs, (VH, VW), 4.5)
        En = En + w_hjn * whaleback
        En = np.where((w_hj > 0.01) & mask_hj_all & (Eo > -1498.0), np.maximum(En, -1492.0), En)

    # --- 3B. Crater Drylands N & S (`crater drylands N`, `crater drylands S`) ---
    if mask_cdn.any():
        d_in_cdn = nd.distance_transform_edt(mask_cdn)
        d_water_cdn = nd.distance_transform_edt(~(whas & mask_cdn))
        w_cdn = G.sstep(0.0, 4.5, d_in_cdn) * G.sstep(1.5, 4.0, d_water_cdn) * (~whas) * sett_guard

        # NE-SW asymmetric cuesta firebreak ridges (+85 m SE scarp, gentle NW dip)
        u_cuesta = (px - 500.0) * 0.71 + (py - 380.0) * 0.71 + 1.2 * _norm_gauss(rs, (VH, VW), 2.0)
        ph_c = (2.0 * math.pi * u_cuesta / 5.5) % (2.0 * math.pi)
        cuesta_n = np.where(ph_c < 1.3, -1.0 + 2.0 * (ph_c / 1.3), 1.0 - 2.0 * ((ph_c - 1.3) / (2.0 * math.pi - 1.3)))
        dh_cuesta_n = 78.0 * cuesta_n

        # Granite *Hopi* kopje inselbergs (+135 m fire-refuge tors)
        kopje_f = np.clip(_norm_gauss(rs, (VH, VW), 1.35) - 1.25, 0.0, 2.0)
        dh_kopjes = 135.0 * (kopje_f ** 1.2)

        # -1,285 m salt-pan playa at `(485, 375)`
        r_playa_n = np.hypot((px - 485.0) * 2.0, (py - 375.0) * 2.0)
        w_playa_n = 1.0 - G.sstep(8.0, 16.0, r_playa_n)
        h_playa_n = -1285.0 + 0.12 * (En - (-1285.0))

        En = En + w_cdn * ((dh_cuesta_n + dh_kopjes) * (1.0 - w_playa_n) + w_playa_n * (h_playa_n - En))
        En = np.where((w_cdn > 0.01) & (Eo > -1495.0), np.maximum(En, -1490.0), En)

    if mask_cds.any():
        d_in_cds = nd.distance_transform_edt(mask_cds)
        d_water_cds = nd.distance_transform_edt(~(whas & mask_cds))
        w_cds = G.sstep(0.0, 4.5, d_in_cds) * G.sstep(1.5, 4.0, d_water_cds) * (~whas) * sett_guard

        # 4 stepped basalt mallee benches (-1,200 m, -850 m, -500 m, -150 m)
        for b_elev in (-1200.0, -850.0, -500.0, -150.0):
            de = En - b_elev
            w_b = np.exp(-((de / 160.0) ** 2)) * w_cds
            En = En - w_b * (0.58 * de)

        # 3 incised NW-SE `Af` gallery-forest ravines around `(555, 618)`
        cds_ravines = [
            [(575.0, 636.0), (555.0, 618.0), (535.0, 600.0)],
            [(588.0, 624.0), (568.0, 606.0), (548.0, 588.0)],
            [(562.0, 648.0), (542.0, 630.0), (522.0, 612.0)],
        ]
        d_cdrav = _polyline_dist_px(px, py, cds_ravines, bbox_pad=12.0)
        w_cdrav = (1.0 - G.sstep(0.8, 2.5, d_cdrav)) * w_cds
        En = En - 115.0 * w_cdrav
        En = np.where((w_cds > 0.01) & (Eo > -1495.0), np.maximum(En, -1490.0), En)

    # --- 3C. Abyssal-Savannah (`e savannah rim`, `se savannah rim`, `ne rim`): 4-Tier Caprock Staircase & Canyons ---
    if mask_sav.any():
        d_in_sav = nd.distance_transform_edt(mask_sav)
        d_water_sav = nd.distance_transform_edt(~(whas & mask_sav))
        w_sav = G.sstep(0.0, 5.0, d_in_sav) * G.sstep(1.5, 4.0, d_water_sav) * (~whas) * sett_guard

        # 4-tier sandstone caprock terrace staircase (-1,100 m, -600 m, -100 m, +400 m)
        for t_elev in (-1100.0, -600.0, -100.0, 400.0):
            de = En - t_elev
            w_t = np.exp(-((de / 210.0) ** 2)) * w_sav
            En = En - w_t * (0.60 * de)

        # 120..180 m transverse gallery-forest canyons along rivers descending from the Eastern Inner Wall
        sav_rivs = [
            rv['px'] for rv in (rivers_list or ())
            if any(650 <= p[0] <= 830 and 300 <= p[1] <= 680 for p in rv.get('px', []))
        ]
        d_savriv = _polyline_dist_px(px, py, sav_rivs, bbox_pad=14.0)
        w_sav_can = (1.0 - G.sstep(0.9, 2.8, d_savriv)) * w_sav
        En = En - 145.0 * w_sav_can
        En = np.where((w_sav > 0.01) & (Eo > -1495.0), np.maximum(En, -1490.0), En)

    # --- 3D. Ring Isles & Steampits: Windward Sea Cliffs, Vent Craters, & 3 Sinter Terrace Steps ---
    if mask_isles.any():
        d_water_isl = nd.distance_transform_edt(~whas)
        w_isl = mask_isles * (~whas) * G.sstep(0.8, 2.5, d_water_isl) * sett_guard
        # Steepen coastal sea-cliff shoulders (+65 m) on windward island margins (`d_water_isl` 1.5..4.0 px)
        w_cliff_rim = G.sstep(1.0, 2.2, d_water_isl) * (1.0 - G.sstep(3.5, 5.5, d_water_isl)) * w_isl
        En = En + 58.0 * w_cliff_rim

    if mask_steam.any():
        d_water_st = nd.distance_transform_edt(~whas)
        w_stm = mask_steam * (~whas) * G.sstep(0.8, 2.5, d_water_st) * sett_guard
        # 3 flat travertine/sinter terrace steps (-1,480, -1,450, -1,420 m) around the Steampits vents
        for s_elev in (-1480.0, -1450.0, -1420.0):
            de = En - s_elev
            w_s = np.exp(-((de / 14.0) ** 2)) * w_stm
            En = En - w_s * (0.68 * de)
        En = np.where((w_stm > 0.01) & (Eo > -1498.0), np.maximum(En, -1494.0), En)

    # --- 3E. SW Bay (`SW Bay`) & NW Bay (`NW bay`) ---
    if mask_swbay.any():
        d_in_swb = nd.distance_transform_edt(mask_swbay)
        d_water_swb = nd.distance_transform_edt(~whas)
        w_swb = G.sstep(0.0, 4.0, d_in_swb) * G.sstep(1.2, 3.5, d_water_swb) * (~whas) * sett_guard
        # Protect Voth city at (470, 688)
        w_swb = w_swb * G.sstep(2.5, 6.0, np.hypot(px - 470.0, py - 688.0))

        # Two-tier coastal bay-jungle bench (-1,420 m) -> +350 m cataract scarp -> parasol-savannah terrace (-750 m)
        for b_elev, bw in ((-1420.0, 55.0), (-750.0, 180.0)):
            de = En - b_elev
            w_b = np.exp(-((de / bw) ** 2)) * w_swb
            En = En - w_b * (0.58 * de)

        # +400 m Vothic coastal stratovolcano cone at `(482, 662)` (with a small summit crater)
        r_vcone_km = np.hypot((px - 482.0) * 2.0, (py - 662.0) * 2.0)
        cone_profile = 420.0 * np.exp(-((r_vcone_km / 6.5) ** 1.65)) - 95.0 * np.exp(-((r_vcone_km / 1.8) ** 2))
        En = En + w_swb * cone_profile
        En = np.where((w_swb > 0.01) & (Eo > -1498.0), np.maximum(En, -1492.0), En)

    if mask_nwbay.any():
        d_in_nwb = nd.distance_transform_edt(mask_nwbay)
        d_water_nwb = nd.distance_transform_edt(~whas)
        w_nwb = G.sstep(0.0, 4.0, d_in_nwb) * G.sstep(1.2, 3.2, d_water_nwb) * (~whas) * sett_guard
        # Protect Ys at (386, 421) and Tethys
        w_nwb = w_nwb * G.sstep(2.5, 6.0, np.hypot(px - 386.0, py - 421.0))

        # Krabi / Raja Ampat coastal limestone tower stacks (+140..+210 m) on coastal headlands (`En < -1,150 m`)
        w_krabi = (1.0 - G.sstep(-1150.0, -900.0, En)) * w_nwb
        stack_f = 0.65 * _norm_gauss(rs, (VH, VW), 4.0) + 0.35 * _norm_gauss(rs, (VH, VW), 2.2)
        dh_krabi = w_krabi * (175.0 * (np.clip(stack_f - 0.45, 0.0, 1.2) / 1.2) ** 1.2)

        # Inland *tsingy* knife-edge limestone plateau bench (-1,050..-800 m) with fluted fissure relief
        w_tsingy = G.sstep(-1150.0, -980.0, En) * (1.0 - G.sstep(-720.0, -520.0, En)) * w_nwb
        tsingy_fins = 55.0 * (1.0 - np.abs(_norm_gauss(rs, (VH, VW), 2.4)))
        dh_tsingy = w_tsingy * (0.55 * (-940.0 - En) + tsingy_fins)

        # 84 m-deep *tiankeng* collapse doline at `(408, 428)` (per `LORE.md` §8)
        r_tk_km = np.hypot((px - 408.0) * 2.0, (py - 428.0) * 2.0)
        dh_tiankeng = -88.0 * (1.0 - G.sstep(1.8, 3.6, r_tk_km)) * w_nwb

        En = En + dh_krabi + dh_tsingy + dh_tiankeng
        En = np.where((w_nwb > 0.01) & (Eo > -1498.0), np.maximum(En, -1492.0), En)

    return En


# ==============================================================================
# Public Entry Point
# ==============================================================================
def remodel_tranche3_biomes(Eo, whas0, wlev0, regs_list, settlements_list, rivers_list, vents_list=None):
    """Apply all Tranche-3 biome landform upgrades on the `2 km/cell` height grid `Eo` (`1393 x 1549`)."""
    VH, VW = Eo.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    Y, X = np.indices((VH, VW))
    px = X.astype(float) / su
    py = Y.astype(float) / sv

    rs = np.random.RandomState(SEED_TRANCHE3)
    En = Eo.copy().astype(float)
    whas2 = whas0.copy().astype(bool)
    wlev2 = wlev0.copy().astype(float)

    if isinstance(regs_list, dict):
        regs_list = regs_list.get('docs', [])
    if isinstance(settlements_list, dict):
        settlements_list = settlements_list.get('docs', [])

    sett_guard = _settlement_guard(
        px, py, settlements_list,
        extra_pts=[(528.0, 687.0), (165.0, 1004.0), (196.0, 1062.0), (954.0, 1296.0), (470.0, 688.0), (386.0, 421.0)],
        r_inner_px=3.0, r_outer_px=7.5
    )

    # 1. Inner Wall Highland Arc (`n highlands`, `s highlands`, `e inner wall`)
    En = _sculpt_inner_wall_highlands(En, whas2, wlev2, regs_list, px, py, rivers_list, sett_guard, rs)

    # 2. Southern Rift, Sky Islands, Rift Rim, Xanadu, Oidong Valley & The Catch
    En = _sculpt_southern_rift_xanadu_catch(En, whas2, wlev2, regs_list, px, py, rivers_list, sett_guard, rs)

    # 3. Inner Crater Abyss, Rim Savannahs, Ring Isles, Steampits & Bays
    En = _sculpt_inner_crater_savannahs_isles_bays(
        En, whas2, wlev2, regs_list, px, py, rivers_list, vents_list, sett_guard, rs
    )

    En = np.clip(En, -2600.0, 27000.0)
    changed_mask = (np.abs(En - Eo) > 0.5) | (whas2 != whas0)
    return En, whas2, wlev2, changed_mask
