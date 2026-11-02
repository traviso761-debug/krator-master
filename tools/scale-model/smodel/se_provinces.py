"""Terrain sculpting for the three newly transformed Southeastern provinces:
  1. Mid Basin (`rmvmidbasin101`) — Transitional volcano-tectonic hinge zone between Siphon Pits and Loom-Chasms:
     - Continuous Western Loess-and-Tuff Corridor (+1,950..+2,320 m) joining Ostrukh Terraces to Weavers' Cradle
     - 3 arcuate en-echelon faulted basalt relay benches stepping down from the Siphon Pits plateau (+4,350 m)
       to the Loom-Chasms Shuttle Mesas (+1,550 m)
     - 6 Horseshoe Breached Maar-Diatreme Amphitheaters cleaved on their northern rims by southward-propagating
       Loom Warp Chasm faults, with warm artesian spring resurgences (fed by subterranean seepage from fresh
       Lake Ostrukh) cascading northward into Region 99.
  2. Stalker Gate (`rmvstalkergate`) — Multi-branched, domain-warped meandering mountain & highland pass network
     connecting the Yuni Emirate, Stalker Range (Hub 01), Loom-Chasms, Mid Basin, and Siphon Pits:
     - 2D multi-octave Gaussian domain warping + Catmull-Rom spline curves + pinch-and-swell valley widths +
       14 dendritic side-canyons + multi-pass `T.weather` fluvial erosion (zero straight-line slot artifacts!)
     - Lake Vapora (+1,910 m, `WH`) in the central Gatehouse pull-apart amphitheater & Gate Tarn (+2,460 m, `WH`)
       in the northern high pass.
  3. High Rift (`rmvhighrift100`) — 5-zone propagating eastern tip of the Great Rift connecting Oidong Valley
     to the Siphon Pits:
     - Zone 1 (West): Opaline Sinter Staircase (+2,120..+2,720 m) + The Caldron Pool (+2,580 m, `WH`) opening
       seamlessly into Oidong Valley
     - Zone 2 (North): North Mirror Graben (+2,850..+3,180 m) with hematitic fault-mirrors, Lake Verdigris
       (+2,880 m, `WH`), and Lake Cinnabar (+3,120 m, `WH`)
     - Zone 3 (Center): The Dorsal Wedge median whaleback horst (+3,850..+4,250 m)
     - Zone 4 (South): South Fire-and-Ice Coulee (+3,050..+3,450 m)
     - Zone 5 (East): The Singing Gjar en-echelon tension-fissure swarm (+3,550..+4,250 m) joining Siphon Pits.
"""
import math
import numpy as np
from scipy import ndimage as nd
from . import geom as G, terrain as T


def _catmull_rom_chain(pts, n_per_seg=32):
    """Evaluate a smooth C1 Catmull-Rom spline through control points `pts` [(x, y, elev, half_width), ...]."""
    pts = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = [np.array(p, dtype=float) for p in pts[i - 1:i + 3]]
        for k in range(n_per_seg):
            t = k / float(n_per_seg)
            t2 = t * t
            t3 = t2 * t
            val = 0.5 * (
                (2.0 * p1)
                + (-p0 + p2) * t
                + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2
                + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3
            )
            out.append(val)
    out.append(np.array(pts[-2], dtype=float))
    return np.array(out, dtype=float)


