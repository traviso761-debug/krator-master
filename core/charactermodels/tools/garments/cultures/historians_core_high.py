"""Order of Historians Core, Technical & High-Altitude Chapters (`HM-01`..`HM-10`).

Implements Module 3 of the Xanadu/Order Garment Expansion across male (`mpfb_male`)
and female (`mpfb_female`) bodies (`60` pieces total, `culture='historians'`):

0. Hygiene Upgrades for Existing History Monk Tiers (`7 x 2 = 14` pieces):
   - `order_{sex}_novice_shirt` (`torso`): Extended saffron monastic shirt (`CROTCH + 0.04`) with
     `saffron_kesa` placket, `omaroon` collar/cuffs, elbow sleeves & conformed `omaroon` waist sash.
   - `order_{sex}_elder_trousers` (`legs`): Warm `omaroon` wool under-trousers with `osaffron` & `gold` trim.
   - `order_{sex}_servant_boots` (`feet`): Oidong felt-and-leather boots in `yakbrown`, `omaroon` & `orderblue`.
   - `order_{sex}_agent_cowl` (`head`): `HM-10` Keepwell Field Operative wool road hood & bronze Wheel pin.
   - `order_{sex}_agent_coat` (`torso`): `HM-10` Keepwell quilted road coat, `leather` pauldrons & dispatch belt.
   - `order_{sex}_agent_pack` (`back`): Keepwell leather field pack, sealed scroll tube & bronze anomaly detector.
   - `order_{sex}_pc_lancer_pack` (`back`): Dorsal `RC-6` Relic-Lancer stasis capacitor coils & `godteal` core.

1. `abbot_chronicler` — `HM-01` Longsong Abbot-Chronicler & `HM-03` Qiblai Saffron Prismarch (`4 x 2 = 8`):
   - `order_{sex}_abbot_mitre`, `order_{sex}_abbot_robe`, `order_{sex}_abbot_stave`, `order_{sex}_abbot_boots`

2. `printer_artisan` — `HM-01` Sprin-Zam Movable-Type Printer, Paper Miller & Lens-Grinder (`4 x 2 = 8`):
   - `order_{sex}_printer_cap`, `order_{sex}_printer_apron`, `order_{sex}_printer_cuffs`, `order_{sex}_printer_chase`

3. `oidong_courier` — `HM-01a` Oidong 9-Stage Relay Courier & `HM-06` Singing Gjar Watcher (`3 x 2 = 6`):
   - `order_{sex}_courier_cap`, `order_{sex}_courier_jacket`, `order_{sex}_courier_tubes`

4. `rc6_inquisitor` — `HM-10` Keepwell `RC-6` Apex-Hazard Seizure & Containment Specialist (`4 x 2 = 8`):
   - `order_{sex}_rc6_helm`, `order_{sex}_rc6_cuirass`, `order_{sex}_rc6_gauntlets`, `order_{sex}_rc6_nullpack`

5. `puna_excavator` — `HM-02` Tiguantin Viejo (`+4,616 m`) & `HM-05` White Gills Chronologist (`4 x 2 = 8`):
   - `order_{sex}_puna_hood`, `order_{sex}_puna_chuba`, `order_{sex}_puna_pack`, `order_{sex}_puna_boots`

6. `verge_chronicler` — `HM-09` Verge Scarp Dual-Zone Camel & East-Abyss Miasma Chronicler (`4 x 2 = 8`):
   - `order_{sex}_verge_litham`, `order_{sex}_verge_burnous`, `order_{sex}_verge_pack`, `order_{sex}_verge_boots`
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, ring_points, smooth_push, assemble_garment
)
from ..paint import P, B, PN, C, COTTON, WOOL
from ..types.torso import (
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, band, pauldron
)
from ..types.limbs import limb_tube, sleeve, sleeves, trousers
from ..types.footwear import boots
from ..types.headgear import (
    head_rings, sculpted_faceplate, sculpted_cranium, hood,
    tower_hat, crown_band, horn
)
from ..types.accoutrements import (
    blob, pouch_belt, pack_straps, tube, rosette
)


# ===========================================================================================================
# SHARED GEOMETRY HELPERS (Strict Conformance & Zero-Float Accoutrements)
# ===========================================================================================================
def _head_landmarks():
    """Return `(a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown)` calibrated to true `base.glb` eye/brow primitives."""
    from ..types.headgear import head_landmarks_exact
    return head_landmarks_exact()[:9]


def _build_chest_chain(gid_prefix, z_neck, w_loop, drop_z, coat_ease, link_paint, n_links=33):
    """Build a continuous 3D chest chain (`horn` inner cord + overlapping `blob` links, `role='trinket'`)."""
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


def _build_cuff_palm_gloves(gid, cuff_p, palm_p):
    """Paired forearm cuffs + full 5-finger gloves (for `*_gloves`/`*_gauntlets`) or palm wraps (`*_cuffs`)."""
    from ..types.limbs import full_gloves
    if gid.endswith(('_gloves', '_gauntlets')):
        return full_gloves(gid, cuff_p, palm_p, f0=0.64, ease=0.014)
    parts = []
    for s in (L, R):
        parts.append(sleeve(f'{gid}_cuff_{s[0]}', s, cuff_p, f0=0.68, f1=0.98,
                            ease=0.013, flare=0.004, rows=5, n=20))
        w_pt = J(s + 'Hand')
        idx1, pnk1 = J(s + 'HandIndex1'), J(s + 'HandPinky1')
        knuckles = 0.25 * (idx1 + J(s + 'HandMiddle1') + J(s + 'HandRing1') + pnk1)
        d_hand = knuckles - w_pt
        u_ax = d_hand / np.linalg.norm(d_hand)
        x_ax = (idx1 - pnk1) - u_ax * np.dot(idx1 - pnk1, u_ax)
        x_ax /= np.linalg.norm(x_ax)
        y_ax = np.cross(u_ax, x_ax)
        y_ax /= np.linalg.norm(y_ax)
        rows_arr = []
        for t in np.linspace(0.0, 0.92, 5):
            cc = w_pt + d_hand * t
            rx, ry = 0.040 + 0.006 * t, 0.021 * (1.0 - 0.10 * t)
            rows_arr.append([
                cc + x_ax * (math.cos(an) * rx) + y_ax * (math.sin(an) * ry)
                for an in np.linspace(0, 2 * math.pi, 20, endpoint=False)
            ])
        palm = Part(f'{gid}_palm_{s[0]}', np.array(rows_arr), True, ['helper-tights'] * 5,
                    palm_p, rigid_joint=s + 'Hand', role='cuff', side=s[0])
        palm.is_arm = True
        parts.append(palm)
    return parts


def _build_back_straps(gid_b, back_anchor, strap_p):
    """Paired flat shoulder-harness loops anchoring a dorsal pack flush over the clavicles & chest."""
    return pack_straps(gid_b, strap_p)


# ===========================================================================================================
# 0. HYGIENE UPGRADES FOR EXISTING HISTORY MONK TIERS (`7 x 2 = 14` pieces)
# ===========================================================================================================
def _build_hygiene_upgrades(sex, body_id):
    """Build the 7 upgraded/missing base-tier & PC History Monk pieces for `sex`."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    ANKLE = core.ANKLE
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 0.1 `order_{sex}_novice_shirt` (`torso`): Extended saffron monastic shirt (`CROTCH + 0.04`)
    gid_ns = f'order_{sex}_novice_shirt'
    parts_ns = []
    placket_len = TOP - WAIST + 0.04
    shirt_p = P('osaffron', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.024, 'solid', 'omaroon'),
    ], [
        PN(0.45, 0.55, 'saffron_kesa', 'gold', 'omaroon', 0.10, down=placket_len),
        PN(0.43, 0.45, 'solid', 'omaroon', 'osaffron', 1.0, down=placket_len),
        PN(0.55, 0.57, 'solid', 'omaroon', 'osaffron', 1.0, down=placket_len),
    ], fabric=COTTON)
    parts_ns.append(torso_tube(gid_ns, TOP, CROTCH + 0.04, 0.014, shirt_p,
                               n=44, rows=16, hang_from=WAIST - 0.02, flare=0.04,
                               group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_ns.append(collar(gid_ns + '_collar',
                           P('omaroon', 0.04, [B('top', 0.0, 0.008, 'solid', 'osaffron')], fabric=COTTON),
                           height=0.028, flare=0.008, ease=0.020))
    sl_ns = P('osaffron', 0.04, [
        B('bottom', 0.0, 0.024, 'solid', 'omaroon'),
        B('bottom', 0.024, 0.045, 'saffron_kesa', 'gold', 'osaffron', 0.04),
    ], fabric=COTTON)
    parts_ns.extend(sleeves(gid_ns, 'elbow', 0.017, sl_ns, ease_end=0.026, rows=6))
    sash_ns = P('omaroon', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.010, 'solid', 'osaffron'),
    ], fabric=WOOL)
    parts_ns.append(torso_tube(gid_ns + '_sash', WAIST + 0.035, WAIST - 0.030, 0.020, sash_ns,
                               rows=4, n=40, hull_from=WAIST + 0.08, role='band'))
    entries.append(assemble_garment(gid_ns, "Novice's Saffron Monastic Shirt", 'torso', 'historians', parts_ns))

    # 0.2 `order_{sex}_elder_trousers` (`legs`, `legged=True`): Warm `omaroon` wool under-trousers
    gid_et = f'order_{sex}_elder_trousers'
    trou_et = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.022, 0.060, 'saffron_kesa', 'gold', 'osaffron', 0.045),
        B('top', 0.0, 0.025, 'solid', 'osaffron'),
    ], fabric=WOOL)
    entries.append(assemble_garment(
        gid_et, "Elder's Maroon Wool Under-Trousers", 'legs', 'historians',
        trousers(gid_et, trou_et, ease=0.014, ease_end=0.016, cuff=ANKLE + 0.055),
        legged=True
    ))

    # 0.3 `order_{sex}_servant_boots` (`feet`): Oidong felt-and-leather boots
    gid_sb = f'order_{sex}_servant_boots'
    sole_sb = P('yakbrown', 0.06, [B('top', 0.0, 0.012, 'solid', 'leather')], fabric='leather.polished')
    upper_sb = P('omaroon', 0.05, [
        B('top', 0.0, 0.038, 'stripes', 'orderblue', 'osaffron', 0.016),
        B('bottom', 0.0, 0.035, 'solid', 'yakbrown'),
    ], [
        PN(0.40, 0.60, 'cholet_pangden', 'osaffron', 'orderblue', 0.06),
    ], fabric='cloth.felt.boiled')
    entries.append(assemble_garment(
        gid_sb, 'Oidong Lower-Ward Felt & Leather Boots', 'feet', 'historians',
        boots(gid_sb, sole_sb, upper_sb, top=0.50, ease_top=0.030)
    ))

    # 0.3b `order_{sex}_monk_robe`, `order_{sex}_elder_robe`, `order_{sex}_elder_hat` (Seamless Monastic Shoulder Pass)
    gid_mr = f'order_{sex}_monk_robe'
    parts_mr = []
    mr_p = P('osaffron', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.025, 'solid', 'omaroon'),
        B('bottom', 0.025, 0.068, 'saffron_kesa', 'gold', 'osaffron', 0.06),
    ], [
        PN(0.44, 0.56, 'saffron_kesa', 'gold', 'omaroon', 0.14, down=0.42),
        PN(0.42, 0.44, 'solid', 'omaroon', 'osaffron', 1.0, down=0.42),
        PN(0.56, 0.58, 'solid', 'omaroon', 'osaffron', 1.0, down=0.42),
    ], fabric=COTTON)
    mr_sl = P('osaffron', 0.04, [
        B('bottom', 0.0, 0.024, 'solid', 'omaroon'),
        B('bottom', 0.024, 0.056, 'saffron_kesa', 'gold', 'osaffron', 0.045),
    ], fabric=COTTON)
    parts_mr.append(torso_tube(gid_mr, TOP, ANKLE + 0.05, 0.016, mr_p,
                               n=48, rows=22, hang_from=WAIST - 0.03, flare=0.16,
                               group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_mr.append(collar(gid_mr + '_collar',
                           P('omaroon', 0.04, [B('top', 0.0, 0.008, 'solid', 'osaffron')], fabric=COTTON),
                           height=0.028, flare=0.008, ease=0.020))
    parts_mr.append(torso_tube(gid_mr + '_sash', WAIST + 0.035, WAIST - 0.030, 0.020,
                               P('omaroon', 0.03, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                                   B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric=WOOL),
                               rows=4, n=42, hull_from=WAIST + 0.08, role='band'))
    parts_mr.extend(sleeves(gid_mr, 'wrist', 0.016, mr_sl, ease_end=0.052, rows=10))
    entries.append(assemble_garment(gid_mr, "Monk's saffron robe", 'torso', 'historians', parts_mr))

    gid_er = f'order_{sex}_elder_robe'
    parts_er = []
    er_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.0, 0.028, 'solid', 'osaffron'),
        B('bottom', 0.028, 0.075, 'saffron_kesa', 'gold', 'omaroon', 0.07),
    ], [
        PN(0.43, 0.57, 'saffron_kesa', 'gold', 'osaffron', 0.14, down=0.44),
        PN(0.41, 0.43, 'solid', 'gold', 'omaroon', 1.0, down=0.44),
        PN(0.57, 0.59, 'solid', 'gold', 'omaroon', 1.0, down=0.44),
    ], fabric=WOOL)
    er_zen = P('osaffron', 0.04, [
        B('top', 0.0, 0.016, 'solid', 'gold'),
        B('bottom', 0.0, 0.016, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'saffron_kesa', 'gold', 'osaffron', 0.09)], fabric=COTTON)
    er_sl = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.028, 'solid', 'osaffron'),
        B('bottom', 0.028, 0.055, 'solid', 'gold'),
    ], fabric=WOOL)
    parts_er.append(torso_tube(gid_er, TOP, ANKLE + 0.05, 0.016, er_p,
                               n=48, rows=22, hang_from=WAIST - 0.03, flare=0.16,
                               group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_er.append(collar(gid_er + '_collar',
                           P('osaffron', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric=WOOL),
                           height=0.030, flare=0.008, ease=0.020))
    parts_er.append(band(gid_er + '_zen', WAIST + 0.01, TOP - 0.022, 0.105, 0.022,
                         er_zen, high=math.pi * 0.48, rows=6))
    parts_er.append(torso_tube(gid_er + '_sash', WAIST + 0.035, WAIST - 0.030, 0.021,
                               P('osaffron', 0.03, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                                    B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric=COTTON),
                               rows=4, n=42, hull_from=WAIST + 0.08, role='band'))
    parts_er.extend(sleeves(gid_er, 'wrist', 0.016, er_sl, ease_end=0.056, rows=10))
    entries.append(assemble_garment(gid_er, "Elder's robe and shawl", 'torso', 'historians', parts_er))

    # 0.4 `order_{sex}_agent_cowl` (`head`): HM-10 Keepwell Field Operative road hood
    gid_ac = f'order_{sex}_agent_cowl'
    parts_ac = []
    cowl_p = P('orderblue', 0.04, [
        B('top', 0.0, 0.024, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.032, 'solid', 'omaroon'),
    ], [
        PN(0.0, 0.14, 'saffron_kesa', 'osaffron', 'omaroon', 0.05),
        PN(0.86, 1.0, 'saffron_kesa', 'osaffron', 'omaroon', 0.05),
        PN(0.36, 0.64, 'diamond_quilt', 'indigo', 'orderblue', 0.10),
    ], fabric=WOOL)
    ac_hood = hood(gid_ac + '_hood', cowl_p, ease=0.032, ease_low=0.050,
                   open_front=0.90, low=-0.52, rows=14, n=34, peak=0.04, high=1.02)
    parts_ac.append(ac_hood)
    # Seat `_wheel_pin` directly onto the actual front brow peak of `ac_hood.P` (zero air gap!)
    V_ah = ac_hood.P.reshape(-1, 3)
    front_ah = V_ah[(np.abs(V_ah[:, 0]) <= 0.025) & (V_ah[:, 1] < float(a[1]) - 0.04) & (V_ah[:, 2] > float(a[2]) + 0.08)]
    if len(front_ah):
        brow_rim_pt = front_ah[int(np.argmin(front_ah[:, 2]))]
        target_pin = brow_rim_pt + up * 0.016
        pin_pos = V_ah[int(np.argmin(np.linalg.norm(V_ah - target_pin[None, :], axis=1)))] - bk * 0.002
    else:
        c_pin = a + (b - a) * (f_brow + 0.08)
        pin_pos = c_pin - bk * ((first_hit(c_pin, -bk) or 0.100) + 0.030)
    parts_ac.append(rosette(
        gid_ac + '_wheel_pin', pin_pos, -bk, left, 0.022,
        P('bronze', 0.02, [B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'bronze', 0.035)],
          fabric='metal.bronze'),
        n=12, thick=0.009, rigid_joint='Head'
    ))
    entries.append(assemble_garment(
        gid_ac, 'Keepwell Field Operative Road Hood', 'head', 'historians', parts_ac,
        covers_hair=True, covers_face=False
    ))

    # 0.5 `order_{sex}_agent_coat` (`torso`): Upgraded knee-length HM-10 Keepwell quilted road coat
    gid_at = f'order_{sex}_agent_coat'
    parts_at = []
    coat_at = P('orderblue', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.028, 'solid', 'omaroon'),
        B('bottom', 0.028, 0.066, 'saffron_kesa', 'osaffron', 'omaroon', 0.06),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'indigo', 'orderblue', 0.14),
        PN(0.43, 0.47, 'saffron_kesa', 'osaffron', 'omaroon', 0.08),
        PN(0.53, 0.57, 'saffron_kesa', 'osaffron', 'omaroon', 0.08),
        PN(0.47, 0.53, 'solid', 'omaroon', 'indigo', 1.0, down=TOP - WAIST + 0.04),
    ], fabric='cloth.quilted.diamond')
    parts_at.append(torso_tube(gid_at, TOP, KNEE + 0.02, 0.018, coat_at,
                               n=48, rows=20, hang_from=WAIST - 0.02, flare=0.12,
                               group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_at.append(stand_collar(
        gid_at, P('omaroon', 0.04, [B('top', 0.0, 0.010, 'solid', 'osaffron'),
                                    B('bottom', 0.0, 0.010, 'solid', 'bronze')], fabric=WOOL),
        high=0.036
    ))
    sh_at = P('leather', 0.04, [
        B('bottom', 0.0, 0.022, 'solid', 'bronze'),
        B('top', 0.0, 0.018, 'solid', 'omaroon'),
    ], fabric='leather.polished')
    parts_at.append(pauldron(gid_at + '_pauldron_L', L, sh_at, reach=0.34, ease=0.024, flare_end=0.98))
    parts_at.append(pauldron(gid_at + '_pauldron_R', R, sh_at, reach=0.34, ease=0.024, flare_end=0.98))
    sl_at = P('orderblue', 0.04, [
        B('bottom', 0.0, 0.030, 'solid', 'omaroon'),
        B('bottom', 0.030, 0.056, 'saffron_kesa', 'osaffron', 'omaroon', 0.045),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'indigo', 'orderblue', 0.11),
    ], fabric='cloth.quilted.diamond')
    parts_at.extend(sleeves(gid_at, 'wrist', 0.018, sl_at, ease_end=0.026, rows=9))
    belt_at = P('omaroon', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.010, 'solid', 'bronze'),
    ], [
        PN(0.46, 0.54, 'procrastinator_wheel', 'bronze', 'omaroon', 0.05),
    ], fabric=WOOL)
    pouch_at = P('saddle', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'bronze'),
        B('bottom', 0.0, 0.014, 'solid', 'omaroon'),
    ], fabric='leather.polished')
    parts_at.extend(pouch_belt(gid_at, belt_at, pouch_at, ease=0.022))
    entries.append(assemble_garment(
        gid_at, 'Keepwell Field Operative Quilted Road Coat', 'torso', 'historians', parts_at
    ))

    # 0.6 `order_{sex}_agent_pack` (`back`): Keepwell leather field pack, scroll tube & detector cylinder
    gid_ap = f'order_{sex}_agent_pack'
    parts_ap = []
    back_ap = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    pack_c = back_ap + d_bk * 0.016
    pack_ap_p = P('saddle', 0.04, [
        B('top', 0.0, 0.035, 'solid', 'leather'),
        B('bottom', 0.0, 0.028, 'solid', 'leather'),
    ], [
        PN(0.20, 0.26, 'solid', 'omaroon', 'saddle', 1.0),
        PN(0.74, 0.80, 'solid', 'omaroon', 'saddle', 1.0),
    ], fabric='leather.polished')
    parts_ap.append(blob(gid_ap + '_pack', pack_c, (0.22, 0.11, 0.27), pack_ap_p,
                         n=16, rows=7, out=d_bk, rigid_joint='Spine2'))
    parts_ap.append(blob(gid_ap + '_flap', pack_c + np.array([0.0, 0.006, 0.112]), (0.21, 0.11, 0.075),
                         P('leather', 0.04, [B('bottom', 0.0, 0.016, 'solid', 'bronze')], fabric='leather.polished'),
                         n=14, rows=5, out=d_bk, rigid_joint='Spine2'))
    scr_c = pack_c + np.array([0.0, 0.018, 0.155])
    scr_p = P('omaroon', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'bronze'),
        B('bottom', 0.0, 0.022, 'solid', 'bronze'),
    ], [PN(0.0, 1.0, 'longsong_glyph', 'gold', 'omaroon', 0.06)], fabric='leather.polished')
    parts_ap.append(tube(gid_ap + '_scroll_tube',
                         [scr_c - np.array([0.125, 0.0, 0.0]), scr_c + np.array([0.125, 0.0, 0.0])],
                         0.026, scr_p, n=12, rigid_joint='Spine2'))
    parts_ap.append(rosette(gid_ap + '_wax_seal', scr_c + np.array([0.0, 0.025, 0.0]), d_bk,
                            np.array([1.0, 0.0, 0.0]), 0.018,
                            P('holyred', 0.02, fabric='leather.polished'), n=10, thick=0.007, rigid_joint='Spine2'))
    det_c = pack_c + np.array([-0.115, 0.018, -0.010])
    det_p = P('bronze', 0.02, [
        B('top', 0.0, 0.020, 'solid', 'slate'),
        B('bottom', 0.0, 0.020, 'solid', 'slate'),
    ], [PN(0.0, 1.0, 'procrastinator_wheel', 'godteal', 'bronze', 0.06)], fabric='metal.bronze')
    parts_ap.append(tube(gid_ap + '_anomaly_detector',
                         [det_c + np.array([0.0, 0.0, 0.088]), det_c - np.array([0.0, 0.0, 0.088])],
                         0.028, det_p, n=14, rigid_joint='Spine2'))
    parts_ap.append(rosette(gid_ap + '_detector_dial', det_c + np.array([0.0, 0.026, 0.040]), d_bk,
                            np.array([1.0, 0.0, 0.0]), 0.018,
                            P('godteal', 0.02, [B('bottom', 0.0, 0.006, 'solid', 'bronze')],
                              fabric='glass.moonglass.leaded'),
                            n=10, thick=0.006, rigid_joint='Spine2'))
    parts_ap.extend(_build_back_straps(gid_ap, back_ap, P('leather', 0.04, fabric='leather.polished')))
    entries.append(assemble_garment(
        gid_ap, 'Keepwell Operative Field Pack & Anomaly Detector', 'back', 'historians', parts_ap
    ))

    # 0.7 `order_{sex}_pc_lancer_pack` (`back`): Dorsal RC-6 Relic-Lancer stasis capacitor pack
    gid_lp = f'order_{sex}_pc_lancer_pack'
    parts_lp = []
    back_lp = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    chas_c = back_lp + d_bk * 0.014
    lead_p = P('slate', 0.03, [
        B('top', 0.0, 0.025, 'solid', 'bronze'),
        B('bottom', 0.0, 0.025, 'solid', 'bronze'),
    ], [PN(0.15, 0.85, 'lorica_lames', 'iron', 'slate', 0.08)], fabric='cloth.lead.oiled')
    parts_lp.append(blob(gid_lp + '_chassis', chas_c, (0.22, 0.075, 0.26), lead_p,
                         n=14, rows=6, out=d_bk, rigid_joint='Spine2'))
    manifold_p = P('bronze', 0.02, [
        B('top', 0.0, 0.015, 'solid', 'gold'),
        B('bottom', 0.0, 0.015, 'solid', 'slate'),
    ], [PN(0.0, 1.0, 'procrastinator_wheel', 'godteal', 'bronze', 0.06)], fabric='metal.bronze')
    for tag_m, dz_m in (('top', 0.105), ('bot', -0.105)):
        mc = back_lp + np.array([0.0, 0.040, dz_m])
        parts_lp.append(tube(f'{gid_lp}_manifold_{tag_m}',
                             [mc - np.array([0.105, 0.0, 0.0]), mc + np.array([0.105, 0.0, 0.0])],
                             0.020, manifold_p, n=12, rigid_joint='Spine2'))
    coil_p = P('bronze', 0.02, [
        B('top', 0.0, 0.028, 'solid', 'slate'),
        B('bottom', 0.0, 0.028, 'solid', 'slate'),
    ], [
        PN(0.0, 1.0, 'procrastinator_wheel', 'godteal', 'bronze', 0.07),
    ], fabric='metal.bronze')
    for sd, tag_c in ((-1.0, 'R'), (1.0, 'L')):
        cc = back_lp + np.array([sd * 0.086, 0.044, 0.0])
        parts_lp.append(tube(f'{gid_lp}_stasis_coil_{tag_c}',
                             [cc + np.array([0.0, 0.0, 0.135]), cc - np.array([0.0, 0.0, 0.135])],
                             0.035, coil_p, n=14, rigid_joint='Spine2'))
    core_c = back_lp + np.array([0.0, 0.048, 0.0])
    core_p = P('godteal', 0.02, [
        B('top', 0.0, 0.025, 'solid', 'bronze'),
        B('bottom', 0.0, 0.025, 'solid', 'bronze'),
    ], [PN(0.0, 1.0, 'stripes', 'cybercyan', 'godteal', 0.025)], fabric='glass.moonglass.leaded')
    parts_lp.append(tube(gid_lp + '_stasis_core',
                         [core_c + np.array([0.0, 0.0, 0.115]), core_c - np.array([0.0, 0.0, 0.115])],
                         0.030, core_p, n=14, rigid_joint='Spine2'))
    parts_lp.append(rosette(gid_lp + '_core_bezel', core_c + d_bk * 0.030, d_bk,
                            np.array([1.0, 0.0, 0.0]), 0.032, manifold_p,
                            n=14, thick=0.010, rigid_joint='Spine2'))
    parts_lp.extend(_build_back_straps(gid_lp, back_lp, P('slate', 0.03, fabric='cloth.lead.oiled')))
    e_lp = assemble_garment(
        gid_lp, 'Order Relic-Lancer Dorsal Stasis Capacitor Pack', 'back', 'historians', parts_lp
    )
    e_lp['type'] = 'pc'
    entries.append(e_lp)

    return entries


