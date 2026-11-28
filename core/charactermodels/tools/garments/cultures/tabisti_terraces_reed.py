"""The Tabisti (`tabisti` / *Ibisen* & Reed-Lake — Maghrebi Amazigh + Andean) — Part 1 (Tiers 1–8).

Implements Categories I–III (Terrace & Reed Folk, Artisans & Dredgers, and Terrace/Palisade Martial Units)
across both `mpfb_male` (`m`) and `mpfb_female` (`f`) at 100% procedural Male & Female slot parity:
  1. `peasant`             — Sub-Rim Cataract Terrace & Salt-Rice Cultivator (`5 x 2 = 10` pieces)
  2. `scarp_porter`        — Verge & Furrow Cliff-Switchback Q'epi Porter (`6 x 2 = 12` pieces)
  3. `reed_weaver`         — Reed Lake Totora Boatman & Chakana Weaver (`5 x 2 = 10` pieces)
  4. `trade`               — Mungo & Liikofi Shore-Market Factor (`5 x 2 = 10` pieces)
  5. `dredger`             — Abyssal Brine-Pan & Relic-Container Dredger (`6 x 2 = 12` pieces)
  6. `tin_smith`           — Ibisen Tin-Mirror & Silver Tizerzai Artisan (`6 x 2 = 12` pieces)
  7. `scarp_slinger`       — Cataract-Terrace Warak'a Slinger (`6 x 2 = 12` pieces)
  8. `palisade_halberdier` — Tabisti Palisade & Lower-Verge Toll Halberdier (`6 x 2 = 12` pieces)

Also provides the shared Maghrebi Amazigh × Andean / Reed-Lake 3D sculptural helpers (`_tizerzai_fibula`,
`_yaz_emblem`, `_eight_star_boss`, `_swoop_horn_pair`, `_chullo_earflaps`, `_koummya_hip`, `_chuspa_pouch`,
`_cuff_palm_gloves`, `_head_landmarks`, `_snap_on_part`) imported by `tabisti_abyss_altar.py`.
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, ring_points, smooth_push, assemble_garment
)
from ..paint import P, B, PN, COTTON, WOOL
from ..types.torso import (
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, band, pauldron
)
from ..types.limbs import limb_tube, sleeve, sleeves, trousers, skirt
from ..types.footwear import boots, sandal
from ..types.headgear import (
    head_rings, sculpted_faceplate, sculpted_cranium, hood, brim,
    tower_hat, crown_band, crest, horn, turban
)
from ..types.accoutrements import (
    flap, blob, pack_straps, pendants, tube, tassel, rosette
)


# ===========================================================================================================
# SHARED MAGHREBI AMAZIGH x ANDEAN / REED-LAKE 3D SCULPTURAL HELPERS
# ===========================================================================================================
def _head_landmarks():
    """Return `(a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown)` calibrated to true `base.glb` eye/brow primitives."""
    from ..types.headgear import head_landmarks_exact
    return head_landmarks_exact()[:9]


def _snap_on_part(host_part, target_pt, out_dir, offset=0.003):
    """Return the point on `host_part.P` closest to `target_pt`, nudged outward by `offset` (2-5 mm)."""
    V = host_part.P.reshape(-1, 3)
    idx = int(np.argmin(np.linalg.norm(V - np.asarray(target_pt, float)[None, :], axis=1)))
    u = np.asarray(out_dir, float)
    u = u / max(np.linalg.norm(u), 1e-9)
    return V[idx].copy() + u * float(offset)


def _cuff_palm_gloves(gid, cuff_p, palm_p, f0=0.64):
    """Paired forearm bracers/cuffs + full 5-finger gloves (for `*_gloves`/`*_gauntlets`) or palm wraps (`*_cuffs`/`*_bracers`)."""
    from ..types.limbs import full_gloves
    if gid.endswith(('_gloves', '_gauntlets')):
        return full_gloves(gid, cuff_p, palm_p, f0=f0, ease=0.014)
    parts = []
    for s in (L, R):
        parts.append(sleeve(f'{gid}_cuff_{s[0]}', s, cuff_p, f0=f0, f1=0.98,
                            ease=0.013, flare=0.004, rows=6, n=20))
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


def _tizerzai_fibula(prefix, center, out_vec, side_vec, up_vec, scale, silver_p, gem_p, rigid_joint='Spine2'):
    """Sculpted Amazigh triangular silver *tizerzai* brooch/fibula (triangular embossed plate + ring + pin + cabochon).
    Every sub-part anchors directly at `center` so all pieces sit flush (`2-6 mm`) against the host cloth."""
    c = np.asarray(center, float)
    out = np.asarray(out_vec, float) / max(np.linalg.norm(out_vec), 1e-9)
    sd = np.asarray(side_vec, float) / max(np.linalg.norm(side_vec), 1e-9)
    up = np.asarray(up_vec, float) / max(np.linalg.norm(up_vec), 1e-9)
    parts = []
    # Triangular / 3-lobed fibula plate (`n=6` with tapered apex via blob + ring loop + piercing pin)
    parts.append(blob(f'{prefix}_plate', c, (0.048 * scale, 0.011 * scale, 0.054 * scale),
                      silver_p, n=9, rows=5, out=out, rigid_joint=rigid_joint, role='trinket'))
    # Penannular ring loop around the triangle base
    ring_pts = [
        c + out * (0.002 * scale) + sd * (math.cos(th) * 0.024 * scale) + up * (-0.008 * scale + math.sin(th) * 0.024 * scale)
        for th in np.linspace(-0.82 * math.pi, 0.82 * math.pi, 11)
    ]
    parts.append(horn(f'{prefix}_ring', ring_pts, 0.0040 * scale, 0.0040 * scale,
                      silver_p, n=8, rows=11, rigid_joint=rigid_joint, role='trinket'))
    # Diagonal fibula pin piercing across the ring & plate
    p0 = c + sd * (-0.016 * scale) + up * (-0.028 * scale) + out * (0.002 * scale)
    p1 = c + sd * (0.018 * scale) + up * (0.032 * scale) + out * (0.003 * scale)
    parts.append(horn(f'{prefix}_pin', [p0, c + out * (0.005 * scale), p1],
                      0.0042 * scale, 0.0018 * scale, silver_p, n=7, rows=7,
                      rigid_joint=rigid_joint, role='trinket'))
    # Central lacquer/cerulean cabochon boss
    parts.append(blob(f'{prefix}_gem', c + out * (0.004 * scale),
                      (0.018 * scale, 0.009 * scale, 0.018 * scale),
                      gem_p, n=8, rows=4, out=out, rigid_joint=rigid_joint, role='trinket'))
    return parts


def _yaz_emblem(prefix, center, out_vec, side_vec, up_vec, radius, paint, rigid_joint='Spine2'):
    """Sculpted 3D Amazigh Tifinagh `ⵣ` (*yaz*) emblem: twin curved side-bars + central horizontal crossbar."""
    c = np.asarray(center, float)
    out = np.asarray(out_vec, float) / max(np.linalg.norm(out_vec), 1e-9)
    sd = np.asarray(side_vec, float) / max(np.linalg.norm(side_vec), 1e-9)
    up = np.asarray(up_vec, float) / max(np.linalg.norm(up_vec), 1e-9)
    r_bar = max(0.0038, radius * 0.11)
    parts = []
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        pts_v = [
            c + out * 0.002 + sd * (sgn * radius * (0.72 + 0.22 * abs(u))) + up * (u * radius * 0.92)
            for u in (-1.0, -0.5, 0.0, 0.5, 1.0)
        ]
        parts.append(horn(f'{prefix}_yaz_{tag}', pts_v, r_bar, r_bar, paint,
                          n=8, rows=7, rigid_joint=rigid_joint, role='trinket'))
    pts_h = [
        c + out * 0.003 + sd * (-radius * 0.76),
        c + out * 0.004,
        c + out * 0.003 + sd * (radius * 0.76),
    ]
    parts.append(horn(f'{prefix}_yaz_bar', pts_h, r_bar, r_bar, paint,
                      n=8, rows=5, rigid_joint=rigid_joint, role='trinket'))
    return parts


def _eight_star_boss(prefix, center, out_vec, side_vec, up_vec, radius, tin_p, gem_p, rigid_joint='Spine2'):
    """Maghrebi 8-pointed *zellige* tin-mirror star medallion with 8 crisp points & central crystal boss."""
    c = np.asarray(center, float)
    out = np.asarray(out_vec, float) / max(np.linalg.norm(out_vec), 1e-9)
    sd = np.asarray(side_vec, float) / max(np.linalg.norm(side_vec), 1e-9)
    up = np.asarray(up_vec, float) / max(np.linalg.norm(up_vec), 1e-9)
    parts = [
        rosette(f'{prefix}_disc', c, out, sd, radius * 0.78, tin_p, n=16, thick=0.009, rigid_joint=rigid_joint),
    ]
    for k in range(8):
        ang = k * (math.pi / 4.0)
        ray_dir = sd * math.cos(ang) + up * math.sin(ang)
        parts.append(horn(
            f'{prefix}_pt{k}',
            [c + out * 0.002 + ray_dir * (radius * 0.22), c + out * 0.003 + ray_dir * radius],
            radius * 0.20, radius * 0.04, tin_p, n=6, rows=4, rigid_joint=rigid_joint, role='trinket'
        ))
    parts.append(blob(f'{prefix}_gem', c + out * 0.006, (radius * 0.52, 0.012, radius * 0.52),
                      gem_p, n=10, rows=4, out=out, rigid_joint=rigid_joint, role='trinket'))
    return parts


def _swoop_horn_pair(prefix, host_part, up_vec, bk_vec, left_vec, f_anchor, span, rise, horn_p, tip_p):
    """Twin sacred Tabisti gilded swoop-and-horn finials rooted directly on `host_part` (`d_host ~ 2 mm`)."""
    a, b, _, _, _ = head_frame()
    c_base = a + (b - a) * f_anchor
    parts = []
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        lat = left_vec * sgn
        d_out = lat * 0.88 - bk_vec * 0.28
        d_out /= np.linalg.norm(d_out)
        root = _snap_on_part(host_part, c_base + d_out * 0.10, d_out, offset=0.001)
        p1 = root + lat * (span * 0.48) + up_vec * (rise * 0.28) - bk_vec * 0.008
        p2 = root + lat * (span * 0.82) + up_vec * (rise * 0.68) - bk_vec * 0.014
        p3 = root + lat * (span * 0.68) + up_vec * rise - bk_vec * 0.018
        parts.append(horn(f'{prefix}_horn_{tag}', [root, p1, p2], 0.013, 0.007,
                          horn_p, n=10, rows=8, rigid_joint='Head'))
        parts.append(horn(f'{prefix}_horntip_{tag}', [p2, p3], 0.0075, 0.0022,
                          tip_p, n=8, rows=5, rigid_joint='Head'))
    return parts


def _chullo_earflaps(gid, ear_p, cord_p):
    """Paired knitted Andean *chullo* ear-flaps contouring down over the temples & ears with yarn tassels."""
    a, b, up, bk, left = head_frame()
    parts = []
    fs = np.linspace(0.56, 0.04, 7)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        c_ctr = math.pi + sgn * (0.50 * math.pi)
        Q = []
        for i, fv in enumerate(fs):
            v = i / 6.0
            half_w = 0.24 * (1.0 - 0.72 * (v ** 1.3))
            angs = np.linspace(c_ctr - half_w, c_ctr + half_w, 7)
            c_ray = a + (b - a) * max(fv, 0.34)
            c_cur = a + (b - a) * fv
            row = []
            for an in angs:
                d = bk * math.cos(an) + left * math.sin(an)
                h = first_hit(c_ray, d) or 0.088
                row.append(c_cur + d * (h + 0.017 + 0.004 * v))
            Q.append(row)
        ef = Part(f'{gid}_earflap_{tag}', np.array(Q), False, ['body'] * len(fs), ear_p, rigid_joint='Head')
        parts.append(ef)
        tip_pt = np.mean(ef.P[-1], axis=0)
        parts.append(tassel(f'{gid}_eartassel_{tag}', tip_pt, 0.055, 0.007, cord_p, rigid_joint='Head'))
    return parts


def _koummya_hip(prefix, waist_z, belt_ease, sheath_p, hilt_p, side_sgn=-1.0):
    """Curved Maghrebi *koummya* / *tumi*-hilted dagger worn flush against the hip/front sash (`rigid_joint='Hips'`)."""
    ang0 = math.pi + side_sgn * 0.52
    pts = []
    for k, (dz, da, dr) in enumerate((
        (0.022, -0.08, 0.004),
        (-0.005, 0.00, 0.005),
        (-0.032, 0.10, 0.006),
        (-0.052, 0.22, 0.008),
        (-0.042, 0.34, 0.010),
    )):
        an = ang0 + side_sgn * da
        d = np.array([math.sin(an), math.cos(an), 0.0])
        pts.append(surface_out(spine_at(waist_z + dz), d, belt_ease + dr, bvh=core.BVH_T))
    d_h = np.array([math.sin(ang0 - side_sgn * 0.12), math.cos(ang0 - side_sgn * 0.12), 0.0])
    p_hilt = surface_out(spine_at(waist_z + 0.036), d_h, belt_ease + 0.004, bvh=core.BVH_T)
    return [
        horn(f'{prefix}_koummya_sheath', pts, 0.015, 0.005, sheath_p, n=8, rows=9, rigid_joint='Hips', role='trinket'),
        blob(f'{prefix}_koummya_tumi_hilt', p_hilt, (0.034, 0.016, 0.026), hilt_p,
             n=8, rows=4, out=d_h, rigid_joint='Hips', role='trinket'),
    ]


def _chuspa_pouch(prefix, waist_z, ang, belt_ease, bag_p):
    """Woven Andean *chuspa* coca/lung-herb pouch flush on the waist sash (`rigid_joint='Hips'`)."""
    d = np.array([math.sin(ang), math.cos(ang), 0.0])
    d /= np.linalg.norm(d)
    p_bag = surface_out(spine_at(waist_z - 0.018), d, belt_ease + 0.005, bvh=core.BVH_T)
    return blob(f'{prefix}_chuspa', p_bag, (0.072, 0.034, 0.082), bag_p,
                n=10, rows=5, out=d, rigid_joint='Hips', role='accessory')


# ===========================================================================================================
# TIER 1: `peasant` — Sub-Rim Cataract Terrace & Salt-Rice Cultivator (`5 x 2 = 10` pieces)
# ===========================================================================================================
def _build_peasant(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 1.1 Head: Knitted ear-flap Andean chullo bound by twisted Maghrebi turban strip
    gid_h = f'tab_{sex}_peasant_chullo'
    chullo_p = P('abysslac', 0.05, [
        B('bottom', 0.0, 0.022, 'awayo_stripe', 'saffron', 'liikofiteal', 0.045),
        B('top', 0.0, 0.026, 'steps', 'saltlime', 'abysslac', 0.035),
    ], fabric=WOOL)
    strip_p = P('saltlime', 0.05, [
        B('top', 0.0, 0.008, 'solid', 'atlasindigo'),
        B('bottom', 0.0, 0.008, 'solid', 'peatumber'),
    ], [PN(0.0, 1.0, 'stripes', 'atlasindigo', 'saltlime', 0.028)], fabric=COTTON)
    dome = head_rings(gid_h + '_dome', 0.50, 1.05, 0.016, chullo_p, n=34, rows=8, apex=True)
    parts_h = [
        dome,
        crown_band(gid_h + '_turban_strip', strip_p, f0=0.54, f1=0.76, ease=0.022, flare=0.008, rows=6, n=36),
    ]
    parts_h.extend(_chullo_earflaps(gid_h, chullo_p, P('saffron', 0.05, fabric=WOOL)))
    entries.append(assemble_garment(
        gid_h, 'Terrace Knitted Chullo & Maghrebi Head-Strip', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 1.2 Torso: Woven uncu tunic (M) / anacu + lliclla shawl w/ twin silver tizerzai (F) + chumpi sash
    tin_p = P('tinmirror', 0.03, fabric='metal.tin.patchwork')
    lac_gem = P('abysslac', 0.02, fabric='beads.glass')
    chumpi_p = P('abysslac', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'saffron'),
        B('bottom', 0.0, 0.010, 'solid', 'liikofiteal'),
    ], [PN(0.0, 1.0, 'awayo_stripe', 'saffron', 'abysslac', 0.06)], fabric=WOOL)

    if sex == 'm':
        gid_t = 'tab_m_peasant_uncu'
        label_t = 'Salt-Rice Cultivator Woven Uncu & Chumpi Sash'
        uncu_p = P('peatumber', 0.06, [
            B('top', 0.0, 0.020, 'solid', 'abysslac'),
            B('bottom', 0.0, 0.028, 'solid', 'saltlime'),
            B('bottom', 0.028, 0.075, 'awayo_stripe', 'saffron', 'abysslac', 0.06),
        ], [
            PN(0.43, 0.57, 'chakana_tocapu', 'saffron', 'abysslac', 0.14, down=0.38),
            PN(0.41, 0.43, 'solid', 'saltlime', 'peatumber', 1.0, down=0.38),
            PN(0.57, 0.59, 'solid', 'saltlime', 'peatumber', 1.0, down=0.38),
        ], fabric=WOOL)
        parts_t = [
            torso_tube(gid_t + '_uncu', TOP, CROTCH - 0.04, 0.016, uncu_p,
                       n=44, rows=18, hang_from=WAIST - 0.02, flare=0.05,
                       group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
            collar(gid_t + '_collar', P('saltlime', 0.05, [B('top', 0.0, 0.008, 'solid', 'abysslac')], fabric=COTTON),
                   height=0.024, flare=0.006, ease=0.020),
        ]
        parts_t.extend(sleeves(gid_t, 'elbow', 0.017,
                               P('saltlime', 0.05, [B('bottom', 0.0, 0.024, 'awayo_stripe', 'abysslac', 'saffron', 0.04)], fabric=COTTON),
                               ease_end=0.024, rows=7))
        parts_t.append(torso_tube(gid_t + '_chumpi', WAIST + 0.032, WAIST - 0.032, 0.021, chumpi_p,
                                  rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
        # Single central tin-mirror pin at V-neck
        parts_t.extend(_tizerzai_fibula(
            gid_t + '_pin', chest_front(CHEST + 0.055, 0.020, x=0.0),
            FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.82, tin_p, lac_gem
        ))
    else:
        gid_t = 'tab_f_peasant_anacu'
        label_t = 'Terrace Anacu Dress-Tunic, Lliclla Shawl & Twin Tizerzai'
        anacu_p = P('peatumber', 0.05, [
            B('top', 0.0, 0.018, 'solid', 'saltlime'),
            B('bottom', 0.0, 0.030, 'awayo_stripe', 'saffron', 'abysslac', 0.05),
        ], [
            PN(0.42, 0.58, 'chakana_tocapu', 'saffron', 'abysslac', 0.14),
        ], fabric=WOOL)
        lliclla_p = P('saltlime', 0.05, [
            B('bottom', 0.0, 0.032, 'awayo_stripe', 'abysslac', 'liikofiteal', 0.05),
            B('top', 0.0, 0.016, 'solid', 'abysslac'),
        ], fabric=WOOL)
        anacu_tube = torso_tube(gid_t + '_anacu', TOP, WAIST - 0.034, 0.015, anacu_p,
                                n=44, rows=14, hull_from=CHEST + 0.02)
        anacu_tube.cloth = None
        lliclla_yoke = collar_disc(gid_t + '_lliclla_yoke', 0.118, lliclla_p, drop=0.098, rows=8, n=46, scallop=0.04, ease=0.019)
        lliclla_yoke.cloth = None
        parts_t = [
            anacu_tube,
            lliclla_yoke,
        ]
        parts_t.extend(sleeves(gid_t, 'elbow', 0.016,
                               P('saltlime', 0.05, [B('bottom', 0.0, 0.024, 'solid', 'abysslac')], fabric=COTTON),
                               ease_end=0.023, rows=7))
        parts_t.append(torso_tube(gid_t + '_chumpi', WAIST + 0.032, WAIST - 0.032, 0.021, chumpi_p,
                                  rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
        # Twin silver/tin-mirror Amazigh tizerzai triangle-fibulae pinning the lliclla on the chest
        for sx_f, tag_f in ((-0.058, 'R'), (0.058, 'L')):
            parts_t.extend(_tizerzai_fibula(
                f'{gid_t}_tizerzai_{tag_f}', chest_front(CHEST + 0.052, 0.023, x=sx_f),
                FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.88, tin_p, lac_gem
            ))

    parts_t.append(_chuspa_pouch(gid_t, WAIST, 0.72 * math.pi, 0.022, chumpi_p))
    parts_t.extend(_koummya_hip(gid_t, WAIST, 0.022, P('brass', 0.03, fabric='metal.bronze'), tin_p, side_sgn=-1.0))
    entries.append(assemble_garment(gid_t, label_t, 'torso', 'tabisti', parts_t))

    # 1.3 Legs: Wara breeches (M) / Pleated Pollera over terrace breeches (F) (`legged=True`)
    if sex == 'm':
        gid_l = 'tab_m_peasant_wara'
        wara_p = P('saltlime', 0.06, [
            B('bottom', 0.0, 0.024, 'solid', 'peatumber'),
            B('bottom', 0.024, 0.055, 'awayo_stripe', 'abysslac', 'saffron', 0.045),
        ], fabric=COTTON)
        parts_l = trousers(gid_l, wara_p, ease=0.018, ease_end=0.022, cuff=ANKLE + 0.14)
        entries.append(assemble_garment(gid_l, 'Terrace Cultivator Salt-Lime Wara Breeches', 'legs', 'tabisti', parts_l, legged=True))
    else:
        gid_l = 'tab_f_peasant_pollera'
        under_p = P('saltlime', 0.05, [B('bottom', 0.0, 0.022, 'solid', 'abysslac')], fabric=COTTON)
        pollera_p = P('abysslac', 0.05, [
            B('bottom', 0.0, 0.032, 'solid', 'liikofiteal'),
            B('bottom', 0.032, 0.085, 'awayo_stripe', 'saffron', 'saltlime', 0.055),
            B('top', 0.0, 0.022, 'solid', 'saffron'),
        ], [PN(0.0, 1.0, 'pleated_kilt', 'saffron', 'abysslac', 0.08)], fabric=WOOL)
        parts_l = trousers(gid_l, under_p, ease=0.015, ease_end=0.018, cuff=ANKLE + 0.14)
        parts_l.append(skirt(gid_l + '_pollera', KNEE - 0.03, WAIST, pollera_p, ease=0.028, flare=0.11, rows=14, n=42))
        entries.append(assemble_garment(gid_l, 'Pleated Awayo-Trimmed Pollera & Terrace Breeches', 'legs', 'tabisti', parts_l, legged=True))

    # 1.4 Feet: Vulcanized rubber.tyre ojota terrace sandals
    gid_f = f'tab_{sex}_peasant_ojota'
    sole_f = P('peatumber', 0.05, fabric='rubber.tyre')
    strap_f = P('abysslac', 0.04, [B('top', 0.0, 0.008, 'awayo_stripe', 'saffron', 'abysslac', 0.03)], fabric='leather.buckskin')
    entries.append(assemble_garment(
        gid_f, 'Vulcanized Rubber Ojota Terrace Sandals', 'feet', 'tabisti',
        sandal(gid_f, sole_f, strap_f, guard=True, laces=1, strap_paint2=P('saltlime', 0.05, fabric=WOOL))
    ))

    # 1.5 Back: Diagonal knotted awayo/q'epi carrying bundle w/ tin-mirror charm
    gid_b = f'tab_{sex}_peasant_qepi'
    back_b = surface_out(spine_at(CHEST - 0.01), d_bk, 0.020, bvh=core.BVH_T)
    qepi_p = P('abysslac', 0.05, [
        B('top', 0.0, 0.045, 'awayo_stripe', 'saffron', 'liikofiteal', 0.05),
        B('bottom', 0.0, 0.045, 'awayo_stripe', 'saltlime', 'atlasindigo', 0.05),
    ], [
        PN(0.22, 0.78, 'awayo_stripe', 'saffron', 'abysslac', 0.09),
    ], fabric=WOOL)
    parts_b = [
        blob(gid_b + '_bundle', back_b + np.array([0.0, 0.038, -0.010]), (0.25, 0.14, 0.28),
             qepi_p, n=16, rows=7, out=d_bk, rigid_joint='Spine2'),
        blob(gid_b + '_top_knot', back_b + np.array([0.035, 0.032, 0.125]), (0.085, 0.055, 0.065),
             P('saffron', 0.05, fabric=WOOL), n=10, rows=5, out=d_bk, rigid_joint='Spine2'),
        rosette(gid_b + '_tin_charm', back_b + np.array([0.0, 0.108, 0.010]), d_bk, np.array([1.0, 0.0, 0.0]),
                0.028, tin_p, n=12, thick=0.008, rigid_joint='Spine2'),
    ]
    parts_b.extend(pack_straps(gid_b, qepi_p, ease=0.045, width=0.032))
    entries.append(assemble_garment(
        gid_b, "Knotted Awayo Q'epi Terrace Carrying Bundle", 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 2: `scarp_porter` — Verge & Furrow Cliff-Switchback Q'epi Porter (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_scarp_porter(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 2.1 Head: Chullo + leather forehead tumpline headband
    gid_h = f'tab_{sex}_porter_chullo'
    chullo_p = P('saffron', 0.05, [
        B('bottom', 0.0, 0.024, 'awayo_stripe', 'abysslac', 'liikofiteal', 0.045),
        B('top', 0.0, 0.024, 'chevrons', 'abysslac', 'saffron', 0.035),
    ], fabric=WOOL)
    tump_p = P('leather', 0.04, [
        B('top', 0.0, 0.007, 'solid', 'brass'),
        B('bottom', 0.0, 0.007, 'solid', 'brass'),
    ], fabric='leather.polished')
    parts_h = [
        head_rings(gid_h + '_chullo', 0.48, 1.05, 0.016, chullo_p, n=34, rows=8, apex=True),
        crown_band(gid_h + '_tumpline', tump_p, f0=0.52, f1=0.72, ease=0.022, flare=0.006, rows=5, n=36),
    ]
    parts_h.extend(_chullo_earflaps(gid_h, chullo_p, P('abysslac', 0.05, fabric=WOOL)))
    entries.append(assemble_garment(
        gid_h, 'Cliff-Porter Knitted Chullo & Leather Tumpline', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 2.2 Torso: Rugged saffron-ochre & verdigris uncu + thrown-back Atlas burnous shoulder-hood
    gid_t = f'tab_{sex}_porter_uncu'
    uncu_p = P('saffron', 0.05, [
        B('top', 0.0, 0.020, 'solid', 'liikofiteal'),
        B('bottom', 0.0, 0.032, 'awayo_stripe', 'abysslac', 'liikofiteal', 0.05),
    ], [
        PN(0.42, 0.58, 'steps', 'abysslac', 'liikofiteal', 0.11, down=0.40),
    ], fabric='cloth.weave.twill')
    burnous_p = P('liikofiteal', 0.05, [
        B('bottom', 0.0, 0.026, 'solid', 'saffron'),
        B('top', 0.0, 0.016, 'solid', 'saltlime'),
    ], fabric=WOOL)
    belt_p = P('leather', 0.04, [B('top', 0.0, 0.010, 'awayo_stripe', 'saffron', 'abysslac', 0.04)], fabric='leather.polished')
    if sex == 'm':
        uncu_tube = torso_tube(gid_t + '_uncu', TOP, CROTCH - 0.04, 0.017, uncu_p,
                               n=44, rows=18, hang_from=WAIST - 0.02, flare=0.07,
                               group_below=CROTCH + 0.02, hull_from=CHEST + 0.02)
    else:
        uncu_tube = torso_tube(gid_t + '_uncu', TOP, WAIST - 0.034, 0.016, uncu_p,
                               n=44, rows=14, hull_from=CHEST + 0.02)
        uncu_tube.cloth = None
    burnous_yoke = collar_disc(gid_t + '_burnous_collar', 0.108, burnous_p, drop=0.092, rows=8, n=46, scallop=0.03, ease=0.019)
    burnous_yoke.cloth = None
    parts_t = [
        uncu_tube,
        burnous_yoke,
        torso_tube(gid_t + '_belt', WAIST + 0.034, WAIST - 0.030, 0.021, belt_p,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017,
                           P('liikofiteal', 0.05, [B('bottom', 0.0, 0.028, 'solid', 'saffron')], fabric='cloth.weave.twill'),
                           ease_end=0.024, rows=9))
    if sex == 'f':
        for sx_p, tg_p in ((-0.052, 'R'), (0.052, 'L')):
            parts_t.extend(_tizerzai_fibula(
                f'{gid_t}_fibula_{tg_p}', chest_front(CHEST + 0.052, 0.023, x=sx_p),
                FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.80,
                P('tinmirror', 0.03, fabric='metal.tin.patchwork'), P('abysslac', 0.02, fabric='beads.glass')
            ))
    # Lung-herb chuspa bag & brass switchback mule-bell
    parts_t.append(_chuspa_pouch(gid_t, WAIST, 0.68 * math.pi, 0.022,
                                 P('abysslac', 0.04, [B('bottom', 0.0, 0.02, 'awayo_stripe', 'saffron', 'liikofiteal', 0.04)], fabric=WOOL)))
    d_bell = np.array([-0.82, -0.57, 0.0])
    d_bell /= np.linalg.norm(d_bell)
    parts_t.append(blob(gid_t + '_mule_bell', surface_out(spine_at(WAIST - 0.022), d_bell, 0.022, bvh=core.BVH_T),
                        (0.036, 0.034, 0.046), P('brass', 0.02, fabric='metal.gold'),
                        n=10, rows=5, out=d_bell, rigid_joint='Hips', role='trinket'))
    entries.append(assemble_garment(
        gid_t, 'Verge Switchback Uncu & Thrown-Back Burnous Cowl', 'torso', 'tabisti', parts_t
    ))

    # 2.3 Gloves: Cableway grip-gloves
    gid_g = f'tab_{sex}_porter_gloves'
    cuff_g = P('liikofiteal', 0.05, [B('top', 0.0, 0.016, 'awayo_stripe', 'saffron', 'abysslac', 0.035)], fabric=WOOL)
    palm_g = P('peatumber', 0.05, fabric='rubber.tyre')
    entries.append(assemble_garment(
        gid_g, 'Barrel-Cableway Rubberized Grip-Gloves', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g, cuff_g, palm_g)
    ))

    # 2.4 Legs: Rugged breeches w/ knitted wool calf-warmer cuffs
    gid_l = f'tab_{sex}_porter_trousers'
    tr_p = P('peatumber', 0.05, [
        B('bottom', 0.0, 0.095, 'awayo_stripe', 'saffron', 'abysslac', 0.045),
        B('top', 0.0, 0.024, 'solid', 'liikofiteal'),
    ], fabric='cloth.weave.twill')
    parts_l = trousers(gid_l, tr_p, ease=0.018, ease_end=0.022, cuff=ANKLE + 0.06)
    if sex == 'f':
        parts_l.append(skirt(gid_l + '_hipwrap', CROTCH - 0.06, WAIST,
                             P('abysslac', 0.05, [B('bottom', 0.0, 0.028, 'awayo_stripe', 'saffron', 'liikofiteal', 0.045)], fabric=WOOL),
                             ease=0.026, flare=0.06, rows=10, n=40))
    entries.append(assemble_garment(
        gid_l, 'Cliff-Switchback Twill Breeches & Wool Calf-Warmers', 'legs', 'tabisti', parts_l, legged=True
    ))

    # 2.5 Feet: Rubber-soled cliff boots w/ striped wool wraps
    gid_f = f'tab_{sex}_porter_boots'
    sole_f = P('soot', 0.05, fabric='rubber.tyre')
    up_f = P('leather', 0.05, [
        B('top', 0.0, 0.042, 'awayo_stripe', 'saffron', 'abysslac', 0.04),
        B('bottom', 0.0, 0.030, 'solid', 'peatumber'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(
        gid_f, 'Rubber-Lugged Cliff Boots & Knitted Calf-Wraps', 'feet', 'tabisti',
        boots(gid_f, sole_f, up_f, top=0.52, wraps=3, wrap_paint=P('abysslac', 0.04, fabric=WOOL), ease_top=0.032)
    ))

    # 2.6 Back: Towering slatted reed-and-awayo cliff-freight rack w/ amphorae, rope & Yaz tin charm
    gid_b = f'tab_{sex}_porter_rack'
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    reed_p = P('totorareed', 0.06, [B('top', 0.0, 0.04, 'stripes', 'abysslac', 'totorareed', 0.02)], fabric='straw.reed.plaited')
    bale_p = P('abysslac', 0.05, [
        B('top', 0.0, 0.04, 'awayo_stripe', 'saffron', 'liikofiteal', 0.05),
        B('bottom', 0.0, 0.04, 'awayo_stripe', 'saltlime', 'abysslac', 0.05),
    ], [PN(0.15, 0.85, 'awayo_stripe', 'saffron', 'liikofiteal', 0.08)], fabric=WOOL)
    amph_p = P('terracotta', 0.04, [
        B('top', 0.0, 0.035, 'solid', 'abysslac'),
        B('bottom', 0.0, 0.030, 'steps', 'saltlime', 'abysslac', 0.035),
    ], fabric='leather.polished')
    parts_b = [
        # Main freight bale padded against back
        blob(gid_b + '_awayo_bale', back_b + np.array([0.0, 0.042, 0.020]), (0.24, 0.13, 0.34),
             bale_p, n=16, rows=7, out=d_bk, rigid_joint='Spine2'),
    ]
    # Twin tall totora-reed side-rails rising above head height + cross-slats
    for sd_r, tg_r in ((-1.0, 'R'), (1.0, 'L')):
        rx = sd_r * 0.105
        parts_b.append(tube(f'{gid_b}_rail_{tg_r}',
                            [back_b + np.array([rx, 0.020, 0.28]), back_b + np.array([rx, 0.020, -0.18])],
                            0.015, reed_p, n=10, rigid_joint='Spine2'))
        # Paired ceramic salt/oil amphorae lashed to upper rack
        ac = back_b + np.array([sd_r * 0.062, 0.088, 0.165])
        parts_b.append(blob(f'{gid_b}_amphora_{tg_r}', ac, (0.095, 0.090, 0.175),
                            amph_p, n=12, rows=6, out=d_bk, rigid_joint='Spine2'))
    for idx_s, zs_r in enumerate((-0.13, 0.04, 0.24)):
        parts_b.append(tube(f'{gid_b}_slat_{idx_s}',
                            [back_b + np.array([-0.115, 0.022, zs_r]), back_b + np.array([0.115, 0.022, zs_r])],
                            0.012, reed_p, n=8, rigid_joint='Spine2'))
    # Coiled climbing rope & sacred Yaz tin-mirror charm on the rear face
    rope_c = back_b + np.array([0.0, 0.110, -0.055])
    rope_pts = [
        rope_c + np.array([math.cos(2.0 * math.pi * k / 12.0) * 0.064, 0.006 * (k / 24.0 - 0.5),
                           math.sin(2.0 * math.pi * k / 12.0) * 0.068])
        for k in range(25)
    ]
    parts_b.append(horn(gid_b + '_rope_coil', rope_pts, 0.013, 0.013,
                        P('sand', 0.06, fabric='straw.reed.plaited'), n=8, rows=25, rigid_joint='Spine2'))
    yaz_c = back_b + np.array([0.0, 0.112, 0.060])
    tin_p = P('tinmirror', 0.02, fabric='metal.tin.patchwork')
    parts_b.append(rosette(gid_b + '_charm_disc', yaz_c, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.036, P('abysslac', 0.04, fabric='leather.polished'), n=14, thick=0.008, rigid_joint='Spine2'))
    parts_b.extend(_yaz_emblem(gid_b, yaz_c + d_bk * 0.006, d_bk, np.array([1.0, 0.0, 0.0]),
                               np.array([0.0, 0.0, 1.0]), 0.028, tin_p, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.04, fabric='leather.polished'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Towering Totora-Reed & Awayo Cliff-Freight Rack', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 3: `reed_weaver` — Reed Lake Totora Boatman & Chakana Weaver (`5 x 2 = 10` pieces)
# ===========================================================================================================
def _build_reed_weaver(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, *_ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []

    # 3.1 Head: Flat-brimmed woven totora-reed & wool pom-pom montera-Jbala hat
    gid_h = f'tab_{sex}_weaver_montera'
    reed_p = P('totorareed', 0.06, [
        B('bottom', 0.0, 0.024, 'chakana_red', 'abysslac', 'saltlime', 0.045),
        B('top', 0.0, 0.018, 'solid', 'liikofiteal'),
    ], fabric='straw.reed.plaited')
    hat_dome = head_rings(gid_h + '_crown', 0.54, 1.04, 0.016, reed_p, n=36, rows=7, apex=True)
    hat_brim = brim(gid_h + '_brim', 0.62, 0.135, reed_p, ease=0.018, rows=6, n=40, droop=0.008, lift=0.010)
    hat_brim.rigid_joint = 'Head'
    hat_dome.rigid_joint = 'Head'
    parts_h = [
        hat_dome,
        hat_brim,
        crown_band(gid_h + '_band', P('abysslac', 0.04, [B('top', 0.0, 0.008, 'solid', 'saffron')], fabric=WOOL),
                   f0=0.58, f1=0.74, ease=0.020, flare=0.006, rows=5, n=36),
    ]
    # Jbala / Andean wool pom-poms seated directly on the outer brim edge (`d_host ~ 0 mm`)
    outer_ring = hat_brim.P[-1]
    for k_pm in range(8):
        idx_pm = (k_pm * len(outer_ring)) // 8
        pom_col = 'abysslac' if (k_pm % 2 == 0) else 'liikofiteal'
        parts_h.append(blob(f'{gid_h}_pom_{k_pm}', outer_ring[idx_pm],
                            (0.026, 0.026, 0.024), P(pom_col, 0.06, fabric=WOOL),
                            n=8, rows=4, out=up, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Reed Lake Totora-Reed & Pom-Pom Montera Hat', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 3.2 Torso: Central chakana-panel tunic in abyss-lac red, verdigris teal & golden totora reed
    gid_t = f'tab_{sex}_weaver_tunic'
    tun_p = P('abysslac', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'totorareed'),
        B('bottom', 0.0, 0.032, 'awayo_stripe', 'totorareed', 'liikofiteal', 0.05),
    ], [
        PN(0.39, 0.61, 'chakana_red', 'saltlime', 'abysslac', 0.14),
        PN(0.36, 0.39, 'solid', 'liikofiteal', 'abysslac', 1.0),
        PN(0.61, 0.64, 'solid', 'liikofiteal', 'abysslac', 1.0),
    ], fabric=WOOL)
    sash_p = P('liikofiteal', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'totorareed'),
        B('bottom', 0.0, 0.010, 'solid', 'saltlime'),
    ], [PN(0.0, 1.0, 'fret', 'saltlime', 'liikofiteal', 0.05)], fabric=WOOL)
    if sex == 'm':
        w_tun_tube = torso_tube(gid_t + '_tunic', TOP, CROTCH - 0.06, 0.020, tun_p,
                                n=46, rows=18, hang_from=WAIST + 0.01, flare=0.16, ease_bottom=0.026,
                                group_below=CROTCH + 0.02, hull_from=CHEST + 0.02)
    else:
        w_tun_tube = torso_tube(gid_t + '_tunic', TOP, WAIST - 0.034, 0.018, tun_p,
                                n=46, rows=14, hull_from=CHEST + 0.02)
        w_tun_tube.cloth = None
    parts_t = [
        w_tun_tube,
        collar(gid_t + '_reed_collar', P('totorareed', 0.05, fabric='straw.reed.plaited'),
               height=0.024, flare=0.008, ease=0.021),
        torso_tube(gid_t + '_sash', WAIST + 0.032, WAIST - 0.030, 0.023, sash_p,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    parts_t.extend(sleeves(gid_t, 'elbow', 0.013,
                           P('liikofiteal', 0.05, [
                               B('top', 0.0, 0.068, 'solid', 'abysslac'),
                               B('bottom', 0.0, 0.028, 'chakana_red', 'saltlime', 'abysslac', 0.045),
                           ], fabric=COTTON),
                           ease_end=0.022, rows=8))
    if sex == 'f':
        shawl_p = P('liikofiteal', 0.05, [B('bottom', 0.0, 0.030, 'chakana_terra', 'totorareed', 'abysslac', 0.05)], fabric=WOOL)
        parts_t.append(collar_disc(gid_t + '_shawl', 0.078, shawl_p, drop=0.068, rows=8, n=44, scallop=0.04, ease=0.019))
    # Tin-mirror Reed-Lake Fish sign brooch at chest + bone loom shuttle on belt
    tin_p = P('tinmirror', 0.02, fabric='metal.tin.patchwork')
    fish_c = chest_front(CHEST + 0.048, 0.021, x=0.0)
    parts_t.append(blob(gid_t + '_fish_sign', fish_c, (0.052, 0.012, 0.024),
                        tin_p, n=10, rows=4, out=FRONT, rigid_joint='Spine2', role='trinket'))
    d_sh = np.array([0.78, -0.62, 0.0])
    d_sh /= np.linalg.norm(d_sh)
    p_sh = surface_out(spine_at(WAIST - 0.010), d_sh, 0.023, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_loom_shuttle',
                        [p_sh + np.array([0.0, 0.0, 0.065]), p_sh - np.array([0.0, 0.0, 0.065])],
                        0.011, P('bone', 0.03, [B('top', 0.0, 0.02, 'solid', 'abysslac')], fabric='leather.polished'),
                        n=8, rigid_joint='Hips'))
    entries.append(assemble_garment(
        gid_t, 'Reed Lake Chakana-Panel Tunic & Fish-Sign Pin', 'torso', 'tabisti', parts_t
    ))

    # 3.3 Legs: Rolled marsh-wading breeches (M) / Chakana marsh-skirt over wading breeches (F)
    gid_l = f'tab_{sex}_weaver_breeches'
    br_p = P('liikofiteal', 0.05, [
        B('bottom', 0.0, 0.032, 'solid', 'totorareed'),
        B('bottom', 0.032, 0.065, 'chakana_red', 'saltlime', 'abysslac', 0.045),
    ], fabric=COTTON)
    parts_l = trousers(gid_l, br_p, ease=0.011, ease_end=0.018, bag=0.0, cuff=ANKLE + 0.16)
    if sex == 'f':
        sk_p = P('abysslac', 0.05, [
            B('bottom', 0.0, 0.050, 'chakana_red', 'saltlime', 'liikofiteal', 0.055),
            B('top', 0.0, 0.020, 'solid', 'totorareed'),
        ], fabric=WOOL)
        parts_l.append(skirt(gid_l + '_marsh_skirt', KNEE - 0.01, WAIST, sk_p, ease=0.027, flare=0.09, rows=12, n=40))
    entries.append(assemble_garment(
        gid_l, 'Reed Lake Rolled Marsh-Wading Breeches', 'legs', 'tabisti', parts_l, legged=True
    ))

    # 3.4 Feet: Braided totora/rubber marsh sandals
    gid_f = f'tab_{sex}_weaver_sandals'
    entries.append(assemble_garment(
        gid_f, 'Braided Totora-Reed & Rubber Boatman Sandals', 'feet', 'tabisti',
        sandal(gid_f, P('peatumber', 0.05, fabric='rubber.tyre'),
               P('totorareed', 0.05, fabric='straw.reed.plaited'),
               guard=True, laces=2, strap_paint2=P('abysslac', 0.04, fabric=WOOL))
    ))

    # 3.5 Back: Wicker fish-creel basket & rolled mat-reed paper scrolls
    gid_b = f'tab_{sex}_weaver_creel'
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    creel_p = P('totorareed', 0.06, [
        B('top', 0.0, 0.038, 'solid', 'liikofiteal'),
        B('bottom', 0.0, 0.032, 'chakana_terra', 'abysslac', 'totorareed', 0.045),
    ], [PN(0.0, 1.0, 'net_mesh', 'peatumber', 'totorareed', 0.05)], fabric='straw.reed.plaited')
    scroll_p = P('saltlime', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'abysslac'),
        B('bottom', 0.0, 0.025, 'solid', 'liikofiteal'),
    ], fabric='cloth.plain')
    parts_b = [
        blob(gid_b + '_creel', back_b + np.array([-0.025, 0.042, -0.020]), (0.21, 0.13, 0.27),
             creel_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'),
        blob(gid_b + '_creel_lid', back_b + np.array([-0.025, 0.040, 0.115]), (0.17, 0.10, 0.045),
             P('liikofiteal', 0.05, fabric='straw.reed.plaited'), n=12, rows=4, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'),
    ]
    for idx_sc, dx_sc in enumerate((-0.035, 0.035, 0.088)):
        sc_c = back_b + np.array([dx_sc, 0.095, 0.055])
        parts_b.append(tube(f'{gid_b}_reed_scroll_{idx_sc}',
                            [sc_c + np.array([0.02, 0.0, 0.135]), sc_c - np.array([0.02, 0.0, 0.135])],
                            0.020, scroll_p, n=10, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('totorareed', 0.05, fabric='straw.reed.plaited'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Wicker Fish-Creel & Rolled Mat-Reed Paper Scrolls', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 4: `trade` — Mungo & Liikofi Shore-Market Factor (`5 x 2 = 10` pieces)
# ===========================================================================================================
def _build_trade(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    silver_p = P('silver', 0.02, fabric='metal.iron')
    cerul_p = P('altarcerulean', 0.02, fabric='glass.moonglass.leaded')

    # 4.1 Head: Indigo tagelmust turban over crimson chullo w/ silver tizerzai brooch
    gid_h = f'tab_{sex}_trade_tagelmust'
    chullo_cap = P('abysslac', 0.04, [B('bottom', 0.0, 0.018, 'solid', 'saffron')], fabric=WOOL)
    tag_base = P('atlasindigo', 0.04, [
        B('top', 0.0, 0.020, 'stripes', 'saffron', 'atlasindigo', 0.025),
        B('bottom', 0.0, 0.018, 'solid', 'liikofiteal'),
    ], fabric=COTTON)
    tag_wrap = P('atlasindigo', 0.04, [
        B('top', 0.0, 0.008, 'solid', 'saffron'),
        B('bottom', 0.0, 0.008, 'solid', 'abysslac'),
    ], fabric=COTTON)
    parts_h = [head_rings(gid_h + '_under_chullo', 0.48, 0.88, 0.014, chullo_cap, n=32, rows=5)]
    t_parts = turban(gid_h + '_tagelmust', tag_base, wrap_paint=tag_wrap, size=0.65, ribbons=3)
    for tp in t_parts:
        tp.rigid_joint = 'Head'
    parts_h.extend(t_parts)
    brow_pt = _snap_on_part(t_parts[0], a + (b - a) * (f_brow + 0.14) - bk * 0.12, -bk, offset=0.003)
    parts_h.extend(_tizerzai_fibula(gid_h + '_brooch', brow_pt, -bk, left, up, 0.78, silver_p, cerul_p, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Shore-Factor Indigo Tagelmust & Silver Tizerzai', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 4.2 Torso: Open-front hooded Maghrebi jellaba/selham over verdigris-and-gold uncu waistcoat
    gid_t = f'tab_{sex}_trade_jellaba'
    jellaba_p = P('atlasindigo', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'saffron'),
        B('bottom', 0.0, 0.032, 'solid', 'saffron'),
        B('bottom', 0.032, 0.088, 'zellij_star', 'liikofiteal', 'abysslac', 0.075),
    ], [
        # Open-front jellaba framing central verdigris & gold tocapu-zellige uncu waistcoat
        PN(0.39, 0.61, 'zellij_star', 'gold', 'liikofiteal', 0.12),
        PN(0.36, 0.39, 'solid', 'saffron', 'atlasindigo', 1.0),
        PN(0.61, 0.64, 'solid', 'saffron', 'atlasindigo', 1.0),
    ], fabric=WOOL)
    selham_p = P('atlasindigo', 0.04, [
        B('bottom', 0.0, 0.028, 'awayo_stripe', 'saffron', 'abysslac', 0.05),
        B('top', 0.0, 0.016, 'solid', 'gold'),
    ], fabric=WOOL)
    sash_p = P('abysslac', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'liikofiteal'),
    ], [PN(0.0, 1.0, 'chakana_red', 'gold', 'abysslac', 0.06)], fabric='cloth.silk')
    hem_z = (KNEE - 0.06) if sex == 'm' else (KNEE - 0.08)
    selham_yoke = collar_disc(gid_t + '_selham_yoke', 0.086, selham_p, drop=0.072, rows=8, n=44, scallop=0.03, ease=0.019)
    selham_yoke.cloth = None
    parts_t = [
        torso_tube(gid_t + '_jellaba', TOP, hem_z, 0.016, jellaba_p,
                   n=48, rows=20, hang_from=WAIST - 0.02, flare=0.12,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        collar(gid_t + '_collar', P('liikofiteal', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='cloth.silk'),
               height=0.028, flare=0.008, ease=0.020),
        selham_yoke,
        cape(gid_t + '_selham_cowl', WAIST - 0.10, selham_p, span=0.40, ease=0.032, flare=0.14, rows=15, n=28),
        torso_tube(gid_t + '_sash', WAIST + 0.034, WAIST - 0.030, 0.021, sash_p,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017,
                           P('atlasindigo', 0.04, [
                               B('bottom', 0.0, 0.026, 'solid', 'saffron'),
                               B('bottom', 0.026, 0.062, 'zellij_star', 'gold', 'liikofiteal', 0.05),
                           ], fabric=WOOL),
                           ease_end=0.040, rows=9))
    # Swamp-copal amber bead strand across chest + tizerzai clasps (twin on F, central on M)
    copal_p = P('amber', 0.02, fabric='beads.glass')
    for k_b in range(13):
        u_b = k_b / 12.0
        ang_b = (u_b - 0.5) * 0.85 * math.pi
        bx = math.sin(ang_b) * 0.078
        bz = (TOP - 0.022) - math.cos(ang_b) * 0.085
        parts_t.append(blob(f'{gid_t}_copal_{k_b}', chest_front(bz, 0.021, x=bx),
                            (0.015, 0.012, 0.015), copal_p, n=8, rows=4, out=FRONT, rigid_joint='Spine2', role='trinket'))
    if sex == 'f':
        for sx_f, tg_f in ((-0.056, 'R'), (0.056, 'L')):
            parts_t.extend(_tizerzai_fibula(
                f'{gid_t}_tizerzai_{tg_f}', chest_front(CHEST + 0.055, 0.022, x=sx_f),
                FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.84, silver_p, cerul_p
            ))
    # Brass market scales & curved koummya/tumi dagger on sash
    d_sc = np.array([0.80, -0.60, 0.0])
    d_sc /= np.linalg.norm(d_sc)
    p_sc = surface_out(spine_at(WAIST - 0.012), d_sc, 0.023, bvh=core.BVH_T)
    brass_p = P('brass', 0.02, fabric='metal.gold')
    parts_t.append(tube(gid_t + '_scale_beam',
                        [p_sc + np.array([0.0, 0.0, 0.048]), p_sc - np.array([0.0, 0.0, 0.048])],
                        0.008, brass_p, n=8, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_scale_pan', p_sc - np.array([0.0, 0.0, 0.036]),
                           d_sc, FRONT, 0.024, brass_p, n=12, thick=0.007, rigid_joint='Hips'))
    parts_t.extend(_koummya_hip(gid_t, WAIST, 0.022, silver_p, brass_p, side_sgn=-1.0))
    entries.append(assemble_garment(
        gid_t, 'Mungo Factor Open Jellaba, Tocapu Waistcoat & Scales', 'torso', 'tabisti', parts_t
    ))

    # 4.3 Legs: Indigo serouel trousers
    gid_l = f'tab_{sex}_trade_serouel'
    ser_p = P('atlasindigo', 0.04, [
        B('bottom', 0.0, 0.026, 'solid', 'saffron'),
        B('bottom', 0.026, 0.068, 'chakana_red', 'saffron', 'abysslac', 0.05),
    ], fabric=COTTON)
    entries.append(assemble_garment(
        gid_l, 'Mungo Market Indigo Serouel Trousers', 'legs', 'tabisti',
        trousers(gid_l, ser_p, ease=0.022, ease_end=0.026, bag=0.038, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 4.4 Feet: Saffron & crimson babouche-toe market boots
    gid_f = f'tab_{sex}_trade_babouche'
    sole_f = P('leather', 0.05, [B('top', 0.0, 0.010, 'solid', 'gold')], fabric='leather.polished')
    up_f = P('saffron', 0.04, [
        B('top', 0.0, 0.035, 'solid', 'abysslac'),
        B('bottom', 0.0, 0.028, 'zellij_star', 'liikofiteal', 'abysslac', 0.035),
    ], fabric='leather.polished')
    entries.append(assemble_garment(
        gid_f, 'Saffron & Lac-Crimson Babouche Market Boots', 'feet', 'tabisti',
        boots(gid_f, sole_f, up_f, top=0.38, ease_top=0.028)
    ))

    # 4.5 Back: Zellige-tooled ledger satchel & rolled awayo cloth bolts
    gid_b = f'tab_{sex}_trade_satchel'
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    case_p = P('saddle', 0.04, [
        B('top', 0.0, 0.032, 'solid', 'brass'),
        B('bottom', 0.0, 0.028, 'solid', 'abysslac'),
    ], [PN(0.14, 0.86, 'zellij_star', 'gold', 'atlasindigo', 0.09)], fabric='leather.polished')
    bolt_a = P('abysslac', 0.04, [B('top', 0.0, 0.04, 'awayo_stripe', 'saffron', 'liikofiteal', 0.05)],
               [PN(0.0, 1.0, 'awayo_stripe', 'saffron', 'abysslac', 0.07)], fabric=WOOL)
    bolt_b = P('liikofiteal', 0.04, [B('top', 0.0, 0.04, 'chakana_red', 'saltlime', 'abysslac', 0.05)],
               [PN(0.0, 1.0, 'chakana_red', 'saltlime', 'liikofiteal', 0.07)], fabric=WOOL)
    parts_b = [
        blob(gid_b + '_zellige_satchel', back_b + np.array([0.0, 0.038, -0.025]), (0.24, 0.10, 0.24),
             case_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'),
        tube(gid_b + '_awayo_bolt_top',
             [back_b + np.array([-0.14, 0.050, 0.115]), back_b + np.array([0.14, 0.050, 0.115])],
             0.036, bolt_a, n=12, rigid_joint='Spine2'),
        tube(gid_b + '_chakana_bolt_bot',
             [back_b + np.array([-0.13, 0.045, -0.155]), back_b + np.array([0.13, 0.045, -0.155])],
             0.032, bolt_b, n=12, rigid_joint='Spine2'),
    ]
    parts_b.extend(pack_straps(gid_b, P('leather', 0.04, fabric='leather.polished'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Zellige-Tooled Ledger Satchel & Awayo Cloth Bolts', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 5: `dredger` — Abyssal Brine-Pan & Relic-Container Dredger (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_dredger(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    tin_p = P('tinmirror', 0.03, [B('top', 0.0, 0.04, 'tin_patchwork', 'tinmirror', 'iron', 0.06)], fabric='metal.tin.patchwork')
    rub_p = P('soot', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'liikofiteal')], fabric='rubber.tyre')

    # 5.1 Head: Salt-crusted verdigris headwrap + salvaged bottle-bottom brine goggles
    gid_h = f'tab_{sex}_dredger_wrap'
    wrap_p = P('liikofiteal', 0.06, [
        B('bottom', 0.0, 0.024, 'solid', 'saltlime'),
        B('top', 0.0, 0.028, 'stripes', 'saltlime', 'liikofiteal', 0.024),
    ], [PN(0.35, 0.65, 'tifinagh_lime', 'saltlime', 'liikofiteal', 0.06)], fabric=COTTON)
    band_h = crown_band(gid_h + '_brow_wrap', wrap_p, f0=0.52, f1=0.82, ease=0.020, flare=0.010, rows=6, n=36)
    parts_h = [
        head_rings(gid_h + '_crown', 0.46, 1.04, 0.018, wrap_p, n=34, rows=8, apex=True),
        band_h,
    ]
    # Nape brine-cloth flap
    fs_np = np.linspace(max(0.02, f_nose - 0.24), f_eyes + 0.02, 5)
    angs_np = np.linspace(-0.52 * math.pi, 0.52 * math.pi, 20)
    Np_grid = []
    for k_n, fv in enumerate(fs_np):
        c_ray = a + (b - a) * max(fv, 0.36)
        c_cur = a + (b - a) * fv
        Np_grid.append([
            pt + (c_cur - c_ray)
            for pt in ring_points(c_ray, bk, left, angs_np, 0.018 + 0.008 * (1.0 - k_n / 4.0), rmin=0.05, rmax=0.17)
        ])
    parts_h.append(Part(gid_h + '_nape_cloth', np.array(Np_grid), False, ['body'] * len(fs_np), wrap_p, rigid_joint='Head'))

    # Salvaged thick bottle-bottom brine goggles seated directly on `band_h` (`d_host ~ 2 mm`)
    gog_p = P('altarcerulean', 0.02, [
        B('top', 0.0, 0.010, 'solid', 'tinmirror'),
        B('bottom', 0.0, 0.010, 'solid', 'copper'),
    ], fabric='glass.moonglass.leaded')
    c_gog = a + (b - a) * (f_brow + 0.04)
    g_pts = []
    for sd_g, tg_g in ((-1.0, 'R'), (1.0, 'L')):
        d_g = -bk + left * (0.22 * sd_g)
        d_g /= np.linalg.norm(d_g)
        p_g = _snap_on_part(band_h, c_gog + d_g * 0.11, d_g, offset=0.003)
        g_pts.append(p_g)
        parts_h.append(blob(f'{gid_h}_bottle_goggle_{tg_g}', p_g, (0.046, 0.024, 0.042),
                            gog_p, n=14, rows=5, out=d_g, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_goggle_bridge', g_pts, 0.006, 0.006, tin_p, n=6, rows=4, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid_h, 'Salt-Crusted Verdigris Wrap & Bottle-Bottom Brine Goggles', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 5.2 Torso: Vulcanized rubber tunic + uncu tabard armored w/ riveted metal.tin.patchwork strips & pressure gauge
    gid_t = f'tab_{sex}_dredger_tunic'
    tab_p = P('liikofiteal', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'saltlime'),
        B('bottom', 0.0, 0.045, 'tin_patchwork', 'tinmirror', 'iron', 0.06),
    ], [
        PN(0.24, 0.76, 'tin_patchwork', 'tinmirror', 'liikofiteal', 0.11, down=0.34),
        PN(0.36, 0.64, 'stencil:28', 'saltlime', 'liikofiteal', 0.16),
    ], fabric='cloth.canvas.oiled')
    parts_t = [
        torso_tube(gid_t + '_rubber_tunic', TOP, CROTCH - 0.05, 0.016, rub_p,
                   n=44, rows=18, hang_from=WAIST - 0.02, flare=0.05,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        collar(gid_t + '_seal_collar', P('peatumber', 0.04, [B('top', 0.0, 0.008, 'solid', 'tinmirror')], fabric='rubber.tyre'),
               height=0.028, flare=0.006, ease=0.020),
    ]
    parts_t.extend(tabard(gid_t + '_tin_tabard', CROTCH - 0.08, TOP - 0.012, tab_p,
                          width=0.24, ease=0.021, front=True, back=True))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, rub_p, ease_end=0.024, rows=9))
    for sd_s in (L, R):
        parts_t.append(pauldron(f'{gid_t}_tin_sh_{sd_s[0]}', sd_s, tin_p, reach=0.30, ease=0.023, rows=5, n=12))
    belt_d = P('peatumber', 0.04, [B('top', 0.0, 0.012, 'solid', 'tinmirror')], fabric='rubber.tyre')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.034, WAIST - 0.032, 0.023, belt_d,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    # Geomancer hyperbaric pressure-gauge dial on right front belt
    d_pg = np.array([-0.74, -0.67, 0.0])
    d_pg /= np.linalg.norm(d_pg)
    p_pg = surface_out(spine_at(WAIST - 0.008), d_pg, 0.025, bvh=core.BVH_T)
    parts_t.append(rosette(gid_t + '_pressure_gauge', p_pg, d_pg, FRONT, 0.030,
                           P('brass', 0.02, [B('top', 0.0, 0.45, 'rays', 'saltlime', 'brass', 0.035)],
                             fabric='metal.gold'),
                           n=14, thick=0.011, rigid_joint='Hips'))
    entries.append(assemble_garment(
        gid_t, 'Vulcanized Rubber & Tin-Patchwork Brine-Dredger Tunic', 'torso', 'tabisti', parts_t
    ))

    # 5.3 Gloves: Rubber-and-tin salvage gauntlets
    gid_g = f'tab_{sex}_dredger_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Rubber & Riveted Tin-Patchwork Salvage Gauntlets', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g, tin_p, rub_p, f0=0.58)
    ))

    # 5.4 Legs: Brine-proof rubber & verdigris canvas leggings (M+F parity!)
    gid_l = f'tab_{sex}_dredger_leggings'
    leg_p = P('liikofiteal', 0.05, [
        B('bottom', 0.0, 0.095, 'solid', 'soot'),
        B('top', 0.0, 0.035, 'tin_patchwork', 'tinmirror', 'liikofiteal', 0.05),
    ], [PN(0.32, 0.68, 'tin_patchwork', 'tinmirror', 'soot', 0.14)], fabric='rubber.tyre')
    entries.append(assemble_garment(
        gid_l, 'Brine-Pan Rubber & Tin-Reinforced Salvage Leggings', 'legs', 'tabisti',
        trousers(gid_l, leg_p, ease=0.018, ease_end=0.022, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 5.5 Feet: Heavy rubber & tin-cap salvage boots
    gid_f = f'tab_{sex}_dredger_boots'
    entries.append(assemble_garment(
        gid_f, 'Heavy Vulcanized Brine-Salvage Wader Boots', 'feet', 'tabisti',
        boots(gid_f, P('soot', 0.05, fabric='rubber.tyre'),
              P('peatumber', 0.05, [B('top', 0.0, 0.042, 'tin_patchwork', 'tinmirror', 'liikofiteal', 0.045)], fabric='rubber.tyre'),
              top=0.58, wraps=2, wrap_paint=tin_p, ease_top=0.032)
    ))

    # 5.6 Back: Container-tin dredge-hod & glowing altar-cerulean crystal lantern
    gid_b = f'tab_{sex}_dredger_hod'
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    hod_p = P('tinmirror', 0.04, [
        B('top', 0.0, 0.032, 'solid', 'liikofiteal'),
        B('bottom', 0.0, 0.032, 'solid', 'peatumber'),
    ], [
        PN(0.0, 1.0, 'tin_patchwork', 'tinmirror', 'liikofiteal', 0.09),
        PN(0.30, 0.70, 'stencil:09', 'saltlime', 'liikofiteal', 0.14),
    ], fabric='metal.tin.patchwork')
    lant_p = P('altarcerulean', 0.02, [
        B('top', 0.0, 0.022, 'solid', 'brass'),
        B('bottom', 0.0, 0.022, 'solid', 'brass'),
    ], fabric='glass.moonglass.leaded')
    lc = back_b + np.array([0.095, 0.095, 0.095])
    parts_b = [
        blob(gid_b + '_tin_hod', back_b + np.array([-0.015, 0.045, 0.010]), (0.24, 0.13, 0.31),
             hod_p, n=14, rows=6, out=d_bk, rigid_joint='Spine2'),
        tube(gid_b + '_salvage_bar',
             [back_b + np.array([-0.105, 0.090, 0.21]), back_b + np.array([-0.105, 0.090, -0.17])],
             0.014, P('iron', 0.03, fabric='metal.iron'), n=8, rigid_joint='Spine2'),
        tube(gid_b + '_crystal_lantern',
             [lc + np.array([0.0, 0.0, 0.065]), lc - np.array([0.0, 0.0, 0.065])],
             0.032, lant_p, n=12, rigid_joint='Spine2'),
    ]
    parts_b.extend(pack_straps(gid_b, rub_p, ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Salvage Container-Tin Dredge-Hod & Altar-Crystal Lantern', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 6: `tin_smith` — Ibisen Tin-Mirror & Silver Tizerzai Artisan (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_tin_smith(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    tin_p = P('tinmirror', 0.02, [B('top', 0.0, 0.03, 'tin_patchwork', 'tinmirror', 'silver', 0.05)], fabric='metal.tin.patchwork')
    brass_p = P('brass', 0.02, fabric='metal.gold')

    # 6.1 Head: Studded leather & kilim pillbox w/ flip-up jeweller's loupe
    gid_h = f'tab_{sex}_smith_pillbox'
    pill_p = P('abysslac', 0.04, [
        B('bottom', 0.0, 0.026, 'diamonds', 'saffron', 'atlasindigo', 0.038),
        B('top', 0.0, 0.016, 'solid', 'tinmirror'),
    ], fabric='leather.polished')
    pill_hat = tower_hat(gid_h + '_pillbox', 0.095, lambda s: 1.0 - 0.06 * s, pill_p, f=0.60, ease=0.016, rows=7, n=36)
    band_h = crown_band(gid_h + '_stud_band', P('leather', 0.04, [B('top', 0.0, 0.012, 'beads', 'tinmirror', 'leather', 0.03)],
                                                fabric='leather.polished'),
                        f0=0.55, f1=0.70, ease=0.019, flare=0.005, rows=4, n=36)
    d_lp = -bk - left * 0.28
    d_lp /= np.linalg.norm(d_lp)
    p_lp = _snap_on_part(band_h, a + (b - a) * (f_brow + 0.05) + d_lp * 0.11, d_lp, offset=0.003)
    parts_h = [
        pill_hat,
        band_h,
        blob(gid_h + '_jeweller_loupe', p_lp, (0.038, 0.028, 0.038),
             P('altarcerulean', 0.02, [B('top', 0.0, 0.010, 'solid', 'brass')], fabric='glass.moonglass.leaded'),
             n=12, rows=5, out=d_lp, rigid_joint='Head'),
        horn(gid_h + '_loupe_arm', [p_lp, _snap_on_part(band_h, p_lp - left * 0.038 + up * 0.012, -left, 0.002)],
             0.005, 0.005, brass_p, n=6, rows=4, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(
        gid_h, "Studded Kilim Pillbox & Flip-Up Jeweller's Loupe", 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 6.2 Torso: Moroccan leather & tin-mirror scale smithing tabard over indigo tunic
    gid_t = f'tab_{sex}_smith_tabard'
    tun_p = P('atlasindigo', 0.05, [
        B('top', 0.0, 0.018, 'solid', 'saffron'),
        B('bottom', 0.0, 0.026, 'awayo_stripe', 'abysslac', 'saffron', 0.045),
    ], fabric=COTTON)
    apron_p = P('abysslac', 0.04, [
        B('top', 0.0, 0.030, 'solid', 'tinmirror'),
        B('bottom', 0.0, 0.048, 'tin_patchwork', 'tinmirror', 'abysslac', 0.055),
    ], [
        PN(0.15, 0.85, 'tin_mirror_tizerzai', 'tinmirror', 'atlasindigo', 0.14),
    ], fabric='leather.polished')
    belt_s = P('saddle', 0.04, [B('top', 0.0, 0.010, 'beads', 'brass', 'saddle', 0.03)], fabric='leather.polished')
    parts_t = [
        torso_tube(gid_t + '_tunic', TOP, CROTCH - 0.04, 0.016, tun_p,
                   n=44, rows=18, hang_from=WAIST - 0.02, flare=0.05,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        collar(gid_t + '_collar', P('abysslac', 0.04, fabric='leather.polished'), height=0.024, flare=0.006, ease=0.020),
    ]
    parts_t.extend(tabard(gid_t + '_smith_apron', KNEE + 0.06, TOP - 0.012, apron_p,
                          width=0.24, ease=0.021, front=True, back=(sex == 'f')))
    parts_t.extend(sleeves(gid_t, 'elbow', 0.017,
                           P('atlasindigo', 0.05, [B('bottom', 0.0, 0.024, 'solid', 'abysslac')], fabric=COTTON),
                           ease_end=0.024, rows=7))
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.034, WAIST - 0.032, 0.023, belt_s,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    parts_t.extend(_tizerzai_fibula(
        gid_t + '_clasp', chest_front(CHEST + 0.052, 0.026, x=0.0),
        FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.92, tin_p,
        P('altarcerulean', 0.02, fabric='beads.glass')
    ))
    # Chasing hammer & tin-shears holstered flush at hips
    for sgn_tl, nm_tl, col_tl in ((-1.0, 'chasing_hammer', 'iron'), (1.0, 'tin_shears', 'tinmirror')):
        d_tl = np.array([sgn_tl * 0.84, -0.54, 0.0])
        d_tl /= np.linalg.norm(d_tl)
        p_tl = surface_out(spine_at(WAIST - 0.012), d_tl, 0.025, bvh=core.BVH_T)
        parts_t.append(tube(f'{gid_t}_{nm_tl}',
                            [p_tl + np.array([0.0, 0.0, 0.075]), p_tl - np.array([0.0, 0.0, 0.085])],
                            0.012, P(col_tl, 0.03, [B('bottom', 0.0, 0.04, 'solid', 'leather')], fabric='metal.iron'),
                            n=8, rigid_joint='Hips'))
    entries.append(assemble_garment(
        gid_t, 'Moroccan Leather & Tin-Mirror Scale Smithing Tabard', 'torso', 'tabisti', parts_t
    ))

    # 6.3 Gloves: Copper-and-leather artisan cuffs
    gid_g = f'tab_{sex}_smith_cuffs'
    cuff_g = P('copper', 0.03, [B('top', 0.0, 0.018, 'solid', 'tinmirror')], fabric='metal.bronze')
    palm_g = P('abysslac', 0.05, fabric='leather.buckskin')
    entries.append(assemble_garment(
        gid_g, 'Hammered Copper & Leather Tinsmith Cuffs', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g, cuff_g, palm_g, f0=0.62)
    ))

    # 6.4 Legs: Kilim-knee indigo artisan trousers
    gid_l = f'tab_{sex}_smith_trousers'
    tr_p = P('atlasindigo', 0.05, [
        B('bottom', 0.0, 0.045, 'diamonds', 'saffron', 'abysslac', 0.04),
    ], [PN(0.30, 0.70, 'awayo_stripe', 'saffron', 'abysslac', 0.16)], fabric='cloth.weave.twill')
    entries.append(assemble_garment(
        gid_l, 'Kilim-Knee Indigo Artisan Trousers', 'legs', 'tabisti',
        trousers(gid_l, tr_p, ease=0.018, ease_end=0.022, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 6.5 Feet: Burnished abyss-lac workshop half-boots
    gid_f = f'tab_{sex}_smith_boots'
    entries.append(assemble_garment(
        gid_f, 'Burnished Lac-Leather & Brass-Welt Smith Boots', 'feet', 'tabisti',
        boots(gid_f, P('peatumber', 0.05, [B('top', 0.0, 0.010, 'solid', 'brass')], fabric='leather.polished'),
              P('abysslac', 0.04, [B('top', 0.0, 0.035, 'diamonds', 'tinmirror', 'atlasindigo', 0.038)], fabric='leather.polished'),
              top=0.44, ease_top=0.029)
    ))

    # 6.6 Back: Tinker's back-rack hung w/ glinting tin-mirror discs, bottle-cap chains & silver tizerzai
    gid_b = f'tab_{sex}_smith_rack'
    back_b = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    frame_p = P('saddle', 0.05, [B('top', 0.0, 0.03, 'solid', 'brass')], fabric='leather.polished')
    parts_b = [
        blob(gid_b + '_tool_chest', back_b + np.array([0.0, 0.038, -0.035]), (0.23, 0.10, 0.22),
             P('atlasindigo', 0.04, [B('top', 0.0, 0.03, 'tin_patchwork', 'tinmirror', 'abysslac', 0.045)], fabric=WOOL),
             n=14, rows=6, out=d_bk, rigid_joint='Spine2'),
        tube(gid_b + '_crossbar_hi',
             [back_b + np.array([-0.145, 0.055, 0.145]), back_b + np.array([0.145, 0.055, 0.145])],
             0.014, frame_p, n=10, rigid_joint='Spine2'),
    ]
    for sd_r, tg_r in ((-1.0, 'R'), (1.0, 'L')):
        parts_b.append(tube(f'{gid_b}_post_{tg_r}',
                            [back_b + np.array([sd_r * 0.115, 0.045, 0.155]), back_b + np.array([sd_r * 0.115, 0.045, -0.145])],
                            0.013, frame_p, n=10, rigid_joint='Spine2'))
    # Glinting sacred tin-mirror discs & bottle-cap rosettes displayed across the rack
    for k_m, (mx, mz, mr, mp_col) in enumerate((
        (-0.075, 0.085, 0.040, tin_p),
        (0.0, 0.095, 0.048, tin_p),
        (0.075, 0.085, 0.040, tin_p),
        (-0.055, -0.020, 0.032, brass_p),
        (0.055, -0.020, 0.032, brass_p),
    )):
        parts_b.append(rosette(f'{gid_b}_mirror_disc_{k_m}', back_b + np.array([mx, 0.090, mz]),
                               d_bk, np.array([1.0, 0.0, 0.0]), mr, mp_col, n=14, thick=0.008, rigid_joint='Spine2'))
    parts_b.extend(_tizerzai_fibula(
        gid_b + '_display_tizerzai', back_b + np.array([0.0, 0.094, -0.035]),
        d_bk, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.95, tin_p,
        P('abysslac', 0.02, fabric='beads.glass'), rigid_joint='Spine2'
    ))
    parts_b.extend(pack_straps(gid_b, frame_p, ease=0.045))
    entries.append(assemble_garment(
        gid_b, "Ibisen Tinker's Tin-Mirror & Silver Tizerzai Display Rack", 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 7: `scarp_slinger` — Cataract-Terrace Warak'a Slinger (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_scarp_slinger(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    tin_p = P('tinmirror', 0.02, fabric='metal.tin.patchwork')

    # 7.1 Head: Chullo bound w/ braided woollen Andean warak'a brow-sling
    gid_h = f'tab_{sex}_slinger_chullo'
    chullo_p = P('atlasindigo', 0.05, [
        B('bottom', 0.0, 0.022, 'solid', 'abysslac'),
        B('top', 0.0, 0.028, 'steps', 'saltlime', 'abysslac', 0.035),
    ], fabric=WOOL)
    sling_p = P('saltlime', 0.05, [
        B('top', 0.0, 0.008, 'solid', 'abysslac'),
        B('bottom', 0.0, 0.008, 'solid', 'saffron'),
    ], [PN(0.0, 1.0, 'chevrons', 'abysslac', 'saltlime', 0.032)], fabric=WOOL)
    sling_band = crown_band(gid_h + '_waraka_sling', sling_p, f0=0.54, f1=0.76, ease=0.021, flare=0.008, rows=6, n=36)
    knot_pt = _snap_on_part(sling_band, a + (b - a) * (f_brow + 0.05) + left * 0.11, left, offset=0.003)
    parts_h = [
        head_rings(gid_h + '_chullo', 0.48, 1.05, 0.016, chullo_p, n=34, rows=8, apex=True),
        sling_band,
        blob(gid_h + '_sling_cradle', knot_pt, (0.032, 0.044, 0.036),
             P('abysslac', 0.05, [B('top', 0.0, 0.012, 'solid', 'saffron')], fabric='leather.buckskin'),
             n=10, rows=5, out=left, rigid_joint='Head'),
    ]
    parts_h.extend(_chullo_earflaps(gid_h, chullo_p, sling_p))
    entries.append(assemble_garment(
        gid_h, "Knitted Chullo & Braided Andean Warak'a Brow-Sling", 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 7.2 Torso: Quilted checkerboard tocapu armor-vest + left-arm Atlas burnous half-cape
    gid_t = f'tab_{sex}_slinger_vest'
    vest_p = P('saltlime', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'abysslac'),
        B('bottom', 0.0, 0.034, 'awayo_stripe', 'abysslac', 'atlasindigo', 0.05),
    ], [
        PN(0.26, 0.74, 'chakana_tocapu', 'abysslac', 'saltlime', 0.11),
        PN(0.0, 0.26, 'diamond_quilt', 'saltlime', 'atlasindigo', 0.09),
        PN(0.74, 1.0, 'diamond_quilt', 'saltlime', 'atlasindigo', 0.09),
    ], fabric='cloth.quilted.channel')
    cape_p = P('atlasindigo', 0.04, [
        B('bottom', 0.0, 0.030, 'awayo_stripe', 'saltlime', 'abysslac', 0.05),
        B('top', 0.0, 0.016, 'solid', 'saffron'),
    ], fabric=WOOL)
    belt_w = P('abysslac', 0.04, [B('top', 0.0, 0.012, 'chevrons', 'saltlime', 'saffron', 0.035)], fabric=WOOL)
    parts_t = [
        torso_tube(gid_t + '_quilted_vest', TOP, CROTCH - 0.04, 0.018, vest_p,
                   n=44, rows=18, hang_from=WAIST - 0.02, flare=0.05,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        collar(gid_t + '_collar', P('atlasindigo', 0.04, [B('top', 0.0, 0.008, 'solid', 'saltlime')], fabric='cloth.quilted.channel'),
               height=0.026, flare=0.006, ease=0.020),
        # Asymmetric left-shoulder Atlas burnous half-cape & guard pauldron
        pauldron(gid_t + '_burnous_guard_L', L, cape_p, reach=0.38, ease=0.025, rows=6, n=14),
        cape(gid_t + '_half_burnous', WAIST - 0.08, cape_p, span=0.38, ease=0.032, flare=0.12, rows=14, n=26),
        band(gid_t + '_sling_baldric', WAIST + 0.01, TOP - 0.034, 0.052, 0.022, cape_p, high=math.pi * 0.46, rows=4),
        torso_tube(gid_t + '_belt', WAIST + 0.034, WAIST - 0.032, 0.023, belt_w,
                   rows=4, n=42, hull_from=WAIST + 0.08, role='belt'),
    ]
    parts_t.extend(sleeves(gid_t, 'elbow', 0.017,
                           P('atlasindigo', 0.05, [B('bottom', 0.0, 0.024, 'solid', 'saltlime')], fabric=WOOL),
                           ease_end=0.024, rows=7))
    # Double sling-stone pouches + curved koummya dagger
    pouch_s = P('leather', 0.05, [B('top', 0.0, 0.016, 'solid', 'tinmirror')], fabric='leather.buckskin')
    for idx_sp, an_sp in enumerate((0.68 * math.pi, 0.86 * math.pi)):
        parts_t.append(_chuspa_pouch(f'{gid_t}_stonepouch_{idx_sp}', WAIST, an_sp, 0.023, pouch_s))
    parts_t.extend(_koummya_hip(gid_t, WAIST, 0.023, P('brass', 0.02, fabric='metal.bronze'), tin_p, side_sgn=-1.0))
    entries.append(assemble_garment(
        gid_t, 'Quilted Tocapu Armor-Vest & Left-Arm Burnous Cape', 'torso', 'tabisti', parts_t
    ))

    # 7.3 Gloves: Slinger leather & wool wrist-guards
    gid_g = f'tab_{sex}_slinger_bracers'
    entries.append(assemble_garment(
        gid_g, "Braided Wool & Studded Leather Slinger Wrist-Guards", 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g,
                          P('leather', 0.04, [B('top', 0.0, 0.018, 'chevrons', 'saltlime', 'abysslac', 0.03)], fabric='leather.polished'),
                          P('peatumber', 0.05, fabric='leather.buckskin'), f0=0.60)
    ))

    # 7.4 Legs: Skirmisher breeches
    gid_l = f'tab_{sex}_slinger_breeches'
    br_p = P('atlasindigo', 0.05, [
        B('bottom', 0.0, 0.055, 'awayo_stripe', 'saltlime', 'abysslac', 0.045),
    ], fabric=WOOL)
    entries.append(assemble_garment(
        gid_l, 'Terrace Skirmisher Indigo & Salt-Lime Breeches', 'legs', 'tabisti',
        trousers(gid_l, br_p, ease=0.018, ease_end=0.022, cuff=ANKLE + 0.08),
        legged=True
    ))

    # 7.5 Feet: Rubber-hide cliff boots
    gid_f = f'tab_{sex}_slinger_boots'
    entries.append(assemble_garment(
        gid_f, 'Rubber-Hide Terrace Skirmisher Cliff Boots', 'feet', 'tabisti',
        boots(gid_f, P('soot', 0.05, fabric='rubber.tyre'),
              P('leather', 0.05, [B('top', 0.0, 0.038, 'chevrons', 'saltlime', 'abysslac', 0.035)], fabric='leather.buckskin'),
              top=0.48, wraps=2, wrap_paint=P('saltlime', 0.05, fabric=WOOL), ease_top=0.030)
    ))

    # 7.6 Back: Studded tin-boss buckler & slung river-cobble pouch
    gid_b = f'tab_{sex}_slinger_buckler'
    back_b = surface_out(spine_at(CHEST - 0.01), d_bk, 0.020, bvh=core.BVH_T)
    buck_p = P('abysslac', 0.04, [
        B('top', 0.0, 0.028, 'solid', 'tinmirror'),
        B('bottom', 0.0, 0.028, 'steps', 'saltlime', 'atlasindigo', 0.04),
    ], fabric='leather.polished')
    bc = back_b + np.array([0.020, 0.032, 0.020])
    parts_b = [
        rosette(gid_b + '_buckler', bc, d_bk, np.array([1.0, 0.0, 0.0]), 0.175, buck_p, n=20, thick=0.018, rigid_joint='Spine2'),
        blob(gid_b + '_tin_umbo', bc + d_bk * 0.018, (0.085, 0.032, 0.085), tin_p, n=12, rows=5, out=d_bk, rigid_joint='Spine2'),
        blob(gid_b + '_cobble_sack', back_b + np.array([-0.085, 0.038, -0.145]), (0.12, 0.09, 0.15),
             P('saltlime', 0.05, [B('top', 0.0, 0.03, 'awayo_stripe', 'abysslac', 'saffron', 0.04)], fabric=WOOL),
             n=12, rows=5, out=d_bk, rigid_joint='Spine2'),
    ]
    for k_st in range(8):
        ang_st = k_st * (math.pi / 4.0)
        parts_b.append(blob(f'{gid_b}_stud_{k_st}',
                            bc + np.array([math.cos(ang_st) * 0.135, 0.015, math.sin(ang_st) * 0.135]),
                            (0.018, 0.014, 0.018), tin_p, n=8, rows=4, out=d_bk, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.04, fabric='leather.polished'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Studded Tin-Boss Buckler & River-Cobble Sling Sack', 'back', 'tabisti', parts_b
    ))
    return entries


# ===========================================================================================================
# TIER 8: `palisade_halberdier` — Tabisti Palisade & Lower-Verge Toll Halberdier (`6 x 2 = 12` pieces)
# ===========================================================================================================
def _build_palisade_halberdier(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE, ANKLE = (
        core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    )
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    entries = []
    tin_p = P('tinmirror', 0.02, [B('top', 0.0, 0.03, 'tin_patchwork', 'tinmirror', 'steel', 0.05)], fabric='metal.tin.patchwork')
    gilt_p = P('gold', 0.02, fabric='metal.gold')

    # 8.1 Head: Ridged steel-and-brass crested cabasset helmet w/ gilded swoop-horn finial
    gid_h = f'tab_{sex}_halberdier_cabasset'
    helm_p = P('steel', 0.03, [
        B('bottom', 0.0, 0.022, 'solid', 'brass'),
        B('top', 0.0, 0.024, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'fluted', 'tinmirror', 'steel', 0.05)], fabric='metal.iron')
    cab_dome = sculpted_cranium(gid_h + '_dome', helm_p, f_top=1.08, f_bot=0.58, ease=0.016, rows=10, n=36)
    cab_brim = brim(gid_h + '_brim', 0.62, 0.052, P('brass', 0.02, [B('bottom', 0.0, 0.015, 'solid', 'abysslac')], fabric='metal.bronze'),
                    ease=0.017, rows=4, n=38, droop=0.0, lift=0.022)
    cab_brim.rigid_joint = 'Head'
    parts_h = [
        cab_dome,
        cab_brim,
        crest(gid_h + '_crest', 0.052, P('abysslac', 0.03, [B('top', 0.0, 0.014, 'solid', 'gold')], fabric='metal.gold'),
              rows=5, cols=15, sweep=0.02, a0=-0.78, a1=0.86, host_part=cab_dome),
    ]
    # Nape lamellar neck-guard overlapped inside cab_dome (`f=0.58..0.63`)
    fs_av = np.linspace(max(0.0, f_nose - 0.26), 0.63, 7)
    angs_av = np.linspace(-0.56 * math.pi, 0.56 * math.pi, 22)
    Av_grid = []
    for k_a, fv in enumerate(fs_av):
        c_ray = a + (b - a) * max(fv, 0.36)
        c_cur = a + (b - a) * fv
        Av_grid.append([
            pt + (c_cur - c_ray)
            for pt in ring_points(c_ray, bk, left, angs_av, 0.020 + 0.010 * (1.0 - k_a / 4.0), rmin=0.05, rmax=0.18)
        ])
    parts_h.append(Part(gid_h + '_aventail', np.array(Av_grid), False, ['body'] * len(fs_av),
                        P('abysslac', 0.04, [B('bottom', 0.0, 0.02, 'lamellar_scale', 'tinmirror', 'abysslac', 0.04)], fabric='metal.iron'),
                        rigid_joint='Head'))
    # Gilded swoop-horn temple finials
    parts_h.extend(_swoop_horn_pair(gid_h, cab_dome, up, bk, left, 0.68, 0.082, 0.105,
                                    P('brass', 0.02, fabric='metal.bronze'), gilt_p))
    entries.append(assemble_garment(
        gid_h, 'Crested Cabasset Helmet & Gilded Swoop-Horn Finials', 'head', 'tabisti', parts_h,
        covers_hair=True, covers_face=False
    ))

    # 8.2 Torso: Red-and-teal iron/tin-mirror lamellar cuirass over indigo uncu surcoat + trapezoidal pectoral + chakana tassets
    gid_t = f'tab_{sex}_halberdier_cuirass'
    surcoat_p = P('atlasindigo', 0.04, [
        B('bottom', 0.0, 0.045, 'chakana_red', 'saltlime', 'abysslac', 0.055),
    ], fabric=WOOL)
    cuirass_p = P('abysslac', 0.03, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.030, 'solid', 'liikofiteal'),
    ], [
        PN(0.0, 1.0, 'lamellar_scale', 'tinmirror', 'abysslac', 0.085),
    ], fabric='metal.tin.patchwork')
    tasset_p = P('liikofiteal', 0.03, [
        B('bottom', 0.0, 0.035, 'chakana_red', 'gold', 'abysslac', 0.05),
    ], [PN(0.0, 1.0, 'lamellar_scale', 'tinmirror', 'liikofiteal', 0.07)], fabric='metal.iron')
    selham_c = P('atlasindigo', 0.04, [
        B('bottom', 0.0, 0.032, 'solid', 'abysslac'),
        B('top', 0.0, 0.018, 'solid', 'gold'),
    ], fabric=WOOL)
    parts_t = [
        torso_tube(gid_t + '_surcoat', TOP, KNEE + 0.08, 0.015, surcoat_p,
                   n=44, rows=19, hang_from=WAIST - 0.02, flare=0.08,
                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02),
        torso_tube(gid_t + '_lamellar', SHOULDER + 0.02, WAIST - 0.03, 0.024, cuirass_p,
                   n=44, rows=12, hull_from=CHEST + 0.02),
        stand_collar(gid_t, P('liikofiteal', 0.03, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='metal.iron'), high=0.032),
        cape(gid_t + '_selham_cape', KNEE + 0.04, selham_c, span=0.40, ease=0.032, flare=0.16, rows=16, n=28),
    ]
    for sd_t, ang_t in (('L', 0.62 * math.pi), ('R', 1.38 * math.pi)):
        parts_t.extend(tabard(f'{gid_t}_chakana_tasset_{sd_t}', KNEE + 0.07, WAIST - 0.01, tasset_p,
                              width=0.19, ease=0.028, center_ang=ang_t))
    for sd_p in (L, R):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{sd_p[0]}', sd_p, cuirass_p, reach=0.34, ease=0.025, rows=6, n=14))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017,
                           P('atlasindigo', 0.04, [B('bottom', 0.0, 0.032, 'lamellar_scale', 'tinmirror', 'abysslac', 0.045)], fabric=WOOL),
                           ease_end=0.024, rows=9))
    belt_h = P('leather', 0.03, [B('top', 0.0, 0.012, 'solid', 'gold')], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.032, WAIST - 0.034, 0.028, belt_h,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))
    # Trapezoidal tin-mirror pectoral boss & Lower Verge brass toll-tally horn
    parts_t.extend(_eight_star_boss(
        gid_t + '_pectoral', chest_front(CHEST + 0.032, 0.029, x=0.0),
        FRONT, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]), 0.048, tin_p, gilt_p
    ))
    horn_pts = [
        surface_out(spine_at(WAIST - 0.005 + dz), np.array([math.sin(an), math.cos(an), 0.0]), 0.031, bvh=core.BVH_T)
        for dz, an in ((0.015, 0.62 * math.pi), (-0.015, 0.72 * math.pi), (-0.038, 0.84 * math.pi), (-0.022, 0.94 * math.pi))
    ]
    parts_t.append(horn(gid_t + '_toll_horn', horn_pts, 0.020, 0.007, gilt_p, n=10, rows=9, rigid_joint='Hips', role='trinket'))
    entries.append(assemble_garment(
        gid_t, 'Lac-Red & Tin-Mirror Lamellar Cuirass & Selham Cape', 'torso', 'tabisti', parts_t
    ))

    # 8.3 Gloves: Lacquered iron & tin-mirror splint gauntlets
    gid_g = f'tab_{sex}_halberdier_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Lacquered Splint & Tin-Mirror Garrison Gauntlets', 'gloves', 'tabisti',
        _cuff_palm_gloves(gid_g, cuirass_p, P('leather', 0.04, fabric='leather.polished'), f0=0.58)
    ))

    # 8.4 Legs: Garrison indigo trousers w/ chakana trim
    gid_l = f'tab_{sex}_halberdier_trousers'
    entries.append(assemble_garment(
        gid_l, 'Lower-Verge Garrison Indigo & Chakana Trousers', 'legs', 'tabisti',
        trousers(gid_l, P('atlasindigo', 0.04, [B('bottom', 0.0, 0.055, 'chakana_red', 'gold', 'abysslac', 0.045)], fabric=WOOL),
                 ease=0.018, ease_end=0.022, cuff=ANKLE + 0.06),
        legged=True
    ))

    # 8.5 Feet: Greave-reinforced garrison boots
    gid_f = f'tab_{sex}_halberdier_boots'
    entries.append(assemble_garment(
        gid_f, 'Lac-Red & Tin-Greaved Palisade Garrison Boots', 'feet', 'tabisti',
        boots(gid_f, P('soot', 0.05, fabric='rubber.tyre'),
              P('abysslac', 0.03, [B('top', 0.0, 0.045, 'lamellar_scale', 'tinmirror', 'liikofiteal', 0.04)], fabric='leather.polished'),
              top=0.56, wraps=2, wrap_paint=gilt_p, ease_top=0.032)
    ))

    # 8.6 Back: Dorsal garrison targe emblazoned w/ Yaz (ⵣ) & 8-Pointed Star badge
    gid_b = f'tab_{sex}_halberdier_badge'
    back_b = surface_out(spine_at(CHEST - 0.01), d_bk, 0.024, bvh=core.BVH_T)
    sc_b = back_b + np.array([0.0, 0.036, 0.015])
    sh_p = P('atlasindigo', 0.03, [
        B('top', 0.0, 0.032, 'solid', 'gold'),
        B('bottom', 0.0, 0.032, 'chakana_red', 'saltlime', 'abysslac', 0.045),
    ], fabric='metal.iron')
    parts_b = [
        rosette(gid_b + '_garrison_targe', sc_b, d_bk, np.array([1.0, 0.0, 0.0]), 0.185, sh_p, n=20, thick=0.016, rigid_joint='Spine2'),
    ]
    parts_b.extend(_eight_star_boss(
        gid_b + '_star', sc_b + d_bk * 0.014, d_bk, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]),
        0.095, tin_p, P('abysslac', 0.02, fabric='beads.glass'), rigid_joint='Spine2'
    ))
    parts_b.extend(_yaz_emblem(
        gid_b, sc_b + d_bk * 0.022, d_bk, np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0]),
        0.052, gilt_p, rigid_joint='Spine2'
    ))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.04, fabric='leather.polished'), ease=0.045))
    entries.append(assemble_garment(
        gid_b, 'Palisade Yaz & Eight-Pointed Star Garrison Targe', 'back', 'tabisti', parts_b
    ))
    return entries


def build_tabisti_terraces_reed_for_sex(sex, body_id):
    """Build Tiers 1–8 (`90` pieces across M+F) for `sex` (`'m'` or `'f'`)."""
    out = []
    out.extend(_build_peasant(sex, body_id))
    out.extend(_build_scarp_porter(sex, body_id))
    out.extend(_build_reed_weaver(sex, body_id))
    out.extend(_build_trade(sex, body_id))
    out.extend(_build_dredger(sex, body_id))
    out.extend(_build_tin_smith(sex, body_id))
    out.extend(_build_scarp_slinger(sex, body_id))
    out.extend(_build_palisade_halberdier(sex, body_id))
    return out
