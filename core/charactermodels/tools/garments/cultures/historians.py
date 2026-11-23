"""The Order of Historians (Longsong) Wardrobe Kit (`historians`).

Implements the complete Longsong / Order of Historians cultural wardrobe across male (`mpfb_male`)
and female (`mpfb_female`) bodies (complementing the base `novice`, `monk`, `elder`, and `agent`
sets in `tools/make_garments.py`):
1. `cartographer` (Grand Cartographer & Relic-Surveyor): Slate-blue & madder wool greatcoat with
   labyrinth tapestry panels, stiff standing collar, leather codex rucksack (`back` slot), embroidered
   labyrinth high boots, and cylindrical labyrinth kufi cap with round crimson-ruby spectacles.
2. `listener` (Listener of "The Ear" — Radio-Dish Astrologer-Monk): Brass-and-bakelite acoustic
   headset over an `orderblue` & `osaffron` skullcap (`covers_hair=False`), sleeveless `omaroon`
   monastic chuba over a high-collared `osaffron` shirt, crossed by a leather chest-desk & wax-cylinder
   log-roll harness and the Parabolic Dish & Three Evidentials badge (*seen / said / inferred*).
3. `keeper` (Keeper of the Vault & The Procrastinator — Eight Seals Containment Monk): Tall lead-lined
   `omaroon` & `slate` Vault containment cowl with a gilded-lead & glowing `godteal` blue-glass hazard
   visor (worn before *LS-006 The Second Sun*) and silenced acoustic grille; heavy lead-lined quilted
   containment robe hung with 7 cast-bronze Seal plaques + 1 blank 8th plaque and a hip-mounted
   Prayer-Wheel Stasis-Meter; dorsal Procrastinator Stasis-Capacitor & Relic Cask (`back` slot); and
   muffled lead-soled Vault boots.
4. `chronomonk` (Master of Arms / Procrastinator Chrono-Monk — Lightning Kung-Fu): Braided `osaffron`
   & `gold` brow-cord with a bronze & `godteal` Third-Eye Evidential medallion (`covers_hair=False`),
   high-mobility asymmetric martial *kesa* tunic cinched by a wide **Brass-and-Godteal Prayer-Wheel
   Kidney Belt** (6 counter-rotating temporal-capacitor cylinders), bronze-splinted `orderblue`
   forearm bracers, gathered martial breeches, and spiral shin-puttees over monastic martial sandals.
5. `warden` (Longsong Citadel Warden / Dob-dob Monastic Guard): Domed Tibetan eight-plate fluted
   iron-and-brass helmet with quilted `omaroon` neck-guards and saffron-crimson yak-hair crest;
   `omaroon` & `orderblue` iron/brass lamellar brigandine over saffron robes with a polished bronze
   *melong* mirror-gorget; heavy wool guard trousers; and tall Tibetan felt-and-leather guard boots.
6. `cham` (Festival of the Register Cham Dancer — Shanag Black-Hat): Sculpted wrathful Dharmapala
   ritual mask crowned by the wide-brimmed **Shanag Black Hat** with skull-and-vajra finial spire
   and trailing silk streamers; resplendent brocade Cham dance vestment with wide triangular sleeves,
   bronze *melong* mirror, and carved ivory bone-bead apron (*rgyan drug*).
7. `servant` (Oidong Lay Servant, Artisan & Lay Scholar of the Lower Ward): Belted `yakbrown` &
   `orderblue` wool *chuba* with woven horizontal-striped *pangden* apron over an unbleached cotton
   shirt, brass ink-case & tea-pouch at the sash, and Oidong four-ear felt-and-fleece cap.
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, ring_points, smooth_push, assemble_garment
)
from ..paint import P, B, PN, C, COTTON, WOOL
from ..types.torso import torso_tube, collar, stand_collar, collar_disc, cape, band, pauldron
from ..types.limbs import limb_tube, sleeve, sleeves, trousers
from ..types.footwear import boots, sandal
from ..types.headgear import (
    head_rings, sculpted_faceplate, sculpted_cranium, hood, brim,
    tower_hat, crown_band, crest, horn
)
from ..types.accoutrements import (
    flap, blob, pouch_belt, button_row, pendants, strap, tube, tassel, rosette
)


# ===========================================================================================================
# 1. GRAND CARTOGRAPHER & RELIC-SURVEYOR (`order_m/f_cartographer_*`)
# ===========================================================================================================
def _build_order_cartographer(sex, body_id):
    """Grand Cartographer / Relic-Surveyor (`order_m/f_cartographer_*`)."""
    set_body(body_id)
    entries = []

    # --- HEADPIECE: Flat-topped cylindrical labyrinth-embroidered kufi cap & round crimson-ruby spectacles ---
    gid_h = f'order_{sex}_cartographer_cap'
    a, b, up, bk, left = head_frame()
    parts_h = []

    cap_paint = P('cream', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'madder'),
        B('bottom', 0.0, 0.012, 'solid', 'madder'),
    ], [
        PN(0.0, 1.0, 'labyrinth_panel', 'cream', 'rust', 0.095),
    ])
    parts_h.append(tower_hat(gid_h + '_kufi', 0.105, lambda s: 1.0 + 0.055 * s, cap_paint, f=0.58, ease=0.014, rows=8, n=40))

    # Round crimson-ruby spectacles with bronze rims & nose-bridge perched clearly in front of the eyes
    lens_paint = P('holyred', 0.01, [B('top', 0.0, 0.010, 'solid', 'soot')], fabric='metal.bronze')
    eye_f = 0.36
    h_eye = first_hit(a + (b - a) * eye_f, -bk) or 0.112
    for sd in (-1, 1):
        l_pos = a + (b - a) * eye_f + left * sd * 0.035 - bk * (h_eye + 0.020)
        parts_h.append(blob(f'{gid_h}_lens_{sd}', l_pos, (0.040, 0.012, 0.038), lens_paint, n=14, rows=5, out=-bk, rigid_joint='Head'))
        ear_p = a + (b - a) * (eye_f + 0.02) + left * sd * 0.084 - bk * 0.015
        parts_h.append(horn(f'{gid_h}_temple_{sd}', [l_pos + left * sd * 0.019, ear_p], 0.003, 0.0025, P('soot', 0.02), n=6, rows=4, rigid_joint='Head'))

    br_l = a + (b - a) * (eye_f + 0.005) - left * 0.018 - bk * (h_eye + 0.022)
    br_r = a + (b - a) * (eye_f + 0.005) + left * 0.018 - bk * (h_eye + 0.022)
    parts_h.append(horn(gid_h + '_bridge', [br_l, br_r], 0.0035, 0.0035, P('soot', 0.02), n=6, rows=3, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, 'Cartographer Labyrinth Kufi & Ruby Spectacles', 'head', 'historians', parts_h,
                                    covers_hair=False, covers_face=False))

    # --- TORSO: Slate-blue wool greatcoat with stiff standing collar & labyrinth tapestry panels ---
    gid_t = f'order_{sex}_cartographer_coat'
    parts_t = []
    coat_paint = P('slate', 0.06, [
        B('bottom', 0.0, 0.24, 'labyrinth_panel', 'cream', 'madder', 0.22),
        B('bottom', 0.24, 0.26, 'solid', 'cream'),
        B('top', 0.0, 0.08, 'labyrinth_panel', 'cream', 'madder', 0.14),
    ], [
        PN(0.46, 0.54, 'labyrinth_panel', 'cream', 'madder', 0.16, down=0.58),
        PN(0.32, 0.45, 'labyrinth_panel', 'cream', 'slate', 0.26),
        PN(0.55, 0.68, 'labyrinth_panel', 'cream', 'slate', 0.26),
        PN(0.45, 0.47, 'solid', 'madder', 'cream', 0.10),
        PN(0.53, 0.55, 'solid', 'madder', 'cream', 0.10),
        PN(0.0, 0.08, 'labyrinth_panel', 'cream', 'madder', 0.24),
        PN(0.92, 1.0, 'labyrinth_panel', 'cream', 'madder', 0.24),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_coat', core.TOP + 0.01, core.KNEE - 0.14, 0.022, coat_paint,
                              n=52, hang_from=core.WAIST - 0.02, flare=0.10, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02))

    col_paint = P('madder', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'cream'),
        B('bottom', 0.0, 0.012, 'solid', 'cream'),
        B('top', 0.012, 0.055, 'fret', 'cream', 'madder', 0.045),
    ])
    zs_col = np.linspace(core.TOP + 0.055, core.TOP - 0.008, 5)
    angs_col = np.linspace(-0.84 * math.pi, 0.84 * math.pi, 32)
    Col_pts = np.array([ring_points(spine_at(z), np.array([0, 1.0, 0]), np.array([1.0, 0, 0]), angs_col,
                                    0.018 + 0.008 * (1 - k / 4.0), rmin=0.05) for k, z in enumerate(zs_col)])
    parts_t.append(Part(gid_t + '_collar', Col_pts, False, ['body'] * 5, col_paint))

    sl_paint = P('slate', 0.06, [
        B('bottom', 0.0, 0.14, 'labyrinth_panel', 'cream', 'madder', 0.10),
        B('bottom', 0.14, 0.16, 'solid', 'cream'),
        B('top', 0.08, 0.20, 'labyrinth_panel', 'cream', 'madder', 0.12),
    ], fabric='cloth.wool')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.020, sl_paint, ease_end=0.026, rows=10, n=20))

    yoke_paint = P('madder', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'cream'), B('top', 0.0, 0.08, 'fret', 'cream', 'madder', 0.05)])
    parts_t.append(collar_disc(gid_t + '_shoulder_yoke', 0.11, yoke_paint, drop=0.042, rows=5, n=40, scallop=0.0, ease=0.026, z_off=0.002))
    parts_t.append(pauldron(gid_t + '_yokeL', L, yoke_paint, reach=0.34, ease=0.032, flare_end=0.9))
    parts_t.append(pauldron(gid_t + '_yokeR', R, yoke_paint, reach=0.34, ease=0.032, flare_end=0.9))
    entries.append(assemble_garment(gid_t, 'Cartographer Labyrinth Greatcoat & Waistcoat', 'torso', 'historians', parts_t))

    # --- BACK: Equippable structured saddle-leather field pack / codex rucksack ---
    gid_b = f'order_{sex}_cartographer_pack'
    parts_b = []
    pack_paint = P('clay', 0.05, [
        B('top', 0.0, 0.04, 'solid', 'leather'),
        B('bottom', 0.0, 0.03, 'solid', 'leather'),
    ], [
        PN(0.18, 0.24, 'solid', 'leather', 'clay', 0.10),
        PN(0.76, 0.82, 'solid', 'leather', 'clay', 0.10),
    ], fabric='leather.polished')
    back_c = spine_at(core.CHEST - 0.03) + np.array([0.0, 0.165, 0.0])
    parts_b.append(blob(gid_b + '_backpack', back_c, (0.24, 0.13, 0.30), pack_paint,
                        n=16, rows=7, out=np.array([0, 1.0, 0]), rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_pack_top', back_c + np.array([0.0, 0.0, 0.13]), (0.22, 0.12, 0.08),
                        P('leather', 0.05), n=12, rows=5, out=np.array([0, 1.0, 0]), rigid_joint='Spine2'))
    for sd in (-1, 1):
        parts_b.append(blob(f'{gid_b}_pack_pocket_{sd}', back_c + np.array([sd * 0.115, -0.01, -0.03]), (0.06, 0.09, 0.16),
                            P('clay', 0.05, [B('top', 0.0, 0.02, 'solid', 'brass')]), n=10, rows=5,
                            out=np.array([sd * 1.0, 0, 0]), rigid_joint='Spine2'))
        st_a = back_c + np.array([sd * 0.075, -0.04, 0.12])
        st_b = spine_at(core.TOP + 0.005) + np.array([sd * 0.095, -0.01, 0.02])
        st_c = chest_front(core.CHEST + 0.02, 0.038, x=sd * 0.095)
        parts_b.append(horn(f'{gid_b}_strap_{sd}', [st_a, st_b, st_c], 0.014, 0.012,
                            P('leather', 0.05, fabric='leather.polished'), n=8, rows=6, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_b, 'Cartographer Leather Codex Rucksack', 'back', 'historians', parts_b))

    # --- FEET: Ornate madder-and-cream labyrinth embroidered high boots ---
    gid_f = f'order_{sex}_cartographer_boots'
    boot_sole_paint = P('madder', 0.05, [B('top', 0.0, 0.01, 'solid', 'cream')], fabric='leather.polished')
    boot_upper_paint = P('madder', 0.05, [
        B('top', 0.0, 0.04, 'solid', 'holyred'),
        B('bottom', 0.0, 0.03, 'solid', 'leather'),
    ], [
        PN(0.0, 1.0, 'labyrinth_panel', 'cream', 'madder', 0.12),
        PN(0.22, 0.26, 'solid', 'brass', 'madder', 0.10),
        PN(0.74, 0.78, 'solid', 'brass', 'madder', 0.10),
    ], fabric='leather.polished')
    parts_f = boots(gid_f, boot_sole_paint, boot_upper_paint, top=0.68, ease_top=0.028)
    entries.append(assemble_garment(gid_f, 'Cartographer Embroidered Labyrinth High Boots', 'feet', 'historians', parts_f))
    return entries


# ===========================================================================================================
# 2. LISTENER OF "THE EAR" (`order_m/f_listener_*`)
# ===========================================================================================================
def _build_order_listener(sex, body_id):
    """Listener of 'The Ear' — Radio-Dish Astrologer-Monk (`order_m/f_listener_*`)."""
    set_body(body_id)
    entries = []

    # --- HEADPIECE: Brass-and-Bakelite Acoustic Headset over Order-Blue & Saffron Skullcap ---
    gid_h = f'order_{sex}_listener_headset'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Close-fitting saffron-piped Order-blue monastic skullcap on the upper crown
    cap_p = P('orderblue', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'osaffron'),
        B('bottom', 0.018, 0.032, 'solid', 'omaroon'),
        B('top', 0.0, 0.02, 'solid', 'gold'),
    ], fabric=WOOL)
    parts_h.append(head_rings(gid_h + '_skullcap', 0.56, 0.99, 0.018, cap_p, n=32, rows=7, apex=True))

    # 2. Twin leather-cushioned bakelite & brass acoustic ear-cups over Left & Right ears
    ear_f = 0.28
    c_ear = a + (b - a) * ear_f
    cushion_p = P('soot', 0.04, [B('top', 0.0, 0.25, 'solid', 'leather')], fabric='leather.polished')
    brass_cup_p = P('brass', 0.02, [B('top', 0.0, 0.35, 'procrastinator_wheel', 'godteal', 'brass', 0.04)], fabric='metal.bronze')
    arch_pts = []
    for sd, tag in ((-1, 'R'), (1, 'L')):
        d_e = left * sd - bk * 0.06
        d_e /= np.linalg.norm(d_e)
        h_e = first_hit(c_ear, d_e) or 0.088
        pos_c = c_ear + d_e * (h_e + 0.016)
        parts_h.append(rosette(f'{gid_h}_cushion_{tag}', pos_c, d_e, bk, 0.038, cushion_p, n=14, thick=0.016, rigid_joint='Head'))
        parts_h.append(rosette(f'{gid_h}_cup_{tag}', pos_c + d_e * 0.012, d_e, bk, 0.028, brass_cup_p, n=14, thick=0.014, rigid_joint='Head'))
        # Short vertical copper dipole aerial pin on the right ear-cup
        if sd == -1:
            ant_a = pos_c + d_e * 0.016 + up * 0.02
            ant_b = ant_a + up * 0.12 + left * (sd * 0.015)
            parts_h.append(horn(gid_h + '_aerial', [ant_a, ant_b], 0.005, 0.002, P('copper', 0.02, fabric='metal.bronze'),
                                n=8, rows=5, rigid_joint='Head'))
        else:
            # Curved brass acoustic voice-pipe / stethoscope boom curving toward the left cheek
            boom_a = pos_c + d_e * 0.010 - up * 0.010
            boom_b = c_ear + left * (sd * 0.088) - bk * 0.085 - up * 0.045
            boom_c = c_ear + left * (sd * 0.042) - bk * 0.128 - up * 0.062
            parts_h.append(horn(gid_h + '_boom', [boom_a, boom_b, boom_c], 0.006, 0.008,
                                P('brass', 0.02, [B('top', 0.0, 0.25, 'solid', 'soot')], fabric='metal.bronze'),
                                n=8, rows=6, rigid_joint='Head'))

    # 3. Over-the-head spring-steel & brass headband arch linking the two ear-cups
    for k in range(11):
        ang = -0.48 * math.pi + 0.96 * math.pi * (k / 10.0)
        d_arch = up * math.cos(ang) + left * math.sin(ang) - bk * 0.04
        d_arch /= np.linalg.norm(d_arch)
        c_k = a + (b - a) * (0.28 + 0.44 * math.cos(ang))
        h_k = first_hit(c_k, d_arch) or 0.095
        arch_pts.append(c_k + d_arch * (h_k + 0.024))
    parts_h.append(horn(gid_h + '_headband', arch_pts, 0.010, 0.010,
                        P('brass', 0.02, [B('top', 0.0, 0.3, 'stripes', 'soot', 'brass', 0.02)], fabric='metal.bronze'),
                        n=8, rows=11, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, 'Listener of The Ear Acoustic Headset & Skullcap', 'head', 'historians', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- TORSO: Sleeveless Maroon Chuba over Saffron Shirt + Chest-Desk Log-Roll Harness & Dish Badge ---
    gid_t = f'order_{sex}_listener_coat'
    parts_t = []
    chuba_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'osaffron'),
        B('bottom', 0.03, 0.08, 'fret', 'gold', 'orderblue', 0.06),
        B('top', 0.0, 0.02, 'solid', 'osaffron'),
    ], [
        # Center saffron & order-blue monastic lapel overlap (u=0.44..0.56)
        PN(0.46, 0.54, 'solid', 'osaffron', 'omaroon', 1.0, down=0.45),
        PN(0.43, 0.46, 'solid', 'orderblue', 'omaroon', 1.0),
        PN(0.54, 0.57, 'solid', 'orderblue', 'omaroon', 1.0),
        # Saffron shoulder-cap under-shirt at armholes so shoulder transition to sleeves is seamless
        PN(0.18, 0.32, 'solid', 'osaffron', 'omaroon', 1.0, down=0.28),
        PN(0.68, 0.82, 'solid', 'osaffron', 'omaroon', 1.0, down=0.28),
    ], fabric=WOOL)
    sl_p = P('osaffron', 0.04, [
        B('bottom', 0.0, 0.06, 'solid', 'orderblue'),
        B('bottom', 0.06, 0.08, 'solid', 'gold'),
    ], fabric=COTTON)

    parts_t.append(torso_tube(gid_t, core.TOP, core.KNEE - 0.08, 0.018, chuba_p,
                              hang_from=core.WAIST - 0.03, flare=0.14, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('osaffron', 0.04, [B('top', 0.0, 0.012, 'solid', 'orderblue')]), high=0.048))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.021, sl_p, ease_end=0.036, rows=9))

    # Order-blue sash + crossed leather harness straps supporting the Listener's Chest-Desk
    sash_p = P('orderblue', 0.04, [B('top', 0.0, 0.012, 'solid', 'gold'), B('bottom', 0.0, 0.012, 'solid', 'osaffron')], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_sash', core.WAIST + 0.04, core.WAIST - 0.035, 0.028, sash_p, rows=3, n=40, hull_from=core.WAIST + 0.1))
    strap_p = P('leather', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass'), B('bottom', 0.0, 0.008, 'solid', 'brass')])
    parts_t.append(band(gid_t + '_harness_L', core.WAIST, core.SHOULDER - 0.018, 0.040, 0.026, strap_p, high=math.pi * 0.36, rows=5))
    parts_t.append(band(gid_t + '_harness_R', core.WAIST, core.SHOULDER - 0.018, 0.040, 0.028, strap_p, high=-math.pi * 0.36, rows=5))

    # Brass-bound Slate & Slide-Rule Chest-Desk over the sternum + Parabolic Dish & Three Evidentials Medallion
    desk_c = chest_front(core.CHEST - 0.03, 0.044)
    desk_p = P('slate', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'brass'),
        B('bottom', 0.0, 0.02, 'solid', 'brass'),
    ], [
        PN(0.12, 0.88, 'circuit_schematic', 'godteal', 'slate', 0.08),
    ], fabric='metal.iron')
    parts_t.append(blob(gid_t + '_chest_desk', desk_c, (0.15, 0.022, 0.105), desk_p, n=14, rows=5, out=FRONT, rigid_joint='Spine2'))

    # Parabolic Dish & Evidentials Badge above the chest-desk
    dish_c = chest_front(core.CHEST + 0.06, 0.042)
    parts_t.append(rosette(gid_t + '_dish_badge', dish_c, FRONT, np.array([1.0, 0, 0]), 0.038,
                           P('brass', 0.02, [B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'orderblue', 0.04)], fabric='metal.gold'),
                           n=14, thick=0.014, rigid_joint='Spine2'))

    # Twin cylindrical brass-capped wax-cylinder / magnetic-tape log cases at the ribs
    cyl_p = P('saddle', 0.04, [B('top', 0.0, 0.03, 'solid', 'brass'), B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='leather.polished')
    for sd, tag in ((-1, 'R'), (1, 'L')):
        c_pos = chest_front(core.WAIST + 0.05, 0.046, x=sd * 0.095)
        parts_t.append(tube(f'{gid_t}_logroll_{tag}', [c_pos + np.array([0, 0, 0.055]), c_pos - np.array([0, 0, 0.055])],
                            0.024, cyl_p, n=12, rigid_joint='Spine1'))

    entries.append(assemble_garment(gid_t, 'Listener of The Ear Chuba, Chest-Desk & Log-Rolls', 'torso', 'historians', parts_t))
    return entries


# ===========================================================================================================
# 3. KEEPER OF THE VAULT & THE PROCRASTINATOR (`order_m/f_keeper_*`)
# ===========================================================================================================
def _build_order_keeper(sex, body_id):
    """Keeper of the Vault & The Procrastinator — Eight Seals Containment Monk (`order_m/f_keeper_*`)."""
    set_body(body_id)
    entries = []

    # --- HEADPIECE: Lead-Lined Vault Containment Cowl & Blue-Glass Hazard Visor (for LS-006 The Second Sun) ---
    gid_h = f'order_{sex}_keeper_cowl'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Gilded-lead & glowing blue-glass (`godteal`) hazard face-shield with silenced acoustic grille
    visor_p = P('slate', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'brass'),
        B('bottom', 0.0, 0.02, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'keeper_visor', 'godteal', 'slate', 1.0),
    ], fabric='metal.iron')
    parts_h.append(sculpted_faceplate(gid_h + '_visor', visor_p, f_top=0.76, f_bot=-0.04, ease=0.016, span=0.46, rows=16, cols=25))

    # 2. Heavy lead-lined `omaroon` & `slate` Vault Containment Hood framing the visor
    cowl_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.03, 'solid', 'brass'),
        B('bottom', 0.0, 0.04, 'solid', 'slate'),
    ], [
        PN(0.40, 0.60, 'quilt', 'slate', 'omaroon', 0.10),
    ], fabric='cloth.oiled')
    parts_h.append(hood(gid_h + '_hood', cowl_p, ease=0.036, ease_low=0.056, open_front=0.82, low=-0.56, rows=16, n=36, peak=0.05, high=1.06))

    # 3. Miniature 8-spoked bronze Procrastinator Seal Wheel mounted on the brow of the cowl
    c_brow = a + (b - a) * 0.78
    h_brow = first_hit(c_brow, -bk) or 0.102
    brow_c = c_brow - bk * (h_brow + 0.028)
    parts_h.append(rosette(gid_h + '_seal_wheel', brow_c, -bk, left, 0.036,
                           P('brass', 0.02, [B('top', 0.0, 0.5, 'procrastinator_wheel', 'godteal', 'brass', 0.04)], fabric='metal.gold'),
                           n=14, thick=0.014, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, 'Keeper of the Vault Lead-Lined Cowl & Blue-Glass Visor', 'head', 'historians', parts_h,
                                    covers_hair=True, covers_face=True))

    # --- TORSO: Lead-Lined Containment Robe, 7+1 Seal Plaques & Hip Stasis-Meter ---
    gid_t = f'order_{sex}_keeper_robe'
    parts_t = []
    robe_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'slate'),
        B('bottom', 0.04, 0.14, 'fret', 'brass', 'orderblue', 0.08),
        B('top', 0.0, 0.03, 'solid', 'brass'),
    ], [
        # Heavy lead-lined `slate` & `orderblue` quilted containment apron down the center front (u=0.37..0.63)
        PN(0.37, 0.63, 'quilt', 'orderblue', 'slate', 0.14),
        PN(0.34, 0.37, 'solid', 'brass', 'omaroon', 1.0),
        PN(0.63, 0.66, 'solid', 'brass', 'omaroon', 1.0),
        # Dorsal containment spine column
        PN(0.0, 0.10, 'quilt', 'orderblue', 'slate', 0.14),
        PN(0.90, 1.0, 'quilt', 'orderblue', 'slate', 0.14),
    ], fabric='cloth.oiled')
    mantle_p = P('slate', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'brass'),
        B('bottom', 0.03, 0.08, 'dentils', 'osaffron', 'omaroon', 0.04),
    ], fabric='cloth.oiled')
    sl_p = P('orderblue', 0.04, [
        B('bottom', 0.0, 0.08, 'quilt', 'brass', 'slate', 0.08),
        B('bottom', 0.08, 0.10, 'solid', 'osaffron'),
    ], fabric='cloth.oiled')

    parts_t.append(torso_tube(gid_t, core.TOP, core.ANKLE + 0.04, 0.018, robe_p,
                              hang_from=core.WAIST - 0.03, flare=0.18, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02))
    parts_t.append(collar_disc(gid_t + '_lead_mantle', 0.16, mantle_p, drop=0.11, rows=7, n=42, scallop=0.04, ease=0.034))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.020, sl_p, ease_end=0.038, rows=9))

    # Wide bronze-and-lead containment waist girdle
    belt_p = P('slate', 0.03, [
        B('top', 0.0, 0.015, 'solid', 'brass'),
        B('bottom', 0.0, 0.015, 'solid', 'brass'),
    ], [PN(0.45, 0.55, 'procrastinator_wheel', 'godteal', 'brass', 0.08)], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_belt', core.WAIST + 0.04, core.WAIST - 0.04, 0.032, belt_p, rows=4, n=42, hull_from=core.WAIST + 0.1))

    # Ring of 7 Engraved Bronze Seal Pass-Plaques (LS-001..LS-007) + 1 Blank Lead Plaque (LS-008) across the chest!
    plaque_bronze = P('brass', 0.02, [B('top', 0.0, 0.008, 'solid', 'osaffron'), B('bottom', 0.0, 0.008, 'solid', 'godteal')], fabric='metal.gold')
    plaque_blank = P('slate', 0.02, [B('top', 0.0, 0.006, 'solid', 'iron')], fabric='metal.iron')
    for idx_p in range(8):
        ang_p = -0.30 * math.pi + 0.60 * math.pi * (idx_p / 7.0)
        z_p = core.CHEST + 0.01 - 0.055 * math.cos(ang_p * 1.3)
        x_p = 0.115 * math.sin(ang_p)
        pos_p = chest_front(z_p, 0.044, x=x_p)
        p_mat = plaque_blank if idx_p == 7 else plaque_bronze
        parts_t.append(blob(f'{gid_t}_seal_plaque_{idx_p}', pos_p, (0.022, 0.012, 0.034), p_mat,
                            n=8, rows=5, out=FRONT, rigid_joint='Spine2'))

    # Handheld Portable Prayer-Wheel Stasis-Meter slung at the right hip (glowing `godteal` cylinder)
    c_hip = spine_at(core.WAIST - 0.06)
    d_meter = np.array([-0.82, -0.55, 0.0])
    d_meter /= np.linalg.norm(d_meter)
    pos_m = surface_out(c_hip, d_meter, 0.058)
    meter_p = P('brass', 0.02, [
        B('top', 0.0, 0.022, 'solid', 'slate'),
        B('bottom', 0.0, 0.022, 'solid', 'slate'),
    ], [PN(0.0, 1.0, 'procrastinator_wheel', 'godteal', 'orderblue', 0.06)], fabric='metal.gold')
    parts_t.append(tube(gid_t + '_stasis_meter', [pos_m + np.array([0, 0, 0.065]), pos_m - np.array([0, 0, 0.065])],
                        0.034, meter_p, n=14, rigid_joint='Hips'))

    entries.append(assemble_garment(gid_t, 'Keeper Lead-Lined Containment Robe & Eight Seal Plaques', 'torso', 'historians', parts_t))

    # --- BACK: Dorsal Procrastinator Stasis-Capacitor & Relic-Containment Cask ---
    gid_b = f'order_{sex}_keeper_pack'
    parts_b = []
    back_c = spine_at(core.CHEST - 0.02) + np.array([0.0, 0.155, 0.0])

    # Central vertical Bronze & Glowing-Godteal Prayer-Wheel Stasis Drum (length = 0.30m)
    drum_p = P('brass', 0.02, [
        B('top', 0.0, 0.035, 'solid', 'slate'),
        B('bottom', 0.0, 0.035, 'solid', 'slate'),
        B('top', 0.035, 0.050, 'solid', 'gold'),
        B('bottom', 0.035, 0.050, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'procrastinator_wheel', 'godteal', 'omaroon', 0.10),
    ], fabric='metal.gold')
    parts_b.append(tube(gid_b + '_stasis_drum', [back_c + np.array([0.0, 0.0, 0.16]), back_c + np.array([0.0, 0.0, -0.14])],
                        0.085, drum_p, n=18, rigid_joint='Spine2'))
    lid_p = P('brass', 0.02, [B('top', 0.0, 0.35, 'procrastinator_wheel', 'godteal', 'slate', 0.06)], fabric='metal.gold')
    parts_b.append(blob(gid_b + '_drum_lid_top', back_c + np.array([0.0, 0.0, 0.162]), (0.172, 0.028, 0.172), lid_p,
                        n=18, rows=5, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_drum_lid_bot', back_c + np.array([0.0, 0.0, -0.142]), (0.172, 0.028, 0.172), lid_p,
                        n=18, rows=5, out=np.array([0.0, 0.0, -1.0]), rigid_joint='Spine2'))

    # Twin flanking lead-shielded relic containment tubes (length = 0.24m) + shoulder harness straps
    lead_tube_p = P('slate', 0.03, [
        B('top', 0.0, 0.035, 'solid', 'brass'),
        B('bottom', 0.0, 0.035, 'solid', 'brass'),
        B('top', 0.08, 0.16, 'solid', 'godteal'),
    ], fabric='metal.iron')
    for sd, tag in ((-1, 'R'), (1, 'L')):
        t_c = back_c + np.array([sd * 0.105, -0.015, 0.0])
        parts_b.append(tube(f'{gid_b}_relic_tube_{tag}', [t_c + np.array([0, 0, 0.13]), t_c + np.array([0, 0, -0.11])],
                            0.034, lead_tube_p, n=12, rigid_joint='Spine2'))
        parts_b.append(blob(f'{gid_b}_relic_lid_top_{tag}', t_c + np.array([0, 0, 0.132]), (0.070, 0.018, 0.070), lid_p,
                            n=12, rows=4, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
        parts_b.append(blob(f'{gid_b}_relic_lid_bot_{tag}', t_c + np.array([0, 0, -0.112]), (0.070, 0.018, 0.070), lid_p,
                            n=12, rows=4, out=np.array([0.0, 0.0, -1.0]), rigid_joint='Spine2'))
        st_a = back_c + np.array([sd * 0.075, -0.05, 0.12])
        st_b = spine_at(core.TOP + 0.005) + np.array([sd * 0.095, -0.01, 0.025])
        st_c = chest_front(core.CHEST + 0.02, 0.042, x=sd * 0.095)
        parts_b.append(horn(f'{gid_b}_strap_{tag}', [st_a, st_b, st_c], 0.015, 0.012,
                            P('slate', 0.04, [B('top', 0.0, 0.03, 'solid', 'brass')], fabric='leather.polished'),
                            n=8, rows=6, rigid_joint='Spine2'))

    entries.append(assemble_garment(gid_b, 'Keeper Procrastinator Stasis-Drum & Relic Cask', 'back', 'historians', parts_b))

    # --- FEET: Heavy Lead-Soled Muffled Vault Boots ---
    gid_f = f'order_{sex}_keeper_boots'
    parts_f = boots(gid_f, P('slate', 0.04, fabric='metal.iron'),
                    P('omaroon', 0.04, [B('top', 0.0, 0.04, 'solid', 'brass'), B('bottom', 0.0, 0.03, 'solid', 'slate')], fabric=WOOL),
                    top=0.52, ease_top=0.032)
    entries.append(assemble_garment(gid_f, 'Keeper Lead-Soled Vault Containment Boots', 'feet', 'historians', parts_f))
    return entries


# ===========================================================================================================
# 4. MASTER OF ARMS / PROCRASTINATOR CHRONO-MONK (`order_m/f_chronomonk_*`)
# ===========================================================================================================
def _build_order_chronomonk(sex, body_id):
    """Master of Arms / Procrastinator Chrono-Monk — Lightning Kung-Fu (`order_m/f_chronomonk_*`)."""
    set_body(body_id)
    entries = []

    # --- HEADPIECE: Braided Saffron Brow-Cord & Third-Eye Evidential Medallion (`covers_hair=False`) ---
    gid_h = f'order_{sex}_chronomonk_band'
    a, b, up, bk, left = head_frame()
    parts_h = []

    band_p = P('osaffron', 0.04, [
        B('top', 0.0, 0.007, 'solid', 'gold'),
        B('bottom', 0.0, 0.007, 'solid', 'omaroon'),
    ], fabric=COTTON)
    parts_h.append(crown_band(gid_h + '_browband', band_p, f0=0.52, f1=0.68, ease=0.014, flare=0.004, rows=5, n=36))

    # Cast-bronze & glowing `godteal` Third-Eye Inferred Evidential Medallion on the glabella/brow
    c_brow = a + (b - a) * 0.59
    h_brow = first_hit(c_brow, -bk) or 0.102
    brow_c = c_brow - bk * (h_brow + 0.024)
    parts_h.append(rosette(gid_h + '_third_eye', brow_c, -bk, left, 0.028,
                           P('brass', 0.02, [B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'brass', 0.035)], fabric='metal.gold'),
                           n=12, thick=0.012, rigid_joint='Head'))

    # Twin trailing saffron & gold headband tails behind the occiput
    for sd, tag in ((-1, 'R'), (1, 'L')):
        t0 = a + (b - a) * 0.54 + bk * 0.105 + left * (sd * 0.028)
        t1 = t0 + bk * 0.055 - up * 0.095 + left * (sd * 0.042)
        t2 = t1 + bk * 0.035 - up * 0.115 + left * (sd * 0.020)
        parts_h.append(horn(f'{gid_h}_tail_{tag}', [t0, t1, t2], 0.016, 0.006, band_p, n=8, rows=6, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, 'Chrono-Monk Third-Eye Evidential Brow-Cord', 'head', 'historians', parts_h,
                                    covers_hair=False, covers_face=False))

    # --- TORSO: Martial Kesa Tunic, Brass & Godteal Prayer-Wheel Kidney Belt & Forearm Bracers ---
    gid_t = f'order_{sex}_chronomonk_robe'
    parts_t = []
    tunic_p = P('osaffron', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'omaroon'),
        B('bottom', 0.03, 0.07, 'fret', 'gold', 'orderblue', 0.06),
        B('top', 0.0, 0.02, 'solid', 'orderblue'),
    ], [
        # Close-fitting `orderblue` martial undershirt visible at right chest & flank (u=0.52..0.78)
        PN(0.52, 0.78, 'quilt', 'indigo', 'orderblue', 0.10, down=core.TOP - core.WAIST + 0.02),
        PN(0.48, 0.52, 'solid', 'gold', 'omaroon', 1.0, down=core.TOP - core.WAIST + 0.02),
    ], fabric=COTTON)
    zen_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.0, 0.018, 'solid', 'osaffron'),
    ], fabric=WOOL)

    hem = core.CROTCH - 0.12 if sex == 'm' else core.CROTCH - 0.15
    parts_t.append(torso_tube(gid_t, core.TOP, hem, 0.014, tunic_p,
                              hang_from=core.WAIST - 0.02, flare=0.11, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02))
    # Diagonal martial kesa sash across the left shoulder to right hip
    parts_t.append(band(gid_t + '_kesa', core.WAIST + 0.01, core.SHOULDER + 0.03, 0.11, 0.036, zen_p, high=math.pi / 2, rows=5))
    # Short capped martial shoulder-sleeves leaving elbows bare for lightning strikes
    parts_t.extend(sleeves(gid_t, 'elbow', 0.018, P('orderblue', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'gold')], fabric=COTTON),
                           ease_end=0.024, rows=5))

    # Wide Brass-and-Godteal Prayer-Wheel Kidney Belt + 6 miniature counter-rotating temporal-capacitor cylinders!
    belt_p = P('omaroon', 0.03, [
        B('top', 0.0, 0.015, 'solid', 'brass'),
        B('bottom', 0.0, 0.015, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'quilt', 'gold', 'omaroon', 0.08)], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', core.WAIST + 0.045, core.WAIST - 0.045, 0.030, belt_p, rows=4, n=42, hull_from=core.WAIST + 0.1))

    wheel_p = P('brass', 0.02, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'procrastinator_wheel', 'godteal', 'orderblue', 0.05)], fabric='metal.gold')
    c_w = spine_at(core.WAIST)
    for wi in range(6):
        ang_w = math.pi + (wi - 2.5) * 0.36
        d_w = np.array([math.sin(ang_w), math.cos(ang_w), 0.0])
        pos_w = surface_out(c_w, d_w, 0.048)
        parts_t.append(tube(f'{gid_t}_pwheel_{wi}', [pos_w + np.array([0, 0, 0.038]), pos_w - np.array([0, 0, 0.038])],
                            0.022, wheel_p, n=12, rigid_joint='Hips'))

    # Bronze-splinted `orderblue` & `godteal` Forearm Lightning-Bracers
    bracer_p = P('orderblue', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'brass'),
        B('bottom', 0.0, 0.02, 'solid', 'brass'),
    ], [
        PN(0.20, 0.80, 'procrastinator_wheel', 'godteal', 'brass', 0.07),
    ], fabric='metal.bronze')
    for s in (L, R):
        e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        vb = limb_tube(f'{gid_t}_bracer_{s[0]}', e_j + (h_j - e_j) * 0.14, e_j + (h_j - e_j) * 0.88,
                       0.016, bracer_p, n=16, rows=6, bvh=core.BVH_A, rmax=0.10)
        vb.rigid_joint = s + 'ForeArm'
        parts_t.append(vb)

    entries.append(assemble_garment(gid_t, 'Chrono-Monk Martial Kesa & Prayer-Wheel Kidney Belt', 'torso', 'historians', parts_t))

    # --- LEGS: Gathered Martial Breeches ---
    gid_l = f'order_{sex}_chronomonk_pants'
    pants_p = P('omaroon', 0.05, [
        B('bottom', 0.0, 0.035, 'solid', 'osaffron'),
        B('bottom', 0.035, 0.06, 'solid', 'orderblue'),
    ], fabric=COTTON)
    parts_l = trousers(gid_l, pants_p, ease=0.018, ease_end=0.014, cuff=core.ANKLE + 0.09)
    entries.append(assemble_garment(gid_l, 'Chrono-Monk Gathered Martial Breeches', 'legs', 'historians', parts_l, legged=True))

    # --- FEET: Spiral Shin-Puttees & Monastic Martial Sandals ---
    gid_f = f'order_{sex}_chronomonk_puttees'
    puttee_p = P('orderblue', 0.04, [
        B('top', 0.0, 0.03, 'solid', 'brass'),
        B('top', 0.03, 0.42, 'stripes', 'osaffron', 'orderblue', 0.022),
        B('bottom', 0.0, 0.03, 'solid', 'omaroon'),
    ], fabric=COTTON)
    parts_f = boots(gid_f, P('earth', 0.08), puttee_p, top=0.54, ease_top=0.024)
    entries.append(assemble_garment(gid_f, 'Chrono-Monk Spiral Puttees & Martial Tabi', 'feet', 'historians', parts_f))
    return entries


# ===========================================================================================================
# 5. LONGSONG CITADEL WARDEN / DOB-DOB MONASTIC GUARD (`order_m/f_warden_*`)
# ===========================================================================================================
def _build_order_warden(sex, body_id):
    """Longsong Citadel Warden / Dob-dob Monastic Guard (`order_m/f_warden_*`)."""
    set_body(body_id)
    entries = []

    # --- HEADPIECE: Tibetan 8-Plate Fluted Iron-and-Brass Helmet, Quilted Aventail & Saffron-Maroon Crest ---
    gid_h = f'order_{sex}_warden_helm'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Quilted `omaroon` & brass-studded neck/cheek aventail draping behind the ears & nape
    av_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'brass'),
        B('top', 0.0, 0.02, 'solid', 'osaffron'),
    ], [PN(0.0, 1.0, 'quilt', 'brass', 'omaroon', 0.07)], fabric=WOOL)
    fs_av = np.linspace(-0.24, 0.48, 7)
    angs_av = np.linspace(-0.62 * math.pi, 0.62 * math.pi, 26)
    Av_grid = []
    for k_a, f in enumerate(fs_av):
        f_ray = max(f, 0.38)
        c_ray = a + (b - a) * f_ray
        c = a + (b - a) * f
        Av_grid.append([p + (c - c_ray) + bk * (0.016 * (1.0 - k_a / 6.0))
                        for p in ring_points(c_ray, bk, left, angs_av, 0.022 + 0.018 * (1.0 - k_a / 6.0), rmin=0.05, rmax=0.20)])
    parts_h.append(Part(gid_h + '_aventail', np.array(Av_grid), False, ['body'] * len(fs_av), av_p, rigid_joint='Head'))

    # 2. Domed Tibetan eight-plate fluted iron-and-brass citadel helmet bowl
    helm_p = P('iron', 0.03, [
        B('bottom', 0.0, 0.035, 'solid', 'brass'),
        B('bottom', 0.035, 0.075, 'fret', 'osaffron', 'omaroon', 0.05),
        B('top', 0.0, 0.04, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'fluted', 'brass', 'iron', 0.09),
    ], fabric='metal.iron')
    parts_h.append(tower_hat(gid_h + '_dome', 0.16, lambda s: 1.05 * (1.0 - 0.52 * (s ** 1.7)), helm_p,
                             f=0.48, ease=0.024, rows=10, n=36))

    # 3. Embossed brass Dharma-Wheel brow-plate + sagittal yak-hair plume crest
    c_brow = a + (b - a) * 0.56
    h_brow = first_hit(c_brow, -bk) or 0.102
    brow_c = c_brow - bk * (h_brow + 0.032)
    parts_h.append(rosette(gid_h + '_brow_seal', brow_c, -bk, left, 0.032,
                           P('brass', 0.02, [B('top', 0.0, 0.45, 'procrastinator_wheel', 'osaffron', 'brass', 0.04)], fabric='metal.gold'),
                           n=12, thick=0.012, rigid_joint='Head'))
    crest_p = P('osaffron', 0.05, [
        B('top', 0.0, 0.05, 'stripes', 'omaroon', 'osaffron', 0.015),
        B('bottom', 0.0, 0.018, 'solid', 'brass'),
    ], fabric=WOOL)
    parts_h.append(crest(gid_h + '_plume', 0.085, crest_p, rows=6, cols=15, sweep=0.05, a0=-0.9, a1=1.7))

    entries.append(assemble_garment(gid_h, 'Citadel Warden Fluted Iron-Brass Helmet & Plume', 'head', 'historians', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- TORSO: Iron-and-Brass Lamellar Brigandine over Saffron Robes + Bronze Melong Mirror-Gorget ---
    gid_t = f'order_{sex}_warden_cuirass'
    parts_t = []
    # Lower saffron & maroon monastic robe skirt beneath the lamellar brigandine
    skirt_p = P('osaffron', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'omaroon'),
        B('bottom', 0.03, 0.12, 'quilt', 'brass', 'orderblue', 0.10),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_robe_skirt', core.WAIST + 0.02, core.KNEE - 0.12, 0.020, skirt_p,
                              n=46, rows=11, hang_from=core.WAIST - 0.02, flare=0.14, group_below=core.CROTCH + 0.02, hull_from=core.WAIST))

    # Upper torso iron, brass & maroon lamellar brigandine cuirass
    cuirass_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'brass'),
        B('bottom', 0.0, 0.06, 'dentils', 'brass', 'iron', 0.04),
    ], [
        PN(0.0, 1.0, 'polos_mosaic', 'iron', 'omaroon', 0.09),
        PN(0.42, 0.58, 'polos_mosaic', 'brass', 'orderblue', 0.08),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_cuirass', core.TOP + 0.005, core.CROTCH + 0.04, 0.026, cuirass_p,
                              n=48, rows=14, hang_from=core.WAIST - 0.02, flare=0.07, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02))

    # Polished round bronze Melong Mirror-Gorget on the sternum
    melong_c = chest_front(core.CHEST, 0.046)
    parts_t.append(rosette(gid_t + '_melong', melong_c, FRONT, np.array([1.0, 0, 0]), 0.068,
                           P('brass', 0.02, [B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'brass', 0.05)], fabric='metal.gold'),
                           n=18, thick=0.018, rigid_joint='Spine2'))

    # Lamellar shoulder pauldrons + saffron sleeves + iron-and-brass vambraces
    sh_p = P('orderblue', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'brass'),
        B('top', 0.0, 0.02, 'solid', 'osaffron'),
    ], [PN(0.0, 1.0, 'polos_mosaic', 'brass', 'orderblue', 0.08)], fabric='metal.bronze')
    parts_t.append(pauldron(gid_t + '_pauldron_L', L, sh_p, reach=0.48, ease=0.038, flare_end=1.15))
    parts_t.append(pauldron(gid_t + '_pauldron_R', R, sh_p, reach=0.48, ease=0.038, flare_end=1.15))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, P('osaffron', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'omaroon')], fabric=COTTON),
                           ease_end=0.028, rows=9))
    for s in (L, R):
        e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        vb = limb_tube(f'{gid_t}_vambrace_{s[0]}', e_j + (h_j - e_j) * 0.14, e_j + (h_j - e_j) * 0.86,
                       0.020, sh_p, n=16, rows=6, bvh=core.BVH_A, rmax=0.10)
        vb.rigid_joint = s + 'ForeArm'
        parts_t.append(vb)

    # Studded leather & brass war-belt
    belt_p = P('leather', 0.04, [B('top', 0.0, 0.012, 'solid', 'brass'), B('bottom', 0.0, 0.012, 'solid', 'brass')],
               [PN(0.46, 0.54, 'solid', 'brass', 'leather', 1.0)])
    parts_t.append(torso_tube(gid_t + '_war_belt', core.WAIST + 0.04, core.WAIST - 0.04, 0.034, belt_p, rows=4, n=42))

    entries.append(assemble_garment(gid_t, 'Citadel Warden Lamellar Brigandine & Melong Mirror-Gorget', 'torso', 'historians', parts_t))

    # --- LEGS: Heavy Wool Citadel Guard Trousers ---
    gid_l = f'order_{sex}_warden_trousers'
    trou_p = P('yakbrown', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'omaroon')], fabric=WOOL)
    parts_l = trousers(gid_l, trou_p, ease=0.014, ease_end=0.020, cuff=core.ANKLE + 0.06)
    entries.append(assemble_garment(gid_l, 'Citadel Warden Heavy Wool Trousers', 'legs', 'historians', parts_l, legged=True))

    # --- FEET: Tall Tibetan Felt-and-Leather Guard Boots ---
    gid_f = f'order_{sex}_warden_boots'
    boot_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.04, 'solid', 'brass'),
        B('top', 0.04, 0.08, 'stripes', 'osaffron', 'orderblue', 0.018),
    ], fabric='leather.polished')
    parts_f = boots(gid_f, P('soot', 0.08), boot_p, top=0.56, ease_top=0.034)
    entries.append(assemble_garment(gid_f, 'Citadel Warden Felt-and-Leather Guard Boots', 'feet', 'historians', parts_f))
    return entries


# ===========================================================================================================
# 6. FESTIVAL OF THE REGISTER CHAM DANCER (`order_m/f_cham_*`)
# ===========================================================================================================
def _build_order_cham(sex, body_id):
    """Festival of the Register Cham Dancer — Shanag Black-Hat & Bone Apron (`order_m/f_cham_*`)."""
    set_body(body_id)
    entries = []

    # --- HEADPIECE: Shanag Black-Hat with Wide Saucer Brim, Skull-and-Vajra Spire & Wrathful Cham Mask ---
    gid_h = f'order_{sex}_cham_hat'
    a, b, up, bk, left = head_frame()
    parts_h = []

    # 1. Wrathful Dharmapala Charnel-Lord Ritual Mask (`cham_mask` motif with 3 blazing eyes & fanged grimace)
    mask_p = P('omaroon', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'gold'),
        B('bottom', 0.0, 0.02, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'cham_mask', 'gold', 'holyred', 1.0),
    ], fabric='leather.polished')
    parts_h.append(sculpted_faceplate(gid_h + '_mask', mask_p, f_top=0.76, f_bot=-0.05, ease=0.016, span=0.47, rows=16, cols=25))
    parts_h.append(sculpted_cranium(gid_h + '_cranium', P('soot', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'gold')], fabric='cloth.silk'),
                                    f_top=0.98, f_bot=0.05, ease=0.016, rows=10, n=32))

    # 2. The Shanag (Black Hat): wide black-silk & rainbow-gold brocade saucer brim at f=0.68
    brim_p = P('soot', 0.03, [
        B('bottom', 0.0, 0.02, 'solid', 'gold'),
        B('bottom', 0.02, 0.05, 'diamonds', 'osaffron', 'omaroon', 0.045),
        B('top', 0.0, 0.03, 'solid', 'orderblue'),
    ], fabric='cloth.silk')
    parts_h.append(brim(gid_h + '_shanag_brim', 0.66, 0.195, brim_p, ease=0.020, rows=7, n=44, lift=0.028, scallop=0.03))

    # 3. Towering tiered gold-and-black spire crowned with a miniature carved skull and gilded Vajra finial!
    spire_p = P('soot', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'gold'),
        B('top', 0.0, 0.05, 'rays', 'gold', 'orderblue', 0.03),
    ], [
        PN(0.0, 1.0, 'baroque_scroll', 'gold', 'soot', 0.10),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_spire', 0.24, lambda s: 0.88 * ((1.0 - 0.65 * s) ** 1.15), spire_p,
                             f=0.66, ease=0.018, rows=12, n=36))

    c_skull = a + (b - a) * 0.66 + up * 0.15 - bk * 0.045
    parts_h.append(blob(gid_h + '_skull_ornament', c_skull, (0.028, 0.022, 0.034),
                        P('bone', 0.02, [B('bottom', 0.0, 0.25, 'solid', 'soot')]), n=10, rows=5, out=-bk, rigid_joint='Head'))
    c_vajra = a + (b - a) * 0.66 + up * 0.24
    parts_h.append(horn(gid_h + '_vajra_finial', [c_vajra, c_vajra + up * 0.095], 0.022, 0.004,
                        P('gold', 0.02, [B('top', 0.0, 0.3, 'solid', 'godteal')], fabric='metal.gold'),
                        n=10, rows=6, rigid_joint='Head'))

    # 4. Five-color silk brocade streamers trailing down the back of the Shanag hat
    for idx_s, col_s in enumerate(('osaffron', 'orderblue', 'omaroon', 'peacock')):
        ang_s = (-0.24 + 0.16 * idx_s) * math.pi
        s_top = a + (b - a) * 0.62 + bk * 0.115 + left * (0.09 * math.sin(ang_s))
        s_mid = s_top + bk * 0.04 - up * 0.14 + left * (0.03 * math.sin(ang_s))
        s_bot = s_mid + bk * 0.02 - up * 0.16
        parts_h.append(horn(f'{gid_h}_streamer_{idx_s}', [s_top, s_mid, s_bot], 0.020, 0.010,
                            P(col_s, 0.03, [B('bottom', 0.0, 0.15, 'solid', 'gold')], fabric='cloth.silk'),
                            n=8, rows=6, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, 'Festival of the Register Shanag Black-Hat & Cham Mask', 'head', 'historians', parts_h,
                                    covers_hair=True, covers_face=True))

    # --- TORSO: Brocade Cham Dance Vestment, Cloud-Poncho Yoke, Melong Mirror & Carved Bone Apron (Rgyan Drug) ---
    gid_t = f'order_{sex}_cham_robe'
    parts_t = []
    robe_p = P('omaroon', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'gold'),
        B('bottom', 0.03, 0.14, 'baroque_scroll', 'gold', 'orderblue', 0.10),
        B('bottom', 0.14, 0.17, 'solid', 'osaffron'),
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], [
        # Carved ivory Bone-Bead Ritual Apron (Rgyan Drug) lattice over the front skirt (u=0.36..0.64)
        PN(0.36, 0.64, 'bone_apron', 'bone', 'orderblue', 0.18),
        PN(0.33, 0.36, 'solid', 'gold', 'osaffron', 1.0),
        PN(0.64, 0.67, 'solid', 'gold', 'osaffron', 1.0),
    ], fabric='cloth.silk')
    yoke_p = P('orderblue', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'gold'),
        B('bottom', 0.03, 0.10, 'diamonds', 'osaffron', 'omaroon', 0.05),
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], fabric='cloth.silk')
    sl_p = P('osaffron', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'gold'),
        B('bottom', 0.04, 0.16, 'baroque_scroll', 'gold', 'orderblue', 0.09),
        B('top', 0.0, 0.06, 'solid', 'omaroon'),
    ], fabric='cloth.silk')

    parts_t.append(torso_tube(gid_t, core.TOP, core.ANKLE + 0.04, 0.016, robe_p,
                              hang_from=core.WAIST - 0.03, flare=0.22, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02))
    # Wide scalloped Tibetan cloud-collar poncho yoke (`dorje` shoulders)
    parts_t.append(collar_disc(gid_t + '_cloud_yoke', 0.185, yoke_p, drop=0.145, rows=8, n=44, scallop=0.08, ease=0.036))
    # Wide flaring ceremonial dance sleeves
    parts_t.extend(sleeves(gid_t, 'wrist', 0.020, sl_p, ease_end=0.085, rows=10))

    # Carved bone-bead belt + circular bronze Melong mirror on the chest
    belt_p = P('bone', 0.02, [
        B('top', 0.0, 0.015, 'solid', 'gold'),
        B('bottom', 0.0, 0.015, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'beads', 'bone', 'omaroon', 0.04)])
    parts_t.append(torso_tube(gid_t + '_bone_belt', core.WAIST + 0.04, core.WAIST - 0.04, 0.030, belt_p, rows=4, n=42, hull_from=core.WAIST + 0.1))

    melong_c = chest_front(core.CHEST - 0.01, 0.046)
    parts_t.append(rosette(gid_t + '_melong', melong_c, FRONT, np.array([1.0, 0, 0]), 0.062,
                           P('gold', 0.02, [B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'gold', 0.045)], fabric='metal.gold'),
                           n=16, thick=0.016, rigid_joint='Spine2'))

    entries.append(assemble_garment(gid_t, 'Festival of the Register Cham Robe & Bone Apron', 'torso', 'historians', parts_t))
    return entries


# ===========================================================================================================
# 7. OIDONG LAY SERVANT, ARTISAN & LAY SCHOLAR OF THE LOWER WARD (`order_m/f_servant_*`)
# ===========================================================================================================
def _build_order_servant(sex, body_id):
    """Oidong Lay Servant, Artisan & Lay Scholar of the Lower Ward (`order_m/f_servant_*`)."""
    set_body(body_id)
    entries = []

    # --- HEADPIECE: Oidong Four-Ear Felt-and-Fleece Cap (Tsering Koko) ---
    gid_h = f'order_{sex}_servant_cap'
    a, b, up, bk, left = head_frame()
    parts_h = []

    cap_p = P('orderblue', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.03, 'diamonds', 'gold', 'omaroon', 0.04),
    ], fabric=WOOL)
    fleece_p = P('yakbrown', 0.07, [
        B('top', 0.0, 0.02, 'solid', 'cream'),
    ], fabric='fur.short')
    parts_h.append(head_rings(gid_h + '_crown', 0.58, 1.00, 0.018, cap_p, n=32, rows=6, apex=True))
    # Upturned 4-lobed fleece brim band around the temples and brow
    parts_h.append(brim(gid_h + '_fleece_cuff', 0.58, 0.036, fleece_p, ease=0.018, rows=4, n=36, lift=0.032, scallop=0.14))

    entries.append(assemble_garment(gid_h, 'Oidong Lower-Ward Felt & Fleece Cap', 'head', 'historians', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- TORSO: Belted Oidong Wool Chuba & Striped Pangden Apron ---
    gid_t = f'order_{sex}_servant_chuba'
    parts_t = []
    chuba_p = P('yakbrown', 0.05, [
        B('bottom', 0.0, 0.03, 'solid', 'orderblue'),
        B('bottom', 0.03, 0.06, 'solid', 'osaffron'),
        B('top', 0.0, 0.02, 'solid', 'cream'),
    ], [
        # Woven horizontal-striped Oidong Pangden work-apron down the center front (u=0.38..0.62)
        PN(0.38, 0.62, 'stripes', 'osaffron', 'orderblue', 0.045),
        PN(0.36, 0.38, 'solid', 'omaroon', 'yakbrown', 1.0),
        PN(0.62, 0.64, 'solid', 'omaroon', 'yakbrown', 1.0),
    ], fabric=WOOL)
    sl_p = P('cream', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'orderblue'),
        B('bottom', 0.04, 0.06, 'solid', 'osaffron'),
    ], fabric=COTTON)

    hem = core.KNEE - 0.14 if sex == 'm' else core.ANKLE + 0.05
    parts_t.append(torso_tube(gid_t, core.TOP, hem, 0.014, chuba_p,
                              hang_from=core.WAIST - 0.03, flare=0.16, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('orderblue', 0.04, [B('top', 0.0, 0.01, 'solid', 'osaffron')]), high=0.042))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.034, rows=9))

    # Belted sash with brass scholar's ink-case & wooden tea-bowl pouch
    sash_p = P('omaroon', 0.04, [B('top', 0.0, 0.012, 'solid', 'osaffron'), B('bottom', 0.0, 0.012, 'solid', 'osaffron')], fabric=WOOL)
    pouch_p = P('saddle', 0.05, [B('top', 0.0, 0.025, 'solid', 'brass')])
    parts_t.extend(pouch_belt(gid_t, sash_p, pouch_p, ease=0.032))

    entries.append(assemble_garment(gid_t, 'Oidong Lower-Ward Chuba & Striped Pangden Apron', 'torso', 'historians', parts_t))
    return entries


# ===========================================================================================================
# ENTRY POINT
# ===========================================================================================================
def build_historians_kit():
    """Build all Order of Historians (Longsong) cultural wardrobe pieces across male and female bodies."""
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_order_cartographer(sex, body_id))
        entries.extend(_build_order_listener(sex, body_id))
        entries.extend(_build_order_keeper(sex, body_id))
        entries.extend(_build_order_chronomonk(sex, body_id))
        entries.extend(_build_order_warden(sex, body_id))
        entries.extend(_build_order_cham(sex, body_id))
        entries.extend(_build_order_servant(sex, body_id))
    return entries
