"""Tier-1 Biome Geomorphological Landform Upgrades on the unified 2 km/cell (`1393 x 1549`) height grid:
  1. `k-guilin` (`rmvp22q7x7bdp`) — The Hykkousoi Hinterlands:
     - Sculpts 6-14 km (`3-7 px`) *fengcong* conical karst cluster plinths (+220 to +420 m) & lone *fenglin*
       megatower bases across the limestone plain (-1,250 to -750 m), plus the western Shilin stone-forest bench
     - Carves flat-floored *polje* flood valleys and the incised Damao-Kultobe / Sivift-Bilak-Borun Gulusu wadi
       trunk channels while preserving the 3,641 km2 freshwater lake (-1,500 m) and Trigon (450, 410).
  2. `sw highlands` (`rmvkaigq68hv7`) — The South-Western Highlands:
     - Sculpts concentric Appalachian/Zagros `ringfold` ridges & valleys (lambda = 14-18 km, sharp chevron crests)
       parallel to the SW Inner Wall arc, breached by transverse water gaps along Kaskejt Rivr, Pan Riba, and the
       Ancient's Valley rivers, plus captured wind gaps
     - Sculpts Span's +2,650 m structural `pillar` sandstone tableland around (282, 680) with its dissected 280 m
       pillar-rim cliffs and Pan Riba's 480 m Kaieteur-style slot canyon & plunge amphitheatre
     - Sculpts the Sarez-style rock-avalanche landslide dam (+320 m hummocky blockage at (271, 629)), headwall
       detachment scar, and the impounded 28 km landslide lake (+2,878 m) at (278, 629)
     - Sculpts the 5 steep eastern 4 km-scarp fan deltas along the Vothic / Ring Sea coast ([376,650]..[450,836]).
  3. `w outer wall` (`rmvk92x5vcz46`) — The Western Outer Wall:
     - Sculpts 3 concentric Tycho/Copernicus-style listric back-tilted rotational slump benches across the
       3,800-5,600 m mid-wall zone, complete with uphill-facing antislope scarps and sag-pond trench lakes
     - Sculpts 5 long-runout sturzstrom megabreccia lobes (5,200-7,000 m upper wall running out 30-50 km across
       the bench) with longitudinal flow grooves, headwall scars, and lobe-dammed ponds
     - Sculpts the lower loess *yuan* tablelands, *liang* ridges, and 120-220 m amphitheatre-headed box canyons
       incised by the ~30 eastward wadis and streams along the eastern escarpment edge.
  4. `the cut` (`rmuqljqcvdimg`) — The Eigenweapon Bowl & Chord Slice:
     - Sculpts the true geometric spherical-cap / cylindrical-chord eigenweapon slice inside `the cut` (centre
       460, 302) and along the grazing orbital chord `(496, 108) -> (265, 290)`
     - Removes pre-cut noisy hills inside the bowl/slot to leave a clean concave sweep below razor-sharp
       1,500-3,500 m cut faces, grades the northern pass mouth (`(460, 262) -> (460, 225)`) to a flat +666 m sill,
       preserves the two endorheic salt lakes (-1,456 m and -1,608 m), and raises lateral/terminal mega-ejecta
       ramparts at the Catch entry (`(530, 104)`).
  5. `Korona / NE` (`rmuqm3urh0mo6`) — The Corona Tepui & Chasm Quilt:
     - Replaces the legacy generator's 3 concentric sinusoidal bull's-eye waves around (814, 189) / (838, 178)
       with flat-topped structural quartzite tepui plateaus (+900 to +2,200 m in the central rings, stepping up
       into The Tiers and the +3,400 to +4,800 m NE hoar tables) severed by anastomosing ring-fault and radial
       chasm troughs (-1,200 to -2,400 m)
     - Preserves all existing trench salt lakes, station sites, and smoothly feathers to 0.0 m for `py < 110` so
       the northern rim ties seamlessly into `nw_expansion.py`.
"""
import math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from . import geom as G


SEED_TIER1 = 20261101


def _norm_gauss(rs, shape, sigma):
    """Generate a zero-mean, unit-variance Gaussian random field with smoothing radius `sigma` cells."""
    f = nd.gaussian_filter(rs.normal(0.0, 1.0, shape), sigma=sigma)
    return f / (np.std(f) + 1e-9)


def _settlement_guard(px, py, settlements_list, extra_pts=(), r_inner_px=3.0, r_outer_px=7.5):
    """Return a multiplier in [0, 1] that is 0.0 within `r_inner_px` (6 km) of any settlement and smoothly rises
    to 1.0 at `r_outer_px` (15 km), preventing terrain edits from drowning or cliffing any settlement."""
    VH, VW = px.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    seed_mask = np.zeros((VH, VW), dtype=bool)
    pts = []
    for s in (settlements_list or ()):
        if isinstance(s, dict) and 'px' in s and 'py' in s:
            pts.append((float(s['px']), float(s['py'])))
    for pt in extra_pts:
        pts.append((float(pt[0]), float(pt[1])))
    for sx, sy in pts:
        ix = int(round(sx * su))
        iy = int(round(sy * sv))
        if 0 <= iy < VH and 0 <= ix < VW:
            seed_mask[iy, ix] = True
    if not seed_mask.any():
        return np.ones((VH, VW), dtype=float)
    dist_px = nd.distance_transform_edt(~seed_mask) / (0.5 * (su + sv))
    return G.sstep(r_inner_px, r_outer_px, dist_px)


def _polyline_dist_px(px, py, pts_list, bbox_pad=20.0):
    """Compute Euclidean distance (in map px) from `(px, py)` to the nearest vertex/segment of a list of polylines."""
    VH, VW = px.shape
    if not pts_list:
        return np.full((VH, VW), 1e6, dtype=float)
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    im = Image.new('L', (VW, VH), 0)
    drw = ImageDraw.Draw(im)
    for pts in pts_list:
        if len(pts) >= 2:
            drw.line([(float(p[0]) * su, float(p[1]) * sv) for p in pts], fill=1, width=1)
    line_mask = np.array(im, dtype=bool)
    if not line_mask.any():
        return np.full((VH, VW), 1e6, dtype=float)
    return nd.distance_transform_edt(~line_mask) / (0.5 * (su + sv))


