"""Cross-Cutting Captives, Slaves, Arena Gladiators & Manhunters Wardrobe Kit (`captives_and_arena`).

Builds all 10 M+F paired Captive, Thrall, Gladiator & Manhunter tiers (`mpfb_male` `cap_m_*` &
`mpfb_female` `cap_f_*`) across Voth's `74,000` enslaved castes (`Blïtrit` blood-reed cutters,
`Nazar` quarry chain-gangs, Solstice sun-altar captives), maritime galley oar-thralls, `Span` &
`Drum` (*Cauldron*) & `Iziz` (*Arena Hill*) gladiators, coffle slave-catchers, and chartered
warrant bounty-hunters:

  1. `blitrit_plantation_thrall` (`0.18`) — Shim *Blïtrit* Blood-Reed Plantation Thrall
  2. `nazar_salvage_chaingang`   (`0.16`) — Nazar Ruin-Quarry Salvage Chain-Gang Convict
  3. `solstice_altar_captive`    (`0.08`) — Painted & Garlanded Solstice Sun-Altar Captive
  4. `galley_oar_thrall`         (`0.12`) — Ring Sea & Almua Chitin-Bireme Galley Oar-Thrall
  5. `span_bone_myrmillo`        (`0.09`) — Span Mound-Arena Megafauna-Bone & Copper Myrmillo
  6. `drum_cauldron_pitfighter`  (`0.09`) — Drum *Cauldron* Arcology Scrap-Iron Pitfighter
  7. `arena_retiarius_netter`    (`0.08`) — Arena Hill *Galerus* & Weighted-Net Retiarius
  8. `arena_champion`            (`0.05`) — Undefeated Gilded-Cassid & Laurel Arena Champion
  9. `slave_catcher`             (`0.08`) — Borderlands Coffle-Whip & Man-Catcher Tracker
 10. `licensed_bounty_hunter`    (`0.07`) — Chartered Seal-Warrant Bounty Hunter & Bailiff

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/captives_and_arena.py
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
    torso_tube, collar, collar_disc, cape, tabard, crossed_sash, pauldron, neck_ring,
)
from garments.types.armor import (
    cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_landmarks_exact, head_rings, sculpted_faceplate, conical_hat, brim, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, pouch_belt, tube, rosette,
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

# Scoped Linear RGB Palette (`cap_*`)
CAP_COLORS = {
    'cap_blitrit':      (0.165, 0.018, 0.085),  # Shim purple-crimson blood-reed sap stain
    'cap_blitrit_hi':   (0.340, 0.042, 0.145),  # Fresh crushed Blïtrit sap
    'cap_hemp':         (0.560, 0.505, 0.395),  # Unbleached coarse slave sackcloth hemp
    'cap_slag_ash':     (0.335, 0.325, 0.310),  # Nazar quarry concrete-slag dust
    'cap_fetter_iron':  (0.105, 0.108, 0.116),  # Hammered black-iron shackle metal
    'cap_rust_chain':   (0.320, 0.125, 0.055),  # Salt-and-sweat corroded chain rust
    'cap_altar_chalk':  (0.885, 0.865, 0.815),  # Solstice sacrificial chalk-linen
    'cap_marigold':     (0.860, 0.420, 0.028),  # Sacrificial cempasúchil / marigold garland gold-orange
    'cap_sacred_red':   (0.580, 0.035, 0.035),  # Sacrificial heart-ochre crimson
    'cap_tar_canvas':   (0.155, 0.140, 0.120),  # Bilge-and-pitch stained galley canvas
    'cap_span_bone':    (0.815, 0.765, 0.635),  # Polished Span megafauna femur-plate
    'cap_span_copper':  (0.595, 0.275, 0.115),  # Repoussé Mound-Arena copper
    'cap_cauldron_pit': (0.185, 0.165, 0.150),  # Drum Cauldron oil-scorched scrap steel
    'cap_blood_leather':(0.245, 0.055, 0.045),  # Arena-cured oxblood leather
    'cap_champion_gold':(0.855, 0.635, 0.165),  # Gilded rudis-victor bronze-gold
    'cap_warrant_wax':  (0.540, 0.045, 0.055),  # Chartered bounty-warrant sealing wax
    'cap_duster_hide':  (0.215, 0.145, 0.095),  # Oiled road-warden duster leather
    'cap_visor_void':   (0.018, 0.018, 0.022),  # Deep dark eye-slit / grille shadow
}
for _k, _v in CAP_COLORS.items():
    C.setdefault(_k, _v)

CAPTIVES_TIER_SHARES = [
    ['blitrit_plantation_thrall', 0.18],
    ['nazar_salvage_chaingang', 0.16],
    ['solstice_altar_captive', 0.08],
    ['galley_oar_thrall', 0.12],
    ['span_bone_myrmillo', 0.09],
    ['drum_cauldron_pitfighter', 0.09],
    ['arena_retiarius_netter', 0.08],
    ['arena_champion', 0.05],
    ['slave_catcher', 0.08],
    ['licensed_bounty_hunter', 0.07],
]

CAPTIVES_TIER_LABELS = {
    'blitrit_plantation_thrall': 'Shim Blïtrit Blood-Reed Plantation Thrall',
    'nazar_salvage_chaingang': 'Nazar Ruin-Quarry Salvage Chain-Gang',
    'solstice_altar_captive': 'Solstice Sun-Altar Painted Captive',
    'galley_oar_thrall': 'Ring Sea Bireme Galley Oar-Thrall',
    'span_bone_myrmillo': 'Span Mound-Arena Bone & Copper Myrmillo',
    'drum_cauldron_pitfighter': 'Drum Cauldron Arcology Scrap-Pitfighter',
    'arena_retiarius_netter': 'Arena Hill Galerus & Net Retiarius',
    'arena_champion': 'Undefeated Laurel-Crowned Arena Champion',
    'slave_catcher': 'Frontier Coffle-Whip Slave-Catcher',
    'licensed_bounty_hunter': 'Chartered Seal-Warrant Bounty Hunter',
}

CAP_CUSTOM_MOTIFS = {
    'cap_blitrit_stain',
    'cap_chain_convict',
    'cap_sacred_hand',
    'cap_gladiator_grille',
    'cap_net_mesh',
    'cap_warrant_splint',
}


def _cap_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'cap_blitrit_stain':
        # Coarse sackcloth wicked from the hem upward with purple-crimson Blïtrit blood-reed sap
        wick = np.clip((v - 0.32 + 0.10 * np.sin(u * 2.0 * math.pi * 7.0)) / 0.55, 0.0, 1.0)
        wick = wick * wick * (3.0 - 2.0 * wick)
        weave = 0.88 + 0.12 * np.sin(u * 2.0 * math.pi * 24.0) * np.cos(v * 2.0 * math.pi * 24.0)
        c_bg = np.asarray(bg)[None, None, :] * weave[:, :, None]
        c_fg = np.asarray(fg)[None, None, :]
        img[:] = c_bg * (1.0 - 0.86 * wick[:, :, None]) + c_fg * (0.86 * wick[:, :, None])
        crust = v > 0.88
        img[crust] = C['cap_blitrit']
        return np.clip(img, 0.0, 1.0)

    if style == 'cap_chain_convict':
        # Dusty Nazar quarry sackcloth with stencilled convict tally-bars & rusted chain-link marks
        bar = ((u * 8.0) % 1.0 < 0.22) & (v > 0.15) & (v < 0.85)
        strike = (np.abs(v - 0.50) < 0.06) & (((u * 4.0) % 1.0) < 0.72)
        grime = 0.82 + 0.18 * np.sin(u * 19.0 + v * 13.0)
        img[:] = np.asarray(bg)[None, None, :] * grime[:, :, None]
        img[bar | strike] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'cap_sacred_hand':
        # Bleached solstice linen with stepped ochre solar-altar border & crimson sacrificial marks
        su = (u * 5.0) % 1.0 - 0.5
        sv = v - 0.52
        disc = np.hypot(su * 1.15, sv * 1.45) < 0.24
        rays = (np.hypot(su * 1.15, sv * 1.45) < 0.38) & (np.abs(np.sin(np.arctan2(sv, su) * 6.0)) > 0.65)
        hem = v > 0.84
        img[rays] = C['cap_marigold']
        img[disc | hem] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'cap_gladiator_grille':
        # Perforated arena visor / cauldron pitfighter iron grille with dark eye-holes & brass rivets
        gu = (u * 12.0) % 1.0 - 0.5
        gv = (v * 8.0) % 1.0 - 0.5
        hole = np.hypot(gu, gv) < 0.28
        lame = ((v * 4.0) % 1.0) < 0.10
        img[lame] = fg
        img[hole] = C['cap_visor_void']
        return np.clip(img, 0.0, 1.0)

    if style == 'cap_net_mesh':
        # Knotted Retiarius weighted fishing-net diamond cord over sea-linen / leather
        d1 = np.abs(((u * 10.0 + v * 10.0) % 1.0) - 0.5) < 0.09
        d2 = np.abs(((u * 10.0 - v * 10.0) % 1.0) - 0.5) < 0.09
        knot = d1 & d2
        img[d1 | d2] = fg
        img[knot] = C['lead'] if 'lead' in C else C['iron']
        return np.clip(img, 0.0, 1.0)

    if style == 'cap_warrant_splint':
        # Oiled bounty-hunter duster reinforced with vertical riveted steel splints
        su = (u * 10.0) % 1.0
        splint = (su > 0.18) & (su < 0.42) & (v > 0.08) & (v < 0.90)
        riv = (np.abs(su - 0.30) < 0.06) & (np.abs(((v * 9.0) % 1.0) - 0.5) < 0.14)
        img[splint] = C['iron']
        img[riv] = fg
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def _cap_motif_ctx():
    orig = paint_mod.motif

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in CAP_CUSTOM_MOTIFS:
            return _cap_motif(style, w, h, fg, bg, aspect=aspect)
        return orig(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched
    try:
        yield
    finally:
        paint_mod.motif = orig


# ===========================================================================================================
# SHARED GEOMETRY HELPERS (OPEN-BROW CAPS, PROUD VISOR HELMS & FLUSH DORSAL PADS)
# ===========================================================================================================
def _nearest_pt(pts_flat, target):
    t = np.asarray(target, dtype=np.float64)
    idx = int(np.argmin(np.linalg.norm(pts_flat - t, axis=1)))
    return pts_flat[idx].copy()


def _dorsal_pad(gid, pad_paint, z_off=-0.01, pad_size=(0.18, 0.044, 0.22), clearance=0.018):
    """Flush Spine2-weighted dorsal mounting pad seated within <=18mm of bare back skin and clearing tunics."""
    c_sp = spine_at(core.CHEST + z_off)
    anc = surface_out(c_sp, BACK_DIR, clearance, bvh=core.BVH_T)
    pad = blob(f'{gid}_pad', anc, pad_size, pad_paint, n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, anc


def _open_brow_bowl(name, paint, f_low=0.06, f_brow=0.62, high=1.08, ease=0.014, rows=12, n=36):
    """Open-face helmet/cap cranial shell arching cleanly above the eyebrow line (`f_brow >= 0.62`)."""
    a, b, up, bk, left = head_frame()
    angles = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angles]
    f_rim = np.full(n, f_low, dtype=np.float64)
    half_span = 0.56 * math.pi
    for j, an in enumerate(angles):
        af = abs(an - math.pi)
        if af < half_span:
            w = 0.5 + 0.5 * math.cos(math.pi * af / half_span)
            f_rim[j] = f_low + (f_brow - f_low) * (w ** 0.78)
    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for i in range(rows):
        u = i / float(rows - 1)
        for j, d in enumerate(ds):
            f_ij = float(f_rim[j]) + (high - float(f_rim[j])) * u
            c_ray = a + (b - a) * min(max(f_ij, 0.16), 0.92)
            c_pos = a + (b - a) * f_ij
            h_hit = first_hit(c_ray, d)
            r_base = (float(h_hit) if h_hit is not None else 0.096) + ease
            scale_r = (
                max(0.05, math.sqrt(max(0.0, 1.0 - ((u - 0.70) / 0.30) ** 1.8)))
                if u > 0.70 else (1.0 + 0.04 * math.sin(u / 0.70 * math.pi))
            )
            Q[i, j] = c_pos + d * (r_base * scale_r)
    apex = a + (b - a) * high + up * 0.014
    Q[-1] = apex + (Q[-1] - apex) * 0.05
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _gladiator_visor_helm(gid, bowl_paint, face_paint, bar_paint, fin_paint=None, brim_width=0.0):
    """Enclosed arena/bounty visor-helm with open-brow cranial bowl, sculpted faceplate, proud +4.5mm dark
    eye-slits, brow bar, and nasal bar anchored directly to `faceplate.P`."""
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    fwd = -bk
    bowl = _open_brow_bowl(f'{gid}_bowl', bowl_paint, f_low=0.05, f_brow=0.62, high=1.08, ease=0.015)
    face = sculpted_faceplate(f'{gid}_faceplate', face_paint, f_top=0.76, f_bot=-0.05, ease=0.015,
                              brow_relief=0.014, nose_relief=0.020, chin_relief=0.010)
    parts = [bowl, face]
    fp_flat = face.P.reshape(-1, 3)

    # Proud +4.5mm dark eye-slit tubes for both eyes
    slit_p = P('cap_visor_void', 0.02, fabric='metal.iron')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_in = _nearest_pt(fp_flat, a + (b - a) * f_eyes + left * (sgn * (x_eye * 0.52)) + fwd * 0.11)
        p_out = _nearest_pt(fp_flat, a + (b - a) * f_eyes + left * (sgn * (x_eye * 1.48)) + fwd * 0.10)
        parts.append(tube(f'{gid}_eyeslit_{tag}', [p_in + fwd * 0.0045, p_out + fwd * 0.0045],
                          0.0055, slit_p, n=8, rigid_joint='Head'))

    # Proud +4.5mm brow reinforcement bar & vertical nasal guard bar
    b_l = _nearest_pt(fp_flat, a + (b - a) * f_brow + left * 0.058 + fwd * 0.10)
    b_m = _nearest_pt(fp_flat, a + (b - a) * (f_brow + 0.01) + fwd * 0.115)
    b_r = _nearest_pt(fp_flat, a + (b - a) * f_brow - left * 0.058 + fwd * 0.10)
    parts.append(tube(f'{gid}_brow_bar', [b_r + fwd * 0.0045, b_m + fwd * 0.0050, b_l + fwd * 0.0045],
                      0.0060, bar_paint, n=8, rigid_joint='Head'))

    n_top = _nearest_pt(fp_flat, a + (b - a) * f_brow + fwd * 0.115)
    n_mid = _nearest_pt(fp_flat, a + (b - a) * f_nose + fwd * 0.125)
    n_bot = _nearest_pt(fp_flat, a + (b - a) * 0.08 + fwd * 0.110)
    parts.append(tube(f'{gid}_nasal_bar', [n_top + fwd * 0.0045, n_mid + fwd * 0.0050, n_bot + fwd * 0.0045],
                      0.0058, bar_paint, n=8, rigid_joint='Head'))

    if brim_width > 0.005:
        parts.append(brim(f'{gid}_brim', 0.62, brim_width, bar_paint, ease=0.015, rows=5, n=36, droop=0.018))

    if fin_paint is not None:
        bw_flat = bowl.P.reshape(-1, 3)
        p_f0 = _nearest_pt(bw_flat, a + (b - a) * 0.82 + fwd * 0.09)
        p_f1 = _nearest_pt(bw_flat, a + (b - a) * 1.06 + up * 0.02)
        p_f2 = _nearest_pt(bw_flat, a + (b - a) * 0.72 - fwd * 0.10)
        parts.append(horn(f'{gid}_ridge_fin', [p_f0 - up * 0.003, p_f1 + up * 0.055, p_f2 - up * 0.003],
                          0.018, 0.012, fin_paint, n=10, rows=7, rigid_joint='Head'))
    return parts


def _bare_or_bandeau_torso(gid_t, sex, bandeau_paint, extra_parts):
    """For bare-chest thralls & gladiators (`open_torso=True`): bare chest on M, modest chest-wrap bandeau on F."""
    if sex == 'f':
        bandeau = torso_tube(f'{gid_t}_bandeau', core.CHEST + 0.052, core.CHEST - 0.058, 0.016,
                             bandeau_paint, n=38, rows=7)
        return [bandeau] + list(extra_parts)
    return list(extra_parts)


# ===========================================================================================================
# 10 CAPTIVES, ARENA GLADIATORS & MANHUNTER TIERS (`cap_{s}_*`)
# ===========================================================================================================
def _build_captives_and_arena_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    iron_p = P('cap_fetter_iron', 0.04, [B('top', 0.0, 0.02, 'solid', 'cap_rust_chain')], fabric='metal.iron')
    rust_p = P('cap_rust_chain', 0.05, fabric='metal.iron')
    hemp_p = P('cap_hemp', 0.07, fabric='cloth.weave.burlap')

    # -------------------------------------------------------------------------------------------------------
    # 1. blitrit_plantation_thrall — Shim *Blïtrit* Blood-Reed Plantation Thrall
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_blitrit_reed_hat'
    rhat = conical_hat(f'{gid_h}_kasa',
                       P('oat', 0.06, [B('bottom', 0.0, 0.05, 'solid', 'cap_blitrit_hi')], fabric='straw.reed.plaited'),
                       f_base=0.66, f_top=1.24, r_base=0.29, rows=9, n=36)
    entries.append(assemble_garment(gid_h, 'Woven Shim Reed-Cutter Sun Hat', 'head', 'captives_and_arena',
                                    [rhat], covers_hair=True))

    gid_t = f'cap_{sex}_blitrit_collar_harness'
    t_col = neck_ring(f'{gid_t}_iron_collar', iron_p, r_tube=0.020, drop=0.010, n=32, nr=8)
    t_cord = crossed_sash(f'{gid_t}_reed_strap',
                          P('cap_hemp', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'cap_blitrit')], fabric='cloth.weave.burlap'),
                          width=0.052, ease=0.021)
    t_tag = rosette(f'{gid_t}_estate_tally', _nearest_pt(t_cord.P.reshape(-1, 3), chest_front(core.CHEST + 0.04, 0.016)),
                    np.array([0.0, -1.0, 0.0]), left,
                    0.022, P('bronze', 0.03, fabric='metal.bronze'), n=10, thick=0.009, rigid_joint='Spine2')
    t_belt = belt_sash(f'{gid_t}_rope_girdle', core.WAIST - 0.012, core.WAIST + 0.024, hemp_p, ease=0.017)
    entries.append(assemble_garment(
        gid_t, 'Shim Estate Tally-Collar & Sap-Stained Thrall Cord', 'torso', 'captives_and_arena',
        _bare_or_bandeau_torso(gid_t, sex, hemp_p, [t_col, t_cord, t_tag, t_belt]), open_torso=True,
    ))

    gid_g = f'cap_{sex}_blitrit_wrist_binds'
    sap_wrap = P('cap_blitrit_hi', 0.06, [B('top', 0.0, 0.03, 'solid', 'cap_hemp')], fabric='cloth.weave.burlap')
    entries.append(assemble_garment(
        gid_g, 'Blïtrit Sap-Stained Reed-Cutter Wristwraps', 'gloves', 'captives_and_arena',
        [sleeve(f'{gid_g}_L', L, sap_wrap, f0=0.64, f1=0.95, ease=0.012, flare=0.002, rows=6, n=18),
         sleeve(f'{gid_g}_R', R, sap_wrap, f0=0.64, f1=0.95, ease=0.012, flare=0.002, rows=6, n=18)],
    ))

    gid_l = f'cap_{sex}_blitrit_loin_kilt'
    bl_kilt_p = P('cap_hemp', 0.07, [
        B('bottom', 0.0, 0.07, 'solid', 'cap_blitrit'),
    ], [PN(0.0, 1.0, 'cap_blitrit_stain', 'cap_blitrit_hi', 'cap_hemp', 0.24)], fabric='cloth.weave.burlap')
    entries.append(assemble_garment(
        gid_l, 'Purple Blood-Reed Stained Sackcloth Thrall Kilt', 'legs', 'captives_and_arena',
        [torso_tube(f'{gid_l}_kilt', core.WAIST - 0.044, core.KNEE + 0.05, 0.024, bl_kilt_p,
                    n=38, rows=13, hang_from=core.WAIST - 0.044, flare=0.075)],
        legged=False,
    ))

    gid_f = f'cap_{sex}_blitrit_marsh_sandals'
    entries.append(assemble_garment(
        gid_f, 'Sap-Crusted Woven Rush Marsh Sandals', 'feet', 'captives_and_arena',
        sandal(gid_f, P('cap_blitrit', 0.07), P('oat', 0.06, fabric='straw.reed.plaited'), laces=1),
    ))

    gid_b = f'cap_{sex}_blitrit_reed_sheaf'
    pad, anc = _dorsal_pad(gid_b, hemp_p, clearance=0.018)
    sheaf = horn(f'{gid_b}_sheaf', [anc - up * 0.14 + BACK_DIR * 0.018, anc + up * 0.18 + BACK_DIR * 0.024],
                 0.068, 0.082,
                 P('oat', 0.06, [B('bottom', 0.0, 0.09, 'solid', 'cap_blitrit_hi'),
                                 B('top', 0.0, 0.04, 'solid', 'cap_blitrit')], fabric='straw.reed.plaited'),
                 n=14, rows=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Harvested Shim Blood-Reed Dorsal Sheaf', 'back', 'captives_and_arena',
                                    [pad, sheaf]))

    # -------------------------------------------------------------------------------------------------------
    # 2. nazar_salvage_chaingang — Nazar Ruin-Quarry Salvage Chain-Gang
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_nazar_convict_band'
    cb = head_rings(f'{gid_h}_headband', 0.60, 0.71, 0.004,
                    P('cap_slag_ash', 0.06, [B('bottom', 0.0, 0.03, 'solid', 'cap_rust_chain')], fabric=COTTON),
                    n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Slag-Dusted Nazar Convict Sweatband', 'head', 'captives_and_arena',
                                    [cb], covers_hair=False))

    gid_t = f'cap_{sex}_nazar_shackle_yoke'
    nz_col = neck_ring(f'{gid_t}_shackle_ring', iron_p, r_tube=0.025, drop=0.012, n=32, nr=8)
    nz_chains = crossed_sash(f'{gid_t}_chain_x',
                             P('cap_fetter_iron', 0.04, [B('top', 0.0, 0.02, 'dentils', 'cap_rust_chain', 'cap_fetter_iron', 0.025)],
                               fabric='metal.iron'),
                             width=0.048, ease=0.022)
    nz_belt = belt_sash(f'{gid_t}_iron_girdle', core.WAIST - 0.014, core.WAIST + 0.026, iron_p, ease=0.018)
    nz_lock = blob(f'{gid_t}_padlock', _nearest_pt(nz_chains.P.reshape(-1, 3), chest_front(core.CHEST + 0.03, 0.016)),
                   (0.042, 0.024, 0.052),
                   rust_p, n=10, rows=5, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Riveted Nazar Neck-Shackle & Crossed Quarry Chains', 'torso', 'captives_and_arena',
        _bare_or_bandeau_torso(gid_t, sex, P('cap_slag_ash', 0.07, fabric='cloth.weave.burlap'),
                               [nz_col, nz_chains, nz_belt, nz_lock]),
        open_torso=True,
    ))

    gid_g = f'cap_{sex}_nazar_iron_manacles'
    entries.append(assemble_garment(
        gid_g, 'Heavy Iron Quarry Wrist-Manacles', 'gloves', 'captives_and_arena',
        [sleeve(f'{gid_g}_L', L, iron_p, f0=0.68, f1=0.94, ease=0.014, flare=0.003, rows=6, n=18),
         sleeve(f'{gid_g}_R', R, iron_p, f0=0.68, f1=0.94, ease=0.014, flare=0.003, rows=6, n=18)],
    ))

    gid_l = f'cap_{sex}_nazar_convict_trousers'
    nz_tr_p = P('cap_slag_ash', 0.07, [
        B('bottom', 0.0, 0.05, 'solid', 'cap_fetter_iron'),
    ], [PN(0.0, 1.0, 'cap_chain_convict', 'cap_rust_chain', 'cap_slag_ash', 0.22)], fabric='cloth.weave.burlap')
    entries.append(assemble_garment(
        gid_l, 'Tally-Stamped Nazar Quarry Convict Trousers', 'legs', 'captives_and_arena',
        trousers(gid_l, nz_tr_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'cap_{sex}_nazar_fetter_sandals'
    entries.append(assemble_garment(
        gid_f, 'Iron Ankle-Fetter Quarry Sandals', 'feet', 'captives_and_arena',
        sandal(gid_f, P('cap_fetter_iron', 0.06), P('leather', 0.06), laces=2, strap_paint2=iron_p),
    ))

    gid_b = f'cap_{sex}_nazar_slag_hod'
    pad, anc = _dorsal_pad(gid_b, iron_p, clearance=0.018)
    hod = blob(f'{gid_b}_hod_box', anc + BACK_DIR * 0.022, (0.20, 0.072, 0.23),
               P('cap_slag_ash', 0.06, [B('top', 0.0, 0.04, 'solid', 'cap_rust_chain')],
                 fabric='armor.salvage.tread_plate'),
               n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Riveted Scrap-Iron Concrete Slag Hod', 'back', 'captives_and_arena',
                                    [pad, hod]))

    # -------------------------------------------------------------------------------------------------------
    # 3. solstice_altar_captive — Painted & Garlanded Solstice Sun-Altar Captive
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_solstice_garland_wreath'
    wr = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004,
                    P('cap_marigold', 0.05, [B('bottom', 0.0, 0.03, 'beads', 'gold', 'cap_sacred_red', 0.025)],
                      fabric='cloth.silk.slub'),
                    n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Marigold & Gilded Bronze Sacrificial Wreath', 'head', 'captives_and_arena',
                                    [wr], covers_hair=False))

    gid_t = f'cap_{sex}_solstice_sacred_pectoral'
    sc_ring = neck_ring(f'{gid_t}_gilt_collar', P('gold', 0.02, fabric='metal.gold'), r_tube=0.021, drop=0.012, n=32, nr=8)
    sc_sash = crossed_sash(f'{gid_t}_garland_cord',
                           P('cap_marigold', 0.05, [B('top', 0.0, 0.02, 'solid', 'cap_sacred_red')], fabric='cloth.silk.slub'),
                           width=0.058, ease=0.022)
    sc_disc = rosette(f'{gid_t}_altar_mirror', _nearest_pt(sc_sash.P.reshape(-1, 3), chest_front(core.CHEST + 0.02, 0.016)),
                      np.array([0.0, -1.0, 0.0]), left,
                      0.038, P('gold', 0.02, [B('top', 0.0, 0.02, 'solid', 'cap_sacred_red')], fabric='metal.gold'),
                      n=14, thick=0.012, rigid_joint='Spine2')
    sc_belt = belt_sash(f'{gid_t}_crimson_girdle', core.WAIST - 0.012, core.WAIST + 0.024,
                        P('cap_sacred_red', 0.04, fabric='cloth.silk'), ease=0.017)
    entries.append(assemble_garment(
        gid_t, 'Gilded Solstice Sun-Mirror & Marigold Captive Cord', 'torso', 'captives_and_arena',
        _bare_or_bandeau_torso(gid_t, sex, P('cap_altar_chalk', 0.04, fabric='cloth.cotton.muslin'),
                               [sc_ring, sc_sash, sc_disc, sc_belt]),
        open_torso=True,
    ))

    gid_g = f'cap_{sex}_solstice_gilt_cuffs'
    gilt_cuff_p = P('gold', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'cap_sacred_red')], fabric='metal.gold')
    entries.append(assemble_garment(
        gid_g, 'Gilded Bronze Solstice Altar Manacles', 'gloves', 'captives_and_arena',
        [sleeve(f'{gid_g}_L', L, gilt_cuff_p, f0=0.66, f1=0.94, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'{gid_g}_R', R, gilt_cuff_p, f0=0.66, f1=0.94, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    gid_l = f'cap_{sex}_solstice_altar_skirt'
    alt_sk_p = P('cap_altar_chalk', 0.04, [
        B('bottom', 0.0, 0.07, 'rays', 'cap_sacred_red', 'cap_marigold', 0.03),
    ], [PN(0.0, 1.0, 'cap_sacred_hand', 'cap_sacred_red', 'cap_altar_chalk', 0.24)], fabric='cloth.cotton.muslin')
    entries.append(assemble_garment(
        gid_l, 'Pleated White-Chalk & Crimson Solstice Captive Kilt', 'legs', 'captives_and_arena',
        [torso_tube(f'{gid_l}_skirt', core.WAIST - 0.044, core.KNEE + 0.02, 0.023, alt_sk_p,
                    n=40, rows=14, hang_from=core.WAIST - 0.044, flare=0.080)],
        legged=False,
    ))

    gid_f = f'cap_{sex}_solstice_cord_sandals'
    entries.append(assemble_garment(
        gid_f, 'Gilded Cord & Crimson-Leather Altar Sandals', 'feet', 'captives_and_arena',
        sandal(gid_f, P('cap_sacred_red', 0.05), P('gold', 0.03, fabric='metal.gold'), laces=2),
    ))

    gid_b = f'cap_{sex}_solstice_tablet_yoke'
    pad, anc = _dorsal_pad(gid_b, P('cap_sacred_red', 0.04), clearance=0.018)
    stele = blob(f'{gid_b}_sun_tablet', anc + up * 0.02 + BACK_DIR * 0.020, (0.18, 0.036, 0.24),
                 P('cap_altar_chalk', 0.04, [B('top', 0.0, 0.04, 'solid', 'gold')],
                   [PN(0.0, 1.0, 'cap_sacred_hand', 'cap_sacred_red', 'cap_altar_chalk', 0.22)]),
                 n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Consecrated Stone Solstice Votive Tablet', 'back', 'captives_and_arena',
                                    [pad, stele]))

    # -------------------------------------------------------------------------------------------------------
    # 4. galley_oar_thrall — Ring Sea & Almua Bireme Galley Oar-Thrall
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_galley_sweat_rag'
    gsr = head_rings(f'{gid_h}_headband', 0.60, 0.71, 0.004,
                     P('sealinen', 0.06, [B('bottom', 0.0, 0.03, 'stripes', 'deepsea', 'sealinen', 0.03)],
                       fabric='cloth.linen.sea'),
                     n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Salt-Crusted Galley Rower Sweatband', 'head', 'captives_and_arena',
                                    [gsr], covers_hair=False))

    gid_t = f'cap_{sex}_galley_bench_harness'
    v_bronze = P('verdigris', 0.04, [B('top', 0.0, 0.02, 'solid', 'bronze')], fabric='metal.bronze.verdigris')
    gl_col = neck_ring(f'{gid_t}_bronze_collar', v_bronze, r_tube=0.021, drop=0.011, n=32, nr=8)
    gl_strap = crossed_sash(f'{gid_t}_oar_chafe', P('saddle', 0.06, fabric='leather.cuir_bouilli'),
                            width=0.064, ease=0.022)
    gl_belt = belt_sash(f'{gid_t}_tar_belt', core.WAIST - 0.014, core.WAIST + 0.026,
                        P('cap_tar_canvas', 0.06, fabric='leather.cuir_bouilli'), ease=0.018)
    entries.append(assemble_garment(
        gid_t, 'Verdigris Bench-Collar & Oar-Chafe Leather Strap', 'torso', 'captives_and_arena',
        _bare_or_bandeau_torso(gid_t, sex, P('sealinen', 0.06, fabric='cloth.linen.sea'),
                               [gl_col, gl_strap, gl_belt]),
        open_torso=True,
    ))

    gid_g = f'cap_{sex}_galley_oar_wraps'
    oar_w_p = P('saddle', 0.06, [B('top', 0.0, 0.03, 'solid', 'cap_tar_canvas')], fabric='leather.buckskin')
    entries.append(assemble_garment(
        gid_g, 'Pitch-Toughened Leather Oar-Grip Wraps', 'gloves', 'captives_and_arena',
        [sleeve(f'{gid_g}_L', L, oar_w_p, f0=0.60, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'{gid_g}_R', R, oar_w_p, f0=0.60, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    gid_l = f'cap_{sex}_galley_breech_kilt'
    gal_k_p = P('cap_tar_canvas', 0.06, [
        B('bottom', 0.0, 0.06, 'stripes', 'sealinen', 'cap_tar_canvas', 0.04),
    ], fabric='cloth.slops.abaca_stripe')
    entries.append(assemble_garment(
        gid_l, 'Pitch-Stained Sailcloth Galley Bench-Kilt', 'legs', 'captives_and_arena',
        [torso_tube(f'{gid_l}_kilt', core.WAIST - 0.044, core.KNEE + 0.06, 0.024, gal_k_p,
                    n=38, rows=13, hang_from=core.WAIST - 0.044, flare=0.075)],
        legged=False,
    ))

    gid_f = f'cap_{sex}_galley_deck_sandals'
    entries.append(assemble_garment(
        gid_f, 'Verdigris-Shackled Coir Deck Sandals', 'feet', 'captives_and_arena',
        sandal(gid_f, P('cap_tar_canvas', 0.07), v_bronze, laces=1),
    ))

    gid_b = f'cap_{sex}_galley_chain_gourd'
    pad, anc = _dorsal_pad(gid_b, P('cap_tar_canvas', 0.06), clearance=0.018)
    coil = rosette(f'{gid_b}_chain_coil', anc + BACK_DIR * 0.020, BACK_DIR, left, 0.095,
                   v_bronze, n=14, thick=0.024, rigid_joint='Spine2')
    gourd = blob(f'{gid_b}_water_gourd', anc - up * 0.07 + left * 0.05 + BACK_DIR * 0.026, (0.085, 0.065, 0.11),
                 P('ochre', 0.05, fabric='leather.cuir_bouilli'), n=10, rows=5, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Coiled Bronze Bench-Chain & Ration Gourd', 'back', 'captives_and_arena',
                                    [pad, coil, gourd]))

    # -------------------------------------------------------------------------------------------------------
    # 5. span_bone_myrmillo — Span Mound-Arena Megafauna-Bone & Copper Myrmillo
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_span_myrmillo_helm'
    bone_p = P('cap_span_bone', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'cap_span_copper')], fabric='armor.lamellar.horn')
    cop_p = P('cap_span_copper', 0.03, [B('top', 0.0, 0.03, 'dentils', 'cap_span_bone', 'cap_span_copper', 0.025)],
              fabric='metal.bronze')
    m_helm = _gladiator_visor_helm(
        gid_h, bone_p,
        P('cap_span_copper', 0.03, panels=[PN(0.0, 1.0, 'cap_gladiator_grille', 'cap_span_bone', 'cap_span_copper', 0.14)],
          fabric='metal.bronze'),
        cop_p, fin_paint=bone_p, brim_width=0.045,
    )
    e_mh = assemble_garment(gid_h, 'Span Megafauna-Bone & Grilled Copper Myrmillo Helm', 'head', 'captives_and_arena',
                            m_helm, covers_hair=True, covers_face=True)
    e_mh['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_mh)

    gid_t = f'cap_{sex}_span_myrmillo_harness'
    m_sash = crossed_sash(f'{gid_t}_baldric', cop_p, width=0.072, ease=0.024)
    m_belt = belt_sash(f'{gid_t}_balteus', core.WAIST - 0.014, core.WAIST + 0.032, cop_p, ease=0.020)
    m_pR = articulated_pauldron(f'{gid_t}_manica_pauldron_R', R, cop_p, trim_paint=bone_p, lames=3, haute_piece=True, ease=0.012)
    m_boss = rosette(f'{gid_t}_pectoral', _nearest_pt(m_sash.P.reshape(-1, 3), chest_front(core.CHEST + 0.02, 0.016)),
                     np.array([0.0, -1.0, 0.0]), left,
                     0.042, cop_p, n=14, thick=0.014, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Span Articulated Copper-Manica Shoulder Guard & Balteus', 'torso', 'captives_and_arena',
        _bare_or_bandeau_torso(gid_t, sex, P('cap_blood_leather', 0.05, fabric='leather.cuir_bouilli'),
                               [m_sash, m_belt, m_pR, m_boss]),
        open_torso=True,
    ))

    gid_g = f'cap_{sex}_span_bone_manica'
    entries.append(assemble_garment(
        gid_g, 'Sculpted Copper & Bone Arena Vambraces & Couters', 'gloves', 'captives_and_arena',
        sculpted_vambraces(gid_g, cop_p, trim_paint=bone_p, couter=True, ease=0.015),
    ))

    gid_l = f'cap_{sex}_span_subligaculum'
    sub_p = P('crimson', 0.05, [
        B('bottom', 0.0, 0.06, 'dentils', 'cap_span_bone', 'cap_span_copper', 0.03),
    ], [PN(0.0, 1.0, 'bone_lamellar', 'cap_span_bone', 'crimson', 0.18)], fabric='leather.pteruges.studded')
    entries.append(assemble_garment(
        gid_l, 'Crimson & Carved-Bone Pteruges Subligaculum', 'legs', 'captives_and_arena',
        [torso_tube(f'{gid_l}_kilt', core.WAIST - 0.044, core.KNEE + 0.05, 0.023, sub_p,
                    n=40, rows=13, hang_from=core.WAIST - 0.044, flare=0.078)],
        legged=False,
    ))

    gid_f = f'cap_{sex}_span_greave_sandals'
    entries.append(assemble_garment(
        gid_f, 'Sculpted Hammered Copper Ocrea-Greaves & Arena Sandals', 'feet', 'captives_and_arena',
        [sandal(gid_f, P('cap_blood_leather', 0.06), cop_p, guard=False, laces=2),
         sculpted_greaves(f'{gid_f}_grv', cop_p, trim_paint=bone_p, poleyn=True, ease=0.015)],
    ))

    gid_b = f'cap_{sex}_span_scutum_rack'
    pad, anc = _dorsal_pad(gid_b, cop_p, clearance=0.018)
    scutum = blob(f'{gid_b}_bone_scutum', anc + up * 0.02 + BACK_DIR * 0.022, (0.24, 0.040, 0.31),
                  bone_p, n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Curved Megafauna-Bone & Copper Scutum Shield', 'back', 'captives_and_arena',
                                    [pad, scutum]))

    # -------------------------------------------------------------------------------------------------------
    # 6. drum_cauldron_pitfighter — Drum *Cauldron* Arcology Scrap-Iron Pitfighter
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_cauldron_cage_helm'
    pit_iron = P('cap_cauldron_pit', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'cap_rust_chain'),
    ], [PN(0.0, 1.0, 'cap_gladiator_grille', 'cap_rust_chain', 'cap_cauldron_pit', 0.14)],
       fabric='armor.salvage.tread_plate')
    c_helm = _gladiator_visor_helm(gid_h, pit_iron, pit_iron, rust_p, fin_paint=rust_p)
    e_ch = assemble_garment(gid_h, 'Drum Cauldron Riveted Tread-Plate Cage Helm', 'head', 'captives_and_arena',
                            c_helm, covers_hair=True, covers_face=True)
    e_ch['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_ch)

    gid_t = f'cap_{sex}_cauldron_scrap_harness'
    pit_metal = P('cap_cauldron_pit', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'cap_rust_chain'),
    ], [PN(0.0, 1.0, 'cap_gladiator_grille', 'cap_rust_chain', 'cap_cauldron_pit', 0.14)],
       fabric='metal.iron')
    pit_sash = crossed_sash(f'{gid_t}_strap', P('cap_blood_leather', 0.06, fabric='leather.cuir_bouilli'),
                            width=0.074, ease=0.024)
    pit_belt = belt_sash(f'{gid_t}_belt', core.WAIST - 0.014, core.WAIST + 0.032, pit_metal, ease=0.020)
    pit_gorg = gorget_guard(f'{gid_t}_gorg', pit_metal, trim_paint=rust_p, ease=0.018)
    pit_pL = articulated_pauldron(f'{gid_t}_tread_pauldron_L', L, pit_metal, trim_paint=rust_p, lames=3, haute_piece=True, ease=0.012)
    entries.append(assemble_garment(
        gid_t, 'Asymmetric Articulated Tread-Plate Pauldron, Gorget & Pit-Girdle', 'torso', 'captives_and_arena',
        _bare_or_bandeau_torso(gid_t, sex, P('cap_blood_leather', 0.06, fabric='leather.cuir_bouilli'),
                               [pit_sash, pit_belt, pit_gorg, pit_pL]),
        open_torso=True,
    ))

    gid_g = f'cap_{sex}_cauldron_cestus_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Sculpted Scrap-Iron Pit Vambraces & Cestus Gauntlets', 'gloves', 'captives_and_arena',
        [sculpted_vambraces(f'{gid_g}_vmb', pit_metal, trim_paint=rust_p, couter=True, ease=0.020),
         full_gloves(gid_g, pit_metal, P('cap_blood_leather', 0.06, fabric='leather.cuir_bouilli'),
                     f0=0.86, knuckle_paint=rust_p)],
    ))

    gid_l = f'cap_{sex}_cauldron_pit_breeches'
    pit_br_p = P('cap_tar_canvas', 0.06, [
        B('bottom', 0.0, 0.05, 'solid', 'cap_blood_leather'),
    ], [PN(0.0, 1.0, 'quilt', 'cap_cauldron_pit', 'cap_tar_canvas', 0.16)], fabric='leather.cuir_bouilli')
    entries.append(assemble_garment(
        gid_l, 'Oil-Scorched Quilted Leather Cauldron Pit-Breeches', 'legs', 'captives_and_arena',
        trousers(gid_l, pit_br_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'cap_{sex}_cauldron_iron_stompers'
    entries.append(assemble_garment(
        gid_f, 'Sculpted Scrap-Iron Greaves & Drum Cauldron Pit-Boots', 'feet', 'captives_and_arena',
        [boots(gid_f, P('soot', 0.08), pit_metal, top=0.26, ease_top=0.022),
         sculpted_greaves(f'{gid_f}_grv', pit_metal, trim_paint=rust_p, poleyn=True, ease=0.025)],
    ))

    gid_b = f'cap_{sex}_cauldron_saw_buckler'
    pad, anc = _dorsal_pad(gid_b, pit_iron, clearance=0.018)
    saw = rosette(f'{gid_b}_buzz_buckler', anc + up * 0.02 + BACK_DIR * 0.022, BACK_DIR, left, 0.145,
                  P('steel', 0.03, [B('top', 0.0, 0.04, 'dentils', 'cap_rust_chain', 'steel', 0.02)],
                    fabric='armor.salvage.tread_plate'),
                  n=18, thick=0.022, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Serrated Arcology Saw-Blade Pit Buckler', 'back', 'captives_and_arena',
                                    [pad, saw]))

    # -------------------------------------------------------------------------------------------------------
    # 7. arena_retiarius_netter — Arena Hill *Galerus* & Weighted-Net Retiarius
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_retiarius_browband'
    ret_hb = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004,
                        P('bronze', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'verdigris')], fabric='metal.bronze'),
                        n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Braided Leather & Bronze Trident-Brow Circlet', 'head', 'captives_and_arena',
                                    [ret_hb], covers_hair=False))

    gid_t = f'cap_{sex}_retiarius_galerus'
    gal_p = P('bronze', 0.03, [
        B('top', 0.0, 0.03, 'solid', 'verdigris'),
        B('bottom', 0.0, 0.03, 'scales', 'gold', 'bronze', 0.03),
    ], fabric='metal.bronze')
    r_sash = crossed_sash(f'{gid_t}_net_cord',
                          P('sealinen', 0.05, panels=[PN(0.0, 1.0, 'cap_net_mesh', 'bronze', 'sealinen', 0.12)],
                            fabric='cloth.linen.sea'),
                          width=0.068, ease=0.023)
    r_belt = belt_sash(f'{gid_t}_balteus', core.WAIST - 0.014, core.WAIST + 0.028,
                       P('cap_blood_leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'bronze')], fabric='leather.cuir_bouilli'),
                       ease=0.019)
    r_gal = articulated_pauldron(f'{gid_t}_galerus_L', L, gal_p, lames=3, haute_piece=True, ease=0.012)
    entries.append(assemble_garment(
        gid_t, 'High Left-Shoulder Bronze Galerus & Net-Cord Baldric', 'torso', 'captives_and_arena',
        _bare_or_bandeau_torso(gid_t, sex, P('sealinen', 0.05, fabric='cloth.linen.sea'),
                               [r_sash, r_belt, r_gal]),
        open_torso=True,
    ))

    gid_g = f'cap_{sex}_retiarius_manica_L'
    entries.append(assemble_garment(
        gid_g, 'Sculpted Bronze Retiarius Vambraces & Net-Thrower Couters', 'gloves', 'captives_and_arena',
        sculpted_vambraces(gid_g, gal_p, couter=True, ease=0.015),
    ))

    gid_l = f'cap_{sex}_retiarius_kilt'
    ret_k_p = P('sealinen', 0.05, [
        B('bottom', 0.0, 0.06, 'solid', 'verdigris'),
    ], [PN(0.0, 1.0, 'cap_net_mesh', 'bronze', 'sealinen', 0.16)], fabric='cloth.linen.sea')
    entries.append(assemble_garment(
        gid_l, 'Pleated Sea-Linen & Lead-Sinker Retiarius Subligaculum', 'legs', 'captives_and_arena',
        [torso_tube(f'{gid_l}_kilt', core.WAIST - 0.044, core.KNEE + 0.05, 0.023, ret_k_p,
                    n=40, rows=13, hang_from=core.WAIST - 0.044, flare=0.078)],
        legged=False,
    ))

    gid_f = f'cap_{sex}_retiarius_sandals'
    entries.append(assemble_garment(
        gid_f, 'High-Laced Arena Sand-Grip Sandals', 'feet', 'captives_and_arena',
        sandal(gid_f, P('saddle', 0.05), P('bronze', 0.03, fabric='metal.bronze'), guard=True, laces=3),
    ))

    gid_b = f'cap_{sex}_retiarius_cast_net'
    pad, anc = _dorsal_pad(gid_b, gal_p, clearance=0.018)
    net_bundle = horn(f'{gid_b}_folded_net',
                      [anc - left * 0.06 - up * 0.13 + BACK_DIR * 0.018,
                       anc + left * 0.06 + up * 0.15 + BACK_DIR * 0.026],
                      0.055, 0.048, ret_k_p, n=12, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Folded Lead-Weighted Arena Casting Net', 'back', 'captives_and_arena',
                                    [pad, net_bundle]))

    # -------------------------------------------------------------------------------------------------------
    # 8. arena_champion — Undefeated Laurel-Crowned Arena Champion
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_champion_cassid_helm'
    ch_gold = P('cap_champion_gold', 0.02, [
        B('bottom', 0.0, 0.04, 'solid', 'crimson'),
    ], [PN(0.0, 1.0, 'scales', 'gold', 'cap_champion_gold', 0.14)], fabric='metal.gold')
    ch_helm = _gladiator_visor_helm(
        gid_h, ch_gold,
        P('cap_champion_gold', 0.02, panels=[PN(0.0, 1.0, 'cap_gladiator_grille', 'crimson', 'cap_champion_gold', 0.14)],
          fabric='metal.gold'),
        P('gold', 0.02, fabric='metal.gold'),
        fin_paint=P('crimson', 0.04, [B('top', 0.0, 0.03, 'rays', 'gold', 'crimson', 0.02)], fabric='cloth.velvet.cut'),
        brim_width=0.050,
    )
    e_ach = assemble_garment(gid_h, 'Gilded Laurel-Plumed Undefeated Cassid Helm', 'head', 'captives_and_arena',
                             ch_helm, covers_hair=True, covers_face=True)
    e_ach['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_ach)

    gid_t = f'cap_{sex}_champion_phalera_harness'
    ch_cuir = cuirass_plate(f'{gid_t}_cuir', ch_gold, trim_paint=P('gold', 0.02, fabric='metal.gold'),
                            style='musculata', faulds=3, ease=0.022)
    ch_gorg = gorget_guard(f'{gid_t}_gorg', ch_gold, trim_paint=P('gold', 0.02, fabric='metal.gold'), ease=0.023)
    ch_pld = articulated_pauldrons(f'{gid_t}_pld', ch_gold, trim_paint=P('gold', 0.02, fabric='metal.gold'),
                                   lames=3, haute_piece=True, ease=0.016)
    ch_sash = crossed_sash(f'{gid_t}_crimson_sash',
                           P('crimson', 0.04, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='cloth.velvet.cut'),
                           width=0.076, ease=0.033)
    ch_belt = belt_sash(f'{gid_t}_champion_belt', core.WAIST - 0.014, core.WAIST + 0.034, ch_gold, ease=0.035)
    ph_l = rosette(f'{gid_t}_phalera_L', _nearest_pt(ch_cuir[0].P.reshape(-1, 3), chest_front(core.CHEST + 0.03, 0.030, x=0.052)),
                   np.array([0.0, -1.0, 0.0]), left,
                   0.030, ch_gold, n=12, thick=0.012, rigid_joint='Spine2')
    ph_r = rosette(f'{gid_t}_phalera_R', _nearest_pt(ch_cuir[0].P.reshape(-1, 3), chest_front(core.CHEST + 0.03, 0.030, x=-0.052)),
                   np.array([0.0, -1.0, 0.0]), left,
                   0.030, ch_gold, n=12, thick=0.012, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Gilded Musculata Champion Cuirass, Articulated Pauldrons & Victory Phalerae', 'torso', 'captives_and_arena',
        [ch_cuir, ch_gorg, ch_pld, ch_sash, ch_belt, ph_l, ph_r],
    ))

    gid_g = f'cap_{sex}_champion_scale_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Sculpted Gilded Champion Vambraces & Gauntlets', 'gloves', 'captives_and_arena',
        [sculpted_vambraces(f'{gid_g}_vmb', ch_gold, trim_paint=P('gold', 0.02, fabric='metal.gold'), couter=True, ease=0.020),
         full_gloves(gid_g, ch_gold, P('crimson', 0.04, fabric='leather.polished'), f0=0.86, knuckle_paint=ch_gold)],
    ))

    gid_l = f'cap_{sex}_champion_pteruges'
    ch_pt_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.07, 'dentils', 'gold', 'crimson', 0.03),
    ], [PN(0.0, 1.0, 'lorica_lames', 'cap_champion_gold', 'crimson', 0.16)], fabric='leather.pteruges.studded')
    entries.append(assemble_garment(
        gid_l, 'Royal Crimson & Gilded Pteruges Champion War-Kilt', 'legs', 'captives_and_arena',
        [torso_tube(f'{gid_l}_kilt', core.WAIST - 0.044, core.KNEE + 0.03, 0.023, ch_pt_p,
                    n=42, rows=14, hang_from=core.WAIST - 0.044, flare=0.080)],
        legged=False,
    ))

    gid_f = f'cap_{sex}_champion_greave_boots'
    entries.append(assemble_garment(
        gid_f, 'Sculpted Gilded Ocrea-Greaves & Champion Warboots', 'feet', 'captives_and_arena',
        [boots(gid_f, P('soot', 0.08), ch_gold, top=0.24, ease_top=0.018),
         sculpted_greaves(f'{gid_f}_grv', ch_gold, trim_paint=P('gold', 0.02, fabric='metal.gold'), poleyn=True, ease=0.016)],
    ))

    gid_b = f'cap_{sex}_champion_victory_mantle'
    vmantle = cape(f'{gid_b}_mantle', core.CROTCH + 0.06,
                   P('crimson', 0.04, [B('bottom', 0.0, 0.06, 'solid', 'cap_champion_gold')], fabric='cloth.velvet.cut'),
                   ease=0.026, flare=0.09, stiff=0.35, back_push=0.045)
    entries.append(assemble_garment(gid_b, 'Gold-Bordered Crimson Arena Victor Mantle', 'back', 'captives_and_arena',
                                    [vmantle]))

    # -------------------------------------------------------------------------------------------------------
    # 9. slave_catcher — Borderlands Coffle-Whip & Man-Catcher Tracker
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_catcher_slouch_hat'
    sc_hide = P('cap_duster_hide', 0.05, [B('bottom', 0.0, 0.03, 'beads', 'brass', 'cap_duster_hide', 0.03)],
                fabric='leather.cuir_bouilli')
    sc_bowl = _open_brow_bowl(f'{gid_h}_crown', sc_hide, f_low=0.58, f_brow=0.64, high=1.08, ease=0.014)
    sc_brim = brim(f'{gid_h}_brim', 0.64, 0.085, sc_hide, ease=0.014, rows=5, n=40, droop=0.022)
    entries.append(assemble_garment(gid_h, 'Brass-Studded Oiled Leather Coffle-Tracker Hat', 'head', 'captives_and_arena',
                                    [sc_bowl, sc_brim], covers_hair=True))

    gid_t = f'cap_{sex}_catcher_brigandine'
    brig_p = P('cap_duster_hide', 0.05, [
        B('bottom', 0.0, 0.05, 'beads', 'iron', 'cap_duster_hide', 0.03),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'saddle', 'cap_duster_hide', 0.16)], fabric='leather.cuir_bouilli')
    sc_cuir = cuirass_plate(f'{gid_t}_jerkin', iron_p, trim_paint=rust_p, style='laminar', faulds=2, ease=0.024)
    sc_gorg = gorget_guard(f'{gid_t}_gorg', iron_p, trim_paint=rust_p, ease=0.024)
    sc_pld = articulated_pauldron(f'{gid_t}_pld_L', L, iron_p, trim_paint=rust_p, lames=2, haute_piece=False, ease=0.023)
    sc_band = crossed_sash(f'{gid_t}_manacle_bandolier', iron_p, width=0.058, ease=0.034)
    entries.append(assemble_garment(
        gid_t, 'Laminar Iron Slave-Catcher Cuirass & Chain Bandolier', 'torso', 'captives_and_arena',
        [sc_cuir, sc_gorg, sc_pld, sleeves(gid_t, 'wrist', 0.018, brig_p), sc_band, pouch_belt(gid_t, iron_p, sc_hide, ease=0.036)],
    ))

    gid_g = f'cap_{sex}_catcher_whip_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Reinforced Rawhide Coffle-Whip Handler Gauntlets', 'gloves', 'captives_and_arena',
        full_gloves(gid_g, sc_hide, P('saddle', 0.05, fabric='leather.buckskin'), knuckle_paint=iron_p),
    ))

    gid_l = f'cap_{sex}_catcher_trail_trousers'
    tr_c_p = P('drabd', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'cap_duster_hide')], fabric='cloth.canvas.oiled')
    entries.append(assemble_garment(
        gid_l, 'Thorn-Proof Oiled Canvas Tracker Breeches', 'legs', 'captives_and_arena',
        trousers(gid_l, tr_c_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'cap_{sex}_catcher_mud_boots'
    entries.append(assemble_garment(
        gid_f, 'Hobnailed Marsh-Tracker Leather Boots', 'feet', 'captives_and_arena',
        boots(gid_f, P('soot', 0.08), sc_hide, top=0.42, ease_top=0.026, wraps=2, wrap_paint=P('saddle', 0.05)),
    ))

    gid_b = f'cap_{sex}_catcher_shackle_rack'
    pad, anc = _dorsal_pad(gid_b, sc_hide, clearance=0.018)
    fork_bar = horn(f'{gid_b}_mancatcher_shaft',
                    [anc - up * 0.14 + BACK_DIR * 0.020, anc + up * 0.20 + BACK_DIR * 0.024],
                    0.024, 0.020, iron_p, n=10, rows=7, rigid_joint='Spine2')
    prong_ring = rosette(f'{gid_b}_collar_fork', anc + up * 0.17 + BACK_DIR * 0.026, BACK_DIR, left, 0.085,
                         iron_p, n=14, thick=0.016, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Forked Iron Man-Catcher Collar-Pole & Coffle Rack', 'back', 'captives_and_arena',
                                    [pad, fork_bar, prong_ring]))

    # -------------------------------------------------------------------------------------------------------
    # 10. licensed_bounty_hunter — Chartered Seal-Warrant Bounty Hunter & Bailiff
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'cap_{sex}_bounty_sallet_helm'
    bh_steel = P('gunmetal' if 'gunmetal' in C else 'iron', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'brass'),
    ], fabric='metal.steel.brushed')
    bh_helm = _gladiator_visor_helm(gid_h, bh_steel, bh_steel, P('brass', 0.02, fabric='metal.bronze'), brim_width=0.060)
    e_bh = assemble_garment(gid_h, 'Iron-Brimmed Warrant Bailiff Slit-Visor Kettle-Sallet', 'head', 'captives_and_arena',
                            bh_helm, covers_hair=True, covers_face=True)
    e_bh['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_bh)

    gid_t = f'cap_{sex}_bounty_splint_duster'
    bh_brass = P('brass', 0.02, fabric='metal.bronze')
    dust_p = P('cap_duster_hide', 0.05, [
        B('bottom', 0.0, 0.07, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'cap_warrant_splint', 'brass', 'cap_duster_hide', 0.22)], fabric='cloth.oilskin.tarred_seams')
    bh_coat = torso_tube(f'{gid_t}_duster', core.TOP, core.KNEE + 0.02, 0.025, dust_p,
                         n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    bh_cuir = cuirass_plate(f'{gid_t}_cuir', bh_steel, trim_paint=bh_brass, style='gothic',
                            z_bot=core.WAIST, faulds=2, ease=0.032)
    bh_gorg = gorget_guard(f'{gid_t}_gorg', bh_steel, trim_paint=bh_brass, ease=0.026)
    bh_pld = articulated_pauldrons(f'{gid_t}_pld', bh_steel, trim_paint=bh_brass, lames=2, haute_piece=False, ease=0.024)
    bh_seal = rosette(f'{gid_t}_warrant_star', _nearest_pt(bh_cuir[0].P.reshape(-1, 3), chest_front(core.CHEST + 0.04, 0.045, x=0.058)),
                      np.array([0.0, -1.0, 0.0]), left, 0.026,
                      P('brass', 0.02, [B('top', 0.0, 0.02, 'solid', 'cap_warrant_wax')], fabric='metal.gold'),
                      n=12, thick=0.010, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Sculpted Steel Warrant Cuirass over Oilskin Duster & Charter Star', 'torso', 'captives_and_arena',
        [bh_coat, bh_cuir, bh_gorg, bh_pld, sleeves(gid_t, 'wrist', 0.019, dust_p), bh_seal],
    ))

    gid_g = f'cap_{sex}_bounty_steel_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Sculpted Steel Bailiff Vambraces & Gauntlets', 'gloves', 'captives_and_arena',
        [sculpted_vambraces(f'{gid_g}_vmb', bh_steel, trim_paint=bh_brass, couter=True, ease=0.020),
         full_gloves(gid_g, bh_steel, sc_hide, f0=0.86, knuckle_paint=bh_brass)],
    ))

    gid_l = f'cap_{sex}_bounty_riding_breeches'
    bh_br_p = P('charcoal', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'brass')], fabric='cloth.wool.fulled')
    entries.append(assemble_garment(
        gid_l, 'Charcoal Bailiff Breeches & Hinged Steel Tassets', 'legs', 'captives_and_arena',
        [trousers(gid_l, bh_br_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
         hinged_tassets(f'{gid_l}_tas', bh_steel, trim_paint=bh_brass, lames=3, ease=0.026)],
        legged=True,
    ))

    gid_f = f'cap_{sex}_bounty_jackboots'
    entries.append(assemble_garment(
        gid_f, 'Sculpted Steel Greaves & Bailiff Jackboots', 'feet', 'captives_and_arena',
        [boots(gid_f, P('soot', 0.08), P('repblack', 0.04, fabric='leather.polished'),
               top=0.26, ease_top=0.022),
         sculpted_greaves(f'{gid_f}_grv', bh_steel, trim_paint=bh_brass, poleyn=True, ease=0.025)],
    ))

    gid_b = f'cap_{sex}_bounty_warrant_pack'
    pad, anc = _dorsal_pad(gid_b, sc_hide, clearance=0.018)
    wtube = horn(f'{gid_b}_warrant_cylinder',
                 [anc - left * 0.09 + up * 0.08 + BACK_DIR * 0.024,
                  anc + left * 0.09 + up * 0.08 + BACK_DIR * 0.024],
                 0.032, 0.032,
                 P('brass', 0.02, [B('top', 0.0, 0.04, 'solid', 'cap_warrant_wax')], fabric='metal.bronze'),
                 n=12, rows=6, rigid_joint='Spine2')
    bolster = blob(f'{gid_b}_bolo_case', anc - up * 0.05 + BACK_DIR * 0.024, (0.19, 0.065, 0.18),
                   sc_hide, n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Wax-Sealed Brass Warrant Cylinder & Bolo Pack', 'back', 'captives_and_arena',
                                    [pad, bolster, wtube]))

    return entries


def _outfits_for_sex(sex):
    return {
        'blitrit_plantation_thrall': {
            'head': f'cap_{sex}_blitrit_reed_hat',
            'torso': f'cap_{sex}_blitrit_collar_harness',
            'gloves': f'cap_{sex}_blitrit_wrist_binds',
            'legs': f'cap_{sex}_blitrit_loin_kilt',
            'feet': f'cap_{sex}_blitrit_marsh_sandals',
            'back': f'cap_{sex}_blitrit_reed_sheaf',
        },
        'nazar_salvage_chaingang': {
            'head': f'cap_{sex}_nazar_convict_band',
            'torso': f'cap_{sex}_nazar_shackle_yoke',
            'gloves': f'cap_{sex}_nazar_iron_manacles',
            'legs': f'cap_{sex}_nazar_convict_trousers',
            'feet': f'cap_{sex}_nazar_fetter_sandals',
            'back': f'cap_{sex}_nazar_slag_hod',
        },
        'solstice_altar_captive': {
            'head': f'cap_{sex}_solstice_garland_wreath',
            'torso': f'cap_{sex}_solstice_sacred_pectoral',
            'gloves': f'cap_{sex}_solstice_gilt_cuffs',
            'legs': f'cap_{sex}_solstice_altar_skirt',
            'feet': f'cap_{sex}_solstice_cord_sandals',
            'back': f'cap_{sex}_solstice_tablet_yoke',
        },
        'galley_oar_thrall': {
            'head': f'cap_{sex}_galley_sweat_rag',
            'torso': f'cap_{sex}_galley_bench_harness',
            'gloves': f'cap_{sex}_galley_oar_wraps',
            'legs': f'cap_{sex}_galley_breech_kilt',
            'feet': f'cap_{sex}_galley_deck_sandals',
            'back': f'cap_{sex}_galley_chain_gourd',
        },
        'span_bone_myrmillo': {
            'head': f'cap_{sex}_span_myrmillo_helm',
            'torso': f'cap_{sex}_span_myrmillo_harness',
            'gloves': f'cap_{sex}_span_bone_manica',
            'legs': f'cap_{sex}_span_subligaculum',
            'feet': f'cap_{sex}_span_greave_sandals',
            'back': f'cap_{sex}_span_scutum_rack',
        },
        'drum_cauldron_pitfighter': {
            'head': f'cap_{sex}_cauldron_cage_helm',
            'torso': f'cap_{sex}_cauldron_scrap_harness',
            'gloves': f'cap_{sex}_cauldron_cestus_gauntlets',
            'legs': f'cap_{sex}_cauldron_pit_breeches',
            'feet': f'cap_{sex}_cauldron_iron_stompers',
            'back': f'cap_{sex}_cauldron_saw_buckler',
        },
        'arena_retiarius_netter': {
            'head': f'cap_{sex}_retiarius_browband',
            'torso': f'cap_{sex}_retiarius_galerus',
            'gloves': f'cap_{sex}_retiarius_manica_L',
            'legs': f'cap_{sex}_retiarius_kilt',
            'feet': f'cap_{sex}_retiarius_sandals',
            'back': f'cap_{sex}_retiarius_cast_net',
        },
        'arena_champion': {
            'head': f'cap_{sex}_champion_cassid_helm',
            'torso': f'cap_{sex}_champion_phalera_harness',
            'gloves': f'cap_{sex}_champion_scale_gauntlets',
            'legs': f'cap_{sex}_champion_pteruges',
            'feet': f'cap_{sex}_champion_greave_boots',
            'back': f'cap_{sex}_champion_victory_mantle',
        },
        'slave_catcher': {
            'head': f'cap_{sex}_catcher_slouch_hat',
            'torso': f'cap_{sex}_catcher_brigandine',
            'gloves': f'cap_{sex}_catcher_whip_gauntlets',
            'legs': f'cap_{sex}_catcher_trail_trousers',
            'feet': f'cap_{sex}_catcher_mud_boots',
            'back': f'cap_{sex}_catcher_shackle_rack',
        },
        'licensed_bounty_hunter': {
            'head': f'cap_{sex}_bounty_sallet_helm',
            'torso': f'cap_{sex}_bounty_splint_duster',
            'gloves': f'cap_{sex}_bounty_steel_gauntlets',
            'legs': f'cap_{sex}_bounty_riding_breeches',
            'feet': f'cap_{sex}_bounty_jackboots',
            'back': f'cap_{sex}_bounty_warrant_pack',
        },
    }


def build_captives_and_arena_peoples_entry():
    return {
        'id': 'captives_and_arena',
        'name': 'Captives, Gladiators & Manhunters',
        'note': (
            "Cross-cutting enslaved castes, arena fighters, and manhunters across the continent: Voth's 74,000 "
            "Shim Blïtrit blood-reed thralls, Nazar salvage chain-gangs, and solstice sun-altar captives; Ring Sea "
            "galley oar-thralls; Span megafauna-bone myrmillos, Drum Cauldron scrap-pitfighters, Arena Hill retiarii "
            "and laurelled champions; plus coffle slave-catchers and chartered Seal-warrant bounty hunters."
        ),
        'ancestry': {'african': [0.15, 0.45], 'asian': [0.20, 0.55], 'caucasian': [0.15, 0.45]},
        'skin': ['#d6aa84', '#b88662', '#8f6347', '#6a4936'],
        'hair': ['#14100d', '#241a14', '#3b281c', '#543a26'],
        'eyes': ['#2e1d12', '#4a301c', '#63472b', '#3a4a4e'],
        'grey': 0.55,
        'beard': 0.35,
        'styles': {
            'male': ['short02', 'cortu_short_messy_hair', 'Low_Fade', 'braid01', 'ponytail01', 'Dreads_with_Fade'],
            'female': ['braid01', 'ponytail01', 'short03', 'bob02', 'rehmanpolanski_hair_bun_brown', 'elvs_double_mh_braid'],
        },
        'tiers': CAPTIVES_TIER_SHARES,
        'tier_labels': CAPTIVES_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_captives_and_arena_kit():
    entries = []
    with _cap_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_captives_and_arena_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_captives_and_arena_kit()
    peoples_entry = build_captives_and_arena_peoples_entry()
    manifest_path = CULTURES_DIR / 'captives_and_arena_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'captives_and_arena',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Captives & Arena pieces ({n_m} male, {n_f} female) across 10 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
