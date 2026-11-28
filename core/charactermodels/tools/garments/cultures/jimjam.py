"""The Kingdom of Jimjam Wardrobe Kit (`jimjam` — *Jamṭōkku*, Rhythmite Brick, Alabaster & Sacred Calendar).

Builds all 12 M+F paired Jimjam tiers (`mpfb_male` `jjm_m_*` & `mpfb_female` `jjm_f_*`),
replacing the 1-tier male-only stub and foreign Xanadu slipper loan with 100% native South-Asian /
Deccani-inspired zero-ruin rhythmite, Sunboll-muslin, Veḷḷai-kal white alabaster, Skywatch skarn-brass,
Dream-Sibyl coin-veils, the Four Rival *Wanderer* Astronomical Schools, and **The Raja of Jimjam**:

  1. `peasant_lagoon`        (`0.22`) — Hanḍu Dyke-Tender & Sunboll Indigo/Saffron Dyer
  2. `artisan_mason`         (`0.12`) — Veḷḷai-Kal Alabaster Jali & Clinker-Brick Master
  3. `almanac_factor`        (`0.12`) — `Kaunṭavan` Day-Keeper & Five-Wanderer Almanacker
  4. `school_eye_optician`   (`0.07`) — Wanderer School of the Eye (Skywatch-Brass & Emerald Lens-Astronomer)
  5. `school_wheel_horologer`(`0.07`) — Wanderer School of the Thirteen-Wheel (Ephemeris & Gear-Reckoner)
  6. `oracle_attendant`      (`0.06`) — Wanderer School of the Veil & Solstice Censer-Bearer
  7. `sibyl`                 (`0.06`) — Ruby Zenana Dream-Sibyl (Coin-Veiled Seer, M+F Parity)
  8. `barge_corsair`         (`0.10`) — Great Trough & Serai Soda-Lake Barge-Marine (`kavacha` scale)
  9. `skywatch_guard`        (`0.09`) — Skywatch (`+3,745 m`) Skarn-Brass & Qiviut Pass-Warden
 10. `court_trendsetter`     (`0.09`) — Jimjam High-Court & Dilihan Patrician Trendsetter
 11. `grand_dream_sibyl`     (`0.00`) — Grand Dream-Sibyl of the Double Dark (`important_npc`)
 12. `raja_concordance`      (`0.00`) — The Raja of Jimjam (Sovereign of the Three Wheels, `important_npc`)

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/jimjam.py
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
from PIL import Image

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
REPO_ROOT = ROOT.parent.parent
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
    torso_tube, collar, collar_disc, cape, tabard, crossed_sash, pauldron,
)
from garments.types.limbs import sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_rings, sculpted_faceplate, tower_hat, turban, crown_band, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, button_row, tube, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

# Five-Wanderer Canonical Colors + Zero-Ruin Jimjam Materials (Linear RGB)
JJM_COLORS = {
    'jjm_rust':        (0.390, 0.035, 0.022),  # Wanderer 1: Rust kiln-brick crimson
    'jjm_crown':       (0.690, 0.375, 0.032),  # Wanderer 2: Crown marl saffron-gold
    'jjm_ash':         (0.015, 0.013, 0.015),  # Wanderer 3: Ash vitrified clinker-black
    'jjm_veil':        (0.895, 0.870, 0.805),  # Wanderer 4: Veil Vellai-kal alabaster / Sunboll malmal
    'jjm_frost':       (0.026, 0.265, 0.305),  # Wanderer 5: Frost turquoise-teal
    'jjm_skarn_brass': (0.745, 0.445, 0.065),  # Skywatch (+3,745 m) golden skarn-brass
    'jjm_ruby':        (0.320, 0.010, 0.030),  # Ruby Zenana silk
    'jjm_emerald':     (0.012, 0.165, 0.055),  # Barada/Serai emerald cabochon
    'jjm_iziz_pipe':   (0.695, 0.105, 0.020),  # Dilihan-crossover Iziz-orange piping (#d95b26)
    'jjm_twilight':    (0.085, 0.038, 0.165),  # Double-Dark indigo-plum
}
for _k, _v in JJM_COLORS.items():
    C.setdefault(_k, _v)

JIMJAM_TIER_SHARES = [
    ['peasant_lagoon', 0.22],
    ['artisan_mason', 0.12],
    ['almanac_factor', 0.12],
    ['school_eye_optician', 0.07],
    ['school_wheel_horologer', 0.07],
    ['oracle_attendant', 0.06],
    ['sibyl', 0.06],
    ['barge_corsair', 0.10],
    ['skywatch_guard', 0.09],
    ['court_trendsetter', 0.09],
    ['grand_dream_sibyl', 0.0],
    ['raja_concordance', 0.0],
]

JIMJAM_TIER_LABELS = {
    'peasant_lagoon': 'Hanḍu Lagoon Dyke-Tender & Sunboll Dyer',
    'artisan_mason': 'Veḷḷai-Kal Alabaster Jali & Clinker-Brick Master',
    'almanac_factor': 'Kaunṭavan Day-Keeper & Five-Wanderer Almanacker',
    'school_eye_optician': 'Wanderer School of the Eye (Brass & Emerald Lens-Seer)',
    'school_wheel_horologer': 'Wanderer School of the Thirteen-Wheel (Gear-Reckoner)',
    'oracle_attendant': 'Wanderer School of the Veil & Solstice Censer-Bearer',
    'sibyl': 'Ruby Zenana Dream-Sibyl (Coin-Veiled Seer)',
    'barge_corsair': 'Great Trough & Serai Barge-Marine',
    'skywatch_guard': 'Skywatch Skarn-Brass & Qiviut Pass-Warden',
    'court_trendsetter': 'Jimjam High-Court & Dilihan Patrician Trendsetter',
    'grand_dream_sibyl': 'Grand Dream-Sibyl of the Double Dark',
    'raja_concordance': 'The Raja of Jimjam (Sovereign of the Three Wheels)',
}

_PAT_DIR = REPO_ROOT / 'core' / 'materials' / 'patterns'
_JJM_TEX_FILES = {
    'jjm_jali_tracery': _PAT_DIR / 'jimjam' / 'shaft-tracery' / 'albedo.jpg',
    'jjm_brick_ogee':   _PAT_DIR / 'jimjam' / 'shaft-ogee' / 'albedo.jpg',
    'jjm_brick_spiral': _PAT_DIR / 'jimjam' / 'shaft-spiral' / 'albedo.jpg',
}
_JJM_TEX_CACHE = {}


def _sample_jjm_tex(key, w, h, fg, bg, blend=0.28):
    if key not in _JJM_TEX_CACHE:
        arr = None
        p = paint_mod._resolve_lfs(_JJM_TEX_FILES[key])
        if p.exists() and p.stat().st_size > 500:
            try:
                im = Image.open(p).convert('RGB')
                px = np.asarray(im, dtype=np.float32) / 255.0
                arr = np.power(np.clip(px, 0.0, 1.0), 2.2)
            except Exception:
                arr = None
        _JJM_TEX_CACHE[key] = arr
    src = _JJM_TEX_CACHE[key]
    if src is None or w < 1 or h < 1:
        out = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
        out[:] = bg
        return out
    sh, sw = src.shape[:2]
    yy = (np.linspace(0.0, 1.0, h, endpoint=False) * sh).astype(int) % sh
    xx = (np.linspace(0.0, 1.0, w, endpoint=False) * sw).astype(int) % sw
    samp = src[np.ix_(yy, xx)].astype(np.float64)
    lum = 0.299 * samp[..., 0] + 0.587 * samp[..., 1] + 0.114 * samp[..., 2]
    p10, p90 = float(np.percentile(lum, 10)), float(np.percentile(lum, 90))
    t = np.clip((lum - p10) / max(p90 - p10, 0.06), 0.0, 1.0)[..., None]
    pal = np.asarray(bg)[None, None, :] * (1.0 - t) + np.asarray(fg)[None, None, :] * t
    return np.clip((1.0 - blend) * samp + blend * pal, 0.0, 1.0)


def _jjm_procedural_motif(style, w, h, fg, bg):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'jjm_five_wanderers':
        # Canonical 5-stripe astronomical almanac sash: Rust, Crown, Ash, Veil, Frost + gold zari borders
        bands = [C['jjm_rust'], C['jjm_crown'], C['jjm_ash'], C['jjm_veil'], C['jjm_frost']]
        idx = np.floor((v * 5.0) % 5.0).astype(int)
        fv = (v * 5.0) % 1.0
        for k, col in enumerate(bands):
            img[idx == k] = col
        zari = (fv < 0.09) | (fv > 0.91)
        glyph = (fv > 0.36) & (fv < 0.64) & (np.abs(np.sin(u * 2.0 * math.pi * 14.0)) > 0.86)
        img[zari | glyph] = C['jjm_skarn_brass']
        return np.clip(img, 0.0, 1.0)

    if style == 'jjm_three_wheels':
        # Three Interlocking Gold Calendar Wheels (Sun, 7-day Week, 13-day Moon) on brocade field
        cu = (u * 3.0) % 1.0 - 0.5
        cv = (v * 2.0) % 1.0 - 0.5
        r1 = np.hypot(cu + 0.13, cv + 0.05)
        r2 = np.hypot(cu - 0.13, cv + 0.05)
        r3 = np.hypot(cu, cv - 0.12)
        rim = (np.abs(r1 - 0.16) < 0.032) | (np.abs(r2 - 0.16) < 0.032) | (np.abs(r3 - 0.16) < 0.032)
        hub = (r1 < 0.04) | (r2 < 0.04) | (r3 < 0.04)
        border = (v < 0.06) | (v > 0.94)
        img[rim | hub | border] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'jjm_lungi_check':
        # Hand-loomed Hanḍu lagoon checked cotton lungi
        su = ((u * 12.0) % 1.0) < 0.45
        sv = ((v * 12.0) % 1.0) < 0.45
        img[su ^ sv] = 0.50 * np.asarray(bg) + 0.50 * np.asarray(fg)
        img[su & sv] = fg
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def _jjm_motif_ctx():
    orig = paint_mod.motif
    paint_mod.FABRIC.setdefault('cloth.brocade.damask', 0.26)

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in _JJM_TEX_FILES:
            return _sample_jjm_tex(style, w, h, fg, bg)
        if style in ('jjm_five_wanderers', 'jjm_three_wheels', 'jjm_lungi_check'):
            return _jjm_procedural_motif(style, w, h, fg, bg)
        return orig(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched
    try:
        yield
    finally:
        paint_mod.motif = orig


# ===========================================================================================================
# GEOMETRY HELPERS
# ===========================================================================================================
def _open_brow_kulah(name, paint, f_brow=0.60, f_low=0.10, high=1.14, ease=0.018, rows=12, n=36):
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
                r_ij = r_eq[j] * max(0.04, math.sqrt(max(0.0, 1.0 - u_top ** 1.65)))
                if f_ij <= 0.96:
                    h_hit = first_hit(c_pos, d)
                    if h_hit is not None and 0.020 < h_hit < 0.145:
                        r_ij = max(r_ij, float(h_hit) + ease_use)
            Q[i, j] = c_pos + d * r_ij
    apex = b + up * max(0.028, (high_use - 1.0) * H + ease_use * 0.6)
    Q[-1] = apex + (Q[-1] - apex) * 0.04
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _coin_veil_headpiece(gid, crown_paint, veil_paint, accent_col='jjm_skarn_brass'):
    """Tiered mukut diadem + coin-and-carnelian lattice veil with proud brow/eye-row coin bars."""
    mukut = tower_hat(f'{gid}_mukut', 0.18, lambda s: 1.05 - 0.55 * (s ** 1.25), crown_paint, f=0.60, ease=0.015, rows=11, n=36)
    fp = sculpted_faceplate(f'{gid}_coinveil', veil_paint, f_top=0.72, f_bot=-0.06, ease=0.014, jaw_narrow=0.22)
    a, b, up, bk, left = head_frame()
    fwd = -bk
    R_f, C_f = fp.P.shape[:2]
    r_eye = int(round(0.38 * (R_f - 1)))
    r_brow = int(round(0.26 * (R_f - 1)))
    c_mid = C_f // 2
    parts = [mukut, fp]
    # Dark shadowed eye-slit channels behind the coin-fringe brow bar so the veil reads richly in 3D
    for c0, c1, tag in ((max(2, c_mid - 8), max(4, c_mid - 2), 'R'), (min(C_f - 5, c_mid + 2), min(C_f - 3, c_mid + 8), 'L')):
        pts = [fp.P[r_eye, k] + fwd * 0.0040 for k in range(c0, c1 + 1)]
        parts.append(tube(f'{gid}_eyeslit_{tag}', pts, 0.0050, P('jjm_ash', 0.02, fabric='metal.iron'), n=8, rigid_joint='Head'))
    brow_pts = [fp.P[r_brow, k] + fwd * 0.0045 for k in range(max(2, c_mid - 9), min(C_f - 2, c_mid + 10), 2)]
    parts.append(tube(f'{gid}_coinbrow', brow_pts, 0.0055, P(accent_col, 0.02, fabric='metal.gold'), n=8, rigid_joint='Head'))
    parts.append(rosette(f'{gid}_wheel_boss', fp.P[r_brow, c_mid] + fwd * 0.006, fwd, left, 0.022,
                         P('jjm_emerald', 0.01, [B('top', 0.0, 0.02, 'solid', accent_col)], fabric='beads.glass'),
                         n=12, thick=0.012, rigid_joint='Head'))
    return parts


def _dorsal_pad(gid, pad_paint, z_off=-0.01, pad_size=(0.17, 0.042, 0.21), clearance=0.024):
    c_sp = spine_at(core.CHEST + z_off)
    anc = surface_out(c_sp, BACK_DIR, clearance, bvh=core.BVH_T)
    pad = blob(f'{gid}_pad', anc, pad_size, pad_paint, n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, anc


def _host_anchor(host_part, target_pt):
    pts = host_part.P.reshape(-1, 3)
    idx = int(np.argmin(np.linalg.norm(pts - np.asarray(target_pt, dtype=np.float64), axis=1)))
    return pts[idx].copy()


# ===========================================================================================================
# SHARED LOWERS, FOOTWEAR & JEWELLED CUFFS (`jjm_{s}_*`)
# ===========================================================================================================
def _build_shared_pieces(sex):
    entries = []
    # 1. Checked lagoon lungi / work-dhoti (starts strictly below waist belt at WAIST - 0.044!)
    p_lungi = P('indigo', 0.04, [
        B('bottom', 0.0, 0.06, 'solid', 'jjm_crown'),
        B('top', 0.0, 0.03, 'solid', 'jjm_rust'),
    ], [PN(0.0, 1.0, 'jjm_lungi_check', 'jjm_veil', 'indigo', 0.16)], fabric='cloth.cotton.muslin')
    entries.append(assemble_garment(
        f'jjm_{sex}_lagoon_lungi', 'Hanḍu Checked Sunboll-Cotton Work Lungi', 'legs', 'jimjam',
        [torso_tube(f'jjm_{sex}_lungi', core.WAIST - 0.044, core.KNEE - 0.05, 0.025, p_lungi,
                    n=40, rows=15, hang_from=core.WAIST - 0.044, flare=0.075)],
        legged=False,
    ))

    # 2. Ruby silk pleated Dream-Sibyl antariya skirt (below waist sash at WAIST - 0.044)
    p_ant = P('jjm_ruby', 0.03, [
        B('bottom', 0.0, 0.09, 'brocade_skirt', 'jjm_skarn_brass', 'jjm_ruby', 0.12),
    ], [PN(0.0, 1.0, 'star_stole', 'jjm_skarn_brass', 'jjm_ruby', 0.18)], fabric='cloth.silk')
    entries.append(assemble_garment(
        f'jjm_{sex}_sibyl_antariya', 'Ruby Zenana Zari-Pleated Silk Antariya', 'legs', 'jimjam',
        [torso_tube(f'jjm_{sex}_antariya', core.WAIST - 0.044, core.ANKLE + 0.07, 0.025, p_ant,
                    n=42, rows=20, hang_from=core.WAIST - 0.044, flare=0.11)],
        legged=False,
    ))

    # 3. Marl-yellow & alabaster mason/corsair shalwar breeches
    p_shalwar = P('jjm_crown', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'jjm_rust'),
    ], fabric=COTTON)
    entries.append(assemble_garment(
        f'jjm_{sex}_marl_shalwar', 'Jimjam Marl-Ochre Cotton Work Shalwar', 'legs', 'jimjam',
        trousers(f'jjm_{sex}_marl_shalwar', p_shalwar, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 4. Veil-white Sunboll-muslin astronomer/scholar churidar
    p_veil_chur = P('jjm_veil', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'jjm_skarn_brass'),
    ], fabric='cloth.cotton.muslin')
    entries.append(assemble_garment(
        f'jjm_{sex}_veil_churidar', 'Veḷḷai-White Sunboll-Muslin Tailored Churidar', 'legs', 'jimjam',
        trousers(f'jjm_{sex}_veil_churidar', p_veil_chur, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 5. Royal crimson & gold-zari court/Raja churidar
    p_royal_chur = P('jjm_rust', 0.03, [
        B('bottom', 0.0, 0.05, 'solid', 'jjm_skarn_brass'),
    ], [PN(0.0, 1.0, 'star_stole', 'jjm_skarn_brass', 'jjm_rust', 0.16)], fabric='cloth.silk')
    entries.append(assemble_garment(
        f'jjm_{sex}_royal_churidar', 'Jimjam Gold-Striped Silk Court Churidar', 'legs', 'jimjam',
        trousers(f'jjm_{sex}_royal_churidar', p_royal_chur, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # Footwear (4 native Jimjam styles — ZERO Xanadu loans!)
    entries.append(assemble_garment(
        f'jjm_{sex}_lagoon_sandals', 'Buffalo-Leather Lagoon Chappal Sandals', 'feet', 'jimjam',
        sandal(f'jjm_{sex}_lagoon_sandals', P('leather', 0.06), P('jjm_rust', 0.05), laces=1),
    ))

    p_jutti = P('jjm_ash', 0.04, [B('top', 0.0, 0.04, 'solid', 'jjm_crown')], fabric='leather.cuir_bouilli')
    entries.append(assemble_garment(
        f'jjm_{sex}_work_jutti', 'Clinker-Black Leather Work Juttis & Gaiters', 'feet', 'jimjam',
        boots(f'jjm_{sex}_work_jutti', P('soot', 0.08), p_jutti, top=0.38, ease_top=0.026),
    ))

    p_mojri = P('jjm_rust', 0.03, [
        B('top', 0.0, 0.045, 'solid', 'jjm_skarn_brass'),
    ], [PN(0.1, 0.9, 'star_stole', 'jjm_skarn_brass', 'jjm_rust', 0.14)], fabric='cloth.velvet.cut')
    entries.append(assemble_garment(
        f'jjm_{sex}_court_mojri', 'Embroidered Crimson & Gold Zari Court Mojris', 'feet', 'jimjam',
        boots(f'jjm_{sex}_court_mojri', P('jjm_skarn_brass', 0.04, fabric='metal.gold'), p_mojri, top=0.36, ease_top=0.026),
    ))

    p_paduka = P('jjm_ruby', 0.03, [
        B('top', 0.0, 0.05, 'beads', 'jjm_skarn_brass', 'jjm_ruby', 0.03),
    ], fabric='cloth.velvet.cut')
    entries.append(assemble_garment(
        f'jjm_{sex}_sibyl_paduka', 'Ruby-Velvet & Gilded Bell Zenana Padukas', 'feet', 'jimjam',
        boots(f'jjm_{sex}_sibyl_paduka', P('jjm_skarn_brass', 0.03, fabric='metal.gold'), p_paduka, top=0.34, ease_top=0.016),
    ))

    # Gloves / Bangles / Vambraces (4 styles)
    p_wraps = P('jjm_veil', 0.04, [B('top', 0.0, 0.03, 'solid', 'indigo')], fabric='cloth.cotton.muslin')
    entries.append(assemble_garment(
        f'jjm_{sex}_scribe_cuffs', 'Kaunṭavan Ink-Banded Cotton Wrist-Wraps', 'gloves', 'jimjam',
        [sleeve(f'jjm_{sex}_scuf_L', L, p_wraps, f0=0.62, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'jjm_{sex}_scuf_R', R, p_wraps, f0=0.62, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    p_bangles = P('jjm_skarn_brass', 0.02, [
        B('top', 0.0, 0.03, 'solid', 'jjm_ruby'),
        B('bottom', 0.0, 0.03, 'solid', 'jjm_emerald'),
    ], [PN(0.0, 1.0, 'coin_veil', 'jjm_skarn_brass', 'jjm_ruby', 0.10)], fabric='metal.gold')
    entries.append(assemble_garment(
        f'jjm_{sex}_sibyl_bangles', 'Stacked Gold, Ruby & Emerald Zenana Bangles', 'gloves', 'jimjam',
        [sleeve(f'jjm_{sex}_bng_L', L, p_bangles, f0=0.58, f1=0.96, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'jjm_{sex}_bng_R', R, p_bangles, f0=0.58, f1=0.96, ease=0.014, flare=0.004, rows=7, n=20)],
    ))

    p_rattan_brc = P('jjm_ash', 0.04, [B('top', 0.0, 0.035, 'solid', 'jjm_rust')],
                     [PN(0.1, 0.9, 'kavacha_scale', 'jjm_crown', 'jjm_ash', 0.14)], fabric='armor.lamellar.urushi')
    entries.append(assemble_garment(
        f'jjm_{sex}_kavacha_bracers', 'Lacquered Rattan & Clinker-Scale Bracers', 'gloves', 'jimjam',
        [sleeve(f'jjm_{sex}_kbrc_L', L, p_rattan_brc, f0=0.55, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'jjm_{sex}_kbrc_R', R, p_rattan_brc, f0=0.55, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20)],
    ))

    p_bazu = P('jjm_skarn_brass', 0.02, [B('top', 0.0, 0.04, 'solid', 'jjm_veil')],
               [PN(0.1, 0.9, 'jjm_jali_tracery', 'jjm_veil', 'jjm_skarn_brass', 0.14)], fabric='metal.gold')
    entries.append(assemble_garment(
        f'jjm_{sex}_skywatch_bazuband', 'Gilded Skywatch-Brass & Alabaster Bazuband Gauntlets', 'gloves', 'jimjam',
        full_gloves(f'jjm_{sex}_skywatch_bazuband', p_bazu, P('jjm_rust', 0.03, fabric='cloth.velvet.cut'),
                    f0=0.54, ease=0.014, knuckle_paint=P('jjm_skarn_brass', 0.02, fabric='metal.gold')),
    ))
    return entries


# ===========================================================================================================
# 12 JIMJAM TIERS (HEAD + TORSO + BACK)
# ===========================================================================================================
def _build_jimjam_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    # --- 1. peasant_lagoon ---
    gid_h = f'jjm_{sex}_lagoon_wrap'
    lw = turban(f'{gid_h}_pagri', P('jjm_crown', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'indigo')], fabric='cloth.cotton.muslin'),
                f0=0.59, f1=1.13, bulge=0.034, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Hanḍu Saffron Twisted Cotton Head-Wrap', 'head', 'jimjam', [lw], covers_hair=True))

    gid_t = f'jjm_{sex}_lagoon_tunic'
    lt_p = P('jjm_veil', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'indigo')], fabric='cloth.cotton.muslin') if sex == 'm' else \
           P('jjm_rust', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'jjm_crown')], fabric='cloth.cotton.muslin')
    lt_body = torso_tube(f'{gid_t}_vest', core.TOP, core.WAIST - 0.014, 0.020, lt_p, n=38, rows=11)
    lt_sash = crossed_sash(f'{gid_t}_gamcha', P('indigo', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'jjm_crown')], fabric='cloth.cotton.muslin'),
                           width=0.068, ease=0.027)
    lt_belt = belt_sash(f'{gid_t}_waist', core.WAIST - 0.014, core.WAIST + 0.028, P('jjm_crown', 0.04), ease=0.024)
    entries.append(assemble_garment(gid_t, 'Sunboll-Cotton Lagoon Tunic & Indigo Gamcha', 'torso', 'jimjam',
                                    [lt_body, sleeves(gid_t, 'elbow', 0.018, lt_p), lt_sash, lt_belt]))

    gid_b = f'jjm_{sex}_lagoon_pannier'
    pad, anc = _dorsal_pad(gid_b, P('totorareed', 0.05), clearance=0.024)
    pan = horn(f'{gid_b}_basket', [anc - up * 0.11 + BACK_DIR * 0.02, anc + up * 0.13 + BACK_DIR * 0.04], 0.062, 0.092,
               P('totorareed', 0.05, [B('top', 0.0, 0.04, 'solid', 'jjm_rust')], fabric='straw.reed.plaited'), n=16, rows=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Woven Reed Spice & Lotus-Boll Pannier', 'back', 'jimjam', [pad, pan]))

    # --- 2. artisan_mason ---
    gid_h = f'jjm_{sex}_mason_pagri'
    mp_t = turban(f'{gid_h}_pagri', P('jjm_rust', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'jjm_veil')], fabric=COTTON),
                  f0=0.59, f1=1.13, bulge=0.036, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Alabaster-Carver Dust Pagri & Calliper Pin', 'head', 'jimjam', [mp_t], covers_hair=True))

    gid_t = f'jjm_{sex}_mason_apron'
    kurta_p = P('jjm_rust', 0.04, [B('bottom', 0.0, 0.04, 'jjm_brick_ogee', 'jjm_crown', 'jjm_rust', 0.10)], fabric=COTTON)
    ap_p = P('jjm_ash', 0.05, [
        B('bottom', 0.0, 0.05, 'jjm_jali_tracery', 'jjm_veil', 'jjm_ash', 0.12),
    ], fabric='leather.cuir_bouilli')
    ma_body = torso_tube(f'{gid_t}_kurta', core.TOP, core.WAIST - 0.035, 0.021, kurta_p, n=40, rows=12)
    ma_vest = torso_tube(f'{gid_t}_apron', core.CHEST + 0.05, core.WAIST - 0.040, 0.029, ap_p, n=40, rows=10)
    entries.append(assemble_garment(gid_t, 'Vitrified-Clinker Carver Apron over Brick-Red Kurta', 'torso', 'jimjam',
                                    [ma_body, sleeves(gid_t, 'wrist', 0.018, kurta_p), ma_vest]))

    gid_b = f'jjm_{sex}_mason_jali_frame'
    pad, anc = _dorsal_pad(gid_b, P('jjm_ash', 0.05), clearance=0.032)
    slab = blob(f'{gid_b}_jali_slab', anc + up * 0.03 + BACK_DIR * 0.022, (0.21, 0.040, 0.27),
                P('jjm_veil', 0.03, [B('top', 0.0, 0.03, 'solid', 'jjm_skarn_brass')],
                  [PN(0.0, 1.0, 'jjm_jali_tracery', 'jjm_veil', 'jjm_ash', 0.18)], fabric='shell.nacre'),
                n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Dorsal Frame Carrying Pierced Veḷḷai-Kal Alabaster Jali', 'back', 'jimjam', [pad, slab]))

    # --- 3. almanac_factor (`Kaunṭavan` Day-Keeper & Five-Wanderer Sash) ---
    gid_h = f'jjm_{sex}_kauntavan_cap'
    kc_cap = tower_hat(f'{gid_h}_topi', 0.11, lambda s: 1.0 - 0.22 * s,
                       P('indigo', 0.03, [B('bottom', 0.0, 0.04, 'jjm_five_wanderers', 'jjm_crown', 'indigo', 0.10)], fabric='cloth.silk.slub'),
                       f=0.61, ease=0.013, rows=9, n=36)
    entries.append(assemble_garment(gid_h, 'Kaunṭavan Day-Keeper Five-Wanderer Boat-Cap', 'head', 'jimjam', [kc_cap], covers_hair=False))

    gid_t = f'jjm_{sex}_kauntavan_angarkha'
    ang_p = P('jjm_veil', 0.03, [
        B('bottom', 0.0, 0.07, 'pelagic_stole', 'jjm_skarn_brass', 'jjm_rust', 0.12),
    ], fabric='cloth.cotton.muslin')
    ang_robe = torso_tube(f'{gid_t}_angarkha', core.TOP, core.KNEE + 0.03, 0.028, ang_p, n=42, rows=20, hang_from=core.WAIST, flare=0.11)
    fw_sash = crossed_sash(f'{gid_t}_five_wanderers', P('jjm_rust', 0.03, [PN(0.0, 1.0, 'jjm_five_wanderers', 'jjm_crown', 'jjm_rust', 0.22)] if False else [],
                                                         [PN(0.0, 1.0, 'jjm_five_wanderers', 'jjm_crown', 'jjm_rust', 0.20)], fabric='cloth.silk'),
                           width=0.078, ease=0.034)
    btns = button_row(gid_t, core.CHEST + 0.04, core.WAIST + 0.04, n_buttons=4, paint=P('jjm_veil', 0.02, fabric='shell.nacre'), ease=0.030)
    entries.append(assemble_garment(gid_t, 'Kaunṭavan Sunboll-Muslin Angarkha & Five-Wanderer Sash', 'torso', 'jimjam',
                                    [ang_robe, sleeves(gid_t, 'wrist', 0.019, ang_p), fw_sash] + btns))

    gid_b = f'jjm_{sex}_kauntavan_pothi_pack'
    pad, anc = _dorsal_pad(gid_b, P('jjm_rust', 0.04), clearance=0.032)
    pothi = blob(f'{gid_b}_pothi', anc + BACK_DIR * 0.020, (0.22, 0.050, 0.13),
                 P('jjm_rust', 0.03, [B('top', 0.0, 0.03, 'solid', 'jjm_skarn_brass')],
                   [PN(0.0, 1.0, 'pelagic_stole', 'jjm_skarn_brass', 'jjm_rust', 0.14)], fabric='leather.polished'),
                 n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Palm-Leaf Almanac Pothi Case & Sundial Ring', 'back', 'jimjam', [pad, pothi]))

    # --- 4. school_eye_optician (Wanderer School of the Eye — Brass & Emerald Sighting Loupe!) ---
    gid_h = f'jjm_{sex}_eye_school_topi'
    ey_cap = _open_brow_kulah(f'{gid_h}_topi',
                              P('jjm_frost', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'jjm_skarn_brass')], fabric='cloth.silk.slub'),
                              f_brow=0.61, f_low=0.14, high=1.14, ease=0.018)
    p_brw = _host_anchor(ey_cap, a + (b - a) * 0.65 + left * 0.032 + fwd * 0.095)
    loupe = rosette(f'{gid_h}_emerald_loupe', p_brw + fwd * 0.005, fwd, left, 0.021,
                    P('jjm_emerald', 0.01, [B('top', 0.0, 0.02, 'solid', 'jjm_skarn_brass')], fabric='beads.glass'),
                    n=12, thick=0.015, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Eye-School Astronomer Topi & Emerald Sighting Loupe', 'head', 'jimjam',
                                    [ey_cap, loupe], covers_hair=True))

    gid_t = f'jjm_{sex}_eye_school_jama'
    ey_p = P('jjm_frost', 0.03, [
        B('bottom', 0.0, 0.08, 'jjm_three_wheels', 'jjm_skarn_brass', 'jjm_frost', 0.12),
        B('top', 0.0, 0.04, 'solid', 'jjm_crown'),
    ], [PN(0.0, 1.0, 'jjm_brick_spiral', 'jjm_crown', 'jjm_frost', 0.16)], fabric='cloth.silk.shot')
    ey_robe = torso_tube(f'{gid_t}_jama', core.TOP, core.KNEE + 0.02, 0.028, ey_p, n=42, rows=20, hang_from=core.WAIST, flare=0.11)
    ey_col = collar_disc(f'{gid_t}_meridian_collar', 0.090,
                         P('jjm_skarn_brass', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'jjm_emerald')], fabric='metal.gold'),
                         drop=0.070, ease=0.022)
    entries.append(assemble_garment(gid_t, 'School of the Eye Frost-Teal & Skarn-Brass Jama', 'torso', 'jimjam',
                                    [ey_robe, ey_col, sleeves(gid_t, 'wrist', 0.019, ey_p)]))

    gid_b = f'jjm_{sex}_eye_armillary_rig'
    pad, anc = _dorsal_pad(gid_b, P('jjm_skarn_brass', 0.02, fabric='metal.gold'), clearance=0.032)
    armillary = rosette(f'{gid_b}_armillary', anc + up * 0.05 + BACK_DIR * 0.020, BACK_DIR, left, 0.125,
                        P('jjm_skarn_brass', 0.02, [B('top', 0.0, 0.03, 'solid', 'jjm_emerald')], fabric='metal.gold'),
                        n=20, thick=0.022, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Skywatch-Brass Armillary Sighting Sphere', 'back', 'jimjam', [pad, armillary]))

    # --- 5. school_wheel_horologer (Wanderer School of the Thirteen-Wheel) ---
    gid_h = f'jjm_{sex}_wheel_school_pagri'
    wh_t = turban(f'{gid_h}_pagri',
                  P('jjm_ash', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'jjm_skarn_brass')],
                    [PN(0.0, 1.0, 'jjm_three_wheels', 'jjm_skarn_brass', 'jjm_rust', 0.16)], fabric='cloth.silk'),
                  f0=0.59, f1=1.10, bulge=0.038, ease=0.015)
    entries.append(assemble_garment(gid_h, 'Thirteen-Wheel School Black-and-Crimson Zari Pagri', 'head', 'jimjam', [wh_t], covers_hair=True))

    gid_t = f'jjm_{sex}_wheel_school_coat'
    wh_p = P('jjm_ash', 0.03, [
        B('bottom', 0.0, 0.08, 'star_stole', 'jjm_skarn_brass', 'jjm_rust', 0.12),
    ], [PN(0.0, 1.0, 'jjm_three_wheels', 'jjm_skarn_brass', 'jjm_ash', 0.18)], fabric='cloth.brocade.damask')
    wh_coat = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE + 0.01, 0.028, wh_p, n=42, rows=20, hang_from=core.WAIST, flare=0.11)
    wh_stole = tabard(f'{gid_t}_ephemeris_stole', core.KNEE + 0.04, core.CHEST + 0.05,
                      P('jjm_rust', 0.03, [B('bottom', 0.0, 0.05, 'solid', 'jjm_skarn_brass')],
                        [PN(0.0, 1.0, 'jjm_five_wanderers', 'jjm_skarn_brass', 'jjm_rust', 0.18)], fabric='cloth.silk'),
                      width=0.16, front=True, back=False, ease=0.036)
    entries.append(assemble_garment(gid_t, 'School of the Thirteen-Wheel Clinker & Gold-Zari Coat', 'torso', 'jimjam',
                                    [wh_coat, wh_stole, sleeves(gid_t, 'wrist', 0.019, wh_p)]))

    gid_b = f'jjm_{sex}_wheel_clepsydra'
    pad, anc = _dorsal_pad(gid_b, P('jjm_ash', 0.04), clearance=0.032)
    drum = horn(f'{gid_b}_clepsydra', [anc - up * 0.09 + BACK_DIR * 0.02, anc + up * 0.13 + BACK_DIR * 0.02], 0.052, 0.052,
                P('jjm_skarn_brass', 0.02, [B('top', 0.0, 0.04, 'jjm_three_wheels', 'jjm_ash', 'jjm_skarn_brass', 0.10)], fabric='metal.gold'),
                n=16, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Thirteen-Mark Bronze Clepsydra & Gear Drum', 'back', 'jimjam', [pad, drum]))

    # --- 6. oracle_attendant (Wanderer School of the Veil & Solstice Censer-Bearer) ---
    gid_h = f'jjm_{sex}_watcher_fillet'
    vf = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004,
                    P('jjm_veil', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'silver')], fabric='shell.nacre'), n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Carved Veḷḷai-Kal Alabaster & Silver Crescent Fillet', 'head', 'jimjam', [vf], covers_hair=False))

    gid_t = f'jjm_{sex}_watcher_robe'
    vr_p = P('jjm_twilight', 0.03, [
        B('bottom', 0.0, 0.09, 'jjm_jali_tracery', 'jjm_veil', 'jjm_twilight', 0.12),
    ], [PN(0.0, 1.0, 'pelagic_stole', 'jjm_veil', 'jjm_twilight', 0.18)], fabric='cloth.cotton.muslin')
    vr_robe = torso_tube(f'{gid_t}_robe', core.TOP, core.ANKLE + 0.07, 0.028, vr_p, n=42, rows=24, hang_from=core.WAIST, flare=0.13)
    vr_col = collar_disc(f'{gid_t}_solstice_collar', 0.100,
                         P('jjm_veil', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'jjm_skarn_brass')], fabric='shell.nacre'),
                         drop=0.074, scallop=0.06, ease=0.022)
    entries.append(assemble_garment(gid_t, 'Two-Day Veil-Watcher Gossamer Muslin & Alabaster Robe', 'torso', 'jimjam',
                                    [vr_robe, vr_col, sleeves(gid_t, 'wrist', 0.020, vr_p, ease_end=0.036, wide=True)]))

    gid_b = f'jjm_{sex}_watcher_quadrant'
    pad, anc = _dorsal_pad(gid_b, P('silver', 0.02, fabric='metal.iron'), clearance=0.032)
    quad = rosette(f'{gid_b}_quadrant', anc + up * 0.04 + BACK_DIR * 0.018, BACK_DIR, left, 0.115,
                   P('jjm_veil', 0.02, [B('top', 0.0, 0.03, 'solid', 'jjm_skarn_brass')], fabric='shell.nacre'),
                   n=18, thick=0.018, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Alabaster & Brass ±50° Veil Horizon Quadrant', 'back', 'jimjam', [pad, quad]))

    # --- 7. sibyl (Ruby Zenana Dream-Sibyl, M+F Parity!) ---
    gid_h = f'jjm_{sex}_sibyl_veil'
    sv_crown_p = P('jjm_skarn_brass', 0.02, [B('bottom', 0.0, 0.04, 'solid', 'jjm_ruby')], fabric='metal.gold')
    sv_veil_p = P('jjm_ruby', 0.03, [
        B('bottom', 0.0, 0.03, 'dentils', 'jjm_skarn_brass', 'jjm_ruby', 0.02),
    ], [PN(0.0, 1.0, 'coin_veil', 'jjm_skarn_brass', 'jjm_ruby', 0.10)], fabric='metal.gold')
    entries.append(assemble_garment(gid_h, 'Ruby Zenana Gold Mukut & Stamped-Coin Veil', 'head', 'jimjam',
                                    _coin_veil_headpiece(gid_h, sv_crown_p, sv_veil_p), covers_hair=True, covers_face=True))

    gid_t = f'jjm_{sex}_sibyl_drape'
    sd_p = P('jjm_ruby', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'jjm_skarn_brass'),
    ], [PN(0.0, 1.0, 'star_stole', 'jjm_skarn_brass', 'jjm_ruby', 0.16)], fabric='cloth.silk')
    sd_body = torso_tube(f'{gid_t}_bodice', core.TOP, core.WAIST - 0.014, 0.020, sd_p, n=40, rows=11)
    sd_sash = crossed_sash(f'{gid_t}_uttariya',
                           P('jjm_crown', 0.03, [B('bottom', 0.0, 0.03, 'coin_veil', 'jjm_skarn_brass', 'jjm_ruby', 0.08)], fabric='cloth.silk'),
                           width=0.082, ease=0.028)
    sd_pect = collar_disc(f'{gid_t}_pectoral', 0.092,
                          P('jjm_skarn_brass', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'jjm_emerald')], fabric='metal.gold'),
                          drop=0.070, ease=0.022)
    sd_belt = belt_sash(f'{gid_t}_kamarband', core.WAIST - 0.014, core.WAIST + 0.028, sv_crown_p, ease=0.024)
    entries.append(assemble_garment(gid_t, 'Ruby Zenana Silk Drape, Zari Uttariya & Emerald Pectoral', 'torso', 'jimjam',
                                    [sd_body, sd_pect, sleeves(gid_t, 'elbow', 0.018, sd_p), sd_sash, sd_belt]))

    gid_b = f'jjm_{sex}_sibyl_pallu'
    pallu = cape(f'{gid_b}_pallu', core.CROTCH + 0.06,
                 P('jjm_ruby', 0.03, [B('bottom', 0.0, 0.06, 'coin_veil', 'jjm_skarn_brass', 'jjm_ruby', 0.10)], fabric='cloth.silk'),
                 ease=0.026, flare=0.09, stiff=0.34, back_push=0.045)
    entries.append(assemble_garment(gid_b, 'Gold-Bordered Ruby Silk Zenana Pallu Mantle', 'back', 'jimjam', [pallu]))

    # --- 8. barge_corsair ---
    gid_h = f'jjm_{sex}_corsair_turban'
    ct_h = turban(f'{gid_h}_pagri',
                  P('jjm_rust', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'jjm_skarn_brass')], fabric='straw.reed.plaited'),
                  f0=0.59, f1=1.13, bulge=0.036, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Braided-Rattan & Crimson Barge-Marine Pagri', 'head', 'jimjam', [ct_h], covers_hair=True))

    gid_t = f'jjm_{sex}_corsair_kavacha'
    kv_p = P('jjm_ash', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'jjm_rust'),
        B('top', 0.0, 0.04, 'solid', 'jjm_crown'),
    ], [PN(0.0, 1.0, 'kavacha_scale', 'jjm_crown', 'jjm_rust', 0.16)], fabric='armor.lamellar.urushi')
    kv_shirt = torso_tube(f'{gid_t}_kurta', core.TOP, core.WAIST - 0.035, 0.019, P('jjm_frost', 0.04, fabric=COTTON), n=38, rows=11)
    kv_armor = torso_tube(f'{gid_t}_kavacha', core.CHEST + 0.06, core.WAIST - 0.040, 0.028, kv_p, n=42, rows=11)
    entries.append(assemble_garment(gid_t, 'Great Trough Lacquered-Rattan & Clinker-Scale Kavacha', 'torso', 'jimjam',
                                    [kv_shirt, sleeves(gid_t, 'elbow', 0.018, P('jjm_frost', 0.04, fabric=COTTON)),
                                     kv_armor, pauldron(f'{gid_t}_pL', L, kv_p), pauldron(f'{gid_t}_pR', R, kv_p)]))

    gid_b = f'jjm_{sex}_corsair_dartpack'
    pad, anc = _dorsal_pad(gid_b, kv_p, clearance=0.031)
    quiv = horn(f'{gid_b}_bamboo_quiver', [anc - left * 0.05 - up * 0.12 + BACK_DIR * 0.018, anc + left * 0.06 + up * 0.16 + BACK_DIR * 0.018],
                0.032, 0.036, P('bamboo', 0.04, [B('top', 0.0, 0.04, 'solid', 'jjm_rust')], fabric='straw.reed.plaited'),
                n=12, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'River-Bamboo Blowpipe-Dart Quiver & Grapnel', 'back', 'jimjam', [pad, quiv]))

    # --- 9. skywatch_guard ---
    gid_h = f'jjm_{sex}_skywatch_helm'
    sw_p = P('jjm_skarn_brass', 0.02, [
        B('bottom', 0.0, 0.04, 'solid', 'jjm_ash'),
    ], [PN(0.0, 1.0, 'jjm_three_wheels', 'jjm_veil', 'jjm_skarn_brass', 0.14)], fabric='metal.gold')
    sw_helm = _open_brow_kulah(f'{gid_h}_kulah', sw_p, f_brow=0.60, f_low=0.10, high=1.14, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Skywatch Radially-Fluted Skarn-Brass Kulah-Topi Helm', 'head', 'jimjam',
                                    [sw_helm], covers_hair=True))

    gid_t = f'jjm_{sex}_skywatch_coat'
    sw_coat_p = P('jjm_rust', 0.04, [
        B('bottom', 0.0, 0.07, 'kavacha_scale', 'jjm_skarn_brass', 'jjm_ash', 0.12),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'jjm_crown', 'jjm_rust', 0.18)], fabric='cloth.quilted.diamond')
    sw_coat = torso_tube(f'{gid_t}_gambeson', core.TOP, core.KNEE + 0.02, 0.029, sw_coat_p, n=42, rows=20, hang_from=core.WAIST, flare=0.11)
    sw_fur = collar_disc(f'{gid_t}_qiviut_collar', 0.092, P('jjm_veil', 0.05, fabric='fur.caribou'), drop=0.070, ease=0.023)
    sw_mirror = rosette(f'{gid_t}_sunray_mirror', chest_front(core.CHEST + 0.02, 0.033), np.array([0.0, -1.0, 0.0]), left,
                        0.055, sw_p, n=16, thick=0.016, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_t, 'Skywatch Quilted Gambeson, Bartered Qiviut Collar & Brass Mirror', 'torso', 'jimjam',
                                    [sw_coat, sw_fur, sw_mirror, sleeves(gid_t, 'wrist', 0.020, sw_coat_p),
                                     pauldron(f'{gid_t}_pL', L, sw_p), pauldron(f'{gid_t}_pR', R, sw_p)]))

    gid_b = f'jjm_{sex}_skywatch_dhal_back'
    pad, anc = _dorsal_pad(gid_b, sw_p, clearance=0.032)
    dhal = rosette(f'{gid_b}_dhal', anc + up * 0.02 + BACK_DIR * 0.020, BACK_DIR, left, 0.165,
                   P('jjm_ash', 0.03, [B('top', 0.0, 0.04, 'solid', 'jjm_skarn_brass')], fabric='metal.iron'),
                   n=22, thick=0.024, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Stowed Skywatch-Brass Three-Wheel Round Dhal', 'back', 'jimjam', [pad, dhal]))

    # --- 10. court_trendsetter (Dilihan crossover Iziz-orange piping + alabaster/emerald buttons) ---
    gid_h = f'jjm_{sex}_court_taj'
    if sex == 'm':
        ct_taj = turban(f'{gid_h}_taj',
                        P('jjm_rust', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'jjm_skarn_brass')],
                          [PN(0.0, 1.0, 'aegean_jimjam_silk', 'jjm_skarn_brass', 'jjm_rust', 0.16)], fabric='cloth.silk'),
                        f0=0.59, f1=1.10, bulge=0.038, ease=0.015)
        entries.append(assemble_garment(gid_h, 'Jimjam-Dilihan Patrician Silk Taj & Emerald Sarpech', 'head', 'jimjam', [ct_taj], covers_hair=True))
    else:
        tikka = head_rings(f'{gid_h}_headband', 0.60, 0.71, 0.004,
                           P('jjm_skarn_brass', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'jjm_emerald')], fabric='metal.gold'), n=36, rows=5)
        entries.append(assemble_garment(gid_h, 'Patrician Gold Maang-Tikka & Emerald Braid-Fillet', 'head', 'jimjam', [tikka], covers_hair=False))

    gid_t = f'jjm_{sex}_court_peshwaz'
    cp_p = P('jjm_rust', 0.03, [
        B('bottom', 0.0, 0.08, 'solid', 'jjm_iziz_pipe'),
        B('top', 0.0, 0.035, 'solid', 'jjm_iziz_pipe'),
    ], [PN(0.0, 1.0, 'aegean_jimjam_silk', 'jjm_crown', 'jjm_rust', 0.18)], fabric='cloth.brocade.damask')
    cp_robe = torso_tube(f'{gid_t}_peshwaz', core.TOP, core.KNEE - 0.02, 0.028, cp_p, n=42, rows=21, hang_from=core.WAIST, flare=0.13)
    cp_btns = button_row(gid_t, core.CHEST + 0.05, core.WAIST + 0.03, n_buttons=5,
                         paint=P('jjm_emerald', 0.01, [B('top', 0.0, 0.02, 'solid', 'jjm_veil')], fabric='beads.glass'), ease=0.030)
    entries.append(assemble_garment(gid_t, 'Dilihan-Crossover Silk Peshwaz with Iziz-Orange Piping & Alabaster-Emerald Buttons',
                                    'torso', 'jimjam', [cp_robe, sleeves(gid_t, 'wrist', 0.019, cp_p)] + cp_btns))

    gid_b = f'jjm_{sex}_court_dupatta'
    dup = cape(f'{gid_b}_dupatta', core.CROTCH + 0.06,
               P('jjm_crown', 0.03, [B('bottom', 0.0, 0.05, 'coin_veil', 'jjm_skarn_brass', 'jjm_iziz_pipe', 0.09)], fabric='cloth.silk'),
               ease=0.027, flare=0.09, stiff=0.35, back_push=0.050)
    entries.append(assemble_garment(gid_b, 'Coin-Edged Saffron & Iziz-Orange Court Dupatta', 'back', 'jimjam', [dup]))

    # --- 11. grand_dream_sibyl (`important_npc`) ---
    gid_h = f'jjm_{sex}_grandsibyl_veil'
    gs_c_p = P('jjm_skarn_brass', 0.02, [B('top', 0.0, 0.05, 'solid', 'jjm_emerald')], fabric='metal.gold')
    gs_v_p = P('jjm_twilight', 0.03, [
        B('bottom', 0.0, 0.04, 'dentils', 'jjm_skarn_brass', 'jjm_ruby', 0.02),
    ], [PN(0.0, 1.0, 'coin_veil', 'jjm_skarn_brass', 'jjm_twilight', 0.10)], fabric='metal.gold')
    entries.append(assemble_garment(gid_h, 'Grand Dream-Sibyl Double-Dark Mukut & Gold-Coin Veil', 'head', 'jimjam',
                                    _coin_veil_headpiece(gid_h, gs_c_p, gs_v_p), covers_hair=True, covers_face=True))

    gid_t = f'jjm_{sex}_grandsibyl_robe'
    gs_r_p = P('jjm_twilight', 0.03, [
        B('bottom', 0.0, 0.10, 'brocade_skirt', 'jjm_skarn_brass', 'jjm_ruby', 0.12),
    ], [PN(0.0, 1.0, 'jjm_three_wheels', 'jjm_skarn_brass', 'jjm_twilight', 0.18)], fabric='cloth.brocade.damask')
    gs_robe = torso_tube(f'{gid_t}_robe', core.TOP, core.ANKLE + 0.06, 0.029, gs_r_p, n=44, rows=24, hang_from=core.WAIST, flare=0.14)
    gs_sash = crossed_sash(f'{gid_t}_wanderer_stole',
                           P('jjm_ruby', 0.03, [], [PN(0.0, 1.0, 'jjm_five_wanderers', 'jjm_skarn_brass', 'jjm_ruby', 0.20)], fabric='cloth.silk'),
                           width=0.084, ease=0.035)
    entries.append(assemble_garment(gid_t, 'Grand Dream-Sibyl Double-Dark Silk & Five-Wanderer Oracle Robe', 'torso', 'jimjam',
                                    [gs_robe, collar_disc(f'{gid_t}_col', 0.098, gs_c_p, drop=0.074, ease=0.023),
                                     sleeves(gid_t, 'wrist', 0.020, gs_r_p), gs_sash]))

    gid_b = f'jjm_{sex}_grandsibyl_shawl'
    gs_shawl = cape(f'{gid_b}_shawl', core.CROTCH + 0.05,
                    P('jjm_twilight', 0.03, [B('bottom', 0.0, 0.06, 'coin_veil', 'jjm_skarn_brass', 'jjm_ruby', 0.10)], fabric='cloth.silk'),
                    ease=0.028, flare=0.10, stiff=0.36, back_push=0.055)
    entries.append(assemble_garment(gid_b, 'Double-Dark Indigo & Gold-Coin Ceremonial Shawl', 'back', 'jimjam', [gs_shawl]))

    # --- 12. raja_concordance (`important_npc` — The Raja of Jimjam!) ---
    gid_h = f'jjm_{sex}_raja_crown'
    rj_p = P('jjm_rust', 0.02, [
        B('bottom', 0.0, 0.05, 'solid', 'jjm_skarn_brass'),
    ], [PN(0.0, 1.0, 'star_stole', 'jjm_skarn_brass', 'jjm_rust', 0.16)], fabric='cloth.silk')
    rj_turb = turban(f'{gid_h}_royal_pagri', rj_p, f0=0.58, f1=1.14, bulge=0.042, ease=0.016)
    p_sarp = _host_anchor(rj_turb, a + (b - a) * 0.80 + fwd * 0.11)
    sarpech = rosette(f'{gid_h}_three_wheel_sarpech', p_sarp + fwd * 0.006, fwd, left, 0.032,
                      P('jjm_skarn_brass', 0.01, [B('top', 0.0, 0.02, 'solid', 'jjm_emerald')], fabric='metal.gold'),
                      n=16, thick=0.016, rigid_joint='Head')
    plume = horn(f'{gid_h}_alabaster_plume', [p_sarp + up * 0.01, p_sarp + up * 0.14 - fwd * 0.02], 0.018, 0.005,
                 P('jjm_veil', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'jjm_skarn_brass')], fabric='shell.nacre'),
                 n=10, rows=6, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Raja of Concordance Three-Wheel Sarpech & Royal Zari Crown', 'head', 'jimjam',
                                    [rj_turb, sarpech, plume], covers_hair=True))

    gid_t = f'jjm_{sex}_raja_jama'
    rj_t_p = P('jjm_rust', 0.03, [
        B('bottom', 0.0, 0.10, 'brocade_skirt', 'jjm_skarn_brass', 'jjm_ash', 0.12),
        B('top', 0.0, 0.04, 'solid', 'jjm_skarn_brass'),
    ], [PN(0.0, 1.0, 'jjm_three_wheels', 'jjm_skarn_brass', 'jjm_rust', 0.18)], fabric='cloth.brocade.damask')
    rj_jama = torso_tube(f'{gid_t}_jama', core.TOP, core.KNEE - 0.03, 0.029, rj_t_p, n=44, rows=22, hang_from=core.WAIST, flare=0.14)
    rj_pect = collar_disc(f'{gid_t}_sunray_pectoral', 0.108,
                          P('jjm_skarn_brass', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'jjm_emerald')], fabric='metal.gold'),
                          drop=0.078, ease=0.023)
    rj_btns = button_row(gid_t, core.CHEST + 0.03, core.WAIST + 0.02, n_buttons=5,
                         paint=P('jjm_veil', 0.02, [B('top', 0.0, 0.02, 'solid', 'jjm_emerald')], fabric='shell.nacre'), ease=0.032)
    entries.append(assemble_garment(gid_t, 'Raja of Jimjam Three-Wheel Zari State Jama & Sunray Pectoral', 'torso', 'jimjam',
                                    [rj_jama, rj_pect, sleeves(gid_t, 'wrist', 0.020, rj_t_p),
                                     pauldron(f'{gid_t}_pL', L, P('jjm_skarn_brass', 0.02, fabric='metal.gold')),
                                     pauldron(f'{gid_t}_pR', R, P('jjm_skarn_brass', 0.02, fabric='metal.gold'))] + rj_btns))

    gid_b = f'jjm_{sex}_raja_mantle'
    rj_cape = cape(f'{gid_b}_mantle', core.CROTCH + 0.05,
                   P('jjm_rust', 0.03, [B('bottom', 0.0, 0.07, 'brocade_skirt', 'jjm_skarn_brass', 'jjm_ash', 0.12)],
                     [PN(0.0, 1.0, 'jjm_three_wheels', 'jjm_skarn_brass', 'jjm_rust', 0.18)], fabric='cloth.brocade.damask'),
                   ease=0.028, flare=0.10, stiff=0.36, back_push=0.058)
    entries.append(assemble_garment(gid_b, 'Raja of Concordance Crimson & Three-Wheel Gold State Mantle', 'back', 'jimjam', [rj_cape]))

    return entries


def _outfits_for_sex(sex):
    return {
        'peasant_lagoon': {
            'head': f'jjm_{sex}_lagoon_wrap',
            'torso': f'jjm_{sex}_lagoon_tunic',
            'gloves': f'jjm_{sex}_scribe_cuffs',
            'legs': f'jjm_{sex}_lagoon_lungi',
            'feet': f'jjm_{sex}_lagoon_sandals',
            'back': f'jjm_{sex}_lagoon_pannier',
        },
        'artisan_mason': {
            'head': f'jjm_{sex}_mason_pagri',
            'torso': f'jjm_{sex}_mason_apron',
            'gloves': f'jjm_{sex}_scribe_cuffs',
            'legs': f'jjm_{sex}_marl_shalwar',
            'feet': f'jjm_{sex}_work_jutti',
            'back': f'jjm_{sex}_mason_jali_frame',
        },
        'almanac_factor': {
            'head': f'jjm_{sex}_kauntavan_cap',
            'torso': f'jjm_{sex}_kauntavan_angarkha',
            'gloves': f'jjm_{sex}_scribe_cuffs',
            'legs': f'jjm_{sex}_veil_churidar',
            'feet': f'jjm_{sex}_court_mojri',
            'back': f'jjm_{sex}_kauntavan_pothi_pack',
        },
        'school_eye_optician': {
            'head': f'jjm_{sex}_eye_school_topi',
            'torso': f'jjm_{sex}_eye_school_jama',
            'gloves': f'jjm_{sex}_skywatch_bazuband',
            'legs': f'jjm_{sex}_veil_churidar',
            'feet': f'jjm_{sex}_court_mojri',
            'back': f'jjm_{sex}_eye_armillary_rig',
        },
        'school_wheel_horologer': {
            'head': f'jjm_{sex}_wheel_school_pagri',
            'torso': f'jjm_{sex}_wheel_school_coat',
            'gloves': f'jjm_{sex}_scribe_cuffs',
            'legs': f'jjm_{sex}_marl_shalwar',
            'feet': f'jjm_{sex}_work_jutti',
            'back': f'jjm_{sex}_wheel_clepsydra',
        },
        'oracle_attendant': {
            'head': f'jjm_{sex}_watcher_fillet',
            'torso': f'jjm_{sex}_watcher_robe',
            'gloves': f'jjm_{sex}_sibyl_bangles',
            'legs': f'jjm_{sex}_veil_churidar',
            'feet': f'jjm_{sex}_lagoon_sandals',
            'back': f'jjm_{sex}_watcher_quadrant',
        },
        'sibyl': {
            'head': f'jjm_{sex}_sibyl_veil',
            'torso': f'jjm_{sex}_sibyl_drape',
            'gloves': f'jjm_{sex}_sibyl_bangles',
            'legs': f'jjm_{sex}_sibyl_antariya',
            'feet': f'jjm_{sex}_sibyl_paduka',
            'back': f'jjm_{sex}_sibyl_pallu',
        },
        'barge_corsair': {
            'head': f'jjm_{sex}_corsair_turban',
            'torso': f'jjm_{sex}_corsair_kavacha',
            'gloves': f'jjm_{sex}_kavacha_bracers',
            'legs': f'jjm_{sex}_marl_shalwar',
            'feet': f'jjm_{sex}_work_jutti',
            'back': f'jjm_{sex}_corsair_dartpack',
        },
        'skywatch_guard': {
            'head': f'jjm_{sex}_skywatch_helm',
            'torso': f'jjm_{sex}_skywatch_coat',
            'gloves': f'jjm_{sex}_skywatch_bazuband',
            'legs': f'jjm_{sex}_royal_churidar',
            'feet': f'jjm_{sex}_work_jutti',
            'back': f'jjm_{sex}_skywatch_dhal_back',
        },
        'court_trendsetter': {
            'head': f'jjm_{sex}_court_taj',
            'torso': f'jjm_{sex}_court_peshwaz',
            'gloves': f'jjm_{sex}_sibyl_bangles',
            'legs': f'jjm_{sex}_royal_churidar',
            'feet': f'jjm_{sex}_court_mojri',
            'back': f'jjm_{sex}_court_dupatta',
        },
        'grand_dream_sibyl': {
            'head': f'jjm_{sex}_grandsibyl_veil',
            'torso': f'jjm_{sex}_grandsibyl_robe',
            'gloves': f'jjm_{sex}_sibyl_bangles',
            'legs': f'jjm_{sex}_royal_churidar',
            'feet': f'jjm_{sex}_sibyl_paduka',
            'back': f'jjm_{sex}_grandsibyl_shawl',
            'type': 'important_npc',
        },
        'raja_concordance': {
            'head': f'jjm_{sex}_raja_crown',
            'torso': f'jjm_{sex}_raja_jama',
            'gloves': f'jjm_{sex}_skywatch_bazuband',
            'legs': f'jjm_{sex}_royal_churidar',
            'feet': f'jjm_{sex}_court_mojri',
            'back': f'jjm_{sex}_raja_mantle',
            'type': 'important_npc',
        },
    }


def build_jimjam_peoples_entry():
    return {
        'id': 'jimjam',
        'name': 'Jimjam',
        'note': (
            "The Kingdom of Jimjam (Jamṭōkku) on the Great Trough slackwater rhythmite plains: zero-ruin Rust-red & Crown-yellow "
            "brick, vitrified Ash clinker, Veḷḷai-kal white alabaster jalis, Sunboll muslin, Skywatch (+3,745 m) skarn-brass, "
            "coin-veiled Ruby Zenana Dream-Sibyls, Kaunṭavan Day-Keepers of the Five-Wanderer Astronomical Schools, and "
            "the Raja of Concordance under the sign of Three Interlocking Gold Wheels (LORE.md §6.16; PROPOSAL-ARDENT-JIMJAM.md)."
        ),
        'ancestry': {'african': [0.15, 0.35], 'asian': [0.10, 0.30], 'caucasian': [0.40, 0.60]},
        'skin': ['#c0926b', '#a0744f', '#80583a', '#64432c'],
        'hair': ['#0f0c0b', '#1a1511', '#271f18'],
        'eyes': ['#2a1a10', '#3b2414', '#5a3a22'],
        'grey': 0.50,
        'beard': 0.50,
        'styles': {
            'male': ['short02', 'long01', 'ponytail01', 'Short_Hair_B'],
            'female': ['braid01', 'long01', 'rehmanpolanski_hair_bun_brown', 'elvs_reverse_french_braid_bun'],
        },
        'tiers': JIMJAM_TIER_SHARES,
        'tier_labels': JIMJAM_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_jimjam_kit():
    entries = []
    with _jjm_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_shared_pieces(sex))
            entries.extend(_build_jimjam_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_jimjam_kit()
    peoples_entry = build_jimjam_peoples_entry()
    manifest_path = CULTURES_DIR / 'jimjam_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'jimjam',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Jimjam pieces ({n_m} male, {n_f} female) across 12 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
