"""Build the Yuni Scout / Military Gear modular wardrobe kit (`culture: 'yuni'`)
from the 5 reference sheets for BOTH `mpfb_male` (`_m_`) and `mpfb_female` (`_f_`):

1. 5 Distinct Hats / Headgear (`slot: 'head'`, `covers_hair=True`):
   - `yuni_m/f_scout_slouch_hat` (Rows 01/02/05): Upturned-brim desert outback slouch hat with leather hatband, stitched brim patches, and side comms headset-mic.
   - `yuni_m/f_scout_tassel_hat` (Rows 06/07/08/10): Wide flat-brimmed Yuni disc hat with 8 hanging golden bead-tassels around the brim perimeter.
   - `yuni_m/f_scout_comms_helm` (Rows 11/13/15): Tactical olive-and-sand composite combat helmet with brow-mounted dust goggles and side headset ear-pods.
   - `yuni_m/f_scout_turban_keffiyeh` (Rows 17/23): Wrapped sage-olive desert turban with a thick layered neck-keffiyeh scarf.
   - `yuni_m/f_scout_hood_cowl` (Rows 12/14/16/18): Weathered indigo-and-olive desert ranger hood & draped shoulder-cowl with brow visor.

2. 5 Distinct Armor & Cloak Torso Rigs (`slot: 'torso'`):
   - `yuni_m/f_scout_patch_poncho` (Rows 01/04): Frayed sand-tan patchwork camouflage poncho-cloak (`jagged=0.045`) over a twin-pouch tactical chest rig, shoulder walkie-talkie, and hip rope-coil.
   - `yuni_m/f_scout_heavy_cuirass` (Rows 03/07/17): Heavy steel-and-tan ballistic chest plate, riveted metal forearm bracers, waist ammo-pouches, and a stitched rust-terracotta shoulder mantle (`jagged=0.04`).
   - `yuni_m/f_scout_medic_coat` (Rows 05/09): Cream-and-saffron Yuni combat-medic split coat with white-and-red-cross (`+`) hip medical satchels, glowing chest lantern-beacon, and saffron-ochre mantle.
   - `yuni_m/f_scout_sash_tunic` (Rows 16/18): Olive-and-sand ranger tunic with glowing cyan/amber chest-vial, cross-belts, and a long indigo-and-gold striped hanging waist-sash kilt.
   - `yuni_m/f_scout_greatcloak` (Rows 08/23): Long frayed desert-sand & slate-indigo border-striped great-cloak (`layer=2, jagged=0.045`) over a dark tactical multi-pouch brigandine vest.

3. 5 Distinct Backpacks & Cloaks (`slot: 'back'`):
   - `yuni_m/f_scout_radio_pack` (Rows 02/08/13/18/23): Boxed field transceiver radio backpack (`rigid_joint='Spine2'`) with glowing telemetry screen, dials, lower pouch, and tall whip-antenna.
   - `yuni_m/f_scout_canister_pack` (Row 15): Pressurized brass-and-olive backpack (`rigid_joint='Spine2'`) with a large glowing amber glass condenser-canister, twin side cylinders, and shoulder harness straps.
   - `yuni_m/f_scout_medic_pack` (Rows 05/09): Heavy canvas expedition rucksack (`rigid_joint='Spine2'`) with upper rolled bedroll, red-cross medical box pouch, side canteen, and shoulder straps.
   - `yuni_m/f_scout_tattered_cloak` (Rows 01/04/11): Standalone ragged multi-layer olive-and-sand patchwork sniper cloak (`cloth` chains, `jagged=0.05`) with stitched cloth patches.
   - `yuni_m/f_scout_ochre_mantle` (Rows 03/05/10/12): Standalone weathered saffron-ochre & terracotta patchwork desert shawl-cape (`cloth` chains, `jagged=0.045`) with rear belt utility pouch.

4. Shared Tactical Legs, Boots & Gloves (`slot: 'legs'`, `slot: 'feet'`, `slot: 'gloves'`):
   - `yuni_m/f_scout_cargo_pants`: Padded desert-tan & olive tactical cargo trousers with articulated knee-pads and thigh satchels.
   - `yuni_m/f_scout_combat_boots`: Rugged desert-suede & steel-toe ranger boots with strapped shin gaiters.
   - `yuni_m/f_scout_gloves`: Fingerless leather & armored-wrist scout bracer-gloves.

Writes `.glb` and `.morph.bin` files into `pieces/mpfb_male/` and `pieces/mpfb_female/`,
and saves the manifest JSON to `scratch/yuni_military_manifest.json`.
"""
import concurrent.futures
import json
import math
import os
import sys
import time
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[3]          # core/charactermodels (this file: tools/garments/cultures/)
SCRATCH = Path(__file__).resolve().parent             # the builders beside this one (once Gemini's scratch folder)
sys.path.insert(0, str(ROOT / 'tools'))

import garments as bio
from garments import core
from garments import (
    C, P, B, PN, Part, head_frame, hood, blob, horn, turban, set_body, J,
    spine_at, first_hit, chest_front, ring_points, flap
)

# Ensure custom Yuni desert/scout palette colors exist in C
C.setdefault('dunesand', (0.66, 0.57, 0.43))
C.setdefault('khaki', (0.68, 0.62, 0.46))
C.setdefault('sage', (0.45, 0.51, 0.39))
C.setdefault('olivegrey', (0.38, 0.41, 0.34))
C.setdefault('loden', (0.24, 0.29, 0.20))
C.setdefault('slateblue', (0.28, 0.35, 0.48))
C.setdefault('terracotta', (0.68, 0.35, 0.21))
C.setdefault('saffron', (0.90, 0.64, 0.18))
C.setdefault('yuniyellow', (0.96, 0.78, 0.18))
C.setdefault('amber', (0.96, 0.60, 0.10))
C.setdefault('cybercyan', (0.24, 0.85, 0.92))
C.setdefault('charcoal', (0.15, 0.15, 0.16))
C.setdefault('steel', (0.52, 0.55, 0.58))
C.setdefault('holyred', (0.76, 0.11, 0.11))

_ORIG_MOTIF = bio.paint.motif


