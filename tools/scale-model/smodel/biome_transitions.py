"""Biome Boundary Topological & Geological Transition Pass (`smodel/biome_transitions.py`):
  Examines all biome-to-biome boundaries on the unified `2 km/cell` (`1393 x 1549`) grid and applies four
  geological contact treatments so that adjacent biomes interlock through authentic transitional landforms
  with zero polygon-edge steps or seams:
  1. Mountain-to-Basin Piedmont Aprons (Bajadas, Alluvial Fans, & Foothill Hogbacks):
     - Along contacts between high mountain walls (`n highlands`, `sw highlands`, `w outer wall`, `NW outer wall`,
       `e inner wall`, `s highlands`, `stalker range`) and adjacent basins (`NW lowlands`, `n semiarid`, `SW lowlands`,
       `ancient's valley`, `Farside`, `e badlands`, `sedesert`, `crater drylands S`, `the catch`), sculpts coalescing
       piedmont alluvial fans at river mouths and tapering foothill hogback spurs on interfluves.
  2. Structural Escarpment & Cataract Water-Gap Contacts:
     - Along major structural drop-offs (`sedesert`/`e badlands` <-> `e abysss`/`the bowl`; `abyssal-savannah` <->
       `hyperjungle`; `rift rim` <-> `rift`; `Tiers` <-> `Korona / NE` & `N Outlands`), aligns stepped fault-bench
       ledges and carves recessed V-shaped cataract water gaps where rivers cross the rim.
  3. Karst, Tepui & Butte Outlier Ecotone Belts:
     - Across a 16 km transition belt outside `k-guilin`/`NW bay`, `Korona / NE`, `sedesert`, and `savage hyperjungle`,
       scatters diminishing outlier karst towers, micro-tepui tables, and sandstone buttes so tower/mesa fields
       grade naturally into neighbouring plains.
  4. Global Domain-Warped Cross-Boundary Seam Feathering & Thalweg Continuity:
     - Applies domain-warped FBM feathering across all shared biome polygon perimeters (`d_border <= 11 km`) and
       grades river thalwegs across boundary crossings while preserving all lake levels, settlement pads, and the
       completed 5-region SE complex.
"""
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from . import geom as G
from .tier1_biomes import _norm_gauss, _settlement_guard, _polyline_dist_px


SEED_TRANSITIONS = 20261104

# Biome regions whose perimeters participate in the geological contact pass
BIOME_REGION_NAMES = [
    'k-guilin', 'sw highlands', 'w outer wall', 'the cut', 'Korona / NE',
    'Tiers', 'N Outlands', 'S Outlands', 'stalker range',
    'floodzone', 'n semiarid', 'dam', 'dam 2', 'NW lowlands', 'SW lowlands',
    "ancient's valley", 'NW outer wall', 'Farside',
    'sedesert', 'e badlands', 'Yuni Valley', 'painted highlands',
    'n highlands', 's highlands', 'e inner wall',
    'rift', 'rift rim N', 'rift rim S', 'w rift highland', 'xanadu', 'Oidong Valley', 'the catch',
    'hyperjungle S', 'savage hyperjungle', 'hyperjungle N',
    'crater drylands N', 'crater drylands S',
    'e savannah rim', 'se savannah rim', 'ne rim',
    'SW Bay', 'NW bay', 'godstep valley', 'godthrone', 'Throne/Volcano', 'Lesser Throne',
]


def _contact_belt(mask_a, mask_b, half_width_px=6.5):
    """Return a smooth weight in [0, 1] along the shared boundary between `mask_a` and `mask_b` within `half_width_px`."""
    if not mask_a.any() or not mask_b.any():
        return np.zeros_like(mask_a, dtype=float)
    da = nd.distance_transform_edt(~mask_a)
    db = nd.distance_transform_edt(~mask_b)
    d_contact = np.maximum(da, db)
    return 1.0 - G.sstep(0.0, half_width_px, d_contact)


