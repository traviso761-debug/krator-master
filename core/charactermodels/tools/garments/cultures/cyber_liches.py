"""The Cyber-Lich Wardrobe & Prosthetics Kit (`cyber_liches`).

Compiles 50 procedural garments & skeletal cyber-prosthetics (25 `mpfb_male` `clich_m_*` +
25 `mpfb_female` `clich_f_*`) across 4 distinct Cyber-Lich archetypes + 1 deployed tentacle variant,
faithful to the 4 Cyber-Lich concept plates:

1. `voltaic_lich` (Voltaic Arc-Lich):
   - `head`:   `clich_{s}_voltaic_skull`      (pale chrome skull-mask, red eyes, brow dot, brass temple Tesla electrodes)
   - `torso`:  `clich_{s}_voltaic_robe`       (ribbed dark cuirass w/ lime thoracic vents, bronze Tesla right pauldron,
                                               crimson sash/scarf, draped violet stole, cloth-sim layered violet robes)
   - `back`:   `clich_{s}_voltaic_capacitor`  (flush dorsal Spine2 voltaic capacitor & glowing lime arc-coil rig)
   - `gloves`: `clich_{s}_voltaic_gauntlets`  (articulated dark-alloy & bronze cyber-gauntlets)
   - `legs`:   `clich_{s}_voltaic_greaves`    (dark violet-black trousers w/ bronze-obsidian greaves)
   - `feet`:   `clich_{s}_voltaic_boots`      (dark bronze-capped cyber-boots)

2. `reliquary_lich` (Pharaonic Reliquary-Lich):
   - `head`:   `clich_{s}_reliquary_headdress` (twin-pillar copper/bronze pharaonic headdress, pale skull, lime eyes, chin-bar)
   - `torso`:  `clich_{s}_reliquary_robe`      (asymmetric bronze cyber-thorax w/ lime ribs, plum-violet & crimson draped robe,
                                                cloth-sim slatted under-skirt w/ bronze skull talismans)
   - `back`:   `clich_{s}_reliquary_servo_arms` (flush dorsal scapula mount w/ twin multi-jointed bronze servo-claw
                                                 mechadendrites cradling a glowing emerald-lime reliquary orb)
   - `gloves`: `clich_{s}_reliquary_gauntlets` (tarnished bronze cyber-arm gauntlets & crimson wraps)
   - `legs`:   `clich_{s}_reliquary_trousers`  (dark plum under-trousers w/ bronze bands)
   - `feet`:   `clich_{s}_reliquary_boots`     (bronze-plated cyber-boots)

3. `alchemical_lich` (Alchemical Rebreather-Lich):
   - `head`:   `clich_{s}_alchemical_rebreather` (tarnished brass cranial dome, radial acupuncture pins, tri-optic emerald-cyan
                                                  lenses, corrugated rebreather hoses)
   - `torso`:  `clich_{s}_alchemical_coat`       (wide scrolled indigo-violet studded pauldrons, black/violet cloth-sim coat,
                                                  violet front tabard w/ white inverted-triangle motif, leather belt pouch)
   - `back`:   `clich_{s}_alchemical_manifold`   (flush dorsal brass alchemical manifold & glowing emerald canisters)
   - `gloves`: `clich_{s}_alchemical_gauntlets`  (tarnished brass cyber-clawed gauntlets w/ radial forearm pins)
   - `legs`:   `clich_{s}_alchemical_trousers`   (dark charcoal alchemical trousers)
   - `feet`:   `clich_{s}_alchemical_boots`      (obsidian cyber-boots)

4. `tentacle_lich` & `tentacle_lich_deployed` (Spine-Tentacle Cyber-Lich — Full Skeletal Prosthetics):
   - `head`:   `clich_{s}_cyber_skull`           (verdigris/pale-jade cyber-skull, glowing green eyes, audio-ports, 3-spike crown)
   - `torso`:  `clich_{s}_cyber_chassis`         (exposed gunmetal & jade ribcage/spine chassis + asymmetric circuit capelet)
   - `gloves`: `clich_{s}_cyber_arms`            (full prosthetic skeletal gunmetal & jade arms + articulated claw-hands)
   - `legs`:   `clich_{s}_cyber_legs`            (full prosthetic skeletal gunmetal & jade legs w/ mechanical knees)
   - `feet`:   `clich_{s}_cyber_feet`            (full prosthetic skeletal cyber-feet w/ splayed mechanical toes)
   - `back`:   `clich_{s}_spine_tentacles`       (flush dorsal Spine2 rack w/ 6 articulated sweeping cyber-tentacles)
   - `back`*:  `clich_{s}_spine_tentacles_extended` (alternate deployed/extended 6-tentacle fan variant)

Run standalone to compile all `.glb` + `.morph.bin` pieces and emit `cyber_liches_manifest.json`:
    python -u tools/garments/cultures/cyber_liches.py
"""
import base64
import concurrent.futures
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

import glbio
import make_mpfb
from garments import core
from garments import paint as paint_mod
from garments.core import (
    Part, J, L, R, FRONT, spine_at, first_hit, head_frame,
    chest_front, ring_points, set_body, assemble_garment as _core_assemble,
)
from garments.paint import P, B, PN, C
from garments.types.torso import torso_tube, collar, collar_disc, tabard
from garments.types.armor import (
    cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import limb_tube, sleeve, trousers, full_gloves
from garments.types.footwear import boot, boots

# ===============================================================================================================
# Scoped Palette Colors (Linear RGB, `clich_` prefixed to avoid global collisions)
# ===============================================================================================================
CLICH_COLORS = {
    'clich_obsidian':  (0.035, 0.035, 0.045),
    'clich_charcoal':  (0.085, 0.090, 0.100),
    'clich_gunmetal':  (0.165, 0.180, 0.190),
    'clich_steel':     (0.380, 0.410, 0.430),
    'clich_chrome':    (0.760, 0.750, 0.710),
    'clich_ashbone':   (0.680, 0.675, 0.640),
    'clich_violet':    (0.175, 0.095, 0.285),
    'clich_violet_hi': (0.290, 0.170, 0.440),
    'clich_plum':      (0.195, 0.068, 0.175),
    'clich_plum_dk':   (0.095, 0.035, 0.095),
    'clich_indigo':    (0.160, 0.145, 0.340),
    'clich_indigo_hi': (0.265, 0.240, 0.500),
    'clich_crimson':   (0.390, 0.060, 0.065),
    'clich_crimson_dk':(0.210, 0.032, 0.042),
    'clich_bronze':    (0.420, 0.300, 0.125),
    'clich_bronze_dk': (0.230, 0.155, 0.065),
    'clich_copper':    (0.430, 0.215, 0.115),
    'clich_copper_dk': (0.245, 0.115, 0.062),
    'clich_brass':     (0.490, 0.395, 0.195),
    'clich_brass_dk':  (0.280, 0.220, 0.105),
    'clich_gold':      (0.760, 0.575, 0.175),
    'clich_gold_dk':   (0.460, 0.330, 0.095),
    'clich_arcane_v':  (0.540, 0.160, 0.920),
    'clich_leather':   (0.240, 0.145, 0.090),
    'clich_lime':      (0.550, 0.940, 0.140),
    'clich_limecore':  (0.840, 1.000, 0.420),
    'clich_redglow':   (0.950, 0.120, 0.090),
    'clich_emerald':   (0.100, 0.880, 0.520),
    'clich_emcore':    (0.450, 1.000, 0.780),
    'clich_jade':      (0.380, 0.540, 0.430),
    'clich_jade_dk':   (0.210, 0.310, 0.250),
    'clich_jadecore':  (0.620, 0.960, 0.580),
    'clich_cybercyan': (0.060, 0.900, 0.980),
    'clich_cyancore':  (0.620, 0.990, 1.000),
    'clich_magenta':   (0.960, 0.100, 0.720),
    'clich_magentacore': (1.000, 0.560, 0.920),
    'clich_acidgreen': (0.180, 1.000, 0.280),
    'clich_acidcore':  (0.760, 1.000, 0.680),
    'clich_carbon':    (0.055, 0.062, 0.075),
    'clich_verdigris': (0.200, 0.420, 0.340),
    'clich_chalk':     (0.880, 0.890, 0.900),
}
for _ck, _cv in CLICH_COLORS.items():
    C.setdefault(_ck, _cv)

FULL_HEAD_HIDE_PARTS = [
    'Human.lips',
    'Human.ears',
    'Human.eyebrow001',
    'Human.eyebrow002',
    'Human.eyelashes01',
    'Human.eyelashes02',
    'Human.low-poly',
]

# ===============================================================================================================
# Scoped Custom Motifs (Zero Global Mutation, Zero Cross-Cultural Leaks)
# ===============================================================================================================
CLICH_CUSTOM_MOTIFS = {
    'clich_voltaic_cuirass',
    'clich_voltaic_robe',
    'clich_voltaic_skull',
    'clich_cyber_skull',
    'clich_reliquary_robe',
    'clich_pharaonic_plaque',
    'clich_eg_etn_usekh',
    'clich_eg_etn_apron',
    'clich_alchemical_tabard',
    'clich_alchemical_pauldron',
    'clich_alchemical_brass',
    'clich_alchemical_coat_tex',
    'clich_circuit_poncho',
    'clich_jade_chassis',
    'clich_skull_face',
}


def _clich_custom_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'clich_voltaic_cuirass':
        # Science-fantasy arcane-tech cyber-archmage cuirass: dark gunmetal cyber-plate with
        # royal-violet enameled panels, gilded filigree borders & luminous arcane-cyan/violet rune circuits
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        rib = ((v * 8.0) % 1.0)
        seam = (rib < 0.11) | (au < 0.026) | (np.abs(au - 0.52) < 0.020) | (np.abs(v - 0.50) < 0.020)
        # Royal-violet enameled inset panels framed in brushed gold filigree
        enamel_panel = (au > 0.10) & (au < 0.48) & (v > 0.14) & (v < 0.84) & (rib >= 0.24) & (rib < 0.82)
        gold_filigree = (
            ((np.abs(au - 0.10) < 0.018) | (np.abs(au - 0.48) < 0.018)) & (v > 0.12) & (v < 0.86)
        ) | (
            ((np.abs(v - 0.14) < 0.018) | (np.abs(v - 0.84) < 0.018)) & (au < 0.54)
        ) | (
            (au > 0.06) & (au < 0.52) & (rib >= 0.11) & (rib < 0.20)
        )
        # Arcane-circuit diamond runes & angular energy conduits
        rune_dia = (np.abs(au - 0.29) + np.abs((v - 0.32) * 1.4)) < 0.095
        rune_dia_in = (np.abs(au - 0.29) + np.abs((v - 0.32) * 1.4)) < 0.055
        rune_ring = rune_dia & (~rune_dia_in)
        pcb_v1 = (np.abs(au - 0.17) < 0.013) & (v > 0.16) & (v < 0.82)
        pcb_d = (np.abs((v - 0.56) - 0.48 * (au - 0.26)) < 0.014) & (au > 0.15) & (au < 0.50)
        arcane_tr = (np.abs((v - 0.68) + 0.42 * (au - 0.26)) < 0.012) & (au > 0.14) & (au < 0.48)
        # Central arcane-tech V-emitter + slanted luminous cyan vents
        core_v = (v > 0.16) & (v < 0.36) & (au < 0.14 * (1.0 - (v - 0.16) / 0.21))
        vent1 = (v > 0.40) & (v < 0.47) & (au > 0.18) & (au < 0.44) & (np.abs((v - 0.435) - 0.16 * (au - 0.30)) < 0.020)
        vent2 = (v > 0.60) & (v < 0.67) & (au > 0.18) & (au < 0.42) & (np.abs((v - 0.635) - 0.16 * (au - 0.28)) < 0.019)
        img[enamel_panel] = C['clich_violet']
        img[gold_filigree] = C['clich_gold']
        img[seam] = C['clich_obsidian']
        img[arcane_tr] = C['clich_arcane_v']
        img[pcb_v1 | pcb_d | rune_ring] = C['clich_cybercyan']
        img[core_v | vent1 | vent2] = fg
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_voltaic_robe':
        # Clean upright science-fantasy royal-violet brocade with gilded arcane filigree trim (zero high-freq moire)
        pleat = 0.84 + 0.16 * np.sin(u * 2.0 * math.pi * 6.0)
        img[:] = np.asarray(bg)[None, None, :] * pleat[:, :, None]
        gold_hem = (v > 0.86) & (v < 0.96)
        dark_piping = (np.abs(v - 0.855) < 0.012) | (v >= 0.96)
        rune_u = ((u * 8.0) % 1.0)
        cyan_rune = (np.abs(v - 0.91) < 0.016) & (rune_u > 0.18) & (rune_u < 0.82)
        hi_fold = (np.sin(u * 2.0 * math.pi * 6.0) > 0.60) & (~gold_hem) & (~dark_piping)
        img[hi_fold] = 0.62 * img[hi_fold] + 0.38 * np.asarray(fg)
        img[gold_hem] = C['clich_gold']
        img[dark_piping] = C['clich_obsidian']
        img[cyan_rune] = C['clich_cybercyan']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_voltaic_skull':
        # Science-fantasy brushed silver-chrome cyber-archmage skull with gilded filigree & arcane runes
        mu = (u - 0.5) * 2.0
        au = np.abs(mu)
        eye_sock = np.hypot((au - 0.27) * 2.2, (v - 0.40) * 2.8) < 0.36
        nasal = (v > 0.46) & (v < 0.64) & (au < 0.11 * ((v - 0.42) / 0.24))
        seam_mid = (au < 0.016) & (v < 0.40)
        gold_brow = (np.abs(v - 0.25) < 0.022) & (au < 0.68)
        gold_cheek = (np.abs((v - 0.54) - 0.30 * (au - 0.35)) < 0.020) & (au > 0.20) & (au < 0.74)
        violet_cheek = (au > 0.42) & (au < 0.72) & (v > 0.56) & (v < 0.80)
        jaw_line = (v > 0.74) & (v < 0.80) & (au < 0.32)
        teeth = (v > 0.70) & (v < 0.85) & (au < 0.26) & (np.abs(((mu * 16.0) % 1.0) - 0.5) < 0.24)
        cyan_trace = ((np.abs(v - 0.22) < 0.010) & (au > 0.12) & (au < 0.56)) | (
            (np.abs(au - 0.48) < 0.011) & (v > 0.24) & (v < 0.54)
        )
        img[violet_cheek] = C['clich_violet']
        img[gold_brow | gold_cheek] = C['clich_gold']
        img[eye_sock | nasal | seam_mid | jaw_line] = C['clich_obsidian']
        img[teeth] = fg
        img[cyan_trace] = C['clich_cybercyan']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_cyber_skull':
        # High-contrast cyberpunk chrome & matte-carbon skull-plate with panel seams, vents & cyan/magenta traces
        mu = (u - 0.5) * 2.0
        au = np.abs(mu)
        eye_sock = np.hypot((au - 0.27) * 2.2, (v - 0.40) * 2.8) < 0.36
        nasal = (v > 0.46) & (v < 0.64) & (au < 0.11 * ((v - 0.42) / 0.24))
        seam_mid = (au < 0.018) & (v < 0.42)
        seam_brow = (np.abs(v - 0.27) < 0.016) & (au < 0.66)
        seam_cheek = (np.abs((v - 0.54) - 0.32 * (au - 0.35)) < 0.018) & (au > 0.20) & (au < 0.76)
        carbon_cheek = (au > 0.42) & (au < 0.74) & (v > 0.54) & (v < 0.82)
        vent_slits = (au > 0.45) & (au < 0.66) & (v > 0.58) & (v < 0.76) & (((v * 26.0) % 1.0) < 0.36)
        jaw_line = (v > 0.74) & (v < 0.80) & (au < 0.32)
        teeth = (v > 0.70) & (v < 0.85) & (au < 0.26) & (np.abs(((mu * 16.0) % 1.0) - 0.5) < 0.24)
        cyan_trace = ((np.abs(v - 0.245) < 0.009) & (au > 0.14) & (au < 0.54)) | (
            (np.abs(au - 0.46) < 0.010) & (v > 0.24) & (v < 0.54)
        )
        mag_trace = (np.abs(v - 0.295) < 0.007) & (au > 0.18) & (au < 0.48)
        img[carbon_cheek] = C['clich_carbon']
        img[eye_sock | nasal | seam_mid | seam_brow | seam_cheek | vent_slits | jaw_line] = C['clich_obsidian']
        img[teeth] = fg
        img[cyan_trace] = C['clich_cybercyan']
        img[mag_trace] = C['clich_magenta']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_reliquary_robe':
        # Plum-violet & Eternian celadon-bronze cyber-robe with Egyptian Djed / Eternian ancestor circuit column
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        fold = 0.82 + 0.18 * np.sin(u * 2.0 * math.pi * 14.0 + v * 2.5)
        img[:] = np.asarray(bg)[None, None, :] * fold[:, :, None]
        # Central Egyptian-Eternian dark obsidian & celadon-jade circuit wedge
        w_col = 0.27 * (0.48 + 0.62 * v)
        in_col = (au < w_col) & (v > 0.20)
        pleat_bar = in_col & ((((u * 38.0) % 1.0) < 0.22) | (((v * 16.0) % 1.0) < 0.14))
        img[in_col] = C['clich_obsidian']
        # Alternating celadon-jade & bronze stepped Eternian/Djed rungs inside the front column
        rung = in_col & (~pleat_bar) & (((v * 8.0) % 1.0) > 0.52) & (((v * 8.0) % 1.0) < 0.84)
        jade_rung = rung & ((((v * 4.0) % 1.0) < 0.5))
        bronze_rung = rung & (~jade_rung)
        img[jade_rung] = C['clich_jade']
        img[bronze_rung] = C['clich_bronze']
        # Glowing cyan & lime PCB trace borders framing the column and lower hem
        col_frame = (np.abs(au - w_col) < 0.020) & (v > 0.20)
        col_neon = (np.abs(au - (w_col + 0.026)) < 0.008) & (v > 0.22) & (((v * 20.0) % 1.0) < 0.72)
        hem_band = (v > 0.88) & (v < 0.96)
        hem_meander = hem_band & ((((u * 20.0) % 1.0) < 0.50) ^ (((v * 40.0) % 1.0) < 0.50))
        img[col_frame] = C['clich_bronze']
        img[hem_band] = C['clich_obsidian']
        img[hem_meander] = C['clich_jade']
        img[col_neon] = C['clich_cybercyan']
        hem_glow = (np.abs(v - 0.875) < 0.007)
        img[hem_glow] = C['clich_lime']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_pharaonic_plaque':
        # Cybernetic Egyptian Nemes + Eternian Celadon-Jade & Bronze stepped circuit busbars
        band = (v * 8.0) % 1.0
        idx_b = np.floor(v * 8.0) % 2
        groove = (band < 0.18) | (u < 0.07) | (u > 0.93)
        jade_inlay = (~groove) & (idx_b == 0) & (band > 0.24) & (band < 0.78) & (u > 0.16) & (u < 0.84)
        bronze_inlay = (~groove) & (idx_b == 1) & (band > 0.22) & (band < 0.82)
        pcb_line = (np.abs(band - 0.50) < 0.06) & (idx_b == 0) & (((u * 10.0) % 1.0) > 0.22) & (u > 0.18) & (u < 0.82)
        edge_trim = ((u >= 0.07) & (u <= 0.16)) | ((u >= 0.84) & (u <= 0.93))
        img[bronze_inlay | edge_trim] = fg
        img[jade_inlay] = C['clich_jade']
        img[groove] = C['clich_obsidian']
        img[pcb_line] = C['clich_cybercyan']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_eg_etn_usekh':
        # Egyptian Usekh Broad-Collar fused with Eternian Jade & Cyan PCB Traces
        tier = (v * 5.0) % 1.0
        t_idx = np.floor(v * 5.0)
        bead = ((u * 28.0) % 1.0)
        seam = (tier < 0.16) | (bead < 0.14)
        img[:] = C['clich_bronze']
        jade_row = (~seam) & ((t_idx == 1) | (t_idx == 3))
        copper_row = (~seam) & (t_idx == 2)
        img[jade_row] = C['clich_jade']
        img[copper_row] = C['clich_copper']
        img[seam] = C['clich_obsidian']
        neon_ring = (np.abs(v - 0.39) < 0.016) | (np.abs(v - 0.79) < 0.016)
        drop_gem = (t_idx == 4) & (tier > 0.35) & (tier < 0.82) & (bead > 0.30) & (bead < 0.72)
        img[neon_ring] = C['clich_cybercyan']
        img[drop_gem] = C['clich_lime']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_eg_etn_apron':
        # Egyptian Shendyt + Eternian Bufu Circuit-Maze Front Apron
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        border = (au > 0.84) | (v > 0.93) | (v < 0.05)
        frame1 = (np.abs(au - 0.72) < 0.045) | (np.abs(v - 0.14) < 0.020) | (np.abs(v - 0.84) < 0.020)
        # Stepped Eternian Bufu / Djed circuit maze inside apron
        djed_spine = (au < 0.12) & (v > 0.18) & (v < 0.80)
        djed_bars = (au < 0.48) & (v > 0.22) & (v < 0.54) & (((v * 14.0) % 1.0) < 0.45)
        scarab_dia = (np.abs(au) + np.abs(v - 0.68) * 1.6) < 0.34
        scarab_core = (np.abs(au) + np.abs(v - 0.68) * 1.6) < 0.15
        img[:] = C['clich_obsidian']
        img[border] = C['clich_bronze_dk']
        img[frame1] = C['clich_jade']
        img[djed_spine | djed_bars] = fg
        img[scarab_dia] = C['clich_jade']
        img[scarab_core] = C['clich_lime']
        pcb = (np.abs(au - 0.56) < 0.022) & (v > 0.18) & (v < 0.80) & (((v * 18.0) % 1.0) < 0.68)
        img[pcb] = C['clich_cybercyan']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_alchemical_tabard':
        # Violet front tabard with crisp white inverted-triangle alchemical glyph & dark scroll border
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        border = (au > 0.84) | (v > 0.93)
        # Inverted triangle (apex down at v=0.58, top bar at v=0.14)
        tri_top = (np.abs(v - 0.14) < 0.022) & (au < 0.54)
        tri_side = (v >= 0.14) & (v <= 0.62) & (np.abs(au - 0.54 * (0.62 - v) / 0.48) < 0.036)
        tri_in_top = (np.abs(v - 0.22) < 0.014) & (au < 0.36)
        tri_in_side = (v >= 0.22) & (v <= 0.52) & (np.abs(au - 0.36 * (0.52 - v) / 0.30) < 0.022)
        swirl = (v > 0.68) & (v < 0.88) & (np.abs(np.sin(su * 5.0 + v * 10.0)) < 0.14)
        img[border] = C['clich_obsidian']
        img[swirl] = C['clich_indigo']
        img[tri_top | tri_side | tri_in_top | tri_in_side] = fg
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_alchemical_pauldron':
        # Deep indigo/violet scrolled baroque-alchemical embossing with brass rivet dots
        su = (u - 0.5) * 2.0
        sv = (v - 0.5) * 2.0
        r1 = np.hypot((su - 0.35) * 1.4, (sv + 0.05) * 1.5)
        r2 = np.hypot((su + 0.35) * 1.4, (sv - 0.05) * 1.5)
        scroll = (np.abs(r1 - 0.36) < 0.065) | (np.abs(r2 - 0.36) < 0.065) | (np.abs(sv - 0.22 * np.sin(su * 4.5)) < 0.055)
        riv = (np.hypot(((u * 6.0) % 1.0) - 0.5, ((v * 3.0) % 1.0) - 0.5) < 0.14) & (np.abs(sv) > 0.62)
        rim = (np.abs(sv) > 0.86) | (np.abs(su) > 0.90)
        img[scroll] = fg
        img[rim] = C['clich_obsidian']
        img[riv] = C['clich_brass']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_alchemical_brass':
        # Multi-tiered riveted tarnished brass & verdigris diving/rebreather plates w/ corrugated ribs & emerald micro-ports
        pu = (u * 5.0) % 1.0
        pv = (v * 5.0) % 1.0
        corrug = 0.86 + 0.14 * np.sin(v * 2.0 * math.pi * 24.0)
        img[:] = np.asarray(bg)[None, None, :] * corrug[:, :, None]
        seam = (pu < 0.060) | (pv < 0.065) | (np.abs(u - 0.5) < 0.018)
        bevel = ((pu >= 0.060) & (pu < 0.115)) | ((pv >= 0.065) & (pv < 0.120))
        riv = (
            (np.hypot(pu - 0.17, pv - 0.18) < 0.068)
            | (np.hypot(pu - 0.83, pv - 0.18) < 0.068)
            | (np.hypot(pu - 0.17, pv - 0.82) < 0.068)
            | (np.hypot(pu - 0.83, pv - 0.82) < 0.068)
        )
        patina = (np.sin(u * 21.0 + v * 15.0) * np.cos(u * 13.0 - v * 25.0)) > 0.26
        verdigris_band = (np.abs(v - 0.32) < 0.045) | (np.abs(v - 0.72) < 0.045)
        acid_port = (np.hypot(pu - 0.50, pv - 0.50) < 0.085) & (v > 0.28) & (v < 0.74)
        # Crisp white inverted-triangle alchemical mark on upper brow/chest center
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        tri = ((np.abs(v - 0.20) < 0.014) & (au < 0.18)) | (
            (v >= 0.20) & (v <= 0.42) & (np.abs(au - 0.18 * (0.42 - v) / 0.22) < 0.018)
        )
        img[patina] = 0.48 * img[patina] + 0.52 * np.asarray(C['clich_verdigris'])
        img[verdigris_band] = 0.42 * img[verdigris_band] + 0.58 * np.asarray(C['clich_verdigris'])
        img[bevel] = 0.65 * np.asarray(C['clich_brass_dk']) + 0.35 * np.asarray(C['clich_copper'])
        img[seam] = C['clich_obsidian']
        img[riv] = fg
        img[acid_port] = C['clich_acidgreen']
        img[tri] = C['clich_chalk']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_alchemical_coat_tex':
        # Layered charcoal-and-violet paneled alchemical coat with metallic clasp rivets & indigo stitch lines
        pleat = 0.84 + 0.16 * np.sin(u * 2.0 * math.pi * 12.0)
        img[:] = np.asarray(bg)[None, None, :] * pleat[:, :, None]
        panel_seam = (np.abs(((u * 6.0) % 1.0) - 0.5) < 0.025) | (np.abs(v - 0.46) < 0.020)
        indigo_trim = (np.abs(((u * 6.0) % 1.0) - 0.5) < 0.055) & (~panel_seam)
        stud = (np.hypot(((u * 6.0) % 1.0) - 0.38, ((v * 10.0) % 1.0) - 0.5) < 0.06)
        hem = (v > 0.91)
        img[indigo_trim] = fg
        img[panel_seam | hem] = C['clich_obsidian']
        img[stud] = C['clich_brass']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_circuit_poncho':
        # Charcoal-black asymmetrical cyber-poncho with crisp pale-grey/jade geometric PCB trace lines
        t1 = (np.abs((u * 3.0 + v * 1.8) % 1.0 - 0.5) < 0.016) & (v > 0.08) & (v < 0.92)
        t2 = (np.abs((u * 4.5 - v * 0.4) % 1.0 - 0.25) < 0.012) & (((u * 4.5) % 1.0) < 0.52)
        node = (np.hypot(((u * 3.0) % 1.0) - 0.5, ((v * 3.0) % 1.0) - 0.5) < 0.055)
        hem = (v > 0.93) | (v < 0.04)
        img[t1 | t2] = fg
        img[node] = C['clich_jade']
        img[hem] = C['clich_obsidian']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_jade_chassis':
        # Gunmetal plate panels with pale-jade seam channels and dark bevels
        pu = (u * 4.0) % 1.0
        pv = (v * 5.0) % 1.0
        seam = (pu < 0.05) | (pv < 0.06)
        jade_tr = (np.abs(pv - 0.50) < 0.055) & (pu > 0.16) & (pu < 0.84)
        img[jade_tr] = fg
        img[seam] = C['clich_obsidian']
        return np.clip(img, 0.0, 1.0)

    elif style == 'clich_skull_face':
        # Sculpted skull face texture with dark orbital sockets, nasal cavity, and grim teeth
        mu = (u - 0.5) * 2.0
        au = np.abs(mu)
        eye_sock = np.hypot((au - 0.27) * 2.2, (v - 0.40) * 2.8) < 0.34
        nasal = (v > 0.46) & (v < 0.65) & (au < 0.12 * ((v - 0.42) / 0.24))
        teeth = (v > 0.70) & (v < 0.86) & (au < 0.28) & (np.abs(((mu * 15.0) % 1.0) - 0.5) < 0.26)
        jaw_line = (v > 0.75) & (v < 0.81) & (au < 0.30)
        img[eye_sock | nasal | jaw_line] = C['clich_obsidian']
        img[teeth] = fg
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def cyber_liches_motif_scope():
    """Temporarily extend `paint.motif` with Cyber-Lich motifs during compilation (zero global leak)."""
    orig_motif = paint_mod.motif

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        if style in CLICH_CUSTOM_MOTIFS:
            return _clich_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif


# ===============================================================================================================
# Shared Cybernetic & Prosthetic Geometry Primitives
# ===============================================================================================================
def _get_base_joint_names():
    bj, _ = glbio.read_glb(core.BASE_GLB.read_bytes())
    bskin = bj['skins'][0]
    return [bj['nodes'][k].get('name', '').split(':')[-1] for k in bskin['joints']]


def select_body_tris(joint_prefixes, weight_thresh=0.40, mode='mean', gl_pred=None):
    jnames = _get_base_joint_names()
    jmask = np.array([any(nm.startswith(p) for p in joint_prefixes) for nm in jnames], dtype=bool)
    vw = (core.BASE_WW * jmask[core.BASE_JJ]).sum(axis=1)
    tw = vw[core.BT]
    if mode == 'all':
        keep = (tw >= weight_thresh).all(axis=1)
    elif mode == 'any':
        keep = (tw >= weight_thresh).any(axis=1)
    else:
        keep = tw.mean(axis=1) >= weight_thresh
    if gl_pred is not None:
        tri_ctr = core.BP_GL[core.BT].mean(axis=1)
        keep &= gl_pred(tri_ctr, core.BP_GL[core.BT])
    return np.nonzero(keep)[0]


def apply_custom_hide(entry, extra_tris, replace=False):
    n_bt = len(core.BT)
    if (not replace) and entry.get('hide'):
        raw = np.unpackbits(np.frombuffer(base64.b64decode(entry['hide']), dtype=np.uint8), bitorder='little')[:n_bt]
        cur = np.nonzero(raw)[0]
        tris = np.unique(np.concatenate([cur, np.asarray(extra_tris, dtype=np.int32)]))
    else:
        tris = np.unique(np.asarray(extra_tris, dtype=np.int32))
    entry['hide'] = make_mpfb.bits(n_bt, tris)
    entry['hides'] = int(len(tris))
    entry['hide_by'] = 'cyber_custom'
    return entry


def assemble_garment(gid, label, slot, parts, **kw):
    flat_parts = []
    for p in parts:
        if isinstance(p, (list, tuple)):
            flat_parts.extend(x for x in p if x is not None)
        elif p is not None:
            flat_parts.append(p)
    entry = _core_assemble(gid, label, slot, 'cyber_liches', flat_parts, **kw)
    entry['culture'] = 'cyber_liches'
    return entry


def _rigid_part(name, Q, closed, paint, rigid_joint, slot_hint='torso'):
    Q_arr = np.asarray(Q, dtype=np.float64)
    pt = Part(name, Q_arr, closed, ['body'] * len(Q_arr), paint, rigid_joint=rigid_joint)
    if slot_hint == 'torso':
        pt.role = 'armwear'
    elif slot_hint == 'back':
        pt.role = 'drape'
    elif slot_hint == 'legs':
        pt.role = 'accessory'
    elif slot_hint == 'feet':
        pt.role = 'shaft'
    return pt


def _catmull_spline(ctrl_pts, n_samples):
    P_in = np.asarray(ctrl_pts, dtype=np.float64)
    if len(P_in) < 3:
        t = np.linspace(0.0, 1.0, n_samples)[:, None]
        return P_in[0] * (1.0 - t) + P_in[-1] * t
    P_ext = np.vstack([2.0 * P_in[0] - P_in[1], P_in, 2.0 * P_in[-1] - P_in[-2]])
    segs = len(P_in) - 1
    out = []
    for s_idx in range(n_samples):
        u_all = (s_idx / max(n_samples - 1, 1)) * segs
        i = min(int(math.floor(u_all)), segs - 1)
        t = u_all - i
        p0, p1, p2, p3 = P_ext[i], P_ext[i + 1], P_ext[i + 2], P_ext[i + 3]
        pt = 0.5 * (
            (2.0 * p1)
            + (-p0 + p2) * t
            + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * (t * t)
            + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * (t * t * t)
        )
        out.append(pt)
    return np.array(out, dtype=np.float64)


def mech_tube(name, path, r0, r1, paint, n=10, rows=None, rigid_joint=None,
              slot_hint='torso', scale_xy=(1.0, 1.0), ref_dir=None, cap_ends=True):
    pts = [np.asarray(p, dtype=np.float64) for p in path]
    if rows is None:
        rows = max(4, len(pts) * 2)
    d_seg = [np.linalg.norm(pts[i + 1] - pts[i]) for i in range(len(pts) - 1)]
    cum = np.concatenate([[0.0], np.cumsum(d_seg)])
    total = max(float(cum[-1]), 1e-6)
    s_grid = np.linspace(0.0, total, rows)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)

    Q = []
    for idx, s in enumerate(s_grid):
        u_t = idx / max(rows - 1, 1)
        k = int(np.clip(np.searchsorted(cum, s, side='right') - 1, 0, len(pts) - 2))
        seg_l = max(d_seg[k], 1e-8)
        alpha = (s - cum[k]) / seg_l
        c = pts[k] + (pts[k + 1] - pts[k]) * alpha
        tang = pts[min(k + 1, len(pts) - 1)] - pts[max(k, 0)]
        if np.linalg.norm(tang) < 1e-8:
            tang = pts[-1] - pts[0]
        tang = tang / max(np.linalg.norm(tang), 1e-8)
        rv = np.asarray(ref_dir, dtype=np.float64) if ref_dir is not None else (
            np.array([0.0, 1.0, 0.0]) if abs(tang[1]) < 0.88 else np.array([1.0, 0.0, 0.0])
        )
        u_ax = rv - tang * np.dot(rv, tang)
        if np.linalg.norm(u_ax) < 1e-6:
            rv2 = np.array([0.0, 0.0, 1.0]) if abs(tang[2]) < 0.88 else np.array([1.0, 0.0, 0.0])
            u_ax = rv2 - tang * np.dot(rv2, tang)
        u_ax = u_ax / max(np.linalg.norm(u_ax), 1e-8)
        v_ax = np.cross(tang, u_ax)
        v_ax = v_ax / max(np.linalg.norm(v_ax), 1e-8)

        r_cur = r0 * (1.0 - u_t) + r1 * u_t
        cap_scale = 0.16 if (cap_ends and idx in (0, rows - 1) and rows >= 5) else 1.0
        rx = r_cur * scale_xy[0] * cap_scale
        ry = r_cur * scale_xy[1] * cap_scale
        Q.append([c + u_ax * (math.cos(a) * rx) + v_ax * (math.sin(a) * ry) for a in angs])
    return _rigid_part(name, Q, True, paint, rigid_joint, slot_hint=slot_hint)


