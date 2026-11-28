"""The Ring Sea Islanders Wardrobe Kit (`islanders` — Complete 18-Tier M+F Regional Wardrobe).

Grounded in `LORE.md` (§§2, 5, 6.2, 6.12, 9), `PROPOSAL-RING-ISLES.md` (`P1–P8`), `kits/islanders/`,
and `settlements/{isle-demo,noahs-regret}/`. Replaces the broken 1-tier male-only stub with 18 M+F
paired regional tiers (`108` `mpfb_male` `isl_m_*` + `108` `mpfb_female` `isl_f_*` = `216` pieces)
across all five Ring Sea Austronesian-Polynesian sub-traditions:

  East Polynesian-Sumba `Kautoa` (`kautoa`):
    1. `kau_fisher_diver`    (`0.12`) — Pearl Diver & Oruwa Paddler (pandanus sun-brim, tapa wrap, reef maro, creel)
    2. `kau_salt_weaver`     (`0.08`) — NW Glasswort Soda-Burner & Indigo Hinggi Weaver
    3. `kau_valapo_smith`    (`0.06`) — Valapo Charcoal-Bloomery Ironwright & Drua Builder
    4. `kau_shell_factor`    (`0.08`) — Royal Shell-Mint Assessor & 20-Shell Talent Bandolier Broker
    5. `kau_tebutebu_guard`  (`0.08`) — Royal Kautoan Coconut-Coir Tebutebu Cuirassier & Koa Warrior (MC-05)
    6. `shaman`              (`0.04`) — Upgraded Kiln-Mask Bell-Shaman (100% M+F parity + full 6 slots incl. sandals & chimes)
    7. `kau_marapu_noble`    (`0.05`) — Uma Megalithic Patrician & Mamuli Gold-Tiara Ariki Noble
   17. `isl_hero_ariki`      (`0.00`) — Ariki Nui of the Twin Drua / King of Kautoa (`important_npc`)

  West Austronesian `Sikau / Hikau` (`west_isles`):
    8. `west_rumah_planter`  (`0.09`) — Hikau Horned-Roof Tengkuluk Clove Planter & Stilt Weaver
    9. `west_master_carver`  (`0.06`) — Kautono Proa Mariner, Outrigger Wright & Wave Stick-Chart Navigator
   10. `west_korakora_marine`(`0.07`) — Kora-Kora Galley Marine & Rattan-Tortoiseshell Pencak Bladesman
   11. `west_moon_oracle`    (`0.04`) — Marae White-Moon Tapa Medium & Cowrie Spirit-Caller

  Exiled Kingdom of `Hetānini` (`hetanini`):
   12. `het_exile_envoy`     (`0.04`) — Exiled Hetānini Datu Chief & Ys Abalone-Crown Courtier
   13. `het_shore_guerrilla` (`0.04`) — SW Throne Hetānini Shore Guerrilla & Covert Ranj Runner

  Salvage Boatwrights of `Hook` (`hukoa_hook`):
   14. `huk_salvage_wright`  (`0.06`) — Hukoa Freighter-Stack Boatwright & Tin-Tarp Rigger

  `Noah's Regret` `Lanong` Freebooters (`lanong_pirate`):
   15. `lan_sweep_raider`    (`0.06`) — Lanong Sweep-Corsair (Ark-hull pauldron & Ranjrum gourd bandolier)
   16. `lan_hooked_captain`  (`0.03`) — Hooked-Sun Freebooter Quartermaster
   18. `lan_hero_admiral`    (`0.00`) — Hooked-Sun Catamaran Admiral (`important_npc`)

Run standalone in manifest-only mode (does NOT edit shared kit.json or peoples.json):
    py -3 -u tools/garments/cultures/islanders.py
"""
from contextlib import contextmanager
import json
import math
import os
os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')
import struct
import sys
import time
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import connected_components

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
REPO_ROOT = ROOT.parent.parent
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

import glbio
from garments import core
from garments import paint as paint_mod
from garments.core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, ring_points, smooth_push, assemble_garment,
)
from garments.paint import P, B, PN, C, leathery
from garments.types.torso import (
    torso_tube, collar, collar_disc, cape, tabard, crossed_sash, pauldron,
)
from garments.types.limbs import limb_tube, sleeve, sleeves, armbands, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_landmarks_exact, brim, crown_band, crest, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, tube, strap, tassel, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

# ===========================================================================================================
# 1. CANONICAL RING SEA ISLANDERS PALETTE (`isl_*` linear RGB) & ON-DISK TEXTURE + PROCEDURAL MOTIFS
# ===========================================================================================================
ISL_COLORS = {
    'isl_moon_ivory':   (0.890, 0.860, 0.790),  # White Island Moon mother-of-pearl nacre (#f2efe6)
    'isl_tapa_sand':    (0.690, 0.550, 0.340),  # Beaten paper-mulberry tapa barkcloth (#d8c39e)
    'isl_tapa_chalk':   (0.875, 0.855, 0.805),  # Bleached marae oracle tapa (#e8e4dc)
    'isl_reef_teal':    (0.014, 0.190, 0.210),  # P4 pelagic sea-slug & lagoon reef dye (#1f7a7e)
    'isl_hinggi_indigo':(0.012, 0.027, 0.068),  # Deep Kautoan Sumba warp-ikat indigo (#1d2e4a)
    'isl_mangrove_red': (0.270, 0.028, 0.019),  # P4 mangrove-bark tannin rust-crimson (#8e2f26)
    'isl_annatto':      (0.580, 0.089, 0.021),  # Annatto & red tropicbird plumage (#c95428)
    'isl_turmeric':     (0.690, 0.340, 0.023),  # Turmeric & saffron pandan dye (#d89e2a)
    'isl_tar_black':    (0.015, 0.016, 0.019),  # I-02 caulking pitch & charred ironwood (#1b1d20)
    'isl_coir_tan':     (0.330, 0.170, 0.065),  # Knotted coconut-coir tebutebu fiber (#9c7448)
    'isl_rattan_gold':  (0.490, 0.295, 0.095),  # Split Hikau rattan & pandanus leaf (#b88c52)
    'isl_tortoise':     (0.082, 0.032, 0.014),  # Polished dark hawksbill tortoiseshell (#4a2c18)
    'isl_hukoa_tarp':   (0.021, 0.098, 0.240),  # Hook salvage blue poly-tarp (#285886)
    'isl_shagreen':     (0.145, 0.158, 0.165),  # Cured grey tiger-shark & stingray skin
    'isl_bipo_bronze':  (0.520, 0.335, 0.135),  # Bipo island cast tin-bronze
    'isl_mamuli_gold':  (0.840, 0.620, 0.185),  # Beaten Kautoan mamuli gold
    'isl_ark_white':    (0.845, 0.865, 0.880),  # Salvaged Noah's Regret Ancient catamaran hull-plate
    'isl_bay_purple':   (0.165, 0.048, 0.195),  # Exiled Hetanini murex/sea-snail court violet
    'isl_kiln_clay':    (0.465, 0.195, 0.105),  # Fired terracotta beehive kiln-mask clay
}

_PAT_DIR = REPO_ROOT / 'core' / 'materials' / 'patterns'
_LIB_DIR = REPO_ROOT / 'core' / 'materials' / 'library'
_ISL_TEX_PATHS = {
    'hinggi':         _PAT_DIR / 'islander' / 'hinggi' / 'albedo.jpg',
    'kautoa_ikat':    _PAT_DIR / 'islander' / 'kautoa-hinggi-ikat' / 'albedo.jpg',
    'tapa':           _PAT_DIR / 'islander' / 'tapa' / 'albedo.jpg',
    'hukoa_tapa':     _PAT_DIR / 'islander' / 'hukoa-tapa-bark' / 'albedo.jpg',
    'kowhaiwhai':     _PAT_DIR / 'islander' / 'kowhaiwhai' / 'albedo.jpg',
    'mat_diamond':    _PAT_DIR / 'islander' / 'mat-diamond' / 'albedo.jpg',
    'medallion_moon': _PAT_DIR / 'islander' / 'medallion-moon' / 'albedo.jpg',
    'storyboard':     _PAT_DIR / 'islander' / 'storyboard' / 'albedo.jpg',
    'weave':          _PAT_DIR / 'islander' / 'weave' / 'albedo.jpg',
    'lanong_prize':   _PAT_DIR / 'maritime' / 'lanong-patched-prize' / 'albedo.jpg',
    'ruephus_jack':   _PAT_DIR / 'maritime' / 'ruephus-blood-jack' / 'albedo.jpg',
    'smuggler_tapa':  _PAT_DIR / 'maritime' / 'smuggler-cove-tapa' / 'albedo.jpg',
    'hooked_sun':     _PAT_DIR / 'pirates' / 'hooked-sun-jack' / 'albedo.jpg',
    'tin_patchwork':  _LIB_DIR / 'metal.tin.patchwork' / 'albedo.jpg',
    'ys_nacre':       REPO_ROOT / 'settlements' / 'ys' / 'tex' / 'hkNacreC.albedo.webp',
}
_ISL_TEX_CACHE = {}

ISL_CUSTOM_MOTIFS = {
    'isl_hinggi_ikat',
    'isl_island_moon',
    'isl_coir_tebutebu',
    'isl_tapa_kowhaiwhai',
    'isl_mat_diamond',
    'isl_rattan_tortoise',
    'isl_storyboard',
    'isl_shell_talent',
    'isl_hooked_sun',
    'isl_hukoa_salvage',
    'isl_defaced_moon',
    'isl_feather_cloak',
}


def _load_isl_tex(key, W, H, fg, bg, blend=0.32):
    if key not in _ISL_TEX_CACHE:
        arr = None
        p = _ISL_TEX_PATHS.get(key)
        if p is not None:
            rp = paint_mod._resolve_lfs(p)
            if rp.exists() and rp.stat().st_size > 500:
                try:
                    px = np.asarray(Image.open(rp).convert('RGB'), dtype=np.float32) / 255.0
                    arr = np.power(np.clip(px, 0.0, 1.0), 2.2)
                except Exception:
                    arr = None
        _ISL_TEX_CACHE[key] = arr
    src = _ISL_TEX_CACHE[key]
    if src is None:
        out = np.empty((H, W, 3), dtype=np.float64)
        out[:] = bg
        return out
    sh, sw = src.shape[:2]
    yy = (np.linspace(0.0, 1.0, H, endpoint=False) * sh).astype(int) % sh
    xx = (np.linspace(0.0, 1.0, W, endpoint=False) * sw).astype(int) % sw
    samp = src[np.ix_(yy, xx)].astype(np.float64)
    lum = 0.299 * samp[..., 0] + 0.587 * samp[..., 1] + 0.114 * samp[..., 2]
    p10, p90 = float(np.percentile(lum, 10)), float(np.percentile(lum, 90))
    t = np.clip((lum - p10) / max(p90 - p10, 0.06), 0.0, 1.0)[..., None]
    pal = np.asarray(bg)[None, None, :] * (1.0 - t) + np.asarray(fg)[None, None, :] * t
    return np.clip((1.0 - blend) * samp + blend * pal, 0.0, 1.0)