# ==============================================================================
# 1. k-Guilin (`k-guilin`, `rmvp22q7x7bdp`)
# ==============================================================================
def _sculpt_k_guilin(Eo, whas, wlev, mask_kg, px, py, rivers_list, sett_guard, rs):
    """Sculpt `k-guilin` (px 415..518, py 378..443):
    - 6-14 km (`3-7 px`) *fengcong* conical karst cluster plinths (+220 to +420 m) on the limestone plain
    - Steep-sided *fenglin* tower-cluster ridges and western *Shilin* stone-forest upland bench (+140 to +240 m)
    - Flat-floored *polje* flood valleys (-85 to -135 m below mean plain) and incised wadi/river trunk channels
      (Damao-Kultobe / Sivift, Bilak, Filem, and Borun Gulusu courses), keeping all land above lake level (-1,492 m).
    """
    VH, VW = Eo.shape
    d_in = nd.distance_transform_edt(mask_kg)
    w_poly = G.sstep(0.0, 5.5, d_in) * mask_kg

    # Keep a buffer around the freshwater lake (wlev = -1,500 m) and Trigon shore
    d_water = nd.distance_transform_edt(~(whas & mask_kg))
    w_land = G.sstep(1.2, 3.8, d_water) * (~whas)

    # Multi-scale domain-warped cellular/ridged karst field at 6-14 km (`sigma = 1.3, 2.4, 4.2 px`)
    wx = 2.4 * _norm_gauss(rs, (VH, VW), 2.8) + 1.2 * _norm_gauss(rs, (VH, VW), 1.4)
    wy = 2.4 * _norm_gauss(rs, (VH, VW), 2.8) + 1.2 * _norm_gauss(rs, (VH, VW), 1.4)
    xw = px + wx
    yw = py + wy

    # Cellular cone-karst basis: sharp positive peaks (*fengcong* cones) separated by flat *polje* troughs
    c1 = np.sin(xw * 0.62 + yw * 0.48) * np.cos(xw * 0.44 - yw * 0.66)
    c2 = np.sin(xw * 0.95 - yw * 0.72 + 1.1) * np.cos(xw * 0.78 + yw * 0.88 - 0.7)
    c3 = 1.0 - np.abs(_norm_gauss(rs, (VH, VW), 1.35))
    karst_raw = 0.46 * np.abs(c1) + 0.34 * np.abs(c2) + 0.20 * np.clip(c3, 0.0, 1.0)

    # Steep-walled *fengcong* cluster plinths (+240..+420 m where karst_raw > 0.42)
    plinth_mask = G.sstep(0.35, 0.66, karst_raw)
    cone_peaks = (np.clip((karst_raw - 0.33) / 0.67, 0.0, 1.0) ** 1.32) * 425.0
    flat_top_trim = 45.0 * G.sstep(0.78, 0.96, karst_raw)
    h_fengcong = plinth_mask * (125.0 + cone_peaks - flat_top_trim)

    # Flat-floored *polje* dissolution valleys between the *fengcong* clusters
    polje_mask = (1.0 - G.sstep(0.22, 0.44, karst_raw))
    Eo_smooth = nd.gaussian_filter(Eo, sigma=4.5)
    polje_floor = np.maximum(Eo_smooth - 115.0, -1465.0)
    dh_polje = polje_mask * (polje_floor - Eo)

    # Incised Damao-Kultobe / Scyvoi wadi courses (Sivift, Bilak, Filem, Borun Gulusu + SE axial trunk)
    kg_rivers = []
    for rv in (rivers_list or ()):
        rpts = rv.get('px', [])
        if any(400 <= p[0] <= 525 and 370 <= p[1] <= 448 for p in rpts):
            kg_rivers.append(rpts)
    # Add the southern & eastern karst trunk troughs feeding the Trigon lake
    kg_rivers.append([(418.0, 434.0), (432.0, 424.0), (442.0, 415.0), (446.0, 409.0)])
    kg_rivers.append([(508.0, 426.0), (492.0, 416.0), (478.0, 406.0), (468.0, 398.0)])
    kg_rivers.append([(488.0, 436.0), (474.0, 424.0), (462.0, 412.0), (456.0, 405.0)])

    d_riv = _polyline_dist_px(px, py, kg_rivers, bbox_pad=16.0)
    w_riv_trough = 1.0 - G.sstep(1.2, 4.2, d_riv)
    riv_target = np.maximum(Eo_smooth - 135.0, -1482.0)
    dh_riv = w_riv_trough * (riv_target - Eo)

    # Western / NW Shilin Stone-Forest structural bench (`px < 438`) stepping up toward Crater Drylands
    w_shilin = (1.0 - G.sstep(422.0, 442.0, px)) * G.sstep(382.0, 438.0, py)
    shilin_steps = (
        95.0 * G.sstep(0.25, 0.55, np.sin((px - 415.0) * 0.35 + (py - 390.0) * 0.22))
        + 110.0 * np.abs(np.sin(xw * 1.15 - yw * 0.95))
    )
    dh_shilin = w_shilin * shilin_steps

    # Combine: suppress fengcong cones inside river troughs and poljes, protect Trigon (450, 410) & station (444.5, 414.5)
    station_guard = G.sstep(2.0, 5.5, np.hypot(px - 444.5, py - 414.5))
    w_eff = w_poly * w_land * sett_guard * (0.35 + 0.65 * station_guard)

    dh_raw = (
        h_fengcong * (1.0 - 0.85 * w_riv_trough) * (1.0 - 0.70 * polje_mask)
        + dh_polje * (1.0 - 0.50 * w_riv_trough)
        + dh_riv
        + dh_shilin * (1.0 - w_riv_trough)
    )
    En = Eo + w_eff * dh_raw
    # Never push dry land below -1,490 m (10 m above the -1,500 m freshwater lake)
    En = np.where((w_eff > 0.01) & (~whas), np.maximum(En, -1490.0), En)
    return En


