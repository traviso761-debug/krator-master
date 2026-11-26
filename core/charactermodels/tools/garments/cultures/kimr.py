"""The Kimr Wardrobe Kit (`kimr` — Ancestral Pueblo / Hopi-Zuni × Neolithic Welsh Megafauna Herders).

Builds 8 canon-organic Kimr tiers across both `mpfb_male` (`kimr_m_*`) and `mpfb_female` (`kimr_f_*`)
bodies (plus reusing the existing Meshy hero skull-helm `kimr_m_hawrog_skullhelm` / `kimr_f_hawrog_skullhelm`
on the `hawrog` war-leader tier):

1. `keeper`        — Canyon Megafauna Herder & Counter (M: tally-strap & breechclout; F: one-shoulder manta dress)
2. `first_keeper`  — Tawn Geid Hall of Heroes Vigil (strict ascetic taboo: undyed white yucca only, unmasked, zero turquoise)
3. `teller`        — Telyn Oral Bard & Genealogist (turquoise/spondylus mosaic diadem, wild-turkey feather capelet)
4. `hero_dwsgr`    — Hero Dancer (M: two-horn Hirw case-mask + prayer sticks; F: stepped tablita crown + carried Hirw mask)
5. `hero_hemr`     — Sloth-Claw Heavy Canyon Warden (ochre-soot case-mask, sloth pelt, trophy scapula, bone-claw gauntlets)
6. `clown`         — Sacred Mudhead / Klown (kaolin-ochre horned mudhead mask, soot-kaolin ring stripes, gourd bundle)
7. `bogi`          — Ogre Discipline Enforcer (toothed juniper-snout case-mask, crow-feather mantle, coiled burden-basket)
8. `hawrog`        — Crisis War-Leader / Awrog (existing skull-helm, osteoderm & spondylus panoply, bone war-standard)

Canon Material Law:
- ZERO metal, ZERO coal, ZERO domestic sheep, ZERO Celtic knotwork.
- Exclusively stone/obsidian, megafauna bone/scapula, glyptodont osteoderms, coiled reed basketry,
  yucca cordage, mountain-goat wool, wild-turkey/crow feathers, kaolin/ochre/madder/soot pigments,
  and turquoise + black jet + spiny-oyster shell mosaic.

Run standalone to compile all `.glb` + `.morph.bin` pieces and emit `kimr_manifest.json`:
    python tools/garments/cultures/kimr.py
"""
import json
import math
import sys
import time
from pathlib import Path
import numpy as np

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment, frame,
)
from ..paint import P, B, PN, COTTON, WOOL, leathery
from ..types.torso import (
    torso_tube, collar_disc, cape, tabard, crossed_sash, pauldron, neck_ring,
)
from ..types.limbs import limb_tube, sleeves, trousers, full_gloves, armbands
from ..types.footwear import boots, sandal
from ..types.headgear import (
    head_landmarks_exact, head_rings, hood, crown_band, horn, fan,
)
from ..types.accoutrements import (
    flap, blob, belt_sash, pack_straps, tube, strap, rosette, tassel,
)


KIMR_TIER_SHARES = [
    ['keeper', 0.34],
    ['first_keeper', 0.04],
    ['teller', 0.10],
    ['hero_dwsgr', 0.14],
    ['hero_hemr', 0.12],
    ['clown', 0.10],
    ['bogi', 0.10],
    ['hawrog', 0.06],
]

KIMR_TIER_LABELS = {
    'keeper': 'Canyon Megafauna Herder & Counter',
    'first_keeper': 'Tawn Geid Hall of Heroes Vigil',
    'teller': 'Telyn Oral Bard & Genealogist',
    'hero_dwsgr': 'Hirw Hero Dancer & Mask-Carrier',
    'hero_hemr': 'Sloth-Claw Heavy Canyon Warden',
    'clown': 'Sacred Mudhead / Klown',
    'bogi': 'Bogi Ogre Discipline Enforcer',
    'hawrog': 'Awrog Crisis War-Leader',
}


# ===========================================================================================================
# SHARED KIMR PAINTS (STRICTLY ZERO METAL)
# ===========================================================================================================
def _p_labyrinth(base='madder', border='jusschalk'):
    return P(base, 0.05, [
        B('bottom', 0.0, 0.045, 'kimr_madder_labyrinth', border, base),
        B('top', 0.0, 0.020, 'solid', border),
    ], [
        PN(0.0, 1.0, 'kimr_madder_labyrinth', border, base, 0.18),
    ], fabric=WOOL)


def _p_spondylus(base='oasisturq', fg='coral'):
    return P(base, 0.04, [
        B('top', 0.0, 0.012, 'solid', 'soot'),
        B('bottom', 0.0, 0.012, 'solid', 'soot'),
    ], [
        PN(0.0, 1.0, 'kimr_spondylus_mosaic', fg, base, 0.14),
    ], fabric='beads.glass')


def _p_osteoderm(base='bone', trim='madder'):
    return P(base, 0.06, [
        B('bottom', 0.0, 0.018, 'solid', trim),
        B('top', 0.0, 0.014, 'solid', 'smokebuck'),
    ], [
        PN(0.0, 1.0, 'osteoderm_scute', 'umber', base, 0.16),
    ], fabric='armor.osteoderm.scute')


def _p_yucca_white():
    return P('jusschalk', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'ash'),
        B('top', 0.0, 0.010, 'solid', 'oat'),
    ], fabric='cloth.cotton.coarse')


def _p_buckskin(base='buck', trim='madder'):
    return leathery(P(base, 0.06, [
        B('bottom', 0.0, 0.018, 'solid', trim),
    ], fabric='leather.buckskin'))


def _p_crow_feathers():
    return P('soot', 0.05, [
        B('bottom', 0.0, 0.032, 'trim_feather_fringe', 'charcoal', 'soot'),
    ], fabric='plumage.contour.corvid')


def _p_sloth_pelt():
    return P('yakbrown', 0.07, [
        B('bottom', 0.0, 0.028, 'solid', 'umber'),
    ], fabric='fur.yak')


def _p_basketry():
    return P('oat', 0.05, [
        B('top', 0.0, 0.016, 'solid', 'madder'),
        B('bottom', 0.0, 0.016, 'solid', 'soot'),
    ], fabric='straw.reed.plaited')


def _p_obsidian():
    return P('soot', 0.03, fabric='stone.obsidian.pancake_flaked')


# ===========================================================================================================
# SHARED KIMR PROCEDURAL PRIMITIVES
# ===========================================================================================================
def _kimr_head_box():
    """Return `(hc, fwd, rgt, up, z_bot, z_top, rx, ry)` from `head_landmarks_exact()` and skull vertices."""
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    fwd = -bk
    rgt = -left
    z_bot = float(a[2])
    z_top = float(b[2])
    head_v = core.CO[core.CO[:, 2] >= z_bot]
    xc = 0.5 * (float(head_v[:, 0].min()) + float(head_v[:, 0].max()))
    yc = 0.5 * (float(head_v[:, 1].min()) + float(head_v[:, 1].max()))
    rx = 0.5 * (float(head_v[:, 0].max()) - float(head_v[:, 0].min()))
    ry = 0.5 * (float(head_v[:, 1].max()) - float(head_v[:, 1].min()))
    hc = np.array([xc, yc, 0.5 * (z_bot + z_top)], dtype=np.float64)
    return hc, fwd, rgt, up, z_bot, z_top, rx, ry


