"""Build the 3 'Bodyguards of a True Heir' (Eternal State Sanctum / `eternian` culture)
for BOTH `mpfb_male` (`_m_`) and `mpfb_female` (`_f_`):

1. True Heir's Juggernaut-Praetorian (`eternian_m/f_heir_juggernaut_*`):
   - `head`: `eternian_m/f_heir_juggernaut_helm`
   - `torso`: `eternian_m/f_heir_juggernaut_cuirass`
   - `back`: `eternian_m/f_heir_juggernaut_reactor`
   - `gloves`: `eternian_m/f_heir_juggernaut_gauntlets`
   - `feet`: `eternian_m/f_heir_juggernaut_sabatons`

2. True Heir's Cyber-Ronin Sentinel (`eternian_m/f_heir_sentinel_*`):
   - `head`: `eternian_m/f_heir_sentinel_kasa`
   - `torso`: `eternian_m/f_heir_sentinel_chassis`
   - `gloves`: `eternian_m/f_heir_sentinel_cyberhands`
   - `legs`: `eternian_m/f_heir_sentinel_cyberlegs`
   - `feet`: `eternian_m/f_heir_sentinel_cyberboots`

3. True Heir's Cyber-Mantis Blade-Stalker (`eternian_m/f_heir_stalker_*`):
   - `head`: `eternian_m/f_heir_stalker_kasa`
   - `torso`: `eternian_m/f_heir_stalker_armor`
   - `gloves`: `eternian_m/f_heir_stalker_gauntlets`
   - `legs`: `eternian_m/f_heir_stalker_breeches`
   - `feet`: `eternian_m/f_heir_stalker_greaves`

Writes `.glb` and `.morph.bin` files to `pieces/mpfb_male/` and `pieces/mpfb_female/`,
and outputs the manifest JSON to `scratch/true_heir_bodyguards_manifest.json`.
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
    C, P, B, PN, Part, head_frame, hood, blob, horn, set_body, J,
    spine_at, first_hit, chest_front, ring_points, flap
)

# Ensure custom palette colors exist in C
C.setdefault('verdigris', (0.26, 0.52, 0.46))
C.setdefault('amber', (0.96, 0.58, 0.08))
C.setdefault('cybercyan', (0.22, 0.82, 0.95))
C.setdefault('charcoal', (0.14, 0.14, 0.15))
C.setdefault('steel', (0.52, 0.55, 0.58))
C.setdefault('ivory', (0.92, 0.89, 0.80))

_ORIG_MOTIF = bio.paint.motif


def _bodyguard_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((h, w, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = (xx + 0.5) / max(w, 1), (yy + 0.5) / max(h, 1)

    if style == 'juggernaut_mask':
        # Dark bronze full faceplate with glowing amber vertical slit-eyes & central nose-bridge
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # Central bronze nose-bridge & brow T-ridge
        brow_bar = (mv > 0.22) & (mv < 0.34) & (abs_u < 0.62)
        nose_bridge = (mv >= 0.26) & (mv < 0.86) & (abs_u < 0.075)
        nose_core = (mv >= 0.28) & (mv < 0.82) & (abs_u < 0.032)
        img[brow_bar | nose_bridge] = C['bronze']
        img[nose_core] = C['brass']
        # Recessed dark iron eye-plates & cheek facets
        cheek_plate = (abs_u > 0.08) & (abs_u < 0.58) & (mv > 0.32) & (mv < 0.88)
        img[cheek_plate] = C['soot']
        # Glowing amber vertical slit-eyes + horizontal ocular cross-slit
        v_slit = (np.abs(abs_u - 0.22) < 0.045) & (mv > 0.34) & (mv < 0.58)
        h_slit = (abs_u > 0.12) & (abs_u < 0.36) & (np.abs(mv - 0.42) < 0.028)
        slit_core = ((np.abs(abs_u - 0.22) < 0.022) & (mv > 0.36) & (mv < 0.55)) | (
            (abs_u > 0.14) & (abs_u < 0.33) & (np.abs(mv - 0.42) < 0.014)
        )
        img[v_slit | h_slit] = C['amber']
        img[slit_core] = C['yuniyellow']
        # Vertical mouth/jaw slits
        jaw_slits = (abs_u > 0.10) & (abs_u < 0.44) & (mv > 0.64) & (mv < 0.86) & (np.abs(((mu * 10.0) % 1.0) - 0.5) < 0.22)
        img[jaw_slits] = C['bronze']
        return img

    elif style == 'juggernaut_arch':
        # Verdigris-patinated bronze with engraved concentric arch reliefs & bronze borders
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        av = 1.0 - v
        r_arch = np.hypot(su * 0.95, (av - 0.15) * 1.15)
        arch1 = np.abs(r_arch - 0.72) < 0.055
        arch2 = np.abs(r_arch - 0.52) < 0.045
        arch3 = np.abs(r_arch - 0.32) < 0.040
        center_line = (au < 0.055) & (av > 0.15) & (av < 0.88)
        frame_border = (au > 0.86) | (v < 0.08) | (v > 0.92)
        weathered = ((np.sin(u * 19.0 + v * 11.0) * np.cos(u * 7.0 - v * 23.0)) > 0.55)
        img[weathered] = np.asarray(bg) * 0.86 + np.asarray(C['bronze']) * 0.14
        img[arch1 | arch2 | arch3 | center_line | frame_border] = fg
        return img

    elif style == 'juggernaut_scroll':
        # Cream-parchment purity scroll with gold geometric line-sigils & concentric quarter-arcs
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        border = (au > 0.84) & (au < 0.91)
        staff = (au < 0.035) & (v > 0.08) & (v < 0.82)
        ring1 = np.abs(np.hypot(su * 1.2, (v - 0.28) * 3.2) - 0.24) < 0.038
        ring2 = np.abs(np.hypot(su * 1.2, (v - 0.58) * 3.2) - 0.20) < 0.035
        fork = (v > 0.46) & (v < 0.55) & (np.abs(au - (0.55 - v) * 1.8) < 0.035)
        # Sweeping concentric arcs in the lower third of the scroll
        r_bot = np.hypot((au - 0.88) * 1.1, (v - 0.92) * 2.4)
        arcs_bot = (v > 0.66) & (v < 0.94) & (
            (np.abs(r_bot - 0.35) < 0.032) |
            (np.abs(r_bot - 0.52) < 0.032) |
            (np.abs(r_bot - 0.69) < 0.032) |
            (np.abs(r_bot - 0.86) < 0.032)
        )
        img[border | staff | ring1 | ring2 | fork | arcs_bot] = fg
        return img

    elif style == 'sentinel_visor':
        # Dark gunmetal cyber-faceplate with glowing amber V-visor slit
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # Faceted gunmetal cheek & jaw plates
        cheek = (abs_u > 0.10) & (abs_u < 0.66) & (mv > 0.36) & (mv < 0.86)
        img[cheek] = C['charcoal']
        nose_ridge = (abs_u < 0.08) & (mv > 0.38) & (mv < 0.88)
        img[nose_ridge] = C['iron']
        # Glowing amber V-visor slit across the upper face
        v_center = 0.38 - 0.16 * abs_u
        in_visor = (abs_u < 0.52) & (np.abs(mv - v_center) < 0.042 * (1.0 - 0.45 * abs_u))
        visor_core = (abs_u < 0.48) & (np.abs(mv - v_center) < 0.020 * (1.0 - 0.45 * abs_u))
        visor_rim = (abs_u < 0.56) & (np.abs(mv - v_center) < 0.062) & (~in_visor)
        img[visor_rim] = C['bronze']
        img[in_visor] = C['amber']
        img[visor_core] = C['yuniyellow']
        # Segmented chin/neck grill lines
        chin_ribs = (abs_u < 0.32) & (mv > 0.66) & (mv < 0.92) & (np.abs(((mv * 18.0) % 1.0) - 0.5) < 0.22)
        img[chin_ribs] = C['soot']
        return img

    elif style == 'sentinel_kasa':
        # Verdigris-bronze dome kasa & tasset segments with concentric geometric lines & sun-circles
        su = (u * 4.0) % 1.0 - 0.5
        sv = v
        rib = np.abs(su) > 0.43
        ring_a = (np.abs(sv - 0.28) < 0.035) | (np.abs(sv - 0.64) < 0.035) | (np.abs(sv - 0.88) < 0.045)
        r_c = np.hypot(su * 1.6, (sv - 0.46) * 2.2)
        circle_glyph = (np.abs(r_c - 0.28) < 0.045) | (r_c < 0.07)
        patina = ((np.sin(u * 23.0 + v * 17.0) + np.cos(u * 13.0 - v * 29.0)) > 0.85)
        img[patina] = C['teal']
        img[rib | ring_a | circle_glyph] = fg
        return img

    elif style == 'sentinel_sun_cloak':
        # Golden-saffron / ochre cloak with white concentric sun-ring markings
        su = (u - 0.5) * 2.0
        sv = (v - 0.58) * 2.2
        r_sun = np.hypot(su, sv)
        rings = (
            (np.abs(r_sun - 0.22) < 0.032) |
            (np.abs(r_sun - 0.44) < 0.035) |
            (np.abs(r_sun - 0.68) < 0.028) |
            (np.abs(r_sun - 0.82) < 0.025)
        )
        cross_line = (np.abs(su - sv * 0.6) < 0.028) & (r_sun > 0.22) & (r_sun < 0.88)
        small_orb = np.abs(np.hypot(su - 0.34, sv + 0.28) - 0.14) < 0.028
        folds = 0.90 + 0.10 * np.sin(u * 10.0 * math.pi + v * 2.0)
        img[:] = np.asarray(bg)[None, None, :] * folds[:, :, None]
        img[rings | cross_line | small_orb] = fg
        return img

    elif style == 'stalker_mask':
        # Angular silver-steel faceted battle-mask with glowing cyan multi-eye V-optics
        mu = (u - 0.5) * 2.0
        mv = v
        abs_u = np.abs(mu)
        # Dark gunmetal upper brow & outer cheek recesses
        upper_brow = mv < (0.36 + 0.18 * (0.5 - abs_u))
        outer_cheek = (abs_u > 0.36 + 0.22 * (1.0 - mv)) | (mv > 0.88)
        img[upper_brow | outer_cheek] = C['soot']
        # Central sharp silver-white nasal keel
        keel = (abs_u < 0.055) & (mv >= 0.36) & (mv < 0.88)
        img[keel] = C['white']
        # Vertical dark vent slits on lower jaw
        vent = (abs_u > 0.09) & (abs_u < 0.26) & (mv > 0.56) & (mv < 0.84) & (np.abs(((mu * 14.0) % 1.0) - 0.5) < 0.20)
        img[vent] = C['soot']
        # 3 slanted glowing cyan multi-eye V-optics on each side + forehead cyan V-node
        fore_v = (abs_u < 0.16) & (np.abs(mv - (0.28 - 0.35 * abs_u)) < 0.025)
        eye1 = (abs_u > 0.08) & (abs_u < 0.24) & (np.abs(mv - (0.43 - 0.28 * (abs_u - 0.08))) < 0.024)
        eye2 = (abs_u > 0.20) & (abs_u < 0.38) & (np.abs(mv - (0.39 - 0.28 * (abs_u - 0.20))) < 0.024)
        eye3 = (abs_u > 0.32) & (abs_u < 0.50) & (np.abs(mv - (0.35 - 0.28 * (abs_u - 0.32))) < 0.022)
        img[fore_v | eye1 | eye2 | eye3] = C['cybercyan']
        return img

    elif style == 'stalker_carapace':
        # Segmented amber-orange insectoid shoulder/shin plates with glowing cyan energy-vents
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        lame_v = (v * 3.0) % 1.0
        chevron = lame_v - 0.28 * (1.0 - au)
        seam = np.abs(chevron - 0.25) < 0.065
        cyan_vent = (np.abs(chevron - 0.25) < 0.032) & (au > 0.18) & (au < 0.68)
        center_rib = au < 0.045
        edge_dark = au > 0.86
        img[seam | center_rib | edge_dark] = C['soot']
        img[cyan_vent] = C['cybercyan']
        return img

    return _ORIG_MOTIF(style, w, h, fg, bg, aspect=aspect)


bio.paint.motif = _bodyguard_motif
bio.motif = _bodyguard_motif


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
    entry['type'] = 'important_npc'
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
    main_part = bio.torso_tube(name, z0, z1, ease, paint, n=n, rows=rows,
                               hang_from=hang_from, flare=flare,
                               group_below=grp_below, hull_from=hull_from,
                               points=pts, layer=layer, arc=arc, over_arms=over_arms)
    if yoke and z0 >= core.NECK[2] - 0.015:
        yoke_part = bio.collar_disc(f'{name}_yoke', 0.085, P('gold', 0.02, fabric='metal.gold'),
                                    drop=0.032, rows=4, n=36, scallop=0.0, ease=ease + 0.004, z_off=0.004)
        return [main_part, yoke_part]
    return main_part


def sleeve(name, side, paint, f0=0.0, f1=0.92, ease=0.020, flare=0.008, rows=12, n=22):
    a, e, h = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')
    f0_eff = max(float(f0), 0.08)

    def pt_at(f):
        if f <= 0.5:
            return a + (e - a) * (f / 0.5)
        return e + (h - e) * ((f - 0.5) / 0.5)

    if f0_eff < 0.48 and f1 > 0.52:
        path = [pt_at(f0_eff), e, pt_at(f1)]
    else:
        path = [pt_at(f0_eff), pt_at(f1)]
    return bio.limb_tube(name, None, None, ease, paint, n=n, rows=rows,
                         ease_end=ease + flare, start_back=0.0, path=path, bvh=core.BVH_A, rmax=0.145)


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


def collar(name, paint, h=0.08, flare=0.03, open_front=0.0, rows=7, n=30, ease_base=0.020):
    zs = np.linspace(core.TOP + h, core.TOP - 0.015, rows)
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
        Q.append(ring_points(spine_at(z), x, y, angs, e_k, rmin=0.055, rmax=0.24, bvh=core.BVH_T))
    return Part(name, np.array(Q), closed, ['body'] * rows, paint)


def sculpted_faceplate(name, paint, f_top=0.80, f_bot=-0.06, ease=0.012, rows=16, n=34, jaw_narrow=0.38):
    a, b, up, bk, left = head_frame()
    fs = np.linspace(f_top, f_bot, rows)
    angs = np.linspace(0.54 * math.pi, 1.46 * math.pi, n)
    Q = []
    for k, f in enumerate(fs):
        vf = k / max(rows - 1, 1)
        c = a + (b - a) * f
        top_taper = 1.0 - 0.22 * (max(0.0, (0.20 - vf) / 0.20) ** 1.6)
        jaw_taper = 1.0 - jaw_narrow * (max(0.0, (vf - 0.48) / 0.52) ** 1.45)
        rx = (0.104 + ease * 0.6) * top_taper * jaw_taper
        ry = (0.136 + ease) * (1.0 - 0.14 * max(0.0, (vf - 0.56) / 0.44))
        row_pts = []
        for an in angs:
            sx = math.sin(an)
            cy = math.cos(an)
            frontness = max(0.0, -cy)
            brow = 0.011 * math.exp(-(((vf - 0.29) / 0.09) ** 2)) * math.exp(-((sx / 0.58) ** 2)) * (frontness ** 1.5)
            eye_rec = -0.008 * math.exp(-(((abs(sx) - 0.26) / 0.12) ** 2)) * math.exp(-(((vf - 0.39) / 0.07) ** 2)) * frontness
            nose = 0.018 * math.exp(-((sx / 0.12) ** 2)) * math.exp(-(((vf - 0.49) / 0.18) ** 2)) * (0.65 + 0.55 * max(0.0, (vf - 0.30) / 0.28)) * (frontness ** 2)
            cheek = 0.009 * math.exp(-(((abs(sx) - 0.40) / 0.18) ** 2)) * math.exp(-(((vf - 0.48) / 0.14) ** 2)) * frontness
            cheek_hollow = -0.005 * math.exp(-(((abs(sx) - 0.34) / 0.16) ** 2)) * math.exp(-(((vf - 0.66) / 0.12) ** 2)) * frontness
            chin_boss = 0.007 * math.exp(-((sx / 0.18) ** 2)) * math.exp(-(((vf - 0.88) / 0.10) ** 2)) * (frontness ** 2)
            fwd_shift = 0.010 + ease + brow + eye_rec + nose + cheek + cheek_hollow + chin_boss
            row_pts.append(c + left * (sx * rx) + bk * (cy * ry - fwd_shift))
        Q.append(row_pts)
    return Part(name, np.array(Q), False, ['body'] * rows, paint, rigid_joint='Head')


def sculpted_cranium(name, paint, f_top=1.05, f_bot=-0.06, ease=0.008, rows=14, n=36):
    a, b, up, bk, left = head_frame()
    fs = np.linspace(f_top, f_bot, rows)
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


def crossed_sash(name, paint, width=0.06, ease=0.032, high=math.pi * 0.45):
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


def glove(name, side, hand_paint, cuff_paint=None, finger_paint=None, f0=0.62, ease=0.014):
    """Fitted cybernetic gauntlet/glove with forearm cuff, contoured metacarpal shell, and 5 articulated fingers."""
    out = []
    out.append(sleeve(f'{name}_cuff_{side}', side, cuff_paint or hand_paint, f0=f0, f1=0.98, ease=ease, flare=0.008, rows=8, n=20))
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
    f_paint = finger_paint or P('soot', 0.02, [B('bottom', 0.0, 0.006, 'solid', 'gold'), B('top', 0.0, 0.006, 'solid', 'gold')], fabric='metal.iron')
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


# ===============================================================================================================
# 1. True Heir's Juggernaut-Praetorian (`eternian_m/f_heir_juggernaut_*`)
# ===============================================================================================================
def _build_heir_juggernaut(sex, body_id):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    verdigris_p = P('verdigris', 0.03, [
        B('bottom', 0.0, 0.035, 'solid', 'bronze'),
        B('top', 0.0, 0.030, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'juggernaut_arch', 'bronze', 'verdigris', 0.22),
    ], fabric='metal.bronze')

    scroll_p = P('cream', 0.03, [
        B('bottom', 0.0, 0.045, 'rays', 'oat', 'cream', 0.018),
        B('bottom', 0.045, 0.060, 'solid', 'gold'),
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.04, 0.96, 'juggernaut_scroll', 'gold', 'cream', 0.34),
    ], fabric='cloth.plain')

    # --- HEAD: eternian_m/f_heir_juggernaut_helm ---
    gid_h = f'eternian_{sex}_heir_juggernaut_helm'
    parts_h = []

    # 1. Dark bronze & iron cranial casque + full faceplate with glowing amber vertical slit-eyes & nose-bridge
    parts_h.append(sculpted_cranium(gid_h + '_casque', P('soot', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'bronze')], fabric='metal.iron'),
                                    f_top=0.96, f_bot=-0.08, ease=0.009))
    mask_p = P('soot', 0.02, [
        B('top', 0.0, 0.025, 'solid', 'bronze'),
        B('bottom', 0.0, 0.025, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'juggernaut_mask', 'amber', 'soot', 0.22),
    ], fabric='metal.iron')
    parts_h.append(sculpted_faceplate(gid_h + '_faceplate', mask_p, f_top=0.72, f_bot=-0.08, ease=0.014, jaw_narrow=0.32))

    # 2. Wide verdigris-patinated bronze kettle-dome helmet (top-to-bottom row ordering)
    dome_p = P('verdigris', 0.03, [
        B('bottom', 0.0, 0.030, 'solid', 'bronze'),
        B('top', 0.0, 0.025, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'juggernaut_arch', 'bronze', 'verdigris', 0.16),
    ], fabric='metal.bronze')
    angs_d = np.linspace(0, 2 * math.pi, 40, endpoint=False)
    dome_rows = []
    for f_d, rx_d, ry_d in (
        (1.06, 0.018, 0.018),
        (1.02, 0.075, 0.082),
        (0.92, 0.128, 0.138),
        (0.76, 0.168, 0.178),
        (0.58, 0.210, 0.215),
        (0.52, 0.222, 0.225),
        (0.50, 0.115, 0.135),
    ):
        c_d = a + (b - a) * f_d - bk * 0.008
        dome_rows.append([c_d + left * (math.sin(an) * rx_d) + bk * (math.cos(an) * ry_d) for an in angs_d])
    parts_h.append(Part(gid_h + '_kettle_dome', np.array(dome_rows), True, ['body'] * len(dome_rows), dome_p, rigid_joint='Head'))

    # 3. Raised crescent-horn finial (U-shaped bronze crest on top of the helmet dome)
    crest_base = a + (b - a) * 1.02 - bk * 0.012
    parts_h.append(rosette(gid_h + '_crest_socket', crest_base, up, left, 0.032, P('bronze', 0.02, fabric='metal.bronze'),
                           n=12, thick=0.018, rigid_joint='Head'))
    # Central bronze ridge coming down the front of the kettle dome
    ridge_pts = [a + (b - a) * (1.02 - 0.50 * t) - bk * (0.04 + 0.185 * (t ** 0.7)) for t in np.linspace(0, 1, 6)]
    parts_h.append(horn(gid_h + '_front_ridge', ridge_pts, 0.014, 0.012, P('bronze', 0.02, fabric='metal.bronze'),
                        n=8, rows=6, rigid_joint='Head'))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        u_pts = [
            crest_base + left * (sgn * 0.010) + up * 0.010,
            crest_base + left * (sgn * 0.055) + up * 0.022,
            crest_base + left * (sgn * 0.082) + up * 0.065,
            crest_base + left * (sgn * 0.076) + up * 0.115,
        ]
        parts_h.append(horn(f'{gid_h}_crest_horn_{tag}', u_pts, 0.016, 0.012,
                            P('bronze', 0.02, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='metal.bronze'),
                            n=10, rows=7, rigid_joint='Head'))

    # 4. Two cream-parchment prayer/purity scroll-stoles emerging from under the helmet rim flanking the faceplate
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        stole_top = a + (b - a) * 0.48 + left * (sgn * 0.082) - bk * 0.118
        stole_out = left * (sgn * 0.22) - bk * 0.96
        parts_h.append(flap(f'{gid_h}_head_stole_{tag}', stole_top, 0.058, 0.22, stole_out, scroll_p,
                            cols=5, rows=7, sway=0.015, push=False, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, "True Heir's Juggernaut-Praetorian Kettle-Helm & Scroll-Stoles", 'head', 'eternian', parts_h,
                                    covers_hair=True, covers_face=True))

    # --- TORSO: eternian_m/f_heir_juggernaut_cuirass ---
    gid_t = f'eternian_{sex}_heir_juggernaut_cuirass'
    parts_t = []

    # 1. Heavy verdigris-and-bronze thoracic cuirass + gorget
    parts_t.append(torso_tube(gid_t + '_cuirass', core.WAIST - 0.02, core.TOP + 0.01, verdigris_p,
                              ease=0.028, flare=0.02, rows=16, n=40))
    parts_t.append(collar(gid_t + '_gorget', P('bronze', 0.02, [B('top', 0.0, 0.02, 'solid', 'verdigris')], fabric='metal.bronze'),
                          h=0.065, flare=0.025, open_front=0.0, rows=6, n=32, ease_base=0.024))

    # 2. Glowing amber circular chest reactor-core in a raised bronze housing on Spine2
    core_pos = chest_front(core.CHEST + 0.01, 0.048)
    parts_t.append(rosette(gid_t + '_core_housing', core_pos, np.array([0.0, -1.0, 0.0]), left, 0.062,
                           P('bronze', 0.02, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='metal.bronze'),
                           n=16, thick=0.020, rigid_joint='Spine2'))
    parts_t.append(rosette(gid_t + '_core_glow', core_pos + np.array([0.0, -0.012, 0.0]), np.array([0.0, -1.0, 0.0]), left, 0.038,
                           P('amber', 0.01, [B('top', 0.0, 0.015, 'solid', 'yuniyellow')], fabric='beads.glass'),
                           n=14, thick=0.016, rigid_joint='Spine2'))

    # 3. Massive square-shouldered verdigris-and-bronze fortress pauldrons with engraved concentric arch reliefs
    fortress_p = P('verdigris', 0.03, [
        B('bottom', 0.0, 0.045, 'solid', 'bronze'),
        B('top', 0.0, 0.040, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'juggernaut_arch', 'bronze', 'verdigris', 0.20),
    ], fabric='metal.bronze')
    vambrace_p = P('verdigris', 0.03, [
        B('bottom', 0.0, 0.035, 'solid', 'bronze'),
        B('top', 0.0, 0.040, 'solid', 'bronze'),
        B('bottom', 0.04, 0.14, 'vstripes', 'amber', 'bronze', 0.028),
    ], fabric='metal.bronze')

    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        # Inner dark charcoal pleated arming sleeve
        parts_t.append(sleeve(f'{gid_t}_undersleeve_{side}', side,
                              P('charcoal', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'bronze')], [PN(0.0, 1.0, 'fluted', 'bronze', 'charcoal', 0.06)]),
                              f0=0.0, f1=0.88, ease=0.018, flare=0.008, rows=12, n=22))
        # Base layered pauldron
        parts_t.append(pauldron(f'{gid_t}_pauldron_base_{side}', side, fortress_p, span=0.25, drop=0.22, lift=0.034))
        # Outer blocky squared fortress shoulder carapace (locked to LeftArm/RightArm)
        sh_j = J(side + 'Arm')
        el_j = J(side + 'ForeArm')
        arm_d = (el_j - sh_j) / max(np.linalg.norm(el_j - sh_j), 1e-6)
        angs_sq = np.linspace(0, 2 * math.pi, 24, endpoint=False)
        sq_rows = []
        for s_h, sc_w, sc_d in (
            (-0.04, 0.12, 0.12),
            (-0.03, 0.96, 0.94),
            (0.04, 1.04, 1.00),
            (0.12, 1.00, 0.98),
            (0.18, 0.88, 0.90),
            (0.19, 0.15, 0.15),
        ):
            c_sq = sh_j + arm_d * s_h + left * (sgn * 0.032) + up * 0.018
            row_sq = []
            for an in angs_sq:
                cs, sn = math.cos(an), math.sin(an)
                # Squircle profile for blocky fortress shoulder silhouette
                wx = np.sign(sn) * (abs(sn) ** 0.52) * 0.092 * sc_w
                wy = np.sign(cs) * (abs(cs) ** 0.52) * 0.112 * sc_d
                row_sq.append(c_sq + left * (sgn * wx) + bk * wy)
            sq_rows.append(row_sq)
        parts_t.append(Part(f'{gid_t}_fortress_sh_{side}', np.array(sq_rows), True, ['body'] * len(sq_rows),
                            fortress_p, rigid_joint=side + 'Arm'))
        # Forearm power-cell vambrace + elbow boss
        parts_t.append(sleeve(f'{gid_t}_vambrace_{side}', side, vambrace_p, f0=0.44, f1=0.90, ease=0.026, flare=0.006, rows=9, n=22))
        parts_t.append(rosette(f'{gid_t}_elbow_{side}', el_j - bk * 0.048, -bk, left, 0.032,
                               P('bronze', 0.02, fabric='metal.bronze'), n=12, thick=0.014, rigid_joint=side + 'ForeArm'))

    # 4. Unified lower-body Praetorian armored skirt: tiered verdigris-bronze tassets over fluted charcoal & gold border,
    #    with integrated cream-parchment purity scroll panels so layers never cross or z-fight during animation.
    skirt_p = P('verdigris', 0.03, [
        B('top', 0.0, 0.045, 'solid', 'bronze'),
        B('top', 0.045, 0.52, 'lorica_lames', 'bronze', 'verdigris', 0.055),
        B('top', 0.52, 0.56, 'dentils', 'gold', 'bronze', 0.04),
        B('bottom', 0.10, 0.44, 'fluted', 'bronze', 'charcoal', 0.08),
        B('bottom', 0.0, 0.10, 'juggernaut_arch', 'gold', 'charcoal', 0.16),
    ], [
        PN(0.44, 0.56, 'juggernaut_arch', 'gold', 'verdigris', 0.22),
        PN(0.36, 0.43, 'scroll_script', 'soot', 'cream', 0.28),
        PN(0.57, 0.64, 'scroll_script', 'soot', 'cream', 0.28),
        PN(0.06, 0.13, 'scroll_script', 'soot', 'cream', 0.28),
        PN(0.87, 0.94, 'scroll_script', 'soot', 'cream', 0.28),
    ], fabric='metal.bronze')
    parts_t.append(skirt(gid_t + '_armored_skirt', core.ANKLE + 0.10, core.WAIST + 0.02, skirt_p,
                         ease=0.032, flare=0.10, rows=22, n=48))

    # Waist belt & diamond/octagonal bronze clasp
    parts_t.append(belt_sash(gid_t + '_belt', core.WAIST - 0.02, core.WAIST + 0.06,
                             P('bronze', 0.02, [B('bottom', 0.0, 0.025, 'solid', 'verdigris')], fabric='metal.bronze'), ease=0.042))
    buckle_pos = chest_front(core.WAIST + 0.02, 0.050)
    parts_t.append(rosette(gid_t + '_waist_clasp', buckle_pos, np.array([0.0, -1.0, 0.0]), left, 0.046,
                           P('bronze', 0.02, [B('top', 0.0, 0.015, 'solid', 'gold')], fabric='metal.bronze'),
                           n=12, thick=0.016, rigid_joint='Hips'))

    # 5. Upper-chest cream-parchment purity scroll stoles from shoulders to waist belt (continuing onto the skirt panels below)
    z_scroll_bot = core.WAIST + 0.02
    z_scroll_top = core.SHOULDER + 0.01
    for c_ang, tag in (
        (math.pi - 0.34, 'front_L'),
        (math.pi + 0.34, 'front_R'),
        (0.32, 'back_L'),
        (-0.32, 'back_R'),
    ):
        parts_t.extend(tabard(f'{gid_t}_scroll_{tag}', z_scroll_bot, z_scroll_top, 0.11, scroll_p,
                              ease=0.040, flare=0.01, center_ang=c_ang))

    entries.append(assemble_garment(gid_t, "True Heir's Juggernaut-Praetorian Fortress Cuirass & Purity Scrolls", 'torso', 'eternian', parts_t))

    # --- BACK: eternian_m/f_heir_juggernaut_reactor ---
    gid_b = f'eternian_{sex}_heir_juggernaut_reactor'
    parts_b = []
    sp1 = J('Spine1')
    sp2 = J('Spine2')
    back_ctr = 0.35 * sp1 + 0.65 * sp2 + bk * 0.155 + up * 0.02

    # 1. Sculpted verdigris-and-bronze dorsal furnace carapace with concentric arch relief (rigid_joint='Spine2')
    angs_pk = np.linspace(0, 2 * math.pi, 28, endpoint=False)
    carapace_rows = []
    for z_off, w_x, w_y in (
        (0.16, 0.02, 0.02),
        (0.14, 0.155, 0.072),
        (0.06, 0.175, 0.088),
        (-0.04, 0.145, 0.082),
        (-0.14, 0.105, 0.065),
        (-0.22, 0.062, 0.045),
        (-0.24, 0.015, 0.015),
    ):
        row_c = []
        for an in angs_pk:
            cs, sn = math.cos(an), math.sin(an)
            sq_x = np.sign(sn) * (abs(sn) ** 0.65) * w_x
            sq_y = np.sign(cs) * (abs(cs) ** 0.65) * w_y
            row_c.append(back_ctr + left * sq_x + bk * sq_y + up * z_off)
        carapace_rows.append(row_c)
    parts_b.append(Part(gid_b + '_dorsal_carapace', np.array(carapace_rows), True, ['body'] * len(carapace_rows),
                        verdigris_p, rigid_joint='Spine2'))

    # Central dorsal circular bronze medallion relief
    parts_b.append(rosette(gid_b + '_dorsal_seal', back_ctr + bk * 0.082 + up * 0.04, bk, left, 0.068,
                           P('bronze', 0.02, [B('top', 0.0, 0.02, 'solid', 'verdigris')], fabric='metal.bronze'),
                           n=16, thick=0.018, rigid_joint='Spine2'))

    # 2. Twin glowing amber lantern-turbines rising behind the left and right shoulders
    turbine_p = P('bronze', 0.02, [
        B('top', 0.0, 0.03, 'solid', 'bronze'),
        B('bottom', 0.0, 0.03, 'solid', 'bronze'),
        B('bottom', 0.03, 0.11, 'vstripes', 'amber', 'bronze', 0.026),
    ], fabric='metal.bronze')
    cap_p = P('bronze', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'gold')], fabric='metal.bronze')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        t_base = back_ctr + left * (sgn * 0.165) - bk * 0.015 + up * 0.11
        t_top = t_base + up * 0.135
        parts_b.append(horn(f'{gid_b}_turbine_{tag}', [t_base, t_top], 0.056, 0.052, turbine_p,
                            n=16, rows=8, rigid_joint='Spine2'))
        parts_b.append(rosette(f'{gid_b}_turbine_cap_{tag}', t_top + up * 0.012, up, left, 0.058, cap_p,
                               n=16, thick=0.022, rigid_joint='Spine2'))
        parts_b.append(rosette(f'{gid_b}_turbine_finial_{tag}', t_top + up * 0.032, up, left, 0.026, cap_p,
                               n=12, thick=0.016, rigid_joint='Spine2'))

    entries.append(assemble_garment(gid_b, "True Heir's Juggernaut-Praetorian Dorsal Furnace-Pack", 'back', 'eternian', parts_b))

    # --- GLOVES: eternian_m/f_heir_juggernaut_gauntlets ---
    gid_g = f'eternian_{sex}_heir_juggernaut_gauntlets'
    parts_g = []
    g_cuff_p = P('verdigris', 0.03, [B('top', 0.0, 0.025, 'solid', 'bronze'), B('bottom', 0.0, 0.025, 'solid', 'bronze')], fabric='metal.bronze')
    g_hand_p = P('verdigris', 0.03, [B('top', 0.0, 0.02, 'solid', 'bronze'), B('bottom', 0.0, 0.02, 'solid', 'bronze')], fabric='metal.bronze')
    g_finger_p = P('soot', 0.02, [B('top', 0.0, 0.008, 'solid', 'bronze'), B('bottom', 0.0, 0.008, 'solid', 'bronze')], fabric='metal.iron')
    for side in ('Left', 'Right'):
        parts_g.extend(glove(gid_g, side, g_hand_p, cuff_paint=g_cuff_p, finger_paint=g_finger_p, f0=0.68, ease=0.015))
    entries.append(assemble_garment(gid_g, "True Heir's Juggernaut-Praetorian Cyber-Gauntlets", 'gloves', 'eternian', parts_g))

    # --- FEET: eternian_m/f_heir_juggernaut_sabatons ---
    gid_f = f'eternian_{sex}_heir_juggernaut_sabatons'
    parts_f = []
    sabaton_p = P('verdigris', 0.03, [
        B('top', 0.0, 0.05, 'solid', 'bronze'),
        B('bottom', 0.0, 0.05, 'lorica_lames', 'bronze', 'verdigris', 0.04),
    ], [
        PN(0.15, 0.85, 'juggernaut_arch', 'bronze', 'verdigris', 0.16),
    ], fabric='metal.bronze')
    sole_p = P('soot', 0.03, [B('top', 0.0, 0.015, 'solid', 'bronze')], fabric='metal.iron')
    for s in ('Left', 'Right'):
        parts_f.extend(boot(f'{gid_f}_{s}', s, sabaton_p, top_f=0.08, ease=0.022, rows=16, n=24, cuff=0.018, sole_paint=sole_p))
        knee_j = J(s + 'Leg')
        foot_j = J(s + 'Foot')
        parts_f.append(rosette(f'{gid_f}_kneecop_{s}', knee_j - bk * 0.072 + up * 0.01, -bk, left, 0.042,
                               P('bronze', 0.02, [B('top', 0.0, 0.015, 'solid', 'verdigris')], fabric='metal.bronze'),
                               n=12, thick=0.016, rigid_joint=s + 'Leg'))
        ank_c = foot_j + (knee_j - foot_j) * 0.16
        parts_f.append(bio.limb_tube(f'{gid_f}_anklestrap_{s}', ank_c, ank_c + up * 0.032, 0.026,
                                     P('bronze', 0.02, fabric='metal.bronze'), n=18, rows=3))
    entries.append(assemble_garment(gid_f, "True Heir's Juggernaut-Praetorian Armored Sabatons", 'feet', 'eternian', parts_f))
    return entries


# ===============================================================================================================
# 2. True Heir's Cyber-Ronin Sentinel (`eternian_m/f_heir_sentinel_*`)
# ===============================================================================================================
def _build_heir_sentinel(sex, body_id):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    kasa_p = P('verdigris', 0.03, [
        B('bottom', 0.0, 0.030, 'solid', 'brass'),
        B('top', 0.0, 0.025, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'sentinel_kasa', 'brass', 'verdigris', 0.18),
    ], fabric='metal.bronze')

    steel_p = P('silver', 0.02, [
        B('top', 0.0, 0.025, 'solid', 'iron'),
        B('bottom', 0.0, 0.025, 'solid', 'iron'),
    ], [
        PN(0.15, 0.85, 'fluted', 'iron', 'silver', 0.08),
    ], fabric='metal.iron')

    # --- HEAD: eternian_m/f_heir_sentinel_kasa ---
    gid_h = f'eternian_{sex}_heir_sentinel_kasa'
    parts_h = []

    # 1. Dark gunmetal cyber-faceplate with glowing amber V-visor slit + ribbed cyber-neck
    parts_h.append(sculpted_cranium(gid_h + '_casque', P('charcoal', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'iron')], fabric='metal.iron'),
                                    f_top=0.92, f_bot=-0.10, ease=0.008))
    visor_p = P('soot', 0.02, [
        B('top', 0.0, 0.025, 'solid', 'iron'),
        B('bottom', 0.0, 0.025, 'solid', 'iron'),
    ], [
        PN(0.0, 1.0, 'sentinel_visor', 'amber', 'soot', 0.22),
    ], fabric='metal.iron')
    parts_h.append(sculpted_faceplate(gid_h + '_faceplate', visor_p, f_top=0.72, f_bot=-0.08, ease=0.013, jaw_narrow=0.35))

    # 2. Long rectangular verdigris-bronze cheek-guards (`shikoro` side-flaps) + rear neck-flaps
    cheek_p = P('verdigris', 0.03, [
        B('bottom', 0.0, 0.025, 'solid', 'brass'),
        B('top', 0.0, 0.025, 'solid', 'brass'),
    ], [
        PN(0.08, 0.92, 'juggernaut_arch', 'brass', 'verdigris', 0.14),
    ], fabric='metal.bronze')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        c_top = a + (b - a) * 0.54 + left * (sgn * 0.088) - bk * 0.095
        c_out = left * (sgn * 0.32) - bk * 0.94
        parts_h.append(flap(f'{gid_h}_shikoro_{tag}', c_top, 0.056, 0.165, c_out, cheek_p,
                            cols=4, rows=6, push=False, rigid_joint='Head'))
        b_top = a + (b - a) * 0.54 + left * (sgn * 0.065) + bk * 0.095
        b_out = left * (sgn * 0.28) + bk * 0.96
        parts_h.append(flap(f'{gid_h}_neckguard_{tag}', b_top, 0.052, 0.135, b_out, cheek_p,
                            cols=4, rows=5, push=False, rigid_joint='Head'))

    # 3. Wide-brimmed verdigris-bronze dome kasa hat with engraved concentric geometric segments & top finial knob
    angs_k = np.linspace(0, 2 * math.pi, 48, endpoint=False)
    kasa_rows = []
    for f_k, r_k in (
        (1.06, 0.015),
        (1.03, 0.068),
        (0.95, 0.138),
        (0.82, 0.205),
        (0.68, 0.245),
        (0.56, 0.265),
        (0.54, 0.115),
    ):
        c_k = a + (b - a) * f_k - bk * 0.008
        kasa_rows.append([c_k + (bk * math.cos(an) + left * math.sin(an)) * r_k for an in angs_k])
    parts_h.append(Part(gid_h + '_kasa_dome', np.array(kasa_rows), True, ['body'] * len(kasa_rows), kasa_p, rigid_joint='Head'))
    finial_c = a + (b - a) * 1.08 - bk * 0.008
    parts_h.append(rosette(gid_h + '_finial_base', finial_c, up, left, 0.038, P('brass', 0.02, fabric='metal.gold'),
                           n=14, thick=0.016, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_finial_knob', finial_c + up * 0.022, up, left, 0.020, P('brass', 0.02, fabric='metal.gold'),
                           n=12, thick=0.018, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, "True Heir's Cyber-Ronin Sentinel Verdigris Kasa & V-Visor", 'head', 'eternian', parts_h,
                                    covers_hair=True, covers_face=True))

    # --- TORSO: eternian_m/f_heir_sentinel_chassis ---
    gid_t = f'eternian_{sex}_heir_sentinel_chassis'
    parts_t = []

    # 1. Exposed silver-steel cybernetic ribcage/spine chassis on right + draped ochre sun-mantle on left
    chassis_p = P('silver', 0.02, [
        B('top', 0.0, 0.035, 'solid', 'brass'),
        B('bottom', 0.0, 0.035, 'lorica_lames', 'iron', 'soot', 0.04),
    ], [
        PN(0.0, 0.50, 'lorica_lames', 'silver', 'charcoal', 0.08),
        PN(0.50, 0.96, 'sentinel_sun_cloak', 'cream', 'ochre', 0.36),
        PN(0.48, 0.52, 'solid', 'brass', 'ochre', 1.0),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_ribcage', core.WAIST - 0.02, core.TOP + 0.01, chassis_p,
                              ease=0.024, flare=0.01, rows=16, n=40))
    parts_t.append(collar(gid_t + '_gorget', kasa_p, h=0.055, flare=0.025, open_front=0.0, rows=5, n=32, ease_base=0.024))

    # Blazing amber chest core + glowing orange conduit pipes feeding into the ribs (and dorsal spine conduits!)
    core_c = chest_front(core.CHEST + 0.01, 0.040)
    parts_t.append(rosette(gid_t + '_core_bezel', core_c, np.array([0.0, -1.0, 0.0]), left, 0.058,
                           P('brass', 0.02, [B('top', 0.0, 0.02, 'solid', 'silver')], fabric='metal.gold'),
                           n=16, thick=0.018, rigid_joint='Spine2'))
    parts_t.append(rosette(gid_t + '_core_amber', core_c + np.array([0.0, -0.010, 0.0]), np.array([0.0, -1.0, 0.0]), left, 0.036,
                           P('amber', 0.01, [B('top', 0.0, 0.015, 'solid', 'yuniyellow')], fabric='beads.glass'),
                           n=14, thick=0.016, rigid_joint='Spine2'))

    conduit_p = P('sunorange', 0.01, [B('top', 0.0, 0.015, 'solid', 'amber'), B('bottom', 0.0, 0.015, 'solid', 'brass')], fabric='beads.glass')
    for k_c, (dx1, dz1, dx2, dz2) in enumerate((
        (-0.044, 0.025, -0.095, 0.048),
        (-0.044, -0.020, -0.088, -0.068),
        (0.044, 0.025, 0.095, 0.048),
        (0.044, -0.020, 0.088, -0.068),
    )):
        p0 = chest_front(core.CHEST + 0.01 + dz1, 0.034, x=dx1)
        pm = chest_front(core.CHEST + 0.01 + 0.5 * (dz1 + dz2), 0.042, x=0.58 * (dx1 + dx2))
        p1 = chest_front(core.CHEST + 0.01 + dz2, 0.030, x=dx2)
        parts_t.append(tube(f'{gid_t}_rib_conduit_{k_c}', [p0, pm, p1], 0.010, conduit_p, n=8, rigid_joint='Spine2'))

    # Dorsal cyber-spine plate & twin rear orange conduits
    sp2_j = J('Spine2')
    sp1_j = J('Spine1')
    parts_t.append(rosette(gid_t + '_dorsal_node', sp2_j + bk * 0.145 + up * 0.02, bk, left, 0.056,
                           steel_p, n=14, thick=0.018, rigid_joint='Spine2'))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        dp0 = sp2_j + bk * 0.142 + left * (sgn * 0.035) - up * 0.01
        dpm = 0.5 * (sp2_j + sp1_j) + bk * 0.148 + left * (sgn * 0.072)
        dp1 = sp1_j + bk * 0.125 + left * (sgn * 0.105) - up * 0.02
        parts_t.append(tube(f'{gid_t}_back_conduit_{tag}', [dp0, dpm, dp1], 0.010, conduit_p, n=8, rigid_joint='Spine2'))

    # 2. Asymmetrical massive round verdigris-bronze shield-pauldron on the Right shoulder (span=0.26, drop=0.22) with concentric brass bosses
    parts_t.append(pauldron(gid_t + '_shield_pauldron_R', 'Right', kasa_p, span=0.26, drop=0.22, lift=0.036))
    sh_r = J('RightArm') - left * 0.068 - bk * 0.010 - up * 0.022
    parts_t.append(rosette(gid_t + '_shield_boss_outer_R', sh_r, -left * 0.92 - bk * 0.38, bk, 0.052,
                           P('verdigris', 0.02, [B('top', 0.0, 0.02, 'solid', 'brass'), B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='metal.bronze'),
                           n=16, thick=0.018, rigid_joint='RightArm'))
    parts_t.append(rosette(gid_t + '_shield_boss_inner_R', sh_r - left * 0.012, -left * 0.92 - bk * 0.38, bk, 0.028,
                           P('brass', 0.02, fabric='metal.gold'), n=14, thick=0.016, rigid_joint='RightArm'))

    # 3. Unified asymmetric Ronin lower skirt: segmented verdigris-bronze `kusazuri` on the right (u=0..0.48)
    #    and golden-ochre `sentinel_sun_cloak` drape on the left (u=0.48..1.0) so they never clip through each other.
    cloak_p = P('ochre', 0.05, [
        B('bottom', 0.0, 0.05, 'stripes', 'cream', 'ochre', 0.022),
        B('top', 0.0, 0.03, 'solid', 'saffron'),
    ], [
        PN(0.0, 1.0, 'sentinel_sun_cloak', 'cream', 'ochre', 0.36),
    ], fabric='cloth.wool')
    kusazuri_p = P('verdigris', 0.03, [
        B('bottom', 0.0, 0.045, 'stripes', 'cream', 'brass', 0.022),
        B('top', 0.0, 0.04, 'solid', 'brass'),
    ], [
        PN(0.0, 0.48, 'sentinel_kasa', 'brass', 'verdigris', 0.16),
        PN(0.48, 0.98, 'sentinel_sun_cloak', 'cream', 'ochre', 0.36),
        PN(0.46, 0.50, 'dentils', 'brass', 'verdigris', 0.04),
    ], fabric='metal.bronze')
    parts_t.append(skirt(gid_t + '_kusazuri', core.ANKLE + 0.12, core.WAIST + 0.01, kusazuri_p,
                         ease=0.032, flare=0.10, rows=20, n=48, jagged=0.03))

    belt_p = P('brass', 0.02, [
        B('top', 0.0, 0.015, 'solid', 'umber'),
        B('bottom', 0.0, 0.015, 'solid', 'umber'),
    ], [
        PN(0.0, 1.0, 'dentils', 'brass', 'umber', 0.04),
    ], fabric='metal.bronze')
    parts_t.append(belt_sash(gid_t + '_waist_belt', core.WAIST - 0.02, core.WAIST + 0.05, belt_p, ease=0.040))
    parts_t.append(rosette(gid_t + '_belt_clasp_F', chest_front(core.WAIST + 0.015, 0.048), np.array([0.0, -1.0, 0.0]), left, 0.042,
                           P('brass', 0.02, fabric='metal.gold'), n=14, thick=0.015, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_belt_clasp_B', spine_at(core.WAIST + 0.015) + bk * 0.158, bk, left, 0.038,
                           P('brass', 0.02, fabric='metal.gold'), n=14, thick=0.014, rigid_joint='Hips'))

    # 4. Draped golden-saffron / ochre cloak-mantle over the Left shoulder + diagonal chest sash pinned by a bronze medallion
    parts_t.append(pauldron(gid_t + '_cloak_shoulder_L', 'Left', cloak_p, span=0.24, drop=0.20, lift=0.034))
    parts_t.append(crossed_sash(gid_t + '_cloak_sash', cloak_p, width=0.068, ease=0.032, high=math.pi * 0.40))
    # Bronze medallion clasp pinning the cloak at the left clavicle
    med_pos = chest_front(core.SHOULDER - 0.01, 0.048, x=0.068)
    parts_t.append(rosette(gid_t + '_cloak_medallion', med_pos, np.array([0.0, -1.0, 0.0]), left, 0.040,
                           P('brass', 0.02, [B('top', 0.0, 0.015, 'solid', 'verdigris')], fabric='metal.gold'),
                           n=14, thick=0.015, rigid_joint='Spine2'))

    # 5. Exposed mechanical silver-steel & glowing-orange piston cybernetic forearms
    forearm_p = P('silver', 0.02, [
        B('bottom', 0.0, 0.04, 'solid', 'iron'),
        B('top', 0.0, 0.04, 'solid', 'iron'),
        B('bottom', 0.05, 0.16, 'vstripes', 'sunorange', 'silver', 0.026),
    ], fabric='metal.iron')
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        parts_t.append(sleeve(f'{gid_t}_bicep_conduit_{side}', side,
                              P('charcoal', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'silver')], [PN(0.0, 1.0, 'fluted', 'soot', 'charcoal', 0.05)], fabric='metal.iron'),
                              f0=0.04, f1=0.50, ease=0.014, flare=0.002, rows=9, n=20))
        parts_t.append(sleeve(f'{gid_t}_cyber_forearm_{side}', side, forearm_p,
                              f0=0.44, f1=0.90, ease=0.020, flare=0.004, rows=9, n=20))
        el_j, hd_j = J(side + 'ForeArm'), J(side + 'Hand')
        p_a = el_j + (hd_j - el_j) * 0.18 + left * (sgn * 0.038)
        p_b = el_j + (hd_j - el_j) * 0.78 + left * (sgn * 0.034)
        parts_t.append(tube(f'{gid_t}_forearm_piston_{side}', [p_a, p_b], 0.008, conduit_p, n=8, rigid_joint=side + 'ForeArm'))

    entries.append(assemble_garment(gid_t, "True Heir's Cyber-Ronin Sentinel Ribcage Chassis & Ochre Mantle", 'torso', 'eternian', parts_t))

    # --- GLOVES: eternian_m/f_heir_sentinel_cyberhands ---
    gid_g = f'eternian_{sex}_heir_sentinel_cyberhands'
    parts_g = []
    hand_p = P('silver', 0.02, [B('top', 0.0, 0.015, 'solid', 'iron'), B('bottom', 0.0, 0.015, 'solid', 'sunorange')], fabric='metal.iron')
    finger_p = P('silver', 0.02, [B('top', 0.0, 0.012, 'solid', 'sunorange'), B('bottom', 0.0, 0.008, 'solid', 'iron')], fabric='metal.iron')
    for side in ('Left', 'Right'):
        parts_g.extend(glove(gid_g, side, hand_p, cuff_paint=steel_p, finger_paint=finger_p, f0=0.72, ease=0.014))
    entries.append(assemble_garment(gid_g, "True Heir's Cyber-Ronin Sentinel Prosthetic Cyber-Hands", 'gloves', 'eternian', parts_g))

    # --- LEGS: eternian_m/f_heir_sentinel_cyberlegs ---
    gid_l = f'eternian_{sex}_heir_sentinel_cyberlegs'
    thigh_p = P('charcoal', 0.03, [
        B('bottom', 0.0, 0.06, 'solid', 'silver'),
        B('top', 0.0, 0.04, 'solid', 'iron'),
    ], [
        PN(0.0, 1.0, 'fluted', 'soot', 'charcoal', 0.06),
        PN(0.44, 0.56, 'vstripes', 'sunorange', 'silver', 0.03),
    ], fabric='metal.iron')
    parts_l = trousers(gid_l, thigh_p, ankle_f=0.75, ease=0.016, bag=0.004, rows=16, n=24)
    for s, sgn in (('Left', 1.0), ('Right', -1.0)):
        hip_j, knee_j = J(s + 'UpLeg'), J(s + 'Leg')
        c_top = hip_j + (knee_j - hip_j) * 0.45 - bk * 0.058 + left * (sgn * 0.018)
        c_bot = hip_j + (knee_j - hip_j) * 0.92 - bk * 0.056 + left * (sgn * 0.015)
        parts_l.append(tube(f'{gid_l}_thigh_tube_{s}', [c_top, c_bot], 0.009, conduit_p, n=8, rigid_joint=s + 'UpLeg'))
        parts_l.append(rosette(f'{gid_l}_knee_actuator_{s}', knee_j - bk * 0.062, -bk, left, 0.038,
                               steel_p, n=12, thick=0.018, rigid_joint=s + 'Leg'))
    entries.append(assemble_garment(gid_l, "True Heir's Cyber-Ronin Sentinel Hydraulic Cyber-Legs", 'legs', 'eternian', parts_l, legged=True))

    # --- FEET: eternian_m/f_heir_sentinel_cyberboots ---
    gid_f = f'eternian_{sex}_heir_sentinel_cyberboots'
    parts_f = []
    greave_p = P('silver', 0.02, [
        B('top', 0.0, 0.06, 'solid', 'iron'),
        B('bottom', 0.0, 0.08, 'lorica_lames', 'iron', 'silver', 0.035),
    ], [
        PN(0.20, 0.80, 'fluted', 'soot', 'silver', 0.08),
    ], fabric='metal.iron')
    sole_p = P('soot', 0.03, [B('top', 0.0, 0.015, 'dentils', 'silver', 'soot', 0.025)], fabric='metal.iron')
    collar_ring_p = P('silver', 0.02, [B('top', 0.0, 0.01, 'solid', 'brass'), B('bottom', 0.0, 0.01, 'solid', 'soot')], fabric='metal.iron')

    for s, sgn in (('Left', 1.0), ('Right', -1.0)):
        parts_f.extend(boot(f'{gid_f}_{s}', s, greave_p, top_f=0.05, ease=0.020, rows=16, n=24, cuff=0.016, sole_paint=sole_p))
        knee_j, foot_j = J(s + 'Leg'), J(s + 'Foot')
        # Glowing orange rear/outer calf hydraulic tube
        calf_a = foot_j + (knee_j - foot_j) * 0.82 + bk * 0.058 + left * (sgn * 0.015)
        calf_b = foot_j + (knee_j - foot_j) * 0.22 + bk * 0.048 + left * (sgn * 0.012)
        parts_f.append(tube(f'{gid_f}_calf_tube_{s}', [calf_a, calf_b], 0.010, conduit_p, n=8, rigid_joint=s + 'Leg'))
        # Triple ankle-collars
        for r_idx, frac_a in enumerate((0.12, 0.20, 0.28)):
            c_ank = foot_j + (knee_j - foot_j) * frac_a
            parts_f.append(bio.limb_tube(f'{gid_f}_collar_{s}_{r_idx}', c_ank, c_ank + up * 0.022, 0.025,
                                         collar_ring_p, n=18, rows=3))
    entries.append(assemble_garment(gid_f, "True Heir's Cyber-Ronin Sentinel Clawed Cyber-Greaves", 'feet', 'eternian', parts_f))
    return entries


# ===============================================================================================================
# 3. True Heir's Cyber-Mantis Blade-Stalker (`eternian_m/f_heir_stalker_*`)
# ===============================================================================================================
def _build_heir_stalker(sex, body_id):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    carapace_p = P('amber', 0.02, [
        B('bottom', 0.0, 0.03, 'solid', 'soot'),
        B('top', 0.0, 0.025, 'solid', 'sunorange'),
    ], [
        PN(0.0, 1.0, 'stalker_carapace', 'cybercyan', 'amber', 0.16),
    ], fabric='metal.bronze')

    scarf_p = P('maroon', 0.05, [
        B('bottom', 0.0, 0.03, 'solid', 'crimson'),
        B('top', 0.0, 0.03, 'solid', 'umber'),
    ], [
        PN(0.0, 1.0, 'stripes', 'crimson', 'maroon', 0.035),
    ], fabric='cloth.wool')

    # --- HEAD: eternian_m/f_heir_stalker_kasa ---
    gid_h = f'eternian_{sex}_heir_stalker_kasa'
    parts_h = []

    # 1. Angular silver-steel faceted battle-mask with glowing cyan multi-eye V-optics
    parts_h.append(sculpted_cranium(gid_h + '_casque', P('soot', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'silver')], fabric='metal.iron'),
                                    f_top=0.90, f_bot=-0.06, ease=0.008))
    mask_p = P('silver', 0.02, [
        B('top', 0.0, 0.025, 'solid', 'soot'),
        B('bottom', 0.0, 0.020, 'solid', 'soot'),
    ], [
        PN(0.0, 1.0, 'stalker_mask', 'cybercyan', 'silver', 0.22),
    ], fabric='metal.iron')
    parts_h.append(sculpted_faceplate(gid_h + '_battle_mask', mask_p, f_top=0.70, f_bot=-0.04, ease=0.014, jaw_narrow=0.42))

    # 2. Thick dark-crimson wrapped neck-scarf cowl around jaw, throat & nape
    parts_h.append(collar(gid_h + '_neck_scarf', scarf_p, h=0.095, flare=0.038, open_front=0.0, rows=8, n=32, ease_base=0.024))

    # 3. Upturned amber-orange armored war-hat (swept-back conical/curved jingasa)
    hat_p = P('amber', 0.02, [
        B('bottom', 0.0, 0.025, 'solid', 'soot'),
        B('top', 0.0, 0.030, 'solid', 'sunorange'),
    ], [
        PN(0.0, 1.0, 'rays', 'sunorange', 'amber', 0.06),
    ], fabric='metal.bronze')
    angs_j = np.linspace(0, 2 * math.pi, 44, endpoint=False)
    jingasa_rows = []
    # Top-to-bottom row ordering with upturned side wings & swept-back rear peak
    for s_r in np.linspace(0.0, 1.0, 9):
        r_cur = 0.012 + 0.245 * (s_r ** 0.88)
        f_center = 0.98 - 0.34 * s_r
        row_j = []
        for an in angs_j:
            ca, sa = math.cos(an), math.sin(an)  # ca=-1 at front (-bk), ca=+1 at back (+bk)
            # Upturned lateral wings (|sa| near 1) and swept-up rear tail (ca > 0), dipping over front brow (ca < 0)
            wing_lift = 0.055 * (s_r ** 1.4) * (sa ** 2)
            back_lift = 0.065 * (s_r ** 1.3) * max(0.0, ca)
            front_dip = -0.042 * (s_r ** 1.2) * max(0.0, -ca)
            rx_scale = 1.08 if abs(sa) > 0.3 else 1.0
            ry_scale = 1.15 if ca > 0 else 0.95
            c_pt = a + (b - a) * f_center + up * (wing_lift + back_lift + front_dip) + bk * (0.025 * s_r)
            row_j.append(c_pt + left * (sa * r_cur * rx_scale) + bk * (ca * r_cur * ry_scale))
        jingasa_rows.append(row_j)
    parts_h.append(Part(gid_h + '_jingasa', np.array(jingasa_rows), True, ['body'] * len(jingasa_rows), hat_p, rigid_joint='Head'))

    # 4. Twin black branched kuwagata horn-crests in front + twin striped black-and-white temple tassels
    kuwa_p = P('soot', 0.02, [B('top', 0.0, 0.02, 'solid', 'iron')], fabric='metal.iron')
    tassel_p = P('soot', 0.02, [B('top', 0.0, 0.16, 'stripes', 'white', 'soot', 0.018)], fabric='metal.iron')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        # Main curved kuwagata horn
        k_pts = [
            a + (b - a) * 0.64 + left * (sgn * 0.032) - bk * 0.165,
            a + (b - a) * 0.78 + left * (sgn * 0.082) - bk * 0.155,
            a + (b - a) * 0.98 + left * (sgn * 0.118) - bk * 0.135,
            a + (b - a) * 1.14 + left * (sgn * 0.105) - bk * 0.118,
        ]
        parts_h.append(horn(f'{gid_h}_kuwagata_{tag}', k_pts, 0.013, 0.005, kuwa_p, n=8, rows=7, rigid_joint='Head'))
        # Outer branch prong on each kuwagata horn
        b_pts = [
            a + (b - a) * 0.92 + left * (sgn * 0.108) - bk * 0.142,
            a + (b - a) * 1.02 + left * (sgn * 0.148) - bk * 0.128,
        ]
        parts_h.append(horn(f'{gid_h}_kuwagata_prong_{tag}', b_pts, 0.009, 0.004, kuwa_p, n=6, rows=4, rigid_joint='Head'))
        # Striped black-and-white temple tassel hanging alongside the mask
        t_top = a + (b - a) * 0.52 + left * (sgn * 0.086) - bk * 0.110
        t_bot = a + (b - a) * (-0.08) + left * (sgn * 0.092) - bk * 0.115
        parts_h.append(horn(f'{gid_h}_temple_tassel_{tag}', [t_top, t_bot], 0.010, 0.011, tassel_p, n=8, rows=7, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, "True Heir's Cyber-Mantis Stalker Kuwagata War-Hat & Battle-Mask", 'head', 'eternian', parts_h,
                                    covers_hair=True, covers_face=True))

    # --- TORSO: eternian_m/f_heir_stalker_armor ---
    gid_t = f'eternian_{sex}_heir_stalker_armor'
    parts_t = []

    # 1. Cross-wrapped dark crimson-brown & charcoal brigandine vest
    brig_p = P('crimson', 0.04, [
        B('top', 0.0, 0.05, 'solid', 'silver'),
        B('bottom', 0.0, 0.04, 'solid', 'soot'),
    ], [
        PN(0.0, 1.0, 'quilt', 'soot', 'crimson', 0.09),
        PN(0.36, 0.64, 'chevrons', 'maroon', 'soot', 0.12),
    ], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_brigandine', core.WAIST - 0.02, core.TOP + 0.01, brig_p,
                              ease=0.022, flare=0.01, rows=16, n=38))
    parts_t.append(collar(gid_t + '_cowl_base', scarf_p, h=0.075, flare=0.042, open_front=0.0, rows=6, n=32, ease_base=0.026))

    # Dorsal glowing cyan Y-node on upper back
    sp2_j = J('Spine2')
    parts_t.append(rosette(gid_t + '_back_cyan_node', sp2_j + bk * 0.138 + up * 0.04, bk, left, 0.032,
                           P('cybercyan', 0.01, [B('top', 0.0, 0.01, 'solid', 'soot')], fabric='beads.glass'),
                           n=12, thick=0.012, rigid_joint='Spine2'))

    # 2. Diagonal black leather chest bandolier with 4 tactical box-pouches
    band_p = P('soot', 0.03, [B('top', 0.0, 0.012, 'solid', 'silver'), B('bottom', 0.0, 0.012, 'solid', 'umber')], fabric='leather.polished')
    parts_t.append(crossed_sash(gid_t + '_bandolier_1', band_p, width=0.052, ease=0.030, high=math.pi * 0.42))
    parts_t.append(crossed_sash(gid_t + '_bandolier_2', band_p, width=0.046, ease=0.028, high=-math.pi * 0.42))
    pouch_p = P('soot', 0.03, [B('top', 0.0, 0.015, 'solid', 'silver'), B('bottom', 0.0, 0.015, 'solid', 'umber')], fabric='leather.polished')
    for k_p, (px, pz) in enumerate((
        (-0.072, 0.055),
        (-0.024, 0.022),
        (0.024, -0.012),
        (0.072, -0.045),
    )):
        p_pos = chest_front(core.CHEST + pz, 0.044, x=px)
        parts_t.append(blob(f'{gid_t}_chest_pouch_{k_p}', p_pos, (0.044, 0.028, 0.062), pouch_p,
                            n=10, rows=5, out=np.array([0.0, -1.0, 0.0]), rigid_joint='Spine2'))

    # 3. Segmented amber-orange insectoid/samurai shoulder & bicep plates with glowing cyan energy-vents
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        parts_t.append(sleeve(f'{gid_t}_undersleeve_{side}', side, P('charcoal', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'crimson')]),
                              f0=0.0, f1=0.72, ease=0.015, flare=0.004, rows=10, n=20))
        parts_t.append(pauldron(f'{gid_t}_mantis_pauldron_{side}', side, carapace_p, span=0.22, drop=0.20, lift=0.032))
        # High-peaked shoulder fin tip on each mantis pauldron
        sh_j = J(side + 'Arm')
        fin_pts = [
            sh_j + left * (sgn * 0.045) + up * 0.025,
            sh_j + left * (sgn * 0.065) + up * 0.085 - bk * 0.010,
        ]
        parts_t.append(horn(f'{gid_t}_shoulder_peak_{side}', fin_pts, 0.028, 0.006, carapace_p, n=8, rows=5, rigid_joint=side + 'Arm'))
        # Segmented bicep & forearm amber-orange carapace plates
        parts_t.append(sleeve(f'{gid_t}_bicep_plate_{side}', side, carapace_p, f0=0.08, f1=0.48, ease=0.024, flare=0.004, rows=8, n=20))
        parts_t.append(sleeve(f'{gid_t}_forearm_plate_{side}', side, carapace_p, f0=0.48, f1=0.74, ease=0.022, flare=0.002, rows=6, n=20))

    # 4. Double-belted waist with hanging crimson-and-black angular layered split coat-tassets & integrated center sash-tails
    tasset_coat_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.08, 'chevrons', 'amber', 'soot', 0.06),
        B('top', 0.0, 0.05, 'solid', 'soot'),
    ], [
        PN(0.08, 0.36, 'chevrons', 'charcoal', 'crimson', 0.14),
        PN(0.64, 0.92, 'chevrons', 'charcoal', 'crimson', 0.14),
        PN(0.36, 0.43, 'quilt', 'maroon', 'crimson', 0.12),
        PN(0.57, 0.64, 'quilt', 'maroon', 'crimson', 0.12),
        PN(0.43, 0.57, 'stripes', 'amber', 'crimson', 0.04),
        PN(0.0, 0.08, 'stripes', 'amber', 'crimson', 0.04),
        PN(0.92, 1.0, 'stripes', 'amber', 'crimson', 0.04),
    ], fabric='cloth.wool')
    parts_t.append(skirt(gid_t + '_split_tassets', core.ANKLE + 0.14, core.WAIST + 0.01, tasset_coat_p,
                         ease=0.032, flare=0.11, rows=18, n=44, jagged=0.08, layer=2))

    # Double leather waist belts + rear pouches + glowing cyan vials + trailing crimson side-ribbons
    parts_t.append(belt_sash(gid_t + '_double_belt', core.WAIST - 0.03, core.WAIST + 0.05,
                             P('soot', 0.03, [B('top', 0.0, 0.02, 'solid', 'silver'), B('bottom', 0.0, 0.02, 'solid', 'umber')], fabric='leather.polished'),
                             ease=0.038))
    # Glowing cyan tactical vials on right front belt
    for v_idx, vx in enumerate((-0.065, -0.045)):
        v_top = chest_front(core.WAIST + 0.02, 0.045, x=vx)
        parts_t.append(horn(f'{gid_t}_cyan_vial_{v_idx}', [v_top, v_top - up * 0.055], 0.008, 0.006,
                            P('cybercyan', 0.01, [B('top', 0.0, 0.015, 'solid', 'silver')], fabric='beads.glass'),
                            n=8, rows=4, rigid_joint='Hips'))
    # Long trailing crimson side-ribbons flaring from left and right hips
    ribbon_p = P('crimson', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'amber')], fabric='cloth.silk')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        r_top = spine_at(core.WAIST - 0.02) + left * (sgn * 0.155) - bk * 0.02
        r_out = left * (sgn * 0.92) - bk * 0.25
        parts_t.append(flap(f'{gid_t}_sideribbon_{tag}', r_top, 0.042, 0.52, r_out, ribbon_p,
                            cols=4, rows=10, ease=0.018, group_below=core.CROTCH + 0.02, sway=0.045))

    entries.append(assemble_garment(gid_t, "True Heir's Cyber-Mantis Stalker Carapace & Split Coat-Tassets", 'torso', 'eternian', parts_t))

    # --- GLOVES: eternian_m/f_heir_stalker_gauntlets ---
    gid_g = f'eternian_{sex}_heir_stalker_gauntlets'
    parts_g = []
    cuff_wrap_p = P('crimson', 0.04, [
        B('top', 0.0, 0.12, 'stripes', 'white', 'soot', 0.018),
        B('bottom', 0.0, 0.03, 'solid', 'crimson'),
    ], fabric='cloth.cotton.coarse')
    hand_cyan_p = P('silver', 0.02, [
        B('top', 0.0, 0.015, 'solid', 'soot'),
        B('bottom', 0.0, 0.025, 'vstripes', 'cybercyan', 'soot', 0.016),
    ], fabric='metal.iron')
    finger_st_p = P('soot', 0.02, [B('top', 0.0, 0.008, 'solid', 'silver'), B('bottom', 0.0, 0.008, 'solid', 'silver')], fabric='metal.iron')
    for side in ('Left', 'Right'):
        parts_g.extend(glove(gid_g, side, hand_cyan_p, cuff_paint=cuff_wrap_p, finger_paint=finger_st_p, f0=0.66, ease=0.015))
    entries.append(assemble_garment(gid_g, "True Heir's Cyber-Mantis Stalker Cord-Wrapped Cyber-Gauntlets", 'gloves', 'eternian', parts_g))

    # --- LEGS: eternian_m/f_heir_stalker_breeches ---
    gid_l = f'eternian_{sex}_heir_stalker_breeches'
    breeches_p = P('charcoal', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'crimson'),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'charcoal', 'soot', 0.12),
    ], fabric='cloth.quilted')
    parts_l = trousers(gid_l, breeches_p, ankle_f=0.80, ease=0.018, bag=0.018, rows=16, n=24)
    entries.append(assemble_garment(gid_l, "True Heir's Cyber-Mantis Stalker Quilted Tactical Breeches", 'legs', 'eternian', parts_l, legged=True))

    # --- FEET: eternian_m/f_heir_stalker_greaves ---
    gid_f = f'eternian_{sex}_heir_stalker_greaves'
    parts_f = []
    greave_st_p = P('amber', 0.02, [
        B('top', 0.0, 0.05, 'solid', 'soot'),
        B('bottom', 0.0, 0.14, 'stripes', 'soot', 'crimson', 0.025),
    ], [
        PN(0.18, 0.82, 'stalker_carapace', 'cybercyan', 'amber', 0.16),
    ], fabric='metal.bronze')
    tabi_sole_p = P('soot', 0.03, [B('top', 0.0, 0.015, 'solid', 'amber')], fabric='leather.polished')
    for s in ('Left', 'Right'):
        parts_f.extend(boot(f'{gid_f}_{s}', s, greave_st_p, top_f=0.06, ease=0.019, rows=16, n=24, cuff=0.015, sole_paint=tabi_sole_p))
        knee_j = J(s + 'Leg')
        parts_f.append(rosette(f'{gid_f}_kneecop_{s}', knee_j - bk * 0.068 + up * 0.015, -bk, left, 0.038,
                               carapace_p, n=12, thick=0.016, rigid_joint=s + 'Leg'))
    entries.append(assemble_garment(gid_f, "True Heir's Cyber-Mantis Stalker Cyan-Vented Greaves & Tabi-Boots", 'feet', 'eternian', parts_f))
    return entries


# ===============================================================================================================
# Task Runner & Manifest Output
# ===============================================================================================================
TASKS = [
    (_build_heir_juggernaut, 'm', 'mpfb_male'),
    (_build_heir_juggernaut, 'f', 'mpfb_female'),
    (_build_heir_sentinel, 'm', 'mpfb_male'),
    (_build_heir_sentinel, 'f', 'mpfb_female'),
    (_build_heir_stalker, 'm', 'mpfb_male'),
    (_build_heir_stalker, 'f', 'mpfb_female'),
]


def _run_task(task):
    fn, sex, body_id = task
    return fn(sex, body_id)


def main():
    t0 = time.perf_counter()
    workers = min(6, os.cpu_count() or 4)
    kit_entries = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as ex:
        for res in ex.map(_run_task, TASKS):
            kit_entries.extend(res)

    social_types = [
        {
            'id': 'heir_juggernaut',
            'type': 'important_npc',
            'name': "True Heir's Juggernaut-Praetorian (Sanctum Bodyguard)",
            'outfit': {
                'male': {
                    'head': 'eternian_m_heir_juggernaut_helm',
                    'torso': 'eternian_m_heir_juggernaut_cuirass',
                    'back': 'eternian_m_heir_juggernaut_reactor',
                    'gloves': 'eternian_m_heir_juggernaut_gauntlets',
                    'feet': 'eternian_m_heir_juggernaut_sabatons',
                },
                'female': {
                    'head': 'eternian_f_heir_juggernaut_helm',
                    'torso': 'eternian_f_heir_juggernaut_cuirass',
                    'back': 'eternian_f_heir_juggernaut_reactor',
                    'gloves': 'eternian_f_heir_juggernaut_gauntlets',
                    'feet': 'eternian_f_heir_juggernaut_sabatons',
                },
            },
        },
        {
            'id': 'heir_sentinel',
            'type': 'important_npc',
            'name': "True Heir's Cyber-Ronin Sentinel (Sanctum Bodyguard)",
            'outfit': {
                'male': {
                    'head': 'eternian_m_heir_sentinel_kasa',
                    'torso': 'eternian_m_heir_sentinel_chassis',
                    'gloves': 'eternian_m_heir_sentinel_cyberhands',
                    'legs': 'eternian_m_heir_sentinel_cyberlegs',
                    'feet': 'eternian_m_heir_sentinel_cyberboots',
                },
                'female': {
                    'head': 'eternian_f_heir_sentinel_kasa',
                    'torso': 'eternian_f_heir_sentinel_chassis',
                    'gloves': 'eternian_f_heir_sentinel_cyberhands',
                    'legs': 'eternian_f_heir_sentinel_cyberlegs',
                    'feet': 'eternian_f_heir_sentinel_cyberboots',
                },
            },
        },
        {
            'id': 'heir_stalker',
            'type': 'important_npc',
            'name': "True Heir's Cyber-Mantis Blade-Stalker (Sanctum Bodyguard)",
            'outfit': {
                'male': {
                    'head': 'eternian_m_heir_stalker_kasa',
                    'torso': 'eternian_m_heir_stalker_armor',
                    'gloves': 'eternian_m_heir_stalker_gauntlets',
                    'legs': 'eternian_m_heir_stalker_breeches',
                    'feet': 'eternian_m_heir_stalker_greaves',
                },
                'female': {
                    'head': 'eternian_f_heir_stalker_kasa',
                    'torso': 'eternian_f_heir_stalker_armor',
                    'gloves': 'eternian_f_heir_stalker_gauntlets',
                    'legs': 'eternian_f_heir_stalker_breeches',
                    'feet': 'eternian_f_heir_stalker_greaves',
                },
            },
        },
    ]

    manifest_path = SCRATCH / 'true_heir_bodyguards_manifest.json'
    manifest_data = {
        'culture': 'eternian',
        'kit_entries': kit_entries,
        'social_types': social_types,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    print(f'Successfully built {len(kit_entries)} True Heir Bodyguard pieces (male & female) in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