def _yuni_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((h, w, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = (xx + 0.5) / max(w, 1), (yy + 0.5) / max(h, 1)

    if style == 'yuni_patchwork':
        # Tailored desert field cloth with subtle woven canvas grain, stitched reinforcement panels & trencadis mosaic piping
        folds = 0.94 + 0.04 * np.sin(u * 14.0 * math.pi + np.sin(v * 5.0 * math.pi) * 0.5) + 0.02 * np.cos(v * 48.0 * math.pi)
        img[:] = np.asarray(bg)[None, None, :] * folds[:, :, None]
        # Grid of offset tailored reinforcement panels
        gu = (u * 4.0) % 1.0
        gv = (v * 3.0 + 0.5 * np.floor(u * 4.0)) % 1.0
        in_patch = (gu > 0.16) & (gu < 0.84) & (gv > 0.20) & (gv < 0.80)
        patch_alt = ((np.floor(u * 4.0) + np.floor(v * 3.0)) % 2 == 0)
        p_col1 = 0.58 * np.asarray(fg) + 0.42 * np.asarray(bg)
        p_col2 = 0.82 * np.asarray(bg) + 0.18 * np.asarray(C['saddle'])
        img[in_patch & patch_alt] = p_col1 * folds[in_patch & patch_alt, None]
        img[in_patch & (~patch_alt)] = p_col2 * folds[in_patch & (~patch_alt), None]
        # Crisp saddle-stitched seam border around each panel
        b_u = (np.abs(gu - 0.16) < 0.020) | (np.abs(gu - 0.84) < 0.020)
        b_v = (np.abs(gv - 0.20) < 0.020) | (np.abs(gv - 0.80) < 0.020)
        on_border = (b_u & (gv >= 0.18) & (gv <= 0.82)) | (b_v & (gu >= 0.14) & (gu <= 0.86))
        stitch_tick = ((np.floor(gu * 32.0) + np.floor(gv * 32.0)) % 2 == 0)
        img[on_border & stitch_tick] = C['yuniyellow']
        img[on_border & (~stitch_tick)] = C['saddle']
        # Blend Yuni ceramic mosaic band along the bottom edge (v > 0.88)
        mosaic_tex = bio.paint.sample_cultural_tex('tex.yuni_mosaic', w, h, fg, bg)
        if mosaic_tex is not None:
            m_mask = v > 0.88
            img[m_mask] = 0.65 * mosaic_tex[m_mask] + 0.35 * img[m_mask]
        return img

    elif style == 'yuni_med_cross':
        # White canvas medical pouch/badge with bold red cross (+) and stitched leather rim
        su = (u - 0.5) * 2.0
        sv = (v - 0.5) * 2.0
        au, av = np.abs(su), np.abs(sv)
        badge = (au < 0.78) & (av < 0.78)
        rim = (au < 0.84) & (av < 0.84) & (~badge)
        img[rim] = C['leather']
        img[badge] = C['white']
        cross_h = (au < 0.46) & (av < 0.16)
        cross_v = (au < 0.16) & (av < 0.46)
        img[cross_h | cross_v] = fg
        return img

    elif style == 'yuni_ballistic_plate':
        # Heavy riveted steel-and-tan ballistic chest plate with bevelled trauma panel & webbing
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        plate = (au < 0.76) & (v > 0.12) & (v < 0.88)
        bevel = (au < 0.82) & (v > 0.08) & (v < 0.92) & (~plate)
        img[bevel] = C['soot']
        img[plate] = bg
        # Upper angled chest trauma plate + lower MOLLE webbing slots
        trauma = (au < 0.54) & (v > 0.20) & (v < 0.56)
        trauma_rim = (au < 0.58) & (v > 0.17) & (v < 0.59) & (~trauma)
        img[trauma_rim] = C['soot']
        img[trauma] = fg
        molle_row = (v > 0.64) & (v < 0.84) & (au < 0.68) & (np.abs(((v * 16.0) % 1.0) - 0.5) < 0.22)
        molle_slot = molle_row & (np.abs(((u * 18.0) % 1.0) - 0.5) < 0.15)
        img[molle_row] = C['leather']
        img[molle_slot] = C['soot']
        # Corner rivets
        for ru in (0.66, 0.46):
            for rv in (0.24, 0.52, 0.80):
                riv = np.hypot(au - ru, v - rv) < 0.028
                img[riv] = C['silver']
        return img

    elif style == 'yuni_brigandine_vest':
        # Dark tactical multi-pouch brigandine vest with horizontal straps & brass buckles
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        lame = np.abs(((v * 10.0) % 1.0) - 0.5) < 0.12
        center_zip = au < 0.045
        pouch_grid = (au > 0.12) & (au < 0.74) & (v > 0.18) & (v < 0.82) & (np.abs(((u * 8.0) % 1.0) - 0.5) < 0.36) & (np.abs(((v * 5.0) % 1.0) - 0.5) < 0.36)
        buckle = (np.abs(au - 0.28) < 0.035) & lame
        img[lame | center_zip] = C['soot']
        img[pouch_grid] = 0.55 * np.asarray(bg) + 0.45 * np.asarray(fg)
        img[buckle] = C['brass']
        return img

    elif style == 'yuni_indigo_sash':
        # Woven slate-indigo & gold vertical striped desert sash/kilt with Yuni trencadis mosaic diamond centers
        mosaic_tex = bio.paint.sample_cultural_tex('tex.yuni_mosaic', w, h, fg, bg)
        stripe_u = (u * 12.0) % 1.0
        gold_bar = (np.abs(stripe_u - 0.20) < 0.07) | (np.abs(stripe_u - 0.80) < 0.07)
        red_core = (np.abs(stripe_u - 0.50) < 0.09)
        diamond = (np.abs(stripe_u - 0.50) + np.abs(((v * 16.0) % 1.0) - 0.5)) < 0.24
        if mosaic_tex is not None:
            img[red_core] = 0.70 * mosaic_tex[red_core] + 0.30 * np.asarray(C['terracotta'])
        else:
            img[red_core] = C['terracotta']
        img[gold_bar | diamond] = fg
        return img

    elif style == 'yuni_radio_face':
        # Transceiver faceplate with glowing cyan-green telemetry screen & brass dials
        su = (u - 0.5) * 2.0
        screen = (su > -0.68) & (su < 0.18) & (v > 0.18) & (v < 0.56)
        bezel = (su > -0.74) & (su < 0.24) & (v > 0.14) & (v < 0.60) & (~screen)
        grid_line = screen & ((np.abs(((u * 24.0) % 1.0) - 0.5) < 0.08) | (np.abs(((v * 20.0) % 1.0) - 0.5) < 0.08))
        wave = screen & (np.abs(v - (0.37 + 0.08 * np.sin(u * 28.0))) < 0.025)
        img[bezel] = C['soot']
        img[screen] = (0.10, 0.32, 0.28)
        img[grid_line] = (0.18, 0.58, 0.50)
        img[wave] = C['cybercyan']
        for dv in (0.28, 0.48):
            dial = np.hypot(su - 0.48, v - dv) < 0.10
            knob = np.hypot(su - 0.48, v - dv) < 0.05
            img[dial] = C['brass']
            img[knob] = C['soot']
        return img

    return _ORIG_MOTIF(style, w, h, fg, bg, aspect=aspect)


bio.paint.motif = _yuni_motif
bio.motif = _yuni_motif


# ===============================================================================================================
# Shared Geometry Helpers (Body-aware via `core.*`)
# ===============================================================================================================
def assemble_garment(gid, label, slot, culture, parts, **kw):
    flat_parts = []
    for p in parts:
        if isinstance(p, (list, tuple)):
            flat_parts.extend(p)
        elif p is not None:
            flat_parts.append(p)
    entry = bio.assemble_garment(gid, label, slot, culture, flat_parts, **kw)
    entry['culture'] = culture
    return entry


def torso_tube(name, z_bot, z_top, paint, ease=0.024, flare=0.0, rows=20, n=36, yoke=False, **kw):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    hang_from = min(z0 - 0.03, core.WAIST - 0.02) if (flare > 0 or z1 < core.CROTCH) else None
    grp_below = (core.CROTCH + 0.02) if z1 < core.CROTCH else None
    hull_from = min(z0, core.WAIST) if z1 < core.WAIST else None
    jagged = kw.get('jagged', kw.get('Jagged', 0.0))
    pts = (jagged, 2.0) if jagged else None
    layer = kw.get('layer', None)
    arc = kw.get('arc', None)
    over_arms = kw.get('over_arms', False)
    use_cloth = kw.get('cloth', False)
    main_part = bio.torso_tube(name, z0, z1, ease, paint, n=n, rows=rows,
                               hang_from=hang_from, flare=flare,
                               group_below=grp_below, hull_from=hull_from,
                               points=pts, layer=layer, arc=arc, over_arms=over_arms)
    if not use_cloth:
        main_part.cloth = None
    if yoke and z0 >= core.NECK[2] - 0.015:
        yoke_part = bio.collar_disc(f'{name}_yoke', 0.085, P('gold', 0.02, fabric='metal.gold'),
                                    drop=0.032, rows=4, n=36, scallop=0.0, ease=ease + 0.004, z_off=0.004)
        yoke_part.cloth = None
        return [main_part, yoke_part]
    return main_part


def sleeve(name, side, paint, f0=0.0, f1=0.92, ease=0.020, flare=0.008, rows=12, n=22):
    a, e, h = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')

    def pt_at(f):
        if f <= 0.5:
            return a + (e - a) * (f / 0.5)
        return e + (h - e) * ((f - 0.5) / 0.5)

    if f0 < 0.48 and f1 > 0.52:
        path = [pt_at(f0), e, pt_at(f1)]
    else:
        path = [pt_at(f0), pt_at(f1)]
    sb = 0.095 if f0 < 0.05 else 0.0
    return bio.limb_tube(name, None, None, ease, paint, n=n, rows=rows,
                         ease_end=ease + flare, start_back=sb, path=path, bvh=core.BVH_A, rmax=0.20)


def trousers(gid, paint, ankle_f=0.78, ease=0.022, bag=0.025, rows=16, n=26):
    out = [
        bio.torso_tube(f'{gid}_pelvis', core.WAIST + 0.01, core.CROTCH + 0.02, ease, paint,
                       n=36, rows=6, hull_from=core.WAIST)
    ]
    for s in ('Left', 'Right'):
        hip, knee, foot = J(s + 'UpLeg'), J(s + 'Leg'), J(s + 'Foot')
        ank = knee + (foot - knee) * ankle_f
        pt = bio.limb_tube(f'{gid}_{s}', None, None, ease, paint, n=n, rows=rows,
                           ease_end=max(0.014, ease * 0.75), start_back=0.03,
                           path=[hip, knee, ank], rmax=0.19)
        if bag > 0:
            for k in range(rows):
                u = k / max(rows - 1, 1)
                b_add = bag * (math.sin(math.pi * u) ** 1.2)
                c = pt.P[k].mean(axis=0)
                vecs = pt.P[k] - c
                vecs[:, 2] = 0.0
                norms = np.linalg.norm(vecs, axis=1, keepdims=True)
                dirs = vecs / np.maximum(norms, 1e-6)
                pt.P[k] = pt.P[k] + dirs * b_add
        out.append(pt)
    return out


def skirt(name, z_bot, z_top, paint, ease=0.028, flare=0.08, rows=12, n=36, jagged=0.0, layer=None):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    pts = (jagged, 2.0) if jagged else None
    return bio.torso_tube(name, z0, z1, ease, paint, n=n, rows=rows,
                          hang_from=z0 - 0.01, flare=flare,
                          group_below=core.CROTCH + 0.02, hull_from=z0, points=pts, layer=layer)


def cape(name, z_bot, z_top, paint, arc=1.05, ease=0.056, flare=0.11, rows=20, n=32, jagged=0.0, layer=2, over_arms=False):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    e_top = max(ease, 0.050)
    e_bot = e_top + 0.024
    pts = (jagged, 2.0) if jagged else None
    pt = bio.torso_tube(name, z0, z1, e_top, paint, n=n, rows=rows,
                        arc=(-arc, arc), hang_from=min(z0 - 0.04, core.WAIST - 0.02),
                        ease_bottom=e_bot, flare=flare, group_below=core.CROTCH + 0.02,
                        hull_from=min(z0, core.WAIST),
                        over_arms=over_arms, points=pts, layer=layer)
    pt.cloth = None
    return pt


def boot(name, side, paint, top_f=0.12, ease=0.018, rows=15, n=24, cuff=0.014, sole_paint=None):
    foot, toe, tip, knee = J(side + 'Foot'), J(side + 'ToeBase'), J(side + 'ToeBase', 'tail'), J(side + 'Leg')
    heel = np.array([foot[0], foot[1] + 0.05, 0.0])
    front = np.array([tip[0], tip[1] - 0.015, 0.0])
    axis = front - heel
    Q_sole = []
    for k in range(10):
        c = heel + axis * (k / 9.0)
        c[2] = 0.012
        w_s = 0.054 + 0.014 * math.sin(math.pi * min(1.0, k / 9.0 * 1.2))
        Q_sole.append([c + np.array([math.cos(an) * w_s, 0, math.sin(an) * 0.012])
                       for an in np.linspace(0, 2 * math.pi, 16, endpoint=False)])
    p_sole = Part(f'{name}_sole', np.array(Q_sole), True, ['body'] * 10, sole_paint or paint)

    shaft_frac = max(0.32, min(0.96, 1.0 - top_f))
    up_pt = foot + (knee - foot) * shaft_frac
    p_shaft = bio.limb_tube(f'{name}_shaft', up_pt, np.array([foot[0], foot[1], 0.035]),
                            ease + cuff, paint, n=n, rows=rows, ease_end=ease, rmax=0.15)

    hb = first_hit(np.array([foot[0], foot[1], 0.035]), np.array([0, 1.0, 0]), maxd=0.15) or 0.05
    fa = np.array([foot[0], foot[1] + hb - 0.008, 0.042])
    fb = np.array([tip[0], tip[1] - 0.018, 0.028])
    p_foot = bio.limb_tube(f'{name}_foot', fa, fb, max(0.015, ease * 0.85), paint,
                           n=18, rows=11, ease_end=max(0.015, ease * 0.88), rmax=0.098)
    for k in (0, -1):
        c = p_foot.P[k].mean(0)
        p_foot.P[k] = c + (p_foot.P[k] - c) * 0.3
    return [p_sole, p_shaft, p_foot]


def collar(name, paint, h=0.08, flare=0.03, open_front=0.0, rows=7, n=30, ease_base=0.022):
    z_top_max = min(core.TOP + h, core.NECK[2] + 0.010)
    zs = np.linspace(z_top_max, core.TOP - 0.018, rows)
    closed = open_front <= 0.02
    if closed:
        angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    else:
        half = math.pi - open_front * 0.45
        angs = np.linspace(-half, half, n)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    Q = []
    for k, z in enumerate(zs):
        u_top = 1.0 - (k / max(rows - 1, 1))
        e_k = ease_base + flare * u_top
        Q.append(ring_points(spine_at(z), x, y, angs, e_k, rmin=0.055, rmax=0.145, bvh=core.BVH_T))
    return Part(name, np.array(Q), closed, ['body'] * rows, paint)


def sculpted_cranium(name, paint, f_top=1.05, f_bot=-0.06, ease=0.008, rows=14, n=36):
    a, b, up, bk, left = head_frame()
    f_bot_safe = max(f_bot, 0.58)
    fs = np.linspace(f_top, f_bot_safe, rows)
    angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    Q = []
    for k, f in enumerate(fs):
        c = a + (b - a) * f
        dome_s = 1.0 if f <= 0.74 else max(0.05, math.cos(math.pi * 0.5 * min(1.0, (f - 0.74) / max(0.08, f_top - 0.74))) ** 0.82)
        neck_taper = 1.0 - 0.16 * max(0.0, (0.28 - f) / 0.38)
        rx = (0.104 + ease) * dome_s * neck_taper
        ry = (0.136 + ease) * dome_s * neck_taper
        Q.append([c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - 0.006 * dome_s) for an in angs])
    return Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint='Head')


