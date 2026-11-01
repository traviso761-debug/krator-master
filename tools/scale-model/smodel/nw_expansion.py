"""Spike-Free Contour-Interpolated N/W Canvas Expansion (`1549x1393` -> `1821x1723` at `2 km/cell`):
Treats the painted color zones in `expansion_ref.jpg` (`Ocean -> Tan -> Mid-Green -> Dark-Green -> White -> Grey`)
as **continuous topographic contour intervals (isohypses)** matching the map's exact hypsometric bands, and treats
the light-blue river markings (`is_river_paint`) as **local valley thalweg minima**:

  1. Continuous Two-Sided Isohypse & Thalweg Harmonic Interpolation (`solve_contour_surface`):
     - Shoreline contour (`Ocean / Tan`): `0.0 m`
     - `Tan -> Mid-Green` contour line: `600.0 m`
     - `Mid-Green -> Dark-Green` contour line: `1,480.0 m` (matching Eastern Highland Lake at `+1,460.0 m`)
     - `Dark-Green -> White` contour line: `3,350.0 m`
     - `White -> Light/Dark-Grey` contour line: `7,250.0 m` (exact transition from white snow to grey/rust airless rim)
     - `Grey` airless outer rim & high northern massif (`tier 5` & `tier 6`): `7,250 -> 9,200..11,200 m`
  2. Exposed Mid-Ocean Spreading Ridge in The Arch (`build_arch_midocean_ridge`):
     - Sculpted with a clear double line of high rift-shoulder horst ridges (`+750..+2,250 m`) separated by a
       lowered axial rift graben / drowned median trough (`-65..+180 m`) and a rich tectonic archipelago in the
       western Arch and Crook entrance.
  3. Two River Systems Draining to the Medium-Blue Double Delta:
     - Main Southern Ria River (`id: 9101`) draining WSW into the southern apex of the medium-blue Double Delta.
     - Second River System (`id: 9103`, `9104`, `9107`) draining from The Arch and the northern massif valley into
       the northern apex of the medium-blue Double Delta.
  4. Trans-Boundary NE Outland Gate (`rmvoutlandpass`, with through-flowing river from North Outland Lake `+1,734 m`
     to Eastern Highland Lake `+1,460 m`), SW Crook–Rift Connector (`rmvcopperglacier`), Western Boundary Cordillera
     (`X = 0..68, Y = 470..1120`), and S Outlands–Loom-Chasms Pass (`X = 1665..1755, Y = 875..1060`).
"""
import math
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from . import geom as G, terrain as T


DX_F = 272
DY_F = 330
OLD_OH, OLD_OW = 1393, 1549
NEW_OH, NEW_OW = 1723, 1821


def _catmull_rom_2d(pts, n_per_seg=28):
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


def corridor_distance_and_target(X, Y, ctrl_pts, warp_x=0.0, warp_y=0.0):
    """Evaluate distance `d`, interpolated target elevation `z`, and half-width `hw` along a polyline
    of `(x, y, z, hw)` control points over `(X, Y)`."""
    Xw = X + warp_x
    Yw = Y + warp_y
    min_d = np.full(X.shape, 1e12, dtype=float)
    best_z = np.zeros(X.shape, dtype=float)
    best_hw = np.ones(X.shape, dtype=float)
    for i in range(len(ctrl_pts) - 1):
        x0, y0, z0, hw0 = ctrl_pts[i]
        x1, y1, z1, hw1 = ctrl_pts[i + 1]
        vx, vy = x1 - x0, y1 - y0
        l2 = max(vx * vx + vy * vy, 1e-9)
        t = np.clip(((Xw - x0) * vx + (Yw - y0) * vy) / l2, 0.0, 1.0)
        px_i = x0 + t * vx
        py_i = y0 + t * vy
        d = np.hypot(Xw - px_i, Yw - py_i)
        better = d < min_d
        min_d = np.where(better, d, min_d)
        best_z = np.where(better, z0 + t * (z1 - z0), best_z)
        best_hw = np.where(better, hw0 + t * (hw1 - hw0), best_hw)
    return min_d, best_z, best_hw


