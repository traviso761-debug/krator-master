"""The Complete Yusar Wardrobe Kit (`yusar` — Carcosa & Henge Cyber-Arcologies).

Expands `yusar` to 13 M+F paired tiers (12 procedural `ysr_{m,f}_*` tiers + existing M+F
`crescent_vigilant` hero tier, dropping the 3 duplicate `0.0`-share `valley_thrall_*` keys):

Everyday Carcosa & Henge Civilians, Artisans, Chirurgeons & Callers (6 tiers):
  1. `carcosa_scavenger` (`0.14`) — Carcosa Conduit-Scavenger & Stack Salvager
  2. `henge_kiln_worker` (`0.12`) — Henge Ceramic-Insulator Kiln & Relay Worker
  3. `carcosa_citizen`   (`0.13`) — Carcosa Stack-Terrace Citizen & Loom-Coder
  4. `cyber_surgeon`     (`0.08`) — Yusar Splice-Chirurgeon & Biogel Grafter
  5. `spek_stak_caller`  (`0.09`) — `Spēk-Stak` Cant-Caller & Acoustic Relay Crier
  6. `relay_linesman`    (`0.08`) — Frontier High-Tension Pylon & Tether Linesman

Core Yusar Cyber-Mystics & Enforcers (6 tiers, full M+F parity, zero foreign loans):
  7. `lightkeeper`       (`0.08`) — Carcosa Light-Keeper (Vacuum-Tube Mystic)
  8. `dronemaster`       (`0.07`) — Henge Drone-Caller (Multi-Lens Sensor Rig)
  9. `electropriest`     (`0.06`) — Carcosa Electro-Priest (Induction-Ring Celebrant)
 10. `electromonk`       (`0.06`) — Henge Electro-Monk (Live-Conduit Ascetic)
 11. `corsair`           (`0.05`) — Carcosa Hive-Corsair (Linked-Node Enforcer)
 12. `hierophant`        (`0.04`) — Stack-Hierophant (Memory-Tower Speaker)

Named / Important NPC Tier (`0.00` share, preserved M+F):
 13. `crescent_vigilant` (`0.00`) — Crescent Vigilant (Astral Night-Watcher)

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/yusar_full.py
"""
from contextlib import contextmanager
import json
import math
import os
os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')
import sys
import time
from pathlib import Path
import numpy as np

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

