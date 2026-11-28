"""The Tabisti (`tabisti` / *Ibisen* & Reed-Lake — Maghrebi Amazigh + Andean) — Part 2 (Tiers 9–15).

Implements Categories III–VI (Dense-Air Cavalry, Crystal-Fire Altar Clergy, Governors & Nobles, and
100% Procedural Flagship PC Heroes) across both `mpfb_male` (`m`) and `mpfb_female` (`f`):
  9.  `lizard_lancer`   — Dense-Air Riding-Lizard & Marsh-Emu Outrider (`6 x 2 = 12` pieces)
  10. `altar_priest`    — Priest of the Crystal-Fire Altar (`ⵣ` Yaz Banner-Keeper) (`6 x 2 = 12` pieces)
  11. `salt_oracle`     — Tifinagh Salt-Mark Diviner & Swamp-Copal Mystic (`6 x 2 = 12` pieces)
  12. `verge_mayor`     — Lower Verge Magistracy & Treaty-Port Syndic (`6 x 2 = 12` pieces)
  13. `headman`         — Kasbah-Pukara Headman of Tabist & Liikofi (`6 x 2 = 12` pieces)
  14. `pc_azure_emir`   — Indigo Tagelmust & Tocapu-Mirror Envoy (PC Hero, 100% procedural) (`6 x 2 = 12` pieces)
  15. `pc_scarp_warden` — Atlas-Burnous & Uncu Cliff-Champion (PC Hero, 100% procedural) (`6 x 2 = 12` pieces)
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, ring_points, assemble_garment
)
from ..paint import P, B, PN, COTTON, WOOL
from ..types.torso import (
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, band, pauldron
)
from ..types.limbs import sleeves, trousers
from ..types.footwear import boots, sandal
from ..types.headgear import (
    head_rings, sculpted_faceplate, sculpted_cranium, hood, brim,
    tower_hat, crown_band, crest, horn, turban
)
from ..types.accoutrements import (
    blob, pack_straps, pendants, tube, tassel, rosette
)
from .tabisti_terraces_reed import (
    _head_landmarks, _snap_on_part, _cuff_palm_gloves, _tizerzai_fibula,
    _yaz_emblem, _eight_star_boss, _swoop_horn_pair, _chullo_earflaps,
    _koummya_hip, _chuspa_pouch
)


def _chest_chain(gid_prefix, z_neck, w_loop, drop_z, coat_ease, link_p, n_links=29):
    """Continuous 3D silver/gold chain loop resting flush (`+3.5 mm`) on the chest (`rigid_joint='Spine2'`)."""
    parts = []
    curve_pts = []
    for k in range(23):
        u = k / 22.0
        ang = (u - 0.5) * 0.92 * math.pi
        bx = math.sin(ang) * w_loop
        bz = z_neck - math.cos(ang) * drop_z
        curve_pts.append(chest_front(bz, coat_ease + 0.0035, x=bx))
    parts.append(horn(f'{gid_prefix}_cord', curve_pts, 0.0055, 0.0055, link_p,
                      n=8, rows=23, rigid_joint='Spine2', role='trinket'))
    for k in range(n_links):
        u = k / float(n_links - 1)
        ang = (u - 0.5) * 0.92 * math.pi
        bx = math.sin(ang) * w_loop
        bz = z_neck - math.cos(ang) * drop_z
        b_pos = chest_front(bz, coat_ease + 0.0040, x=bx)
        sx = 0.014 if (k % 2 == 0) else 0.011
        sz = 0.011 if (k % 2 == 0) else 0.014
        parts.append(blob(f'{gid_prefix}_link_{k}', b_pos, (sx, 0.009, sz), link_p,
                          n=8, rows=4, out=FRONT, rigid_joint='Spine2', role='trinket'))
    return parts


def _dorsal_banner_panel(name, back_b, width, z_bot_off, z_top_off, y_off, paint):
    """Taut flat woven standard/banner panel (`Part`, `rigid_joint='Spine2'`) suspended between dorsal poles."""
    rows, cols = 9, 9
    zs = np.linspace(float(back_b[2]) + z_top_off, float(back_b[2]) + z_bot_off, rows)
    xs = np.linspace(-0.5 * width, 0.5 * width, cols)
    Q = np.zeros((rows, cols, 3), dtype=np.float64)
    for i, zv in enumerate(zs):
        v = i / float(rows - 1)
        for j, xv in enumerate(xs):
            sway = 0.006 * math.sin(v * math.pi)
            Q[i, j] = [float(back_b[0]) + xv, float(back_b[1]) + y_off + sway, zv]
    return Part(name, Q, False, ['body'] * rows, paint, rigid_joint='Spine2')


# ===========================================================================================================
# TIER 9: `lizard_lancer` — Dense-Air Riding-Lizard & Marsh-Emu Outrider (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_lizard_lancer(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    silver_p = P('silver', 0.02, fabric='metal.iron')
    cerul_p = P('altarcerulean', 0.02, fabric='beads.glass')

    # 9.1 Head: Full indigo-and-saffron Amazigh tagelmust (turban + face litham veil) w/ silver tizerzai star (`cf=True`)
    gid_h = f'tab_{sex}_lancer_tagelmust'
    tag_p = P('atlasindigo', 0.04, [
        B('bottom', 0.0, 0.020, 'solid', 'saffron'),
        B('top', 0.0, 0.024, 'stripes', 'saffron', 'atlasindigo', 0.022),
    ], fabric=COTTON)
    coil_p = P('saffron', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'atlasindigo'),
        B('bottom', 0.0, 0.010, 'solid', 'abysslac'),
    ], [PN(0.0, 1.0, 'chevrons', 'atlasindigo', 'saffron', 0.04)], fabric=COTTON)
    veil_p = P('atlasindigo', 0.04, [
        B('top', 0.0, 0.014, 'solid', 'saffron'),
        B('bottom', 0.0, 0.018, 'awayo_stripe', 'saffron', 'abysslac', 0.035),
    ], fabric=COTTON)
    brow_wrap = crown_band(gid_h + '_turban_coil', coil_p, f0=0.52, f1=0.86, ease=0.023, flare=0.012, rows=7, n=38)
    parts_h = [
        head_rings(gid_h + '_crown', 0.46, 1.05, 0.019, tag_p, n=36, rows=8, apex=True),
        brow_wrap,
        sculpted_faceplate(
            gid_h + '_litham_veil', veil_p,
            f_top=f_nose + 0.025, f_bot=max(0.01, f_nose - 0.30),
            ease=0.021, span=0.48, rows=12, cols=23,
            brow_relief=0.0, nose_relief=0.018, cheek_relief=0.010, chin_relief=0.012
        ),
    ]
    # Nape wind-cloth
    fs_np = np.linspace(max(0.02, f_nose - 0.28), f_eyes + 0.04, 6)
    angs_np = np.linspace(-0.56 * math.pi, 0.56 * math.pi, 24)
    Np_grid = []
    for k_n, fv in enumerate(fs_np):
        c_ray = a + (b - a) * max(fv, 0.36)
        c_cur = a + (b - a) * fv
        Np_grid.append([
            pt + (c_cur - c_ray)
            for pt in ring_points(c_ray, bk, left, angs_np, 0.020 + 0.010 * (1.0 - k_n / 5.0), rmin=0.05, rmax=0.18)
        ])
    parts_h.append(Part(gid_h + '_nape_veil', np.array(Np_grid), False, ['body'] * len(fs_np), tag_p, rigid_joint='Head'))
    star_pt = _snap_on_part(brow_wrap, a + (b - a) * (f_brow + 0.08) - bk * 0.12, -bk, offset=0.003)
    parts_h.extend(_tizerzai_fibula(gid_h + '_tizerzai', star_pt, -bk, left, up, 0.80, silver_p, cerul_p, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Outrider Indigo-Saffron Tagelmust & Litham Veil', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=True
    ))

    # 9.2 Torso: Split-skirted cavalry selham reinforced w/ embossed reptile-scale waistcoat
    gid_t = f'tab_{sex}_lancer_selham'
    selham_p = P('atlasindigo', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'saffron'),
        B('bottom', 0.0, 0.036, 'awayo_stripe', 'saffron', 'abysslac', 0.05),
    ], [
        PN(0.45, 0.55, 'solid', 'saffron', 'atlasindigo', 1.0),
    ], fabric=WOOL)
    rep_p = P('olive', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'brass'),
        B('bottom', 0.0, 0.024, 'solid', 'bark'),
    ], [PN(0.0, 1.0, 'lamellar_scale', 'bark', 'olive', 0.085)], fabric='leather.polished')
    parts_t = [
        torso_tube(gid_t + '_selham', TOP, KNEE + 0.05, 0.015, selham_p,
                   n=46, rows=20, hang_from=WAIST - 0.02, flare=0.13,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        torso_tube(gid_t + '_reptile_vest', SHOULDER + 0.015, WAIST - 0.025, 0.023, rep_p,
                   n=44, rows=11, hull_from=CHEST + 0.02),
        stand_collar(gid_t, P('saffron', 0.04, [B('top', 0.0, 0.008, 'solid', 'olive')], fabric=WOOL), high=0.030),
        cape(gid_t + '_outrider_cape', WAIST - 0.14, selham_p, span=0.40, ease=0.032, flare=0.14, rows=15, n=28),
        band(gid_t + '_baldric', WAIST + 0.01, TOP - 0.034, 0.050, 0.025, rep_p, high=math.pi * 0.46, rows=4),
        torso_tube(gid_t + '_belt', WAIST + 0.032, WAIST - 0.032, 0.027,
                   P('bark', 0.04, [B('top', 0.0, 0.010, 'beads', 'silver', 'bark', 0.03)], fabric='leather.polished'),
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    for sd_p in (L, R):
        parts_t.append(pauldron(f'{gid_t}_scale_sh_{sd_p[0]}', sd_p, rep_p, reach=0.32, ease=0.024, rows=6, n=14))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017,
                           P('atlasindigo', 0.04, [B('bottom', 0.0, 0.030, 'solid', 'saffron')], fabric=WOOL),
                           ease_end=0.026, rows=9))
    # Lizard-goad prod & silver koummya dagger on belt
    d_gd = np.array([0.82, -0.57, 0.0])
    d_gd /= np.linalg.norm(d_gd)
    p_gd = surface_out(spine_at(WAIST - 0.012), d_gd, 0.029, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_lizard_goad',
                        [p_gd + np.array([0.0, 0.0, 0.085]), p_gd - np.array([0.0, 0.0, 0.105])],
                        0.011, P('brass', 0.02, [B('bottom', 0.0, 0.04, 'solid', 'bark')], fabric='metal.bronze'),
                        n=8, rigid_joint='Hips'))
    parts_t.extend(_koummya_hip(gid_t, WAIST, 0.028, silver_p, P('brass', 0.02, fabric='metal.gold'), side_sgn=-1.0))
    entries.append(assemble_garment(
        gid_t, 'Split-Skirted Cavalry Selham & Reptile-Scale Vest', 'torso', 'tabisti', parts_t
    ))

    # 9.3 Gloves: Reptile-hide riding gauntlets
    gid_g = f'tab_{sex}_lancer_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Embossed Reptile-Hide & Brass Cavalry Gauntlets', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g, rep_p, P('bark', 0.05, fabric='leather.buckskin'), f0=0.60)
    ))

    # 9.4 Legs: Wide saffron/indigo serouel w/ reptile-hide knee-grips
    gid_l = f'tab_{sex}_lancer_serouel'
    ser_l = P('saffron', 0.04, [
        B('bottom', 0.0, 0.065, 'solid', 'atlasindigo'),
        B('top', 0.0, 0.030, 'solid', 'atlasindigo'),
    ], [PN(0.28, 0.72, 'lamellar_scale', 'bark', 'olive', 0.14)], fabric=WOOL)
    entries.append(assemble_garment(
        gid_l, 'Saffron-Indigo Cavalry Serouel & Reptile Knee-Grips', 'legs', 'tabisti',
        trousers(gid_l, ser_l, ease=0.022, ease_end=0.024, bag=0.036, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 9.5 Feet: Studded reptile-leather cavalry boots
    gid_f = f'tab_{sex}_lancer_boots'
    entries.append(assemble_garment(
        gid_f, 'Brass-Studded Reptile-Leather Cavalry Boots', 'feet', 'tabisti',
        boots(gid_f, P('bark', 0.05, fabric='leather.polished'),
              P('olive', 0.04, [B('top', 0.0, 0.042, 'beads', 'brass', 'atlasindigo', 0.035)], fabric='leather.polished'),
              top=0.58, wraps=2, wrap_paint=P('saffron', 0.04, fabric=WOOL), ease_top=0.032)
    ))

    # 9.6 Back: Marsh-javelin quiver & saddle-tether coil
    gid_b = f'tab_{sex}_lancer_quiver'
    back_b = surface_out(spine_at(CHEST - 0.01), d_bk, 0.022, bvh=core.BVH_T)
    quiv_p = P('olive', 0.04, [
        B('top', 0.0, 0.038, 'awayo_stripe', 'saffron', 'abysslac', 0.045),
        B('bottom', 0.0, 0.030, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'lamellar_scale', 'bark', 'olive', 0.09)], fabric='leather.polished')
    q_top = back_b + np.array([0.075, 0.045, 0.165])
    q_bot = back_b + np.array([-0.055, 0.042, -0.175])
    parts_b = [
        tube(gid_b + '_quiver_body', [q_top, q_bot], 0.048, quiv_p, n=14, rigid_joint='Spine2'),
    ]
    jav_p = P('totorareed', 0.05, [B('top', 0.0, 0.06, 'solid', 'abysslac')], fabric='straw.reed.plaited')
    for idx_j, dx_j in enumerate((-0.024, 0.0, 0.024)):
        j0 = q_top + np.array([dx_j + 0.04, 0.0, 0.145])
        j1 = q_top + np.array([dx_j - 0.01, 0.0, -0.045])
        parts_b.append(horn(f'{gid_b}_javelin_{idx_j}', [j1, j0], 0.008, 0.005, jav_p, n=8, rows=6, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('bark', 0.04, fabric='leather.polished'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Reptile-Hide Marsh-Javelin Quiver', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 10: `altar_priest` — Priest of the Crystal-Fire Altar (`ⵣ` Yaz Banner-Keeper) (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_altar_priest(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    tin_p = P('tinmirror', 0.02, fabric='metal.tin.patchwork')
    gilt_p = P('gold', 0.02, fabric='metal.gold')
    cerul_p = P('altarcerulean', 0.02, fabric='glass.moonglass.leaded')

    # 10.1 Head: Tall stepped salt-white & gilded mitre-crown w/ swoop-and-horn temple finials & Yaz crystal
    gid_h = f'tab_{sex}_priest_mitre'
    mitre_p = P('saltlime', 0.03, [
        B('bottom', 0.0, 0.026, 'solid', 'gold'),
        B('bottom', 0.026, 0.062, 'solid', 'abysslac'),
        B('bottom', 0.062, 0.098, 'solid', 'liikofiteal'),
        B('top', 0.0, 0.032, 'solid', 'gold'),
    ], [
        PN(0.38, 0.62, 'steps', 'gold', 'saltlime', 0.07),
    ], fabric='cloth.silk')
    # Stepped pyramid profile recalling the Temple of the Altar (Alettar)
    mitre_hat = tower_hat(
        gid_h + '_stepped_mitre', 0.21,
        lambda s: 1.04 - 0.16 * math.floor(s * 3.99) / 3.0 - 0.08 * s,
        mitre_p, f=0.58, ease=0.016, rows=13, n=40
    )
    diadem_h = crown_band(gid_h + '_gilt_rim',
                          P('gold', 0.02, [B('top', 0.0, 0.012, 'tin_patchwork', 'tinmirror', 'gold', 0.04)], fabric='metal.gold'),
                          f0=0.54, f1=0.70, ease=0.019, flare=0.006, rows=5, n=40)
    parts_h = [mitre_hat, diadem_h]
    parts_h.extend(_swoop_horn_pair(gid_h, mitre_hat, up, bk, left, 0.72, 0.092, 0.135,
                                    P('saltlime', 0.03, [B('top', 0.0, 0.04, 'solid', 'gold')], fabric='metal.gold'), gilt_p))
    brow_c = _snap_on_part(mitre_hat, a + (b - a) * (f_brow + 0.14) - bk * 0.12, -bk, offset=0.003)
    parts_h.append(blob(gid_h + '_crystal_cabochon', brow_c, (0.026, 0.014, 0.026),
                        cerul_p, n=10, rows=4, out=-bk, rigid_joint='Head'))
    parts_h.extend(_yaz_emblem(gid_h, brow_c - bk * 0.004, -bk, left, up, 0.028, gilt_p, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Stepped Alettar Salt-White Mitre & Gilded Swoop-Horns', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 10.2 Torso: Floor-length salt-white pleated robe banded in crimson, verdigris & gold + tin-mirror & cerulean crystal pectoral
    gid_t = f'tab_{sex}_priest_robe'
    robe_p = P('saltlime', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
        B('bottom', 0.035, 0.085, 'solid', 'abysslac'),
        B('bottom', 0.085, 0.135, 'solid', 'liikofiteal'),
    ], [
        PN(0.41, 0.59, 'chakana_red', 'gold', 'abysslac', 0.14),
        PN(0.38, 0.41, 'solid', 'gold', 'saltlime', 1.0),
        PN(0.59, 0.62, 'solid', 'gold', 'saltlime', 1.0),
    ], fabric='cloth.silk')
    yoke_p = P('saltlime', 0.03, [
        B('bottom', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.024, 0.048, 'solid', 'liikofiteal'),
    ], fabric='cloth.silk')
    sash_pr = P('abysslac', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'steps', 'gold', 'liikofiteal', 0.06)], fabric='cloth.silk')
    parts_t = [
        torso_tube(gid_t + '_robe', TOP, ANKLE + 0.06, 0.016, robe_p,
                   n=48, rows=22, hang_from=WAIST - 0.02, flare=0.18,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        collar_disc(gid_t + '_alettar_yoke', 0.088, yoke_p, drop=0.076, rows=8, n=46, scallop=0.05, ease=0.019),
        torso_tube(gid_t + '_sash', WAIST + 0.034, WAIST - 0.032, 0.021, sash_pr,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017,
                           P('saltlime', 0.03, [
                               B('bottom', 0.0, 0.025, 'solid', 'gold'),
                               B('bottom', 0.025, 0.062, 'solid', 'abysslac'),
                           ], fabric='cloth.silk'),
                           ease_end=0.044, rows=10))
    # Tin-mirror & glowing cerulean crystal sun-star pectoral suspended on silver chain
    parts_t.extend(_chest_chain(gid_t + '_chain', TOP - 0.020, 0.082, 0.115, 0.019, tin_p, n_links=27))
    parts_t.extend(_eight_star_boss(
        gid_t + '_sun_pectoral', chest_front(CHEST + 0.015, 0.023, x=0.0),
        FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.054, tin_p, cerul_p
    ))
    # Smoking swamp-copal fire-censer on right hip
    d_cn = np.array([-0.78, -0.62, 0.0])
    d_cn /= np.linalg.norm(d_cn)
    p_cn = surface_out(spine_at(WAIST - 0.022), d_cn, 0.024, bvh=core.BVH_T)
    parts_t.append(blob(gid_t + '_copal_censer', p_cn, (0.062, 0.058, 0.072),
                        P('gold', 0.02, [B('top', 0.0, 0.025, 'solid', 'altarcerulean')], fabric='metal.gold'),
                        n=12, rows=6, out=d_cn, rigid_joint='Hips', role='accessory'))
    entries.append(assemble_garment(
        gid_t, 'Alettar Salt-White Liturgical Robe & Crystal-Star Pectoral', 'torso', 'tabisti', parts_t
    ))

    # 10.3 Gloves: Salt-white & tin-mirror liturgical cuffs
    gid_g = f'tab_{sex}_priest_cuffs'
    entries.append(assemble_garment(
        gid_g, 'Salt-White Silk & Tin-Mirror Liturgical Cuffs', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g,
                          P('saltlime', 0.03, [B('top', 0.0, 0.020, 'solid', 'gold'),
                                               B('bottom', 0.0, 0.020, 'solid', 'liikofiteal')], fabric='cloth.silk'),
                          P('saltlime', 0.03, fabric='cloth.silk'), f0=0.66)
    ))

    # 10.4 Legs: Pleated sanctum under-trousers
    gid_l = f'tab_{sex}_priest_undertrousers'
    entries.append(assemble_garment(
        gid_l, 'Alettar Salt-White & Verdigris Sanctum Trousers', 'legs', 'tabisti',
        trousers(gid_l, P('saltlime', 0.03, [B('bottom', 0.0, 0.048, 'solid', 'liikofiteal')], fabric='cloth.silk'),
                 ease=0.017, ease_end=0.020, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 10.5 Feet: Gilded & salt-white temple slippers
    gid_f = f'tab_{sex}_priest_sandals'
    entries.append(assemble_garment(
        gid_f, 'Gilded Salt-White & Lac-Crimson Temple Boots', 'feet', 'tabisti',
        boots(gid_f, gilt_p,
              P('saltlime', 0.03, [B('top', 0.0, 0.032, 'solid', 'abysslac'),
                                   B('bottom', 0.0, 0.024, 'solid', 'gold')], fabric='leather.polished'),
              top=0.38, ease_top=0.028)
    ))

    # 10.6 Back: Upright dorsal Alettar Yaz (ⵣ) & 8-Pointed Star crystal-fire banner-frame
    gid_b = f'tab_{sex}_priest_banner'
    back_b = surface_out(spine_at(CHEST - 0.01), d_bk, 0.022, bvh=core.BVH_T)
    ban_p = P('saltlime', 0.03, [
        B('top', 0.0, 0.038, 'solid', 'gold'),
        B('bottom', 0.0, 0.045, 'solid', 'abysslac'),
        B('bottom', 0.045, 0.085, 'solid', 'liikofiteal'),
    ], [
        PN(0.12, 0.88, 'zellij_star', 'liikofiteal', 'saltlime', 0.14),
    ], fabric='cloth.silk')
    y_frame = 0.042
    z_top_b, z_bot_b = 0.42, -0.14
    parts_b = [
        # Padded dorsal socket block against upper back
        blob(gid_b + '_harness_block', back_b + np.array([0.0, 0.018, 0.0]), (0.20, 0.045, 0.18),
             P('abysslac', 0.04, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='leather.polished'),
             n=12, rows=5, out=d_bk, rigid_joint='Spine2'),
        # Taut woven Alettar temple banner panel
        _dorsal_banner_panel(gid_b + '_banner_cloth', back_b, 0.25, -0.08, z_top_b - 0.02, y_frame, ban_p),
        # Gilded top crossbar
        tube(gid_b + '_crossbar',
             [back_b + np.array([-0.155, y_frame, z_top_b]), back_b + np.array([0.155, y_frame, z_top_b])],
             0.013, gilt_p, n=10, rigid_joint='Spine2'),
    ]
    # Twin vertical gilded standard poles + swoop-horn finials rooted at crossbar ends
    for sd_p, tg_p in ((-1.0, 'R'), (1.0, 'L')):
        px = sd_p * 0.125
        parts_b.append(tube(f'{gid_b}_pole_{tg_p}',
                            [back_b + np.array([px, y_frame - 0.006, z_top_b + 0.02]),
                             back_b + np.array([px, y_frame - 0.006, z_bot_b])],
                            0.012, gilt_p, n=10, rigid_joint='Spine2'))
        hb_root = back_b + np.array([sd_p * 0.150, y_frame, z_top_b])
        parts_b.append(horn(f'{gid_b}_bar_horn_{tg_p}',
                            [hb_root,
                             hb_root + np.array([sd_p * 0.045, 0.0, 0.040]),
                             hb_root + np.array([sd_p * 0.032, 0.0, 0.095])],
                            0.012, 0.003, gilt_p, n=8, rows=6, rigid_joint='Spine2'))
    # Glowing cerulean crystal fire-ring finial centered atop crossbar
    fin_c = back_b + np.array([0.0, y_frame, z_top_b + 0.042])
    parts_b.append(rosette(gid_b + '_fire_ring', fin_c, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.044, gilt_p, n=14, thick=0.009, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_crystal_flame', fin_c + d_bk * 0.006, (0.042, 0.020, 0.052),
                        cerul_p, n=10, rows=5, out=d_bk, rigid_joint='Spine2'))
    # Central Amazigh Yaz (ⵣ) standing in the middle of the temple banner + 8-pointed tin-mirror star!
    em_c = back_b + np.array([0.0, y_frame + 0.007, 0.17])
    parts_b.extend(_eight_star_boss(gid_b + '_star', em_c, d_bk, np.array([1.0, 0.0, 0.0]),
                                    np.array([0.0, 0.0, 1.0]), 0.088, tin_p, cerul_p, rigid_joint='Spine2'))
    parts_b.extend(_yaz_emblem(gid_b, em_c + d_bk * 0.008, d_bk, np.array([1.0, 0.0, 0.0]),
                               np.array([0.0, 0.0, 1.0]), 0.054, gilt_p, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('abysslac', 0.04, [B('top', 0.0, 0.010, 'solid', 'gold')], fabric='leather.polished'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Upright Alettar Yaz & Crystal-Fire Temple Banner', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 11: `salt_oracle` — Tifinagh Salt-Mark Diviner & Swamp-Copal Mystic (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_salt_oracle(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    tin_p = P('tinmirror', 0.02, fabric='metal.tin.patchwork')
    cerul_p = P('altarcerulean', 0.02, fabric='glass.moonglass.leaded')

    # 11.1 Head: Oversized Atlas burnous hood + hanging tin-mirror forehead coin-veil (`cf=True`)
    gid_h = f'tab_{sex}_oracle_hood'
    hood_p = P('peatumber', 0.05, [
        B('top', 0.0, 0.030, 'solid', 'atlasindigo'),
        B('bottom', 0.0, 0.036, 'tifinagh_lime', 'saltlime', 'peatumber', 0.055),
    ], [
        PN(0.32, 0.68, 'tifinagh_lime', 'saltlime', 'atlasindigo', 0.11),
    ], fabric=WOOL)
    veil_p = P('tinmirror', 0.03, [
        B('top', 0.0, 0.018, 'solid', 'saltlime'),
    ], [PN(0.0, 1.0, 'coin_veil', 'tinmirror', 'atlasindigo', 0.09)], fabric='metal.tin.patchwork')
    or_hood = hood(gid_h + '_burnous_hood', hood_p, ease=0.017, ease_low=0.021,
                   open_front=0.88, low=-0.25, rows=12, n=36, peak=0.05, high=1.04)
    coin_v = sculpted_faceplate(
        gid_h + '_mirror_veil', veil_p,
        f_top=f_brow + 0.04, f_bot=max(0.02, f_nose - 0.28),
        ease=0.020, span=0.46, rows=13, cols=23,
        brow_relief=0.010, nose_relief=0.018, cheek_relief=0.010, chin_relief=0.010
    )
    parts_h = [or_hood, coin_v]
    # Clinking tin-mirror & bottle-bottom talisman discs across the brow rim
    for k_d, u_d in enumerate(np.linspace(-0.34, 0.34, 5)):
        d_dir = -bk * math.cos(u_d * math.pi) + left * math.sin(u_d * math.pi)
        d_dir /= np.linalg.norm(d_dir)
        p_disc = _snap_on_part(coin_v, a + (b - a) * (f_brow + 0.02) + d_dir * 0.11, d_dir, offset=0.003)
        disc_p = cerul_p if (k_d == 2) else tin_p
        parts_h.append(blob(f'{gid_h}_brow_talisman_{k_d}', p_disc, (0.024, 0.009, 0.026),
                            disc_p, n=10, rows=4, out=d_dir, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Oversized Burnous Hood & Tin-Mirror Coin-Veil', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=True
    ))

    # 11.2 Torso: Patchwork awayo & Tifinagh lime-painted robe covered in clinking tin-mirror talismans & khipu sash
    gid_t = f'tab_{sex}_oracle_robe'
    robe_o = P('peatumber', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'saltlime'),
        B('bottom', 0.0, 0.055, 'awayo_stripe', 'saffron', 'abysslac', 0.055),
        B('bottom', 0.055, 0.125, 'tifinagh_lime', 'saltlime', 'atlasindigo', 0.075),
    ], [
        PN(0.20, 0.42, 'awayo_stripe', 'abysslac', 'liikofiteal', 0.12),
        PN(0.42, 0.58, 'tifinagh_lime', 'saltlime', 'peatumber', 0.12),
        PN(0.58, 0.80, 'tin_patchwork', 'tinmirror', 'atlasindigo', 0.12),
    ], fabric=WOOL)
    khipu_p = P('saltlime', 0.05, [
        B('top', 0.0, 0.010, 'solid', 'abysslac'),
        B('bottom', 0.0, 0.012, 'beads', 'tinmirror', 'atlasindigo', 0.03),
    ], fabric=COTTON)
    parts_t = [
        torso_tube(gid_t + '_robe', TOP, ANKLE + 0.06, 0.016, robe_o,
                   n=48, rows=22, hang_from=WAIST - 0.02, flare=0.17,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        collar_disc(gid_t + '_talisman_yoke', 0.084,
                    P('atlasindigo', 0.04, [B('bottom', 0.0, 0.032, 'tin_patchwork', 'tinmirror', 'atlasindigo', 0.045)], fabric=WOOL),
                    drop=0.074, rows=8, n=44, scallop=0.06, ease=0.019),
        torso_tube(gid_t + '_khipu_sash', WAIST + 0.034, WAIST - 0.032, 0.022, khipu_p,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017,
                           P('atlasindigo', 0.05, [B('bottom', 0.0, 0.045, 'tifinagh_lime', 'saltlime', 'peatumber', 0.05)], fabric=WOOL),
                           ease_end=0.042, rows=10))
    # Clinking tin-mirror & bottle-bottom talismans across upper chest + mirror-chime belt pendants
    for idx_tm, (tx, tz, tp_c) in enumerate((
        (-0.065, CHEST + 0.035, tin_p),
        (-0.022, CHEST + 0.012, cerul_p),
        (0.022, CHEST + 0.012, tin_p),
        (0.065, CHEST + 0.035, cerul_p),
        (0.0, CHEST - 0.028, tin_p),
    )):
        parts_t.append(blob(f'{gid_t}_chest_mirror_{idx_tm}', chest_front(tz, 0.022, x=tx),
                            (0.028, 0.010, 0.030), tp_c, n=10, rows=4, out=FRONT, rigid_joint='Spine2', role='trinket'))
    parts_t.extend(pendants(gid_t + '_chime_', WAIST - 0.028,
                            [math.pi * (0.65 + 0.14 * k) for k in range(6)],
                            (0.022, 0.010, 0.032), tin_p, ease=0.020))
    entries.append(assemble_garment(
        gid_t, 'Tifinagh Lime-Painted Patchwork Robe & Mirror-Chime Sash', 'torso', 'tabisti', parts_t
    ))

    # 11.3 Gloves: Lime-inscribed diviner hand-wraps
    gid_g = f'tab_{sex}_oracle_wraps'
    entries.append(assemble_garment(
        gid_g, 'Salt-Mark Inscribed Wool & Tin-Ring Diviner Wraps', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g,
                          P('peatumber', 0.05, [B('top', 0.0, 0.022, 'tifinagh_lime', 'saltlime', 'peatumber', 0.035)], fabric=WOOL),
                          P('saltlime', 0.05, fabric=COTTON), f0=0.64)
    ))

    # 11.4 Legs: Patchwork mystic trousers
    gid_l = f'tab_{sex}_oracle_trousers'
    entries.append(assemble_garment(
        gid_l, 'Patchwork Awayo & Peat-Umber Mystic Trousers', 'legs', 'tabisti',
        trousers(gid_l, P('peatumber', 0.05, [B('bottom', 0.0, 0.060, 'awayo_stripe', 'saltlime', 'abysslac', 0.05)], fabric=WOOL),
                 ease=0.018, ease_end=0.022, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 11.5 Feet: Salt-flat reed & rubber sandals
    gid_f = f'tab_{sex}_oracle_sandals'
    entries.append(assemble_garment(
        gid_f, 'Salt-Flat Reed & Rubber Chime-Laced Sandals', 'feet', 'tabisti',
        sandal(gid_f, P('peatumber', 0.05, fabric='rubber.tyre'),
               P('saltlime', 0.05, fabric='straw.reed.plaited'),
               guard=True, laces=3, strap_paint2=tin_p)
    ))

    # 11.6 Back: Inscribed salt-tablet satchel & swamp-copal brazier hook
    gid_b = f'tab_{sex}_oracle_satchel'
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    sat_p = P('peatumber', 0.05, [
        B('top', 0.0, 0.035, 'tifinagh_lime', 'saltlime', 'atlasindigo', 0.045),
        B('bottom', 0.0, 0.030, 'tin_patchwork', 'tinmirror', 'peatumber', 0.045),
    ], fabric=WOOL)
    hk_top = back_b + np.array([0.088, 0.065, 0.22])
    parts_b = [
        blob(gid_b + '_tablet_satchel', back_b + np.array([-0.020, 0.040, -0.025]), (0.22, 0.11, 0.25),
             sat_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'),
        horn(gid_b + '_brazier_hook',
             [back_b + np.array([0.088, 0.042, -0.14]),
              back_b + np.array([0.088, 0.048, 0.16]),
              hk_top,
              hk_top + np.array([0.0, 0.045, -0.025])],
             0.011, 0.008, P('brass', 0.02, fabric='metal.bronze'), n=8, rows=9, rigid_joint='Spine2'),
        blob(gid_b + '_copal_brazier', hk_top + np.array([0.0, 0.045, -0.065]), (0.072, 0.068, 0.075),
             P('brass', 0.02, [B('top', 0.0, 0.025, 'solid', 'amber')], fabric='metal.gold'),
             n=12, rows=5, out=d_bk, rigid_joint='Spine2'),
    ]
    parts_b.extend(pack_straps(gid_b, P('saltlime', 0.05, fabric=COTTON), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Inscribed Salt-Tablet Satchel & Swamp-Copal Brazier', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 12: `verge_mayor` — Lower Verge Magistracy & Treaty-Port Syndic (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_verge_mayor(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    silver_p = P('silver', 0.02, fabric='metal.iron')
    gilt_p = P('gold', 0.02, fabric='metal.gold')

    # 12.1 Head: Verdigris-and-gold tagelmust over crimson velvet pillbox w/ twin silver tizerzai
    gid_h = f'tab_{sex}_mayor_tagelmust'
    velvet_p = P('abysslac', 0.03, [B('top', 0.0, 0.018, 'solid', 'gold')], fabric='cloth.velvet.cut')
    tag_m = P('liikofiteal', 0.03, [
        B('top', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.0, 0.018, 'zellij_star', 'gold', 'liikofiteal', 0.04),
    ], fabric='cloth.silk')
    pill_m = tower_hat(gid_h + '_velvet_pillbox', 0.115, lambda s: 1.02 - 0.06 * s, velvet_p, f=0.60, ease=0.016, rows=8, n=38)
    wrap_m = crown_band(gid_h + '_tagelmust_coil', tag_m, f0=0.54, f1=0.80, ease=0.022, flare=0.010, rows=6, n=38)
    parts_h = [pill_m, wrap_m]
    for sgn_t, tg_t in ((-1.0, 'R'), (1.0, 'L')):
        d_tf = -bk + left * (0.28 * sgn_t)
        d_tf /= np.linalg.norm(d_tf)
        p_tf = _snap_on_part(wrap_m, a + (b - a) * (f_brow + 0.07) + d_tf * 0.11, d_tf, offset=0.003)
        parts_h.extend(_tizerzai_fibula(f'{gid_h}_tizerzai_{tg_t}', p_tf, d_tf, left, up, 0.72, silver_p,
                                        P('abysslac', 0.02, fabric='beads.glass'), rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Verdigris-Gold Tagelmust, Velvet Pillbox & Twin Tizerzai', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 12.2 Torso: Structured selham coat over Inca-Maghrebi tocapu-zellige robe + silver chain-of-office & treaty belt
    gid_t = f'tab_{sex}_mayor_selham'
    robe_m = P('liikofiteal', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.036, 'solid', 'gold'),
        B('bottom', 0.036, 0.105, 'chakana_red', 'gold', 'abysslac', 0.07),
    ], [
        PN(0.36, 0.64, 'zellij_star', 'gold', 'abysslac', 0.13),
        PN(0.33, 0.36, 'solid', 'silver', 'liikofiteal', 1.0),
        PN(0.64, 0.67, 'solid', 'silver', 'liikofiteal', 1.0),
    ], fabric='cloth.silk')
    cape_m = P('abysslac', 0.03, [
        B('bottom', 0.0, 0.038, 'zellij_star', 'gold', 'liikofiteal', 0.06),
        B('top', 0.0, 0.018, 'solid', 'silver'),
    ], fabric='cloth.velvet.cut')
    belt_m = P('silver', 0.02, [
        B('top', 0.0, 0.009, 'solid', 'gold'),
        B('bottom', 0.0, 0.009, 'solid', 'abysslac'),
    ], fabric='metal.iron')
    parts_t = [
        torso_tube(gid_t + '_robe', TOP, ANKLE + 0.06, 0.016, robe_m,
                   n=48, rows=22, hang_from=WAIST - 0.02, flare=0.17,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        stand_collar(gid_t, P('abysslac', 0.03, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='cloth.velvet.cut'), high=0.032),
        collar_disc(gid_t + '_lliclla_mantle', 0.084, cape_m, drop=0.072, rows=8, n=46, scallop=0.04, ease=0.019),
        cape(gid_t + '_burnous_cape', KNEE + 0.02, cape_m, span=0.40, ease=0.032, flare=0.19, rows=16, n=28),
        torso_tube(gid_t + '_belt', WAIST + 0.034, WAIST - 0.032, 0.022, belt_m,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017,
                           P('liikofiteal', 0.03, [B('bottom', 0.0, 0.048, 'zellij_star', 'gold', 'abysslac', 0.05)], fabric='cloth.silk'),
                           ease_end=0.040, rows=10))
    # Silver chain-of-office & giant silver tupu/tizerzai pin
    parts_t.extend(_chest_chain(gid_t + '_office_chain', TOP - 0.020, 0.084, 0.110, 0.019, silver_p, n_links=29))
    parts_t.extend(_tizerzai_fibula(
        gid_t + '_giant_tupu', chest_front(CHEST + 0.048, 0.024, x=0.0),
        FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 1.12, silver_p, gilt_p
    ))
    # Cableway & Mungo tri-ward treaty-seal cylinders on belt
    for idx_sl, an_sl in enumerate((0.64 * math.pi, 0.78 * math.pi, 1.32 * math.pi)):
        d_sl = np.array([math.sin(an_sl), math.cos(an_sl), 0.0])
        p_sl = surface_out(spine_at(WAIST - 0.014), d_sl, 0.024, bvh=core.BVH_T)
        parts_t.append(tube(f'{gid_t}_treaty_seal_{idx_sl}',
                            [p_sl + np.array([0.0, 0.0, 0.045]), p_sl - np.array([0.0, 0.0, 0.045])],
                            0.014, P('silver', 0.02, [B('top', 0.0, 0.016, 'solid', 'abysslac')], fabric='metal.iron'),
                            n=10, rigid_joint='Hips'))
    entries.append(assemble_garment(
        gid_t, 'Tocapu-Zellige Magistrate Robe, Selham & Chain of Office', 'torso', 'tabisti', parts_t
    ))

    # 12.3 Gloves: Velvet & silver court gloves
    gid_g = f'tab_{sex}_mayor_gloves'
    entries.append(assemble_garment(
        gid_g, 'Crimson Velvet & Silver-Filigree Syndic Gloves', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g,
                          P('abysslac', 0.03, [B('top', 0.0, 0.020, 'solid', 'silver')], fabric='cloth.velvet.cut'),
                          P('saltlime', 0.03, fabric='cloth.silk'), f0=0.66)
    ))

    # 12.4 Legs: Cream-teal silk serouel
    gid_l = f'tab_{sex}_mayor_serouel'
    entries.append(assemble_garment(
        gid_l, 'Salt-Cream & Verdigris Silk Magistrate Serouel', 'legs', 'tabisti',
        trousers(gid_l, P('saltlime', 0.03, [B('bottom', 0.0, 0.055, 'zellij_star', 'gold', 'liikofiteal', 0.045)], fabric='cloth.silk'),
                 ease=0.020, ease_end=0.024, bag=0.032, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 12.5 Feet: Silver-toed Morocco treaty-port boots
    gid_f = f'tab_{sex}_mayor_boots'
    entries.append(assemble_garment(
        gid_f, 'Silver-Toed Verdigris & Crimson Syndic Boots', 'feet', 'tabisti',
        boots(gid_f, silver_p,
              P('liikofiteal', 0.03, [B('top', 0.0, 0.038, 'solid', 'abysslac'),
                                      B('bottom', 0.0, 0.026, 'solid', 'silver')], fabric='leather.polished'),
              top=0.45, ease_top=0.029)
    ))

    # 12.6 Back: Silver-bound Treaty-Charter case & cableway ledger tube
    gid_b = f'tab_{sex}_mayor_case'
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    parts_b = [
        blob(gid_b + '_dispatch_case', back_b + np.array([0.0, 0.036, -0.020]), (0.22, 0.09, 0.24),
             P('abysslac', 0.03, [B('top', 0.0, 0.03, 'solid', 'silver')],
               [PN(0.15, 0.85, 'zellij_star', 'gold', 'liikofiteal', 0.09)], fabric='cloth.velvet.cut'),
             n=14, rows=6, out=d_bk, rigid_joint='Spine2'),
        tube(gid_b + '_charter_cylinder',
             [back_b + np.array([-0.145, 0.048, 0.115]), back_b + np.array([0.145, 0.048, 0.115])],
             0.030, P('silver', 0.02, [B('top', 0.0, 0.04, 'solid', 'gold'), B('bottom', 0.0, 0.04, 'solid', 'gold')], fabric='metal.iron'),
             n=12, rigid_joint='Spine2'),
    ]
    parts_b.extend(pack_straps(gid_b, P('abysslac', 0.03, fabric='leather.polished'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Silver-Bound Mungo Treaty-Charter Case', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 13: `headman` — Kasbah-Pukara Headman of Tabist & Liikofi (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_headman(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    tin_p = P('tinmirror', 0.02, fabric='metal.tin.patchwork')
    gilt_p = P('gold', 0.02, fabric='metal.gold')
    silver_p = P('silver', 0.02, fabric='metal.iron')

    # 13.1 Head: Sovereign indigo/crimson diadem-turban w/ gilded swoop-and-horn mascapaicha-star crown & crimson fringe
    gid_h = f'tab_{sex}_headman_crown'
    turb_p = P('atlasindigo', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.022, 'solid', 'abysslac'),
    ], [PN(0.0, 1.0, 'zellij_star', 'gold', 'atlasindigo', 0.08)], fabric='cloth.silk')
    diad_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.016, 'solid', 'abysslac'),
        B('top', 0.0, 0.012, 'tin_patchwork', 'tinmirror', 'gold', 0.035),
    ], fabric='metal.gold')
    fringe_p = P('abysslac', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold')],
                 [PN(0.0, 1.0, 'vstripes', 'gold', 'abysslac', 0.016)], fabric='cloth.silk')
    dom_h = turban(gid_h + '_royal_turban', turb_p, f0=0.60, f1=1.18, bulge=0.046, ease=0.018, rows=12, n=40)
    diad_b = crown_band(gid_h + '_mascapaicha_diadem', diad_p, f0=0.60, f1=0.81, ease=0.022, flare=0.012, rows=6, n=40)
    fringe_b = crown_band(gid_h + '_crimson_fringe', fringe_p, f0=0.55, f1=0.63, ease=0.019, flare=0.003, rows=4, n=40)
    parts_h = [dom_h, diad_b, fringe_b]
    parts_h.extend(_swoop_horn_pair(gid_h, diad_b, up, bk, left, 0.68, 0.095, 0.130, gilt_p, tin_p))
    star_c = _snap_on_part(diad_b, a + (b - a) * (f_brow + 0.10) - bk * 0.12, -bk, offset=0.003)
    parts_h.extend(_eight_star_boss(gid_h + '_brow_star', star_c, -bk, left, up, 0.038, gilt_p,
                                    P('abysslac', 0.02, fabric='beads.glass'), rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Sovereign Swoop-Horn Mascapaicha Diadem-Turban', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 13.2 Torso: Royal gold/crimson/verdigris tocapu uncu framed by white-and-gold Atlas burnous & tin-mirror star pauldrons
    gid_t = f'tab_{sex}_headman_uncu'
    uncu_h = P('abysslac', 0.03, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.038, 'solid', 'gold'),
        B('bottom', 0.038, 0.105, 'chakana_red', 'gold', 'liikofiteal', 0.065),
    ], [
        PN(0.28, 0.72, 'chakana_tocapu', 'gold', 'liikofiteal', 0.11),
    ], fabric='cloth.silk')
    burnous_h = P('saltlime', 0.03, [
        B('bottom', 0.0, 0.038, 'solid', 'gold'),
        B('bottom', 0.038, 0.082, 'zellij_star', 'gold', 'abysslac', 0.065),
        B('top', 0.0, 0.020, 'solid', 'gold'),
    ], fabric='cloth.silk')
    sash_h = P('gold', 0.02, [
        B('top', 0.0, 0.010, 'solid', 'abysslac'),
        B('bottom', 0.0, 0.010, 'solid', 'liikofiteal'),
    ], [PN(0.0, 1.0, 'awayo_stripe', 'abysslac', 'gold', 0.055)], fabric='metal.gold')
    parts_t = [
        torso_tube(gid_t + '_royal_uncu', TOP, KNEE - 0.04, 0.016, uncu_h,
                   n=48, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        stand_collar(gid_t, gilt_p, high=0.032),
        collar_disc(gid_t + '_burnous_yoke', 0.088, burnous_h, drop=0.076, rows=8, n=46, scallop=0.04, ease=0.019),
        cape(gid_t + '_royal_burnous', ANKLE + 0.08, burnous_h, span=0.40, ease=0.032, flare=0.18, rows=18, n=28),
        torso_tube(gid_t + '_khipu_belt', WAIST + 0.034, WAIST - 0.032, 0.023, sash_h,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    pauld_p = P('tinmirror', 0.02, [B('bottom', 0.0, 0.024, 'solid', 'gold')],
                [PN(0.0, 1.0, 'zellij_star', 'gold', 'tinmirror', 0.06)], fabric='metal.tin.patchwork')
    for sd_p in (L, R):
        parts_t.append(pauldron(f'{gid_t}_star_pauldron_{sd_p[0]}', sd_p, pauld_p, reach=0.36, ease=0.025, rows=6, n=14))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017,
                           P('atlasindigo', 0.03, [B('bottom', 0.0, 0.048, 'solid', 'gold')], fabric='cloth.silk'),
                           ease_end=0.038, rows=10))
    for sx_h, tg_h in ((-0.056, 'R'), (0.056, 'L')):
        parts_t.extend(_tizerzai_fibula(
            f'{gid_t}_tizerzai_{tg_h}', chest_front(CHEST + 0.050, 0.024, x=sx_h),
            FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.92, gilt_p, silver_p
        ))
    parts_t.extend(_koummya_hip(gid_t, WAIST, 0.025, gilt_p, tin_p, side_sgn=-1.0))
    parts_t.extend(pendants(gid_t + '_khipu_', WAIST - 0.028,
                            [math.pi * (0.62 + 0.09 * k) for k in range(5)],
                            (0.018, 0.012, 0.045), gilt_p, ease=0.020))
    entries.append(assemble_garment(
        gid_t, 'Royal Tocapu Uncu, White-Gold Burnous & Star Pauldrons', 'torso', 'tabisti', parts_t
    ))

    # 13.3 Gloves: Gilded & tin-mirror sovereign bracers
    gid_g = f'tab_{sex}_headman_bracers'
    entries.append(assemble_garment(
        gid_g, 'Gilded Sovereign Star & Tin-Mirror Bracers', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g, pauld_p, P('abysslac', 0.03, fabric='leather.polished'), f0=0.60)
    ))

    # 13.4 Legs: Royal crimson & indigo silk serouel
    gid_l = f'tab_{sex}_headman_serouel'
    entries.append(assemble_garment(
        gid_l, 'Royal Lac-Crimson & Gold Chakana Serouel', 'legs', 'tabisti',
        trousers(gid_l, P('atlasindigo', 0.03, [B('bottom', 0.0, 0.065, 'chakana_red', 'gold', 'abysslac', 0.05)], fabric='cloth.silk'),
                 ease=0.020, ease_end=0.024, bag=0.034, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 13.5 Feet: Gilded crimson Kasbah sovereign boots
    gid_f = f'tab_{sex}_headman_boots'
    entries.append(assemble_garment(
        gid_f, 'Gilded Lac-Crimson Kasbah Sovereign Boots', 'feet', 'tabisti',
        boots(gid_f, gilt_p,
              P('abysslac', 0.03, [B('top', 0.0, 0.045, 'solid', 'gold'),
                                   B('bottom', 0.0, 0.028, 'solid', 'gold')], fabric='leather.polished'),
              top=0.52, wraps=2, wrap_paint=gilt_p, ease_top=0.030)
    ))

    # 13.6 Back: Dorsal Sovereign Star & Yaz (ⵣ) Kasbah-Pukara Crest-Standard
    gid_b = f'tab_{sex}_headman_standard'
    back_b = surface_out(spine_at(CHEST - 0.01), d_bk, 0.024, bvh=core.BVH_T)
    std_p = P('abysslac', 0.03, [
        B('top', 0.0, 0.035, 'solid', 'gold'),
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
    ], [PN(0.10, 0.90, 'zellij_star', 'gold', 'atlasindigo', 0.12)], fabric='cloth.silk')
    sc_h = back_b + np.array([0.0, 0.040, 0.060])
    parts_b = [
        _dorsal_banner_panel(gid_b + '_tapestry', back_b, 0.24, -0.14, 0.26, 0.036, std_p),
        tube(gid_b + '_gilt_bar',
             [back_b + np.array([-0.145, 0.038, 0.265]), back_b + np.array([0.145, 0.038, 0.265])],
             0.013, gilt_p, n=10, rigid_joint='Spine2'),
    ]
    parts_b.extend(_eight_star_boss(gid_b + '_star', sc_h, d_bk, np.array([1.0, 0.0, 0.0]),
                                    np.array([0.0, 0.0, 1.0]), 0.085, gilt_p, tin_p, rigid_joint='Spine2'))
    parts_b.extend(_yaz_emblem(gid_b, sc_h + d_bk * 0.008, d_bk, np.array([1.0, 0.0, 0.0]),
                               np.array([0.0, 0.0, 1.0]), 0.050, silver_p, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, gilt_p, ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Kasbah-Pukara Sovereign Star & Yaz Tapestry Standard', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 14: `pc_azure_emir` — Indigo Tagelmust & Tocapu-Mirror Envoy (PC Hero, 100% Procedural) (`6 x 2 = 12`)
# ===========================================================================================================
def _build_pc_azure_emir(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    tin_p = P('tinmirror', 0.02, fabric='metal.tin.patchwork')
    silver_p = P('silver', 0.02, fabric='metal.iron')
    cerul_p = P('altarcerulean', 0.02, fabric='glass.moonglass.leaded')
    gilt_p = P('gold', 0.02, fabric='metal.gold')

    # 14.1 Head: Deep Chefchaouen-indigo tagelmust w/ saffron selvedge & silver tizerzai star
    gid_h = f'tab_{sex}_pc_emir_tagelmust'
    az_base = P('atlasindigo', 0.03, [
        B('top', 0.0, 0.020, 'stripes', 'saffron', 'cobalt', 0.022),
        B('bottom', 0.0, 0.018, 'solid', 'cobalt'),
    ], fabric=WOOL)
    az_wrap = P('cobalt', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'saffron'),
        B('bottom', 0.0, 0.008, 'solid', 'tinmirror'),
    ], fabric='cloth.silk')
    t_emir = turban(gid_h + '_tagelmust', az_base, wrap_paint=az_wrap, size=0.72, ribbons=4)
    for tp in t_emir:
        tp.rigid_joint = 'Head'
    parts_h = list(t_emir)
    brow_e = _snap_on_part(t_emir[0], a + (b - a) * (f_brow + 0.14) - bk * 0.12, -bk, offset=0.003)
    parts_h.extend(_tizerzai_fibula(gid_h + '_tizerzai', brow_e, -bk, left, up, 0.88, silver_p, cerul_p, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Chefchaouen-Indigo Envoy Tagelmust & Silver Tizerzai', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 14.2 Torso: Sleeveless Chefchaouen-indigo selham pinned w/ twin silver tizerzai over tocapu-zellige uncu & tin-mirror star pectoral
    gid_t = f'tab_{sex}_pc_emir_selham'
    uncu_e = P('atlasindigo', 0.03, [
        B('top', 0.0, 0.020, 'solid', 'gold'),
        B('bottom', 0.0, 0.036, 'chakana_red', 'gold', 'abysslac', 0.055),
    ], [
        PN(0.35, 0.65, 'zellij_star', 'gold', 'abysslac', 0.12),
        PN(0.32, 0.35, 'solid', 'liikofiteal', 'atlasindigo', 1.0),
        PN(0.65, 0.68, 'solid', 'liikofiteal', 'atlasindigo', 1.0),
    ], fabric=WOOL)
    selham_e = P('cobalt', 0.03, [
        B('bottom', 0.0, 0.032, 'awayo_stripe', 'saffron', 'abysslac', 0.05),
        B('top', 0.0, 0.018, 'solid', 'silver'),
    ], fabric=WOOL)
    chumpi_e = P('abysslac', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'silver'),
    ], [PN(0.0, 1.0, 'awayo_stripe', 'saffron', 'liikofiteal', 0.055)], fabric=WOOL)
    parts_t = [
        torso_tube(gid_t + '_tocapu_uncu', TOP, KNEE - 0.02, 0.016, uncu_e,
                   n=48, rows=20, hang_from=WAIST - 0.02, flare=0.12,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        stand_collar(gid_t, P('cobalt', 0.03, [B('top', 0.0, 0.008, 'solid', 'silver')], fabric=WOOL), high=0.030),
        collar_disc(gid_t + '_selham_yoke', 0.084, selham_e, drop=0.072, rows=8, n=46, scallop=0.04, ease=0.019),
        cape(gid_t + '_selham_cape', KNEE - 0.04, selham_e, span=0.40, ease=0.032, flare=0.16, rows=16, n=28),
        torso_tube(gid_t + '_chumpi', WAIST + 0.034, WAIST - 0.032, 0.022, chumpi_e,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017,
                           P('atlasindigo', 0.03, [
                               B('bottom', 0.0, 0.024, 'solid', 'silver'),
                               B('bottom', 0.024, 0.060, 'chakana_red', 'gold', 'abysslac', 0.045),
                           ], fabric=WOOL),
                           ease_end=0.028, rows=9))
    # Twin silver Amazigh tizerzai triangle-fibulae + hammered tin-mirror 8-pointed star pectoral
    for sx_e, tg_e in ((-0.060, 'R'), (0.060, 'L')):
        parts_t.extend(_tizerzai_fibula(
            f'{gid_t}_tizerzai_{tg_e}', chest_front(CHEST + 0.054, 0.023, x=sx_e),
            FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.90, silver_p, cerul_p
        ))
    parts_t.extend(_eight_star_boss(
        gid_t + '_star_pectoral', chest_front(CHEST + 0.008, 0.022, x=0.0),
        FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.048, tin_p, cerul_p
    ))
    parts_t.extend(_koummya_hip(gid_t, WAIST, 0.024, silver_p, gilt_p, side_sgn=-1.0))
    parts_t.append(_chuspa_pouch(gid_t, WAIST, 0.72 * math.pi, 0.023, chumpi_e))
    entries.append(assemble_garment(
        gid_t, 'Chefchaouen Selham, Tocapu-Zellige Uncu & Tin-Star Pectoral', 'torso', 'tabisti', parts_t
    ))

    # 14.3 Gloves: Studded indigo envoy bracer-gloves
    gid_g = f'tab_{sex}_pc_emir_gloves'
    entries.append(assemble_garment(
        gid_g, 'Silver-Studded Indigo Envoy Bracer-Gloves', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g,
                          P('atlasindigo', 0.03, [B('top', 0.0, 0.018, 'beads', 'silver', 'cobalt', 0.03)], fabric='leather.polished'),
                          P('cobalt', 0.04, fabric='leather.buckskin'), f0=0.60)
    ))

    # 14.4 Legs: Chakana-hem indigo serouel
    gid_l = f'tab_{sex}_pc_emir_serouel'
    entries.append(assemble_garment(
        gid_l, 'Chefchaouen-Indigo & Chakana-Hem Envoy Serouel', 'legs', 'tabisti',
        trousers(gid_l, P('atlasindigo', 0.03, [B('bottom', 0.0, 0.065, 'chakana_red', 'gold', 'abysslac', 0.05)], fabric=WOOL),
                 ease=0.020, ease_end=0.024, bag=0.034, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 14.5 Feet: Saffron-crimson mountain-kasbah boots
    gid_f = f'tab_{sex}_pc_emir_boots'
    entries.append(assemble_garment(
        gid_f, 'Saffron & Lac-Crimson Mountain-Kasbah Envoy Boots', 'feet', 'tabisti',
        boots(gid_f, P('peatumber', 0.04, [B('top', 0.0, 0.010, 'solid', 'silver')], fabric='leather.polished'),
              P('abysslac', 0.03, [B('top', 0.0, 0.042, 'solid', 'saffron'),
                                   B('bottom', 0.0, 0.028, 'solid', 'saffron')], fabric='leather.polished'),
              top=0.54, wraps=2, wrap_paint=P('cobalt', 0.03, fabric=WOOL), ease_top=0.030)
    ))

    # 14.6 Back: Awayo scroll-pack & tin-mirror envoy targe
    gid_b = f'tab_{sex}_pc_emir_pack'
    back_b = surface_out(spine_at(CHEST - 0.01), d_bk, 0.024, bvh=core.BVH_T)
    roll_p = P('cobalt', 0.03, [
        B('top', 0.0, 0.040, 'awayo_stripe', 'saffron', 'abysslac', 0.05),
        B('bottom', 0.0, 0.040, 'awayo_stripe', 'saffron', 'liikofiteal', 0.05),
    ], [PN(0.15, 0.85, 'awayo_stripe', 'saffron', 'abysslac', 0.08)], fabric=WOOL)
    tc_e = back_b + np.array([0.0, 0.052, -0.020])
    parts_b = [
        tube(gid_b + '_awayo_bedroll',
             [back_b + np.array([-0.145, 0.038, 0.135]), back_b + np.array([0.145, 0.038, 0.135])],
             0.042, roll_p, n=14, rigid_joint='Spine2'),
        rosette(gid_b + '_envoy_targe', tc_e, d_bk, np.array([1.0, 0.0, 0.0]), 0.145,
                P('atlasindigo', 0.03, [B('top', 0.0, 0.025, 'solid', 'silver')], fabric='metal.iron'),
                n=18, thick=0.015, rigid_joint='Spine2'),
    ]
    parts_b.extend(_eight_star_boss(gid_b + '_targe_star', tc_e + d_bk * 0.014, d_bk, np.array([1.0, 0.0, 0.0]),
                                    np.array([0.0, 0.0, 1.0]), 0.072, tin_p, cerul_p, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.03, fabric='leather.polished'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Envoy Awayo Scroll-Roll & Tin-Mirror Star Targe', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 15: `pc_scarp_warden` — Atlas-Burnous & Uncu Cliff-Champion (PC Hero, 100% Procedural) (`6 x 2 = 12`)
# ===========================================================================================================
def _build_pc_scarp_warden(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    tin_p = P('tinmirror', 0.02, [B('top', 0.0, 0.03, 'tin_patchwork', 'tinmirror', 'steel', 0.05)], fabric='metal.tin.patchwork')
    gilt_p = P('gold', 0.02, fabric='metal.gold')

    # 15.1 Head: Crested gilded-horn cabasset over crimson chullo ear-flaps & braided warak'a brow-sling
    gid_h = f'tab_{sex}_pc_warden_helm'
    helm_w = P('tinmirror', 0.02, [
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
        B('top', 0.0, 0.026, 'solid', 'abysslac'),
    ], [PN(0.0, 1.0, 'fluted', 'gold', 'steel', 0.05)], fabric='metal.iron')
    sling_w = P('saffron', 0.04, [
        B('top', 0.0, 0.008, 'solid', 'abysslac'),
        B('bottom', 0.0, 0.008, 'solid', 'atlasindigo'),
    ], [PN(0.0, 1.0, 'chevrons', 'abysslac', 'saffron', 0.032)], fabric=WOOL)
    w_dome = sculpted_cranium(gid_h + '_cabasset', helm_w, f_top=1.10, f_bot=0.58, ease=0.017, rows=10, n=38)
    w_brim = brim(gid_h + '_brim', 0.62, 0.048, gilt_p, ease=0.018, rows=4, n=38, droop=0.0, lift=0.022)
    w_brim.rigid_joint = 'Head'
    parts_h = [
        w_dome,
        w_brim,
        crown_band(gid_h + '_waraka_band', sling_w, f0=0.58, f1=0.74, ease=0.022, flare=0.006, rows=5, n=38),
        crest(gid_h + '_gilt_crest', 0.062, P('abysslac', 0.03, [B('top', 0.0, 0.018, 'solid', 'gold')], fabric='metal.gold'),
              rows=5, cols=15, sweep=0.025, a0=-0.78, a1=0.86, host_part=w_dome),
    ]
    parts_h.extend(_chullo_earflaps(gid_h, P('abysslac', 0.04, [B('bottom', 0.0, 0.02, 'awayo_stripe', 'saffron', 'liikofiteal', 0.04)], fabric=WOOL),
                                    gilt_p))
    parts_h.extend(_swoop_horn_pair(gid_h, w_dome, up, bk, left, 0.70, 0.092, 0.125, gilt_p, tin_p))
    entries.append(assemble_garment(
        gid_h, "Gilded-Horn Cabasset over Chullo & Warak'a Sling", 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 15.2 Torso: Red-lacquer & tin-mirror chakana lamellar uncu over saffron/indigo quilted gambeson + brass star pauldrons + chakana tassets
    gid_t = f'tab_{sex}_pc_warden_cuirass'
    gamb_p = P('atlasindigo', 0.04, [
        B('bottom', 0.0, 0.048, 'awayo_stripe', 'saffron', 'abysslac', 0.05),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'saffron', 'atlasindigo', 0.09)], fabric='cloth.quilted.channel')
    lam_p = P('abysslac', 0.03, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.034, 'chakana_red', 'gold', 'tinmirror', 0.055),
    ], [
        PN(0.28, 0.72, 'chakana_red', 'tinmirror', 'abysslac', 0.11),
        PN(0.0, 0.28, 'lamellar_scale', 'tinmirror', 'abysslac', 0.08),
        PN(0.72, 1.0, 'lamellar_scale', 'tinmirror', 'abysslac', 0.08),
    ], fabric='metal.tin.patchwork')
    burn_w = P('saffron', 0.04, [
        B('bottom', 0.0, 0.032, 'awayo_stripe', 'abysslac', 'atlasindigo', 0.05),
        B('top', 0.0, 0.018, 'solid', 'gold'),
    ], fabric=WOOL)
    sash_w = P('abysslac', 0.04, [B('top', 0.0, 0.012, 'solid', 'gold')],
               [PN(0.0, 1.0, 'awayo_stripe', 'saffron', 'liikofiteal', 0.05)], fabric=WOOL)
    parts_t = [
        torso_tube(gid_t + '_gambeson', TOP, KNEE + 0.06, 0.016, gamb_p,
                   n=46, rows=19, hang_from=WAIST - 0.02, flare=0.08,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        torso_tube(gid_t + '_chakana_cuirass', SHOULDER + 0.02, WAIST - 0.03, 0.025, lam_p,
                   n=46, rows=12, hull_from=CHEST + 0.02),
        stand_collar(gid_t, gilt_p, high=0.032),
        cape(gid_t + '_burnous_mantle', WAIST - 0.14, burn_w, span=0.40, ease=0.033, flare=0.14, rows=15, n=28),
        torso_tube(gid_t + '_sash', WAIST + 0.032, WAIST - 0.034, 0.028, sash_w,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    for sd_t, ang_t in (('L', 0.60 * math.pi), ('R', 1.40 * math.pi)):
        parts_t.extend(tabard(f'{gid_t}_tasset_{sd_t}', KNEE + 0.06, WAIST - 0.01, lam_p,
                              width=0.20, ease=0.029, center_ang=ang_t))
    pauld_w = P('gold', 0.02, [B('bottom', 0.0, 0.024, 'solid', 'abysslac')],
                [PN(0.0, 1.0, 'zellij_star', 'tinmirror', 'gold', 0.06)], fabric='metal.gold')
    for sd_p in (L, R):
        parts_t.append(pauldron(f'{gid_t}_star_pauldron_{sd_p[0]}', sd_p, pauld_w, reach=0.36, ease=0.025, rows=6, n=14))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, gamb_p, ease_end=0.025, rows=9))
    parts_t.extend(_eight_star_boss(
        gid_t + '_chest_boss', chest_front(CHEST + 0.032, 0.030, x=0.0),
        FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.050, tin_p, gilt_p
    ))
    parts_t.extend(_koummya_hip(gid_t, WAIST, 0.029, gilt_p, tin_p, side_sgn=-1.0))
    parts_t.append(_chuspa_pouch(gid_t, WAIST, 0.70 * math.pi, 0.029, sash_w))
    entries.append(assemble_garment(
        gid_t, 'Lac-Red & Tin-Mirror Chakana Lamellar Cuirass', 'torso', 'tabisti', parts_t
    ))

    # 15.3 Gloves: Tin-splint rubberized cliff-champion gauntlets
    gid_g = f'tab_{sex}_pc_warden_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Tin-Splint & Vulcanized Rubber Champion Gauntlets', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g, lam_p, P('soot', 0.04, fabric='rubber.tyre'), f0=0.56)
    ))

    # 15.4 Legs: Quilted combat breeches w/ chakana thigh-plates
    gid_l = f'tab_{sex}_pc_warden_greaves'
    gr_p = P('atlasindigo', 0.04, [
        B('bottom', 0.0, 0.065, 'lamellar_scale', 'tinmirror', 'abysslac', 0.045),
        B('top', 0.0, 0.040, 'chakana_red', 'gold', 'abysslac', 0.05),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'saffron', 'atlasindigo', 0.09)], fabric='cloth.quilted.channel')
    entries.append(assemble_garment(
        gid_l, 'Quilted Saffron-Indigo & Chakana Lamellar Greave-Breeches', 'legs', 'tabisti',
        trousers(gid_l, gr_p, ease=0.019, ease_end=0.023, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 15.5 Feet: Vulcanized rubber-lug mountain champion boots
    gid_f = f'tab_{sex}_pc_warden_boots'
    entries.append(assemble_garment(
        gid_f, 'Rubber-Lugged & Lacquer-Greaved Cliff-Champion Boots', 'feet', 'tabisti',
        boots(gid_f, P('soot', 0.05, fabric='rubber.tyre'),
              P('abysslac', 0.03, [B('top', 0.0, 0.045, 'lamellar_scale', 'tinmirror', 'gold', 0.04)], fabric='leather.polished'),
              top=0.58, wraps=3, wrap_paint=P('saffron', 0.04, fabric=WOOL), ease_top=0.032)
    ))

    # 15.6 Back: Yaz (ⵣ) star-buckler & twin cliff-javelins
    gid_b = f'tab_{sex}_pc_warden_buckler'
    back_b = surface_out(spine_at(CHEST - 0.01), d_bk, 0.025, bvh=core.BVH_T)
    bc_w = back_b + np.array([0.0, 0.040, 0.015])
    parts_b = [
        rosette(gid_b + '_champion_buckler', bc_w, d_bk, np.array([1.0, 0.0, 0.0]), 0.195,
                P('abysslac', 0.03, [B('top', 0.0, 0.032, 'solid', 'gold'),
                                     B('bottom', 0.0, 0.032, 'chakana_red', 'tinmirror', 'atlasindigo', 0.045)],
                  fabric='metal.tin.patchwork'),
                n=22, thick=0.018, rigid_joint='Spine2'),
    ]
    for sd_j, tg_j in ((-1.0, 'R'), (1.0, 'L')):
        parts_b.append(horn(f'{gid_b}_cliff_jav_{tg_j}',
                            [bc_w + np.array([sd_j * 0.11, -0.008, -0.22]),
                             bc_w + np.array([sd_j * 0.14, -0.008, 0.28])],
                            0.009, 0.005, P('gold', 0.02, [B('bottom', 0.0, 0.12, 'solid', 'abysslac')], fabric='metal.bronze'),
                            n=8, rows=7, rigid_joint='Spine2'))
    parts_b.extend(_eight_star_boss(gid_b + '_star', bc_w + d_bk * 0.016, d_bk, np.array([1.0, 0.0, 0.0]),
                                    np.array([0.0, 0.0, 1.0]), 0.098, tin_p, gilt_p, rigid_joint='Spine2'))
    parts_b.extend(_yaz_emblem(gid_b, bc_w + d_bk * 0.024, d_bk, np.array([1.0, 0.0, 0.0]),
                               np.array([0.0, 0.0, 1.0]), 0.056, gilt_p, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.03, fabric='leather.polished'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Cliff-Champion Yaz & Tin-Mirror Star Buckler', 'back', 'tabisti', parts_b
    ))
    return entries


def build_tabisti_abyss_altar_for_sex(sex, body_id):
    """Build Tiers 9–15 (`84` pieces across M+F) for `sex` (`'m'` or `'f'`)."""
    out = []
    out.extend(_build_lizard_lancer(sex, body_id))
    out.extend(_build_altar_priest(sex, body_id))
    out.extend(_build_salt_oracle(sex, body_id))
    out.extend(_build_verge_mayor(sex, body_id))
    out.extend(_build_headman(sex, body_id))
    out.extend(_build_pc_azure_emir(sex, body_id))
    out.extend(_build_pc_scarp_warden(sex, body_id))
    return out
