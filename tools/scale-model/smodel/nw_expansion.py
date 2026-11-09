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
import gc
import heapq
import math
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from . import geom as G, page as P, terrain as T


DX_F, DY_F = P.LEGACY_SHIFT
OLD_OW, OLD_OH = P.LEGACY_FULL_SIZE
NEW_OH, NEW_OW = OLD_OH + DY_F, OLD_OW + DX_F


def _trace_thalweg_dijkstra(E_surf, waypoints, bbox, corridor_hw=26.0, sigma_smooth=1.8):
    """Trace the true minimum-elevation topographic thalweg on `E_surf` through `waypoints`
    within `bbox = (y0, y1, x0, x1)`, penalizing height above the local valley floor and any
    uphill step so the river follows the lowest point of the land and never climbs a hillside."""
    y0, y1, x0, x1 = bbox
    sub_E = E_surf[y0:y1, x0:x1]
    sh, sw = sub_E.shape
    Y_s, X_s = np.indices((sh, sw), dtype=float)
    X_g = X_s + x0
    Y_g = Y_s + y0

    # Build corridor mask around piecewise-linear segments between waypoints
    min_d = np.full((sh, sw), 1e9, dtype=float)
    for i in range(len(waypoints) - 1):
        wx0, wy0 = waypoints[i]
        wx1, wy1 = waypoints[i + 1]
        vx, vy = wx1 - wx0, wy1 - wy0
        l2 = max(vx * vx + vy * vy, 1e-9)
        t = np.clip(((X_g - wx0) * vx + (Y_g - wy0) * vy) / l2, 0.0, 1.0)
        d = np.hypot(X_g - (wx0 + t * vx), Y_g - (wy0 + t * vy))
        min_d = np.minimum(min_d, d)

    in_corr = min_d <= corridor_hw
    # Local valley floor baseline inside the corridor
    E_min_loc = nd.gaussian_filter(nd.minimum_filter(sub_E, size=15), sigma=3.5)
    h_above_floor = np.maximum(0.0, sub_E - E_min_loc)

    nbrs = [
        (-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
        (-1, -1, 1.41421356), (-1, 1, 1.41421356), (1, -1, 1.41421356), (1, 1, 1.41421356),
    ]

    full_path = []
    for seg_i in range(len(waypoints) - 1):
        sx = int(np.clip(round(waypoints[seg_i][0]) - x0, 0, sw - 1))
        sy = int(np.clip(round(waypoints[seg_i][1]) - y0, 0, sh - 1))
        tx = int(np.clip(round(waypoints[seg_i + 1][0]) - x0, 0, sw - 1))
        ty = int(np.clip(round(waypoints[seg_i + 1][1]) - y0, 0, sh - 1))

        dist_g = np.full((sh, sw), 1e18, dtype=float)
        parent_y = np.full((sh, sw), -1, dtype=np.int32)
        parent_x = np.full((sh, sw), -1, dtype=np.int32)
        dist_g[sy, sx] = 0.0
        pq = [(0.0, sy, sx)]

        while pq:
            c_cur, cy, cx = heapq.heappop(pq)
            if cy == ty and cx == tx:
                break
            if c_cur > dist_g[cy, cx]:
                continue
            e_cur = float(sub_E[cy, cx])
            for dy_n, dx_n, ds_n in nbrs:
                ny, nx = cy + dy_n, cx + dx_n
                if ny < 0 or ny >= sh or nx < 0 or nx >= sw:
                    continue
                if not in_corr[ny, nx]:
                    continue
                e_nxt = float(sub_E[ny, nx])
                h_rel = float(h_above_floor[ny, nx])
                uphill = max(0.0, e_nxt - e_cur)
                step_cost = ds_n * (1.0 + 0.14 * ((h_rel / 18.0) ** 2) + 0.45 * ((uphill / 10.0) ** 2))
                nc = c_cur + step_cost
                if nc < dist_g[ny, nx]:
                    dist_g[ny, nx] = nc
                    parent_y[ny, nx] = cy
                    parent_x[ny, nx] = cx
                    heapq.heappush(pq, (nc, ny, nx))

        seg_pts = []
        cy, cx = ty, tx
        if parent_y[cy, cx] == -1 and (cy != sy or cx != sx):
            # Fallback linear interpolation if disconnected
            n_lin = max(2, int(round(math.hypot(tx - sx, ty - sy))))
            for k in range(n_lin + 1):
                u = k / float(n_lin)
                seg_pts.append(( sx + u * (tx - sx) + x0, sy + u * (ty - sy) + y0 ))
        else:
            while cy != -1 and cx != -1:
                seg_pts.append((float(cx + x0), float(cy + y0)))
                if cy == sy and cx == sx:
                    break
                py_n, px_n = int(parent_y[cy, cx]), int(parent_x[cy, cx])
                cy, cx = py_n, px_n
            seg_pts.reverse()

        if seg_i > 0 and seg_pts:
            seg_pts = seg_pts[1:]
        full_path.extend(seg_pts)

    arr_p = np.array(full_path, dtype=float)
    if len(arr_p) >= 5 and sigma_smooth > 0.0:
        xs_sm = nd.gaussian_filter1d(arr_p[:, 0], sigma=sigma_smooth, mode='nearest')
        ys_sm = nd.gaussian_filter1d(arr_p[:, 1], sigma=sigma_smooth, mode='nearest')
        # Keep all waypoint indices pinned
        for wx, wy in waypoints:
            d_wp = np.hypot(arr_p[:, 0] - wx, arr_p[:, 1] - wy)
            idx_wp = int(np.argmin(d_wp))
            w_pin = np.exp(-((np.arange(len(arr_p)) - idx_wp) / 2.2) ** 2)
            xs_sm = xs_sm * (1.0 - w_pin) + wx * w_pin
            ys_sm = ys_sm * (1.0 - w_pin) + wy * w_pin
        arr_p[:, 0] = xs_sm
        arr_p[:, 1] = ys_sm

    return arr_p


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

    # Smooth the NW Inner Sea coastline crossings across `Y = 330` (`X = 445..505, Y = 295..348`)
    # and across `X = 272` (`X = 248..292, Y = 560..612`) so there is ZERO horizontal or vertical step at the seam!
    in_east_shore_cross = (Y >= 295) & (Y <= 348) & (X >= 445) & (X <= 505)
    x_shore_east = 496.0 - 40.0 * G.sstep(295.0, 348.0, Y.astype(float))
    is_ocean = np.where(in_east_shore_cross, X <= x_shore_east, is_ocean)

    in_south_shore_cross = (X >= 248) & (X <= 292) & (Y >= 560) & (Y <= 612)
    y_shore_south = 604.0 - 16.0 * G.sstep(248.0, 292.0, X.astype(float))
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

    # Incorporate the Crook Axial River + gentle, broad valley swales along `is_river_paint`
    # Aligned with the true painted yellow-green valley center (`X ~ 84..106` in the southern Crook `Y = 960..1130`)
    crook_axis_x = (
        116.0 * (1.0 - G.sstep(665.0, 745.0, Y))
        + 100.0 * G.sstep(665.0, 745.0, Y) * (1.0 - G.sstep(935.0, 1010.0, Y))
        + 85.0 * G.sstep(935.0, 1010.0, Y) * (1.0 - G.sstep(1090.0, 1142.0, Y))
        + 142.0 * G.sstep(1090.0, 1142.0, Y)
        + 5.0 * np.sin((Y - 650.0) * 0.018)
    )
    is_crook_riv_line = (
        (Y >= 645.0) & (Y <= 1148.0)
        & (np.abs(X - crook_axis_x) <= 2.5)
    )
    all_riv_seeds = (is_river_paint | is_crook_riv_line) & ~is_sea & ~is_high_lake
    if all_riv_seeds.any():
        d_to_riv, (riy, rix) = nd.distance_transform_edt(~all_riv_seeds, return_indices=True)
        d_to_riv_mod = d_to_riv * (0.76 + 0.36 * rn_broad + 0.18 * rn_fine)
        h_at_riv = nd.gaussian_filter(h_cont, sigma=18.0)[riy, rix]
        # Keep Crook valley broad and gently sloped so it never forms a harsh narrow V-slot trench
        w_is_crook = G.sstep(600.0, 660.0, Y) * (1.0 - G.sstep(220.0, 265.0, X))
        val_incision = np.where(w_is_crook > 0.2, np.clip(18.0 + 0.055 * h_at_riv, 16.0, 78.0), np.clip(14.0 + 0.045 * h_at_riv, 12.0, 68.0))
        h_thalweg = np.maximum(2.5, h_at_riv - val_incision)
        w_riv_valley = (1.0 - G.sstep(0.0, 42.0, d_to_riv_mod)) ** 1.35
        h_cont = h_cont * (1.0 - 0.55 * w_riv_valley) + np.minimum(h_cont, h_thalweg + val_incision * G.sstep(0.0, 42.0, d_to_riv_mod)) * (0.55 * w_riv_valley)

    # Add natural multi-scale topographic texture proportional to elevation (subtle in valleys, rugged on high peaks)
    relief_amp = 18.0 + 0.14 * np.clip(h_cont, 0.0, 6800.0)
    h_cont = h_cont + relief_amp * (0.55 * (rn_broad - 0.38) + 0.30 * (rn_fine - 0.38) + 0.15 * fbm1) * G.sstep(0.0, 5.0, d_from_sea)

    return np.maximum(h_cont, 2.0) * land_mask


def build_arch_midocean_ridge(px, py, is_sea, tier_id, rn_fine, rn_broad, fbm1, fbm2):
    """Sculpt **The Arch** (`X = 30..535, Y = 10..645`) as a dramatic **exposed undersea mid-ocean spreading ridge**
    with a clear **double line of high parallel rift-shoulder horst ridges** (`+750..+2,250 m`) separated by a
    **lowered median axial rift valley / lake chain** (`-65 m..+90 m`), plus a rich tectonic archipelago of elongated
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
        (268.0, 200.0, 1520.0, 10.5),
        (318.0, 166.0, 1640.0, 10.5),
        (368.0, 140.0, 1720.0, 10.5),
        (418.0, 114.0, 1780.0, 11.0),
        (468.0,  90.0, 1880.0, 11.5),
        (508.0,  76.0, 2050.0, 12.5),
    ]
    # 2. Inner (South-Eastern) Rift-Shoulder Horst Ridge Spine [(x, y, crest_m, half_width_px)]:
    # Positioned cleanly SE of the axial rift lake chain so the axial lakes sit squarely inside the median graben!
    inner_ridge_ctrl = [
        (104.0, 558.0,  580.0,  7.5),
        (134.0, 492.0,  710.0,  8.0),
        (164.0, 422.0,  840.0,  8.5),
        (194.0, 352.0,  960.0,  9.0),
        (232.0, 296.0, 1140.0,  9.5),
        (276.0, 262.0, 1320.0, 10.0),
        (326.0, 228.0, 1460.0, 10.0),
        (376.0, 202.0, 1580.0, 10.0),
        (428.0, 192.0, 1640.0, 10.0),
        (478.0, 166.0, 1580.0, 10.0),
        (518.0, 140.0, 1420.0, 10.0),
    ]
    # 3. Median Axial Rift Valley / Trough Centerline passing directly from lake to lake down the axial graben:
    axial_trough_ctrl = [
        ( 83.0, 551.0,  -45.0,  8.5),
        (111.0, 485.0,  -35.0,  8.5),
        (141.0, 413.0,  -25.0,  9.0),
        (170.0, 342.0,  -15.0,  9.5),
        (215.0, 272.0,   18.0,  9.5),
        (258.0, 246.0,   38.0, 10.0),
        (290.5, 228.5,    8.0, 10.5),  # Axial Rift Lake 1
        (335.5, 194.0,    6.0, 11.5),  # Axial Rift Lake 2
        (381.0, 172.0,    6.0, 11.0),  # Axial Rift Lake 3
        (418.0, 168.0,    6.0, 10.5),  # Axial Rift Lake 4
        (457.0, 135.0,    5.0, 12.5),  # Axial Rift Lake 5
        (498.0, 115.0,   14.0, 10.5),  # Valley neck between Lake 5 & Lake 6
        (535.0, 108.0,    4.0, 11.5),  # Axial Rift Lake 6
        (564.0, 122.0,    8.0, 11.5),  # Land confluence with Si-Ma (9104)
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
        (1268.0, 202.0, 1452.0, 12.0),  # Inside SW bay of Eastern Highland Lake (+1,460 m)
        (1248.0, 214.0, 1395.0, 13.0),  # Exits western shoreline outlet of Eastern Highland Lake
        (1220.0, 238.0, 1295.0, 14.0),  # Upper basalt cataract throat
        (1180.0, 276.0, 1145.0, 15.5),  # Enters East Arachnoid ring-graben
        (1136.0, 310.0,  995.0, 15.0),  # Threads hard basalt ring-dike water gap
        (1088.0, 328.0,  875.0, 17.5),  # Northern Korona rim pass cauldron!
        (1046.0, 322.0,  775.0, 18.0),  # Heart of Main North-Korona Arachnoid cauldron
        (1008.0, 292.0,  675.0, 15.5),  # Cleaves NW radial dike gateway
        ( 972.0, 252.0,  575.0, 16.0),  # Lower Travertine Cataract Staircase
        ( 934.0, 212.0,  475.0, 16.5),  # Canyon mouth emerging onto Ria Valley piedmont
        ( 898.0, 174.0,  382.0, 17.0),  # Exact confluence with main Ria River trunk!
    ]
    canyon_samples = _catmull_rom_2d(canyon_ctrl, n_per_seg=25)
    n_cs = len(canyon_samples)
    s_param = np.linspace(0.0, 1.0, n_cs)
    # Subtle natural valley sinuosity, strongly attenuated at endpoints
    meander_envelope = (np.sin(math.pi * s_param) ** 1.25) * G.sstep(0.06, 0.18, s_param) * (1.0 - G.sstep(0.82, 0.95, s_param))
    meander_off = (5.5 * np.sin(s_param * 6.5 * math.pi + 0.4) + 2.5 * np.cos(s_param * 13.0 * math.pi - 0.8)) * meander_envelope
    tangents = np.gradient(canyon_samples[:, :2], axis=0)
    tnorm = np.hypot(tangents[:, 0], tangents[:, 1]) + 1e-9
    normals = np.stack([-tangents[:, 1] / tnorm, tangents[:, 0] / tnorm], axis=-1)
    canyon_samples[:, 0] += normals[:, 0] * meander_off
    canyon_samples[:, 1] += normals[:, 1] * meander_off

    # Evaluate canyon distance using unwarped coordinates near the two endpoints so the lake outlet and Ria junction are 100% clean
    end_taper = G.sstep(180.0, 215.0, Y) * G.sstep(4.0, 14.0, nd.distance_transform_edt(~is_high_lake))
    Xc_eff = X + 0.45 * wx * end_taper
    Yc_eff = Y + 0.45 * wy * end_taper

    d2_can = np.full((OH, OW), 1e12, dtype=float)
    el_can = np.zeros((OH, OW), dtype=float)
    hw_can = np.full((OH, OW), 15.0, dtype=float)

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
    el_can[y0_c:y1_c, x0_c:x1_c] = nd.gaussian_filter(sub_el, sigma=2.5)
    hw_can[y0_c:y1_c, x0_c:x1_c] = sub_hw

    dist_can = np.sqrt(d2_can)
    d_norm_can = dist_can / np.maximum(hw_can, 1.0)
    w_can_inner = 1.0 - G.sstep(0.0, 0.65, d_norm_can)
    w_can_outer = 1.0 - G.sstep(0.45, 1.65, d_norm_can)
    # Suppress arachnoid basalt dike ribs inside the canyon corridor so they never dam the canyon floor!
    arach_rib_tot = arach_rib_tot * (1.0 - 0.95 * w_can_outer)
    # Taper the rocky canyon walls out smoothly by `Y = 175..205` as the river enters the green Ria floodplain
    # and taper at the Highland Lake shoreline so there is no dark scar at either end!
    d_out_hlake = nd.distance_transform_edt(~is_high_lake)
    w_can_ends = G.sstep(172.0, 204.0, Y) * G.sstep(0.0, 4.0, d_out_hlake)
    w_canyon = (0.32 * w_can_outer + 0.68 * w_can_inner) * w_can_ends
    h_canyon_profile = el_can + 480.0 * (np.clip(d_norm_can, 0.0, 1.6) ** 1.45)

    canyon_river_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in canyon_samples[::3]]
    if canyon_river_pts[0] != [1268.0, 202.0]:
        canyon_river_pts.insert(0, [1268.0, 202.0])
    if canyon_river_pts[-1] != [898.0, 174.0]:
        canyon_river_pts.append([898.0, 174.0])
    return w_arach_zone, arach_trough_tot, arach_rib_tot, w_canyon, h_canyon_profile, canyon_river_pts


def synthesize_nw_expansion(Eo_old, whas0_old, wlev0_old, ref_path):
    """Expand `(1393, 1549)` height/water grids to `(1723, 1821)` (`2 km/cell`) using continuous
    isohypse contour interpolation, exposed mid-ocean ridge morphology in The Arch, two river systems
    draining into the Combined Double Delta & Bayou, and seamless crater-wall transitions."""
    rs = np.random.RandomState(500)
    Y, X = np.indices((NEW_OH, NEW_OW))
    px = X.astype(float)
    py = Y.astype(float)

    # 0. Strip only the 5-pixel top/left outer border frame shadow (`r_i in range(5)`, `c_i in range(5)`),
    # and apply an 8-pixel diagonal shoreline alignment ONLY inside the NW Crater Wall shoreline box (`x_old = 140..255`)
    # and southern NW sea shoreline box (`y_old = 200..280`).
    # CRITICAL (`Comment 5`): Do NOT flatten 16 rows on the steep south-facing mountain slope (`x_old >= 260`),
    # because copying row 16 into rows 0..15 creates a 16-px flat shelf that breaks into a steep slope at `Y = 346`!
    Eo_clean_edge = Eo_old.copy()
    whas0_clean_edge = whas0_old.copy()
    wlev0_clean_edge = wlev0_old.copy()
    for r_i in range(5):
        Eo_clean_edge[r_i, :] = Eo_old[5, :]
        whas0_clean_edge[r_i, :] = whas0_old[5, :]
        wlev0_clean_edge[r_i, :] = wlev0_old[5, :]
    for r_i in range(8):
        dx_s = int(round((8 - r_i) * 0.65))
        Eo_clean_edge[r_i, 140:255] = Eo_old[8, 140 - dx_s:255 - dx_s]
        whas0_clean_edge[r_i, 140:255] = whas0_old[8, 140 - dx_s:255 - dx_s]
        wlev0_clean_edge[r_i, 140:255] = wlev0_old[8, 140 - dx_s:255 - dx_s]
    for c_i in range(5):
        Eo_clean_edge[:, c_i] = Eo_clean_edge[:, 5]
        whas0_clean_edge[:, c_i] = whas0_clean_edge[:, 5]
        wlev0_clean_edge[:, c_i] = wlev0_clean_edge[:, 5]
    for c_i in range(8):
        dy_s = int(round((8 - c_i) * 0.85))
        Eo_clean_edge[200:280, c_i] = Eo_clean_edge[200 + dy_s:280 + dy_s, 8]
        whas0_clean_edge[200:280, c_i] = whas0_clean_edge[200 + dy_s:280 + dy_s, 8]
        wlev0_clean_edge[200:280, c_i] = wlev0_clean_edge[200 + dy_s:280 + dy_s, 8]

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
    is_sea = is_ocean & (is_new_area | ((px < 525.0) & (py < 612.0)))
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

    # 3A. The Combined Double Delta & Bayou Complex (`px = 485..632, py = 104..212` — `Comment 4`):
    # Where the Ria River mouth (`id: 9101`), the Arch Axial River mouth (`id: 9103`), and the North Ria Fork (`id: 9107`)
    # all converge into ONE unified, expansive anastomosing delta & bayou archipelago!
    # First, reclaim marshy delta/bayou land across the medium-blue delta fan (`px = 492..626, py = 112..206`)
    # and sculpt 32 lens/teardrop-shaped alluvial bayou & barrier islands so it is rich bayou terrain rather than an open bay!
    r_delta = np.hypot((px - 564.0) * 0.88, (py - 159.0) * 1.18) + 4.5 * fbm2 + 2.2 * fbm1
    w_delta_zone = (
        (1.0 - G.sstep(38.0, 58.0, r_delta))
        * G.sstep(478.0, 496.0, px) * (1.0 - G.sstep(616.0, 636.0, px))
        * G.sstep(100.0, 118.0, py) * (1.0 - G.sstep(198.0, 218.0, py))
    )

    # Emergent alluvial bayou islands & chenier ridges across the combined delta fan (including outer delta front X=486..560):
    delta_bayou_isles = [
        # (xc, yc, rx, ry, angle_deg, peak_m)
        (586.0, 154.0, 14.0, 5.5, -18.0,  8.5),
        (572.0, 168.0, 15.0, 5.8, -14.0,  9.2),
        (596.0, 172.0, 13.5, 5.2, -12.0,  9.8),
        (556.0, 152.0, 14.5, 5.4, -20.0,  7.8),
        (548.0, 178.0, 15.5, 5.6, -15.0,  8.4),
        (574.0, 188.0, 14.0, 5.2, -10.0,  9.0),
        (598.0, 190.0, 12.5, 4.8,  -8.0, 10.2),
        (534.0, 162.0, 13.5, 4.8, -22.0,  6.8),
        (526.0, 184.0, 13.0, 4.6, -16.0,  6.5),
        (554.0, 196.0, 12.5, 4.5, -12.0,  7.2),
        (516.0, 170.0, 11.5, 4.2, -20.0,  5.6),
        (506.0, 188.0, 10.5, 3.8, -18.0,  4.8),
        (522.0, 146.0, 11.5, 4.2, -25.0,  6.2),
        (542.0, 136.0, 12.5, 4.6, -28.0,  7.4),
        (566.0, 136.0, 13.0, 4.8, -24.0,  8.2),
        (584.0, 134.0, 12.0, 4.5, -18.0,  9.4),
        (504.0, 156.0,  9.5, 3.5, -22.0,  4.5),
        (494.0, 174.0,  9.0, 3.2, -18.0,  4.2),
        (512.0, 198.0,  9.5, 3.4, -14.0,  4.6),
        (536.0, 202.0, 10.5, 3.8, -12.0,  5.4),
        (508.0, 140.0,  8.5, 3.0, -26.0,  4.4),
        (528.0, 126.0,  9.5, 3.4, -30.0,  5.8),
        (548.0, 122.0, 10.5, 3.8, -28.0,  6.8),
        (562.0, 162.0, 11.0, 4.2, -16.0,  7.5),
        (540.0, 150.0, 10.5, 3.8, -20.0,  6.4),
        (582.0, 164.0, 11.5, 4.4, -14.0,  8.6),
    ]
    h_bayou_patch = np.full((NEW_OH, NEW_OW), -12.0, dtype=float)
    sub_y0, sub_y1, sub_x0, sub_x1 = 100, 220, 475, 640
    px_d = px[sub_y0:sub_y1, sub_x0:sub_x1] + 1.8 * fbm1[sub_y0:sub_y1, sub_x0:sub_x1]
    py_d = py[sub_y0:sub_y1, sub_x0:sub_x1] + 1.8 * fbm2[sub_y0:sub_y1, sub_x0:sub_x1]
    sub_bayou = h_bayou_patch[sub_y0:sub_y1, sub_x0:sub_x1]
    for dxc, dyc, drx, dry, dang, dpk in delta_bayou_isles:
        th_d = math.radians(dang)
        du = (px_d - dxc) * math.cos(th_d) + (py_d - dyc) * math.sin(th_d)
        dv = -(px_d - dxc) * math.sin(th_d) + (py_d - dyc) * math.cos(th_d)
        rr = np.hypot(du / drx, dv / dry)
        prof_d = dpk * np.maximum(0.0, 1.0 - (rr ** 1.75)) * (0.75 + 0.35 * rn_fine[sub_y0:sub_y1, sub_x0:sub_x1]) - 6.0 * np.maximum(0.0, rr - 0.92)
        sub_bayou = np.maximum(sub_bayou, prof_d)
    h_bayou_patch[sub_y0:sub_y1, sub_x0:sub_x1] = sub_bayou

    # Anastomosing braided distributary channels & bayou sloughs weaving through the Combined Double Delta:
    braid_channel_Visual_Polylines = [
        # Main combined Ria–Arch central distributary trunk
        [(626.0, 180.0), (606.0, 172.0), (590.0, 158.0), (566.0, 162.0), (540.0, 168.0), (514.0, 178.0), (490.0, 186.0)],
        # Northern Arch & Pak-Ma converging distributary trunk
        [(564.0, 122.0), (576.0, 140.0), (590.0, 158.0)],
        # Pak-Ma eastern entry into combined delta hub
        [(622.0, 142.0), (604.0, 150.0), (590.0, 158.0)],
        # NW Bayou Distributary Fork (branches off at 576, 140 across northern delta)
        [(576.0, 140.0), (552.0, 144.0), (528.0, 152.0), (502.0, 162.0)],
        # North-Central Bayou Cross-Slough (links Pak-Ma to NW Bayou Fork)
        [(604.0, 150.0), (582.0, 146.0), (558.0, 156.0), (534.0, 158.0), (510.0, 146.0)],
        # South-Central Bayou Distributary (branches off Ria at 606, 172 through southern marsh islands)
        [(606.0, 172.0), (584.0, 180.0), (558.0, 184.0), (532.0, 190.0), (504.0, 196.0)],
        # Cross-Bayou Tie Channel 1 (breaches the former solid yellow land bridge between Y=145 and Y=180!)
        [(598.0, 152.0), (594.0, 166.0), (584.0, 180.0)],
        # Cross-Bayou Tie Channel 2 (central anastomosing loop)
        [(576.0, 150.0), (566.0, 162.0), (558.0, 184.0)],
        # Southern Marginal Bayou Slough
        [(584.0, 180.0), (568.0, 194.0), (542.0, 198.0), (518.0, 204.0)],
        # Northern Marginal Bayou Slough
        [(568.0, 128.0), (544.0, 130.0), (518.0, 136.0)],
    ]
    d_braid_min = np.full((NEW_OH, NEW_OW), 1e9, dtype=float)
    for b_line in braid_channel_Visual_Polylines:
        b_ctrl = [(pt[0], pt[1], 0.0, 1.8) for pt in b_line]
        b_s = _catmull_rom_2d(b_ctrl, n_per_seg=14)
        for bsx, bsy, _, _ in b_s:
            d2_b = (px_d - bsx) ** 2 + (py_d - bsy) ** 2
            d_braid_min[sub_y0:sub_y1, sub_x0:sub_x1] = np.minimum(d_braid_min[sub_y0:sub_y1, sub_x0:sub_x1], np.sqrt(d2_b))

    # Add fine FBM warp to channel width (`1.45..2.35 px`) so distributary channels wind organically between islands
    ch_hw_d = 1.75 + 0.55 * fbm1 + 0.35 * (rn_fine - 0.4)
    is_braid_ch = (d_braid_min <= ch_hw_d) & (w_delta_zone > 0.08)

    # Reclaim emergent delta & bayou islands (`h_bayou_patch > 1.2 m`) from `is_ocean` / `is_sea` inside the delta fan,
    # while carving `is_braid_ch` channels through the former solid yellow land divide (`Y = 140..185, X = 545..620`)!
    is_reclaimed_delta_isle = (h_bayou_patch > 1.2) & ~is_braid_ch & (w_delta_zone > 0.12)
    is_ocean = (is_ocean & ~is_reclaimed_delta_isle) | is_braid_ch
    is_sea = (is_sea & ~is_reclaimed_delta_isle) | is_braid_ch
    tier_id = np.where(is_reclaimed_delta_isle & (tier_id == 0), 1, tier_id)

    d_from_braid = nd.distance_transform_edt(~is_braid_ch)
    h_delta_islands = np.where(
        is_braid_ch,
        -5.0 - 3.5 * G.sstep(0.0, 2.2, nd.distance_transform_edt(is_braid_ch)),
        np.maximum(2.2, np.minimum(11.5, 2.2 + 5.8 * G.sstep(0.0, 4.5, d_from_braid) + 0.45 * np.maximum(0.0, h_bayou_patch) + 1.4 * fbm1)),
    )
    w_delta_land = w_delta_zone * (~is_sea).astype(float)
    h_land_syn = h_land_syn * (1.0 - w_delta_land) + h_delta_islands * w_delta_land

    # 3B. Preserve the 6 Axial Rift Valley Lakes in The Arch (`Comment 0`) & Guarantee `Si-Ma` (`id: 9104`) Runs on Solid Land!
    # The 6 Axial Rift Valley Lakes in The Arch (`(290.5, 228.5)`, `(335.5, 194.0)`, `(381.0, 172.0)`, `(418.0, 168.0)`,
    # `(457.0, 135.0)`, `(535.0, 108.0)`) are separated by low alluvial valley necks so `id: 9103` flows from lake to lake!
    arch_axial_lakes = [
        # (xc, yc, rx, ry, angle_deg)
        (290.5, 228.5,  8.5, 4.5, -35.0),  # Axial Lake 1
        (335.5, 194.0, 16.5, 6.2, -34.0),  # Axial Lake 2
        (381.0, 172.0, 13.5, 4.8, -24.0),  # Axial Lake 3
        (418.0, 168.0,  8.5, 4.2, -20.0),  # Axial Lake 4
        (457.0, 135.0, 19.5, 7.2, -32.0),  # Axial Lake 5
        (535.0, 108.0, 16.5, 4.6,  -8.0),  # Axial Lake 6
    ]
    is_arch_axial_lake = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    px_al = px[:265, 250:570] + 1.2 * fbm1[:265, 250:570]
    py_al = py[:265, 250:570] + 1.2 * fbm2[:265, 250:570]
    sub_al = is_arch_axial_lake[:265, 250:570]
    for lxc, lyc, lrx, lry, lang in arch_axial_lakes:
        th_l = math.radians(lang)
        lu = (px_al - lxc) * math.cos(th_l) + (py_al - lyc) * math.sin(th_l)
        lv = -(px_al - lxc) * math.sin(th_l) + (py_al - lyc) * math.cos(th_l)
        sub_al |= (np.hypot(lu / lrx, lv / lry) <= 1.0)
    is_arch_axial_lake[:265, 250:570] = sub_al

    # Ensure the short inter-lake valley necks between Lakes 1..6 (`(312, 210)`, `(360, 180)`, `(403, 170)`,
    # `(434, 154)`, `(498, 115)`, `(564, 122)`) are dry alluvial rift floor above sea level, WITHOUT clamping
    # the surrounding high rift-shoulder horst ridges into circular depressions!
    inter_lake_necks = [
        (258.0, 246.0, 10.5),
        (312.0, 210.0,  8.5),
        (360.0, 180.0,  7.5),
        (403.0, 170.0,  7.0),
        (434.0, 154.0,  7.5),
        (498.0, 115.0, 12.0),
        (564.0, 122.0, 10.5),
    ]
    is_arch_neck_land = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    px_nw = px + 2.2 * fbm1
    py_nw = py + 2.2 * fbm2
    for nxc, nyc, nr_px in inter_lake_necks:
        is_arch_neck_land |= (np.hypot(px_nw - nxc, py_nw - nyc) <= nr_px) & (w_arch_trough >= 0.25) & ~is_arch_axial_lake

    is_ocean = (is_ocean | is_arch_axial_lake) & ~is_arch_neck_land
    is_sea = (is_sea | is_arch_axial_lake) & ~is_arch_neck_land
    # Never upper-clamp `h_land_syn` inside `is_arch_neck_land`—only ensure the trough floor stays above sea level!
    h_land_syn = np.where(is_arch_neck_land, np.maximum(h_land_syn, 8.0 + 4.0 * rn_fine), h_land_syn)

    # 3C. Eastern Highland Lake (`is_high_lake` around `[1295, 206]`, surface `+1,460.0 m`):
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

    # 3D. Copper Tarn (`[148, 1148]`, water level `+2,380.0 m`) in the southern Crook:
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

    # Recompute `d_in_sea` and `d_in_land` after Combined Double Delta & Arch Axial Lake updates
    d_in_sea = nd.distance_transform_edt(np.pad(is_sea, ((75, 0), (75, 0)), mode='edge'))[75:, 75:]
    d_in_land = nd.distance_transform_edt(~is_sea)
    h_seamount_edifice = np.where(is_braid_ch | is_arch_axial_lake, -6.5, h_seamount_edifice)

    # Tight shoreline transition (`-1.2..+1.8 px`) so narrow archipelago & delta islands stay crisp above sea level!
    w_land_coast = G.sstep(-1.2, 1.8, d_in_land - d_in_sea)
    h_syn = np.where(
        is_seamount & (h_seamount_edifice > -35.0),
        h_seamount_edifice,
        h_seamount_edifice * (1.0 - w_land_coast) + h_land_syn * w_land_coast,
    )

    # 4A. Carve River System 1 — The Main Southern Ria River (`id: 9101`):
    # Flows with sweeping alluvial S-bend meanders along the main southern Ria valley (`Comment 3`), staying well south
    # (`Y = 164..196`) of `Pak-Ma` (`id: 9107`, `Y = 109..136`) so there is a wide 40–55 px interfluve between them!
    ria_trunk_ctrl = [
        (1312.0,  96.0, 1340.0, 14.0),  # Upper eastern light-blue headwater in Paint!
        (1258.0, 120.0, 1170.0, 16.5),  # Upper S-bend south of NE uplands
        (1196.0,  92.0,  980.0, 19.0),  # Bows north around eastern arachnoid foothills
        (1124.0, 134.0,  810.0, 22.0),  # Exact confluence with Neo-Ozark Porphyry Fork (`id: 9109`)!
        (1062.0, 124.0,  660.0, 25.0),  # Curves WNW into alluvial meander loop
        ( 996.0, 174.0,  535.0, 27.5),  # Sweeping southward meander bend
        ( 944.0, 152.0,  450.0, 29.5),  # Moderate northward alluvial loop
        ( 898.0, 174.0,  382.0, 31.0),  # Exact confluence with Arachnoid Gorge River (Web-Cleaver, `id: 9102`)!
        ( 844.0, 166.0,  295.0, 33.5),  # Gentle northward meander loop well south of Pak-Ma!
        ( 784.0, 194.0,  210.0, 35.5),  # Deep southward meander loop across the middle Ria floodplain
        ( 726.0, 172.0,  130.0, 38.0),  # Moderate northward bend (`> 48 px` south of Pak-Ma!)
        ( 672.0, 194.0,   60.0, 40.5),  # Broad lower-valley southward loop
        ( 626.0, 180.0,   14.0, 42.5),  # Enters eastern apex of the Combined Double Delta
        ( 606.0, 169.0,    6.0, 44.0),  # Approaches central delta hub
        ( 590.0, 158.0,    2.5, 45.0),  # Central Combined Double Delta confluence with Arch River (9103) & Pak-Ma (9107)!
        ( 566.0, 162.0,    1.5, 45.0),  # Braids WSW through the Combined Double Delta islands
        ( 540.0, 168.0,    0.8, 45.0),
        ( 514.0, 178.0,    0.4, 45.0),
        ( 490.0, 186.0,    0.0, 45.0),  # Main Ria–Arch combined mouth at the NW Sea!
    ]
    ria_samples = _catmull_rom_2d(ria_trunk_ctrl, n_per_seg=18)
    n_ria = len(ria_samples)
    s_ria = np.linspace(0.0, 1.0, n_ria)
    # Pin confluences at (1124, 134) (index 3/18) and (898, 174) (index 7/18) and delta section (s >= 0.72)
    pin_w = (
        np.sin(math.pi * s_ria) ** 0.75
        * (1.0 - 0.98 * np.exp(-((s_ria - (3.0 / 18.0)) / 0.022) ** 2))
        * (1.0 - 0.98 * np.exp(-((s_ria - (7.0 / 18.0)) / 0.022) ** 2))
        * (1.0 - G.sstep(0.68, 0.76, s_ria))
    )
    ria_meander_off = (
        5.2 * np.sin(s_ria * 15.0 * math.pi + 0.35)
        + 2.5 * np.sin(s_ria * 29.0 * math.pi - 0.80)
    ) * pin_w
    t_ria = np.gradient(ria_samples[:, :2], axis=0)
    tn_ria = np.hypot(t_ria[:, 0], t_ria[:, 1]) + 1e-9
    nrm_ria = np.stack([-t_ria[:, 1] / tn_ria, t_ria[:, 0] / tn_ria], axis=-1)
    ria_samples[:, 0] += nrm_ria[:, 0] * ria_meander_off
    ria_samples[:, 1] += nrm_ria[:, 1] * ria_meander_off

    # 4B. Carve River System 2 — The Arch Lake-to-Lake River (`id: 9103`), `Si-Ma` on Solid Land (`id: 9104`),
    # and the Flaring Dendritic Northern Tributary Valleys (`id: 9107` & `id: 9108`):
    #Branch 2A (`id: 9103`, `Comment 0`): Flows directly FROM LAKE TO LAKE down the axial rift valley of The Arch
    # (`Lake 1 -> Lake 2 -> Lake 3 -> Lake 4 -> Lake 5 -> Lake 6 -> Lake 7`) and into the Combined Double Delta hub `(590.0, 158.0)`!
    arch_river_ctrl = [
        (258.0, 246.0,  62.0,  8.5),  # Headwaters in the axial rift graben SW of Lake 1
        (290.5, 228.5,  14.0,  9.5),  # Center of Axial Rift Lake 1 (comp 20)
        (312.0, 210.0,  22.0,  9.5),  # Alluvial rift neck between Lake 1 & Lake 2
        (335.5, 194.0,  10.0, 10.5),  # Center of Axial Rift Lake 2 (comp 14)
        (360.0, 180.0,  18.0, 10.0),  # Alluvial rift neck between Lake 2 & Lake 3
        (381.0, 172.0,   8.0, 10.5),  # Center of Axial Rift Lake 3 (comp 12)
        (403.0, 170.0,  15.0, 10.0),  # Alluvial rift neck between Lake 3 & Lake 4
        (418.0, 168.0,   7.0, 10.5),  # Center of Axial Rift Lake 4 (comp 11)
        (434.0, 154.0,  14.0, 10.5),  # Alluvial rift neck between Lake 4 & Lake 5
        (457.0, 135.0,   6.0, 11.5),  # Center of Axial Rift Lake 5 (comp 4)
        (498.0, 115.0,  12.0, 11.0),  # Alluvial rift neck between Lake 5 & Lake 6
        (535.0, 108.0,   4.0, 11.5),  # Center of Axial Rift Lake 6 (comp 2)
        (558.0, 113.0,   7.5, 12.0),  # Dry land neck between Lake 6 & Lake 7 where Si-Ma (`id: 9104`) joins!
        (571.8, 118.0,   3.5, 12.5),  # Center of Axial Rift Lake 7 (comp 3)
        (580.0, 138.0,   3.0, 14.0),  # Enters Combined Double Delta northern distributary fork
        (590.0, 158.0,   2.5, 15.0),  # Joins Ria River (`id: 9101`) & Pak-Ma (`id: 9107`) in Combined Double Delta!
    ]
    arch_riv_samples = _catmull_rom_2d(arch_river_ctrl, n_per_seg=10)
    arch_riv_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in arch_riv_samples[::2]]
    if arch_riv_pts[-1] != [590.0, 158.0]:
        arch_riv_pts.append([590.0, 158.0])

    # Branch 2B (`id: 9104`, `Si-Ma`, `Comment 1`): Originates high in the Northern Mountain Massif (`(596, 24)`, `~3,450 m`)
    # and descends SW down the mountain slope onto the central upland spine of the Northern Arch Peninsula
    # (`(596, 24) -> (574, 38) -> (554, 56) -> (553, 78) -> (556, 96) -> (558, 113)`), running 100% on land!
    arch_north_neck_ctrl = [
        (596.0,  24.0, 3450.0,  5.5),  # Headwaters high in the Northern Mountain Massif
        (574.0,  38.0, 1850.0,  8.0),  # Descends western mountain flank
        (554.0,  56.0,  620.0, 10.5),  # Enters Northern Arch upland spine
        (553.0,  78.0,  210.0, 12.5),
        (556.0,  96.0,   65.0, 14.0),  # Runs on solid land east of Axial Lake 6
        (558.0, 113.0,    7.5, 15.5),  # Joins Arch Axial River (`id: 9103`) on dry land at `[558.0, 113.0]`!
    ]
    arch_neck_samples = _catmull_rom_2d(arch_north_neck_ctrl, n_per_seg=12)
    s_an = np.linspace(0.0, 1.0, len(arch_neck_samples))
    an_off = (2.2 * np.sin(s_an * 5.0 * math.pi + 0.3)) * (np.sin(math.pi * s_an) ** 1.2)
    t_an = np.gradient(arch_neck_samples[:, :2], axis=0)
    tn_an = np.hypot(t_an[:, 0], t_an[:, 1]) + 1e-9
    arch_neck_samples[:, 0] += (-t_an[:, 1] / tn_an) * an_off
    arch_neck_samples[:, 1] += ( t_an[:, 0] / tn_an) * an_off
    arch_neck_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in arch_neck_samples[::2]]
    if arch_neck_pts[-1] != [558.0, 113.0]:
        arch_neck_pts.append([558.0, 113.0])

    # Explicitly guarantee a 5.5-px dry land corridor along every vertex of `Si-Ma` (`id: 9104`) so it never touches water!
    sima_land_guard = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    for sx_n, sy_n, _, _ in arch_neck_samples:
        sima_land_guard |= (np.hypot(px - sx_n, py - sy_n) <= 5.5)
    is_ocean = is_ocean & ~sima_land_guard
    is_sea = is_sea & ~sima_land_guard
    is_arch_axial_lake = is_arch_axial_lake & ~sima_land_guard
    h_syn = np.where(sima_land_guard, np.maximum(h_syn, 14.0), h_syn)

    # Branch 2C (`id: 9107`, `Pak-Ma`): Northern Massif Valley River (`(885, 109) -> ... -> (645, 138) -> (590, 158)`)
    # Flares progressively from a narrow headwater swale (`hw = 7 px`) to a broad open alluvial valley (`hw = 38 px`)
    # and joins the Combined Double Delta confluence hub at `(590.0, 158.0)`!
    ria_north_trib_ctrl = [
        (885.0, 108.0, 680.0,  7.0),
        (838.0, 114.0, 545.0, 12.0),
        (788.0, 114.0, 420.0, 17.5),
        (738.0, 120.0, 310.0, 23.0),
        (692.0, 122.0, 210.0, 28.0),
        (645.0, 134.0, 115.0, 33.0),  # Confluence with Massif Cleft River (`id: 9108`)
        (616.0, 144.0,  32.0, 36.0),
        (590.0, 158.0,   2.5, 38.0),  # Converges into Combined Double Delta hub with Ria (9101) & Arch (9103)!
    ]
    ntrib_samples = _catmull_rom_2d(ria_north_trib_ctrl, n_per_seg=16)
    s_nt = np.linspace(0.0, 1.0, len(ntrib_samples))
    nt_off = (2.2 * np.sin(s_nt * 7.0 * math.pi + 0.5)) * (np.sin(math.pi * s_nt) ** 1.2) * (1.0 - G.sstep(0.72, 0.90, s_nt))
    t_nt = np.gradient(ntrib_samples[:, :2], axis=0)
    tn_nt = np.hypot(t_nt[:, 0], t_nt[:, 1]) + 1e-9
    ntrib_samples[:, 0] += (-t_nt[:, 1] / tn_nt) * nt_off
    ntrib_samples[:, 1] += ( t_nt[:, 0] / tn_nt) * nt_off
    ntrib_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in ntrib_samples[::2]]
    if ntrib_pts[-1] != [590.0, 158.0]:
        ntrib_pts.append([590.0, 158.0])

    # Branch 2D (`id: 9108`, `Comment 1`): Sub-Massif Tributary (`(772, 68) -> (716, 82) -> (674, 106) -> (645, 134)`)
    # Flares from `hw = 5.5 px` at the headwater divide (`s = 0`, where incision = 0 m so there is ZERO circular dead-end cap!)
    # to `hw = 30.0 px` at its confluence `(645, 134)` with `id: 9107`!
    massif_trib_ctrl = [
        (772.0,  68.0, 820.0,  5.5),
        (716.0,  82.0, 510.0, 13.5),
        (674.0, 104.0, 260.0, 22.0),
        (645.0, 134.0, 115.0, 30.0),  # Joins Northern Massif Valley River (`id: 9107`)!
    ]
    mtrib_samples = _catmull_rom_2d(massif_trib_ctrl, n_per_seg=16)
    s_mt = np.linspace(0.0, 1.0, len(mtrib_samples))
    mt_off = (3.2 * np.sin(s_mt * 5.0 * math.pi + 0.4)) * (np.sin(math.pi * s_mt) ** 1.2)
    t_mt = np.gradient(mtrib_samples[:, :2], axis=0)
    tn_mt = np.hypot(t_mt[:, 0], t_mt[:, 1]) + 1e-9
    mtrib_samples[:, 0] += (-t_mt[:, 1] / tn_mt) * mt_off
    mtrib_samples[:, 1] += ( t_mt[:, 0] / tn_mt) * mt_off
    mtrib_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in mtrib_samples[::2]]
    if mtrib_pts[-1] != [645.0, 134.0]:
        mtrib_pts.append([645.0, 134.0])

    # Carve natural, flaring, headwater-tapered dendritic valleys (`Comment 1`) for the Ria & Northern River systems:
    # Each sample stores `(sx, sy, s_headwater_taper, shw)` where `s_headwater_taper` starts at `0.0` at the headwater divide
    # (eliminating any rounded dead-end furrow cap!) and increases smoothly downstream as the valley widens and deepens!
    def _tag_taper(samples, s0_val=0.0):
        n_s = len(samples)
        s_arr = np.linspace(s0_val, 1.0, n_s) ** 0.85
        out_s = samples.copy()
        out_s[:, 2] = s_arr
        return out_s

    all_valley_samples = np.vstack([
        _tag_taper(ria_samples, s0_val=0.18),
        _tag_taper(ntrib_samples, s0_val=0.0),
        _tag_taper(mtrib_samples, s0_val=0.0),
        _tag_taper(arch_neck_samples, s0_val=0.0),
    ])
    d2_ria = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    s_taper_ria = np.zeros((NEW_OH, NEW_OW), dtype=float)
    hw_ria = np.full((NEW_OH, NEW_OW), 20.0, dtype=float)
    for sx, sy, s_tap, shw in all_valley_samples:
        d2 = (px[:320, 240:1420] - sx) ** 2 + (py[:320, 240:1420] - sy) ** 2
        better = d2 < d2_ria[:320, 240:1420]
        d2_ria[:320, 240:1420] = np.where(better, d2, d2_ria[:320, 240:1420])
        s_taper_ria[:320, 240:1420] = np.where(better, s_tap, s_taper_ria[:320, 240:1420])
        hw_ria[:320, 240:1420] = np.where(better, shw, hw_ria[:320, 240:1420])

    # Modulate lateral valley distance with multi-scale ridged & FBM spur noise so contour lines form natural
    # V-shaped dendritic side-valleys and interlocking mountain spurs rather than a uniform cylindrical furrow!
    spur_mod = 0.72 + 0.44 * rn_broad + 0.24 * rn_fine + 0.14 * fbm1
    dist_ria = nd.gaussian_filter(np.sqrt(d2_ria), sigma=1.8) * np.clip(spur_mod, 0.48, 1.55)
    s_taper_ria = nd.gaussian_filter(s_taper_ria, sigma=3.5)
    hw_ria = nd.gaussian_filter(hw_ria, sigma=3.0)
    d_norm_ria = dist_ria / np.maximum(hw_ria, 1.0)

    h_bg_slope = nd.gaussian_filter(h_syn, sigma=18.0)
    max_val_cut = np.clip(35.0 + 0.28 * h_bg_slope, 28.0, 460.0) * s_taper_ria
    w_ria_val = ((1.0 - G.sstep(0.0, 1.55, d_norm_ria)) ** 1.35) * s_taper_ria * (1.0 - w_delta_zone) * (~is_sea).astype(float)
    w_ria_floodplain = (1.0 - G.sstep(0.0, 0.75, d_norm_ria)) * s_taper_ria * (1.0 - w_delta_zone) * (~is_sea).astype(float)
    h_ria_thalweg = np.maximum(3.5, h_bg_slope - max_val_cut * (1.0 - (G.sstep(0.0, 1.55, d_norm_ria) ** 1.15)))
    h_syn = h_syn * (1.0 - 0.82 * w_ria_val) + np.minimum(h_syn, h_ria_thalweg) * (0.82 * w_ria_val)

    # 5. Embed Old Map `[DY_F:, DX_F:]` with Wide, Domain-Warped Crater-Wall Continuity & Smoothing:
    En_new = h_harm.copy()
    whas_new = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    wlev_new = np.full((NEW_OH, NEW_OW), np.nan, dtype=float)

    En_new[DY_F:, DX_F:] = Eo_clean_edge
    whas_new[DY_F:, DX_F:] = whas0_clean_edge
    wlev_new[DY_F:, DX_F:] = wlev0_clean_edge

    d_into_new = nd.distance_transform_edt(is_new_area)
    d_into_old = nd.distance_transform_edt(~is_new_area)
    sd_new = (d_into_new - d_into_old) + 22.0 * fbm2 + 11.0 * fbm1
    old_lake_guard = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    # CRITICAL (`Comment 2`): `old_lake_guard` must guard all high-altitude inland lakes (`wlev0 >= 50 m`, including
    # Cold Lake at `px 414, 506`) and all interior Farside/NW shorelines away from the `X = 272` and `Y = 330` seams,
    # relaxing only on `0.0 m` coastal ocean pixels right at the `Y = 330` (`X < 525, Y < 342`) and `X = 272`
    # (`X < 288, Y < 612`) seam crossings!
    old_seam_sea_relax = (
        (np.nan_to_num(wlev0_clean_edge, nan=0.0) < 50.0)
        & (
            ((px[DY_F:, DX_F:] < 525.0) & (py[DY_F:, DX_F:] < DY_F + 12.0))
            | ((px[DY_F:, DX_F:] < DX_F + 16.0) & (py[DY_F:, DX_F:] < 612.0))
        )
    )
    old_lake_guard[DY_F:, DX_F:] = (
        whas0_clean_edge
        & ~is_sea[DY_F:, DX_F:]
        & ~old_seam_sea_relax
    )
    old_lake_guard = nd.binary_dilation(old_lake_guard, iterations=8)

    w_new_blend = np.where(old_lake_guard, G.sstep(0.0, 18.0, d_into_new), G.sstep(-48.0, 48.0, sd_new))
    w_nw_sea_floor = G.sstep(0.0, 12.0, d_in_sea) * (1.0 - G.sstep(465.0, 525.0, px)) * (1.0 - G.sstep(515.0, 585.0, py))
    w_coast_new = (1.0 - G.sstep(0.0, 28.0, d_in_land)) * G.sstep(-6.0, 6.0, d_into_new - d_into_old)
    w_new_blend = np.maximum(w_new_blend, np.maximum(w_nw_sea_floor, w_coast_new))
    En_new = En_new * (1.0 - w_new_blend) + h_syn * w_new_blend

    # 6A. Sculpt the Trans-Boundary NE Outland Gate (`is_ne_connector`, `X = 1318..1605, Y = 205..525` — `Comment 3`):
    # Align the valley centerline directly along the painted `is_ne_conn_green` valley floor so there is ONE unified,
    # natural yellow-green valley floor from North Outland Lake `(1588, 517)` -> upper tarn `(1545, 477)` ->
    # Eastern Highland Lake `(1320, 209)`, without swinging into the steep eastern mountain wall!
    ne_pass_ctrl = [
        (1320.0, 209.0, 1456.0, 18.0),  # Inside eastern bay of Eastern Highland Lake (+1,460 m)!
        (1366.0, 240.0, 1495.0, 20.0),
        (1408.0, 286.0, 1545.0, 22.0),
        (1442.0, 338.0, 1595.0, 23.0),  # Crosses Y = 330 inside the water-gap pass
        (1472.0, 386.0, 1640.0, 23.5),  # Center of the yellow-green valley floor!
        (1502.0, 430.0, 1682.0, 22.5),
        (1526.0, 456.0, 1706.0, 20.5),
        (1545.0, 477.0, 1720.0, 19.0),  # Threads through upper North Outland tarn
        (1565.0, 496.0, 1726.0, 17.5),
        (1588.0, 517.0, 1732.0, 16.5),  # Connects directly into the main North Outland Lake (+1,734 m)!
    ]
    ne_pass_samples = _catmull_rom_2d(ne_pass_ctrl, n_per_seg=22)
    s_ne = np.linspace(0.0, 1.0, len(ne_pass_samples))
    ne_meander_env = (np.sin(math.pi * s_ne) ** 1.2) * G.sstep(0.05, 0.16, s_ne) * (1.0 - G.sstep(0.80, 0.94, s_ne))
    ne_meander_off = (4.2 * np.sin(s_ne * 5.0 * math.pi + 0.25)) * ne_meander_env
    t_ne = np.gradient(ne_pass_samples[:, :2], axis=0)
    tn_ne = np.hypot(t_ne[:, 0], t_ne[:, 1]) + 1e-9
    ne_pass_samples[:, 0] += (-t_ne[:, 1] / tn_ne) * ne_meander_off
    ne_pass_samples[:, 1] += ( t_ne[:, 0] / tn_ne) * ne_meander_off

    d2_ne = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    el_ne = h_land_syn.copy()
    hw_ne = np.full((NEW_OH, NEW_OW), 22.0, dtype=float)
    for sx, sy, sel, shw in ne_pass_samples:
        d2 = (px[140:555, 1250:1650] - sx) ** 2 + (py[140:555, 1250:1650] - sy) ** 2
        better = d2 < d2_ne[140:555, 1250:1650]
        d2_ne[140:555, 1250:1650] = np.where(better, d2, d2_ne[140:555, 1250:1650])
        el_ne[140:555, 1250:1650] = np.where(better, sel, el_ne[140:555, 1250:1650])
        hw_ne[140:555, 1250:1650] = np.where(better, shw, hw_ne[140:555, 1250:1650])
    dist_ne = nd.gaussian_filter(np.sqrt(d2_ne), sigma=3.5)
    el_ne = nd.gaussian_filter(el_ne, sigma=4.5)
    d_norm_ne = dist_ne / np.maximum(hw_ne, 1.0)

    h_ne_valley = el_ne + 1750.0 * (G.sstep(0.0, 1.85, d_norm_ne) ** 1.35) + 75.0 * (rn_broad - 0.35) + 38.0 * fbm1
    w_ne_trough = 1.0 - G.sstep(0.0, 1.65, d_norm_ne)
    # Use `np.minimum(En_new, h_ne_valley)` inside the valley trough so the +4,500 m mountain wall never mixes into
    # the valley bottom or shifts the thalweg away from the valley center!
    w_ne_connector = nd.gaussian_filter(1.0 - G.sstep(0.50, 1.95, d_norm_ne), sigma=4.0) * (1.0 - G.sstep(488.0, 522.0, py)) * (~is_high_lake).astype(float) * (~whas_new).astype(float)
    En_new = En_new * (1.0 - w_ne_connector) + np.minimum(En_new, h_ne_valley) * w_ne_connector

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

    w_sw_ext = (
        G.sstep(1235.0, 1345.0, py + 18.0 * fbm2 + 9.0 * fbm1)
        * w_new_blend
        * (1.0 - w_sw_pass_trough)
    )
    h_sw_ext_rim = np.maximum(8600.0, h_harm) + 420.0 * (rn_broad - 0.36) + 180.0 * fbm2
    En_new = En_new * (1.0 - w_sw_ext) + h_sw_ext_rim * w_sw_ext

    # 6C. Apply the Trans-Boundary Arachnoid Network & Northern Korona Scenic Canyon (*The Web-Cleaver Gorge*):
    h_breach_slope = h_land_syn * 0.75 + (1650.0 + 550.0 * rn_broad) * 0.25
    del (
        h_harm, h_land_syn, h_syn, h_seamount_edifice, h_shelf_arch, h_shelf_deep, h_shelf_sea,
        h_cone, dr_s, u_s, w_flank, w_throat, h_arch_mod, w_arch_horst, w_arch_trough,
        el_arch_trough, h_arch_isles, w_arch_land, h_trough_target, h_arch_coast_smooth, w_arch_coast_band,
        r_delta, h_bayou_patch, d_braid_min, ch_hw_d, d_from_braid, h_delta_islands, w_delta_land,
        px_nw, py_nw, d_in_hlake, d_out_hlake, w_hlake_basin, h_hlake_profile, r_cop_tarn, w_cop_pocket, h_cop_bed,
        w_land_coast, d2_ria, s_taper_ria, hw_ria, spur_mod, dist_ria, d_norm_ria, h_bg_slope, max_val_cut, w_ria_val, h_ria_thalweg,
        Eo_clean_edge, whas0_clean_edge, wlev0_clean_edge, w_new_blend, w_nw_sea_floor, w_coast_new, d_in_sea,
        d2_ne, el_ne, hw_ne, dist_ne, d_norm_ne,
        d2_sw, el_sw, hw_sw, dist_sw, d_norm_sw, h_sw_pass_prof, w_sw_pass_trough, h_sw_target, w_sw_apply, w_sw_ext, h_sw_ext_rim,
    )
    gc.collect()
    (w_arach_zone, arach_trough_w, arach_rib_h,
     w_canyon, h_canyon_prof, _) = build_arachnoid_and_canyon_field(px, py, is_arach, is_high_lake, rs)

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
    En_new = En_new * (1.0 - w_n_korona_breach) + np.minimum(En_new, h_breach_slope) * w_n_korona_breach

    En_new = En_new + (arach_rib_h * (1.0 - arach_trough_w) - 580.0 * arach_trough_w) * w_arach_env * np.clip(w_arach_zone + 0.25, 0.0, 1.0)
    En_new = En_new * (1.0 - w_canyon) + np.minimum(En_new, h_canyon_prof) * w_canyon
    del w_arach_env, h_breach_slope
    gc.collect()

    # 7. Apply Fluvial & Glacial Stream-Power Weathering (`T.weather`) across the new mountains & scarps:
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

    # 7B. Cross-boundary crater-wall smoothing & ridge continuity pass along `Y = 330` (`X = 450..1821`) and `X = 272` (`Y = 450..1723`)
    # Start `w_coast_taper` right at the shoreline (`0..4 px`) and `w_n_seam_smooth` at `X = 450` so the coastal slope
    # at `X = 468..542, Y = 307..340` (`Comment 2`) has 100% seamless elevation and hillshade continuity across `Y = 330`!
    w_coast_taper = G.sstep(0.0, 4.0, d_in_land)
    w_n_seam_smooth = (
        G.sstep(450.0, 485.0, px)
        * np.exp(-(((py - (DY_F + 4.0 + 10.0 * fbm2)) / 44.0) ** 2))
        * (~old_lake_guard).astype(float)
        * w_coast_taper
        * (~is_high_lake).astype(float)
    )
    w_w_seam_smooth = (
        G.sstep(450.0, 485.0, py)
        * np.exp(-(((px - (DX_F + 4.0 + 10.0 * fbm2)) / 44.0) ** 2))
        * (~old_lake_guard).astype(float)
        * w_coast_taper
        * (~is_copper_tarn).astype(float)
    )
    w_wall_unify = np.clip(np.maximum(w_n_seam_smooth, w_w_seam_smooth), 0.0, 1.0)
    En_wall_smooth = (
        nd.gaussian_filter(En_new, sigma=10.5)
        + 195.0 * (rn_fine - 0.38) * G.sstep(2500.0, 5500.0, En_new)
        + 130.0 * fbm1 * G.sstep(1800.0, 4800.0, En_new)
    )
    En_new = En_new * (1.0 - 0.98 * w_wall_unify) + En_wall_smooth * (0.98 * w_wall_unify)
    # Re-incise the Web-Cleaver Gorge & Outland Gate valley across `Y = 330` before tracing their exact Dijkstra thalwegs:
    En_new = En_new * (1.0 - w_canyon) + np.minimum(En_new, h_canyon_prof) * w_canyon
    En_new = En_new * (1.0 - 0.85 * w_ne_trough * w_ne_connector) + np.minimum(En_new, h_ne_valley) * (0.85 * w_ne_trough * w_ne_connector)

    # 7C. Trace Exact Minimum-Elevation Dijkstra Thalwegs on the Final Weathered Surface for:
    #   - `Web-Cleaver / Arachnoid Gorge River` (`id: 9102`, `Comment 2`): `(1268, 202)` -> `(898, 174)`
    #   - `Outland Gate River` (`id: 9106`, `Comment 3`): `(1588, 517)` -> `(1545, 477)` -> `(1320, 209)`
    # and carve a strictly monotonically decreasing valley floor along both paths so neither river EVER runs uphill
    # or contours across a steep green hillside!
    can_waypoints = [
        (1268.0, 202.0), (1248.0, 214.0), (1220.0, 238.0), (1180.0, 276.0),
        (1136.0, 310.0), (1088.0, 328.0), (1046.0, 322.0), (1008.0, 292.0),
        ( 972.0, 252.0), ( 934.0, 212.0), ( 898.0, 174.0),
    ]
    can_thalweg_dense = _trace_thalweg_dijkstra(En_new, can_waypoints, bbox=(155, 410, 865, 1305), corridor_hw=22.0, sigma_smooth=1.8)
    canyon_river_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in can_thalweg_dense[::3]]
    if canyon_river_pts[0] != [1268.0, 202.0]:
        canyon_river_pts.insert(0, [1268.0, 202.0])
    if canyon_river_pts[-1] != [898.0, 174.0]:
        canyon_river_pts.append([898.0, 174.0])

    # Carve a strictly monotonic downhill canyon floor along `can_thalweg_dense` (`1452 m -> 382 m`)
    n_ctd = len(can_thalweg_dense)
    can_target_beds = np.linspace(1452.0, 382.0, n_ctd)
    d2_ctd = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    el_ctd = En_new.copy()
    sub_y0c, sub_y1c, sub_x0c, sub_x1c = 155, 410, 865, 1305
    for (cx_i, cy_i), c_bed in zip(can_thalweg_dense, can_target_beds):
        d2 = (px[sub_y0c:sub_y1c, sub_x0c:sub_x1c] - cx_i) ** 2 + (py[sub_y0c:sub_y1c, sub_x0c:sub_x1c] - cy_i) ** 2
        better = d2 < d2_ctd[sub_y0c:sub_y1c, sub_x0c:sub_x1c]
        d2_ctd[sub_y0c:sub_y1c, sub_x0c:sub_x1c] = np.where(better, d2, d2_ctd[sub_y0c:sub_y1c, sub_x0c:sub_x1c])
        el_ctd[sub_y0c:sub_y1c, sub_x0c:sub_x1c] = np.where(better, c_bed, el_ctd[sub_y0c:sub_y1c, sub_x0c:sub_x1c])
    dist_ctd = np.sqrt(d2_ctd)
    w_ctd_carve = (1.0 - G.sstep(0.0, 14.0, dist_ctd)) * (~is_high_lake).astype(float) * (~whas_new).astype(float)
    h_ctd_prof = el_ctd + 360.0 * (G.sstep(0.0, 14.0, dist_ctd) ** 1.35)
    En_new = En_new * (1.0 - 0.92 * w_ctd_carve) + np.minimum(En_new, h_ctd_prof) * (0.92 * w_ctd_carve)

    ne_waypoints = [
        (1588.0, 517.0), (1565.0, 496.0), (1545.0, 477.0), (1522.0, 452.0),
        (1498.0, 424.0), (1470.0, 382.0), (1442.0, 336.0), (1408.0, 286.0),
        (1366.0, 240.0), (1320.0, 209.0),
    ]
    ne_thalweg_dense = _trace_thalweg_dijkstra(En_new, ne_waypoints, bbox=(185, 535, 1295, 1620), corridor_hw=24.0, sigma_smooth=1.8)
    outland_gate_riv_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in ne_thalweg_dense[::3]]
    if outland_gate_riv_pts[0] != [1588.0, 517.0]:
        outland_gate_riv_pts.insert(0, [1588.0, 517.0])
    if outland_gate_riv_pts[-1] != [1320.0, 209.0]:
        outland_gate_riv_pts.append([1320.0, 209.0])

    # Carve a strictly monotonic downhill valley floor along `ne_thalweg_dense` (`1730 m -> 1456 m`)
    n_ntd = len(ne_thalweg_dense)
    ne_target_beds = np.linspace(1730.0, 1456.0, n_ntd)
    d2_ntd = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    el_ntd = En_new.copy()
    sub_y0n, sub_y1n, sub_x0n, sub_x1n = 185, 535, 1295, 1620
    for (nx_i, ny_i), n_bed in zip(ne_thalweg_dense, ne_target_beds):
        d2 = (px[sub_y0n:sub_y1n, sub_x0n:sub_x1n] - nx_i) ** 2 + (py[sub_y0n:sub_y1n, sub_x0n:sub_x1n] - ny_i) ** 2
        better = d2 < d2_ntd[sub_y0n:sub_y1n, sub_x0n:sub_x1n]
        d2_ntd[sub_y0n:sub_y1n, sub_x0n:sub_x1n] = np.where(better, d2, d2_ntd[sub_y0n:sub_y1n, sub_x0n:sub_x1n])
        el_ntd[sub_y0n:sub_y1n, sub_x0n:sub_x1n] = np.where(better, n_bed, el_ntd[sub_y0n:sub_y1n, sub_x0n:sub_x1n])
    dist_ntd = np.sqrt(d2_ntd)
    w_ntd_carve = (1.0 - G.sstep(0.0, 16.0, dist_ntd)) * (~is_high_lake).astype(float) * (~whas_new).astype(float)
    h_ntd_prof = el_ntd + 420.0 * (G.sstep(0.0, 16.0, dist_ntd) ** 1.35)
    En_new = En_new * (1.0 - 0.90 * w_ntd_carve) + np.minimum(En_new, h_ntd_prof) * (0.90 * w_ntd_carve)
    del (
        En_weathered, w_weather_blend, w_coast_taper, w_n_seam_smooth, w_w_seam_smooth, En_wall_smooth,
        h_canyon_prof, h_ne_valley, w_ne_trough,
        d2_ctd, el_ctd, dist_ctd, w_ctd_carve, h_ctd_prof,
        d2_ntd, el_ntd, dist_ntd, w_ntd_carve, h_ntd_prof,
    )
    gc.collect()

    # 8. Set Water Masks (`whas_new`, `wlev_new`) in the Expanded Territory:
    in_nw_sea_box = is_new_area | ((px < 535.0) & (py < 635.0))
    sea_and_delta_water = (
        (is_new_area & ((is_sea & (En_new < -0.5)) | is_braid_ch | is_arch_axial_lake))
        | (is_sea & ~old_lake_guard & in_nw_sea_box)
    ) & ~sima_land_guard & ~is_arch_neck_land
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
    En_new = np.where(sima_land_guard, np.maximum(En_new, 10.0), En_new)

    hlake_mask = is_new_area & is_high_lake
    whas_new[hlake_mask] = True
    wlev_new[hlake_mask] = HIGH_LAKE_LEV
    En_new = np.where(hlake_mask, np.minimum(En_new, HIGH_LAKE_LEV - 6.0), En_new)

    whas_new[is_copper_tarn] = True
    wlev_new[is_copper_tarn] = COPPER_TARN_LEV
    En_new = np.where(is_copper_tarn, np.minimum(En_new, COPPER_TARN_LEV - 6.0), En_new)

    # ==============================================================================================
    # 8B. Batch 5 Regional Sculpting (`sasquatch tribes`, `neo-ozarks`, `spider lake`,
    #     `Silent Vales`, and `tsunami coast`):
    # ==============================================================================================
    from matplotlib.path import Path as _MplPath
    pts_grid_all = np.column_stack([px.ravel(), py.ravel()])

    def _poly_mask(verts):
        return _MplPath(np.asarray(verts, dtype=float)).contains_points(pts_grid_all).reshape(NEW_OH, NEW_OW)

    # --- (1) `sasquatch tribes` (`rmvyj1kvhx4m4`, X = 522..925, Y = 267..409):
    # Carve 4 smaller, steeper-walled, higher-floor, less-hospitable periglacial/glaciated troughs
    # (+5,850..+6,240 m floors, 0.71..0.76 atm, ET alpine tundra & cold marginal Dsc) separated by
    # +7,400..+8,700 m EF/HF ridges, with 3 small half-frozen glacial tarns (WH).
    sasquatch_verts = [
        [522, 350], [542, 375], [570, 409], [642, 383], [708, 370], [750, 373], [781, 382],
        [828, 370], [869, 366], [913, 347], [925, 317], [914, 295], [889, 295], [843, 289],
        [788, 275], [755, 267], [685, 289], [587, 307], [536, 334],
    ]
    is_sasquatch = _poly_mask(sasquatch_verts)
    w_sasquatch_env = nd.gaussian_filter(is_sasquatch.astype(float), sigma=9.5)

    sasq_valleys = [
        # (x0, y0, x1, y1, floor_m, hw_px, tarn_xc, tarn_yc, tarn_rx, tarn_ry, tarn_lev)
        (574.0, 356.0, 618.0, 336.0, 5860.0, 10.5, 596.0, 346.0, 3.8, 2.1, 5850.0),  # Frost-Jaw Vale & Tarn
        (660.0, 338.0, 712.0, 318.0, 6040.0, 11.0, 686.0, 328.0, 4.0, 2.2, 6030.0),  # Bone-Larch Hollow & Tarn
        (746.0, 314.0, 796.0, 334.0, 5930.0, 10.5, 771.0, 324.0, 3.6, 2.0, 5920.0),  # Hoar-Wind Glen & Tarn
        (834.0, 320.0, 888.0, 328.0, 6240.0, 10.0,  -1.0,  -1.0, 0.0, 0.0,    0.0),  # Scree-Tooth Dry Fellfield Basin
    ]
    w_sasquatch_vales = np.zeros((NEW_OH, NEW_OW), dtype=float)
    y0_sq, y1_sq, x0_sq, x1_sq = 245, 430, 505, 945
    px_sq = px[y0_sq:y1_sq, x0_sq:x1_sq] + 3.2 * fbm1[y0_sq:y1_sq, x0_sq:x1_sq]
    py_sq = py[y0_sq:y1_sq, x0_sq:x1_sq] + 3.2 * fbm2[y0_sq:y1_sq, x0_sq:x1_sq]
    spur_sq = 0.72 + 0.42 * rn_broad[y0_sq:y1_sq, x0_sq:x1_sq] + 0.24 * rn_fine[y0_sq:y1_sq, x0_sq:x1_sq]

    for vx0, vy0, vx1, vy1, vfl, vhw, txc, tyc, trx, try_, tlev in sasq_valleys:
        dx_v, dy_v = vx1 - vx0, vy1 - vy0
        L2_v = dx_v * dx_v + dy_v * dy_v + 1e-9
        t_proj = np.clip(((px_sq - vx0) * dx_v + (py_sq - vy0) * dy_v) / L2_v, 0.0, 1.0)
        cx_v = vx0 + t_proj * dx_v
        cy_v = vy0 + t_proj * dy_v
        d_perp = np.hypot(px_sq - cx_v, py_sq - cy_v) * np.clip(spur_sq, 0.52, 1.48)
        hw_eff = vhw * (0.58 + 0.42 * G.sstep(0.0, 0.25, np.minimum(t_proj, 1.0 - t_proj)))
        u_val = d_perp / np.maximum(hw_eff, 1.5)
        w_v = ((1.0 - G.sstep(0.0, 2.15, u_val)) ** 1.35) * w_sasquatch_env[y0_sq:y1_sq, x0_sq:x1_sq]
        # Smoothly flaring glacial trough walls rising into the surrounding +7,400..+8,600 m snow peaks
        h_v_prof = (
            vfl
            + 2150.0 * (G.sstep(0.0, 2.05, u_val) ** 1.45)
            + 95.0 * (rn_fine[y0_sq:y1_sq, x0_sq:x1_sq] - 0.35)
        )
        En_sub = En_new[y0_sq:y1_sq, x0_sq:x1_sq]
        En_new[y0_sq:y1_sq, x0_sq:x1_sq] = En_sub * (1.0 - 0.88 * w_v) + np.minimum(En_sub, h_v_prof) * (0.88 * w_v)
        w_sasquatch_vales[y0_sq:y1_sq, x0_sq:x1_sq] = np.maximum(
            w_sasquatch_vales[y0_sq:y1_sq, x0_sq:x1_sq],
            (1.0 - G.sstep(0.0, 1.35, u_val)) * w_sasquatch_env[y0_sq:y1_sq, x0_sq:x1_sq],
        )

        if txc > 0.0:
            r_tarn = np.hypot((px_sq - txc) / trx, (py_sq - tyc) / try_)
            is_tarn_sq = (r_tarn <= 1.0) & is_sasquatch[y0_sq:y1_sq, x0_sq:x1_sq]
            whas_new[y0_sq:y1_sq, x0_sq:x1_sq][is_tarn_sq] = True
            wlev_new[y0_sq:y1_sq, x0_sq:x1_sq][is_tarn_sq] = tlev
            En_new[y0_sq:y1_sq, x0_sq:x1_sq] = np.where(
                is_tarn_sq,
                np.minimum(En_new[y0_sq:y1_sq, x0_sq:x1_sq], tlev - 12.0),
                En_new[y0_sq:y1_sq, x0_sq:x1_sq],
            )

    # Gently accentuate the glacial arête divides between the 4 sasquatch troughs using the smooth `w_sasquatch_env`
    w_sasq_ridge = w_sasquatch_env * (1.0 - G.sstep(0.05, 0.55, w_sasquatch_vales))
    En_new = En_new + (190.0 * (rn_fine - 0.35) + 95.0 * np.maximum(0.0, fbm1)) * w_sasq_ridge

    # --- (2) `neo-ozarks` (`rmvyiyw8ucd1y`, X = 1109..1318, Y = 107..231):
    # Epeirogenic flat-topped limestone/dolomite plateau table (+1,180..+1,680 m) deeply dissected by a
    # dendritic network of steep-walled spring-fed hollows (-220..-360 m, floors +860..+1,220 m), crossed
    # by 5 strike-aligned exposed veins/knobs of purple-red rhyolite porphyry (+180..+310 m resistant dikes
    # with narrow canyon shut-ins), drained by the Neo-Ozark Porphyry Fork (`id: 9109`).
    ozark_verts = [
        [1126, 150], [1109, 189], [1129, 226], [1174, 231], [1220, 207],
        [1252, 171], [1317, 135], [1318, 120], [1303, 107], [1284, 122],
        [1258, 125], [1219, 120], [1198, 113], [1172, 126], [1148, 136],
    ]
    is_ozarks = _poly_mask(ozark_verts) & ~is_high_lake & ~whas_new
    d_in_oz = nd.distance_transform_edt(is_ozarks)
    d_out_oz = nd.distance_transform_edt(~is_ozarks)
    sd_oz = (d_in_oz - d_out_oz) + 5.5 * fbm1 + 3.0 * fbm2
    w_ozarks_env = G.sstep(-10.0, 12.0, sd_oz) * (~is_high_lake).astype(float) * (~whas_new).astype(float)

    # Smoothly domed structural carbonate tableland surface anchored to local background elevation
    h_ozark_bg = nd.gaussian_filter(En_new, sigma=16.0)
    h_ozark_table = h_ozark_bg + 310.0 * w_ozarks_env + 35.0 * fbm2

    # High-frequency dendritic karst hollow network (flat-topped cherty dolomite ridges + V-shaped spring hollows)
    xw_oz = px + 4.2 * fbm1 + 2.2 * rn_fine
    yw_oz = py + 4.2 * fbm2 + 2.2 * rn_broad
    dendritic_wave = (
        0.45 * np.abs(np.sin(xw_oz * 0.26 + yw_oz * 0.18))
        + 0.35 * np.abs(np.sin(xw_oz * 0.16 - yw_oz * 0.29 + 1.1))
        + 0.20 * np.abs(np.cos(xw_oz * 0.39 + yw_oz * 0.34 - 0.7))
    )
    hollow_cut = 285.0 * ((1.0 - G.sstep(0.18, 0.62, dendritic_wave)) ** 1.35) * w_ozarks_env
    doline_field = 70.0 * np.maximum(0.0, np.sin(xw_oz * 0.52) * np.cos(yw_oz * 0.52) - 0.55) * w_ozarks_env

    # 5 Exposed Strike-Aligned Veins & Knobs of Purple-Red Rhyolite Porphyry:
    porphyry_vein_segs = [
        # (x0, y0, x1, y1, crest_boost_m, hw_px)
        (1152.0, 202.0, 1278.0, 132.0, 260.0, 2.8),  # Great Red Porphyry Dike (ENE-WSW master vein)
        (1130.0, 164.0, 1252.0, 120.0, 220.0, 2.5),  # North Dolomite-Escarpment Porphyry Vein
        (1208.0, 208.0, 1288.0, 148.0, 235.0, 2.6),  # Spider-Rim Porphyry Sill
        (1170.0, 126.0, 1214.0, 204.0, 195.0, 2.3),  # Cross-Cutting Shut-In Porphyry Dike
        (1234.0, 122.0, 1262.0, 166.0, 185.0, 2.2),  # East Knob Porphyry Vein
    ]
    w_porphyry_vein = np.zeros((NEW_OH, NEW_OW), dtype=float)
    h_porphyry_boost = np.zeros((NEW_OH, NEW_OW), dtype=float)
    y0_oz, y1_oz, x0_oz, x1_oz = 95, 245, 1095, 1332
    px_oz = px[y0_oz:y1_oz, x0_oz:x1_oz] + 2.2 * fbm1[y0_oz:y1_oz, x0_oz:x1_oz] + 1.2 * rn_fine[y0_oz:y1_oz, x0_oz:x1_oz]
    py_oz = py[y0_oz:y1_oz, x0_oz:x1_oz] + 2.2 * fbm2[y0_oz:y1_oz, x0_oz:x1_oz] + 1.2 * rn_broad[y0_oz:y1_oz, x0_oz:x1_oz]

    for vx0, vy0, vx1, vy1, vboost, vhw in porphyry_vein_segs:
        dx_v, dy_v = vx1 - vx0, vy1 - vy0
        L2_v = dx_v * dx_v + dy_v * dy_v + 1e-9
        t_p = np.clip(((px_oz - vx0) * dx_v + (py_oz - vy0) * dy_v) / L2_v, 0.0, 1.0)
        d_p = np.hypot(px_oz - (vx0 + t_p * dx_v), py_oz - (vy0 + t_p * dy_v))
        end_t = G.sstep(0.0, 0.16, np.minimum(t_p, 1.0 - t_p))
        knob_mod = np.clip(0.55 + 0.65 * rn_fine[y0_oz:y1_oz, x0_oz:x1_oz] + 0.25 * np.sin(t_p * 6.0 * math.pi), 0.35, 1.35)
        w_pv = np.exp(-((d_p / vhw) ** 1.85)) * end_t * knob_mod * w_ozarks_env[y0_oz:y1_oz, x0_oz:x1_oz]
        w_porphyry_vein[y0_oz:y1_oz, x0_oz:x1_oz] = np.maximum(w_porphyry_vein[y0_oz:y1_oz, x0_oz:x1_oz], w_pv)
        h_porphyry_boost[y0_oz:y1_oz, x0_oz:x1_oz] = np.maximum(
            h_porphyry_boost[y0_oz:y1_oz, x0_oz:x1_oz],
            vboost * w_pv,
        )

    h_ozark_target = h_ozark_table - hollow_cut - doline_field + h_porphyry_boost
    En_new = En_new * (1.0 - 0.85 * w_ozarks_env) + h_ozark_target * (0.85 * w_ozarks_env)

    # Carve the main dendritic trunk hollow (`Neo-Ozark Porphyry Fork`, `id: 9109`) & its narrow porphyry "Shut-Ins"
    # flowing from `(1246, 172)` -> `(1212, 174)` -> `(1176, 184)` -> `(1144, 168)` -> `(1132, 146)` -> `(1124, 134)` (into Ria River 9101!)
    ozark_riv_ctrl = [
        (1246.0, 172.0, 1265.0,  5.5),
        (1212.0, 174.0, 1145.0,  8.5),  # Passes Cathedral of the Red Porphyry Vein
        (1196.0, 179.0, 1085.0,  5.5),  # Narrow Porphyry Shut-In Gorge!
        (1176.0, 184.0, 1020.0,  9.5),  # Passes Onyx Pillar Labyrinth
        (1144.0, 168.0,  945.0, 10.5),  # Passes The Shut-In Big Spring Resurgence
        (1132.0, 148.0,  885.0, 11.5),
        (1124.0, 134.0,  825.0, 12.5),  # Joins main Ria River (`id: 9101`) at `(1124, 134)`!
    ]
    ozark_riv_samples = _catmull_rom_2d(ozark_riv_ctrl, n_per_seg=14)
    d2_ozr = np.full((y1_oz - y0_oz, x1_oz - x0_oz), 1e12, dtype=float)
    el_ozr = np.zeros((y1_oz - y0_oz, x1_oz - x0_oz), dtype=float)
    hw_ozr = np.full((y1_oz - y0_oz, x1_oz - x0_oz), 9.0, dtype=float)
    for sx, sy, sel, shw in ozark_riv_samples:
        d2 = (px[y0_oz:y1_oz, x0_oz:x1_oz] - sx) ** 2 + (py[y0_oz:y1_oz, x0_oz:x1_oz] - sy) ** 2
        better = d2 < d2_ozr
        d2_ozr = np.where(better, d2, d2_ozr)
        el_ozr = np.where(better, sel, el_ozr)
        hw_ozr = np.where(better, shw, hw_ozr)
    dist_ozr = np.sqrt(d2_ozr)
    u_ozr = dist_ozr / np.maximum(hw_ozr, 1.0)
    w_ozr_carve = (1.0 - G.sstep(0.0, 1.45, u_ozr)) * (~is_high_lake[y0_oz:y1_oz, x0_oz:x1_oz]).astype(float)
    h_ozr_prof = el_ozr + 290.0 * (np.clip(u_ozr, 0.0, 1.45) ** 1.45)
    En_oz_sub = En_new[y0_oz:y1_oz, x0_oz:x1_oz]
    En_new[y0_oz:y1_oz, x0_oz:x1_oz] = En_oz_sub * (1.0 - 0.88 * w_ozr_carve) + np.minimum(En_oz_sub, h_ozr_prof) * (0.88 * w_ozr_carve)
    w_porphyry_vein[y0_oz:y1_oz, x0_oz:x1_oz] *= G.sstep(0.15, 0.45, u_ozr)
    w_ozark_dolomite = w_ozarks_env * (1.0 - 0.75 * w_porphyry_vein)

    ozark_riv_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in ozark_riv_samples[::2]]
    if ozark_riv_pts[-1] != [1124.0, 134.0]:
        ozark_riv_pts.append([1124.0, 134.0])

    # --- (3) `spider lake` (`rmvyj4v2ozgb1`, X = 1225..1417, Y = 154..291):
    # Add 5 small emergent rocky dolomite/porphyry silk-weir island stacks (+1,466..+1,486 m) inside the
    # +1,460.0 m Eastern Highland Lake (away from river outlets) to anchor the Littoral Bridge-Curtains!
    spider_stacks = [
        # (xc, yc, rx, ry, crest_m)
        (1278.0, 191.0, 1.9, 1.4, 1482.0),
        (1291.0, 183.0, 2.1, 1.5, 1486.0),
        (1303.0, 195.0, 1.8, 1.4, 1478.0),
        (1284.0, 204.0, 1.7, 1.3, 1474.0),
        (1312.0, 188.0, 1.8, 1.4, 1480.0),
    ]
    for sxc, syc, srx, sry, screst in spider_stacks:
        r_st = np.hypot((px - sxc) / srx, (py - syc) / sry)
        is_stack = (r_st <= 1.0) & hlake_mask
        whas_new[is_stack] = False
        wlev_new[is_stack] = np.nan
        En_new = np.where(
            is_stack,
            HIGH_LAKE_LEV + 4.0 + (screst - HIGH_LAKE_LEV - 4.0) * np.maximum(0.0, 1.0 - (r_st ** 1.6)),
            En_new,
        )

    # --- (4) `Silent Vales` (`rmvyk0ubpkdoy`, X = 158..228, Y = 831..1131) & Southern Crook Valley (`id: 9105`):
    # Carve a connected network of sheltered, cool-temperate (`Cfb`/`Csb`) longitudinal and tributary valleys
    # (+1,080..+1,920 m valley floors) with two ribbon lakes (+1,410 m & +1,240 m, `WH`) and a smooth, sweeping
    # western water-gap gorge outlet (`id: 9110`, *Silent Vales River*, `Comment 0`: ZERO 90-degree corner!)
    # joining the Crook River (`id: 9105`) along the true minimum-elevation yellow-green valley floor (`Comment 1`)!
    silent_verts = [
        [158, 843], [165, 881], [169, 917], [184, 940], [191, 964], [187, 966],
        [172, 991], [165, 1018], [176, 1047], [189, 1068], [191, 1092], [207, 1114],
        [222, 1131], [228, 1099], [223, 1049], [203, 1030], [206, 997], [192, 980],
        [199, 949], [217, 931], [217, 896], [208, 861], [182, 831],
    ]
    is_silent_reg = _poly_mask(silent_verts)

    # Single continuous Catmull-Rom curve for `id: 9110` (`Comment 0`) so it curves gracefully from south to west!
    silent_main_ctrl = [
        (183.0,  842.0, 1860.0, 13.5),
        (190.0,  882.0, 1620.0, 16.5),
        (196.0,  928.0, 1405.0, 18.0),  # Upper Silent Ribbon Lake (+1,410 m)
        (192.0,  950.0, 1280.0, 18.0),  # Begins smooth SW curve
        (180.0,  966.0, 1165.0, 18.5),  # Sweeping arc through Central Silent Vales Confluence Basin!
        (162.0,  972.0, 1045.0, 16.5),  # Western Water-Gap Gorge through the coastal cordillera!
        (138.0,  971.0,  915.0, 17.5),
        (114.0,  969.0,  795.0, 18.5),
        ( 92.0,  966.0,  685.0, 20.0),  # Joins Crook River (`id: 9105`) in the true valley bottom at `(92, 966)`!
    ]
    silent_s_ctrl = [
        (214.0, 1118.0, 1890.0, 13.0),
        (202.0, 1086.0, 1640.0, 16.0),
        (194.0, 1052.0, 1420.0, 17.5),
        (186.0, 1020.0, 1235.0, 18.0),  # Lower Silent Ribbon Lake (+1,240 m)
        (184.0,  992.0, 1195.0, 18.5),
        (180.0,  966.0, 1165.0, 19.0),  # Joins Central Confluence Basin smoothly!
    ]
    silent_side_1 = [(215.0,  868.0, 1820.0, 12.0), (202.0,  878.0, 1680.0, 14.0), (190.0,  882.0, 1620.0, 16.0)]
    silent_side_2 = [(216.0,  916.0, 1760.0, 12.0), (205.0,  924.0, 1560.0, 14.0), (196.0,  928.0, 1405.0, 16.5)]
    silent_side_3 = [(168.0, 1012.0, 1580.0, 12.0), (178.0, 1016.0, 1380.0, 14.0), (186.0, 1020.0, 1235.0, 16.5)]
    silent_side_4 = [(220.0, 1058.0, 1790.0, 12.0), (206.0, 1055.0, 1580.0, 14.0), (194.0, 1052.0, 1420.0, 16.5)]

    s_main_samp = _catmull_rom_2d(silent_main_ctrl, n_per_seg=14)
    s_s_samp = _catmull_rom_2d(silent_s_ctrl, n_per_seg=14)
    all_silent_samples = np.vstack([
        s_main_samp,
        s_s_samp,
        _catmull_rom_2d(silent_side_1, n_per_seg=10),
        _catmull_rom_2d(silent_side_2, n_per_seg=10),
        _catmull_rom_2d(silent_side_3, n_per_seg=10),
        _catmull_rom_2d(silent_side_4, n_per_seg=10),
    ])

    y0_sv, y1_sv, x0_sv, x1_sv = 805, 1165, 70, 265
    px_sv = px[y0_sv:y1_sv, x0_sv:x1_sv] + 2.8 * fbm1[y0_sv:y1_sv, x0_sv:x1_sv]
    py_sv = py[y0_sv:y1_sv, x0_sv:x1_sv] + 2.8 * fbm2[y0_sv:y1_sv, x0_sv:x1_sv]
    d2_sv = np.full((y1_sv - y0_sv, x1_sv - x0_sv), 1e12, dtype=float)
    el_sv = np.zeros((y1_sv - y0_sv, x1_sv - x0_sv), dtype=float)
    hw_sv = np.full((y1_sv - y0_sv, x1_sv - x0_sv), 16.0, dtype=float)

    for sx, sy, sel, shw in all_silent_samples:
        d2 = (px_sv - sx) ** 2 + (py_sv - sy) ** 2
        better = d2 < d2_sv
        d2_sv = np.where(better, d2, d2_sv)
        el_sv = np.where(better, sel, el_sv)
        hw_sv = np.where(better, shw, hw_sv)

    el_sv = nd.gaussian_filter(el_sv, sigma=3.0)
    hw_sv = nd.gaussian_filter(hw_sv, sigma=2.5)
    spur_sv = 0.68 + 0.44 * rn_broad[y0_sv:y1_sv, x0_sv:x1_sv] + 0.26 * rn_fine[y0_sv:y1_sv, x0_sv:x1_sv] + 0.14 * fbm1[y0_sv:y1_sv, x0_sv:x1_sv]
    dist_sv = nd.gaussian_filter(np.sqrt(d2_sv), sigma=1.5) * np.clip(spur_sv, 0.48, 1.55)
    u_sv = dist_sv / np.maximum(hw_sv, 1.0)

    w_sv_carve = (1.0 - G.sstep(0.0, 2.35, u_sv)) ** 1.35
    h_sv_prof = (
        el_sv
        + 680.0 * (np.clip(u_sv, 0.0, 1.35) ** 1.45)
        + 2650.0 * (np.maximum(0.0, u_sv - 0.85) ** 1.65)
        + 75.0 * (rn_fine[y0_sv:y1_sv, x0_sv:x1_sv] - 0.35)
    )
    En_sv_sub = En_new[y0_sv:y1_sv, x0_sv:x1_sv]
    En_new[y0_sv:y1_sv, x0_sv:x1_sv] = En_sv_sub * (1.0 - 0.92 * w_sv_carve) + np.minimum(En_sv_sub, h_sv_prof) * (0.92 * w_sv_carve)

    w_silent_vales = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_silent_vales[y0_sv:y1_sv, x0_sv:x1_sv] = np.clip(1.0 - G.sstep(0.0, 1.95, u_sv), 0.0, 1.0)

    # Two cool-temperate ribbon lakes inside `Silent Vales`:
    silent_lakes = [
        (196.0,  928.0, 2.4, 5.2, 1410.0),  # Mirror-Fern Lake (North Silent Vale)
        (186.0, 1020.0, 2.4, 5.0, 1240.0),  # Whispering-Cedar Lake (South Silent Vale)
    ]
    for lxc, lyc, lrx, lry, llev in silent_lakes:
        r_lk = np.hypot((px - lxc) / lrx, (py - lyc) / lry)
        is_slk = (r_lk <= 1.0) & is_silent_reg
        whas_new[is_slk] = True
        wlev_new[is_slk] = llev
        En_new = np.where(is_slk, np.minimum(En_new, llev - 10.0), En_new)

    # --- (4B) Carve & Trace the Crook Axial River (`id: 9105`, `Comment 1`) Along the True Minimum-Elevation
    #     Yellow-Green Valley Floor (`X = 82..118, Y = 655..1136`):
    # Ensure the southern Crook valley floor (`Y = 960..1136`) grades monotonically from Copper Tarn (`(148, 1136)`, 2368 m)
    # into the broad yellow-green valley trough (`(114, 1120) -> (94, 1090) -> (84, 1048) -> (84, 1005) -> (92, 966)`)
    # and northward to the Crook Fjord mouth `(122, 655)`!
    crook_valley_ctrl = [
        (148.0, 1136.0, 2368.0, 16.0),  # Copper Tarn outlet
        (114.0, 1120.0, 2110.0, 22.0),  # Descends WNW off the tarn bench into the main yellow-green valley floor
        ( 94.0, 1090.0, 1760.0, 25.0),  # True minimum-elevation center of the southern Crook valley!
        ( 84.0, 1048.0, 1520.0, 26.0),  # Broad yellow-green valley floor west of the Silent Vales ridge
        ( 84.0, 1005.0, 1310.0, 26.0),
        ( 92.0,  966.0, 1110.0, 27.0),  # Confluence with Silent Vales River (`id: 9110`)!
        ( 94.0,  922.0,  940.0, 27.0),
        ( 98.0,  878.0,  790.0, 27.0),
        (102.0,  834.0,  645.0, 26.5),
        (100.0,  790.0,  495.0, 26.0),
        (104.0,  745.0,  325.0, 25.0),
        (112.0,  700.0,  145.0, 24.0),
        (122.0,  655.0,    2.0, 24.0),  # Crook Fjord mouth!
    ]
    crook_val_samps = _catmull_rom_2d(crook_valley_ctrl, n_per_seg=14)
    y0_ck, y1_ck, x0_ck, x1_ck = 635, 1160, 45, 185
    px_ck = px[y0_ck:y1_ck, x0_ck:x1_ck] + 2.4 * fbm1[y0_ck:y1_ck, x0_ck:x1_ck]
    py_ck = py[y0_ck:y1_ck, x0_ck:x1_ck] + 2.4 * fbm2[y0_ck:y1_ck, x0_ck:x1_ck]
    d2_ck = np.full((y1_ck - y0_ck, x1_ck - x0_ck), 1e12, dtype=float)
    el_ck = np.zeros((y1_ck - y0_ck, x1_ck - x0_ck), dtype=float)
    hw_ck = np.full((y1_ck - y0_ck, x1_ck - x0_ck), 24.0, dtype=float)
    for sx, sy, sel, shw in crook_val_samps:
        d2 = (px_ck - sx) ** 2 + (py_ck - sy) ** 2
        better = d2 < d2_ck
        d2_ck = np.where(better, d2, d2_ck)
        el_ck = np.where(better, sel, el_ck)
        hw_ck = np.where(better, shw, hw_ck)
    el_ck = nd.gaussian_filter(el_ck, sigma=3.0)
    hw_ck = nd.gaussian_filter(hw_ck, sigma=2.5)
    spur_ck = 0.72 + 0.38 * rn_broad[y0_ck:y1_ck, x0_ck:x1_ck] + 0.22 * rn_fine[y0_ck:y1_ck, x0_ck:x1_ck]
    u_ck = (nd.gaussian_filter(np.sqrt(d2_ck), sigma=1.5) * np.clip(spur_ck, 0.55, 1.45)) / np.maximum(hw_ck, 1.0)
    w_ck_carve = ((1.0 - G.sstep(0.0, 1.85, u_ck)) ** 1.35) * (~whas_new[y0_ck:y1_ck, x0_ck:x1_ck]).astype(float) * (~is_copper_tarn[y0_ck:y1_ck, x0_ck:x1_ck]).astype(float)
    h_ck_prof = el_ck + 480.0 * (np.clip(u_ck, 0.0, 1.35) ** 1.45) + 1450.0 * (np.maximum(0.0, u_ck - 0.85) ** 1.55)
    En_ck_sub = En_new[y0_ck:y1_ck, x0_ck:x1_ck]
    En_new[y0_ck:y1_ck, x0_ck:x1_ck] = En_ck_sub * (1.0 - 0.88 * w_ck_carve) + np.minimum(En_ck_sub, h_ck_prof) * (0.88 * w_ck_carve)

    # Trace `crook_riv_pts` (`id: 9105`) along the exact minimum-elevation thalweg of the Crook valley (`Comment 1`)!
    crook_waypoints = [(p[0], p[1]) for p in crook_valley_ctrl]
    crook_thalweg_dense = _trace_thalweg_dijkstra(En_new, crook_waypoints, bbox=(640, 1150, 55, 175), corridor_hw=18.0, sigma_smooth=2.2)
    crook_riv_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in crook_thalweg_dense[::3]]
    if crook_riv_pts[0] != [148.0, 1136.0]:
        crook_riv_pts.insert(0, [148.0, 1136.0])
    if crook_riv_pts[-1] != [122.0, 655.0]:
        crook_riv_pts.append([122.0, 655.0])

    # Snap the mouth of `Silent Vales River` (`id: 9110`) to the exact vertex of `crook_riv_pts` nearest `Y = 966`!
    ck_arr = np.array(crook_riv_pts, dtype=float)
    conf_idx_sv = int(np.argmin(np.abs(ck_arr[:, 1] - 966.0)))
    sv_conf_pt = [round(float(ck_arr[conf_idx_sv, 0]), 1), round(float(ck_arr[conf_idx_sv, 1]), 1)]
    silent_main_ctrl[-1] = (sv_conf_pt[0], sv_conf_pt[1], 685.0, 20.0)
    s_main_samp = _catmull_rom_2d(silent_main_ctrl, n_per_seg=14)
    silent_riv_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in s_main_samp[::2]]
    if silent_riv_pts[-1] != sv_conf_pt:
        silent_riv_pts.append(sv_conf_pt)

    # --- (5) `tsunami coast` (`rmvyk62bgdvs3`, X = 97..636, Y = 115..673):
    # Sculpt the 7 diagnostic megatsunami coastal landforms across the coastal zone of `tsunami coast`:
    tsunami_verts = [
        [97, 634], [108, 600], [110, 561], [111, 524], [159, 462], [187, 418], [189, 383],
        [186, 349], [206, 310], [223, 284], [279, 246], [322, 212], [366, 184], [432, 172],
        [483, 140], [522, 115], [597, 139], [622, 158], [636, 178], [632, 204], [606, 230],
        [547, 245], [517, 282], [500, 325], [483, 370], [456, 389], [416, 408], [364, 419],
        [338, 443], [321, 509], [317, 566], [292, 589], [233, 645], [200, 663], [162, 673],
        [130, 673], [101, 656],
    ]
    is_tsunami_reg = _poly_mask(tsunami_verts) & ~whas_new & ~is_high_lake
    # Feather `is_tsunami_reg` with a 5.5-px Gaussian filter so its polygon boundary never creates a 1-px step!
    w_tsunami_poly = nd.gaussian_filter(is_tsunami_reg.astype(float), sigma=5.5) * (~whas_new).astype(float) * (~is_high_lake).astype(float)
    d_coast_tsu = nd.distance_transform_edt(~sea_and_delta_water)

    # Azimuthal exposure factor: highest (1.0) in SW/Central sector (`X < 340`, open inter-island gaps & Crook funnel)
    # and attenuated (0.38) in NE Arch-shielded shadow sector (`X > 360`)
    exposure_tsu = 1.0 - 0.62 * G.sstep(310.0, 420.0, px)
    scour_width_px = 6.0 + 10.0 * exposure_tsu  # 12 km wide in NE shadow, up to 32 km wide in SW funnel

    w_tsunami_scour = (
        w_tsunami_poly
        * (1.0 - G.sstep(2.0, scour_width_px, d_coast_tsu))
        * (1.0 - G.sstep(180.0, 420.0, En_new))
    )

    # Wave-ray angle from Main Krakatoan Seamount Caldera `(176.0, 322.0)`
    dx_sm = px - 176.0
    dy_sm = py - 322.0
    r_sm = np.hypot(dx_sm, dy_sm) + 1e-9
    th_sm = np.arctan2(dy_sm, dx_sm)

    # V-shaped Megatsunami Chevron Ridges (+14..+36 m) and Backwash Scour Chutes (-10..-22 m)
    chevron_phase = np.sin(th_sm * 28.0 + 0.22 * r_sm + 1.8 * fbm1)
    chevron_ridge = np.clip(chevron_phase, 0.0, 1.0) ** 1.8
    backwash_chute = np.clip(-chevron_phase, 0.0, 1.0) ** 2.2

    w_tsunami_chevron = w_tsunami_scour * G.sstep(1.5, 4.5, d_coast_tsu) * chevron_ridge

    h_scour_bench = (
        4.0
        + (18.0 + 38.0 * exposure_tsu) * np.clip(d_coast_tsu / np.maximum(scour_width_px, 1.0), 0.0, 1.2)
        + (14.0 + 22.0 * exposure_tsu) * chevron_ridge * G.sstep(1.5, 4.0, d_coast_tsu)
        - (8.0 + 14.0 * exposure_tsu) * backwash_chute * G.sstep(0.5, 3.0, d_coast_tsu)
    )
    En_new = En_new * (1.0 - 0.78 * w_tsunami_scour) + np.maximum(2.5, np.minimum(En_new, h_scour_bench)) * (0.78 * w_tsunami_scour)

    # 4 Perched Saline Tsunami Plunge-Pool Lagoons along the Tsunami Coast scour bench:
    tsunami_lagoons = [
        # (xc, yc, rx, ry, angle_deg, lev_m)
        (246.0, 412.0, 3.6, 1.8, -42.0, 12.0),  # South Scour-Pit Lagoon
        (292.0, 368.0, 3.8, 1.9, -40.0, 11.0),  # Central Chevron Plunge Lagoon
        (344.0, 318.0, 3.4, 1.7, -38.0,  9.0),  # Arch-Gap Overwash Lagoon
        (412.0, 266.0, 3.2, 1.6, -35.0,  7.0),  # North Shadow Salina Lagoon
    ]
    for lxc, lyc, lrx, lry, lang, llev in tsunami_lagoons:
        th_l = math.radians(lang)
        u_l = (px - lxc) * math.cos(th_l) + (py - lyc) * math.sin(th_l)
        v_l = -(px - lxc) * math.sin(th_l) + (py - lyc) * math.cos(th_l)
        r_l = np.hypot(u_l / lrx, v_l / lry)
        is_tlag = (r_l <= 1.0) & is_tsunami_reg & (d_coast_tsu >= 2.5)
        whas_new[is_tlag] = True
        wlev_new[is_tlag] = llev
        En_new = np.where(is_tlag, np.minimum(En_new, llev - 6.0), En_new)

    # --- (5B) Farside Coastal Tsunami Bench, Līng-Mā (`r002`) Sea-Level Estuary, & Farport Bluff (`px=294, py=588` at 212 m):
    #   - Tsunamis from the Steaming Seamounts refract through the southern Arch gap and funnel into the Farside–Crook
    #     sea channel with a 35–55 m shoreline wave crest (50 m design crest) and a 100 m maximum vertical run-up ceiling
    #     (wave-planed bedrock scour bench to 65 m, V-shaped megaboulder chevrons to 38 m).
    #   - Clear any residual perched water cells in the Farside shoreline zone (`px = 272..298, py = 568..608`, including
    #     the old 104 m cell at `px = 283, py = 587`), carve the drowned sea-level estuary of `Līng-Mā` (`r002`) from
    #     `(278, 587)` to `(290, 588)` at `wlev = 0.0 m` (`En = -12.0..-6.5 m`), and grade the near-shore coastal bluff
    #     plateau at `Farport` (`px = 294, py = 588`) to `212.0 m` (`112 m` above the 100 m tsunami run-up ceiling,
    #     just `8 km` above the `0.0 m` estuary harbour quay).
    in_farside_harbour_box = (px >= 272.0) & (px <= 298.0) & (py >= 568.0) & (py <= 608.0)
    perched_farside_water = in_farside_harbour_box & whas_new & (np.nan_to_num(wlev_new, nan=0.0) > 0.5)
    whas_new[perched_farside_water] = False
    wlev_new[perched_farside_water] = np.nan

    # Drowned estuary harbour for Līng-Mā (`r002`) and Farport quay (`px = 278..290, py = 586..589` at 0.0 m sea level)
    d_estuary = np.hypot(np.maximum(0.0, np.maximum(278.0 - px, px - 290.0)), (py - 587.5) / 1.35)
    is_farport_estuary = (d_estuary <= 1.25) & (px >= 277.0) & (px <= 290.5)
    whas_new[is_farport_estuary] = True
    wlev_new[is_farport_estuary] = 0.0
    En_new = np.where(is_farport_estuary, -12.0 + 3.5 * np.clip((px - 278.0) / 12.0, 0.0, 1.0), En_new)

    # Keep the low Farside coastal scour bench (up to 65 m) and megaboulder chevrons (up to 38 m) along the harbour shore
    d_farside_sea = nd.distance_transform_edt(~(whas_new & (np.nan_to_num(wlev_new, nan=999.0) <= 0.5)))
    w_farside_bench = (
        G.sstep(270.0, 276.0, px) * (1.0 - G.sstep(291.0, 294.0, px))
        * G.sstep(570.0, 576.0, py) * (1.0 - G.sstep(600.0, 608.0, py))
        * (1.0 - G.sstep(1.0, 6.5, d_farside_sea))
        * (~whas_new).astype(float)
    )
    h_farside_scour = (
        8.0
        + 48.0 * np.clip(d_farside_sea / 6.0, 0.0, 1.15)
        + 24.0 * chevron_ridge * G.sstep(1.0, 3.0, d_farside_sea)
        - 10.0 * backwash_chute * G.sstep(0.5, 2.5, d_farside_sea)
    )
    En_new = En_new * (1.0 - 0.85 * w_farside_bench) + np.maximum(3.5, h_farside_scour) * (0.85 * w_farside_bench)
    w_tsunami_scour = np.maximum(w_tsunami_scour, w_farside_bench)
    w_tsunami_chevron = np.maximum(w_tsunami_chevron, w_farside_bench * chevron_ridge * G.sstep(1.0, 3.0, d_farside_sea))

    # Near-shore Farport Bluff Plateau centered at `(294, 588)` at `~212.0 m` (safe above the 100 m tsunami run-up ceiling)
    r_farport_pad = np.hypot((px - 294.0) / 3.2, (py - 588.0) / 3.2)
    w_farport_pad = (1.0 - G.sstep(0.0, 1.35, r_farport_pad)) * (~whas_new).astype(float)
    h_farport_pad = 212.0 + 18.0 * (px - 294.0) + 4.0 * fbm1
    En_new = En_new * (1.0 - 0.90 * w_farport_pad) + h_farport_pad * (0.90 * w_farport_pad)
    En_new[588, 294] = 212.0
    whas_new[588, 294] = False
    wlev_new[588, 294] = np.nan
    del (
        d_in_oz, d_out_oz, sd_oz, w_ozarks_env, h_ozark_bg, h_ozark_table,
        xw_oz, yw_oz, dendritic_wave, hollow_cut, doline_field, h_porphyry_boost, h_ozark_target,
        w_tsunami_poly, d_coast_tsu, exposure_tsu, scour_width_px,
        dx_sm, dy_sm, r_sm, th_sm, chevron_phase, chevron_ridge, backwash_chute, h_scour_bench,
        d_estuary, d_farside_sea, w_farside_bench, h_farside_scour, r_farport_pad, w_farport_pad, h_farport_pad,
    )
    gc.collect()

    # --- (6) `ne outer wall` (`rmvymakpc0pft`, X = 1089..1456, Y = 253..399) — *The Glass-Skarn Bastion*:
    # Sculpt the 3 signature tectono-magmatic impact-wall landforms inside `ne outer wall`:
    #   (a) Concentric listric slump terraces & pseudotachylite fault scarps (+2,450 m & +3,250 m benches),
    #   (b) Intersecting NE-striking Arachnoid radial basalt dike-walls (+150..+230 m) forming rectangular boxwork ribs,
    #   (c) 3 Boxwork Dike-Cauldrons (geothermal hanging basins with warm `WH` hydrothermal tarns at +2,810 m, +2,950 m, +2,670 m),
    #   (d) Contact-metamorphic Garnet-Epidote Skarn badlands along the southern Northern Korona contact!
    ne_outer_wall_verts = [
        [1089, 339], [1107, 367], [1175, 366], [1225, 390], [1254, 387], [1304, 377],
        [1362, 380], [1415, 391], [1456, 399], [1415, 321], [1389, 295], [1356, 288],
        [1309, 294], [1261, 267], [1241, 253], [1214, 282], [1162, 321],
    ]
    is_ne_ow_raw = _poly_mask(ne_outer_wall_verts) & ~whas_new & ~is_high_lake
    # Protect the Web-Cleaver Gorge (`w_canyon`) and Outland Gate pass (`w_ne_connector`) so their river thalwegs stay open!
    gorge_guard_ne = np.clip(1.0 - 0.90 * np.maximum(w_canyon, w_ne_connector), 0.0, 1.0)
    w_ne_outer_wall = nd.gaussian_filter(is_ne_ow_raw.astype(float), sigma=4.5) * gorge_guard_ne * (~whas_new).astype(float)

    # (a) Concentric listric slump terraces (+2,450 m and +3,250 m back-tilted impact-wall benches)
    for b_el, b_w in ((2450.0, 310.0), (3250.0, 360.0)):
        de_b = En_new - b_el
        w_ter = np.exp(-((de_b / b_w) ** 2)) * w_ne_outer_wall
        En_new = En_new - w_ter * (0.54 * de_b)

    # (b) Intersecting Boxwork Dike-Walls: NE-striking radial Arachnoid basalt dikes crossed by WNW concentric rim faults
    u_dike_ne = (px - 1250.0) * 0.78 + (py - 335.0) * 0.62 + 4.5 * fbm1
    v_fault_wnw = -(px - 1250.0) * 0.24 + (py - 335.0) * 0.97 + 3.8 * fbm2
    rib_ne = np.clip(np.cos(u_dike_ne * (2.0 * math.pi / 26.0)), 0.0, 1.0) ** 3.2
    rib_wnw = np.clip(np.cos(v_fault_wnw * (2.0 * math.pi / 28.0)), 0.0, 1.0) ** 3.0
    w_ne_dike_rib = np.clip((rib_ne + 0.85 * rib_wnw) * w_ne_outer_wall, 0.0, 1.0)
    En_new = En_new + (175.0 * w_ne_dike_rib)

    # (c) 3 Boxwork Dike-Cauldrons (geothermally heated dike-dammed hanging basins with warm hydrothermal tarns `WH`)
    ne_cauldrons = [
        # (xc, yc, rx_basin, ry_basin, floor_m, rx_tarn, ry_tarn, tarn_lev_m)
        (1186.0, 344.0, 13.5, 8.5, 2820.0, 3.2, 2.0, 2810.0),  # Garnet-Mirror Cauldron
        (1258.0, 326.0, 15.0, 9.5, 2960.0, 3.6, 2.2, 2950.0),  # Vitreous Boxwork Hollow
        (1342.0, 338.0, 14.0, 8.5, 2680.0, 3.4, 2.0, 2670.0),  # Epidote-Steam Cauldron
    ]
    w_ne_cauldron = np.zeros((NEW_OH, NEW_OW), dtype=float)
    for cxc, cyc, crx, cry, cfloor, trx, try_, tlev in ne_cauldrons:
        r_cb = np.hypot((px + 2.0 * fbm1 - cxc) / crx, (py + 2.0 * fbm2 - cyc) / cry)
        w_cb = ((1.0 - G.sstep(0.0, 1.35, r_cb)) ** 1.4) * w_ne_outer_wall
        h_cb_prof = cfloor + 520.0 * (np.clip(r_cb, 0.0, 1.35) ** 1.6) + 35.0 * (rn_fine - 0.35)
        En_new = En_new * (1.0 - 0.88 * w_cb) + np.minimum(En_new, h_cb_prof) * (0.88 * w_cb)
        w_ne_cauldron = np.maximum(w_ne_cauldron, (1.0 - G.sstep(0.0, 1.05, r_cb)) * w_ne_outer_wall)
        w_ne_dike_rib *= G.sstep(0.55, 0.95, r_cb)

        r_ctarn = np.hypot((px - cxc) / trx, (py - cyc) / try_)
        is_ctarn = (r_ctarn <= 1.0) & is_ne_ow_raw
        whas_new[is_ctarn] = True
        wlev_new[is_ctarn] = tlev
        En_new = np.where(is_ctarn, np.minimum(En_new, tlev - 10.0), En_new)

    # (d) Contact-Metamorphic Garnet–Epidote Skarn Badlands along the southern Korona aureole & dike contacts
    w_ne_skarn = np.clip(
        w_ne_outer_wall
        * (0.55 * G.sstep(332.0, 378.0, py + 6.0 * fbm2) + 0.65 * w_ne_dike_rib + 0.45 * G.sstep(0.35, 0.75, rn_fine))
        * (1.0 - 0.75 * w_ne_cauldron),
        0.0, 1.0
    )

    # --- (7) Combined `NW outer wall` (`rmuqm8dxeuvhi`, X = 322..938, Y = 256..625) Impact-Crater Slump Continuity:
    # Sculpt continuous concentric listric rotational slump terraces (+3,350 m, +4,250 m, +5,150 m) and antislope
    # sackung trenches across the northern trans-boundary half (`Y = 256..420`) of the combined `NW outer wall`
    # so the entire merged region shares a unified megacrater-wall structural fabric with `w outer wall`!
    nw_ow_comb_verts = [
        [322, 625], [326, 608], [328, 597], [381, 567], [463, 456], [499, 412], [501, 392],
        [478, 377], [516, 282], [547, 256], [622, 267], [685, 297], [760, 275], [848, 280],
        [938, 289], [860, 360], [879, 450], [895, 513], [861, 512], [826, 495], [750, 502],
        [689, 511], [634, 535], [583, 520], [501, 577], [419, 598], [399, 605], [344, 622],
    ]
    is_nwow_comb = _poly_mask(nw_ow_comb_verts) & ~whas_new & ~old_lake_guard
    w_nwow_north = (
        nd.gaussian_filter(is_nwow_comb.astype(float), sigma=5.0)
        * (1.0 - G.sstep(322.0, 342.0, py))
        * (1.0 - 0.85 * w_sasquatch_vales)
        * (~whas_new).astype(float)
    )
    for b_el, b_w in ((3350.0, 320.0), (4250.0, 400.0), (5150.0, 440.0)):
        de_nw = En_new - b_el
        w_bnw = np.exp(-((de_nw / b_w) ** 2)) * w_nwow_north
        En_new = En_new - w_bnw * (0.52 * de_nw)
    w_nw_crater_scarp = np.clip(
        nd.gaussian_filter(is_nwow_comb.astype(float), sigma=4.0)
        * G.sstep(2800.0, 3800.0, En_new) * (1.0 - G.sstep(6200.0, 6900.0, En_new))
        * G.sstep(0.42, 0.72, rn_fine),
        0.0, 1.0
    )

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
    if ria_main_pts[-1] != [490.0, 186.0]:
        ria_main_pts.append([490.0, 186.0])

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
            'to': {'kind': 'river', 'id': 9101, 'at_px': arch_riv_pts[-1]},
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
            'to': {'kind': 'river', 'id': 9101, 'at_px': ntrib_pts[-1]},
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
        {
            'id': 9109,
            'name': 'Neo-Ozark Porphyry Fork',
            'tier': 'trib',
            'len_km': 320.0,
            'q_mouth': 440.0,
            'q_m3s': [round(95.0 + 345.0 * (i / max(1, len(ozark_riv_pts) - 1)), 1) for i in range(len(ozark_riv_pts))],
            'px': ozark_riv_pts,
            'to': {'kind': 'river', 'id': 9101, 'at_px': ozark_riv_pts[-1]},
        },
        {
            'id': 9110,
            'name': 'Silent Vales River',
            'tier': 'trib',
            'len_km': 410.0,
            'q_mouth': 540.0,
            'q_m3s': [round(80.0 + 460.0 * (i / max(1, len(silent_riv_pts) - 1)), 1) for i in range(len(silent_riv_pts))],
            'px': silent_riv_pts,
            'to': {'kind': 'river', 'id': 9105, 'at_px': silent_riv_pts[-1]},
        },
    ]

    new_expansion_regions = [
        {
            'id': 'rmvyiyw8ucd1y',
            'name': 'neo-ozarks',
            'color': '#3f6e4a',
            'kind': 'biome',
            'createdAt': '2026-11-01T23:54:20.692Z',
            'notes': (
                'Neo-Ozarks Dissected Carbonate & Porphyry Plateau (56,684 km²): an ancient epeirogenic tableland of '
                'flat-lying cherty dolomite and limestone (+1,260 to +1,680 m) deeply dissected by spring-fed hollows '
                'and first-magnitude karst caverns. Famous for its 5 strike-aligned exposed veins and knobs of purple-red '
                'rhyolite porphyry (+180 to +320 m ridges) where rivers carve boulder-choked canyon shut-ins.'
            ),
            'points': ozark_verts,
        },
        {
            'id': 'rmvyj1kvhx4m4',
            'name': 'sasquatch tribes',
            'color': '#2aa493',
            'kind': 'political',
            'createdAt': '2026-11-01T23:57:49.092Z',
            'notes': (
                'Sasquatch Tribes High Periglacial Valleys (132,232 km²): a rugged northern rim territory east of the '
                'NW Outer Wall, cleaved by 4 steep-walled glaciated and periglacial U-troughs (Frost-Jaw Vale, '
                'Bone-Larch Hollow, Hoar-Wind Glen, and Scree-Tooth Basin at +5,850 to +6,240 m, 0.71–0.76 atm, ET/Dsc) '
                'smaller and harsher than the Yeti Kingdom\'s Cold Lake valley.'
            ),
            'points': sasquatch_verts,
        },
        {
            'id': 'rmvyj4v2ozgb1',
            'name': 'spider lake',
            'color': '#85aa3b',
            'kind': 'biome',
            'createdAt': '2026-11-02T00:02:02.078Z',
            'notes': (
                'Spider Lake Highland Silk-Forest Basin (72,928 km²): centered on the +1,460.0 m hydrothermal highland '
                'lake (1.20 atm, 0.26 atm O₂, Cfa/Cfb). Sublacustrine warm seeps fuel year-round "lake-smoke" midge '
                'clouds that sustain permanent 200,000-strong colonies of eusocial spiders (Arachneapolita sericifera) '
                'and live rotational silk-weir arachniculture (see biomes/spiderlake/PLAN.md).'
            ),
            'points': [
                [1225, 203], [1227, 222], [1236, 242], [1283, 276], [1315, 291], [1345, 285],
                [1364, 284], [1381, 286], [1417, 247], [1409, 221], [1382, 190], [1333, 164],
                [1284, 154], [1255, 169],
            ],
        },
        {
            'id': 'rmvyk0ubpkdoy',
            'name': 'Silent Vales',
            'color': '#d7bd60',
            'kind': 'geographic',
            'createdAt': '2026-11-02T00:48:39.256Z',
            'notes': (
                'The Silent Vales (40,444 km²): an interconnected network of sheltered, fog-draped cool-temperate '
                'montane valleys (+1,135 to +1,890 m floors, Cfb/Csb) and two quiet ribbon lakes nestled behind the '
                'western coastal hogback ridge, draining west via a mossy water-gap gorge into the Crook River.'
            ),
            'points': silent_verts,
        },
        {
            'id': 'rmvyk62bgdvs3',
            'name': 'tsunami coast',
            'color': '#cf573a',
            'kind': 'geographic',
            'createdAt': '2026-11-02T00:55:27.515Z',
            'notes': (
                'The Tsunami Coast (483,208 km²): northwestern mainland littoral zone repeatedly battered by tsunami '
                'trains generated by the explosive Steaming Seamounts. Features a wave-planed bedrock scour apron '
                '(+6 to +65 m in the SW funnel sector, +4 to +24 m in the NE Arch-shielded shadow), NW-to-SE V-shaped '
                'megatsunami boulder chevrons, backwash canyons, and perched saline plunge-pool lagoons.'
            ),
            'points': tsunami_verts,
        },
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
                'carry the Outland Gate River from the northern Outland lake directly into Spider Lake (see biomes/outlandgate/PLAN.md).'
            ),
            'points': [
                [1345, 215], [1445, 245], [1555, 345], [1565, 475], [1475, 475], [1405, 365],
            ],
        },
        {
            'id': 'rmvymakpc0pft',
            'name': 'ne outer wall',
            'color': '#cf573a',
            'kind': 'biome',
            'createdAt': '2026-11-02T01:54:51.999Z',
            'notes': (
                'NE Outer Wall — The Glass-Skarn Bastion (101,372 km²): a structurally unique impact-crater rim bastion '
                'wedged between the Northern Korona volcano-tectonic dome, the Arachnoid radial dike swarm, Spider Lake, '
                'and the Outland Gate fault. Features 3 geothermally heated Boxwork Dike-Cauldrons (+2,670 to +2,950 m '
                'warm hydrothermal tarns), pistachio-green epidote and wine-red grossular garnet contact-metamorphic skarn '
                'badlands, and black pseudotachylite fault mirrors.'
            ),
            'points': ne_outer_wall_verts,
        },
        {
            'id': 'rmw8ca6baau47',
            'name': 'Yuni Emirate',
            'color': '#d9c14a',
            'points': [
                [1272, 946], [1258, 980], [1240, 1014], [1224, 1032], [1211, 1052],
                [1174, 1087], [1165, 1104], [1195, 1105], [1206, 1098], [1290, 1144],
                [1324, 1144], [1345, 1167], [1386, 1259], [1435, 1283], [1487, 1341],
                [1504, 1369], [1499, 1414], [1481, 1444], [1485, 1479], [1528, 1502],
                [1565, 1455], [1601, 1386], [1633, 1310], [1610, 1251], [1592, 1185],
                [1592, 1119], [1575, 1073], [1527, 1050], [1469, 1071], [1452, 1107],
                [1438, 1119], [1389, 1105], [1370, 1083], [1379, 1026], [1393, 979],
                [1389, 916], [1303, 919], [1273, 913],
            ],
            'notes': '',
            'kind': 'political',
            'createdAt': '2026-11-08T21:33:25.197Z',
        },
        {
            'id': 'rmw8bqrn3dnx4',
            'name': 'Labyrinth',
            'color': '#6fb5a8',
            'points': [
                [322, 1412], [293, 1349], [184, 1358], [113, 1402], [90, 1484],
                [136, 1580], [187, 1616], [252, 1640], [310, 1637], [354, 1607],
                [383, 1569], [393, 1513], [345, 1463],
            ],
            'notes': (
                'The Labyrinth (250,872 km²): a Martian Noctis Labyrinthus & E/NE Chaos Terrain inversion '
                'canyon complex carved into the 4.8–6.3 km SW Glaciated Dome. Progresses from beaded pit-crater '
                'catenae in the west/south through a 3-trend intersecting polyhedral fault-graben network in the '
                'center into a collapsed Martian Chaos Terrain of isolated flat-topped horst mesas and knobby '
                'pyramids in the east/northeast opening toward The Rift and Copper Glacier.'
            ),
            'kind': 'biome',
            'createdAt': '2026-11-08T21:18:19.044Z',
        },
        {
            'id': 'rmw4vh9t20da4',
            'name': 'great chasm',
            'color': '#c9b08a',
            'points': [
                [1660, 1003], [1667, 1022], [1696, 1028], [1723, 1032], [1745, 1001],
                [1747, 913], [1741, 858], [1713, 841], [1671, 798], [1633, 818],
                [1614, 851], [1647, 880], [1672, 928], [1666, 987],
            ],
            'notes': '',
            'kind': 'biome',
            'createdAt': '2026-11-06T11:09:43.526Z',
        },
        {
            'id': 'rmw4wizrk66e1',
            'name': 'silent vale',
            'color': '#6fb5a8',
            'points': [
                [201, 837], [238, 870], [236, 927], [209, 982], [237, 1049],
                [245, 1082], [226, 1147], [207, 1144], [177, 1100], [154, 1022],
                [129, 1001], [160, 935], [158, 876], [171, 831], [193, 827],
            ],
            'notes': '',
            'kind': 'biome',
            'createdAt': '2026-11-06T11:39:03.440Z',
        },
        {
            'id': 'rmw4wknusgc7h',
            'name': 'crookshore',
            'color': '#e0e0e0',
            'points': [
                [272, 586], [250, 650], [216, 694], [179, 740], [134, 757],
                [62, 747], [42, 709], [36, 632], [37, 574], [37, 548],
                [69, 566], [69, 597], [76, 630], [95, 635], [139, 644],
                [191, 618], [253, 579],
            ],
            'notes': '',
            'kind': 'biome',
            'createdAt': '2026-11-06T11:40:21.316Z',
        },
        {
            'id': 'rmw4wou2y1hhc',
            'name': 'godshearth',
            'color': '#7c8a5e',
            'points': [
                [808, 1379], [824, 1387], [837, 1374], [862, 1370], [871, 1376],
                [880, 1385], [872, 1403], [854, 1411], [845, 1451], [845, 1408],
                [831, 1408], [821, 1400], [808, 1391],
            ],
            'notes': '',
            'kind': 'biome',
            'createdAt': '2026-11-06T11:43:36.010Z',
        },
        {
            'id': 'rmw4xy4tp9b29',
            'name': 'SE outer wall',
            'color': '#e0e0e0',
            'points': [
                [1329, 1136], [1356, 1201], [1336, 1222], [1299, 1228], [1267, 1254],
                [1245, 1276], [1224, 1300], [1201, 1346], [1130, 1352], [1092, 1340],
                [1060, 1310], [1039, 1292], [1009, 1305], [997, 1207], [1032, 1205],
                [1091, 1204], [1164, 1198], [1249, 1188], [1300, 1160], [1324, 1141],
            ],
            'notes': '',
            'kind': 'biome',
            'createdAt': '2026-11-06T12:18:49.453Z',
        },
        {
            'id': 'rmw52q8d7prwz',
            'name': 'opal valley',
            'color': '#3f8fb5',
            'points': [
                [982, 1622], [1019, 1638], [1047, 1648], [1065, 1660],
                [1112, 1664], [1146, 1676], [1107, 1691], [1066, 1698],
                [1051, 1698], [1013, 1685], [960, 1640],
            ],
            'notes': '',
            'kind': 'biome',
            'createdAt': '2026-11-06T14:32:38.875Z',
        },
        {
            'id': 'rmw536m06wlyf',
            'name': 'twins',
            'color': '#3f8fb5',
            'points': [
                [935, 1476], [978, 1419], [1059, 1472], [1095, 1521],
                [1092, 1556], [1043, 1570], [987, 1515],
            ],
            'notes': '',
            'kind': 'biome',
            'createdAt': '2026-11-06T14:45:23.046Z',
        },
        {
            'id': 'rmw5n1w1rx0u2',
            'name': 'Greenstep',
            'color': '#c95a6a',
            'points': [
                [662, 1348], [674, 1349], [686, 1321], [692, 1302],
                [668, 1253], [663, 1204], [631, 1195], [584, 1198],
                [578, 1220], [594, 1237], [615, 1255], [622, 1269],
                [637, 1289], [633, 1313], [652, 1321],
            ],
            'notes': (
                'Greenstep (renamed from Green Valley): the windward, rain-drenched counterpart of Godstep Valley, '
                'descending NNW across five ponded flood-basalt lava terraces (+3,180 m to +960 m) incised by two '
                'collapsed lava-tube rilles. Captures ~1,050–1,760 mm/yr of rain (Cfa/Cfb) from prevailing NW winds '
                'and serves as the greatest refuge of the Free Giants (the Vrivolci) and escaped slaves of every people '
                'fleeing the Vothic Kingdom and the Realm of Dalab, home to their cyclopean fortress of Tallwalls '
                '(Talodunon / Da-Talwal) at px 650, 1268 (biomes/greenstep/PLAN.md).'
            ),
            'kind': 'biome',
            'createdAt': '2026-11-07T00:01:35.103Z',
        },
        {
            'id': 'rmw5ruqmv60t3',
            'name': 'Realm of Dalab',
            'color': '#3f8fb5',
            'points': [
                [624, 1141], [630, 1172], [622, 1189], [589, 1213], [569, 1220], [507, 1231],
                [508, 1308], [504, 1369], [494, 1399], [467, 1417], [432, 1411], [399, 1380],
                [374, 1345], [348, 1298], [332, 1271], [344, 1236], [395, 1246], [410, 1184],
                [423, 1144], [380, 1109], [356, 1071], [350, 1051], [366, 1043], [396, 1019],
                [435, 1019], [455, 1009], [467, 1014], [489, 1005], [520, 1001], [553, 996],
                [572, 1013], [583, 1035], [559, 1061], [545, 1097], [534, 1118], [589, 1136],
            ],
            'notes': '',
            'kind': 'political',
            'createdAt': '2026-11-07T02:15:59.575Z',
        },
        {
            'id': 'rmw5rzefnfapk',
            'name': 'Vothic Kingdom',
            'color': '#8a6fc9',
            'points': [
                [588, 1035], [560, 1065], [550, 1098], [616, 1116], [628, 1138], [633, 1177],
                [639, 1196], [673, 1190], [702, 1171], [722, 1161], [738, 1155], [757, 1149],
                [788, 1134], [784, 1117], [747, 1109], [710, 1105], [696, 1081], [705, 1055],
                [718, 1049], [739, 1047], [765, 1045], [779, 1050], [788, 1034], [787, 1011],
                [789, 986], [795, 936], [800, 920], [813, 894], [831, 898], [849, 904],
                [848, 894], [823, 885], [810, 867], [800, 849], [797, 832], [788, 834],
                [783, 860], [751, 857], [723, 859], [682, 867], [655, 879], [655, 914],
                [637, 949], [659, 971], [661, 1013], [679, 1027], [680, 1050], [657, 1078],
                [639, 1081], [622, 1071], [626, 1050],
            ],
            'notes': '',
            'kind': 'political',
            'createdAt': '2026-11-07T02:19:37.043Z',
        },
        {
            'id': 'rmw5s3ktxgv0d',
            'name': 'Shumar',
            'color': '#c95a6a',
            'points': [
                [681, 1187], [699, 1220], [727, 1226], [779, 1205],
                [826, 1123], [812, 1109], [718, 1161], [698, 1166],
            ],
            'notes': '',
            'kind': 'political',
            'createdAt': '2026-11-07T02:22:51.957Z',
        },
        {
            'id': 'rmw5sayxeskra',
            'name': 'Vrivolci',
            'color': '#5da05c',
            'points': [
                [578, 1219], [599, 1244], [620, 1280], [635, 1301],
                [658, 1331], [670, 1344], [686, 1295], [675, 1245],
                [673, 1226], [685, 1223], [695, 1223], [688, 1187],
                [660, 1192], [626, 1184], [601, 1201], [582, 1218],
            ],
            'notes': '',
            'kind': 'political',
            'createdAt': '2026-11-07T02:28:36.818Z',
        },
        {
            'id': 'rmw8hj62nmugn',
            'name': 'Firebliss Range',
            'color': '#6fb5a8',
            'points': [
                [234, 1237], [305, 1263], [320, 1298], [318, 1328],
                [280, 1351], [187, 1352], [111, 1403], [79, 1356],
                [38, 1259], [92, 1237], [155, 1269], [211, 1256],
            ],
            'notes': '',
            'kind': 'biome',
            'createdAt': '2026-11-08T23:50:22.079Z',
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
        w_sasquatch_vales=w_sasquatch_vales,
        w_ozark_dolomite=w_ozark_dolomite,
        w_porphyry_vein=w_porphyry_vein,
        w_silent_vales=w_silent_vales,
        w_tsunami_scour=w_tsunami_scour,
        w_tsunami_chevron=w_tsunami_chevron,
        w_ne_outer_wall=w_ne_outer_wall,
        w_ne_dike_rib=w_ne_dike_rib,
        w_ne_cauldron=w_ne_cauldron,
        w_ne_skarn=w_ne_skarn,
        w_nw_crater_scarp=w_nw_crater_scarp,
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