def _eval_warped_pass_network(px_w, py_w, pass_chains, pinch_noise):
    """Compute smooth minimum distance, target valley floor elevation, and valley carving weight across a list of
    Catmull-Rom pass chains evaluated in domain-warped coordinates `(px_w, py_w)`."""
    VH, VW = px_w.shape
    w_pass_tot = np.zeros((VH, VW), dtype=float)
    h_pass_num = np.zeros((VH, VW), dtype=float)
    h_pass_den = np.full((VH, VW), 1e-9, dtype=float)
    d_norm_min = np.full((VH, VW), 99.0, dtype=float)

    for idx_c, chain in enumerate(pass_chains):
        samples = _catmull_rom_chain(chain, n_per_seg=24)
        # Compute distance to each spline sample on the height grid
        d2_min = np.full((VH, VW), 1e12, dtype=float)
        el_near = np.zeros((VH, VW), dtype=float)
        hw_near = np.ones((VH, VW), dtype=float)
        s_near = np.zeros((VH, VW), dtype=float)

        total_len = float(len(samples))
        for si, (sx, sy, sel, shw) in enumerate(samples):
            d2 = (px_w - sx) ** 2 + (py_w - sy) ** 2
            better = d2 < d2_min
            d2_min = np.where(better, d2, d2_min)
            el_near = np.where(better, sel, el_near)
            hw_near = np.where(better, shw, hw_near)
            s_near = np.where(better, si / total_len, s_near)

        dist_px = np.sqrt(d2_min)
        # Organic pinch-and-swell width modulation along the valley so it never has constant width
        width_mod = (
            1.0
            + 0.24 * np.sin(s_near * 5.0 * math.pi + idx_c * 1.7)
            + 0.16 * np.cos(s_near * 9.0 * math.pi - idx_c * 0.9)
            + 0.18 * pinch_noise
        )
        hw_eff = hw_near * np.clip(width_mod, 0.62, 1.48)
        d_norm = dist_px / np.maximum(hw_eff, 1.0)
        d_norm_min = np.minimum(d_norm_min, d_norm)

        # U-to-V valley cross-section: flat/concave inner floor (d_norm < 0.42), graded talus walls (0.42..1.35)
        w_inner = 1.0 - G.sstep(0.0, 0.48, d_norm)
        w_wall = 1.0 - G.sstep(0.42, 1.38, d_norm)
        w_val = 0.62 * w_wall + 0.38 * w_inner

        # Parabolic talus rise from the thalweg toward the valley walls
        h_local = el_near + 260.0 * np.clip(d_norm, 0.0, 1.5) ** 1.75
        w_pass_tot = 1.0 - (1.0 - w_pass_tot) * (1.0 - w_val)

        weight = np.exp(-((d_norm / 0.85) ** 2)) + 1e-6
        h_pass_num += h_local * weight
        h_pass_den += weight

    h_pass_floor = h_pass_num / h_pass_den
    return w_pass_tot, h_pass_floor, d_norm_min