def classify_paint_reference(ref_path, whas0_old, Eo_old=None, wlev0_old=None):
    """Project `expansion_ref.jpg` onto the `1821x1723` full-resolution grid, erase the red boundary
    marker line and 2-px outer transform margin before Voronoi contour classification, and extract all
    contour tiers, light-blue river thalwegs, medium-blue delta channels, and trans-boundary masks."""
    ref_im = Image.open(ref_path).convert('RGB')
    scale_x = float(OLD_OW) / (1024.0 - 153.0)  # 1.7784156 px / im_px
    x0_im = 153.0 - (DX_F / scale_x)
    y0_im = 185.0 - (DY_F / scale_x)
    x1_im = x0_im + (NEW_OW / scale_x)
    y1_im = y0_im + (NEW_OH / scale_x)

    ref_near = ref_im.transform(
        (NEW_OW, NEW_OH),
        Image.Transform.EXTENT,
        (x0_im, y0_im, x1_im, y1_im),
        resample=Image.Resampling.NEAREST,
    )
    arr = np.array(ref_near, dtype=float)
    Y, X = np.indices((NEW_OH, NEW_OW))

    # 0. Clean only the 2-pixel top out-of-bounds transform row (`Y < 2`, where `y0_im = -0.56`)
    # and the bottom-left unpainted Paint strip (`Y >= 1555, X < 285`), preserving the user's painted
    # northern Arch peninsula (`Y = 2..36`) and western boundary mountains (`X = 0..38, Y = 480..1120`)!
    arr[:2, :, :] = arr[2:3, :, :]
    arr[:, :2, :] = arr[:, 2:3, :]
    arr[1555:, :285, :] = arr[1540:1541, :285, :]

    # 1. Identify Red Seamount Swarm (`X = 140..220, Y = 285..368`) BEFORE erasing the red boundary line!
    is_seamount = (
        (arr[..., 0] > 185.0) & (arr[..., 1] < 70.0) & (arr[..., 2] < 70.0)
        & (X >= 140) & (X <= 220) & (Y >= 285) & (Y <= 368)
    )
    is_seamount = nd.binary_closing(is_seamount, iterations=3)

    # 2. Erase the entire red boundary marker corridor (`X ~ 272, Y >= 320` and `Y ~ 330, X >= 260`)
    # including its 4-6 px JPEG compression halo so zero red/grey fringe pixels can ever become false islands or spikes!
    red_corridor = (
        (((np.abs(X - DX_F) <= 8) & (Y >= DY_F - 10)) | ((np.abs(Y - DY_F) <= 8) & (X >= DX_F - 10)))
        & ~is_seamount
    )
    red_tint = (
        (arr[..., 0] > 125.0) & (arr[..., 0] > arr[..., 1] + 18.0) & (arr[..., 1] < 125.0)
        & ~is_seamount
        & (((np.abs(X - DX_F) <= 16) & (Y >= DY_F - 16)) | ((np.abs(Y - DY_F) <= 16) & (X >= DX_F - 16)))
    )
    is_red_line = nd.binary_dilation(red_corridor | red_tint, iterations=2) & ~is_seamount
    if is_red_line.any():
        _, (ry, rx) = nd.distance_transform_edt(is_red_line, return_indices=True)
        for c in range(3):
            arr[..., c] = np.where(is_red_line, arr[ry, rx, c], arr[..., c])

    # 3. Arachnoid Orange Network (`X = 845..1345, Y = 180..755` — straddling `Y = 330` across N, E, and SW Korona!)
    is_arach_raw = (
        (arr[..., 0] > 195.0) & (arr[..., 1] >= 80.0) & (arr[..., 1] <= 175.0) & (arr[..., 2] < 85.0)
        & (X >= 845) & (X <= 1345) & (Y >= 180) & (Y <= 755)
    )
    is_arach = nd.binary_closing(is_arach_raw, iterations=2)

    # 4. True Light-Blue River & Drainage Thalweg Markings (`[153, 217, 234]`, where B > R + 42 and G > R + 28)
    is_river_paint = (
        (arr[..., 2] > arr[..., 0] + 42.0)
        & (arr[..., 1] > arr[..., 0] + 28.0)
        & (arr[..., 0] > 75.0)
        & ((Y < 345) | (X < 280))
    )
    is_river_paint = nd.binary_closing(is_river_paint, iterations=2)

    # 5. Eastern Highland Lake (`X = 1230..1360, Y = 172..242`)
    # Dilate by 2 px so the lake shoreline cleanly meets the Ria headwaters, Web-Cleaver Gorge outlet, and Outland Gate River!
    is_high_lake = (
        ((arr[..., 2] > arr[..., 0] + 35.0) & (arr[..., 2] > 135.0))
        & (X >= 1230) & (X <= 1360) & (Y >= 172) & (Y <= 242)
        & ~is_river_paint
    )
    is_high_lake = nd.binary_closing(is_high_lake, iterations=3)
    is_high_lake = nd.binary_fill_holes(is_high_lake)
    is_high_lake = nd.binary_dilation(is_high_lake, iterations=2)

    # 6. Great Double Delta Medium-Blue Distributary Zone (`X = 515..618, Y = 102..206`)
    # Extract the exact medium-blue / teal delta channels painted in `expansion_ref.jpg`
    is_delta_channel = (
        (
            ((arr[..., 2] > arr[..., 0] + 22.0) & (arr[..., 1] > 105.0) & (arr[..., 2] > 125.0))
            | ((arr[..., 2] > 155.0) & (arr[..., 0] < 95.0) & (X >= 542) & (Y >= 112) & (Y <= 200))
        )
        & (X >= 516) & (X <= 616) & (Y >= 102) & (Y <= 204)
    )

    # Inpaint over foreground markings (`is_arach`, `is_river_paint`, `is_seamount`, `is_high_lake`, `is_delta_channel`)
    # so the underlying contour bands (`Tan`, `Mid-Green`, `Dark-Green`, `White`, `Grey`) are 100% continuous!
    fg_marks = is_arach | is_river_paint | is_seamount | is_high_lake | is_delta_channel
    arr_bg = arr.copy()
    if fg_marks.any():
        _, (by, bx) = nd.distance_transform_edt(fg_marks, return_indices=True)
        for c in range(3):
            arr_bg[..., c] = np.where(fg_marks, arr_bg[by, bx, c], arr_bg[..., c])

    # 7. Voronoi classification of the 7 contour intervals:
    centroids = np.array([
        [63.0,   72.0, 204.0],  # 0: Ocean (< 0 m)
        [178.0, 181.0,  90.0],  # 1: Tan contour band (0 .. 600 m)
        [35.0,  177.0,  77.0],  # 2: Mid-Green contour band (600 .. 1,480 m)
        [46.0,   94.0,  42.0],  # 3: Dark-Green contour band (1,480 .. 3,350 m)
        [252.0, 252.0, 252.0],  # 4: White alpine snow contour band (3,350 .. 7,250 m)
        [195.0, 195.0, 195.0],  # 5: Light-Grey airless outer rim contour band (> 7,250 m)
        [127.0, 127.0, 127.0],  # 6: Dark-Grey high northern massif (> 7,250 m)
    ], dtype=float)

    diff = arr_bg[:, :, None, :] - centroids[None, None, :, :]
    dist2 = (diff ** 2).sum(axis=-1)

    in_dkgrey_box = (X >= 520) & (X <= 1120) & (Y < 145)
    dist2[:, :, 6] = np.where(in_dkgrey_box, dist2[:, :, 6], 1e12)

    # Prevent anti-aliased Ocean Blue `[63, 72, 204]` + Coastal Tan `[178, 181, 90]` shoreline pixels
    # (whose 50/50 RGB blend is achromatic grey `[120, 126, 147]..[195, 195, 195]`) from ever matching
    # Tier 4 (`White`, 3,350..7,250 m) or Tier 5 (`Light-Grey`, > 7,250 m) and creating coastal porcupine spikes!
    raw_blue_sea = (arr_bg[..., 2] > arr_bg[..., 0] + 32.0) & (arr_bg[..., 2] > 130.0) & ~is_high_lake
    near_blue_sea = nd.binary_dilation(raw_blue_sea, iterations=7)
    dist2[:, :, 4] = np.where((arr_bg.min(axis=-1) > 216.0) & ~near_blue_sea, dist2[:, :, 4], 1e12)

    # Allow Light-Grey (`tier 5`, `[195, 195, 195]`) in the expansion area (`Y < 345` or `X < 285`)
    # only where pixels are genuinely bright grey (`min > 160`) and away from ocean shorelines!
    in_ltgrey_valid = ((Y < 345) | (X < 285)) & ~in_dkgrey_box & (arr_bg.min(axis=-1) > 160.0) & ~near_blue_sea
    dist2[:, :, 5] = np.where(in_ltgrey_valid, dist2[:, :, 5], 1e12)

    in_ocean_box = ((X < 780) & (Y < 720)) | (Y < 95)
    dist2[:, :, 0] = np.where(in_ocean_box & ~is_high_lake, dist2[:, :, 0], 1e12)

    tier_id_raw = np.argmin(dist2, axis=-1)
    # Preserve painted island pixels inside The Arch (`X < 245` or `Y < 305` outside `is_red_line`),
    # while never turning red-line fringe in the NW inner sea (`X >= 235, Y >= 305`) into false islands!
    in_arch_preserve = (X <= 535) & (Y <= 655) & ((X < 240) | (Y < 305)) & ~is_red_line
    tier_id_med = nd.median_filter(tier_id_raw, size=3)
    tier_id = np.where(in_arch_preserve & (tier_id_raw >= 1), tier_id_raw, tier_id_med)

    # Unify NW ocean mask with `whas0_old` across the red boundary (`X = 272..525, Y = 330..595`),
    # excluding high-altitude mountain tarns/lakes (`Eo_old >= 15 m` or `wlev0_old > 5 m`) on the NW Crater Wall!
    old_nw_ocean = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    old_sub_sea = whas0_old[:265, :255].copy()
    if Eo_old is not None:
        old_sub_sea = old_sub_sea & (Eo_old[:265, :255] < 15.0)
    if wlev0_old is not None:
        old_sub_sea = old_sub_sea & (np.nan_to_num(wlev0_old[:265, :255], nan=0.0) < 5.0)
    old_nw_ocean[DY_F:DY_F + 265, DX_F:DX_F + 255] = old_sub_sea

    # Inside the old map (`Y >= DY_F, X >= DX_F`), only `old_nw_ocean` is sea; in the new territory, use `tier_id == 0`,
    # bridging the 6-px seam across `X = 272` (`Y = 326..485`) and `Y = 330` (`X = 266..412`) where the NW sea crosses the border:
    in_old_box = (Y >= DY_F) & (X >= DX_F)
    nw_sea_seam = ((np.abs(X - DX_F) <= 6) & (Y >= 326) & (Y <= 485)) | ((np.abs(Y - DY_F) <= 6) & (X >= 266) & (X <= 412))
    is_ocean = (
        (((tier_id == 0) & ~is_high_lake & ~in_old_box) | old_nw_ocean | nw_sea_seam)
        & ~(in_arch_preserve & (tier_id_raw >= 1))
    )
    open_sea_pinholes = nd.binary_closing(is_ocean, iterations=1) & ~(in_arch_preserve & (tier_id_raw >= 1)) & (~in_old_box | old_nw_ocean)
    is_ocean = is_ocean | open_sea_pinholes

    # Smooth the NW Inner Sea coastline crossings across `Y = 330` (`X = 465..505, Y = 300..330`)
    # and across `X = 272` (`X = 250..272, Y = 560..612`) so there is ZERO horizontal or vertical step at the seam!
    in_east_shore_cross = (Y >= 300) & (Y < 330) & (X >= 465) & (X <= 505)
    x_shore_east = 496.0 - 10.0 * G.sstep(300.0, 330.0, Y.astype(float))
    is_ocean = np.where(in_east_shore_cross, X <= x_shore_east, is_ocean)

    in_south_shore_cross = (X >= 250) & (X < 272) & (Y >= 560) & (Y <= 612)
    y_shore_south = 604.0 - 12.0 * G.sstep(250.0, 272.0, X.astype(float))
    is_ocean = np.where(in_south_shore_cross, Y <= y_shore_south, is_ocean)

    tier_id = np.where(is_ocean, 0, np.maximum(tier_id, 1))

    # In The Arch (`X <= 525, Y <= 635` outside the western crater wall and northern massif),
    # maximum contour tier is Dark-Green (`tier 3`), never alpine White/Grey!
    in_arch_ridge_zone = (X <= 525) & (Y <= 635) & ~((X >= 185) & (Y >= 515)) & ~((X >= 485) & (Y < 165)) & ~((X < 62) & (Y >= 475))
    tier_id = np.where(in_arch_ridge_zone & (tier_id > 3), 3, tier_id)

    # 8. Extract Explicit Trans-Boundary Masks Where User Contours Cross into the Old Map (`X >= 272, Y >= 330`):
    rs_cls = np.random.RandomState(505)
    warp_cls = nd.gaussian_filter(rs_cls.normal(0.0, 1.0, (NEW_OH, NEW_OW)), 8.0)
    warp_cls = warp_cls / (np.std(warp_cls) + 1e-9) * 9.0

    # 8A. NE Outland Connector (`X = 1310..1585, Y = 215..485` — connects Ria Valley / Highland Lake to Outland!)
    # Use organic FBM-warped bounds so no vertical or horizontal box edge ever appears at X=1340 or Y=240!
    Xw_cls = X + 1.8 * warp_cls
    Yw_cls = Y + 1.8 * warp_cls
    is_ne_conn_green_raw = (
        (Xw_cls >= 1310.0) & (Xw_cls <= 1580.0) & (Yw_cls >= 215.0) & (Yw_cls <= 478.0)
        & (arr[..., 1] > arr[..., 0] + 16.0) & (arr[..., 1] > arr[..., 2] + 16.0) & (arr[..., 1] < 145.0)
    )
    is_ne_conn_green = nd.binary_closing(is_ne_conn_green_raw, iterations=3)
    d_from_ne_green = nd.distance_transform_edt(~is_ne_conn_green)
    # White alpine rim of the Outland Gate pass wraps within 28 px of the painted Dark-Green pass floor
    is_ne_conn_white = (
        (d_from_ne_green + 0.6 * warp_cls <= 28.0) & (Yw_cls >= 215.0) & (Yw_cls <= 488.0)
        & (arr[..., 0] > 232.0) & (arr[..., 1] > 232.0) & (arr[..., 2] > 232.0)
        & ~is_ne_conn_green
    )
    is_ne_conn_white = nd.binary_closing(is_ne_conn_white, iterations=2)
    is_ne_connector = nd.binary_dilation(is_ne_conn_green | is_ne_conn_white, iterations=2)

    # 8B. SW Crook–Rift Connector (`X = 25..375, Y = 1080..1330` — connects southern Crook & Copper Glacier to the Rift!)
    is_sw_conn_green_raw = (
        (Xw_cls >= 22.0) & (Xw_cls <= 245.0) & (Yw_cls >= 1075.0) & (Yw_cls <= 1322.0)
        & (arr[..., 1] > arr[..., 0] + 16.0) & (arr[..., 1] > arr[..., 2] + 16.0) & (arr[..., 1] < 145.0)
    )
    is_sw_conn_green = nd.binary_closing(is_sw_conn_green_raw, iterations=3)
    d_from_sw_green = nd.distance_transform_edt(~is_sw_conn_green)
    is_sw_conn_white = (
        (Xw_cls >= 16.0) & (Xw_cls <= 372.0) & (Yw_cls >= 1075.0) & (Yw_cls <= 1328.0)
        & ((d_from_sw_green + 0.6 * warp_cls <= 34.0) | ((Yw_cls >= 1175.0) & (Yw_cls <= 1268.0) & (Xw_cls >= 140.0) & (Xw_cls <= 368.0)))
        & (arr[..., 0] > 232.0) & (arr[..., 1] > 232.0) & (arr[..., 2] > 232.0)
        & ~is_sw_conn_green
    )
    is_sw_conn_white = nd.binary_closing(is_sw_conn_white, iterations=3)
    is_sw_connector = is_sw_conn_green | is_sw_conn_white

    # 8C. Ensure the unpainted white background in the far NE corner (`X >= 1220, Y < 350` more than ~36 px outside
    # the Dark-Green contour `tier_id <= 3`) and the SW exterior corner (`X < 285, Y >= 1260` more than ~34 px outside
    # `is_sw_conn_green`) are classified smoothly as Tier 5 (`Light-Grey` high airless rim), with organic FBM-warped
    # contour boundaries so there are ZERO rectangular or linear step-offs!
    d_from_green_all = nd.distance_transform_edt(~(tier_id <= 3)) + warp_cls
    ne_outer_rim = (Xw_cls >= 1220.0) & (Yw_cls < 350.0) & (tier_id == 4) & (d_from_green_all > 36.0) & ~is_ne_connector
    sw_outer_rim = (Xw_cls < 290.0) & (Yw_cls >= 1255.0) & (d_from_green_all > 34.0) & ~is_sw_connector
    tier_id = np.where(ne_outer_rim | sw_outer_rim, 5, tier_id)

    # Also ensure the Western Boundary Cordillera (`X < 52, Y = 475..1120`) has a continuous White (`tier 4`) and
    # Light-Grey (`tier 5`) mountain spine along the left map border so players cannot wander off the western edge!
    west_border_dist = X + 6.5 * np.sin(Y * 0.024) + 0.65 * warp_cls
    west_cord_t5 = (Y >= 495) & (Y <= 1120) & (west_border_dist < 18.0) & ~is_ocean
    west_cord_t4 = (Y >= 478) & (Y <= 1120) & (west_border_dist >= 18.0) & (west_border_dist < 42.0) & (tier_id < 4) & ~is_ocean
    tier_id = np.where(west_cord_t4, 4, tier_id)
    tier_id = np.where(west_cord_t5, 5, tier_id)

    # Ensure the trans-boundary NE & SW green/white painted contours have their exact contour tiers (3 and 4)
    tier_id = np.where(is_ne_conn_white | is_sw_conn_white, 4, tier_id)
    tier_id = np.where(is_ne_conn_green | is_sw_conn_green, 3, tier_id)

    # Enforce strict topological contour monotonicity across the entire grid (`tier k` must step through `k-1`
    # over at least 2 pixels before reaching `k+1`), guaranteeing zero single-pixel coastal or ridge spikes!
    for k_step in (1, 2, 3, 4):
        near_lower = nd.binary_dilation(tier_id < k_step, iterations=2)
        tier_id = np.where(near_lower & (tier_id > k_step), k_step, tier_id)

    is_tan = (tier_id == 1)
    is_midgreen = (tier_id == 2)
    is_darkgreen = (tier_id == 3)
    is_white = (tier_id == 4)
    is_ltgrey = (tier_id == 5)
    is_dkgrey = (tier_id == 6)

    return dict(
        arr=arr,
        tier_id=tier_id,
        is_ocean=is_ocean,
        is_seamount=is_seamount,
        is_delta_channel=is_delta_channel,
        is_river_paint=is_river_paint,
        is_arach=is_arach,
        is_high_lake=is_high_lake,
        is_tan=is_tan,
        is_midgreen=is_midgreen,
        is_darkgreen=is_darkgreen,
        is_white=is_white,
        is_ltgrey=is_ltgrey,
        is_dkgrey=is_dkgrey,
        is_ne_conn_green=is_ne_conn_green,
        is_ne_conn_white=is_ne_conn_white,
        is_ne_connector=is_ne_connector,
        is_sw_conn_green=is_sw_conn_green,
        is_sw_conn_white=is_sw_conn_white,
        is_sw_connector=is_sw_connector,
    )


def _solve_harmonic_extension(Eo_clean_edge, is_new_area):
    """Extend the bevel-stripped old map elevations (`Eo_clean_edge`) smoothly into the new expansion area
    via multi-scale Gaussian Dirichlet relaxation, maintaining 100% continuity across `Y = DY_F` and `X = DX_F`."""
    u = np.zeros((NEW_OH, NEW_OW), dtype=float)
    u[DY_F:, DX_F:] = Eo_clean_edge
    core_old = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    core_old[DY_F:, DX_F:] = True
    need_fill = ~core_old
    _, (iy, ix) = nd.distance_transform_edt(need_fill, return_indices=True)
    u[need_fill] = u[iy[need_fill], ix[need_fill]]

    for sigma in (48.0, 24.0, 12.0, 6.0, 3.0):
        for _ in range(16):
            u_blur = nd.gaussian_filter(u, sigma=sigma)
            u[need_fill] = u_blur[need_fill]
    return u