def _isl_custom_motif(style, w, h, fg, bg, aspect=1.0):
    base = style.split(':')[0]
    H, W = max(int(h), 1), max(int(w), 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H
    fg_a = np.asarray(fg, dtype=np.float64)
    bg_a = np.asarray(bg, dtype=np.float64)

    if base == 'isl_hinggi_ikat':
        # Sumba-Polynesian warp-ikat register w/ feathered warp-bleed jitter, mamuli diamonds & rooster bands
        bleed = 0.022 * np.sin(xx * 1.9 + 0.7)
        vb = np.clip(v + bleed, 0.0, 1.0)
        nx = max(3.0, round(6.0 * max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((vb * 3.0) % 1.0 - 0.5) * 2.0
        band_rust = ((vb > 0.16) & (vb < 0.30)) | ((vb > 0.70) & (vb < 0.84))
        diam = (np.abs(gu) + np.abs(gv)) < 0.62
        inner = (np.abs(gu) + np.abs(gv)) < 0.30
        guard = (np.abs(vb - 0.16) < 0.022) | (np.abs(vb - 0.30) < 0.022) | (np.abs(vb - 0.70) < 0.022) | (np.abs(vb - 0.84) < 0.022)
        img[band_rust] = C['isl_mangrove_red']
        img[diam] = fg_a
        img[inner] = C['isl_turmeric']
        img[guard] = C['isl_moon_ivory']
        tex = _load_isl_tex('kautoa_ikat', W, H, fg_a, bg_a, blend=0.28)
        img = 0.45 * img + 0.55 * tex

    elif base == 'isl_island_moon':
        # Canonical Ring Sea Islander White Moon disc + lower wave reflection + 12 shark-tooth rays
        nx = max(1.0, round(max(aspect, 0.65)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        r = np.hypot(gu, gv)
        ang = np.arctan2(gv, gu)
        tooth = (r >= 0.54) & (r <= 0.78) & (np.cos(12.0 * ang) > 0.25 + 1.4 * (r - 0.54))
        moon = r <= 0.48
        wave_cut = (gv > 0.12 + 0.10 * np.sin(gu * 6.0)) & (r <= 0.42)
        crescent_ref = (gv > 0.22 + 0.10 * np.sin(gu * 6.0)) & (r <= 0.38)
        img[tooth] = fg_a
        img[moon] = C['isl_moon_ivory']
        img[wave_cut] = C['isl_reef_teal']
        img[crescent_ref] = fg_a
        tex = _load_isl_tex('medallion_moon', W, H, fg_a, bg_a, blend=0.35)
        img = 0.62 * img + 0.38 * tex

    elif base == 'isl_coir_tebutebu':
        # High-relief Kiribati knotted coconut-coir armor basketry w/ tar-cord shark-tooth chevrons
        nx = max(8.0, round(16.0 * max(aspect, 0.5)))
        ny = max(6.0, round(12.0 / max(aspect, 0.5)))
        twine = 0.80 + 0.20 * np.sin(u * 2.0 * math.pi * nx + np.pi * (np.floor(v * ny) % 2))
        ridge = 0.86 + 0.14 * np.cos(v * 2.0 * math.pi * ny)
        img[:] = bg_a[None, None, :] * (twine * ridge)[:, :, None]
        zig = np.abs(((v * 3.0) % 1.0 - 0.5) * 2.0 - 0.55 * np.abs(((u * 6.0) % 1.0 - 0.5) * 2.0)) < 0.14
        img[zig] = fg_a
        tex = _load_isl_tex('weave', W, H, fg_a, bg_a, blend=0.35)
        img = 0.60 * img + 0.40 * tex

    elif base == 'isl_tapa_kowhaiwhai':
        # Beaten barkcloth tapa printed w/ kowhaiwhai interlocking wave-scrolls
        nx = max(3.0, round(6.0 * max(aspect, 0.5)))
        gu = u * nx * 2.0 * math.pi
        gv = (v - 0.5) * 2.0
        scroll = np.abs(gv - 0.48 * np.sin(gu)) < 0.18
        bulb = np.hypot(((u * nx) % 1.0 - 0.25) * 2.2, gv - 0.48) < 0.24
        rim = (np.abs(gv) > 0.82)
        img[:] = _load_isl_tex('tapa', W, H, fg_a, bg_a, blend=0.45)
        img[scroll | bulb] = fg_a
        img[rim] = C['isl_tar_black']
        kw = _load_isl_tex('kowhaiwhai', W, H, fg_a, bg_a, blend=0.30)
        img = 0.55 * img + 0.45 * kw

    elif base == 'isl_mat_diamond':
        tex = _load_isl_tex('mat_diamond', W, H, fg_a, bg_a, blend=0.28)
        nx = max(5.0, round(10.0 * max(aspect, 0.5)))
        ny = max(5.0, round(10.0 / max(aspect, 0.5)))
        d = np.abs(((u * nx) % 1.0 - 0.5) * 2.0) + np.abs(((v * ny) % 1.0 - 0.5) * 2.0)
        step = (d > 0.72) & (d < 0.96)
        img[:] = tex
        img[step] = 0.5 * img[step] + 0.5 * fg_a

    elif base == 'isl_rattan_tortoise':
        # Austronesian kora-kora laminar slats: dark amber tortoiseshell alternating w/ golden rattan & red abaca lacing
        ny = max(5.0, round(9.0 / max(aspect, 0.5)))
        nx = max(6.0, round(14.0 * max(aspect, 0.5)))
        row_f = (v * ny) % 1.0
        col_i = np.floor(u * nx).astype(int)
        col_f = (u * nx) % 1.0
        is_rattan = (col_i % 3) == 0
        plate_c = np.where(is_rattan[..., None], np.asarray(C['isl_rattan_gold']), bg_a)
        gap = (col_f < 0.09) | (row_f < 0.12)
        lace = ((row_f > 0.12) & (row_f < 0.26)) & ((col_f > 0.35) & (col_f < 0.65))
        img[:] = plate_c * (0.84 + 0.22 * (1.0 - row_f))[:, :, None]
        img[gap] = C['isl_tar_black']
        img[lace] = C['isl_mangrove_red']

    elif base == 'isl_storyboard':
        img[:] = _load_isl_tex('storyboard', W, H, fg_a, bg_a, blend=0.26)
        border = (v < 0.09) | (v > 0.91)
        img[border] = fg_a

    elif base == 'isl_shell_talent':
        # Royal Shell-Mint Talent coin strings & curved boar-tusk crescents over indigo ikat
        nx = max(4.0, round(9.0 * max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        cord = np.abs(gv) < 0.14
        coin = np.hypot(gu, gv) < 0.48
        hole = np.hypot(gu, gv) < 0.13
        img[:] = bg_a
        img[cord] = C['isl_coir_tan']
        img[coin] = C['isl_moon_ivory']
        img[hole] = C['isl_tar_black']

    elif base == 'isl_hooked_sun':
        # Noah's Regret Lanong emblem: gold Izani sun pierced by barbed Islander fish-hook + white moon
        tex = _load_isl_tex('hooked_sun', W, H, fg_a, bg_a, blend=0.25)
        nx = max(1.0, round(max(aspect, 0.7)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        r = np.hypot(gu, gv)
        sun = r < 0.42
        hook_shank = (np.abs(gu + 0.08) < 0.07) & (gv > -0.62) & (gv < 0.35)
        hook_curve = (np.hypot(gu - 0.10, gv - 0.30) > 0.12) & (np.hypot(gu - 0.10, gv - 0.30) < 0.25) & (gv >= 0.24)
        img[:] = tex
        img[sun] = C['isl_mamuli_gold']
        img[hook_shank | hook_curve] = C['isl_moon_ivory']

    elif base == 'isl_hukoa_salvage':
        tex = _load_isl_tex('tin_patchwork', W, H, fg_a, bg_a, blend=0.35)
        rib = 0.84 + 0.18 * np.sin(u * 2.0 * math.pi * 14.0)
        img[:] = tex * rib[:, :, None]
        moon = np.hypot((u - 0.5) * 2.2, (v - 0.5) * 2.2) < 0.44
        cut = np.hypot((u - 0.38) * 2.2, (v - 0.44) * 2.2) < 0.36
        img[moon & (~cut)] = C['isl_moon_ivory']

    elif base == 'isl_defaced_moon':
        # Captured Vothic bronze plate overpainted in chalk-white Island Moon
        lame = 0.85 + 0.15 * np.cos(v * 2.0 * math.pi * 6.0)
        img[:] = bg_a[None, None, :] * lame[:, :, None]
        r = np.hypot((u - 0.5) * 2.1, (v - 0.5) * 2.1)
        slash = np.abs((u - 0.5) - (v - 0.5)) < 0.075
        moon_ring = (r > 0.32) & (r < 0.54)
        img[slash] = C['isl_mangrove_red']
        img[moon_ring] = C['isl_moon_ivory']

    elif base == 'isl_feather_cloak':
        # Royal Kautoan 'ahu 'ula tropicbird & honeycreeper red/gold scalloped plumage
        nx = max(6.0, round(14.0 * max(aspect, 0.5)))
        ny = max(6.0, round(12.0 / max(aspect, 0.5)))
        row_i = np.floor(v * ny).astype(int)
        gu = ((u * nx + 0.5 * (row_i % 2)) % 1.0 - 0.5) * 2.0
        gv = (v * ny) % 1.0
        feather = np.hypot(gu * 0.9, (gv - 0.3) * 1.2)
        gold_cres = np.abs(v - (0.35 + 0.18 * np.cos((u - 0.5) * 2.0 * math.pi * 2.0))) < 0.11
        img[:] = np.where(gold_cres[..., None], fg_a, bg_a) * (0.82 + 0.22 * (1.0 - feather))[:, :, None]

    return np.clip(img, 0.0, 1.0)


@contextmanager
def islanders_motif_scope():
    orig_motif = paint_mod.motif
    added = []
    for k, val in ISL_COLORS.items():
        if k not in C:
            C[k] = val
            added.append(k)

    def _wrapped(style, w, h, fg, bg, aspect=1.0):
        base = style.split(':')[0] if isinstance(style, str) else ''
        if base in ISL_CUSTOM_MOTIFS:
            return _isl_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped
    try:
        yield
    finally:
        paint_mod.motif = orig_motif
        for k in added:
            C.pop(k, None)


def _isl_assemble(gid, label, slot, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False):
    return assemble_garment(
        gid, label, slot, 'islanders', parts,
        covers_hair=covers_hair, covers_face=covers_face,
        open_torso=open_torso, legged=legged,
    )


# ===========================================================================================================
# 2. SHARED AUSTRONESIAN-POLYNESIAN GEOMETRY PRIMITIVES (ZERO FLOATING ISLANDS, M+F SAFE)
# ===========================================================================================================
def _snap_to_part(host_part, target_pt, push=0.002):
    """Snap an ornament anchor to the exact nearest vertex on `host_part.P` (+2mm outward) for <=4mm contact."""
    P_flat = host_part.P.reshape(-1, 3)
    tgt = np.asarray(target_pt, dtype=np.float64)
    idx = int(np.argmin(np.linalg.norm(P_flat - tgt[None, :], axis=1)))
    p = P_flat[idx].copy()
    c_ref = spine_at(min(max(float(p[2]), core.CROTCH), core.TOP)) if p[2] < core.NECK[2] + 0.02 else core.HEAD
    nrm = np.array([p[0] - c_ref[0], p[1] - c_ref[1], 0.0], dtype=np.float64)
    L_n = float(np.linalg.norm(nrm))
    nrm = (nrm / L_n) if L_n > 1e-5 else FRONT.copy()
    return p + nrm * float(push), nrm


def _open_brow_cap(name, paint, f_brow=0.62, f_nape=0.14, f_top=1.14, ease=0.018, peak=0.0, rows=12, n=36):
    """360-degree closed skullcap/helmet bowl (`closed=True`) whose front rim stays strictly >= `f_brow` (>=0.60)
    above the eyebrows and crown clears the skull (`f_top >= 1.13, ease >= 0.018`, zero double-taper)."""
    a, b, up, bk, left = head_frame()
    f_top_eff = max(float(f_top), 1.13)
    ease_eff = max(float(ease), 0.018)
    angles = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angles]
    f_rim = np.full(n, float(f_nape), dtype=np.float64)
    half_span = 0.58 * math.pi
    for j, an in enumerate(angles):
        ang_f = abs(an - math.pi)
        if ang_f < half_span:
            w = 0.5 + 0.5 * math.cos(math.pi * ang_f / half_span)
            f_rim[j] = float(f_nape) + (float(f_brow) - float(f_nape)) * (w ** 0.78)
    # Sample equator radii ONCE at f=0.56 to avoid double-taper skull poke-through (Tips §7.2)
    c_eq = a + (b - a) * 0.56
    r_eq = np.array([(float(first_hit(c_eq, d) or 0.096) + ease_eff) for d in ds], dtype=np.float64)
    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for i in range(rows):
        u = i / float(max(rows - 1, 1))
        for j, d in enumerate(ds):
            f_ij = float(f_rim[j]) + (f_top_eff - float(f_rim[j])) * u
            if u > 0.55:
                ut = (u - 0.55) / 0.45
                r_prof = float(r_eq[j]) * math.sqrt(max(0.0, 1.0 - ut ** 2.1))
            else:
                r_prof = float(r_eq[j])
            if f_ij <= 0.96:
                c_ray = a + (b - a) * max(f_ij, 0.20)
                h_hit = first_hit(c_ray, d)
                if h_hit is not None:
                    r_prof = max(r_prof, float(h_hit) + ease_eff)
            c_ij = a + (b - a) * f_ij + up * (float(peak) * (u ** 1.4))
            Q[i, j] = c_ij + d * max(r_prof, 0.004)
    apex = a + (b - a) * f_top_eff + up * (float(peak) + 0.008)
    if float(np.dot(apex - b, up)) < 0.028:
        apex = b + up * 0.028
    Q[-1] = apex + (Q[-1] - apex) * 0.05
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _gonjong_horns(gid, host_cap, paint, spread=0.145, lift=0.095, thick=0.022):
    """Sweeping upturned Minangkabau/Toraja *gonjong* saddle-horns welded directly into `host_cap`."""
    a, b, up, bk, left = head_frame()
    c_mid = a + (b - a) * 0.78
    out = []
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_root, _ = _snap_to_part(host_cap, c_mid + left * (sd * 0.075) - bk * 0.015, push=-0.003)
        p_mid = p_root + left * (sd * spread * 0.55) + up * (lift * 0.38) - bk * 0.012
        p_tip = p_root + left * (sd * spread) + up * lift - bk * 0.004
        out.append(horn(f'{gid}_gonjong_{tag}', [p_root, p_mid, p_tip], thick, 0.006, paint, n=10, rows=7, rigid_joint='Head'))
    return out


def _kapkap_pectoral(gid, host_torso, z_center, radius=0.068, tusk=True):
    """Mother-of-pearl & pierced tortoiseshell White Island Moon *kapkap* gorget + curved boar-tusk crescents."""
    tgt = chest_front(z_center, 0.018)
    p_anc, nrm = _snap_to_part(host_torso, tgt, push=0.004)
    side = np.array([1.0, 0.0, 0.0], dtype=np.float64)
    p_nacre = P('isl_moon_ivory', 0.03, fabric='shell.nacre')
    p_tort = P('isl_tortoise', 0.04, [B('bottom', 0.0, 0.18, 'isl_island_moon', 'isl_moon_ivory', 'isl_tortoise', 0.05)], fabric='shell.nacre')
    out = [
        rosette(f'{gid}_kapkap_nacre', p_anc, nrm, side, radius, p_nacre, n=18, thick=0.008),
        rosette(f'{gid}_kapkap_fret', p_anc + nrm * 0.005, nrm, side, radius * 0.68, p_tort, n=16, thick=0.007),
    ]
    if tusk:
        for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
            t0 = p_anc + np.array([sd * radius * 0.35, 0.0, -radius * 0.55])
            t1 = p_anc + np.array([sd * (radius + 0.022), -0.006, -radius * 0.25])
            t2 = p_anc + np.array([sd * (radius + 0.034), -0.010, radius * 0.22])
            out.append(horn(f'{gid}_tusk_{tag}', [t0, t1, t2], 0.010, 0.003, P('isl_moon_ivory', 0.03), n=8, rows=6))
    return out


def _lavalava_kilt(gid, paint_main, z_bot, flare=0.075, front_sash_paint=None):
    """Cloth-simulated Polynesian/Austronesian *maro* / *lava-lava* / *sarong* starting strictly at `WAIST - 0.045`
    below any rigid torso waist-sash so suprapubic clipping never occurs during stride."""
    z_top = core.WAIST - 0.045
    kilt = torso_tube(
        f'{gid}_wrap', z_top, z_bot, 0.024, paint_main,
        n=42, rows=16, hang_from=z_top, flare=flare,
        group_below=core.CROTCH + 0.02, hull_from=z_top,
    )
    parts = [kilt]
    if front_sash_paint is not None:
        parts.append(tabard(f'{gid}_apron', z_bot + 0.03, z_top - 0.005, front_sash_paint, width=0.17, ease=0.033, front=True, back=False))
    return parts


def _dorsal_pad(gid, z_center=None, size=(0.17, 0.055, 0.20), paint=None):
    """Flush `Spine2`-weighted dorsal mounting pad (avoids `pack_straps()` hover over bare/sleeveless shoulders)."""
    zc = z_center if z_center is not None else (core.CHEST + 0.01)
    p_pad = surface_out(spine_at(zc), BACK_DIR, 0.014, bvh=core.BVH_T)
    pad = blob(f'{gid}_dorsal_pad', p_pad, size, paint or P('isl_coir_tan', 0.10, fabric='straw.plaited'),
               n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, p_pad


def _greave_sandals(gid, sole_p, strap_p, greave_p, top_frac=0.68):
    """Open sandals (`hides <= 40`) paired with snug bare-calf woven coir/bamboo shin-greaves."""
    pts = list(sandal(gid, sole_p, strap_p, guard=True))
    for s in (L, R):
        foot_j, knee_j = J(s + 'Foot'), J(s + 'Leg')
        p0 = foot_j + (knee_j - foot_j) * 0.16
        p1 = foot_j + (knee_j - foot_j) * top_frac
        pts.append(limb_tube(f'{gid}_greave_{s[0]}', p0, p1, 0.008, greave_p,
                             n=18, rows=8, ease_end=0.009, rmax=0.12, role='band', side=s[0]))
    return pts


def _wrist_wraps(gid, paint_main, f0=0.45, f1=0.94, ease=0.009, boss_paint=None):
    pts = []
    for s in (L, R):
        cuff = sleeve(f'{gid}_wrap_{s[0]}', s, paint_main, f0=f0, f1=f1, ease=ease, flare=0.004, rows=7, n=18)
        pts.append(cuff)
        if boss_paint is not None:
            e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
            mid = e_j + (h_j - e_j) * 0.72 + np.array([0.0, 0.0, 0.032])
            p_b, n_b = _snap_to_part(cuff, mid, push=0.003)
            b_pt = blob(f'{gid}_boss_{s[0]}', p_b, (0.026, 0.014, 0.028), boss_paint, n=10, rows=5, out=n_b, rigid_joint=s + 'ForeArm')
            b_pt.is_arm = True
            pts.append(b_pt)
    return pts


# ===========================================================================================================
# 3. ALL 18 RING SEA ISLANDER TIER BUILDERS (`mpfb_male` & `mpfb_female` PARITY)
# ===========================================================================================================
def _build_all_tiers_for_sex(sex):
    entries = []
    is_f = (sex == 'f')

    # Common paints
    p_coir = P('isl_coir_tan', 0.10, [
        B('bottom', 0.0, 0.05, 'isl_coir_tebutebu', 'isl_tar_black', 'isl_coir_tan', 0.06),
    ], fabric='straw.plaited')
    p_pandan = P('isl_rattan_gold', 0.09, [
        B('bottom', 0.0, 0.04, 'isl_mat_diamond', 'isl_tar_black', 'isl_rattan_gold', 0.05),
    ], fabric='straw.reed.plaited')
    p_tapa_sand = P('isl_tapa_sand', 0.08, [
        B('bottom', 0.0, 0.08, 'isl_tapa_kowhaiwhai', 'isl_tar_black', 'isl_tapa_sand', 0.10),
    ], fabric='cloth.bark.tapa')
    p_hinggi_royal = P('isl_hinggi_indigo', 0.07, [
        B('bottom', 0.0, 0.14, 'isl_hinggi_ikat', 'isl_turmeric', 'isl_hinggi_indigo', 0.14),
        B('top', 0.0, 0.05, 'isl_shell_talent', 'isl_moon_ivory', 'isl_mangrove_red', 0.06),
    ], [
        PN(0.0, 1.0, 'isl_hinggi_ikat', 'isl_annatto', 'isl_hinggi_indigo', 0.24),
    ], fabric='cloth.cotton.coarse')
    p_nacre = P('isl_moon_ivory', 0.02, fabric='shell.nacre')
    p_gold = P('isl_mamuli_gold', 0.02, fabric='metal.gold')
    p_bronze = P('isl_bipo_bronze', 0.04, fabric='metal.bronze')
    p_shark = P('isl_shagreen', 0.06, fabric='leather.shagreen.rayskin')

    # -------------------------------------------------------------------------------------------------------
    # I-1: `kau_fisher_diver` — Pearl Diver & Oruwa Paddler (Wai-Kautoa)
    # -------------------------------------------------------------------------------------------------------
    h1_cap = _open_brow_cap(f'isl_{sex}_diver_brim_crown', p_pandan, f_brow=0.63, f_nape=0.36, f_top=1.14, ease=0.018)
    h1_brim = brim(f'isl_{sex}_diver_brim_rim', 0.64, 0.115, p_pandan, ease=0.010, rows=5, n=40, droop=0.022)
    a, b, up, bk, left = head_frame()
    p_tog, n_tog = _snap_to_part(h1_cap, a + (b - a) * 0.70 - bk * 0.12, push=0.003)
    h1_moon = rosette(f'isl_{sex}_diver_moon', p_tog, -bk, left, 0.020, p_nacre, n=12, thick=0.007, rigid_joint='Head')
    entries.append(_isl_assemble(f'isl_{sex}_diver_brim', 'Wai-Kautoa Pandanus Sun-Brim', 'head',
                                 [h1_cap, h1_brim, h1_moon], covers_hair=True, covers_face=False))

    p_diver_teal = P('isl_reef_teal', 0.07, [
        B('bottom', 0.0, 0.06, 'isl_island_moon', 'isl_moon_ivory', 'isl_reef_teal', 0.08),
    ], fabric='cloth.bark.tapa')
    t1_parts = [
        crossed_sash(f'isl_{sex}_diver_sash', p_tapa_sand, width=0.075, ease=0.016),
        belt_sash(f'isl_{sex}_diver_belt', core.WAIST - 0.012, core.WAIST + 0.028, p_pandan, ease=0.016),
    ]
    if is_f:
        bandeau = torso_tube(f'isl_{sex}_diver_bandeau', core.CHEST + 0.055, core.CHEST - 0.065, 0.014, p_diver_teal, n=38, rows=7)
        t1_parts.insert(0, bandeau)
        t1_parts.extend(_kapkap_pectoral(f'isl_{sex}_diver', bandeau, core.CHEST + 0.02, radius=0.042, tusk=False))
        entries.append(_isl_assemble(f'isl_{sex}_diver_wrap', 'Reef-Teal Tapa Bandeau & Pearl Sash', 'torso', t1_parts, open_torso=True))
    else:
        t1_parts.extend(_kapkap_pectoral(f'isl_{sex}_diver', t1_parts[0], core.CHEST + 0.01, radius=0.046, tusk=False))
        entries.append(_isl_assemble(f'isl_{sex}_diver_wrap', 'Pearl-Diver Diagonal Tapa Sash & Moon Amulet', 'torso', t1_parts, open_torso=True))

    entries.append(_isl_assemble(f'isl_{sex}_diver_cords', 'Braided Pandanus & Cowrie Wrist-Cords', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_diver_cords', p_pandan, f0=0.62, f1=0.92, boss_paint=p_nacre)))
    entries.append(_isl_assemble(f'isl_{sex}_diver_maro', 'Reef-Teal Island-Moon Maro Kilt', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_diver_maro', p_diver_teal, core.KNEE + 0.05, flare=0.065, front_sash_paint=p_tapa_sand)))
    entries.append(_isl_assemble(f'isl_{sex}_diver_sandals', 'Braided Rush Reef-Sandals', 'feet',
                                 sandal(f'isl_{sex}_diver_sandals', p_coir, p_pandan, guard=False)))
    pad1, p_pad1 = _dorsal_pad(f'isl_{sex}_diver_creel', core.CHEST, (0.16, 0.05, 0.19), p_pandan)
    creel1 = blob(f'isl_{sex}_diver_basket', p_pad1 + BACK_DIR * 0.065, (0.21, 0.14, 0.26), p_coir, n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    stone1 = blob(f'isl_{sex}_diver_stone', p_pad1 + BACK_DIR * 0.085 + np.array([0.0, 0.0, -0.11]), (0.09, 0.07, 0.09), P('basalt', 0.08), n=10, rows=5, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_diver_creel', 'Woven Pearl-Net & Diving-Stone Creel', 'back', [pad1, creel1, stone1]))

    # -------------------------------------------------------------------------------------------------------
    # I-2: `kau_salt_weaver` — NW Glasswort Soda-Burner & Indigo Hinggi Weaver
    # -------------------------------------------------------------------------------------------------------
    p_indigo_turm = P('isl_hinggi_indigo', 0.07, [
        B('bottom', 0.0, 0.04, 'stripes', 'isl_turmeric', 'isl_hinggi_indigo', 0.04),
    ], fabric='cloth.cotton.coarse')
    h2_base = _open_brow_cap(f'isl_{sex}_weaver_hc_base', p_indigo_turm, f_brow=0.62, f_nape=0.22, f_top=1.14, ease=0.018)
    h2_roll = crown_band(f'isl_{sex}_weaver_hc_roll', P('isl_turmeric', 0.07), f0=0.63, f1=0.77, ease=0.017, flare=0.008, rows=5, n=36)
    entries.append(_isl_assemble(f'isl_{sex}_weaver_headcloth', 'Twisted Indigo & Turmeric Sumba Head-Wrap', 'head',
                                 [h2_base, h2_roll], covers_hair=True, covers_face=False))

    t2_tun = torso_tube(f'isl_{sex}_weaver_tun', core.TOP - 0.01, core.WAIST - 0.030, 0.020, p_tapa_sand, n=40, rows=14)
    t2_stole = crossed_sash(f'isl_{sex}_weaver_blanket', p_hinggi_royal, width=0.095, ease=0.024)
    t2_belt = belt_sash(f'isl_{sex}_weaver_sash', core.WAIST - 0.012, core.WAIST + 0.030, P('isl_turmeric', 0.06), ease=0.024)
    entries.append(_isl_assemble(f'isl_{sex}_weaver_tunic', 'Pandan Bast Tunic & Hinggi Ikat Shoulder-Blanket', 'torso', [t2_tun, t2_stole, t2_belt]))
    entries.append(_isl_assemble(f'isl_{sex}_weaver_wraps', 'Indigo-Stained Forearm Dye-Wraps', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_weaver_wraps', p_indigo_turm, f0=0.38, f1=0.95)))
    entries.append(_isl_assemble(f'isl_{sex}_weaver_lavalava', 'Ankle-Length Sumba Hinggi Ikat Sarong', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_weaver_lavalava', p_hinggi_royal, core.ANKLE + 0.07, flare=0.085)))
    entries.append(_isl_assemble(f'isl_{sex}_weaver_sandals', 'Plaited Pandanus Weaver Sandals', 'feet',
                                 sandal(f'isl_{sex}_weaver_sandals', p_coir, p_indigo_turm)))
    pad2, p_pad2 = _dorsal_pad(f'isl_{sex}_weaver_skeins', core.CHEST + 0.01, (0.17, 0.05, 0.20), p_pandan)
    rod2 = tube(f'isl_{sex}_weaver_rod', [p_pad2 + np.array([-0.15, 0.055, 0.09]), p_pad2 + np.array([0.15, 0.055, 0.09])], 0.014, p_pandan, n=8, rigid_joint='Spine2')
    sk_l = blob(f'isl_{sex}_weaver_skL', p_pad2 + np.array([-0.08, 0.065, -0.02]), (0.09, 0.08, 0.22), p_indigo_turm, n=10, rows=5, out=BACK_DIR, rigid_joint='Spine2')
    sk_r = blob(f'isl_{sex}_weaver_skR', p_pad2 + np.array([0.08, 0.065, -0.02]), (0.09, 0.08, 0.22), P('isl_mangrove_red', 0.07), n=10, rows=5, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_weaver_skeins', 'Bamboo Indigo Dye-Skein & Soda-Ash Basket', 'back', [pad2, rod2, sk_l, sk_r]))

    # -------------------------------------------------------------------------------------------------------
    # I-3: `kau_valapo_smith` — Valapo Charcoal-Bloomery Ironwright & Drua Builder
    # -------------------------------------------------------------------------------------------------------
    h3_band = crown_band(f'isl_{sex}_smith_hb', p_tapa_sand, f0=0.61, f1=0.72, ease=0.004, flare=0.002, rows=5, n=36)
    p_pin, _ = _snap_to_part(h3_band, a + (b - a) * 0.66 + left * 0.085, push=0.002)
    h3_pin = tube(f'isl_{sex}_smith_pin', [p_pin - up * 0.025, p_pin + up * 0.045], 0.005, P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Head')
    entries.append(_isl_assemble(f'isl_{sex}_smith_band', 'Barkcloth Sweatband & Valapo Bar-Iron Pin', 'head',
                                 [h3_band, h3_pin], covers_hair=False, covers_face=False))

    p_forge = P('isl_shagreen', 0.07, [
        B('bottom', 0.0, 0.05, 'isl_coir_tebutebu', 'isl_bipo_bronze', 'isl_coir_tan', 0.05),
    ], fabric='leather.shagreen.rayskin')
    t3_bib = torso_tube(f'isl_{sex}_smith_bib', core.CHEST + (0.07 if is_f else 0.03), core.WAIST - 0.032, 0.018, p_forge, n=40, rows=10)
    t3_sash = crossed_sash(f'isl_{sex}_smith_straps', p_coir, width=0.055, ease=0.021)
    t3_parts = [t3_bib, t3_sash]
    for dx in (-0.055, 0.0, 0.055):
        pb, nb = _snap_to_part(t3_bib, chest_front(core.CHEST - 0.01, 0.018, x=dx), push=0.003)
        t3_parts.append(blob(f'isl_{sex}_smith_stud_{int((dx+0.1)*100)}', pb, (0.024, 0.014, 0.024), p_bronze, n=10, rows=5, out=nb))
    entries.append(_isl_assemble(f'isl_{sex}_smith_apron', 'Coir & Sharkskin Bloomery Forge Apron', 'torso', t3_parts, open_torso=not is_f))
    entries.append(_isl_assemble(f'isl_{sex}_smith_bracers', 'Knotted Coir & Rayskin Forge Bracers', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_smith_bracers', p_coir, f0=0.35, f1=0.95, ease=0.012, boss_paint=p_bronze)))
    entries.append(_isl_assemble(f'isl_{sex}_smith_kilt', 'Heavy Soot-Edged Tapa & Coir Work-Kilt', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_smith_kilt', p_coir, core.KNEE + 0.02, flare=0.068, front_sash_paint=p_forge)))
    entries.append(_isl_assemble(f'isl_{sex}_smith_boots', 'Laced Rawhide & Sharkskin Forge Boots', 'feet',
                                 boots(f'isl_{sex}_smith_boots', P('isl_tar_black', 0.08), p_shark, top=0.36, ease_top=0.015)))
    pad3, p_pad3 = _dorsal_pad(f'isl_{sex}_smith_adzepack', core.CHEST, (0.18, 0.055, 0.22), p_coir)
    pot3 = blob(f'isl_{sex}_smith_pitchpot', p_pad3 + BACK_DIR * 0.065, (0.17, 0.13, 0.20), P('isl_tar_black', 0.06), n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    tong3 = tube(f'isl_{sex}_smith_tongs', [p_pad3 + np.array([0.06, 0.075, -0.10]), p_pad3 + np.array([-0.04, 0.075, 0.22])], 0.012, P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_smith_adzepack', 'Charcoal-Tongs & Caulking-Pitch Frame', 'back', [pad3, pot3, tong3]))

    # -------------------------------------------------------------------------------------------------------
    # I-4: `kau_shell_factor` — Royal Shell-Mint Assessor & Izanitown Broker
    # -------------------------------------------------------------------------------------------------------
    h4_cap = _open_brow_cap(f'isl_{sex}_factor_tb', p_hinggi_royal, f_brow=0.62, f_nape=0.20, f_top=1.14, ease=0.018, peak=0.045)
    p_c4, _ = _snap_to_part(h4_cap, a + (b - a) * 0.74 - bk * 0.12, push=0.003)
    h4_pin = rosette(f'isl_{sex}_factor_coin', p_c4, -bk, left, 0.022, p_nacre, n=14, thick=0.007, rigid_joint='Head')
    entries.append(_isl_assemble(f'isl_{sex}_factor_turban', 'Peaked Sumba Ikat Turban & Talent-Coin Pin', 'head',
                                 [h4_cap, h4_pin], covers_hair=True, covers_face=False))

    p_talent_band = P('isl_hinggi_indigo', 0.05, [
        B('bottom', 0.0, 0.08, 'isl_shell_talent', 'isl_moon_ivory', 'isl_hinggi_indigo', 0.045),
    ], [PN(0.0, 1.0, 'isl_shell_talent', 'isl_moon_ivory', 'isl_mangrove_red', 0.06)], fabric='shell.nacre')
    t4_tun = torso_tube(f'isl_{sex}_factor_tun', core.TOP - 0.006, core.WAIST - 0.032, 0.021, P('isl_tapa_chalk', 0.06, fabric='cloth.bark.tapa'), n=40, rows=14)
    t4_slv = sleeves(f'isl_{sex}_factor_tun', 'elbow', 0.017, P('isl_tapa_chalk', 0.06, fabric='cloth.bark.tapa'))
    t4_bal = crossed_sash(f'isl_{sex}_factor_bandolier', p_talent_band, width=0.082, ease=0.025)
    t4_belt = belt_sash(f'isl_{sex}_factor_belt', core.WAIST - 0.012, core.WAIST + 0.030, P('isl_mangrove_red', 0.06), ease=0.025)
    t4_parts = [t4_tun] + t4_slv + [t4_bal, t4_belt]
    for z_c in np.linspace(core.CHEST + 0.05, core.WAIST + 0.04, 4):
        pc, nc = _snap_to_part(t4_bal, chest_front(z_c, 0.026, x=0.03 * ((z_c - core.WAIST) / 0.2)), push=0.003)
        t4_parts.append(rosette(f'isl_{sex}_factor_tal_{int(z_c*100)}', pc, nc, np.array([1.0, 0.0, 0.0]), 0.018, p_nacre, n=12, thick=0.006))
    entries.append(_isl_assemble(f'isl_{sex}_factor_mantle', 'Cream Tapa Tunic & 20-Shell Talent Bandolier', 'torso', t4_parts))
    entries.append(_isl_assemble(f'isl_{sex}_factor_cuffs', 'Carved Mother-of-Pearl Broker Cuffs', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_factor_cuffs', p_nacre, f0=0.58, f1=0.94, boss_paint=p_gold)))
    entries.append(_isl_assemble(f'isl_{sex}_factor_sarong', 'Reef-Teal & Indigo Shell-Mint Lava-Lava', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_factor_sarong', p_diver_teal, core.ANKLE + 0.08, flare=0.080, front_sash_paint=p_hinggi_royal)))
    entries.append(_isl_assemble(f'isl_{sex}_factor_sandals', 'Nacre-Strapped Assessor Sandals', 'feet',
                                 sandal(f'isl_{sex}_factor_sandals', p_coir, p_nacre, guard=True)))
    pad4, p_pad4 = _dorsal_pad(f'isl_{sex}_factor_ledger', core.CHEST + 0.01, (0.15, 0.05, 0.22), p_pandan)
    tube4 = tube(f'isl_{sex}_factor_scroll', [p_pad4 + np.array([-0.10, 0.055, -0.13]), p_pad4 + np.array([0.10, 0.055, 0.16])], 0.036, p_pandan, n=12, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_factor_ledger', 'Waxed Pandanus Tally-Scroll Case', 'back', [pad4, tube4]))

    # -------------------------------------------------------------------------------------------------------
    # I-5: `kau_tebutebu_guard` — Royal Kautoan Coconut-Coir Cuirassier & Koa Warrior (MC-05)
    # -------------------------------------------------------------------------------------------------------
    p_porc = P('isl_coir_tan', 0.09, [B('bottom', 0.0, 0.05, 'isl_coir_tebutebu', 'isl_tar_black', 'isl_coir_tan', 0.05)], fabric='straw.plaited')
    h5_bowl = _open_brow_cap(f'isl_{sex}_guard_bowl', p_porc, f_brow=0.61, f_nape=0.05, f_top=1.14, ease=0.018)
    h5_crest = crest(f'isl_{sex}_guard_crest', 0.075, P('isl_tar_black', 0.06, [B('top', 0.0, 0.03, 'solid', 'isl_moon_ivory')]),
                     rows=6, cols=15, a0=-0.85, a1=1.65, host_part=h5_bowl)
    h5_parts = [h5_bowl, h5_crest]
    p_m5, _ = _snap_to_part(h5_bowl, a + (b - a) * 0.72 - bk * 0.12, push=0.003)
    h5_parts.append(rosette(f'isl_{sex}_guard_browmoon', p_m5, -bk, left, 0.022, p_nacre, n=14, thick=0.007, rigid_joint='Head'))
    for sp_an in (-2.1, -1.4, 1.4, 2.1, 0.0):
        d_sp = bk * math.cos(sp_an) + left * math.sin(sp_an)
        ps0, _ = _snap_to_part(h5_bowl, a + (b - a) * 0.76 + d_sp * 0.11, push=-0.002)
        h5_parts.append(horn(f'isl_{sex}_guard_spine_{int((sp_an+3)*10)}', [ps0, ps0 + d_sp * 0.032 + up * 0.015], 0.006, 0.0015, p_nacre, n=6, rows=4, rigid_joint='Head'))
    entries.append(_isl_assemble(f'isl_{sex}_guard_helm', 'Porcupine-Fish & Coir Koa War-Helm', 'head',
                                 h5_parts, covers_hair=True, covers_face=False))

    t5_cuir = torso_tube(f'isl_{sex}_guard_cuir', core.TOP - 0.004, core.WAIST - 0.032, 0.025, p_coir, n=42, rows=15)
    # Iconic Kiribati high-neck dorsal coir blast/arrow-guard welded directly to upper dorsal cuirass rim
    Q_neck_shield = np.zeros((6, 15, 3), dtype=np.float64)
    angs_ns = np.linspace(-0.34 * math.pi, 0.34 * math.pi, 15)
    for ri_n in range(6):
        u_n = ri_n / 5.0
        zn = (core.TOP - 0.018) + 0.155 * u_n
        c_sp = spine_at(core.TOP - 0.010)
        for cj_n, an_n in enumerate(angs_ns):
            d_n = np.array([math.sin(an_n), math.cos(an_n), 0.0])
            h_n = first_hit(c_sp, d_n, bvh=core.BVH_T) or 0.095
            Q_neck_shield[ri_n, cj_n] = np.array([c_sp[0], c_sp[1], zn]) + d_n * (h_n + 0.024 + 0.020 * u_n)
    t5_guard = Part(f'isl_{sex}_guard_neckwall', Q_neck_shield, False, ['body'] * 6, p_coir, rigid_joint='Spine2')
    t5_belt = belt_sash(f'isl_{sex}_guard_girdle', core.WAIST - 0.012, core.WAIST + 0.030, P('isl_tar_black', 0.06), ease=0.027)
    t5_parts = [t5_cuir, t5_guard, t5_belt] + _kapkap_pectoral(f'isl_{sex}_guard', t5_cuir, core.CHEST + 0.03, radius=0.066, tusk=True)
    entries.append(_isl_assemble(f'isl_{sex}_guard_cuirass', 'Kiribati Coconut-Coir Tebutebu Cuirass & Kapkap', 'torso', t5_parts))
    entries.append(_isl_assemble(f'isl_{sex}_guard_vambraces', 'Shark-Tooth & Knotted Coir War-Vambraces', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_guard_vambraces', p_coir, f0=0.28, f1=0.95, ease=0.014, boss_paint=p_nacre)))
    entries.append(_isl_assemble(f'isl_{sex}_guard_kilt', 'Crimson & Indigo Hinggi War-Kilt', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_guard_kilt', p_hinggi_royal, core.KNEE + 0.03, flare=0.075)))
    entries.append(_isl_assemble(f'isl_{sex}_guard_greaves', 'Braided Coconut-Coir Shin-Greave Sandals', 'feet',
                                 _greave_sandals(f'isl_{sex}_guard_greaves', p_coir, P('isl_tar_black', 0.07), p_coir, top_frac=0.72)))
    pad5, p_pad5 = _dorsal_pad(f'isl_{sex}_guard_backshield', core.CHEST + 0.01, (0.16, 0.05, 0.18), p_coir)
    sh5 = rosette(f'isl_{sex}_guard_turtleshell', p_pad5 + BACK_DIR * 0.048, BACK_DIR, np.array([1.0, 0.0, 0.0]),
                  0.185, P('isl_reef_teal', 0.06, [B('bottom', 0.0, 0.16, 'isl_island_moon', 'isl_moon_ivory', 'isl_tar_black', 0.12)]),
                  n=20, thick=0.024, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_guard_backshield', 'Sea-Turtle Carapace & Coir Reserve Shield', 'back', [pad5, sh5]))

    # -------------------------------------------------------------------------------------------------------
    # I-6: `shaman` — Upgraded Kiln-Mask Bell-Shaman (100% M+F Parity + Full 6 Slots)
    # -------------------------------------------------------------------------------------------------------
    p_kiln = P('isl_kiln_clay', 0.08, [
        B('top', 0.0, 0.03, 'solid', 'isl_tapa_chalk'),
        B('bottom', 0.0, 0.03, 'solid', 'isl_tar_black'),
    ], [PN(0.22, 0.78, 'kiln_mask', 'isl_tapa_chalk', 'isl_kiln_clay', 0.36)])
    c_kb = a - up * 0.025 - bk * 0.020
    h_tot = 0.37
    angs_k = np.linspace(0.0, 2.0 * math.pi, 40, endpoint=False)
    Q_kiln = []
    for k_r in range(15):
        sk = k_r / 14.0
        prof = (1.06 + 0.05 * (sk / 0.25)) if sk < 0.25 else (1.11 * (1.0 - 0.55 * ((sk - 0.25) / 0.75) ** 1.35))
        row_k = []
        for an in angs_k:
            d_k = bk * math.cos(an) + left * math.sin(an)
            r_ell = math.hypot(math.cos(an) * 0.130, math.sin(an) * 0.112)
            row_k.append(c_kb + up * (h_tot * sk) + d_k * (r_ell * prof))
        Q_kiln.append(row_k)
    top_k = c_kb + up * h_tot
    Q_kiln.append([top_k + (q - top_k) * 0.18 for q in Q_kiln[-1]])
    kiln_cone = Part(f'isl_{sex}_shaman_cone', np.array(Q_kiln), True, ['body'] * 16, p_kiln, rigid_joint='Head')
    h6_parts = [kiln_cone]
    # Proud +4mm dark soot eye-slits + white brow bars + blowhole mouth ring snapped directly onto kiln_cone!
    p_soot = P('isl_tar_black', 0.03)
    p_chalk = P('isl_tapa_chalk', 0.04)
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        pe_in, _ = _snap_to_part(kiln_cone, a + up * 0.105 - bk * 0.145 + left * (sd * 0.020), push=0.004)
        pe_out, _ = _snap_to_part(kiln_cone, a + up * 0.102 - bk * 0.140 + left * (sd * 0.056), push=0.004)
        h6_parts.append(tube(f'isl_{sex}_shaman_eyeslit_{tag}', [pe_in, pe_out], 0.0065, p_soot, n=8, rigid_joint='Head'))
        pb_in, _ = _snap_to_part(kiln_cone, a + up * 0.122 - bk * 0.145 + left * (sd * 0.016), push=0.005)
        pb_out, _ = _snap_to_part(kiln_cone, a + up * 0.118 - bk * 0.138 + left * (sd * 0.060), push=0.005)
        h6_parts.append(tube(f'isl_{sex}_shaman_brow_{tag}', [pb_in, pb_out], 0.0060, p_chalk, n=8, rigid_joint='Head'))
    pm_ctr, _ = _snap_to_part(kiln_cone, a + up * 0.035 - bk * 0.150, push=0.004)
    h6_parts.append(rosette(f'isl_{sex}_shaman_blowhole', pm_ctr, -bk, left, 0.020, p_soot, n=12, thick=0.007, rigid_joint='Head'))
    for tier_p in range(5):
        sk_p = 0.18 + 0.66 * (tier_p / 4.0)
        for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
            pp0, _ = _snap_to_part(kiln_cone, c_kb + up * (h_tot * sk_p) + left * (sd * 0.12), push=-0.003)
            h6_parts.append(horn(f'isl_{sex}_shaman_peg_{tier_p}_{tag}', [pp0, pp0 + left * (sd * 0.034) + up * 0.005],
                                 0.009, 0.006, p_kiln, n=8, rows=4, rigid_joint='Head'))
    entries.append(_isl_assemble(f'isl_{sex}_shaman_mask', 'Kiln-Mask Pegged Terracotta Beehive Helm', 'head',
                                 h6_parts, covers_hair=True, covers_face=True))

    p_straw_cape = P('isl_turmeric', 0.11, [
        B('bottom', 0.0, 0.05, 'rays', 'isl_mamuli_gold', 'isl_coir_tan', 0.02),
    ], fabric='straw.plaited')
    t6_bodice = torso_tube(f'isl_{sex}_shaman_bodice', core.CHEST + (0.065 if is_f else 0.035), core.WAIST - 0.030, 0.016,
                           P('isl_coir_tan', 0.08, [B('top', 0.0, 0.06, 'beads', 'isl_moon_ivory', 'isl_coir_tan', 0.035)], fabric='cloth.bark.tapa'),
                           n=40, rows=10)
    t6_disc = collar_disc(f'isl_{sex}_shaman_capelet', 0.16, p_straw_cape, drop=0.14, rows=9, n=48, scallop=0.06, ease=0.021)
    t6_parts = [t6_bodice, t6_disc]
    for k_b in range(12):
        an_b = 2.0 * math.pi * k_b / 12.0
        tgt_b = spine_at(core.SHOULDER - 0.04) + np.array([math.sin(an_b) * 0.19, math.cos(an_b) * 0.14, -0.03])
        pb_top, nb_out = _snap_to_part(t6_disc, tgt_b, push=0.002)
        t6_parts.append(horn(f'isl_{sex}_shaman_bell_{k_b}', [pb_top, pb_top + nb_out * 0.012 + np.array([0.0, 0.0, -0.042])],
                             0.009, 0.020, p_bronze, n=8, rows=4))
    entries.append(_isl_assemble(f'isl_{sex}_shaman_mantle', 'Straw Bell-Capelet & Cowrie Ritual Bodice', 'torso', t6_parts))
    entries.append(_isl_assemble(f'isl_{sex}_shaman_cuffs', 'Terracotta & Conch-Shell Rattle Cuffs', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_shaman_cuffs', p_kiln, f0=0.35, f1=0.92, ease=0.013, boss_paint=p_nacre)))
    l6_parts = _lavalava_kilt(f'isl_{sex}_shaman_kilt', P('isl_turmeric', 0.08, [B('bottom', 0.0, 0.09, 'isl_tapa_kowhaiwhai', 'isl_mangrove_red', 'isl_turmeric', 0.08)], fabric='cloth.bark.tapa'),
                              core.KNEE + 0.04, flare=0.075, front_sash_paint=p_tapa_sand)
    entries.append(_isl_assemble(f'isl_{sex}_shaman_kilt', 'Saffron-Ochre Tapa Kilt & Driftwood Amulets', 'legs', l6_parts))
    entries.append(_isl_assemble(f'isl_{sex}_shaman_sandals', 'Plaited Pandanus & Cowrie Ritual Sandals', 'feet',
                                 _greave_sandals(f'isl_{sex}_shaman_sandals', p_coir, p_nacre, p_kiln, top_frac=0.55)))
    pad6, p_pad6 = _dorsal_pad(f'isl_{sex}_shaman_chimes', core.CHEST + 0.02, (0.16, 0.05, 0.20), p_coir)
    bar6 = tube(f'isl_{sex}_shaman_driftbar', [p_pad6 + np.array([-0.17, 0.055, 0.14]), p_pad6 + np.array([0.17, 0.055, 0.14])], 0.015, p_tapa_sand, n=8, rigid_joint='Spine2')
    ch6 = [pad6, bar6]
    for idx_c, xc in enumerate((-0.11, -0.04, 0.04, 0.11)):
        pt_top = p_pad6 + np.array([xc, 0.055, 0.13])
        ch6.append(tube(f'isl_{sex}_shaman_chime_{idx_c}', [pt_top, pt_top + np.array([0.0, 0.005, -0.19])], 0.011, p_bronze, n=8, rigid_joint='Spine2'))
    entries.append(_isl_assemble(f'isl_{sex}_shaman_chimes', 'Sea-Bleached Driftwood & Bronze Bell Chime-Rack', 'back', ch6))

    # -------------------------------------------------------------------------------------------------------
    # I-7: `kau_marapu_noble` — Uma Megalithic Patrician & Mamuli High Chief
    # -------------------------------------------------------------------------------------------------------
    h7_band = crown_band(f'isl_{sex}_noble_tiara', p_gold, f0=0.61, f1=0.76, ease=0.004, flare=0.010, rows=6, n=36)
    p_f7, _ = _snap_to_part(h7_band, a + (b - a) * 0.75 - bk * 0.11, push=0.002)
    h7_cres = horn(f'isl_{sex}_noble_plume', [p_f7, p_f7 + up * 0.11 + bk * 0.02], 0.022, 0.006, P('isl_tapa_chalk', 0.03), n=10, rows=6, rigid_joint='Head')
    h7_parts = [h7_band, h7_cres]
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        pe_m, _ = _snap_to_part(h7_band, a + (b - a) * 0.62 + left * (sd * 0.095), push=0.001)
        h7_parts.append(blob(f'isl_{sex}_noble_mamuli_{tag}', pe_m - up * 0.048, (0.016, 0.032, 0.042), p_gold, n=10, rows=5, out=left * sd, rigid_joint='Head'))
    entries.append(_isl_assemble(f'isl_{sex}_noble_headdress', 'Gold Mamuli & Crescent Plume Patrician Tiara', 'head',
                                 h7_parts, covers_hair=False, covers_face=False))

    t7_tun = torso_tube(f'isl_{sex}_noble_tun', core.TOP - 0.006, core.WAIST - 0.032, 0.022, p_hinggi_royal, n=42, rows=15)
    t7_slv = sleeves(f'isl_{sex}_noble_tun', 'elbow', 0.018, p_hinggi_royal)
    t7_stole = crossed_sash(f'isl_{sex}_noble_toga', P('isl_annatto', 0.06, [B('bottom', 0.0, 0.08, 'isl_hinggi_ikat', 'isl_mamuli_gold', 'isl_annatto', 0.10)]), width=0.105, ease=0.026)
    t7_belt = belt_sash(f'isl_{sex}_noble_girdle', core.WAIST - 0.012, core.WAIST + 0.032, p_gold, ease=0.026)
    t7_parts = [t7_tun] + t7_slv + [t7_stole, t7_belt] + _kapkap_pectoral(f'isl_{sex}_noble', t7_stole, core.CHEST + 0.03, radius=0.064, tusk=True)
    entries.append(_isl_assemble(f'isl_{sex}_noble_robe', 'Royal Hinggi Toga-Mantle & Giant Nacre Kapkap', 'torso', t7_parts))
    entries.append(_isl_assemble(f'isl_{sex}_noble_bangles', 'Ivory Trochus-Shell & Gold Mamuli Bangles', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_noble_bangles', p_nacre, f0=0.52, f1=0.92, boss_paint=p_gold)))
    entries.append(_isl_assemble(f'isl_{sex}_noble_hinggi', 'Pleated Ceremonial Hinggi Warp-Ikat Skirt', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_noble_hinggi', p_hinggi_royal, core.ANKLE + 0.06, flare=0.090, front_sash_paint=P('isl_turmeric', 0.06))))
    entries.append(_isl_assemble(f'isl_{sex}_noble_sandals', 'Tortoiseshell & Gilded Court Sandals', 'feet',
                                 sandal(f'isl_{sex}_noble_sandals', P('isl_tortoise', 0.04), p_gold, guard=True)))
    p_noble_cape = P('isl_annatto', 0.05, [
        B('bottom', 0.0, 0.12, 'isl_island_moon', 'isl_moon_ivory', 'isl_hinggi_indigo', 0.12),
    ], [PN(0.0, 1.0, 'isl_feather_cloak', 'isl_mamuli_gold', 'isl_annatto', 0.20)])
    entries.append(_isl_assemble(f'isl_{sex}_noble_cape', 'Tropicbird Feather & White-Moon Patrician Mantle', 'back',
                                 [cape(f'isl_{sex}_noble_cape', core.WAIST + 0.04, p_noble_cape, stiff=0.36, back_push=0.055)]))

    # -------------------------------------------------------------------------------------------------------
    # I-8: `west_rumah_planter` — Hikau Horned-Roof Clove Planter & Abaca Weaver
    # -------------------------------------------------------------------------------------------------------
    p_hikau_red = P('isl_mangrove_red', 0.07, [
        B('bottom', 0.0, 0.08, 'isl_mat_diamond', 'isl_turmeric', 'isl_mangrove_red', 0.08),
    ], fabric='cloth.cotton.coarse')
    h8_base = _open_brow_cap(f'isl_{sex}_rumah_base', p_hikau_red, f_brow=0.62, f_nape=0.22, f_top=1.14, ease=0.018)
    h8_horns = _gonjong_horns(f'isl_{sex}_rumah', h8_base, p_pandan, spread=(0.175 if is_f else 0.125), lift=(0.115 if is_f else 0.080))
    entries.append(_isl_assemble(f'isl_{sex}_rumah_tengkuluk', 'Minangkabau-Hikau Horned Tengkuluk Headcloth', 'head',
                                 [h8_base] + h8_horns, covers_hair=True, covers_face=False))

    p_baju_green = P('isl_reef_teal', 0.07, [
        B('bottom', 0.0, 0.06, 'isl_mat_diamond', 'isl_rattan_gold', 'isl_reef_teal', 0.06),
    ], fabric='cloth.linen.sea')
    t8_baju = torso_tube(f'isl_{sex}_rumah_baju_body', core.TOP - 0.008, core.WAIST - 0.032, 0.020, p_baju_green, n=40, rows=14)
    t8_slv = sleeves(f'isl_{sex}_rumah_baju', 'elbow', 0.017, p_baju_green)
    t8_col = collar(f'isl_{sex}_rumah_col', p_pandan, height=0.032, open_front=True)
    t8_belt = belt_sash(f'isl_{sex}_rumah_sash', core.WAIST - 0.012, core.WAIST + 0.028, p_hikau_red, ease=0.023)
    entries.append(_isl_assemble(f'isl_{sex}_rumah_baju', 'Hikau Diamond-Weave Abaca Baju Tunic', 'torso', [t8_baju] + t8_slv + [t8_col, t8_belt]))
    entries.append(_isl_assemble(f'isl_{sex}_rumah_wraps', 'Plaited Rattan & Abaca Cord Wrist-Wraps', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_rumah_wraps', p_pandan, f0=0.50, f1=0.94)))
    entries.append(_isl_assemble(f'isl_{sex}_rumah_sarong', 'Mangrove-Red & Reef-Teal Hikau Sarong', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_rumah_sarong', p_hikau_red, core.ANKLE + 0.07, flare=0.082)))
    entries.append(_isl_assemble(f'isl_{sex}_rumah_sandals', 'Woven Rattan Stilt-House Sandals', 'feet',
                                 sandal(f'isl_{sex}_rumah_sandals', p_pandan, p_hikau_red)))
    pad8, p_pad8 = _dorsal_pad(f'isl_{sex}_rumah_pannier', core.CHEST, (0.17, 0.05, 0.21), p_pandan)
    pan8 = blob(f'isl_{sex}_rumah_basket', p_pad8 + BACK_DIR * 0.075, (0.23, 0.16, 0.29), p_pandan, n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_rumah_pannier', 'Woven Rattan Clove & Nutmeg Spice Pannier', 'back', [pad8, pan8]))

    # -------------------------------------------------------------------------------------------------------
    # I-9: `west_master_carver` — Kautono Outrigger Wright & Stick-Chart Proa Navigator
    # -------------------------------------------------------------------------------------------------------
    h9_cap = _open_brow_cap(f'isl_{sex}_carver_skullcap', p_pandan, f_brow=0.63, f_nape=0.25, f_top=1.14, ease=0.018)
    p_dv, _ = _snap_to_part(h9_cap, a + (b - a) * 0.72 + left * 0.085, push=0.002)
    h9_pin = tube(f'isl_{sex}_carver_divider', [p_dv - bk * 0.03, p_dv + bk * 0.04 + up * 0.03], 0.005, p_nacre, n=8, rigid_joint='Head')
    entries.append(_isl_assemble(f'isl_{sex}_carver_cap', 'Plaited Rattan Skullcap & Bone Divider-Pin', 'head',
                                 [h9_cap, h9_pin], covers_hair=True, covers_face=False))

    p_story = P('isl_tar_black', 0.07, [
        B('bottom', 0.0, 0.08, 'isl_storyboard', 'isl_turmeric', 'isl_tar_black', 0.10),
    ], [PN(0.18, 0.82, 'isl_storyboard', 'isl_rattan_gold', 'isl_reef_teal', 0.22)], fabric='cloth.slops.abaca_stripe')
    t9_vest = torso_tube(f'isl_{sex}_carver_vest_b', core.TOP - 0.008, core.WAIST - 0.055, 0.021, p_story, n=40, rows=14)
    t9_belt = belt_sash(f'isl_{sex}_carver_belt', core.WAIST - 0.014, core.WAIST + 0.028, p_pandan, ease=0.024)
    p_pec, n_pec = _snap_to_part(t9_vest, chest_front(core.CHEST + 0.02, 0.021), push=0.003)
    t9_board = blob(f'isl_{sex}_carver_pectoral', p_pec, (0.12, 0.016, 0.065), P('isl_rattan_gold', 0.05, [B('bottom', 0.0, 0.04, 'isl_storyboard', 'isl_moon_ivory', 'isl_tortoise', 0.05)]), n=12, rows=5, out=n_pec)
    entries.append(_isl_assemble(f'isl_{sex}_carver_vest', 'Storyboard Pectoral & Kowhaiwhai Mariner Vest', 'torso', [t9_vest, t9_belt, t9_board]))
    entries.append(_isl_assemble(f'isl_{sex}_carver_cuffs', 'Tarred Abaca Cordage Mariner Wrist-Wraps', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_carver_cuffs', P('isl_tar_black', 0.08), f0=0.48, f1=0.94)))
    entries.append(_isl_assemble(f'isl_{sex}_carver_breeches', 'Knee-Length Striped Abaca Boat-Drawers', 'legs',
                                 trousers(f'isl_{sex}_carver_breeches', P('isl_tapa_sand', 0.08, fabric='cloth.slops.abaca_stripe'),
                                          ease=0.014, cuff=core.KNEE - 0.03, bag=0.008), legged=True))
    entries.append(_isl_assemble(f'isl_{sex}_carver_sandals', 'Braided Coir Outrigger Deck Sandals', 'feet',
                                 sandal(f'isl_{sex}_carver_sandals', p_coir, P('isl_tar_black', 0.07))))
    pad9, p_pad9 = _dorsal_pad(f'isl_{sex}_carver_chart', core.CHEST + 0.02, (0.16, 0.045, 0.18), p_pandan)
    ch9 = [pad9]
    # Marshallese bamboo & cowrie wave-refraction stick-chart welded flush onto dorsal pad
    for dy_z in (-0.11, 0.0, 0.11):
        ch9.append(tube(f'isl_{sex}_chart_h_{int((dy_z+0.2)*100)}', [p_pad9 + np.array([-0.15, 0.040, dy_z]), p_pad9 + np.array([0.15, 0.040, dy_z])], 0.007, p_pandan, n=8, rigid_joint='Spine2'))
    for dx_x in (-0.13, 0.0, 0.13):
        ch9.append(tube(f'isl_{sex}_chart_v_{int((dx_x+0.2)*100)}', [p_pad9 + np.array([dx_x, 0.040, -0.13]), p_pad9 + np.array([dx_x, 0.040, 0.13])], 0.007, p_pandan, n=8, rigid_joint='Spine2'))
    ch9.append(tube(f'isl_{sex}_chart_diag', [p_pad9 + np.array([-0.13, 0.042, -0.11]), p_pad9 + np.array([0.13, 0.042, 0.11])], 0.006, p_pandan, n=8, rigid_joint='Spine2'))
    for ix_s, (sx_c, sz_c) in enumerate(((-0.13, 0.11), (0.0, 0.0), (0.13, -0.11), (0.0, 0.11))):
        ch9.append(blob(f'isl_{sex}_chart_cowrie_{ix_s}', p_pad9 + np.array([sx_c, 0.048, sz_c]), (0.022, 0.015, 0.022), p_nacre, n=8, rows=4, out=BACK_DIR, rigid_joint='Spine2'))
    entries.append(_isl_assemble(f'isl_{sex}_carver_chart', 'Marshallese Bamboo & Cowrie Wave Stick-Chart', 'back', ch9))

    # -------------------------------------------------------------------------------------------------------
    # I-10: `west_korakora_marine` — Kora-Kora Galley Marine & Pencak Bladesman
    # -------------------------------------------------------------------------------------------------------
    p_kalambi = P('isl_tortoise', 0.05, [
        B('bottom', 0.0, 0.06, 'isl_rattan_tortoise', 'isl_rattan_gold', 'isl_tortoise', 0.06),
    ], [PN(0.0, 1.0, 'isl_rattan_tortoise', 'isl_rattan_gold', 'isl_tortoise', 0.18)], fabric='armor.lamellar.horn')
    h10_bowl = _open_brow_cap(f'isl_{sex}_marine_bowl', p_bronze, f_brow=0.61, f_nape=0.06, f_top=1.14, ease=0.018)
    h10_horns = _gonjong_horns(f'isl_{sex}_marine', h10_bowl, P('isl_tortoise', 0.04), spread=0.155, lift=0.105, thick=0.020)
    h10_comb = crest(f'isl_{sex}_marine_ridge', 0.048, p_bronze, rows=5, cols=14, a0=-0.8, a1=1.6, host_part=h10_bowl)
    entries.append(_isl_assemble(f'isl_{sex}_marine_helm', 'Horned Gonjong Buffalo & Bronze Marine Helm', 'head',
                                 [h10_bowl, h10_comb] + h10_horns, covers_hair=True, covers_face=False))

    t10_cors = torso_tube(f'isl_{sex}_marine_cors', core.TOP - 0.006, core.WAIST - 0.034, 0.024, p_kalambi, n=42, rows=15)
    t10_pld = [pauldron(f'isl_{sex}_marine_pld_{s[0]}', s, p_kalambi) for s in (L, R)]
    t10_belt = belt_sash(f'isl_{sex}_marine_sash', core.WAIST - 0.012, core.WAIST + 0.030, P('isl_mangrove_red', 0.06), ease=0.026)
    t10_parts = [t10_cors] + t10_pld + [t10_belt] + _kapkap_pectoral(f'isl_{sex}_marine', t10_cors, core.CHEST + 0.03, radius=0.054, tusk=False)
    entries.append(_isl_assemble(f'isl_{sex}_marine_corslet', 'Rattan & Tortoiseshell Kalambi Marine Corslet', 'torso', t10_parts))
    entries.append(_isl_assemble(f'isl_{sex}_marine_bracers', 'Split-Rattan & Bronze Pencak Vambraces', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_marine_bracers', p_kalambi, f0=0.26, f1=0.95, ease=0.013, boss_paint=p_bronze)))
    entries.append(_isl_assemble(f'isl_{sex}_marine_kilt', 'Tar-Black & Annatto Kora-Kora Battle-Kilt', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_marine_kilt', P('isl_tar_black', 0.07, [B('bottom', 0.0, 0.09, 'stripes', 'isl_annatto', 'isl_tar_black', 0.05)]),
                                                core.KNEE + 0.03, flare=0.075)))
    entries.append(_isl_assemble(f'isl_{sex}_marine_greaves', 'Split-Bamboo & Rattan Marine Greave-Sandals', 'feet',
                                 _greave_sandals(f'isl_{sex}_marine_greaves', P('isl_tar_black', 0.07), p_hikau_red, p_kalambi, top_frac=0.70)))
    pad10, p_pad10 = _dorsal_pad(f'isl_{sex}_marine_quiver', core.CHEST + 0.01, (0.15, 0.048, 0.20), p_pandan)
    qv10 = tube(f'isl_{sex}_marine_qvtube', [p_pad10 + np.array([-0.04, 0.058, -0.14]), p_pad10 + np.array([0.07, 0.062, 0.17])], 0.044, p_kalambi, n=12, rigid_joint='Spine2')
    jav1 = tube(f'isl_{sex}_marine_jav1', [p_pad10 + np.array([0.05, 0.062, 0.12]), p_pad10 + np.array([0.10, 0.066, 0.30])], 0.008, p_pandan, n=8, rigid_joint='Spine2')
    jav2 = tube(f'isl_{sex}_marine_jav2', [p_pad10 + np.array([0.08, 0.062, 0.11]), p_pad10 + np.array([0.14, 0.066, 0.28])], 0.008, p_pandan, n=8, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_marine_quiver', 'Rattan Barbed Boarding-Javelin Quiver', 'back', [pad10, qv10, jav1, jav2]))

    # -------------------------------------------------------------------------------------------------------
    # I-11: `west_moon_oracle` — Marae White-Moon Tapa Medium & Spirit-Caller
    # -------------------------------------------------------------------------------------------------------
    h11_band = crown_band(f'isl_{sex}_oracle_diadem', p_nacre, f0=0.61, f1=0.75, ease=0.004, flare=0.006, rows=6, n=36)
    p_m11, _ = _snap_to_part(h11_band, a + (b - a) * 0.74 - bk * 0.11, push=0.002)
    h11_moon = rosette(f'isl_{sex}_oracle_crescent', p_m11 + up * 0.028, -bk, left, 0.036, p_nacre, n=16, thick=0.008, rigid_joint='Head')
    entries.append(_isl_assemble(f'isl_{sex}_oracle_crown', 'White Island Moon Mother-of-Pearl Diadem', 'head',
                                 [h11_band, h11_moon], covers_hair=False, covers_face=False))

    p_oracle_tapa = P('isl_tapa_chalk', 0.06, [
        B('bottom', 0.0, 0.10, 'isl_island_moon', 'isl_reef_teal', 'isl_tapa_chalk', 0.10),
    ], [PN(0.0, 1.0, 'isl_tapa_kowhaiwhai', 'isl_reef_teal', 'isl_tapa_chalk', 0.22)], fabric='cloth.bark.tapa')
    t11_tun = torso_tube(f'isl_{sex}_oracle_tun', core.TOP - 0.006, core.WAIST - 0.032, 0.022, p_oracle_tapa, n=42, rows=15)
    t11_disc = collar_disc(f'isl_{sex}_oracle_stole', 0.14, p_oracle_tapa, drop=0.12, rows=8, n=48, scallop=0.07, ease=0.020)
    t11_belt = belt_sash(f'isl_{sex}_oracle_sash', core.WAIST - 0.012, core.WAIST + 0.030, p_diver_teal, ease=0.025)
    entries.append(_isl_assemble(f'isl_{sex}_oracle_vestment', 'Chalk-White & Reef-Teal Kowhaiwhai Tapa Vestment', 'torso', [t11_tun, t11_disc, t11_belt]))
    entries.append(_isl_assemble(f'isl_{sex}_oracle_shells', 'Rattling White Cowrie & Nacre Wristlets', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_oracle_shells', p_oracle_tapa, f0=0.55, f1=0.94, boss_paint=p_nacre)))
    entries.append(_isl_assemble(f'isl_{sex}_oracle_skirt', 'Tiered Chalk-White & Reef-Teal Tapa Skirt', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_oracle_skirt', p_oracle_tapa, core.ANKLE + 0.06, flare=0.092)))
    entries.append(_isl_assemble(f'isl_{sex}_oracle_sandals', 'Bleached Pandanus & Pearl-Toggle Sandals', 'feet',
                                 sandal(f'isl_{sex}_oracle_sandals', p_oracle_tapa, p_nacre, guard=True)))
    entries.append(_isl_assemble(f'isl_{sex}_oracle_streamer', 'White Barkcloth Marae Spirit-Mantle', 'back',
                                 [cape(f'isl_{sex}_oracle_streamer', core.WAIST + 0.04, p_oracle_tapa, stiff=0.36, back_push=0.055)]))

    # -------------------------------------------------------------------------------------------------------
    # I-12: `het_exile_envoy` — Exiled Kingdom of Hetanini Datu Chief & Ys Courtier
    # -------------------------------------------------------------------------------------------------------
    p_het_court = P('isl_bay_purple', 0.05, [
        B('bottom', 0.0, 0.08, 'isl_island_moon', 'isl_moon_ivory', 'isl_reef_teal', 0.09),
    ], [PN(0.0, 1.0, 'isl_hinggi_ikat', 'isl_moon_ivory', 'isl_bay_purple', 0.22)], fabric='cloth.linen.sea')
    h12_band = crown_band(f'isl_{sex}_het_circlet', p_gold, f0=0.61, f1=0.75, ease=0.004, flare=0.008, rows=6, n=36)
    h12_horns = _gonjong_horns(f'isl_{sex}_het', h12_band, p_nacre, spread=0.115, lift=0.075, thick=0.015)
    entries.append(_isl_assemble(f'isl_{sex}_het_crown', 'Gilded Bronze & Ys-Abalone Gonjong Crown', 'head',
                                 [h12_band] + h12_horns, covers_hair=False, covers_face=False))

    t12_coat = torso_tube(f'isl_{sex}_het_baju', core.TOP - 0.005, core.WAIST - 0.032, 0.022, p_het_court, n=42, rows=15)
    t12_slv = sleeves(f'isl_{sex}_het_baju', 'wrist', 0.018, p_het_court)
    t12_col = collar(f'isl_{sex}_het_col', p_nacre, height=0.034, open_front=False)
    t12_belt = belt_sash(f'isl_{sex}_het_belt', core.WAIST - 0.012, core.WAIST + 0.030, p_nacre, ease=0.025)
    p_fib, n_fib = _snap_to_part(t12_coat, chest_front(core.CHEST + 0.04, 0.022), push=0.003)
    t12_fib = rosette(f'isl_{sex}_het_fibula', p_fib, n_fib, np.array([1.0, 0.0, 0.0]), 0.038, p_nacre, n=14, thick=0.008)
    entries.append(_isl_assemble(f'isl_{sex}_het_coat', 'Hetanini Bay-Purple Court Baju & Ys-Abalone Fibula', 'torso',
                                 [t12_coat] + t12_slv + [t12_col, t12_belt, t12_fib]))
    entries.append(_isl_assemble(f'isl_{sex}_het_cuffs', 'Ys-Abalone & Bronze Court Envoy Cuffs', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_het_cuffs', p_het_court, f0=0.55, f1=0.96, boss_paint=p_nacre)))
    entries.append(_isl_assemble(f'isl_{sex}_het_sarong', 'Formal Hinggi & Abalone Treaty Sarong', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_het_sarong', p_het_court, core.ANKLE + 0.06, flare=0.085, front_sash_paint=p_diver_teal)))
    entries.append(_isl_assemble(f'isl_{sex}_het_shoes', 'Upturned Sea-Linen & Nacre Envoy Shoes', 'feet',
                                 boots(f'isl_{sex}_het_shoes', P('isl_tar_black', 0.06), p_het_court, top=0.34, ease_top=0.015)))
    entries.append(_isl_assemble(f'isl_{sex}_het_mantle', 'Sea-Linen & Abalone-Clasped Diplomatic Mantle', 'back',
                                 [cape(f'isl_{sex}_het_mantle', core.WAIST + 0.04, P('isl_tapa_chalk', 0.05, [B('bottom', 0.0, 0.08, 'isl_island_moon', 'isl_bay_purple', 'isl_tapa_chalk', 0.09)], fabric='cloth.linen.sea'), stiff=0.36, back_push=0.055)]))

    # -------------------------------------------------------------------------------------------------------
    # I-13: `het_shore_guerrilla` — SW Throne Hetanini Resistance & Covert Ranj Runner
    # -------------------------------------------------------------------------------------------------------
    p_reb_cloth = P('isl_tar_black', 0.08, [B('bottom', 0.0, 0.05, 'stripes', 'isl_mangrove_red', 'isl_tar_black', 0.04)])
    h13_cap = _open_brow_cap(f'isl_{sex}_reb_cap', p_reb_cloth, f_brow=0.61, f_nape=-0.04, f_top=1.14, ease=0.018)
    # Lower face-veil spanning below eyes (`f=-0.10 .. f_eyes-0.05`) leaving clear ocular opening!
    _, _, _, _, _, f_nose13, f_eyes13, _, _, _ = head_landmarks_exact()
    h13_veil = crown_band(f'isl_{sex}_reb_veil', P('isl_mangrove_red', 0.07), f0=-0.08, f1=min(f_eyes13 - 0.04, 0.36), ease=0.014, flare=0.004, rows=6, n=36)
    h13_horns = _gonjong_horns(f'isl_{sex}_reb', h13_cap, p_reb_cloth, spread=0.11, lift=0.065, thick=0.016)
    entries.append(_isl_assemble(f'isl_{sex}_reb_hood', 'Ash-Weathered Horned Scarf & Mouth-Veil', 'head',
                                 [h13_cap, h13_veil] + h13_horns, covers_hair=True, covers_face=True))

    p_defaced = P('isl_bipo_bronze', 0.05, [
        B('bottom', 0.0, 0.12, 'isl_defaced_moon', 'isl_moon_ivory', 'isl_bipo_bronze', 0.12),
    ], [PN(0.18, 0.82, 'isl_defaced_moon', 'isl_moon_ivory', 'isl_bipo_bronze', 0.24)], fabric='metal.bronze')
    t13_tun = torso_tube(f'isl_{sex}_reb_baju', core.TOP - 0.008, core.WAIST - 0.058, 0.022, p_defaced, n=40, rows=14)
    t13_slv = sleeves(f'isl_{sex}_reb_baju', 'elbow', 0.017, p_reb_cloth)
    t13_belt = belt_sash(f'isl_{sex}_reb_belt', core.WAIST - 0.014, core.WAIST + 0.028, p_shark, ease=0.025)
    entries.append(_isl_assemble(f'isl_{sex}_reb_harness', 'Defaced Vothic Bronze Lames w/ White Island Moon', 'torso', [t13_tun] + t13_slv + [t13_belt]))
    entries.append(_isl_assemble(f'isl_{sex}_reb_bracers', 'Sharkskin & Bronze Shore-Guerrilla Bracers', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_reb_bracers', p_shark, f0=0.32, f1=0.95, boss_paint=p_bronze)))
    entries.append(_isl_assemble(f'isl_{sex}_reb_breeches', 'Rolled Surf-Runner Breeches', 'legs',
                                 trousers(f'isl_{sex}_reb_breeches', p_reb_cloth, ease=0.014, cuff=core.KNEE - 0.05, bag=0.008), legged=True))
    entries.append(_isl_assemble(f'isl_{sex}_reb_boots', 'Basalt-Soled Lava-Shore Ankle Boots', 'feet',
                                 boots(f'isl_{sex}_reb_boots', P('basalt', 0.08), p_shark, top=0.38, ease_top=0.016)))
    pad13, p_pad13 = _dorsal_pad(f'isl_{sex}_reb_gourds', core.CHEST, (0.16, 0.05, 0.20), p_shark)
    g_l = blob(f'isl_{sex}_reb_gourdL', p_pad13 + np.array([-0.065, 0.065, 0.0]), (0.11, 0.10, 0.22), P('isl_annatto', 0.06), n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    g_r = blob(f'isl_{sex}_reb_gourdR', p_pad13 + np.array([0.065, 0.065, 0.0]), (0.11, 0.10, 0.22), P('isl_annatto', 0.06), n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_reb_gourds', 'Wax-Sealed Ranj-Smuggling Gourd Pack', 'back', [pad13, g_l, g_r]))

    # -------------------------------------------------------------------------------------------------------
    # I-14: `huk_salvage_wright` — Hook Hukoa Freighter-Stack Boatwright & Tin-Tarp Rigger
    # -------------------------------------------------------------------------------------------------------
    p_tarp = P('isl_hukoa_tarp', 0.08, [B('bottom', 0.0, 0.04, 'solid', 'isl_tapa_sand')], fabric='cloth.kelp.oilskin')
    p_tin = P('steel', 0.05, [], [PN(0.0, 1.0, 'isl_hukoa_salvage', 'isl_moon_ivory', 'steel', 0.22)], fabric='metal.tin.patchwork')
    h14_cap = _open_brow_cap(f'isl_{sex}_huk_cap_b', p_tarp, f_brow=0.62, f_nape=0.24, f_top=1.14, ease=0.018)
    h14_parts = [h14_cap]
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        pg, _ = _snap_to_part(h14_cap, a + (b - a) * 0.72 - bk * 0.11 + left * (sd * 0.036), push=0.003)
        h14_parts.append(rosette(f'isl_{sex}_huk_gog_{tag}', pg, -bk, left, 0.020, p_bronze, n=12, thick=0.010, rigid_joint='Head'))
    entries.append(_isl_assemble(f'isl_{sex}_huk_cap', 'Blue Poly-Tarp Rigger Cap & Flipped Salvage Goggles', 'head',
                                 h14_parts, covers_hair=True, covers_face=False))

    t14_jrk = torso_tube(f'isl_{sex}_huk_jrk', core.TOP - 0.008, core.WAIST - 0.058, 0.021,
                         P('isl_tapa_sand', 0.08, [B('bottom', 0.0, 0.07, 'isl_hukoa_salvage', 'isl_hukoa_tarp', 'isl_tapa_sand', 0.10)], fabric='cloth.kelp.oilskin'),
                         n=40, rows=14)
    t14_slv = sleeves(f'isl_{sex}_huk_jrk', 'elbow', 0.017, p_tarp)
    t14_pld = pauldron(f'isl_{sex}_huk_tin_pld', L, p_tin)
    t14_belt = belt_sash(f'isl_{sex}_huk_hawser', core.WAIST - 0.014, core.WAIST + 0.028, p_coir, ease=0.024)
    entries.append(_isl_assemble(f'isl_{sex}_huk_jerkin', 'Tarred Canvas Jerkin & Corrugated-Tin Moon Pauldron', 'torso',
                                 [t14_jrk] + t14_slv + [t14_pld, t14_belt]))
    entries.append(_isl_assemble(f'isl_{sex}_huk_gloves', 'Vulcanized Tyre-Rubber Splice-Gloves', 'gloves',
                                 full_gloves(f'isl_{sex}_huk_gloves', p_coir, P('isl_tar_black', 0.08, fabric='rubber.tyre'))))
    entries.append(_isl_assemble(f'isl_{sex}_huk_slops', 'Rolled Striped Abaca Sailcloth Slops', 'legs',
                                 trousers(f'isl_{sex}_huk_slops', P('isl_tapa_chalk', 0.08, fabric='cloth.slops.abaca_stripe'),
                                          ease=0.015, cuff=core.ANKLE + 0.10, bag=0.009), legged=True))
    entries.append(_isl_assemble(f'isl_{sex}_huk_boots', 'Tire-Soled Hukoa Boatwright Deck Boots', 'feet',
                                 boots(f'isl_{sex}_huk_boots', P('isl_tar_black', 0.09, fabric='rubber.tyre'), p_tarp, top=0.38, ease_top=0.020)))
    pad14, p_pad14 = _dorsal_pad(f'isl_{sex}_huk_rigpack', core.CHEST, (0.17, 0.05, 0.21), p_coir)
    coil14 = rosette(f'isl_{sex}_huk_coil', p_pad14 + BACK_DIR * 0.052, BACK_DIR, np.array([1.0, 0.0, 0.0]), 0.135, p_coir, n=18, thick=0.036, rigid_joint='Spine2')
    blk14 = blob(f'isl_{sex}_huk_pulley', p_pad14 + BACK_DIR * 0.075 + np.array([0.0, 0.0, 0.08]), (0.08, 0.07, 0.11), p_tin, n=10, rows=5, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_huk_rigpack', 'Pulley-Block, Hawser Coil & Caulking Rig', 'back', [pad14, coil14, blk14]))

    # -------------------------------------------------------------------------------------------------------
    # I-15: `lan_sweep_raider` — Noah's Regret Lanong Sweep-Corsair
    # -------------------------------------------------------------------------------------------------------
    p_pirate = P('isl_tar_black', 0.07, [
        B('bottom', 0.0, 0.06, 'isl_hooked_sun', 'isl_mamuli_gold', 'isl_mangrove_red', 0.08),
    ], fabric='cloth.oilskin.tarred_seams')
    p_ark = P('isl_ark_white', 0.03, [B('bottom', 0.0, 0.03, 'isl_hooked_sun', 'isl_mamuli_gold', 'isl_ark_white', 0.06)], fabric='armor.ancient.hex_weave')
    h15_band = _open_brow_cap(f'isl_{sex}_lan_band_b', P('isl_mangrove_red', 0.07), f_brow=0.62, f_nape=0.22, f_top=1.14, ease=0.018)
    p_kn15, _ = _snap_to_part(h15_band, a + (b - a) * 0.35 + bk * 0.11, push=0.002)
    h15_tail = horn(f'isl_{sex}_lan_knot', [p_kn15, p_kn15 + bk * 0.045 - up * 0.085], 0.022, 0.008, P('isl_tar_black', 0.07), n=8, rows=5, rigid_joint='Head')
    entries.append(_isl_assemble(f'isl_{sex}_lan_bandana', 'Crimson & Tar-Black Shark-Tooth Corsair Bandana', 'head',
                                 [h15_band, h15_tail], covers_hair=True, covers_face=False))

    t15_bal = crossed_sash(f'isl_{sex}_lan_baldric', p_coir, width=0.072, ease=0.018)
    t15_armpad = sleeve(f'isl_{sex}_lan_armpad_R', R, p_coir, f0=0.0, f1=0.20, ease=0.011, flare=0.002, rows=5, n=18)
    t15_pld = pauldron(f'isl_{sex}_lan_ark_pld', R, p_ark)
    t15_belt = belt_sash(f'isl_{sex}_lan_belt', core.WAIST - 0.014, core.WAIST + 0.028, P('isl_mangrove_red', 0.06), ease=0.016)
    t15_parts = [t15_bal, t15_armpad, t15_pld, t15_belt]
    if is_f:
        kemban = torso_tube(f'isl_{sex}_lan_kemban', core.CHEST + 0.06, core.WAIST + 0.02, 0.015, P('isl_mangrove_red', 0.07, [B('top', 0.0, 0.04, 'isl_hinggi_ikat', 'isl_turmeric', 'isl_mangrove_red', 0.06)]), n=38, rows=9)
        t15_parts.insert(0, kemban)
    for idx_g, zg in enumerate(np.linspace(core.CHEST + 0.04, core.WAIST + 0.05, 3)):
        pg_c, ng_c = _snap_to_part(t15_bal, chest_front(zg, 0.020, x=-0.04 + 0.04 * idx_g), push=0.004)
        t15_parts.append(blob(f'isl_{sex}_lan_ranjgourd_{idx_g}', pg_c, (0.042, 0.036, 0.054), P('isl_kiln_clay', 0.05), n=10, rows=5, out=ng_c))
    entries.append(_isl_assemble(f'isl_{sex}_lan_vest', 'Ark-Scrap Pauldron & Ranjrum Gourd Bandolier', 'torso', t15_parts, open_torso=True))
    entries.append(_isl_assemble(f'isl_{sex}_lan_bracers', 'Spiked Tire-Rubber & Coir Boarding Bracers', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_lan_bracers', P('isl_tar_black', 0.08, fabric='rubber.tyre'), f0=0.32, f1=0.94, boss_paint=p_ark)))
    entries.append(_isl_assemble(f'isl_{sex}_lan_slops', 'Wide Striped Abaca Sea-Slops', 'legs',
                                 trousers(f'isl_{sex}_lan_slops', P('isl_tapa_sand', 0.08, [B('bottom', 0.0, 0.06, 'stripes', 'isl_mangrove_red', 'isl_tar_black', 0.04)], fabric='cloth.slops.abaca_stripe'),
                                          ease=0.015, cuff=core.KNEE - 0.05, bag=0.010), legged=True))
    entries.append(_isl_assemble(f'isl_{sex}_lan_sandals', 'Tarred Cordage Boarding Sandals', 'feet',
                                 sandal(f'isl_{sex}_lan_sandals', P('isl_tar_black', 0.08), P('isl_mangrove_red', 0.07), guard=True)))
    pad15, p_pad15 = _dorsal_pad(f'isl_{sex}_lan_grapnel', core.CHEST, (0.16, 0.05, 0.19), p_coir)
    coil15 = rosette(f'isl_{sex}_lan_rope', p_pad15 + BACK_DIR * 0.048, BACK_DIR, np.array([1.0, 0.0, 0.0]), 0.130, p_coir, n=18, thick=0.032, rigid_joint='Spine2')
    shank15 = tube(f'isl_{sex}_lan_shank', [p_pad15 + np.array([0.0, 0.065, -0.13]), p_pad15 + np.array([0.0, 0.065, 0.15])], 0.012, P('iron', 0.04, fabric='metal.iron'), n=8, rigid_joint='Spine2')
    entries.append(_isl_assemble(f'isl_{sex}_lan_grapnel', 'Boarding Grapnel & Braided Hawser Coil', 'back', [pad15, coil15, shank15]))

    # -------------------------------------------------------------------------------------------------------
    # I-16: `lan_hooked_captain` — Hooked-Sun Freebooter Quartermaster (Noah's Regret)
    # -------------------------------------------------------------------------------------------------------
    h16_crown = _open_brow_cap(f'isl_{sex}_capt_cr', p_pirate, f_brow=0.63, f_nape=0.28, f_top=1.14, ease=0.018)
    h16_brim = brim(f'isl_{sex}_capt_br', 0.65, 0.115, p_pirate, ease=0.011, rows=5, n=40, lift=0.045, scallop=0.22)
    p_b16, _ = _snap_to_part(h16_crown, a + (b - a) * 0.74 - bk * 0.11, push=0.003)
    h16_badge = rosette(f'isl_{sex}_capt_badge', p_b16, -bk, left, 0.026, p_gold, n=14, thick=0.008, rigid_joint='Head')
    entries.append(_isl_assemble(f'isl_{sex}_capt_hat', 'Cocked Tortoiseshell Tricorn & Gold Hooked-Sun Badge', 'head',
                                 [h16_crown, h16_brim, h16_badge], covers_hair=True, covers_face=False))

    t16_jack = torso_tube(f'isl_{sex}_capt_jack_b', core.TOP - 0.006, core.WAIST - 0.058, 0.023, p_pirate, n=42, rows=15)
    t16_slv = sleeves(f'isl_{sex}_capt_jack', 'wrist', 0.018, p_pirate)
    t16_gorg = collar_disc(f'isl_{sex}_capt_gorget', 0.11, p_ark, drop=0.085, rows=8, n=44, scallop=0.03, ease=0.020)
    t16_belt = belt_sash(f'isl_{sex}_capt_sash', core.WAIST - 0.014, core.WAIST + 0.030, P('isl_mangrove_red', 0.06), ease=0.026)
    entries.append(_isl_assemble(f'isl_{sex}_capt_jack', 'Hooked-Sun Brocade Jack & Ancient Alloy Gorget', 'torso',
                                 [t16_jack] + t16_slv + [t16_gorg, t16_belt]))
    entries.append(_isl_assemble(f'isl_{sex}_capt_gauntlets', 'Sharkskin-Cuffed Quartermaster Gauntlets', 'gloves',
                                 full_gloves(f'isl_{sex}_capt_gauntlets', p_shark, P('isl_tar_black', 0.06), knuckle_paint=p_gold)))
    entries.append(_isl_assemble(f'isl_{sex}_capt_breeches', 'Crimson Ikat & Tar-Canvas Sea-Breeches', 'legs',
                                 trousers(f'isl_{sex}_capt_breeches', P('isl_mangrove_red', 0.07, [B('bottom', 0.0, 0.06, 'isl_hinggi_ikat', 'isl_turmeric', 'isl_mangrove_red', 0.08)]),
                                          ease=0.015, cuff=core.ANKLE + 0.06, bag=0.008), legged=True))
    entries.append(_isl_assemble(f'isl_{sex}_capt_boots', 'Brass-Buckled Tarred Quartermaster Sea Boots', 'feet',
                                 boots(f'isl_{sex}_capt_boots', P('isl_tar_black', 0.07), p_pirate, top=0.52, cuff_paint=p_gold, ease_top=0.022)))
    entries.append(_isl_assemble(f'isl_{sex}_capt_cape', 'Tar-Black & Crimson Hooked-Sun Half-Cape', 'back',
                                 [cape(f'isl_{sex}_capt_cape', core.WAIST + 0.04, p_pirate, stiff=0.36, back_push=0.055)]))

    # -------------------------------------------------------------------------------------------------------
    # I-17: `isl_hero_ariki` — Ariki Nui of the Twin Drua / King of Kautoa (`0.00`, `important_npc`)
    # -------------------------------------------------------------------------------------------------------
    p_ariki_coir = P('isl_coir_tan', 0.07, [
        B('bottom', 0.0, 0.08, 'isl_shell_talent', 'isl_moon_ivory', 'isl_mamuli_gold', 0.06),
        B('top', 0.0, 0.05, 'isl_coir_tebutebu', 'isl_mamuli_gold', 'isl_coir_tan', 0.05),
    ], [PN(0.0, 1.0, 'isl_coir_tebutebu', 'isl_mamuli_gold', 'isl_coir_tan', 0.18)], fabric='straw.plaited')
    h17_bowl = _open_brow_cap(f'isl_{sex}_ariki_bowl', p_ariki_coir, f_brow=0.61, f_nape=0.06, f_top=1.14, ease=0.018)
    h17_band = crown_band(f'isl_{sex}_ariki_goldband', p_gold, f0=0.62, f1=0.73, ease=0.017, flare=0.006, rows=5, n=36)
    h17_crest = crest(f'isl_{sex}_ariki_crest', 0.115, P('isl_annatto', 0.04, [B('top', 0.0, 0.04, 'solid', 'isl_mamuli_gold')]),
                      rows=7, cols=17, a0=-0.95, a1=1.75, host_part=h17_bowl)
    pm17, _ = _snap_to_part(h17_band, a + (b - a) * 0.69 - bk * 0.115, push=0.003)
    h17_moon = rosette(f'isl_{sex}_ariki_moon', pm17, -bk, left, 0.028, p_nacre, n=16, thick=0.008, rigid_joint='Head')
    entries.append(_isl_assemble(f'isl_{sex}_ariki_helm', 'Ariki Nui Tropicbird-Crest & Gold Mamuli War-Helm', 'head',
                                 [h17_bowl, h17_band, h17_crest, h17_moon], covers_hair=True, covers_face=False))

    t17_cuir = torso_tube(f'isl_{sex}_ariki_cuir', core.TOP - 0.004, core.WAIST - 0.032, 0.025, p_ariki_coir, n=44, rows=15)
    t17_slv = sleeves(f'isl_{sex}_ariki_cuir', 'elbow', 0.018, p_hinggi_royal)
    t17_pld = [pauldron(f'isl_{sex}_ariki_pld_{s[0]}', s, p_gold) for s in (L, R)]
    t17_belt = belt_sash(f'isl_{sex}_ariki_girdle', core.WAIST - 0.012, core.WAIST + 0.032, p_gold, ease=0.028)
    t17_parts = [t17_cuir] + t17_slv + t17_pld + [t17_belt] + _kapkap_pectoral(f'isl_{sex}_ariki', t17_cuir, core.CHEST + 0.03, radius=0.076, tusk=True)
    entries.append(_isl_assemble(f'isl_{sex}_ariki_cuirass', 'Ariki Nui Golden-Coir Tebutebu & Royal Kapkap Cuirass', 'torso', t17_parts))
    entries.append(_isl_assemble(f'isl_{sex}_ariki_bracers', 'Gold-Bound Shark-Tooth & Shagreen Royal Vambraces', 'gloves',
                                 _wrist_wraps(f'isl_{sex}_ariki_bracers', p_shark, f0=0.25, f1=0.95, ease=0.014, boss_paint=p_gold)))
    entries.append(_isl_assemble(f'isl_{sex}_ariki_lavalava', 'Royal Hinggi & Talent-Coin Ceremonial Lava-Lava', 'legs',
                                 _lavalava_kilt(f'isl_{sex}_ariki_lavalava', p_hinggi_royal, core.ANKLE + 0.08, flare=0.090, front_sash_paint=p_gold)))
    entries.append(_isl_assemble(f'isl_{sex}_ariki_greaves', 'Golden-Coir & Tortoiseshell Royal Greave-Sandals', 'feet',
                                 _greave_sandals(f'isl_{sex}_ariki_greaves', P('isl_tortoise', 0.04), p_gold, p_ariki_coir, top_frac=0.74)))
    entries.append(_isl_assemble(f'isl_{sex}_ariki_mantle', 'Royal Kautoan Feather & White-Moon State Cloak', 'back',
                                 [cape(f'isl_{sex}_ariki_mantle', core.WAIST + 0.04, p_noble_cape, stiff=0.36, back_push=0.058)]))

    # -------------------------------------------------------------------------------------------------------
    # I-18: `lan_hero_admiral` — Hooked-Sun Catamaran Admiral (`0.00`, `important_npc`)
    # -------------------------------------------------------------------------------------------------------
    p_adm_jack = P('isl_mangrove_red', 0.05, [
        B('bottom', 0.0, 0.08, 'isl_hooked_sun', 'isl_mamuli_gold', 'isl_tar_black', 0.09),
        B('top', 0.0, 0.04, 'solid', 'isl_mamuli_gold'),
    ], [PN(0.0, 1.0, 'isl_hooked_sun', 'isl_mamuli_gold', 'isl_tar_black', 0.24)], fabric='cloth.oilskin.tarred_seams')
    h18_crown = _open_brow_cap(f'isl_{sex}_admiral_cr', p_adm_jack, f_brow=0.63, f_nape=0.26, f_top=1.14, ease=0.018)
    h18_brim = brim(f'isl_{sex}_admiral_br', 0.65, 0.130, P('isl_tar_black', 0.05), ease=0.012, rows=5, n=40, lift=0.055, scallop=0.25)
    h18_horns = _gonjong_horns(f'isl_{sex}_admiral', h18_crown, p_ark, spread=0.145, lift=0.085, thick=0.018)
    pb18, _ = _snap_to_part(h18_crown, a + (b - a) * 0.75 - bk * 0.115, push=0.003)
    h18_sun = rosette(f'isl_{sex}_admiral_cockade', pb18, -bk, left, 0.032, p_gold, n=16, thick=0.009, rigid_joint='Head')
    entries.append(_isl_assemble(f'isl_{sex}_admiral_hat', 'Catamaran Admiral Bicorne-Gonjong & Hooked-Sun Cockade', 'head',
                                 [h18_crown, h18_brim, h18_sun] + h18_horns, covers_hair=True, covers_face=False))

    t18_coat = torso_tube(f'isl_{sex}_admiral_coat', core.TOP - 0.005, core.WAIST - 0.058, 0.024, p_adm_jack, n=44, rows=15)
    t18_slv = sleeves(f'isl_{sex}_admiral_coat', 'wrist', 0.019, p_adm_jack)
    t18_pld = [pauldron(f'isl_{sex}_admiral_pld_{s[0]}', s, p_ark) for s in (L, R)]
    t18_gorg = collar_disc(f'isl_{sex}_admiral_gorget', 0.12, p_ark, drop=0.095, rows=8, n=46, scallop=0.04, ease=0.021)
    t18_bal = crossed_sash(f'isl_{sex}_admiral_baldric', p_gold, width=0.065, ease=0.027)
    t18_belt = belt_sash(f'isl_{sex}_admiral_belt', core.WAIST - 0.014, core.WAIST + 0.032, p_gold, ease=0.028)
    ps18, ns18 = _snap_to_part(t18_gorg, chest_front(core.CHEST + 0.05, 0.024), push=0.003)
    t18_med = rosette(f'isl_{sex}_admiral_sunmed', ps18, ns18, np.array([1.0, 0.0, 0.0]), 0.044, p_gold, n=16, thick=0.009)
    entries.append(_isl_assemble(f'isl_{sex}_admiral_jack', 'Hooked-Sun Admiral Jack & Salvaged Ancient Hull-Pauldrons', 'torso',
                                 [t18_coat] + t18_slv + t18_pld + [t18_gorg, t18_bal, t18_belt, t18_med]))
    entries.append(_isl_assemble(f'isl_{sex}_admiral_gauntlets', 'Ancient-White Alloy & Rayskin Admiral Gauntlets', 'gloves',
                                 full_gloves(f'isl_{sex}_admiral_gauntlets', p_ark, p_shark, knuckle_paint=p_gold, ring_paint=p_gold)))
    entries.append(_isl_assemble(f'isl_{sex}_admiral_breeches', 'Striped Abaca & Crimson Brocade Admiral Breeches', 'legs',
                                 trousers(f'isl_{sex}_admiral_breeches', p_adm_jack, ease=0.015, cuff=core.ANKLE + 0.06, bag=0.008), legged=True))
    entries.append(_isl_assemble(f'isl_{sex}_admiral_boots', 'Gold-Buckled Tarred Hull-Leather Admiral Jackboots', 'feet',
                                 boots(f'isl_{sex}_admiral_boots', P('isl_tar_black', 0.05), P('isl_tar_black', 0.05, [B('top', 0.0, 0.04, 'solid', 'isl_mamuli_gold')]),
                                       top=0.56, cuff_paint=p_ark, ease_top=0.022)))
    entries.append(_isl_assemble(f'isl_{sex}_admiral_cape', 'Hooked-Sun Catamaran Ark-Lord Boat-Cloak', 'back',
                                 [cape(f'isl_{sex}_admiral_cape', core.WAIST + 0.04, p_adm_jack, stiff=0.36, back_push=0.058)]))

    return entries


# ===========================================================================================================
# 4. LOCAL MANIFEST CROSS-SLOT CONFORMITY PASS (DOES NOT TOUCH SHARED `kit.json` OR `peoples.json`)
# ===========================================================================================================
def _write_glb_pos(glb_path, j_obj, raw_b, pos_acc_idx, P_f32):
    acc_m = j_obj['accessors'][pos_acc_idx]
    acc_m['min'] = [float(x) for x in P_f32.min(axis=0)]
    acc_m['max'] = [float(x) for x in P_f32.max(axis=0)]
    bv = j_obj['bufferViews'][acc_m['bufferView']]
    b_pos = np.ascontiguousarray(P_f32).tobytes()
    raw_b[bv['byteOffset']:bv['byteOffset'] + len(b_pos)] = b_pos
    js = json.dumps(j_obj, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(glb_path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(raw_b)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(raw_b), 0x004E4942) + bytes(raw_b))


def _conform_local_manifest_glbs(kit_entries, peoples_entry):
    """Conform closed boot shafts over paired legged trousers & dorsal capes over paired torso coats locally."""
    for sex_key, b_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        set_body(b_id)
        by_id = {e['id']: e for e in kit_entries if e.get('_body') == b_id}
        sh_y_gl = float(core.RIG.jpos[core.RIG.J['LeftArm']][1])
        p_foot_l = np.asarray(core.RIG.jpos[core.RIG.J['LeftFoot']], dtype=np.float64)
        p_knee_l = np.asarray(core.RIG.jpos[core.RIG.J['LeftLeg']], dtype=np.float64)
        p_foot_r = np.asarray(core.RIG.jpos[core.RIG.J['RightFoot']], dtype=np.float64)
        p_knee_r = np.asarray(core.RIG.jpos[core.RIG.J['RightLeg']], dtype=np.float64)

        for _, of in peoples_entry['outfits'][sex_key].items():
            l_id, ft_id = of.get('legs'), of.get('feet')
            t_id, bk_id = of.get('torso'), of.get('back')

            # 1. Closed boot shafts over legged trousers (`Gate 7`)
            if l_id in by_id and ft_id in by_id and by_id[l_id].get('legged') and by_id[ft_id].get('hides', 0) > 60:
                ft_glb = ROOT / by_id[ft_id]['glb']
                fj, fb = glbio.read_glb(ft_glb.read_bytes())
                at_f = fj['meshes'][0]['primitives'][0]['attributes']
                Pf = glbio.accessor(fj, fb, at_f['POSITION']).astype(np.float64).copy()
                Tf = glbio.accessor(fj, fb, fj['meshes'][0]['primitives'][0]['indices']).reshape(-1, 3)
                re_f = np.concatenate([Tf[:, 0], Tf[:, 1], Tf[:, 2]])
                ce_f = np.concatenate([Tf[:, 1], Tf[:, 2], Tf[:, 0]])
                nc_f, lbl_f = connected_components(csr_matrix((np.ones(len(re_f), dtype=np.int8), (re_f, ce_f)), shape=(len(Pf), len(Pf))), directed=False)
                shaft_m = np.zeros(len(Pf), dtype=bool)
                for cid in range(nc_f):
                    c_i = np.nonzero(lbl_f == cid)[0]
                    if float(Pf[c_i, 2].min()) < -0.02 and float(Pf[c_i, 2].max()) > 0.02 and len(c_i) >= 60:
                        shaft_m[c_i] = True
                if shaft_m.any():
                    lj, lb = glbio.read_glb((ROOT / by_id[l_id]['glb']).read_bytes())
                    Pl = glbio.accessor(lj, lb, lj['meshes'][0]['primitives'][0]['attributes']['POSITION']).astype(np.float64)
                    Tl = glbio.accessor(lj, lb, lj['meshes'][0]['primitives'][0]['indices']).reshape(-1, 3)
                    va, vb, vc = Pl[Tl[:, 0]], Pl[Tl[:, 1]], Pl[Tl[:, 2]]
                    L_surf = np.vstack([Pl, (va + vb + vc) / 3.0, 0.5 * (va + vb), 0.5 * (vb + vc), 0.5 * (vc + va)])
                    mod_ft = False
                    for sgn_x, p_ft, p_kn in ((1.0, p_foot_l, p_knee_l), (-1.0, p_foot_r, p_knee_r)):
                        ls_s = L_surf[L_surf[:, 0] * sgn_x > 0.01]
                        for vi in np.nonzero(shaft_m & (Pf[:, 0] * sgn_x > 0.01) & (Pf[:, 1] >= 0.095))[0]:
                            u_sh = float(np.clip((Pf[vi, 1] - p_ft[1]) / max(1e-4, p_kn[1] - p_ft[1]), 0.0, 1.0))
                            ax_c = p_ft + (p_kn - p_ft) * u_sh
                            dx, dz = float(Pf[vi, 0] - ax_c[0]), float(Pf[vi, 2] - ax_c[2])
                            rf = math.hypot(dx, dz)
                            if rf < 1e-5:
                                continue
                            nl = ls_s[np.abs(ls_s[:, 1] - Pf[vi, 1]) <= 0.022]
                            if len(nl):
                                dlx, dlz = nl[:, 0] - ax_c[0], nl[:, 2] - ax_c[2]
                                rl = np.hypot(dlx, dlz)
                                sec = ((dlx * (dx / rf) + dlz * (dz / rf)) / np.maximum(rl, 1e-6)) >= math.cos(0.38)
                                if sec.any():
                                    r_req = float(rl[sec].max()) + 0.0045
                                    if rf < r_req:
                                        Pf[vi, 0] = ax_c[0] + (dx / rf) * r_req
                                        Pf[vi, 2] = ax_c[2] + (dz / rf) * r_req
                                        mod_ft = True
                    if mod_ft:
                        _write_glb_pos(ft_glb, fj, bytearray(fb), at_f['POSITION'], Pf.astype(np.float32))

            # 2. Dorsal back capes over paired torso coats (`Gate 5B/5F`)
            if t_id in by_id and bk_id in by_id:
                bk_glb = ROOT / by_id[bk_id]['glb']
                bj, bb = glbio.read_glb(bk_glb.read_bytes())
                at_b = bj['meshes'][0]['primitives'][0]['attributes']
                Pb = glbio.accessor(bj, bb, at_b['POSITION']).astype(np.float64).copy()
                # Check if back piece is a dorsal cape (no positive-Z anterior vertices, wide X span)
                if float(Pb[:, 2].max()) < 0.02 and float(Pb[:, 0].max() - Pb[:, 0].min()) > 0.22 and float(Pb[:, 1].max()) >= sh_y_gl - 0.02:
                    tj, tb = glbio.read_glb((ROOT / by_id[t_id]['glb']).read_bytes())
                    Pt = glbio.accessor(tj, tb, tj['meshes'][0]['primitives'][0]['attributes']['POSITION']).astype(np.float64)
                    Tt = glbio.accessor(tj, tb, tj['meshes'][0]['primitives'][0]['indices']).reshape(-1, 3)
                    va, vb, vc = Pt[Tt[:, 0]], Pt[Tt[:, 1]], Pt[Tt[:, 2]]
                    T_back = np.vstack([Pt, (va + vb + vc) / 3.0, 0.5 * (va + vb), 0.5 * (vb + vc), 0.5 * (vc + va)])
                    T_back = T_back[T_back[:, 2] < 0.02]
                    if len(T_back):
                        mod_cp = False
                        for vi in range(len(Pb)):
                            vx, vy, vz = float(Pb[vi, 0]), float(Pb[vi, 1]), float(Pb[vi, 2])
                            near_t = T_back[(np.abs(T_back[:, 0] - vx) <= 0.032) & (np.abs(T_back[:, 1] - vy) <= 0.028)]
                            if len(near_t):
                                z_tb = float(np.percentile(near_t[:, 2], 8))
                                if vz > z_tb - 0.0075:
                                    Pb[vi, 2] = z_tb - 0.0085
                                    mod_cp = True
                                elif vy >= sh_y_gl - 0.17 and vz < z_tb - 0.026:
                                    Pb[vi, 2] = z_tb - 0.020
                                    mod_cp = True
                        if mod_cp:
                            _write_glb_pos(bk_glb, bj, bytearray(bb), at_b['POSITION'], Pb.astype(np.float32))


# ===========================================================================================================
# 5. COMPLETE 18-TIER `islanders` PEOPLES ENTRY & MANIFEST VALIDATOR
# ===========================================================================================================
ISLANDERS_TIERS = [
    ['kau_fisher_diver',     0.12],
    ['kau_salt_weaver',      0.08],
    ['kau_valapo_smith',     0.06],
    ['kau_shell_factor',     0.08],
    ['kau_tebutebu_guard',   0.08],
    ['shaman',               0.04],
    ['kau_marapu_noble',     0.05],
    ['west_rumah_planter',   0.09],
    ['west_master_carver',   0.06],
    ['west_korakora_marine', 0.07],
    ['west_moon_oracle',     0.04],
    ['het_exile_envoy',      0.04],
    ['het_shore_guerrilla',  0.04],
    ['huk_salvage_wright',   0.06],
    ['lan_sweep_raider',     0.06],
    ['lan_hooked_captain',   0.03],
    ['isl_hero_ariki',       0.00],
    ['lan_hero_admiral',     0.00],
]

ISLANDERS_TIER_LABELS = {
    'kau_fisher_diver':     'Kautoan Pearl Diver & Oruwa Paddler (Wai-Kautoa)',
    'kau_salt_weaver':      'NW Glasswort Soda-Burner & Indigo Hinggi Weaver',
    'kau_valapo_smith':     'Valapo Charcoal-Bloomery Ironwright & Drua Builder',
    'kau_shell_factor':     'Royal Shell-Mint Assessor & Izanitown Talent Broker',
    'kau_tebutebu_guard':   'Royal Kautoan Coconut-Coir Cuirassier & Koa Warrior (MC-05)',
    'shaman':               'Kiln-Mask Bell-Shaman (Ash-Spirit Caller)',
    'kau_marapu_noble':     'Uma Megalithic Patrician & Mamuli Ariki High Chief',
    'west_rumah_planter':   'Hikau Horned-Roof Clove Planter & Stilt Weaver',
    'west_master_carver':   'Kautono Proa Mariner & Wave Stick-Chart Navigator',
    'west_korakora_marine': 'Kora-Kora Galley Marine & Pencak Bladesman',
    'west_moon_oracle':     'Marae White-Moon Tapa Medium & Spirit-Caller',
    'het_exile_envoy':      'Exiled Kingdom of Hetanini Datu Chief & Ys Courtier',
    'het_shore_guerrilla':  'SW Throne Hetanini Shore Guerrilla & Ranj Runner',
    'huk_salvage_wright':   'Hook Hukoa Freighter-Stack Boatwright & Tin-Tarp Rigger',
    'lan_sweep_raider':     "Noah's Regret Lanong Sweep-Corsair",
    'lan_hooked_captain':   "Hooked-Sun Freebooter Quartermaster (Noah's Regret)",
    'isl_hero_ariki':       'Ariki Nui of the Twin Drua (King of Kautoa)',
    'lan_hero_admiral':     "Hooked-Sun Catamaran Admiral (Noah's Regret)",
}

_TIER_SPECS = [
    # (tier_id, head, torso, gloves, legs, feet, back, region, covers_face, char_type)
    ('kau_fisher_diver',     'diver_brim',       'diver_wrap',      'diver_cords',      'diver_maro',       'diver_sandals',   'diver_creel',      'kautoa',        False, None),
    ('kau_salt_weaver',      'weaver_headcloth', 'weaver_tunic',    'weaver_wraps',     'weaver_lavalava',  'weaver_sandals',  'weaver_skeins',    'kautoa',        False, None),
    ('kau_valapo_smith',     'smith_band',       'smith_apron',     'smith_bracers',    'smith_kilt',       'smith_boots',     'smith_adzepack',   'kautoa',        False, None),
    ('kau_shell_factor',     'factor_turban',    'factor_mantle',   'factor_cuffs',     'factor_sarong',    'factor_sandals',  'factor_ledger',    'kautoa',        False, None),
    ('kau_tebutebu_guard',   'guard_helm',       'guard_cuirass',   'guard_vambraces',  'guard_kilt',       'guard_greaves',   'guard_backshield', 'kautoa',        False, None),
    ('shaman',               'shaman_mask',      'shaman_mantle',   'shaman_cuffs',     'shaman_kilt',      'shaman_sandals',  'shaman_chimes',    'kautoa',        True,  None),
    ('kau_marapu_noble',     'noble_headdress',  'noble_robe',      'noble_bangles',    'noble_hinggi',     'noble_sandals',   'noble_cape',       'kautoa',        False, None),
    ('west_rumah_planter',   'rumah_tengkuluk',  'rumah_baju',      'rumah_wraps',      'rumah_sarong',     'rumah_sandals',   'rumah_pannier',    'west_isles',    False, None),
    ('west_master_carver',   'carver_cap',       'carver_vest',     'carver_cuffs',     'carver_breeches',  'carver_sandals',  'carver_chart',     'west_isles',    False, None),
    ('west_korakora_marine', 'marine_helm',      'marine_corslet',  'marine_bracers',   'marine_kilt',      'marine_greaves',  'marine_quiver',    'west_isles',    False, None),
    ('west_moon_oracle',     'oracle_crown',     'oracle_vestment', 'oracle_shells',    'oracle_skirt',     'oracle_sandals',  'oracle_streamer',  'west_isles',    False, None),
    ('het_exile_envoy',      'het_crown',        'het_coat',        'het_cuffs',        'het_sarong',       'het_shoes',       'het_mantle',       'hetanini',      False, None),
    ('het_shore_guerrilla',  'reb_hood',         'reb_harness',     'reb_bracers',      'reb_breeches',     'reb_boots',       'reb_gourds',       'hetanini',      True,  None),
    ('huk_salvage_wright',   'huk_cap',          'huk_jerkin',      'huk_gloves',       'huk_slops',        'huk_boots',       'huk_rigpack',      'hukoa_hook',    False, None),
    ('lan_sweep_raider',     'lan_bandana',      'lan_vest',        'lan_bracers',      'lan_slops',        'lan_sandals',     'lan_grapnel',      'lanong_pirate', False, None),
    ('lan_hooked_captain',   'capt_hat',         'capt_jack',       'capt_gauntlets',   'capt_breeches',    'capt_boots',      'capt_cape',        'lanong_pirate', False, None),
    ('isl_hero_ariki',       'ariki_helm',       'ariki_cuirass',   'ariki_bracers',    'ariki_lavalava',   'ariki_greaves',   'ariki_mantle',     'kautoa',        False, 'important_npc'),
    ('lan_hero_admiral',     'admiral_hat',      'admiral_jack',    'admiral_gauntlets','admiral_breeches', 'admiral_boots',   'admiral_cape',     'lanong_pirate', False, 'important_npc'),
]


def _islanders_outfits_for_sex(sex):
    out = {}
    for tid, h_s, t_s, g_s, l_s, f_s, b_s, reg, cov_f, ctype in _TIER_SPECS:
        d = {
            'head': f'isl_{sex}_{h_s}',
            'torso': f'isl_{sex}_{t_s}',
            'gloves': f'isl_{sex}_{g_s}',
            'legs': f'isl_{sex}_{l_s}',
            'feet': f'isl_{sex}_{f_s}',
            'back': f'isl_{sex}_{b_s}',
            'region': reg,
        }
        if cov_f:
            d['beard'] = None
        if ctype:
            d['type'] = ctype
        out[tid] = d
    return out


def build_islanders_peoples_entry():
    return {
        'id': 'islanders',
        'name': 'Ring Sea Islanders',
        'note': (
            'Austronesian-Polynesian & Sumba maritime peoples of the southern Ring Sea (1.93-2.0 atm; '
            'LORE.md S6.2, S6.12, S9; PROPOSAL-RING-ISLES.md): East Kautoan royal shell-mint kingdoms '
            '(hinggi ikat, tapa barkcloth, mamuli gold, coconut-coir tebutebu cuirassiers & beehive kiln-shamans), '
            'West Sikau/Hikau horned-roof kora-kora chiefdoms, exiled Hetanini courtiers & shore guerrillas, '
            'Hook Hukoa tin-tarp salvage boatwrights, and Noah\'s Regret Hooked-Sun Lanong freebooters '
            '(18 tiers at 100% M+F parity; tools/garments/cultures/islanders.py).'
        ),
        'ancestry': {
            'african': [0.20, 0.40],
            'asian': [0.40, 0.65],
            'caucasian': [0.05, 0.20],
        },
        'skin': ['#c4956a', '#b98a62', '#9c704b', '#7c5537'],
        'hair': ['#0f0c0a', '#1a1410', '#2a2018'],
        'eyes': ['#2a1a10', '#3b2414', '#4e311b'],
        'grey': 0.50,
        'beard': 0.25,
        'morph': {
            'weight': [0.0, 0.45],
            'muscle': [0.05, 0.55],
        },
        'styles': {
            'male': [
                'afro01', 'long01', 'culturalibre_hair_02',
                'punkduck_alpha7_long', 'Dreads_with_Fade', 'braided_curly_beads4',
            ],
            'female': [
                'punkduck_alpha7_curly', 'long01', 'afro01',
                'elvs_lady_hippy_hair', 'AfroPonytail', 'braided_curly_beads4',
            ],
        },
        'tiers': ISLANDERS_TIERS,
        'tier_labels': ISLANDERS_TIER_LABELS,
        'outfits': {
            'male': _islanders_outfits_for_sex('m'),
            'female': _islanders_outfits_for_sex('f'),
        },
    }


def build_islanders_kit():
    entries = []
    with islanders_motif_scope():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_all_tiers_for_sex(sex))
    return entries


build_islanders_wardrobe = build_islanders_kit


def _validate_manifest(kit_entries, peoples_entry):
    share_sum = sum(sh for _, sh in peoples_entry['tiers'])
    assert abs(share_sum - 1.0) < 1e-9, f'Islanders shares sum to {share_sum}, expected 1.000'
    assert len(kit_entries) == 216, f'Expected 216 pieces (108 M + 108 F), got {len(kit_entries)}'
    by_body_id = {}
    for ent in kit_entries:
        b_id, gid = ent.get('_body'), ent.get('id')
        assert b_id in ('mpfb_male', 'mpfb_female'), f'Invalid _body on {gid}: {b_id}'
        assert gid.startswith('isl_'), f'Piece {gid} must start with isl_'
        assert ent.get('culture') == 'islanders', f'Unexpected culture on {gid}'
        key = (b_id, gid)
        assert key not in by_body_id, f'Duplicate entry {key}'
        by_body_id[key] = ent
        glb_p = ROOT / ent['glb']
        morph_p = glb_p.with_suffix('.morph.bin')
        assert glb_p.exists() and glb_p.stat().st_size > 500, f'Missing GLB {glb_p}'
        assert morph_p.exists() and morph_p.stat().st_size > 64, f'Missing morph.bin {morph_p}'

    for sex_k, b_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        assert len(peoples_entry['outfits'][sex_k]) == 18
        for tid, of in peoples_entry['outfits'][sex_k].items():
            for sl in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                pid = of[sl]
                assert (b_id, pid) in by_body_id, f'Missing {b_id} piece {pid} in {tid}.{sl}'
                assert by_body_id[(b_id, pid)]['slot'] == sl


def main():
    t0 = time.perf_counter()
    kit_entries = build_islanders_kit()
    peoples_entry = build_islanders_peoples_entry()
    _conform_local_manifest_glbs(kit_entries, peoples_entry)
    _validate_manifest(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'islanders_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'islanders',
        'total_pieces': len(kit_entries),
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Ring Sea Islanders pieces ({n_m} male, {n_f} female) across 18 tiers in {dt:.2f}s.')
    print(f'Saved manifest -> {manifest_path}')


if __name__ == '__main__':
    main()