def apply_biome_boundary_transitions(Eo, En_in, whas, wlev, regs_list, settlements_list, rivers_list):
    """Apply topological and geological transitions across all interior biome boundaries on `(1393, 1549)`.

    Returns
    -------
    En_out : np.ndarray, shape (1393, 1549), float
        Elevation grid with seamless geological biome boundary transitions.
    ch_trans : np.ndarray, shape (1393, 1549), bool
        Boolean mask of cells modified by the transition pass (`|En_out - En_in| > 0.5 m`).
    """
    VH, VW = En_in.shape
    su = (VW - 1.0) / 1548.0
    sv = (VH - 1.0) / 1392.0
    Y, X = np.indices((VH, VW))
    px = X.astype(float) / su
    py = Y.astype(float) / sv

    rs = np.random.RandomState(SEED_TRANSITIONS)
    En = En_in.copy().astype(float)

    if isinstance(regs_list, dict):
        regs_list = regs_list.get('docs', [])
    if isinstance(settlements_list, dict):
        settlements_list = settlements_list.get('docs', [])

    # Protect settlements, volcanic edifices, and water margins
    sett_guard = _settlement_guard(px, py, settlements_list, r_inner_px=3.0, r_outer_px=7.0)
    volc_edifice_guard = (
        G.sstep(28.0, 44.0, np.hypot((px - 858.0) * 2.0, (py - 524.0) * 2.0))   # Lesser Throne
        * G.sstep(28.0, 44.0, np.hypot((px - 575.0) * 2.0, (py - 504.0) * 2.0)) # Throne
        * G.sstep(36.0, 56.0, np.hypot((px - 578.0) * 2.0, (py - 933.0) * 2.0)) # Godthrone
        * G.sstep(12.0, 20.0, np.hypot((px - 620.8) * 2.0, (py - 815.2) * 2.0)) # Godstep Head Vent
    )
    d_water = nd.distance_transform_edt(~whas)
    w_dry = G.sstep(1.5, 4.0, d_water) * (~whas) * sett_guard * volc_edifice_guard

    # Precompute region masks by name
    masks = {}
    for nm in BIOME_REGION_NAMES:
        masks[nm] = G.region_mask(regs_list, nm, su, sv, (VH, VW))

    # Distance to all interior rivers/wadis
    all_riv_pts = [rv['px'] for rv in (rivers_list or ()) if len(rv.get('px', [])) >= 2]
    d_riv_all = _polyline_dist_px(px, py, all_riv_pts, bbox_pad=16.0)
    w_riv_mouth = 1.0 - G.sstep(1.2, 4.5, d_riv_all)
    w_riv_thalweg = 1.0 - G.sstep(0.8, 2.4, d_riv_all)

    # ==========================================================================
    # 1. Mountain-to-Basin Piedmont Aprons (Coalescing Bajada Fans & Hogbacks)
    # ==========================================================================
    m_highlands = (
        masks['n highlands'] | masks['sw highlands'] | masks['w outer wall']
        | masks['NW outer wall'] | masks['e inner wall'] | masks['s highlands']
        | masks['stalker range'] | masks['painted highlands']
    )
    m_basins = (
        masks['NW lowlands'] | masks['n semiarid'] | masks['floodzone']
        | masks['SW lowlands'] | masks["ancient's valley"] | masks['Farside']
        | masks['dam'] | masks['dam 2'] | masks['e badlands'] | masks['sedesert']
        | masks['crater drylands S'] | masks['crater drylands N'] | masks['the catch']
        | masks['SW Bay'] | masks['godstep valley'] | masks['S Outlands']
    )
    w_piedmont = _contact_belt(m_highlands, m_basins, half_width_px=7.5) * w_dry
    if (w_piedmont > 0.01).any():
        # Smooth regional piedmont ramp across the mountain-front contact
        En_pied_smooth = nd.gaussian_filter(En, sigma=3.8)
        # Where rivers exit the mountains onto the basin, raise a convex coalescing alluvial fan apron (+55 m)
        # incised along the central channel (-32 m); on interfluves, sculpt tapering foothill hogback spurs (+65 m)
        fan_apron = 58.0 * G.sstep(1.0, 4.2, d_riv_all) * (1.0 - G.sstep(4.2, 8.5, d_riv_all)) - 34.0 * w_riv_thalweg
        hogback_spurs = 38.0 * (1.0 - w_riv_mouth) * _norm_gauss(rs, (VH, VW), 3.8)
        pied_target = 0.65 * En_pied_smooth + 0.35 * En + fan_apron + 0.45 * hogback_spurs
        En = En * (1.0 - 0.68 * w_piedmont) + pied_target * (0.68 * w_piedmont)

    # ==========================================================================
    # 2. Structural Escarpment & Cataract Water-Gap Contacts
    # ==========================================================================
    m_plateaus = (
        masks['sedesert'] | masks['e badlands']
        | masks['e savannah rim'] | masks['se savannah rim'] | masks['ne rim']
        | masks['rift rim N'] | masks['rift rim S'] | masks['w rift highland']
        | masks['Tiers']
    )
    m_troughs = (
        G.region_mask(regs_list, 'e abysss', su, sv, (VH, VW))
        | G.region_mask(regs_list, 'the bowl', su, sv, (VH, VW))
        | masks['hyperjungle S'] | masks['hyperjungle N'] | masks['savage hyperjungle']
        | masks['rift'] | masks['Korona / NE'] | masks['N Outlands']
    )
    w_scarp_contact = _contact_belt(m_plateaus, m_troughs, half_width_px=6.0) * w_dry
    if (w_scarp_contact > 0.01).any():
        # Carve V-shaped river water-gap notches (-110 m) where rivers cross structural escarpments
        En_thalweg_smooth = nd.gaussian_filter(En, sigma=3.2) - 85.0
        w_gap = w_scarp_contact * w_riv_mouth
        En = En * (1.0 - 0.72 * w_gap) + En_thalweg_smooth * (0.72 * w_gap)

    # ==========================================================================
    # 3. Karst, Tepui & Sandstone Butte Outlier Ecotone Belts
    # ==========================================================================
    m_outlier_sources = masks['k-guilin'] | masks['NW bay'] | masks['Korona / NE'] | masks['sedesert'] | masks['savage hyperjungle']
    if m_outlier_sources.any():
        d_out_src = nd.distance_transform_edt(~m_outlier_sources)
        # Belt from 0.5 to 7.5 px (1 to 15 km) outside the karst/tepui/mesa regions
        w_ecotone = G.sstep(0.2, 1.8, d_out_src) * (1.0 - G.sstep(3.5, 8.0, d_out_src)) * (~m_outlier_sources) * w_dry
        outlier_f = 0.65 * _norm_gauss(rs, (VH, VW), 4.2) + 0.35 * _norm_gauss(rs, (VH, VW), 2.4)
        outlier_peaks = 85.0 * (np.clip(outlier_f - 0.55, 0.0, 1.2) / 1.2) ** 1.25
        En = En + w_ecotone * outlier_peaks * (1.0 - w_riv_mouth)

    # ==========================================================================
    # 4. Global Domain-Warped Cross-Boundary Seam Feathering
    # ==========================================================================
    # Rasterize all biome polygon boundary lines to build a unified border-distance field
    im_border = Image.new('L', (VW, VH), 0)
    drw = ImageDraw.Draw(im_border)
    for r in regs_list:
        if r.get('name', '').strip() in BIOME_REGION_NAMES and len(r.get('points', [])) >= 3:
            pts_scaled = [(float(p[0]) * su, float(p[1]) * sv) for p in r['points']]
            drw.line(pts_scaled + [pts_scaled[0]], fill=1, width=1)
    border_mask = np.array(im_border, dtype=bool)

    if border_mask.any():
        # Domain-warped distance to the nearest biome polygon edge
        warp_d = 1.4 * _norm_gauss(rs, (VH, VW), 2.2)
        d_border = nd.distance_transform_edt(~border_mask) + warp_d
        w_seam = (1.0 - G.sstep(0.0, 5.5, np.maximum(d_border, 0.0))) * w_dry

        # Blend only the remodeling delta `(En - Eo)` with its cross-boundary smoothed version (`sigma = 2.4`)
        # so pre-existing sharp ridges/canyons in `Eo` remain 100% sharp while any polygon-edge step in `dE` vanishes
        dE = En - Eo
        dE_smooth = nd.gaussian_filter(dE, sigma=2.4)
        En = Eo + dE * (1.0 - 0.75 * w_seam) + dE_smooth * (0.75 * w_seam)

        # Also grade river thalwegs across boundary crossings
        w_riv_cross = (1.0 - G.sstep(0.0, 6.0, nd.distance_transform_edt(~border_mask))) * w_riv_thalweg * w_dry
        En_riv_grade = nd.gaussian_filter(En, sigma=2.0)
        En = En * (1.0 - 0.65 * w_riv_cross) + En_riv_grade * (0.65 * w_riv_cross)

    # Ensure no dry land cell is pushed below local Ring Sea / lake shorelines
    En = np.where((~whas) & (Eo > -1498.0) & (En < -1494.0), np.maximum(En, np.minimum(Eo, -1492.0)), En)
    En = np.clip(En, -2600.0, 27000.0)
    ch_trans = np.abs(En - En_in) > 0.5
    return En, whas.copy(), wlev.copy(), ch_trans