# ===========================================================================================================
# 1. ABBOT-CHRONICLER — `HM-01` Longsong Abbot-Chronicler & `HM-03` Qiblai Saffron Prismarch (`4 x 2 = 8`)
# ===========================================================================================================
def _build_abbot_chronicler(sex, body_id):
    """HM-01 Longsong Abbot-Chronicler & HM-03 Qiblai Saffron Prismarch (`order_m/f_abbot_*`)."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    ANKLE = core.ANKLE
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 1.1 `order_{sex}_abbot_mitre` (`head`): Tall crested golden Pandit-Mitre
    gid_h = f'order_{sex}_abbot_mitre'
    parts_h = []
    mitre_p = P('osaffron', 0.03, [
        B('bottom', 0.0, 0.022, 'solid', 'omaroon'),
        B('top', 0.0, 0.028, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'saffron_kesa', 'gold', 'osaffron', 0.09),
    ], fabric='cloth.silk')
    dome_pt = head_rings(gid_h + '_mitre_dome', 0.46, 1.08, 0.020, mitre_p, n=36, rows=9, apex=True)
    dome_pt.rigid_joint = 'Head'
    parts_h.append(dome_pt)

    band_p = P('omaroon', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'saffron_kesa', 'gold', 'omaroon', 0.055),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_mitre_band', band_p, f0=0.48, f1=0.74,
                              ease=0.023, flare=0.010, rows=6, n=38))

    # Sweeping sagittal `gold`/`kesar` fringe `horn` crest over the crown
    c_top = a + (b - a) * f_crown
    crest_pts = [
        c_top - bk * 0.095 - up * 0.010,
        c_top - bk * 0.045 + up * 0.068,
        c_top + bk * 0.015 + up * 0.105,
        c_top + bk * 0.085 + up * 0.072,
        c_top + bk * 0.135 + up * 0.005,
    ]
    crest_p = P('gold', 0.04, [
        B('top', 0.0, 0.50, 'stripes', 'kesar', 'gold', 0.012),
        B('bottom', 0.0, 0.02, 'solid', 'omaroon'),
    ], fabric='cloth.silk')
    parts_h.append(horn(gid_h + '_pandit_crest', crest_pts, 0.036, 0.014, crest_p,
                        n=12, rows=14, rigid_joint='Head'))

    # Hourglass-in-Wheel brow reliquary `rosette`
    c_br = a + (b - a) * f_brow
    h_br = first_hit(c_br, -bk) or 0.104
    rel_pos = c_br - bk * (h_br + 0.032)
    parts_h.append(rosette(
        gid_h + '_brow_reliquary', rel_pos, -bk, left, 0.034,
        P('gold', 0.02, [B('top', 0.0, 0.50, 'procrastinator_wheel', 'godteal', 'gold', 0.04)],
          fabric='metal.gold'),
        n=16, thick=0.013, rigid_joint='Head'
    ))
    entries.append(assemble_garment(
        gid_h, 'Longsong Abbot-Chronicler Crested Pandit-Mitre', 'head', 'historians', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 1.2 `order_{sex}_abbot_robe` (`torso`): Floor-length kesa & mandala vestment + 7-Seal chain + hip wheel
    gid_t = f'order_{sex}_abbot_robe'
    parts_t = []
    robe_p = P('omaroon', 0.03, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.030, 'solid', 'gold'),
        B('bottom', 0.030, 0.115, 'saffron_kesa', 'gold', 'osaffron', 0.09),
        B('bottom', 0.115, 0.135, 'solid', 'orderblue'),
    ], [
        PN(0.10, 0.36, 'saffron_kesa', 'gold', 'osaffron', 0.18),
        PN(0.64, 0.90, 'saffron_kesa', 'gold', 'osaffron', 0.18),
        PN(0.36, 0.39, 'solid', 'gold', 'omaroon', 1.0),
        PN(0.61, 0.64, 'solid', 'gold', 'omaroon', 1.0),
        PN(0.39, 0.61, 'longsong_mandala', 'gold', 'omaroon', 0.24),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t, TOP, ANKLE + 0.04, 0.016, robe_p,
                              n=50, rows=24, hang_from=WAIST - 0.02, flare=0.20,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    cloud_p = P('orderblue', 0.03, [
        B('bottom', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.024, 0.068, 'saffron_kesa', 'gold', 'osaffron', 0.05),
        B('top', 0.0, 0.018, 'solid', 'gold'),
    ], fabric='cloth.silk')
    parts_t.append(collar_disc(gid_t + '_cloud_collar', 0.084, cloud_p,
                               drop=0.072, rows=6, n=46, scallop=0.07, ease=0.019))

    sl_p = P('osaffron', 0.03, [
        B('bottom', 0.0, 0.032, 'solid', 'gold'),
        B('bottom', 0.032, 0.120, 'saffron_kesa', 'gold', 'omaroon', 0.08),
        B('top', 0.0, 0.050, 'solid', 'omaroon'),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.019, sl_p, ease_end=0.056, rows=10, wide=True))

    sash_p = P('orderblue', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'longsong_glyph', 'gold', 'orderblue', 0.05)], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.038, WAIST - 0.034, 0.020, sash_p,
                              rows=5, n=44, hull_from=WAIST + 0.08, role='band'))

    # Continuous chest chain + 7 gilded Longsong Seal medallions
    gold_p = P('gold', 0.02, [B('top', 0.0, 0.006, 'solid', 'kesar')], fabric='metal.gold')
    z_neck_ch = TOP - 0.018
    w_loop_ch = 0.096
    drop_ch = 0.145
    parts_t.extend(_build_chest_chain(f'{gid_t}_seal_chain', z_neck_ch, w_loop_ch, drop_ch,
                                      0.020, gold_p, n_links=35))
    seal_p = P('gold', 0.02, [
        B('top', 0.0, 0.45, 'procrastinator_wheel', 'godteal', 'gold', 0.035),
    ], fabric='metal.gold')
    for idx_m in range(7):
        u_m = 0.10 + 0.80 * (idx_m / 6.0)
        ang_m = (u_m - 0.5) * 0.94 * math.pi
        bx_m = math.sin(ang_m) * w_loop_ch
        bz_m = z_neck_ch - math.cos(ang_m) * drop_ch
        m_pos = chest_front(bz_m, 0.026, x=bx_m)
        r_m = 0.024 if idx_m == 3 else 0.019
        parts_t.append(rosette(f'{gid_t}_longsong_seal_{idx_m}', m_pos, FRONT,
                               np.array([1.0, 0.0, 0.0]), r_m, seal_p,
                               n=12, thick=0.008, rigid_joint='Spine2'))

    # Hip-mounted `procrastinator_wheel` bronze wheel connected to `orderblue` sash by 3D gold bracket (0.025 ease)
    d_hip = np.array([-0.78, -0.62, 0.0])
    d_hip /= np.linalg.norm(d_hip)
    p_sash_att = surface_out(spine_at(WAIST + 0.004), d_hip, 0.018, bvh=core.BVH_T)
    p_hip_whl = surface_out(spine_at(WAIST + 0.004), d_hip, 0.025, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_wheel_bracket',
                        [p_sash_att, p_hip_whl + d_hip * 0.008],
                        0.009, gold_p, n=8, rigid_joint='Hips'))
    wheel_p = P('bronze', 0.02, [
        B('top', 0.0, 0.014, 'solid', 'gold'),
        B('bottom', 0.0, 0.014, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'procrastinator_wheel', 'godteal', 'bronze', 0.06),
    ], fabric='metal.bronze')
    parts_t.append(tube(gid_t + '_hip_wheel',
                        [p_hip_whl + np.array([0.0, 0.0, 0.044]), p_hip_whl - np.array([0.0, 0.0, 0.044])],
                        0.025, wheel_p, n=16, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_wheel_finial', p_hip_whl + np.array([0.0, 0.0, 0.052]),
                        (0.028, 0.028, 0.032), gold_p, n=10, rows=4,
                        out=np.array([0.0, 0.0, 1.0]), rigid_joint='Hips'))
    entries.append(assemble_garment(
        gid_t, 'Abbot-Chronicler Kesa Vestment & Seven-Seal Chain', 'torso', 'historians', parts_t
    ))

    # 1.3 `order_{sex}_abbot_stave` (`back`): Diagonal 6-ringed Khakkhara crozier staff & gilded sutra box
    gid_b = f'order_{sex}_abbot_stave'
    parts_b = []
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    sutra_c = back_b + d_bk * 0.015
    sutra_p = P('omaroon', 0.03, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.024, 'solid', 'gold'),
    ], [
        PN(0.16, 0.84, 'longsong_thangka', 'gold', 'omaroon', 0.16),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_sutra_box', sutra_c, (0.24, 0.095, 0.18), sutra_p,
                        n=16, rows=6, out=d_bk, rigid_joint='Spine2'))

    st_bot = sutra_c + np.array([0.135, 0.045, -0.23])
    st_top = sutra_c + np.array([-0.145, 0.048, 0.28])
    shaft_p = P('omaroon', 0.03, [
        B('top', 0.0, 0.06, 'solid', 'brass'),
        B('bottom', 0.0, 0.05, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'stripes', 'gold', 'omaroon', 0.08)], fabric='metal.gold')
    parts_b.append(tube(gid_b + '_khakkhara_shaft', [st_top, st_bot], 0.013, shaft_p,
                        n=10, rigid_joint='Spine2'))

    st_dir = (st_top - st_bot) / np.linalg.norm(st_top - st_bot)
    fin_c = st_top + st_dir * 0.058
    parts_b.append(blob(gid_b + '_quartz_core', fin_c, (0.036, 0.028, 0.046),
                        P('godteal', 0.02, [B('bottom', 0.0, 0.012, 'solid', 'gold')],
                          fabric='glass.moonglass.leaded'),
                        n=12, rows=5, out=d_bk, rigid_joint='Spine2'))
    loop_pts = [
        fin_c + np.array([math.cos(an) * 0.056, 0.0, math.sin(an) * 0.064])
        for an in np.linspace(0, 2 * math.pi, 15)
    ]
    parts_b.append(horn(gid_b + '_finial_loop', loop_pts, 0.0075, 0.0075,
                        P('brass', 0.02, fabric='metal.gold'), n=8, rows=15, rigid_joint='Spine2'))
    # 6 jingling gold rings (3 on each side of the Khakkhara head)
    for idx_r, an_r in enumerate((-0.25, 0.0, 0.25, math.pi - 0.25, math.pi, math.pi + 0.25)):
        r_pos = fin_c + np.array([math.cos(an_r) * 0.058, 0.0, math.sin(an_r) * 0.058 - 0.014])
        parts_b.append(blob(f'{gid_b}_jingle_ring_{idx_r}', r_pos, (0.024, 0.009, 0.028),
                            gold_p, n=10, rows=4, out=d_bk, rigid_joint='Spine2'))
    parts_b.extend(_build_back_straps(gid_b, back_b, P('omaroon', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric=WOOL)))
    entries.append(assemble_garment(
        gid_b, 'Abbot-Chronicler Six-Ringed Khakkhara Crozier & Sutra Box', 'back', 'historians', parts_b
    ))

    # 1.4 `order_{sex}_abbot_boots` (`feet`): Ceremonial upturned monastic boots
    gid_f = f'order_{sex}_abbot_boots'
    sole_f = P('gold', 0.03, [B('top', 0.0, 0.012, 'solid', 'orderblue')], fabric='metal.gold')
    upper_f = P('omaroon', 0.04, [
        B('top', 0.0, 0.042, 'saffron_kesa', 'gold', 'osaffron', 0.035),
        B('bottom', 0.0, 0.032, 'solid', 'orderblue'),
    ], [
        PN(0.38, 0.62, 'longsong_mandala', 'gold', 'orderblue', 0.09),
    ], fabric='leather.polished')
    entries.append(assemble_garment(
        gid_f, 'Abbot-Chronicler Ceremonial Upturned Monastic Boots', 'feet', 'historians',
        boots(gid_f, sole_f, upper_f, top=0.52, ease_top=0.032)
    ))

    return entries


# ===========================================================================================================
# 2. PRINTER-ARTISAN — `HM-01` Sprin-Zam Movable-Type Printer, Paper Miller & Lens-Grinder (`4 x 2 = 8`)
# ===========================================================================================================
def _build_printer_artisan(sex, body_id):
    """HM-01 Sprin-Zam Movable-Type Printer, Chalice-Paper Miller & Lens-Grinder (`order_m/f_printer_*`)."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 2.1 `order_{sex}_printer_cap` (`head`, `covers_hair=False`, `covers_face=False`)
    gid_h = f'order_{sex}_printer_cap'
    parts_h = []
    cap_p = P('cream', 0.04, [
        B('bottom', 0.0, 0.028, 'longsong_glyph', 'orderblue', 'cream', 0.055),
        B('top', 0.0, 0.014, 'solid', 'orderblue'),
    ], [
        PN(0.22, 0.28, 'solid', 'ivory', 'cream', 1.0),
        PN(0.72, 0.78, 'solid', 'ivory', 'cream', 1.0),
    ], fabric=COTTON)
    parts_h.append(tower_hat(
        gid_h + '_boxcap', 0.096,
        lambda s: (1.0 + 0.045 * s),
        cap_p, f=max(0.56, f_brow), ease=0.015, rows=8, n=40
    ))

    # Nose-seated brass spectacles + swing-down quartz magnification loupe & temple arms to the ears
    brass_p = P('brass', 0.02, fabric='metal.bronze')
    loupe_lens_p = P('godteal', 0.02, [B('top', 0.0, 0.010, 'solid', 'brass'),
                                       B('bottom', 0.0, 0.010, 'solid', 'brass')],
                     fabric='glass.moonglass.leaded')
    c_ey = a + (b - a) * f_eyes
    c_nb = a + (b - a) * (f_eyes - 0.008)
    h_nb = first_hit(c_nb, -bk) or 0.110
    c_bar = a + (b - a) * max(0.56, f_brow)
    h_bar = first_hit(c_bar, -bk) or 0.104
    lens_inners = {}
    for sd, tag_l, rad_x in ((-1.0, 'R', 0.033), (1.0, 'L', 0.031)):
        p_sock = c_ey + left * (sd * 0.031)
        h_sock = first_hit(p_sock, -bk) or (h_nb - 0.016)
        d_lens = max(h_sock + 0.009, h_nb - 0.004)
        lens_pos = p_sock - bk * d_lens
        lens_inners[tag_l] = lens_pos - left * (sd * 0.014)
        parts_h.append(rosette(f'{gid_h}_spec_rim_{tag_l}', lens_pos, -bk, left, rad_x * 0.52,
                               brass_p, n=14, thick=0.005, rigid_joint='Head'))
        parts_h.append(blob(f'{gid_h}_loupe_lens_{tag_l}', lens_pos - bk * 0.001, (rad_x, 0.009, rad_x),
                            loupe_lens_p, n=14, rows=5, out=-bk, rigid_joint='Head'))
        # Stepped swing-down jeweler's loupe barrel on the right lens, connected to the cap brim via hinge arm
        if tag_l == 'R':
            parts_h.append(tube(f'{gid_h}_loupe_barrel', [lens_pos + bk * 0.002, lens_pos - bk * 0.014],
                                0.014, brass_p, n=12, rigid_joint='Head'))
            parts_h.append(rosette(f'{gid_h}_loupe_front', lens_pos - bk * 0.015, -bk, left, 0.014,
                                   loupe_lens_p, n=12, thick=0.004, rigid_joint='Head'))
            piv_cap = c_bar + left * (sd * 0.032) - bk * (h_bar + 0.014)
            parts_h.append(tube(f'{gid_h}_loupe_arm_{tag_l}', [piv_cap, lens_pos + up * 0.015 - bk * 0.004],
                                0.0035, brass_p, n=8, rigid_joint='Head'))
        # Brass temple arms running back along the temples onto the ears
        p_outer = lens_pos + left * (sd * 0.017)
        c_ear_p = a + (b - a) * (f_eyes - 0.02)
        h_tmp = first_hit(c_ear_p - bk * 0.02, left * sd) or 0.078
        p_mid_t = 0.5 * (p_outer + (c_ear_p + left * (sd * (h_tmp + 0.003)) - bk * 0.024)) + left * (sd * 0.004)
        p_ear = c_ear_p + left * (sd * (h_tmp + 0.002)) + bk * 0.006
        parts_h.append(horn(f'{gid_h}_temple_{tag_l}', [p_outer, p_mid_t, p_ear],
                            0.0030, 0.0026, brass_p, n=6, rows=5, rigid_joint='Head'))
    # Curved brass saddle-bridge resting flush on the nasal bone (`h_nb + 0.0015`)
    br_saddle = c_nb + up * 0.004 - bk * (h_nb + 0.0015)
    parts_h.append(horn(gid_h + '_nose_bridge', [lens_inners['R'], br_saddle, lens_inners['L']],
                        0.0034, 0.0034, brass_p, n=6, rows=5, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, "Sprin-Zam Printer's Paper Box-Cap & Optical Loupe", 'head', 'historians', parts_h,
        covers_hair=False, covers_face=False
    ))

    # 2.2 `order_{sex}_printer_apron` (`torso`): Saffron shirt, split indigo/leather apron, composing-sticks & ink-balls
    gid_t = f'order_{sex}_printer_apron'
    parts_t = []
    shirt_p = P('osaffron', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.022, 'solid', 'omaroon'),
    ], [
        PN(0.47, 0.53, 'solid', 'omaroon', 'osaffron', 1.0, down=0.28),
    ], fabric=COTTON)
    parts_t.append(torso_tube(gid_t + '_shirt', TOP, CROTCH + 0.03, 0.014, shirt_p,
                              n=46, rows=16, hang_from=WAIST - 0.02, flare=0.05,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    sl_p = P('osaffron', 0.04, [
        B('bottom', 0.0, 0.032, 'solid', 'cream'),
        B('bottom', 0.032, 0.048, 'solid', 'indigo'),
    ], fabric=COTTON)
    parts_t.extend(sleeves(gid_t, 'elbow', 0.017, sl_p, ease_end=0.025, rows=6))

    apron_p = P('indigo', 0.05, [
        B('top', 0.0, 0.045, 'solid', 'leather'),
        B('bottom', 0.0, 0.090, 'longsong_glyph', 'cream', 'soot', 0.08),
        B('bottom', 0.090, 0.105, 'solid', 'leather'),
    ], [
        PN(0.485, 0.515, 'solid', 'soot', 'indigo', 1.0),
        PN(0.12, 0.24, 'solid', 'soot', 'indigo', 0.22),
    ], fabric='cloth.canvas.oiled')
    parts_t.extend(tabard(gid_t + '_apron', KNEE + 0.04, CHEST + 0.01, apron_p,
                          width=0.28, ease=0.022, front=True, back=False))

    # Diagonal bandolier holding bronze movable-type composing-sticks (`tube`s at 0.023 ease)
    band_p = P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'bronze')], fabric='leather.polished')
    parts_t.append(band(gid_t + '_bandolier', WAIST + 0.01, SHOULDER - 0.015, 0.042, 0.022,
                        band_p, high=math.pi * 0.42, rows=4))
    stick_p = P('bronze', 0.02, [
        B('top', 0.0, 0.014, 'solid', 'soot'),
        B('bottom', 0.0, 0.014, 'solid', 'soot'),
    ], [PN(0.30, 0.70, 'longsong_glyph', 'silver', 'soot', 0.04)], fabric='metal.bronze')
    for idx_s, (z_off, x_off) in enumerate(((0.035, 0.048), (0.00, 0.010), (-0.035, -0.028))):
        st_pos = chest_front(CHEST + z_off, 0.023, x=x_off)
        parts_t.append(tube(
            f'{gid_t}_composing_stick_{idx_s}',
            [st_pos + np.array([0.012, 0.0, 0.042]), st_pos - np.array([0.012, 0.0, 0.042])],
            0.011, stick_p, n=10, rigid_joint='Spine2'
        ))

    # Conformed waist belt + two round `soot`/`leather` ink-dabber balls at 0.022 ease
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.030, WAIST - 0.035, 0.020, band_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    dab_ball_p = P('soot', 0.05, [B('top', 0.0, 0.018, 'solid', 'leather')], fabric='leather.buckskin')
    dab_hdl_p = P('leather', 0.04, [B('top', 0.0, 0.010, 'solid', 'bronze')], fabric='leather.polished')
    c_w = spine_at(WAIST - 0.022)
    for tag_d, d_vec in (('L', np.array([0.74, -0.67, 0.0])), ('R', np.array([-0.74, -0.67, 0.0]))):
        d_u = d_vec / np.linalg.norm(d_vec)
        p_ball = surface_out(c_w, d_u, 0.022, bvh=core.BVH_T)
        parts_t.append(blob(f'{gid_t}_ink_dabber_{tag_d}', p_ball - np.array([0.0, 0.0, 0.018]),
                            (0.056, 0.044, 0.056), dab_ball_p, n=12, rows=5, out=d_u, rigid_joint='Hips'))
        parts_t.append(tube(f'{gid_t}_dabber_hdl_{tag_d}',
                            [p_ball + np.array([0.0, 0.0, 0.032]), p_ball - np.array([0.0, 0.0, 0.005])],
                            0.009, dab_hdl_p, n=8, rigid_joint='Hips'))
    entries.append(assemble_garment(
        gid_t, "Sprin-Zam Printer's Ink-Apron, Composing-Sticks & Dabbers", 'torso', 'historians', parts_t
    ))

    # 2.3 `order_{sex}_printer_cuffs` (`gloves`): Waxed-cloth forearm cuffs & fingerless palm wraps
    gid_g = f'order_{sex}_printer_cuffs'
    cuff_g_p = P('indigo', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'leather'),
        B('bottom', 0.0, 0.024, 'longsong_glyph', 'cream', 'soot', 0.035),
    ], fabric='cloth.canvas.oiled')
    palm_g_p = P('soot', 0.05, [B('bottom', 0.0, 0.010, 'solid', 'leather')], fabric='leather.buckskin')
    e_g = assemble_garment(
        gid_g, "Sprin-Zam Printer's Waxed Ink-Guard Cuffs", 'gloves', 'historians',
        _build_cuff_palm_gloves(gid_g, cuff_g_p, palm_g_p)
    )
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # 2.4 `order_{sex}_printer_chase` (`back`): Locked iron/yakbrown type-chase frame & chalice-paper ream
    gid_b = f'order_{sex}_printer_chase'
    parts_b = []
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    chase_c = back_b + d_bk * 0.015
    chase_p = P('iron', 0.03, [
        B('top', 0.0, 0.028, 'solid', 'yakbrown'),
        B('bottom', 0.0, 0.028, 'solid', 'yakbrown'),
    ], [
        PN(0.0, 0.12, 'solid', 'yakbrown', 'iron', 1.0),
        PN(0.88, 1.0, 'solid', 'yakbrown', 'iron', 1.0),
        PN(0.14, 0.86, 'longsong_glyph', 'silver', 'soot', 0.065),
    ], fabric='metal.iron')
    parts_b.append(blob(gid_b + '_type_chase', chase_c, (0.25, 0.075, 0.30), chase_p,
                        n=16, rows=7, out=d_bk, rigid_joint='Spine2'))
    for tag_r, dz_r in (('top', 0.135), ('bot', -0.135)):
        rc = chase_c + np.array([0.0, 0.022, dz_r])
        parts_b.append(tube(f'{gid_b}_chase_bar_{tag_r}',
                            [rc - np.array([0.125, 0.0, 0.0]), rc + np.array([0.125, 0.0, 0.0])],
                            0.012, P('iron', 0.03, fabric='metal.iron'), n=8, rigid_joint='Spine2'))
    ream_c = chase_c + np.array([0.0, 0.044, -0.035])
    ream_p = P('cream', 0.03, [
        B('top', 0.0, 0.016, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.016, 'solid', 'omaroon'),
    ], [
        PN(0.24, 0.30, 'solid', 'omaroon', 'cream', 1.0),
        PN(0.70, 0.76, 'solid', 'omaroon', 'cream', 1.0),
        PN(0.32, 0.68, 'longsong_glyph', 'soot', 'cream', 0.07),
    ], fabric=COTTON)
    parts_b.append(blob(gid_b + '_paper_ream', ream_c, (0.20, 0.060, 0.18), ream_p,
                        n=14, rows=6, out=d_bk, rigid_joint='Spine2'))
    parts_b.extend(_build_back_straps(gid_b, back_b, P('leather', 0.04, fabric='leather.polished')))
    entries.append(assemble_garment(
        gid_b, 'Movable-Type Printing Chase Frame & Chalice-Paper Ream', 'back', 'historians', parts_b
    ))

    return entries