def solve_contour_surface(
    tier_id, is_sea, is_river_paint, is_high_lake, is_ne_connector, is_sw_connector,
    h_harm, rn_broad, rn_fine, fbm1, fbm2
):
    """Interpolate a continuous, plateau-free topographic surface from the contour bands (`tier_id` 1..6)
    and light-blue river thalwegs (`is_river_paint`), so that every slope descends naturally from the
    airless Grey mountain crests (`> 7,250 m`) across the White (`3,350..7,250 m`), Dark-Green (`1,480..3,350 m`),
    Mid-Green (`600..1,480 m`), and Tan (`0..600 m`) contour lines down to the rivers and the sea (`0.0 m`)."""
    Y, X = np.indices((NEW_OH, NEW_OW), dtype=float)

    # Seed `tier_clean` inside the adjacent untouched old map (`X >= DX_F + 28, Y >= DY_F + 28` with strong FBM warp)
    # directly from `h_harm` so every contour band on the new canvas sees the true elevation of
    # the adjacent old map across the red boundary line with ZERO straight horizontal or vertical seam!
    tier_clean = tier_id.copy()
    old_core_mask = (
        (X >= DX_F + 28.0 + 18.0 * fbm2 + 9.0 * fbm1)
        & (Y >= DY_F + 28.0 + 18.0 * fbm1 + 9.0 * fbm2)
        & ~is_ne_connector & ~is_sw_connector
    )
    old_tier = np.ones((NEW_OH, NEW_OW), dtype=int)
    old_tier = np.where(h_harm < 0.0, 0, old_tier)
    old_tier = np.where((h_harm >= 600.0) & (h_harm < 1480.0), 2, old_tier)
    old_tier = np.where((h_harm >= 1480.0) & (h_harm < 3350.0), 3, old_tier)
    old_tier = np.where((h_harm >= 3350.0) & (h_harm < 7250.0), 4, old_tier)
    old_tier = np.where(h_harm >= 7250.0, 5, old_tier)
    tier_clean = np.where(old_core_mask, old_tier, tier_clean)

    # Along the northern crater wall (`X = 530..1080, Y = 295..355`) and western crater wall (`X = 235..295, Y = 580..1160`),
    # ensure the high crater-wall crest (`h_harm >= 6800 m`) continues smoothly into `tier_clean` across `Y = 330` and `X = 272`
    # so the crater wall has consistent height and alpine slopes on both sides!
    n_wall_crest = (
        (X >= 530.0) & (X <= 1060.0) & (Y >= 302.0 - 12.0 * fbm2) & (Y <= 355.0 + 12.0 * fbm1)
        & (h_harm >= 6600.0) & (tier_clean >= 4)
    )
    w_wall_crest = (
        (Y >= 575.0) & (Y <= 1165.0) & (X >= 240.0 - 12.0 * fbm2) & (X <= 295.0 + 12.0 * fbm1)
        & (h_harm >= 6600.0) & (tier_clean >= 4)
    )
    tier_clean = np.where(n_wall_crest | w_wall_crest, 5, tier_clean)

    # Contour boundary elevations (in metres), matching the exact hypsometric color transitions of the map:
    #   C0 (tier 0 / 1 shoreline):           0.0 m
    #   C1 (tier 1 Tan / tier 2 Mid-Green):  600.0 m
    #   C2 (tier 2 Mid / tier 3 Dark-Green): 1,480.0 m (Eastern Highland Lake sits right on this contour at 1,460 m!)
    #   C3 (tier 3 Dark / tier 4 White):     3,350.0 m
    #   C4 (tier 4 White / tier 5-6 Grey):   7,250.0 m (Snow-to-Airless Rim transition!)
    E_BOUNDS = [0.0, 600.0, 1480.0, 3350.0, 7250.0]

    h_cont = np.zeros((NEW_OH, NEW_OW), dtype=float)

    for k in (1, 2, 3, 4):
        E_lo = E_BOUNDS[k - 1]
        E_hi = E_BOUNDS[k]
        in_k = (tier_clean == k)
        if not in_k.any():
            continue

        # Smooth distance fields with Gaussian filtering + subtle FBM warp to eliminate all nearest-neighbor staircase steps!
        d_low_raw = nd.distance_transform_edt(tier_clean >= k)
        d_low = np.maximum(0.0, nd.gaussian_filter(d_low_raw, sigma=2.8) + 0.8 * fbm1 * G.sstep(0.0, 4.0, d_low_raw))
        has_higher = (tier_clean > k)
        d_high_raw = nd.distance_transform_edt(~has_higher) if has_higher.any() else np.full((NEW_OH, NEW_OW), 1e9)
        d_high = np.maximum(0.0, nd.gaussian_filter(d_high_raw, sigma=2.8))

        # Medial ridge spine distance for local maxima (islands, peninsulas, or White mountain crests without Grey cores)
        d_max_local = nd.maximum_filter(nd.gaussian_filter(d_low, sigma=2.0), size=35)
        d_to_spine = np.maximum(0.0, d_max_local - d_low)

        use_spine = d_high > (d_max_local * 1.35 + 6.0)
        d_up_eff = np.where(use_spine, d_to_spine, d_high)
        t_k = d_low / (d_low + d_up_eff + 1e-6)
        t_curve = 0.72 * t_k + 0.28 * (t_k ** 1.45)

        spine_crest_hi = E_lo + (E_hi - E_lo) * np.clip(d_max_local / 14.0, 0.32, 0.96)
        E_hi_eff = np.where(use_spine, spine_crest_hi, E_hi)

        h_band = E_lo + (E_hi_eff - E_lo) * t_curve
        h_cont = np.where(in_k, h_band, h_cont)

    # Tier 5 (Light-Grey: High Airless Outer Rim `> 7,250 m` across NE, N Crater Wall, W Crater Wall, W Cordillera, & SW Rim)
    in_t5 = (tier_clean == 5)
    if in_t5.any():
        d_in_t5 = nd.gaussian_filter(nd.distance_transform_edt(in_t5), sigma=3.5)
        d_max_t5 = np.maximum(nd.maximum_filter(nd.gaussian_filter(d_in_t5, sigma=4.0), size=45), 8.0)
        t_t5 = np.clip(d_in_t5 / d_max_t5, 0.0, 1.0)
        # Slope continuously from 7,250 m at the White/Grey boundary up to the adjacent airless rim (`max(9200, h_harm)`),
        # or +8,450 m along the Western Boundary Cordillera (`X < 75, Y = 475..1120`) with a smooth FBM-warped weight!
        w_wcord_t5 = (
            (1.0 - G.sstep(55.0, 95.0, X + 8.0 * fbm2))
            * G.sstep(450.0, 500.0, Y)
            * (1.0 - G.sstep(1090.0, 1140.0, Y))
        )
        target_t5_top = (8550.0 + 450.0 * rn_broad) * w_wcord_t5 + np.maximum(9200.0, h_harm) * (1.0 - w_wcord_t5)
        h_t5 = 7250.0 + np.maximum(1350.0, target_t5_top - 7250.0) * (0.62 * t_t5 + 0.38 * (t_t5 ** 1.3))
        # Blend `h_t5` smoothly into `h_harm` within 48 px of the old map boundary so there is zero step-off
        # between the new Grey airless rim and the adjacent old Grey airless rim (`10,000..14,500 m`)!
        d_to_old_t5 = nd.distance_transform_edt((X < DX_F) | (Y < DY_F))
        w_t5_harm = (1.0 - G.sstep(0.0, 48.0, d_to_old_t5 + 8.0 * fbm2)) * G.sstep(3.0, 16.0, d_in_t5)
        h_t5 = h_t5 * (1.0 - w_t5_harm) + np.maximum(8600.0, h_harm) * w_t5_harm
        h_cont = np.where(in_t5, h_t5, h_cont)

    # Tier 6 (Dark-Grey: North-Central Glaciated / Airless Shield Massif `X = 520..1120, Y < 150`)
    in_t6 = (tier_clean == 6)
    if in_t6.any():
        d_in_t6 = nd.gaussian_filter(nd.distance_transform_edt(in_t6), sigma=3.5)
        d_max_t6 = np.maximum(nd.maximum_filter(nd.gaussian_filter(d_in_t6, sigma=4.0), size=45), 10.0)
        t_t6 = np.clip(d_in_t6 / d_max_t6, 0.0, 1.0)
        h_t6 = 7250.0 + 2350.0 * (0.65 * t_t6 + 0.35 * (t_t6 ** 1.35))
        h_cont = np.where(in_t6, h_t6, h_cont)

    # Smooth the contour-interpolated surface across contour boundaries (`sigma = 10.5 px` on interior land,
    # `sigma = 5.0 px` in The Arch with an FBM-warped transition so coastlines are 100% spike-free!)
    land_mask = ~is_sea
    w_arch_sharp = (
        (1.0 - G.sstep(430.0, 540.0, X + 16.0 * fbm2))
        * (1.0 - G.sstep(540.0, 645.0, Y + 16.0 * fbm1))
    )
    h_smooth_broad = nd.gaussian_filter(h_cont, sigma=10.5)
    h_smooth_arch = nd.gaussian_filter(h_cont, sigma=5.0)
    h_smooth = h_smooth_arch * w_arch_sharp + h_smooth_broad * (1.0 - w_arch_sharp)

    d_from_sea = nd.distance_transform_edt(land_mask)
    w_coast_anchor = G.sstep(0.0, 6.0, d_from_sea)
    h_cont = (h_cont * (1.0 - w_coast_anchor) + h_smooth * w_coast_anchor) * land_mask

    # Incorporate ALL user-painted Light-Blue Rivers (`is_river_paint`) + the Crook Axial River
    # as true valley thalweg local minima!
    is_crook_riv_line = (
        (Y >= 645.0) & (Y <= 1148.0)
        & (np.abs(X - (112.0 + 18.0 * G.sstep(720.0, 1050.0, Y) + 22.0 * G.sstep(1050.0, 1150.0, Y) + 8.0 * np.sin((Y - 650.0) * 0.015))) <= 2.0)
    )
    all_riv_seeds = (is_river_paint | is_crook_riv_line) & ~is_sea & ~is_high_lake
    if all_riv_seeds.any():
        d_to_riv, (riy, rix) = nd.distance_transform_edt(~all_riv_seeds, return_indices=True)
        h_at_riv = nd.gaussian_filter(h_cont, sigma=14.0)[riy, rix]
        val_incision = np.clip(40.0 + 0.14 * h_at_riv, 35.0, 320.0)
        h_thalweg = np.maximum(2.5, h_at_riv - val_incision)
        w_riv_valley = (1.0 - G.sstep(0.0, 24.0, d_to_riv)) ** 1.45
        h_cont = h_cont * (1.0 - 0.72 * w_riv_valley) + np.minimum(h_cont, h_thalweg + val_incision * G.sstep(0.0, 24.0, d_to_riv)) * (0.72 * w_riv_valley)

    # Add natural multi-scale topographic texture proportional to elevation (subtle in valleys, rugged on high peaks)
    relief_amp = 18.0 + 0.14 * np.clip(h_cont, 0.0, 6800.0)
    h_cont = h_cont + relief_amp * (0.55 * (rn_broad - 0.38) + 0.30 * (rn_fine - 0.38) + 0.15 * fbm1) * G.sstep(0.0, 5.0, d_from_sea)

    return np.maximum(h_cont, 2.0) * land_mask


def build_arch_midocean_ridge(px, py, is_sea, tier_id, rn_fine, rn_broad, fbm1, fbm2):
    """Sculpt **The Arch** (`X = 30..535, Y = 10..645`) as a dramatic **exposed undersea mid-ocean spreading ridge**
    with a clear **double line of high parallel rift-shoulder horst ridges** (`+750..+2,250 m`) separated by a
    **lowered median axial rift valley / sound** (`-65 m..+160 m`), plus a rich tectonic archipelago of elongated
    fault-block islands in the western Arch and Crook entrance (`X = 32..230, Y = 260..645`)."""
    OH, OW = px.shape

    # 1. Outer (North-Western) Rift-Shoulder Horst Ridge Spine [(x, y, crest_m, half_width_px)]:
    outer_ridge_ctrl = [
        ( 62.0, 545.0,  620.0,  7.5),
        ( 88.0, 478.0,  740.0,  8.0),
        (118.0, 405.0,  860.0,  8.5),
        (146.0, 332.0,  980.0,  9.0),
        (178.0, 272.0, 1180.0, 10.0),
        (222.0, 236.0, 1360.0, 10.5),
        (268.0, 202.0, 1520.0, 11.0),
        (318.0, 170.0, 1640.0, 11.0),
        (368.0, 142.0, 1720.0, 11.0),
        (418.0, 114.0, 1780.0, 11.5),
        (468.0,  92.0, 1880.0, 12.0),
        (508.0,  78.0, 2050.0, 13.0),
    ]
    # 2. Inner (South-Eastern) Rift-Shoulder Horst Ridge Spine [(x, y, crest_m, half_width_px)]:
    inner_ridge_ctrl = [
        (104.0, 558.0,  580.0,  7.5),
        (134.0, 492.0,  710.0,  8.0),
        (164.0, 422.0,  840.0,  8.5),
        (194.0, 352.0,  960.0,  9.0),
        (224.0, 294.0, 1140.0, 10.0),
        (266.0, 258.0, 1320.0, 10.5),
        (312.0, 222.0, 1460.0, 11.0),
        (362.0, 188.0, 1580.0, 11.0),
        (412.0, 156.0, 1660.0, 11.0),
        (458.0, 132.0, 1620.0, 11.0),
        (498.0, 116.0, 1480.0, 11.0),
    ]
    # 3. Median Axial Rift Valley / Trough Centerline in between the two parallel ridges:
    axial_trough_ctrl = [
        ( 83.0, 551.0,  -45.0,  8.5),
        (111.0, 485.0,  -35.0,  8.5),
        (141.0, 413.0,  -25.0,  9.0),
        (170.0, 342.0,  -15.0,  9.5),
        (201.0, 283.0,   35.0,  9.5),
        (244.0, 247.0,   85.0, 10.0),
        (290.0, 212.0,  125.0, 10.0),
        (340.0, 179.0,  155.0, 10.5),
        (390.0, 149.0,  165.0, 10.5),
        (438.0, 123.0,  140.0, 10.5),
        (483.0, 104.0,   95.0, 11.0),
        (528.0, 114.0,   42.0, 11.5),
    ]

    outer_s = _catmull_rom_2d(outer_ridge_ctrl, n_per_seg=20)
    inner_s = _catmull_rom_2d(inner_ridge_ctrl, n_per_seg=20)
    axial_s = _catmull_rom_2d(axial_trough_ctrl, n_per_seg=20)

    # Evaluate distance & target elevation for the two horst ridges and the median rift valley in [0:660, 0:565]
    H_sub, W_sub = 660, 565
    px_s = px[:H_sub, :W_sub] + 2.2 * fbm1[:H_sub, :W_sub]
    py_s = py[:H_sub, :W_sub] + 2.2 * fbm2[:H_sub, :W_sub]

    def _eval_chain(samples):
        d2_min = np.full((H_sub, W_sub), 1e12, dtype=float)
        el_near = np.zeros((H_sub, W_sub), dtype=float)
        hw_near = np.full((H_sub, W_sub), 9.0, dtype=float)
        for sx, sy, sel, shw in samples:
            d2 = (px_s - sx) ** 2 + (py_s - sy) ** 2
            better = d2 < d2_min
            d2_min = np.where(better, d2, d2_min)
            el_near = np.where(better, sel, el_near)
            hw_near = np.where(better, shw, hw_near)
        return np.sqrt(d2_min), nd.gaussian_filter(el_near, sigma=2.0), hw_near

    d_out, el_out, hw_out = _eval_chain(outer_s)
    d_inn, el_inn, hw_inn = _eval_chain(inner_s)
    d_ax, el_ax, hw_ax = _eval_chain(axial_s)

    # Double-ridge horst profile with steep inner fault scarps facing the axial trough
    w_out_ridge = np.exp(-((d_out / hw_out) ** 1.85))
    w_inn_ridge = np.exp(-((d_inn / hw_inn) ** 1.85))
    w_horst_double = np.maximum(w_out_ridge, w_inn_ridge)
    el_horst_target = np.where(w_out_ridge >= w_inn_ridge, el_out, el_inn) * (
        0.72 + 0.38 * rn_fine[:H_sub, :W_sub] + 0.16 * fbm1[:H_sub, :W_sub]
    )

    # Median axial rift valley trough between the two ridges
    w_axial_trough = (1.0 - G.sstep(0.0, 1.05, d_ax / hw_ax)) * (1.0 - 0.55 * w_horst_double)

    # 4. Rich Western Arch & Crook Entrance Archipelago (`X = 32..230, Y = 260..645`):
    # Elongated tectonic fault-block islands, hogback ridges, and volcanic islets along the spreading ridge flanks
    archipelago_isles = [
        # (xc, yc, rx, ry, angle_deg, peak_m)
        ( 64.0, 534.0, 14.0, 4.2, -58.0, 680.0),
        ( 86.0, 496.0, 11.5, 3.8, -55.0, 590.0),
        ( 52.0, 468.0,  9.5, 3.4, -62.0, 480.0),
        (114.0, 456.0, 13.0, 4.0, -52.0, 640.0),
        ( 78.0, 428.0, 10.5, 3.5, -56.0, 520.0),
        (142.0, 412.0, 12.5, 3.8, -50.0, 710.0),
        (106.0, 392.0,  9.0, 3.2, -54.0, 460.0),
        ( 62.0, 398.0,  7.5, 2.8, -60.0, 340.0),
        (132.0, 368.0, 11.0, 3.6, -48.0, 580.0),
        (166.0, 378.0, 12.0, 3.8, -46.0, 660.0),
        ( 94.0, 354.0,  8.0, 2.8, -52.0, 390.0),
        (194.0, 346.0, 11.5, 3.6, -44.0, 690.0),
        (122.0, 334.0,  8.5, 3.0, -50.0, 420.0),
        (152.0, 304.0, 10.5, 3.4, -45.0, 540.0),
        (118.0, 294.0,  7.5, 2.8, -48.0, 360.0),
        (144.0, 492.0, 11.0, 3.6, -54.0, 560.0),
        (168.0, 454.0, 10.0, 3.4, -50.0, 510.0),
        (124.0, 528.0, 12.0, 3.8, -56.0, 610.0),
        ( 96.0, 572.0, 11.5, 3.8, -62.0, 540.0),
        (132.0, 568.0,  9.5, 3.2, -58.0, 450.0),
        ( 74.0, 604.0, 12.5, 4.2, -65.0, 620.0),
        (114.0, 612.0, 10.0, 3.5, -60.0, 490.0),
        (148.0, 598.0,  8.5, 3.0, -55.0, 380.0),
        ( 46.0, 512.0,  8.0, 2.8, -64.0, 410.0),
        ( 54.0, 434.0,  7.0, 2.6, -58.0, 320.0),
        ( 84.0, 382.0,  6.5, 2.4, -54.0, 280.0),
    ]
    h_isl_sub = np.full((H_sub, W_sub), -120.0, dtype=float)
    for ixc, iyc, irx, iry, iang, ipk in archipelago_isles:
        th = math.radians(iang)
        dx_i = px_s - ixc
        dy_i = py_s - iyc
        u_i = dx_i * math.cos(th) + dy_i * math.sin(th)
        v_i = -dx_i * math.sin(th) + dy_i * math.cos(th)
        r_i = np.hypot(u_i / irx, v_i / iry)
        prof = ipk * np.maximum(0.0, 1.0 - (r_i ** 1.65)) * (0.68 + 0.42 * rn_fine[:H_sub, :W_sub]) - 45.0 * np.maximum(0.0, r_i - 0.88)
        h_isl_sub = np.maximum(h_isl_sub, prof)

    h_arch_mod = np.zeros((OH, OW), dtype=float)
    w_arch_horst = np.zeros((OH, OW), dtype=float)
    w_arch_trough = np.zeros((OH, OW), dtype=float)
    el_arch_trough = np.zeros((OH, OW), dtype=float)
    h_arch_isles = np.full((OH, OW), -120.0, dtype=float)

    h_arch_mod[:H_sub, :W_sub] = el_horst_target
    w_arch_horst[:H_sub, :W_sub] = w_horst_double
    w_arch_trough[:H_sub, :W_sub] = w_axial_trough
    el_arch_trough[:H_sub, :W_sub] = el_ax
    h_arch_isles[:H_sub, :W_sub] = h_isl_sub

    return h_arch_mod, w_arch_horst, w_arch_trough, el_arch_trough, h_arch_isles


