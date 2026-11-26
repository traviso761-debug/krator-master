"""The Screamers of the Hexahedron & Fort Kalor Wardrobe Kit (`screamers` — 8 Tiers across all 4 Broods).

Builds all 8 canonical Screamer tiers (`mpfb_male` `scr_m_*` & `mpfb_female` `scr_f_*` —
100% procedural MPFB parity, manifest-only mode) across the 4 Brood War-Zones (`PROPOSAL-RAIDING-FACTIONS.md` §2.4,
`cultural_wardrobe_master_plan.md` §13, and `settlements/screamers/`):

  Brood I — Talk-Good Elders (Hexahedron Arcology Waist & Conversion Vaults):
   1. `tg_speaker_elder`    (`0.10`) — Talk-Good Speaker-Keeper Elder (loudspeaker mitre, double-pyramid mantle, hex-chimes)
   2. `tg_hex_warden`       (`0.14`) — Hexahedron Terrace & Captive-Pen Warden (zip-tie band, plastic-rust treasure collar)

  Brood II — Howl-Culm (West Cut & Port Visas Howlbamboo Ambush March):
   3. `hc_reed_piper`       (`0.14`) — Howl-Culm Dorsal Reed-Organ Stalker (screaming dot-visor, 5 whistling dorsal pipes)
   4. `hc_net_catcher`      (`0.16`) — Howl-Culm Ghostpipe Net-Catcher (lashed hardwood & capture-net harness, dart-tubes)

  Brood III — Rust-Skull (East Mirage Savanna & Fort Kalor Scrap-Ruin):
   5. `rs_megaphone_brute`  (`0.14`) — Rust-Skull Megaphone-Jaw Raider (scrap-iron megaphone jaw-mask & jagged rebar plate)
   6. `rs_rebar_warchief`   (`0.10`) — Fort Kalor Rebar-Plate Apex War-Chief (reflector skullhelm, hull-sheet war-coat)

  Brood IV — Scald-Mist (South Steampits & Boiling-Bay Fumarole Coast):
   7. `sm_whistle_raider`   (`0.12`) — Scald-Mist Steam-Whistle Raider (twin-pipe steam-whistle helmet & sulfur-hide wraps)
   8. `sm_fumarole_stalker` (`0.10`) — Boiling-Coast Sulfur-Hide Stalker (bladder-hide hood, mist poncho, barter gourds)

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/screamers.py
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
from garments.paint import P, B, PN, C, COTTON
from garments.types.torso import (
    torso_tube, collar_disc, cape, tabard, crossed_sash, pauldron,
)
from garments.types.armor import (
    cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_rings, sculpted_faceplate, hood, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, tube, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

SCREAMER_COLORS = {
    'scr_rust':         (0.390, 0.052, 0.012),
    'scr_bloodwood':    (0.480, 0.018, 0.018),
    'scr_kaolin':       (0.850, 0.830, 0.780),
    'scr_ironwood':     (0.085, 0.048, 0.028),
    'scr_howlbamboo':   (0.520, 0.430, 0.165),
    'scr_palmthatch':   (0.480, 0.380, 0.175),
    'scr_sulfur':       (0.680, 0.560, 0.040),
    'scr_kalor_iron':   (0.115, 0.095, 0.085),
    'scr_pvc_cyan':     (0.080, 0.620, 0.740),
}
for _k, _v in SCREAMER_COLORS.items():
    C.setdefault(_k, _v)

SCREAMER_TIER_SHARES = [
    ['tg_speaker_elder', 0.10],
    ['tg_hex_warden', 0.14],
    ['hc_reed_piper', 0.14],
    ['hc_net_catcher', 0.16],
    ['rs_megaphone_brute', 0.14],
    ['rs_rebar_warchief', 0.10],
    ['sm_whistle_raider', 0.12],
    ['sm_fumarole_stalker', 0.10],
]

SCREAMER_TIER_LABELS = {
    'tg_speaker_elder': 'Talk-Good Elder Speaker-Keeper (Hexahedron Brood)',
    'tg_hex_warden': 'Hexahedron Terrace & Treasure-Collar Warden (Talk-Good Brood)',
    'hc_reed_piper': 'Howl-Culm Dorsal Reed-Organ Stalker (Howl-Culm Brood)',
    'hc_net_catcher': 'Howl-Culm Ghostpipe Net-Catcher (Howl-Culm Brood)',
    'rs_megaphone_brute': 'Rust-Skull Megaphone-Jaw Raider (Fort Kalor Brood)',
    'rs_rebar_warchief': 'Fort Kalor Rebar-Plate Apex War-Chief (Rust-Skull Brood)',
    'sm_whistle_raider': 'Scald-Mist Steam-Whistle Raider (Steampits Brood)',
    'sm_fumarole_stalker': 'Boiling-Coast Sulfur-Hide Stalker (Scald-Mist Brood)',
}

_PAT_DIR = REPO_ROOT / 'core' / 'materials' / 'patterns'
_SCR_TEX_FILES = {
    'scr_dot_skull':      _PAT_DIR / 'screamers' / 'dot-skull-hardwood' / 'albedo.jpg',
    'scr_plastic_mosaic': _PAT_DIR / 'screamers' / 'plastic-rust-mosaic' / 'albedo.jpg',
    'scr_hide_figure':    _PAT_DIR / 'screamers' / 'hide-figure' / 'albedo.jpg',
    'scr_hazard':         _PAT_DIR / 'port' / 'hazard' / 'albedo.jpg',
}
_SCR_TEX_CACHE = {}


def _sample_disk_sheet(key, w, h, fg, bg, blend=0.25):
    if key not in _SCR_TEX_CACHE:
        arr = None
        p = paint_mod._resolve_lfs(_SCR_TEX_FILES[key])
        if p.exists() and p.stat().st_size > 500:
            try:
                im = Image.open(p).convert('RGB')
                px = np.asarray(im, dtype=np.float32) / 255.0
                arr = np.power(np.clip(px, 0.0, 1.0), 2.2)
            except Exception:
                arr = None
        _SCR_TEX_CACHE[key] = arr
    src = _SCR_TEX_CACHE[key]
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


def _scr_hexahedron_diamond(w, h, fg, bg):
    """Canonical 1,100-m Double-Pyramid Hexahedron arcology icon with neon/kaolin dot halo."""
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = ((xx + 0.5) / max(w, 1) * 2.0) % 1.0 - 0.5
    v = (yy + 0.5) / max(h, 1) - 0.5
    d_man = np.abs(u) * 1.15 + np.abs(v)
    outer = (d_man < 0.36) & (d_man > 0.28)
    waist = (np.abs(v) < 0.035) & (np.abs(u) < 0.32)
    spine = (np.abs(u) < 0.025) & (np.abs(v) < 0.34)
    dots = (((u * 14.0) % 1.0 - 0.5) ** 2 + ((v * 14.0) % 1.0 - 0.5) ** 2 < 0.06) & (d_man < 0.44) & (d_man > 0.38)
    img[outer | waist | spine] = fg
    img[dots] = C['neonyellow']
    return np.clip(img, 0.0, 1.0)


def _scr_net_weave(w, h, fg, bg):
    """Diagonal liana capture-net lattice with neon-yellow plastic floats & rust sinker knots."""
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1) * 8.0
    v = (yy + 0.5) / max(h, 1) * 4.0
    d1 = np.abs((u + v) % 1.0 - 0.5) < 0.08
    d2 = np.abs((u - v) % 1.0 - 0.5) < 0.08
    knot = (np.hypot((u % 1.0) - 0.5, (v % 1.0) - 0.5) < 0.14)
    img[d1 | d2] = fg
    img[knot] = C['neonyellow']
    return np.clip(img, 0.0, 1.0)


@contextmanager
def _screamer_motif_ctx():
    orig = paint_mod.motif

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in _SCR_TEX_FILES:
            return _sample_disk_sheet(style, w, h, fg, bg)
        if style == 'scr_hexahedron_diamond':
            return _scr_hexahedron_diamond(w, h, fg, bg)
        if style == 'scr_net_weave':
            return _scr_net_weave(w, h, fg, bg)
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
    bp = bar_paint or P('scr_rust', 0.05, fabric='metal.iron')
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
# SHARED / REUSABLE SCREAMER LOWERS, FOOTWEAR & GLOVES (`scr_{s}_*`)
# ===========================================================================================================
def _build_shared_pieces(sex):
    entries = []

    # 1. Shredded palm-thatch & skull-dot raffia hip-kilt (`WAIST - 0.044`, `legged=False`)
    p_raffia = P('scr_palmthatch', 0.06, [
        B('bottom', 0.0, 0.07, 'scr_dot_skull', 'scr_kaolin', 'scr_bloodwood', 0.12),
        B('top', 0.0, 0.03, 'solid', 'scr_pvc_cyan'),
    ], fabric='straw.reed.plaited')
    entries.append(assemble_garment(
        f'scr_{sex}_raffia_kilt', 'Palm-Thatch & Cable-Belted Screamer Kilt', 'legs', 'screamers',
        [torso_tube(f'scr_{sex}_raf_kilt', core.WAIST - 0.044, core.KNEE + 0.05, 0.025, p_raffia,
                    n=40, rows=14, hang_from=core.WAIST - 0.044, flare=0.082)],
        legged=False,
    ))

    # 2. Corrugated Fort Kalor scrap-plate & hinged iron war-tassets (`WAIST - 0.044`, `legged=False`)
    p_scrap_k = P('scr_rust', 0.05, [
        B('bottom', 0.0, 0.06, 'scr_hazard', 'neonyellow', 'soot', 0.12),
    ], [PN(0.0, 1.0, 'scr_plastic_mosaic', 'scr_kaolin', 'scr_rust', 0.24)], fabric='metal.iron')
    p_scrap_stl = P('scr_kalor_iron', 0.04, fabric='metal.steel')
    entries.append(assemble_garment(
        f'scr_{sex}_scrap_tassets', 'Corrugated Rust-Plate & Hinged Iron War-Tassets', 'legs', 'screamers',
        [torso_tube(f'scr_{sex}_scrp_kilt', core.WAIST - 0.044, core.KNEE + 0.05, 0.025, p_scrap_k,
                    n=40, rows=14, hang_from=core.WAIST - 0.044, flare=0.082)]
        + hinged_tassets(f'scr_{sex}_scrp_htass', p_scrap_k, trim_paint=p_scrap_stl, lames=3, ease=0.028),
        legged=False,
    ))

    # 3. Jungle stalker & Fort Kalor knee-cropped breeches (`ease=0.014, bag=0.008`)
    p_stalk = P('scr_ironwood', 0.05, [
        B('bottom', 0.0, 0.05, 'scr_dot_skull', 'scr_kaolin', 'scr_bloodwood', 0.10),
    ], fabric='cloth.bark.tapa')
    entries.append(assemble_garment(
        f'scr_{sex}_stalker_wraps', 'Liana-Bound Barkcloth Jungle Stalker Breeches', 'legs', 'screamers',
        trousers(f'scr_{sex}_stalker_wraps', p_stalk, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # --- Footwear (3 styles: open liana sandals, bare-leg snug conduit greaves, trouser-paired Kalor boots) ---
    entries.append(assemble_garment(
        f'scr_{sex}_liana_sandals', 'Braided Liana & Tyre-Rubber Jungle Sandals', 'feet', 'screamers',
        sandal(f'scr_{sex}_liana_sandals', P('soot', 0.06, fabric='rubber.tyre'),
               P('scr_palmthatch', 0.05, fabric='straw.plaited'), guard=False, laces=2),
    ))

    p_cond_b = P('scr_rust', 0.05, [B('top', 0.0, 0.04, 'solid', 'scr_pvc_cyan')], fabric='metal.iron')
    p_cond_s = P('scr_kalor_iron', 0.04, fabric='metal.steel')
    entries.append(assemble_garment(
        f'scr_{sex}_tyre_greaves', 'Sculpted Scrap-Iron & Conduit Bare-Calf Greaves', 'feet', 'screamers',
        boots(f'scr_{sex}_tyre_greaves', P('soot', 0.06, fabric='rubber.tyre'), p_cond_b,
              top=0.22, ease_top=0.016)
        + sculpted_greaves(f'scr_{sex}_tyre_sgrv', p_cond_b, trim_paint=p_cond_s, poleyn=True, ease=0.016),
    ))

    entries.append(assemble_garment(
        f'scr_{sex}_kalor_boots', 'Fort Kalor Scrap-Shod & Sulfur-Hide War-Boots', 'feet', 'screamers',
        boots(f'scr_{sex}_kalor_boots', P('soot', 0.06, fabric='rubber.tyre'),
              P('scr_kalor_iron', 0.05, [B('top', 0.0, 0.04, 'solid', 'scr_sulfur')], fabric='leather.cuir_bouilli'),
              top=0.42, ease_top=0.024),
    ))

    # --- Gloves & Bracers (4 brood-distinct styles) ---
    p_wire = P('copper', 0.04, [B('top', 0.0, 0.03, 'solid', 'neonyellow'), B('bottom', 0.0, 0.03, 'solid', 'neonmagenta')],
               fabric='metal.brass.braid')
    entries.append(assemble_garment(
        f'scr_{sex}_wire_cuffs', 'Tangled Copper-Wire & Plastic-Key Wrist Wraps', 'gloves', 'screamers',
        [sleeve(f'scr_{sex}_wcuf_L', L, p_wire, f0=0.62, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'scr_{sex}_wcuf_R', R, p_wire, f0=0.62, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    p_bmb = P('scr_howlbamboo', 0.05, [B('top', 0.0, 0.03, 'solid', 'scr_bloodwood')], fabric='armor.lamellar.horn')
    entries.append(assemble_garment(
        f'scr_{sex}_bamboo_bracers', 'Split Howl-Bamboo & Liana Splint Bracers', 'gloves', 'screamers',
        [sleeve(f'scr_{sex}_bbrc_L', L, p_bmb, f0=0.56, f1=0.94, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'scr_{sex}_bbrc_R', R, p_bmb, f0=0.56, f1=0.94, ease=0.014, flare=0.004, rows=7, n=20)],
    ))

    p_cg_iron = P('scr_rust', 0.05, [B('top', 0.0, 0.03, 'solid', 'scr_pvc_cyan')], fabric='metal.iron')
    p_cg_stl = P('scr_kalor_iron', 0.04, [B('top', 0.0, 0.03, 'solid', 'neonyellow')], fabric='metal.steel')
    entries.append(assemble_garment(
        f'scr_{sex}_conduit_gauntlets', 'Sculpted Scrap-Iron Vambraces & Rebar Gauntlets', 'gloves', 'screamers',
        full_gloves(f'scr_{sex}_conduit_gauntlets', p_cg_iron,
                    P('scr_kalor_iron', 0.05, fabric='metal.iron'), f0=0.80, ease=0.012,
                    knuckle_paint=p_cg_stl)
        + sculpted_vambraces(f'scr_{sex}_cond_vam', p_cg_iron, trim_paint=p_cg_stl, couter=True, ease=0.016),
    ))

    entries.append(assemble_garment(
        f'scr_{sex}_scald_mitts', 'Oiled Bladder-Hide & Sulfur Fumarole Mitts', 'gloves', 'screamers',
        full_gloves(f'scr_{sex}_scald_mitts', P('scr_sulfur', 0.05, fabric='hide.sealslick.oiled'),
                    P('scr_ironwood', 0.05, fabric='leather.foundry.pigskin'), f0=0.58, ease=0.014),
    ))

    return entries


# ===========================================================================================================
# 8 SCREAMER BROOD TIERS (`head`, `torso`, `back`)
# ===========================================================================================================
def _build_screamer_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    # ==================== BROOD I: TALK-GOOD ELDERS (HEXAHEDRON CORE) ====================

    # --- 1. tg_speaker_elder ---
    gid_h = f'scr_{sex}_speaker_mitre'
    mit_p = P('scr_rust', 0.04, [B('bottom', 0.0, 0.05, 'solid', 'cybercyan')],
              [PN(0.0, 1.0, 'scr_plastic_mosaic', 'neonyellow', 'scr_rust', 0.24)], fabric='metal.tin.patchwork')
    mit_dome = _open_brow_dome(f'{gid_h}_mitre', mit_p, f_brow=0.64, f_low=0.14, high=1.14, ease=0.018)
    sp_anc = _host_anchor(mit_dome, a + (b - a) * 0.96 + fwd * 0.04)
    speaker_cone = horn(f'{gid_h}_speaker_horn', [sp_anc - up * 0.005, sp_anc + up * 0.11 + fwd * 0.045], 0.028, 0.068,
                        P('ancient', 0.03, [B('top', 0.0, 0.03, 'solid', 'neonmagenta')], fabric='armor.ancient.hex_weave'),
                        n=14, rows=7, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Salvaged Hexahedron Loudspeaker & Circuit Mitre', 'head', 'screamers',
                                    [mit_dome, speaker_cone], covers_hair=True))

    gid_t = f'scr_{sex}_diplomatic_mantle'
    mnt_p = P('scr_palmthatch', 0.05, [
        B('bottom', 0.0, 0.09, 'scr_plastic_mosaic', 'cybercyan', 'scr_rust', 0.14),
    ], [PN(0.0, 1.0, 'scr_plastic_mosaic', 'neonyellow', 'scr_rust', 0.26)], fabric='straw.reed.plaited')
    mantle = torso_tube(f'{gid_t}_mantle', core.TOP, core.KNEE + 0.06, 0.039, mnt_p, n=42, rows=20, hang_from=core.WAIST, flare=0.118)
    hex_plq = tabard(f'{gid_t}_hex_plaque', core.WAIST + 0.03, core.TOP - 0.02,
                     P('ancient', 0.03, [], [PN(0.0, 1.0, 'scr_hexahedron_diamond', 'cybercyan', 'scr_rust', 0.26)],
                       fabric='armor.ancient.hex_weave'), width=0.19, ease=0.043, front=True, back=False)
    rib_col = collar_disc(f'{gid_t}_ribbon_col', 0.102,
                          P('neonmagenta', 0.03, [B('bottom', 0.0, 0.03, 'stripes', 'cybercyan', 'neonyellow', 0.08)],
                            fabric='beads.glass'), drop=0.072, ease=0.025)
    entries.append(assemble_garment(gid_t, 'Geometric Hexahedron Console Mantle & Plastic-Shard Regalia', 'torso', 'screamers',
                                    [mantle, hex_plq, rib_col, sleeves(gid_t, 'elbow', 0.019, mnt_p)]))

    gid_b = f'scr_{sex}_hex_chime_rack'
    pad, anc = _dorsal_pad(gid_b, P('scr_rust', 0.05), clearance=0.043)
    xbar = tube(f'{gid_b}_bar', [anc + up * 0.15 - left * 0.11 + BACK_DIR * 0.026, anc + up * 0.15 + left * 0.11 + BACK_DIR * 0.026],
                0.013, P('scr_ironwood', 0.05, fabric='leather.buckskin'), n=8, rigid_joint='Spine2')
    chimes = []
    for k_c, (lx, ln) in enumerate(((-0.075, 0.22), (0.0, 0.27), (0.075, 0.22))):
        chimes.append(tube(f'{gid_b}_chime_{k_c}',
                           [anc + up * 0.15 + left * lx + BACK_DIR * 0.026, anc + up * (0.15 - ln) + left * lx + BACK_DIR * 0.026],
                           0.015, P('ancient', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'cybercyan')],
                                    fabric='armor.ancient.hex_weave'), n=8, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_b, 'Salvaged Ancient Hex-Chime Acoustic Resonator Rack', 'back', 'screamers',
                                    [pad, xbar] + chimes))

    # --- 2. tg_hex_warden ---
    gid_h = f'scr_{sex}_zip_feather_band'
    zf_band = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004,
                         P('scr_ironwood', 0.05, [B('bottom', 0.0, 0.03, 'scr_dot_skull', 'scr_kaolin', 'scr_bloodwood', 0.09)],
                           fabric='cloth.bark.tapa'), n=36, rows=5)
    z1_a = _host_anchor(zf_band, a + (b - a) * 0.68 + left * 0.075)
    z2_a = _host_anchor(zf_band, a + (b - a) * 0.68 - left * 0.075)
    zt1 = horn(f'{gid_h}_ziptieL', [z1_a, z1_a + up * 0.10 + left * 0.03], 0.008, 0.002,
               P('neonyellow', 0.02, fabric='metal.tin.patchwork'), n=8, rows=5, rigid_joint='Head')
    zt2 = horn(f'{gid_h}_ziptieR', [z2_a, z2_a + up * 0.10 - left * 0.03], 0.008, 0.002,
               P('cybercyan', 0.02, fabric='metal.tin.patchwork'), n=8, rows=5, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Skull-Dot Brow-Band & Neon Plastic Zip-Tie Spines', 'head', 'screamers',
                                    [zf_band, zt1, zt2], covers_hair=False))

    gid_t = f'scr_{sex}_treasure_slat_vest'
    sl_p = P('scr_ironwood', 0.05, [
        B('bottom', 0.0, 0.05, 'scr_dot_skull', 'scr_kaolin', 'scr_bloodwood', 0.10),
    ], [PN(0.0, 1.0, 'scr_dot_skull', 'scr_kaolin', 'scr_ironwood', 0.24)], fabric='armor.lamellar.horn')
    sl_vest = torso_tube(f'{gid_t}_vest', core.TOP - 0.008, core.WAIST - 0.050, 0.025, sl_p, n=40, rows=13, flare=0.046)
    tr_col = collar_disc(f'{gid_t}_treasure_col', 0.100,
                         P('scr_rust', 0.04, [], [PN(0.0, 1.0, 'scr_plastic_mosaic', 'neonyellow', 'cybercyan', 0.24)],
                           fabric='beads.glass'), drop=0.072, ease=0.024)
    entries.append(assemble_garment(gid_t, 'Lashed Ironwood Slat-Vest & Plastic-Rust Treasure Collar', 'torso', 'screamers',
                                    [sl_vest, tr_col]))

    gid_b = f'scr_{sex}_intercom_spool'
    pad, anc = _dorsal_pad(gid_b, P('scr_ironwood', 0.05), clearance=0.029)
    spool = rosette(f'{gid_b}_spool', anc + BACK_DIR * 0.022, BACK_DIR, left, 0.096,
                    P('copper', 0.03, [B('top', 0.0, 0.03, 'solid', 'cybercyan')], fabric='metal.brass.braid'),
                    n=16, thick=0.024, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Salvaged Arcology Intercom-Wire Spool', 'back', 'screamers', [pad, spool]))

    # ==================== BROOD II: HOWL-CULM (HOWLBAMBOO AMBUSH MARCH) ====================

    # --- 3. hc_reed_piper ---
    gid_h = f'scr_{sex}_scream_visor'
    sv_p = P('scr_ironwood', 0.05, [B('bottom', 0.0, 0.05, 'scr_dot_skull', 'scr_kaolin', 'scr_bloodwood', 0.12)],
             [PN(0.0, 1.0, 'scr_dot_skull', 'scr_kaolin', 'scr_bloodwood', 0.24)], fabric='armor.lamellar.horn')
    sv_dome = _open_brow_dome(f'{gid_h}_visor_cap', sv_p, f_brow=0.63, f_low=0.12, ease=0.013)
    sv_l = _host_anchor(sv_dome, a + (b - a) * 0.64 + left * 0.045 + fwd * 0.092)
    sv_m = _host_anchor(sv_dome, a + (b - a) * 0.64 + fwd * 0.106)
    sv_r = _host_anchor(sv_dome, a + (b - a) * 0.64 - left * 0.045 + fwd * 0.092)
    sv_bar = tube(f'{gid_h}_dot_brow', [sv_l + fwd * 0.005, sv_m + fwd * 0.009, sv_r + fwd * 0.005], 0.013,
                  P('scr_kaolin', 0.04, [B('top', 0.0, 0.02, 'solid', 'scr_bloodwood')], fabric='armor.lamellar.horn'),
                  n=10, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Carved Ironwood Screaming Dot-Visor', 'head', 'screamers',
                                    [sv_dome, sv_bar], covers_hair=True))

    gid_t = f'scr_{sex}_culm_stalker_wrap'
    clm_p = P('scr_howlbamboo', 0.05, [B('top', 0.0, 0.03, 'scr_dot_skull', 'scr_kaolin', 'scr_bloodwood', 0.09)],
              fabric='straw.reed.plaited')
    if sex == 'm':
        c_parts = [
            crossed_sash(f'{gid_t}_sash', clm_p, width=0.068, ease=0.022),
            belt_sash(f'{gid_t}_belt', core.WAIST - 0.014, core.WAIST + 0.030,
                      P('scr_bloodwood', 0.05, fabric='cloth.bark.tapa'), ease=0.024),
        ]
    else:
        c_halter = torso_tube(f'{gid_t}_halter', core.CHEST + 0.06, core.WAIST - 0.048, 0.021, clm_p, n=38, rows=10, flare=0.038)
        c_parts = [c_halter, crossed_sash(f'{gid_t}_sash', clm_p, width=0.055, ease=0.027)]
    entries.append(assemble_garment(gid_t, 'Howl-Culm Liana & Split-Bamboo Stalker Harness', 'torso', 'screamers',
                                    c_parts, open_torso=True))

    gid_b = f'scr_{sex}_reed_organ_pipes'
    pad, anc = _dorsal_pad(gid_b, P('scr_howlbamboo', 0.05), clearance=0.026)
    organ_bar = tube(f'{gid_b}_lashbar', [anc - left * 0.10 + BACK_DIR * 0.022, anc + left * 0.10 + BACK_DIR * 0.022],
                     0.014, P('scr_bloodwood', 0.05, fabric='cloth.bark.tapa'), n=8, rigid_joint='Spine2')
    pipes = []
    for k_p, (lx, h_top) in enumerate(((-0.08, 0.22), (-0.04, 0.29), (0.0, 0.34), (0.04, 0.27), (0.08, 0.20))):
        pipes.append(tube(f'{gid_b}_culm_{k_p}',
                          [anc - up * 0.11 + left * lx + BACK_DIR * 0.024, anc + up * h_top + left * lx + BACK_DIR * 0.030],
                          0.016, P('scr_howlbamboo', 0.04, [B('top', 0.0, 0.03, 'solid', 'bone')],
                                   fabric='armor.lamellar.horn'), n=10, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_b, 'Whistling Beetle-Bored Howl-Bamboo Dorsal Reed-Organ', 'back', 'screamers',
                                    [pad, organ_bar] + pipes))

    # --- 4. hc_net_catcher ---
    gid_h = f'scr_{sex}_culm_band'
    nc_b = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004,
                      P('scr_howlbamboo', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'scr_bloodwood')], fabric='straw.plaited'),
                      n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Woven Liana & Ghostpipe-Pod Stalker Brow-Band', 'head', 'screamers',
                                    [nc_b], covers_hair=False))

    gid_t = f'scr_{sex}_net_harness'
    nh_vest = torso_tube(f'{gid_t}_vest', core.TOP - 0.008, core.WAIST - 0.050, 0.025,
                         P('scr_ironwood', 0.05, [], [PN(0.0, 1.0, 'scr_hide_figure', 'scr_kaolin', 'scr_ironwood', 0.22)],
                           fabric='cloth.bark.tapa'), n=40, rows=13, flare=0.046)
    net_sash = crossed_sash(f'{gid_t}_netsash',
                            P('scr_palmthatch', 0.05, [], [PN(0.0, 1.0, 'scr_net_weave', 'scr_palmthatch', 'scr_ironwood', 0.24)],
                              fabric='straw.plaited'), width=0.066, ease=0.032)
    entries.append(assemble_garment(gid_t, 'Lashed Hardwood & Weighted Capture-Net Harness', 'torso', 'screamers',
                                    [nh_vest, net_sash]))

    gid_b = f'scr_{sex}_capture_net_coil'
    pad, anc = _dorsal_pad(gid_b, P('scr_palmthatch', 0.05), clearance=0.029)
    ncoil = rosette(f'{gid_b}_netcoil', anc + BACK_DIR * 0.022, BACK_DIR, left, 0.105,
                    P('scr_palmthatch', 0.05, [B('top', 0.0, 0.03, 'solid', 'neonyellow')], fabric='straw.plaited'),
                    n=16, thick=0.025, rigid_joint='Spine2')
    mpole = tube(f'{gid_b}_mancatcher', [anc - up * 0.15 + BACK_DIR * 0.026, anc + up * 0.24 + BACK_DIR * 0.030],
                 0.013, P('scr_howlbamboo', 0.05, fabric='armor.lamellar.horn'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Weighted Capture-Net Coil & Man-Catcher Pole', 'back', 'screamers',
                                    [pad, ncoil, mpole]))

    # ==================== BROOD III: RUST-SKULL (FORT KALOR SCRAP-RUIN) ====================

    # --- 5. rs_megaphone_brute ---
    gid_h = f'scr_{sex}_megaphone_mask'
    rs_p = P('scr_rust', 0.05, [B('bottom', 0.0, 0.04, 'scr_dot_skull', 'scr_kaolin', 'scr_rust', 0.10)],
             [PN(0.0, 1.0, 'scr_dot_skull', 'scr_kaolin', 'scr_rust', 0.22)], fabric='armor.salvage.tread_plate')
    rs_dome = _open_brow_dome(f'{gid_h}_casque', rs_p, f_brow=0.63, f_low=0.08, ease=0.013)
    fp_r, fp_r_pts = _faceplate_with_slits(gid_h, rs_p, bar_paint=P('scr_kalor_iron', 0.04, fabric='metal.iron'))
    jaw_anc = _host_anchor(fp_r, a + (b - a) * 0.14 + fwd * 0.12)
    megaphone = horn(f'{gid_h}_megaphone_jaw', [jaw_anc - fwd * 0.004, jaw_anc + fwd * 0.078 - up * 0.015], 0.024, 0.054,
                     P('scr_rust', 0.05, [B('top', 0.0, 0.03, 'scr_hazard', 'neonyellow', 'soot', 0.10)],
                       fabric='metal.tin.patchwork'), n=14, rows=6, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Fort Kalor Oxidized Scrap-Iron Megaphone Jaw-Mask', 'head', 'screamers',
                                    [rs_dome] + fp_r_pts + [megaphone], covers_hair=True, covers_face=True))

    gid_t = f'scr_{sex}_rebar_cuirass'
    rs_iron = P('scr_rust', 0.05, [B('bottom', 0.0, 0.04, 'scr_dot_skull', 'scr_kaolin', 'scr_rust', 0.10)],
                [PN(0.0, 1.0, 'scr_dot_skull', 'scr_kaolin', 'scr_rust', 0.22)], fabric='metal.iron')
    hz_stl = P('neonyellow', 0.04, [], [PN(0.0, 1.0, 'scr_hazard', 'soot', 'neonyellow', 0.22)], fabric='metal.steel')
    rb_cuir = cuirass_plate(f'{gid_t}_cuir', rs_iron, trim_paint=hz_stl, style='laminar', faulds=3, ease=0.023)
    rb_gorg = gorget_guard(f'{gid_t}_gorget', P('scr_kalor_iron', 0.04, fabric='metal.iron'), trim_paint=hz_stl, ease=0.024)
    hz_pld = articulated_pauldron(f'{gid_t}_sign_pld', L, hz_stl, trim_paint=rs_iron, lames=3, haute_piece=True, ease=0.015)
    entries.append(assemble_garment(gid_t, 'Corrugated Scrap-Iron Laminar Cuirass & Hazard Pauldron', 'torso', 'screamers',
                                    rb_cuir + rb_gorg + hz_pld))

    gid_b = f'scr_{sex}_rebar_trophy_rack'
    pad, anc = _dorsal_pad(gid_b, P('scr_rust', 0.05), clearance=0.031)
    rb1 = tube(f'{gid_b}_rebarL', [anc - up * 0.14 - left * 0.05 + BACK_DIR * 0.026, anc + up * 0.23 + left * 0.08 + BACK_DIR * 0.028],
               0.013, P('scr_rust', 0.05, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    rb2 = tube(f'{gid_b}_rebarR', [anc - up * 0.14 + left * 0.05 + BACK_DIR * 0.026, anc + up * 0.23 - left * 0.08 + BACK_DIR * 0.028],
               0.013, P('scr_kalor_iron', 0.05, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    sign = rosette(f'{gid_b}_warnsign', anc + BACK_DIR * 0.034, BACK_DIR, left, 0.075,
                   P('neonyellow', 0.04, [B('top', 0.0, 0.03, 'solid', 'scr_rust')], fabric='metal.tin.patchwork'),
                   n=12, thick=0.014, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Jagged Fort Kalor Rebar Spikes & Hazard-Sign Rack', 'back', 'screamers',
                                    [pad, rb1, rb2, sign]))

    # --- 6. rs_rebar_warchief ---
    gid_h = f'scr_{sex}_reflector_skullhelm'
    sk_p = P('bone', 0.04, [B('bottom', 0.0, 0.05, 'scr_dot_skull', 'scr_bloodwood', 'bone', 0.12)],
             [PN(0.0, 1.0, 'scr_dot_skull', 'scr_bloodwood', 'bone', 0.22)], fabric='armor.lamellar.horn')
    sk_dome = _open_brow_dome(f'{gid_h}_skullcap', sk_p, f_brow=0.63, f_low=0.10, ease=0.014)
    rf_l = _host_anchor(sk_dome, a + (b - a) * 0.88 + left * 0.068)
    rf_r = _host_anchor(sk_dome, a + (b - a) * 0.88 - left * 0.068)
    acr_l = horn(f'{gid_h}_reflL', [rf_l - left * 0.004, rf_l + left * 0.05 + up * 0.12], 0.020, 0.005,
                 P('sunorange', 0.02, fabric='glass.moonglass.leaded'), n=10, rows=6, rigid_joint='Head')
    acr_r = horn(f'{gid_h}_reflR', [rf_r + left * 0.004, rf_r - left * 0.05 + up * 0.12], 0.020, 0.005,
                 P('cybercyan', 0.02, fabric='glass.moonglass.leaded'), n=10, rows=6, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Dot-Painted Skullhelm & Neon Road-Reflector Crest', 'head', 'screamers',
                                    [sk_dome, acr_l, acr_r], covers_hair=True))

    gid_t = f'scr_{sex}_kalor_hull_coat'
    kh_p = P('scr_rust', 0.05, [
        B('bottom', 0.0, 0.08, 'scr_plastic_mosaic', 'neonyellow', 'scr_rust', 0.12),
    ], [PN(0.0, 1.0, 'scr_dot_skull', 'scr_kaolin', 'scr_rust', 0.24)], fabric='metal.iron')
    kh_stl = P('scr_kalor_iron', 0.04, [], [PN(0.0, 1.0, 'scr_plastic_mosaic', 'cybercyan', 'scr_rust', 0.22)], fabric='metal.steel')
    kh_cuir = cuirass_plate(f'{gid_t}_cuir', kh_p, trim_paint=kh_stl, style='gothic', faulds=3, ease=0.023)
    kh_gorg = gorget_guard(f'{gid_t}_gorget', kh_stl, trim_paint=kh_p, ease=0.024)
    kh_plds = articulated_pauldrons(f'{gid_t}_pld', kh_p, trim_paint=kh_stl, lames=3, haute_piece=True, ease=0.022)
    entries.append(assemble_garment(gid_t, 'Fort Kalor Sculpted Gothic Hull-Sheet Cuirass & Faulds', 'torso', 'screamers',
                                    kh_cuir + kh_gorg + kh_plds
                                    + sleeves(gid_t, 'elbow', 0.019, P('scr_ironwood', 0.05, fabric='leather.foundry.pigskin'))))

    gid_b = f'scr_{sex}_scrap_banner_cape'
    sc_cp = cape(f'{gid_b}_cape', core.CROTCH + 0.06,
                 P('scr_rust', 0.05, [B('bottom', 0.0, 0.08, 'scr_hazard', 'neonyellow', 'soot', 0.12)],
                   fabric='cloth.canvas.oiled'),
                 span=0.50, ease=0.028, flare=0.075, rows=14, n=24, stiff=0.36, back_push=0.058)
    entries.append(assemble_garment(gid_b, 'Tattered Caution-Tarp & Rust-Dyed War-Cape', 'back', 'screamers', [sc_cp]))

    # ==================== BROOD IV: SCALD-MIST (STEAMPITS & BOILING COAST) ====================

    # --- 7. sm_whistle_raider ---
    gid_h = f'scr_{sex}_whistle_helmet'
    wh_p = P('copper', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'scr_sulfur')], fabric='metal.bronze.verdigris')
    wh_dome = _open_brow_dome(f'{gid_h}_boiler_helm', wh_p, f_brow=0.63, f_low=0.08, ease=0.013)
    _, wh_fp = _faceplate_with_slits(gid_h, wh_p, bar_paint=P('verdigris', 0.04, fabric='metal.bronze.verdigris'),
                                     lens_paint=P('amber', 0.02, fabric='glass.moonglass.leaded'))
    wp_l = _host_anchor(wh_dome, a + (b - a) * 0.96 + left * 0.038)
    wp_r = _host_anchor(wh_dome, a + (b - a) * 0.96 - left * 0.038)
    whis_l = horn(f'{gid_h}_whistleL', [wp_l - up * 0.004, wp_l + up * 0.095], 0.015, 0.013,
                  P('brass', 0.02, fabric='metal.bronze'), n=10, rows=6, rigid_joint='Head')
    whis_r = horn(f'{gid_h}_whistleR', [wp_r - up * 0.004, wp_r + up * 0.075], 0.015, 0.013,
                  P('copper', 0.03, fabric='metal.bronze'), n=10, rows=6, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Steampits Copper Boiler-Helm & Twin Steam-Whistle Pipes', 'head', 'screamers',
                                    [wh_dome] + wh_fp + [whis_l, whis_r], covers_hair=True, covers_face=True))

    gid_t = f'scr_{sex}_sulfur_hide_wraps'
    sh_brz = P('verdigris', 0.04, [
        B('bottom', 0.0, 0.06, 'scr_dot_skull', 'scr_bloodwood', 'scr_sulfur', 0.12),
    ], [PN(0.0, 1.0, 'scr_hide_figure', 'scr_bloodwood', 'scr_sulfur', 0.22)], fabric='metal.bronze')
    sh_cop = P('copper', 0.04, fabric='metal.bronze')
    sh_cuir = cuirass_plate(f'{gid_t}_cuir', sh_brz, trim_paint=sh_cop, style='lamellar', faulds=2, ease=0.022)
    ch_pld = articulated_pauldron(f'{gid_t}_chitin_pld', R, sh_cop, trim_paint=sh_brz, lames=3, haute_piece=False, ease=0.020)
    entries.append(assemble_garment(gid_t, 'Fumarole Boiler-Bronze Lamellar Cuirass & Sulfur-Hide Sleeves', 'torso', 'screamers',
                                    sh_cuir + ch_pld
                                    + sleeves(gid_t, 'elbow', 0.018, P('scr_sulfur', 0.05, fabric='hide.sealslick.oiled'))))

    gid_b = f'scr_{sex}_steam_pot_pack'
    pad, anc = _dorsal_pad(gid_b, P('scr_sulfur', 0.05), clearance=0.030)
    kettle = blob(f'{gid_b}_kettle', anc + BACK_DIR * 0.026, (0.13, 0.068, 0.18),
                  P('copper', 0.04, [B('top', 0.0, 0.04, 'solid', 'verdigris')], fabric='metal.bronze.verdigris'),
                  n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    vpipe = tube(f'{gid_b}_ventpipe', [anc + up * 0.06 + BACK_DIR * 0.030, anc + up * 0.21 + BACK_DIR * 0.032],
                 0.013, P('brass', 0.03, fabric='metal.bronze'), n=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Pressurized Copper Fumarole Whistle-Kettle Pack', 'back', 'screamers',
                                    [pad, kettle, vpipe]))

    # --- 8. sm_fumarole_stalker ---
    gid_h = f'scr_{sex}_fumarole_hood'
    fh_p = P('scr_ironwood', 0.05, [B('bottom', 0.0, 0.05, 'solid', 'scr_sulfur')], fabric='hide.sealslick.oiled')
    fh_hd = hood(f'{gid_h}_hood', fh_p, ease=0.028, ease_low=0.046, open_front=0.90, low=-0.22, rows=13, n=34)
    _, fh_fp = _faceplate_with_slits(gid_h, P('scr_sulfur', 0.05, fabric='hide.sealslick.oiled'),
                                     bar_paint=P('scr_bloodwood', 0.04, fabric='leather.buckskin'))
    entries.append(assemble_garment(gid_h, 'Scald-Proof Oiled Bladder-Hide Hood & Sulfur Filter', 'head', 'screamers',
                                    [fh_hd] + fh_fp, covers_hair=True, covers_face=True))

    gid_t = f'scr_{sex}_mist_poncho'
    mp_p = P('scr_ironwood', 0.05, [
        B('bottom', 0.0, 0.08, 'scr_dot_skull', 'scr_sulfur', 'scr_bloodwood', 0.12),
    ], [PN(0.0, 1.0, 'scr_hide_figure', 'scr_sulfur', 'scr_ironwood', 0.22)], fabric='leather.foundry.pigskin')
    mp_coat = torso_tube(f'{gid_t}_poncho', core.TOP, core.KNEE + 0.06, 0.038, mp_p, n=42, rows=19, hang_from=core.WAIST, flare=0.116)
    mp_sash = crossed_sash(f'{gid_t}_tally_sash', P('scr_bloodwood', 0.04, fabric=COTTON), width=0.056, ease=0.043)
    entries.append(assemble_garment(gid_t, 'Boiling-Coast Fungus-Leather Mist Poncho & Bloodwood Sash', 'torso', 'screamers',
                                    [mp_coat, mp_sash, sleeves(gid_t, 'elbow', 0.019, mp_p)]))

    gid_b = f'scr_{sex}_sulfur_gourd_rack'
    pad, anc = _dorsal_pad(gid_b, P('scr_ironwood', 0.05), clearance=0.042)
    g1 = blob(f'{gid_b}_gourd1', anc + left * 0.055 + BACK_DIR * 0.026, (0.068, 0.060, 0.14),
              P('scr_sulfur', 0.04, [B('top', 0.0, 0.03, 'solid', 'scr_bloodwood')], fabric='leather.polished'),
              n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    g2 = blob(f'{gid_b}_gourd2', anc - left * 0.055 + BACK_DIR * 0.026, (0.068, 0.060, 0.14),
              P('scr_bloodwood', 0.04, [B('top', 0.0, 0.03, 'solid', 'scr_kaolin')], fabric='leather.polished'),
              n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Twin Ghostpipe & Prism-Resin Beach-Barter Gourds', 'back', 'screamers',
                                    [pad, g1, g2]))

    return entries


def _outfits_for_sex(sex):
    return {
        'tg_speaker_elder': {
            'brood': 'talk_good_elders',
            'head': f'scr_{sex}_speaker_mitre',
            'torso': f'scr_{sex}_diplomatic_mantle',
            'gloves': f'scr_{sex}_wire_cuffs',
            'legs': f'scr_{sex}_raffia_kilt',
            'feet': f'scr_{sex}_liana_sandals',
            'back': f'scr_{sex}_hex_chime_rack',
        },
        'tg_hex_warden': {
            'brood': 'talk_good_elders',
            'head': f'scr_{sex}_zip_feather_band',
            'torso': f'scr_{sex}_treasure_slat_vest',
            'gloves': f'scr_{sex}_wire_cuffs',
            'legs': f'scr_{sex}_raffia_kilt',
            'feet': f'scr_{sex}_liana_sandals',
            'back': f'scr_{sex}_intercom_spool',
        },
        'hc_reed_piper': {
            'brood': 'howl_culm',
            'head': f'scr_{sex}_scream_visor',
            'torso': f'scr_{sex}_culm_stalker_wrap',
            'gloves': f'scr_{sex}_bamboo_bracers',
            'legs': f'scr_{sex}_stalker_wraps',
            'feet': f'scr_{sex}_liana_sandals',
            'back': f'scr_{sex}_reed_organ_pipes',
        },
        'hc_net_catcher': {
            'brood': 'howl_culm',
            'head': f'scr_{sex}_culm_band',
            'torso': f'scr_{sex}_net_harness',
            'gloves': f'scr_{sex}_bamboo_bracers',
            'legs': f'scr_{sex}_stalker_wraps',
            'feet': f'scr_{sex}_liana_sandals',
            'back': f'scr_{sex}_capture_net_coil',
        },
        'rs_megaphone_brute': {
            'brood': 'rust_skull',
            'head': f'scr_{sex}_megaphone_mask',
            'torso': f'scr_{sex}_rebar_cuirass',
            'gloves': f'scr_{sex}_conduit_gauntlets',
            'legs': f'scr_{sex}_scrap_tassets',
            'feet': f'scr_{sex}_tyre_greaves',
            'back': f'scr_{sex}_rebar_trophy_rack',
        },
        'rs_rebar_warchief': {
            'brood': 'rust_skull',
            'head': f'scr_{sex}_reflector_skullhelm',
            'torso': f'scr_{sex}_kalor_hull_coat',
            'gloves': f'scr_{sex}_conduit_gauntlets',
            'legs': f'scr_{sex}_stalker_wraps',
            'feet': f'scr_{sex}_kalor_boots',
            'back': f'scr_{sex}_scrap_banner_cape',
        },
        'sm_whistle_raider': {
            'brood': 'scald_mist',
            'head': f'scr_{sex}_whistle_helmet',
            'torso': f'scr_{sex}_sulfur_hide_wraps',
            'gloves': f'scr_{sex}_scald_mitts',
            'legs': f'scr_{sex}_scrap_tassets',
            'feet': f'scr_{sex}_tyre_greaves',
            'back': f'scr_{sex}_steam_pot_pack',
        },
        'sm_fumarole_stalker': {
            'brood': 'scald_mist',
            'head': f'scr_{sex}_fumarole_hood',
            'torso': f'scr_{sex}_mist_poncho',
            'gloves': f'scr_{sex}_scald_mitts',
            'legs': f'scr_{sex}_stalker_wraps',
            'feet': f'scr_{sex}_kalor_boots',
            'back': f'scr_{sex}_sulfur_gourd_rack',
        },
    }


def build_screamers_peoples_entry():
    return {
        'id': 'screamers',
        'name': 'Screamers of the Hexahedron',
        'note': (
            "Feral non-verbal screaming & captive-taking broods dwelling inside and beneath the 1,100-m Hexahedron "
            "double-pyramid arcology and Fort Kalor ruin — Talk-Good Elders (salvaged hex-chimes & loudspeaker mitres), "
            "Howl-Culm (whistling dorsal bamboo reed-organs & capture-nets), Rust-Skull (scrap-iron megaphone jaw-masks "
            "& jagged rebar plate), and Scald-Mist (Steampits steam-whistle helmets & sulfur-vent hide wraps)."
        ),
        'ancestry': {'african': [0.20, 0.55], 'asian': [0.25, 0.65], 'caucasian': [0.15, 0.45]},
        'skin': ['#c99268', '#a8724a', '#865636', '#663f28', '#4c2e1e'],
        'hair': ['#12100f', '#221a15', '#38281c', '#523824'],
        'eyes': ['#3b2414', '#5a3a22', '#7a3e20', '#4a5a3a'],
        'grey': 0.55,
        'beard': 0.25,
        'morph': {
            'muscle': [0.10, 0.80],
            'weight': [-0.45, 0.20],
        },
        'styles': {
            'male': ['sonntag78_junglebook_hair', 'Dreads_with_Fade', 'long01', 'cortu_short_messy_hair', 'afro01', 'punkduck_alpha7_long'],
            'female': ['punkduck_alpha7_curly', 'long01', 'afro01', 'braid01', 'elvs_micky_afro', 'Two_Braided_Cornrows_Female'],
        },
        'tiers': SCREAMER_TIER_SHARES,
        'tier_labels': SCREAMER_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_screamers_kit():
    entries = []
    with _screamer_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_shared_pieces(sex))
            entries.extend(_build_screamer_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_screamers_kit()
    peoples_entry = build_screamers_peoples_entry()
    manifest_path = CULTURES_DIR / 'screamers_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'screamers',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Screamer pieces ({n_m} male, {n_f} female) across 8 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
