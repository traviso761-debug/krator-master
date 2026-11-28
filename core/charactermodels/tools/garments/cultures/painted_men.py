"""The Painted Men (*Kwéent'qw*) Wardrobe Kit (`painted_men` — Part-Pictish + Part-Tlingit Highlands).

Builds all 13 M+F paired Painted Men tiers (`mpfb_male` `pmn_m_*` & `mpfb_female` `pmn_f_*`)
across the four *Tlàaw-k'wáan* clans, strictly obeying the canonical non-human-face proverb
***"Kwéent' st'éey, x̱wéeys gúu"*** (*"Paint stays, face goes: the crest endures, a human face
is never drawn"*) — zero human faces on any helmet, visor, gorget, shield, brooch, or Chilkat weave:

Societal, Raider, Slat-Armour, Ritual & Chiefly Tiers (`sum = 1.00`):
  1. `cliff_folk`             (`0.18`) — Clan III Camas-Digger & Plaid Commoner
  2. `woodcarver`             (`0.12`) — Clan I Totem-Adze Carver & Brine-Scraper
  3. `cliff_fisher`           (`0.12`) — Clan I/II Moat-Wall Cedar-Bark Rain-Cape Fisher
  4. `sling_hunter`           (`0.12`) — Playa Pronghorn & Blowgun Stalker
  5. `whistle_scout`          (`0.14`) — Clan IV Broken-Stair 6-Tone Whistle-Runner
  6. `slat_warrior`           (`0.10`) — Red-Cedar Rod-and-Slat Clack-Armour Heavy Foot
  7. `warden`                 (`0.06`) — Totem-Warden Raven-Beak Slat Warleader
  8. `woad_champion`          (`0.06`) — Clan IV Pictish Woad-Spiral & Torc Shock-Champion
  9. `totem_singer`           (`0.06`) — Stone-Circle Totem-Singer & Orchil Chilkat Shaman
 10. `clan_chief`             (`0.04`) — Tlàaw-k'wáan Potlatch-Ring & Chilkat-Plaid Clan Chief

PC & Important NPC Flagship Tiers (`share = 0.00`):
 11. `pc_raven_reiver`        (`0.00`) — Broken-Stair Raven Reiver (`pc`)
 12. `hero_tlaaw_warchief`    (`0.00`) — High Warchief of Ts'íik'-tł'íxw (`important_npc`)
 13. `hero_orchil_totemsinger`(`0.00`) — Orchil-Crowned Thunderbird High Seer (`important_npc`)

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/painted_men.py
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

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

from garments import core
from garments import paint as paint_mod
from garments.core import (
    Part, J, L, R, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment,
)
from garments.paint import P, B, PN, C, WOOL
from garments.types.torso import (
    torso_tube, collar_disc, cape, tabard, crossed_sash, pauldron, neck_ring,
)
from garments.types.limbs import sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_rings, hood, conical_hat, tower_hat, crown_band, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, tube, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

# Locked Canonical Pigments (Linear RGB from `painted_men_garment_plan.md`)
PMN_COLORS = {
    'pmn_lignite':  (0.007, 0.008, 0.010),  # #141619 Badland lignite coal primary formline
    'pmn_falu':     (0.470, 0.030, 0.016),  # #b63124 Iron-ochre / paintbrush scarlet secondary formline
    'pmn_teal':     (0.014, 0.155, 0.148),  # #1f6e6c Volcanic celadonite-teal tertiary fill
    'pmn_teal_hi':  (0.028, 0.295, 0.245),  # #2e9488 Bright celadonite-verdigris
    'pmn_woad':     (0.012, 0.035, 0.115),  # #1d355d Canyon-wash Pictish woad-indigo
    'pmn_woad_hi':  (0.036, 0.108, 0.305),  # #355c96 High woad swirl
    'pmn_orchil':   (0.112, 0.020, 0.078),  # #5e2750 Korona slickrock-orchil purple
    'pmn_ochre':    (0.640, 0.330, 0.042),  # #d19a3a Rabbitbrush weld-gold
    'pmn_cedar':    (0.445, 0.195, 0.070),  # #b27a4c Planed canyon-mouth red-cedar
    'pmn_cedar_dk': (0.155, 0.052, 0.018),  # #6e4226 Oiled dark cedar
}
for _k, _v in PMN_COLORS.items():
    C.setdefault(_k, _v)

PAINTED_MEN_TIER_SHARES = [
    ['cliff_folk', 0.18],
    ['woodcarver', 0.12],
    ['cliff_fisher', 0.12],
    ['sling_hunter', 0.12],
    ['whistle_scout', 0.14],
    ['slat_warrior', 0.10],
    ['warden', 0.06],
    ['woad_champion', 0.06],
    ['totem_singer', 0.06],
    ['clan_chief', 0.04],
    ['pc_raven_reiver', 0.0],
    ['hero_tlaaw_warchief', 0.0],
    ['hero_orchil_totemsinger', 0.0],
]

PAINTED_MEN_TIER_LABELS = {
    'cliff_folk': 'Camas-Digger & Plaid Commoner (Clan III)',
    'woodcarver': 'Totem-Adze Carver & Brine-Scraper (Clan I)',
    'cliff_fisher': 'Moat-Wall Cedar-Bark Rain-Cape Fisher (Clan I/II)',
    'sling_hunter': 'Playa Pronghorn & Blowgun Stalker',
    'whistle_scout': 'Broken-Stair 6-Tone Whistle-Runner (Clan IV)',
    'slat_warrior': 'Cedar Clack-Armour Heavy Foot',
    'warden': 'Totem-Warden Raven-Crest Slat Warleader',
    'woad_champion': 'Pictish Woad-Spiral & Torc Shock-Champion',
    'totem_singer': 'Stone-Circle Totem-Singer & Orchil Shaman',
    'clan_chief': 'Tlàaw-k\'wáan Potlatch-Ring & Chilkat Clan Chief',
    'pc_raven_reiver': 'Broken-Stair Raven Reiver (PC)',
    'hero_tlaaw_warchief': 'High Warchief of Ts\'íik\'-tł\'íxw',
    'hero_orchil_totemsinger': 'Orchil-Crowned Thunderbird High Seer',
}

PMN_CUSTOM_MOTIFS = {
    'pmn_tartan_woad',
    'pmn_cedar_bark',
    'pmn_avian_ovoid',
}


def _pmn_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'pmn_tartan_woad':
        # 6-dye Pictish highland 2/2 diagonal twill tartan sett (woad, teal, lignite, falu, ochre, orchil)
        su = (u * 6.0) % 1.0
        sv = (v * 6.0) % 1.0
        teal_u = (su > 0.25) & (su < 0.75)
        teal_v = (sv > 0.25) & (sv < 0.75)
        img[teal_u ^ teal_v] = 0.55 * np.asarray(bg) + 0.45 * np.asarray(C['pmn_teal'])
        img[teal_u & teal_v] = C['pmn_teal']
        guard = (np.abs(su - 0.25) < 0.04) | (np.abs(su - 0.75) < 0.04) | (np.abs(sv - 0.25) < 0.04) | (np.abs(sv - 0.75) < 0.04)
        over_ochre = (np.abs(su - 0.50) < 0.025) | (np.abs(sv - 0.50) < 0.025)
        over_falu = (np.abs(su - 0.02) < 0.022) | (np.abs(sv - 0.02) < 0.022)
        img[guard] = C['pmn_lignite']
        img[over_ochre] = fg
        img[over_falu] = C['pmn_falu']
        return np.clip(img, 0.0, 1.0)

    if style == 'pmn_cedar_bark':
        # Beaten vertical shredded inner-cedar-bark strands twined horizontally every 3 cm with spruce-root cord
        fib = 0.84 + 0.16 * np.sin(u * 2.0 * math.pi * 28.0 + 0.5 * np.sin(v * 18.0))
        twine = ((v * 9.0) % 1.0) < 0.11
        img[:] = np.asarray(bg)[None, None, :] * fib[:, :, None]
        img[twine] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'pmn_avian_ovoid':
        # Strictly zoomorphic Tlingit Raven/Thunderbird paired ovoid eyes & split-U feather (ZERO human mouth!)
        cu = (u * 2.0) % 1.0 - 0.5
        cv = v - 0.5
        ovoid_outer = ((cu / 0.34) ** 2 + (cv / 0.26) ** 2 < 1.0)
        ovoid_inner = ((cu / 0.22) ** 2 + (cv / 0.15) ** 2 < 1.0)
        pupil = ((cu / 0.12) ** 2 + (cv / 0.08) ** 2 < 1.0)
        split_u = (np.abs(cu) < 0.045) & (cv > 0.0)
        img[ovoid_outer] = C['pmn_lignite']
        img[ovoid_inner] = fg
        img[pupil] = C['pmn_teal_hi']
        img[split_u] = C['pmn_falu']
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def _pmn_motif_ctx():
    orig = paint_mod.motif
    paint_mod.FABRIC.setdefault('plumage.feathers.raptor', 0.22)

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in PMN_CUSTOM_MOTIFS:
            return _pmn_motif(style, w, h, fg, bg, aspect=aspect)
        return orig(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched
    try:
        yield
    finally:
        paint_mod.motif = orig


# ===========================================================================================================
# GEOMETRY HELPERS (OPEN-FACE ANIMAL CASQUES & FLUSH DORSAL RIGS)
# ===========================================================================================================
def _animal_casque(gid, wood_paint, beak_paint, kind='raven'):
    """Open-face carved cedar/ironwood zoomorphic war-casque (Raven, Bear, Boar, Thunderbird — ZERO human face!)."""
    a, b, up, bk, left = head_frame()
    H = float(np.linalg.norm(b - a))
    fwd = -bk
    angles = np.linspace(0.0, 2.0 * math.pi, 36, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angles]
    f_low, f_brow, high, ease_use = 0.08, 0.61, 1.14, 0.018
    f_rim = np.full(36, f_low, dtype=np.float64)
    half_span = 0.56 * math.pi
    for j, an in enumerate(angles):
        af = abs(an - math.pi)
        if af < half_span:
            w = 0.5 + 0.5 * math.cos(math.pi * af / half_span)
            f_rim[j] = f_low + (f_brow - f_low) * (w ** 0.78)
    c_eq = a + (b - a) * 0.56
    r_eq = np.zeros(36, dtype=np.float64)
    for j, d in enumerate(ds):
        h_eq = first_hit(c_eq, d)
        r_eq[j] = (float(h_eq) if (h_eq is not None and 0.045 < h_eq < 0.145) else 0.096) + ease_use
    rows = 12
    Q = np.zeros((rows, 36, 3), dtype=np.float64)
    for i in range(rows):
        u = i / float(rows - 1)
        for j, d in enumerate(ds):
            f_ij = float(f_rim[j]) + (high - float(f_rim[j])) * u
            c_pos = a + (b - a) * f_ij
            if f_ij <= 0.72:
                c_ray = a + (b - a) * max(f_ij, 0.15)
                h_hit = first_hit(c_ray, d)
                r_ij = (float(h_hit) if (h_hit is not None and 0.045 < h_hit < 0.145) else (r_eq[j] - ease_use)) + ease_use
            else:
                u_top = min(1.0, (f_ij - 0.72) / max(0.08, high - 0.72))
                r_ij = r_eq[j] * max(0.04, math.sqrt(max(0.0, 1.0 - u_top ** 1.85)))
                if f_ij <= 0.96:
                    h_hit = first_hit(c_pos, d)
                    if h_hit is not None and 0.020 < h_hit < 0.145:
                        r_ij = max(r_ij, float(h_hit) + ease_use)
            Q[i, j] = c_pos + d * r_ij
    apex = b + up * max(0.028, (high - 1.0) * H + ease_use * 0.6)
    Q[-1] = apex + (Q[-1] - apex) * 0.04
    bowl = Part(f'{gid}_casque', Q, True, ['body'] * rows, wood_paint, rigid_joint='Head')
    parts = [bowl]

    pts_flat = bowl.P.reshape(-1, 3)

    def _anc(target):
        idx = int(np.argmin(np.linalg.norm(pts_flat - np.asarray(target, dtype=np.float64), axis=1)))
        return pts_flat[idx].copy()

    p_front = _anc(a + (b - a) * 0.76 + fwd * 0.11)
    if kind in ('raven', 'reiver', 'warchief'):
        # Projecting avian Raven beak above brow + abalone ovoid eye-bosses on temples
        parts.append(horn(f'{gid}_raven_beak', [p_front, p_front + fwd * 0.095 - up * 0.015], 0.028, 0.005,
                          beak_paint, n=10, rows=6, rigid_joint='Head'))
    elif kind == 'bear':
        # Roaring Bear upper snout + twin rounded bear ear-bosses on crown
        parts.append(blob(f'{gid}_bear_snout', p_front + fwd * 0.018, (0.075, 0.055, 0.052),
                          beak_paint, n=12, rows=6, out=fwd, rigid_joint='Head'))
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            pe = _anc(a + (b - a) * 0.94 + left * (sgn * 0.075))
            parts.append(blob(f'{gid}_bear_ear_{tag}', pe + up * 0.015, (0.042, 0.024, 0.042),
                              P('pmn_teal_hi', 0.03, [B('top', 0.0, 0.02, 'solid', 'pmn_lignite')]),
                              n=10, rows=5, out=left * sgn, rigid_joint='Head'))
    elif kind == 'boar':
        # Pictish boar tusks & dorsal bristle-ridge
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            pt = _anc(a + (b - a) * 0.72 + left * (sgn * 0.055) + fwd * 0.08)
            parts.append(horn(f'{gid}_boar_tusk_{tag}', [pt, pt + fwd * 0.055 + up * 0.045 + left * (sgn * 0.02)],
                              0.013, 0.004, P('bone', 0.02, fabric='armor.lamellar.horn'), n=8, rows=5, rigid_joint='Head'))
    elif kind == 'thunderbird':
        # Hooked Thunderbird raptor beak + twin swept horn-curls
        parts.append(horn(f'{gid}_tbird_beak', [p_front, p_front + fwd * 0.070 + up * 0.01, p_front + fwd * 0.085 - up * 0.030],
                          0.026, 0.005, beak_paint, n=10, rows=6, rigid_joint='Head'))
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            ph = _anc(a + (b - a) * 0.88 + left * (sgn * 0.075))
            parts.append(horn(f'{gid}_tbird_horn_{tag}', [ph, ph + left * (sgn * 0.055) + up * 0.11 - fwd * 0.02],
                              0.016, 0.005, P('pmn_teal_hi', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'pmn_ochre')]),
                              n=8, rows=5, rigid_joint='Head'))

    if kind == 'warchief':
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            ph = _anc(a + (b - a) * 0.86 + left * (sgn * 0.082))
            parts.append(horn(f'{gid}_copper_fin_{tag}', [ph, ph + left * (sgn * 0.045) + up * 0.13 - fwd * 0.03],
                              0.018, 0.005, P('verdigris', 0.03, fabric='metal.bronze.verdigris'), n=8, rows=5, rigid_joint='Head'))
    return parts


def _dorsal_pad(gid, pad_paint, z_off=-0.01, pad_size=(0.18, 0.044, 0.22), clearance=0.024):
    c_sp = spine_at(core.CHEST + z_off)
    anc = surface_out(c_sp, BACK_DIR, clearance, bvh=core.BVH_T)
    pad = blob(f'{gid}_pad', anc, pad_size, pad_paint, n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, anc


# ===========================================================================================================
# SHARED BRACCAE, KILTS, BOOTS & BRACERS (`pmn_{s}_*`)
# ===========================================================================================================
def _build_shared_pieces(sex):
    entries = []
    # 1. Woad-check Pictish highland braccae
    p_woad_brc = P('pmn_woad', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'pmn_ochre'),
    ], [PN(0.0, 1.0, 'pmn_tartan_woad', 'pmn_ochre', 'pmn_woad', 0.18)], fabric=WOOL)
    entries.append(assemble_garment(
        f'pmn_{sex}_woad_check_braccae', 'Fulled Woad & Ochre Checked Braccae', 'legs', 'painted_men',
        trousers(f'pmn_{sex}_woad_check_braccae', p_woad_brc, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 2. Ochre & cedar-dyed artisan wool braccae
    p_ochre_brc = P('pmn_cedar', 0.05, [
        B('bottom', 0.0, 0.04, 'formline_eye', 'pmn_teal', 'pmn_lignite', 0.10),
    ], fabric=WOOL)
    entries.append(assemble_garment(
        f'pmn_{sex}_ochre_wool_braccae', 'Ochre-Dyed Highland Carver Braccae', 'legs', 'painted_men',
        trousers(f'pmn_{sex}_ochre_wool_braccae', p_ochre_brc, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 3. Dark lignite & woad night-raider braccae
    p_dark_brc = P('pmn_lignite', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'pmn_teal_hi'),
    ], [PN(0.0, 1.0, 'pictish_woad_spirals', 'pmn_woad_hi', 'pmn_lignite', 0.18)], fabric='cloth.wool.fulled')
    entries.append(assemble_garment(
        f'pmn_{sex}_dark_woad_braccae', 'Broken-Stair Night-Plaid Raider Braccae', 'legs', 'painted_men',
        trousers(f'pmn_{sex}_dark_woad_braccae', p_dark_brc, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 4. Chilkat-panel warleader braccae
    p_chil_brc = P('pmn_woad', 0.04, [
        B('bottom', 0.0, 0.06, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_lignite', 0.12),
    ], [PN(0.0, 1.0, 'chilkat_raven_weave', 'pmn_teal_hi', 'pmn_woad', 0.18)], fabric=WOOL)
    entries.append(assemble_garment(
        f'pmn_{sex}_chilkat_braccae', 'Chilkat-Panel Plaid Warden Braccae', 'legs', 'painted_men',
        trousers(f'pmn_{sex}_chilkat_braccae', p_chil_brc, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 5. Royal slickrock-orchil & weld-gold chief/shaman tartan braccae
    p_orch_brc = P('pmn_orchil', 0.04, [
        B('bottom', 0.0, 0.06, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_orchil', 0.12),
    ], [PN(0.0, 1.0, 'pmn_tartan_woad', 'pmn_ochre', 'pmn_orchil', 0.18)], fabric='cloth.wool.hoar_orchil')
    entries.append(assemble_garment(
        f'pmn_{sex}_orchil_tartan_braccae', 'Royal Slickrock-Orchil & Gold Tartan Braccae', 'legs', 'painted_men',
        trousers(f'pmn_{sex}_orchil_tartan_braccae', p_orch_brc, cuff=core.ANKLE + 0.08, ease=0.015, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    # 6. Pleated Pictish highland war-kilt (starts at WAIST - 0.044 below belt!)
    p_kilt = P('pmn_woad', 0.05, [
        B('bottom', 0.0, 0.06, 'pictish_woad_spirals', 'pmn_ochre', 'pmn_falu', 0.12),
    ], [PN(0.0, 1.0, 'pmn_tartan_woad', 'pmn_ochre', 'pmn_woad', 0.18)], fabric=WOOL)
    entries.append(assemble_garment(
        f'pmn_{sex}_champion_war_kilt', 'Pleated Pictish Woad-Tartan War-Kilt', 'legs', 'painted_men',
        [torso_tube(f'pmn_{sex}_warkilt', core.WAIST - 0.044, core.KNEE + 0.04, 0.025, p_kilt,
                    n=40, rows=14, hang_from=core.WAIST - 0.044, flare=0.08)],
        legged=False,
    ))

    # Footwear (5 styles: cliff sandals, buckskin boots, crag lashed boots, fur warboots, snug bare-leg warboots)
    entries.append(assemble_garment(
        f'pmn_{sex}_rawhide_cliff_sandals', 'Moat-Wall Rawhide & Cedar-Cord Cliff Sandals', 'feet', 'painted_men',
        sandal(f'pmn_{sex}_rawhide_cliff_sandals', P('pmn_cedar_dk', 0.06), P('buck', 0.05), laces=2),
    ))

    p_buck_bt = P('buck', 0.05, [B('top', 0.0, 0.04, 'formline_eye', 'pmn_falu', 'pmn_lignite', 0.10)], fabric='leather.buckskin')
    entries.append(assemble_garment(
        f'pmn_{sex}_cliff_buck_boots', 'Sinew-Wrapped Brain-Tanned Buckskin Boots', 'feet', 'painted_men',
        boots(f'pmn_{sex}_cliff_buck_boots', P('pmn_lignite', 0.08), p_buck_bt, top=0.38, ease_top=0.026),
    ))

    p_crag_bt = P('pmn_cedar_dk', 0.05, [B('top', 0.0, 0.04, 'solid', 'pmn_teal')], fabric='leather.cuir_bouilli')
    entries.append(assemble_garment(
        f'pmn_{sex}_crag_lashed_boots', 'Crag-Runner Rawhide-Lashed Climbing Boots', 'feet', 'painted_men',
        boots(f'pmn_{sex}_crag_lashed_boots', P('pmn_lignite', 0.08), p_crag_bt, top=0.42, ease_top=0.026, wraps=2, wrap_paint=P('buck', 0.05)),
    ))

    p_war_bt = P('pmn_lignite', 0.05, [B('top', 0.0, 0.05, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_teal', 0.10)], fabric='leather.cuir_bouilli')
    entries.append(assemble_garment(
        f'pmn_{sex}_warden_warboots', 'Fur-Cuffed Totem-Warden Highland Warboots', 'feet', 'painted_men',
        boots(f'pmn_{sex}_warden_warboots', P('soot', 0.08), p_war_bt, top=0.44, ease_top=0.026,
              cuff_paint=P('darkfur', 0.06, fabric='fur.wolf')),
    ))

    entries.append(assemble_garment(
        f'pmn_{sex}_bare_warboots', 'Snug Bare-Leg Woad-Champion Fur Warboots', 'feet', 'painted_men',
        boots(f'pmn_{sex}_bare_warboots', P('soot', 0.08), p_war_bt, top=0.40, ease_top=0.015,
              cuff_paint=P('darkfur', 0.06, fabric='fur.wolf')),
    ))

    # Bracers / Armcoils (5 styles — open bare hands on all non-hero bracers!)
    p_sinew = P('buck', 0.05, [B('top', 0.0, 0.03, 'solid', 'pmn_teal')], fabric='leather.buckskin')
    entries.append(assemble_garment(
        f'pmn_{sex}_sinew_wristwraps', 'Twined Sinew & Cedar-Bark Wristwraps', 'gloves', 'painted_men',
        [sleeve(f'pmn_{sex}_swrp_L', L, p_sinew, f0=0.64, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'pmn_{sex}_swrp_R', R, p_sinew, f0=0.64, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    p_copper_coil = P('bronze', 0.03, [
        B('top', 0.0, 0.03, 'stripes', 'pmn_lignite', 'bronze', 0.02),
        B('bottom', 0.0, 0.03, 'solid', 'verdigris'),
    ], fabric='metal.bronze')
    entries.append(assemble_garment(
        f'pmn_{sex}_spiral_copper_bracers', 'Clan IV Spiral Tin-Bronze Forearm Coils', 'gloves', 'painted_men',
        [sleeve(f'pmn_{sex}_cbrc_L', L, p_copper_coil, f0=0.56, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'pmn_{sex}_cbrc_R', R, p_copper_coil, f0=0.56, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20)],
    ))

    p_slat_vam = P('pmn_cedar', 0.05, [
        B('top', 0.0, 0.035, 'solid', 'bone'),
    ], [PN(0.1, 0.9, 'tlingit_formline_slats', 'pmn_falu', 'pmn_cedar', 0.14)], fabric='armor.lamellar.horn')
    entries.append(assemble_garment(
        f'pmn_{sex}_slat_vambraces', 'Sinew-Lashed Red-Cedar Slat Vambraces', 'gloves', 'painted_men',
        [sleeve(f'pmn_{sex}_svam_L', L, p_slat_vam, f0=0.54, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'pmn_{sex}_svam_R', R, p_slat_vam, f0=0.54, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20)],
    ))

    p_rattle = P('pmn_orchil', 0.04, [
        B('top', 0.0, 0.04, 'beads', 'pmn_teal_hi', 'bone', 0.025),
    ], [PN(0.1, 0.9, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_orchil', 0.14)], fabric='shell.nacre')
    entries.append(assemble_garment(
        f'pmn_{sex}_abalone_rattle_cuffs', 'Abalone-Inlaid Puffin-Beak Rattle Cuffs', 'gloves', 'painted_men',
        [sleeve(f'pmn_{sex}_rcuf_L', L, p_rattle, f0=0.56, f1=0.95, ease=0.014, flare=0.005, rows=7, n=20),
         sleeve(f'pmn_{sex}_rcuf_R', R, p_rattle, f0=0.56, f1=0.95, ease=0.014, flare=0.005, rows=7, n=20)],
    ))

    p_silver_brc = P('silver', 0.02, [B('top', 0.0, 0.035, 'solid', 'pmn_ochre')], fabric='metal.iron')
    entries.append(assemble_garment(
        f'pmn_{sex}_silver_spiral_bracers', 'Broken-Stair Melted-Silver Spiral Armlets', 'gloves', 'painted_men',
        [sleeve(f'pmn_{sex}_sbrc_L', L, p_silver_brc, f0=0.56, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20),
         sleeve(f'pmn_{sex}_sbrc_R', R, p_silver_brc, f0=0.56, f1=0.95, ease=0.014, flare=0.004, rows=7, n=20)],
    ))
    return entries


# ===========================================================================================================
# 13 PAINTED MEN TIERS (HEAD + TORSO + BACK, ZERO HUMAN FACES!)
# ===========================================================================================================
def _build_painted_men_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    # --- 1. cliff_folk ---
    gid_h = f'pmn_{sex}_cliff_headband'
    hb = head_rings(f'{gid_h}_headband', 0.60, 0.71, 0.004,
                    P('pmn_woad', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'pmn_ochre')], fabric=WOOL), n=36, rows=5)
    p_q = hb.P[2, 9].copy()
    quill = horn(f'{gid_h}_raven_quill', [p_q, p_q + up * 0.11 - fwd * 0.04], 0.010, 0.003,
                 P('pmn_lignite', 0.04, fabric='plumage.feathers.raptor'), n=8, rows=5, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Raven-Feather Woad Brow-Band', 'head', 'painted_men', [hb, quill], covers_hair=False))

    gid_t = f'pmn_{sex}_camas_plaid_tunic'
    tun_p = P('buck', 0.05, [
        B('bottom', 0.0, 0.06, 'formline_eye', 'pmn_falu', 'pmn_lignite', 0.12),
    ], [PN(0.0, 1.0, 'pmn_tartan_woad', 'pmn_ochre', 'pmn_woad', 0.18)], fabric=WOOL)
    cf_body = torso_tube(f'{gid_t}_tunic', core.TOP, core.WAIST - 0.035, 0.021, tun_p, n=40, rows=12)
    sagum = crossed_sash(f'{gid_t}_sagum', P('pmn_woad', 0.04, [B('top', 0.0, 0.03, 'solid', 'pmn_ochre')],
                                              [PN(0.0, 1.0, 'pmn_tartan_woad', 'pmn_ochre', 'pmn_woad', 0.18)], fabric=WOOL),
                         width=0.088, ease=0.028)
    brooch = rosette(f'{gid_t}_triskele_brooch', chest_front(core.CHEST + 0.05, 0.031, x=0.055),
                     np.array([0.0, -1.0, 0.0]), left, 0.024, P('bronze', 0.02, fabric='metal.bronze'),
                     n=12, thick=0.010, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_t, 'Pinned Woad-Tartan Sagum & Formline-Cuff Tunic', 'torso', 'painted_men',
                                    [cf_body, sleeves(gid_t, 'wrist', 0.018, tun_p), sagum, brooch]))

    gid_b = f'pmn_{sex}_bentwood_camas_basket'
    pad, anc = _dorsal_pad(gid_b, P('pmn_cedar_dk', 0.05), clearance=0.025)
    box = blob(f'{gid_b}_kerf_box', anc + BACK_DIR * 0.024, (0.19, 0.075, 0.24),
               P('pmn_cedar', 0.05, [B('top', 0.0, 0.04, 'solid', 'pmn_lignite')],
                 [PN(0.0, 1.0, 'pmn_avian_ovoid', 'pmn_falu', 'pmn_cedar', 0.20)], fabric='armor.lamellar.horn'),
               n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Steamed Kerfed Red-Cedar Camas Basket', 'back', 'painted_men', [pad, box]))

    # --- 2. woodcarver ---
    gid_h = f'pmn_{sex}_carver_visor'
    cv_band = head_rings(f'{gid_h}_band', 0.60, 0.71, 0.004, P('pmn_cedar', 0.05, fabric='armor.lamellar.horn'), n=36, rows=5)
    pts_cv = cv_band.P[1]
    c_cv = pts_cv.mean(axis=0)
    idx_f = int(np.argmax((pts_cv - c_cv) @ fwd))
    brim_pts = [pts_cv[(idx_f + dj) % 36] + fwd * (0.022 * math.cos(dj * 0.22)) for dj in range(-5, 6)]
    shade = tube(f'{gid_h}_cedar_shade', brim_pts, 0.011,
                 P('pmn_cedar', 0.04, [B('top', 0.0, 0.03, 'dentils', 'bone', 'pmn_lignite', 0.02)]), n=8, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Adze-Carved Red-Cedar Glare Visor', 'head', 'painted_men', [cv_band, shade], covers_hair=False))

    gid_t = f'pmn_{sex}_carver_apron_vest'
    wc_vest = torso_tube(f'{gid_t}_jerkin', core.TOP, core.WAIST - 0.035, 0.020, P('buck', 0.06, fabric='leather.buckskin'), n=38, rows=11)
    wc_apron = tabard(f'{gid_t}_apron', core.KNEE + 0.05, core.CHEST + 0.05,
                      P('pmn_cedar_dk', 0.05, [B('bottom', 0.0, 0.07, 'pmn_avian_ovoid', 'pmn_teal_hi', 'pmn_falu', 0.14)],
                        fabric='leather.cuir_bouilli'),
                      width=0.21, front=True, back=False, ease=0.031)
    entries.append(assemble_garment(gid_t, 'Pigment-Wiped Sleeveless Carver Jerkin & Split Apron', 'torso', 'painted_men',
                                    [wc_vest, wc_apron]))

    gid_b = f'pmn_{sex}_cedar_plank_hod'
    pad, anc = _dorsal_pad(gid_b, P('pmn_cedar_dk', 0.05), clearance=0.024)
    planks = blob(f'{gid_b}_planks', anc + up * 0.04 + BACK_DIR * 0.022, (0.20, 0.050, 0.28),
                  P('pmn_cedar', 0.05, [B('top', 0.0, 0.04, 'solid', 'pmn_teal')],
                    [PN(0.0, 1.0, 'tlingit_formline_slats', 'pmn_falu', 'pmn_cedar', 0.16)], fabric='armor.lamellar.horn'),
                  n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Lashed Canyon-Mouth Red-Cedar Plank Hod', 'back', 'painted_men', [pad, planks]))

    # --- 3. cliff_fisher ---
    gid_h = f'pmn_{sex}_spruce_rain_hat'
    rhat = conical_hat(f'{gid_h}_saaxw',
                       P('oat', 0.05, [B('bottom', 0.0, 0.06, 'pmn_avian_ovoid', 'pmn_falu', 'pmn_teal', 0.14)], fabric='straw.reed.plaited'),
                       f_base=0.66, f_top=1.32, r_base=0.28, rows=10, n=36)
    entries.append(assemble_garment(gid_h, 'Woven Spruce-Root Salmon-Crest Rain Hat', 'head', 'painted_men', [rhat], covers_hair=True))

    gid_t = f'pmn_{sex}_cedar_bark_raincape'
    bark_p = P('pmn_cedar', 0.06, [
        B('bottom', 0.0, 0.07, 'rays', 'oat', 'pmn_cedar_dk', 0.02),
    ], [PN(0.0, 1.0, 'pmn_cedar_bark', 'oat', 'pmn_cedar', 0.18)], fabric='cloth.bark.cedar')
    f_tunic = torso_tube(f'{gid_t}_tunic', core.TOP, core.WAIST - 0.035, 0.019, P('pmn_woad', 0.05, fabric=WOOL), n=38, rows=11)
    f_poncho = collar_disc(f'{gid_t}_rainponcho', 0.185, bark_p, drop=0.165, scallop=0.05, ease=0.023)
    entries.append(assemble_garment(gid_t, 'Shredded Inner-Cedar-Bark Rain-Cape & Wool Tunic', 'torso', 'painted_men',
                                    [f_tunic, sleeves(gid_t, 'wrist', 0.018, P('pmn_woad', 0.05, fabric=WOOL)), f_poncho]))

    gid_b = f'pmn_{sex}_coiled_fish_creel'
    pad, anc = _dorsal_pad(gid_b, P('pmn_cedar', 0.05), clearance=0.025)
    creel = horn(f'{gid_b}_creel', [anc - up * 0.11 + BACK_DIR * 0.02, anc + up * 0.12 + BACK_DIR * 0.04], 0.060, 0.088,
                 P('oat', 0.05, [B('top', 0.0, 0.04, 'solid', 'pmn_teal')], fabric='straw.reed.plaited'), n=16, rows=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Coiled Spruce-Root Moat-Wall Fish Creel', 'back', 'painted_men', [pad, creel]))

    # --- 4. sling_hunter ---
    gid_h = f'pmn_{sex}_wolf_ear_hood'
    wh_p = P('darkfur', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'pmn_teal')], fabric='fur.wolf')
    wh = hood(f'{gid_h}_hood', wh_p, ease=0.026, ease_low=0.046, open_front=0.92, low=-0.22, rows=13, n=34, peak=0.04)
    wh_parts = [wh]
    pts_wh = wh.P.reshape(-1, 3)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        pe = pts_wh[int(np.argmin(np.linalg.norm(pts_wh - (a + (b - a) * 0.95 + left * (sgn * 0.075)), axis=1)))].copy()
        wh_parts.append(horn(f'{gid_h}_ear_{tag}', [pe, pe + up * 0.065 + left * (sgn * 0.015)], 0.022, 0.004, wh_p, n=8, rows=5, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Wolf-Ear Tufted Playa Stalker Hood', 'head', 'painted_men', wh_parts, covers_hair=True))

    gid_t = f'pmn_{sex}_pronghorn_jerkin'
    pj_p = P('buck', 0.06, [
        B('bottom', 0.0, 0.05, 'rays', 'bone', 'pmn_cedar_dk', 0.018),
    ], [PN(0.0, 1.0, 'formline_eye', 'pmn_falu', 'buck', 0.20)], fabric='leather.buckskin')
    pj_body = torso_tube(f'{gid_t}_jerkin', core.TOP, core.WAIST - 0.035, 0.021, pj_p, n=40, rows=12)
    entries.append(assemble_garment(gid_t, 'Fringed Pronghorn Buckskin Formline Jerkin', 'torso', 'painted_men',
                                    [pj_body, sleeves(gid_t, 'wrist', 0.018, pj_p)]))

    gid_b = f'pmn_{sex}_bentwood_quiver_pack'
    pad, anc = _dorsal_pad(gid_b, P('pmn_cedar_dk', 0.05), clearance=0.025)
    qbox = horn(f'{gid_b}_quiverbox', [anc - left * 0.05 - up * 0.13 + BACK_DIR * 0.018, anc + left * 0.07 + up * 0.17 + BACK_DIR * 0.022],
                0.038, 0.044, P('pmn_cedar', 0.05, [B('top', 0.0, 0.04, 'pmn_avian_ovoid', 'pmn_falu', 'pmn_lignite', 0.10)], fabric='armor.lamellar.horn'),
                n=12, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Kerfed Red-Cedar Bentwood Quiver-Box', 'back', 'painted_men', [pad, qbox]))

    # --- 5. whistle_scout (6-tone bamboo canyon whistles!) ---
    gid_h = f'pmn_{sex}_whistle_headband'
    ws_hb = head_rings(f'{gid_h}_headband', 0.60, 0.71, 0.004,
                       P('pmn_woad', 0.04, [B('bottom', 0.0, 0.03, 'beads', 'pmn_teal_hi', 'pmn_woad', 0.02)], fabric=WOOL), n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Turquoise-Studded Broken-Stair Scout Browband', 'head', 'painted_men', [ws_hb], covers_hair=False))

    gid_t = f'pmn_{sex}_scout_slat_vest'
    slat_p = P('pmn_cedar', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'bone'),
    ], [PN(0.0, 1.0, 'tlingit_formline_slats', 'pmn_teal_hi', 'pmn_cedar', 0.16)], fabric='armor.lamellar.horn')
    ws_shirt = torso_tube(f'{gid_t}_shirt', core.TOP, core.WAIST - 0.035, 0.019, P('pmn_woad', 0.04, fabric=WOOL), n=38, rows=11)
    ws_bib = torso_tube(f'{gid_t}_slatbib', core.CHEST + 0.05, core.WAIST - 0.040, 0.028, slat_p, n=40, rows=9)
    # 6-tone bamboo whistle panpipe cluster seated flush on chest bib!
    whistle_pan = blob(f'{gid_t}_bamboo_whistles', chest_front(core.CHEST + 0.01, 0.032, x=-0.045), (0.055, 0.018, 0.075),
                       P('bamboo', 0.03, [B('top', 0.0, 0.03, 'stripes', 'pmn_lignite', 'bamboo', 0.015)], fabric='straw.reed.plaited'),
                       n=10, rows=5, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_t, 'Light Cedar Slat-Bib & 6-Tone Bamboo Canyon Whistles', 'torso', 'painted_men',
                                    [ws_shirt, sleeves(gid_t, 'wrist', 0.018, P('pmn_woad', 0.04, fabric=WOOL)), ws_bib, whistle_pan]))

    gid_b = f'pmn_{sex}_pictish_targe_back'
    pad, anc = _dorsal_pad(gid_b, slat_p, clearance=0.031)
    targe = blob(f'{gid_b}_square_targe', anc + up * 0.02 + BACK_DIR * 0.022, (0.24, 0.035, 0.28),
                 P('pmn_woad', 0.04, [B('top', 0.0, 0.04, 'solid', 'bronze')],
                   [PN(0.0, 1.0, 'pictish_woad_spirals', 'pmn_ochre', 'pmn_woad', 0.16)], fabric='armor.lamellar.horn'),
                 n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Square Rawhide-Rimmed Pictish Triskele Targe', 'back', 'painted_men', [pad, targe]))

    # --- 6. slat_warrior ---
    gid_h = f'pmn_{sex}_bear_casque'
    bear_p = P('pmn_cedar_dk', 0.05, [
        B('bottom', 0.0, 0.04, 'dentils', 'bone', 'pmn_lignite', 0.02),
    ], [PN(0.0, 1.0, 'tlingit_formline_slats', 'pmn_falu', 'pmn_cedar_dk', 0.16)], fabric='armor.lamellar.horn')
    entries.append(assemble_garment(gid_h, 'Carved Ironwood Bear-Snout War Casque', 'head', 'painted_men',
                                    _animal_casque(gid_h, bear_p, P('pmn_falu', 0.04, [B('bottom', 0.0, 0.03, 'dentils', 'bone', 'pmn_lignite', 0.02)]), kind='bear'),
                                    covers_hair=True))

    gid_t = f'pmn_{sex}_clack_slat_cuirass'
    clack_p = P('pmn_cedar', 0.05, [
        B('bottom', 0.0, 0.06, 'solid', 'bone'),
        B('top', 0.0, 0.04, 'solid', 'pmn_lignite'),
    ], [PN(0.0, 1.0, 'tlingit_formline_slats', 'pmn_falu', 'pmn_cedar', 0.18)], fabric='armor.lamellar.horn')
    sw_under = torso_tube(f'{gid_t}_tunic', core.TOP, core.WAIST - 0.035, 0.019, P('pmn_falu', 0.05, fabric=WOOL), n=38, rows=11)
    sw_barrel = torso_tube(f'{gid_t}_barrel_cuirass', core.CHEST + 0.06, core.WAIST - 0.040, 0.030, clack_p, n=44, rows=12)
    entries.append(assemble_garment(gid_t, 'Rod-and-Slat Red-Cedar Clack-Armour Barrel Cuirass', 'torso', 'painted_men',
                                    [sw_under, sleeves(gid_t, 'wrist', 0.018, P('pmn_falu', 0.05, fabric=WOOL)),
                                     sw_barrel, pauldron(f'{gid_t}_pL', L, clack_p), pauldron(f'{gid_t}_pR', R, clack_p)]))

    gid_b = f'pmn_{sex}_plank_bear_shield_back'
    pad, anc = _dorsal_pad(gid_b, clack_p, clearance=0.033)
    bshield = blob(f'{gid_b}_bear_shield', anc + up * 0.03 + BACK_DIR * 0.024, (0.25, 0.038, 0.32), clack_p,
                   n=14, rows=7, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Steamed Red-Cedar Bear-Claw Plank Shield', 'back', 'painted_men', [pad, bshield]))

    # --- 7. warden (Refactored Totem-Warden: Open-Eye Raven-Beak Casque, ZERO Human Mouth!) ---
    gid_h = f'pmn_{sex}_warden_helm'
    wd_p = P('pmn_cedar', 0.05, [
        B('bottom', 0.0, 0.04, 'dentils', 'bone', 'pmn_lignite', 0.02),
    ], [PN(0.0, 1.0, 'pmn_avian_ovoid', 'pmn_ochre', 'pmn_cedar', 0.18)], fabric='armor.lamellar.horn')
    entries.append(assemble_garment(gid_h, 'Totem-Warden Open-Eye Raven-Beak Casque', 'head', 'painted_men',
                                    _animal_casque(gid_h, wd_p, P('pmn_lignite', 0.03, [B('top', 0.0, 0.03, 'solid', 'pmn_teal_hi')], fabric='plumage.feathers.raptor'), kind='raven'),
                                    covers_hair=True))

    gid_t = f'pmn_{sex}_warden_cuirass'
    chil_sl_p = P('pmn_woad', 0.04, [
        B('bottom', 0.0, 0.07, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_teal_hi', 0.12),
    ], [PN(0.0, 1.0, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_lignite', 0.16)], fabric=WOOL)
    wd_under = torso_tube(f'{gid_t}_tunic', core.TOP, core.WAIST - 0.035, 0.019, chil_sl_p, n=38, rows=11)
    wd_cuir = torso_tube(f'{gid_t}_slat_cuirass', core.CHEST + 0.06, core.WAIST - 0.040, 0.030, clack_p, n=44, rows=12)
    wd_torc = neck_ring(f'{gid_t}_bronze_torc', P('bronze', 0.02, fabric='metal.bronze'), r_tube=0.022, drop=0.012, n=32, nr=8)
    entries.append(assemble_garment(gid_t, 'Totem-Warden Slat Cuirass, Bronze Torc & Chilkat Sleeves', 'torso', 'painted_men',
                                    [wd_under, wd_torc, sleeves(gid_t, 'wrist', 0.019, chil_sl_p),
                                     wd_cuir, pauldron(f'{gid_t}_pL', L, chil_sl_p), pauldron(f'{gid_t}_pR', R, chil_sl_p)]))

    gid_b = f'pmn_{sex}_totem_targe_rack'
    pad, anc = _dorsal_pad(gid_b, clack_p, clearance=0.033)
    tr_disc = rosette(f'{gid_b}_triskele_targe', anc + up * 0.02 + BACK_DIR * 0.022, BACK_DIR, left, 0.160,
                      P('pmn_woad', 0.04, [B('top', 0.0, 0.04, 'solid', 'bronze')], fabric='armor.lamellar.horn'),
                      n=20, thick=0.024, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Bentwood Quiver & Bronze-Triskele Raider Targe Rack', 'back', 'painted_men', [pad, tr_disc]))

    # --- 8. woad_champion (Bare woad-painted chest + bronze torc on M, woad-spiral bodice + torc on F!) ---
    gid_h = f'pmn_{sex}_boar_casque'
    boar_p = P('bronze', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'pmn_woad'),
    ], [PN(0.0, 1.0, 'pictish_woad_spirals', 'pmn_teal_hi', 'bronze', 0.16)], fabric='metal.bronze')
    entries.append(assemble_garment(gid_h, 'Caledonian-Tlingit Bronze-Ribbed Boar Casque', 'head', 'painted_men',
                                    _animal_casque(gid_h, boar_p, P('bronze', 0.02, fabric='metal.bronze'), kind='boar'),
                                    covers_hair=True))

    gid_t = f'pmn_{sex}_woad_torc_harness'
    woad_p = P('buck', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'pmn_woad'),
    ], [PN(0.0, 1.0, 'pictish_woad_spirals', 'pmn_woad', 'buck', 0.22)], fabric='leather.buckskin')
    torc_h = neck_ring(f'{gid_t}_gold_torc', P('gold', 0.02, fabric='metal.gold'), r_tube=0.024, drop=0.012, n=32, nr=8)
    sash_h = crossed_sash(f'{gid_t}_harness', P('pmn_cedar_dk', 0.05, [B('top', 0.0, 0.02, 'solid', 'bronze')], fabric='leather.cuir_bouilli'),
                          width=0.068, ease=0.024)
    belt_h = belt_sash(f'{gid_t}_belt', core.WAIST - 0.014, core.WAIST + 0.028, boar_p, ease=0.020)
    boss_h = rosette(f'{gid_t}_abalone_triskele', chest_front(core.CHEST + 0.02, 0.028), np.array([0.0, -1.0, 0.0]), left,
                     0.038, P('pmn_teal_hi', 0.02, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='shell.nacre'),
                     n=14, thick=0.014, rigid_joint='Spine2')
    if sex == 'm':
        ch_parts = [torc_h, sash_h, belt_h, boss_h]
        entries.append(assemble_garment(gid_t, 'Pictish Twisted Neck-Torc & Abalone-Triskele Bare-Chest Harness',
                                        'torso', 'painted_men', ch_parts, open_torso=True))
    else:
        bodice = torso_tube(f'{gid_t}_woad_bodice', core.CHEST + 0.06, core.WAIST - 0.012, 0.019, woad_p, n=38, rows=9)
        entries.append(assemble_garment(gid_t, 'Pictish Woad-Spiral War-Bodice, Neck-Torc & Triskele Harness',
                                        'torso', 'painted_men', [bodice, torc_h, sash_h, belt_h, boss_h], open_torso=True))

    gid_b = f'pmn_{sex}_wolf_plaid_mantle'
    wmantle = cape(f'{gid_b}_mantle', core.CROTCH + 0.06,
                   P('darkfur', 0.06, [B('bottom', 0.0, 0.06, 'pmn_tartan_woad', 'pmn_ochre', 'pmn_woad', 0.12)], fabric='fur.wolf'),
                   ease=0.026, flare=0.09, stiff=0.35, back_push=0.045)
    entries.append(assemble_garment(gid_b, 'Wolf-Pelt & Highland Tartan Shock-Champion Mantle', 'back', 'painted_men', [wmantle]))

    # --- 9. totem_singer (Orchil Chilkat Dancing Blanket & Thunderbird Shaman) ---
    gid_h = f'pmn_{sex}_thunderbird_diadem'
    tb_band = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004,
                         P('pmn_orchil', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'pmn_teal_hi')], fabric='shell.nacre'), n=36, rows=5)
    p_bf = tb_band.P[2, 18].copy()
    tbeak = horn(f'{gid_h}_beak', [p_bf, p_bf + fwd * 0.065 - up * 0.015], 0.022, 0.005,
                 P('pmn_falu', 0.03, [B('top', 0.0, 0.02, 'solid', 'pmn_ochre')]), n=10, rows=5, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Thunderbird-Beak & Abalone Brow-Diadem', 'head', 'painted_men', [tb_band, tbeak], covers_hair=False))

    gid_t = f'pmn_{sex}_chilkat_orchil_mantle'
    chil_p = P('pmn_orchil', 0.04, [
        B('bottom', 0.0, 0.09, 'rays', 'bone', 'pmn_ochre', 0.02),
    ], [PN(0.0, 1.0, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_orchil', 0.20)], fabric='cloth.wool.hoar_orchil')
    ts_robe = torso_tube(f'{gid_t}_blanket_robe', core.TOP, core.KNEE - 0.02, 0.028, chil_p, n=42, rows=21, hang_from=core.WAIST, flare=0.12)
    ts_disc = collar_disc(f'{gid_t}_chilkat_yoke', 0.125,
                          P('pmn_teal_hi', 0.04, [B('bottom', 0.0, 0.04, 'rays', 'bone', 'pmn_orchil', 0.02)],
                            [PN(0.0, 1.0, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_lignite', 0.18)], fabric='plumage.feathers.raptor'),
                          drop=0.095, ease=0.023)
    entries.append(assemble_garment(gid_t, 'Fringed Slickrock-Orchil & Mountain-Goat Chilkat Dancing Mantle', 'torso', 'painted_men',
                                    [ts_robe, ts_disc, sleeves(gid_t, 'wrist', 0.019, chil_p)]))

    gid_b = f'pmn_{sex}_totem_pole_pack'
    pad, anc = _dorsal_pad(gid_b, P('pmn_cedar_dk', 0.05), clearance=0.032)
    totem = horn(f'{gid_b}_crest_pole', [anc - up * 0.12 + BACK_DIR * 0.020, anc + up * 0.24 + BACK_DIR * 0.022], 0.038, 0.034,
                 P('pmn_cedar', 0.04, [B('top', 0.0, 0.05, 'solid', 'pmn_teal_hi')],
                   [PN(0.0, 1.0, 'pmn_avian_ovoid', 'pmn_falu', 'pmn_lignite', 0.18)], fabric='armor.lamellar.horn'),
                 n=14, rows=8, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Carved Eagle-Bear-Frog Cedar Crest-Pole Pack', 'back', 'painted_men', [pad, totem]))

    # --- 10. clan_chief (Spruce-root *s'áax̱w* crowned w/ 4 stacked copper potlatch status rings!) ---
    gid_h = f'pmn_{sex}_spruce_potlatch_hat'
    ch_cone = conical_hat(f'{gid_h}_cone',
                          P('oat', 0.04, [B('bottom', 0.0, 0.07, 'chilkat_raven_weave', 'pmn_teal_hi', 'pmn_lignite', 0.14)],
                            fabric='straw.reed.plaited'),
                          f_base=0.66, f_top=1.28, r_base=0.27, r_top=0.038, rows=9, n=36)
    p_apex = ch_cone.P[0].mean(axis=0)
    potlatch_rings = horn(f'{gid_h}_potlatch_rings', [p_apex - up * 0.01, p_apex + up * 0.15], 0.036, 0.030,
                          P('verdigris', 0.03, [B('top', 0.0, 0.04, 'stripes', 'bronze', 'verdigris', 0.025)], fabric='metal.bronze.verdigris'),
                          n=14, rows=8, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Clan-Chief Spruce-Root Hat with Four Copper Potlatch Rings', 'head', 'painted_men',
                                    [ch_cone, potlatch_rings], covers_hair=True))

    gid_t = f'pmn_{sex}_chief_chilkat_robe'
    cc_p = P('pmn_woad', 0.04, [
        B('bottom', 0.0, 0.10, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_orchil', 0.14),
    ], [PN(0.0, 1.0, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_woad', 0.18)], fabric='cloth.wool.hoar_orchil')
    cc_robe = torso_tube(f'{gid_t}_robe', core.TOP, core.KNEE - 0.03, 0.029, cc_p, n=44, rows=22, hang_from=core.WAIST, flare=0.13)
    cc_torc = neck_ring(f'{gid_t}_silver_torc', P('silver', 0.02, fabric='metal.iron'), r_tube=0.024, drop=0.012, n=32, nr=8)
    b_l = rosette(f'{gid_t}_broochL', chest_front(core.CHEST + 0.05, 0.034, x=0.065), np.array([0.0, -1.0, 0.0]), left,
                  0.024, P('silver', 0.02, fabric='metal.iron'), n=12, thick=0.010, rigid_joint='Spine2')
    b_r = rosette(f'{gid_t}_broochR', chest_front(core.CHEST + 0.05, 0.034, x=-0.065), np.array([0.0, -1.0, 0.0]), left,
                  0.024, P('silver', 0.02, fabric='metal.iron'), n=12, thick=0.010, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_t, 'Tlàaw-k\'wáan Clan-Chief Chilkat Coat, Silver Torc & Twin Brooches', 'torso', 'painted_men',
                                    [cc_robe, cc_torc, b_l, b_r, sleeves(gid_t, 'wrist', 0.020, cc_p)]))

    gid_b = f'pmn_{sex}_chief_chilkat_cape'
    cc_cape = cape(f'{gid_b}_cape', core.CROTCH + 0.05,
                   P('pmn_orchil', 0.04, [B('bottom', 0.0, 0.07, 'chilkat_raven_weave', 'pmn_ochre', 'pmn_teal_hi', 0.12)],
                     [PN(0.0, 1.0, 'pmn_tartan_woad', 'pmn_ochre', 'pmn_orchil', 0.18)], fabric='cloth.wool.hoar_orchil'),
                   ease=0.028, flare=0.10, stiff=0.36, back_push=0.055)
    entries.append(assemble_garment(gid_b, 'Chilkat-Bordered Orchil & Woad Clan-Chief Mantle', 'back', 'painted_men', [cc_cape]))

    # --- 11. pc_raven_reiver (`pc`) ---
    gid_h = f'pmn_{sex}_reiver_helm'
    rv_p = P('pmn_lignite', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'bronze')],
             [PN(0.0, 1.0, 'pmn_avian_ovoid', 'pmn_teal_hi', 'pmn_lignite', 0.18)], fabric='metal.iron')
    entries.append(assemble_garment(gid_h, 'Broken-Stair Raven-Wing Raider Casque', 'head', 'painted_men',
                                    _animal_casque(gid_h, rv_p, P('bronze', 0.02, fabric='metal.bronze'), kind='reiver'),
                                    covers_hair=True))

    gid_t = f'pmn_{sex}_reiver_slat_brig'
    rv_shirt = torso_tube(f'{gid_t}_shirt', core.TOP, core.WAIST - 0.035, 0.019, p_chil := chil_sl_p, n=38, rows=11)
    rv_brig = torso_tube(f'{gid_t}_brig', core.CHEST + 0.06, core.WAIST - 0.040, 0.029,
                         P('pmn_lignite', 0.04, [B('bottom', 0.0, 0.05, 'solid', 'bronze')],
                           [PN(0.0, 1.0, 'tlingit_formline_slats', 'pmn_teal_hi', 'pmn_lignite', 0.18)], fabric='armor.lamellar.horn'),
                         n=42, rows=11)
    entries.append(assemble_garment(gid_t, 'Raven-Reiver Slat Brigandine & Chilkat Tunic', 'torso', 'painted_men',
                                    [rv_shirt, sleeves(gid_t, 'wrist', 0.018, p_chil), rv_brig,
                                     pauldron(f'{gid_t}_pL', L, rv_p)]))

    # --- 12. hero_tlaaw_warchief (`important_npc`) ---
    gid_h = f'pmn_{sex}_warchief_helm'
    wc_p = P('pmn_cedar_dk', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'gold')],
             [PN(0.0, 1.0, 'tlingit_formline_slats', 'pmn_falu', 'pmn_lignite', 0.18)], fabric='armor.lamellar.horn')
    entries.append(assemble_garment(gid_h, 'High Warchief Raven-and-Orca Copper-Fin War-Helm', 'head', 'painted_men',
                                    _animal_casque(gid_h, wc_p, P('pmn_falu', 0.03, [B('top', 0.0, 0.03, 'solid', 'gold')]), kind='warchief'),
                                    covers_hair=True))

    gid_t = f'pmn_{sex}_warchief_panoply'
    wc_coat = torso_tube(f'{gid_t}_tunic', core.TOP, core.KNEE + 0.03, 0.028, chil_sl_p, n=42, rows=20, hang_from=core.WAIST, flare=0.11)
    wc_cuir = torso_tube(f'{gid_t}_cuirass', core.CHEST + 0.06, core.WAIST - 0.02, 0.034, wc_p, n=44, rows=11)
    wc_torc = neck_ring(f'{gid_t}_gold_torc', P('gold', 0.02, fabric='metal.gold'), r_tube=0.025, drop=0.014, n=32, nr=8)
    entries.append(assemble_garment(gid_t, 'High Warchief Masterwork Cedar-Slat Cuirass & Gold Torc', 'torso', 'painted_men',
                                    [wc_coat, wc_torc, sleeves(gid_t, 'wrist', 0.020, chil_sl_p), wc_cuir,
                                     pauldron(f'{gid_t}_pL', L, wc_p), pauldron(f'{gid_t}_pR', R, wc_p)]))

    # --- 13. hero_orchil_totemsinger (`important_npc`) ---
    gid_h = f'pmn_{sex}_orchil_seer_helm'
    os_p = P('pmn_orchil', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'pmn_ochre')],
             [PN(0.0, 1.0, 'pmn_avian_ovoid', 'pmn_teal_hi', 'pmn_orchil', 0.18)], fabric='plumage.feathers.raptor')
    entries.append(assemble_garment(gid_h, 'Orchil-Crowned Thunderbird Crest Helm', 'head', 'painted_men',
                                    _animal_casque(gid_h, os_p, P('pmn_ochre', 0.03, [B('top', 0.0, 0.03, 'solid', 'pmn_teal_hi')], fabric='plumage.feathers.raptor'), kind='thunderbird'),
                                    covers_hair=True))

    gid_t = f'pmn_{sex}_orchil_seer_vestment'
    os_robe = torso_tube(f'{gid_t}_vestment', core.TOP, core.ANKLE + 0.06, 0.029, chil_p, n=44, rows=24, hang_from=core.WAIST, flare=0.14)
    os_col = collar_disc(f'{gid_t}_bark_shroud', 0.135,
                         P('pmn_orchil', 0.04, [B('bottom', 0.0, 0.06, 'rays', 'pmn_ochre', 'pmn_teal_hi', 0.02)],
                           [PN(0.0, 1.0, 'pmn_avian_ovoid', 'pmn_teal_hi', 'pmn_orchil', 0.18)], fabric='plumage.feathers.raptor'),
                         drop=0.105, ease=0.023)
    entries.append(assemble_garment(gid_t, 'Orchil Thunderbird High-Seer Chilkat Vestment & Cedar Shroud', 'torso', 'painted_men',
                                    [os_robe, os_col, sleeves(gid_t, 'wrist', 0.020, chil_p)]))

    return entries


def _outfits_for_sex(sex):
    return {
        'cliff_folk': {
            'head': f'pmn_{sex}_cliff_headband',
            'torso': f'pmn_{sex}_camas_plaid_tunic',
            'gloves': f'pmn_{sex}_sinew_wristwraps',
            'legs': f'pmn_{sex}_woad_check_braccae',
            'feet': f'pmn_{sex}_cliff_buck_boots',
            'back': f'pmn_{sex}_bentwood_camas_basket',
        },
        'woodcarver': {
            'head': f'pmn_{sex}_carver_visor',
            'torso': f'pmn_{sex}_carver_apron_vest',
            'gloves': f'pmn_{sex}_sinew_wristwraps',
            'legs': f'pmn_{sex}_ochre_wool_braccae',
            'feet': f'pmn_{sex}_cliff_buck_boots',
            'back': f'pmn_{sex}_cedar_plank_hod',
        },
        'cliff_fisher': {
            'head': f'pmn_{sex}_spruce_rain_hat',
            'torso': f'pmn_{sex}_cedar_bark_raincape',
            'gloves': f'pmn_{sex}_sinew_wristwraps',
            'legs': f'pmn_{sex}_woad_check_braccae',
            'feet': f'pmn_{sex}_rawhide_cliff_sandals',
            'back': f'pmn_{sex}_coiled_fish_creel',
        },
        'sling_hunter': {
            'head': f'pmn_{sex}_wolf_ear_hood',
            'torso': f'pmn_{sex}_pronghorn_jerkin',
            'gloves': f'pmn_{sex}_sinew_wristwraps',
            'legs': f'pmn_{sex}_woad_check_braccae',
            'feet': f'pmn_{sex}_cliff_buck_boots',
            'back': f'pmn_{sex}_bentwood_quiver_pack',
        },
        'whistle_scout': {
            'head': f'pmn_{sex}_whistle_headband',
            'torso': f'pmn_{sex}_scout_slat_vest',
            'gloves': f'pmn_{sex}_spiral_copper_bracers',
            'legs': f'pmn_{sex}_dark_woad_braccae',
            'feet': f'pmn_{sex}_crag_lashed_boots',
            'back': f'pmn_{sex}_pictish_targe_back',
        },
        'slat_warrior': {
            'head': f'pmn_{sex}_bear_casque',
            'torso': f'pmn_{sex}_clack_slat_cuirass',
            'gloves': f'pmn_{sex}_slat_vambraces',
            'legs': f'pmn_{sex}_dark_woad_braccae',
            'feet': f'pmn_{sex}_crag_lashed_boots',
            'back': f'pmn_{sex}_plank_bear_shield_back',
        },
        'warden': {
            'head': f'pmn_{sex}_warden_helm',
            'torso': f'pmn_{sex}_warden_cuirass',
            'gloves': f'pmn_{sex}_slat_vambraces',
            'legs': f'pmn_{sex}_chilkat_braccae',
            'feet': f'pmn_{sex}_warden_warboots',
            'back': f'pmn_{sex}_totem_targe_rack',
        },
        'woad_champion': {
            'head': f'pmn_{sex}_boar_casque',
            'torso': f'pmn_{sex}_woad_torc_harness',
            'gloves': f'pmn_{sex}_spiral_copper_bracers',
            'legs': f'pmn_{sex}_champion_war_kilt',
            'feet': f'pmn_{sex}_bare_warboots',
            'back': f'pmn_{sex}_wolf_plaid_mantle',
        },
        'totem_singer': {
            'head': f'pmn_{sex}_thunderbird_diadem',
            'torso': f'pmn_{sex}_chilkat_orchil_mantle',
            'gloves': f'pmn_{sex}_abalone_rattle_cuffs',
            'legs': f'pmn_{sex}_orchil_tartan_braccae',
            'feet': f'pmn_{sex}_cliff_buck_boots',
            'back': f'pmn_{sex}_totem_pole_pack',
        },
        'clan_chief': {
            'head': f'pmn_{sex}_spruce_potlatch_hat',
            'torso': f'pmn_{sex}_chief_chilkat_robe',
            'gloves': f'pmn_{sex}_silver_spiral_bracers',
            'legs': f'pmn_{sex}_orchil_tartan_braccae',
            'feet': f'pmn_{sex}_warden_warboots',
            'back': f'pmn_{sex}_chief_chilkat_cape',
        },
        'pc_raven_reiver': {
            'head': f'pmn_{sex}_reiver_helm',
            'torso': f'pmn_{sex}_reiver_slat_brig',
            'gloves': f'pmn_{sex}_spiral_copper_bracers',
            'legs': f'pmn_{sex}_chilkat_braccae',
            'feet': f'pmn_{sex}_warden_warboots',
            'back': f'pmn_{sex}_totem_targe_rack',
            'type': 'pc',
        },
        'hero_tlaaw_warchief': {
            'head': f'pmn_{sex}_warchief_helm',
            'torso': f'pmn_{sex}_warchief_panoply',
            'gloves': f'pmn_{sex}_slat_vambraces',
            'legs': f'pmn_{sex}_orchil_tartan_braccae',
            'feet': f'pmn_{sex}_warden_warboots',
            'back': f'pmn_{sex}_plank_bear_shield_back',
            'type': 'important_npc',
        },
        'hero_orchil_totemsinger': {
            'head': f'pmn_{sex}_orchil_seer_helm',
            'torso': f'pmn_{sex}_orchil_seer_vestment',
            'gloves': f'pmn_{sex}_abalone_rattle_cuffs',
            'legs': f'pmn_{sex}_orchil_tartan_braccae',
            'feet': f'pmn_{sex}_cliff_buck_boots',
            'back': f'pmn_{sex}_totem_pole_pack',
            'type': 'important_npc',
        },
    }


def build_painted_men_peoples_entry():
    return {
        'id': 'painted_men',
        'name': 'Painted Men',
        'note': (
            "The Kwéent'qw ('Painted Folk') of the four Tlàaw-k'wáan canyon-and-mesa clans (+3,324 m median): "
            "a Pictish-Caledonian and Tlingit-PNW synthesis wearing fulled woad-ochre tartan braccae, twisted bronze/silver "
            "torcs, shredded cedar-bark rain-capes, twined slickrock-orchil Chilkat blankets, and red-cedar rod-and-slat "
            "clack-armour under strict zoomorphic crest law ('a human face is never drawn', LORE.md §6.5)."
        ),
        'ancestry': {'african': [0.00, 0.10], 'asian': [0.60, 0.85], 'caucasian': [0.10, 0.30]},
        'skin': ['#c99a72', '#b07e57', '#916342'],
        'hair': ['#120f0d', '#1c1612', '#2a2018'],
        'eyes': ['#2a1a10', '#3b2414'],
        'grey': 0.50,
        'beard': 0.15,
        'styles': {
            'male': ['long01', 'braid01', 'ponytail01', 'punkduck_alpha7_long', 'fourstrandbraid'],
            'female': ['long01', 'braid01', 'elvs_double_mh_braid', 'o4saken_long01', 'fourstrandbraid'],
        },
        'tiers': PAINTED_MEN_TIER_SHARES,
        'tier_labels': PAINTED_MEN_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_painted_men_kit():
    entries = []
    with _pmn_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_shared_pieces(sex))
            entries.extend(_build_painted_men_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_painted_men_kit()
    peoples_entry = build_painted_men_peoples_entry()
    manifest_path = CULTURES_DIR / 'painted_men_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'painted_men',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Painted Men pieces ({n_m} male, {n_f} female) across 13 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