# ==============================================================================
# 2. SW Highlands (`sw highlands`, `rmvkaigq68hv7`)
# ==============================================================================
def _sculpt_sw_highlands(Eo, whas, wlev, mask_sw, px, py, rivers_list, sett_guard, rs):
    """Sculpt `sw highlands` (px 236..414, py 528..756):
    - Concentric Appalachian/Zagros `ringfold` ridges & valleys (lambda = 14-18 km, sharp chevron crests)
      parallel to the SW Inner Wall crest arc, cut by transverse water gaps and wind gaps
    - Span's +2,650 m structural `pillar` sandstone tableland around (282, 680), its dissected 280 m pillar rim,
      and Pan Riba's 480 m Kaieteur-style slot gorge & plunge amphitheatre
    - Sarez-style rock-avalanche landslide dam (+320 m at (271, 629)), mountain detachment scar, and the
      impounded 28 km landslide lake (+2,878 m) at (278, 629)
    - 5 steep eastern 4 km-scarp fan deltas ([376,650]..[450,836]) along the Vothic / Ring Sea coast.
    """
    VH, VW = Eo.shape
    d_in = nd.distance_transform_edt(mask_sw)
    w_poly = G.sstep(0.0, 6.5, d_in) * mask_sw

    # 1. Curving structural strike coordinate `u_crest` perpendicular to the SW Inner Wall crest arc
    # The crest runs NNW-SSE from ~(325, 535) through ~(355, 635) to ~(382, 745)
    x_crest_arc = (
        324.0
        + 0.275 * (py - 530.0)
        + 8.5 * np.sin((py - 530.0) * 0.028 + 0.4)
        + 3.5 * _norm_gauss(rs, (VH, VW), 4.0)
    )
    # Distance west of the crest in km (`d_west_km > 0` on the wet western ramp, `< 0` on the eastern scarp)
    d_west_km = (x_crest_arc - px) * 2.0
    s_along_km = (py - 530.0) * 2.0 + 4.5 * _norm_gauss(rs, (VH, VW), 3.2)

    # Envelope for the folded western ramp (12 km to 155 km west of the crest, elev 1,300 to 5,600 m)
    w_ramp = (
        G.sstep(8.0, 24.0, d_west_km)
        * (1.0 - G.sstep(135.0, 175.0, d_west_km))
        * G.sstep(1250.0, 1750.0, Eo)
        * (1.0 - G.sstep(5400.0, 6100.0, Eo))
    )

    # Concentric `ringfold` chevron wave (`lambda = 15.5 km`, `sharp = 0.85` per `biomes/swhighlands/PLAN.md` §0)
    fold_phase = (
        2.0 * math.pi * d_west_km / 15.5
        + 0.35 * np.sin(s_along_km * 0.055)
        + 0.22 * _norm_gauss(rs, (VH, VW), 2.2)
    )
    raw_cos = np.cos(fold_phase)
    # Sharp chevron anticline crests (+1) alternating with broader synclinal coves (-1)
    chevron_wave = (1.0 - 0.85) * raw_cos + 0.85 * (1.0 - 2.0 * np.abs(np.sin(0.5 * fold_phase)))
    # Modulate amplitude (+480 m on ridges, -340 m in synclinal coves)
    dh_folds = np.where(chevron_wave >= 0.0, 490.0 * chevron_wave, 350.0 * chevron_wave)

    # 2. Transverse Water Gaps along all major rivers in `sw highlands` + Wind Gaps along ridge crests
    sw_rivers = []
    pan_riba_pts = []
    for rv in (rivers_list or ()):
        rpts = rv.get('px', [])
        if any(230 <= p[0] <= 415 and 520 <= p[1] <= 760 for p in rpts):
            sw_rivers.append(rpts)
            if rv.get('name') == 'Pan Riba':
                pan_riba_pts = rpts
    if not pan_riba_pts:
        pan_riba_pts = [(306.4, 667.0), (292.0, 675.0), (282.0, 680.0), (270.3, 689.0), (255.0, 704.0), (240.3, 719.0)]

    d_riv_px = _polyline_dist_px(px, py, sw_rivers, bbox_pad=18.0)
    w_water_gap = 1.0 - G.sstep(1.1, 3.8, d_riv_px)
    Eo_riv_base = nd.minimum_filter(nd.gaussian_filter(Eo, sigma=2.5), size=5)
    dh_water_gap = w_water_gap * (Eo_riv_base - 140.0 - Eo)

    # Wind gaps (captured dry notches across the anticline crests every ~28 km along strike)
    wind_notch = np.exp(-((np.sin(s_along_km * math.pi / 28.0 + 0.7)) / 0.16) ** 2) * np.clip(chevron_wave, 0.0, 1.0)
    dh_folds = dh_folds * (1.0 - 0.88 * w_water_gap) * (1.0 - 0.65 * wind_notch)

    # Rain-wall debris-flow chutes & fluted karst relief in the hyper-wet zone (`px 250..285, py 595..675`)
    w_rainwall = (
        G.sstep(245.0, 256.0, px) * (1.0 - G.sstep(282.0, 296.0, px))
        * G.sstep(590.0, 605.0, py) * (1.0 - G.sstep(668.0, 682.0, py))
    )
    chute_tex = 135.0 * np.sin(d_west_km * 0.45 + s_along_km * 0.85) * _norm_gauss(rs, (VH, VW), 1.1)

    # 3. Span's +2,650 m Sandstone Tableland (`(282, 680)`), Pillar Rim, & Pan Riba's 480 m Kaieteur Gorge
    dx_span_km = (px - 284.0) * 2.0
    dy_span_km = (py - 682.0) * 2.0
    r_span_km = np.hypot(dx_span_km * 0.92, dy_span_km * 1.08) + 2.6 * np.sin(np.arctan2(dy_span_km, dx_span_km) * 3.0)
    w_table = 1.0 - G.sstep(18.0, 31.0, r_span_km)

    # Flat-bedded quartz sandstone tableland at ~+2,650 m stepped with pagoda domes (+90 m) and joint slots (-160 m)
    joint_u = np.sin((px - 282.0) * 0.88 + (py - 680.0) * 0.24)
    joint_v = np.cos((px - 282.0) * 0.24 - (py - 680.0) * 0.88)
    slot_grid = np.exp(-((joint_u / 0.18) ** 2)) + np.exp(-((joint_v / 0.18) ** 2))
    pagoda_domes = 95.0 * np.clip(joint_u * joint_v, 0.0, 1.0)
    h_span_table = 2650.0 + 0.18 * (Eo - 2550.0) + pagoda_domes - 165.0 * np.clip(slot_grid, 0.0, 1.0)

    # Dissected Pillar Rim (`r_span_km` 16..28 km on the west & south sides: 250-300 m free-standing sandstone towers)
    w_pillar_rim = (
        G.sstep(14.0, 19.0, r_span_km) * (1.0 - G.sstep(25.0, 31.0, r_span_km))
        * G.sstep(-12.0, 6.0, -dx_span_km + 0.6 * dy_span_km)
    )
    pillar_spires = 275.0 * (np.abs(joint_u * joint_v) ** 0.65) - 140.0 * (1.0 - np.abs(joint_u * joint_v))
    h_span_table = h_span_table + w_pillar_rim * pillar_spires

    # Pan Riba's 480 m deep Kaieteur-style slot canyon & plunge amphitheatre cutting across Span's tableland
    d_pan_px = _polyline_dist_px(px, py, [pan_riba_pts], bbox_pad=14.0)
    w_pan_gorge = (1.0 - G.sstep(0.9, 3.2, d_pan_px)) * (1.0 - G.sstep(34.0, 44.0, r_span_km))
    # Kaieteur plunge step just upstream of Span (`px ~ 289, py ~ 676`)
    u_pan_along = (px - 282.0) * 0.78 - (py - 680.0) * 0.62
    plunge_drop = 220.0 * (1.0 - G.sstep(-3.0, 4.0, u_pan_along))
    h_pan_floor = np.minimum(Eo, h_span_table) - 260.0 - plunge_drop

    # Protect Span's ruined arcology pad at (282, 680) on a dramatic canyon bench (+2,546 m)
    w_span_pad = 1.0 - G.sstep(1.2, 3.2, np.hypot(px - 282.0, py - 680.0))
    h_span_combined = h_span_table * (1.0 - w_pan_gorge) + h_pan_floor * w_pan_gorge
    h_span_combined = h_span_combined * (1.0 - w_span_pad) + Eo * w_span_pad

    # 4. Sarez-Style Landslide Dam (`(271, 629)`), Mountain Detachment Scar (`(276, 621)`), & Hanging Lake (`(278, 629)`)
    LAKE_SAREZ_LEV = 2878.0
    # Elongated drowned river valley extending ~26 km E-W (`px 273..287, py 626..632`)
    dx_lk_km = (px - 280.0) * 2.0
    dy_lk_km = (py - 629.0) * 2.0 + 1.2 * np.sin((px - 278.0) * 0.35)
    r_lk_ell = np.hypot(dx_lk_km / 13.0, dy_lk_km / 3.4)
    w_sarez_lake = 1.0 - G.sstep(0.68, 1.15, r_lk_ell)
    sarez_water_mask = (r_lk_ell <= 0.85) & mask_sw
    h_sarez_bed = (LAKE_SAREZ_LEV - 185.0) + 170.0 * np.clip(r_lk_ell / 0.88, 0.0, 1.0) ** 1.6

    # Hummocky rock-avalanche dam blocking the valley west of the lake at `(271.5, 629)`
    r_dam_km = np.hypot((px - 271.5) * 2.0, (py - 629.0) * 2.0)
    w_sarez_dam = (1.0 - G.sstep(3.0, 6.8, r_dam_km)) * (1.0 - w_sarez_lake)
    h_sarez_dam = np.maximum(Eo, LAKE_SAREZ_LEV + 165.0) + 95.0 * np.abs(_norm_gauss(rs, (VH, VW), 1.0))

    # Amphitheatre landslide detachment scar on the northern valley wall at `(277, 622)`
    r_scar_km = np.hypot((px - 277.0) * 2.0, (py - 622.5) * 2.0)
    w_sarez_scar = (1.0 - G.sstep(2.5, 5.8, r_scar_km)) * (1.0 - w_sarez_lake)
    dh_sarez_scar = -290.0 * w_sarez_scar

    # Combine SW Highlands interior
    dh_interior = (
        w_ramp * (dh_folds + dh_water_gap + w_rainwall * chute_tex) * (1.0 - 0.75 * w_table)
        + w_table * (h_span_combined - Eo)
        + dh_sarez_scar
    )
    En = Eo + w_poly * sett_guard * dh_interior
    En = np.where(w_sarez_dam > 0.01, En * (1.0 - w_sarez_dam) + h_sarez_dam * w_sarez_dam, En)
    En = np.where(w_sarez_lake > 0.01, En * (1.0 - w_sarez_lake) + h_sarez_bed * w_sarez_lake, En)

    whas_out = whas | sarez_water_mask
    wlev_out = np.where(sarez_water_mask, LAKE_SAREZ_LEV, wlev)

    # 5. 5 Eastern 4 km-Scarp Alluvial Fan Deltas (`[376,650]..[450,836]` along the Vothic / Ring Sea scarp foot)
    # Each fan apex sits at a wadi mouth emerging from the eastern scarp and builds a conical braided fan apron
    fan_deltas = [
        (376.0, 650.0, 18.0, 28.0, 320.0),
        (388.0, 676.0, 20.0, 24.0, 360.0),
        (398.0, 704.0, 22.0, 20.0, 380.0),
        (402.0, 736.0, 20.0, 25.0, 340.0),
        (396.0, 766.0, 18.0, 30.0, 290.0),
    ]
    dh_fans = np.zeros((VH, VW), dtype=float)
    for fx, fy, r_fan_km, az_deg, h_apex in fan_deltas:
        ang_f = math.radians(az_deg)
        dx_f = (px - fx) * 2.0
        dy_f = (py - fy) * 2.0
        u_f = dx_f * math.cos(ang_f) + dy_f * math.sin(ang_f)
        v_f = -dx_f * math.sin(ang_f) + dy_f * math.cos(ang_f)
        r_f = np.hypot(np.maximum(0.0, u_f), v_f * 1.25)
        th_f = np.arctan2(v_f, np.maximum(0.5, u_f))
        w_fan = (
            G.sstep(-2.0, 3.0, u_f)
            * (1.0 - G.sstep(r_fan_km * 0.55, r_fan_km, r_f))
            * (1.0 - G.sstep(0.55, 1.05, np.abs(th_f)))
            * (~whas_out)
        )
        braid_ribs = 38.0 * np.cos(th_f * 14.0) * (1.0 - r_f / (r_fan_km + 1e-6))
        fan_cone = h_apex * ((1.0 - np.clip(r_f / r_fan_km, 0.0, 1.0)) ** 1.45) + braid_ribs
        # Incised feeder wadi gorge West of the fan apex (`u_f in [-16, 2] km`)
        w_feeder = (
            G.sstep(-16.0, -10.0, u_f) * (1.0 - G.sstep(-1.0, 3.0, u_f))
            * (1.0 - G.sstep(1.5, 4.5, np.abs(v_f)))
        )
        dh_fans += w_fan * fan_cone - w_feeder * 260.0

    En = En + sett_guard * dh_fans
    return En, whas_out, wlev_out


