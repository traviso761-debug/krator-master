"""Iziz Regional Subject Kits (`izani` Marches: Porta Marr, Talia, Pylon, Shell, Dilihan).

Builds ALL 21 Regional Subject tiers across BOTH `mpfb_male` (`*_m_*`) and `mpfb_female` (`*_f_*`)
bodies (42 complete M+F outfits = 252 pieces across `head`, `torso`, `gloves`, `legs`, `feet`, `back`):

Region 2 — `marr` (Porta Marr — Nautical & swashbuckling Roman-maritime):
 1. `marr_dockhand`        — De Xedaz Canal Rigger
 2. `marr_gardonz_factor`  — Qartar de Gardonz Prize-Broker
 3. `marr_navigator`       — Navigadarz Chart-Master
 4. `marr_classiarius`     — Porta Marr Harbor Guard
 5. `marr_corsair`         — MC-10 / PF-01 Hooked-Sun Privateer

Region 3 — `talia` (Talia — Blued-steel & gold damascened highland Roman-Byzantine):
 6. `tal_scholar`          — University of Talia Jurist
 7. `tal_toll_baron`       — Highland Pass Toll-Magnate
 8. `tal_pass_guard`       — Talia Pass-Gate Guard
 9. `tal_highland_auxilia` — Girder / Daridel Mountain Escort

Region 4 — `pylon` (Pylon — Arid Mad Max / Caesar's Legion salvage-Roman):
10. `pyl_salvager`         — Salvagers' Guild Ruin-Breaker
11. `pyl_conduit_warden`   — Aqueduct Ration-Magistrate
12. `pyl_decurion_guard`   — Pylon Salvage-Legion Town Guard
13. `pyl_dust_vexillarius` — Bowl VIIIb Outrider / Dust-Cloak

Region 5 — `shell` (Shell & Port Goto — Brutalist grim Uruk-Roman siege & foundry):
14. `shl_foundry_worker`   — Xelroda Smelter & Sulfur Miner
15. `shl_enforcer`         — Debt-Peon Bailiff / Manhunter
16. `shl_siege_guard`      — Shell Uruk-Roman Siege Guard
17. `shl_chain_snapper`    — BF-03 Maroon Rebel

Region 6 — `dilihan` (Dilihan & Port Visas — Cosmopolitan Cut frontier: Hykkousoi + Jimjam):
18. `dil_almanac_factor`   — Dellu-Handu Citizen (Jimjam Trend)
19. `dil_hykk_envoy`       — Cut Senator (Hykkousoi Trend)
20. `dil_cut_guard`        — Dilihan Linothorax Town Guard
21. `dil_aidol_voltigeur`  — Aidol Quiet-Copy Rifleman

Run standalone to compile all `.glb` + `.morph.bin` pieces and emit `iziz_subjects_manifest.json`:
    python -u tools/garments/cultures/iziz_subjects.py
"""
import os
os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')

from contextlib import contextmanager
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

if __package__:
    from .. import core
    from .. import paint as paint_mod
    from ..core import (
        Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
        assemble_garment,
    )
    from ..paint import P, B, PN, C, COTTON, WOOL, leathery, sample_cultural_tex
    from ..types.torso import (
        torso_tube, collar, collar_disc, cape, crossed_sash, stand_collar, neck_ring,
    )
    from ..types.armor import (
        cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
        hinged_tassets, sculpted_vambraces, sculpted_greaves,
    )
    from ..types.limbs import limb_tube, sleeves, trousers, full_gloves
    from ..types.footwear import boots, sandal
    from ..types.headgear import (
        head_landmarks_exact, head_rings, sculpted_faceplate,
        hood, brim, crown_band, crest, horn, fan, turban,
    )
    from ..types.accoutrements import (
        blob, belt_sash, pouch_belt, tube, rosette,
    )
else:
    from garments import core
    from garments import paint as paint_mod
    from garments.core import (
        Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
        assemble_garment,
    )
    from garments.paint import P, B, PN, C, COTTON, WOOL, leathery, sample_cultural_tex
    from garments.types.torso import (
        torso_tube, collar, collar_disc, cape, crossed_sash, stand_collar, neck_ring,
    )
    from garments.types.armor import (
        cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
        hinged_tassets, sculpted_vambraces, sculpted_greaves,
    )
    from garments.types.limbs import limb_tube, sleeves, trousers, full_gloves
    from garments.types.footwear import boots, sandal
    from garments.types.headgear import (
        head_landmarks_exact, head_rings, sculpted_faceplate,
        hood, brim, crown_band, crest, horn, fan, turban,
    )
    from garments.types.accoutrements import (
        blob, belt_sash, pouch_belt, tube, rosette,
    )


# ===========================================================================================================
# REGIONAL TIER METADATA (21 TIERS ACROSS 5 IZIZ SUBJECT REGIONS)
# ===========================================================================================================
SUBJECT_TIER_META = {
    # Region 2: Porta Marr (5 tiers)
    'marr_dockhand':        ('marr',    'De Xedaz Canal Rigger',                          0.030),
    'marr_gardonz_factor':  ('marr',    'Qartar de Gardonz Prize-Broker',                 0.020),
    'marr_navigator':       ('marr',    'Navigadarz Chart-Master',                        0.020),
    'marr_classiarius':     ('marr',    'Porta Marr Harbor Guard (Classiarius)',          0.030),
    'marr_corsair':         ('marr',    'Hooked-Sun Privateer (MC-10 / PF-01)',           0.020),
    # Region 3: Talia (4 tiers)
    'tal_scholar':          ('talia',   'University of Talia Jurist',                     0.020),
    'tal_toll_baron':       ('talia',   'Highland Pass Toll-Magnate',                     0.015),
    'tal_pass_guard':       ('talia',   'Talia Pass-Gate Guard',                          0.030),
    'tal_highland_auxilia': ('talia',   'Girder / Daridel Mountain Escort',               0.025),
    # Region 4: Pylon (4 tiers)
    'pyl_salvager':         ('pylon',   "Salvagers' Guild Ruin-Breaker",                  0.025),
    'pyl_conduit_warden':   ('pylon',   'Aqueduct Ration-Magistrate',                     0.020),
    'pyl_decurion_guard':   ('pylon',   'Pylon Salvage-Legion Town Guard',                0.030),
    'pyl_dust_vexillarius': ('pylon',   'Bowl VIIIb Outrider (Dust-Cloak)',               0.020),
    # Region 5: Shell (4 tiers)
    'shl_foundry_worker':   ('shell',   'Xelroda Smelter & Sulfur Miner',                 0.025),
    'shl_enforcer':         ('shell',   'Debt-Peon Bailiff & Manhunter',                  0.025),
    'shl_siege_guard':      ('shell',   'Shell Uruk-Roman Siege Guard',                   0.030),
    'shl_chain_snapper':    ('shell',   'BF-03 Chain-Snapper Maroon Rebel',               0.015),
    # Region 6: Dilihan (4 tiers)
    'dil_almanac_factor':   ('dilihan', 'Dellu-Handu Citizen (Jimjam Trend)',             0.025),
    'dil_hykk_envoy':       ('dilihan', 'Cut Senator (Hykkousoi Trend)',                  0.020),
    'dil_cut_guard':        ('dilihan', 'Dilihan Linothorax Town Guard',                  0.030),
    'dil_aidol_voltigeur':  ('dilihan', 'Aidol Quiet-Copy Rifleman',                      0.025),
}


# ===========================================================================================================
# SCOPED REGIONAL MOTIFS (zero permanent mutation of paint.motif; all prefixed subj_*)
# ===========================================================================================================
SUBJ_CUSTOM_MOTIFS = {
    'subj_marr_compass',
    'subj_marr_stripe',
    'subj_marr_hooked_sun',
    'subj_talia_damascene',
    'subj_talia_loros',
    'subj_pylon_caution',
    'subj_pylon_hex_grille',
    'subj_pylon_tread',
    'subj_shell_slab_iron',
    'subj_shell_foundry_mark',
    'subj_dil_aegean_silk',
    'subj_dil_ys_meander',
    'subj_dil_linothorax',
    'subj_pteruges_strip',
}


