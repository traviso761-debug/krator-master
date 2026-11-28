"""Ring Sea Sailors, Smugglers & Corsairs Wardrobe Kit (`ring_sea_mariners` — 20 Tiers).

Packages the complete `1.93–2.0 atm` Ring Sea maritime underworld & polyglot ship-crew roster
(`mpfb_male` `rsm_m_*` & `mpfb_female` `rsm_f_*` — 100% procedural MPFB parity, manifest-only mode):

  A. Working Merchant & Truce-Port Sailors (6 tiers = 0.34):
   1. `sail_deckhand`             (`0.08`) — Multi-Ethnic Drua/Dhoni/Corbita Able Seaman
   2. `sail_topman`               (`0.06`) — Rigging Topman & Masthead Lookout (`gill_safe: True`)
   3. `sail_caulker`              (`0.05`) — I-02 Bitumen-Pitch Caulker & Salvage-Tug Bosun's Mate
   4. `sail_harpooner`            (`0.05`) — Reef-Shelf Leviathan Harpooner (`gill_safe: True`)
   5. `sail_packet_pilot`         (`0.05`) — Greta Charta Strait-Pilot & Ys–Hook–Dilihan Quartermaster
   6. `sail_mira_broker`          (`0.05`) — Port Mira 50-km Truce-Zone Harbour Broker & Purser

  B. Coastal & Cove Smugglers / Wreckers incl. Boiling-Bay Brimstone (6 tiers = 0.32):
   7. `smug_night_rower`          (`0.06`) — Knal de Ismoglarz Water-Gate Silent Skiff Rower
   8. `smug_ranj_runner`          (`0.06`) — SW Throne Lava-Tube Contraband Ranj & Ranjrum Runner
   9. `smug_pearl_diver`          (`0.05`) — Unlicensed Ys Flooded-Lab Relic & Pearl Poacher (`gill_safe: True`)
  10. `smug_steam_cove`           (`0.05`) — Boiling-Bay Brimstone & Steampits Screamer Dead-Drop Runner
  11. `smug_wrecker`              (`0.05`) — Lee-Shore False-Beacon Brimstone Wrecker & Reef-Scavenger
  12. `smug_supercargo`           (`0.05`) — De Xedaz / Shanty Double-Ledger Supercargo & Fence

  C. Ring Sea Pirates, Hooked-Sun Freebooters & Iconic PF / Lore Bosses (8 tiers = 0.34 + 0.00 Boss):
  13. `pir_ark_corsair`           (`0.07`) — Noah's Regret Catamaran Ark-Corsair (`gill_safe: True`)
  14. `pir_hook_boarder`          (`0.06`) — Hookfleet Hooked-Sun Vanguard Boarder
  15. `pir_lantaka_gunner`        (`0.05`) — Bronze Lantaka Swivel-Gunner & Captured-Republic Cannoneer
  16. `pir_press_bosun`           (`0.05`) — Gibbet-Quay Press-Gang Bosun & Master-at-Arms
  17. `pir_quartermaster`         (`0.04`) — Sharkskin & Ancient-Hull-Plate Quartermaster
  18. `pir_emperor_captain`       (`0.04`) — Emparaz Pirataz Nostalgia Freebooter Captain
  19. `pf_marxal_restorationist`  (`0.03`) — PF-01 Admiral Vasko Marxal Hooked-Sun Legitimist (Imperial-Purple & Gold Greatcoat + Bicorne)
  20. `hero_bloody_ruephus`       (`0.00`) — Dread Admiral Bloody Ruephus, Pirate-King of Noah's Regret (`important_npc`)

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/ring_sea_mariners.py
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
from garments.types.armor import (
    cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_rings, sculpted_faceplate, hood, brim, crown_band,
)
from garments.types.accoutrements import (
    blob, belt_sash, tube, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

MARINER_COLORS = {
    'rsm_tar_pitch':        (0.0055, 0.0060, 0.0078),
    'rsm_sail_unbleached':  (0.6941, 0.6320, 0.4878),
    'rsm_slop_indigo':      (0.0090, 0.0290, 0.0824),
    'rsm_marr_navy':        (0.0046, 0.0152, 0.0399),
    'rsm_oilskin_amber':    (0.3489, 0.1480, 0.0135),
    'rsm_foulweather_ochre':(0.5605, 0.2674, 0.0210),
    'rsm_hawser_hemp':      (0.3889, 0.2632, 0.1036),
    'rsm_antifouling_red':  (0.2801, 0.0170, 0.0090),
    'rsm_ruephus_crimson':  (0.3889, 0.0078, 0.0078),
    'rsm_hook_gold':        (0.7155, 0.3889, 0.0278),
    'rsm_shark_shagreen':   (0.0582, 0.0697, 0.0824),
    'rsm_barnacle_chalk':   (0.7083, 0.6800, 0.5860),
    'rsm_verdigris_brine':  (0.0329, 0.1801, 0.1420),
    'rsm_ranj_amber':       (0.4878, 0.0415, 0.0066),
    'rsm_voth_purple':      (0.0677, 0.0135, 0.1332),
    'rsm_cove_kelp':        (0.0170, 0.0356, 0.0210),
    'rsm_brimstone_sulfur': (0.6800, 0.5800, 0.0450),
}
for _k, _v in MARINER_COLORS.items():
    C.setdefault(_k, _v)

MARINER_TIER_SHARES = [
    ['sail_deckhand', 0.08],
    ['sail_topman', 0.06],
    ['sail_caulker', 0.05],
    ['sail_harpooner', 0.05],
    ['sail_packet_pilot', 0.05],
    ['sail_mira_broker', 0.05],
    ['smug_night_rower', 0.06],
    ['smug_ranj_runner', 0.06],
    ['smug_pearl_diver', 0.05],
    ['smug_steam_cove', 0.05],
    ['smug_wrecker', 0.05],
    ['smug_supercargo', 0.05],
    ['pir_ark_corsair', 0.07],
    ['pir_hook_boarder', 0.06],
    ['pir_lantaka_gunner', 0.05],
    ['pir_press_bosun', 0.05],
    ['pir_quartermaster', 0.04],
    ['pir_emperor_captain', 0.04],
    ['pf_marxal_restorationist', 0.03],
    ['hero_bloody_ruephus', 0.0],
]

MARINER_TIER_LABELS = {
    'sail_deckhand': 'Ring Sea Able Seaman & Forecastle Watch',
    'sail_topman': 'Crab-Claw & Tanja Rigging Topman',
    'sail_caulker': 'I-02 Bitumen-Pitch Caulker & Tug Bosun',
    'sail_harpooner': 'Reef-Shelf Leviathan Harpooner',
    'sail_packet_pilot': 'Greta Charta Strait-Pilot & Packet Quartermaster',
    'sail_mira_broker': 'Port Mira 50-km Truce-Zone Harbour Purser',
    'smug_night_rower': 'De Xedaz Water-Gate Silent Skiff Rower',
    'smug_ranj_runner': 'SW Throne Lava-Tube Ranj & Ranjrum Runner',
    'smug_pearl_diver': 'Unlicensed Ys Relic & Deep-Bank Pearl Poacher',
    'smug_steam_cove': 'Boiling-Bay Brimstone & Screamer Dead-Drop Runner',
    'smug_wrecker': 'PF-04 Lee-Shore Brimstone False-Beacon Wrecker',
    'smug_supercargo': 'Shanty & De Xedaz Double-Ledger Supercargo',
    'pir_ark_corsair': "Noah's Regret Catamaran Ark-Corsair",
    'pir_hook_boarder': 'Hookfleet Hooked-Sun Vanguard Boarder',
    'pir_lantaka_gunner': 'Bronze Lantaka Swivel-Gunner & Cannoneer',
    'pir_press_bosun': 'Gibbet-Quay Press-Gang Bosun',
    'pir_quartermaster': 'Sharkskin & Ark-Hull Quartermaster',
    'pir_emperor_captain': 'Emparaz Pirataz Nostalgia Freebooter Captain',
    'pf_marxal_restorationist': 'PF-01 Admiral Vasko Marxal Hooked-Sun Restorationist',
    'hero_bloody_ruephus': "Dread Admiral Bloody Ruephus (Pirate-King of Noah's Regret)",
}

_PAT_DIR = REPO_ROOT / 'core' / 'materials' / 'patterns'
_RSM_TEX_FILES = {
    'rsm_hooked_sun':    _PAT_DIR / 'pirates' / 'hooked-sun-jack' / 'albedo.jpg',
    'rsm_ruephus_jack':  _PAT_DIR / 'maritime' / 'ruephus-blood-jack' / 'albedo.jpg',
    'rsm_lanong_prize':  _PAT_DIR / 'maritime' / 'lanong-patched-prize' / 'albedo.jpg',
    'rsm_mira_signal':   _PAT_DIR / 'maritime' / 'mira-truce-signal' / 'albedo.jpg',
    'rsm_smuggler_tapa': _PAT_DIR / 'maritime' / 'smuggler-cove-tapa' / 'albedo.jpg',
    'rsm_azulejo':       _PAT_DIR / 'marr' / 'azulejo-maritime' / 'albedo.jpg',
    'rsm_compass_wave':  _PAT_DIR / 'marr' / 'compass-wave-trim' / 'albedo.jpg',
    'rsm_iron_scroll':   _PAT_DIR / 'marr' / 'iron-scrollwork' / 'albedo.jpg',
    'rsm_hinggi':        _PAT_DIR / 'islander' / 'kautoa-hinggi-ikat' / 'albedo.jpg',
    'rsm_primer':        _PAT_DIR / 'port' / 'primer' / 'albedo.jpg',
}
_RSM_TEX_CACHE = {}


def _sample_disk_sheet(key, w, h, fg, bg, blend=0.26):
    if key not in _RSM_TEX_CACHE:
        arr = None
        p = paint_mod._resolve_lfs(_RSM_TEX_FILES[key])
        if p.exists() and p.stat().st_size > 500:
            try:
                im = Image.open(p).convert('RGB')
                px = np.asarray(im, dtype=np.float32) / 255.0
                arr = np.power(np.clip(px, 0.0, 1.0), 2.2)
            except Exception:
                arr = None
        _RSM_TEX_CACHE[key] = arr
    src = _RSM_TEX_CACHE[key]
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


def _rsm_hooked_sun_vec(w, h, fg, bg):
    """Canonical 16-ray gold Sun transfixed diagonally by a barbed fish-hook on dark/purple ground."""
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = ((xx + 0.5) / max(w, 1) * 2.0) % 1.0 - 0.5
    v = (yy + 0.5) / max(h, 1) - 0.5
    r = np.hypot(u, v)
    ang = np.arctan2(v, u)
    sun_disc = r < 0.14
    sun_rays = (r >= 0.14) & (r <= 0.30) & (np.cos(ang * 16.0) > 0.52)
    shank = (np.abs(v + 0.85 * u) < 0.032) & (np.abs(u) < 0.36)
    curve = (np.hypot(u - 0.18, v - 0.15) < 0.13) & (np.hypot(u - 0.18, v - 0.15) > 0.075) & (v > 0.08)
    rail = np.abs(v) > 0.42
    img[sun_disc | sun_rays | shank | curve | rail] = fg
    return np.clip(img, 0.0, 1.0)


def _rsm_ruephus_skull_vec(w, h, fg, bg):
    """Stylized bleached-chalk skull & crossed femurs over salt-crust bands."""
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = ((xx + 0.5) / max(w, 1) * 3.0) % 1.0 - 0.5
    v = (yy + 0.5) / max(h, 1) - 0.5
    cranium = np.hypot(u, (v + 0.08) * 1.15) < 0.19
    jaw = (np.abs(u) < 0.10) & (v >= 0.04) & (v <= 0.18)
    eyes = (np.hypot(np.abs(u) - 0.065, v + 0.06) < 0.042)
    xb1 = (np.abs((v - 0.24) - 0.55 * u) < 0.032) & (np.abs(u) < 0.34)
    xb2 = (np.abs((v - 0.24) + 0.55 * u) < 0.032) & (np.abs(u) < 0.34)
    img[(cranium | jaw | xb1 | xb2) & ~eyes] = fg
    return np.clip(img, 0.0, 1.0)


def _rsm_slop_stripes(w, h, fg, bg):
    """Bold forecastle warp-striped sea-slops with lower salt-bleach gradient."""
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)
    st = ((u * 18.0) % 1.0) < 0.46
    img[:] = bg
    img[st] = fg
    bleach = np.clip((v - 0.72) / 0.28, 0.0, 1.0)[..., None] * 0.18
    return np.clip(img + bleach, 0.0, 1.0)


@contextmanager
def _mariner_motif_ctx():
    orig = paint_mod.motif

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in _RSM_TEX_FILES:
            return _sample_disk_sheet(style, w, h, fg, bg)
        if style == 'rsm_hooked_sun_vec':
            return _rsm_hooked_sun_vec(w, h, fg, bg)
        if style == 'rsm_ruephus_skull_vec':
            return _rsm_ruephus_skull_vec(w, h, fg, bg)
        if style == 'rsm_slop_stripes':
            return _rsm_slop_stripes(w, h, fg, bg)
        return orig(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched
    try:
        yield
    finally:
        paint_mod.motif = orig


# ===========================================================================================================
# SHARED GEOMETRY HELPERS (100% Pitfall-Checked)
# ===========================================================================================================
def _open_brow_dome(name, paint, f_brow=0.63, f_low=0.10, high=1.14, ease=0.018, rows=12, n=36):
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
# SHARED / REUSABLE MARITIME LOWERS, FOOTWEAR & GLOVES (`rsm_{s}_*`)
# ===========================================================================================================
def _build_shared_pieces(sex):
    entries = []

    # 1. Striped forecastle sea-slops (rolled below knee for bare/sandal deck work)
    p_slop = P('rsm_sail_unbleached', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'rsm_slop_indigo'),
    ], [PN(0.0, 1.0, 'rsm_slop_stripes', 'rsm_slop_indigo', 'rsm_sail_unbleached', 0.22)], fabric='cloth.slops.abaca_stripe')
    entries.append(assemble_garment(
        f'rsm_{sex}_deck_slops', 'Rolled Indigo-Stripe Abaca Sea-Slops', 'legs', 'ring_sea_mariners',
        trousers(f'rsm_{sex}_deck_slops', p_slop, ankle_f=0.28, ease=0.015, bag=0.009, rows=11, n=22),
        legged=True,
    ))

    # 2. Pitch-tarred shipyard & cove work breeches (tucked into boots: ease=0.014, bag=0.008)
    p_tar_leg = P('rsm_tar_pitch', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'rsm_oilskin_amber'),
    ], fabric='cloth.oilskin.tarred_seams')
    entries.append(assemble_garment(
        f'rsm_{sex}_tarred_breeches', 'Tar-Waxed Shipyard & Cove Breeches', 'legs', 'ring_sea_mariners',
        trousers(f'rsm_{sex}_tarred_breeches', p_tar_leg, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 3. Cream duck officer & packet-pilot sea-breeches
    p_duck = P('rsm_sail_unbleached', 0.04, [
        B('bottom', 0.0, 0.04, 'rsm_compass_wave', 'rsm_marr_navy', 'rsm_sail_unbleached', 0.09),
    ], fabric='cloth.linen.sea')
    entries.append(assemble_garment(
        f'rsm_{sex}_officer_breeches', 'Bleached Sea-Duck Officer Breeches', 'legs', 'ring_sea_mariners',
        trousers(f'rsm_{sex}_officer_breeches', p_duck, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 4. Lanong patched-prize corsair slops
    p_prz = P('rsm_antifouling_red', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'rsm_tar_pitch'),
    ], [PN(0.0, 1.0, 'rsm_lanong_prize', 'rsm_hook_gold', 'rsm_antifouling_red', 0.24)], fabric='cloth.slops.abaca_stripe')
    entries.append(assemble_garment(
        f'rsm_{sex}_prize_slops', 'Patched-Prize Corsair Sea-Breeches', 'legs', 'ring_sea_mariners',
        trousers(f'rsm_{sex}_prize_slops', p_prz, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 5. Captured Vothic purple & gold Pirate-Emperor court breeches
    p_emp_leg = P('rsm_voth_purple', 0.04, [
        B('bottom', 0.0, 0.05, 'rsm_hooked_sun_vec', 'rsm_hook_gold', 'rsm_voth_purple', 0.12),
    ], [PN(0.0, 1.0, 'stripes', 'rsm_tar_pitch', 'rsm_voth_purple', 0.18)], fabric='cloth.silk.slub')
    entries.append(assemble_garment(
        f'rsm_{sex}_imperial_breeches', 'Captured Purple Damask Breeches & Hinged Gilded Tassets', 'legs', 'ring_sea_mariners',
        trousers(f'rsm_{sex}_imperial_breeches', p_emp_leg, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22)
        + hinged_tassets(f'rsm_{sex}_imp_htass', P('rsm_voth_purple', 0.03, fabric='metal.steel.hammered'),
                         trim_paint=P('rsm_hook_gold', 0.03, fabric='metal.gold'), lames=3, ease=0.022),
        legged=True,
    ))

    # 6. Reef-kelp & ikat harpooner/diver knee-kilt (`WAIST - 0.044`, `legged=False`)
    p_reef_k = P('rsm_cove_kelp', 0.05, [
        B('bottom', 0.0, 0.06, 'rsm_hinggi', 'rsm_barnacle_chalk', 'rsm_antifouling_red', 0.12),
    ], fabric='cloth.seaweed')
    entries.append(assemble_garment(
        f'rsm_{sex}_reef_kiltslops', 'Kelp-Weave & Hinggi Reef-Harpooner Kilt', 'legs', 'ring_sea_mariners',
        [torso_tube(f'rsm_{sex}_rkilt', core.WAIST - 0.044, core.KNEE + 0.04, 0.025, p_reef_k,
                    n=40, rows=14, hang_from=core.WAIST - 0.044, flare=0.080)],
        legged=False,
    ))

    # --- Footwear (5 styles: 2 open deck/reef sandals + 3 sea-boots with ease_top=0.024) ---
    entries.append(assemble_garment(
        f'rsm_{sex}_deck_sandals', 'Braided Abaca & Rope-Loop Deck Sandals', 'feet', 'ring_sea_mariners',
        sandal(f'rsm_{sex}_deck_sandals', P('rsm_hawser_hemp', 0.06, fabric='straw.plaited'),
               P('rsm_tar_pitch', 0.05), guard=False, laces=2),
    ))

    entries.append(assemble_garment(
        f'rsm_{sex}_reef_sandals', 'Lead-Weighted Kelp & Coir Reef Sandals', 'feet', 'ring_sea_mariners',
        sandal(f'rsm_{sex}_reef_sandals', P('rsm_cove_kelp', 0.06, fabric='cloth.seaweed'),
               P('rsm_verdigris_brine', 0.05), guard=False, laces=3),
    ))

    p_tyre_b = P('rsm_tar_pitch', 0.06, [B('top', 0.0, 0.04, 'solid', 'rsm_oilskin_amber')], fabric='rubber.tyre')
    entries.append(assemble_garment(
        f'rsm_{sex}_caulk_boots', 'Tyre-Soled Pitch-Deck & Sinter Sea-Boots', 'feet', 'ring_sea_mariners',
        boots(f'rsm_{sex}_caulk_boots', P('rsm_tar_pitch', 0.07, fabric='rubber.tyre'), p_tyre_b,
              top=0.39, ease_top=0.024),
    ))

    p_sea_b = P('saddle', 0.05, [B('top', 0.0, 0.05, 'solid', 'rsm_hook_gold')], fabric='leather.cuir_bouilli')
    entries.append(assemble_garment(
        f'rsm_{sex}_sea_jackboots', 'Turned-Cuff Mariner & Corsair Sea-Boots', 'feet', 'ring_sea_mariners',
        boots(f'rsm_{sex}_sea_jackboots', P('rsm_tar_pitch', 0.06), p_sea_b,
              top=0.44, ease_top=0.024, cuff_paint=P('rsm_marr_navy', 0.05, fabric='leather.polished')),
    ))

    p_rue_b = P('rsm_ruephus_crimson', 0.05, [B('top', 0.0, 0.05, 'solid', 'rsm_barnacle_chalk')],
                fabric='metal.steel.hammered')
    p_rue_g = P('rsm_hook_gold', 0.03, fabric='metal.gold')
    entries.append(assemble_garment(
        f'rsm_{sex}_admiral_jackboots', 'Salt-Crusted Reliquary & Sculpted Steel Admiral Greaves', 'feet', 'ring_sea_mariners',
        boots(f'rsm_{sex}_admiral_jackboots', P('rsm_tar_pitch', 0.05), p_rue_b,
              top=0.22, ease_top=0.020)
        + sculpted_greaves(f'rsm_{sex}_adm_sgrv', p_rue_b, trim_paint=p_rue_g, poleyn=True, ease=0.020),
    ))

    # --- Gloves & Bracers (5 styles) ---
    p_mitt = P('rsm_hawser_hemp', 0.06, [B('top', 0.0, 0.03, 'solid', 'rsm_tar_pitch')], fabric='leather.buckskin')
    entries.append(assemble_garment(
        f'rsm_{sex}_deck_wraps', 'Salted-Rawhide & Tarred Cordage Rigging Wraps', 'gloves', 'ring_sea_mariners',
        [sleeve(f'rsm_{sex}_dwrp_L', L, p_mitt, f0=0.62, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'rsm_{sex}_dwrp_R', R, p_mitt, f0=0.62, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    p_shag = P('rsm_shark_shagreen', 0.04, [B('top', 0.0, 0.03, 'solid', 'rsm_verdigris_brine')],
               fabric='leather.shagreen.rayskin')
    entries.append(assemble_garment(
        f'rsm_{sex}_sharkskin_bracers', 'Pelagic Sharkskin & Verdigris-Bronze Vambraces', 'gloves', 'ring_sea_mariners',
        [sleeve(f'rsm_{sex}_shg_L', L, p_shag, f0=0.56, f1=0.94, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'rsm_{sex}_shg_R', R, p_shag, f0=0.56, f1=0.94, ease=0.014, flare=0.004, rows=7, n=20)],
    ))

    entries.append(assemble_garment(
        f'rsm_{sex}_officer_cuffs', 'Waxed Kidskin Pilot & Supercargo Gauntlets', 'gloves', 'ring_sea_mariners',
        full_gloves(f'rsm_{sex}_officer_cuffs', P('rsm_marr_navy', 0.04, fabric='leather.polished'),
                    P('saddle', 0.04, fabric='leather.polished'), f0=0.58, ease=0.014),
    ))

    p_bg_iron = P('rsm_antifouling_red', 0.05, [B('top', 0.0, 0.04, 'solid', 'rsm_hook_gold')], fabric='metal.iron')
    p_bg_brz = P('rsm_hook_gold', 0.03, fabric='metal.bronze')
    entries.append(assemble_garment(
        f'rsm_{sex}_boarding_gauntlets', 'Sculpted Iron-Plate & Scorched Pigskin Boarding Gauntlets', 'gloves', 'ring_sea_mariners',
        full_gloves(f'rsm_{sex}_boarding_gauntlets', p_bg_iron,
                    P('rsm_tar_pitch', 0.05, fabric='leather.foundry.pigskin'), f0=0.80, ease=0.012,
                    knuckle_paint=p_bg_brz)
        + sculpted_vambraces(f'rsm_{sex}_brd_vam', p_bg_iron, trim_paint=p_bg_brz, couter=True, ease=0.016),
    ))

    entries.append(assemble_garment(
        f'rsm_{sex}_admiral_cuffs', 'Gold-Galloon & Shagreen Pirate-Emperor Cuffs', 'gloves', 'ring_sea_mariners',
        full_gloves(f'rsm_{sex}_admiral_cuffs',
                    P('rsm_voth_purple', 0.03, [B('top', 0.0, 0.05, 'solid', 'rsm_hook_gold')], fabric='cloth.velvet.cut'),
                    P('rsm_shark_shagreen', 0.04, fabric='leather.shagreen.rayskin'),
                    f0=0.55, ease=0.014, knuckle_paint=P('rsm_hook_gold', 0.02, fabric='metal.gold')),
    ))

    return entries


# ===========================================================================================================
# 20 RING SEA MARITIME TIERS (`head`, `torso`, `back`)
# ===========================================================================================================
def _build_mariner_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    # ==================== A. WORKING SAILORS (6 TIERS) ====================

    # --- S-1. sail_deckhand ---
    gid_h = f'rsm_{sex}_deck_bandana'
    db_band = head_rings(f'{gid_h}_bandana', 0.60, 0.72, 0.004,
                         P('rsm_slop_indigo', 0.05, [B('bottom', 0.0, 0.03, 'stripes', 'rsm_sail_unbleached', 'rsm_slop_indigo', 0.08)],
                           fabric=COTTON), n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Knotted Salt-Faded Indigo Deckhand Bandana', 'head', 'ring_sea_mariners',
                                    [db_band], covers_hair=False))

    gid_t = f'rsm_{sex}_deck_jumper'
    jmp_p = P('rsm_sail_unbleached', 0.05, [
        B('bottom', 0.0, 0.05, 'stripes', 'rsm_slop_indigo', 'rsm_sail_unbleached', 0.08),
        B('top', 0.0, 0.04, 'solid', 'rsm_slop_indigo'),
    ], fabric='cloth.linen.sea')
    jumper = torso_tube(f'{gid_t}_smock', core.TOP, core.WAIST - 0.052, 0.025, jmp_p, n=40, rows=14, flare=0.048)
    d_belt = belt_sash(f'{gid_t}_belt', core.WAIST - 0.014, core.WAIST + 0.028,
                       P('rsm_hawser_hemp', 0.05, fabric='leather.buckskin'), ease=0.030)
    entries.append(assemble_garment(gid_t, 'Unbleached Sail-Duck Sea-Smock & Marlinspike Belt', 'torso', 'ring_sea_mariners',
                                    [jumper, d_belt, sleeves(gid_t, 'elbow', 0.018, jmp_p)]))

    gid_b = f'rsm_{sex}_deck_dittybag'
    pad, anc = _dorsal_pad(gid_b, P('rsm_sail_unbleached', 0.05), clearance=0.030)
    ditty = blob(f'{gid_b}_bag', anc + BACK_DIR * 0.024, (0.14, 0.065, 0.21), jmp_p,
                 n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Canvas Seaman Ditty-Bag & Hemp Line', 'back', 'ring_sea_mariners', [pad, ditty]))

    # --- S-2. sail_topman (`gill_safe: True`) ---
    gid_h = f'rsm_{sex}_top_knitcap'
    knit_p = P('madder', 0.05, [B('bottom', 0.0, 0.05, 'stripes', 'rsm_marr_navy', 'madder', 0.08)], fabric='cloth.gansey.sea_knit')
    beanie = _open_brow_dome(f'{gid_h}_beanie', knit_p, f_brow=0.63, f_low=0.16, high=1.14, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Rolled Madder-Wool Topman Watch-Beanie', 'head', 'ring_sea_mariners',
                                    [beanie], covers_hair=True))

    gid_t = f'rsm_{sex}_top_vest'
    rope_p = P('rsm_hawser_hemp', 0.06, [B('top', 0.0, 0.02, 'solid', 'rsm_tar_pitch')], fabric='straw.plaited')
    if sex == 'm':
        t_parts = [
            crossed_sash(f'{gid_t}_harness', rope_p, width=0.062, ease=0.022),
            belt_sash(f'{gid_t}_belt', core.WAIST - 0.014, core.WAIST + 0.030, P('rsm_tar_pitch', 0.05), ease=0.024),
        ]
    else:
        stroph = torso_tube(f'{gid_t}_strophion', core.CHEST + 0.06, core.CHEST - 0.07, 0.020,
                            P('rsm_sail_unbleached', 0.04, fabric='cloth.linen.sea'), n=38, rows=7)
        t_parts = [stroph, crossed_sash(f'{gid_t}_harness', rope_p, width=0.055, ease=0.026)]
    entries.append(assemble_garment(gid_t, 'Open-Rib Gill-Safe Rigging Harness & Bosun Pipe', 'torso', 'ring_sea_mariners',
                                    t_parts, open_torso=True))

    gid_b = f'rsm_{sex}_top_halyard'
    pad, anc = _dorsal_pad(gid_b, P('rsm_hawser_hemp', 0.05), clearance=0.026)
    blk = rosette(f'{gid_b}_pulley', anc + BACK_DIR * 0.020, BACK_DIR, left, 0.092, rope_p, n=16, thick=0.022, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Yardarm Pulley-Block & Splicing-Fid Harness', 'back', 'ring_sea_mariners', [pad, blk]))

    # --- S-3. sail_caulker ---
    gid_h = f'rsm_{sex}_caulk_souwester'
    sw_p = P('rsm_foulweather_ochre', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'rsm_tar_pitch')], fabric='cloth.kelp.oilskin')
    sw_d = _open_brow_dome(f'{gid_h}_dome', sw_p, f_brow=0.64, f_low=0.14, ease=0.013)
    sw_b = brim(f'{gid_h}_brim', 0.63, 0.090, sw_p, ease=0.013, droop=0.025)
    entries.append(assemble_garment(gid_h, 'Ochre Foul-Weather Caulker Souwester', 'head', 'ring_sea_mariners',
                                    [sw_d, sw_b], covers_hair=True))

    gid_t = f'rsm_{sex}_caulk_apron'
    gns_p = P('rsm_marr_navy', 0.05, fabric='cloth.gansey.sea_knit')
    gansey = torso_tube(f'{gid_t}_gansey', core.TOP, core.WAIST - 0.052, 0.026, gns_p, n=40, rows=14, flare=0.048)
    apron = tabard(f'{gid_t}_bib', core.WAIST - 0.03, core.TOP - 0.02,
                   P('rsm_tar_pitch', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'rsm_oilskin_amber')], fabric='cloth.oilskin.tarred_seams'),
                   width=0.21, ease=0.033, front=True, back=False)
    entries.append(assemble_garment(gid_t, 'I-02 Bitumen-Stained Caulking Apron & Navy Gansey', 'torso', 'ring_sea_mariners',
                                    [gansey, apron, sleeves(gid_t, 'elbow', 0.019, gns_p)]))

    gid_b = f'rsm_{sex}_caulk_pitchkit'
    pad, anc = _dorsal_pad(gid_b, P('rsm_tar_pitch', 0.05), clearance=0.031)
    p_pot = blob(f'{gid_b}_bucket', anc + BACK_DIR * 0.026, (0.13, 0.070, 0.17),
                 P('bark', 0.05, [B('top', 0.0, 0.04, 'solid', 'rsm_tar_pitch')], fabric='leather.cuir_bouilli'),
                 n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Bitumen Pitch-Bucket & Oakum Hanks Kit', 'back', 'ring_sea_mariners', [pad, p_pot]))

    # --- S-4. sail_harpooner (`gill_safe: True`) ---
    gid_h = f'rsm_{sex}_harp_brim'
    pan_p = P('rsm_sail_unbleached', 0.05, [B('bottom', 0.0, 0.04, 'rsm_hinggi', 'rsm_antifouling_red', 'rsm_sail_unbleached', 0.10)],
              fabric='straw.plaited')
    hp_d = _open_brow_dome(f'{gid_h}_crown', pan_p, f_brow=0.64, f_low=0.20, ease=0.012)
    hp_b = brim(f'{gid_h}_brim', 0.64, 0.105, pan_p, ease=0.012, droop=0.012)
    entries.append(assemble_garment(gid_h, 'Plaited Pandanus Reef-Glare Hat & Bone Pins', 'head', 'ring_sea_mariners',
                                    [hp_d, hp_b], covers_hair=True))

    gid_t = f'rsm_{sex}_harp_jerkin'
    shg_p = P('rsm_shark_shagreen', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'bone')], fabric='leather.shagreen.rayskin')
    if sex == 'm':
        h_parts = [
            crossed_sash(f'{gid_t}_sash', shg_p, width=0.072, ease=0.018),
            pauldron(f'{gid_t}_throw_pld', L, shg_p, reach=0.34, ease=0.011),
        ]
    else:
        h_halter = torso_tube(f'{gid_t}_halter', core.CHEST + 0.06, core.CHEST - 0.07, 0.020, shg_p, n=38, rows=7)
        h_parts = [h_halter, crossed_sash(f'{gid_t}_sash', shg_p, width=0.058, ease=0.026)]
    entries.append(assemble_garment(gid_t, 'Gill-Safe Sharkskin Throwing-Sash & Bone Toggles', 'torso', 'ring_sea_mariners',
                                    h_parts, open_torso=True))

    gid_b = f'rsm_{sex}_harp_tubeline'
    pad, anc = _dorsal_pad(gid_b, P('rsm_shark_shagreen', 0.05), clearance=0.026)
    l_tub = rosette(f'{gid_b}_linetub', anc + BACK_DIR * 0.022, BACK_DIR, left, 0.105,
                    P('rsm_hawser_hemp', 0.05, fabric='straw.plaited'), n=16, thick=0.025, rigid_joint='Spine2')
    gourd = blob(f'{gid_b}_float', anc + up * 0.12 + BACK_DIR * 0.032, (0.065, 0.058, 0.095),
                 P('rsm_oilskin_amber', 0.04, fabric='leather.polished'), n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Coiled 150-m Abaca Harpoon-Line Tub & Gourd Float', 'back', 'ring_sea_mariners',
                                    [pad, l_tub, gourd]))

    # --- S-5. sail_packet_pilot ---
    gid_h = f'rsm_{sex}_pilot_bicorne'
    nav_p = P('rsm_marr_navy', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'rsm_hook_gold')], fabric='cloth.oilskin.tarred_seams')
    pi_d = _open_brow_dome(f'{gid_h}_crown', nav_p, f_brow=0.64, f_low=0.18, ease=0.013)
    pi_b = brim(f'{gid_h}_bicorne', 0.65, 0.092, nav_p, ease=0.013, lift=0.036, scallop=0.018)
    lp_anc = _host_anchor(pi_d, a + (b - a) * 0.72 + left * 0.036 + fwd * 0.095)
    loupe = rosette(f'{gid_h}_loupe', lp_anc + fwd * 0.005, fwd, up, 0.020,
                    P('rsm_hook_gold', 0.02, fabric='metal.bronze'), n=12, thick=0.007, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Waxed Navy Packet-Pilot Bicorne & Refraction Loupe', 'head', 'ring_sea_mariners',
                                    [pi_d, pi_b, loupe], covers_hair=True))

    gid_t = f'rsm_{sex}_pilot_pea_coat'
    pea_p = P('rsm_marr_navy', 0.04, [
        B('bottom', 0.0, 0.06, 'rsm_compass_wave', 'rsm_hook_gold', 'rsm_verdigris_brine', 0.10),
    ], fabric=WOOL)
    peacoat = torso_tube(f'{gid_t}_reefer', core.TOP, core.KNEE + 0.08, 0.038, pea_p, n=42, rows=19, hang_from=core.WAIST, flare=0.115)
    p_col = collar(f'{gid_t}_collar', P('rsm_verdigris_brine', 0.04, fabric=WOOL), height=0.048, ease=0.026)
    p_sash = crossed_sash(f'{gid_t}_trumpet_sash', P('saddle', 0.04, fabric='leather.polished'), width=0.050, ease=0.042)
    entries.append(assemble_garment(gid_t, 'Double-Breasted Packet Reefer Jacket & Lead-Line', 'torso', 'ring_sea_mariners',
                                    [peacoat, p_col, p_sash, sleeves(gid_t, 'wrist', 0.020, pea_p)]))

    gid_b = f'rsm_{sex}_pilot_charttube'
    pad, anc = _dorsal_pad(gid_b, P('rsm_marr_navy', 0.04), clearance=0.042)
    rtube = tube(f'{gid_b}_rutter', [anc - up * 0.15 - left * 0.06 + BACK_DIR * 0.026, anc + up * 0.16 + left * 0.06 + BACK_DIR * 0.026],
                 0.032, P('saddle', 0.04, [B('top', 0.0, 0.04, 'solid', 'rsm_hook_gold')], fabric='leather.cuir_bouilli'),
                 n=12, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Waxed Greta Charta Rutter-Tube & Octant Case', 'back', 'ring_sea_mariners', [pad, rtube]))

    # --- S-6. sail_mira_broker ---
    gid_h = f'rsm_{sex}_mira_tricorn'
    mir_p = P('rsm_verdigris_brine', 0.04, [B('bottom', 0.0, 0.04, 'rsm_azulejo', 'rsm_sail_unbleached', 'rsm_verdigris_brine', 0.10)],
              fabric=WOOL)
    mr_d = _open_brow_dome(f'{gid_h}_crown', mir_p, f_brow=0.64, f_low=0.20, ease=0.013)
    mr_b = brim(f'{gid_h}_tricorn', 0.65, 0.088, mir_p, ease=0.013, lift=0.034, scallop=0.022)
    tr_anc = _host_anchor(mr_d, a + (b - a) * 0.76 + fwd * 0.10)
    truce_pin = rosette(f'{gid_h}_rosette', tr_anc + fwd * 0.004, fwd, left, 0.022,
                        P('white', 0.03, [B('top', 0.0, 0.02, 'solid', 'rsm_hook_gold')], fabric='shell.nacre'),
                        n=12, thick=0.007, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Port Mira 50-km Truce-Pennant Tricorn', 'head', 'ring_sea_mariners',
                                    [mr_d, mr_b, truce_pin], covers_hair=True))

    gid_t = f'rsm_{sex}_mira_surcoat'
    ms_p = P('rsm_verdigris_brine', 0.04, [
        B('bottom', 0.0, 0.08, 'rsm_mira_signal', 'rsm_hook_gold', 'rsm_marr_navy', 0.12),
    ], [PN(0.0, 1.0, 'rsm_mira_signal', 'rsm_sail_unbleached', 'rsm_verdigris_brine', 0.22)], fabric='cloth.bazin.damask')
    m_coat = torso_tube(f'{gid_t}_surcoat', core.TOP, core.KNEE + 0.07, 0.038, ms_p, n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    assay_c = collar_disc(f'{gid_t}_assay_chain', 0.095,
                          P('nacre', 0.03, [B('bottom', 0.0, 0.03, 'beads', 'rsm_hook_gold', 'nacre', 0.08)], fabric='shell.nacre'),
                          drop=0.070, ease=0.024)
    entries.append(assemble_garment(gid_t, 'Port Mira Truce-Broker Surcoat & Shell-Talent Assay Chain', 'torso', 'ring_sea_mariners',
                                    [m_coat, assay_c, sleeves(gid_t, 'wrist', 0.019, P('rsm_sail_unbleached', 0.04, fabric='cloth.linen.sea'))]))

    gid_b = f'rsm_{sex}_mira_strongbox'
    pad, anc = _dorsal_pad(gid_b, P('rsm_verdigris_brine', 0.04), clearance=0.042)
    sbox = blob(f'{gid_b}_coffer', anc + BACK_DIR * 0.028, (0.17, 0.068, 0.19),
                P('ancient', 0.03, [B('top', 0.0, 0.04, 'solid', 'rsm_hook_gold')], fabric='armor.ancient.hex_weave'),
                n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Riveted Ancient-Alloy Manifest & Bullion Strongbox', 'back', 'ring_sea_mariners',
                                    [pad, sbox]))

    # ==================== B. COASTAL & COVE SMUGGLERS (6 TIERS) ====================

    # --- M-1. smug_night_rower ---
    gid_h = f'rsm_{sex}_row_cowl'
    rw_p = P('rsm_cove_kelp', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'rsm_tar_pitch')],
             [PN(0.0, 1.0, 'rsm_smuggler_tapa', 'rsm_cove_kelp', 'rsm_tar_pitch', 0.22)], fabric='cloth.kelp.oilskin')
    rw_hd = hood(f'{gid_h}_hood', rw_p, ease=0.028, ease_low=0.045, open_front=0.92, low=-0.20, rows=13, n=34)
    _, rw_fp = _faceplate_with_slits(gid_h, rw_p, bar_paint=P('bone', 0.04, fabric='armor.lamellar.horn'))
    entries.append(assemble_garment(gid_h, 'De Xedaz Canal-Mist Cowl & Face-Cloth', 'head', 'ring_sea_mariners',
                                    [rw_hd] + rw_fp, covers_hair=True, covers_face=True))

    gid_t = f'rsm_{sex}_row_jerkin'
    rw_jrk = torso_tube(f'{gid_t}_jerkin', core.TOP, core.WAIST - 0.052, 0.026, rw_p, n=40, rows=14, flare=0.048)
    oar_sash = belt_sash(f'{gid_t}_muffler_belt', core.WAIST - 0.014, core.WAIST + 0.028,
                         P('felt', 0.05, fabric='cloth.felt.boiled'), ease=0.032)
    entries.append(assemble_garment(gid_t, 'Bone-Toggled Silent Canal-Rower Jerkin', 'torso', 'ring_sea_mariners',
                                    [rw_jrk, oar_sash, sleeves(gid_t, 'wrist', 0.019, rw_p)]))

    gid_b = f'rsm_{sex}_row_bale'
    pad, anc = _dorsal_pad(gid_b, P('rsm_tar_pitch', 0.05), clearance=0.031)
    bale = blob(f'{gid_b}_bale', anc + BACK_DIR * 0.028, (0.18, 0.072, 0.22),
                P('rsm_cove_kelp', 0.05, [B('top', 0.0, 0.04, 'diamonds', 'rsm_hawser_hemp', 'rsm_cove_kelp', 0.10)],
                  fabric='cloth.canvas.oiled'), n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Net-Lashed Waterproof Contraband Silk Bale', 'back', 'ring_sea_mariners', [pad, bale]))

    # --- M-2. smug_ranj_runner ---
    gid_h = f'rsm_{sex}_ranj_headwrap'
    rj_p = P('rsm_tar_pitch', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'rsm_ranj_amber')],
             [PN(0.0, 1.0, 'rsm_smuggler_tapa', 'rsm_ranj_amber', 'rsm_tar_pitch', 0.22)], fabric='cloth.bark.tapa')
    rj_d = _open_brow_dome(f'{gid_h}_scarf', rj_p, f_brow=0.63, f_low=0.08, ease=0.012)
    _, rj_fp = _faceplate_with_slits(gid_h, P('rsm_ranj_amber', 0.04, fabric=COTTON),
                                     bar_paint=P('brass', 0.03, fabric='metal.bronze'),
                                     lens_paint=P('amber', 0.02, fabric='glass.moonglass.leaded'))
    entries.append(assemble_garment(gid_h, 'Lava-Tube Scarf, Night-Goggles & Ranj-Fume Kerchief', 'head', 'ring_sea_mariners',
                                    [rj_d] + rj_fp, covers_hair=True, covers_face=True))

    gid_t = f'rsm_{sex}_ranj_coat'
    rc_coat = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE + 0.07, 0.038, rj_p, n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    rc_sash = crossed_sash(f'{gid_t}_bandolier', P('rsm_ranj_amber', 0.04, fabric='leather.cuir_bouilli'), width=0.058, ease=0.043)
    ampoules = []
    for k_idx, (zf, xf) in enumerate(((0.70, -0.05), (0.50, 0.0), (0.32, 0.05))):
        z_a = core.WAIST + (core.CHEST - core.WAIST) * zf
        a_anc = _host_anchor(rc_coat, chest_front(z_a, 0.038, x=xf))
        ampoules.append(blob(f'{gid_t}_amp_{k_idx}', a_anc + fwd * 0.011, (0.022, 0.022, 0.034),
                             P('rsm_ranj_amber', 0.02, [B('top', 0.0, 0.03, 'solid', 'white')], fabric='glass.moonglass.leaded'),
                             n=10, rows=5, out=fwd, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_t, 'Cove-Runner Oiled-Tapa Coat & Ranj-Ampoule Bandolier', 'torso', 'ring_sea_mariners',
                                    [rc_coat, rc_sash] + ampoules + [sleeves(gid_t, 'wrist', 0.019, rj_p)]))

    gid_b = f'rsm_{sex}_ranj_kegpack'
    pad, anc = _dorsal_pad(gid_b, P('rsm_tar_pitch', 0.05), clearance=0.043)
    keg1 = tube(f'{gid_b}_keg1', [anc + up * 0.07 - left * 0.09 + BACK_DIR * 0.030, anc + up * 0.07 + left * 0.09 + BACK_DIR * 0.030],
                0.046, P('bark', 0.05, [B('top', 0.0, 0.04, 'solid', 'rsm_ranj_amber')], fabric='leather.cuir_bouilli'),
                n=12, rigid_joint='Spine2')
    keg2 = tube(f'{gid_b}_keg2', [anc - up * 0.07 - left * 0.09 + BACK_DIR * 0.030, anc - up * 0.07 + left * 0.09 + BACK_DIR * 0.030],
                0.046, P('bark', 0.05, [B('top', 0.0, 0.04, 'solid', 'iron')], fabric='leather.cuir_bouilli'),
                n=12, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Twin-Rundlet Contraband Ranjrum Smuggling Pack', 'back', 'ring_sea_mariners',
                                    [pad, keg1, keg2]))

    # --- M-3. smug_pearl_diver (`gill_safe: True`) ---
    gid_h = f'rsm_{sex}_poach_goggles'
    klp_p = P('rsm_cove_kelp', 0.04, fabric='cloth.kelp.oilskin')
    dv_cap = _open_brow_dome(f'{gid_h}_skullcap', klp_p, f_brow=0.63, f_low=0.14, ease=0.011)
    dg_l = _host_anchor(dv_cap, a + (b - a) * 0.63 + left * 0.038 + fwd * 0.095)
    dg_m = _host_anchor(dv_cap, a + (b - a) * 0.63 + fwd * 0.108)
    dg_r = _host_anchor(dv_cap, a + (b - a) * 0.63 - left * 0.038 + fwd * 0.095)
    dv_gog = tube(f'{gid_h}_divegoggles', [dg_l + fwd * 0.005, dg_m + fwd * 0.010, dg_r + fwd * 0.005], 0.014,
                  P('moonglass', 0.02, [B('top', 0.0, 0.02, 'solid', 'bronze')], fabric='glass.moonglass.leaded'),
                  n=10, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Oiled-Kelp Skullcap & Moonglass Pressure Dive-Goggles', 'head', 'ring_sea_mariners',
                                    [dv_cap, dv_gog], covers_hair=True))

    gid_t = f'rsm_{sex}_poach_harness'
    ray_p = P('rsm_shark_shagreen', 0.04, [B('top', 0.0, 0.03, 'solid', 'nacre')], fabric='leather.shagreen.rayskin')
    if sex == 'm':
        p_parts = [
            crossed_sash(f'{gid_t}_xharness', ray_p, width=0.060, ease=0.022),
            belt_sash(f'{gid_t}_leadbelt', core.WAIST - 0.014, core.WAIST + 0.028, P('iron', 0.04, fabric='metal.iron'), ease=0.024),
        ]
    else:
        p_stroph = torso_tube(f'{gid_t}_strophion', core.CHEST + 0.06, core.CHEST - 0.07, 0.020, klp_p, n=38, rows=7)
        p_parts = [p_stroph, crossed_sash(f'{gid_t}_xharness', ray_p, width=0.054, ease=0.026)]
    entries.append(assemble_garment(gid_t, 'Gill-Safe Free-Diver Harness & Ys Gene-Lab Vials', 'torso', 'ring_sea_mariners',
                                    p_parts, open_torso=True))

    gid_b = f'rsm_{sex}_poach_casket'
    pad, anc = _dorsal_pad(gid_b, klp_p, clearance=0.026)
    creel = blob(f'{gid_b}_creel', anc + BACK_DIR * 0.024, (0.14, 0.066, 0.19),
                 P('nacre', 0.03, [B('top', 0.0, 0.04, 'solid', 'rsm_cove_kelp')], fabric='shell.nacre'),
                 n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Nacre-Clasped Pearl & Grey-Ambergris Smuggling Creel', 'back', 'ring_sea_mariners',
                                    [pad, creel]))

    # --- M-4. smug_steam_cove (`Boiling-Bay Brimstone` & Screamer Dead-Drop Runner!) ---
    gid_h = f'rsm_{sex}_steam_hood'
    st_p = P('rsm_oilskin_amber', 0.05, [B('bottom', 0.0, 0.05, 'solid', 'rsm_brimstone_sulfur')], fabric='cloth.kelp.oilskin')
    st_hd = hood(f'{gid_h}_hood', st_p, ease=0.028, ease_low=0.046, open_front=0.90, low=-0.22, rows=13, n=34)
    _, st_fp = _faceplate_with_slits(gid_h, P('rsm_brimstone_sulfur', 0.05, fabric='cloth.canvas.oiled'),
                                     bar_paint=P('copper', 0.03, fabric='metal.bronze'),
                                     lens_paint=P('soot', 0.02, fabric='glass.moonglass.leaded'))
    entries.append(assemble_garment(gid_h, 'Boiling-Bay Scald-Proof Hood & Sulfur-Steam Respirator', 'head', 'ring_sea_mariners',
                                    [st_hd] + st_fp, covers_hair=True, covers_face=True))

    gid_t = f'rsm_{sex}_steam_poncho'
    sp_p = P('rsm_oilskin_amber', 0.05, [
        B('bottom', 0.0, 0.09, 'stripes', 'rsm_brimstone_sulfur', 'holyred', 0.10),
    ], [PN(0.0, 1.0, 'rsm_smuggler_tapa', 'rsm_brimstone_sulfur', 'rsm_oilskin_amber', 0.20)], fabric='cloth.kelp.oilskin')
    sp_coat = torso_tube(f'{gid_t}_poncho', core.TOP, core.KNEE + 0.07, 0.038, sp_p, n=42, rows=19, hang_from=core.WAIST, flare=0.118)
    sp_yoke = collar_disc(f'{gid_t}_yoke', 0.105, P('rsm_brimstone_sulfur', 0.05, fabric='leather.foundry.pigskin'),
                          drop=0.075, ease=0.024)
    entries.append(assemble_garment(gid_t, 'Brimstone-Crusted Phreatic Mist Poncho & Screamer Tallies', 'torso', 'ring_sea_mariners',
                                    [sp_coat, sp_yoke, sleeves(gid_t, 'wrist', 0.019, sp_p)]))

    gid_b = f'rsm_{sex}_steam_dead_drop'
    pad, anc = _dorsal_pad(gid_b, P('rsm_oilskin_amber', 0.05), clearance=0.043)
    dcrate = blob(f'{gid_b}_crate', anc + BACK_DIR * 0.028, (0.16, 0.070, 0.21),
                  P('rsm_brimstone_sulfur', 0.05, [B('top', 0.0, 0.04, 'solid', 'holyred')], fabric='straw.reed.plaited'),
                  n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Steampits Brimstone Sulfur & Ghostpipe Dead-Drop Crate', 'back', 'ring_sea_mariners',
                                    [pad, dcrate]))

    # --- M-5. smug_wrecker (`PF-04` Brimstone / Hook-Stacks Lee-Shore Wrecker!) ---
    gid_h = f'rsm_{sex}_wreck_oilhat'
    wr_p = P('rsm_antifouling_red', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'rsm_barnacle_chalk')],
             [PN(0.0, 1.0, 'rsm_primer', 'rsm_barnacle_chalk', 'rsm_antifouling_red', 0.20)], fabric='armor.salvage.ark_barnacle')
    wr_d = _open_brow_dome(f'{gid_h}_crown', wr_p, f_brow=0.64, f_low=0.18, ease=0.013)
    wr_b = brim(f'{gid_h}_brim', 0.64, 0.095, wr_p, ease=0.013, droop=0.020)
    entries.append(assemble_garment(gid_h, 'Barnacle-Crusted Primer Oilskin Wrecker Hat', 'head', 'ring_sea_mariners',
                                    [wr_d, wr_b], covers_hair=True))

    gid_t = f'rsm_{sex}_wreck_patchcoat'
    wp_p = P('rsm_tar_pitch', 0.05, [
        B('bottom', 0.0, 0.08, 'diamonds', 'rsm_hawser_hemp', 'rsm_antifouling_red', 0.12),
    ], [PN(0.0, 1.0, 'rsm_lanong_prize', 'rsm_barnacle_chalk', 'rsm_antifouling_red', 0.24)], fabric='cloth.oilskin.tarred_seams')
    wp_coat = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE + 0.07, 0.038, wp_p, n=42, rows=20, hang_from=core.WAIST, flare=0.116)
    wp_pld = pauldron(f'{gid_t}_ark_pld', L, wr_p, reach=0.38, ease=0.026)
    entries.append(assemble_garment(gid_t, 'Shipwreck-Salvage Storm-Coat & Barnacle Hull Pauldron', 'torso', 'ring_sea_mariners',
                                    [wp_coat, wp_pld, sleeves(gid_t, 'wrist', 0.019, wp_p)]))

    gid_b = f'rsm_{sex}_wreck_lanternrig'
    pad, anc = _dorsal_pad(gid_b, P('rsm_tar_pitch', 0.05), clearance=0.043)
    wpole = tube(f'{gid_b}_gaff', [anc - up * 0.14 + BACK_DIR * 0.024, anc + up * 0.25 + BACK_DIR * 0.030],
                 0.014, P('bark', 0.05, fabric='leather.buckskin'), n=8, rigid_joint='Spine2')
    wlant = blob(f'{gid_b}_beacon', anc + up * 0.21 + BACK_DIR * 0.036, (0.068, 0.068, 0.10),
                 P('amber', 0.03, [B('top', 0.0, 0.03, 'solid', 'rsm_tar_pitch')], fabric='glass.moonglass.leaded'),
                 n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Lee-Shore False-Beacon Horn Reflector & Gaff Frame', 'back', 'ring_sea_mariners',
                                    [pad, wpole, wlant]))

    # --- M-6. smug_supercargo ---
    gid_h = f'rsm_{sex}_fence_hat'
    fn_p = P('rsm_marr_navy', 0.04, [B('bottom', 0.0, 0.04, 'rsm_iron_scroll', 'silver', 'rsm_marr_navy', 0.10)], fabric='cloth.velvet.cut')
    fn_d = _open_brow_dome(f'{gid_h}_crown', fn_p, f_brow=0.64, f_low=0.18, ease=0.013)
    fn_b = brim(f'{gid_h}_cocked', 0.65, 0.092, fn_p, ease=0.013, lift=0.030, scallop=0.020)
    entries.append(assemble_garment(gid_h, 'Silver-Niello Canal-Syndicate Cocked Hat', 'head', 'ring_sea_mariners',
                                    [fn_d, fn_b], covers_hair=True))

    gid_t = f'rsm_{sex}_fence_redingote'
    rd_p = P('rsm_marr_navy', 0.04, [
        B('bottom', 0.0, 0.07, 'rsm_iron_scroll', 'rsm_hook_gold', 'rsm_voth_purple', 0.12),
    ], fabric='cloth.velvet.cut')
    redingote = torso_tube(f'{gid_t}_redingote', core.TOP, core.KNEE + 0.08, 0.039, rd_p, n=42, rows=20, hang_from=core.WAIST, flare=0.116)
    silk_lapel = tabard(f'{gid_t}_lapels', core.WAIST + 0.02, core.TOP - 0.01,
                        P('rsm_voth_purple', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'rsm_ruephus_crimson')], fabric='cloth.silk.shot'),
                        width=0.18, ease=0.043, front=True, back=False)
    entries.append(assemble_garment(gid_t, 'Reversible Navy & Contraband-Silk Supercargo Redingote', 'torso', 'ring_sea_mariners',
                                    [redingote, silk_lapel, sleeves(gid_t, 'wrist', 0.020, rd_p)]))

    gid_b = f'rsm_{sex}_fence_falsecase'
    pad, anc = _dorsal_pad(gid_b, P('rsm_marr_navy', 0.04), clearance=0.043)
    trunk = blob(f'{gid_b}_trunk', anc + BACK_DIR * 0.028, (0.18, 0.068, 0.20),
                 P('saddle', 0.04, [B('top', 0.0, 0.04, 'solid', 'silver')], fabric='leather.cuir_bouilli'),
                 n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'False-Bottomed Merchant Sample & Bullion Trunk', 'back', 'ring_sea_mariners',
                                    [pad, trunk]))

    # ==================== C. PIRATES, PF-01 MARXAL & BLOODY RUEPHUS (8 TIERS) ====================

    # --- P-1. pir_ark_corsair (`gill_safe: True`) ---
    gid_h = f'rsm_{sex}_ark_bandana'
    ak_b = head_rings(f'{gid_h}_bandana', 0.60, 0.72, 0.004,
                      P('rsm_ruephus_crimson', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'rsm_tar_pitch')], fabric=COTTON),
                      n=36, rows=5)
    entries.append(assemble_garment(gid_h, "Noah's Regret Blood-Jack Corsair Bandana", 'head', 'ring_sea_mariners',
                                    [ak_b], covers_hair=False))

    gid_t = f'rsm_{sex}_ark_brig_vest'
    av_p = P('rsm_ruephus_crimson', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'rsm_tar_pitch'),
    ], [PN(0.0, 1.0, 'rsm_ruephus_jack', 'rsm_barnacle_chalk', 'rsm_ruephus_crimson', 0.22)], fabric='cloth.canvas.oiled')
    ark_pld = articulated_pauldron(
        f'{gid_t}_hull_pld', L,
        P('ancient', 0.04, [B('bottom', 0.0, 0.05, 'solid', 'rsm_antifouling_red')], fabric='metal.steel'),
        trim_paint=P('rsm_hook_gold', 0.03, fabric='metal.bronze'),
        lames=3, haute_piece=False, ease=0.014,
    )
    if sex == 'm':
        av_vest = torso_tube(f'{gid_t}_vest', core.TOP - 0.01, core.WAIST - 0.050, 0.017, av_p, n=32, rows=12,
                             arc=(-0.72 * math.pi, 0.72 * math.pi))
        av_parts = [av_vest] + ark_pld + [crossed_sash(f'{gid_t}_baldric', P('rsm_tar_pitch', 0.04, fabric='leather.cuir_bouilli'),
                                                       width=0.054, ease=0.025)]
    else:
        av_vest = torso_tube(f'{gid_t}_halter', core.CHEST + 0.06, core.WAIST - 0.050, 0.022, av_p, n=38, rows=10, flare=0.040)
        av_parts = [av_vest] + ark_pld + [crossed_sash(f'{gid_t}_baldric', P('rsm_tar_pitch', 0.04, fabric='leather.cuir_bouilli'),
                                                       width=0.050, ease=0.028)]
    entries.append(assemble_garment(gid_t, "Gill-Safe Ark-Salvage Boarding Vest & Barnacle Pauldron", 'torso', 'ring_sea_mariners',
                                    av_parts, open_torso=True))

    gid_b = f'rsm_{sex}_ark_trophy_pack'
    pad, anc = _dorsal_pad(gid_b, P('rsm_ruephus_crimson', 0.05), clearance=0.028)
    ac_coil = rosette(f'{gid_b}_cable', anc + BACK_DIR * 0.020, BACK_DIR, left, 0.095,
                      P('rsm_hawser_hemp', 0.05, fabric='straw.plaited'), n=16, thick=0.022, rigid_joint='Spine2')
    ac_grap = tube(f'{gid_b}_grapnel', [anc - up * 0.15 + BACK_DIR * 0.026, anc + up * 0.17 + BACK_DIR * 0.028],
                   0.014, P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Ark-Corsair Boarding Grapnel & Cable Coil', 'back', 'ring_sea_mariners',
                                    [pad, ac_coil, ac_grap]))

    # --- P-2. pir_hook_boarder ---
    gid_h = f'rsm_{sex}_brd_casque'
    hb_p = P('rsm_tar_pitch', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'rsm_hook_gold')],
             [PN(0.0, 1.0, 'rsm_hooked_sun', 'rsm_hook_gold', 'rsm_tar_pitch', 0.24)], fabric='metal.iron')
    hb_dome = _open_brow_dome(f'{gid_h}_bowl', hb_p, f_brow=0.63, f_low=0.12, ease=0.013)
    hb_brim = brim(f'{gid_h}_brim', 0.63, 0.062, hb_p, ease=0.013, lift=0.016)
    entries.append(assemble_garment(gid_h, 'Blackened Hookfleet Boarding Casque & Hooked-Sun Blazon', 'head', 'ring_sea_mariners',
                                    [hb_dome, hb_brim], covers_hair=True))

    gid_t = f'rsm_{sex}_brd_jack'
    jk_p = P('rsm_tar_pitch', 0.05, [
        B('bottom', 0.0, 0.06, 'solid', 'rsm_ruephus_crimson'),
    ], [PN(0.0, 1.0, 'rsm_hooked_sun', 'rsm_hook_gold', 'rsm_tar_pitch', 0.22)], fabric='metal.iron')
    jk_trim = P('rsm_hook_gold', 0.03, fabric='metal.brass')
    jk_cuir = cuirass_plate(f'{gid_t}_cuir', jk_p, trim_paint=jk_trim, style='lamellar', faulds=3, ease=0.022)
    jk_gorg = gorget_guard(f'{gid_t}_gorget', P('iron', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'rsm_hook_gold')], fabric='metal.iron'),
                           trim_paint=jk_trim, ease=0.023)
    jk_plds = articulated_pauldrons(f'{gid_t}_pld', jk_p, trim_paint=jk_trim, lames=3, haute_piece=False, ease=0.020)
    entries.append(assemble_garment(gid_t, 'Hookfleet Sculpted Iron Lamellar Cuirass & Boarding Gorget', 'torso', 'ring_sea_mariners',
                                    jk_cuir + jk_gorg + jk_plds + sleeves(gid_t, 'wrist', 0.018, P('rsm_tar_pitch', 0.05, fabric='cloth.quilted.diamond'))))

    gid_b = f'rsm_{sex}_brd_grapnel_rig'
    pad, anc = _dorsal_pad(gid_b, P('rsm_tar_pitch', 0.05), clearance=0.032)
    axe_l = tube(f'{gid_b}_axeL', [anc - up * 0.14 - left * 0.06 + BACK_DIR * 0.026, anc + up * 0.18 + left * 0.06 + BACK_DIR * 0.026],
                 0.014, P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    axe_r = tube(f'{gid_b}_axeR', [anc - up * 0.14 + left * 0.06 + BACK_DIR * 0.026, anc + up * 0.18 - left * 0.06 + BACK_DIR * 0.026],
                 0.014, P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Crossed Hookfleet Boarding-Axe & Grapnel Harness', 'back', 'ring_sea_mariners',
                                    [pad, axe_l, axe_r]))

    # --- P-3. pir_lantaka_gunner ---
    gid_h = f'rsm_{sex}_gun_goggles_rag'
    gn_p = P('soot', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'sunorange')], fabric=COTTON)
    gn_rag = _open_brow_dome(f'{gid_h}_rag', gn_p, f_brow=0.63, f_low=0.12, ease=0.012)
    gg_l = _host_anchor(gn_rag, a + (b - a) * 0.64 + left * 0.042 + fwd * 0.095)
    gg_m = _host_anchor(gn_rag, a + (b - a) * 0.64 + fwd * 0.108)
    gg_r = _host_anchor(gn_rag, a + (b - a) * 0.64 - left * 0.042 + fwd * 0.095)
    fl_gog = tube(f'{gid_h}_flashgoggles', [gg_l + fwd * 0.005, gg_m + fwd * 0.010, gg_r + fwd * 0.005], 0.014,
                  P('brass', 0.03, [B('top', 0.0, 0.02, 'solid', 'soot')], fabric='metal.bronze'), n=10, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Soot Flash-Kerchief, Smoked Goggles & Slow-Match Cord', 'head', 'ring_sea_mariners',
                                    [gn_rag, fl_gog], covers_hair=True))

    gid_t = f'rsm_{sex}_gun_flash_apron'
    sh_p = P('rsm_ruephus_crimson', 0.05, fabric=COTTON)
    g_shirt = torso_tube(f'{gid_t}_shirt', core.TOP, core.WAIST - 0.052, 0.025, sh_p, n=40, rows=14, flare=0.046)
    g_apron = tabard(f'{gid_t}_apron', core.WAIST - 0.03, core.TOP - 0.02,
                     P('saddle', 0.06, [B('bottom', 0.0, 0.05, 'solid', 'soot')], fabric='leather.foundry.pigskin'),
                     width=0.21, ease=0.032, front=True, back=False)
    apostles = crossed_sash(f'{gid_t}_apostles',
                            P('bark', 0.05, [B('top', 0.0, 0.03, 'stripes', 'brass', 'bark', 0.07)], fabric='leather.cuir_bouilli'),
                            width=0.058, ease=0.036)
    entries.append(assemble_garment(gid_t, 'Brine-Damped Pigskin Flash-Apron & Twelve-Apostles Bandolier', 'torso', 'ring_sea_mariners',
                                    [g_shirt, g_apron, apostles]))

    gid_b = f'rsm_{sex}_gun_powder_rig'
    pad, anc = _dorsal_pad(gid_b, P('saddle', 0.05), clearance=0.030)
    pbox = blob(f'{gid_b}_passbox', anc + BACK_DIR * 0.026, (0.14, 0.068, 0.19),
                P('rsm_antifouling_red', 0.04, [B('top', 0.0, 0.04, 'solid', 'copper')], fabric='leather.cuir_bouilli'),
                n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    linstock = tube(f'{gid_b}_linstock', [anc - up * 0.14 + left * 0.07 + BACK_DIR * 0.026, anc + up * 0.22 + left * 0.07 + BACK_DIR * 0.028],
                    0.012, P('copper', 0.03, fabric='metal.bronze'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Copper-Hooped Powder Pass-Box & Linstock Rod', 'back', 'ring_sea_mariners',
                                    [pad, pbox, linstock]))

    # --- P-4. pir_press_bosun ---
    gid_h = f'rsm_{sex}_bos_cocked_cap'
    bs_p = P('rsm_tar_pitch', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'brass')], fabric='leather.cuir_bouilli')
    bs_d = _open_brow_dome(f'{gid_h}_cap', bs_p, f_brow=0.64, f_low=0.18, high=1.14, ease=0.018)
    bs_v = brim(f'{gid_h}_visor', 0.64, 0.058, bs_p, ease=0.013, droop=0.012)
    entries.append(assemble_garment(gid_h, 'Tarred Iron-Court Press-Bosun Peaked Cap', 'head', 'ring_sea_mariners',
                                    [bs_d, bs_v], covers_hair=True))

    gid_t = f'rsm_{sex}_bos_jerkin'
    bj_p = P('iron', 0.04, [
        B('bottom', 0.0, 0.07, 'solid', 'rsm_tar_pitch'),
    ], [PN(0.0, 1.0, 'rsm_primer', 'rsm_antifouling_red', 'iron', 0.22)], fabric='metal.iron')
    bj_trim = P('brass', 0.03, fabric='metal.bronze')
    bs_cuir = cuirass_plate(f'{gid_t}_cuir', bj_p, trim_paint=bj_trim, style='laminar', faulds=2, ease=0.022)
    bs_plds = articulated_pauldrons(f'{gid_t}_pld', bj_p, trim_paint=bj_trim, lames=3, haute_piece=False, ease=0.020)
    entries.append(assemble_garment(gid_t, 'Sculpted Iron Laminar Press-Cuirass & Articulated Pauldrons', 'torso', 'ring_sea_mariners',
                                    bs_cuir + bs_plds + sleeves(gid_t, 'wrist', 0.018, P('saddle', 0.05, fabric='leather.cuir_bouilli'))))

    gid_b = f'rsm_{sex}_bos_shackle_pack'
    pad, anc = _dorsal_pad(gid_b, P('saddle', 0.05), clearance=0.043)
    sh_r = rosette(f'{gid_b}_manacles', anc + BACK_DIR * 0.022, BACK_DIR, left, 0.095,
                   P('iron', 0.04, fabric='metal.iron'), n=16, thick=0.022, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Salvage-Chain & Press-Gang Manacle Pack', 'back', 'ring_sea_mariners', [pad, sh_r]))

    # --- P-5. pir_quartermaster ---
    gid_h = f'rsm_{sex}_qm_bicorne'
    qm_p = P('rsm_shark_shagreen', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'rsm_hook_gold')], fabric='leather.shagreen.rayskin')
    qm_d = _open_brow_dome(f'{gid_h}_crown', qm_p, f_brow=0.64, f_low=0.18, ease=0.013)
    qm_b = brim(f'{gid_h}_bicorne', 0.65, 0.098, qm_p, ease=0.013, lift=0.036, scallop=0.020)
    qm_anc = _host_anchor(qm_d, a + (b - a) * 0.78 + fwd * 0.10)
    qm_pin = rosette(f'{gid_h}_trophy_pin', qm_anc + fwd * 0.004, fwd, left, 0.024,
                     P('nacre', 0.03, [B('top', 0.0, 0.02, 'solid', 'rsm_hook_gold')], fabric='shell.nacre'),
                     n=12, thick=0.008, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Gold-Braided Sharkskin Quartermaster Bicorne', 'head', 'ring_sea_mariners',
                                    [qm_d, qm_b, qm_pin], covers_hair=True))

    gid_t = f'rsm_{sex}_qm_cuirass_coat'
    qc_p = P('ancient', 0.03, [
        B('bottom', 0.0, 0.08, 'rsm_hooked_sun_vec', 'rsm_hook_gold', 'rsm_ruephus_crimson', 0.12),
    ], [PN(0.0, 1.0, 'rsm_hooked_sun_vec', 'rsm_hook_gold', 'ancient', 0.22)], fabric='metal.steel.hammered')
    qc_trim = P('rsm_hook_gold', 0.03, fabric='metal.gold')
    qm_cuir = cuirass_plate(f'{gid_t}_cuir', qc_p, trim_paint=qc_trim, style='cyber_plate', faulds=3, ease=0.022)
    qm_gorg = gorget_guard(f'{gid_t}_gorget', qc_p, trim_paint=qc_trim, ease=0.023)
    qm_plds = articulated_pauldrons(f'{gid_t}_pld', qc_p, trim_paint=qc_trim, lames=3, haute_piece=True, ease=0.020)
    entries.append(assemble_garment(gid_t, 'Sculpted Ancient Catamaran Hex-Plate Cuirass & Pauldrons', 'torso', 'ring_sea_mariners',
                                    qm_cuir + qm_gorg + qm_plds
                                    + sleeves(gid_t, 'wrist', 0.018, P('rsm_sail_unbleached', 0.04, fabric='cloth.linen.sea'))))

    gid_b = f'rsm_{sex}_qm_cape'
    qm_cp = cape(f'{gid_b}_cape', core.CROTCH + 0.06,
                 P('rsm_tar_pitch', 0.04, [B('bottom', 0.0, 0.07, 'rsm_hooked_sun_vec', 'rsm_hook_gold', 'rsm_ruephus_crimson', 0.12)],
                   fabric='cloth.silk.slub'),
                 span=0.50, ease=0.028, flare=0.075, rows=14, n=24, stiff=0.36, back_push=0.058)
    entries.append(assemble_garment(gid_b, 'Hooked-Sun Black & Crimson Prize-Master Half-Cape', 'back', 'ring_sea_mariners', [qm_cp]))

    # --- P-6. pir_emperor_captain (`Emparaz Pirataz` Nostalgia Freebooter Captain) ---
    gid_h = f'rsm_{sex}_capt_tricorn_crown'
    ec_p = P('rsm_tar_pitch', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'rsm_hook_gold')],
             [PN(0.0, 1.0, 'rsm_hooked_sun', 'rsm_hook_gold', 'rsm_tar_pitch', 0.24)], fabric='cloth.brocade.damask')
    ec_brm = brim(f'{gid_h}_tricorn', 0.65, 0.105, ec_p, ease=0.013, lift=0.038, scallop=0.024)
    ec_crn = crown_band(f'{gid_h}_shipcrown', P('rsm_hook_gold', 0.02, fabric='metal.gold'), f0=0.64, f1=0.80, ease=0.014, flare=0.012)
    ec_anc = _host_anchor(ec_crn, a + (b - a) * 0.72 + fwd * 0.10)
    ec_med = rosette(f'{gid_h}_hooked_sun', ec_anc + fwd * 0.005, fwd, left, 0.026,
                     P('rsm_hook_gold', 0.02, [B('top', 0.0, 0.02, 'solid', 'rsm_ruephus_crimson')], fabric='metal.gold'),
                     n=14, thick=0.008, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Iron-Court Ship-Crowned Freebooter Tricorn', 'head', 'ring_sea_mariners',
                                    [ec_brm, ec_crn, ec_med], covers_hair=False))

    gid_t = f'rsm_{sex}_capt_frock_coat'
    fc_p = P('rsm_tar_pitch', 0.03, [
        B('bottom', 0.0, 0.09, 'rsm_hooked_sun_vec', 'rsm_hook_gold', 'rsm_ruephus_crimson', 0.14),
    ], [PN(0.0, 1.0, 'rsm_hooked_sun', 'rsm_hook_gold', 'rsm_tar_pitch', 0.24)], fabric='cloth.brocade.damask')
    frock = torso_tube(f'{gid_t}_frock', core.TOP, core.KNEE + 0.06, 0.040, fc_p, n=42, rows=20, hang_from=core.WAIST, flare=0.120)
    fc_col = collar(f'{gid_t}_lapel_col', P('rsm_ruephus_crimson', 0.03, [B('top', 0.0, 0.02, 'solid', 'rsm_hook_gold')],
                                            fabric='cloth.brocade.damask'), height=0.056, ease=0.026)
    fc_pl = pauldron(f'{gid_t}_epL', L, P('rsm_hook_gold', 0.03, fabric='metal.brass.braid'), reach=0.34, ease=0.026)
    fc_pr = pauldron(f'{gid_t}_epR', R, P('rsm_hook_gold', 0.03, fabric='metal.brass.braid'), reach=0.34, ease=0.026)
    entries.append(assemble_garment(gid_t, 'Emparaz Pirataz Hooked-Sun Brocade Frock-Coat', 'torso', 'ring_sea_mariners',
                                    [frock, fc_col, fc_pl, fc_pr, sleeves(gid_t, 'wrist', 0.020, fc_p)]))

    gid_b = f'rsm_{sex}_capt_paludamentum'
    ec_cp = cape(f'{gid_b}_paludamentum', core.CROTCH + 0.06,
                 P('rsm_tar_pitch', 0.03, [B('bottom', 0.0, 0.08, 'rsm_hooked_sun_vec', 'rsm_hook_gold', 'rsm_tar_pitch', 0.14)],
                   fabric='cloth.brocade.damask'),
                 span=0.52, ease=0.028, flare=0.080, rows=14, n=24, stiff=0.36, back_push=0.058)
    entries.append(assemble_garment(gid_b, 'Billowing Black & Gold Hooked-Sun Naval Cloak', 'back', 'ring_sea_mariners', [ec_cp]))

    # --- P-7. pf_marxal_restorationist (`PF-01` "Tax-Admiral" Vasko Marxal — Imperial-Purple & Gold Greatcoat + Bicorne!) ---
    gid_h = f'rsm_{sex}_marxal_bicorne'
    mx_p = P('rsm_voth_purple', 0.03, [B('bottom', 0.0, 0.05, 'solid', 'rsm_hook_gold')],
             [PN(0.0, 1.0, 'rsm_hooked_sun_vec', 'rsm_hook_gold', 'rsm_voth_purple', 0.22)], fabric='cloth.brocade.damask')
    mx_d = _open_brow_dome(f'{gid_h}_crown', mx_p, f_brow=0.64, f_low=0.18, high=1.14, ease=0.018)
    mx_b = brim(f'{gid_h}_bicorne', 0.65, 0.108, mx_p, ease=0.013, lift=0.042, scallop=0.020)
    mx_anc = _host_anchor(mx_d, a + (b - a) * 0.78 + fwd * 0.10)
    mx_med = rosette(f'{gid_h}_imperial_sun', mx_anc + fwd * 0.005, fwd, left, 0.028,
                     P('rsm_hook_gold', 0.02, [B('top', 0.0, 0.02, 'solid', 'rsm_voth_purple')], fabric='metal.gold'),
                     n=14, thick=0.009, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Admiral Vasko Marxal Imperial-Purple & Gold Bicorne', 'head', 'ring_sea_mariners',
                                    [mx_d, mx_b, mx_med], covers_hair=True))

    gid_t = f'rsm_{sex}_marxal_greatcoat'
    mg_p = P('rsm_voth_purple', 0.03, [
        B('bottom', 0.0, 0.09, 'rsm_hooked_sun_vec', 'rsm_hook_gold', 'rsm_voth_purple', 0.14),
        B('top', 0.0, 0.04, 'solid', 'rsm_hook_gold'),
    ], [PN(0.0, 1.0, 'rsm_iron_scroll', 'rsm_hook_gold', 'rsm_voth_purple', 0.22)], fabric='metal.steel.hammered')
    mg_gold = P('rsm_hook_gold', 0.02, [B('bottom', 0.0, 0.04, 'solid', 'verdigris')], fabric='metal.gold')
    mg_cuir = cuirass_plate(f'{gid_t}_cuir', mg_p, trim_paint=mg_gold, style='gothic', faulds=3, ease=0.023)
    mg_gorg = gorget_guard(f'{gid_t}_gorget', mg_gold, trim_paint=mg_p, ease=0.024)
    mg_plds = articulated_pauldrons(f'{gid_t}_pld', mg_gold, trim_paint=mg_p, lames=3, haute_piece=True, ease=0.022)
    entries.append(assemble_garment(gid_t, 'Imperial-Purple & Gilded Gothic Admiral Cuirass & Faulds', 'torso', 'ring_sea_mariners',
                                    mg_cuir + mg_gorg + mg_plds
                                    + sleeves(gid_t, 'wrist', 0.019, P('rsm_voth_purple', 0.03, fabric='cloth.brocade.damask'))))

    gid_b = f'rsm_{sex}_marxal_cloak'
    mx_cp = cape(f'{gid_b}_cloak', core.CROTCH + 0.06,
                 P('rsm_voth_purple', 0.03, [B('bottom', 0.0, 0.08, 'rsm_hooked_sun_vec', 'rsm_hook_gold', 'rsm_voth_purple', 0.14)],
                   fabric='cloth.brocade.damask'),
                 span=0.52, ease=0.028, flare=0.080, rows=14, n=24, stiff=0.36, back_push=0.058)
    entries.append(assemble_garment(gid_b, 'Tarnished Imperial-Purple Marxal Legitimist Cloak', 'back', 'ring_sea_mariners', [mx_cp]))

    # --- P-8. hero_bloody_ruephus (`Noah's Regret` Dread Admiral Bloody Ruephus — Crimson & Salt-Crust Pirate-King Coat!) ---
    gid_h = f'rsm_{sex}_ruephus_bicorne'
    ru_p = P('rsm_ruephus_crimson', 0.04, [B('bottom', 0.0, 0.05, 'solid', 'rsm_barnacle_chalk')],
             [PN(0.0, 1.0, 'rsm_ruephus_jack', 'rsm_barnacle_chalk', 'rsm_ruephus_crimson', 0.24)], fabric='cloth.brocade.damask')
    ru_d = _open_brow_dome(f'{gid_h}_crown', ru_p, f_brow=0.64, f_low=0.18, high=1.14, ease=0.018)
    ru_b = brim(f'{gid_h}_bicorne', 0.65, 0.110, ru_p, ease=0.013, lift=0.042, scallop=0.022)
    ru_anc = _host_anchor(ru_d, a + (b - a) * 0.78 + fwd * 0.10)
    ru_skl = rosette(f'{gid_h}_skull_badge', ru_anc + fwd * 0.005, fwd, left, 0.028,
                     P('rsm_barnacle_chalk', 0.03, [B('top', 0.0, 0.02, 'solid', 'rsm_tar_pitch')], fabric='armor.salvage.ark_barnacle'),
                     n=14, thick=0.009, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, "Bloody Ruephus Crimson & Salt-Crust Admiral Bicorne", 'head', 'ring_sea_mariners',
                                    [ru_d, ru_b, ru_skl], covers_hair=True))

    gid_t = f'rsm_{sex}_ruephus_greatcoat'
    rg_steel = P('ancient', 0.04, [
        B('bottom', 0.0, 0.08, 'rsm_ruephus_skull_vec', 'rsm_barnacle_chalk', 'rsm_tar_pitch', 0.14),
    ], [PN(0.0, 1.0, 'rsm_ruephus_jack', 'rsm_barnacle_chalk', 'rsm_ruephus_crimson', 0.24)], fabric='metal.steel.hammered')
    rg_gold = P('rsm_hook_gold', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'rsm_barnacle_chalk')], fabric='metal.gold')
    rg_cuir = cuirass_plate(f'{gid_t}_cuir', rg_steel, trim_paint=rg_gold, style='gothic', faulds=3, ease=0.023)
    rg_gorg = gorget_guard(f'{gid_t}_gorget', rg_steel, trim_paint=rg_gold, ease=0.024)
    rg_plds = articulated_pauldrons(f'{gid_t}_pld', rg_steel, trim_paint=rg_gold, lames=3, haute_piece=True, ease=0.022)
    entries.append(assemble_garment(gid_t, "Bloody Ruephus Barnacle-Crusted Gothic Steel Admiral Cuirass", 'torso', 'ring_sea_mariners',
                                    rg_cuir + rg_gorg + rg_plds
                                    + sleeves(gid_t, 'wrist', 0.019, P('rsm_ruephus_crimson', 0.04, fabric='cloth.brocade.damask'))))

    gid_b = f'rsm_{sex}_ruephus_blood_cape'
    ru_cp = cape(f'{gid_b}_blood_cape', core.CROTCH + 0.06,
                 P('rsm_ruephus_crimson', 0.04, [B('bottom', 0.0, 0.08, 'rsm_ruephus_skull_vec', 'rsm_barnacle_chalk', 'rsm_tar_pitch', 0.14)],
                   fabric='cloth.brocade.damask'),
                 span=0.52, ease=0.028, flare=0.080, rows=14, n=24, stiff=0.36, back_push=0.058)
    entries.append(assemble_garment(gid_b, "Reliquary Blood-Jack & Salt-Crust Admiral Boat-Cloak", 'back', 'ring_sea_mariners',
                                    [ru_cp]))

    return entries


def _outfits_for_sex(sex):
    return {
        'sail_deckhand': {
            'region': 'all_ports',
            'head': f'rsm_{sex}_deck_bandana',
            'torso': f'rsm_{sex}_deck_jumper',
            'gloves': f'rsm_{sex}_deck_wraps',
            'legs': f'rsm_{sex}_deck_slops',
            'feet': f'rsm_{sex}_deck_sandals',
            'back': f'rsm_{sex}_deck_dittybag',
        },
        'sail_topman': {
            'region': 'all_ports',
            'gill_safe': True,
            'head': f'rsm_{sex}_top_knitcap',
            'torso': f'rsm_{sex}_top_vest',
            'gloves': f'rsm_{sex}_deck_wraps',
            'legs': f'rsm_{sex}_deck_slops',
            'feet': f'rsm_{sex}_deck_sandals',
            'back': f'rsm_{sex}_top_halyard',
        },
        'sail_caulker': {
            'region': 'shipyards_tugs',
            'head': f'rsm_{sex}_caulk_souwester',
            'torso': f'rsm_{sex}_caulk_apron',
            'gloves': f'rsm_{sex}_deck_wraps',
            'legs': f'rsm_{sex}_tarred_breeches',
            'feet': f'rsm_{sex}_caulk_boots',
            'back': f'rsm_{sex}_caulk_pitchkit',
        },
        'sail_harpooner': {
            'region': 'reef_banks',
            'gill_safe': True,
            'head': f'rsm_{sex}_harp_brim',
            'torso': f'rsm_{sex}_harp_jerkin',
            'gloves': f'rsm_{sex}_sharkskin_bracers',
            'legs': f'rsm_{sex}_reef_kiltslops',
            'feet': f'rsm_{sex}_reef_sandals',
            'back': f'rsm_{sex}_harp_tubeline',
        },
        'sail_packet_pilot': {
            'region': 'packet_lanes',
            'head': f'rsm_{sex}_pilot_bicorne',
            'torso': f'rsm_{sex}_pilot_pea_coat',
            'gloves': f'rsm_{sex}_officer_cuffs',
            'legs': f'rsm_{sex}_officer_breeches',
            'feet': f'rsm_{sex}_sea_jackboots',
            'back': f'rsm_{sex}_pilot_charttube',
        },
        'sail_mira_broker': {
            'region': 'port_mira_truce',
            'head': f'rsm_{sex}_mira_tricorn',
            'torso': f'rsm_{sex}_mira_surcoat',
            'gloves': f'rsm_{sex}_officer_cuffs',
            'legs': f'rsm_{sex}_officer_breeches',
            'feet': f'rsm_{sex}_sea_jackboots',
            'back': f'rsm_{sex}_mira_strongbox',
        },
        'smug_night_rower': {
            'region': 'de_xedaz_shanty',
            'head': f'rsm_{sex}_row_cowl',
            'torso': f'rsm_{sex}_row_jerkin',
            'gloves': f'rsm_{sex}_deck_wraps',
            'legs': f'rsm_{sex}_tarred_breeches',
            'feet': f'rsm_{sex}_caulk_boots',
            'back': f'rsm_{sex}_row_bale',
        },
        'smug_ranj_runner': {
            'region': 'throne_coves',
            'head': f'rsm_{sex}_ranj_headwrap',
            'torso': f'rsm_{sex}_ranj_coat',
            'gloves': f'rsm_{sex}_sharkskin_bracers',
            'legs': f'rsm_{sex}_tarred_breeches',
            'feet': f'rsm_{sex}_caulk_boots',
            'back': f'rsm_{sex}_ranj_kegpack',
        },
        'smug_pearl_diver': {
            'region': 'ys_hook_banks',
            'gill_safe': True,
            'head': f'rsm_{sex}_poach_goggles',
            'torso': f'rsm_{sex}_poach_harness',
            'gloves': f'rsm_{sex}_sharkskin_bracers',
            'legs': f'rsm_{sex}_reef_kiltslops',
            'feet': f'rsm_{sex}_reef_sandals',
            'back': f'rsm_{sex}_poach_casket',
        },
        'smug_steam_cove': {
            'region': 'boiling_bay_steampits',
            'head': f'rsm_{sex}_steam_hood',
            'torso': f'rsm_{sex}_steam_poncho',
            'gloves': f'rsm_{sex}_boarding_gauntlets',
            'legs': f'rsm_{sex}_tarred_breeches',
            'feet': f'rsm_{sex}_caulk_boots',
            'back': f'rsm_{sex}_steam_dead_drop',
        },
        'smug_wrecker': {
            'region': 'lee_reefs_stacks',
            'head': f'rsm_{sex}_wreck_oilhat',
            'torso': f'rsm_{sex}_wreck_patchcoat',
            'gloves': f'rsm_{sex}_deck_wraps',
            'legs': f'rsm_{sex}_tarred_breeches',
            'feet': f'rsm_{sex}_caulk_boots',
            'back': f'rsm_{sex}_wreck_lanternrig',
        },
        'smug_supercargo': {
            'region': 'all_ports',
            'head': f'rsm_{sex}_fence_hat',
            'torso': f'rsm_{sex}_fence_redingote',
            'gloves': f'rsm_{sex}_officer_cuffs',
            'legs': f'rsm_{sex}_officer_breeches',
            'feet': f'rsm_{sex}_sea_jackboots',
            'back': f'rsm_{sex}_fence_falsecase',
        },
        'pir_ark_corsair': {
            'region': 'noahs_regret',
            'gill_safe': True,
            'head': f'rsm_{sex}_ark_bandana',
            'torso': f'rsm_{sex}_ark_brig_vest',
            'gloves': f'rsm_{sex}_sharkskin_bracers',
            'legs': f'rsm_{sex}_prize_slops',
            'feet': f'rsm_{sex}_sea_jackboots',
            'back': f'rsm_{sex}_ark_trophy_pack',
        },
        'pir_hook_boarder': {
            'region': 'hookfleet_mira',
            'head': f'rsm_{sex}_brd_casque',
            'torso': f'rsm_{sex}_brd_jack',
            'gloves': f'rsm_{sex}_boarding_gauntlets',
            'legs': f'rsm_{sex}_tarred_breeches',
            'feet': f'rsm_{sex}_sea_jackboots',
            'back': f'rsm_{sex}_brd_grapnel_rig',
        },
        'pir_lantaka_gunner': {
            'region': 'lanong_tugs',
            'head': f'rsm_{sex}_gun_goggles_rag',
            'torso': f'rsm_{sex}_gun_flash_apron',
            'gloves': f'rsm_{sex}_boarding_gauntlets',
            'legs': f'rsm_{sex}_deck_slops',
            'feet': f'rsm_{sex}_deck_sandals',
            'back': f'rsm_{sex}_gun_powder_rig',
        },
        'pir_press_bosun': {
            'region': 'noahs_regret_hook',
            'head': f'rsm_{sex}_bos_cocked_cap',
            'torso': f'rsm_{sex}_bos_jerkin',
            'gloves': f'rsm_{sex}_boarding_gauntlets',
            'legs': f'rsm_{sex}_prize_slops',
            'feet': f'rsm_{sex}_caulk_boots',
            'back': f'rsm_{sex}_bos_shackle_pack',
        },
        'pir_quartermaster': {
            'region': 'all_pirate_fleets',
            'head': f'rsm_{sex}_qm_bicorne',
            'torso': f'rsm_{sex}_qm_cuirass_coat',
            'gloves': f'rsm_{sex}_sharkskin_bracers',
            'legs': f'rsm_{sex}_imperial_breeches',
            'feet': f'rsm_{sex}_sea_jackboots',
            'back': f'rsm_{sex}_qm_cape',
        },
        'pir_emperor_captain': {
            'region': 'iron_court_heirs',
            'head': f'rsm_{sex}_capt_tricorn_crown',
            'torso': f'rsm_{sex}_capt_frock_coat',
            'gloves': f'rsm_{sex}_admiral_cuffs',
            'legs': f'rsm_{sex}_imperial_breeches',
            'feet': f'rsm_{sex}_admiral_jackboots',
            'back': f'rsm_{sex}_capt_paludamentum',
        },
        'pf_marxal_restorationist': {
            'region': 'pf01_marxal_legitimists',
            'head': f'rsm_{sex}_marxal_bicorne',
            'torso': f'rsm_{sex}_marxal_greatcoat',
            'gloves': f'rsm_{sex}_admiral_cuffs',
            'legs': f'rsm_{sex}_imperial_breeches',
            'feet': f'rsm_{sex}_admiral_jackboots',
            'back': f'rsm_{sex}_marxal_cloak',
        },
        'hero_bloody_ruephus': {
            'type': 'important_npc',
            'region': 'noahs_regret_hq',
            'head': f'rsm_{sex}_ruephus_bicorne',
            'torso': f'rsm_{sex}_ruephus_greatcoat',
            'gloves': f'rsm_{sex}_boarding_gauntlets',
            'legs': f'rsm_{sex}_prize_slops',
            'feet': f'rsm_{sex}_admiral_jackboots',
            'back': f'rsm_{sex}_ruephus_blood_cape',
        },
    }


def build_ring_sea_mariners_peoples_entry():
    return {
        'id': 'ring_sea_mariners',
        'name': 'Ring Sea Sailors, Smugglers & Corsairs',
        'note': (
            "Polyglot 1.93–2.0 atm Ring Sea maritime crews across three interlocking strata — blue-water merchant & "
            "Port Mira truce-port sailors, De Xedaz / Shanty / Boiling-Bay Brimstone cove-smugglers & false-beacon "
            "wreckers, and Hooked-Sun freebooters of Hookfleet & Noah's Regret — including Admiral Vasko Marxal's "
            "PF-01 Restorationists and Dread Admiral Bloody Ruephus."
        ),
        'phenotype_pool': [
            ['islanders', 0.30],
            ['izani', 0.24],
            ['chichani', 0.16],
            ['hykkousoi', 0.14],
            ['iron_republic', 0.06],
            ['xanadu', 0.05],
            ['yuni', 0.05],
        ],
        'ancestry': {'african': [0.15, 0.50], 'asian': [0.25, 0.65], 'caucasian': [0.15, 0.50]},
        'skin': ['#d8b292', '#b8865e', '#966844', '#755648', '#563c2c'],
        'hair': ['#141210', '#241c16', '#3d2c1e', '#5e4228', '#866038'],
        'eyes': ['#3b2414', '#5a3a22', '#7a3e20', '#4a6258', '#4e6a80'],
        'grey': 0.46,
        'beard': 0.46,
        'morph': {
            'muscle': [0.05, 0.65],
            'weight': [-0.30, 0.35],
        },
        'styles': {
            'male': ['short02', 'long01', 'ponytail01', 'braid01', 'cortu_short_messy_hair', 'Dreads_with_Fade', 'punkduck_alpha7_long'],
            'female': ['braid01', 'ponytail01', 'long01', 'elvs_double_mh_braid', 'bob02', 'punkduck_alpha7_curly', 'Two_Braided_Cornrows_Female'],
        },
        'tiers': MARINER_TIER_SHARES,
        'tier_labels': MARINER_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_ring_sea_mariners_kit():
    entries = []
    with _mariner_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_shared_pieces(sex))
            entries.extend(_build_mariner_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_ring_sea_mariners_kit()
    peoples_entry = build_ring_sea_mariners_peoples_entry()
    manifest_path = CULTURES_DIR / 'ring_sea_mariners_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'ring_sea_mariners',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Ring Sea Mariner pieces ({n_m} male, {n_f} female) across 20 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
