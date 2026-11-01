"""Spike-Free Contour-Interpolated N/W Canvas Expansion (`1549x1393` -> `1821x1723` at `2 km/cell`):
Treats the painted color zones in `expansion_ref.jpg` (`Ocean -> Tan -> Mid-Green -> Dark-Green -> White -> Grey`)
as **continuous topographic contour intervals (isohypses)** rather than flat plateaus, and treats the
light-blue river markings (`is_river_paint`) as **local valley thalweg minima**, so both the Northern (Ria Valley)
and Western (The Crook) provinces slope naturally and continuously from the tallest mountain ranges down to
the rivers and the sea:

  1. Continuous Two-Sided Isohypse & Thalweg Harmonic Interpolation (`solve_contour_surface`):
     - Shoreline contour (`Ocean / Tan`): `0.0 m`
     - `Tan -> Mid-Green` contour line: `600.0 m`
     - `Mid-Green -> Dark-Green` contour line: `1,480.0 m` (matching Eastern Highland Lake at `+1,460.0 m`)
     - `Dark-Green -> White` contour line: `3,150.0 m`
     - `White -> Light/Dark-Grey` contour line: `5,550.0 m`
     - `Grey` mountain massifs & outer rim summits: `5,550 -> 8,800+ m`
     - All light-blue painted rivers (`is_river_paint`), the Crook axial river, Outland Gate river, and
       Web-Cleaver Gorge act as true valley-floor local minima toward which the contour slopes converge!
  2. Trans-Boundary NE Outland Pass (`rmvoutlandpass`, `X = 1350..1575, Y = 240..475`) —
     Follows the user's dark-green and white contours across `Y = 330` into the old map to connect the
     Ria Valley / Eastern Highland Lake uplands directly into Outland.
  3. Trans-Boundary SW Crook–Rift Connector (`rmvcopperglacier`, `X = 15..375, Y = 1080..1475`) —
     Follows the user's dark-green and white contours across `X = 272` into the old map to connect the
     southern Crook & Copper Glacier directly into the northwestern head of The Rift.
  4. Venusian Arachnoid Network & Scenic Northern Korona Canyon (`rmvarachnoids`, *The Web-Cleaver Gorge*) —
     Concentric caldera ring-dikes and radial fracture canyons straddling N, E, and SW Korona and the
     southern Ria slopes, cleaved by a sinuous canyon from the Eastern Highland Lake to the Ria River.
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


def classify_paint_reference(ref_path, whas0_old):
    """Project `expansion_ref.jpg` onto the `1821x1723` full-resolution grid, erase the red boundary
    marker line and outer Paint frame before Voronoi contour classification, and extract all contour
    tiers, light-blue river thalwegs, and trans-boundary NE Outland & SW Crook–Rift masks."""
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

    # 0. Clean outer Paint border frame (`X < 38` or `Y < 30` where Paint had a border/frame around the canvas)
    # and clean the bottom-left truncated Paint strip (`Y >= 1555, X < 285`)
    arr[:, :38, :] = arr[:, 38:39, :]
    arr[:30, :, :] = arr[30:31, :, :]
    arr[1555:, :285, :] = arr[1540:1541, :285, :]

    # 1. Identify Red Seamount Swarm (`X = 140..220, Y = 285..368`) BEFORE erasing the red boundary line!
    is_seamount = (
        (arr[..., 0] > 185.0) & (arr[..., 1] < 70.0) & (arr[..., 2] < 70.0)
        & (X >= 140) & (X <= 220) & (Y >= 285) & (Y <= 368)
    )
    is_seamount = nd.binary_closing(is_seamount, iterations=3)

    # 2. Erase the red boundary marker line (`X ~ 272, Y >= 320` and `Y ~ 330, X >= 260`)
    is_red_line = (
        (arr[..., 0] > 165.0) & (arr[..., 1] < 95.0) & (arr[..., 2] < 95.0)
        & ~is_seamount
        & (((np.abs(X - DX_F) <= 14) & (Y >= DY_F - 14)) | ((np.abs(Y - DY_F) <= 14) & (X >= DX_F - 14)))
    )
    if is_red_line.any():
        _, (ry, rx) = nd.distance_transform_edt(is_red_line, return_indices=True)
        for c in range(3):
            arr[..., c] = np.where(is_red_line, arr[ry, rx, c], arr[..., c])

    for c in range(3):
        arr[..., c] = nd.median_filter(arr[..., c], size=3)

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
    is_high_lake = (
        ((arr[..., 2] > arr[..., 0] + 35.0) & (arr[..., 2] > 135.0))
        & (X >= 1230) & (X <= 1360) & (Y >= 172) & (Y <= 242)
        & ~is_river_paint
    )
    is_high_lake = nd.binary_closing(is_high_lake, iterations=3)
    is_high_lake = nd.binary_fill_holes(is_high_lake)

    # 6. Great Double Delta Distributary Zone (`X = 520..650, Y = 92..230`)
    is_delta_channel = (
        ((arr[..., 2] > arr[..., 0] + 25.0) & (arr[..., 1] > 110.0) & (arr[..., 2] > 130.0))
        & (X >= 522) & (X <= 648) & (Y >= 92) & (Y <= 228)
    )

    # Inpaint over foreground markings (`is_arach`, `is_river_paint`, `is_seamount`, `is_high_lake`)
    # so the underlying contour bands (`Tan`, `Mid-Green`, `Dark-Green`, `White`, `Grey`) are 100% continuous!
    fg_marks = is_arach | is_river_paint | is_seamount | is_high_lake
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
        [46.0,   94.0,  42.0],  # 3: Dark-Green contour band (1,480 .. 3,150 m)
        [252.0, 252.0, 252.0],  # 4: White alpine contour band (3,150 .. 5,550 m)
        [195.0, 195.0, 195.0],  # 5: Light-Grey high plateau / outer rim contour band (> 5,550 m)
        [127.0, 127.0, 127.0],  # 6: Dark-Grey high northern massif (> 5,550 m)
    ], dtype=float)

    diff = arr_bg[:, :, None, :] - centroids[None, None, :, :]
    dist2 = (diff ** 2).sum(axis=-1)

    in_dkgrey_box = (X >= 520) & (X <= 1120) & (Y < 145)
    dist2[:, :, 6] = np.where(in_dkgrey_box, dist2[:, :, 6], 1e12)

    in_ltgrey_box = ((X >= 1340) & (Y < 345)) | ((X < 280) & (Y >= 1020))
    dist2[:, :, 5] = np.where(in_ltgrey_box, dist2[:, :, 5], 1e12)

    in_ocean_box = ((X < 780) & (Y < 720)) | (Y < 95)
    dist2[:, :, 0] = np.where(in_ocean_box & ~is_high_lake, dist2[:, :, 0], 1e12)

    tier_id = np.argmin(dist2, axis=-1)
    tier_id = nd.median_filter(tier_id, size=5)

    # Unify NW ocean mask with `whas0_old` across the red boundary (`X = 272..525, Y = 330..595`)
    # and ensure the outer NW ocean border (`X < 42` or `Y < 34` within the NW sea) has zero Paint frame artifacts!
    old_nw_ocean = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    old_nw_ocean[DY_F:DY_F + 275, DX_F:DX_F + 265] = whas0_old[:275, :265]
    nw_border_ocean = ((X < 465) & (Y < 36)) | ((Y < 562) & (X < 42))
    is_ocean = ((tier_id == 0) & ~is_high_lake) | old_nw_ocean | nw_border_ocean
    nw_sea_box = (X < 525) & (Y < 595)
    is_ocean_nw = nd.binary_closing(is_ocean & nw_sea_box, structure=np.ones((9, 9)))
    is_ocean = np.where(nw_sea_box, is_ocean_nw, is_ocean)
    is_ocean = nd.binary_opening(nd.binary_closing(is_ocean, iterations=2), iterations=1)
    # Restore `nw_border_ocean` after `binary_opening` so `X=0` and `Y=0` never erode to False!
    is_ocean = is_ocean | nw_border_ocean
    tier_id = np.where(is_ocean, 0, np.maximum(tier_id, 1))

    # 8. Extract Explicit Trans-Boundary Masks Where User Contours Cross into the Old Map (`X >= 272, Y >= 330`):
    # 8A. NE Outland Connector (`X = 1350..1575, Y = 240..475` — connects Ria Valley / Highland Lake to Outland!)
    ne_conn_box = (X >= 1350) & (X <= 1575) & (Y >= 240) & (Y <= 475)
    is_ne_conn_green = ne_conn_box & (
        (arr[..., 1] > arr[..., 0] + 16.0) & (arr[..., 1] > arr[..., 2] + 16.0) & (arr[..., 1] < 145.0)
    )
    is_ne_conn_green = nd.binary_closing(is_ne_conn_green, iterations=3)
    is_ne_conn_white = ne_conn_box & (
        (arr[..., 0] > 232.0) & (arr[..., 1] > 232.0) & (arr[..., 2] > 232.0)
    ) & ~is_ne_conn_green
    is_ne_conn_white = nd.binary_closing(is_ne_conn_white, iterations=3)
    is_ne_connector = nd.binary_dilation(is_ne_conn_green | is_ne_conn_white, iterations=2) & ne_conn_box

    # 8B. SW Crook–Rift Connector (`X = 15..375, Y = 1080..1335` — connects southern Crook & Copper Glacier to the Rift!)
    sw_conn_box = (X >= 15) & (X <= 375) & (Y >= 1080) & (Y <= 1335)
    is_sw_conn_green = sw_conn_box & (
        (arr[..., 1] > arr[..., 0] + 16.0) & (arr[..., 1] > arr[..., 2] + 16.0) & (arr[..., 1] < 145.0)
        & (X <= 235)
    )
    is_sw_conn_green = nd.binary_closing(is_sw_conn_green, iterations=3)
    is_sw_conn_white = sw_conn_box & (
        (arr[..., 0] > 232.0) & (arr[..., 1] > 232.0) & (arr[..., 2] > 232.0)
    ) & ~is_sw_conn_green
    is_sw_conn_white = nd.binary_closing(is_sw_conn_white, iterations=3)
    is_sw_conn_white = is_sw_conn_white & ((X < DX_F + 8) | ((Y >= 1175) & (Y <= 1268) & (X <= 368)))
    is_sw_connector = (is_sw_conn_green | is_sw_conn_white) & sw_conn_box

    # Ensure the entire SW exterior corner south of the Crook-Rift pass (`X < 285, Y >= 1335` outside `is_sw_connector`)
    # is classified as Tier 5 (`is_ltgrey`, high outer crater rim continuation) so the truncated Paint bottom sliver
    # never creates a lowland tan or stepped rectangle in the bottom-left corner!
    sw_outer_corner = (X < 285) & (Y >= 1335) & ~is_sw_connector
    tier_id = np.where(sw_outer_corner, 5, tier_id)
    # Also ensure the trans-boundary NE & SW green/white painted contours have their exact contour tiers (3 and 4)
    tier_id = np.where(is_ne_conn_white | is_sw_conn_white, 4, tier_id)
    tier_id = np.where(is_ne_conn_green | is_sw_conn_green, 3, tier_id)

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


def _solve_harmonic_extension(Eo_old, is_new_area):
    """Extend the old map's interior elevations (`Eo_old[14:, 14:]`, skipping the 14-px old canvas border strip!)
    smoothly into the new expansion area via multi-scale Gaussian Dirichlet relaxation."""
    u = np.zeros((NEW_OH, NEW_OW), dtype=float)
    u[DY_F:, DX_F:] = Eo_old
    core_old = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    core_old[DY_F + 14:, DX_F + 14:] = True
    need_fill = ~core_old
    _, (iy, ix) = nd.distance_transform_edt(need_fill, return_indices=True)
    u[need_fill] = u[iy[need_fill], ix[need_fill]]

    for sigma in (48.0, 24.0, 12.0, 6.0, 3.0):
        for _ in range(16):
            u_blur = nd.gaussian_filter(u, sigma=sigma)
            u[is_new_area] = u_blur[is_new_area]
    return u


def solve_contour_surface(
    tier_id, is_sea, is_river_paint, is_high_lake, is_ne_connector, is_sw_connector,
    h_harm, rn_broad, rn_fine, fbm1, fbm2
):
    """Interpolate a continuous, plateau-free topographic surface from the contour bands (`tier_id` 1..6)
    and light-blue river thalwegs (`is_river_paint`), so that every slope descends naturally from the
    tallest mountain crests across the White, Dark-Green, Mid-Green, and Tan contour lines down to the
    rivers and the sea (`0.0 m`)."""
    Y, X = np.indices((NEW_OH, NEW_OW), dtype=float)

    # Prevent the thin blank margin right along Y=330 (`X=545..1355, Y=272..342`) or X=272 (`X=225..282, Y=415..1160`)
    # from acting as a ruler-straight white contour wall; replace it with the adjacent Dark-Green contour tier!
    warp_y_bound = 328.0 - 24.0 * fbm2 - 14.0 * rn_broad
    artificial_north_strip = (X >= 545.0) & (X <= 1355.0) & (Y >= 272.0) & (Y <= 342.0) & (Y < warp_y_bound) & (tier_id == 4)
    warp_x_bound = 270.0 - 20.0 * fbm2 - 12.0 * rn_broad
    artificial_west_strip = (Y >= 415.0) & (Y <= 1160.0) & (X >= 225.0) & (X <= 282.0) & (X < warp_x_bound) & (tier_id == 4)
    tier_clean = np.where(artificial_north_strip | artificial_west_strip, 3, tier_id)

    # Seed `tier_clean` inside the adjacent untouched old map (`X >= 282, Y >= 340` outside `is_ne_connector` and `is_sw_connector`)
    # directly from `h_harm` so every contour band on the new canvas sees the true elevation of the adjacent old map across
    # the red boundary line and slopes continuously down from it!
    old_core_mask = (X >= DX_F + 10.0) & (Y >= DY_F + 10.0) & ~is_ne_connector & ~is_sw_connector
    old_tier = np.ones((NEW_OH, NEW_OW), dtype=int)
    old_tier = np.where(h_harm < 0.0, 0, old_tier)
    old_tier = np.where((h_harm >= 600.0) & (h_harm < 1480.0), 2, old_tier)
    old_tier = np.where((h_harm >= 1480.0) & (h_harm < 3150.0), 3, old_tier)
    old_tier = np.where((h_harm >= 3150.0) & (h_harm < 5450.0), 4, old_tier)
    old_tier = np.where(h_harm >= 5450.0, 5, old_tier)
    tier_clean = np.where(old_core_mask, old_tier, tier_clean)

    # Contour boundary elevations (in metres):
    #   C0 (tier 0 / 1 shoreline):           0.0 m
    #   C1 (tier 1 Tan / tier 2 Mid-Green):  600.0 m
    #   C2 (tier 2 Mid / tier 3 Dark-Green): 1,480.0 m (Eastern Highland Lake sits right on this contour at 1,460 m!)
    #   C3 (tier 3 Dark / tier 4 White):     3,150.0 m
    #   C4 (tier 4 White / tier 5-6 Grey):   5,450.0 m
    E_BOUNDS = [0.0, 600.0, 1480.0, 3150.0, 5450.0]

    # For each contour band k in {1, 2, 3, 4}:
    # - `d_low` is the distance to the lower contour boundary (`tier_clean < k`)
    # - `d_high` is the distance to the upper contour boundary (`tier_clean > k`)
    # - Where a band forms a local ridge or island crest with no higher contour tier inside it
    #   (e.g., an island crest in The Arch or a White mountain ridge crest), `d_low` reaches a local
    #   maximum `d_max_local` along the medial axis of the ridge! Using `d_crest = max(0, d_max_local - d_low)`,
    #   `d_up = min(d_high, d_crest)` guarantees that `t = d_low / (d_low + d_up)` rises smoothly from 0.0
    #   on the lower contour to 1.0 on either the upper contour OR the ridge's medial spine, with ZERO flat plateaus!
    h_cont = np.zeros((NEW_OH, NEW_OW), dtype=float)

    for k in (1, 2, 3, 4):
        E_lo = E_BOUNDS[k - 1]
        E_hi = E_BOUNDS[k]
        in_k = (tier_clean == k)
        if not in_k.any():
            continue

        d_low = nd.distance_transform_edt(tier_clean >= k)
        has_higher = (tier_clean > k)
        d_high = nd.distance_transform_edt(~has_higher) if has_higher.any() else np.full((NEW_OH, NEW_OW), 1e9)

        # Medial ridge spine distance for local maxima (islands, peninsulas, or White mountain crests without Grey cores)
        d_max_local = nd.maximum_filter(nd.gaussian_filter(d_low, sigma=2.0), size=35)
        d_to_spine = np.maximum(0.0, d_max_local - d_low)

        # If a higher contour is further away than the ridge thickness, interpolate toward the ridge spine,
        # scaling the peak height of an unclosed ridge by its half-width `d_max_local` so narrow islands
        # don't jump to the full `E_hi`!
        use_spine = d_high > (d_max_local * 1.35 + 6.0)
        d_up_eff = np.where(use_spine, d_to_spine, d_high)
        t_k = d_low / (d_low + d_up_eff + 1e-6)
        # Slightly concave-up natural hypsometric curve (`0.72 * t + 0.28 * t^1.45`) typical of fluvial/alpine slopes
        t_curve = 0.72 * t_k + 0.28 * (t_k ** 1.45)

        # For unclosed ridges/islands (no higher contour tier inside them), cap crest height proportionally to ridge width
        spine_crest_hi = E_lo + (E_hi - E_lo) * np.clip(d_max_local / 18.0, 0.22, 0.95)
        E_hi_eff = np.where(use_spine, spine_crest_hi, E_hi)

        h_band = E_lo + (E_hi_eff - E_lo) * t_curve
        h_cont = np.where(in_k, h_band, h_cont)

    # Tier 5 (Light-Grey: NE Tharn Cold-Dry Uplands `X >= 1300, Y < 360` vs SW High Outer Rim `X < 285, Y >= 1020`)
    in_t5 = (tier_clean == 5)
    if in_t5.any():
        d_in_t5 = nd.distance_transform_edt(in_t5)
        d_max_t5 = np.maximum(nd.maximum_filter(nd.gaussian_filter(d_in_t5, sigma=3.0), size=45), 8.0)
        t_t5 = np.clip(d_in_t5 / d_max_t5, 0.0, 1.0)
        # In the NE (Tharn Uplands), slope continuously from 5,450 m at the White contour up to 6,450 m at the NE divide;
        # In the SW (Outer Rim), slope continuously from 5,450 m at the White contour up to the adjacent old outer rim (`h_harm`, 8,500..12,500 m)!
        h_t5_ne = 5450.0 + 1050.0 * (0.65 * t_t5 + 0.35 * (t_t5 ** 1.4))
        h_t5_sw = 5450.0 + np.maximum(2400.0, h_harm - 5450.0) * (0.60 * t_t5 + 0.40 * (t_t5 ** 1.3))
        h_cont = np.where(in_t5 & (Y < 500.0), h_t5_ne, h_cont)
        h_cont = np.where(in_t5 & (Y >= 500.0), h_t5_sw, h_cont)

    # Tier 6 (Dark-Grey: North-Central Glaciated Shield Massif `X = 520..1120, Y < 150`)
    in_t6 = (tier_clean == 6)
    if in_t6.any():
        d_in_t6 = nd.distance_transform_edt(in_t6)
        d_max_t6 = np.maximum(nd.maximum_filter(nd.gaussian_filter(d_in_t6, sigma=3.0), size=45), 10.0)
        t_t6 = np.clip(d_in_t6 / d_max_t6, 0.0, 1.0)
        h_t6 = 5450.0 + 3150.0 * (0.65 * t_t6 + 0.35 * (t_t6 ** 1.35))
        h_cont = np.where(in_t6, h_t6, h_cont)

    # Smooth the raw contour-interpolated surface across contour boundaries (`sigma = 10 -> 5 px`)
    # BEFORE carving the light-blue river valley thalwegs so every contour boundary is 100% C^2 smooth!
    land_mask = ~is_sea
    h_smooth = nd.gaussian_filter(h_cont, sigma=9.0)
    # Keep shoreline anchored at 0.0 m
    d_from_sea = nd.distance_transform_edt(land_mask)
    w_coast_anchor = G.sstep(0.0, 12.0, d_from_sea)
    h_cont = (h_cont * (1.0 - w_coast_anchor) + h_smooth * w_coast_anchor) * land_mask

    # Now incorporate ALL user-painted Light-Blue Rivers (`is_river_paint`) + the Crook Axial River
    # as true valley thalweg local minima!
    # Every painted light-blue river pixel has a natural monotonic river-bed elevation `h_riv_target`
    # determined by the smoothed contour elevation along its course minus a gentle valley incision (`80..260 m`),
    # and the surrounding valley slopes (`d_to_riv < 28 px`) dip smoothly down into the river thalweg!
    is_crook_riv_line = (
        (Y >= 645.0) & (Y <= 1148.0)
        & (np.abs(X - (100.0 + 22.0 * G.sstep(720.0, 1050.0, Y) + 26.0 * G.sstep(1050.0, 1150.0, Y) + 8.0 * np.sin((Y - 650.0) * 0.015))) <= 2.0)
    )
    all_riv_seeds = (is_river_paint | is_crook_riv_line) & ~is_sea & ~is_high_lake
    if all_riv_seeds.any():
        d_to_riv, (riy, rix) = nd.distance_transform_edt(~all_riv_seeds, return_indices=True)
        h_at_riv = nd.gaussian_filter(h_cont, sigma=14.0)[riy, rix]
        # Valley depth increases with background elevation (`45 m` in coastal tan -> `280 m` in upper green contours)
        val_incision = np.clip(40.0 + 0.14 * h_at_riv, 35.0, 320.0)
        h_thalweg = np.maximum(2.5, h_at_riv - val_incision)
        # Smooth V-to-U valley cross-section over `26 px` (`52 km`) on each side of every painted light-blue river!
        w_riv_valley = (1.0 - G.sstep(0.0, 26.0, d_to_riv)) ** 1.45
        h_cont = h_cont * (1.0 - 0.72 * w_riv_valley) + np.minimum(h_cont, h_thalweg + val_incision * G.sstep(0.0, 26.0, d_to_riv)) * (0.72 * w_riv_valley)

    # Add natural multi-scale topographic texture proportional to elevation (subtle in valleys, rugged on high peaks)
    relief_amp = 18.0 + 0.14 * np.clip(h_cont, 0.0, 6500.0)
    h_cont = h_cont + relief_amp * (0.55 * (rn_broad - 0.38) + 0.30 * (rn_fine - 0.38) + 0.15 * fbm1) * G.sstep(0.0, 6.0, d_from_sea)

    return np.maximum(h_cont, 1.5) * land_mask


def build_arachnoid_and_canyon_field(X, Y, is_arach, rs):
    """Sculpt the Venusian Arachnoid Network (`X = 845..1345, Y = 180..755`) straddling the northern,
    eastern, and SW rims of Korona and southern Ria Valley, plus **The Web-Cleaver Gorge** — the dramatic
    meandering canyon connecting the Eastern Highland Lake (+1,460 m) through northern Korona's arachnoids
    down into the Ria River Valley!"""
    OH, OW = X.shape

    wx = nd.gaussian_filter(rs.normal(0.0, 1.0, (OH, OW)), 4.5)
    wy = nd.gaussian_filter(rs.normal(0.0, 1.0, (OH, OW)), 4.5)
    wx = wx / (np.std(wx) + 1e-9) * 6.5
    wy = wy / (np.std(wy) + 1e-9) * 6.5
    Xw = X + wx
    Yw = Y + wy

    w_arach_zone = np.clip(nd.gaussian_filter(is_arach.astype(float), sigma=9.0) * 2.4, 0.0, 1.0)

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
        env = (1.0 - G.sstep(r_max * 0.60, r_max * 1.15, r)) * np.clip(w_arach_zone + 0.35, 0.0, 1.0)
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
    canyon_ctrl = [
        (1262.0, 208.0, 1452.0,  5.5),  # Outlet of Eastern Highland Lake (+1,460 m)
        (1228.0, 242.0, 1310.0,  6.5),  # Upper basalt cataract throat
        (1184.0, 282.0, 1140.0,  8.0),  # Enters East Arachnoid ring-graben
        (1136.0, 314.0,  980.0,  6.0),  # Threads hard basalt ring-dike water gap
        (1088.0, 334.0,  870.0,  9.5),  # Northern Korona rim pass cauldron!
        (1046.0, 330.0,  780.0, 10.5),  # Heart of Main North-Korona Arachnoid cauldron
        (1008.0, 298.0,  690.0,  6.5),  # Cleaves NW radial dike gateway
        ( 972.0, 252.0,  590.0,  8.5),  # Lower Travertine Cataract Staircase
        ( 936.0, 202.0,  490.0,  9.0),  # Canyon mouth alluvial fan
        ( 902.0, 144.0,  380.0, 10.5),  # Confluence with sinuous main Ria River trunk!
    ]
    canyon_samples = _catmull_rom_2d(canyon_ctrl, n_per_seg=28)
    n_cs = len(canyon_samples)
    s_param = np.linspace(0.0, 1.0, n_cs)
    meander_envelope = np.sin(math.pi * s_param) ** 0.85
    meander_off = (11.5 * np.sin(s_param * 7.5 * math.pi + 0.4) + 5.5 * np.cos(s_param * 17.0 * math.pi - 0.8)) * meander_envelope
    tangents = np.gradient(canyon_samples[:, :2], axis=0)
    tnorm = np.hypot(tangents[:, 0], tangents[:, 1]) + 1e-9
    normals = np.stack([-tangents[:, 1] / tnorm, tangents[:, 0] / tnorm], axis=-1)
    canyon_samples[:, 0] += normals[:, 0] * meander_off
    canyon_samples[:, 1] += normals[:, 1] * meander_off
    canyon_samples[:, 3] *= (0.78 + 0.35 * np.sin(s_param * 13.0 * math.pi))

    d2_can = np.full((OH, OW), 1e12, dtype=float)
    el_can = np.zeros((OH, OW), dtype=float)
    hw_can = np.full((OH, OW), 8.0, dtype=float)

    y0_c, y1_c, x0_c, x1_c = 110, 425, 830, 1350
    sub_x = Xw[y0_c:y1_c, x0_c:x1_c]
    sub_y = Yw[y0_c:y1_c, x0_c:x1_c]
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
    w_canyon = 0.52 * w_can_outer + 0.48 * w_can_inner
    h_canyon_profile = el_can + 210.0 * (np.clip(d_norm_can, 0.0, 1.5) ** 1.65)

    canyon_river_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in canyon_samples[::3]]
    return w_arach_zone, arach_trough_tot, arach_rib_tot, w_canyon, h_canyon_profile, canyon_river_pts


def synthesize_nw_expansion(Eo_old, whas0_old, wlev0_old, ref_path):
    """Expand `(1393, 1549)` height/water grids to `(1723, 1821)` (`2 km/cell`) using continuous
    isohypse contour interpolation + light-blue river thalweg attraction."""
    rs = np.random.RandomState(500)
    Y, X = np.indices((NEW_OH, NEW_OW))
    px = X.astype(float)
    py = Y.astype(float)

    masks = classify_paint_reference(ref_path, whas0_old)
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

    # 1. Solve harmonic boundary extension from the old map's N and W edges (`[DY_F+14:, DX_F+14:]`)
    h_harm = _solve_harmonic_extension(Eo_old, is_new_area)

    # Multi-scale ridged & FBM noise fields (at `2 km/cell` resolution)
    rn_fine = T.ridged((NEW_OH, NEW_OW), 5001, scales=(2.5, 5.5, 12.0))
    rn_broad = T.ridged((NEW_OH, NEW_OW), 5002, scales=(6.0, 14.0, 28.0))
    fbm1 = nd.gaussian_filter(rs.normal(0.0, 1.0, (NEW_OH, NEW_OW)), 3.2)
    fbm1 = fbm1 / (np.std(fbm1) + 1e-9)
    fbm2 = nd.gaussian_filter(rs.normal(0.0, 1.0, (NEW_OH, NEW_OW)), 9.5)
    fbm2 = fbm2 / (np.std(fbm2) + 1e-9)

    # 2. Submarine Bathymetry (`is_sea`) & Explosive Seamount Caldera Swarm (`is_seamount`):
    is_sea = is_ocean & (is_new_area | ((px < 535.0) & (py < 595.0)))
    # Pad `is_sea` on the top and left with `mode='edge'` before `distance_transform_edt` so the outer map edges
    # (`X=0, Y=0`) are treated as open ocean rather than a false shoreline!
    d_in_sea = nd.distance_transform_edt(np.pad(is_sea, ((75, 0), (75, 0)), mode='edge'))[75:, 75:]
    d_in_land = nd.distance_transform_edt(~is_sea)

    in_arch_box = (px >= 0.0) & (px <= 565.0) & (py >= 0.0) & (py <= 665.0)
    h_shelf_sea = np.where(
        in_arch_box,
        -12.0 - 220.0 * G.sstep(0.0, 22.0, d_in_sea) + 28.0 * fbm1,
        -10.0 - 1380.0 * G.sstep(0.0, 65.0, d_in_sea) + 45.0 * fbm2,
    )

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
    # Every color band (`Tan`, `Mid-Green`, `Dark-Green`, `White`, `Grey`) is treated as a continuous
    # contour interval sloping smoothly down to the light-blue rivers (`is_river_paint`) and the sea (`0.0 m`)!
    h_land_syn = solve_contour_surface(
        tier_id, is_sea, is_river_paint, is_high_lake, is_ne_connector, is_sw_connector,
        h_harm, rn_broad, rn_fine, fbm1, fbm2
    )

    # 3A. The Great Double Delta (`px = 520..650, py = 92..228`):
    r_delta = np.hypot((px - 578.0) * 0.95, (py - 162.0) * 1.10)
    w_delta_zone = (1.0 - G.sstep(42.0, 74.0, r_delta)) * (~is_sea).astype(float)

    ang_d = np.arctan2(py - 164.0, 635.0 - px)
    branch_wave = np.abs(np.sin(6.5 * ang_d + 0.35 * fbm1)) * np.abs(np.cos(4.0 * ang_d - 0.25 * fbm1))
    is_braid_ch = (
        (is_delta_ch | ((r_delta < 52.0) & (px <= 632.0) & (branch_wave < 0.16)))
        & (px >= 518.0) & (px <= 642.0) & (py >= 94.0) & (py <= 226.0)
        & (tier_id <= 2)
    )
    d_from_braid = nd.distance_transform_edt(~is_braid_ch)
    h_delta_islands = np.where(
        is_braid_ch,
        -6.5 - 4.0 * G.sstep(0.0, 3.0, nd.distance_transform_edt(is_braid_ch)),
        2.2 + 9.5 * G.sstep(0.0, 5.5, d_from_braid) + 1.8 * fbm1,
    )
    h_land_syn = h_land_syn * (1.0 - w_delta_zone) + h_delta_islands * w_delta_zone

    # 3B. Eastern Highland Lake (`is_high_lake` around `[1295, 206]`, surface `+1,460.0 m` right on the Mid/Dark-Green contour!):
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

    # Smooth shoreline transition between `h_seamount_edifice` (sea) and `h_land_syn` (land)
    w_land_coast = G.sstep(-2.5, 3.5, d_in_land - d_in_sea)
    h_syn = np.where(
        is_seamount & (h_seamount_edifice > -35.0),
        h_seamount_edifice,
        h_seamount_edifice * (1.0 - w_land_coast) + h_land_syn * w_land_coast,
    )

    # 4. Carve the Sinuous Nile-Style Ria River Main Trunk & Northern Tributary:
    # Like the actual Nile (with its Nubian S-Bend and Great Qena Bend deflecting around basement uplifts,
    # plus sinuous alluvial floodplain meanders across its green valley ribbon), `ria_trunk_ctrl` traces
    # broad structural S-bends along the user's light-blue valley corridor, overlaid with multi-harmonic
    # alluvial meander loops!
    ria_trunk_ctrl = [
        (1312.0,  96.0, 1340.0, 11.0),  # Upper eastern light-blue headwater in Paint!
        (1258.0, 122.0, 1170.0, 12.0),  # Upper S-bend south of NE uplands
        (1196.0,  92.0,  980.0, 13.0),  # Bows north around eastern arachnoid foothills
        (1128.0, 136.0,  810.0, 14.5),  # Sweeps SSW into upper-middle valley bend
        (1056.0, 114.0,  660.0, 15.5),  # Curves WNW past northern terrace spur
        ( 984.0, 168.0,  510.0, 17.0),  # Great central Qena-style southward bend!
        ( 902.0, 144.0,  380.0, 18.5),  # Confluence with Arachnoid Canyon river (Web-Cleaver Gorge)!
        ( 824.0, 182.0,  265.0, 20.0),  # Broad lower-middle southward alluvial loop
        ( 748.0, 142.0,  155.0, 21.5),  # Arcs NNW toward North Ria Fork approach
        ( 676.0, 174.0,   68.0, 23.0),  # Confluence with North Ria Fork (`id: 9107`)!
        ( 615.0, 164.0,    6.0, 25.0),  # Apex of the Great Double Delta
        ( 565.0, 158.0,   -4.0, 28.0),  # Tidally scoured main delta estuary mouth
    ]
    ria_samples = _catmull_rom_2d(ria_trunk_ctrl, n_per_seg=22)
    n_ria = len(ria_samples)
    s_ria = np.linspace(0.0, 1.0, n_ria)
    # Multi-harmonic Nile floodplain meanders (attenuated near headwater, Web-Cleaver confluence at i~132,
    # North Fork confluence at i~198, and delta apex at s=1.0 so tributary junctions remain 100% exact!)
    pin_w = (
        np.sin(math.pi * s_ria) ** 0.8
        * (1.0 - 0.92 * np.exp(-((s_ria - (6.0 / 11.0)) / 0.045) ** 2))
        * (1.0 - 0.92 * np.exp(-((s_ria - (9.0 / 11.0)) / 0.045) ** 2))
        * (1.0 - G.sstep(0.86, 0.96, s_ria))
    )
    ria_meander_off = (
        11.5 * np.sin(s_ria * 11.0 * math.pi + 0.35)
        + 6.2 * np.sin(s_ria * 23.0 * math.pi - 0.80)
        + 3.1 * np.cos(s_ria * 39.0 * math.pi + 1.10)
    ) * pin_w
    t_ria = np.gradient(ria_samples[:, :2], axis=0)
    tn_ria = np.hypot(t_ria[:, 0], t_ria[:, 1]) + 1e-9
    nrm_ria = np.stack([-t_ria[:, 1] / tn_ria, t_ria[:, 0] / tn_ria], axis=-1)
    ria_samples[:, 0] += nrm_ria[:, 0] * ria_meander_off
    ria_samples[:, 1] += nrm_ria[:, 1] * ria_meander_off

    d2_ria = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    el_ria = np.zeros((NEW_OH, NEW_OW), dtype=float)
    hw_ria = np.full((NEW_OH, NEW_OW), 18.0, dtype=float)
    for sx, sy, sel, shw in ria_samples:
        d2 = (px[:320, 500:1420] - sx) ** 2 + (py[:320, 500:1420] - sy) ** 2
        better = d2 < d2_ria[:320, 500:1420]
        d2_ria[:320, 500:1420] = np.where(better, d2, d2_ria[:320, 500:1420])
        el_ria[:320, 500:1420] = np.where(better, sel, el_ria[:320, 500:1420])
        hw_ria[:320, 500:1420] = np.where(better, shw, hw_ria[:320, 500:1420])
    dist_ria = nd.gaussian_filter(np.sqrt(d2_ria), sigma=1.8)
    el_ria = nd.gaussian_filter(el_ria, sigma=2.5)
    d_norm_ria = dist_ria / np.maximum(hw_ria, 1.0)
    w_ria_val = (1.0 - G.sstep(0.20, 1.55, d_norm_ria)) * (1.0 - w_delta_zone)
    w_ria_floodplain = (1.0 - G.sstep(0.0, 0.95, d_norm_ria)) * (1.0 - w_delta_zone) * (~is_sea).astype(float)
    h_ria_thalweg = el_ria + 92.0 * (np.clip(d_norm_ria, 0.0, 1.6) ** 1.55)
    h_syn = h_syn * (1.0 - 0.76 * w_ria_val) + np.minimum(h_syn, h_ria_thalweg) * (0.76 * w_ria_val)

    # Northern Ria Tributary (drawn in light blue at `X = 670..878, Y = 75..174`, with Blue-Nile style meanders):
    ria_north_trib_ctrl = [
        (876.0, 112.0, 680.0,  9.0),
        (832.0, 128.0, 540.0, 10.0),
        (782.0,  82.0, 410.0, 10.5),
        (742.0, 114.0, 290.0, 11.0),
        (706.0,  98.0, 185.0, 12.0),
        (688.0, 142.0, 110.0, 13.0),
        (676.0, 174.0,  68.0, 14.0),  # Joins sinuous Ria River trunk!
    ]
    ntrib_samples = _catmull_rom_2d(ria_north_trib_ctrl, n_per_seg=18)
    s_nt = np.linspace(0.0, 1.0, len(ntrib_samples))
    nt_off = (5.5 * np.sin(s_nt * 7.0 * math.pi + 0.5) + 2.8 * np.cos(s_nt * 15.0 * math.pi - 0.4)) * np.sin(math.pi * s_nt)
    t_nt = np.gradient(ntrib_samples[:, :2], axis=0)
    tn_nt = np.hypot(t_nt[:, 0], t_nt[:, 1]) + 1e-9
    ntrib_samples[:, 0] += (-t_nt[:, 1] / tn_nt) * nt_off
    ntrib_samples[:, 1] += ( t_nt[:, 0] / tn_nt) * nt_off
    ntrib_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in ntrib_samples[::2]]

    # 5. Embed Old Map `[DY_F:, DX_F:]` with Organic Domain-Warped Boundary Blending:
    # Strip the 8-pixel top/left edge bevel of `Eo_old` along any land boundary so the old canvas frame never imprints a seam!
    Eo_clean_edge = Eo_old.copy()
    for r_i in range(8):
        Eo_clean_edge[r_i, :] = np.where(~whas0_old[r_i, :], Eo_old[8, :], Eo_old[r_i, :])
        Eo_clean_edge[:, r_i] = np.where(~whas0_old[:, r_i], Eo_old[:, 8], Eo_old[:, r_i])

    En_new = np.zeros((NEW_OH, NEW_OW), dtype=float)
    whas_new = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    wlev_new = np.full((NEW_OH, NEW_OW), np.nan, dtype=float)

    En_new[DY_F:, DX_F:] = Eo_clean_edge
    whas_new[DY_F:, DX_F:] = whas0_old
    wlev_new[DY_F:, DX_F:] = wlev0_old

    d_into_new = nd.distance_transform_edt(is_new_area)
    d_into_old = nd.distance_transform_edt(~is_new_area)
    sd_new = (d_into_new - d_into_old) + 14.0 * fbm2 + 7.0 * fbm1
    old_lake_guard = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    old_lake_guard[DY_F:, DX_F:] = whas0_old & ~((px[DY_F:, DX_F:] < 535.0) & (py[DY_F:, DX_F:] < 595.0))
    old_lake_guard = nd.binary_dilation(old_lake_guard, iterations=8)

    w_new_blend = np.where(old_lake_guard, G.sstep(0.0, 18.0, d_into_new), G.sstep(-22.0, 26.0, sd_new))
    # Unify NW ocean floor bathymetry across X=272, Y=330 so the sea never casts an L-shaped hillshade step!
    w_nw_sea_floor = G.sstep(0.0, 12.0, d_in_sea) * (1.0 - G.sstep(475.0, 535.0, px)) * (1.0 - G.sstep(525.0, 595.0, py))
    w_new_blend = np.maximum(w_new_blend, w_nw_sea_floor)
    En_new = En_new * (1.0 - w_new_blend) + h_syn * w_new_blend

    # 6A. Sculpt the Trans-Boundary NE Outland Pass (`is_ne_connector`, `X = 1350..1575, Y = 240..475`):
    # Smoothly grade the user-painted Dark-Green (`1,480..3,150 m`) and White (`3,150..5,450 m`) contours
    # across `Y = 330` into northern Outland with zero discrete-point ribbing!
    ne_pass_ctrl = [
        (1355.0, 242.0, 1880.0, 22.0),
        (1388.0, 275.0, 2480.0, 20.0),
        (1418.0, 305.0, 3120.0, 19.0),  # White contour saddle pass (+3,120 m)
        (1452.0, 342.0, 2580.0, 22.0),  # Enters trans-boundary Dark-Green valley contour
        (1482.0, 382.0, 2320.0, 24.0),
        (1508.0, 422.0, 2180.0, 24.0),
        (1536.0, 462.0, 2080.0, 26.0),  # Merges smoothly into northern Outland
    ]
    ne_pass_samples = _catmull_rom_2d(ne_pass_ctrl, n_per_seg=32)
    s_ne = np.linspace(0.0, 1.0, len(ne_pass_samples))
    ne_pass_samples[:, 0] += 8.0 * np.sin(s_ne * 3.0 * math.pi) * np.sin(s_ne * math.pi)

    d_in_ne_conn = nd.distance_transform_edt(is_ne_connector)
    d_out_ne_conn = nd.distance_transform_edt(~is_ne_connector)

    d2_ne = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    el_ne = np.zeros((NEW_OH, NEW_OW), dtype=float)
    hw_ne = np.full((NEW_OH, NEW_OW), 22.0, dtype=float)
    for sx, sy, sel, shw in ne_pass_samples:
        d2 = (px[210:500, 1320:1610] - sx) ** 2 + (py[210:500, 1320:1610] - sy) ** 2
        better = d2 < d2_ne[210:500, 1320:1610]
        d2_ne[210:500, 1320:1610] = np.where(better, d2, d2_ne[210:500, 1320:1610])
        el_ne[210:500, 1320:1610] = np.where(better, sel, el_ne[210:500, 1320:1610])
        hw_ne[210:500, 1320:1610] = np.where(better, shw, hw_ne[210:500, 1320:1610])
    # Gaussian-smooth `dist_ne` and `el_ne` so there are ZERO perpendicular ribs along the pass walls!
    dist_ne = nd.gaussian_filter(np.sqrt(d2_ne), sigma=4.0)
    el_ne = nd.gaussian_filter(el_ne, sigma=5.0)
    d_norm_ne = dist_ne / np.maximum(hw_ne, 1.0)

    h_ne_valley = el_ne + 1350.0 * (G.sstep(0.0, 1.85, d_norm_ne) ** 1.35) + 85.0 * (rn_broad - 0.35) + 45.0 * fbm1
    h_ne_cont = 0.55 * h_ne_valley + 0.45 * h_land_syn
    w_ne_connector = np.where(
        is_ne_connector,
        0.72 + 0.28 * G.sstep(0.0, 14.0, d_in_ne_conn),
        0.72 * (1.0 - G.sstep(0.0, 22.0, d_out_ne_conn)),
    )
    w_ne_connector = np.maximum(w_ne_connector, 1.0 - G.sstep(0.65, 1.75, d_norm_ne))
    w_ne_connector = nd.gaussian_filter(w_ne_connector, sigma=3.0)
    En_new = En_new * (1.0 - w_ne_connector) + h_ne_cont * w_ne_connector

    # 6B. Sculpt the Trans-Boundary SW Crook–Rift Connector (`is_sw_connector`, `X = 15..375, Y = 1080..1475`):
    # Smoothly grade the user-painted Dark-Green and White contours across `X = 272` (`Y = 1185..1258`)
    # to connect the southern Crook & Copper Glacier directly to the northwestern head of The Rift!
    sw_pass_ctrl = [
        ( 96.0, 1135.0, 2180.0, 22.0),
        (148.0, 1148.0, 2372.0, 18.0),
        (158.0, 1192.0, 2240.0, 20.0),  # Dark-Green contour pocket in Paint
        (210.0, 1208.0, 2820.0, 18.0),
        (264.0, 1216.0, 3260.0, 17.0),  # White contour pass crossing X = 272 (+3,260 m)
        (314.0, 1228.0, 2680.0, 18.0),
        (362.0, 1258.0, 1960.0, 22.0),  # Connects into NW tip of The Rift!
    ]
    sw_pass_samples = _catmull_rom_2d(sw_pass_ctrl, n_per_seg=32)
    s_sw = np.linspace(0.0, 1.0, len(sw_pass_samples))
    sw_pass_samples[:, 1] += 6.5 * np.sin(s_sw * 3.0 * math.pi) * np.sin(s_sw * math.pi)

    d2_sw = np.full((NEW_OH, NEW_OW), 1e12, dtype=float)
    el_sw = np.zeros((NEW_OH, NEW_OW), dtype=float)
    hw_sw = np.full((NEW_OH, NEW_OW), 19.0, dtype=float)
    for sx, sy, sel, shw in sw_pass_samples:
        d2 = (px[1060:1490, 0:410] - sx) ** 2 + (py[1060:1490, 0:410] - sy) ** 2
        better = d2 < d2_sw[1060:1490, 0:410]
        d2_sw[1060:1490, 0:410] = np.where(better, d2, d2_sw[1060:1490, 0:410])
        el_sw[1060:1490, 0:410] = np.where(better, sel, el_sw[1060:1490, 0:410])
        hw_sw[1060:1490, 0:410] = np.where(better, shw, hw_sw[1060:1490, 0:410])
    dist_sw = nd.gaussian_filter(np.sqrt(d2_sw), sigma=4.0)
    el_sw = nd.gaussian_filter(el_sw, sigma=5.0)
    d_norm_sw = dist_sw / np.maximum(hw_sw, 1.0)

    h_sw_pass_prof = el_sw + 1320.0 * (G.sstep(0.0, 1.85, d_norm_sw) ** 1.35) + 85.0 * (rn_broad - 0.35) + 45.0 * fbm1
    w_sw_pass_trough = nd.gaussian_filter(1.0 - G.sstep(0.0, 1.75, d_norm_sw), sigma=3.0)
    h_sw_target = h_land_syn * (1.0 - w_sw_pass_trough) + np.minimum(h_land_syn, h_sw_pass_prof) * w_sw_pass_trough
    h_sw_target = h_sw_target * (1.0 - w_cop_pocket) + h_cop_bed * w_cop_pocket

    # Apply across the trans-boundary bridge `X >= 235, Y = 1165..1285` as well as the new SW area using smooth `w_new_blend`!
    w_sw_bridge = nd.gaussian_filter((1.0 - G.sstep(0.75, 1.85, d_norm_sw)) * G.sstep(210.0, 262.0, px), sigma=3.0)
    w_sw_apply = np.maximum(w_sw_bridge, w_new_blend * G.sstep(1040.0, 1090.0, py))
    En_new = En_new * (1.0 - w_sw_apply) + h_sw_target * w_sw_apply

    # Ensure the SW exterior corner south of the Crook-Rift pass (`X < 305, Y >= 1295` outside `is_sw_connector`)
    # smoothly extrapolates `h_harm` (the adjacent white snow rim and rust-red high outer rim from `X = 285..340`) westward!
    w_sw_ext = G.sstep(1285.0, 1355.0, py) * w_new_blend * (1.0 - w_sw_bridge) * (~is_sw_connector).astype(float)
    h_sw_ext_rim = h_harm + 420.0 * (rn_broad - 0.36) + 180.0 * fbm2
    En_new = En_new * (1.0 - w_sw_ext) + h_sw_ext_rim * w_sw_ext

    # 6C. Apply the Trans-Boundary Arachnoid Network & Northern Korona Scenic Canyon (*The Web-Cleaver Gorge*):
    (w_arach_zone, arach_trough_w, arach_rib_h,
     w_canyon, h_canyon_prof, canyon_river_pts) = build_arachnoid_and_canyon_field(px, py, is_arach, rs)

    w_arach_env = (
        G.sstep(835.0, 875.0, px) * (1.0 - G.sstep(1315.0, 1355.0, px))
        * G.sstep(170.0, 205.0, py) * (1.0 - G.sstep(715.0, 755.0, py))
        * (~is_high_lake).astype(float)
    )
    # In the North-Korona Arachnoid Breach (`X = 910..1295, Y = 255..395`), let the old 6,000+ m wall
    # slope continuously down into the Ria Valley contour surface (`h_land_syn`) where the arachnoid network
    # crosses `Y = 330`!
    w_n_korona_breach = (
        G.sstep(905.0, 955.0, px) * (1.0 - G.sstep(1245.0, 1295.0, px))
        * G.sstep(245.0, 285.0, py) * (1.0 - G.sstep(365.0, 415.0, py))
        * np.clip(w_arach_zone * 1.35, 0.0, 1.0)
    )
    h_breach_slope = h_land_syn * 0.75 + (1650.0 + 550.0 * rn_broad) * 0.25
    En_new = En_new * (1.0 - w_n_korona_breach) + np.minimum(En_new, h_breach_slope) * w_n_korona_breach

    # Add basaltic dike ribs and carve concentric/radial arachnoid fracture troughs (450–760 m deep)
    En_new = En_new + (arach_rib_h * (1.0 - arach_trough_w) - 580.0 * arach_trough_w) * w_arach_env * np.clip(w_arach_zone + 0.25, 0.0, 1.0)
    # Carve The Web-Cleaver Gorge connecting the Eastern Highland Lake through N. Korona to the Ria River!
    En_new = En_new * (1.0 - w_canyon) + np.minimum(En_new, h_canyon_prof) * w_canyon

    # 7. Apply Fluvial & Glacial Stream-Power Weathering (`T.weather`) across the new mountains, scarps,
    # and trans-boundary connectors so every mountain range and pass has natural dendritic valleys!
    weather_mask_new = (
        (is_new_area | (w_ne_connector > 0.25) | (w_sw_bridge > 0.25) | (w_n_korona_breach > 0.15))
        & ~is_sea & ~is_high_lake & ~is_braid_ch & ~is_copper_tarn & ~old_lake_guard
        & (En_new >= 180.0)
    )
    En_new = T.weather(En_new, weather_mask_new)

    # 8. Set Water Masks (`whas_new`, `wlev_new`) in the Expanded Territory:
    sea_and_delta_water = (is_new_area & ((is_sea & (En_new < -0.5)) | is_braid_ch)) | (is_sea & (px < 535.0) & (py < 595.0))
    whas_new[sea_and_delta_water] = True
    wlev_new[sea_and_delta_water] = 0.0
    En_new = np.where(sea_and_delta_water, np.minimum(En_new, -2.5), En_new)

    dry_new_land = is_new_area & ~sea_and_delta_water & ~is_high_lake & ~is_copper_tarn
    En_new = np.where(dry_new_land, np.maximum(En_new, 1.5), En_new)

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
    is_sw_outer = ((is_ltgrey & (px < 285.0) & (py >= 1020.0)) | ((px < 295.0) & (py >= 1330.0))) & ~is_sw_connector
    w_sw_outer = np.clip(nd.gaussian_filter(is_sw_outer.astype(float), sigma=8.0), 0.0, 1.0)
    w_massif = np.clip(nd.gaussian_filter(is_dkgrey.astype(float), sigma=8.0), 0.0, 1.0)
    w_crook_corridor = (
        G.sstep(25.0, 55.0, px) * (1.0 - G.sstep(185.0, 245.0, px))
        * G.sstep(620.0, 690.0, py) * (1.0 - G.sstep(1250.0, 1340.0, py))
        * (~is_sea).astype(float)
    )

    # 9. Build Sinuous Nile-Style River Courses & New Biome Polygons for the Expanded Canvas:
    ria_main_pts = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in ria_samples[::2]]
    crook_riv_ctrl = [
        (148.0, 1136.0, 0.0, 1.0),
        (132.0, 1082.0, 0.0, 1.0),
        (108.0, 1026.0, 0.0, 1.0),
        (124.0,  968.0, 0.0, 1.0),
        ( 96.0,  912.0, 0.0, 1.0),
        (114.0,  854.0, 0.0, 1.0),
        ( 92.0,  796.0, 0.0, 1.0),
        (112.0,  742.0, 0.0, 1.0),
        (106.0,  695.0, 0.0, 1.0),
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
            'name': 'North Ria Distributary (Double Delta)',
            'tier': 'main',
            'len_km': 235.0,
            'q_mouth': 1950.0,
            'q_m3s': [1950.0] * 9,
            'px': [[615.0, 164.0], [602.0, 150.0], [590.0, 134.0], [576.0, 128.0], [562.0, 116.0], [548.0, 118.0], [536.0, 108.0], [528.0, 105.0], [522.0, 104.0]],
            'to': {'kind': 'sea', 'at_px': [522.0, 104.0]},
        },
        {
            'id': 9104,
            'name': 'South Ria Distributary (Double Delta)',
            'tier': 'main',
            'len_km': 250.0,
            'q_mouth': 1850.0,
            'q_m3s': [1850.0] * 9,
            'px': [[615.0, 164.0], [600.0, 174.0], [586.0, 190.0], [572.0, 184.0], [558.0, 200.0], [544.0, 212.0], [532.0, 208.0], [525.0, 216.0], [520.0, 220.0]],
            'to': {'kind': 'sea', 'at_px': [520.0, 220.0]},
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
            'tier': 'trib',
            'len_km': 360.0,
            'q_mouth': 420.0,
            'q_m3s': [round(65.0 + 355.0 * (i / 8.0), 1) for i in range(9)],
            'px': [
                [1422.0, 312.0], [1442.0, 330.0], [1454.0, 354.0], [1474.0, 372.0],
                [1484.0, 396.0], [1506.0, 416.0], [1518.0, 438.0], [1530.0, 454.0], [1538.0, 466.0],
            ],
            'to': {'kind': 'basin', 'at_px': [1538.0, 466.0]},
        },
        {
            'id': 9107,
            'name': 'North Ria Fork',
            'tier': 'trib',
            'len_km': 560.0,
            'q_mouth': 780.0,
            'q_m3s': [round(95.0 + 685.0 * (i / max(1, len(ntrib_pts) - 1)), 1) for i in range(len(ntrib_pts))],
            'px': ntrib_pts,
            'to': {'kind': 'river', 'id': 9101, 'at_px': ntrib_pts[-1]},
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
                'The Great Double Delta of the Ria River: a massive twin-lobed marshy tide-and-wave delta (analogous '
                'to the Nile and Amazon deltas) at 0.0 m basin/sea level with dozens of flat-topped alluvial islands. '
                'Features a reduced oceanic biological invasion limited to colonial terrestrial sponges and giant '
                'calcified sea-pen fields (no seaweed-derived trees).'
            ),
            'points': [
                [515, 88], [642, 92], [648, 228], [516, 232], [498, 162],
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
                'The Arch: a partly drowned tectonic rift-and-hogback archipelago over the Steaming Sea (inspired by '
                'Capsica\'s Arch), linking the northern Ria coast to the Crook. Sheltered inner sounds contrast with '
                'tsunami-scoured outer basalt sea cliffs.'
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
                'The Crook: a deep tectonic trough squeezed between the western crater wall and the western upland '
                'cordillera. Opens at its northern neck into the Arch via a sea-level tidal fjord (0.0 m) and slopes '
                'continuously upward toward the south into a strongly alien fumarolic and malachite-stained montane ecosystem.'
            ),
            'points': [
                [42, 535], [195, 535], [185, 820], [175, 1085], [52, 1085], [38, 820],
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
                [235, 1265], [195, 1385], [48, 1385],
            ],
        },
        {
            'id': 'rmvtharnuplands',
            'name': 'tharn uplands',
            'color': '#b89f7d',
            'kind': 'biome',
            'notes': (
                'NE Tharn Uplands: a high, cold-dry windswept plateau (+4,600 to +6,300 m) inspired by Chris Wayan\'s '
                'Tharn, where high-elevation freeze-thaw aridity is partially mitigated by low-latitude equatorial '
                'insolation (~24–29°S), producing giant diurnal temperature swings and cushion-xenophyte steppes.'
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
                'Outland Gate (NE Trans-Boundary Pass): a dramatic highland valley and alpine saddle corridor (+2,150 '
                'to +3,220 m floor framed by +4,400..+5,650 m snow peaks) breaching the northeastern rim to connect '
                'the eastern Ria River Valley and Eastern Highland Lake directly into the northern basin of Outland.'
            ),
            'points': [
                [1355, 240], [1445, 245], [1555, 345], [1565, 468], [1475, 468], [1405, 365],
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
        in_arch_box=in_arch_box,
        sd_new=sd_new,
        old_lake_guard=old_lake_guard,
        new_rivers=new_expansion_rivers,
        new_regions=new_expansion_regions,
        new_vents=new_seamount_vents,
    )