# ===========================================================================================================
# 3. OIDONG COURIER — `HM-01a` Oidong 9-Stage Relay Courier & `HM-06` Singing Gjar Watcher (`3 x 2 = 6`)
# ===========================================================================================================
def _build_oidong_courier(sex, body_id):
    """HM-01a Oidong 9-Stage Relay Courier & HM-06 Singing Gjar Crystal Watcher (`order_m/f_courier_*`)."""
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 3.1 `order_{sex}_courier_cap` (`head`, `covers_hair=True`, `covers_face=False`)
    gid_h = f'order_{sex}_courier_cap'
    parts_h = []
    cap_p = P('orderblue', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'osaffron'),
        B('bottom', 0.025, 0.050, 'diamonds', 'osaffron', 'omaroon', 0.04),
        B('top', 0.0, 0.020, 'solid', 'omaroon'),
    ], fabric=WOOL)
    parts_h.append(head_rings(gid_h + '_cap', 0.54, 1.04, 0.018, cap_p, n=36, rows=9, apex=True))

    # Wind-tight ear-flaps & nape guard overlapped 2.5cm inside `_cap` (`f=0.54..0.64`) for a zero-gap occipital seal
    flap_p = P('orderblue', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'osaffron'),
        B('top', 0.0, 0.014, 'solid', 'omaroon'),
    ], fabric=WOOL)
    fs_ef = np.linspace(max(0.08, f_nose - 0.16), 0.64, 8)
    angs_ef = np.linspace(-0.64 * math.pi, 0.64 * math.pi, 28)
    Ef_grid = []
    for k_e, f_v in enumerate(fs_ef):
        u_top = k_e / 7.0
        f_ray = max(f_v, 0.36)
        c_ray = a + (b - a) * f_ray
        c_cur = a + (b - a) * f_v
        # Taper upper rows (`f >= 0.54`) from 0.024 at jaw/neck to 0.0155 cleanly inside `_cap` (`ease=0.018`)!
        ef_ease = 0.0155 + 0.0095 * ((1.0 - u_top) ** 1.15)
        Ef_grid.append([
            pt + (c_cur - c_ray)
            for pt in ring_points(c_ray, bk, left, angs_ef, ef_ease,
                                  rmin=0.05, rmax=0.18)
        ])
    parts_h.append(Part(gid_h + '_earflaps', np.array(Ef_grid), False, ['body'] * len(fs_ef),
                        flap_p, rigid_joint='Head'))

    # `godteal` & `brass` quartz resonance tuning-fork badge dead-centered (`x = 0.0`) high on the cap brow
    c_fk = a + (b - a) * (f_brow + 0.24)
    c_fk = np.array([0.0, float(c_fk[1]), float(c_fk[2])], dtype=np.float64)
    d_fk = -bk.copy()
    d_fk[0] = 0.0
    d_fk /= np.linalg.norm(d_fk)
    h_fk = first_hit(c_fk, d_fk) or 0.100
    fk_base = c_fk + d_fk * (h_fk + 0.020)
    brass_p = P('brass', 0.02, fabric='metal.gold')
    quartz_p = P('godteal', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'brass')],
                 fabric='glass.moonglass.leaded')
    parts_h.append(tube(gid_h + '_fork_stem', [fk_base - up * 0.008, fk_base + up * 0.004], 0.005, brass_p,
                        n=8, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_fork_yoke', fk_base + up * 0.006, (0.022, 0.010, 0.010),
                        brass_p, n=10, rows=4, out=d_fk, rigid_joint='Head'))
    for sd_p, tag_p in ((-1.0, 'R'), (1.0, 'L')):
        p_off = fk_base + left * (sd_p * 0.007) + up * 0.008
        parts_h.append(tube(f'{gid_h}_fork_prong_{tag_p}', [p_off, p_off + up * 0.032],
                            0.004, quartz_p, n=8, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Oidong Relay Courier Wind-Cap & Resonance Fork', 'head', 'historians', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 3.2 `order_{sex}_courier_jacket` (`torso`): Hip-length quilted relay jacket, stage-bell & crystal cylinder
    gid_t = f'order_{sex}_courier_jacket'
    parts_t = []
    jkt_p = P('orderblue', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.024, 'solid', 'omaroon'),
        B('bottom', 0.024, 0.075, 'diamonds', 'osaffron', 'omaroon', 0.05),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'indigo', 'orderblue', 0.12),
        PN(0.36, 0.46, 'steps', 'osaffron', 'omaroon', 0.07, down=0.34),
        PN(0.54, 0.64, 'steps', 'osaffron', 'omaroon', 0.07, down=0.34),
        PN(0.46, 0.54, 'solid', 'omaroon', 'orderblue', 1.0),
    ], fabric='cloth.quilted.diamond')
    parts_t.append(torso_tube(gid_t, TOP, CROTCH + 0.02, 0.016, jkt_p,
                              n=46, rows=16, hang_from=WAIST - 0.02, flare=0.04,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(
        gid_t, P('omaroon', 0.04, [B('top', 0.0, 0.010, 'solid', 'osaffron')], fabric=WOOL),
        high=0.034
    ))
    sl_j = P('orderblue', 0.04, [
        B('bottom', 0.0, 0.028, 'solid', 'omaroon'),
        B('bottom', 0.028, 0.068, 'stripes', 'osaffron', 'orderblue', 0.018),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'indigo', 'orderblue', 0.10)], fabric='cloth.quilted.diamond')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_j, ease_end=0.020, rows=9))

    # `brass` stage-bell flush on the sternum (`blob` at 0.024 ease)
    bell_c = chest_front(CHEST + 0.005, 0.024, x=0.0)
    parts_t.append(blob(gid_t + '_stage_bell', bell_c, (0.038, 0.026, 0.044),
                        P('brass', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'omaroon')], fabric='metal.gold'),
                        n=12, rows=5, out=FRONT, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_bell_knot', chest_front(CHEST + 0.032, 0.022, x=0.0),
                        (0.022, 0.014, 0.020), P('osaffron', 0.04, fabric=COTTON),
                        n=8, rows=4, out=FRONT, rigid_joint='Spine2'))

    # Conformed sash + Singing Gjar crystal-resonance cylinder (`tube` at 0.023 ease + bracket)
    sash_j = P('osaffron', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.010, 'solid', 'omaroon'),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.035, WAIST - 0.032, 0.020, sash_j,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='band'))
    d_cyl = np.array([-0.80, -0.60, 0.0])
    d_cyl /= np.linalg.norm(d_cyl)
    p_sash_c = surface_out(spine_at(WAIST - 0.005), d_cyl, 0.018, bvh=core.BVH_T)
    p_cyl = surface_out(spine_at(WAIST - 0.005), d_cyl, 0.023, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_crystal_bracket', [p_sash_c, p_cyl + d_cyl * 0.006],
                        0.008, brass_p, n=8, rigid_joint='Hips'))
    cyl_p = P('godteal', 0.02, [
        B('top', 0.0, 0.018, 'solid', 'brass'),
        B('bottom', 0.0, 0.018, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'longsong_glyph', 'brass', 'godteal', 0.05)], fabric='glass.moonglass.leaded')
    parts_t.append(tube(gid_t + '_gjar_cylinder',
                        [p_cyl + np.array([0.0, 0.0, 0.048]), p_cyl - np.array([0.0, 0.0, 0.048])],
                        0.020, cyl_p, n=14, rigid_joint='Hips'))
    entries.append(assemble_garment(
        gid_t, 'Oidong 9-Stage Quilted Relay Jacket & Crystal Cylinder', 'torso', 'historians', parts_t
    ))

    # 3.3 `order_{sex}_courier_tubes` (`back`): Triple wax-sealed lacquer dispatch-tube quiver
    gid_b = f'order_{sex}_courier_tubes'
    parts_b = []
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    pad_p = P('saddle', 0.04, [B('top', 0.0, 0.020, 'solid', 'brass')], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_back_pad', back_b + d_bk * 0.010, (0.19, 0.045, 0.22),
                        pad_p, n=12, rows=5, out=d_bk, rigid_joint='Spine2'))

    lac_p = P('omaroon', 0.02, [
        B('top', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'longsong_glyph', 'gold', 'omaroon', 0.07),
    ], fabric='leather.polished')
    tilt_v = np.array([-0.36, 0.0, 0.933])
    perp_v = np.array([0.933, 0.0, 0.36])
    q_ctr = back_b + d_bk * 0.040
    for idx_q, off_q in enumerate((-0.058, 0.0, 0.058)):
        tc = q_ctr + perp_v * off_q
        t_top = tc + tilt_v * 0.175
        t_bot = tc - tilt_v * 0.175
        parts_b.append(tube(f'{gid_b}_dispatch_tube_{idx_q}', [t_top, t_bot], 0.026, lac_p,
                            n=12, rigid_joint='Spine2'))
        parts_b.append(rosette(f'{gid_b}_seal_{idx_q}', t_top - tilt_v * 0.035 + d_bk * 0.025,
                               d_bk, perp_v, 0.016,
                               P('holyred', 0.02, fabric='leather.polished'),
                               n=10, thick=0.006, rigid_joint='Spine2'))
    for tag_bd, s_bd in (('hi', 0.075), ('lo', -0.075)):
        bc = q_ctr + tilt_v * s_bd
        parts_b.append(blob(f'{gid_b}_strap_band_{tag_bd}', bc, (0.185, 0.064, 0.032),
                            P('leather', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass')], fabric='leather.polished'),
                            n=12, rows=4, out=d_bk, rigid_joint='Spine2'))
    parts_b.extend(_build_back_straps(gid_b, back_b, P('leather', 0.04, fabric='leather.polished')))
    entries.append(assemble_garment(
        gid_b, 'Oidong Relay Triple Lacquer Dispatch-Tube Quiver', 'back', 'historians', parts_b
    ))

    return entries


# ===========================================================================================================
# 4. RC-6 INQUISITOR — `HM-10` Keepwell `RC-6` Apex-Hazard Seizure & Containment Specialist (`4 x 2 = 8`)
# ===========================================================================================================
def _build_rc6_inquisitor(sex, body_id):
    """HM-10 Keepwell RC-6 Apex-Hazard Seizure & Unmaking Room Containment Specialist (`order_m/f_rc6_*`)."""
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 4.1 `order_{sex}_rc6_helm` (`head`, `covers_hair=True`, `covers_face=True`)
    gid_h = f'order_{sex}_rc6_helm'
    parts_h = []
    cran_p = P('slate', 0.03, [
        B('bottom', 0.0, 0.030, 'solid', 'bronze'),
        B('top', 0.0, 0.025, 'solid', 'bronze'),
    ], [PN(0.0, 1.0, 'lorica_lames', 'bronze', 'slate', 0.08)], fabric='cloth.lead.oiled')
    parts_h.append(sculpted_cranium(gid_h + '_cranium', cran_p, f_top=1.02, f_bot=-0.04,
                                    ease=0.015, rows=12, n=36))

    dome_p = P('slate', 0.03, [
        B('bottom', 0.0, 0.028, 'solid', 'bronze'),
        B('top', 0.0, 0.030, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'procrastinator_wheel', 'bronze', 'slate', 0.10),
    ], fabric='metal.bronze')
    dome_pt = head_rings(gid_h + '_dome', 0.50, 1.04, 0.020, dome_p, n=36, rows=8, apex=True)
    dome_pt.rigid_joint = 'Head'
    parts_h.append(dome_pt)

    mask_p = P('slate', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'bronze'),
        B('bottom', 0.0, 0.024, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'keeper_visor', 'godteal', 'slate', 1.0),
    ], fabric='cloth.lead.oiled')
    parts_h.append(sculpted_faceplate(gid_h + '_mask', mask_p, f_top=0.78, f_bot=-0.05,
                                      ease=0.016, span=0.47, rows=16, cols=25))

    # Glowing `godteal` stasis visor slit bar across the ocular line + 8-plate Tibetan crest (`horn`)
    c_vis = a + (b - a) * f_eyes
    vis_pts = []
    for an_v in np.linspace(-0.32 * math.pi, 0.32 * math.pi, 11):
        d_v = -bk * math.cos(an_v) + left * math.sin(an_v)
        d_v /= np.linalg.norm(d_v)
        h_v = first_hit(c_vis, d_v) or 0.105
        vis_pts.append(c_vis + d_v * (h_v + 0.022))
    parts_h.append(horn(gid_h + '_stasis_visor', vis_pts, 0.011, 0.011,
                        P('godteal', 0.01, [B('top', 0.0, 0.004, 'solid', 'bronze'),
                                            B('bottom', 0.0, 0.004, 'solid', 'bronze')],
                          fabric='glass.moonglass.leaded'),
                        n=8, rows=11, rigid_joint='Head'))

    c_top = a + (b - a) * f_crown
    crest_pts = [
        c_top - bk * 0.085 - up * 0.005,
        c_top - bk * 0.035 + up * 0.058,
        c_top + bk * 0.025 + up * 0.076,
        c_top + bk * 0.090 + up * 0.048,
        c_top + bk * 0.130 - up * 0.010,
    ]
    parts_h.append(horn(
        gid_h + '_tibetan_crest', crest_pts, 0.024, 0.012,
        P('bronze', 0.02, [B('top', 0.0, 0.40, 'stripes', 'godteal', 'bronze', 0.016)], fabric='metal.bronze'),
        n=10, rows=12, rigid_joint='Head'
    ))
    entries.append(assemble_garment(
        gid_h, 'Keepwell RC-6 Null-Field Containment Helmet', 'head', 'historians', parts_h,
        covers_hair=True, covers_face=True
    ))

    # 4.2 `order_{sex}_rc6_cuirass` (`torso`): Lead grounding cuirass, dual stasis wheels & lead chains
    gid_t = f'order_{sex}_rc6_cuirass'
    parts_t = []
    skirt_p = P('omaroon', 0.04, [
        B('bottom', 0.0, 0.032, 'solid', 'bronze'),
        B('bottom', 0.032, 0.088, 'lorica_lames', 'slate', 'omaroon', 0.06),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'slate', 'omaroon', 0.12),
    ], fabric='cloth.quilted.diamond')
    parts_t.append(torso_tube(gid_t + '_skirt', WAIST + 0.02, KNEE - 0.10, 0.018, skirt_p,
                              n=48, rows=12, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=WAIST))

    cuirass_p = P('slate', 0.03, [
        B('top', 0.0, 0.026, 'solid', 'bronze'),
        B('bottom', 0.0, 0.045, 'dentils', 'bronze', 'slate', 0.04),
    ], [
        PN(0.0, 1.0, 'lorica_lames', 'iron', 'slate', 0.09),
        PN(0.36, 0.64, 'procrastinator_wheel', 'bronze', 'slate', 0.18),
    ], fabric='cloth.lead.oiled')
    parts_t.append(torso_tube(gid_t + '_cuirass', TOP + 0.005, CROTCH + 0.04, 0.022, cuirass_p,
                              n=48, rows=15, hang_from=WAIST - 0.02, flare=0.05,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    gorget_p = P('bronze', 0.02, [
        B('bottom', 0.0, 0.020, 'solid', 'slate'),
        B('top', 0.0, 0.016, 'solid', 'omaroon'),
    ], [PN(0.0, 1.0, 'procrastinator_wheel', 'godteal', 'bronze', 0.08)], fabric='metal.bronze')
    parts_t.append(collar_disc(gid_t + '_gorget', 0.072, gorget_p,
                               drop=0.058, rows=6, n=42, scallop=0.04, ease=0.019))
    parts_t.append(pauldron(gid_t + '_pauldron_L', L, gorget_p, reach=0.35, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_pauldron_R', R, gorget_p, reach=0.35, ease=0.024, flare_end=0.98))

    sl_rc = P('slate', 0.03, [
        B('bottom', 0.0, 0.032, 'solid', 'bronze'),
        B('top', 0.0, 0.025, 'solid', 'omaroon'),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'omaroon', 'slate', 0.10)], fabric='cloth.lead.oiled')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_rc, ease_end=0.024, rows=9))

    # Counter-rotating dual `bronze` & `godteal` stasis wheels flush on the sternum (2 paired rosettes at 0.028 ease)
    whl_outer_p = P('bronze', 0.02, [
        B('top', 0.0, 0.50, 'procrastinator_wheel', 'godteal', 'bronze', 0.045),
    ], fabric='metal.bronze')
    whl_inner_p = P('godteal', 0.02, [
        B('top', 0.0, 0.50, 'procrastinator_wheel', 'bronze', 'slate', 0.040),
    ], fabric='glass.moonglass.leaded')
    for idx_w, (wx, wp_main) in enumerate(((-0.036, whl_outer_p), (0.036, whl_inner_p))):
        w_pos = chest_front(CHEST + 0.006, 0.028, x=wx)
        parts_t.append(rosette(f'{gid_t}_stasis_wheel_{idx_w}', w_pos, FRONT,
                               np.array([1.0, 0.0, 0.0]), 0.038, wp_main,
                               n=16, thick=0.012, rigid_joint='Spine2'))

    # Continuous `slate` lead grounding chains (`horn` cord + `blob` links)
    lead_chain_p = P('slate', 0.02, [B('top', 0.0, 0.005, 'solid', 'iron')], fabric='metal.iron')
    parts_t.extend(_build_chest_chain(f'{gid_t}_ground_chain', TOP - 0.018, 0.098, 0.165,
                                      0.023, lead_chain_p, n_links=33))

    belt_rc = P('slate', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'bronze'),
        B('bottom', 0.0, 0.012, 'solid', 'bronze'),
    ], [PN(0.44, 0.56, 'procrastinator_wheel', 'godteal', 'bronze', 0.06)], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.038, WAIST - 0.038, 0.026, belt_rc,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='band'))
    entries.append(assemble_garment(
        gid_t, 'Keepwell RC-6 Lead Grounding Cuirass & Dual Stasis Wheels', 'torso', 'historians', parts_t
    ))

    # 4.3 `order_{sex}_rc6_gauntlets` (`gloves`): Lead-impregnated & bronze-splinted containment gauntlets
    gid_g = f'order_{sex}_rc6_gauntlets'
    cuff_rc_p = P('slate', 0.03, [
        B('top', 0.0, 0.020, 'solid', 'bronze'),
        B('bottom', 0.0, 0.022, 'procrastinator_wheel', 'godteal', 'bronze', 0.035),
    ], [PN(0.0, 1.0, 'fluted', 'bronze', 'slate', 0.05)], fabric='cloth.lead.oiled')
    palm_rc_p = P('slate', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'bronze'),
        B('bottom', 0.0, 0.012, 'solid', 'bronze'),
    ], fabric='cloth.lead.oiled')
    e_rc_g = assemble_garment(
        gid_g, 'Keepwell RC-6 Lead-Splinted Containment Gauntlets', 'gloves', 'historians',
        _build_cuff_palm_gloves(gid_g, cuff_rc_p, palm_rc_p)
    )
    entries.append(e_rc_g)

    # 4.4 `order_{sex}_rc6_nullpack` (`back`): Cylindrical field-stasis relic cask + bronze quench tongs
    gid_b = f'order_{sex}_rc6_nullpack'
    parts_b = []
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    parts_b.append(blob(gid_b + '_lead_cradle', back_b + d_bk * 0.012, (0.20, 0.055, 0.25),
                        P('slate', 0.03, [B('top', 0.0, 0.02, 'solid', 'bronze')], fabric='cloth.lead.oiled'),
                        n=14, rows=5, out=d_bk, rigid_joint='Spine2'))
    cask_c = back_b + np.array([0.022, 0.068, 0.0])
    cask_p = P('slate', 0.03, [
        B('top', 0.0, 0.032, 'solid', 'bronze'),
        B('bottom', 0.0, 0.032, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'procrastinator_wheel', 'bronze', 'slate', 0.09),
    ], fabric='cloth.lead.oiled')
    parts_b.append(tube(gid_b + '_relic_cask',
                        [cask_c + np.array([0.0, 0.0, 0.150]), cask_c - np.array([0.0, 0.0, 0.150])],
                        0.065, cask_p, n=18, rigid_joint='Spine2'))
    lid_rc_p = P('bronze', 0.02, [B('top', 0.0, 0.40, 'procrastinator_wheel', 'godteal', 'slate', 0.05)],
                 fabric='metal.bronze')
    parts_b.append(blob(gid_b + '_cask_lid_top', cask_c + np.array([0.0, 0.0, 0.152]),
                        (0.132, 0.024, 0.132), lid_rc_p, n=16, rows=5,
                        out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_cask_lid_bot', cask_c - np.array([0.0, 0.0, 0.152]),
                        (0.132, 0.024, 0.132), lid_rc_p, n=16, rows=5,
                        out=np.array([0.0, 0.0, -1.0]), rigid_joint='Spine2'))
    parts_b.append(rosette(
        gid_b + '_stasis_gauge', cask_c + d_bk * 0.065, d_bk, np.array([1.0, 0.0, 0.0]), 0.034,
        P('godteal', 0.02, [B('top', 0.0, 0.45, 'procrastinator_wheel', 'bronze', 'godteal', 0.04)],
          fabric='glass.moonglass.leaded'),
        n=14, thick=0.011, rigid_joint='Spine2'
    ))
    # Strapped insulated `bronze` relic-quench tongs (`tube`s)
    tong_c = back_b + np.array([-0.088, 0.052, 0.0])
    tong_p = P('bronze', 0.02, [
        B('top', 0.0, 0.11, 'solid', 'slate'),
        B('bottom', 0.0, 0.04, 'solid', 'godteal'),
    ], fabric='metal.bronze')
    parts_b.append(tube(gid_b + '_tong_A',
                        [tong_c + np.array([-0.018, 0.0, 0.165]), tong_c + np.array([0.018, 0.0, -0.155])],
                        0.010, tong_p, n=8, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_tong_B',
                        [tong_c + np.array([0.018, 0.0, 0.165]), tong_c + np.array([-0.018, 0.0, -0.155])],
                        0.010, tong_p, n=8, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_tong_pivot', tong_c + np.array([0.0, 0.010, 0.005]),
                        (0.032, 0.022, 0.032), lid_rc_p, n=10, rows=4, out=d_bk, rigid_joint='Spine2'))
    parts_b.extend(_build_back_straps(gid_b, back_b, P('slate', 0.03, fabric='cloth.lead.oiled')))
    entries.append(assemble_garment(
        gid_b, 'Keepwell RC-6 Field-Stasis Relic Cask & Quench Tongs', 'back', 'historians', parts_b
    ))

    return entries