from garments import core
from garments import paint as paint_mod
from garments.core import (
    Part, J, L, R, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment,
)
from garments.paint import P, B, PN, C, WOOL, COTTON, leathery
from garments.types.torso import (
    torso_tube, collar, collar_disc, tabard, crossed_sash, pauldron, neck_ring,
)
from garments.types.limbs import limb_tube, sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots
from garments.types.headgear import (
    head_landmarks_exact, head_rings, sculpted_faceplate, hood, tower_hat, turban, crown_band, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, tube, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

YSR_COLORS = {
    'ysr_carbon':      (0.045, 0.048, 0.056),
    'ysr_slate':       (0.145, 0.165, 0.195),
    'ysr_ceramic':     (0.810, 0.790, 0.735),
    'ysr_biogel':      (0.140, 0.720, 0.560),
    'ysr_copper_coil': (0.640, 0.310, 0.125),
    'ysr_insulator':   (0.280, 0.440, 0.480),
}
for _k, _v in YSR_COLORS.items():
    C.setdefault(_k, _v)

YUSAR_TIER_SHARES = [
    ['carcosa_scavenger', 0.14],
    ['henge_kiln_worker', 0.12],
    ['carcosa_citizen', 0.13],
    ['cyber_surgeon', 0.08],
    ['spek_stak_caller', 0.09],
    ['relay_linesman', 0.08],
    ['lightkeeper', 0.08],
    ['dronemaster', 0.07],
    ['electropriest', 0.06],
    ['electromonk', 0.06],
    ['corsair', 0.05],
    ['hierophant', 0.04],
    ['crescent_vigilant', 0.0],
]

YUSAR_TIER_LABELS = {
    'carcosa_scavenger': 'Carcosa Arcology Conduit-Scavenger',
    'henge_kiln_worker': 'Henge Ceramic-Insulator Kiln & Relay Worker',
    'carcosa_citizen': 'Carcosa Stack-Terrace Citizen & Loom-Coder',
    'cyber_surgeon': 'Yusar Splice-Chirurgeon & Biogel Grafter',
    'spek_stak_caller': 'Spēk-Stak Cant-Caller & Acoustic Relay Crier',
    'relay_linesman': 'Frontier High-Tension Pylon & Tether Linesman',
    'lightkeeper': 'Carcosa Light-Keeper (Vacuum-Tube Mystic)',
    'dronemaster': 'Henge Drone-Caller (Multi-Lens Sensor Rig)',
    'electropriest': 'Carcosa Electro-Priest (Induction-Ring Celebrant)',
    'electromonk': 'Henge Electro-Monk (Live-Conduit Ascetic)',
    'corsair': 'Carcosa Hive-Corsair (Linked-Node Enforcer)',
    'hierophant': 'Stack-Hierophant (Memory-Tower Speaker)',
    'crescent_vigilant': 'Crescent Vigilant (Astral Night-Watcher)',
}

YSR_CUSTOM_MOTIFS = {
    'ysr_vacuum_grid',
    'ysr_ceramic_rib',
    'ysr_punchcard_weave',
    'ysr_biogel_trace',
    'ysr_spek_waveform',
}


def _ysr_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)
    fg_a = np.asarray(fg, dtype=np.float64)
    bg_a = np.asarray(bg, dtype=np.float64)

    if style == 'ysr_vacuum_grid':
        # Glowing cathode-filament grid with dark carbon-bus dividers
        cu = (u * 6.0) % 1.0
        cv = (v * 4.0) % 1.0
        frame_m = (cu < 0.12) | (cu > 0.88) | (cv < 0.10) | (cv > 0.90)
        filament = (np.abs(cu - 0.50) < 0.08) & (cv > 0.18) & (cv < 0.82)
        glow = np.exp(-((cu - 0.50) / 0.22) ** 2) * np.exp(-((cv - 0.50) / 0.32) ** 2)
        img[:] = bg_a[None, None, :] * (1.0 - 0.45 * glow[:, :, None]) + fg_a[None, None, :] * (0.45 * glow[:, :, None])
        img[frame_m] = C['ysr_carbon']
        img[filament] = fg_a
        return np.clip(img, 0.0, 1.0)

    if style == 'ysr_ceramic_rib':
        # Ribbed glazed Henge high-voltage porcelain insulator rings + copper busbars
        rib = 0.78 + 0.22 * np.cos(v * 2.0 * math.pi * 10.0)
        bus = (np.abs((u * 4.0) % 1.0 - 0.5) < 0.07)
        band = (v < 0.08) | (v > 0.92)
        img[:] = bg_a[None, None, :] * rib[:, :, None]
        img[bus] = C['ysr_copper_coil']
        img[band] = fg_a
        return np.clip(img, 0.0, 1.0)

    if style == 'ysr_punchcard_weave':
        # Carcosa Jacquard memory-loom punch-card registers
        gu = np.floor(u * 16.0).astype(int)
        gv = np.floor(v * 12.0).astype(int)
        fu = (u * 16.0) % 1.0
        fv = (v * 12.0) % 1.0
        bit = ((gu * 7 + gv * 13) % 5 == 0) & (fu > 0.22) & (fu < 0.78) & (fv > 0.25) & (fv < 0.75)
        stripe = ((gv % 4) == 0) & (fv < 0.16)
        img[stripe] = 0.55 * bg_a + 0.45 * fg_a
        img[bit] = fg_a
        return np.clip(img, 0.0, 1.0)

    if style == 'ysr_biogel_trace':
        # Surgical biogel capillary channels with sterile ceramic trim
        wave = np.sin(u * 2.0 * math.pi * 5.0 + 1.4 * np.sin(v * 2.0 * math.pi * 2.0))
        cap = np.abs(wave) < 0.14
        node = (np.hypot((u * 5.0) % 1.0 - 0.5, (v * 4.0) % 1.0 - 0.5) < 0.14)
        img[cap] = 0.35 * bg_a + 0.65 * fg_a
        img[node] = fg_a
        return np.clip(img, 0.0, 1.0)

    if style == 'ysr_spek_waveform':
        # Acoustic `Spēk-Stak` frequency bars & swapped-compound chevron glyphs
        bar_u = (u * 12.0) % 1.0
        amp = 0.18 + 0.28 * np.abs(np.sin((np.floor(u * 12.0) * 1.7) + 0.6))
        on = (bar_u > 0.20) & (bar_u < 0.80) & (np.abs(v - 0.50) < amp)
        mid = np.abs(v - 0.50) < 0.035
        img[on] = fg_a
        img[mid] = C['cybercyan']
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def _ysr_motif_ctx():
    orig = paint_mod.motif
    paint_mod.FABRIC.setdefault('cloth.cryo.elastomer', 0.24)

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in YSR_CUSTOM_MOTIFS:
            return _ysr_motif(style, w, h, fg, bg, aspect=aspect)
        return orig(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched
    try:
        yield
    finally:
        paint_mod.motif = orig


# ===========================================================================================================
# GEOMETRY HELPERS (100% BODY-RELATIVE FOR M+F PARITY & <= 18mm ISLAND RULE)
# ===========================================================================================================
def _open_brow_dome(name, paint, f_brow=0.60, f_low=0.08, high=1.14, ease=0.018, rows=12, n=36):
    """Open-face helmet/cap cranium shell whose front rim stays cleanly above `f_brow >= 0.58`.

    Uses equator-sampled dome taper + high-latitude skull clamping (`high >= 1.13, ease >= 0.018`) to guarantee
    zero double-taper skull poke-through on both male and female crania.
    """
    a, b, up, bk, left = head_frame()
    H = float(np.linalg.norm(b - a))
    high_use = max(float(high), 1.13)
    ease_use = max(float(ease), 0.018)
    angles = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angles]
    f_rim = np.full(n, float(f_low), dtype=np.float64)
    half_span = 0.56 * math.pi
    for j, an in enumerate(angles):
        af = abs(an - math.pi)
        if af < half_span:
            w = 0.5 + 0.5 * math.cos(math.pi * af / half_span)
            f_rim[j] = f_low + (f_brow - f_low) * (w ** 0.78)
    c_eq = a + (b - a) * 0.56
    r_eq = np.zeros(n, dtype=np.float64)
    for j, d in enumerate(ds):
        h_eq = first_hit(c_eq, d)
        r_eq[j] = (float(h_eq) if (h_eq is not None and 0.045 < h_eq < 0.145) else 0.095) + ease_use
    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for i in range(rows):
        u = i / float(max(rows - 1, 1))
        for j, d in enumerate(ds):
            f_ij = float(f_rim[j]) + (high_use - float(f_rim[j])) * u
            c_pos = a + (b - a) * f_ij
            if f_ij <= 0.72:
                c_ray = a + (b - a) * max(f_ij, 0.15)
                h_hit = first_hit(c_ray, d)
                r_ij = (float(h_hit) if (h_hit is not None and 0.045 < h_hit < 0.145) else (r_eq[j] - ease_use)) + ease_use
            else:
                u_top = min(1.0, (f_ij - 0.72) / max(0.08, high_use - 0.72))
                r_ij = r_eq[j] * max(0.04, math.sqrt(max(0.0, 1.0 - u_top ** 1.85)))
                if f_ij <= 0.96:
                    h_hit = first_hit(c_pos, d)
                    if h_hit is not None and 0.020 < h_hit < 0.145:
                        r_ij = max(r_ij, float(h_hit) + ease_use)
            Q[i, j] = c_pos + d * r_ij
    apex = b + up * max(0.028, (high_use - 1.0) * H + ease_use * 0.6)
    Q[-1] = apex + (Q[-1] - apex) * 0.04
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _cyber_faceplate_with_optics(gid, mask_paint, slit_col='cybercyan', bar_col='amber'):
    """Contoured faceplate + proud +4mm optical eye-slits & nasal/vocoder bars (never a featureless egg!)."""
    fp = sculpted_faceplate(f'{gid}_faceplate', mask_paint, f_top=0.74, f_bot=-0.05, ease=0.013, jaw_narrow=0.34)
    a, b, up, bk, left = head_frame()
    fwd = -bk
    parts = [fp]
    R_f, C_f = fp.P.shape[:2]
    # Eye row ~ 38% down from top; cols 0..C_f-1 span left-to-right across front
    r_eye = int(round(0.38 * (R_f - 1)))
    c_mid = C_f // 2
    for c0, c1, tag in ((max(2, c_mid - 8), max(4, c_mid - 2), 'R'), (min(C_f - 5, c_mid + 2), min(C_f - 3, c_mid + 8), 'L')):
        pts = [fp.P[r_eye, k] + fwd * 0.0045 for k in range(c0, c1 + 1)]
        if len(pts) >= 2:
            parts.append(tube(f'{gid}_eyeslit_{tag}', pts, 0.0055, P(slit_col, 0.01, fabric='beads.glass'), n=8, rigid_joint='Head'))
    # Brow bar & nasal/vocoder ridge
    r_brow = int(round(0.28 * (R_f - 1)))
    brow_pts = [fp.P[r_brow, k] + fwd * 0.0040 for k in range(max(2, c_mid - 9), min(C_f - 2, c_mid + 10), 2)]
    parts.append(tube(f'{gid}_browbar', brow_pts, 0.0048, P(bar_col, 0.02, fabric='metal.iron'), n=8, rigid_joint='Head'))
    nose_pts = [fp.P[r, c_mid] + fwd * 0.0042 for r in range(r_brow, min(R_f - 2, r_brow + 7))]
    parts.append(tube(f'{gid}_nasal', nose_pts, 0.0045, P('ysr_carbon', 0.02, fabric='metal.iron'), n=8, rigid_joint='Head'))
    r_jaw = int(round(0.78 * (R_f - 1)))
    parts.append(rosette(f'{gid}_vocoder', fp.P[r_jaw, c_mid] + fwd * 0.004, fwd, left, 0.020,
                         P(slit_col, 0.01, [B('top', 0.0, 0.02, 'solid', 'ysr_carbon')], fabric='metal.iron'),
                         n=12, thick=0.010, rigid_joint='Head'))
    return parts


