"""The Main Iziz (`izani`) Cultural Wardrobe Kit — Imperial Core & Mercenaries.

Builds 14 canon-authentic Roman / Byzantine / Western science-fantasy Main Iziz tiers across BOTH
`mpfb_male` (`iziz_m_*`) and `mpfb_female` (`iziz_f_*`) bodies (168 pieces across `head`, `torso`,
`gloves`, `legs`, `feet`, and `back`, 100% M+F parity):

Imperial Core (`core`):
 1. `peasant`           — Imperial Commoner (*Plebeius*)
 2. `trade`             — Guild Artisan & Factor (*Artifex*)
 3. `aedile`            — Curule Aedile & Magistrate (*Aedilis Curulis*)
 4. `noble`             — Senatorial Patrician (*Patricius*)
 5. `flamen`            — Solar Flamen (*Flamen Solaris*)
 6. `heliarch`          — Temple-Hill Solar Heliarch (*Heliarchus*)
 7. `pontifex`          — Pontifex Maximus of the Sun (*Pontifex Solis*, important_npc)
 8. `skirmisher`        — Sun-Spear Skirmisher (*Velites*)
 9. `legionary`         — Imperial Legionary (*Miles Legionarius*)
10. `praetorian`        — Relic-Guard Praetorian (*Praetorianus*)
11. `forgemaster_pilot` — Forgemaster Walker Pilot (*Moderator*)
12. `pc_legatus`        — Imperial Solar Legatus (PC Hero, share 0.0)

Core Mercenaries (`mercenary`):
13. `watch`             — The Watch Auxilia (`MC-02` Copper-Sallet & Hex-Lamellar)
14. `crab_marine`       — Land-Crab Auxilia Marine (`MC-07` Chitin-Carapace Coastal Guard)

Run standalone to compile all `.glb` + `.morph.bin` pieces and emit `iziz_manifest.json`:
    python -u tools/garments/cultures/iziz.py
"""
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
        surface_out, chest_front, assemble_garment,
    )
    from ..paint import P, B, PN, C, COTTON, WOOL, leathery, sample_cultural_tex
    from ..types.torso import (
        torso_tube, collar, collar_disc, cape, tabard, crossed_sash, pauldron, neck_ring, stand_collar,
    )
    from ..types.armor import (
        cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
        hinged_tassets, sculpted_vambraces, sculpted_greaves,
    )
    from ..types.limbs import limb_tube, sleeve, sleeves, trousers, skirt, full_gloves, armbands
    from ..types.footwear import boots, sandal
    from ..types.headgear import (
        head_landmarks_exact, head_rings, sculpted_faceplate, sculpted_cranium,
        hood, brim, crown_band, crest, wing, horn, fan,
    )
    from ..types.accoutrements import (
        flap, blob, belt_sash, pouch_belt, sash_with_tail, pack_straps,
        tube, strap, rosette, tassel,
    )
else:
    from garments import core
    from garments import paint as paint_mod
    from garments.core import (
        Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
        surface_out, chest_front, assemble_garment,
    )
    from garments.paint import P, B, PN, C, COTTON, WOOL, leathery, sample_cultural_tex
    from garments.types.torso import (
        torso_tube, collar, collar_disc, cape, tabard, crossed_sash, pauldron, neck_ring, stand_collar,
    )
    from garments.types.armor import (
        cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
        hinged_tassets, sculpted_vambraces, sculpted_greaves,
    )
    from garments.types.limbs import limb_tube, sleeve, sleeves, trousers, skirt, full_gloves, armbands
    from garments.types.footwear import boots, sandal
    from garments.types.headgear import (
        head_landmarks_exact, head_rings, sculpted_faceplate, sculpted_cranium,
        hood, brim, crown_band, crest, wing, horn, fan,
    )
    from garments.types.accoutrements import (
        flap, blob, belt_sash, pouch_belt, sash_with_tail, pack_straps,
        tube, strap, rosette, tassel,
    )


# ===========================================================================================================
# TIER SHARES & LABELS (non-pc_ shares sum to exact 1.00)
# ===========================================================================================================
IZIZ_TIER_SHARES = [
    ['peasant', 0.22],
    ['trade', 0.13],
    ['aedile', 0.07],
    ['noble', 0.06],
    ['flamen', 0.05],
    ['heliarch', 0.05],
    ['pontifex', 0.03],
    ['skirmisher', 0.07],
    ['legionary', 0.11],
    ['praetorian', 0.05],
    ['forgemaster_pilot', 0.04],
    ['watch', 0.07],
    ['crab_marine', 0.05],
    ['pc_legatus', 0.0],
]

IZIZ_TIER_LABELS = {
    'peasant': 'Imperial Commoner (Plebeius)',
    'trade': 'Guild Artisan & Factor (Artifex)',
    'aedile': 'Curule Aedile & Magistrate (Toga Praetexta)',
    'noble': 'Senatorial Patrician (Paludamentum & Dalmatica)',
    'flamen': 'Solar Flamen (Albogalerus & Sun-Orb Dalmatica)',
    'heliarch': 'Temple-Hill Solar Heliarch (Radiate Corona & Planeta)',
    'pontifex': 'Pontifex Maximus of the Sun (Kamelaukion & Aureole)',
    'skirmisher': 'Sun-Spear Skirmisher (Velites Mirror-Harness)',
    'legionary': 'Imperial Legionary (Galea & Lorica Segmentata)',
    'praetorian': 'Relic-Guard Praetorian (Hex-Plate Cataphract)',
    'forgemaster_pilot': 'Forgemaster Walker Pilot (Moderator Casque & Aegis Pack)',
    'watch': 'Watch Auxilia (MC-02 Copper-Sallet & Hex-Lamellar)',
    'crab_marine': 'Land-Crab Auxilia Marine (MC-07 Chitin-Carapace Guard)',
    'pc_legatus': 'Imperial Solar Legatus (PC Hero)',
}


# ===========================================================================================================
# SCOPED CUSTOM IZIZ MOTIFS (zero permanent mutation of paint.motif; all prefixed iziz_*)
# ===========================================================================================================
IZIZ_CUSTOM_MOTIFS = {
    'iziz_sun_clavus',
    'iziz_lorica_lame',
    'iziz_hex_relic',
    'iziz_pteruges_strip',
    'iziz_mosaic_brocade',
    'iziz_chitin_scale',
}


