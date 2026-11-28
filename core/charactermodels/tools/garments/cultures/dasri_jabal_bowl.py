"""Dasri Wardrobe Part 1 (`dasri_jabal_bowl`): Oasis Commoners, Guilds & Factors, and Free Qaba'il (Tiers 1–8).

Builds 100% procedural male (`mpfb_male`, `dsr_m_*`) and female (`mpfb_female`, `dsr_f_*`) pieces for:
1. `peasant`            — Jabal Wadi & Agave Terrace Cultivator
2. `town`               — Jabal Tower-Quarter Citizen
3. `mezcal_distiller`   — Jabal & Arfwai Copper-Alembic Mezcalier
4. `train_drover`       — Train of Jabal Salt & Borax Factor
5. `mantis_incense`     — Mantis Dragon's-Blood & Frankincense Harvester
6. `clan_herder`        — Free Qabila Dromedary & Goat Pastoralist
7. `walker`             — Chakipunku & Caliche Salt-Flat Trail-Runner
8. `badland_prospector` — Rifar al-Dhahab High-Wadi Gold & Kimberlite Panner
"""
import math
import numpy as np

from .. import core
from ..core import (
    J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment
)
from ..paint import P, B, PN, COTTON, WOOL
from ..types.torso import (
    torso_tube, stand_collar, collar_disc, cape, tabard, crossed_sash
)
from ..types.limbs import sleeves, trousers
from ..types.headgear import (
    head_rings, hood, tower_hat, conical_hat, crown_band, horn
)
from ..types.accoutrements import (
    blob, pack_straps, tube, rosette
)
from .dasri_common import (
    ndee_boots, jambiya_daggers, hirz_amulet_box,
    apache_war_headband, keffiyeh_iqal_head,
    apache_warshirt_yoke, breechclout_sirwal, dasri_bracers
)


