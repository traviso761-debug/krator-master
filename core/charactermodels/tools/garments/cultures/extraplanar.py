"""The Extraplanar Entities Kit (`extraplanar`).

Compiles 48 procedural extraplanar garments, exotic body-replacement constructs, cosmic rift robes,
decapitated gorgets, floating shard limbs, cosmic accretion rings, and demon-mask choruses
(24 `mpfb_male` `ext_m_*` + 24 `mpfb_female` `ext_f_*`) across 5 Extraplanar Entity archetypes,
paired with custom WebGL/Godot shaders (`src/75-extraplanar.js` / `kchar_extraplanar.gdshader`):

1. `singularity_archon` — Cosmic Rift & Star-Mirror Archon (Refs #1 & #7):
   - `head`:   `ext_{s}_archon_corona`    (headless astral collar + levitating golden star-mirror orb + blazing 8-point eclipse starburst)
   - `torso`:  `ext_{s}_archon_robe`      (split indigo-violet & gold kimono robes revealing a deep 3D view-parallax spiral-galaxy chest/skirt void)
   - `back`:   `ext_{s}_archon_ribbons`   (levitating white-gold astral corona blade-ribbons)
   - `gloves`: `ext_{s}_archon_hands`     (translucent Fresnel-glowing pale-cyan astral forearms & obsidian-clawed hands)

2. `censer_revenant` — Decapitated Smoke-Plume Knight & Lantern Wraith (Refs #2, #4 & #12):
   - `head`:   `ext_{s}_revenant_gorget`  (headless scorched dark-iron & gilded gorget pouring a live billowing chimney-smoke plume)
   - `torso`:  `ext_{s}_revenant_plate`   (dark gothic half-plate & gilded stole-lappets shredding via alpha-erosion into shadow tatters)
   - `back`:   `ext_{s}_revenant_lanterns`(3 glowing violet-blue wrought-iron gothic street-lanterns on chained dorsal stalks)
   - `gloves`: `ext_{s}_revenant_gauntlets`(articulated dark-iron & gold gothic plate gauntlets)
   - `legs`:   `ext_{s}_revenant_chains`  (legless dangling wrought-iron chains & alpha-eroded wraith shroud + trailing smoke wisps)

3. `vox_solus` — Fragmented Floating-Shard & Torus-Head Construct (Refs #5 & #6 `VOX SOLUS`):
   - `head`:   `ext_{s}_vox_torus`        (100% fleshless sweeping brushed-platinum crescent torus-ring halo + floating iridescent orb)
   - `torso`:  `ext_{s}_vox_shards`       (open spiral obsidian-chrome rib-blade, detached floating shards & 3 polychrome Fresnel crystals)
   - `gloves`: `ext_{s}_vox_arms`         (disconnected floating obsidian-chrome upper/forearm shards & razor-talon hands w/ energy tethers)
   - `legs`:   `ext_{s}_vox_legs`         (disconnected floating obsidian-chrome thigh & shin blade-shards w/ open knee air-gaps)
   - `feet`:   `ext_{s}_vox_feet`         (bifurcated stiletto-shard construct feet)

4. `accretion_djinn` — Smoke-Vortex & Orbiting Accretion-Ring Entity (Refs #8 & #10):
   - `head`:   `ext_{s}_djinn_helm`       (dark bronze-obsidian astrolabe caliper helm w/ blazing electric cyan-sapphire Cyclopean visor)
   - `torso`:  `ext_{s}_djinn_carapace`   (engraved antique-bronze gorget over translucent obsidian-violet Fresnel astral body + shoulder smoke)
   - `back`:   `ext_{s}_djinn_rings`      (2 large tilted cosmic accretion-disc rings orbiting & precessing live around the torso)
   - `gloves`: `ext_{s}_djinn_gauntlets`  (sapphire-rune bronze vambraces & oversized predatory obsidian demon-claws)
   - `legs`:   `ext_{s}_djinn_vortex`     (legless corkscrewing alpha-eroded smoke-tornado tail + live base smoke emitter)

5. `chorus_of_masks` — Headless Seven-Mask Chorus & Astral Haori Entity (Refs #3 & #13):
   - `head`:   `ext_{s}_chorus_masks`     (headless arc of 7 horned obsidian-to-crimson Noh demon masks bobbing in a live chorus wave)
   - `torso`:  `ext_{s}_chorus_haori`     (crisp wide white-and-gold draped haori sleeves over a starry constellation-engraved astral body)
   - `back`:   `ext_{s}_chorus_monoliths` (floating ring of 10 golden octahedral diamond collar-monoliths + sinuous barbed demon-tail)
   - `legs`:   `ext_{s}_chorus_legs`      (slender constellation-engraved obsidian astral legs)
   - `feet`:   `ext_{s}_chorus_talons`    (three-taloned obsidian & ivory demon-claw feet)

Run standalone to compile all `.glb` + `.morph.bin` pieces and emit `extraplanar_manifest.json`:
    python -u tools/garments/cultures/extraplanar.py
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
    Part, J, L, R, FRONT, spine_at, first_hit, head_frame,
    chest_front, ring_points, set_body, assemble_garment as _core_assemble,
)
from garments.paint import P, B, PN, C
from garments.types.torso import torso_tube
from garments.types.limbs import limb_tube, sleeves
from garments.types.armor import cuirass_plate, articulated_pauldron

# ===============================================================================================================
# Scoped Palette Colors (Linear RGB, `ext_` prefixed)
# ===============================================================================================================
EXT_COLORS = {
    'ext_void':         (0.012, 0.010, 0.028),
    'ext_obsidian':     (0.032, 0.030, 0.042),
    'ext_soot':         (0.065, 0.062, 0.075),
    'ext_darkiron':     (0.115, 0.122, 0.138),
    'ext_gunmetal':     (0.210, 0.225, 0.250),
    'ext_titanium':     (0.335, 0.360, 0.405),
    'ext_platinum':     (0.740, 0.755, 0.790),
    'ext_silver':       (0.840, 0.855, 0.890),
    'ext_indigo':       (0.115, 0.088, 0.360),
    'ext_indigo_hi':    (0.215, 0.175, 0.560),
    'ext_indigo_dk':    (0.052, 0.038, 0.185),
    'ext_astral_cyan':  (0.320, 0.780, 0.840),
    'ext_cyan_blaze':   (0.580, 0.960, 1.000),
    'ext_sapphire':     (0.140, 0.360, 0.980),
    'ext_violet_glow':  (0.480, 0.240, 0.960),
    'ext_gold':         (0.840, 0.640, 0.210),
    'ext_gold_bright':  (1.000, 0.880, 0.520),
    'ext_bronze':       (0.440, 0.285, 0.135),
    'ext_bronze_dk':    (0.215, 0.135, 0.065),
    'ext_white_silk':   (0.935, 0.930, 0.915),
    'ext_ivory':        (0.890, 0.865, 0.810),
    'ext_noh_crimson':  (0.560, 0.055, 0.075),
    'ext_noh_rose':     (0.740, 0.165, 0.185),
    'ext_tail_grey':    (0.420, 0.415, 0.435),
    'ext_amber_gem':    (0.980, 0.540, 0.090),
    'ext_amethyst_gem': (0.580, 0.180, 0.880),
    'ext_starwhite':    (0.990, 0.985, 1.000),
}
for _ek, _ev in EXT_COLORS.items():
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

EXT_CUSTOM_MOTIFS = {
    'ext_archon_robe',
    'ext_gothic_plate',
    'ext_tatter_coat',
    'ext_vox_shard',
    'ext_djinn_bronze',
    'ext_djinn_disc',
    'ext_noh_mask',
    'ext_porcelain_mask',
    'ext_constellation_body',
    'ext_haori_silk',
}


def _ext_custom_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'ext_archon_robe':
        # Regal indigo-violet silk folds with crisp lapel/hem astral trim (Ref #1)
        pleat = 0.82 + 0.18 * np.sin(u * 2.0 * math.pi * 12.0)
        grad_v = 1.08 - 0.24 * v
        img[:] = np.asarray(bg)[None, None, :] * (pleat * grad_v)[:, :, None]
        lapel_band = (u < 0.065) | (u > 0.935)
        lapel_inner = ((u >= 0.065) & (u < 0.115)) | ((u <= 0.935) & (u > 0.885))
        hem_gold = v > 0.955
        hem_hi = (v > 0.925) & (v <= 0.955)
        img[lapel_inner | hem_hi] = C['ext_indigo_hi']
        img[lapel_band | hem_gold] = fg
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext_gothic_plate':
        # Scorched gothic dark-iron articulated lames with tarnished gold trim & soot patina (Ref #12)
        lame = (v * 9.0) % 1.0
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        grime = 0.78 + 0.22 * np.sin(u * 23.0 + v * 17.0) * np.cos(u * 13.0 - v * 29.0)
        img[:] = np.asarray(bg)[None, None, :] * grime[:, :, None]
        seam = (lame < 0.11) | (np.abs(au - 0.48) < 0.020)
        gold_edge = ((lame >= 0.11) & (lame < 0.21)) | (u < 0.035) | (u > 0.965) | (np.abs(au - 0.04) < 0.015)
        hi_steel = (lame >= 0.21) & (lame < 0.42) & (~gold_edge)
        img[hi_steel] = C['ext_gunmetal']
        img[seam] = C['ext_obsidian']
        img[gold_edge] = fg
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext_tatter_coat':
        # Vertical pleated charcoal-soot greatcoat wool fading into charred shadow tatters (Ref #12)
        pleat = 0.74 + 0.26 * np.sin(u * 2.0 * math.pi * 16.0 + 0.45 * np.sin(v * 9.0))
        soot_fade = np.clip(1.12 - 0.58 * v, 0.35, 1.15)
        img[:] = np.asarray(bg)[None, None, :] * (pleat * soot_fade)[:, :, None]
        seam_v = (np.abs(u - 0.50) < 0.014) | (np.abs(u - 0.25) < 0.010) | (np.abs(u - 0.75) < 0.010)
        img[seam_v] = 0.70 * img[seam_v] + 0.30 * np.asarray(fg)
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext_vox_shard':
        # Brushed obsidian-titanium construct shard with fine topographic contour striations (Ref #6)
        stri = 0.5 + 0.5 * np.sin((u * 18.0 + v * 9.0 + 0.35 * np.sin(v * 14.0)) * math.pi)
        bevel = (u < 0.08) | (u > 0.92) | (v < 0.06) | (v > 0.94)
        base = np.asarray(bg)[None, None, :] * (0.65 + 0.45 * stri)[:, :, None]
        spec_band = (stri > 0.86) & (~bevel)
        img[:] = base
        img[spec_band] = 0.55 * img[spec_band] + 0.45 * np.asarray(fg)
        img[bevel] = fg
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext_djinn_bronze':
        # Engraved antique astrolabe bronze with celestial circles & sapphire-violet recesses (Ref #8)
        su = (u * 6.0) % 1.0 - 0.5
        sv = (v * 3.0) % 1.0 - 0.5
        rad = np.hypot(su, sv)
        ring1 = np.abs(rad - 0.34) < 0.055
        ring2 = np.abs(rad - 0.18) < 0.042
        border = (v < 0.10) | (v > 0.90)
        recess = rad < 0.12
        img[:] = np.asarray(bg)[None, None, :] * (0.82 + 0.18 * np.cos(u * 24.0))[:, :, None]
        img[ring1 | ring2 | border] = fg
        img[recess] = C['ext_obsidian']
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext_djinn_disc':
        # Cosmic accretion ring metallic bronze-gold bevel with luminous stardust plasma track (Ref #8)
        # v runs around the ring cross-section (0..1), u runs azimuthally around the 360-deg orbit
        track = np.abs(v - 0.50)
        core_glow = track < 0.14
        gold_bevel = (track >= 0.14) & (track < 0.34)
        swirl = 0.72 + 0.28 * np.sin(u * 2.0 * math.pi * 8.0 + v * 6.0)
        img[:] = np.asarray(bg)[None, None, :] * swirl[:, :, None]
        img[gold_bevel] = fg
        img[core_glow] = C['ext_cyan_blaze']
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext_noh_mask':
        # Obsidian upper face fading smoothly to crimson-lacquer lower jaw/chin (Ref #13!)
        # v=0 is crown of mask, v=1 is pointed chin
        t_red = np.clip((v - 0.40) / 0.48, 0.0, 1.0)
        t_red = t_red * t_red * (3.0 - 2.0 * t_red)
        c_top = np.asarray(bg)[None, None, :]
        c_bot = np.asarray(fg)[None, None, :]
        img[:] = c_top * (1.0 - t_red[:, :, None]) + c_bot * t_red[:, :, None]
        # Subtle sculpted dark lips & brow shadow
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        lip = (np.abs(v - 0.76) < 0.028) & (au < 0.22)
        brow = (np.abs(v - 0.32 - 0.05 * np.cos(su * 4.0)) < 0.018) & (au > 0.10) & (au < 0.56)
        img[lip] = C['ext_obsidian']
        img[brow] = C['ext_void']
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext_porcelain_mask':
        # Carved ivory-porcelain theatrical mask with crisp gold-leaf kintsugi cracks, filigree & lacquered back shell
        # u in [0.00, 0.50] = front face (u=0.25 is nose center); [0.50, 0.56] & [0.94, 1.00] = gold rim bevel; (0.56, 0.94) = dark lacquer back
        front_mask = u <= 0.50
        rim_mask = ((u > 0.50) & (u <= 0.57)) | (u >= 0.93)
        back_mask = (u > 0.57) & (u < 0.93)
        uf = (u - 0.25) * 4.0  # -1..+1 across front face
        auf = np.abs(uf)

        # Warm glossy ivory-porcelain base with subtle radial ceramic glaze shading
        glaze = 0.93 + 0.07 * np.cos(uf * 1.4) * np.cos((v - 0.45) * 1.6)
        img[:] = np.asarray(bg)[None, None, :] * glaze[:, :, None]

        # Delicate theatrical porcelain cheek blush & subtle eye-socket shading on front face
        blush = np.exp(-(((auf - 0.50) / 0.24) ** 2 + ((v - 0.56) / 0.12) ** 2)) * front_mask
        blush_col = np.array([0.92, 0.72, 0.68])
        img[:] = img * (1.0 - 0.20 * blush[:, :, None]) + blush_col[None, None, :] * (0.20 * blush[:, :, None])

        socket_sh = np.exp(-(((auf - 0.36) / 0.15) ** 2 + ((v - 0.40) / 0.065) ** 2)) * front_mask
        img[:] = img * (1.0 - 0.26 * socket_sh[:, :, None])

        # Forehead gold-leaf filigree diamond & scroll motif
        f_fil = front_mask & (v > 0.11) & (v < 0.25) & (
            (np.abs(auf * 0.55 + np.abs(v - 0.18) * 1.4 - 0.075) < 0.012)
            | ((auf < 0.42) & (np.abs(v - (0.14 + 0.04 * np.cos(uf * 5.0))) < 0.008))
        )
        # 3 crisp branching kintsugi gold-leaf crack lines across forehead, temple-cheek, and lower jaw
        c1 = np.abs(v - (0.22 + 0.24 * (uf + 0.35) + 0.032 * np.sin(uf * 11.0))) < 0.010
        c1_branch = (uf > -0.15) & (uf < 0.55) & (np.abs(v - (0.34 - 0.18 * uf + 0.024 * np.cos(uf * 14.0))) < 0.008)
        c2 = (uf < 0.15) & (np.abs(v - (0.64 - 0.22 * uf + 0.028 * np.sin(uf * 13.0 + 1.1))) < 0.009)
        c3 = (uf > 0.10) & (np.abs(v - (0.72 + 0.16 * (uf - 0.2) + 0.022 * np.cos(uf * 15.0))) < 0.008)
        kintsugi = front_mask & (c1 | c1_branch | c2 | c3)

        # Hairline shadow adjacent to kintsugi cracks for close-up readability
        c1_sh = front_mask & (np.abs(v - (0.232 + 0.24 * (uf + 0.35) + 0.032 * np.sin(uf * 11.0))) < 0.005)
        img[c1_sh] = 0.65 * img[c1_sh]

        # Subtle crimson-lacquer lip tint at mouth center
        lip_tint = front_mask & (np.abs(v - 0.74) < 0.026) & (auf < 0.22)
        img[lip_tint] = 0.45 * img[lip_tint] + 0.55 * np.asarray(C['ext_noh_crimson'])

        # Apply crisp gold-leaf filigree, kintsugi veins, gilded beveled rim, and dark-lacquered hollow back shell
        img[f_fil | kintsugi | rim_mask] = fg
        img[back_mask] = C['ext_obsidian']
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext_constellation_body':
        # Charcoal-obsidian astral skin engraved with silver-ivory swirling cloud-arabesques (Ref #13!)
        s1 = np.sin(u * 2.0 * math.pi * 4.0 + 1.8 * np.sin(v * 2.0 * math.pi * 3.0))
        s2 = np.cos(v * 2.0 * math.pi * 5.0 - 1.6 * np.cos(u * 2.0 * math.pi * 3.0))
        filigree = (np.abs(s1 * s2) < 0.085) & (v < 0.82)
        spine_line = (np.abs(u - 0.5) < 0.012) | (np.abs(u) < 0.012) | (np.abs(u - 1.0) < 0.012)
        fade = np.clip(1.15 - 0.65 * v, 0.25, 1.0)
        img[:] = np.asarray(bg)[None, None, :]
        img[filigree | spine_line] = np.asarray(bg) * (1.0 - 0.55 * fade[filigree | spine_line, None]) + np.asarray(fg) * (0.55 * fade[filigree | spine_line, None])
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext_haori_silk':
        # Crisp ivory-white silk Haori sleeve with subtle ink-wash fold shading & gold cuff piping (Ref #13!)
        wash = 0.90 + 0.10 * np.sin(u * 2.0 * math.pi * 5.0 + v * 3.0)
        ink_shadow = (np.sin(u * 2.0 * math.pi * 3.0 - v * 4.5) > 0.68) & (v > 0.25) & (v < 0.88)
        cuff_gold = v > 0.945
        cuff_line = (v > 0.925) & (v <= 0.945)
        img[:] = np.asarray(bg)[None, None, :] * wash[:, :, None]
        img[ink_shadow] = 0.82 * img[ink_shadow] + 0.18 * np.asarray(C['ext_tail_grey'])
        img[cuff_line] = C['ext_obsidian']
        img[cuff_gold] = fg
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def extraplanar_motif_scope():
    orig_motif = paint_mod.motif

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        if style in EXT_CUSTOM_MOTIFS:
            return _ext_custom_motif(style, w, h, fg, bg, aspect=aspect)
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


def assemble_garment(gid, label, slot, parts, emitters=None, auras=None, **kw):
    kw.setdefault('allow_floating', True)
    entry = _core_assemble(gid, label, slot, 'extraplanar', parts, **kw)
    entry['culture'] = 'extraplanar'
    if emitters:
        entry.setdefault('vfx', {})['emitters'] = emitters
    if auras:
        entry.setdefault('vfx', {})['auras'] = auras
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
    """Smooth generalized tube along 3D `path` with per-station or `(r0, r1)` radii and optional blade `scale_xy`."""
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


def ellipsoid_part(name, center, radii_xyz, paint, rigid_joint, axes=None, n=16, rows=10, vfx=None):
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


def crystal_prism(name, center, axis_up, height, radius, paint, rigid_joint, sides=6, vfx=None):
    """Sharp double-terminatedfaceted crystal shard (`sides=4` octahedron/obelisk, `sides=6` hexagonal quartz)."""
    c = np.asarray(center, dtype=np.float64)
    u_z = np.asarray(axis_up, dtype=np.float64)
    u_z = u_z / max(float(np.linalg.norm(u_z)), 1e-8)
    u_x, u_y = core.frame(u_z)
    angs = np.linspace(0.0, 2.0 * math.pi, sides, endpoint=False)
    stations = [
        (-0.50 * height, 0.05 * radius),
        (-0.24 * height, 0.88 * radius),
        ( 0.16 * height, 1.00 * radius),
        ( 0.50 * height, 0.04 * radius),
    ]
    Q = []
    for hz, rr in stations:
        sc = c + u_z * hz
        Q.append([sc + u_x * (math.cos(a) * rr) + u_y * (math.sin(a) * rr) for a in angs])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


def torus_ring(name, center, normal_dir, major_r, minor_rx, minor_ry, paint, rigid_joint,
               arc=(0.0, 2.0 * math.pi), n_major=40, n_minor=10, closed_loop=True, vfx=None):
    """3D beveled torus or open crescent orbital ring with razor-edged cross-section (`minor_rx` radial, `minor_ry` axial)."""
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


def chain_strand(name, p_start, p_end, sag_vec, n_links, link_r, wire_r, paint, rigid_joint=None, cloth_hang=False):
    """Crisp corrugated 3D wrought-iron chain strand (single continuous Part for compact vertex budget)."""
    ctrl = [
        np.asarray(p_start, dtype=np.float64),
        0.5 * (np.asarray(p_start) + np.asarray(p_end)) + np.asarray(sag_vec, dtype=np.float64),
        np.asarray(p_end, dtype=np.float64),
    ]
    rows = max(12, n_links * 3)
    pts = catmull_spline(ctrl, rows)
    angs = np.linspace(0.0, 2.0 * math.pi, 8, endpoint=False)
    Q = []
    for k in range(rows):
        c = pts[k]
        tang = pts[min(rows - 1, k + 1)] - pts[max(0, k - 1)]
        tang = tang / max(float(np.linalg.norm(tang)), 1e-8)
        ux, uy = core.frame(tang)
        link_phase = (k % 3)
        # Alternate orthogonal link ellipses every 3 rows so it reads unmistakably as interlocking iron chain links!
        even = ((k // 3) % 2) == 0
        pinch = 0.52 if link_phase == 0 else 1.0
        rx = (link_r if even else wire_r * 1.45) * pinch
        ry = (wire_r * 1.45 if even else link_r) * pinch
        Q.append([c + ux * (math.cos(a) * rx) + uy * (math.sin(a) * ry) for a in angs])
    pt = _part_raw(name, Q, True, paint, rigid_joint=None if cloth_hang else rigid_joint)
    if cloth_hang:
        pt.cloth = {'start': 0, 'stiff': 0.08, 'layer': 2}
    return pt


def _mp(bg, fab, motif_name=None, fg=None, rep=None, grain=0.02):
    if motif_name:
        return P(bg, grain, [], [PN(0.0, 1.0, motif_name, fg or bg, bg, rep)], fabric=fab)
    return P(bg, grain, fabric=fab)


def _ensure_radial_clearance(outer_pt, inner_pt, min_gap=0.028, z_below=None):
    """Guarantee `outer_pt` stays at least `min_gap` m radially outside `inner_pt` at every row."""
    P_in = inner_pt.P
    P_out = outer_pt.P
    z_in = np.array([float(P_in[k, :, 2].mean()) for k in range(P_in.shape[0])], dtype=np.float64)
    for r in range(P_out.shape[0]):
        z_r = float(P_out[r, :, 2].mean())
        if z_below is not None and z_r > z_below:
            continue
        # Find nearest inner row(s) by z
        idx = int(np.argmin(np.abs(z_in - z_r)))
        c_xy = spine_at(z_r)[:2]
        d_in = P_in[idx, :, :2] - c_xy
        r_in = np.linalg.norm(d_in, axis=1)
        a_in = np.mod(np.arctan2(d_in[:, 0], d_in[:, 1]), 2.0 * math.pi)
        order = np.argsort(a_in)
        a_ext = np.concatenate([a_in[order] - 2.0 * math.pi, a_in[order], a_in[order] + 2.0 * math.pi])
        r_ext = np.tile(r_in[order], 3)
        for j in range(P_out.shape[1]):
            d2 = P_out[r, j, :2] - c_xy
            rj = float(np.linalg.norm(d2))
            aj = math.atan2(d2[0], d2[1]) % (2.0 * math.pi)
            r_want = float(np.interp(aj, a_ext, r_ext)) + min_gap
            if rj < r_want:
                u2 = d2 / rj if rj > 1e-6 else np.array([math.sin(aj), math.cos(aj)])
                P_out[r, j, :2] = c_xy + u2 * r_want


def _shroud_radius_at(shroud_pt, z_val, ang):
    """Sample radial distance of `shroud_pt` from `spine_at(z_val)` along direction `(sin(ang), cos(ang))`."""
    P_s = shroud_pt.P
    z_rows = np.array([float(P_s[k, :, 2].mean()) for k in range(P_s.shape[0])], dtype=np.float64)
    idx = int(np.argmin(np.abs(z_rows - z_val)))
    c_xy = spine_at(z_val)[:2]
    d_in = P_s[idx, :, :2] - c_xy
    r_in = np.linalg.norm(d_in, axis=1)
    a_in = np.mod(np.arctan2(d_in[:, 0], d_in[:, 1]), 2.0 * math.pi)
    order = np.argsort(a_in)
    a_ext = np.concatenate([a_in[order] - 2.0 * math.pi, a_in[order], a_in[order] + 2.0 * math.pi])
    r_ext = np.tile(r_in[order], 3)
    return float(np.interp(ang % (2.0 * math.pi), a_ext, r_ext)), c_xy


# ===============================================================================================================
# 1. SINGULARITY ARCHON — Cosmic Rift & Star-Mirror Archon (Refs #1 & #7)
# ===============================================================================================================
def _build_singularity_archon(sex):
    entries = []
    indigo_robe_p = _mp('ext_indigo', 'cloth.silk', 'ext_archon_robe', 'ext_gold')
    white_stole_p = _mp('ext_white_silk', 'cloth.silk')
    gold_p        = _mp('ext_gold', 'metal.gold')
    bright_gold_p = _mp('ext_gold_bright', 'metal.gold', grain=0.01)
    void_p        = _mp('ext_void', 'cloth.velvet', grain=0.0)
    cyan_hand_p   = _mp('ext_astral_cyan', 'stone.ammolite.opalshell')
    claw_p        = _mp('ext_obsidian', 'stone.obsidian.pancake_flaked')

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    # --- 1A. HEAD: ext_{s}_archon_corona (Severed Gilded Collar + Levitating Star-Mirror + 8-Point Eclipse Corona) ---
    gid_h = f'ext_{sex}_archon_corona'
    parts_h = []

    # Horizontal gilded astronomical bar-collar & upturned white stole scrolls seated across upper clavicle (`Neck`)
    nk = J('Neck')
    collar_z = nk[2] + 0.005
    parts_h.append(sweep_tube(
        gid_h + '_yoke_bar',
        [np.array([-0.145, -0.028, collar_z]), np.array([0.0, -0.042, collar_z]), np.array([0.145, -0.028, collar_z])],
        0.014, gold_p, n=10, rigid_joint='Neck', scale_xy=(1.0, 0.85), ref_dir=up_w
    ))
    parts_h.append(torus_ring(
        gid_h + '_neck_seal', np.array([0.0, 0.005, collar_z - 0.004]), up_w,
        0.078, 0.018, 0.012, gold_p, rigid_joint='Neck', n_major=28, n_minor=8
    ))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        scroll_pts = catmull_spline([
            np.array([sgn * 0.088, -0.032, collar_z - 0.008]),
            np.array([sgn * 0.118, -0.024, collar_z + 0.042]),
            np.array([sgn * 0.138, -0.005, collar_z + 0.068]),
            np.array([sgn * 0.112,  0.025, collar_z + 0.036]),
        ], 9)
        parts_h.append(sweep_tube(
            f'{gid_h}_scroll_{tag}', scroll_pts, [0.026, 0.022], white_stole_p,
            n=10, rigid_joint='Neck', scale_xy=(0.48, 1.35), ref_dir=left_w
        ))

    # Levitating Golden Astrological Mirror-Orb + Crescent Cradle + Crown Finial (`Head`, `kinetic: bob`)
    orb_c = a_hd + up_h * 0.095 + fwd * 0.012
    orb_gl = bl_to_gl_pt(orb_c)
    kin_orb = {'bone': 'Head', 'motion': 'bob', 'speed': 1.65, 'amp': 0.016, 'phase': 0.0, 'center_gl': orb_gl}

    # Crescent cradle & pedestal under the mirror
    parts_h.append(torus_ring(
        gid_h + '_cradle', orb_c - up_h * 0.010, fwd, 0.082, 0.012, 0.012, gold_p,
        rigid_joint='Head', arc=(-0.92 * math.pi, -0.08 * math.pi), n_major=18, n_minor=8, closed_loop=False,
        vfx={'kind': 'standard', 'kinetic': kin_orb}
    ))
    parts_h.append(torus_ring(
        gid_h + '_bezel', orb_c, fwd, 0.066, 0.010, 0.013, bright_gold_p,
        rigid_joint='Head', n_major=28, n_minor=8,
        vfx={'kind': 'standard', 'kinetic': kin_orb}
    ))
    # Star-Mirror convex cosmic lens (`nebula_rift` w/ `mirror: True`)
    parts_h.append(ellipsoid_part(
        gid_h + '_star_mirror', orb_c, (0.061, 0.024, 0.061), cyan_hand_p, 'Head',
        n=22, rows=12,
        vfx={
            'kind': 'nebula_rift', 'mirror': True,
            'core_color': '#ffffff', 'arm_color': '#96faff', 'nebula_color': '#4268ff', 'gold_color': '#ffd878',
            'galaxy_scale': 3.4, 'kinetic': kin_orb,
        }
    ))
    # Crowned astronomical finial above mirror (Ref #1)
    fin_base = orb_c + up_h * 0.072
    parts_h.append(sweep_tube(
        gid_h + '_finial_bar', [fin_base - left_h * 0.052, fin_base + left_h * 0.052],
        0.0075, gold_p, n=8, rigid_joint='Head', vfx={'kind': 'standard', 'kinetic': kin_orb}
    ))
    parts_h.append(crystal_prism(
        gid_h + '_finial_spire', fin_base + up_h * 0.042, up_h, 0.095, 0.022, bright_gold_p,
        'Head', sides=4, vfx={'kind': 'standard', 'kinetic': kin_orb}
    ))

    # Blazing 8-Point White-Gold Eclipse Corona Starburst behind the mirror (Ref #7!)
    cor_c = orb_c - fwd * 0.026
    kin_cor = {'bone': 'Head', 'motion': 'bob', 'speed': 1.65, 'amp': 0.016, 'phase': 0.25, 'center_gl': bl_to_gl_pt(cor_c)}
    corona_vfx = {'kind': 'emissive_blaze', 'color': '#fff6dc', 'gain': 2.15, 'pulse': 0.16, 'kinetic': kin_cor}
    for k_ray in range(8):
        ang_r = k_ray * (math.pi / 4.0)
        is_cardinal = (k_ray % 2 == 0)
        ray_len = (0.31 if k_ray in (0, 2, 6) else 0.24) if is_cardinal else 0.135
        ray_w = 0.018 if is_cardinal else 0.010
        r_dir = up_h * math.cos(ang_r) + left_h * math.sin(ang_r)
        parts_h.append(sweep_tube(
            f'{gid_h}_corona_ray_{k_ray}',
            [cor_c + r_dir * 0.048, cor_c + r_dir * (0.42 * ray_len), cor_c + r_dir * ray_len],
            [ray_w, ray_w * 0.55, 0.002], bright_gold_p, n=6, rigid_joint='Head',
            scale_xy=(1.0, 0.35), ref_dir=fwd, cap_ends=False, vfx=corona_vfx
        ))
        if is_cardinal and k_ray != 4:
            parts_h.append(crystal_prism(
                f'{gid_h}_corona_star_{k_ray}', cor_c + r_dir * (ray_len + 0.036), r_dir,
                0.042, 0.013, bright_gold_p, 'Head', sides=4, vfx=corona_vfx
            ))

    ent_h = assemble_garment(gid_h, 'Singularity Archon Star-Mirror & Eclipse Corona', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 1B. TORSO: ext_{s}_archon_robe (Full Ankle-Sweeping Split Indigo-Gold Kimono over Galaxy-Rift Void Skirt) ---
    gid_t = f'ext_{sex}_archon_robe'
    parts_t = []

    # 1) Inner full-height Cosmic Nebula Rift void column/bell (`nebula_rift` shader, layer=0).
    #    Uses a sleek, slightly tapered bell (`flare=0.135`) so the outer split kimono robe sweeps cleanly
    #    outside it with generous +26..34 mm radial clearance at every height from waist to ankle.
    void_tube = torso_tube(
        gid_t + '_galaxy_rift', core.TOP + 0.018, 0.030, ease=0.010, paint=void_p,
        n=40, hang_from=core.WAIST, flare=0.135, stiff=0.14, layer=0
    )
    tag_vfx(void_tube, {
        'kind': 'nebula_rift',
        'center_y': 0.96,
        'galaxy_scale': 2.55,
        'core_color': '#fff8e2',
        'arm_color': '#88f8ff',
        'nebula_color': '#4c24d8',
        'gold_color': '#ffc458',
        'void_color': '#020108',
    }, no_conform=True)
    parts_t.append(void_tube)

    # 2) Full-Length Ankle-Sweeping Open-Front Split Indigo-Violet & Gold Kimono Robe (`layer=1`).
    #    Wide front V-opening (`arc=(-0.72*pi, +0.72*pi)`, i.e. |angle - pi| > 0.88 rad) reveals the inner
    #    spiral galaxy cleanly from chest to ankle, with synchronized cloth `chains` (`hang_from=core.WAIST`,
    #    identical `stiff=0.14`) and guaranteed +26..34 mm radial clearance outside `void_tube` at every row!
    outer_robe = torso_tube(
        gid_t + '_split_robe', core.TOP + 0.008, 0.042, ease=0.038, paint=indigo_robe_p,
        n=40, arc=(-0.72 * math.pi, 0.72 * math.pi),
        hang_from=core.WAIST, flare=0.175, stiff=0.14, layer=1
    )
    # Enforce smooth +26 mm (chest/waist) ramping to +34 mm (ankle) radial clearance over `void_tube`
    _ensure_radial_clearance(outer_robe, void_tube, min_gap=0.026)
    _ensure_radial_clearance(outer_robe, void_tube, min_gap=0.030, z_below=core.WAIST + 0.02)
    _ensure_radial_clearance(outer_robe, void_tube, min_gap=0.034, z_below=core.KNEE + 0.08)
    outer_robe.no_conform = True
    parts_t.append(outer_robe)

    # 2B) Open-Front Gilded Astral Waist Cincture wrapping cleanly outside the split kimono panels
    waist_cincture = torso_tube(
        gid_t + '_waist_cincture', core.WAIST + 0.032, core.WAIST - 0.010, ease=0.046, paint=gold_p,
        n=36, rows=5, arc=(-0.72 * math.pi, 0.72 * math.pi)
    )
    _ensure_radial_clearance(waist_cincture, outer_robe, min_gap=0.008)
    waist_cincture.no_conform = True
    parts_t.append(waist_cincture)

    # 3) Wide Draped Indigo Kimono Bell-Sleeves (`wide=True`)
    slvs = sleeves(gid_t, 'wrist', 0.022, indigo_robe_p, ease_end=0.115, rows=12, n=24, rmax=0.20, wide=True)
    for sp in slvs:
        sp.no_conform = True
    parts_t.extend(slvs)

    # 4) Twin Hanging White Astral Stole Ribbons + Golden Sun & Crescent-Moon Pendulums framing the chest rift (Ref #1!)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        x_st = sgn * 0.096
        z_hi = core.TOP + 0.004
        z_lo = core.WAIST - 0.045
        zs_s = np.linspace(z_hi, z_lo, 10)
        st_pts = [chest_front(zv, 0.042, x=x_st * (1.0 + 0.08 * (z_hi - zv))) for zv in zs_s]
        parts_t.append(sweep_tube(
            f'{gid_t}_stole_{tag}', st_pts, [0.024, 0.028], white_stole_p,
            n=8, rigid_joint='Spine2', scale_xy=(1.35, 0.24), ref_dir=left_w, cap_ends=False
        ))
        ring_c = st_pts[-1] - up_w * 0.024
        parts_t.append(torus_ring(
            f'{gid_t}_stole_ring_{tag}', ring_c, fwd, 0.026, 0.005, 0.005, gold_p,
            rigid_joint='Spine1', n_major=18, n_minor=6
        ))
        pend_c = ring_c - up_w * 0.042
        if tag == 'R':
            # Golden Sun-Orb Pendulum on right stole (viewer's left in Ref #1!)
            parts_t.append(ellipsoid_part(
                f'{gid_t}_sun_orb', pend_c, (0.026, 0.018, 0.026), bright_gold_p, 'Spine1', n=14, rows=8
            ))
        else:
            # Golden Crescent-Moon Pendulum on left stole (viewer's right in Ref #1!)
            parts_t.append(torus_ring(
                f'{gid_t}_moon_crescent', pend_c, fwd, 0.025, 0.007, 0.006, bright_gold_p,
                rigid_joint='Spine1', arc=(-0.65 * math.pi, 0.65 * math.pi), n_major=16, n_minor=6, closed_loop=False
            ))

    ent_t = assemble_garment(
        gid_t, 'Singularity Archon Cosmic Galaxy-Rift Robes', 'torso', parts_t, open_torso=True,
        auras=[{'kind': 'gravity_lens', 'bone': 'Spine2', 'offset': [0.0, -0.04, 0.0]}]
    )
    ent_t['hide_parts'] = ['Human.nipple', 'Human.toenails']
    # Hide entire torso, hips, legs, and feet so ONLY the infinite galaxy void exists inside the robes!
    body_non_arm = select_body_tris(
        ('Hips', 'Spine', 'Neck', 'Head', 'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg', 'LeftFoot', 'RightFoot', 'LeftToe', 'RightToe'),
        weight_thresh=0.15, mode='any'
    )
    apply_custom_hide(ent_t, body_non_arm, replace=True)
    entries.append(ent_t)

    # --- 1C. BACK: ext_{s}_archon_ribbons (Floating White-Gold Astral Corona Ribbons — Ref #7) ---
    gid_b = f'ext_{sex}_archon_ribbons'
    parts_b = []
    sp2 = J('Spine2')
    rib_vfx_base = {'kind': 'emissive_blaze', 'color': '#fff8e6', 'gain': 1.75, 'pulse': 0.14}
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        for idx_r, (z_off, span_x, drop_z) in enumerate(((0.10, 0.34, 0.42), (-0.06, 0.44, 0.62))):
            r_ctrl = [
                sp2 + np.array([sgn * 0.11, 0.085, z_off]),
                sp2 + np.array([sgn * (0.18 + 0.45 * span_x), 0.115, z_off - 0.32 * drop_z]),
                sp2 + np.array([sgn * (0.12 + span_x), 0.095, z_off - 0.72 * drop_z]),
                sp2 + np.array([sgn * (0.06 + 0.85 * span_x), 0.075, z_off - drop_z]),
            ]
            r_pts = catmull_spline(r_ctrl, 12)
            vfx_r = dict(rib_vfx_base, kinetic={
                'bone': 'Spine2', 'motion': 'bob', 'speed': 1.45, 'amp': 0.020,
                'phase': idx_r * 1.2 + (0.0 if sgn > 0 else 0.6),
                'center_gl': bl_to_gl_pt(r_pts[0]),
            })
            parts_b.append(sweep_tube(
                f'{gid_b}_ribbon_{tag}_{idx_r}', r_pts, [0.004, 0.024, 0.016, 0.002] if False else np.sin(np.linspace(0.12, math.pi - 0.08, 12)) * 0.022,
                bright_gold_p, n=8, rigid_joint='Spine2', scale_xy=(1.5, 0.18), ref_dir=fwd, cap_ends=False, vfx=vfx_r
            ))
    entries.append(assemble_garment(gid_b, 'Singularity Archon Floating Astral Ribbons', 'back', parts_b))

    # --- 1D. GLOVES: ext_{s}_archon_hands (Translucent Pale-Cyan Fresnel Astral Hands & Obsidian Talons — Ref #1) ---
    gid_g = f'ext_{sex}_archon_hands'
    parts_g = []
    hand_vfx = {
        'kind': 'fresnel_ghost',
        'core_color': '#2b6a78',
        'rim_color': '#98fcff',
        'accent_color': '#e0ffff',
        'opacity': 0.80,
        'power': 2.0,
        'rim_gain': 1.95,
        'depth_write': True,
    }
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        sh, el, wr = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        # Sculpted astral upper-to-forearm & palm replacement
        arm_shell = limb_tube(
            f'{gid_g}_forearm_{side}', el - (el - sh) * 0.35, wr + u_fa * 0.02, 0.005,
            cyan_hand_p, n=18, rows=9, bvh=core.BVH_A, role='armwear', side=side[0]
        )
        tag_vfx(arm_shell, hand_vfx)
        parts_g.append(arm_shell)

        palm_end = wr + u_fa * 0.082
        parts_g.append(sweep_tube(
            f'{gid_g}_palm_{side}', [wr - u_fa * 0.010, palm_end], [0.034, 0.036],
            cyan_hand_p, n=12, rigid_joint=side + 'Hand', scale_xy=(1.18, 0.56), ref_dir=up_w, vfx=hand_vfx
        ))
        side_ax = np.cross(u_fa, np.array([0.0, 1.0, 0.0]))
        side_ax = side_ax / max(float(np.linalg.norm(side_ax)), 1e-6)
        for fi, off_f in enumerate((-0.026, -0.009, 0.009, 0.026)):
            f_len = 0.078 if fi in (1, 2) else 0.068
            f_r0 = palm_end - u_fa * 0.008 + side_ax * off_f
            f_r1 = f_r0 + u_fa * (0.58 * f_len) + fwd * 0.008
            f_r2 = f_r1 + u_fa * (0.42 * f_len) + fwd * 0.018
            parts_g.append(sweep_tube(
                f'{gid_g}_finger_{side}_{fi}', [f_r0, f_r1, f_r2], [0.0095, 0.0072, 0.0038],
                cyan_hand_p, n=8, rigid_joint=side + 'Hand', vfx=hand_vfx
            ))
            parts_g.append(sweep_tube(
                f'{gid_g}_talon_{side}_{fi}', [f_r2 - u_fa * 0.004, f_r2 + u_fa * 0.024 + fwd * 0.010],
                [0.0045, 0.0008], claw_p, n=6, rigid_joint=side + 'Hand', cap_ends=False
            ))
        # Thumb + obsidian talon
        th0 = wr + u_fa * 0.026 + side_ax * (0.032 * sgn) + fwd * 0.010
        th1 = th0 + u_fa * 0.045 + side_ax * (0.016 * sgn) + fwd * 0.014
        parts_g.append(sweep_tube(
            f'{gid_g}_thumb_{side}', [th0, th1], [0.0105, 0.0052], cyan_hand_p, n=8, rigid_joint=side + 'Hand', vfx=hand_vfx
        ))
        parts_g.append(sweep_tube(
            f'{gid_g}_thumb_talon_{side}', [th1, th1 + u_fa * 0.022 + fwd * 0.008],
            [0.0048, 0.0008], claw_p, n=6, rigid_joint=side + 'Hand', cap_ends=False
        ))

    ent_g = assemble_garment(gid_g, 'Singularity Archon Translucent Astral Hands', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    apply_custom_hide(
        ent_g,
        select_body_tris(('LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand'), weight_thresh=0.18, mode='any'),
        replace=True
    )
    entries.append(ent_g)
    return entries


# ===============================================================================================================
# 2. CENSER REVENANT — Decapitated Smoke-Plume Knight & Lantern Wraith (Refs #2, #4 & #12)
# ===============================================================================================================
def _build_censer_revenant(sex):
    entries = []
    plate_p   = _mp('ext_darkiron', 'metal.iron', 'ext_gothic_plate', 'ext_gold')
    coat_p    = _mp('ext_soot', 'cloth.wool.fulled', 'ext_tatter_coat', 'ext_gold')
    iron_p    = _mp('ext_darkiron', 'metal.iron')
    soot_p    = _mp('ext_void', 'cloth.velvet', grain=0.0)
    gold_p    = _mp('ext_gold', 'metal.gold')
    lantern_p = _mp('ext_cyan_blaze', 'glass.moonglass.leaded', grain=0.0)
    ember_p   = _mp('ext_violet_glow', 'beads.glass', grain=0.0)

    up_w = np.array([0.0, 0.0, 1.0])
    fwd  = np.array([0.0, -1.0, 0.0])
    left_w = np.array([1.0, 0.0, 0.0])

    # --- 2A. HEAD: ext_{s}_revenant_gorget (Scorched Gothic Severed Gorget + Billowing Chimney-Smoke Plume) ---
    gid_h = f'ext_{sex}_revenant_gorget'
    parts_h = []
    nk = J('Neck')
    # Layered gothic steel & gold neck-stump gorget rings
    for k_r, (dz_g, rad_g, p_use) in enumerate((
        (-0.022, 0.098, plate_p),
        (-0.004, 0.084, gold_p),
        ( 0.014, 0.072, plate_p),
    )):
        parts_h.append(torus_ring(
            f'{gid_h}_gorget_{k_r}', np.array([0.0, 0.006, nk[2] + dz_g]), up_w,
            rad_g, 0.018, 0.015, p_use, rigid_joint='Neck', n_major=28, n_minor=8
        ))
    # Scorched furnace throat-well glowing softly inside the severed neck
    parts_h.append(ellipsoid_part(
        gid_h + '_throat_furnace', np.array([0.0, 0.006, nk[2] + 0.012]), (0.062, 0.056, 0.014),
        ember_p, 'Neck', n=18, rows=6,
        vfx={'kind': 'emissive_blaze', 'color': '#6e32c8', 'gain': 1.45, 'pulse': 0.25}
    ))

    smoke_emitters_h = [
        # Main diagonal billowing black-soot & violet-ember chimney smoke column (Ref #12!)
        {
            'bone': 'Neck',
            'offset': [0.0, 0.02, 0.0],
            'count': 58,
            'rate': 0.36,
            'size0': 0.115,
            'size1': 0.385,
            'drift': [0.28, 0.58, -0.06],
            'spread': 0.062,
            'opacity': 0.96,
            'ember_color': '#7432e2',
            'core_color': '#050408',
            'mist_color': '#7c7a88',
        },
        # Secondary shoulder soot-smoke wisps (Ref #2!)
        {
            'bone': 'LeftArm',
            'offset': [0.03, 0.03, 0.0],
            'count': 20,
            'rate': 0.32,
            'size0': 0.065,
            'size1': 0.190,
            'drift': [0.14, 0.28, -0.04],
            'spread': 0.038,
            'opacity': 0.58,
            'ember_color': '#4a1e90',
            'core_color': '#08070d',
            'mist_color': '#666472',
        },
        {
            'bone': 'RightArm',
            'offset': [-0.03, 0.03, 0.0],
            'count': 20,
            'rate': 0.32,
            'size0': 0.065,
            'size1': 0.190,
            'drift': [-0.10, 0.28, -0.04],
            'spread': 0.038,
            'opacity': 0.58,
            'ember_color': '#4a1e90',
            'core_color': '#08070d',
            'mist_color': '#666472',
        },
    ]
    ent_h = assemble_garment(gid_h, 'Censer Revenant Severed Gorget & Chimney Smoke', 'head', parts_h,
                             emitters=smoke_emitters_h, covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.18, mode='any'))
    entries.append(ent_h)

    # --- 2B. TORSO: ext_{s}_revenant_plate (Sculpted Gothic Blackened-Iron Breastplate, Faulds & Pauldrons) ---
    gid_t = f'ext_{sex}_revenant_plate'
    parts_t = []

    # Sculpted 3D gothic blackened-iron breastplate + articulated fauld hoops cropped cleanly at waist (`WAIST - 0.02`)
    # so the torso plate NEVER overlaps or clips with `ext_{s}_revenant_chains` below the waist!
    cuir_parts = cuirass_plate(
        gid_t, plate_p, trim_paint=gold_p, style='gothic',
        z_top=core.TOP + 0.004, z_bot=core.WAIST - 0.020,
        ease=0.026, keel=0.020, faulds=2, n=42, rows=18
    )
    for cp in cuir_parts:
        cp.no_conform = True
    parts_t.extend(cuir_parts)

    # Armored gothic sleeves + multi-lame articulated shoulder pauldrons (full metallic PBR!)
    arm_slvs = sleeves(gid_t, 'wrist', 0.020, plate_p, ease_end=0.032, rows=10, n=20)
    for sp in arm_slvs:
        sp.no_conform = True
    parts_t.extend(arm_slvs)

    for side in ('Left', 'Right'):
        pld_parts = articulated_pauldron(gid_t, side, plate_p, trim_paint=gold_p, lames=3, haute_piece=True, ease=0.024)
        for pp in pld_parts:
            pp.no_conform = True
        parts_t.extend(pld_parts)

    # Ornate waist clasp + cropped gothic chest stole-straps ending cleanly at `core.WAIST - 0.02`
    # Use smooth body-transferred spine skinning (`rigid_joint=None`) and flush chest/waist offsets
    # so the clasp and stoles bend cleanly in lockstep with `cuirass_plate` during animation!
    buckle_c = chest_front(core.WAIST - 0.002, 0.034)
    parts_t.append(torus_ring(
        gid_t + '_belt_clasp', buckle_c, fwd, 0.026, 0.008, 0.007, gold_p, rigid_joint=None, n_major=16, n_minor=6
    ))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        lap_pts = [
            chest_front(core.CHEST + 0.075, 0.038, x=sgn * 0.072),
            chest_front(core.CHEST - 0.035, 0.040, x=sgn * 0.068),
            chest_front(core.WAIST - 0.020, 0.034, x=sgn * 0.064),
        ]
        parts_t.append(sweep_tube(
            f'{gid_t}_stole_{tag}', catmull_spline(lap_pts, 8), [0.020, 0.022],
            plate_p, n=8, rigid_joint=None, scale_xy=(1.35, 0.22), ref_dir=left_w, cap_ends=False
        ))

    # Chest chains draped proudly across the gothic breastplate keel
    parts_t.append(chain_strand(
        gid_t + '_chest_chain_hi',
        chest_front(core.CHEST + 0.055, 0.050, x=-0.108),
        chest_front(core.CHEST + 0.055, 0.050, x=0.108),
        np.array([0.0, -0.026, -0.055]), 8, 0.010, 0.0035, iron_p, rigid_joint='Spine2'
    ))

    ent_t = assemble_garment(gid_t, 'Censer Revenant Gothic Half-Plate & Eroding Shroud', 'torso', parts_t)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 2C. BACK: ext_{s}_revenant_lanterns (3 Glowing Wrought-Iron Gothic Street-Lanterns on Stalks — Ref #4) ---
    gid_b = f'ext_{sex}_revenant_lanterns'
    parts_b = []
    sp2 = J('Spine2')
    lantern_configs = [
        ('L', np.array([ 0.21, 0.14, core.TOP + 0.14]), 0.92),
        ('C', np.array([ 0.00, 0.17, core.TOP + 0.29]), 1.05),
        ('R', np.array([-0.21, 0.14, core.TOP + 0.11]), 0.90),
    ]
    flame_vfx = {'kind': 'emissive_blaze', 'color': '#98b8ff', 'gain': 2.25, 'pulse': 0.22}
    for tag, top_pt, sc_l in lantern_configs:
        root_pt = sp2 + np.array([top_pt[0] * 0.42, 0.10, -0.02])
        mid_pt  = 0.5 * (root_pt + top_pt) + np.array([top_pt[0] * 0.16, 0.04, 0.04])
        # Wrought-iron chain stalk rising from dorsal harness to lantern base
        parts_b.append(chain_strand(
            f'{gid_b}_stalk_{tag}', root_pt, top_pt, mid_pt - 0.5 * (root_pt + top_pt),
            9, 0.013, 0.0048, iron_p, rigid_joint='Spine2'
        ))
        # Tapered 4-sided gothic wrought-iron lantern cage + steeple roof + glowing spirit core!
        lc = top_pt + up_w * (0.075 * sc_l)
        parts_b.append(crystal_prism(
            f'{gid_b}_glass_{tag}', lc, up_w, 0.125 * sc_l, 0.044 * sc_l,
            lantern_p, 'Spine2', sides=4, vfx=flame_vfx
        ))
        # Iron base & roof eaves + spire finial
        parts_b.append(crystal_prism(
            f'{gid_b}_base_{tag}', lc - up_w * (0.068 * sc_l), up_w, 0.036 * sc_l, 0.052 * sc_l,
            iron_p, 'Spine2', sides=4
        ))
        parts_b.append(crystal_prism(
            f'{gid_b}_roof_{tag}', lc + up_w * (0.082 * sc_l), up_w, 0.078 * sc_l, 0.062 * sc_l,
            iron_p, 'Spine2', sides=4
        ))
        for c_i in range(4):
            ca = (c_i + 0.5) * (math.pi / 2.0)
            off_c = np.array([math.cos(ca), math.sin(ca), 0.0]) * (0.046 * sc_l)
            parts_b.append(sweep_tube(
                f'{gid_b}_bar_{tag}_{c_i}',
                [lc - up_w * (0.055 * sc_l) + off_c * 0.78, lc + up_w * (0.058 * sc_l) + off_c * 1.05],
                0.0045, iron_p, n=6, rigid_joint='Spine2'
            ))
        # Hanging iron chain tail below outer lanterns (Ref #4)
        if tag in ('L', 'R'):
            parts_b.append(chain_strand(
                f'{gid_b}_dropchain_{tag}',
                top_pt - up_w * 0.02,
                np.array([top_pt[0] * 1.18, 0.06, core.WAIST - 0.08]),
                np.array([top_pt[0] * 0.14, 0.03, -0.04]),
                10, 0.012, 0.0042, iron_p, rigid_joint='Spine2'
            ))

    entries.append(assemble_garment(gid_b, 'Censer Revenant Tri-Lantern Wrought-Iron Dorsal Rig', 'back', parts_b))

    # --- 2D. GLOVES: ext_{s}_revenant_gauntlets (Dark-Iron & Gold Gothic Plate Gauntlets — Ref #12) ---
    gid_g = f'ext_{sex}_revenant_gauntlets'
    parts_g = []
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        parts_g.append(sweep_tube(
            f'{gid_g}_vambrace_{side}', [el + d_fa * 0.18, wr + u_fa * 0.015], [0.052, 0.041],
            plate_p, n=12, rigid_joint=side + 'ForeArm'
        ))
        parts_g.append(torus_ring(
            f'{gid_g}_cuff_{side}', el + d_fa * 0.18, u_fa, 0.054, 0.010, 0.012,
            gold_p, rigid_joint=side + 'ForeArm', n_major=18, n_minor=6
        ))
        palm_end = wr + u_fa * 0.082
        parts_g.append(sweep_tube(
            f'{gid_g}_mitt_{side}', [wr - u_fa * 0.008, palm_end], [0.038, 0.035],
            plate_p, n=10, rigid_joint=side + 'Hand', scale_xy=(1.15, 0.58), ref_dir=up_w
        ))
        side_ax = np.cross(u_fa, np.array([0.0, 1.0, 0.0]))
        side_ax = side_ax / max(float(np.linalg.norm(side_ax)), 1e-6)
        for fi, off_f in enumerate((-0.025, -0.008, 0.008, 0.025)):
            f0 = palm_end - u_fa * 0.010 + side_ax * off_f
            f1 = f0 + u_fa * 0.068 + fwd * 0.018
            parts_g.append(sweep_tube(
                f'{gid_g}_finger_{side}_{fi}', [f0, f1], [0.010, 0.006], plate_p, n=6, rigid_joint=side + 'Hand'
            ))
    ent_g = assemble_garment(gid_g, 'Censer Revenant Gothic Plate Gauntlets', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 2E. LEGS: ext_{s}_revenant_chains (Dangling Wrought-Iron Chains & Eroding Wraith Shroud — Refs #4 & #12) ---
    gid_l = f'ext_{sex}_revenant_chains'
    parts_l = []
    # Single clean alpha-eroding pleated wraith shroud (`layer=0`), tucked neatly under the gothic faulds (`ease=0.002`)
    inner_wraith = torso_tube(
        gid_l + '_shadow_core', core.WAIST - 0.018, 0.045, ease=0.002, paint=coat_p,
        n=38, hang_from=core.WAIST - 0.024, flare=0.145, jagged=0.075, stiff=0.12, layer=0
    )
    tag_vfx(inner_wraith, {
        'kind': 'alpha_erosion',
        'y_top': 0.56,
        'y_bot': 0.04,
        'edge_color': '#6234b8',
        'smoke_color': '#07060b',
        'swirl': -0.45,
    }, no_conform=True)
    parts_l.append(inner_wraith)

    # 6 dangling wrought-iron chains (`layer=2`) radially separated >= +0.028 m outside the shroud at every height!
    z_ch_top = core.WAIST - 0.045
    for k_c in range(6):
        ang_c = (k_c / 6.0) * 2.0 * math.pi + 0.35
        z_ch_bot = 0.07 + 0.04 * (k_c % 2)
        r_sh_top, c_top = _shroud_radius_at(inner_wraith, z_ch_top, ang_c)
        r_sh_bot, c_bot = _shroud_radius_at(inner_wraith, z_ch_bot, ang_c)
        r_top = r_sh_top + 0.028
        r_bot = r_sh_bot + 0.036
        p_top = np.array([c_top[0] + math.sin(ang_c) * r_top, c_top[1] + math.cos(ang_c) * r_top, z_ch_top])
        p_bot = np.array([c_bot[0] + math.sin(ang_c) * r_bot, c_bot[1] + math.cos(ang_c) * r_bot, z_ch_bot])
        parts_l.append(chain_strand(
            f'{gid_l}_hang_chain_{k_c}', p_top, p_bot,
            np.array([math.sin(ang_c) * 0.026, math.cos(ang_c) * 0.026, 0.0]),
            11, 0.012, 0.0042, iron_p, cloth_hang=True
        ))
    # Swagged horizontal hem-loops of chain draped cleanly >= +0.038 m outside the eroding shroud (Ref #12!)
    z_sw = 0.28
    for k_sw in range(4):
        a0 = k_sw * (math.pi / 2.0)
        a1 = (k_sw + 1) * (math.pi / 2.0)
        am = 0.5 * (a0 + a1)
        r0, c_sw0 = _shroud_radius_at(inner_wraith, z_sw, a0)
        r1, c_sw1 = _shroud_radius_at(inner_wraith, z_sw, a1)
        p0 = np.array([c_sw0[0] + math.sin(a0) * (r0 + 0.038), c_sw0[1] + math.cos(a0) * (r0 + 0.038), z_sw])
        p1 = np.array([c_sw1[0] + math.sin(a1) * (r1 + 0.038), c_sw1[1] + math.cos(a1) * (r1 + 0.038), z_sw])
        parts_l.append(chain_strand(
            f'{gid_l}_swag_chain_{k_sw}', p0, p1,
            np.array([math.sin(am) * 0.055, math.cos(am) * 0.055, -0.085]),
            8, 0.011, 0.0040, iron_p, rigid_joint='Hips'
        ))

    hem_smoke = [{
        'bone': 'Hips',
        'offset': [0.0, -0.78, 0.0],
        'count': 28,
        'rate': 0.28,
        'size0': 0.16,
        'size1': 0.34,
        'drift': [0.06, 0.26, -0.04],
        'spread': 0.14,
        'opacity': 0.56,
        'ember_color': '#4c268c',
        'core_color': '#07060b',
        'mist_color': '#565464',
    }]
    ent_l = assemble_garment(gid_l, 'Censer Revenant Hanging Chains & Shadow Shroud', 'legs', parts_l, emitters=hem_smoke)
    hide_full_body(ent_l)
    entries.append(ent_l)
    return entries


# ===============================================================================================================
# 3. VOX SOLUS — Fragmented Floating-Shard & Torus-Head Construct (Refs #5 & #6 `VOX SOLUS_B001`)
# ===============================================================================================================
def _build_vox_solus(sex):
    entries = []
    shard_dk_p = _mp('ext_obsidian', 'metal.paktong.brushed', 'ext_vox_shard', 'ext_platinum')
    shard_lt_p = _mp('ext_titanium', 'metal.paktong.brushed', 'ext_vox_shard', 'ext_platinum')
    gem_amb_p  = _mp('ext_amber_gem', 'stone.ammolite.opalshell', grain=0.01)
    gem_cyn_p  = _mp('ext_astral_cyan', 'stone.ammolite.opalshell', grain=0.01)
    gem_vio_p  = _mp('ext_amethyst_gem', 'stone.ammolite.opalshell', grain=0.01)
    tether_p   = _mp('ext_cyan_blaze', 'beads.glass', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])

    # --- 3A. HEAD: ext_{s}_vox_torus (Sweeping Brushed-Platinum Crescent Torus Ribbon + Floating Orb — Refs #5 & #6) ---
    gid_h = f'ext_{sex}_vox_torus'
    parts_h = []
    halo_c = a_hd + up_h * 0.145
    kin_halo = {'bone': 'Head', 'motion': 'bob', 'speed': 1.5, 'amp': 0.015, 'phase': 0.0, 'center_gl': bl_to_gl_pt(halo_c)}

    # Sweeping sculptural S-crescent ribbon rising from empty neck space into an open horizontal halo (Ref #6!)
    ribbon_ctrl = [
        a_hd - up_h * 0.065 + left_h * 0.018 + fwd * 0.010,
        a_hd + up_h * 0.025 - left_h * 0.065 + fwd * 0.025,
        halo_c - left_h * 0.145 + fwd * 0.035,
        halo_c - fwd * 0.105,
        halo_c + left_h * 0.135 + fwd * 0.025,
        halo_c + left_h * 0.065 + fwd * 0.095 - up_h * 0.028,
    ]
    r_pts = catmull_spline(ribbon_ctrl, 22)
    r_prof = 0.004 + 0.024 * np.sin(np.linspace(0.08, math.pi - 0.10, 22)) ** 0.75
    parts_h.append(sweep_tube(
        gid_h + '_crescent_torus', r_pts, r_prof, shard_lt_p, n=10, rigid_joint='Head',
        scale_xy=(1.55, 0.30), ref_dir=up_h, cap_ends=False,
        vfx={'kind': 'standard', 'kinetic': kin_halo}
    ))

    # Suspended metallic-pearl sphere levitating in the open air beneath the halo (Ref #6!)
    orb_p = halo_c - up_h * 0.052 + left_h * 0.024 + fwd * 0.022
    parts_h.append(ellipsoid_part(
        gid_h + '_floating_orb', orb_p, (0.032, 0.032, 0.032), shard_dk_p, 'Head', n=18, rows=12,
        vfx={
            'kind': 'fresnel_ghost', 'core_color': '#181622', 'rim_color': '#a8f8ff',
            'accent_color': '#ff9e68', 'opacity': 0.94, 'power': 1.8, 'prism': 0.65, 'depth_write': True,
            'kinetic': {'bone': 'Head', 'motion': 'crystal_float', 'speed': 2.1, 'amp': 0.012, 'phase': 1.1, 'center_gl': bl_to_gl_pt(orb_p)},
        }
    ))

    ent_h = assemble_garment(gid_h, 'Vox Solus Sweeping Crescent Torus & Floating Orb', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(ALL_BODY_HIDE_PARTS)
    apply_custom_hide(ent_h, np.arange(len(core.BT), dtype=np.int32), replace=True)
    entries.append(ent_h)

    # --- 3B. TORSO: ext_{s}_vox_shards (Open Spiral Obsidian-Chrome Rib-Blade + 3 Polychrome Nebula Crystals — Ref #6) ---
    gid_t = f'ext_{sex}_vox_shards'
    parts_t = []

    # Primary sweeping S-spiral obsidian-titanium blade wrapping diagonally through empty chest air!
    s_blade_ctrl = [
        np.array([ 0.155, -0.015, core.SHOULDER + 0.035]),
        np.array([ 0.045, -0.085, core.CHEST + 0.045]),
        np.array([-0.095, -0.115, core.CHEST - 0.035]),
        np.array([ 0.025, -0.105, core.WAIST + 0.065]),
        np.array([ 0.115, -0.055, core.WAIST - 0.015]),
        np.array([-0.035, -0.075, core.CROTCH + 0.055]),
    ]
    sb_pts = catmull_spline(s_blade_ctrl, 20)
    sb_rad = 0.006 + 0.030 * np.sin(np.linspace(0.10, math.pi - 0.10, 20)) ** 0.7
    parts_t.append(sweep_tube(
        gid_t + '_spiral_blade', sb_pts, sb_rad, shard_dk_p, n=10, rigid_joint='Spine2',
        scale_xy=(1.55, 0.36), ref_dir=up_w, twist=0.85, cap_ends=False
    ))

    # Detached floating clavicle & ribcage splinters with open air gaps between every piece (Ref #6!)
    rib_shards = [
        ('clav_R', 'Spine2', [np.array([-0.195, -0.010, core.SHOULDER + 0.015]), np.array([-0.095, -0.048, core.SHOULDER + 0.042]), np.array([-0.035, -0.065, core.SHOULDER + 0.020])], 0.018, shard_lt_p),
        ('rib_R1', 'Spine2', [np.array([-0.135,  0.045, core.CHEST + 0.020]), np.array([-0.145, -0.045, core.CHEST - 0.005]), np.array([-0.085, -0.090, core.CHEST - 0.025])], 0.014, shard_dk_p),
        ('rib_L1', 'Spine1', [np.array([ 0.140,  0.040, core.WAIST + 0.110]), np.array([ 0.150, -0.040, core.WAIST + 0.085]), np.array([ 0.085, -0.085, core.WAIST + 0.070])], 0.014, shard_lt_p),
        ('rib_R2', 'Spine1', [np.array([-0.120,  0.035, core.WAIST + 0.045]), np.array([-0.125, -0.045, core.WAIST + 0.025]), np.array([-0.065, -0.082, core.WAIST + 0.015])], 0.013, shard_dk_p),
        ('dorsal_spine', 'Spine2', [np.array([0.0, 0.105, core.SHOULDER + 0.01]), np.array([0.018, 0.118, core.CHEST - 0.02]), np.array([-0.015, 0.105, core.WAIST + 0.04])], 0.019, shard_dk_p),
    ]
    for rname, rjoint, rctrl, rrad, rpaint in rib_shards:
        pts_r = catmull_spline(rctrl, 9)
        prof_r = 0.003 + rrad * np.sin(np.linspace(0.12, math.pi - 0.12, 9))
        parts_t.append(sweep_tube(
            f'{gid_t}_{rname}', pts_r, prof_r, rpaint, n=8, rigid_joint=rjoint, scale_xy=(1.4, 0.35), cap_ends=False
        ))

    # 3 Hovering Polychrome Prismatic Nebula Crystals inside the open chest air (Ref #6!)
    crystals = [
        # Central hero crystal: teal-cyan to blazing amber-gold
        ('gem_main', 'Spine2', np.array([ 0.015, -0.045, core.CHEST + 0.015]), np.array([-0.28, -0.15, 0.95]), 0.195, 0.042, gem_amb_p,
         '#ff8c1a', '#48f8ff', '#ffe078', 0.3),
        # Upper-right sapphire-gold shard
        ('gem_upper', 'Spine2', np.array([-0.068, -0.038, core.SHOULDER + 0.015]), np.array([-0.15, -0.10, 0.98]), 0.145, 0.030, gem_cyn_p,
         '#1a4cff', '#78ecff', '#ffbe48', 1.7),
        # Lower amethyst-crimson nebula shard
        ('gem_lower', 'Spine1', np.array([ 0.048, -0.042, core.WAIST + 0.025]), np.array([ 0.22, -0.12, 0.96]), 0.135, 0.028, gem_vio_p,
         '#6a18d8', '#ff4878', '#98dcff', 3.1),
    ]
    for gname, gjoint, gc, gax, gh, gr, gp, c_core, c_rim, c_acc, gph in crystals:
        parts_t.append(crystal_prism(
            f'{gid_t}_{gname}', gc, gax, gh, gr, gp, gjoint, sides=6,
            vfx={
                'kind': 'fresnel_ghost',
                'core_color': c_core, 'rim_color': c_rim, 'accent_color': c_acc,
                'opacity': 0.72, 'power': 1.75, 'rim_gain': 2.1, 'prism': 0.90, 'depth_write': False,
                'kinetic': {'bone': gjoint, 'motion': 'crystal_float', 'speed': 1.85, 'amp': 0.014, 'phase': gph, 'center_gl': bl_to_gl_pt(gc)},
            }
        ))

    # Faint translucent cyan/violet energy tether filaments bridging shoulder & hip gaps
    tether_vfx = {
        'kind': 'fresnel_ghost', 'core_color': '#1a3878', 'rim_color': '#6cf8ff',
        'accent_color': '#b068ff', 'opacity': 0.48, 'power': 1.4, 'rim_gain': 2.2, 'depth_write': False,
    }
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        sh_j = J(('Left' if sgn > 0 else 'Right') + 'Arm')
        parts_t.append(sweep_tube(
            f'{gid_t}_tether_sh_{tag}',
            [np.array([sgn * 0.11, -0.02, core.SHOULDER + 0.01]), sh_j + np.array([sgn * 0.02, 0.0, -0.02])],
            0.0045, tether_p, n=6, rigid_joint='Spine2', vfx=tether_vfx
        ))

    ent_t = assemble_garment(gid_t, 'Vox Solus Spiral Shard Ribcage & Polychrome Crystals', 'torso', parts_t, open_torso=True)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 3C. GLOVES: ext_{s}_vox_arms (Disconnected Floating Obsidian-Chrome Arm Shards & Razor-Talon Hands) ---
    gid_g = f'ext_{sex}_vox_arms'
    parts_g = []
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        sh, el, wr = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')
        d_up = el - sh
        u_up = d_up / max(float(np.linalg.norm(d_up)), 1e-6)
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        out_lat = np.array([sgn * 0.018, 0.012, 0.0])

        # Detached curved upper-arm shard (`f = 0.16 .. 0.80` -> crisp open air gaps at shoulder & elbow!)
        up_pts = catmull_spline([
            sh + d_up * 0.16 + out_lat * 1.3,
            sh + d_up * 0.48 + out_lat * 1.8 + np.array([0.0, 0.015, 0.0]),
            sh + d_up * 0.80 + out_lat * 0.8,
        ], 10)
        up_prof = 0.005 + 0.032 * np.sin(np.linspace(0.14, math.pi - 0.10, 10)) ** 0.75
        parts_g.append(sweep_tube(
            f'{gid_g}_up_shard_{side}', up_pts, up_prof, shard_dk_p, n=9,
            rigid_joint=side + 'Arm', scale_xy=(0.75, 1.35), cap_ends=False
        ))

        # Detached sculpted forearm blade-shard (`f = 0.18 .. 0.92` -> open elbow gap!)
        fa_pts = catmull_spline([
            el + d_fa * 0.18 - out_lat * 0.6,
            el + d_fa * 0.56 + out_lat * 1.1 - fwd * 0.012,
            el + d_fa * 0.94 + out_lat * 0.3,
        ], 10)
        fa_prof = 0.005 + 0.028 * np.sin(np.linspace(0.12, math.pi - 0.12, 10)) ** 0.75
        parts_g.append(sweep_tube(
            f'{gid_g}_fa_shard_{side}', fa_pts, fa_prof, shard_lt_p, n=9,
            rigid_joint=side + 'ForeArm', scale_xy=(0.80, 1.35), cap_ends=False
        ))

        # Sculpted metacarpal shard + 5 razor-sharp articulated construct talons (`Hand`)
        palm_end = wr + u_fa * 0.078
        parts_g.append(sweep_tube(
            f'{gid_g}_palm_shard_{side}', [wr + u_fa * 0.012, palm_end], [0.024, 0.030],
            shard_dk_p, n=8, rigid_joint=side + 'Hand', scale_xy=(1.25, 0.48), ref_dir=up_w
        ))
        side_ax = np.cross(u_fa, np.array([0.0, 1.0, 0.0]))
        side_ax = side_ax / max(float(np.linalg.norm(side_ax)), 1e-6)
        for fi, off_f in enumerate((-0.026, -0.009, 0.009, 0.026)):
            flen = 0.105 if fi in (1, 2) else 0.088
            f0 = palm_end + u_fa * 0.008 + side_ax * off_f
            f1 = f0 + u_fa * (0.55 * flen) + fwd * 0.014
            f2 = f1 + u_fa * (0.45 * flen) + fwd * 0.026
            parts_g.append(sweep_tube(
                f'{gid_g}_claw_{side}_{fi}', [f0, f1, f2], [0.0085, 0.0055, 0.0012],
                shard_dk_p, n=6, rigid_joint=side + 'Hand', cap_ends=False
            ))
        th0 = wr + u_fa * 0.028 + side_ax * (0.030 * sgn) + fwd * 0.012
        th1 = th0 + u_fa * 0.062 + side_ax * (0.014 * sgn) + fwd * 0.022
        parts_g.append(sweep_tube(
            f'{gid_g}_thumb_{side}', [th0, th1], [0.009, 0.0015],
            shard_lt_p, n=6, rigid_joint=side + 'Hand', cap_ends=False
        ))

    ent_g = assemble_garment(gid_g, 'Vox Solus Disconnected Floating Arm & Talon Shards', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 3D. LEGS: ext_{s}_vox_legs (Disconnected Floating Thigh & Shin Blade-Shards w/ Open Knee Air-Gaps — Ref #6) ---
    gid_l = f'ext_{sex}_vox_legs'
    parts_l = []
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        hip, kn, ft = J(side + 'UpLeg'), J(side + 'Leg'), J(side + 'Foot')
        d_th = kn - hip
        d_sh = ft - kn

        # Jagged outer/front sculpted thigh armor-shard (`f = 0.08 .. 0.84` -> open pelvic & knee air gaps!)
        th_pts = catmull_spline([
            hip + d_th * 0.06 + np.array([sgn * 0.032, -0.015, 0.035]),
            hip + d_th * 0.42 + np.array([sgn * 0.018, -0.022, 0.0]),
            hip + d_th * 0.84 + np.array([sgn * 0.006, -0.012, 0.0]),
        ], 12)
        th_prof = np.array([0.018, 0.052, 0.066, 0.068, 0.064, 0.058, 0.052, 0.046, 0.038, 0.028, 0.018, 0.006])
        parts_l.append(sweep_tube(
            f'{gid_l}_thigh_shard_{side}', th_pts, th_prof, shard_dk_p, n=10,
            rigid_joint=side + 'UpLeg', scale_xy=(0.88, 1.18), cap_ends=False
        ))
        # Secondary inner-thigh chrome splinter
        th2_pts = [
            hip + d_th * 0.20 + np.array([-sgn * 0.025, -0.035, 0.0]),
            hip + d_th * 0.68 + np.array([-sgn * 0.015, -0.028, 0.0]),
        ]
        parts_l.append(sweep_tube(
            f'{gid_l}_thigh_inner_{side}', th2_pts, [0.022, 0.008], shard_lt_p, n=7,
            rigid_joint=side + 'UpLeg', scale_xy=(0.65, 1.25), cap_ends=False
        ))

        # Tiny hovering diamond splinter suspended inside the open knee air-gap (Ref #6!)
        parts_l.append(crystal_prism(
            f'{gid_l}_knee_splinter_{side}', kn + np.array([sgn * 0.012, -0.024, 0.008]),
            up_w, 0.062, 0.016, shard_lt_p, side + 'Leg', sides=4
        ))

        # Razor-tapered shin blade-shard (`f = 0.16 .. 0.94` -> open knee & ankle air gaps!)
        sh_pts = catmull_spline([
            kn + d_sh * 0.16 + np.array([sgn * 0.016, -0.014, 0.0]),
            kn + d_sh * 0.54 + np.array([sgn * 0.008, -0.020, 0.0]),
            kn + d_sh * 0.94 + np.array([0.0, -0.008, 0.0]),
        ], 11)
        sh_prof = np.array([0.012, 0.038, 0.044, 0.042, 0.038, 0.032, 0.027, 0.022, 0.018, 0.013, 0.006])
        parts_l.append(sweep_tube(
            f'{gid_l}_shin_shard_{side}', sh_pts, sh_prof, shard_dk_p, n=9,
            rigid_joint=side + 'Leg', scale_xy=(0.78, 1.28), cap_ends=False
        ))

    ent_l = assemble_garment(gid_l, 'Vox Solus Disconnected Floating Leg Blade-Shards', 'legs', parts_l)
    hide_full_body(ent_l)
    entries.append(ent_l)

    # --- 3E. FEET: ext_{s}_vox_feet (Bifurcated Stiletto-Shard Construct Feet — Ref #6) ---
    gid_f = f'ext_{sex}_vox_feet'
    parts_f = []
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        ft, toe = J(side + 'Foot'), J(side + 'ToeBase', 'tail')
        # Twin bifurcated razor stiletto forefoot prongs + vertical heel-fin spur
        for p_idx, lat_off in enumerate((-0.020, 0.020)):
            prong_pts = [
                ft + np.array([lat_off * 0.6, 0.015, 0.025]),
                0.5 * (ft + toe) + np.array([lat_off, -0.015, 0.016]),
                np.array([toe[0] + lat_off * 1.15, toe[1] - 0.028, 0.005]),
            ]
            parts_f.append(sweep_tube(
                f'{gid_f}_prong_{side}_{p_idx}', prong_pts, [0.018, 0.014, 0.003],
                shard_dk_p if p_idx == 0 else shard_lt_p, n=7, rigid_joint=side + 'Foot',
                scale_xy=(0.75, 1.35), cap_ends=False
            ))
        heel_pts = [
            ft + np.array([0.0, 0.038, 0.055]),
            np.array([ft[0], ft[1] + 0.048, 0.006]),
        ]
        parts_f.append(sweep_tube(
            f'{gid_f}_heel_spur_{side}', heel_pts, [0.016, 0.004], shard_dk_p, n=7,
            rigid_joint=side + 'Foot', cap_ends=False
        ))

    ent_f = assemble_garment(gid_f, 'Vox Solus Bifurcated Stiletto-Shard Feet', 'feet', parts_f)
    ent_f['hide_parts'] = ['Human.toenails']
    apply_custom_hide(ent_f, select_body_tris(('LeftFoot', 'RightFoot', 'LeftToe', 'RightToe'), weight_thresh=0.15, mode='any'), replace=True)
    entries.append(ent_f)
    return entries


# ===============================================================================================================
# 4. ACCRETION DJINN — Smoke-Vortex & Orbiting Accretion-Ring Entity (Refs #8 & #10)
# ===============================================================================================================
def _build_accretion_djinn(sex):
    entries = []
    bronze_p   = _mp('ext_bronze', 'metal.bronze', 'ext_djinn_bronze', 'ext_gold')
    disc_p     = _mp('ext_bronze_dk', 'metal.gold', 'ext_djinn_disc', 'ext_gold_bright')
    carapace_p = _mp('ext_obsidian', 'stone.obsidian.pancake_flaked', 'ext_djinn_bronze', 'ext_bronze')
    astral_p   = _mp('ext_void', 'stone.obsidian.pancake_flaked', grain=0.01)
    eye_p      = _mp('ext_sapphire', 'beads.glass', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])

    # --- 4A. HEAD: ext_{s}_djinn_helm (Bronze-Obsidian Astrolabe Caliper Helm & Glowing Sapphire Visor — Ref #8) ---
    gid_h = f'ext_{sex}_djinn_helm'
    parts_h = []
    hc = a_hd + up_h * 0.075 + bk_h * 0.008

    # Smooth faceless obsidian-bronze ovoid void cranium
    parts_h.append(ellipsoid_part(
        gid_h + '_dome', hc, (0.088, 0.105, 0.118), carapace_p, 'Head',
        axes=(left_h, bk_h, up_h), n=22, rows=14
    ))
    # Horizontal projecting astrolabe brow-caliper crescent + dorsal sagittal crescent fin (Ref #8!)
    parts_h.append(torus_ring(
        gid_h + '_brow_caliper', hc + up_h * 0.015 - bk_h * 0.010, up_h - bk_h * 0.18,
        0.132, 0.016, 0.009, bronze_p, rigid_joint='Head',
        arc=(-0.22 * math.pi, 1.22 * math.pi), n_major=24, n_minor=8, closed_loop=False
    ))
    parts_h.append(torus_ring(
        gid_h + '_crest_arc', hc + up_h * 0.035, left_h,
        0.138, 0.018, 0.008, bronze_p, rigid_joint='Head',
        arc=(-0.15 * math.pi, 0.72 * math.pi), n_major=20, n_minor=8, closed_loop=False
    ))
    # Blazing vertical electric indigo-cyan visor slits & central Cyclopean star-core (Refs #8 & #10!)
    visor_vfx = {'kind': 'emissive_blaze', 'color': '#6cf0ff', 'gain': 2.40, 'pulse': 0.22}
    parts_h.append(ellipsoid_part(
        gid_h + '_cyclops_core', hc - bk_h * 0.104 + up_h * 0.008, (0.016, 0.010, 0.036),
        eye_p, 'Head', axes=(left_h, bk_h, up_h), n=12, rows=8, vfx=visor_vfx
    ))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        slit_pts = [
            hc + left_h * (sgn * 0.038) - bk_h * 0.094 + up_h * 0.055,
            hc + left_h * (sgn * 0.034) - bk_h * 0.104 + up_h * 0.005,
            hc + left_h * (sgn * 0.028) - bk_h * 0.096 - up_h * 0.048,
        ]
        parts_h.append(sweep_tube(
            f'{gid_h}_visor_slit_{tag}', slit_pts, [0.004, 0.007, 0.003], eye_p,
            n=6, rigid_joint='Head', cap_ends=False, vfx=visor_vfx
        ))

    ent_h = assemble_garment(gid_h, 'Accretion Djinn Astrolabe Caliper Helm & Visor', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 4B. TORSO: ext_{s}_djinn_carapace (Translucent Obsidian-Violet Fresnel Body + Engraved Bronze Gorget + Shoulder Smoke) ---
    gid_t = f'ext_{sex}_djinn_carapace'
    parts_t = []
    djinn_body_vfx = {
        'kind': 'fresnel_ghost',
        'core_color': '#120b1f',
        'rim_color': '#7858ff',
        'accent_color': '#52e8ff',
        'opacity': 0.88,
        'power': 2.1,
        'rim_gain': 1.85,
        'depth_write': True,
    }
    # Sculpted translucent obsidian-violet astral torso & upper arms
    astral_trunk = torso_tube(
        gid_t + '_astral_torso', core.TOP + 0.008, core.WAIST + 0.015, ease=0.008, ease_bottom=-0.016,
        paint=astral_p, n=36, rows=14
    )
    tag_vfx(astral_trunk, djinn_body_vfx, no_conform=True)
    parts_t.append(astral_trunk)

    astral_arms = sleeves(gid_t, 'wrist', 0.006, astral_p, ease_end=0.006, rows=10, n=18)
    tag_vfx(astral_arms, djinn_body_vfx, no_conform=True)
    parts_t.extend(astral_arms)

    # Heavy engraved antique-bronze collar-gorget & shoulder-rims (Ref #8!)
    nk_z = J('Neck')[2]
    parts_t.append(torus_ring(
        gid_t + '_bronze_gorget', np.array([0.0, 0.008, nk_z - 0.018]), up_w + fwd * 0.16,
        0.128, 0.036, 0.024, bronze_p, rigid_joint='Spine2', n_major=32, n_minor=10
    ))
    # Segmented thoracic bronze-obsidian rib plates
    chest_plate = torso_tube(
        gid_t + '_thorax_plate', core.SHOULDER - 0.01, core.WAIST + 0.035, ease=0.022, ease_bottom=-0.008,
        paint=carapace_p, n=32, rows=10, arc=(-0.68 * math.pi, 0.68 * math.pi)
    )
    chest_plate.no_conform = True
    parts_t.append(chest_plate)

    djinn_sh_smoke = [
        {
            'bone': 'LeftArm', 'offset': [0.04, 0.02, -0.02],
            'count': 24, 'rate': 0.34, 'size0': 0.065, 'size1': 0.210,
            'drift': [0.24, 0.20, -0.05], 'spread': 0.042, 'opacity': 0.68,
            'ember_color': '#4c38c8', 'core_color': '#090710', 'mist_color': '#5c586c',
        },
        {
            'bone': 'RightArm', 'offset': [-0.04, 0.02, -0.02],
            'count': 24, 'rate': 0.34, 'size0': 0.065, 'size1': 0.210,
            'drift': [-0.24, 0.20, -0.05], 'spread': 0.042, 'opacity': 0.68,
            'ember_color': '#4c38c8', 'core_color': '#090710', 'mist_color': '#5c586c',
        },
    ]
    ent_t = assemble_garment(gid_t, 'Accretion Djinn Astral Carapace & Bronze Gorget', 'torso', parts_t, emitters=djinn_sh_smoke)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 4C. BACK: ext_{s}_djinn_rings (2 Massive Tilted Orbiting Cosmic Accretion-Disc Rings — Ref #8!) ---
    gid_b = f'ext_{sex}_djinn_rings'
    parts_b = []

    # Ring 1: Giant tilted primary cosmic accretion blade-ring sweeping across chest & arms (`r = 0.45m`)!
    c_r1 = np.array([0.0, -0.015, core.CHEST - 0.04])
    n_r1 = np.array([0.38, -0.22, 0.90])
    n_r1 = n_r1 / np.linalg.norm(n_r1)
    parts_b.append(torus_ring(
        gid_b + '_accretion_outer', c_r1, n_r1,
        major_r=0.455, minor_rx=0.064, minor_ry=0.009, paint=disc_p, rigid_joint='Spine2',
        n_major=48, n_minor=10,
        vfx={
            'kind': 'accretion_disc',
            'inner_color': '#fff8dc', 'mid_color': '#d88c42', 'outer_color': '#5878ff',
            'kinetic': {
                'bone': 'Spine2', 'motion': 'orbit', 'speed': 0.95, 'amp': 0.010, 'precess': 0.06, 'phase': 0.0,
                'center_gl': bl_to_gl_pt(c_r1), 'axis_gl': bl_to_gl_dir(n_r1),
            },
        }
    ))

    # Ring 2: Counter-tilted inner waist orbital ring (`r = 0.265m`, counter-rotating!)
    c_r2 = np.array([0.0, -0.010, core.WAIST + 0.02])
    n_r2 = np.array([-0.52, -0.18, 0.83])
    n_r2 = n_r2 / np.linalg.norm(n_r2)
    parts_b.append(torus_ring(
        gid_b + '_accretion_inner', c_r2, n_r2,
        major_r=0.265, minor_rx=0.042, minor_ry=0.0085, paint=disc_p, rigid_joint='Spine1',
        n_major=40, n_minor=10,
        vfx={
            'kind': 'accretion_disc',
            'inner_color': '#dcffff', 'mid_color': '#c87838', 'outer_color': '#6c48ff',
            'kinetic': {
                'bone': 'Spine1', 'motion': 'orbit', 'speed': -1.35, 'amp': 0.008, 'precess': 0.08, 'phase': 1.5,
                'center_gl': bl_to_gl_pt(c_r2), 'axis_gl': bl_to_gl_dir(n_r2),
            },
        }
    ))
    entries.append(assemble_garment(gid_b, 'Accretion Djinn Twin Orbiting Cosmic Accretion Rings', 'back', parts_b))

    # --- 4D. GLOVES: ext_{s}_djinn_gauntlets (Rune-Lit Bronze Vambraces & Predatory Demon-Claws — Ref #8) ---
    gid_g = f'ext_{sex}_djinn_gauntlets'
    parts_g = []
    rune_vfx = {'kind': 'emissive_blaze', 'color': '#52a8ff', 'gain': 2.30, 'pulse': 0.20}
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        parts_g.append(sweep_tube(
            f'{gid_g}_vambrace_{side}', [el + d_fa * 0.14, wr + u_fa * 0.012], [0.058, 0.044],
            bronze_p, n=14, rigid_joint=side + 'ForeArm'
        ))
        # 3 glowing sapphire starlight rune-gems set into outer vambrace (Ref #8!)
        out_v = np.array([sgn * 0.45, -0.88, 0.12])
        out_v = out_v / np.linalg.norm(out_v)
        c_mid_fa = el + d_fa * 0.46
        side_v = np.cross(u_fa, out_v)
        side_v = side_v / max(float(np.linalg.norm(side_v)), 1e-6)
        for gi_r, lat_r in enumerate((-0.024, 0.0, 0.024)):
            gem_c = c_mid_fa + out_v * 0.052 + side_v * lat_r
            parts_g.append(ellipsoid_part(
                f'{gid_g}_rune_{side}_{gi_r}', gem_c, (0.008, 0.008, 0.013), eye_p,
                side + 'ForeArm', n=8, rows=6, vfx=rune_vfx
            ))
        # Oversized predatory obsidian demon-claw hand (Ref #8!)
        palm_end = wr + u_fa * 0.095
        parts_g.append(sweep_tube(
            f'{gid_g}_palm_{side}', [wr - u_fa * 0.006, palm_end], [0.038, 0.044],
            carapace_p, n=10, rigid_joint=side + 'Hand', scale_xy=(1.22, 0.60), ref_dir=up_w
        ))
        for fi, off_f in enumerate((-0.032, -0.011, 0.011, 0.032)):
            f0 = palm_end - u_fa * 0.006 + side_v * off_f
            f1 = f0 + u_fa * 0.068 - out_v * 0.012
            f2 = f1 + u_fa * 0.052 + out_v * 0.032
            parts_g.append(sweep_tube(
                f'{gid_g}_claw_{side}_{fi}', [f0, f1, f2], [0.012, 0.008, 0.0018],
                carapace_p, n=7, rigid_joint=side + 'Hand', cap_ends=False
            ))
        th0 = wr + u_fa * 0.030 + side_v * (0.038 * sgn) - out_v * 0.015
        th1 = th0 + u_fa * 0.074 + side_v * (0.016 * sgn) + out_v * 0.028
        parts_g.append(sweep_tube(
            f'{gid_g}_thumb_{side}', [th0, th1], [0.013, 0.002],
            carapace_p, n=7, rigid_joint=side + 'Hand', cap_ends=False
        ))

    ent_g = assemble_garment(gid_g, 'Accretion Djinn Rune-Lit Vambraces & Demon Claws', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 4E. LEGS: ext_{s}_djinn_vortex (Tapering Corkscrew Smoke-Tornado Tail + Live Base Smoke — Ref #8!) ---
    gid_l = f'ext_{sex}_djinn_vortex'
    parts_l = []
    # Build a sinuous S-curved funnel tapering from pelvis (`WAIST`) down to a sharp wisp near ground (`z = 0.05`)
    v_rows = 22
    zs_v = np.linspace(core.WAIST + 0.01, 0.05, v_rows)
    angs_v = np.linspace(0.0, 2.0 * math.pi, 28, endpoint=False)
    Q_vortex = []
    for k_v, zv in enumerate(zs_v):
        u_v = k_v / max(v_rows - 1, 1)
        # Sinuous djinn-tail S-curve (Ref #8!)
        cx = 0.065 * math.sin(u_v * math.pi * 1.65) * (u_v ** 0.85)
        cy = 0.055 * (1.0 - math.cos(u_v * math.pi * 1.35)) * u_v
        rad_v = (1.0 - u_v) ** 1.25 * 0.142 + 0.014
        # Slight fluted smoke ridges around circumference
        Q_vortex.append([
            [
                cx + math.sin(a) * rad_v * (1.0 + 0.12 * math.sin(5.0 * a + u_v * 8.0)),
                cy + math.cos(a) * rad_v * (1.0 + 0.12 * math.sin(5.0 * a + u_v * 8.0)),
                zv,
            ]
            for a in angs_v
        ])
    vortex_pt = _part_raw(
        gid_l + '_tornado_funnel', Q_vortex, True, astral_p, rigid_joint='Hips',
        vfx={
            'kind': 'alpha_erosion',
            'no_push': True,
            'y_top': 0.88,
            'y_bot': 0.04,
            'edge_color': '#5244c8',
            'smoke_color': '#09080f',
            'swirl': 2.85,
        }
    )
    parts_l.append(vortex_pt)

    vortex_smoke = [{
        'bone': 'Hips',
        'offset': [0.03, -0.74, -0.04],
        'count': 30,
        'rate': 0.34,
        'size0': 0.09,
        'size1': 0.28,
        'drift': [-0.08, 0.34, -0.06],
        'spread': 0.085,
        'opacity': 0.66,
        'ember_color': '#4838b0',
        'core_color': '#08070e',
        'mist_color': '#5e5a6e',
    }]
    ent_l = assemble_garment(gid_l, 'Accretion Djinn Corkscrewing Smoke-Vortex Tail', 'legs', parts_l, emitters=vortex_smoke)
    hide_full_body(ent_l)
    entries.append(ent_l)
    return entries


# ===============================================================================================================
# 5. CHORUS OF MASKS — Headless Seven-Mask Chorus & Astral Haori Entity (Refs #3 & #13)
# ===============================================================================================================
def _build_chorus_of_masks(sex):
    entries = []
    mask_p    = _mp('ext_obsidian', 'leather.polished', 'ext_noh_mask', 'ext_noh_crimson')
    horn_p    = _mp('ext_noh_crimson', 'keratin.beak.hornbill')
    eye_p     = _mp('ext_starwhite', 'beads.glass', grain=0.0)
    gold_p    = _mp('ext_gold', 'metal.gold')
    haori_p   = _mp('ext_white_silk', 'cloth.silk', 'ext_haori_silk', 'ext_gold')
    astral_p  = _mp('ext_obsidian', 'cloth.silk', 'ext_constellation_body', 'ext_ivory')
    tail_p    = _mp('ext_tail_grey', 'leather.reptile.scute', 'ext_noh_mask', 'ext_noh_crimson')
    ivory_p   = _mp('ext_ivory', 'keratin.beak.hornbill')

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])

    # --- 5A. HEAD: ext_{s}_chorus_masks (Levitating Arc of 7 Sculpted Porcelain Theatrical Masks w/ Kintsugi Gold) ---
    gid_h = f'ext_{sex}_chorus_masks'
    parts_h = []
    arc_center = a_hd + up_h * 0.098 + bk_h * 0.022
    porcelain_p = _mp('ext_ivory', 'shell.nacre', 'ext_porcelain_mask', 'ext_gold_bright', grain=0.008)
    recess_p    = _mp('ext_void', 'cloth.velvet', grain=0.0)
    bright_gold = _mp('ext_gold_bright', 'metal.gold', grain=0.01)
    crimson_lip = _mp('ext_noh_crimson', 'shell.nacre', grain=0.01)
    eye_vfx_base = {'kind': 'emissive_blaze', 'color': '#fffbe8', 'gain': 2.25, 'pulse': 0.14}

    # 7 distinct theatrical porcelain masks arranged in a wide horseshoe-arc floating above the headless shoulders:
    # 0=Tragedy, 1=Weeping, 2=Serene Noh, 3=Crowned Sovereign, 4=Blindfolded Gold, 5=Smiling, 6=Comedy
    archetypes = ('tragedy', 'weeping', 'noh', 'crowned', 'blindfold', 'smiling', 'comedy')

    def _mask_front_pt(mc_p, m_lft_p, m_fwd_p, up_p, sc_p, uf, vf, arch):
        """Anatomical sculpted 3D front porcelain surface `(uf in [-1, 1], vf in [0, 1])`."""
        # Anatomical oval contour: broad rounded forehead, prominent cheekbones, graceful tapered jaw & chin
        sin_v = math.sin(math.pi * (0.04 + 0.92 * vf))
        jaw_taper = 1.0 - 0.34 * max(0.0, (vf - 0.46) / 0.54) ** 1.15
        cheek_swell = 1.0 + 0.07 * math.exp(-((vf - 0.48) / 0.16) ** 2)
        half_w = 0.052 * sc_p * (sin_v ** 0.72) * jaw_taper * cheek_swell
        h_z = 0.076 * sc_p * (0.50 - vf) * 2.0

        # Base facial dome curvature (curving smoothly back toward temples & jaw)
        au = abs(uf)
        dome = 0.026 * sc_p * math.sqrt(max(0.02, 1.0 - 0.86 * (uf * uf))) * (sin_v ** 0.55)

        # 1) Sculpted supraorbital brow ridges (expression-dependent slant!)
        brow_tilt = {
            'tragedy':  -0.045 * (1.0 - au),
            'weeping':   0.042 * (1.0 - au),
            'noh':      -0.018 * math.cos(au * 2.2),
            'crowned':  -0.012 * au,
            'blindfold': 0.0,
            'smiling':  -0.028 * math.cos(au * 2.4),
            'comedy':   -0.045 * math.cos(au * 2.4),
        }[arch]
        v_brow = 0.315 + brow_tilt
        brow_ridge = (
            0.0055 * sc_p
            * math.exp(-((vf - v_brow) / 0.045) ** 2)
            * math.exp(-((au - 0.34) / 0.24) ** 2)
        )

        # 2) Deeply recessed 3D orbital eye sockets (so dark eye-slits sit in genuine carved shadow!)
        eye_recess = (
            -0.0068 * sc_p
            * math.exp(-((vf - 0.405) / 0.048) ** 2)
            * math.exp(-((au - 0.35) / 0.155) ** 2)
        )

        # 3) Projecting sculpted nose bridge, nasal tip & alar wings
        nose_v = math.exp(-((vf - 0.52) / 0.115) ** 2) * (1.0 if vf < 0.63 else 0.0)
        nose_ramp = max(0.0, min(1.0, (vf - 0.34) / 0.22))
        nose_bridge = 0.0155 * sc_p * nose_v * (0.45 + 0.55 * nose_ramp) * math.exp(-((au) / 0.125) ** 2)
        nose_wings = 0.0048 * sc_p * math.exp(-((vf - 0.575) / 0.032) ** 2) * math.exp(-((au - 0.12) / 0.075) ** 2)

        # 4) Sculpted zygomatic cheekbones (stronger on comedy/smiling masks!)
        cheek_gain = 1.35 if arch in ('comedy', 'smiling') else 1.0
        cheekbone = (
            0.0062 * sc_p * cheek_gain
            * math.exp(-((vf - 0.525) / 0.078) ** 2)
            * math.exp(-((au - 0.52) / 0.22) ** 2)
        )

        # 5) Sculpted mouth region: projecting lip ridge + recessed oral cavity for open-mouth masks
        mouth_curve = {
            'tragedy':   0.042 * (uf * uf),
            'weeping':   0.034 * (uf * uf),
            'noh':       0.006 * (uf * uf),
            'crowned':  -0.004 * (uf * uf),
            'blindfold': 0.0,
            'smiling':  -0.042 * (uf * uf),
            'comedy':   -0.058 * (uf * uf),
        }[arch]
        v_mouth = 0.745 + mouth_curve
        mouth_w = 0.26 if arch in ('comedy', 'tragedy', 'smiling') else 0.18
        lip_ridge = 0.0045 * sc_p * math.exp(-((vf - v_mouth) / 0.038) ** 2) * math.exp(-((au) / mouth_w) ** 2)
        mouth_cavity = 0.0
        if arch in ('tragedy', 'comedy'):
            mouth_cavity = -0.0072 * sc_p * math.exp(-((vf - (v_mouth + 0.012)) / 0.032) ** 2) * math.exp(-((au) / (mouth_w * 0.72)) ** 2)

        # 6) Subtle chin eminence
        chin_boss = 0.0042 * sc_p * math.exp(-((vf - 0.885) / 0.055) ** 2) * math.exp(-((au) / 0.22) ** 2)

        fwd_d = dome + brow_ridge + eye_recess + nose_bridge + nose_wings + cheekbone + lip_ridge + mouth_cavity + chin_boss
        return mc_p + m_lft_p * (uf * half_w) + m_fwd_p * fwd_d + up_p * h_z, half_w, dome, h_z

    for k_m, arch in enumerate(archetypes):
        u_m = (k_m - 3) / 3.0  # -1.0 .. +1.0
        yaw = u_m * 0.72       # outer masks turn outward slightly like a polyphonic chorus (Ref #13!)
        is_center = (k_m == 3)
        sc_m = 1.18 if is_center else (1.02 - 0.05 * abs(u_m))
        m_fwd = -bk_h * math.cos(yaw) + left_h * math.sin(yaw)
        m_lft = left_h * math.cos(yaw) + bk_h * math.sin(yaw)
        mc = (
            arc_center
            + left_h * (u_m * 0.255)
            + bk_h * ((u_m * u_m) * 0.088 - 0.055)
            + up_h * (0.016 if is_center else -0.005 * abs(u_m))
        )
        kin_m = {
            'bone': 'Head', 'motion': 'chorus_wave',
            'speed': 1.95, 'amp': 0.016, 'phase': k_m * 0.78,
            'center_gl': bl_to_gl_pt(mc), 'axis_gl': bl_to_gl_dir(m_lft),
        }
        std_kin = {'kind': 'standard', 'kinetic': kin_m}

        # Build watertight carved porcelain mask shell: front sculpted face + beveled rim lip + concave hollow back shell
        rows_m = 17
        uf_front = np.linspace(-1.0, 1.0, 15)
        uf_back = np.linspace(1.0, -1.0, 9)
        Q_mask = []
        shell_thick = 0.0095 * sc_m
        rim_flare = 0.0022 * sc_m
        for r_i in range(rows_m):
            v_f = 0.04 + 0.92 * (r_i / (rows_m - 1))
            row_pts = []
            # 1) Front sculpted face (u_tex in [0.00, 0.50])
            front_row = []
            for uf in uf_front:
                pt_f, hw_f, dm_f, hz_f = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, float(uf), v_f, arch)
                front_row.append(pt_f)
                row_pts.append(pt_f)
            # 2) Left beveled porcelain rim lip (2 steps stepping backward with subtle crisp bevel flare)
            p_l_edge = front_row[-1]
            row_pts.append(p_l_edge + m_lft * rim_flare - m_fwd * (0.35 * shell_thick))
            row_pts.append(p_l_edge + m_lft * (0.55 * rim_flare) - m_fwd * shell_thick)
            # 3) Concave dark-lacquered inner back shell (offset behind facial dome so mask has genuine carved thickness)
            for uf in uf_back:
                _, hw_b, dm_b, hz_b = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, float(uf), v_f, arch)
                row_pts.append(
                    mc + m_lft * (float(uf) * hw_b * 0.95)
                    + m_fwd * (dm_b - shell_thick)
                    + up_h * hz_b
                )
            # 4) Right beveled porcelain rim lip closing back to uf=-1
            p_r_edge = front_row[0]
            row_pts.append(p_r_edge - m_lft * (0.55 * rim_flare) - m_fwd * shell_thick)
            row_pts.append(p_r_edge - m_lft * rim_flare - m_fwd * (0.35 * shell_thick))
            Q_mask.append(row_pts)

        parts_h.append(_part_raw(
            f'{gid_h}_mask_{k_m}', Q_mask, True, porcelain_p, rigid_joint='Head', vfx=std_kin
        ))

        # Recessed 3D dark eye-slits (or sculpted golden blindfold band on arch == 'blindfold')
        if arch == 'blindfold':
            bf_pts = []
            for uf_b in np.linspace(-1.04, 1.04, 11):
                pf_b, _, _, _ = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, float(np.clip(uf_b, -1.0, 1.0)), 0.405, arch)
                bf_pts.append(pf_b + m_fwd * (0.0055 * sc_m) + m_lft * (0.003 * sc_m * (1.0 if uf_b > 0.98 else (-1.0 if uf_b < -0.98 else 0.0))))
            parts_h.append(sweep_tube(
                f'{gid_h}_blindfold_{k_m}', bf_pts, 0.0115 * sc_m, bright_gold,
                n=8, rigid_joint='Head', scale_xy=(0.35, 1.25), ref_dir=m_fwd, cap_ends=False, vfx=std_kin
            ))
            # Central embossed star-medallion on blindfold bridge
            med_p, _, _, _ = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, 0.0, 0.405, arch)
            parts_h.append(crystal_prism(
                f'{gid_h}_blindfold_gem_{k_m}', med_p + m_fwd * (0.009 * sc_m), up_h,
                0.022 * sc_m, 0.009 * sc_m, bright_gold, 'Head', sides=4, vfx=std_kin
            ))
        else:
            for s_eye, etag in ((-1.0, 'R'), (1.0, 'L')):
                # Sculpted 3D dark recessed eye-slit following expression curve
                slit_u = [s_eye * 0.19, s_eye * 0.35, s_eye * 0.51]
                if arch == 'tragedy':
                    slit_v = [0.392, 0.404, 0.422]
                elif arch == 'weeping':
                    slit_v = [0.415, 0.400, 0.418]
                elif arch in ('smiling', 'comedy'):
                    slit_v = [0.412, 0.394, 0.414]
                else:
                    slit_v = [0.408, 0.400, 0.405]
                e_pts = []
                for eu, ev in zip(slit_u, slit_v):
                    ep, _, _, _ = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, eu, ev, arch)
                    e_pts.append(ep + m_fwd * (0.0022 * sc_m))
                parts_h.append(sweep_tube(
                    f'{gid_h}_eyeslit_{k_m}_{etag}', e_pts,
                    [0.0020 * sc_m, 0.0046 * sc_m, 0.0020 * sc_m], recess_p,
                    n=7, rigid_joint='Head', scale_xy=(0.45, 1.15), ref_dir=m_fwd, cap_ends=False, vfx=std_kin
                ))
                # Subtle luminous white-gold theatrical gaze gleam on Sovereign & Noh masks
                if arch in ('crowned', 'noh'):
                    gp, _, _, _ = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, s_eye * 0.35, 0.401, arch)
                    parts_h.append(ellipsoid_part(
                        f'{gid_h}_eyegleam_{k_m}_{etag}', gp + m_fwd * (0.0038 * sc_m),
                        (0.0042 * sc_m, 0.0022 * sc_m, 0.0022 * sc_m), eye_p, 'Head',
                        axes=(m_lft, m_fwd, up_h), n=8, rows=5,
                        vfx=dict(eye_vfx_base, kinetic=kin_m)
                    ))

        # Sculpted 3D expressive mouth (dark recessed cavity for open tragedy/comedy; carved crimson/gold lips for serene/smiling)
        m_u_span = 0.25 if arch in ('comedy', 'tragedy', 'smiling') else 0.16
        m_us = np.linspace(-m_u_span, m_u_span, 7)
        m_pts = []
        for mu in m_us:
            if arch == 'tragedy':
                mv = 0.745 + 0.048 * ((mu / m_u_span) ** 2)
            elif arch == 'weeping':
                mv = 0.752 + 0.034 * ((mu / m_u_span) ** 2)
            elif arch == 'comedy':
                mv = 0.758 - 0.056 * ((mu / m_u_span) ** 2)
            elif arch == 'smiling':
                mv = 0.748 - 0.040 * ((mu / m_u_span) ** 2)
            else:
                mv = 0.746 + 0.006 * ((mu / m_u_span) ** 2)
            mp_pt, _, _, _ = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, float(mu), mv, arch)
            m_pts.append(mp_pt + m_fwd * (0.0024 * sc_m))
        m_is_open = arch in ('tragedy', 'comedy')
        m_prof = (
            np.sin(np.linspace(0.18, math.pi - 0.18, 7)) * (0.0068 if m_is_open else 0.0036) * sc_m
        )
        parts_h.append(sweep_tube(
            f'{gid_h}_mouth_{k_m}', m_pts, m_prof, recess_p if m_is_open else crimson_lip,
            n=7, rigid_joint='Head', scale_xy=(0.42, 1.15), ref_dir=m_fwd, cap_ends=False, vfx=std_kin
        ))

        # Weeping mask: sculpted 3D golden kintsugi tear-trails running from inner eye corners down cheeks
        if arch == 'weeping':
            for s_t, ttag in ((-1.0, 'R'), (1.0, 'L')):
                t_pts = []
                for tv, tu in ((0.43, s_t * 0.28), (0.53, s_t * 0.34), (0.65, s_t * 0.31), (0.76, s_t * 0.35)):
                    tp, _, _, _ = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, tu, tv, arch)
                    t_pts.append(tp + m_fwd * (0.0026 * sc_m))
                parts_h.append(sweep_tube(
                    f'{gid_h}_tear_{k_m}_{ttag}', catmull_spline(t_pts, 8),
                    np.linspace(0.0026, 0.0014, 8) * sc_m, bright_gold,
                    n=6, rigid_joint='Head', cap_ends=False, vfx=std_kin
                ))

        # Central Sovereign Mask: sculpted 3D golden diadem crown + swept crimson-gold ceremonial horns!
        if arch == 'crowned':
            # Gilded filigree diadem band curving flush across the upper forehead
            cr_pts = []
            for uf_c in np.linspace(-0.88, 0.88, 11):
                pc, _, _, _ = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, float(uf_c), 0.125, arch)
                cr_pts.append(pc + m_fwd * (0.0045 * sc_m) + up_h * (0.006 * sc_m))
            parts_h.append(sweep_tube(
                f'{gid_h}_crown_band', cr_pts, 0.0065 * sc_m, bright_gold,
                n=8, rigid_joint='Head', scale_xy=(0.55, 1.35), ref_dir=m_fwd, cap_ends=False, vfx=std_kin
            ))
            # 3 rising golden crown spires (tall central solar spire + twin flanking points)
            for sp_i, (u_sp, h_sp, r_sp) in enumerate(((-0.42, 0.044, 0.011), (0.0, 0.068, 0.015), (0.42, 0.044, 0.011))):
                p_sp, _, _, _ = _mask_front_pt(mc, m_lft, m_fwd, up_h, sc_m, u_sp, 0.10, arch)
                sp_dir = up_h + m_lft * (u_sp * 0.25)
                parts_h.append(crystal_prism(
                    f'{gid_h}_crown_spire_{sp_i}', p_sp + up_h * (0.5 * h_sp * sc_m) + m_fwd * (0.004 * sc_m),
                    sp_dir, h_sp * sc_m, r_sp * sc_m, bright_gold, 'Head', sides=4, vfx=std_kin
                ))
            # Swept curved crimson-lacquer ceremonial demon horns framing the crown (Ref #13!)
            for s_hn, htag in ((-1.0, 'R'), (1.0, 'L')):
                h_pts = [
                    mc + up_h * (0.060 * sc_m) + m_lft * (s_hn * 0.032 * sc_m) + m_fwd * 0.006,
                    mc + up_h * (0.112 * sc_m) + m_lft * (s_hn * 0.046 * sc_m) + m_fwd * 0.014,
                    mc + up_h * (0.162 * sc_m) + m_lft * (s_hn * 0.040 * sc_m) + m_fwd * 0.004,
                ]
                parts_h.append(sweep_tube(
                    f'{gid_h}_horn_{htag}', h_pts, [0.0105, 0.0060, 0.0012], horn_p,
                    n=8, rigid_joint='Head', cap_ends=False, vfx=std_kin
                ))

    ent_h = assemble_garment(gid_h, 'Chorus of Masks Seven-Mask Floating Demon Arc', 'head', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.18, mode='any'))
    entries.append(ent_h)

    # --- 5B. TORSO: ext_{s}_chorus_haori (Wide Crisp White-and-Gold Haori Sleeves + Constellation Astral Body — Ref #13!) ---
    gid_t = f'ext_{sex}_chorus_haori'
    parts_t = []
    const_vfx = {
        'kind': 'fresnel_ghost',
        'core_color': '#101016',
        'rim_color': '#d8d4ff',
        'accent_color': '#e2c478',
        'opacity': 0.94,
        'power': 2.5,
        'rim_gain': 1.25,
        'constellation': 0.90,
        'depth_write': True,
    }
    # Sleek constellation-engraved astral bodysuit from severed collar down to hips
    astral_suit = torso_tube(
        gid_t + '_astral_body', core.SHOULDER - 0.004, core.CROTCH - 0.01, ease=0.006, paint=astral_p, n=36, rows=16
    )
    tag_vfx(astral_suit, const_vfx, no_conform=True)
    parts_t.append(astral_suit)

    # Crisp wide ivory-white & gold-hemmed Haori side panels + ultra-wide kimono sleeves (leaving central engraved waist open, Ref #13!)
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        # Side/back Haori jacket panel wrapping outer shoulder & hip
        a_lo = (0.16 * math.pi) if sgn > 0 else (-0.80 * math.pi)
        a_hi = (0.80 * math.pi) if sgn > 0 else (-0.16 * math.pi)
        h_panel = torso_tube(
            f'{gid_t}_haori_panel_{tag}', core.SHOULDER + 0.002, core.CROTCH - 0.06, ease=0.028,
            paint=haori_p, n=18, arc=(a_lo, a_hi), hang_from=core.WAIST, flare=0.14, stiff=0.15
        )
        h_panel.no_conform = True
        parts_t.append(h_panel)

        # Ultra-wide billowing white-and-gold Haori sleeve (`wide=True`, flaring into dramatic square-draped kimono sleeve!)
        sh, el, wr = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')
        slv_h = limb_tube(
            f'{gid_t}_haori_sleeve_{tag}', None, None, 0.026, haori_p,
            n=26, rows=13, ease_end=0.145, start_back=0.048,
            path=[sh, el, wr], bvh=core.BVH_A, rmax=0.22, role='sleeve', side=tag, wide=True
        )
        # Sculpt dramatic hanging kimono-pouch drop (`-Z` in Blender coords) toward the cuff (Ref #13!)
        for r_k in range(slv_h.P.shape[0]):
            u_sl = r_k / max(slv_h.P.shape[0] - 1, 1)
            drop = (u_sl ** 1.35) * 0.145
            for c_k in range(slv_h.P.shape[1]):
                # Pull lower half of sleeve ring downward into classic furisode/haori drop!
                z_rel = slv_h.P[r_k, c_k, 2] - float(slv_h.P[r_k, :, 2].mean())
                if z_rel < 0.01:
                    slv_h.P[r_k, c_k, 2] -= drop * np.clip((-z_rel + 0.02) / 0.08, 0.25, 1.0)
        slv_h.no_conform = True
        parts_t.append(slv_h)

    ent_t = assemble_garment(
        gid_t, 'Chorus of Masks Astral Constellation Body & White Haori', 'torso', parts_t,
        auras=[{'kind': 'shifting_masks', 'bone': 'Spine1', 'offset': [0.0, 0.12, 0.0]}]
    )
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 5C. BACK: ext_{s}_chorus_monoliths (Floating Ring of 10 Golden Diamond Monoliths + Sinuous Barbed Tail — Ref #13!) ---
    gid_b = f'ext_{sex}_chorus_monoliths'
    parts_b = []

    # 10 faceted brushed-gold octahedral diamond monoliths hovering in an oval collar around the headless shoulders!
    z_col = core.SHOULDER + 0.050
    for k_d in range(10):
        ang_d = (k_d / 10.0) * 2.0 * math.pi + 0.15
        dc = np.array([math.sin(ang_d) * 0.198, math.cos(ang_d) * 0.118, z_col])
        parts_b.append(crystal_prism(
            f'{gid_b}_monolith_{k_d}', dc, up_w, 0.096, 0.044, gold_p, 'Spine2', sides=4,
            vfx={
                'kind': 'standard',
                'kinetic': {
                    'bone': 'Spine2', 'motion': 'chorus_wave',
                    'speed': 1.55, 'amp': 0.009, 'phase': k_d * 0.62,
                    'center_gl': bl_to_gl_pt(dc), 'axis_gl': [1.0, 0.0, 0.0],
                },
            }
        ))

    # Long sinuous S-curving grey-to-crimson barbed demon-tail sweeping gracefully behind & to the left (Ref #13!)
    hp = J('Hips')
    tail_ctrl = [
        hp + np.array([0.0,   0.095,  0.035]),
        hp + np.array([0.095, 0.195, -0.145]),
        hp + np.array([0.165, 0.235, -0.385]),
        hp + np.array([0.195, 0.185, -0.625]),
        hp + np.array([0.305, 0.145, -0.515]),
        hp + np.array([0.415, 0.115, -0.565]),
        hp + np.array([0.465, 0.085, -0.345]),
    ]
    t_pts = catmull_spline(tail_ctrl, 28)
    t_rads = np.linspace(0.036, 0.007, 28)
    parts_b.append(sweep_tube(
        gid_b + '_demon_tail', t_pts, t_rads, tail_p, n=12, rigid_joint='Hips', cap_ends=False
    ))
    # Jagged crimson flame-spear tail tip + dorsal barbs along the curve (Ref #13!)
    tip_dir = t_pts[-1] - t_pts[-3]
    tip_dir = tip_dir / max(float(np.linalg.norm(tip_dir)), 1e-6)
    parts_b.append(crystal_prism(
        gid_b + '_tail_spear', t_pts[-1] + tip_dir * 0.055, tip_dir, 0.155, 0.024, horn_p, 'Hips', sides=4
    ))
    for b_idx in (8, 12, 16, 20, 24):
        bp = t_pts[b_idx]
        bt = t_pts[min(27, b_idx + 1)] - t_pts[max(0, b_idx - 1)]
        bt = bt / max(float(np.linalg.norm(bt)), 1e-6)
        b_out = np.array([0.35, 0.55, 0.75]) if b_idx < 18 else np.array([0.65, 0.25, -0.70])
        b_out = b_out / np.linalg.norm(b_out)
        b_dir = b_out - bt * 0.45
        b_dir = b_dir / np.linalg.norm(b_dir)
        parts_b.append(sweep_tube(
            f'{gid_b}_tail_barb_{b_idx}', [bp, bp + b_dir * 0.052], [0.010, 0.0012],
            horn_p if b_idx >= 16 else tail_p, n=6, rigid_joint='Hips', cap_ends=False
        ))

    entries.append(assemble_garment(gid_b, 'Chorus of Masks Golden Collar-Monoliths & Barbed Demon-Tail', 'back', parts_b))

    # --- 5D. LEGS: ext_{s}_chorus_legs (Slender Engraved Obsidian-Astral Legs — Ref #13) ---
    gid_l = f'ext_{sex}_chorus_legs'
    parts_l = []
    leg_vfx = {
        'kind': 'fresnel_ghost',
        'core_color': '#101015',
        'rim_color': '#b8b4e8',
        'accent_color': '#d8c078',
        'opacity': 0.95,
        'power': 2.6,
        'rim_gain': 1.05,
        'constellation': 0.45,
        'depth_write': True,
    }
    seat_pt = torso_tube(gid_l + '_pelvis', core.WAIST - 0.01, core.CROTCH - 0.01, ease=0.005, paint=astral_p, n=32, rows=6)
    tag_vfx(seat_pt, leg_vfx, no_conform=True)
    parts_l.append(seat_pt)
    for side in ('Left', 'Right'):
        hip, kn, ft = J(side + 'UpLeg'), J(side + 'Leg'), J(side + 'Foot')
        leg_tb = limb_tube(
            f'{gid_l}_leg_{side[0]}', None, None, 0.004, astral_p,
            n=20, rows=14, path=[hip, kn, ft], role='leg', side=side[0]
        )
        tag_vfx(leg_tb, leg_vfx, no_conform=True)
        parts_l.append(leg_tb)

    ent_l = assemble_garment(gid_l, 'Chorus of Masks Engraved Astral Legs', 'legs', parts_l, legged=True)
    hide_full_body(ent_l)
    entries.append(ent_l)

    # --- 5E. FEET: ext_{s}_chorus_talons (Three-Taloned Obsidian & Ivory Demon-Claw Feet — Ref #13!) ---
    gid_f = f'ext_{sex}_chorus_talons'
    parts_f = []
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        ft, toe = J(side + 'Foot'), J(side + 'ToeBase', 'tail')
        # Sleek obsidian tarsal foot + 3 splayed curved ivory talons
        parts_f.append(sweep_tube(
            f'{gid_f}_instep_{side}',
            [ft + np.array([0.0, 0.032, 0.038]), 0.55 * toe + 0.45 * ft + np.array([0.0, -0.008, 0.016])],
            [0.036, 0.032], astral_p, n=10, rigid_joint=side + 'Foot', scale_xy=(1.05, 0.72), ref_dir=up_w
        ))
        for ti, lat_t in enumerate((-0.026, 0.0, 0.026)):
            t_root = 0.60 * toe + 0.40 * ft + np.array([lat_t * 0.75, -0.008, 0.016])
            t_mid  = toe + np.array([lat_t * 1.15, -0.022, 0.013])
            t_tip  = toe + np.array([lat_t * 1.45, -0.058, 0.003])
            parts_f.append(sweep_tube(
                f'{gid_f}_talon_{side}_{ti}', [t_root, t_mid, t_tip], [0.011, 0.0075, 0.0015],
                ivory_p, n=7, rigid_joint=side + 'Foot', cap_ends=False
            ))

    ent_f = assemble_garment(gid_f, 'Chorus of Masks Three-Taloned Demon Feet', 'feet', parts_f)
    ent_f['hide_parts'] = ['Human.toenails']
    apply_custom_hide(ent_f, select_body_tris(('LeftFoot', 'RightFoot', 'LeftToe', 'RightToe'), weight_thresh=0.15, mode='any'), replace=True)
    entries.append(ent_f)
    return entries


# ===============================================================================================================
# Master Culture Builder & Manifest Writer
# ===============================================================================================================
def build_extraplanar_kit():
    all_entries = []
    with extraplanar_motif_scope():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            all_entries.extend(_build_singularity_archon(sex))
            all_entries.extend(_build_censer_revenant(sex))
            all_entries.extend(_build_vox_solus(sex))
            all_entries.extend(_build_accretion_djinn(sex))
            all_entries.extend(_build_chorus_of_masks(sex))
    return all_entries


def main():
    t0 = time.time()
    entries = build_extraplanar_kit()
    manifest_path = CULTURES_DIR / 'extraplanar_manifest.json'
    manifest_path.write_text(json.dumps(entries, indent=2), encoding='utf-8')
    print(f'\nCompiled {len(entries)} extraplanar pieces in {time.time() - t0:.1f}s -> {manifest_path.name}')
    if '--register' in sys.argv:
        core.register_entries(entries)


if __name__ == '__main__':
    main()