def _dorsal_pack_base(gid, pad_paint, z_off=-0.01, pad_size=(0.17, 0.042, 0.21), clearance=0.022):
    """Flush Spine2-weighted dorsal mounting pad seated against the back (zero shoulder-strap hover issues)."""
    z_c = core.CHEST + z_off
    c_sp = spine_at(z_c)
    anchor = surface_out(c_sp, BACK_DIR, clearance, bvh=core.BVH_T)
    pad = blob(f'{gid}_dorsal_pad', anchor, pad_size, pad_paint, n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, anchor


def _host_anchor(host_part, target_pt):
    pts = host_part.P.reshape(-1, 3)
    idx = int(np.argmin(np.linalg.norm(pts - np.asarray(target_pt, dtype=np.float64), axis=1)))
    return pts[idx].copy()


# ===========================================================================================================
# SHARED / REUSABLE LOWER GARMENTS & GLOVES (`ysr_{s}_*`)
# ===========================================================================================================
def _build_shared_lowers_and_gloves(sex):
    entries = []
    p_dark_pants = P('ysr_carbon', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'cybercyan'),
        B('top', 0.0, 0.03, 'solid', 'ysr_slate'),
    ], [PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'ysr_carbon', 0.16)], fabric='cloth.canvas.oiled')
    entries.append(assemble_garment(
        f'ysr_{sex}_conduit_trousers', 'Yusar Conduit-Weave Tech Trousers', 'legs', 'yusar',
        trousers(f'ysr_{sex}_conduit_trousers', p_dark_pants, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    p_work_pants = P('ysr_slate', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'amber'),
    ], [PN(0.0, 1.0, 'ysr_punchcard_weave', 'ysr_ceramic', 'ysr_slate', 0.18)], fabric=WOOL)
    entries.append(assemble_garment(
        f'ysr_{sex}_arcology_slacks', 'Carcosa Stack-Terrace Tailored Slacks', 'legs', 'yusar',
        trousers(f'ysr_{sex}_arcology_slacks', p_work_pants, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    p_kiln_pants = P('charcoal', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'ysr_copper_coil'),
    ], [PN(0.0, 1.0, 'ysr_ceramic_rib', 'ysr_ceramic', 'charcoal', 0.18)], fabric='leather.foundry.pigskin')
    entries.append(assemble_garment(
        f'ysr_{sex}_kiln_breeches', 'Henge Insulator-Kiln Heavy Breeches', 'legs', 'yusar',
        trousers(f'ysr_{sex}_kiln_breeches', p_kiln_pants, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    p_corsair_r = P('ysr_carbon', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'neonmagenta')],
                    [PN(0.0, 1.0, 'cyber_hex_neon', 'neonmagenta', 'ysr_carbon', 0.16)], fabric='cloth.canvas.oiled')
    p_corsair_l = P('ysr_slate', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'cybercyan')],
                    [PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'ysr_carbon', 0.16)], fabric='cloth.canvas.oiled')
    c_legs = trousers(f'ysr_{sex}_corsair_pants', p_corsair_r, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22)
    for pt in c_legs:
        if '_L' in pt.name:
            pt.paint = p_corsair_l
    entries.append(assemble_garment(
        f'ysr_{sex}_corsair_pants', 'Carcosa Hive-Corsair Linked-Node Trousers', 'legs', 'yusar', c_legs, legged=True,
    ))

    # Boots (3 distinct Yusar footwear styles, clearing tucked trousers cleanly)
    p_rubber_boot = P('ysr_carbon', 0.04, [
        B('top', 0.0, 0.04, 'solid', 'cybercyan'),
    ], fabric='rubber.tyre')
    entries.append(assemble_garment(
        f'ysr_{sex}_insulator_boots', 'Yusar Dielectric Rubber-Sole Arcology Boots', 'feet', 'yusar',
        boots(f'ysr_{sex}_insulator_boots', P('soot', 0.08), p_rubber_boot, top=0.40, ease_top=0.026,
              cuff_paint=P('ysr_ceramic', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'cybercyan')])),
    ))

    p_civic_boot = P('ysr_slate', 0.04, [
        B('top', 0.0, 0.035, 'solid', 'amber'),
    ], fabric='leather.polished')
    entries.append(assemble_garment(
        f'ysr_{sex}_terrace_boots', 'Carcosa Terrace Copper-Buckled Boots', 'feet', 'yusar',
        boots(f'ysr_{sex}_terrace_boots', P('soot', 0.08), p_civic_boot, top=0.38, ease_top=0.026),
    ))

    p_enforcer_boot = P('ysr_carbon', 0.03, [
        B('top', 0.0, 0.045, 'stripes', 'neonmagenta', 'ysr_carbon', 0.025),
    ], [PN(0.15, 0.85, 'cyber_hex_neon', 'cybercyan', 'ysr_carbon', 0.15)], fabric='metal.iron')
    entries.append(assemble_garment(
        f'ysr_{sex}_cyber_greaves', 'Yusar Linked-Node Armored Shin-Boots', 'feet', 'yusar',
        boots(f'ysr_{sex}_cyber_greaves', P('soot', 0.08), p_enforcer_boot, top=0.44, ease_top=0.027),
    ))

    # Gloves / Bracers (4 styles)
    p_cuff_tech = P('ysr_carbon', 0.03, [
        B('top', 0.0, 0.03, 'solid', 'cybercyan'),
        B('bottom', 0.0, 0.03, 'solid', 'amber'),
    ], [PN(0.1, 0.9, 'circuit_schematic', 'cybercyan', 'ysr_carbon', 0.14)], fabric='metal.iron')
    entries.append(assemble_garment(
        f'ysr_{sex}_terminal_bracers', 'Yusar Wrist-Terminal Data Bracers', 'gloves', 'yusar',
        [sleeve(f'ysr_{sex}_term_L', L, p_cuff_tech, f0=0.58, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'ysr_{sex}_term_R', R, p_cuff_tech, f0=0.58, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20)],
    ))

    p_kiln_mitt = P('ysr_ceramic', 0.05, [B('top', 0.0, 0.04, 'solid', 'ysr_copper_coil')], fabric='leather.foundry.pigskin')
    entries.append(assemble_garment(
        f'ysr_{sex}_insulator_gauntlets', 'Henge Dielectric Porcelain-Cuff Gauntlets', 'gloves', 'yusar',
        full_gloves(f'ysr_{sex}_insulator_gauntlets', p_kiln_mitt, P('charcoal', 0.05, fabric='rubber.tyre'), f0=0.58, ease=0.014),
    ))

    p_surg_glv = P('ysr_biogel', 0.02, [B('top', 0.0, 0.03, 'solid', 'ysr_ceramic')], fabric='cloth.cryo.elastomer')
    entries.append(assemble_garment(
        f'ysr_{sex}_splice_gloves', 'Yusar Sterile Biogel Chirurgeon Gloves', 'gloves', 'yusar',
        full_gloves(f'ysr_{sex}_splice_gloves', P('ysr_ceramic', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'cybercyan')]), p_surg_glv,
                    f0=0.60, ease=0.013, knuckle_paint=P('steel', 0.02, fabric='metal.iron')),
    ))

    p_node_glv = P('ysr_carbon', 0.03, [B('top', 0.0, 0.035, 'solid', 'neonmagenta')],
                   [PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'ysr_carbon', 0.14)], fabric='metal.iron')
    entries.append(assemble_garment(
        f'ysr_{sex}_node_gauntlets', 'Carcosa Neural-Bus Articulated Gauntlets', 'gloves', 'yusar',
        full_gloves(f'ysr_{sex}_node_gauntlets', p_node_glv, P('ysr_carbon', 0.03, fabric='leather.polished'),
                    f0=0.56, ease=0.014, knuckle_paint=P('cybercyan', 0.01, fabric='beads.glass')),
    ))
    return entries