def _kimr_headband(gid, band_paint, plaque_paint=None, n_plaques=0, tails=True):
    """Snug 360-degree braided yucca/mosaic brow-band (`ease=0.004`, passes Gate 2D < 12 mm)."""
    band_part = head_rings(f'{gid}_band', 0.59, 0.71, 0.004, band_paint, n=36, rows=5)
    parts = [band_part]
    hc, fwd, rgt, up, z_bot, z_top, rx, ry = _kimr_head_box()
    ring_mid = band_part.P[len(band_part.P) // 2]  # (36, 3) mid-height ring on actual band
    ring_c = ring_mid.mean(axis=0)

    def _band_pt(dir_vec):
        d_xy = dir_vec / max(np.linalg.norm(dir_vec), 1e-6)
        vecs = ring_mid - ring_c
        dots = vecs @ d_xy
        idx = int(np.argmax(dots))
        p = ring_mid[idx]
        out = p - ring_c
        out[2] = 0.0
        out /= max(np.linalg.norm(out), 1e-6)
        return p, out

    if plaque_paint is not None and n_plaques > 0:
        angs = np.linspace(-0.32 * math.pi, 0.32 * math.pi, n_plaques) if n_plaques > 1 else [0.0]
        for i, ang in enumerate(angs):
            d_out = fwd * math.cos(ang) + rgt * math.sin(ang)
            p_b, out_v = _band_pt(d_out)
            side_v = np.cross(up, out_v)
            side_v /= max(np.linalg.norm(side_v), 1e-6)
            parts.append(rosette(
                f'{gid}_plaque_{i}', p_b + out_v * 0.002, out_v, side_v,
                radius=0.015 if i == n_plaques // 2 else 0.011,
                paint=plaque_paint, n=12, thick=0.007, rigid_joint='Head',
            ))

    if tails:
        p_bk, out_bk = _band_pt(-fwd)
        knot_p = p_bk + out_bk * 0.003
        parts.append(blob(f'{gid}_knot', knot_p, (0.014, 0.012, 0.013), band_paint, rigid_joint='Head'))
        for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
            p0 = knot_p + rgt * (sgn * 0.007)
            p1 = p0 + out_bk * 0.010 + rgt * (sgn * 0.014) - up * 0.055
            p2 = p1 + out_bk * 0.012 + rgt * (sgn * 0.016) - up * 0.065
            parts.append(strap(f'{gid}_tail_{tag}', [p0, p1, p2], 0.014, band_paint, rigid_joint='Head'))
    return parts


def _case_mask(gid, cyl_paint, top_paint, ruff_paint, horns=None, snout=False,
               eye_paint=None, mouth_paint=None, tusks=False):
    """Cylindrical Pueblo rawhide *katsina* / *Hirw* case-mask with flush-seated horns, eyes, snout & ruff."""
    hc, fwd, rgt, up, z_bot0, z_top0, rx0, ry0 = _kimr_head_box()
    z_bot = z_bot0 - 0.018
    z_top = z_top0 + 0.055
    r_x = rx0 + 0.022
    r_y = ry0 + 0.024

    n = 36
    rows = 12
    thetas = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for r in range(rows):
        u = r / float(rows - 1)
        z = z_bot + (z_top - z_bot) * u
        # Slight organic barrel swell + clean flat crown closure
        swell = 1.0 + 0.04 * math.sin(u * math.pi)
        for j, th in enumerate(thetas):
            Q[r, j] = (
                hc * np.array([1.0, 1.0, 0.0])
                + np.array([0.0, 0.0, z])
                + rgt * (math.sin(th) * r_x * swell)
                + fwd * (math.cos(th) * r_y * swell)
            )
    roles = ['bottom'] + ['body'] * (rows - 2) + ['top']
    parts = [Part(f'{gid}_cyl', Q, True, roles, cyl_paint, rigid_joint='Head')]

    # Flat/domed crown cap welded to top ring
    Q_cap = np.zeros((5, n, 3), dtype=np.float64)
    for r in range(5):
        u = r / 4.0
        sc = 1.0 - 0.96 * u
        zc = z_top + 0.016 * math.sin(u * math.pi * 0.5)
        for j, th in enumerate(thetas):
            Q_cap[r, j] = (
                hc * np.array([1.0, 1.0, 0.0])
                + np.array([0.0, 0.0, zc])
                + rgt * (math.sin(th) * r_x * sc)
                + fwd * (math.cos(th) * r_y * sc)
            )
    parts.append(Part(f'{gid}_cap', Q_cap, True, ['bottom', 'body', 'body', 'body', 'top'], top_paint, rigid_joint='Head'))

    # Compact evergreen / crow-feather / fur collar rim seated flush around lower mask rim (clear of torso mantles)
    Q_ruff = np.zeros((5, n, 3), dtype=np.float64)
    for r in range(5):
        u = r / 4.0
        zr = z_bot + 0.016 * (1.0 - u) - 0.014 * u
        rad_mul = 0.96 + 0.14 * u
        for j, th in enumerate(thetas):
            scallop = 1.0 + 0.05 * math.sin(th * 12.0) * u
            Q_ruff[r, j] = (
                hc * np.array([1.0, 1.0, 0.0])
                + np.array([0.0, 0.0, zr])
                + rgt * (math.sin(th) * r_x * rad_mul * scallop)
                + fwd * (math.cos(th) * r_y * rad_mul * scallop)
            )
    parts.append(Part(f'{gid}_ruff', Q_ruff, True, ['top', 'body', 'body', 'body', 'bottom'], ruff_paint, rigid_joint='Head'))

    # Tubular pop-out eyes seated deep into the front cylinder wall (zero float!)
    z_eye = z_bot + (z_top - z_bot) * 0.56
    ep = eye_paint or P('jusschalk', 0.03, [B('top', 0.0, 0.008, 'solid', 'soot')], fabric=COTTON)
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        base_e = np.array([hc[0], hc[1], z_eye]) + rgt * (sgn * r_x * 0.34) + fwd * (r_y * 0.84)
        tip_e = base_e + fwd * 0.032 + rgt * (sgn * 0.006)
        parts.append(tube(f'{gid}_eye_{tag}', [base_e, tip_e], 0.016, ep, n=12, rigid_joint='Head'))
        parts.append(blob(f'{gid}_pupil_{tag}', tip_e + fwd * 0.003, (0.010, 0.006, 0.010),
                          P('soot', 0.02, fabric=COTTON), rigid_joint='Head'))

    # Tubular mouth OR protruding toothed juniper snout (Bogi ogre)
    z_mouth = z_bot + (z_top - z_bot) * 0.28
    mp = mouth_paint or P('madder', 0.04, fabric='wood.painted')
    if snout:
        base_s = np.array([hc[0], hc[1], z_mouth]) + fwd * (r_y * 0.78)
        mid_s = base_s + fwd * 0.065 - up * 0.006
        tip_s = mid_s + fwd * 0.048 - up * 0.010
        parts.append(horn(f'{gid}_snout', [base_s, mid_s, tip_s], 0.036, 0.022, mp, n=12, rows=8, rigid_joint='Head'))
        # Carved bone teeth along snout rim
        bone_p = P('ivory', 0.03, fabric='armor.osteoderm.scute')
        for ti in range(-2, 3):
            t_base = mid_s + rgt * (ti * 0.011) - up * 0.014 + fwd * 0.010
            t_tip = t_base - up * 0.020 + fwd * 0.004
            parts.append(horn(f'{gid}_tooth_{ti + 2}', [t_base, t_tip], 0.005, 0.001, bone_p, n=6, rows=4, rigid_joint='Head'))
    else:
        base_m = np.array([hc[0], hc[1], z_mouth]) + fwd * (r_y * 0.85)
        tip_m = base_m + fwd * 0.030
        parts.append(tube(f'{gid}_mouth', [base_m, tip_m], 0.019, mp, n=12, rigid_joint='Head'))

    # Optional twin horns (embedded inside temple wall so zero gap)
    if horns is not None:
        h_paint, h_len, h_r0, h_r1, h_curve = horns
        z_h = z_bot + (z_top - z_bot) * 0.78
        for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
            p0 = np.array([hc[0], hc[1], z_h]) + rgt * (sgn * r_x * 0.78) + fwd * (r_y * 0.12)
            p1 = p0 + rgt * (sgn * h_len * 0.48) + up * (h_len * 0.36) + fwd * (h_len * 0.14)
            p2 = p1 + rgt * (sgn * h_len * 0.24 * h_curve) + up * (h_len * 0.56) + fwd * (h_len * 0.22)
            p3 = p2 - rgt * (sgn * h_len * 0.18) + up * (h_len * 0.34) + fwd * (h_len * 0.10)
            parts.append(horn(f'{gid}_horn_{tag}', [p0, p1, p2, p3], h_r0, h_r1, h_paint, n=12, rows=10, rigid_joint='Head'))

    if tusks:
        bone_p = P('ivory', 0.03, fabric='armor.osteoderm.scute')
        z_tk = z_bot + (z_top - z_bot) * 0.26
        for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
            p0 = np.array([hc[0], hc[1], z_tk]) + rgt * (sgn * r_x * 0.62) + fwd * (r_y * 0.60)
            p1 = p0 + rgt * (sgn * 0.035) + fwd * 0.035 + up * 0.018
            p2 = p1 + rgt * (sgn * 0.012) + fwd * 0.022 + up * 0.042
            parts.append(horn(f'{gid}_tusk_{tag}', [p0, p1, p2], 0.014, 0.003, bone_p, n=10, rows=7, rigid_joint='Head'))

    return parts


def _tablita_crown(gid, band_paint, board_paint, whorl_paint):
    """Stepped Ancestral Pueblo turquoise & spiny-oyster *tablita* whorl crown (open face, clear eyeline)."""
    band_part = head_rings(f'{gid}_band', 0.60, 0.74, 0.005, band_paint, n=36, rows=5)
    parts = [band_part]
    hc, fwd, rgt, up, z_bot, z_top, rx, ry = _kimr_head_box()
    ring_top = band_part.P[-1]
    ring_mid = band_part.P[len(band_part.P) // 2]
    ring_c = ring_mid.mean(axis=0)
    z_base = float(ring_top[:, 2].mean()) - 0.010

    # Stepped cloud-terrace tablita crest rising directly from crown band (3 tiers)
    tiers = [
        (0.105, 0.000, 0.055),
        (0.074, 0.050, 0.098),
        (0.040, 0.093, 0.135),
    ]
    for ti, (hw, dz0, dz1) in enumerate(tiers):
        rows_t, cols_t = 4, 11
        Q = np.zeros((rows_t, cols_t, 3), dtype=np.float64)
        for r in range(rows_t):
            u = r / float(rows_t - 1)
            z = z_base + dz0 + (dz1 - dz0) * u
            for c in range(cols_t):
                v = (c / float(cols_t - 1) - 0.5) * 2.0
                ang = v * 0.55
                Q[r, c] = (
                    np.array([ring_c[0], ring_c[1], z])
                    + rgt * (v * hw)
                    + fwd * (0.010 + 0.022 * (1.0 - math.cos(ang)))
                )
        parts.append(Part(f'{gid}_tier_{ti}', Q, False, ['bottom', 'body', 'body', 'top'], board_paint, rigid_joint='Head'))

    # Twin side squash-blossom / butterfly whorl discs seated flush on band temples
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        dots = (ring_mid - ring_c) @ (rgt * sgn)
        p_t = ring_mid[int(np.argmax(dots))]
        c_w = p_t + rgt * (sgn * 0.005) + up * 0.008
        parts.append(rosette(f'{gid}_whorl_{tag}', c_w, rgt * sgn, fwd, 0.038, whorl_paint, n=16, thick=0.010, rigid_joint='Head'))
        parts.append(rosette(f'{gid}_whorl_core_{tag}', c_w + rgt * (sgn * 0.007), rgt * sgn, fwd, 0.016,
                             P('coral', 0.03, fabric='beads.glass'), n=12, thick=0.007, rigid_joint='Head'))
    return parts


def _kilt(gid, paint, sash_paint, z_bot=None, z_top=None, flare=0.045, ease=0.024, tail=True):
    """Pueblo woven dance/herder kilt (`legged=False`) with single waist sash and anterior suprapubic clearance."""
    WAIST, CROTCH, KNEE = core.WAIST, core.CROTCH, core.KNEE
    zb = z_bot if z_bot is not None else KNEE + 0.06
    zt = z_top if z_top is not None else WAIST + 0.030
    sash_part = belt_sash(f'{gid}_sash', WAIST - 0.010, WAIST + 0.034, sash_paint, ease=ease + 0.013)
    kilt_part = torso_tube(f'{gid}_kilt', zb, zt, ease=ease, paint=paint, flare=max(flare, 0.060),
                           hang_from=WAIST - 0.028, rows=18, n=40)
    # Raise anterior suprapubic ease by +0.015 m over [WAIST - 0.02, CROTCH + 0.01] and carry smoothly to hem
    # so front pelvis / upper thighs never clip during walk or run animations.
    P_k = kilt_part.P
    for r_i in range(P_k.shape[0]):
        z_r = float(P_k[r_i, :, 2].mean())
        u_z = float(np.clip(((WAIST + 0.005) - z_r) / 0.025, 0.0, 1.0))
        w_z = u_z * u_z * (3.0 - 2.0 * u_z)
        if w_z <= 1e-4:
            continue
        c_r = spine_at(max(z_r, CROTCH + 0.02))
        dx = P_k[r_i, :, 0] - c_r[0]
        dy = P_k[r_i, :, 1] - c_r[1]
        rad = np.maximum(np.hypot(dx, dy), 1e-6)
        front_w = np.clip(-dy / rad, 0.0, 1.0) ** 1.4
        P_k[r_i, :, 1] -= 0.015 * w_z * front_w
    parts = [kilt_part, sash_part]
    if tail:
        s_ring = sash_part.P[len(sash_part.P) // 2]
        s_c = s_ring.mean(axis=0)
        out_r = np.array([0.96, -0.28, 0.0])
        pt_k = s_ring[int(np.argmax((s_ring - s_c) @ out_r))]
        knot_c = pt_k + out_r * 0.012
        parts.append(blob(f'{gid}_sash_knot', knot_c, (0.024, 0.020, 0.024), sash_paint, rigid_joint='Hips'))
        for ti, dy_t in enumerate((-0.014, 0.014)):
            t_top = knot_c + out_r * 0.016 + np.array([0.0, dy_t, -0.010])
            parts.append(tassel(f'{gid}_sash_tassel_{ti}', t_top, 0.13, 0.014, sash_paint, rigid_joint='Hips'))
    return parts


def _bracers(gid, paint, f0=0.52, f1=0.92, ease=0.014, trim_paint=None):
    """Open-handed Kimr rawhide / bone-splint / shell-mosaic forearm bracers."""
    parts = []
    for s in (L, R):
        e, w = J(s + 'ForeArm'), J(s + 'Hand')
        a = e + (w - e) * f0
        b = e + (w - e) * f1
        parts.append(limb_tube(f'{gid}_bracer_{s[0]}', a, b, ease, paint, n=18, rows=8, side=s[0]))
        if trim_paint is not None:
            m0 = e + (w - e) * (f0 + 0.08)
            m1 = e + (w - e) * (f1 - 0.08)
            parts.append(limb_tube(f'{gid}_trim_{s[0]}', m0, m1, ease + 0.004, trim_paint, n=18, rows=4, side=s[0]))
    return parts


def _sloth_claw_gauntlets(gid):
    """Heavy sloth-hide `full_gloves` with 3 curved giant megafauna bone claws per hand (`rigid_joint=Hand`)."""
    cuff_p = _p_sloth_pelt()
    hand_p = _p_buckskin('smokebuck', 'madder')
    claw_p = P('ivory', 0.03, [B('bottom', 0.0, 0.012, 'solid', 'umber')], fabric='armor.osteoderm.scute')
    parts = list(full_gloves(gid, cuff_p, hand_p, finger_paint=hand_p, f0=0.55, ease=0.014))
    for s in (L, R):
        hand = J(s + 'Hand')
        fa = J(s + 'ForeArm')
        fwd_h = hand - fa
        fwd_h /= max(np.linalg.norm(fwd_h), 1e-6)
        # Dorsal surface of hand points mostly outward/back (-Y/+X depending on A-pose)
        up_h = np.array([0.0, 0.0, 1.0])
        side_h = np.cross(fwd_h, up_h)
        side_h /= max(np.linalg.norm(side_h), 1e-6)
        dors_h = np.cross(side_h, fwd_h)
        dors_h /= max(np.linalg.norm(dors_h), 1e-6)
        knuckle = hand + fwd_h * 0.055 + dors_h * 0.016
        for ci, off in enumerate((-0.022, 0.0, 0.022)):
            p0 = knuckle + side_h * off - fwd_h * 0.015
            p1 = p0 + fwd_h * 0.055 + dors_h * 0.014
            p2 = p1 + fwd_h * 0.052 - dors_h * 0.024
            parts.append(horn(f'{gid}_claw_{s[0]}_{ci}', [p0, p1, p2], 0.0085, 0.0018, claw_p,
                              n=8, rows=7, rigid_joint=s + 'Hand'))
    return parts


def _dorsal_pack_anchor():
    """Return (back_surface_pt, back_normal) at mid-scapula height for flush Spine2-rigged dorsal packs."""
    CHEST = core.CHEST
    sp = spine_at(CHEST - 0.02)
    b_dir = np.array([0.0, 1.0, 0.0])
    d = first_hit(sp, b_dir, 0.35)
    hit_pt = sp + b_dir * (float(d) if d is not None else 0.13)
    return hit_pt, b_dir


def _back_quiver(gid, pelt_paint, strap_paint, cord_ease=0.009):
    """Ground-sloth hide quiver & fletched darts seated flush on dorsal mount pad (`rigid_joint='Spine2'`)."""
    hit, b_dir = _dorsal_pack_anchor()
    pad_c = hit + b_dir * 0.008 + np.array([0.0, 0.0, -0.05])
    parts = [blob(f'{gid}_pad', pad_c, (0.068, 0.020, 0.14), strap_paint, n=12, rows=5, rigid_joint='Spine2')]
    p_bot = hit + b_dir * 0.012 + np.array([-0.065, 0.0, -0.22])
    p_mid = hit + b_dir * 0.016 + np.array([0.010, 0.0, -0.04])
    p_top = hit + b_dir * 0.020 + np.array([0.090, 0.0, 0.13])
    parts.append(horn(f'{gid}_quiver', [p_bot, p_mid, p_top], 0.044, 0.056, pelt_paint, n=14, rows=10, rigid_joint='Spine2'))
    # 3 fletched bone-tipped darts protruding cleanly from quiver mouth
    shaft_p = P('oat', 0.04, fabric='wood.painted')
    fletch_p = P('madder', 0.04, fabric='plumage.contour.corvid')
    axis = (p_top - p_mid)
    axis /= max(np.linalg.norm(axis), 1e-6)
    for di, ox in enumerate((-0.020, 0.0, 0.020)):
        d0 = p_top - axis * 0.06 + np.array([ox, 0.006 * (di - 1), 0.0])
        d1 = d0 + axis * 0.14
        parts.append(tube(f'{gid}_dart_{di}', [d0, d1], 0.0055, shaft_p, n=6, rigid_joint='Spine2'))
        parts.append(blob(f'{gid}_fletch_{di}', d1 - axis * 0.02, (0.014, 0.008, 0.028), fletch_p, rigid_joint='Spine2'))
    return parts


def _back_story_bundle(gid, scroll_paint, bone_paint, strap_paint):
    """Telyn bard carved-bone *Telling* tally-rods & rolled hide scroll bundle on `pack_straps`."""
    parts = list(pack_straps(gid, strap_paint, ease=0.015, width=0.025))
    hit, b_dir = _dorsal_pack_anchor()
    c_roll = hit + b_dir * 0.026 + np.array([0.0, 0.0, -0.05])
    # Horizontal rolled hide scroll case
    parts.append(tube(f'{gid}_scroll', [c_roll + np.array([-0.15, 0.0, 0.0]), c_roll + np.array([0.15, 0.0, 0.0])],
                      0.046, scroll_paint, n=14, rigid_joint='Spine2'))
    # 5 upright carved-bone tally-rods lashed behind the scroll
    for ri, ox in enumerate(np.linspace(-0.085, 0.085, 5)):
        r0 = c_roll + np.array([ox, 0.006, -0.08])
        r1 = c_roll + np.array([ox * 1.25, 0.010, 0.22 + (0.03 if ri == 2 else 0.0)])
        parts.append(tube(f'{gid}_rod_{ri}', [r0, r1], 0.0085, bone_paint, n=8, rigid_joint='Spine2'))
        parts.append(blob(f'{gid}_rod_tip_{ri}', r1, (0.015, 0.012, 0.018),
                          _p_spondylus(), rigid_joint='Spine2'))
    return parts


def _back_prayer_sticks(gid, strap_paint):
    """Feathered *paho* prayer-stick bundle lashed to a snug dorsal waist cord (male `hero_dwsgr`, zero loose chest straps)."""
    WAIST = core.WAIST
    cord_part = belt_sash(f'{gid}_cord', WAIST - 0.020, WAIST + 0.020, strap_paint, ease=0.024)
    parts = [cord_part]
    hit, b_dir = _dorsal_pack_anchor()
    c_b = hit + b_dir * 0.020 + np.array([0.0, 0.0, -0.04])
    parts.append(blob(f'{gid}_wrap', c_b, (0.075, 0.042, 0.095), _p_labyrinth(), rigid_joint='Spine2'))
    stick_p = P('oasisturq', 0.04, fabric='wood.painted')
    feath_p = P('jusschalk', 0.04, [B('top', 0.0, 0.014, 'solid', 'soot')], fabric='plumage.contour.corvid')
    for i, ang in enumerate(np.linspace(-0.42, 0.42, 5)):
        p0 = c_b + np.array([math.sin(ang) * 0.04, 0.002, -0.04])
        p1 = c_b + np.array([math.sin(ang) * 0.19, 0.014, 0.28 + 0.04 * math.cos(ang * 2.0)])
        parts.append(tube(f'{gid}_paho_{i}', [p0, p1], 0.008, stick_p, n=8, rigid_joint='Spine2'))
        parts.append(blob(f'{gid}_plume_{i}', p1, (0.018, 0.012, 0.038), feath_p, rigid_joint='Spine2'))
    return parts


def _back_carried_hirw(gid, strap_paint):
    """Matrilineal clan *Hirw* cylindrical case-mask slung in honour on a back tumpline (female `hero_dwsgr`)."""
    parts = list(pack_straps(gid, strap_paint, ease=0.015, width=0.026))
    hit, b_dir = _dorsal_pack_anchor()
    c_m = hit + b_dir * 0.046 + np.array([0.0, 0.0, -0.02])
    mask_p = P('oasisturq', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'jusschalk'),
        B('bottom', 0.0, 0.028, 'kimr_madder_labyrinth', 'jusschalk', 'madder'),
    ], [PN(0.0, 1.0, 'kimr_spondylus_mosaic', 'coral', 'oasisturq', 0.14)], fabric='leather.buckskin')
    # Upright carried cylinder seated against back pack straps
    parts.append(tube(f'{gid}_mask_cyl', [c_m + np.array([0.0, 0.0, -0.11]), c_m + np.array([0.0, 0.0, 0.11])],
                      0.076, mask_p, n=18, rigid_joint='Spine2'))
    # Evergreen ruff on carried mask bottom
    parts.append(blob(f'{gid}_mask_ruff', c_m + np.array([0.0, 0.0, -0.115]), (0.095, 0.088, 0.032),
                      P('pine', 0.06, fabric='plumage.contour.corvid'), rigid_joint='Spine2'))
    # Twin curved horns on carried Hirw mask
    horn_p = P('soot', 0.04, [B('top', 0.0, 0.018, 'solid', 'oasisturq')], fabric='armor.osteoderm.scute')
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        h0 = c_m + np.array([sgn * 0.062, 0.0, 0.065])
        h1 = h0 + np.array([sgn * 0.065, 0.018, 0.055])
        h2 = h1 + np.array([sgn * 0.015, 0.010, 0.075])
        parts.append(horn(f'{gid}_horn_{tag}', [h0, h1, h2], 0.022, 0.005, horn_p, n=10, rows=7, rigid_joint='Spine2'))
    # Tubular eyes facing outward (+Y)
    eye_p = P('jusschalk', 0.03, fabric=COTTON)
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        e0 = c_m + np.array([sgn * 0.032, 0.064, 0.025])
        e1 = e0 + np.array([0.0, 0.024, 0.0])
        parts.append(tube(f'{gid}_eye_{tag}', [e0, e1], 0.012, eye_p, n=8, rigid_joint='Spine2'))
    return parts


def _back_trophy_scapula(gid, strap_paint):
    """Carved giant ground-sloth trophy scapula shield/rack on `pack_straps` (`hero_hemr`)."""
    parts = list(pack_straps(gid, strap_paint, ease=0.015, width=0.028))
    hit, b_dir = _dorsal_pack_anchor()
    c_s = hit + b_dir * 0.020 + np.array([0.0, 0.0, 0.0])
    bone_p = _p_osteoderm('ivory', 'madder')
    # Fan-shaped giant megafauna scapula plate
    rows_s, cols_s = 8, 13
    Q = np.zeros((rows_s, cols_s, 3), dtype=np.float64)
    for r in range(rows_s):
        u = r / float(rows_s - 1)  # 0=narrow glenoid base, 1=broad flared scapula blade
        z = c_s[2] - 0.18 + 0.38 * u
        hw = 0.055 + 0.135 * (u ** 0.85)
        for c in range(cols_s):
            v = (c / float(cols_s - 1) - 0.5) * 2.0
            curve_y = 0.028 * (1.0 - v * v) + 0.018 * math.sin(u * math.pi)
            Q[r, c] = [c_s[0] + v * hw, c_s[1] + curve_y, z]
    parts.append(Part(f'{gid}_scapula', Q, False, ['bottom'] + ['body'] * (rows_s - 2) + ['top'], bone_p, rigid_joint='Spine2'))
    # Central anatomical scapula spine ridge
    r0 = np.array([c_s[0], c_s[1] + 0.022, c_s[2] - 0.15])
    r1 = np.array([c_s[0], c_s[1] + 0.068, c_s[2] + 0.15])
    parts.append(horn(f'{gid}_ridge', [r0, r1], 0.022, 0.010, P('bone', 0.04, fabric='armor.osteoderm.scute'),
                      n=8, rows=6, rigid_joint='Spine2'))
    return parts


def _back_clown_bundle(gid, strap_paint):
    """Dorsal woven yucca-net trickster bundle & rattle gourds on `pack_straps` (`clown`)."""
    parts = list(pack_straps(gid, strap_paint, ease=0.015, width=0.024))
    hit, b_dir = _dorsal_pack_anchor()
    c_b = hit + b_dir * 0.036 + np.array([0.0, 0.0, -0.05])
    net_p = P('oat', 0.06, [B('top', 0.0, 0.02, 'solid', 'soot')], fabric='straw.reed.plaited')
    parts.append(blob(f'{gid}_sack', c_b, (0.11, 0.068, 0.13), net_p, rigid_joint='Spine2'))
    gourd_p = P('ochre', 0.05, [B('bottom', 0.0, 0.015, 'solid', 'madder')], fabric='wood.painted')
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        g_c = c_b + np.array([sgn * 0.095, 0.020, -0.05])
        parts.append(blob(f'{gid}_gourd_{tag}', g_c, (0.042, 0.042, 0.055), gourd_p, rigid_joint='Spine2'))
    return parts


def _back_bogi_basket(gid, strap_paint):
    """Tall conical coiled-reed burden-basket on `pack_straps` (`bogi`)."""
    parts = list(pack_straps(gid, strap_paint, ease=0.015, width=0.028))
    hit, b_dir = _dorsal_pack_anchor()
    b0 = hit + b_dir * 0.042 + np.array([0.0, 0.0, -0.22])
    b1 = hit + b_dir * 0.065 + np.array([0.0, 0.0, 0.02])
    b2 = hit + b_dir * 0.078 + np.array([0.0, 0.0, 0.24])
    parts.append(horn(f'{gid}_basket', [b0, b1, b2], 0.048, 0.135, _p_basketry(), n=18, rows=12, rigid_joint='Spine2'))
    # Rim lashing ring
    parts.append(tube(f'{gid}_rim', [b2 + np.array([-0.12, 0.0, -0.01]), b2 + np.array([0.12, 0.0, -0.01])],
                      0.016, P('soot', 0.04, fabric='leather.buckskin'), n=8, rigid_joint='Spine2'))
    return parts


def _back_hawrog_standard(gid, strap_paint):
    """Tall dorsal carved-bone & crow-feather war-standard rack on `pack_straps` (`hawrog`)."""
    parts = list(pack_straps(gid, strap_paint, ease=0.015, width=0.028))
    hit, b_dir = _dorsal_pack_anchor()
    c_b = hit + b_dir * 0.022 + np.array([0.0, 0.0, -0.02])
    bone_p = P('ivory', 0.04, [B('top', 0.0, 0.02, 'solid', 'oasisturq')], fabric='armor.osteoderm.scute')
    # Central bone standard pole rising high behind shoulders
    p0 = c_b + np.array([0.0, 0.0, -0.14])
    p1 = c_b + np.array([0.0, 0.020, 0.42])
    parts.append(tube(f'{gid}_pole', [p0, p1], 0.014, bone_p, n=10, rigid_joint='Spine2'))
    # Horizontal crossbar + hanging crow-feather banner & spondylus medallion
    c_bar = c_b + np.array([0.0, 0.016, 0.28])
    parts.append(tube(f'{gid}_crossbar', [c_bar + np.array([-0.19, 0.0, 0.0]), c_bar + np.array([0.19, 0.0, 0.0])],
                      0.011, bone_p, n=8, rigid_joint='Spine2'))
    parts.append(rosette(f'{gid}_medallion', c_bar + np.array([0.0, 0.010, 0.0]), np.array([0.0, 1.0, 0.0]),
                         np.array([1.0, 0.0, 0.0]), 0.048, _p_spondylus(), n=16, thick=0.014, rigid_joint='Spine2'))
    # Twin crow-feather streamers hanging from crossbar ends
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        parts.append(flap(f'{gid}_streamer_{tag}', c_bar + np.array([sgn * 0.16, 0.008, 0.0]),
                          0.055, 0.26, np.array([0.0, 1.0, 0.0]), _p_crow_feathers(),
                          cols=5, rows=8, push=False, rigid_joint='Spine2'))
    return parts


# ===========================================================================================================
# TIER BUILDERS (1..8)
# ===========================================================================================================
def _build_tier_keeper(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    if sex == 'm':
        # HEAD: Snug braided yucca & madder brow-band
        gid_h = 'kimr_m_headband'
        band_p = P('madder', 0.05, [
            B('top', 0.0, 0.008, 'solid', 'jusschalk'),
            B('bottom', 0.0, 0.008, 'solid', 'oat'),
        ], [PN(0.0, 1.0, 'kimr_madder_labyrinth', 'jusschalk', 'madder', 0.10)], fabric=COTTON)
        parts_h = _kimr_headband(gid_h, band_p, plaque_paint=_p_spondylus(), n_plaques=1, tails=True)
        entries.append(assemble_garment(gid_h, 'Kimr Braided Yucca & Madder Headband', 'head', 'kimr', parts_h,
                                        covers_hair=False, covers_face=False))

        # TORSO: Open-chest tally-cord & buckskin cross-strap harness (snug on bare skin)
        gid_t = 'kimr_m_keeper_strap'
        strap_p = _p_buckskin('buck', 'madder')
        parts_t = [crossed_sash(gid_t, strap_p, width=0.062, ease=0.006)]
        # Carved bone tally-beads seated flush on front chest crossing
        cf = chest_front(CHEST - 0.03, 0.011)
        parts_t.append(rosette(f'{gid_t}_tally', cf,
                               np.array([0.0, -1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                               0.030, _p_osteoderm('ivory', 'madder'), n=12, thick=0.010, rigid_joint='Spine2'))
        entries.append(assemble_garment(gid_t, 'Kimr Herder Tally-Cord Chest Harness', 'torso', 'kimr', parts_t,
                                        open_torso=True))

        # LEGS: Labyrinth-woven breechclout kilt
        gid_l = 'kimr_m_breechclout'
        parts_l = _kilt(gid_l, _p_labyrinth('madder', 'jusschalk'),
                        P('oat', 0.05, [B('bottom', 0.0, 0.014, 'solid', 'madder')], fabric=WOOL),
                        z_bot=KNEE + 0.08, flare=0.040)
        entries.append(assemble_garment(gid_l, 'Kimr Labyrinth-Woven Breechclout Kilt', 'legs', 'kimr', parts_l,
                                        legged=False))
    else:
        # HEAD: Coiled basketry skullcap (open face, clear eyeline f >= 0.58)
        gid_h = 'kimr_f_basket_cap'
        parts_h = [
            head_rings(f'{gid_h}_cap', 0.58, 1.02, 0.012, _p_basketry(), n=36, rows=10, apex=True),
            head_rings(f'{gid_h}_rim', 0.56, 0.63, 0.014, P('madder', 0.05, fabric=WOOL), n=36, rows=4),
        ]
        entries.append(assemble_garment(gid_h, 'Kimr Coiled Basketry Skullcap', 'head', 'kimr', parts_h,
                                        covers_hair=True, covers_face=False))

        # TORSO: One-shoulder Pueblo mountain-goat wool *manta* dress with madder-labyrinth border
        gid_t = 'kimr_f_manta_dress'
        manta_p = P('soot', 0.06, [
            B('bottom', 0.0, 0.075, 'kimr_madder_labyrinth', 'jusschalk', 'madder'),
            B('top', 0.0, 0.032, 'solid', 'madder'),
        ], fabric=WOOL)
        sash_p = P('madder', 0.05, [B('top', 0.0, 0.012, 'solid', 'jusschalk')], fabric=WOOL)
        parts_t = [
            torso_tube(f'{gid_t}_dress', KNEE + 0.05, CHEST + 0.07, ease=0.022, paint=manta_p,
                       flare=0.055, hang_from=WAIST, rows=20, n=40),
            belt_sash(f'{gid_t}_sash', WAIST - 0.04, WAIST + 0.04, sash_p, ease=0.032),
        ]
        # Single right-shoulder manta strap
        sh_r = J(R + 'Shoulder')
        sp_c = spine_at(CHEST + 0.04)
        p_f = chest_front(CHEST + 0.03, 0.022) + np.array([sh_r[0] * 0.72, 0.0, 0.0])
        p_t = np.array([sh_r[0] * 0.85, sh_r[1], TOP + 0.015])
        p_b = np.array([sh_r[0] * 0.72, sp_c[1] + 0.135, CHEST + 0.03])
        parts_t.append(strap(f'{gid_t}_shoulder_strap', [p_f, p_t, p_b], 0.062, manta_p, rigid_joint='Spine2'))
        entries.append(assemble_garment(gid_t, 'Kimr One-Shoulder Manta Dress', 'torso', 'kimr', parts_t))

        # LEGS: Pueblo white buckskin wrapped under-leggings (`legged=True`, zero Gate-6 conflict with manta dress)
        gid_l = 'kimr_f_manta_leggings'
        leg_p = _p_buckskin('jusschalk', 'madder')
        parts_l = list(trousers(gid_l, leg_p, ease=0.014, bag=0.012))
        entries.append(assemble_garment(gid_l, 'Kimr Buckskin Manta Under-Leggings', 'legs', 'kimr', parts_l,
                                        legged=True))

    # Shared Keeper pieces (back, gloves, feet)
    gid_b = f'kimr_{sex}_sloth_quiver'
    entries.append(assemble_garment(gid_b, 'Kimr Ground-Sloth Hide Quiver', 'back', 'kimr',
                                    _back_quiver(gid_b, _p_sloth_pelt(), _p_buckskin('buck', 'madder'),
                                                 cord_ease=0.008 if sex == 'm' else 0.022)))

    gid_g = f'kimr_{sex}_rawhide_bracer'
    entries.append(assemble_garment(gid_g, 'Kimr Rawhide Archer Bracers', 'gloves', 'kimr',
                                    _bracers(gid_g, _p_buckskin('buck', 'soot'), f0=0.52, f1=0.90)))

    gid_f = f'kimr_{sex}_yucca_sandals'
    entries.append(assemble_garment(gid_f, 'Kimr Woven Yucca Cordage Sandals', 'feet', 'kimr',
                                    sandal(gid_f, P('umber', 0.06, fabric='straw.reed.plaited'),
                                           P('oat', 0.05, fabric='straw.reed.plaited'), guard=True, laces=2)))
    return entries


def _build_tier_first_keeper(sex, body_id):
    """Tawn Geid Hall of Heroes Vigil — strict ascetic taboo: undyed white yucca only, unmasked, zero turquoise."""
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []
    wp = _p_yucca_white()
    ash_p = P('ash', 0.04, fabric='cloth.cotton.coarse')

    # TORSO: Undyed white yucca vigil shawl & waist-tucked tunic (no turquoise, no mask; kilt owns waist sash)
    gid_t = f'kimr_{sex}_vigil_shawl'
    parts_t = [
        torso_tube(f'{gid_t}_tunic', WAIST + 0.005, TOP, ease=0.017, paint=wp, rows=14, n=40),
        collar_disc(f'{gid_t}_shawl', 0.16, wp, drop=0.075, ease=0.020),
    ]
    parts_t.extend(sleeves(gid_t, 0.42, 0.022, wp))
    entries.append(assemble_garment(gid_t, 'Tawn Geid Undyed Yucca Vigil Shawl', 'torso', 'kimr', parts_t))

    # LEGS: Undyed white yucca vigil kilt
    gid_l = f'kimr_{sex}_vigil_kilt'
    entries.append(assemble_garment(gid_l, 'Tawn Geid Undyed Yucca Vigil Kilt', 'legs', 'kimr',
                                    _kilt(gid_l, wp, ash_p, z_bot=KNEE + 0.04, flare=0.048), legged=False))

    # FEET: Undyed yucca sandals
    gid_f = f'kimr_{sex}_vigil_sandals'
    entries.append(assemble_garment(gid_f, 'Tawn Geid Undyed Yucca Sandals', 'feet', 'kimr',
                                    sandal(gid_f, P('oat', 0.05, fabric='straw.reed.plaited'), wp, guard=True, laces=1)))
    return entries


def _build_tier_teller(sex, body_id):
    """Telyn Oral Bard & Genealogist."""
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    # HEAD: Turquoise + black jet + spiny-oyster shell mosaic brow-diadem (zero metal, ease=0.004)
    gid_h = f'kimr_{sex}_teller_diadem'
    parts_h = _kimr_headband(gid_h, _p_spondylus('oasisturq', 'coral'),
                             plaque_paint=_p_spondylus('coral', 'oasisturq'), n_plaques=5, tails=True)
    entries.append(assemble_garment(gid_h, 'Kimr Telyn Turquoise & Spondylus Diadem', 'head', 'kimr', parts_h,
                                    covers_hair=False, covers_face=False))

    # TORSO: Wild-turkey/crow feather capelet over waist-tucked madder-labyrinth tunic (kilt owns waist sash)
    gid_t = f'kimr_{sex}_teller_mantle'
    tunic_p = _p_labyrinth('madder', 'jusschalk')
    feath_p = _p_crow_feathers()
    parts_t = [
        torso_tube(f'{gid_t}_tunic', WAIST + 0.005, TOP, ease=0.017, paint=tunic_p, rows=14, n=40),
        collar_disc(f'{gid_t}_capelet', 0.21, feath_p, drop=0.11, ease=0.022, scallop=0.16),
    ]
    parts_t.extend(sleeves(gid_t, 0.55, 0.022, tunic_p))
    entries.append(assemble_garment(gid_t, 'Kimr Telyn Feather Mantle & Labyrinth Tunic', 'torso', 'kimr', parts_t))

    # BACK: Carved-bone Telling tally-rods & rolled hide scroll bundle
    gid_b = f'kimr_{sex}_story_bundle'
    entries.append(assemble_garment(gid_b, 'Kimr Telyn Carved-Bone Telling Bundle', 'back', 'kimr',
                                    _back_story_bundle(gid_b, _p_buckskin('buck', 'madder'),
                                                       P('ivory', 0.04, fabric='armor.osteoderm.scute'),
                                                       _p_buckskin('smokebuck', 'oasisturq'))))

    # GLOVES: Spiny-oyster & turquoise mosaic rawhide cuffs
    gid_g = f'kimr_{sex}_shell_cuffs'
    entries.append(assemble_garment(gid_g, 'Kimr Spondylus & Turquoise Mosaic Cuffs', 'gloves', 'kimr',
                                    _bracers(gid_g, _p_buckskin('smokebuck', 'oasisturq'),
                                             f0=0.60, f1=0.92, trim_paint=_p_spondylus())))

    # LEGS: Madder-labyrinth woven dance kilt
    gid_l = f'kimr_{sex}_teller_kilt'
    entries.append(assemble_garment(gid_l, 'Kimr Telyn Labyrinth Dance Kilt', 'legs', 'kimr',
                                    _kilt(gid_l, tunic_p, _p_spondylus(), z_bot=KNEE + 0.05, flare=0.048),
                                    legged=False))

    # FEET: Smoked-buckskin Pueblo moccasins with turquoise/shell ankle wrap (snug bare-leg fit)
    gid_f = f'kimr_{sex}_buckskin_moccasins'
    entries.append(assemble_garment(gid_f, 'Kimr Smoked-Buckskin Mosaic Moccasins', 'feet', 'kimr',
                                    boots(gid_f, P('umber', 0.06, fabric='leather.buckskin'),
                                          _p_buckskin('smokebuck', 'oasisturq'), top=0.34, wraps=2,
                                          wrap_paint=_p_spondylus(), ease_top=0.007)))
    return entries


def _build_tier_hero_dwsgr(sex, body_id):
    """Hero Dancer (M: Hirw two-horn case-mask + paho) / Matrilineal Mask-Carrier (F: tablita + carried Hirw)."""
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    if sex == 'm':
        # HEAD: Two-horn turquoise & ochre Hirw cylindrical case-mask
        gid_h = 'kimr_m_hirw_dwsgr'
        cyl_p = P('oasisturq', 0.05, [
            B('top', 0.0, 0.025, 'solid', 'jusschalk'),
            B('bottom', 0.0, 0.032, 'kimr_madder_labyrinth', 'jusschalk', 'madder'),
        ], [PN(0.0, 1.0, 'kimr_spondylus_mosaic', 'ochre', 'oasisturq', 0.14)], fabric='leather.buckskin')
        top_p = P('jusschalk', 0.04, fabric='leather.buckskin')
        ruff_p = P('pine', 0.06, [B('bottom', 0.0, 0.024, 'trim_feather_fringe', 'deepgreen', 'pine')],
                   fabric='plumage.contour.corvid')
        horn_p = P('soot', 0.04, [B('top', 0.0, 0.024, 'solid', 'oasisturq')], fabric='armor.osteoderm.scute')
        parts_h = _case_mask(gid_h, cyl_p, top_p, ruff_p,
                             horns=(horn_p, 0.16, 0.026, 0.006, 1.0))
        entries.append(assemble_garment(gid_h, 'Kimr Two-Horn Hirw Case-Mask', 'head', 'kimr', parts_h,
                                        covers_hair=True, covers_face=True))

        # BACK: Feathered paho prayer-stick bundle
        gid_b = 'kimr_m_prayer_sticks'
        entries.append(assemble_garment(gid_b, 'Kimr Feathered Paho Prayer-Stick Bundle', 'back', 'kimr',
                                        _back_prayer_sticks(gid_b, _p_buckskin('buck', 'oasisturq'))))
    else:
        # HEAD: Stepped Pueblo tablita turquoise & spiny-oyster whorl crown
        gid_h = 'kimr_f_turq_whorl_crown'
        parts_h = _tablita_crown(gid_h, P('madder', 0.05, fabric=WOOL),
                                 _p_spondylus('oasisturq', 'coral'),
                                 _p_spondylus('oasisturq', 'jusschalk'))
        entries.append(assemble_garment(gid_h, 'Kimr Turquoise & Spondylus Tablita Crown', 'head', 'kimr', parts_h,
                                        covers_hair=False, covers_face=False))

        # BACK: Matrilineal clan Hirw case-mask slung in honour on a back tumpline
        gid_b = 'kimr_f_carried_hirw'
        entries.append(assemble_garment(gid_b, 'Kimr Matrilineal Carried Hirw Mask', 'back', 'kimr',
                                        _back_carried_hirw(gid_b, _p_buckskin('buck', 'madder'))))

    # TORSO: Sinew-laced glyptodont osteoderm bone-scute carapace cuirass over waist-tucked madder-labyrinth tunic
    gid_t = f'kimr_{sex}_scute_cuirass'
    tunic_p = _p_labyrinth('madder', 'jusschalk')
    scute_p = _p_osteoderm('bone', 'madder')
    parts_t = [
        torso_tube(f'{gid_t}_under', WAIST + 0.005, TOP, ease=0.017, paint=tunic_p, rows=14, n=38),
        torso_tube(f'{gid_t}_cuirass', WAIST + 0.015, CHEST + 0.08, ease=0.026, paint=scute_p, rows=12, n=36),
        pauldron(f'{gid_t}_pauld_L', L, scute_p, reach=0.28, ease=0.025),
        pauldron(f'{gid_t}_pauld_R', R, scute_p, reach=0.28, ease=0.025),
    ]
    parts_t.extend(sleeves(gid_t, 0.36, 0.020, tunic_p))
    entries.append(assemble_garment(gid_t, 'Kimr Glyptodont Osteoderm Scute Cuirass', 'torso', 'kimr', parts_t))

    # GLOVES: Carved megafauna bone-splint vambraces
    gid_g = f'kimr_{sex}_bone_vambraces'
    entries.append(assemble_garment(gid_g, 'Kimr Carved Bone-Splint Vambraces', 'gloves', 'kimr',
                                    _bracers(gid_g, scute_p, f0=0.45, f1=0.92,
                                             trim_paint=_p_buckskin('madder', 'jusschalk'))))

    # LEGS: Ceremonial madder-labyrinth & spondylus fringed dance kilt
    gid_l = f'kimr_{sex}_dance_kilt'
    dance_p = P('madder', 0.05, [
        B('bottom', 0.0, 0.055, 'kimr_spondylus_mosaic', 'coral', 'oasisturq'),
        B('top', 0.0, 0.024, 'solid', 'jusschalk'),
    ], [PN(0.0, 1.0, 'kimr_madder_labyrinth', 'jusschalk', 'madder', 0.16)], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Kimr Ceremonial Labyrinth Dance Kilt', 'legs', 'kimr',
                                    _kilt(gid_l, dance_p, _p_spondylus(), z_bot=KNEE + 0.05, flare=0.050),
                                    legged=False))

    # FEET: Ankle-wrapped buckskin dance moccasins (snug bare-leg fit)
    gid_f = f'kimr_{sex}_dance_moccasins'
    entries.append(assemble_garment(gid_f, 'Kimr Ankle-Wrapped Dance Moccasins', 'feet', 'kimr',
                                    boots(gid_f, P('umber', 0.06, fabric='leather.buckskin'),
                                          _p_buckskin('buck', 'madder'), top=0.38, wraps=3,
                                          wrap_paint=P('jusschalk', 0.04, fabric=COTTON), ease_top=0.007)))
    return entries


def _build_tier_hero_hemr(sex, body_id):
    """Sloth-Claw Heavy Canyon Warden."""
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    # HEAD: Soot & red-ochre hematite cylindrical case-mask with bone cheek tusks
    gid_h = f'kimr_{sex}_hirw_hemr'
    cyl_p = P('soot', 0.06, [
        B('top', 0.0, 0.026, 'solid', 'madder'),
        B('bottom', 0.0, 0.032, 'solid', 'terracotta'),
    ], [PN(0.0, 1.0, 'kimr_madder_labyrinth', 'terracotta', 'soot', 0.14)], fabric='leather.buckskin')
    parts_h = _case_mask(gid_h, cyl_p, P('madder', 0.05, fabric='leather.buckskin'),
                         _p_sloth_pelt(), tusks=True,
                         eye_paint=P('ochre', 0.04, fabric=COTTON),
                         mouth_paint=P('terracotta', 0.04, fabric='wood.painted'))
    entries.append(assemble_garment(gid_h, 'Kimr Hemr Soot & Ochre Case-Mask', 'head', 'kimr', parts_h,
                                    covers_hair=True, covers_face=True))

    # TORSO: Shaggy ground-sloth pelt mantle + bone-laced rawhide harness over waist-tucked labyrinth tunic
    gid_t = f'kimr_{sex}_sloth_pelt_harness'
    tunic_p = _p_labyrinth('terracotta', 'jusschalk')
    pelt_p = _p_sloth_pelt()
    parts_t = [
        torso_tube(f'{gid_t}_tunic', WAIST + 0.005, TOP, ease=0.017, paint=tunic_p, rows=14, n=38),
        collar_disc(f'{gid_t}_pelt', 0.22, pelt_p, drop=0.12, ease=0.024, scallop=0.14),
        pauldron(f'{gid_t}_pauld_L', L, pelt_p, reach=0.34, ease=0.028),
        pauldron(f'{gid_t}_pauld_R', R, pelt_p, reach=0.34, ease=0.028),
    ]
    parts_t.append(crossed_sash(f'{gid_t}_harness', _p_buckskin('smokebuck', 'madder'), width=0.052, ease=0.028))
    parts_t.extend(sleeves(gid_t, 0.42, 0.022, tunic_p))
    entries.append(assemble_garment(gid_t, 'Kimr Ground-Sloth Pelt & Bone Harness', 'torso', 'kimr', parts_t))

    # BACK: Carved giant ground-sloth trophy scapula shield/rack
    gid_b = f'kimr_{sex}_trophy_scapula'
    entries.append(assemble_garment(gid_b, 'Kimr Ground-Sloth Trophy Scapula', 'back', 'kimr',
                                    _back_trophy_scapula(gid_b, _p_buckskin('smokebuck', 'madder'))))

    # GLOVES: Articulated sloth-hide & curved bone-claw gauntlets
    gid_g = f'kimr_{sex}_sloth_claws'
    entries.append(assemble_garment(gid_g, 'Kimr Sloth-Hide Bone-Claw Gauntlets', 'gloves', 'kimr',
                                    _sloth_claw_gauntlets(gid_g)))

    # LEGS: Heavy rawhide & osteoderm-bordered canyon kilt
    gid_l = f'kimr_{sex}_warden_kilt'
    wk_p = leathery(P('smokebuck', 0.06, [
        B('bottom', 0.0, 0.050, 'osteoderm_scute', 'umber', 'bone'),
        B('top', 0.0, 0.020, 'solid', 'madder'),
    ], fabric='leather.buckskin'))
    entries.append(assemble_garment(gid_l, 'Kimr Osteoderm-Bordered Canyon Kilt', 'legs', 'kimr',
                                    _kilt(gid_l, wk_p, _p_buckskin('madder', 'bone'), z_bot=KNEE + 0.04, flare=0.046),
                                    legged=False))

    # FEET: Knee-high wrapped buckskin & rawhide-soled canyon boots (snug bare-leg fit)
    gid_f = f'kimr_{sex}_warden_boots'
    entries.append(assemble_garment(gid_f, 'Kimr Wrapped Buckskin Canyon Boots', 'feet', 'kimr',
                                    boots(gid_f, P('soot', 0.06, fabric='leather.buckskin'),
                                          _p_buckskin('smokebuck', 'madder'), top=0.72, wraps=3,
                                          wrap_paint=_p_buckskin('buck', 'soot'), ease_top=0.007)))
    return entries


def _build_tier_clown(sex, body_id):
    """Sacred Mudhead / *Klown*."""
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    # HEAD: Kaolin/mud-ochre cloth hood-mask with twin stuffed-cloth corn-husk horns
    gid_h = f'kimr_{sex}_clown_horncap'
    mud_p = P('clay', 0.06, [
        B('top', 0.0, 0.024, 'solid', 'jusschalk'),
        B('bottom', 0.0, 0.024, 'solid', 'soot'),
    ], fabric='cloth.cotton.coarse')
    husk_p = P('jusschalk', 0.05, [B('top', 0.0, 0.020, 'solid', 'soot')], fabric='cloth.cotton.coarse')
    parts_h = _case_mask(gid_h, mud_p, mud_p, P('soot', 0.05, fabric=COTTON),
                         horns=(husk_p, 0.14, 0.032, 0.014, 0.7),
                         eye_paint=P('jusschalk', 0.03, fabric=COTTON),
                         mouth_paint=P('soot', 0.04, fabric=COTTON))
    entries.append(assemble_garment(gid_h, 'Kimr Sacred Mudhead Horned Mask', 'head', 'kimr', parts_h,
                                    covers_hair=True, covers_face=True))

    # TORSO: Soot & kaolin horizontal ring-painted cotton tunic + dried-gourd belt sash
    gid_t = f'kimr_{sex}_clown_stripes'
    stripe_p = P('jusschalk', 0.05, [
        B('top', 0.0, 0.035, 'solid', 'soot'),
        B('bottom', 0.0, 0.035, 'solid', 'soot'),
        B('mid', 0.0, 0.040, 'solid', 'soot'),
    ], fabric='cloth.cotton.coarse')
    tunic_part = torso_tube(f'{gid_t}_tunic', WAIST + 0.022, TOP, ease=0.017, paint=stripe_p, rows=14, n=40)
    parts_t = [tunic_part]
    parts_t.extend(sleeves(gid_t, 0.48, 0.022, stripe_p))
    # Pair of dried rattle gourds seated cleanly outside the waist hem at front-side hips
    gourd_p = P('ochre', 0.05, fabric='wood.painted')
    s_ring = tunic_part.P[0]
    s_c = s_ring.mean(axis=0)
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        d = np.array([sgn * 0.82, -0.57, 0.0])
        pt = s_ring[int(np.argmax((s_ring - s_c) @ d))]
        parts_t.append(blob(f'{gid_t}_gourd_{tag}', pt + d * 0.032 + np.array([0.0, 0.0, -0.012]),
                            (0.028, 0.026, 0.036), gourd_p, rigid_joint='Spine1'))
    entries.append(assemble_garment(gid_t, 'Kimr Klown Soot & Kaolin Striped Tunic', 'torso', 'kimr', parts_t))

    # BACK: Woven yucca-net trickster bundle & rattle gourds
    gid_b = f'kimr_{sex}_clown_bundle'
    entries.append(assemble_garment(gid_b, 'Kimr Klown Yucca-Net Gourd Bundle', 'back', 'kimr',
                                    _back_clown_bundle(gid_b, P('oat', 0.05, fabric='straw.reed.plaited'))))

    # GLOVES: Soot-and-kaolin striped wrist bands
    gid_g = f'kimr_{sex}_clown_bands'
    entries.append(assemble_garment(gid_g, 'Kimr Klown Striped Wrist Bands', 'gloves', 'kimr',
                                    _bracers(gid_g, stripe_p, f0=0.68, f1=0.93)))

    # LEGS: Striped soot/kaolin loincloth kilt
    gid_l = f'kimr_{sex}_clown_loincloth'
    entries.append(assemble_garment(gid_l, 'Kimr Klown Striped Loincloth Kilt', 'legs', 'kimr',
                                    _kilt(gid_l, stripe_p, P('soot', 0.05, fabric=COTTON),
                                          z_bot=KNEE + 0.08, flare=0.040), legged=False))

    # FEET: Yucca sandals
    gid_f = f'kimr_{sex}_clown_sandals'
    entries.append(assemble_garment(gid_f, 'Kimr Klown Yucca Sandals', 'feet', 'kimr',
                                    sandal(gid_f, P('clay', 0.06, fabric='straw.reed.plaited'),
                                           P('jusschalk', 0.04, fabric='straw.reed.plaited'), guard=True, laces=2)))
    return entries


def _build_tier_bogi(sex, body_id):
    """Bogi Ogre Discipline Enforcer."""
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    # HEAD: Soot-black & red-ochre cylindrical rawhide ogre case-mask with toothed juniper snout & crow-feather ruff
    gid_h = f'kimr_{sex}_bogi_mask'
    cyl_p = P('soot', 0.05, [
        B('top', 0.0, 0.025, 'solid', 'madder'),
        B('bottom', 0.0, 0.028, 'solid', 'madder'),
    ], fabric='leather.buckskin')
    parts_h = _case_mask(gid_h, cyl_p, P('soot', 0.05, fabric='leather.buckskin'),
                         _p_crow_feathers(), snout=True,
                         eye_paint=P('jusschalk', 0.03, fabric='beads.glass'),
                         mouth_paint=P('madder', 0.05, fabric='wood.painted'))
    entries.append(assemble_garment(gid_h, 'Kimr Bogi Toothed-Snout Ogre Mask', 'head', 'kimr', parts_h,
                                    covers_hair=True, covers_face=True))

    # TORSO: Crow-feather & soot-dyed rawhide mantle over madder-and-soot tunic
    gid_t = f'kimr_{sex}_bogi_mantle'
    tunic_p = P('soot', 0.06, [
        B('bottom', 0.0, 0.045, 'kimr_madder_labyrinth', 'madder', 'soot'),
        B('top', 0.0, 0.020, 'solid', 'madder'),
    ], fabric=WOOL)
    feath_p = _p_crow_feathers()
    parts_t = [
        torso_tube(f'{gid_t}_tunic', WAIST + 0.005, TOP, ease=0.017, paint=tunic_p, rows=14, n=40),
        collar_disc(f'{gid_t}_mantle', 0.24, feath_p, drop=0.14, ease=0.024, scallop=0.18),
    ]
    parts_t.extend(sleeves(gid_t, 0.50, 0.022, tunic_p))
    entries.append(assemble_garment(gid_t, 'Kimr Bogi Crow-Feather Mantle & Tunic', 'torso', 'kimr', parts_t))

    # BACK: Tall conical coiled-reed burden-basket
    gid_b = f'kimr_{sex}_bogi_basket'
    entries.append(assemble_garment(gid_b, 'Kimr Bogi Coiled-Reed Burden-Basket', 'back', 'kimr',
                                    _back_bogi_basket(gid_b, _p_buckskin('soot', 'madder'))))

    # GLOVES: Soot-dyed rawhide forearm wraps
    gid_g = f'kimr_{sex}_bogi_wraps'
    entries.append(assemble_garment(gid_g, 'Kimr Bogi Soot-Dyed Forearm Wraps', 'gloves', 'kimr',
                                    _bracers(gid_g, _p_buckskin('soot', 'madder'), f0=0.48, f1=0.92)))

    # LEGS: Soot & madder ogre kilt
    gid_l = f'kimr_{sex}_bogi_kilt'
    entries.append(assemble_garment(gid_l, 'Kimr Bogi Soot & Madder Ogre Kilt', 'legs', 'kimr',
                                    _kilt(gid_l, tunic_p, P('madder', 0.05, fabric=WOOL),
                                          z_bot=KNEE + 0.04, flare=0.048), legged=False))
    return entries


def _build_tier_hawrog(sex, body_id):
    """Crisis War-Leader (*Awrog*) — pairs with existing Meshy hero `kimr_{m,f}_hawrog_skullhelm`."""
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []

    # TORSO: Grand war-leader glyptodont osteoderm & spondylus inlaid breastplate, feather/fur pauldrons, obsidian hip tally
    gid_t = f'kimr_{sex}_hawrog_panoply'
    tunic_p = _p_labyrinth('madder', 'jusschalk')
    scute_p = _p_osteoderm('ivory', 'oasisturq')
    mosaic_p = _p_spondylus('oasisturq', 'coral')
    tunic_part = torso_tube(f'{gid_t}_tunic', WAIST + 0.005, TOP, ease=0.017, paint=tunic_p, rows=14, n=38)
    parts_t = [
        tunic_part,
        torso_tube(f'{gid_t}_cuirass', WAIST + 0.015, CHEST + 0.09, ease=0.026, paint=scute_p, rows=12, n=36),
        collar_disc(f'{gid_t}_gorget', 0.16, mosaic_p, drop=0.065, ease=0.024, scallop=0.10),
        pauldron(f'{gid_t}_pauld_L', L, _p_crow_feathers(), reach=0.35, ease=0.028),
        pauldron(f'{gid_t}_pauld_R', R, _p_crow_feathers(), reach=0.35, ease=0.028),
    ]
    parts_t.extend(sleeves(gid_t, 0.45, 0.022, tunic_p))
    # Turquoise & spondylus pectoral medallion seated flush on chest carapace
    cf = chest_front(CHEST - 0.01, 0.030)
    parts_t.append(rosette(f'{gid_t}_pectoral', cf,
                           np.array([0.0, -1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                           0.052, mosaic_p, n=16, thick=0.014, rigid_joint='Spine2'))
    # Flaked obsidian war-tally blades seated cleanly outside left hip
    b_ring = tunic_part.P[0]
    b_c = b_ring.mean(axis=0)
    d_l = np.array([-0.88, -0.46, 0.0])
    pt_l = b_ring[int(np.argmax((b_ring - b_c) @ d_l))]
    obs_p = _p_obsidian()
    for bi in range(2):
        p0 = pt_l + d_l * 0.028 + np.array([0.0, bi * 0.022 - 0.010, 0.005])
        p1 = p0 + np.array([-0.012, -0.008, -0.11])
        parts_t.append(horn(f'{gid_t}_obsidian_{bi}', [p0, p1], 0.015, 0.003, obs_p,
                            n=6, rows=5, rigid_joint='Spine1'))
    entries.append(assemble_garment(gid_t, 'Kimr Awrog Osteoderm & Spondylus War-Panoply', 'torso', 'kimr', parts_t))

    # BACK: Tall dorsal carved-bone & crow-feather war-standard rack
    gid_b = f'kimr_{sex}_hawrog_standard'
    entries.append(assemble_garment(gid_b, 'Kimr Awrog Bone & Crow-Feather War-Standard', 'back', 'kimr',
                                    _back_hawrog_standard(gid_b, _p_buckskin('smokebuck', 'oasisturq'))))

    # LEGS: Laced osteoderm & labyrinth-woven war tassets/kilt
    gid_l = f'kimr_{sex}_hawrog_tassets'
    tasset_p = P('bone', 0.06, [
        B('bottom', 0.0, 0.055, 'kimr_madder_labyrinth', 'jusschalk', 'madder'),
        B('top', 0.0, 0.025, 'kimr_spondylus_mosaic', 'coral', 'oasisturq'),
    ], [PN(0.0, 1.0, 'osteoderm_scute', 'umber', 'bone', 0.16)], fabric='armor.osteoderm.scute')
    entries.append(assemble_garment(gid_l, 'Kimr Awrog Osteoderm War-Tassets', 'legs', 'kimr',
                                    _kilt(gid_l, tasset_p, mosaic_p, z_bot=KNEE + 0.03, flare=0.052),
                                    legged=False))
    return entries


# ===========================================================================================================
# OUTFIT MATRIX, PEOPLES ENTRY & MODULE ENTRYPOINT
# ===========================================================================================================
def _outfits_for_sex(sex):
    outfits = {
        'keeper': {
            'head': 'kimr_m_headband' if sex == 'm' else 'kimr_f_basket_cap',
            'torso': 'kimr_m_keeper_strap' if sex == 'm' else 'kimr_f_manta_dress',
            'back': f'kimr_{sex}_sloth_quiver',
            'gloves': f'kimr_{sex}_rawhide_bracer',
            'legs': 'kimr_m_breechclout' if sex == 'm' else 'kimr_f_manta_leggings',
            'feet': f'kimr_{sex}_yucca_sandals',
        },
        'first_keeper': {
            'torso': f'kimr_{sex}_vigil_shawl',
            'legs': f'kimr_{sex}_vigil_kilt',
            'feet': f'kimr_{sex}_vigil_sandals',
        },
        'teller': {
            'head': f'kimr_{sex}_teller_diadem',
            'torso': f'kimr_{sex}_teller_mantle',
            'back': f'kimr_{sex}_story_bundle',
            'gloves': f'kimr_{sex}_shell_cuffs',
            'legs': f'kimr_{sex}_teller_kilt',
            'feet': f'kimr_{sex}_buckskin_moccasins',
        },
        'hero_dwsgr': {
            'head': 'kimr_m_hirw_dwsgr' if sex == 'm' else 'kimr_f_turq_whorl_crown',
            'torso': f'kimr_{sex}_scute_cuirass',
            'back': 'kimr_m_prayer_sticks' if sex == 'm' else 'kimr_f_carried_hirw',
            'gloves': f'kimr_{sex}_bone_vambraces',
            'legs': f'kimr_{sex}_dance_kilt',
            'feet': f'kimr_{sex}_dance_moccasins',
        },
        'hero_hemr': {
            'head': f'kimr_{sex}_hirw_hemr',
            'torso': f'kimr_{sex}_sloth_pelt_harness',
            'back': f'kimr_{sex}_trophy_scapula',
            'gloves': f'kimr_{sex}_sloth_claws',
            'legs': f'kimr_{sex}_warden_kilt',
            'feet': f'kimr_{sex}_warden_boots',
        },
        'clown': {
            'head': f'kimr_{sex}_clown_horncap',
            'torso': f'kimr_{sex}_clown_stripes',
            'back': f'kimr_{sex}_clown_bundle',
            'gloves': f'kimr_{sex}_clown_bands',
            'legs': f'kimr_{sex}_clown_loincloth',
            'feet': f'kimr_{sex}_clown_sandals',
        },
        'bogi': {
            'head': f'kimr_{sex}_bogi_mask',
            'torso': f'kimr_{sex}_bogi_mantle',
            'back': f'kimr_{sex}_bogi_basket',
            'gloves': f'kimr_{sex}_bogi_wraps',
            'legs': f'kimr_{sex}_bogi_kilt',
            'feet': f'kimr_{sex}_dance_moccasins',
        },
        'hawrog': {
            'head': f'kimr_{sex}_hawrog_skullhelm',
            'torso': f'kimr_{sex}_hawrog_panoply',
            'back': f'kimr_{sex}_hawrog_standard',
            'gloves': f'kimr_{sex}_bone_vambraces',
            'legs': f'kimr_{sex}_hawrog_tassets',
            'feet': f'kimr_{sex}_warden_boots',
        },
    }
    return outfits


def build_kimr_peoples_entry():
    return {
        'id': 'kimr',
        'name': 'Kimr (Labyrinth Canyon)',
        'note': (
            'Ancestral Pueblo / Hopi-Zuni × Neolithic Welsh megafauna-herders of the Labyrinth. '
            'Strict zero-metal material law: glyptodont osteoderms, megafauna bone/scapula, flaked obsidian, '
            'coiled reed basketry, yucca cordage, mountain-goat wool, wild-turkey/crow feathers, '
            'kaolin/madder/ochre/soot pigments, and turquoise + spiny-oyster shell mosaic.'
        ),
        'ancestry': {'african': [0.05, 0.15], 'asian': [0.55, 0.75], 'caucasian': [0.15, 0.35]},
        'skin': ['#c7936e', '#ae7854', '#94613f', '#7a4d30'],
        'hair': ['#121010', '#1c1714', '#261e19'],
        'eyes': ['#24160e', '#382214', '#4d301c'],
        'grey': 0.35,
        'beard': 0.15,
        'styles': {
            'male': ['long01', 'braid01', 'ponytail01', 'fourstrandbraid', 'Short_Hair_B'],
            'female': ['long01', 'braid01', 'elvs_double_mh_braid', 'fourstrandbraid', 'fhair01'],
        },
        'tiers': KIMR_TIER_SHARES,
        'tier_labels': KIMR_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_kimr_kit():
    """Compile all 8 Kimr tiers across `mpfb_male` and `mpfb_female`."""
    entries = []
    builders = (
        _build_tier_keeper,
        _build_tier_first_keeper,
        _build_tier_teller,
        _build_tier_hero_dwsgr,
        _build_tier_hero_hemr,
        _build_tier_clown,
        _build_tier_bogi,
        _build_tier_hawrog,
    )
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        for fn in builders:
            entries.extend(fn(sex, body_id))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_kimr_kit()
    peoples_entry = build_kimr_peoples_entry()
    manifest_path = CULTURES_DIR / 'kimr_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'kimr',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Kimr pieces ({n_m} male, {n_f} female) across 8 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