def build_mid_basin_terrain(px, py, rs, x_tect, chasm_depth_map, scarp_u):
    """Build the interior target elevation and breached maar-diatreme masks for Mid Basin (`rmvmidbasin101`),
    bridging seamlessly between Siphon Pits in the south (`py ~ 1060..1101`) and Loom-Chasms in the north (`py ~ 857..965`).
    """
    VH, VW = px.shape

    # 1. North-to-South Hinge Coordinate `v_hinge` (0.0 at Region 99 southern border, 1.0 at Siphon Pits northern border)
    hinge_warp = (
        9.5 * np.sin((px - 1340.0) * 0.048 + 0.6)
        + 5.5 * np.cos((px - 1340.0) * 0.092 - 1.2)
    )
    y_north_line = 865.0 + 82.0 * G.sstep(1225.0, 1395.0, px) + hinge_warp
    y_south_line = 1058.0 + 38.0 * G.sstep(1250.0, 1425.0, px) + 0.6 * hinge_warp
    v_hinge = np.clip((py - y_north_line) / np.maximum(18.0, y_south_line - y_north_line), 0.0, 1.0)

    # 2. Western Loess-and-Tuff Corridor (`px ~ 1204..1305`):
    # Smoothly joins Ostrukh Terraces (+1,880..+2,220 m in the south) with Weavers' Cradle (+2,020..+2,380 m in the north)
    # across a gently stepped, wind-sculpted loess bench with meandering stream swales.
    loess_swales = (
        38.0 * np.sin((py - 960.0) * 0.072 + (px - 1245.0) * 0.055)
        + 24.0 * np.cos((py - 960.0) * 0.135 - (px - 1245.0) * 0.085)
    )
    h_west_corridor = (
        2140.0
        - 130.0 * np.sin(v_hinge * math.pi)  # gentle saddle at +2,010 m in central-west Mid Basin
        + 260.0 * (1.0 - G.sstep(1208.0, 1265.0, px))
        + loess_swales
    )

    # 3. Central & Eastern Faulted Basalt Hinge-Ramp (`px ~ 1295..1485`):
    # Steps down northward from the Siphon Pits flood-basalt plateau (+4,320 m at v_hinge=1)
    # across 3 arcuate en-echelon faulted basalt relay benches (+3,450 m -> +2,550 m -> +1,850 m)
    # down into the Loom-Chasms Shuttle Mesas (+1,480..+1,680 m at v_hinge=0).
    bench_step = (
        0.28 * G.sstep(0.08, 0.28, v_hinge)
        + 0.34 * G.sstep(0.36, 0.60, v_hinge)
        + 0.38 * G.sstep(0.68, 0.94, v_hinge)
    )
    fault_cuesta_ridges = (
        85.0 * (np.sin(v_hinge * 3.0 * math.pi - 0.4) ** 3) * (1.0 - G.sstep(0.88, 1.0, v_hinge))
        + 45.0 * np.sin((px - 1370.0) * 0.065 + (py - 1010.0) * 0.052)
    )
    h_east_ramp = 1560.0 + 2760.0 * bench_step + fault_cuesta_ridges

    # Transition from the Western Loess Corridor to the Central/Eastern Basalt Hinge-Ramp along the northward
    # continuation of Siphon Pits' Central Dividing Fault (`scarp_u`, which curves NNE into Region 99's Fluted Monocline)
    w_east_hinge = G.sstep(-12.0, 18.0, scarp_u)
    h_mb_base = h_west_corridor * (1.0 - w_east_hinge) + h_east_ramp * w_east_hinge

    # 4. Southward-Propagating Loom Warp Chasms & Silicified Loess Needle Gorges:
    # Let the Warp Chasms from Region 99 propagate southward into the northern and central benches of Mid Basin!
    w_chasm_prop = chasm_depth_map * (1.0 - G.sstep(0.25, 0.82, v_hinge)) * G.sstep(-6.0, 14.0, scarp_u)
    h_chasm_prop_floor = 460.0 + 1350.0 * (v_hinge ** 1.15)
    h_mb_base = h_mb_base * (1.0 - 0.82 * w_chasm_prop) + h_chasm_prop_floor * (0.82 * w_chasm_prop)

    # 5. 6 Horseshoe Breached Maar-Diatreme Amphitheaters ("The Siphon-Chasm Intersections"):
    # Circular phreatomagmatic explosion craters whose northern walls have been cleaved open by NNE-SSW rift gorges!
    # Format: (xc, yc, rx_km, ry_km, breach_az_deg, floor_elev_m, has_spring_pool)
    breached_maars = [
        (1312.0, 1018.0, 21.0, 17.5, -18.0, 2030.0, True),   # Flagship Siphon-Breach Pool (fed by Ostrukh seepage!)
        (1354.0, 1036.0, 22.5, 18.0,  14.0, 2180.0, False),  # Central Chain-Graben Breached Caldron
        (1388.0, 1014.0, 19.5, 16.0, -12.0, 1960.0, False),  # North-Central Breached Amphitheater
        (1424.0, 1042.0, 21.0, 17.0,  16.0, 2290.0, False),  # East-Central Breached Diatreme
        (1454.0, 1018.0, 16.5, 13.5, -15.0, 2380.0, False),  # Eastern Rim Breached Diatreme
        (1338.0,  982.0, 16.0, 13.0,  12.0, 1780.0, False),  # Spindle-Mouth Lower Breached Maar
    ]

    jag1 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 1.6)
    jag1 = jag1 / (np.std(jag1) + 1e-9) * 0.11

    mb_pit_weight = np.zeros((VH, VW), dtype=float)
    mb_pit_floor = h_mb_base.copy()
    mb_tuff_ring = np.zeros((VH, VW), dtype=float)
    mb_pool_mask = np.zeros((VH, VW), dtype=bool)
    mb_pool_lev = np.full((VH, VW), np.nan, dtype=float)

    for idx_m, (xc, yc, rx, ry, br_deg, fl_m, has_pool) in enumerate(breached_maars):
        dx_m = (px - xc) * 2.0
        dy_m = (py - yc) * 2.0
        # Breach direction points roughly North / NNW (`br_deg` from North, where North is -dy)
        ang_b = math.radians(br_deg)
        # `u_br` is distance along the northward breach axis (positive northward); `v_br` is perpendicular width
        u_br = -dy_m * math.cos(ang_b) + dx_m * math.sin(ang_b)
        v_br = dx_m * math.cos(ang_b) + dy_m * math.sin(ang_b)
        theta_m = np.arctan2(v_br, u_br)
        lobe = 1.0 + 0.09 * np.cos(2.0 * theta_m + idx_m) + 0.06 * np.sin(3.0 * theta_m) + jag1
        r_norm = np.hypot(u_br / ry, v_br / rx) * np.clip(lobe, 0.74, 1.28)

        w_crater = 1.0 - G.sstep(0.52, 1.02, r_norm)

        # Cleave the northern rim (`u_br > 0`) with a sinuous outlet gorge extending 32 km northward!
        gorge_bend = 3.2 * np.sin(u_br * 0.14 + idx_m * 1.1)
        d_gorge = np.abs(v_br - gorge_bend) / (rx * 0.34)
        w_breach_gorge = (
            (1.0 - G.sstep(0.38, 1.15, d_gorge))
            * G.sstep(-4.0, 6.0, u_br)
            * (1.0 - G.sstep(ry * 1.05, ry * 1.95, u_br))
        )
        w_combined = np.maximum(w_crater, w_breach_gorge)
        mb_pit_weight = np.maximum(mb_pit_weight, w_combined)

        # Floor slopes gently northward through the breached throat into the Loom-Chasms
        fl_local = fl_m - 120.0 * np.clip(u_br / (ry * 1.8), -0.3, 1.0) + 45.0 * np.clip(r_norm / 0.7, 0.0, 1.2) ** 2
        mb_pit_floor = np.where(w_combined > 0.03, np.minimum(mb_pit_floor, fl_local), mb_pit_floor)

        # Horseshoe tuff rampart: strong on the south/east/west walls, breached (zero) in the northern throat!
        breach_gap = 1.0 - 0.92 * G.sstep(0.0, 8.0, u_br) * (1.0 - G.sstep(0.45, 1.35, d_gorge))
        tuff = 145.0 * np.exp(-((r_norm - 1.06) / 0.22) ** 2) * breach_gap
        mb_tuff_ring = np.maximum(mb_tuff_ring, tuff)

        if has_pool:
            p_m = (r_norm <= 0.36)
            mb_pool_mask |= p_m
            mb_pool_lev = np.where(p_m, fl_m + 10.0, mb_pool_lev)
            mb_pit_floor = np.where(p_m, fl_m - 8.0 + 16.0 * (r_norm / 0.36), mb_pit_floor)

    rock_tex = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 1.1)
    rock_tex = rock_tex / (np.std(rock_tex) + 1e-9) * 24.0

    h_mb_interior = (
        (h_mb_base + mb_tuff_ring + rock_tex) * (1.0 - mb_pit_weight)
        + (mb_pit_floor + 0.25 * rock_tex) * mb_pit_weight
    )
    return h_mb_interior, mb_pit_weight, mb_tuff_ring, mb_pool_mask, mb_pool_lev, v_hinge