# ==============================================================================
# 3. W Outer Wall (`w outer wall`, `rmvk92x5vcz46`)
# ==============================================================================
def _sculpt_w_outer_wall(Eo, whas, wlev, mask_wow, px, py, rivers_list, sett_guard, rs):
    """Sculpt `w outer wall` (px 8..308, py 278..880):
    - 3 concentric Tycho/Copernicus-style listric back-tilted rotational slump benches across the 3,800-5,600 m
      mid-wall zone, with uphill-facing antislope scarps and sag-pond trench lakes
    - 5 long-runout sturzstrom megabreccia lobes (5,200-7,000 m upper wall running out 30-50 km down the bench)
      with hummocky grooved lobes, headwall detachment scars, and small dammed lakes
    - Lower loess *yuan* tablelands, *liang* ridges, and 120-220 m amphitheatre-headed box canyons along the
      3,000-4,200 m lower bench.
    """
    VH, VW = Eo.shape
    d_in = nd.distance_transform_edt(mask_wow)
    w_poly = G.sstep(0.0, 6.0, d_in) * mask_wow

    # Smooth baseline elevation to define the transverse wall coordinate `u_wall` (0 at lowland edge ~3,200 m,
    # 1 at upper wall crest ~6,400 m) and arc-parallel strike coordinate `s_arc`
    Eo_low = nd.gaussian_filter(Eo, sigma=6.0)
    warp_u = 0.035 * _norm_gauss(rs, (VH, VW), 3.5)
    u_wall = np.clip((Eo_low - 3200.0) / 3200.0 + warp_u, 0.0, 1.0)
    s_arc_km = (py - 280.0) * 2.0 + 6.0 * _norm_gauss(rs, (VH, VW), 4.0)

    # 1. Three Concentric Listric Back-Tilted Rotational Slump Benches (`u_wall in [0.18, 0.74]`)
    # Each rotational slump block has:
    #   - A steepeastward front scarp (the toe of the block, +260..+380 m above the lower block)
    #   - A back-tilted block top that slopes westward (downhill toward the crater wall!) into a sag trough
    #   - An uphill-facing antislope scarp & trench along the head scarp (`u_b in [0.72, 0.96]`)
    slump_bands = [
        (0.20, 0.36, 260.0, 175.0),  # Outer Slump Bench (~3,850 - 4,350 m)
        (0.38, 0.54, 310.0, 210.0),  # Middle Slump Bench (~4,400 - 4,950 m)
        (0.56, 0.72, 340.0, 230.0),  # Upper Slump Bench (~5,000 - 5,550 m)
    ]
    dh_slumps = np.zeros((VH, VW), dtype=float)
    trench_trough_mask = np.zeros((VH, VW), dtype=float)

    # Modulate slump blocks into county-sized 50-90 km arc segments (`biomes/wouterwall/PLAN.md` §4)
    seg_mod = 0.75 + 0.25 * np.sin(s_arc_km * math.pi / 65.0 + 0.5)

    for idx_b, (u0, u1, h_riser, h_trough) in enumerate(slump_bands):
        du = u1 - u0
        u_loc = (u_wall - u0) / du
        in_band = G.sstep(-0.08, 0.06, u_loc) * (1.0 - G.sstep(0.94, 1.08, u_loc))
        # Steep front riser at u_loc in [0.0, 0.22], back-tilted ramp in [0.22, 0.78], sag trench at [0.78, 0.96]
        front_riser = h_riser * G.sstep(0.0, 0.20, u_loc) * (1.0 - 0.85 * G.sstep(0.22, 0.76, u_loc))
        sag_trench = -h_trough * np.exp(-((u_loc - 0.84) / 0.11) ** 2)
        # Double-crested *sackung* ridge along the broken front crest (`u_loc ~ 0.20`)
        sackung = 85.0 * np.exp(-((u_loc - 0.19) / 0.05) ** 2) * np.abs(np.cos(s_arc_km * 0.08 + idx_b))
        dh_slumps += in_band * seg_mod * (front_riser + sag_trench + sackung)
        if idx_b in (0, 1):
            trench_trough_mask = np.maximum(
                trench_trough_mask,
                in_band * np.exp(-((u_loc - 0.84) / 0.08) ** 2)
            )

    # Place 8 elongated back-tilted sag-pond / trench lakes along the deepest head-scarp troughs (`biomes/wouterwall/PLAN.md` §4)
    sag_pond_centres = [
        (56.0, 355.0, 11.0, 2.8,  12.0),
        (48.0, 422.0, 10.0, 2.6,   4.0),
        (46.0, 488.0, 12.0, 3.0,  -5.0),
        (54.0, 558.0, 13.0, 3.2,  -8.0),
        (60.0, 628.0, 11.0, 2.8, -14.0),
        (78.0, 695.0, 12.0, 3.0, -24.0),
        (108.0, 756.0, 11.0, 2.8, -32.0),
        (146.0, 804.0, 10.0, 2.6, -38.0),
    ]
    wow_water_mask = np.zeros((VH, VW), dtype=bool)
    wow_water_lev = np.zeros((VH, VW), dtype=float)
    dh_sag_beds = np.zeros((VH, VW), dtype=float)

    for sx, sy, ry_km, rx_km, ang_d in sag_pond_centres:
        ang = math.radians(ang_d)
        dx_s = (px - sx) * 2.0
        dy_s = (py - sy) * 2.0
        u_s = dx_s * math.cos(ang) + dy_s * math.sin(ang)
        v_s = -dx_s * math.sin(ang) + dy_s * math.cos(ang)
        r_ell = np.hypot(u_s / rx_km, v_s / ry_km)
        w_pond = 1.0 - G.sstep(0.65, 1.15, r_ell)
        cy_i = int(np.clip(round(sy), 0, VH - 1))
        cx_i = int(np.clip(round(sx), 0, VW - 1))
        pond_lev = float(Eo_low[cy_i, cx_i] - 95.0)
        is_pond = (r_ell <= 0.82) & mask_wow & (sett_guard > 0.8)
        wow_water_mask |= is_pond
        wow_water_lev = np.where(is_pond, pond_lev, wow_water_lev)
        bed_target = (pond_lev - 28.0) + 24.0 * np.clip(r_ell / 0.85, 0.0, 1.0)
        dh_sag_beds += w_pond * (bed_target - (Eo + dh_slumps))

    # 2. Five Long-Runout Sturzstrom Megabreccia Lobes (`5,200-7,000 m` running out 30-45 km down the bench)
    # (`biomes/wouterwall/PLAN.md` §4: Saidmarreh / Kofels / Valles Marineris style grooved hummocky avalanche lobes)
    sturzstroms = [
        (46.0, 336.0, 36.0, 14.0,   8.0, 240.0),
        (34.0, 448.0, 38.0, 15.0,   2.0, 265.0),
        (38.0, 542.0, 42.0, 16.5,  -6.0, 285.0),  # Station 3 flagship fresh + old sturzstrom lobe
        (52.0, 654.0, 36.0, 14.5, -18.0, 250.0),
        (92.0, 748.0, 38.0, 15.0, -30.0, 260.0),
    ]
    dh_sturz = np.zeros((VH, VW), dtype=float)
    hummock_noise = _norm_gauss(rs, (VH, VW), 1.05)

    for lx, ly, runout_km, half_w_km, az_deg, h_lobe in sturzstroms:
        ang_l = math.radians(az_deg)
        dx_l = (px - lx) * 2.0
        dy_l = (py - ly) * 2.0
        # `u_l` is distance downslope (eastward) from the crest detachment scar (`u_l < 0` in scar, `0..runout_km` in lobe)
        u_l = dx_l * math.cos(ang_l) + dy_l * math.sin(ang_l)
        v_l = -dx_l * math.sin(ang_l) + dy_l * math.cos(ang_l)

        # Headwall amphitheatre detachment scar (`u_l in [-14, 2] km`)
        r_scar = np.hypot((u_l + 6.0) / 7.5, v_l / (half_w_km * 0.72))
        w_scar = 1.0 - G.sstep(0.55, 1.08, r_scar)
        dh_scar = -265.0 * w_scar

        # Spreading runout lobe (`u_l in [2, runout_km]`) with distal raised rim & longitudinal radial flow grooves
        w_spread = half_w_km * (0.68 + 0.52 * np.clip(u_l / runout_km, 0.0, 1.0))
        r_trans = np.abs(v_l) / np.maximum(2.0, w_spread)
        w_lobe = (
            G.sstep(0.0, 6.0, u_l)
            * (1.0 - G.sstep(runout_km * 0.72, runout_km * 1.05, u_l))
            * (1.0 - G.sstep(0.68, 1.08, r_trans))
        )
        grooves = 55.0 * np.cos(v_l / w_spread * 5.0 * math.pi)
        distal_rim = 75.0 * np.exp(-((u_l - runout_km * 0.78) / 5.5) ** 2)
        hummocks = 52.0 * np.abs(hummock_noise)
        dh_sturz += dh_scar + w_lobe * (h_lobe * (0.55 + 0.45 * (u_l / runout_km)) + grooves + distal_rim + hummocks)

    # 3. Lower Loess *Yuan* Tablelands, *Liang* Ridges, & Amphitheatre-Headed Box Canyons (`3,000-4,250 m`, `u_wall < 0.34`)
    w_loess_zone = (1.0 - G.sstep(0.24, 0.38, u_wall)) * G.sstep(2850.0, 3250.0, Eo_low)
    # Stepped flat-topped loess *yuan* tableland benches (+110 m) separated by sheer-walled gullies (-145 m)
    yuan_field = np.sin(px * 0.42 + py * 0.28) * np.cos(px * 0.26 - py * 0.46)
    w_yuan_top = G.sstep(-0.15, 0.25, yuan_field)
    dh_loess = w_loess_zone * (115.0 * w_yuan_top - 135.0 * (1.0 - w_yuan_top))

    # Carve amphitheatre-headed box canyons along all ~30 eastward streams & wadis crossing the eastern edge
    wow_rivers = []
    for rv in (rivers_list or ()):
        rpts = rv.get('px', [])
        if any(8 <= p[0] <= 230 and 275 <= p[1] <= 880 for p in rpts):
            wow_rivers.append(rpts)
    d_wadi_px = _polyline_dist_px(px, py, wow_rivers, bbox_pad=14.0)
    w_box_canyon = (1.0 - G.sstep(0.85, 2.6, d_wadi_px)) * (1.0 - G.sstep(0.38, 0.55, u_wall))
    dh_box_canyon = -185.0 * w_box_canyon

    w_eff = w_poly * sett_guard
    En = Eo + w_eff * (dh_slumps + dh_sag_beds + dh_sturz + dh_loess + dh_box_canyon)
    whas_out = whas | wow_water_mask
    wlev_out = np.where(wow_water_mask, wow_water_lev, wlev)
    return En, whas_out, wlev_out


