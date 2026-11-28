"""Foreign Traders, Factors & Expats in Xanadu Wardrobe Kit (`xanadu_expats`).

Implements Group B (`B1..B10`) of `catch_twins_and_xanadu_expats_garment_plan.md`
100% procedurally on native MPFB proportions for BOTH `mpfb_male` (`m`) and
`mpfb_female` (`f`) across all 6 slots (`head`, `torso`, `gloves`, `legs`, `feet`, `back`):

- B1 `xan_yuni_envoy`:        Qiblai Yuni Diplomatic Factor & Guild Envoy (`yuni.mission` ~40)
- B2 `xan_geo_concession`:    Qiblai Geomancer Oilfield Concession Engineer (`geo.oilfield` ~300)
- B3 `xan_izani_banker`:      Strongbow & Erehwon Izani Treaty-Factor & Banker (*Getmastarz* / *Goldanda*)
- B4 `xan_hired_musketeer`:   Sultan's Hired Northern Musketeer & Artillerist (Gihon / Strongwall)
- B5 `xan_dalab_envoy`:       Thalaba Dalab Genepriest Grove-Envoy (`dalab.thalaba` ~30)
- B6 `xan_glazier_steward`:   Laitwal *Mara* Glazier Opal-Factor & Loj Steward (`0.94` pale big-eyed)
- B7 `xan_glazier_cutter`:    Laitwal *Mara* Potch-Delver & Moonglass Cutter (`kits/tungang/PLAN.md` 1.5)
- B8 `xan_saffron_prismarch`: Qiblai Saffron-Spoke Prismarch & Strongbow Balloon-Scholar (`qb.order`)
- B9 `xan_pearl_comprador`:   Pleasure-Dome Hykkousoi Ring-Sea Pearl-Comprador (Erehwon Bazaar)
- B10 `xan_citadel_envoy`:    Erehwon Citadel Envoys' House Eternian / Yusar Minister (`xa_cit_envoys`)
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit,
    surface_out, chest_front, assemble_garment
)
from ..paint import P, B, PN, COTTON, WOOL
from ..types.torso import (
    torso_tube, collar, stand_collar, collar_disc, tabard, band, crossed_sash, pauldron
)
from ..types.limbs import sleeve, sleeves, trousers
from ..types.footwear import boots
from ..types.headgear import (
    head_rings, sculpted_faceplate, sculpted_cranium, hood, brim,
    tower_hat, crown_band, fan, crest, wing, horn, turban
)
from ..types.accoutrements import (
    blob, pouch_belt, sash_with_tail, button_row,
    eye_disc, strap, tube, rosette
)
from .xanadu import _dorsal_pad
from .catch_caravans import (
    _install_caravaneer_motifs, _as, _head_landmarks, _box,
    _goggles, _fingerless_gloves, _full_gloves
)

_install_caravaneer_motifs()


def _build_chest_chain(gid_prefix, z_neck, w_loop, drop_z, coat_ease, link_paint, n_links=31):
    """Build a continuous 3D pectoral chain/pearl strand resting flush (`+3.5..4mm`) on the chest."""
    parts = []
    curve_pts = []
    n_curve = 25
    for k in range(n_curve):
        u = k / float(n_curve - 1)
        ang = (u - 0.5) * 0.94 * math.pi
        bx = math.sin(ang) * w_loop
        bz = z_neck - math.cos(ang) * drop_z
        curve_pts.append(chest_front(bz, coat_ease + 0.0035, x=bx))
    parts.append(horn(f'{gid_prefix}_cord', curve_pts, 0.0055, 0.0055, link_paint,
                      n=8, rows=n_curve, rigid_joint='Spine2', role='trinket'))
    for k in range(n_links):
        u = k / float(n_links - 1)
        ang = (u - 0.5) * 0.94 * math.pi
        bx = math.sin(ang) * w_loop
        bz = z_neck - math.cos(ang) * drop_z
        b_pos = chest_front(bz, coat_ease + 0.0040, x=bx)
        sx = 0.015 if (k % 2 == 0) else 0.012
        sz = 0.012 if (k % 2 == 0) else 0.015
        parts.append(blob(f'{gid_prefix}_link_{k}', b_pos, (sx, 0.010, sz), link_paint,
                          n=8, rows=4, out=FRONT, rigid_joint='Spine2', role='trinket'))
    return parts


# ===========================================================================================================
# B1. `xan_yuni_envoy` — Qiblai Yuni Diplomatic Factor & Guild Envoy (`yuni.mission` ~40)
# ===========================================================================================================
def _build_b1_xan_yuni_envoy(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE, ANKLE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    a, b, up, bk, left, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Yuni kalpak-turban pinned w/ court-licensed jade-and-opal safe-conduct aigrette (silver, never gold!)
    gid_h = f'xexp_{sex}_yuni_kalpak'
    parts_h = []
    kalpak_p = P('peacock', 0.03, [
        B('bottom', 0.0, 0.018, 'solid', 'silver'),
        B('top', 0.0, 0.024, 'solid', 'yuniyellow'),
    ], [PN(0.0, 1.0, 'trencadis', 'turq', 'peacock', 0.12)], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_kalpak', 0.160,
                             lambda s: 0.95 + 0.16 * math.sin(s * math.pi * 0.80) - 0.10 * (s ** 2.0),
                             kalpak_p, f=0.50, ease=0.020, rows=10, n=36))
    wrap_p = P('yuniyellow', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'silver'),
        B('bottom', 0.0, 0.008, 'solid', 'silver'),
    ], [PN(0.0, 1.0, 'xanadu_mosaic', 'turq', 'peacock', 0.10)], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_turban_fold', wrap_p, f0=0.47, f1=0.75, ease=0.024, flare=0.009, rows=6, n=36))

    c_br = a + (b - a) * (f_brow + 0.14)
    h_br = (first_hit(c_br, -bk) or 0.100) + 0.028
    p_aig = c_br - bk * h_br
    parts_h.append(rosette(gid_h + '_silver_aigrette', p_aig, -bk, up, 0.030,
                           P('silver', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'jade')], fabric='metal.iron'),
                           n=12, thick=0.009, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_opal_cabochon', p_aig - bk * 0.007, (0.024, 0.012, 0.028),
                        P('moonglass', 0.01, [B('top', 0.0, 0.006, 'solid', 'jade')],
                          fabric='glass.moonglass.leaded'),
                        n=10, rows=4, out=-bk, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_safe_plume', [
        p_aig + up * 0.015,
        p_aig + up * 0.085 - bk * 0.014,
        p_aig + up * 0.145 + bk * 0.014,
    ], 0.022, 0.005, P('moonglass', 0.02, [B('bottom', 0.0, 0.025, 'solid', 'jade'),
                                           B('top', 0.0, 0.025, 'solid', 'silver')], fabric='cloth.silk'),
        n=10, rows=7, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Qiblai Yuni Envoy Kalpak-Turban & Jade-Opal Aigrette',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Yuni high-collared kaftan in breathable Qiblai caldera silk w/ silver/opal sumptuary trim
    gid_t = f'xexp_{sex}_yuni_kaftan'
    parts_t = []
    kaf_p = P('peacock', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'silver'),
        B('bottom', 0.0, 0.026, 'solid', 'silver'),
        B('bottom', 0.026, 0.105, 'trencadis', 'yuniyellow', 'turq', 0.085),
    ], [
        PN(0.39, 0.42, 'solid', 'silver', 'peacock', 1.0),
        PN(0.58, 0.61, 'solid', 'silver', 'peacock', 1.0),
        PN(0.42, 0.58, 'moonglass_opal', 'jade', 'sky', 0.16, down=0.42),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_kaftan', TOP, ANKLE + 0.08 if sex == 'f' else KNEE - 0.04, 0.022, kaf_p,
                              n=48, rows=22, hang_from=WAIST + 0.01, flare=0.22,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('jade', 0.03, [B('top', 0.0, 0.010, 'solid', 'silver'),
                                                        B('bottom', 0.0, 0.010, 'solid', 'moonglass')],
                                         fabric='cloth.silk'), high=0.038))
    parts_t.extend(button_row(gid_t, TOP - 0.025, WAIST + 0.04, n_buttons=5,
                              paint=P('silver', 0.02, fabric='metal.iron'), ease=0.022))
    sash_p = P('yuniyellow', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'silver'),
        B('bottom', 0.0, 0.010, 'solid', 'silver'),
    ], [PN(0.0, 1.0, 'diamonds', 'jade', 'yuniyellow', 0.04)], fabric='cloth.silk')
    parts_t.extend(sash_with_tail(gid_t, sash_p, sash_p, ease=0.023, tail=0.14))

    # Hip Yuni pocket-voltmeter dial
    d_vm = np.array([-0.75, -0.66, 0.0])
    d_vm /= np.linalg.norm(d_vm)
    p_vm = surface_out(spine_at(WAIST - 0.012), d_vm, 0.023, bvh=core.BVH_T)
    parts_t.append(rosette(gid_t + '_pocket_voltmeter', p_vm, d_vm, FRONT, 0.026,
                           P('ivory', 0.01, [B('top', 0.0, 0.010, 'solid', 'silver'),
                                             B('bottom', 0.0, 0.010, 'solid', 'turq')], fabric='metal.iron'),
                           n=12, thick=0.010, rigid_joint='Hips'))
    sl_p = P('peacock', 0.03, [
        B('bottom', 0.0, 0.025, 'solid', 'silver'),
        B('bottom', 0.025, 0.080, 'trencadis', 'yuniyellow', 'jade', 0.045),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Qiblai Yuni Envoy Caldera-Silk Kaftan & Pocket-Voltmeter',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Signet-ringed silk gloves
    gid_g = f'xexp_{sex}_yuni_gloves'
    entries.append(assemble_garment(
        gid_g, 'Qiblai Yuni Envoy Signet-Ringed Silk Gloves', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('peacock', 0.03, [B('top', 0.0, 0.016, 'solid', 'silver')], fabric='cloth.silk'),
            P('ivory', 0.03, fabric='cloth.silk'),
            ring_p=P('jade', 0.02, [B('top', 0.0, 0.008, 'solid', 'silver')], fabric='metal.iron')
        )
    ))

    # 4. LEGS: Tailored caldera silk under-trousers (kept cleanly inside kaftan skirt at rest & run)
    gid_l = f'xexp_{sex}_yuni_trousers'
    leg_p = P('sky', 0.03, [
        B('bottom', 0.0, 0.045, 'trencadis', 'silver', 'peacock', 0.04),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_l, 'Qiblai Yuni Breathable Caldera-Silk Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.012, ease_end=0.012), legged=True))

    # 5. FEET: Upturned silver-piped court boots
    gid_f = f'xexp_{sex}_yuni_boots'
    entries.append(assemble_garment(
        gid_f, 'Qiblai Yuni Envoy Silver-Piped Court Boots', 'feet', culture,
        boots(gid_f, P('slate', 0.05, [B('bottom', 0.0, 0.014, 'solid', 'silver')]),
              P('slateblue', 0.03, [B('top', 0.0, 0.035, 'stripes', 'silver', 'jade', 0.016),
                                    B('bottom', 0.0, 0.020, 'solid', 'silver')], fabric='leather.polished'),
              top=0.44, ease_top=0.030)
    ))

    # 6. BACK: Silk treaty-cylinder + Chancellor's Turquoise-Enamel Safe-Conduct Seal
    gid_b = f'xexp_{sex}_yuni_treaty'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.015), d_bk, 0.021, bvh=core.BVH_T)
    sat_c = back_a + d_bk * 0.045
    parts_b.append(_box(gid_b + '_envoy_case', sat_c, d_bk, 0.21, 0.25, 0.082,
                        P('slateblue', 0.04, [B('top', 0.0, 0.02, 'solid', 'silver'),
                                              B('bottom', 0.0, 0.02, 'solid', 'silver')], fabric='leather.polished'),
                        rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_treaty_cylinder',
                        [sat_c + np.array([-0.145, 0.025, 0.145]), sat_c + np.array([0.145, 0.025, 0.145])],
                        0.034, P('peacock', 0.03, [B('top', 0.0, 0.035, 'solid', 'silver'),
                                                   B('bottom', 0.0, 0.035, 'solid', 'silver')],
                                 [PN(0.15, 0.85, 'xanadu_mosaic', 'turq', 'peacock', 0.08)], fabric='cloth.silk'),
                        n=14, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_chancellor_seal', sat_c + d_bk * 0.046, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.044, P('turq', 0.02, [B('top', 0.0, 0.015, 'solid', 'silver'),
                                                   B('bottom', 0.0, 0.015, 'solid', 'jade')],
                                    fabric='beads.glass'),
                           n=14, thick=0.012, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('slateblue', 0.04, [B('top', 0.0, 0.008, 'solid', 'silver')],
                                        fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, "Qiblai Yuni Silk Treaty-Cylinder & Chancellor's Turquoise Seal",
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# B2. `xan_geo_concession` — Qiblai Geomancer Oilfield Concession Engineer (`geo.oilfield` ~300)
# ===========================================================================================================
def _build_b2_xan_geo_concession(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Ventilated copper-mesh brow-rig + flip-up Lightwall moonglass & crystal-opal loupe goggles (F/F)
    gid_h = f'xexp_{sex}_geocon_goggles'
    rig_p = P('nahhascopper', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'brass'),
        B('bottom', 0.0, 0.008, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'net_mesh', 'brass', 'nahhascopper', 0.035)], fabric='metal.bronze')
    parts_h = [crown_band(gid_h + '_copper_brow_rig', rig_p, f0=0.56, f1=0.72, ease=0.009, flare=0.003, rows=5, n=36)]
    parts_h.extend(_goggles(
        gid_h, False,
        P('leather', 0.04, fabric='leather.polished'),
        P('nahhascopper', 0.02, fabric='metal.bronze'),
        P('brass', 0.02, fabric='metal.bronze'),
        P('moonglass', 0.01, [B('top', 0.0, 0.008, 'moonglass_opal', 'turq', 'lacrose', 0.03)],
          fabric='glass.moonglass.leaded'),
        over=0.014, host_parts=parts_h, f_override=0.64
    ))
    entries.append(assemble_garment(gid_h, 'Qiblai Oilfield Copper-Mesh Brow-Rig & Moonglass Loupe Goggles',
                                    'head', culture, parts_h, covers_hair=False, covers_face=False))

    # 2. TORSO: Short-sleeved tropical-caldera waxed silk-canvas topographic coat w/ Qiblai 8-spoke stencil
    gid_t = f'xexp_{sex}_geocon_coat'
    parts_t = []
    coat_p = P('olive', 0.05, [
        B('top', 0.0, 0.020, 'solid', 'brass'),
        B('bottom', 0.0, 0.032, 'solid', 'soot'),
    ], [
        PN(0.0, 1.0, 'topographic_strata', 'godteal', 'olive', 0.26),
        # Qiblai 8-spoke Prismarchy concession stencil on front chest & back
        PN(0.38, 0.62, 'tocharian_wheel', 'saffron', 'olive', 0.20, down=0.30),
    ], fabric='cloth.canvas.oiled')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, CROTCH - 0.08, 0.017, coat_p,
                              n=46, rows=18, hang_from=WAIST - 0.02, flare=0.09,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar(gid_t + '_collar', P('ochre', 0.04, [B('top', 0.0, 0.008, 'solid', 'godteal')],
                                               fabric='cloth.canvas.oiled'), height=0.030, flare=0.012, ease=0.020, open_front=True))
    parts_t.extend(button_row(gid_t, CHEST + 0.04, WAIST - 0.02, n_buttons=4,
                              paint=P('brass', 0.02, fabric='metal.bronze'), ease=0.021))
    belt_p = P('soot', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass'),
                              B('bottom', 0.0, 0.008, 'solid', 'brass')], fabric='leather.polished')
    parts_t.extend(pouch_belt(gid_t, belt_p, P('leather', 0.04, [B('top', 0.0, 0.02, 'solid', 'brass')],
                                               fabric='leather.polished'), ease=0.024))
    # Glass crude-oil hydrometer vial at right hip
    d_hy = np.array([-0.78, -0.62, 0.0])
    d_hy /= np.linalg.norm(d_hy)
    p_hy = surface_out(spine_at(WAIST - 0.015), d_hy, 0.024, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_oil_hydrometer',
                        [p_hy + np.array([0.0, 0.0, 0.048]), p_hy - np.array([0.0, 0.0, 0.048])],
                        0.013, P('soot', 0.01, [B('top', 0.0, 0.025, 'solid', 'amber'),
                                                B('bottom', 0.0, 0.015, 'solid', 'brass')],
                                 fabric='glass.moonglass.leaded'),
                        n=10, rigid_joint='Hips'))
    sl_p = P('olive', 0.05, [B('bottom', 0.0, 0.032, 'solid', 'ochre')], fabric='cloth.canvas.oiled')
    parts_t.extend(sleeves(gid_t, 'elbow', 0.017, sl_p, ease_end=0.025, rows=6))
    entries.append(assemble_garment(gid_t, 'Qiblai Geomancer Waxed Topographic Concession Coat & Hydrometer',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Oil-resistant gauntlets
    gid_g = f'xexp_{sex}_geocon_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Qiblai Concession Oil-Resistant Drilling Gauntlets', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('soot', 0.04, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='rubber.tyre'),
            P('charcoal', 0.04, fabric='rubber.tyre')
        )
    ))

    # 4. LEGS: Oil-stained canvas trousers
    gid_l = f'xexp_{sex}_geocon_trousers'
    leg_p = P('khaki', 0.06, [
        B('bottom', 0.0, 0.095, 'salt_frost_alkali', 'soot', 'umber', 0.08),
    ], fabric='cloth.weave.twill')
    entries.append(assemble_garment(gid_l, 'Qiblai Oil-Stained Canvas Concession Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.017, ease_end=0.013), legged=True))

    # 5. FEET: Steel-toed derrick boots
    gid_f = f'xexp_{sex}_geocon_boots'
    entries.append(assemble_garment(
        gid_f, 'Qiblai Oilfield Steel-Toed Derrick Boots', 'feet', culture,
        boots(gid_f, P('soot', 0.06, fabric='rubber.tyre'),
              P('umber', 0.05, [B('top', 0.0, 0.03, 'solid', 'brass'),
                                B('bottom', 0.0, 0.035, 'solid', 'steel')], fabric='leather.polished'),
              top=0.45, ease_top=0.031)
    ))

    # 6. BACK: 70/20/10 Royal Oil-Metering Manifold Pack + Sultanate 20%-Royalty Brass Valve-Key
    gid_b = f'xexp_{sex}_geocon_manifold'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    man_c = back_a + d_bk * 0.046
    parts_b.append(_box(gid_b + '_manifold_chassis', man_c, d_bk, 0.23, 0.26, 0.085,
                        P('nahhascopper', 0.03, [B('top', 0.0, 0.025, 'solid', 'brass'),
                                                 B('bottom', 0.0, 0.025, 'solid', 'brass')], fabric='metal.bronze'),
                        rigid_joint='Spine2'))
    # Three graduated 70 / 20 / 10 oil-metering sight-glass columns across outer chassis
    for idx_m, (xm, h_col, col_m) in enumerate((
        (-0.068, 0.115, 'amber'),
        (0.0,    0.082, 'gold'),
        (0.068,  0.058, 'godteal'),
    )):
        mc = man_c + np.array([xm, 0.050, -0.115 + h_col])
        parts_b.append(tube(f'{gid_b}_meter_pipe_{idx_m}',
                            [mc + np.array([0.0, 0.0, h_col]), mc - np.array([0.0, 0.0, h_col])],
                            0.019, P(col_m, 0.02, [B('top', 0.0, 0.02, 'solid', 'brass'),
                                                   B('bottom', 0.0, 0.02, 'solid', 'soot')],
                                     fabric='glass.moonglass.leaded'),
                            n=12, rigid_joint='Spine2'))
    # Sultanate 20%-Royalty Brass T-Handle Valve-Key strapped on right side
    vk_top = man_c + np.array([0.125, 0.015, 0.165])
    parts_b.append(tube(gid_b + '_royalty_valve_shaft',
                        [man_c + np.array([0.125, 0.015, -0.145]), vk_top],
                        0.010, P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_royalty_valve_tbar',
                        [vk_top - np.array([0.048, 0.0, 0.0]), vk_top + np.array([0.048, 0.0, 0.0])],
                        0.011, P('gold', 0.02, fabric='metal.gold'), n=8, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, belt_p))
    entries.append(assemble_garment(gid_b, 'Qiblai 70/20/10 Royal Oil-Metering Manifold & 20% Valve-Key',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# B3. `xan_izani_banker` — Strongbow & Erehwon Izani Treaty-Factor & Banker (*Getmastarz* / *Goldanda* Serai)
# ===========================================================================================================
def _build_b3_xan_izani_banker(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE, ANKLE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    a, b, up, bk, left, _, f_eyes, _, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Izani patrician velvet skiadion tower_hat edged w/ Xanadu snow-leopard fur + moonglass assay-monocle
    gid_h = f'xexp_{sex}_banker_hat'
    from ..types.headgear import head_landmarks_exact
    _, _, _, _, _, _, f_eyes_ex, _, _, x_eye_ex = head_landmarks_exact()
    parts_h = []
    ski_p = P('plum', 0.03, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'paisley_vine', 'gold', 'crimson', 0.12)], fabric='cloth.velvet.cut')
    parts_h.append(tower_hat(gid_h + '_skiadion', 0.165,
                             lambda s: 0.94 + 0.18 * math.sin(s * math.pi * 0.82),
                             ski_p, f=0.60, ease=0.020, rows=10, n=36))
    sl_fur = P('snowleopard', 0.08, [
        B('bottom', 0.0, 0.015, 'solid', 'charcoal'),
    ], [PN(0.0, 1.0, 'snowleopard_pelage', 'charcoal', 'snowleopard', 0.10)], fabric='fur.sable.sheared')
    parts_h.append(crown_band(gid_h + '_leopard_brim', sl_fur, f0=0.58, f1=0.77, ease=0.022, flare=0.010, rows=6, n=36))

    # Worn right-eye moonglass assay-monocle: centered directly over right eye (`x_eye_ex, f_eyes_ex`).
    # Measure outer orbital-rim depth (`core.BP_GL` max Z_gl within 22mm of eye center) rather than
    # `first_hit(p_sock, d_eye)`, which passes through the open palpebral fissure and hits the back
    # of the socket behind `Human.low-poly` (cornea) and `Human.eyelashes*`.
    c_eye = a + (b - a) * f_eyes_ex
    p_sock = c_eye - left * x_eye_ex
    d_eye = -bk - left * 0.02
    d_eye /= np.linalg.norm(d_eye)
    bp_gl = core.BP_GL
    rim_mask = ((bp_gl[:, 0] - p_sock[0]) ** 2 + (bp_gl[:, 1] - p_sock[2]) ** 2 <= 0.022 ** 2) & (bp_gl[:, 2] > 0.05)
    z_orb_rim = float(bp_gl[rim_mask, 2].max()) if rim_mask.any() else float(-(p_sock + d_eye * 0.135)[1])
    t_rim = (z_orb_rim + float(p_sock[1])) / max(-float(d_eye[1]), 1e-6)
    p_m0 = p_sock + d_eye * (t_rim - 0.002)
    p_m1 = p_sock + d_eye * (t_rim + 0.008)
    parts_h.append(tube(gid_h + '_monocle_rim', [p_m0, p_m1], 0.021,
                        P('gold', 0.02, fabric='metal.gold'), n=18, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_monocle_lens', p_sock + d_eye * (t_rim + 0.004), d_eye, left, 0.0185,
                           P('moonglass', 0.01, fabric='glass.moonglass.leaded'),
                           n=16, thick=0.004, rigid_joint='Head'))
    c_hat_r = a + (b - a) * 0.60 - left * 0.092 - bk * 0.025
    parts_h.append(horn(gid_h + '_assay_chain', [
        p_m1 - left * 0.020,
        p_m1 - left * 0.042 - up * 0.018 - d_eye * 0.018,
        c_hat_r,
    ], 0.0035, 0.0035, P('gold', 0.02, fabric='metal.gold'), n=8, rows=8, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Strongbow Izani Velvet Skiadion, Snow-Leopard Brim & Assay Monocle',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Fur-lined Izani senatorial pelisse winterized w/ yak-fleece pelerine (1 Talent = 20 quds border)
    gid_t = f'xexp_{sex}_banker_pelisse'
    parts_t = []
    pel_p = P('crimson', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.028, 0.095, 'arabesque_border', 'gold', 'ebadindigo', 0.07),
    ], [
        PN(0.0, 0.39, 'paisley_vine', 'gold', 'crimson', 0.22),
        PN(0.61, 1.0, 'paisley_vine', 'gold', 'crimson', 0.22),
        PN(0.39, 0.42, 'snowleopard_pelage', 'charcoal', 'snowleopard', 0.08),
        PN(0.58, 0.61, 'snowleopard_pelage', 'charcoal', 'snowleopard', 0.08),
        PN(0.42, 0.58, 'xanadu_sun_wheel', 'gold', 'ebadindigo', 0.20),
    ], fabric='cloth.velvet.cut')
    parts_t.append(torso_tube(gid_t + '_pelisse', TOP, ANKLE + 0.06 if sex == 'f' else KNEE - 0.06, 0.018, pel_p,
                              n=50, rows=22, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar_disc(gid_t + '_fleece_pelerine', 0.088, sl_fur,
                               drop=0.070, rows=8, scallop=0.05, ease=0.021))
    parts_t.append(pauldron(gid_t + '_sh_L', L, sl_fur, reach=0.32, ease=0.024, flare_end=0.96))
    parts_t.append(pauldron(gid_t + '_sh_R', R, sl_fur, reach=0.32, ease=0.024, flare_end=0.96))
    parts_t.extend(_build_chest_chain(gid_t + '_talent_chain', TOP - 0.018, 0.078, 0.145, 0.021,
                                      P('gold', 0.02, fabric='metal.gold'), n_links=31))
    sash_p = P('ebadindigo', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.038, WAIST - 0.038, 0.022, sash_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))
    sl_p = P('crimson', 0.03, [
        B('bottom', 0.0, 0.055, 'snowleopard_pelage', 'charcoal', 'snowleopard', 0.05),
        B('bottom', 0.055, 0.072, 'solid', 'gold'),
    ], fabric='cloth.velvet.cut')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.027, rows=10))
    entries.append(assemble_garment(gid_t, 'Strongbow Izani Banker Snow-Leopard Pelisse & Talent Chain',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Velvet counting gloves
    gid_g = f'xexp_{sex}_banker_gloves'
    entries.append(assemble_garment(
        gid_g, 'Strongbow Izani Velvet Bullion-Counting Gloves', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('plum', 0.03, [B('top', 0.0, 0.016, 'solid', 'gold')], fabric='cloth.velvet.cut'),
            P('crimson', 0.03, fabric='cloth.velvet.cut'),
            ring_p=P('gold', 0.02, fabric='metal.gold')
        )
    ))

    # 4. LEGS: Fine wool serai breeches
    gid_l = f'xexp_{sex}_banker_breeches'
    leg_p = P('ebadindigo', 0.04, [
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Strongbow Izani Fine Indigo Wool Breeches', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.016, ease_end=0.011), legged=True))

    # 5. FEET: Cordovan boots w/ snow-leopard cuffs
    gid_f = f'xexp_{sex}_banker_boots'
    entries.append(assemble_garment(
        gid_f, 'Strongbow Izani Cordovan & Snow-Leopard Boots', 'feet', culture,
        boots(gid_f, P('soot', 0.06, [B('bottom', 0.0, 0.014, 'solid', 'gold')]),
              P('oxblood', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'gold')], fabric='leather.polished'),
              top=0.48, cuff_paint=sl_fur, ease_top=0.032)
    ))

    # 6. BACK: Iron-bound Talent-to-Qud Assay Pack + Strongbow 7-Stage Girder Lift 5%-Toll Pass-Plaque + balance
    gid_b = f'xexp_{sex}_banker_assay'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.015), d_bk, 0.022, bvh=core.BVH_T)
    box_c = back_a + d_bk * 0.052
    parts_b.append(_box(gid_b + '_assay_coffer', box_c, d_bk, 0.24, 0.27, 0.10,
                        P('iron', 0.03, [B('top', 0.0, 0.024, 'solid', 'gold'),
                                         B('bottom', 0.0, 0.024, 'solid', 'gold')],
                          [PN(0.15, 0.85, 'paisley_vine', 'gold', 'plum', 0.12)], fabric='metal.iron'),
                        rigid_joint='Spine2'))
    parts_b.append(_box(gid_b + '_girder_lift_plaque', box_c + np.array([0.0, 0.054, 0.015]), d_bk,
                        0.13, 0.15, 0.016,
                        P('bronze', 0.02, [B('top', 0.0, 0.018, 'solid', 'gold')],
                          [PN(0.10, 0.90, 'stencil<:05', 'gold', 'soot', 0.14)], fabric='metal.bronze'),
                        rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_bullion_balance',
                        [box_c + np.array([-0.135, 0.015, 0.150]), box_c + np.array([0.135, 0.015, 0.150])],
                        0.010, P('gold', 0.02, fabric='metal.gold'), n=8, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('oxblood', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold')],
                                        fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Strongbow Izani Talent-to-Qud Assay Pack & 5% Lift Pass-Plaque',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# B4. `xan_hired_musketeer` — Sultan's Hired Northern Musketeer & Artillerist (Gihon 60, Strongwall 30)
# ===========================================================================================================
def _build_b4_xan_hired_musketeer(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Steel comb-morion wrapped at base w/ Sultanate crimson-and-gold pay-turban scarf
    gid_h = f'xexp_{sex}_musket_morion'
    steel_p = P('steel', 0.02, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'fluted', 'silver', 'steel', 0.07)], fabric='metal.iron')
    scarf_p = P('holyred', 0.03, [
        B('top', 0.0, 0.009, 'solid', 'gold'),
        B('bottom', 0.0, 0.009, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'xanadu_sun_wheel', 'gold', 'holyred', 0.08)], fabric='cloth.silk')
    bowl_pt = sculpted_cranium(gid_h + '_bowl', steel_p, f_top=1.04, f_bot=0.58, ease=0.015, rows=10, n=36)
    parts_h = [
        bowl_pt,
        brim(gid_h + '_morion_brim', 0.60, 0.062, steel_p, ease=0.016, rows=5, n=40, lift=0.028, scallop=0.14),
        crest(gid_h + '_comb', 0.068, steel_p, rows=6, cols=19, sweep=0.015, a0=-0.78, a1=0.86, host_part=bowl_pt),
        crown_band(gid_h + '_pay_scarf', scarf_p, f0=0.58, f1=0.74, ease=0.021, flare=0.006, rows=5, n=36),
    ]
    parts_h[1].rigid_joint = 'Head'
    entries.append(assemble_garment(gid_h, "Sultan's Musketeer Steel Comb-Morion & Crimson-Gold Pay-Scarf",
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Buff-leather & iron half-cuirass over Xanadu quilted silk khatangu + 12-Dinar Gold Medallion + 8 Apostles
    gid_t = f'xexp_{sex}_musket_cuirass'
    parts_t = []
    skirt_p = P('holyred', 0.03, [
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.028, 0.090, 'xanadu_sun_wheel', 'gold', 'mongolblue', 0.075),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'gold', 'holyred', 0.11)], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_khatangu_skirt', WAIST + 0.03, KNEE + 0.02, 0.017, skirt_p,
                              n=48, rows=12, hang_from=WAIST - 0.01, flare=0.15,
                              group_below=CROTCH + 0.02, hull_from=WAIST))
    cuirass_p = P('buck', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'iron'),
        B('bottom', 0.0, 0.030, 'dentils', 'gold', 'buck', 0.04),
    ], [
        PN(0.32, 0.68, 'lamellar_scale', 'steel', 'iron', 0.10),
    ], fabric='leather.buckskin')
    parts_t.append(torso_tube(gid_t + '_half_cuirass', TOP, WAIST - 0.02, 0.020, cuirass_p,
                              n=46, rows=14, hull_from=WAIST))
    parts_t.append(collar(gid_t + '_gorget', P('iron', 0.02, [B('top', 0.0, 0.008, 'solid', 'gold')],
                                               fabric='metal.iron'), height=0.032, flare=0.010, ease=0.021))
    # Day-240 12-Dinar Solid-Gold Pay-Medallion flush at sternum
    p_med = chest_front(CHEST + 0.025, 0.025, x=-0.052)
    parts_t.append(rosette(gid_t + '_pay_medallion', p_med, FRONT, np.array([1.0, 0.0, 0.0]),
                           0.028, P('gold', 0.02, [B('top', 0.0, 0.5, 'xanadu_sun_wheel', 'holyred', 'gold', 0.04)],
                                    fabric='metal.gold'),
                           n=12, thick=0.009, rigid_joint='Spine2'))
    # Diagonal bandolier carrying 8 Wooden Musket-Charge "Apostles" (4 front + 4 back)
    band_p = P('saddle', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='leather.polished')
    parts_t.append(crossed_sash(gid_t + '_apostle_bandolier', band_p, width=0.048, ease=0.024))
    apos_p = P('umber', 0.04, [B('top', 0.0, 0.014, 'solid', 'brass'),
                               B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='leather.polished')
    for ka in range(4):
        ua = ka / 3.0
        zf = (CHEST + 0.040) * (1.0 - ua) + (WAIST + 0.055) * ua
        xf = 0.068 * (1.0 - ua) - 0.058 * ua
        pf = chest_front(zf, 0.026, x=xf)
        parts_t.append(tube(f'{gid_t}_apostle_f_{ka}',
                            [pf + np.array([0.0, 0.0, 0.024]), pf - np.array([0.0, 0.0, 0.024])],
                            0.010, apos_p, n=8, rigid_joint='Spine2'))
        cb = spine_at(zf) + np.array([-xf, 0.0, 0.0])
        hb = (first_hit(cb, d_bk, bvh=core.BVH_T) or 0.095) + 0.026
        pb = cb + d_bk * hb
        parts_t.append(tube(f'{gid_t}_apostle_b_{ka}',
                            [pb + np.array([0.0, 0.0, 0.024]), pb - np.array([0.0, 0.0, 0.024])],
                            0.010, apos_p, n=8, rigid_joint='Spine2'))
    parts_t.extend(sash_with_tail(gid_t, scarf_p, scarf_p, ease=0.023, tail=0.28))
    sl_p = P('buck', 0.05, [
        B('top', 0.25, 0.65, 'vstripes', 'holyred', 'mongolblue', 0.03),
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
    ], fabric='leather.buckskin')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, "Sultan's Musketeer Half-Cuirass, Khatangu & 8-Apostle Bandolier",
                                    'torso', culture, parts_t))

    # 3. GLOVES: Flared matchlock gauntlets
    gid_g = f'xexp_{sex}_musket_gauntlets'
    entries.append(assemble_garment(
        gid_g, "Sultan's Musketeer Flared Matchlock Gauntlets", 'gloves', culture,
        _full_gloves(
            gid_g,
            P('buck', 0.05, [B('top', 0.0, 0.022, 'solid', 'holyred')], fabric='leather.buckskin'),
            P('leather', 0.04, fabric='leather.polished'),
            knuckle_p=P('iron', 0.02, fabric='metal.iron')
        )
    ))

    # 4. LEGS: Slashed Landsknecht/Janissary breeches
    gid_l = f'xexp_{sex}_musket_breeches'
    leg_p = P('mongolblue', 0.04, [
        B('top', 0.15, 0.62, 'vstripes', 'holyred', 'mongolblue', 0.035),
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, "Sultan's Musketeer Slashed Landsknecht-Janissary Breeches",
                                    'legs', culture, trousers(gid_l, leg_p, ease=0.021, ease_end=0.012, bag=0.03),
                                    legged=True))

    # 5. FEET: Folded-cuff riding boots
    gid_f = f'xexp_{sex}_musket_boots'
    entries.append(assemble_garment(
        gid_f, "Sultan's Musketeer Folded-Cuff Artillery Boots", 'feet', culture,
        boots(gid_f, P('soot', 0.06),
              P('saddle', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='leather.polished'),
              top=0.52, cuff_paint=P('buck', 0.05, [B('top', 0.0, 0.015, 'solid', 'holyred')],
                                     fabric='leather.buckskin'),
              ease_top=0.033)
    ))

    # 6. BACK: Artillerist Powder-Flask & Slow-Match Pack + Bronze-Cannon Elevation Quadrant
    gid_b = f'xexp_{sex}_musket_pack'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    pk_c = back_a + d_bk * 0.048
    parts_b.append(_box(gid_b + '_artillerist_pack', pk_c, d_bk, 0.23, 0.26, 0.090,
                        P('buck', 0.05, [B('top', 0.0, 0.025, 'solid', 'iron'),
                                         B('bottom', 0.0, 0.025, 'solid', 'brass')], fabric='leather.buckskin'),
                        rigid_joint='Spine2'))
    # Curved horn powder-flask + glowing-tip hemp slow-match reel + bronze cannon quadrant
    parts_b.append(horn(gid_b + '_powder_flask', [
        pk_c + np.array([-0.085, 0.052, -0.075]),
        pk_c + np.array([-0.045, 0.058, 0.015]),
        pk_c + np.array([0.025, 0.052, 0.085]),
    ], 0.030, 0.009, P('bone', 0.03, [B('top', 0.0, 0.04, 'solid', 'brass'),
                                      B('bottom', 0.0, 0.04, 'solid', 'soot')]),
        n=10, rows=8, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_slow_match_coil', pk_c + np.array([0.065, 0.052, -0.045]),
                           d_bk, np.array([1.0, 0.0, 0.0]), 0.042,
                           P('oat', 0.08, [B('top', 0.0, 0.015, 'solid', 'sunorange')], fabric='cloth.weave.burlap'),
                           n=12, thick=0.014, rigid_joint='Spine2'))
    parts_b.append(fan(gid_b + '_cannon_quadrant', 0.015, 0.095, 0.48,
                       P('bronze', 0.02, [B('top', 0.0, 0.015, 'dentils', 'soot', 'gold', 0.02)],
                         fabric='metal.bronze'),
                       rows=6, cols=11, curl=0.0, center=pk_c + np.array([0.045, 0.052, 0.040]),
                       up_vec=np.array([0.0, 0.0, 1.0]), side_vec=np.array([1.0, 0.0, 0.0]),
                       rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, band_p))
    entries.append(assemble_garment(gid_b, 'Artillerist Horn Powder-Flask, Slow-Match & Bronze Quadrant Pack',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# B5. `xan_dalab_envoy` — Thalaba Dalab Genepriest Grove-Envoy (`dalab.thalaba` ~30, 46% Caravan Share)
# ===========================================================================================================
def _build_b5_xan_dalab_envoy(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, ANKLE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.ANKLE
    a, b, up, bk, left, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Open-crown Brass & Moonglass Solar-Reflector Halo-Mitre (F/F — crown open to sun!)
    gid_h = f'xexp_{sex}_dalab_halo'
    diadem_p = P('bronze', 0.02, [
        B('top', 0.0, 0.010, 'dentils', 'gold', 'emerald', 0.03),
        B('bottom', 0.0, 0.010, 'solid', 'emerald'),
    ], [PN(0.32, 0.68, 'dalab_solar_weave', 'gold', 'emerald', 0.09)], fabric='metal.bronze')
    halo_p = P('moonglass', 0.02, [
        B('top', 0.0, 0.018, 'solid', 'bronze'),
        B('bottom', 0.0, 0.014, 'solid', 'emerald'),
    ], [PN(0.0, 1.0, 'moonglass_greenhouse', 'bronze', 'moonglass', 0.08)], fabric='glass.moonglass.leaded')
    mitre_band = crown_band(gid_h + '_open_mitre_band', diadem_p, f0=0.56, f1=0.76, ease=0.011, flare=0.008, rows=6, n=40)
    # Build solar reflector halo rooted directly into `mitre_band`'s upper rim (0.0mm air gap + 5 bronze spoke struts!)
    c_halo_ref = a + (b - a) * 0.72
    n_hcols, n_hrows = 19, 7
    h_angs = np.linspace(-1.12, 1.12, n_hcols)
    halo_roots, halo_dirs = [], []
    top_rim_pts = mitre_band.P[0]
    for ha in h_angs:
        d_rad = left * math.sin(ha) + up * math.cos(ha) + bk * 0.10
        d_rad /= np.linalg.norm(d_rad)
        # Find exact point on `mitre_band` upper rim matching lateral azimuth around temples/crown
        d_az = left * math.sin(ha) - bk * (0.28 * math.cos(ha))
        if np.linalg.norm(d_az) < 1e-5:
            d_az = -bk
        d_az /= np.linalg.norm(d_az)
        rel_rim = top_rim_pts - c_halo_ref[None, :]
        best_i = int(np.argmax((rel_rim[:, 0] * d_az[0] + rel_rim[:, 1] * d_az[1])))
        root_pt = top_rim_pts[best_i] - d_rad * 0.004 - up * 0.005
        halo_roots.append(root_pt)
        halo_dirs.append(d_rad)
    halo_grid = []
    span_halo = 0.095
    for ri_h in range(n_hrows):
        u_out_h = 1.0 - ri_h / float(n_hrows - 1)
        halo_grid.append([
            rt + dr * (span_halo * u_out_h) - bk * (0.012 * (u_out_h ** 2))
            for rt, dr in zip(halo_roots, halo_dirs)
        ])
    halo_part = Part(gid_h + '_solar_halo', np.array(halo_grid), False, ['body'] * n_hrows, halo_p, rigid_joint='Head')
    parts_h = [mitre_band, halo_part]
    strut_p = P('bronze', 0.02, [B('top', 0.0, 0.010, 'solid', 'gold')], fabric='metal.bronze')
    for si_h in (2, 5, 9, 13, 16):
        parts_h.append(horn(
            f'{gid_h}_halo_strut_{si_h}',
            [halo_roots[si_h] - up * 0.012, halo_roots[si_h] + halo_dirs[si_h] * (span_halo * 0.96)],
            0.0055, 0.0035, strut_p, n=8, rows=5, rigid_joint='Head'
        ))
    c_br = a + (b - a) * 0.65
    h_br = (first_hit(c_br, -bk) or 0.098) + 0.016
    parts_h.extend(_as(eye_disc(gid_h + '_solar_eye', c_br - bk * h_br, -bk, 0.052,
                                P('gold', 0.02, fabric='metal.gold'),
                                P('godteal', 0.01, fabric='glass.moonglass.leaded')), 'headgear'))
    for pt_e in parts_h[-2:]:
        pt_e.rigid_joint = 'Head'
    entries.append(assemble_garment(gid_h, 'Thalaba Dalab Open-Crown Moonglass Solar-Reflector Halo-Mitre',
                                    'head', culture, parts_h, covers_hair=False, covers_face=False))

    # 2. TORSO: Photosynthetic Highland Hybrid Robe (maroon yak-wool + framed Lightwall moonglass greenhouse panels)
    gid_t = f'xexp_{sex}_dalab_robe'
    parts_t = []
    robe_p = P('omaroon', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'bronze'),
        B('bottom', 0.0, 0.030, 'solid', 'gold'),
        B('bottom', 0.030, 0.115, 'dalab_solar_weave', 'gold', 'emerald', 0.09),
    ], [
        # Framed translucent Lightwall moonglass greenhouse chest & upper-back skylight panels
        PN(0.36, 0.64, 'moonglass_greenhouse', 'bronze', 'moonglass', 0.14, down=0.34),
        PN(0.0, 0.14, 'moonglass_greenhouse', 'bronze', 'moonglass', 0.14, down=0.28),
        PN(0.86, 1.0, 'moonglass_greenhouse', 'bronze', 'moonglass', 0.14, down=0.28),
        PN(0.42, 0.58, 'dalab_solar_weave', 'gold', 'emerald', 0.22),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_hybrid_robe', TOP, ANKLE + 0.06, 0.017, robe_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.17,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar_disc(gid_t + '_greenhouse_collar', 0.078, halo_p,
                               drop=0.064, rows=8, scallop=0.05, ease=0.020))
    parts_t.append(pauldron(gid_t + '_skylight_sh_L', L, halo_p, reach=0.34, ease=0.023, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_skylight_sh_R', R, halo_p, reach=0.34, ease=0.023, flare_end=0.98))

    # 3D Bronze greenhouse glazing mullions flush across chest solar window
    rib_p = P('bronze', 0.02, fabric='metal.bronze')
    for xr in (-0.065, 0.0, 0.065):
        r_pts = [chest_front(zz, 0.021, x=xr) for zz in np.linspace(TOP - 0.025, WAIST + 0.05, 7)]
        parts_t.append(horn(f'{gid_t}_glaze_rib_{xr:+.2f}', r_pts, 0.005, 0.005, rib_p,
                            n=8, rows=7, rigid_joint='Spine2', role='trinket'))

    sash_p = P('emerald', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.038, WAIST - 0.038, 0.021, sash_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))
    # 3 Cold/altitude bio-graft ampoules at left front waist
    amp_p = P('mint', 0.01, [B('top', 0.0, 0.012, 'solid', 'gold'),
                             B('bottom', 0.0, 0.012, 'solid', 'gold')], fabric='glass.moonglass.leaded')
    for ka, xa in enumerate((0.045, 0.072, 0.098)):
        pa = chest_front(WAIST - 0.005, 0.024, x=xa)
        parts_t.append(tube(f'{gid_t}_biograft_ampoule_{ka}',
                            [pa + np.array([0.0, 0.0, 0.026]), pa - np.array([0.0, 0.0, 0.026])],
                            0.009, amp_p, n=8, rigid_joint='Hips'))
    sl_p = P('omaroon', 0.05, [
        B('top', 0.15, 0.55, 'moonglass_greenhouse', 'bronze', 'moonglass', 0.06),
        B('bottom', 0.0, 0.045, 'dalab_solar_weave', 'gold', 'emerald', 0.045),
    ], fabric=WOOL)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Thalaba Dalab Moonglass-Greenhouse Highland Yak-Wool Robe',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Solar-windowed wrist-warmers (fingerless)
    gid_g = f'xexp_{sex}_dalab_warmers'
    e_g = assemble_garment(
        gid_g, 'Thalaba Dalab Solar-Windowed Wrist-Warmers', 'gloves', culture,
        _fingerless_gloves(gid_g, halo_p, P('emerald', 0.04, [B('bottom', 0.0, 0.01, 'solid', 'gold')], fabric=WOOL))
    )
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # 4. LEGS: Quilted highland wool trousers
    gid_l = f'xexp_{sex}_dalab_trousers'
    leg_p = P('emerald', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'omaroon', 'emerald', 0.11)], fabric='cloth.quilted.diamond')
    entries.append(assemble_garment(gid_l, 'Thalaba Dalab Quilted Emerald & Maroon Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.017, ease_end=0.012), legged=True))

    # 5. FEET: Felt-and-cork Thalaba grove boots
    gid_f = f'xexp_{sex}_dalab_boots'
    entries.append(assemble_garment(
        gid_f, 'Thalaba Dalab Yak-Felt & Cork-Sole Boots', 'feet', culture,
        boots(gid_f, P('sand', 0.07, fabric='leather.buckskin'),
              P('omaroon', 0.05, [B('top', 0.0, 0.035, 'dalab_solar_weave', 'gold', 'emerald', 0.035),
                                  B('bottom', 0.0, 0.025, 'solid', 'bronze')], fabric='cloth.felt.boiled'),
              top=0.46, ease_top=0.031)
    ))

    # 6. BACK: Heated Moonglass Hearth-Seed Incubator Cask + Godshearth 10%-Cut Royal Seal
    gid_b = f'xexp_{sex}_dalab_cask'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    csk_c = back_a + d_bk * 0.062
    parts_b.append(blob(gid_b + '_charcoal_pan', back_a + d_bk * 0.014, (0.19, 0.048, 0.24),
                        P('bronze', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'sunorange')], fabric='metal.bronze'),
                        n=14, rows=5, out=d_bk, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_seed_incubator',
                        [csk_c + np.array([0.0, 0.0, 0.145]), csk_c - np.array([0.0, 0.0, 0.145])],
                        0.062, halo_p, n=18, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_cask_cap_top', csk_c + np.array([0.0, 0.0, 0.148]), (0.128, 0.128, 0.038),
                        diadem_p, n=16, rows=5, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_cask_cap_bot', csk_c - np.array([0.0, 0.0, 0.148]), (0.128, 0.128, 0.038),
                        diadem_p, n=16, rows=5, out=np.array([0.0, 0.0, -1.0]), rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_godshearth_seal', csk_c + d_bk * 0.064, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.036, P('gold', 0.02, [B('top', 0.0, 0.5, 'xanadu_sun_wheel', 'holyred', 'gold', 0.04)],
                                    fabric='metal.gold'),
                           n=12, thick=0.010, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('emerald', 0.04, [B('top', 0.0, 0.008, 'solid', 'bronze')],
                                        fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Thalaba Dalab Heated Moonglass Seed-Incubator & 10% Royal Seal',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# B6. `xan_glazier_steward` — Laitwal *Mara* Glazier Opal-Factor & Loj Steward (`0.94` pale big-eyed morph)
# ===========================================================================================================
def _build_b6_xan_glazier_steward(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Xanadu silk turban wound over clear-opal goggles + cabochon Rift Black Opal brooch
    gid_h = f'xexp_{sex}_gsteward_turban'
    turb_p = P('alecappurple', 0.03, [
        B('bottom', 0.0, 0.020, 'cholet_pangden', 'lacrose', 'turq', 0.045),
        B('top', 0.0, 0.022, 'solid', 'stewardorange'),
    ], [PN(0.0, 1.0, 'glazier_vein_register', 'moonglass', 'alecappurple', 0.14)], fabric='cloth.silk')
    fold_p = P('ebadindigo', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'moonglass'),
        B('bottom', 0.0, 0.008, 'solid', 'stewardorange'),
    ], [PN(0.0, 1.0, 'cholet_pangden', 'lacrose', 'turq', 0.05)], fabric='cloth.silk')
    parts_h = [
        tower_hat(gid_h + '_turban', 0.150,
                  lambda s: 0.96 + 0.17 * math.sin(s * math.pi * 0.78) - 0.10 * (s ** 2.0),
                  turb_p, f=0.52, ease=0.020, rows=10, n=36),
        crown_band(gid_h + '_turban_wrap', fold_p, f0=0.50, f1=0.76, ease=0.023, flare=0.009, rows=6, n=36),
    ]
    parts_h.extend(_goggles(
        gid_h, False,
        P('taupe', 0.04, fabric='leather.buckskin'),
        P('buck', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass')], fabric='leather.buckskin'),
        P('brass', 0.02, fabric='metal.bronze'),
        P('moonglass', 0.01, [B('top', 0.0, 0.008, 'moonglass_opal', 'cybercyan', 'lacrose', 0.03)],
          fabric='glass.moonglass.leaded'),
        over=0.024, host_parts=parts_h
    ))
    c_br = a + (b - a) * (f_brow + 0.22)
    h_br = (first_hit(c_br, -bk) or 0.100) + 0.029
    p_op = c_br - bk * h_br
    parts_h.append(rosette(gid_h + '_opal_bezel', p_op, -bk, up, 0.025,
                           P('silver', 0.02, fabric='metal.iron'), n=12, thick=0.008, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_rift_black_opal', p_op - bk * 0.006, (0.030, 0.014, 0.036),
                        P('soot', 0.01, [B('top', 0.15, 0.85, 'moonglass_opal', 'cybercyan', 'lacrose', 0.03)],
                          fabric='beads.glass'),
                        n=12, rows=5, out=-bk, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Laitwal Glazier-Steward Silk Turban, Opal Goggles & Black Opal Brooch',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Alecap-purple & indigo silk coat w/ cholet lozenges + Tungang Steward faded-orange glass-bead sash
    gid_t = f'xexp_{sex}_gsteward_coat'
    parts_t = []
    coat_p = P('alecappurple', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'orderblue'),
        B('bottom', 0.0, 0.028, 'solid', 'stewardorange'),
        B('bottom', 0.028, 0.095, 'cholet_pangden', 'lacrose', 'turq', 0.06),
    ], [
        PN(0.0, 0.42, 'glazier_vein_register', 'moonglass', 'alecappurple', 0.20),
        PN(0.58, 1.0, 'glazier_vein_register', 'moonglass', 'alecappurple', 0.20),
        PN(0.42, 0.58, 'cholet_pangden', 'saffron', 'ebadindigo', 0.14),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.02, 0.016, coat_p,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('ebadindigo', 0.03, [B('top', 0.0, 0.010, 'solid', 'stewardorange')],
                                         fabric='cloth.silk'), high=0.036))

    # Tungang Steward's faded-orange (#c8783e / stewardorange) ground-glass-bead sash!
    steward_sash = P('stewardorange', 0.04, [
        B('top', 0.0, 0.012, 'beads', 'brucitewhite', 'silver', 0.014),
        B('bottom', 0.0, 0.012, 'beads', 'brucitewhite', 'silver', 0.014),
    ], [PN(0.0, 1.0, 'beads', 'moonglass', 'stewardorange', 0.022)], fabric='beads.glass')
    parts_t.extend(sash_with_tail(gid_t, steward_sash, steward_sash, ease=0.020, tail=0.30))

    # Three Order-Blue enamel vein badges on left breast + brass Opal-Chip Click-Wheel at hip
    enam_p = P('orderblue', 0.01, [B('top', 0.0, 0.012, 'solid', 'brucitewhite'),
                                   B('bottom', 0.0, 0.008, 'solid', 'brass')], fabric='beads.glass')
    for kb, (xb, zb) in enumerate(((0.055, 0.032), (0.088, 0.032), (0.072, -0.004))):
        parts_t.append(rosette(f'{gid_t}_vein_badge_{kb}', chest_front(CHEST + zb, 0.022, x=xb),
                               FRONT, np.array([1.0, 0.0, 0.0]), 0.015, enam_p,
                               n=12, thick=0.006, rigid_joint='Spine2'))
    d_cw = np.array([-0.78, -0.62, 0.0])
    d_cw /= np.linalg.norm(d_cw)
    p_cw = surface_out(spine_at(WAIST - 0.01), d_cw, 0.023, bvh=core.BVH_T)
    parts_t.append(rosette(gid_t + '_opal_click_wheel', p_cw, d_cw, FRONT, 0.030,
                           P('brass', 0.02, [B('top', 0.0, 0.5, 'xanadu_sun_wheel', 'moonglass', 'orderblue', 0.04)],
                             fabric='metal.bronze'),
                           n=16, thick=0.010, rigid_joint='Hips'))
    sl_p = P('ebadindigo', 0.03, [
        B('bottom', 0.0, 0.065, 'cholet_pangden', 'lacrose', 'turq', 0.045),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.025, rows=10))
    entries.append(assemble_garment(gid_t, 'Laitwal Glazier-Steward Alecap-Purple Coat & Steward-Orange Bead Sash',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Fingerless fungus-leather & silk gloves
    gid_g = f'xexp_{sex}_gsteward_gloves'
    e_g = assemble_garment(
        gid_g, 'Laitwal Glazier-Steward Fingerless Fungus-Leather & Silk Gloves', 'gloves', culture,
        _fingerless_gloves(
            gid_g,
            P('alecappurple', 0.03, [B('top', 0.0, 0.015, 'beads', 'brucitewhite', 'stewardorange', 0.016)],
              fabric='cloth.silk'),
            P('taupe', 0.05, fabric='leather.buckskin')
        )
    )
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # 4. LEGS: Indigo silk trousers
    gid_l = f'xexp_{sex}_gsteward_trousers'
    leg_p = P('ebadindigo', 0.03, [
        B('bottom', 0.0, 0.05, 'cholet_pangden', 'lacrose', 'turq', 0.04),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_l, 'Laitwal Glazier-Steward Indigo Silk Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.018, ease_end=0.014), legged=True))

    # 5. FEET: Upturned Laitwal boots
    gid_f = f'xexp_{sex}_gsteward_boots'
    entries.append(assemble_garment(
        gid_f, 'Laitwal Glazier-Steward Upturned Tyre-Sole Boots', 'feet', culture,
        boots(gid_f, P('soot', 0.06, fabric='rubber.tyre'),
              P('alecappurple', 0.04, [B('top', 0.0, 0.035, 'cholet_pangden', 'stewardorange', 'turq', 0.03),
                                       B('bottom', 0.0, 0.020, 'solid', 'brass')], fabric='leather.polished'),
              top=0.45, ease_top=0.031)
    ))

    # 6. BACK: Timetable of the Train That Never Comes satchel + Order-Blue Enamel Vein-Register Plaque
    gid_b = f'xexp_{sex}_gsteward_satchel'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.015), d_bk, 0.021, bvh=core.BVH_T)
    sat_c = back_a + d_bk * 0.048
    parts_b.append(_box(gid_b + '_timetable_satchel', sat_c, d_bk, 0.24, 0.27, 0.092,
                        P('taupe', 0.05, [B('top', 0.0, 0.028, 'solid', 'stewardorange'),
                                          B('bottom', 0.0, 0.022, 'solid', 'brass')], fabric='leather.buckskin'),
                        rigid_joint='Spine2'))
    parts_b.append(_box(gid_b + '_vein_register_plaque', sat_c + np.array([0.0, 0.050, 0.010]), d_bk,
                        0.15, 0.14, 0.016,
                        P('orderblue', 0.01, [B('top', 0.0, 0.015, 'solid', 'brucitewhite'),
                                              B('bottom', 0.0, 0.015, 'solid', 'brass')],
                          [PN(0.10, 0.90, 'stencil<:47', 'brucitewhite', 'orderblue', 0.14)], fabric='beads.glass'),
                        rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('taupe', 0.05, [B('top', 0.0, 0.008, 'solid', 'stewardorange')],
                                        fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Laitwal Glazier Timetable Satchel & Order-Blue Vein-Register Plaque',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# B7. `xan_glazier_cutter` — Laitwal *Mara* Potch-Delver & Moonglass Cutter (`kits/tungang/PLAN.md` 1.5)
# ===========================================================================================================
def _build_b7_xan_glazier_cutter(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Lime-white work turban over clear-opal goggles drawn across nose/mouth against silica "prism-lung" (T/T)
    gid_h = f'xexp_{sex}_gcutter_turban'
    lime_p = P('saltlime', 0.05, [
        B('bottom', 0.0, 0.022, 'cholet_pangden', 'lacrose', 'turq', 0.045),
        B('top', 0.0, 0.018, 'solid', 'brucitewhite'),
    ], fabric=COTTON)
    parts_h = [
        turban(gid_h + '_work_turban', lime_p, f0=0.48, f1=1.06, bulge=0.036, ease=0.018),
        sculpted_faceplate(gid_h + '_silica_veil', lime_p, f_top=0.42, f_bot=-0.05,
                           ease=0.013, span=0.45, rows=12, cols=21),
    ]
    parts_h.extend(_goggles(
        gid_h, True,
        P('taupe', 0.05, fabric='leather.buckskin'),
        P('shroudoat', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass')], fabric='leather.buckskin'),
        P('brass', 0.02, fabric='metal.bronze'),
        P('moonglass', 0.01, fabric='glass.moonglass.leaded'),
        over=0.006
    ))
    entries.append(assemble_garment(gid_h, 'Laitwal Cutter Lime-White Silica-Veil Turban & Opal Goggles',
                                    'head', culture, parts_h, covers_hair=True, covers_face=True))

    # 2. TORSO: Hearth-waxed canvas long coat + pale fungus-leather glass-cutter's apron + amber lamp badge
    gid_t = f'xexp_{sex}_gcutter_coat'
    parts_t = []
    coat_p = P('charcoal', 0.05, [
        B('bottom', 0.0, 0.030, 'solid', 'saltlime'),
    ], [
        PN(0.48, 0.52, 'buttons', 'brass', 'charcoal', 0.08, down=0.36),
    ], fabric='cloth.canvas.oiled')
    parts_t.append(torso_tube(gid_t + '_wax_coat', TOP, KNEE - 0.04, 0.016, coat_p,
                              n=46, rows=20, hang_from=WAIST - 0.02, flare=0.11,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar(gid_t + '_collar', P('charcoal', 0.04, [B('top', 0.0, 0.008, 'solid', 'amber')],
                                               fabric='cloth.canvas.oiled'), height=0.030, flare=0.010, ease=0.019))
    apron_p = P('shroudoat', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'taupe'),
        B('bottom', 0.0, 0.028, 'cholet_pangden', 'lacrose', 'turq', 0.05),
    ], [PN(0.15, 0.85, 'quilt', 'taupe', 'shroudoat', 0.12)], fabric='leather.buckskin')
    parts_t.extend(tabard(gid_t + '_cutter_apron', KNEE + 0.06, CHEST + 0.02, apron_p,
                          width=0.28, ease=0.023, front=True, back=False))
    parts_t.append(band(gid_t + '_apron_halter', CHEST + 0.02, SHOULDER + 0.012, 0.022, 0.025,
                        P('taupe', 0.05, fabric='leather.buckskin'), high=0.0, rows=3))

    # Amber lamp-code work badge at right collar + tool belt strictly outside apron (ease=0.036 > 0.023!)
    parts_t.append(rosette(gid_t + '_amber_lamp_badge', chest_front(TOP - 0.035, 0.024, x=-0.052),
                           FRONT, np.array([1.0, 0.0, 0.0]), 0.016,
                           P('amber', 0.01, [B('bottom', 0.0, 0.006, 'solid', 'brass')], fabric='beads.glass'),
                           n=12, thick=0.006, rigid_joint='Spine2'))
    belt_p = P('taupe', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass'),
                               B('bottom', 0.0, 0.008, 'solid', 'brass')], fabric='leather.buckskin')
    parts_t.extend(pouch_belt(gid_t, belt_p,
                              P('yakbrown', 0.05, [B('top', 0.0, 0.02, 'solid', 'lacrose')], fabric='leather.buckskin'),
                              ease=0.036))
    # Potch-slicing diamond knife at right hip
    d_kn = np.array([-0.88, -0.46, 0.0])
    d_kn /= np.linalg.norm(d_kn)
    p_kn = surface_out(spine_at(WAIST - 0.02), d_kn, 0.042, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_potch_knife',
                        [p_kn + np.array([0.0, 0.0, 0.045]), p_kn - np.array([0.0, 0.0, 0.085])],
                        0.009, P('steel', 0.02, [B('top', 0.0, 0.035, 'solid', 'amber')], fabric='metal.iron'),
                        n=8, rigid_joint='Hips'))
    sl_p = P('charcoal', 0.05, [
        B('bottom', 0.0, 0.045, 'cholet_pangden', 'lacrose', 'turq', 0.04),
    ], fabric='cloth.canvas.oiled')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.026, rows=9))
    entries.append(assemble_garment(gid_t, 'Laitwal Cutter Waxed Coat, Fungus-Leather Apron & Potch Knife',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Fingerless fungus-leather gloves (bare fingertips feel potch veins!)
    gid_g = f'xexp_{sex}_gcutter_gloves'
    e_g = assemble_garment(
        gid_g, 'Laitwal Cutter Fingerless Fungus-Leather Potch Gloves', 'gloves', culture,
        _fingerless_gloves(
            gid_g,
            P('charcoal', 0.04, [B('top', 0.0, 0.016, 'cholet_pangden', 'lacrose', 'turq', 0.03)],
              fabric='cloth.canvas.oiled'),
            P('shroudoat', 0.05, fabric='leather.buckskin')
        )
    )
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # 4. LEGS: Silica-dusted wax-cloth trousers
    gid_l = f'xexp_{sex}_gcutter_trousers'
    leg_p = P('slate', 0.05, [
        B('top', 0.34, 0.52, 'quilt', 'saltlime', 'taupe', 0.06),
        B('bottom', 0.0, 0.045, 'salt_frost_alkali', 'brucitewhite', 'slate', 0.06),
    ], fabric='cloth.canvas.oiled')
    entries.append(assemble_garment(gid_l, 'Laitwal Cutter Silica-Dusted Wax-Cloth Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.017, ease_end=0.012), legged=True))

    # 5. FEET: Tarn-wet rubber-soled boots
    gid_f = f'xexp_{sex}_gcutter_boots'
    entries.append(assemble_garment(
        gid_f, 'Laitwal Cutter Tarn-Wet Tyre-Sole Boots', 'feet', culture,
        boots(gid_f, P('soot', 0.06, fabric='rubber.tyre'),
              P('charcoal', 0.05, [B('top', 0.0, 0.03, 'solid', 'shroudoat'),
                                   B('bottom', 0.0, 0.025, 'solid', 'saltlime')], fabric='cloth.canvas.oiled'),
              top=0.46, ease_top=0.031)
    ))

    # 6. BACK: Moonglass Pane-Cradle & Copper Tarn-Water Wet-Drill Flask
    gid_b = f'xexp_{sex}_gcutter_cradle'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    crd_c = back_a + d_bk * 0.046
    parts_b.append(_box(gid_b + '_timber_cradle', crd_c, d_bk, 0.24, 0.28, 0.082,
                        P('umber', 0.05, [B('top', 0.0, 0.025, 'solid', 'nahhascopper'),
                                          B('bottom', 0.0, 0.025, 'solid', 'nahhascopper')], fabric='leather.buckskin'),
                        rigid_joint='Spine2'))
    pane_p = P('moonglass', 0.01, [
        B('top', 0.0, 0.018, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.018, 'solid', 'nahhascopper'),
    ], [PN(0.08, 0.92, 'moonglass_greenhouse', 'nahhascopper', 'moonglass', 0.08)],
        fabric='glass.moonglass.leaded')
    parts_b.append(_box(gid_b + '_moonglass_pane', crd_c + np.array([-0.02, 0.052, 0.020]), d_bk,
                        0.18, 0.24, 0.024, pane_p, rigid_joint='Spine2'))
    fl_c = crd_c + np.array([0.118, 0.025, -0.015])
    parts_b.append(tube(gid_b + '_tarn_wet_flask',
                        [fl_c + np.array([0.0, 0.0, 0.095]), fl_c - np.array([0.0, 0.0, 0.095])],
                        0.024, P('nahhascopper', 0.02, [B('top', 0.0, 0.02, 'solid', 'brass'),
                                                        B('bottom', 0.0, 0.02, 'solid', 'turq')],
                                 fabric='metal.bronze'),
                        n=12, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, belt_p))
    entries.append(assemble_garment(gid_b, 'Laitwal Cutter Moonglass Pane-Cradle & Tarn-Water Wet-Drill Flask',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# B8. `xan_saffron_prismarch` — Qiblai Saffron-Spoke Prismarch & Strongbow Balloon-Scholar (`qb.order`)
# ===========================================================================================================
def _build_b8_xan_saffron_prismarch(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, ANKLE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.ANKLE
    a, b, up, bk, left, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Eight-spoked Saffron & Order-Blue Pandita mitre-hat w/ Rainbow-Decree jewel rosette
    gid_h = f'xexp_{sex}_prismarch_mitre'
    mitre_p = P('osaffron', 0.04, [
        B('bottom', 0.0, 0.022, 'solid', 'orderblue'),
        B('top', 0.0, 0.026, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'tocharian_wheel', 'gold', 'osaffron', 0.14)], fabric='cloth.silk')
    lappet_p = P('orderblue', 0.04, [B('bottom', 0.0, 0.018, 'solid', 'osaffron')], fabric='cloth.silk')
    parts_h = [
        tower_hat(gid_h + '_pandita_mitre', 0.180,
                  lambda s: 0.98 * (1.0 - 0.52 * (s ** 1.85)),
                  mitre_p, f=0.52, ease=0.020, rows=11, n=36),
        wing(gid_h + '_lappet_L', 1.0, 0.020, 0.115, lappet_p, rows=6, cols=7, rise=-0.03, curl=0.02, f=0.46),
        wing(gid_h + '_lappet_R', -1.0, 0.020, 0.115, lappet_p, rows=6, cols=7, rise=-0.03, curl=0.02, f=0.46),
    ]
    c_br = a + (b - a) * (f_brow + 0.16)
    h_br = (first_hit(c_br, -bk) or 0.100) + 0.026
    parts_h.append(rosette(gid_h + '_rainbow_rosette', c_br - bk * h_br, -bk, up, 0.030,
                           P('gold', 0.02, [B('top', 0.0, 0.5, 'tocharian_wheel', 'godteal', 'lacrose', 0.04)],
                             fabric='metal.gold'),
                           n=8, thick=0.009, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Qiblai Saffron-Prismarch Pandita Mitre & Rainbow-Decree Rosette',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Tropical-weight Qiblai chuba (asymmetrical osaffron sleeve vs orderblue/omaroon brocade)
    gid_t = f'xexp_{sex}_prismarch_chuba'
    parts_t = []
    chuba_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.028, 'solid', 'orderblue'),
        B('bottom', 0.028, 0.105, 'tocharian_wheel', 'gold', 'orderblue', 0.08),
    ], [
        PN(0.0, 0.44, 'saffron_kesa', 'gold', 'osaffron', 0.22),
        PN(0.56, 1.0, 'tocharian_wheel', 'gold', 'orderblue', 0.22),
        PN(0.44, 0.56, 'tocharian_wheel', 'osaffron', 'omaroon', 0.18),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_chuba', TOP, ANKLE + 0.06, 0.015, chuba_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.17,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('orderblue', 0.03, [B('top', 0.0, 0.010, 'solid', 'osaffron')],
                                         fabric='cloth.silk'), high=0.034))
    # Asymmetrical sleeves: Right luminous osaffron silk, Left orderblue/omaroon Prismarchy brocade
    parts_t.append(sleeve(gid_t + '_sleeve_R', R,
                          P('osaffron', 0.03, [B('bottom', 0.0, 0.055, 'saffron_kesa', 'gold', 'orderblue', 0.04)],
                            fabric='cloth.silk'),
                          f0=0.0, f1=0.92, ease=0.017, flare=0.012, rows=10, n=22))
    parts_t.append(sleeve(gid_t + '_sleeve_L', L,
                          P('orderblue', 0.03, [B('bottom', 0.0, 0.055, 'tocharian_wheel', 'gold', 'omaroon', 0.04)],
                            fabric='cloth.silk'),
                          f0=0.0, f1=0.92, ease=0.017, flare=0.012, rows=10, n=22))
    cord_sash = P('orderblue', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], fabric='cloth.silk')
    parts_t.extend(sash_with_tail(gid_t, cord_sash, cord_sash, ease=0.020, tail=0.30))
    # Three-Evidentials seal beads (jade, turquoise, amber) flush on front sash
    for ke, (xe, col_e) in enumerate(((-0.038, 'jade'), (0.0, 'godteal'), (0.038, 'amber'))):
        parts_t.append(blob(f'{gid_t}_evidential_seal_{ke}', chest_front(WAIST - 0.005, 0.023, x=xe),
                            (0.022, 0.014, 0.026), P(col_e, 0.01, fabric='beads.glass'),
                            n=10, rows=4, out=FRONT, rigid_joint='Hips'))
    entries.append(assemble_garment(gid_t, 'Qiblai Saffron-Prismarch Asymmetrical Chuba & 3-Evidentials Sash',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Ink-stained scholar cuffs (fingerless)
    gid_g = f'xexp_{sex}_prismarch_cuffs'
    e_g = assemble_garment(
        gid_g, 'Qiblai Saffron-Prismarch Ink-Stained Scholar Cuffs', 'gloves', culture,
        _fingerless_gloves(
            gid_g,
            P('orderblue', 0.03, [B('top', 0.0, 0.016, 'solid', 'osaffron'),
                                  B('bottom', 0.0, 0.016, 'solid', 'gold')], fabric='cloth.silk'),
            P('soot', 0.04, [B('top', 0.0, 0.01, 'solid', 'osaffron')], fabric='cloth.silk')
        )
    )
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # 4. LEGS: Monastic silk trousers
    gid_l = f'xexp_{sex}_prismarch_trousers'
    leg_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.045, 'solid', 'osaffron'),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_l, 'Qiblai Saffron-Prismarch Monastic Silk Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.018, ease_end=0.014), legged=True))

    # 5. FEET: Gilt-piped Tibetan-Xanadu boots
    gid_f = f'xexp_{sex}_prismarch_boots'
    entries.append(assemble_garment(
        gid_f, 'Qiblai Saffron-Prismarch Gilt-Piped Sanctum Boots', 'feet', culture,
        boots(gid_f, P('gold', 0.03, fabric='metal.gold'),
              P('omaroon', 0.04, [B('top', 0.0, 0.04, 'stripes', 'osaffron', 'orderblue', 0.016),
                                  B('bottom', 0.0, 0.02, 'solid', 'gold')], fabric=WOOL),
              top=0.48, ease_top=0.031)
    ))

    # 6. BACK: Strongbow Hot-Air Balloon Barometer & Scroll Case + Glazier Crystal-Opal Seeing-Mirror
    gid_b = f'xexp_{sex}_prismarch_barometer'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.021, bvh=core.BVH_T)
    bar_c = back_a + d_bk * 0.046
    parts_b.append(_box(gid_b + '_scholar_case', bar_c, d_bk, 0.21, 0.27, 0.082,
                        P('orderblue', 0.04, [B('top', 0.0, 0.025, 'solid', 'gold'),
                                              B('bottom', 0.0, 0.025, 'solid', 'osaffron')], fabric='leather.polished'),
                        rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_balloon_barometer',
                        [bar_c + np.array([-0.068, 0.050, 0.155]), bar_c + np.array([-0.068, 0.050, -0.145])],
                        0.022, P('brass', 0.02, [B('top', 0.15, 0.85, 'stripes', 'moonglass', 'brass', 0.02)],
                                 fabric='metal.bronze'),
                        n=12, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_opal_seeing_mirror', bar_c + np.array([0.045, 0.052, 0.015]),
                           d_bk, np.array([1.0, 0.0, 0.0]), 0.056,
                           P('moonglass', 0.01, [
                               B('top', 0.0, 0.016, 'solid', 'bronze'),
                               B('bottom', 0.0, 0.016, 'moonglass_opal', 'cybercyan', 'lacrose', 0.04),
                           ], fabric='glass.moonglass.leaded'),
                           n=16, thick=0.010, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('omaroon', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold')],
                                        fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Strongbow Balloon-Barometer Case & Glazier Crystal-Opal Mirror',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# B9. `xan_pearl_comprador` — Pleasure-Dome Hykkousoi Ring-Sea Pearl-Comprador (Erehwon Bazaar — 5x Pearl)
# ===========================================================================================================
def _build_b9_xan_pearl_comprador(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE, ANKLE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    a, b, up, bk, _, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Nacre-inlaid Hykkousoi conical turban-mitre + damp mist-veil
    gid_h = f'xexp_{sex}_pearl_mitre'
    nacre_p = P('nacre', 0.02, [
        B('bottom', 0.0, 0.020, 'beads', 'nacrepink', 'gold', 0.02),
        B('top', 0.0, 0.024, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'wave', 'peacock', 'nacre', 0.09)], fabric='shell.nacre')
    veil_p = P('nacregreen', 0.03, [
        B('bottom', 0.0, 0.025, 'beads', 'nacre', 'peacock', 0.025),
    ], fabric='cloth.silk')
    parts_h = [
        tower_hat(gid_h + '_nacre_mitre', 0.165,
                  lambda s: 0.98 * (1.0 - 0.55 * (s ** 1.6)),
                  nacre_p, f=0.52, ease=0.020, rows=10, n=36),
        _as(hood(gid_h + '_mist_veil', veil_p, ease=0.022, ease_low=0.044,
                 open_front=1.08, high=0.72), 'headgear'),
    ]
    c_br = a + (b - a) * (f_brow + 0.15)
    h_br = (first_hit(c_br, -bk) or 0.100) + 0.026
    parts_h.append(blob(gid_h + '_king_pearl', c_br - bk * h_br, (0.030, 0.022, 0.034),
                        P('nacrepink', 0.01, fabric='shell.nacre'), n=12, rows=5, out=-bk, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Hykkousoi Pearl-Comprador Nacre Turban-Mitre & Mist-Veil',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Highland Gill-Hydration Vestment (perforated brass & damp-silk gill-humidifier collar + pearl chain)
    gid_t = f'xexp_{sex}_pearl_vestment'
    parts_t = []
    vest_p = P('peacock', 0.03, [
        B('top', 0.0, 0.022, 'beads', 'nacre', 'gold', 0.022),
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.028, 0.105, 'xanadu_mosaic', 'nacre', 'deepsea', 0.075),
    ], [
        PN(0.14, 0.39, 'wave', 'nacregreen', 'peacock', 0.18),
        PN(0.61, 0.86, 'wave', 'nacregreen', 'peacock', 0.18),
        PN(0.39, 0.61, 'xanadu_mosaic', 'nacrepink', 'deepsea', 0.18),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_vestment', TOP, ANKLE + 0.06 if sex == 'f' else KNEE - 0.04, 0.016, vest_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.18,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    # Perforated brass & damp-silk Gill-Humidifier Collar + 4 flush clavicle/rib mist pods
    gill_col_p = P('nacregreen', 0.03, [
        B('top', 0.0, 0.014, 'dots', 'soot', 'brass', 0.016),
        B('bottom', 0.0, 0.018, 'beads', 'nacre', 'brass', 0.020),
    ], fabric='metal.bronze')
    parts_t.append(collar(gid_t + '_gill_neck_collar', gill_col_p, height=0.036, flare=0.010, ease=0.020))
    parts_t.append(collar_disc(gid_t + '_gill_humidifier', 0.082, gill_col_p,
                               drop=0.068, rows=8, scallop=0.06, ease=0.020))
    pod_p = P('brass', 0.02, [B('top', 0.0, 0.5, 'dots', 'soot', 'brass', 0.012)], fabric='metal.bronze')
    for kp, (xp, zp) in enumerate(((-0.072, CHEST + 0.055), (0.072, CHEST + 0.055),
                                   (-0.082, CHEST - 0.010), (0.082, CHEST - 0.010))):
        parts_t.append(rosette(f'{gid_t}_gill_mist_pod_{kp}', chest_front(zp, 0.022, x=xp),
                               FRONT, np.array([1.0, 0.0, 0.0]), 0.018, pod_p,
                               n=10, thick=0.008, rigid_joint='Spine2'))
    # Graded Ring-Sea pearl sorter-chain draped flush on chest
    parts_t.extend(_build_chest_chain(gid_t + '_pearl_sorter', TOP - 0.015, 0.082, 0.155, 0.020,
                                      P('nacre', 0.01, fabric='shell.nacre'), n_links=33))
    sash_p = P('deepsea', 0.03, [
        B('top', 0.0, 0.012, 'beads', 'nacre', 'gold', 0.02),
        B('bottom', 0.0, 0.012, 'beads', 'nacrepink', 'gold', 0.02),
    ], fabric='cloth.silk')
    parts_t.extend(sash_with_tail(gid_t, sash_p, sash_p, ease=0.021, tail=0.30))
    sl_p = P('peacock', 0.03, [
        B('bottom', 0.0, 0.065, 'wave', 'nacre', 'deepsea', 0.045),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.027, rows=10))
    entries.append(assemble_garment(gid_t, 'Hykkousoi Pearl-Comprador Gill-Humidifier Vestment & Sorter-Chain',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Velvet pearl-grading gloves
    gid_g = f'xexp_{sex}_pearl_gloves'
    entries.append(assemble_garment(
        gid_g, 'Hykkousoi Black-Velvet Pearl-Grading Gloves', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('deepsea', 0.03, [B('top', 0.0, 0.018, 'beads', 'nacre', 'gold', 0.018)], fabric='cloth.velvet.cut'),
            P('velvet', 0.02, fabric='cloth.velvet.cut'),
            ring_p=P('nacrepink', 0.01, fabric='shell.nacre')
        )
    ))

    # 4. LEGS: Sea-silk trousers
    gid_l = f'xexp_{sex}_pearl_trousers'
    leg_p = P('nacregreen', 0.03, [
        B('bottom', 0.0, 0.05, 'wave', 'nacre', 'deepsea', 0.04),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_l, 'Hykkousoi Shimmering Sea-Silk Salvar Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.013, ease_end=0.012), legged=True))

    # 5. FEET: Pearl-buckled bazaar boots
    gid_f = f'xexp_{sex}_pearl_boots'
    parts_f = boots(
        gid_f, P('deepsea', 0.05, [B('bottom', 0.0, 0.014, 'solid', 'gold')]),
        P('deepsea', 0.03, [B('top', 0.0, 0.035, 'beads', 'nacre', 'gold', 0.02),
                            B('bottom', 0.0, 0.02, 'solid', 'gold')], fabric='leather.polished'),
        top=0.44, ease_top=0.030
    )
    for s in (L, R):
        sgn = 1.0 if s == L else -1.0
        ft = J(s + 'Foot')
        parts_f.append(rosette(f'{gid_f}_pearl_buckle_{s[0]}',
                               np.array([ft[0] + 0.044 * sgn, ft[1] - 0.030, max(0.038, float(ft[2]) * 0.55)]),
                               np.array([sgn, 0.0, 0.0]), np.array([0.0, 1.0, 0.0]), 0.016,
                               P('nacre', 0.01, fabric='shell.nacre'), n=10, thick=0.006, rigid_joint=s + 'Foot'))
    entries.append(assemble_garment(gid_f, 'Hykkousoi Deep-Sea Leather & Pearl-Buckled Boots',
                                    'feet', culture, parts_f))

    # 6. BACK: Velvet-lined Nacre Clam-Shell Casket + Rosewater Gill-Atomizer Bulb
    gid_b = f'xexp_{sex}_pearl_casket'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.015), d_bk, 0.021, bvh=core.BVH_T)
    clam_c = back_a + d_bk * 0.052
    clam_p = P('nacre', 0.02, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'fluted', 'nacrepink', 'nacre', 0.06)], fabric='shell.nacre')
    parts_b.append(blob(gid_b + '_clam_casket', clam_c, (0.26, 0.11, 0.27), clam_p,
                        n=18, rows=7, out=d_bk, rigid_joint='Spine2'))
    bulb_c = clam_c + np.array([0.115, 0.015, 0.085])
    parts_b.append(blob(gid_b + '_atomizer_bulb', bulb_c, (0.068, 0.068, 0.085),
                        P('lacrose', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='rubber.tyre'),
                        n=12, rows=5, out=np.array([1.0, 0.0, 0.0]), rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_atomizer_nozzle',
                        [bulb_c + np.array([0.0, 0.0, 0.038]), bulb_c + np.array([-0.045, -0.020, 0.095])],
                        0.009, P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('deepsea', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold')],
                                        fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Hykkousoi Nacre Clam-Shell Casket & Rosewater Gill-Atomizer',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# B10. `xan_citadel_envoy` — Erehwon Citadel Envoys' House Eternian / Yusar Minister (`xa_cit_envoys`)
# ===========================================================================================================
def _build_b10_xan_citadel_envoy(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, ANKLE = core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.ANKLE
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'xanadu_expats'
    entries = []

    # 1. HEAD: Eternian winged futou court cap in pierced bronze filigree w/ flip-up snow-goggles
    gid_h = f'xexp_{sex}_citadel_futou'
    futou_p = P('repblack', 0.02, [
        B('bottom', 0.0, 0.018, 'solid', 'bronze'),
        B('top', 0.0, 0.022, 'solid', 'celadon'),
    ], [PN(0.0, 1.0, 'circuit_schematic', 'celadon', 'repblack', 0.12)], fabric='cloth.silk')
    wing_p = P('bronze', 0.02, [
        B('top', 0.0, 0.010, 'solid', 'celadon'),
        B('bottom', 0.0, 0.010, 'solid', 'repblack'),
    ], [PN(0.0, 1.0, 'circuit_schematic', 'gold', 'bronze', 0.06)], fabric='metal.bronze')
    parts_h = [
        tower_hat(gid_h + '_futou', 0.150, lambda s: 0.96 + 0.06 * math.sin(s * math.pi),
                  futou_p, f=0.52, ease=0.019, rows=10, n=36),
        wing(gid_h + '_filigree_wing_L', 1.0, 0.125, 0.038, wing_p, rows=5, cols=9, rise=0.015, curl=0.015, f=0.66),
        wing(gid_h + '_filigree_wing_R', -1.0, 0.125, 0.038, wing_p, rows=5, cols=9, rise=0.015, curl=0.015, f=0.66),
    ]
    parts_h.extend(_goggles(
        gid_h, False,
        P('repblack', 0.03, fabric='leather.polished'),
        P('bronze', 0.02, fabric='metal.bronze'),
        P('bronze', 0.02, fabric='metal.bronze'),
        P('moonglass', 0.01, fabric='glass.moonglass.leaded'),
        over=0.021, host_parts=parts_h
    ))
    entries.append(assemble_garment(gid_h, 'Citadel Eternian Bronze-Filigree Winged Futou & Snow-Goggles',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Celadon & black-lacquer circuit-maze court robe + white-fox/yak pelerine + Hall-of-Gifts sash
    gid_t = f'xexp_{sex}_citadel_robe'
    parts_t = []
    robe_p = P('repblack', 0.03, [
        B('top', 0.0, 0.024, 'solid', 'celadon'),
        B('bottom', 0.0, 0.030, 'solid', 'bronze'),
        B('bottom', 0.030, 0.110, 'xanadu_mosaic', 'celadon', 'repblack', 0.085),
    ], [
        PN(0.0, 0.38, 'circuit_schematic', 'celadon', 'repblack', 0.22),
        PN(0.62, 1.0, 'circuit_schematic', 'celadon', 'repblack', 0.22),
        PN(0.38, 0.62, 'xanadu_mosaic', 'porcelain', 'celadon', 0.20),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_court_robe', TOP, ANKLE + 0.06, 0.017, robe_p,
                              n=50, rows=22, hang_from=WAIST - 0.02, flare=0.17,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    fox_p = P('lilywhite', 0.08, [
        B('bottom', 0.0, 0.020, 'snowleopard_pelage', 'charcoal', 'snowleopard', 0.08),
    ], fabric='fur.sable.sheared')
    parts_t.append(collar_disc(gid_t + '_fox_pelerine', 0.086, fox_p,
                               drop=0.068, rows=8, scallop=0.05, ease=0.021))
    parts_t.append(pauldron(gid_t + '_fox_sh_L', L, fox_p, reach=0.31, ease=0.024, flare_end=0.96))
    parts_t.append(pauldron(gid_t + '_fox_sh_R', R, fox_p, reach=0.31, ease=0.024, flare_end=0.96))

    # Sultan's Hall-of-Gifts diplomatic sash + jade Hall-of-Audience tally-tablet + Yusar induction cell-loupe
    gifts_sash = P('pomegranate', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'xanadu_sun_wheel', 'gold', 'pomegranate', 0.07)], fabric='cloth.silk')
    parts_t.append(band(gid_t + '_hall_of_gifts_sash', WAIST + 0.01, SHOULDER + 0.012, 0.052, 0.022,
                        gifts_sash, high=math.pi * 0.45, rows=5))
    parts_t.append(torso_tube(gid_t + '_obi_belt', WAIST + 0.038, WAIST - 0.038, 0.021,
                              P('celadon', 0.03, [B('top', 0.0, 0.01, 'solid', 'bronze'),
                                                  B('bottom', 0.0, 0.01, 'solid', 'bronze')], fabric='cloth.silk'),
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))
    d_tab = np.array([0.76, -0.65, 0.0])
    d_tab /= np.linalg.norm(d_tab)
    p_tab = surface_out(spine_at(WAIST - 0.015), d_tab, 0.024, bvh=core.BVH_T)
    parts_t.append(_box(gid_t + '_jade_tally_tablet', p_tab - np.array([0.0, 0.0, 0.045]), d_tab,
                        0.046, 0.115, 0.012,
                        P('jade', 0.02, [B('top', 0.0, 0.018, 'solid', 'gold')], fabric='beads.glass'),
                        rigid_joint='Hips'))
    d_lp = np.array([-0.76, -0.65, 0.0])
    d_lp /= np.linalg.norm(d_lp)
    p_lp = surface_out(spine_at(WAIST - 0.015), d_lp, 0.024, bvh=core.BVH_T)
    parts_t.append(rosette(gid_t + '_induction_loupe', p_lp, d_lp, FRONT, 0.026,
                           P('cybercyan', 0.01, [B('top', 0.0, 0.012, 'solid', 'bronze')],
                             fabric='glass.moonglass.leaded'),
                           n=12, thick=0.010, rigid_joint='Hips'))
    sl_p = P('repblack', 0.03, [
        B('bottom', 0.0, 0.075, 'circuit_schematic', 'celadon', 'bronze', 0.05),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.028, rows=10, wide=True))
    entries.append(assemble_garment(gid_t, 'Citadel Eternian Celadon Circuit-Maze Robe & Fox Pelerine',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Jade-splinted court cuffs (fingerless)
    gid_g = f'xexp_{sex}_citadel_cuffs'
    e_g = assemble_garment(
        gid_g, 'Citadel Eternian Jade-Splinted Black-Lacquer Court Cuffs', 'gloves', culture,
        _fingerless_gloves(
            gid_g,
            P('repblack', 0.02, [B('top', 0.0, 0.016, 'solid', 'bronze'),
                                 B('bottom', 0.0, 0.018, 'solid', 'jade')],
              [PN(0.0, 1.0, 'vstripes', 'jade', 'repblack', 0.025)], fabric='leather.polished'),
            P('celadon', 0.03, fabric='cloth.silk')
        )
    )
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # 4. LEGS: Quilted silk trousers
    gid_l = f'xexp_{sex}_citadel_trousers'
    leg_p = P('repblack', 0.03, [
        B('bottom', 0.0, 0.045, 'solid', 'celadon'),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'celadon', 'repblack', 0.11)], fabric='cloth.quilted.diamond')
    entries.append(assemble_garment(gid_l, 'Citadel Eternian Quilted Lacquer & Celadon Silk Trousers',
                                    'legs', culture, trousers(gid_l, leg_p, ease=0.018, ease_end=0.013), legged=True))

    # 5. FEET: Lacquer platform court boots
    gid_f = f'xexp_{sex}_citadel_boots'
    entries.append(assemble_garment(
        gid_f, 'Citadel Eternian White-Soled Lacquer Platform Boots', 'feet', culture,
        boots(gid_f, P('lilywhite', 0.04, fabric='leather.polished'),
              P('repblack', 0.02, [B('top', 0.0, 0.035, 'circuit_schematic', 'celadon', 'bronze', 0.03),
                                   B('bottom', 0.0, 0.022, 'solid', 'celadon')], fabric='leather.polished'),
              top=0.46, ease_top=0.031)
    ))

    # 6. BACK: Diplomatic Celadon Tribute & Yusar Cell-Assay Case
    gid_b = f'xexp_{sex}_citadel_case'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.015), d_bk, 0.021, bvh=core.BVH_T)
    cs_c = back_a + d_bk * 0.050
    parts_b.append(_box(gid_b + '_lacquer_case', cs_c, d_bk, 0.24, 0.28, 0.095,
                        P('repblack', 0.02, [B('top', 0.0, 0.024, 'solid', 'bronze'),
                                             B('bottom', 0.0, 0.024, 'solid', 'bronze')],
                          [PN(0.12, 0.88, 'xanadu_mosaic', 'celadon', 'repblack', 0.12)], fabric='leather.polished'),
                        rigid_joint='Spine2'))
    # Celadon porcelain tribute vase on left + Yusar cyan vacuum-cell assay cylinder on right
    vase_c = cs_c + np.array([0.052, 0.052, -0.010])
    parts_b.append(blob(gid_b + '_celadon_vase', vase_c, (0.085, 0.065, 0.145),
                        P('celadon', 0.01, [B('top', 0.0, 0.02, 'solid', 'porcelain')], fabric='beads.glass'),
                        n=14, rows=6, out=d_bk, rigid_joint='Spine2'))
    yus_c = cs_c + np.array([-0.055, 0.052, 0.010])
    parts_b.append(tube(gid_b + '_yusar_assay_cell',
                        [yus_c + np.array([0.0, 0.0, 0.085]), yus_c - np.array([0.0, 0.0, 0.085])],
                        0.021, P('cybercyan', 0.01, [B('top', 0.0, 0.022, 'solid', 'bronze'),
                                                     B('bottom', 0.0, 0.022, 'solid', 'bronze')],
                                 fabric='glass.moonglass.leaded'),
                        n=12, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('repblack', 0.03, [B('top', 0.0, 0.008, 'solid', 'bronze')],
                                        fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Citadel Diplomatic Celadon Tribute & Yusar Cell-Assay Case',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# GROUP B ENTRY POINT & TIER OUTFIT MAP
# ===========================================================================================================
GROUP_B_TIER_META = [
    ('xan_yuni_envoy', 0.10, 'Qiblai Yuni Diplomatic Factor & Guild Envoy (yuni.mission)',
     'yuni_kalpak', 'yuni_kaftan', 'yuni_gloves', 'yuni_trousers', 'yuni_boots', 'yuni_treaty', False, 'yuni'),
    ('xan_geo_concession', 0.12, 'Qiblai Geomancer Oilfield Concession Engineer (geo.oilfield)',
     'geocon_goggles', 'geocon_coat', 'geocon_gauntlets', 'geocon_trousers', 'geocon_boots', 'geocon_manifold', False, 'geomancers'),
    ('xan_izani_banker', 0.10, 'Strongbow & Erehwon Izani Treaty-Factor & Banker (Serai)',
     'banker_hat', 'banker_pelisse', 'banker_gloves', 'banker_breeches', 'banker_boots', 'banker_assay', False, 'izani'),
    ('xan_hired_musketeer', 0.12, "Sultan's Hired Northern Musketeer & Artillerist (Gihon / Strongwall)",
     'musket_morion', 'musket_cuirass', 'musket_gauntlets', 'musket_breeches', 'musket_boots', 'musket_pack', False, 'iron_republic'),
    ('xan_dalab_envoy', 0.09, 'Thalaba Dalab Genepriest Grove-Envoy (dalab.thalaba)',
     'dalab_halo', 'dalab_robe', 'dalab_warmers', 'dalab_trousers', 'dalab_boots', 'dalab_cask', False, 'dalabites'),
    ('xan_glazier_steward', 0.10, 'Laitwal Mara Glazier Opal-Factor & Loj Steward (0.94 Scale)',
     'gsteward_turban', 'gsteward_coat', 'gsteward_gloves', 'gsteward_trousers', 'gsteward_boots', 'gsteward_satchel', False, 'glaziers'),
    ('xan_glazier_cutter', 0.11, 'Laitwal Mara Potch-Delver & Moonglass Cutter (0.94 Scale)',
     'gcutter_turban', 'gcutter_coat', 'gcutter_gloves', 'gcutter_trousers', 'gcutter_boots', 'gcutter_cradle', True, 'glaziers'),
    ('xan_saffron_prismarch', 0.10, 'Qiblai Saffron-Spoke Prismarch & Strongbow Balloon-Scholar',
     'prismarch_mitre', 'prismarch_chuba', 'prismarch_cuffs', 'prismarch_trousers', 'prismarch_boots', 'prismarch_barometer', False, 'historians'),
    ('xan_pearl_comprador', 0.08, 'Pleasure-Dome Hykkousoi Ring-Sea Pearl-Comprador (Erehwon)',
     'pearl_mitre', 'pearl_vestment', 'pearl_gloves', 'pearl_trousers', 'pearl_boots', 'pearl_casket', False, 'hykkousoi'),
    ('xan_citadel_envoy', 0.08, "Erehwon Citadel Envoys' House Eternian / Yusar Minister",
     'citadel_futou', 'citadel_robe', 'citadel_cuffs', 'citadel_trousers', 'citadel_boots', 'citadel_case', False, 'eternian'),
]


def build_xanadu_expats_kit():
    """Compile all 120 Group B (`xexp_{m|f}_*`) procedural pieces across `mpfb_male` and `mpfb_female`."""
    _install_caravaneer_motifs()
    builders = (
        _build_b1_xan_yuni_envoy,
        _build_b2_xan_geo_concession,
        _build_b3_xan_izani_banker,
        _build_b4_xan_hired_musketeer,
        _build_b5_xan_dalab_envoy,
        _build_b6_xan_glazier_steward,
        _build_b7_xan_glazier_cutter,
        _build_b8_xan_saffron_prismarch,
        _build_b9_xan_pearl_comprador,
        _build_b10_xan_citadel_envoy,
    )
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        for fn in builders:
            entries.extend(fn(sex, body_id))
    set_body('mpfb_male')
    return entries