def build_arachnoid_and_canyon_field(X, Y, is_arach, is_high_lake, rs):
    """Sculpt the Venusian Arachnoid Network (`X = 845..1345, Y = 180..755`) straddling the northern,
    eastern, and SW rims of Korona and southern Ria Valley, plus **The Web-Cleaver Gorge** — with a clean
    lake outlet funnel at the Eastern Highland Lake (`(1254, 206)`) and a smooth alluvial transition onto
    the Ria Valley floodplain (`Y = 175..205`) so it never scars the green floodplain north of the Ria River!"""
    OH, OW = X.shape

    wx = nd.gaussian_filter(rs.normal(0.0, 1.0, (OH, OW)), 4.5)
    wy = nd.gaussian_filter(rs.normal(0.0, 1.0, (OH, OW)), 4.5)
    wx = wx / (np.std(wx) + 1e-9) * 6.5
    wy = wy / (np.std(wy) + 1e-9) * 6.5
    Xw = X + wx
    Yw = Y + wy

    w_arach_zone = np.clip(nd.gaussian_filter(is_arach.astype(float), sigma=9.0) * 2.4, 0.0, 1.0)
    # Taper arachnoid ribs and fissures cleanly south of the main Ria floodplain (`Y >= 190`)
    w_arach_zone = w_arach_zone * G.sstep(182.0, 215.0, Y)

    d_in_orange = nd.distance_transform_edt(is_arach)
    d_out_orange = nd.distance_transform_edt(~is_arach)
    local_max_orange = nd.maximum_filter(d_in_orange, size=7)
    d_from_axis = np.where(
        is_arach,
        np.abs(d_in_orange - np.maximum(local_max_orange * 0.75, 2.0)),
        d_out_orange + 1.5,
    )

    arach_centers = [
        (1046.0, 316.0, 96.0, 4, 16, 0.35),   # Main North-Korona Gate Arachnoid
        (1162.0, 298.0, 88.0, 3, 14, 1.05),   # East-Central Gorge Arachnoid
        ( 952.0, 358.0, 78.0, 3, 12, 0.72),   # West-Korona Rim Arachnoid
        (1248.0, 382.0, 82.0, 3, 13, 1.48),   # East Korona-Shoulder Arachnoid
        ( 968.0, 692.0, 68.0, 2, 11, 0.52),   # SW Korona Inner-Rim Arachnoid
        (1242.0, 625.0, 64.0, 2, 10, 1.18),   # SE Korona Inner-Rim Arachnoid
    ]

    ring_trough_w = np.zeros((OH, OW), dtype=float)
    spoke_trough_w = np.zeros((OH, OW), dtype=float)
    dike_rib_h = np.zeros((OH, OW), dtype=float)

    for xc, yc, r_max, n_rings, n_spokes, rot0 in arach_centers:
        dx = Xw - xc
        dy = Yw - yc
        r = np.hypot(dx, dy)
        th = np.arctan2(dy, dx) + rot0 + 0.16 * np.sin(r * 0.075)
        env = (1.0 - G.sstep(r_max * 0.60, r_max * 1.15, r)) * np.clip(w_arach_zone + 0.35, 0.0, 1.0) * G.sstep(185.0, 215.0, Y)
        if not (env > 0.01).any():
            continue

        for ir in range(1, n_rings + 1):
            r_ring = r_max * (0.22 * ir) + 3.2 * np.cos(n_spokes * 0.5 * th + ir * 1.3)
            d_ring = np.abs(r - r_ring)
            w_rt = (1.0 - G.sstep(1.4, 4.8, d_ring)) * env
            ring_trough_w = np.maximum(ring_trough_w, w_rt)
            rib = 195.0 * np.exp(-((d_ring - 5.2) / 2.2) ** 2) * env
            dike_rib_h = np.maximum(dike_rib_h, rib)

        spoke_phase = np.abs(np.sin(0.5 * n_spokes * th))
        spoke_dist_px = spoke_phase * r * (2.0 / n_spokes)
        w_sp = (1.0 - G.sstep(1.2, 4.2, spoke_dist_px)) * G.sstep(6.0, 18.0, r) * env
        spoke_trough_w = np.maximum(spoke_trough_w, w_sp)
        spoke_rib = 145.0 * np.exp(-((spoke_dist_px - 4.6) / 1.9) ** 2) * G.sstep(8.0, 20.0, r) * env
        dike_rib_h = np.maximum(dike_rib_h, spoke_rib)

    w_orange_fissure = (1.0 - G.sstep(1.0, 3.8, d_from_axis)) * w_arach_zone
    w_orange_dike = np.exp(-((d_from_axis - 5.2) / 2.0) ** 2) * w_arach_zone

    arach_trough_tot = np.clip(np.maximum(w_orange_fissure, 0.85 * np.maximum(ring_trough_w, spoke_trough_w)), 0.0, 1.0)
    arach_rib_tot = dike_rib_h + 220.0 * w_orange_dike

    # The Scenic Northern Korona Canyon (*The Web-Cleaver Gorge*):
    # Starts directly inside the SW bay of Eastern Highland Lake (`1268.0, 202.0`, `+1,455 m`)
    # and joins the main Ria River trunk at `(898.0, 174.0)` (`+385 m`)!
    canyon_ctrl = [
        (1268.0, 202.0, 1455.0,  6.0),  # Inside SW bay of Eastern Highland Lake (+1,460 m)
        (1250.0, 212.0, 1410.0,  6.2),  # Exits western shoreline outlet of Eastern Highland Lake
        (1224.0, 238.0, 1315.0,  6.5),  # Upper basalt cataract throat
        (1182.0, 280.0, 1140.0,  8.0),  # Enters East Arachnoid ring-graben
        (1136.0, 314.0,  980.0,  6.5),  # Threads hard basalt ring-dike water gap
        (1088.0, 334.0,  870.0,  9.5),  # Northern Korona rim pass cauldron!
        (1046.0, 330.0,  780.0, 10.5),  # Heart of Main North-Korona Arachnoid cauldron
        (1008.0, 298.0,  690.0,  6.5),  # Cleaves NW radial dike gateway
        ( 972.0, 254.0,  585.0,  8.0),  # Lower Travertine Cataract Staircase
        ( 934.0, 212.0,  475.0,  8.5),  # Canyon mouth emerging onto Ria Valley piedmont
        ( 898.0, 174.0,  385.0,  9.0),  # Exact confluence with main Ria River trunk!
    ]
    canyon_samples = _catmull_rom_2d(canyon_ctrl, n_per_seg=25)
    n_cs = len(canyon_samples)
    s_param = np.linspace(0.0, 1.0, n_cs)
    # Attenuate meanders strongly at both the lake outlet (`s < 0.14`) and Ria confluence (`s > 0.85`)
    meander_envelope = (np.sin(math.pi * s_param) ** 1.25) * G.sstep(0.06, 0.18, s_param) * (1.0 - G.sstep(0.82, 0.95, s_param))
    meander_off = (10.5 * np.sin(s_param * 7.5 * math.pi + 0.4) + 4.8 * np.cos(s_param * 17.0 * math.pi - 0.8)) * meander_envelope
    tangents = np.gradient(canyon_samples[:, :2], axis=0)
    tnorm = np.hypot(tangents[:, 0], tangents[:, 1]) + 1e-9
    normals = np.stack([-tangents[:, 1] / tnorm, tangents[:, 0] / tnorm], axis=-1)
    canyon_samples[:, 0] += normals[:, 0] * meander_off
    canyon_samples[:, 1] += normals[:, 1] * meander_off
    canyon_samples[:, 3] *= (0.82 + 0.28 * np.sin(s_param * 13.0 * math.pi))

    # Evaluate canyon distance using unwarped coordinates near the two endpoints so the lake outlet and Ria junction are 100% clean
    end_taper = G.sstep(180.0, 215.0, Y) * G.sstep(4.0, 14.0, nd.distance_transform_edt(~is_high_lake))
    Xc_eff = X + wx * end_taper
    Yc_eff = Y + wy * end_taper

    d2_can = np.full((OH, OW), 1e12, dtype=float)
    el_can = np.zeros((OH, OW), dtype=float)
    hw_can = np.full((OH, OW), 8.0, dtype=float)

    y0_c, y1_c, x0_c, x1_c = 155, 425, 855, 1310
    sub_x = Xc_eff[y0_c:y1_c, x0_c:x1_c]
    sub_y = Yc_eff[y0_c:y1_c, x0_c:x1_c]
    sub_d2 = d2_can[y0_c:y1_c, x0_c:x1_c]
    sub_el = el_can[y0_c:y1_c, x0_c:x1_c]
    sub_hw = hw_can[y0_c:y1_c, x0_c:x1_c]

    for sx, sy, sel, shw in canyon_samples:
        d2 = (sub_x - sx) ** 2 + (sub_y - sy) ** 2
        better = d2 < sub_d2
        sub_d2 = np.where(better, d2, sub_d2)
        sub_el = np.where(better, sel, sub_el)
        sub_hw = np.where(better, shw, sub_hw)

    d2_can[y0_c:y1_c, x0_c:x1_c] = sub_d2
    el_can[y0_c:y1_c, x0_c:x1_c] = sub_el
    hw_can[y0_c:y1_c, x0_c:x1_c] = sub_hw

    dist_can = np.sqrt(d2_can)
    d_norm_can = dist_can / np.maximum(hw_can, 1.0)
    w_can_inner = 1.0 - G.sstep(0.0, 0.38, d_norm_can)
    w_can_outer = 1.0 - G.sstep(0.40, 1.38, d_norm_can)
    # Taper the rocky canyon walls out smoothly by `Y = 180..210` as the river enters the green Ria floodplain
    # and taper at the Highland Lake shoreline so there is no dark scar at either end!
    d_out_hlake = nd.distance_transform_edt(~is_high_lake)
    w_can_ends = G.sstep(172.0, 208.0, Y) * G.sstep(0.0, 5.0, d_out_hlake)
    w_canyon = (0.52 * w_can_outer + 0.48 * w_can_inner) * w_can_ends
    h_canyon_profile = el_can + 210.0 * (np.clip(d_norm_can, 0.0, 1.5) ** 1.65)

    canyon_river_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in canyon_samples[::3]]
    if canyon_river_pts[0] != [1268.0, 202.0]:
        canyon_river_pts.insert(0, [1268.0, 202.0])
    if canyon_river_pts[-1] != [898.0, 174.0]:
        canyon_river_pts.append([898.0, 174.0])
    return w_arach_zone, arach_trough_tot, arach_rib_tot, w_canyon, h_canyon_profile, canyon_river_pts


