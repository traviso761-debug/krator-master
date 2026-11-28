"""The Coyote Men Wardrobe Kit (`coyote_men` — Complete 12-Tier M+F Outlands Therian Wardrobe).

Grounded in `LORE.md` (§6.18, §10), `PROPOSAL-COYOTE-OUTLANDS.md` (§2.1), `biomes/outlands/PLAN.md` (§6),
and `kits/coyote/PLAN.md` (§1, §8, §12). Builds 144 procedural garments (`72` `mpfb_male` `coy_m_*` +
`72` `mpfb_female` `coy_f_*`) across all 12 canonical tiers of the Five *Hum*-Speaking Nations
(*Ham-Hau*, *Tong-Hau*, *Si-Hau*, *Kam-Hau*, *Lok-Hau*), Tierhound Gate-Wardens, *Hum* Contour-Singers,
and the Five-Fires Council Warleader (Coyote King):

  1. `ham_valley_kilim_weaver`      (`0.13`) — Ham-Hau Valley Nation kilim poncho, split kilt, loom batten
  2. `tong_sunrise_antelope_runner` (`0.12`) — Tong-Hau Sunrise Nation pronghorn harness (`open_torso`), ostrich bustle
  3. `si_sunset_canyon_tracker`     (`0.11`) — Si-Hau Sunset Nation canyon serape, open-seat chaps, clay gourd
  4. `kam_peak_bronze_delver`       (`0.10`) — Kam-Hau Peak Nation bronze-plate miner jerkin, ore hod
  5. `turquoise_mosaic_trader`      (`0.09`) — Outlands turquoise-and-jasper mosaic gorget & kilim coat
  6. `mesa_potter_mason`            (`0.08`) — cyContour bone-plaque wrap (`open_torso`), netted painted olla
  7. `prairie_lance_skirmisher`     (`0.10`) — Brine-quilted agave ichcahuipilli & twin ostrich standards
  8. `impactite_glass_duelist`      (`0.07`) — Black crater-impactite & red-jasper studded war-brigandine
  9. `lok_tierhound_gate_warden`    (`0.08`) — Lok-Hau Tierhound ear-notched bronze casquetel & scale cuirass
 10. `outlands_rifle_scout`         (`0.05`) — Si-Hau cartridge-bandolier serape, fringed leggings, powder horn
 11. `hum_contour_singer_priest`    (`0.04`) — Sacred Hum cantor (SOLE tier permitted barred roadrunner feathers!)
 12. `five_fires_council_warleader` (`0.03`) — Coyote King / Five-Fires Warleader (bronze/turquoise crown & great ostrich crest)

Strict Therian & Cultural Taboo Invariants Enforced:
  - Every `slot == 'head'` entry sets `entry['fits_beast'] = True`, `covers_face = False`, `covers_hair = True`,
    with `f >= 0.64` & `ease >= 0.019` (100% open snout/muzzle and lateral ear-root clearance for `mod_head_coyote`).
  - Zero gold / brass / yellow feathers anywhere (`no-golden-feathers` taboo): warriors wear black-and-white
    ostrich plumes; barred brown-and-white roadrunner feathers appear ONLY on `hum_contour_singer_priest`.
  - 100% tail-cleared lower hems & dorsal mounts (`mod_tail_coyote` sacrum root completely unobstructed).
  - Digitigrade-ready paw-open ankle-stirrups, wraps & hock-greaves (`hides == 4 <= 40`, furred paws visible).

Run standalone in manifest-only mode (does NOT edit shared kit.json or peoples.json):
    py -3 -u tools/garments/cultures/coyote_men.py
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
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment,
)
from garments.paint import P, B, PN, C
from garments.types.torso import (
    torso_tube, collar, collar_disc, cape, tabard, crossed_sash, pauldron,
)
from garments.types.limbs import sleeve, sleeves, limb_tube
from garments.types.headgear import brim, crown_band, fan, horn
from garments.types.accoutrements import blob, belt_sash, tube, rosette

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

# ===========================================================================================================
# 1. CANONICAL OUTLANDS COYOTE PALETTE (`coy_*` linear RGB — STRICTLY ZERO GOLD!) & MOTIFS
# ===========================================================================================================
COY_COLORS = {
    'coy_turq':        (0.023, 0.349, 0.293),  # Outlands turquoise (#2E9E92)
    'coy_jasper':      (0.349, 0.029, 0.013),  # Cabochon red jasper (#9E3324)
    'coy_impactite':   (0.010, 0.011, 0.015),  # Vitreous black crater-impactite glass (#1C1E22)
    'coy_agave':       (0.587, 0.524, 0.349),  # Spun agave & desert cotton (#C8BE9E)
    'coy_cotton_wht':  (0.865, 0.840, 0.775),  # Bleached sanctuary desert cotton
    'coy_cochineal':   (0.276, 0.007, 0.021),  # Prickly-pear cochineal crimson (#8E1B2C)
    'coy_indigo':      (0.018, 0.036, 0.115),  # Deep canyon indigo
    'coy_bronze':      (0.485, 0.235, 0.095),  # Reddish cast Outlands Cu-Sn bronze (zero yellow gold!)
    'coy_verdigris':   (0.115, 0.385, 0.285),  # Malachite & verdigris bronze patina
    'coy_silver':      (0.740, 0.755, 0.780),  # Cupelled silver
    'coy_buckskin':    (0.520, 0.355, 0.195),  # Smoke-tanned pronghorn buckskin
    'coy_rawhide':     (0.365, 0.225, 0.120),  # Brine-hardened buffalo rawhide
    'coy_soot_hide':   (0.080, 0.062, 0.050),  # Soot-darkened Kam-Hau miner buffalo hide
    'coy_ochre_red':   (0.440, 0.115, 0.048),  # Si-Hau Sunset canyon red-ochre
    'coy_bone':        (0.855, 0.820, 0.735),  # Incised cyContour bone & chalk-white ostrich plume
    'coy_ostrich_blk': (0.020, 0.020, 0.024),  # Glossy black ostrich plume
    'coy_runner_umb':  (0.195, 0.125, 0.078),  # Priest-only barred roadrunner umber
    'coy_mesquite':    (0.245, 0.135, 0.075),  # Fire-hardened mesquite wood
}

_PAT_DIR = REPO_ROOT / 'core' / 'materials' / 'patterns'
_COY_TEX_PATHS = {
    'kilim':           _PAT_DIR / 'coyote' / 'kilim' / 'albedo.jpg',
    'frieze':          _PAT_DIR / 'coyote' / 'frieze' / 'albedo.jpg',
    'turq_mosaic':     _PAT_DIR / 'coyote' / 'turquoise-mosaic' / 'albedo.jpg',
    'runner_weave':    _PAT_DIR / 'coyote' / 'turquoise-runner-weave' / 'albedo.jpg',
    'jasper_brig':     _PAT_DIR / 'coyote' / 'impactite-jasper-brigandine' / 'albedo.jpg',
    'roadrunner_band': _PAT_DIR / 'coyote' / 'runner-feather-band' / 'albedo.jpg',
    'hum_carving':     _PAT_DIR / 'korona' / 'hum-carving' / 'albedo.jpg',
    'hum_pitcher':     _PAT_DIR / 'korona' / 'hum-contour-pitcher' / 'albedo.jpg',
}
_COY_TEX_CACHE = {}

COY_CUSTOM_MOTIFS = {
    'coy_step_kilim',
    'coy_lightning_step',
    'coy_turq_mosaic',
    'coy_bronze_frieze',
    'coy_hum_contour',
    'coy_jasper_brigandine',
    'coy_bronze_scale',
    'coy_ostrich_plume',
    'coy_priest_roadrunner',
}


def _load_coy_tex(key, W, H, fg, bg, blend=0.30):
    if key not in _COY_TEX_CACHE:
        arr = None
        p = _COY_TEX_PATHS.get(key)
        if p is not None:
            rp = paint_mod._resolve_lfs(p)
            if rp.exists() and rp.stat().st_size > 500:
                try:
                    px = np.asarray(Image.open(rp).convert('RGB'), dtype=np.float32) / 255.0
                    arr = np.power(np.clip(px, 0.0, 1.0), 2.2)
                except Exception:
                    arr = None
        _COY_TEX_CACHE[key] = arr
    src = _COY_TEX_CACHE[key]
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


def _coy_custom_motif(style, w, h, fg, bg, aspect=1.0):
    base = style.split(':')[0]
    H, W = max(int(h), 1), max(int(w), 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H
    fg_a = np.asarray(fg, dtype=np.float64)
    bg_a = np.asarray(bg, dtype=np.float64)

    if base == 'coy_step_kilim':
        # Ancestral Puebloan / Ham-Hau 4-step mesa terrace kilim (cochineal, turquoise, indigo, agave — zero gold)
        nx = max(3.0, round(6.0 * max(aspect, 0.5)))
        gu = np.abs(((u * nx) % 1.0 - 0.5) * 2.0)
        gv = np.abs(((v * 2.0) % 1.0 - 0.5) * 2.0)
        step = np.floor(gu * 4.0) / 4.0
        terrace = gv < (0.85 - 0.65 * step)
        inner = gv < (0.52 - 0.55 * step)
        img[terrace] = fg_a
        img[inner] = C['coy_turq']
        tex = _load_coy_tex('kilim', W, H, fg_a, bg_a, blend=0.30)
        img = 0.45 * img + 0.55 * tex

    elif base == 'coy_lightning_step':
        # Tong-Hau Sunrise forked canyon-lightning & stepped mesa terrace
        nx = max(4.0, round(8.0 * max(aspect, 0.5)))
        zig = np.abs(((u * nx + 0.55 * v * 3.0) % 1.0 - 0.5) * 2.0)
        bolt = zig < 0.24
        turq_edge = (zig >= 0.24) & (zig < 0.36)
        img[bolt] = fg_a
        img[turq_edge] = C['coy_turq']
        tex = _load_coy_tex('runner_weave', W, H, fg_a, bg_a, blend=0.34)
        img = 0.52 * img + 0.48 * tex

    elif base == 'coy_turq_mosaic':
        tex = _load_coy_tex('turq_mosaic', W, H, fg_a, bg_a, blend=0.25)
        nx = max(6.0, round(12.0 * max(aspect, 0.5)))
        ny = max(4.0, round(8.0 / max(aspect, 0.5)))
        gu = ((u * nx) % 1.0)
        gv = ((v * ny) % 1.0)
        grout = (gu < 0.10) | (gv < 0.12)
        jasper_cell = ((np.floor(u * nx).astype(int) + np.floor(v * ny).astype(int)) % 5) == 0
        img[:] = tex
        img[jasper_cell & (~grout)] = C['coy_jasper']
        img[grout] = C['coy_impactite']

    elif base == 'coy_bronze_frieze':
        img[:] = _load_coy_tex('frieze', W, H, fg_a, bg_a, blend=0.32)
        rim = (v < 0.10) | (v > 0.90)
        img[rim] = C['coy_verdigris']

    elif base == 'coy_hum_contour':
        # Carved cyContour wave-lines (tongues-of-krator Hum contour script)
        tex = _load_coy_tex('hum_carving', W, H, fg_a, bg_a, blend=0.34)
        wave1 = np.abs(((v * 4.0 + 0.22 * np.sin(u * 2.0 * math.pi * 5.0)) % 1.0) - 0.5) < 0.12
        img[:] = tex
        img[wave1] = fg_a

    elif base == 'coy_jasper_brigandine':
        tex = _load_coy_tex('jasper_brig', W, H, fg_a, bg_a, blend=0.26)
        nx = max(5.0, round(10.0 * max(aspect, 0.5)))
        ny = max(5.0, round(10.0 / max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        disc = np.hypot(gu, gv) < 0.52
        jasp = np.hypot(gu, gv) < 0.20
        img[:] = tex
        img[disc] = C['coy_impactite']
        img[jasp] = C['coy_jasper']

    elif base == 'coy_bronze_scale':
        # Cast Outlands reddish bronze & green verdigris overlapping scales (zero gold)
        nx = max(6.0, round(12.0 * max(aspect, 0.5)))
        ny = max(5.0, round(10.0 / max(aspect, 0.5)))
        ri = np.floor(v * ny).astype(int)
        ci = np.floor(u * nx + 0.5 * (ri % 2)).astype(int)
        gu = ((u * nx + 0.5 * (ri % 2)) % 1.0 - 0.5) * 2.0
        gv = (v * ny) % 1.0
        arc = np.hypot(gu * 0.92, (gv - 0.35) * 1.25)
        is_verd = ((ri + ci) % 4) == 0
        base_c = np.where(is_verd[..., None], np.asarray(C['coy_verdigris']), bg_a)
        rim = (arc > 0.68) & (arc < 0.86) & (gv > 0.24)
        img[:] = base_c * (0.80 + 0.24 * (1.0 - np.abs(gu)))[:, :, None]
        img[rim] = C['coy_soot_hide']

    elif base == 'coy_ostrich_plume':
        # Taboo-safe black-and-white warrior ostrich plumage (ZERO yellow/gold!)
        barb = 0.85 + 0.15 * np.sin((v * 28.0 - np.abs(u - 0.5) * 14.0) * math.pi)
        tip_blk = v < 0.42
        shaft = np.abs(u - 0.5) < 0.045
        c_pl = np.where(tip_blk[..., None], np.asarray(C['coy_ostrich_blk']), np.asarray(C['coy_bone']))
        img[:] = c_pl * barb[:, :, None]
        img[shaft] = C['coy_bone']

    elif base == 'coy_priest_roadrunner':
        # SOLE priest motif (`hum_contour_singer_priest`): barred dark-umber & chalk-white roadrunner feathers
        tex = _load_coy_tex('roadrunner_band', W, H, C['coy_bone'], C['coy_runner_umb'], blend=0.22)
        bars = (((v * 9.0) % 1.0) < 0.45)
        proc = np.where(bars[..., None], np.asarray(C['coy_bone']), np.asarray(C['coy_runner_umb']))
        img[:] = 0.35 * proc + 0.65 * tex

    return np.clip(img, 0.0, 1.0)


@contextmanager
def coyote_motif_scope():
    orig_motif = paint_mod.motif
    added = []
    for k, val in COY_COLORS.items():
        if k not in C:
            C[k] = val
            added.append(k)

    def _wrapped(style, w, h, fg, bg, aspect=1.0):
        base = style.split(':')[0] if isinstance(style, str) else ''
        if base in COY_CUSTOM_MOTIFS:
            return _coy_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped
    try:
        yield
    finally:
        paint_mod.motif = orig_motif
        for k in added:
            C.pop(k, None)


def _coy_assemble(gid, label, slot, parts, open_torso=False, legged=False):
    """Compile a Coyote Men piece and enforce `fits_beast=True, covers_face=False, covers_hair=True` on `head`."""
    is_head = (slot == 'head')
    ent = assemble_garment(
        gid, label, slot, 'coyote_men', parts,
        covers_hair=is_head,
        covers_face=False,
        open_torso=open_torso,
        legged=legged,
    )
    if is_head:
        ent['fits_beast'] = True
    return ent


# ===========================================================================================================
# 2. BEAST-HEAD, TAIL-CLEARED & PAW-OPEN GEOMETRY PRIMITIVES (`mod_head_coyote` & `mod_tail_coyote`)
# ===========================================================================================================
def _snap_to_part(host_part, target_pt, push=0.002):
    P_flat = host_part.P.reshape(-1, 3)
    tgt = np.asarray(target_pt, dtype=np.float64)
    idx = int(np.argmin(np.linalg.norm(P_flat - tgt[None, :], axis=1)))
    p = P_flat[idx].copy()
    c_ref = spine_at(min(max(float(p[2]), core.CROTCH), core.TOP)) if p[2] < core.NECK[2] + 0.02 else core.HEAD
    nrm = np.array([p[0] - c_ref[0], p[1] - c_ref[1], 0.0], dtype=np.float64)
    L_n = float(np.linalg.norm(nrm))
    nrm = (nrm / L_n) if L_n > 1e-5 else FRONT.copy()
    return p + nrm * float(push), nrm


def _coyote_brow_circlet(name, paint, f0=0.65, f1=0.74, ease=0.020, flare=0.004):
    """Beast-fitted brow fillet/diadem at `f in [0.64, 0.75]` (`ease >= 0.019`):
    - Clears the canine muzzle completely (`muzzle <= f=0.42`, `covers_face=False`).
    - Stays strictly below the upright coyote ear bases (`f_ear_base ~ 0.78`)."""
    return crown_band(name, paint, f0=f0, f1=f1, ease=max(float(ease), 0.019), flare=flare, rows=6, n=36)


def _coyote_ear_notched_casque(name, paint, ease=0.020, rows=10, n=40):
    """Sculpted Outlands bronze/rawhide war-casquetel for `mod_head_coyote`:
    - Open front brow at `f = 0.65` (100% open snout & eyes).
    - Deep lateral ear-arch cutouts (`f_top = 0.74` around `|sin(an)| > 0.36`) so tall coyote ears stand completely free!
    - Central sagittal ridge & occipital neck-guard rising to `f_top = 0.96` between the ears."""
    a, b, up, bk, left = head_frame()
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angs]
    e_use = max(float(ease), 0.019)
    f_bot = np.zeros(n, dtype=np.float64)
    f_top = np.zeros(n, dtype=np.float64)
    for j, an in enumerate(angs):
        # an = pi is front (-bk); an = 0 is back (+bk); an = +-pi/2 are lateral ears
        front_w = 0.5 + 0.5 * math.cos(an - math.pi)
        ear_w = math.sin(an) ** 2
        f_bot[j] = 0.34 + 0.31 * (front_w ** 0.85)          # 0.65 in front, 0.34 at nape
        f_top[j] = 0.95 - 0.21 * (ear_w ** 1.25)            # 0.95 sagittal ridge, 0.74 under lateral ear bases!
    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for i in range(rows):
        u = i / float(rows - 1)
        for j, d in enumerate(ds):
            f_ij = f_bot[j] + (f_top[j] - f_bot[j]) * u
            c_ray = a + (b - a) * min(max(f_ij, 0.34), 0.90)
            h_hit = first_hit(c_ray, d)
            r_ij = (float(h_hit) if h_hit is not None else 0.096) + e_use
            Q[i, j] = (a + (b - a) * f_ij) + d * r_ij
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _sagittal_plume(gid, host_head, paint_plume, height=0.14, tilt_bk=0.05):
    """Rear/midline plume mounted at `x=0` between & behind the upright coyote ears."""
    a, b, up, bk, _ = head_frame()
    p0, _ = _snap_to_part(host_head, a + (b - a) * 0.72 + bk * 0.10, push=-0.002)
    p1 = p0 + up * (height * 0.55) + bk * (tilt_bk * 0.5)
    p2 = p0 + up * height + bk * tilt_bk
    return horn(f'{gid}_plume', [p0, p1, p2], 0.018, 0.005, paint_plume, n=10, rows=7, rigid_joint='Head')


def _tail_clear_split_kilt(gid, paint_band, paint_apron, paint_hip=None, z_apron_bot=None):
    """100% Tail-Cleared Outlands Split Kilt / Breechclout:
    - Closed upper waist-hip band at `[WAIST - 0.050, WAIST - 0.008]` sits strictly ABOVE `mod_tail_coyote`'s
      sacrum root (`HIPS[2] + 0.045 ~ WAIST - 0.068`) while giving `make_mpfb.covered()` clean pelvic hide triangles.
    - Front woven breechclout (`tabard(front=True, back=False)`) + paired lateral hip panels (`arc` leaving the
      rear `[-0.42*pi, +0.42*pi]` tail channel 100% open so the brush tail swings freely!)."""
    z_top = core.WAIST - 0.008
    z_band_bot = max(core.WAIST - 0.050, core.HIPS[2] + 0.056)
    z_bot = z_apron_bot if z_apron_bot is not None else (core.KNEE + 0.08)
    hip_p = paint_hip or paint_apron
    girdle = torso_tube(f'{gid}_girdle', z_top, z_band_bot, 0.020, paint_band, n=40, rows=5, hull_from=z_top)
    front_ap = tabard(f'{gid}_breech_front', z_bot, z_band_bot + 0.006, paint_apron, width=0.19, ease=0.028, front=True, back=False)
    hip_l = torso_tube(f'{gid}_hip_L', z_band_bot + 0.005, z_bot + 0.04, 0.025, hip_p, n=14, rows=12,
                       arc=(0.42 * math.pi, 0.82 * math.pi), hang_from=z_band_bot, flare=0.055)
    hip_r = torso_tube(f'{gid}_hip_R', z_band_bot + 0.005, z_bot + 0.04, 0.025, hip_p, n=14, rows=12,
                       arc=(-0.82 * math.pi, -0.42 * math.pi), hang_from=z_band_bot, flare=0.055)
    return [girdle, front_ap, hip_l, hip_r]


def _tail_clear_chaps(gid, paint_belt, paint_leg, ankle_frac=0.55):
    """Open-seat canyon tracker chaps: snug high waist belt above sacrum tail-root + per-thigh buckskin tubes (`legged=True`)."""
    z_top = core.WAIST - 0.008
    z_belt_bot = max(core.WAIST - 0.048, core.HIPS[2] + 0.058)
    pts = [torso_tube(f'{gid}_waist_strap', z_top, z_belt_bot, 0.012, paint_belt, n=38, rows=4, role='trunk')]
    for s in (L, R):
        hip_j, knee_j, foot_j = J(s + 'UpLeg'), J(s + 'Leg'), J(s + 'Foot')
        end_pt = knee_j + (foot_j - knee_j) * float(ankle_frac)
        pts.append(limb_tube(f'{gid}_chap_{s[0]}', None, None, 0.014, paint_leg, n=20, rows=12,
                             ease_end=0.012, start_back=0.02, path=[hip_j, knee_j, end_pt], rmax=0.20, role='leg', side=s[0]))
    return pts


def _paw_open_greaves(gid, paint_main, paint_trim=None, f_bot=0.08, f_top=0.58, ease=0.009):
    """Digitigrade-ready toe-less, heel-open ankle-stirrups / shin-wraps / hock-greaves (`hides == 4 <= 40`
    because no `foot_us` box is emitted — `coats.coyote` furred paws & claws stay 100% visible!)."""
    pts = []
    for s in (L, R):
        foot_j, knee_j = J(s + 'Foot'), J(s + 'Leg')
        p0 = foot_j + (knee_j - foot_j) * float(f_bot)
        p1 = foot_j + (knee_j - foot_j) * float(f_top)
        sh = limb_tube(f'{gid}_shin_{s[0]}', p0, p1, ease, paint_main, n=18, rows=8,
                       ease_end=ease + 0.002, rmax=0.125, role='band', side=s[0])
        sh.P[:, :, 2] = np.maximum(sh.P[:, :, 2], 0.022)
        pts.append(sh)
        if paint_trim is not None:
            c_top = p1 - (p1 - p0) * 0.14
            tr = limb_tube(f'{gid}_cuff_{s[0]}', c_top, p1, ease + 0.004, paint_trim, n=18, rows=3, rmax=0.13, role='band', side=s[0])
            tr.P[:, :, 2] = np.maximum(tr.P[:, :, 2], 0.025)
            pts.append(tr)
    return pts


def _wrist_bracers(gid, paint_main, f0=0.36, f1=0.92, ease=0.010, boss_paint=None):
    pts = []
    for s in (L, R):
        br = sleeve(f'{gid}_bracer_{s[0]}', s, paint_main, f0=f0, f1=f1, ease=ease, flare=0.004, rows=7, n=18)
        pts.append(br)
        if boss_paint is not None:
            e_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
            pb, nb = _snap_to_part(br, e_j + (h_j - e_j) * 0.68 + np.array([0.0, 0.0, 0.032]), push=0.003)
            b_pt = blob(f'{gid}_gem_{s[0]}', pb, (0.024, 0.013, 0.026), boss_paint, n=10, rows=5, out=nb, rigid_joint=s + 'ForeArm')
            b_pt.is_arm = True
            pts.append(b_pt)
    return pts


def _dorsal_pad(gid, z_center=None, size=(0.16, 0.050, 0.19), paint=None):
    zc = z_center if z_center is not None else (core.CHEST + 0.02)
    p_pad = surface_out(spine_at(zc), BACK_DIR, 0.014, bvh=core.BVH_T)
    pad = blob(f'{gid}_dorsal_pad', p_pad, size, paint or P('coy_buckskin', 0.08, fabric='leather.buckskin'),
               n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, p_pad


# ===========================================================================================================
# 3. ALL 12 COYOTE MEN TIER BUILDERS (`mpfb_male` & `mpfb_female` PARITY)
# ===========================================================================================================
def _build_all_coyote_tiers(sex):
    entries = []
    is_f = (sex == 'f')
    a, b, up, bk, left = head_frame()

    p_turq = P('coy_turq', 0.03, [B('bottom', 0.0, 0.05, 'coy_turq_mosaic', 'coy_jasper', 'coy_turq', 0.04)], fabric='beads.glass')
    p_jasper = P('coy_jasper', 0.04, fabric='leather.polished')
    p_bronze = P('coy_bronze', 0.04, [B('bottom', 0.0, 0.04, 'coy_bronze_frieze', 'coy_verdigris', 'coy_bronze', 0.06)], fabric='metal.bronze')
    p_verd = P('coy_verdigris', 0.05, fabric='metal.bronze.verdigris')
    p_silver = P('coy_silver', 0.03, fabric='metal.paktong.brushed')
    p_buck = P('coy_buckskin', 0.08, fabric='leather.buckskin')
    p_raw = P('coy_rawhide', 0.08, fabric='leather.cuir_bouilli')
    p_agave = P('coy_agave', 0.09, [B('bottom', 0.0, 0.07, 'coy_step_kilim', 'coy_cochineal', 'coy_agave', 0.09)], fabric='cloth.weave.burlap')
    p_kilim_red = P('coy_cochineal', 0.07, [
        B('bottom', 0.0, 0.12, 'coy_step_kilim', 'coy_turq', 'coy_indigo', 0.12),
    ], [PN(0.0, 1.0, 'coy_step_kilim', 'coy_agave', 'coy_cochineal', 0.24)], fabric='cloth.wool')
    p_ostrich = P('coy_bone', 0.04, [], [PN(0.0, 1.0, 'coy_ostrich_plume', 'coy_ostrich_blk', 'coy_bone', 0.14)])

    # -------------------------------------------------------------------------------------------------------
    # C-1: `ham_valley_kilim_weaver` — Ham-Hau Valley Nation Kilim Weaver
    # -------------------------------------------------------------------------------------------------------
    h1_band = _coyote_brow_circlet(f'coy_{sex}_valley_hb', p_turq, f0=0.65, f1=0.73, ease=0.020)
    h1_brim = brim(f'coy_{sex}_valley_brim', 0.66, 0.095, p_agave, ease=0.020, rows=5, n=38, droop=0.018)
    entries.append(_coy_assemble(f'coy_{sex}_valley_sunbrim', 'Ham-Hau Yucca & Turquoise Ear-Clear Sun-Brim', 'head', [h1_band, h1_brim]))

    t1_poncho = torso_tube(f'coy_{sex}_valley_poncho_b', core.TOP - 0.008, core.WAIST - 0.025, 0.023, p_kilim_red, n=42, rows=14)
    t1_col = collar_disc(f'coy_{sex}_valley_col', 0.10, p_turq, drop=0.075, rows=8, n=44, scallop=0.05, ease=0.020)
    entries.append(_coy_assemble(f'coy_{sex}_valley_poncho', 'Waist-Cropped Stepped-Mesa Kilim Poncho', 'torso', [t1_poncho, t1_col]))
    entries.append(_coy_assemble(f'coy_{sex}_valley_wraps', 'Woven Agave & Turquoise Weaver Wraps', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_valley_wraps', p_agave, f0=0.48, f1=0.92, boss_paint=p_turq)))
    entries.append(_coy_assemble(f'coy_{sex}_split_kilt', 'Tail-Cleared Ham-Hau Kilim Split-Kilt', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_split_kilt', p_turq, p_kilim_red, p_agave)))
    entries.append(_coy_assemble(f'coy_{sex}_turquoise_anklets', 'Toe-Less Turquoise & Buckskin Stirrup-Anklets', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_turquoise_anklets', p_agave, p_turq, f_bot=0.08, f_top=0.38)))
    pad1, p_pad1 = _dorsal_pad(f'coy_{sex}_loom_batten_sling', core.CHEST + 0.02, (0.16, 0.048, 0.19), p_buck)
    bat1 = tube(f'coy_{sex}_loom_batten', [p_pad1 + np.array([-0.14, 0.052, -0.14]), p_pad1 + np.array([0.14, 0.052, 0.17])], 0.018, P('coy_mesquite', 0.06), n=10, rigid_joint='Spine2')
    skein1 = blob(f'coy_{sex}_loom_skein', p_pad1 + BACK_DIR * 0.060, (0.14, 0.09, 0.18), p_kilim_red, n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_loom_batten_sling', 'Mesquite Backstrap-Loom Batten & Yarn Skein', 'back', [pad1, bat1, skein1]))

    # -------------------------------------------------------------------------------------------------------
    # C-2: `tong_sunrise_antelope_runner` — Tong-Hau Sunrise Pronghorn Runner
    # -------------------------------------------------------------------------------------------------------
    p_sunrise = P('coy_buckskin', 0.07, [B('bottom', 0.0, 0.07, 'coy_lightning_step', 'coy_cochineal', 'coy_buckskin', 0.08)], fabric='leather.buckskin')
    h2_fil = _coyote_brow_circlet(f'coy_{sex}_sunrise_fb', p_sunrise, f0=0.65, f1=0.74, ease=0.0195)
    h2_pl = _sagittal_plume(f'coy_{sex}_sunrise', h2_fil, p_ostrich, height=0.135, tilt_bk=0.055)
    entries.append(_coy_assemble(f'coy_{sex}_sunrise_fillet', 'Pronghorn Brow-Fillet & Ostrich Plume', 'head', [h2_fil, h2_pl]))

    t2_sash1 = crossed_sash(f'coy_{sex}_sunrise_sashL', p_sunrise, width=0.065, ease=0.017)
    t2_belt = belt_sash(f'coy_{sex}_sunrise_belt', core.WAIST - 0.008, core.WAIST + 0.026, p_turq, ease=0.018)
    t2_parts = [t2_sash1, t2_belt]
    if is_f:
        crop2 = torso_tube(f'coy_{sex}_sunrise_crop', core.CHEST + 0.055, core.WAIST + 0.03, 0.015, p_sunrise, n=38, rows=8)
        t2_parts.insert(0, crop2)
    ps2, ns2 = _snap_to_part(t2_parts[0], chest_front(core.CHEST + 0.02, 0.018), push=0.003)
    t2_parts.append(rosette(f'coy_{sex}_sunrise_boss', ps2, ns2, np.array([1.0, 0.0, 0.0]), 0.040, p_turq, n=14, thick=0.008))
    entries.append(_coy_assemble(f'coy_{sex}_sunrise_harness', 'Pronghorn Chest-Harness & Turquoise Boss', 'torso', t2_parts, open_torso=True))
    entries.append(_coy_assemble(f'coy_{sex}_sinew_wristguards', 'Braided Sinew & Bone Archer Wrist-Guards', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_sinew_wristguards', p_buck, f0=0.45, f1=0.94, boss_paint=P('coy_bone', 0.04))))
    entries.append(_coy_assemble(f'coy_{sex}_buckskin_breechclout', 'Tail-Clear Pronghorn Buckskin Breechclout', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_buckskin_breechclout', p_sunrise, p_buck, p_sunrise, z_apron_bot=core.KNEE + 0.12)))
    entries.append(_coy_assemble(f'coy_{sex}_prairie_shin_wraps', 'Open-Paw Buckskin Prairie Shin-Wraps', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_prairie_shin_wraps', p_buck, p_turq, f_bot=0.08, f_top=0.52)))
    pad2, p_pad2 = _dorsal_pad(f'coy_{sex}_ostrich_bustle_quiver', core.CHEST + 0.02, (0.16, 0.048, 0.19), p_buck)
    qv2 = tube(f'coy_{sex}_runner_qv', [p_pad2 + np.array([-0.04, 0.055, -0.12]), p_pad2 + np.array([0.07, 0.058, 0.16])], 0.038, p_sunrise, n=12, rigid_joint='Spine2')
    bus2 = fan(f'coy_{sex}_ostrich_bustle', 0.012, 0.18, 0.85, p_ostrich, rows=7, cols=13,
               center=p_pad2 + BACK_DIR * 0.020, up_vec=np.array([0.0, 0.25, 0.96]), side_vec=np.array([1.0, 0.0, 0.0]), rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_ostrich_bustle_quiver', 'Black-and-White Ostrich Bustle & Quiver', 'back', [pad2, qv2, bus2]))

    # -------------------------------------------------------------------------------------------------------
    # C-3: `si_sunset_canyon_tracker` — Si-Hau Sunset Canyon Tracker
    # -------------------------------------------------------------------------------------------------------
    p_canyon = P('coy_ochre_red', 0.08, [B('bottom', 0.0, 0.08, 'coy_step_kilim', 'coy_indigo', 'coy_ochre_red', 0.09)], fabric='cloth.wool')
    h3_band = _coyote_brow_circlet(f'coy_{sex}_canyon_vis', p_canyon, f0=0.65, f1=0.75, ease=0.020)
    pn3, _ = _snap_to_part(h3_band, a + (b - a) * 0.66 + bk * 0.11, push=-0.002)
    h3_nape = horn(f'coy_{sex}_canyon_nape', [pn3, pn3 + bk * 0.035 - up * 0.11], 0.045, 0.025, p_canyon, n=10, rows=5, rigid_joint='Head')
    entries.append(_coy_assemble(f'coy_{sex}_canyon_shade_cowl', 'Red-Ochre Canyon Brow-Shade & Nape Tail', 'head', [h3_band, h3_nape]))

    t3_serape = crossed_sash(f'coy_{sex}_canyon_serape_s', p_canyon, width=0.115, ease=0.018)
    t3_armpad = sleeve(f'coy_{sex}_canyon_pad_L', L, p_buck, f0=0.0, f1=0.20, ease=0.011, flare=0.002, rows=5, n=18)
    t3_pld = pauldron(f'coy_{sex}_canyon_sh_L', L, p_canyon)
    t3_belt = belt_sash(f'coy_{sex}_canyon_belt', core.WAIST - 0.008, core.WAIST + 0.028, p_raw, ease=0.015)
    t3_parts = [t3_serape, t3_armpad, t3_pld, t3_belt]
    if is_f:
        t3_parts.insert(0, torso_tube(f'coy_{sex}_canyon_vest', core.CHEST + 0.055, core.WAIST + 0.02, 0.016, p_buck, n=38, rows=9))
    entries.append(_coy_assemble(f'coy_{sex}_canyon_serape', 'Asymmetrical Red-Ochre Canyon Shoulder-Serape', 'torso', t3_parts, open_torso=True))
    entries.append(_coy_assemble(f'coy_{sex}_rawhide_bracers', 'Smoke-Tanned Rawhide Canyon Bracers', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_rawhide_bracers', p_raw, f0=0.35, f1=0.93)))
    entries.append(_coy_assemble(f'coy_{sex}_tracker_chaps', 'Open-Seat Buckskin Canyon Tracker Chaps', 'legs',
                                 _tail_clear_chaps(f'coy_{sex}_tracker_chaps', p_raw, p_buck, ankle_frac=0.52), legged=True))
    entries.append(_coy_assemble(f'coy_{sex}_silent_hock_wraps', 'Silent Yucca-Corded Hock Wraps', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_silent_hock_wraps', p_agave, p_canyon, f_bot=0.08, f_top=0.48)))
    pad3, p_pad3 = _dorsal_pad(f'coy_{sex}_gourd_camouflage_pack', core.CHEST + 0.01, (0.17, 0.05, 0.20), p_canyon)
    grd3 = blob(f'coy_{sex}_canyon_gourd', p_pad3 + BACK_DIR * 0.068, (0.16, 0.13, 0.22), P('coy_ochre_red', 0.05), n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_gourd_camouflage_pack', 'Red-Clay Canyon Water Gourd & Brush Pack', 'back', [pad3, grd3]))

    # -------------------------------------------------------------------------------------------------------
    # C-4: `kam_peak_bronze_delver` — Kam-Hau Peak Nation Bronze Delver
    # -------------------------------------------------------------------------------------------------------
    h4_brow = _coyote_brow_circlet(f'coy_{sex}_delver_hb', p_bronze, f0=0.65, f1=0.75, ease=0.020)
    pl4, _ = _snap_to_part(h4_brow, a + (b - a) * 0.70 - bk * 0.12, push=0.003)
    h4_dish = rosette(f'coy_{sex}_delver_dish', pl4, -bk, left, 0.026, p_verd, n=14, thick=0.010, rigid_joint='Head')
    entries.append(_coy_assemble(f'coy_{sex}_delver_brow_lamp', 'Outlands Bronze Miner Brow-Guard & Reflector', 'head', [h4_brow, h4_dish]))

    p_soot = P('coy_soot_hide', 0.08, [B('bottom', 0.0, 0.06, 'coy_bronze_frieze', 'coy_bronze', 'coy_soot_hide', 0.07)], fabric='leather.foundry.pigskin')
    t4_jrk = torso_tube(f'coy_{sex}_miner_jrk', core.TOP - 0.008, core.WAIST - 0.025, 0.022, p_soot, n=40, rows=14)
    t4_pld = [pauldron(f'coy_{sex}_miner_pld_{s[0]}', s, p_bronze) for s in (L, R)]
    t4_belt = belt_sash(f'coy_{sex}_miner_belt', core.WAIST - 0.008, core.WAIST + 0.028, p_bronze, ease=0.025)
    entries.append(_coy_assemble(f'coy_{sex}_miner_jerkin', 'Soot-Hide Vest & Cast Bronze Shoulder-Plates', 'torso', [t4_jrk] + t4_pld + [t4_belt]))
    entries.append(_coy_assemble(f'coy_{sex}_bronze_knuckle_wraps', 'Bronze-Splint Ore-Knapping Wraps', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_bronze_knuckle_wraps', p_soot, f0=0.38, f1=0.95, boss_paint=p_bronze)))
    entries.append(_coy_assemble(f'coy_{sex}_canvas_kilt_apron', 'Heavy Ore-Leather Tail-Clear Apron', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_canvas_kilt_apron', p_bronze, p_soot, p_raw, z_apron_bot=core.KNEE + 0.06)))
    entries.append(_coy_assemble(f'coy_{sex}_bronze_shin_splints', 'Outlands Bronze & Leather Hock-Splints', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_bronze_shin_splints', p_bronze, p_verd, f_bot=0.10, f_top=0.62)))
    pad4, p_pad4 = _dorsal_pad(f'coy_{sex}_ore_hod_pack', core.CHEST + 0.01, (0.18, 0.055, 0.22), p_soot)
    hod4 = blob(f'coy_{sex}_ore_hod', p_pad4 + BACK_DIR * 0.075, (0.22, 0.15, 0.26), p_raw, n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    ore4 = blob(f'coy_{sex}_ore_malachite', p_pad4 + BACK_DIR * 0.085 + np.array([0.0, 0.0, 0.11]), (0.13, 0.09, 0.09), p_turq, n=10, rows=5, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_ore_hod_pack', 'Turquoise & Malachite Ore Hod Basket', 'back', [pad4, hod4, ore4]))

    # -------------------------------------------------------------------------------------------------------
    # C-5: `turquoise_mosaic_trader` — Outlands Turquoise-Mosaic Caravan Factor
    # -------------------------------------------------------------------------------------------------------
    h5_ring = _coyote_brow_circlet(f'coy_{sex}_trader_tr', P('coy_indigo', 0.06), f0=0.65, f1=0.76, ease=0.021, flare=0.008)
    pm5, _ = _snap_to_part(h5_ring, a + (b - a) * 0.71 - bk * 0.12, push=0.003)
    h5_brooch = rosette(f'coy_{sex}_trader_brooch', pm5, -bk, left, 0.026, p_turq, n=14, thick=0.008, rigid_joint='Head')
    entries.append(_coy_assemble(f'coy_{sex}_trader_turban_ring', 'Indigo Crown-Ring & Turquoise-Jasper Brooch', 'head', [h5_ring, h5_brooch]))

    p_mosaic_disc = P('coy_turq', 0.03, [B('bottom', 0.0, 0.06, 'coy_turq_mosaic', 'coy_jasper', 'coy_turq', 0.05)],
                      [PN(0.0, 1.0, 'coy_turq_mosaic', 'coy_jasper', 'coy_turq', 0.16)], fabric='beads.glass')
    t5_coat = torso_tube(f'coy_{sex}_mosaic_coat', core.TOP - 0.006, core.WAIST - 0.024, 0.022, p_kilim_red, n=42, rows=14)
    t5_disc = collar_disc(f'coy_{sex}_mosaic_gorget', 0.13, p_mosaic_disc, drop=0.105, rows=8, n=46, scallop=0.06, ease=0.020)
    t5_belt = belt_sash(f'coy_{sex}_mosaic_belt', core.WAIST - 0.008, core.WAIST + 0.028, p_silver, ease=0.025)
    entries.append(_coy_assemble(f'coy_{sex}_mosaic_mantle_tunic', 'Cochineal Kilim Coat & Turquoise-Mosaic Collar', 'torso', [t5_coat, t5_disc, t5_belt]))
    entries.append(_coy_assemble(f'coy_{sex}_silver_cuffs', 'Cupelled-Silver & Turquoise Inlay Cuffs', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_silver_cuffs', p_silver, f0=0.52, f1=0.94, boss_paint=p_turq)))
    entries.append(_coy_assemble(f'coy_{sex}_pleated_breech_skirt', 'Tail-Notched Pleated Kilim Skirt', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_pleated_breech_skirt', p_silver, p_kilim_red, P('coy_indigo', 0.07))))
    entries.append(_coy_assemble(f'coy_{sex}_beaded_stirrups', 'Turquoise-Beaded Buckskin Stirrups', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_beaded_stirrups', p_turq, p_silver, f_bot=0.08, f_top=0.42)))
    pad5, p_pad5 = _dorsal_pad(f'coy_{sex}_trade_bundle_frame', core.CHEST + 0.02, (0.18, 0.05, 0.22), P('coy_mesquite', 0.06))
    roll5 = tube(f'coy_{sex}_trade_roll', [p_pad5 + np.array([-0.15, 0.065, 0.10]), p_pad5 + np.array([0.15, 0.065, 0.10])], 0.052, p_kilim_red, n=14, rigid_joint='Spine2')
    box5 = blob(f'coy_{sex}_trade_ingots', p_pad5 + BACK_DIR * 0.065 + np.array([0.0, 0.0, -0.05]), (0.20, 0.12, 0.16), p_bronze, n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_trade_bundle_frame', 'Mesquite Tally-Cord & Kilim Trade Frame', 'back', [pad5, roll5, box5]))

    # -------------------------------------------------------------------------------------------------------
    # C-6: `mesa_potter_mason` — Ham / Kam Contour Artisan & Mesa Potter
    # -------------------------------------------------------------------------------------------------------
    p_contour = P('coy_bone', 0.05, [B('bottom', 0.0, 0.06, 'coy_hum_contour', 'coy_impactite', 'coy_bone', 0.07)],
                  [PN(0.0, 1.0, 'coy_hum_contour', 'coy_impactite', 'coy_bone', 0.18)])
    h6_fil = _coyote_brow_circlet(f'coy_{sex}_mason_fb', p_contour, f0=0.65, f1=0.73, ease=0.0195)
    entries.append(_coy_assemble(f'coy_{sex}_mason_bone_fillet', 'Incised cyContour Bone-Plaque Brow-Fillet', 'head', [h6_fil]))

    t6_sash = crossed_sash(f'coy_{sex}_mason_sash', p_agave, width=0.078, ease=0.018)
    t6_belt = belt_sash(f'coy_{sex}_mason_belt', core.WAIST - 0.008, core.WAIST + 0.028, p_contour, ease=0.019)
    t6_parts = [t6_sash, t6_belt]
    if is_f:
        huipil = torso_tube(f'coy_{sex}_mason_huipil', core.CHEST + 0.06, core.WAIST + 0.03, 0.016, p_agave, n=38, rows=8)
        t6_parts.insert(0, huipil)
    entries.append(_coy_assemble(f'coy_{sex}_mason_wrap', 'cyContour Bone-Plaque Belt & Agave Sash', 'torso', t6_parts, open_torso=True))
    entries.append(_coy_assemble(f'coy_{sex}_clay_forearm_guards', 'Kaolin-Slipped Potter Forearm Wraps', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_clay_forearm_guards', p_contour, f0=0.42, f1=0.93)))
    entries.append(_coy_assemble(f'coy_{sex}_adobe_work_kilt', 'Tail-Clear Agave & Buckskin Work-Kilt', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_adobe_work_kilt', p_contour, p_agave, p_buck, z_apron_bot=core.KNEE + 0.08)))
    entries.append(_coy_assemble(f'coy_{sex}_yucca_anklets', 'Plaited Yucca-Fiber Ankle Wraps', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_yucca_anklets', p_agave, None, f_bot=0.08, f_top=0.36)))
    pad6, p_pad6 = _dorsal_pad(f'coy_{sex}_painted_olla_sling', core.CHEST + 0.01, (0.16, 0.05, 0.19), p_agave)
    olla6 = blob(f'coy_{sex}_olla_jar', p_pad6 + BACK_DIR * 0.080, (0.21, 0.17, 0.23), p_contour, n=16, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_painted_olla_sling', 'Netted Black-on-Cream Geometric Olla Jar', 'back', [pad6, olla6]))

    # -------------------------------------------------------------------------------------------------------
    # C-7: `prairie_lance_skirmisher` — Tong-Hau Prairie Lancer
    # -------------------------------------------------------------------------------------------------------
    p_ichca = P('coy_agave', 0.08, [
        B('bottom', 0.0, 0.09, 'coy_lightning_step', 'coy_cochineal', 'coy_agave', 0.09),
    ], [PN(0.0, 1.0, 'coy_lightning_step', 'coy_cochineal', 'coy_agave', 0.22)], fabric='cloth.quilted.diamond')
    h7_brow = _coyote_brow_circlet(f'coy_{sex}_lancer_brow', p_raw, f0=0.64, f1=0.75, ease=0.020)
    pb7, _ = _snap_to_part(h7_brow, a + (b - a) * 0.70 - bk * 0.12, push=0.003)
    h7_turq = rosette(f'coy_{sex}_lancer_turq', pb7, -bk, left, 0.022, p_turq, n=12, thick=0.007, rigid_joint='Head')
    entries.append(_coy_assemble(f'coy_{sex}_rawhide_ear_brow', 'Painted Rawhide Ear-Clear War-Browband', 'head', [h7_brow, h7_turq]))

    t7_cors = torso_tube(f'coy_{sex}_ichca_body', core.TOP - 0.006, core.WAIST - 0.024, 0.025, p_ichca, n=42, rows=15)
    t7_belt = belt_sash(f'coy_{sex}_ichca_belt', core.WAIST - 0.008, core.WAIST + 0.028, p_raw, ease=0.027)
    entries.append(_coy_assemble(f'coy_{sex}_ichcahuipilli', 'Brine-Quilted Agave Ichcahuipilli Corselet', 'torso', [t7_cors, t7_belt]))
    entries.append(_coy_assemble(f'coy_{sex}_hide_vambraces', 'Thick Buffalo-Rawhide Lance Vambraces', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_hide_vambraces', p_raw, f0=0.28, f1=0.95, ease=0.012, boss_paint=p_turq)))
    entries.append(_coy_assemble(f'coy_{sex}_tasset_breechclout', 'Quilted Cotton & Rawhide Hip-Tassets', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_tasset_breechclout', p_raw, p_ichca, p_raw, z_apron_bot=core.KNEE + 0.08)))
    entries.append(_coy_assemble(f'coy_{sex}_rawhide_greaves', 'Hardened Rawhide & Turquoise Shin-Greaves', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_rawhide_greaves', p_raw, p_turq, f_bot=0.10, f_top=0.65)))
    pad7, p_pad7 = _dorsal_pad(f'coy_{sex}_twin_ostrich_standards', core.CHEST + 0.02, (0.16, 0.048, 0.19), p_raw)
    st7 = [pad7]
    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_b0 = p_pad7 + np.array([sd * 0.065, 0.048, -0.06])
        p_b1 = p_pad7 + np.array([sd * 0.095, 0.060, 0.30])
        st7.append(tube(f'coy_{sex}_pole_{tag}', [p_b0, p_b1], 0.009, P('coy_mesquite', 0.05), n=8, rigid_joint='Spine2'))
        st7.append(horn(f'coy_{sex}_plume_{tag}', [p_b1 - np.array([0.0, 0.0, 0.04]), p_b1 + np.array([sd * 0.02, 0.02, 0.14])],
                        0.028, 0.008, p_ostrich, n=10, rows=6, rigid_joint='Spine2'))
    entries.append(_coy_assemble(f'coy_{sex}_twin_ostrich_standards', 'Twin Dorsal Reed & Ostrich-Plume Standards', 'back', st7))

    # -------------------------------------------------------------------------------------------------------
    # C-8: `impactite_glass_duelist` — Si / Kam Crater-Glass Champion
    # -------------------------------------------------------------------------------------------------------
    p_imp_brig = P('coy_buckskin', 0.06, [
        B('bottom', 0.0, 0.08, 'coy_jasper_brigandine', 'coy_jasper', 'coy_impactite', 0.08),
    ], [PN(0.0, 1.0, 'coy_jasper_brigandine', 'coy_jasper', 'coy_buckskin', 0.20)], fabric='leather.pteruges.studded')
    h8_band = _coyote_brow_circlet(f'coy_{sex}_imp_brow', P('coy_impactite', 0.03), f0=0.65, f1=0.75, ease=0.020)
    h8_fin = _sagittal_plume(f'coy_{sex}_imp', h8_band, P('coy_impactite', 0.02, [B('top', 0.0, 0.03, 'solid', 'coy_jasper')]), height=0.105, tilt_bk=0.03)
    entries.append(_coy_assemble(f'coy_{sex}_impactite_crest_helm', 'Knapped Crater-Glass Sagittal War-Crest', 'head', [h8_band, h8_fin]))

    t8_vest = torso_tube(f'coy_{sex}_imp_vest', core.CHEST + 0.06, core.WAIST - 0.024, 0.023, p_imp_brig, n=42, rows=12)
    t8_sash = crossed_sash(f'coy_{sex}_imp_straps', P('coy_impactite', 0.04), width=0.068, ease=0.024)
    p_j8, n_j8 = _snap_to_part(t8_vest, chest_front(core.CHEST + 0.02, 0.024), push=0.003)
    t8_boss = rosette(f'coy_{sex}_imp_jasperboss', p_j8, n_j8, np.array([1.0, 0.0, 0.0]), 0.038, p_jasper, n=14, thick=0.009)
    entries.append(_coy_assemble(f'coy_{sex}_impactite_brigandine', 'Crater-Impactite & Red-Jasper War-Brigandine', 'torso', [t8_vest, t8_sash, t8_boss]))
    entries.append(_coy_assemble(f'coy_{sex}_bronze_vambraces', 'Outlands Bronze & Red-Jasper Duelist Vambraces', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_bronze_vambraces', p_bronze, f0=0.28, f1=0.95, ease=0.013, boss_paint=p_jasper)))
    entries.append(_coy_assemble(f'coy_{sex}_jasper_war_kilt', 'Tail-Split Jasper & Impactite Pteruges', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_jasper_war_kilt', p_jasper, p_imp_brig, p_raw, z_apron_bot=core.KNEE + 0.06)))
    entries.append(_coy_assemble(f'coy_{sex}_hock_guards', 'Impactite-Studded Buckskin Hock-Guards', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_hock_guards', p_imp_brig, p_jasper, f_bot=0.09, f_top=0.64)))
    pad8, p_pad8 = _dorsal_pad(f'coy_{sex}_macuahuitl_scabbard', core.CHEST + 0.01, (0.15, 0.048, 0.19), p_raw)
    scab8 = tube(f'coy_{sex}_imp_scab', [p_pad8 + np.array([-0.08, 0.055, -0.15]), p_pad8 + np.array([0.09, 0.058, 0.19])], 0.036, P('coy_mesquite', 0.05), n=10, rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_macuahuitl_scabbard', 'Open-Cage Mesquite Impactite-Club Scabbard', 'back', [pad8, scab8]))

    # -------------------------------------------------------------------------------------------------------
    # C-9: `lok_tierhound_gate_warden` — Lok-Hau Tierhound Pack-Master & Korona Gate-Warden
    # -------------------------------------------------------------------------------------------------------
    p_scale = P('coy_bronze', 0.04, [
        B('bottom', 0.0, 0.08, 'coy_bronze_scale', 'coy_verdigris', 'coy_bronze', 0.07),
    ], [PN(0.0, 1.0, 'coy_bronze_scale', 'coy_verdigris', 'coy_bronze', 0.18)], fabric='armor.lamellar.bronze')
    h9_casque = _coyote_ear_notched_casque(f'coy_{sex}_tierhound_bowl', p_bronze, ease=0.020)
    h9_pl = _sagittal_plume(f'coy_{sex}_tierhound', h9_casque, p_verd, height=0.085, tilt_bk=0.04)
    entries.append(_coy_assemble(f'coy_{sex}_tierhound_bronze_helm', 'Ear-Notched Outlands Bronze Tierhound Casquetel', 'head', [h9_casque, h9_pl]))

    t9_cuir = torso_tube(f'coy_{sex}_warden_cuir', core.TOP - 0.005, core.WAIST - 0.024, 0.025, p_scale, n=44, rows=15)
    t9_pld = [pauldron(f'coy_{sex}_warden_pld_{s[0]}', s, p_bronze) for s in (L, R)]
    t9_belt = belt_sash(f'coy_{sex}_warden_belt', core.WAIST - 0.008, core.WAIST + 0.030, p_verd, ease=0.027)
    pg9, ng9 = _snap_to_part(t9_cuir, chest_front(core.CHEST + 0.03, 0.025), push=0.003)
    t9_gorg = rosette(f'coy_{sex}_warden_boss', pg9, ng9, np.array([1.0, 0.0, 0.0]), 0.052, p_verd, n=16, thick=0.010)
    entries.append(_coy_assemble(f'coy_{sex}_bronze_scale_cuirass', 'Tierhound Cast-Bronze & Verdigris Scale Cuirass', 'torso',
                                 [t9_cuir] + t9_pld + [t9_belt, t9_gorg]))
    entries.append(_coy_assemble(f'coy_{sex}_bronze_splint_bracers', 'Articulated Bronze & Verdigris Splint Bracers', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_bronze_splint_bracers', p_scale, f0=0.25, f1=0.95, ease=0.014, boss_paint=p_verd)))
    entries.append(_coy_assemble(f'coy_{sex}_bronze_pteruges', 'Tail-Cleared Bronze Scale Hip-Pteruges', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_bronze_pteruges', p_verd, p_scale, p_scale, z_apron_bot=core.KNEE + 0.06)))
    entries.append(_coy_assemble(f'coy_{sex}_bronze_hock_greaves', 'Fluted Outlands Bronze & Verdigris Hock-Greaves', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_bronze_hock_greaves', p_bronze, p_verd, f_bot=0.09, f_top=0.70, ease=0.011)))
    entries.append(_coy_assemble(f'coy_{sex}_gate_warden_capelet', 'Tail-Clear Cochineal & Verdigris Shoulder-Capelet', 'back',
                                 [cape(f'coy_{sex}_gate_warden_capelet', core.WAIST + 0.08, p_kilim_red, stiff=0.36, back_push=0.050)]))

    # -------------------------------------------------------------------------------------------------------
    # C-10: `outlands_rifle_scout` — Si-Hau Trade-Rifle Scout
    # -------------------------------------------------------------------------------------------------------
    h10_band = _coyote_brow_circlet(f'coy_{sex}_scout_hb', p_turq, f0=0.65, f1=0.74, ease=0.020)
    h10_brim = brim(f'coy_{sex}_scout_brim', 0.66, 0.110, P('coy_soot_hide', 0.07, fabric='cloth.felt.boiled'), ease=0.020, rows=5, n=40, droop=0.012)
    entries.append(_coy_assemble(f'coy_{sex}_scout_brimmed_hat', 'Ear-Clear Canyon Felt Sun-Brim & Turquoise Band', 'head', [h10_band, h10_brim]))

    t10_pon = torso_tube(f'coy_{sex}_scout_serape', core.TOP - 0.008, core.WAIST - 0.025, 0.023, p_canyon, n=42, rows=14)
    t10_bal = crossed_sash(f'coy_{sex}_scout_bandolier', p_raw, width=0.072, ease=0.026)
    t10_parts = [t10_pon, t10_bal]
    for ic_s, z_s in enumerate(np.linspace(core.CHEST + 0.05, core.WAIST + 0.05, 4)):
        ps_c, ns_c = _snap_to_part(t10_bal, chest_front(z_s, 0.026, x=-0.03 + 0.02 * ic_s), push=0.003)
        t10_parts.append(blob(f'coy_{sex}_scout_cart_{ic_s}', ps_c, (0.016, 0.014, 0.034), p_bronze, n=8, rows=4, out=ns_c))
    entries.append(_coy_assemble(f'coy_{sex}_bandolier_serape', 'Si-Hau Blanket Serape & Copper-Cartridge Bandolier', 'torso', t10_parts))
    entries.append(_coy_assemble(f'coy_{sex}_shooter_wraps', 'Buckskin Rifleman Wrist-Wraps', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_shooter_wraps', p_buck, f0=0.45, f1=0.95, boss_paint=p_turq)))
    entries.append(_coy_assemble(f'coy_{sex}_fringed_hip_leggings', 'Fringed Open-Seat Canyon Hip-Leggings', 'legs',
                                 _tail_clear_chaps(f'coy_{sex}_fringed_hip_leggings', p_turq, p_canyon, ankle_frac=0.60), legged=True))
    entries.append(_coy_assemble(f'coy_{sex}_canyon_stirrups', 'Strapped Rawhide Canyon Stirrup-Gaiters', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_canyon_stirrups', p_raw, p_canyon, f_bot=0.08, f_top=0.50)))
    pad10, p_pad10 = _dorsal_pad(f'coy_{sex}_powder_horn_pack', core.CHEST + 0.01, (0.16, 0.048, 0.19), p_raw)
    ph10 = horn(f'coy_{sex}_powder_horn', [p_pad10 + np.array([-0.10, 0.055, 0.06]), p_pad10 + np.array([0.02, 0.065, -0.04]), p_pad10 + np.array([0.12, 0.055, 0.05])],
                0.036, 0.010, P('coy_bone', 0.04), n=12, rows=7, rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_powder_horn_pack', 'Carved Pronghorn Powder-Flask & Shot Pack', 'back', [pad10, ph10]))

    # -------------------------------------------------------------------------------------------------------
    # C-11: `hum_contour_singer_priest` — Sacred Hum Contour-Singer Priest (SOLE ROADRUNNER FEATHER TIER!)
    # -------------------------------------------------------------------------------------------------------
    p_roadrunner = P('coy_runner_umb', 0.04, [
        B('bottom', 0.0, 0.08, 'coy_priest_roadrunner', 'coy_bone', 'coy_runner_umb', 0.08),
    ], [PN(0.0, 1.0, 'coy_priest_roadrunner', 'coy_bone', 'coy_runner_umb', 0.16)])
    p_sanctuary = P('coy_cotton_wht', 0.06, [
        B('bottom', 0.0, 0.09, 'coy_hum_contour', 'coy_turq', 'coy_cotton_wht', 0.09),
    ], [PN(0.18, 0.82, 'coy_hum_contour', 'coy_indigo', 'coy_cotton_wht', 0.22)], fabric='cloth.cotton.coarse')

    h11_circ = _coyote_brow_circlet(f'coy_{sex}_priest_circ', p_turq, f0=0.65, f1=0.75, ease=0.020)
    h11_pl = _sagittal_plume(f'coy_{sex}_priest_rr', h11_circ, p_roadrunner, height=0.155, tilt_bk=0.04)
    entries.append(_coy_assemble(f'coy_{sex}_runner_feather_crown', 'Sacred Barred Roadrunner-Feather & Turquoise Crown', 'head', [h11_circ, h11_pl]))

    t11_tun = torso_tube(f'coy_{sex}_hum_tun', core.TOP - 0.006, core.WAIST - 0.024, 0.022, p_sanctuary, n=42, rows=14)
    t11_slv = sleeves(f'coy_{sex}_hum_tun', 'elbow', 0.018, p_sanctuary)
    t11_disc = collar_disc(f'coy_{sex}_hum_pec', 0.13, p_mosaic_disc, drop=0.105, rows=8, n=46, scallop=0.06, ease=0.020)
    t11_belt = belt_sash(f'coy_{sex}_hum_sash', core.WAIST - 0.008, core.WAIST + 0.028, p_turq, ease=0.025)
    entries.append(_coy_assemble(f'coy_{sex}_hum_stole_vestment', 'Sanctuary Cotton Tunic & Hum Contour-Wave Stole', 'torso',
                                 [t11_tun] + t11_slv + [t11_disc, t11_belt]))
    entries.append(_coy_assemble(f'coy_{sex}_jade_turquoise_cuffs', 'Turquoise & White-Shell Cantor Cuffs', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_jade_turquoise_cuffs', p_turq, f0=0.48, f1=0.94, boss_paint=P('coy_cotton_wht', 0.03))))
    entries.append(_coy_assemble(f'coy_{sex}_sanctuary_split_skirt', 'Tail-Arched Sanctuary Cotton Split-Skirt', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_sanctuary_split_skirt', p_turq, p_sanctuary, p_sanctuary, z_apron_bot=core.ANKLE + 0.14)))
    entries.append(_coy_assemble(f'coy_{sex}_white_buck_anklets', 'White Buckskin & Shell-Rattle Ritual Anklets', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_white_buck_anklets', p_sanctuary, p_turq, f_bot=0.08, f_top=0.44)))
    pad11, p_pad11 = _dorsal_pad(f'coy_{sex}_runner_fan_halo', core.CHEST + 0.03, (0.16, 0.052, 0.18), p_turq)
    halo11 = fan(f'coy_{sex}_runner_fan', 0.012, 0.25, 1.05, p_roadrunner, rows=8, cols=17,
                 center=p_pad11 + BACK_DIR * 0.020, up_vec=np.array([0.0, 0.18, 0.98]), side_vec=np.array([1.0, 0.0, 0.0]), rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_runner_fan_halo', 'Sacred Barred Roadrunner-Feather Dorsal Halo', 'back', [pad11, halo11]))

    # -------------------------------------------------------------------------------------------------------
    # C-12: `five_fires_council_warleader` — Coyote King & Five-Fires Council Warleader
    # -------------------------------------------------------------------------------------------------------
    h12_casque = _coyote_ear_notched_casque(f'coy_{sex}_king_casque', p_mosaic_disc, ease=0.020)
    h12_parts = [h12_casque, _sagittal_plume(f'coy_{sex}_king_crest', h12_casque, p_ostrich, height=0.165, tilt_bk=0.045)]
    # Five-Fires turquoise & red-jasper brow prongs seated safely along the front brow below ear height!
    for idx_f, ang_off in enumerate((-0.42, -0.21, 0.0, 0.21, 0.42)):
        d_f = -bk * math.cos(ang_off) + left * math.sin(ang_off)
        pf0, _ = _snap_to_part(h12_casque, a + (b - a) * 0.72 + d_f * 0.11, push=-0.002)
        p_col = p_jasper if (idx_f % 2 == 1) else p_turq
        h12_parts.append(horn(f'coy_{sex}_king_fire_{idx_f}', [pf0, pf0 + up * (0.052 if idx_f == 2 else 0.038) + d_f * 0.008],
                              0.010, 0.003, p_col, n=8, rows=4, rigid_joint='Head'))
    entries.append(_coy_assemble(f'coy_{sex}_council_diadem', 'Five-Fires Turquoise & Bronze Ear-Framed War-Crown', 'head', h12_parts))

    t12_tun = torso_tube(f'coy_{sex}_king_tun', core.TOP - 0.005, core.WAIST - 0.024, 0.024, p_kilim_red, n=44, rows=15)
    t12_slv = sleeves(f'coy_{sex}_king_tun', 'elbow', 0.018, p_kilim_red)
    t12_pld = [pauldron(f'coy_{sex}_king_pld_{s[0]}', s, p_verd) for s in (L, R)]
    t12_col = collar_disc(f'coy_{sex}_king_collar', 0.14, p_mosaic_disc, drop=0.115, rows=9, n=48, scallop=0.06, ease=0.021)
    t12_belt = belt_sash(f'coy_{sex}_king_girdle', core.WAIST - 0.008, core.WAIST + 0.032, p_bronze, ease=0.027)
    pm12, nm12 = _snap_to_part(t12_col, chest_front(core.CHEST + 0.04, 0.024), push=0.003)
    t12_mir = rosette(f'coy_{sex}_king_mirror', pm12, nm12, np.array([1.0, 0.0, 0.0]), 0.056, p_bronze, n=18, thick=0.010)
    entries.append(_coy_assemble(f'coy_{sex}_chieftain_cuirass', 'Burnished Bronze Mirror-Pectoral & Cochineal War-Cuirass', 'torso',
                                 [t12_tun] + t12_slv + t12_pld + [t12_col, t12_belt, t12_mir]))
    entries.append(_coy_assemble(f'coy_{sex}_giltless_bronze_bracers', 'Turquoise-Inlaid Outlands Bronze Royal Vambraces', 'gloves',
                                 _wrist_bracers(f'coy_{sex}_giltless_bronze_bracers', p_bronze, f0=0.24, f1=0.95, ease=0.014, boss_paint=p_turq)))
    entries.append(_coy_assemble(f'coy_{sex}_council_war_kilt', 'Tail-Clear Cochineal Kilim & Bronze Royal War-Kilt', 'legs',
                                 _tail_clear_split_kilt(f'coy_{sex}_council_war_kilt', p_bronze, p_kilim_red, p_scale, z_apron_bot=core.KNEE + 0.04)))
    entries.append(_coy_assemble(f'coy_{sex}_turquoise_bronze_greaves', 'Turquoise-Inlaid Cast Bronze Royal Hock-Greaves', 'feet',
                                 _paw_open_greaves(f'coy_{sex}_turquoise_bronze_greaves', p_bronze, p_turq, f_bot=0.09, f_top=0.72, ease=0.011)))
    pad12, p_pad12 = _dorsal_pad(f'coy_{sex}_great_ostrich_crest', core.CHEST + 0.03, (0.18, 0.055, 0.21), p_bronze)
    fan12 = fan(f'coy_{sex}_king_ostrich_fan', 0.012, 0.28, 1.15, p_ostrich, rows=9, cols=19,
                center=p_pad12 + BACK_DIR * 0.020, up_vec=np.array([0.0, 0.16, 0.98]), side_vec=np.array([1.0, 0.0, 0.0]), rigid_joint='Spine2')
    entries.append(_coy_assemble(f'coy_{sex}_great_ostrich_crest', 'Towering Five-Fires Black-and-White Ostrich War-Crest', 'back', [pad12, fan12]))

    return entries


# ===========================================================================================================
# 4. COMPLETE 12-TIER `coyote_men` PEOPLES ENTRY & MANIFEST VALIDATOR
# ===========================================================================================================
COYOTE_MEN_TIERS = [
    ['ham_valley_kilim_weaver',      0.13],
    ['tong_sunrise_antelope_runner', 0.12],
    ['si_sunset_canyon_tracker',     0.11],
    ['kam_peak_bronze_delver',       0.10],
    ['turquoise_mosaic_trader',      0.09],
    ['mesa_potter_mason',            0.08],
    ['prairie_lance_skirmisher',     0.10],
    ['impactite_glass_duelist',      0.07],
    ['lok_tierhound_gate_warden',    0.08],
    ['outlands_rifle_scout',         0.05],
    ['hum_contour_singer_priest',    0.04],
    ['five_fires_council_warleader', 0.03],
]

COYOTE_MEN_TIER_LABELS = {
    'ham_valley_kilim_weaver':      'Ham-Hau Valley Kilim Weaver',
    'tong_sunrise_antelope_runner': 'Tong-Hau Sunrise Pronghorn Runner',
    'si_sunset_canyon_tracker':     'Si-Hau Sunset Canyon Tracker',
    'kam_peak_bronze_delver':       'Kam-Hau Peak Bronze & Malachite Delver',
    'turquoise_mosaic_trader':      'Outlands Turquoise-Mosaic Caravan Factor',
    'mesa_potter_mason':            'Mesa Potter & cyContour Bone-Carver',
    'prairie_lance_skirmisher':     'Tong-Hau Prairie Lance Skirmisher',
    'impactite_glass_duelist':      'Crater-Impactite & Red-Jasper Duelist',
    'lok_tierhound_gate_warden':    'Lok-Hau Tierhound Pack-Master & Gate-Warden',
    'outlands_rifle_scout':         'Si-Hau Trade-Rifle Canyon Outrider',
    'hum_contour_singer_priest':    'Sacred Hum Contour-Singer Priest',
    'five_fires_council_warleader': 'Coyote King & Five-Fires Council Warleader',
}

_COYOTE_SPECS = [
    ('ham_valley_kilim_weaver',      'valley_sunbrim',        'valley_poncho',        'valley_wraps',           'split_kilt',            'turquoise_anklets',       'loom_batten_sling',     'ham_hau'),
    ('tong_sunrise_antelope_runner', 'sunrise_fillet',        'sunrise_harness',      'sinew_wristguards',      'buckskin_breechclout',  'prairie_shin_wraps',      'ostrich_bustle_quiver', 'tong_hau'),
    ('si_sunset_canyon_tracker',     'canyon_shade_cowl',     'canyon_serape',        'rawhide_bracers',        'tracker_chaps',         'silent_hock_wraps',       'gourd_camouflage_pack', 'si_hau'),
    ('kam_peak_bronze_delver',       'delver_brow_lamp',      'miner_jerkin',         'bronze_knuckle_wraps',   'canvas_kilt_apron',     'bronze_shin_splints',     'ore_hod_pack',          'kam_hau'),
    ('turquoise_mosaic_trader',      'trader_turban_ring',    'mosaic_mantle_tunic',  'silver_cuffs',           'pleated_breech_skirt',  'beaded_stirrups',         'trade_bundle_frame',    'ham_hau'),
    ('mesa_potter_mason',            'mason_bone_fillet',     'mason_wrap',           'clay_forearm_guards',    'adobe_work_kilt',       'yucca_anklets',           'painted_olla_sling',    'kam_hau'),
    ('prairie_lance_skirmisher',     'rawhide_ear_brow',      'ichcahuipilli',        'hide_vambraces',         'tasset_breechclout',    'rawhide_greaves',         'twin_ostrich_standards','tong_hau'),
    ('impactite_glass_duelist',      'impactite_crest_helm',  'impactite_brigandine', 'bronze_vambraces',       'jasper_war_kilt',       'hock_guards',             'macuahuitl_scabbard',   'si_hau'),
    ('lok_tierhound_gate_warden',    'tierhound_bronze_helm', 'bronze_scale_cuirass', 'bronze_splint_bracers',  'bronze_pteruges',       'bronze_hock_greaves',     'gate_warden_capelet',   'lok_hau'),
    ('outlands_rifle_scout',         'scout_brimmed_hat',     'bandolier_serape',     'shooter_wraps',          'fringed_hip_leggings',  'canyon_stirrups',         'powder_horn_pack',      'si_hau'),
    ('hum_contour_singer_priest',    'runner_feather_crown',  'hum_stole_vestment',   'jade_turquoise_cuffs',   'sanctuary_split_skirt', 'white_buck_anklets',      'runner_fan_halo',       'five_fires'),
    ('five_fires_council_warleader', 'council_diadem',        'chieftain_cuirass',    'giltless_bronze_bracers','council_war_kilt',      'turquoise_bronze_greaves','great_ostrich_crest',   'five_fires'),
]


def _coyote_outfits_for_sex(sex):
    out = {}
    for tid, h_s, t_s, g_s, l_s, f_s, b_s, reg in _COYOTE_SPECS:
        out[tid] = {
            'head': f'coy_{sex}_{h_s}',
            'torso': f'coy_{sex}_{t_s}',
            'gloves': f'coy_{sex}_{g_s}',
            'legs': f'coy_{sex}_{l_s}',
            'feet': f'coy_{sex}_{f_s}',
            'back': f'coy_{sex}_{b_s}',
            'region': reg,
        }
    return out


def build_coyote_men_peoples_entry():
    return {
        'id': 'coyote_men',
        'name': 'Coyote Men',
        'note': (
            'The Five Hum-Speaking Therian Nations of the SW Outer Rim Outlands (Ham-Hau, Tong-Hau, Si-Hau, '
            'Kam-Hau, Lok-Hau; LORE.md S6.18, S10; biomes/outlands/PLAN.md S6; kits/coyote/PLAN.md): '
            'canid-headed, brush-furred, tailed therians (`coat: "coyote"`, `mods: ["mod_head_coyote", '
            '"mod_tail_coyote"]`) wearing ear-clear `fits_beast` crowns, tail-cleared kilim split-kilts, '
            'paw-open stirrups/greaves, cast Outlands bronze, black crater-impactite glass, turquoise mosaic, '
            'warrior ostrich plumes, and priest-only roadrunner feathers (strictly zero gold; '
            '12 tiers at 100% M+F parity; tools/garments/cultures/coyote_men.py).'
        ),
        'coat': 'coyote',
        'mods': ['mod_head_coyote', 'mod_tail_coyote'],
        'ancestry': {
            'african': [0.20, 0.50],
            'asian': [0.20, 0.50],
            'caucasian': [0.10, 0.40],
        },
        'skin': ['#8a7262', '#6e5a4c', '#54463c'],
        'hair': ['#b08a5a', '#9a7a52', '#a08866', '#8a7058', '#7a6a5a', '#c2a27a'],
        'eyes': ['#c08a2a', '#a87020', '#8a6a2a', '#d0a040'],
        'grey': 0.60,
        'beard': 0.0,
        'morph': {
            'weight': [-0.80, -0.20],
            'muscle': [0.00, 0.60],
        },
        'styles': {
            'male': ['short02', 'spiky'],
            'female': ['short03', 'ponytail01'],
        },
        'style_share': 1,
        'tiers': COYOTE_MEN_TIERS,
        'tier_labels': COYOTE_MEN_TIER_LABELS,
        'outfits': {
            'male': _coyote_outfits_for_sex('m'),
            'female': _coyote_outfits_for_sex('f'),
        },
    }


def build_coyote_men_kit():
    entries = []
    with coyote_motif_scope():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_all_coyote_tiers(sex))
    return entries


build_coyote_men_wardrobe = build_coyote_men_kit


def _validate_manifest(kit_entries, peoples_entry):
    share_sum = sum(sh for _, sh in peoples_entry['tiers'])
    assert abs(share_sum - 1.0) < 1e-9, f'Coyote Men shares sum to {share_sum}, expected 1.000'
    assert len(kit_entries) == 144, f'Expected 144 pieces (72 M + 72 F), got {len(kit_entries)}'
    assert peoples_entry['coat'] == 'coyote'
    assert peoples_entry['mods'] == ['mod_head_coyote', 'mod_tail_coyote']

    by_body_id = {}
    for ent in kit_entries:
        b_id, gid = ent.get('_body'), ent.get('id')
        assert b_id in ('mpfb_male', 'mpfb_female'), f'Invalid _body on {gid}'
        assert gid.startswith('coy_'), f'Piece {gid} must start with coy_'
        assert ent.get('culture') == 'coyote_men'
        if ent['slot'] == 'head':
            assert ent.get('fits_beast') is True, f'Headpiece {gid} missing fits_beast=True!'
            assert 'Human.lips' not in (ent.get('hide_parts') or []), f'Headpiece {gid} must have covers_face=False!'
        if ent['slot'] == 'feet':
            assert ent.get('hides', 0) <= 40, f'Paw-open feet {gid} hides {ent.get("hides")} tris (>40)!'
        key = (b_id, gid)
        assert key not in by_body_id, f'Duplicate entry {key}'
        by_body_id[key] = ent
        glb_p = ROOT / ent['glb']
        morph_p = glb_p.with_suffix('.morph.bin')
        assert glb_p.exists() and glb_p.stat().st_size > 500, f'Missing GLB {glb_p}'
        assert morph_p.exists() and morph_p.stat().st_size > 64, f'Missing morph.bin {morph_p}'

    for sex_k, b_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        assert len(peoples_entry['outfits'][sex_k]) == 12
        for tid, of in peoples_entry['outfits'][sex_k].items():
            for sl in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                pid = of[sl]
                assert (b_id, pid) in by_body_id, f'Missing {b_id} piece {pid} in {tid}.{sl}'
                assert by_body_id[(b_id, pid)]['slot'] == sl


def main():
    t0 = time.perf_counter()
    kit_entries = build_coyote_men_kit()
    peoples_entry = build_coyote_men_peoples_entry()
    # Reuse local dorsal-cape conformity for gate_warden_capelet without touching shared files
    from garments.cultures.islanders import _conform_local_manifest_glbs
    _conform_local_manifest_glbs(kit_entries, peoples_entry)
    _validate_manifest(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'coyote_men_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'coyote_men',
        'total_pieces': len(kit_entries),
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Coyote Men pieces ({n_m} male, {n_f} female) across 12 tiers in {dt:.2f}s.')
    print(f'Saved manifest -> {manifest_path}')


if __name__ == '__main__':
    main()