def build_stalker_gate_terrain(px, py, Eo, mask_sg_h, rs):
    """Build the interior elevation and lakes for Stalker Gate (`rmvstalkergate`) and the adjoining Hub 01 high valley:
    - Multi-octave 2D domain-warped meandering mountain and highland passes connecting Yuni Emirate, Stalker Range,
      Loom-Chasms, Mid Basin, and Siphon Pits
    - Weathered fault-block horst massifs (+4,400..+6,800 m) between the passes
    - Lake Vapora (+1,910 m) in the central Gatehouse Pull-Apart basin and Gate Tarn (+2,460 m) in the North Col.
    """
    VH, VW = px.shape

    # 1. Multi-octave 2D spatial domain-warping field so every pass and fault block bends & meanders organically!
    wx1 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 7.5)
    wy1 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 7.5)
    wx2 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 3.2)
    wy2 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 3.2)
    wx3 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 1.4)
    wy3 = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 1.4)

    warp_x = (
        wx1 / (np.std(wx1) + 1e-9) * 9.5
        + wx2 / (np.std(wx2) + 1e-9) * 4.8
        + wx3 / (np.std(wx3) + 1e-9) * 2.1
        + 6.5 * np.sin((py - 900.0) * 0.052 + 0.4)
    )
    warp_y = (
        wy1 / (np.std(wy1) + 1e-9) * 9.5
        + wy2 / (np.std(wy2) + 1e-9) * 4.8
        + wy3 / (np.std(wy3) + 1e-9) * 2.1
        + 6.5 * np.cos((px - 1160.0) * 0.055 - 0.7)
    )
    px_w = px + warp_x
    py_w = py + warp_y

    pinch_n = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 2.4)
    pinch_n = pinch_n / (np.std(pinch_n) + 1e-9)

    # 2. Define the curved Catmull-Rom pass chains [(x_px, y_px, floor_elev_m, half_width_px), ...]
    pass_chains = [
        # Pass 1A (NW): The Krikki Winding Gorge (Yuni / E. Badlands <-> Gatehouse Pull-Apart & Lake Vapora)
        [
            (1058.0, 766.0, 1660.0, 13.0),
            (1082.0, 788.0, 1760.0, 10.5),
            (1112.0, 816.0, 1980.0,  9.5),
            (1124.0, 856.0, 2060.0, 10.0),
            (1148.0, 898.0, 1915.0, 16.5),
            (1156.0, 916.0, 1915.0, 17.5),
        ],
        # Pass 1B (North): The Badlands High Col & Gate Tarn (Northern Badlands <-> Northern Weavers' Cradle)
        [
            (1118.0, 778.0, 2240.0,  9.0),
            (1146.0, 804.0, 2480.0,  8.5),
            (1172.0, 816.0, 2455.0, 11.5),  # Gate Tarn pocket (+2,460 m)
            (1204.0, 818.0, 2340.0,  9.5),
            (1238.0, 812.0, 2180.0, 13.5),
        ],
        # Pass 2A (NE): Weavers' Breach (Gatehouse Basin <-> Weavers' Cradle in Region 99)
        [
            (1152.0, 904.0, 1915.0, 16.0),
            (1176.0, 882.0, 2040.0, 11.0),
            (1192.0, 852.0, 2170.0, 10.0),
            (1218.0, 836.0, 2140.0, 12.0),
            (1252.0, 828.0, 2080.0, 16.0),
        ],
        # Pass 2B (East-Central): Spindle Col (Gatehouse Basin <-> Southern Weavers' Cradle / NW Mid Basin)
        [
            (1156.0, 916.0, 1930.0, 14.0),
            (1188.0, 912.0, 2160.0,  9.5),
            (1216.0, 892.0, 2220.0, 10.5),
            (1248.0, 884.0, 2120.0, 14.5),
        ],
        # Pass 3A (SE): The Ostrukh Meander (Gatehouse Basin <-> Ostrukh Terraces & Lake Ostrukh in Siphon Pits)
        [
            (1154.0, 918.0, 1925.0, 15.0),
            (1168.0, 956.0, 2080.0, 11.0),
            (1164.0, 994.0, 2190.0, 10.5),
            (1186.0, 1032.0, 2270.0, 11.0),
            (1204.0, 1064.0, 2210.0, 12.0),
            (1228.0, 1094.0, 2040.0, 14.0),
            (1248.0, 1124.0, 1875.0, 17.0),
        ],
        # Pass 3B (ESE): The Mid-Basin Loess Gorge (Branches off Ostrukh Meander into Mid Basin's Western Corridor)
        [
            (1168.0, 976.0, 2140.0, 10.5),
            (1196.0, 992.0, 2240.0,  9.5),
            (1222.0, 982.0, 2180.0, 11.5),
            (1252.0, 972.0, 2090.0, 15.0),
        ],
        # Pass 3C (South-SE): Lower Ostrukh-Mid Basin Connector
        [
            (1192.0, 1044.0, 2250.0, 10.0),
            (1224.0, 1042.0, 2180.0, 11.5),
            (1258.0, 1032.0, 2080.0, 14.5),
        ],
        # Pass 4A (SW): The Stalker Coulee (Gatehouse Basin <-> Hub 01 High Valley at [1072, 1081])
        [
            (1148.0, 918.0, 1950.0, 14.0),
            (1126.0, 956.0, 2340.0, 10.0),
            (1124.0, 998.0, 2660.0,  9.5),
            (1104.0, 1038.0, 2920.0, 10.5),
            (1084.0, 1066.0, 3080.0, 13.0),
            (1068.0, 1082.0, 3120.0, 18.0),
        ],
        # Pass 4B (West): The West Highland Saddle (Gatehouse Basin <-> Northern Stalker Range)
        [
            (1144.0, 898.0, 1980.0, 12.0),
            (1114.0, 888.0, 2520.0,  9.0),
            (1090.0, 864.0, 2880.0,  8.5),
            (1072.0, 838.0, 3150.0, 10.0),
        ],
        # Branching dendritic side-coulees & cirques draining the flanking horst blocks into the passes
        [(1142.0, 792.0, 3850.0, 5.5), (1126.0, 822.0, 2350.0, 7.0), (1120.0, 848.0, 2050.0, 8.0)],
        [(1202.0, 868.0, 3650.0, 5.5), (1182.0, 878.0, 2450.0, 6.5), (1168.0, 892.0, 2020.0, 8.0)],
        [(1206.0, 946.0, 3750.0, 5.5), (1186.0, 952.0, 2550.0, 6.5), (1168.0, 958.0, 2120.0, 8.0)],
        [(1148.0, 1036.0, 3950.0, 6.0), (1168.0, 1032.0, 2650.0, 7.0), (1186.0, 1032.0, 2270.0, 8.5)],
        [(1098.0, 932.0, 3800.0, 5.5), (1118.0, 944.0, 2680.0, 6.5), (1132.0, 952.0, 2340.0, 8.0)],
    ]

    w_pass_tot, h_pass_floor, d_norm_min = _eval_warped_pass_network(px_w, py_w, pass_chains, pinch_n)

    # 3. Sculpt the Flanking Fault-Block Horst Massifs between the passes:
    # Retain real ridge-and-spur structure from `Eo` but lower the uncarved +10..14 km spikes to +4,450..+6,650 m
    Eo_low = nd.gaussian_filter(Eo, sigma=5.5)
    Eo_detail = Eo - Eo_low
    ridge_tex = (
        280.0 * np.sin(px_w * 0.085 + py_w * 0.065)
        + 190.0 * np.cos(px_w * 0.14 - py_w * 0.11)
        + 0.55 * Eo_detail
    )
    h_horst_massifs = np.clip(4550.0 + 0.24 * (Eo_low - 4500.0) + ridge_tex, 3950.0, 6850.0)

    h_sg_interior = h_horst_massifs * (1.0 - w_pass_tot) + h_pass_floor * w_pass_tot

    # 4. Carve Lake Vapora (+1,910.0 m) in the central Gatehouse Pull-Apart amphitheater (`px [1152, 908]`)
    # and Gate Tarn (+2,460.0 m) in the northern high pass (`px [1172, 816]`)
    VAPORA_PX = (1152.0, 908.0)
    VAPORA_LEV = 1910.0
    dx_v = (px - VAPORA_PX[0]) * 2.0 + 0.35 * warp_x
    dy_v = (py - VAPORA_PX[1]) * 2.0 + 0.35 * warp_y
    r_vap_km = np.hypot(dx_v * 1.15, dy_v * 0.82) + 1.8 * np.sin(dy_v * 0.18 + 0.5)
    w_vap_pool = 1.0 - G.sstep(6.8, 12.5, r_vap_km)
    h_vap_bed = (VAPORA_LEV - 18.0) + 16.5 * G.sstep(0.0, 11.2, r_vap_km)
    h_sg_interior = h_sg_interior * (1.0 - w_vap_pool) + h_vap_bed * w_vap_pool

    TARN_PX = (1172.0, 816.0)
    TARN_LEV = 2460.0
    r_tarn_km = np.hypot((px - TARN_PX[0]) * 2.0, (py - TARN_PX[1]) * 2.0)
    w_tarn_pool = 1.0 - G.sstep(3.8, 7.5, r_tarn_km)
    h_tarn_bed = (TARN_LEV - 12.0) + 11.0 * G.sstep(0.0, 6.8, r_tarn_km)
    h_sg_interior = h_sg_interior * (1.0 - w_tarn_pool) + h_tarn_bed * w_tarn_pool

    # Hub 01 circular high valley pocket in Stalker Range around [1072, 1081]
    r_hub_km = np.hypot((px - 1072.0) * 2.0, (py - 1081.0) * 2.0)
    w_hub_valley = 1.0 - G.sstep(18.0, 42.0, r_hub_km)

    return (
        h_sg_interior, w_pass_tot, d_norm_min,
        r_vap_km, VAPORA_LEV, r_tarn_km, TARN_LEV, w_hub_valley
    )