def mech_sphere(name, center, radius, paint, rigid_joint, slot_hint='back', n=14, rows=9, scale_xyz=(1.0, 1.0, 1.0)):
    c = np.asarray(center, dtype=np.float64)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    phis = np.linspace(-0.48 * math.pi, 0.48 * math.pi, rows)
    Q = []
    for ph in phis:
        rc = max(0.08, math.cos(ph)) * radius
        zc = math.sin(ph) * radius * scale_xyz[2]
        Q.append([
            c + np.array([math.cos(a) * rc * scale_xyz[0], math.sin(a) * rc * scale_xyz[1], zc])
            for a in angs
        ])
    return _rigid_part(name, Q, True, paint, rigid_joint, slot_hint=slot_hint)


def mech_box(name, center, half_ext, paint, rigid_joint, slot_hint='back', tilt_y=0.0):
    c = np.asarray(center, dtype=np.float64)
    hx, hy, hz = half_ext
    ct, st = math.cos(tilt_y), math.sin(tilt_y)
    # Closed 8-point chamfered octagon perimeter extruded along Z
    ring_xy = [
        (-hx, -hy * 0.72), (-hx * 0.72, -hy), (hx * 0.72, -hy), (hx, -hy * 0.72),
        (hx, hy * 0.72), (hx * 0.72, hy), (-hx * 0.72, hy), (-hx, hy * 0.72),
    ]
    Q = []
    for fz, sc in ((1.0, 0.18), (0.94, 1.0), (0.0, 1.0), (-0.94, 1.0), (-1.0, 0.18)):
        z_loc = fz * hz
        row = []
        for lx, ly in ring_xy:
            sx, sy = lx * sc, ly * sc
            ry = sy * ct - z_loc * st
            rz = sy * st + z_loc * ct
            row.append(c + np.array([sx, ry, rz]))
        Q.append(row)
    return _rigid_part(name, Q, True, paint, rigid_joint, slot_hint=slot_hint)


def arched_shell(name, center_spine, rad_x, rad_y, ang_lo, ang_hi, thick, paint, rigid_joint, cols=9, slot_hint='legs'):
    pts = np.asarray(center_spine, dtype=np.float64)
    rows = len(pts)
    angs_outer = np.linspace(ang_lo, ang_hi, cols)
    angs_inner = angs_outer[::-1]
    Q = []
    for i in range(rows):
        c = pts[i]
        rx = rad_x[i] if hasattr(rad_x, '__len__') else rad_x
        ry = rad_y[i] if hasattr(rad_y, '__len__') else rad_y
        cap = 0.88 if i in (0, rows - 1) and rows >= 4 else 1.0
        ring = []
        for a in angs_outer:
            ring.append(c + np.array([math.sin(a) * (rx + thick) * cap, math.cos(a) * (ry + thick) * cap, 0.0]))
        for a in angs_inner:
            ring.append(c + np.array([math.sin(a) * rx * cap, math.cos(a) * ry * cap, 0.0]))
        Q.append(ring)
    return _rigid_part(name, Q, True, paint, rigid_joint, slot_hint=slot_hint)


def piston_assembly(name, p_start, p_end, r_cyl, cyl_paint, rod_paint, rigid_joint, slot_hint='torso'):
    a = np.asarray(p_start, dtype=np.float64)
    b = np.asarray(p_end, dtype=np.float64)
    mid = a + (b - a) * 0.56
    return [
        mech_tube(f'{name}_cyl', [a, mid], r_cyl, r_cyl * 0.98, cyl_paint, n=8, rows=5, rigid_joint=rigid_joint, slot_hint=slot_hint),
        mech_tube(f'{name}_rod', [mid - (b - a) * 0.08, b], r_cyl * 0.58, r_cyl * 0.58, rod_paint, n=8, rows=5, rigid_joint=rigid_joint, slot_hint=slot_hint),
    ]


def dorsal_back_pt(z, offset=0.012, x=0.0):
    """Exact dorsal surface point at height `z` and lateral `x` (+Y is back in builder space)."""
    o = spine_at(min(max(z, core.CROTCH), core.TOP))
    o_ray = np.array([x, o[1], z], dtype=np.float64)
    hit = first_hit(o_ray, np.array([0.0, 1.0, 0.0]), bvh=core.BVH_T)
    if hit is None or hit > 0.35:
        return np.array([x, o[1] + 0.11 + offset, z], dtype=np.float64)
    return np.array([x, float(o[1]) + float(hit) + offset, z], dtype=np.float64)


