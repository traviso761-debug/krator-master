"""Dasri Wardrobe Part 2 (`dasri_confederacy`): Martial Units, Clergy & Oracles, Nobles & PC Hero (Tiers 9–16).

Builds 100% procedural male (`mpfb_male`, `dsr_m_*`) and female (`mpfb_female`, `dsr_f_*`) pieces for:
9.  `dune_raider`          — N1 Shade Dune Raider / Ndee-Bisht Lancer
10. `canyon_warden`        — Shade Canyon Guard & Khafara Escort
11. `horse_outrider`       — Wahat al-Shamal Steppe-Horse Outrider
12. `aquifer_warden`       — Warden of the Deep Aquifer (Shade Waterfall Shrine)
13. `oracle`               — Gaan-Horned Desert Spirit-Dancer & Sand-Oracle
14. `jabal_syndic`         — Jabal Mafraj Tower-Syndic / Qamariya Emir
15. `patriarch`            — Majlis Paramount Shaykh of the Horns
16. `pc_mezcalero_corsair` — Crimson Bisht & Buckskin Desert-Stalker (100% Procedural PC Hero)
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment
)
from ..paint import P, B, PN, COTTON, WOOL
from ..types.torso import (
    torso_tube, stand_collar, collar_disc, cape, tabard, crossed_sash, pauldron
)
from ..types.limbs import sleeves, trousers
from ..types.headgear import (
    sculpted_cranium, sculpted_faceplate, hood, tower_hat, crown_band, horn
)
from ..types.accoutrements import (
    blob, pack_straps, tube, rosette
)
from .dasri_common import (
    ndee_boots, jambiya_daggers, hirz_amulet_box,
    apache_war_headband, keffiyeh_iqal_head,
    apache_warshirt_yoke, breechclout_sirwal, dasri_bracers
)


def _silver_chest_chain(gid_prefix, z_neck, w_loop, drop_z, coat_ease, paint, n_links=27):
    """Continuous 3D silver/gilt chain loop resting flush on the chest (`rigid_joint='Spine2'`)."""
    parts = []
    curve_pts = []
    n_curve = 21
    for k in range(n_curve):
        u = k / float(n_curve - 1)
        ang = (u - 0.5) * 0.92 * math.pi
        bx = math.sin(ang) * w_loop
        bz = z_neck - math.cos(ang) * drop_z
        curve_pts.append(chest_front(bz, coat_ease + 0.0035, x=bx))
    parts.append(horn(f'{gid_prefix}_cord', curve_pts, 0.0055, 0.0055, paint, n=8, rows=n_curve,
                      rigid_joint='Spine2', role='trinket'))
    for k in range(n_links):
        u = k / float(n_links - 1)
        ang = (u - 0.5) * 0.92 * math.pi
        bx = math.sin(ang) * w_loop
        bz = z_neck - math.cos(ang) * drop_z
        b_pos = chest_front(bz, coat_ease + 0.0040, x=bx)
        sx = 0.014 if (k % 2 == 0) else 0.011
        sz = 0.011 if (k % 2 == 0) else 0.014
        parts.append(blob(f'{gid_prefix}_link_{k}', b_pos, (sx, 0.009, sz), paint,
                          n=8, rows=4, out=FRONT, rigid_joint='Spine2', role='trinket'))
    return parts


# ===========================================================================================================
# 9. DUNE RAIDER: N1 Shade Dune Raider / Ndee-Bisht Lancer (`dune_raider`)
# ===========================================================================================================
def _build_dune_raider(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    )
    entries = []

    # HEAD: Concho-studded crimson Apache war-headband + black lower-face raid litham veil (ch=False, cf=True)
    gid_h = f'dsr_{sex}_raider_headband'
    band_p = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.006, 'solid', 'silver'),
        B('bottom', 0.0, 0.006, 'solid', 'silver'),
    ], [PN(0.0, 1.0, 'buckskin_concho', 'oasisturq', 'dragoncrimson', 0.06)], fabric=COTTON)
    concho_p = P('silver', 0.02, [B('top', 0.0, 0.006, 'solid', 'oasisturq')], fabric='metal.iron')
    lith_p = P('goatblack', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'dragoncrimson'),
        B('bottom', 0.0, 0.018, 'sadu_band', 'dragoncrimson', 'goatblack', 0.04),
    ], fabric='cloth.tent.black')
    parts_h = apache_war_headband(gid_h, band_p, concho_paint=concho_p, n_conchos=7,
                                  knot_tails=True, litham_paint=lith_p)
    entries.append(assemble_garment(gid_h, 'Concho Crimson War-Headband & Black Raid Litham', 'head', 'dasri', parts_h,
                                    covers_hair=False, covers_face=True))

    # TORSO: Ochre buckskin war-shirt + rawhide-and-brass lamellar cuirass + streaming black aba cape + twin jambiyas
    gid_t = f'dsr_{sex}_raider_cuirass'
    parts_t = []
    shirt_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.045, 'buckskin_concho', 'silver', 'smokebuck', 0.055),
    ], [
        PN(0.32, 0.68, 'lorica_lames', 'nahhascopper', 'smokebuck', 0.16, down=0.46),
        PN(0.0, 0.32, 'bone_lamellar', 'nahhascopper', 'goatblack', 0.16, down=0.42),
        PN(0.68, 1.0, 'bone_lamellar', 'nahhascopper', 'goatblack', 0.16, down=0.42),
    ], fabric='leather.buckskin')
    rd_shirt = torso_tube(gid_t + '_cuirass_shirt', TOP, WAIST - 0.036, 0.017, shirt_p,
                          n=46, rows=14, hull_from=CHEST + 0.02)
    rd_shirt.cloth = None
    parts_t.append(rd_shirt)
    yoke_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.028, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.05),
        B('top', 0.0, 0.012, 'solid', 'nahhascopper'),
    ], fabric='leather.buckskin')
    parts_t.extend(apache_warshirt_yoke(gid_t, yoke_p, shirt_ease=0.018))
    # Contoured black-and-crimson Bedouin aba raid-mantle over shoulders (clears dorsal shield & quiver cleanly!)
    aba_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.038, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.05),
        B('top', 0.0, 0.016, 'solid', 'dragoncrimson'),
    ], fabric='cloth.tent.black')
    parts_t.append(collar_disc(gid_t + '_aba_mantle', 0.105, aba_p, drop=0.098, scallop=0.06, ease=0.022, rows=8, n=44))

    belt_p = P('goatblack', 0.05, [], [
        PN(0.0, 1.0, 'buckskin_concho', 'silver', 'goatblack', 0.055),
    ], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.035, WAIST - 0.038, 0.025, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.026,
                                   hilt_paint=P('silver', 0.02, [B('top', 0.0, 0.012, 'solid', 'oasisturq')], fabric='metal.iron'),
                                   scabbard_paint=P('nahhascopper', 0.02, [B('bottom', 0.0, 0.022, 'solid', 'silver')], fabric='metal.bronze'),
                                   twin=True))
    # Nitrate horn & copper mezcal raid-canteen at hips
    c_hip = spine_at(WAIST - 0.032)
    d_can = np.array([0.85, -0.52, 0.0]) / np.linalg.norm([0.85, -0.52, 0.0])
    parts_t.append(blob(gid_t + '_mezcal_canteen', surface_out(c_hip, d_can, 0.026, bvh=core.BVH_T),
                        (0.066, 0.044, 0.082),
                        P('nahhascopper', 0.02, [B('top', 0.0, 0.016, 'solid', 'oasisturq')], fabric='metal.bronze'),
                        n=12, rows=5, out=d_can, role='accessory'))

    sl_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.045, 'lorica_lames', 'nahhascopper', 'goatblack', 0.045),
    ], fabric='leather.buckskin')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.024, rows=10))
    entries.append(assemble_garment(gid_t, 'Dune Raider Rawhide-Lamellar War-Shirt & Black Aba', 'torso', 'dasri', parts_t))

    # GLOVES: Studded rawhide & brass-splint lancer bracers
    gid_g = f'dsr_{sex}_raider_bracers'
    br_p = P('leather', 0.05, [
        B('top', 0.0, 0.016, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.016, 'solid', 'nahhascopper'),
    ], [PN(0.0, 1.0, 'lorica_lames', 'nahhascopper', 'goatblack', 0.05)], fabric='leather.polished')
    e_g = assemble_garment(gid_g, 'Dune Raider Brass-Splint Lancer Bracers', 'gloves', 'dasri',
                           dasri_bracers(gid_g, br_p, palm_paint=None, concho_paint=concho_p, f0=0.50))
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # LEGS: Beaded breechclout sirwal
    gid_l = f'dsr_{sex}_raider_sirwal'
    sir_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.045, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.045),
    ], fabric=COTTON)
    clout_p = P('dragoncrimson', 0.05, [
        B('bottom', 0.0, 0.045, 'buckskin_concho', 'silver', 'smokebuck', 0.05),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'oasisturq', 'dragoncrimson', 0.08)], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_l, 'Dune Raider Beaded Breechclout & Raid Sirwal', 'legs', 'dasri',
                                    breechclout_sirwal(gid_l, sir_p, clout_p), legged=True))

    # FEET: Turquoise-concho ndee boots
    gid_f = f'dsr_{sex}_raider_boots'
    boot_p = P('smokebuck', 0.06, [B('bottom', 0.0, 0.018, 'solid', 'goatblack')], fabric='leather.buckskin')
    cuff_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.028, 'buckskin_concho', 'oasisturq', 'goatblack', 0.045),
        B('top', 0.0, 0.012, 'solid', 'dragoncrimson'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'Turquoise-Concho Dune Raider Ndee Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.82, upturned=True, concho_paint=concho_p)))

    # BACK: Painted horned-sun Apache rawhide shield & 3-javelin quiver
    gid_b = f'dsr_{sex}_raider_buckler'
    parts_b = []
    c_bk = spine_at(CHEST + 0.01)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.112
    sh_c = c_bk + np.array([0.0, d_bk + 0.046, 0.0])
    shield_p = P('smokebuck', 0.05, [
        B('bottom', 0.0, 0.022, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'horned_sun_shield', 'nahhascopper', 'smokebuck', 0.22)], fabric='leather.buckskin')
    parts_b.append(rosette(gid_b + '_rawhide_buckler', sh_c, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                           0.195, shield_p, n=24, thick=0.018, rigid_joint='Spine2'))
    # Diagonal javelin quiver + 3 protruding javelin shafts behind buckler
    q_bot = sh_c + np.array([-0.085, 0.020, -0.15])
    q_top = sh_c + np.array([0.095, 0.020, 0.15])
    parts_b.append(tube(gid_b + '_quiver', [q_bot, q_top], 0.032,
                        P('smokebuck', 0.05, [B('top', 0.0, 0.028, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.04),
                                              B('bottom', 0.0, 0.022, 'solid', 'nahhascopper')], fabric='leather.buckskin'),
                        n=12, rigid_joint='Spine2'))
    for ji, off_j in enumerate((-0.016, 0.0, 0.016)):
        j_s = q_top + np.array([off_j, 0.0, -0.02])
        j_e = j_s + np.array([0.055, 0.005, 0.115])
        parts_b.append(horn(f'{gid_b}_jav_{ji}', [j_s, j_e], 0.006, 0.004,
                            P('maguey', 0.05, [B('top', 0.0, 0.025, 'solid', 'dragoncrimson')]),
                            n=6, rows=5, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('smokebuck', 0.05, [B('top', 0.0, 0.007, 'solid', 'silver')], fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Painted Horned-Sun Apache Rawhide Shield & Javelin Quiver', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 10. CANYON WARDEN: Shade Canyon Guard & Khafara Escort (`canyon_warden`)
# ===========================================================================================================
def _build_canyon_warden(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    )
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Fluted steel-and-brass kulah helmet wrapped w/ keffiyeh & mail aventail (ch=True, cf=False)
    gid_h = f'dsr_{sex}_warden_helm'
    steel_p = P('iron', 0.03, [
        B('bottom', 0.0, 0.020, 'solid', 'nahhascopper'),
    ], [PN(0.0, 1.0, 'fluted', 'nahhascopper', 'iron', 0.08)], fabric='metal.iron')
    mail_p = P('iron', 0.05, [
        B('bottom', 0.0, 0.024, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'lamellar_scale', 'nahhascopper', 'iron', 0.06)], fabric='metal.iron')
    kef_band_p = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.008, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.008, 'solid', 'jusschalk'),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'jusschalk', 'dragoncrimson', 0.06)], fabric=WOOL)
    parts_h = [
        hood(gid_h + '_mail_aventail', mail_p, ease=0.013, ease_low=0.015, open_front=0.92, low=-0.18, rows=11, n=34),
        sculpted_cranium(gid_h + '_kulah_dome', steel_p, f_top=1.04, f_bot=0.56, ease=0.018, rows=10, n=36),
        crown_band(gid_h + '_keffiyeh_wrap', kef_band_p, f0=0.56, f1=0.74, ease=0.020, flare=0.003, rows=5, n=36),
    ]
    # Apex finial spike + twin brass Shade horned-arch brow horns rooted directly on helmet wrap
    apex_pt = a + (b - a) * 1.04 + up * 0.014
    parts_h.append(horn(gid_h + '_apex_spike', [apex_pt - up * 0.010, apex_pt + up * 0.075], 0.016, 0.003,
                        P('nahhascopper', 0.02, fabric='metal.bronze'), n=8, rows=6, rigid_joint='Head'))
    c_br = a + (b - a) * 0.58
    h_br = first_hit(c_br, -bk) or 0.100
    brow_root = c_br - bk * (h_br + 0.022)
    parts_h.append(tube(gid_h + '_nasal_bar', [brow_root + up * 0.022, brow_root - up * 0.048], 0.006,
                        P('nahhascopper', 0.02, fabric='metal.bronze'), n=8, rigid_joint='Head'))
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        r0 = brow_root + left * (sd * 0.022)
        r1 = r0 + left * (sd * 0.032) + up * 0.042
        r2 = r1 + left * (sd * 0.008) + up * 0.045 + bk * 0.012
        parts_h.append(horn(f'{gid_h}_brow_horn_{tag}', [r0, r1, r2], 0.011, 0.003,
                            P('nahhascopper', 0.02, fabric='metal.bronze'), n=8, rows=7, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Shade Canyon Guard Kulah Helm & Mail Aventail', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Riveted mail-and-scale cuirass over crimson/chalk jabal surcoat + brass pauldrons & Khafara medallion
    gid_t = f'dsr_{sex}_warden_cuirass'
    parts_t = []
    cuir_p = P('dragoncrimson', 0.04, [
        B('bottom', 0.0, 0.030, 'solid', 'nahhascopper'),
        B('bottom', 0.030, 0.095, 'sadu_apache_chevron', 'jusschalk', 'dragoncrimson', 0.06),
    ], [
        PN(0.0, 1.0, 'lamellar_scale', 'nahhascopper', 'iron', 0.14, down=0.46),
        PN(0.40, 0.60, 'dasri_horns_blazon', 'nahhascopper', 'dragoncrimson', 0.18, down=0.36),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_cuirass', TOP, CROTCH - 0.08, 0.020, cuir_p,
                              n=46, rows=18, hang_from=WAIST + 0.01, flare=0.20, ease_bottom=0.028,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('nahhascopper', 0.02, [B('top', 0.0, 0.008, 'solid', 'iron')], fabric='metal.bronze'),
                                high=0.020))
    paul_p = P('iron', 0.03, [
        B('bottom', 0.0, 0.022, 'solid', 'nahhascopper'),
        B('top', 0.0, 0.016, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'lorica_lames', 'nahhascopper', 'iron', 0.06)], fabric='metal.iron')
    parts_t.append(pauldron(gid_t + '_pauldron_L', L, paul_p, reach=0.35, ease=0.024, flare_end=0.96))
    parts_t.append(pauldron(gid_t + '_pauldron_R', R, paul_p, reach=0.35, ease=0.024, flare_end=0.96))

    # Khafara safe-conduct brass toll-medallion on sternum
    p_med = chest_front(CHEST + 0.01, 0.023, x=0.0)
    parts_t.append(rosette(gid_t + '_khafara_medallion', p_med, FRONT, np.array([1.0, 0.0, 0.0]), 0.034,
                           P('nahhascopper', 0.02, [], [PN(0.0, 1.0, 'dasri_horns_blazon', 'rabbitgold', 'nahhascopper', 0.06)], fabric='metal.bronze'),
                           n=14, thick=0.010, rigid_joint='Spine2'))

    belt_p = P('iron', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.010, 'solid', 'nahhascopper'),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.034, WAIST - 0.038, 0.024, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.025,
                                   hilt_paint=P('nahhascopper', 0.02, fabric='metal.bronze'),
                                   scabbard_paint=P('iron', 0.03, [B('bottom', 0.0, 0.024, 'solid', 'nahhascopper')], fabric='metal.iron')))

    sl_p = P('dragoncrimson', 0.04, [
        B('bottom', 0.0, 0.065, 'lamellar_scale', 'nahhascopper', 'iron', 0.045),
    ], fabric=WOOL)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.025, rows=10))
    entries.append(assemble_garment(gid_t, 'Shade Canyon Guard Scale Cuirass & Khafara Surcoat', 'torso', 'dasri', parts_t))

    # GLOVES: Brass-splint bazuband gauntlets
    gid_g = f'dsr_{sex}_warden_gauntlets'
    gaunt_p = P('iron', 0.03, [
        B('top', 0.0, 0.018, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.016, 'solid', 'nahhascopper'),
    ], [PN(0.0, 1.0, 'fluted', 'nahhascopper', 'iron', 0.045)], fabric='metal.iron')
    entries.append(assemble_garment(gid_g, 'Shade Canyon Guard Brass-Splint Gauntlets', 'gloves', 'dasri',
                                    dasri_bracers(gid_g, gaunt_p, palm_paint=P('leather', 0.05, fabric='leather.polished'), f0=0.46)))

    # LEGS: Armored scale-banded crimson/black guard breeches (tucks cleanly under knee-length surcoat with 0 kcS conflict)
    gid_l = f'dsr_{sex}_warden_tassets'
    br_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.045, 'solid', 'dragoncrimson'),
        B('top', 0.10, 0.34, 'lorica_lames', 'nahhascopper', 'iron', 0.06),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Shade Canyon Guard Scale-Banded Breeches', 'legs', 'dasri',
                                    trousers(gid_l, br_p, ease=0.009, ease_end=0.009, bag=0.0), legged=True))

    # FEET: Brass-greaved canyon-guard boots
    gid_f = f'dsr_{sex}_warden_greaves'
    boot_p = P('iron', 0.03, [
        B('bottom', 0.0, 0.020, 'solid', 'nahhascopper'),
    ], [PN(0.25, 0.75, 'fluted', 'nahhascopper', 'iron', 0.05)], fabric='metal.iron')
    cuff_p = P('nahhascopper', 0.02, [B('bottom', 0.0, 0.020, 'solid', 'dragoncrimson')], fabric='metal.bronze')
    entries.append(assemble_garment(gid_f, 'Shade Canyon Guard Brass-Greaved Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.78, upturned=True)))

    # BACK: Sadu guard cape & dorsal brass-mounted scimitar scabbard (seated flush along upper-back cape)
    gid_b = f'dsr_{sex}_warden_cape'
    cape_p = P('dragoncrimson', 0.05, [
        B('top', 0.0, 0.025, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.085, 'sadu_apache_chevron', 'jusschalk', 'goatblack', 0.06),
    ], [
        PN(0.20, 0.80, 'dasri_horns_blazon', 'nahhascopper', 'dragoncrimson', 0.24),
    ], fabric=WOOL)
    parts_b = [cape(gid_b + '_sadu_cape', KNEE - 0.04, cape_p, z_top=TOP - 0.012,
                    span=0.22 * math.pi, ease=0.025, flare=0.12, rows=22, n=36)]
    sc_pts = []
    for x_s, z_s in ((0.088, SHOULDER + 0.004), (0.0, CHEST - 0.03), (-0.092, WAIST + 0.04)):
        c_s = spine_at(z_s)
        d_s = first_hit(np.array([x_s * 0.5, float(c_s[1]), z_s]), np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.105
        sc_pts.append(np.array([x_s, float(c_s[1]) + d_s + 0.042, z_s]))
    parts_b.append(horn(gid_b + '_scimitar_scabbard', sc_pts, 0.018, 0.010,
                        P('goatblack', 0.04, [B('top', 0.0, 0.04, 'solid', 'nahhascopper'),
                                              B('bottom', 0.0, 0.04, 'solid', 'nahhascopper')], fabric='leather.polished'),
                        n=10, rows=9, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_b, 'Shade Canyon Guard Sadu Cape & Dorsal Scabbard', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 11. HORSE OUTRIDER: Wahat al-Shamal Steppe-Horse Outrider (`horse_outrider`)
# ===========================================================================================================
def _build_horse_outrider(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    # HEAD: Indigo/gold Apache headband w/ upright hawk-feather temple plume (ch=False, cf=False)
    gid_h = f'dsr_{sex}_outrider_headband'
    band_p = P('ebadindigo', 0.04, [
        B('top', 0.0, 0.006, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.006, 'solid', 'rabbitgold'),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'rabbitgold', 'ebadindigo', 0.06)], fabric=WOOL)
    concho_p = P('silver', 0.02, [B('top', 0.0, 0.006, 'solid', 'oasisturq')], fabric='metal.iron')
    feather_p = P('jusschalk', 0.04, [
        B('top', 0.0, 0.045, 'stripes', 'goatblack', 'jusschalk', 0.025),
        B('bottom', 0.0, 0.025, 'solid', 'rabbitgold'),
    ])
    parts_h = apache_war_headband(gid_h, band_p, concho_paint=concho_p, feather_paint=feather_p,
                                  n_conchos=5, knot_tails=True)
    entries.append(assemble_garment(gid_h, 'Steppe-Horse Outrider Hawk-Plume Headband', 'head', 'dasri', parts_h,
                                    covers_hair=False, covers_face=False))

    # TORSO: Asymmetric buckskin-and-indigo cavalry coat + cartridge/arrow baldric + brass spyglass & horsehair charms
    gid_t = f'dsr_{sex}_outrider_coat'
    parts_t = []
    coat_p = P('ebadindigo', 0.05, [
        B('top', 0.0, 0.020, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.040, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.055),
    ], [
        PN(0.0, 0.48, 'solid', 'smokebuck', 'ebadindigo', 1.0),
        PN(0.46, 0.51, 'sadu_apache_chevron', 'rabbitgold', 'ebadindigo', 0.08),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_cavalry_coat', TOP, KNEE + 0.04, 0.016, coat_p,
                              n=46, rows=20, hang_from=WAIST - 0.02, flare=0.13 if sex == 'f' else 0.10,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('rabbitgold', 0.04, [B('top', 0.0, 0.010, 'solid', 'oasisturq')], fabric=WOOL),
                                high=0.032))
    f_sh = P('smokebuck', 0.06, [B('bottom', 0.0, 0.024, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.045)], fabric='leather.buckskin')
    parts_t.append(pauldron(gid_t + '_buck_sh_L', L, f_sh, reach=0.32, ease=0.023, flare_end=0.96))
    parts_t.append(pauldron(gid_t + '_buck_sh_R', R, f_sh, reach=0.32, ease=0.023, flare_end=0.96))

    parts_t.append(crossed_sash(gid_t + '_baldric',
                                P('smokebuck', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass'),
                                                      B('bottom', 0.0, 0.008, 'solid', 'brass')], fabric='leather.buckskin'),
                                width=0.048, ease=0.022))
    for idx, (zf, xf) in enumerate(((CHEST + 0.03, 0.060), (CHEST - 0.01, 0.018), (CHEST - 0.05, -0.024))):
        pc = chest_front(zf, 0.024, x=xf)
        parts_t.append(tube(f'{gid_t}_cartridge_{idx}',
                            [pc - np.array([0.0, 0.0, 0.022]), pc + np.array([0.0, 0.0, 0.022])],
                            0.009, P('brass', 0.02, [B('top', 0.0, 0.010, 'solid', 'dragoncrimson')], fabric='metal.gold'),
                            n=8, rigid_joint='Spine2'))

    belt_p = P('leather', 0.05, [], [PN(0.0, 1.0, 'buckskin_concho', 'silver', 'leather', 0.055)], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.032, WAIST - 0.036, 0.023, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.024))
    # Collapsible brass spyglass case at left hip
    c_hip = spine_at(WAIST - 0.03)
    d_sp = np.array([0.85, -0.52, 0.0]) / np.linalg.norm([0.85, -0.52, 0.0])
    p_sp = surface_out(c_hip, d_sp, 0.024, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_spyglass', [p_sp + np.array([0.0, 0.0, 0.045]), p_sp - np.array([0.0, 0.0, 0.045])],
                        0.015, P('brass', 0.02, [B('top', 0.0, 0.016, 'solid', 'oasisturq'),
                                                 B('bottom', 0.0, 0.016, 'solid', 'leather')], fabric='metal.gold'),
                        n=10, rigid_joint='Spine1'))

    sl_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.045, 'sadu_apache_chevron', 'rabbitgold', 'ebadindigo', 0.045),
    ], fabric='leather.buckskin')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.024, rows=10))
    entries.append(assemble_garment(gid_t, 'Wahat al-Shamal Asymmetric Cavalry Coat & Spyglass Baldric', 'torso', 'dasri', parts_t))

    # GLOVES: Horse-archer thumb-ringed bracers
    gid_g = f'dsr_{sex}_outrider_bracers'
    br_p = P('smokebuck', 0.05, [
        B('top', 0.0, 0.014, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.014, 'solid', 'oasisturq'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_g, 'Outrider Buckskin & Turquoise Archer Bracers', 'gloves', 'dasri',
                                    dasri_bracers(gid_g, br_p, palm_paint=P('ebadindigo', 0.04, fabric='leather.buckskin'),
                                                  concho_paint=concho_p, f0=0.52)))

    # LEGS: Buckskin-reinforced indigo riding breeches
    gid_l = f'dsr_{sex}_outrider_breeches'
    br_l_p = P('ebadindigo', 0.05, [
        B('bottom', 0.0, 0.040, 'solid', 'rabbitgold'),
    ], [
        PN(0.35, 0.65, 'solid', 'smokebuck', 'ebadindigo', 1.0),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Buckskin-Reinforced Cavalry Breeches', 'legs', 'dasri',
                                    trousers(gid_l, br_l_p, ease=0.013, ease_end=0.009, bag=0.006), legged=True))

    # FEET: High-cuff horseman ndee riding boots
    gid_f = f'dsr_{sex}_outrider_boots'
    boot_p = P('smokebuck', 0.06, [B('bottom', 0.0, 0.018, 'solid', 'rabbitgold')], fabric='leather.buckskin')
    cuff_p = P('ebadindigo', 0.05, [
        B('bottom', 0.0, 0.026, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.045),
        B('top', 0.0, 0.012, 'solid', 'rabbitgold'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'High-Cuff Horseman Ndee Riding Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.84, upturned=True, concho_paint=concho_p)))

    # BACK: Tooled buckskin bow/carbine quiver & rolled sadu saddle-blanket
    gid_b = f'dsr_{sex}_outrider_quiver'
    parts_b = []
    c_bk = spine_at(CHEST - 0.01)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.112
    pk_c = c_bk + np.array([0.0, d_bk + 0.074, 0.0])
    case_p = P('smokebuck', 0.05, [
        B('top', 0.0, 0.032, 'sadu_apache_chevron', 'rabbitgold', 'ebadindigo', 0.045),
        B('bottom', 0.0, 0.024, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'buckskin_concho', 'silver', 'smokebuck', 0.08)], fabric='leather.buckskin')
    parts_b.append(tube(gid_b + '_bow_carbine_case',
                        [pk_c + np.array([-0.09, 0.0, -0.15]), pk_c + np.array([0.085, 0.012, 0.15])],
                        0.042, case_p, n=14, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_sadu_blanket_roll',
                        [pk_c + np.array([-0.13, 0.012, -0.14]), pk_c + np.array([0.13, 0.012, -0.14])],
                        0.038, P('ebadindigo', 0.05, [], [PN(0.0, 1.0, 'sadu_apache_chevron', 'rabbitgold', 'dragoncrimson', 0.07)], fabric=WOOL),
                        n=12, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('smokebuck', 0.05, fabric='leather.buckskin'), ease=0.048))
    entries.append(assemble_garment(gid_b, 'Outrider Bow-Carbine Quiver & Rolled Sadu Blanket', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 12. AQUIFER WARDEN: Warden of the Deep Aquifer (`aquifer_warden`)
# ===========================================================================================================
def _build_aquifer_warden(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, ANKLE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.ANKLE
    entries = []

    # HEAD: Draped travertine-white & oasis-turquoise hood w/ silver ibex-horn circlet (ch=True, cf=False)
    gid_h = f'dsr_{sex}_aquifer_hood'
    hood_p = P('jusschalk', 0.03, [
        B('bottom', 0.0, 0.040, 'hirz_filigree', 'silver', 'oasisturq', 0.06),
    ], [
        PN(0.35, 0.65, 'wave', 'oasisturq', 'jusschalk', 0.08),
    ], fabric='cloth.silk')
    circ_p = P('silver', 0.02, [B('top', 0.0, 0.008, 'solid', 'oasisturq')], fabric='metal.iron')
    silver_horn_p = P('silver', 0.02, [
        B('bottom', 0.0, 0.022, 'solid', 'oasisturq'),
    ], [PN(0.0, 1.0, 'stripes', 'oasisturq', 'silver', 0.03)], fabric='metal.iron')
    parts_h = keffiyeh_iqal_head(gid_h, hood_p, iqal_paint=circ_p, brow_hirz=True, ibex_horns_paint=silver_horn_p)
    entries.append(assemble_garment(gid_h, 'Deep Aquifer Travertine Hood & Silver Ibex Circlet', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Ankle-sweeping pleated robe + turquoise-silver cascade pectoral & 5 hirz scroll-tubes + bell sleeves
    gid_t = f'dsr_{sex}_aquifer_robe'
    parts_t = []
    robe_p = P('jusschalk', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'oasisturq'),
        B('bottom', 0.0, 0.028, 'solid', 'silver'),
        B('bottom', 0.028, 0.115, 'hirz_filigree', 'silver', 'oasisturq', 0.07),
    ], [
        PN(0.10, 0.38, 'pleated_kilt', 'oasisturq', 'jusschalk', 0.18),
        PN(0.62, 0.90, 'pleated_kilt', 'oasisturq', 'jusschalk', 0.18),
        PN(0.38, 0.62, 'wave', 'oasisturq', 'jusschalk', 0.14),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', TOP, ANKLE + 0.06, 0.015, robe_p,
                              n=50, rows=24, hang_from=WAIST - 0.01, flare=0.18,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    pect_p = P('oasisturq', 0.02, [
        B('bottom', 0.0, 0.024, 'hirz_filigree', 'silver', 'oasisturq', 0.05),
        B('top', 0.0, 0.014, 'solid', 'silver'),
    ], fabric='metal.iron')
    parts_t.append(collar_disc(gid_t + '_cascade_pectoral', 0.088, pect_p, drop=0.076, scallop=0.07, ease=0.019, rows=8))
    parts_t.append(stand_collar(gid_t, P('silver', 0.02, [B('top', 0.0, 0.010, 'solid', 'oasisturq')], fabric='metal.iron'),
                                high=0.032))

    # Interlocking silver chain + 5 vertical silver hirz scroll-tubes across upper chest
    silv_p = P('silver', 0.02, [B('top', 0.0, 0.008, 'solid', 'oasisturq')], fabric='metal.iron')
    parts_t.extend(_silver_chest_chain(gid_t + '_chain', TOP - 0.04, 0.092, 0.12, 0.019, silv_p, n_links=25))
    for hi, x_h in enumerate((-0.064, -0.032, 0.0, 0.032, 0.064)):
        z_h = CHEST + 0.015 - 0.018 * (1.0 - abs(x_h) / 0.07)
        p_h = chest_front(z_h, 0.022, x=x_h)
        parts_t.append(tube(f'{gid_t}_hirz_tube_{hi}',
                            [p_h - np.array([0.0, 0.0, 0.020]), p_h + np.array([0.0, 0.0, 0.020])],
                            0.008, silv_p, n=8, rigid_joint='Spine2'))

    # Travertine bead rosary belt
    rosary_p = P('oasisturq', 0.03, [
        B('top', 0.0, 0.012, 'beads', 'jusschalk', 'silver', 0.028),
        B('bottom', 0.0, 0.012, 'beads', 'jusschalk', 'silver', 0.028),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.032, WAIST - 0.034, 0.021, rosary_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))

    sl_p = P('jusschalk', 0.03, [
        B('bottom', 0.0, 0.025, 'solid', 'silver'),
        B('bottom', 0.025, 0.095, 'hirz_filigree', 'silver', 'oasisturq', 0.05),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.048, rows=10, wide=True))
    entries.append(assemble_garment(gid_t, 'Deep Aquifer Cascade Pectoral & Bell-Sleeve Robe', 'torso', 'dasri', parts_t))

    # GLOVES: Engraved silver hirz cuffs
    gid_g = f'dsr_{sex}_aquifer_cuffs'
    cuff_g = P('silver', 0.02, [
        B('top', 0.0, 0.012, 'solid', 'oasisturq'),
        B('bottom', 0.0, 0.012, 'solid', 'oasisturq'),
    ], [PN(0.0, 1.0, 'hirz_filigree', 'silver', 'oasisturq', 0.05)], fabric='metal.iron')
    e_g = assemble_garment(gid_g, 'Deep Aquifer Silver Hirz Liturgical Cuffs', 'gloves', 'dasri',
                           dasri_bracers(gid_g, cuff_g, palm_paint=None, concho_paint=silv_p, f0=0.62))
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # LEGS: Slim travertine-white & turquoise silk under-sirwal (stays inside ankle-length liturgical robe)
    gid_l = f'dsr_{sex}_aquifer_sirwal'
    sir_p = P('jusschalk', 0.03, [
        B('bottom', 0.0, 0.055, 'hirz_filigree', 'silver', 'oasisturq', 0.045),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_l, 'Deep Aquifer Travertine & Turquoise Sirwal', 'legs', 'dasri',
                                    trousers(gid_l, sir_p, ease=0.010, ease_end=0.009, bag=0.0), legged=True))

    # FEET: Low-ankle white beaded shrine moccasins (never pokes through ankle-sweeping liturgical robe)
    gid_f = f'dsr_{sex}_aquifer_moccasins'
    moc_p = P('jusschalk', 0.04, [B('bottom', 0.0, 0.018, 'solid', 'oasisturq')], fabric='leather.buckskin')
    moc_cuff = P('jusschalk', 0.04, [
        B('bottom', 0.0, 0.022, 'hirz_filigree', 'silver', 'oasisturq', 0.045),
        B('top', 0.0, 0.010, 'solid', 'silver'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'White Beaded Aquifer Shrine Moccasins', 'feet', 'dasri',
                                    ndee_boots(gid_f, moc_p, cuff_paint=moc_cuff, top=0.32, ease_top=0.022, upturned=True)))

    # BACK: Copper & alabaster aquifer-libation amphora
    gid_b = f'dsr_{sex}_aquifer_amphora'
    parts_b = []
    c_bk = spine_at(CHEST - 0.01)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.112
    am_c = c_bk + np.array([0.0, d_bk + 0.062, 0.0])
    amph_p = P('jusschalk', 0.03, [
        B('top', 0.0, 0.045, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.050, 'solid', 'nahhascopper'),
    ], [
        PN(0.0, 1.0, 'hirz_filigree', 'oasisturq', 'jusschalk', 0.14),
    ], fabric='shell.nacre')
    parts_b.append(blob(gid_b + '_amphora_body', am_c, (0.18, 0.14, 0.30), amph_p,
                        n=18, rows=8, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_amphora_neck',
                        [am_c + np.array([0.0, 0.0, 0.135]), am_c + np.array([0.0, 0.0, 0.195])],
                        0.038, P('nahhascopper', 0.02, [B('top', 0.0, 0.015, 'solid', 'oasisturq')], fabric='metal.bronze'),
                        n=14, rigid_joint='Spine2'))
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        parts_b.append(horn(f'{gid_b}_amphora_handle_{tag}',
                            [am_c + np.array([sd * 0.038, 0.0, 0.175]),
                             am_c + np.array([sd * 0.105, 0.01, 0.095]),
                             am_c + np.array([sd * 0.078, 0.0, 0.015])],
                            0.011, 0.011, silv_p, n=8, rows=7, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('silver', 0.03, [B('top', 0.0, 0.008, 'solid', 'oasisturq')], fabric='metal.brass.braid')))
    entries.append(assemble_garment(gid_b, 'Copper & Alabaster Aquifer-Libation Amphora', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 13. ORACLE: Gaan-Horned Desert Spirit-Dancer & Sand-Oracle (`oracle`)
# ===========================================================================================================
def _build_oracle(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Syncretic Apache Gaan Crown-Dancer + Dasri Horn-Sign headdress (ch=True, cf=True)
    gid_h = f'dsr_{sex}_oracle_crown'
    cowl_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.032, 'sadu_apache_chevron', 'dragoncrimson', 'rabbitgold', 0.05),
    ], fabric='cloth.tent.black')
    mask_p = P('goatblack', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'oasisturq'),
        B('bottom', 0.0, 0.022, 'chevrons', 'rabbitgold', 'goatblack', 0.04),
    ], [
        PN(0.22, 0.78, 'horned_sun_shield', 'oasisturq', 'goatblack', 0.18),
    ], fabric='cloth.tent.black')
    base_ring_p = P('smokebuck', 0.05, [
        B('top', 0.0, 0.008, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.008, 'solid', 'oasisturq'),
    ], [PN(0.0, 1.0, 'buckskin_concho', 'silver', 'smokebuck', 0.055)], fabric='leather.buckskin')

    parts_h = [
        hood(gid_h + '_black_cowl', cowl_p, ease=0.015, ease_low=0.019, open_front=0.88, low=-0.25, rows=12, n=34),
        sculpted_faceplate(gid_h + '_gaan_mask', mask_p, f_top=0.72, f_bot=-0.06, ease=0.016, span=0.46, rows=14, cols=23),
        crown_band(gid_h + '_crown_ring', base_ring_p, f0=0.60, f1=0.78, ease=0.020, flare=0.004, rows=5, n=36),
    ]

    # Stepped painted wooden-slat Apache Gaan Spirit-Crown anchored directly into crown_ring (`d_host = 0 mm`)
    c_cr = a + (b - a) * 0.74
    h_cr_f = first_hit(c_cr, -bk) or 0.098
    slat_c = c_cr - bk * (h_cr_f + 0.018) + bk * 0.065
    slat_p = P('goatblack', 0.04, [
        B('top', 0.0, 0.028, 'steps', 'rabbitgold', 'dragoncrimson', 0.06),
        B('bottom', 0.0, 0.022, 'solid', 'oasisturq'),
    ], [
        PN(0.0, 1.0, 'horned_sun_shield', 'rabbitgold', 'goatblack', 0.24),
    ])
    # Sculpted 3D stepped wooden-slat Gaan fan frame (rows=8 from top stepped crest down to crown_ring root)
    rows_sl, cols_sl = 8, 17
    Q_sl = np.zeros((rows_sl, cols_sl, 3), dtype=np.float64)
    for ri in range(rows_sl):
        v_s = ri / float(rows_sl - 1)  # 0 = top stepped peaks, 1 = seated inside crown_ring
        for cj in range(cols_sl):
            u_s = (cj / float(cols_sl - 1) - 0.5) * 2.0
            au = abs(u_s)
            # Authentic Apache Gaan stepped-terrace & central cross-arrow silhouette
            step_lvl = 1.0 - 0.22 * math.floor(au * 3.99)
            top_h = 0.24 * step_lvl + (0.045 if au < 0.16 else 0.0)
            cur_h = top_h * (1.0 - v_s)
            lat_w = (0.20 * (1.0 - 0.32 * v_s)) * u_s
            arch_bk = -0.025 * (1.0 - au ** 2)
            Q_sl[ri, cj] = slat_c + left * lat_w + up * cur_h + bk * arch_bk
    parts_h.append(Part(gid_h + '_gaan_slat_crown', Q_sl, False, ['body'] * rows_sl, slat_p, rigid_joint='Head'))

    # Central horizontal crossbar of the Gaan spirit-spire
    cross_c = slat_c + up * 0.195 - bk * 0.022
    parts_h.append(tube(gid_h + '_gaan_crossbar',
                        [cross_c - left * 0.075, cross_c + left * 0.075], 0.010,
                        P('rabbitgold', 0.03, [B('top', 0.0, 0.015, 'solid', 'dragoncrimson'),
                                               B('bottom', 0.0, 0.015, 'solid', 'oasisturq')]),
                        n=8, rigid_joint='Head'))

    # Twin curved ridged nahhas-brass ibex horns framing the stepped Gaan slat-crown
    ibex_p = P('nahhascopper', 0.02, [
        B('bottom', 0.0, 0.025, 'solid', 'oasisturq'),
    ], [PN(0.0, 1.0, 'stripes', 'rabbitgold', 'nahhascopper', 0.028)], fabric='metal.bronze')
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        d_s = left * (sd * 0.92) - bk * 0.38
        d_s /= np.linalg.norm(d_s)
        h_s = first_hit(c_cr, d_s) or 0.092
        r0 = c_cr + d_s * (h_s + 0.027)
        r1 = r0 + left * (sd * 0.068) + up * 0.078 + bk * 0.010
        r2 = r1 + left * (sd * 0.026) + up * 0.095 + bk * 0.038
        r3 = r2 - left * (sd * 0.036) + up * 0.068 + bk * 0.032
        parts_h.append(horn(f'{gid_h}_ibex_horn_{tag}', [r0, r1, r2, r3], 0.022, 0.005,
                            ibex_p, n=10, rows=10, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, 'Gaan-Horned Slatted Crown & Ibex Spirit-Mask', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=True))

    # TORSO: Sacred-geometry ochre buckskin tunic + horned-sun mirror pectoral + pollen bags & obsidian/silver jambiya
    gid_t = f'dsr_{sex}_oracle_tunic'
    parts_t = []
    tun_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.055, 'sadu_apache_chevron', 'oasisturq', 'dragoncrimson', 0.055),
    ], [
        PN(0.34, 0.66, 'horned_sun_shield', 'rabbitgold', 'goatblack', 0.22, down=0.44),
        PN(0.0, 0.34, 'chevrons', 'oasisturq', 'smokebuck', 0.08),
        PN(0.66, 1.0, 'chevrons', 'oasisturq', 'smokebuck', 0.08),
    ], fabric='leather.buckskin')
    or_tunic = torso_tube(gid_t + '_spirit_tunic', TOP, WAIST - 0.036, 0.016, tun_p,
                          n=46, rows=14, hull_from=CHEST + 0.02)
    or_tunic.cloth = None
    parts_t.append(or_tunic)
    yoke_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.032, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.05),
        B('top', 0.0, 0.014, 'solid', 'rabbitgold'),
    ], fabric='leather.buckskin')
    parts_t.extend(apache_warshirt_yoke(gid_t, yoke_p, shirt_ease=0.018))

    # Polished brass & silver mirror-sun pectoral on sternum + eagle-bone whistle
    p_sun = chest_front(CHEST + 0.008, 0.025, x=0.0)
    parts_t.append(rosette(gid_t + '_mirror_sun_pectoral', p_sun, FRONT, np.array([1.0, 0.0, 0.0]), 0.040,
                           P('silver', 0.01, [B('bottom', 0.0, 0.012, 'solid', 'rabbitgold')],
                             [PN(0.0, 1.0, 'sun', 'rabbitgold', 'oasisturq', 0.08)], fabric='metal.gold'),
                           n=16, thick=0.010, rigid_joint='Spine2'))
    p_wh = chest_front(CHEST - 0.045, 0.025, x=0.0)
    parts_t.append(tube(gid_t + '_eagle_whistle',
                        [p_wh - np.array([0.028, 0.0, 0.0]), p_wh + np.array([0.028, 0.0, 0.0])],
                        0.008, P('bone', 0.03, [B('top', 0.0, 0.010, 'solid', 'oasisturq')]),
                        n=8, rigid_joint='Spine2'))

    belt_p = P('goatblack', 0.05, [], [PN(0.0, 1.0, 'buckskin_concho', 'silver', 'goatblack', 0.055)], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.034, WAIST - 0.038, 0.024, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.025,
                                   hilt_paint=P('goatblack', 0.01, [B('top', 0.0, 0.012, 'solid', 'silver')], fabric='beads.glass'),
                                   scabbard_paint=P('silver', 0.02, [B('bottom', 0.0, 0.024, 'solid', 'oasisturq')], fabric='metal.iron')))
    # Sacred rabbitbrush-yellow pollen bags at both hips
    c_hip = spine_at(WAIST - 0.03)
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        dp = np.array([sd * 0.84, -0.54, 0.0]) / np.linalg.norm([sd * 0.84, -0.54, 0.0])
        parts_t.append(blob(f'{gid_t}_pollen_bag_{tag}', surface_out(c_hip, dp, 0.025, bvh=core.BVH_T),
                            (0.064, 0.040, 0.078),
                            P('rabbitgold', 0.05, [B('bottom', 0.0, 0.022, 'solid', 'oasisturq')], fabric='leather.buckskin'),
                            n=10, rows=5, out=dp, role='accessory'))

    sl_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.050, 'sadu_apache_chevron', 'oasisturq', 'goatblack', 0.045),
    ], fabric='leather.buckskin')
    parts_t.extend(sleeves(gid_t, 'elbow', 0.016, sl_p, ease_end=0.026, rows=8))
    entries.append(assemble_garment(gid_t, 'Gaan Spirit-Dancer Sacred Buckskin Tunic & Mirror Pectoral', 'torso', 'dasri', parts_t))

    # GLOVES: Fringed buckskin hawk-bell ritual gauntlets
    gid_g = f'dsr_{sex}_oracle_gauntlets'
    bell_cuff = P('goatblack', 0.05, [
        B('top', 0.0, 0.014, 'solid', 'oasisturq'),
        B('bottom', 0.0, 0.018, 'solid', 'rabbitgold'),
    ], [PN(0.0, 1.0, 'buckskin_concho', 'silver', 'smokebuck', 0.05)], fabric='leather.buckskin')
    e_g = assemble_garment(gid_g, 'Gaan Spirit-Dancer Hawk-Bell Gauntlets', 'gloves', 'dasri',
                           dasri_bracers(gid_g, bell_cuff, palm_paint=None,
                                         bells_paint=P('brass', 0.02, fabric='metal.gold'), f0=0.48))
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # LEGS: Fringed sadu/buckskin ritual kilt over goat-black leggings
    gid_l = f'dsr_{sex}_oracle_kilt'
    leg_p = P('goatblack', 0.05, [B('bottom', 0.0, 0.045, 'chevrons', 'oasisturq', 'rabbitgold', 0.04)], fabric='leather.buckskin')
    kilt_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.055, 'buckskin_concho', 'silver', 'goatblack', 0.05),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'rabbitgold', 'dragoncrimson', 0.08)], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Fringed Sadu & Buckskin Ritual Dance Kilt', 'legs', 'dasri',
                                    breechclout_sirwal(gid_l, leg_p, kilt_p), legged=True))

    # FEET: Lightning-painted ochre & turquoise ndee dance boots
    gid_f = f'dsr_{sex}_oracle_boots'
    boot_p = P('smokebuck', 0.05, [
        B('bottom', 0.0, 0.018, 'solid', 'goatblack'),
    ], [PN(0.25, 0.75, 'zigzag', 'oasisturq', 'smokebuck', 0.05)], fabric='leather.buckskin')
    cuff_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.026, 'sadu_apache_chevron', 'rabbitgold', 'oasisturq', 0.045),
        B('top', 0.0, 0.012, 'solid', 'dragoncrimson'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'Lightning-Painted Spirit-Dancer Ndee Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.82, upturned=True,
                                               concho_paint=P('oasisturq', 0.02, fabric='metal.iron'))))

    # BACK: Crossed Apache Gaan lightning-zigzag dance-wands
    gid_b = f'dsr_{sex}_oracle_wands'
    parts_b = []
    c_bk = spine_at(CHEST + 0.01)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.112
    hub_c = c_bk + np.array([0.0, d_bk + 0.042, 0.0])
    parts_b.append(rosette(gid_b + '_wand_hub', hub_c, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                           0.085, P('goatblack', 0.04, [], [PN(0.0, 1.0, 'horned_sun_shield', 'rabbitgold', 'oasisturq', 0.12)]),
                           n=16, thick=0.016, rigid_joint='Spine2'))
    wand_p = P('rabbitgold', 0.04, [
        B('top', 0.0, 0.05, 'solid', 'oasisturq'),
        B('bottom', 0.0, 0.05, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'slat_wood', 'goatblack', 'rabbitgold', 0.06)])
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        z_pts = []
        for k in range(9):
            u_w = (k / 8.0 - 0.5) * 2.0
            zag = 0.022 * (1.0 if (k % 2 == 0) else -1.0)
            z_pts.append(hub_c + np.array([sd * 0.175 * u_w + zag, 0.012, 0.245 * u_w]))
        parts_b.append(horn(f'{gid_b}_lightning_wand_{tag}', z_pts, 0.016, 0.012, wand_p,
                            n=8, rows=9, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('smokebuck', 0.05, [B('top', 0.0, 0.008, 'solid', 'oasisturq')], fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Crossed Gaan Lightning Dance-Wands', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 14. JABAL SYNDIC: Jabal Mafraj Tower-Syndic / Qamariya Emir (`jabal_syndic`)
# ===========================================================================================================
def _build_jabal_syndic(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.ANKLE
    )
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Towering brocade 'imama turban w/ Bowl-emerald & silver hirz aigrette (ch=True, cf=False)
    gid_h = f'dsr_{sex}_syndic_imama'
    imama_p = P('jusschalk', 0.03, [
        B('bottom', 0.0, 0.020, 'solid', 'rabbitgold'),
        B('top', 0.0, 0.028, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'juss_qamariya', 'rabbitgold', 'dragoncrimson', 0.12)], fabric='cloth.silk')
    wrap_p = P('emerald', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'hirz_filigree', 'silver', 'emerald', 0.07)], fabric='cloth.silk')
    parts_h = [
        tower_hat(gid_h + '_imama_dome', 0.168,
                  lambda s: 0.96 + 0.19 * math.sin(s * math.pi * 0.78) - 0.10 * (s ** 2.0),
                  imama_p, f=0.50, ease=0.021, rows=11, n=38),
        crown_band(gid_h + '_brocade_band', wrap_p, f0=0.46, f1=0.75, ease=0.025, flare=0.010, rows=6, n=38),
    ]
    c_br = a + (b - a) * 0.64
    h_br = first_hit(c_br, -bk) or 0.102
    aig_c = c_br - bk * (h_br + 0.031)
    parts_h.extend(hirz_amulet_box(gid_h + '_emerald_hirz', aig_c, -bk, inlay='emerald',
                                   width=0.048, height=0.028, bells=False, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_aigrette_plume',
                        [aig_c + up * 0.014,
                         aig_c + up * 0.092 - bk * 0.010 + left * 0.012,
                         aig_c + up * 0.162 + bk * 0.020 + left * 0.020],
                        0.020, 0.004,
                        P('jusschalk', 0.02, [B('bottom', 0.0, 0.028, 'solid', 'emerald'),
                                              B('top', 0.0, 0.030, 'solid', 'gold')], fabric='cloth.silk'),
                        n=10, rows=8, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Jabal Syndic Qamariya Imama & Bowl-Emerald Aigrette', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Unified single-shell gold-trimmed black camel-wool bisht framing stained-glass qamariya brocade robe
    #        (single closed 52-col manifold -> 0% inner/outer lower-garment fighting & full 16-chain back layering!)
    gid_t = f'dsr_{sex}_syndic_bisht'
    parts_t = []
    bisht_robe_p = P('goatblack', 0.04, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.032, 'solid', 'gold'),
        B('bottom', 0.032, 0.110, 'juss_qamariya', 'gold', 'emerald', 0.07),
    ], [
        PN(0.38, 0.62, 'juss_qamariya', 'gold', 'dragoncrimson', 0.15),
        PN(0.35, 0.38, 'hirz_filigree', 'gold', 'goatblack', 0.06),
        PN(0.62, 0.65, 'hirz_filigree', 'gold', 'goatblack', 0.06),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_qamariya_bisht', TOP, ANKLE + 0.06, 0.016, bisht_robe_p,
                              n=52, rows=24, hang_from=WAIST - 0.01, flare=0.08,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('emerald', 0.03, [B('top', 0.0, 0.012, 'solid', 'gold')], fabric='cloth.silk'),
                                high=0.034))
    parts_t.extend(_silver_chest_chain(gid_t + '_syndic_chain', TOP - 0.04, 0.090, 0.13, 0.022,
                                       P('gold', 0.02, fabric='metal.gold'), n_links=25))

    sash_p = P('emerald', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'juss_qamariya', 'gold', 'emerald', 0.06)], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.038, WAIST - 0.040, 0.026, sash_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.027,
                                   hilt_paint=P('gold', 0.02, [B('top', 0.0, 0.012, 'solid', 'emerald')], fabric='metal.gold'),
                                   scabbard_paint=P('gold', 0.02, [B('bottom', 0.0, 0.028, 'hirz_filigree', 'silver', 'emerald', 0.035)], fabric='metal.gold')))
    # Silver caravan-charter scroll cylinder at right hip
    c_hip = spine_at(WAIST - 0.03)
    d_ch = np.array([-0.85, -0.52, 0.0]) / np.linalg.norm([-0.85, -0.52, 0.0])
    p_ch = surface_out(c_hip, d_ch, 0.027, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_charter_cylinder',
                        [p_ch - np.array([0.035, 0.0, 0.02]), p_ch + np.array([0.035, 0.0, -0.02])],
                        0.016, P('silver', 0.02, [B('top', 0.0, 0.014, 'solid', 'gold'),
                                                  B('bottom', 0.0, 0.014, 'solid', 'gold')], fabric='metal.iron'),
                        n=10, rigid_joint='Spine1'))

    sl_p = P('goatblack', 0.04, [
        B('bottom', 0.0, 0.026, 'solid', 'gold'),
        B('bottom', 0.026, 0.088, 'juss_qamariya', 'gold', 'dragoncrimson', 0.05),
    ], fabric=WOOL)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.032, rows=10))
    entries.append(assemble_garment(gid_t, 'Jabal Syndic Gold-Trimmed Bisht & Qamariya Brocade Robe', 'torso', 'dasri', parts_t))

    # GLOVES: Crimson velvet & silver-filigree emir cuffs
    gid_g = f'dsr_{sex}_syndic_cuffs'
    cuff_g = P('dragoncrimson', 0.03, [
        B('top', 0.0, 0.014, 'solid', 'gold'),
        B('bottom', 0.0, 0.014, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'hirz_filigree', 'silver', 'dragoncrimson', 0.05)], fabric='cloth.velvet.cut')
    e_g = assemble_garment(gid_g, 'Jabal Syndic Velvet & Silver-Filigree Cuffs', 'gloves', 'dasri',
                           dasri_bracers(gid_g, cuff_g, palm_paint=None,
                                         concho_paint=P('gold', 0.02, [B('top', 0.0, 0.005, 'solid', 'emerald')], fabric='metal.gold'),
                                         f0=0.62))
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # LEGS: Slim cream-gold silk under-sirwal (stays strictly inside ankle-length brocade robe collider!)
    gid_l = f'dsr_{sex}_syndic_sirwal'
    sir_p = P('jusschalk', 0.03, [
        B('bottom', 0.0, 0.055, 'juss_qamariya', 'gold', 'emerald', 0.045),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_l, 'Jabal Syndic Cream-and-Gold Silk Sirwal', 'legs', 'dasri',
                                    trousers(gid_l, sir_p, ease=0.010, ease_end=0.009, bag=0.0), legged=True))

    # FEET: Crimson Morocco-leather court ankle-boots (low-cut under ankle-sweeping silk bisht so cuffs never clip robe)
    gid_f = f'dsr_{sex}_syndic_boots'
    boot_p = P('dragoncrimson', 0.03, [B('bottom', 0.0, 0.022, 'solid', 'silver')], fabric='leather.polished')
    cuff_p = P('dragoncrimson', 0.03, [
        B('bottom', 0.0, 0.022, 'hirz_filigree', 'silver', 'emerald', 0.045),
        B('top', 0.0, 0.010, 'solid', 'gold'),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Crimson Morocco Silver-Toe Syndic Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.32, ease_top=0.014, upturned=True)))

    # BACK: Juss chevron brocade state cape (shortened upper-waist mantle with wide posterior flare to clear bisht robe in walk/run)
    gid_b = f'dsr_{sex}_syndic_cape'
    cape_p = P('jusschalk', 0.03, [
        B('top', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
        B('bottom', 0.035, 0.115, 'hirz_filigree', 'silver', 'emerald', 0.07),
    ], [
        PN(0.08, 0.92, 'juss_qamariya', 'dragoncrimson', 'jusschalk', 0.22),
        PN(0.0, 0.08, 'solid', 'gold', 'jusschalk', 1.0),
        PN(0.92, 1.0, 'solid', 'gold', 'jusschalk', 1.0),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_b, 'Jabal Syndic Juss-Chevron Brocade State Cape', 'back', 'dasri',
                                    [cape(gid_b + '_brocade_cape', core.WAIST + 0.04, cape_p, z_top=TOP - 0.010,
                                          span=0.30 * math.pi, ease=0.028, flare=0.22, rows=24, n=38,
                                          stiff=0.38, back_push=0.070)]))
    return entries


# ===========================================================================================================
# 15. PATRIARCH: Majlis Paramount Shaykh of the Horns (`patriarch`)
# ===========================================================================================================
def _build_patriarch(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    entries = []

    # HEAD: Regal white/crimson keffiyeh held by twin-horned gilded brass & turquoise 'iqal-crown (ch=True, cf=False)
    gid_h = f'dsr_{sex}_patriarch_crown'
    kef_p = P('ivory', 0.03, [
        B('bottom', 0.0, 0.045, 'sadu_apache_chevron', 'dragoncrimson', 'gold', 0.06),
    ], [
        PN(0.0, 1.0, 'checks', 'dragoncrimson', 'ivory', 0.05),
    ], fabric='cloth.silk')
    crown_iq_p = P('gold', 0.02, [
        B('top', 0.0, 0.008, 'solid', 'oasisturq'),
        B('bottom', 0.0, 0.008, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'hirz_filigree', 'silver', 'gold', 0.05)], fabric='metal.gold')
    gilt_horns_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.028, 'solid', 'oasisturq'),
    ], [PN(0.0, 1.0, 'stripes', 'oasisturq', 'gold', 0.03)], fabric='metal.gold')
    parts_h = keffiyeh_iqal_head(gid_h, kef_p, iqal_paint=crown_iq_p, brow_hirz=True, ibex_horns_paint=gilt_horns_p)
    entries.append(assemble_garment(gid_h, 'Majlis Twin-Horned Gilded Iqal-Crown & Royal Keffiyeh', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: 4-colour sadu & white royal buckskin war-coat + silver hirz pectoral + twin diamond jambiyas & ilaf horn
    gid_t = f'dsr_{sex}_patriarch_coat'
    parts_t = []
    coat_p = P('ivory', 0.04, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.030, 'solid', 'gold'),
        B('bottom', 0.030, 0.105, 'buckskin_concho', 'silver', 'ivory', 0.06),
    ], [
        PN(0.36, 0.64, 'sadu_apache_chevron', 'gold', 'dragoncrimson', 0.14),
        PN(0.0, 0.36, 'dasri_horns_blazon', 'gold', 'ivory', 0.20, down=0.45),
        PN(0.64, 1.0, 'dasri_horns_blazon', 'gold', 'ivory', 0.20, down=0.45),
    ], fabric='leather.buckskin')
    parts_t.append(torso_tube(gid_t + '_royal_warcoat', TOP, KNEE - 0.04, 0.016, coat_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.10 if sex == 'f' else 0.08,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    yoke_p = P('ivory', 0.04, [
        B('bottom', 0.0, 0.032, 'buckskin_concho', 'oasisturq', 'ivory', 0.05),
        B('top', 0.0, 0.014, 'solid', 'gold'),
    ], fabric='leather.buckskin')
    parts_t.extend(apache_warshirt_yoke(gid_t, yoke_p, shirt_ease=0.018))
    parts_t.append(stand_collar(gid_t, P('dragoncrimson', 0.03, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='cloth.silk'),
                                high=0.018))

    # Royal silver & turquoise hirz pectoral (chain + 3 tiered hirz talisman boxes)
    parts_t.extend(_silver_chest_chain(gid_t + '_royal_chain', TOP - 0.04, 0.092, 0.12, 0.024,
                                       P('silver', 0.02, fabric='metal.iron'), n_links=25))
    for hi, (zf, xf, inl) in enumerate(((CHEST + 0.02, 0.0, 'oasisturq'),
                                        (CHEST - 0.03, -0.045, 'dragoncrimson'),
                                        (CHEST - 0.03, 0.045, 'dragoncrimson'))):
        parts_t.extend(hirz_amulet_box(f'{gid_t}_royal_hirz_{hi}', chest_front(zf, 0.026, x=xf),
                                       FRONT, inlay=inl, width=0.052, height=0.030, bells=True, rigid_joint='Spine2'))

    belt_p = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'hirz_filigree', 'silver', 'dragoncrimson', 0.055)], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.038, WAIST - 0.040, 0.025, belt_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.026,
                                   hilt_paint=P('silver', 0.01, [B('top', 0.0, 0.014, 'solid', 'moonglass')], fabric='metal.iron'),
                                   scabbard_paint=P('gold', 0.02, [B('bottom', 0.0, 0.025, 'solid', 'oasisturq')], fabric='metal.gold'),
                                   twin=True))
    # Gilded ilaf treaty-horn at right hip
    c_hip = spine_at(WAIST - 0.032)
    d_ih = np.array([-0.86, -0.51, 0.0]) / np.linalg.norm([-0.86, -0.51, 0.0])
    p_ih = surface_out(c_hip, d_ih, 0.026, bvh=core.BVH_T)
    parts_t.append(horn(gid_t + '_ilaf_treaty_horn',
                        [p_ih + np.array([-0.012, -0.032, 0.05]), p_ih + np.array([0.0, -0.012, 0.0]), p_ih + np.array([-0.02, 0.02, -0.06])],
                        0.020, 0.006, P('gold', 0.02, [B('top', 0.0, 0.02, 'solid', 'oasisturq')], fabric='metal.gold'),
                        n=10, rows=8, rigid_joint='Spine1', role='trinket'))

    sl_p = P('ivory', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.080, 'sadu_apache_chevron', 'gold', 'dragoncrimson', 0.045),
    ], fabric='leather.buckskin')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Paramount Shaykh White Buckskin & Sadu War-Coat', 'torso', 'dasri', parts_t))

    # GLOVES: White buckskin, gold & turquoise concho bracers
    gid_g = f'dsr_{sex}_patriarch_bracers'
    br_p = P('ivory', 0.04, [
        B('top', 0.0, 0.014, 'solid', 'gold'),
        B('bottom', 0.0, 0.014, 'solid', 'oasisturq'),
    ], [PN(0.0, 1.0, 'hirz_filigree', 'gold', 'ivory', 0.05)], fabric='leather.buckskin')
    concho_g = P('gold', 0.02, [B('top', 0.0, 0.006, 'solid', 'oasisturq')], fabric='metal.gold')
    e_g = assemble_garment(gid_g, 'Royal White Buckskin & Turquoise Concho Bracers', 'gloves', 'dasri',
                           dasri_bracers(gid_g, br_p, palm_paint=None, concho_paint=concho_g, f0=0.56))
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # LEGS: Tailored royal white silk & gold-trimmed sirwal (slim leg profile so boots & war-coat never clip in turn)
    gid_l = f'dsr_{sex}_patriarch_sirwal'
    sir_p = P('ivory', 0.04, [
        B('bottom', 0.0, 0.045, 'sadu_apache_chevron', 'gold', 'dragoncrimson', 0.045),
        B('top', 0.10, 0.30, 'dasri_horns_blazon', 'gold', 'dragoncrimson', 0.08),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_l, 'Royal White Silk & Gold-Banded Sirwal', 'legs', 'dasri',
                                    trousers(gid_l, sir_p, ease=0.010, ease_end=0.009, bag=0.0), legged=True))

    # FEET: White-tanned gold/turquoise ndee sovereign boots
    gid_f = f'dsr_{sex}_patriarch_boots'
    boot_p = P('ivory', 0.04, [B('bottom', 0.0, 0.020, 'solid', 'gold')], fabric='leather.buckskin')
    cuff_p = P('ivory', 0.04, [
        B('bottom', 0.0, 0.028, 'sadu_apache_chevron', 'gold', 'oasisturq', 0.045),
        B('top', 0.0, 0.012, 'solid', 'dragoncrimson'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'White-Tanned Gold & Turquoise Royal Ndee Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.80, upturned=True, concho_paint=concho_g)))

    # BACK: Dorsal Dasri Horns tapestry cape (cropped cleanly above buttocks with strong posterior sweep & zero Hips drag)
    gid_b = f'dsr_{sex}_patriarch_cape'
    cape_p = P('goatblack', 0.04, [
        B('top', 0.0, 0.030, 'solid', 'gold'),
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
        B('bottom', 0.035, 0.120, 'sadu_apache_chevron', 'gold', 'dragoncrimson', 0.07),
    ], [
        PN(0.10, 0.90, 'dasri_horns_blazon', 'gold', 'goatblack', 0.28),
        PN(0.0, 0.10, 'sadu_apache_chevron', 'dragoncrimson', 'gold', 0.08),
        PN(0.90, 1.0, 'sadu_apache_chevron', 'dragoncrimson', 'gold', 0.08),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_b, 'Paramount Shaykh Dasri Horns Tapestry State Cape', 'back', 'dasri',
                                    [cape(gid_b + '_horns_cape', core.WAIST + 0.045, cape_p, z_top=TOP - 0.010,
                                          span=0.29 * math.pi, ease=0.028, flare=0.22, rows=24, n=38,
                                          stiff=0.38, back_push=0.068)]))
    return entries


# ===========================================================================================================
# 16. PC MEZCALERO CORSAIR: Crimson Bisht & Buckskin Desert-Stalker (`pc_mezcalero_corsair`)
#     100% Procedural High-Detail Hero Set on native MPFB proportions (0 Meshy enlarged-head defects!)
# ===========================================================================================================
def _build_pc_mezcalero_corsair(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH = core.TOP, core.CHEST, core.WAIST, core.CROTCH
    entries = []

    def _tag_pc(entry_dict):
        entry_dict['type'] = 'pc'
        return entry_dict

    concho_p = P('silver', 0.02, [B('top', 0.0, 0.006, 'solid', 'oasisturq')], fabric='metal.iron')

    # HEAD: Crimson/indigo concho war-headband w/ silver hirz brow clasp & streaming tails (ch=False, cf=False)
    gid_h = f'dsr_{sex}_pc_corsair_headband'
    band_p = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.006, 'solid', 'ebadindigo'),
        B('bottom', 0.0, 0.006, 'solid', 'silver'),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'oasisturq', 'dragoncrimson', 0.06)], fabric='cloth.silk')
    parts_h = apache_war_headband(gid_h, band_p, concho_paint=concho_p, brow_hirz=True, n_conchos=6, knot_tails=True)
    entries.append(_tag_pc(assemble_garment(gid_h, 'Mezcalero Corsair Concho & Hirz War-Headband', 'head', 'dasri', parts_h,
                                            covers_hair=False, covers_face=False)))

    # TORSO: Tailored crimson/black sadu waistcoat over fringed smoke-buckskin war-shirt + silver hirz bandolier & jambiya
    gid_t = f'dsr_{sex}_pc_corsair_vest'
    parts_t = []
    shirt_p = P('smokebuck', 0.05, [
        B('bottom', 0.0, 0.055, 'buckskin_concho', 'silver', 'smokebuck', 0.055),
    ], [
        PN(0.38, 0.62, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.12, down=0.34),
    ], fabric='leather.buckskin')
    pc_shirt = torso_tube(gid_t + '_buckskin_shirt', TOP, WAIST - 0.036, 0.015, shirt_p,
                          n=48, rows=15, hull_from=CHEST + 0.02)
    pc_shirt.cloth = None
    parts_t.append(pc_shirt)
    # Tailored sleeveless crimson-and-black Al-Sadu waistcoat (open at front, synced to war-shirt)
    vest_p = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'silver'),
        B('bottom', 0.0, 0.024, 'hirz_filigree', 'silver', 'goatblack', 0.05),
    ], [
        PN(0.0, 1.0, 'sadu_apache_chevron', 'rabbitgold', 'dragoncrimson', 0.11),
    ], fabric='cloth.tent.black')
    parts_t.append(torso_tube(gid_t + '_sadu_waistcoat', TOP - 0.008, WAIST - 0.034, 0.021, vest_p,
                              n=38, rows=12, arc=(-0.74 * math.pi, 0.74 * math.pi),
                              hull_from=CHEST + 0.02, role='drape'))
    yoke_p = P('smokebuck', 0.05, [
        B('bottom', 0.0, 0.032, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.05),
        B('top', 0.0, 0.012, 'solid', 'silver'),
    ], fabric='leather.buckskin')
    parts_t.extend(apache_warshirt_yoke(gid_t, yoke_p, shirt_ease=0.021))
    parts_t.append(stand_collar(gid_t, P('goatblack', 0.04, [B('top', 0.0, 0.010, 'solid', 'oasisturq')], fabric='cloth.silk'),
                                high=0.032))

    # Cross-chest bandolier studded with 3 rectangular silver hirz boxes & turquoise conchos
    parts_t.append(crossed_sash(gid_t + '_hirz_bandolier',
                                P('leather', 0.04, [B('top', 0.0, 0.008, 'solid', 'silver'),
                                                    B('bottom', 0.0, 0.008, 'solid', 'silver')], fabric='leather.polished'),
                                width=0.050, ease=0.024))
    for hi, (zf, xf, inl) in enumerate(((CHEST + 0.035, 0.058, 'oasisturq'),
                                        (CHEST - 0.015, 0.012, 'dragoncrimson'),
                                        (WAIST + 0.065, -0.052, 'oasisturq'))):
        parts_t.extend(hirz_amulet_box(f'{gid_t}_band_hirz_{hi}', chest_front(zf, 0.027, x=xf),
                                       FRONT, inlay=inl, width=0.048, height=0.028, bells=True, rigid_joint='Spine2'))

    belt_p = P('leather', 0.04, [], [PN(0.0, 1.0, 'buckskin_concho', 'silver', 'goatblack', 0.055)], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.036, WAIST - 0.038, 0.025, belt_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.027,
                                   hilt_paint=P('silver', 0.02, [B('top', 0.0, 0.012, 'solid', 'oasisturq')], fabric='metal.iron'),
                                   scabbard_paint=P('nahhascopper', 0.02, [B('bottom', 0.0, 0.025, 'hirz_filigree', 'silver', 'goatblack', 0.035)], fabric='metal.bronze')))

    sl_p = P('smokebuck', 0.05, [
        B('bottom', 0.0, 0.045, 'buckskin_concho', 'silver', 'smokebuck', 0.045),
    ], fabric='leather.buckskin')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.024, rows=10))
    entries.append(_tag_pc(assemble_garment(gid_t, 'Mezcalero Corsair Sadu Waistcoat & Buckskin War-Shirt', 'torso', 'dasri', parts_t)))

    # GLOVES: Archer bracer-gloves
    gid_g = f'dsr_{sex}_pc_corsair_bracers'
    br_p = P('smokebuck', 0.05, [
        B('top', 0.0, 0.014, 'solid', 'silver'),
        B('bottom', 0.0, 0.014, 'solid', 'oasisturq'),
    ], [PN(0.0, 1.0, 'hirz_filigree', 'silver', 'goatblack', 0.05)], fabric='leather.polished')
    palm_p = P('goatblack', 0.04, [B('top', 0.0, 0.010, 'solid', 'oasisturq')], fabric='leather.buckskin')
    e_g = assemble_garment(gid_g, 'Mezcalero Corsair Concho Archer Bracers', 'gloves', 'dasri',
                           dasri_bracers(gid_g, br_p, palm_paint=palm_p, concho_paint=concho_p, f0=0.52))
    e_g.pop('hide_parts', None)
    entries.append(_tag_pc(e_g))

    # LEGS: Indigo sirwal + beaded buckskin breechclout
    gid_l = f'dsr_{sex}_pc_corsair_pants'
    sir_p = P('ebadindigo', 0.04, [
        B('bottom', 0.0, 0.045, 'sadu_apache_chevron', 'dragoncrimson', 'ebadindigo', 0.045),
    ], fabric=COTTON)
    clout_p = P('smokebuck', 0.05, [
        B('bottom', 0.0, 0.050, 'sadu_apache_chevron', 'oasisturq', 'dragoncrimson', 0.05),
    ], [PN(0.0, 1.0, 'buckskin_concho', 'silver', 'smokebuck', 0.075)], fabric='leather.buckskin')
    entries.append(_tag_pc(assemble_garment(gid_l, 'Mezcalero Corsair Indigo Sirwal & Beaded Breechclout', 'legs', 'dasri',
                                            breechclout_sirwal(gid_l, sir_p, clout_p), legged=True)))

    # FEET: Knee-high folded-top Apache ndee cactus-toe boots
    gid_f = f'dsr_{sex}_pc_corsair_boots'
    boot_p = P('smokebuck', 0.05, [B('bottom', 0.0, 0.018, 'solid', 'silver')], fabric='leather.buckskin')
    cuff_p = P('dragoncrimson', 0.04, [
        B('bottom', 0.0, 0.028, 'buckskin_concho', 'oasisturq', 'goatblack', 0.045),
        B('top', 0.0, 0.012, 'solid', 'silver'),
    ], fabric='leather.buckskin')
    entries.append(_tag_pc(assemble_garment(gid_f, 'Mezcalero Corsair Knee-High Ndee Cactus-Boots', 'feet', 'dasri',
                                            ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.84, upturned=True, concho_paint=concho_p))))

    # BACK: Hammered nahhas copper mezcal canteen & painted rawhide buckler
    gid_b = f'dsr_{sex}_pc_corsair_pack'
    parts_b = []
    c_bk = spine_at(CHEST + 0.01)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.112
    sh_c = c_bk + np.array([0.0, d_bk + 0.046, 0.0])
    buckler_p = P('smokebuck', 0.05, [
        B('bottom', 0.0, 0.024, 'solid', 'silver'),
    ], [PN(0.0, 1.0, 'horned_sun_shield', 'silver', 'dragoncrimson', 0.22)], fabric='leather.buckskin')
    parts_b.append(rosette(gid_b + '_corsair_buckler', sh_c, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                           0.185, buckler_p, n=24, thick=0.018, rigid_joint='Spine2'))
    cant_c = sh_c + np.array([-0.088, 0.022, -0.105])
    cant_p = P('nahhascopper', 0.02, [
        B('top', 0.0, 0.020, 'solid', 'silver'),
        B('bottom', 0.0, 0.020, 'hirz_filigree', 'silver', 'nahhascopper', 0.035),
    ], fabric='metal.bronze')
    parts_b.append(blob(gid_b + '_copper_mezcal_canteen', cant_c, (0.105, 0.075, 0.125), cant_p,
                        n=14, rows=6, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.04, [B('top', 0.0, 0.008, 'solid', 'silver')], fabric='leather.polished')))
    entries.append(_tag_pc(assemble_garment(gid_b, 'Mezcalero Corsair Copper Mezcal Canteen & Painted Buckler', 'back', 'dasri', parts_b)))
    return entries


def build_dasri_confederacy():
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_dune_raider(sex, body_id))
        entries.extend(_build_canyon_warden(sex, body_id))
        entries.extend(_build_horse_outrider(sex, body_id))
        entries.extend(_build_aquifer_warden(sex, body_id))
        entries.extend(_build_oracle(sex, body_id))
        entries.extend(_build_jabal_syndic(sex, body_id))
        entries.extend(_build_patriarch(sex, body_id))
        entries.extend(_build_pc_mezcalero_corsair(sex, body_id))
    return entries
