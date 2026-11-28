"""Order of Historians Outer Nodes & Clandestine Chapters Wardrobe Kit (`historians`).

Implements Module 4 of the Xanadu/Order Garment Expansion (`HM-11`..`HM-19` — 7 New Tiers
across male `mpfb_male` and female `mpfb_female` bodies, 44 pieces total):
1. `maritime_almanacker` (`HM-11` Iziz / Porta Marr & `HM-12` Kautoa Ring-Sea Almanac-Keeper):
   Tarred oiled-cloth wide-brimmed navigator hat with brass Hourglass-Compass badge, salt-proof
   oiled-canvas sea coat over an Order saffron waistcoat with maroon treaty-witness sash, brass
   sextant & waxed almanac pouch, dorsal copper chart cylinder & lighthouse-lens crate, and
   tarred Order-blue cuffed sea boots.
2. `astronomer_monk` (`HM-13` Jimjam, Dilihan & Skywatch Observatory Monk):
   Indigo & gold star-chart mitre encircled by a tilted 3D brass armillary equator-ring carrying
   a godteal Planet *Vandrer* bead, maroon & night-sky indigo mandala robe with star collar-disc,
   saffron sash, incised bamboo *Long Count* *ola* bundle & brass spyglass, and dorsal brass
   armillary sphere & quartz transit-telescope.
3. `ria_expeditionary` (`HM-14` Silkhead / Ria Valley & `HM-15` Roketstad Salvage Buyer):
   Wolf-fur-trimmed northern hood over a steel skullcap rim & brass brow visor, heavy quilted
   maroon & slate frontier greatcoat with wolf-fur pauldrons, iron mail-splint chest guard,
   *Footfall* memory-plate pouches & *Urverkstad* brass chronometer, and dorsal `KCAMP` wool
   bedroll, iron-bound salvage strongbox & brass survey alidade.
4. `lux_envoy` (`HM-16` Lux `TOLERATED` Diplomatic Envoy & *Anker Clock* Synchronizer):
   Austere maroon & celadon scholar's biretta with Order Hourglass-Wheel & stamped bronze
   Eternian Censorate visitor pass-disc, and severely tailored ankle-length maroon cassock-robe
   with celadon & porcelain Eternian-compliant standing collar and sternum-suspended brass &
   godteal *Anker Clock* pendulum-escapement synchronizer on a continuous bronze neck cord.
5. `tethis_diver` (`HM-17` Dalab Context-Drift Watcher & Ys / Tethis Lagoon Rubbing Diver):
   Cast-bronze & Hykkousoi nacre lagoon diving half-helm with twin-port godteal rebreather goggles
   & nose-mouth regulator, salt-sealed lead-oiled & Order-blue wool diver's jerkin with saffron
   shoulder stripes, lead weight-belt, ivory wax-rubbing slate & bronze Greek-symbol stylus,
   dorsal waterproof rubbing-plate portfolio & twin bronze air-bladder flasks, and lead-soled
   lagoon diving boots.
6. `lu_tze_melon_monk` (`HM-18` Blakhed & The Labyrinth — Lu-Tze, "The Melon Monk" / *Mwng Melyn*):
   Battered wide-brimmed woven plaited-straw sweeper's hat with sun-faded saffron brow-sash &
   carved Kimr labyrinth token, road-patched saffron & maroon *kesa* sweeper's robe with rolled
   forearm sleeves, gifted Kimr labyrinth sash, iron key-ring, weld melon-pip pouch & half-tucked
   pocket brass Procrastinator cylinder, and dorsal bamboo broom, calabash water-gourd & rolled
   scroll of the Kimr *Tellings*.
7. `voth_underground` (`HM-19` Voth, Shim & Nazar `PERSECUTED` Clandestine Underground Operative):
   Deep Vothic ashrobe/charcoal disguise cowl & *Blïtrit* plum lower-face cloth wrap, reversible
   drab Vothic smuggler-chronicler's coat whose parted lapel reveals a subtle flash of concealed
   Order saffron & maroon *kesa* lining, weathered shroudtaupe capelet, micro-Procrastinator
   beacon & ancient Nazarite gold ruin-key, and dorsal false-bottomed woven reed-basket &
   terracotta amphora concealing rolled saffron-ribboned Old-Temple rubbings.
"""
import math
import numpy as np

from .. import core
from ..core import (
    L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment
)
from ..paint import P, B, PN, COTTON, WOOL
from ..types.torso import torso_tube, collar, stand_collar, collar_disc, pauldron
from ..types.limbs import sleeve, sleeves
from ..types.footwear import boots
from ..types.headgear import (
    head_rings, sculpted_faceplate, hood, brim,
    tower_hat, crown_band, horn
)
from ..types.accoutrements import (
    blob, pouch_belt, sash_with_tail, pack_straps, button_row, tube, rosette
)


def _back_shoulder_straps(gid_b, back_anchor, TOP, SHOULDER, CHEST, strap_paint):
    """Build paired flat, body-conforming shoulder-harness loops for a `back` slot pack."""
    return pack_straps(gid_b, strap_paint)