def _iziz_custom_motif(style, w, h, fg, bg, aspect=1.0):
    ww = max(w, 1)
    hh = max(h, 1)
    img = np.empty((hh, ww, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:hh, 0:ww]
    u = (xx + 0.5) / ww
    v = (yy + 0.5) / hh

    if style == 'iziz_sun_clavus':
        # Roman-Byzantine Imperial clavus: verdigris meander guards flanking sun-orange register with gold 16-ray suns
        img[:] = bg
        guard = (v < 0.18) | (v > 0.82)
        inner = (v >= 0.22) & (v <= 0.78)
        img[guard] = C['verdigris']
        img[inner] = C['sunorange']
        # Crisp gold guard rails
        rail = ((v >= 0.16) & (v < 0.22)) | ((v > 0.78) & (v <= 0.84))
        img[rail] = fg
        # Repeating 16-ray Sun-Orb medallions along central register
        nx = max(2.0, round(3.0 * max(aspect, 0.4)))
        su = ((u * nx) % 1.0 - 0.5) * 2.0
        sv = ((v - 0.5) / 0.28)
        r = np.hypot(su, sv)
        th = np.arctan2(sv, su)
        rays = (r > 0.32) & (r < 0.78) & (((th / (2.0 * math.pi) * 16.0) % 1.0) < 0.46)
        disc = r <= 0.34
        img[inner & (rays | disc)] = fg
        img[inner & (r < 0.16)] = C['crimson']
        clav_tex = sample_cultural_tex('tex.iziz_clavus_sun_orb', ww, hh, fg, bg, pal_blend=0.22)
        img = 0.45 * img + 0.55 * clav_tex

    elif style == 'iziz_lorica_lame':
        # Overlapping horizontal steel/bronze lorica segmentata lames with brass rivets & bevel lines
        ny = max(4.0, round(5.5 / max(aspect, 0.4)))
        lv = (v * ny) % 1.0
        img[:] = bg
        # Subtle top highlight and dark lower bevel overlap shadow
        img[lv < 0.12] = np.clip(np.asarray(bg) * 1.15, 0.0, 1.0)
        img[lv > 0.86] = np.clip(np.asarray(bg) * 0.55, 0.0, 1.0)
        # Vertical brass hinge straps & flush rivet dots
        nx = max(3.0, round(4.0 * max(aspect, 0.4)))
        lu = (u * nx) % 1.0
        hinge = (np.abs(lu - 0.5) < 0.08) & (lv > 0.20) & (lv < 0.80)
        rivet = np.hypot((lu - 0.5) * 3.0, (lv - 0.5) * 2.0) < 0.18
        img[hinge] = fg
        img[rivet] = C['gold']

    elif style == 'iziz_hex_relic':
        # Ghost-white Ancient hexagonal ceramic armor matrix with bronze seams and turquoise capacitor nodes
        img[:] = C['ancient']
        nx = max(3.0, round(6.0 * max(aspect, 0.5)))
        ny = max(3.0, round(6.0 / max(aspect, 0.5)))
        gx = u * nx
        gy = v * ny
        row = np.floor(gy).astype(int)
        gx_off = (gx + 0.5 * (row % 2)) % 1.0 - 0.5
        gy_off = (gy % 1.0) - 0.5
        d_hex = np.maximum(np.abs(gx_off) * 1.15 + np.abs(gy_off) * 0.55, np.abs(gy_off) * 1.08)
        seam = d_hex > 0.43
        node = np.hypot(gx_off, gy_off) < 0.12
        img[seam] = fg
        img[node & ((row % 3) == 0)] = C['turq']

    elif style == 'iziz_pteruges_strip':
        # Vertical leather pteruges straps with double-stitched channels & embossed bronze stud bosses
        nx = max(6.0, round(10.0 * max(aspect, 0.5)))
        lu = (u * nx) % 1.0
        img[:] = bg
        gap = (lu < 0.09) | (lu > 0.91)
        stitch = ((lu >= 0.14) & (lu < 0.19)) | ((lu > 0.81) & (lu <= 0.86))
        img[gap] = C['soot']
        img[stitch] = fg
        ny = max(3.0, round(4.0 / max(aspect, 0.5)))
        lv = (v * ny) % 1.0
        stud = np.hypot((lu - 0.5) * 2.2, (lv - 0.5) * 2.2) < 0.24
        img[stud] = C['bronze']

    elif style == 'iziz_mosaic_brocade':
        # Imperial court silk brocade with diamond Sun-Orb lattice blended with Iziz court brocade texture
        img[:] = bg
        nx = max(2.0, round(3.5 * max(aspect, 0.4)))
        ny = max(2.0, round(3.5 / max(aspect, 0.4)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        d = np.abs(gu) + np.abs(gv)
        r = np.hypot(gu, gv)
        img[(d > 0.88) & (d < 1.05)] = fg
        img[r < 0.28] = C['sunorange']
        img[r < 0.14] = fg
        broc_tex = sample_cultural_tex('tex.iziz_brocade', ww, hh, fg, bg, pal_blend=0.25)
        img = 0.42 * img + 0.58 * broc_tex

    elif style == 'iziz_chitin_scale':
        # Overlapping Land-Crab chitin carapace scales edged in verdigris-brass
        img[:] = bg
        nx = max(4.0, round(7.0 * max(aspect, 0.5)))
        ny = max(4.0, round(7.0 / max(aspect, 0.5)))
        gy = v * ny
        row = np.floor(gy).astype(int)
        su = ((u * nx + 0.5 * (row % 2)) % 1.0 - 0.5) * 2.0
        sv = (gy % 1.0) * 1.1
        r = np.hypot(su * 0.85, sv)
        rim = (r > 0.78) & (r < 0.96)
        rib = (np.abs(su) < 0.10) & (r < 0.80)
        img[rim] = fg
        img[rib] = C['verdigris']

    return np.clip(img, 0.0, 1.0)


@contextmanager
def iziz_motif_scope():
    """Temporarily extend `paint.motif` with Iziz Roman-Imperial motifs during compilation."""
    orig_motif = paint_mod.motif

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        if style in IZIZ_CUSTOM_MOTIFS:
            return _iziz_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif


# ===========================================================================================================
# SHARED IZIZ PAINTS
# ===========================================================================================================
def _p_linen(base='cream', trim='sunorange', fabric='cloth.linen.sea'):
    return P(base, 0.04, [
        B('bottom', 0.0, 0.032, 'iziz_sun_clavus', 'gold', base),
        B('top', 0.0, 0.016, 'solid', trim),
    ], fabric=fabric)


def _p_clavus_robe(base='cream', accent='sunorange', fabric='cloth.silk'):
    return P(base, 0.04, [
        B('bottom', 0.0, 0.055, 'iziz_sun_clavus', 'gold', base),
        B('top', 0.0, 0.025, 'solid', accent),
    ], [
        PN(0.0, 1.0, 'iziz_mosaic_brocade', 'gold', base, 0.16),
    ], fabric=fabric)


def _p_lorica(base='steel', trim='bronze', fabric='metal.steel'):
    return P(base, 0.04, [
        B('top', 0.0, 0.022, 'solid', trim),
        B('bottom', 0.0, 0.026, 'solid', trim),
    ], [
        PN(0.0, 1.0, 'iziz_lorica_lame', trim, base, 0.18),
    ], fabric=fabric)


def _p_hex_relic(base='ancient', trim='bronze'):
    return P(base, 0.03, [
        B('top', 0.0, 0.022, 'solid', trim),
        B('bottom', 0.0, 0.024, 'solid', trim),
    ], [
        PN(0.0, 1.0, 'iziz_hex_relic', trim, base, 0.14),
    ], fabric='metal.chrome')


def _p_pteruges(base='crimson', trim='gold'):
    return leathery(P(base, 0.05, [
        B('bottom', 0.0, 0.025, 'solid', trim),
        B('top', 0.0, 0.016, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'iziz_pteruges_strip', trim, base, 0.16),
    ], fabric='leather.pteruges.studded'))


def _p_watch_lamellar():
    return P('copper', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'ancient'),
        B('bottom', 0.0, 0.022, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'iziz_lamellar_watch', 'ancient', 'copper', 0.20),
    ], fabric='metal.bronze')


def _p_chitin_armor():
    return P('terracotta', 0.05, [
        B('top', 0.0, 0.020, 'solid', 'verdigris'),
        B('bottom', 0.0, 0.024, 'solid', 'bronze'),
    ], [
        PN(0.0, 1.0, 'iziz_chitin_scale', 'bronze', 'terracotta', 0.18),
    ], fabric='metal.bronze')


def _p_bronze(base='bronze', fabric='metal.bronze'):
    return P(base, 0.03, fabric=fabric)


def _p_gold(base='gold'):
    return P(base, 0.02, fabric='metal.gold')


def _p_leather(base='saddle', trim='bronze'):
    return leathery(P(base, 0.05, [
        B('bottom', 0.0, 0.016, 'solid', trim),
    ], fabric='leather.cuir_bouilli'))


def _p_paludamentum(base='sunorange', trim='gold'):
    return P(base, 0.04, [
        B('bottom', 0.0, 0.050, 'iziz_sun_clavus', trim, base),
        B('top', 0.0, 0.018, 'solid', trim),
    ], fabric='cloth.silk')


# ===========================================================================================================
# SHARED ROMAN / IZANI 3D GEOMETRY PRIMITIVES
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
    """Find the vertex on a closed ring closest to `dir_vec` in XY and its outward unit vector."""
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


def _iziz_circlet(gid, band_paint, gem_paint, n_rays=0, ray_len=0.055, leaves=False):
    """Snug 360-degree bare-head Roman laurel wreath / diadem / radiate corona (`ease=0.004`, <12 mm)."""
    band = head_rings(f'{gid}_band', 0.60, 0.70, 0.004, band_paint, n=36, rows=5)
    parts = [band]
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    ring_mid = band.P[len(band.P) // 2]
    ring_top = band.P[-1]

    # Central Solar brow medallion seated flush on band
    p_f, out_f = _ring_pt_along(ring_mid, fwd)
    side_f = np.cross(up, out_f)
    side_f /= max(np.linalg.norm(side_f), 1e-6)
    parts.append(rosette(
        f'{gid}_brow_orb', p_f + out_f * 0.002, out_f, side_f,
        radius=0.014, paint=gem_paint, n=12, thick=0.007, rigid_joint='Head',
    ))

    if leaves:
        # Sculpted laurel leaf clusters along temple arcs, rooted directly on band vertices
        for ang_deg in (-75, -50, -25, 25, 50, 75):
            ang = math.radians(ang_deg)
            d_dir = fwd * math.cos(ang) + rgt * math.sin(ang)
            p_b, out_b = _ring_pt_along(ring_mid, d_dir)
            s_v = np.cross(up, out_b)
            s_v /= max(np.linalg.norm(s_v), 1e-6)
            parts.append(rosette(
                f'{gid}_leaf_{ang_deg}', p_b + out_b * 0.002 + up * 0.004,
                out_b, s_v, radius=0.011, paint=band_paint, n=8, thick=0.004, rigid_joint='Head',
            ))

    if n_rays > 0:
        # Radiate Sol Invictus spikes rooted flush into the top ring of the band
        for i in range(n_rays):
            ang = -0.58 * math.pi + (1.16 * math.pi) * (i / max(n_rays - 1, 1))
            d_dir = fwd * math.cos(ang) + rgt * math.sin(ang)
            p_t, out_t = _ring_pt_along(ring_top, d_dir)
            # Crown center-front rays taller than temple rays
            h_scale = 1.0 - 0.30 * abs(ang) / (0.58 * math.pi)
            r_dir = out_t * 0.42 + up * 0.90
            r_dir /= max(np.linalg.norm(r_dir), 1e-6)
            p0 = p_t - up * 0.005
            p1 = p_t + r_dir * (0.52 * ray_len * h_scale)
            p2 = p_t + r_dir * (ray_len * h_scale)
            parts.append(horn(
                f'{gid}_ray_{i}', [p0, p1, p2], 0.0065, 0.0012,
                band_paint, n=8, rows=5, rigid_joint='Head',
            ))
    return parts


def _iziz_galea(gid, bowl_paint, trim_paint, crest_paint=None, transverse=False,
                visor_paint=None, cheek_guards=True, neck_guard=True, brow_f=0.58):
    """Roman Imperial Gallic / Praetorian *galea* helmet with sculpted dome, curved neck-flange, cheek-guards & crest."""
    # Ensure metallic PBR on bowl and trim
    bp_m = dict(bowl_paint)
    if not (bp_m.get('fabric') or '').startswith('metal.'):
        bp_m['fabric'] = 'metal.steel'
    tp_m = dict(trim_paint)
    if not (tp_m.get('fabric') or '').startswith('metal.'):
        tp_m['fabric'] = 'metal.bronze'

    bowl = head_rings(f'{gid}_bowl', brow_f, 1.12, 0.017, bp_m, n=36, rows=12, apex=True)
    # Embossed Roman brow-peak ridge curving slightly forward over the forehead
    brow_rib = crown_band(f'{gid}_brow_rib', tp_m, brow_f, brow_f + 0.07, ease=0.021, flare=0.006, rows=4, n=36)
    parts = [bowl, brow_rib]
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()

    if visor_paint is not None:
        vp_m = dict(visor_paint)
        if not (vp_m.get('fabric') or '').startswith('metal.'):
            vp_m['fabric'] = 'metal.bronze'
        fp = sculpted_faceplate(
            f'{gid}_visor', vp_m, f_top=brow_f + 0.04, f_bot=0.04,
            ease=0.016, span=0.46, rows=12, cols=19,
            brow_relief=0.012, nose_relief=0.018, cheek_relief=0.008, chin_relief=0.009,
        )
        parts.append(fp)
        Q = fp.P
        p_slit = P('soot', 0.02)
        for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
            e_pts = [Q[5, int(round((0.5 + 0.5 * sgn * u) * (Q.shape[1] - 1)))] + fwd * 0.0050 for u in (0.18, 0.36, 0.54)]
            parts.append(tube(f'{gid}_eyeslit_{tag}', e_pts, 0.0046, p_slit, n=6, rigid_joint='Head'))
        n_pts = [Q[r_i, Q.shape[1] // 2] + fwd * 0.0050 for r_i in (3, 5, 7)]
        parts.append(tube(f'{gid}_nasal', n_pts, 0.0048, tp_m, n=6, rigid_joint='Head'))
    elif cheek_guards:
        # Curved anatomical Roman bucculae cheek-plates wrapping smoothly from temple down along jawline
        bowl_bot = bowl.P[0]
        C_n = bowl_bot.shape[0]
        angs = np.linspace(0.0, 2.0 * math.pi, C_n, endpoint=False)
        for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
            # Pick lateral-forward temple arc along bowl bottom
            a_center = (0.64 * math.pi) if sgn < 0 else (1.36 * math.pi)
            d_ang = np.abs(((angs - a_center + math.pi) % (2.0 * math.pi)) - math.pi)
            cols = np.nonzero(d_ang <= 0.22 * math.pi)[0]
            if len(cols) >= 3:
                # Sort along arc
                order = np.argsort(((angs[cols] - a_center + math.pi) % (2.0 * math.pi)) - math.pi)
                cols = cols[order]
                base_arc = bowl_bot[cols].copy()
                Q_ch = np.zeros((5, len(cols), 3), dtype=np.float64)
                for ri, frac in enumerate((0.0, 0.25, 0.55, 0.82, 1.0)):
                    taper_in = 0.012 * (frac ** 1.4)
                    fwd_shift = 0.018 * (frac ** 1.2)
                    drop_z = 0.088 * frac
                    for j_i in range(len(cols)):
                        u_edge = math.sin((j_i / float(max(len(cols) - 1, 1))) * math.pi)
                        Q_ch[ri, j_i] = (
                            base_arc[j_i]
                            - up * (drop_z * (0.72 + 0.28 * u_edge))
                            + fwd * fwd_shift
                            - rgt * (sgn * taper_in)
                        )
                parts.append(Part(f'{gid}_cheek_{tag}', Q_ch, False, ['body'] * 5, tp_m, rigid_joint='Head'))

    if neck_guard:
        # Curved Roman Imperial Gallic rear neck-flange wrapping smoothly around the occiput/nape (no sticking-out cylinder!)
        bowl_bot = bowl.P[0]
        C_n = bowl_bot.shape[0]
        angs = np.linspace(0.0, 2.0 * math.pi, C_n, endpoint=False)
        # Rear arc centered at an=0 (+Y back of skull): [-0.36*pi, +0.36*pi]
        d_bk = ((angs + math.pi) % (2.0 * math.pi)) - math.pi
        cols_bk = np.nonzero(np.abs(d_bk) <= 0.36 * math.pi)[0]
        if len(cols_bk) >= 5:
            order = np.argsort(d_bk[cols_bk])
            cols_bk = cols_bk[order]
            base_bk = bowl_bot[cols_bk].copy()
            Q_ng = np.zeros((5, len(cols_bk), 3), dtype=np.float64)
            c_xy = np.array([hc[0], hc[1], 0.0])
            for ri, frac in enumerate((0.0, 0.25, 0.55, 0.82, 1.0)):
                # Gently step down along nape and flare smoothly outward like a real Imperial Gallic lobster-tail flange
                drop_z = 0.068 * frac
                flare_out = 0.026 * (frac ** 1.6) + (0.004 if ri == 4 else 0.0)
                for j_i in range(len(cols_bk)):
                    u_mid = math.sin((j_i / float(max(len(cols_bk) - 1, 1))) * math.pi)
                    p0 = base_bk[j_i]
                    rad_v = np.array([p0[0] - c_xy[0], p0[1] - c_xy[1], 0.0])
                    rad_v /= max(float(np.linalg.norm(rad_v)), 1e-6)
                    Q_ng[ri, j_i] = p0 - up * (drop_z * (0.65 + 0.35 * u_mid)) + rad_v * (flare_out * (0.55 + 0.45 * u_mid))
            parts.append(Part(f'{gid}_neckguard', Q_ng, False, ['body'] * 5, bp_m, rigid_joint='Head'))

    if crest_paint is not None:
        if transverse:
            crown_p = b + up * 0.024
            parts.append(blob(
                f'{gid}_crest_box', crown_p, (0.042, 0.022, 0.018), tp_m, rigid_joint='Head',
            ))
            parts.append(fan(
                f'{gid}_tcrest', r0=0.010, r1=0.095, spread=2.35, paint=crest_paint,
                rows=8, cols=18, tilt=0.05, back=0.0, curl=0.08, stiff=True,
                center=crown_p + up * 0.008, up_vec=up, side_vec=rgt, rigid_joint='Head',
            ))
        else:
            parts.append(crest(
                f'{gid}_crest', height=0.072, paint=crest_paint,
                rows=8, cols=16, sweep=0.05, a0=-0.52, a1=0.82,
                base_ease=0.016, thick=0.014, host_part=bowl,
            ))
    return parts


def _solar_pectoral_boss(gid, paint_boss, paint_rim, radius=0.055, clearance=0.016):
    """Flush-seated embossed Roman Solar-Mirror pectoral medallion on upper chest."""
    z_c = core.CHEST - 0.015
    o = spine_at(z_c)
    d = first_hit(o, FRONT, 0.35)
    p = o + FRONT * (d + clearance)
    side = np.array([1.0, 0.0, 0.0], dtype=np.float64)
    return [
        rosette(f'{gid}_boss_rim', p, FRONT, side, radius=radius, paint=paint_rim, n=16, thick=0.010, rigid_joint='Spine2'),
        rosette(f'{gid}_boss_core', p + FRONT * 0.005, FRONT, side, radius=radius * 0.62, paint=paint_boss, n=12, thick=0.010, rigid_joint='Spine2'),
    ]


def _dorsal_anchor(z_rel=0.58):
    """Return `(p_back, back_dir, right_dir, up_dir)` on the upper/mid back surface."""
    z = core.WAIST + z_rel * (core.SHOULDER - core.WAIST)
    o = spine_at(z)
    bk = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    d = first_hit(o, bk, 0.35)
    p = o + bk * (d + 0.016)
    rgt = np.array([-1.0, 0.0, 0.0], dtype=np.float64)
    up = np.array([0.0, 0.0, 1.0], dtype=np.float64)
    return p, bk, rgt, up


def _iziz_bracers(gid, paint_main, paint_trim=None, length_f=0.55):
    """Paired forearm vambraces / cuffs seated cleanly on both forearms."""
    parts = []
    for side in (L, R):
        tag = 'L' if side == L else 'R'
        e_j = J(f'{side}ForeArm')
        w_j = J(f'{side}Hand')
        a = e_j + (1.0 - length_f) * (w_j - e_j)
        b = w_j - 0.04 * (w_j - e_j)
        parts.append(limb_tube(
            f'{gid}_bracer_{tag}', a, b, 0.013, paint_main, n=18, rows=7, ease_end=0.012, side=side,
        ))
        if paint_trim is not None:
            parts.append(limb_tube(
                f'{gid}_trim_{tag}', a, a + 0.18 * (b - a), 0.016, paint_trim, n=18, rows=3, ease_end=0.016, side=side,
            ))
    return parts


def _iziz_pteruges_kilt(gid, kilt_paint, under_paint=None, z_bot=None):
    """Roman military *pteruges* kilt starting at `WAIST - 0.025` (overlapping subarmalis) with optional under-breeches."""
    if z_bot is None:
        z_bot = core.KNEE + 0.055
    z_top = core.WAIST - 0.025
    parts = []
    if under_paint is not None:
        parts.extend(trousers(f'{gid}_sub', under_paint, ease=0.014, bag=0.008, ankle_f=0.58))
    parts.append(torso_tube(
        f'{gid}_pteruges', z_bot, z_top, 0.024, kilt_paint,
        n=40, rows=12, hang_from=z_top, flare=0.058,
    ))
    return parts


def _iziz_dorsal_pack(gid, pack_paint, trim_paint, strap_paint, size=(0.11, 0.055, 0.13),
                      bedroll_paint=None, canisters=False):
    """Seated dorsal pack with flush dorsal harness pad and optional top bedroll or twin cooling coils."""
    p_bk, bk, rgt, up = _dorsal_anchor(0.56)
    parts = [blob(f'{gid}_pad', p_bk + bk * 0.010, (0.088, 0.022, 0.14), strap_paint, n=12, rows=5, rigid_joint='Spine2')]
    c_pack = p_bk + bk * (size[1] * 0.58)
    parts.append(blob(f'{gid}_body', c_pack, size, pack_paint, n=18, rows=10, rigid_joint='Spine2'))
    # Bronze frame strap bands wrapping pack
    parts.append(blob(
        f'{gid}_band', c_pack + bk * 0.004, (size[0] * 1.03, size[1] * 0.92, size[2] * 0.22),
        trim_paint, n=16, rows=5, rigid_joint='Spine2',
    ))
    if bedroll_paint is not None:
        top_c = c_pack + up * (size[2] * 0.92)
        p_l = top_c - rgt * (size[0] * 1.12)
        p_r = top_c + rgt * (size[0] * 1.12)
        parts.append(tube(f'{gid}_roll', [p_l, top_c, p_r], 0.036, bedroll_paint, n=14, rigid_joint='Spine2'))
    if canisters:
        for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
            cc = c_pack + rgt * (sgn * size[0] * 0.82) + bk * 0.012
            parts.append(tube(
                f'{gid}_coil_{tag}',
                [cc - up * (size[2] * 0.75), cc, cc + up * (size[2] * 0.75)],
                0.024, trim_paint, n=12, rigid_joint='Spine2',
            ))
    return parts


# ===========================================================================================================
# TIER BUILDERS (ALL 14 MAIN IZIZ TIERS, M+F PARITY)
# ===========================================================================================================
def _build_peasant(sex):
    entries = []
    cul = 'izani'
    p_hood = P('oat', 0.05, [B('bottom', 0.0, 0.020, 'solid', 'earth')], fabric=COTTON)
    p_tunic = _p_linen('oat', 'earth', fabric=COTTON)
    p_trousers = P('earth', 0.05, fabric=COTTON)
    p_leather = _p_leather('saddle', 'bronze')
    p_reed = P('sand', 0.06, [B('top', 0.0, 0.022, 'solid', 'earth')], fabric='straw.reed.plaited')

    # 1. HEAD: Peasant linen cucullus hood
    gid = f'iziz_{sex}_peasant_hood'
    entries.append(assemble_garment(
        gid, 'Izani Commoner Linen Cucullus Hood', 'head', cul,
        [hood(gid, p_hood, ease=0.014, open_front=True)], covers_hair=True,
    ))

    # 2. TORSO: Belted knee-length coarse linen tunica
    gid = f'iziz_{sex}_peasant_tunic'
    parts_t = [
        torso_tube(f'{gid}_body', core.CROTCH - 0.05, core.SHOULDER + 0.01, 0.020, p_tunic,
                   n=36, rows=16, hang_from=core.WAIST, flare=0.058),
        sleeves(gid, 'elbow', ease=0.022, paint=p_tunic),
        pouch_belt(gid, p_leather, _p_leather('leather', 'bronze'), ease=0.026),
    ]
    entries.append(assemble_garment(gid, 'Izani Commoner Belted Linen Tunica', 'torso', cul, parts_t))

    # 3. GLOVES: Hemp & leather work-wraps
    gid = f'iziz_{sex}_peasant_cuffs'
    entries.append(assemble_garment(
        gid, 'Izani Commoner Hemp & Leather Work-Wraps', 'gloves', cul,
        _iziz_bracers(gid, p_leather, p_hood, length_f=0.45),
    ))

    # 4. LEGS: Tailored oat-earth linen braccae
    gid = f'iziz_{sex}_peasant_trousers'
    entries.append(assemble_garment(
        gid, 'Izani Commoner Linen Braccae', 'legs', cul,
        trousers(gid, p_trousers, ease=0.014, bag=0.008), legged=True,
    ))

    # 5. FEET: Leather-strapped work sandals
    gid = f'iziz_{sex}_peasant_wraps'
    entries.append(assemble_garment(
        gid, 'Izani Commoner Strapped Work Sandals', 'feet', cul,
        sandal(gid, p_leather, _p_leather('hide', 'earth'), laces=True),
    ))

    # 6. BACK: Plaited reed market burden-basket
    gid = f'iziz_{sex}_peasant_basket'
    entries.append(assemble_garment(
        gid, 'Izani Commoner Reed Market Burden-Basket', 'back', cul,
        _iziz_dorsal_pack(gid, p_reed, p_leather, p_leather, size=(0.12, 0.068, 0.14)),
    ))
    return entries


def _build_trade(sex):
    entries = []
    cul = 'izani'
    p_cap = _p_leather('saddle', 'verdigris')
    p_coat = P('verdigris', 0.04, [
        B('bottom', 0.0, 0.040, 'iziz_sun_clavus', 'gold', 'verdigris'),
        B('top', 0.0, 0.018, 'solid', 'sunorange'),
    ], fabric=WOOL)
    p_trous = P('slate', 0.04, fabric=WOOL)
    p_boot = _p_leather('leather', 'bronze')
    p_brass = _p_bronze('brass')

    # 1. HEAD: Leather guild cap with brass flip-loupe lens
    gid = f'iziz_{sex}_trade_cap'
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    cap_bowl = head_rings(f'{gid}_bowl', 0.59, 1.01, 0.010, p_cap, n=36, rows=10, apex=True)
    p_f, out_f = _ring_pt_along(cap_bowl.P[0], fwd * 0.92 + rgt * 0.38)
    s_f = np.cross(up, out_f)
    s_f /= max(np.linalg.norm(s_f), 1e-6)
    parts_h = [
        cap_bowl,
        crown_band(f'{gid}_trim', p_brass, 0.59, 0.65, ease=0.013, rows=3, n=36),
        rosette(f'{gid}_loupe', p_f + out_f * 0.005, out_f, s_f, radius=0.015, paint=p_brass, n=12, thick=0.008, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(gid, 'Izani Guild Cap & Brass Flip-Loupe', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Verdigris wool guild coat with clavus trim & long sleeves
    gid = f'iziz_{sex}_trade_coat'
    parts_t = [
        torso_tube(f'{gid}_body', core.CROTCH - 0.06, core.SHOULDER + 0.01, 0.022, p_coat,
                   n=36, rows=16, hang_from=core.WAIST, flare=0.058),
        sleeves(gid, 'wrist', ease=0.023, paint=p_coat),
        stand_collar(gid, p_coat, high=0.040),
        pouch_belt(gid, p_boot, p_cap, ease=0.028),
    ]
    entries.append(assemble_garment(gid, 'Izani Guild Verdigris Wool Tunica-Coat', 'torso', cul, parts_t))

    # 3. GLOVES: Leather artisan cuff-bracers
    gid = f'iziz_{sex}_trade_cuffs'
    entries.append(assemble_garment(
        gid, 'Izani Guild Leather Cuff-Bracers', 'gloves', cul,
        _iziz_bracers(gid, p_boot, p_brass, length_f=0.48),
    ))

    # 4. LEGS: Tailored slate wool braccae
    gid = f'iziz_{sex}_trade_trousers'
    entries.append(assemble_garment(
        gid, 'Izani Guild Slate Wool Braccae', 'legs', cul,
        trousers(gid, p_trous, ease=0.014, bag=0.008), legged=True,
    ))

    # 5. FEET: Oiled leather merchant calcei boots
    gid = f'iziz_{sex}_trade_boots'
    entries.append(assemble_garment(
        gid, 'Izani Guild Oiled Leather Calcei Boots', 'feet', cul,
        boots(gid, _p_leather('umber', 'bronze'), p_boot, top=0.58, cuff_paint=p_brass, ease_top=0.007),
    ))

    # 6. BACK: Blueprint scroll-tube & surveyor satchel
    gid = f'iziz_{sex}_trade_satchel'
    entries.append(assemble_garment(
        gid, 'Izani Guild Blueprint Tube & Surveyor Satchel', 'back', cul,
        _iziz_dorsal_pack(gid, p_boot, p_brass, p_boot, size=(0.11, 0.052, 0.12), bedroll_paint=p_cap),
    ))
    return entries


def _build_aedile(sex):
    entries = []
    cul = 'izani'
    p_gold = _p_gold()
    p_amber = P('amber', 0.02, fabric='glass.moonglass.leaded')
    p_toga = _p_clavus_robe('cream', 'sunorange', fabric='cloth.linen.sea')
    p_sash = _p_paludamentum('sunorange', 'gold')
    p_crimson = _p_leather('crimson', 'gold')
    p_ivory = P('cream', 0.03, fabric='cloth.linen.sea')

    # 1. HEAD: Gilded laurel circlet + amber magistrate spectacles
    gid = f'iziz_{sex}_aedile_wreath'
    parts_h = _iziz_circlet(gid, p_gold, _p_paludamentum('crimson', 'gold'), leaves=True)
    # Amber-lensed spectacles anchored to nose bridge / brow
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    fwd = -bk
    rgt = -left
    z_eye = float(a[2]) + f_eyes * (float(b[2]) - float(a[2]))
    hc_eye = a + up * (z_eye - float(a[2]))
    d_nose = first_hit(hc_eye, fwd, 0.25)
    p_bridge = hc_eye + fwd * (d_nose + 0.014)
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        p_lens = p_bridge + rgt * (sgn * x_eye * 0.92) - fwd * 0.004
        parts_h.append(rosette(f'{gid}_rim_{tag}', p_lens, fwd, rgt, radius=0.015, paint=p_gold, n=12, thick=0.004, rigid_joint='Head'))
        parts_h.append(rosette(f'{gid}_lens_{tag}', p_lens + fwd * 0.002, fwd, rgt, radius=0.012, paint=p_amber, n=12, thick=0.003, rigid_joint='Head'))
    # Bridge bar & temple arms connecting spectacles back to circlet band
    ring_mid = parts_h[0].P[len(parts_h[0].P) // 2]
    parts_h.append(tube(f'{gid}_bridge', [p_bridge - rgt * 0.016, p_bridge, p_bridge + rgt * 0.016], 0.0025, p_gold, n=8, rigid_joint='Head'))
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        p_t, _ = _ring_pt_along(ring_mid, rgt * (sgn * 0.92) + fwd * 0.35)
        p_outer = p_bridge + rgt * (sgn * (x_eye * 0.92 + 0.013)) - fwd * 0.004
        parts_h.append(tube(f'{gid}_arm_{tag}', [p_outer, 0.5 * (p_outer + p_t) + up * 0.004, p_t], 0.0022, p_gold, n=8, rigid_joint='Head'))
    entries.append(assemble_garment(gid, 'Curule Aedile Laurel Wreath & Amber Spectacles', 'head', cul, parts_h))

    # 2. TORSO: Cream tunica laticlavia & sun-orange/crimson toga praetexta sash
    gid = f'iziz_{sex}_aedile_toga'
    parts_t = [
        torso_tube(f'{gid}_tunica', core.KNEE + 0.02, core.SHOULDER + 0.01, 0.024, p_toga,
                   n=40, rows=20, hang_from=core.WAIST, flare=0.060),
        sleeves(gid, 'wrist', ease=0.023, paint=p_toga),
        crossed_sash(f'{gid}_praetexta', p_sash, width=0.11, ease=0.032),
        belt_sash(f'{gid}_belt', core.WAIST - 0.035, core.WAIST + 0.035, p_sash, ease=0.030),
    ]
    parts_t.extend(_solar_pectoral_boss(gid, p_gold, p_sash, radius=0.036))
    entries.append(assemble_garment(gid, 'Curule Aedile Tunica Laticlavia & Toga Praetexta', 'torso', cul, parts_t))

    # 3. GLOVES: Linen magistrate cuffs & gold signet bands
    gid = f'iziz_{sex}_aedile_rings'
    entries.append(assemble_garment(
        gid, 'Curule Aedile Linen Cuffs & Gold Signet Bands', 'gloves', cul,
        _iziz_bracers(gid, p_ivory, p_gold, length_f=0.40),
    ))

    # 4. LEGS: Tailored ivory ceremonial braccae
    gid = f'iziz_{sex}_aedile_trousers'
    entries.append(assemble_garment(
        gid, 'Curule Aedile Ivory Ceremonial Braccae', 'legs', cul,
        trousers(gid, p_ivory, ease=0.014, bag=0.008), legged=True,
    ))

    # 5. FEET: Crimson calcei patricii laced senatorial boots
    gid = f'iziz_{sex}_aedile_calcei'
    entries.append(assemble_garment(
        gid, 'Curule Aedile Crimson Calcei Patricii', 'feet', cul,
        boots(gid, _p_leather('umber', 'gold'), p_crimson, top=0.38, wraps=3, wrap_paint=p_gold, ease_top=0.007),
    ))

    # 6. BACK: Draped sun-orange & crimson toga praetexta back-mantle
    gid = f'iziz_{sex}_aedile_drape'
    entries.append(assemble_garment(
        gid, 'Curule Aedile Sun-Orange Toga Praetexta Drape', 'back', cul,
        [cape(f'{gid}_cape', core.KNEE + 0.04, p_sash, span=1.55, ease=0.024, flare=0.065)],
    ))
    return entries


def _build_noble(sex):
    entries = []
    cul = 'izani'
    p_gold = _p_gold()
    p_brocade = _p_clavus_robe('crimson', 'gold', fabric='cloth.silk')
    p_cream = _p_clavus_robe('cream', 'crimson', fabric='cloth.silk')
    p_mantle = _p_paludamentum('sunorange', 'gold')
    p_boot = _p_leather('crimson', 'gold')

    # 1. HEAD: Senatorial patrician crown-diadem
    gid = f'iziz_{sex}_noble_crown'
    entries.append(assemble_garment(
        gid, 'Izani Patrician Gilded Sun-Diadem', 'head', cul,
        _iziz_circlet(gid, p_gold, p_mantle, n_rays=5, ray_len=0.038),
    ))

    # 2. TORSO: Preserve canonical IDs `iziz_m_noble_robe` / `iziz_f_noble_gown`
    gid = f'iziz_{sex}_noble_robe' if sex == 'm' else f'iziz_{sex}_noble_gown'
    label_t = 'Izani Patrician Imperial Brocade Dalmatica' if sex == 'm' else 'Izani Patrician Imperial Silk Stola Gown'
    parts_t = [
        torso_tube(f'{gid}_body', core.ANKLE + 0.10, core.SHOULDER + 0.01, 0.024, p_brocade,
                   n=42, rows=24, hang_from=core.WAIST, flare=0.062),
        sleeves(gid, 'wrist', ease=0.023, paint=p_brocade),
        collar_disc(f'{gid}_collar', 0.085, p_gold, drop=0.025, ease=0.024, rigid_joint='Spine2'),
        sash_with_tail(gid, p_mantle, p_gold, ease=0.032),
    ]
    entries.append(assemble_garment(gid, label_t, 'torso', cul, parts_t))

    # 3. GLOVES: Filigree gold & crimson silk bracers
    gid = f'iziz_{sex}_noble_bracers'
    entries.append(assemble_garment(
        gid, 'Izani Patrician Gold Filigree Wrist-Bracers', 'gloves', cul,
        _iziz_bracers(gid, p_gold, p_brocade, length_f=0.42),
    ))

    # 4. LEGS: Preserve canonical IDs `iziz_m_noble_trousers` / `iziz_f_noble_skirt`
    if sex == 'm':
        gid = 'iziz_m_noble_trousers'
        entries.append(assemble_garment(
            gid, 'Izani Patrician Cream Silk Braccae', 'legs', cul,
            trousers(gid, p_cream, ease=0.014, bag=0.008), legged=True,
        ))
    else:
        gid = 'iziz_f_noble_skirt'
        entries.append(assemble_garment(
            gid, 'Izani Patrician Pleated Silk Under-Stola', 'legs', cul,
            [torso_tube(f'{gid}_skirt', core.ANKLE + 0.08, core.WAIST - 0.045, 0.020, p_cream,
                        n=40, rows=18, hang_from=core.WAIST - 0.045, flare=0.055)],
        ))

    # 5. FEET: Crimson & gilt patrician boots
    gid = f'iziz_{sex}_noble_boots'
    entries.append(assemble_garment(
        gid, 'Izani Patrician Crimson & Gilt Boots', 'feet', cul,
        boots(gid, _p_leather('umber', 'gold'), p_boot, top=0.58, cuff_paint=p_gold, ease_top=0.007),
    ))

    # 6. BACK: Flowing sun-orange silk paludamentum mantle
    gid = f'iziz_{sex}_noble_mantle'
    entries.append(assemble_garment(
        gid, 'Izani Patrician Sun-Orange Silk Paludamentum', 'back', cul,
        [cape(f'{gid}_cape', core.ANKLE + 0.14, p_mantle, span=1.75, ease=0.025, flare=0.072)],
    ))
    return entries


def _build_flamen(sex):
    entries = []
    cul = 'izani'
    p_white = P('white', 0.03, [B('bottom', 0.0, 0.022, 'solid', 'gold')], fabric='leather.polished')
    p_dalm = _p_clavus_robe('cream', 'sunorange', fabric='cloth.linen.sea')
    p_orange = _p_paludamentum('sunorange', 'gold')
    p_gold = _p_gold()
    p_alb = _p_linen('cream', 'gold', fabric='cloth.linen.sea')
    p_sand = _p_leather('saddle', 'gold')

    # 1. HEAD: Roman albogalerus solar-rod miter
    gid = f'iziz_{sex}_flamen_apex'
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    cap = head_rings(f'{gid}_galerus', 0.59, 1.02, 0.011, p_white, n=36, rows=12, apex=True)
    top_p = b + up * 0.010
    parts_h = [
        cap,
        crown_band(f'{gid}_rim', p_gold, 0.59, 0.66, ease=0.014, rows=4, n=36),
        rosette(f'{gid}_disc', top_p, up, rgt, radius=0.032, paint=p_gold, n=16, thick=0.008, rigid_joint='Head'),
        horn(f'{gid}_rod', [top_p - up * 0.004, top_p + up * 0.055, top_p + up * 0.105], 0.008, 0.003, p_gold, n=10, rows=6, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(gid, 'Solar Flamen Albogalerus & Apex Rod', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Sun-Orb dalmatica with Solar Mirror pectoral
    gid = f'iziz_{sex}_flamen_vestment'
    parts_t = [
        torso_tube(f'{gid}_dalmatica', core.KNEE + 0.04, core.SHOULDER + 0.01, 0.024, p_dalm,
                   n=40, rows=18, hang_from=core.WAIST, flare=0.060),
        sleeves(gid, 'wrist', ease=0.023, paint=p_dalm),
        belt_sash(f'{gid}_cincture', core.WAIST - 0.035, core.WAIST + 0.035, p_orange, ease=0.030),
    ]
    parts_t.extend(_solar_pectoral_boss(gid, p_gold, p_orange, radius=0.048))
    entries.append(assemble_garment(gid, 'Solar Flamen Sun-Orb Dalmatica', 'torso', cul, parts_t))

    # 3. GLOVES: Liturgical epimanikia wrist-cuffs
    gid = f'iziz_{sex}_flamen_cuffs'
    entries.append(assemble_garment(
        gid, 'Solar Flamen Sun-Clavus Epimanikia', 'gloves', cul,
        _iziz_bracers(gid, p_orange, p_gold, length_f=0.45),
    ))

    # 4. LEGS: Full-length pleated cream liturgical alb
    gid = f'iziz_{sex}_flamen_alb'
    entries.append(assemble_garment(
        gid, 'Solar Flamen Pleated Cream Alb', 'legs', cul,
        [torso_tube(f'{gid}_alb', core.ANKLE + 0.06, core.WAIST - 0.045, 0.020, p_alb,
                    n=40, rows=18, hang_from=core.WAIST - 0.045, flare=0.056)],
    ))

    # 5. FEET: Gilded-strap temple sandals
    gid = f'iziz_{sex}_flamen_sandals'
    entries.append(assemble_garment(
        gid, 'Solar Flamen Gilded Temple Sandals', 'feet', cul,
        sandal(gid, p_sand, p_gold, laces=True),
    ))

    # 6. BACK: Imperial sun-orange pluviale cope
    gid = f'iziz_{sex}_flamen_stole_cape'
    entries.append(assemble_garment(
        gid, 'Solar Flamen Sun-Orange Pluviale Cope', 'back', cul,
        [cape(f'{gid}_pluviale', core.ANKLE + 0.14, p_orange, span=1.80, ease=0.025, flare=0.072)],
    ))
    return entries


def _build_heliarch(sex):
    entries = []
    cul = 'izani'
    p_gold = _p_gold()
    p_verd = P('verdigris', 0.04, [
        B('bottom', 0.0, 0.055, 'iziz_sun_clavus', 'gold', 'verdigris'),
        B('top', 0.0, 0.022, 'solid', 'sunorange'),
    ], [
        PN(0.0, 1.0, 'heliarch_solar', 'gold', 'verdigris', 0.18),
    ], fabric='cloth.silk')
    p_orange = _p_paludamentum('sunorange', 'gold')
    p_cream = _p_linen('cream', 'verdigris', fabric='cloth.silk')
    p_boot = _p_leather('verdigris', 'gold')

    # 1. HEAD: 12-ray Sol Invictus radiate diadem
    gid = f'iziz_{sex}_heliarch_corona'
    entries.append(assemble_garment(
        gid, 'Temple-Hill Heliarch 12-Ray Sol Invictus Corona', 'head', cul,
        _iziz_circlet(gid, p_gold, p_orange, n_rays=12, ray_len=0.068),
    ))

    # 2. TORSO: Verdigris & sun-orange planeta chasuble with Solar Mirror boss
    gid = f'iziz_{sex}_heliarch_planeta'
    parts_t = [
        torso_tube(f'{gid}_planeta', core.KNEE + 0.06, core.SHOULDER + 0.01, 0.024, p_verd,
                   n=42, rows=20, hang_from=core.WAIST, flare=0.062),
        sleeves(gid, 'wrist', ease=0.023, paint=p_verd),
        collar_disc(f'{gid}_collar', 0.095, p_gold, drop=0.030, ease=0.025, rigid_joint='Spine2'),
        belt_sash(f'{gid}_belt', core.WAIST - 0.035, core.WAIST + 0.035, p_orange, ease=0.030),
    ]
    parts_t.extend(_solar_pectoral_boss(gid, p_gold, p_verd, radius=0.056))
    entries.append(assemble_garment(gid, 'Temple-Hill Heliarch Verdigris Planeta & Solar Mirror', 'torso', cul, parts_t))

    # 3. GLOVES: Verdigris & gold brocade epimanikia gauntlets
    gid = f'iziz_{sex}_heliarch_epimanikia'
    entries.append(assemble_garment(
        gid, 'Temple-Hill Heliarch Brocade Epimanikia', 'gloves', cul,
        full_gloves(gid, p_verd, p_gold, p_cream),
    ))

    # 4. LEGS: Cream & verdigris Sun-Orb liturgical skirt
    gid = f'iziz_{sex}_heliarch_skirt'
    entries.append(assemble_garment(
        gid, 'Temple-Hill Heliarch Liturgical Sun-Skirt', 'legs', cul,
        [torso_tube(f'{gid}_skirt', core.ANKLE + 0.07, core.WAIST - 0.045, 0.020, p_cream,
                    n=40, rows=18, hang_from=core.WAIST - 0.045, flare=0.058)],
    ))

    # 5. FEET: Verdigris & gold laced campagi boots
    gid = f'iziz_{sex}_heliarch_campagi'
    entries.append(assemble_garment(
        gid, 'Temple-Hill Heliarch Verdigris Campagi', 'feet', cul,
        boots(gid, _p_leather('umber', 'gold'), p_boot, top=0.38, wraps=3, wrap_paint=p_gold, ease_top=0.007),
    ))

    # 6. BACK: Radiant sun-orange & verdigris solar cape
    gid = f'iziz_{sex}_heliarch_cape'
    entries.append(assemble_garment(
        gid, 'Temple-Hill Heliarch Solar Cape', 'back', cul,
        [cape(f'{gid}_cape', core.ANKLE + 0.14, p_orange, span=1.78, ease=0.025, flare=0.072)],
    ))
    return entries


def _build_pontifex(sex):
    entries = []
    cul = 'izani'
    p_gold = _p_gold()
    p_sakkos = _p_clavus_robe('crimson', 'gold', fabric='cloth.silk')
    p_hex = _p_hex_relic('ancient', 'gold')
    p_orange = _p_paludamentum('sunorange', 'gold')
    p_boot = _p_leather('crimson', 'gold')

    # 1. HEAD: Open-face Byzantine Triple Solar Kamelaukion Tiara with gold-and-pearl pendilia
    gid = f'iziz_{sex}_pontifex_tiara'
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    dome = head_rings(f'{gid}_dome', 0.58, 1.05, 0.014, p_sakkos, n=36, rows=12, apex=True)
    parts_h = [
        dome,
        crown_band(f'{gid}_tier1', p_gold, 0.58, 0.68, ease=0.018, flare=0.006, rows=4, n=36),
        crown_band(f'{gid}_tier2', p_hex, 0.70, 0.80, ease=0.020, flare=0.006, rows=4, n=36),
        crown_band(f'{gid}_tier3', p_gold, 0.82, 0.92, ease=0.021, flare=0.006, rows=4, n=36),
    ]
    # Hanging Byzantine gold-and-pearl pendilia chains at both temples (leaving front face open)
    dome_bot = dome.P[0]
    p_pearl = P('white', 0.02)
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        p_t, out_t = _ring_pt_along(dome_bot, rgt * (sgn * 0.96) + fwd * 0.18)
        pend_pts = [p_t + up * 0.004, p_t - up * 0.048 + out_t * 0.003, p_t - up * 0.095 + out_t * 0.005]
        parts_h.append(tube(f'{gid}_pendilia_{tag}', pend_pts, 0.0055, p_gold, n=6, rigid_joint='Head'))
        parts_h.append(blob(f'{gid}_pearl_{tag}', pend_pts[-1], (0.009, 0.009, 0.012), p_pearl, rigid_joint='Head'))
    top_p = b + up * 0.018
    parts_h.append(rosette(f'{gid}_finial', top_p, fwd, rgt, radius=0.028, paint=p_gold, n=14, thick=0.010, rigid_joint='Head'))
    entries.append(assemble_garment(
        gid, 'Pontifex Maximus Triple Kamelaukion & Pearl Pendilia', 'head', cul,
        parts_h, covers_hair=True, covers_face=False,
    ))

    # 2. TORSO: Crimson & hex-relic sakkos with Imperial loros stole
    gid = f'iziz_{sex}_pontifex_sakkos'
    parts_t = [
        torso_tube(f'{gid}_sakkos', core.ANKLE + 0.10, core.SHOULDER + 0.01, 0.025, p_sakkos,
                   n=42, rows=24, hang_from=core.WAIST, flare=0.064),
        sleeves(gid, 'wrist', ease=0.023, paint=p_sakkos),
        collar_disc(f'{gid}_superhumeral', 0.11, p_hex, drop=0.032, ease=0.026, rigid_joint='Spine2'),
        crossed_sash(f'{gid}_loros', p_hex, width=0.10, ease=0.033),
        belt_sash(f'{gid}_belt', core.WAIST - 0.038, core.WAIST + 0.038, p_gold, ease=0.032),
    ]
    parts_t.extend(_solar_pectoral_boss(gid, p_gold, p_hex, radius=0.060))
    entries.append(assemble_garment(gid, 'Pontifex Maximus Hex-Relic Loros & Sakkos', 'torso', cul, parts_t))

    # 3. GLOVES: Gilded relic-plate & crimson silk gauntlets
    gid = f'iziz_{sex}_pontifex_cuffs'
    entries.append(assemble_garment(
        gid, 'Pontifex Maximus Gilded Relic Gauntlets', 'gloves', cul,
        full_gloves(gid, p_hex, p_gold, p_sakkos),
    ))

    # 4. LEGS: Crimson & gold ceremonial train under-skirt
    gid = f'iziz_{sex}_pontifex_train'
    entries.append(assemble_garment(
        gid, 'Pontifex Maximus Crimson Imperial Under-Train', 'legs', cul,
        [torso_tube(f'{gid}_train', core.ANKLE + 0.06, core.WAIST - 0.045, 0.020, p_sakkos,
                    n=40, rows=18, hang_from=core.WAIST - 0.045, flare=0.058)],
    ))

    # 5. FEET: Crimson & gold jeweled campagi buskins
    gid = f'iziz_{sex}_pontifex_buskins'
    entries.append(assemble_garment(
        gid, 'Pontifex Maximus Jeweled Imperial Buskins', 'feet', cul,
        boots(gid, _p_leather('umber', 'gold'), p_boot, top=0.58, cuff_paint=p_gold, ease_top=0.007),
    ))

    # 6. BACK: Dorsal 16-ray Sol Invictus aureole halo-rig on bronze harness
    gid = f'iziz_{sex}_pontifex_halo_rig'
    parts_b = list(pack_straps(gid, p_gold, ease=0.015, width=0.026, thick=0.006))
    p_bk, bk, rgt, up = _dorsal_anchor(0.66)
    hub = p_bk + bk * 0.024
    # Vertical bronze spine mast rising from dorsal hub to behind-head aureole center
    halo_c = hub + up * 0.24 + bk * 0.015
    parts_b.append(tube(f'{gid}_mast', [hub - up * 0.08, hub, halo_c], 0.012, p_gold, n=10, rigid_joint='Spine2'))
    parts_b.append(rosette(f'{gid}_hub', hub, bk, rgt, radius=0.055, paint=p_hex, n=16, thick=0.014, rigid_joint='Spine2'))
    parts_b.append(rosette(f'{gid}_halo_core', halo_c, bk, rgt, radius=0.085, paint=p_gold, n=18, thick=0.012, rigid_joint='Spine2'))
    for i in range(16):
        ang = 2.0 * math.pi * (i / 16.0)
        d_ray = rgt * math.cos(ang) + up * math.sin(ang)
        r_len = 0.20 if (i % 2 == 0) else 0.145
        p0 = halo_c + d_ray * 0.068
        p1 = halo_c + d_ray * (0.5 * (0.068 + r_len))
        p2 = halo_c + d_ray * r_len
        parts_b.append(horn(f'{gid}_ray_{i}', [p0, p1, p2], 0.009, 0.002, p_gold, n=8, rows=5, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid, 'Pontifex Maximus 16-Ray Dorsal Solar Aureole', 'back', cul, parts_b))
    return entries


def _build_skirmisher(sex):
    entries = []
    cul = 'izani'
    p_bronze = _p_bronze()
    p_gold = _p_gold()
    p_orange = _p_paludamentum('sunorange', 'gold')
    p_sub = _p_linen('cream', 'crimson', fabric='cloth.linen.sea')
    p_leather = _p_leather('saddle', 'bronze')
    p_kilt = _p_pteruges('crimson', 'gold')

    # 1. HEAD: Velites war-diadem with twin sun-wings & orange crest
    gid = f'iziz_{sex}_skirmisher_crest'
    parts_h = _iziz_circlet(gid, p_bronze, p_gold, n_rays=3, ray_len=0.048)
    parts_h.append(wing(f'{gid}_wing_L', 1.0, span=0.075, height=0.055, paint=p_bronze, rise=0.025, f=0.66))
    parts_h.append(wing(f'{gid}_wing_R', -1.0, span=0.075, height=0.055, paint=p_bronze, rise=0.025, f=0.66))
    entries.append(assemble_garment(gid, 'Sun-Spear Velites Winged War-Diadem', 'head', cul, parts_h))

    # 2. TORSO: Linen subarmalis tunic (ends at WAIST - 0.05) + Solar Mirror harness, gorget & articulated pauldron
    gid = f'iziz_{sex}_skirmisher_harness'
    parts_t = [
        torso_tube(f'{gid}_subarmalis', core.WAIST - 0.05, core.SHOULDER + 0.01, 0.018, p_sub,
                   n=36, rows=12),
        sleeves(gid, 'elbow', ease=0.020, paint=p_sub),
        crossed_sash(f'{gid}_harness', p_leather, width=0.055, ease=0.026),
        *gorget_guard(gid, p_bronze, trim_paint=p_gold, ease=0.022),
        *articulated_pauldron(gid, L, p_bronze, trim_paint=p_gold, lames=2, haute_piece=False, ease=0.022),
        belt_sash(f'{gid}_belt', core.WAIST - 0.032, core.WAIST + 0.032, p_leather, ease=0.026),
    ]
    parts_t.extend(_solar_pectoral_boss(gid, p_gold, p_bronze, radius=0.062))
    entries.append(assemble_garment(gid, 'Sun-Spear Skirmisher Solar-Mirror Harness', 'torso', cul, parts_t))

    # 3. GLOVES: Sculpted bronze & gold javelin vambraces
    gid = f'iziz_{sex}_skirmisher_vambraces'
    entries.append(assemble_garment(
        gid, 'Sun-Spear Skirmisher Bronze Vambraces', 'gloves', cul,
        sculpted_vambraces(gid, p_bronze, trim_paint=p_gold, couter=False, ease=0.015),
    ))

    # 4. LEGS: Crimson studded pteruges war-kilt (hang_from=WAIST - 0.045)
    gid = f'iziz_{sex}_skirmisher_kilt'
    entries.append(assemble_garment(
        gid, 'Sun-Spear Skirmisher Crimson Pteruges Kilt', 'legs', cul,
        _iziz_pteruges_kilt(gid, p_kilt, under_paint=p_sub), legged=True,
    ))

    # 5. FEET: Open laced Roman caligae sandals
    gid = f'iziz_{sex}_skirmisher_caligae'
    entries.append(assemble_garment(
        gid, 'Sun-Spear Skirmisher Caligae Sandals', 'feet', cul,
        sandal(gid, p_leather, _p_leather('leather', 'bronze'), laces=True),
    ))

    # 6. BACK: Dorsal plumbata / javelin quiver
    gid = f'iziz_{sex}_skirmisher_quiver'
    p_bk, bk, rgt, up = _dorsal_anchor(0.55)
    parts_b = [blob(f'{gid}_pad', p_bk + bk * 0.010, (0.072, 0.020, 0.14), p_leather, n=12, rows=5, rigid_joint='Spine2')]
    q_bot = p_bk + bk * 0.022 - up * 0.14 - rgt * 0.055
    q_top = p_bk + bk * 0.028 + up * 0.14 + rgt * 0.065
    parts_b.append(tube(f'{gid}_quiver', [q_bot, 0.5 * (q_bot + q_top), q_top], 0.044, p_leather, n=14, rigid_joint='Spine2'))
    parts_b.append(tube(f'{gid}_rim', [q_top - up * 0.02, q_top + up * 0.008], 0.048, p_bronze, n=14, rigid_joint='Spine2'))
    # Three feathered plumbata dart tails protruding from quiver mouth
    q_dir = (q_top - q_bot) / max(np.linalg.norm(q_top - q_bot), 1e-6)
    for k, off in enumerate((-0.016, 0.0, 0.016)):
        d0 = q_top - q_dir * 0.02 + rgt * off
        d1 = q_top + q_dir * 0.09 + rgt * (off * 1.4)
        parts_b.append(tube(f'{gid}_dart_{k}', [d0, d1], 0.007, p_orange, n=8, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid, 'Sun-Spear Skirmisher Plumbata Quiver', 'back', cul, parts_b))
    return entries


def _build_legionary(sex):
    entries = []
    cul = 'izani'
    p_steel = _p_lorica('steel', 'bronze')
    p_bronze = _p_bronze()
    p_crimson = P('crimson', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'gold')], fabric=WOOL)
    p_orange = _p_paludamentum('sunorange', 'gold')
    p_pteruges = _p_pteruges('saddle', 'bronze')
    p_leather = _p_leather('saddle', 'bronze')
    p_roll = P('oat', 0.05, fabric='cloth.canvas.duck.army')

    # 1. HEAD: Imperial Gallic galea with sagittal orange crest
    gid = f'iziz_{sex}_legion_galea'
    entries.append(assemble_garment(
        gid, 'Imperial Legionary Gallic Galea', 'head', cul,
        _iziz_galea(gid, p_steel, p_bronze, crest_paint=p_orange, transverse=False, cheek_guards=True, neck_guard=True),
        covers_hair=True,
    ))

    # 2. TORSO: Sculpted laminar steel-and-brass lorica segmentata over cropped crimson subarmalis
    gid = f'iziz_{sex}_legion_segmentata'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_crimson, n=36, rows=10),
        sleeves(gid, 'elbow', ease=0.021, paint=p_crimson),
        *cuirass_plate(gid, p_steel, trim_paint=p_bronze, style='laminar', ease=0.023, faulds=3),
        *gorget_guard(gid, p_steel, trim_paint=p_bronze, ease=0.024),
        *articulated_pauldrons(gid, p_steel, trim_paint=p_bronze, lames=3, haute_piece=False, ease=0.024),
        pouch_belt(gid, p_leather, p_bronze, ease=0.034),
    ]
    entries.append(assemble_garment(gid, 'Imperial Legionary Lorica Segmentata', 'torso', cul, parts_t))

    # 3. GLOVES: Sculpted laminated steel-and-bronze manica forearm guards & couters
    gid = f'iziz_{sex}_legion_manica'
    entries.append(assemble_garment(
        gid, 'Imperial Legionary Laminated Manica', 'gloves', cul,
        sculpted_vambraces(gid, p_steel, trim_paint=p_bronze, couter=True, ease=0.015),
    ))

    # 4. LEGS: Studded leather pteruges over crimson feminalia knee-breeches
    gid = f'iziz_{sex}_legion_pteruges'
    entries.append(assemble_garment(
        gid, 'Imperial Legionary Pteruges & Feminalia', 'legs', cul,
        _iziz_pteruges_kilt(gid, p_pteruges, under_paint=p_crimson), legged=True,
    ))

    # 5. FEET: Hobnailed legionary caligae boots
    gid = f'iziz_{sex}_legion_caligae'
    entries.append(assemble_garment(
        gid, 'Imperial Legionary Hobnailed Caligae', 'feet', cul,
        boots(gid, _p_leather('umber', 'bronze'), p_leather, top=0.38, wraps=3, wrap_paint=p_bronze, ease_top=0.007),
    ))

    # 6. BACK: Legionary marching sarcina pack with bedroll & mess-tin
    gid = f'iziz_{sex}_legion_sarcina'
    entries.append(assemble_garment(
        gid, 'Imperial Legionary Marching Sarcina Pack', 'back', cul,
        _iziz_dorsal_pack(gid, p_leather, p_bronze, p_leather, size=(0.115, 0.056, 0.125), bedroll_paint=p_roll),
    ))
    return entries


def _build_praetorian(sex):
    entries = []
    cul = 'izani'
    p_hex = _p_hex_relic('ancient', 'bronze')
    p_bronze = _p_bronze()
    p_gold = _p_gold()
    p_crimson = P('crimson', 0.04, [B('bottom', 0.0, 0.030, 'iziz_sun_clavus', 'gold', 'crimson')], fabric=WOOL)
    p_orange = _p_paludamentum('sunorange', 'gold')
    p_tassets = _p_pteruges('verdigris', 'gold')
    p_cream = P('cream', 0.04, fabric=WOOL)

    # 1. HEAD: Closed Ancient-hex & bronze visor galea with transverse orange crest
    gid = f'iziz_{sex}_praetorian_helm'
    entries.append(assemble_garment(
        gid, 'Relic-Guard Praetorian Hex-Visor Galea', 'head', cul,
        _iziz_galea(gid, p_hex, p_bronze, crest_paint=p_orange, transverse=True, visor_paint=p_bronze, cheek_guards=False, neck_guard=True),
        covers_hair=True, covers_face=True,
    ))

    # 2. TORSO: Sculpted ghost-white hex musculata cuirass, gorget & articulated haute-piece pauldrons
    gid = f'iziz_{sex}_praetorian_lorica'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_crimson, n=36, rows=10),
        sleeves(gid, 'wrist', ease=0.022, paint=p_crimson),
        *cuirass_plate(gid, p_hex, trim_paint=p_bronze, style='musculata', ease=0.024, faulds=3),
        *gorget_guard(gid, p_bronze, trim_paint=p_gold, ease=0.025),
        *articulated_pauldrons(gid, p_hex, trim_paint=p_bronze, lames=3, haute_piece=True, ease=0.025),
        belt_sash(f'{gid}_belt', core.WAIST - 0.035, core.WAIST + 0.035, p_bronze, ease=0.035),
    ]
    parts_t.extend(_solar_pectoral_boss(gid, P('turq', 0.02, fabric='glass.moonglass.leaded'), p_gold, radius=0.050, clearance=0.035))
    entries.append(assemble_garment(gid, 'Relic-Guard Praetorian Ancient-Hex Lorica', 'torso', cul, parts_t))

    # 3. GLOVES: Articulated bronze & hex-plate gauntlets with sculpted vambraces & couters
    gid = f'iziz_{sex}_praetorian_manica'
    entries.append(assemble_garment(
        gid, 'Relic-Guard Praetorian Hex-Plate Manica Gauntlets', 'gloves', cul,
        full_gloves(gid, p_hex, p_bronze, p_crimson)
        + sculpted_vambraces(gid, p_hex, trim_paint=p_bronze, couter=True, ease=0.016),
    ))

    # 4. LEGS: Articulated hex-plate hinged tassets over cream braccae
    gid = f'iziz_{sex}_praetorian_tassets'
    entries.append(assemble_garment(
        gid, 'Relic-Guard Praetorian Pteruges Tassets & Braccae', 'legs', cul,
        trousers(f'{gid}_sub', p_cream, ease=0.014, bag=0.008)
        + hinged_tassets(gid, p_hex, trim_paint=p_bronze, lames=4, ease=0.024),
        legged=True,
    ))

    # 5. FEET: Sculpted fluted bronze greaves & knee poleyns over crimson boots
    gid = f'iziz_{sex}_praetorian_greaves'
    entries.append(assemble_garment(
        gid, 'Relic-Guard Praetorian Fluted Bronze Greaves', 'feet', cul,
        boots(gid, _p_leather('crimson', 'gold'), p_bronze, top=0.36, ease_top=0.010)
        + sculpted_greaves(gid, p_bronze, trim_paint=p_gold, poleyn=True, ease=0.016),
    ))

    # 6. BACK: Separate Imperial sun-orange paludamentum cape
    gid = f'iziz_{sex}_praetorian_cape'
    entries.append(assemble_garment(
        gid, 'Relic-Guard Praetorian Sun-Orange Paludamentum', 'back', cul,
        [cape(f'{gid}_cape', core.KNEE - 0.06, p_orange, span=1.75, ease=0.044, flare=0.095)],
    ))
    return entries


def _build_forgemaster_pilot(sex):
    entries = []
    cul = 'izani'
    p_bronze = _p_bronze()
    p_hex = _p_hex_relic('ancient', 'bronze')
    p_slate = P('slate', 0.04, [B('bottom', 0.0, 0.020, 'solid', 'copper')], fabric='cloth.quilted.diamond')
    p_ruby = P('holyred', 0.02, fabric='glass.moonglass.leaded')
    p_copper = _p_bronze('copper')
    p_leather = _p_leather('umber', 'copper')
    p_turq = P('turq', 0.02, fabric='glass.moonglass.leaded')

    # 1. HEAD: Walker pilot Roman casque with ruby goggles & ear-comms
    gid = f'iziz_{sex}_pilot_casque'
    parts_h = _iziz_galea(gid, p_bronze, p_copper, crest_paint=None, cheek_guards=True, neck_guard=True, brow_f=0.58)
    # Twin ruby flight goggles seated on brow rib
    brow_ring = parts_h[1].P[len(parts_h[1].P) // 2]
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        p_g, out_g = _ring_pt_along(brow_ring, fwd * 0.90 + rgt * (sgn * 0.42))
        s_g = np.cross(up, out_g)
        s_g /= max(np.linalg.norm(s_g), 1e-6)
        parts_h.append(rosette(f'{gid}_gog_rim_{tag}', p_g + out_g * 0.003, out_g, s_g, radius=0.019, paint=p_copper, n=12, thick=0.008, rigid_joint='Head'))
        parts_h.append(rosette(f'{gid}_gog_lens_{tag}', p_g + out_g * 0.007, out_g, s_g, radius=0.014, paint=p_ruby, n=12, thick=0.006, rigid_joint='Head'))
    entries.append(assemble_garment(gid, 'Forgemaster Pilot Ruby-Goggle Roman Casque', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Sculpted cyber-plate hex/copper harness over cropped slate coveralls
    gid = f'iziz_{sex}_pilot_harness'
    parts_t = [
        torso_tube(f'{gid}_coveralls', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_slate, n=36, rows=10),
        sleeves(gid, 'wrist', ease=0.022, paint=p_slate),
        *cuirass_plate(gid, p_hex, trim_paint=p_copper, style='cyber_plate', ease=0.024, keel=0.016, faulds=2),
        *gorget_guard(gid, p_copper, trim_paint=p_bronze, ease=0.025),
        *articulated_pauldrons(gid, p_copper, trim_paint=p_bronze, lames=2, haute_piece=False, ease=0.024),
        pouch_belt(gid, p_leather, p_copper, ease=0.034),
    ]
    parts_t.extend(_solar_pectoral_boss(gid, p_turq, p_copper, radius=0.042, clearance=0.042))
    entries.append(assemble_garment(gid, 'Forgemaster Pilot Hydraulic-Port Lorica & Coveralls', 'torso', cul, parts_t))

    # 3. GLOVES: Insulated leather & sculpted copper hydraulic control gauntlets
    gid = f'iziz_{sex}_pilot_gauntlets'
    entries.append(assemble_garment(
        gid, 'Forgemaster Pilot Hydraulic Control Gauntlets', 'gloves', cul,
        full_gloves(gid, p_copper, p_leather, p_slate)
        + sculpted_vambraces(gid, p_copper, trim_paint=p_bronze, couter=True, ease=0.016),
    ))

    # 4. LEGS: Tailored quilted slate walker-pilot breeches
    gid = f'iziz_{sex}_pilot_breeches'
    entries.append(assemble_garment(
        gid, 'Forgemaster Pilot Quilted Slate Breeches', 'legs', cul,
        trousers(gid, p_slate, ease=0.014, bag=0.008), legged=True,
    ))

    # 5. FEET: Bronze-toed heavy hydraulic pedal boots
    gid = f'iziz_{sex}_pilot_boots'
    entries.append(assemble_garment(
        gid, 'Forgemaster Pilot Bronze-Toed Walker Boots', 'feet', cul,
        boots(gid, p_copper, p_leather, top=0.58, cuff_paint=p_copper, ease_top=0.024),
    ))

    # 6. BACK: Dorsal Ancient-hex Aegis kinetic-shield generator pack with copper coils
    gid = f'iziz_{sex}_pilot_aegis_pack'
    parts_b = _iziz_dorsal_pack(gid, p_hex, p_copper, p_leather, size=(0.12, 0.058, 0.145), canisters=True)
    p_bk, bk, rgt, up = _dorsal_anchor(0.56)
    parts_b.append(rosette(
        f'{gid}_cap_ring', p_bk + bk * 0.095, bk, rgt, radius=0.042, paint=p_turq, n=14, thick=0.010, rigid_joint='Spine2',
    ))
    entries.append(assemble_garment(gid, 'Forgemaster Pilot Dorsal Aegis Capacitor Pack', 'back', cul, parts_b))
    return entries


def _build_watch(sex):
    entries = []
    cul = 'izani'
    p_copper = _p_bronze('copper')
    p_hex = _p_hex_relic('ancient', 'copper')
    p_lam = _p_watch_lamellar()
    p_gamb = P('drab', 0.05, fabric='cloth.quilted.diamond')
    p_trous = P('umber', 0.05, fabric=WOOL)
    p_boot = _p_leather('umber', 'copper')

    # 1. HEAD: Copper Watch kettle-sallet with flared brim & Ancient-white nasal bar
    gid = f'iziz_{sex}_watch_sallet'
    hc, fwd, rgt, up, z_bot, z_top, rx, ry, a, b = _head_basis()
    bowl = head_rings(f'{gid}_bowl', 0.58, 1.02, 0.013, p_copper, n=36, rows=12, apex=True)
    p_f, out_f = _ring_pt_along(bowl.P[0], fwd)
    parts_h = [
        bowl,
        brim(f'{gid}_brim', 0.58, 0.055, p_copper, ease=0.014, rows=5, n=36, droop=0.025),
        # Riveted Ancient-white nasal guard bar descending from front brow
        strap(f'{gid}_nasal', [p_f + out_f * 0.008 + up * 0.015, p_f + out_f * 0.014 - up * 0.028, p_f + out_f * 0.014 - up * 0.058],
              0.018, p_hex, rigid_joint='Head'),
    ]
    entries.append(assemble_garment(gid, 'Watch Auxilia Copper Kettle-Sallet & Nasal Guard', 'head', cul, parts_h, covers_hair=True))

    # 2. TORSO: Sculpted copper & hex lamellar cuirass over cropped quilted gambeson
    gid = f'iziz_{sex}_watch_cuirass'
    parts_t = [
        torso_tube(f'{gid}_gambeson', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_gamb, n=36, rows=10),
        sleeves(gid, 'wrist', ease=0.022, paint=p_gamb),
        *cuirass_plate(gid, p_lam, trim_paint=p_copper, style='lamellar', ease=0.024, faulds=3),
        *gorget_guard(gid, p_copper, trim_paint=p_hex, ease=0.025),
        *articulated_pauldrons(gid, p_lam, trim_paint=p_copper, lames=3, haute_piece=False, ease=0.024),
        pouch_belt(gid, p_boot, p_copper, ease=0.034),
    ]
    entries.append(assemble_garment(gid, 'Watch Auxilia Copper & Hex Salvage Lamellar', 'torso', cul, parts_t))

    # 3. GLOVES: Sculpted riveted copper & hex patrol vambraces
    gid = f'iziz_{sex}_watch_bracers'
    entries.append(assemble_garment(
        gid, 'Watch Auxilia Riveted Copper Patrol Bracers', 'gloves', cul,
        sculpted_vambraces(gid, p_copper, trim_paint=p_hex, couter=True, ease=0.015),
    ))

    # 4. LEGS: Tailored waxed patrol trousers
    gid = f'iziz_{sex}_watch_trousers'
    entries.append(assemble_garment(
        gid, 'Watch Auxilia Waxed Patrol Braccae', 'legs', cul,
        trousers(gid, p_trous, ease=0.014, bag=0.008), legged=True,
    ))

    # 5. FEET: Hobnailed Watch patrol boots
    gid = f'iziz_{sex}_watch_boots'
    entries.append(assemble_garment(
        gid, 'Watch Auxilia Hobnailed Patrol Boots', 'feet', cul,
        boots(gid, _p_leather('soot', 'copper'), p_boot, top=0.58, cuff_paint=p_copper, ease_top=0.024),
    ))

    # 6. BACK: Mercenary grapple-coil & manacle patrol pack
    gid = f'iziz_{sex}_watch_pack'
    entries.append(assemble_garment(
        gid, 'Watch Auxilia Grapple & Shackle Patrol Pack', 'back', cul,
        _iziz_dorsal_pack(gid, p_boot, p_copper, p_boot, size=(0.11, 0.055, 0.13), bedroll_paint=p_gamb),
    ))
    return entries


def _build_crab_marine(sex):
    entries = []
    cul = 'izani'
    p_chitin = _p_chitin_armor()
    p_verd = _p_bronze('verdigris', fabric='metal.bronze.verdigris')
    p_linen = _p_linen('sealinen', 'verdigris', fabric='cloth.linen.sea')
    p_kilt = _p_pteruges('verdigris', 'bronze')
    p_leather = _p_leather('saddle', 'verdigris')
    p_net = P('oat', 0.06, fabric='straw.reed.plaited')

    # 1. HEAD: Chitin-carapace & verdigris-brass coastal galea
    gid = f'iziz_{sex}_crab_galea'
    entries.append(assemble_garment(
        gid, 'Land-Crab Marine Chitin-Carapace Galea', 'head', cul,
        _iziz_galea(gid, p_chitin, p_verd, crest_paint=p_chitin, transverse=False, cheek_guards=True, neck_guard=True),
        covers_hair=True,
    ))

    # 2. TORSO: Sculpted chitin-carapace coastal lorica, gorget & articulated crab-shell pauldrons
    gid = f'iziz_{sex}_crab_lorica'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_linen, n=36, rows=10),
        sleeves(gid, 'elbow', ease=0.021, paint=p_linen),
        *cuirass_plate(gid, p_chitin, trim_paint=p_verd, style='lamellar', ease=0.024, faulds=3),
        *gorget_guard(gid, p_verd, trim_paint=p_chitin, ease=0.025),
        *articulated_pauldrons(gid, p_chitin, trim_paint=p_verd, lames=3, haute_piece=True, ease=0.025),
        belt_sash(f'{gid}_belt', core.WAIST - 0.034, core.WAIST + 0.034, p_verd, ease=0.034),
    ]
    entries.append(assemble_garment(gid, 'Land-Crab Marine Chitin-Carapace Lorica', 'torso', cul, parts_t))

    # 3. GLOVES: Segmented chitin marine boarding gauntlets & sculpted vambraces
    gid = f'iziz_{sex}_crab_claws'
    entries.append(assemble_garment(
        gid, 'Land-Crab Marine Chitin Claw-Gauntlets', 'gloves', cul,
        full_gloves(gid, p_chitin, p_verd, p_leather)
        + sculpted_vambraces(gid, p_chitin, trim_paint=p_verd, couter=True, ease=0.016),
    ))

    # 4. LEGS: Verdigris & bronze coastal pteruges kilt
    gid = f'iziz_{sex}_crab_kilt'
    entries.append(assemble_garment(
        gid, 'Land-Crab Marine Verdigris Coastal Kilt', 'legs', cul,
        _iziz_pteruges_kilt(gid, p_kilt, under_paint=p_linen), legged=True,
    ))

    # 5. FEET: Cord-laced marine deck caligae sandals
    gid = f'iziz_{sex}_crab_sandals'
    entries.append(assemble_garment(
        gid, 'Land-Crab Marine Deck Caligae Sandals', 'feet', cul,
        sandal(gid, p_leather, p_verd, laces=True),
    ))

    # 6. BACK: Rolled boarding-net & carapace dorsal pack
    gid = f'iziz_{sex}_crab_net_pack'
    entries.append(assemble_garment(
        gid, 'Land-Crab Marine Boarding-Net & Carapace Pack', 'back', cul,
        _iziz_dorsal_pack(gid, p_chitin, p_verd, p_leather, size=(0.12, 0.058, 0.13), bedroll_paint=p_net),
    ))
    return entries


def _build_pc_legatus(sex):
    entries = []
    cul = 'izani'
    p_gold = _p_gold()
    p_bronze = _p_bronze()
    p_hex = _p_hex_relic('ancient', 'gold')
    p_crimson = _p_clavus_robe('crimson', 'gold', fabric='cloth.silk')
    p_orange = _p_paludamentum('sunorange', 'gold')
    p_tassets = _p_pteruges('crimson', 'gold')
    p_cream = P('cream', 0.03, fabric='cloth.silk')

    # 1. HEAD: Closed gilded bronze Legatus galea with sun-halo visor & transverse orange crest
    gid = f'iziz_{sex}_pc_legatus_helm'
    entries.append(assemble_garment(
        gid, 'Imperial Solar Legatus Sun-Visor Galea', 'head', cul,
        _iziz_galea(gid, p_bronze, p_gold, crest_paint=p_orange, transverse=True, visor_paint=p_gold, cheek_guards=False, neck_guard=True),
        covers_hair=True, covers_face=True,
    ))

    # 2. TORSO: Sculpted ghost-white hex musculata cuirass, gilded gorget & articulated haute-piece pauldrons
    gid = f'iziz_{sex}_pc_legatus_cuirass'
    parts_t = [
        torso_tube(f'{gid}_sub', core.WAIST - 0.04, core.SHOULDER + 0.01, 0.017, p_crimson, n=36, rows=10),
        sleeves(gid, 'wrist', ease=0.022, paint=p_crimson),
        *cuirass_plate(gid, p_hex, trim_paint=p_gold, style='musculata', ease=0.024, faulds=3),
        *gorget_guard(gid, p_gold, trim_paint=p_bronze, ease=0.025),
        *articulated_pauldrons(gid, p_gold, trim_paint=p_bronze, lames=3, haute_piece=True, ease=0.025),
        belt_sash(f'{gid}_cingulum', core.WAIST - 0.036, core.WAIST + 0.036, p_gold, ease=0.035),
    ]
    parts_t.extend(_solar_pectoral_boss(gid, p_gold, p_orange, radius=0.056, clearance=0.035))
    entries.append(assemble_garment(gid, 'Imperial Solar Legatus Hex-Plate & Bronze Lorica', 'torso', cul, parts_t))

    # 3. GLOVES: Articulated gilded bronze manica gauntlets with sculpted vambraces & couters
    gid = f'iziz_{sex}_pc_legatus_gauntlets'
    entries.append(assemble_garment(
        gid, 'Imperial Solar Legatus Gilded Manica Gauntlets', 'gloves', cul,
        full_gloves(gid, p_gold, p_bronze, p_crimson)
        + sculpted_vambraces(gid, p_gold, trim_paint=p_bronze, couter=True, ease=0.016),
    ))

    # 4. LEGS: Articulated gilded bronze hinged tassets over cream braccae
    gid = f'iziz_{sex}_pc_legatus_tassets'
    entries.append(assemble_garment(
        gid, 'Imperial Solar Legatus Pteruges & Cream Braccae', 'legs', cul,
        trousers(f'{gid}_sub', p_cream, ease=0.014, bag=0.008)
        + hinged_tassets(gid, p_gold, trim_paint=p_bronze, lames=4, ease=0.024),
        legged=True,
    ))

    # 5. FEET: Sculpted fluted gilded bronze greaves & poleyns over crimson caligae
    gid = f'iziz_{sex}_pc_legatus_greaves'
    entries.append(assemble_garment(
        gid, 'Imperial Solar Legatus Fluted Gilded Greaves', 'feet', cul,
        boots(gid, _p_leather('crimson', 'gold'), p_gold, top=0.36, ease_top=0.010)
        + sculpted_greaves(gid, p_gold, trim_paint=p_bronze, poleyn=True, ease=0.016),
    ))

    # 6. BACK: Imperial sun-orange paludamentum cape + dorsal gilded Sun-Orb vexillum standard
    gid = f'iziz_{sex}_pc_legatus_vexillum'
    parts_b = [cape(f'{gid}_paludamentum', core.ANKLE + 0.16, p_orange, span=1.78, ease=0.044, flare=0.095)]
    p_bk, bk, rgt, up = _dorsal_anchor(0.62)
    base_p = p_bk + bk * 0.034
    top_p = base_p + up * 0.36 + bk * 0.015
    parts_b.append(tube(f'{gid}_pole', [base_p - up * 0.14, base_p, top_p], 0.011, p_bronze, n=10, rigid_joint='Spine2'))
    parts_b.append(rosette(f'{gid}_orb', top_p, bk, rgt, radius=0.055, paint=p_gold, n=16, thick=0.012, rigid_joint='Spine2'))
    parts_b.append(tube(f'{gid}_xbar', [top_p - up * 0.06 - rgt * 0.10, top_p - up * 0.06 + rgt * 0.10], 0.007, p_gold, n=8, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid, 'Imperial Solar Legatus Paludamentum & Sun Vexillum', 'back', cul, parts_b))
    return entries


# ===========================================================================================================
# OUTFIT MAP & PEOPLES.JSON ENTRY BUILDER
# ===========================================================================================================
def _outfits_for_sex(sex):
    return {
        'peasant': {
            'region': 'core',
            'head': f'iziz_{sex}_peasant_hood',
            'torso': f'iziz_{sex}_peasant_tunic',
            'gloves': f'iziz_{sex}_peasant_cuffs',
            'legs': f'iziz_{sex}_peasant_trousers',
            'feet': f'iziz_{sex}_peasant_wraps',
            'back': f'iziz_{sex}_peasant_basket',
        },
        'trade': {
            'region': 'core',
            'head': f'iziz_{sex}_trade_cap',
            'torso': f'iziz_{sex}_trade_coat',
            'gloves': f'iziz_{sex}_trade_cuffs',
            'legs': f'iziz_{sex}_trade_trousers',
            'feet': f'iziz_{sex}_trade_boots',
            'back': f'iziz_{sex}_trade_satchel',
        },
        'aedile': {
            'region': 'core',
            'head': f'iziz_{sex}_aedile_wreath',
            'torso': f'iziz_{sex}_aedile_toga',
            'gloves': f'iziz_{sex}_aedile_rings',
            'legs': f'iziz_{sex}_aedile_trousers',
            'feet': f'iziz_{sex}_aedile_calcei',
            'back': f'iziz_{sex}_aedile_drape',
        },
        'noble': {
            'region': 'core',
            'head': f'iziz_{sex}_noble_crown',
            'torso': 'iziz_m_noble_robe' if sex == 'm' else 'iziz_f_noble_gown',
            'gloves': f'iziz_{sex}_noble_bracers',
            'legs': 'iziz_m_noble_trousers' if sex == 'm' else 'iziz_f_noble_skirt',
            'feet': f'iziz_{sex}_noble_boots',
            'back': f'iziz_{sex}_noble_mantle',
        },
        'flamen': {
            'region': 'core',
            'head': f'iziz_{sex}_flamen_apex',
            'torso': f'iziz_{sex}_flamen_vestment',
            'gloves': f'iziz_{sex}_flamen_cuffs',
            'legs': f'iziz_{sex}_flamen_alb',
            'feet': f'iziz_{sex}_flamen_sandals',
            'back': f'iziz_{sex}_flamen_stole_cape',
        },
        'heliarch': {
            'region': 'core',
            'head': f'iziz_{sex}_heliarch_corona',
            'torso': f'iziz_{sex}_heliarch_planeta',
            'gloves': f'iziz_{sex}_heliarch_epimanikia',
            'legs': f'iziz_{sex}_heliarch_skirt',
            'feet': f'iziz_{sex}_heliarch_campagi',
            'back': f'iziz_{sex}_heliarch_cape',
        },
        'pontifex': {
            'region': 'core',
            'head': f'iziz_{sex}_pontifex_tiara',
            'torso': f'iziz_{sex}_pontifex_sakkos',
            'gloves': f'iziz_{sex}_pontifex_cuffs',
            'legs': f'iziz_{sex}_pontifex_train',
            'feet': f'iziz_{sex}_pontifex_buskins',
            'back': f'iziz_{sex}_pontifex_halo_rig',
            'type': 'important_npc',
        },
        'skirmisher': {
            'region': 'core',
            'head': f'iziz_{sex}_skirmisher_crest',
            'torso': f'iziz_{sex}_skirmisher_harness',
            'gloves': f'iziz_{sex}_skirmisher_vambraces',
            'legs': f'iziz_{sex}_skirmisher_kilt',
            'feet': f'iziz_{sex}_skirmisher_caligae',
            'back': f'iziz_{sex}_skirmisher_quiver',
        },
        'legionary': {
            'region': 'core',
            'head': f'iziz_{sex}_legion_galea',
            'torso': f'iziz_{sex}_legion_segmentata',
            'gloves': f'iziz_{sex}_legion_manica',
            'legs': f'iziz_{sex}_legion_pteruges',
            'feet': f'iziz_{sex}_legion_caligae',
            'back': f'iziz_{sex}_legion_sarcina',
        },
        'praetorian': {
            'region': 'core',
            'head': f'iziz_{sex}_praetorian_helm',
            'torso': f'iziz_{sex}_praetorian_lorica',
            'gloves': f'iziz_{sex}_praetorian_manica',
            'legs': f'iziz_{sex}_praetorian_tassets',
            'feet': f'iziz_{sex}_praetorian_greaves',
            'back': f'iziz_{sex}_praetorian_cape',
        },
        'forgemaster_pilot': {
            'region': 'core',
            'head': f'iziz_{sex}_pilot_casque',
            'torso': f'iziz_{sex}_pilot_harness',
            'gloves': f'iziz_{sex}_pilot_gauntlets',
            'legs': f'iziz_{sex}_pilot_breeches',
            'feet': f'iziz_{sex}_pilot_boots',
            'back': f'iziz_{sex}_pilot_aegis_pack',
        },
        'watch': {
            'region': 'mercenary',
            'head': f'iziz_{sex}_watch_sallet',
            'torso': f'iziz_{sex}_watch_cuirass',
            'gloves': f'iziz_{sex}_watch_bracers',
            'legs': f'iziz_{sex}_watch_trousers',
            'feet': f'iziz_{sex}_watch_boots',
            'back': f'iziz_{sex}_watch_pack',
        },
        'crab_marine': {
            'region': 'mercenary',
            'head': f'iziz_{sex}_crab_galea',
            'torso': f'iziz_{sex}_crab_lorica',
            'gloves': f'iziz_{sex}_crab_claws',
            'legs': f'iziz_{sex}_crab_kilt',
            'feet': f'iziz_{sex}_crab_sandals',
            'back': f'iziz_{sex}_crab_net_pack',
        },
        'pc_legatus': {
            'region': 'core',
            'head': f'iziz_{sex}_pc_legatus_helm',
            'torso': f'iziz_{sex}_pc_legatus_cuirass',
            'gloves': f'iziz_{sex}_pc_legatus_gauntlets',
            'legs': f'iziz_{sex}_pc_legatus_tassets',
            'feet': f'iziz_{sex}_pc_legatus_greaves',
            'back': f'iziz_{sex}_pc_legatus_vexillum',
            'type': 'pc',
            'label': 'Imperial Solar Legatus (PC Hero)',
        },
    }


def build_iziz_peoples_entry():
    """Construct complete `peoples.json` entry for Main Iziz (`izani`) preserving canonical phenotype."""
    return {
        'id': 'izani',
        'name': 'Izani',
        'note': (
            "The Empire of Iziz (Main Imperial Core & Core Mercenaries — LORE.md §6.2): Roman / Byzantine / "
            "Western science-fantasy civilization — bronze & ghost-white Ancient hex loricae, crimson/verdigris "
            "pteruges, Imperial sun-orange (#e07a2a) paludamenta, Curule togae praetextae, Solar Flamen / Heliarch "
            "/ Pontifex vestments, Forgemaster walker pilots, Copper-Sallet Watch (MC-02), and chitin-carapace "
            "Land-Crab Auxilia (MC-07) at 100% mpfb_male & mpfb_female parity (tools/garments/cultures/iziz.py)."
        ),
        'ancestry': {
            'african': [0.15, 0.4],
            'asian': [0.15, 0.35],
            'caucasian': [0.35, 0.6],
        },
        'skin': [
            '#d8b08c',
            '#bf9068',
            '#9c6e4a',
            '#7a5235',
        ],
        'hair': [
            '#1a1410',
            '#2a1f17',
            '#3d2c1f',
            '#5a3e27',
        ],
        'eyes': [
            '#2a1a10',
            '#3b2414',
            '#5a3a22',
        ],
        'grey': 0.5,
        'beard': 0.35,
        'styles': {
            'male': [
                'Short_Hair_B',
                'mhair02',
                'elvs_maxwell_hair',
                'culturalibre_hair_05',
                'short02',
            ],
            'female': [
                'elvs_50s_updo',
                'elvs_braid_bun',
                'Messy_Bun',
                'elvs_island_princess_hair',
                'braid01',
            ],
        },
        'tiers': IZIZ_TIER_SHARES,
        'tier_labels': IZIZ_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_iziz_kit():
    """Compile all 14 Main Iziz tiers across `mpfb_male` and `mpfb_female` inside `iziz_motif_scope()`."""
    builders = [
        _build_peasant,
        _build_trade,
        _build_aedile,
        _build_noble,
        _build_flamen,
        _build_heliarch,
        _build_pontifex,
        _build_skirmisher,
        _build_legionary,
        _build_praetorian,
        _build_forgemaster_pilot,
        _build_watch,
        _build_crab_marine,
        _build_pc_legatus,
    ]
    entries = []
    with iziz_motif_scope():
        for body_id, sex in (('mpfb_male', 'm'), ('mpfb_female', 'f')):
            set_body(body_id)
            for fn in builders:
                for ent in fn(sex):
                    ent['_body'] = body_id
                    entries.append(ent)
    return entries


def _validate_manifest(kit_entries, peoples_entry):
    stranger_sum = sum(sh for tid, sh in peoples_entry['tiers'] if not tid.startswith('pc_'))
    assert abs(stranger_sum - 1.0) < 1e-9, f'Stranger tier shares sum to {stranger_sum}, expected 1.00'

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

    for sex_key, body_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        sex_outfits = peoples_entry['outfits'][sex_key]
        assert len(sex_outfits) == 14, f'Expected 14 {sex_key} tiers, got {len(sex_outfits)}'
        for tid, spec in sex_outfits.items():
            for slot in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                if slot in spec:
                    pid = spec[slot]
                    assert (body_id, pid) in by_body_id, f'Outfit {sex_key}.{tid}.{slot} -> {pid} missing from {body_id}'
                    assert by_body_id[(body_id, pid)]['slot'] == slot, (
                        f'Slot mismatch on {pid}: expected {slot}, got {by_body_id[(body_id, pid)]["slot"]}'
                    )


def main():
    t0 = time.perf_counter()
    kit_entries = build_iziz_kit()
    peoples_entry = build_iziz_peoples_entry()
    _validate_manifest(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'iziz_manifest.json'
    manifest_data = {
        'culture': 'izani',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Main Iziz pieces ({n_m} male, {n_f} female) across 14 tiers in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
