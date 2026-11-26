"""The Extraplanar Entities Kit — Wave 2 (`extraplanar_wave2`).

Compiles 56 procedural extraplanar garments and exotic body-replacement constructs
(28 `mpfb_male` `ext2_m_*` + 28 `mpfb_female` `ext2_f_*`, 100% M+F parity) across
5 brand-new Extraplanar Entity archetypes, paired with custom WebGL/Godot shaders
(`src/75-extraplanar.js` / `kchar_extraplanar.gdshader`):

1. `ophanim_seraph` — Six-Winged Eyed-Wheel Seraph (Legless Celestial Hover):
   - `head`:   `ext2_{s}_seraph_wheel`    (headless triple counter-rotating gilded Ophanim chariot-wheels studded with glowing eye-gems around a white-gold solar core)
   - `torso`:  `ext2_{s}_seraph_vestment` (sculpted ivory-and-gold liturgical breastplate & pleated surcoat over radiant gold Fresnel core w/ blazing chest sigil)
   - `back`:   `ext2_{s}_seraph_wings`    (six sculpted multi-tiered gilded & porcelain feather-blade wings in 3 swept pairs)
   - `gloves`: `ext2_{s}_seraph_hands`    (translucent luminous gold Fresnel forearms & hands w/ porcelain-and-gold articulated cuffs)
   - `legs`:   `ext2_{s}_seraph_trail`    (legless tapering incandescent gold-and-ivory ribbon-shroud w/ alpha-erosion tatters)

2. `prism_matriarch` — Shattered Stained-Glass & Crystalline Automaton (Bipedal Refractive Geometric Entity):
   - `head`:   `ext2_{s}_prism_crown`     (headless faceted octahedral stained-glass crystal head + orbiting crown of 8 rotating prismatic glass shards)
   - `torso`:  `ext2_{s}_prism_corset`    (architectural cathedral-tracery black-lead & stained-glass faceted cuirass w/ glowing crystalline heart-chamber)
   - `back`:   `ext2_{s}_prism_rose`      (large floating slowly rotating Gothic Rose-Window Mandala w/ translucent polychrome stained-glass panes)
   - `gloves`: `ext2_{s}_prism_gauntlets` (faceted crystalline blade-gauntlets w/ lead-filigree knuckle ribs)
   - `legs`:   `ext2_{s}_prism_greaves`   (faceted geometric stained-glass & leaded-silver articulated leg-shards)
   - `feet`:   `ext2_{s}_prism_heels`     (crystalline diamond-faceted sabatons)

3. `clockwork_aeon` — Brass Orrery & Hourglass Time-Warden (Bipedal Chronomantic Construct):
   - `head`:   `ext2_{s}_aeon_astrolabe`  (headless open hollow brass armillary sphere / ticking hourglass head w/ golden temporal-sand core & orbiting meridian rings)
   - `torso`:  `ext2_{s}_aeon_chassis`    (exposed sculpted brass gearwork ribcage & Roman-numeral clockface pectoral over midnight-blue nebula-rift void bodice)
   - `back`:   `ext2_{s}_aeon_orrery`     (dorsal planetary clockwork orrery w/ counter-rotating notched brass gear-wheels & 4 orbiting silver/gold moons)
   - `gloves`: `ext2_{s}_aeon_calipers`   (articulated brass chronometer gauntlets w/ twin sweeping compass-needle forearm blades)
   - `legs`:   `ext2_{s}_aeon_coatlegs`   (midnight-indigo astronomical-chart cloth coat-tails w/ proper chains over brass-trimmed greaves)
   - `feet`:   `ext2_{s}_aeon_boots`      (riveted brass-and-obsidian articulated clockwork boots)

4. `abyssal_medusa` — Bioluminescent Deep-Void Jellyfish / Coral Sovereign (Legless Abyssal-Astral Hover):
   - `head`:   `ext2_{s}_medusa_bell`     (translucent glowing bioluminescent jellyfish dome-bell crown w/ trailing luminous sensory filaments over dark void-mask)
   - `torso`:  `ext2_{s}_medusa_mantle`   (sculpted pale bone-coral & iridescent pearl exoskeleton bodice over abyssal-indigo Fresnel body w/ pulse-nodes)
   - `back`:   `ext2_{s}_medusa_fronds`   (fanning translucent luminescent sea-anemone / nautilus spiral dorsal fronds + bioluminescent spore smoke emitters)
   - `gloves`: `ext2_{s}_medusa_tendrils` (coral-plated forearms tapering into elongated glowing bioluminescent claw-fingers)
   - `legs`:   `ext2_{s}_medusa_tentacles`(legless swaying ring of 8 sculpted bioluminescent jellyfish tentacles w/ alpha-erosion & lower-body hide)

5. `ashen_calamity` — Volcanic Obsidian-Magma & Crown-of-Cinders Demon (Bipedal Infernal-Planar Entity):
   - `head`:   `ext2_{s}_calamity_horns`  (cracked volcanic obsidian-basalt demonic skull split by blazing molten magma fissures + sweeping ram horns + cinder smoke)
   - `torso`:  `ext2_{s}_calamity_carapace`(jagged tectonic obsidian-plate armor floating slightly apart over a glowing molten-lava furnace chest core + cinder smoke)
   - `back`:   `ext2_{s}_calamity_braziers`(twin dorsal floating volcanic basalt monolith-braziers pouring live rising soot-and-ember plumes w/ slow bob)
   - `gloves`: `ext2_{s}_calamity_claws`  (massive cracked-obsidian magma-veined gauntlets w/ glowing white-hot claw tips)
   - `legs`:   `ext2_{s}_calamity_greaves`(cracked basalt-slab greaves w/ glowing magma knee-vents & scorched cinder tassets)
   - `feet`:   `ext2_{s}_calamity_hooves` (heavy cloven volcanic-obsidian demonic hooves w/ molten-crack soles)

Run standalone to compile all `.glb` + `.morph.bin` pieces and emit `extraplanar_wave2_manifest.json`:
    python -u tools/garments/cultures/extraplanar_wave2.py
"""
import base64
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
    Part, J, spine_at, head_frame, chest_front, set_body,
    assemble_garment as _core_assemble,
)
from garments.paint import P, PN, C
from garments.types.torso import torso_tube
from garments.types.limbs import limb_tube, sleeves, trousers, full_gloves
from garments.types.armor import cuirass_plate, sculpted_greaves, sculpted_vambraces
from garments.types.footwear import boots

# ===============================================================================================================
# Scoped Palette Colors (Linear RGB, `ext2_` prefixed)
# ===============================================================================================================
EXT2_COLORS = {
    # Seraph (ivory, gilded brass, solar white-gold, sapphire eye-gems)
    'ext2_ivory':         (0.925, 0.895, 0.825),
    'ext2_porcelain':     (0.955, 0.940, 0.905),
    'ext2_seraph_gold':   (0.880, 0.680, 0.220),
    'ext2_solar_white':   (1.000, 0.975, 0.860),
    'ext2_sapphire_eye':  (0.160, 0.560, 1.000),
    'ext2_amber_core':    (0.320, 0.210, 0.055),
    # Prism Matriarch (black lead, leaded silver, stained-glass polychrome)
    'ext2_lead':          (0.055, 0.058, 0.072),
    'ext2_lead_silver':   (0.560, 0.590, 0.650),
    'ext2_prism_magenta': (0.860, 0.140, 0.680),
    'ext2_prism_cyan':    (0.140, 0.860, 0.960),
    'ext2_prism_amber':   (0.980, 0.640, 0.120),
    'ext2_prism_emerald': (0.120, 0.840, 0.480),
    'ext2_prism_indigo':  (0.140, 0.090, 0.340),
    # Clockwork Aeon (antique brass, bright brass, midnight chart indigo, silver moon)
    'ext2_brass':         (0.760, 0.550, 0.200),
    'ext2_brass_dk':      (0.360, 0.245, 0.095),
    'ext2_brass_hi':      (0.940, 0.780, 0.360),
    'ext2_midnight':      (0.045, 0.065, 0.200),
    'ext2_midnight_dk':   (0.018, 0.025, 0.088),
    'ext2_moon_silver':   (0.840, 0.870, 0.930),
    'ext2_sand_gold':     (1.000, 0.820, 0.320),
    # Abyssal Medusa (deep abyssal indigo, pale bone-coral, pearl, bioluminescent cyan/magenta)
    'ext2_abyss':         (0.025, 0.028, 0.095),
    'ext2_coral_bone':    (0.865, 0.830, 0.785),
    'ext2_pearl':         (0.880, 0.900, 0.935),
    'ext2_bio_cyan':      (0.160, 0.940, 0.980),
    'ext2_bio_magenta':   (0.940, 0.240, 0.820),
    'ext2_bio_violet':    (0.420, 0.160, 0.880),
    # Ashen Calamity (volcanic obsidian, charred basalt, ash, molten magma, white-hot embers)
    'ext2_obsidian':      (0.032, 0.028, 0.030),
    'ext2_basalt':        (0.088, 0.078, 0.075),
    'ext2_cinder_ash':    (0.185, 0.155, 0.145),
    'ext2_magma':         (1.000, 0.360, 0.045),
    'ext2_magma_hot':     (1.000, 0.780, 0.240),
}
for _ek, _ev in EXT2_COLORS.items():
    C.setdefault(_ek, _ev)

FULL_HEAD_HIDE_PARTS = [
    'Human.lips',
    'Human.ears',
    'Human.eyebrow001',
    'Human.eyebrow002',
    'Human.eyelashes01',
    'Human.eyelashes02',
    'Human.low-poly',
]

ALL_BODY_HIDE_PARTS = FULL_HEAD_HIDE_PARTS + [
    'Human.nipple',
    'Human.fingernails',
    'Human.toenails',
]

EXT2_CUSTOM_MOTIFS = {
    'ext2_seraph_liturgy',
    'ext2_seraph_feather',
    'ext2_stained_glass',
    'ext2_clockface',
    'ext2_star_chart',
    'ext2_coral_rib',
    'ext2_volcanic_crack',
}


def _ext2_custom_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'ext2_seraph_liturgy':
        # Ivory pleated liturgical vestments with gilded sunburst filigree and hem trim
        pleat = 0.88 + 0.12 * np.sin(u * 2.0 * math.pi * 14.0)
        img[:] = np.asarray(bg)[None, None, :] * pleat[:, :, None]
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        border = (v < 0.075) | (v > 0.925) | (au < 0.042)
        diamond = np.abs(((u * 8.0) % 1.0 - 0.5)) + np.abs(((v * 6.0) % 1.0 - 0.5))
        filigree = (np.abs(diamond - 0.32) < 0.045) & (v > 0.12) & (v < 0.88)
        img[filigree] = 0.45 * img[filigree] + 0.55 * np.asarray(fg)
        img[border] = fg
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext2_seraph_feather':
        # Sculpted porcelain feather-blade with gilded rachis spine & delicate gold barbules
        barb = 0.86 + 0.14 * np.sin((v * 26.0 - np.abs(u - 0.5) * 18.0) * math.pi)
        img[:] = np.asarray(bg)[None, None, :] * barb[:, :, None]
        spine = np.abs(u - 0.5) < 0.065
        tip_gold = v > 0.84
        edge_gold = (u < 0.07) | (u > 0.93)
        img[spine | tip_gold | edge_gold] = fg
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext2_stained_glass':
        # Cathedral stained-glass diamond & lancet panes separated by crisp black-lead cames
        gx = (u * 8.0)
        gy = (v * 6.0)
        ix = np.floor(gx).astype(np.int32)
        iy = np.floor(gy).astype(np.int32)
        fx = gx - ix
        fy = gy - iy
        # Diagonal diamond lattice + vertical lancet mullions
        d1 = np.abs((fx + fy) - 1.0)
        d2 = np.abs(fx - fy)
        lead = (d1 < 0.095) | (d2 < 0.095) | (fx < 0.06) | (fx > 0.94) | (v < 0.05) | (v > 0.95)
        cell_id = (ix * 3 + iy * 5 + (fx + fy > 1.0).astype(np.int32) + (fx > fy).astype(np.int32)) % 4
        pal = [
            np.asarray(C['ext2_prism_magenta']),
            np.asarray(C['ext2_prism_cyan']),
            np.asarray(C['ext2_prism_amber']),
            np.asarray(C['ext2_prism_emerald']),
        ]
        # Shimmer gradient inside each facet
        facet_sh = 0.72 + 0.38 * np.sin((fx * 3.1 + fy * 2.7) * math.pi)
        for ci in range(4):
            m = (cell_id == ci)
            img[m] = pal[ci] * facet_sh[m, None]
        img[lead] = fg  # black lead cames
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext2_clockface':
        # Engraved antique brass gearwork & concentric horological tick rings
        du = (u - 0.5) * 2.0
        dv = (v - 0.5) * 2.0
        rad = np.hypot(du, dv)
        ang = np.arctan2(dv, du)
        ticks = (np.abs(np.sin(ang * 6.0)) < 0.14) & (rad > 0.56) & (rad < 0.86)
        ring_out = np.abs(rad - 0.88) < 0.045
        ring_in = np.abs(rad - 0.54) < 0.035
        spokes = (np.abs(np.sin(ang * 2.0)) < 0.08) & (rad < 0.54)
        brushed = 0.85 + 0.15 * np.cos(rad * 42.0)
        img[:] = np.asarray(bg)[None, None, :] * brushed[:, :, None]
        img[ticks | ring_out | ring_in | spokes] = fg
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext2_star_chart':
        # Midnight-indigo astronomical chart cloth with gold astrolabe arcs, constellations & hem
        grad = 0.85 + 0.25 * (1.0 - v)
        img[:] = np.asarray(bg)[None, None, :] * grad[:, :, None]
        # Astrolabe meridian circles & latitude arcs
        su = (u * 3.0) % 1.0 - 0.5
        sv = (v * 3.0) % 1.0 - 0.5
        r_c = np.hypot(su, sv)
        arc1 = np.abs(r_c - 0.38) < 0.018
        arc2 = np.abs(r_c - 0.22) < 0.014
        grid_v = (np.abs(su) < 0.012) | (np.abs(sv) < 0.012)
        hem = (v > 0.92) | (v < 0.04) | (u < 0.04) | (u > 0.96)
        stars = (np.sin(u * 47.0 + v * 19.0) * np.cos(u * 23.0 - v * 53.0)) > 0.94
        img[arc1 | arc2 | grid_v] = 0.45 * img[arc1 | arc2 | grid_v] + 0.55 * np.asarray(fg)
        img[hem | stars] = fg
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext2_coral_rib':
        # Sculpted pale bone-coral & iridescent pearl exoskeleton with delicate porous flutes
        flute = 0.86 + 0.14 * np.sin(u * 2.0 * math.pi * 16.0 + 0.6 * np.sin(v * 12.0))
        pore = np.sin(u * 38.0) * np.sin(v * 32.0)
        img[:] = np.asarray(bg)[None, None, :] * flute[:, :, None]
        vein = np.abs(np.sin(u * 2.0 * math.pi * 5.0 + v * 4.5)) < 0.075
        img[vein] = 0.55 * img[vein] + 0.45 * np.asarray(fg)
        img[pore > 0.88] = 0.78 * img[pore > 0.88]
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext2_volcanic_crack':
        # Cracked volcanic obsidian-basalt plates split by blazing molten magma fissures
        n1 = np.sin(u * 14.0 + 1.4 * np.sin(v * 11.0)) * np.cos(v * 13.0 - 1.2 * np.cos(u * 9.0))
        n2 = np.sin(u * 27.0 - v * 21.0 + 1.1 * np.sin(u * 7.0 + v * 8.0))
        rock = 0.72 + 0.28 * np.sin(u * 31.0 + v * 29.0)
        img[:] = np.asarray(bg)[None, None, :] * rock[:, :, None]
        crack_outer = (np.abs(n1) < 0.095) | (np.abs(n2) < 0.045)
        crack_core = (np.abs(n1) < 0.038)
        img[crack_outer] = fg
        img[crack_core] = C['ext2_magma_hot']
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def extraplanar_wave2_motif_scope():
    orig_motif = paint_mod.motif

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        if style in EXT2_CUSTOM_MOTIFS:
            return _ext2_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif


# ===============================================================================================================
# Coordinate Conversion, Body Hides & Extraplanar Geometry Helpers
# ===============================================================================================================
def bl_to_gl_pt(p):
    return [round(float(p[0]), 5), round(float(p[2]), 5), round(float(-p[1]), 5)]


def bl_to_gl_dir(d):
    v = np.asarray(d, dtype=np.float64)
    n = max(float(np.linalg.norm(v)), 1e-9)
    v = v / n
    return [round(float(v[0]), 5), round(float(v[2]), 5), round(float(-v[1]), 5)]


def _get_base_joint_names():
    bj, _ = glbio.read_glb(core.BASE_GLB.read_bytes())
    bskin = bj['skins'][0]
    return [bj['nodes'][k].get('name', '').split(':')[-1] for k in bskin['joints']]


def select_body_tris(joint_prefixes, weight_thresh=0.30, mode='any'):
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
    entry['hide_by'] = 'extraplanar_custom'
    return entry


def hide_full_body(entry):
    entry['hide_parts'] = list(ALL_BODY_HIDE_PARTS)
    return apply_custom_hide(entry, np.arange(len(core.BT), dtype=np.int32), replace=True)


def assemble_garment(gid, label, slot, parts, emitters=None, **kw):
    kw.setdefault('allow_floating', True)
    entry = _core_assemble(gid, label, slot, 'extraplanar', parts, **kw)
    entry['culture'] = 'extraplanar'
    if emitters:
        entry.setdefault('vfx', {})['emitters'] = emitters
    return entry


def tag_vfx(part, vfx_dict, no_conform=True):
    if isinstance(part, (list, tuple)):
        for p in part:
            tag_vfx(p, vfx_dict, no_conform=no_conform)
        return part
    part.vfx = dict(vfx_dict)
    if no_conform:
        part.no_conform = True
    return part


def _part_raw(name, Q, closed, paint, rigid_joint=None, role='accessory', no_conform=True, vfx=None):
    pt = Part(name, np.asarray(Q, dtype=np.float64), closed, ['body'] * len(Q), paint, rigid_joint=rigid_joint, role=role)
    pt.no_conform = bool(no_conform)
    if vfx is not None:
        pt.vfx = dict(vfx)
    return pt


def _mp(bg, fab, motif_name=None, fg=None, rep=None, grain=0.02):
    if motif_name:
        return P(bg, grain, [], [PN(0.0, 1.0, motif_name, fg or bg, bg, rep)], fabric=fab)
    return P(bg, grain, fabric=fab)


def catmull_spline(ctrl_pts, n_samples):
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


def sweep_tube(name, path, radii, paint, n=12, rigid_joint=None, scale_xy=(1.0, 1.0),
               ref_dir=None, cap_ends=True, vfx=None, twist=0.0):
    pts = np.asarray(path, dtype=np.float64)
    rows = len(pts)
    if isinstance(radii, (int, float)):
        r_list = np.full(rows, float(radii))
    elif len(radii) == 2 and rows != 2:
        r_list = np.linspace(float(radii[0]), float(radii[1]), rows)
    else:
        r_list = np.asarray(radii, dtype=np.float64)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    Q = []
    u_prev = None
    for k in range(rows):
        u_t = k / max(rows - 1, 1)
        c = pts[k]
        if k == 0:
            tang = pts[1] - pts[0]
        elif k == rows - 1:
            tang = pts[-1] - pts[-2]
        else:
            tang = pts[k + 1] - pts[k - 1]
        tn = float(np.linalg.norm(tang))
        tang = tang / tn if tn > 1e-8 else np.array([0.0, 0.0, 1.0])
        if ref_dir is not None:
            rv = np.asarray(ref_dir, dtype=np.float64)
            u_ax = rv - tang * np.dot(rv, tang)
            if np.linalg.norm(u_ax) < 1e-6:
                rv2 = np.array([1.0, 0.0, 0.0]) if abs(tang[0]) < 0.85 else np.array([0.0, 1.0, 0.0])
                u_ax = rv2 - tang * np.dot(rv2, tang)
        elif u_prev is not None:
            u_ax = u_prev - tang * np.dot(u_prev, tang)
            if np.linalg.norm(u_ax) < 1e-6:
                u_ax = np.array([1.0, 0.0, 0.0])
        else:
            rv = np.array([0.0, 1.0, 0.0]) if abs(tang[1]) < 0.86 else np.array([1.0, 0.0, 0.0])
            u_ax = rv - tang * np.dot(rv, tang)
        u_ax = u_ax / max(float(np.linalg.norm(u_ax)), 1e-8)
        u_prev = u_ax
        v_ax = np.cross(tang, u_ax)
        v_ax = v_ax / max(float(np.linalg.norm(v_ax)), 1e-8)
        if abs(twist) > 1e-5:
            tw = twist * u_t
            ct, st = math.cos(tw), math.sin(tw)
            u_ax, v_ax = u_ax * ct + v_ax * st, -u_ax * st + v_ax * ct
        cap = 0.14 if (cap_ends and k in (0, rows - 1) and rows >= 4) else 1.0
        rx = float(r_list[k]) * scale_xy[0] * cap
        ry = float(r_list[k]) * scale_xy[1] * cap
        Q.append([c + u_ax * (math.cos(a) * rx) + v_ax * (math.sin(a) * ry) for a in angs])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


def ellipsoid_part(name, center, radii_xyz, paint, rigid_joint, axes=None, n=14, rows=9, vfx=None):
    c = np.asarray(center, dtype=np.float64)
    rx, ry, rz = radii_xyz
    ax_x, ax_y, ax_z = axes if axes is not None else (
        np.array([1.0, 0.0, 0.0]), np.array([0.0, 1.0, 0.0]), np.array([0.0, 0.0, 1.0])
    )
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    phis = np.linspace(-0.48 * math.pi, 0.48 * math.pi, rows)
    Q = []
    for ph in phis:
        cp, sp = math.cos(ph), math.sin(ph)
        Q.append([
            c + ax_x * (math.cos(a) * cp * rx) + ax_y * (math.sin(a) * cp * ry) + ax_z * (sp * rz)
            for a in angs
        ])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


def crystal_prism(name, center, axis_up, height, radius, paint, rigid_joint, sides=6,
                  scale_xy=(1.0, 1.0), vfx=None):
    c = np.asarray(center, dtype=np.float64)
    u_z = np.asarray(axis_up, dtype=np.float64)
    u_z = u_z / max(float(np.linalg.norm(u_z)), 1e-8)
    u_x, u_y = core.frame(u_z)
    angs = np.linspace(0.0, 2.0 * math.pi, sides, endpoint=False)
    stations = [
        (-0.50 * height, 0.04 * radius),
        (-0.22 * height, 0.88 * radius),
        ( 0.18 * height, 1.00 * radius),
        ( 0.50 * height, 0.04 * radius),
    ]
    Q = []
    for hz, rr in stations:
        sc = c + u_z * hz
        Q.append([
            sc + u_x * (math.cos(a) * rr * scale_xy[0]) + u_y * (math.sin(a) * rr * scale_xy[1])
            for a in angs
        ])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


def torus_ring(name, center, normal_dir, major_r, minor_rx, minor_ry, paint, rigid_joint,
               arc=(0.0, 2.0 * math.pi), n_major=36, n_minor=10, closed_loop=True, vfx=None):
    c = np.asarray(center, dtype=np.float64)
    n_ax = np.asarray(normal_dir, dtype=np.float64)
    n_ax = n_ax / max(float(np.linalg.norm(n_ax)), 1e-8)
    u_ax, v_ax = core.frame(n_ax)
    thetas = np.linspace(arc[0], arc[1], n_major, endpoint=not closed_loop)
    if closed_loop:
        thetas = np.append(thetas, thetas[0])
    phis = np.linspace(0.0, 2.0 * math.pi, n_minor, endpoint=False)
    Q = []
    for idx_t, th in enumerate(thetas):
        r_dir = u_ax * math.cos(th) + v_ax * math.sin(th)
        ring_c = c + r_dir * major_r
        taper = 1.0
        if not closed_loop:
            u_arc = idx_t / max(len(thetas) - 1, 1)
            taper = max(0.12, math.sin(math.pi * u_arc) ** 0.65)
        Q.append([
            ring_c + r_dir * (math.cos(ph) * minor_rx * taper) + n_ax * (math.sin(ph) * minor_ry * taper)
            for ph in phis
        ])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


