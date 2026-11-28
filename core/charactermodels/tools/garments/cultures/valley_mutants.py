"""Cross-Cutting Dungeon Mutants, Feral Ghouls, Drowned Spawn & Anomaly Cultists (`valley_mutants`).

Builds all 8 M+F paired Biogel Mutant, Spore-Husk, Feral Ghoul, Drowned Spawn & Anomaly Cultist
tiers (`mpfb_male` `mut_m_*` & `mpfb_female` `mut_f_*`):

  1. `biogel_vat_brute`      (`0.16`) — Ruptured Biogel Vat-Graft Brute (`Blade` / `Valley` Bio-Labs)
  2. `spore_husk_shambler`   (`0.15`) — Mycelial Shelf-Fungus Spore-Husk Shambler (`Mungo` / Karst)
  3. `valley_feral_ghoul`    (`0.16`) — Ancient's Valley Desiccated Radiation Feral Ghoul
  4. `tethis_drowned_spawn`  (`0.12`) — `Tethis` Barnacle-Crusted Abyssal Drowned Spawn
  5. `call_starlight_zealot` (`0.12`) — *The Call* (`RC-6`) Starlight-Antenna Zealot
  6. `stilled_ground_touched`(`0.10`) — Entropy-Bleached *Stilled-Ground* Calcified Husk
  7. `rogue_ai_techcultist`  (`0.10`) — Rogue Lab-AI Cyclopean Wire-Halo Tech-Cultist
  8. `ordinator_sun_heretic` (`0.09`) — Defaced Inverted-Plate Eclipse Sun-Heretic

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/valley_mutants.py
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
from garments.paint import P, B, PN, C, WOOL, COTTON
from garments.types.torso import (
    torso_tube, collar_disc, tabard, crossed_sash, pauldron, neck_ring,
)
from garments.types.limbs import sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_landmarks_exact, sculpted_faceplate, conical_hat, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, tube, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

FULL_HEAD_HIDE_PARTS = [
    'Human.lips',
    'Human.ears',
    'Human.eyebrow001',
    'Human.eyebrow002',
    'Human.eyelashes01',
    'Human.eyelashes02',
    'Human.low-poly',
]

# Scoped Linear RGB Palette (`mut_*`)
MUT_COLORS = {
    'mut_biogel_lime':   (0.240, 0.940, 0.380),  # Luminous amniotic biogel green
    'mut_biogel_dark':   (0.055, 0.225, 0.115),  # Coagulated vat-sludge green
    'mut_graft_bone':    (0.760, 0.720, 0.610),  # Calcified vat-graft osteoderm
    'mut_spore_cap':     (0.460, 0.135, 0.285),  # Shelf-polypore fruiting cap magenta-plum
    'mut_spore_gill':    (0.160, 0.840, 0.760),  # Bioluminescent cave-fungus gill cyan-teal
    'mut_mycelium_rot':  (0.235, 0.255, 0.185),  # Cordyceps-rotted moss-canvas
    'mut_ghoul_ash':     (0.390, 0.345, 0.295),  # Desiccated rad-scorched bandage linen
    'mut_rad_lesion':    (0.950, 0.360, 0.060),  # Glowing isotope burn-lesion amber-orange
    'mut_drowned_kelp':  (0.065, 0.165, 0.145),  # Waterlogged abyssal kelp-green
    'mut_barnacle_grey': (0.585, 0.595, 0.565),  # Razor-barnacle & bleached coral crust
    'mut_abyss_lure':    (0.180, 0.680, 0.960),  # Tethis deep-trench bioluminescent blue
    'mut_call_indigo':   (0.045, 0.055, 0.195),  # RC-6 Starlight-Call midnight robe
    'mut_call_star':     (0.780, 0.860, 1.000),  # Cold orbital signal starlight silver-blue
    'mut_stilled_chalk': (0.855, 0.855, 0.865),  # Entropy-calcified monochrome Stilled white
    'mut_stilled_ash':   (0.465, 0.468, 0.478),  # Colourless Stilled-ground vitrified grey
    'mut_ai_crimson':    (0.880, 0.065, 0.085),  # Rogue Lab-AI ocular laser crimson
    'mut_ai_chassis':    (0.115, 0.120, 0.135),  # Server-crypt dark synth-gunmetal
    'mut_heretic_ash':   (0.165, 0.115, 0.175),  # Defaced soot-rubbed Vothic purple-ash
    'mut_heretic_emerald':(0.035, 0.155, 0.115), # Scorched tarnished Ordinator green
    'mut_void_slit':     (0.015, 0.015, 0.020),  # Hollow dark mask eye-aperture
}
for _k, _v in MUT_COLORS.items():
    C.setdefault(_k, _v)

VALLEY_MUTANTS_TIER_SHARES = [
    ['biogel_vat_brute', 0.16],
    ['spore_husk_shambler', 0.15],
    ['valley_feral_ghoul', 0.16],
    ['tethis_drowned_spawn', 0.12],
    ['call_starlight_zealot', 0.12],
    ['stilled_ground_touched', 0.10],
    ['rogue_ai_techcultist', 0.10],
    ['ordinator_sun_heretic', 0.09],
]

VALLEY_MUTANTS_TIER_LABELS = {
    'biogel_vat_brute': 'Ruptured Biogel Vat-Graft Brute',
    'spore_husk_shambler': 'Mycelial Shelf-Fungus Spore-Husk Shambler',
    'valley_feral_ghoul': 'Ancient\'s Valley Desiccated Feral Ghoul',
    'tethis_drowned_spawn': 'Tethis Barnacle-Crusted Drowned Spawn',
    'call_starlight_zealot': 'The Call (RC-6) Starlight-Antenna Zealot',
    'stilled_ground_touched': 'Entropy-Bleached Stilled-Ground Husk',
    'rogue_ai_techcultist': 'Rogue Lab-AI Wire-Halo Tech-Cultist',
    'ordinator_sun_heretic': 'Defaced Inverted-Plate Sun-Heretic',
}

MUT_CUSTOM_MOTIFS = {
    'mut_biogel_veins',
    'mut_mycelium_web',
    'mut_barnacle_encrust',
    'mut_call_signal',
    'mut_stilled_fracture',
    'mut_ai_bus_trace',
    'mut_eclipse_defaced',
}


def _mut_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'mut_biogel_veins':
        # Pulsing green amniotic nutrient veins & calcified graft seams
        vein = np.abs(np.sin(u * 2.0 * math.pi * 5.0 + 1.4 * np.sin(v * 11.0))) < 0.12
        node = np.hypot(((u * 4.0) % 1.0) - 0.5, ((v * 4.0) % 1.0) - 0.5) < 0.16
        img[vein] = 0.55 * np.asarray(bg) + 0.45 * np.asarray(fg)
        img[node] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'mut_mycelium_web':
        # Branching bioluminescent hyphae & polypore concentric spore rings
        su = (u * 4.0) % 1.0 - 0.5
        sv = (v * 4.0) % 1.0 - 0.5
        rad = np.hypot(su, sv)
        ring = (np.abs(rad - 0.34) < 0.05) | (np.abs(rad - 0.20) < 0.04)
        hypha = np.abs(np.cos(u * 21.0 - v * 15.0) * np.sin(u * 13.0 + v * 19.0)) < 0.08
        img[hypha] = C['mut_spore_cap']
        img[ring] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'mut_barnacle_encrust':
        # Clustered white-grey calcareous barnacle craters over sodden abyssal kelp-cloth
        bu = (u * 7.0) % 1.0 - 0.5
        bv = (v * 7.0) % 1.0 - 0.5
        r_b = np.hypot(bu, bv)
        shell = (r_b > 0.14) & (r_b < 0.34)
        pit = r_b <= 0.14
        img[shell] = fg
        img[pit] = C['mut_void_slit']
        return np.clip(img, 0.0, 1.0)

    if style == 'mut_call_signal':
        # RC-6 orbital harmonic sine-waves & 8-point starlight nodes on midnight indigo
        w1 = np.abs(v - (0.35 + 0.12 * np.sin(u * 2.0 * math.pi * 6.0))) < 0.025
        w2 = np.abs(v - (0.68 + 0.10 * np.cos(u * 2.0 * math.pi * 8.0))) < 0.022
        star = (np.hypot(((u * 6.0) % 1.0) - 0.5, ((v * 4.0) % 1.0) - 0.5) < 0.10)
        img[w1 | w2] = C['copper']
        img[star] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'mut_stilled_fracture':
        # Monochrome entropy-bleached crackle lines across calcified ash-alabaster cloth
        crk = np.abs(np.sin(u * 17.0 + 1.8 * np.cos(v * 13.0))) < 0.07
        grad = 0.86 + 0.14 * v
        img[:] = np.asarray(bg)[None, None, :] * grad[:, :, None]
        img[crk] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'mut_ai_bus_trace':
        # Orthogonal crimson-and-gold server bus traces on dark gunmetal synth-weave
        tu = np.abs(((u * 12.0) % 1.0) - 0.5) < 0.06
        tv = (((v * 8.0) % 1.0) < 0.08) & (((u * 6.0) % 1.0) < 0.65)
        pad = np.hypot(((u * 12.0) % 1.0) - 0.5, ((v * 8.0) % 1.0) - 0.5) < 0.12
        img[tu | tv] = fg
        img[pad] = C['gold']
        return np.clip(img, 0.0, 1.0)

    if style == 'mut_eclipse_defaced':
        # Inverted bleeding black-eclipse ring & slash-defaced Vothic heresy plate
        su = (u * 3.0) % 1.0 - 0.5
        sv = (v * 3.0) % 1.0 - 0.5
        r_e = np.hypot(su, sv)
        corona = (r_e >= 0.24) & (r_e <= 0.33)
        umb = r_e < 0.24
        slash = np.abs(su + sv * 0.85) < 0.045
        img[corona | slash] = fg
        img[umb] = C['mut_void_slit']
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def _mut_motif_ctx():
    orig = paint_mod.motif

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in MUT_CUSTOM_MOTIFS:
            return _mut_motif(style, w, h, fg, bg, aspect=aspect)
        return orig(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched
    try:
        yield
    finally:
        paint_mod.motif = orig


# ===========================================================================================================
# SHARED GEOMETRY HELPERS (PROUD CULTIST/MUTANT FACEPLATES & FLUSH DORSAL GROWTHS)
# ===========================================================================================================
def _nearest_pt(pts_flat, target):
    t = np.asarray(target, dtype=np.float64)
    idx = int(np.argmin(np.linalg.norm(pts_flat - t, axis=1)))
    return pts_flat[idx].copy()


def _dorsal_pad(gid, pad_paint, z_off=-0.01, pad_size=(0.18, 0.044, 0.22), clearance=0.018):
    c_sp = spine_at(core.CHEST + z_off)
    anc = surface_out(c_sp, BACK_DIR, clearance, bvh=core.BVH_T)
    pad = blob(f'{gid}_pad', anc, pad_size, pad_paint, n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, anc


def _open_brow_bowl(name, paint, f_low=0.06, f_brow=0.62, high=1.14, ease=0.018, rows=12, n=36):
    a, b, up, bk, left = head_frame()
    high_eff = max(float(high), 1.13)
    ease_eff = max(float(ease), 0.018)
    angles = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angles]
    f_rim = np.full(n, f_low, dtype=np.float64)
    half_span = 0.56 * math.pi
    for j, an in enumerate(angles):
        af = abs(an - math.pi)
        if af < half_span:
            w = 0.5 + 0.5 * math.cos(math.pi * af / half_span)
            f_rim[j] = f_low + (f_brow - f_low) * (w ** 0.78)
    # Sample equator radii ONCE at f=0.56 to prevent double-taper skull poke-through (Tips §7.2)
    c_eq = a + (b - a) * 0.56
    r_eq = np.array([(float(first_hit(c_eq, d) or 0.096) + ease_eff) for d in ds], dtype=np.float64)
    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for i in range(rows):
        u = i / float(rows - 1)
        for j, d in enumerate(ds):
            f_ij = float(f_rim[j]) + (high_eff - float(f_rim[j])) * u
            c_pos = a + (b - a) * f_ij
            if u > 0.55:
                ut = (u - 0.55) / 0.45
                r_prof = float(r_eq[j]) * math.sqrt(max(0.0, 1.0 - ut ** 2.1))
            else:
                r_prof = float(r_eq[j]) * (1.0 + 0.024 * math.sin(u / 0.55 * math.pi))
            if f_ij <= 0.96:
                c_ray = a + (b - a) * max(f_ij, 0.16)
                h_hit = first_hit(c_ray, d)
                if h_hit is not None:
                    r_prof = max(r_prof, float(h_hit) + ease_eff)
            Q[i, j] = c_pos + d * max(r_prof, 0.004)
    apex = a + (b - a) * high_eff + up * 0.010
    if float(np.dot(apex - b, up)) < 0.028:
        apex = b + up * 0.028
    Q[-1] = apex + (Q[-1] - apex) * 0.05
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _cultist_or_mutant_mask(gid, cowl_paint, face_paint, bar_paint, eye_paint, mode='slits'):
    """Closed hood/helm + sculpted faceplate with proud +4.5mm eye-slits/cyclopean optic + brow/nasal bars."""
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    fwd = -bk
    bowl = _open_brow_bowl(f'{gid}_cowl', cowl_paint, f_low=-0.02, f_brow=0.62, high=1.14, ease=0.018)
    face = sculpted_faceplate(f'{gid}_faceplate', face_paint, f_top=0.76, f_bot=-0.05, ease=0.015,
                              brow_relief=0.013, nose_relief=0.019, chin_relief=0.010)
    parts = [bowl, face]
    fp_flat = face.P.reshape(-1, 3)
    bw_flat = bowl.P.reshape(-1, 3)

    # Brow & nasal framing bars (+4.5mm proud of faceplate)
    b_l = _nearest_pt(fp_flat, a + (b - a) * f_brow + left * 0.056 + fwd * 0.10)
    b_m = _nearest_pt(fp_flat, a + (b - a) * (f_brow + 0.01) + fwd * 0.115)
    b_r = _nearest_pt(fp_flat, a + (b - a) * f_brow - left * 0.056 + fwd * 0.10)
    parts.append(tube(f'{gid}_brow_bar', [b_r + fwd * 0.0045, b_m + fwd * 0.0050, b_l + fwd * 0.0045],
                      0.0055, bar_paint, n=8, rigid_joint='Head'))

    n_top = _nearest_pt(fp_flat, a + (b - a) * f_brow + fwd * 0.115)
    n_mid = _nearest_pt(fp_flat, a + (b - a) * f_nose + fwd * 0.125)
    n_bot = _nearest_pt(fp_flat, a + (b - a) * 0.08 + fwd * 0.110)
    parts.append(tube(f'{gid}_nasal_bar', [n_top + fwd * 0.0045, n_mid + fwd * 0.0050, n_bot + fwd * 0.0045],
                      0.0052, bar_paint, n=8, rigid_joint='Head'))

    if mode == 'cyclops':
        # Single central blazing rogue-AI ocular bezel + dark outer socket
        p_cyc = _nearest_pt(fp_flat, a + (b - a) * f_eyes + fwd * 0.12)
        parts.append(rosette(f'{gid}_bezel', p_cyc + fwd * 0.0045, fwd, left, 0.028,
                             P('mut_void_slit', 0.02, fabric='metal.iron'), n=14, thick=0.010, rigid_joint='Head'))
        parts.append(rosette(f'{gid}_optic', p_cyc + fwd * 0.0075, fwd, left, 0.016,
                             eye_paint, n=12, thick=0.008, rigid_joint='Head'))
    else:
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            p_in = _nearest_pt(fp_flat, a + (b - a) * f_eyes + left * (sgn * (x_eye * 0.52)) + fwd * 0.11)
            p_out = _nearest_pt(fp_flat, a + (b - a) * f_eyes + left * (sgn * (x_eye * 1.48)) + fwd * 0.10)
            parts.append(tube(f'{gid}_eyeslit_{tag}', [p_in + fwd * 0.0045, p_out + fwd * 0.0045],
                              0.0055, eye_paint, n=8, rigid_joint='Head'))

    if mode == 'vat_intubation':
        p_mth = _nearest_pt(fp_flat, a + (b - a) * 0.12 + fwd * 0.115)
        parts.append(horn(f'{gid}_feed_tube', [p_mth - fwd * 0.002, p_mth + fwd * 0.046 - up * 0.036],
                          0.022, 0.016, eye_paint, n=10, rows=6, rigid_joint='Head'))
    elif mode == 'call_aerials':
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            p_ant = _nearest_pt(bw_flat, a + (b - a) * 0.90 + left * (sgn * 0.072))
            parts.append(horn(f'{gid}_aerial_{tag}',
                              [p_ant - up * 0.003, p_ant + up * 0.13 + left * (sgn * 0.030)],
                              0.011, 0.004, bar_paint, n=8, rows=6, rigid_joint='Head'))
    elif mode == 'broken_horns':
        # Shattered asymmetric heretic horn stumps
        p_hl = _nearest_pt(bw_flat, a + (b - a) * 0.88 + left * 0.072)
        p_hr = _nearest_pt(bw_flat, a + (b - a) * 0.88 - left * 0.072)
        parts.append(horn(f'{gid}_stump_L', [p_hl - up * 0.003, p_hl + up * 0.045 + left * 0.022],
                          0.018, 0.014, bar_paint, n=8, rows=5, rigid_joint='Head'))
        parts.append(horn(f'{gid}_stump_R', [p_hr - up * 0.003, p_hr + up * 0.085 - left * 0.030],
                          0.018, 0.006, bar_paint, n=8, rows=5, rigid_joint='Head'))
    return parts


def _bare_or_bandeau_torso(gid_t, sex, bandeau_paint, extra_parts):
    if sex == 'f':
        bandeau = torso_tube(f'{gid_t}_bandeau', core.CHEST + 0.052, core.CHEST - 0.058, 0.016,
                             bandeau_paint, n=38, rows=7)
        return [bandeau] + list(extra_parts)
    return list(extra_parts)


# ===========================================================================================================
# 8 VALLEY MUTANTS, GHOULS, DROWNED SPAWN & CULTIST TIERS (`mut_{s}_*`)
# ===========================================================================================================
def _build_valley_mutants_tiers(sex):
    entries = []
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    fwd = -bk

    void_p = P('mut_void_slit', 0.02, fabric='metal.iron')

    # -------------------------------------------------------------------------------------------------------
    # 1. biogel_vat_brute — Ruptured Biogel Vat-Graft Brute (`Blade` / `Valley` Bio-Labs)
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'mut_{sex}_vat_intubation_helm'
    graft_p = P('mut_graft_bone', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'mut_biogel_dark'),
    ], [PN(0.0, 1.0, 'mut_biogel_veins', 'mut_biogel_lime', 'mut_graft_bone', 0.18)], fabric='armor.biogel.vat')
    gel_glow = P('mut_biogel_lime', 0.02, [B('top', 0.0, 0.02, 'solid', 'mut_biogel_dark')],
                 fabric='armor.biogel.vat')
    vb_head = _cultist_or_mutant_mask(gid_h, graft_p, graft_p, P('iron', 0.04, fabric='metal.iron'),
                                      gel_glow, mode='vat_intubation')
    e_vb = assemble_garment(gid_h, 'Calcified Vat-Graft Skullcap & Biogel Intubation Mask', 'head',
                            'valley_mutants', vb_head, covers_hair=True, covers_face=True)
    e_vb['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_vb)

    gid_t = f'mut_{sex}_vat_graft_carapace'
    vb_col = neck_ring(f'{gid_t}_vat_collar', P('iron', 0.04, fabric='metal.iron'), r_tube=0.024, drop=0.012, n=32, nr=8)
    vb_sash = crossed_sash(f'{gid_t}_biogel_conduit',
                           P('mut_biogel_dark', 0.04, [B('top', 0.0, 0.02, 'solid', 'mut_biogel_lime')],
                             fabric='armor.biogel.vat'),
                           width=0.068, ease=0.023)
    vb_pL = pauldron(f'{gid_t}_osteoderm_L', L, graft_p, ease=0.012)
    vb_belt = belt_sash(f'{gid_t}_restraint_clamp', core.WAIST - 0.014, core.WAIST + 0.030,
                        P('iron', 0.04, fabric='metal.iron'), ease=0.020)
    vb_port = rosette(f'{gid_t}_chest_valve',
                      _nearest_pt(vb_sash.P.reshape(-1, 3), chest_front(core.CHEST + 0.02, 0.016)),
                      np.array([0.0, -1.0, 0.0]), left, 0.034, gel_glow, n=12, thick=0.014, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Calcified Osteoderm Shoulder-Graft & Glowing Biogel Valve Harness', 'torso', 'valley_mutants',
        _bare_or_bandeau_torso(gid_t, sex, P('mut_biogel_dark', 0.05, fabric='hide.gut'),
                               [vb_col, vb_sash, vb_pL, vb_belt, vb_port]),
        open_torso=True,
    ))

    gid_g = f'mut_{sex}_vat_bone_clamps'
    entries.append(assemble_garment(
        gid_g, 'Hypertrophied Bone-Graft & Vat-Clamp Claws', 'gloves', 'valley_mutants',
        full_gloves(gid_g, P('iron', 0.04, fabric='metal.iron'), graft_p, knuckle_paint=gel_glow),
    ))

    gid_l = f'mut_{sex}_vat_shredded_kilt'
    vat_rag_p = P('mut_biogel_dark', 0.06, [
        B('bottom', 0.0, 0.06, 'rays', 'mut_biogel_lime', 'mut_biogel_dark', 0.03),
    ], [PN(0.0, 1.0, 'mut_biogel_veins', 'mut_biogel_lime', 'mut_biogel_dark', 0.20)], fabric='armor.biogel.vat')
    entries.append(assemble_garment(
        gid_l, 'Ruptured Vat-Membrane & Restraint-Strap Kilt', 'legs', 'valley_mutants',
        [torso_tube(f'{gid_l}_kilt', core.WAIST - 0.044, core.KNEE + 0.05, 0.023, vat_rag_p,
                    n=38, rows=13, hang_from=core.WAIST - 0.044, flare=0.075, jagged=0.05)],
        legged=False,
    ))

    gid_f = f'mut_{sex}_vat_ankle_irons'
    entries.append(assemble_garment(
        gid_f, 'Snapped Vat-Stanchion Iron Ankle-Shackles', 'feet', 'valley_mutants',
        sandal(gid_f, P('mut_biogel_dark', 0.06), P('iron', 0.04, fabric='metal.iron'), laces=2),
    ))

    gid_b = f'mut_{sex}_vat_spine_tank'
    pad, anc = _dorsal_pad(gid_b, graft_p, clearance=0.018)
    vtank = horn(f'{gid_b}_biogel_cylinder',
                 [anc - up * 0.13 + BACK_DIR * 0.022, anc + up * 0.15 + BACK_DIR * 0.024],
                 0.064, 0.058, gel_glow, n=14, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Ruptured Glowing Biogel Dorsal Spine-Cylinder', 'back',
                                    'valley_mutants', [pad, vtank]))

    # -------------------------------------------------------------------------------------------------------
    # 2. spore_husk_shambler — Mycelial Shelf-Fungus Spore-Husk Shambler (`Mungo` / Karst)
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'mut_{sex}_spore_polypore_crown'
    sp_cap_p = P('mut_spore_cap', 0.05, [
        B('bottom', 0.0, 0.06, 'rays', 'mut_spore_gill', 'mut_spore_cap', 0.025),
    ], [PN(0.0, 1.0, 'mut_mycelium_web', 'mut_spore_gill', 'mut_spore_cap', 0.18)], fabric='skin.amphibian.warty_toad')
    fcap = conical_hat(f'{gid_h}_fruiting_cap', sp_cap_p, f_base=0.64, f_top=1.22, r_base=0.28, rows=10, n=36)
    fc_flat = fcap.P.reshape(-1, 3)
    sh_l = blob(f'{gid_h}_shelf_L', _nearest_pt(fc_flat, a + (b - a) * 0.85 + left * 0.12), (0.095, 0.055, 0.036),
                P('mut_spore_gill', 0.04), n=10, rows=5, out=left, rigid_joint='Head')
    sh_r = blob(f'{gid_h}_shelf_R', _nearest_pt(fc_flat, a + (b - a) * 0.92 - left * 0.11), (0.085, 0.050, 0.032),
                P('mut_spore_gill', 0.04), n=10, rows=5, out=-left, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Tiered Bioluminescent Polypore Fruiting-Cap Crown', 'head',
                                    'valley_mutants', [fcap, sh_l, sh_r], covers_hair=True))

    gid_t = f'mut_{sex}_spore_mycelium_tunic'
    myc_p = P('mut_mycelium_rot', 0.06, [
        B('bottom', 0.0, 0.05, 'solid', 'mut_spore_cap'),
    ], [PN(0.0, 1.0, 'mut_mycelium_web', 'mut_spore_gill', 'mut_mycelium_rot', 0.20)], fabric='cloth.weave.burlap')
    sp_tun = torso_tube(f'{gid_t}_rotted_tunic', core.TOP, core.WAIST - 0.036, 0.021, myc_p, n=40, rows=12)
    sp_yoke = collar_disc(f'{gid_t}_fungal_ruff', 0.145, sp_cap_p, drop=0.105, scallop=0.07, ease=0.023)
    entries.append(assemble_garment(
        gid_t, 'Cordyceps-Colonized Delver Tunic & Polypore Shelf-Ruff', 'torso', 'valley_mutants',
        [sp_tun, sp_yoke, sleeves(gid_t, 'wrist', 0.018, myc_p)],
    ))

    gid_g = f'mut_{sex}_spore_hyphae_claws'
    entries.append(assemble_garment(
        gid_g, 'Mycelial-Hyphae Encrusted Shambler Hands', 'gloves', 'valley_mutants',
        full_gloves(gid_g, sp_cap_p, myc_p, finger_paint=P('mut_spore_gill', 0.04)),
    ))

    gid_l = f'mut_{sex}_spore_rotted_trousers'
    entries.append(assemble_garment(
        gid_l, 'Spore-Mottled Rotted Canvas Delver Trousers', 'legs', 'valley_mutants',
        trousers(gid_l, myc_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'mut_{sex}_spore_root_boots'
    entries.append(assemble_garment(
        gid_f, 'Rhizome-Bound Karst Bog Boots', 'feet', 'valley_mutants',
        boots(gid_f, P('bark', 0.07), sp_cap_p, top=0.40, ease_top=0.026),
    ))

    gid_b = f'mut_{sex}_spore_pustule_cluster'
    pad, anc = _dorsal_pad(gid_b, sp_cap_p, clearance=0.018)
    sac1 = blob(f'{gid_b}_spore_sac_main', anc + up * 0.03 + BACK_DIR * 0.024, (0.20, 0.085, 0.22),
                P('mut_spore_gill', 0.03, [B('top', 0.0, 0.04, 'solid', 'mut_spore_cap')]),
                n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    sac2 = blob(f'{gid_b}_spore_sac_low', anc - up * 0.09 + left * 0.05 + BACK_DIR * 0.022, (0.12, 0.065, 0.12),
                sp_cap_p, n=10, rows=5, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Bloated Bioluminescent Dorsal Spore-Sac Cluster', 'back',
                                    'valley_mutants', [pad, sac1, sac2]))

    # -------------------------------------------------------------------------------------------------------
    # 3. valley_feral_ghoul — Ancient's Valley Desiccated Radiation Feral Ghoul
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'mut_{sex}_ghoul_bandage_goggles'
    gh_rag = P('mut_ghoul_ash', 0.07, [B('bottom', 0.0, 0.04, 'solid', 'soot')], fabric='cloth.weave.burlap')
    gh_cowl = _open_brow_bowl(f'{gid_h}_bandages', gh_rag, f_low=0.08, f_brow=0.63, high=1.14, ease=0.018)
    gc_flat = gh_cowl.P.reshape(-1, 3)
    gh_parts = [gh_cowl]
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_gg = _nearest_pt(gc_flat, a + (b - a) * 0.66 + left * (sgn * 0.038) + fwd * 0.10)
        gh_parts.append(rosette(f'{gid_h}_cracked_goggle_{tag}', p_gg + fwd * 0.004, fwd, left, 0.020,
                                P('mut_rad_lesion', 0.03, [B('top', 0.0, 0.02, 'solid', 'rust')]),
                                n=10, thick=0.009, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Scorched Rad-Burn Head-Wraps & Cracked Salvage Goggles', 'head',
                                    'valley_mutants', gh_parts, covers_hair=True))

    gid_t = f'mut_{sex}_ghoul_rebar_harness'
    rust_c = P('rust', 0.06, [B('top', 0.0, 0.02, 'solid', 'soot')], fabric='metal.iron')
    gh_sash = crossed_sash(f'{gid_t}_cable_strap', rust_c, width=0.056, ease=0.021)
    gh_belt = belt_sash(f'{gid_t}_scrap_belt', core.WAIST - 0.014, core.WAIST + 0.026, rust_c, ease=0.018)
    gh_nod = blob(f'{gid_t}_rad_blister',
                  _nearest_pt(gh_sash.P.reshape(-1, 3), chest_front(core.CHEST + 0.03, 0.015)),
                  (0.046, 0.020, 0.046),
                  P('mut_rad_lesion', 0.03, fabric='glass.moonglass.leaded'), n=10, rows=5, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Corroded Vault-Cable Harness & Isotope Lesion Scar', 'torso', 'valley_mutants',
        _bare_or_bandeau_torso(gid_t, sex, gh_rag, [gh_sash, gh_belt, gh_nod]),
        open_torso=True,
    ))

    gid_g = f'mut_{sex}_ghoul_rag_talons'
    entries.append(assemble_garment(
        gid_g, 'Scorched Rag-Wrapped Feral Ghoul Hands', 'gloves', 'valley_mutants',
        full_gloves(gid_g, gh_rag, P('soot', 0.06, fabric='leather.buckskin')),
    ))

    gid_l = f'mut_{sex}_ghoul_vault_tatters'
    gh_k_p = P('mut_ghoul_ash', 0.07, [
        B('bottom', 0.0, 0.06, 'solid', 'soot'),
        B('top', 0.0, 0.04, 'solid', 'mut_rad_lesion'),
    ], fabric='cloth.weave.burlap')
    entries.append(assemble_garment(
        gid_l, 'Shredded Rad-Scorched Vault Jumpsuit Tatters', 'legs', 'valley_mutants',
        [torso_tube(f'{gid_l}_tatters', core.WAIST - 0.044, core.KNEE + 0.05, 0.024, gh_k_p,
                    n=38, rows=13, hang_from=core.WAIST - 0.044, flare=0.075, jagged=0.06)],
        legged=False,
    ))

    gid_f = f'mut_{sex}_ghoul_foot_rags'
    entries.append(assemble_garment(
        gid_f, 'Tattered Ash-Stained Foot-Wraps', 'feet', 'valley_mutants',
        sandal(gid_f, P('soot', 0.07), gh_rag, laces=2),
    ))

    gid_b = f'mut_{sex}_ghoul_vent_brace'
    pad, anc = _dorsal_pad(gid_b, rust_c, clearance=0.018)
    grille = blob(f'{gid_b}_vent_louvre', anc + BACK_DIR * 0.022, (0.17, 0.055, 0.23),
                  P('rust', 0.06, [B('top', 0.0, 0.04, 'stripes', 'soot', 'mut_rad_lesion', 0.025)],
                    fabric='armor.salvage.tread_plate'),
                  n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Rusted Vault-Ventilation Spine-Brace', 'back',
                                    'valley_mutants', [pad, grille]))

    # -------------------------------------------------------------------------------------------------------
    # 4. tethis_drowned_spawn — `Tethis` Barnacle-Crusted Abyssal Drowned Spawn
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'mut_{sex}_drowned_barnacle_helm'
    barn_p = P('mut_drowned_kelp', 0.06, [
        B('bottom', 0.0, 0.04, 'solid', 'verdigris'),
    ], [PN(0.0, 1.0, 'mut_barnacle_encrust', 'mut_barnacle_grey', 'mut_drowned_kelp', 0.18)],
       fabric='armor.salvage.ark_barnacle')
    dr_dome = _open_brow_bowl(f'{gid_h}_skull_crust', barn_p, f_low=0.06, f_brow=0.62, high=1.14, ease=0.018)
    dd_flat = dr_dome.P.reshape(-1, 3)
    lure_pt = _nearest_pt(dd_flat, a + (b - a) * 0.96 + fwd * 0.07)
    lure = horn(f'{gid_h}_angler_illicium',
                [lure_pt - up * 0.003, lure_pt + up * 0.075 + fwd * 0.055, lure_pt + up * 0.045 + fwd * 0.095],
                0.012, 0.016, P('mut_abyss_lure', 0.02, fabric='glass.moonglass.leaded'),
                n=10, rows=6, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Barnacle-Encrusted Diver Collar & Bioluminescent Esca-Lure', 'head',
                                    'valley_mutants', [dr_dome, lure], covers_hair=True))

    gid_t = f'mut_{sex}_drowned_kelp_carapace'
    dr_col = neck_ring(f'{gid_t}_corselet_ring', P('verdigris', 0.05, fabric='metal.bronze.verdigris'),
                       r_tube=0.024, drop=0.012, n=32, nr=8)
    dr_sash = crossed_sash(f'{gid_t}_kelp_net', barn_p, width=0.070, ease=0.023)
    dr_pR = pauldron(f'{gid_t}_barnacle_pauldron_R', R, barn_p, ease=0.012)
    dr_belt = belt_sash(f'{gid_t}_lead_girdle', core.WAIST - 0.014, core.WAIST + 0.028,
                        P('verdigris', 0.05, fabric='metal.bronze.verdigris'), ease=0.019)
    entries.append(assemble_garment(
        gid_t, 'Razor-Barnacle Shoulder Crust & Sodden Kelp Rigging', 'torso', 'valley_mutants',
        _bare_or_bandeau_torso(gid_t, sex, P('mut_drowned_kelp', 0.06, fabric='cloth.seaweed'),
                               [dr_col, dr_sash, dr_pR, dr_belt]),
        open_torso=True,
    ))

    gid_g = f'mut_{sex}_drowned_coral_claws'
    entries.append(assemble_garment(
        gid_g, 'Barnacle-Spined Abyssal Spawn Gauntlets', 'gloves', 'valley_mutants',
        full_gloves(gid_g, barn_p, P('mut_drowned_kelp', 0.06, fabric='cloth.seaweed'),
                    knuckle_paint=P('mut_barnacle_grey', 0.05, fabric='armor.salvage.ark_barnacle')),
    ))

    gid_l = f'mut_{sex}_drowned_seaweed_kilt'
    kelp_k_p = P('mut_drowned_kelp', 0.06, [
        B('bottom', 0.0, 0.06, 'rays', 'mut_abyss_lure', 'mut_drowned_kelp', 0.03),
    ], [PN(0.0, 1.0, 'mut_barnacle_encrust', 'mut_barnacle_grey', 'mut_drowned_kelp', 0.20)],
       fabric='cloth.seaweed')
    entries.append(assemble_garment(
        gid_l, 'Waterlogged Kelp-Frond & Rotted Sailcloth Kilt', 'legs', 'valley_mutants',
        [torso_tube(f'{gid_l}_kilt', core.WAIST - 0.044, core.KNEE + 0.03, 0.023, kelp_k_p,
                    n=40, rows=14, hang_from=core.WAIST - 0.044, flare=0.080, jagged=0.06)],
        legged=False,
    ))

    gid_f = f'mut_{sex}_drowned_reef_sandals'
    entries.append(assemble_garment(
        gid_f, 'Barnacle-Crusted Lead-Strap Reef Sandals', 'feet', 'valley_mutants',
        sandal(gid_f, P('verdigris', 0.05), P('mut_barnacle_grey', 0.05), laces=2),
    ))

    gid_b = f'mut_{sex}_drowned_ship_timber'
    pad, anc = _dorsal_pad(gid_b, barn_p, clearance=0.018)
    capstan = horn(f'{gid_b}_wreck_post',
                   [anc - up * 0.13 + BACK_DIR * 0.022, anc + up * 0.17 + BACK_DIR * 0.024],
                   0.054, 0.046, barn_p, n=12, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Encrusted Tethis Wreck-Timber & Coral Spine-Post', 'back',
                                    'valley_mutants', [pad, capstan]))

    # -------------------------------------------------------------------------------------------------------
    # 5. call_starlight_zealot — *The Call* (`RC-6`) Starlight-Antenna Zealot
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'mut_{sex}_call_aerial_mask'
    call_p = P('mut_call_indigo', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'mut_call_star'),
    ], [PN(0.0, 1.0, 'mut_call_signal', 'mut_call_star', 'mut_call_indigo', 0.20)], fabric='cloth.silk.shot')
    cop_wire = P('copper', 0.03, fabric='metal.bronze')
    cz_head = _cultist_or_mutant_mask(
        gid_h, call_p, P('silver', 0.02, fabric='metal.steel.brushed'), cop_wire,
        P('mut_call_star', 0.02, fabric='glass.moonglass.leaded'), mode='call_aerials',
    )
    e_cz = assemble_garment(gid_h, 'RC-6 Mirror-Dish Visor & Twin Copper Tuning-Fork Aerials', 'head',
                            'valley_mutants', cz_head, covers_hair=True, covers_face=True)
    e_cz['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_cz)

    gid_t = f'mut_{sex}_call_harmonic_robe'
    cz_robe = torso_tube(f'{gid_t}_robe', core.TOP, core.KNEE - 0.02, 0.034, call_p,
                         n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    cz_coil = collar_disc(f'{gid_t}_copper_coil_yoke', 0.135, cop_wire, drop=0.100, scallop=0.04, ease=0.023)
    cz_star = rosette(f'{gid_t}_signal_astrolabe', chest_front(core.CHEST + 0.02, 0.039), np.array([0.0, -1.0, 0.0]), left,
                      0.034, P('mut_call_star', 0.02, [B('top', 0.0, 0.02, 'solid', 'copper')], fabric='armor.biogel.vat'),
                      n=14, thick=0.012, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Starlight-Harmonic Midnight Robe & Copper Resonance Yoke', 'torso', 'valley_mutants',
        [cz_robe, cz_coil, sleeves(gid_t, 'wrist', 0.019, call_p), cz_star],
    ))

    gid_g = f'mut_{sex}_call_wire_gloves'
    entries.append(assemble_garment(
        gid_g, 'Copper-Coil Wound RC-6 Receiver Gloves', 'gloves', 'valley_mutants',
        full_gloves(gid_g, cop_wire, call_p),
    ))

    gid_l = f'mut_{sex}_call_indigo_trousers'
    entries.append(assemble_garment(
        gid_l, 'Midnight-Indigo Signal-Cult Trousers', 'legs', 'valley_mutants',
        trousers(gid_l, call_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'mut_{sex}_call_felt_boots'
    entries.append(assemble_garment(
        gid_f, 'Muffled Felt Observatory-Zealot Boots', 'feet', 'valley_mutants',
        boots(gid_f, P('soot', 0.07), P('mut_call_indigo', 0.05, fabric='cloth.felt.boiled'),
              top=0.40, ease_top=0.026, cuff_paint=cop_wire),
    ))

    gid_b = f'mut_{sex}_call_parabolic_dish'
    pad, anc = _dorsal_pad(gid_b, call_p, clearance=0.018)
    dish = rosette(f'{gid_b}_receiver_dish', anc + up * 0.05 + BACK_DIR * 0.024, BACK_DIR, left, 0.165,
                   P('copper', 0.03, [B('top', 0.0, 0.04, 'solid', 'mut_call_star')], fabric='metal.bronze'),
                   n=20, thick=0.024, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Parabolic Copper-Mesh Starlight Signal Dish', 'back',
                                    'valley_mutants', [pad, dish]))

    # -------------------------------------------------------------------------------------------------------
    # 6. stilled_ground_touched — Entropy-Bleached *Stilled-Ground* Calcified Husk
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'mut_{sex}_stilled_calcified_veil'
    stl_p = P('mut_stilled_chalk', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'mut_stilled_ash'),
    ], [PN(0.0, 1.0, 'mut_stilled_fracture', 'mut_stilled_ash', 'mut_stilled_chalk', 0.20)],
       fabric='cloth.cotton.muslin')
    ash_bar = P('mut_stilled_ash', 0.04, fabric='glass.moonglass.leaded')
    st_head = _cultist_or_mutant_mask(gid_h, stl_p, stl_p, ash_bar, void_p, mode='slits')
    e_st = assemble_garment(gid_h, 'Vitrified Chalk-White Stilled-Ground Blind-Mask', 'head',
                            'valley_mutants', st_head, covers_hair=True, covers_face=True)
    e_st['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_st)

    gid_t = f'mut_{sex}_stilled_shroud_tunic'
    st_shroud = torso_tube(f'{gid_t}_shroud', core.TOP, core.KNEE - 0.02, 0.033, stl_p,
                           n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    st_col = collar_disc(f'{gid_t}_salt_crust_yoke', 0.140, ash_bar, drop=0.105, scallop=0.06, ease=0.023)
    entries.append(assemble_garment(
        gid_t, 'Entropy-Bleached Monochrome Calcified Shroud-Robe', 'torso', 'valley_mutants',
        [st_shroud, st_col, sleeves(gid_t, 'wrist', 0.019, stl_p)],
    ))

    gid_g = f'mut_{sex}_stilled_chalk_hands'
    entries.append(assemble_garment(
        gid_g, 'Petrified Salt-Ash Husk Hand-Sheaths', 'gloves', 'valley_mutants',
        full_gloves(gid_g, ash_bar, stl_p),
    ))

    gid_l = f'mut_{sex}_stilled_ash_leggings'
    entries.append(assemble_garment(
        gid_l, 'Colourless Calcified Stilled-Zone Leggings', 'legs', 'valley_mutants',
        trousers(gid_l, P('mut_stilled_ash', 0.05, fabric=COTTON),
                 cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'mut_{sex}_stilled_salt_boots'
    entries.append(assemble_garment(
        gid_f, 'Vitrified Salt-Crust Husk Boots', 'feet', 'valley_mutants',
        boots(gid_f, P('mut_stilled_ash', 0.06), stl_p, top=0.40, ease_top=0.026),
    ))

    gid_b = f'mut_{sex}_stilled_shard_spire'
    pad, anc = _dorsal_pad(gid_b, stl_p, clearance=0.018)
    sh1 = horn(f'{gid_b}_salt_spire_C', [anc - up * 0.08 + BACK_DIR * 0.020, anc + up * 0.20 + BACK_DIR * 0.034],
               0.042, 0.008, ash_bar, n=8, rows=6, rigid_joint='Spine2')
    sh2 = horn(f'{gid_b}_salt_spire_L', [anc + left * 0.055 - up * 0.04 + BACK_DIR * 0.020,
                                         anc + left * 0.095 + up * 0.14 + BACK_DIR * 0.030],
               0.030, 0.006, stl_p, n=8, rows=5, rigid_joint='Spine2')
    sh3 = horn(f'{gid_b}_salt_spire_R', [anc - left * 0.055 - up * 0.04 + BACK_DIR * 0.020,
                                         anc - left * 0.095 + up * 0.14 + BACK_DIR * 0.030],
               0.030, 0.006, stl_p, n=8, rows=5, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Frozen Monochrome Salt-Glass Dorsal Spires', 'back',
                                    'valley_mutants', [pad, sh1, sh2, sh3]))

    # -------------------------------------------------------------------------------------------------------
    # 7. rogue_ai_techcultist — Rogue Lab-AI Cyclopean Wire-Halo Tech-Cultist
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'mut_{sex}_techcult_cyclops_cowl'
    ai_p = P('mut_ai_chassis', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'mut_ai_crimson'),
    ], [PN(0.0, 1.0, 'mut_ai_bus_trace', 'mut_ai_crimson', 'mut_ai_chassis', 0.18)],
       fabric='armor.ancient.hex_weave')
    ai_red = P('mut_ai_crimson', 0.02, fabric='glass.moonglass.leaded')
    ai_gold = P('gold', 0.02, fabric='metal.gold')
    tc_head = _cultist_or_mutant_mask(gid_h, ai_p, P('mut_ai_chassis', 0.03, fabric='metal.steel.brushed'),
                                      ai_gold, ai_red, mode='cyclops')
    e_tc = assemble_garment(gid_h, 'Server-Crypt Cowl & Cyclopean Crimson AI-Optic Mask', 'head',
                            'valley_mutants', tc_head, covers_hair=True, covers_face=True)
    e_tc['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_tc)

    gid_t = f'mut_{sex}_techcult_bus_vestment'
    tc_robe = torso_tube(f'{gid_t}_vestment', core.TOP, core.KNEE + 0.01, 0.034, ai_p,
                         n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    tc_stole = tabard(f'{gid_t}_ribbon_bus_stole', core.KNEE + 0.02, core.TOP - 0.01,
                      P('mut_ai_crimson', 0.03, [B('bottom', 0.0, 0.05, 'stripes', 'gold', 'mut_ai_chassis', 0.02)],
                        fabric='cloth.silk'),
                      width=0.17, front=True, back=False, ease=0.038)
    tc_eye = rosette(f'{gid_t}_core_node', chest_front(core.CHEST + 0.03, 0.042), np.array([0.0, -1.0, 0.0]), left,
                     0.032, ai_red, n=14, thick=0.012, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Gold-Pin Ribbon-Cable Vestment & Rogue-AI Core Pectoral', 'torso', 'valley_mutants',
        [tc_robe, sleeves(gid_t, 'wrist', 0.019, ai_p), tc_stole, tc_eye],
    ))

    gid_g = f'mut_{sex}_techcult_datagloves'
    entries.append(assemble_garment(
        gid_g, 'Gold-Pin Neural-Jack Server Datagloves', 'gloves', 'valley_mutants',
        full_gloves(gid_g, ai_gold, ai_p, knuckle_paint=ai_red),
    ))

    gid_l = f'mut_{sex}_techcult_conduit_pants'
    entries.append(assemble_garment(
        gid_l, 'Braided-Conduit Synth-Weave Crypt Trousers', 'legs', 'valley_mutants',
        trousers(gid_l, ai_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'mut_{sex}_techcult_crypt_boots'
    entries.append(assemble_garment(
        gid_f, 'Dielectric Rubber Server-Crypt Boots', 'feet', 'valley_mutants',
        boots(gid_f, P('soot', 0.06, fabric='rubber.tyre'), ai_p, top=0.40, ease_top=0.026, cuff_paint=ai_gold),
    ))

    gid_b = f'mut_{sex}_techcult_wire_halo_pack'
    pad, anc = _dorsal_pad(gid_b, ai_p, clearance=0.018)
    hsink = rosette(f'{gid_b}_server_fan_ring', anc + up * 0.05 + BACK_DIR * 0.024, BACK_DIR, left, 0.155,
                    P('mut_ai_chassis', 0.03, [B('top', 0.0, 0.04, 'dentils', 'gold', 'mut_ai_crimson', 0.025)],
                      fabric='metal.steel.brushed'),
                    n=18, thick=0.024, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Salvaged Server Heatsink & Fiber-Optic Ring-Rig', 'back',
                                    'valley_mutants', [pad, hsink]))

    # -------------------------------------------------------------------------------------------------------
    # 8. ordinator_sun_heretic — Defaced Inverted-Plate Eclipse Sun-Heretic
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'mut_{sex}_heretic_defaced_helm'
    her_p = P('mut_heretic_ash', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'crimson'),
    ], [PN(0.0, 1.0, 'mut_eclipse_defaced', 'crimson', 'mut_heretic_ash', 0.22)],
       fabric='armor.lamellar.chitin')
    tarn_brz = P('mut_heretic_emerald', 0.04, [B('top', 0.0, 0.03, 'solid', 'bronze')], fabric='metal.bronze.verdigris')
    hr_head = _cultist_or_mutant_mask(gid_h, her_p, tarn_brz, P('bronze', 0.03, fabric='metal.bronze'),
                                      P('crimson', 0.03, fabric='metal.iron'), mode='broken_horns')
    e_hr = assemble_garment(gid_h, 'Shattered-Horn Defaced Chitin Eclipse-Heretic Mask', 'head',
                            'valley_mutants', hr_head, covers_hair=True, covers_face=True)
    e_hr['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_hr)

    gid_t = f'mut_{sex}_heretic_inverted_cuirass'
    hr_robe = torso_tube(f'{gid_t}_apostate_robe', core.TOP, core.KNEE + 0.01, 0.034, her_p,
                         n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    hr_cuir = torso_tube(f'{gid_t}_inverted_plate', core.CHEST + 0.06, core.WAIST - 0.035, 0.040, tarn_brz, n=42, rows=10)
    hr_col = neck_ring(f'{gid_t}_snapped_shackle', P('iron', 0.04, fabric='metal.iron'), r_tube=0.022, drop=0.012, n=32, nr=8)
    hr_ecl = rosette(f'{gid_t}_black_eclipse', chest_front(core.CHEST + 0.02, 0.046), np.array([0.0, -1.0, 0.0]), left,
                     0.040, P('mut_void_slit', 0.02, [B('top', 0.0, 0.02, 'solid', 'crimson')], fabric='metal.iron'),
                     n=14, thick=0.012, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Inverted Tarnished Temple Plate & Bleeding-Eclipse Apostate Robe', 'torso', 'valley_mutants',
        [hr_robe, hr_col, sleeves(gid_t, 'wrist', 0.019, her_p), hr_cuir,
         pauldron(f'{gid_t}_pL', L, tarn_brz), pauldron(f'{gid_t}_pR', R, tarn_brz), hr_ecl],
    ))

    gid_g = f'mut_{sex}_heretic_scorched_vambraces'
    entries.append(assemble_garment(
        gid_g, 'Ash-Blackened Temple Vambrace Gauntlets', 'gloves', 'valley_mutants',
        full_gloves(gid_g, tarn_brz, P('soot', 0.05, fabric='leather.cuir_bouilli'),
                    knuckle_paint=P('crimson', 0.03, fabric='metal.bronze')),
    ))

    gid_l = f'mut_{sex}_heretic_ash_trousers'
    entries.append(assemble_garment(
        gid_l, 'Caldera-Soot Apostate Breeches', 'legs', 'valley_mutants',
        trousers(gid_l, P('soot', 0.05, fabric='cloth.wool.fulled'),
                 cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'mut_{sex}_heretic_greave_boots'
    entries.append(assemble_garment(
        gid_f, 'Defaced Bronze-Greave Apostate Boots', 'feet', 'valley_mutants',
        boots(gid_f, P('soot', 0.08), tarn_brz, top=0.43, ease_top=0.026, cuff_paint=P('crimson', 0.04)),
    ))

    gid_b = f'mut_{sex}_heretic_eclipse_icon'
    pad, anc = _dorsal_pad(gid_b, tarn_brz, clearance=0.018)
    icon_board = blob(f'{gid_b}_shrine_slab', anc + up * 0.03 + BACK_DIR * 0.024, (0.20, 0.046, 0.27),
                      her_p, n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Slash-Defaced Inverted Sun-Shrine Dorsal Icon', 'back',
                                    'valley_mutants', [pad, icon_board]))

    return entries


def _outfits_for_sex(sex):
    return {
        'biogel_vat_brute': {
            'head': f'mut_{sex}_vat_intubation_helm',
            'torso': f'mut_{sex}_vat_graft_carapace',
            'gloves': f'mut_{sex}_vat_bone_clamps',
            'legs': f'mut_{sex}_vat_shredded_kilt',
            'feet': f'mut_{sex}_vat_ankle_irons',
            'back': f'mut_{sex}_vat_spine_tank',
        },
        'spore_husk_shambler': {
            'head': f'mut_{sex}_spore_polypore_crown',
            'torso': f'mut_{sex}_spore_mycelium_tunic',
            'gloves': f'mut_{sex}_spore_hyphae_claws',
            'legs': f'mut_{sex}_spore_rotted_trousers',
            'feet': f'mut_{sex}_spore_root_boots',
            'back': f'mut_{sex}_spore_pustule_cluster',
        },
        'valley_feral_ghoul': {
            'head': f'mut_{sex}_ghoul_bandage_goggles',
            'torso': f'mut_{sex}_ghoul_rebar_harness',
            'gloves': f'mut_{sex}_ghoul_rag_talons',
            'legs': f'mut_{sex}_ghoul_vault_tatters',
            'feet': f'mut_{sex}_ghoul_foot_rags',
            'back': f'mut_{sex}_ghoul_vent_brace',
        },
        'tethis_drowned_spawn': {
            'head': f'mut_{sex}_drowned_barnacle_helm',
            'torso': f'mut_{sex}_drowned_kelp_carapace',
            'gloves': f'mut_{sex}_drowned_coral_claws',
            'legs': f'mut_{sex}_drowned_seaweed_kilt',
            'feet': f'mut_{sex}_drowned_reef_sandals',
            'back': f'mut_{sex}_drowned_ship_timber',
        },
        'call_starlight_zealot': {
            'head': f'mut_{sex}_call_aerial_mask',
            'torso': f'mut_{sex}_call_harmonic_robe',
            'gloves': f'mut_{sex}_call_wire_gloves',
            'legs': f'mut_{sex}_call_indigo_trousers',
            'feet': f'mut_{sex}_call_felt_boots',
            'back': f'mut_{sex}_call_parabolic_dish',
        },
        'stilled_ground_touched': {
            'head': f'mut_{sex}_stilled_calcified_veil',
            'torso': f'mut_{sex}_stilled_shroud_tunic',
            'gloves': f'mut_{sex}_stilled_chalk_hands',
            'legs': f'mut_{sex}_stilled_ash_leggings',
            'feet': f'mut_{sex}_stilled_salt_boots',
            'back': f'mut_{sex}_stilled_shard_spire',
        },
        'rogue_ai_techcultist': {
            'head': f'mut_{sex}_techcult_cyclops_cowl',
            'torso': f'mut_{sex}_techcult_bus_vestment',
            'gloves': f'mut_{sex}_techcult_datagloves',
            'legs': f'mut_{sex}_techcult_conduit_pants',
            'feet': f'mut_{sex}_techcult_crypt_boots',
            'back': f'mut_{sex}_techcult_wire_halo_pack',
        },
        'ordinator_sun_heretic': {
            'head': f'mut_{sex}_heretic_defaced_helm',
            'torso': f'mut_{sex}_heretic_inverted_cuirass',
            'gloves': f'mut_{sex}_heretic_scorched_vambraces',
            'legs': f'mut_{sex}_heretic_ash_trousers',
            'feet': f'mut_{sex}_heretic_greave_boots',
            'back': f'mut_{sex}_heretic_eclipse_icon',
        },
    }


def build_valley_mutants_peoples_entry():
    return {
        'id': 'valley_mutants',
        'name': 'Ruin Mutants, Ghouls & Anomaly Cultists',
        'note': (
            "Dungeon aberrations, bio-vat escapees, and forbidden-signal cultists haunting Ancient ruins, "
            "karst caves, and dead-zones: ruptured biogel vat-brutes, polypore spore-husk shamblers, "
            "Ancient's Valley radiation ghouls, Tethis barnacle-drowned spawn, RC-6 Starlight-Call zealots, "
            "entropy-calcified Stilled-Ground husks, rogue Lab-AI wire-cultists, and defaced eclipse sun-heretics."
        ),
        'ancestry': {'african': [0.15, 0.40], 'asian': [0.25, 0.55], 'caucasian': [0.15, 0.45]},
        'skin': ['#9da39a', '#86827a', '#6e6a63', '#57534e'],
        'hair': ['#181615', '#2e2b28', '#524e4a', '#8c8a86'],
        'eyes': ['#8c2a1c', '#2a7a6e', '#7a8a94', '#3b2818'],
        'grey': 0.35,
        'beard': 0.25,
        'styles': {
            'male': ['cortu_short_messy_hair', 'long01', 'punkduck_alpha7_long', 'short02', 'spiky'],
            'female': ['long01', 'o4saken_long01', 'punkduck_alpha7_curly', 'short03', 'bob02'],
        },
        'tiers': VALLEY_MUTANTS_TIER_SHARES,
        'tier_labels': VALLEY_MUTANTS_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_valley_mutants_kit():
    entries = []
    with _mut_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_valley_mutants_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_valley_mutants_kit()
    peoples_entry = build_valley_mutants_peoples_entry()
    manifest_path = CULTURES_DIR / 'valley_mutants_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'valley_mutants',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Valley Mutants & Cultists pieces ({n_m} male, {n_f} female) across 8 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