# ===========================================================================================================
# 12 PROCEDURAL TIERS (HEAD + TORSO + BACK PER TIER)
# ===========================================================================================================
def _build_civilian_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    # --- TIER 1: carcosa_scavenger ---
    gid_h = f'ysr_{sex}_scav_cap'
    cap_p = P('ysr_slate', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'amber')], fabric='cloth.canvas.oiled')
    dome = _open_brow_dome(f'{gid_h}_dome', cap_p, f_brow=0.62, f_low=0.14, high=1.14, ease=0.018)
    # Flipped-up forehead salvage lamp + dual side battery cells anchored directly to dome
    p_front = _host_anchor(dome, a + (b - a) * 0.72 + fwd * 0.11)
    lamp = rosette(f'{gid_h}_lamp', p_front + fwd * 0.005, fwd, left, 0.024,
                   P('amber', 0.01, [B('top', 0.0, 0.02, 'solid', 'ysr_carbon')], fabric='beads.glass'),
                   n=12, thick=0.014, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Carcosa Salvager Headlamp Work-Cap', 'head', 'yusar', [dome, lamp], covers_hair=True))

    gid_t = f'ysr_{sex}_scav_jacket'
    jkt_p = P('ysr_slate', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'amber'),
        B('top', 0.0, 0.04, 'solid', 'ysr_copper_coil'),
    ], [PN(0.0, 1.0, 'cyber_hex_neon', 'amber', 'ysr_slate', 0.18)], fabric='cloth.canvas.oiled')
    t_body = torso_tube(f'{gid_t}_body', core.TOP, core.WAIST - 0.035, 0.022, jkt_p, n=40, rows=12)
    sash = crossed_sash(f'{gid_t}_bandolier', P('ysr_carbon', 0.04, [B('top', 0.0, 0.02, 'solid', 'cybercyan')], fabric='leather.cuir_bouilli'),
                        width=0.060, ease=0.029)
    belt = belt_sash(f'{gid_t}_belt', core.WAIST - 0.030, core.WAIST + 0.022,
                     P('ysr_carbon', 0.04, [B('top', 0.0, 0.02, 'solid', 'amber')]), ease=0.028)
    entries.append(assemble_garment(gid_t, 'Carcosa Conduit-Scavenger Utility Jacket', 'torso', 'yusar',
                                    [t_body, sleeves(gid_t, 'wrist', 0.018, jkt_p), sash, belt]))

    gid_b = f'ysr_{sex}_scav_pack'
    pad, anc = _dorsal_pack_base(gid_b, P('ysr_carbon', 0.04), clearance=0.026)
    can_l = horn(f'{gid_b}_spoolL', [anc + left * 0.055 - up * 0.08, anc + left * 0.055 + up * 0.10], 0.036, 0.034,
                 P('ysr_copper_coil', 0.03, [B('top', 0.0, 0.03, 'solid', 'ysr_ceramic')], fabric='metal.bronze'), n=12, rows=6, rigid_joint='Spine2')
    can_r = horn(f'{gid_b}_spoolR', [anc - left * 0.055 - up * 0.08, anc - left * 0.055 + up * 0.10], 0.036, 0.034,
                 P('ysr_insulator', 0.03, [B('top', 0.0, 0.03, 'solid', 'cybercyan')], fabric='metal.iron'), n=12, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Carcosa Copper-Spool & Conduit Salvage Pack', 'back', 'yusar', [pad, can_l, can_r]))

    # --- TIER 2: henge_kiln_worker ---
    gid_h = f'ysr_{sex}_kiln_visor'
    kiln_h_p = P('charcoal', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'ysr_ceramic')], fabric='leather.foundry.pigskin')
    kh_dome = _open_brow_dome(f'{gid_h}_cap', kiln_h_p, f_brow=0.61, f_low=0.10, high=1.14, ease=0.018)
    pb_l = _host_anchor(kh_dome, a + (b - a) * 0.65 + left * 0.07 + fwd * 0.06)
    pb_m = _host_anchor(kh_dome, a + (b - a) * 0.66 + fwd * 0.10)
    pb_r = _host_anchor(kh_dome, a + (b - a) * 0.65 - left * 0.07 + fwd * 0.06)
    shield_bar = tube(f'{gid_h}_glarebar', [pb_l + fwd * 0.004, pb_m + fwd * 0.008, pb_r + fwd * 0.004], 0.011,
                      P('amber', 0.02, [B('top', 0.0, 0.02, 'solid', 'ysr_copper_coil')], fabric='beads.glass'), n=8, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Henge Kiln-Tender Amber Glare-Shield Cap', 'head', 'yusar', [kh_dome, shield_bar], covers_hair=True))

    gid_t = f'ysr_{sex}_kiln_apron'
    shirt_p = P('ysr_slate', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'ysr_ceramic')], fabric=COTTON)
    apron_p = P('ysr_ceramic', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'ysr_copper_coil'),
        B('top', 0.0, 0.03, 'solid', 'charcoal'),
    ], [PN(0.0, 1.0, 'ysr_ceramic_rib', 'ysr_copper_coil', 'ysr_ceramic', 0.18)], fabric='leather.foundry.pigskin')
    kt_shirt = torso_tube(f'{gid_t}_shirt', core.TOP, core.WAIST - 0.035, 0.020, shirt_p, n=38, rows=11)
    kt_vest = torso_tube(f'{gid_t}_vest', core.CHEST + 0.05, core.WAIST - 0.040, 0.029, apron_p, n=40, rows=9)
    entries.append(assemble_garment(gid_t, 'Henge Porcelain-Insulator Smelter Jerkin', 'torso', 'yusar',
                                    [kt_shirt, sleeves(gid_t, 'elbow', 0.018, shirt_p), kt_vest]))

    gid_b = f'ysr_{sex}_kiln_rack'
    pad, anc = _dorsal_pack_base(gid_b, P('charcoal', 0.05), clearance=0.032)
    ins_stack = horn(f'{gid_b}_insulator', [anc - up * 0.10 + BACK_DIR * 0.015, anc + up * 0.13 + BACK_DIR * 0.015],
                     0.045, 0.038, apron_p, n=14, rows=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Henge Ribbed Porcelain Insulator Rack', 'back', 'yusar', [pad, ins_stack]))

    # --- TIER 3: carcosa_citizen ---
    gid_h = f'ysr_{sex}_cit_beret'
    beret_p = P('cobalt', 0.04, [
        B('bottom', 0.0, 0.035, 'solid', 'cybercyan'),
    ], [PN(0.0, 1.0, 'ysr_punchcard_weave', 'ysr_ceramic', 'cobalt', 0.16)], fabric=WOOL)
    beret = tower_hat(f'{gid_h}_beret', 0.125, lambda s: 1.0 + 0.22 * math.sin(s * math.pi) - 0.35 * (s ** 2),
                      beret_p, f=0.63, ease=0.018, rows=8, n=36)
    entries.append(assemble_garment(gid_h, 'Carcosa Loom-Coder Jacquard Beret', 'head', 'yusar', [beret], covers_hair=False))

    gid_t = f'ysr_{sex}_cit_coat'
    coat_p = P('cobalt', 0.04, [
        B('bottom', 0.0, 0.07, 'ysr_punchcard_weave', 'cybercyan', 'ysr_carbon', 0.12),
        B('top', 0.0, 0.04, 'solid', 'amber'),
    ], [PN(0.0, 1.0, 'ysr_punchcard_weave', 'ysr_ceramic', 'cobalt', 0.18)], fabric=WOOL)
    cit_robe = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE + 0.04, 0.028, coat_p,
                          n=42, rows=20, hang_from=core.WAIST, flare=0.10)
    cit_col = collar(f'{gid_t}_col', P('ysr_carbon', 0.03, [B('top', 0.0, 0.03, 'solid', 'cybercyan')]), height=0.034, ease=0.024)
    entries.append(assemble_garment(gid_t, 'Carcosa Stack-Terrace Punchcard Coat', 'torso', 'yusar',
                                    [cit_robe, cit_col, sleeves(gid_t, 'wrist', 0.019, coat_p)]))

    gid_b = f'ysr_{sex}_cit_satchel'
    pad, anc = _dorsal_pack_base(gid_b, P('ysr_carbon', 0.04), pad_size=(0.18, 0.048, 0.16), clearance=0.031)
    slate_case = blob(f'{gid_b}_deck', anc + BACK_DIR * 0.018, (0.15, 0.035, 0.19),
                      P('ysr_ceramic', 0.03, [B('top', 0.0, 0.03, 'solid', 'cybercyan')], fabric='metal.iron'),
                      n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Carcosa Loom-Card Slate Case', 'back', 'yusar', [pad, slate_case]))

    # --- TIER 4: cyber_surgeon ---
    gid_h = f'ysr_{sex}_surg_loupe'
    band_p = P('ysr_ceramic', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'ysr_biogel')], fabric='metal.iron')
    hb = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004, band_p, n=36, rows=5)
    p_brow = _host_anchor(hb, a + (b - a) * 0.65 + left * 0.032 + fwd * 0.10)
    loupe = rosette(f'{gid_h}_optic_loupe', p_brow + fwd * 0.005, fwd, left, 0.019,
                    P('ysr_biogel', 0.01, [B('top', 0.0, 0.02, 'solid', 'ysr_carbon')], fabric='beads.glass'),
                    n=12, thick=0.014, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Yusar Splice-Chirurgeon Biogel Loupe Band', 'head', 'yusar', [hb, loupe], covers_hair=False))

    gid_t = f'ysr_{sex}_surg_smock'
    smock_p = P('ysr_ceramic', 0.03, [
        B('bottom', 0.0, 0.06, 'circuit_schematic', 'ysr_biogel', 'ysr_carbon', 0.08),
        B('top', 0.0, 0.03, 'solid', 'ysr_biogel'),
    ], [PN(0.0, 1.0, 'ysr_biogel_trace', 'ysr_biogel', 'ysr_ceramic', 0.18)], fabric='cloth.cryo.elastomer')
    s_coat = torso_tube(f'{gid_t}_smock', core.TOP, core.KNEE + 0.02, 0.028, smock_p,
                        n=42, rows=20, hang_from=core.WAIST, flare=0.10)
    s_belt = belt_sash(f'{gid_t}_belt', core.WAIST - 0.02, core.WAIST + 0.03,
                       P('ysr_carbon', 0.03, [B('top', 0.0, 0.02, 'solid', 'ysr_biogel')]), ease=0.032)
    entries.append(assemble_garment(gid_t, 'Yusar Splice-Chirurgeon Biogel Smock', 'torso', 'yusar',
                                    [s_coat, sleeves(gid_t, 'wrist', 0.018, smock_p), s_belt]))

    gid_b = f'ysr_{sex}_surg_rig'
    pad, anc = _dorsal_pack_base(gid_b, P('ysr_ceramic', 0.03), clearance=0.031)
    vial_l = horn(f'{gid_b}_vialL', [anc + left * 0.05 - up * 0.08 + BACK_DIR * 0.014, anc + left * 0.05 + up * 0.09 + BACK_DIR * 0.014],
                  0.028, 0.026, P('ysr_biogel', 0.01, [B('top', 0.0, 0.03, 'solid', 'steel')], fabric='beads.glass'), n=12, rows=6, rigid_joint='Spine2')
    vial_r = horn(f'{gid_b}_vialR', [anc - left * 0.05 - up * 0.08 + BACK_DIR * 0.014, anc - left * 0.05 + up * 0.09 + BACK_DIR * 0.014],
                  0.028, 0.026, P('cybercyan', 0.01, [B('top', 0.0, 0.03, 'solid', 'steel')], fabric='beads.glass'), n=12, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Yusar Twin Biogel Perfusion Canister Rig', 'back', 'yusar', [pad, vial_l, vial_r]))

    # --- TIER 5: spek_stak_caller ---
    gid_h = f'ysr_{sex}_caller_headset'
    call_p = P('ysr_carbon', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'cybercyan')], fabric='metal.iron')
    ch_band = head_rings(f'{gid_h}_band', 0.60, 0.71, 0.004, call_p, n=36, rows=5)
    for sgn, tag in ((1.0, 'L'), (-1.0, 'R')):
        p_ear = _host_anchor(ch_band, a + (b - a) * 0.62 + left * (sgn * 0.09))
        ear_cup = rosette(f'{gid_h}_cup_{tag}', p_ear + left * (sgn * 0.004), left * sgn, fwd, 0.024,
                          P('amber', 0.02, [B('top', 0.0, 0.02, 'solid', 'cybercyan')], fabric='metal.iron'),
                          n=12, thick=0.014, rigid_joint='Head')
        if tag == 'L':
            cups = [ch_band, ear_cup]
        else:
            cups.append(ear_cup)
    entries.append(assemble_garment(gid_h, 'Spēk-Stak Cant-Caller Transceiver Band', 'head', 'yusar', cups, covers_hair=False))

    gid_t = f'ysr_{sex}_caller_vestment'
    vest_p = P('ysr_carbon', 0.03, [
        B('bottom', 0.0, 0.05, 'solid', 'cybercyan'),
        B('top', 0.0, 0.04, 'solid', 'amber'),
    ], [PN(0.0, 1.0, 'ysr_spek_waveform', 'amber', 'ysr_carbon', 0.16)], fabric=WOOL)
    cv_body = torso_tube(f'{gid_t}_tunic', core.TOP, core.WAIST - 0.035, 0.021, vest_p, n=40, rows=12)
    cv_disc = collar_disc(f'{gid_t}_collar', 0.085, P('ysr_ceramic', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'cybercyan')], fabric='metal.iron'),
                          drop=0.068, ease=0.022)
    entries.append(assemble_garment(gid_t, 'Spēk-Stak Acoustic-Waveform Tunic', 'torso', 'yusar',
                                    [cv_body, cv_disc, sleeves(gid_t, 'wrist', 0.018, vest_p)]))

    gid_b = f'ysr_{sex}_caller_hornpack'
    pad, anc = _dorsal_pack_base(gid_b, P('ysr_carbon', 0.03), clearance=0.025)
    bell_l = horn(f'{gid_b}_hornL', [anc + left * 0.055, anc + left * 0.095 + up * 0.18 + BACK_DIR * 0.03], 0.018, 0.042,
                  P('ysr_copper_coil', 0.02, [B('top', 0.0, 0.03, 'solid', 'cybercyan')], fabric='metal.bronze'), n=12, rows=6, rigid_joint='Spine2')
    bell_r = horn(f'{gid_b}_hornR', [anc - left * 0.055, anc - left * 0.095 + up * 0.18 + BACK_DIR * 0.03], 0.018, 0.042,
                  P('ysr_copper_coil', 0.02, [B('top', 0.0, 0.03, 'solid', 'amber')], fabric='metal.bronze'), n=12, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Spēk-Stak Twin Acoustic Relay Horns', 'back', 'yusar', [pad, bell_l, bell_r]))

    # --- TIER 6: relay_linesman ---
    gid_h = f'ysr_{sex}_line_helm'
    lh_p = P('amber', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'ysr_carbon')], fabric='metal.iron')
    lh_dome = _open_brow_dome(f'{gid_h}_casque', lh_p, f_brow=0.61, f_low=0.10, high=1.14, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Frontier Pylon-Linesman Dielectric Casque', 'head', 'yusar', [lh_dome], covers_hair=True))

    gid_t = f'ysr_{sex}_line_harness'
    lh_t_p = P('ysr_insulator', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'amber'),
    ], [PN(0.0, 1.0, 'ysr_ceramic_rib', 'amber', 'ysr_insulator', 0.18)], fabric='cloth.canvas.oiled')
    lt_body = torso_tube(f'{gid_t}_jerkin', core.TOP, core.WAIST - 0.035, 0.022, lh_t_p, n=40, rows=12)
    lt_sash = crossed_sash(f'{gid_t}_rigging', P('ysr_carbon', 0.04, [B('top', 0.0, 0.02, 'solid', 'amber')], fabric='rubber.tyre'),
                           width=0.068, ease=0.030)
    entries.append(assemble_garment(gid_t, 'Pylon-Linesman High-Tension Climbing Jerkin', 'torso', 'yusar',
                                    [lt_body, sleeves(gid_t, 'wrist', 0.018, lh_t_p), lt_sash]))

    gid_b = f'ysr_{sex}_line_coilpack'
    pad, anc = _dorsal_pack_base(gid_b, P('ysr_carbon', 0.04), clearance=0.026)
    coil_ring = rosette(f'{gid_b}_cablecoil', anc + BACK_DIR * 0.018, BACK_DIR, left, 0.095,
                        P('ysr_copper_coil', 0.03, [B('top', 0.0, 0.03, 'solid', 'amber')], fabric='metal.bronze'),
                        n=18, thick=0.028, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'High-Tension Braided Copper Tether Coil', 'back', 'yusar', [pad, coil_ring]))

    return entries