# ===========================================================================================================
# 1. MARITIME ALMANACKER (`HM-11` Iziz / Porta Marr & `HM-12` Kautoa Ring-Sea Almanac-Keeper)
# ===========================================================================================================
def _build_maritime_almanacker(sex, body_id):
    """HM-11 / HM-12 Ring-Sea Almanac-Keeper (`order_m/f_mariner_*`)."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- HEADPIECE: Tarred Oiled-Cloth Wide-Brimmed Navigator Hat & Hourglass-Compass Badge ---
    gid_h = f'order_{sex}_mariner_hat'
    parts_h = []

    crown_p = P('deepsea', 0.04, [
        B('bottom', 0.0, 0.022, 'solid', 'orderblue'),
        B('bottom', 0.022, 0.030, 'solid', 'brass'),
        B('top', 0.0, 0.025, 'wave', 'orderblue', 'deepsea', 0.06),
    ], fabric='cloth.canvas.oiled')
    brim_p = P('deepsea', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'orderblue'),
        B('top', 0.0, 0.015, 'solid', 'brass'),
    ], fabric='cloth.canvas.oiled')
    band_p = P('orderblue', 0.04, [
        B('top', 0.0, 0.008, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.008, 'solid', 'brass'),
    ], fabric='cloth.canvas.oiled')

    parts_h.append(head_rings(gid_h + '_crown', 0.58, 1.02, 0.018, crown_p, n=36, rows=7, apex=True))
    parts_h.append(brim(gid_h + '_brim', 0.58, 0.095, brim_p, ease=0.018, rows=6, n=40,
                        lift=0.038, droop=0.008, scallop=0.04))
    parts_h.append(crown_band(gid_h + '_hatband', band_p, f0=0.58, f1=0.69, ease=0.021, flare=0.004, rows=4, n=36))

    # Pinned brass Hourglass-Compass badge on the front hatband
    c_badge = a + (b - a) * 0.67
    d_badge = -bk + left * 0.16
    d_badge /= np.linalg.norm(d_badge)
    h_badge = first_hit(c_badge, d_badge) or 0.098
    badge_pos = c_badge + d_badge * (h_badge + 0.025)
    badge_p = P('brass', 0.02, [
        B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'orderblue', 0.04),
    ], fabric='metal.gold')
    parts_h.append(rosette(gid_h + '_compass_badge', badge_pos, d_badge, left, 0.030,
                           badge_p, n=14, thick=0.011, rigid_joint='Head'))
    parts_h.append(tube(gid_h + '_compass_needle', [
        badge_pos + up * 0.024 + d_badge * 0.008,
        badge_pos - up * 0.024 + d_badge * 0.008,
    ], 0.0045, P('gold', 0.02, fabric='metal.gold'), n=8, rigid_joint='Head'))

    entries.append(assemble_garment(
        gid_h, 'Ring-Sea Tarred Navigator Hat & Compass Badge', 'head', 'historians', parts_h,
        covers_hair=False, covers_face=False
    ))

    # --- TORSO: Salt-Proof Oiled-Canvas Sea Coat, Saffron Waistcoat, Maroon Sash & Sextant Belt ---
    gid_t = f'order_{sex}_mariner_coat'
    parts_t = []

    coat_p = P('orderblue', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'deepsea'),
        B('bottom', 0.04, 0.11, 'wave', 'sealinen', 'deepsea', 0.08),
        B('bottom', 0.11, 0.125, 'solid', 'brass'),
        B('top', 0.0, 0.025, 'solid', 'sealinen'),
    ], [
        # Inner osaffron monastic waistcoat visible between tailored weather-lapels
        PN(0.42, 0.58, 'saffron_kesa', 'osaffron', 'gold', 0.14, down=0.46),
        PN(0.385, 0.42, 'solid', 'sealinen', 'orderblue', 1.0, down=0.48),
        PN(0.58, 0.615, 'solid', 'sealinen', 'orderblue', 1.0, down=0.48),
        PN(0.37, 0.385, 'solid', 'brass', 'orderblue', 1.0, down=0.48),
        PN(0.615, 0.63, 'solid', 'brass', 'orderblue', 1.0, down=0.48),
        PN(0.0, 0.08, 'wave', 'sealinen', 'deepsea', 0.14),
        PN(0.92, 1.0, 'wave', 'sealinen', 'deepsea', 0.14),
    ], fabric='cloth.canvas.oiled')
    sl_p = P('orderblue', 0.05, [
        B('bottom', 0.0, 0.06, 'solid', 'sealinen'),
        B('bottom', 0.06, 0.08, 'solid', 'brass'),
        B('top', 0.0, 0.04, 'wave', 'sealinen', 'deepsea', 0.06),
    ], fabric='cloth.canvas.oiled')
    capelet_p = P('sealinen', 0.05, [
        B('bottom', 0.0, 0.018, 'solid', 'orderblue'),
        B('bottom', 0.018, 0.028, 'solid', 'brass'),
    ], fabric='cloth.canvas.oiled')

    parts_t.append(torso_tube(gid_t + '_coat', TOP + 0.004, KNEE - 0.10, 0.018, coat_p,
                              n=48, hang_from=WAIST - 0.02, flare=0.13,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('deepsea', 0.04, [B('top', 0.0, 0.010, 'solid', 'sealinen')], fabric='cloth.canvas.oiled'), high=0.038))
    parts_t.append(collar_disc(gid_t + '_storm_yoke', 0.096, capelet_p, drop=0.082, rows=9, n=46, scallop=0.04, ease=0.022))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.028, rows=10))
    parts_t.extend(button_row(gid_t + '_wc', CHEST + 0.03, WAIST + 0.05, n_buttons=4,
                              paint=P('brass', 0.02, fabric='metal.gold'), ease=0.023))

    # Maroon treaty-witness sash
    sash_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'longsong_glyph', 'gold', 'omaroon', 0.08)], fabric=WOOL)
    tail_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.05, 'wave', 'gold', 'osaffron', 0.05),
        B('bottom', 0.05, 0.07, 'solid', 'orderblue'),
    ], fabric=WOOL)
    parts_t.extend(sash_with_tail(gid_t, sash_p, tail_p, ease=0.023, tail=0.32))

    # Flush belt gear (0.023 ease): brass sextant (right-front hip) & waxed almanac pouch (left-front hip)
    c_hip = spine_at(WAIST - 0.02)
    d_sex = np.array([-0.76, -0.65, 0.0])
    d_sex /= np.linalg.norm(d_sex)
    pos_sex = surface_out(c_hip, d_sex, 0.023, bvh=core.BVH_T)
    pos_sex_belt = surface_out(spine_at(WAIST + 0.01), d_sex, 0.022, bvh=core.BVH_T)
    sex_p = P('brass', 0.02, [
        B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'brass', 0.04),
    ], fabric='metal.gold')
    parts_t.append(tube(gid_t + '_sextant_bracket', [pos_sex_belt, pos_sex - np.array([0.0, 0.0, 0.010])],
                        0.006, P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_sextant_arc', pos_sex - np.array([0.0, 0.0, 0.018]),
                           d_sex, np.array([1.0, 0.0, 0.0]), 0.040, sex_p, n=14, thick=0.010, rigid_joint='Hips'))
    tan_sex = np.cross(np.array([0.0, 0.0, 1.0]), d_sex)
    parts_t.append(tube(gid_t + '_sextant_scope', [
        pos_sex + d_sex * 0.012 + tan_sex * 0.032,
        pos_sex + d_sex * 0.012 - tan_sex * 0.032,
    ], 0.009, P('brass', 0.02, [B('top', 0.0, 0.018, 'solid', 'godteal')], fabric='metal.gold'), n=10, rigid_joint='Hips'))

    d_alm = np.array([0.74, -0.67, 0.0])
    d_alm /= np.linalg.norm(d_alm)
    pos_alm = surface_out(c_hip, d_alm, 0.023, bvh=core.BVH_T)
    pos_alm_belt = surface_out(spine_at(WAIST + 0.01), d_alm, 0.022, bvh=core.BVH_T)
    alm_p = P('saddle', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'brass'),
        B('bottom', 0.0, 0.015, 'solid', 'deepsea'),
    ], [PN(0.20, 0.80, 'wave', 'gold', 'saddle', 0.06)], fabric='cloth.canvas.oiled')
    parts_t.append(tube(gid_t + '_almanac_bracket', [pos_alm_belt, pos_alm + np.array([0.0, 0.0, 0.025])],
                        0.006, P('leather', 0.04, fabric='leather.polished'), n=8, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_almanac_pouch', pos_alm, (0.084, 0.036, 0.098),
                        alm_p, n=12, rows=5, out=d_alm, rigid_joint='Hips'))

    entries.append(assemble_garment(
        gid_t, 'Ring-Sea Oiled-Canvas Mariner Coat & Sextant Belt', 'torso', 'historians', parts_t
    ))

    # --- BACK: Pitch-Sealed Copper Chart Cylinder & Padded Lighthouse-Lens Crate ---
    gid_b = f'order_{sex}_mariner_pack'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    back_anchor = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    crate_c = back_anchor + np.array([-0.032, 0.018, -0.015])
    crate_p = P('yakbrown', 0.05, [
        B('top', 0.0, 0.028, 'solid', 'brass'),
        B('bottom', 0.0, 0.028, 'solid', 'brass'),
    ], [
        PN(0.16, 0.23, 'solid', 'brass', 'yakbrown', 1.0),
        PN(0.77, 0.84, 'solid', 'brass', 'yakbrown', 1.0),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_lens_crate', crate_c, (0.19, 0.11, 0.24),
                        crate_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'))

    # Godteal quartz Fresnel lighthouse-lens window on the crate face
    lens_p = P('godteal', 0.01, [
        B('top', 0.0, 0.45, 'orb', 'brass', 'godteal', 0.04),
    ], fabric='glass.moonglass.leaded')
    parts_b.append(rosette(gid_b + '_quartz_lens', crate_c + d_bk * 0.056, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.054, lens_p, n=16, thick=0.012, rigid_joint='Spine2'))

    # Pitch-sealed copper chart cylinder strapped beside the crate
    cyl_c = back_anchor + np.array([0.098, 0.034, 0.010])
    cyl_p = P('copper', 0.02, [
        B('top', 0.0, 0.032, 'solid', 'soot'),
        B('bottom', 0.0, 0.032, 'solid', 'soot'),
        B('top', 0.032, 0.046, 'solid', 'brass'),
        B('bottom', 0.032, 0.046, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'wave', 'brass', 'copper', 0.09)], fabric='metal.bronze')
    parts_b.append(tube(gid_b + '_chart_cylinder', [
        cyl_c + np.array([0.0, 0.0, 0.16]),
        cyl_c - np.array([0.0, 0.0, 0.15]),
    ], 0.032, cyl_p, n=14, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_chart_cap', cyl_c + np.array([0.0, 0.0, 0.164]), (0.068, 0.022, 0.068),
                        P('brass', 0.02, fabric='metal.gold'), n=12, rows=4, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))

    strap_p = P('leather', 0.04, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='leather.polished')
    parts_b.extend(_back_shoulder_straps(gid_b, back_anchor, TOP, SHOULDER, CHEST, strap_p))

    entries.append(assemble_garment(
        gid_b, 'Ring-Sea Copper Chart Cylinder & Lighthouse-Lens Crate', 'back', 'historians', parts_b
    ))

    # --- FEET: Salt-Proof Tarred Leather & Order-Blue Cuffed Sea Boots ---
    gid_f = f'order_{sex}_mariner_boots'
    sole_p = P('soot', 0.08, [B('top', 0.0, 0.008, 'solid', 'brass')], fabric='leather.polished')
    upper_p = P('leather', 0.05, [
        B('top', 0.0, 0.06, 'solid', 'orderblue'),
        B('top', 0.06, 0.075, 'solid', 'brass'),
        B('bottom', 0.0, 0.03, 'solid', 'soot'),
    ], fabric='leather.polished')
    cuff_p = P('orderblue', 0.04, [
        B('top', 0.0, 0.012, 'solid', 'brass'),
        B('bottom', 0.0, 0.012, 'solid', 'osaffron'),
    ], fabric='cloth.canvas.oiled')
    parts_f = boots(gid_f, sole_p, upper_p, top=0.56, cuff_paint=cuff_p, ease_top=0.028)
    entries.append(assemble_garment(
        gid_f, 'Ring-Sea Tarred Leather & Order-Blue Sea Boots', 'feet', 'historians', parts_f
    ))
    return entries


# ===========================================================================================================
# 2. ASTRONOMER-MONK (`HM-13` Jimjam, Dilihan & Skywatch — Long Count & Planet Vandrer Observatory)
# ===========================================================================================================
def _build_astronomer_monk(sex, body_id):
    """HM-13 Skywatch Observatory Monk (`order_m/f_astronomer_*`)."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- HEADPIECE: Indigo & Gold Star-Chart Mitre + Tilted Brass Armillary Equator-Ring & Vandrer Bead ---
    gid_h = f'order_{sex}_astronomer_mitre'
    parts_h = []

    under_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.015, 'solid', 'gold'),
    ], fabric='cloth.silk')
    mitre_p = P('indigo', 0.04, [
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
        B('bottom', 0.020, 0.045, 'fret', 'gold', 'omaroon', 0.05),
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('top', 0.04, 0.09, 'beads', 'gold', 'indigo', 0.05),
    ], [
        PN(0.38, 0.62, 'sun', 'gold', 'indigo', 0.11),
        PN(0.08, 0.34, 'beads', 'cream', 'indigo', 0.08),
        PN(0.66, 0.92, 'beads', 'cream', 'indigo', 0.08),
    ], fabric='cloth.silk')

    parts_h.append(head_rings(gid_h + '_undercap', 0.44, 0.64, 0.014, under_p, n=36, rows=5))
    parts_h.append(tower_hat(
        gid_h + '_mitre', 0.185,
        lambda s: 1.0 + 0.08 * math.sin(s * math.pi * 0.85) - 0.18 * (s ** 2.2),
        mitre_p, f=0.56, ease=0.015, rows=12, n=40
    ))

    # Tilted 3D brass armillary equator-ring encircling the crown
    c_eq = a + (b - a) * 0.82
    n_eq = up * math.cos(0.36) - bk * (math.sin(0.36) * 0.82) + left * 0.22
    n_eq /= np.linalg.norm(n_eq)
    e1 = left - n_eq * left.dot(n_eq)
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(n_eq, e1)
    r_eq = 0.130
    eq_pts = [
        c_eq + (e1 * math.cos(th) + e2 * math.sin(th)) * r_eq
        for th in np.linspace(0.0, 2.0 * math.pi, 25)
    ]
    eq_p = P('brass', 0.02, [
        B('top', 0.0, 0.5, 'dentils', 'gold', 'brass', 0.03),
    ], fabric='metal.gold')
    parts_h.append(horn(gid_h + '_equator_ring', eq_pts, 0.0075, 0.0075, eq_p, n=10, rows=25, rigid_joint='Head'))

    # Temple support struts pinning the orbital equator-ring to the mitre
    for sd, th_s in ((1, 0.0), (-1, math.pi)):
        p_out = c_eq + (e1 * math.cos(th_s) + e2 * math.sin(th_s)) * r_eq
        p_in = c_eq + (e1 * math.cos(th_s) + e2 * math.sin(th_s)) * 0.095
        parts_h.append(tube(f'{gid_h}_strut_{sd}', [p_in, p_out], 0.0045,
                            P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Head'))

    # Glowing godteal Planet Vandrer bead riding on the front-right arc of the equator-ring
    th_v = -0.62 * math.pi
    vandrer_pos = c_eq + (e1 * math.cos(th_v) + e2 * math.sin(th_v)) * r_eq
    vandrer_p = P('godteal', 0.01, [
        B('top', 0.0, 0.25, 'solid', 'gold'),
    ], fabric='glass.moonglass.leaded')
    parts_h.append(blob(gid_h + '_vandrer_bead', vandrer_pos, (0.028, 0.028, 0.028),
                        vandrer_p, n=12, rows=6, out=-bk, rigid_joint='Head'))

    entries.append(assemble_garment(
        gid_h, 'Skywatch Star-Chart Mitre & Armillary Equator-Ring', 'head', 'historians', parts_h,
        covers_hair=True, covers_face=False
    ))

    # --- TORSO: Maroon & Night-Sky Indigo Observatory Robe, Star Collar, Ola Bundle & Spyglass ---
    gid_t = f'order_{sex}_astronomer_robe'
    parts_t = []

    robe_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'indigo'),
        B('bottom', 0.04, 0.13, 'wave', 'gold', 'indigo', 0.09),
        B('bottom', 0.13, 0.15, 'solid', 'osaffron'),
        B('top', 0.0, 0.03, 'wave', 'gold', 'indigo', 0.07),
    ], [
        PN(0.37, 0.63, 'longsong_mandala', 'gold', 'indigo', 0.24, down=0.52),
        PN(0.33, 0.37, 'wave', 'gold', 'indigo', 0.10),
        PN(0.63, 0.67, 'wave', 'gold', 'indigo', 0.10),
        PN(0.0, 0.09, 'longsong_glyph', 'gold', 'indigo', 0.16),
        PN(0.91, 1.0, 'longsong_glyph', 'gold', 'indigo', 0.16),
    ], fabric=WOOL)
    col_p = P('indigo', 0.03, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('top', 0.0, 0.045, 'sun', 'gold', 'indigo', 0.06),
    ], fabric='cloth.silk')
    sl_p = P('indigo', 0.04, [
        B('bottom', 0.0, 0.07, 'wave', 'gold', 'omaroon', 0.07),
        B('bottom', 0.07, 0.09, 'solid', 'osaffron'),
    ], fabric=WOOL)

    parts_t.append(torso_tube(gid_t + '_robe', TOP + 0.004, ANKLE + 0.05, 0.017, robe_p,
                              n=48, hang_from=WAIST - 0.03, flare=0.16,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t + '_neck', P('indigo', 0.03, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='cloth.silk'), high=0.032))
    parts_t.append(collar_disc(gid_t + '_star_collar', 0.098, col_p, drop=0.084, rows=9, n=46, scallop=0.05, ease=0.021))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.032, rows=10))

    # Conformed osaffron sash
    sash_p = P('osaffron', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'indigo'),
    ], [PN(0.0, 1.0, 'wave', 'gold', 'osaffron', 0.08)], fabric='cloth.silk')
    tail_p = P('indigo', 0.04, [
        B('bottom', 0.0, 0.06, 'sun', 'gold', 'indigo', 0.05),
        B('bottom', 0.06, 0.08, 'solid', 'osaffron'),
    ], fabric='cloth.silk')
    parts_t.extend(sash_with_tail(gid_t, sash_p, tail_p, ease=0.022, tail=0.34))

    # Incised bamboo palm-leaf Long Count ola bundle (left-front hip, 0.022 ease) & brass spyglass (right-front hip, 0.023 ease)
    c_hip = spine_at(WAIST - 0.02)
    d_ola = np.array([0.72, -0.69, 0.0])
    d_ola /= np.linalg.norm(d_ola)
    pos_ola = surface_out(c_hip, d_ola, 0.022, bvh=core.BVH_T)
    pos_ola_belt = surface_out(spine_at(WAIST + 0.01), d_ola, 0.021, bvh=core.BVH_T)
    ola_p = P('bamboo', 0.04, [
        B('top', 0.0, 0.012, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.012, 'solid', 'omaroon'),
    ], [PN(0.12, 0.88, 'longsong_glyph', 'soot', 'bamboo', 0.05)], fabric='straw.reed.plaited')
    parts_t.append(tube(gid_t + '_ola_cord', [pos_ola_belt, pos_ola + np.array([0.0, 0.0, 0.018])],
                        0.0055, P('omaroon', 0.03, fabric='cloth.silk'), n=8, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_ola_bundle', pos_ola, (0.115, 0.032, 0.048),
                        ola_p, n=12, rows=5, out=d_ola, rigid_joint='Hips'))

    d_spy = np.array([-0.78, -0.62, 0.0])
    d_spy /= np.linalg.norm(d_spy)
    pos_spy = surface_out(c_hip, d_spy, 0.023, bvh=core.BVH_T)
    pos_spy_belt = surface_out(spine_at(WAIST + 0.01), d_spy, 0.022, bvh=core.BVH_T)
    spy_p = P('brass', 0.02, [
        B('top', 0.0, 0.025, 'solid', 'indigo'),
        B('bottom', 0.0, 0.025, 'solid', 'leather'),
    ], fabric='metal.gold')
    parts_t.append(tube(gid_t + '_spyglass_bracket', [pos_spy_belt, pos_spy + np.array([0.0, 0.0, 0.030])],
                        0.006, P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_spyglass', [
        pos_spy + d_spy * 0.008 + np.array([0.0, 0.0, 0.055]),
        pos_spy + d_spy * 0.008 - np.array([0.0, 0.0, 0.065]),
    ], 0.016, spy_p, n=12, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_spyglass_lens', pos_spy + d_spy * 0.008 + np.array([0.0, 0.0, 0.057]),
                           np.array([0.0, 0.0, 1.0]), d_spy, 0.017,
                           P('godteal', 0.01, fabric='glass.moonglass.leaded'), n=12, thick=0.006, rigid_joint='Hips'))

    entries.append(assemble_garment(
        gid_t, 'Skywatch Observatory Mandala Robe & Long-Count Sash', 'torso', 'historians', parts_t
    ))

    # --- BACK: Dorsal Brass Armillary Sphere & Diagonal Quartz Transit-Telescope ---
    gid_b = f'order_{sex}_astronomer_armillary'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    back_anchor = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    cradle_p = P('indigo', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'brass'),
        B('bottom', 0.0, 0.02, 'solid', 'brass'),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_cradle', back_anchor + d_bk * 0.010, (0.16, 0.028, 0.18),
                        cradle_p, n=14, rows=5, out=d_bk, rigid_joint='Spine2'))

    arm_c = back_anchor + np.array([0.0, 0.118, 0.025])
    r_arm = 0.104
    ring_p = P('brass', 0.02, [B('top', 0.0, 0.5, 'dentils', 'gold', 'brass', 0.03)], fabric='metal.gold')
    colure_p = P('copper', 0.02, [B('top', 0.0, 0.5, 'solid', 'brass')], fabric='metal.bronze')

    # Mounting stanchion from dorsal cradle into armillary center
    parts_b.append(tube(gid_b + '_stanchion', [back_anchor + np.array([0.0, 0.016, 0.025]), arm_c],
                        0.012, P('brass', 0.02, fabric='metal.gold'), n=10, rigid_joint='Spine2'))

    # 1. Meridian ring (X-Z vertical plane slightly rotated around Z)
    mer_pts = [
        arm_c + np.array([math.cos(th) * 0.96 * r_arm, math.cos(th) * 0.28 * r_arm, math.sin(th) * r_arm])
        for th in np.linspace(0.0, 2.0 * math.pi, 25)
    ]
    parts_b.append(horn(gid_b + '_meridian_ring', mer_pts, 0.008, 0.008, ring_p, n=10, rows=25, rigid_joint='Spine2'))

    # 2. Tilted equatorial ring (+32 deg inclination)
    eq_b_pts = [
        arm_c + np.array([
            math.cos(th) * r_arm,
            math.sin(th) * math.cos(0.56) * r_arm,
            math.sin(th) * math.sin(0.56) * r_arm,
        ])
        for th in np.linspace(0.0, 2.0 * math.pi, 25)
    ]
    parts_b.append(horn(gid_b + '_equatorial_ring', eq_b_pts, 0.008, 0.008, ring_p, n=10, rows=25, rigid_joint='Spine2'))

    # 3. Intersecting ecliptic ring (-34 deg inclination)
    ecl_pts = [
        arm_c + np.array([
            math.cos(th) * 0.98 * r_arm,
            math.sin(th) * math.cos(-0.60) * 0.98 * r_arm,
            math.sin(th) * math.sin(-0.60) * 0.98 * r_arm,
        ])
        for th in np.linspace(0.0, 2.0 * math.pi, 25)
    ]
    parts_b.append(horn(gid_b + '_ecliptic_ring', ecl_pts, 0.0065, 0.0065, colure_p, n=10, rows=25, rigid_joint='Spine2'))

    # Central gold sun sphere
    sun_p = P('gold', 0.01, [B('top', 0.0, 0.35, 'sun', 'osaffron', 'gold', 0.03)], fabric='metal.gold')
    parts_b.append(blob(gid_b + '_sun_core', arm_c, (0.052, 0.052, 0.052),
                        sun_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'))

    # Diagonal brass & quartz transit-telescope tube slung alongside the cradle
    t_top = back_anchor + np.array([0.135, 0.036, 0.195])
    t_bot = back_anchor + np.array([-0.135, 0.036, -0.175])
    t_dir = (t_top - t_bot) / np.linalg.norm(t_top - t_bot)
    scope_p = P('brass', 0.02, [
        B('top', 0.0, 0.04, 'solid', 'gold'),
        B('bottom', 0.0, 0.04, 'solid', 'indigo'),
        B('top', 0.12, 0.17, 'solid', 'godteal'),
    ], fabric='metal.gold')
    parts_b.append(tube(gid_b + '_transit_scope', [t_top, t_bot], 0.024, scope_p, n=14, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_transit_lens', t_top + t_dir * 0.004, t_dir, np.array([1.0, 0.0, 0.0]),
                           0.025, P('godteal', 0.01, fabric='glass.moonglass.leaded'), n=12, thick=0.007, rigid_joint='Spine2'))

    strap_p = P('indigo', 0.04, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='leather.polished')
    parts_b.extend(_back_shoulder_straps(gid_b, back_anchor, TOP, SHOULDER, CHEST, strap_p))

    entries.append(assemble_garment(
        gid_b, 'Skywatch Dorsal Brass Armillary Sphere & Transit Scope', 'back', 'historians', parts_b
    ))
    return entries


# ===========================================================================================================
# 3. RIA EXPEDITIONARY (`HM-14` Silkhead / Ria Valley & `HM-15` Roketstad Salvage Buyer)
# ===========================================================================================================
def _build_ria_expeditionary(sex, body_id):
    """HM-14 / HM-15 Silkhead & Roketstad Salvage Buyer (`order_m/f_silkhead_*`)."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- HEADPIECE: Wolf-Fur-Trimmed Northern Hood over Steel Skullcap Rim & Brass Brow Visor ---
    gid_h = f'order_{sex}_silkhead_hood'
    parts_h = []

    steel_rim_p = P('steel', 0.02, [
        B('bottom', 0.0, 0.012, 'solid', 'brass'),
        B('top', 0.0, 0.010, 'solid', 'iron'),
    ], fabric='metal.iron')
    parts_h.append(crown_band(gid_h + '_steel_rim', steel_rim_p, f0=0.56, f1=0.76, ease=0.014, flare=0.005, rows=5, n=36))

    # Brass brow visor boss above the eyes
    c_vis = a + (b - a) * 0.60
    h_vis = first_hit(c_vis, -bk) or 0.098
    pos_vis = c_vis - bk * (h_vis + 0.020)
    vis_p = P('brass', 0.02, [
        B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'brass', 0.035),
    ], fabric='metal.gold')
    parts_h.append(blob(gid_h + '_brow_visor', pos_vis, (0.096, 0.024, 0.028),
                        vis_p, n=14, rows=5, out=-bk, rigid_joint='Head'))

    hood_p = P('omaroon', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'darkfur'),
        B('top', 0.0, 0.04, 'quilt', 'slate', 'omaroon', 0.08),
    ], [
        PN(0.0, 0.16, 'solid', 'darkfur', 'omaroon', 1.0),
        PN(0.84, 1.0, 'solid', 'darkfur', 'omaroon', 1.0),
        PN(0.35, 0.65, 'diamond_quilt', 'slate', 'omaroon', 0.10),
    ], fabric='cloth.quilted.diamond')
    parts_h.append(hood(gid_h + '_hood', hood_p, ease=0.030, ease_low=0.032,
                        open_front=0.88, low=-0.18, rows=13, n=36, peak=0.04, high=1.05))

    # Plush 3D wolf-fur ruff framing the hood arch
    fur_ruff_p = P('darkfur', 0.07, [B('top', 0.0, 0.3, 'solid', 'fur')], fabric='fur.yak')
    ruff_pts = []
    for k in range(11):
        ang = -0.52 * math.pi + 1.04 * math.pi * (k / 10.0)
        d_r = up * math.cos(ang) + left * math.sin(ang) - bk * 0.38
        d_r /= np.linalg.norm(d_r)
        c_r = a + (b - a) * (0.20 + 0.60 * math.cos(ang))
        h_r = first_hit(c_r, d_r) or 0.098
        ruff_pts.append(c_r + d_r * (h_r + 0.032))
    parts_h.append(horn(gid_h + '_wolf_ruff', ruff_pts, 0.017, 0.017, fur_ruff_p, n=10, rows=11, rigid_joint='Head'))

    entries.append(assemble_garment(
        gid_h, 'Silkhead Wolf-Fur Northern Hood & Steel Brow-Visor', 'head', 'historians', parts_h,
        covers_hair=True, covers_face=False
    ))

    # --- TORSO: Quilted Frontier Greatcoat, Wolf-Fur Pauldrons, Iron Splint Guard & Chronometer Belt ---
    gid_t = f'order_{sex}_silkhead_coat'
    parts_t = []

    coat_p = P('omaroon', 0.05, [
        B('bottom', 0.0, 0.06, 'solid', 'darkfur'),
        B('bottom', 0.06, 0.14, 'fret', 'osaffron', 'slate', 0.08),
        B('top', 0.0, 0.03, 'solid', 'darkfur'),
    ], [
        PN(0.36, 0.64, 'diamond_quilt', 'slate', 'omaroon', 0.14),
        PN(0.47, 0.53, 'solid', 'osaffron', 'omaroon', 1.0, down=0.55),
        PN(0.0, 0.12, 'diamond_quilt', 'slate', 'omaroon', 0.14),
        PN(0.88, 1.0, 'diamond_quilt', 'slate', 'omaroon', 0.14),
    ], fabric='cloth.quilted.diamond')
    sl_p = P('slate', 0.05, [
        B('bottom', 0.0, 0.06, 'solid', 'darkfur'),
        B('bottom', 0.06, 0.08, 'solid', 'osaffron'),
        B('top', 0.0, 0.08, 'diamond_quilt', 'omaroon', 'slate', 0.08),
    ], fabric='cloth.quilted.diamond')
    fur_p = P('darkfur', 0.07, [
        B('bottom', 0.0, 0.024, 'solid', 'fur'),
        B('top', 0.0, 0.016, 'solid', 'brass'),
    ], fabric='fur.yak')

    parts_t.append(torso_tube(gid_t + '_coat', TOP + 0.004, KNEE - 0.12, 0.018, coat_p,
                              n=48, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar_disc(gid_t + '_fur_collar', 0.092, fur_p, drop=0.078, rows=9, n=44, scallop=0.04, ease=0.022))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.028, rows=10))
    parts_t.append(pauldron(gid_t + '_pauldron_L', L, fur_p, reach=0.35, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_pauldron_R', R, fur_p, reach=0.35, ease=0.024, flare_end=0.98))

    # Iron mail-splint chest corselet fitted snugly below the pectoral/armpit crease
    splint_p = P('iron', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'brass'),
        B('bottom', 0.0, 0.012, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'lorica_lames', 'steel', 'iron', 0.08)], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_splint_guard', CHEST - 0.014, WAIST + 0.045, 0.021,
                              splint_p, rows=6, n=44, hull_from=CHEST + 0.02, role='band'))

    # Conformed belt (0.022 ease) with Footfall memory-plate leather pouches & Urverkstad brass chronometer
    belt_p = P('leather', 0.05, [
        B('top', 0.0, 0.010, 'solid', 'brass'),
        B('bottom', 0.0, 0.010, 'solid', 'iron'),
    ], fabric='leather.polished')
    pouch_p = P('saddle', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'iron'),
    ], [PN(0.15, 0.85, 'circuit_schematic', 'godteal', 'saddle', 0.05)], fabric='leather.polished')
    parts_t.extend(pouch_belt(gid_t, belt_p, pouch_p, ease=0.022))

    d_chr = np.array([0.52, -0.85, 0.0])
    d_chr /= np.linalg.norm(d_chr)
    pos_chr = surface_out(spine_at(WAIST - 0.015), d_chr, 0.023, bvh=core.BVH_T)
    pos_chr_belt = surface_out(spine_at(WAIST + 0.01), d_chr, 0.022, bvh=core.BVH_T)
    chr_p = P('brass', 0.02, [
        B('top', 0.0, 0.45, 'procrastinator_wheel', 'cream', 'brass', 0.04),
    ], fabric='metal.gold')
    parts_t.append(tube(gid_t + '_chrono_chain', [pos_chr_belt, pos_chr + np.array([0.0, 0.0, 0.022])],
                        0.005, P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_urverkstad_chrono', pos_chr, d_chr, np.array([1.0, 0.0, 0.0]),
                           0.032, chr_p, n=14, thick=0.012, rigid_joint='Hips'))

    entries.append(assemble_garment(
        gid_t, 'Silkhead Quilted Frontier Greatcoat & Splint Cuirass', 'torso', 'historians', parts_t
    ))

    # --- BACK: Rolled KCAMP Wool Bedroll, Iron-Bound Salvage Strongbox & Brass Survey Alidade ---
    gid_b = f'order_{sex}_silkhead_pack'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    back_anchor = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    box_c = back_anchor + np.array([0.0, 0.018, -0.035])
    box_p = P('slate', 0.03, [
        B('top', 0.0, 0.026, 'solid', 'iron'),
        B('bottom', 0.0, 0.026, 'solid', 'iron'),
    ], [
        PN(0.14, 0.22, 'solid', 'iron', 'slate', 1.0),
        PN(0.78, 0.86, 'solid', 'iron', 'slate', 1.0),
        PN(0.38, 0.62, 'circuit_schematic', 'godteal', 'slate', 0.08),
    ], fabric='metal.iron')
    parts_b.append(blob(gid_b + '_strongbox', box_c, (0.22, 0.12, 0.24),
                        box_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_strongbox_lock', box_c + d_bk * 0.062, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.028, P('brass', 0.02, fabric='metal.gold'), n=12, thick=0.010, rigid_joint='Spine2'))

    # Rolled osaffron/slate KCAMP wool bedroll horizontally across top
    roll_p = P('osaffron', 0.05, [
        B('top', 0.0, 0.04, 'solid', 'slate'),
        B('bottom', 0.0, 0.04, 'solid', 'slate'),
        B('top', 0.08, 0.11, 'solid', 'leather'),
        B('bottom', 0.08, 0.11, 'solid', 'leather'),
    ], [PN(0.35, 0.65, 'stencil:14', 'cream', 'slate', 0.10)], fabric=WOOL)
    roll_y = back_anchor[1] + 0.040
    roll_z = box_c[2] + 0.152
    parts_b.append(tube(gid_b + '_kcamp_bedroll', [
        np.array([-0.145, roll_y, roll_z]),
        np.array([0.145, roll_y, roll_z]),
    ], 0.042, roll_p, n=14, rigid_joint='Spine2'))

    # Brass survey alidade strapped vertically along the left side of the strongbox
    ali_c = back_anchor + np.array([0.122, 0.028, -0.015])
    ali_p = P('brass', 0.02, [
        B('top', 0.0, 0.03, 'solid', 'iron'),
        B('bottom', 0.0, 0.03, 'solid', 'iron'),
    ], fabric='metal.gold')
    parts_b.append(tube(gid_b + '_survey_alidade', [
        ali_c + np.array([0.0, 0.0, 0.15]),
        ali_c - np.array([0.0, 0.0, 0.14]),
    ], 0.018, ali_p, n=12, rigid_joint='Spine2'))

    strap_p = P('leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'iron')], fabric='leather.polished')
    parts_b.extend(_back_shoulder_straps(gid_b, back_anchor, TOP, SHOULDER, CHEST, strap_p))

    entries.append(assemble_garment(
        gid_b, 'Silkhead KCAMP Bedroll & Footfall Salvage Strongbox', 'back', 'historians', parts_b
    ))
    return entries


# ===========================================================================================================
# 4. LUX DIPLOMATIC ENVOY (`HM-16` Lux `TOLERATED` — Censorate-Watched Envoy & Anker Clock)
# ===========================================================================================================
def _build_lux_envoy(sex, body_id):
    """HM-16 Lux Diplomatic Envoy & Anker Clock Synchronizer (`order_m/f_lux_*`)."""
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- HEADPIECE: Austere Maroon & Celadon Biretta + Hourglass-Wheel & Bronze Censorate Pass-Disc ---
    gid_h = f'order_{sex}_lux_biretta'
    parts_h = []

    biretta_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'celadon'),
        B('bottom', 0.018, 0.026, 'solid', 'porcelain'),
        B('top', 0.0, 0.016, 'solid', 'celadon'),
    ], [
        PN(0.42, 0.58, 'procrastinator_wheel', 'gold', 'omaroon', 0.08),
    ], fabric=WOOL)
    parts_h.append(tower_hat(gid_h + '_biretta', 0.105, lambda s: 1.0 + 0.065 * s,
                             biretta_p, f=0.60, ease=0.014, rows=9, n=40))

    # Crisp biretta cross-ridges across the flat crown top
    c_top = a + (b - a) * 0.60 + up * 0.106
    ridge_p = P('celadon', 0.03, [B('top', 0.0, 0.3, 'solid', 'omaroon')], fabric=WOOL)
    parts_h.append(horn(gid_h + '_ridge_fb', [c_top - bk * 0.088, c_top + up * 0.016, c_top + bk * 0.088],
                        0.008, 0.008, ridge_p, n=8, rows=5, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_ridge_lr', [c_top - left * 0.082, c_top + up * 0.016, c_top + left * 0.082],
                        0.008, 0.008, ridge_p, n=8, rows=5, rigid_joint='Head'))

    # Order Hourglass-Wheel at center brow
    c_emb = a + (b - a) * 0.70
    h_emb = first_hit(c_emb, -bk) or 0.098
    parts_h.append(rosette(gid_h + '_order_wheel', c_emb - bk * (h_emb + 0.021), -bk, left, 0.021,
                           P('gold', 0.02, [B('top', 0.0, 0.45, 'procrastinator_wheel', 'osaffron', 'gold', 0.03)], fabric='metal.gold'),
                           n=12, thick=0.008, rigid_joint='Head'))

    # Mandatory stamped bronze Eternian Censorate visitor's pass-disc on right brow
    c_pass = a + (b - a) * 0.68
    d_pass = -bk * 0.78 - left * 0.62
    d_pass /= np.linalg.norm(d_pass)
    h_pass = first_hit(c_pass, d_pass) or 0.098
    pos_pass = c_pass + d_pass * (h_pass + 0.021)
    pass_p = P('bronze', 0.02, [
        B('top', 0.0, 0.45, 'eternian_icons', 'celadon', 'bronze', 0.04),
    ], fabric='metal.bronze')
    parts_h.append(rosette(gid_h + '_censorate_pass', pos_pass, d_pass, left, 0.026,
                           pass_p, n=14, thick=0.010, rigid_joint='Head'))

    entries.append(assemble_garment(
        gid_h, 'Lux Diplomatic Biretta & Censorate Pass-Disc', 'head', 'historians', parts_h,
        covers_hair=False, covers_face=False
    ))

    # --- TORSO: Severely Tailored Maroon Cassock-Robe & Sternum Anker Clock Synchronizer ---
    gid_t = f'order_{sex}_lux_robe'
    parts_t = []

    cassock_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.035, 'solid', 'celadon'),
        B('bottom', 0.035, 0.050, 'solid', 'porcelain'),
        B('bottom', 0.050, 0.062, 'solid', 'osaffron'),
        B('top', 0.0, 0.020, 'solid', 'celadon'),
    ], [
        PN(0.485, 0.515, 'solid', 'celadon', 'omaroon', 1.0),
        PN(0.476, 0.485, 'solid', 'osaffron', 'omaroon', 1.0),
        PN(0.515, 0.524, 'solid', 'osaffron', 'omaroon', 1.0),
        PN(0.468, 0.476, 'solid', 'porcelain', 'omaroon', 1.0),
        PN(0.524, 0.532, 'solid', 'porcelain', 'omaroon', 1.0),
        PN(0.24, 0.255, 'solid', 'celadon', 'omaroon', 1.0),
        PN(0.745, 0.76, 'solid', 'celadon', 'omaroon', 1.0),
    ], fabric=WOOL)
    col_p = P('celadon', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'porcelain'),
        B('bottom', 0.0, 0.008, 'solid', 'osaffron'),
    ], fabric='cloth.silk')
    sl_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'celadon'),
        B('bottom', 0.04, 0.055, 'solid', 'porcelain'),
        B('bottom', 0.055, 0.065, 'solid', 'osaffron'),
    ], fabric=WOOL)
    cinc_p = P('celadon', 0.03, [
        B('top', 0.0, 0.009, 'solid', 'porcelain'),
        B('bottom', 0.0, 0.009, 'solid', 'osaffron'),
    ], fabric='cloth.silk')

    parts_t.append(torso_tube(gid_t + '_cassock', TOP + 0.005, ANKLE + 0.04, 0.017, cassock_p,
                              n=48, hang_from=WAIST - 0.02, flare=0.11,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, col_p, high=0.045))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.024, rows=10))
    parts_t.append(torso_tube(gid_t + '_cincture', WAIST + 0.025, WAIST - 0.035, 0.021,
                              cinc_p, rows=4, n=42, hull_from=WAIST + 0.1, role='band'))

    # Glass-fronted brass Anker Clock pendulum-escapement synchronizer flush on the sternum
    clk_c = chest_front(CHEST - 0.02, 0.025)
    case_p = P('brass', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'bronze'),
        B('bottom', 0.0, 0.02, 'solid', 'bronze'),
    ], [PN(0.15, 0.85, 'procrastinator_wheel', 'godteal', 'brass', 0.07)], fabric='metal.gold')
    dial_p = P('godteal', 0.01, [
        B('top', 0.0, 0.45, 'procrastinator_wheel', 'brass', 'godteal', 0.04),
    ], fabric='glass.moonglass.leaded')
    parts_t.append(blob(gid_t + '_anker_case', clk_c, (0.078, 0.022, 0.098),
                        case_p, n=14, rows=6, out=FRONT, rigid_joint='Spine2'))
    parts_t.append(rosette(gid_t + '_anker_dial', clk_c + FRONT * 0.010 + np.array([0.0, 0.0, 0.014]),
                           FRONT, np.array([1.0, 0.0, 0.0]), 0.027, dial_p, n=14, thick=0.008, rigid_joint='Spine2'))
    parts_t.append(rosette(gid_t + '_anker_pendulum', clk_c + FRONT * 0.009 - np.array([0.0, 0.0, 0.024]),
                           FRONT, np.array([1.0, 0.0, 0.0]), 0.014,
                           P('gold', 0.01, fabric='metal.gold'), n=12, thick=0.007, rigid_joint='Spine2'))

    # Continuous bronze neck cord supporting the Anker Clock
    z_mid = 0.5 * ((CHEST - 0.02) + TOP)
    cord_pts = [
        clk_c + np.array([0.022, 0.0, 0.042]),
        chest_front(z_mid, 0.026, x=0.052),
    ]
    for ang in np.linspace(0.68 * math.pi, -0.68 * math.pi, 9):
        d_n = np.array([math.sin(ang), math.cos(ang), 0.16])
        cord_pts.append(surface_out(spine_at(TOP - 0.004), d_n, 0.028, bvh=core.BVH_T))
    cord_pts.extend([
        chest_front(z_mid, 0.026, x=-0.052),
        clk_c + np.array([-0.022, 0.0, 0.042]),
    ])
    parts_t.append(horn(gid_t + '_neck_cord', cord_pts, 0.0055, 0.0055,
                        P('bronze', 0.02, fabric='metal.bronze'), n=8, rows=15, rigid_joint='Spine2'))

    entries.append(assemble_garment(
        gid_t, 'Lux Diplomatic Cassock-Robe & Anker Clock Synchronizer', 'torso', 'historians', parts_t
    ))
    return entries


# ===========================================================================================================
# 5. TETHIS LAGOON RUBBING DIVER (`HM-17` Dalab Watcher & Ys / Tethis Gene-Lab Rubbing Diver)
# ===========================================================================================================
def _build_tethis_diver(sex, body_id):
    """HM-17 Dalab Watcher & Ys / Tethis Lagoon Rubbing Diver (`order_m/f_tethis_*`)."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    a, b, up, bk, left = head_frame()
    entries = []

    # --- HEADPIECE: Cast-Bronze & Hykkousoi Nacre Lagoon Diving Half-Helm / Twin-Port Rebreather ---
    gid_h = f'order_{sex}_tethis_mask'
    parts_h = []

    strap_p = P('bronze', 0.02, [
        B('top', 0.0, 0.008, 'solid', 'nacre'),
        B('bottom', 0.0, 0.008, 'solid', 'turq'),
    ], [PN(0.42, 0.58, 'procrastinator_wheel', 'godteal', 'bronze', 0.05)], fabric='metal.bronze')
    # Head-strap encircling temples & occiput snugly against bare scalp (`ease=0.003`)
    parts_h.append(crown_band(gid_h + '_head_strap', strap_p, f0=0.35, f1=0.44, ease=0.003, flare=0.0, rows=5, n=42))

    # Twin-port godteal rebreather goggles seated flush into the orbital sockets with oiled-lead gaskets & nasal saddle
    eye_f = 0.37
    c_eye = a + (b - a) * eye_f
    h_nose = first_hit(c_eye, -bk) or 0.108
    gasket_p = P('slate', 0.04, [B('top', 0.0, 0.006, 'solid', 'bronze')], fabric='cloth.lead.oiled')
    bezel_p = P('bronze', 0.02, [B('top', 0.0, 0.3, 'solid', 'nacre')], fabric='metal.bronze')
    port_p = P('godteal', 0.01, [B('top', 0.0, 0.25, 'orb', 'turq', 'godteal', 0.03)], fabric='glass.moonglass.leaded')
    br_inners = {}
    for sd, tag in ((-1, 'R'), (1, 'L')):
        p_sock = c_eye + left * (sd * 0.032)
        d_sock = -bk + left * (sd * 0.12)
        d_sock /= np.linalg.norm(d_sock)
        h_sock = first_hit(p_sock, d_sock) or (h_nose - 0.016)
        p_face_in = p_sock + d_sock * (h_sock - 0.006)
        p_eye = p_sock + d_sock * max(h_sock + 0.010, h_nose - 0.005)
        br_inners[tag] = p_eye - d_sock * 0.004 - left * (sd * 0.018)
        parts_h.append(tube(f'{gid_h}_gasket_{tag}', [p_face_in, p_eye], 0.026, gasket_p, n=14, rigid_joint='Head'))
        parts_h.append(rosette(f'{gid_h}_bezel_{tag}', p_eye, d_sock, left, 0.027,
                               bezel_p, n=14, thick=0.008, rigid_joint='Head'))
        parts_h.append(blob(f'{gid_h}_port_{tag}', p_eye + d_sock * 0.003, (0.038, 0.010, 0.036),
                            port_p, n=12, rows=5, out=d_sock, rigid_joint='Head'))
        # Side link arm connecting outer goggle rim flush into `_head_strap` at the temple
        d_tmp = -bk * 0.55 + left * (sd * 0.835)
        d_tmp /= np.linalg.norm(d_tmp)
        h_tmp = first_hit(c_eye, d_tmp) or 0.082
        p_tmp = c_eye + d_tmp * (h_tmp + 0.003)
        parts_h.append(tube(f'{gid_h}_strap_link_{tag}', [p_eye - d_sock * 0.004 + left * (sd * 0.022), p_tmp],
                            0.0055, bezel_p, n=8, rigid_joint='Head'))

    br_saddle = c_eye + up * 0.003 - bk * (h_nose + 0.002)
    parts_h.append(horn(gid_h + '_goggle_bridge', [br_inners['R'], br_saddle, br_inners['L']],
                        0.005, 0.005, bezel_p, n=8, rows=5, rigid_joint='Head'))

    # Nose-mouth regulator in Hykkousoi nacre & cast bronze seated flush onto jaw/cheeks + twin breathing loop tubes
    c_reg = a + (b - a) * 0.15
    h_reg = first_hit(c_reg, -bk) or 0.106
    pos_reg = c_reg - bk * (h_reg + 0.005)
    reg_p = P('nacre', 0.02, [
        B('top', 0.0, 0.25, 'solid', 'bronze'),
        B('bottom', 0.0, 0.25, 'solid', 'turq'),
    ], fabric='shell.nacre')
    valve_p = P('bronze', 0.02, [
        B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'bronze', 0.035),
    ], fabric='metal.bronze')
    parts_h.append(blob(gid_h + '_regulator', pos_reg, (0.074, 0.038, 0.060),
                        reg_p, n=14, rows=6, out=-bk, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_purge_valve', pos_reg - bk * 0.016, -bk, left, 0.020,
                           valve_p, n=12, thick=0.009, rigid_joint='Head'))

    hose_p = P('slate', 0.04, [B('top', 0.0, 0.5, 'stripes', 'bronze', 'slate', 0.025)], fabric='cloth.lead.oiled')
    for sd, tag in ((-1, 'R'), (1, 'L')):
        h_a = pos_reg + left * (sd * 0.028) + bk * 0.006
        d_jb = -bk * 0.42 + left * (sd * 0.91)
        d_jb /= np.linalg.norm(d_jb)
        c_jb = c_reg - up * 0.012
        r_jb = first_hit(c_jb, d_jb) or 0.056
        h_b = c_jb + d_jb * (r_jb + 0.006)
        d_jc = bk * 0.42 + left * (sd * 0.91)
        d_jc /= np.linalg.norm(d_jc)
        c_jc = c_reg - up * 0.026
        r_jc = first_hit(c_jc, d_jc) or 0.054
        h_c = c_jc + d_jc * (r_jc + 0.005)
        parts_h.append(tube(f'{gid_h}_loop_{tag}', [h_a, h_b, h_c], 0.010, hose_p, n=10, rigid_joint='Head'))

    entries.append(assemble_garment(
        gid_h, 'Tethis Bronze & Nacre Lagoon Rebreather Half-Helm', 'head', 'historians', parts_h,
        covers_hair=False, covers_face=False
    ))

    # --- TORSO: Salt-Sealed Lead-Oiled & Order-Blue Diver's Jerkin, Weight-Belt & Rubbing Slate ---
    gid_t = f'order_{sex}_tethis_jerkin'
    parts_t = []

    jerkin_p = P('orderblue', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'slate'),
        B('bottom', 0.04, 0.09, 'wave', 'turq', 'orderblue', 0.07),
        B('top', 0.0, 0.03, 'solid', 'osaffron'),
    ], [
        PN(0.38, 0.62, 'dalab_solar_weave', 'turq', 'slate', 0.18, down=0.45),
        PN(0.18, 0.28, 'solid', 'osaffron', 'orderblue', 1.0, down=0.34),
        PN(0.72, 0.82, 'solid', 'osaffron', 'orderblue', 1.0, down=0.34),
        PN(0.35, 0.38, 'solid', 'osaffron', 'orderblue', 1.0),
        PN(0.62, 0.65, 'solid', 'osaffron', 'orderblue', 1.0),
    ], fabric='cloth.lead.oiled')
    sl_p = P('slate', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'bronze'),
        B('top', 0.0, 0.06, 'solid', 'osaffron'),
    ], fabric='cloth.lead.oiled')
    sh_p = P('osaffron', 0.04, [
        B('bottom', 0.0, 0.02, 'solid', 'orderblue'),
        B('top', 0.0, 0.015, 'solid', 'bronze'),
    ], fabric='cloth.lead.oiled')

    parts_t.append(torso_tube(gid_t + '_jerkin', TOP + 0.005, CROTCH - 0.06, 0.018, jerkin_p,
                              n=46, hang_from=WAIST - 0.02, flare=0.07,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('bronze', 0.02, [B('top', 0.0, 0.010, 'solid', 'turq')], fabric='metal.bronze'), high=0.036))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.021, rows=9))
    parts_t.append(pauldron(gid_t + '_stripe_L', L, sh_p, reach=0.33, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_stripe_R', R, sh_p, reach=0.33, ease=0.024, flare_end=0.98))

    # Slate lead weight-belt (0.021 ease)
    belt_p = P('slate', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'bronze'),
        B('bottom', 0.0, 0.010, 'solid', 'bronze'),
    ], [PN(0.0, 1.0, 'dentils', 'iron', 'slate', 0.06)], fabric='cloth.lead.oiled')
    weight_p = P('slate', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'bronze'),
        B('bottom', 0.0, 0.02, 'solid', 'iron'),
    ], fabric='metal.iron')
    parts_t.extend(pouch_belt(gid_t, belt_p, weight_p, ease=0.021))

    # Waterproof ivory wax-rubbing slate (left-front hip, 0.023 ease) & bronze Greek-symbol stylus (right-front hip, 0.023 ease)
    c_hip = spine_at(WAIST - 0.025)
    d_sl = np.array([0.74, -0.67, 0.0])
    d_sl /= np.linalg.norm(d_sl)
    pos_sl = surface_out(c_hip, d_sl, 0.023, bvh=core.BVH_T)
    pos_sl_belt = surface_out(spine_at(WAIST + 0.008), d_sl, 0.021, bvh=core.BVH_T)
    slate_p = P('ivory', 0.02, [
        B('top', 0.0, 0.018, 'solid', 'bronze'),
        B('bottom', 0.0, 0.018, 'solid', 'bronze'),
    ], [PN(0.12, 0.88, 'longsong_glyph', 'slate', 'ivory', 0.06)], fabric='shell.nacre')
    parts_t.append(tube(gid_t + '_slate_clip', [pos_sl_belt, pos_sl + np.array([0.0, 0.0, 0.032])],
                        0.006, P('bronze', 0.02, fabric='metal.bronze'), n=8, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_rubbing_slate', pos_sl, (0.095, 0.022, 0.115),
                        slate_p, n=12, rows=5, out=d_sl, rigid_joint='Hips'))

    d_sty = np.array([-0.55, -0.83, 0.0])
    d_sty /= np.linalg.norm(d_sty)
    pos_sty = surface_out(c_hip, d_sty, 0.023, bvh=core.BVH_T)
    pos_sty_belt = surface_out(spine_at(WAIST + 0.008), d_sty, 0.021, bvh=core.BVH_T)
    stylus_p = P('bronze', 0.02, [B('top', 0.0, 0.022, 'solid', 'nacre')], fabric='metal.bronze')
    parts_t.append(tube(gid_t + '_stylus_clip', [pos_sty_belt, pos_sty + np.array([0.0, 0.0, 0.025])],
                        0.005, stylus_p, n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_greek_stylus', [
        pos_sty + d_sty * 0.004 + np.array([0.0, 0.0, 0.052]),
        pos_sty + d_sty * 0.004 - np.array([0.0, 0.0, 0.055]),
    ], 0.0075, stylus_p, n=10, rigid_joint='Hips'))

    entries.append(assemble_garment(
        gid_t, 'Tethis Salt-Sealed Diver Jerkin & Rubbing-Slate Belt', 'torso', 'historians', parts_t
    ))

    # --- BACK: Waterproof Rubbing-Plate Portfolio & Twin Cast-Bronze Air-Bladder Flasks ---
    gid_b = f'order_{sex}_tethis_pack'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    back_anchor = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    port_c = back_anchor + np.array([0.0, 0.010, -0.010])
    port_p = P('slate', 0.03, [
        B('top', 0.0, 0.026, 'solid', 'bronze'),
        B('bottom', 0.0, 0.022, 'solid', 'bronze'),
    ], [
        PN(0.20, 0.80, 'wave', 'orderblue', 'slate', 0.12),
    ], fabric='cloth.lead.oiled')
    parts_b.append(blob(gid_b + '_rubbing_portfolio', port_c, (0.24, 0.056, 0.29),
                        port_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'))

    # Twin cast-bronze compressed air-bladder flasks mounted over the portfolio
    flask_p = P('bronze', 0.02, [
        B('top', 0.0, 0.035, 'solid', 'nacre'),
        B('bottom', 0.0, 0.035, 'solid', 'slate'),
        B('top', 0.10, 0.14, 'solid', 'godteal'),
    ], [PN(0.0, 1.0, 'procrastinator_wheel', 'turq', 'bronze', 0.08)], fabric='metal.bronze')
    for sd, tag in ((-1, 'R'), (1, 'L')):
        fc = port_c + np.array([sd * 0.068, 0.058, 0.0])
        parts_b.append(tube(f'{gid_b}_air_flask_{tag}', [
            fc + np.array([0.0, 0.0, 0.13]),
            fc - np.array([0.0, 0.0, 0.12]),
        ], 0.036, flask_p, n=14, rigid_joint='Spine2'))
        parts_b.append(blob(f'{gid_b}_flask_dome_{tag}', fc + np.array([0.0, 0.0, 0.134]), (0.072, 0.026, 0.072),
                            P('bronze', 0.02, fabric='metal.bronze'), n=12, rows=4,
                            out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))

    parts_b.append(tube(gid_b + '_manifold', [
        port_c + np.array([-0.068, 0.058, 0.142]),
        port_c + np.array([0.068, 0.058, 0.142]),
    ], 0.010, P('bronze', 0.02, fabric='metal.bronze'), n=10, rigid_joint='Spine2'))

    strap_p = P('slate', 0.04, [B('top', 0.0, 0.02, 'solid', 'bronze')], fabric='cloth.lead.oiled')
    parts_b.extend(_back_shoulder_straps(gid_b, back_anchor, TOP, SHOULDER, CHEST, strap_p))

    entries.append(assemble_garment(
        gid_b, 'Tethis Waterproof Rubbing Portfolio & Bronze Air Flasks', 'back', 'historians', parts_b
    ))

    # --- FEET: Lead-Soled Slate & Order-Blue Lagoon Diving Boots ---
    gid_f = f'order_{sex}_tethis_boots'
    sole_p = P('slate', 0.03, [B('top', 0.0, 0.010, 'solid', 'bronze')], fabric='metal.iron')
    upper_p = P('orderblue', 0.04, [
        B('top', 0.0, 0.04, 'solid', 'bronze'),
        B('bottom', 0.0, 0.035, 'solid', 'slate'),
    ], [PN(0.38, 0.62, 'solid', 'slate', 'orderblue', 1.0)], fabric='cloth.lead.oiled')
    parts_f = boots(gid_f, sole_p, upper_p, top=0.45, wraps=1,
                    wrap_paint=P('bronze', 0.02, fabric='metal.bronze'), ease_top=0.028)
    entries.append(assemble_garment(
        gid_f, 'Tethis Lead-Soled Lagoon Diving Boots', 'feet', 'historians', parts_f
    ))
    return entries


# ===========================================================================================================
# 6. LU-TZE, "THE MELON MONK" / MWNG MELYN (`HM-18` Blakhed & The Labyrinth)
# ===========================================================================================================
def _build_lu_tze_melon_monk(sex, body_id):
    """HM-18 Blakhed & The Labyrinth — Lu-Tze, 'The Melon Monk' (`order_m/f_lutze_*`)."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- HEADPIECE: Battered Wide-Brimmed Plaited-Straw Sweeper's Hat, Saffron Sash & Kimr Token ---
    gid_h = f'order_{sex}_lutze_hat'
    parts_h = []

    straw_crown_p = P('bamboo', 0.07, [
        B('bottom', 0.0, 0.022, 'solid', 'osaffron'),
        B('top', 0.0, 0.03, 'stripes', 'weld', 'bamboo', 0.04),
    ], fabric='straw.reed.plaited')
    straw_brim_p = P('bamboo', 0.07, [
        B('bottom', 0.0, 0.018, 'stripes', 'weld', 'ochre', 0.04),
        B('top', 0.0, 0.015, 'solid', 'osaffron'),
    ], fabric='straw.reed.plaited')
    brow_sash_p = P('osaffron', 0.05, [
        B('top', 0.0, 0.008, 'solid', 'weld'),
        B('bottom', 0.0, 0.008, 'solid', 'omaroon'),
    ], fabric=COTTON)

    parts_h.append(head_rings(gid_h + '_crown', 0.58, 1.02, 0.017, straw_crown_p, n=36, rows=7, apex=True))
    parts_h.append(brim(gid_h + '_brim', 0.58, 0.125, straw_brim_p, ease=0.017, rows=7, n=42,
                        droop=0.028, lift=0.006, scallop=0.03))
    parts_h.append(crown_band(gid_h + '_brow_sash', brow_sash_p, f0=0.58, f1=0.69, ease=0.020, flare=0.004, rows=4, n=36))

    # Carved Kimr madder/bone labyrinth token tucked into the brow-sash
    c_tok = a + (b - a) * 0.64
    d_tok = -bk * 0.88 + left * 0.48
    d_tok /= np.linalg.norm(d_tok)
    h_tok = first_hit(c_tok, d_tok) or 0.098
    pos_tok = c_tok + d_tok * (h_tok + 0.024)
    tok_p = P('bone', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'madder'),
        B('bottom', 0.0, 0.012, 'solid', 'madder'),
    ], [PN(0.10, 0.90, 'labyrinth_panel', 'bone', 'madder', 0.05)], fabric='shell.nacre')
    parts_h.append(blob(gid_h + '_kimr_token', pos_tok, (0.036, 0.014, 0.042),
                        tok_p, n=12, rows=5, out=d_tok, rigid_joint='Head'))

    entries.append(assemble_garment(
        gid_h, 'Melon Monk Plaited-Straw Sweeper Hat & Kimr Token', 'head', 'historians', parts_h,
        covers_hair=False, covers_face=False
    ))

    # --- TORSO: Road-Patched Saffron Kesa Sweeper's Robe, Rolled Sleeves, Kimr Sash & Pocket Procrastinator ---
    gid_t = f'order_{sex}_lutze_robe'
    parts_t = []

    robe_p = P('osaffron', 0.06, [
        B('bottom', 0.0, 0.04, 'solid', 'omaroon'),
        B('bottom', 0.04, 0.11, 'saffron_kesa', 'weld', 'omaroon', 0.12),
        B('top', 0.0, 0.025, 'solid', 'omaroon'),
    ], [
        PN(0.14, 0.86, 'saffron_kesa', 'weld', 'osaffron', 0.22),
        PN(0.44, 0.56, 'solid', 'omaroon', 'osaffron', 1.0, down=0.38),
        PN(0.28, 0.36, 'patchwork_harlequin', 'ochre', 'omaroon', 0.14),
    ], fabric=COTTON)
    sl_p = P('osaffron', 0.06, [
        B('bottom', 0.0, 0.045, 'solid', 'weld'),
        B('bottom', 0.045, 0.065, 'solid', 'omaroon'),
    ], [PN(0.0, 1.0, 'saffron_kesa', 'weld', 'osaffron', 0.16)], fabric=COTTON)

    parts_t.append(torso_tube(gid_t + '_robe', TOP + 0.004, KNEE - 0.14, 0.018, robe_p,
                              n=48, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar(gid_t + '_collar', P('omaroon', 0.05, [B('top', 0.0, 0.010, 'solid', 'weld')], fabric=COTTON),
                          height=0.028, flare=0.010, ease=0.022, open_front=True, rows=5, n=32))

    # Rolled forearm sleeves (f0=0.0, f1=0.68) so forearms stay ready to sweep!
    parts_t.append(sleeve(gid_t + '_sleeve_L', L, sl_p, f0=0.0, f1=0.68, ease=0.019, flare=0.012, rows=10, n=22))
    parts_t.append(sleeve(gid_t + '_sleeve_R', R, sl_p, f0=0.0, f1=0.68, ease=0.019, flare=0.012, rows=10, n=22))

    # Gifted Kimr labyrinth_panel (madder/cream) waist sash
    kimr_sash_p = P('madder', 0.05, [
        B('top', 0.0, 0.010, 'solid', 'cream'),
        B('bottom', 0.0, 0.010, 'solid', 'cream'),
    ], [PN(0.0, 1.0, 'labyrinth_panel', 'cream', 'madder', 0.09)], fabric=WOOL)
    kimr_tail_p = P('cream', 0.05, [
        B('bottom', 0.0, 0.08, 'labyrinth_panel', 'madder', 'cream', 0.08),
        B('bottom', 0.08, 0.10, 'solid', 'madder'),
    ], fabric=WOOL)
    parts_t.extend(sash_with_tail(gid_t, kimr_sash_p, kimr_tail_p, ease=0.022, tail=0.35))

    # 1. Sweeper's iron key-ring (left hip, 0.022 ease)
    c_hip = spine_at(WAIST - 0.02)
    d_key = np.array([0.88, -0.46, 0.0])
    d_key /= np.linalg.norm(d_key)
    pos_key = surface_out(c_hip, d_key, 0.022, bvh=core.BVH_T)
    pos_key_belt = surface_out(spine_at(WAIST + 0.01), d_key, 0.021, bvh=core.BVH_T)
    iron_p = P('iron', 0.02, fabric='metal.iron')
    parts_t.append(tube(gid_t + '_key_hook', [pos_key_belt, pos_key + np.array([0.0, 0.0, 0.020])],
                        0.005, iron_p, n=8, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_key_ring', pos_key, d_key, np.array([0.0, 1.0, 0.0]),
                           0.024, iron_p, n=12, thick=0.006, rigid_joint='Hips'))
    for idx_k, dz_dx in enumerate((-0.010, 0.010)):
        parts_t.append(tube(f'{gid_t}_sweeper_key_{idx_k}', [
            pos_key + np.array([0.0, dz_dx, -0.014]),
            pos_key + np.array([0.0, dz_dx * 1.2, -0.068]),
        ], 0.0045, iron_p, n=8, rigid_joint='Hips'))

    # 2. Weld melon-pip pouch (front-left sash, 0.021 ease)
    d_pip = np.array([0.55, -0.83, 0.0])
    d_pip /= np.linalg.norm(d_pip)
    pos_pip = surface_out(c_hip, d_pip, 0.021, bvh=core.BVH_T)
    pos_pip_belt = surface_out(spine_at(WAIST + 0.01), d_pip, 0.021, bvh=core.BVH_T)
    pip_p = P('weld', 0.05, [
        B('top', 0.0, 0.020, 'solid', 'omaroon'),
    ], fabric=COTTON)
    parts_t.append(tube(gid_t + '_pip_cord', [pos_pip_belt, pos_pip + np.array([0.0, 0.0, 0.024])],
                        0.005, P('omaroon', 0.04, fabric=COTTON), n=8, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_melon_pouch', pos_pip, (0.070, 0.036, 0.078),
                        pip_p, n=12, rows=5, out=d_pip, rigid_joint='Hips'))

    # 3. Half-tucked pocket brass Procrastinator cylinder (right-front sash, 0.023 ease + Hips bracket)
    d_proc = np.array([-0.68, -0.73, 0.0])
    d_proc /= np.linalg.norm(d_proc)
    pos_proc = surface_out(spine_at(WAIST - 0.01), d_proc, 0.023, bvh=core.BVH_T)
    pos_proc_belt = surface_out(spine_at(WAIST + 0.015), d_proc, 0.021, bvh=core.BVH_T)
    proc_p = P('brass', 0.02, [
        B('top', 0.0, 0.020, 'solid', 'gold'),
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'procrastinator_wheel', 'godteal', 'omaroon', 0.06)], fabric='metal.gold')
    parts_t.append(tube(gid_t + '_proc_bracket', [pos_proc_belt, pos_proc],
                        0.0065, P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_pocket_procrastinator', [
        pos_proc + np.array([-0.010, -0.004, 0.052]),
        pos_proc + np.array([0.010, 0.004, -0.052]),
    ], 0.020, proc_p, n=14, rigid_joint='Hips'))

    entries.append(assemble_garment(
        gid_t, 'Melon Monk Patched Saffron Robe & Pocket Procrastinator', 'torso', 'historians', parts_t
    ))

    # --- BACK: Sweeper's Diagonal Bamboo Broom, Calabash Water-Gourd & Kimr Tellings Scroll ---
    gid_b = f'order_{sex}_lutze_broom'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    back_anchor = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    # Woven sling back-pad & shoulder straps
    parts_b.append(blob(gid_b + '_sling_pad', back_anchor + d_bk * 0.008, (0.13, 0.024, 0.14),
                        P('omaroon', 0.05, [B('top', 0.0, 0.02, 'solid', 'osaffron')], fabric=COTTON),
                        n=12, rows=5, out=d_bk, rigid_joint='Spine2'))

    # Long diagonal bamboo broom handle + flared straw broomcorn head bound with omaroon cord
    br_top = back_anchor + np.array([-0.15, 0.026, 0.28])
    br_mid = back_anchor + np.array([0.10, 0.028, -0.20])
    br_tip = back_anchor + np.array([0.20, 0.032, -0.40])
    bamboo_p = P('bamboo', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'omaroon'),
        B('top', 0.16, 0.175, 'solid', 'ochre'),
        B('top', 0.34, 0.355, 'solid', 'ochre'),
    ], fabric='straw.reed.plaited')
    broom_head_p = P('bamboo', 0.07, [
        B('top', 0.0, 0.045, 'solid', 'omaroon'),
        B('top', 0.065, 0.085, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.04, 'stripes', 'weld', 'ochre', 0.03),
    ], fabric='straw.reed.plaited')
    parts_b.append(tube(gid_b + '_broom_handle', [br_top, br_mid], 0.015, bamboo_p, n=10, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_broom_head', [br_mid, br_tip], 0.022, 0.072,
                        broom_head_p, n=14, rows=10, rigid_joint='Spine2'))

    # Slung ochre calabash water-gourd (2 stacked blob bulbs)
    g_base = back_anchor + np.array([-0.082, 0.032, -0.075])
    gourd_p = P('ochre', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'omaroon'),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_gourd_bot', g_base, (0.094, 0.086, 0.104),
                        gourd_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_gourd_top', g_base + np.array([0.0, -0.004, 0.076]), (0.062, 0.058, 0.068),
                        gourd_p, n=12, rows=5, out=d_bk, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_gourd_stopper', [
        g_base + np.array([0.0, -0.004, 0.106]),
        g_base + np.array([0.0, -0.004, 0.128]),
    ], 0.011, P('bamboo', 0.04, fabric='straw.reed.plaited'), n=8, rigid_joint='Spine2'))

    # Rolled scroll of the Kimr Tellings
    sc_c = back_anchor + np.array([0.045, 0.028, 0.085])
    scroll_p = P('cream', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'bone'),
        B('bottom', 0.0, 0.022, 'solid', 'bone'),
        B('top', 0.11, 0.14, 'solid', 'madder'),
    ], [PN(0.0, 1.0, 'labyrinth_panel', 'madder', 'cream', 0.07)], fabric=COTTON)
    parts_b.append(tube(gid_b + '_kimr_scroll', [
        sc_c + np.array([0.11, 0.0, 0.04]),
        sc_c - np.array([0.11, 0.0, 0.04]),
    ], 0.022, scroll_p, n=12, rigid_joint='Spine2'))

    strap_p = P('osaffron', 0.05, [B('top', 0.0, 0.015, 'solid', 'omaroon')], fabric=COTTON)
    parts_b.extend(_back_shoulder_straps(gid_b, back_anchor, TOP, SHOULDER, CHEST, strap_p))

    entries.append(assemble_garment(
        gid_b, 'Melon Monk Bamboo Sweeper Broom, Gourd & Kimr Scroll', 'back', 'historians', parts_b
    ))
    return entries


# ===========================================================================================================
# 7. VOTH UNDERGROUND OPERATIVE (`HM-19` Voth, Shim & Nazar `PERSECUTED` Clandestine Chronicler)
# ===========================================================================================================
def _build_voth_underground(sex, body_id):
    """HM-19 Voth, Shim & Nazar Clandestine Underground Operative (`order_m/f_voth_*`)."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    entries = []

    # --- HEADPIECE: Deep Vothic Disguise Cowl & Blitrit Plum Lower-Face Cloth Wrap ---
    gid_h = f'order_{sex}_voth_cowl'
    parts_h = []

    cowl_p = P('ashrobe', 0.06, [
        B('bottom', 0.0, 0.04, 'voth_glyphs', 'plum', 'charcoal', 0.07),
        B('top', 0.0, 0.03, 'solid', 'charcoal'),
    ], [
        PN(0.36, 0.64, 'solid', 'charcoal', 'ashrobe', 1.0),
    ], fabric='cloth.weave.burlap')
    wrap_p = P('plum', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'ashrobe'),
        B('bottom', 0.0, 0.015, 'voth_glyphs', 'charcoal', 'plum', 0.05),
    ], [PN(0.0, 1.0, 'stripes', 'wine', 'plum', 0.04)], fabric=COTTON)

    parts_h.append(hood(gid_h + '_cowl', cowl_p, ease=0.035, ease_low=0.054,
                        open_front=0.86, low=-0.54, rows=15, n=36, peak=0.05, high=1.05))
    parts_h.append(sculpted_faceplate(
        gid_h + '_blitrit_wrap', wrap_p,
        f_top=0.29, f_bot=0.04, ease=0.020, span=0.50, rows=10, cols=23,
        brow_relief=0.0, nose_relief=0.014, cheek_relief=0.008, chin_relief=0.008, jaw_narrow=0.22
    ))

    entries.append(assemble_garment(
        gid_h, 'Voth Underground Disguise Cowl & Blitrit Face-Wrap', 'head', 'historians', parts_h,
        covers_hair=True, covers_face=False
    ))

    # --- TORSO: Reversible Smuggler-Chronicler's Coat, Shroudtaupe Capelet & Hidden Belt Gear ---
    gid_t = f'order_{sex}_voth_cloak'
    parts_t = []

    cloak_p = P('ashrobe', 0.06, [
        B('bottom', 0.0, 0.09, 'voth_glyphs', 'plum', 'charcoal', 0.09),
        B('bottom', 0.09, 0.105, 'solid', 'plum'),
        B('top', 0.0, 0.025, 'solid', 'charcoal'),
    ], [
        # Parted front lapel edge revealing concealed Order osaffron & omaroon kesa lining
        PN(0.46, 0.54, 'saffron_kesa', 'osaffron', 'omaroon', 0.14, down=0.45),
        PN(0.43, 0.46, 'solid', 'plum', 'ashrobe', 1.0),
        PN(0.54, 0.57, 'solid', 'plum', 'ashrobe', 1.0),
        PN(0.20, 0.30, 'voth_glyphs', 'charcoal', 'ashrobe', 0.20),
        PN(0.70, 0.80, 'voth_glyphs', 'charcoal', 'ashrobe', 0.20),
    ], fabric=WOOL)
    capelet_p = P('shroudtaupe', 0.06, [
        B('bottom', 0.0, 0.024, 'voth_glyphs', 'plum', 'charcoal', 0.06),
        B('top', 0.0, 0.012, 'solid', 'charcoal'),
    ], fabric='cloth.weave.burlap')
    sl_p = P('ashrobe', 0.06, [
        B('bottom', 0.0, 0.010, 'solid', 'osaffron'),
        B('bottom', 0.010, 0.055, 'voth_glyphs', 'plum', 'charcoal', 0.06),
    ], fabric=WOOL)

    parts_t.append(torso_tube(gid_t + '_coat', TOP + 0.005, KNEE - 0.16, 0.019, cloak_p,
                              n=48, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar_disc(gid_t + '_capelet', 0.082, capelet_p, drop=0.068, rows=6, n=44, scallop=0.05, ease=0.019))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.019, sl_p, ease_end=0.028, rows=10))

    # Hidden waist-belt & gear (0.021 ease): micro-Procrastinator beacon & Nazarite gold ruin-key
    belt_p = P('charcoal', 0.04, [
        B('top', 0.0, 0.009, 'solid', 'plum'),
        B('bottom', 0.0, 0.009, 'solid', 'bronze'),
    ], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.02, WAIST - 0.04, 0.021,
                              belt_p, rows=4, n=40, hull_from=WAIST + 0.1, role='belt'))

    c_hip = spine_at(WAIST - 0.018)
    d_beac = np.array([-0.72, -0.69, 0.0])
    d_beac /= np.linalg.norm(d_beac)
    pos_beac = surface_out(c_hip, d_beac, 0.021, bvh=core.BVH_T)
    pos_beac_belt = surface_out(spine_at(WAIST + 0.008), d_beac, 0.021, bvh=core.BVH_T)
    beac_p = P('bronze', 0.02, [
        B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'bronze', 0.035),
    ], fabric='metal.bronze')
    parts_t.append(tube(gid_t + '_beacon_clip', [pos_beac_belt, pos_beac + np.array([0.0, 0.0, 0.018])],
                        0.005, P('bronze', 0.02, fabric='metal.bronze'), n=8, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_micro_beacon', pos_beac, d_beac, np.array([1.0, 0.0, 0.0]),
                           0.026, beac_p, n=14, thick=0.012, rigid_joint='Hips'))

    d_nkey = np.array([0.76, -0.65, 0.0])
    d_nkey /= np.linalg.norm(d_nkey)
    pos_nkey = surface_out(c_hip, d_nkey, 0.021, bvh=core.BVH_T)
    pos_nkey_belt = surface_out(spine_at(WAIST + 0.008), d_nkey, 0.021, bvh=core.BVH_T)
    nkey_p = P('gold', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'turq'),
        B('bottom', 0.0, 0.025, 'solid', 'plum'),
    ], fabric='metal.gold')
    parts_t.append(tube(gid_t + '_ruin_key_loop', [pos_nkey_belt, pos_nkey + np.array([0.0, 0.0, 0.025])],
                        0.005, nkey_p, n=8, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_ruin_key_bow', pos_nkey + np.array([0.0, 0.0, 0.024]),
                           d_nkey, np.array([1.0, 0.0, 0.0]), 0.018, nkey_p, n=12, thick=0.007, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_ruin_key_shaft', [
        pos_nkey + d_nkey * 0.004 + np.array([0.0, 0.0, 0.010]),
        pos_nkey + d_nkey * 0.004 - np.array([0.0, 0.0, 0.075]),
    ], 0.0075, nkey_p, n=10, rigid_joint='Hips'))

    entries.append(assemble_garment(
        gid_t, 'Voth Reversible Smuggler Coat & Concealed Saffron Lining', 'torso', 'historians', parts_t
    ))

    # --- BACK: False-Bottomed Woven Reed-Basket, Terracotta Amphora & Concealed Saffron-Ribboned Rubbings ---
    gid_b = f'order_{sex}_voth_pack'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    back_anchor = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    # False-bottomed Vothic woven reed-basket
    bsk_x = -0.036
    bsk_y = back_anchor[1] + 0.068
    basket_p = P('bamboo', 0.07, [
        B('top', 0.0, 0.04, 'solid', 'charcoal'),
        B('bottom', 0.0, 0.045, 'voth_glyphs', 'plum', 'bamboo', 0.06),
        B('bottom', 0.09, 0.12, 'solid', 'plum'),
    ], fabric='straw.reed.plaited')
    parts_b.append(horn(gid_b + '_reed_basket', [
        np.array([bsk_x, bsk_y - 0.006, back_anchor[2] - 0.14]),
        np.array([bsk_x, bsk_y + 0.008, back_anchor[2] + 0.13]),
    ], 0.062, 0.082, basket_p, n=16, rows=9, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_false_bottom', np.array([bsk_x, bsk_y - 0.006, back_anchor[2] - 0.144]),
                        (0.124, 0.024, 0.124), P('charcoal', 0.05, fabric='straw.reed.plaited'),
                        n=14, rows=4, out=np.array([0.0, 0.0, -1.0]), rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_basket_fill', np.array([bsk_x, bsk_y + 0.008, back_anchor[2] + 0.126]),
                        (0.156, 0.022, 0.156), P('shroudtaupe', 0.06, fabric='cloth.weave.burlap'),
                        n=14, rows=4, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))

    # Concealed rolled osaffron-ribboned Old-Temple life-transfer rubbings peeking at the basket rim
    rub_p = P('ivory', 0.03, [
        B('top', 0.02, 0.045, 'solid', 'osaffron'),
        B('top', 0.045, 0.055, 'solid', 'omaroon'),
    ], fabric=COTTON)
    for idx_r, (dx_r, dy_r) in enumerate(((-0.024, -0.010), (0.024, 0.012))):
        parts_b.append(tube(f'{gid_b}_temple_rubbing_{idx_r}', [
            np.array([bsk_x + dx_r + 0.010, bsk_y + dy_r, back_anchor[2] + 0.215]),
            np.array([bsk_x + dx_r, bsk_y + dy_r, back_anchor[2] + 0.095]),
        ], 0.017, rub_p, n=10, rigid_joint='Spine2'))

    # Terracotta amphora strapped alongside the reed basket
    amp_c = back_anchor + np.array([0.088, 0.046, -0.035])
    amp_p = P('terracotta', 0.04, [
        B('top', 0.0, 0.03, 'voth_glyphs', 'plum', 'terracotta', 0.05),
        B('bottom', 0.0, 0.03, 'solid', 'charcoal'),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_amphora_body', amp_c, (0.094, 0.088, 0.18),
                        amp_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_amphora_neck', [
        amp_c + np.array([0.0, 0.0, 0.075]),
        amp_c + np.array([0.0, 0.0, 0.145]),
    ], 0.024, 0.034, amp_p, n=12, rows=5, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_amphora_stopper', amp_c + np.array([0.0, 0.0, 0.150]),
                        (0.052, 0.020, 0.052), P('osaffron', 0.04, fabric='cloth.canvas.oiled'),
                        n=10, rows=4, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))

    strap_p = P('shroudtaupe', 0.06, [B('top', 0.0, 0.02, 'solid', 'plum')], fabric='cloth.weave.burlap')
    parts_b.extend(_back_shoulder_straps(gid_b, back_anchor, TOP, SHOULDER, CHEST, strap_p))

    entries.append(assemble_garment(
        gid_b, 'Voth False-Bottomed Reed Basket & Amphora Smuggler Pack', 'back', 'historians', parts_b
    ))
    return entries


# ===========================================================================================================
# ENTRY POINT
# ===========================================================================================================
def build_historians_outer_nodes_kit():
    """Build all 44 Order of Historians outer-node & clandestine chapter pieces across male & female bodies."""
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_maritime_almanacker(sex, body_id))
        entries.extend(_build_astronomer_monk(sex, body_id))
        entries.extend(_build_ria_expeditionary(sex, body_id))
        entries.extend(_build_lux_envoy(sex, body_id))
        entries.extend(_build_tethis_diver(sex, body_id))
        entries.extend(_build_lu_tze_melon_monk(sex, body_id))
        entries.extend(_build_voth_underground(sex, body_id))
    return entries