# ===========================================================================================================
# 5. PUNA EXCAVATOR — `HM-02` Tiguantin Viejo (`+4,616 m`) & `HM-05` White Gills Chronologist (`4 x 2 = 8`)
# ===========================================================================================================
def _build_puna_excavator(sex, body_id):
    """HM-02 Tiguantin Viejo (+4,616 m) & HM-05 White Gills Breath-Pipe Chronologist (`order_m/f_puna_*`)."""
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 5.1 `order_{sex}_puna_hood` (`head`, `covers_hair=True`, `covers_face=False`)
    gid_h = f'order_{sex}_puna_hood'
    parts_h = []
    hood_p = P('omaroon', 0.05, [
        B('top', 0.0, 0.032, 'solid', 'ash'),
        B('bottom', 0.0, 0.044, 'tiguantin_puna_weave', 'osaffron', 'ash', 0.11),
    ], [
        PN(0.0, 0.16, 'solid', 'cream', 'ash', 1.0),
        PN(0.84, 1.0, 'solid', 'cream', 'ash', 1.0),
        PN(0.36, 0.64, 'tiguantin_puna_weave', 'ash', 'omaroon', 0.16),
    ], fabric='fur.yak')
    parts_h.append(hood(gid_h + '_hood', hood_p, ease=0.020, ease_low=0.026,
                        open_front=0.90, low=-0.40, rows=15, n=34, peak=0.04, high=1.04))

    # Perforated `copper` breath-warming respirator half-mask seated flush over nose/mouth (`blob`, `rigid_joint='Head'`)
    c_resp = a + (b - a) * (f_nose - 0.06)
    h_resp = first_hit(c_resp, -bk) or 0.115
    resp_pos = c_resp - bk * (h_resp + 0.008)
    resp_p = P('copper', 0.02, [
        B('top', 0.0, 0.012, 'solid', 'brass'),
        B('bottom', 0.0, 0.012, 'solid', 'leather'),
    ], [PN(0.18, 0.82, 'beads', 'soot', 'copper', 0.022)], fabric='metal.bronze')
    parts_h.append(blob(gid_h + '_respirator', resp_pos, (0.090, 0.048, 0.074),
                        resp_p, n=14, rows=6, out=-bk, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_breath_valve', resp_pos - bk * 0.022, -bk, left, 0.020,
                           P('brass', 0.02, [B('top', 0.0, 0.40, 'stripes', 'soot', 'brass', 0.012)],
                             fabric='metal.bronze'),
                           n=12, thick=0.008, rigid_joint='Head'))

    # Bone/brass snow-slit goggles seated flush against the hood brow (`blob`s, `rigid_joint='Head'`)
    c_gog = a + (b - a) * (f_brow + 0.12)
    gog_p = P('bone', 0.03, [
        B('top', 0.0, 0.007, 'solid', 'brass'),
        B('bottom', 0.0, 0.007, 'solid', 'brass'),
        B('top', 0.013, 0.019, 'solid', 'soot'),
    ], fabric='leather.polished')
    g_pts = []
    for sd_g, tag_g in ((-1.0, 'R'), (1.0, 'L')):
        p_sg = c_gog + left * (0.032 * sd_g)
        d_g = -bk + left * (0.16 * sd_g)
        d_g /= np.linalg.norm(d_g)
        h_g = (first_hit(p_sg, d_g) or 0.096) + 0.022
        p_g = p_sg + d_g * h_g
        g_pts.append(p_g)
        parts_h.append(blob(f'{gid_h}_snow_goggle_{tag_g}', p_g, (0.046, 0.024, 0.032),
                            gog_p, n=12, rows=5, out=d_g, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_goggle_bridge', g_pts, 0.005, 0.005,
                        P('brass', 0.02, fabric='metal.bronze'), n=6, rows=4, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'High-Puna Fleece Hood, Copper Respirator & Snow Goggles', 'head', 'historians', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 5.2 `order_{sex}_puna_chuba` (`torso`): Bulky alpaca-fleece & oiled-lead chuba, brucite vials & saltcup canteen
    gid_t = f'order_{sex}_puna_chuba'
    parts_t = []
    chuba_p = P('yakbrown', 0.05, [
        B('top', 0.0, 0.028, 'solid', 'cream'),
        B('bottom', 0.0, 0.035, 'solid', 'cream'),
        B('bottom', 0.035, 0.125, 'tiguantin_puna_weave', 'osaffron', 'omaroon', 0.14),
    ], [
        PN(0.14, 0.36, 'diamond_quilt', 'slate', 'yakbrown', 0.14),
        PN(0.64, 0.86, 'diamond_quilt', 'slate', 'yakbrown', 0.14),
        PN(0.38, 0.42, 'solid', 'cream', 'yakbrown', 1.0, down=0.44),
        PN(0.42, 0.58, 'tiguantin_puna_weave', 'osaffron', 'omaroon', 0.18),
        PN(0.58, 0.62, 'solid', 'cream', 'yakbrown', 1.0),
    ], fabric='cloth.lead.oiled')
    parts_t.append(torso_tube(gid_t, TOP, KNEE - 0.10, 0.020, chuba_p,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    fleece_col_p = P('cream', 0.07, [
        B('bottom', 0.0, 0.020, 'steps', 'omaroon', 'cream', 0.04),
    ], fabric='fur.yak')
    parts_t.append(collar_disc(gid_t + '_fleece_collar', 0.080, fleece_col_p,
                               drop=0.065, rows=6, n=44, scallop=0.03, ease=0.019))

    sl_p = P('yakbrown', 0.05, [
        B('bottom', 0.0, 0.045, 'solid', 'cream'),
        B('bottom', 0.045, 0.085, 'steps', 'osaffron', 'omaroon', 0.05),
    ], fabric='fur.yak')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.019, sl_p, ease_end=0.028, rows=9))

    # Diagonal `band()` holding brucite `godteal`/`white` core-sample vials (`tube`s at 0.024 ease)
    strap_p = P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'copper')], fabric='leather.polished')
    parts_t.append(band(gid_t + '_bandolier', WAIST + 0.01, SHOULDER - 0.015, 0.044, 0.024,
                        strap_p, high=math.pi * 0.42, rows=4))
    vial_p = P('white', 0.02, [
        B('top', 0.0, 0.016, 'solid', 'brass'),
        B('bottom', 0.0, 0.032, 'solid', 'godteal'),
    ], fabric='glass.moonglass.leaded')
    for idx_v, (z_off, x_off) in enumerate(((0.036, 0.048), (0.002, 0.010), (-0.032, -0.028))):
        v_pos = chest_front(CHEST + z_off, 0.024, x=x_off)
        parts_t.append(tube(
            f'{gid_t}_brucite_vial_{idx_v}',
            [v_pos + np.array([0.008, 0.0, 0.036]), v_pos - np.array([0.008, 0.0, 0.036])],
            0.012, vial_p, n=10, rigid_joint='Spine2'
        ))

    # Conformed belt + brass day-ring calipers & non-alcoholic saltcup canteen (`blob` at 0.023 ease)
    belt_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.010, 'solid', 'copper'),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.035, WAIST - 0.035, 0.022, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))

    c_w = spine_at(WAIST - 0.018)
    d_can = np.array([-0.76, -0.65, 0.0])
    d_can /= np.linalg.norm(d_can)
    p_sash_can = surface_out(c_w, d_can, 0.018, bvh=core.BVH_T)
    p_can = surface_out(c_w, d_can, 0.023, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_canteen_neck',
                        [p_sash_can + np.array([0.0, 0.0, 0.028]), p_can - np.array([0.0, 0.0, 0.006])],
                        0.010, P('copper', 0.02, fabric='metal.bronze'), n=8, rigid_joint='Hips'))
    can_p = P('copper', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'saddle'),
        B('bottom', 0.0, 0.022, 'solid', 'saddle'),
    ], [PN(0.28, 0.72, 'steps', 'godteal', 'copper', 0.045)], fabric='metal.bronze')
    parts_t.append(blob(gid_t + '_saltcup_canteen', p_can - np.array([0.0, 0.0, 0.024]),
                        (0.078, 0.042, 0.086), can_p, n=12, rows=5, out=d_can, rigid_joint='Hips'))

    d_cal = np.array([0.76, -0.65, 0.0])
    d_cal /= np.linalg.norm(d_cal)
    p_cal = surface_out(c_w, d_cal, 0.023, bvh=core.BVH_T)
    cal_p = P('brass', 0.02, fabric='metal.gold')
    parts_t.append(rosette(gid_t + '_caliper_hinge', p_cal + np.array([0.0, 0.0, 0.022]),
                           d_cal, FRONT, 0.018, cal_p, n=10, thick=0.008, rigid_joint='Hips'))
    for sd_c, tag_c in ((-1.0, 'A'), (1.0, 'B')):
        parts_t.append(tube(
            f'{gid_t}_caliper_leg_{tag_c}',
            [p_cal + np.array([0.0, 0.0, 0.022]), p_cal + np.array([sd_c * 0.018, -0.010 * sd_c, -0.058])],
            0.006, cal_p, n=8, rigid_joint='Hips'
        ))
    entries.append(assemble_garment(
        gid_t, 'Tiguantin High-Puna Alpaca Chuba & Brucite Sample Belt', 'torso', 'historians', parts_t
    ))

    # 5.3 `order_{sex}_puna_pack` (`back`): Twin fleece-wrapped ignimbrite scroll casks + helical brass coring auger
    gid_b = f'order_{sex}_puna_pack'
    parts_b = []
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    parts_b.append(blob(gid_b + '_fleece_pad', back_b + d_bk * 0.012, (0.22, 0.050, 0.24),
                        P('cream', 0.07, fabric='fur.yak'), n=14, rows=5, out=d_bk, rigid_joint='Spine2'))
    cask_p = P('ash', 0.05, [
        B('top', 0.0, 0.040, 'solid', 'cream'),
        B('bottom', 0.0, 0.040, 'solid', 'cream'),
        B('top', 0.040, 0.075, 'steps', 'omaroon', 'osaffron', 0.04),
    ], fabric='cloth.felt.boiled')
    for sd_k, tag_k in ((-1.0, 'R'), (1.0, 'L')):
        kc = back_b + np.array([sd_k * 0.068, 0.048, 0.0])
        parts_b.append(tube(f'{gid_b}_ignimbrite_cask_{tag_k}',
                            [kc + np.array([0.0, 0.0, 0.145]), kc - np.array([0.0, 0.0, 0.145])],
                            0.042, cask_p, n=14, rigid_joint='Spine2'))
        parts_b.append(blob(f'{gid_b}_cask_cap_{tag_k}', kc + np.array([0.0, 0.0, 0.148]),
                            (0.086, 0.020, 0.086), P('copper', 0.02, fabric='metal.bronze'),
                            n=12, rows=4, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))

    aug_c = back_b + np.array([0.0, 0.092, 0.0])
    aug_p = P('brass', 0.02, [
        B('top', 0.0, 0.04, 'solid', 'copper'),
        B('bottom', 0.0, 0.03, 'solid', 'steel'),
    ], [
        PN(0.0, 1.0, 'stripes', 'soot', 'brass', 0.028),
    ], fabric='metal.bronze')
    parts_b.append(tube(gid_b + '_coring_auger',
                        [aug_c + np.array([0.0, 0.0, 0.175]), aug_c - np.array([0.0, 0.0, 0.185])],
                        0.018, aug_p, n=12, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_auger_handle',
                        [aug_c + np.array([-0.075, 0.0, 0.178]), aug_c + np.array([0.075, 0.0, 0.178])],
                        0.011, P('yakbrown', 0.05, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='leather.polished'),
                        n=8, rigid_joint='Spine2'))
    parts_b.extend(_build_back_straps(gid_b, back_b, P('leather', 0.04, fabric='leather.polished')))
    entries.append(assemble_garment(
        gid_b, 'High-Puna Ignimbrite Scroll Casks & Helical Coring Auger', 'back', 'historians', parts_b
    ))

    # 5.4 `order_{sex}_puna_boots` (`feet`): Thick fleece-lined high-puna snow-and-scree boots
    gid_f = f'order_{sex}_puna_boots'
    sole_f = P('basalt', 0.08, [B('top', 0.0, 0.014, 'solid', 'copper')], fabric='leather.polished')
    upper_f = P('yakbrown', 0.05, [
        B('top', 0.0, 0.050, 'solid', 'cream'),
        B('bottom', 0.0, 0.035, 'solid', 'basalt'),
    ], [
        PN(0.36, 0.64, 'steps', 'osaffron', 'omaroon', 0.065),
    ], fabric='fur.yak')
    wrap_f = P('omaroon', 0.04, [B('top', 0.0, 0.008, 'solid', 'osaffron')], fabric=WOOL)
    entries.append(assemble_garment(
        gid_f, 'High-Puna Fleece-Lined Snow & Scree Boots', 'feet', 'historians',
        boots(gid_f, sole_f, upper_f, top=0.58, wraps=3, wrap_paint=wrap_f,
              cuff_paint=P('cream', 0.08, fabric='fur.yak'), ease_top=0.034)
    ))

    return entries