def synthesize_nw_expansion(Eo_old, whas0_old, wlev0_old, ref_path):
    """Expand `(1393, 1549)` height/water grids to `(1723, 1821)` (`2 km/cell`) using continuous
    isohypse contour interpolation, exposed mid-ocean ridge morphology in The Arch, two river systems
    draining into the medium-blue Double Delta, and seamless crater-wall transitions."""
    rs = np.random.RandomState(500)
    Y, X = np.indices((NEW_OH, NEW_OW))
    px = X.astype(float)
    py = Y.astype(float)

    # 0. Strip the 16-pixel top/left outer border bevel of `Eo_old`, `whas0_old`, and `wlev0_old`,
    # shifting along the 45-degree diagonal NW Crater Wall shoreline (`x_old = 140..280`, `dx = (16 - r_i) * 1.75`)
    # and southern NW sea shoreline (`y_old = 200..280`, `dy = (16 - c_i) * 0.85`) so the shoreline and mountain
    # contours continue diagonally across `Y = 330..346` and `X = 272..288` with ZERO vertical wall or horizontal notch!
    Eo_clean_edge = Eo_old.copy()
    whas0_clean_edge = whas0_old.copy()
    wlev0_clean_edge = wlev0_old.copy()
    for r_i in range(16):
        Eo_clean_edge[r_i, :] = Eo_old[16, :]
        whas0_clean_edge[r_i, :] = whas0_old[16, :]
        wlev0_clean_edge[r_i, :] = wlev0_old[16, :]
        dx_s = int(round((16 - r_i) * 1.75))
        Eo_clean_edge[r_i, 140:280] = Eo_old[16, 140 - dx_s:280 - dx_s]
        whas0_clean_edge[r_i, 140:280] = whas0_old[16, 140 - dx_s:280 - dx_s]
        wlev0_clean_edge[r_i, 140:280] = wlev0_old[16, 140 - dx_s:280 - dx_s]
    for c_i in range(16):
        Eo_clean_edge[:, c_i] = Eo_clean_edge[:, 16]
        whas0_clean_edge[:, c_i] = whas0_clean_edge[:, 16]
        wlev0_clean_edge[:, c_i] = wlev0_clean_edge[:, 16]
        dy_s = int(round((16 - c_i) * 0.85))
        Eo_clean_edge[200:280, c_i] = Eo_clean_edge[200 + dy_s:280 + dy_s, 16]
        whas0_clean_edge[200:280, c_i] = whas0_clean_edge[200 + dy_s:280 + dy_s, 16]
        wlev0_clean_edge[200:280, c_i] = wlev0_clean_edge[200 + dy_s:280 + dy_s, 16]

    masks = classify_paint_reference(ref_path, whas0_clean_edge, Eo_old=Eo_clean_edge, wlev0_old=wlev0_clean_edge)
    tier_id = masks['tier_id']
    is_ocean = masks['is_ocean']
    is_seamount = masks['is_seamount']
    is_delta_ch = masks['is_delta_channel']
    is_river_paint = masks['is_river_paint']
    is_arach = masks['is_arach']
    is_high_lake = masks['is_high_lake']
    is_ltgrey = masks['is_ltgrey']
    is_dkgrey = masks['is_dkgrey']
    is_ne_conn_green = masks['is_ne_conn_green']
    is_ne_conn_white = masks['is_ne_conn_white']
    is_ne_connector = masks['is_ne_connector']
    is_sw_conn_green = masks['is_sw_conn_green']
    is_sw_conn_white = masks['is_sw_conn_white']
    is_sw_connector = masks['is_sw_connector']

    is_new_area = np.ones((NEW_OH, NEW_OW), dtype=bool)
    is_new_area[DY_F:, DX_F:] = False

    # 1. Solve the harmonic boundary extension from `Eo_clean_edge` so `h_harm` is 100% continuous across Y=330 & X=272!
    h_harm = _solve_harmonic_extension(Eo_clean_edge, is_new_area)

    # Multi-scale ridged & FBM noise fields (at `2 km/cell` resolution)
    rn_fine = T.ridged((NEW_OH, NEW_OW), 5001, scales=(2.5, 5.5, 12.0))
    rn_broad = T.ridged((NEW_OH, NEW_OW), 5002, scales=(6.0, 14.0, 28.0))
    fbm1 = nd.gaussian_filter(rs.normal(0.0, 1.0, (NEW_OH, NEW_OW)), 3.2)
    fbm1 = fbm1 / (np.std(fbm1) + 1e-9)
    fbm2 = nd.gaussian_filter(rs.normal(0.0, 1.0, (NEW_OH, NEW_OW)), 9.5)
    fbm2 = fbm2 / (np.std(fbm2) + 1e-9)

    # 2. Exposed Mid-Ocean Spreading Ridge & Western Archipelago in The Arch (`build_arch_midocean_ridge`):
    (h_arch_mod, w_arch_horst, w_arch_trough,
     el_arch_trough, h_arch_isles) = build_arch_midocean_ridge(
        px, py, is_ocean, tier_id, rn_fine, rn_broad, fbm1, fbm2
    )
    # Emerging archipelago islands (`h_arch_isles > 8.0 m` inside `X = 32..230, Y = 260..645` outside the seamount calderas)
    is_emergent_arch_isle = (
        (px >= 32.0) & (px <= 230.0) & (py >= 260.0) & (py <= 645.0)
        & (h_arch_isles > 8.0) & ~is_seamount
    )
    is_ocean = is_ocean & ~is_emergent_arch_isle
    tier_id = np.where(is_emergent_arch_isle & (tier_id == 0), np.where(h_arch_isles > 350.0, 2, 1), tier_id)

    # 2B. Submarine Bathymetry (`is_sea`) & Explosive Seamount Caldera Swarm (`is_seamount`):
    is_sea = is_ocean & (is_new_area | ((px < 525.0) & (py < 585.0)))
    d_in_sea = nd.distance_transform_edt(np.pad(is_sea, ((75, 0), (75, 0)), mode='edge'))[75:, 75:]
    d_in_land = nd.distance_transform_edt(~is_sea)

    in_arch_box = (px >= 0.0) & (px <= 565.0) & (py >= 0.0) & (py <= 665.0)
    # Smooth, domain-warped Arch envelope (`w_arch_region`) replacing the hard boolean `in_arch_box`
    # so zero vertical or horizontal sector line ever appears at `X = 565` or `Y = 665`!
    w_arch_region = (
        (1.0 - G.sstep(435.0, 525.0, px + 18.0 * fbm2 + 8.0 * fbm1))
        * (1.0 - G.sstep(525.0, 625.0, py + 18.0 * fbm1 + 8.0 * fbm2))
    )
    h_shelf_arch = -12.0 - 220.0 * G.sstep(0.0, 22.0, d_in_sea) + 28.0 * fbm1
    h_shelf_deep = -10.0 - 1380.0 * G.sstep(0.0, 65.0, d_in_sea) + 45.0 * fbm2
    h_shelf_sea = h_shelf_arch * w_arch_region + h_shelf_deep * (1.0 - w_arch_region)

    seamount_cones = [
        (176.0, 322.0, 18.0,  12.0, -680.0),  # Main Krakatoan breaching caldera (rim +12 m, throat -680 m)
        (166.0, 338.0, 14.5, -18.0, -540.0),  # SW Surtseyan submarine caldera
        (188.0, 336.0, 13.5, -24.0, -490.0),  # SE steaming cone
        (174.0, 304.0, 12.0, -32.0, -440.0),  # Northern satellite seamount
    ]
    h_seamount_edifice = h_shelf_sea.copy()
    for sxc, syc, sr_px, rim_m, throat_m in seamount_cones:
        dr_s = np.hypot(px - sxc, py - syc) + 1.4 * fbm1
        u_s = dr_s / sr_px
        w_flank = 1.0 - G.sstep(0.42, 1.35, u_s)
        w_throat = 1.0 - G.sstep(0.0, 0.38, u_s)
        h_cone = h_shelf_sea * (1.0 - w_flank) + (rim_m + 18.0 * rn_fine) * w_flank
        h_cone = h_cone * (1.0 - w_throat) + throat_m * w_throat
        h_seamount_edifice = np.where(u_s < 1.35, np.maximum(h_seamount_edifice, h_cone), h_seamount_edifice)
        h_seamount_edifice = np.where(u_s < 0.35, throat_m + 35.0 * (u_s / 0.35) ** 2, h_seamount_edifice)

    # 3. Solve Continuous Contour-to-Contour Land Surface (`solve_contour_surface`):
    h_land_syn = solve_contour_surface(
        tier_id, is_sea, is_river_paint, is_high_lake, is_ne_connector, is_sw_connector,
        h_harm, rn_broad, rn_fine, fbm1, fbm2
    )

    # Apply the Exposed Mid-Ocean Spreading Ridge double-crest and axial rift graben across The Arch (`w_arch_region & ~is_sea`):
    w_arch_land = w_arch_region * (~is_sea).astype(float)
    # Raise the two parallel rift-shoulder horst ridges (`w_arch_horst`)
    h_land_syn = np.where(
        w_arch_land > 0.01,
        h_land_syn * (1.0 - 0.78 * w_arch_horst * w_arch_land) + np.maximum(h_land_syn, h_arch_mod) * (0.78 * w_arch_horst * w_arch_land),
        h_land_syn,
    )
    # Lower the median axial rift valley (`w_arch_trough`) between the two parallel ridges!
    h_trough_target = np.maximum(12.0, el_arch_trough + 22.0 * fbm1)
    h_land_syn = np.where(
        w_arch_land > 0.01,
        h_land_syn * (1.0 - 0.82 * w_arch_trough * w_arch_land) + np.minimum(h_land_syn, h_trough_target) * (0.82 * w_arch_trough * w_arch_land),
        h_land_syn,
    )
    # Also apply archipelago island relief in the western Arch
    h_land_syn = np.where(is_emergent_arch_isle, np.maximum(h_land_syn, h_arch_isles), h_land_syn)
    # Smooth shoreline slopes in The Arch so island & peninsula coasts grade smoothly into the sea without spikes!
    h_arch_coast_smooth = nd.gaussian_filter(h_land_syn, sigma=1.8)
    w_arch_coast_band = w_arch_region * (1.0 - G.sstep(0.0, 5.0, d_in_land)) * (~is_sea).astype(float)
    h_land_syn = h_land_syn * (1.0 - 0.80 * w_arch_coast_band) + np.minimum(h_land_syn, h_arch_coast_smooth) * (0.80 * w_arch_coast_band)

    # 3A. The Great Double Delta (`px = 516..618, py = 102..204`):
    # Built directly from the user's medium-blue delta paint (`is_delta_ch`) in `expansion_ref.jpg`!
    r_delta = np.hypot((px - 568.0) * 0.95, (py - 156.0) * 1.05)
    w_delta_zone = (1.0 - G.sstep(36.0, 62.0, r_delta)) * (~is_sea).astype(float)

    # Clean, organic braided delta channels following the user's medium-blue delta mask (`is_delta_ch`)
    is_braid_ch = (
        is_delta_ch
        & (px >= 516.0) & (px <= 614.0) & (py >= 104.0) & (py <= 202.0)
        & (tier_id <= 2)
    )
    d_from_braid = nd.distance_transform_edt(~is_braid_ch)
    h_delta_islands = np.where(
        is_braid_ch,
        -5.5 - 3.5 * G.sstep(0.0, 2.5, nd.distance_transform_edt(is_braid_ch)),
        2.5 + 8.5 * G.sstep(0.0, 5.0, d_from_braid) + 1.5 * fbm1,
    )
    h_land_syn = h_land_syn * (1.0 - w_delta_zone) + h_delta_islands * w_delta_zone

    # 3B. Eastern Highland Lake (`is_high_lake` around `[1295, 206]`, surface `+1,460.0 m`):
    HIGH_LAKE_LEV = 1460.0
    d_in_hlake = nd.distance_transform_edt(is_high_lake)
    d_out_hlake = nd.distance_transform_edt(~is_high_lake)
    w_hlake_basin = 1.0 - G.sstep(0.0, 18.0, d_out_hlake)
    h_hlake_profile = np.where(
        is_high_lake,
        (HIGH_LAKE_LEV - 22.0) + 18.0 * (1.0 - G.sstep(0.0, 7.0, d_in_hlake)),
        np.maximum(h_land_syn, HIGH_LAKE_LEV + 4.0),
    )
    h_land_syn = h_land_syn * (1.0 - w_hlake_basin) + h_hlake_profile * w_hlake_basin

    # 3C. Copper Tarn (`[148, 1148]`, water level `+2,380.0 m`) in the southern Crook:
    COPPER_TARN_LEV = 2380.0
    r_cop_tarn = np.hypot((px - 148.0) * 1.15, (py - 1148.0) * 0.85) + 1.8 * fbm1
    is_copper_tarn = (r_cop_tarn <= 11.5) & is_new_area
    w_cop_pocket = 1.0 - G.sstep(11.5, 22.0, r_cop_tarn)
    h_cop_bed = np.where(
        r_cop_tarn <= 11.5,
        (COPPER_TARN_LEV - 18.0) + 15.0 * (r_cop_tarn / 11.5),
        np.maximum(h_land_syn, COPPER_TARN_LEV + 5.0),
    )
    h_land_syn = h_land_syn * (1.0 - w_cop_pocket) + h_cop_bed * w_cop_pocket

    # Tight shoreline transition (`-1.2..+1.8 px`) so narrow archipelago islands stay crisp above sea level (`> +12 m`)!
    w_land_coast = G.sstep(-1.2, 1.8, d_in_land - d_in_sea)
    h_syn = np.where(
        is_seamount & (h_seamount_edifice > -35.0),
        h_seamount_edifice,
        h_seamount_edifice * (1.0 - w_land_coast) + h_land_syn * w_land_coast,
    )

    # 4A. Carve River System 1 — The Main Southern Ria River (`id: 9101`):
    # Flows along the main southern Ria valley (`Y ~ 168..198` in `X = 606..900`) and drains cleanly into
    # the southern/eastern apex of the medium-blue Double Delta at `(606.0, 184.0)`!
    ria_trunk_ctrl = [
        (1312.0,  96.0, 1340.0, 11.0),  # Upper eastern light-blue headwater in Paint!
        (1258.0, 118.0, 1170.0, 12.0),  # Upper S-bend south of NE uplands
        (1196.0,  94.0,  980.0, 13.0),  # Bows north around eastern arachnoid foothills
        (1128.0, 134.0,  810.0, 14.5),  # Sweeps SSW into upper-middle valley bend
        (1056.0, 122.0,  660.0, 15.5),  # Curves WNW past northern terrace spur
        ( 978.0, 166.0,  510.0, 16.5),  # Central Qena-style southward bend
        ( 898.0, 174.0,  385.0, 17.5),  # Exact confluence with Arachnoid Gorge River (Web-Cleaver)!
        ( 824.0, 176.0,  265.0, 18.5),  # Lower-middle valley course along main painted light-blue channel
        ( 752.0, 172.0,  155.0, 19.5),  # Passes south of the interfluve divide separating the 2nd river system
        ( 682.0, 192.0,   64.0, 20.5),  # Southern Ria alluvial valley bend
        ( 636.0, 190.0,   18.0, 21.5),  # Approaches southern apex of Double Delta
        ( 606.0, 184.0,    2.0, 22.0),  # Enters southern lobe of the medium-blue Double Delta!
    ]
    ria_samples = _catmull_rom_2d(ria_trunk_ctrl, n_per_seg=22)
    n_ria = len(ria_samples)
    s_ria = np.linspace(0.0, 1.0, n_ria)
    pin_w = (
        np.sin(math.pi * s_ria) ** 0.85
        * (1.0 - 0.96 * np.exp(-((s_ria - (6.0 / 11.0)) / 0.05) ** 2))
        * (1.0 - G.sstep(0.84, 0.95, s_ria))
    )
    ria_meander_off = (
        8.5 * np.sin(s_ria * 11.0 * math.pi + 0.35)
        + 4.2 * np.sin(s_ria * 23.0 * math.pi - 0.80)
    ) * pin_w
    t_ria = np.gradient(ria_samples[:, :2], axis=0)
    tn_ria = np.hypot(t_ria[:, 0], t_ria[:, 1]) + 1e-9
    nrm_ria = np.stack([-t_ria[:, 1] / tn_ria, t_ria[:, 0] / tn_ria], axis=-1)
    ria_samples[:, 0] += nrm_ria[:, 0] * ria_meander_off
    ria_samples[:, 1] += nrm_ria[:, 1] * ria_meander_off

    # 4B. Carve River System 2 — The 2nd Independent River System Draining from The Arch & Northern Valley
    # into the Northern Lobe of the Double Delta (`(586.0, 140.0)`):
    # Branch 2A (`id: 9103`): Arch Axial & Northern Neck River draining from The Arch into the Double Delta!
    arch_river_ctrl = [
        (265.0, 235.0, 110.0,  7.5),  # Headwaters in the axial rift graben of The Arch
        (315.0, 199.0,  96.0,  8.0),
        (365.0, 167.0,  82.0,  8.5),
        (415.0, 138.0,  68.0,  9.0),
        (464.0, 117.0,  52.0,  9.5),
        (502.0, 104.0,  34.0, 10.5),
        (536.0, 112.0,  18.0, 11.5),
        (562.0, 126.0,   8.0, 12.5),
        (586.0, 140.0,   2.0, 13.5),  # Enters northern lobe of the medium-blue Double Delta!
    ]
    arch_riv_samples = _catmull_rom_2d(arch_river_ctrl, n_per_seg=16)
    arch_riv_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in arch_riv_samples[::2]]

    # Branch 2B (`id: 9104`): North Arch Peninsula Tributary (`(488, 42) -> (518, 64) -> (544, 92) -> (562, 126)`)
    arch_north_neck_ctrl = [
        (488.0,  42.0, 420.0, 6.5),
        (516.0,  64.0, 260.0, 7.5),
        (542.0,  94.0, 110.0, 8.5),
        (562.0, 126.0,   8.0, 9.5),  # Joins Arch Axial River (`id: 9103`) at `[562.0, 126.0]`!
    ]
    arch_neck_samples = _catmull_rom_2d(arch_north_neck_ctrl, n_per_seg=14)
    arch_neck_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in arch_neck_samples[::2]]
    if arch_neck_pts[-1] != [562.0, 126.0]:
        arch_neck_pts.append([562.0, 126.0])

    # Branch 2C (`id: 9107`): Northern Massif Valley River (`(885, 109) -> ... -> (586, 140)`)
    # Follows the user's northern light-blue river line in `expansion_ref.jpg` all the way to the northern Double Delta!
    ria_north_trib_ctrl = [
        (885.0, 109.0, 680.0,  9.0),
        (838.0, 118.0, 545.0,  9.5),
        (788.0, 116.0, 420.0, 10.0),
        (738.0, 136.0, 310.0, 10.5),
        (692.0, 128.0, 210.0, 11.5),
        (645.0, 138.0, 115.0, 12.0),
        (612.0, 140.0,  45.0, 12.5),
        (586.0, 140.0,   2.0, 13.5),  # Drains into the northern lobe of the Double Delta!
    ]
    ntrib_samples = _catmull_rom_2d(ria_north_trib_ctrl, n_per_seg=16)
    s_nt = np.linspace(0.0, 1.0, len(ntrib_samples))
    nt_off = (3.8 * np.sin(s_nt * 7.0 * math.pi + 0.5)) * (np.sin(math.pi * s_nt) ** 1.2)
    t_nt = np.gradient(ntrib_samples[:, :2], axis=0)
    tn_nt = np.hypot(t_nt[:, 0], t_nt[:, 1]) + 1e-9
    ntrib_samples[:, 0] += (-t_nt[:, 1] / tn_nt) * nt_off
    ntrib_samples[:, 1] += ( t_nt[:, 0] / tn_nt) * nt_off
    ntrib_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in ntrib_samples[::2]]
    if ntrib_pts[-1] != [586.0, 140.0]:
        ntrib_pts.append([586.0, 140.0])

    # Branch 2D (`id: 9108`): Sub-Massif Gorge Tributary (`(772, 68) -> (712, 82) -> (672, 106) -> (645, 138)`)
    massif_trib_ctrl = [
        (772.0,  68.0, 820.0, 7.5),
        (716.0,  82.0, 510.0, 8.5),
        (674.0, 106.0, 260.0, 9.0),
        (645.0, 138.0, 115.0, 9.5),  # Joins Northern Massif Valley River (`id: 9107`)!
    ]
    mtrib_samples = _catmull_rom_2d(massif_trib_ctrl, n_per_seg=16)
    s_mt = np.linspace(0.0, 1.0, len(mtrib_samples))
    mt_off = (3.4 * np.sin(s_mt * 5.0 * math.pi + 0.4)) * (np.sin(math.pi * s_mt) ** 1.2)
    t_mt = np.gradient(mtrib_samples[:, :2], axis=0)
    tn_mt = np.hypot(t_mt[:, 0], t_mt[:, 1]) + 1e-9
    mtrib_samples[:, 0] += (-t_mt[:, 1] / tn_mt) * mt_off
    mtrib_samples[:, 1] += ( t_mt[:, 0] / tn_mt) * mt_off
    mtrib_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in mtrib_samples[::2]]
    if mtrib_pts[-1] != [645.0, 138.0]:
        mtrib_pts.append([645.0, 138.0])

    # Carve floodplain corridors for both the main Ria River and the 2nd Northern/Arch River System (including `mtrib_samples`!):
    all_valley_samples = np.vstack([ria_samples, ntrib_samples, mtrib_samples, arch_riv_samples, arch_neck_samples])
    d2_ria = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    el_ria = h_syn.copy()
    hw_ria = np.full((NEW_OH, NEW_OW), 16.0, dtype=float)
    for sx, sy, sel, shw in all_valley_samples:
        d2 = (px[:320, 240:1420] - sx) ** 2 + (py[:320, 240:1420] - sy) ** 2
        better = d2 < d2_ria[:320, 240:1420]
        d2_ria[:320, 240:1420] = np.where(better, d2, d2_ria[:320, 240:1420])
        el_ria[:320, 240:1420] = np.where(better, sel, el_ria[:320, 240:1420])
        hw_ria[:320, 240:1420] = np.where(better, shw, hw_ria[:320, 240:1420])
    dist_ria = nd.gaussian_filter(np.sqrt(d2_ria), sigma=2.2)
    el_ria = nd.gaussian_filter(el_ria, sigma=3.0)
    d_norm_ria = dist_ria / np.maximum(hw_ria, 1.0)
    w_ria_val = (1.0 - G.sstep(0.15, 1.45, d_norm_ria)) * (1.0 - w_delta_zone) * (~is_sea).astype(float)
    w_ria_floodplain = (1.0 - G.sstep(0.0, 0.95, d_norm_ria)) * (1.0 - w_delta_zone) * (~is_sea).astype(float)
    h_ria_thalweg = el_ria + 92.0 * (np.clip(d_norm_ria, 0.0, 1.6) ** 1.55)
    h_syn = h_syn * (1.0 - 0.72 * w_ria_val) + np.minimum(h_syn, h_ria_thalweg) * (0.72 * w_ria_val)

    # 5. Embed Old Map `[DY_F:, DX_F:]` with Wide, Domain-Warped Crater-Wall Continuity & Smoothing:
    # Initialize `En_new` to `h_harm.copy()` (which already equals `Eo_clean_edge` on `[DY_F:, DX_F:]` and extends it
    # harmonically into `Y < DY_F` and `X < DX_F`), so `En_new * (1 - w_new_blend) + h_syn * w_new_blend` has
    # ZERO discontinuity across `Y = 330` or `X = 272`!
    En_new = h_harm.copy()
    whas_new = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    wlev_new = np.full((NEW_OH, NEW_OW), np.nan, dtype=float)

    En_new[DY_F:, DX_F:] = Eo_clean_edge
    whas_new[DY_F:, DX_F:] = whas0_clean_edge
    wlev_new[DY_F:, DX_F:] = wlev0_clean_edge

    d_into_new = nd.distance_transform_edt(is_new_area)
    d_into_old = nd.distance_transform_edt(~is_new_area)
    # Wide domain-warped signed distance (`±44 px`) so the northern (`Y = 330`) and western (`X = 272`) boundary transitions
    # are completely invisible!
    sd_new = (d_into_new - d_into_old) + 22.0 * fbm2 + 11.0 * fbm1
    old_lake_guard = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    old_lake_guard[DY_F:, DX_F:] = whas0_clean_edge & ~is_sea[DY_F:, DX_F:]
    old_lake_guard = nd.binary_dilation(old_lake_guard, iterations=8)

    w_new_blend = np.where(old_lake_guard, G.sstep(0.0, 18.0, d_into_new), G.sstep(-44.0, 44.0, sd_new))
    w_nw_sea_floor = G.sstep(0.0, 12.0, d_in_sea) * (1.0 - G.sstep(465.0, 525.0, px)) * (1.0 - G.sstep(515.0, 585.0, py))
    # Ensure `w_new_blend` approaches `1.0` smoothly near any sea coastline (`d_in_land < 28 px`) in the new area
    # so `h_harm` (`+3,400 m` from the old map's mountain rim) never creates a cliff on the shoreline!
    w_coast_new = (1.0 - G.sstep(0.0, 28.0, d_in_land)) * G.sstep(-6.0, 6.0, d_into_new - d_into_old)
    w_new_blend = np.maximum(w_new_blend, np.maximum(w_nw_sea_floor, w_coast_new))
    En_new = En_new * (1.0 - w_new_blend) + h_syn * w_new_blend

    # 6A. Sculpt the Trans-Boundary NE Outland Gate (`is_ne_connector`, `X = 1318..1605, Y = 205..525`):
    # Carve a continuous sinuous through-valley connecting the main North Outland Lake (`(1588, 517)` and upper tarn `(1545, 477)`, `+1,734 m`)
    # northwestward through the Outland Gate water-gap (`+1,732 m -> +1,456 m`) directly into the eastern bay of
    # Eastern Highland Lake (`(1320, 209)`, `+1,460 m`), so `Outland Gate River` (`id: 9106`) connects
    # directly into the water of BOTH lakes along a natural, sinuous mountain river course!
    ne_pass_ctrl = [
        (1320.0, 209.0, 1456.0, 15.0),  # Inside eastern bay of Eastern Highland Lake (+1,460 m)!
        (1364.0, 236.0, 1500.0, 17.5),
        (1408.0, 286.0, 1555.0, 19.0),
        (1438.0, 336.0, 1605.0, 20.0),  # Crosses Y = 330 inside the water-gap pass
        (1486.0, 382.0, 1650.0, 20.5),
        (1514.0, 434.0, 1692.0, 19.5),
        (1545.0, 477.0, 1720.0, 18.0),  # Threads through upper North Outland tarn
        (1565.0, 496.0, 1726.0, 17.0),
        (1588.0, 517.0, 1732.0, 16.0),  # Connects directly into the main North Outland Lake (+1,734 m)!
    ]
    ne_pass_samples = _catmull_rom_2d(ne_pass_ctrl, n_per_seg=24)
    s_ne = np.linspace(0.0, 1.0, len(ne_pass_samples))
    ne_meander_env = (np.sin(math.pi * s_ne) ** 1.15) * G.sstep(0.04, 0.14, s_ne) * (1.0 - G.sstep(0.84, 0.96, s_ne))
    ne_meander_off = (14.5 * np.sin(s_ne * 5.5 * math.pi + 0.35) + 6.5 * np.cos(s_ne * 13.0 * math.pi - 0.70)) * ne_meander_env
    t_ne = np.gradient(ne_pass_samples[:, :2], axis=0)
    tn_ne = np.hypot(t_ne[:, 0], t_ne[:, 1]) + 1e-9
    ne_pass_samples[:, 0] += (-t_ne[:, 1] / tn_ne) * ne_meander_off
    ne_pass_samples[:, 1] += ( t_ne[:, 0] / tn_ne) * ne_meander_off

    d2_ne = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    el_ne = h_land_syn.copy()
    hw_ne = np.full((NEW_OH, NEW_OW), 20.0, dtype=float)
    for sx, sy, sel, shw in ne_pass_samples:
        d2 = (px[140:555, 1250:1650] - sx) ** 2 + (py[140:555, 1250:1650] - sy) ** 2
        better = d2 < d2_ne[140:555, 1250:1650]
        d2_ne[140:555, 1250:1650] = np.where(better, d2, d2_ne[140:555, 1250:1650])
        el_ne[140:555, 1250:1650] = np.where(better, sel, el_ne[140:555, 1250:1650])
        hw_ne[140:555, 1250:1650] = np.where(better, shw, hw_ne[140:555, 1250:1650])
    dist_ne = nd.gaussian_filter(np.sqrt(d2_ne), sigma=4.0)
    el_ne = nd.gaussian_filter(el_ne, sigma=5.0)
    d_norm_ne = dist_ne / np.maximum(hw_ne, 1.0)

    h_ne_valley = el_ne + 1650.0 * (G.sstep(0.0, 1.85, d_norm_ne) ** 1.40) + 85.0 * (rn_broad - 0.35) + 45.0 * fbm1
    w_ne_trough = 1.0 - G.sstep(0.0, 1.45, d_norm_ne)
    h_ne_cont = h_ne_valley * (0.55 + 0.40 * w_ne_trough) + h_land_syn * (0.45 - 0.40 * w_ne_trough)
    w_ne_connector = nd.gaussian_filter(1.0 - G.sstep(0.55, 1.95, d_norm_ne), sigma=4.5) * (1.0 - G.sstep(485.0, 520.0, py)) * (~is_high_lake).astype(float) * (~whas_new).astype(float)
    En_new = En_new * (1.0 - w_ne_connector) + h_ne_cont * w_ne_connector

    # Extract exact river points for `Outland Gate River` (`id: 9106`), flowing from North Outland Lake `(1588, 517)`
    # through `(1545, 477)` into Eastern Highland Lake `(1320, 209)`:
    outland_gate_riv_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in ne_pass_samples[::-3]]
    if outland_gate_riv_pts[0] != [1588.0, 517.0]:
        outland_gate_riv_pts.insert(0, [1588.0, 517.0])
    if outland_gate_riv_pts[-1] != [1320.0, 209.0]:
        outland_gate_riv_pts.append([1320.0, 209.0])

    # 6B. Sculpt the Trans-Boundary SW Crook–Rift Connector (`is_sw_connector`, `X = 25..375, Y = 1080..1330`):
    sw_pass_ctrl = [
        ( 96.0, 1135.0, 2180.0, 22.0),
        (148.0, 1148.0, 2372.0, 18.0),
        (158.0, 1192.0, 2240.0, 20.0),
        (210.0, 1208.0, 2820.0, 18.0),
        (264.0, 1216.0, 3260.0, 17.0),
        (314.0, 1228.0, 2680.0, 18.0),
        (362.0, 1258.0, 1960.0, 22.0),
    ]
    sw_pass_samples = _catmull_rom_2d(sw_pass_ctrl, n_per_seg=32)
    s_sw = np.linspace(0.0, 1.0, len(sw_pass_samples))
    sw_pass_samples[:, 1] += 6.5 * np.sin(s_sw * 3.0 * math.pi) * np.sin(s_sw * math.pi)

    d2_sw = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    el_sw = h_land_syn.copy()
    hw_sw = np.full((NEW_OH, NEW_OW), 19.0, dtype=float)
    for sx, sy, sel, shw in sw_pass_samples:
        d2 = (px[1030:1510, 0:440] - sx) ** 2 + (py[1030:1510, 0:440] - sy) ** 2
        better = d2 < d2_sw[1030:1510, 0:440]
        d2_sw[1030:1510, 0:440] = np.where(better, d2, d2_sw[1030:1510, 0:440])
        el_sw[1030:1510, 0:440] = np.where(better, sel, el_sw[1030:1510, 0:440])
        hw_sw[1030:1510, 0:440] = np.where(better, shw, hw_sw[1030:1510, 0:440])
    dist_sw = nd.gaussian_filter(np.sqrt(d2_sw), sigma=4.0)
    el_sw = nd.gaussian_filter(el_sw, sigma=5.0)
    d_norm_sw = dist_sw / np.maximum(hw_sw, 1.0)

    h_sw_pass_prof = el_sw + 1450.0 * (G.sstep(0.0, 1.85, d_norm_sw) ** 1.35) + 85.0 * (rn_broad - 0.35) + 45.0 * fbm1
    w_sw_pass_trough = nd.gaussian_filter(1.0 - G.sstep(0.0, 1.75, d_norm_sw), sigma=3.5)
    h_sw_target = h_land_syn * (1.0 - w_sw_pass_trough) + np.minimum(h_land_syn, h_sw_pass_prof) * w_sw_pass_trough
    h_sw_target = h_sw_target * (1.0 - w_cop_pocket) + h_cop_bed * w_cop_pocket

    w_sw_bridge = nd.gaussian_filter((1.0 - G.sstep(0.75, 1.85, d_norm_sw)) * G.sstep(210.0, 262.0, px), sigma=3.5)
    w_sw_apply = np.maximum(w_sw_bridge, w_new_blend * G.sstep(1040.0, 1110.0, py + 12.0 * fbm2))
    En_new = En_new * (1.0 - w_sw_apply) + h_sw_target * w_sw_apply

    # Smoothly grade the SW outer rim (`Y >= 1240, X < 310` outside `w_sw_pass_trough`) using an organic
    # domain-warped transition so there is ZERO rectangular step at `Y = 1335` or `X = 15` (`Batch 2 Image 2`)!
    w_sw_ext = (
        G.sstep(1235.0, 1345.0, py + 18.0 * fbm2 + 9.0 * fbm1)
        * w_new_blend
        * (1.0 - w_sw_pass_trough)
    )
    h_sw_ext_rim = np.maximum(8600.0, h_harm) + 420.0 * (rn_broad - 0.36) + 180.0 * fbm2
    En_new = En_new * (1.0 - w_sw_ext) + h_sw_ext_rim * w_sw_ext

    # 6C. Apply the Trans-Boundary Arachnoid Network & Northern Korona Scenic Canyon (*The Web-Cleaver Gorge*):
    (w_arach_zone, arach_trough_w, arach_rib_h,
     w_canyon, h_canyon_prof, canyon_river_pts) = build_arachnoid_and_canyon_field(px, py, is_arach, is_high_lake, rs)

    w_arach_env = (
        G.sstep(835.0, 875.0, px) * (1.0 - G.sstep(1315.0, 1355.0, px))
        * G.sstep(182.0, 218.0, py) * (1.0 - G.sstep(715.0, 755.0, py))
        * (~is_high_lake).astype(float)
    )
    w_n_korona_breach = (
        G.sstep(905.0, 955.0, px) * (1.0 - G.sstep(1245.0, 1295.0, px))
        * G.sstep(245.0, 285.0, py) * (1.0 - G.sstep(365.0, 415.0, py))
        * np.clip(w_arach_zone * 1.35, 0.0, 1.0)
    )
    h_breach_slope = h_land_syn * 0.75 + (1650.0 + 550.0 * rn_broad) * 0.25
    En_new = En_new * (1.0 - w_n_korona_breach) + np.minimum(En_new, h_breach_slope) * w_n_korona_breach

    En_new = En_new + (arach_rib_h * (1.0 - arach_trough_w) - 580.0 * arach_trough_w) * w_arach_env * np.clip(w_arach_zone + 0.25, 0.0, 1.0)
    En_new = En_new * (1.0 - w_canyon) + np.minimum(En_new, h_canyon_prof) * w_canyon

    # 7. Apply Fluvial & Glacial Stream-Power Weathering (`T.weather`) across the new mountains & scarps
    # using a smooth domain-warped blending envelope (`w_weather_blend`) so `T.weather` NEVER creates a hard line
    # along `d_into_new = 22` or at the Arch boundary!
    weather_mask_new = (
        (is_new_area | (w_ne_connector > 0.15) | (w_sw_bridge > 0.15))
        & ~is_sea & ~is_high_lake & ~is_braid_ch & ~is_copper_tarn & ~old_lake_guard
        & (En_new >= 180.0)
    )
    En_weathered = T.weather(En_new, weather_mask_new)
    w_weather_blend = (
        np.maximum(G.sstep(8.0, 42.0, d_into_new + 14.0 * fbm2 + 7.0 * fbm1), np.maximum(w_ne_connector, w_sw_bridge))
        * (1.0 - 0.85 * w_arch_region)
        * (~is_sea).astype(float) * (~is_high_lake).astype(float) * (~old_lake_guard).astype(float)
    )
    En_new = En_new * (1.0 - w_weather_blend) + En_weathered * w_weather_blend

    # 7B. Cross-boundary crater-wall smoothing & ridge continuity pass along `Y = 330` (`X = 470..1821`) and `X = 272` (`Y = 470..1723`)
    # run AFTER `T.weather` and all connectors so the northern and western crater walls have 100% consistent slopes on both sides!
    # Taper smoothly to 0 near any sea shoreline (`G.sstep(4.0, 26.0, d_in_land)`) so smoothing never stops abruptly at `~is_sea`.
    w_coast_taper = G.sstep(4.0, 26.0, d_in_land)
    w_n_seam_smooth = (
        G.sstep(470.0, 520.0, px)
        * np.exp(-(((py - (DY_F + 10.0 * fbm2)) / 36.0) ** 2))
        * (~old_lake_guard).astype(float)
        * w_coast_taper
        * (~is_high_lake).astype(float)
    )
    w_w_seam_smooth = (
        G.sstep(470.0, 520.0, py)
        * np.exp(-(((px - (DX_F + 10.0 * fbm2)) / 36.0) ** 2))
        * (~old_lake_guard).astype(float)
        * w_coast_taper
        * (~is_copper_tarn).astype(float)
    )
    w_wall_unify = np.clip(np.maximum(w_n_seam_smooth, w_w_seam_smooth), 0.0, 1.0)
    En_wall_smooth = (
        nd.gaussian_filter(En_new, sigma=9.5)
        + 210.0 * (rn_fine - 0.38) * G.sstep(2500.0, 5500.0, En_new)
        + 140.0 * fbm1 * G.sstep(1800.0, 4800.0, En_new)
    )
    En_new = En_new * (1.0 - 0.85 * w_wall_unify) + En_wall_smooth * (0.85 * w_wall_unify)
    # Re-incise the Web-Cleaver Gorge & Outland Gate thalweg across `Y = 330` so smoothing doesn't dam those two rivers:
    En_new = En_new * (1.0 - w_canyon) + np.minimum(En_new, h_canyon_prof) * w_canyon
    En_new = En_new * (1.0 - 0.65 * w_ne_trough * w_ne_connector) + np.minimum(En_new, h_ne_valley) * (0.65 * w_ne_trough * w_ne_connector)

    # 8. Set Water Masks (`whas_new`, `wlev_new`) in the Expanded Territory:
    in_nw_sea_box = is_new_area | ((px < 535.0) & (py < 635.0))
    sea_and_delta_water = (
        (is_new_area & ((is_sea & (En_new < -0.5)) | is_braid_ch))
        | (is_sea & ~old_lake_guard & in_nw_sea_box)
    )
    # Clear any old sea water in the smoothed shoreline transition boxes where `~is_sea` is now land
    retired_old_sea = in_nw_sea_box & ~is_new_area & ~is_sea & ~old_lake_guard
    whas_new[retired_old_sea] = False
    wlev_new[retired_old_sea] = np.nan

    whas_new[sea_and_delta_water] = True
    wlev_new[sea_and_delta_water] = 0.0
    En_new = np.where(sea_and_delta_water, np.minimum(En_new, -2.5), En_new)

    dry_nw_land = in_nw_sea_box & ~sea_and_delta_water & ~is_high_lake & ~is_copper_tarn & ~old_lake_guard
    d_from_sea_water = nd.distance_transform_edt(~sea_and_delta_water)
    w_shore_ramp = G.sstep(0.0, 12.0, d_from_sea_water)
    h_shore_ramp = 2.0 + 48.0 * np.clip(d_from_sea_water / 12.0, 0.0, 1.0)
    En_new = np.where(
        dry_nw_land & (d_from_sea_water < 12.0),
        np.minimum(En_new, En_new * w_shore_ramp + h_shore_ramp * (1.0 - w_shore_ramp)),
        En_new,
    )
    dry_new_land = is_new_area & ~sea_and_delta_water & ~is_high_lake & ~is_copper_tarn
    En_new = np.where(dry_new_land | retired_old_sea, np.maximum(En_new, 2.0), En_new)

    hlake_mask = is_new_area & is_high_lake
    whas_new[hlake_mask] = True
    wlev_new[hlake_mask] = HIGH_LAKE_LEV
    En_new = np.where(hlake_mask, np.minimum(En_new, HIGH_LAKE_LEV - 6.0), En_new)

    whas_new[is_copper_tarn] = True
    wlev_new[is_copper_tarn] = COPPER_TARN_LEV
    En_new = np.where(is_copper_tarn, np.minimum(En_new, COPPER_TARN_LEV - 6.0), En_new)

    # Helper masks for climate & satellite synthesis
    is_tharn_ne = is_ltgrey & (px >= 1300.0) & (py < 360.0)
    w_tharn = np.clip(nd.gaussian_filter(is_tharn_ne.astype(float), sigma=8.0), 0.0, 1.0)
    is_sw_outer = ((is_ltgrey & (px < 285.0) & (py >= 1020.0)) | ((px < 295.0) & (py >= 1280.0))) & ~is_sw_connector
    w_sw_outer = np.clip(nd.gaussian_filter(is_sw_outer.astype(float), sigma=8.0), 0.0, 1.0)
    w_massif = np.clip(nd.gaussian_filter(is_dkgrey.astype(float), sigma=8.0), 0.0, 1.0)
    w_crook_corridor = (
        G.sstep(45.0, 75.0, px) * (1.0 - G.sstep(185.0, 245.0, px))
        * G.sstep(620.0, 690.0, py) * (1.0 - G.sstep(1250.0, 1340.0, py))
        * (~is_sea).astype(float)
    )

    # 9. Build Sinuous River Courses & New Biome Polygons for the Expanded Canvas:
    ria_main_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in ria_samples[::2]]
    if ria_main_pts[-1] != [606.0, 184.0]:
        ria_main_pts.append([606.0, 184.0])

    crook_riv_ctrl = [
        (148.0, 1136.0, 0.0, 1.0),
        (134.0, 1082.0, 0.0, 1.0),
        (114.0, 1026.0, 0.0, 1.0),
        (126.0,  968.0, 0.0, 1.0),
        (104.0,  912.0, 0.0, 1.0),
        (118.0,  854.0, 0.0, 1.0),
        (102.0,  796.0, 0.0, 1.0),
        (116.0,  742.0, 0.0, 1.0),
        (110.0,  695.0, 0.0, 1.0),
        (122.0,  655.0, 0.0, 1.0),
    ]
    crook_riv_samples = _catmull_rom_2d(crook_riv_ctrl, n_per_seg=8)
    crook_riv_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in crook_riv_samples[::2]]

    new_expansion_rivers = [
        {
            'id': 9101,
            'name': 'Ria River',
            'tier': 'main',
            'len_km': 2140.0,
            'q_mouth': 4850.0,
            'q_m3s': [round(220.0 + 4630.0 * (i / max(1, len(ria_main_pts) - 1)), 1) for i in range(len(ria_main_pts))],
            'px': ria_main_pts,
            'to': {'kind': 'sea', 'at_px': ria_main_pts[-1]},
        },
        {
            'id': 9102,
            'name': 'Arachnoid Gorge River (Web-Cleaver)',
            'tier': 'main',
            'len_km': 890.0,
            'q_mouth': 1650.0,
            'q_m3s': [round(380.0 + 1270.0 * (i / max(1, len(canyon_river_pts) - 1)), 1) for i in range(len(canyon_river_pts))],
            'px': canyon_river_pts,
            'to': {'kind': 'river', 'id': 9101, 'at_px': canyon_river_pts[-1]},
        },
        {
            'id': 9103,
            'name': 'Arch Axial Rift River',
            'tier': 'main',
            'len_km': 780.0,
            'q_mouth': 1420.0,
            'q_m3s': [round(140.0 + 1280.0 * (i / max(1, len(arch_riv_pts) - 1)), 1) for i in range(len(arch_riv_pts))],
            'px': arch_riv_pts,
            'to': {'kind': 'sea', 'at_px': arch_riv_pts[-1]},
        },
        {
            'id': 9104,
            'name': 'North Arch Neck River',
            'tier': 'trib',
            'len_km': 310.0,
            'q_mouth': 520.0,
            'q_m3s': [round(85.0 + 435.0 * (i / max(1, len(arch_neck_pts) - 1)), 1) for i in range(len(arch_neck_pts))],
            'px': arch_neck_pts,
            'to': {'kind': 'river', 'id': 9103, 'at_px': arch_neck_pts[-1]},
        },
        {
            'id': 9105,
            'name': 'Copper Meltwater River (The Crook)',
            'tier': 'main',
            'len_km': 980.0,
            'q_mouth': 920.0,
            'q_m3s': [round(120.0 + 800.0 * (i / max(1, len(crook_riv_pts) - 1)), 1) for i in range(len(crook_riv_pts))],
            'px': crook_riv_pts,
            'to': {'kind': 'sea', 'at_px': crook_riv_pts[-1]},
        },
        {
            'id': 9106,
            'name': 'Outland Gate River',
            'tier': 'main',
            'len_km': 680.0,
            'q_mouth': 640.0,
            'q_m3s': [round(180.0 + 460.0 * (i / max(1, len(outland_gate_riv_pts) - 1)), 1) for i in range(len(outland_gate_riv_pts))],
            'px': outland_gate_riv_pts,
            'to': {'kind': 'lake', 'at_px': outland_gate_riv_pts[-1]},
        },
        {
            'id': 9107,
            'name': 'North Ria Fork',
            'tier': 'main',
            'len_km': 740.0,
            'q_mouth': 1380.0,
            'q_m3s': [round(125.0 + 1255.0 * (i / max(1, len(ntrib_pts) - 1)), 1) for i in range(len(ntrib_pts))],
            'px': ntrib_pts,
            'to': {'kind': 'sea', 'at_px': ntrib_pts[-1]},
        },
        {
            'id': 9108,
            'name': 'Massif Cleft River',
            'tier': 'trib',
            'len_km': 340.0,
            'q_mouth': 480.0,
            'q_m3s': [round(90.0 + 390.0 * (i / max(1, len(mtrib_pts) - 1)), 1) for i in range(len(mtrib_pts))],
            'px': mtrib_pts,
            'to': {'kind': 'river', 'id': 9107, 'at_px': mtrib_pts[-1]},
        },
    ]

    new_expansion_regions = [
        {
            'id': 'rmvriavalley',
            'name': 'ria valley',
            'color': '#4d9e56',
            'kind': 'biome',
            'notes': (
                'The Great Ria River Valley: broad fertile alluvial and terraced valley sloping continuously from '
                'the Eastern Highland Lake (+1,460 m) and Tharn foothills westward to the Ring/NW Ocean. Once settled '
                'by the Ancients; hosts a rich hybrid ecology of Earthlike gallery forests, terraced orchards, and '
                'alien symbiotic flora.'
            ),
            'points': [
                [642, 72], [860, 62], [1140, 56], [1395, 74], [1465, 165],
                [1390, 268], [1245, 255], [1080, 240], [885, 245], [645, 232],
            ],
        },
        {
            'id': 'rmvdoubledelta',
            'name': 'double delta',
            'color': '#2c9c91',
            'kind': 'biome',
            'notes': (
                'The Great Double Delta: a massive twin-lobed marshy tide-and-wave delta at 0.0 m basin/sea level '
                'receiving both the main Ria River from the east and the second Arch & Northern Massif river system '
                'from the northwest and north. Features colonial terrestrial sponges and calcified sea-pen fields.'
            ),
            'points': [
                [515, 98], [622, 102], [625, 208], [516, 208], [502, 156],
            ],
        },
        {
            'id': 'rmvarachnoids',
            'name': 'arachnoid canyons',
            'color': '#d96b27',
            'kind': 'biome',
            'notes': (
                'Venusian Volcano-Tectonic Arachnoid Network & The Web-Cleaver Gorge: concentric ring-dike cauldrons '
                'and radial extensional fracture canyons straddling northern, eastern, and SW Korona and the southern Ria '
                'Valley rim. Cleaved by a dramatic 1,200–1,850 m-deep sinuous canyon carrying the Highland Lake river '
                'through northern Korona down into the Ria River.'
            ),
            'points': [
                [845, 185], [1060, 180], [1265, 195], [1345, 295], [1310, 425],
                [1160, 445], [995, 435], [855, 385],
            ],
        },
        {
            'id': 'rmvthearch',
            'name': 'the arch',
            'color': '#3b82a6',
            'kind': 'biome',
            'notes': (
                'The Arch: an exposed undersea mid-ocean spreading ridge over the Steaming Sea (inspired by Capsica\'s '
                'Arch), featuring a double line of parallel rift-shoulder horst ridges (+750 to +2,150 m) with a '
                'lowered axial rift valley and drowned median sound in between, linking the northern Ria coast to the Crook.'
            ),
            'points': [
                [42, 355], [135, 185], [310, 75], [512, 65], [515, 240],
                [355, 295], [215, 435], [125, 555], [45, 520],
            ],
        },
        {
            'id': 'rmvseamounts',
            'name': 'steaming seamounts',
            'color': '#e03c31',
            'kind': 'biome',
            'notes': (
                'Steaming Sea Explosive Seamount Chain: a cluster of shoaling submarine volcanic calderas and '
                'Surtseyan/Krakatoan tuff cones centered in the western Arch. Periodic phreatomagmatic eruptions '
                'and flank collapses generate megatsunamis across the northwest ocean, making ports rare.'
            ),
            'points': [
                [132, 278], [212, 278], [224, 345], [192, 378], [136, 368], [122, 320],
            ],
        },
        {
            'id': 'rmvthecrook',
            'name': 'the crook',
            'color': '#5c8c46',
            'kind': 'biome',
            'notes': (
                'The Crook: a deep tectonic trough squeezed between the western crater wall and the towering Western '
                'Boundary Cordillera. Opens at its northern neck into the Arch via a sea-level tidal fjord (0.0 m) and '
                'slopes continuously upward toward the south into a fumarolic and malachite-stained montane ecosystem.'
            ),
            'points': [
                [52, 535], [195, 535], [185, 820], [175, 1085], [62, 1085], [48, 820],
            ],
        },
        {
            'id': 'rmvcopperglacier',
            'name': 'copper glacier',
            'color': '#2eb899',
            'kind': 'biome',
            'notes': (
                'Copper Glacier & Crook–Rift Glacial Pass: a high-altitude alpine cryosphere in the southern Crook '
                'where glaciers grind through copper-porphyry, malachite, and azurite veins, tinting the banded ice '
                'verdigris-emerald and feeding the turquoise Copper Tarn (+2,380 m). A glaciated alpine pass extends '
                'east-southeast across the western rim to connect The Crook directly with the northwestern head of The Rift.'
            ),
            'points': [
                [52, 1088], [195, 1088], [255, 1185], [365, 1215], [362, 1268],
                [235, 1265], [195, 1345], [48, 1345],
            ],
        },
        {
            'id': 'rmvtharnuplands',
            'name': 'tharn uplands',
            'color': '#b89f7d',
            'kind': 'biome',
            'notes': (
                'NE Tharn Uplands & Outer Rim: high, cold-dry windswept alpine and hypobaric outer-rim plateau '
                '(+5,800 to +9,800 m) inspired by Chris Wayan\'s Tharn, where high-elevation freeze-thaw aridity '
                'meets the airless outer crater rim.'
            ),
            'points': [
                [1435, 18], [1808, 18], [1808, 295], [1565, 295], [1425, 235],
            ],
        },
        {
            'id': 'rmvoutlandpass',
            'name': 'outland gate',
            'color': '#528a58',
            'kind': 'geographic',
            'notes': (
                'Outland Gate (NE Trans-Boundary Water-Gap Pass): a dramatic highland valley and water-gap corridor '
                '(+1,460 to +1,734 m floor framed by +4,400..+7,600 m snow peaks) breaching the northeastern rim to '
                'carry the Outland Gate River from the northern Outland lake directly into the Eastern Highland Lake.'
            ),
            'points': [
                [1345, 215], [1445, 245], [1555, 345], [1565, 475], [1475, 475], [1405, 365],
            ],
        },
    ]

    new_seamount_vents = [
        {
            'px': [176.0, 322.0],
            'floor': -680.0,
            'rim_m': 12.0,
            'r_km': 32.0,
            'name': 'Arch Krakatoan Seamount (Main Caldera)',
            'kind': 'submarine_caldera',
        },
        {
            'px': [166.0, 338.0],
            'floor': -540.0,
            'rim_m': -18.0,
            'r_km': 24.0,
            'name': 'South-West Surtseyan Vent',
            'kind': 'submarine_caldera',
        },
    ]

    return En_new, whas_new, wlev_new, dict(
        masks=masks,
        is_new_area=is_new_area,
        is_sea=is_sea,
        is_seamount=is_seamount,
        is_braid_ch=is_braid_ch,
        is_high_lake=is_high_lake,
        is_copper_tarn=is_copper_tarn,
        w_delta_zone=w_delta_zone,
        w_ria_floodplain=w_ria_floodplain,
        w_crook_corridor=w_crook_corridor,
        w_tharn=w_tharn,
        w_sw_outer=w_sw_outer,
        w_massif=w_massif,
        w_ne_connector=w_ne_connector,
        is_ne_conn_green=is_ne_conn_green,
        w_sw_connector=w_sw_bridge,
        is_sw_conn_green=is_sw_conn_green,
        w_arach_zone=w_arach_zone,
        w_n_korona_breach=w_n_korona_breach,
        arach_trough_w=arach_trough_w,
        arach_rib_h=arach_rib_h,
        w_canyon=w_canyon,
        w_wall_unify=w_wall_unify,
        in_arch_box=in_arch_box,
        w_arch_region=w_arch_region,
        fbm1=fbm1,
        fbm2=fbm2,
        d_into_old=d_into_old,
        sd_new=sd_new,
        old_lake_guard=old_lake_guard,
        new_rivers=new_expansion_rivers,
        new_regions=new_expansion_regions,
        new_vents=new_seamount_vents,
    )