def _build_cyber_mystic_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    # --- TIER 7: lightkeeper ---
    gid_h = f'ysr_{sex}_lightkeeper_turban'
    turb_p = P('ysr_carbon', 0.03, [
        B('bottom', 0.0, 0.035, 'solid', 'neonyellow'),
        B('top', 0.0, 0.04, 'circuit_schematic', 'cybercyan', 'ysr_carbon', 0.08),
    ], [PN(0.0, 1.0, 'ysr_vacuum_grid', 'neonyellow', 'ysr_carbon', 0.16)], fabric=WOOL)
    tb = turban(f'{gid_h}_turban', turb_p, f0=0.58, f1=1.12, bulge=0.036, ease=0.016)
    fp_parts = _cyber_faceplate_with_optics(gid_h, P('ysr_carbon', 0.03, [B('top', 0.0, 0.03, 'solid', 'neonyellow')], fabric='metal.iron'),
                                            slit_col='neonyellow', bar_col='cybercyan')
    for sgn, tag, col_b in ((-1.0, 'R', 'neonyellow'), (1.0, 'L', 'cybercyan')):
        p_t = _host_anchor(tb, a + (b - a) * 0.84 + left * (sgn * 0.10))
        fp_parts.append(horn(f'{gid_h}_bulb_{tag}', [p_t, p_t + left * (sgn * 0.045) + up * 0.075], 0.020, 0.017,
                             P(col_b, 0.01, [B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='beads.glass'), n=10, rows=5, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Carcosa Light-Keeper Vacuum-Bulb Turban & Mask', 'head', 'yusar',
                                    [tb] + fp_parts, covers_hair=True, covers_face=True))

    gid_t = f'ysr_{sex}_lightkeeper_robe'
    lk_p = P('ysr_carbon', 0.03, [
        B('bottom', 0.0, 0.08, 'circuit_schematic', 'neonyellow', 'ysr_carbon', 0.08),
        B('top', 0.0, 0.05, 'solid', 'cybercyan'),
    ], [PN(0.0, 1.0, 'ysr_vacuum_grid', 'amber', 'ysr_carbon', 0.18)], fabric='cloth.canvas.oiled')
    lk_robe = torso_tube(f'{gid_t}_robe', core.TOP, core.ANKLE + 0.08, 0.028, lk_p, n=42, rows=24, hang_from=core.WAIST, flare=0.13)
    lk_sash = crossed_sash(f'{gid_t}_sash', P('ysr_carbon', 0.02, [B('top', 0.0, 0.025, 'solid', 'neonyellow')], fabric='metal.iron'),
                           width=0.070, ease=0.034)
    entries.append(assemble_garment(gid_t, 'Carcosa Light-Keeper Cathode-Filament Robe', 'torso', 'yusar',
                                    [lk_robe, sleeves(gid_t, 'wrist', 0.019, lk_p), lk_sash,
                                     pauldron(f'{gid_t}_pL', L, lk_p), pauldron(f'{gid_t}_pR', R, lk_p)]))

    gid_b = f'ysr_{sex}_lightkeeper_pack'
    pad, anc = _dorsal_pack_base(gid_b, P('ysr_carbon', 0.03), clearance=0.032)
    cath_c = horn(f'{gid_b}_cathode', [anc - up * 0.09 + BACK_DIR * 0.015, anc + up * 0.15 + BACK_DIR * 0.015], 0.034, 0.028,
                  P('neonyellow', 0.01, [B('bottom', 0.0, 0.04, 'solid', 'brass')], fabric='beads.glass'), n=12, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Carcosa Vacuum-Tube Capacitor Lantern Pack', 'back', 'yusar', [pad, cath_c]))

    # --- TIER 8: dronemaster ---
    gid_h = f'ysr_{sex}_dronemaster_helm'
    dm_p = P('ysr_carbon', 0.02, [
        B('bottom', 0.0, 0.04, 'solid', 'cybercyan'),
        B('top', 0.0, 0.04, 'solid', 'neonmagenta'),
    ], [PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'steel', 0.15)], fabric='metal.iron')
    dm_dome = _open_brow_dome(f'{gid_h}_pod', dm_p, f_brow=0.59, f_low=0.08, high=1.14, ease=0.018)
    dm_fp = _cyber_faceplate_with_optics(gid_h, dm_p, slit_col='neonmagenta', bar_col='cybercyan')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_ant = _host_anchor(dm_dome, a + (b - a) * 0.80 + left * (sgn * 0.10))
        dm_fp.append(horn(f'{gid_h}_ant_{tag}', [p_ant, p_ant + up * 0.11 + left * (sgn * 0.02)], 0.009, 0.003,
                          P('cybercyan', 0.01, fabric='metal.iron'), n=8, rows=5, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Henge Drone-Caller Multi-Lens Sensor Helm', 'head', 'yusar',
                                    [dm_dome] + dm_fp, covers_hair=True, covers_face=True))

    gid_t = f'ysr_{sex}_dronemaster_coat'
    dm_coat_p = P('ysr_carbon', 0.03, [
        B('bottom', 0.0, 0.07, 'circuit_schematic', 'cybercyan', 'ysr_carbon', 0.08),
    ], [PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'ysr_slate', 0.16)], fabric='cloth.canvas.oiled')
    dm_coat = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE - 0.02, 0.028, dm_coat_p, n=42, rows=21, hang_from=core.WAIST, flare=0.11)
    dm_col = collar(f'{gid_t}_col', dm_p, height=0.036, ease=0.024)
    entries.append(assemble_garment(gid_t, 'Henge Drone-Caller Telemetry Trenchcoat', 'torso', 'yusar',
                                    [dm_coat, dm_col, sleeves(gid_t, 'wrist', 0.019, dm_coat_p),
                                     pauldron(f'{gid_t}_pL', L, dm_p), pauldron(f'{gid_t}_pR', R, dm_p)]))

    gid_b = f'ysr_{sex}_dronemaster_rack'
    pad, anc = _dorsal_pack_base(gid_b, dm_p, pad_size=(0.20, 0.048, 0.22), clearance=0.032)
    rotor_l = rosette(f'{gid_b}_droneL', anc + left * 0.08 + up * 0.06 + BACK_DIR * 0.016, BACK_DIR, left, 0.052,
                      P('neonmagenta', 0.01, [B('top', 0.0, 0.02, 'solid', 'cybercyan')], fabric='metal.iron'), n=14, thick=0.016, rigid_joint='Spine2')
    rotor_r = rosette(f'{gid_b}_droneR', anc - left * 0.08 + up * 0.06 + BACK_DIR * 0.016, BACK_DIR, left, 0.052,
                      P('cybercyan', 0.01, [B('top', 0.0, 0.02, 'solid', 'neonmagenta')], fabric='metal.iron'), n=14, thick=0.016, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Henge Stowed Twin Rotor-Drone Cradle', 'back', 'yusar', [pad, rotor_l, rotor_r]))

    # --- TIER 9: electropriest ---
    gid_h = f'ysr_{sex}_electropriest_hood'
    ep_p = P('ysr_carbon', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'cybercyan'),
        B('top', 0.0, 0.04, 'solid', 'neonmagenta'),
    ], [PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'charcoal', 0.16)], fabric=WOOL)
    ep_hd = hood(f'{gid_h}_hood', ep_p, ease=0.026, ease_low=0.048, open_front=0.82, low=-0.30, rows=14, n=34, peak=0.09)
    ep_fp = _cyber_faceplate_with_optics(gid_h, P('ysr_carbon', 0.02, fabric='metal.iron'), slit_col='cybercyan', bar_col='neonmagenta')
    entries.append(assemble_garment(gid_h, 'Carcosa Electro-Priest Induction Cowl & Grille', 'head', 'yusar',
                                    [ep_hd] + ep_fp, covers_hair=True, covers_face=True))

    gid_t = f'ysr_{sex}_electropriest_robe'
    ep_robe = torso_tube(f'{gid_t}_cassock', core.TOP, core.ANKLE + 0.06, 0.028, ep_p, n=42, rows=24, hang_from=core.WAIST, flare=0.13)
    ep_ring = neck_ring(f'{gid_t}_induction_ring', P('steel', 0.02, [B('top', 0.0, 0.03, 'solid', 'cybercyan')], fabric='metal.iron'),
                        r_tube=0.042, drop=0.018, n=36, nr=10)
    entries.append(assemble_garment(gid_t, 'Carcosa Electro-Priest Induction-Ring Cassock', 'torso', 'yusar',
                                    [ep_robe, ep_ring, sleeves(gid_t, 'wrist', 0.019, ep_p)]))

    gid_b = f'ysr_{sex}_electropriest_coils'
    pad, anc = _dorsal_pack_base(gid_b, P('steel', 0.02, fabric='metal.iron'), clearance=0.032)
    halo_parts = [pad]
    for k, ang in enumerate(np.linspace(-0.65 * math.pi, 0.65 * math.pi, 5)):
        d_ray = left * math.sin(ang) + up * math.cos(ang)
        p0 = anc + BACK_DIR * 0.012
        halo_parts.append(horn(f'{gid_b}_tesla_{k}', [p0, p0 + d_ray * 0.19 + BACK_DIR * 0.01], 0.016, 0.006,
                               P('cybercyan' if k % 2 == 0 else 'neonmagenta', 0.01, fabric='beads.glass'),
                               n=8, rows=5, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_b, 'Carcosa Radial Tesla-Discharge Dorsal Ring', 'back', 'yusar', halo_parts))

    # --- TIER 10: electromonk ---
    gid_h = f'ysr_{sex}_electromonk_mask'
    em_dome = _open_brow_dome(f'{gid_h}_cranium', P('ysr_carbon', 0.02, fabric='metal.iron'), f_brow=0.60, f_low=0.06, high=1.14, ease=0.018)
    em_fp = _cyber_faceplate_with_optics(gid_h, P('ysr_carbon', 0.02, [B('top', 0.0, 0.03, 'solid', 'amber')], fabric='metal.iron'),
                                         slit_col='cybercyan', bar_col='amber')
    for sgn, tag, col_c in ((0.0, 'C', 'cybercyan'), (-1.0, 'R', 'amber'), (1.0, 'L', 'amber')):
        tgt = (a + (b - a) * 1.00) if sgn == 0.0 else (a + (b - a) * 0.72 + left * (sgn * 0.095))
        p_c = _host_anchor(em_dome, tgt)
        d_c = up if sgn == 0.0 else (left * sgn * 0.85 + up * 0.50)
        em_fp.append(horn(f'{gid_h}_cathode_{tag}', [p_c, p_c + d_c * 0.085], 0.019, 0.015,
                          P(col_c, 0.01, [B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='beads.glass'), n=10, rows=5, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Henge Electro-Monk Tri-Cathode Visage', 'head', 'yusar',
                                    [em_dome] + em_fp, covers_hair=True, covers_face=True))

    gid_t = f'ysr_{sex}_electromonk_harness'
    em_t_p = P('ysr_carbon', 0.02, [
        B('bottom', 0.0, 0.05, 'solid', 'cybercyan'),
        B('top', 0.0, 0.04, 'solid', 'neonmagenta'),
    ], [PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'ysr_carbon', 0.16)], fabric='metal.iron')
    em_body = torso_tube(f'{gid_t}_chassis', core.TOP, core.WAIST - 0.035, 0.019, em_t_p, n=38, rows=12)
    em_sash = crossed_sash(f'{gid_t}_conduits', P('neonmagenta', 0.02, [B('top', 0.0, 0.02, 'solid', 'cybercyan')], fabric='metal.iron'),
                           width=0.056, ease=0.027)
    entries.append(assemble_garment(gid_t, 'Henge Electro-Monk Live-Conduit Chassis', 'torso', 'yusar',
                                    [em_body, sleeves(gid_t, 'wrist', 0.017, em_t_p), em_sash]))

    gid_b = f'ysr_{sex}_electromonk_pack'
    pad, anc = _dorsal_pack_base(gid_b, em_t_p, clearance=0.024)
    bus_core = rosette(f'{gid_b}_capacitor', anc + BACK_DIR * 0.015, BACK_DIR, left, 0.072,
                       P('cybercyan', 0.01, [B('top', 0.0, 0.02, 'solid', 'amber')], fabric='beads.glass'),
                       n=16, thick=0.022, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Henge Live-Conduit Dorsal Capacitor Wheel', 'back', 'yusar', [pad, bus_core]))

    # --- TIER 11: corsair ---
    gid_h = f'ysr_{sex}_corsair_helm'
    cr_p = P('ysr_carbon', 0.02, [
        B('top', 0.0, 0.04, 'solid', 'neonmagenta'),
        B('bottom', 0.0, 0.03, 'solid', 'cybercyan'),
    ], [PN(0.0, 1.0, 'cyber_hex_neon', 'neonmagenta', 'ysr_carbon', 0.16)], fabric='metal.iron')
    cr_dome = _open_brow_dome(f'{gid_h}_casque', cr_p, f_brow=0.59, f_low=0.06, high=1.14, ease=0.018)
    cr_fp = _cyber_faceplate_with_optics(gid_h, cr_p, slit_col='neonmagenta', bar_col='cybercyan')
    entries.append(assemble_garment(gid_h, 'Carcosa Hive-Corsair Linked-Node Helm', 'head', 'yusar',
                                    [cr_dome] + cr_fp, covers_hair=True, covers_face=True))

    gid_t = f'ysr_{sex}_corsair_coat'
    cr_coat = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE - 0.02, 0.028, cr_p, n=42, rows=21, hang_from=core.WAIST, flare=0.11)
    cr_col = collar(f'{gid_t}_col', cr_p, height=0.036, ease=0.024)
    entries.append(assemble_garment(gid_t, 'Carcosa Hive-Corsair Armored Tech-Coat', 'torso', 'yusar',
                                    [cr_coat, cr_col, sleeves(gid_t, 'wrist', 0.019, cr_p),
                                     pauldron(f'{gid_t}_pL', L, cr_p), pauldron(f'{gid_t}_pR', R, cr_p)]))

    gid_b = f'ysr_{sex}_corsair_node'
    pad, anc = _dorsal_pack_base(gid_b, cr_p, clearance=0.032)
    fin_l = horn(f'{gid_b}_bladeL', [anc + left * 0.06, anc + left * 0.11 + up * 0.17 + BACK_DIR * 0.02], 0.022, 0.006,
                 P('neonmagenta', 0.01, fabric='metal.iron'), n=8, rows=5, rigid_joint='Spine2')
    fin_r = horn(f'{gid_b}_bladeR', [anc - left * 0.06, anc - left * 0.11 + up * 0.17 + BACK_DIR * 0.02], 0.022, 0.006,
                 P('cybercyan', 0.01, fabric='metal.iron'), n=8, rows=5, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Carcosa Hive-Link Transceiver Blades', 'back', 'yusar', [pad, fin_l, fin_r]))

    # --- TIER 12: hierophant ---
    gid_h = f'ysr_{sex}_hierophant_stack'
    hi_p = P('ysr_carbon', 0.02, [
        B('top', 0.0, 0.05, 'stripes', 'cybercyan', 'ysr_carbon', 0.02),
        B('bottom', 0.0, 0.04, 'stripes', 'amber', 'ysr_carbon', 0.02),
    ], [PN(0.08, 0.92, 'cyber_hex_neon', 'cybercyan', 'ysr_carbon', 0.14)], fabric='metal.iron')
    hi_tower = tower_hat(f'{gid_h}_monolith', 0.30, lambda s: 1.0 - 0.18 * s, hi_p, f=0.61, ease=0.014, rows=12, n=36)
    entries.append(assemble_garment(gid_h, 'Yusar Stack-Hierophant Memory-Tower Mitre', 'head', 'yusar', [hi_tower], covers_hair=True))

    gid_t = f'ysr_{sex}_hierophant_robe'
    hi_robe_p = P('ysr_carbon', 0.03, [
        B('bottom', 0.0, 0.10, 'circuit_schematic', 'cybercyan', 'ysr_carbon', 0.08),
        B('top', 0.0, 0.06, 'circuit_schematic', 'amber', 'cobalt', 0.08),
    ], [PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'cobalt', 0.16)], fabric='cloth.bazin.damask')
    hi_robe = torso_tube(f'{gid_t}_robe', core.TOP, core.ANKLE + 0.06, 0.029, hi_robe_p, n=44, rows=25, hang_from=core.WAIST, flare=0.14)
    hi_stole = tabard(f'{gid_t}_bus_stole', core.KNEE - 0.02, core.CHEST + 0.06,
                      P('ysr_carbon', 0.02, [B('bottom', 0.0, 0.05, 'solid', 'amber')],
                        [PN(0.05, 0.95, 'circuit_schematic', 'amber', 'ysr_carbon', 0.12)], fabric='metal.iron'),
                      width=0.16, front=True, back=False, ease=0.038)
    entries.append(assemble_garment(gid_t, 'Yusar Stack-Hierophant Server-Matrix Vestment', 'torso', 'yusar',
                                    [hi_robe, hi_stole, sleeves(gid_t, 'wrist', 0.020, hi_robe_p),
                                     pauldron(f'{gid_t}_pL', L, hi_p), pauldron(f'{gid_t}_pR', R, hi_p)]))

    gid_b = f'ysr_{sex}_hierophant_bus'
    pad, anc = _dorsal_pack_base(gid_b, hi_p, pad_size=(0.19, 0.048, 0.24), clearance=0.033)
    monolith_bk = blob(f'{gid_b}_tower', anc + up * 0.05 + BACK_DIR * 0.020, (0.15, 0.045, 0.28), hi_p,
                       n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Stack-Hierophant Dorsal Memory-Blade Rack', 'back', 'yusar', [pad, monolith_bk]))

    return entries


def _outfits_for_sex(sex):
    return {
        'carcosa_scavenger': {
            'head': f'ysr_{sex}_scav_cap',
            'torso': f'ysr_{sex}_scav_jacket',
            'gloves': f'ysr_{sex}_terminal_bracers',
            'legs': f'ysr_{sex}_conduit_trousers',
            'feet': f'ysr_{sex}_insulator_boots',
            'back': f'ysr_{sex}_scav_pack',
        },
        'henge_kiln_worker': {
            'head': f'ysr_{sex}_kiln_visor',
            'torso': f'ysr_{sex}_kiln_apron',
            'gloves': f'ysr_{sex}_insulator_gauntlets',
            'legs': f'ysr_{sex}_kiln_breeches',
            'feet': f'ysr_{sex}_insulator_boots',
            'back': f'ysr_{sex}_kiln_rack',
        },
        'carcosa_citizen': {
            'head': f'ysr_{sex}_cit_beret',
            'torso': f'ysr_{sex}_cit_coat',
            'gloves': f'ysr_{sex}_terminal_bracers',
            'legs': f'ysr_{sex}_arcology_slacks',
            'feet': f'ysr_{sex}_terrace_boots',
            'back': f'ysr_{sex}_cit_satchel',
        },
        'cyber_surgeon': {
            'head': f'ysr_{sex}_surg_loupe',
            'torso': f'ysr_{sex}_surg_smock',
            'gloves': f'ysr_{sex}_splice_gloves',
            'legs': f'ysr_{sex}_arcology_slacks',
            'feet': f'ysr_{sex}_terrace_boots',
            'back': f'ysr_{sex}_surg_rig',
        },
        'spek_stak_caller': {
            'head': f'ysr_{sex}_caller_headset',
            'torso': f'ysr_{sex}_caller_vestment',
            'gloves': f'ysr_{sex}_terminal_bracers',
            'legs': f'ysr_{sex}_conduit_trousers',
            'feet': f'ysr_{sex}_terrace_boots',
            'back': f'ysr_{sex}_caller_hornpack',
        },
        'relay_linesman': {
            'head': f'ysr_{sex}_line_helm',
            'torso': f'ysr_{sex}_line_harness',
            'gloves': f'ysr_{sex}_insulator_gauntlets',
            'legs': f'ysr_{sex}_kiln_breeches',
            'feet': f'ysr_{sex}_insulator_boots',
            'back': f'ysr_{sex}_line_coilpack',
        },
        'lightkeeper': {
            'head': f'ysr_{sex}_lightkeeper_turban',
            'torso': f'ysr_{sex}_lightkeeper_robe',
            'gloves': f'ysr_{sex}_terminal_bracers',
            'legs': f'ysr_{sex}_conduit_trousers',
            'feet': f'ysr_{sex}_insulator_boots',
            'back': f'ysr_{sex}_lightkeeper_pack',
        },
        'dronemaster': {
            'head': f'ysr_{sex}_dronemaster_helm',
            'torso': f'ysr_{sex}_dronemaster_coat',
            'gloves': f'ysr_{sex}_node_gauntlets',
            'legs': f'ysr_{sex}_conduit_trousers',
            'feet': f'ysr_{sex}_cyber_greaves',
            'back': f'ysr_{sex}_dronemaster_rack',
        },
        'electropriest': {
            'head': f'ysr_{sex}_electropriest_hood',
            'torso': f'ysr_{sex}_electropriest_robe',
            'gloves': f'ysr_{sex}_node_gauntlets',
            'legs': f'ysr_{sex}_conduit_trousers',
            'feet': f'ysr_{sex}_insulator_boots',
            'back': f'ysr_{sex}_electropriest_coils',
        },
        'electromonk': {
            'head': f'ysr_{sex}_electromonk_mask',
            'torso': f'ysr_{sex}_electromonk_harness',
            'gloves': f'ysr_{sex}_terminal_bracers',
            'legs': f'ysr_{sex}_conduit_trousers',
            'feet': f'ysr_{sex}_cyber_greaves',
            'back': f'ysr_{sex}_electromonk_pack',
        },
        'corsair': {
            'head': f'ysr_{sex}_corsair_helm',
            'torso': f'ysr_{sex}_corsair_coat',
            'gloves': f'ysr_{sex}_node_gauntlets',
            'legs': f'ysr_{sex}_corsair_pants',
            'feet': f'ysr_{sex}_cyber_greaves',
            'back': f'ysr_{sex}_corsair_node',
        },
        'hierophant': {
            'head': f'ysr_{sex}_hierophant_stack',
            'torso': f'ysr_{sex}_hierophant_robe',
            'gloves': f'ysr_{sex}_node_gauntlets',
            'legs': f'ysr_{sex}_arcology_slacks',
            'feet': f'ysr_{sex}_cyber_greaves',
            'back': f'ysr_{sex}_hierophant_bus',
        },
        'crescent_vigilant': {
            'head': f'yusar_{sex}_crescent_vigilant_hat',
            'torso': f'yusar_{sex}_crescent_vigilant_cloak',
            'gloves': f'yusar_{sex}_crescent_vigilant_bracers',
            'legs': f'yusar_{sex}_crescent_vigilant_trousers',
            'feet': f'yusar_{sex}_crescent_vigilant_boots',
            'beard': None,
            'hair': None,
            'type': 'important_npc',
        },
    }


def build_yusar_peoples_entry():
    return {
        'id': 'yusar',
        'name': 'Yusar (Carcosa & Henge)',
        'note': (
            "Cybernetics tribe inhabiting the ruined arcologies of Carcosa and Henge along the Eternal State frontier, "
            "speaking an avoidance dialect of swapped compounds ('Spēk-Stak') and maintaining vacuum-tube, ceramic-insulator, "
            "induction-coil, biogel-splice, drone-sensor, and server-stack tech (LORE.md §6.19)."
        ),
        'ancestry': {'african': [0.10, 0.35], 'asian': [0.35, 0.65], 'caucasian': [0.20, 0.50]},
        'skin': ['#d8b496', '#be926e', '#9e7250'],
        'hair': ['#14110f', '#241d18', '#3a2e25'],
        'eyes': ['#2a1a10', '#4a3520', '#5a6a70'],
        'grey': 0.50,
        'beard': 0.30,
        'styles': {
            'male': ['short02', 'Dreads_with_Fade', 'Low_Fade', 'Short_Hair_B'],
            'female': ['bob02', 'short03', 'braid01', 'toigo_blunt_bob_with_bangs'],
        },
        'tiers': YUSAR_TIER_SHARES,
        'tier_labels': YUSAR_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_yusar_full_kit():
    entries = []
    with _ysr_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_shared_lowers_and_gloves(sex))
            entries.extend(_build_civilian_tiers(sex))
            entries.extend(_build_cyber_mystic_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_yusar_full_kit()
    peoples_entry = build_yusar_peoples_entry()
    manifest_path = CULTURES_DIR / 'yusar_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'yusar',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Yusar pieces ({n_m} male, {n_f} female) across 13 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