def tabard(name, z_bot, z_top, width, paint, front=True, back=False, ease=0.038, flare=0.02, center_ang=None):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    rows = 16
    n = 15
    zs = np.linspace(z0, z1, rows)
    half_ang = min(0.58, max(0.14, (width * 0.5) / 0.145))
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    hang_z = min(z0, core.WAIST)
    z_anchor = max(hang_z, core.CROTCH + 0.05)
    c_anchor = spine_at(z_anchor)

    def _make_panel(panel_name, c_ang):
        angs = np.linspace(c_ang - half_ang, c_ang + half_ang, n)
        anchor_ring = np.array(ring_points(c_anchor, x, y, angs, ease, rmin=0.10, rmax=0.28, bvh=core.BVH))
        anchor_xy = anchor_ring[:, :2] - c_anchor[:2]
        anchor_r = np.linalg.norm(anchor_xy, axis=1, keepdims=True)
        anchor_dir = anchor_xy / np.maximum(anchor_r, 1e-6)
        P_rows = []
        for z in zs:
            cz = spine_at(z)
            if z >= core.CROTCH + 0.04:
                ring = np.array(ring_points(cz, x, y, angs, ease, rmin=0.10, rmax=0.28, bvh=core.BVH))
                if z < hang_z:
                    drop = hang_z - z
                    xy = ring[:, :2] - cz[:2]
                    r_cur = np.linalg.norm(xy, axis=1, keepdims=True)
                    r_want = np.maximum(r_cur, anchor_r + flare * drop)
                    ring[:, :2] = cz[:2] + anchor_dir * r_want
                P_rows.append(ring)
            else:
                drop = max(0.0, hang_z - z)
                leg_ring = np.array(ring_points(cz, x, y, angs, ease + 0.028, rmin=0.10, rmax=0.34, bvh=core.BVH))
                leg_r = np.linalg.norm(leg_ring[:, :2] - cz[:2], axis=1, keepdims=True)
                r_want = np.maximum(leg_r, anchor_r + ease * 0.45 + max(flare, 0.06) * drop)
                xy = cz[:2] + anchor_dir * r_want
                row_pts = np.column_stack([xy, np.full(n, z)])
                P_rows.append(row_pts)
        grp = ['helper-skirt' if z < core.CROTCH + 0.02 else 'body' for z in zs]
        pt = Part(panel_name, np.array(P_rows), False, grp, paint)
        pt.layer = 2
        start_row = next((i for i, z in enumerate(zs) if z < hang_z + 0.01), rows // 2)
        if start_row < rows - 2:
            pt.cloth = {'start': start_row, 'stiff': 0.16, 'layer': 2}
        return pt

    out = []
    if center_ang is not None:
        out.append(_make_panel(name, center_ang))
    else:
        if front:
            out.append(_make_panel(f'{name}_front', math.pi))
        if back:
            out.append(_make_panel(f'{name}_back', 0.0))
    return out


def belt_sash(name, z_bot, z_top, paint, ease=0.038):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    return bio.torso_tube(name, z0, z1, ease, paint, n=40, rows=6, hull_from=z0)


def crossed_sash(name, paint, width=0.055, ease=0.032, high=math.pi * 0.45):
    return bio.band(name, core.WAIST, core.SHOULDER + 0.02, width, ease, paint, high=high, rows=5)


def pauldron(name, side, paint, span=0.20, drop=0.16, lift=0.022):
    return bio.pauldron(name, side, paint,
                        reach=min(0.65, max(0.25, drop * 2.6)),
                        ease=0.026 + lift * 0.5,
                        flare_end=1.06,
                        span=max(1.35, min(1.95, span * 7.5)),
                        rows=7, n=16)


def tube(name, path, r, paint, n=8, rigid_joint=None):
    return bio.horn(name, path, r, r, paint, n=n, rows=max(5, len(path) * 2), rigid_joint=rigid_joint)


def strap(name, path, width, paint, rigid_joint=None):
    return bio.horn(name, path, width * 0.5, width * 0.5, paint, n=8, rows=max(5, len(path) * 2), rigid_joint=rigid_joint)


def tassel(name, top_pos, length, radius, paint, rigid_joint=None):
    bot_pos = np.asarray(top_pos, float) - np.array([0.0, 0.0, length])
    return bio.horn(name, [top_pos, bot_pos], radius * 0.85, radius * 1.15, paint, n=8, rows=6, rigid_joint=rigid_joint)


def rosette(name, center, out_vec, side_vec, radius, paint, n=14, thick=0.014, rigid_joint=None):
    return bio.blob(name, center, (radius * 2.0, thick * 2.0, radius * 2.0), paint,
                    n=n, rows=5, out=out_vec, rigid_joint=rigid_joint)


def glove(name, side, hand_paint, cuff_paint=None, finger_paint=None, f0=0.60, ease=0.015):
    """Build a fingerless leather & armored-wrist scout bracer-glove with per-phalanx bone bindings."""
    out = []
    out.append(sleeve(f'{name}_cuff_{side}', side, cuff_paint or hand_paint, f0=f0, f1=0.98, ease=ease, flare=0.010, rows=8, n=20))
    w_pt = J(side + 'Hand')
    idx1 = J(side + 'HandIndex1')
    mid1 = J(side + 'HandMiddle1')
    rng1 = J(side + 'HandRing1')
    pnk1 = J(side + 'HandPinky1')
    knuckle_ctr = 0.25 * (idx1 + mid1 + rng1 + pnk1)
    d_hand = knuckle_ctr - w_pt
    u_ax = d_hand / max(np.linalg.norm(d_hand), 1e-6)
    span_vec = idx1 - pnk1
    x_ax = span_vec - u_ax * np.dot(span_vec, u_ax)
    x_ax = x_ax / max(np.linalg.norm(x_ax), 1e-6)
    y_ax = np.cross(u_ax, x_ax)
    if np.linalg.norm(y_ax) > 1e-6:
        y_ax = y_ax / np.linalg.norm(y_ax)
    angs_p = np.linspace(0, 2 * math.pi, 20, endpoint=False)
    palm_rows = []
    for s in np.linspace(0.0, 0.96, 6):
        c = w_pt + d_hand * s
        rx = 0.040 + 0.007 * s
        ry = 0.021 * (1.0 - 0.12 * s)
        palm_rows.append([c + x_ax * (math.cos(an) * rx) + y_ax * (math.sin(an) * ry) for an in angs_p])
    pt_palm = Part(f'{name}_palm_{side}', np.array(palm_rows), True, ['helper-tights'] * 6, hand_paint, rigid_joint=side + 'Hand')
    pt_palm.is_arm = True
    out.append(pt_palm)
    f_paint = finger_paint or P('buck', 0.03, [
        B('top', 0.0, 0.48, 'solid', 'leather'),
        B('top', 0.48, 0.55, 'solid', 'soot'),
    ], fabric='leather.buckskin')
    for fg, r_base in (('Thumb', 0.0108), ('Index', 0.0094), ('Middle', 0.0098), ('Ring', 0.0092), ('Pinky', 0.0084)):
        p1 = J(f'{side}Hand{fg}1')
        p2 = J(f'{side}Hand{fg}2')
        p3 = J(f'{side}Hand{fg}3')
        tip_dir = p3 - p2
        root_pt = p1 - 0.16 * (p2 - p1)
        mid12 = 0.5 * (p1 + p2)
        tip1 = p3 + 0.78 * tip_dir
        tip2 = p3 + 1.04 * tip_dir
        f_pts = [root_pt, p1, mid12, p2, p3, tip1, tip2]
        f_rads = [r_base * 1.04, r_base, r_base * 0.95, r_base * 0.90, r_base * 0.82, r_base * 0.65, 0.0020]
        f_joints = [
            f'{side}Hand',
            f'{side}Hand{fg}1',
            f'{side}Hand{fg}1',
            f'{side}Hand{fg}2',
            f'{side}Hand{fg}3',
            f'{side}Hand{fg}3',
            f'{side}Hand{fg}3',
        ]
        angs_f = np.linspace(0, 2 * math.pi, 10, endpoint=False)
        f_rows = []
        for idx_r, (cp, rad) in enumerate(zip(f_pts, f_rads)):
            seg_d = (f_pts[min(idx_r + 1, len(f_pts) - 1)] - f_pts[max(idx_r - 1, 0)])
            t_v = seg_d / max(np.linalg.norm(seg_d), 1e-6)
            ref_v = np.array([0.0, 0.0, 1.0]) if abs(t_v[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
            u_v = np.cross(t_v, ref_v)
            u_v /= np.linalg.norm(u_v) + 1e-12
            v_v = np.cross(t_v, u_v)
            v_v /= np.linalg.norm(v_v) + 1e-12
            f_rows.append([cp + (u_v * math.cos(an) + v_v * math.sin(an)) * rad for an in angs_f])
        pt_f = Part(f'{name}_finger_{side}_{fg}', np.array(f_rows), True, ['helper-tights'] * len(f_rows), f_paint)
        pt_f.row_joints = f_joints
        pt_f.is_arm = True
        out.append(pt_f)
    return out


def _add_pack_harness(parts_k, gid_k, sp1, sp2, strap_p):
    """Add contoured leather shoulder harness straps wrapping cleanly over the shoulders."""
    x_ax, y_ax = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        s_rows = []
        for ang_s, z_s in (
            (sgn * 0.32, sp2[2] + 0.09),
            (sgn * 0.55, sp2[2] + 0.13),
            (math.pi - sgn * 0.55, sp2[2] + 0.12),
            (math.pi - sgn * 0.48, sp2[2] + 0.03),
            (math.pi - sgn * 0.52, sp1[2] - 0.02),
            (sgn * 0.42, sp1[2] - 0.03),
        ):
            angs_w = np.linspace(ang_s - 0.075, ang_s + 0.075, 4)
            s_rows.append(ring_points(spine_at(z_s), x_ax, y_ax, angs_w, 0.038, rmin=0.09, rmax=0.26, bvh=core.BVH_T))
        parts_k.append(Part(f'{gid_k}_harness_{tag}', np.array(s_rows), False, ['body'] * len(s_rows), strap_p))


# ===============================================================================================================
# 1. Five Distinct Hats / Headgear (`slot: 'head'`)
# ===============================================================================================================
def _build_yuni_headgear(sex, body_id):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    # -----------------------------------------------------------------------------------------------------------
    # 1A. yuni_m/f_scout_slouch_hat (Rows 01/02/05):
    #     Upturned-brim desert outback slouch hat with leather hatband, stitched brim patches & comms headset-mic
    # -----------------------------------------------------------------------------------------------------------
    gid_h1 = f'yuni_{sex}_scout_slouch_hat'
    parts_h1 = []
    # Inner dark leather skull-liner so hair is cleanly covered
    parts_h1.append(sculpted_cranium(gid_h1 + '_liner', P('umber', 0.03, fabric='leather.buckskin'),
                                     f_top=0.92, f_bot=0.22, ease=0.005))
    slouch_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.06, 'solid', 'leather'),
        B('bottom', 0.06, 0.08, 'solid', 'brass'),
    ], [
        PN(0.10, 0.90, 'yuni_patchwork', 'khaki', 'dunesand', 0.18),
    ], fabric='leather.buckskin')

    # Pinched outback crown (top-to-bottom row ordering)
    angs_h = np.linspace(0, 2 * math.pi, 40, endpoint=False)
    crown_rows = []
    for f_c, rx_c, ry_c, pinch in (
        (1.16, 0.012, 0.016, 0.0),
        (1.12, 0.072, 0.112, 0.22),
        (0.96, 0.098, 0.128, 0.16),
        (0.76, 0.108, 0.136, 0.06),
        (0.56, 0.112, 0.140, 0.0),
    ):
        c_pt = a + (b - a) * f_c
        row_c = []
        for an in angs_h:
            sx, cy = math.sin(an), math.cos(an)
            # Side pinch indents near the front-top of the crown
            indent = 1.0 - pinch * (abs(sx) ** 1.4) * max(0.0, -cy + 0.3)
            dz_crease = -0.012 * pinch * (1.0 - abs(sx))
            row_c.append(c_pt + left * (sx * rx_c * indent) + bk * (cy * ry_c - 0.006) + up * dz_crease)
        crown_rows.append(row_c)
    parts_h1.append(Part(gid_h1 + '_crown', np.array(crown_rows), True, ['body'] * len(crown_rows), slouch_p, rigid_joint='Head'))

    # Wide asymmetric desert slouch brim: turned sharply UP on the left side (`sx > 0.15`), dipping slightly in front/back
    brim_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'umber'),
        B('top', 0.0, 0.04, 'solid', 'leather'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'sand', 'dunesand', 0.16),
    ], fabric='leather.buckskin')
    c_brim = a + (b - a) * 0.58
    brim_rows = []
    for s_b, dz_lip in ((0.0, 0.004), (0.35, 0.002), (0.72, 0.0), (1.0, -0.002), (0.96, -0.007), (0.05, -0.005)):
        row_b = []
        for an in angs_h:
            sx, cy = math.sin(an), math.cos(an)
            # Left side (`sx > 0`) turns sharply upward & folds slightly inward against the crown
            up_fold = max(0.0, sx - 0.05) ** 1.55
            r_x = 0.110 + s_b * (0.115 - 0.048 * up_fold)
            r_y = 0.138 + s_b * 0.110
            z_curl = (0.088 * up_fold * (s_b ** 1.25)) - (0.014 * (abs(cy) ** 1.6) * s_b) + dz_lip
            row_b.append(c_brim + left * (sx * r_x) + bk * (cy * r_y - 0.006) + up * z_curl)
        brim_rows.append(row_b)
    parts_h1.append(Part(gid_h1 + '_brim', np.array(brim_rows), True, ['body'] * len(brim_rows), brim_p, rigid_joint='Head'))

    # Brass snap-badge pinning the upturned left brim to the crown + right-side comms ear-pod & boom-mic
    parts_h1.append(rosette(gid_h1 + '_brim_snap', c_brim + left * 0.145 + up * 0.058, left, -bk, 0.018,
                            P('brass', 0.02, fabric='metal.bronze'), n=10, thick=0.010, rigid_joint='Head'))
    ear_r = a + (b - a) * 0.36 - left * 0.106 + bk * 0.005
    parts_h1.append(rosette(gid_h1 + '_comms_ear', ear_r, -left, -bk, 0.026,
                            P('olive', 0.03, [B('top', 0.0, 0.015, 'solid', 'brass')], fabric='metal.iron'),
                            n=12, thick=0.016, rigid_joint='Head'))
    mic_pts = [
        ear_r - bk * 0.015 - up * 0.010,
        a + (b - a) * 0.24 - left * 0.092 - bk * 0.075,
        a + (b - a) * 0.16 - left * 0.042 - bk * 0.138,
    ]
    parts_h1.append(tube(gid_h1 + '_boom_mic', mic_pts, 0.0055, P('soot', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='metal.iron'),
                         n=8, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h1, 'Yuni Outback Slouch Hat & Comms Mic', 'head', 'yuni', parts_h1, covers_hair=True))

    # -----------------------------------------------------------------------------------------------------------
    # 1B. yuni_m/f_scout_tassel_hat (Rows 06/07/08/10):
    #     Wide flat-brimmed Yuni disc hat with 8 hanging golden bead-tassels around the brim perimeter
    # -----------------------------------------------------------------------------------------------------------
    gid_h2 = f'yuni_{sex}_scout_tassel_hat'
    parts_h2 = []
    parts_h2.append(sculpted_cranium(gid_h2 + '_liner', P('umber', 0.03, fabric='leather.buckskin'),
                                     f_top=0.88, f_bot=0.22, ease=0.005))
    disc_p = P('sand', 0.04, [
        B('bottom', 0.0, 0.05, 'fret', 'umber', 'gold', 0.03),
        B('top', 0.0, 0.04, 'solid', 'leather'),
    ], [
        PN(0.15, 0.85, 'stripes', 'umber', 'sand', 0.025),
    ], fabric='straw.plaited')

    # Flat-topped low cylindrical crown
    t_crown_rows = []
    for f_d, rx_d, ry_d in (
        (0.95, 0.012, 0.012),
        (0.94, 0.106, 0.126),
        (0.78, 0.112, 0.134),
        (0.58, 0.114, 0.138),
    ):
        c_d = a + (b - a) * f_d
        t_crown_rows.append([c_d + left * (math.sin(an) * rx_d) + bk * (math.cos(an) * ry_d - 0.005) for an in angs_h])
    parts_h2.append(Part(gid_h2 + '_crown', np.array(t_crown_rows), True, ['body'] * len(t_crown_rows), disc_p, rigid_joint='Head'))

    # Wide flat horizontal disc brim (`radius ~ 0.235m`) at `f=0.58`
    c_disc = a + (b - a) * 0.58
    disc_rows = []
    for r_x, r_y, dz_d in (
        (0.112, 0.136, 0.006),
        (0.175, 0.192, 0.004),
        (0.232, 0.242, 0.001),
        (0.236, 0.246, -0.005),
        (0.170, 0.188, -0.006),
        (0.112, 0.136, -0.004),
    ):
        disc_rows.append([c_disc + left * (math.sin(an) * r_x) + bk * (math.cos(an) * r_y - 0.005) + up * dz_d for an in angs_h])
    parts_h2.append(Part(gid_h2 + '_flat_brim', np.array(disc_rows), True, ['body'] * len(disc_rows), disc_p, rigid_joint='Head'))

    # 8 hanging golden-ochre bead-tassels spaced around the flat brim perimeter
    tassel_p = P('yuniyellow', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'umber'),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
    ], fabric='metal.gold')
    for k_t in range(8):
        an_t = (k_t + 0.5) * (2.0 * math.pi / 8.0)
        t_top = c_disc + left * (math.sin(an_t) * 0.224) + bk * (math.cos(an_t) * 0.234 - 0.005) - up * 0.005
        parts_h2.append(tassel(f'{gid_h2}_tassel_{k_t}', t_top, 0.062, 0.0095, tassel_p, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h2, 'Yuni Tassel-Brimmed Scout Disc Hat', 'head', 'yuni', parts_h2, covers_hair=True))

    # -----------------------------------------------------------------------------------------------------------
    # 1C. yuni_m/f_scout_comms_helm (Rows 11/13/15):
    #     Tactical olive-and-sand composite combat helmet with brow-mounted dust goggles & side headset ear-pods
    # -----------------------------------------------------------------------------------------------------------
    gid_h3 = f'yuni_{sex}_scout_comms_helm'
    parts_h3 = []
    parts_h3.append(sculpted_cranium(gid_h3 + '_liner', P('charcoal', 0.03, fabric='cloth.quilted'),
                                     f_top=0.96, f_bot=0.12, ease=0.006))
    helm_p = P('olive', 0.03, [
        B('bottom', 0.0, 0.035, 'solid', 'dunesand'),
        B('top', 0.0, 0.03, 'solid', 'drab'),
    ], [
        PN(0.18, 0.82, 'yuni_ballistic_plate', 'dunesand', 'olive', 0.16),
    ], fabric='metal.iron')

    # Composite combat helmet shell from crown (`f=1.08`) to brow/nape (`f=0.44`)
    helm_rows = []
    for f_h, rx_h, ry_h in (
        (1.08, 0.015, 0.015),
        (1.04, 0.078, 0.092),
        (0.92, 0.116, 0.142),
        (0.72, 0.124, 0.152),
        (0.54, 0.126, 0.154),
        (0.52, 0.112, 0.138),
    ):
        c_h = a + (b - a) * f_h
        helm_rows.append([c_h + left * (math.sin(an) * rx_h) + bk * (math.cos(an) * ry_h - 0.006) for an in angs_h])
    parts_h3.append(Part(gid_h3 + '_shell', np.array(helm_rows), True, ['body'] * len(helm_rows), helm_p, rigid_joint='Head'))

    # Brow-mounted tactical dust goggles strap + twin amber/cyan tinted lens pods on the forehead (`f=0.64`)
    parts_h3.append(bio.crown_band(gid_h3 + '_goggle_band', P('soot', 0.02, [B('top', 0.0, 0.015, 'solid', 'brass')], fabric='leather.polished'),
                                   f0=0.58, f1=0.72, ease=0.022, flare=0.004, rows=4, n=36))
    lens_p = P('amber', 0.01, [B('top', 0.0, 0.018, 'solid', 'soot'), B('bottom', 0.0, 0.018, 'solid', 'brass')], fabric='beads.glass')
    pod_p = P('olive', 0.03, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='metal.iron')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        g_pos = a + (b - a) * 0.65 + left * (sgn * 0.046) - bk * 0.146
        parts_h3.append(rosette(f'{gid_h3}_goggle_{tag}', g_pos, -bk, left, 0.028, lens_p, n=12, thick=0.016, rigid_joint='Head'))
        ear_pos = a + (b - a) * 0.38 + left * (sgn * 0.110) + bk * 0.004
        parts_h3.append(rosette(f'{gid_h3}_earpod_{tag}', ear_pos, left * sgn, -bk, 0.032, pod_p, n=12, thick=0.018, rigid_joint='Head'))
    # Short vertical helmet antenna on left ear-pod
    ant_base = a + (b - a) * 0.42 + left * 0.118 + bk * 0.008
    parts_h3.append(horn(gid_h3 + '_helm_ant', [ant_base, ant_base + up * 0.16], 0.006, 0.0025,
                         P('brass', 0.02, fabric='metal.bronze'), n=8, rows=5, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h3, 'Yuni Tactical Comms Helmet & Dust Goggles', 'head', 'yuni', parts_h3, covers_hair=True))

    # -----------------------------------------------------------------------------------------------------------
    # 1D. yuni_m/f_scout_turban_keffiyeh (Rows 17/23):
    #     Wrapped sage-olive desert turban with a thick layered neck-keffiyeh scarf
    # -----------------------------------------------------------------------------------------------------------
    gid_h4 = f'yuni_{sex}_scout_turban_keffiyeh'
    parts_h4 = []
    turb_base_p = P('sage', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'olive'),
        B('top', 0.0, 0.04, 'solid', 'dunesand'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'dunesand', 'sage', 0.16),
    ], fabric='cloth.cotton.coarse')
    turb_wrap_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'umber'),
        B('top', 0.0, 0.025, 'solid', 'sage'),
    ], fabric='cloth.weave.burlap')
    parts_h4.extend(turban(gid_h4 + '_turban', turb_base_p, wrap_paint=turb_wrap_p, size=0.82, ribbons=4))

    # Thick layered neck-keffiyeh scarf + draped shoulder cowl (`Row 23`)
    keff_p = P('sage', 0.04, [
        B('bottom', 0.0, 0.05, 'trencadis', 'yuniyellow', 'olive', 0.045),
        B('top', 0.0, 0.04, 'solid', 'dunesand'),
    ], [
        PN(0.10, 0.90, 'yuni_patchwork', 'olive', 'sage', 0.18),
    ], fabric='cloth.weave.burlap')
    parts_h4.append(collar(gid_h4 + '_neck_wrap', keff_p, h=0.075, flare=0.038, open_front=0.0, rows=7, n=32, ease_base=0.026))
    parts_h4.append(torso_tube(gid_h4 + '_shoulder_drape', core.SHOULDER - 0.04, core.TOP + 0.01, keff_p,
                               ease=0.038, flare=0.05, rows=8, n=34, jagged=0.0, over_arms=True))
    entries.append(assemble_garment(gid_h4, 'Yuni Wrapped Desert Turban & Neck-Keffiyeh', 'head', 'yuni', parts_h4, covers_hair=True))

    # -----------------------------------------------------------------------------------------------------------
    # 1E. yuni_m/f_scout_hood_cowl (Rows 12/14/16/18):
    #     Weathered indigo-and-olive desert ranger hood & draped shoulder-cowl with brow visor
    # -----------------------------------------------------------------------------------------------------------
    gid_h5 = f'yuni_{sex}_scout_hood_cowl'
    parts_h5 = []
    hood_p = P('slateblue', 0.04, [
        B('bottom', 0.0, 0.05, 'trencadis', 'yuniyellow', 'dunesand', 0.045),
        B('top', 0.0, 0.04, 'solid', 'indigo'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'sage', 'slateblue', 0.20),
    ], fabric='cloth.weave.burlap')
    parts_h5.append(hood(gid_h5 + '_hood', hood_p, ease=0.034, ease_low=0.056, open_front=0.72, low=-0.52, rows=14, n=34, peak=0.06))
    parts_h5.append(torso_tube(gid_h5 + '_cowl_capelet', core.CHEST + 0.02, core.TOP + 0.01, hood_p,
                               ease=0.042, flare=0.06, rows=10, n=36, jagged=0.0, over_arms=True))
    # Stitched leather-and-sand brow visor peak under the front arch of the hood (Row 14)
    v_angs = np.linspace(0.72 * math.pi, 1.28 * math.pi, 18)
    v_base = np.array(ring_points(a + (b - a) * 0.62, bk, left, v_angs, 0.012, rmin=0.075, rmax=0.118, bvh=core.BVH))
    v_tip = np.array([
        q - bk * (0.040 * math.cos((an - math.pi) * 1.6)) - up * 0.010
        for q, an in zip(v_base, v_angs)
    ])
    v_under = np.array([q - up * 0.005 for q in v_base])
    parts_h5.append(Part(gid_h5 + '_visor', np.array([v_base, v_tip, v_under]), False, ['body'] * 3,
                         P('dunesand', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'leather')], fabric='leather.buckskin'),
                         rigid_joint='Head'))
    entries.append(assemble_garment(gid_h5, 'Yuni Ranger Indigo-Olive Hood & Brow-Visor Cowl', 'head', 'yuni', parts_h5, covers_hair=True))

    return entries


