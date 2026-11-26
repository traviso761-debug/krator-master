"""The Khaayken Yeti Wardrobe Kit (`khaayken` — Arctic High-Kin of Leng & Cold Lake).

Builds all 12 canonical Khaayken Yeti tiers (`mpfb_male` `yeti_m_*` & `mpfb_female` `yeti_f_*`)
at `scale: 1.15` with `coat: 'pelt'` (`fur.json` shaggy white/frost/slate body pelt), leaving
generous bare pelt regions on arms, shoulders, chests (`open_torso=True`), and calves where
canonical lore calls for exposed Yeti fur:

  1. `leng_summer_forager`       (`0.12`) — Open-front caribou-hide vest (`open_torso=True`), knee breeches, larchcreel
  2. `caribou_herder`            (`0.14`) — Earflap fur bonnet, pieced `fur-mosaic` *kukhlyanka* anorak, *maut* lasso
  3. `qoold_ice_harpooneer`      (`0.11`) — Antler slit snow-goggles, oiled `gutskin` *kamleika*, ivory crampons, float pack
  4. `qiviut_weaver_artisan`     (`0.10`) — Beaded brow-band, cream `qiviut` Baker Lake appliqué half-sleeve tunic, spindle bag
  5. `three_gifts_trader`        (`0.09`) — Muskox dome cap, slate wool merchant coat, Three-Gifts pack (qiviut, spoons, lamps)
  6. `pycrete_mason`             (`0.08`) — Pitched sawdust cap, oiled-canvas pycrete apron over bare-arm fur jerkin, block hod
  7. `antler_lamellar_skirmisher`(`0.10`) — Conical bone-slat helm, bog-iron/ivory/larch lamellar corselet, Chukchi wing-shield
  8. `blizzard_pass_scout`       (`0.08`) — Whiteout storm-hood & bone wind-visor, frost caribou parka, crossed larch snowshoes
  9. `eternian_trophy_breaker`   (`0.06`) — Captured Eternian bronze face-frieze helm, circuit-maze breastplate & statue trophies
 10. `soapstone_lamp_keeper`     (`0.05`) — Carved ivory diadem, ceremonial `qiviut` hearth-robe, plush caribou mantle
 11. `angakkuq_aurora_shaman`    (`0.04`) — Caribou-antler crown & spirit-mask, appliqué clapper coat, Chukchi frame-drum
 12. `great_khaay_khan`          (`0.03`) — The Great Khaay-Khan: ivory-antler silvered spangenhelm, royal laminar, white muskox cape

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/khaayken.py
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
from garments.paint import P, B, PN, C, WOOL, leathery
from garments.types.torso import (
    torso_tube, collar, collar_disc, cape, tabard, crossed_sash, pauldron,
)
from garments.types.limbs import sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_rings, sculpted_faceplate, hood, tower_hat, crown_band, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, tube, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

YETI_COLORS = {
    'yeti_qiviut':      (0.828, 0.774, 0.653),
    'yeti_gutskin':     (0.593, 0.405, 0.157),
    'yeti_caribou':     (0.201, 0.139, 0.094),
    'yeti_muskox':      (0.040, 0.025, 0.019),
    'yeti_frostpelt':   (0.781, 0.797, 0.812),
    'yeti_glacier':     (0.104, 0.157, 0.209),
    'yeti_soapstone':   (0.082, 0.109, 0.096),
    'yeti_bogiron':     (0.075, 0.078, 0.085),
    'yeti_larch':       (0.420, 0.275, 0.145),
    'yeti_pycrete':     (0.680, 0.660, 0.585),
}
for _k, _v in YETI_COLORS.items():
    C.setdefault(_k, _v)

KHAAYKEN_TIER_SHARES = [
    ['leng_summer_forager', 0.12],
    ['caribou_herder', 0.14],
    ['qoold_ice_harpooneer', 0.11],
    ['qiviut_weaver_artisan', 0.10],
    ['three_gifts_trader', 0.09],
    ['pycrete_mason', 0.08],
    ['antler_lamellar_skirmisher', 0.10],
    ['blizzard_pass_scout', 0.08],
    ['eternian_trophy_breaker', 0.06],
    ['soapstone_lamp_keeper', 0.05],
    ['angakkuq_aurora_shaman', 0.04],
    ['great_khaay_khan', 0.03],
]

KHAAYKEN_TIER_LABELS = {
    'leng_summer_forager': 'Leng Larch-Steppe Summer Forager',
    'caribou_herder': 'Khaayken Caribou Herder (Fur-Mosaic Parka)',
    'qoold_ice_harpooneer': 'Qoold Lheek Gutskin Ice-Harpooneer',
    'qiviut_weaver_artisan': 'Qiviut Wool & Appliqué Weaver-Artisan',
    'three_gifts_trader': 'Three-Gifts Caravan Trader (Qiviut, Horn & Soapstone)',
    'pycrete_mason': 'Cold Lake Pycrete Dome-Mason',
    'antler_lamellar_skirmisher': 'Antler, Larch & Bog-Iron Lamellar Skirmisher',
    'blizzard_pass_scout': 'Outer-Wall Whiteout Pass Scout',
    'eternian_trophy_breaker': 'Eternian-Statue Trophy War-Chief',
    'soapstone_lamp_keeper': 'Soapstone Hearth-Lamp Keeper',
    'angakkuq_aurora_shaman': 'Angakkuq Aurora Spirit-Shaman',
    'great_khaay_khan': 'The Great Khaay-Khan (Voice of Qoold Lheek)',
}

_PAT_DIR = REPO_ROOT / 'core' / 'materials' / 'patterns'
_YETI_TEX_FILES = {
    'yeti_applique':        _PAT_DIR / 'khaayken' / 'applique-hanging' / 'albedo.jpg',
    'yeti_beadwork':        _PAT_DIR / 'khaayken' / 'beadwork' / 'albedo.jpg',
    'yeti_antler_carve':    _PAT_DIR / 'khaayken' / 'engraved-antler' / 'albedo.jpg',
    'yeti_fur_mosaic':      _PAT_DIR / 'khaayken' / 'fur-mosaic' / 'albedo.jpg',
    'yeti_ob_band':         _PAT_DIR / 'khaayken' / 'ob-band' / 'albedo.jpg',
    'yeti_serge':           _PAT_DIR / 'khaayken' / 'serge-carving' / 'albedo.jpg',
    'yeti_amur_scroll':     _PAT_DIR / 'khaayken' / 'amur-scroll' / 'albedo.jpg',
    'yeti_trophy_maze':     _PAT_DIR / 'eternian' / 'circuit-maze' / 'albedo.jpg',
    'yeti_trophy_frieze':   _PAT_DIR / 'eternian' / 'face-frieze' / 'albedo.jpg',
    'yeti_trophy_screen':   _PAT_DIR / 'eternian' / 'screen-pierced' / 'albedo.jpg',
}
_YETI_TEX_CACHE = {}


def _sample_disk_sheet(key, w, h, fg, bg, blend=0.28):
    if key not in _YETI_TEX_CACHE:
        arr = None
        p = paint_mod._resolve_lfs(_YETI_TEX_FILES[key])
        if p.exists() and p.stat().st_size > 500:
            try:
                im = Image.open(p).convert('RGB')
                px = np.asarray(im, dtype=np.float32) / 255.0
                arr = np.power(np.clip(px, 0.0, 1.0), 2.2)
            except Exception:
                arr = None
        _YETI_TEX_CACHE[key] = arr
    src = _YETI_TEX_CACHE[key]
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


def _yeti_wedge_script(w, h, fg, bg):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)
    gu = np.floor(u * 10.0).astype(int)
    cu = (u * 10.0) % 1.0 - 0.5
    cv = (v * 3.0) % 1.0 - 0.5
    orient = (gu % 4)
    w1 = (orient == 0) & (np.abs(cv - 0.65 * np.abs(cu) + 0.15) < 0.09) & (np.abs(cu) < 0.34)
    w2 = (orient == 1) & (np.abs(cv + 0.65 * np.abs(cu) - 0.15) < 0.09) & (np.abs(cu) < 0.34)
    w3 = (orient == 2) & (np.abs(cu - 0.65 * np.abs(cv) + 0.15) < 0.09) & (np.abs(cv) < 0.34)
    w4 = (orient == 3) & ((np.abs(cu) < 0.08) & (np.abs(cv) < 0.32) | (np.abs(cv) < 0.08) & (np.abs(cu) < 0.28))
    rail = (v < 0.09) | (v > 0.91)
    img[w1 | w2 | w3 | w4 | rail] = fg
    return np.clip(img, 0.0, 1.0)


@contextmanager
def _yeti_motif_ctx():
    orig = paint_mod.motif

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in _YETI_TEX_FILES:
            return _sample_disk_sheet(style, w, h, fg, bg)
        if style == 'yeti_wedge_script':
            return _yeti_wedge_script(w, h, fg, bg)
        return orig(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched
    try:
        yield
    finally:
        paint_mod.motif = orig


# ===========================================================================================================
# SHARED GEOMETRY HELPERS
# ===========================================================================================================
def _open_brow_dome(name, paint, f_brow=0.60, f_low=0.06, high=1.14, ease=0.018, rows=12, n=36):
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
        r_eq[j] = (float(h_eq) if (h_eq is not None and 0.045 < h_eq < 0.145) else 0.096) + ease_use
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
                r_ij = r_eq[j] * max(0.04, math.sqrt(max(0.0, 1.0 - u_top ** 1.85)))
                if f_ij <= 0.96:
                    h_hit = first_hit(c_pos, d)
                    if h_hit is not None and 0.020 < h_hit < 0.145:
                        r_ij = max(r_ij, float(h_hit) + ease_use)
            Q[i, j] = c_pos + d * r_ij
    apex = b + up * max(0.028, (high_use - 1.0) * H + ease_use * 0.6)
    Q[-1] = apex + (Q[-1] - apex) * 0.04
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _faceplate_with_slits(gid, mask_paint, bar_paint=None):
    fp = sculpted_faceplate(f'{gid}_mask', mask_paint, f_top=0.74, f_bot=-0.05, ease=0.013, jaw_narrow=0.32)
    a, b, up, bk, left = head_frame()
    fwd = -bk
    R_f, C_f = fp.P.shape[:2]
    r_eye = int(round(0.38 * (R_f - 1)))
    r_brow = int(round(0.28 * (R_f - 1)))
    c_mid = C_f // 2
    parts = [fp]
    for c0, c1, tag in ((max(2, c_mid - 8), max(4, c_mid - 2), 'R'), (min(C_f - 5, c_mid + 2), min(C_f - 3, c_mid + 8), 'L')):
        pts = [fp.P[r_eye, k] + fwd * 0.0042 for k in range(c0, c1 + 1)]
        parts.append(tube(f'{gid}_slit_{tag}', pts, 0.0052, P('soot', 0.02, fabric='metal.iron'), n=8, rigid_joint='Head'))
    bp = bar_paint or P('bone', 0.04, fabric='leather.buckskin')
    brow_pts = [fp.P[r_brow, k] + fwd * 0.0040 for k in range(max(2, c_mid - 9), min(C_f - 2, c_mid + 10), 2)]
    parts.append(tube(f'{gid}_brow', brow_pts, 0.0050, bp, n=8, rigid_joint='Head'))
    nose_pts = [fp.P[r, c_mid] + fwd * 0.0042 for r in range(r_brow, min(R_f - 2, r_brow + 7))]
    parts.append(tube(f'{gid}_nose', nose_pts, 0.0048, bp, n=8, rigid_joint='Head'))
    return parts


def _dorsal_pad(gid, pad_paint, z_off=-0.01, pad_size=(0.18, 0.045, 0.22), clearance=0.024):
    c_sp = spine_at(core.CHEST + z_off)
    anc = surface_out(c_sp, BACK_DIR, clearance, bvh=core.BVH_T)
    pad = blob(f'{gid}_pad', anc, pad_size, pad_paint, n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, anc


def _host_anchor(host_part, target_pt):
    pts = host_part.P.reshape(-1, 3)
    idx = int(np.argmin(np.linalg.norm(pts - np.asarray(target_pt, dtype=np.float64), axis=1)))
    return pts[idx].copy()


# ===========================================================================================================
# SHARED / REUSABLE LOWERS, BOOTS & MITTS (`yeti_{s}_*`)
# ===========================================================================================================
def _build_shared_pieces(sex):
    entries = []
    # 1. Knee-length buckskin breeches (leaves lower calves bare so shaggy Yeti pelt shows!)
    p_buck = P('yeti_caribou', 0.06, [
        B('bottom', 0.0, 0.05, 'yeti_ob_band', 'yeti_qiviut', 'yeti_caribou', 0.10),
    ], fabric='leather.buckskin')
    entries.append(assemble_garment(
        f'yeti_{sex}_steppe_breeches', 'Khaayken Knee-Cut Buckskin Breeches', 'legs', 'khaayken',
        trousers(f'yeti_{sex}_steppe_breeches', p_buck, ankle_f=0.22, ease=0.015, bag=0.008, rows=10, n=22),
        legged=True,
    ))

    # 2. Full fur/felt winter leggings (tucked into mukluks)
    p_hide_leg = P('yeti_caribou', 0.06, [
        B('bottom', 0.0, 0.04, 'solid', 'yeti_qiviut'),
    ], [PN(0.0, 1.0, 'yeti_fur_mosaic', 'yeti_qiviut', 'yeti_caribou', 0.20)], fabric='fur.caribou')
    entries.append(assemble_garment(
        f'yeti_{sex}_hide_leggings', 'Khaayken Caribou-Hide Winter Leggings', 'legs', 'khaayken',
        trousers(f'yeti_{sex}_hide_leggings', p_hide_leg, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 3. Oiled gutskin/sealskin waterproof trousers
    p_oil_leg = P('yeti_gutskin', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'yeti_muskox'),
    ], [PN(0.0, 1.0, 'khaayken_gutskin_parka', 'yeti_qiviut', 'yeti_gutskin', 0.18)], fabric='hide.gut')
    entries.append(assemble_garment(
        f'yeti_{sex}_oiled_trousers', 'Qoold Lheek Oiled Sealskin & Gut Trousers', 'legs', 'khaayken',
        trousers(f'yeti_{sex}_oiled_trousers', p_oil_leg, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 4. Cream qiviut wool hose
    p_qiv_leg = P('yeti_qiviut', 0.05, [
        B('bottom', 0.0, 0.05, 'yeti_beadwork', 'madder', 'yeti_qiviut', 0.10),
    ], fabric=WOOL)
    entries.append(assemble_garment(
        f'yeti_{sex}_qiviut_hose', 'Spun Qiviut Underwool Hose', 'legs', 'khaayken',
        trousers(f'yeti_{sex}_qiviut_hose', p_qiv_leg, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 5.Frost-white blizzard stealth gaiter-trousers
    p_white_leg = P('yeti_frostpelt', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'bone'),
    ], fabric='fur.caribou')
    entries.append(assemble_garment(
        f'yeti_{sex}_white_gaiters', 'Outer-Wall Frost-Pelt Stealth Trousers', 'legs', 'khaayken',
        trousers(f'yeti_{sex}_white_gaiters', p_white_leg, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 6. Eternian looted screen-pierced tasset kilt (starts at WAIST - 0.044 below belt to prevent suprapubic clipping!)
    p_tasset = P('verdigris', 0.05, [
        B('bottom', 0.0, 0.06, 'yeti_trophy_screen', 'gold', 'yeti_muskox', 0.12),
        B('top', 0.0, 0.03, 'solid', 'bronze'),
    ], [PN(0.0, 1.0, 'yeti_trophy_screen', 'verdigris', 'yeti_muskox', 0.16)], fabric='metal.bronze.verdigris')
    entries.append(assemble_garment(
        f'yeti_{sex}_screen_tassets', 'Captured Eternian Pierced-Screen War Kilt', 'legs', 'khaayken',
        [torso_tube(f'yeti_{sex}_tasset_kilt', core.WAIST - 0.044, core.KNEE + 0.05, 0.025, p_tasset,
                    n=40, rows=14, hang_from=core.WAIST - 0.044, flare=0.08)],
        legged=False,
    ))

    # 7. Royal Khaay-Khan laminar cuisses
    p_royal_leg = P('yeti_frostpelt', 0.04, [
        B('bottom', 0.0, 0.05, 'khaayken_ivory_lamellar', 'bone', 'yeti_bogiron', 0.12),
    ], [PN(0.0, 1.0, 'khaayken_ivory_lamellar', 'bone', 'yeti_glacier', 0.16)], fabric='armor.lamellar.horn')
    entries.append(assemble_garment(
        f'yeti_{sex}_royal_cuisses', 'Royal Qoold Lheek Ivory-Lamellar Cuisses', 'legs', 'khaayken',
        trousers(f'yeti_{sex}_royal_cuisses', p_royal_leg, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # Footwear (4 styles: open summer larch sandals showing furred Yeti feet, snow mukluks, crampon boots, silver royal boots)
    entries.append(assemble_garment(
        f'yeti_{sex}_larch_sandals', 'Leng Woven Larch-Bark & Rawhide Stirrup Sandals', 'feet', 'khaayken',
        sandal(f'yeti_{sex}_larch_sandals', P('yeti_larch', 0.06), P('yeti_caribou', 0.05), laces=2),
    ))

    p_mukluk = P('yeti_caribou', 0.06, [
        B('top', 0.0, 0.05, 'yeti_beadwork', 'yeti_qiviut', 'madder', 0.10),
    ], fabric='fur.caribou')
    entries.append(assemble_garment(
        f'yeti_{sex}_snow_mukluks', 'Caribou-Fur & Qiviut Laced Mukluks', 'feet', 'khaayken',
        boots(f'yeti_{sex}_snow_mukluks', P('yeti_muskox', 0.08), p_mukluk, top=0.42, ease_top=0.026,
              cuff_paint=P('yeti_frostpelt', 0.05, fabric='fur.caribou')),
    ))

    p_crampon = P('yeti_muskox', 0.05, [
        B('top', 0.0, 0.04, 'yeti_antler_carve', 'bone', 'yeti_muskox', 0.10),
    ], fabric='leather.cuir_bouilli')
    entries.append(assemble_garment(
        f'yeti_{sex}_crampon_boots', 'Bog-Iron & Walrus-Ivory Ice-Crampon Boots', 'feet', 'khaayken',
        boots(f'yeti_{sex}_crampon_boots', P('yeti_bogiron', 0.06, fabric='metal.iron'), p_crampon,
              top=0.40, ease_top=0.026, wraps=2, wrap_paint=P('bone', 0.04)),
    ))

    p_bare_crampon = P('yeti_muskox', 0.05, [
        B('top', 0.0, 0.04, 'solid', 'verdigris'),
    ], fabric='fur.muskox')
    entries.append(assemble_garment(
        f'yeti_{sex}_trophy_crampons', 'Trophy-Breaker Snug Bare-Calf Iron Crampons', 'feet', 'khaayken',
        boots(f'yeti_{sex}_trophy_crampons', P('yeti_bogiron', 0.05, fabric='metal.iron'), p_bare_crampon,
              top=0.38, ease_top=0.015),
    ))

    # Gloves & Bracers (4 styles — leaving hands/forearms bare on pelt-display tiers!)
    entries.append(assemble_garment(
        f'yeti_{sex}_fur_mitts', 'Shaggy Caribou & Muskox Winter Gauntlets', 'gloves', 'khaayken',
        full_gloves(f'yeti_{sex}_fur_mitts', P('yeti_frostpelt', 0.06, fabric='fur.caribou'),
                    P('yeti_caribou', 0.06, fabric='fur.caribou'), f0=0.58, ease=0.015),
    ))

    p_bone_brc = P('bone', 0.04, [
        B('top', 0.0, 0.03, 'solid', 'yeti_bogiron'),
        B('bottom', 0.0, 0.03, 'solid', 'yeti_caribou'),
    ], [PN(0.1, 0.9, 'khaayken_ivory_lamellar', 'bone', 'yeti_bogiron', 0.14)], fabric='armor.lamellar.horn')
    entries.append(assemble_garment(
        f'yeti_{sex}_bone_bracers', 'Chukchi Engraved-Antler & Bog-Iron Vambraces', 'gloves', 'khaayken',
        [sleeve(f'yeti_{sex}_bbrc_L', L, p_bone_brc, f0=0.56, f1=0.94, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'yeti_{sex}_bbrc_R', R, p_bone_brc, f0=0.56, f1=0.94, ease=0.014, flare=0.004, rows=7, n=20)],
    ))

    p_pitch_wrap = P('yeti_pycrete', 0.05, [B('top', 0.0, 0.03, 'solid', 'yeti_larch')], fabric='cloth.canvas.oiled')
    entries.append(assemble_garment(
        f'yeti_{sex}_pitch_wraps', 'Pycrete-Mason Pitched Canvas Wrist-Wraps', 'gloves', 'khaayken',
        [sleeve(f'yeti_{sex}_pwrap_L', L, p_pitch_wrap, f0=0.66, f1=0.96, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'yeti_{sex}_pwrap_R', R, p_pitch_wrap, f0=0.66, f1=0.96, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    p_royal_vam = P('silver', 0.03, [B('top', 0.0, 0.04, 'solid', 'gold')],
                    [PN(0.1, 0.9, 'yeti_serge', 'bone', 'silver', 0.14)], fabric='metal.iron')
    entries.append(assemble_garment(
        f'yeti_{sex}_ivory_vambraces', 'Qoold Lheek Silvered Bog-Iron & Ivory Gauntlets', 'gloves', 'khaayken',
        full_gloves(f'yeti_{sex}_ivory_vambraces', p_royal_vam, P('yeti_frostpelt', 0.04, fabric='fur.caribou'),
                    f0=0.55, ease=0.014, knuckle_paint=P('gold', 0.02, fabric='metal.gold')),
    ))
    return entries


# ===========================================================================================================
# 12 KHAAYKEN TIERS (HEAD + TORSO + BACK)
# ===========================================================================================================
def _build_khaayken_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    # --- 1. leng_summer_forager (open_torso=True showing shaggy Yeti pelt!) ---
    gid_h = f'yeti_{sex}_forager_band'
    hb = head_rings(f'{gid_h}_headband', 0.60, 0.71, 0.004,
                    P('yeti_caribou', 0.05, [B('bottom', 0.0, 0.03, 'yeti_ob_band', 'yeti_qiviut', 'yeti_caribou', 0.08)], fabric='leather.buckskin'),
                    n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Leng Forager Antler-Toggle Brow-Band', 'head', 'khaayken', [hb], covers_hair=False))

    gid_t = f'yeti_{sex}_forager_vest'
    vest_p = P('yeti_caribou', 0.06, [
        B('bottom', 0.0, 0.05, 'yeti_ob_band', 'yeti_qiviut', 'madder', 0.10),
        B('top', 0.0, 0.03, 'solid', 'yeti_frostpelt'),
    ], fabric='fur.caribou')
    # Open-front vest (`arc=(-0.72*pi, 0.72*pi)`) on male; sculpted qiviut crop-vest on female leaving arms/shoulders/midriff pelt exposed!
    if sex == 'm':
        v_parts = [torso_tube(f'{gid_t}_vest', core.TOP - 0.01, core.WAIST - 0.02, 0.022, vest_p, n=32, rows=11,
                              arc=(-0.72 * math.pi, 0.72 * math.pi))]
    else:
        v_parts = [torso_tube(f'{gid_t}_halter', core.CHEST + 0.06, core.WAIST + 0.02, 0.020, vest_p, n=38, rows=9)]
    entries.append(assemble_garment(gid_t, 'Leng Open-Pelt Caribou Forager Vest', 'torso', 'khaayken', v_parts, open_torso=True))

    gid_b = f'yeti_{sex}_antler_basket'
    pad, anc = _dorsal_pad(gid_b, P('yeti_larch', 0.05), clearance=0.024)
    creel = horn(f'{gid_b}_creel', [anc - up * 0.11 + BACK_DIR * 0.02, anc + up * 0.14 + BACK_DIR * 0.04], 0.065, 0.095,
                 P('yeti_larch', 0.06, [B('top', 0.0, 0.04, 'yeti_ob_band', 'yeti_qiviut', 'yeti_larch', 0.10)], fabric='straw.reed.plaited'),
                 n=16, rows=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Woven Larch-Root & Antler Gathering Creel', 'back', 'khaayken', [pad, creel]))

    # --- 2. caribou_herder ---
    gid_h = f'yeti_{sex}_earflap_cap'
    bonnet_p = P('yeti_caribou', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'yeti_frostpelt')],
                 [PN(0.0, 1.0, 'yeti_fur_mosaic', 'yeti_qiviut', 'yeti_caribou', 0.18)], fabric='fur.caribou')
    bonnet = hood(f'{gid_h}_bonnet', bonnet_p, ease=0.028, ease_low=0.046, open_front=0.92, low=-0.24, rows=13, n=34, peak=0.04)
    entries.append(assemble_garment(gid_h, 'Caribou-Fur Mosaic Earflap Bonnet', 'head', 'khaayken', [bonnet], covers_hair=True))

    gid_t = f'yeti_{sex}_mosaic_anorak'
    anorak_p = P('yeti_caribou', 0.06, [
        B('bottom', 0.0, 0.08, 'yeti_ob_band', 'yeti_qiviut', 'madder', 0.10),
        B('top', 0.0, 0.04, 'solid', 'yeti_frostpelt'),
    ], [PN(0.0, 1.0, 'khaayken_amur_mosaic', 'yeti_qiviut', 'yeti_caribou', 0.20)], fabric='fur.caribou')
    anorak = torso_tube(f'{gid_t}_parka', core.TOP, core.KNEE + 0.06, 0.029, anorak_p, n=42, rows=20, hang_from=core.WAIST, flare=0.10)
    ruff = collar_disc(f'{gid_t}_ruff', 0.085, P('yeti_frostpelt', 0.06, fabric='fur.caribou'), drop=0.068, ease=0.023)
    entries.append(assemble_garment(gid_t, 'Pieced Caribou Fur-Mosaic Kukhlyanka Anorak', 'torso', 'khaayken',
                                    [anorak, ruff, sleeves(gid_t, 'wrist', 0.020, anorak_p)]))

    gid_b = f'yeti_{sex}_lasso_coil'
    pad, anc = _dorsal_pad(gid_b, P('yeti_caribou', 0.05), clearance=0.032)
    lasso = rosette(f'{gid_b}_maut', anc + BACK_DIR * 0.018, BACK_DIR, left, 0.105,
                    P('buck', 0.05, [B('top', 0.0, 0.03, 'solid', 'bone')], fabric='leather.buckskin'),
                    n=18, thick=0.026, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Braided Rawhide Maut Herding Lasso & Horn Toggle', 'back', 'khaayken', [pad, lasso]))

    # --- 3. qoold_ice_harpooneer ---
    gid_h = f'yeti_{sex}_bone_goggles'
    gog_band = head_rings(f'{gid_h}_band', 0.56, 0.68, 0.004, P('yeti_caribou', 0.05, fabric='leather.buckskin'), n=36, rows=5)
    p_gl = _host_anchor(gog_band, a + (b - a) * 0.60 + left * 0.045 + fwd * 0.09)
    p_gm = _host_anchor(gog_band, a + (b - a) * 0.60 + fwd * 0.105)
    p_gr = _host_anchor(gog_band, a + (b - a) * 0.60 - left * 0.045 + fwd * 0.09)
    slit_visor = tube(f'{gid_h}_visor', [p_gl + fwd * 0.005, p_gm + fwd * 0.010, p_gr + fwd * 0.005], 0.014,
                      P('bone', 0.03, [B('top', 0.0, 0.02, 'solid', 'soot')], fabric='armor.lamellar.horn'), n=10, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Carved Antler Slit Snow-Goggles', 'head', 'khaayken', [gog_band, slit_visor], covers_hair=False))

    gid_t = f'yeti_{sex}_gutskin_kamleika'
    kam_p = P('yeti_gutskin', 0.04, [
        B('bottom', 0.0, 0.06, 'yeti_amur_scroll', 'madder', 'yeti_qiviut', 0.10),
        B('top', 0.0, 0.05, 'yeti_amur_scroll', 'yeti_glacier', 'yeti_qiviut', 0.10),
    ], [PN(0.0, 1.0, 'khaayken_gutskin_parka', 'yeti_qiviut', 'yeti_gutskin', 0.18)], fabric='hide.gut')
    kam_body = torso_tube(f'{gid_t}_anorak', core.TOP, core.KNEE + 0.05, 0.028, kam_p, n=42, rows=20, hang_from=core.WAIST, flare=0.10)
    entries.append(assemble_garment(gid_t, 'Qoold Lheek Oiled Gutskin Waterproof Kamleika', 'torso', 'khaayken',
                                    [kam_body, collar(f'{gid_t}_col', P('yeti_frostpelt', 0.05, fabric='fur.caribou'), height=0.032, ease=0.023),
                                     sleeves(gid_t, 'wrist', 0.019, kam_p)]))

    gid_b = f'yeti_{sex}_float_harpoon_pack'
    pad, anc = _dorsal_pad(gid_b, P('yeti_muskox', 0.05), clearance=0.031)
    bladder = blob(f'{gid_b}_float', anc + up * 0.02 + BACK_DIR * 0.032, (0.15, 0.085, 0.25),
                   P('yeti_gutskin', 0.04, [B('top', 0.0, 0.04, 'solid', 'bone')], fabric='hide.sealslick.oiled'),
                   n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Inflated Seal-Bladder Harpoon Float & Line', 'back', 'khaayken', [pad, bladder]))

    # --- 4. qiviut_weaver_artisan (half-sleeves showing Yeti forearm pelt!) ---
    gid_h = f'yeti_{sex}_beaded_headband'
    bh_p = P('madder', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'yeti_qiviut')],
             [PN(0.0, 1.0, 'yeti_beadwork', 'turq', 'madder', 0.10)], fabric='beads.glass')
    bh = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004, bh_p, n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Trade-Glass Beaded Qiviut Brow-Band', 'head', 'khaayken', [bh], covers_hair=False))

    gid_t = f'yeti_{sex}_applique_tunic'
    ap_p = P('yeti_qiviut', 0.04, [
        B('bottom', 0.0, 0.08, 'yeti_beadwork', 'madder', 'turq', 0.10),
    ], [PN(0.0, 1.0, 'yeti_applique', 'yeti_glacier', 'yeti_qiviut', 0.22)], fabric=WOOL)
    wv_body = torso_tube(f'{gid_t}_tunic', core.TOP, core.KNEE + 0.06, 0.028, ap_p, n=42, rows=20, hang_from=core.WAIST, flare=0.10)
    wv_bib = collar_disc(f'{gid_t}_bib', 0.095, bh_p, drop=0.075, scallop=0.06, ease=0.022)
    entries.append(assemble_garment(gid_t, 'Baker-Lake Narrative Appliqué Qiviut Tunic', 'torso', 'khaayken',
                                    [wv_body, wv_bib, sleeves(gid_t, 'elbow', 0.019, ap_p)]))

    gid_b = f'yeti_{sex}_spindle_satchel'
    pad, anc = _dorsal_pad(gid_b, P('yeti_qiviut', 0.05), clearance=0.031)
    bag = blob(f'{gid_b}_bale', anc + BACK_DIR * 0.024, (0.18, 0.065, 0.19), ap_p, n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Spun Qiviut Fleece & Horn-Spindle Satchel', 'back', 'khaayken', [pad, bag]))

    # --- 5. three_gifts_trader ---
    gid_h = f'yeti_{sex}_muskox_hat'
    mx_dome = tower_hat(f'{gid_h}_dome', 0.14, lambda s: 1.0 + 0.14 * math.sin(s * math.pi) - 0.25 * (s ** 2),
                        P('yeti_muskox', 0.06, [B('bottom', 0.0, 0.04, 'yeti_antler_carve', 'bone', 'yeti_muskox', 0.10)], fabric='fur.muskox'),
                        f=0.61, ease=0.014, rows=10, n=36)
    entries.append(assemble_garment(gid_h, 'Shaggy Muskox-Pelt Trader Dome Hat', 'head', 'khaayken', [mx_dome], covers_hair=True))

    gid_t = f'yeti_{sex}_merchant_parka'
    tr_p = P('yeti_glacier', 0.05, [
        B('bottom', 0.0, 0.08, 'yeti_amur_scroll', 'yeti_qiviut', 'yeti_muskox', 0.12),
        B('top', 0.0, 0.04, 'solid', 'yeti_muskox'),
    ], [PN(0.0, 1.0, 'yeti_wedge_script', 'yeti_qiviut', 'yeti_glacier', 0.16)], fabric=WOOL)
    tr_coat = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE - 0.02, 0.029, tr_p, n=42, rows=21, hang_from=core.WAIST, flare=0.11)
    tr_belt = belt_sash(f'{gid_t}_belt', core.WAIST - 0.02, core.WAIST + 0.03,
                        P('bone', 0.03, [B('top', 0.0, 0.02, 'yeti_antler_carve', 'soot', 'bone', 0.08)], fabric='armor.lamellar.horn'), ease=0.035)
    entries.append(assemble_garment(gid_t, 'Three-Gifts Merchant Coat & Antler Plaque Belt', 'torso', 'khaayken',
                                    [tr_coat, collar_disc(f'{gid_t}_furcol', 0.085, P('yeti_muskox', 0.06, fabric='fur.muskox'), drop=0.068, ease=0.023),
                                     sleeves(gid_t, 'wrist', 0.020, tr_p), tr_belt]))

    gid_b = f'yeti_{sex}_three_gifts_pack'
    pad, anc = _dorsal_pad(gid_b, P('yeti_larch', 0.05), pad_size=(0.20, 0.048, 0.25), clearance=0.033)
    bale_top = blob(f'{gid_b}_qiviut_bale', anc + up * 0.08 + BACK_DIR * 0.028, (0.21, 0.080, 0.14),
                    P('yeti_qiviut', 0.05, [B('top', 0.0, 0.03, 'solid', 'yeti_larch')], fabric=WOOL), n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    lamp_bot = blob(f'{gid_b}_soapstone_box', anc - up * 0.07 + BACK_DIR * 0.026, (0.18, 0.070, 0.13),
                    P('yeti_soapstone', 0.04, [B('top', 0.0, 0.03, 'solid', 'bone')], fabric='stone.obsidian.pancake_flaked'), n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Three-Gifts Larch Pack (Qiviut, Horn Spoons & Soapstone Lamps)', 'back', 'khaayken',
                                    [pad, bale_top, lamp_bot]))

    # --- 6. pycrete_mason (sleeveless fur jerkin + pycrete apron: bare Yeti pelt arms & shoulders!) ---
    gid_h = f'yeti_{sex}_sawdust_cap'
    py_cap = _open_brow_dome(f'{gid_h}_cap',
                             P('yeti_pycrete', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'yeti_larch')], fabric='cloth.canvas.oiled'),
                             f_brow=0.61, f_low=0.12, high=1.14, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Cold Lake Pycrete-Mason Pitched Canvas Cap', 'head', 'khaayken', [py_cap], covers_hair=True))

    gid_t = f'yeti_{sex}_pycrete_apron'
    jerkin_p = P('yeti_caribou', 0.06, fabric='fur.caribou')
    apron_p = P('yeti_pycrete', 0.06, [
        B('bottom', 0.0, 0.05, 'yeti_serge', 'yeti_larch', 'yeti_pycrete', 0.10),
        B('top', 0.0, 0.03, 'solid', 'yeti_larch'),
    ], [PN(0.0, 1.0, 'yeti_serge', 'yeti_larch', 'yeti_pycrete', 0.18)], fabric='cloth.canvas.oiled')
    py_jerkin = torso_tube(f'{gid_t}_jerkin', core.CHEST + 0.06, core.WAIST - 0.030, 0.021, jerkin_p, n=38, rows=10)
    py_apron = tabard(f'{gid_t}_apron', core.KNEE + 0.06, core.CHEST + 0.04, apron_p, width=0.22, front=True, back=False, ease=0.032)
    py_belt = belt_sash(f'{gid_t}_belt', core.WAIST - 0.02, core.WAIST + 0.03,
                        P('yeti_larch', 0.05, [B('top', 0.0, 0.03, 'yeti_serge', 'bone', 'yeti_larch', 0.08)]), ease=0.038)
    entries.append(assemble_garment(gid_t, 'Sawdust-Pycrete Mason Apron & Bare-Arm Fur Jerkin', 'torso', 'khaayken',
                                    [py_jerkin, py_apron, py_belt], open_torso=True))

    gid_b = f'yeti_{sex}_pycrete_hod'
    pad, anc = _dorsal_pad(gid_b, P('yeti_larch', 0.05), clearance=0.025)
    block = blob(f'{gid_b}_block', anc + BACK_DIR * 0.026, (0.20, 0.075, 0.22),
                 P('yeti_frostpelt', 0.04, [B('bottom', 0.0, 0.05, 'solid', 'yeti_pycrete')], fabric='cloth.canvas.oiled'),
                 n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Larch Hod Carrying Cast Pycrete Dome-Block', 'back', 'khaayken', [pad, block]))

    # --- 7. antler_lamellar_skirmisher ---
    gid_h = f'yeti_{sex}_antler_helm'
    ah_p = P('bone', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'yeti_bogiron'),
    ], [PN(0.0, 1.0, 'khaayken_ivory_lamellar', 'bone', 'yeti_bogiron', 0.16)], fabric='armor.lamellar.horn')
    ah_cone = tower_hat(f'{gid_h}_cone', 0.20, lambda s: 1.0 - 0.72 * (s ** 1.15), ah_p, f=0.60, ease=0.014, rows=11, n=36)
    entries.append(assemble_garment(gid_h, 'Chukchi Antler & Bog-Iron Conical Slat Helm', 'head', 'khaayken', [ah_cone], covers_hair=True))

    gid_t = f'yeti_{sex}_antler_corselet'
    lam_p = P('bone', 0.04, [
        B('bottom', 0.0, 0.06, 'solid', 'yeti_larch'),
        B('top', 0.0, 0.04, 'solid', 'yeti_bogiron'),
    ], [PN(0.0, 1.0, 'khaayken_ivory_lamellar', 'bone', 'yeti_larch', 0.16)], fabric='armor.lamellar.horn')
    sk_under = torso_tube(f'{gid_t}_under', core.TOP, core.WAIST - 0.035, 0.019, P('yeti_caribou', 0.06, fabric='fur.caribou'), n=38, rows=11)
    sk_cuir = torso_tube(f'{gid_t}_cuirass', core.CHEST + 0.06, core.WAIST - 0.040, 0.029, lam_p, n=42, rows=11)
    entries.append(assemble_garment(gid_t, 'Bog-Iron, Larch & Engraved-Antler Lamellar Corselet', 'torso', 'khaayken',
                                    [sk_under, sleeves(gid_t, 'elbow', 0.018, P('yeti_caribou', 0.06, fabric='fur.caribou')),
                                     sk_cuir, pauldron(f'{gid_t}_pL', L, lam_p), pauldron(f'{gid_t}_pR', R, lam_p)]))

    gid_b = f'yeti_{sex}_wing_shield_cape'
    pad, anc = _dorsal_pad(gid_b, lam_p, pad_size=(0.24, 0.038, 0.24), clearance=0.032)
    wing_l = horn(f'{gid_b}_wingL', [anc + left * 0.06, anc + left * 0.20 + up * 0.22 + BACK_DIR * 0.03], 0.042, 0.018, lam_p, n=10, rows=6, rigid_joint='Spine2')
    wing_r = horn(f'{gid_b}_wingR', [anc - left * 0.06, anc - left * 0.20 + up * 0.22 + BACK_DIR * 0.03], 0.042, 0.018, lam_p, n=10, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Chukchi Dorsal Rawhide-and-Bone Arrow-Catcher Wing', 'back', 'khaayken', [pad, wing_l, wing_r]))

    # --- 8. blizzard_pass_scout ---
    gid_h = f'yeti_{sex}_whiteout_hood'
    wh_p = P('yeti_frostpelt', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'bone')], fabric='fur.caribou')
    wh_hood = hood(f'{gid_h}_hood', wh_p, ease=0.028, ease_low=0.048, open_front=0.80, low=-0.26, rows=14, n=34, peak=0.06)
    wh_fp = _faceplate_with_slits(gid_h, P('bone', 0.03, [B('top', 0.0, 0.03, 'yeti_antler_carve', 'soot', 'bone', 0.08)], fabric='armor.lamellar.horn'))
    entries.append(assemble_garment(gid_h, 'Whiteout Storm-Hood & Carved Bone Wind-Visor', 'head', 'khaayken',
                                    [wh_hood] + wh_fp, covers_hair=True, covers_face=True))

    gid_t = f'yeti_{sex}_whiteout_parka'
    wh_parka = torso_tube(f'{gid_t}_parka', core.TOP, core.KNEE + 0.05, 0.029, wh_p, n=42, rows=20, hang_from=core.WAIST, flare=0.10)
    entries.append(assemble_garment(gid_t, 'Outer-Wall Frost-White Caribou Stealth Parka', 'torso', 'khaayken',
                                    [wh_parka, collar_disc(f'{gid_t}_capelet', 0.105, wh_p, drop=0.080, ease=0.023),
                                     sleeves(gid_t, 'wrist', 0.020, wh_p)]))

    gid_b = f'yeti_{sex}_snowshoe_quiver'
    pad, anc = _dorsal_pad(gid_b, P('yeti_larch', 0.05), clearance=0.032)
    ss_l = horn(f'{gid_b}_shoeL', [anc - left * 0.08 - up * 0.14 + BACK_DIR * 0.016, anc + left * 0.09 + up * 0.16 + BACK_DIR * 0.016],
                0.042, 0.038, P('yeti_larch', 0.05, [B('top', 0.0, 0.04, 'solid', 'bone')], fabric='straw.reed.plaited'), n=10, rows=6, rigid_joint='Spine2')
    ss_r = horn(f'{gid_b}_shoeR', [anc + left * 0.08 - up * 0.14 + BACK_DIR * 0.024, anc - left * 0.09 + up * 0.16 + BACK_DIR * 0.024],
                0.042, 0.038, P('yeti_larch', 0.05, [B('top', 0.0, 0.04, 'solid', 'bone')], fabric='straw.reed.plaited'), n=10, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Crossed Larch Snowshoes & Sinew Bow-Case', 'back', 'khaayken', [pad, ss_l, ss_r]))

    # --- 9. eternian_trophy_breaker (Eternian-statue trophy war-chief, open_torso=True showing pelt!) ---
    gid_h = f'yeti_{sex}_trophy_visage_helm'
    et_frieze_p = P('verdigris', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'yeti_trophy_frieze', 'gold', 'verdigris', 0.18)], fabric='metal.bronze.verdigris')
    tr_hood = _open_brow_dome(f'{gid_h}_hood', P('yeti_muskox', 0.06, fabric='fur.muskox'), f_brow=0.60, f_low=0.06, high=1.14, ease=0.018)
    tr_brow = crown_band(f'{gid_h}_frieze_crown', et_frieze_p, f0=0.59, f1=0.82, ease=0.022, flare=0.014, rows=6, n=36)
    entries.append(assemble_garment(gid_h, 'Muskox War-Helm Crowned with Captured Eternian Statue-Frieze', 'head', 'khaayken',
                                    [tr_hood, tr_brow], covers_hair=True))

    gid_t = f'yeti_{sex}_eternian_loot_cuirass'
    loot_p = P('verdigris', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'gold'),
        B('top', 0.0, 0.04, 'solid', 'bronze'),
    ], [PN(0.0, 1.0, 'yeti_trophy_maze', 'gold', 'verdigris', 0.16)], fabric='metal.bronze.verdigris')
    # Lashed looted Eternian breastplate + statue-fragment pauldrons over bare shaggy Yeti chest/arms!
    tr_chest = torso_tube(f'{gid_t}_plate', core.CHEST + 0.05, core.WAIST + 0.02, 0.022, loot_p, n=38, rows=9)
    tr_sash = crossed_sash(f'{gid_t}_rawhide', P('yeti_muskox', 0.06, [B('top', 0.0, 0.02, 'solid', 'bone')], fabric='fur.muskox'),
                           width=0.072, ease=0.028)
    tr_belt = belt_sash(f'{gid_t}_belt', core.WAIST - 0.014, core.WAIST + 0.030, et_frieze_p, ease=0.020)
    entries.append(assemble_garment(gid_t, 'Captured Eternian Circuit-Maze Breastplate & Statue Pauldrons', 'torso', 'khaayken',
                                    [tr_chest, tr_sash, tr_belt,
                                     pauldron(f'{gid_t}_pL', L, et_frieze_p, ease=0.014),
                                     pauldron(f'{gid_t}_pR', R, et_frieze_p, ease=0.014)],
                                    open_torso=True))

    gid_b = f'yeti_{sex}_trophy_statue_rack'
    pad, anc = _dorsal_pad(gid_b, P('yeti_muskox', 0.06, fabric='fur.muskox'), clearance=0.026)
    plinth = blob(f'{gid_b}_statue_fragment', anc + up * 0.05 + BACK_DIR * 0.026, (0.20, 0.070, 0.25), et_frieze_p,
                  n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Lashed Eternian Bronze Statue-Fragment Trophy Rack', 'back', 'khaayken', [pad, plinth]))

    # --- 10. soapstone_lamp_keeper ---
    gid_h = f'yeti_{sex}_ivory_diadem'
    diadem = head_rings(f'{gid_h}_band', 0.60, 0.73, 0.004,
                        P('bone', 0.03, [B('bottom', 0.0, 0.03, 'yeti_beadwork', 'madder', 'turq', 0.08)], fabric='armor.lamellar.horn'),
                        n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Carved Walrus-Ivory & Trade-Bead Diadem', 'head', 'khaayken', [diadem], covers_hair=False))

    gid_t = f'yeti_{sex}_hearth_robe'
    hr_p = P('yeti_qiviut', 0.04, [
        B('bottom', 0.0, 0.09, 'yeti_amur_scroll', 'madder', 'yeti_glacier', 0.12),
    ], [PN(0.0, 1.0, 'yeti_wedge_script', 'yeti_glacier', 'yeti_qiviut', 0.16)], fabric=WOOL)
    hr_robe = torso_tube(f'{gid_t}_robe', core.TOP, core.ANKLE + 0.07, 0.028, hr_p, n=42, rows=24, hang_from=core.WAIST, flare=0.13)
    hr_stole = tabard(f'{gid_t}_stole', core.KNEE, core.CHEST + 0.06,
                      P('madder', 0.04, [B('bottom', 0.0, 0.05, 'yeti_beadwork', 'turq', 'yeti_qiviut', 0.10)],
                        [PN(0.0, 1.0, 'yeti_amur_scroll', 'yeti_qiviut', 'madder', 0.16)], fabric=WOOL),
                      width=0.17, front=True, back=False, ease=0.038)
    entries.append(assemble_garment(gid_t, 'Ceremonial Qiviut Hearth-Robe & Amur-Scroll Stole', 'torso', 'khaayken',
                                    [hr_robe, hr_stole, sleeves(gid_t, 'wrist', 0.019, hr_p)]))

    gid_b = f'yeti_{sex}_fur_mantle'
    mantle = cape(f'{gid_b}_cape', core.CROTCH + 0.06,
                  P('yeti_frostpelt', 0.06, [B('bottom', 0.0, 0.05, 'yeti_ob_band', 'yeti_caribou', 'yeti_qiviut', 0.10)], fabric='fur.caribou'),
                  ease=0.028, flare=0.09, stiff=0.36, back_push=0.055)
    entries.append(assemble_garment(gid_b, 'Plush Frost-Caribou Hearth Mantle', 'back', 'khaayken', [mantle]))

    # --- 11. angakkuq_aurora_shaman ---
    gid_h = f'yeti_{sex}_angakkuq_mask'
    sh_dome = _open_brow_dome(f'{gid_h}_cap', P('yeti_muskox', 0.06, fabric='fur.muskox'), f_brow=0.60, f_low=0.08, high=1.14, ease=0.018)
    sh_fp = _faceplate_with_slits(gid_h, P('yeti_larch', 0.05, [B('top', 0.0, 0.04, 'yeti_amur_scroll', 'bone', 'madder', 0.10)], fabric='armor.lamellar.horn'))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_r = _host_anchor(sh_dome, a + (b - a) * 0.84 + left * (sgn * 0.085))
        ant_pts = [p_r, p_r + left * (sgn * 0.06) + up * 0.09, p_r + left * (sgn * 0.11) + up * 0.19 - fwd * 0.02]
        sh_fp.append(horn(f'{gid_h}_antler_{tag}', ant_pts, 0.016, 0.005, P('bone', 0.03, fabric='armor.lamellar.horn'), n=8, rows=6, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Angakkuq Caribou-Antler Crown & Driftwood Spirit-Mask', 'head', 'khaayken',
                                    [sh_dome] + sh_fp, covers_hair=True, covers_face=True))

    gid_t = f'yeti_{sex}_spirit_coat'
    sp_p = P('yeti_muskox', 0.06, [
        B('bottom', 0.0, 0.08, 'trim_feather_fringe', 'bone', 'yeti_muskox', 0.10),
    ], [PN(0.0, 1.0, 'yeti_applique', 'madder', 'yeti_qiviut', 0.22)], fabric='fur.muskox')
    sp_coat = torso_tube(f'{gid_t}_coat', core.TOP, core.KNEE + 0.02, 0.029, sp_p, n=42, rows=20, hang_from=core.WAIST, flare=0.11)
    entries.append(assemble_garment(gid_t, 'Angakkuq Bog-Iron Clapper & Appliqué Spirit Coat', 'torso', 'khaayken',
                                    [sp_coat, collar_disc(f'{gid_t}_collar', 0.095, P('bone', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'yeti_bogiron')]), drop=0.072, ease=0.023),
                                     sleeves(gid_t, 'elbow', 0.019, sp_p)]))

    gid_b = f'yeti_{sex}_frame_drum_pack'
    pad, anc = _dorsal_pad(gid_b, P('yeti_muskox', 0.05), clearance=0.032)
    drum = rosette(f'{gid_b}_drum', anc + up * 0.04 + BACK_DIR * 0.020, BACK_DIR, left, 0.135,
                   P('yeti_gutskin', 0.04, [B('top', 0.0, 0.03, 'yeti_amur_scroll', 'madder', 'yeti_gutskin', 0.10)], fabric='hide.gut'),
                   n=20, thick=0.028, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Wide Chukchi Frame-Drum & Whalebone Beater', 'back', 'khaayken', [pad, drum]))

    # --- 12. great_khaay_khan (The Great Khaay-Khan & High King's Voice) ---
    gid_h = f'yeti_{sex}_khan_crown_helm'
    kh_p = P('silver', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'khaayken_ivory_lamellar', 'bone', 'silver', 0.15)], fabric='metal.iron')
    kh_helm = _open_brow_dome(f'{gid_h}_spangenhelm', kh_p, f_brow=0.60, f_low=0.12, high=1.14, ease=0.018)
    kh_parts = [kh_helm]
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        p_a = _host_anchor(kh_helm, a + (b - a) * 0.82 + left * (sgn * 0.088))
        pts_a = [p_a, p_a + left * (sgn * 0.065) + up * 0.10 + fwd * 0.01, p_a + left * (sgn * 0.095) + up * 0.22 + fwd * 0.03]
        kh_parts.append(horn(f'{gid_h}_ivory_horn_{tag}', pts_a, 0.020, 0.005, P('bone', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'gold')], fabric='armor.lamellar.horn'), n=10, rows=6, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Great Khaay-Khan Ivory-Antler Silvered Spangenhelm', 'head', 'khaayken',
                                    kh_parts, covers_hair=True))

    gid_t = f'yeti_{sex}_khan_laminar'
    kh_t_p = P('yeti_frostpelt', 0.04, [
        B('bottom', 0.0, 0.08, 'yeti_serge', 'gold', 'yeti_glacier', 0.10),
        B('top', 0.0, 0.04, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'khaayken_ivory_lamellar', 'bone', 'silver', 0.16)], fabric='armor.lamellar.horn')
    kh_hauberk = torso_tube(f'{gid_t}_hauberk', core.TOP, core.KNEE + 0.02, 0.029, kh_t_p, n=44, rows=21, hang_from=core.WAIST, flare=0.11)
    kh_disc = collar_disc(f'{gid_t}_pectoral', 0.105,
                          P('gold', 0.02, [B('bottom', 0.0, 0.03, 'yeti_serge', 'bone', 'gold', 0.08)], fabric='metal.gold'),
                          drop=0.076, ease=0.023)
    entries.append(assemble_garment(gid_t, 'Great Khaay-Khan Silvered Bog-Iron & Ivory Laminar Hauberk', 'torso', 'khaayken',
                                    [kh_hauberk, kh_disc, sleeves(gid_t, 'wrist', 0.020, kh_t_p),
                                     pauldron(f'{gid_t}_pL', L, kh_p), pauldron(f'{gid_t}_pR', R, kh_p)]))

    gid_b = f'yeti_{sex}_white_muskox_cape'
    kh_cape = cape(f'{gid_b}_mantle', core.CROTCH + 0.05,
                   P('yeti_frostpelt', 0.05, [B('bottom', 0.0, 0.06, 'yeti_ob_band', 'gold', 'yeti_glacier', 0.10)], fabric='fur.muskox'),
                   ease=0.028, flare=0.10, stiff=0.36, back_push=0.058)
    entries.append(assemble_garment(gid_b, 'Royal Frost-White Muskox Sovereign Mantle', 'back', 'khaayken', [kh_cape]))

    return entries


def _outfits_for_sex(sex):
    return {
        'leng_summer_forager': {
            'head': f'yeti_{sex}_forager_band',
            'torso': f'yeti_{sex}_forager_vest',
            'legs': f'yeti_{sex}_steppe_breeches',
            'feet': f'yeti_{sex}_larch_sandals',
            'back': f'yeti_{sex}_antler_basket',
        },
        'caribou_herder': {
            'head': f'yeti_{sex}_earflap_cap',
            'torso': f'yeti_{sex}_mosaic_anorak',
            'gloves': f'yeti_{sex}_fur_mitts',
            'legs': f'yeti_{sex}_hide_leggings',
            'feet': f'yeti_{sex}_snow_mukluks',
            'back': f'yeti_{sex}_lasso_coil',
        },
        'qoold_ice_harpooneer': {
            'head': f'yeti_{sex}_bone_goggles',
            'torso': f'yeti_{sex}_gutskin_kamleika',
            'gloves': f'yeti_{sex}_fur_mitts',
            'legs': f'yeti_{sex}_oiled_trousers',
            'feet': f'yeti_{sex}_crampon_boots',
            'back': f'yeti_{sex}_float_harpoon_pack',
        },
        'qiviut_weaver_artisan': {
            'head': f'yeti_{sex}_beaded_headband',
            'torso': f'yeti_{sex}_applique_tunic',
            'legs': f'yeti_{sex}_qiviut_hose',
            'feet': f'yeti_{sex}_snow_mukluks',
            'back': f'yeti_{sex}_spindle_satchel',
        },
        'three_gifts_trader': {
            'head': f'yeti_{sex}_muskox_hat',
            'torso': f'yeti_{sex}_merchant_parka',
            'gloves': f'yeti_{sex}_pitch_wraps',
            'legs': f'yeti_{sex}_qiviut_hose',
            'feet': f'yeti_{sex}_snow_mukluks',
            'back': f'yeti_{sex}_three_gifts_pack',
        },
        'pycrete_mason': {
            'head': f'yeti_{sex}_sawdust_cap',
            'torso': f'yeti_{sex}_pycrete_apron',
            'gloves': f'yeti_{sex}_pitch_wraps',
            'legs': f'yeti_{sex}_steppe_breeches',
            'feet': f'yeti_{sex}_trophy_crampons',
            'back': f'yeti_{sex}_pycrete_hod',
        },
        'antler_lamellar_skirmisher': {
            'head': f'yeti_{sex}_antler_helm',
            'torso': f'yeti_{sex}_antler_corselet',
            'gloves': f'yeti_{sex}_bone_bracers',
            'legs': f'yeti_{sex}_hide_leggings',
            'feet': f'yeti_{sex}_crampon_boots',
            'back': f'yeti_{sex}_wing_shield_cape',
        },
        'blizzard_pass_scout': {
            'head': f'yeti_{sex}_whiteout_hood',
            'torso': f'yeti_{sex}_whiteout_parka',
            'gloves': f'yeti_{sex}_fur_mitts',
            'legs': f'yeti_{sex}_white_gaiters',
            'feet': f'yeti_{sex}_snow_mukluks',
            'back': f'yeti_{sex}_snowshoe_quiver',
        },
        'eternian_trophy_breaker': {
            'head': f'yeti_{sex}_trophy_visage_helm',
            'torso': f'yeti_{sex}_eternian_loot_cuirass',
            'gloves': f'yeti_{sex}_bone_bracers',
            'legs': f'yeti_{sex}_screen_tassets',
            'feet': f'yeti_{sex}_trophy_crampons',
            'back': f'yeti_{sex}_trophy_statue_rack',
        },
        'soapstone_lamp_keeper': {
            'head': f'yeti_{sex}_ivory_diadem',
            'torso': f'yeti_{sex}_hearth_robe',
            'legs': f'yeti_{sex}_qiviut_hose',
            'feet': f'yeti_{sex}_snow_mukluks',
            'back': f'yeti_{sex}_fur_mantle',
        },
        'angakkuq_aurora_shaman': {
            'head': f'yeti_{sex}_angakkuq_mask',
            'torso': f'yeti_{sex}_spirit_coat',
            'gloves': f'yeti_{sex}_bone_bracers',
            'legs': f'yeti_{sex}_hide_leggings',
            'feet': f'yeti_{sex}_snow_mukluks',
            'back': f'yeti_{sex}_frame_drum_pack',
        },
        'great_khaay_khan': {
            'head': f'yeti_{sex}_khan_crown_helm',
            'torso': f'yeti_{sex}_khan_laminar',
            'gloves': f'yeti_{sex}_ivory_vambraces',
            'legs': f'yeti_{sex}_royal_cuisses',
            'feet': f'yeti_{sex}_crampon_boots',
            'back': f'yeti_{sex}_white_muskox_cape',
        },
    }


def build_khaayken_peoples_entry():
    return {
        'id': 'khaayken',
        'name': 'Khaayken',
        'note': (
            "The Yeti Kingdom (Khaay Qantir / High-Kin) of Qoold Lheek (Cold Lake, +5,680–6,030 m) and Leng (+4,485 m): "
            "broad 1.15x arctic hominids covered in shaggy frost-white/taupe/slate fur (`coat: 'pelt'`), trading spun muskox "
            "`qiviut`, carved horn spoons, and soapstone oil-lamps, building pycrete domes, and wearing bog-iron/larch/antler "
            "lamellar alongside captured Eternian bronze war-trophies (LORE.md §3.1, §6.19; kits/yeti/PLAN.md)."
        ),
        'scale': 1.15,
        'coat': 'pelt',
        'ancestry': {'african': [0.20, 0.50], 'asian': [0.30, 0.60], 'caucasian': [0.10, 0.30]},
        'skin': ['#7a6e66', '#5e544e', '#46403c'],
        'hair': ['#e6e2d8', '#d8d0bf', '#c4b8a2', '#a99a84', '#8a8278', '#6c625a'],
        'eyes': ['#7a8ea0', '#9a8a5a', '#a87a3a', '#5a4a3a'],
        'grey': 0.70,
        'beard': 0.0,
        'morph': {
            'muscle': [0.30, 1.00],
            'weight': [0.20, 0.80],
            'height': [0.30, 1.00],
        },
        'styles': {
            'male': ['long01', 'short02', 'braid01'],
            'female': ['long01', 'braid01', 'elvs_double_mh_braid'],
        },
        'style_share': 1,
        'tiers': KHAAYKEN_TIER_SHARES,
        'tier_labels': KHAAYKEN_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_khaayken_kit():
    entries = []
    with _yeti_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_shared_pieces(sex))
            entries.extend(_build_khaayken_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_khaayken_kit()
    peoples_entry = build_khaayken_peoples_entry()
    manifest_path = CULTURES_DIR / 'khaayken_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'khaayken',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Khaayken pieces ({n_m} male, {n_f} female) across 12 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