# ==============================================================================
# 4. The Cut (`the cut`, `rmuqljqcvdimg`) & Grazing Eigenweapon Chord
# ==============================================================================
def _sculpt_the_cut(Eo, whas, wlev, mask_cut, px, py, sett_guard, rs):
    """Sculpt `the cut` (`rmuqljqcvdimg`, centre `(460, 302)`) and the grazing eigenweapon chord (`(496, 108) -> (265, 290)`):
    - Replaces pre-cut noisy hills inside the spherical-cap bowl with a mirror-smooth concave sweep (`biomes/cut/PLAN.md` §5:
      'the cut is the one smooth thing on Krator') while preserving both endorheic salt lakes (-1,456 m and -1,608 m)
      and Dilihan (472, 333)
    -Sharpens the cut-face lip (`r ~ 32-44 px` around `(460, 302)`) into crisp 1,500-3,500 m bare rock faces
    - Grades the northern pass mouth (`(460, 262) -> (460, 225)`) to a smooth, flat-graded +666 m sill
    - Sculpts the grazing orbital eigenweapon cylindrical-chord trough along `(496, 108) -> (265, 290)` and raises
      lateral/terminal mega-ejecta ramparts at the Catch entry (`(530, 104)`).
    """
    VH, VW = Eo.shape
    cx, cy = 460.0, 302.0
    dx = px - cx
    dy = py - cy
    r_px = np.hypot(dx, dy)
    ang_deg = np.degrees(np.arctan2(dx, -dy)) % 360.0

    # 1. Measure the azimuth-dependent lip radius `L(theta)` around `(460, 302)`
    rs_scan = np.arange(24.0, 58.0, 0.5)
    lip_r = np.zeros(360, dtype=float)
    for b in range(360):
        t = math.radians(b)
        xs = np.clip(np.round(cx + rs_scan * math.sin(t)).astype(int), 0, VW - 1)
        ys = np.clip(np.round(cy - rs_scan * math.cos(t)).astype(int), 0, VH - 1)
        lip_r[b] = rs_scan[int(np.argmax(Eo[ys, xs]))]
    lip_r = nd.gaussian_filter1d(lip_r, sigma=6.5, mode='wrap')
    L_px = np.interp(ang_deg, np.arange(361), np.r_[lip_r, lip_r[0]])

    # Normalized radial coordinate `u_bowl = r_px / L_px` (0 at centre, 1 at lip crest)
    u_bowl = r_px / np.maximum(L_px, 18.0)

    # Preserve the south-east crater mouth (`ang_deg in [118, 182]`, where Dilihan stands at `(472, 333)`)
    se_mouth = G.sstep(112.0, 128.0, ang_deg) * (1.0 - G.sstep(172.0, 188.0, ang_deg))
    # Preserve the north pass mouth (`ang_deg in [342, 18]`)
    n_mouth_ang = (1.0 - G.sstep(12.0, 26.0, ang_deg)) + G.sstep(334.0, 348.0, ang_deg)
    n_mouth_ang = np.clip(n_mouth_ang, 0.0, 1.0)

    # Ideal smooth spherical-cap surface inside the bowl (`u_bowl < 0.96`):
    # Smoothly filter `Eo` inside the bowl to erase pre-cut noisy ridges while keeping the exact macro-basin profile
    Eo_ultra_smooth = nd.gaussian_filter(Eo, sigma=5.2)
    # Crisp concave spherical-cap wall sweep (`u_bowl in [0.52, 0.98]`) rising steeply to the unweathered cut face at the lip
    wall_steepen = (
        -240.0 * np.sin(np.clip((u_bowl - 0.45) / 0.50, 0.0, 1.0) * math.pi)
        * (1.0 - se_mouth) * (1.0 - n_mouth_ang)
    )
    # Uplift and sharpen the outer lip shoulder (`u_bowl in [0.95, 1.12]`) so the cut face is a razor-sharp 1,500-3,500 m cliff
    lip_shoulder = (
        340.0 * np.exp(-((u_bowl - 1.03) / 0.055) ** 2)
        * (1.0 - se_mouth) * (1.0 - n_mouth_ang)
    )

    w_inside_bowl = (1.0 - G.sstep(0.84, 0.98, u_bowl)) * (~whas)
    h_bowl_target = Eo_ultra_smooth + wall_steepen
    # Blend `Eo` toward the mirror-smooth spherical-cap sweep inside the bowl, and add the sharp lip shoulder
    En = Eo * (1.0 - 0.88 * w_inside_bowl * sett_guard) + h_bowl_target * (0.88 * w_inside_bowl * sett_guard)
    En = En + lip_shoulder * sett_guard * mask_cut

    # 2. Smooth flat-graded +666 m pass sill in the North Mouth (`axis_x = 460, py = 264 -> 225`)
    d_north_x = np.abs(px - 460.0)
    r_north_y = cy - py  # distance north of (460, 302) in px
    SILL_M = 666.0
    rl_north = float(lip_r[0])  # ~39 px (`py ~ 263`)
    rs_north = 77.0             # `py ~ 225`
    t_n = np.clip((r_north_y - 18.0) / max(1.0, rl_north - 18.0), 0.0, 1.0)
    z1_n = float(Eo_ultra_smooth[int(round(cy - 18.0)), int(round(cx))])
    z_pass_floor = np.where(
        r_north_y <= rl_north,
        z1_n + (SILL_M - z1_n) * (t_n ** 1.55),
        SILL_M - 24.0 * np.clip((r_north_y - rl_north) / (rs_north - rl_north), 0.0, 1.2)
    )
    half_w_pass = np.interp(r_north_y, [18.0, rs_north], [13.5, 7.5])
    w_pass_flat = 1.0 - G.sstep(half_w_pass * 0.55, half_w_pass * 1.15, d_north_x)
    w_pass_len = G.sstep(18.0, 26.0, r_north_y) * (1.0 - G.sstep(rs_north - 4.0, rs_north + 6.0, r_north_y))
    w_north_slot = w_pass_flat * w_pass_len * (~whas) * sett_guard
    En = En * (1.0 - 0.85 * w_north_slot) + np.minimum(En, z_pass_floor) * (0.85 * w_north_slot)

    # 3. Grazing Orbital Eigenweapon Cylindrical-Chord Slice (`(496, 108) -> (265, 290)`) & Catch Entry Ramparts (`(530, 104)`)
    ax0, ay0 = 496.0, 108.0
    ax1, ay1 = 265.0, 290.0
    vx, vy = ax1 - ax0, ay1 - ay0
    len_chord = math.hypot(vx, vy)
    ux, uy = vx / len_chord, vy / len_chord
    # `s_ch` in [0, len_chord] along chord; `d_ch` signed perpendicular distance in px
    s_ch = (px - ax0) * ux + (py - ay0) * uy
    d_ch = -(px - ax0) * uy + (py - ay0) * ux

    w_along_chord = G.sstep(-8.0, 14.0, s_ch) * (1.0 - G.sstep(len_chord - 18.0, len_chord - 2.0, s_ch))
    # Smooth cylindrical-chord slot trough (`|d_ch| < 9 px`) flanked by razor-sharp cut scarps (`|d_ch| ~ 10..15 px`)
    w_chord_floor = (1.0 - G.sstep(4.5, 9.5, np.abs(d_ch))) * w_along_chord * (~whas)
    # Smooth the floor along the chord toward a clean graded profile (+666 m sill floor in the northern pass reach)
    Eo_chord_smooth = nd.gaussian_filter(En, sigma=4.5)
    chord_sill_blend = G.sstep(0.0, 65.0, s_ch) * (1.0 - G.sstep(95.0, 155.0, s_ch))
    h_chord_target = Eo_chord_smooth * (1.0 - 0.45 * chord_sill_blend) + np.maximum(SILL_M, Eo_chord_smooth - 240.0) * (0.45 * chord_sill_blend)
    chord_scarp_rim = 240.0 * np.exp(-((np.abs(d_ch) - 11.5) / 2.4) ** 2) * w_along_chord * (~whas)

    En = En * (1.0 - 0.70 * w_chord_floor * sett_guard) + h_chord_target * (0.70 * w_chord_floor * sett_guard)
    En = En + chord_scarp_rim * sett_guard

    # Lateral & terminal mega-ejecta ramparts at the Catch entry (`(530, 104)`)
    dx_ej = (px - 530.0) * 2.0
    dy_ej = (py - 104.0) * 2.0
    r_ej_km = np.hypot(dx_ej, dy_ej)
    th_ej = np.arctan2(dy_ej, dx_ej)
    # Crescentic bicyclic ejecta rampart arc (+380..+520 m at r = 14..32 km around (530, 104))
    w_ejecta = (
        np.exp(-((r_ej_km - 21.0) / 7.5) ** 2)
        * (0.65 + 0.35 * np.cos(2.0 * th_ej - 0.6))
        * (~whas)
    )
    ejecta_rough = 65.0 * np.abs(_norm_gauss(rs, (VH, VW), 1.3))
    En = En + (410.0 + ejecta_rough) * w_ejecta * sett_guard

    # Ensure existing Cut lakes stay strictly below their water levels
    En = np.where(whas & mask_cut, np.minimum(En, Eo), En)
    return En