# ===========================================================================================================
# 6. VERGE CHRONICLER — `HM-09` Verge Scarp Dual-Zone Camel & East-Abyss Miasma Chronicler (`4 x 2 = 8`)
# ===========================================================================================================
def _build_verge_chronicler(sex, body_id):
    """HM-09 Verge Scarp Dual-Zone Camel & East-Abyss Miasma Chronicler (`order_m/f_verge_*`)."""
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    ANKLE = core.ANKLE
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 6.1 `order_{sex}_verge_litham` (`head`, `covers_hair=True`, `covers_face=False`)
    gid_h = f'order_{sex}_verge_litham'
    parts_h = []
    crown_p = P('orderblue', 0.04, [
        B('bottom', 0.0, 0.022, 'solid', 'osaffron'),
        B('top', 0.0, 0.024, 'stripes', 'dunesand', 'orderblue', 0.020),
    ], fabric=COTTON)
    parts_h.append(head_rings(gid_h + '_crown', 0.46, 1.04, 0.020, crown_p, n=36, rows=8, apex=True))

    wrap_p = P('orderblue', 0.04, [
        B('top', 0.0, 0.012, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.012, 'solid', 'dunesand'),
    ], [
        PN(0.0, 1.0, 'longsong_glyph', 'osaffron', 'indigo', 0.055),
    ], fabric=COTTON)
    parts_h.append(crown_band(gid_h + '_turban_wrap', wrap_p, f0=0.50, f1=0.84,
                              ease=0.024, flare=0.012, rows=7, n=38))

    # Nape sun-cloth guard behind the neck
    fs_np = np.linspace(max(0.02, f_nose - 0.28), f_eyes + 0.04, 6)
    angs_np = np.linspace(-0.56 * math.pi, 0.56 * math.pi, 24)
    Np_grid = []
    for k_n, f_v in enumerate(fs_np):
        f_ray = max(f_v, 0.36)
        c_ray = a + (b - a) * f_ray
        c_cur = a + (b - a) * f_v
        Np_grid.append([
            pt + (c_cur - c_ray)
            for pt in ring_points(c_ray, bk, left, angs_np, 0.020 + 0.010 * (1.0 - k_n / 5.0),
                                  rmin=0.05, rmax=0.18)
        ])
    parts_h.append(Part(gid_h + '_nape_veil', np.array(Np_grid), False, ['body'] * len(fs_np),
                        crown_p, rigid_joint='Head'))

    # Lower-face cloth wrap (`sculpted_faceplate` over nose-bridge, cheeks & chin; eyes uncovered)
    veil_p = P('indigo', 0.04, [
        B('top', 0.0, 0.014, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.016, 'solid', 'orderblue'),
    ], [PN(0.32, 0.68, 'stripes', 'orderblue', 'indigo', 0.03)], fabric=COTTON)
    parts_h.append(sculpted_faceplate(
        gid_h + '_face_veil', veil_p,
        f_top=f_nose + 0.02, f_bot=max(0.02, f_nose - 0.30),
        ease=0.022, span=0.47, rows=12, cols=23,
        brow_relief=0.0, nose_relief=0.018, cheek_relief=0.010, chin_relief=0.012
    ))

    # `brass` & `amber` miasma/dust goggles seated flush against `_turban_wrap` (`blob`s, `rigid_joint='Head'`)
    c_gog = a + (b - a) * (f_brow + 0.03)
    gog_p = P('amber', 0.02, [
        B('top', 0.0, 0.008, 'solid', 'brass'),
        B('bottom', 0.0, 0.008, 'solid', 'brass'),
    ], fabric='glass.moonglass.leaded')
    g_pts = []
    for sd_g, tag_g in ((-1.0, 'R'), (1.0, 'L')):
        p_sg = c_gog + left * (0.032 * sd_g)
        d_g = -bk + left * (0.16 * sd_g)
        d_g /= np.linalg.norm(d_g)
        h_g = (first_hit(p_sg, d_g) or 0.096) + 0.024
        p_g = p_sg + d_g * h_g
        g_pts.append(p_g)
        parts_h.append(blob(f'{gid_h}_miasma_goggle_{tag_g}', p_g, (0.044, 0.024, 0.036),
                            gog_p, n=14, rows=5, out=d_g, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_goggle_bridge', g_pts, 0.005, 0.005,
                        P('brass', 0.02, fabric='metal.bronze'), n=6, rows=4, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Verge Scarp Desert Litham Turban-Veil & Miasma Goggles', 'head', 'historians', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 6.2 `order_{sex}_verge_burnous` (`torso`): Dunesand robe, indigo/orderblue mantle, gnomon & Locus-oil phials
    gid_t = f'order_{sex}_verge_burnous'
    parts_t = []
    robe_p = P('dunesand', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'orderblue'),
        B('bottom', 0.0, 0.030, 'solid', 'orderblue'),
        B('bottom', 0.030, 0.095, 'longsong_glyph', 'osaffron', 'omaroon', 0.07),
    ], [
        PN(0.41, 0.59, 'saffron_kesa', 'gold', 'osaffron', 0.16),
        PN(0.39, 0.41, 'solid', 'omaroon', 'dunesand', 1.0),
        PN(0.59, 0.61, 'solid', 'omaroon', 'dunesand', 1.0),
    ], fabric=COTTON)
    parts_t.append(torso_tube(gid_t, TOP, ANKLE + 0.05, 0.015, robe_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.18,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    sl_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.028, 'solid', 'orderblue'),
        B('bottom', 0.028, 0.065, 'saffron_kesa', 'gold', 'osaffron', 0.05),
    ], fabric=COTTON)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.034, rows=9))

    mantle_p = P('indigo', 0.04, [
        B('bottom', 0.0, 0.028, 'solid', 'osaffron'),
        B('bottom', 0.028, 0.068, 'longsong_glyph', 'gold', 'orderblue', 0.055),
        B('top', 0.0, 0.018, 'solid', 'orderblue'),
    ], fabric=WOOL)
    parts_t.append(collar_disc(gid_t + '_mantle_collar', 0.082, mantle_p,
                               drop=0.068, rows=6, n=44, scallop=0.04, ease=0.019))
    cape_pt = cape(gid_t + '_burnous_cape', WAIST - 0.08, mantle_p,
                   span=0.40, ease=0.036, flare=0.08, rows=14, n=28)
    cape_pt.role = 'drape'
    parts_t.append(cape_pt)

    # Conformed `omaroon` belt fitted flush (`0.022` ease) with brass sun-shadow gnomon & Locus-oil phials
    belt_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'osaffron'),
        B('bottom', 0.0, 0.010, 'solid', 'brass'),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.035, WAIST - 0.032, 0.020, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))

    c_w = spine_at(WAIST - 0.012)
    d_gn = np.array([-0.78, -0.62, 0.0])
    d_gn /= np.linalg.norm(d_gn)
    p_sash_gn = surface_out(c_w, d_gn, 0.017, bvh=core.BVH_T)
    p_gn = surface_out(c_w, d_gn, 0.022, bvh=core.BVH_T)
    brass_p = P('brass', 0.02, [B('top', 0.0, 0.08, 'stripes', 'soot', 'brass', 0.012)], fabric='metal.gold')
    parts_t.append(tube(gid_t + '_gnomon_bracket', [p_sash_gn, p_gn + d_gn * 0.005],
                        0.008, brass_p, n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_sun_gnomon',
                        [p_gn + np.array([0.0, 0.0, 0.055]), p_gn - np.array([0.0, 0.0, 0.055])],
                        0.010, brass_p, n=10, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_gnomon_dial', p_gn + np.array([0.0, 0.0, 0.015]),
                           d_gn, FRONT, 0.024,
                           P('brass', 0.02, [B('top', 0.0, 0.45, 'procrastinator_wheel', 'amber', 'brass', 0.035)],
                             fabric='metal.gold'),
                           n=12, thick=0.007, rigid_joint='Hips'))

    phial_p = P('amber', 0.02, [
        B('top', 0.0, 0.012, 'solid', 'brass'),
        B('bottom', 0.0, 0.012, 'solid', 'verdigris'),
    ], fabric='glass.moonglass.leaded')
    for idx_ph, an_ph in enumerate((0.58, 0.78, 0.98)):
        d_ph = np.array([math.sin(an_ph), -math.cos(an_ph), 0.0])
        p_ph = surface_out(c_w, d_ph, 0.022, bvh=core.BVH_T)
        parts_t.append(blob(f'{gid_t}_locus_phial_{idx_ph}', p_ph - np.array([0.0, 0.0, 0.008]),
                            (0.026, 0.022, 0.044), phial_p, n=10, rows=5, out=d_ph, rigid_joint='Hips'))
    entries.append(assemble_garment(
        gid_t, "Verge Scarp Chronicler's Burnous, Gnomon & Locus-Oil Phials", 'torso', 'historians', parts_t
    ))

    # 6.3 `order_{sex}_verge_pack` (`back`): Leather camel-saddle scroll panniers + coiled cliff-lift rope
    gid_b = f'order_{sex}_verge_pack'
    parts_b = []
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    parts_b.append(blob(gid_b + '_saddle_yoke', back_b + d_bk * 0.012, (0.24, 0.055, 0.14),
                        P('leather', 0.05, [B('top', 0.0, 0.018, 'solid', 'brass')], fabric='leather.polished'),
                        n=14, rows=5, out=d_bk, rigid_joint='Spine2'))
    pan_p = P('saddle', 0.05, [
        B('top', 0.0, 0.036, 'longsong_glyph', 'osaffron', 'omaroon', 0.05),
        B('bottom', 0.0, 0.024, 'solid', 'leather'),
    ], [
        PN(0.42, 0.58, 'solid', 'leather', 'saddle', 1.0),
    ], fabric='leather.polished')
    for sd_p, tag_p in ((-1.0, 'R'), (1.0, 'L')):
        pc = back_b + np.array([sd_p * 0.088, 0.024, -0.020])
        parts_b.append(blob(f'{gid_b}_pannier_{tag_p}', pc, (0.115, 0.105, 0.25),
                            pan_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'))

    # Coiled cliff-lift climbing rope spool (`horn`)
    rope_c = back_b + np.array([0.0, 0.072, 0.015])
    rope_pts = []
    for k_r in range(25):
        th_r = 2.0 * math.pi * (k_r / 12.0)
        dy_r = 0.010 * (k_r / 24.0 - 0.5)
        rope_pts.append(rope_c + np.array([math.cos(th_r) * 0.068, dy_r, math.sin(th_r) * 0.078]))
    rope_p = P('sand', 0.07, [B('top', 0.0, 0.50, 'stripes', 'dunesand', 'sand', 0.015)],
               fabric='straw.reed.plaited')
    parts_b.append(horn(gid_b + '_cliff_rope_coil', rope_pts, 0.015, 0.015, rope_p,
                        n=8, rows=25, rigid_joint='Spine2'))
    parts_b.extend(_build_back_straps(gid_b, back_b, P('leather', 0.04, fabric='leather.polished')))
    entries.append(assemble_garment(
        gid_b, 'Verge Scarp Camel-Saddle Scroll Panniers & Cliff Rope', 'back', 'historians', parts_b
    ))

    # 6.4 `order_{sex}_verge_boots` (`feet`): Sand-gaitered desert-scarp boots
    gid_f = f'order_{sex}_verge_boots'
    sole_f = P('leather', 0.07, [B('top', 0.0, 0.012, 'solid', 'omaroon')], fabric='leather.polished')
    upper_f = P('dunesand', 0.05, [
        B('top', 0.0, 0.042, 'stripes', 'orderblue', 'osaffron', 0.016),
        B('bottom', 0.0, 0.045, 'solid', 'omaroon'),
    ], [
        PN(0.0, 1.0, 'fluted', 'sand', 'dunesand', 0.08),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(
        gid_f, 'Verge Scarp Sand-Gaitered Desert Boots', 'feet', 'historians',
        boots(gid_f, sole_f, upper_f, top=0.50, wraps=2,
              wrap_paint=P('omaroon', 0.04, fabric=COTTON), ease_top=0.030)
    ))

    return entries


# ===========================================================================================================
# ENTRY POINT
# ===========================================================================================================
def build_historians_core_high_kit():
    """Build all 60 Order of Historians Core, Technical & High-Altitude pieces across male and female bodies."""
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_hygiene_upgrades(sex, body_id))
        entries.extend(_build_abbot_chronicler(sex, body_id))
        entries.extend(_build_printer_artisan(sex, body_id))
        entries.extend(_build_oidong_courier(sex, body_id))
        entries.extend(_build_rc6_inquisitor(sex, body_id))
        entries.extend(_build_puna_excavator(sex, body_id))
        entries.extend(_build_verge_chronicler(sex, body_id))
    return entries