# ===============================================================================================================
# 2. Five Distinct Armor & Cloak Torso Rigs (`slot: 'torso'`)
# ===============================================================================================================
def _build_yuni_torsos(sex, body_id):
    set_body(body_id)
    _, _, up, bk, left = head_frame()
    entries = []

    strap_p = P('leather', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'brass'),
        B('bottom', 0.0, 0.02, 'solid', 'umber'),
    ], fabric='leather.polished')
    pouch_p = P('saddle', 0.03, [
        B('top', 0.0, 0.03, 'solid', 'brass'),
        B('bottom', 0.0, 0.025, 'solid', 'umber'),
    ], fabric='leather.polished')

    # -----------------------------------------------------------------------------------------------------------
    # 2A. yuni_m/f_scout_patch_poncho (Rows 01/04):
    #     Tailored sand-tan patchwork camouflage poncho-cloak over a twin-pouch tactical chest rig,
    #     shoulder walkie-talkie, and hip rope-coil.
    # -----------------------------------------------------------------------------------------------------------
    gid_t1 = f'yuni_{sex}_scout_patch_poncho'
    parts_t1 = []
    shirt_p = P('drab', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'leather'),
        B('bottom', 0.04, 0.08, 'trencadis', 'yuniyellow', 'saddle', 0.05),
        B('top', 0.0, 0.04, 'solid', 'khaki'),
    ], [
        PN(0.15, 0.85, 'yuni_brigandine_vest', 'dunesand', 'drab', 0.16),
    ], fabric='cloth.cotton.coarse')
    poncho_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.07, 'trencadis', 'yuniyellow', 'saddle', 0.045),
        B('top', 0.0, 0.04, 'solid', 'khaki'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'sand', 'dunesand', 0.24),
    ], fabric='cloth.weave.burlap')

    # Fitted tactical field shirt & skirt tails + sleeves (smooth skirt_weights, zero layer fighting!)
    parts_t1.append(torso_tube(gid_t1 + '_shirt', core.KNEE + 0.08, core.WAIST + 0.07, shirt_p, ease=0.022, flare=0.058, rows=14, n=38))
    for side in ('Left', 'Right'):
        parts_t1.append(sleeve(f'{gid_t1}_sleeve_{side}', side, shirt_p, f0=0.0, f1=0.88, ease=0.020, flare=0.008, rows=12, n=22))

    # Tailored upper-chest sand-tan patchwork desert poncho & cowl collar above the waist belt
    parts_t1.append(torso_tube(gid_t1 + '_poncho_drape', core.WAIST + 0.03, core.TOP + 0.01, poncho_p,
                               ease=0.030, flare=0.028, rows=12, n=40, jagged=0.0))
    parts_t1.append(collar(gid_t1 + '_poncho_cowl', poncho_p, h=0.065, flare=0.040, open_front=0.0, rows=6, n=32, ease_base=0.028))
    for side in ('Left', 'Right'):
        parts_t1.append(pauldron(f'{gid_t1}_poncho_sh_{side}', side, poncho_p, span=0.23, drop=0.19, lift=0.028))

    # Tactical chest harness + twin front ammo pouches + glowing chest beacon + shoulder walkie-talkie + hip rope coil
    parts_t1.append(crossed_sash(gid_t1 + '_harness', strap_p, width=0.052, ease=0.040))
    parts_t1.append(belt_sash(gid_t1 + '_belt', core.WAIST - 0.02, core.WAIST + 0.05, strap_p, ease=0.040))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_pos = chest_front(core.WAIST + 0.07, 0.050) + left * (sgn * 0.048)
        parts_t1.append(blob(f'{gid_t1}_chest_pouch_{tag}', p_pos, (0.040, 0.028, 0.052), pouch_p,
                             n=10, rows=5, out=np.array([0.0, -1.0, 0.0]), rigid_joint='Spine1'))
    # Glowing chest lantern-compass on Spine2
    beacon_pos = chest_front(core.CHEST + 0.02, 0.048)
    parts_t1.append(rosette(gid_t1 + '_chest_beacon', beacon_pos, np.array([0.0, -1.0, 0.0]), left, 0.034,
                            P('amber', 0.01, [B('top', 0.0, 0.015, 'solid', 'brass')], fabric='beads.glass'),
                            n=12, thick=0.016, rigid_joint='Spine2'))
    # Left shoulder walkie-talkie handset + whip antenna (Row 01/02)
    wt_pos = chest_front(core.CHEST + 0.07, 0.045) + left * 0.088
    parts_t1.append(blob(gid_t1 + '_walkie', wt_pos, (0.024, 0.020, 0.044), P('olive', 0.02, [B('top', 0.0, 0.015, 'solid', 'brass')], fabric='metal.iron'),
                         n=10, rows=5, out=np.array([0.0, -1.0, 0.0]), rigid_joint='Spine2'))
    parts_t1.append(horn(gid_t1 + '_walkie_ant', [wt_pos + up * 0.035, wt_pos + up * 0.165], 0.0045, 0.0020,
                         P('soot', 0.02, fabric='metal.iron'), n=6, rows=5, rigid_joint='Spine2'))
    # Right-hip coiled climbing rope + left-hip canteen
    hip_r = J('Hips') - left * 0.145 - bk * 0.03 + up * 0.02
    parts_t1.append(rosette(gid_t1 + '_rope_coil', hip_r, -left, -bk, 0.055,
                            P('oat', 0.04, [B('top', 0.0, 0.02, 'stripes', 'umber', 'oat', 0.02)], fabric='straw.plaited'),
                            n=14, thick=0.024, rigid_joint='Hips'))
    hip_l = J('Hips') + left * 0.145 - bk * 0.03 + up * 0.01
    parts_t1.append(horn(gid_t1 + '_hip_canteen', [hip_l - up * 0.05, hip_l + up * 0.05], 0.028, 0.024,
                         P('steel', 0.02, [B('top', 0.0, 0.02, 'solid', 'leather')], fabric='metal.iron'),
                         n=10, rows=6, rigid_joint='Hips'))
    entries.append(assemble_garment(gid_t1, 'Yuni Patchwork Poncho & Tactical Scout Rig', 'torso', 'yuni', parts_t1))

    # -----------------------------------------------------------------------------------------------------------
    # 2B. yuni_m/f_scout_heavy_cuirass (Rows 03/07/17):
    #     Heavy steel-and-tan ballistic chest plate, riveted metal forearm bracers, waist ammo-pouches,
    #     and a stitched rust-terracotta shoulder cowl & pauldrons.
    # -----------------------------------------------------------------------------------------------------------
    gid_t2 = f'yuni_{sex}_scout_heavy_cuirass'
    parts_t2 = []
    gambeson_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'umber'),
        B('bottom', 0.04, 0.09, 'trencadis', 'yuniyellow', 'terracotta', 0.05),
        B('top', 0.0, 0.04, 'solid', 'leather'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'khaki', 'dunesand', 0.18),
    ], fabric='cloth.quilted')
    cuirass_p = P('iron', 0.03, [
        B('bottom', 0.0, 0.05, 'solid', 'leather'),
        B('top', 0.0, 0.04, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'yuni_ballistic_plate', 'dunesand', 'iron', 0.28),
    ], fabric='metal.iron')
    mantle_p = P('terracotta', 0.04, [
        B('bottom', 0.0, 0.06, 'trencadis', 'yuniyellow', 'ochre', 0.045),
        B('top', 0.0, 0.04, 'solid', 'rust'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'ochre', 'terracotta', 0.24),
    ], fabric='cloth.weave.burlap')
    bracer_p = P('steel', 0.02, [
        B('top', 0.0, 0.04, 'solid', 'leather'),
        B('bottom', 0.0, 0.04, 'solid', 'leather'),
    ], [
        PN(0.20, 0.80, 'stripes', 'leather', 'steel', 0.035),
    ], fabric='metal.iron')

    # Padded desert gambeson & lower split skirt-tassets (smooth skirt_weights, zero jagged sawteeth!)
    parts_t2.append(torso_tube(gid_t2 + '_gambeson', core.KNEE + 0.10, core.TOP + 0.01, gambeson_p,
                               ease=0.024, flare=0.065, rows=18, n=38, jagged=0.0))
    # Heavy steel-and-tan ballistic chest cuirass
    parts_t2.append(torso_tube(gid_t2 + '_cuirass', core.WAIST - 0.01, core.CHEST + 0.08, cuirass_p,
                               ease=0.032, flare=0.015, rows=12, n=38))
    # 3D riveted front chest trauma plate + glowing cyan/amber chest vial (Row 03/07/17)
    plate_pos = chest_front(core.CHEST + 0.01, 0.046)
    parts_t2.append(blob(gid_t2 + '_trauma_plate', plate_pos, (0.095, 0.022, 0.085),
                         P('steel', 0.02, [B('top', 0.0, 0.02, 'solid', 'brass'), B('bottom', 0.0, 0.02, 'solid', 'leather')], fabric='metal.iron'),
                         n=14, rows=6, out=np.array([0.0, -1.0, 0.0]), rigid_joint='Spine2'))
    vial_pos = chest_front(core.CHEST + 0.05, 0.048) - left * 0.068
    parts_t2.append(horn(gid_t2 + '_chest_vial', [vial_pos - up * 0.028, vial_pos + up * 0.028], 0.016, 0.016,
                         P('cybercyan', 0.01, [B('top', 0.0, 0.015, 'solid', 'brass'), B('bottom', 0.0, 0.015, 'solid', 'brass')], fabric='beads.glass'),
                         n=10, rows=5, rigid_joint='Spine2'))

    # Stitched rust-terracotta shoulder cowl & pauldrons + riveted metal forearm bracers
    parts_t2.append(collar(gid_t2 + '_mantle_cowl', mantle_p, h=0.070, flare=0.042, open_front=0.0, rows=6, n=32, ease_base=0.028))
    for side in ('Left', 'Right'):
        parts_t2.append(pauldron(f'{gid_t2}_mantle_sh_{side}', side, mantle_p, span=0.24, drop=0.20, lift=0.028))
        parts_t2.append(sleeve(f'{gid_t2}_sleeve_{side}', side, gambeson_p, f0=0.0, f1=0.88, ease=0.020, flare=0.008, rows=12, n=22))
        parts_t2.append(sleeve(f'{gid_t2}_bracer_{side}', side, bracer_p, f0=0.45, f1=0.90, ease=0.026, flare=0.006, rows=9, n=22))

    # Waist belt & 4 chunky ammo pouches
    parts_t2.append(belt_sash(gid_t2 + '_belt', core.WAIST - 0.02, core.WAIST + 0.06, strap_p, ease=0.040))
    for ang_p, tag in ((math.pi - 0.55, 'FL'), (math.pi + 0.55, 'FR'), (0.55, 'BL'), (-0.55, 'BR')):
        d_p = np.array([math.sin(ang_p), math.cos(ang_p), 0.0])
        c_w = spine_at(core.WAIST + 0.01)
        h_w = first_hit(c_w, d_p, bvh=core.BVH_T) or 0.14
        p_ctr = c_w + d_p * (h_w + 0.048)
        parts_t2.append(blob(f'{gid_t2}_pouch_{tag}', p_ctr, (0.042, 0.030, 0.056), pouch_p,
                             n=10, rows=5, out=d_p, rigid_joint='Hips'))
    entries.append(assemble_garment(gid_t2, 'Yuni Heavy Ballistic Cuirass & Terracotta Mantle', 'torso', 'yuni', parts_t2))

    # -----------------------------------------------------------------------------------------------------------
    # 2C. yuni_m/f_scout_medic_coat (Rows 05/09):
    #     Cream-and-saffron Yuni combat-medic split coat with white-and-red-cross (`+`) hip medical satchels,
    #     glowing chest lantern-beacon, and saffron-ochre mantle.
    # -----------------------------------------------------------------------------------------------------------
    gid_t3 = f'yuni_{sex}_scout_medic_coat'
    parts_t3 = []
    med_coat_p = P('cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'saffron'),
        B('bottom', 0.03, 0.09, 'trencadis', 'tileblue', 'yuniyellow', 0.05),
        B('top', 0.0, 0.05, 'solid', 'saffron'),
    ], [
        PN(0.0, 0.42, 'yuni_patchwork', 'sand', 'cream', 0.20),
        PN(0.58, 1.0, 'yuni_patchwork', 'sand', 'cream', 0.20),
        PN(0.42, 0.58, 'yuni_brigandine_vest', 'leather', 'drab', 0.18),
    ], fabric='cloth.cotton.coarse')
    saffron_p = P('saffron', 0.04, [
        B('bottom', 0.0, 0.05, 'trencadis', 'yuniyellow', 'ochre', 0.045),
        B('top', 0.0, 0.04, 'solid', 'cream'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'ochre', 'saffron', 0.22),
    ], fabric='cloth.weave.burlap')
    med_bag_p = P('white', 0.02, [
        B('top', 0.0, 0.025, 'solid', 'leather'),
        B('bottom', 0.0, 0.025, 'solid', 'leather'),
    ], [
        PN(0.08, 0.92, 'yuni_med_cross', 'holyred', 'white', 0.32),
    ], fabric='cloth.cotton.coarse')

    # Long split-hem cream-and-saffron combat-medic coat (smooth skirt_weights, crisp mosaic hem)
    parts_t3.append(torso_tube(gid_t3 + '_coat', core.KNEE - 0.04, core.TOP + 0.01, med_coat_p,
                               ease=0.026, flare=0.08, rows=22, n=40, jagged=0.0))
    parts_t3.append(collar(gid_t3 + '_cowl', saffron_p, h=0.072, flare=0.042, open_front=0.0, rows=6, n=32, ease_base=0.026))
    for side in ('Left', 'Right'):
        parts_t3.append(pauldron(f'{gid_t3}_mantle_{side}', side, saffron_p, span=0.23, drop=0.19, lift=0.026))
        parts_t3.append(sleeve(f'{gid_t3}_sleeve_{side}', side, med_coat_p, f0=0.0, f1=0.86, ease=0.022, flare=0.012, rows=12, n=22))

    # Harness, belt, glowing cyan/amber chest diagnostic lantern-beacon & twin white-and-red-cross (`+`) hip medical satchels
    parts_t3.append(crossed_sash(gid_t3 + '_med_strap', strap_p, width=0.050, ease=0.036))
    parts_t3.append(belt_sash(gid_t3 + '_belt', core.WAIST - 0.02, core.WAIST + 0.05, strap_p, ease=0.040))
    med_lantern = chest_front(core.CHEST + 0.02, 0.046) - left * 0.045
    parts_t3.append(rosette(gid_t3 + '_med_beacon', med_lantern, np.array([0.0, -1.0, 0.0]), left, 0.036,
                            P('cybercyan', 0.01, [B('top', 0.0, 0.015, 'solid', 'brass')], fabric='beads.glass'),
                            n=12, thick=0.016, rigid_joint='Spine2'))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        satchel_pos = J('Hips') + left * (sgn * 0.148) - bk * 0.045 + up * 0.01
        out_dir = left * (sgn * 0.85) - bk * 0.52
        parts_t3.append(blob(f'{gid_t3}_med_satchel_{tag}', satchel_pos, (0.062, 0.036, 0.068), med_bag_p,
                             n=12, rows=6, out=out_dir, rigid_joint='Hips'))
    entries.append(assemble_garment(gid_t3, 'Yuni Combat-Medic Split Coat & Red-Cross Satchels', 'torso', 'yuni', parts_t3))

    # -----------------------------------------------------------------------------------------------------------
    # 2D. yuni_m/f_scout_sash_tunic (Rows 16/18):
    #     Olive-and-sand ranger tunic with glowing cyan/amber chest-vial, cross-belts,
    #     and a long indigo-and-gold striped hanging waist-sash kilt (`18`).
    # -----------------------------------------------------------------------------------------------------------
    gid_t4 = f'yuni_{sex}_scout_sash_tunic'
    parts_t4 = []
    tunic_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.06, 'trencadis', 'yuniyellow', 'olive', 0.045),
        B('top', 0.0, 0.05, 'solid', 'sage'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'sage', 'dunesand', 0.22),
    ], fabric='cloth.weave.burlap')
    sash_kilt_p = P('slateblue', 0.03, [
        B('bottom', 0.0, 0.05, 'fret', 'gold', 'indigo', 0.035),
        B('top', 0.0, 0.03, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'yuni_indigo_sash', 'gold', 'slateblue', 0.26),
    ], fabric='cloth.weave.twill')

    # Fitted ranger tunic & coat-tails (smooth skirt_weights, crisp hem)
    parts_t4.append(torso_tube(gid_t4 + '_tunic', core.KNEE - 0.02, core.TOP + 0.01, tunic_p,
                               ease=0.024, flare=0.075, rows=20, n=38, jagged=0.0))
    parts_t4.append(collar(gid_t4 + '_collar', P('sage', 0.04, [B('top', 0.0, 0.03, 'solid', 'dunesand')]),
                           h=0.065, flare=0.035, open_front=0.0, rows=6, n=30, ease_base=0.024))
    for side in ('Left', 'Right'):
        parts_t4.append(pauldron(f'{gid_t4}_sh_{side}', side, P('sage', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'dunesand')]),
                                 span=0.21, drop=0.17, lift=0.024))
        parts_t4.append(sleeve(f'{gid_t4}_sleeve_{side}', side, tunic_p, f0=0.0, f1=0.86, ease=0.020, flare=0.010, rows=12, n=22))

    # Cross-belts + glowing chest-vial + hip lantern + long indigo-and-gold striped hanging waist-sash kilt (Row 18)
    parts_t4.append(crossed_sash(gid_t4 + '_crossbelt', strap_p, width=0.052, ease=0.034))
    parts_t4.append(belt_sash(gid_t4 + '_indigo_obi', core.WAIST - 0.03, core.WAIST + 0.07, sash_kilt_p, ease=0.038))
    kilt_panels = tabard(gid_t4 + '_sash_kilt', core.KNEE - 0.06, core.WAIST + 0.03, 0.17, sash_kilt_p,
                         front=True, back=True, ease=0.038, flare=0.06)
    for kp in kilt_panels:
        kp.cloth = None
    parts_t4.extend(kilt_panels)
    vial4_pos = chest_front(core.CHEST + 0.03, 0.046) - left * 0.058
    parts_t4.append(horn(gid_t4 + '_vial', [vial4_pos - up * 0.028, vial4_pos + up * 0.028], 0.016, 0.016,
                         P('cybercyan', 0.01, [B('top', 0.0, 0.015, 'solid', 'brass'), B('bottom', 0.0, 0.015, 'solid', 'brass')], fabric='beads.glass'),
                         n=10, rows=5, rigid_joint='Spine2'))
    lantern_r = J('Hips') - left * 0.145 - bk * 0.05 + up * 0.01
    parts_t4.append(horn(gid_t4 + '_hip_lantern', [lantern_r - up * 0.045, lantern_r + up * 0.045], 0.028, 0.024,
                         P('amber', 0.01, [B('top', 0.0, 0.02, 'solid', 'brass'), B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='beads.glass'),
                         n=10, rows=6, rigid_joint='Hips'))
    entries.append(assemble_garment(gid_t4, 'Yuni Ranger Tunic & Indigo-Gold Striped Sash-Kilt', 'torso', 'yuni', parts_t4))

    # -----------------------------------------------------------------------------------------------------------
    # 2E. yuni_m/f_scout_greatcloak (Rows 08/23):
    #     Open-front desert-sand & slate-indigo border-striped great-cloak over a dark tactical multi-pouch brigandine vest.
    # -----------------------------------------------------------------------------------------------------------
    gid_t5 = f'yuni_{sex}_scout_greatcloak'
    parts_t5 = []
    brig_p = P('charcoal', 0.03, [
        B('bottom', 0.0, 0.06, 'solid', 'leather'),
        B('top', 0.0, 0.04, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'yuni_brigandine_vest', 'leather', 'charcoal', 0.24),
    ], fabric='leather.polished')
    gcloak_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.09, 'trencadis', 'yuniyellow', 'slateblue', 0.05),
        B('top', 0.0, 0.05, 'solid', 'sage'),
    ], [
        # Vertical slate-indigo border stripes along the open front lapels of the great-cloak (Row 23)
        PN(0.00, 0.12, 'yuni_indigo_sash', 'gold', 'slateblue', 0.24),
        PN(0.88, 1.00, 'yuni_indigo_sash', 'gold', 'slateblue', 0.24),
        PN(0.12, 0.88, 'yuni_patchwork', 'sand', 'dunesand', 0.22),
    ], fabric='cloth.weave.burlap')

    # Inner dark tactical multi-pouch brigandine vest (clearly visible through the open front of the greatcloak!)
    parts_t5.append(torso_tube(gid_t5 + '_brigandine', core.CROTCH + 0.01, core.TOP + 0.01, brig_p,
                               ease=0.022, flare=0.03, rows=16, n=36))
    parts_t5.append(belt_sash(gid_t5 + '_belt', core.WAIST - 0.02, core.WAIST + 0.05, strap_p, ease=0.036))
    parts_t5.append(blob(gid_t5 + '_front_pouch', chest_front(core.WAIST + 0.01, 0.044) + left * 0.065,
                         (0.042, 0.028, 0.055), pouch_p, n=10, rows=5, out=np.array([0.0, -1.0, 0.0]), rigid_joint='Hips'))

    # Open-front sweeping desert-sand & slate-indigo border-striped great-cloak (`arc=(-0.70*pi, 0.70*pi)`)
    parts_t5.append(torso_tube(gid_t5 + '_greatcloak', core.ANKLE + 0.08, core.TOP + 0.01, gcloak_p,
                               ease=0.036, flare=0.09, rows=24, n=42, jagged=0.0,
                               arc=(-math.pi * 0.70, math.pi * 0.70)))
    parts_t5.append(collar(gid_t5 + '_cloak_cowl', P('sage', 0.04, [B('top', 0.0, 0.03, 'solid', 'dunesand')]),
                           h=0.075, flare=0.045, open_front=0.0, rows=7, n=32, ease_base=0.028))
    for side in ('Left', 'Right'):
        parts_t5.append(pauldron(f'{gid_t5}_cloak_sh_{side}', side, gcloak_p, span=0.24, drop=0.20, lift=0.028))
        parts_t5.append(sleeve(f'{gid_t5}_cloak_sleeve_{side}', side, gcloak_p, f0=0.0, f1=0.76, ease=0.028, flare=0.028, rows=14, n=24))
    entries.append(assemble_garment(gid_t5, 'Yuni Border-Striped Desert Greatcloak & Brigandine', 'torso', 'yuni', parts_t5))

    return entries