# ===============================================================================================================
# 1. OPHANIM SERAPH — Six-Winged Eyed-Wheel Seraph (Legless Celestial Hover)
# ===============================================================================================================
def _build_ophanim_seraph(sex):
    entries = []
    gold_p      = _mp('ext2_seraph_gold', 'metal.gold')
    brass_p     = _mp('ext2_brass_hi', 'metal.brass.braid')
    ivory_p     = _mp('ext2_ivory', 'cloth.silk.golden_cable', 'ext2_seraph_liturgy', 'ext2_seraph_gold')
    porcelain_p = _mp('ext2_porcelain', 'ceramic.mask.porcelain', 'ext2_seraph_feather', 'ext2_seraph_gold', grain=0.01)
    solar_p     = _mp('ext2_solar_white', 'metal.gold', grain=0.0)
    eye_p       = _mp('ext2_sapphire_eye', 'beads.glass', grain=0.0)
    core_p      = _mp('ext2_amber_core', 'cloth.silk', grain=0.01)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    # --- 1A. HEAD: ext2_{s}_seraph_wheel (Triple Counter-Rotating Eyed Ophanim Wheels + Solar Core) ---
    gid_h = f'ext2_{sex}_seraph_wheel'
    parts_h = []

    nk = J('Neck')
    collar_z = nk[2] + 0.004
    parts_h.append(torus_ring(
        gid_h + '_neck_seal', np.array([0.0, 0.005, collar_z]), up_w,
        0.082, 0.020, 0.014, gold_p, rigid_joint='Neck', n_major=28, n_minor=8
    ))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        fl_pts = catmull_spline([
            np.array([sgn * 0.080, -0.025, collar_z - 0.006]),
            np.array([sgn * 0.115, -0.012, collar_z + 0.036]),
            np.array([sgn * 0.130,  0.018, collar_z + 0.062]),
        ], 8)
        parts_h.append(sweep_tube(
            f'{gid_h}_collar_wing_{tag}', fl_pts, [0.020, 0.014], ivory_p,
            n=8, rigid_joint='Neck', scale_xy=(0.45, 1.35), ref_dir=left_w
        ))

    wheel_c = np.array([0.0, float(a_hd[1]) - 0.006, float(a_hd[2]) + 0.108])
    wheel_gl = bl_to_gl_pt(wheel_c)

    # Blazing white-gold solar core
    kin_core = {'bone': 'Head', 'motion': 'bob', 'speed': 1.80, 'amp': 0.014, 'phase': 0.0, 'center_gl': wheel_gl}
    parts_h.append(ellipsoid_part(
        gid_h + '_solar_core', wheel_c, (0.048, 0.048, 0.048), solar_p, 'Head',
        n=18, rows=12,
        vfx={'kind': 'emissive_blaze', 'color': '#fff8dc', 'gain': 2.40, 'pulse': 0.18, 'kinetic': kin_core}
    ))

    # 3 Nested Counter-Rotating Gilded Ophanim Chariot-Wheels studded with glowing sapphire & gold eye-gems
    wheel_specs = [
        ('outer', 0.172, 0.016, 0.010, np.array([ 0.18, -0.94, 0.28]),  0.85, 0.08, 0.0, 8, '#6cf4ff'),
        ('mid',   0.132, 0.014, 0.009, np.array([ 0.86, -0.32, 0.39]), -1.25, 0.10, 1.1, 6, '#ffe888'),
        ('inner', 0.094, 0.012, 0.008, np.array([-0.68, -0.44, 0.58]),  1.75, 0.06, 2.3, 4, '#7cf8ff'),
    ]
    for wname, maj_r, rx_m, ry_m, n_vec, spd, prec, ph, n_eyes, eye_hex in wheel_specs:
        n_ax = n_vec / np.linalg.norm(n_vec)
        u_ax, v_ax = core.frame(n_ax)
        kin_w = {
            'bone': 'Head', 'motion': 'orbit', 'speed': spd, 'amp': 0.012,
            'precess': prec, 'phase': ph,
            'center_gl': wheel_gl, 'axis_gl': bl_to_gl_dir(n_ax),
        }
        parts_h.append(torus_ring(
            f'{gid_h}_ring_{wname}', wheel_c, n_ax, maj_r, rx_m, ry_m,
            gold_p if wname != 'mid' else brass_p, rigid_joint='Head',
            n_major=36, n_minor=8, vfx={'kind': 'standard', 'kinetic': kin_w}
        ))
        # Stud glowing eye-gems symmetrically around the rim (locked to exact same kinetic pivot!)
        for ei in range(n_eyes):
            ang_e = (ei / float(n_eyes)) * 2.0 * math.pi
            r_dir = u_ax * math.cos(ang_e) + v_ax * math.sin(ang_e)
            ec = wheel_c + r_dir * (maj_r + rx_m * 0.45)
            # Almond eye-gem oriented tangentially along the chariot wheel
            t_dir = -u_ax * math.sin(ang_e) + v_ax * math.cos(ang_e)
            parts_h.append(ellipsoid_part(
                f'{gid_h}_eye_{wname}_{ei}', ec, (0.015, 0.009, 0.010), eye_p, 'Head',
                axes=(t_dir, r_dir, n_ax), n=10, rows=6,
                vfx={'kind': 'emissive_blaze', 'color': eye_hex, 'gain': 2.35, 'pulse': 0.22, 'kinetic': kin_w}
            ))

    ent_h = assemble_garment(gid_h, 'Ophanim Seraph Triple Eyed-Wheel & Solar Core', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 1B. TORSO: ext2_{s}_seraph_vestment (Ivory-Gold Liturgical Breastplate & Radiant Fresnel Core) ---
    gid_t = f'ext2_{sex}_seraph_vestment'
    parts_t = []
    seraph_fresnel = {
        'kind': 'fresnel_ghost',
        'core_color': '#2b1d08',
        'rim_color': '#ffe888',
        'accent_color': '#ffffff',
        'opacity': 0.86,
        'power': 2.0,
        'rim_gain': 1.95,
        'depth_write': True,
    }
    # Translucent radiant gold inner core stopping cleanly at waist
    inner_core = torso_tube(
        gid_t + '_radiant_core', core.TOP + 0.008, core.WAIST - 0.005, ease=0.008,
        paint=core_p, n=34, rows=12
    )
    tag_vfx(inner_core, seraph_fresnel, no_conform=True)
    parts_t.append(inner_core)

    upper_slv = sleeves(gid_t, 'elbow', 0.014, ivory_p, ease_end=0.026, rows=8, n=18)
    for sp in upper_slv:
        sp.no_conform = True
    parts_t.extend(upper_slv)

    # Sculpted ivory-and-gold liturgical breastplate cropped cleanly at waist (ZERO overlap with legs!)
    cuir_parts = cuirass_plate(
        gid_t + '_breastplate', ivory_p, trim_paint=gold_p, style='gothic',
        z_top=core.TOP - 0.015, z_bot=core.WAIST + 0.012, ease=0.022, keel=0.018, faulds=1
    )
    for cp in cuir_parts:
        cp.no_conform = True
    parts_t.extend(cuir_parts)

    # Gilded shoulder liturgical epaulette-scrolls
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        sh = J(side + 'Arm')
        ep_pts = [
            np.array([sgn * 0.085, -0.025, core.TOP + 0.010]),
            sh + np.array([sgn * 0.035, -0.010, 0.048]),
            sh + np.array([sgn * 0.075,  0.012, 0.020]),
        ]
        parts_t.append(sweep_tube(
            f'{gid_t}_epaulette_{tag}', ep_pts, [0.022, 0.030, 0.012], gold_p,
            n=10, rigid_joint='Spine2', scale_xy=(0.42, 1.35), ref_dir=up_w
        ))

    # Glowing gold emissive_blaze solar sunburst sigil on sternum
    sig_c = chest_front(core.CHEST + 0.015, 0.042, x=0.0)
    sig_vfx = {'kind': 'emissive_blaze', 'color': '#ffea94', 'gain': 2.25, 'pulse': 0.18}
    parts_t.append(crystal_prism(
        gid_t + '_sigil_hub', sig_c, fwd, 0.024, 0.026, solar_p, 'Spine2', sides=6, vfx=sig_vfx
    ))
    for k_r in range(6):
        ang_r = k_r * (math.pi / 3.0)
        r_d = up_w * math.cos(ang_r) + left_w * math.sin(ang_r)
        parts_t.append(sweep_tube(
            f'{gid_t}_sigil_ray_{k_r}', [sig_c + r_d * 0.018, sig_c + r_d * 0.068],
            [0.008, 0.0015], solar_p, n=6, rigid_joint='Spine2', cap_ends=False, vfx=sig_vfx
        ))

    ent_t = assemble_garment(gid_t, 'Ophanim Seraph Liturgical Vestment & Radiant Core', 'torso', parts_t)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 1C. BACK: ext2_{s}_seraph_wings (Six Sculpted Multi-Tiered Gilded & Porcelain Feather-Blade Wings) ---
    gid_b = f'ext2_{sex}_seraph_wings'
    parts_b = []

    hub_c = np.array([0.0, 0.125, core.SHOULDER - 0.04])
    parts_b.append(ellipsoid_part(
        gid_b + '_dorsal_hub', hub_c, (0.068, 0.032, 0.085), gold_p, 'Spine2', n=14, rows=10
    ))

    # 3 Pairs of Swept Seraphic Wings (Upper Halo, Mid Span, Lower Veil)
    wing_tiers = [
        # (name, z_off, span_x, rise_z, back_y, n_feathers, f_len_base)
        ('upper',  0.045, 0.42,  0.46, 0.22, 6, 0.25),
        ('mid',    0.000, 0.58,  0.10, 0.24, 6, 0.23),
        ('lower', -0.055, 0.36, -0.44, 0.20, 5, 0.22),
    ]
    tip_vfx = {'kind': 'emissive_blaze', 'color': '#fff0a8', 'gain': 1.95, 'pulse': 0.15}
    for sgn, tag in ((1.0, 'L'), (-1.0, 'R')):
        for tname, z_off, sp_x, r_z, bk_y, n_f, f_len in wing_tiers:
            root_p = hub_c + np.array([sgn * 0.045, 0.015, z_off])
            mid_p  = root_p + np.array([sgn * sp_x * 0.52, bk_y * 0.58, r_z * 0.62])
            tip_p  = root_p + np.array([sgn * sp_x, bk_y, r_z])
            spine_pts = catmull_spline([root_p, mid_p, tip_p], 10)
            parts_b.append(sweep_tube(
                f'{gid_b}_rachis_{tname}_{tag}', spine_pts, np.linspace(0.018, 0.005, 10),
                gold_p, n=8, rigid_joint='Spine2', cap_ends=False
            ))
            # Fan of sculpted porcelain-and-gold feather-blades sweeping from the gilded rachis
            for fi in range(n_f):
                u_f = (fi + 0.6) / (n_f + 0.4)
                idx_s = min(9, max(1, int(round(u_f * 8))))
                f_base = spine_pts[idx_s]
                fl_k = f_len * (0.68 + 0.52 * math.sin(math.pi * u_f))
                # Feather direction sweeps outward & downward-back relative to tier
                if tname == 'upper':
                    f_dir = np.array([sgn * (0.48 + 0.35 * u_f), 0.32, 0.65 - 0.35 * u_f])
                elif tname == 'mid':
                    f_dir = np.array([sgn * 0.72, 0.36, -0.42 - 0.15 * u_f])
                else:
                    f_dir = np.array([sgn * (0.36 + 0.22 * u_f), 0.30, -0.82])
                f_dir = f_dir / np.linalg.norm(f_dir)
                f_pts = [
                    f_base,
                    f_base + f_dir * (0.55 * fl_k) + np.array([0.0, 0.018, 0.0]),
                    f_base + f_dir * fl_k,
                ]
                is_outer_tip = (fi == n_f - 1)
                parts_b.append(sweep_tube(
                    f'{gid_b}_feather_{tname}_{tag}_{fi}', f_pts, [0.016, 0.024, 0.003],
                    solar_p if is_outer_tip else porcelain_p, n=7, rigid_joint='Spine2',
                    scale_xy=(0.24, 1.38), ref_dir=fwd, cap_ends=False,
                    vfx=tip_vfx if is_outer_tip else None
                ))

    entries.append(assemble_garment(gid_b, 'Ophanim Seraph Six-Winged Gilded Feather Halo', 'back', parts_b))

    # --- 1D. GLOVES: ext2_{s}_seraph_hands (Luminous Gold Fresnel Forearms & Porcelain-Gold Cuffs) ---
    gid_g = f'ext2_{sex}_seraph_hands'
    parts_g = []
    hand_vfx = {
        'kind': 'fresnel_ghost',
        'core_color': '#3a280a',
        'rim_color': '#ffea94',
        'accent_color': '#ffffff',
        'opacity': 0.72,
        'power': 1.85,
        'rim_gain': 2.15,
        'depth_write': False,
    }
    glv = full_gloves(gid_g, core_p, core_p, core_p, f0=0.18, ease=0.008)
    tag_vfx(glv, hand_vfx, no_conform=True)
    parts_g.extend(glv)

    for side in ('Left', 'Right'):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        parts_g.append(sweep_tube(
            f'{gid_g}_cuff_{side}', [el + d_fa * 0.16, el + d_fa * 0.68], [0.052, 0.040],
            porcelain_p, n=14, rigid_joint=side + 'ForeArm'
        ))
        parts_g.append(torus_ring(
            f'{gid_g}_wrist_ring_{side}', el + d_fa * 0.72, d_fa,
            0.042, 0.007, 0.007, gold_p, rigid_joint=side + 'ForeArm', n_major=18, n_minor=6
        ))

    ent_g = assemble_garment(gid_g, 'Ophanim Seraph Luminous Astral Hands & Liturgical Cuffs', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 1E. LEGS: ext2_{s}_seraph_trail (Legless Tapering Incandescent Gold-Ivory Ribbon Shroud) ---
    gid_l = f'ext2_{sex}_seraph_trail'
    parts_l = []
    rows_s = 20
    zs_s = np.linspace(core.WAIST + 0.008, 0.06, rows_s)
    angs_s = np.linspace(0.0, 2.0 * math.pi, 30, endpoint=False)
    Q_shroud = []
    for k_s, zv in enumerate(zs_s):
        u_s = k_s / max(rows_s - 1, 1)
        # Graceful celestial hover taper with subtle rearward drift
        cx = 0.025 * math.sin(u_s * math.pi * 1.4) * u_s
        cy = 0.075 * (u_s ** 1.35)
        rad_s = (1.0 - u_s) ** 0.92 * 0.158 + 0.022
        Q_shroud.append([
            [
                cx + math.sin(a) * rad_s * (1.0 + 0.10 * math.cos(8.0 * a + u_s * 3.0)),
                cy + math.cos(a) * rad_s * (1.0 + 0.10 * math.cos(8.0 * a + u_s * 3.0)),
                zv,
            ]
            for a in angs_s
        ])
    shroud_vfx = {
        'kind': 'alpha_erosion',
        'no_push': True,
        'y_top': 0.88,
        'y_bot': 0.06,
        'edge_color': '#ffe278',
        'smoke_color': '#f5e8cc',
        'swirl': 1.25,
    }
    parts_l.append(_part_raw(
        gid_l + '_ribbon_shroud', Q_shroud, True, ivory_p, rigid_joint='Hips', vfx=shroud_vfx
    ))

    # 4 outer spiraling gilded ribbon streamers floating cleanly outside the shroud
    for ri in range(4):
        a0 = ri * (math.pi / 2.0) + 0.35
        r_pts = []
        for k_r in range(14):
            u_r = k_r / 13.0
            zv = (core.WAIST + 0.005) * (1.0 - u_r) + 0.08 * u_r
            ang_k = a0 + u_r * 1.45
            rad_k = (1.0 - u_r) ** 0.85 * 0.185 + 0.055
            cy_k = 0.075 * (u_r ** 1.35)
            r_pts.append(np.array([math.sin(ang_k) * rad_k, cy_k + math.cos(ang_k) * rad_k, zv]))
        parts_l.append(sweep_tube(
            f'{gid_l}_streamer_{ri}', r_pts, np.linspace(0.020, 0.004, 14),
            gold_p, n=6, rigid_joint='Hips', scale_xy=(0.25, 1.40), cap_ends=False, vfx=shroud_vfx
        ))

    ent_l = assemble_garment(gid_l, 'Ophanim Seraph Incandescent Ribbon-Shroud Trail', 'legs', parts_l)
    hide_full_body(ent_l)
    entries.append(ent_l)
    return entries


# ===============================================================================================================
# 2. PRISM MATRIARCH — Shattered Stained-Glass & Crystalline Automaton (Bipedal Refractive Geometric Entity)
# ===============================================================================================================
def _build_prism_matriarch(sex):
    entries = []
    lead_p     = _mp('ext2_lead', 'metal.iron')
    silver_p   = _mp('ext2_lead_silver', 'metal.paktong.brushed')
    glass_p    = _mp('ext2_prism_indigo', 'glass.moonglass.leaded', 'ext2_stained_glass', 'ext2_lead')
    mag_p      = _mp('ext2_prism_magenta', 'glass.moonglass.leaded', grain=0.01)
    cyan_p     = _mp('ext2_prism_cyan', 'glass.moonglass.leaded', grain=0.01)
    amber_p    = _mp('ext2_prism_amber', 'glass.moonglass.leaded', grain=0.01)
    em_p       = _mp('ext2_prism_emerald', 'glass.moonglass.leaded', grain=0.01)
    indigo_p   = _mp('ext2_prism_indigo', 'cloth.silk')

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    prism_paints = [mag_p, cyan_p, amber_p, em_p]
    prism_hexes = [
        ('#ff48c8', '#4ef4ff'),
        ('#3ef2ff', '#ff64e2'),
        ('#ffb838', '#4cf4ff'),
        ('#32f096', '#ffb838'),
    ]

    # --- 2A. HEAD: ext2_{s}_prism_crown (Octahedral Stained-Glass Head + Orbiting 8-Shard Prismatic Crown) ---
    gid_h = f'ext2_{sex}_prism_crown'
    parts_h = []

    nk = J('Neck')
    parts_h.append(torus_ring(
        gid_h + '_lead_collar', np.array([0.0, 0.005, nk[2] + 0.002]), up_w,
        0.076, 0.016, 0.012, lead_p, rigid_joint='Neck', n_major=24, n_minor=6
    ))

    hc = np.array([0.0, float(a_hd[1]) - 0.005, float(a_hd[2]) + 0.098])
    hc_gl = bl_to_gl_pt(hc)
    kin_head = {'bone': 'Head', 'motion': 'bob', 'speed': 1.55, 'amp': 0.013, 'phase': 0.0, 'center_gl': hc_gl}

    # Faceted floating octahedral stained-glass crystal head
    parts_h.append(crystal_prism(
        gid_h + '_octa_head', hc, up_h, 0.235, 0.095, glass_p, 'Head', sides=4,
        vfx={
            'kind': 'fresnel_ghost', 'core_color': '#180a2e', 'rim_color': '#ff4ed8', 'accent_color': '#4af4ff',
            'opacity': 0.80, 'power': 1.8, 'rim_gain': 2.10, 'prism': 1.0, 'depth_write': True, 'kinetic': kin_head,
        }
    ))
    # Blazing inner prismatic heart-crystal inside the octahedron
    parts_h.append(crystal_prism(
        gid_h + '_head_core', hc, up_h, 0.110, 0.042, cyan_p, 'Head', sides=4,
        vfx={'kind': 'emissive_blaze', 'color': '#b4fcff', 'gain': 2.35, 'pulse': 0.20, 'kinetic': kin_head}
    ))
    # Leaded-silver equatorial cathedral tracery frame around the octahedron
    parts_h.append(torus_ring(
        gid_h + '_head_lead_frame', hc, up_h, 0.098, 0.007, 0.007, silver_p,
        rigid_joint='Head', n_major=8, n_minor=6, vfx={'kind': 'standard', 'kinetic': kin_head}
    ))

    # Orbiting Crown of 8 Rotating Prismatic Glass Shards (magenta, cyan, amber, emerald)
    n_orb = np.array([0.16, -0.14, 0.97])
    n_orb = n_orb / np.linalg.norm(n_orb)
    u_o, v_o = core.frame(n_orb)
    kin_crown = {
        'bone': 'Head', 'motion': 'orbit', 'speed': 1.05, 'amp': 0.012,
        'precess': 0.07, 'phase': 0.0,
        'center_gl': hc_gl, 'axis_gl': bl_to_gl_dir(n_orb),
    }
    for ki in range(8):
        ang = (ki / 8.0) * 2.0 * math.pi
        r_dir = u_o * math.cos(ang) + v_o * math.sin(ang)
        sc = hc + r_dir * 0.168 + n_orb * (0.022 * math.sin(ang * 2.0))
        tilt_up = n_orb + r_dir * 0.25
        rim_c, acc_c = prism_hexes[ki % 4]
        parts_h.append(crystal_prism(
            f'{gid_h}_shard_{ki}', sc, tilt_up, 0.088 if ki % 2 == 0 else 0.064, 0.024,
            prism_paints[ki % 4], 'Head', sides=4,
            vfx={
                'kind': 'fresnel_ghost', 'core_color': '#180c2c', 'rim_color': rim_c, 'accent_color': acc_c,
                'opacity': 0.78, 'power': 1.7, 'rim_gain': 2.20, 'prism': 0.95, 'kinetic': kin_crown,
            }
        ))

    ent_h = assemble_garment(gid_h, 'Prism Matriarch Octahedral Head & 8-Shard Crown', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 2B. TORSO: ext2_{s}_prism_corset (Cathedral-Tracery Stained-Glass Cuirass & Glowing Crystal Heart) ---
    gid_t = f'ext2_{sex}_prism_corset'
    parts_t = []
    # Architectural stained-glass & black-lead faceted cuirass cropped at waist
    cuir_p = cuirass_plate(
        gid_t + '_cuirass', glass_p, trim_paint=lead_p, style='gothic',
        z_top=core.TOP - 0.012, z_bot=core.WAIST - 0.008, ease=0.020, keel=0.026, faulds=1
    )
    for cp in cuir_p:
        cp.no_conform = True
    parts_t.extend(cuir_p)

    # Sleek leaded-indigo upper sleeves to elbow
    slv_p = sleeves(gid_t, 'elbow', 0.012, indigo_p, ease_end=0.018, rows=8, n=16)
    for sp in slv_p:
        sp.no_conform = True
    parts_t.extend(slv_p)

    # Open Glowing Crystalline Heart-Chamber framed in leaded cathedral lancet arch
    hc_st = chest_front(core.CHEST + 0.01, 0.040, x=0.0)
    parts_t.append(torus_ring(
        gid_t + '_heart_frame', hc_st, fwd, 0.044, 0.009, 0.009, lead_p,
        rigid_joint='Spine2', n_major=10, n_minor=6
    ))
    parts_t.append(crystal_prism(
        gid_t + '_heart_crystal', hc_st - fwd * 0.006, up_w, 0.072, 0.026, mag_p, 'Spine2', sides=4,
        vfx={'kind': 'emissive_blaze', 'color': '#ff6cf0', 'gain': 2.40, 'pulse': 0.24}
    ))

    # Sharp faceted crystalline shoulder spires
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        sh = J(side + 'Arm')
        for si, (dx, dz, h_s) in enumerate(((0.020, 0.058, 0.115), (0.056, 0.036, 0.088))):
            p_sh = sh + np.array([sgn * dx, -0.005, dz])
            d_sh = np.array([sgn * (0.45 + 0.25 * si), 0.12, 0.85])
            parts_t.append(crystal_prism(
                f'{gid_t}_sh_crystal_{tag}_{si}', p_sh, d_sh, h_s, 0.022,
                prism_paints[(si + (0 if sgn > 0 else 2)) % 4], 'Spine2', sides=4,
                vfx={
                    'kind': 'fresnel_ghost', 'core_color': '#180c2c',
                    'rim_color': prism_hexes[si][0], 'accent_color': prism_hexes[si][1],
                    'opacity': 0.82, 'power': 1.8, 'rim_gain': 2.05, 'prism': 0.90,
                }
            ))

    ent_t = assemble_garment(gid_t, 'Prism Matriarch Cathedral-Tracery Cuirass & Crystal Heart', 'torso', parts_t)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 2C. BACK: ext2_{s}_prism_rose (Large Floating Rotating Gothic Rose-Window Mandala) ---
    gid_b = f'ext2_{sex}_prism_rose'
    parts_b = []
    rose_c = np.array([0.0, 0.155, core.SHOULDER + 0.045])
    rose_gl = bl_to_gl_pt(rose_c)
    rose_ax = np.array([0.0, -1.0, 0.0])
    kin_rose = {
        'bone': 'Spine2', 'motion': 'orbit', 'speed': 0.36, 'amp': 0.008,
        'precess': 0.02, 'phase': 0.0,
        'center_gl': rose_gl, 'axis_gl': bl_to_gl_dir(rose_ax),
    }
    # Outer & inner leaded-iron rose window rings
    parts_b.append(torus_ring(
        gid_b + '_outer_rim', rose_c, rose_ax, 0.345, 0.018, 0.012, lead_p,
        rigid_joint='Spine2', n_major=40, n_minor=8, vfx={'kind': 'standard', 'kinetic': kin_rose}
    ))
    parts_b.append(torus_ring(
        gid_b + '_mid_rim', rose_c, rose_ax, 0.215, 0.011, 0.009, silver_p,
        rigid_joint='Spine2', n_major=32, n_minor=6, vfx={'kind': 'standard', 'kinetic': kin_rose}
    ))
    parts_b.append(crystal_prism(
        gid_b + '_rose_hub', rose_c, rose_ax, 0.036, 0.056, cyan_p, 'Spine2', sides=6,
        vfx={'kind': 'emissive_blaze', 'color': '#ff8cf4', 'gain': 2.15, 'pulse': 0.18, 'kinetic': kin_rose}
    ))

    # 12 radial cathedral mullions + 12 translucent polychrome stained-glass petal panes
    for mi in range(12):
        ang = (mi / 12.0) * 2.0 * math.pi
        r_dir = left_w * math.cos(ang) + up_w * math.sin(ang)
        parts_b.append(sweep_tube(
            f'{gid_b}_mullion_{mi}', [rose_c + r_dir * 0.050, rose_c + r_dir * 0.345],
            [0.008, 0.006], lead_p, n=6, rigid_joint='Spine2', cap_ends=False,
            vfx={'kind': 'standard', 'kinetic': kin_rose}
        ))
        # Petal stained-glass pane between mullions
        ang_p = ang + (math.pi / 12.0)
        p_dir = left_w * math.cos(ang_p) + up_w * math.sin(ang_p)
        rim_c, acc_c = prism_hexes[mi % 4]
        parts_b.append(crystal_prism(
            f'{gid_b}_pane_{mi}', rose_c + p_dir * 0.268, p_dir, 0.132, 0.044,
            prism_paints[mi % 4], 'Spine2', sides=4, scale_xy=(0.24, 1.0),
            vfx={
                'kind': 'fresnel_ghost', 'core_color': '#1a0c2a', 'rim_color': rim_c, 'accent_color': acc_c,
                'opacity': 0.72, 'power': 1.7, 'rim_gain': 2.15, 'prism': 1.0, 'kinetic': kin_rose,
            }
        ))

    entries.append(assemble_garment(gid_b, 'Prism Matriarch Floating Gothic Rose-Window Mandala', 'back', parts_b))

    # --- 2D. GLOVES: ext2_{s}_prism_gauntlets (Faceted Crystalline Blade-Gauntlets & Lead Filigree) ---
    gid_g = f'ext2_{sex}_prism_gauntlets'
    parts_g = []
    parts_g.extend(full_gloves(gid_g, lead_p, glass_p, silver_p, f0=0.78, ease=0.012, knuckle_paint=silver_p))
    parts_g.extend(sculpted_vambraces(gid_g + '_vamb', glass_p, trim_paint=lead_p, couter=True, ease=0.015))
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        blade_c = el + d_fa * 0.48 + np.array([sgn * 0.042, 0.018, 0.012])
        parts_g.append(crystal_prism(
            f'{gid_g}_blade_{side}', blade_c, u_fa, 0.185, 0.026, cyan_p if sgn > 0 else mag_p,
            side + 'ForeArm', sides=4, scale_xy=(0.45, 1.25),
            vfx={
                'kind': 'fresnel_ghost', 'core_color': '#180c2c', 'rim_color': '#4ef4ff', 'accent_color': '#ff52d8',
                'opacity': 0.80, 'power': 1.8, 'rim_gain': 2.05, 'prism': 0.90,
            }
        ))
    ent_g = assemble_garment(gid_g, 'Prism Matriarch Crystalline Blade-Gauntlets', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 2E. LEGS: ext2_{s}_prism_greaves (Faceted Stained-Glass & Leaded-Silver Articulated Leg-Shards) ---
    gid_l = f'ext2_{sex}_prism_greaves'
    parts_l = []
    parts_l.extend(trousers(gid_l + '_under', indigo_p, ease=0.008, cuff=core.ANKLE + 0.05, bag=0.004))
    parts_l.extend(sculpted_greaves(gid_l + '_shins', glass_p, trim_paint=lead_p, poleyn=True, ease=0.016))
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        hip, kn = J(side + 'UpLeg'), J(side + 'Leg')
        d_th = kn - hip
        # Faceted thigh crystal armor-shard
        parts_l.append(crystal_prism(
            f'{gid_l}_thigh_shard_{side}', hip + d_th * 0.44 + np.array([sgn * 0.046, -0.024, 0.0]),
            d_th, 0.280, 0.044, mag_p if sgn > 0 else cyan_p, side + 'UpLeg', sides=4, scale_xy=(0.55, 1.15),
            vfx={
                'kind': 'fresnel_ghost', 'core_color': '#180c2c', 'rim_color': '#ff52d8', 'accent_color': '#4ef4ff',
                'opacity': 0.82, 'power': 1.8, 'rim_gain': 1.95, 'prism': 0.90,
            }
        ))
        # Glowing prism knee-gem
        parts_l.append(crystal_prism(
            f'{gid_l}_knee_gem_{side}', kn + np.array([0.0, -0.068, 0.006]), up_w,
            0.042, 0.016, cyan_p, side + 'Leg', sides=4,
            vfx={'kind': 'emissive_blaze', 'color': '#78f8ff', 'gain': 2.20, 'pulse': 0.20}
        ))
    ent_l = assemble_garment(gid_l, 'Prism Matriarch Stained-Glass Articulated Leg-Shards', 'legs', parts_l, legged=True)
    hide_full_body(ent_l)
    entries.append(ent_l)

    # --- 2F. FEET: ext2_{s}_prism_heels (Crystalline Diamond-Faceted Sabatons) ---
    gid_f = f'ext2_{sex}_prism_heels'
    parts_f = []
    parts_f.extend(boots(gid_f, lead_p, glass_p, top=0.22, cuff_paint=silver_p, ease_top=0.020))
    for side in ('Left', 'Right'):
        ft, toe = J(side + 'Foot'), J(side + 'ToeBase', 'tail')
        parts_f.append(crystal_prism(
            f'{gid_f}_toe_facet_{side}', toe + np.array([0.0, -0.012, 0.024]), fwd,
            0.068, 0.022, cyan_p, side + 'Foot', sides=4,
            vfx={
                'kind': 'fresnel_ghost', 'core_color': '#180c2c', 'rim_color': '#4ef4ff', 'accent_color': '#ff52d8',
                'opacity': 0.84, 'power': 1.8, 'rim_gain': 1.95, 'prism': 0.95,
            }
        ))
    ent_f = assemble_garment(gid_f, 'Prism Matriarch Diamond-Faceted Sabatons', 'feet', parts_f)
    entries.append(ent_f)
    return entries


# ===============================================================================================================
# 3. CLOCKWORK AEON — Brass Orrery & Hourglass Time-Warden (Bipedal Chronomantic Construct)
# ===============================================================================================================
def _build_clockwork_aeon(sex):
    entries = []
    brass_p    = _mp('ext2_brass', 'metal.brass.braid')
    brass_dk_p = _mp('ext2_brass_dk', 'metal.bronze')
    brass_hi_p = _mp('ext2_brass_hi', 'metal.gold')
    clock_p    = _mp('ext2_brass', 'metal.brass.braid', 'ext2_clockface', 'ext2_brass_dk')
    chart_p    = _mp('ext2_midnight', 'cloth.brocade.damask', 'ext2_star_chart', 'ext2_brass_hi')
    void_p     = _mp('ext2_midnight_dk', 'cloth.velvet', grain=0.0)
    silver_p   = _mp('ext2_moon_silver', 'metal.paktong.brushed')
    sand_p     = _mp('ext2_sand_gold', 'beads.glass', grain=0.0)
    obs_p      = _mp('ext2_obsidian', 'stone.obsidian.pancake_flaked')

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    # --- 3A. HEAD: ext2_{s}_aeon_astrolabe (Armillary Sphere / Hourglass Head + Temporal-Sand Core) ---
    gid_h = f'ext2_{sex}_aeon_astrolabe'
    parts_h = []

    nk = J('Neck')
    parts_h.append(torus_ring(
        gid_h + '_neck_flange', np.array([0.0, 0.005, nk[2] + 0.004]), up_w,
        0.082, 0.020, 0.014, brass_p, rigid_joint='Neck', n_major=28, n_minor=8
    ))

    hc = np.array([0.0, float(a_hd[1]) - 0.004, float(a_hd[2]) + 0.102])
    hc_gl = bl_to_gl_pt(hc)
    kin_hg = {'bone': 'Head', 'motion': 'bob', 'speed': 1.40, 'amp': 0.011, 'phase': 0.0, 'center_gl': hc_gl}

    # Hourglass glass shell (pinched double-bulb profile)
    rows_hg = 15
    angs_hg = np.linspace(0.0, 2.0 * math.pi, 18, endpoint=False)
    Q_hg = []
    for k_h in range(rows_hg):
        u_h = k_h / (rows_hg - 1)  # 0=bottom, 1=top
        z_off = (u_h - 0.5) * 0.175
        # Classic hourglass pinch at u_h = 0.5
        rad_h = 0.014 + 0.048 * (abs(u_h - 0.5) * 2.0) ** 1.15
        if k_h in (0, rows_hg - 1):
            rad_h *= 0.85
        sc = hc + up_h * z_off
        Q_hg.append([sc + left_h * (math.cos(a) * rad_h) - bk_h * (math.sin(a) * rad_h) for a in angs_hg])
    parts_h.append(_part_raw(
        gid_h + '_hourglass_glass', Q_hg, True, sand_p, rigid_joint='Head',
        vfx={
            'kind': 'fresnel_ghost', 'core_color': '#201506', 'rim_color': '#ffe082', 'accent_color': '#84d8ff',
            'opacity': 0.52, 'power': 2.0, 'rim_gain': 1.90, 'kinetic': kin_hg,
        }
    ))
    # Brass hourglass top/bottom endcaps & 3 vertical brass frame rods
    for s_cap, ctag in ((-1.0, 'bot'), (1.0, 'top')):
        parts_h.append(torus_ring(
            f'{gid_h}_cap_{ctag}', hc + up_h * (s_cap * 0.090), up_h,
            0.056, 0.012, 0.008, brass_p, rigid_joint='Head', n_major=22, n_minor=6,
            vfx={'kind': 'standard', 'kinetic': kin_hg}
        ))
    # Blazing golden temporal-sand core & falling sand-stream
    sand_vfx = {'kind': 'emissive_blaze', 'color': '#ffd864', 'gain': 2.35, 'pulse': 0.22, 'kinetic': kin_hg}
    parts_h.append(ellipsoid_part(
        gid_h + '_sand_upper', hc + up_h * 0.045, (0.030, 0.030, 0.026), sand_p, 'Head', n=12, rows=8, vfx=sand_vfx
    ))
    parts_h.append(ellipsoid_part(
        gid_h + '_sand_lower', hc - up_h * 0.055, (0.034, 0.034, 0.024), sand_p, 'Head', n=12, rows=8, vfx=sand_vfx
    ))
    parts_h.append(sweep_tube(
        gid_h + '_sand_stream', [hc + up_h * 0.035, hc - up_h * 0.045], [0.005, 0.004],
        sand_p, n=6, rigid_joint='Head', cap_ends=False, vfx=sand_vfx
    ))

    # 3 Orbiting Brass Armillary Meridian Rings
    arm_rings = [
        ('merid1', 0.132, 0.010, 0.006, np.array([ 0.25, -0.92, 0.28]),  0.90, 0.05, 0.0),
        ('merid2', 0.114, 0.009, 0.005, np.array([ 0.88,  0.18, 0.44]), -1.30, 0.06, 1.4),
        ('eclip',  0.150, 0.011, 0.006, np.array([-0.34, -0.22, 0.91]),  0.65, 0.04, 2.7),
    ]
    for rname, mr, rx, ry, nv, spd, prec, ph in arm_rings:
        n_ax = nv / np.linalg.norm(nv)
        parts_h.append(torus_ring(
            f'{gid_h}_{rname}', hc, n_ax, mr, rx, ry,
            brass_hi_p if rname == 'eclip' else brass_p, rigid_joint='Head',
            n_major=34, n_minor=8,
            vfx={
                'kind': 'standard',
                'kinetic': {
                    'bone': 'Head', 'motion': 'orbit', 'speed': spd, 'amp': 0.010,
                    'precess': prec, 'phase': ph, 'center_gl': hc_gl, 'axis_gl': bl_to_gl_dir(n_ax),
                },
            }
        ))

    ent_h = assemble_garment(gid_h, 'Clockwork Aeon Armillary Sphere & Hourglass Head', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 3B. TORSO: ext2_{s}_aeon_chassis (Brass Gearwork Ribcage & Clockface Pectoral over Nebula-Rift Void) ---
    gid_t = f'ext2_{sex}_aeon_chassis'
    parts_t = []

    # Deep midnight-blue cosmic nebula-rift void-cloth bodice stopping at waist
    void_bod = torso_tube(
        gid_t + '_void_bodice', core.TOP + 0.008, core.WAIST - 0.005, ease=0.010,
        paint=void_p, n=34, rows=12
    )
    tag_vfx(void_bod, {
        'kind': 'nebula_rift',
        'center_y': 1.25,
        'galaxy_scale': 3.1,
        'core_color': '#ffe8a8',
        'arm_color': '#78c8ff',
        'nebula_color': '#1d2d88',
        'gold_color': '#e8a83e',
        'void_color': '#030512',
    }, no_conform=True)
    parts_t.append(void_bod)

    slv_a = sleeves(gid_t, 'elbow', 0.014, chart_p, ease_end=0.022, rows=8, n=18)
    for sp in slv_a:
        sp.no_conform = True
    parts_t.extend(slv_a)

    # Sculpted brass gearwork ribcage & armored collar harness
    cuir_a = cuirass_plate(
        gid_t + '_brass_ribs', clock_p, trim_paint=brass_hi_p, style='gothic',
        z_top=core.TOP - 0.015, z_bot=core.WAIST + 0.012, ease=0.022, keel=0.015, faulds=1
    )
    for cp in cuir_a:
        cp.no_conform = True
    parts_t.extend(cuir_a)

    # Roman-numeral clockface pectoral medallion + ticking minute hand on sternum
    clk_c = chest_front(core.CHEST + 0.012, 0.044, x=0.0)
    parts_t.append(torus_ring(
        gid_t + '_clock_bezel', clk_c, fwd, 0.056, 0.010, 0.010, brass_hi_p,
        rigid_joint='Spine2', n_major=26, n_minor=8
    ))
    parts_t.append(ellipsoid_part(
        gid_t + '_clock_dial', clk_c + np.array([0.0, 0.005, 0.0]), (0.048, 0.008, 0.048),
        clock_p, 'Spine2', n=20, rows=8
    ))
    kin_hand = {
        'bone': 'Spine2', 'motion': 'orbit', 'speed': 0.80, 'amp': 0.0, 'precess': 0.0, 'phase': 0.0,
        'center_gl': bl_to_gl_pt(clk_c), 'axis_gl': bl_to_gl_dir(fwd),
    }
    parts_t.append(sweep_tube(
        gid_t + '_clock_hand', [clk_c - np.array([0.0, 0.007, 0.0]), clk_c + up_w * 0.044 - np.array([0.0, 0.007, 0.0])],
        [0.005, 0.002], sand_p, n=6, rigid_joint='Spine2', cap_ends=False,
        vfx={'kind': 'emissive_blaze', 'color': '#ffdf78', 'gain': 2.10, 'pulse': 0.10, 'kinetic': kin_hand}
    ))

    ent_t = assemble_garment(gid_t, 'Clockwork Aeon Brass Gearwork Chassis & Clockface Pectoral', 'torso', parts_t)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 3C. BACK: ext2_{s}_aeon_orrery (Dorsal Planetary Clockwork Orrery w/ Counter-Rotating Gears & 4 Moons) ---
    gid_b = f'ext2_{sex}_aeon_orrery'
    parts_b = []

    orr_c = np.array([0.0, 0.165, core.SHOULDER + 0.025])
    orr_gl = bl_to_gl_pt(orr_c)
    orr_ax = np.array([0.0, -1.0, 0.0])

    # Central riveted brass axle mount
    parts_b.append(ellipsoid_part(
        gid_b + '_axle_hub', orr_c - np.array([0.0, 0.030, 0.0]), (0.048, 0.036, 0.048),
        brass_dk_p, 'Spine2', n=14, rows=8
    ))

    # 2 Counter-Rotating Notched Brass Gear-Wheels
    gear_specs = [
        ('outer', 0.285, 0.018, 0.010,  0.55, 12, brass_p),
        ('inner', 0.168, 0.016, 0.010, -1.10,  8, brass_hi_p),
    ]
    for gname, gr, rx, ry, spd, n_teeth, gp in gear_specs:
        kin_g = {
            'bone': 'Spine2', 'motion': 'orbit', 'speed': spd, 'amp': 0.004,
            'precess': 0.0, 'phase': 0.0,
            'center_gl': orr_gl, 'axis_gl': bl_to_gl_dir(orr_ax),
        }
        parts_b.append(torus_ring(
            f'{gid_b}_gear_{gname}', orr_c, orr_ax, gr, rx, ry, gp,
            rigid_joint='Spine2', n_major=36, n_minor=8, vfx={'kind': 'standard', 'kinetic': kin_g}
        ))
        # 4 spokes
        for si in range(4):
            ang = si * (math.pi / 2.0)
            sd = left_w * math.cos(ang) + up_w * math.sin(ang)
            parts_b.append(sweep_tube(
                f'{gid_b}_spoke_{gname}_{si}', [orr_c + sd * 0.035, orr_c + sd * gr],
                [0.008, 0.007], gp, n=6, rigid_joint='Spine2', cap_ends=False,
                vfx={'kind': 'standard', 'kinetic': kin_g}
            ))
        # Notched gear teeth around circumference
        for ti in range(n_teeth):
            ang = (ti / float(n_teeth)) * 2.0 * math.pi
            td = left_w * math.cos(ang) + up_w * math.sin(ang)
            parts_b.append(crystal_prism(
                f'{gid_b}_tooth_{gname}_{ti}', orr_c + td * (gr + rx * 1.15), td,
                0.028, 0.014, gp, 'Spine2', sides=4, vfx={'kind': 'standard', 'kinetic': kin_g}
            ))

    # 4 Orbiting Miniature Silver & Gold Moons
    moon_specs = [
        (0.225, 0.024,  0.95, 0.2, silver_p, '#dce8ff'),
        (0.345, 0.030, -0.72, 1.8, brass_hi_p, '#ffe07a'),
        (0.315, 0.022,  1.45, 3.5, silver_p, '#94e4ff'),
        (0.255, 0.026, -1.25, 5.0, brass_hi_p, '#ffcb5c'),
    ]
    for mi, (m_rad, m_sz, m_spd, m_ph, m_p, m_hex) in enumerate(moon_specs):
        ang = m_ph
        m_dir = left_w * math.cos(ang) + up_w * math.sin(ang)
        mc = orr_c + m_dir * m_rad + np.array([0.0, 0.022 * (mi % 2 - 0.5), 0.0])
        kin_m = {
            'bone': 'Spine2', 'motion': 'orbit', 'speed': m_spd, 'amp': 0.006,
            'precess': 0.04, 'phase': m_ph, 'center_gl': orr_gl, 'axis_gl': bl_to_gl_dir(orr_ax),
        }
        parts_b.append(ellipsoid_part(
            f'{gid_b}_moon_{mi}', mc, (m_sz, m_sz, m_sz), m_p, 'Spine2', n=12, rows=8,
            vfx={'kind': 'emissive_blaze', 'color': m_hex, 'gain': 1.75, 'pulse': 0.14, 'kinetic': kin_m}
        ))

    entries.append(assemble_garment(gid_b, 'Clockwork Aeon Planetary Orrery & Orbiting Moons', 'back', parts_b))

    # --- 3D. GLOVES: ext2_{s}_aeon_calipers (Articulated Brass Chronometer Gauntlets & Compass Blades) ---
    gid_g = f'ext2_{sex}_aeon_calipers'
    parts_g = []
    parts_g.extend(full_gloves(gid_g, brass_p, brass_dk_p, brass_hi_p, f0=0.78, ease=0.012, knuckle_paint=brass_hi_p))
    parts_g.extend(sculpted_vambraces(gid_g + '_vamb', clock_p, trim_paint=brass_hi_p, couter=True, ease=0.015))
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        # Twin sweeping compass-needle forearm blades
        for bi, z_sh in enumerate((-0.014, 0.014)):
            b0 = el + d_fa * 0.24 + np.array([sgn * 0.044, 0.012, z_sh])
            b1 = wr + u_fa * 0.065 + np.array([sgn * 0.036, 0.008, z_sh * 0.45])
            parts_g.append(sweep_tube(
                f'{gid_g}_caliper_{side}_{bi}', [b0, b1], [0.009, 0.0018],
                brass_hi_p, n=6, rigid_joint=side + 'ForeArm', cap_ends=False
            ))
    ent_g = assemble_garment(gid_g, 'Clockwork Aeon Brass Chronometer Gauntlets & Calipers', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 3E. LEGS: ext2_{s}_aeon_coatlegs (Astronomical-Chart Coat-Tails w/ Cloth Chains over Brass Greaves) ---
    gid_l = f'ext2_{sex}_aeon_coatlegs'
    parts_l = []
    # Tailored midnight-indigo under-breeches + brass-trimmed greaves
    parts_l.extend(trousers(gid_l + '_breeches', chart_p, ease=0.012, cuff=core.ANKLE + 0.06, bag=0.006))
    parts_l.extend(sculpted_greaves(gid_l + '_greaves', brass_p, trim_paint=brass_hi_p, poleyn=True, ease=0.016))
    # Open-front midnight-indigo astronomical-chart long coat-tails with proper cloth `chains`!
    coat_tails = torso_tube(
        gid_l + '_coat_tails', core.WAIST + 0.008, core.KNEE - 0.03, ease=0.032,
        paint=chart_p, n=36, arc=(-0.78 * math.pi, 0.78 * math.pi),
        hang_from=core.WAIST, flare=0.145, stiff=0.14, layer=1
    )
    coat_tails.no_conform = True
    parts_l.append(coat_tails)

    ent_l = assemble_garment(gid_l, 'Clockwork Aeon Astronomical Coat-Tails & Brass Greaves', 'legs', parts_l, legged=True)
    hide_full_body(ent_l)
    entries.append(ent_l)

    # --- 3F. FEET: ext2_{s}_aeon_boots (Riveted Brass-and-Obsidian Articulated Clockwork Boots) ---
    gid_f = f'ext2_{sex}_aeon_boots'
    parts_f = []
    parts_f.extend(boots(gid_f, obs_p, brass_p, top=0.34, wraps=2, wrap_paint=brass_hi_p, cuff_paint=brass_dk_p, ease_top=0.022))
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        ft = J(side + 'Foot')
        parts_f.append(torus_ring(
            f'{gid_f}_ankle_gear_{side}', ft + np.array([sgn * 0.044, 0.005, 0.045]), left_w * sgn,
            0.024, 0.006, 0.005, brass_hi_p, rigid_joint=side + 'Foot', n_major=14, n_minor=6
        ))
    ent_f = assemble_garment(gid_f, 'Clockwork Aeon Riveted Brass Clockwork Boots', 'feet', parts_f)
    entries.append(ent_f)
    return entries


# ===============================================================================================================
# 4. ABYSSAL MEDUSA — Bioluminescent Deep-Void Jellyfish / Coral Sovereign (Legless Abyssal-Astral Hover)
# ===============================================================================================================
def _build_abyssal_medusa(sex):
    entries = []
    abyss_p   = _mp('ext2_abyss', 'cloth.silk', grain=0.01)
    coral_p   = _mp('ext2_coral_bone', 'shell.nacre', 'ext2_coral_rib', 'ext2_bio_cyan', grain=0.015)
    pearl_p   = _mp('ext2_pearl', 'shell.nacre', grain=0.01)
    cyan_p    = _mp('ext2_bio_cyan', 'beads.glass', grain=0.0)
    magenta_p = _mp('ext2_bio_magenta', 'beads.glass', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])

    # --- 4A. HEAD: ext2_{s}_medusa_bell (Translucent Bioluminescent Jellyfish Dome-Bell & Filaments) ---
    gid_h = f'ext2_{sex}_medusa_bell'
    parts_h = []

    hc = np.array([0.0, float(a_hd[1]) - 0.002, float(a_hd[2]) + 0.078])
    # Dark abyssal void-mask inner cranium
    parts_h.append(ellipsoid_part(
        gid_h + '_void_mask', hc, (0.084, 0.098, 0.112), abyss_p, 'Head',
        axes=(left_h, bk_h, up_h), n=20, rows=12
    ))
    # Twin glowing bioluminescent eyes
    eye_vfx = {'kind': 'emissive_blaze', 'color': '#56faff', 'gain': 2.40, 'pulse': 0.25}
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        parts_h.append(ellipsoid_part(
            f'{gid_h}_eye_{tag}', hc + left_h * (sgn * 0.032) - bk_h * 0.092 + up_h * 0.012,
            (0.012, 0.008, 0.018), cyan_p, 'Head', axes=(left_h, bk_h, up_h), n=10, rows=6, vfx=eye_vfx
        ))

    # Translucent glowing bioluminescent jellyfish dome-bell crown (`fresnel_ghost` cyan/magenta rim!)
    bell_c = hc + up_h * 0.085
    kin_bell = {'bone': 'Head', 'motion': 'bob', 'speed': 1.85, 'amp': 0.014, 'phase': 0.0, 'center_gl': bl_to_gl_pt(bell_c)}
    rows_b = 14
    angs_b = np.linspace(0.0, 2.0 * math.pi, 32, endpoint=False)
    Q_bell = []
    for k_b in range(rows_b):
        u_b = k_b / (rows_b - 1)  # 0=apex, 1=scalloped lower rim
        phi = u_b * 0.62 * math.pi
        r_b = 0.015 + 0.205 * math.sin(phi) ** 0.85
        z_b = 0.125 * math.cos(phi)
        Q_bell.append([
            bell_c
            + left_h * (math.cos(a) * r_b * (1.0 + 0.075 * (u_b ** 1.5) * math.cos(8.0 * a)))
            - bk_h * (math.sin(a) * r_b * (1.0 + 0.075 * (u_b ** 1.5) * math.cos(8.0 * a)))
            + up_h * (z_b - 0.018 * (u_b ** 2.0) * math.cos(8.0 * a))
            for a in angs_b
        ])
    parts_h.append(_part_raw(
        gid_h + '_jelly_bell', Q_bell, True, cyan_p, rigid_joint='Head',
        vfx={
            'kind': 'fresnel_ghost', 'core_color': '#0b0828', 'rim_color': '#3cf8ff', 'accent_color': '#ff4ce0',
            'opacity': 0.60, 'power': 1.85, 'rim_gain': 2.25, 'prism': 0.45, 'kinetic': kin_bell,
        }
    ))

    # 8 trailing luminous sensory filaments hanging from the scalloped bell rim
    for fi in range(8):
        ang = (fi / 8.0) * 2.0 * math.pi + 0.20
        r_rim = 0.188
        p0 = bell_c + left_h * (math.cos(ang) * r_rim) - bk_h * (math.sin(ang) * r_rim) - up_h * 0.032
        f_pts = [
            p0,
            p0 - up_h * 0.115 + left_h * (math.cos(ang) * 0.025) + bk_h * 0.025,
            p0 - up_h * 0.245 + left_h * (math.cos(ang + 0.3) * 0.018) + bk_h * 0.048,
        ]
        is_c = (fi % 2 == 0)
        parts_h.append(sweep_tube(
            f'{gid_h}_filament_{fi}', catmull_spline(f_pts, 8), np.linspace(0.006, 0.0018, 8),
            cyan_p if is_c else magenta_p, n=6, rigid_joint='Head', cap_ends=False,
            vfx={
                'kind': 'emissive_blaze', 'color': '#5afaff' if is_c else '#ff68e8',
                'gain': 2.15, 'pulse': 0.24,
                'kinetic': {
                    'bone': 'Head', 'motion': 'chorus_wave', 'speed': 2.05, 'amp': 0.012,
                    'phase': fi * 0.78, 'center_gl': bl_to_gl_pt(p0), 'axis_gl': [1.0, 0.0, 0.0],
                },
            }
        ))

    ent_h = assemble_garment(gid_h, 'Abyssal Medusa Bioluminescent Jellyfish Bell & Filaments', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 4B. TORSO: ext2_{s}_medusa_mantle (Bone-Coral & Pearl Exoskeleton over Abyssal Fresnel Body) ---
    gid_t = f'ext2_{sex}_medusa_mantle'
    parts_t = []
    abyss_vfx = {
        'kind': 'fresnel_ghost',
        'core_color': '#07081c',
        'rim_color': '#3cf2ff',
        'accent_color': '#e44aff',
        'opacity': 0.88,
        'power': 2.0,
        'rim_gain': 1.95,
        'depth_write': True,
    }
    ab_trunk = torso_tube(
        gid_t + '_abyss_body', core.TOP + 0.008, core.WAIST - 0.005, ease=0.008, paint=abyss_p, n=34, rows=12
    )
    tag_vfx(ab_trunk, abyss_vfx, no_conform=True)
    parts_t.append(ab_trunk)

    ab_slv = sleeves(gid_t, 'elbow', 0.008, abyss_p, ease_end=0.010, rows=8, n=16)
    tag_vfx(ab_slv, abyss_vfx, no_conform=True)
    parts_t.extend(ab_slv)

    # Pale bone-coral & iridescent pearl exoskeleton bodice cropped cleanly at waist
    exo_p = cuirass_plate(
        gid_t + '_coral_bodice', coral_p, trim_paint=pearl_p, style='gothic',
        z_top=core.TOP - 0.012, z_bot=core.WAIST + 0.012, ease=0.020, keel=0.016, faulds=1
    )
    for ep in exo_p:
        ep.no_conform = True
    parts_t.extend(exo_p)

    # Branching pale-coral clavicle collar-spines & 6 glowing bioluminescent pulse-nodes
    node_vfx = {'kind': 'emissive_blaze', 'color': '#4cf8ff', 'gain': 2.35, 'pulse': 0.30}
    for ni, (nx, nz) in enumerate(((0.0, core.CHEST + 0.03), (0.0, core.CHEST - 0.06),
                                   (-0.075, core.CHEST + 0.01), (0.075, core.CHEST + 0.01),
                                   (-0.055, core.WAIST + 0.06), (0.055, core.WAIST + 0.06))):
        nc = chest_front(nz, 0.036, x=nx)
        parts_t.append(ellipsoid_part(
            f'{gid_t}_pulse_node_{ni}', nc, (0.012, 0.009, 0.014),
            cyan_p if ni % 2 == 0 else magenta_p, 'Spine2', n=10, rows=6, vfx=node_vfx
        ))

    ent_t = assemble_garment(gid_t, 'Abyssal Medusa Bone-Coral Exoskeleton & Bioluminescent Mantle', 'torso', parts_t)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 4C. BACK: ext2_{s}_medusa_fronds (Luminescent Sea-Anemone / Nautilus Dorsal Fronds + Spore Emitters) ---
    gid_b = f'ext2_{sex}_medusa_fronds'
    parts_b = []
    hub_m = np.array([0.0, 0.135, core.SHOULDER - 0.03])

    # Sculpted iridescent pearl nautilus spiral shell hub
    naut_pts = []
    for k_n in range(18):
        th = k_n * 0.42
        rr = 0.012 + 0.0055 * th * th
        naut_pts.append(hub_m + np.array([math.cos(th) * rr, 0.012 + 0.004 * th, math.sin(th) * rr]))
    parts_b.append(sweep_tube(
        gid_b + '_nautilus_hub', naut_pts, np.linspace(0.008, 0.028, 18),
        pearl_p, n=10, rigid_joint='Spine2', cap_ends=True
    ))

    # 8 fanning translucent luminescent sea-anemone dorsal fronds
    for fi in range(8):
        u_f = (fi / 7.0) * 2.0 - 1.0  # -1..+1 fan arc
        ang = u_f * 1.18
        f_dir = np.array([math.sin(ang), 0.36, math.cos(ang)])
        f_dir = f_dir / np.linalg.norm(f_dir)
        f_len = 0.34 + 0.10 * (1.0 - abs(u_f))
        p0 = hub_m + f_dir * 0.04
        p1 = hub_m + f_dir * (0.55 * f_len) + np.array([0.0, 0.065, 0.025])
        p2 = hub_m + f_dir * f_len + np.array([0.0, 0.035, -0.02])
        is_c = (fi % 2 == 0)
        parts_b.append(sweep_tube(
            f'{gid_b}_frond_{fi}', catmull_spline([p0, p1, p2], 10),
            np.array([0.016, 0.024, 0.032, 0.038, 0.042, 0.040, 0.034, 0.026, 0.016, 0.005]),
            cyan_p if is_c else magenta_p, n=8, rigid_joint='Spine2', scale_xy=(0.24, 1.35),
            ref_dir=fwd, cap_ends=False,
            vfx={
                'kind': 'fresnel_ghost', 'core_color': '#0b082a',
                'rim_color': '#42f8ff' if is_c else '#ff56e4',
                'accent_color': '#ff56e4' if is_c else '#42f8ff',
                'opacity': 0.64, 'power': 1.75, 'rim_gain': 2.25, 'prism': 0.40,
                'kinetic': {
                    'bone': 'Spine2', 'motion': 'chorus_wave', 'speed': 1.65, 'amp': 0.012,
                    'phase': fi * 0.65, 'center_gl': bl_to_gl_pt(p0), 'axis_gl': [1.0, 0.0, 0.0],
                },
            }
        ))

    medusa_spores = [{
        'bone': 'Spine2', 'offset': [0.0, 0.06, -0.18],
        'count': 30, 'rate': 0.28, 'size0': 0.065, 'size1': 0.240,
        'drift': [0.04, 0.32, -0.10], 'spread': 0.120, 'opacity': 0.62,
        'ember_color': '#4cf8ff', 'core_color': '#180a36', 'mist_color': '#c852ff',
    }]
    entries.append(assemble_garment(gid_b, 'Abyssal Medusa Nautilus & Sea-Anemone Dorsal Fronds', 'back', parts_b,
                                    emitters=medusa_spores))

    # --- 4D. GLOVES: ext2_{s}_medusa_tendrils (Coral-Plated Forearms & Glowing Bioluminescent Claw-Fingers) ---
    gid_g = f'ext2_{sex}_medusa_tendrils'
    parts_g = []
    claw_vfx = {'kind': 'emissive_blaze', 'color': '#56f8ff', 'gain': 2.15, 'pulse': 0.22}
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        parts_g.append(sweep_tube(
            f'{gid_g}_coral_vamb_{side}', [el + d_fa * 0.12, wr + u_fa * 0.010], [0.054, 0.040],
            coral_p, n=12, rigid_joint=side + 'ForeArm'
        ))
        out_v = np.array([sgn * 0.45, -0.88, 0.12])
        out_v = out_v / np.linalg.norm(out_v)
        side_v = np.cross(u_fa, out_v)
        side_v = side_v / max(float(np.linalg.norm(side_v)), 1e-6)
        palm_end = wr + u_fa * 0.088
        parts_g.append(sweep_tube(
            f'{gid_g}_palm_{side}', [wr - u_fa * 0.005, palm_end], [0.036, 0.040],
            pearl_p, n=10, rigid_joint=side + 'Hand', scale_xy=(1.18, 0.58), ref_dir=up_w
        ))
        for fi, off_f in enumerate((-0.028, -0.009, 0.009, 0.028)):
            f0 = palm_end - u_fa * 0.006 + side_v * off_f
            f1 = f0 + u_fa * 0.068 - out_v * 0.010
            f2 = f1 + u_fa * 0.056 + out_v * 0.028
            parts_g.append(sweep_tube(
                f'{gid_g}_tendril_{side}_{fi}', [f0, f1, f2], [0.010, 0.0065, 0.0018],
                cyan_p if fi % 2 == 0 else magenta_p, n=6, rigid_joint=side + 'Hand', cap_ends=False, vfx=claw_vfx
            ))
        th0 = wr + u_fa * 0.028 + side_v * (0.034 * sgn) - out_v * 0.014
        th1 = th0 + u_fa * 0.068 + side_v * (0.014 * sgn) + out_v * 0.024
        parts_g.append(sweep_tube(
            f'{gid_g}_thumb_{side}', [th0, th1], [0.011, 0.002],
            cyan_p, n=6, rigid_joint=side + 'Hand', cap_ends=False, vfx=claw_vfx
        ))

    ent_g = assemble_garment(gid_g, 'Abyssal Medusa Coral Forearms & Bioluminescent Tendril Claws', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 4E. LEGS: ext2_{s}_medusa_tentacles (Legless Swaying Ring of 8 Bioluminescent Jellyfish Tentacles) ---
    gid_l = f'ext2_{sex}_medusa_tentacles'
    parts_l = []
    # Inner translucent oral-arm veil funnel
    rows_v = 18
    zs_v = np.linspace(core.WAIST + 0.008, 0.12, rows_v)
    angs_v = np.linspace(0.0, 2.0 * math.pi, 26, endpoint=False)
    Q_veil = []
    for k_v, zv in enumerate(zs_v):
        u_v = k_v / (rows_v - 1)
        rad_v = (1.0 - u_v) ** 0.85 * 0.135 + 0.024
        Q_veil.append([
            [math.sin(a) * rad_v * (1.0 + 0.14 * math.sin(6.0 * a + u_v * 5.0)),
             math.cos(a) * rad_v * (1.0 + 0.14 * math.sin(6.0 * a + u_v * 5.0)), zv]
            for a in angs_v
        ])
    veil_vfx = {
        'kind': 'alpha_erosion',
        'no_push': True,
        'y_top': 0.86,
        'y_bot': 0.08,
        'edge_color': '#44f6ff',
        'smoke_color': '#0b0824',
        'swirl': 1.85,
    }
    parts_l.append(_part_raw(gid_l + '_oral_veil', Q_veil, True, abyss_p, rigid_joint='Hips', vfx=veil_vfx))

    # Ring of 8 sculpted sinuous spiraling bioluminescent jellyfish tentacles
    for ti in range(8):
        a0 = (ti / 8.0) * 2.0 * math.pi
        t_pts = []
        z_end = 0.055 if (ti % 2 == 0) else 0.110
        for k_t in range(16):
            u_t = k_t / 15.0
            zv = (core.WAIST + 0.004) * (1.0 - u_t) + z_end * u_t
            sway_a = a0 + 0.85 * math.sin(u_t * math.pi * 1.5 + ti * 0.7) * u_t
            rad_t = 0.148 * (1.0 - 0.35 * u_t) + 0.032 * math.sin(u_t * math.pi * 2.0)
            t_pts.append(np.array([math.sin(sway_a) * rad_t, math.cos(sway_a) * rad_t, zv]))
        is_c = (ti % 2 == 0)
        parts_l.append(sweep_tube(
            f'{gid_l}_tentacle_{ti}', t_pts, np.linspace(0.026, 0.004, 16),
            cyan_p if is_c else magenta_p, n=8, rigid_joint='Hips', cap_ends=False,
            vfx={
                'kind': 'alpha_erosion', 'no_push': True,
                'y_top': 0.84, 'y_bot': 0.05,
                'edge_color': '#44f8ff' if is_c else '#ff52e2',
                'smoke_color': '#100828', 'swirl': 1.65,
            }
        ))

    ent_l = assemble_garment(gid_l, 'Abyssal Medusa Swaying Eight-Tentacle Bioluminescent Trail', 'legs', parts_l)
    hide_full_body(ent_l)
    entries.append(ent_l)
    return entries


# ===============================================================================================================
# 5. ASHEN CALAMITY — Volcanic Obsidian-Magma & Crown-of-Cinders Demon (Bipedal Infernal-Planar Entity)
# ===============================================================================================================
def _build_ashen_calamity(sex):
    entries = []
    obs_p     = _mp('ext2_obsidian', 'stone.obsidian.pancake_flaked')
    cracked_p = _mp('ext2_basalt', 'stone.obsidian.pancake_flaked', 'ext2_volcanic_crack', 'ext2_magma')
    ash_p     = _mp('ext2_cinder_ash', 'cloth.wool.fulled')
    magma_p   = _mp('ext2_magma', 'beads.glass', grain=0.0)
    hot_p     = _mp('ext2_magma_hot', 'beads.glass', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])

    magma_vfx = {'kind': 'emissive_blaze', 'color': '#ff6a14', 'gain': 2.50, 'pulse': 0.24}
    hot_vfx   = {'kind': 'emissive_blaze', 'color': '#ff9e2c', 'gain': 2.65, 'pulse': 0.20}

    # --- 5A. HEAD: ext2_{s}_calamity_horns (Cracked Obsidian Demonic Skull, Magma Fissures, Ram Horns & Cinder Smoke) ---
    gid_h = f'ext2_{sex}_calamity_horns'
    parts_h = []

    hc = np.array([0.0, float(a_hd[1]) - 0.004, float(a_hd[2]) + 0.082])
    # Angular cracked volcanic obsidian demonic cranium & jaw
    parts_h.append(ellipsoid_part(
        gid_h + '_skull_cranium', hc + up_h * 0.012, (0.092, 0.108, 0.115), cracked_p, 'Head',
        axes=(left_h, bk_h, up_h), n=16, rows=12
    ))
    parts_h.append(ellipsoid_part(
        gid_h + '_skull_jaw', hc - up_h * 0.068 - bk_h * 0.025, (0.068, 0.082, 0.056), obs_p, 'Head',
        axes=(left_h, bk_h, up_h), n=12, rows=8
    ))
    # Blazing molten magma fissures splitting forehead & furnace eyes
    parts_h.append(sweep_tube(
        gid_h + '_magma_fissure',
        [hc + up_h * 0.105 - bk_h * 0.072, hc + up_h * 0.032 - bk_h * 0.108, hc - up_h * 0.038 - bk_h * 0.102],
        [0.005, 0.011, 0.004], magma_p, n=6, rigid_joint='Head', cap_ends=False, vfx=magma_vfx
    ))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        # Slanted blazing furnace eyes
        e0 = hc + left_h * (sgn * 0.020) - bk_h * 0.104 + up_h * 0.008
        e1 = hc + left_h * (sgn * 0.056) - bk_h * 0.096 + up_h * 0.026
        parts_h.append(sweep_tube(
            f'{gid_h}_eye_{tag}', [e0, e1], [0.009, 0.004], hot_p, n=6, rigid_joint='Head', cap_ends=False, vfx=hot_vfx
        ))
        # Sweeping charred-obsidian ram/crown horns
        h_pts = catmull_spline([
            hc + left_h * (sgn * 0.058) + up_h * 0.078 - bk_h * 0.025,
            hc + left_h * (sgn * 0.145) + up_h * 0.145 + bk_h * 0.035,
            hc + left_h * (sgn * 0.195) + up_h * 0.215 + bk_h * 0.105,
            hc + left_h * (sgn * 0.155) + up_h * 0.305 + bk_h * 0.055,
        ], 14)
        parts_h.append(sweep_tube(
            f'{gid_h}_horn_{tag}', h_pts, np.linspace(0.032, 0.004, 14),
            cracked_p, n=10, rigid_joint='Head', cap_ends=False
        ))
        # Secondary forward obsidian crown-spike
        sp_pts = [
            hc + left_h * (sgn * 0.036) + up_h * 0.095 - bk_h * 0.040,
            hc + left_h * (sgn * 0.052) + up_h * 0.175 - bk_h * 0.065,
        ]
        parts_h.append(sweep_tube(
            f'{gid_h}_crown_spike_{tag}', sp_pts, [0.015, 0.003], obs_p, n=7, rigid_joint='Head', cap_ends=False
        ))

    head_cinders = [{
        'bone': 'Head', 'offset': [0.0, 0.15, 0.0],
        'count': 26, 'rate': 0.38, 'size0': 0.060, 'size1': 0.220,
        'drift': [0.03, 0.42, -0.05], 'spread': 0.065, 'opacity': 0.72,
        'ember_color': '#ff6210', 'core_color': '#0d0908', 'mist_color': '#4c403a',
    }]
    ent_h = assemble_garment(gid_h, 'Ashen Calamity Cracked Obsidian Skull & Ram Horns', 'head', parts_h,
                             emitters=head_cinders, covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 5B. TORSO: ext2_{s}_calamity_carapace (Floating Tectonic Obsidian Plates over Molten-Lava Furnace Core) ---
    gid_t = f'ext2_{sex}_calamity_carapace'
    parts_t = []
    # Blazing molten-lava furnace inner chest core stopping cleanly at waist
    furnace_core = torso_tube(
        gid_t + '_furnace_core', core.TOP + 0.008, core.WAIST - 0.005, ease=0.008,
        paint=magma_p, n=32, rows=12
    )
    tag_vfx(furnace_core, {'kind': 'emissive_blaze', 'color': '#ff5a10', 'gain': 2.15, 'pulse': 0.22}, no_conform=True)
    parts_t.append(furnace_core)

    cal_slv = sleeves(gid_t, 'elbow', 0.010, cracked_p, ease_end=0.016, rows=8, n=16)
    for sp in cal_slv:
        sp.no_conform = True
    parts_t.extend(cal_slv)

    # Jagged tectonic obsidian armor plates floating slightly apart (18-24mm off core so magma blazes through seams!)
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        # Split left/right tectonic chest slab
        a_lo = (0.10 * math.pi) if sgn > 0 else (-0.88 * math.pi)
        a_hi = (0.88 * math.pi) if sgn > 0 else (-0.10 * math.pi)
        slab = torso_tube(
            f'{gid_t}_tectonic_slab_{tag}', core.TOP - 0.012, core.WAIST + 0.020, ease=0.028,
            paint=cracked_p, n=16, rows=8, arc=(a_lo, a_hi)
        )
        slab.no_conform = True
        parts_t.append(slab)

        # Jagged volcanic basalt shoulder-pauldron spikes
        sh = J(side + 'Arm')
        parts_t.append(crystal_prism(
            f'{gid_t}_pauldron_slab_{tag}', sh + np.array([sgn * 0.042, 0.0, 0.048]),
            np.array([sgn * 0.65, 0.15, 0.74]), 0.165, 0.056, obs_p, 'Spine2', sides=5
        ))

    # Heavy volcanic obsidian waist-girdle
    girdle = torso_tube(
        gid_t + '_obsidian_girdle', core.WAIST + 0.032, core.WAIST - 0.012, ease=0.032,
        paint=obs_p, n=28, rows=5
    )
    girdle.no_conform = True
    parts_t.append(girdle)

    chest_cinders = [{
        'bone': 'Spine2', 'offset': [0.0, 0.04, 0.14],
        'count': 22, 'rate': 0.34, 'size0': 0.050, 'size1': 0.190,
        'drift': [0.02, 0.36, 0.06], 'spread': 0.060, 'opacity': 0.64,
        'ember_color': '#ff6812', 'core_color': '#0b0807', 'mist_color': '#4a3d38',
    }]
    ent_t = assemble_garment(gid_t, 'Ashen Calamity Tectonic Obsidian Carapace & Magma Furnace', 'torso', parts_t,
                             emitters=chest_cinders)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 5C. BACK: ext2_{s}_calamity_braziers (Twin Floating Volcanic Basalt Monolith-Braziers + Rising Smoke Plumes) ---
    gid_b = f'ext2_{sex}_calamity_braziers'
    parts_b = []
    brazier_emitters = []

    for sgn, tag, ph in ((-1.0, 'R', 0.0), (1.0, 'L', 3.14)):
        bc = np.array([sgn * 0.245, 0.165, core.SHOULDER + 0.115])
        kin_bz = {
            'bone': 'Spine2', 'motion': 'bob', 'speed': 1.25, 'amp': 0.018,
            'phase': ph, 'center_gl': bl_to_gl_pt(bc),
        }
        # Jagged basalt monolith-brazier body
        parts_b.append(crystal_prism(
            f'{gid_b}_monolith_{tag}', bc, up_w, 0.245, 0.074, cracked_p, 'Spine2', sides=6,
            vfx={'kind': 'standard', 'kinetic': kin_bz}
        ))
        # Upper brazier rim crown
        parts_b.append(torus_ring(
            f'{gid_b}_rim_{tag}', bc + up_w * 0.095, up_w, 0.068, 0.014, 0.012, obs_p,
            rigid_joint='Spine2', n_major=12, n_minor=6, vfx={'kind': 'standard', 'kinetic': kin_bz}
        ))
        # Blazing molten coal-heart inside the brazier
        parts_b.append(ellipsoid_part(
            f'{gid_b}_embers_{tag}', bc + up_w * 0.098, (0.052, 0.052, 0.034), hot_p, 'Spine2',
            n=12, rows=8,
            vfx={'kind': 'emissive_blaze', 'color': '#ff7418', 'gain': 2.60, 'pulse': 0.26, 'kinetic': kin_bz}
        ))
        brazier_emitters.append({
            'bone': 'Spine2', 'offset': [round(sgn * 0.245, 4), 0.22, -0.165],
            'count': 30, 'rate': 0.42, 'size0': 0.080, 'size1': 0.290,
            'drift': [sgn * 0.06, 0.56, -0.06], 'spread': 0.072, 'opacity': 0.78,
            'ember_color': '#ff640c', 'core_color': '#0b0807', 'mist_color': '#524540',
        })

    entries.append(assemble_garment(gid_b, 'Ashen Calamity Twin Floating Basalt Monolith-Braziers', 'back', parts_b,
                                    emitters=brazier_emitters))

    # --- 5D. GLOVES: ext2_{s}_calamity_claws (Massive Cracked-Obsidian Gauntlets w/ White-Hot Claw Tips) ---
    gid_g = f'ext2_{sex}_calamity_claws'
    parts_g = []
    parts_g.extend(sculpted_vambraces(gid_g + '_vamb', cracked_p, trim_paint=obs_p, couter=True, ease=0.018))
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        out_v = np.array([sgn * 0.45, -0.88, 0.12])
        out_v = out_v / np.linalg.norm(out_v)
        side_v = np.cross(u_fa, out_v)
        side_v = side_v / max(float(np.linalg.norm(side_v)), 1e-6)

        palm_end = wr + u_fa * 0.095
        parts_g.append(sweep_tube(
            f'{gid_g}_palm_{side}', [wr - u_fa * 0.008, palm_end], [0.044, 0.048],
            cracked_p, n=10, rigid_joint=side + 'Hand', scale_xy=(1.22, 0.65), ref_dir=up_w
        ))
        for fi, off_f in enumerate((-0.032, -0.011, 0.011, 0.032)):
            f0 = palm_end - u_fa * 0.006 + side_v * off_f
            f1 = f0 + u_fa * 0.056 - out_v * 0.010
            f2 = f1 + u_fa * 0.048 + out_v * 0.028
            parts_g.append(sweep_tube(
                f'{gid_g}_claw_base_{side}_{fi}', [f0, f1], [0.014, 0.009],
                obs_p, n=7, rigid_joint=side + 'Hand', cap_ends=False
            ))
            parts_g.append(sweep_tube(
                f'{gid_g}_claw_tip_{side}_{fi}', [f1, f2], [0.009, 0.002],
                hot_p, n=6, rigid_joint=side + 'Hand', cap_ends=False, vfx=hot_vfx
            ))
        th0 = wr + u_fa * 0.030 + side_v * (0.040 * sgn) - out_v * 0.014
        th1 = th0 + u_fa * 0.068 + side_v * (0.016 * sgn) + out_v * 0.026
        parts_g.append(sweep_tube(
            f'{gid_g}_thumb_{side}', [th0, th1], [0.014, 0.0025],
            hot_p, n=6, rigid_joint=side + 'Hand', cap_ends=False, vfx=hot_vfx
        ))

    ent_g = assemble_garment(gid_g, 'Ashen Calamity Cracked-Obsidian Gauntlets & Molten Claws', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 5E. LEGS: ext2_{s}_calamity_greaves (Cracked Basalt-Slab Greaves, Magma Knee-Vents & Cinder Tassets) ---
    gid_l = f'ext2_{sex}_calamity_greaves'
    parts_l = []
    parts_l.extend(trousers(gid_l + '_under', ash_p, ease=0.010, cuff=core.ANKLE + 0.05, bag=0.005))
    parts_l.extend(sculpted_greaves(gid_l + '_shins', cracked_p, trim_paint=obs_p, poleyn=True, ease=0.018))
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        hip, kn = J(side + 'UpLeg'), J(side + 'Leg')
        d_th = kn - hip
        # Cracked basalt thigh-slab & scorched hip tasset
        parts_l.append(crystal_prism(
            f'{gid_l}_tasset_{side}', hip + np.array([sgn * 0.072, -0.028, -0.025]),
            d_th, 0.240, 0.052, cracked_p, side + 'UpLeg', sides=5, scale_xy=(0.55, 1.20)
        ))
        # Glowing magma knee-vents
        parts_l.append(ellipsoid_part(
            f'{gid_l}_knee_vent_{side}', kn + np.array([0.0, -0.072, 0.008]),
            (0.024, 0.012, 0.028), magma_p, side + 'Leg', n=10, rows=6, vfx=magma_vfx
        ))

    ent_l = assemble_garment(gid_l, 'Ashen Calamity Basalt-Slab Greaves & Magma Knee-Vents', 'legs', parts_l, legged=True)
    hide_full_body(ent_l)
    entries.append(ent_l)

    # --- 5F. FEET: ext2_{s}_calamity_hooves (Heavy Cloven Volcanic-Obsidian Demonic Hooves w/ Molten Soles) ---
    gid_f = f'ext2_{sex}_calamity_hooves'
    parts_f = []
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        ft, toe = J(side + 'Foot'), J(side + 'ToeBase', 'tail')
        # Ankle basalt collar
        parts_f.append(sweep_tube(
            f'{gid_f}_fetlock_{side}',
            [ft + np.array([0.0, 0.015, 0.095]), ft + np.array([0.0, 0.005, 0.028])],
            [0.054, 0.058], cracked_p, n=10, rigid_joint=side + 'Foot'
        ))
        # Twin heavy cloven volcanic-obsidian hoof lobes
        for lobe_i, lat in enumerate((-0.028, 0.028)):
            l_pts = [
                ft + np.array([lat * 0.65, 0.010, 0.052]),
                0.5 * (ft + toe) + np.array([lat, -0.018, 0.026]),
                np.array([toe[0] + lat * 1.15, toe[1] - 0.022, 0.006]),
            ]
            parts_f.append(sweep_tube(
                f'{gid_f}_hoof_{side}_{lobe_i}', l_pts, [0.028, 0.026, 0.022],
                obs_p, n=8, rigid_joint=side + 'Foot', scale_xy=(0.85, 1.10)
            ))
        # Glowing molten-crack sole plate underneath the cloven hooves
        parts_f.append(ellipsoid_part(
            f'{gid_f}_molten_sole_{side}',
            np.array([0.5 * (ft[0] + toe[0]), 0.5 * (ft[1] + toe[1]) - 0.012, 0.008]),
            (0.044, 0.072, 0.008), magma_p, side + 'Foot', n=10, rows=6, vfx=magma_vfx
        ))

    ent_f = assemble_garment(gid_f, 'Ashen Calamity Cloven Obsidian Hooves & Molten Soles', 'feet', parts_f)
    ent_f['hide_parts'] = ['Human.toenails']
    apply_custom_hide(ent_f, select_body_tris(('LeftFoot', 'RightFoot', 'LeftToe', 'RightToe'), weight_thresh=0.15, mode='any'), replace=True)
    entries.append(ent_f)
    return entries


# ===============================================================================================================
# Master Culture Builder & Manifest Writer
# ===============================================================================================================
def _wave2_tiers_and_outfits():
    tiers = [
        ['ophanim_seraph',  0.1],
        ['prism_matriarch', 0.1],
        ['clockwork_aeon',  0.1],
        ['abyssal_medusa',  0.1],
        ['ashen_calamity',  0.1],
    ]
    tier_labels = {
        'ophanim_seraph':  'Ophanim Seraph (Six-Winged Eyed-Wheel Celestial Hover)',
        'prism_matriarch': 'Prism Matriarch (Stained-Glass Automaton & Rose-Window Mandala)',
        'clockwork_aeon':  'Clockwork Aeon (Brass Orrery & Hourglass Time-Warden)',
        'abyssal_medusa':  'Abyssal Medusa (Bioluminescent Jellyfish & Coral Sovereign)',
        'ashen_calamity':  'Ashen Calamity (Volcanic Obsidian-Magma & Cinder-Brazier Demon)',
    }
    outfits = {'male': {}, 'female': {}}
    for sex_key, s in (('male', 'm'), ('female', 'f')):
        outfits[sex_key] = {
            'ophanim_seraph': {
                'head':   f'ext2_{s}_seraph_wheel',
                'torso':  f'ext2_{s}_seraph_vestment',
                'back':   f'ext2_{s}_seraph_wings',
                'gloves': f'ext2_{s}_seraph_hands',
                'legs':   f'ext2_{s}_seraph_trail',
                'feet':   None,
                'hair':   None,
                'beard':  None,
            },
            'prism_matriarch': {
                'head':   f'ext2_{s}_prism_crown',
                'torso':  f'ext2_{s}_prism_corset',
                'back':   f'ext2_{s}_prism_rose',
                'gloves': f'ext2_{s}_prism_gauntlets',
                'legs':   f'ext2_{s}_prism_greaves',
                'feet':   f'ext2_{s}_prism_heels',
                'hair':   None,
                'beard':  None,
            },
            'clockwork_aeon': {
                'head':   f'ext2_{s}_aeon_astrolabe',
                'torso':  f'ext2_{s}_aeon_chassis',
                'back':   f'ext2_{s}_aeon_orrery',
                'gloves': f'ext2_{s}_aeon_calipers',
                'legs':   f'ext2_{s}_aeon_coatlegs',
                'feet':   f'ext2_{s}_aeon_boots',
                'hair':   None,
                'beard':  None,
            },
            'abyssal_medusa': {
                'head':   f'ext2_{s}_medusa_bell',
                'torso':  f'ext2_{s}_medusa_mantle',
                'back':   f'ext2_{s}_medusa_fronds',
                'gloves': f'ext2_{s}_medusa_tendrils',
                'legs':   f'ext2_{s}_medusa_tentacles',
                'feet':   None,
                'hair':   None,
                'beard':  None,
            },
            'ashen_calamity': {
                'head':   f'ext2_{s}_calamity_horns',
                'torso':  f'ext2_{s}_calamity_carapace',
                'back':   f'ext2_{s}_calamity_braziers',
                'gloves': f'ext2_{s}_calamity_claws',
                'legs':   f'ext2_{s}_calamity_greaves',
                'feet':   f'ext2_{s}_calamity_hooves',
                'hair':   None,
                'beard':  None,
            },
        }
    return tiers, tier_labels, outfits


def build_extraplanar_wave2_kit():
    all_entries = []
    with extraplanar_wave2_motif_scope():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            all_entries.extend(_build_ophanim_seraph(sex))
            all_entries.extend(_build_prism_matriarch(sex))
            all_entries.extend(_build_clockwork_aeon(sex))
            all_entries.extend(_build_abyssal_medusa(sex))
            all_entries.extend(_build_ashen_calamity(sex))
    return all_entries


def main():
    t0 = time.time()
    entries = build_extraplanar_wave2_kit()
    tiers, tier_labels, outfits = _wave2_tiers_and_outfits()
    items_by_body = {
        'mpfb_male':   [e for e in entries if e.get('_body') == 'mpfb_male'],
        'mpfb_female': [e for e in entries if e.get('_body') == 'mpfb_female'],
    }
    manifest = {
        'entries': entries,
        'items': items_by_body,
        'tiers': tiers,
        'tier_labels': tier_labels,
        'outfits': outfits,
    }
    manifest_path = CULTURES_DIR / 'extraplanar_wave2_manifest.json'
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')

    n_zones = sum(len((e.get('vfx') or {}).get('zones', [])) for e in entries)
    n_kinetics = sum(
        sum(1 for z in (e.get('vfx') or {}).get('zones', []) if 'kinetic' in z)
        for e in entries
    )
    n_emitters = sum(len((e.get('vfx') or {}).get('emitters', [])) for e in entries)
    print(
        f'\nCompiled {len(entries)} extraplanar_wave2 pieces '
        f'({len(items_by_body["mpfb_male"])} M + {len(items_by_body["mpfb_female"])} F) '
        f'with {n_zones} VFX zones, {n_kinetics} kinetic sub-assemblies, and {n_emitters} smoke emitters '
        f'in {time.time() - t0:.1f}s -> {manifest_path.name}'
    )


if __name__ == '__main__':
    main()