def _sculpted_skull_dome(gid, skull_p, eye_p, neck_p, left, bk, up, a, b,
                         eye_r=0.014, jaw_drop=False):
    """Reusable sculpted cyber-skull cranium + jaw + neck-spine + glowing eyes."""
    parts = []
    angs = np.linspace(0.0, 2.0 * math.pi, 26, endpoint=False)
    skull_rows = []
    f_vals = np.concatenate([[1.035], np.linspace(1.01, 0.12, 13), [0.02]])
    for f_s in f_vals:
        c_s = a + (b - a) * f_s
        if f_s >= 1.03:
            dome_s = 0.008
        elif f_s <= 0.05:
            dome_s = 0.54
        else:
            dome_s = 1.0 if f_s <= 0.74 else max(0.08, math.cos(math.pi * 0.5 * min(1.0, (f_s - 0.74) / 0.28)) ** 0.78)
        cheek_bulge = 1.06 * math.exp(-(((f_s - 0.42) / 0.12) ** 2))
        maxilla_taper = 1.0 - 0.34 * max(0.0, (0.38 - f_s) / 0.26) if f_s > 0.05 else 0.76
        rx = 0.092 * dome_s * maxilla_taper + (0.009 * cheek_bulge if f_s < 1.02 else 0.0)
        ry = 0.118 * dome_s * (1.0 - 0.18 * max(0.0, (0.36 - f_s) / 0.24)) if f_s > 0.05 else 0.056
        row_s = []
        for an in angs:
            sx_a, cy_a = math.sin(an), math.cos(an)
            frontness = max(0.0, -cy_a)
            scale_feat = 1.0 if (0.08 < f_s < 1.01) else 0.0
            brow = scale_feat * 0.015 * math.exp(-(((f_s - 0.56) / 0.07) ** 2)) * (frontness ** 1.6)
            eye_pit = scale_feat * -0.022 * math.exp(-(((abs(sx_a) - 0.34) / 0.18) ** 2)) * math.exp(-(((f_s - 0.46) / 0.08) ** 2)) * frontness
            nasal_pit = scale_feat * -0.018 * math.exp(-((sx_a / 0.16) ** 2)) * math.exp(-(((f_s - 0.33) / 0.09) ** 2)) * (frontness ** 2)
            zygo = scale_feat * 0.013 * math.exp(-(((abs(sx_a) - 0.58) / 0.18) ** 2)) * math.exp(-(((f_s - 0.39) / 0.08) ** 2)) * frontness
            row_s.append(c_s + left * (sx_a * rx) + bk * (cy_a * ry - (brow + eye_pit + nasal_pit + zygo)))
        skull_rows.append(row_s)
    parts.append(Part(gid + '_cranium', np.array(skull_rows), True, ['body'] * len(skull_rows), skull_p, rigid_joint='Head'))

    # Ribbed mechanical neck column connecting skull cleanly into torso collar (wide enough to prevent neck pinholes)
    parts.append(mech_tube(gid + '_neck_col', [a + (b - a) * 0.30 + bk * 0.010, a - (b - a) * 0.44 + bk * 0.012],
                           0.050, 0.056, neck_p, n=14, rows=6, rigid_joint='Head', slot_hint='head'))

    # Sculpted mandible
    j_drop = -0.05 if jaw_drop else 0.02
    jaw_arc = [
        a + (b - a) * 0.32 - left * 0.068 - bk * 0.024,
        a + (b - a) * (0.12 + j_drop) - left * 0.050 - bk * 0.066,
        a + (b - a) * (0.04 + j_drop) - left * 0.026 - bk * 0.092,
        a + (b - a) * (0.02 + j_drop) - bk * 0.100,
        a + (b - a) * (0.04 + j_drop) + left * 0.026 - bk * 0.092,
        a + (b - a) * (0.12 + j_drop) + left * 0.050 - bk * 0.066,
        a + (b - a) * 0.32 + left * 0.068 - bk * 0.024,
    ]
    parts.append(mech_tube(gid + '_mandible', jaw_arc, 0.016, 0.016, skull_p,
                           n=10, rows=9, rigid_joint='Head', slot_hint='head', scale_xy=(0.82, 1.28)))

    # Glowing eyes seated cleanly inside the orbital sockets
    obs_p = P('clich_obsidian', 0.01, fabric='metal.iron')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        oc = a + (b - a) * 0.46 + left * (sgn * 0.032) - bk * 0.094
        parts.append(mech_tube(f'{gid}_eye_rim_{tag}', [oc + bk * 0.012, oc - bk * 0.005],
                               eye_r * 1.38, eye_r * 1.25, obs_p, n=12, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
        parts.append(mech_tube(f'{gid}_eye_glow_{tag}', [oc + bk * 0.004, oc - bk * 0.012],
                               eye_r, eye_r * 0.85, eye_p, n=12, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    return parts


def _sleeve_tube(name, side, paint, f0=0.06, f1=0.90, ease=0.024, flare=0.010, rows=11, n=20):
    return sleeve(name, side, paint, f0=f0, f1=f1, ease=ease, flare=flare, rows=rows, n=n)


def _gauntlet_pair(gid, main_p, trim_p, claw_p, pin_p=None, radial_pins=False):
    """Articulated cyber-gauntlets covering forearms + hands + articulated finger-claws."""
    parts = []
    up = np.array([0.0, 0.0, 1.0])
    bk = np.array([0.0, 1.0, 0.0])
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        fa_len = max(float(np.linalg.norm(d_fa)), 1e-6)
        u_fa = d_fa / fa_len
        out_x = np.array([sgn, 0.0, 0.0])

        # Tapered cyber-forearm vambrace
        parts.append(mech_tube(f'{gid}_vambrace_{side}',
                               [el + u_fa * (0.14 * fa_len), wr + u_fa * 0.012],
                               0.052, 0.039, main_p, n=12, rows=7,
                               rigid_joint=side + 'ForeArm', slot_hint='gloves'))
        # Elbow & wrist reinforcing cuffs
        parts.append(mech_tube(f'{gid}_cuff_hi_{side}',
                               [el + u_fa * (0.10 * fa_len), el + u_fa * (0.24 * fa_len)],
                               0.056, 0.055, trim_p, n=12, rows=4,
                               rigid_joint=side + 'ForeArm', slot_hint='gloves'))
        parts.append(mech_tube(f'{gid}_cuff_lo_{side}',
                               [wr - u_fa * 0.025, wr + u_fa * 0.018],
                               0.044, 0.042, trim_p, n=12, rows=4,
                               rigid_joint=side + 'Hand', slot_hint='gloves'))

        # Optional radial acupuncture forearm pins (Alchemical Rebreather-Lich)
        if radial_pins and pin_p is not None:
            for k_p, frac_p in enumerate((0.35, 0.56, 0.76)):
                p_base = el + u_fa * (frac_p * fa_len)
                for ang_p in (-0.55, 0.55):
                    p_dir = out_x * math.cos(ang_p) + bk * math.sin(ang_p)
                    p_dir = p_dir / max(np.linalg.norm(p_dir), 1e-6)
                    parts.append(mech_tube(f'{gid}_pin_{side}_{k_p}_{ang_p:+.1f}',
                                           [p_base + p_dir * 0.030, p_base + p_dir * 0.072],
                                           0.0042, 0.0016, pin_p, n=6, rows=4,
                                           rigid_joint=side + 'ForeArm', slot_hint='gloves'))

        # Armored palm & metacarpal shell
        palm_end = wr + u_fa * 0.085
        parts.append(mech_tube(f'{gid}_palm_{side}', [wr - u_fa * 0.008, palm_end],
                               0.040, 0.036, main_p, n=10, rows=5,
                               rigid_joint=side + 'Hand', slot_hint='gloves', scale_xy=(1.15, 0.62)))
        # 4 articulated finger claws + opposable thumb
        side_ax = np.cross(u_fa, bk)
        if np.linalg.norm(side_ax) < 1e-4:
            side_ax = up
        side_ax = side_ax / max(np.linalg.norm(side_ax), 1e-6)
        for fi, off_f in enumerate((-0.026, -0.009, 0.009, 0.026)):
            f_root = palm_end - u_fa * 0.012 + side_ax * off_f
            f_mid = f_root + u_fa * 0.044 - bk * 0.014
            f_tip = f_mid + u_fa * 0.036 - bk * 0.024
            parts.append(mech_tube(f'{gid}_finger_{side}_{fi}', [f_root, f_mid, f_tip],
                                   0.0082, 0.0032, claw_p, n=6, rows=6,
                                   rigid_joint=side + 'Hand', slot_hint='gloves'))
        th_root = wr + u_fa * 0.038 - bk * 0.020 + side_ax * (-0.028 * sgn)
        th_tip = th_root + u_fa * 0.052 - bk * 0.026 + side_ax * (-0.014 * sgn)
        parts.append(mech_tube(f'{gid}_thumb_{side}', [th_root, th_tip],
                               0.0090, 0.0036, claw_p, n=6, rows=5,
                               rigid_joint=side + 'Hand', slot_hint='gloves'))
    return parts


def _tag_blaze(part, color, gain=2.10, pulse=0.18):
    """Attach a native `src/75-extraplanar.js` `emissive_blaze` self-illuminating VFX zone to a Part."""
    part.vfx = {'kind': 'emissive_blaze', 'color': color, 'gain': float(gain), 'pulse': float(pulse)}
    part.no_conform = True
    return part


def _forearm_pins(gid, pin_p):
    """Signature radial acupuncture forearm pins anchored cleanly into sculpted vambraces."""
    parts = []
    bk = np.array([0.0, 1.0, 0.0])
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        fa_len = max(float(np.linalg.norm(d_fa)), 1e-6)
        u_fa = d_fa / fa_len
        out_x = np.array([sgn, 0.0, 0.0])
        for k_p, frac_p in enumerate((0.35, 0.56, 0.76)):
            p_base = el + u_fa * (frac_p * fa_len)
            for ang_p in (-0.55, 0.55):
                p_dir = out_x * math.cos(ang_p) + bk * math.sin(ang_p)
                p_dir = p_dir / max(np.linalg.norm(p_dir), 1e-6)
                parts.append(mech_tube(f'{gid}_pin_{side}_{k_p}_{ang_p:+.1f}',
                                       [p_base + p_dir * 0.026, p_base + p_dir * 0.068],
                                       0.0042, 0.0016, pin_p, n=6, rows=4,
                                       rigid_joint=side + 'ForeArm', slot_hint='gloves'))
    return parts


# ===============================================================================================================
# ARCHETYPE 1: VOLTAIC ARC-LICH (`voltaic_lich`, Science-Fantasy Arcane-Tech Cyber-Archmage)
# ===============================================================================================================
def _build_voltaic_lich(sex, body_id):
    set_body(body_id)
    entries = []
    a, b, up, bk, left = head_frame()
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])
    bk_w = np.array([0.0, 1.0, 0.0])

    chrome_p = P('clich_chrome', 0.02, [], [PN(0.0, 1.0, 'clich_voltaic_skull', 'clich_steel', 'clich_chrome', 0.22)], fabric='metal.chrome')
    chrome_plate_p = P('clich_chrome', 0.015, [B('bottom', 0.0, 0.12, 'solid', 'clich_steel')], fabric='metal.chrome')
    steel_p = P('clich_steel', 0.02, [B('bottom', 0.0, 0.12, 'solid', 'clich_gunmetal')], fabric='metal.steel')
    gunmetal_plate_p = P('clich_gunmetal', 0.018, [B('bottom', 0.0, 0.12, 'solid', 'clich_gold')], fabric='metal.steel')
    carbon_p = P('clich_carbon', 0.018, [B('bottom', 0.0, 0.10, 'solid', 'clich_obsidian')], fabric='metal.iron')
    obs_p = P('clich_obsidian', 0.015, fabric='metal.iron')
    charcoal_p = P('clich_charcoal', 0.02, fabric='metal.iron')
    gold_p = P('clich_gold', 0.018, [B('bottom', 0.0, 0.12, 'solid', 'clich_gold_dk')], fabric='metal.gold')
    bronze_p = P('clich_bronze', 0.025, [B('bottom', 0.0, 0.10, 'solid', 'clich_bronze_dk')], fabric='metal.bronze')
    cyan_glow_p = P('clich_cybercyan', 0.0, [B('top', 0.0, 0.30, 'solid', 'clich_cyancore')], fabric='beads.glass')
    magenta_glow_p = P('clich_arcane_v', 0.0, [B('top', 0.0, 0.30, 'solid', 'clich_magentacore')], fabric='beads.glass')
    violet_solid_p = P('clich_violet', 0.02, [B('bottom', 0.0, 0.10, 'solid', 'clich_gold')], fabric='cloth.silk')
    violet_sleeve_p = P('clich_violet', 0.02, [B('bottom', 0.0, 0.12, 'solid', 'clich_gold'), B('bottom', 0.12, 0.16, 'solid', 'clich_obsidian')], fabric='cloth.silk')
    crimson_p = P('clich_crimson', 0.02, [B('bottom', 0.0, 0.12, 'solid', 'clich_gold')], fabric='cloth.silk')
    cuirass_p = P('clich_gunmetal', 0.018, [], [PN(0.0, 1.0, 'clich_voltaic_cuirass', 'clich_cyancore', 'clich_gunmetal', 0.28)], fabric='metal.steel')

    # --- 1. HEAD: clich_{s}_voltaic_skull (Gilded Arcane-Tech Cyber-Skull + Self-Illuminating Emissive Visor + Archmage Diadem) ---
    gid_h = f'clich_{sex}_voltaic_skull'
    parts_h = _sculpted_skull_dome(gid_h, chrome_p, cyan_glow_p, carbon_p, left, bk, up, a, b, eye_r=0.014)
    for ph in parts_h:
        if '_eye_glow_' in ph.name:
            _tag_blaze(ph, '#48f8ff', gain=2.20, pulse=0.14)

    # Wide wrap-around gilded & gunmetal optic visor housing + blazing emissive-cyan optic visor band + arcane-violet hairline
    vis_l_out = a + (b - a) * 0.45 + left * 0.078 - bk * 0.068
    vis_l = a + (b - a) * 0.46 + left * 0.056 - bk * 0.102
    vis_c = a + (b - a) * 0.47 - bk * 0.116
    vis_r = a + (b - a) * 0.46 - left * 0.056 - bk * 0.102
    vis_r_out = a + (b - a) * 0.45 - left * 0.078 - bk * 0.068
    visor_arc = _catmull_spline([vis_r_out, vis_r, vis_c, vis_l, vis_l_out], 11)
    parts_h.append(mech_tube(gid_h + '_visor_housing', visor_arc + bk * 0.008,
                             0.021, 0.021, carbon_p, n=8, rows=11, rigid_joint='Head', slot_hint='head',
                             scale_xy=(0.70, 1.35)))
    parts_h.append(mech_tube(gid_h + '_visor_gild_rim', visor_arc + up * 0.016 + bk * 0.003,
                             0.0065, 0.0065, gold_p, n=6, rows=11, rigid_joint='Head', slot_hint='head'))
    parts_h.append(_tag_blaze(
        mech_tube(gid_h + '_visor_cyan_band', visor_arc - bk * 0.005,
                  0.0135, 0.0135, cyan_glow_p, n=8, rows=11, rigid_joint='Head', slot_hint='head',
                  scale_xy=(0.55, 1.18)),
        '#48f8ff', gain=2.30, pulse=0.16,
    ))
    parts_h.append(_tag_blaze(
        mech_tube(gid_h + '_visor_magenta_strip', visor_arc + up * 0.011 - bk * 0.004,
                  0.0055, 0.0055, magenta_glow_p, n=6, rows=11, rigid_joint='Head', slot_hint='head'),
        '#d850ff', gain=2.05, pulse=0.22,
    ))

    # Gilded science-fantasy archmage brow-diadem + glowing forehead arcane-sensor jewel
    brow_arc = _catmull_spline([
        a + (b - a) * 0.56 - left * 0.082 - bk * 0.064,
        a + (b - a) * 0.60 - left * 0.052 - bk * 0.100,
        a + (b - a) * 0.68 - bk * 0.114,
        a + (b - a) * 0.60 + left * 0.052 - bk * 0.100,
        a + (b - a) * 0.56 + left * 0.082 - bk * 0.064,
    ], 11)
    parts_h.append(mech_tube(gid_h + '_brow_bridge', brow_arc,
                             0.014, 0.014, gold_p, n=8, rows=11, rigid_joint='Head', slot_hint='head',
                             scale_xy=(0.72, 1.35)))
    nd_c = a + (b - a) * 0.70 - bk * 0.108
    parts_h.append(mech_tube(gid_h + '_brow_housing', [nd_c + bk * 0.016, nd_c - bk * 0.008],
                             0.018, 0.016, gold_p, n=6, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    parts_h.append(_tag_blaze(
        mech_tube(gid_h + '_brow_cyan_core', [nd_c + bk * 0.002, nd_c - bk * 0.015],
                  0.0105, 0.0095, cyan_glow_p, n=8, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up),
        '#72ffff', gain=2.25, pulse=0.18,
    ))
    # Twin swept-back gilded archmage crown fins flanking the forehead jewel (anchored directly into cranium)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        fin_pts = _catmull_spline([
            a + (b - a) * 0.66 + left * (sgn * 0.036) - bk * 0.090,
            a + (b - a) * 0.88 + left * (sgn * 0.056) - bk * 0.032,
            a + (b - a) * 1.08 + left * (sgn * 0.068) + bk * 0.036,
        ], 7)
        parts_h.append(mech_tube(f'{gid_h}_crown_fin_{tag}', fin_pts, 0.012, 0.005, gold_p,
                                 n=6, rows=7, rigid_joint='Head', slot_hint='head', scale_xy=(0.55, 1.55)))

    # Mechanical jaw-pistons, gilded temple arcane-Tesla hubs & braided occipital neural cables
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        cowl_pts = _catmull_spline([
            a + (b - a) * 0.64 + left * (sgn * 0.088) - bk * 0.005,
            a + (b - a) * 0.28 + left * (sgn * 0.095) + bk * 0.018,
            a - (b - a) * 0.24 + left * (sgn * 0.072) + bk * 0.010,
        ], 7)
        parts_h.append(mech_tube(f'{gid_h}_side_cowl_{tag}', cowl_pts, 0.026, 0.032, carbon_p,
                                 n=8, rows=7, rigid_joint='Head', slot_hint='head', scale_xy=(0.72, 1.35)))

        jp_hi = a + (b - a) * 0.36 + left * (sgn * 0.068) - bk * 0.044
        jp_lo = a + (b - a) * 0.10 + left * (sgn * 0.050) - bk * 0.066
        parts_h.extend(piston_assembly(f'{gid_h}_jaw_piston_{tag}', jp_hi, jp_lo,
                                       0.0095, carbon_p, gold_p, 'Head', slot_hint='head'))

        t_hub = a + (b - a) * 0.45 + left * (sgn * 0.088) + bk * 0.002
        parts_h.append(mech_tube(f'{gid_h}_temple_hub_{tag}', [t_hub - left * (sgn * 0.018), t_hub + left * (sgn * 0.026)],
                                 0.030, 0.026, gold_p, n=12, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
        parts_h.append(_tag_blaze(
            mech_tube(f'{gid_h}_datajack_ring_{tag}', [t_hub + left * (sgn * 0.010), t_hub + left * (sgn * 0.022)],
                      0.029, 0.029, cyan_glow_p, n=12, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up),
            '#48f8ff', gain=2.10, pulse=0.20,
        ))
        parts_h.append(mech_tube(f'{gid_h}_datajack_port_{tag}', [t_hub + left * (sgn * 0.020), t_hub + left * (sgn * 0.032)],
                                 0.016, 0.014, chrome_plate_p, n=10, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
        tips = []
        for k_e, dz_e in enumerate((0.018, -0.018)):
            p0 = t_hub + up * dz_e
            p1 = p0 + left * (sgn * 0.098) + up * (dz_e * 0.45) + bk * 0.014
            tips.append(p1)
            parts_h.append(mech_tube(f'{gid_h}_electrode_{tag}_{k_e}', [p0, p1],
                                     0.0072, 0.0048, gold_p if k_e == 0 else chrome_plate_p,
                                     n=8, rows=5, rigid_joint='Head', slot_hint='head'))
            for frac_r, col_r, hex_r in ((0.40, cyan_glow_p, '#48f8ff'), (0.72, magenta_glow_p, '#d850ff')):
                pm = p0 + (p1 - p0) * frac_r
                parts_h.append(_tag_blaze(
                    mech_tube(f'{gid_h}_ring_{tag}_{k_e}_{int(frac_r*10)}',
                              [pm - left * (sgn * 0.006), pm + left * (sgn * 0.006)],
                              0.0125, 0.0125, col_r, n=10, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up),
                    hex_r, gain=2.00, pulse=0.22,
                ))
        arc_pts = _catmull_spline([
            tips[0],
            0.5 * (tips[0] + tips[1]) + left * (sgn * 0.028) + up * 0.014,
            0.5 * (tips[0] + tips[1]) + left * (sgn * 0.020) - up * 0.012,
            tips[1],
        ], 8)
        parts_h.append(_tag_blaze(
            mech_tube(f'{gid_h}_arc_{tag}', arc_pts, 0.0048, 0.0048, cyan_glow_p,
                      n=6, rows=8, rigid_joint='Head', slot_hint='head'),
            '#56fbff', gain=2.20, pulse=0.28,
        ))

        for kc, (f_hi, x_off, mat_c) in enumerate(((0.56, 0.032, carbon_p), (0.42, 0.056, gold_p))):
            c_top = a + (b - a) * f_hi + left * (sgn * x_off) + bk * 0.092
            c_mid = a + (b - a) * 0.14 + left * (sgn * (x_off + 0.016)) + bk * 0.118
            c_bot = a - (b - a) * 0.36 + left * (sgn * (x_off * 0.65)) + bk * 0.042
            parts_h.append(mech_tube(f'{gid_h}_occipital_cable_{tag}_{kc}', _catmull_spline([c_top, c_mid, c_bot], 10),
                                     0.0105, 0.0095, mat_c, n=8, rows=10, rigid_joint='Head', slot_hint='head'))
            parts_h.append(_tag_blaze(
                mech_tube(f'{gid_h}_cable_ring_{tag}_{kc}',
                          [c_mid + up * 0.008, c_mid - up * 0.008],
                          0.0135, 0.0135, cyan_glow_p if kc == 0 else magenta_glow_p,
                          n=8, rows=4, rigid_joint='Head', slot_hint='head'),
                '#48f8ff' if kc == 0 else '#d850ff', gain=1.95, pulse=0.20,
            ))

    ent_h = assemble_garment(gid_h, 'Voltaic Arc-Lich Science-Fantasy Gilded Skull & Glowing Visor', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.25, mode='any'))
    entries.append(ent_h)

    # --- 2. TORSO: clich_{s}_voltaic_robe (Waist-Cropped Arcane-Tech Gilded Cyber-Cuirass + Glowing Arc-Reactor & Rune Patches) ---
    # Cropped cleanly at `core.WAIST - 0.020` with sculpted 3-lame faulds & ZERO competing lower cloth skirt so
    # `clich_{s}_voltaic_greaves` trousers + hinged tassets sit cleanly underneath with zero layer clipping!
    gid_t = f'clich_{sex}_voltaic_robe'
    parts_t = []

    # Fitted royal-violet & gold under-tunic cropped cleanly at waist (zero lower skirt overlap!)
    parts_t.append(torso_tube(gid_t + '_tunic', core.TOP + 0.010, core.WAIST - 0.020,
                              ease=0.018, paint=violet_solid_p, n=36, rows=12))
    # Sculpted science-fantasy cyber_plate cuirass: dark gunmetal + royal-violet enamel + gilded filigree & 3 sculpted faulds
    parts_t.extend(cuirass_plate(gid_t, cuirass_p, trim_paint=gold_p, style='cyber_plate',
                                 z_top=core.TOP - 0.002, z_bot=core.WAIST - 0.020, ease=0.026, keel=0.022, faulds=3))

    # Self-Illuminated Sternum Arc-Reactor Core (hexagonal gunmetal housing + gilded bezel + emissive cyan ring + arcane-violet core)
    st_c = chest_front(core.CHEST + 0.038, 0.048, x=0.0)
    st_c[0] = 0.0
    parts_t.append(mech_tube(gid_t + '_sternal_housing', [st_c + bk_w * 0.020, st_c - bk_w * 0.010],
                             0.044, 0.036, carbon_p, n=6, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up_w))
    parts_t.append(mech_tube(gid_t + '_sternal_gild', [st_c + bk_w * 0.010, st_c - bk_w * 0.015],
                             0.035, 0.030, gold_p, n=6, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up_w))
    parts_t.append(_tag_blaze(
        mech_tube(gid_t + '_sternal_cyan_ring', [st_c + bk_w * 0.004, st_c - bk_w * 0.019],
                  0.026, 0.022, cyan_glow_p, n=12, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up_w),
        '#48f8ff', gain=2.30, pulse=0.18,
    ))
    parts_t.append(_tag_blaze(
        mech_sphere(gid_t + '_sternal_core', st_c - bk_w * 0.018, 0.015, magenta_glow_p,
                    'Spine2', slot_hint='torso', n=12, rows=6),
        '#e25cff', gain=2.35, pulse=0.24,
    ))

    # Paired glowing arcane-circuit bus ribs + lower-torso hexagonal glowing energy rune patches
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        for kv, z_v in enumerate((core.CHEST + 0.016, core.CHEST - 0.034)):
            p_in = chest_front(z_v, 0.046, x=sgn * 0.034)
            p_out = chest_front(z_v + 0.022, 0.043, x=sgn * 0.106)
            parts_t.append(_tag_blaze(
                mech_tube(f'{gid_t}_chest_neon_{tag}_{kv}', [p_in, p_out],
                          0.0082, 0.0068, cyan_glow_p if kv == 0 else magenta_glow_p,
                          n=6, rows=4, rigid_joint='Spine2', slot_hint='torso'),
                '#48f8ff' if kv == 0 else '#d854ff', gain=2.10, pulse=0.18,
            ))
        # Glowing arcane-rune circuit patch mounted flush on lower cuirass flank
        pt_p = chest_front(core.WAIST + 0.078, 0.038, x=sgn * 0.088)
        parts_t.append(mech_tube(f'{gid_t}_rune_bezel_{tag}', [pt_p + bk_w * 0.016, pt_p - bk_w * 0.008],
                                 0.024, 0.020, gold_p, n=6, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up_w))
        parts_t.append(_tag_blaze(
            mech_tube(f'{gid_t}_rune_patch_{tag}', [pt_p + bk_w * 0.004, pt_p - bk_w * 0.013],
                      0.015, 0.013, cyan_glow_p, n=6, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up_w),
            '#50faff', gain=2.20, pulse=0.20,
        ))

    # High Armored Science-Fantasy Archmage Tech-Collar (crimson stole-disc + gilded gorget + raised collar + glowing rim)
    parts_t.append(collar_disc(gid_t + '_crimson_scarf', 0.056, crimson_p, drop=0.048, n=32, ease=0.030, z_off=0.014))
    parts_t.extend(gorget_guard(gid_t, gunmetal_plate_p, trim_paint=gold_p, ease=0.028))
    parts_t.append(collar(gid_t + '_cyber_tech_collar', gunmetal_plate_p, height=0.042, flare=0.028, ease=0.028, open_front=True, rows=6, n=32))
    col_rim_pts = [
        dorsal_back_pt(core.TOP + 0.034, offset=0.024, x=lx)
        for lx in np.linspace(-0.084, 0.084, 9)
    ]
    parts_t.append(_tag_blaze(
        mech_tube(gid_t + '_collar_neon_rim', col_rim_pts, 0.0078, 0.0078, cyan_glow_p,
                  n=6, rows=9, rigid_joint='Spine2', slot_hint='torso'),
        '#48f8ff', gain=2.15, pulse=0.18,
    ))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        cw_bot = spine_at(core.TOP + 0.002) + left_w * (sgn * 0.082) - bk_w * 0.012
        cw_top = spine_at(core.TOP + 0.058) + left_w * (sgn * 0.104) + bk_w * 0.018
        parts_t.append(mech_tube(f'{gid_t}_collar_wing_{tag}', [cw_bot, cw_top],
                                 0.016, 0.012, gold_p, n=6, rows=5, rigid_joint='Spine2', slot_hint='torso',
                                 scale_xy=(0.45, 1.65)))
        parts_t.append(_tag_blaze(
            mech_tube(f'{gid_t}_collar_wing_glow_{tag}', [cw_bot - bk_w * 0.012, cw_top - bk_w * 0.012],
                      0.0058, 0.0048, magenta_glow_p, n=6, rows=4, rigid_joint='Spine2', slot_hint='torso'),
            '#d850ff', gain=2.10, pulse=0.22,
        ))

    # Royal-violet & gold-cuffed sleeves starting at f0=0.0 to seal shoulders cleanly & overlap vambraces
    parts_t.append(_sleeve_tube(gid_t + '_sleeve_R', 'Right', violet_sleeve_p, f0=0.0, f1=0.95, ease=0.026, flare=0.012))
    parts_t.append(_sleeve_tube(gid_t + '_sleeve_L', 'Left', violet_sleeve_p, f0=0.0, f1=0.95, ease=0.026, flare=0.012))

    # Articulated Gunmetal & Gilded Arcane-Tech Pauldrons + Glowing Rune Medallions + Right-Shoulder Twin Tesla Arc-Rods
    sh_r = J('RightArm')
    parts_t.extend(articulated_pauldron(gid_t, R, gunmetal_plate_p, trim_paint=gold_p, lames=3, haute_piece=True, ease=0.026))
    parts_t.extend(articulated_pauldron(gid_t, L, gunmetal_plate_p, trim_paint=gold_p, lames=3, haute_piece=True, ease=0.026))
    for side, sgn, tag in ((R, -1.0, 'R'), (L, 1.0, 'L')):
        sh_p = J(side + 'Arm')
        parts_t.append(_tag_blaze(
            mech_tube(f'{gid_t}_pauldron_neon_{tag}',
                      [sh_p + left_w * (sgn * 0.02) + up_w * 0.072 - bk_w * 0.074,
                       sh_p + left_w * (sgn * 0.088) + up_w * 0.042,
                       sh_p + left_w * (sgn * 0.02) + up_w * 0.072 + bk_w * 0.074],
                      0.0085, 0.0085, cyan_glow_p, n=6, rows=7, rigid_joint=side + 'Arm', slot_hint='torso'),
            '#48f8ff', gain=2.15, pulse=0.18,
        ))
        # Glowing lateral arcane-circuit patch mounted flush on outer pauldron cop
        pm_c = sh_p + left_w * (sgn * 0.078) + up_w * 0.012
        parts_t.append(mech_tube(f'{gid_t}_pauldron_bezel_{tag}',
                                 [pm_c - left_w * (sgn * 0.018), pm_c + left_w * (sgn * 0.012)],
                                 0.026, 0.022, gold_p, n=6, rows=4, rigid_joint=side + 'Arm', slot_hint='torso', ref_dir=up_w))
        parts_t.append(_tag_blaze(
            mech_tube(f'{gid_t}_pauldron_rune_{tag}',
                      [pm_c - left_w * (sgn * 0.004), pm_c + left_w * (sgn * 0.017)],
                      0.016, 0.014, magenta_glow_p, n=6, rows=4, rigid_joint=side + 'Arm', slot_hint='torso', ref_dir=up_w),
            '#d858ff', gain=2.20, pulse=0.22,
        ))

    rod_tips = []
    for kr, off_y in enumerate((-0.030, 0.030)):
        r_base = sh_r - left_w * 0.028 + up_w * 0.044 + bk_w * off_y
        r_tip = r_base - left_w * 0.088 + up_w * 0.135 + bk_w * (off_y * 0.5)
        rod_tips.append(r_tip)
        parts_t.append(mech_tube(f'{gid_t}_pauldron_rod_{kr}', [r_base, r_tip],
                                 0.015, 0.010, gold_p, n=10, rows=6, rigid_joint='RightArm', slot_hint='torso'))
        for fr_c, p_c, hex_c in ((0.35, carbon_p, None), (0.60, cyan_glow_p, '#48f8ff'), (0.82, magenta_glow_p, '#d850ff')):
            r_mid = r_base + (r_tip - r_base) * fr_c
            coil_pt = mech_tube(f'{gid_t}_pauldron_coil_{kr}_{int(fr_c*10)}',
                                [r_mid - up_w * 0.010, r_mid + up_w * 0.010],
                                0.022, 0.022, p_c, n=10, rows=4, rigid_joint='RightArm', slot_hint='torso')
            if hex_c:
                _tag_blaze(coil_pt, hex_c, gain=2.10, pulse=0.22)
            parts_t.append(coil_pt)
    for ka, (dz_a, arc_mat, hex_a) in enumerate(((0.044, cyan_glow_p, '#58fbff'), (0.016, magenta_glow_p, '#e05cff'))):
        arc_p = _catmull_spline([
            rod_tips[0],
            0.5 * (rod_tips[0] + rod_tips[1]) + up_w * dz_a - left_w * (0.026 if ka == 0 else 0.010),
            rod_tips[1],
        ], 7)
        parts_t.append(_tag_blaze(
            mech_tube(f'{gid_t}_pauldron_arc_{ka}', arc_p, 0.0058, 0.0058, arc_mat,
                      n=6, rows=7, rigid_joint='RightArm', slot_hint='torso'),
            hex_a, gain=2.25, pulse=0.28,
        ))

    # Draped Left-Shoulder Royal-Violet & Gold Stole tucked cleanly into waist sash (never hangs below waist!)
    sh_l = J('LeftArm')
    stole_pts = [
        sh_l - left_w * 0.045 + up_w * 0.068 - bk_w * 0.010,
        chest_front(core.CHEST + 0.03, 0.046, x=0.105),
        chest_front(core.WAIST + 0.03, 0.044, x=0.102),
    ]
    parts_t.append(mech_tube(gid_t + '_left_stole', _catmull_spline(stole_pts, 7), 0.052, 0.054, violet_solid_p,
                             n=10, rows=7, rigid_joint='Spine2', slot_hint='torso', scale_xy=(0.26, 1.12)))

    # Crimson & Gold Waist Tech-Sash + Glowing Arcane Buckle (cropped cleanly at WAIST - 0.020!)
    parts_t.append(torso_tube(gid_t + '_crimson_sash', core.WAIST + 0.052, core.WAIST - 0.020,
                              ease=0.038, paint=crimson_p, n=36, rows=6))
    bk_c = chest_front(core.WAIST + 0.014, 0.044, x=0.0)
    bk_c[0] = 0.0
    parts_t.append(mech_box(gid_t + '_cyber_buckle', bk_c, (0.046, 0.018, 0.034), gold_p, 'Spine1', slot_hint='torso'))
    parts_t.append(_tag_blaze(
        mech_tube(gid_t + '_buckle_neon', [bk_c + bk_w * 0.004, bk_c - bk_w * 0.022],
                  0.018, 0.015, cyan_glow_p, n=8, rows=4, rigid_joint='Spine1', slot_hint='torso', ref_dir=up_w),
        '#48f8ff', gain=2.25, pulse=0.18,
    ))

    ent_t = assemble_garment(gid_t, 'Voltaic Arc-Lich Science-Fantasy Gilded Cuirass & Glowing Rune Rig', 'torso', parts_t)
    entries.append(ent_t)

    # --- 3. BACK: clich_{s}_voltaic_capacitor (High-Voltage Dorsal Arcane-Tech Rail-Capacitor Rig) ---
    gid_b = f'clich_{sex}_voltaic_capacitor'
    parts_b = []
    p_hi = dorsal_back_pt(core.SHOULDER - 0.01, offset=0.018)
    p_mid = dorsal_back_pt(core.CHEST - 0.02, offset=0.024)
    p_lo = dorsal_back_pt(core.WAIST + 0.04, offset=0.020)

    parts_b.append(mech_tube(gid_b + '_reactor_spine', [p_hi + up_w * 0.035, p_mid, p_lo - up_w * 0.018],
                             0.070, 0.058, carbon_p, n=8, rows=7, rigid_joint='Spine2', slot_hint='back',
                             scale_xy=(1.38, 0.60)))
    parts_b.append(_tag_blaze(
        mech_tube(gid_b + '_reactor_core', [p_hi + bk_w * 0.042, p_lo + bk_w * 0.038],
                  0.017, 0.015, magenta_glow_p, n=8, rows=6, rigid_joint='Spine2', slot_hint='back'),
        '#d850ff', gain=2.15, pulse=0.20,
    ))

    coil_tops = []
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        c_top = p_hi + left_w * (sgn * 0.102) + bk_w * 0.056 + up_w * 0.085
        c_bot = p_lo + left_w * (sgn * 0.082) + bk_w * 0.036
        coil_tops.append(c_top + up_w * 0.045)
        parts_b.append(mech_tube(f'{gid_b}_strut_hi_{tag}', [p_hi, c_top - up_w * 0.048],
                                 0.024, 0.022, gold_p, n=8, rows=4, rigid_joint='Spine2', slot_hint='back'))
        parts_b.append(mech_tube(f'{gid_b}_strut_lo_{tag}', [p_lo, c_bot + up_w * 0.034],
                                 0.024, 0.022, steel_p, n=8, rows=4, rigid_joint='Spine2', slot_hint='back'))
        parts_b.append(_tag_blaze(
            mech_tube(f'{gid_b}_plasma_col_{tag}', [c_bot, c_top],
                      0.038, 0.036, cyan_glow_p, n=14, rows=9, rigid_joint='Spine2', slot_hint='back'),
            '#48f8ff', gain=2.20, pulse=0.18,
        ))
        parts_b.append(mech_tube(f'{gid_b}_cap_hi_{tag}', [c_top - up_w * 0.028, c_top + up_w * 0.024],
                                 0.046, 0.030, carbon_p, n=12, rows=4, rigid_joint='Spine2', slot_hint='back'))
        parts_b.append(mech_tube(f'{gid_b}_horn_{tag}', [c_top + up_w * 0.015, c_top + up_w * 0.058 - left_w * (sgn * 0.022)],
                                 0.016, 0.008, gold_p, n=8, rows=4, rigid_joint='Spine2', slot_hint='back'))
        parts_b.append(mech_tube(f'{gid_b}_cap_lo_{tag}', [c_bot - up_w * 0.018, c_bot + up_w * 0.028],
                                 0.030, 0.046, gold_p, n=12, rows=4, rigid_joint='Spine2', slot_hint='back'))
        for kf, ff in enumerate((0.20, 0.42, 0.64, 0.84)):
            fc = c_bot + (c_top - c_bot) * ff
            fin_pt = mech_tube(f'{gid_b}_fin_{tag}_{kf}', [fc - up_w * 0.008, fc + up_w * 0.008],
                               0.047, 0.047, magenta_glow_p if kf in (1, 2) else gold_p,
                               n=12, rows=4, rigid_joint='Spine2', slot_hint='back')
            if kf in (1, 2):
                _tag_blaze(fin_pt, '#d850ff', gain=2.05, pulse=0.22)
            parts_b.append(fin_pt)

    top_arc = _catmull_spline([
        coil_tops[0],
        0.5 * (coil_tops[0] + coil_tops[1]) + up_w * 0.036 + bk_w * 0.016,
        coil_tops[1],
    ], 8)
    parts_b.append(_tag_blaze(
        mech_tube(gid_b + '_top_rail_arc', top_arc, 0.0075, 0.0075, cyan_glow_p,
                  n=6, rows=8, rigid_joint='Spine2', slot_hint='back'),
        '#56fbff', gain=2.25, pulse=0.26,
    ))

    hip_hub = p_lo + left_w * 0.082 + bk_w * 0.024
    parts_b.append(mech_tube(gid_b + '_hip_arm_L', [p_lo, hip_hub], 0.026, 0.024, carbon_p,
                             n=8, rows=4, rigid_joint='Spine2', slot_hint='back'))
    htips = []
    for kh, dz_h in enumerate((0.028, -0.028)):
        h0 = hip_hub + up_w * dz_h
        h1 = h0 + left_w * 0.165 + bk_w * 0.028
        htips.append(h1)
        parts_b.append(mech_tube(f'{gid_b}_hip_prong_{kh}', [h0, h1], 0.012, 0.008, gold_p,
                                 n=8, rows=5, rigid_joint='Spine2', slot_hint='back'))
    parts_b.append(_tag_blaze(
        mech_tube(gid_b + '_hip_arc',
                  _catmull_spline([htips[0], 0.5 * (htips[0] + htips[1]) + left_w * 0.048, htips[1]], 6),
                  0.0065, 0.0065, cyan_glow_p, n=6, rows=6, rigid_joint='Spine2', slot_hint='back'),
        '#56fbff', gain=2.25, pulse=0.26,
    ))

    ent_b = assemble_garment(gid_b, 'Voltaic Arc-Lich Science-Fantasy Dorsal Rail-Capacitor Rig', 'back', parts_b)
    entries.append(ent_b)

    # --- 4. GLOVES: clich_{s}_voltaic_gauntlets (Finger-Joint-Skinned Metallic Gauntlets + Sculpted Vambraces) ---
    gid_g = f'clich_{sex}_voltaic_gauntlets'
    parts_g = (
        sculpted_vambraces(gid_g, gunmetal_plate_p, trim_paint=gold_p, couter=True, ease=0.016)
        + full_gloves(gid_g, carbon_p, gunmetal_plate_p, finger_paint=gold_p, f0=0.82, ease=0.012, knuckle_paint=gold_p)
    )
    entries.append(assemble_garment(gid_g, 'Voltaic Arc-Lich Gilded Cyber-Gauntlets', 'gloves', parts_g))

    # --- 5. LEGS: clich_{s}_voltaic_greaves (Clean Upright Royal-Violet Trousers + Gilded Hinged Tassets + Glowing Thigh Rune Patches) ---
    gid_l = f'clich_{sex}_voltaic_greaves'
    leg_p = P('clich_violet', 0.02, [
        B('bottom', 0.0, 0.14, 'solid', 'clich_obsidian'),
        B('bottom', 0.14, 0.18, 'solid', 'clich_gold'),
    ], fabric='cloth.silk')
    tassets = hinged_tassets(gid_l, gunmetal_plate_p, trim_paint=gold_p, lames=3, ease=0.026)
    parts_l = trousers(gid_l, leg_p, ease=0.016) + tassets
    # Flush glowing arcane-circuit patches anchored directly onto the middle tasset lame of each thigh (zero gap!)
    for side_s, tag in (('L', 'L'), ('R', 'R')):
        mid_t = next((tp for tp in tassets if tp.name == f'{gid_l}_tasset1_{side_s}'), None)
        if mid_t is not None:
            r_mid = mid_t.P.shape[0] // 2
            c_mid = mid_t.P.shape[1] // 2
            p_ctr = mid_t.P[r_mid, c_mid].copy()
            s_full = 'Left' if side_s == 'L' else 'Right'
            hip_pt = J(s_full + 'UpLeg')
            n_out = np.array([p_ctr[0] - hip_pt[0], p_ctr[1] - hip_pt[1], 0.0], dtype=np.float64)
            n_out /= max(float(np.linalg.norm(n_out)), 1e-6)
            parts_l.append(mech_tube(f'{gid_l}_thigh_bezel_{tag}',
                                     [p_ctr - n_out * 0.008, p_ctr + n_out * 0.010],
                                     0.022, 0.019, gold_p, n=6, rows=4, rigid_joint=s_full + 'UpLeg', slot_hint='legs', ref_dir=up_w))
            parts_l.append(_tag_blaze(
                mech_tube(f'{gid_l}_thigh_rune_{tag}',
                          [p_ctr - n_out * 0.002, p_ctr + n_out * 0.014],
                          0.014, 0.012, cyan_glow_p, n=6, rows=4, rigid_joint=s_full + 'UpLeg', slot_hint='legs', ref_dir=up_w),
                '#48f8ff', gain=2.20, pulse=0.20,
            ))
    entries.append(assemble_garment(gid_l, 'Voltaic Arc-Lich Gilded Tassets & Arcane Under-Greaves', 'legs', parts_l, legged=True))

    # --- 6. FEET: clich_{s}_voltaic_boots ---
    gid_f = f'clich_{sex}_voltaic_boots'
    boot_p = P('clich_obsidian', 0.02, [B('top', 0.0, 0.14, 'solid', 'clich_gold')], fabric='metal.iron')
    parts_f = boots(gid_f, boot_p, top=0.36) + sculpted_greaves(
        gid_f, gunmetal_plate_p, trim_paint=gold_p, poleyn=True, ease=0.016,
    )
    entries.append(assemble_garment(gid_f, 'Voltaic Arc-Lich Gilded Cyber-Boots', 'feet', parts_f))

    return entries


# ===============================================================================================================
# ARCHETYPE 2: EGYPTIAN-ETERNIAN RELIQUARY CYBER-LICH (`reliquary_lich`)
# Hard-surface cybernetic headdress & panoply fusing Egyptian (twin Atef/Red-Crown pylons, Nemes capacitor wings,
# Uraeus third-eye sensor, hydraulic Osird chin-piston, Usekh broad-collar, Djed spine, Shendyt apron) with
# Eternian (celadon-jade Bi-disc cranial halo & joint rings, Art-Deco stepped organ-pipe piers, Bufu circuit-maze)
# ===============================================================================================================
def _build_reliquary_lich(sex, body_id):
    set_body(body_id)
    entries = []
    a, b, up, bk, left = head_frame()
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])
    bk_w = np.array([0.0, 1.0, 0.0])

    # Cyber-Skull (chrome-porcelain with dark panel seams & glowing cyan traces) + Egyptian-Eternian materials
    skull_p = P('clich_chrome', 0.015, [], [PN(0.0, 1.0, 'clich_cyber_skull', 'clich_steel', 'clich_chrome', 0.22)], fabric='metal.chrome')
    plaque_p = P('clich_copper', 0.02, [], [PN(0.0, 1.0, 'clich_pharaonic_plaque', 'clich_bronze', 'clich_copper', 0.24)], fabric='metal.bronze')
    usekh_p = P('clich_bronze', 0.02, [], [PN(0.0, 1.0, 'clich_eg_etn_usekh', 'clich_bronze', 'clich_jade', 0.28)], fabric='metal.gold')
    apron_p = P('clich_obsidian', 0.02, [], [PN(0.0, 1.0, 'clich_eg_etn_apron', 'clich_bronze', 'clich_obsidian', 0.30)], fabric='metal.brass')
    bronze_p = P('clich_bronze', 0.025, [B('bottom', 0.0, 0.10, 'solid', 'clich_bronze_dk')], fabric='metal.bronze')
    jade_p = P('clich_jade', 0.02, [B('bottom', 0.0, 0.12, 'solid', 'clich_jade_dk')], fabric='beads.glass')
    obs_p = P('clich_obsidian', 0.015, fabric='metal.iron')
    steel_p = P('clich_gunmetal', 0.02, fabric='metal.iron')
    lime_p = P('clich_lime', 0.0, [B('top', 0.0, 0.25, 'solid', 'clich_limecore')], fabric='beads.glass')
    cyan_p = P('clich_cybercyan', 0.0, [B('top', 0.0, 0.25, 'solid', 'clich_cyancore')], fabric='beads.glass')
    crimson_p = P('clich_crimson', 0.02, [B('bottom', 0.0, 0.12, 'solid', 'clich_crimson_dk')], fabric='cloth.silk')
    plum_robe_p = P('clich_plum', 0.02, [B('bottom', 0.0, 0.05, 'solid', 'clich_obsidian')],
                    [PN(0.0, 1.0, 'clich_reliquary_robe', 'clich_violet_hi', 'clich_plum', 0.24)], fabric='cloth.wool')

    # --- 1. HEAD: clich_{s}_reliquary_headdress (Cybernetic Egyptian-Eternian Twin-Pylon Crown, Nemes Wings & Jade Bi-Halo) ---
    gid_h = f'clich_{sex}_reliquary_headdress'
    parts_h = _sculpted_skull_dome(gid_h, skull_p, lime_p, steel_p, left, bk, up, a, b, eye_r=0.015, jaw_drop=False)

    # Armored Cyber-Brow Diadem Band (celadon-jade & bronze circuit band around skull)
    brow_ring = [
        a + (b - a) * 0.62 + (bk * math.cos(an) + left * math.sin(an)) * 0.106
        for an in np.linspace(0.0, 2.0 * math.pi, 17)
    ]
    parts_h.append(mech_tube(gid_h + '_brow_diadem', brow_ring, 0.013, 0.013, jade_p,
                             n=8, rows=17, rigid_joint='Head', slot_hint='head', cap_ends=False))

    # Egyptian Uraeus Cyber-Cobra + Eternian Jade Bi-Disc Third-Eye Sensor on Forehead
    ur_base = a + (b - a) * 0.60 - bk * 0.098
    ur_mid = ur_base + up * 0.042 - bk * 0.022
    ur_top = ur_mid + up * 0.036 + bk * 0.010
    parts_h.append(mech_tube(gid_h + '_uraeus_hood', [ur_base, ur_mid, ur_top], 0.024, 0.014, bronze_p,
                             n=8, rows=6, rigid_joint='Head', slot_hint='head', scale_xy=(1.45, 0.45)))
    parts_h.append(mech_tube(gid_h + '_uraeus_bi', [ur_mid + bk * 0.012, ur_mid - bk * 0.010], 0.019, 0.017, jade_p,
                             n=12, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    parts_h.append(mech_tube(gid_h + '_uraeus_eye', [ur_mid + bk * 0.002, ur_mid - bk * 0.016], 0.0095, 0.0080, cyan_p,
                             n=10, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))

    # Telescoping Hydraulic Osird Cyber-Beard (bronze cylinder + obsidian collar + glowing cyan/lime rod)
    chin_top = a + (b - a) * 0.08 - bk * 0.092
    chin_mid = chin_top - up * 0.048 - bk * 0.008
    chin_bot = chin_mid - up * 0.044 - bk * 0.006
    parts_h.append(mech_tube(gid_h + '_osird_cyl', [chin_top, chin_mid], 0.020, 0.016, bronze_p,
                             n=8, rows=5, rigid_joint='Head', slot_hint='head', scale_xy=(1.15, 0.85)))
    parts_h.append(mech_tube(gid_h + '_osird_ring', [chin_mid + up * 0.008, chin_mid - up * 0.008], 0.021, 0.021, cyan_p,
                             n=8, rows=4, rigid_joint='Head', slot_hint='head'))
    parts_h.append(mech_tube(gid_h + '_osird_rod', [chin_mid + up * 0.006, chin_bot], 0.013, 0.009, jade_p,
                             n=8, rows=5, rigid_joint='Head', slot_hint='head'))

    # Towering Split Egyptian Atef / Eternian Deco Twin-Pylon Monoliths + Glowing Inner Plasma Busbars
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_bot = a + (b - a) * 0.36 + left * (sgn * 0.092) + bk * 0.004
        p_mid = a + (b - a) * 0.96 + left * (sgn * 0.074) + bk * 0.008
        p_top = a + (b - a) * 1.66 + left * (sgn * 0.048) + bk * 0.010
        parts_h.append(mech_tube(f'{gid_h}_pylon_{tag}', [p_bot, p_mid, p_top],
                                 0.046, 0.034, plaque_p, n=8, rows=9, rigid_joint='Head', slot_hint='head',
                                 scale_xy=(0.66, 1.38)))
        # Inner cleft glowing chartreuse/cyan plasma rail along each pylon
        g_bot = a + (b - a) * 0.68 + left * (sgn * 0.048) - bk * 0.014
        g_top = a + (b - a) * 1.58 + left * (sgn * 0.026) - bk * 0.008
        parts_h.append(mech_tube(f'{gid_h}_pylon_rail_{tag}', [g_bot, g_top],
                                 0.0085, 0.0065, lime_p, n=6, rows=6, rigid_joint='Head', slot_hint='head'))

        # 3 Stepped Eternian Art-Deco Organ-Pipe Piers flanking each pylon
        for kp, (h_sc, l_off) in enumerate(((0.82, 0.104), (0.62, 0.122), (0.44, 0.138))):
            sp_b = a + (b - a) * (0.44 + 0.04 * kp) + left * (sgn * l_off) + bk * (0.010 + 0.006 * kp)
            sp_t = sp_b + up * (0.21 * h_sc) - left * (sgn * 0.010)
            parts_h.append(mech_tube(f'{gid_h}_deco_pier_{tag}_{kp}', [sp_b, sp_t],
                                     0.012, 0.009, jade_p if kp == 1 else bronze_p,
                                     n=6, rows=5, rigid_joint='Head', slot_hint='head'))

        # Flared Cybernetic Egyptian Nemes Capacitor Side-Wings + Shoulder Lappets
        w_root = a + (b - a) * 0.52 + left * (sgn * 0.082) + bk * 0.006
        w_mid = a + (b - a) * 0.24 + left * (sgn * 0.162) + bk * 0.018
        w_lappet = a - (b - a) * 0.26 + left * (sgn * 0.118) - bk * 0.032
        parts_h.append(mech_tube(f'{gid_h}_nemes_wing_{tag}', [w_root, w_mid, w_lappet],
                                 0.042, 0.026, plaque_p, n=8, rows=8, rigid_joint='Head', slot_hint='head',
                                 scale_xy=(0.52, 1.55)))
        # Glowing cyan edge-busbar along outer Nemes capacitor wing
        parts_h.append(mech_tube(f'{gid_h}_nemes_neon_{tag}',
                                 [w_root + left * (sgn * 0.018), w_mid + left * (sgn * 0.022), w_lappet + left * (sgn * 0.014)],
                                 0.0068, 0.0052, cyan_p, n=6, rows=7, rigid_joint='Head', slot_hint='head'))

        # Twin Occipital Cyber-Cables curving from skull audio/neural jacks into back of Nemes wing
        for kc, f_c in enumerate((0.46, 0.28)):
            c_0 = a + (b - a) * f_c + left * (sgn * 0.072) + bk * 0.055
            c_1 = a + (b - a) * (f_c - 0.10) + left * (sgn * 0.138) + bk * 0.082
            c_2 = w_mid + bk * 0.024 - up * (0.025 * kc)
            parts_h.append(mech_tube(f'{gid_h}_neural_cable_{tag}_{kc}', _catmull_spline([c_0, c_1, c_2], 7),
                                     0.0085, 0.0075, obs_p if kc == 0 else bronze_p,
                                     n=8, rows=7, rigid_joint='Head', slot_hint='head'))

    # Eternian Celadon-Jade Bi-Disc Cranial Halo Arc bridging behind the Twin Pylons
    halo_c = a + (b - a) * 0.78 + bk * 0.058
    halo_r = 0.175
    halo_pts = [
        halo_c + left * (math.cos(th) * halo_r) + up * (math.sin(th) * halo_r)
        for th in np.linspace(-0.22 * math.pi, 1.22 * math.pi, 15)
    ]
    # Anchor struts tying halo arc directly into occipital skull & pylons (<5mm gap)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        h_tie = halo_c + left * (sgn * halo_r * 0.88)
        s_tie = a + (b - a) * 0.72 + left * (sgn * 0.078) + bk * 0.042
        parts_h.append(mech_tube(f'{gid_h}_halo_strut_{tag}', [s_tie, h_tie], 0.015, 0.013, bronze_p,
                                 n=8, rows=4, rigid_joint='Head', slot_hint='head'))
    parts_h.append(mech_tube(gid_h + '_etn_jade_halo', halo_pts, 0.015, 0.015, jade_p,
                             n=8, rows=15, rigid_joint='Head', slot_hint='head', scale_xy=(0.65, 1.35)))
    for kn, th_n in enumerate(np.linspace(0.10 * math.pi, 0.90 * math.pi, 5)):
        np_c = halo_c + left * (math.cos(th_n) * halo_r) + up * (math.sin(th_n) * halo_r)
        parts_h.append(mech_tube(f'{gid_h}_halo_node_{kn}', [np_c + bk * 0.014, np_c - bk * 0.014],
                                 0.018, 0.015, lime_p if kn == 2 else cyan_p,
                                 n=10, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))

    ent_h = assemble_garment(
        gid_h, 'Egyptian-Eternian Cyber-Reliquary Twin-Pylon Crown & Jade Bi-Halo', 'head', parts_h,
        covers_hair=True, covers_face=True,
    )
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.25, mode='any'))
    entries.append(ent_h)

    # --- 2. TORSO: clich_{s}_reliquary_robe (Egyptian Usekh Cyber-Collar, Djed Thorax, Eternian Jade Bi-Clasp & Shendyt/Bufu Apron) ---
    gid_t = f'clich_{sex}_reliquary_robe'
    parts_t = []

    # Long flowing plum-violet & Eternian celadon-circuit robe (cloth-simulated below waist!)
    parts_t.append(torso_tube(gid_t + '_robe_main', core.TOP + 0.006, core.ANKLE + 0.02,
                              ease=0.022, paint=plum_robe_p, n=44, hang_from=core.WAIST, flare=0.20, stiff=0.12))

    # Sculpted 3D Cyber-Plate Bronze Thorax + Broad Egyptian Usekh Collar + Rigid Deco Gorget
    parts_t.extend(cuirass_plate(gid_t, plaque_p, trim_paint=bronze_p, style='cyber_plate',
                                 z_top=core.TOP - 0.004, z_bot=core.WAIST - 0.015, ease=0.025, keel=0.014, faulds=2))
    parts_t.append(collar_disc(gid_t + '_usekh_collar', 0.095, usekh_p, drop=0.062, n=36, ease=0.028, z_off=0.010))
    parts_t.extend(gorget_guard(gid_t, bronze_p, trim_paint=obs_p, ease=0.027))

    # Mathematically centered (x = 0.0) Egyptian Djed-Pillar Sternal Spine + 4 proud centered glowing studs
    st_top = chest_front(core.SHOULDER - 0.030, 0.044, x=0.0)
    st_bot = chest_front(core.WAIST + 0.055, 0.044, x=0.0)
    st_top[0] = 0.0
    st_bot[0] = 0.0
    parts_t.append(mech_tube(gid_t + '_djed_sternum', [st_top, st_bot], 0.020, 0.018, obs_p,
                             n=8, rows=6, rigid_joint='Spine2', slot_hint='torso', scale_xy=(1.10, 0.58)))
    for km, z_m in enumerate(np.linspace(core.SHOULDER - 0.045, core.WAIST + 0.085, 4)):
        r_l = chest_front(z_m, 0.046, x=-0.044)
        r_r = chest_front(z_m, 0.046, x=0.044)
        mc = chest_front(z_m, 0.048, x=0.0)
        # Ensure symmetrical forward depth and strict x = 0.0 centering so studs always sit proud of rungs
        y_rung = min(float(r_l[1]), float(r_r[1]), float(mc[1]))
        r_l = np.array([-0.044, y_rung, float(z_m)], dtype=np.float64)
        r_r = np.array([+0.044, y_rung, float(z_m)], dtype=np.float64)
        mc = np.array([0.0, y_rung - 0.008, float(z_m)], dtype=np.float64)
        parts_t.append(mech_tube(f'{gid_t}_djed_rung_{km}', [r_l, r_r], 0.012, 0.012,
                                 jade_p if km % 2 == 1 else bronze_p, n=8, rows=5, rigid_joint='Spine2', slot_hint='torso'))
        parts_t.append(mech_tube(f'{gid_t}_djed_bezel_{km}', [mc + bk_w * 0.010, mc - bk_w * 0.008],
                                 0.0135, 0.0125, obs_p, n=10, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up_w))
        parts_t.append(mech_tube(f'{gid_t}_djed_core_{km}', [mc + bk_w * 0.002, mc - bk_w * 0.014],
                                 0.0095, 0.0080, cyan_p if km % 2 == 1 else lime_p,
                                 n=10, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up_w))

    # Symmetrical Flanking Bronze & Celadon-Jade Cyber-Thorax Ribs (cleanly flanking x = 0.0 Djed centerpiece!)
    sh_r = J('RightArm')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        for kr, z_r in enumerate(np.linspace(core.SHOULDER - 0.035, core.WAIST + 0.070, 4)):
            r_in = chest_front(z_r, 0.043, x=sgn * 0.048)
            r_out = chest_front(z_r, 0.040, x=sgn * 0.106)
            parts_t.append(mech_tube(f'{gid_t}_cyber_rib_{tag}_{kr}', [r_in, r_out], 0.015, 0.012, plaque_p,
                                     n=8, rows=5, rigid_joint='Spine2', slot_hint='torso', scale_xy=(0.75, 1.25)))
            if kr < 3:
                v_in = chest_front(z_r - 0.016, 0.042, x=sgn * 0.046)
                v_out = chest_front(z_r - 0.016, 0.039, x=sgn * 0.092)
                parts_t.append(mech_tube(f'{gid_t}_lime_vent_{tag}_{kr}', [v_in, v_out], 0.0080, 0.0070, lime_p,
                                         n=6, rows=4, rigid_joint='Spine2', slot_hint='torso'))
    parts_t.extend(articulated_pauldron(gid_t, R, bronze_p, trim_paint=obs_p, lames=2, haute_piece=False, ease=0.026))
    hub_r = sh_r - left_w * 0.018 - bk_w * 0.020 + up_w * 0.012
    parts_t.append(mech_tube(gid_t + '_shoulder_bi_R', [hub_r + bk_w * 0.036, hub_r - bk_w * 0.038],
                             0.056, 0.048, jade_p, n=16, rows=5, rigid_joint='RightArm', slot_hint='torso', ref_dir=up_w))
    parts_t.append(mech_tube(gid_t + '_shoulder_bronze_R', [hub_r - bk_w * 0.014, hub_r - bk_w * 0.044],
                             0.038, 0.034, bronze_p, n=14, rows=4, rigid_joint='RightArm', slot_hint='torso', ref_dir=up_w))
    parts_t.append(mech_tube(gid_t + '_shoulder_core_R', [hub_r - bk_w * 0.024, hub_r - bk_w * 0.052],
                             0.021, 0.018, lime_p, n=12, rows=4, rigid_joint='RightArm', slot_hint='torso', ref_dir=up_w))

    # Left-Shoulder Articulated Eternian Art-Deco Pauldron + Stepped Piers + Full-Seated Sleeves
    sh_l = J('LeftArm')
    parts_t.extend(articulated_pauldron(gid_t, L, plaque_p, trim_paint=bronze_p, lames=3, haute_piece=True, ease=0.026))
    for ks, (dx_s, dz_s) in enumerate(((-0.01, 0.085), (0.022, 0.068), (0.052, 0.048))):
        p_sb = sh_l + left_w * dx_s + up_w * 0.025
        p_st = p_sb + up_w * dz_s + left_w * 0.012
        parts_t.append(mech_tube(f'{gid_t}_pauldron_pier_L_{ks}', [p_sb, p_st], 0.013, 0.010,
                                 jade_p if ks == 1 else bronze_p, n=6, rows=4, rigid_joint='LeftArm', slot_hint='torso'))
    parts_t.append(_sleeve_tube(gid_t + '_sleeve_L', 'Left', plum_robe_p, f0=0.0, f1=0.94, ease=0.028, flare=0.014))
    parts_t.append(_sleeve_tube(gid_t + '_sleeve_R', 'Right', plum_robe_p, f0=0.0, f1=0.94, ease=0.026, flare=0.010))

    # Crimson & Bronze Waist Sash + Dead-Center (x = 0.0) Eternian Jade Bi-Disc & Diamond Buckle + Shendyt/Bufu Apron
    parts_t.append(torso_tube(gid_t + '_crimson_sash', core.WAIST + 0.065, core.WAIST - 0.035,
                              ease=0.036, paint=crimson_p, n=36, rows=6))
    clasp_c = chest_front(core.WAIST + 0.012, 0.042, x=0.0)
    clasp_c[0] = 0.0
    parts_t.append(mech_tube(gid_t + '_bi_clasp_outer', [clasp_c + bk_w * 0.018, clasp_c - bk_w * 0.014],
                             0.048, 0.042, jade_p, n=16, rows=4, rigid_joint='Spine1', slot_hint='torso', ref_dir=up_w))
    parts_t.append(mech_tube(gid_t + '_diamond_clasp', [clasp_c + bk_w * 0.006, clasp_c - bk_w * 0.020],
                             0.034, 0.026, bronze_p, n=4, rows=4, rigid_joint='Spine1', slot_hint='torso', ref_dir=up_w))
    parts_t.append(mech_tube(gid_t + '_clasp_core', [clasp_c - bk_w * 0.004, clasp_c - bk_w * 0.024],
                             0.014, 0.011, cyan_p, n=8, rows=4, rigid_joint='Spine1', slot_hint='torso', ref_dir=up_w))
    # Egyptian Shendyt + Eternian Bufu Circuit-Maze Front Apron (cloth-simulated)
    parts_t.append(tabard(gid_t + '_eg_etn_apron', core.KNEE - 0.10, core.WAIST - 0.015,
                          apron_p, width=0.125, ease=0.048, front=True, back=False))

    ent_t = assemble_garment(gid_t, 'Egyptian-Eternian Cyber-Reliquary Usekh Thorax & Bufu Robes', 'torso', parts_t)
    entries.append(ent_t)

    # --- 3. BACK: clich_{s}_reliquary_servo_arms (Egyptian Djed Spine + Twin Eternian Bi-Joint Cyber-Arms + Necro-Orb) ---
    gid_b = f'clich_{sex}_reliquary_servo_arms'
    parts_b = []

    # Dorsal Egyptian Djed-Pillar Reactor Spine bolted flush to Spine2
    sp_hi = dorsal_back_pt(core.SHOULDER + 0.01, offset=0.018)
    sp_mid = dorsal_back_pt(core.CHEST - 0.02, offset=0.022)
    sp_lo = dorsal_back_pt(core.WAIST + 0.06, offset=0.020)
    parts_b.append(mech_tube(gid_b + '_djed_harness', [sp_hi, sp_mid, sp_lo],
                             0.064, 0.052, obs_p, n=10, rows=7, rigid_joint='Spine2', slot_hint='back',
                             scale_xy=(1.45, 0.58)))
    parts_b.append(mech_tube(gid_b + '_djed_reactor', [sp_hi + bk_w * 0.034, sp_lo + bk_w * 0.030],
                             0.022, 0.018, lime_p, n=8, rows=6, rigid_joint='Spine2', slot_hint='back'))
    for kd, f_d in enumerate((0.18, 0.40, 0.62, 0.84)):
        dc = sp_hi + (sp_lo - sp_hi) * f_d + bk_w * 0.022
        parts_b.append(mech_tube(f'{gid_b}_djed_bar_{kd}', [dc - left_w * 0.072, dc + left_w * 0.072],
                                 0.016, 0.016, jade_p if kd % 2 == 1 else bronze_p,
                                 n=8, rows=5, rigid_joint='Spine2', slot_hint='back'))

    # Symmetrical Pair of LARGE, IMPOSING, ARTICULATED EGYPTIAN-ETERNIAN CYBERNETIC ARMS!
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        pylon_root = sp_hi + left_w * (sgn * 0.040) + bk_w * 0.015
        sh_turret = sp_hi + left_w * (sgn * 0.165) + up_w * 0.135 + bk_w * 0.085
        parts_b.append(mech_tube(f'{gid_b}_pylon_{tag}', [pylon_root, sh_turret],
                                 0.044, 0.040, plaque_p, n=10, rows=6, rigid_joint='Spine2', slot_hint='back'))
        # Eternian Celadon-Jade Bi-Disc Rotary Bearing + Glowing Cyan/Lime Core at Shoulder
        parts_b.append(mech_tube(f'{gid_b}_sh_bi_{tag}', [sh_turret + bk_w * 0.036, sh_turret - bk_w * 0.036],
                                 0.064, 0.060, jade_p, n=16, rows=4, rigid_joint='Spine2', slot_hint='back', ref_dir=up_w))
        parts_b.append(mech_sphere(f'{gid_b}_sh_joint_{tag}', sh_turret, 0.050, bronze_p, 'Spine2', slot_hint='back'))
        parts_b.append(mech_sphere(f'{gid_b}_sh_core_{tag}', sh_turret - bk_w * 0.042, 0.025, cyan_p, 'Spine2', slot_hint='back', n=10, rows=6))

        elbow_p = sh_turret + left_w * (sgn * 0.255) + up_w * 0.165 + bk_w * 0.045
        u_ua = (elbow_p - sh_turret) / max(np.linalg.norm(elbow_p - sh_turret), 1e-6)
        parts_b.append(mech_tube(f'{gid_b}_humerus_{tag}', [sh_turret, elbow_p],
                                 0.044, 0.036, obs_p, n=10, rows=7, rigid_joint='Spine2', slot_hint='back'))
        parts_b.append(mech_tube(f'{gid_b}_humerus_armor_{tag}',
                                 [sh_turret + u_ua * 0.04 + up_w * 0.022, elbow_p - u_ua * 0.04 + up_w * 0.018],
                                 0.042, 0.034, plaque_p, n=8, rows=6, rigid_joint='Spine2', slot_hint='back',
                                 scale_xy=(1.15, 0.72)))
        parts_b.extend(piston_assembly(f'{gid_b}_ua_piston_{tag}',
                                       sh_turret - up_w * 0.036 + u_ua * 0.03,
                                       elbow_p - up_w * 0.032 - u_ua * 0.03,
                                       0.016, bronze_p, lime_p, 'Spine2', slot_hint='back'))

        # Eternian Jade Bi-Disc Elbow Drum + Glowing Node
        parts_b.append(mech_tube(f'{gid_b}_elbow_bi_{tag}', [elbow_p + bk_w * 0.032, elbow_p - bk_w * 0.032],
                                 0.056, 0.052, jade_p, n=16, rows=4, rigid_joint='Spine2', slot_hint='back', ref_dir=up_w))
        parts_b.append(mech_sphere(f'{gid_b}_elbow_drum_{tag}', elbow_p, 0.044, bronze_p, 'Spine2', slot_hint='back'))
        parts_b.append(mech_sphere(f'{gid_b}_elbow_node_{tag}', elbow_p - bk_w * 0.036, 0.022, lime_p, 'Spine2', slot_hint='back', n=10, rows=6))

        wrist_p = elbow_p + left_w * (sgn * 0.165) - up_w * 0.155 - bk_w * 0.145
        u_fa = (wrist_p - elbow_p) / max(np.linalg.norm(wrist_p - elbow_p), 1e-6)
        parts_b.append(mech_tube(f'{gid_b}_forearm_{tag}', [elbow_p, wrist_p],
                                 0.042, 0.032, plaque_p, n=10, rows=7, rigid_joint='Spine2', slot_hint='back'))
        parts_b.append(mech_tube(f'{gid_b}_forearm_cuff_{tag}',
                                 [wrist_p - u_fa * 0.055, wrist_p + u_fa * 0.015],
                                 0.046, 0.040, jade_p, n=10, rows=4, rigid_joint='Spine2', slot_hint='back'))
        parts_b.extend(piston_assembly(f'{gid_b}_fa_piston_{tag}',
                                       elbow_p + bk_w * 0.035 + u_fa * 0.03,
                                       wrist_p + bk_w * 0.032 - u_fa * 0.04,
                                       0.015, obs_p, bronze_p, 'Spine2', slot_hint='back'))

        palm_c = wrist_p + u_fa * 0.058
        side_h = np.cross(u_fa, bk_w)
        if np.linalg.norm(side_h) < 1e-4:
            side_h = up_w
        side_h = side_h / max(np.linalg.norm(side_h), 1e-6)
        # Align palm wide axis explicitly with `side_h` and cap distally with a solid bronze knuckle block
        parts_b.append(mech_tube(f'{gid_b}_palm_{tag}', [wrist_p - u_fa * 0.01, palm_c + u_fa * 0.048],
                                 0.044, 0.042, bronze_p, n=10, rows=5, rigid_joint='Spine2', slot_hint='back',
                                 scale_xy=(1.25, 0.68), ref_dir=side_h))
        parts_b.append(mech_sphere(f'{gid_b}_palm_core_{tag}', palm_c - bk_w * 0.020, 0.022, cyan_p,
                                   'Spine2', slot_hint='back', n=10, rows=6))
        knuckle_c = palm_c + u_fa * 0.042
        parts_b.append(mech_tube(f'{gid_b}_knuckle_bar_{tag}',
                                 [knuckle_c - side_h * 0.036, knuckle_c + side_h * 0.036],
                                 0.019, 0.019, bronze_p, n=8, rows=4, rigid_joint='Spine2', slot_hint='back',
                                 ref_dir=u_fa))
        for fi, off_f in enumerate((-0.028, 0.0, 0.028)):
            # Seat proximal phalanx root 10mm deep inside the palm/knuckle socket and bridge every joint with knuckle spheres
            mcp_p = knuckle_c + side_h * off_f
            f0 = mcp_p - u_fa * 0.010
            f1 = mcp_p + u_fa * 0.062 - bk_w * 0.026 + left_w * (-sgn * 0.016)
            f2 = f1 + u_fa * 0.052 - bk_w * 0.042 + left_w * (-sgn * 0.028)
            f_mat = bronze_p if fi != 1 else jade_p
            parts_b.append(mech_sphere(f'{gid_b}_mcp_{tag}_{fi}', mcp_p, 0.016, bronze_p,
                                       'Spine2', slot_hint='back', n=8, rows=5))
            parts_b.append(mech_tube(f'{gid_b}_claw_prox_{tag}_{fi}', [f0, f1],
                                     0.014, 0.011, f_mat, n=7, rows=5, rigid_joint='Spine2', slot_hint='back'))
            parts_b.append(mech_sphere(f'{gid_b}_pip_{tag}_{fi}', f1, 0.012, bronze_p,
                                       'Spine2', slot_hint='back', n=8, rows=5))
            parts_b.append(mech_tube(f'{gid_b}_claw_dist_{tag}_{fi}', [f1 - (f1 - f0) * 0.10, f2],
                                     0.011, 0.005, f_mat, n=7, rows=5, rigid_joint='Spine2', slot_hint='back'))
        # Solidly rooted opposable thumb seated directly inside the radial palm housing with CMC & IP knuckle joints
        th_cmc = palm_c - u_fa * 0.010 + left_w * (-sgn * 0.022) - bk_w * 0.012
        th0 = th_cmc - left_w * (-sgn * 0.010)
        th_mid = th_cmc + u_fa * 0.034 - bk_w * 0.026 + left_w * (-sgn * 0.024)
        th1 = th_mid + u_fa * 0.036 - bk_w * 0.034 + left_w * (-sgn * 0.024)
        parts_b.append(mech_sphere(f'{gid_b}_th_cmc_{tag}', th_cmc, 0.016, bronze_p,
                                   'Spine2', slot_hint='back', n=8, rows=5))
        parts_b.append(mech_tube(f'{gid_b}_thumb_prox_{tag}', [th0, th_mid], 0.015, 0.011, bronze_p,
                                 n=7, rows=5, rigid_joint='Spine2', slot_hint='back'))
        parts_b.append(mech_sphere(f'{gid_b}_th_ip_{tag}', th_mid, 0.012, bronze_p,
                                   'Spine2', slot_hint='back', n=8, rows=5))
        parts_b.append(mech_tube(f'{gid_b}_thumb_dist_{tag}', [th_mid - (th_mid - th0) * 0.12, th1], 0.011, 0.006, bronze_p,
                                 n=7, rows=5, rigid_joint='Spine2', slot_hint='back'))

    ent_b = assemble_garment(gid_b, 'Egyptian-Eternian Cyber-Reliquary Djed Spine & Bi-Joint Servo-Arms', 'back', parts_b)
    entries.append(ent_b)

    # --- 4. GLOVES: clich_{s}_reliquary_gauntlets (Finger-Joint-Skinned Metallic Bronze/Gold Gauntlets + Sculpted Vambraces) ---
    gid_g = f'clich_{sex}_reliquary_gauntlets'
    gold_finger_p = P('clich_gold', 0.02, [B('bottom', 0.0, 0.12, 'solid', 'clich_bronze_dk')], fabric='metal.gold')
    parts_g = (
        sculpted_vambraces(gid_g, plaque_p, trim_paint=bronze_p, couter=True, ease=0.016)
        + full_gloves(gid_g, bronze_p, bronze_p, finger_paint=gold_finger_p, f0=0.82, ease=0.012, knuckle_paint=jade_p)
    )
    entries.append(assemble_garment(gid_g, 'Egyptian-Eternian Cyber-Reliquary Jade & Bronze Gauntlets', 'gloves', parts_g))

    # --- 5. LEGS: clich_{s}_reliquary_trousers ---
    gid_l = f'clich_{sex}_reliquary_trousers'
    leg_p = P('clich_plum_dk', 0.02, [B('bottom', 0.0, 0.14, 'solid', 'clich_jade_dk')], fabric='cloth.wool')
    parts_l = trousers(gid_l, leg_p, ease=0.016)
    entries.append(assemble_garment(gid_l, 'Egyptian-Eternian Cyber-Reliquary Under-Greaves', 'legs', parts_l, legged=True))

    # --- 6. FEET: clich_{s}_reliquary_boots ---
    gid_f = f'clich_{sex}_reliquary_boots'
    boot_p = P('clich_bronze_dk', 0.02, [B('top', 0.0, 0.16, 'solid', 'clich_jade')], fabric='metal.bronze')
    parts_f = boots(gid_f, boot_p, top=0.36) + sculpted_greaves(
        gid_f, plaque_p, trim_paint=bronze_p, poleyn=True, ease=0.016,
    )
    entries.append(assemble_garment(gid_f, 'Egyptian-Eternian Cyber-Reliquary Jade & Bronze Sabatons', 'feet', parts_f))

    return entries


# ===============================================================================================================
# ARCHETYPE 3: ALCHEMICAL REBREATHER-LICH (`alchemical_lich`, Ref Image 3 — Glowing Tri-Optics & Zero Gaps)
# ===============================================================================================================
def _build_alchemical_lich(sex, body_id):
    set_body(body_id)
    entries = []
    a, b, up, bk, left = head_frame()
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])
    bk_w = np.array([0.0, 1.0, 0.0])

    brass_p = P('clich_brass', 0.025, [B('bottom', 0.0, 0.10, 'solid', 'clich_brass_dk')],
                [PN(0.0, 1.0, 'clich_alchemical_brass', 'clich_chrome', 'clich_brass', 0.24)], fabric='metal.brass')
    brass_dk_p = P('clich_brass_dk', 0.02, fabric='metal.brass')
    copper_p = P('clich_copper', 0.025, [B('bottom', 0.0, 0.12, 'solid', 'clich_copper_dk')], fabric='metal.bronze')
    verdigris_p = P('clich_verdigris', 0.025, [B('bottom', 0.0, 0.14, 'solid', 'clich_brass_dk')], fabric='metal.bronze')
    obs_p = P('clich_obsidian', 0.015, fabric='metal.iron')
    charcoal_p = P('clich_charcoal', 0.02, [B('bottom', 0.0, 0.08, 'solid', 'clich_obsidian')],
                   [PN(0.0, 1.0, 'clich_alchemical_coat_tex', 'clich_indigo', 'clich_charcoal', 0.22)], fabric='cloth.wool')
    # Vivid high-luma toxic-emerald / acid-green ocular & alembic glow
    acid_glow_p = P('clich_acidcore', 0.0, [B('bottom', 0.0, 0.35, 'solid', 'clich_acidgreen')], fabric='beads.glass')
    emerald_p = P('clich_emcore', 0.0, [B('top', 0.0, 0.30, 'solid', 'clich_acidgreen')], fabric='beads.glass')
    indigo_p = P('clich_indigo', 0.02, [],
                 [PN(0.0, 1.0, 'clich_alchemical_pauldron', 'clich_indigo_hi', 'clich_indigo', 0.22)], fabric='metal.iron')
    tabard_p = P('clich_indigo', 0.02, [],
                 [PN(0.0, 1.0, 'clich_alchemical_tabard', 'clich_chalk', 'clich_indigo', 0.22)], fabric='cloth.wool')
    sash_p = P('clich_indigo', 0.02, [B('bottom', 0.0, 0.12, 'solid', 'clich_obsidian')], fabric='cloth.wool')
    leather_p = P('clich_leather', 0.025, [B('top', 0.0, 0.15, 'solid', 'clich_brass')], fabric='leather.smooth')
    chalk_p = P('clich_chalk', 0.0, fabric='metal.iron')

    # --- 1. HEAD: clich_{s}_alchemical_rebreather (Multi-Tiered Brass/Verdigris Diving Dome + Bright Tri-Optics + Cheek Vials) ---
    gid_h = f'clich_{sex}_alchemical_rebreather'
    parts_h = _sculpted_skull_dome(gid_h, brass_p, acid_glow_p, obs_p, left, bk, up, a, b, eye_r=0.017)

    # Multi-tiered riveted brass & verdigris diving-bell cranial bands + top pressure-valve finial cap (closes crown 100%)
    crown_top = a + (b - a) * 1.01
    parts_h.append(mech_tube(gid_h + '_crown_cap', [crown_top - up * 0.016, crown_top + up * 0.026],
                             0.044, 0.024, verdigris_p, n=14, rows=5, rigid_joint='Head', slot_hint='head'))
    parts_h.append(mech_tube(gid_h + '_crown_valve', [crown_top + up * 0.018, crown_top + up * 0.048],
                             0.016, 0.022, brass_dk_p, n=10, rows=4, rigid_joint='Head', slot_hint='head'))
    for kt, (ft, rx_t, ry_t, mat_t) in enumerate((
        (0.78, 0.098, 0.124, verdigris_p),
        (0.56, 0.104, 0.128, brass_dk_p),
        (0.32, 0.092, 0.112, copper_p),
    )):
        c_t = a + (b - a) * ft
        band_pts = [
            c_t + left * (math.sin(an) * rx_t) + bk * (math.cos(an) * ry_t)
            for an in np.linspace(0.0, 2.0 * math.pi, 21)
        ]
        parts_h.append(mech_tube(f'{gid_h}_dome_tier_{kt}', band_pts, 0.0115, 0.0115, mat_t,
                                 n=8, rows=21, rigid_joint='Head', slot_hint='head', cap_ends=False))

    # Wide riveted brass diving-collar neck-gasket ring sealing head-to-torso completely (ZERO neck/chin transparency!)
    parts_h.append(mech_tube(gid_h + '_neck_gasket',
                             [a + (b - a) * 0.08 + bk * 0.008, a - (b - a) * 0.48 + bk * 0.012],
                             0.068, 0.072, brass_dk_p, n=16, rows=6, rigid_joint='Head', slot_hint='head'))
    parts_h.append(mech_tube(gid_h + '_neck_flange',
                             [a - (b - a) * 0.26 + bk * 0.010, a - (b - a) * 0.42 + bk * 0.012],
                             0.078, 0.082, copper_p, n=16, rows=4, rigid_joint='Head', slot_hint='head'))

    # Bright high-luma glowing toxic-emerald / acid-green ocular domes inside dark beveled brass optic rings
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        oc = a + (b - a) * 0.46 + left * (sgn * 0.033) - bk * 0.098
        parts_h.append(mech_tube(f'{gid_h}_goggle_brass_{tag}', [oc + bk * 0.020, oc - bk * 0.006],
                                 0.027, 0.024, brass_dk_p, n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
        parts_h.append(mech_tube(f'{gid_h}_goggle_rim_{tag}', [oc + bk * 0.012, oc - bk * 0.014],
                                 0.023, 0.020, obs_p, n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
        parts_h.append(mech_sphere(f'{gid_h}_eye_bulb_{tag}', oc - bk * 0.013, 0.0165, acid_glow_p,
                                   'Head', slot_hint='head', n=14, rows=8))

        # Glowing cheek breather-vials seated flush on both cheeks w/ brass end-ferrules
        v_top = a + (b - a) * 0.36 + left * (sgn * 0.078) - bk * 0.056
        v_bot = a + (b - a) * 0.14 + left * (sgn * 0.074) - bk * 0.062
        parts_h.append(mech_tube(f'{gid_h}_cheek_vial_{tag}', [v_top, v_bot],
                                 0.013, 0.013, acid_glow_p, n=10, rows=5, rigid_joint='Head', slot_hint='head'))
        parts_h.append(mech_tube(f'{gid_h}_vial_cap_hi_{tag}', [v_top + up * 0.008, v_top - up * 0.008],
                                 0.016, 0.016, brass_dk_p, n=10, rows=4, rigid_joint='Head', slot_hint='head'))
        parts_h.append(mech_tube(f'{gid_h}_vial_cap_lo_{tag}', [v_bot + up * 0.008, v_bot - up * 0.008],
                                 0.016, 0.016, brass_dk_p, n=10, rows=4, rigid_joint='Head', slot_hint='head'))

    # Third central forehead toxic-emerald optic dome + beveled brass bezel + crisp chalk inverted-triangle frame
    opt3 = a + (b - a) * 0.62 - bk * 0.106
    parts_h.append(mech_tube(gid_h + '_optic3_brass', [opt3 + bk * 0.020, opt3 - bk * 0.006],
                             0.026, 0.023, brass_dk_p, n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    parts_h.append(mech_tube(gid_h + '_optic3_rim', [opt3 + bk * 0.012, opt3 - bk * 0.014],
                             0.022, 0.019, obs_p, n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    parts_h.append(mech_sphere(gid_h + '_optic3_lens', opt3 - bk * 0.013, 0.016, acid_glow_p,
                               'Head', slot_hint='head', n=14, rows=8))
    # Inverted triangle alchemical brow trim framing optic3
    tri_l = opt3 + left * 0.029 + up * 0.023 - bk * 0.004
    tri_r = opt3 - left * 0.029 + up * 0.023 - bk * 0.004
    tri_b = opt3 - up * 0.031 - bk * 0.004
    parts_h.append(mech_tube(gid_h + '_optic3_tri', [tri_l, tri_r, tri_b, tri_l],
                             0.0040, 0.0040, chalk_p, n=6, rows=8, rigid_joint='Head', slot_hint='head'))

    # Radial cranial acupuncture pins bristling around upper riveted brass dome
    dome_c = a + (b - a) * 0.68
    for kp, ang_pin in enumerate(np.linspace(-0.46 * math.pi, 0.46 * math.pi, 7)):
        p_dir = left * math.sin(ang_pin) + up * math.cos(ang_pin)
        p_in = dome_c + p_dir * 0.040 - bk * 0.010
        p_out = dome_c + p_dir * 0.148 - bk * 0.014
        parts_h.append(mech_tube(f'{gid_h}_cran_pin_{kp}', [p_in, p_out],
                                 0.0048, 0.0015, obs_p, n=6, rows=4, rigid_joint='Head', slot_hint='head'))

    # Heavy rebreather snout + glowing emerald vent slit + thicker corrugated cheek hoses w/ 4 clamp rings each
    snout_c = a + (b - a) * 0.22 - bk * 0.100
    parts_h.append(mech_tube(gid_h + '_respirator_snout', [snout_c + bk * 0.030, snout_c - bk * 0.040],
                             0.040, 0.032, obs_p, n=14, rows=5, rigid_joint='Head', slot_hint='head', ref_dir=up))
    parts_h.append(mech_tube(gid_h + '_snout_ring', [snout_c - bk * 0.010, snout_c - bk * 0.032],
                             0.037, 0.035, brass_dk_p, n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    parts_h.append(mech_tube(gid_h + '_snout_glow', [snout_c - bk * 0.022, snout_c - bk * 0.044],
                             0.017, 0.014, acid_glow_p, n=10, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        hose_pts = _catmull_spline([
            snout_c + left * (sgn * 0.028) - bk * 0.012,
            a + (b - a) * 0.16 + left * (sgn * 0.112) - bk * 0.030,
            a + (b - a) * 0.00 + left * (sgn * 0.126) + bk * 0.010,
            a - (b - a) * 0.34 + left * (sgn * 0.062) + bk * 0.012,
        ], 14)
        parts_h.append(mech_tube(f'{gid_h}_hose_{tag}', hose_pts, 0.0185, 0.0170, brass_dk_p,
                                 n=10, rows=14, rigid_joint='Head', slot_hint='head'))
        for kr_h, idx_h in enumerate((2, 5, 8, 11)):
            hc = hose_pts[idx_h]
            ht = hose_pts[min(idx_h + 1, len(hose_pts) - 1)] - hose_pts[max(idx_h - 1, 0)]
            ht = ht / max(np.linalg.norm(ht), 1e-6)
            parts_h.append(mech_tube(f'{gid_h}_hose_ring_{tag}_{kr_h}',
                                     [hc - ht * 0.007, hc + ht * 0.007],
                                     0.0220, 0.0220, copper_p if kr_h % 2 == 0 else obs_p,
                                     n=10, rows=4, rigid_joint='Head', slot_hint='head'))

    ent_h = assemble_garment(gid_h, 'Alchemical Rebreather-Lich Glowing Tri-Optic Dome', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.25, mode='any'))
    entries.append(ent_h)

    # --- 2. TORSO: clich_{s}_alchemical_coat (Zero Transparency Gaps + Alembic Chest-Flasks + Riveted Collar & Pauldrons) ---
    gid_t = f'clich_{sex}_alchemical_coat'
    parts_t = []

    # Full-coverage layered charcoal-and-violet alchemical coat/robe (raised top + snug inner collar seal neck 100%!)
    parts_t.append(torso_tube(gid_t + '_coat_main', core.TOP + 0.020, core.ANKLE + 0.03,
                              ease=0.022, paint=charcoal_p, n=44, hang_from=core.WAIST, flare=0.15, stiff=0.13))
    # Snug inner turtleneck collar + solid throat-seal column closing neck seam completely
    parts_t.append(collar(gid_t + '_inner_neck_seal', obs_p, height=0.038, flare=0.004, ease=0.012, rows=5, n=32))
    parts_t.append(mech_tube(gid_t + '_throat_plug',
                             [spine_at(core.TOP - 0.025), spine_at(core.NECK[2] + 0.042)],
                             0.058, 0.052, obs_p, n=14, rows=5, rigid_joint='Neck', slot_hint='torso'))
    # Sculpted 3D riveted brass/verdigris cyber-plate cuirass + riveted copper/iron gorget sealing neck/clavicle
    parts_t.extend(cuirass_plate(gid_t, brass_p, trim_paint=copper_p, style='cyber_plate',
                                 z_top=core.TOP - 0.002, z_bot=core.WAIST - 0.015, ease=0.026, keel=0.015, faulds=2))
    parts_t.append(collar_disc(gid_t + '_neck_seal', 0.058, copper_p, drop=0.044, n=32, ease=0.028, z_off=0.016))
    parts_t.extend(gorget_guard(gid_t, obs_p, trim_paint=copper_p, ease=0.027))

    # Central glowing toxic-emerald alchemical sternum condenser gauge
    st_alc = chest_front(core.CHEST + 0.035, 0.048, x=0.0)
    parts_t.append(mech_tube(gid_t + '_chest_port_brass', [st_alc + bk_w * 0.018, st_alc - bk_w * 0.008],
                             0.030, 0.026, brass_dk_p, n=14, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up_w))
    parts_t.append(mech_tube(gid_t + '_chest_port_rim', [st_alc + bk_w * 0.012, st_alc - bk_w * 0.014],
                             0.024, 0.020, obs_p, n=14, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up_w))
    parts_t.append(mech_sphere(gid_t + '_chest_port_glow', st_alc - bk_w * 0.012, 0.016, acid_glow_p,
                               'Spine2', slot_hint='torso', n=12, rows=6))

    # Twin glowing green alembic chest-flasks + brass stoppers + brass piping feeding collar & sternum gauge
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        fl_hi = chest_front(core.CHEST + 0.052, 0.045, x=sgn * 0.068)
        fl_lo = chest_front(core.CHEST - 0.032, 0.046, x=sgn * 0.066)
        parts_t.append(mech_tube(f'{gid_t}_alembic_flask_{tag}', [fl_hi, fl_lo],
                                 0.016, 0.018, acid_glow_p, n=12, rows=6, rigid_joint='Spine2', slot_hint='torso'))
        parts_t.append(mech_tube(f'{gid_t}_flask_cap_hi_{tag}', [fl_hi + up_w * 0.012, fl_hi - up_w * 0.008],
                                 0.019, 0.020, copper_p, n=10, rows=4, rigid_joint='Spine2', slot_hint='torso'))
        parts_t.append(mech_tube(f'{gid_t}_flask_cap_lo_{tag}', [fl_lo + up_w * 0.008, fl_lo - up_w * 0.012],
                                 0.021, 0.018, copper_p, n=10, rows=4, rigid_joint='Spine2', slot_hint='torso'))
        # Brass cage bands around each alembic flask
        fl_mid = 0.5 * (fl_hi + fl_lo)
        parts_t.append(mech_tube(f'{gid_t}_flask_band_{tag}', [fl_mid + up_w * 0.006, fl_mid - up_w * 0.006],
                                 0.0195, 0.0195, obs_p, n=10, rows=4, rigid_joint='Spine2', slot_hint='torso'))
        # Curved brass piping linking flask top -> collar & flask bottom -> sternum gauge -> waist sash
        pipe_hi = _catmull_spline([
            chest_front(core.TOP + 0.006, 0.030, x=sgn * 0.044),
            fl_hi + up_w * 0.010,
            st_alc + left_w * (sgn * 0.022),
        ], 7)
        parts_t.append(mech_tube(f'{gid_t}_brass_pipe_hi_{tag}', pipe_hi, 0.0095, 0.0090, brass_p,
                                 n=8, rows=7, rigid_joint='Spine2', slot_hint='torso'))
        ch_hose = _catmull_spline([
            fl_lo - up_w * 0.006,
            chest_front(core.WAIST + 0.075, 0.045, x=sgn * 0.056),
            chest_front(core.WAIST + 0.020, 0.042, x=sgn * 0.026),
        ], 8)
        parts_t.append(mech_tube(f'{gid_t}_chest_hose_{tag}', ch_hose, 0.0120, 0.0110, brass_dk_p,
                                 n=8, rows=8, rigid_joint='Spine2', slot_hint='torso'))

    # Sculpted articulated indigo-steel scrolled pauldrons studded with brass pins + sealed armholes & wrist cuffs
    parts_t.extend(articulated_pauldrons(gid_t, indigo_p, trim_paint=brass_p, lames=3, haute_piece=True, ease=0.026))
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        sh = J(side + 'Arm')
        wr = J(side + 'Hand')
        el = J(side + 'ForeArm')
        u_fa = (wr - el) / max(float(np.linalg.norm(wr - el)), 1e-6)
        # Armhole gusset sphere sealing axilla/shoulder seam 100% (ZERO armpit transparency!)
        parts_t.append(mech_sphere(f'{gid_t}_armhole_gusset_{side}', sh - left_w * (sgn * 0.010), 0.060,
                                   obs_p, side + 'Arm', slot_hint='torso', n=12, rows=8))
        # 3 radial brass studs/pins per pauldron
        for ks, (dx_s, dz_s) in enumerate(((0.04, 0.064), (0.09, 0.034), (0.11, -0.010))):
            s_in = sh + left_w * (sgn * dx_s) + up_w * dz_s
            s_out = s_in + left_w * (sgn * 0.044) + up_w * 0.038
            parts_t.append(mech_tube(f'{gid_t}_pstud_{side}_{ks}', [s_in, s_out],
                                     0.013, 0.005, brass_p, n=8, rows=4, rigid_joint=side + 'Arm', slot_hint='torso'))
        # Full-length alchemical sleeves starting at f0=0.0 (start_back=0.048!) to f1=0.99 (wrist) + riveted wrist cuff!
        parts_t.append(_sleeve_tube(f'{gid_t}_sleeve_{side}', side, charcoal_p, f0=0.0, f1=0.99, ease=0.024, flare=0.004))
        parts_t.append(mech_tube(f'{gid_t}_wrist_seal_{side}', [wr - u_fa * 0.036, wr + u_fa * 0.010],
                                 0.044, 0.041, copper_p, n=12, rows=4, rigid_joint=side + 'ForeArm', slot_hint='torso'))

    # Deep-violet wrapped waist sash (extra overlap sealing waist seam) + crisp inverted-triangle front tabard + leather pouch
    parts_t.append(torso_tube(gid_t + '_indigo_sash', core.WAIST + 0.075, core.WAIST - 0.055,
                              ease=0.036, paint=sash_p, n=38, rows=7))
    parts_t.append(tabard(gid_t + '_alchem_tabard', core.ANKLE + 0.08, core.WAIST + 0.01,
                          tabard_p, width=0.145, ease=0.046))
    pouch_c = chest_front(core.WAIST + 0.005, 0.048, x=-0.055)
    parts_t.append(mech_box(gid_t + '_belt_pouch', pouch_c, (0.048, 0.026, 0.054),
                            leather_p, 'Spine1', slot_hint='torso'))

    ent_t = assemble_garment(gid_t, 'Alchemical Rebreather-Lich Pauldron Coat & Triangle Tabard', 'torso', parts_t)
    entries.append(ent_t)

    # --- 3. BACK: clich_{s}_alchemical_manifold ---
    gid_b = f'clich_{sex}_alchemical_manifold'
    parts_b = []
    p_hi = dorsal_back_pt(core.SHOULDER - 0.02, offset=0.016)
    p_lo = dorsal_back_pt(core.WAIST + 0.05, offset=0.018)
    parts_b.append(mech_tube(gid_b + '_manifold_core', [p_hi, p_lo], 0.054, 0.046, brass_dk_p,
                             n=10, rows=7, rigid_joint='Spine2', slot_hint='back', scale_xy=(1.35, 0.55)))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        t_hi = p_hi + left_w * (sgn * 0.068) + bk_w * 0.038
        t_lo = p_lo + left_w * (sgn * 0.068) + bk_w * 0.036
        parts_b.append(mech_tube(f'{gid_b}_canister_{tag}', [t_lo, t_hi], 0.032, 0.032, emerald_p,
                                 n=12, rows=7, rigid_joint='Spine2', slot_hint='back'))
        parts_b.append(mech_tube(f'{gid_b}_cap_hi_{tag}', [t_hi - up_w * 0.024, t_hi + up_w * 0.018],
                                 0.038, 0.028, brass_p, n=12, rows=4, rigid_joint='Spine2', slot_hint='back'))
        parts_b.append(mech_tube(f'{gid_b}_cap_lo_{tag}', [t_lo - up_w * 0.016, t_lo + up_w * 0.024],
                                 0.028, 0.038, brass_p, n=12, rows=4, rigid_joint='Spine2', slot_hint='back'))
        lp = _catmull_spline([t_hi + up_w * 0.010, t_hi + up_w * 0.055 - left_w * (sgn * 0.025), p_hi + up_w * 0.015], 7)
        parts_b.append(mech_tube(f'{gid_b}_pipe_{tag}', lp, 0.012, 0.012, obs_p,
                                 n=8, rows=7, rigid_joint='Spine2', slot_hint='back'))

    ent_b = assemble_garment(gid_b, 'Alchemical Rebreather-Lich Dorsal Reagent Manifold', 'back', parts_b)
    entries.append(ent_b)

    # --- 4. GLOVES: clich_{s}_alchemical_gauntlets (Finger-Joint-Skinned Metallic Brass Gauntlets + Sculpted Vambraces + Forearm Pins) ---
    gid_g = f'clich_{sex}_alchemical_gauntlets'
    parts_g = (
        sculpted_vambraces(gid_g, brass_p, trim_paint=brass_dk_p, couter=True, ease=0.016)
        + full_gloves(gid_g, brass_dk_p, brass_p, finger_paint=brass_dk_p, f0=0.82, ease=0.012, knuckle_paint=obs_p)
        + _forearm_pins(gid_g, obs_p)
    )
    entries.append(assemble_garment(gid_g, 'Alchemical Rebreather-Lich Brass Pin-Gauntlets', 'gloves', parts_g))

    # --- 5. LEGS: clich_{s}_alchemical_trousers ---
    gid_l = f'clich_{sex}_alchemical_trousers'
    parts_l = trousers(gid_l, charcoal_p, ease=0.016)
    entries.append(assemble_garment(gid_l, 'Alchemical Rebreather-Lich Charcoal Trousers', 'legs', parts_l, legged=True))

    # --- 6. FEET: clich_{s}_alchemical_boots ---
    gid_f = f'clich_{sex}_alchemical_boots'
    boot_p = P('clich_obsidian', 0.02, [B('top', 0.0, 0.14, 'solid', 'clich_charcoal')], fabric='metal.iron')
    parts_f = boots(gid_f, boot_p, top=0.36) + sculpted_greaves(
        gid_f, obs_p, trim_paint=brass_p, poleyn=True, ease=0.016,
    )
    entries.append(assemble_garment(gid_f, 'Alchemical Rebreather-Lich Obsidian Cyber-Boots', 'feet', parts_f))

    return entries


# ===============================================================================================================
# ARCHETYPE 4: SPINE-TENTACLE CYBER-LICH (`tentacle_lich` & `tentacle_lich_deployed`, Ref Image 4)
# Full Skeletal Prosthetics Kit + Extensible 6-Tentacle Dorsal Spine-Rack
# ===============================================================================================================
def _build_spine_tentacle_pack(gid_b, label, extended, gunmetal_p, obs_p, jade_p, jadecore_p):
    """Build flush Spine2 dorsal mechanical spine-rack + 6 articulated cyber-tentacles."""
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])
    bk_w = np.array([0.0, 1.0, 0.0])
    parts_b = []

    # Dorsal spine-rack housing bolted flush along Spine2 -> Spine1 (matching Breakdowns sheet!)
    z_top = core.SHOULDER - 0.015
    z_bot = core.WAIST + 0.025
    rack_pts = [dorsal_back_pt(z_k, offset=0.014) for z_k in np.linspace(z_top, z_bot, 7)]
    parts_b.append(mech_tube(gid_b + '_spine_rack', rack_pts, 0.044, 0.036, gunmetal_p,
                             n=10, rows=9, rigid_joint='Spine2', slot_hint='back', scale_xy=(1.25, 0.62)))
    # Segmented pale-jade dorsal vertebrae plates along the spine-rack
    for kv, z_v in enumerate(np.linspace(z_top - 0.01, z_bot + 0.01, 7)):
        vp = dorsal_back_pt(z_v, offset=0.026)
        parts_b.append(mech_tube(f'{gid_b}_rack_vert_{kv}', [vp + up_w * 0.012, vp - up_w * 0.012],
                                 0.022, 0.018, jade_p, n=8, rows=4, rigid_joint='Spine2', slot_hint='back',
                                 scale_xy=(1.1, 0.72)))
    # Armored lateral clamping wings flanking the spine-rack
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        w_pts = [dorsal_back_pt(z_k, offset=0.022, x=sgn * 0.056) for z_k in np.linspace(z_top - 0.02, z_bot + 0.03, 5)]
        parts_b.append(mech_tube(f'{gid_b}_rack_wing_{tag}', w_pts, 0.026, 0.020, obs_p,
                                 n=8, rows=6, rigid_joint='Spine2', slot_hint='back'))

    # 6 Articulated Cyber-Tentacles / Input-Cable Mechadendrites sprouting from the spine-rack!
    # In `extended=True` mode, all 6 sweep dramatically outward & wide (like Ref 4's active deployment);
    # in default mode, they sweep gracefully out-and-back in a balanced menacing fan that clears arms/torso cleanly.
    if extended:
        # Dramatic extended/deployed sweeping fan (4 sweeping far left/outward + 2 balancing right/back-right)
        tentacle_specs = [
            # (z_frac, x_root_sgn, ctrl_offsets [(dx, dy_bk, dz), ...])
            (0.15,  1.0, [(0.08, 0.06,  0.06), (0.28, 0.04,  0.08), (0.52, -0.02,  0.06), (0.72, -0.06,  0.02)]),
            (0.35,  1.0, [(0.09, 0.07,  0.01), (0.30, 0.05, -0.04), (0.54,  0.00, -0.08), (0.74, -0.05, -0.10)]),
            (0.58,  1.0, [(0.08, 0.08, -0.04), (0.26, 0.06, -0.12), (0.48,  0.01, -0.18), (0.68, -0.03, -0.22)]),
            (0.80,  1.0, [(0.07, 0.07, -0.08), (0.22, 0.05, -0.18), (0.40,  0.02, -0.26), (0.56,  0.00, -0.30)]),
            (0.25, -1.0, [(-0.08, 0.07,  0.04), (-0.24, 0.12,  0.06), (-0.42, 0.14,  0.02), (-0.58, 0.12, -0.04)]),
            (0.65, -1.0, [(-0.08, 0.08, -0.05), (-0.22, 0.13, -0.13), (-0.38, 0.15, -0.21), (-0.52, 0.13, -0.26)]),
        ]
    else:
        # Balanced sweeping dorsal fan (3 left, 3 right — clearly visible from front, side, and back!)
        tentacle_specs = [
            (0.16,  1.0, [(0.07, 0.06,  0.04), (0.20, 0.12,  0.06), (0.34, 0.14,  0.02), (0.46, 0.12, -0.04)]),
            (0.46,  1.0, [(0.08, 0.07, -0.02), (0.22, 0.13, -0.06), (0.36, 0.14, -0.12), (0.48, 0.12, -0.18)]),
            (0.78,  1.0, [(0.07, 0.07, -0.06), (0.18, 0.12, -0.15), (0.30, 0.13, -0.24), (0.40, 0.11, -0.30)]),
            (0.16, -1.0, [(-0.07, 0.06,  0.04), (-0.20, 0.12,  0.06), (-0.34, 0.14,  0.02), (-0.46, 0.12, -0.04)]),
            (0.46, -1.0, [(-0.08, 0.07, -0.02), (-0.22, 0.13, -0.06), (-0.36, 0.14, -0.12), (-0.48, 0.12, -0.18)]),
            (0.78, -1.0, [(-0.07, 0.07, -0.06), (-0.18, 0.12, -0.15), (-0.30, 0.13, -0.24), (-0.40, 0.11, -0.30)]),
        ]

    for kt, (zf, sgn_r, offs) in enumerate(tentacle_specs):
        z_root = z_top * (1.0 - zf) + z_bot * zf
        p_root = dorsal_back_pt(z_root, offset=0.016, x=sgn_r * 0.022)
        ctrl = [p_root] + [p_root + left_w * dx + bk_w * dy + up_w * dz for dx, dy, dz in offs]
        sp = _catmull_spline(ctrl, 16)

        # Primary ribbed gunmetal tentacle cable
        parts_b.append(mech_tube(f'{gid_b}_tent_{kt}', sp, 0.0165, 0.0105, gunmetal_p,
                                 n=8, rows=16, rigid_joint='Spine2', slot_hint='back'))
        # 3 glowing pale-jade joint rings wrapped directly around the spline
        for kr_i, idx_r in enumerate((4, 8, 12)):
            c_ring = sp[idx_r]
            tang_r = sp[min(idx_r + 1, len(sp) - 1)] - sp[max(idx_r - 1, 0)]
            tang_r = tang_r / max(np.linalg.norm(tang_r), 1e-6)
            r_ring = 0.0195 - 0.0020 * kr_i
            parts_b.append(mech_tube(f'{gid_b}_ring_{kt}_{kr_i}',
                                     [c_ring - tang_r * 0.009, c_ring + tang_r * 0.009],
                                     r_ring, r_ring, jadecore_p, n=8, rows=4,
                                     rigid_joint='Spine2', slot_hint='back'))
        # Terminal data-jack housing + twin micro-claws directly on tentacle tip
        tip_p = sp[-1]
        tip_dir = sp[-1] - sp[-2]
        tip_dir = tip_dir / max(np.linalg.norm(tip_dir), 1e-6)
        parts_b.append(mech_tube(f'{gid_b}_jack_{kt}', [tip_p - tip_dir * 0.012, tip_p + tip_dir * 0.026],
                                 0.014, 0.012, obs_p, n=8, rows=4, rigid_joint='Spine2', slot_hint='back'))
        perp = np.cross(tip_dir, up_w)
        if np.linalg.norm(perp) < 1e-4:
            perp = left_w
        perp = perp / max(np.linalg.norm(perp), 1e-6)
        for kc, s_c in enumerate((-1.0, 1.0)):
            c0 = tip_p + tip_dir * 0.020 + perp * (s_c * 0.008)
            c1 = c0 + tip_dir * 0.028 + perp * (s_c * 0.006)
            parts_b.append(mech_tube(f'{gid_b}_tipclaw_{kt}_{kc}', [c0, c1], 0.0045, 0.0018, jade_p,
                                     n=6, rows=4, rigid_joint='Spine2', slot_hint='back'))

    return assemble_garment(gid_b, label, 'back', parts_b)


def _build_tentacle_lich(sex, body_id):
    set_body(body_id)
    entries = []
    a, b, up, bk, left = head_frame()
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])
    bk_w = np.array([0.0, 1.0, 0.0])

    jade_skull_p = P('clich_jade', 0.02, [], [PN(0.0, 1.0, 'clich_skull_face', 'clich_jadecore', 'clich_jade', 0.22)], fabric='metal.iron')
    jade_p = P('clich_jade', 0.02, [B('bottom', 0.0, 0.12, 'solid', 'clich_jade_dk')], fabric='metal.iron')
    jadecore_p = P('clich_jadecore', 0.0, [B('top', 0.0, 0.25, 'solid', 'clich_limecore')], fabric='beads.glass')
    gunmetal_p = P('clich_gunmetal', 0.02, [], [PN(0.0, 1.0, 'clich_jade_chassis', 'clich_jade', 'clich_gunmetal', 0.20)], fabric='metal.iron')
    obs_p = P('clich_obsidian', 0.015, fabric='metal.iron')
    poncho_p = P('clich_charcoal', 0.02, [], [PN(0.0, 1.0, 'clich_circuit_poncho', 'clich_steel', 'clich_charcoal', 0.22)], fabric='cloth.wool')

    # --- 1. HEAD: clich_{s}_cyber_skull (Verdigris/Pale-Jade Cyber-Skull + Audio-Ports + 3-Spike Crown) ---
    gid_h = f'clich_{sex}_cyber_skull'
    parts_h = _sculpted_skull_dome(gid_h, jade_skull_p, jadecore_p, gunmetal_p, left, bk, up, a, b, eye_r=0.013)

    # Dark gunmetal circular side audio-ports over ears + lower jaw actuators
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        ear_c = a + (b - a) * 0.44 + left * (sgn * 0.088) + bk * 0.010
        parts_h.append(mech_tube(f'{gid_h}_audioport_{tag}',
                                 [ear_c - left * (sgn * 0.014), ear_c + left * (sgn * 0.022)],
                                 0.032, 0.028, obs_p, n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
        jaw_p = a + (b - a) * 0.20 + left * (sgn * 0.072) + bk * 0.008
        parts_h.append(mech_tube(f'{gid_h}_jaw_port_{tag}',
                                 [jaw_p - left * (sgn * 0.010), jaw_p + left * (sgn * 0.018)],
                                 0.016, 0.014, gunmetal_p, n=10, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))

    # Iconic 3-Spike Occipital Crown (tall central spike + 2 flanking spikes on upper-back cranium)
    crown_base = a + (b - a) * 0.88 + bk * 0.028
    parts_h.append(mech_tube(gid_h + '_crown_band',
                             [crown_base - left * 0.072, crown_base + up * 0.014, crown_base + left * 0.072],
                             0.016, 0.016, obs_p, n=8, rows=5, rigid_joint='Head', slot_hint='head'))
    for ks, (lx_s, h_s) in enumerate(((-0.048, 0.110), (0.0, 0.160), (0.048, 0.110))):
        sb = crown_base + left * lx_s
        st = sb + up * h_s + left * (lx_s * 0.20) + bk * 0.012
        parts_h.append(mech_tube(f'{gid_h}_crown_spike_{ks}', [sb, st],
                                 0.010, 0.002, obs_p, n=6, rows=5, rigid_joint='Head', slot_hint='head'))

    ent_h = assemble_garment(gid_h, 'Spine-Tentacle Cyber-Lich Pale-Jade Cyber-Skull', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.25, mode='any'))
    entries.append(ent_h)

    # --- 2. TORSO: clich_{s}_cyber_chassis (Exposed Gunmetal-and-Jade Spine/Ribcage + Asymmetric Circuit Capelet) ---
    gid_t = f'clich_{sex}_cyber_chassis'
    parts_t = []

    # Exposed central spine & pale-jade vertebrae column (Neck -> Spine2 -> Spine1 -> Hips)
    sp2_j, sp1_j, sp0_j, hip_j = J('Spine2'), J('Spine1'), J('Spine'), J('Hips')
    spine_pts = [J('Neck') + bk_w * 0.026, sp2_j + bk_w * 0.040, sp1_j + bk_w * 0.042, sp0_j + bk_w * 0.038, hip_j + bk_w * 0.026]
    parts_t.append(mech_tube(gid_t + '_spine_col', spine_pts, 0.032, 0.030, obs_p,
                             n=10, rows=10, rigid_joint='Spine', slot_hint='torso'))
    for kv, z_v in enumerate(np.linspace(core.SHOULDER + 0.02, core.WAIST - 0.05, 9)):
        vc = spine_at(z_v) + bk_w * 0.038
        parts_t.append(mech_tube(f'{gid_t}_vert_{kv}', [vc + up_w * 0.010, vc - up_w * 0.010],
                                 0.042, 0.038, jade_p, n=10, rows=4, rigid_joint='Spine', slot_hint='torso'))

    # Exposed skeletal ribcage (sternum + 5 pairs of gunmetal-and-jade rib bars)
    stern_pts = [chest_front(z_st, 0.006) for z_st in np.linspace(core.TOP - 0.02, core.WAIST + 0.06, 6)]
    parts_t.append(mech_tube(gid_t + '_sternum', stern_pts, 0.022, 0.018, gunmetal_p,
                             n=8, rows=6, rigid_joint='Spine2', slot_hint='torso', scale_xy=(1.1, 0.55)))
    x_ax, y_ax = np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0])
    for ir, z_rb in enumerate(np.linspace(core.SHOULDER - 0.03, core.WAIST + 0.08, 5)):
        cz_r = spine_at(z_rb)
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            angs_r = np.linspace(0.18 * math.pi, 0.94 * math.pi, 8) * sgn
            r_pts = ring_points(cz_r, x_ax, y_ax, angs_r, 0.006, rmin=0.06, rmax=0.22, bvh=core.BVH_T)
            for rp in r_pts:
                rp[2] = z_rb
            parts_t.append(mech_tube(f'{gid_t}_rib_{ir}_{tag}', r_pts, 0.012, 0.010,
                                     jade_p if ir % 2 == 0 else gunmetal_p,
                                     n=8, rows=8, rigid_joint='Spine2', slot_hint='torso', scale_xy=(0.65, 1.25)))

    # Pelvic skeletal chassis core + abdominal pistons
    parts_t.append(mech_tube(gid_t + '_pelvis', [hip_j + up_w * 0.045, hip_j - up_w * 0.085],
                             0.082, 0.052, gunmetal_p, n=12, rows=6, rigid_joint='Hips', slot_hint='torso',
                             scale_xy=(1.22, 0.85)))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_hi = spine_at(core.WAIST + 0.09) + left_w * (sgn * 0.065) - bk_w * 0.026
        p_lo = hip_j + left_w * (sgn * 0.058) - bk_w * 0.022 + up_w * 0.018
        parts_t.extend(piston_assembly(f'{gid_t}_abd_piston_{tag}', p_hi, p_lo, 0.013,
                                       obs_p, jade_p, 'Spine', slot_hint='torso'))

    # Asymmetrical Charcoal-Black Circuit-Lined Capelet/Poncho (draping right shoulder/chest, ending above crotch!)
    # Arc sweeps across the right side (-pi .. 0.35*pi) leaving the left ribcage exposed for the tentacles!
    parts_t.append(torso_tube(gid_t + '_circuit_poncho', core.TOP + 0.005, core.CROTCH + 0.03,
                              ease=0.032, paint=poncho_p, n=32, arc=(-1.05 * math.pi, 0.32 * math.pi),
                              hang_from=core.SHOULDER - 0.04, flare=0.09, stiff=0.18, over_arms=False))
    # High asymmetrical circuit collar framing the right clavicle
    parts_t.append(collar_disc(gid_t + '_poncho_collar', 0.044, poncho_p, drop=0.035, n=28, ease=0.026, z_off=0.012))

    ent_t = assemble_garment(gid_t, 'Spine-Tentacle Cyber-Lich Skeletal Chassis & Circuit Poncho', 'torso', parts_t,
                             open_torso=True)
    hide_t = select_body_tris(
        ('Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder', 'RightShoulder'),
        weight_thresh=0.35, mode='mean'
    )
    apply_custom_hide(ent_t, hide_t, replace=True)
    entries.append(ent_t)

    # --- 3. GLOVES: clich_{s}_cyber_arms (Full Prosthetic Skeletal Gunmetal & Pale-Jade Arms + Claw-Hands) ---
    gid_g = f'clich_{sex}_cyber_arms'
    parts_g = []
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        sh, el, wr = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')
        d_ua = (el - sh) / max(np.linalg.norm(el - sh), 1e-6)
        d_fa = (wr - el) / max(np.linalg.norm(wr - el), 1e-6)
        out_x = left_w * sgn

        # Shoulder cap + humerus strut + angular gunmetal bicep shell
        parts_g.append(mech_sphere(f'{gid_g}_sh_joint_{side}', sh, 0.046, obs_p, side + 'Arm', slot_hint='gloves'))
        parts_g.append(mech_tube(f'{gid_g}_humerus_{side}', [sh, el], 0.024, 0.020, obs_p,
                                 n=10, rows=6, rigid_joint=side + 'Arm', slot_hint='gloves'))
        parts_g.append(mech_tube(f'{gid_g}_bicep_shell_{side}',
                                 [sh + d_ua * 0.03 + out_x * 0.014, el - d_ua * 0.03 + out_x * 0.010],
                                 0.038, 0.030, gunmetal_p, n=10, rows=6, rigid_joint=side + 'Arm', slot_hint='gloves',
                                 scale_xy=(0.90, 1.15)))
        parts_g.extend(piston_assembly(f'{gid_g}_ua_piston_{side}',
                                       sh + d_ua * 0.04 - out_x * 0.016 - bk_w * 0.012,
                                       el - d_ua * 0.02 - out_x * 0.014 - bk_w * 0.010,
                                       0.011, gunmetal_p, jade_p, side + 'Arm', slot_hint='gloves'))

        # Mechanical elbow hinge + pale-jade inner forearm actuator + sleek gunmetal outer vambrace
        parts_g.append(mech_sphere(f'{gid_g}_elbow_{side}', el, 0.032, jade_p, side + 'ForeArm', slot_hint='gloves'))
        parts_g.append(mech_tube(f'{gid_g}_forearm_core_{side}', [el, wr], 0.020, 0.016, jade_p,
                                 n=10, rows=6, rigid_joint=side + 'ForeArm', slot_hint='gloves'))
        parts_g.append(mech_tube(f'{gid_g}_forearm_shell_{side}',
                                 [el + d_fa * 0.02 + out_x * 0.008, wr - d_fa * 0.01 + out_x * 0.005],
                                 0.035, 0.026, gunmetal_p, n=10, rows=6, rigid_joint=side + 'ForeArm', slot_hint='gloves',
                                 scale_xy=(0.88, 1.18)))

        # Articulated pale-jade & gunmetal skeletal claw-hand
        palm_end = wr + d_fa * 0.082
        parts_g.append(mech_tube(f'{gid_g}_palm_{side}', [wr - d_fa * 0.008, palm_end],
                                 0.034, 0.030, gunmetal_p, n=10, rows=5,
                                 rigid_joint=side + 'Hand', slot_hint='gloves', scale_xy=(1.15, 0.58)))
        side_ax = np.cross(d_fa, bk_w)
        if np.linalg.norm(side_ax) < 1e-4:
            side_ax = up_w
        side_ax = side_ax / max(np.linalg.norm(side_ax), 1e-6)
        for fi, off_f in enumerate((-0.024, -0.008, 0.008, 0.024)):
            f_root = palm_end - d_fa * 0.010 + side_ax * off_f
            f_mid = f_root + d_fa * 0.042 - bk_w * 0.014
            f_tip = f_mid + d_fa * 0.036 - bk_w * 0.022
            parts_g.append(mech_tube(f'{gid_g}_finger_{side}_{fi}', [f_root, f_mid, f_tip],
                                     0.0072, 0.0028, jade_p, n=6, rows=6,
                                     rigid_joint=side + 'Hand', slot_hint='gloves'))
        th_root = wr + d_fa * 0.036 - bk_w * 0.018 + side_ax * (-0.026 * sgn)
        th_tip = th_root + d_fa * 0.048 - bk_w * 0.024 + side_ax * (-0.014 * sgn)
        parts_g.append(mech_tube(f'{gid_g}_thumb_{side}', [th_root, th_tip],
                                 0.0080, 0.0032, jade_p, n=6, rows=5,
                                 rigid_joint=side + 'Hand', slot_hint='gloves'))

    ent_g = assemble_garment(gid_g, 'Spine-Tentacle Cyber-Lich Skeletal Prosthetic Arms', 'gloves', parts_g)
    hide_g = select_body_tris(
        ('LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand'),
        weight_thresh=0.32, mode='mean'
    )
    apply_custom_hide(ent_g, hide_g, replace=True)
    entries.append(ent_g)

    # --- 4. LEGS: clich_{s}_cyber_legs (Full Prosthetic Skeletal Gunmetal & Jade Legs) ---
    gid_l = f'clich_{sex}_cyber_legs'
    parts_l = []
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        hip_j, kn_j, ft_j = J(side + 'UpLeg'), J(side + 'Leg'), J(side + 'Foot')
        out_x = left_w * sgn
        d_th = (kn_j - hip_j) / max(np.linalg.norm(kn_j - hip_j), 1e-6)
        d_sh = (ft_j - kn_j) / max(np.linalg.norm(ft_j - kn_j), 1e-6)

        # Femur strut + hydraulic thigh piston + sleek angular gunmetal thigh carapace
        parts_l.append(mech_tube(f'{gid_l}_femur_{side}', [hip_j, kn_j], 0.024, 0.020, obs_p,
                                 n=10, rows=7, rigid_joint=side + 'UpLeg', slot_hint='legs'))
        parts_l.extend(piston_assembly(f'{gid_l}_th_piston_{side}',
                                       hip_j + d_th * 0.08 + bk_w * 0.030,
                                       kn_j - d_th * 0.04 + bk_w * 0.026,
                                       0.014, gunmetal_p, jade_p, side + 'UpLeg', slot_hint='legs'))
        th_pts = [hip_j + (kn_j - hip_j) * f + out_x * 0.012 - bk_w * 0.012 for f in np.linspace(-0.08, 0.92, 8)]
        th_rx = [0.044, 0.072, 0.078, 0.074, 0.064, 0.054, 0.042, 0.030]
        th_ry = [0.048, 0.076, 0.082, 0.078, 0.068, 0.058, 0.046, 0.034]
        a_lo = 0.25 * math.pi if sgn > 0 else -1.35 * math.pi
        a_hi = 1.35 * math.pi if sgn > 0 else -0.25 * math.pi
        parts_l.append(arched_shell(f'{gid_l}_thigh_plate_{side}', th_pts, th_rx, th_ry,
                                    a_lo, a_hi, 0.013, gunmetal_p, side + 'UpLeg', cols=9, slot_hint='legs'))

        # Exposed mechanical knee joint with pale-jade core
        parts_l.append(mech_tube(f'{gid_l}_knee_drum_{side}', [kn_j - out_x * 0.036, kn_j + out_x * 0.036],
                                 0.034, 0.034, obs_p, n=12, rows=4, rigid_joint=side + 'Leg', slot_hint='legs', ref_dir=bk_w))
        parts_l.append(mech_sphere(f'{gid_l}_knee_core_{side}', kn_j - bk_w * 0.032, 0.022, jadecore_p,
                                   side + 'Leg', slot_hint='legs', n=10, rows=6))

        # Tibia strut + rear Achilles rod + sleek tapered gunmetal shin blade
        parts_l.append(mech_tube(f'{gid_l}_tibia_{side}', [kn_j, ft_j], 0.020, 0.016, obs_p,
                                 n=10, rows=7, rigid_joint=side + 'Leg', slot_hint='legs'))
        parts_l.extend(piston_assembly(f'{gid_l}_achilles_{side}',
                                       kn_j + d_sh * 0.08 + bk_w * 0.044,
                                       ft_j - d_sh * 0.04 + bk_w * 0.036,
                                       0.011, obs_p, jade_p, side + 'Leg', slot_hint='legs'))
        sh_pts = [kn_j + (ft_j - kn_j) * f + out_x * 0.008 - bk_w * 0.014 for f in np.linspace(0.05, 0.92, 7)]
        sh_rx = [0.034, 0.050, 0.054, 0.046, 0.038, 0.030, 0.024]
        sh_ry = [0.038, 0.054, 0.058, 0.050, 0.042, 0.034, 0.028]
        parts_l.append(arched_shell(f'{gid_l}_shin_plate_{side}', sh_pts, sh_rx, sh_ry,
                                    a_lo, a_hi, 0.011, gunmetal_p, side + 'Leg', cols=8, slot_hint='legs'))

    ent_l = assemble_garment(gid_l, 'Spine-Tentacle Cyber-Lich Skeletal Prosthetic Legs', 'legs', parts_l, legged=True)
    hide_l = select_body_tris(('LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg', 'Hips'),
                              weight_thresh=0.32, mode='mean')
    apply_custom_hide(ent_l, hide_l, replace=True)
    entries.append(ent_l)

    # --- 5. FEET: clich_{s}_cyber_feet (Full Prosthetic Skeletal Cyber-Feet) ---
    gid_f = f'clich_{sex}_cyber_feet'
    parts_f = []
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        ft_j, toe_j, tip_j, kn_j = J(side + 'Foot'), J(side + 'ToeBase'), J(side + 'ToeBase', 'tail'), J(side + 'Leg')
        ank_hi = ft_j + (kn_j - ft_j) * 0.18
        parts_f.append(mech_tube(f'{gid_f}_ankle_{side}', [ank_hi, ft_j - up_w * 0.020],
                                 0.026, 0.030, gunmetal_p, n=10, rows=5, rigid_joint=side + 'Foot', slot_hint='feet'))
        tars_a = np.array([ft_j[0], ft_j[1] + 0.034, max(0.052, ft_j[2] - 0.008)])
        tars_b = np.array([toe_j[0], toe_j[1] + 0.016, 0.032])
        parts_f.append(mech_tube(f'{gid_f}_tarsal_{side}', [tars_a, tars_b],
                                 0.038, 0.042, jade_p, n=10, rows=5, rigid_joint=side + 'Foot', slot_hint='feet',
                                 scale_xy=(1.12, 0.68)))
        heel_a = np.array([ft_j[0], ft_j[1] + 0.020, 0.038])
        heel_b = np.array([ft_j[0], ft_j[1] + 0.072, 0.014])
        parts_f.append(mech_tube(f'{gid_f}_heel_{side}', [heel_a, heel_b],
                                 0.024, 0.016, gunmetal_p, n=8, rows=5, rigid_joint=side + 'Foot', slot_hint='feet',
                                 scale_xy=(1.10, 0.68)))
        # 4 splayed mechanical skeletal toes
        for kt, dx_t in enumerate((-0.030, -0.010, 0.010, 0.030)):
            tr = np.array([toe_j[0] + dx_t * 0.72, toe_j[1] + 0.020, 0.030])
            tm = np.array([toe_j[0] + dx_t * 0.96, toe_j[1] - 0.024, 0.024])
            tt = np.array([tip_j[0] + dx_t * 1.08, tip_j[1] - 0.042, 0.012])
            parts_f.append(mech_tube(f'{gid_f}_toe_{side}_{kt}', [tr, tm, tt],
                                     0.011, 0.005, gunmetal_p if kt % 2 == 0 else jade_p,
                                     n=6, rows=6, rigid_joint=side + 'ToeBase', slot_hint='feet'))

    ent_f = assemble_garment(gid_f, 'Spine-Tentacle Cyber-Lich Skeletal Cyber-Feet', 'feet', parts_f)
    hide_f = select_body_tris(('LeftFoot', 'LeftToe', 'RightFoot', 'RightToe'), weight_thresh=0.25, mode='any')
    y_ank_gl = float(core.RIG.jpos[core.RIG.J['LeftFoot']][1]) + 0.055
    ank_tris = np.nonzero((core.BP_GL[core.BT, 1] < y_ank_gl).all(axis=1))[0]
    apply_custom_hide(ent_f, np.unique(np.concatenate([hide_f, ank_tris])), replace=True)
    ent_f['hide_parts'] = ['Human.toenails']
    entries.append(ent_f)

    # --- 6A. BACK (Default): clich_{s}_spine_tentacles ---
    entries.append(_build_spine_tentacle_pack(
        f'clich_{sex}_spine_tentacles',
        'Spine-Tentacle Cyber-Lich Dorsal Spine-Rack & 6 Cyber-Tentacles',
        extended=False, gunmetal_p=gunmetal_p, obs_p=obs_p, jade_p=jade_p, jadecore_p=jadecore_p,
    ))

    # --- 6B. BACK (Extended/Deployed): clich_{s}_spine_tentacles_extended ---
    entries.append(_build_spine_tentacle_pack(
        f'clich_{sex}_spine_tentacles_extended',
        'Spine-Tentacle Cyber-Lich Dorsal Spine-Rack & 6 Extended Cyber-Tentacles',
        extended=True, gunmetal_p=gunmetal_p, obs_p=obs_p, jade_p=jade_p, jadecore_p=jadecore_p,
    ))

    return entries


# ===============================================================================================================
# Public Kit & Peoples Entry Builders (matching `dasri.py` / `kimr.py` interface)
# ===============================================================================================================
CYBER_LICHES_TIER_SHARES = [
    ['voltaic_lich', 0.25],
    ['reliquary_lich', 0.25],
    ['alchemical_lich', 0.25],
    ['tentacle_lich', 0.15],
    ['tentacle_lich_deployed', 0.10],
]

CYBER_LICHES_TIER_LABELS = {
    'voltaic_lich': 'Voltaic Arc-Lich (Tesla Capacitor & Violet Robes)',
    'reliquary_lich': 'Pharaonic Reliquary-Lich (Twin-Pillar Headdress & Servo-Claws)',
    'alchemical_lich': 'Alchemical Rebreather-Lich (Tri-Optic Dome & Triangle Tabard)',
    'tentacle_lich': 'Spine-Tentacle Cyber-Lich (Full Skeletal Prosthetics & 6 Tentacles)',
    'tentacle_lich_deployed': 'Spine-Tentacle Cyber-Lich (Extended 6-Tentacle Interface)',
}

CYBER_LICHES_PROSTHETIC_IDS = {
    'mpfb_male': [
        'clich_m_cyber_skull',
        'clich_m_cyber_chassis',
        'clich_m_cyber_arms',
        'clich_m_cyber_legs',
        'clich_m_cyber_feet',
        'clich_m_spine_tentacles',
        'clich_m_spine_tentacles_extended',
        'clich_m_reliquary_servo_arms',
    ],
    'mpfb_female': [
        'clich_f_cyber_skull',
        'clich_f_cyber_chassis',
        'clich_f_cyber_arms',
        'clich_f_cyber_legs',
        'clich_f_cyber_feet',
        'clich_f_spine_tentacles',
        'clich_f_spine_tentacles_extended',
        'clich_f_reliquary_servo_arms',
    ],
}


def _outfits_for_sex(sex):
    return {
        'voltaic_lich': {
            'head':   f'clich_{sex}_voltaic_skull',
            'torso':  f'clich_{sex}_voltaic_robe',
            'back':   f'clich_{sex}_voltaic_capacitor',
            'gloves': f'clich_{sex}_voltaic_gauntlets',
            'legs':   f'clich_{sex}_voltaic_greaves',
            'feet':   f'clich_{sex}_voltaic_boots',
            'beard':  None,
        },
        'reliquary_lich': {
            'head':   f'clich_{sex}_reliquary_headdress',
            'torso':  f'clich_{sex}_reliquary_robe',
            'back':   f'clich_{sex}_reliquary_servo_arms',
            'gloves': f'clich_{sex}_reliquary_gauntlets',
            'legs':   f'clich_{sex}_reliquary_trousers',
            'feet':   f'clich_{sex}_reliquary_boots',
            'beard':  None,
        },
        'alchemical_lich': {
            'head':   f'clich_{sex}_alchemical_rebreather',
            'torso':  f'clich_{sex}_alchemical_coat',
            'back':   f'clich_{sex}_alchemical_manifold',
            'gloves': f'clich_{sex}_alchemical_gauntlets',
            'legs':   f'clich_{sex}_alchemical_trousers',
            'feet':   f'clich_{sex}_alchemical_boots',
            'beard':  None,
        },
        'tentacle_lich': {
            'head':   f'clich_{sex}_cyber_skull',
            'torso':  f'clich_{sex}_cyber_chassis',
            'back':   f'clich_{sex}_spine_tentacles',
            'gloves': f'clich_{sex}_cyber_arms',
            'legs':   f'clich_{sex}_cyber_legs',
            'feet':   f'clich_{sex}_cyber_feet',
            'beard':  None,
        },
        'tentacle_lich_deployed': {
            'head':   f'clich_{sex}_cyber_skull',
            'torso':  f'clich_{sex}_cyber_chassis',
            'back':   f'clich_{sex}_spine_tentacles_extended',
            'gloves': f'clich_{sex}_cyber_arms',
            'legs':   f'clich_{sex}_cyber_legs',
            'feet':   f'clich_{sex}_cyber_feet',
            'beard':  None,
        },
    }


def build_cyber_liches_peoples_entry():
    """Construct complete `peoples.json` roster entry for `cyber_liches`."""
    return {
        'id': 'cyber_liches',
        'name': 'Cyber-Liches',
        'note': (
            'Necro-cybernetic arch-technomancers and skeletal prosthetic liches across 4 archetypes '
            '(Voltaic Arc-Lich, Pharaonic Reliquary-Lich, Alchemical Rebreather-Lich, and Spine-Tentacle '
            'Cyber-Lich with both resting and extended 6-tentacle dorsal spine-racks) at 100% mpfb_male & '
            'mpfb_female parity (tools/garments/cultures/cyber_liches.py).'
        ),
        'ancestry': {
            'african': [0.15, 0.45],
            'asian': [0.15, 0.45],
            'caucasian': [0.25, 0.65],
        },
        'skin': ['#d8d4ce', '#c6c0b8', '#b0aaa2'],
        'hair': ['#16161a', '#26262c', '#4a4e54'],
        'eyes': ['#68e848', '#22d892', '#e82820'],
        'grey': 0.80,
        'beard': 0.0,
        'morph': {
            'weight': [-0.55, -0.20],
            'muscle': [0.15, 0.45],
            'height': [0.15, 0.55],
        },
        'styles': {
            'male': ['short01'],
            'female': ['short03'],
        },
        'tiers': CYBER_LICHES_TIER_SHARES,
        'tier_labels': CYBER_LICHES_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def _run_task(task):
    fn, sex, body_id = task
    with cyber_liches_motif_scope():
        return fn(sex, body_id)


TASKS = [
    (_build_voltaic_lich, 'm', 'mpfb_male'),
    (_build_voltaic_lich, 'f', 'mpfb_female'),
    (_build_reliquary_lich, 'm', 'mpfb_male'),
    (_build_reliquary_lich, 'f', 'mpfb_female'),
    (_build_alchemical_lich, 'm', 'mpfb_male'),
    (_build_alchemical_lich, 'f', 'mpfb_female'),
    (_build_tentacle_lich, 'm', 'mpfb_male'),
    (_build_tentacle_lich, 'f', 'mpfb_female'),
]


def build_cyber_liches_kit(parallel=True):
    """Compile all 50 Cyber-Lich wardrobe & prosthetics pieces across `mpfb_male` and `mpfb_female`."""
    kit_entries = []
    if parallel:
        workers = min(2, len(TASKS), os.cpu_count() or 2)
        with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as ex:
            for res in ex.map(_run_task, TASKS):
                kit_entries.extend(res)
    else:
        for task in TASKS:
            kit_entries.extend(_run_task(task))
    return kit_entries


def _verify_compiled_kit(kit_entries, peoples_entry):
    """Run strict integrity + geometry/floating/cloth regression audit on all compiled pieces."""
    from scipy.sparse import csr_matrix
    from scipy.sparse.csgraph import connected_components
    from scipy.spatial import cKDTree

    assert len(kit_entries) == 50, f'Expected 50 compiled pieces, got {len(kit_entries)}'
    by_body = {'mpfb_male': {}, 'mpfb_female': {}}
    for e in kit_entries:
        b_id = e.get('_body')
        assert b_id in by_body, f"Invalid _body on {e.get('id')}: {b_id}"
        glb_p = ROOT / e['glb']
        morph_p = glb_p.with_suffix('.morph.bin')
        assert glb_p.exists() and glb_p.stat().st_size > 100, f'Missing GLB: {glb_p}'
        assert morph_p.exists() and morph_p.stat().st_size > 16, f'Missing morph.bin: {morph_p}'
        by_body[b_id][e['id']] = e

    # Verify every peoples.json outfit reference resolves
    for sex_k, body_k in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        for tid, odict in peoples_entry['outfits'][sex_k].items():
            for slot_k in ('head', 'torso', 'back', 'gloves', 'legs', 'feet'):
                gid = odict[slot_k]
                assert gid in by_body[body_k], f'Missing {body_k} piece {gid} referenced by {tid}.{slot_k}'

    # Geometry regression audit (Gates 2 & 4 from check_garment_regressions.py)
    faults = []
    for body_k in ('mpfb_male', 'mpfb_female'):
        set_body(body_k)
        y_crotch = float(core.RIG.jpos[core.RIG.J['LeftUpLeg']][1])
        jb, bb = glbio.read_glb((ROOT / 'pieces' / body_k / 'base.glb').read_bytes())
        nd_b = next(n for n in jb['nodes'] if 'mesh' in n)
        pr_b = jb['meshes'][nd_b['mesh']]['primitives'][0]
        BP = glbio.accessor(jb, bb, pr_b['attributes']['POSITION']).astype(np.float64)
        BT = glbio.accessor(jb, bb, pr_b['indices']).reshape(-1, 3)
        va, vb, vc = BP[BT[:, 0]], BP[BT[:, 1]], BP[BT[:, 2]]
        body_tree = cKDTree(np.vstack([BP, (va + vb + vc) / 3.0, 0.5 * (va + vb), 0.5 * (vb + vc), 0.5 * (vc + va)]))

        for gid, it in by_body[body_k].items():
            slot = it['slot']
            j, b = glbio.read_glb((ROOT / it['glb']).read_bytes())
            nd = next(n for n in j['nodes'] if 'mesh' in n)
            pr = j['meshes'][nd['mesh']]['primitives'][0]
            P_v = glbio.accessor(j, b, pr['attributes']['POSITION']).astype(np.float64)
            T_i = glbio.accessor(j, b, pr['indices']).reshape(-1, 3)

            # Gate 4: Rigid hip-skirt guard
            if slot == 'torso':
                min_y = float(P_v[:, 1].min())
                if min_y < y_crotch - 0.065 and 'cloth' not in it:
                    faults.append(f'{body_k} {gid}: rigid torso hangs {(y_crotch - min_y)*100:.1f}cm below crotch without cloth')

            # Gate 2: Disconnected floating component guard on procedural garments (strict <= 18mm!)
            if it.get('made_by') != 'garments':
                continue
            re_i = np.concatenate([T_i[:, 0], T_i[:, 1], T_i[:, 2]])
            ce_i = np.concatenate([T_i[:, 1], T_i[:, 2], T_i[:, 0]])
            adj = csr_matrix((np.ones(len(re_i), dtype=np.int8), (re_i, ce_i)), shape=(len(P_v), len(P_v)))
            n_comp, labels = connected_components(adj, directed=False)
            order = np.argsort(labels, kind='mergesort')
            counts = np.bincount(labels, minlength=n_comp)
            comps = [grp for grp in np.split(order, np.cumsum(counts)[:-1]) if len(grp) > 1]
            if len(comps) >= 2:
                max_c = max(len(c) for c in comps)
                for comp in comps:
                    if len(comp) == max_c:
                        continue
                    cp = P_v[comp]
                    d_body = float(body_tree.query(cp)[0].min())
                    if d_body <= 0.018:
                        continue
                    other_m = np.ones(len(P_v), dtype=bool)
                    other_m[comp] = False
                    other_tm = other_m[T_i[:, 0]]
                    ref_pts = [P_v[other_m]]
                    if other_tm.any():
                        v0, v1, v2 = P_v[T_i[other_tm, 0]], P_v[T_i[other_tm, 1]], P_v[T_i[other_tm, 2]]
                        ref_pts.extend([(v0 + v1 + v2) / 3.0, 0.5 * (v0 + v1), 0.5 * (v1 + v2), 0.5 * (v2 + v0)])
                    d_garm = float(cKDTree(np.vstack(ref_pts)).query(cp)[0].min())
                    d_min = min(d_body, d_garm)
                    if d_min > 0.018:
                        faults.append(f'{body_k} {gid}: disconnected comp ({len(comp)}v) floats {d_min*1000:.1f}mm (>18mm)')

    if faults:
        raise AssertionError('Cyber-Lich geometry audit failed:\n  ' + '\n  '.join(faults))


def main():
    t0 = time.perf_counter()
    kit_entries = build_cyber_liches_kit(parallel=(os.name != 'nt'))
    peoples_entry = build_cyber_liches_peoples_entry()
    _verify_compiled_kit(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'cyber_liches_manifest.json'
    manifest = {
        'culture': 'cyber_liches',
        'total_pieces': len(kit_entries),
        'prosthetic_ids': CYBER_LICHES_PROSTHETIC_IDS,
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    print(f'SUCCESS: Compiled & verified {len(kit_entries)} Cyber-Lich pieces (25 male + 25 female) in {dt:.1f}s.')
    print(f'Wrote manifest -> {manifest_path}')


if __name__ == '__main__':
    main()