# ==============================================================================
# 5. Korona / NE (`Korona / NE`, `rmuqm3urh0mo6`)
# ==============================================================================
def _sculpt_korona_ne(Eo, whas, wlev, mask_kor, regs_list, px, py, sett_guard, rs):
    """Sculpt `Korona / NE` (px 595..1071, py 9..352):
    - De-rings the legacy generator's 3 concentric sinusoidal bull's-eye waves around (814, 189) / (838, 178)
    - Sculpts flat-topped structural quartzite tepui plateaus (+900 to +2,200 m in the central corona, stepping
      up into The Tiers and +3,400 to +4,800 m hoar tables in the NE) severed by anastomosing ring-fault & radial
      chasm troughs (-1,200 to -2,400 m) with steep 1,500-3,600 m tepui walls
    - Honors all built Korona station sites and tapers smoothly to 0.0 m for `py < 110` to tie seamlessly into
      `nw_expansion.py`.
    """
    VH, VW = Eo.shape
    d_in = nd.distance_transform_edt(mask_kor)
    # Feather polygon boundary AND taper to 0.0 m for `py < 110` (`G.sstep(88.0, 118.0, py)`)
    w_north_tie = G.sstep(88.0, 118.0, py)
    w_poly = G.sstep(0.0, 7.5, d_in) * mask_kor * w_north_tie

    # Keep water cells and immediate 1-cell lake shores untouched so all existing trench salt lakes are preserved
    d_water = nd.distance_transform_edt(~(whas & mask_kor))
    w_land = G.sstep(0.8, 2.8, d_water) * (~whas)

    # 1. Corona radial & azimuthal coordinates around the central corona plume `(814, 189)`
    cx_k, cy_k = 814.0, 189.0
    dx_k = (px - cx_k) * 2.0
    dy_k = (py - cy_k) * 2.0
    r_k_km = np.hypot(dx_k, dy_k)
    th_k = np.arctan2(dy_k, dx_k)

    # Multi-scale 2D spatial domain warp so the ring faults and tepui blocks break into a realistic polygonal quilt
    # instead of a concentric bull's-eye!
    wx_k = 14.0 * _norm_gauss(rs, (VH, VW), 5.5) + 6.5 * _norm_gauss(rs, (VH, VW), 2.2)
    wy_k = 14.0 * _norm_gauss(rs, (VH, VW), 5.5) + 6.5 * _norm_gauss(rs, (VH, VW), 2.2)
    r_warp_km = np.hypot(dx_k + wx_k, dy_k + wy_k)
    th_warp = np.arctan2(dy_k + wy_k, dx_k + wx_k)

    # 2. Construct the Polygonal Tepui Quilt vs. Anastomosing Chasm Network in the Corona Ring Zone (`r_k_km < 260 km`)
    w_corona_core = 1.0 - G.sstep(215.0, 275.0, r_k_km)

    # Disrupt the 3 bull's-eye rings (`r = 50, 110, 200 km`) with angular block segmentation (10-30 km tepui tables)
    ring_wave = (
        np.cos((r_warp_km - 42.0) * math.pi / 34.0)
        * (0.55 + 0.45 * np.sin(th_warp * 5.0 + 0.8 * np.cos(r_warp_km * 0.045)))
    )
    radial_faults = np.cos(th_warp * 9.0 + r_warp_km * 0.032) * np.sin(th_warp * 6.0 - r_warp_km * 0.025)
    quilt_field = 0.62 * ring_wave + 0.38 * radial_faults

    # Quantize positive blocks into flat-topped quartzite *tepui* mesas (`w_tepui -> 1`, top slope < 1.5 deg)
    # and negative troughs into steep-walled ring-fault chasms (`w_chasm -> 1`)
    w_tepui = G.sstep(0.04, 0.24, quilt_field) * G.sstep(-450.0, 450.0, Eo)
    w_chasm = (1.0 - G.sstep(-0.32, -0.04, quilt_field)) * (1.0 - G.sstep(2400.0, 3100.0, Eo))

    # Quantized structural tepui summit levels (+1,480 m, +1,850 m, +2,350 m, +3,650 m hoar tables)
    Eo_regional = nd.gaussian_filter(Eo, sigma=7.0)
    q_step = 440.0
    h_tepui_flat = np.round((Eo_regional + 280.0) / q_step) * q_step
    h_tepui_flat = np.clip(h_tepui_flat, 1150.0, 4650.0) + 18.0 * _norm_gauss(rs, (VH, VW), 1.8)

    # Steep vertical rim walls (+280 m quartzite cornice at the tepui edge)
    w_tepui_rim = np.exp(-((quilt_field - 0.18) / 0.08) ** 2) * G.sstep(-300.0, 500.0, Eo)
    h_tepui_target = np.maximum(Eo, h_tepui_flat) + 275.0 * w_tepui_rim

    # Deepen dry/semi-dry chasm floors between tepuis toward structural graben benches (-1,250 to -2,150 m)
    h_chasm_target = np.minimum(Eo, np.maximum(Eo_regional - 680.0, -2250.0))

    dh_corona = (
        w_corona_core * (
            w_tepui * (h_tepui_target - Eo) * 0.85
            + w_chasm * (h_chasm_target - Eo) * 0.72
        )
    )

    # 3. Structural Bench Staircase in `The Tiers` (`px 873..1009, py 118..287`, eastern ring sector)
    try:
        mask_tiers = G.region_mask(regs_list, 'The Tiers', 1.0, 1.0, (VH, VW), full=True)
    except KeyError:
        mask_tiers = (px >= 873.0) & (px <= 1009.0) & (py >= 118.0) & (py <= 287.0) & mask_kor
    d_tiers = nd.distance_transform_edt(mask_tiers)
    w_tiers = G.sstep(0.0, 5.0, d_tiers) * mask_tiers * (~whas)
    # 5 structural quartzite & travertine terrace benches stepping from -600 m up to +4,100 m
    tier_step_m = 550.0
    tier_phase = (Eo_regional + 600.0) / tier_step_m
    tier_frac = tier_phase - np.floor(tier_phase)
    tier_quant = (np.floor(tier_phase) + G.sstep(0.18, 0.82, tier_frac)) * tier_step_m - 600.0
    dh_tiers = w_tiers * (tier_quant - Eo) * 0.55

    # 4. High Cold NE Hoar Tables (`Eo > 3,000 m`, `biomes/korona/NOTES.md` 'Station 6, the hoar table'):
    # Flat-topped frost-shattered high tepuis (+3,500..+4,800 m) cut by wind-scoured yardang corridors
    w_hoar = G.sstep(2950.0, 3550.0, Eo_regional) * (1.0 - G.sstep(5400.0, 6200.0, Eo_regional))
    hoar_quilt = np.sin((px + wx_k * 0.5) * 0.22) * np.cos((py + wy_k * 0.5) * 0.22)
    w_hoar_table = G.sstep(-0.10, 0.28, hoar_quilt)
    hoar_flat = np.round(Eo_regional / 380.0) * 380.0
    dh_hoar = w_hoar * (
        w_hoar_table * (hoar_flat + 140.0 - Eo) * 0.60
        - (1.0 - w_hoar_table) * 210.0
    )

    # Protect Korona's key station sites so their exact documented station geometry is preserved/enhanced:
    # - Station 1 Tepui `(818, 194)`: ensure flat summit at ~+1,480..+1,620 m
    w_st1 = 1.0 - G.sstep(2.5, 6.5, np.hypot(px - 818.0, py - 194.0))
    # - Station 2 Pitcher Hollow `(713, 212)` (-668 m) & Station 4 Trenches `(784, 188)` (+1,627 m ridge)
    w_st_keep = (
        (1.0 - G.sstep(2.5, 6.0, np.hypot(px - 713.0, py - 212.0)))
        + (1.0 - G.sstep(2.5, 6.0, np.hypot(px - 784.0, py - 188.0)))
        + (1.0 - G.sstep(3.0, 7.0, np.hypot(px - 957.0, py - 228.0)))
    )
    w_st_keep = np.clip(w_st_keep, 0.0, 1.0)

    w_eff = w_poly * w_land * sett_guard * (1.0 - w_st_keep)
    En = Eo + w_eff * (dh_corona + dh_tiers + dh_hoar)
    # Station 1 Tepui table top at (818, 194) -> flat +1,520 m table over a 16x12 km mesa
    h_st1_mesa = 1520.0 + 0.12 * (Eo - 1480.0)
    En = np.where((w_st1 > 0.01) & (~whas), En * (1.0 - w_st1) + h_st1_mesa * w_st1, En)
    return En