def _subj_custom_motif(style, w, h, fg, bg, aspect=1.0):
    ww = max(w, 1)
    hh = max(h, 1)
    img = np.empty((hh, ww, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:hh, 0:ww]
    u = (xx + 0.5) / ww
    v = (yy + 0.5) / hh

    if style == 'subj_marr_compass':
        tex = sample_cultural_tex('tex.marr_compass_wave', ww, hh, fg, bg, pal_blend=0.20)
        guard = (v < 0.14) | (v > 0.86)
        img = 0.25 * img + 0.75 * tex
        img[guard] = fg

    elif style == 'subj_marr_stripe':
        # Bold naval horizontal boat-shirt / salt-canvas stripes
        ny = max(6.0, round(10.0 / max(aspect, 0.4)))
        stripe = ((v * ny) % 1.0) < 0.44
        img[stripe] = fg

    elif style == 'subj_marr_hooked_sun':
        tex = sample_cultural_tex('tex.pirates_hooked_sun', ww, hh, fg, bg, pal_blend=0.22)
        img = 0.22 * img + 0.78 * tex

    elif style == 'subj_talia_damascene':
        tex = sample_cultural_tex('tex.talia_damascene_niello', ww, hh, fg, bg, pal_blend=0.18)
        img = 0.20 * img + 0.80 * tex

    elif style == 'subj_talia_loros':
        tex = sample_cultural_tex('tex.talia_loros_sun', ww, hh, fg, bg, pal_blend=0.20)
        img = 0.22 * img + 0.78 * tex

    elif style == 'subj_pylon_caution':
        tex = sample_cultural_tex('tex.pylon_caution_stencil', ww, hh, fg, bg, pal_blend=0.18)
        # Overlay subtle diagonal hazard chevron bands
        diag = ((u * 8.0 + v * 2.5) % 1.0) < 0.32
        img = 0.20 * img + 0.80 * tex
        img[diag & ((v < 0.16) | (v > 0.84))] = fg

    elif style == 'subj_pylon_hex_grille':
        tex = sample_cultural_tex('tex.pylon_hex_grille', ww, hh, fg, bg, pal_blend=0.25)
        img = 0.25 * img + 0.75 * tex

    elif style == 'subj_pylon_tread':
        tex = sample_cultural_tex('tex.salvage_tread_plate', ww, hh, fg, bg, pal_blend=0.25)
        img = 0.25 * img + 0.75 * tex

    elif style == 'subj_shell_slab_iron':
        tex = sample_cultural_tex('tex.uruk_slab_iron', ww, hh, fg, bg, pal_blend=0.22)
        img = 0.22 * img + 0.78 * tex

    elif style == 'subj_shell_foundry_mark':
        tex = sample_cultural_tex('tex.shell_foundry_mark', ww, hh, fg, bg, pal_blend=0.18)
        img = 0.18 * img + 0.82 * tex

    elif style == 'subj_dil_aegean_silk':
        tex = sample_cultural_tex('tex.dilihan_aegean_silk', ww, hh, fg, bg, pal_blend=0.18)
        img = 0.20 * img + 0.80 * tex

    elif style == 'subj_dil_ys_meander':
        tex = sample_cultural_tex('tex.ys_band', ww, hh, fg, bg, pal_blend=0.20)
        img = 0.20 * img + 0.80 * tex

    elif style == 'subj_dil_linothorax':
        # Laminated white Aegean sea-linen with crisp diamond cord quilting & bronze pectoral trim
        nx = max(6.0, round(9.0 * max(aspect, 0.5)))
        ny = max(6.0, round(9.0 / max(aspect, 0.5)))
        gu = (u * nx) % 1.0 - 0.5
        gv = (v * ny) % 1.0 - 0.5
        stitch = (np.abs(np.abs(gu) + np.abs(gv) - 0.48) < 0.05)
        img[stitch] = fg

    elif style == 'subj_pteruges_strip':
        nx = max(6.0, round(10.0 * max(aspect, 0.5)))
        lu = (u * nx) % 1.0
        gap = (lu < 0.09) | (lu > 0.91)
        stitch = ((lu >= 0.14) & (lu < 0.19)) | ((lu > 0.81) & (lu <= 0.86))
        img[gap] = C['soot']
        img[stitch] = fg
        ny = max(3.0, round(4.0 / max(aspect, 0.5)))
        lv = (v * ny) % 1.0
        stud = np.hypot((lu - 0.5) * 2.2, (lv - 0.5) * 2.2) < 0.22
        img[stud] = C['bronze']

    return np.clip(img, 0.0, 1.0)


@contextmanager
def subj_motif_scope():
    """Temporarily extend `paint.motif` with regional Iziz subject motifs during compilation."""
    orig_motif = paint_mod.motif

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        if style in SUBJ_CUSTOM_MOTIFS:
            return _subj_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif


# ===========================================================================================================
# SHARED GEOMETRY HELPERS (100% REGRESSION-GATE SAFE)
# ===========================================================================================================
def _head_basis():
    """Return `(hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b)` using exact `head_frame()`."""
    a, b, up, bk, left = head_frame()
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
    return hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b


def _ring_pt_along(ring_pts, dir_vec):
    """Find vertex on a closed ring closest to `dir_vec` in XY and its outward unit vector."""
    c = ring_pts.mean(axis=0)
    d = np.asarray(dir_vec, dtype=np.float64)
    d = d / max(np.linalg.norm(d), 1e-6)
    dots = (ring_pts - c) @ d
    idx = int(np.argmax(dots))
    p = ring_pts[idx]
    out = p - c
    out[2] = 0.0
    out /= max(np.linalg.norm(out), 1e-6)
    return p, out


def _dorsal_anchor(z_rel=0.56):
    """Return `(p_back, back_dir, right_dir, up_dir)` on the upper/mid back surface."""
    z = core.WAIST + z_rel * (core.SHOULDER - core.WAIST)
    o = spine_at(z)
    bk = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    d = first_hit(o, bk, 0.35)
    d_val = float(d) if d is not None else 0.12
    p = o + bk * (d_val + 0.016)
    rgt = np.array([-1.0, 0.0, 0.0], dtype=np.float64)
    up = np.array([0.0, 0.0, 1.0], dtype=np.float64)
    return p, bk, rgt, up


def _pectoral_boss(gid, paint_boss, paint_rim, radius=0.050, clearance=0.032):
    """Flush-seated embossed chest medallion / pectoral boss."""
    z_c = core.CHEST - 0.015
    o = spine_at(z_c)
    d = first_hit(o, FRONT, 0.35)
    d_val = float(d) if d is not None else 0.14
    p = o + FRONT * (d_val + clearance)
    side = np.array([1.0, 0.0, 0.0], dtype=np.float64)
    return [
        rosette(f'{gid}_boss_rim', p, FRONT, side, radius=radius, paint=paint_rim, n=16, thick=0.010, rigid_joint='Spine2'),
        rosette(f'{gid}_boss_core', p + FRONT * 0.005, FRONT, side, radius=radius * 0.62, paint=paint_boss, n=12, thick=0.010, rigid_joint='Spine2'),
    ]


def _safe_cape(gid, z_bot, paint, span=1.55, ease=0.025, flare=0.068, back_push=0.0):
    """Cloth-simulated dorsal cape with monotonic +Y lumbar clamp (immune to Gate 5F lumbar suck-in)."""
    cp = cape(f'{gid}_cape', z_bot, paint, span=span, ease=ease, flare=flare)
    Q = cp.P.copy()
    if back_push > 0.0:
        for k in range(Q.shape[0]):
            u = min(1.0, k / 3.0)
            Q[k, :, 1] += back_push * (0.35 + 0.65 * u)
    for k in range(5, Q.shape[0]):
        Q[k, :, 1] = np.maximum(Q[k, :, 1], Q[k - 1, :, 1] - 0.002)
    cp.P = Q
    return cp


def _bracers(gid, paint_main, paint_trim=None, length_f=0.48):
    """Paired forearm cuffs / bracers seated cleanly on both forearms."""
    parts = []
    for side in (L, R):
        tag = 'L' if side == L else 'R'
        e_j = J(f'{side}ForeArm')
        w_j = J(f'{side}Hand')
        a = e_j + (1.0 - length_f) * (w_j - e_j)
        b = w_j - 0.04 * (w_j - e_j)
        parts.append(limb_tube(
            f'{gid}_cuff_{tag}', a, b, 0.013, paint_main, n=18, rows=7, ease_end=0.012, side=side,
        ))
        if paint_trim is not None:
            parts.append(limb_tube(
                f'{gid}_trim_{tag}', a, a + 0.20 * (b - a), 0.016, paint_trim, n=18, rows=3, ease_end=0.016, side=side,
            ))
    return parts


def _pteruges_kilt(gid, kilt_paint, under_paint, z_bot=None):
    """Cloth-simulated Roman military pteruges kilt over tailored under-breeches (`legged=True`)."""
    if z_bot is None:
        z_bot = core.KNEE + 0.055
    z_top = core.WAIST - 0.025
    parts = list(trousers(f'{gid}_sub', under_paint, ease=0.014, bag=0.008, ankle_f=0.60))
    parts.append(torso_tube(
        f'{gid}_pteruges', z_bot, z_top, 0.024, kilt_paint,
        n=40, rows=12, hang_from=z_top, flare=0.058,
    ))
    return parts


def _dorsal_pack(gid, pack_paint, trim_paint, strap_paint, size=(0.11, 0.055, 0.13),
                 bedroll_paint=None, canisters=False):
    """Seated dorsal pack embedded cleanly into a flush `Spine2` dorsal pad."""
    p_bk, bk, rgt, up = _dorsal_anchor(0.56)
    parts = [blob(f'{gid}_pad', p_bk + bk * 0.010, (0.088, 0.022, 0.14), strap_paint, n=12, rows=5, rigid_joint='Spine2')]
    c_pack = p_bk + bk * (size[1] * 0.56)
    parts.append(blob(f'{gid}_body', c_pack, size, pack_paint, n=18, rows=10, rigid_joint='Spine2'))
    parts.append(blob(
        f'{gid}_band', c_pack + bk * 0.004, (size[0] * 1.03, size[1] * 0.92, size[2] * 0.22),
        trim_paint, n=16, rows=5, rigid_joint='Spine2',
    ))
    if bedroll_paint is not None:
        top_c = c_pack + up * (size[2] * 0.88)
        p_l = top_c - rgt * (size[0] * 1.08)
        p_r = top_c + rgt * (size[0] * 1.08)
        parts.append(tube(f'{gid}_roll', [p_l, top_c, p_r], 0.034, bedroll_paint, n=14, rigid_joint='Spine2'))
    if canisters:
        for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
            cc = c_pack + rgt * (sgn * size[0] * 0.78) + bk * 0.010
            parts.append(tube(
                f'{gid}_can_{tag}',
                [cc - up * (size[2] * 0.72), cc, cc + up * (size[2] * 0.72)],
                0.023, trim_paint, n=12, rigid_joint='Spine2',
            ))
    return parts


def _ensure_metal(paint, fallback='metal.steel'):
    p = dict(paint)
    fab = (p.get('fabric') or '').lower()
    if not fab.startswith(('metal.', 'armor.', 'shell.nacre', 'glass.')):
        p['fabric'] = fallback
    return p


def _subj_galea(gid, bowl_paint, trim_paint, crest_paint=None, cheek_guards=True,
                neck_guard=True, brow_f=0.58, brim_w=0.0, cocked=False,
                squared_cheeks=False, fur_band_paint=None, goggles_lens_paint=None,
                flat_brow=False):
    """Regional Roman galea helmet with sculpted metallic dome, curved rear neck-flange (ZERO rear cylinders),
    anatomical cheek-guards, optional cocked tricorn/kettle brim, sagittal crest, fur trim, or welding goggles."""
    bp_m = _ensure_metal(bowl_paint, 'metal.steel')
    tp_m = _ensure_metal(trim_paint, 'metal.bronze')

    bowl = head_rings(f'{gid}_bowl', brow_f, 1.13, 0.018, bp_m, n=36, rows=12, apex=True)
    brow_flare = 0.014 if flat_brow else 0.006
    brow_rib = crown_band(f'{gid}_brow_rib', tp_m, brow_f, brow_f + 0.075, ease=0.022, flare=brow_flare, rows=4, n=36)
    parts = [bowl, brow_rib]
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()

    if brim_w > 0.0:
        br = brim(f'{gid}_brim', brow_f + 0.01, brim_w, tp_m, ease=0.019, rows=5, n=36, droop=0.012 if not cocked else -0.010)
        if cocked:
            # Sculpt tricorn / morion cocked three-point brim curl
            Q = br.P.copy()
            angs = np.linspace(0.0, 2.0 * math.pi, Q.shape[1], endpoint=False)
            for ri in range(1, Q.shape[0]):
                s = ri / float(Q.shape[0] - 1)
                # Upturn at front-left, front-right, and rear (3-cornered tricorn cocking)
                curl = np.maximum(0.0, np.cos(3.0 * angs))
                Q[ri, :, 2] += 0.042 * (s ** 1.3) * curl
            br.P = Q
        parts.append(br)

    if fur_band_paint is not None:
        parts.append(crown_band(f'{gid}_furband', fur_band_paint, brow_f - 0.01, brow_f + 0.09, ease=0.026, flare=0.005, rows=4, n=36))

    if cheek_guards:
        bowl_bot = bowl.P[0]
        C_n = bowl_bot.shape[0]
        angs = np.linspace(0.0, 2.0 * math.pi, C_n, endpoint=False)
        for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
            a_center = (0.64 * math.pi) if sgn < 0 else (1.36 * math.pi)
            d_ang = np.abs(((angs - a_center + math.pi) % (2.0 * math.pi)) - math.pi)
            cols = np.nonzero(d_ang <= 0.22 * math.pi)[0]
            if len(cols) >= 3:
                order = np.argsort(((angs[cols] - a_center + math.pi) % (2.0 * math.pi)) - math.pi)
                cols = cols[order]
                base_arc = bowl_bot[cols].copy()
                Q_ch = np.zeros((5, len(cols), 3), dtype=np.float64)
                for ri, frac in enumerate((0.0, 0.25, 0.55, 0.82, 1.0)):
                    taper_in = (0.004 if squared_cheeks else 0.012) * (frac ** 1.4)
                    fwd_shift = (0.014 if squared_cheeks else 0.018) * (frac ** 1.2)
                    drop_z = (0.096 if squared_cheeks else 0.086) * frac
                    for j_i in range(len(cols)):
                        u_edge = 1.0 if squared_cheeks else math.sin((j_i / float(max(len(cols) - 1, 1))) * math.pi)
                        Q_ch[ri, j_i] = (
                            base_arc[j_i]
                            - up * (drop_z * (0.72 + 0.28 * u_edge))
                            + fwd * fwd_shift
                            - rgt * (sgn * taper_in)
                        )
                parts.append(Part(f'{gid}_cheek_{tag}', Q_ch, False, ['body'] * 5, tp_m, rigid_joint='Head'))

    if neck_guard:
        # Curved Roman Imperial Gallic rear neck-flange built directly from bowl.P[0]
        bowl_bot = bowl.P[0]
        C_n = bowl_bot.shape[0]
        angs = np.linspace(0.0, 2.0 * math.pi, C_n, endpoint=False)
        d_bk = ((angs + math.pi) % (2.0 * math.pi)) - math.pi
        cols_bk = np.nonzero(np.abs(d_bk) <= 0.36 * math.pi)[0]
        if len(cols_bk) >= 5:
            order = np.argsort(d_bk[cols_bk])
            cols_bk = cols_bk[order]
            base_bk = bowl_bot[cols_bk].copy()
            Q_ng = np.zeros((5, len(cols_bk), 3), dtype=np.float64)
            c_xy = np.array([hc[0], hc[1], 0.0])
            for ri, frac in enumerate((0.0, 0.25, 0.55, 0.82, 1.0)):
                drop_z = 0.068 * frac
                flare_out = 0.025 * (frac ** 1.6) + (0.004 if ri == 4 else 0.0)
                for j_i in range(len(cols_bk)):
                    u_mid = math.sin((j_i / float(max(len(cols_bk) - 1, 1))) * math.pi)
                    p0 = base_bk[j_i]
                    rad_v = np.array([p0[0] - c_xy[0], p0[1] - c_xy[1], 0.0])
                    rad_v /= max(float(np.linalg.norm(rad_v)), 1e-6)
                    Q_ng[ri, j_i] = p0 - up * (drop_z * (0.65 + 0.35 * u_mid)) + rad_v * (flare_out * (0.55 + 0.45 * u_mid))
            parts.append(Part(f'{gid}_neckguard', Q_ng, False, ['body'] * 5, bp_m, rigid_joint='Head'))

    if goggles_lens_paint is not None:
        brow_ring = brow_rib.P[len(brow_rib.P) // 2]
        for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
            p_g, out_g = _ring_pt_along(brow_ring, fwd * 0.90 + rgt * (sgn * 0.42))
            s_g = np.cross(up, out_g)
            s_g /= max(np.linalg.norm(s_g), 1e-6)
            parts.append(rosette(f'{gid}_gog_rim_{tag}', p_g + out_g * 0.003, out_g, s_g, radius=0.019, paint=tp_m, n=12, thick=0.008, rigid_joint='Head'))
            parts.append(rosette(f'{gid}_gog_lens_{tag}', p_g + out_g * 0.007, out_g, s_g, radius=0.014, paint=goggles_lens_paint, n=12, thick=0.006, rigid_joint='Head'))

    if crest_paint is not None:
        parts.append(crest(
            f'{gid}_crest', height=0.068, paint=crest_paint,
            rows=8, cols=16, sweep=0.045, a0=-0.52, a1=0.82,
            base_ease=0.017, thick=0.014, host_part=bowl,
        ))
    return parts


def _cocked_hat(gid, crown_paint, brim_paint, badge_paint, style='tricorn', plume_paint=None, loupe_paint=None):
    """Generous-crown nautical tricorn, bicorne, or plumed swashbuckler hat clearing skull by +18..25mm."""
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    bowl = head_rings(f'{gid}_bowl', 0.59, 1.15, 0.018, crown_paint, n=36, rows=12, apex=True)
    band = crown_band(f'{gid}_band', badge_paint, 0.59, 0.67, ease=0.021, flare=0.003, rows=4, n=36)
    br = brim(f'{gid}_brim', 0.60, 0.095 if style != 'swash' else 0.115, brim_paint, ease=0.019, rows=6, n=36, droop=0.005)
    Q = br.P.copy()
    angs = np.linspace(0.0, 2.0 * math.pi, Q.shape[1], endpoint=False)
    for ri in range(1, Q.shape[0]):
        s = ri / float(Q.shape[0] - 1)
        if style == 'tricorn':
            # Three cocked upturned corners
            curl = np.maximum(0.0, np.cos(3.0 * angs))
            Q[ri, :, 2] += 0.058 * (s ** 1.25) * curl
        elif style == 'bicorne':
            # Fore-and-aft upturned crescents
            curl = np.abs(np.cos(angs)) ** 1.6
            Q[ri, :, 2] += 0.068 * (s ** 1.2) * curl
        else:
            # Asymmetric swashbuckler cavalier brim (left side pinned up)
            curl = np.clip(np.sin(angs), 0.0, 1.0) ** 1.4
            Q[ri, :, 2] += 0.062 * (s ** 1.2) * curl - 0.016 * (s ** 1.3) * np.clip(-np.sin(angs), 0.0, 1.0)
    br.P = Q
    parts = [bowl, band, br]

    # Cockade / Sun-Compass / Hooked-Sun badge on front-left of crown band
    p_c, out_c = _ring_pt_along(band.P[1], fwd * 0.72 - rgt * 0.68)
    s_c = np.cross(up, out_c)
    s_c /= max(np.linalg.norm(s_c), 1e-6)
    parts.append(rosette(f'{gid}_cockade', p_c + out_c * 0.004, out_c, s_c, radius=0.020, paint=badge_paint, n=12, thick=0.007, rigid_joint='Head'))

    if loupe_paint is not None:
        # Navigator brass sextant-loupe on front-right brow (named _loupe, never _monocle)
        p_l, out_l = _ring_pt_along(band.P[0], fwd * 0.90 + rgt * 0.42)
        s_l = np.cross(up, out_l)
        s_l /= max(np.linalg.norm(s_l), 1e-6)
        parts.append(rosette(f'{gid}_loupe_rim', p_l + out_l * 0.005, out_l, s_l, radius=0.016, paint=badge_paint, n=12, thick=0.008, rigid_joint='Head'))
        parts.append(rosette(f'{gid}_loupe_glass', p_l + out_l * 0.009, out_l, s_l, radius=0.012, paint=loupe_paint, n=12, thick=0.006, rigid_joint='Head'))

    if plume_paint is not None:
        # Sweeping swashbuckler feather plume rooted flush into the cockade
        p0 = p_c + out_c * 0.004
        p1 = p0 + up * 0.065 - rgt * 0.035 - fwd * 0.040
        p2 = p0 + up * 0.088 - rgt * 0.055 - fwd * 0.115
        parts.append(horn(f'{gid}_plume', [p0, p1, p2], 0.016, 0.004, plume_paint, n=10, rows=7, rigid_joint='Head'))
    return parts


# ===========================================================================================================
# REGION 2: PORTA MARR (`marr`, 5 TIERS)
# ===========================================================================================================
def _build_marr_dockhand(sex):
    entries = []
    cul = 'izani'
    p_band = P('deepsea', 0.05, [B('bottom', 0.0, 0.020, 'solid', 'sunorange')], fabric=COTTON)
    p_shirt = P('cream', 0.05, [], [PN(0.0, 1.0, 'subj_marr_stripe', 'deepsea', 'cream', 0.18)], fabric='cloth.slops.abaca_stripe')
    p_vest = leathery(P('umber', 0.05, [B('bottom', 0.0, 0.018, 'solid', 'bronze')], fabric='leather.cuir_bouilli'))
    p_slops = P('oat', 0.06, [B('bottom', 0.0, 0.022, 'solid', 'deepsea')], fabric='cloth.canvas.duck.army')
    p_boot = leathery(P('saddle', 0.05, [B('top', 0.0, 0.016, 'solid', 'brass')], fabric='leather.cuir_bouilli'))
    p_rope = P('sand', 0.06, fabric='straw.reed.plaited')

    # 1. HEAD: Knotted sea-bandana
    gid = f'marr_{sex}_dockhand_bandana'
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    bowl = head_rings(f'{gid}_wrap', 0.59, 1.04, 0.012, p_band, n=36, rows=10, apex=True)
    p_bk, out_bk = _ring_pt_along(bowl.P[0], -fwd)
    parts_h = [
        bowl,
        crown_band(f'{gid}_band', p_band, 0.58, 0.67, ease=0.015, rows=4, n=36),
        blob(f'{gid}_knot', p_bk + out_bk * 0.010, (0.022, 0.018, 0.018), p_band, n=10, rows=5, rigid_joint='Head'),
        tube(f'{gid}_tail_L', [p_bk + out_bk * 0.008, p_bk + out_bk * 0.022 - rgt * 0.018 - up * 0.055], 0.009, p_band, n=8, rigid_joint='Head'),
        tube(f'{gid}_tail_R', [p_bk + out_bk * 0.008, p_bk + out_bk * 0.022 + rgt * 0.018 - up * 0.060], 0.009, p_band, n=8, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(gid, 'De Xedaz Knotted Sea-Bandana', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Oiled-leather vest over striped hemp boat-shirt
    gid = f'marr_{sex}_dockhand_vest'
    parts_t = [
        torso_tube(f'{gid}_shirt', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.018, p_shirt, n=36, rows=12),
        sleeves(gid, 'elbow', ease=0.022, paint=p_shirt),
        torso_tube(f'{gid}_vest', core.WAIST - 0.03, core.SHOULDER + 0.005, 0.024, p_vest, n=36, rows=10),
        pouch_belt(gid, p_boot, p_rope, ease=0.030),
    ]
    entries.append(assemble_garment(gid, 'De Xedaz Oiled-Leather Vest & Striped Boat-Shirt', 'torso', cul, parts_t))

    # 3. GLOVES: Tarred hemp & leather wrist-wraps
    gid = f'marr_{sex}_dockhand_cuffs'
    entries.append(assemble_garment(gid, 'De Xedaz Tarred Rigging Wraps', 'gloves', cul, _bracers(gid, p_boot, p_rope, length_f=0.42)))

    # 4. LEGS: Rolled salt-canvas slops
    gid = f'marr_{sex}_dockhand_slops'
    entries.append(assemble_garment(
        gid, 'De Xedaz Rolled Salt-Canvas Slops', 'legs', cul,
        trousers(gid, p_slops, ease=0.014, bag=0.008, ankle_f=0.72), legged=True,
    ))

    # 5. FEET: Oiled leather deck boots
    gid = f'marr_{sex}_dockhand_boots'
    entries.append(assemble_garment(
        gid, 'De Xedaz Oiled Deck Boots', 'feet', cul,
        boots(gid, leathery(P('soot', 0.05, fabric='leather.cuir_bouilli')), p_boot, top=0.40, ease_top=0.026),
    ))

    # 6. BACK: Coiled hawser rope pack
    gid = f'marr_{sex}_dockhand_hawser'
    p_bk, bk, rgt, up = _dorsal_anchor(0.56)
    parts_b = [blob(f'{gid}_pad', p_bk + bk * 0.010, (0.088, 0.022, 0.13), p_vest, n=12, rows=5, rigid_joint='Spine2')]
    c_coil = p_bk + bk * 0.034
    ring_pts = [c_coil + rgt * (0.095 * math.cos(a)) + up * (0.095 * math.sin(a)) for a in np.linspace(0, 2.0 * math.pi, 17)]
    parts_b.append(tube(f'{gid}_coil_outer', ring_pts, 0.024, p_rope, n=10, rigid_joint='Spine2'))
    ring_in = [c_coil + rgt * (0.062 * math.cos(a)) + up * (0.062 * math.sin(a)) + bk * 0.008 for a in np.linspace(0, 2.0 * math.pi, 15)]
    parts_b.append(tube(f'{gid}_coil_inner', ring_in, 0.020, p_rope, n=10, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid, 'De Xedaz Coiled Hawser Pack', 'back', cul, parts_b))
    return entries


def _build_marr_gardonz_factor(sex):
    entries = []
    cul = 'izani'
    p_velvet = P('deepsea', 0.04, [B('bottom', 0.0, 0.022, 'subj_marr_compass', 'gold', 'deepsea')], fabric='cloth.velvet.cut')
    p_coat = P('verdigris', 0.04, [
        B('bottom', 0.0, 0.048, 'subj_marr_compass', 'gold', 'verdigris'),
        B('top', 0.0, 0.024, 'solid', 'sunorange'),
    ], fabric='cloth.brocade.damask')
    p_gold = P('gold', 0.02, fabric='metal.gold')
    p_crimson = P('crimson', 0.04, [B('bottom', 0.0, 0.038, 'subj_marr_compass', 'gold', 'crimson')], fabric='cloth.silk')
    p_breech = P('deepsea', 0.04, fabric=WOOL)
    p_boot = leathery(P('umber', 0.04, [B('top', 0.0, 0.018, 'solid', 'brass')], fabric='leather.polished'))

    # 1. HEAD: Velvet-trimmed cocked tricorn w/ Sun-Compass cockade
    gid = f'marr_{sex}_factor_tricorn'
    entries.append(assemble_garment(
        gid, 'Gardonz Factor Velvet-Trimmed Tricorn', 'head', cul,
        _cocked_hat(gid, p_velvet, p_velvet, p_gold, style='tricorn'), covers_hair=True,
    ))

    # 2. TORSO: Sea-green & #e07a2a brocade mariner coat (knee-length with cloth chains)
    gid = f'marr_{sex}_factor_coat'
    parts_t = [
        torso_tube(f'{gid}_coat', core.KNEE + 0.04, core.SHOULDER + 0.01, 0.026, p_coat,
                   n=40, rows=20, hang_from=core.WAIST, flare=0.075),
        sleeves(gid, 'wrist', ease=0.024, paint=p_coat),
        stand_collar(gid, p_coat, high=0.045),
        belt_sash(f'{gid}_sash', core.WAIST - 0.035, core.WAIST + 0.035, p_crimson, ease=0.032),
    ]
    entries.append(assemble_garment(gid, 'Gardonz Factor Sea-Green Brocade Mariner Coat', 'torso', cul, parts_t))

    # 3. GLOVES: Brocade & brass mariner cuffs
    gid = f'marr_{sex}_factor_cuffs'
    entries.append(assemble_garment(gid, 'Gardonz Factor Brocade Mariner Cuffs', 'gloves', cul, _bracers(gid, p_velvet, p_gold, length_f=0.44)))

    # 4. LEGS: Tailored deep-sea wool breeches
    gid = f'marr_{sex}_factor_breeches'
    entries.append(assemble_garment(gid, 'Gardonz Factor Mariner Breeches', 'legs', cul, trousers(gid, p_breech, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Brass-buckled deck boots
    gid = f'marr_{sex}_factor_boots'
    entries.append(assemble_garment(
        gid, 'Gardonz Factor Brass-Buckled Deck Boots', 'feet', cul,
        boots(gid, leathery(P('soot', 0.04, fabric='leather.polished')), p_boot, top=0.44, cuff_paint=p_gold, ease_top=0.026),
    ))

    # 6. BACK: Crimson boat-cape with cloth chains
    gid = f'marr_{sex}_factor_cape'
    entries.append(assemble_garment(
        gid, 'Gardonz Factor Crimson Boat-Cape', 'back', cul,
        [_safe_cape(gid, core.CROTCH + 0.06, p_crimson, span=1.50, ease=0.025, flare=0.065)],
    ))
    return entries


def _build_marr_navigator(sex):
    entries = []
    cul = 'izani'
    p_oiled = P('deepsea', 0.04, [B('bottom', 0.0, 0.022, 'solid', 'brass')], fabric='cloth.oilskin.tarred_seams')
    p_doublet = P('slate', 0.04, [
        B('bottom', 0.0, 0.034, 'subj_marr_compass', 'brass', 'slate'),
        B('top', 0.0, 0.020, 'solid', 'verdigris'),
    ], fabric='cloth.quilted.diamond')
    p_vbrass = P('verdigris', 0.03, [B('bottom', 0.0, 0.018, 'solid', 'brass')], fabric='metal.bronze.verdigris')
    p_brass = P('brass', 0.03, fabric='metal.bronze')
    p_glass = P('amber', 0.02, fabric='glass.moonglass.leaded')
    p_trous = P('slate', 0.04, fabric='cloth.canvas.oiled')
    p_boot = leathery(P('umber', 0.05, fabric='leather.cuir_bouilli'))

    # 1. HEAD: Oiled bicorne w/ brass sextant-loupe
    gid = f'marr_{sex}_navigator_bicorne'
    entries.append(assemble_garment(
        gid, 'Navigadarz Oiled Bicorne & Sextant-Loupe', 'head', cul,
        _cocked_hat(gid, p_oiled, p_oiled, p_brass, style='bicorne', loupe_paint=p_glass), covers_hair=True,
    ))

    # 2. TORSO: Quilted slate weather-doublet w/ verdigris brass scales & pauldrons
    gid = f'marr_{sex}_navigator_doublet'
    parts_t = [
        torso_tube(f'{gid}_doublet', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.018, p_doublet, n=36, rows=12),
        sleeves(gid, 'wrist', ease=0.022, paint=p_doublet),
        *cuirass_plate(gid, p_vbrass, trim_paint=p_brass, style='lamellar', ease=0.024, faulds=2),
        *articulated_pauldrons(gid, p_vbrass, trim_paint=p_brass, lames=2, haute_piece=False, ease=0.024),
        pouch_belt(gid, p_boot, p_brass, ease=0.034),
    ]
    entries.append(assemble_garment(gid, 'Navigadarz Quilted Weather-Doublet & Brass Scales', 'torso', cul, parts_t))

    # 3. GLOVES: Oiled leather chart-cuffs
    gid = f'marr_{sex}_navigator_cuffs'
    entries.append(assemble_garment(gid, 'Navigadarz Oiled Leather Chart-Cuffs', 'gloves', cul, _bracers(gid, p_boot, p_brass, length_f=0.46)))

    # 4. LEGS: Slate oilskin sea-trousers
    gid = f'marr_{sex}_navigator_trousers'
    entries.append(assemble_garment(gid, 'Navigadarz Slate Sea-Trousers', 'legs', cul, trousers(gid, p_trous, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Tarred leather sea-boots
    gid = f'marr_{sex}_navigator_boots'
    entries.append(assemble_garment(
        gid, 'Navigadarz Tarred Sea-Boots', 'feet', cul,
        boots(gid, leathery(P('soot', 0.05, fabric='leather.cuir_bouilli')), p_boot, top=0.44, cuff_paint=p_brass, ease_top=0.026),
    ))

    # 6. BACK: Dorsal brass ring-astrolabe seated flush on dorsal pad
    gid = f'marr_{sex}_navigator_astrolabe'
    p_bk, bk, rgt, up = _dorsal_anchor(0.58)
    parts_b = [blob(f'{gid}_pad', p_bk + bk * 0.010, (0.088, 0.022, 0.13), p_boot, n=12, rows=5, rigid_joint='Spine2')]
    c_ast = p_bk + bk * 0.036
    outer_r = [c_ast + rgt * (0.115 * math.cos(a)) + up * (0.115 * math.sin(a)) for a in np.linspace(0, 2.0 * math.pi, 21)]
    inner_r = [c_ast + rgt * (0.072 * math.cos(a)) + up * (0.072 * math.sin(a)) + bk * 0.006 for a in np.linspace(0, 2.0 * math.pi, 17)]
    parts_b.append(tube(f'{gid}_ring_outer', outer_r, 0.011, p_brass, n=10, rigid_joint='Spine2'))
    parts_b.append(tube(f'{gid}_ring_inner', inner_r, 0.008, p_vbrass, n=10, rigid_joint='Spine2'))
    parts_b.append(tube(f'{gid}_alidade', [c_ast - rgt * 0.11 - up * 0.06, c_ast, c_ast + rgt * 0.11 + up * 0.06], 0.007, p_brass, n=8, rigid_joint='Spine2'))
    parts_b.append(rosette(f'{gid}_hub', c_ast + bk * 0.006, bk, rgt, radius=0.024, paint=p_brass, n=12, thick=0.010, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid, 'Navigadarz Dorsal Brass Ring-Astrolabe', 'back', cul, parts_b))
    return entries


def _build_marr_classiarius(sex):
    entries = []
    cul = 'izani'
    p_bronze = P('bronze', 0.03, [B('bottom', 0.0, 0.020, 'solid', 'verdigris')], fabric='metal.bronze.verdigris')
    p_brass = P('brass', 0.03, fabric='metal.bronze')
    p_shirt = P('cream', 0.05, [], [PN(0.0, 1.0, 'subj_marr_stripe', 'deepsea', 'cream', 0.18)], fabric='cloth.slops.abaca_stripe')
    p_kilt = leathery(P('deepsea', 0.05, [B('bottom', 0.0, 0.024, 'solid', 'brass')],
                        [PN(0.0, 1.0, 'subj_pteruges_strip', 'brass', 'deepsea', 0.16)], fabric='leather.pteruges.studded'))
    p_leather = leathery(P('umber', 0.05, [B('bottom', 0.0, 0.018, 'solid', 'brass')], fabric='leather.cuir_bouilli'))
    p_navy = P('deepsea', 0.04, [B('bottom', 0.0, 0.044, 'subj_marr_compass', 'brass', 'deepsea')], fabric=WOOL)
    p_breech = P('deepsea', 0.04, fabric=WOOL)

    # 1. HEAD: Sculpted bronze morion-tricorn (curved neck-flange + cheek-guards + cocked brim + crest)
    gid = f'marr_{sex}_classiarius_helm'
    entries.append(assemble_garment(
        gid, 'Porta Marr Classiarius Bronze Morion-Tricorn', 'head', cul,
        _subj_galea(gid, p_bronze, p_brass, crest_paint=p_brass, cheek_guards=True, neck_guard=True, brim_w=0.062, cocked=True),
        covers_hair=True,
    ))

    # 2. TORSO: Salt-stained cuir-bouilli & sculpted verdigris-brass half-lorica over striped subarmalis
    gid = f'marr_{sex}_classiarius_lorica'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_shirt, n=36, rows=10),
        sleeves(gid, 'elbow', ease=0.021, paint=p_shirt),
        *cuirass_plate(gid, p_bronze, trim_paint=p_brass, style='laminar', ease=0.023, faulds=2),
        *gorget_guard(gid, p_brass, trim_paint=p_bronze, ease=0.024),
        *articulated_pauldrons(gid, p_bronze, trim_paint=p_brass, lames=2, haute_piece=False, ease=0.024),
        pouch_belt(gid, p_leather, p_brass, ease=0.034),
    ]
    entries.append(assemble_garment(gid, 'Porta Marr Classiarius Verdigris-Brass Half-Lorica', 'torso', cul, parts_t))

    # 3. GLOVES: Sculpted verdigris-brass vambraces
    gid = f'marr_{sex}_classiarius_vambraces'
    entries.append(assemble_garment(
        gid, 'Porta Marr Classiarius Verdigris Vambraces', 'gloves', cul,
        sculpted_vambraces(gid, p_bronze, trim_paint=p_brass, couter=True, ease=0.015),
    ))

    # 4. LEGS: Striped pteruges kilt over navy breeches
    gid = f'marr_{sex}_classiarius_kilt'
    entries.append(assemble_garment(
        gid, 'Porta Marr Classiarius Naval Pteruges Kilt', 'legs', cul,
        _pteruges_kilt(gid, p_kilt, p_breech), legged=True,
    ))

    # 5. FEET: Deck caligae boots
    gid = f'marr_{sex}_classiarius_caligae'
    entries.append(assemble_garment(
        gid, 'Porta Marr Classiarius Deck Caligae', 'feet', cul,
        boots(gid, leathery(P('soot', 0.05, fabric='leather.cuir_bouilli')), p_leather, top=0.38, wraps=3, wrap_paint=p_brass, ease_top=0.008),
    ))

    # 6. BACK: Navy sagum cloak with cloth chains
    gid = f'marr_{sex}_classiarius_sagum'
    entries.append(assemble_garment(
        gid, 'Porta Marr Classiarius Navy Sagum Cloak', 'back', cul,
        [_safe_cape(gid, core.KNEE + 0.06, p_navy, span=1.55, ease=0.028, flare=0.068, back_push=0.015)],
    ))
    return entries


def _build_marr_corsair(sex):
    entries = []
    cul = 'izani'
    p_black = P('repblack', 0.04, [B('bottom', 0.0, 0.026, 'subj_marr_hooked_sun', 'gold', 'repblack')], fabric='cloth.velvet.cut')
    p_gold = P('gold', 0.02, fabric='metal.gold')
    p_crimson = P('crimson', 0.04, [B('bottom', 0.0, 0.026, 'solid', 'gold')], fabric='cloth.silk')
    p_shirt = P('cream', 0.04, fabric='cloth.linen.sea')
    p_leather = leathery(P('umber', 0.05, [B('bottom', 0.0, 0.018, 'solid', 'gold')], fabric='leather.polished'))
    p_breech = P('charcoal', 0.04, fabric=WOOL)

    # 1. HEAD: Plumed swashbuckler hat w/ gold Hooked-Sun badge
    gid = f'marr_{sex}_corsair_hat'
    entries.append(assemble_garment(
        gid, 'Hooked-Sun Corsair Plumed Swashbuckler Hat', 'head', cul,
        _cocked_hat(gid, p_black, p_black, p_gold, style='swash', plume_paint=p_crimson), covers_hair=True,
    ))

    # 2. TORSO: Embroidered corsair bolero w/ pistol-brace baldric over linen shirt
    gid = f'marr_{sex}_corsair_bolero'
    parts_t = [
        torso_tube(f'{gid}_shirt', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.018, p_shirt, n=36, rows=12),
        sleeves(gid, 'wrist', ease=0.024, paint=p_shirt),
        torso_tube(f'{gid}_bolero', core.WAIST + 0.02, core.SHOULDER + 0.008, 0.024, p_black, n=36, rows=10),
        crossed_sash(f'{gid}_pistol_brace', p_leather, width=0.075, ease=0.030),
        belt_sash(f'{gid}_sash', core.WAIST - 0.035, core.WAIST + 0.035, p_crimson, ease=0.030),
    ]
    parts_t.extend(_pectoral_boss(gid, p_gold, p_black, radius=0.034, clearance=0.034))
    entries.append(assemble_garment(gid, 'Hooked-Sun Corsair Embroidered Bolero & Pistol-Brace', 'torso', cul, parts_t))

    # 3. GLOVES: Leather & gold privateer cuffs
    gid = f'marr_{sex}_corsair_cuffs'
    entries.append(assemble_garment(gid, 'Hooked-Sun Corsair Privateer Cuffs', 'gloves', cul, _bracers(gid, p_leather, p_gold, length_f=0.45)))

    # 4. LEGS: Tailored dark breeches w/ crimson hip-sash accents
    gid = f'marr_{sex}_corsair_breeches'
    entries.append(assemble_garment(gid, 'Hooked-Sun Corsair Crimson-Sash Breeches', 'legs', cul, trousers(gid, p_breech, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Turned-cuff swashbuckler deck boots
    gid = f'marr_{sex}_corsair_boots'
    entries.append(assemble_garment(
        gid, 'Hooked-Sun Corsair Turned-Cuff Boots', 'feet', cul,
        boots(gid, leathery(P('soot', 0.04, fabric='leather.polished')), p_leather, top=0.46, cuff_paint=p_crimson, ease_top=0.026),
    ))

    # 6. BACK: Black & gold half-cape with cloth chains
    gid = f'marr_{sex}_corsair_cape'
    entries.append(assemble_garment(
        gid, 'Hooked-Sun Corsair Black & Gold Half-Cape', 'back', cul,
        [_safe_cape(gid, core.CROTCH + 0.06, p_black, span=1.42, ease=0.025, flare=0.064)],
    ))
    return entries


# ===========================================================================================================
# REGION 3: TALIA (`talia`, 4 TIERS)
# ===========================================================================================================
def _build_tal_scholar(sex):
    entries = []
    cul = 'izani'
    p_burg = P('wine', 0.04, [B('bottom', 0.0, 0.032, 'subj_talia_loros', 'gold', 'wine')], fabric='cloth.velvet.cut')
    p_gown = P('charcoal', 0.04, [
        B('bottom', 0.0, 0.052, 'subj_talia_loros', 'gold', 'charcoal'),
        B('top', 0.0, 0.024, 'solid', 'wine'),
    ], fabric=WOOL)
    p_fur = P('sable', 0.06, fabric='fur.sable.sheared')
    p_silver = P('silver', 0.02, fabric='metal.steel.brushed')
    p_gold = P('gold', 0.02, fabric='metal.gold')
    p_trous = P('charcoal', 0.04, fabric=WOOL)
    p_shoe = leathery(P('umber', 0.04, [B('top', 0.0, 0.016, 'solid', 'silver')], fabric='leather.polished'))

    # 1. HEAD: Burgundy velvet birretta w/ silver rose-star brooch
    gid = f'tal_{sex}_scholar_birretta'
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    bowl = head_rings(f'{gid}_bowl', 0.59, 1.14, 0.017, p_burg, n=36, rows=12, apex=True)
    # Four-ridged scholarly birretta crown band
    band = crown_band(f'{gid}_band', p_burg, 0.59, 0.72, ease=0.022, flare=0.008, rows=4, n=36)
    p_f, out_f = _ring_pt_along(band.P[1], fwd)
    s_f = np.cross(up, out_f)
    s_f /= max(np.linalg.norm(s_f), 1e-6)
    parts_h = [
        bowl, band,
        rosette(f'{gid}_brooch', p_f + out_f * 0.004, out_f, s_f, radius=0.018, paint=p_silver, n=12, thick=0.007, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(gid, 'University of Talia Velvet Birretta', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Charcoal/burgundy scholar gown w/ gold-meander clavi & fur collar
    gid = f'tal_{sex}_scholar_gown'
    parts_t = [
        torso_tube(f'{gid}_gown', core.KNEE + 0.02, core.SHOULDER + 0.01, 0.025, p_gown,
                   n=40, rows=20, hang_from=core.WAIST, flare=0.072),
        sleeves(gid, 'wrist', ease=0.024, paint=p_gown),
        collar_disc(f'{gid}_fur_collar', 0.125, p_fur, drop=0.075, rows=7, n=36, ease=0.026),
        belt_sash(f'{gid}_belt', core.WAIST - 0.032, core.WAIST + 0.032, p_burg, ease=0.031),
    ]
    entries.append(assemble_garment(gid, 'University of Talia Jurist Gown & Fur Pellegrine', 'torso', cul, parts_t))

    # 3. GLOVES: Velvet & silver-trim cuffs
    gid = f'tal_{sex}_scholar_cuffs'
    entries.append(assemble_garment(gid, 'University of Talia Velvet Jurist Cuffs', 'gloves', cul, _bracers(gid, p_burg, p_silver, length_f=0.42)))

    # 4. LEGS: Tailored charcoal scholar trousers
    gid = f'tal_{sex}_scholar_trousers'
    entries.append(assemble_garment(gid, 'University of Talia Charcoal Hose', 'legs', cul, trousers(gid, p_trous, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Laced highland scholar shoes
    gid = f'tal_{sex}_scholar_shoes'
    entries.append(assemble_garment(
        gid, 'University of Talia Laced Scholar Shoes', 'feet', cul,
        boots(gid, leathery(P('soot', 0.04, fabric='leather.polished')), p_shoe, top=0.28, cuff_paint=p_silver, ease_top=0.008),
    ))

    # 6. BACK: Chained Keepwell codex satchel
    gid = f'tal_{sex}_scholar_codex'
    entries.append(assemble_garment(
        gid, 'University of Talia Chained Keepwell Codex Satchel', 'back', cul,
        _dorsal_pack(gid, p_burg, p_gold, p_shoe, size=(0.105, 0.048, 0.135)),
    ))
    return entries


def _build_tal_toll_baron(sex):
    entries = []
    cul = 'izani'
    p_plum = P('plum', 0.04, [
        B('bottom', 0.0, 0.052, 'subj_talia_loros', 'gold', 'plum'),
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], fabric='cloth.velvet.cut')
    p_fur = P('sable', 0.06, fabric='fur.sable.sheared')
    p_lynx = P('snowleopard', 0.06, fabric='fur.wolf')
    p_gold = P('gold', 0.02, fabric='metal.gold')
    p_niello = P('charcoal', 0.03, [], [PN(0.0, 1.0, 'subj_talia_damascene', 'gold', 'charcoal', 0.16)], fabric='metal.steel')
    p_orange = P('sunorange', 0.04, [
        B('bottom', 0.0, 0.050, 'subj_talia_loros', 'gold', 'sunorange'),
        B('top', 0.0, 0.024, 'solid', 'snowleopard'),
    ], fabric='cloth.silk')
    p_cream = P('cream', 0.04, fabric=WOOL)
    p_boot = leathery(P('wine', 0.04, [B('top', 0.0, 0.020, 'solid', 'gold')], fabric='leather.polished'))

    # 1. HEAD: Sable-trimmed brocade crown-hat
    gid = f'tal_{sex}_baron_hat'
    bowl = head_rings(f'{gid}_bowl', 0.59, 1.15, 0.017, p_plum, n=36, rows=12, apex=True)
    fur_rim = crown_band(f'{gid}_sable_rim', p_fur, 0.58, 0.72, ease=0.024, flare=0.008, rows=5, n=36)
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    p_f, out_f = _ring_pt_along(fur_rim.P[2], fwd)
    s_f = np.cross(up, out_f)
    s_f /= max(np.linalg.norm(s_f), 1e-6)
    parts_h = [
        bowl, fur_rim,
        rosette(f'{gid}_badge', p_f + out_f * 0.004, out_f, s_f, radius=0.020, paint=p_gold, n=12, thick=0.008, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(gid, 'Talia Toll-Baron Sable-Trimmed Crown-Hat', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Plum-velvet & gold-jali dalmatica w/ niello collar chain
    gid = f'tal_{sex}_baron_dalmatica'
    parts_t = [
        torso_tube(f'{gid}_dalmatica', core.KNEE + 0.03, core.SHOULDER + 0.01, 0.026, p_plum,
                   n=40, rows=20, hang_from=core.WAIST, flare=0.075),
        sleeves(gid, 'wrist', ease=0.025, paint=p_plum),
        collar_disc(f'{gid}_niello_collar', 0.115, p_niello, drop=0.068, rows=6, n=36, ease=0.027),
        belt_sash(f'{gid}_belt', core.WAIST - 0.035, core.WAIST + 0.035, p_gold, ease=0.032),
    ]
    parts_t.extend(_pectoral_boss(gid, p_gold, p_niello, radius=0.042, clearance=0.030))
    entries.append(assemble_garment(gid, 'Talia Toll-Baron Plum-Velvet & Niello Dalmatica', 'torso', cul, parts_t))

    # 3. GLOVES: Gilded filigree cuffs
    gid = f'tal_{sex}_baron_cuffs'
    entries.append(assemble_garment(gid, 'Talia Toll-Baron Gilded Filigree Cuffs', 'gloves', cul, _bracers(gid, p_plum, p_gold, length_f=0.44)))

    # 4. LEGS: Tailored cream aristocratic breeches
    gid = f'tal_{sex}_baron_breeches'
    entries.append(assemble_garment(gid, 'Talia Toll-Baron Tailored Breeches', 'legs', cul, trousers(gid, p_cream, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Gilded wine-leather dress boots
    gid = f'tal_{sex}_baron_boots'
    entries.append(assemble_garment(
        gid, 'Talia Toll-Baron Gilded Dress Boots', 'feet', cul,
        boots(gid, leathery(P('umber', 0.04, fabric='leather.polished')), p_boot, top=0.44, cuff_paint=p_gold, ease_top=0.026),
    ))

    # 6. BACK: Lynx-trimmed #e07a2a paludamentum with cloth chains
    gid = f'tal_{sex}_baron_mantle'
    entries.append(assemble_garment(
        gid, 'Talia Toll-Baron Lynx-Trimmed Paludamentum', 'back', cul,
        [_safe_cape(gid, core.KNEE + 0.04, p_orange, span=1.65, ease=0.026, flare=0.072)],
    ))
    return entries


def _build_tal_pass_guard(sex):
    entries = []
    cul = 'izani'
    p_blued = P('deepsea', 0.03, [B('bottom', 0.0, 0.022, 'solid', 'gold')],
                [PN(0.0, 1.0, 'subj_talia_damascene', 'gold', 'deepsea', 0.18)], fabric='armor.scale.squamata')
    p_gold = P('gold', 0.02, fabric='metal.gold')
    p_plume = P('sunorange', 0.04, [B('top', 0.0, 0.030, 'solid', 'cream')], fabric='plumage.feathers.raptor')
    p_burg = P('wine', 0.04, [B('bottom', 0.0, 0.030, 'subj_talia_loros', 'gold', 'wine')], fabric='cloth.velvet.cut')
    p_kilt = leathery(P('wine', 0.04, [B('bottom', 0.0, 0.024, 'solid', 'gold')],
                        [PN(0.0, 1.0, 'subj_pteruges_strip', 'gold', 'wine', 0.16)], fabric='leather.pteruges.studded'))
    p_cream = P('cream', 0.04, fabric=WOOL)
    p_boot = leathery(P('wine', 0.04, fabric='leather.polished'))

    # 1. HEAD: Blued-steel & gold Attic plumed galea (curved neck-flange, NO rear cylinder!)
    gid = f'tal_{sex}_pass_galea'
    entries.append(assemble_garment(
        gid, 'Talia Pass-Guard Blued-Steel Attic Galea', 'head', cul,
        _subj_galea(gid, p_blued, p_gold, crest_paint=p_plume, cheek_guards=True, neck_guard=True),
        covers_hair=True,
    ))

    # 2. TORSO: Sculpted blued-steel & gilded lorica squamata over burgundy velvet subarmalis
    gid = f'tal_{sex}_pass_squamata'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_burg, n=36, rows=10),
        sleeves(gid, 'elbow', ease=0.021, paint=p_burg),
        *cuirass_plate(gid, p_blued, trim_paint=p_gold, style='lamellar', ease=0.024, faulds=3),
        *gorget_guard(gid, p_blued, trim_paint=p_gold, ease=0.025),
        *articulated_pauldrons(gid, p_blued, trim_paint=p_gold, lames=3, haute_piece=True, ease=0.025),
        belt_sash(f'{gid}_belt', core.WAIST - 0.035, core.WAIST + 0.035, p_gold, ease=0.035),
    ]
    parts_t.extend(_pectoral_boss(gid, p_gold, p_blued, radius=0.048, clearance=0.036))
    entries.append(assemble_garment(gid, 'Talia Pass-Guard Damascened Lorica Squamata', 'torso', cul, parts_t))

    # 3. GLOVES: Gilded blued-steel vambraces & articulated gauntlets
    gid = f'tal_{sex}_pass_vambraces'
    entries.append(assemble_garment(
        gid, 'Talia Pass-Guard Gilded Vambraces', 'gloves', cul,
        full_gloves(gid, p_blued, p_gold, p_burg)
        + sculpted_vambraces(gid, p_blued, trim_paint=p_gold, couter=True, ease=0.016),
    ))

    # 4. LEGS: Burgundy velvet pteruges kilt & hinged tassets over cream breeches
    gid = f'tal_{sex}_pass_pteruges'
    entries.append(assemble_garment(
        gid, 'Talia Pass-Guard Velvet Pteruges & Tassets', 'legs', cul,
        _pteruges_kilt(gid, p_kilt, p_cream)
        + hinged_tassets(gid, p_blued, trim_paint=p_gold, lames=3, ease=0.027),
        legged=True,
    ))

    # 5. FEET: Sculpted gilded greaves & poleyns over low boots
    gid = f'tal_{sex}_pass_greaves'
    entries.append(assemble_garment(
        gid, 'Talia Pass-Guard Gilded Acanthus Greaves', 'feet', cul,
        boots(gid, p_boot, p_gold, top=0.34, ease_top=0.010)
        + sculpted_greaves(gid, p_blued, trim_paint=p_gold, poleyn=True, ease=0.016),
    ))

    # 6. BACK: Burgundy & gold pass-guard cloak with cloth chains
    gid = f'tal_{sex}_pass_cloak'
    entries.append(assemble_garment(
        gid, 'Talia Pass-Guard Burgundy Cloak', 'back', cul,
        [_safe_cape(gid, core.KNEE + 0.04, p_burg, span=1.60, ease=0.028, flare=0.070, back_push=0.016)],
    ))
    return entries


def _build_tal_highland_auxilia(sex):
    entries = []
    cul = 'izani'
    p_steel = P('steel', 0.03, [B('bottom', 0.0, 0.020, 'solid', 'silver')],
                [PN(0.0, 1.0, 'subj_talia_damascene', 'silver', 'steel', 0.16)], fabric='metal.steel.brushed')
    p_silver = P('silver', 0.02, fabric='metal.steel.brushed')
    p_wolf = P('fur', 0.06, fabric='fur.wolf')
    p_ram = P('snowleopard', 0.06, [B('bottom', 0.0, 0.030, 'subj_talia_loros', 'gold', 'snowleopard')], fabric='fur.wolf')
    p_coat = P('loden', 0.05, [B('bottom', 0.0, 0.028, 'subj_talia_loros', 'silver', 'loden')], fabric='cloth.quilted.diamond')
    p_braccae = P('heather', 0.05, fabric='cloth.wool.fulled')
    p_boot = leathery(P('umber', 0.05, fabric='leather.cuir_bouilli'))

    # 1. HEAD: Silver-inlaid fur-trimmed spangenhelm
    gid = f'tal_{sex}_auxilia_spangenhelm'
    entries.append(assemble_garment(
        gid, 'Talia Highland Auxilia Fur-Trimmed Spangenhelm', 'head', cul,
        _subj_galea(gid, p_steel, p_silver, crest_paint=None, cheek_guards=True, neck_guard=True, fur_band_paint=p_wolf),
        covers_hair=True,
    ))

    # 2. TORSO: Sculpted damascened mirror-pectoral & mail over quilted mountain coat
    gid = f'tal_{sex}_auxilia_coat'
    parts_t = [
        torso_tube(f'{gid}_coat', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.018, p_coat, n=36, rows=12),
        sleeves(gid, 'wrist', ease=0.023, paint=p_coat),
        *cuirass_plate(gid, p_steel, trim_paint=p_silver, style='musculata', ease=0.024, faulds=2),
        *articulated_pauldrons(gid, p_steel, trim_paint=p_silver, lames=2, haute_piece=False, ease=0.024),
        pouch_belt(gid, p_boot, p_silver, ease=0.034),
    ]
    parts_t.extend(_pectoral_boss(gid, p_silver, p_steel, radius=0.052, clearance=0.036))
    entries.append(assemble_garment(gid, 'Talia Highland Auxilia Damascened Mirror-Pectoral & Coat', 'torso', cul, parts_t))

    # 3. GLOVES: Sculpted steel & silver-inlaid bracers
    gid = f'tal_{sex}_auxilia_bracers'
    entries.append(assemble_garment(
        gid, 'Talia Highland Auxilia Damascened Bracers', 'gloves', cul,
        sculpted_vambraces(gid, p_steel, trim_paint=p_silver, couter=True, ease=0.015),
    ))

    # 4. LEGS: Highland wool braccae
    gid = f'tal_{sex}_auxilia_braccae'
    entries.append(assemble_garment(gid, 'Talia Highland Wool Braccae', 'legs', cul, trousers(gid, p_braccae, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Fur-cuffed mountain boots
    gid = f'tal_{sex}_auxilia_boots'
    entries.append(assemble_garment(
        gid, 'Talia Highland Fur-Cuffed Mountain Boots', 'feet', cul,
        boots(gid, leathery(P('soot', 0.05, fabric='leather.cuir_bouilli')), p_boot, top=0.44, cuff_paint=p_wolf, ease_top=0.026),
    ))

    # 6. BACK: Ram-pelt highland sagum with cloth chains
    gid = f'tal_{sex}_auxilia_sagum'
    entries.append(assemble_garment(
        gid, 'Talia Highland Ram-Pelt Sagum', 'back', cul,
        [_safe_cape(gid, core.CROTCH + 0.05, p_ram, span=1.55, ease=0.026, flare=0.068)],
    ))
    return entries


# ===========================================================================================================
# REGION 4: PYLON (`pylon`, 4 TIERS)
# ===========================================================================================================
def _build_pyl_salvager(sex):
    entries = []
    cul = 'izani'
    p_wrap = P('rustred', 0.05, [B('bottom', 0.0, 0.022, 'solid', 'ochre')], fabric=COTTON)
    p_brass = P('brass', 0.03, fabric='metal.bronze')
    p_amber = P('amber', 0.02, fabric='glass.moonglass.leaded')
    p_tarp = P('dunesand', 0.06, [B('bottom', 0.0, 0.024, 'subj_pylon_caution', 'sunorange', 'dunesand')], fabric='cloth.canvas.oiled')
    p_tire = leathery(P('charcoal', 0.06, [], [PN(0.0, 1.0, 'subj_pylon_tread', 'iron', 'charcoal', 0.20)], fabric='rubber.tyre'))
    p_hex = P('ancient', 0.04, [], [PN(0.0, 1.0, 'subj_pylon_hex_grille', 'rust', 'ancient', 0.16)], fabric='armor.salvage.tread_plate')
    p_cargo = P('ochre', 0.05, fabric='cloth.canvas.duck.army')
    p_copper = P('copper', 0.03, fabric='metal.bronze')
    p_boot = leathery(P('umber', 0.05, fabric='rubber.tyre'))

    # 1. HEAD: Red-ochre desert wrap + brass welding goggles
    gid = f'pyl_{sex}_salvager_wrap'
    hd = hood(gid, p_wrap, ease=0.018, ease_low=0.028, open_front=0.95, low=-0.16)
    band = crown_band(f'{gid}_strap', p_boot, 0.60, 0.67, ease=0.022, rows=3, n=36)
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    parts_h = [hd, band]
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        p_g, out_g = _ring_pt_along(band.P[1], fwd * 0.90 + rgt * (sgn * 0.42))
        s_g = np.cross(up, out_g)
        s_g /= max(np.linalg.norm(s_g), 1e-6)
        parts_h.append(rosette(f'{gid}_gog_rim_{tag}', p_g + out_g * 0.004, out_g, s_g, radius=0.020, paint=p_brass, n=12, thick=0.009, rigid_joint='Head'))
        parts_h.append(rosette(f'{gid}_gog_lens_{tag}', p_g + out_g * 0.008, out_g, s_g, radius=0.015, paint=p_amber, n=12, thick=0.006, rigid_joint='Head'))
    entries.append(assemble_garment(gid, 'Pylon Salvager Desert Wrap & Welding Goggles', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Riveted tarp & tire-tread vest w/ asymmetric hex-scrap left pauldron
    gid = f'pyl_{sex}_salvager_vest'
    parts_t = [
        torso_tube(f'{gid}_shirt', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.018, p_tarp, n=36, rows=10),
        sleeves(gid, 'elbow', ease=0.022, paint=p_tarp),
        torso_tube(f'{gid}_vest', core.WAIST - 0.03, core.SHOULDER + 0.005, 0.024, p_tire, n=36, rows=10),
        *articulated_pauldron(gid, L, p_hex, trim_paint=p_brass, lames=2, haute_piece=False, ease=0.024),
        pouch_belt(gid, p_boot, p_brass, ease=0.032),
    ]
    entries.append(assemble_garment(gid, 'Pylon Salvager Tire-Tread Vest & Hex Pauldron', 'torso', cul, parts_t))

    # 3. GLOVES: Heavy salvage work gloves
    gid = f'pyl_{sex}_salvager_gloves'
    entries.append(assemble_garment(gid, 'Pylon Salvager Heavy Work Gloves', 'gloves', cul, full_gloves(gid, p_tire, p_boot, p_brass)))

    # 4. LEGS: Dusty ochre cargo trousers
    gid = f'pyl_{sex}_salvager_trousers'
    entries.append(assemble_garment(gid, 'Pylon Salvager Dusty Cargo Trousers', 'legs', cul, trousers(gid, p_cargo, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Tire-soled salvage boots
    gid = f'pyl_{sex}_salvager_boots'
    entries.append(assemble_garment(
        gid, 'Pylon Salvager Tire-Soled Boots', 'feet', cul,
        boots(gid, p_tire, p_boot, top=0.42, cuff_paint=p_copper, ease_top=0.026),
    ))

    # 6. BACK: Copper condenser-rig pack
    gid = f'pyl_{sex}_salvager_condenser'
    entries.append(assemble_garment(
        gid, 'Pylon Salvager Copper Condenser-Rig Pack', 'back', cul,
        _dorsal_pack(gid, p_copper, p_brass, p_tire, size=(0.115, 0.058, 0.14), bedroll_paint=p_wrap, canisters=True),
    ))
    return entries


def _build_pyl_conduit_warden(sex):
    entries = []
    cul = 'izani'
    p_tin = P('silver', 0.05, [B('bottom', 0.0, 0.020, 'solid', 'rust')], fabric='metal.tin.patchwork')
    p_duster = P('dunesand', 0.05, [
        B('bottom', 0.0, 0.048, 'subj_pylon_caution', 'sunorange', 'dunesand'),
        B('top', 0.0, 0.022, 'solid', 'rust'),
    ], fabric='cloth.canvas.duck.army')
    p_brass = P('brass', 0.03, fabric='metal.bronze')
    p_copper = P('copper', 0.03, fabric='metal.bronze')
    p_enamel = P('sunorange', 0.04, [], [PN(0.0, 1.0, 'subj_pylon_caution', 'cream', 'sunorange', 0.16)], fabric='armor.salvage.tread_plate')
    p_trous = P('duneumber', 0.05, fabric=COTTON)
    p_boot = leathery(P('saddle', 0.05, fabric='leather.cuir_bouilli'))

    # 1. HEAD: Corrugated-tin & leather sun-hat w/ dust-veil
    gid = f'pyl_{sex}_warden_hat'
    bowl = head_rings(f'{gid}_bowl', 0.58, 1.14, 0.017, p_tin, n=36, rows=12, apex=True)
    br = brim(f'{gid}_brim', 0.59, 0.105, p_tin, ease=0.019, rows=6, n=36, droop=0.022)
    band = crown_band(f'{gid}_band', p_boot, 0.59, 0.67, ease=0.021, rows=3, n=36)
    # Rear ochre dust-veil hanging cleanly from rear brim
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    bowl_bot = bowl.P[0]
    angs = np.linspace(0.0, 2.0 * math.pi, bowl_bot.shape[0], endpoint=False)
    d_bk = ((angs + math.pi) % (2.0 * math.pi)) - math.pi
    cols_bk = np.nonzero(np.abs(d_bk) <= 0.42 * math.pi)[0]
    cols_bk = cols_bk[np.argsort(d_bk[cols_bk])]
    base_bk = bowl_bot[cols_bk].copy()
    Q_v = np.zeros((5, len(cols_bk), 3), dtype=np.float64)
    for ri, frac in enumerate((0.0, 0.25, 0.55, 0.82, 1.0)):
        Q_v[ri] = base_bk - up * (0.095 * frac) - fwd * (0.018 * frac)
    veil = Part(f'{gid}_veil', Q_v, False, ['body'] * 5, p_duster, rigid_joint='Head')
    entries.append(assemble_garment(gid, 'Pylon Conduit Warden Tin Sun-Hat & Dust-Veil', 'head', cul, [bowl, br, band, veil], covers_hair=True))

    # 2. TORSO: Dust-ochre duster-dalmatica w/ enamel road-plates & brass water-meter manifold
    gid = f'pyl_{sex}_warden_duster'
    parts_t = [
        torso_tube(f'{gid}_duster', core.KNEE + 0.04, core.SHOULDER + 0.01, 0.025, p_duster,
                   n=40, rows=20, hang_from=core.WAIST, flare=0.074),
        sleeves(gid, 'wrist', ease=0.023, paint=p_duster),
        *articulated_pauldrons(gid, p_enamel, trim_paint=p_brass, lames=2, haute_piece=False, ease=0.025),
        pouch_belt(gid, p_boot, p_brass, ease=0.032),
    ]
    parts_t.extend(_pectoral_boss(gid, p_brass, p_enamel, radius=0.046, clearance=0.032))
    entries.append(assemble_garment(gid, 'Pylon Conduit Warden Duster-Dalmatica & Meter Manifold', 'torso', cul, parts_t))

    # 3. GLOVES: Leather & brass gauge-cuffs
    gid = f'pyl_{sex}_warden_cuffs'
    entries.append(assemble_garment(gid, 'Pylon Conduit Warden Gauge-Cuffs', 'gloves', cul, _bracers(gid, p_boot, p_brass, length_f=0.45)))

    # 4. LEGS: Desert wrap trousers
    gid = f'pyl_{sex}_warden_trousers'
    entries.append(assemble_garment(gid, 'Pylon Conduit Warden Wrap Trousers', 'legs', cul, trousers(gid, p_trous, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Desert patrol boots
    gid = f'pyl_{sex}_warden_boots'
    entries.append(assemble_garment(
        gid, 'Pylon Conduit Warden Desert Boots', 'feet', cul,
        boots(gid, leathery(P('umber', 0.05, fabric='leather.cuir_bouilli')), p_boot, top=0.42, wraps=2, wrap_paint=p_brass, ease_top=0.026),
    ))

    # 6. BACK: Copper ration tank pack
    gid = f'pyl_{sex}_warden_tank'
    entries.append(assemble_garment(
        gid, 'Pylon Conduit Warden Copper Ration Tank', 'back', cul,
        _dorsal_pack(gid, p_copper, p_brass, p_boot, size=(0.11, 0.062, 0.145), canisters=True),
    ))
    return entries


def _build_pyl_decurion_guard(sex):
    entries = []
    cul = 'izani'
    p_sign = P('sunorange', 0.04, [B('bottom', 0.0, 0.024, 'solid', 'charcoal')],
               [PN(0.0, 1.0, 'subj_pylon_caution', 'cream', 'sunorange', 0.18)], fabric='armor.salvage.tread_plate')
    p_rust = P('rustred', 0.05, [B('bottom', 0.0, 0.020, 'solid', 'brass')], fabric='metal.iron')
    p_iron = P('iron', 0.04, fabric='metal.iron')
    p_amber = P('amber', 0.02, fabric='glass.moonglass.leaded')
    p_tire = leathery(P('charcoal', 0.06, [B('bottom', 0.0, 0.022, 'solid', 'sunorange')],
                        [PN(0.0, 1.0, 'subj_pteruges_strip', 'sunorange', 'charcoal', 0.16)], fabric='rubber.tyre'))
    p_sub = P('rustred', 0.05, fabric='cloth.quilted.diamond')
    p_wrap = P('dunesand', 0.05, fabric=COTTON)
    p_boot = leathery(P('umber', 0.05, fabric='rubber.tyre'))

    # 1. HEAD: Welder galea w/ welded rebar/cog crest & amber welding visor (curved neck-flange!)
    gid = f'pyl_{sex}_decurion_galea'
    entries.append(assemble_garment(
        gid, 'Pylon Decurion Guard Welder Galea', 'head', cul,
        _subj_galea(gid, p_rust, p_iron, crest_paint=p_iron, cheek_guards=True, neck_guard=True, goggles_lens_paint=p_amber),
        covers_hair=True,
    ))

    # 2. TORSO: Sculpted curved yellow/orange highway-sign lorica segmentata over sports-pad subarmalis
    gid = f'pyl_{sex}_decurion_lorica'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_sub, n=36, rows=10),
        sleeves(gid, 'elbow', ease=0.021, paint=p_sub),
        *cuirass_plate(gid, p_sign, trim_paint=p_iron, style='laminar', ease=0.024, faulds=3),
        *gorget_guard(gid, p_iron, trim_paint=p_sign, ease=0.025),
        *articulated_pauldrons(gid, p_sign, trim_paint=p_iron, lames=3, haute_piece=False, ease=0.025),
        pouch_belt(gid, p_tire, p_iron, ease=0.035),
    ]
    entries.append(assemble_garment(gid, 'Pylon Decurion Highway-Sign Lorica Segmentata', 'torso', cul, parts_t))

    # 3. GLOVES: Rebar-splinted gauntlets
    gid = f'pyl_{sex}_decurion_gauntlets'
    entries.append(assemble_garment(
        gid, 'Pylon Decurion Rebar-Splinted Gauntlets', 'gloves', cul,
        full_gloves(gid, p_tire, p_iron, p_rust)
        + sculpted_vambraces(gid, p_iron, trim_paint=p_sign, couter=True, ease=0.016),
    ))

    # 4. LEGS: Tire-rubber pteruges kilt over dusty wrap braccae
    gid = f'pyl_{sex}_decurion_pteruges'
    entries.append(assemble_garment(
        gid, 'Pylon Decurion Tire-Rubber Pteruges & Braccae', 'legs', cul,
        _pteruges_kilt(gid, p_tire, p_wrap), legged=True,
    ))

    # 5. FEET: Tire-soled legion caligae boots
    gid = f'pyl_{sex}_decurion_caligae'
    entries.append(assemble_garment(
        gid, 'Pylon Decurion Tire-Soled Caligae', 'feet', cul,
        boots(gid, p_tire, p_boot, top=0.40, wraps=3, wrap_paint=p_iron, ease_top=0.009),
    ))

    # 6. BACK: Salvage legionary marching pack
    gid = f'pyl_{sex}_decurion_pack'
    entries.append(assemble_garment(
        gid, 'Pylon Decurion Salvage Marching Pack', 'back', cul,
        _dorsal_pack(gid, p_sign, p_iron, p_tire, size=(0.115, 0.056, 0.13), bedroll_paint=p_wrap),
    ))
    return entries


def _build_pyl_dust_vexillarius(sex):
    entries = []
    cul = 'izani'
    p_hide = P('sand', 0.06, fabric='fur.wolf')
    p_bronze = P('bronze', 0.04, fabric='metal.bronze')
    p_amber = P('amber', 0.02, fabric='glass.moonglass.leaded')
    p_grille = P('iron', 0.04, [B('bottom', 0.0, 0.020, 'solid', 'bronze')],
                 [PN(0.0, 1.0, 'subj_pylon_hex_grille', 'bronze', 'iron', 0.16)], fabric='armor.salvage.tread_plate')
    p_ochre = P('ochre', 0.05, [B('bottom', 0.0, 0.024, 'subj_pylon_caution', 'cream', 'ochre')], fabric=COTTON)
    p_leather = leathery(P('saddle', 0.05, fabric='leather.cuir_bouilli'))
    p_iron = P('iron', 0.04, fabric='metal.iron')

    # 1. HEAD: Desert-hound hide hood over scrap-bronze galea & slit-goggles
    gid = f'pyl_{sex}_vexil_helm'
    parts_h = _subj_galea(gid, p_bronze, p_iron, crest_paint=None, cheek_guards=True, neck_guard=True,
                          fur_band_paint=p_hide, goggles_lens_paint=p_amber)
    entries.append(assemble_garment(gid, 'Pylon Dust-Vexillarius Hide-Hooded Galea', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Sculpted hex-grille breastplate & hydration bandoliers
    gid = f'pyl_{sex}_vexil_harness'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_ochre, n=36, rows=10),
        sleeves(gid, 'wrist', ease=0.022, paint=p_ochre),
        *cuirass_plate(gid, p_grille, trim_paint=p_bronze, style='cyber_plate', ease=0.024, faulds=2),
        *articulated_pauldrons(gid, p_bronze, trim_paint=p_iron, lames=2, haute_piece=False, ease=0.024),
        crossed_sash(f'{gid}_bandolier', p_leather, width=0.068, ease=0.035),
        pouch_belt(gid, p_leather, p_bronze, ease=0.035),
    ]
    entries.append(assemble_garment(gid, 'Pylon Dust-Vexillarius Hex-Grille Harness', 'torso', cul, parts_t))

    # 3. GLOVES: Sculpted scrap-bronze bracers
    gid = f'pyl_{sex}_vexil_bracers'
    entries.append(assemble_garment(
        gid, 'Pylon Dust-Vexillarius Scrap-Bronze Bracers', 'gloves', cul,
        sculpted_vambraces(gid, p_bronze, trim_paint=p_iron, couter=False, ease=0.015),
    ))

    # 4. LEGS: Arid desert outrider trousers
    gid = f'pyl_{sex}_vexil_trousers'
    entries.append(assemble_garment(gid, 'Pylon Dust-Vexillarius Desert Trousers', 'legs', cul, trousers(gid, p_ochre, ease=0.016, bag=0.010), legged=True))

    # 5. FEET: Dust-wrapped outrider boots
    gid = f'pyl_{sex}_vexil_boots'
    entries.append(assemble_garment(
        gid, 'Pylon Dust-Vexillarius Outrider Boots', 'feet', cul,
        boots(gid, leathery(P('umber', 0.05, fabric='leather.cuir_bouilli')), p_leather, top=0.44, wraps=3, wrap_paint=p_ochre, ease_top=0.009),
    ))

    # 6. BACK: Dorsal rebar/cogwheel Sun vexillum standard (embedded cleanly into dorsal pad)
    gid = f'pyl_{sex}_vexil_standard'
    p_bk, bk, rgt, up = _dorsal_anchor(0.56)
    parts_b = [blob(f'{gid}_pad', p_bk + bk * 0.010, (0.088, 0.024, 0.145), p_leather, n=12, rows=5, rigid_joint='Spine2')]
    pole_b = p_bk + bk * 0.024 - up * 0.10
    pole_t = p_bk + bk * 0.036 + up * 0.42
    parts_b.append(tube(f'{gid}_shaft', [pole_b, 0.5 * (pole_b + pole_t), pole_t], 0.012, p_iron, n=10, rigid_joint='Spine2'))
    # Crossbar & cogwheel Sun-orb finial
    cross_c = pole_t - up * 0.055
    parts_b.append(tube(f'{gid}_crossbar', [cross_c - rgt * 0.13, cross_c, cross_c + rgt * 0.13], 0.009, p_bronze, n=8, rigid_joint='Spine2'))
    parts_b.append(rosette(f'{gid}_cog_sun', pole_t, bk, rgt, radius=0.048, paint=p_bronze, n=14, thick=0.012, rigid_joint='Spine2'))
    # Small tattered banner hanging from crossbar
    Q_ban = np.zeros((5, 7, 3), dtype=np.float64)
    for ri, frac in enumerate((0.0, 0.25, 0.50, 0.75, 1.0)):
        for ji, u_x in enumerate(np.linspace(-0.11, 0.11, 7)):
            Q_ban[ri, ji] = cross_c + rgt * u_x - up * (0.19 * frac) + bk * (0.010 * math.sin(frac * math.pi))
    parts_b.append(Part(f'{gid}_banner', Q_ban, False, ['body'] * 5, p_ochre, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid, 'Pylon Dust-Vexillarius Cogwheel Sun Vexillum', 'back', cul, parts_b))
    return entries


# ===========================================================================================================
# REGION 5: SHELL & PORT GOTO (`shell`, 4 TIERS)
# ===========================================================================================================
def _build_shl_foundry_worker(sex):
    entries = []
    cul = 'izani'
    p_soot = leathery(P('charcoal', 0.06, [B('bottom', 0.0, 0.020, 'solid', 'iron')], fabric='leather.foundry.pigskin'))
    p_apron = leathery(P('umber', 0.06, [B('bottom', 0.0, 0.028, 'subj_shell_foundry_mark', 'ash', 'umber')], fabric='leather.foundry.pigskin'))
    p_brass = P('brass', 0.04, fabric='metal.bronze')
    p_iron = P('iron', 0.04, fabric='metal.iron')
    p_ash = P('repgreyd', 0.05, fabric=COTTON)

    # 1. HEAD: Soot-stained leather slag-hood w/ perforated brass sulfur-filter muzzle
    gid = f'shl_{sex}_foundry_hood'
    hd = hood(gid, p_soot, ease=0.018, ease_low=0.028, open_front=0.92, low=-0.16)
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    fwd = -bk
    rgt = -left
    z_mouth = float(a[2]) + (f_nose - 0.12) * (float(b[2]) - float(a[2]))
    hc_m = a + up * (z_mouth - float(a[2]))
    d_m = first_hit(hc_m, fwd, 0.25)
    p_m = hc_m + fwd * ((float(d_m) if d_m is not None else 0.11) + 0.012)
    parts_h = [
        hd,
        rosette(f'{gid}_muzzle', p_m, fwd, rgt, radius=0.026, paint=p_brass, n=14, thick=0.018, rigid_joint='Head'),
        tube(f'{gid}_strap_L', [p_m - rgt * 0.020, p_m - rgt * 0.075 - fwd * 0.060], 0.005, p_soot, n=8, rigid_joint='Head'),
        tube(f'{gid}_strap_R', [p_m + rgt * 0.020, p_m + rgt * 0.075 - fwd * 0.060], 0.005, p_soot, n=8, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(gid, 'Xelroda Smelter Slag-Hood & Sulfur Filter', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Riveted pigskin foundry apron (knee-length w/ cloth chains) & iron-chain yoke
    gid = f'shl_{sex}_foundry_apron'
    parts_t = [
        torso_tube(f'{gid}_shirt', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.018, p_ash, n=36, rows=10),
        sleeves(gid, 'wrist', ease=0.022, paint=p_ash),
        torso_tube(f'{gid}_apron', core.KNEE + 0.05, core.SHOULDER - 0.01, 0.025, p_apron,
                   n=38, rows=18, hang_from=core.WAIST, flare=0.065),
        collar_disc(f'{gid}_yoke', 0.11, p_iron, drop=0.065, rows=5, n=36, ease=0.026),
        pouch_belt(gid, p_soot, p_iron, ease=0.032),
    ]
    entries.append(assemble_garment(gid, 'Xelroda Riveted Pigskin Foundry Apron & Chain Yoke', 'torso', cul, parts_t))

    # 3. GLOVES: Heavy smelter mitts
    gid = f'shl_{sex}_foundry_mitts'
    entries.append(assemble_garment(gid, 'Xelroda Heavy Smelter Mitts', 'gloves', cul, full_gloves(gid, p_soot, p_apron, p_iron)))

    # 4. LEGS: Ash-grey foundry trousers
    gid = f'shl_{sex}_foundry_trousers'
    entries.append(assemble_garment(gid, 'Xelroda Ash-Grey Foundry Trousers', 'legs', cul, trousers(gid, p_ash, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Iron-shod foundry clogs
    gid = f'shl_{sex}_foundry_clogs'
    entries.append(assemble_garment(
        gid, 'Xelroda Iron-Shod Foundry Clogs', 'feet', cul,
        boots(gid, p_iron, p_soot, top=0.32, cuff_paint=p_iron, ease_top=0.024),
    ))

    # 6. BACK: Sheet-iron ore hod
    gid = f'shl_{sex}_foundry_hod'
    entries.append(assemble_garment(
        gid, 'Xelroda Sheet-Iron Ore Hod', 'back', cul,
        _dorsal_pack(gid, p_iron, p_brass, p_soot, size=(0.125, 0.065, 0.145)),
    ))
    return entries


def _build_shl_enforcer(sex):
    entries = []
    cul = 'izani'
    p_iron = P('charcoal', 0.04, [B('bottom', 0.0, 0.024, 'subj_shell_foundry_mark', 'holyred', 'charcoal')],
               [PN(0.0, 1.0, 'subj_shell_slab_iron', 'iron', 'charcoal', 0.18)], fabric='armor.uruk.slab_iron')
    p_red = P('holyred', 0.04, fabric='metal.iron')
    p_leather = leathery(P('repblack', 0.05, [B('bottom', 0.0, 0.020, 'solid', 'iron')], fabric='leather.foundry.pigskin'))
    p_breech = P('charcoal', 0.04, fabric=WOOL)

    # 1. HEAD: Blackened angular kettle-galea w/ vermilion tally-stripe
    gid = f'shl_{sex}_enforcer_galea'
    entries.append(assemble_garment(
        gid, 'Shell Enforcer Blackened Kettle-Galea', 'head', cul,
        _subj_galea(gid, p_iron, p_red, crest_paint=None, cheek_guards=True, neck_guard=True, brim_w=0.056, flat_brow=True),
        covers_hair=True,
    ))

    # 2. TORSO: Sculpted riveted black-leather & parkerized iron-strip lorica w/ manacle belt
    gid = f'shl_{sex}_enforcer_lorica'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_leather, n=36, rows=10),
        sleeves(gid, 'wrist', ease=0.022, paint=p_leather),
        *cuirass_plate(gid, p_iron, trim_paint=p_red, style='laminar', ease=0.024, faulds=2),
        *articulated_pauldrons(gid, p_iron, trim_paint=p_red, lames=2, haute_piece=False, ease=0.024),
        pouch_belt(gid, p_leather, p_iron, ease=0.034),
    ]
    entries.append(assemble_garment(gid, 'Shell Enforcer Parkerized Iron-Strip Lorica', 'torso', cul, parts_t))

    # 3. GLOVES: Parkerized iron bracers
    gid = f'shl_{sex}_enforcer_bracers'
    entries.append(assemble_garment(
        gid, 'Shell Enforcer Parkerized Iron Bracers', 'gloves', cul,
        sculpted_vambraces(gid, p_iron, trim_paint=p_red, couter=True, ease=0.015),
    ))

    # 4. LEGS: Dark soot breeches
    gid = f'shl_{sex}_enforcer_breeches'
    entries.append(assemble_garment(gid, 'Shell Enforcer Dark Breeches', 'legs', cul, trousers(gid, p_breech, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Heavy iron-strapped enforcer boots
    gid = f'shl_{sex}_enforcer_boots'
    entries.append(assemble_garment(
        gid, 'Shell Enforcer Heavy Boots', 'feet', cul,
        boots(gid, p_iron, p_leather, top=0.44, wraps=3, wrap_paint=p_iron, ease_top=0.026),
    ))

    # 6. BACK: Catch-chain & manacle pack
    gid = f'shl_{sex}_enforcer_pack'
    entries.append(assemble_garment(
        gid, 'Shell Enforcer Catch-Chain Pack', 'back', cul,
        _dorsal_pack(gid, p_iron, p_red, p_leather, size=(0.11, 0.055, 0.13), canisters=True),
    ))
    return entries


def _build_shl_siege_guard(sex):
    entries = []
    cul = 'izani'
    p_slab = P('charcoal', 0.04, [B('bottom', 0.0, 0.024, 'subj_shell_foundry_mark', 'ash', 'charcoal')],
               [PN(0.0, 1.0, 'subj_shell_slab_iron', 'ash', 'charcoal', 0.18)], fabric='armor.uruk.slab_iron')
    p_iron = P('iron', 0.04, fabric='metal.iron')
    p_ash = P('repgreyd', 0.05, fabric=WOOL)
    p_kilt = leathery(P('repblack', 0.06, [B('bottom', 0.0, 0.026, 'subj_shell_foundry_mark', 'ash', 'repblack')],
                        [PN(0.0, 1.0, 'subj_pteruges_strip', 'iron', 'repblack', 0.16)], fabric='leather.foundry.pigskin'))
    p_cloak = P('charcoal', 0.05, [B('bottom', 0.0, 0.042, 'subj_shell_foundry_mark', 'holyred', 'charcoal')], fabric=WOOL)
    p_boot = leathery(P('soot', 0.05, fabric='leather.foundry.pigskin'))

    # 1. HEAD: Brutalist flat-browed blackened slab-iron galea w/ squared cheek-plates & white-ash stencil
    gid = f'shl_{sex}_siege_galea'
    entries.append(assemble_garment(
        gid, 'Shell Siege Guard Brutalist Slab-Iron Galea', 'head', cul,
        _subj_galea(gid, p_slab, p_iron, crest_paint=p_iron, cheek_guards=True, neck_guard=True,
                    squared_cheeks=True, flat_brow=True),
        covers_hair=True,
    ))

    # 2. TORSO: Sculpted thick angular square-riveted slab-iron lorica over soot subarmalis
    gid = f'shl_{sex}_siege_lorica'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_cloak, n=36, rows=10),
        sleeves(gid, 'wrist', ease=0.022, paint=p_cloak),
        *cuirass_plate(gid, p_slab, trim_paint=p_iron, style='cyber_plate', ease=0.025, keel=0.020, faulds=3),
        *gorget_guard(gid, p_slab, trim_paint=p_iron, ease=0.026),
        *articulated_pauldrons(gid, p_slab, trim_paint=p_iron, lames=3, haute_piece=True, ease=0.026),
        pouch_belt(gid, p_boot, p_iron, ease=0.036),
    ]
    entries.append(assemble_garment(gid, 'Shell Siege Guard Slab-Iron Lorica', 'torso', cul, parts_t))

    # 3. GLOVES: Slab-iron gauntlets
    gid = f'shl_{sex}_siege_gauntlets'
    entries.append(assemble_garment(
        gid, 'Shell Siege Guard Slab-Iron Gauntlets', 'gloves', cul,
        full_gloves(gid, p_slab, p_iron, p_boot)
        + sculpted_vambraces(gid, p_slab, trim_paint=p_iron, couter=True, ease=0.016),
    ))

    # 4. LEGS: Soot foundry kilt & slab-iron hinged tassets over ash trousers
    gid = f'shl_{sex}_siege_kilt'
    entries.append(assemble_garment(
        gid, 'Shell Siege Guard Foundry Kilt & Slab Tassets', 'legs', cul,
        _pteruges_kilt(gid, p_kilt, p_ash)
        + hinged_tassets(gid, p_slab, trim_paint=p_iron, lames=3, ease=0.027),
        legged=True,
    ))

    # 5. FEET: Iron siege sabatons & sculpted slab greaves
    gid = f'shl_{sex}_siege_sabatons'
    entries.append(assemble_garment(
        gid, 'Shell Siege Guard Slab-Iron Sabatons & Greaves', 'feet', cul,
        boots(gid, p_iron, p_boot, top=0.34, ease_top=0.010)
        + sculpted_greaves(gid, p_slab, trim_paint=p_iron, poleyn=True, ease=0.016),
    ))

    # 6. BACK: Dark soot siege cloak with cloth chains
    gid = f'shl_{sex}_siege_cloak'
    entries.append(assemble_garment(
        gid, 'Shell Siege Guard Soot Cloak', 'back', cul,
        [_safe_cape(gid, core.KNEE + 0.04, p_cloak, span=1.62, ease=0.028, flare=0.070, back_push=0.017)],
    ))
    return entries


def _build_shl_chain_snapper(sex):
    entries = []
    cul = 'izani'
    p_band = P('crimson', 0.05, [B('bottom', 0.0, 0.018, 'solid', 'ash')], fabric=COTTON)
    p_iron = P('iron', 0.04, fabric='metal.iron')
    p_slab = P('charcoal', 0.04, [B('bottom', 0.0, 0.024, 'subj_shell_foundry_mark', 'crimson', 'charcoal')],
               [PN(0.0, 1.0, 'subj_shell_slab_iron', 'iron', 'charcoal', 0.18)], fabric='armor.uruk.slab_iron')
    p_shirt = P('repgreyd', 0.06, fabric=COTTON)
    p_trous = P('charcoal', 0.05, fabric=COTTON)
    p_boot = leathery(P('umber', 0.05, fabric='leather.cuir_bouilli'))

    # 1. HEAD: Torn crimson/ash rebel headband (snug bare-head band, ease=0.005 < 12mm)
    gid = f'shl_{sex}_rebel_collar'
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    band = head_rings(f'{gid}_band', 0.60, 0.72, 0.005, p_band, n=36, rows=5)
    p_bk, out_bk = _ring_pt_along(band.P[1], -fwd)
    parts_h = [
        band,
        blob(f'{gid}_knot', p_bk + out_bk * 0.008, (0.018, 0.014, 0.016), p_band, n=10, rows=4, rigid_joint='Head'),
        tube(f'{gid}_tail_L', [p_bk + out_bk * 0.006, p_bk + out_bk * 0.020 - rgt * 0.016 - up * 0.065], 0.008, p_band, n=8, rigid_joint='Head'),
        tube(f'{gid}_tail_R', [p_bk + out_bk * 0.006, p_bk + out_bk * 0.020 + rgt * 0.016 - up * 0.055], 0.008, p_band, n=8, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(gid, 'Chain-Snapper Rebel Crimson Headband', 'head', cul, parts_h))

    # 2. TORSO: Heavy filed-through iron neck-collar + captured Shell slab-iron chest-lame w/ snapped chain-links
    gid = f'shl_{sex}_rebel_lame'
    parts_t = [
        torso_tube(f'{gid}_shirt', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.018, p_shirt, n=36, rows=10),
        sleeves(gid, 'elbow', ease=0.022, paint=p_shirt),
        collar(f'{gid}_iron_collar', p_iron, height=0.036, flare=0.006, ease=0.020),
        *cuirass_plate(gid, p_slab, trim_paint=p_iron, style='cyber_plate', ease=0.024, faulds=1),
        *articulated_pauldron(gid, L, p_slab, trim_paint=p_iron, lames=2, haute_piece=False, ease=0.024),
        pouch_belt(gid, p_boot, p_iron, ease=0.034),
    ]
    parts_t.extend(_pectoral_boss(gid, p_iron, p_band, radius=0.036, clearance=0.036))
    entries.append(assemble_garment(gid, 'Chain-Snapper Filed Iron Collar & Captured Slab-Lame', 'torso', cul, parts_t))

    # 3. GLOVES: Wrapped crimson & ash rebel bracers
    gid = f'shl_{sex}_rebel_bracers'
    entries.append(assemble_garment(gid, 'Chain-Snapper Wrapped Rebel Bracers', 'gloves', cul, _bracers(gid, p_band, p_iron, length_f=0.46)))

    # 4. LEGS: Ragged dark work trousers
    gid = f'shl_{sex}_rebel_trousers'
    entries.append(assemble_garment(gid, 'Chain-Snapper Ragged Work Trousers', 'legs', cul, trousers(gid, p_trous, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Scavenged iron-toed boots
    gid = f'shl_{sex}_rebel_boots'
    entries.append(assemble_garment(
        gid, 'Chain-Snapper Scavenged Boots', 'feet', cul,
        boots(gid, p_iron, p_boot, top=0.40, wraps=2, wrap_paint=p_band, ease_top=0.026),
    ))

    # 6. BACK: Bolt-shears & rebel satchel pack
    gid = f'shl_{sex}_rebel_pack'
    entries.append(assemble_garment(
        gid, 'Chain-Snapper Bolt-Shears Satchel Pack', 'back', cul,
        _dorsal_pack(gid, p_boot, p_iron, p_band, size=(0.11, 0.052, 0.13), bedroll_paint=p_band),
    ))
    return entries


# ===========================================================================================================
# REGION 6: DILIHAN & PORT VISAS (`dilihan`, 4 TIERS)
# ===========================================================================================================
def _build_dil_almanac_factor(sex):
    entries = []
    cul = 'izani'
    p_saffron = P('saffron', 0.04, [B('bottom', 0.0, 0.028, 'subj_dil_aegean_silk', 'gold', 'saffron')], fabric='cloth.silk.shot')
    p_kiln = P('pomegranate', 0.04, [B('bottom', 0.0, 0.032, 'subj_dil_aegean_silk', 'gold', 'pomegranate')], fabric='cloth.silk.shot')
    p_gold = P('gold', 0.02, fabric='metal.gold')
    p_linen = P('sealinen', 0.04, [B('bottom', 0.0, 0.044, 'subj_dil_aegean_silk', 'gold', 'sealinen')], fabric='cloth.linen.sea')
    p_turq = P('turq', 0.03, fabric='beads.glass')
    p_leather = leathery(P('saddle', 0.04, [B('top', 0.0, 0.016, 'solid', 'gold')], fabric='leather.polished'))

    # 1. HEAD: Saffron/kiln-red silk turban-crown w/ Sun-Orb
    gid = f'dil_{sex}_factor_turban'
    trb_parts = turban(gid, p_saffron, wrap_paint=p_kiln, jewel_paint=p_gold, f0=0.58, f1=1.10, bulge=0.036, ease=0.015)
    entries.append(assemble_garment(gid, 'Dilihan Almanac Factor Shot-Silk Turban-Crown', 'head', cul, trb_parts, covers_hair=True))

    # 2. TORSO: Vented sea-linen tunica w/ magenta-ochre shot-silk pallium & almanac bead necklace
    gid = f'dil_{sex}_factor_tunica'
    parts_t = [
        torso_tube(f'{gid}_tunica', core.KNEE + 0.04, core.SHOULDER + 0.01, 0.025, p_linen,
                   n=40, rows=20, hang_from=core.WAIST, flare=0.072),
        sleeves(gid, 'wrist', ease=0.024, paint=p_linen),
        crossed_sash(f'{gid}_pallium', p_kiln, width=0.11, ease=0.032),
        collar_disc(f'{gid}_beads', 0.088, p_turq, drop=0.055, rows=5, n=36, ease=0.027),
        belt_sash(f'{gid}_sash', core.WAIST - 0.034, core.WAIST + 0.034, p_saffron, ease=0.031),
    ]
    entries.append(assemble_garment(gid, 'Dilihan Almanac Factor Sea-Linen Tunica & Shot-Silk Pallium', 'torso', cul, parts_t))

    # 3. GLOVES: Shot-silk & gold-coin cuffs
    gid = f'dil_{sex}_factor_cuffs'
    entries.append(assemble_garment(gid, 'Dilihan Almanac Factor Shot-Silk Cuffs', 'gloves', cul, _bracers(gid, p_kiln, p_gold, length_f=0.42)))

    # 4. LEGS: Light sea-linen trousers
    gid = f'dil_{sex}_factor_trousers'
    entries.append(assemble_garment(gid, 'Dilihan Almanac Factor Sea-Linen Trousers', 'legs', cul, trousers(gid, p_linen, ease=0.016, bag=0.010), legged=True))

    # 5. FEET: Laced sea-leather sandals
    gid = f'dil_{sex}_factor_sandals'
    entries.append(assemble_garment(
        gid, 'Dilihan Almanac Factor Laced Sandals', 'feet', cul,
        sandal(gid, p_leather, p_gold, laces=True),
    ))

    # 6. BACK: Almanac scroll satchel
    gid = f'dil_{sex}_factor_satchel'
    entries.append(assemble_garment(
        gid, 'Dilihan Almanac Scroll Satchel', 'back', cul,
        _dorsal_pack(gid, p_leather, p_gold, p_kiln, size=(0.105, 0.048, 0.125), bedroll_paint=p_saffron),
    ))
    return entries


def _build_dil_hykk_envoy(sex):
    entries = []
    cul = 'izani'
    p_bronze = P('bronze', 0.03, fabric='metal.bronze')
    p_nacre = P('nacre', 0.02, [B('bottom', 0.0, 0.024, 'subj_dil_ys_meander', 'bronze', 'nacre')], fabric='shell.nacre')
    p_seafoam = P('nacregreen', 0.04, [
        B('bottom', 0.0, 0.052, 'subj_dil_ys_meander', 'bronze', 'nacregreen'),
        B('top', 0.0, 0.024, 'solid', 'nacre'),
    ], fabric='cloth.linen.sea')
    p_gold = P('gold', 0.02, fabric='metal.gold')
    p_mantle = P('teal', 0.04, [B('bottom', 0.0, 0.048, 'subj_dil_ys_meander', 'gold', 'teal')], fabric='cloth.silk')

    # 1. HEAD: Bronze & nacre wave-meander stephane circlet (snug bare-head, ease=0.004 < 12mm)
    gid = f'dil_{sex}_envoy_stephane'
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    band = head_rings(f'{gid}_band', 0.60, 0.72, 0.004, p_bronze, n=36, rows=5)
    p_f, out_f = _ring_pt_along(band.P[2], fwd)
    s_f = np.cross(up, out_f)
    s_f /= max(np.linalg.norm(s_f), 1e-6)
    parts_h = [
        band,
        rosette(f'{gid}_nacre_crest', p_f + out_f * 0.003 + up * 0.012, out_f, s_f, radius=0.024, paint=p_nacre, n=14, thick=0.007, rigid_joint='Head'),
        rosette(f'{gid}_sun_core', p_f + out_f * 0.006 + up * 0.012, out_f, s_f, radius=0.012, paint=p_gold, n=12, thick=0.006, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(gid, 'Dilihan Hykkousoi Envoy Nacre Stephane', 'head', cul, parts_h))

    # 2. TORSO: Sea-foam pleated chiton-dalmatica edged in ys_band w/ nacre-gold Sun-Orb fibula
    gid = f'dil_{sex}_envoy_chiton'
    parts_t = [
        torso_tube(f'{gid}_chiton', core.KNEE + 0.02, core.SHOULDER + 0.01, 0.025, p_seafoam,
                   n=40, rows=20, hang_from=core.WAIST, flare=0.075),
        sleeves(gid, 'elbow', ease=0.024, paint=p_seafoam),
        belt_sash(f'{gid}_belt', core.WAIST - 0.032, core.WAIST + 0.032, p_nacre, ease=0.031),
    ]
    parts_t.extend(_pectoral_boss(gid, p_gold, p_nacre, radius=0.040, clearance=0.028))
    entries.append(assemble_garment(gid, 'Dilihan Hykkousoi Envoy Sea-Foam Chiton-Dalmatica', 'torso', cul, parts_t))

    # 3. GLOVES: Bronze & nacre wave cuffs
    gid = f'dil_{sex}_envoy_cuffs'
    entries.append(assemble_garment(gid, 'Dilihan Hykkousoi Envoy Nacre Cuffs', 'gloves', cul, _bracers(gid, p_bronze, p_nacre, length_f=0.40)))

    # 4. LEGS: Pleated sea-foam trousers
    gid = f'dil_{sex}_envoy_skirt'
    entries.append(assemble_garment(gid, 'Dilihan Hykkousoi Envoy Sea-Foam Drape Trousers', 'legs', cul, trousers(gid, p_seafoam, ease=0.016, bag=0.011), legged=True))

    # 5. FEET: Pearl krepides sandals
    gid = f'dil_{sex}_envoy_sandals'
    entries.append(assemble_garment(
        gid, 'Dilihan Hykkousoi Envoy Pearl Krepides Sandals', 'feet', cul,
        sandal(gid, p_nacre, p_bronze, laces=True),
    ))

    # 6. BACK: Draped teal & gold Aegean mantle with cloth chains
    gid = f'dil_{sex}_envoy_mantle'
    entries.append(assemble_garment(
        gid, 'Dilihan Hykkousoi Envoy Draped Mantle', 'back', cul,
        [_safe_cape(gid, core.KNEE + 0.04, p_mantle, span=1.60, ease=0.026, flare=0.070)],
    ))
    return entries


def _build_dil_cut_guard(sex):
    entries = []
    cul = 'izani'
    p_bronze = P('bronze', 0.03, [B('bottom', 0.0, 0.022, 'subj_dil_ys_meander', 'nacre', 'bronze')], fabric='metal.bronze')
    p_nacre = P('nacre', 0.02, fabric='shell.nacre')
    p_crest = P('teal', 0.04, [B('top', 0.0, 0.032, 'solid', 'saffron')], fabric='plumage.feathers.raptor')
    p_lino = P('sealinen', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'bronze'),
        B('bottom', 0.0, 0.026, 'subj_dil_ys_meander', 'bronze', 'sealinen'),
    ], [PN(0.0, 1.0, 'subj_dil_linothorax', 'bronze', 'sealinen', 0.16)], fabric='armor.linothorax.twill')
    p_sash = P('pomegranate', 0.04, [B('bottom', 0.0, 0.028, 'subj_dil_aegean_silk', 'saffron', 'pomegranate')], fabric='cloth.silk.shot')
    p_kilt = P('sealinen', 0.04, [B('bottom', 0.0, 0.028, 'subj_dil_ys_meander', 'bronze', 'sealinen')],
               [PN(0.0, 1.0, 'subj_pteruges_strip', 'bronze', 'sealinen', 0.16)], fabric='cloth.linen.sea')
    p_linen = P('sealinen', 0.04, fabric='cloth.linen.sea')
    p_chlamys = P('teal', 0.04, [B('bottom', 0.0, 0.048, 'subj_dil_aegean_silk', 'saffron', 'teal')], fabric='cloth.silk')
    p_boot = leathery(P('saddle', 0.04, fabric='leather.cuir_bouilli'))

    # 1. HEAD: Polished bronze/nacre Aegean galea w/ curved neck-flange, coin-chime cheeks & teal/saffron crest
    gid = f'dil_{sex}_guard_galea'
    entries.append(assemble_garment(
        gid, 'Dilihan Cut Guard Bronze & Nacre Aegean Galea', 'head', cul,
        _subj_galea(gid, p_bronze, p_nacre, crest_paint=p_crest, cheek_guards=True, neck_guard=True),
        covers_hair=True,
    ))

    # 2. TORSO: Sculpted laminated white sea-linen linothorax w/ bronze Sun-Octopus scales & Jimjam silk sash
    gid = f'dil_{sex}_guard_linothorax'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_linen, n=36, rows=10),
        sleeves(gid, 'elbow', ease=0.021, paint=p_linen),
        *cuirass_plate(gid, p_lino, trim_paint=p_bronze, style='musculata', ease=0.024, faulds=2),
        *gorget_guard(gid, p_bronze, trim_paint=p_nacre, ease=0.025),
        *articulated_pauldrons(gid, p_bronze, trim_paint=p_nacre, lames=2, haute_piece=False, ease=0.025),
        belt_sash(f'{gid}_sash', core.WAIST - 0.035, core.WAIST + 0.035, p_sash, ease=0.035),
    ]
    parts_t.extend(_pectoral_boss(gid, p_bronze, p_nacre, radius=0.052, clearance=0.036))
    entries.append(assemble_garment(gid, 'Dilihan Cut Guard Sea-Linen Linothorax', 'torso', cul, parts_t))

    # 3. GLOVES: Sculpted bronze & nacre vambraces
    gid = f'dil_{sex}_guard_vambraces'
    entries.append(assemble_garment(
        gid, 'Dilihan Cut Guard Bronze Vambraces', 'gloves', cul,
        sculpted_vambraces(gid, p_bronze, trim_paint=p_nacre, couter=True, ease=0.015),
    ))

    # 4. LEGS: White sea-linen pteruges kilt over light linen breeches
    gid = f'dil_{sex}_guard_kilt'
    entries.append(assemble_garment(
        gid, 'Dilihan Cut Guard Sea-Linen Pteruges Kilt', 'legs', cul,
        _pteruges_kilt(gid, p_kilt, p_linen), legged=True,
    ))

    # 5. FEET: Sculpted bronze greaves over laced leather boots
    gid = f'dil_{sex}_guard_greaves'
    entries.append(assemble_garment(
        gid, 'Dilihan Cut Guard Bronze Greaves & Sandals', 'feet', cul,
        boots(gid, p_boot, p_bronze, top=0.30, ease_top=0.010)
        + sculpted_greaves(gid, p_bronze, trim_paint=p_nacre, poleyn=True, ease=0.016),
    ))

    # 6. BACK: Teal & saffron Aegean chlamys cloak with cloth chains
    gid = f'dil_{sex}_guard_chlamys'
    entries.append(assemble_garment(
        gid, 'Dilihan Cut Guard Teal & Saffron Chlamys', 'back', cul,
        [_safe_cape(gid, core.KNEE + 0.05, p_chlamys, span=1.55, ease=0.028, flare=0.068, back_push=0.015)],
    ))
    return entries


def _build_dil_aidol_voltigeur(sex):
    entries = []
    cul = 'izani'
    p_cork = P('khaki', 0.05, [B('bottom', 0.0, 0.024, 'solid', 'pomegranate')], fabric='cloth.canvas.duck.army')
    p_pugaree = P('pomegranate', 0.04, [B('bottom', 0.0, 0.018, 'solid', 'saffron')], fabric='cloth.silk.shot')
    p_bronze = P('bronze', 0.03, fabric='metal.bronze')
    p_lino = P('sealinen', 0.04, [B('bottom', 0.0, 0.024, 'solid', 'bronze')],
               [PN(0.0, 1.0, 'subj_dil_linothorax', 'bronze', 'sealinen', 0.16)], fabric='armor.linothorax.twill')
    p_shirt = P('oat', 0.04, fabric='cloth.linen.sea')
    p_trous = P('khaki', 0.04, fabric='cloth.linen.sea')
    p_teak = leathery(P('saddle', 0.05, [B('bottom', 0.0, 0.018, 'solid', 'bronze')], fabric='leather.cuir_bouilli'))

    # 1. HEAD: Cork-and-linen bronze-visored galea w/ kiln-red silk pugaree
    gid = f'dil_{sex}_voltigeur_galea'
    parts_h = _subj_galea(gid, p_cork, p_bronze, crest_paint=None, cheek_guards=False, neck_guard=True, brim_w=0.052)
    parts_h.append(crown_band(f'{gid}_pugaree', p_pugaree, 0.60, 0.70, ease=0.023, flare=0.004, rows=4, n=36))
    entries.append(assemble_garment(gid, 'Aidol Voltigeur Cork-and-Linen Galea & Pugaree', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Cropped linothorax corslet w/ cartridge baldrics over linen shirt
    gid = f'dil_{sex}_voltigeur_corslet'
    parts_t = [
        torso_tube(f'{gid}_shirt', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_shirt, n=36, rows=10),
        sleeves(gid, 'wrist', ease=0.022, paint=p_shirt),
        *cuirass_plate(gid, p_lino, trim_paint=p_bronze, style='laminar', ease=0.023, faulds=1),
        crossed_sash(f'{gid}_baldric', p_teak, width=0.068, ease=0.034),
        pouch_belt(gid, p_teak, p_bronze, ease=0.034),
    ]
    entries.append(assemble_garment(gid, 'Aidol Voltigeur Linothorax Corslet & Cartridge Baldric', 'torso', cul, parts_t))

    # 3. GLOVES: Leather shooting gloves
    gid = f'dil_{sex}_voltigeur_gloves'
    entries.append(assemble_garment(gid, 'Aidol Voltigeur Leather Shooting Gloves', 'gloves', cul, full_gloves(gid, p_teak, p_bronze, p_shirt)))

    # 4. LEGS: Light frontier linen trousers
    gid = f'dil_{sex}_voltigeur_trousers'
    entries.append(assemble_garment(gid, 'Aidol Voltigeur Frontier Trousers', 'legs', cul, trousers(gid, p_trous, ease=0.014, bag=0.008), legged=True))

    # 5. FEET: Frontier leather ankle boots
    gid = f'dil_{sex}_voltigeur_boots'
    entries.append(assemble_garment(
        gid, 'Aidol Voltigeur Frontier Ankle Boots', 'feet', cul,
        boots(gid, leathery(P('umber', 0.05, fabric='leather.cuir_bouilli')), p_teak, top=0.38, cuff_paint=p_bronze, ease_top=0.026),
    ))

    # 6. BACK: Teak powder-pack
    gid = f'dil_{sex}_voltigeur_pack'
    entries.append(assemble_garment(
        gid, 'Aidol Voltigeur Teak Powder-Pack', 'back', cul,
        _dorsal_pack(gid, p_teak, p_bronze, p_pugaree, size=(0.11, 0.054, 0.13), bedroll_paint=p_pugaree),
    ))
    return entries


# ===========================================================================================================
# OUTFIT MAP & BUILD ORCHESTRATION
# ===========================================================================================================
def _outfit_slots_for_sex(sex):
    return {
        # Region 2: Porta Marr
        'marr_dockhand': {
            'head': f'marr_{sex}_dockhand_bandana',
            'torso': f'marr_{sex}_dockhand_vest',
            'gloves': f'marr_{sex}_dockhand_cuffs',
            'legs': f'marr_{sex}_dockhand_slops',
            'feet': f'marr_{sex}_dockhand_boots',
            'back': f'marr_{sex}_dockhand_hawser',
        },
        'marr_gardonz_factor': {
            'head': f'marr_{sex}_factor_tricorn',
            'torso': f'marr_{sex}_factor_coat',
            'gloves': f'marr_{sex}_factor_cuffs',
            'legs': f'marr_{sex}_factor_breeches',
            'feet': f'marr_{sex}_factor_boots',
            'back': f'marr_{sex}_factor_cape',
        },
        'marr_navigator': {
            'head': f'marr_{sex}_navigator_bicorne',
            'torso': f'marr_{sex}_navigator_doublet',
            'gloves': f'marr_{sex}_navigator_cuffs',
            'legs': f'marr_{sex}_navigator_trousers',
            'feet': f'marr_{sex}_navigator_boots',
            'back': f'marr_{sex}_navigator_astrolabe',
        },
        'marr_classiarius': {
            'head': f'marr_{sex}_classiarius_helm',
            'torso': f'marr_{sex}_classiarius_lorica',
            'gloves': f'marr_{sex}_classiarius_vambraces',
            'legs': f'marr_{sex}_classiarius_kilt',
            'feet': f'marr_{sex}_classiarius_caligae',
            'back': f'marr_{sex}_classiarius_sagum',
        },
        'marr_corsair': {
            'head': f'marr_{sex}_corsair_hat',
            'torso': f'marr_{sex}_corsair_bolero',
            'gloves': f'marr_{sex}_corsair_cuffs',
            'legs': f'marr_{sex}_corsair_breeches',
            'feet': f'marr_{sex}_corsair_boots',
            'back': f'marr_{sex}_corsair_cape',
        },
        # Region 3: Talia
        'tal_scholar': {
            'head': f'tal_{sex}_scholar_birretta',
            'torso': f'tal_{sex}_scholar_gown',
            'gloves': f'tal_{sex}_scholar_cuffs',
            'legs': f'tal_{sex}_scholar_trousers',
            'feet': f'tal_{sex}_scholar_shoes',
            'back': f'tal_{sex}_scholar_codex',
        },
        'tal_toll_baron': {
            'head': f'tal_{sex}_baron_hat',
            'torso': f'tal_{sex}_baron_dalmatica',
            'gloves': f'tal_{sex}_baron_cuffs',
            'legs': f'tal_{sex}_baron_breeches',
            'feet': f'tal_{sex}_baron_boots',
            'back': f'tal_{sex}_baron_mantle',
        },
        'tal_pass_guard': {
            'head': f'tal_{sex}_pass_galea',
            'torso': f'tal_{sex}_pass_squamata',
            'gloves': f'tal_{sex}_pass_vambraces',
            'legs': f'tal_{sex}_pass_pteruges',
            'feet': f'tal_{sex}_pass_greaves',
            'back': f'tal_{sex}_pass_cloak',
        },
        'tal_highland_auxilia': {
            'head': f'tal_{sex}_auxilia_spangenhelm',
            'torso': f'tal_{sex}_auxilia_coat',
            'gloves': f'tal_{sex}_auxilia_bracers',
            'legs': f'tal_{sex}_auxilia_braccae',
            'feet': f'tal_{sex}_auxilia_boots',
            'back': f'tal_{sex}_auxilia_sagum',
        },
        # Region 4: Pylon
        'pyl_salvager': {
            'head': f'pyl_{sex}_salvager_wrap',
            'torso': f'pyl_{sex}_salvager_vest',
            'gloves': f'pyl_{sex}_salvager_gloves',
            'legs': f'pyl_{sex}_salvager_trousers',
            'feet': f'pyl_{sex}_salvager_boots',
            'back': f'pyl_{sex}_salvager_condenser',
        },
        'pyl_conduit_warden': {
            'head': f'pyl_{sex}_warden_hat',
            'torso': f'pyl_{sex}_warden_duster',
            'gloves': f'pyl_{sex}_warden_cuffs',
            'legs': f'pyl_{sex}_warden_trousers',
            'feet': f'pyl_{sex}_warden_boots',
            'back': f'pyl_{sex}_warden_tank',
        },
        'pyl_decurion_guard': {
            'head': f'pyl_{sex}_decurion_galea',
            'torso': f'pyl_{sex}_decurion_lorica',
            'gloves': f'pyl_{sex}_decurion_gauntlets',
            'legs': f'pyl_{sex}_decurion_pteruges',
            'feet': f'pyl_{sex}_decurion_caligae',
            'back': f'pyl_{sex}_decurion_pack',
        },
        'pyl_dust_vexillarius': {
            'head': f'pyl_{sex}_vexil_helm',
            'torso': f'pyl_{sex}_vexil_harness',
            'gloves': f'pyl_{sex}_vexil_bracers',
            'legs': f'pyl_{sex}_vexil_trousers',
            'feet': f'pyl_{sex}_vexil_boots',
            'back': f'pyl_{sex}_vexil_standard',
        },
        # Region 5: Shell
        'shl_foundry_worker': {
            'head': f'shl_{sex}_foundry_hood',
            'torso': f'shl_{sex}_foundry_apron',
            'gloves': f'shl_{sex}_foundry_mitts',
            'legs': f'shl_{sex}_foundry_trousers',
            'feet': f'shl_{sex}_foundry_clogs',
            'back': f'shl_{sex}_foundry_hod',
        },
        'shl_enforcer': {
            'head': f'shl_{sex}_enforcer_galea',
            'torso': f'shl_{sex}_enforcer_lorica',
            'gloves': f'shl_{sex}_enforcer_bracers',
            'legs': f'shl_{sex}_enforcer_breeches',
            'feet': f'shl_{sex}_enforcer_boots',
            'back': f'shl_{sex}_enforcer_pack',
        },
        'shl_siege_guard': {
            'head': f'shl_{sex}_siege_galea',
            'torso': f'shl_{sex}_siege_lorica',
            'gloves': f'shl_{sex}_siege_gauntlets',
            'legs': f'shl_{sex}_siege_kilt',
            'feet': f'shl_{sex}_siege_sabatons',
            'back': f'shl_{sex}_siege_cloak',
        },
        'shl_chain_snapper': {
            'head': f'shl_{sex}_rebel_collar',
            'torso': f'shl_{sex}_rebel_lame',
            'gloves': f'shl_{sex}_rebel_bracers',
            'legs': f'shl_{sex}_rebel_trousers',
            'feet': f'shl_{sex}_rebel_boots',
            'back': f'shl_{sex}_rebel_pack',
        },
        # Region 6: Dilihan
        'dil_almanac_factor': {
            'head': f'dil_{sex}_factor_turban',
            'torso': f'dil_{sex}_factor_tunica',
            'gloves': f'dil_{sex}_factor_cuffs',
            'legs': f'dil_{sex}_factor_trousers',
            'feet': f'dil_{sex}_factor_sandals',
            'back': f'dil_{sex}_factor_satchel',
        },
        'dil_hykk_envoy': {
            'head': f'dil_{sex}_envoy_stephane',
            'torso': f'dil_{sex}_envoy_chiton',
            'gloves': f'dil_{sex}_envoy_cuffs',
            'legs': f'dil_{sex}_envoy_skirt',
            'feet': f'dil_{sex}_envoy_sandals',
            'back': f'dil_{sex}_envoy_mantle',
        },
        'dil_cut_guard': {
            'head': f'dil_{sex}_guard_galea',
            'torso': f'dil_{sex}_guard_linothorax',
            'gloves': f'dil_{sex}_guard_vambraces',
            'legs': f'dil_{sex}_guard_kilt',
            'feet': f'dil_{sex}_guard_greaves',
            'back': f'dil_{sex}_guard_chlamys',
        },
        'dil_aidol_voltigeur': {
            'head': f'dil_{sex}_voltigeur_galea',
            'torso': f'dil_{sex}_voltigeur_corslet',
            'gloves': f'dil_{sex}_voltigeur_gloves',
            'legs': f'dil_{sex}_voltigeur_trousers',
            'feet': f'dil_{sex}_voltigeur_boots',
            'back': f'dil_{sex}_voltigeur_pack',
        },
    }


def build_iziz_subjects_kit():
    """Compile all 21 Iziz Regional Subject tiers across `mpfb_male` and `mpfb_female`."""
    builders = [
        _build_marr_dockhand,
        _build_marr_gardonz_factor,
        _build_marr_navigator,
        _build_marr_classiarius,
        _build_marr_corsair,
        _build_tal_scholar,
        _build_tal_toll_baron,
        _build_tal_pass_guard,
        _build_tal_highland_auxilia,
        _build_pyl_salvager,
        _build_pyl_conduit_warden,
        _build_pyl_decurion_guard,
        _build_pyl_dust_vexillarius,
        _build_shl_foundry_worker,
        _build_shl_enforcer,
        _build_shl_siege_guard,
        _build_shl_chain_snapper,
        _build_dil_almanac_factor,
        _build_dil_hykk_envoy,
        _build_dil_cut_guard,
        _build_dil_aidol_voltigeur,
    ]
    items_by_body = {'mpfb_male': [], 'mpfb_female': []}
    kit_entries = []
    with subj_motif_scope():
        for body_id, sex in (('mpfb_male', 'm'), ('mpfb_female', 'f')):
            set_body(body_id)
            for fn in builders:
                for ent in fn(sex):
                    ent['_body'] = body_id
                    items_by_body[body_id].append(ent)
                    kit_entries.append(ent)
    return items_by_body, kit_entries


def build_tiers_dict():
    m_slots = _outfit_slots_for_sex('m')
    f_slots = _outfit_slots_for_sex('f')
    tiers = {}
    for tid, (region, label, share) in SUBJECT_TIER_META.items():
        tiers[tid] = {
            'region': region,
            'label': label,
            'share': share,
            'm': dict(m_slots[tid], region=region),
            'f': dict(f_slots[tid], region=region),
        }
    return tiers


def _validate_manifest(items_by_body, kit_entries, tiers):
    by_body_id = {}
    for ent in kit_entries:
        b_id = ent.get('_body')
        gid = ent.get('id')
        assert b_id in ('mpfb_male', 'mpfb_female'), f'Missing/invalid _body on {gid}: {b_id}'
        assert ent.get('culture') == 'izani', f'Unexpected culture on {gid}: {ent.get("culture")}'
        key = (b_id, gid)
        assert key not in by_body_id, f'Duplicate kit_entry for {key}'
        by_body_id[key] = ent
        glb_p = ROOT / ent['glb']
        morph_p = glb_p.with_suffix('.morph.bin')
        assert glb_p.exists() and glb_p.stat().st_size > 500, f'Missing or empty GLB: {glb_p}'
        assert morph_p.exists() and morph_p.stat().st_size > 100, f'Missing or empty morph.bin: {morph_p}'

    assert len(tiers) == 21, f'Expected 21 regional subject tiers, got {len(tiers)}'
    for tid, spec in tiers.items():
        for sex_key, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            outfit = spec[sex_key]
            for slot in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                assert slot in outfit, f'Missing slot {slot} in {tid}.{sex_key}'
                pid = outfit[slot]
                assert (body_id, pid) in by_body_id, f'Outfit {tid}.{sex_key}.{slot} -> {pid} missing from {body_id}'
                assert by_body_id[(body_id, pid)]['slot'] == slot, (
                    f'Slot mismatch on {pid}: expected {slot}, got {by_body_id[(body_id, pid)]["slot"]}'
                )


def main():
    t0 = time.perf_counter()
    items_by_body, kit_entries = build_iziz_subjects_kit()
    tiers = build_tiers_dict()
    _validate_manifest(items_by_body, kit_entries, tiers)

    manifest_path = CULTURES_DIR / 'iziz_subjects_manifest.json'
    manifest_data = {
        'culture': 'izani',
        'items': items_by_body,
        'kit_entries': kit_entries,
        'tiers': tiers,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = len(items_by_body['mpfb_male'])
    n_f = len(items_by_body['mpfb_female'])
    print(f'Successfully built {len(kit_entries)} Iziz Regional Subject pieces ({n_m} male, {n_f} female) across {len(tiers)} tiers in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
