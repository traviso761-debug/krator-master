"""Bandits & Named Outlaw Confederacies Wardrobe Kit (`bandits` — 16 Tiers).

Builds all 16 canonical regional & named-confederacy outlaw tiers (`mpfb_male` `bdt_m_*`
& `mpfb_female` `bdt_f_*` — 100% procedural MPFB parity, manifest-only mode):

  Regional Pools (12 tiers across 4 barometric/frontier zones):
   1. `db_hulk_cutter`          (`0.065`, `dam_basins`)       — Boatmurder Hulk-Cutter (ship-canvas duster, primer pauldron, prybar coil)
   2. `db_aral_salt_stalker`    (`0.065`, `dam_basins`)       — Aral Dry-Sea Alkali Stalker (alkali-veil hood, sailcloth poncho, canteens)
   3. `db_matok_wrecker_boss`   (`0.055`, `dam_basins`)       — Matok Container-Hulk Wrecker Boss (hazard-plate brigandine, tricorn, grapnel)
   4. `ac_dune_ambusher`        (`0.065`, `arid_corridors`)   — Catch & Shade Indigo-Litham Dune Ambusher (litham veil, goat-hair abaya)
   5. `ac_camel_jezailchi`      (`0.065`, `arid_corridors`)   — Mid-Basin Camel Jezailchi (glare-slit turban, cartridge caftan, firing-fork)
   6. `ac_oasis_emir_renegade`  (`0.055`, `arid_corridors`)   — Renegade Oasis Plunder-Hetman (spiked agal helm, looted suzani jubba)
   7. `ih_broken_stair_footpad` (`0.065`, `imperial_highways`)— Broken-Stair Highwayman (slouch hat, crimson mask, oilskin cape-coat)
   8. `ih_legion_deserter`      (`0.065`, `imperial_highways`)— Defaced-Lorica Legion Deserter (dented galea, lime-slashed lorica, sagum)
   9. `ih_boiling_bay_wrecker`  (`0.055`, `imperial_highways`)— Headland False-Beacon Wrecker (tarred sou'wester, looted brocade over smock)
  10. `hp_fellgang_reiver`      (`0.065`, `highland_passes`)  — Spiked-Pot Fell-Reiver (kettle-pot helm, lime handprint harness, trews)
  11. `hp_godsgate_toll_taker`  (`0.065`, `highland_passes`)  — Godsgate Breath-Salt Toll-Brigand (respirator hood, lamellar gambeson)
  12. `hp_crag_warlord`         (`0.055`, `highland_passes`)  — High-Pass Crag Warlord (yak-horn pelt crown, blackened hauberk, war-cape)

  Signature Named Outlaw Confederacies (`BANDITS-PIRATES-BOUNTIES-SCOPE.md` §2 — 4 tiers):
  13. `bf_nazar_chainbreaker`   (`0.065`, `bf03_chainbreakers`)— BF-03 Nazar Maroon Chain-Breaker (filed iron neck-shackle & inverted sun-plate)
  14. `bf_retort_raider`        (`0.065`, `bf06_glasseaters`)  — BF-06 Badland Retort-Raider (acid/naphtha glass-grenadier & alembic pack)
  15. `bf_fume_gang`            (`0.065`, `bf09_fumegangs`)    — BF-09 Siphon-Pit Fume-Gang (oil-soaked Cthonos gas-mask & biogel scrubber)
  16. `bf_unsacrificed`         (`0.065`, `bf10_unsacrificed`) — BF-10 The Unsacrificed (painted solstice-altar fugitive in inverted purple mask)

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/bandits.py
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
    torso_tube, collar, collar_disc, cape, tabard, crossed_sash, pauldron, neck_ring,
)
from garments.types.armor import (
    cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_rings, sculpted_faceplate, hood, brim, turban, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, tube, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

BANDIT_COLORS = {
    'bdt_hullprimer':   (0.267, 0.022, 0.013),
    'bdt_oilskin':      (0.038, 0.035, 0.023),
    'bdt_alkalisalt':   (0.695, 0.653, 0.568),
    'bdt_lithamindigo': (0.008, 0.017, 0.060),
    'bdt_tyrerubber':   (0.012, 0.012, 0.011),
    'bdt_limedaub':     (0.710, 0.685, 0.610),
    'bdt_naphthagreen': (0.120, 0.420, 0.160),
    'bdt_crudeoil':     (0.018, 0.016, 0.014),
    'bdt_vothpurple':   (0.110, 0.025, 0.165),
    'bdt_maroonred':    (0.320, 0.030, 0.035),
    'bdt_souwester':    (0.560, 0.310, 0.035),
}
for _k, _v in BANDIT_COLORS.items():
    C.setdefault(_k, _v)

BANDIT_TIER_SHARES = [
    ['db_hulk_cutter', 0.065],
    ['db_aral_salt_stalker', 0.065],
    ['db_matok_wrecker_boss', 0.055],
    ['ac_dune_ambusher', 0.065],
    ['ac_camel_jezailchi', 0.065],
    ['ac_oasis_emir_renegade', 0.055],
    ['ih_broken_stair_footpad', 0.065],
    ['ih_legion_deserter', 0.065],
    ['ih_boiling_bay_wrecker', 0.055],
    ['hp_fellgang_reiver', 0.065],
    ['hp_godsgate_toll_taker', 0.065],
    ['hp_crag_warlord', 0.055],
    ['bf_nazar_chainbreaker', 0.065],
    ['bf_retort_raider', 0.065],
    ['bf_fume_gang', 0.065],
    ['bf_unsacrificed', 0.065],
]

BANDIT_TIER_LABELS = {
    'db_hulk_cutter': 'Boatmurder Dry-Sea Hulk-Cutter (Dam Basins)',
    'db_aral_salt_stalker': 'Aral Alkali-Pan Salt-Stalker (Dam Basins)',
    'db_matok_wrecker_boss': 'Matok Container-Brigandine Wrecker Boss (Dam Basins)',
    'ac_dune_ambusher': 'Indigo-Litham Dune Ambusher (Arid Corridors)',
    'ac_camel_jezailchi': 'Mid-Basin Camel Jezailchi Sharpshooter (Arid Corridors)',
    'ac_oasis_emir_renegade': 'Renegade Oasis Plunder-Hetman (Arid Corridors)',
    'ih_broken_stair_footpad': 'Broken-Stair Oilskin Highwayman (Imperial Highways)',
    'ih_legion_deserter': 'Slashed-Lorica Legion Deserter (Imperial Highways)',
    'ih_boiling_bay_wrecker': 'Headland False-Beacon Wrecker (Imperial Highways)',
    'hp_fellgang_reiver': 'Spiked-Pot Highland Pass Reiver (Highland Passes)',
    'hp_godsgate_toll_taker': 'Godsgate Breath-Salt Toll-Brigand (Highland Passes)',
    'hp_crag_warlord': 'High-Pass Horned Crag Warlord (Highland Passes)',
    'bf_nazar_chainbreaker': 'BF-03 Nazar Maroon Chain-Breaker (Broken Neck-Shackles)',
    'bf_retort_raider': 'BF-06 Glass-Eater Alchemical Retort-Raider',
    'bf_fume_gang': 'BF-09 Siphon-Pit Fume-Gang Gas-Mask Raider',
    'bf_unsacrificed': 'BF-10 The Unsacrificed (Painted Solstice-Altar Fugitive)',
}

_PAT_DIR = REPO_ROOT / 'core' / 'materials' / 'patterns'
_BDT_TEX_FILES = {
    'bdt_shipbreaker': _PAT_DIR / 'bandits' / 'shipbreaker-riveted-patchwork' / 'albedo.jpg',
    'bdt_mudcloth':    _PAT_DIR / 'bandits' / 'desert-bandolier-mudcloth' / 'albedo.jpg',
    'bdt_alkali':      _PAT_DIR / 'desert-bandits' / 'stalker-alkali-patchwork' / 'albedo.jpg',
    'bdt_primer':      _PAT_DIR / 'port' / 'primer' / 'albedo.jpg',
    'bdt_hazard':      _PAT_DIR / 'port' / 'hazard' / 'albedo.jpg',
    'bdt_container':   _PAT_DIR / 'common' / 'container-red' / 'albedo.jpg',
    'bdt_sail':        _PAT_DIR / 'common' / 'sail-band' / 'albedo.jpg',
    'bdt_grime':       _PAT_DIR / 'common' / 'grime-streaks' / 'albedo.jpg',
    'bdt_suzani':      _PAT_DIR / 'common' / 'suzani-roundels' / 'albedo.jpg',
    'bdt_daub':        _PAT_DIR / 'fellgang' / 'daub' / 'albedo.jpg',
}
_BDT_TEX_CACHE = {}


def _sample_disk_sheet(key, w, h, fg, bg, blend=0.28):
    if key not in _BDT_TEX_CACHE:
        arr = None
        p = paint_mod._resolve_lfs(_BDT_TEX_FILES[key])
        if p.exists() and p.stat().st_size > 500:
            try:
                im = Image.open(p).convert('RGB')
                px = np.asarray(im, dtype=np.float32) / 255.0
                arr = np.power(np.clip(px, 0.0, 1.0), 2.2)
            except Exception:
                arr = None
        _BDT_TEX_CACHE[key] = arr
    src = _BDT_TEX_CACHE[key]
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


def _bdt_defaced_sun(w, h, fg, bg):
    """Broken imperial sun ring violently crossed out by two ragged white-lime diagonal slashes."""
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = ((xx + 0.5) / max(w, 1) * 2.0) % 1.0 - 0.5
    v = (yy + 0.5) / max(h, 1) - 0.5
    r = np.hypot(u, v)
    ang = np.arctan2(v, u)
    rays = (r >= 0.16) & (r <= 0.34) & (np.cos(ang * 12.0) > 0.55)
    ring = np.abs(r - 0.18) < 0.038
    img[rays | ring] = C['gold']
    slash1 = (np.abs(v - 0.85 * u) < 0.055) & (np.abs(u) < 0.40)
    slash2 = (np.abs(v + 0.78 * u) < 0.055) & (np.abs(u) < 0.40)
    img[slash1 | slash2] = fg
    return np.clip(img, 0.0, 1.0)


def _bdt_inverted_sun(w, h, fg, bg):
    """Inverted Vothic/Imperial sun-and-step emblem worn upside-down by BF-03 & BF-10 rebels."""
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = ((xx + 0.5) / max(w, 1) * 2.0) % 1.0 - 0.5
    v = (yy + 0.5) / max(h, 1) - 0.5
    # Inverted stepped triangle pointing DOWN (upside-down altar/sun crest)
    inv_tri = (v > -0.25) & (v < 0.32) & (np.abs(u) < (0.34 - (v + 0.25) * 0.52))
    inner_cut = (v > -0.16) & (v < 0.18) & (np.abs(u) < (0.20 - (v + 0.16) * 0.48))
    slash = (np.abs(v) < 0.045) & (np.abs(u) < 0.38)
    img[inv_tri & ~inner_cut] = fg
    img[slash] = C['bdt_maroonred']
    return np.clip(img, 0.0, 1.0)


def _bdt_desert_weave(w, h, fg, bg):
    """Geometric desert nomad trim (non-exclusive outlaw caravan weave)."""
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = ((xx + 0.5) / max(w, 1) * 8.0) % 1.0 - 0.5
    v = (yy + 0.5) / max(h, 1) - 0.5
    loz = np.abs(np.abs(u) + np.abs(v) - 0.32) < 0.075
    rail = np.abs(v) > 0.39
    dot = (np.abs(u) < 0.09) & (np.abs(v) < 0.09)
    img[loz | rail | dot] = fg
    return np.clip(img, 0.0, 1.0)


@contextmanager
def _bandit_motif_ctx():
    orig = paint_mod.motif

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in _BDT_TEX_FILES:
            return _sample_disk_sheet(style, w, h, fg, bg)
        if style == 'bdt_defaced_sun':
            return _bdt_defaced_sun(w, h, fg, bg)
        if style == 'bdt_inverted_sun':
            return _bdt_inverted_sun(w, h, fg, bg)
        if style == 'bdt_desert_weave':
            return _bdt_desert_weave(w, h, fg, bg)
        return orig(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched
    try:
        yield
    finally:
        paint_mod.motif = orig


# ===========================================================================================================
# SHARED GEOMETRY HELPERS (100% Pitfall-Checked)
# ===========================================================================================================
def _open_brow_dome(name, paint, f_brow=0.63, f_low=0.08, high=1.14, ease=0.018, rows=12, n=36):
    a, b, up, bk, left = head_frame()
    high_eff = max(float(high), 1.13)
    ease_eff = max(float(ease), 0.018)
    angles = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angles]
    f_rim = np.full(n, float(f_low), dtype=np.float64)
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
        u = i / float(max(rows - 1, 1))
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
    apex = a + (b - a) * high_eff + up * 0.008
    if float(np.dot(apex - b, up)) < 0.028:
        apex = b + up * 0.028
    Q[-1] = apex + (Q[-1] - apex) * 0.05
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _faceplate_with_slits(gid, mask_paint, bar_paint=None, lens_paint=None):
    fp = sculpted_faceplate(f'{gid}_mask', mask_paint, f_top=0.74, f_bot=-0.05, ease=0.013, jaw_narrow=0.30)
    a, b, up, bk, left = head_frame()
    fwd = -bk
    R_f, C_f = fp.P.shape[:2]
    r_eye = int(round(0.38 * (R_f - 1)))
    r_brow = int(round(0.28 * (R_f - 1)))
    c_mid = C_f // 2
    lp = lens_paint or P('soot', 0.02, fabric='metal.iron')
    bp = bar_paint or P('brass', 0.03, fabric='metal.bronze')
    parts = [fp]
    for c0, c1, tag in ((max(2, c_mid - 8), max(4, c_mid - 2), 'R'), (min(C_f - 5, c_mid + 2), min(C_f - 3, c_mid + 8), 'L')):
        pts = [fp.P[r_eye, k] + fwd * 0.0044 for k in range(c0, c1 + 1)]
        parts.append(tube(f'{gid}_slit_{tag}', pts, 0.0054, lp, n=8, rigid_joint='Head'))
    brow_pts = [fp.P[r_brow, k] + fwd * 0.0042 for k in range(max(2, c_mid - 9), min(C_f - 2, c_mid + 10), 2)]
    parts.append(tube(f'{gid}_brow', brow_pts, 0.0050, bp, n=8, rigid_joint='Head'))
    nose_pts = [fp.P[r, c_mid] + fwd * 0.0044 for r in range(r_brow, min(R_f - 2, r_brow + 7))]
    parts.append(tube(f'{gid}_nose', nose_pts, 0.0048, bp, n=8, rigid_joint='Head'))
    return fp, parts


def _dorsal_pad(gid, pad_paint, z_off=-0.01, pad_size=(0.17, 0.044, 0.21), clearance=0.026):
    c_sp = spine_at(core.CHEST + z_off)
    anc = surface_out(c_sp, BACK_DIR, clearance, bvh=core.BVH_T)
    pad = blob(f'{gid}_pad', anc, pad_size, pad_paint, n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, anc


def _host_anchor(host_part, target_pt):
    if isinstance(host_part, (list, tuple)):
        pts = np.vstack([p.P.reshape(-1, 3) for p in host_part])
    else:
        pts = host_part.P.reshape(-1, 3)
    idx = int(np.argmin(np.linalg.norm(pts - np.asarray(target_pt, dtype=np.float64), axis=1)))
    return pts[idx].copy()


# ===========================================================================================================
# SHARED / REUSABLE LOWERS, FOOTWEAR & GLOVES (`bdt_{s}_*`)
# ===========================================================================================================
def _build_shared_pieces(sex):
    entries = []

    # 1. Bilge & salvage oilskin trousers (tailored ease=0.014, bag=0.008 so mid-thigh dusters never clip!)
    p_bilge = P('bdt_oilskin', 0.06, [
        B('bottom', 0.0, 0.05, 'stripes', 'bdt_hullprimer', 'bdt_oilskin', 0.08),
    ], fabric='cloth.canvas.oiled')
    entries.append(assemble_garment(
        f'bdt_{sex}_bilge_trousers', 'Greased Ship-Canvas Bilge Trousers', 'legs', 'bandits',
        trousers(f'bdt_{sex}_bilge_trousers', p_bilge, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 2. Alkali-dusted desert & dry-sea breeches
    p_alkali = P('bdt_alkalisalt', 0.06, [
        B('bottom', 0.0, 0.05, 'bdt_desert_weave', 'bdt_lithamindigo', 'bdt_alkalisalt', 0.10),
    ], fabric='cloth.oiled.alkali')
    entries.append(assemble_garment(
        f'bdt_{sex}_alkali_breeches', 'Alkali-Bleached Desert & Dry-Sea Breeches', 'legs', 'bandits',
        trousers(f'bdt_{sex}_alkali_breeches', p_alkali, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 3. Plundered suzani silk shalwar breeches
    p_suz = P('maroon', 0.04, [
        B('bottom', 0.0, 0.06, 'bdt_suzani', 'gold', 'maroon', 0.12),
    ], [PN(0.0, 1.0, 'bdt_suzani', 'saffron', 'maroon', 0.22)], fabric='cloth.silk.slub')
    entries.append(assemble_garment(
        f'bdt_{sex}_silk_shalwar', 'Plundered Caravan-Silk Riding Breeches', 'legs', 'bandits',
        trousers(f'bdt_{sex}_silk_shalwar', p_suz, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 4. Broken-Stair highwayman riding breeches
    p_ride = P('charcoal', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'leather'),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(
        f'bdt_{sex}_riding_breeches', 'Broken-Stair Buckskin Riding Breeches', 'legs', 'bandits',
        trousers(f'bdt_{sex}_riding_breeches', p_ride, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 5. Highland checked fell-trews
    p_trews = P('umber', 0.05, [
        B('bottom', 0.0, 0.05, 'diamonds', 'madder', 'umber', 0.10),
    ], [PN(0.0, 1.0, 'diamonds', 'madder', 'umber', 0.18)], fabric=WOOL)
    entries.append(assemble_garment(
        f'bdt_{sex}_fell_trews', 'Highland Pass Checked Wool Trews', 'legs', 'bandits',
        trousers(f'bdt_{sex}_fell_trews', p_trews, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 6. Tattered legion / maroon pteruges war-kilt (starts cleanly at WAIST - 0.044!)
    p_pter = P('leather', 0.05, [
        B('bottom', 0.0, 0.06, 'stripes', 'bdt_maroonred', 'bdt_limedaub', 0.10),
        B('top', 0.0, 0.03, 'solid', 'bronze'),
    ], [PN(0.0, 1.0, 'stripes', 'leather', 'bdt_maroonred', 0.14)], fabric='leather.pteruges.studded')
    entries.append(assemble_garment(
        f'bdt_{sex}_pteruges_kilt', 'Tattered Auxilia Pteruges & Hinged Bronze Tassets', 'legs', 'bandits',
        [torso_tube(f'bdt_{sex}_pter_kilt', core.WAIST - 0.044, core.KNEE + 0.05, 0.025, p_pter,
                    n=40, rows=14, hang_from=core.WAIST - 0.044, flare=0.080)]
        + hinged_tassets(f'bdt_{sex}_pter_htass', P('bronze', 0.04, fabric='metal.bronze'),
                         trim_paint=P('iron', 0.04, fabric='metal.iron'), lames=3, ease=0.028),
        legged=False,
    ))

    # 7. Solstice fugitive ragged purple-and-ash kilt (for BF-10 The Unsacrificed)
    p_sols = P('bdt_vothpurple', 0.05, [
        B('bottom', 0.0, 0.07, 'bdt_inverted_sun', 'bdt_limedaub', 'bdt_vothpurple', 0.14),
    ], fabric=COTTON)
    entries.append(assemble_garment(
        f'bdt_{sex}_solstice_ragged_kilt', 'Torn Blood-Reed Purple Solstice-Altar Kilt', 'legs', 'bandits',
        [torso_tube(f'bdt_{sex}_sols_kilt', core.WAIST - 0.044, core.KNEE + 0.04, 0.025, p_sols,
                    n=40, rows=14, hang_from=core.WAIST - 0.044, flare=0.082)],
        legged=False,
    ))

    # --- Footwear (6 styles: 4 trouser-paired boots with ease_top=0.024 + 2 open sandals with guard=False) ---
    p_tyre = P('bdt_tyrerubber', 0.06, [B('top', 0.0, 0.04, 'solid', 'bdt_hullprimer')], fabric='rubber.tyre')
    entries.append(assemble_garment(
        f'bdt_{sex}_tyre_boots', 'Vulcanized Tyre-Tread Salvage Boots', 'feet', 'bandits',
        boots(f'bdt_{sex}_tyre_boots', P('bdt_tyrerubber', 0.07, fabric='rubber.tyre'), p_tyre,
              top=0.40, ease_top=0.024, wraps=2, wrap_paint=P('iron', 0.04, fabric='metal.iron')),
    ))

    p_jack = P('leather', 0.05, [B('top', 0.0, 0.05, 'solid', 'brass')], fabric='leather.cuir_bouilli')
    entries.append(assemble_garment(
        f'bdt_{sex}_jackboots', 'Buckled Highwayman & Wrecker Jackboots', 'feet', 'bandits',
        boots(f'bdt_{sex}_jackboots', P('soot', 0.06), p_jack, top=0.44, ease_top=0.024,
              cuff_paint=P('saddle', 0.05, fabric='leather.polished')),
    ))

    p_des_boot = P('buck', 0.05, [B('top', 0.0, 0.04, 'bdt_desert_weave', 'bdt_lithamindigo', 'buck', 0.09)], fabric='leather.buckskin')
    entries.append(assemble_garment(
        f'bdt_{sex}_desert_boots', 'Turned-Toe Arid-Corridor Raider Boots', 'feet', 'bandits',
        boots(f'bdt_{sex}_desert_boots', P('umber', 0.06), p_des_boot, top=0.38, ease_top=0.024),
    ))

    p_fell_iron = P('iron', 0.05, [B('top', 0.0, 0.05, 'solid', 'brass')], fabric='metal.steel.hammered')
    p_fell_brs = P('brass', 0.04, fabric='metal.brass')
    entries.append(assemble_garment(
        f'bdt_{sex}_fell_boots', 'Hobnailed & Sculpted Iron Pass Reiver Greaves', 'feet', 'bandits',
        boots(f'bdt_{sex}_fell_boots', P('iron', 0.06, fabric='metal.iron'), p_fell_iron, top=0.22, ease_top=0.020)
        + sculpted_greaves(f'bdt_{sex}_fell_sgrv', p_fell_iron, trim_paint=p_fell_brs, poleyn=True, ease=0.020),
    ))

    entries.append(assemble_garment(
        f'bdt_{sex}_dune_sandals', 'Rawhide Dune-Runner & Scrub Sandals', 'feet', 'bandits',
        sandal(f'bdt_{sex}_dune_sandals', P('umber', 0.06), P('buck', 0.05), guard=False, laces=2),
    ))

    entries.append(assemble_garment(
        f'bdt_{sex}_bare_caligae', 'Studded Deserter & Maroon Leather Caligae Sandals', 'feet', 'bandits',
        sandal(f'bdt_{sex}_bare_caligae', P('leather', 0.06), P('bronze', 0.04, fabric='leather.polished'), guard=False, laces=3),
    ))

    # --- Gloves & Bracers (5 styles) ---
    p_rig = P('bdt_oilskin', 0.06, [B('top', 0.0, 0.03, 'solid', 'bdt_hullprimer')], fabric='cloth.canvas.oiled')
    entries.append(assemble_garment(
        f'bdt_{sex}_rigger_wraps', 'Tarred Canvas & Rawhide Rigger Forearm Wraps', 'gloves', 'bandits',
        [sleeve(f'bdt_{sex}_rig_L', L, p_rig, f0=0.58, f1=0.95, ease=0.013, flare=0.003, rows=7, n=18),
         sleeve(f'bdt_{sex}_rig_R', R, p_rig, f0=0.58, f1=0.95, ease=0.013, flare=0.003, rows=7, n=18)],
    ))

    p_lbrc = P('saddle', 0.05, [B('top', 0.0, 0.03, 'solid', 'brass')], fabric='leather.cuir_bouilli')
    entries.append(assemble_garment(
        f'bdt_{sex}_leather_bracers', 'Brass-Studded Desert Shooter Bracers', 'gloves', 'bandits',
        [sleeve(f'bdt_{sex}_lbrc_L', L, p_lbrc, f0=0.56, f1=0.94, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'bdt_{sex}_lbrc_R', R, p_lbrc, f0=0.56, f1=0.94, ease=0.014, flare=0.004, rows=7, n=20)],
    ))

    entries.append(assemble_garment(
        f'bdt_{sex}_cuffed_gloves', 'Cuffed Highwayman & Alchemist Riding Gauntlets', 'gloves', 'bandits',
        full_gloves(f'bdt_{sex}_cuffed_gloves', P('saddle', 0.05, fabric='leather.cuir_bouilli'),
                    P('leather', 0.05, fabric='leather.polished'), f0=0.58, ease=0.014),
    ))

    p_ig_iron = P('iron', 0.05, [B('top', 0.0, 0.03, 'solid', 'bdt_hullprimer')], fabric='metal.steel.hammered')
    p_ig_stl = P('bdt_hullprimer', 0.04, fabric='metal.steel.hammered')
    entries.append(assemble_garment(
        f'bdt_{sex}_iron_gauntlets', 'Sculpted Salvage-Iron Vambraces & Splint Gauntlets', 'gloves', 'bandits',
        full_gloves(f'bdt_{sex}_iron_gauntlets', p_ig_iron,
                    P('leather', 0.05, fabric='leather.cuir_bouilli'), f0=0.80, ease=0.012,
                    knuckle_paint=p_ig_stl)
        + sculpted_vambraces(f'bdt_{sex}_iron_vam', p_ig_iron, trim_paint=p_ig_stl, couter=True, ease=0.016),
    ))

    p_manacle = P('iron', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'rust')], fabric='metal.iron')
    entries.append(assemble_garment(
        f'bdt_{sex}_shackle_manacles', 'Filed Iron Escape-Manacle Wrist Cuffs', 'gloves', 'bandits',
        [sleeve(f'bdt_{sex}_mnc_L', L, p_manacle, f0=0.72, f1=0.95, ease=0.013, flare=0.002, rows=6, n=18),
         sleeve(f'bdt_{sex}_mnc_R', R, p_manacle, f0=0.72, f1=0.95, ease=0.013, flare=0.002, rows=6, n=18)],
    ))

    return entries


# ===========================================================================================================
# 16 BANDIT & NAMED CONFEDERACY TIERS (`head`, `torso`, `back`)
# ===========================================================================================================
def _build_bandit_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    # --- 1. db_hulk_cutter (`dam_basins`) ---
    gid_h = f'bdt_{sex}_welder_rag'
    rag_p = P('bdt_hullprimer', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'bdt_oilskin')],
              [PN(0.0, 1.0, 'bdt_shipbreaker', 'bdt_hullprimer', 'bdt_oilskin', 0.22)], fabric='cloth.canvas.oiled')
    rag = _open_brow_dome(f'{gid_h}_rag', rag_p, f_brow=0.63, f_low=0.10, ease=0.012)
    gl_l = _host_anchor(rag, a + (b - a) * 0.72 + left * 0.038 + fwd * 0.095)
    gl_m = _host_anchor(rag, a + (b - a) * 0.73 + fwd * 0.108)
    gl_r = _host_anchor(rag, a + (b - a) * 0.72 - left * 0.038 + fwd * 0.095)
    gog = tube(f'{gid_h}_goggles', [gl_l + fwd * 0.005, gl_m + fwd * 0.009, gl_r + fwd * 0.005], 0.013,
               P('brass', 0.03, fabric='metal.bronze'), n=10, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Boatmurder Oil-Rag & Brow Hull-Goggles', 'head', 'bandits', [rag, gog], covers_hair=True))

    gid_t = f'bdt_{sex}_hulk_duster'
    dust_p = P('bdt_oilskin', 0.06, [
        B('bottom', 0.0, 0.07, 'bdt_primer', 'bdt_hullprimer', 'bdt_oilskin', 0.12),
    ], [PN(0.0, 1.0, 'bdt_grime', 'bdt_oilskin', 'umber', 0.22)], fabric='cloth.canvas.oiled')
    duster = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE + 0.07, 0.038, dust_p, n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    pld_p = P('bdt_hullprimer', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'iron')],
              [PN(0.0, 1.0, 'bdt_shipbreaker', 'bdt_hullprimer', 'iron', 0.20)], fabric='armor.salvage.tread_plate')
    pld = pauldron(f'{gid_t}_pauldron', L, pld_p, reach=0.38, ease=0.026)
    blt = belt_sash(f'{gid_t}_belt', core.WAIST - 0.014, core.WAIST + 0.030, P('buck', 0.05, fabric='leather.buckskin'), ease=0.042)
    entries.append(assemble_garment(gid_t, 'Boatmurder Greased Canvas Duster & Primer Pauldron', 'torso', 'bandits',
                                    [duster, pld, blt, sleeves(gid_t, 'wrist', 0.020, dust_p)]))

    gid_b = f'bdt_{sex}_prybar_coil_pack'
    pad, anc = _dorsal_pad(gid_b, P('bdt_oilskin', 0.05), clearance=0.042)
    coil = rosette(f'{gid_b}_hawser', anc + BACK_DIR * 0.018, BACK_DIR, left, 0.10,
                   P('oat', 0.06, fabric='straw.reed.plaited'), n=16, thick=0.024, rigid_joint='Spine2')
    pry = tube(f'{gid_b}_prybar', [anc - up * 0.15 - left * 0.06 + BACK_DIR * 0.026, anc + up * 0.19 + left * 0.06 + BACK_DIR * 0.026],
               0.014, P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Hull-Cutting Crowbar & Hawser Coil Pack', 'back', 'bandits', [pad, coil, pry]))

    # --- 2. db_aral_salt_stalker (`dam_basins`) ---
    gid_h = f'bdt_{sex}_alkali_wrap'
    alk_p = P('bdt_alkalisalt', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'ochre')],
              [PN(0.0, 1.0, 'bdt_alkali', 'bdt_alkalisalt', 'ochre', 0.20)], fabric='cloth.oiled.alkali')
    hd = hood(f'{gid_h}_hood', alk_p, ease=0.028, ease_low=0.045, open_front=0.92, low=-0.20, rows=13, n=34)
    _, fp_parts = _faceplate_with_slits(gid_h, alk_p, bar_paint=P('brass', 0.03, fabric='metal.bronze'),
                                        lens_paint=P('amber', 0.02, fabric='glass.moonglass.leaded'))
    entries.append(assemble_garment(gid_h, 'Bleached Sailcloth Alkali-Wrap & Soda-Glass Lenses', 'head', 'bandits',
                                    [hd] + fp_parts, covers_hair=True, covers_face=True))

    gid_t = f'bdt_{sex}_sailcloth_poncho'
    pon_p = P('bdt_alkalisalt', 0.05, [
        B('bottom', 0.0, 0.08, 'bdt_sail', 'bdt_hullprimer', 'bdt_alkalisalt', 0.12),
    ], [PN(0.0, 1.0, 'bdt_alkali', 'bdt_alkalisalt', 'sand', 0.20)], fabric='cloth.oiled.alkali')
    poncho = torso_tube(f'{gid_t}_poncho', core.TOP, core.KNEE + 0.08, 0.038, pon_p, n=42, rows=18, hang_from=core.WAIST, flare=0.118)
    sh_yoke = collar_disc(f'{gid_t}_yoke', 0.105, pon_p, drop=0.075, scallop=0.08, ease=0.024)
    entries.append(assemble_garment(gid_t, 'Weathered Sail-Band Alkali Poncho', 'torso', 'bandits',
                                    [poncho, sh_yoke, sleeves(gid_t, 'wrist', 0.019, P('umber', 0.05, fabric=COTTON))]))

    gid_b = f'bdt_{sex}_salvage_canteen'
    pad, anc = _dorsal_pad(gid_b, P('umber', 0.05), clearance=0.042)
    can1 = blob(f'{gid_b}_c1', anc + left * 0.055 + BACK_DIR * 0.024, (0.065, 0.055, 0.14),
                P('tinmirror', 0.04, fabric='metal.tin.patchwork'), n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    can2 = blob(f'{gid_b}_c2', anc - left * 0.055 + BACK_DIR * 0.024, (0.065, 0.055, 0.14),
                P('buck', 0.05, fabric='leather.buckskin'), n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Twin Tin & Hide Dry-Sea Salvage Canteens', 'back', 'bandits', [pad, can1, can2]))

    # --- 3. db_matok_wrecker_boss (`dam_basins`) ---
    gid_h = f'bdt_{sex}_wrecker_tricorn'
    tri_p = P('bdt_oilskin', 0.05, [B('bottom', 0.0, 0.04, 'bdt_hazard', 'neonyellow', 'soot', 0.10)], fabric='cloth.canvas.oiled')
    dome = _open_brow_dome(f'{gid_h}_crown', tri_p, f_brow=0.64, f_low=0.22, ease=0.013)
    brm = brim(f'{gid_h}_brim', 0.65, 0.085, tri_p, ease=0.013, lift=0.032, scallop=0.022)
    ck_pt = _host_anchor(dome, a + (b - a) * 0.76 + left * 0.055 + fwd * 0.08)
    cockade = rosette(f'{gid_h}_cockade', ck_pt + (left * 0.004 + fwd * 0.004), fwd, up, 0.024,
                      P('neonyellow', 0.03, [B('top', 0.0, 0.02, 'solid', 'bdt_hullprimer')], fabric='metal.tin.patchwork'),
                      n=12, thick=0.008, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Tarred Oilskin Wrecker Tricorn & Hazard Cockade', 'head', 'bandits',
                                    [dome, brm, cockade], covers_hair=True))

    gid_t = f'bdt_{sex}_container_brigandine'
    cbrig_p = P('bdt_hullprimer', 0.05, [
        B('bottom', 0.0, 0.08, 'bdt_hazard', 'neonyellow', 'soot', 0.12),
    ], [PN(0.0, 1.0, 'bdt_container', 'bdt_hullprimer', 'iron', 0.24)], fabric='metal.steel.hammered')
    cbrig_trim = P('neonyellow', 0.04, [B('bottom', 0.0, 0.04, 'stripes', 'soot', 'neonyellow', 0.10)], fabric='metal.steel.hammered')
    cb_cuir = cuirass_plate(f'{gid_t}_cuir', cbrig_p, trim_paint=cbrig_trim, style='laminar', faulds=3, ease=0.023)
    cb_gorg = gorget_guard(f'{gid_t}_gorget', cbrig_p, trim_paint=cbrig_trim, ease=0.024)
    cb_plds = articulated_pauldrons(f'{gid_t}_pld', cbrig_p, trim_paint=cbrig_trim, lames=3, haute_piece=True, ease=0.022)
    entries.append(assemble_garment(gid_t, 'Corrugated Container-Plate Laminar Cuirass & Hazard Pauldrons', 'torso', 'bandits',
                                    cb_cuir + cb_gorg + cb_plds
                                    + sleeves(gid_t, 'wrist', 0.019, P('bdt_oilskin', 0.05, fabric='cloth.canvas.oiled'))))

    gid_b = f'bdt_{sex}_grapnel_rack'
    pad, anc = _dorsal_pad(gid_b, P('bdt_hullprimer', 0.05), clearance=0.044)
    buoy = blob(f'{gid_b}_buoy', anc + up * 0.04 + BACK_DIR * 0.026, (0.085, 0.065, 0.13),
                P('sunorange', 0.04, fabric='metal.tin.patchwork'), n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    grap = tube(f'{gid_b}_shank', [anc - up * 0.16 + BACK_DIR * 0.024, anc + up * 0.18 + BACK_DIR * 0.028],
                0.015, P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Boarding Grapnel & Salvage Buoy Trophy Rack', 'back', 'bandits', [pad, buoy, grap]))

    # --- 4. ac_dune_ambusher (`arid_corridors`) ---
    gid_h = f'bdt_{sex}_indigo_litham'
    ind_p = P('bdt_lithamindigo', 0.05, [B('bottom', 0.0, 0.04, 'bdt_desert_weave', 'silver', 'bdt_lithamindigo', 0.08)], fabric=COTTON)
    trb = turban(f'{gid_h}_turban', ind_p, wrap_paint=P('indigo', 0.05, fabric=COTTON), f0=0.58, f1=1.13, bulge=0.036, ease=0.018)
    _, fp_parts = _faceplate_with_slits(gid_h, ind_p, bar_paint=P('silver', 0.03, fabric='metal.iron'))
    entries.append(assemble_garment(gid_h, 'Deep-Indigo Litham Turban & Dust-Veil', 'head', 'bandits',
                                    [trb] + fp_parts, covers_hair=True, covers_face=True))

    gid_t = f'bdt_{sex}_raider_abaya'
    ab_p = P('goatblack', 0.05, [
        B('bottom', 0.0, 0.08, 'bdt_desert_weave', 'madder', 'ochre', 0.12),
        B('top', 0.0, 0.04, 'bdt_desert_weave', 'ochre', 'goatblack', 0.10),
    ], fabric=WOOL)
    abaya = torso_tube(f'{gid_t}_abaya', core.TOP, core.KNEE + 0.06, 0.038, ab_p, n=42, rows=20, hang_from=core.WAIST, flare=0.118)
    entries.append(assemble_garment(gid_t, 'Goat-Hair Desert Raider Abaya & Linen Sleeves', 'torso', 'bandits',
                                    [abaya, sleeves(gid_t, 'wrist', 0.018, P('sand', 0.05, fabric=COTTON))]))

    gid_b = f'bdt_{sex}_camel_waterskin'
    pad, anc = _dorsal_pad(gid_b, P('goatblack', 0.05), clearance=0.042)
    wskin = blob(f'{gid_b}_skin', anc + BACK_DIR * 0.026, (0.13, 0.068, 0.22),
                 P('saddle', 0.05, [B('top', 0.0, 0.03, 'solid', 'brass')], fabric='leather.buckskin'),
                 n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Stitched Camel-Hide Raider Waterskin', 'back', 'bandits', [pad, wskin]))

    # --- 5. ac_camel_jezailchi (`arid_corridors`) ---
    gid_h = f'bdt_{sex}_glare_turban'
    kef_p = P('sand', 0.05, [B('bottom', 0.0, 0.04, 'bdt_mudcloth', 'umber', 'sand', 0.10)], fabric=COTTON)
    trb_j = turban(f'{gid_h}_keffiyeh', kef_p, wrap_paint=P('ochre', 0.05, fabric=COTTON), f0=0.60, f1=1.13, bulge=0.034, ease=0.018)
    gv_l = _host_anchor(trb_j, a + (b - a) * 0.62 + left * 0.046 + fwd * 0.095)
    gv_m = _host_anchor(trb_j, a + (b - a) * 0.62 + fwd * 0.110)
    gv_r = _host_anchor(trb_j, a + (b - a) * 0.62 - left * 0.046 + fwd * 0.095)
    glare = tube(f'{gid_h}_glarevisor', [gv_l + fwd * 0.005, gv_m + fwd * 0.009, gv_r + fwd * 0.005], 0.013,
                 P('bronze', 0.03, [B('top', 0.0, 0.02, 'solid', 'soot')], fabric='metal.bronze'), n=10, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Sand Keffiyeh & Scoured-Enamel Glare Visor', 'head', 'bandits',
                                    [trb_j, glare], covers_hair=True))

    gid_t = f'bdt_{sex}_bandolier_caftan'
    caf_p = P('sand', 0.05, [
        B('bottom', 0.0, 0.08, 'bdt_mudcloth', 'soot', 'ochre', 0.12),
    ], [PN(0.0, 1.0, 'bdt_mudcloth', 'umber', 'sand', 0.20)], fabric=COTTON)
    caftan = torso_tube(f'{gid_t}_caftan', core.TOP, core.KNEE + 0.07, 0.038, caf_p, n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    bando = crossed_sash(f'{gid_t}_bandolier', P('saddle', 0.04, [B('top', 0.0, 0.02, 'stripes', 'brass', 'saddle', 0.06)],
                                                 fabric='leather.cuir_bouilli'), width=0.058, ease=0.042)
    entries.append(assemble_garment(gid_t, 'Mudcloth Desert Caftan & Brass Cartridge Bandolier', 'torso', 'bandits',
                                    [caftan, bando, sleeves(gid_t, 'wrist', 0.019, caf_p)]))

    gid_b = f'bdt_{sex}_powder_fork_pack'
    pad, anc = _dorsal_pad(gid_b, P('saddle', 0.05), clearance=0.042)
    flask = blob(f'{gid_b}_flask', anc - up * 0.04 + BACK_DIR * 0.022, (0.09, 0.055, 0.13),
                 P('brass', 0.03, fabric='metal.bronze'), n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    fork_s = tube(f'{gid_b}_fork', [anc - up * 0.16 + BACK_DIR * 0.026, anc + up * 0.20 + BACK_DIR * 0.028],
                  0.012, P('bark', 0.05, fabric='leather.buckskin'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Jezail Firing-Fork & Brass Powder Flask Pack', 'back', 'bandits', [pad, flask, fork_s]))

    # --- 6. ac_oasis_emir_renegade (`arid_corridors`) ---
    gid_h = f'bdt_{sex}_crimson_agal_helm'
    sk_p = P('iron', 0.04, [B('bottom', 0.0, 0.05, 'solid', 'crimson')], fabric='metal.iron')
    sk_dome = _open_brow_dome(f'{gid_h}_casque', sk_p, f_brow=0.63, f_low=0.14, ease=0.013)
    agal = head_rings(f'{gid_h}_agal', 0.68, 0.78, 0.017, P('brass', 0.03, fabric='metal.brass.braid'), n=34, rows=4)
    sp_base = _host_anchor(sk_dome, a + (b - a) * 1.02)
    spike = horn(f'{gid_h}_spike', [sp_base - up * 0.004, sp_base + up * 0.075], 0.016, 0.003,
                 P('brass', 0.03, fabric='metal.bronze'), n=10, rows=6, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Spiked Kulah Skullcap & Brass Agal Coils', 'head', 'bandits',
                                    [sk_dome, agal, spike], covers_hair=True))

    gid_t = f'bdt_{sex}_looted_jubba'
    jub_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.08, 'bdt_suzani', 'gold', 'purple', 0.12),
    ], [PN(0.0, 1.0, 'bdt_suzani', 'gold', 'crimson', 0.24)], fabric='cloth.silk.slub')
    jubba = torso_tube(f'{gid_t}_jubba', core.TOP, core.KNEE + 0.07, 0.039, jub_p, n=42, rows=20, hang_from=core.WAIST, flare=0.118)
    mirror_p = P('bronze', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'gold')], fabric='metal.bronze')
    mirror_pl = tabard(f'{gid_t}_mirror', core.WAIST + 0.04, core.TOP - 0.02, mirror_p, width=0.19, ease=0.043, front=True, back=False)
    pld_e = pauldron(f'{gid_t}_pldR', R, mirror_p, reach=0.35, ease=0.026)
    entries.append(assemble_garment(gid_t, 'Plundered Suzani-Silk Jubba & Bronze Mirror Plate', 'torso', 'bandits',
                                    [jubba, mirror_pl, pld_e, sleeves(gid_t, 'wrist', 0.020, jub_p)]))

    gid_b = f'bdt_{sex}_plunder_saddlebag'
    pad, anc = _dorsal_pad(gid_b, P('maroon', 0.05), clearance=0.043)
    bag_s = blob(f'{gid_b}_saddlebag', anc + BACK_DIR * 0.026, (0.19, 0.065, 0.20), jub_p,
                 n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Plundered Silk & Brass Caravan Saddlebag', 'back', 'bandits', [pad, bag_s]))

    # --- 7. ih_broken_stair_footpad (`imperial_highways`) ---
    gid_h = f'bdt_{sex}_highway_slouch'
    sl_p = P('charcoal', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'crimson')], fabric='cloth.felt.boiled')
    sl_dome = _open_brow_dome(f'{gid_h}_crown', sl_p, f_brow=0.64, f_low=0.20, ease=0.013)
    sl_brim = brim(f'{gid_h}_brim', 0.65, 0.105, sl_p, ease=0.013, droop=0.018)
    _, mask_pts = _faceplate_with_slits(gid_h, P('crimson', 0.04, fabric=COTTON), bar_paint=P('leather', 0.04))
    entries.append(assemble_garment(gid_h, 'Battered Felt Slouch Hat & Crimson Highwayman Kerchief', 'head', 'bandits',
                                    [sl_dome, sl_brim] + mask_pts, covers_hair=True, covers_face=True))

    gid_t = f'bdt_{sex}_oilskin_cape_coat'
    hw_p = P('bdt_oilskin', 0.06, [
        B('bottom', 0.0, 0.07, 'solid', 'umber'),
    ], [PN(0.0, 1.0, 'bdt_grime', 'charcoal', 'bdt_oilskin', 0.22)], fabric='cloth.canvas.oiled')
    hw_coat = torso_tube(f'{gid_t}_surcoat', core.TOP, core.KNEE + 0.06, 0.039, hw_p, n=42, rows=20, hang_from=core.WAIST, flare=0.118)
    capelet = collar_disc(f'{gid_t}_capelet', 0.115, P('charcoal', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'crimson')],
                                                       fabric='cloth.canvas.oiled'), drop=0.082, scallop=0.09, ease=0.025)
    p_belt = belt_sash(f'{gid_t}_belt', core.WAIST - 0.014, core.WAIST + 0.032, P('saddle', 0.04, fabric='leather.cuir_bouilli'), ease=0.043)
    entries.append(assemble_garment(gid_t, 'Mud-Streaked Oilskin Highwayman Cape-Coat', 'torso', 'bandits',
                                    [hw_coat, capelet, p_belt, sleeves(gid_t, 'wrist', 0.020, hw_p)]))

    gid_b = f'bdt_{sex}_bedroll_satchel'
    pad, anc = _dorsal_pad(gid_b, P('bdt_oilskin', 0.05), clearance=0.043)
    roll = tube(f'{gid_b}_bedroll', [anc + up * 0.09 - left * 0.13 + BACK_DIR * 0.024, anc + up * 0.09 + left * 0.13 + BACK_DIR * 0.024],
                0.042, P('olive', 0.05, fabric='cloth.canvas.oiled'), n=12, rigid_joint='Spine2')
    satch = blob(f'{gid_b}_satchel', anc - up * 0.05 + BACK_DIR * 0.024, (0.15, 0.058, 0.14),
                 P('saddle', 0.05, fabric='leather.buckskin'), n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Oiled Highwayman Bedroll & Loot Satchel', 'back', 'bandits', [pad, roll, satch]))

    # --- 8. ih_legion_deserter (`imperial_highways`) ---
    gid_h = f'bdt_{sex}_defaced_galea'
    gal_p = P('bronze', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'verdigris')], fabric='metal.bronze.verdigris')
    galea = _open_brow_dome(f'{gid_h}_bowl', gal_p, f_brow=0.63, f_low=0.08, ease=0.013)
    vis = brim(f'{gid_h}_neckguard', 0.56, 0.045, gal_p, ease=0.013, droop=0.012)
    entries.append(assemble_garment(gid_h, 'Dented Crestless Deserter Bronze Galea', 'head', 'bandits',
                                    [galea, vis], covers_hair=True))

    gid_t = f'bdt_{sex}_slashed_lorica'
    lor_p = P('bronze', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'leather'),
        B('top', 0.0, 0.04, 'solid', 'verdigris'),
    ], [PN(0.0, 1.0, 'bdt_defaced_sun', 'bdt_limedaub', 'bronze', 0.26)], fabric='metal.bronze')
    lor_trim = P('verdigris', 0.05, fabric='metal.bronze')
    lor_cuir = cuirass_plate(f'{gid_t}_cuir', lor_p, trim_paint=lor_trim, style='laminar', faulds=3, ease=0.022)
    lor_gorg = gorget_guard(f'{gid_t}_gorget', lor_p, trim_paint=lor_trim, ease=0.023)
    lor_plds = articulated_pauldrons(f'{gid_t}_pld', lor_p, trim_paint=lor_trim, lames=3, haute_piece=False, ease=0.020)
    entries.append(assemble_garment(gid_t, 'Lime-Slashed Sculpted Laminar Legion Lorica Cuirass', 'torso', 'bandits',
                                    lor_cuir + lor_gorg + lor_plds
                                    + sleeves(gid_t, 'elbow', 0.018, P('bdt_maroonred', 0.05, fabric=COTTON))))

    gid_b = f'bdt_{sex}_ragged_sagum'
    sag_p = P('bdt_maroonred', 0.05, [B('bottom', 0.0, 0.07, 'bdt_grime', 'umber', 'bdt_maroonred', 0.12)], fabric=WOOL)
    sagum = cape(f'{gid_b}_sagum', core.CROTCH + 0.06, sag_p, span=0.50, ease=0.028, flare=0.07, rows=14, n=24, stiff=0.36, back_push=0.058)
    entries.append(assemble_garment(gid_b, 'Mud-Hemmed Ragged Deserter Sagum Cloak', 'back', 'bandits', [sagum]))

    # --- 9. ih_boiling_bay_wrecker (`imperial_highways`) ---
    gid_h = f'bdt_{sex}_tarred_souwester'
    sw_p = P('bdt_souwester', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'bdt_oilskin')], fabric='cloth.oilskin.tarred_seams')
    sw_dome = _open_brow_dome(f'{gid_h}_crown', sw_p, f_brow=0.64, f_low=0.16, ease=0.013)
    sw_brim = brim(f'{gid_h}_brim', 0.63, 0.088, sw_p, ease=0.013, droop=0.024)
    entries.append(assemble_garment(gid_h, 'Tarred Storm-Canvas Wrecker Souwester', 'head', 'bandits',
                                    [sw_dome, sw_brim], covers_hair=True))

    gid_t = f'bdt_{sex}_wrecker_smock'
    smk_p = P('bdt_oilskin', 0.05, [B('bottom', 0.0, 0.05, 'stripes', 'crimson', 'cream', 0.08)], fabric='cloth.oilskin.tarred_seams')
    smock = torso_tube(f'{gid_t}_smock', core.TOP, core.WAIST - 0.052, 0.028, smk_p, n=40, rows=14, flare=0.055)
    broc_v = tabard(f'{gid_t}_looted_vest', core.WAIST - 0.02, core.TOP - 0.01,
                    P('gold', 0.04, [], [PN(0.0, 1.0, 'bdt_suzani', 'crimson', 'gold', 0.20)], fabric='cloth.velvet.cut'),
                    width=0.20, ease=0.033, front=True, back=False)
    w_baldric = crossed_sash(f'{gid_t}_baldric', P('leather', 0.04, fabric='leather.cuir_bouilli'), width=0.052, ease=0.036)
    entries.append(assemble_garment(gid_t, 'Tarred Wrecker Smock & Plundered Guild Waistcoat', 'torso', 'bandits',
                                    [smock, broc_v, w_baldric, sleeves(gid_t, 'wrist', 0.019, smk_p)]))

    gid_b = f'bdt_{sex}_false_beacon_pack'
    pad, anc = _dorsal_pad(gid_b, P('bdt_oilskin', 0.05), clearance=0.032)
    pole = tube(f'{gid_b}_beaconpole', [anc - up * 0.14 + BACK_DIR * 0.024, anc + up * 0.24 + BACK_DIR * 0.030],
                0.014, P('bark', 0.05, fabric='leather.buckskin'), n=8, rigid_joint='Spine2')
    lant = blob(f'{gid_b}_lantern', anc + up * 0.20 + BACK_DIR * 0.035, (0.065, 0.065, 0.095),
                P('amber', 0.03, [B('top', 0.0, 0.03, 'solid', 'brass')], fabric='glass.moonglass.leaded'),
                n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'False-Beacon Storm-Lantern & Driftwood Hook-Pole', 'back', 'bandits', [pad, pole, lant]))

    # --- 10. hp_fellgang_reiver (`highland_passes`) ---
    gid_h = f'bdt_{sex}_spiked_pot_helm'
    pot_p = P('iron', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'yakbrown')], fabric='armor.salvage.tread_plate')
    pot = _open_brow_dome(f'{gid_h}_pot', pot_p, f_brow=0.63, f_low=0.12, ease=0.013)
    pot_b = brim(f'{gid_h}_brim', 0.62, 0.052, pot_p, ease=0.013, droop=0.010)
    sp_pt = _host_anchor(pot, a + (b - a) * 1.02)
    pot_sp = horn(f'{gid_h}_fin', [sp_pt - up * 0.004, sp_pt + up * 0.068], 0.020, 0.004,
                  P('rust', 0.05, fabric='metal.iron'), n=10, rows=6, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Riveted Kettle-Pot Helm & Yak-Fur Earband', 'head', 'bandits',
                                    [pot, pot_b, pot_sp], covers_hair=True))

    gid_t = f'bdt_{sex}_fellgang_harness'
    fg_iron = P('iron', 0.05, [B('bottom', 0.0, 0.05, 'solid', 'bdt_limedaub')],
                [PN(0.0, 1.0, 'bdt_daub', 'bdt_limedaub', 'iron', 0.24)], fabric='metal.steel.hammered')
    fg_stl = P('iron', 0.04, fabric='metal.steel.hammered')
    fg_cuir = cuirass_plate(f'{gid_t}_cuir', fg_iron, trim_paint=fg_stl, style='lamellar', faulds=2, ease=0.022)
    fg_pld = articulated_pauldron(f'{gid_t}_cageL', L, fg_iron, trim_paint=fg_stl, lames=3, haute_piece=True, ease=0.020)
    entries.append(assemble_garment(gid_t, 'Spiked Salvage-Iron & Lime-Daub Lamellar Cuirass', 'torso', 'bandits',
                                    fg_cuir + fg_pld + sleeves(gid_t, 'elbow', 0.019, P('yakbrown', 0.06, fabric='fur.yak'))))

    gid_b = f'bdt_{sex}_trophy_chain_pack'
    pad, anc = _dorsal_pad(gid_b, P('yakbrown', 0.06, fabric='fur.yak'), clearance=0.032)
    pelt_b = blob(f'{gid_b}_pelt', anc + BACK_DIR * 0.024, (0.17, 0.065, 0.20),
                  P('yakbrown', 0.06, fabric='fur.yak'), n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    ch_ring = rosette(f'{gid_b}_chain', anc + BACK_DIR * 0.045, BACK_DIR, left, 0.075,
                      P('iron', 0.04, fabric='metal.iron'), n=14, thick=0.016, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Yak-Pelt Bundle & Salvage Iron Chain Rack', 'back', 'bandits', [pad, pelt_b, ch_ring]))

    # --- 11. hp_godsgate_toll_taker (`highland_passes`) ---
    gid_h = f'bdt_{sex}_breath_salt_hood'
    q_p = P('drab', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'yakbrown')], fabric='cloth.quilted.diamond')
    q_hd = hood(f'{gid_h}_hood', q_p, ease=0.028, ease_low=0.046, open_front=0.90, low=-0.22, rows=13, n=34)
    fp_g, fp_g_pts = _faceplate_with_slits(gid_h, P('saddle', 0.04, fabric='leather.cuir_bouilli'),
                                           bar_paint=P('brass', 0.03, fabric='metal.bronze'))
    c_can = _host_anchor(fp_g, a + (b - a) * 0.16 + fwd * 0.12)
    salt_can = blob(f'{gid_h}_canister', c_can + fwd * 0.016, (0.034, 0.034, 0.042),
                    P('brass', 0.03, fabric='metal.bronze'), n=10, rows=5, out=fwd, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Quilted Pass Hood & Stolen Brass Breath-Salts Mask', 'head', 'bandits',
                                    [q_hd] + fp_g_pts + [salt_can], covers_hair=True, covers_face=True))

    gid_t = f'bdt_{sex}_pass_gambeson'
    gmb_p = P('drab', 0.05, [
        B('bottom', 0.0, 0.09, 'scales', 'iron', 'madder', 0.10),
    ], [PN(0.0, 1.0, 'quilt', 'umber', 'drab', 0.18)], fabric='cloth.quilted.diamond')
    gamb = torso_tube(f'{gid_t}_gambeson', core.TOP, core.KNEE + 0.06, 0.039, gmb_p, n=42, rows=20, hang_from=core.WAIST, flare=0.116)
    f_col = collar_disc(f'{gid_t}_furcol', 0.088, P('yakbrown', 0.06, fabric='fur.yak'), drop=0.068, ease=0.024)
    entries.append(assemble_garment(gid_t, 'Lamellar-Patched Quilted Pass Gambeson', 'torso', 'bandits',
                                    [gamb, f_col, sleeves(gid_t, 'wrist', 0.020, gmb_p)]))

    gid_b = f'bdt_{sex}_arbalest_quiver'
    pad, anc = _dorsal_pad(gid_b, P('saddle', 0.05), clearance=0.043)
    bbox = blob(f'{gid_b}_boltbox', anc + BACK_DIR * 0.026, (0.12, 0.062, 0.24),
                P('saddle', 0.05, [B('top', 0.0, 0.04, 'solid', 'iron')], fabric='leather.cuir_bouilli'),
                n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    crank = tube(f'{gid_b}_windlass', [anc - up * 0.10 + left * 0.075 + BACK_DIR * 0.028, anc + up * 0.12 + left * 0.075 + BACK_DIR * 0.028],
                 0.013, P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Heavy Pass-Arbalest Bolt-Box & Windlass Hooks', 'back', 'bandits', [pad, bbox, crank]))

    # --- 12. hp_crag_warlord (`highland_passes`) ---
    gid_h = f'bdt_{sex}_horned_scrap_crown'
    wl_p = P('darkfur', 0.06, [B('bottom', 0.0, 0.05, 'solid', 'iron')], fabric='fur.wolf')
    wl_dome = _open_brow_dome(f'{gid_h}_pelt', wl_p, f_brow=0.63, f_low=0.10, ease=0.014)
    hl_anc = _host_anchor(wl_dome, a + (b - a) * 0.86 + left * 0.075)
    hr_anc = _host_anchor(wl_dome, a + (b - a) * 0.86 - left * 0.075)
    h_l = horn(f'{gid_h}_hornL', [hl_anc - left * 0.004, hl_anc + left * 0.065 + up * 0.055, hl_anc + left * 0.095 + up * 0.13 + fwd * 0.02],
               0.022, 0.005, P('bone', 0.04, fabric='armor.lamellar.horn'), n=10, rows=8, rigid_joint='Head')
    h_r = horn(f'{gid_h}_hornR', [hr_anc + left * 0.004, hr_anc - left * 0.065 + up * 0.055, hr_anc - left * 0.095 + up * 0.13 + fwd * 0.02],
               0.022, 0.005, P('bone', 0.04, fabric='armor.lamellar.horn'), n=10, rows=8, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Yak-Horned Pelt Hood & Riveted Iron Crown', 'head', 'bandits',
                                    [wl_dome, h_l, h_r], covers_hair=True))

    gid_t = f'bdt_{sex}_warlord_hauberk'
    wh_p = P('iron', 0.05, [
        B('bottom', 0.0, 0.08, 'scales', 'brass', 'soot', 0.10),
    ], [PN(0.0, 1.0, 'scales', 'iron', 'charcoal', 0.16)], fabric='metal.steel.hammered')
    wh_brs = P('brass', 0.03, [B('bottom', 0.0, 0.03, 'beads', 'gold', 'brass', 0.08)], fabric='metal.brass')
    wh_cuir = cuirass_plate(f'{gid_t}_cuir', wh_p, trim_paint=wh_brs, style='gothic', faulds=3, ease=0.023)
    wh_gorg = gorget_guard(f'{gid_t}_gorget', wh_p, trim_paint=wh_brs, ease=0.024)
    wh_plds = articulated_pauldrons(f'{gid_t}_pld', wh_p, trim_paint=wh_brs, lames=3, haute_piece=True, ease=0.022)
    entries.append(assemble_garment(gid_t, 'Blackened Gothic Iron Warlord Cuirass & Articulated Faulds', 'torso', 'bandits',
                                    wh_cuir + wh_gorg + wh_plds
                                    + sleeves(gid_t, 'wrist', 0.019, P('darkfur', 0.06, fabric='fur.wolf'))))

    gid_b = f'bdt_{sex}_fur_war_cape'
    wcape = cape(f'{gid_b}_cape', core.CROTCH + 0.06, P('darkfur', 0.06, [B('bottom', 0.0, 0.06, 'solid', 'yakbrown')], fabric='fur.wolf'),
                 span=0.52, ease=0.028, flare=0.075, rows=14, n=24, stiff=0.36, back_push=0.058)
    entries.append(assemble_garment(gid_b, 'Shaggy Crag-Warlord Wolf & Yak Mantle', 'back', 'bandits', [wcape]))

    # --- 13. bf_nazar_chainbreaker (`BF-03` Maroon Chain-Breakers — broken iron neck-shackles & inverted sun-plate!) ---
    gid_h = f'bdt_{sex}_chainbreaker_band'
    cb_hb = head_rings(f'{gid_h}_headband', 0.60, 0.71, 0.004,
                       P('bdt_maroonred', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'iron')], fabric=COTTON), n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Maroon Chain-Snapper Brow-Band & Iron Tally', 'head', 'bandits', [cb_hb], covers_hair=False))

    gid_t = f'bdt_{sex}_shackle_cuirass'
    inv_brz = P('bronze', 0.04, [], [PN(0.0, 1.0, 'bdt_inverted_sun', 'gold', 'bdt_vothpurple', 0.24)], fabric='metal.bronze')
    sh_iron = P('iron', 0.03, fabric='metal.iron')
    cb_cuir = cuirass_plate(f'{gid_t}_cuir', inv_brz, trim_paint=sh_iron, style='musculata', faulds=2, ease=0.022)
    shackle = neck_ring(f'{gid_t}_shackle', sh_iron, r_tube=0.022, drop=0.015, n=28, nr=8)
    sh_anc = _host_anchor(shackle, spine_at(core.TOP + 0.01) + fwd * 0.09 + left * 0.035)
    chain_stub = tube(f'{gid_t}_broken_chain', [sh_anc, sh_anc - up * 0.065 + fwd * 0.012], 0.009,
                      P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_t, 'Filed Iron Neck-Shackle & Sculpted Inverted-Sun Cuirass', 'torso', 'bandits',
                                    cb_cuir + [shackle, chain_stub]))

    gid_b = f'bdt_{sex}_broken_yoke_pack'
    pad, anc = _dorsal_pad(gid_b, P('bdt_maroonred', 0.05), clearance=0.030)
    sh_coil = rosette(f'{gid_b}_chains', anc + BACK_DIR * 0.020, BACK_DIR, left, 0.090,
                      P('iron', 0.04, fabric='metal.iron'), n=14, thick=0.020, rigid_joint='Spine2')
    mach = tube(f'{gid_b}_machete', [anc - up * 0.15 + left * 0.05 + BACK_DIR * 0.026, anc + up * 0.17 - left * 0.04 + BACK_DIR * 0.026],
                0.016, P('saddle', 0.05, fabric='leather.cuir_bouilli'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Shattered Peon-Shackle Coil & Machete Sheath', 'back', 'bandits', [pad, sh_coil, mach]))

    # --- 14. bf_retort_raider (`BF-06` Glass-Eaters — acid/alchemical glass-grenadier!) ---
    gid_h = f'bdt_{sex}_retort_goggles_cowl'
    rt_p = P('ochre', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'rust')], fabric='leather.foundry.pigskin')
    rt_cowl = _open_brow_dome(f'{gid_h}_cowl', rt_p, f_brow=0.63, f_low=0.08, ease=0.013)
    _, rt_mask = _faceplate_with_slits(gid_h, P('charcoal', 0.05, fabric='leather.foundry.pigskin'),
                                       bar_paint=P('copper', 0.03, fabric='metal.bronze'),
                                       lens_paint=P('bdt_naphthagreen', 0.02, fabric='glass.moonglass.leaded'))
    entries.append(assemble_garment(gid_h, 'Fireclay Alchemist Cowl & Green Acid-Splash Goggles', 'head', 'bandits',
                                    [rt_cowl] + rt_mask, covers_hair=True, covers_face=True))

    gid_t = f'bdt_{sex}_grenadier_coat'
    gr_p = P('saddle', 0.05, [
        B('bottom', 0.0, 0.07, 'bdt_mudcloth', 'bdt_naphthagreen', 'soot', 0.10),
    ], fabric='leather.foundry.pigskin')
    gr_coat = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE + 0.06, 0.038, gr_p, n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    gr_sash = crossed_sash(f'{gid_t}_bandolier', P('leather', 0.05, fabric='leather.cuir_bouilli'), width=0.060, ease=0.043)
    grenades = []
    for k_idx, (zf, xf) in enumerate(((0.72, -0.055), (0.52, 0.0), (0.34, 0.055))):
        z_g = core.WAIST + (core.CHEST - core.WAIST) * zf
        g_anc = _host_anchor(gr_coat, chest_front(z_g, 0.038, x=xf))
        grenades.append(blob(f'{gid_t}_retort_{k_idx}', g_anc + fwd * 0.012, (0.026, 0.026, 0.036),
                             P('bdt_naphthagreen', 0.02, [B('top', 0.0, 0.03, 'solid', 'copper')], fabric='glass.moonglass.leaded'),
                             n=10, rows=5, out=fwd, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_t, 'Scorched Pigskin Coat & Glass Acid-Retort Bandolier', 'torso', 'bandits',
                                    [gr_coat, gr_sash] + grenades + [sleeves(gid_t, 'wrist', 0.020, gr_p)]))

    gid_b = f'bdt_{sex}_naphtha_alembic_pack'
    pad, anc = _dorsal_pad(gid_b, P('saddle', 0.05), clearance=0.043)
    carboy = blob(f'{gid_b}_carboy', anc + BACK_DIR * 0.030, (0.11, 0.075, 0.19),
                  P('bdt_naphthagreen', 0.03, [B('top', 0.0, 0.04, 'solid', 'terracotta')], fabric='glass.moonglass.leaded'),
                  n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    cond = tube(f'{gid_b}_coil', [anc + up * 0.10 - left * 0.06 + BACK_DIR * 0.026, anc + up * 0.17 + BACK_DIR * 0.032,
                                  anc + up * 0.10 + left * 0.06 + BACK_DIR * 0.026],
                0.011, P('copper', 0.03, fabric='metal.bronze'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Bootleg Fireclay Alembic & Naphtha Carboy Pack', 'back', 'bandits', [pad, carboy, cond]))

    # --- 15. bf_fume_gang (`BF-09` Siphon-Pit Fume-Gangs — oil-soaked Cthonos gas-mask raider!) ---
    gid_h = f'bdt_{sex}_siphon_gasmask'
    fm_p = P('bdt_crudeoil', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'rust')], fabric='rubber.tyre')
    fm_cowl = _open_brow_dome(f'{gid_h}_cowl', fm_p, f_brow=0.63, f_low=0.06, ease=0.013)
    fp_m, fp_m_pts = _faceplate_with_slits(gid_h, fm_p, bar_paint=P('iron', 0.04, fabric='metal.iron'),
                                           lens_paint=P('amber', 0.02, fabric='glass.moonglass.leaded'))
    sn_anc = _host_anchor(fp_m, a + (b - a) * 0.18 + fwd * 0.12)
    snout = blob(f'{gid_h}_filter', sn_anc + fwd * 0.018, (0.038, 0.042, 0.048),
                 P('rust', 0.05, [B('top', 0.0, 0.03, 'solid', 'neonyellow')], fabric='metal.tin.patchwork'),
                 n=12, rows=6, out=fwd, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Oil-Soaked Siphon-Pit Respirator & Snout Gas-Mask', 'head', 'bandits',
                                    [fm_cowl] + fp_m_pts + [snout], covers_hair=True, covers_face=True))

    gid_t = f'bdt_{sex}_fume_oilskin'
    fo_p = P('bdt_crudeoil', 0.05, [
        B('bottom', 0.0, 0.05, 'bdt_hazard', 'neonyellow', 'bdt_crudeoil', 0.10),
    ], fabric='rubber.tyre')
    fo_jrk = torso_tube(f'{gid_t}_vest', core.TOP, core.WAIST - 0.050, 0.026, fo_p, n=40, rows=14, flare=0.050)
    fo_pld = pauldron(f'{gid_t}_tyre_pld', R, P('bdt_tyrerubber', 0.06, fabric='rubber.tyre'), reach=0.37, ease=0.026)
    v_anc1 = _host_anchor(fo_jrk, chest_front(core.CHEST + 0.01, 0.026, x=-0.045))
    v_anc2 = _host_anchor(fo_jrk, chest_front(core.CHEST - 0.05, 0.026, x=-0.045))
    biogel = tube(f'{gid_t}_biogel_vial', [v_anc2 + fwd * 0.008, v_anc1 + fwd * 0.008], 0.011,
                  P('godteal', 0.02, fabric='glass.moonglass.leaded'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_t, 'Crude-Oil Rubberized Siphon Harness & Biogel Vials', 'torso', 'bandits',
                                    [fo_jrk, fo_pld, biogel, sleeves(gid_t, 'elbow', 0.019, fo_p)]))

    gid_b = f'bdt_{sex}_biogel_scrubber_tank'
    pad, anc = _dorsal_pad(gid_b, P('bdt_crudeoil', 0.05), clearance=0.032)
    t_l = tube(f'{gid_b}_tankL', [anc - up * 0.12 + left * 0.052 + BACK_DIR * 0.026, anc + up * 0.13 + left * 0.052 + BACK_DIR * 0.026],
               0.036, P('rust', 0.05, [B('top', 0.0, 0.04, 'solid', 'godteal')], fabric='metal.iron'), n=12, rigid_joint='Spine2')
    t_r = tube(f'{gid_b}_tankR', [anc - up * 0.12 - left * 0.052 + BACK_DIR * 0.026, anc + up * 0.13 - left * 0.052 + BACK_DIR * 0.026],
               0.036, P('iron', 0.05, [B('top', 0.0, 0.04, 'solid', 'neonyellow')], fabric='metal.iron'), n=12, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Twin Cthonos Lung-Salt & Fume-Scrubber Tanks', 'back', 'bandits', [pad, t_l, t_r]))

    # --- 16. bf_unsacrificed (`BF-10` The Unsacrificed — painted solstice-altar fugitive!) ---
    gid_h = f'bdt_{sex}_inverted_altar_mask'
    us_p = P('bdt_vothpurple', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'bdt_limedaub')],
             [PN(0.0, 1.0, 'bdt_inverted_sun', 'bdt_limedaub', 'bdt_vothpurple', 0.22)], fabric='cloth.silk')
    us_wrap = _open_brow_dome(f'{gid_h}_wrap', us_p, f_brow=0.63, f_low=0.10, ease=0.012)
    _, us_mask = _faceplate_with_slits(gid_h, us_p, bar_paint=P('gold', 0.03, fabric='metal.gold'))
    entries.append(assemble_garment(gid_h, 'Inverted Purple Vothic Mask & Ash-Painted Altar Wrap', 'head', 'bandits',
                                    [us_wrap] + us_mask, covers_hair=True, covers_face=True))

    gid_t = f'bdt_{sex}_altar_fugitive_wrap'
    stole_p = P('bdt_vothpurple', 0.04, [
        B('bottom', 0.0, 0.05, 'bdt_inverted_sun', 'bdt_limedaub', 'crimson', 0.12),
    ], [PN(0.0, 1.0, 'bdt_daub', 'bdt_limedaub', 'bdt_vothpurple', 0.22)], fabric=COTTON)
    if sex == 'm':
        u_parts = [
            crossed_sash(f'{gid_t}_stole', stole_p, width=0.072, ease=0.022),
            belt_sash(f'{gid_t}_sash', core.WAIST - 0.014, core.WAIST + 0.032, P('crimson', 0.04, fabric=COTTON), ease=0.024),
        ]
        entries.append(assemble_garment(gid_t, 'Painted Solstice-Altar Fugitive Cross-Stole', 'torso', 'bandits', u_parts, open_torso=True))
    else:
        u_bodice = torso_tube(f'{gid_t}_halter', core.CHEST + 0.06, core.WAIST - 0.045, 0.022, stole_p, n=38, rows=10, flare=0.035)
        u_stole = crossed_sash(f'{gid_t}_stole', stole_p, width=0.058, ease=0.028)
        entries.append(assemble_garment(gid_t, 'Painted Solstice-Altar Fugitive Halter & Stole', 'torso', 'bandits',
                                        [u_bodice, u_stole], open_torso=True))

    gid_b = f'bdt_{sex}_stolen_relic_bundle'
    pad, anc = _dorsal_pad(gid_b, P('bdt_vothpurple', 0.05), clearance=0.028)
    rel = blob(f'{gid_b}_relic', anc + BACK_DIR * 0.024, (0.14, 0.065, 0.18),
               P('bdt_limedaub', 0.05, [B('top', 0.0, 0.04, 'solid', 'bdt_vothpurple')], fabric=COTTON),
               n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Wrapped Taboo Nazar Altar-Relic Bundle', 'back', 'bandits', [pad, rel]))

    return entries


def _outfits_for_sex(sex):
    return {
        'db_hulk_cutter': {
            'region': 'dam_basins',
            'head': f'bdt_{sex}_welder_rag',
            'torso': f'bdt_{sex}_hulk_duster',
            'gloves': f'bdt_{sex}_rigger_wraps',
            'legs': f'bdt_{sex}_bilge_trousers',
            'feet': f'bdt_{sex}_tyre_boots',
            'back': f'bdt_{sex}_prybar_coil_pack',
        },
        'db_aral_salt_stalker': {
            'region': 'dam_basins',
            'head': f'bdt_{sex}_alkali_wrap',
            'torso': f'bdt_{sex}_sailcloth_poncho',
            'gloves': f'bdt_{sex}_rigger_wraps',
            'legs': f'bdt_{sex}_alkali_breeches',
            'feet': f'bdt_{sex}_tyre_boots',
            'back': f'bdt_{sex}_salvage_canteen',
        },
        'db_matok_wrecker_boss': {
            'region': 'dam_basins',
            'head': f'bdt_{sex}_wrecker_tricorn',
            'torso': f'bdt_{sex}_container_brigandine',
            'gloves': f'bdt_{sex}_iron_gauntlets',
            'legs': f'bdt_{sex}_bilge_trousers',
            'feet': f'bdt_{sex}_jackboots',
            'back': f'bdt_{sex}_grapnel_rack',
        },
        'ac_dune_ambusher': {
            'region': 'arid_corridors',
            'head': f'bdt_{sex}_indigo_litham',
            'torso': f'bdt_{sex}_raider_abaya',
            'gloves': f'bdt_{sex}_leather_bracers',
            'legs': f'bdt_{sex}_alkali_breeches',
            'feet': f'bdt_{sex}_dune_sandals',
            'back': f'bdt_{sex}_camel_waterskin',
        },
        'ac_camel_jezailchi': {
            'region': 'arid_corridors',
            'head': f'bdt_{sex}_glare_turban',
            'torso': f'bdt_{sex}_bandolier_caftan',
            'gloves': f'bdt_{sex}_leather_bracers',
            'legs': f'bdt_{sex}_alkali_breeches',
            'feet': f'bdt_{sex}_desert_boots',
            'back': f'bdt_{sex}_powder_fork_pack',
        },
        'ac_oasis_emir_renegade': {
            'region': 'arid_corridors',
            'head': f'bdt_{sex}_crimson_agal_helm',
            'torso': f'bdt_{sex}_looted_jubba',
            'gloves': f'bdt_{sex}_leather_bracers',
            'legs': f'bdt_{sex}_silk_shalwar',
            'feet': f'bdt_{sex}_desert_boots',
            'back': f'bdt_{sex}_plunder_saddlebag',
        },
        'ih_broken_stair_footpad': {
            'region': 'imperial_highways',
            'head': f'bdt_{sex}_highway_slouch',
            'torso': f'bdt_{sex}_oilskin_cape_coat',
            'gloves': f'bdt_{sex}_cuffed_gloves',
            'legs': f'bdt_{sex}_riding_breeches',
            'feet': f'bdt_{sex}_jackboots',
            'back': f'bdt_{sex}_bedroll_satchel',
        },
        'ih_legion_deserter': {
            'region': 'imperial_highways',
            'head': f'bdt_{sex}_defaced_galea',
            'torso': f'bdt_{sex}_slashed_lorica',
            'gloves': f'bdt_{sex}_iron_gauntlets',
            'legs': f'bdt_{sex}_pteruges_kilt',
            'feet': f'bdt_{sex}_bare_caligae',
            'back': f'bdt_{sex}_ragged_sagum',
        },
        'ih_boiling_bay_wrecker': {
            'region': 'imperial_highways',
            'head': f'bdt_{sex}_tarred_souwester',
            'torso': f'bdt_{sex}_wrecker_smock',
            'gloves': f'bdt_{sex}_rigger_wraps',
            'legs': f'bdt_{sex}_bilge_trousers',
            'feet': f'bdt_{sex}_tyre_boots',
            'back': f'bdt_{sex}_false_beacon_pack',
        },
        'hp_fellgang_reiver': {
            'region': 'highland_passes',
            'head': f'bdt_{sex}_spiked_pot_helm',
            'torso': f'bdt_{sex}_fellgang_harness',
            'gloves': f'bdt_{sex}_iron_gauntlets',
            'legs': f'bdt_{sex}_fell_trews',
            'feet': f'bdt_{sex}_fell_boots',
            'back': f'bdt_{sex}_trophy_chain_pack',
        },
        'hp_godsgate_toll_taker': {
            'region': 'highland_passes',
            'head': f'bdt_{sex}_breath_salt_hood',
            'torso': f'bdt_{sex}_pass_gambeson',
            'gloves': f'bdt_{sex}_cuffed_gloves',
            'legs': f'bdt_{sex}_fell_trews',
            'feet': f'bdt_{sex}_fell_boots',
            'back': f'bdt_{sex}_arbalest_quiver',
        },
        'hp_crag_warlord': {
            'region': 'highland_passes',
            'head': f'bdt_{sex}_horned_scrap_crown',
            'torso': f'bdt_{sex}_warlord_hauberk',
            'gloves': f'bdt_{sex}_iron_gauntlets',
            'legs': f'bdt_{sex}_fell_trews',
            'feet': f'bdt_{sex}_fell_boots',
            'back': f'bdt_{sex}_fur_war_cape',
        },
        'bf_nazar_chainbreaker': {
            'region': 'bf03_chainbreakers',
            'head': f'bdt_{sex}_chainbreaker_band',
            'torso': f'bdt_{sex}_shackle_cuirass',
            'gloves': f'bdt_{sex}_shackle_manacles',
            'legs': f'bdt_{sex}_pteruges_kilt',
            'feet': f'bdt_{sex}_bare_caligae',
            'back': f'bdt_{sex}_broken_yoke_pack',
        },
        'bf_retort_raider': {
            'region': 'bf06_glasseaters',
            'head': f'bdt_{sex}_retort_goggles_cowl',
            'torso': f'bdt_{sex}_grenadier_coat',
            'gloves': f'bdt_{sex}_cuffed_gloves',
            'legs': f'bdt_{sex}_alkali_breeches',
            'feet': f'bdt_{sex}_desert_boots',
            'back': f'bdt_{sex}_naphtha_alembic_pack',
        },
        'bf_fume_gang': {
            'region': 'bf09_fumegangs',
            'head': f'bdt_{sex}_siphon_gasmask',
            'torso': f'bdt_{sex}_fume_oilskin',
            'gloves': f'bdt_{sex}_rigger_wraps',
            'legs': f'bdt_{sex}_bilge_trousers',
            'feet': f'bdt_{sex}_tyre_boots',
            'back': f'bdt_{sex}_biogel_scrubber_tank',
        },
        'bf_unsacrificed': {
            'region': 'bf10_unsacrificed',
            'head': f'bdt_{sex}_inverted_altar_mask',
            'torso': f'bdt_{sex}_altar_fugitive_wrap',
            'gloves': f'bdt_{sex}_shackle_manacles',
            'legs': f'bdt_{sex}_solstice_ragged_kilt',
            'feet': f'bdt_{sex}_dune_sandals',
            'back': f'bdt_{sex}_stolen_relic_bundle',
        },
    }


def build_bandits_peoples_entry():
    return {
        'id': 'bandits',
        'name': 'Bandits & Outlaw Confederacies',
        'note': (
            "Regionally differentiated frontier outlaws across Krator's four outlaw corridors — Boatmurder dry-sea "
            "hulk-cutters & Matok wreckers (`dam_basins`), Catch/Mid-Basin litham & jezail raiders (`arid_corridors`), "
            "Broken-Stair highwaymen & mutinous legion deserters (`imperial_highways`), and spiked-salvage mountain "
            "reivers (`highland_passes`) — plus four signature named outlaw confederacies: BF-03 Nazar Maroon "
            "Chain-Breakers, BF-06 Badland Glass-Eater Retort-Raiders, BF-09 Siphon-Pit Fume-Gangs, and BF-10 The Unsacrificed."
        ),
        'ancestry': {'african': [0.15, 0.55], 'asian': [0.20, 0.60], 'caucasian': [0.15, 0.55]},
        'skin': ['#e0be9e', '#c7966c', '#9e6c46', '#764e32', '#523624'],
        'hair': ['#181412', '#2b2018', '#4a3322', '#6e4c30', '#8c6238'],
        'eyes': ['#3b2414', '#5a3a22', '#6e5a2e', '#4a5a3a', '#4e6a80'],
        'grey': 0.48,
        'beard': 0.48,
        'morph': {
            'muscle': [-0.05, 0.75],
            'weight': [-0.40, 0.40],
        },
        'styles': {
            'male': ['short02', 'cortu_short_messy_hair', 'long01', 'ponytail01', 'braid01', 'punkduck_alpha7_long', 'Low_Fade'],
            'female': ['braid01', 'ponytail01', 'long01', 'bob02', 'elvs_double_mh_braid', 'punkduck_alpha7_curly', 'short03'],
        },
        'tiers': BANDIT_TIER_SHARES,
        'tier_labels': BANDIT_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_bandits_kit():
    entries = []
    with _bandit_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_shared_pieces(sex))
            entries.extend(_build_bandit_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_bandits_kit()
    peoples_entry = build_bandits_peoples_entry()
    manifest_path = CULTURES_DIR / 'bandits_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'bandits',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Bandit pieces ({n_m} male, {n_f} female) across 16 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