# ===========================================================================================================
# 1. PEASANT: Jabal Wadi & Agave Terrace Cultivator (`peasant`)
# ===========================================================================================================
def _build_peasant(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    entries = []

    # HEAD: Crimson 'isaba / Apache headband (covers_hair=False, covers_face=False)
    gid_h = f'dsr_{sex}_peasant_headband'
    band_p = P('dragoncrimson', 0.05, [
        B('top', 0.0, 0.008, 'solid', 'jusschalk'),
        B('bottom', 0.0, 0.008, 'solid', 'jusschalk'),
    ], [
        PN(0.0, 1.0, 'sadu_band', 'jusschalk', 'dragoncrimson', 0.08),
    ], fabric=COTTON)
    concho_p = P('silver', 0.02, [B('top', 0.0, 0.006, 'solid', 'oasisturq')], fabric='metal.iron') if sex == 'f' else None
    parts_h = apache_war_headband(gid_h, band_p, concho_paint=concho_p, n_conchos=4 if sex == 'f' else 0, knot_tails=True)
    entries.append(assemble_garment(gid_h, 'Jabal Wadi Crimson Isaba Headband', 'head', 'dasri', parts_h,
                                    covers_hair=False, covers_face=False))

    # TORSO: Chalk linen tunic (M) / flared terrace surcoat (F) + agave-fibre sash, coate/jambiya knife & gourd canteen
    gid_t = f'dsr_{sex}_peasant_tunic'
    parts_t = []
    if sex == 'm':
        tunic_p = P('jusschalk', 0.06, [
            B('top', 0.0, 0.020, 'solid', 'dragoncrimson'),
            B('bottom', 0.0, 0.022, 'solid', 'smokebuck'),
            B('bottom', 0.022, 0.075, 'sadu_band', 'dragoncrimson', 'jusschalk', 0.06),
        ], [
            PN(0.45, 0.55, 'juss_qamariya', 'dragoncrimson', 'jusschalk', 0.10, down=0.32),
        ], fabric=COTTON)
        parts_t.append(torso_tube(gid_t + '_tunic', TOP, KNEE + 0.06, 0.015, tunic_p,
                                  n=44, rows=20, hang_from=WAIST - 0.02, flare=0.09,
                                  group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    else:
        sur_p = P('jusschalk', 0.05, [
            B('top', 0.0, 0.024, 'juss_qamariya', 'dragoncrimson', 'jusschalk', 0.05),
            B('bottom', 0.0, 0.025, 'solid', 'dragoncrimson'),
            B('bottom', 0.025, 0.095, 'sadu_apache_chevron', 'dragoncrimson', 'jusschalk', 0.07),
        ], [
            PN(0.42, 0.58, 'juss_qamariya', 'dragoncrimson', 'jusschalk', 0.12, down=0.38),
        ], fabric=COTTON)
        parts_t.append(torso_tube(gid_t + '_surcoat', TOP, ANKLE + 0.12, 0.015, sur_p,
                                  n=46, rows=22, hang_from=WAIST - 0.01, flare=0.14,
                                  group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('dragoncrimson', 0.04, [B('top', 0.0, 0.010, 'solid', 'jusschalk')], fabric=COTTON),
                                high=0.028))

    sash_p = P('maguey', 0.08, [
        B('top', 0.0, 0.010, 'solid', 'dragoncrimson'),
        B('bottom', 0.0, 0.010, 'solid', 'smokebuck'),
    ], [PN(0.0, 1.0, 'chevrons', 'smokebuck', 'maguey', 0.05)], fabric='cloth.weave.burlap')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.032, WAIST - 0.038, 0.020, sash_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.004, 0.021,
                                   hilt_paint=P('bark', 0.05, [B('top', 0.0, 0.012, 'solid', 'nahhascopper')]),
                                   scabbard_paint=P('smokebuck', 0.05, [B('bottom', 0.0, 0.022, 'solid', 'nahhascopper')])))
    # Gourd water canteen at right hip
    c_hip = spine_at(WAIST - 0.035)
    d_rh = np.array([-0.82, -0.57, 0.0])
    d_rh /= np.linalg.norm(d_rh)
    gourd_c = surface_out(c_hip, d_rh, 0.024, bvh=core.BVH_T)
    parts_t.append(blob(gid_t + '_gourd_lo', gourd_c - np.array([0.0, 0.0, 0.022]), (0.072, 0.052, 0.078),
                        P('rabbitgold', 0.05, [B('top', 0.0, 0.015, 'solid', 'dragoncrimson')]),
                        n=12, rows=5, out=d_rh, role='accessory'))
    parts_t.append(blob(gid_t + '_gourd_hi', gourd_c + np.array([0.0, 0.0, 0.026]), (0.046, 0.038, 0.048),
                        P('ochre', 0.05, [B('top', 0.0, 0.012, 'solid', 'bark')]),
                        n=10, rows=4, out=d_rh, role='accessory'))

    sl_p = P('jusschalk', 0.06, [
        B('bottom', 0.0, 0.028, 'juss_qamariya', 'dragoncrimson', 'jusschalk', 0.045),
    ], fabric=COTTON)
    parts_t.extend(sleeves(gid_t, 'elbow', 0.015, sl_p, ease_end=0.022, rows=7))
    entries.append(assemble_garment(gid_t, 'Jabal Agave Terrace Tunic & Coate Sash', 'torso', 'dasri', parts_t))

    # GLOVES: Rawhide agave-thorn wraps
    gid_g = f'dsr_{sex}_peasant_wraps'
    wrap_g_p = P('smokebuck', 0.07, [
        B('top', 0.0, 0.014, 'solid', 'maguey'),
        B('bottom', 0.0, 0.014, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'stripes', 'maguey', 'smokebuck', 0.035)], fabric='leather.buckskin')
    e_g = assemble_garment(gid_g, 'Jabal Rawhide Agave-Thorn Forearm Wraps', 'gloves', 'dasri',
                           dasri_bracers(gid_g, wrap_g_p, palm_paint=None, f0=0.54))
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # LEGS: Airy chalk & buckskin-cuffed desert sirwal (`legged=True` on both M & F)
    gid_l = f'dsr_{sex}_peasant_sirwal'
    sirwal_p = P('jusschalk', 0.06, [
        B('bottom', 0.0, 0.035, 'solid', 'smokebuck'),
        B('bottom', 0.035, 0.065, 'sadu_band', 'dragoncrimson', 'jusschalk', 0.04),
    ], fabric=COTTON)
    entries.append(assemble_garment(gid_l, 'Jabal Wadi Linen Sirwal', 'legs', 'dasri',
                                    trousers(gid_l, sirwal_p, ease=0.013, ease_end=0.009, bag=0.006), legged=True))

    # FEET: Low folded-cuff buckskin Apache ndee boots
    gid_f = f'dsr_{sex}_peasant_boots'
    boot_p = P('smokebuck', 0.06, [B('bottom', 0.0, 0.018, 'solid', 'umber')], fabric='leather.buckskin')
    cuff_p = P('smokebuck', 0.06, [B('bottom', 0.0, 0.020, 'sadu_band', 'dragoncrimson', 'jusschalk', 0.04)], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'Low Folded-Cuff Buckskin Ndee Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.46, ease_top=0.015, upturned=True)))

    # BACK: Woven palm-rib agave-pina harvest basket heaped with roasted agave pinas
    gid_b = f'dsr_{sex}_peasant_basket'
    parts_b = []
    c_bk = spine_at(CHEST - 0.02)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.110
    bsk_c = c_bk + np.array([0.0, d_bk + 0.072, 0.0])
    bsk_p = P('maguey', 0.09, [
        B('top', 0.0, 0.025, 'sadu_band', 'dragoncrimson', 'goatblack', 0.05),
        B('bottom', 0.0, 0.022, 'solid', 'bark'),
    ], [PN(0.0, 1.0, 'checks', 'sand', 'maguey', 0.06)], fabric='straw.reed.plaited')
    parts_b.append(blob(gid_b + '_basket', bsk_c, (0.25, 0.15, 0.29), bsk_p,
                        n=18, rows=8, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    pina_p = P('verdigris', 0.07, [
        B('bottom', 0.0, 0.025, 'solid', 'smokebuck'),
        B('top', 0.0, 0.018, 'teeth', 'rabbitgold', 'verdigris', 0.03),
    ], [PN(0.0, 1.0, 'quilt', 'umber', 'verdigris', 0.045)])
    for idx, dx_p in enumerate((-0.058, 0.0, 0.058)):
        parts_b.append(blob(f'{gid_b}_pina_{idx}', bsk_c + np.array([dx_p, 0.005, 0.145 + (0.015 if idx == 1 else 0.0)]),
                            (0.085, 0.082, 0.098), pina_p, n=12, rows=5,
                            out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('smokebuck', 0.06, fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Palm-Rib Agave-Pina Harvest Basket', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 2. TOWN: Jabal Tower-Quarter Citizen (`town`)
# ===========================================================================================================
def _build_town(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Embroidered qubba' pillbox + keffiyeh coil (M) / silver-pinned shayla hood (F)
    gid_h = f'dsr_{sex}_town_head'
    parts_h = []
    if sex == 'm':
        qubba_p = P('dragoncrimson', 0.04, [
            B('top', 0.0, 0.014, 'solid', 'rabbitgold'),
            B('bottom', 0.0, 0.012, 'solid', 'jusschalk'),
        ], [PN(0.0, 1.0, 'juss_qamariya', 'rabbitgold', 'dragoncrimson', 0.09)], fabric='cloth.silk')
        parts_h.append(tower_hat(gid_h + '_qubba', 0.115, lambda s: 1.0 + 0.04 * math.sin(s * math.pi),
                                 qubba_p, f=0.56, ease=0.016, rows=8, n=36))
        coil_p = P('jusschalk', 0.05, [
            B('top', 0.0, 0.008, 'stripes', 'goatblack', 'jusschalk', 0.03),
            B('bottom', 0.0, 0.008, 'solid', 'ebadindigo'),
        ], fabric=COTTON)
        parts_h.append(crown_band(gid_h + '_keffiyeh_coil', coil_p, f0=0.49, f1=0.68, ease=0.023, flare=0.007, rows=6, n=36))
    else:
        shayla_p = P('ebadindigo', 0.04, [
            B('bottom', 0.0, 0.032, 'juss_qamariya', 'rabbitgold', 'dragoncrimson', 0.06),
        ], [
            PN(0.32, 0.68, 'hirz_filigree', 'silver', 'ebadindigo', 0.08, down=0.18),
        ], fabric='cloth.silk')
        parts_h.append(hood(gid_h + '_shayla', shayla_p, ease=0.015, ease_low=0.019,
                            open_front=0.90, low=-0.25, rows=12, n=36, peak=0.018))
        c_pin = a + (b - a) * 0.56
        d_pin = left * 0.85 - bk * 0.52
        d_pin /= np.linalg.norm(d_pin)
        h_pin = first_hit(c_pin, d_pin) or 0.092
        parts_h.append(rosette(gid_h + '_silver_pin', c_pin + d_pin * (h_pin + 0.017), d_pin, up,
                               0.018, P('silver', 0.02, [B('top', 0.0, 0.006, 'solid', 'oasisturq')], fabric='metal.iron'),
                               n=10, thick=0.006, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Jabal Tower-Quarter Qubba & Shayla', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Ebadlands-indigo/chalk Jabal robe + crimson juss-qamariya waistcoat + silver jambiya & brass qishr flask
    gid_t = f'dsr_{sex}_town_robe'
    parts_t = []
    robe_bot = ANKLE + 0.08 if sex == 'f' else KNEE - 0.06
    robe_p = P('ebadindigo', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'jusschalk'),
        B('bottom', 0.025, 0.090, 'juss_qamariya', 'rabbitgold', 'ebadindigo', 0.07),
    ], [
        PN(0.44, 0.56, 'stripes', 'jusschalk', 'ebadindigo', 0.035),
    ], fabric=COTTON)
    parts_t.append(torso_tube(gid_t + '_robe', TOP, robe_bot, 0.015, robe_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.14 if sex == 'f' else 0.11,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    # Tailored crimson juss-qamariya waistcoat (sadriyya) open at center front
    vest_p = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.016, 'solid', 'jusschalk'),
        B('bottom', 0.0, 0.018, 'hirz_filigree', 'silver', 'dragoncrimson', 0.045),
    ], [
        PN(0.0, 1.0, 'juss_qamariya', 'rabbitgold', 'dragoncrimson', 0.12),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_sadriyya', TOP - 0.01, WAIST - 0.03, 0.020, vest_p,
                              n=36, rows=10, arc=(-0.74 * math.pi, 0.74 * math.pi), role='drape'))
    parts_t.append(stand_collar(gid_t, P('jusschalk', 0.03, [B('top', 0.0, 0.009, 'solid', 'dragoncrimson')], fabric='cloth.silk'),
                                high=0.032))

    sash_p = P('jusschalk', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.010, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'dragoncrimson', 'ebadindigo', 0.06)], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.036, WAIST - 0.038, 0.023, sash_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.024,
                                   hilt_paint=P('silver', 0.02, [B('top', 0.0, 0.012, 'solid', 'oasisturq')], fabric='metal.iron'),
                                   scabbard_paint=P('silver', 0.02, [B('bottom', 0.0, 0.025, 'hirz_filigree', 'silver', 'goatblack', 0.03)], fabric='metal.iron')))
    # Brass qishr coffee-husk flask at left hip
    c_hip = spine_at(WAIST - 0.03)
    d_lh = np.array([0.84, -0.54, 0.0])
    d_lh /= np.linalg.norm(d_lh)
    qishr_c = surface_out(c_hip, d_lh, 0.025, bvh=core.BVH_T)
    parts_t.append(blob(gid_t + '_qishr_flask', qishr_c, (0.064, 0.044, 0.088),
                        P('nahhascopper', 0.02, [B('top', 0.0, 0.018, 'solid', 'silver')], fabric='metal.bronze'),
                        n=12, rows=5, out=d_lh, role='accessory'))

    sl_p = P('ebadindigo', 0.04, [
        B('bottom', 0.0, 0.022, 'solid', 'jusschalk'),
        B('bottom', 0.022, 0.070, 'juss_qamariya', 'rabbitgold', 'dragoncrimson', 0.045),
    ], fabric=COTTON)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.015, sl_p, ease_end=0.024, rows=10))
    entries.append(assemble_garment(gid_t, 'Jabal Citizen Qamariya Waistcoat & Robe', 'torso', 'dasri', parts_t))

    # GLOVES: Embroidered indigo & silver tiraz wrist cuffs
    gid_g = f'dsr_{sex}_town_cuffs'
    cuff_g_p = P('ebadindigo', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'silver'),
        B('bottom', 0.0, 0.012, 'solid', 'jusschalk'),
    ], [PN(0.0, 1.0, 'hirz_filigree', 'silver', 'ebadindigo', 0.05)], fabric='cloth.silk')
    e_g = assemble_garment(gid_g, 'Jabal Embroidered Tiraz Wrist-Cuffs', 'gloves', 'dasri',
                           dasri_bracers(gid_g, cuff_g_p, palm_paint=None, f0=0.68))
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # LEGS: Striped indigo & chalk sirwal
    gid_l = f'dsr_{sex}_town_sirwal'
    sir_p = P('ebadindigo', 0.04, [
        B('bottom', 0.0, 0.035, 'juss_qamariya', 'jusschalk', 'dragoncrimson', 0.04),
    ], [PN(0.0, 1.0, 'vstripes', 'jusschalk', 'ebadindigo', 0.05)], fabric=COTTON)
    entries.append(assemble_garment(gid_l, 'Jabal Striped Indigo-Chalk Sirwal', 'legs', 'dasri',
                                    trousers(gid_l, sir_p, ease=0.012, ease_end=0.009, bag=0.004), legged=True))

    # FEET: Burnished crimson & saddle zabur half-boots
    gid_f = f'dsr_{sex}_town_boots'
    zabur_p = P('saddle', 0.04, [
        B('bottom', 0.0, 0.016, 'solid', 'silver'),
    ], [PN(0.32, 0.68, 'juss_qamariya', 'rabbitgold', 'dragoncrimson', 0.07)], fabric='leather.polished')
    zabur_cuff = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.012, 'solid', 'silver'),
        B('bottom', 0.0, 0.016, 'hirz_filigree', 'silver', 'dragoncrimson', 0.04),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Burnished Jabal Zabur Half-Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, zabur_p, cuff_paint=zabur_cuff, top=0.38, ease_top=0.014, upturned=True)))

    # BACK: Woven Sadu market sling-satchel & rolled Jabal reed mat
    gid_b = f'dsr_{sex}_town_bag'
    parts_b = []
    c_bk = spine_at(CHEST - 0.04)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.110
    bag_c = c_bk + np.array([0.0, d_bk + 0.058, -0.02])
    bag_p = P('goatblack', 0.06, [
        B('top', 0.0, 0.024, 'solid', 'dragoncrimson'),
        B('bottom', 0.0, 0.024, 'solid', 'jusschalk'),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'rabbitgold', 'goatblack', 0.12)], fabric=WOOL)
    parts_b.append(blob(gid_b + '_sadu_satchel', bag_c, (0.24, 0.11, 0.24), bag_p,
                        n=16, rows=7, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_reed_mat',
                        [bag_c + np.array([-0.13, 0.01, 0.125]), bag_c + np.array([0.13, 0.01, 0.125])],
                        0.032, P('maguey', 0.07, [B('top', 0.0, 0.025, 'solid', 'dragoncrimson'),
                                                  B('bottom', 0.0, 0.025, 'solid', 'dragoncrimson')], fabric='straw.reed.plaited'),
                        n=12, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('saddle', 0.04, fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Jabal Sadu Market Satchel & Reed Mat', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 3. MEZCAL DISTILLER: Jabal & Arfwai Copper-Alembic Mezcalier (`mezcal_distiller`)
# ===========================================================================================================
def _build_mezcal_distiller(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Broad palm-and-buckskin conical_hat w/ sadu band (covers_hair=True, covers_face=False)
    gid_h = f'dsr_{sex}_mezcal_hat'
    parts_h = [
        head_rings(gid_h + '_liner', 0.50, 1.00, 0.016,
                   P('charcoal', 0.05, [B('bottom', 0.0, 0.014, 'solid', 'rabbitgold')], fabric=COTTON),
                   n=32, rows=6, apex=True),
        conical_hat(gid_h + '_brimhat',
                    P('maguey', 0.08, [
                        B('bottom', 0.0, 0.024, 'solid', 'smokebuck'),
                        B('top', 0.0, 0.040, 'solid', 'nahhascopper'),
                    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'rabbitgold', 'maguey', 0.12)], fabric='straw.reed.plaited'),
                    f_base=0.64, f_top=1.06, r_base=0.26, r_top=0.016, rows=10, n=36),
        crown_band(gid_h + '_sadu_band',
                   P('dragoncrimson', 0.05, [], [PN(0.0, 1.0, 'sadu_band', 'rabbitgold', 'goatblack', 0.06)], fabric=WOOL),
                   f0=0.60, f1=0.76, ease=0.020, flare=0.008, rows=5, n=36),
    ]
    c_br = a + (b - a) * 0.66
    h_br = first_hit(c_br, -bk) or 0.100
    parts_h.append(rosette(gid_h + '_copper_seal', c_br - bk * (h_br + 0.025), -bk, up, 0.022,
                           P('nahhascopper', 0.02, [B('top', 0.0, 0.006, 'solid', 'rabbitgold')], fabric='metal.bronze'),
                           n=10, thick=0.008, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Mezcalier Palm-and-Buckskin Sadu Hat', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Scorch-proof smoke-buckskin tabard apron over charcoal rolled-sleeve tunic + 3 tasting-gourds & copper hydrometer
    gid_t = f'dsr_{sex}_mezcal_tunic'
    parts_t = []
    tun_p = P('charcoal', 0.06, [
        B('top', 0.0, 0.018, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.024, 'sadu_band', 'rabbitgold', 'charcoal', 0.05),
    ], fabric=COTTON)
    parts_t.append(torso_tube(gid_t + '_tunic', TOP, KNEE - 0.03, 0.015, tun_p,
                              n=44, rows=20, hang_from=WAIST - 0.02, flare=0.12 if sex == 'f' else 0.09,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    apron_p = P('smokebuck', 0.06, [
        B('top', 0.0, 0.022, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.026, 'buckskin_concho', 'silver', 'smokebuck', 0.06),
    ], [
        PN(0.10, 0.90, 'lorica_lames', 'nahhascopper', 'smokebuck', 0.16, down=0.35),
    ], fabric='leather.buckskin')
    parts_t.extend(tabard(gid_t + '_apron', KNEE - 0.01, CHEST + 0.06, apron_p,
                          width=0.23, ease=0.025, front=True, back=False, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('smokebuck', 0.05, [B('top', 0.0, 0.010, 'solid', 'nahhascopper')], fabric='leather.buckskin'),
                                high=0.030))

    belt_p = P('leather', 0.05, [
        B('top', 0.0, 0.009, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.009, 'solid', 'nahhascopper'),
    ], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.032, WAIST - 0.038, 0.025, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.003, 0.026,
                                   hilt_paint=P('nahhascopper', 0.02, fabric='metal.bronze'),
                                   scabbard_paint=P('nahhascopper', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'rabbitgold')], fabric='metal.bronze')))
    # 3 mezcal tasting-gourds (jicaras) at right hip + copper hydrometer tube on left chest
    c_hip = spine_at(WAIST - 0.03)
    for gi, ang_g in enumerate((-0.55, -0.78, -1.02)):
        dg = np.array([math.sin(ang_g), -math.cos(ang_g), 0.0])
        dg /= np.linalg.norm(dg)
        pg = surface_out(c_hip, dg, 0.026, bvh=core.BVH_T) - np.array([0.0, 0.0, 0.012 * (gi % 2)])
        parts_t.append(blob(f'{gid_t}_jicara_{gi}', pg, (0.048, 0.038, 0.054),
                            P('rabbitgold', 0.04, [B('top', 0.0, 0.014, 'solid', 'dragoncrimson')]),
                            n=10, rows=4, out=dg, role='accessory'))
    p_hyd = chest_front(CHEST - 0.01, 0.025, x=0.068)
    parts_t.append(tube(gid_t + '_hydrometer',
                        [p_hyd - np.array([0.0, 0.0, 0.038]), p_hyd + np.array([0.0, 0.0, 0.038])],
                        0.011, P('nahhascopper', 0.02, [B('top', 0.0, 0.014, 'solid', 'oasisturq')], fabric='metal.bronze'),
                        n=10, rigid_joint='Spine2'))

    sl_p = P('charcoal', 0.06, [
        B('bottom', 0.0, 0.032, 'solid', 'smokebuck'),
        B('bottom', 0.032, 0.046, 'solid', 'rabbitgold'),
    ], fabric=COTTON)
    parts_t.extend(sleeves(gid_t, 'elbow', 0.016, sl_p, ease_end=0.023, rows=7))
    entries.append(assemble_garment(gid_t, 'Mezcalier Scorch-Buckskin Apron & Tasting-Gourd Belt', 'torso', 'dasri', parts_t))

    # GLOVES: Heat-cured alembic gauntlets (full hand protection)
    gid_g = f'dsr_{sex}_mezcal_gauntlets'
    gaunt_cuff = P('smokebuck', 0.05, [
        B('top', 0.0, 0.020, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.016, 'solid', 'nahhascopper'),
    ], fabric='leather.buckskin')
    gaunt_palm = P('leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'nahhascopper')], fabric='leather.polished')
    entries.append(assemble_garment(gid_g, 'Heat-Cured Copper-Rimmed Alembic Gauntlets', 'gloves', 'dasri',
                                    dasri_bracers(gid_g, gaunt_cuff, palm_paint=gaunt_palm,
                                                  concho_paint=P('nahhascopper', 0.02, fabric='metal.bronze'), f0=0.48)))

    # LEGS: Charcoal & buckskin-kneed distillery trousers
    gid_l = f'dsr_{sex}_mezcal_trousers'
    trou_p = P('charcoal', 0.06, [
        B('bottom', 0.0, 0.035, 'solid', 'rabbitgold'),
        B('top', 0.16, 0.30, 'solid', 'smokebuck'),
    ], fabric=COTTON)
    entries.append(assemble_garment(gid_l, 'Mezcalier Buckskin-Kneed Distillery Trousers', 'legs', 'dasri',
                                    trousers(gid_l, trou_p, ease=0.013, ease_end=0.009, bag=0.006), legged=True))

    # FEET: Copper-studded knee ndee boots
    gid_f = f'dsr_{sex}_mezcal_boots'
    boot_p = P('smokebuck', 0.06, [B('bottom', 0.0, 0.018, 'solid', 'nahhascopper')], fabric='leather.buckskin')
    cuff_p = P('leather', 0.05, [
        B('top', 0.0, 0.014, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.022, 'beads', 'nahhascopper', 'smokebuck', 0.035),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Copper-Studded Mezcalier Ndee Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.72, upturned=True,
                                               concho_paint=P('nahhascopper', 0.02, fabric='metal.bronze'))))

    # BACK: Hammered nahhas copper alembic dome, helical cooling-coil & glazed mezcal damajuana carboy pack
    gid_b = f'dsr_{sex}_mezcal_alembic'
    parts_b = []
    c_bk = spine_at(CHEST - 0.02)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.112
    pk_c = c_bk + np.array([0.0, d_bk + 0.064, 0.0])
    frame_p = P('bark', 0.07, [
        B('top', 0.0, 0.020, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.020, 'solid', 'nahhascopper'),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_pack_frame', pk_c, (0.25, 0.09, 0.30), frame_p,
                        n=16, rows=7, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    # Copper alembic pot & onion-dome cap on left side of rack
    pot_c = pk_c + np.array([0.062, 0.036, 0.045])
    cop_p = P('nahhascopper', 0.02, [
        B('top', 0.0, 0.016, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.016, 'solid', 'umber'),
    ], fabric='metal.bronze')
    parts_b.append(blob(gid_b + '_alembic_pot', pot_c, (0.12, 0.11, 0.14), cop_p,
                        n=14, rows=6, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    # Helical copper serpentine cooling-coil descending beside pot
    coil_pts = []
    for k in range(13):
        th = k * 0.55 * math.pi
        coil_pts.append(pot_c + np.array([0.035 * math.cos(th), 0.038 + 0.022 * math.sin(th), 0.065 - 0.016 * k]))
    parts_b.append(horn(gid_b + '_cooling_coil', coil_pts, 0.008, 0.007, cop_p,
                        n=8, rows=13, rigid_joint='Spine2'))
    # Glazed emerald-and-wicker mezcal damajuana carboy on right side of rack
    dama_c = pk_c + np.array([-0.062, 0.038, -0.020])
    dama_p = P('emerald', 0.03, [
        B('bottom', 0.0, 0.065, 'net_mesh', 'maguey', 'emerald', 0.04),
        B('top', 0.0, 0.018, 'solid', 'nahhascopper'),
    ], fabric='beads.glass')
    parts_b.append(blob(gid_b + '_damajuana', dama_c, (0.115, 0.105, 0.165), dama_p,
                        n=14, rows=6, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.05, [B('top', 0.0, 0.007, 'solid', 'nahhascopper')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Hammered Nahhas Copper Alembic & Mezcal Damajuana Pack', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 4. TRAIN DROVER: Train of Jabal Salt & Borax Factor (`train_drover`)
# ===========================================================================================================
def _build_train_drover(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, _ = head_frame()
    entries = []

    # HEAD: Full turban/keffiyeh + alkali-dust litham veil w/ double black goat-hair 'iqal (ch=True, cf=True)
    gid_h = f'dsr_{sex}_drover_turban'
    kef_p = P('jusschalk', 0.05, [
        B('bottom', 0.0, 0.038, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.06),
    ], [PN(0.0, 1.0, 'checks', 'dragoncrimson', 'jusschalk', 0.045)], fabric=COTTON)
    lith_p = P('jusschalk', 0.05, [
        B('top', 0.0, 0.014, 'solid', 'dragoncrimson'),
        B('bottom', 0.0, 0.018, 'sadu_band', 'goatblack', 'jusschalk', 0.04),
    ], fabric=COTTON)
    parts_h = keffiyeh_iqal_head(gid_h, kef_p, litham_paint=lith_p)
    c_br = a + (b - a) * 0.68
    h_br = first_hit(c_br, -bk) or 0.100
    parts_h.append(rosette(gid_h + '_train_seal', c_br - bk * (h_br + 0.022), -bk, up, 0.020,
                           P('brass', 0.02, [B('top', 0.0, 0.007, 'solid', 'dragoncrimson')], fabric='metal.gold'),
                           n=12, thick=0.007, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Train of Jabal Keffiyeh, Double Iqal & Alkali Litham', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=True))

    # TORSO: Unified single-shell black/crimson Bedouin bisht framing bleached juss-chalk tunic + lung-salt pouch & brass scales
    gid_t = f'dsr_{sex}_drover_bisht'
    parts_t = []
    bisht_robe_p = P('goatblack', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.028, 'solid', 'dragoncrimson'),
        B('bottom', 0.028, 0.105, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.07),
    ], [
        PN(0.39, 0.61, 'solid', 'jusschalk', 'jusschalk', 1.0),
        PN(0.35, 0.39, 'sadu_apache_chevron', 'rabbitgold', 'dragoncrimson', 0.07),
        PN(0.61, 0.65, 'sadu_apache_chevron', 'rabbitgold', 'dragoncrimson', 0.07),
    ], fabric='cloth.tent.black')
    parts_t.append(torso_tube(gid_t + '_bisht', TOP, ANKLE + 0.10, 0.017, bisht_robe_p,
                              n=50, rows=22, hang_from=WAIST - 0.02, flare=0.12,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('dragoncrimson', 0.04, [B('top', 0.0, 0.010, 'solid', 'rabbitgold')], fabric=WOOL),
                                high=0.032))

    cumm_p = P('dragoncrimson', 0.05, [
        B('top', 0.0, 0.010, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.010, 'solid', 'rabbitgold'),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'jusschalk', 'dragoncrimson', 0.06)], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.038, WAIST - 0.040, 0.026, cumm_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.027,
                                   hilt_paint=P('brass', 0.02, fabric='metal.gold'),
                                   scabbard_paint=P('brass', 0.02, [B('bottom', 0.0, 0.022, 'solid', 'dragoncrimson')], fabric='metal.gold')))
    # Chewed lung-salt leather pouch (with pink halite top) & brass scales case
    c_hip = spine_at(WAIST - 0.028)
    for tag, d_v, p_acc in (
        ('lungsalt_pouch', np.array([0.82, -0.57, 0.0]),
         P('smokebuck', 0.05, [B('top', 0.0, 0.022, 'solid', 'halitepink')], fabric='leather.buckskin')),
        ('brass_scales', np.array([-0.82, -0.57, 0.0]),
         P('brass', 0.02, [B('bottom', 0.0, 0.016, 'solid', 'goatblack')], fabric='metal.gold')),
    ):
        dv = d_v / np.linalg.norm(d_v)
        parts_t.append(blob(f'{gid_t}_{tag}', surface_out(c_hip, dv, 0.027, bvh=core.BVH_T),
                            (0.072, 0.044, 0.084), p_acc, n=12, rows=5, out=dv, role='accessory'))

    sl_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.024, 'solid', 'rabbitgold'),
        B('bottom', 0.024, 0.080, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.05),
    ], fabric='cloth.tent.black')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.027, rows=10))
    entries.append(assemble_garment(gid_t, 'Train of Jabal Black-and-Crimson Bisht & Lung-Salt Sash', 'torso', 'dasri', parts_t))

    # GLOVES: Salt-cured rawhide & Sadu camel-rein cuffs
    gid_g = f'dsr_{sex}_drover_gloves'
    cuff_g = P('sand', 0.06, [
        B('top', 0.0, 0.016, 'sadu_band', 'dragoncrimson', 'goatblack', 0.04),
        B('bottom', 0.0, 0.014, 'solid', 'brass'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_g, 'Salt-Cured Camel-Rein Drover Gloves', 'gloves', 'dasri',
                                    dasri_bracers(gid_g, cuff_g, palm_paint=P('leather', 0.05, fabric='leather.polished'), f0=0.58)))

    # LEGS: Sadu-striped desert sirwal
    gid_l = f'dsr_{sex}_drover_sirwal'
    sir_p = P('jusschalk', 0.05, [
        B('bottom', 0.0, 0.055, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.045),
    ], [PN(0.0, 1.0, 'vstripes', 'goatblack', 'jusschalk', 0.06)], fabric=COTTON)
    entries.append(assemble_garment(gid_l, 'Train of Jabal Sadu-Striped Sirwal', 'legs', 'dasri',
                                    trousers(gid_l, sir_p, ease=0.010, ease_end=0.009, bag=0.0), legged=True))

    # FEET: Low-cut rawhide-sand Apache ndee alkali boots (clean under ankle-length drover bisht)
    gid_f = f'dsr_{sex}_drover_boots'
    boot_p = P('sand', 0.06, [B('bottom', 0.0, 0.020, 'solid', 'goatblack')], fabric='leather.buckskin')
    cuff_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.024, 'sadu_apache_chevron', 'dragoncrimson', 'jusschalk', 0.045),
        B('top', 0.0, 0.012, 'solid', 'rabbitgold'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'Tall Rawhide-Sand Alkali Ndee Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.34, ease_top=0.014, upturned=True)))

    # BACK: Halite & borax slab-panniers + brass caravan tally-horn
    gid_b = f'dsr_{sex}_drover_panniers'
    parts_b = []
    c_bk = spine_at(CHEST - 0.02)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.112
    pk_c = c_bk + np.array([0.0, d_bk + 0.060, 0.0])
    yoke_b_p = P('goatblack', 0.06, [], [
        PN(0.0, 1.0, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.10),
    ], fabric='cloth.tent.black')
    parts_b.append(blob(gid_b + '_saddle_pad', pk_c, (0.27, 0.09, 0.28), yoke_b_p,
                        n=16, rows=7, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    halite_p = P('halitepink', 0.03, [
        B('top', 0.0, 0.025, 'solid', 'brucitewhite'),
        B('bottom', 0.0, 0.025, 'solid', 'smokebuck'),
    ], [PN(0.0, 1.0, 'juss_qamariya', 'white', 'halitepink', 0.09)], fabric='shell.nacre')
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        slab_c = pk_c + np.array([sd * 0.082, 0.038, 0.0])
        parts_b.append(blob(f'{gid_b}_halite_slab_{tag}', slab_c, (0.105, 0.085, 0.24), halite_p,
                            n=12, rows=6, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    # Curved brass caravan tally-horn across top of panniers
    parts_b.append(horn(gid_b + '_tally_horn',
                        [pk_c + np.array([-0.10, 0.04, 0.145]),
                         pk_c + np.array([0.0, 0.055, 0.175]),
                         pk_c + np.array([0.11, 0.035, 0.150])],
                        0.024, 0.008, P('brass', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'dragoncrimson')], fabric='metal.gold'),
                        n=10, rows=8, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('smokebuck', 0.06, fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Halite & Borax Slab-Panniers & Tally-Horn', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 5. MANTIS INCENSE: Mantis Dragon's-Blood & Frankincense Harvester (`mantis_incense`)
# ===========================================================================================================
def _build_mantis_incense(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, _ = head_frame()
    entries = []

    # HEAD: Resin-waxed cowl + crimson Apache headband w/ silver hirz brow-amulet (ch=True, cf=False)
    gid_h = f'dsr_{sex}_mantis_cowl'
    cowl_p = P('smokebuck', 0.05, [
        B('bottom', 0.0, 0.032, 'sadu_green', 'jusschalk', 'dragoncrimson', 0.06),
    ], fabric='cloth.oiled.alkali')
    band_p = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.007, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.007, 'solid', 'nahhascopper'),
    ], [PN(0.0, 1.0, 'sadu_green', 'jusschalk', 'dragoncrimson', 0.06)], fabric=COTTON)
    parts_h = [
        hood(gid_h + '_wax_cowl', cowl_p, ease=0.015, ease_low=0.019, open_front=0.92, low=-0.25, rows=12, n=36),
        crown_band(gid_h + '_band', band_p, f0=0.58, f1=0.74, ease=0.019, flare=0.003, rows=5, n=36),
    ]
    c_br = a + (b - a) * 0.66
    h_br = first_hit(c_br, -bk) or 0.100
    parts_h.extend(hirz_amulet_box(gid_h + '_brow_hirz', c_br - bk * (h_br + 0.022), -bk,
                                   inlay='dragoncrimson', width=0.044, height=0.024, bells=False, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Mantis Resin-Waxed Cowl & Hirz Brow-Band', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Deep dragon's-blood surcoat + baldric w/ hirz chest box, resin billhook & myrrh pomander
    gid_t = f'dsr_{sex}_mantis_surcoat'
    parts_t = []
    sur_p = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.025, 'solid', 'smokebuck'),
        B('bottom', 0.025, 0.095, 'sadu_green', 'jusschalk', 'dragoncrimson', 0.06),
    ], [
        PN(0.41, 0.59, 'sadu_green', 'rabbitgold', 'dragoncrimson', 0.12, down=0.45),
    ], fabric='cloth.oiled.alkali')
    parts_t.append(torso_tube(gid_t + '_surcoat', TOP, KNEE - 0.02, 0.015, sur_p,
                              n=46, rows=22, hang_from=WAIST - 0.02, flare=0.13 if sex == 'f' else 0.10,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('smokebuck', 0.04, [B('top', 0.0, 0.010, 'solid', 'nahhascopper')], fabric='cloth.oiled.alkali'),
                                high=0.032))
    parts_t.append(crossed_sash(gid_t + '_baldric',
                                P('smokebuck', 0.05, [B('top', 0.0, 0.008, 'solid', 'nahhascopper'),
                                                      B('bottom', 0.0, 0.008, 'solid', 'nahhascopper')], fabric='leather.buckskin'),
                                width=0.050, ease=0.022))
    p_hirz = chest_front(CHEST + 0.005, 0.025, x=0.015)
    parts_t.extend(hirz_amulet_box(gid_t + '_chest_hirz', p_hirz, FRONT, inlay='dragoncrimson',
                                   width=0.062, height=0.036, bells=True, rigid_joint='Spine2'))

    belt_p = P('smokebuck', 0.05, [B('top', 0.0, 0.012, 'sadu_green', 'jusschalk', 'dragoncrimson', 0.04)], fabric='leather.buckskin')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.030, WAIST - 0.036, 0.023, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.003, 0.024,
                                   hilt_paint=P('nahhascopper', 0.02, fabric='metal.bronze'),
                                   scabbard_paint=P('silver', 0.02, [B('top', 0.0, 0.018, 'solid', 'dragoncrimson')], fabric='metal.iron')))
    # Perforated copper myrrh pomander & curved resin-scraping billhook at hips
    c_hip = spine_at(WAIST - 0.032)
    d_pom = np.array([-0.82, -0.57, 0.0]) / np.linalg.norm([-0.82, -0.57, 0.0])
    parts_t.append(blob(gid_t + '_myrrh_pomander', surface_out(c_hip, d_pom, 0.025, bvh=core.BVH_T),
                        (0.056, 0.052, 0.058),
                        P('nahhascopper', 0.02, [], [PN(0.0, 1.0, 'gold_grid', 'goatblack', 'nahhascopper', 0.03)], fabric='metal.bronze'),
                        n=12, rows=5, out=d_pom, role='accessory'))

    sl_p = P('dragoncrimson', 0.04, [
        B('bottom', 0.0, 0.055, 'sadu_green', 'jusschalk', 'dragoncrimson', 0.045),
    ], fabric='cloth.oiled.alkali')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.015, sl_p, ease_end=0.024, rows=10))
    entries.append(assemble_garment(gid_t, "Mantis Dragon's-Blood Surcoat & Hirz Baldric", 'torso', 'dasri', parts_t))

    # GLOVES: Sap-resistant oiled harvester wraps
    gid_g = f'dsr_{sex}_mantis_wraps'
    sap_p = P('smokebuck', 0.04, [
        B('top', 0.0, 0.016, 'sadu_green', 'jusschalk', 'dragoncrimson', 0.04),
        B('bottom', 0.0, 0.014, 'solid', 'dragoncrimson'),
    ], fabric='cloth.oiled.alkali')
    entries.append(assemble_garment(gid_g, 'Mantis Sap-Resistant Harvester Wraps', 'gloves', 'dasri',
                                    dasri_bracers(gid_g, sap_p, palm_paint=P('charcoal', 0.04, fabric='cloth.oiled.alkali'), f0=0.52)))

    # LEGS: Monsoon-scrub gaiters & breeches
    gid_l = f'dsr_{sex}_mantis_leggings'
    leg_p = P('smokebuck', 0.05, [
        B('bottom', 0.0, 0.14, 'sadu_green', 'jusschalk', 'dragoncrimson', 0.05),
    ], fabric='cloth.oiled.alkali')
    entries.append(assemble_garment(gid_l, 'Mantis Monsoon-Scrub Gaiter Breeches', 'legs', 'dasri',
                                    trousers(gid_l, leg_p, ease=0.013, ease_end=0.009, bag=0.006), legged=True))

    # FEET: Oiled cinnabar-trimmed cliff boots
    gid_f = f'dsr_{sex}_mantis_boots'
    boot_p = P('leather', 0.04, [B('bottom', 0.0, 0.018, 'solid', 'dragoncrimson')], fabric='leather.polished')
    cuff_p = P('dragoncrimson', 0.04, [
        B('bottom', 0.0, 0.024, 'sadu_green', 'jusschalk', 'dragoncrimson', 0.045),
        B('top', 0.0, 0.012, 'solid', 'nahhascopper'),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Mantis Oiled Cinnabar-Trim Ndee Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.74, upturned=True)))

    # BACK: Wicker resin-tear chest heaped w/ dragon's-blood cinnabar tears + brass censer
    gid_b = f'dsr_{sex}_mantis_chest'
    parts_b = []
    c_bk = spine_at(CHEST - 0.02)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.112
    ch_c = c_bk + np.array([0.0, d_bk + 0.066, 0.0])
    wicker_p = P('maguey', 0.08, [
        B('top', 0.0, 0.024, 'sadu_green', 'jusschalk', 'dragoncrimson', 0.05),
        B('bottom', 0.0, 0.022, 'solid', 'smokebuck'),
    ], [PN(0.0, 1.0, 'checks', 'smokebuck', 'maguey', 0.05)], fabric='straw.reed.plaited')
    parts_b.append(blob(gid_b + '_wicker_chest', ch_c, (0.24, 0.14, 0.28), wicker_p,
                        n=18, rows=8, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    for idx, (dx_r, col_r) in enumerate(((-0.055, 'dragoncrimson'), (0.0, 'amber'), (0.055, 'dragoncrimson'))):
        parts_b.append(blob(f'{gid_b}_resin_tear_{idx}', ch_c + np.array([dx_r, 0.0, 0.142]),
                            (0.070, 0.065, 0.068), P(col_r, 0.02, fabric='beads.glass'),
                            n=10, rows=5, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    # Brass incense censer mounted on lower right corner of chest
    cen_c = ch_c + np.array([-0.105, 0.015, -0.095])
    parts_b.append(blob(gid_b + '_brass_censer', cen_c, (0.072, 0.072, 0.092),
                        P('nahhascopper', 0.02, [B('top', 0.0, 0.02, 'solid', 'rabbitgold')],
                          [PN(0.0, 1.0, 'gold_grid', 'goatblack', 'nahhascopper', 0.03)], fabric='metal.bronze'),
                        n=12, rows=6, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('smokebuck', 0.05, fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, "Mantis Wicker Dragon's-Blood Chest & Brass Censer", 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 6. CLAN HERDER: Free Qabila Dromedary & Goat Pastoralist (`clan_herder`)
# ===========================================================================================================
def _build_clan_herder(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    )
    entries = []

    # HEAD: Patterned Apache headband over desert hair/braids (ch=False, cf=False)
    gid_h = f'dsr_{sex}_herder_headband'
    band_p = P('goatblack', 0.05, [
        B('top', 0.0, 0.006, 'solid', 'oasisturq'),
        B('bottom', 0.0, 0.006, 'solid', 'oasisturq'),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.07)], fabric=WOOL)
    concho_p = P('silver', 0.02, [B('top', 0.0, 0.006, 'solid', 'oasisturq')], fabric='metal.iron')
    entries.append(assemble_garment(gid_h, 'Qabila Patterned Apache War-Headband', 'head', 'dasri',
                                    apache_war_headband(gid_h, band_p, concho_paint=concho_p, n_conchos=6, knot_tails=True),
                                    covers_hair=False, covers_face=False))

    # TORSO: Fringed smoke-buckskin Apache war-shirt + striped goat-hair shoulder cape + concho belt & jambiya
    gid_t = f'dsr_{sex}_herder_warshirt'
    parts_t = []
    shirt_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.055, 'buckskin_concho', 'silver', 'smokebuck', 0.06),
    ], [
        PN(0.38, 0.62, 'sadu_apache_chevron', 'oasisturq', 'smokebuck', 0.14, down=0.30),
    ], fabric='leather.buckskin')
    ws_tube = torso_tube(gid_t + '_warshirt', TOP, WAIST - 0.036, 0.016, shirt_p,
                         n=46, rows=14, hull_from=CHEST + 0.02)
    ws_tube.cloth = None
    parts_t.append(ws_tube)
    yoke_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.032, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.05),
        B('top', 0.0, 0.014, 'solid', 'dragoncrimson'),
    ], fabric='leather.buckskin')
    parts_t.extend(apache_warshirt_yoke(gid_t, yoke_p, shirt_ease=0.017))
    parts_t.append(stand_collar(gid_t, P('dragoncrimson', 0.04, [B('top', 0.0, 0.010, 'solid', 'oasisturq')], fabric=COTTON),
                                high=0.030))
    # Striped goat-hair Bedouin shoulder shawl (contoured flush over shoulders so it never fights the dorsal waterskin)
    cape_p = P('goatblack', 0.06, [
        B('bottom', 0.0, 0.035, 'sadu_apache_chevron', 'dragoncrimson', 'goatblack', 0.05),
    ], [PN(0.0, 1.0, 'sadu_band', 'dragoncrimson', 'goatblack', 0.10)], fabric='cloth.tent.black')
    parts_t.append(collar_disc(gid_t + '_sadu_shawl', 0.102, cape_p, drop=0.096, scallop=0.05, ease=0.021, rows=8, n=44))

    belt_p = P('leather', 0.05, [], [
        PN(0.0, 1.0, 'buckskin_concho', 'silver', 'leather', 0.055),
    ], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.032, WAIST - 0.036, 0.024, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.003, 0.025,
                                   hilt_paint=P('silver', 0.02, [B('top', 0.0, 0.012, 'solid', 'oasisturq')], fabric='metal.iron'),
                                   scabbard_paint=P('silver', 0.02, fabric='metal.iron')))
    # Carved bone herd-whistle on chest cord
    p_wh = chest_front(CHEST - 0.02, 0.026, x=-0.045)
    parts_t.append(tube(gid_t + '_herd_whistle',
                        [p_wh - np.array([0.01, 0.0, 0.028]), p_wh + np.array([0.01, 0.0, 0.028])],
                        0.009, P('bone', 0.03, [B('top', 0.0, 0.012, 'solid', 'oasisturq')]),
                        n=8, rigid_joint='Spine2'))

    sl_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.040, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.045),
    ], fabric='leather.buckskin')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.024, rows=9))
    entries.append(assemble_garment(gid_t, 'Fringed Buckskin Apache War-Shirt & Sadu Cape', 'torso', 'dasri', parts_t))

    # GLOVES: Beaded buckskin & turquoise concho cuffs
    gid_g = f'dsr_{sex}_herder_cuffs'
    cuff_g = P('smokebuck', 0.06, [
        B('top', 0.0, 0.014, 'solid', 'oasisturq'),
        B('bottom', 0.0, 0.014, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'buckskin_concho', 'silver', 'smokebuck', 0.05)], fabric='leather.buckskin')
    e_g = assemble_garment(gid_g, 'Beaded Buckskin & Turquoise Concho Cuffs', 'gloves', 'dasri',
                           dasri_bracers(gid_g, cuff_g, palm_paint=None, concho_paint=concho_p, f0=0.60))
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # LEGS: Sirwal + beaded buckskin breechclout apron
    gid_l = f'dsr_{sex}_herder_clout'
    sir_p = P('goatblack', 0.05, [B('bottom', 0.0, 0.035, 'sadu_band', 'dragoncrimson', 'jusschalk', 0.04)], fabric=COTTON)
    clout_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.050, 'sadu_apache_chevron', 'oasisturq', 'dragoncrimson', 0.05),
    ], [PN(0.0, 1.0, 'buckskin_concho', 'silver', 'smokebuck', 0.08)], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_l, 'Qabila Sirwal & Beaded Buckskin Breechclout', 'legs', 'dasri',
                                    breechclout_sirwal(gid_l, sir_p, clout_p), legged=True))

    # FEET: Knee-high folded-top ndee cactus-boots
    gid_f = f'dsr_{sex}_herder_boots'
    boot_p = P('smokebuck', 0.06, [B('bottom', 0.0, 0.018, 'solid', 'umber')], fabric='leather.buckskin')
    cuff_p = P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.028, 'buckskin_concho', 'oasisturq', 'smokebuck', 0.045),
        B('top', 0.0, 0.012, 'solid', 'dragoncrimson'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'Knee-High Folded-Top Apache Ndee Cactus-Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.82, upturned=True, concho_paint=concho_p)))

    # BACK: Goat-hide qirba waterskin & coiled camel lasso
    gid_b = f'dsr_{sex}_herder_waterskin'
    parts_b = []
    c_bk = spine_at(CHEST - 0.02)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.110
    ws_c = c_bk + np.array([0.0, d_bk + 0.060, -0.01])
    qirba_p = P('leather', 0.06, [
        B('top', 0.0, 0.028, 'sadu_band', 'dragoncrimson', 'jusschalk', 0.04),
        B('bottom', 0.0, 0.024, 'solid', 'nahhascopper'),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_qirba_waterskin', ws_c, (0.21, 0.12, 0.29), qirba_p,
                        n=16, rows=7, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    # Coiled goat-hair camel lasso strapped onto back of waterskin
    lasso_pts = [ws_c + np.array([0.095 * math.cos(an), 0.048, 0.095 * math.sin(an)])
                 for an in np.linspace(0.0, 2.0 * math.pi, 15)]
    parts_b.append(horn(gid_b + '_camel_lasso', lasso_pts, 0.015, 0.015,
                        P('goatblack', 0.07, [B('top', 0.0, 0.02, 'stripes', 'jusschalk', 'goatblack', 0.03)], fabric='cloth.tent.black'),
                        n=8, rows=15, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('smokebuck', 0.06, fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Goat-Hide Qirba Waterskin & Camel Lasso', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 7. WALKER: Chakipunku & Caliche Salt-Flat Trail-Runner (`walker`)
# ===========================================================================================================
def _build_walker(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    # HEAD: Indigo/gold glare litham turban + veil (ch=True, cf=True)
    gid_h = f'dsr_{sex}_walker_litham'
    kef_p = P('ebadindigo', 0.04, [
        B('bottom', 0.0, 0.035, 'sadu_apache_chevron', 'rabbitgold', 'ebadindigo', 0.06),
        B('top', 0.0, 0.020, 'solid', 'rabbitgold'),
    ], fabric=COTTON)
    iq_p = P('rabbitgold', 0.04, [B('top', 0.0, 0.008, 'stripes', 'ebadindigo', 'rabbitgold', 0.025)], fabric=WOOL)
    lith_p = P('ebadindigo', 0.04, [
        B('top', 0.0, 0.016, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.022, 'sadu_band', 'rabbitgold', 'ebadindigo', 0.04),
    ], fabric=COTTON)
    parts_h = keffiyeh_iqal_head(gid_h, kef_p, iqal_paint=iq_p, litham_paint=lith_p)
    entries.append(assemble_garment(gid_h, 'Caliche Salt-Glare Indigo & Gold Litham', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=True))

    # TORSO: Wind-streamlined woad-indigo robe belted w/ 4-colour badland plaid cummerbund + star-compass & nitrate horn
    gid_t = f'dsr_{sex}_walker_robe'
    parts_t = []
    robe_p = P('ebadindigo', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.025, 'solid', 'rabbitgold'),
        B('bottom', 0.025, 0.088, 'sadu_apache_chevron', 'rabbitgold', 'ebadindigo', 0.06),
    ], [
        PN(0.44, 0.56, 'chevrons', 'rabbitgold', 'ebadindigo', 0.07, down=0.42),
    ], fabric=COTTON)
    parts_t.append(torso_tube(gid_t + '_robe', TOP, KNEE + 0.02, 0.015, robe_p,
                              n=46, rows=21, hang_from=WAIST - 0.02, flare=0.11 if sex == 'f' else 0.09,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('rabbitgold', 0.04, [B('top', 0.0, 0.010, 'solid', 'ebadindigo')], fabric=COTTON),
                                high=0.032))

    plaid_p = P('rabbitgold', 0.05, [
        B('top', 0.0, 0.010, 'solid', 'jusschalk'),
        B('bottom', 0.0, 0.010, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'tartan', 'ebadindigo', 'rabbitgold', 0.07)], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.042, WAIST - 0.042, 0.021, plaid_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.002, 0.023,
                                   hilt_paint=P('brass', 0.02, fabric='metal.gold'),
                                   scabbard_paint=P('smokebuck', 0.05, [B('bottom', 0.0, 0.022, 'solid', 'brass')])))
    # Engraved brass star-compass disc on chest
    p_comp = chest_front(CHEST + 0.005, 0.020, x=0.0)
    parts_t.append(rosette(gid_t + '_star_compass', p_comp, FRONT, np.array([1.0, 0.0, 0.0]), 0.030,
                           P('brass', 0.02, [], [PN(0.0, 1.0, 'rays', 'oasisturq', 'brass', 0.05)], fabric='metal.gold'),
                           n=14, thick=0.009, rigid_joint='Spine2'))
    # Nitrate horn-flask at right hip
    c_hip = spine_at(WAIST - 0.03)
    d_hn = np.array([-0.86, -0.51, 0.0]) / np.linalg.norm([-0.86, -0.51, 0.0])
    p_hn = surface_out(c_hip, d_hn, 0.024, bvh=core.BVH_T)
    parts_t.append(horn(gid_t + '_nitrate_horn',
                        [p_hn + np.array([0.0, -0.02, 0.045]), p_hn, p_hn + np.array([-0.015, 0.035, -0.055])],
                        0.020, 0.006, P('bone', 0.03, [B('top', 0.0, 0.018, 'solid', 'brass')]),
                        n=10, rows=7, rigid_joint='Spine1', role='trinket'))

    sl_p = P('ebadindigo', 0.04, [
        B('bottom', 0.0, 0.045, 'tartan', 'rabbitgold', 'ebadindigo', 0.04),
    ], fabric=COTTON)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.015, sl_p, ease_end=0.022, rows=10))
    entries.append(assemble_garment(gid_t, 'Caliche Trail-Runner Woad Robe & Star-Compass', 'torso', 'dasri', parts_t))

    # GLOVES: Wind-bound indigo & rawhide runner wraps
    gid_g = f'dsr_{sex}_walker_wraps'
    w_p = P('ebadindigo', 0.04, [
        B('top', 0.0, 0.014, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.014, 'solid', 'sand'),
    ], fabric=COTTON)
    e_g = assemble_garment(gid_g, 'Trail-Runner Wind-Bound Wrist-Wraps', 'gloves', 'dasri',
                           dasri_bracers(gid_g, w_p, palm_paint=None, f0=0.56))
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # LEGS: Shin-bound woad-indigo sirwal
    gid_l = f'dsr_{sex}_walker_sirwal'
    sir_p = P('ebadindigo', 0.04, [
        B('bottom', 0.0, 0.12, 'stripes', 'rabbitgold', 'sand', 0.03),
    ], fabric=COTTON)
    entries.append(assemble_garment(gid_l, 'Shin-Bound Caliche Trail Sirwal', 'legs', 'dasri',
                                    trousers(gid_l, sir_p, ease=0.012, ease_end=0.009, bag=0.005), legged=True))

    # FEET: Rawhide-soled caliche ndee trail boots
    gid_f = f'dsr_{sex}_walker_boots'
    boot_p = P('sand', 0.06, [B('bottom', 0.0, 0.020, 'solid', 'jusschalk')], fabric='leather.buckskin')
    cuff_p = P('ebadindigo', 0.05, [
        B('bottom', 0.0, 0.024, 'tartan', 'rabbitgold', 'ebadindigo', 0.04),
        B('top', 0.0, 0.012, 'solid', 'rabbitgold'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'Rawhide-Soled Caliche Ndee Trail Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, cuff_paint=cuff_p, top=0.78, upturned=True, wraps=2,
                                               wrap_paint=P('rabbitgold', 0.05, fabric='leather.buckskin'))))

    # BACK: Twin agave trail-canteens & corded chuno/salt sack
    gid_b = f'dsr_{sex}_walker_pack'
    parts_b = []
    c_bk = spine_at(CHEST - 0.02)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.110
    pk_c = c_bk + np.array([0.0, d_bk + 0.056, 0.0])
    sack_p = P('sand', 0.07, [
        B('top', 0.0, 0.025, 'tartan', 'ebadindigo', 'rabbitgold', 0.05),
        B('bottom', 0.0, 0.025, 'solid', 'smokebuck'),
    ], fabric='cloth.weave.burlap')
    parts_b.append(blob(gid_b + '_chuno_sack', pk_c, (0.21, 0.11, 0.27), sack_p,
                        n=16, rows=7, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    cant_p = P('smokebuck', 0.05, [
        B('top', 0.0, 0.018, 'solid', 'brass'),
        B('bottom', 0.0, 0.018, 'solid', 'ebadindigo'),
    ], fabric='leather.buckskin')
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        cc = pk_c + np.array([sd * 0.095, 0.022, -0.02])
        parts_b.append(blob(f'{gid_b}_canteen_{tag}', cc, (0.078, 0.068, 0.135), cant_p,
                            n=12, rows=6, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('smokebuck', 0.05, fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Twin Agave Trail-Canteens & Salt Runner Pack', 'back', 'dasri', parts_b))
    return entries


# ===========================================================================================================
# 8. BADLAND PROSPECTOR: Rifar al-Dhahab High-Wadi Gold & Kimberlite Panner (`badland_prospector`)
# ===========================================================================================================
def _build_badland_prospector(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    # HEAD: Fleece-lined pointed_cap under keffiyeh scarf (ch=True, cf=False)
    gid_h = f'dsr_{sex}_prospector_cap'
    cap_p = P('umber', 0.07, [
        B('bottom', 0.0, 0.028, 'solid', 'bone'),
        B('top', 0.0, 0.030, 'solid', 'rabbitgold'),
    ], fabric='fur.wolf')
    wrap_p = P('ebadindigo', 0.05, [
        B('top', 0.0, 0.008, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.008, 'solid', 'bone'),
    ], [PN(0.0, 1.0, 'sadu_apache_chevron', 'rabbitgold', 'ebadindigo', 0.07)], fabric=WOOL)
    parts_h = [
        hood(gid_h + '_keffiyeh_scarf', wrap_p, ease=0.015, ease_low=0.019, open_front=0.95, low=-0.25, rows=11, n=34),
        tower_hat(gid_h + '_pointed_cap', 0.165, lambda s: (1.0 - 0.72 * (s ** 1.35)), cap_p, f=0.58, ease=0.019, rows=10, n=34),
        crown_band(gid_h + '_fleece_brim', P('bone', 0.09, fabric='fur.wolf'), f0=0.52, f1=0.68, ease=0.023, flare=0.005, rows=5, n=34),
    ]
    entries.append(assemble_garment(gid_h, 'High-Wadi Fleece Pointed Cap & Keffiyeh Wrap', 'head', 'dasri', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Quilted lichen-wool coat + fleece collar + baldric w/ kimberlite diamond vial & gold-scales pouch
    gid_t = f'dsr_{sex}_prospector_coat'
    parts_t = []
    coat_p = P('olive', 0.06, [
        B('top', 0.0, 0.024, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.032, 'solid', 'bone'),
        B('bottom', 0.032, 0.090, 'sadu_apache_chevron', 'rabbitgold', 'ebadindigo', 0.06),
    ], [
        PN(0.0, 0.38, 'diamond_quilt', 'umber', 'olive', 0.16),
        PN(0.62, 1.0, 'diamond_quilt', 'umber', 'olive', 0.16),
        PN(0.38, 0.62, 'diamond_quilt', 'rabbitgold', 'ebadindigo', 0.16),
    ], fabric='cloth.quilted.diamond')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.03, 0.017, coat_p,
                              n=46, rows=20, hang_from=WAIST - 0.02, flare=0.12 if sex == 'f' else 0.09,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar_disc(gid_t + '_fleece_collar', 0.078,
                               P('bone', 0.09, [B('bottom', 0.0, 0.016, 'solid', 'rabbitgold')], fabric='fur.wolf'),
                               drop=0.066, scallop=0.04, ease=0.020, rows=8))
    parts_t.append(crossed_sash(gid_t + '_baldric',
                                P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'rabbitgold'),
                                                    B('bottom', 0.0, 0.008, 'solid', 'rabbitgold')], fabric='leather.polished'),
                                width=0.048, ease=0.023))
    # Locked silver & moonglass kimberlite-diamond vial on chest baldric
    p_vial = chest_front(CHEST + 0.01, 0.025, x=0.032)
    parts_t.append(tube(gid_t + '_kimberlite_vial',
                        [p_vial - np.array([0.0, 0.0, 0.030]), p_vial + np.array([0.0, 0.0, 0.030])],
                        0.013, P('moonglass', 0.02, [B('top', 0.0, 0.014, 'solid', 'silver'),
                                                     B('bottom', 0.0, 0.014, 'solid', 'silver')], fabric='glass.moonglass.leaded'),
                        n=10, rigid_joint='Spine2'))

    belt_p = P('leather', 0.05, [B('top', 0.0, 0.010, 'solid', 'brass')], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.032, WAIST - 0.036, 0.023, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(jambiya_daggers(gid_t, WAIST - 0.003, 0.024,
                                   hilt_paint=P('bone', 0.04, [B('top', 0.0, 0.012, 'solid', 'brass')]),
                                   scabbard_paint=P('leather', 0.05, [B('bottom', 0.0, 0.022, 'solid', 'rabbitgold')])))
    c_hip = spine_at(WAIST - 0.03)
    d_sc = np.array([0.84, -0.54, 0.0]) / np.linalg.norm([0.84, -0.54, 0.0])
    parts_t.append(blob(gid_t + '_gold_scales_pouch', surface_out(c_hip, d_sc, 0.025, bvh=core.BVH_T),
                        (0.074, 0.042, 0.082),
                        P('smokebuck', 0.05, [B('top', 0.0, 0.020, 'solid', 'rabbitgold')], fabric='leather.buckskin'),
                        n=12, rows=5, out=d_sc, role='accessory'))

    sl_p = P('olive', 0.06, [
        B('bottom', 0.0, 0.040, 'solid', 'bone'),
        B('bottom', 0.040, 0.058, 'solid', 'rabbitgold'),
    ], fabric=WOOL)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Rifar Quilted High-Wadi Coat & Kimberlite Vial Baldric', 'torso', 'dasri', parts_t))

    # GLOVES: Oiled gravel-panning leather cuffs
    gid_g = f'dsr_{sex}_prospector_cuffs'
    cuff_g = P('leather', 0.05, [
        B('top', 0.0, 0.018, 'solid', 'bone'),
        B('bottom', 0.0, 0.014, 'solid', 'rabbitgold'),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_g, 'Gravel-Panning Oiled Leather Cuffs', 'gloves', 'dasri',
                                    dasri_bracers(gid_g, cuff_g, palm_paint=P('smokebuck', 0.05, fabric='leather.buckskin'), f0=0.54)))

    # LEGS: Wool trousers w/ buckskin knees
    gid_l = f'dsr_{sex}_prospector_trousers'
    trou_p = P('umber', 0.06, [
        B('bottom', 0.0, 0.035, 'solid', 'ebadindigo'),
        B('top', 0.16, 0.30, 'solid', 'smokebuck'),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'High-Wadi Buckskin-Kneed Wool Trousers', 'legs', 'dasri',
                                    trousers(gid_l, trou_p, ease=0.013, ease_end=0.009, bag=0.006), legged=True))

    # FEET: Lug-welt fleece-top ndee mountain boots
    gid_f = f'dsr_{sex}_prospector_boots'
    sole_p = P('soot', 0.09, [B('top', 0.0, 0.014, 'solid', 'rabbitgold')])
    boot_p = P('leather', 0.05, [B('bottom', 0.0, 0.018, 'solid', 'umber')], fabric='leather.polished')
    cuff_p = P('bone', 0.09, [B('bottom', 0.0, 0.018, 'solid', 'ebadindigo')], fabric='fur.wolf')
    entries.append(assemble_garment(gid_f, 'Lug-Welt Fleece-Cuffed Prospector Boots', 'feet', 'dasri',
                                    ndee_boots(gid_f, boot_p, sole_paint=sole_p, cuff_paint=cuff_p, top=0.70, upturned=True)))

    # BACK: Wooden/copper placer batea gold-pan & iron pickaxe pack
    gid_b = f'dsr_{sex}_prospector_panpack'
    parts_b = []
    c_bk = spine_at(CHEST - 0.01)
    d_bk = first_hit(c_bk, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T) or 0.112
    pk_c = c_bk + np.array([0.0, d_bk + 0.058, 0.0])
    ruck_p = P('umber', 0.06, [
        B('top', 0.0, 0.024, 'sadu_apache_chevron', 'rabbitgold', 'ebadindigo', 0.05),
        B('bottom', 0.0, 0.022, 'solid', 'leather'),
    ], fabric=WOOL)
    parts_b.append(blob(gid_b + '_rucksack', pk_c, (0.23, 0.12, 0.28), ruck_p,
                        n=16, rows=7, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    # Circular wooden/copper batea placer pan strapped flat against back of rucksack
    pan_p = P('bark', 0.05, [
        B('bottom', 0.0, 0.022, 'solid', 'nahhascopper'),
    ], [PN(0.0, 1.0, 'orb', 'rabbitgold', 'bark', 0.16)], fabric='leather.polished')
    parts_b.append(rosette(gid_b + '_batea_pan', pk_c + np.array([0.0, 0.062, 0.015]),
                           np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                           0.155, pan_p, n=22, thick=0.018, rigid_joint='Spine2'))
    # Diagonal iron pickaxe handle & curved steel pick-head strapped flat behind the batea pan (well clear of shoulders)
    h_bot = pk_c + np.array([-0.075, 0.076, -0.115])
    h_top = pk_c + np.array([0.052, 0.076, 0.095])
    parts_b.append(tube(gid_b + '_pick_haft', [h_bot, h_top], 0.013, P('bark', 0.06), n=8, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_pick_head',
                        [h_top + np.array([-0.068, 0.006, 0.018]), h_top, h_top + np.array([0.064, 0.006, -0.032])],
                        0.015, 0.005, P('iron', 0.03, [B('top', 0.0, 0.02, 'solid', 'steel')], fabric='metal.iron'),
                        n=8, rows=7, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.05, fabric='leather.polished'), ease=0.046))
    entries.append(assemble_garment(gid_b, 'Rifar Placer Batea Gold-Pan & Pickaxe Pack', 'back', 'dasri', parts_b))
    return entries


def build_dasri_jabal_bowl():
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_peasant(sex, body_id))
        entries.extend(_build_town(sex, body_id))
        entries.extend(_build_mezcal_distiller(sex, body_id))
        entries.extend(_build_train_drover(sex, body_id))
        entries.extend(_build_mantis_incense(sex, body_id))
        entries.extend(_build_clan_herder(sex, body_id))
        entries.extend(_build_walker(sex, body_id))
        entries.extend(_build_badland_prospector(sex, body_id))
    return entries