# ==============================================================================
# Public Entry Point
# ==============================================================================
def remodel_tier1_biomes(Eo, whas0, wlev0, regs_list, settlements_list, rivers_list):
    """Apply all 5 Tier-1 biome landform upgrades (`k-guilin`, `sw highlands`, `w outer wall`, `the cut`,
    and `Korona / NE`) on the `2 km/cell` height grid `Eo` (`1393 x 1549`).

    Parameters
    ----------
    Eo : np.ndarray, shape (1393, 1549), float
        Unshifted full-resolution 2 km/cell elevation grid in metres.
    whas0 : np.ndarray, shape (1393, 1549), bool
        Initial water mask on the 2 km/cell grid.
    wlev0 : np.ndarray, shape (1393, 1549), float
        Initial water surface elevation grid in metres.
    regs_list : list of dict
        Regions list from `openworld/little-demo/source/regions.json`.
    settlements_list : list of dict
        Settlements list from `openworld/little-demo/source/settlements.json`.
    rivers_list : list of dict
        Rivers list (`D['rivers']` or `model/data/rivers.json`).

    Returns
    -------
    En : np.ndarray, shape (1393, 1549), float
        Updated elevation grid in metres.
    whas2 : np.ndarray, shape (1393, 1549), bool
        Updated water mask including the Sarez landslide lake and W Outer Wall sag ponds.
    wlev2 : np.ndarray, shape (1393, 1549), float
        Updated water surface elevation grid in metres.
    changed_mask : np.ndarray, shape (1393, 1549), bool
        Boolean mask of cells where `|En - Eo| > 0.5 m` or water state changed.
    """
    VH, VW = Eo.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    Y, X = np.indices((VH, VW))
    px = X.astype(float) / su
    py = Y.astype(float) / sv

    rs = np.random.RandomState(SEED_TIER1)
    En = Eo.copy().astype(float)
    whas2 = whas0.copy().astype(bool)
    wlev2 = wlev0.copy().astype(float)

    if isinstance(regs_list, dict):
        regs_list = regs_list.get('docs', [])
    if isinstance(settlements_list, dict):
        settlements_list = settlements_list.get('docs', [])

    # Build global settlement protection mask (protects all settlements + Korona's Serai & Glint)
    sett_guard = _settlement_guard(
        px, py, settlements_list,
        extra_pts=[(654.0, 224.0), (628.0, 123.0)],
        r_inner_px=3.0, r_outer_px=7.5
    )

    # 1. k-Guilin (`k-guilin`)
    mask_kg = G.region_mask(regs_list, 'k-guilin', su, sv, (VH, VW))
    En = _sculpt_k_guilin(En, whas2, wlev2, mask_kg, px, py, rivers_list, sett_guard, rs)

    # 2. SW Highlands (`sw highlands`)
    mask_sw = G.region_mask(regs_list, 'sw highlands', su, sv, (VH, VW))
    En, whas2, wlev2 = _sculpt_sw_highlands(En, whas2, wlev2, mask_sw, px, py, rivers_list, sett_guard, rs)

    # 3. W Outer Wall (`w outer wall`)
    mask_wow = G.region_mask(regs_list, 'w outer wall', su, sv, (VH, VW))
    En, whas2, wlev2 = _sculpt_w_outer_wall(En, whas2, wlev2, mask_wow, px, py, rivers_list, sett_guard, rs)

    # 4. The Cut (`the cut`) + Grazing Eigenweapon Chord (`(496, 108) -> (265, 290)`)
    mask_cut = G.region_mask(regs_list, 'the cut', su, sv, (VH, VW))
    En = _sculpt_the_cut(En, whas2, wlev2, mask_cut, px, py, sett_guard, rs)

    # 5. Korona / NE (`Korona / NE`)
    mask_kor = G.region_mask(regs_list, 'Korona / NE', su, sv, (VH, VW))
    En = _sculpt_korona_ne(En, whas2, wlev2, mask_kor, regs_list, px, py, sett_guard, rs)

    # Clamp to valid height range [-2600, 27000] m
    En = np.clip(En, -2600.0, 27000.0)
    changed_mask = (np.abs(En - Eo) > 0.5) | (whas2 != whas0)
    return En, whas2, wlev2, changed_mask