# ===============================================================================================================
# 3. Five Distinct Backpacks & Cloaks (`slot: 'back'`)
# ===============================================================================================================
def _build_yuni_backs(sex, body_id):
    set_body(body_id)
    _, _, up, bk, left = head_frame()
    sp1 = J('Spine1')
    sp2 = J('Spine2')
    pack_ctr = 0.45 * sp1 + 0.55 * sp2 + bk * 0.170 + up * 0.02
    angs_pk = np.linspace(0, 2 * math.pi, 24, endpoint=False)
    strap_p = P('leather', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'brass'),
        B('bottom', 0.0, 0.02, 'solid', 'umber'),
    ], fabric='leather.polished')
    entries = []

    # -----------------------------------------------------------------------------------------------------------
    # 3A. yuni_m/f_scout_radio_pack (Rows 02/08/13/18/23):
    #     Boxed field transceiver radio backpack (`rigid_joint='Spine2'` with closed top/bottom caps + straps)
    #     featuring a glowing telemetry screen, dials, lower pouch, and tall whip-antenna.
    # -----------------------------------------------------------------------------------------------------------
    gid_b1 = f'yuni_{sex}_scout_radio_pack'
    parts_b1 = []
    radio_p = P('olive', 0.03, [
        B('top', 0.0, 0.05, 'solid', 'brass'),
        B('bottom', 0.0, 0.05, 'solid', 'iron'),
    ], [
        PN(0.18, 0.82, 'yuni_radio_face', 'cybercyan', 'olive', 0.28),
    ], fabric='metal.iron')

    # Watertight boxed field transceiver casing with closed top & bottom caps (`sc_xy = 0.04`)
    r_rows = []
    for z_f, sc_xy in ((0.145, 0.04), (0.140, 0.94), (0.07, 1.0), (-0.07, 1.0), (-0.130, 0.94), (-0.135, 0.04)):
        row_p = []
        for an in angs_pk:
            cs, sn = math.cos(an), math.sin(an)
            sq_x = np.sign(sn) * (abs(sn) ** 0.52) * 0.118 * sc_xy
            sq_y = np.sign(cs) * (abs(cs) ** 0.52) * 0.056 * sc_xy
            row_p.append(pack_ctr + left * sq_x + bk * sq_y + up * z_f)
        r_rows.append(row_p)
    parts_b1.append(Part(gid_b1 + '_transceiver_box', np.array(r_rows), True, ['body'] * len(r_rows), radio_p, rigid_joint='Spine2'))

    # 3D recessed glowing cyan-green CRT telemetry screen + rotary brass dial + lower strapped canvas battery pouch
    scr_pos = pack_ctr + bk * 0.058 + left * 0.025 + up * 0.042
    parts_b1.append(blob(gid_b1 + '_crt_screen', scr_pos, (0.048, 0.016, 0.038),
                         P('cybercyan', 0.01, [B('top', 0.0, 0.015, 'solid', 'brass'), B('bottom', 0.0, 0.015, 'solid', 'soot')], fabric='beads.glass'),
                         n=12, rows=5, out=bk, rigid_joint='Spine2'))
    dial_pos = pack_ctr + bk * 0.058 - left * 0.055 + up * 0.042
    parts_b1.append(rosette(gid_b1 + '_tuning_dial', dial_pos, bk, left, 0.022,
                            P('brass', 0.02, [B('top', 0.0, 0.01, 'solid', 'soot')], fabric='metal.bronze'),
                            n=10, thick=0.014, rigid_joint='Spine2'))
    low_pouch = pack_ctr + bk * 0.042 - up * 0.165
    parts_b1.append(blob(gid_b1 + '_lower_pouch', low_pouch, (0.105, 0.048, 0.048),
                         P('dunesand', 0.04, [B('top', 0.0, 0.025, 'solid', 'leather')], fabric='cloth.cotton.coarse'),
                         n=12, rows=6, out=bk, rigid_joint='Spine2'))
    # Tall whip-antenna rising from the upper-right corner of the radio pack
    ant_pts = [pack_ctr - left * 0.095 + up * (0.135 + 0.28 * t) for t in np.linspace(0, 1, 6)]
    parts_b1.append(horn(gid_b1 + '_whip_antenna', ant_pts, 0.009, 0.0025,
                         P('brass', 0.02, [B('bottom', 0.0, 0.04, 'solid', 'soot')], fabric='metal.bronze'),
                         n=8, rows=6, rigid_joint='Spine2'))
    _add_pack_harness(parts_b1, gid_b1, sp1, sp2, strap_p)
    entries.append(assemble_garment(gid_b1, 'Yuni Field Transceiver Radio Backpack', 'back', 'yuni', parts_b1))

    # -----------------------------------------------------------------------------------------------------------
    # 3B. yuni_m/f_scout_canister_pack (Row 15):
    #     Pressurized brass-and-olive backpack (`rigid_joint='Spine2'`) with a large glowing amber glass
    #     condenser-canister, twin side cylinders, and shoulder harness straps.
    # -----------------------------------------------------------------------------------------------------------
    gid_b2 = f'yuni_{sex}_scout_canister_pack'
    parts_b2 = []
    frame_p = P('drab', 0.03, [
        B('top', 0.0, 0.05, 'solid', 'brass'),
        B('bottom', 0.0, 0.05, 'solid', 'leather'),
    ], [
        PN(0.15, 0.85, 'yuni_ballistic_plate', 'brass', 'drab', 0.20),
    ], fabric='metal.iron')

    c_rows = []
    for z_f, sc_xy in ((0.150, 0.04), (0.145, 0.92), (0.07, 1.0), (-0.08, 1.0), (-0.145, 0.92), (-0.150, 0.04)):
        row_p = []
        for an in angs_pk:
            cs, sn = math.cos(an), math.sin(an)
            sq_x = np.sign(sn) * (abs(sn) ** 0.55) * 0.112 * sc_xy
            sq_y = np.sign(cs) * (abs(cs) ** 0.55) * 0.052 * sc_xy
            row_p.append(pack_ctr + left * sq_x + bk * sq_y + up * z_f)
        c_rows.append(row_p)
    parts_b2.append(Part(gid_b2 + '_frame_box', np.array(c_rows), True, ['body'] * len(c_rows), frame_p, rigid_joint='Spine2'))

    # Large central glowing amber glass condenser-canister with top/bottom brass end-caps (Row 15)
    can_ctr = pack_ctr + bk * 0.056 + up * 0.01
    can_pts = [can_ctr + up * z_c for z_c in np.linspace(-0.105, 0.105, 7)]
    can_p = P('amber', 0.01, [
        B('top', 0.0, 0.035, 'solid', 'brass'),
        B('bottom', 0.0, 0.035, 'solid', 'brass'),
    ], [
        PN(0.20, 0.80, 'stripes', 'yuniyellow', 'amber', 0.03),
    ], fabric='beads.glass')
    parts_b2.append(horn(gid_b2 + '_amber_condenser', can_pts, 0.044, 0.044, can_p, n=14, rows=7, rigid_joint='Spine2'))
    for z_cap, tag in ((0.112, 'top'), (-0.112, 'bot')):
        parts_b2.append(rosette(f'{gid_b2}_cap_{tag}', can_ctr + up * z_cap, up if z_cap > 0 else -up, left, 0.046,
                                P('brass', 0.02, fabric='metal.bronze'), n=14, thick=0.018, rigid_joint='Spine2'))
    # Twin side pressurized gas cylinders
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        sc_pts = [pack_ctr + left * (sgn * 0.128) + bk * 0.015 + up * z_s for z_s in np.linspace(-0.11, 0.11, 6)]
        parts_b2.append(horn(f'{gid_b2}_side_cyl_{tag}', sc_pts, 0.028, 0.026,
                             P('olive', 0.02, [B('top', 0.0, 0.03, 'solid', 'brass'), B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='metal.iron'),
                             n=10, rows=6, rigid_joint='Spine2'))
    _add_pack_harness(parts_b2, gid_b2, sp1, sp2, strap_p)
    entries.append(assemble_garment(gid_b2, 'Yuni Pressurized Amber-Condenser Backpack', 'back', 'yuni', parts_b2))

    # -----------------------------------------------------------------------------------------------------------
    # 3C. yuni_m/f_scout_medic_pack (Rows 05/09):
    #     Heavy canvas expedition rucksack (`rigid_joint='Spine2'`) with upper rolled bedroll,
    #     red-cross medical box pouch, side canteen, and shoulder straps.
    # -----------------------------------------------------------------------------------------------------------
    gid_b3 = f'yuni_{sex}_scout_medic_pack'
    parts_b3 = []
    ruck_p = P('khaki', 0.04, [
        B('top', 0.0, 0.05, 'solid', 'leather'),
        B('bottom', 0.0, 0.05, 'solid', 'umber'),
    ], [
        PN(0.18, 0.30, 'stripes', 'brass', 'leather', 0.03),
        PN(0.70, 0.82, 'stripes', 'brass', 'leather', 0.03),
    ], fabric='cloth.cotton.coarse')
    med_box_p = P('white', 0.02, [
        B('top', 0.0, 0.025, 'solid', 'leather'),
        B('bottom', 0.0, 0.025, 'solid', 'leather'),
    ], [
        PN(0.08, 0.92, 'yuni_med_cross', 'holyred', 'white', 0.34),
    ], fabric='cloth.cotton.coarse')

    m_rows = []
    for z_f, sc_xy in ((0.145, 0.04), (0.140, 0.94), (0.07, 1.0), (-0.08, 1.0), (-0.145, 0.94), (-0.150, 0.04)):
        row_p = []
        for an in angs_pk:
            cs, sn = math.cos(an), math.sin(an)
            sq_x = np.sign(sn) * (abs(sn) ** 0.55) * 0.122 * sc_xy
            sq_y = np.sign(cs) * (abs(cs) ** 0.55) * 0.056 * sc_xy
            row_p.append(pack_ctr + left * sq_x + bk * sq_y + up * z_f)
        m_rows.append(row_p)
    parts_b3.append(Part(gid_b3 + '_rucksack', np.array(m_rows), True, ['body'] * len(m_rows), ruck_p, rigid_joint='Spine2'))

    # Upper rolled canvas bedroll strapped across the top of the rucksack (Row 05)
    roll_pts = [pack_ctr + up * 0.172 + left * x_r for x_r in np.linspace(-0.135, 0.135, 7)]
    parts_b3.append(horn(gid_b3 + '_top_bedroll', roll_pts, 0.042, 0.042,
                         P('olive', 0.04, [B('top', 0.0, 0.04, 'solid', 'leather'), B('bottom', 0.0, 0.04, 'solid', 'leather')], fabric='cloth.weave.burlap'),
                         n=12, rows=7, rigid_joint='Spine2'))
    # Rear white-and-red-cross (`+`) medical box pouch (Row 09) + side metal canteen
    parts_b3.append(blob(gid_b3 + '_med_box', pack_ctr + bk * 0.058 - up * 0.015, (0.082, 0.032, 0.082),
                         med_box_p, n=12, rows=6, out=bk, rigid_joint='Spine2'))
    cant_pts = [pack_ctr - left * 0.138 + up * z_c for z_c in np.linspace(-0.08, 0.08, 6)]
    parts_b3.append(horn(gid_b3 + '_side_canteen', cant_pts, 0.028, 0.025,
                         P('steel', 0.02, [B('top', 0.0, 0.03, 'solid', 'brass'), B('bottom', 0.0, 0.03, 'solid', 'leather')], fabric='metal.iron'),
                         n=10, rows=6, rigid_joint='Spine2'))
    _add_pack_harness(parts_b3, gid_b3, sp1, sp2, strap_p)
    entries.append(assemble_garment(gid_b3, 'Yuni Expedition Medic Rucksack & Bedroll', 'back', 'yuni', parts_b3))

    # -----------------------------------------------------------------------------------------------------------
    # 3D. yuni_m/f_scout_tattered_cloak (Rows 01/04/11):
    #     Standalone multi-layer olive-and-sand patchwork sniper cloak
    # -----------------------------------------------------------------------------------------------------------
    gid_b4 = f'yuni_{sex}_scout_tattered_cloak'
    parts_b4 = []
    sniper_p = P('olivegrey', 0.04, [
        B('bottom', 0.0, 0.08, 'trencadis', 'dunesand', 'olive', 0.045),
        B('top', 0.0, 0.05, 'solid', 'sage'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'dunesand', 'olivegrey', 0.26),
    ], fabric='cloth.weave.burlap')
    upper_patch_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.06, 'trencadis', 'yuniyellow', 'olive', 0.04),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'olive', 'dunesand', 0.22),
    ], fabric='cloth.weave.burlap')

    parts_b4.append(cape(gid_b4 + '_main_cloak', core.ANKLE + 0.10, core.SHOULDER + 0.02, sniper_p,
                         arc=0.86, ease=0.056, flare=0.10, rows=22, n=34, jagged=0.012, layer=2))
    parts_b4.append(cape(gid_b4 + '_upper_shroud', core.WAIST - 0.04, core.TOP - 0.01, upper_patch_p,
                         arc=0.82, ease=0.064, flare=0.07, rows=12, n=28, jagged=0.0, layer=2))
    # Rear waist utility pouch (Rows 01/11/14)
    rear_pouch = J('Hips') + bk * 0.148 + up * 0.02
    parts_b4.append(blob(gid_b4 + '_rear_pouch', rear_pouch, (0.068, 0.036, 0.058),
                         P('saddle', 0.03, [B('top', 0.0, 0.025, 'solid', 'brass')], fabric='leather.polished'),
                         n=10, rows=5, out=bk, rigid_joint='Hips'))
    entries.append(assemble_garment(gid_b4, 'Yuni Tattered Patchwork Sniper Cloak', 'back', 'yuni', parts_b4))

    # -----------------------------------------------------------------------------------------------------------
    # 3E. yuni_m/f_scout_ochre_mantle (Rows 03/05/10/12):
    #     Standalone weathered saffron-ochre & terracotta patchwork desert shawl-cape
    # -----------------------------------------------------------------------------------------------------------
    gid_b5 = f'yuni_{sex}_scout_ochre_mantle'
    parts_b5 = []
    ochre_cape_p = P('saffron', 0.04, [
        B('bottom', 0.0, 0.08, 'trencadis', 'terracotta', 'yuniyellow', 0.045),
        B('top', 0.0, 0.05, 'solid', 'terracotta'),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'terracotta', 'saffron', 0.26),
    ], fabric='cloth.weave.burlap')
    terra_cowl_p = P('terracotta', 0.04, [
        B('bottom', 0.0, 0.06, 'trencadis', 'cream', 'yuniyellow', 0.04),
    ], [
        PN(0.0, 1.0, 'yuni_patchwork', 'ochre', 'terracotta', 0.22),
    ], fabric='cloth.weave.burlap')

    parts_b5.append(cape(gid_b5 + '_ochre_cape', core.KNEE - 0.02, core.SHOULDER + 0.02, ochre_cape_p,
                         arc=0.88, ease=0.054, flare=0.09, rows=18, n=32, jagged=0.0, layer=2))
    parts_b5.append(cape(gid_b5 + '_terra_drape', core.WAIST + 0.02, core.TOP - 0.01, terra_cowl_p,
                         arc=0.84, ease=0.062, flare=0.06, rows=10, n=28, jagged=0.0, layer=2))
    parts_b5.append(blob(gid_b5 + '_belt_pouch', J('Hips') + bk * 0.148 - left * 0.055 + up * 0.02, (0.058, 0.034, 0.058),
                         P('saddle', 0.03, [B('top', 0.0, 0.025, 'solid', 'brass')], fabric='leather.polished'),
                         n=10, rows=5, out=bk, rigid_joint='Hips'))
    entries.append(assemble_garment(gid_b5, 'Yuni Saffron-Ochre & Terracotta Desert Mantle', 'back', 'yuni', parts_b5))

    return entries