def build_high_rift_terrain(px, py, Eo, mask_hr_h, rs):
    """Build the 5-zone propagating rift staircase for High Rift (`rmvhighrift100`):
    - Zone 1 (West, X 1022..1115): Opaline Sinter Staircase (+2,120..+2,720 m) + The Caldron Pool (+2,580 m, `WH`)
    - Zone 2 (North-Center, X 1115..1255): North Mirror Graben (+2,850..+3,180 m) + Lake Verdigris (+2,880 m) & Lake Cinnabar (+3,120 m)
    - Zone 3 (Median Horst, X 1108..1245): The Dorsal Wedge whaleback horst (+3,850..+4,250 m)
    - Zone 4 (South-Center, X 1115..1255): South Fire-and-Ice Coulee (+3,050..+3,450 m)
    - Zone 5 (East, X 1255..1354): The Singing Gjar en-echelon tension-fissure swarm (+3,550..+4,250 m).
    """
    VH, VW = px.shape

    # Domain warp so the rift grabens, median horst, and tension fissures have organic, sinuous volcanic geometry
    wx = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 3.0)
    wy = nd.gaussian_filter(rs.normal(0.0, 1.0, (VH, VW)), 3.0)
    wx = wx / (np.std(wx) + 1e-9) * 3.8
    wy = wy / (np.std(wy) + 1e-9) * 2.6

    px_r = px + wx
    py_r = py + wy

    # Longitudinal rift coordinate `u_rift` from West Gate (1025 -> Oidong) to East Tip (1350 -> Siphon Pits)
    u_rift = np.clip((px_r - 1025.0) / 325.0, 0.0, 1.0)

    # Zone 1: West Opaline Sinter Staircase (`px 1022..1115`, 5 arcuate travertine rimstone steps +2,110 -> +2,740 m)
    u_sinter = np.clip((px_r - 1026.0) / 86.0, 0.0, 1.0)
    sinter_arc = u_sinter + 0.06 * np.cos((py_r - 1330.0) * 0.11)
    sinter_steps = (
        0.20 * G.sstep(0.02, 0.16, sinter_arc)
        + 0.20 * G.sstep(0.20, 0.34, sinter_arc)
        + 0.20 * G.sstep(0.38, 0.54, sinter_arc)
        + 0.20 * G.sstep(0.58, 0.74, sinter_arc)
        + 0.20 * G.sstep(0.78, 0.94, sinter_arc)
    )
    y_west_axis = 1328.0 + 5.0 * np.sin((px_r - 1030.0) * 0.06)
    d_west_y = np.abs(py_r - y_west_axis)
    h_zone1 = 2110.0 + 640.0 * sinter_steps + 280.0 * G.sstep(8.0, 26.0, d_west_y)

    # Zone 2 (North Mirror Graben), Zone 3 (Dorsal Wedge Median Horst), Zone 4 (South Fire-and-Ice Coulee)
    y_north_graben = 1305.0 + 3.5 * np.sin((px_r - 1120.0) * 0.055)
    y_horst_axis = 1329.0 + 4.0 * np.sin((px_r - 1130.0) * 0.048 + 0.8)
    y_south_graben = 1353.0 + 3.8 * np.cos((px_r - 1125.0) * 0.052)

    d_north = np.abs(py_r - y_north_graben)
    d_horst = np.abs(py_r - y_horst_axis)
    d_south = np.abs(py_r - y_south_graben)

    w_north_g = (1.0 - G.sstep(4.5, 14.5, d_north)) * G.sstep(1095.0, 1125.0, px_r) * (1.0 - G.sstep(1242.0, 1272.0, px_r))
    w_south_g = (1.0 - G.sstep(4.5, 14.5, d_south)) * G.sstep(1098.0, 1128.0, px_r) * (1.0 - G.sstep(1242.0, 1272.0, px_r))
    w_horst = (1.0 - G.sstep(5.5, 14.0, d_horst)) * G.sstep(1108.0, 1132.0, px_r) * (1.0 - G.sstep(1228.0, 1255.0, px_r))

    h_north_floor = 2860.0 + 320.0 * np.clip((px_r - 1115.0) / 135.0, 0.0, 1.0)
    h_south_floor = 3040.0 + 390.0 * np.clip((px_r - 1115.0) / 135.0, 0.0, 1.0)
    horst_crest_noise = 95.0 * np.sin(px_r * 0.12) * np.cos(py_r * 0.14)
    h_horst_top = 3980.0 + 180.0 * np.sin((px_r - 1120.0) / 120.0 * math.pi) + horst_crest_noise

    # Zone 5 (East Singing Gjar Tension-Fissure Swarm, `px 1250..1354`, climbing +3,520 -> +4,260 m into Siphon Pits)
    u_east = np.clip((px_r - 1245.0) / 105.0, 0.0, 1.0)
    h_east_plat = 3520.0 + 740.0 * (u_east ** 0.92) + 55.0 * np.sin(px_r * 0.09 + py_r * 0.08)

    # Carve 8 en-echelon NNE-SSW dilational tension fissures (The Singing Gjar) across Zone 5
    gjar_depth = np.zeros((VH, VW), dtype=float)
    for gx0 in (1258.0, 1271.0, 1284.0, 1297.0, 1309.0, 1321.0, 1333.0, 1344.0):
        g_trace = gx0 + (py_r - 1315.0) * 0.28 + 2.5 * np.sin((py_r - 1300.0) * 0.16 + gx0)
        d_g = np.abs(px_r - g_trace)
        w_g = (1.0 - G.sstep(1.1, 3.4, d_g)) * G.sstep(1286.0, 1296.0, py_r) * (1.0 - G.sstep(1332.0, 1348.0, py_r))
        gjar_depth = np.maximum(gjar_depth, w_g)

    h_zone5 = h_east_plat - 310.0 * gjar_depth

    # Combine longitudinal zones smoothly from West to East
    w_z1_to_mid = G.sstep(1098.0, 1128.0, px_r)
    w_mid_to_z5 = G.sstep(1238.0, 1268.0, px_r)

    h_mid_base = 3380.0 + 220.0 * u_rift
    h_mid = (
        h_mid_base * (1.0 - np.maximum(w_north_g, w_south_g))
        + h_north_floor * w_north_g
        + h_south_floor * w_south_g
    )
    h_mid = h_mid * (1.0 - w_horst) + h_horst_top * w_horst

    h_hr_interior = h_zone1 * (1.0 - w_z1_to_mid) + h_mid * w_z1_to_mid
    h_hr_interior = h_hr_interior * (1.0 - w_mid_to_z5) + h_zone5 * w_mid_to_z5

    # 3 Rift-Step Highland Lakes (`WH`):
    # 1. The Caldron Pool (`[1082, 1332]`, +2,580.0 m)
    # 2. Lake Verdigris (`[1158, 1306]`, +2,880.0 m)
    # 3. Lake Cinnabar (`[1222, 1304]`, +3,120.0 m)
    CALDRON_LEV = 2580.0
    r_cald_km = np.hypot((px - 1082.0) * 2.0, (py - 1331.0) * 2.4)
    w_cald = 1.0 - G.sstep(5.0, 9.5, r_cald_km)
    h_hr_interior = h_hr_interior * (1.0 - w_cald) + ((CALDRON_LEV - 14.0) + 12.5 * G.sstep(0.0, 8.5, r_cald_km)) * w_cald

    VERDIGRIS_LEV = 2880.0
    r_verd_km = np.hypot((px - 1158.0) * 1.4, (py - 1305.5) * 2.6)
    w_verd = 1.0 - G.sstep(7.5, 13.5, r_verd_km)
    h_hr_interior = h_hr_interior * (1.0 - w_verd) + ((VERDIGRIS_LEV - 18.0) + 16.5 * G.sstep(0.0, 12.2, r_verd_km)) * w_verd

    CINNABAR_LEV = 3120.0
    r_cinn_km = np.hypot((px - 1220.0) * 1.6, (py - 1304.5) * 2.6)
    w_cinn = 1.0 - G.sstep(5.5, 10.5, r_cinn_km)
    h_hr_interior = h_hr_interior * (1.0 - w_cinn) + ((CINNABAR_LEV - 15.0) + 13.5 * G.sstep(0.0, 9.5, r_cinn_km)) * w_cinn

    return (
        h_hr_interior, w_north_g, w_south_g, w_horst, gjar_depth,
        r_cald_km, CALDRON_LEV, r_verd_km, VERDIGRIS_LEV, r_cinn_km, CINNABAR_LEV
    )