# ===============================================================================================================
# 4. Shared Tactical Legs, Boots & Gloves (`slot: 'legs'`, `slot: 'feet'`, `slot: 'gloves'`)
# ===============================================================================================================
def _build_yuni_shared_gear(sex, body_id):
    set_body(body_id)
    _, _, up, bk, left = head_frame()
    entries = []

    # -----------------------------------------------------------------------------------------------------------
    # 4A. yuni_m/f_scout_cargo_pants (`slot: 'legs'`, `legged=True`):
    #     Padded desert-tan & olive tactical cargo trousers with articulated knee-pads and thigh satchels.
    # -----------------------------------------------------------------------------------------------------------
    gid_l = f'yuni_{sex}_scout_cargo_pants'
    cargo_p = P('dunesand', 0.04, [
        B('bottom', 0.0, 0.08, 'solid', 'olive'),
        B('top', 0.0, 0.06, 'solid', 'leather'),
    ], [
        PN(0.15, 0.85, 'yuni_patchwork', 'khaki', 'dunesand', 0.18),
    ], fabric='cloth.cotton.coarse')
    parts_l = trousers(gid_l, cargo_p, ankle_f=0.78, ease=0.024, bag=0.034, rows=16, n=26)

    kneepad_p = P('khaki', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'umber'),
        B('bottom', 0.0, 0.02, 'solid', 'umber'),
    ], fabric='leather.buckskin')
    satchel_p = P('saddle', 0.03, [
        B('top', 0.0, 0.03, 'solid', 'brass'),
        B('bottom', 0.0, 0.025, 'solid', 'umber'),
    ], fabric='leather.polished')
    for s, sgn in (('Left', 1.0), ('Right', -1.0)):
        hip_j, knee_j = J(s + 'UpLeg'), J(s + 'Leg')
        # 3D articulated knee-pad + knee strap
        parts_l.append(rosette(f'{gid_l}_kneepad_{s}', knee_j - bk * 0.070 + up * 0.01, -bk, left, 0.044,
                               kneepad_p, n=12, thick=0.018, rigid_joint=s + 'Leg'))
        # Side thigh cargo satchel
        thigh_pt = 0.55 * hip_j + 0.45 * knee_j + left * (sgn * 0.095) - bk * 0.025
        parts_l.append(blob(f'{gid_l}_thigh_satchel_{s}', thigh_pt, (0.034, 0.048, 0.068),
                            satchel_p, n=10, rows=5, out=left * sgn, rigid_joint=s + 'UpLeg'))
    entries.append(assemble_garment(gid_l, 'Yuni Tactical Cargo Trousers & Knee-Pads', 'legs', 'yuni', parts_l, legged=True))

    # -----------------------------------------------------------------------------------------------------------
    # 4B. yuni_m/f_scout_combat_boots (`slot: 'feet'`):
    #     Rugged desert-suede & steel-toe ranger boots with strapped shin gaiters.
    # -----------------------------------------------------------------------------------------------------------
    gid_f = f'yuni_{sex}_scout_combat_boots'
    parts_f = []
    boot_p = P('umber', 0.03, [
        B('top', 0.0, 0.10, 'stripes', 'leather', 'dunesand', 0.03),
        B('bottom', 0.0, 0.06, 'solid', 'iron'),
    ], [
        PN(0.25, 0.75, 'stripes', 'brass', 'umber', 0.032),
    ], fabric='leather.buckskin')
    sole_p = P('soot', 0.03, [B('top', 0.0, 0.015, 'solid', 'umber')], fabric='metal.iron')
    for s in ('Left', 'Right'):
        parts_f.extend(boot(f'{gid_f}_{s}', s, boot_p, top_f=0.22, ease=0.020, rows=15, n=24, cuff=0.015, sole_paint=sole_p))
    entries.append(assemble_garment(gid_f, 'Yuni Strapped Desert Ranger Combat Boots', 'feet', 'yuni', parts_f))

    # -----------------------------------------------------------------------------------------------------------
    # 4C. yuni_m/f_scout_gloves (`slot: 'gloves'`):
    #     Fingerless leather & armored-wrist scout bracer-gloves.
    # -----------------------------------------------------------------------------------------------------------
    gid_g = f'yuni_{sex}_scout_gloves'
    parts_g = []
    cuff_p = P('leather', 0.03, [
        B('top', 0.0, 0.03, 'solid', 'steel'),
        B('bottom', 0.0, 0.03, 'solid', 'brass'),
    ], [
        PN(0.20, 0.80, 'stripes', 'umber', 'leather', 0.03),
    ], fabric='leather.polished')
    hand_p = P('umber', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'steel'),
        B('bottom', 0.0, 0.02, 'solid', 'leather'),
    ], fabric='leather.polished')
    finger_p = P('buck', 0.03, [
        B('top', 0.0, 0.48, 'solid', 'umber'),
        B('top', 0.48, 0.55, 'solid', 'soot'),
    ], fabric='leather.buckskin')
    for side in ('Left', 'Right'):
        parts_g.extend(glove(gid_g, side, hand_p, cuff_paint=cuff_p, finger_paint=finger_p, f0=0.60, ease=0.015))
    entries.append(assemble_garment(gid_g, 'Yuni Scout Armored-Wrist Fingerless Gloves', 'gloves', 'yuni', parts_g))

    return entries


# ===============================================================================================================
# Parallel Task Runner & Manifest Output
# ===============================================================================================================
TASKS = [
    (_build_yuni_headgear, 'm', 'mpfb_male'),
    (_build_yuni_torsos, 'm', 'mpfb_male'),
    (_build_yuni_backs, 'm', 'mpfb_male'),
    (_build_yuni_shared_gear, 'm', 'mpfb_male'),
    (_build_yuni_headgear, 'f', 'mpfb_female'),
    (_build_yuni_torsos, 'f', 'mpfb_female'),
    (_build_yuni_backs, 'f', 'mpfb_female'),
    (_build_yuni_shared_gear, 'f', 'mpfb_female'),
]


def _run_task(task):
    fn, sex, body_id = task
    return fn(sex, body_id)


def main():
    t0 = time.perf_counter()
    kit_entries = []
    for task in TASKS:
        kit_entries.extend(_run_task(task))

    social_types = [
        {
            'id': 'yuni_outback_scout',
            'name': 'Yuni Outback Desert Scout',
            'outfit': {
                'male': {
                    'head': 'yuni_m_scout_slouch_hat',
                    'torso': 'yuni_m_scout_patch_poncho',
                    'back': 'yuni_m_scout_tattered_cloak',
                    'legs': 'yuni_m_scout_cargo_pants',
                    'feet': 'yuni_m_scout_combat_boots',
                    'gloves': 'yuni_m_scout_gloves',
                },
                'female': {
                    'head': 'yuni_f_scout_slouch_hat',
                    'torso': 'yuni_f_scout_patch_poncho',
                    'back': 'yuni_f_scout_tattered_cloak',
                    'legs': 'yuni_f_scout_cargo_pants',
                    'feet': 'yuni_f_scout_combat_boots',
                    'gloves': 'yuni_f_scout_gloves',
                },
            },
        },
        {
            'id': 'yuni_tassel_heavy',
            'name': 'Yuni Tassel-Hat Heavy Vanguard',
            'outfit': {
                'male': {
                    'head': 'yuni_m_scout_tassel_hat',
                    'torso': 'yuni_m_scout_heavy_cuirass',
                    'back': 'yuni_m_scout_ochre_mantle',
                    'legs': 'yuni_m_scout_cargo_pants',
                    'feet': 'yuni_m_scout_combat_boots',
                    'gloves': 'yuni_m_scout_gloves',
                },
                'female': {
                    'head': 'yuni_f_scout_tassel_hat',
                    'torso': 'yuni_f_scout_heavy_cuirass',
                    'back': 'yuni_f_scout_ochre_mantle',
                    'legs': 'yuni_f_scout_cargo_pants',
                    'feet': 'yuni_f_scout_combat_boots',
                    'gloves': 'yuni_f_scout_gloves',
                },
            },
        },
        {
            'id': 'yuni_field_medic',
            'name': 'Yuni Expedition Field Medic',
            'outfit': {
                'male': {
                    'head': 'yuni_m_scout_slouch_hat',
                    'torso': 'yuni_m_scout_medic_coat',
                    'back': 'yuni_m_scout_medic_pack',
                    'legs': 'yuni_m_scout_cargo_pants',
                    'feet': 'yuni_m_scout_combat_boots',
                    'gloves': 'yuni_m_scout_gloves',
                },
                'female': {
                    'head': 'yuni_f_scout_tassel_hat',
                    'torso': 'yuni_f_scout_medic_coat',
                    'back': 'yuni_f_scout_medic_pack',
                    'legs': 'yuni_f_scout_cargo_pants',
                    'feet': 'yuni_f_scout_combat_boots',
                    'gloves': 'yuni_f_scout_gloves',
                },
            },
        },
        {
            'id': 'yuni_comms_ranger',
            'name': 'Yuni Comms & Condenser Ranger',
            'outfit': {
                'male': {
                    'head': 'yuni_m_scout_comms_helm',
                    'torso': 'yuni_m_scout_sash_tunic',
                    'back': 'yuni_m_scout_canister_pack',
                    'legs': 'yuni_m_scout_cargo_pants',
                    'feet': 'yuni_m_scout_combat_boots',
                    'gloves': 'yuni_m_scout_gloves',
                },
                'female': {
                    'head': 'yuni_f_scout_comms_helm',
                    'torso': 'yuni_f_scout_sash_tunic',
                    'back': 'yuni_f_scout_canister_pack',
                    'legs': 'yuni_f_scout_cargo_pants',
                    'feet': 'yuni_f_scout_combat_boots',
                    'gloves': 'yuni_f_scout_gloves',
                },
            },
        },
        {
            'id': 'yuni_desert_elder',
            'name': 'Yuni Desert Path-Elder & Signalman',
            'outfit': {
                'male': {
                    'head': 'yuni_m_scout_turban_keffiyeh',
                    'torso': 'yuni_m_scout_greatcloak',
                    'back': 'yuni_m_scout_radio_pack',
                    'legs': 'yuni_m_scout_cargo_pants',
                    'feet': 'yuni_m_scout_combat_boots',
                    'gloves': 'yuni_m_scout_gloves',
                },
                'female': {
                    'head': 'yuni_f_scout_hood_cowl',
                    'torso': 'yuni_f_scout_greatcloak',
                    'back': 'yuni_f_scout_radio_pack',
                    'legs': 'yuni_f_scout_cargo_pants',
                    'feet': 'yuni_f_scout_combat_boots',
                    'gloves': 'yuni_f_scout_gloves',
                },
            },
        },
    ]

    manifest_path = SCRATCH / 'yuni_military_manifest.json'
    manifest_data = {
        'culture': 'yuni',
        'kit_entries': kit_entries,
        'social_types': social_types,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    print(f'Successfully built {len(kit_entries)} Yuni Scout/Military pieces (male & female) in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
