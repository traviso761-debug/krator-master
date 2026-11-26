"""Vothic Kingdom (`chichani`) + Twin Arcologies & Crown Auxiliaries (`voth_arcologies`) Wardrobe Kit.

Implements the complete 23-tier Vothic realm wardrobe across BOTH `mpfb_male` and `mpfb_female`
at 100% M/F parity (`268` procedural pieces + `tzintzun_sovereign` Meshy integration):

A. `chichani` — Chichani · Vothic Kingdom (16 tiers, prefix `vth_{m,f}_*`):
   Pillar I — Old-Style Heartland (`Shim / Driyan / Azoth`, `region='heartland'`):
     1. `shim_reedcutter`       — Shim Blïtrit Dye-Vat & Chinampa Peasant
     2. `driyan_clan_elder`     — Driyan Kingsmoot Patrician & Shumari-Script Archivist
     3. `azoth_dres_overseer`   — Azoth (Dres-Style) Blïtrit Estate Master & Slave-Taker
     4. `azoth_march_warden`    — Azoth Shumar/Dalab Borderland Marcher-Warrior
     5. `heartland_fire_cantor` — Old Heartland Archaic Solstice Cantor & Sacrificer
     6. `heartland_sipahi`      — Shim / Driyan Old-Style Ichcahuipilli Retainer
   Pillar II — Inner Crater & Imperial Temple Core (`Voth / Almua / Zey'danin`, `region='inner_crater' | 'temple_core'`):
     7. `voth_canton_citizen`   — Voth Causeway Artisan & Canal Guildsman
     8. `almua_port_factor`     — Almua & Temora Arsenal & Spice-Port Purser
     9. `zeydanin_colonist`     — Zey'danin Throne-Gate Settler & Ranj Planter
    10. `voth_palace_pasha`     — Voth Palace-Canton Patrician / Pasha
    11. `caldera_scout`         — Inner Crater Ash-Waste Outrider & Secret-Police Hound
    12. `chosen_janissary`      — Chosen of Tzintzun Solar Janissary Guard
    13. `temple_ordinator`      — Temple Ordinator & Secret Police (Iconic Golden Ancestor War-Mask)
    14. `sun_high_priest`       — Temple Canton Crimson-and-Gold High Hierophant
    15. `grey_penitent`         — Temple Canton Ash-Smeared Grey Penitent Flagellant (LORE.md §6.12)
    16. `tzintzun_sovereign`    — Tzintzun, Undying Son of the Sun (cloth-sim regalia + dorsal sun-halo + Meshy mask/limbs)

B. `voth_arcologies` — Drum & Torus · Twin Arcologies & Crown Auxiliaries (7 tiers, prefix `arc_{m,f}_*`):
   Pillar III-A — Unassimilated Arcology Civilians (`Drum` Vinvolk & `Torus` Rinkvolk):
    17. `drum_fin_rigger`       — Drum (Vinvolk) Sky-Gate Hoistman & Concrete-Fin Rigger
    18. `torus_ring_terracer`   — Torus (Rinkvolk) Forest-Ring Orchardist & Granary Miller
    19. `arcology_client_chief` — Drïm / Tors Court-Hall Client Chief
   Pillar III-B — Scrap-Vothic Arcology Militias (Mad Max / Fallout Salvage × Crude Vothic Imitation):
    20. `scrap_vothic_militia`  — Drum / Torus Tyre-Rampart "Scrap-Ordinator" Watch
    21. `scrap_vothic_enforcer` — Drïm Chief's Sky-Gate Heavy Shock-Guard
   Pillar IV — Vothic Crown Auxiliaries (`Islander` & `Scyvoi` Levies):
    22. `aux_islander_marine`   — Hetānini / Almua Islander Bireme Marine & Port Guard
    23. `aux_scyvoi_outrider`   — Scyvoi Frontier Paid Nomad / Lizard-Rider Levy

Strict Canon & Geometry Invariants:
- Equal ⅓ Mesoamerican + ⅓ Classical Ottoman + ⅓ Morrowind Dunmer synthesis on `chichani`.
- STRICTLY ZERO House Redoran bulbous raw-chitin bug-carapaces (`dunmer_bonemold`, `crab_carapace`,
  `armor.lamellar.chitin` are banned): rigid Dunmer armor in Voth is smooth architectural molded
  ash-resin & calcined bone-paste inlaid with brass/gold geometric filigree over quilted cotton.
- Manifest-only standalone build (`tools/garments/cultures/vothic_manifest.json`) without mutating
  shared `kit.json` or `peoples.json`.
"""
from contextlib import contextmanager
import json
import math
import struct
import sys
import time
from pathlib import Path
import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import connected_components
from scipy.spatial import cKDTree

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

import glbio  # noqa: E402
from garments import core  # noqa: E402
from garments import paint as paint_mod  # noqa: E402
from garments.core import (  # noqa: E402
    Part, J, L, R, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment,
)
from garments.paint import P, B, PN, C, COTTON, WOOL, leathery, sample_cultural_tex  # noqa: E402
from garments.types.torso import (  # noqa: E402
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, crossed_sash, pauldron,
)
from garments.types.armor import (  # noqa: E402
    cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import limb_tube, sleeve, sleeves, trousers, skirt, full_gloves  # noqa: E402
from garments.types.footwear import boots, sandal  # noqa: E402
from garments.types.headgear import (  # noqa: E402
    head_landmarks_exact, sculpted_faceplate, hood, brim,
    tower_hat, conical_hat, crown_band, fan, crest, horn, turban,
)
from garments.types.accoutrements import (  # noqa: E402
    blob, belt_sash, pouch_belt, sash_with_tail, button_row, pendants, tube, rosette, tassel,
)


# ===========================================================================================================
# SCOPED VOTHIC & ARCOLOGY PALETTE + ANTI-REDORAN CHITIN GUARDRAIL
# ===========================================================================================================
VTH_COLORS = {
    'vth_blitrit':      (0.210, 0.045, 0.270),  # Saturated Imperial Blïtrit blood-reed purple
    'vth_oldplum':      (0.165, 0.075, 0.145),  # Weathered Heartland soot-faded Blïtrit plum
    'vth_ashwhite':     (0.890, 0.870, 0.840),  # Vothic ash-white diamond blazon & tax-tally white
    'vth_tzungold':     (0.880, 0.660, 0.200),  # Gleaming Tzun solar gold
    'vth_oldbrass':     (0.560, 0.430, 0.190),  # Tarnished antique Heartland brass
    'vth_bonepaste':    (0.760, 0.650, 0.460),  # Smooth architectural calcined bone-paste (non-chitin!)
    'vth_ebonresin':    (0.088, 0.084, 0.095),  # Matte ebony molded caldera ash-resin
    'vth_indoverd':     (0.085, 0.380, 0.285),  # High-Indoril Ordinator temple emerald-verdigris
    'vth_porphyry':     (0.460, 0.052, 0.088),  # Temple Canton porphyry-crimson
    'vth_reedolive':    (0.310, 0.340, 0.200),  # Lake of Shim & Azoth marsh-reed olive
    'vth_ichca':        (0.800, 0.750, 0.630),  # Brine-hardened unbleached ichcahuipilli cotton ecru
    'vth_almuaindigo':  (0.070, 0.120, 0.260),  # Sea-waxed Almua & Temora maritime indigo
    'vth_ashochre':     (0.580, 0.420, 0.240),  # Zey'danin volcanic-ash ochre
    'vth_penitentgrey': (0.340, 0.330, 0.320),  # Ash-smeared Grey Penitent sackcloth grey
    'vth_dalabjade':    (0.110, 0.460, 0.320),  # Captured Dalabite frontier greenstone trophy jade
    'arc_canvas':       (0.440, 0.450, 0.420),  # Reclaimed Ancient polymer utility canvas grey
    'arc_alloy':        (0.720, 0.750, 0.770),  # Salvaged brushed Ancient arcology louver alloy
    'arc_tyre':         (0.105, 0.105, 0.115),  # Vulcanized truck-tyre & conveyor rubber
    'arc_rustplate':    (0.380, 0.195, 0.115),  # Rusted wasteland road-plate steel
    'arc_tapa':         (0.740, 0.630, 0.460),  # Hetānini Sikau bark-cloth tapa
}

FORBIDDEN_CHITIN_TOKENS = {
    'dunmer_bonemold',
    'crab_carapace',
    'iziz_chitin_scale',
    'armor.lamellar.chitin',
    'chitin.shroudant.bronze',
}

VTH_CUSTOM_MOTIFS = {
    'vth_blitrit_diamond',
    'vth_ash_resin_inlay',
    'vth_xicalcoliuhqui_fret',
    'vth_ott_kemha',
    'vth_ordinator_emerald',
    'vth_dres_kaunakes',
    'arc_scrap_diamond',
    'arc_tyre_ichca',
    'arc_tapa_diamond',
    'arc_scyvoi_khilat',
}


def _vth_custom_motif(style, w, h, fg, bg, aspect=1.0):
    base_style = style.split(':')[0]
    H = max(int(h), 1)
    W = max(int(w), 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H

    if base_style == 'vth_blitrit_diamond':
        # Ash-white Vothic diamond blazon + Daedric-Georgian thorn border on deep Blïtrit purple
        nx = max(2.0, round(3.2 * max(aspect, 0.45)))
        ny = max(1.0, round(2.2 / max(aspect, 0.45)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        d = np.abs(gu) + np.abs(gv)
        outer_d = (d > 0.56) & (d < 0.76)
        inner_d = d < 0.26
        thorn = (np.abs(gu) < 0.08) & (np.abs(gv) < 0.88)
        rail = (v < 0.07) | (v > 0.93)
        img[outer_d | inner_d | thorn] = C['vth_ashwhite']
        img[rail] = fg
        broc = sample_cultural_tex('tex.voth_blitrit_brocade', W, H, fg, bg, pal_blend=0.25)
        img = 0.56 * img + 0.44 * broc

    elif base_style == 'vth_ash_resin_inlay':
        # Smooth architectural calcined bone-paste / ash-resin plates inlaid with geometric brass filigree
        # (STRICTLY non-chitin: crisp straight bevelled rectangular/chevron masonry courses + diamond rivets)
        ny = max(3.0, round(4.5 / max(aspect, 0.45)))
        nx = max(2.0, round(3.5 * max(aspect, 0.45)))
        gv = (v * ny) % 1.0
        row = np.floor(v * ny).astype(int)
        gu = ((u * nx + 0.5 * (row % 2)) % 1.0 - 0.5) * 2.0
        # Smooth matte plate highlight & crisp recessed mortar/bevel joint
        joint = (gv < 0.08) | (gv > 0.92) | (np.abs(gu) > 0.90)
        inlay_frame = ((gv >= 0.14) & (gv < 0.21)) | ((gv > 0.79) & (gv <= 0.86)) | (
            (np.abs(gu) > 0.76) & (np.abs(gu) <= 0.84) & (gv >= 0.14) & (gv <= 0.86)
        )
        d_ctr = np.abs(gu) + np.abs((gv - 0.5) * 2.0)
        diamond_boss = (d_ctr > 0.26) & (d_ctr < 0.40)
        img[:] = bg
        img[(gv >= 0.08) & (gv < 0.14)] = np.clip(np.asarray(bg) * 1.12, 0.0, 1.0)
        img[joint] = np.asarray(bg) * 0.52
        img[inlay_frame | diamond_boss] = fg

    elif base_style == 'vth_xicalcoliuhqui_fret':
        # Mesoamerican stepped xicalcoliuhqui spiral fret + Tzun solar border
        nx = max(2.0, round(4.0 * max(aspect, 0.45)))
        gu = (u * nx) % 1.0
        gv = v
        # Stepped diagonal terrace + hooked spiral block
        step_idx = np.floor(gu * 6.0)
        v_step = step_idx / 6.0
        step_band = (np.abs(gv - (0.18 + 0.64 * v_step)) < 0.13) | (
            (gu > 0.52) & (gu < 0.86) & (gv > 0.24) & (gv < 0.62) & ((np.abs(gu - 0.70) > 0.08) | (np.abs(gv - 0.43) > 0.08))
        )
        selv = (gv < 0.10) | (gv > 0.90)
        img[step_band | selv] = fg
        kilim = sample_cultural_tex('tex.voth_kilim', W, H, fg, bg, pal_blend=0.28)
        img = 0.58 * img + 0.42 * kilim

    elif base_style == 'vth_ott_kemha':
        # Classical Ottoman kemha / çatma ogival silk brocade with solar tulip medallions
        nx = max(2.0, round(3.0 * max(aspect, 0.45)))
        ny = max(2.0, round(3.0 / max(aspect, 0.45)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        ogive = np.abs(np.abs(gu) + (gv ** 2) * 0.85 - 0.78) < 0.10
        r_med = np.hypot(gu * 0.95, gv * 1.15)
        tulip = (r_med < 0.42) & ((r_med > 0.24) | (np.abs(gu) < 0.09))
        crown_pts = (gv < -0.15) & (gv > -0.52) & (np.abs(np.abs(gu) - 0.20) < 0.06)
        img[ogive | tulip | crown_pts] = fg
        img[r_med < 0.14] = C['vth_blitrit']
        fil = sample_cultural_tex('tex.voth_filigree', W, H, fg, bg, pal_blend=0.24)
        img = 0.50 * img + 0.50 * fil

    elif base_style == 'vth_ordinator_emerald':
        # High-Indoril × Aztec emerald-and-gold temple frieze with Dhelv diamond seals
        nx = max(2.0, round(3.4 * max(aspect, 0.45)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        d = np.abs(gu) + np.abs(gv)
        frame_g = (np.abs(gv) > 0.80) | ((d > 0.62) & (d < 0.78))
        sun_rays = (d < 0.58) & ((np.abs(gu) < 0.08) | (np.abs(gv) < 0.08) | (np.abs(np.abs(gu) - np.abs(gv)) < 0.07))
        img[frame_g | sun_rays] = fg
        img[d < 0.22] = C['vth_ashwhite']
        frz = sample_cultural_tex('tex.voth_ordinator_frieze', W, H, fg, bg, pal_blend=0.22)
        img = 0.48 * img + 0.52 * frz

    elif base_style == 'vth_dres_kaunakes':
        # Azoth frontier Shumari-captured kaunakes stepped wool-tuft & bronze-lapis tiraz trim
        nx = max(4.0, round(8.0 * max(aspect, 0.5)))
        ny = max(2.0, round(3.0 / max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v * ny) % 1.0
        tuft = (np.abs(gu) < 0.72 - 0.35 * gv) & (gv > 0.12)
        top_bar = v < 0.16
        img[tuft] = fg
        img[top_bar] = C['cobalt']
        tiraz = sample_cultural_tex('tex.shumari_sumaru_tiraz', W, H, fg, bg, pal_blend=0.26)
        img = 0.55 * img + 0.45 * tiraz

    elif base_style == 'arc_scrap_diamond':
        # Mad Max / Fallout rusted road-plate stenciled with rough dripping ash-white Vothic diamond & splashed purple
        tread = sample_cultural_tex('tex.salvage_tread_plate', W, H, C['iron'], bg, pal_blend=0.35)
        img = tread.copy()
        cu = (u - 0.5) * 2.0
        cv = (v - 0.44) * 2.0
        # Splashed ragged Blïtrit purple backing blotch
        blotch = np.hypot(cu * 0.9, cv * 0.95) < (0.72 + 0.08 * np.sin(u * 19.0 + v * 13.0))
        img[blotch] = 0.30 * img[blotch] + 0.70 * np.asarray(C['vth_blitrit'])
        # Crude hand-brushed ash-white Vothic diamond + paint drips running down (+v)
        d = np.abs(cu) * 1.05 + np.abs(cv)
        brush_jit = 0.045 * np.sin(u * 31.0) * np.cos(v * 23.0)
        diam = ((d > 0.30 + brush_jit) & (d < 0.58 + brush_jit)) | (d < 0.13)
        drip1 = (np.abs(cu + 0.18) < 0.035) & (v > 0.58) & (v < 0.88)
        drip2 = (np.abs(cu - 0.06) < 0.030) & (v > 0.64) & (v < 0.94)
        drip3 = (np.abs(cu - 0.24) < 0.026) & (v > 0.55) & (v < 0.80)
        img[diam | drip1 | drip2 | drip3] = C['vth_ashwhite']

    elif base_style == 'arc_tyre_ichca':
        # Heavy vulcanized truck-tyre tread & wire-laced conveyor-belt ichcahuipilli brigandine
        nx = max(3.0, round(5.5 * max(aspect, 0.45)))
        ny = max(4.0, round(6.5 / max(aspect, 0.45)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v * ny) % 1.0
        lug = np.abs(gv - 0.5 - 0.28 * np.abs(gu)) < 0.20
        wire = (np.abs(gu) > 0.86) & (np.abs(gv - 0.5) < 0.16)
        img[:] = bg
        img[lug] = np.clip(np.asarray(bg) * 1.45 + 0.03, 0.0, 1.0)
        img[wire] = fg
        trd = sample_cultural_tex('tex.salvage_tread_plate', W, H, fg, bg, pal_blend=0.40)
        img = 0.62 * img + 0.38 * trd

    elif base_style == 'arc_tapa_diamond':
        # Hetānini geometric Sikau bark-cloth tapa overlaid with Vothic purple & brass diamond border
        tapa = sample_cultural_tex('tex.islander_hukoa_tapa', W, H, fg, bg, pal_blend=0.22)
        img = tapa.copy()
        nx = max(3.0, round(5.0 * max(aspect, 0.45)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        band_m = np.abs(gv) > 0.68
        d = np.abs(gu) + np.abs((np.abs(gv) - 0.84) * 5.0)
        img[band_m] = C['vth_blitrit']
        img[band_m & (d < 0.55)] = C['vth_ashwhite']

    elif base_style == 'arc_scyvoi_khilat':
        # Scyvoi ebon rawhide lamellar overlaid with Vothic purple-and-gold khilat border
        lam = sample_cultural_tex('tex.scyvoi_ebon_lamellar', W, H, fg, bg, pal_blend=0.22)
        img = lam.copy()
        hem = v > 0.80
        nx = max(3.0, round(5.0 * max(aspect, 0.45)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv_h = ((v - 0.80) / 0.20 - 0.5) * 2.0
        img[hem] = C['vth_blitrit']
        img[hem & ((np.abs(gu) + np.abs(gv_h)) < 0.65)] = C['vth_tzungold']

    return np.clip(img, 0.0, 1.0)


@contextmanager
def vothic_motif_scope():
    """Temporarily register `vth_*`/`arc_*` palette keys and custom motifs without mutating `paint.py`."""
    orig_motif = paint_mod.motif
    added_colors = []
    for k, v in VTH_COLORS.items():
        if k not in C:
            C[k] = v
            added_colors.append(k)

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        base = style.split(':')[0] if isinstance(style, str) else ''
        if base in VTH_CUSTOM_MOTIFS:
            return _vth_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif
        for k in added_colors:
            C.pop(k, None)


def _assert_no_redoran_chitin(gid, parts):
    """Hard build-time assertion enforcing the Anti-Redoran Bug-Chitin Rule across all Vothic pieces."""
    flat = []
    for item in parts:
        if isinstance(item, (list, tuple)):
            flat.extend(x for x in item if x is not None)
        elif item is not None:
            flat.append(item)

    def _scan(val):
        if isinstance(val, str):
            base = val.split(':')[0]
            if val in FORBIDDEN_CHITIN_TOKENS or base in FORBIDDEN_CHITIN_TOKENS:
                raise ValueError(f'Anti-Redoran Chitin violation on {gid}: forbidden token {val!r}')
        elif isinstance(val, dict):
            for v in val.values():
                _scan(v)
        elif isinstance(val, (list, tuple)):
            for v in val:
                _scan(v)

    for p in flat:
        _scan(getattr(p, 'paint', None))


def _vth_assemble(gid, label, slot, culture, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False):
    _assert_no_redoran_chitin(gid, parts)
    ent = assemble_garment(
        gid, label, slot, culture, parts,
        covers_hair=covers_hair, covers_face=covers_face,
        open_torso=open_torso, legged=legged,
    )
    ent['_body'] = core.BODY_ID
    return ent


# ===========================================================================================================
# SHARED GEOMETRY & PAINT HELPERS (ZERO EYE-WRAP, ZERO FLOATING ISLANDS, ZERO PACK-STRAP HOVER)
# ===========================================================================================================
def _vth_cranial_shell(name, paint, f_top=1.02, f_bot=-0.04, ease=0.012, rows=14, n=36):
    """Open-face cranial helmet/cap shell: descends to `f_bot` around the occiput and neck while arching
    cleanly up to `f_brow=0.60` across the front face so it NEVER wraps across the eyes or nose,
    and avoids double-taper skull poke-through at the crown."""
    a, b, up, bk, left = head_frame()
    head_len = float(np.linalg.norm(b - a))
    f_top_use = max(float(f_top), 1.05)
    ease_use = float(ease)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angs]
    # Sample equator radii once at mid-cranium (avoids double-taper poke-through near the crown)
    c_mid = a + (b - a) * 0.56
    base_rs = []
    for d in ds:
        h_eq = first_hit(c_mid, d)
        base_rs.append((float(h_eq) if (h_eq is not None and 0.045 < h_eq < 0.145) else 0.098) + ease_use)
    base_rs = np.array([np.mean([base_rs[(j + dj) % n] for dj in (-2, -1, 0, 1, 2)]) for j in range(n)])

    f_brow = min(f_top_use - 0.16, 0.60)
    f_rim = np.full(n, float(f_bot), dtype=np.float64)
    if f_bot < f_brow:
        half_span = 0.56 * math.pi
        for j, an in enumerate(angs):
            ang_front = abs(an - math.pi)
            if ang_front < half_span:
                w = 0.5 + 0.5 * math.cos(math.pi * ang_front / half_span)
                f_rim[j] = float(f_bot) + (f_brow - float(f_bot)) * (w ** 0.82)

    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for i in range(rows):
        u = i / float(max(rows - 1, 1))
        for j, (an, d) in enumerate(zip(angs, ds)):
            f_ij = f_top_use + (float(f_rim[j]) - f_top_use) * u
            c_ij = a + (b - a) * f_ij
            if f_ij > 0.68:
                u_top = min(1.0, (f_ij - 0.68) / max(0.10, f_top_use - 0.68))
                scale_r = max(0.04, math.sqrt(max(0.0, 1.0 - u_top ** 1.75)))
            elif f_ij < 0.20:
                scale_r = 1.0 - 0.10 * ((0.20 - f_ij) / 0.30)
            else:
                scale_r = 1.0 + 0.025 * math.sin((f_ij - 0.20) / 0.48 * math.pi)
            r_ij = float(base_rs[j]) * scale_r
            if f_ij <= 0.96:
                h_hit = first_hit(c_ij, d)
                if h_hit is not None and 0.020 < h_hit < 0.145:
                    r_ij = max(r_ij, float(h_hit) + ease_use)
            Q[i, j] = c_ij + d * r_ij
    apex_c = b + up * max(0.026, (f_top_use - 1.0) * head_len)
    Q[0] = apex_c + (Q[0] - apex_c) * 0.04
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _snap_on_part(host_part, target_pt, out_push=0.003):
    """Snap a 3D point directly onto the nearest vertex of `host_part.P` plus a small outward push.
    Guarantees <= 5mm component adjacency on BOTH `mpfb_male` and `mpfb_female`."""
    pts = host_part.P.reshape(-1, 3)
    idx = int(np.argmin(np.linalg.norm(pts - np.asarray(target_pt, float), axis=1)))
    p = pts[idx].copy()
    c_ax = spine_at(min(max(float(p[2]), 0.50), core.TOP)) if p[2] < core.NECK[2] + 0.04 else J('Head')
    d_out = np.array([p[0] - c_ax[0], p[1] - c_ax[1], 0.0], dtype=np.float64)
    nrm = float(np.linalg.norm(d_out))
    if nrm > 1e-6:
        d_out /= nrm
    else:
        d_out = np.array([0.0, -1.0, 0.0])
    return p + d_out * float(out_push), d_out


def _sculpted_visage_mask(gid, face_paint, detail_paint, eye_paint=None, ease=0.013, f_top=0.68, f_bot=0.01, mouth=True):
    """Sculpted 3D war-mask / visage faceplate with proud `+4.2mm` dark eye-slits, brow bar & nasal keel."""
    a, b, up, bk, left = head_frame()
    fp = sculpted_faceplate(
        gid + '_face', face_paint, f_top=f_top, f_bot=f_bot, ease=ease,
        span=0.45, rows=15, cols=23,
        brow_relief=0.015, nose_relief=0.020, cheek_relief=0.010, chin_relief=0.009,
    )
    parts = [fp]
    Q = fp.P

    def _fp_pt(v_frac, u_frac, push=0.0042):
        ri = int(round(np.clip(v_frac, 0.0, 1.0) * (Q.shape[0] - 1)))
        ci = int(round(np.clip(0.5 + 0.5 * u_frac, 0.0, 1.0) * (Q.shape[1] - 1)))
        p = Q[ri, ci]
        d_out = p - np.array([a[0], a[1], p[2]])
        d_out /= max(float(np.linalg.norm(d_out)), 1e-6)
        return p + d_out * push

    brow_pts = [_fp_pt(0.26, u, 0.0045) for u in np.linspace(-0.74, 0.74, 7)]
    parts.append(tube(gid + '_browbar', brow_pts, 0.0058, detail_paint, n=6, rigid_joint='Head'))
    nose_pts = [_fp_pt(v, 0.0, 0.0044) for v in np.linspace(0.26, 0.62, 4)]
    parts.append(tube(gid + '_nosebar', nose_pts, 0.0048, detail_paint, n=6, rigid_joint='Head'))

    ep = eye_paint or P('soot', 0.02)
    for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
        pts = [_fp_pt(0.40, sgn * u, 0.0045) for u in np.linspace(0.15, 0.56, 4)]
        parts.append(tube(f'{gid}_eyeslit_{tag}', pts, 0.0048, ep, n=6, rigid_joint='Head'))
    if mouth:
        m_pts = [_fp_pt(0.76, u, 0.0040) for u in np.linspace(-0.25, 0.25, 4)]
        parts.append(tube(gid + '_mouthslit', m_pts, 0.0035, P('soot', 0.02), n=6, rigid_joint='Head'))
    return parts


def _ash_goggles(gid, host_part, rim_paint, lens_paint):
    """Dunmer smoked-obsidian or amber caldera dust-goggles welded onto `host_part` at exact eye landmarks."""
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    c_eye = a + (b - a) * f_eyes
    parts = [crown_band(gid + '_gstrap', rim_paint, f0=max(0.46, f_eyes - 0.03), f1=f_eyes + 0.04, ease=0.017, flare=0.002, rows=4, n=32)]
    l_ctrs = []
    for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
        tgt = c_eye - bk * 0.095 + left * (sgn * x_eye)
        p_surf, d_out = _snap_on_part(host_part, tgt, out_push=0.004)
        l_ctrs.append(p_surf)
        parts.append(rosette(f'{gid}_grim_{tag}', p_surf, -bk, left, 0.023, rim_paint, n=12, thick=0.012, rigid_joint='Head'))
        parts.append(rosette(f'{gid}_glens_{tag}', p_surf - bk * 0.005, -bk, left, 0.016, lens_paint, n=10, thick=0.010, rigid_joint='Head'))
    parts.append(tube(gid + '_gbridge', [l_ctrs[0], 0.5 * (l_ctrs[0] + l_ctrs[1]) - bk * 0.004, l_ctrs[1]], 0.0045, rim_paint, n=6, rigid_joint='Head'))
    return parts


def _krug_mirror_disc(gid, host_part, z_height, radius, disc_paint, boss_paint=None):
    """Ottoman krug solar/mirror breastplate disc conformed flush onto `host_part.P`."""
    tgt = chest_front(z_height, 0.020)
    p_surf, d_out = _snap_on_part(host_part, tgt, out_push=0.004)
    out = [rosette(gid + '_krug', p_surf, d_out, np.array([1.0, 0.0, 0.0]), radius, disc_paint, n=14, thick=0.011)]
    if boss_paint is not None:
        out.append(rosette(gid + '_krug_boss', p_surf + d_out * 0.005, d_out, np.array([1.0, 0.0, 0.0]), radius * 0.42, boss_paint, n=10, thick=0.010))
    return out


def _dorsal_pad(gid, pad_paint, z_offset=-0.015, size=(0.118, 0.026, 0.148)):
    """Flush `Spine2` dorsal mounting pad (avoids `pack_straps` shoulder hover on sleeveless/wide-neck torsos)."""
    c_sp = spine_at(J('Spine2')[2] + z_offset)
    bp = surface_out(c_sp, np.array([0.0, 1.0, 0.0]), 0.012, bvh=core.BVH_T)
    pad = blob(gid + '_dpad', bp + np.array([0.0, 0.010, 0.0]), size, pad_paint,
               n=10, rows=5, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2')
    return bp, pad


# Shared Paint Recipes
def _p_bonepaste(base='vth_bonepaste', inlay='vth_oldbrass'):
    return P(base, 0.04, [
        B('top', 0.0, 0.022, 'solid', inlay),
        B('bottom', 0.0, 0.024, 'solid', inlay),
    ], [
        PN(0.0, 1.0, 'vth_ash_resin_inlay', inlay, base, 0.16),
    ], fabric='leather.cuir_bouilli')


def _p_blitrit(base='vth_blitrit', trim='vth_tzungold', fab='cloth.silk'):
    return P(base, 0.04, [
        B('bottom', 0.0, 0.065, 'vth_blitrit_diamond', trim, base),
        B('top', 0.0, 0.024, 'solid', trim),
    ], [
        PN(0.0, 1.0, 'vth_blitrit_diamond', trim, base, 0.20),
    ], fabric=fab)


def _p_ichca(base='vth_ichca', trim='vth_oldplum', stitch='umber'):
    return P(base, 0.05, [
        B('bottom', 0.0, 0.055, 'vth_xicalcoliuhqui_fret', 'vth_oldbrass', trim),
        B('top', 0.0, 0.022, 'solid', trim),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', stitch, base, 0.14),
    ], fabric='cloth.quilted.diamond')


def _p_metal(col='vth_tzungold', trim='soot', fab='metal.gold'):
    return P(col, 0.03, [
        B('top', 0.0, 0.018, 'solid', trim),
        B('bottom', 0.0, 0.018, 'solid', trim),
    ], fabric=fab)


# ===========================================================================================================
# PART A: `chichani` — PILLAR I: OLD-STYLE HEARTLAND (`Shim / Driyan / Azoth`)
# ===========================================================================================================
def _build_shim_reedcutter(s):
    """1. Shim Blïtrit Dye-Vat & Chinampa Peasant."""
    p_reed = P('totorareed', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'vth_oldplum')], fabric='straw.reed.plaited')
    p_raw = P('vth_ichca', 0.06, [
        B('bottom', 0.0, 0.075, 'vth_xicalcoliuhqui_fret', 'vth_ashwhite', 'vth_oldplum'),
        B('top', 0.0, 0.022, 'solid', 'vth_reedolive'),
    ], fabric=COTTON)
    p_vat = P('vth_oldplum', 0.06, [
        B('bottom', 0.0, 0.080, 'vth_blitrit_diamond', 'vth_ashwhite', 'vth_blitrit'),
    ], fabric='cloth.weave.burlap')

    # Head: Bare-head woven reed sun-ring (`ease=0.004` < 12mm skull hover!) + tiny white diamond tally bead
    band_h = crown_band(f'vth_{s}_shim_sunring_b', p_reed, f0=0.58, f1=0.70, ease=0.004, flare=0.002, rows=5, n=36)
    a, b, up, bk, left = head_frame()
    p_fr, d_fr = _snap_on_part(band_h, a + (b - a) * 0.64 - bk * 0.11, out_push=0.003)
    head = _vth_assemble(
        f'vth_{s}_shim_sunring', 'Shim Woven Lake-Reed Sun-Ring', 'head', 'chichani',
        [band_h, rosette(f'vth_{s}_shim_tally', p_fr, -bk, left, 0.015, P('vth_ashwhite', 0.04), n=8, thick=0.008, rigid_joint='Head')],
        covers_hair=False,
    )

    # Torso: Sleeveless raw-cotton tilmatli/xicolli + Blïtrit dye-stained front apron + knotted shoulder clasp
    vest = torso_tube(f'vth_{s}_shim_xicolli', core.TOP - 0.014, core.WAIST - 0.024, 0.020, p_raw, rows=14, n=40)
    apron = tabard(f'vth_{s}_shim_apron', core.CROTCH - 0.03, core.WAIST + 0.02, p_vat, width=0.22, ease=0.026, front=True, back=False)
    sash_w = belt_sash(f'vth_{s}_shim_waist', core.WAIST - 0.004, core.WAIST + 0.034, p_reed, ease=0.025)
    torso = _vth_assemble(
        f'vth_{s}_shim_tilmatli', 'Shim Raw-Cotton Tilmatli & Dye-Vat Apron', 'torso', 'chichani',
        [vest, sash_w, apron], open_torso=True,
    )

    # Gloves: Purple-stained reed forearm wraps
    gloves = _vth_assemble(
        f'vth_{s}_shim_reed_wraps', 'Blïtrit-Stained Reed Forearm Wraps', 'gloves', 'chichani',
        [sleeve(f'vth_{s}_shim_wrap_L', L, p_vat, f0=0.56, f1=0.94, ease=0.012, flare=0.004),
         sleeve(f'vth_{s}_shim_wrap_R', R, p_vat, f0=0.56, f1=0.94, ease=0.012, flare=0.004)],
    )

    # Legs: Mesoamerican maxtlatl / cueitl wrap-skirt starting strictly below rigid waist belt
    legs = _vth_assemble(
        f'vth_{s}_shim_cueitl', 'Shim Chinampa Cueitl Wrap-Skirt', 'legs', 'chichani',
        [skirt(f'vth_{s}_shim_skirt', core.KNEE + 0.03, core.WAIST - 0.018, p_raw, ease=0.019, flare=0.080)],
        legged=False,
    )

    # Feet: Woven lake-reed sandals
    feet = _vth_assemble(
        f'vth_{s}_shim_sandals', 'Woven Lake-Reed Chinampa Sandals', 'feet', 'chichani',
        sandal(f'vth_{s}_shim_sandals', p_reed, p_vat, laces=2),
    )

    # Back: Flush Spine2 pad + woven basket filled with crimson-purple Blïtrit blood-reed stalks
    bp, dpad = _dorsal_pad(f'vth_{s}_shim_bsk', p_reed)
    bsk = blob(f'vth_{s}_shim_basket_body', bp + np.array([0.0, 0.062, -0.01]), (0.175, 0.115, 0.220),
               p_reed, n=12, rows=6, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2')
    reeds = [
        tube(f'vth_{s}_blitrit_stalk_{k}', [
            bp + np.array([xo, 0.058, 0.04]),
            bp + np.array([xo * 1.25, 0.075, 0.24 + 0.02 * (k % 2)]),
        ], 0.014, P('vth_blitrit', 0.05, [B('top', 0.0, 0.04, 'solid', 'crimson')], fabric='straw.reed.plaited'), n=8, rigid_joint='Spine2')
        for k, xo in enumerate((-0.052, -0.018, 0.018, 0.052))
    ]
    back = _vth_assemble(
        f'vth_{s}_shim_reed_basket', 'Bundled Blïtrit Blood-Reed Harvest Basket', 'back', 'chichani',
        [dpad, bsk, reeds],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_driyan_clan_elder(s):
    """2. Driyan Kingsmoot Patrician & Shumari-Script Archivist."""
    p_entari = P('vth_oldplum', 0.04, [
        B('bottom', 0.0, 0.085, 'vth_xicalcoliuhqui_fret', 'vth_oldbrass', 'soot'),
        B('top', 0.0, 0.028, 'solid', 'vth_oldbrass'),
    ], [
        PN(0.0, 1.0, 'vth_ott_kemha', 'vth_oldbrass', 'vth_oldplum', 0.22),
    ], fabric='cloth.bazin.damask')
    p_quech = P('vth_reedolive', 0.05, [
        B('bottom', 0.0, 0.045, 'vth_xicalcoliuhqui_fret', 'vth_oldbrass', 'vth_oldplum'),
    ], fabric=WOOL)
    p_brass = _p_metal('vth_oldbrass', 'umber', 'metal.bronze')

    # Head: Tall pleated archaic kafesi turban + tarnished brass sun-pin
    kaf = tower_hat(f'vth_{s}_driyan_kafesi_hat', 0.18, lambda u: 1.0 + 0.16 * math.sin(u * math.pi * 0.85),
                    p_entari, f=0.63, ease=0.015, rows=12, n=36)
    a, b, up, bk, left = head_frame()
    p_pin, _ = _snap_on_part(kaf, a + (b - a) * 0.78 - bk * 0.12, out_push=0.004)
    head = _vth_assemble(
        f'vth_{s}_driyan_kafesi', 'Driyan Archaic Pleated Kafesi Turban', 'head', 'chichani',
        [kaf, rosette(f'vth_{s}_driyan_sunpin', p_pin, -bk, left, 0.024, p_brass, n=12, thick=0.010, rigid_joint='Head')],
        covers_hair=True,
    )

    # Torso: Layered faded-purple & lichen-gold entari (cloth-sim below waist) + quechquemitl shoulder-cape + bone pectoral
    coat = torso_tube(f'vth_{s}_driyan_robe', core.TOP - 0.008, core.KNEE + 0.05, 0.034, p_entari,
                      hang_from=core.WAIST, flare=0.100, rows=24, n=42)
    slv = sleeves(f'vth_{s}_driyan', 'wrist', 0.018, p_entari, ease_end=0.024, rows=10)
    quech = collar_disc(f'vth_{s}_driyan_quech', 0.11, p_quech, drop=0.105, rows=9, scallop=0.06, ease=0.022)
    pect = _krug_mirror_disc(f'vth_{s}_driyan_pect', coat, core.CHEST + 0.02, 0.052, _p_bonepaste('vth_bonepaste', 'vth_oldbrass'), p_brass)
    sash = sash_with_tail(f'vth_{s}_driyan', p_quech, p_entari, ease=0.036, tail=0.26)
    torso = _vth_assemble(
        f'vth_{s}_driyan_entari', 'Driyan Layered Entari & Quechquemitl Mantle', 'torso', 'chichani',
        [coat, slv, quech, sash, pect],
    )

    # Gloves: Tarnished brass filigree archivist bracers
    gloves = _vth_assemble(
        f'vth_{s}_driyan_bracers', 'Tarnished Brass Filigree Archivist Bracers', 'gloves', 'chichani',
        [sleeve(f'vth_{s}_driyan_brc_L', L, p_brass, f0=0.58, f1=0.95, ease=0.014, flare=0.006),
         sleeve(f'vth_{s}_driyan_brc_R', R, p_brass, f0=0.58, f1=0.95, ease=0.014, flare=0.006)],
    )

    # Legs: Tailored archaic şalvar cleanly under entari
    legs = _vth_assemble(
        f'vth_{s}_driyan_salvar', 'Driyan Stepped-Fret Ceremonial Şalvar', 'legs', 'chichani',
        trousers(f'vth_{s}_driyan_slv', P('umber', 0.05, [B('bottom', 0.0, 0.05, 'vth_xicalcoliuhqui_fret', 'vth_oldbrass', 'vth_oldplum')], fabric=WOOL),
                 ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Weathered archaic leather yemeni shoes
    feet = _vth_assemble(
        f'vth_{s}_driyan_yemeni', 'Archaic Leather Yemeni Shoes', 'feet', 'chichani',
        boots(f'vth_{s}_driyan_yem', P('soot', 0.08), P('leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'vth_oldbrass')]), top=0.28, ease_top=0.020),
    )

    # Back: Clay-tablet & ancestral bone-scroll twin case on Spine2 pad
    bp, dpad = _dorsal_pad(f'vth_{s}_driyan_sc', P('leather', 0.06))
    tubes_b = []
    for k, xo in enumerate((-0.046, 0.046)):
        p0 = bp + np.array([xo, 0.042, -0.13])
        p1 = bp + np.array([xo, 0.042, 0.16])
        tubes_b.append(tube(f'vth_{s}_driyan_case_{k}', [p0, p1], 0.032, _p_bonepaste('vth_bonepaste', 'vth_oldbrass'), n=10, rigid_joint='Spine2'))
        tubes_b.append(blob(f'vth_{s}_driyan_cap_{k}', p1 + np.array([0.0, 0.0, 0.008]), (0.068, 0.068, 0.024), p_brass, n=10, rows=4, rigid_joint='Spine2'))
    back = _vth_assemble(
        f'vth_{s}_driyan_scroll_case', 'Shumari Clay-Tablet & Ancestor-Bone Scroll Case', 'back', 'chichani',
        [dpad, tubes_b],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_azoth_dres_overseer(s):
    """3. Azoth (House-Dres Style) Blïtrit Estate Master & Slave-Taker."""
    p_dark_lth = leathery(P('soot', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'vth_oldbrass')], fabric='leather.cuir_bouilli'))
    p_splint = _p_bonepaste('umber', 'vth_oldbrass')
    p_reed = P('totorareed', 0.06, [B('bottom', 0.0, 0.035, 'solid', 'vth_oldplum')], fabric='straw.reed.plaited')
    p_kaun = P('vth_oldplum', 0.05, [
        B('bottom', 0.0, 0.060, 'vth_dres_kaunakes', 'vth_oldbrass', 'vth_oldplum'),
    ], [
        PN(0.0, 1.0, 'vth_dres_kaunakes', 'vth_ichca', 'vth_oldplum', 0.14),
    ], fabric=WOOL)
    p_iron = _p_metal('iron', 'soot', 'metal.iron')
    p_brass = _p_metal('vth_oldbrass', 'soot', 'metal.bronze')

    # Head: Wide woven marsh-reed Dres sun-cowl + sinister faceless dark-leather & brass slave-taker mask
    cowl_shell = _vth_cranial_shell(f'vth_{s}_azoth_cowl_sh', p_dark_lth, f_top=1.02, f_bot=-0.06, ease=0.013)
    sun_cone = conical_hat(f'vth_{s}_azoth_sunhat', p_reed, f_base=0.66, f_top=1.16, r_base=0.31, r_top=0.02, rows=10, n=36)
    mask_pts = _sculpted_visage_mask(f'vth_{s}_azoth_mask', p_dark_lth, p_brass, eye_paint=P('crimson', 0.02), ease=0.014, mouth=False)
    head = _vth_assemble(
        f'vth_{s}_azoth_dres_cowl', 'Azoth Dres Marsh-Reed Sun-Cowl & Slave-Taker Mask', 'head', 'chichani',
        [cowl_shell, sun_cone, mask_pts], covers_hair=True, covers_face=True,
    )

    # Torso: Lacquered leather & bone-splint plantation corselet over faded-purple xicolli + Shumari kaunakes fringe skirt
    corselet = torso_tube(f'vth_{s}_azoth_corselet', core.TOP - 0.010, core.CROTCH - 0.11, 0.035, p_splint,
                          hang_from=core.WAIST, flare=0.104, rows=20, n=40)
    slv = sleeves(f'vth_{s}_azoth_ov', 'elbow', 0.017, P('vth_oldplum', 0.05, fabric=COTTON), rows=7)
    paul_l = pauldron(f'vth_{s}_azoth_paul_L', L, p_dark_lth, reach=0.32, ease=0.024)
    paul_r = pauldron(f'vth_{s}_azoth_paul_R', R, p_dark_lth, reach=0.32, ease=0.024)
    baldric = crossed_sash(f'vth_{s}_azoth_baldric', p_dark_lth, width=0.052, ease=0.038)
    kaun_sash = sash_with_tail(f'vth_{s}_azoth_kaun', p_kaun, p_kaun, ease=0.038, tail=0.20)
    torso = _vth_assemble(
        f'vth_{s}_azoth_overseer_corselet', 'Azoth Bone-Splint Corselet & Kaunakes Sash', 'torso', 'chichani',
        [corselet, slv, paul_l, paul_r, baldric, kaun_sash],
    )

    # Gloves: Heavy oiled rawhide & brass-knuckle whip-hand gauntlets
    gloves = _vth_assemble(
        f'vth_{s}_azoth_whip_gauntlets', 'Azoth Rawhide Whip-Hand Gauntlets', 'gloves', 'chichani',
        full_gloves(f'vth_{s}_azoth_wg', p_dark_lth, p_dark_lth, knuckle_paint=p_brass),
    )

    # Legs: Marsh-estate olive & plum şalvar
    legs = _vth_assemble(
        f'vth_{s}_azoth_estate_salvar', 'Azoth Marsh-Estate Gathered Şalvar', 'legs', 'chichani',
        trousers(f'vth_{s}_azoth_slv', P('vth_reedolive', 0.05, [B('bottom', 0.0, 0.05, 'solid', 'vth_oldplum')], fabric=COTTON),
                 ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Thick-soled plantation stalker boots
    feet = _vth_assemble(
        f'vth_{s}_azoth_stalker_boots', 'Oiled Leather Plantation Stalker Boots', 'feet', 'chichani',
        boots(f'vth_{s}_azoth_bt', P('soot', 0.08), p_dark_lth, top=0.50, wraps=3, wrap_paint=P('leather', 0.05)),
    )

    # Back: Iron slave-collar manacle ring & plantation tally-rod rack on Spine2 pad
    bp, dpad = _dorsal_pad(f'vth_{s}_azoth_mk', p_dark_lth)
    crossbar = tube(f'vth_{s}_azoth_yoke', [bp + np.array([-0.10, 0.036, 0.07]), bp + np.array([0.10, 0.036, 0.07])], 0.013, p_iron, n=8, rigid_joint='Spine2')
    manacles = []
    for k, xo in enumerate((-0.068, 0.0, 0.068)):
        ctr = bp + np.array([xo, 0.046, 0.015])
        ring_pts = [ctr + np.array([0.034 * math.cos(th), 0.005 * math.sin(th), 0.034 * math.sin(th)]) for th in np.linspace(0, 2 * math.pi, 13)]
        manacles.append(tube(f'vth_{s}_manacle_{k}', ring_pts, 0.0075, p_iron, n=6, rigid_joint='Spine2'))
        manacles.append(tube(f'vth_{s}_tally_{k}', [bp + np.array([xo * 0.8, 0.030, -0.11]), bp + np.array([xo * 0.8, 0.030, 0.07])], 0.008, _p_bonepaste(), n=6, rigid_joint='Spine2'))
    back = _vth_assemble(
        f'vth_{s}_azoth_manacle_rack', 'Iron Slave-Collar Manacles & Plantation Tally Rack', 'back', 'chichani',
        [dpad, crossbar, manacles],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_azoth_march_warden(s):
    """4. Azoth Shumar/Dalab Borderland Marcher-Warrior."""
    p_bone = _p_bonepaste('vth_bonepaste', 'iron')
    p_ichca = _p_ichca('vth_ichca', 'vth_oldplum')
    p_brass = _p_metal('vth_oldbrass', 'soot', 'metal.bronze')
    p_iron = _p_metal('iron', 'soot', 'metal.iron')
    p_jade = P('vth_dalabjade', 0.03, [B('top', 0.0, 0.02, 'solid', 'vth_oldbrass')], fabric='stone.ammolite.opalshell')

    # Head: Hooded House-Dres calcined bone-paste & iron nasal war-casque (zero bug-chitin!)
    bowl = _vth_cranial_shell(f'vth_{s}_warden_bowl', p_bone, f_top=1.04, f_bot=-0.06, ease=0.015)
    brow_b = crown_band(f'vth_{s}_warden_brow', p_iron, f0=0.58, f1=0.68, ease=0.018, flare=0.004, rows=4, n=36)
    a, b, up, bk, left, f_nose, f_eyes, *_ = head_landmarks_exact()
    p_nb_top, _ = _snap_on_part(brow_b, a + (b - a) * 0.62 - bk * 0.12, out_push=0.003)
    p_nb_bot = a + (b - a) * max(f_nose, 0.28) - bk * 0.118
    nasal = tube(f'vth_{s}_warden_nasal', [p_nb_top, p_nb_bot], 0.0065, p_iron, n=6, rigid_joint='Head')
    comb = crest(f'vth_{s}_warden_comb', 0.048, p_brass, rows=5, cols=15, base_ease=0.015, thick=0.010, host_part=bowl)
    head = _vth_assemble(
        f'vth_{s}_azoth_warden_casque', 'Azoth Bone-Paste & Iron Nasal War-Casque', 'head', 'chichani',
        [bowl, brow_b, nasal, comb], covers_hair=True,
    )

    # Torso: Sculpted lamellar brass & iron borderland cuirass + gorget + articulated pauldrons + Ottoman krug mirror-plate
    p_warden_plate = P('vth_oldbrass', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'iron'),
        B('bottom', 0.0, 0.024, 'solid', 'iron'),
    ], [
        PN(0.0, 1.0, 'vth_ash_resin_inlay', 'iron', 'vth_oldbrass', 0.16),
    ], fabric='metal.bronze')
    cuir_parts = cuirass_plate(f'vth_{s}_warden_ichca_body', p_warden_plate, trim_paint=p_iron,
                               style='lamellar', faulds=3, ease=0.024)
    gorg = gorget_guard(f'vth_{s}_warden_gorg', p_iron, trim_paint=p_brass, ease=0.024)
    pauls = articulated_pauldrons(f'vth_{s}_warden_pld', p_warden_plate, trim_paint=p_iron,
                                  lames=3, haute_piece=True, ease=0.023)
    slv = sleeves(f'vth_{s}_warden', 'wrist', 0.018, P('vth_oldplum', 0.05, fabric=WOOL), rows=10)
    krug = _krug_mirror_disc(f'vth_{s}_warden', cuir_parts[0], core.CHEST + 0.02, 0.068, p_brass, p_jade)
    belt = belt_sash(f'vth_{s}_warden_belt', core.WAIST - 0.016, core.WAIST + 0.030, P('leather', 0.05), ease=0.034)
    trophies = pendants(f'vth_{s}_dalab_trophy_', core.WAIST + 0.005, [-2.4, -1.8, 1.8, 2.4], (0.028, 0.018, 0.036), p_jade, ease=0.024)
    torso = _vth_assemble(
        f'vth_{s}_azoth_warden_ichca', 'Azoth Lamellar Cuirass, Krug Mirror-Plate & Frontier Trophies', 'torso', 'chichani',
        [cuir_parts, gorg, pauls, slv, krug, belt, trophies],
    )

    # Gloves: Sculpted fluted brass & iron marcher vambraces + gauntlets
    gloves = _vth_assemble(
        f'vth_{s}_azoth_warden_vambraces', 'Sculpted Brass & Iron Marcher Vambraces', 'gloves', 'chichani',
        [sculpted_vambraces(f'vth_{s}_warden_vmb', p_warden_plate, trim_paint=p_iron, couter=True, ease=0.020),
         full_gloves(f'vth_{s}_warden_gv', p_iron, P('leather', 0.05), f0=0.86, knuckle_paint=p_brass)],
    )

    # Legs: Tailored oiled-leather border-cavalry şalvar + hinged lamellar thigh tassets
    legs = _vth_assemble(
        f'vth_{s}_azoth_warden_breeches', 'Azoth Border-Lancer Breeches & Hinged Tassets', 'legs', 'chichani',
        [trousers(f'vth_{s}_warden_tr', P('vth_reedolive', 0.05, fabric='leather.buckskin'), ease=0.014, bag=0.008),
         hinged_tassets(f'vth_{s}_warden_tas', p_warden_plate, trim_paint=p_iron, lames=3, ease=0.025)],
        legged=True,
    )

    # Feet: Sculpted shin greaves & knee poleyns over border-cavalry boots
    feet = _vth_assemble(
        f'vth_{s}_azoth_warden_boots', 'Sculpted-Greave Border-Cavalry Boots', 'feet', 'chichani',
        [boots(f'vth_{s}_warden_bt', P('soot', 0.08), P('leather', 0.05), top=0.26, ease_top=0.022),
         sculpted_greaves(f'vth_{s}_warden_grv', p_warden_plate, trim_paint=p_iron, poleyn=True, ease=0.025)],
    )

    # Back: Round chimalli target + twin feathered border-javelins on Spine2 mount
    bp, dpad = _dorsal_pad(f'vth_{s}_warden_bk', P('leather', 0.05))
    sh_ctr = bp + np.array([0.0, 0.036, 0.02])
    chim = rosette(f'vth_{s}_warden_chimalli', sh_ctr, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                   0.195, P('vth_oldplum', 0.04, [B('bottom', 0.0, 0.05, 'vth_xicalcoliuhqui_fret', 'vth_oldbrass', 'crimson')]),
                   n=16, thick=0.016, rigid_joint='Spine2')
    boss = rosette(f'vth_{s}_warden_cboss', sh_ctr + np.array([0.0, 0.014, 0.0]), np.array([0.0, 1.0, 0.0]),
                   np.array([1.0, 0.0, 0.0]), 0.062, p_brass, n=12, thick=0.014, rigid_joint='Spine2')
    javs = [
        tube(f'vth_{s}_warden_jav_{k}', [
            sh_ctr + np.array([-0.12 * sgn, -0.008, -0.22]),
            sh_ctr + np.array([0.14 * sgn, -0.008, 0.30]),
        ], 0.009, P('bark', 0.05), n=6, rigid_joint='Spine2')
        for k, sgn in enumerate((-1.0, 1.0))
    ]
    back = _vth_assemble(
        f'vth_{s}_azoth_javelin_chimalli', 'Border-Javelin Quiver & Feathered Chimalli Target', 'back', 'chichani',
        [dpad, chim, boss, javs],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_heartland_fire_cantor(s):
    """5. Old Heartland Archaic Solstice Cantor & Sacrificer."""
    p_crim = P('vth_porphyry', 0.05, [
        B('bottom', 0.0, 0.075, 'vth_xicalcoliuhqui_fret', 'vth_ashwhite', 'soot'),
        B('top', 0.0, 0.025, 'solid', 'vth_oldbrass'),
    ], [
        PN(0.0, 1.0, 'vth_blitrit_diamond', 'vth_oldbrass', 'vth_porphyry', 0.22),
    ], fabric=WOOL)
    p_bone = _p_bonepaste('vth_ashwhite', 'soot')
    p_obs = P('soot', 0.02, [B('top', 0.0, 0.02, 'solid', 'vth_porphyry')], fabric='stone.obsidian.pancake_flaked')

    # Head: Soot-ash Velothi mitre + inscribed calcined ancestor-skull visage mask
    mitre = tower_hat(f'vth_{s}_cantor_mitre', 0.22, lambda u: (1.0 - 0.35 * (u ** 1.4)), p_crim, f=0.62, ease=0.014, rows=12, n=36)
    skull_m = _sculpted_visage_mask(f'vth_{s}_cantor_skull', p_bone, p_obs, eye_paint=P('amber', 0.02), ease=0.013)
    head = _vth_assemble(
        f'vth_{s}_cantor_skull_mitre', 'Inscribed Ancestor-Visage & Soot-Ash Velothi Mitre', 'head', 'chichani',
        [mitre, skull_m], covers_hair=True, covers_face=True,
    )

    # Torso: Soot-streaked crimson & faded-purple sacrificial xicolli-dalmatic + obsidian tecpatl sash
    dalm = torso_tube(f'vth_{s}_cantor_body', core.TOP - 0.010, core.CROTCH - 0.08, 0.032, p_crim,
                      hang_from=core.WAIST, flare=0.090, rows=20, n=40)
    yoke = collar_disc(f'vth_{s}_cantor_yoke', 0.10, p_bone, drop=0.088, rows=8, scallop=0.08, ease=0.021)
    sash = sash_with_tail(f'vth_{s}_cantor_sash', p_obs, p_crim, ease=0.034, tail=0.28)
    torso = _vth_assemble(
        f'vth_{s}_cantor_dalmatic', 'Sacrificial Crimson Xicolli-Dalmatic & Tecpatl Sash', 'torso', 'chichani',
        [dalm, yoke, sash], open_torso=True,
    )

    # Gloves: Ash-grey Dhelv scripture-wrapped forearms
    p_scr = P('vth_ashwhite', 0.06, [B('top', 0.0, 0.025, 'solid', 'vth_porphyry'), B('bottom', 0.0, 0.025, 'solid', 'soot')], fabric=COTTON)
    gloves = _vth_assemble(
        f'vth_{s}_cantor_scripture_wraps', 'Ash-Grey Scripture-Wrapped Forearms', 'gloves', 'chichani',
        [sleeve(f'vth_{s}_cantor_wr_L', L, p_scr, f0=0.52, f1=0.96, ease=0.012, flare=0.004),
         sleeve(f'vth_{s}_cantor_wr_R', R, p_scr, f0=0.52, f1=0.96, ease=0.012, flare=0.004)],
    )

    # Legs: Layered ash-and-crimson ceremonial temple skirt
    legs = _vth_assemble(
        f'vth_{s}_cantor_skirt', 'Layered Ash-and-Crimson Solstice Temple Skirt', 'legs', 'chichani',
        [skirt(f'vth_{s}_cantor_sk', core.ANKLE + 0.08, core.WAIST - 0.018,
               P('soot', 0.05, [B('bottom', 0.0, 0.09, 'vth_xicalcoliuhqui_fret', 'vth_porphyry', 'vth_ashwhite')], fabric=WOOL),
               ease=0.019, flare=0.095)],
        legged=False,
    )

    # Feet: Brass-anklet ritual sandals
    feet = _vth_assemble(
        f'vth_{s}_cantor_sandals', 'Brass-Anklet Solstice Ritual Sandals', 'feet', 'chichani',
        sandal(f'vth_{s}_cantor_snd', P('soot', 0.08), _p_metal('vth_oldbrass', 'soot', 'metal.bronze'), laces=3),
    )

    # Back: Portable solstice fire-brazier / bone-censer dorsal rack
    bp, dpad = _dorsal_pad(f'vth_{s}_cantor_brz', p_obs)
    b_parts = [dpad]
    for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
        p0 = bp + np.array([sgn * 0.058, 0.024, 0.02])
        p1 = bp + np.array([sgn * 0.092, 0.042, 0.22])
        b_parts.append(tube(f'vth_{s}_cantor_arm_{tag}', [p0, p1], 0.011, p_bone, n=8, rigid_joint='Spine2'))
        b_parts.append(blob(f'vth_{s}_cantor_bowl_{tag}', p1, (0.068, 0.068, 0.044), _p_metal('vth_oldbrass', 'soot', 'metal.bronze'), n=10, rows=5, rigid_joint='Spine2'))
        b_parts.append(blob(f'vth_{s}_cantor_ember_{tag}', p1 + np.array([0.0, 0.0, 0.020]), (0.046, 0.046, 0.024), P('amber', 0.02), n=8, rows=4, rigid_joint='Spine2'))
    back = _vth_assemble(
        f'vth_{s}_cantor_brazier_rack', 'Portable Solstice Fire-Brazier & Bone-Censer Rack', 'back', 'chichani',
        b_parts,
    )
    return [head, torso, gloves, legs, feet, back]


def _build_heartland_sipahi(s):
    """6. Shim / Driyan Old-Style Ichcahuipilli Retainer."""
    p_bone = _p_bonepaste('vth_bonepaste', 'vth_oldbrass')
    p_ichca = _p_ichca('vth_ichca', 'vth_oldplum')
    p_brass = _p_metal('vth_oldbrass', 'umber', 'metal.bronze')
    p_quetz = P('quetzal', 0.04, [B('top', 0.0, 0.025, 'solid', 'vth_oldbrass')], fabric='cloth.silk')

    # Head: Molded ochre bone-paste kettle-casque + cliff-racer/quetzal plume crest
    bowl = _vth_cranial_shell(f'vth_{s}_sipahi_bowl', p_bone, f_top=1.04, f_bot=0.10, ease=0.014)
    kettle_brim = brim(f'vth_{s}_sipahi_brim', 0.63, 0.052, p_bone, ease=0.015, droop=0.018)
    plume = crest(f'vth_{s}_sipahi_plume', 0.072, p_quetz, rows=6, cols=15, sweep=0.06, base_ease=0.014, thick=0.012, host_part=bowl)
    head = _vth_assemble(
        f'vth_{s}_sipahi_kettle_helm', 'Ochre Bone-Paste Kettle-Casque & Plume', 'head', 'chichani',
        [bowl, kettle_brim, plume], covers_hair=True,
    )

    # Torso: Sculpted laminar brass & iron sipahi cuirass + gorget + articulated pauldrons + Ottoman krug mirror-plate
    p_sip_plate = P('vth_oldbrass', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'vth_oldplum'),
        B('bottom', 0.0, 0.022, 'solid', 'vth_oldplum'),
    ], [
        PN(0.0, 1.0, 'vth_ash_resin_inlay', 'vth_bonepaste', 'vth_oldbrass', 0.16),
    ], fabric='metal.bronze')
    cuir_parts = cuirass_plate(f'vth_{s}_sipahi_ichca', p_sip_plate, trim_paint=p_brass,
                               style='laminar', faulds=3, ease=0.023)
    gorg = gorget_guard(f'vth_{s}_sipahi_gorg', p_brass, trim_paint=p_sip_plate, ease=0.023)
    pauls = articulated_pauldrons(f'vth_{s}_sipahi_pld', p_sip_plate, trim_paint=p_brass,
                                  lames=3, haute_piece=False, ease=0.023)
    slv = sleeves(f'vth_{s}_sipahi', 'elbow', 0.018, p_ichca, rows=7)
    krug = _krug_mirror_disc(f'vth_{s}_sipahi', cuir_parts[0], core.CHEST + 0.02, 0.072, p_brass, P('vth_blitrit', 0.03, fabric='metal.bronze'))
    belt = pouch_belt(f'vth_{s}_sipahi_pb', P('leather', 0.05), P('saddle', 0.05), ease=0.032)
    torso = _vth_assemble(
        f'vth_{s}_sipahi_ichcahuipilli', 'Heartland Laminar Sipahi Cuirass & Brass Krug Plate', 'torso', 'chichani',
        [cuir_parts, gorg, pauls, slv, krug, belt],
    )

    # Gloves: Sculpted fluted brass vambraces + elbow couters
    gloves = _vth_assemble(
        f'vth_{s}_sipahi_vambraces', 'Sculpted Brass & Bronze Sipahi Vambraces', 'gloves', 'chichani',
        sculpted_vambraces(f'vth_{s}_sipahi_vmb', p_sip_plate, trim_paint=p_brass, couter=True, ease=0.016),
    )

    # Legs: Quilted maxtlatl-breeches + hinged brass thigh-tassets
    legs = _vth_assemble(
        f'vth_{s}_sipahi_breeches', 'Heartland Maxtlatl-Breeches & Hinged Brass Tassets', 'legs', 'chichani',
        [trousers(f'vth_{s}_sipahi_tr', P('vth_oldplum', 0.05, [B('bottom', 0.0, 0.05, 'vth_xicalcoliuhqui_fret', 'vth_oldbrass', 'vth_ichca')], fabric=COTTON),
                  ease=0.014, bag=0.008),
         hinged_tassets(f'vth_{s}_sipahi_tas', p_sip_plate, trim_paint=p_brass, lames=3, ease=0.025)],
        legged=True,
    )

    # Feet: Sculpted brass shin-greaves & poleyns over laced sandals
    feet = _vth_assemble(
        f'vth_{s}_sipahi_greave_sandals', 'Laced Sandals & Sculpted Brass Shin-Greaves', 'feet', 'chichani',
        [sandal(f'vth_{s}_sipahi_snd', P('leather', 0.06), p_brass, guard=False, laces=3),
         sculpted_greaves(f'vth_{s}_sipahi_grv', p_sip_plate, trim_paint=p_brass, poleyn=True, ease=0.025)],
    )

    # Back: Round feathered chimalli target-shield on Spine2 sling
    bp, dpad = _dorsal_pad(f'vth_{s}_sipahi_bk', P('leather', 0.05))
    sh_c = bp + np.array([0.0, 0.034, 0.02])
    chim = rosette(f'vth_{s}_sipahi_chim', sh_c, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                   0.205, P('quetzal', 0.04, [B('bottom', 0.0, 0.06, 'vth_xicalcoliuhqui_fret', 'vth_oldbrass', 'vth_oldplum')]),
                   n=16, thick=0.016, rigid_joint='Spine2')
    boss = rosette(f'vth_{s}_sipahi_cboss', sh_c + np.array([0.0, 0.014, 0.0]), np.array([0.0, 1.0, 0.0]),
                   np.array([1.0, 0.0, 0.0]), 0.068, p_brass, n=12, thick=0.014, rigid_joint='Spine2')
    back = _vth_assemble(
        f'vth_{s}_sipahi_chimalli', 'Feathered Heartland Chimalli Target-Shield', 'back', 'chichani',
        [dpad, chim, boss],
    )
    return [head, torso, gloves, legs, feet, back]


# ===========================================================================================================
# PART A: `chichani` — PILLAR II: INNER CRATER & IMPERIAL CAPITAL (`Voth / Almua / Zey'danin / Temple`)
# ===========================================================================================================
def _build_voth_canton_citizen(s):
    """7. Voth Causeway Artisan & Canal Guildsman."""
    p_purp = _p_blitrit('vth_blitrit', 'vth_ashwhite', 'cloth.wool.fulled')
    p_wrap = P('vth_ashwhite', 0.04, [B('bottom', 0.0, 0.03, 'vth_blitrit_diamond', 'vth_blitrit', 'vth_ashwhite')], fabric=COTTON)
    p_gold = _p_metal('vth_tzungold', 'soot', 'metal.gold')

    # Head: Crisp purple-and-white diamond fez-kavuk wrap
    head = _vth_assemble(
        f'vth_{s}_citizen_fez_kavuk', 'Crisp Blïtrit-and-White Diamond Fez-Kavuk', 'head', 'chichani',
        turban(f'vth_{s}_citizen_kvk', p_purp, wrap_paint=p_wrap, size=0.52, ribbons=3),
        covers_hair=True,
    )

    # Torso: Tailored short dolama coat w/ Blïtrit brocade lapels & sash
    coat = torso_tube(f'vth_{s}_citizen_coat', core.TOP - 0.008, core.WAIST - 0.055, 0.022, p_purp, rows=15, n=40)
    slv = sleeves(f'vth_{s}_citizen', 'wrist', 0.017, p_purp, rows=10)
    col = stand_collar(f'vth_{s}_citizen', p_wrap, high=0.035)
    btns = button_row(f'vth_{s}_citizen', core.CHEST + 0.08, core.WAIST + 0.04, n_buttons=5, paint=p_gold, ease=0.024)
    sash = belt_sash(f'vth_{s}_citizen_sash', core.WAIST - 0.038, core.WAIST + 0.028,
                     P('vth_porphyry', 0.04, [B('bottom', 0.0, 0.03, 'vth_xicalcoliuhqui_fret', 'vth_tzungold', 'vth_blitrit')]), ease=0.025)
    torso = _vth_assemble(
        f'vth_{s}_citizen_dolama', 'Tailored Voth Canton Dolama Coat & Sash', 'torso', 'chichani',
        [coat, slv, col, btns, sash],
    )

    # Gloves: Dyed leather wrist cuffs
    gloves = _vth_assemble(
        f'vth_{s}_citizen_cuffs', 'Tooled Leather Guild Wrist Cuffs', 'gloves', 'chichani',
        [sleeve(f'vth_{s}_cit_cL', L, P('leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'vth_tzungold')]), f0=0.66, f1=0.95, ease=0.013),
         sleeve(f'vth_{s}_cit_cR', R, P('leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'vth_tzungold')]), f0=0.66, f1=0.95, ease=0.013)],
    )

    # Legs: Full gathered şalvar trousers
    legs = _vth_assemble(
        f'vth_{s}_citizen_salvar', 'Gathered Voth Causeway Şalvar Trousers', 'legs', 'chichani',
        trousers(f'vth_{s}_cit_slv', P('slate', 0.05, [B('bottom', 0.0, 0.04, 'vth_blitrit_diamond', 'vth_ashwhite', 'vth_blitrit')], fabric=COTTON),
                 ease=0.019, bag=0.026),
        legged=True,
    )

    # Feet: Upturned purple/tan yemeni shoes
    feet = _vth_assemble(
        f'vth_{s}_citizen_yemeni', 'Upturned Purple-and-Tan Yemeni Shoes', 'feet', 'chichani',
        boots(f'vth_{s}_cit_yem', P('leather', 0.06), P('vth_blitrit', 0.05, [B('top', 0.0, 0.02, 'solid', 'vth_tzungold')], fabric='leather.polished'), top=0.28, ease_top=0.020),
    )

    # Back: Tooled leather canton-guild ledger satchel
    bp, dpad = _dorsal_pad(f'vth_{s}_cit_sat', P('saddle', 0.05))
    bag = blob(f'vth_{s}_cit_bag', bp + np.array([0.0, 0.042, -0.02]), (0.165, 0.068, 0.175),
               P('saddle', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'vth_tzungold')]), n=10, rows=5, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2')
    rule = tube(f'vth_{s}_cit_tube', [bp + np.array([-0.08, 0.052, 0.08]), bp + np.array([0.08, 0.052, 0.08])], 0.018, p_gold, n=8, rigid_joint='Spine2')
    back = _vth_assemble(
        f'vth_{s}_citizen_satchel', 'Tooled Leather Canton-Guild Ledger Satchel', 'back', 'chichani',
        [dpad, bag, rule],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_almua_port_factor(s):
    """8. Almua & Temora Arsenal & Spice-Port Purser."""
    p_ind = P('vth_almuaindigo', 0.04, [
        B('bottom', 0.0, 0.070, 'vth_blitrit_diamond', 'vth_tzungold', 'vth_blitrit'),
        B('top', 0.0, 0.025, 'solid', 'vth_tzungold'),
    ], [
        PN(0.0, 1.0, 'vth_ott_kemha', 'vth_tzungold', 'vth_almuaindigo', 0.24),
    ], fabric='cloth.canvas.oiled')
    p_brass = _p_metal('brass', 'soot', 'metal.bronze')

    # Head: Sea-waxed indigo börk mariner cap w/ brass compass-diamond pin
    bork = tower_hat(f'vth_{s}_almua_bork_h', 0.16, lambda u: 1.0 - 0.12 * u, p_ind, f=0.63, ease=0.014, rows=10, n=36)
    a, b, up, bk, left = head_frame()
    p_cp, _ = _snap_on_part(bork, a + (b - a) * 0.74 - bk * 0.12, out_push=0.004)
    head = _vth_assemble(
        f'vth_{s}_almua_mariner_bork', 'Sea-Waxed Indigo Mariner Börk & Compass-Pin', 'head', 'chichani',
        [bork, rosette(f'vth_{s}_almua_pin', p_cp, -bk, left, 0.022, p_brass, n=10, thick=0.010, rigid_joint='Head')],
        covers_hair=True,
    )

    # Torso: Salt-proofed indigo & purple Ottoman mariner kaftan w/ brass toggle-frogs
    kaftan = torso_tube(f'vth_{s}_almua_kaf', core.TOP + 0.018, core.KNEE + 0.06, 0.036, p_ind,
                        hang_from=core.WAIST, flare=0.105, rows=22, n=42)
    slv = sleeves(f'vth_{s}_almua', 'wrist', 0.018, p_ind, rows=10)
    incol = collar(f'vth_{s}_almua_incol', P('vth_blitrit', 0.04, fabric='cloth.silk'), height=0.052, flare=0.026, ease=0.012)
    col = stand_collar(f'vth_{s}_almua', P('vth_blitrit', 0.04, fabric='cloth.silk'), high=0.036)
    frogs = button_row(f'vth_{s}_almua_frg', core.CHEST + 0.09, core.WAIST + 0.02, n_buttons=5, paint=p_brass, ease=0.038, double=True)
    sash = belt_sash(f'vth_{s}_almua_sash', core.WAIST - 0.020, core.WAIST + 0.028, _p_blitrit(), ease=0.039)
    torso = _vth_assemble(
        f'vth_{s}_almua_kaftan', 'Salt-Proofed Indigo & Blïtrit Mariner Kaftan', 'torso', 'chichani',
        [kaftan, slv, incol, col, frogs, sash],
    )

    # Gloves: Tarred leather rigger cuffs
    p_tar = leathery(P('soot', 0.05, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='cloth.oilskin.tarred_seams'))
    gloves = _vth_assemble(
        f'vth_{s}_almua_rigger_cuffs', 'Tarred Sea-Leather Rigger Cuffs', 'gloves', 'chichani',
        [sleeve(f'vth_{s}_alm_cL', L, p_tar, f0=0.58, f1=0.96, ease=0.013),
         sleeve(f'vth_{s}_alm_cR', R, p_tar, f0=0.58, f1=0.96, ease=0.013)],
    )

    # Legs: Tailored striped maritime şalvar (`ease=0.014, bag=0.008` under kaftan)
    legs = _vth_assemble(
        f'vth_{s}_almua_salvar', 'Striped Almua Maritime Şalvar', 'legs', 'chichani',
        trousers(f'vth_{s}_alm_slv', P('sealinen', 0.05, [B('bottom', 0.0, 0.05, 'solid', 'vth_almuaindigo')], fabric='cloth.slops.abaca_stripe'),
                 ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Calf-high oiled harbour boots
    feet = _vth_assemble(
        f'vth_{s}_almua_harbour_boots', 'Calf-High Oiled Harbour Boots', 'feet', 'chichani',
        boots(f'vth_{s}_alm_bt', P('soot', 0.08), p_tar, top=0.52, cuff_paint=p_brass),
    )

    # Back: Waterproofed spice-sample canisters & brass chart tube-case
    bp, dpad = _dorsal_pad(f'vth_{s}_alm_bk', p_tar)
    chart = tube(f'vth_{s}_alm_chart', [bp + np.array([-0.11, 0.042, -0.09]), bp + np.array([0.11, 0.042, 0.13])], 0.030, p_brass, n=10, rigid_joint='Spine2')
    jars = [
        blob(f'vth_{s}_alm_jar_{k}', bp + np.array([xo, 0.046, -0.05]), (0.058, 0.048, 0.082),
             P('vth_porphyry', 0.04, [B('top', 0.0, 0.02, 'solid', 'brass')]), n=10, rows=5, rigid_joint='Spine2')
        for k, xo in enumerate((-0.05, 0.05))
    ]
    back = _vth_assemble(
        f'vth_{s}_almua_chart_case', 'Waterproofed Chart Cylinder & Temora Spice Case', 'back', 'chichani',
        [dpad, chart, jars],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_zeydanin_colonist(s):
    """9. Zey'danin Throne-Gate Settler & Ranj Planter."""
    p_ochre = P('vth_ashochre', 0.05, [
        B('bottom', 0.0, 0.055, 'vth_blitrit_diamond', 'vth_ashwhite', 'vth_blitrit'),
        B('top', 0.0, 0.022, 'solid', 'vth_blitrit'),
    ], fabric=WOOL)
    p_linen = P('linen', 0.05, [B('bottom', 0.0, 0.045, 'vth_xicalcoliuhqui_fret', 'vth_blitrit', 'vth_ashochre')], fabric='cloth.cotton.muslin')
    p_brass = _p_metal('brass', 'soot', 'metal.bronze')

    # Head: Smoked-obsidian Dunmer ash-goggles over sand-and-purple litham-kavuk
    cowl = hood(f'vth_{s}_zey_hood', p_ochre, ease=0.022, ease_low=0.032, open_front=0.88, low=-0.18)
    veil = sculpted_faceplate(f'vth_{s}_zey_veil', P('vth_blitrit', 0.05, fabric=COTTON), f_top=0.42, f_bot=-0.04,
                              ease=0.013, span=0.44, rows=9, cols=21, brow_relief=0.0, nose_relief=0.015)
    gogs = _ash_goggles(f'vth_{s}_zey_gog', cowl, p_brass, P('soot', 0.01, fabric='stone.obsidian.pancake_flaked'))
    head = _vth_assemble(
        f'vth_{s}_zeydanin_goggle_kavuk', "Zey'danin Smoked-Obsidian Ash-Goggles & Litham-Kavuk", 'head', 'chichani',
        [cowl, veil, gogs], covers_hair=True, covers_face=True,
    )

    # Torso: High-collared volcanic-ash Dunmer mantle over breathable colonial entari
    tunic = torso_tube(f'vth_{s}_zey_entari', core.TOP - 0.008, core.WAIST - 0.055, 0.022, p_linen, rows=15, n=40)
    slv = sleeves(f'vth_{s}_zey', 'wrist', 0.017, p_linen, rows=10)
    mantle = collar_disc(f'vth_{s}_zey_mantle', 0.12, p_ochre, drop=0.115, rows=9, scallop=0.05, ease=0.022)
    col = stand_collar(f'vth_{s}_zey', p_ochre, high=0.038)
    belt = pouch_belt(f'vth_{s}_zey_pb', P('leather', 0.05), P('vth_blitrit', 0.05), ease=0.025)
    torso = _vth_assemble(
        f'vth_{s}_zeydanin_mantle_entari', "Zey'danin High-Collared Volcanic-Ash Mantle & Entari", 'torso', 'chichani',
        [tunic, slv, mantle, col, belt],
    )

    # Gloves: Dust-sealed leather gauntlets
    gloves = _vth_assemble(
        f'vth_{s}_zeydanin_gauntlets', 'Dust-Sealed Colonial Leather Gauntlets', 'gloves', 'chichani',
        full_gloves(f'vth_{s}_zey_gv', P('saddle', 0.05), P('leather', 0.05)),
    )

    # Legs: Tailored frontier riding şalvar
    legs = _vth_assemble(
        f'vth_{s}_zeydanin_salvar', 'Frontier Volcanic-Ash Riding Şalvar', 'legs', 'chichani',
        trousers(f'vth_{s}_zey_slv', p_ochre, ease=0.018, bag=0.020),
        legged=True,
    )

    # Feet: Ash-sealed buckled colonial boots
    feet = _vth_assemble(
        f'vth_{s}_zeydanin_boots', 'Ash-Sealed Buckled Colonial Boots', 'feet', 'chichani',
        boots(f'vth_{s}_zey_bt', P('soot', 0.08), P('saddle', 0.05), top=0.50, wraps=2, wrap_paint=p_brass),
    )

    # Back: Terracotta ranj-seedling pot & sealed caldera water-flask pack
    bp, dpad = _dorsal_pad(f'vth_{s}_zey_bk', P('leather', 0.05))
    pot = blob(f'vth_{s}_zey_pot', bp + np.array([-0.042, 0.052, -0.01]), (0.095, 0.082, 0.135),
               P('terracotta', 0.06, [B('top', 0.0, 0.025, 'solid', 'vth_blitrit')]), n=12, rows=6, rigid_joint='Spine2')
    sprout = blob(f'vth_{s}_zey_leaf', bp + np.array([-0.042, 0.055, 0.085]), (0.065, 0.055, 0.065), P('jade', 0.05), n=8, rows=4, rigid_joint='Spine2')
    flask = tube(f'vth_{s}_zey_flask', [bp + np.array([0.055, 0.048, -0.09]), bp + np.array([0.055, 0.048, 0.09])], 0.032, p_brass, n=10, rigid_joint='Spine2')
    back = _vth_assemble(
        f'vth_{s}_zeydanin_ranj_pack', 'Terracotta Ranj-Seedling & Sealed Caldera Water Pack', 'back', 'chichani',
        [dpad, pot, sprout, flask],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_voth_palace_pasha(s):
    """10. Voth Palace-Canton Patrician / Pasha."""
    p_kemha = P('vth_blitrit', 0.03, [
        B('bottom', 0.0, 0.095, 'vth_ott_kemha', 'vth_tzungold', 'vth_porphyry'),
        B('top', 0.0, 0.030, 'solid', 'vth_tzungold'),
    ], [
        PN(0.0, 1.0, 'vth_ott_kemha', 'vth_tzungold', 'vth_blitrit', 0.22),
    ], fabric='cloth.silk')
    p_crim_gold = P('vth_porphyry', 0.03, [
        B('bottom', 0.0, 0.075, 'vth_blitrit_diamond', 'vth_tzungold', 'vth_blitrit'),
    ], [
        PN(0.0, 1.0, 'tzintzun_tapestry', 'vth_tzungold', 'vth_porphyry', 0.24),
    ], fabric='cloth.velvet.cut')
    p_gold = _p_metal('vth_tzungold', 'vth_indoverd', 'metal.gold')

    # Head: Towering bulbous gold-brocaded Ottoman kavuk w/ emerald & quetzal solar aigrette
    head = _vth_assemble(
        f'vth_{s}_pasha_kavuk', 'Towering Gold-Brocaded Kavuk & Solar Aigrette', 'head', 'chichani',
        turban(f'vth_{s}_pasha_kvk', P('vth_tzungold', 0.03, fabric='cloth.silk'), wrap_paint=p_kemha, jewel_paint=P('vth_indoverd', 0.02, fabric='metal.gold'), size=0.95, ribbons=5),
        covers_hair=True,
    )

    # Torso: Floor-length crimson-and-purple kemha ceremonial kaftan + jade/gold Tzun collar
    kaftan = torso_tube(f'vth_{s}_pasha_kaftan', core.TOP - 0.008, core.ANKLE + 0.08, 0.036, p_kemha,
                        hang_from=core.WAIST, flare=0.115, rows=26, n=44)
    slv = sleeves(f'vth_{s}_pasha', 'wrist', 0.020, p_crim_gold, ease_end=0.040, rows=12, wide=True)
    yoke = collar_disc(f'vth_{s}_pasha_yoke', 0.11, p_gold, drop=0.092, rows=9, scallop=0.08, ease=0.022)
    sash = sash_with_tail(f'vth_{s}_pasha_sash', p_gold, p_crim_gold, ease=0.038, tail=0.30)
    torso = _vth_assemble(
        f'vth_{s}_pasha_kemha_kaftan', 'Floor-Length Crimson-and-Blïtrit Kemha Ceremonial Kaftan', 'torso', 'chichani',
        [kaftan, slv, yoke, sash],
    )

    # Gloves: Gold-and-jade signet ring court cuffs
    gloves = _vth_assemble(
        f'vth_{s}_pasha_ring_cuffs', 'Gold-Filigree & Jade Signet Court Gauntlets', 'gloves', 'chichani',
        full_gloves(f'vth_{s}_pasha_gv', p_gold, P('vth_blitrit', 0.03, fabric='cloth.silk'), ring_paint=P('jade', 0.02, fabric='metal.gold')),
    )

    # Legs: Silk brocade court şalvar (`ease=0.014, bag=0.008` under floor kaftan)
    legs = _vth_assemble(
        f'vth_{s}_pasha_salvar', 'Silk Brocade Palace Court Şalvar', 'legs', 'chichani',
        trousers(f'vth_{s}_pasha_slv', p_crim_gold, ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Gilt-embroidered crimson court boots
    feet = _vth_assemble(
        f'vth_{s}_pasha_court_boots', 'Gilt-Embroidered Porphyry Court Boots', 'feet', 'chichani',
        boots(f'vth_{s}_pasha_bt', p_gold, p_crim_gold, top=0.44, cuff_paint=p_gold),
    )

    # Back: Crisp upper-hip draped gold-filigree silk mantle (`z_bot=core.CROTCH + 0.08`, `stiff=0.36, back_push=0.055`)
    back = _vth_assemble(
        f'vth_{s}_pasha_silk_mantle', 'Draped Gold-Filigree & Kemha Silk Mantle', 'back', 'chichani',
        [cape(f'vth_{s}_pasha_cape', core.CROTCH + 0.08, p_crim_gold, ease=0.025, flare=0.09, stiff=0.36, back_push=0.055)],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_caldera_scout(s):
    """11. Inner Crater Ash-Waste Outrider & Secret-Police Hound."""
    p_ebon = _p_bonepaste('vth_ebonresin', 'brass')
    p_purp = _p_blitrit('vth_blitrit', 'vth_ashwhite', 'cloth.wool.fulled')
    p_ash = P('ashrobe', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'vth_blitrit')], fabric=WOOL)

    # Head: Wrapped ash-cowl + amber volcanic slit-goggles
    cowl = hood(f'vth_{s}_scout_hood', p_ash, ease=0.022, ease_low=0.032, open_front=0.86, low=-0.18)
    mask = sculpted_faceplate(f'vth_{s}_scout_fmask', p_ebon, f_top=0.42, f_bot=-0.04, ease=0.013, span=0.44, rows=9, cols=21)
    gogs = _ash_goggles(f'vth_{s}_scout_gog', cowl, _p_metal('brass', 'soot', 'metal.bronze'), P('amber', 0.01))
    head = _vth_assemble(
        f'vth_{s}_scout_ash_cowl', 'Wrapped Caldera Ash-Cowl & Amber Slit-Goggles', 'head', 'chichani',
        [cowl, mask, gogs], covers_hair=True, covers_face=True,
    )

    # Torso: Sculpted blackened-iron ash-resin cuirass + gorget + asymmetric articulated left pauldron
    p_ebon_metal = P('vth_ebonresin', 0.03, [
        B('top', 0.0, 0.020, 'solid', 'brass'),
        B('bottom', 0.0, 0.020, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'vth_ash_resin_inlay', 'brass', 'vth_ebonresin', 0.16),
    ], fabric='metal.iron')
    p_sc_brass = _p_metal('brass', 'soot', 'metal.bronze')
    cuir_parts = cuirass_plate(f'vth_{s}_scout_brig', p_ebon_metal, trim_paint=p_sc_brass,
                               style='cyber_plate', faulds=2, ease=0.023)
    gorg = gorget_guard(f'vth_{s}_scout_gorg', p_ebon_metal, trim_paint=p_sc_brass, ease=0.023)
    paul_l = articulated_pauldron(f'vth_{s}_scout_pL', L, p_ebon_metal, trim_paint=p_sc_brass,
                                  lames=3, haute_piece=True, ease=0.023)
    slv = sleeves(f'vth_{s}_scout', 'wrist', 0.017, p_purp, rows=10)
    sash = crossed_sash(f'vth_{s}_scout_band', p_purp, width=0.055, ease=0.032)
    belt = pouch_belt(f'vth_{s}_scout_pb', P('soot', 0.05), p_ebon_metal, ease=0.033)
    torso = _vth_assemble(
        f'vth_{s}_scout_brigandine', 'Sculpted Ebony Ash-Resin Plate & Dolama', 'torso', 'chichani',
        [cuir_parts, gorg, paul_l, slv, sash, belt],
    )

    # Gloves: Sculpted ebony-iron vambraces & scout gauntlets
    gloves = _vth_assemble(
        f'vth_{s}_scout_gloves', 'Articulated Ebony-Iron Scout Vambraces & Gloves', 'gloves', 'chichani',
        [sculpted_vambraces(f'vth_{s}_scout_vmb', p_ebon_metal, trim_paint=p_sc_brass, couter=False, ease=0.020),
         full_gloves(f'vth_{s}_scout_gv', p_ebon_metal, P('soot', 0.05), f0=0.86, knuckle_paint=p_sc_brass)],
    )

    # Legs: Tapered ash-cloth şalvar
    legs = _vth_assemble(
        f'vth_{s}_scout_salvar', 'Tapered Caldera Ash-Cloth Şalvar', 'legs', 'chichani',
        trousers(f'vth_{s}_scout_slv', p_ash, ease=0.017, bag=0.018),
        legged=True,
    )

    # Feet: Wrapped desert-ash stalker boots
    feet = _vth_assemble(
        f'vth_{s}_scout_boots', 'Wrapped Caldera-Ash Stalker Boots', 'feet', 'chichani',
        boots(f'vth_{s}_scout_bt', P('soot', 0.08), p_ebon, top=0.52, wraps=3, wrap_paint=p_ash),
    )

    # Back: Repeating dart-quiver & ash-filter canteen on Spine2 pad
    bp, dpad = _dorsal_pad(f'vth_{s}_scout_bk', p_ebon)
    quiv = tube(f'vth_{s}_scout_quiv', [bp + np.array([-0.04, 0.042, -0.13]), bp + np.array([0.05, 0.045, 0.19])], 0.034, p_ebon, n=10, rigid_joint='Spine2')
    darts = [
        tube(f'vth_{s}_scout_dart_{k}', [bp + np.array([0.04 + 0.014 * (k - 1), 0.046, 0.14]), bp + np.array([0.05 + 0.016 * (k - 1), 0.050, 0.25])],
             0.006, _p_metal('brass', 'soot', 'metal.bronze'), n=6, rigid_joint='Spine2')
        for k in range(3)
    ]
    cant = blob(f'vth_{s}_scout_cant', bp + np.array([-0.055, 0.048, -0.04]), (0.068, 0.046, 0.092), _p_metal('brass', 'soot', 'metal.bronze'), n=10, rows=5, rigid_joint='Spine2')
    back = _vth_assemble(
        f'vth_{s}_scout_quiver_pack', 'Repeating Dart-Quiver & Ash-Filter Canteen', 'back', 'chichani',
        [dpad, quiv, darts, cant],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_chosen_janissary(s):
    """12. Chosen of Tzintzun Solar Janissary Guard."""
    p_crim = P('vth_porphyry', 0.03, [
        B('bottom', 0.0, 0.075, 'vth_ott_kemha', 'vth_tzungold', 'vth_blitrit'),
        B('top', 0.0, 0.025, 'solid', 'vth_tzungold'),
    ], [
        PN(0.0, 1.0, 'chosen_tapestry', 'vth_tzungold', 'vth_porphyry', 0.22),
    ], fabric='cloth.wool.fulled')
    p_gold = _p_metal('vth_tzungold', 'vth_porphyry', 'metal.gold')
    p_ivory = _p_bonepaste('ivory', 'vth_tzungold')

    # Head: Tall folded crimson-and-gold Janissary börk sleeve-helm w/ golden sun-face crest & plume socket
    bork = tower_hat(f'vth_{s}_jan_bork_c', 0.21, lambda u: 1.0 + 0.06 * math.sin(u * math.pi), p_crim, f=0.63, ease=0.014, rows=12, n=36)
    brow_g = crown_band(f'vth_{s}_jan_brow', p_gold, f0=0.60, f1=0.70, ease=0.017, flare=0.004, rows=4, n=36)
    a, b, up, bk, left = head_frame()
    # Folded Ottoman yatırma sleeve-tail hanging cleanly down the back of the börk (welded to crown)
    p_bk_top, _ = _snap_on_part(bork, a + (b - a) * 1.15 + bk * 0.10, out_push=0.002)
    p_bk_bot = a + (b - a) * 0.18 + bk * 0.125
    yatirma = tube(f'vth_{s}_jan_yatirma', [p_bk_top, 0.5 * (p_bk_top + p_bk_bot) + bk * 0.015, p_bk_bot], 0.036, p_crim, n=10, rigid_joint='Head')
    # Front kaşıklık plume-holder & quetzal plume
    p_fr, _ = _snap_on_part(brow_g, a + (b - a) * 0.66 - bk * 0.12, out_push=0.004)
    kasik = rosette(f'vth_{s}_jan_sunface', p_fr, -bk, left, 0.028, p_gold, n=12, thick=0.012, rigid_joint='Head')
    plume = horn(f'vth_{s}_jan_plume', [p_fr + up * 0.01, p_fr + up * 0.16 - bk * 0.01, p_fr + up * 0.26 + bk * 0.04],
                 0.015, 0.004, P('quetzal', 0.03, fabric='cloth.silk'), n=8, rows=8, rigid_joint='Head')
    head = _vth_assemble(
        f'vth_{s}_janissary_bork', 'Tall Folded Solar Janissary Börk & Kaşıklık Plume', 'head', 'chichani',
        [bork, brow_g, yatirma, kasik, plume], covers_hair=True,
    )

    # Torso: Sculpted solar-gold musculata cuirass over crimson dolama skirt + gorget + articulated pauldrons + krug sun-plate
    p_jan_plate = P('vth_tzungold', 0.02, [
        B('top', 0.0, 0.022, 'solid', 'vth_porphyry'),
        B('bottom', 0.0, 0.022, 'solid', 'vth_porphyry'),
    ], [
        PN(0.0, 1.0, 'vth_ash_resin_inlay', 'vth_porphyry', 'vth_tzungold', 0.16),
    ], fabric='metal.gold')
    dolama = torso_tube(f'vth_{s}_jan_dolama', core.TOP - 0.008, core.KNEE + 0.06, 0.025, p_crim,
                        hang_from=core.WAIST, flare=0.108, rows=22, n=42)
    cuir_parts = cuirass_plate(f'vth_{s}_jan_cuir', p_jan_plate, trim_paint=p_gold,
                               style='musculata', faulds=3, ease=0.032)
    gorg = gorget_guard(f'vth_{s}_jan_gorg', p_gold, trim_paint=p_jan_plate, ease=0.026)
    pauls = articulated_pauldrons(f'vth_{s}_jan_pld', p_jan_plate, trim_paint=p_gold,
                                  lames=3, haute_piece=True, ease=0.025)
    slv = sleeves(f'vth_{s}_jan', 'wrist', 0.018, _p_blitrit(), rows=10)
    krug = _krug_mirror_disc(f'vth_{s}_jan', cuir_parts[0], core.CHEST + 0.02, 0.072, p_gold, P('vth_indoverd', 0.02, fabric='metal.gold'))
    sash = sash_with_tail(f'vth_{s}_jan_sash', _p_blitrit(), p_gold, ease=0.044, tail=0.28)
    torso = _vth_assemble(
        f'vth_{s}_janissary_dolama', 'Solar Janissary Musculata Cuirass, Dolama & Articulated Pauldrons', 'torso', 'chichani',
        [dolama, cuir_parts, gorg, pauls, slv, krug, sash],
    )

    # Gloves: Sculpted solar-gold vambraces & gauntlets
    gloves = _vth_assemble(
        f'vth_{s}_janissary_vambraces', 'Sculpted Solar-Gold Janissary Vambraces & Gauntlets', 'gloves', 'chichani',
        [sculpted_vambraces(f'vth_{s}_jan_vmb', p_jan_plate, trim_paint=p_gold, couter=True, ease=0.021),
         full_gloves(f'vth_{s}_jan_gv', p_gold, P('vth_porphyry', 0.04), f0=0.86, knuckle_paint=p_gold)],
    )

    # Legs: Tailored armored şalvar (`ease=0.014, bag=0.008` under dolama)
    legs = _vth_assemble(
        f'vth_{s}_janissary_salvar', 'Armored Solar Janissary Şalvar', 'legs', 'chichani',
        trousers(f'vth_{s}_jan_slv', _p_blitrit(), ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Sculpted solar-gold greaves & knee poleyns over Janissary boots
    feet = _vth_assemble(
        f'vth_{s}_janissary_boots', 'Sculpted Gilt-Greave Solar Janissary Boots', 'feet', 'chichani',
        [boots(f'vth_{s}_jan_bt', p_gold, P('vth_porphyry', 0.04), top=0.26, ease_top=0.022),
         sculpted_greaves(f'vth_{s}_jan_grv', p_jan_plate, trim_paint=p_gold, poleyn=True, ease=0.025)],
    )

    # Back: Ottoman-Aztec feathered solar tuğ back-pennon
    bp, dpad = _dorsal_pad(f'vth_{s}_jan_bk', p_gold)
    mast_b = bp + np.array([0.0, 0.030, -0.06])
    mast_t = bp + np.array([0.0, 0.042, 0.34])
    mast = tube(f'vth_{s}_jan_mast', [mast_b, mast_t], 0.011, p_gold, n=8, rigid_joint='Spine2')
    finial = rosette(f'vth_{s}_jan_finial', mast_t, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                     0.052, p_gold, n=12, thick=0.014, rigid_joint='Spine2')
    tug_l = tassel(f'vth_{s}_jan_tugL', mast_t + np.array([-0.040, 0.0, -0.02]), 0.14, 0.018, p_crim, rigid_joint='Spine2')
    tug_r = tassel(f'vth_{s}_jan_tugR', mast_t + np.array([0.040, 0.0, -0.02]), 0.14, 0.018, p_crim, rigid_joint='Spine2')
    back = _vth_assemble(
        f'vth_{s}_janissary_tug_pennon', 'Solar Tuğ Horsetail & Sun-Disc Back-Standard', 'back', 'chichani',
        [dpad, mast, finial, tug_l, tug_r],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_temple_ordinator(s):
    """13. HERO / ICONIC: Temple Ordinator & Secret Police (Green-and-Gold + Golden Ancestor War-Mask)."""
    p_gold = _p_metal('vth_tzungold', 'vth_indoverd', 'metal.gold')
    p_frieze = P('vth_indoverd', 0.03, [
        B('bottom', 0.0, 0.070, 'vth_ordinator_emerald', 'vth_tzungold', 'vth_indoverd'),
        B('top', 0.0, 0.026, 'solid', 'vth_tzungold'),
    ], [
        PN(0.0, 1.0, 'ordinator_cuirass', 'vth_tzungold', 'vth_indoverd', 0.18),
    ], fabric='cloth.silk')
    p_bone = _p_bonepaste('vth_bonepaste', 'vth_tzungold')
    p_purp = _p_blitrit('vth_blitrit', 'vth_tzungold', 'cloth.silk')

    # Head: HERO Indoril-Aztec sculpted golden ancestor war-mask w/ dark eye-slits & sweeping stiff crest (zero bug-chitin!)
    bowl = _vth_cranial_shell(f'vth_{s}_ord_bowl', p_bone, f_top=1.08, f_bot=-0.06, ease=0.015)
    mask_pts = _sculpted_visage_mask(f'vth_{s}_ord_mask', p_gold, P('vth_indoverd', 0.02, fabric='metal.gold'),
                                     eye_paint=P('soot', 0.01), ease=0.014, f_top=0.70, f_bot=-0.02)
    comb = crest(f'vth_{s}_ord_crest', 0.092, p_gold, rows=7, cols=17, sweep=0.045, a0=-0.92, a1=1.42,
                 base_ease=0.015, thick=0.012, host_part=bowl)
    head = _vth_assemble(
        f'vth_{s}_ordinator_war_mask', 'Ordinator Golden Ancestor War-Mask & Solar Crest', 'head', 'chichani',
        [bowl, mask_pts, comb], covers_hair=True, covers_face=True,
    )

    # Torso: HERO Sculpted Gothic Indoril Gold & Emerald-Frieze Plate Cuirass + Gorget + Articulated Pauldrons (zero cloth chains!)
    p_ord_plate = P('vth_tzungold', 0.02, [
        B('bottom', 0.0, 0.032, 'vth_ordinator_emerald', 'vth_tzungold', 'vth_indoverd'),
        B('top', 0.0, 0.024, 'solid', 'vth_indoverd'),
    ], [
        PN(0.0, 1.0, 'ordinator_cuirass', 'vth_tzungold', 'vth_indoverd', 0.18),
    ], fabric='metal.gold')
    p_ord_emerald_metal = P('vth_indoverd', 0.03, [
        B('top', 0.0, 0.020, 'solid', 'vth_tzungold'),
        B('bottom', 0.0, 0.020, 'solid', 'vth_tzungold'),
    ], fabric='metal.bronze')
    cuir_parts = cuirass_plate(f'vth_{s}_ord_cuir', p_ord_plate, trim_paint=p_ord_emerald_metal,
                               style='gothic', keel=0.020, faulds=3, ease=0.024)
    gorg = gorget_guard(f'vth_{s}_ord_gorg', p_gold, trim_paint=p_ord_emerald_metal, ease=0.024)
    pauls = articulated_pauldrons(f'vth_{s}_ord_pld', p_ord_plate, trim_paint=p_ord_emerald_metal,
                                  lames=3, haute_piece=True, ease=0.024)
    slv = sleeves(f'vth_{s}_ord', 'wrist', 0.018, p_purp, rows=10)
    krug = _krug_mirror_disc(f'vth_{s}_ord', cuir_parts[0], core.CHEST + 0.02, 0.072, p_gold, P('vth_indoverd', 0.02, fabric='metal.gold'))
    belt = belt_sash(f'vth_{s}_ord_belt', core.WAIST - 0.018, core.WAIST + 0.030, p_ord_emerald_metal, ease=0.035)
    torso = _vth_assemble(
        f'vth_{s}_ordinator_cuirass', 'Ordinator Sculpted Emerald-and-Gold Gothic Cuirass & Pauldrons', 'torso', 'chichani',
        [cuir_parts, gorg, pauls, slv, krug, belt],
    )

    # Gloves: Sculpted fluted gilt vambraces + winged couters + gauntlets
    gloves = _vth_assemble(
        f'vth_{s}_ordinator_gauntlets', 'Articulated Gilt-and-Emerald Ordinator Vambraces & Gauntlets', 'gloves', 'chichani',
        [sculpted_vambraces(f'vth_{s}_ord_vmb', p_ord_plate, trim_paint=p_ord_emerald_metal, couter=True, ease=0.021),
         full_gloves(f'vth_{s}_ord_gv', p_gold, p_frieze, f0=0.86, knuckle_paint=p_gold)],
    )

    # Legs: Plated Ordinator şalvar + 4-lame hinged golden thigh tassets
    legs = _vth_assemble(
        f'vth_{s}_ordinator_tassets', 'Ordinator Blïtrit Şalvar & Hinged Golden Plate Tassets', 'legs', 'chichani',
        [trousers(f'vth_{s}_ord_slv', p_purp, ease=0.014, bag=0.008),
         hinged_tassets(f'vth_{s}_ord_tas', p_ord_plate, trim_paint=p_ord_emerald_metal, lames=4, ease=0.026)],
        legged=True,
    )

    # Feet: Sculpted emerald-and-gold shin greaves & winged knee poleyns
    feet = _vth_assemble(
        f'vth_{s}_ordinator_greaves', 'Emerald-and-Gold Sculpted Ordinator Greaves & Poleyns', 'feet', 'chichani',
        [boots(f'vth_{s}_ord_bt', p_gold, p_ord_emerald_metal, top=0.26, ease_top=0.022),
         sculpted_greaves(f'vth_{s}_ord_grv', p_ord_plate, trim_paint=p_ord_emerald_metal, poleyn=True, ease=0.025)],
    )

    # Back: Inscribed Dhelv scripture-seals & octagonal golden solar halo-standard on Spine2 mount
    # Offset further back (bp[1]+0.110) & radially wider (r_h=0.210) so helmet crest fin has >= 22mm air gap from halo ring
    bp, dpad = _dorsal_pad(f'vth_{s}_ord_bk', p_bone)
    c_halo = np.array([0.0, bp[1] + 0.110, J('Neck')[2] + 0.110])
    r_h = 0.210
    pylons = [
        tube(f'vth_{s}_ord_pyl_{tag}', [bp + np.array([sgn * 0.046, 0.018, 0.04]), c_halo + np.array([sgn * r_h * 0.45, 0.0, -r_h * 0.86])],
             0.0095, p_gold, n=6, rigid_joint='Spine2')
        for sgn, tag in ((-1.0, 'r'), (1.0, 'l'))
    ]
    ring_pts = [c_halo + np.array([r_h * math.sin(th), 0.0, r_h * math.cos(th)]) for th in np.linspace(0, 2 * math.pi, 9)]
    hring = tube(f'vth_{s}_ord_hring', ring_pts, 0.011, p_gold, n=8, rigid_joint='Spine2')
    seals = [
        tassel(f'vth_{s}_ord_seal_{tag}', c_halo + np.array([sgn * 0.115, 0.0, -0.105]), 0.15, 0.016,
               P('vth_ashwhite', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'vth_porphyry')]), rigid_joint='Spine2')
        for sgn, tag in ((-1.0, 'r'), (1.0, 'l'))
    ]
    back = _vth_assemble(
        f'vth_{s}_ordinator_halo_seal', 'Ordinator Solar Halo-Standard & Dhelv Scripture Seals', 'back', 'chichani',
        [dpad, pylons, hring, seals],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_sun_high_priest(s):
    """14. Temple Canton Crimson-and-Gold High Hierophant."""
    p_vest = P('vth_porphyry', 0.03, [
        B('bottom', 0.0, 0.095, 'tzintzun_tapestry', 'vth_tzungold', 'vth_blitrit'),
        B('top', 0.0, 0.030, 'solid', 'vth_tzungold'),
    ], [
        PN(0.0, 1.0, 'tzintzun_tapestry', 'vth_tzungold', 'vth_porphyry', 0.22),
    ], fabric='cloth.silk')
    p_gold = _p_metal('vth_tzungold', 'vth_porphyry', 'metal.gold')
    p_jade = P('jade', 0.03, [B('bottom', 0.0, 0.035, 'vth_xicalcoliuhqui_fret', 'vth_tzungold', 'vth_porphyry')], fabric='cloth.silk')

    # Head: Tiered Aztec-Velothi solar mitre-crown w/ radiant golden rays
    mitre = tower_hat(f'vth_{s}_priest_mitre', 0.24, lambda u: 1.0 - 0.18 * u + 0.06 * math.cos(u * 4 * math.pi),
                      p_vest, f=0.63, ease=0.014, rows=14, n=36)
    rays = fan(f'vth_{s}_priest_rays', 0.095, 0.215, 1.15, p_gold, rows=7, cols=15, tilt=0.14, back=0.02, curl=0.02, rigid_joint='Head')
    head = _vth_assemble(
        f'vth_{s}_priest_solar_mitre', 'Tiered Aztec-Velothi Crimson-and-Gold Solar Mitre', 'head', 'chichani',
        [mitre, rays], covers_hair=True,
    )

    # Torso: Floor-length porphyry-crimson & gold liturgical vestment & wide jade/gold quechquemitl
    robe = torso_tube(f'vth_{s}_priest_robe_b', core.TOP - 0.008, core.ANKLE + 0.08, 0.036, p_vest,
                      hang_from=core.WAIST, flare=0.115, rows=26, n=44)
    slv = sleeves(f'vth_{s}_priest', 'wrist', 0.020, p_vest, ease_end=0.038, rows=12, wide=True)
    quech = collar_disc(f'vth_{s}_priest_quech', 0.125, p_jade, drop=0.115, rows=9, scallop=0.08, ease=0.022)
    pect = _krug_mirror_disc(f'vth_{s}_priest', robe, core.CHEST + 0.01, 0.072, p_gold, P('soot', 0.01, fabric='stone.obsidian.pancake_flaked'))
    sash = sash_with_tail(f'vth_{s}_priest_sash', p_gold, p_jade, ease=0.039, tail=0.30)
    torso = _vth_assemble(
        f'vth_{s}_priest_vestment', 'Crimson-and-Gold High Hierophant Vestment & Quechquemitl', 'torso', 'chichani',
        [robe, slv, quech, pect, sash],
    )

    # Gloves: Ritual gold-filigree cuffs
    gloves = _vth_assemble(
        f'vth_{s}_priest_cuffs', 'Ritual Gold-Filigree & Jadeite Hierophant Cuffs', 'gloves', 'chichani',
        [sleeve(f'vth_{s}_pr_cL', L, p_gold, f0=0.60, f1=0.96, ease=0.014, flare=0.006),
         sleeve(f'vth_{s}_pr_cR', R, p_gold, f0=0.60, f1=0.96, ease=0.014, flare=0.006)],
    )

    # Legs: Crimson-gold underrobe trousers (`ease=0.014, bag=0.008`)
    legs = _vth_assemble(
        f'vth_{s}_priest_underrobe', 'Liturgical Crimson-and-Gold Under-Şalvar', 'legs', 'chichani',
        trousers(f'vth_{s}_pr_slv', p_vest, ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Gilded temple platform calcei
    feet = _vth_assemble(
        f'vth_{s}_priest_calcei', 'Gilded Temple Platform Calcei', 'feet', 'chichani',
        boots(f'vth_{s}_pr_bt', p_gold, p_vest, top=0.38, cuff_paint=p_gold),
    )

    # Back: Twin incense-burner & obsidian Tzun sun-mirror dorsal arch
    bp, dpad = _dorsal_pad(f'vth_{s}_pr_bk', p_gold)
    m_ctr = bp + np.array([0.0, 0.044, 0.14])
    mirror_rim = rosette(f'vth_{s}_pr_mrim', m_ctr, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                         0.115, p_gold, n=16, thick=0.016, rigid_joint='Spine2')
    mirror_obs = rosette(f'vth_{s}_pr_mobs', m_ctr + np.array([0.0, 0.009, 0.0]), np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                         0.082, P('soot', 0.01, fabric='stone.obsidian.pancake_flaked'), n=14, thick=0.012, rigid_joint='Spine2')
    arms = []
    for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
        p0 = bp + np.array([sgn * 0.048, 0.022, 0.01])
        p1 = m_ctr + np.array([sgn * 0.115, 0.0, 0.0])
        arms.append(tube(f'vth_{s}_pr_arm_{tag}', [p0, p1], 0.010, p_gold, n=8, rigid_joint='Spine2'))
        arms.append(tassel(f'vth_{s}_pr_censer_{tag}', p1, 0.11, 0.020, p_gold, rigid_joint='Spine2'))
    back = _vth_assemble(
        f'vth_{s}_priest_sun_arch', 'Obsidian Sun-Mirror & Twin Incense-Burner Dorsal Arch', 'back', 'chichani',
        [dpad, mirror_rim, mirror_obs, arms],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_grey_penitent(s):
    """15. Temple Canton Ash-Smeared Grey Penitent Flagellant (LORE.md §6.12: 'grey-robed penitents in threes')."""
    p_grey = P('vth_penitentgrey', 0.07, [
        B('bottom', 0.0, 0.075, 'vth_blitrit_diamond', 'vth_ashwhite', 'soot'),
        B('top', 0.0, 0.024, 'solid', 'vth_ashwhite'),
    ], fabric='cloth.weave.burlap')
    p_iron = _p_metal('iron', 'soot', 'metal.iron')

    # Head: Ash-smeared sackcloth penitent hood + ash-veil faceplate w/ dark eye-slits
    cowl = hood(f'vth_{s}_pen_cowl', p_grey, ease=0.024, ease_low=0.036, open_front=0.80, low=-0.20, peak=0.07)
    veil = _sculpted_visage_mask(f'vth_{s}_pen_veil', P('vth_ashwhite', 0.06, fabric='cloth.weave.burlap'),
                                 p_iron, eye_paint=P('soot', 0.02), ease=0.013, mouth=False)
    head = _vth_assemble(
        f'vth_{s}_penitent_hood', 'Ash-Smeared Grey Penitent Hood & Branded Veil', 'head', 'chichani',
        [cowl, veil], covers_hair=True, covers_face=True,
    )

    # Torso: Ash-smeared grey burlap flagellant robe + crossed forged-iron penance chains
    robe = torso_tube(f'vth_{s}_pen_robe', core.TOP - 0.010, core.ANKLE + 0.09, 0.034, p_grey,
                      hang_from=core.WAIST, flare=0.102, rows=24, n=42)
    slv = sleeves(f'vth_{s}_pen', 'wrist', 0.018, p_grey, rows=10)
    chain_x = crossed_sash(f'vth_{s}_pen_chain', p_iron, width=0.042, ease=0.036)
    girdle = belt_sash(f'vth_{s}_pen_girdle', core.WAIST - 0.018, core.WAIST + 0.024, p_iron, ease=0.038)
    torso = _vth_assemble(
        f'vth_{s}_penitent_sackcloth', 'Ash-Smeared Grey Penitent Sackcloth & Penance Chains', 'torso', 'chichani',
        [robe, slv, chain_x, girdle],
    )

    # Gloves: Ash-wrapped forearms & heavy iron shackle cuffs
    gloves = _vth_assemble(
        f'vth_{s}_penitent_shackles', 'Ash-Wrapped Forearms & Iron Penance Shackles', 'gloves', 'chichani',
        [sleeve(f'vth_{s}_pen_wL', L, p_grey, f0=0.52, f1=0.90, ease=0.012),
         sleeve(f'vth_{s}_pen_wR', R, p_grey, f0=0.52, f1=0.90, ease=0.012),
         sleeve(f'vth_{s}_pen_shL', L, p_iron, f0=0.84, f1=0.96, ease=0.016),
         sleeve(f'vth_{s}_pen_shR', R, p_iron, f0=0.84, f1=0.96, ease=0.016)],
    )

    # Legs: Ragged ash-grey under-breeches (`ease=0.014, bag=0.008`)
    legs = _vth_assemble(
        f'vth_{s}_penitent_breeches', 'Ash-Grey Penitent Sackcloth Under-Breeches', 'legs', 'chichani',
        trousers(f'vth_{s}_pen_tr', p_grey, ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Barefoot-grip hemp penance sandals
    feet = _vth_assemble(
        f'vth_{s}_penitent_sandals', 'Rough Hemp-and-Ash Penance Sandals', 'feet', 'chichani',
        sandal(f'vth_{s}_pen_snd', P('bark', 0.07), p_grey, laces=2),
    )

    # Back: Forged-iron penance wheel & three-chain scourge on Spine2 yoke (symbolizing the 'threes' of Vothic penitents)
    bp, dpad = _dorsal_pad(f'vth_{s}_pen_bk', p_iron)
    w_ctr = bp + np.array([0.0, 0.038, 0.06])
    wheel_pts = [w_ctr + np.array([0.11 * math.cos(th), 0.0, 0.11 * math.sin(th)]) for th in np.linspace(0, 2 * math.pi, 13)]
    wheel = tube(f'vth_{s}_pen_wheel', wheel_pts, 0.011, p_iron, n=8, rigid_joint='Spine2')
    scourge = [
        tassel(f'vth_{s}_pen_scourge_{k}', w_ctr + np.array([xo, 0.0, -0.09]), 0.16, 0.012, p_iron, rigid_joint='Spine2')
        for k, xo in enumerate((-0.055, 0.0, 0.055))
    ]
    back = _vth_assemble(
        f'vth_{s}_penitent_chain_wheel', 'Forged-Iron Penance Wheel & Three-Chain Scourge', 'back', 'chichani',
        [dpad, wheel, scourge],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_tzintzun_sovereign_new_pieces(s):
    """16. Tzintzun, Undying Son of the Sun — newly built cloth-sim Sovereign Robe + Radiant Dorsal Sun-Halo
    (paired with existing Meshy `voth_{s}_tzintzun_{mask,gloves,pants,boots}`)."""
    p_gold = _p_metal('vth_tzungold', 'soot', 'metal.gold')
    p_reg = P('soot', 0.03, [
        B('bottom', 0.0, 0.095, 'tzintzun_tapestry', 'vth_tzungold', 'vth_blitrit'),
        B('top', 0.0, 0.032, 'solid', 'vth_tzungold'),
    ], [
        PN(0.0, 1.0, 'vth_ott_kemha', 'vth_tzungold', 'vth_blitrit', 0.22),
    ], fabric='cloth.silk')
    p_em = P('vth_indoverd', 0.03, [B('bottom', 0.0, 0.045, 'tzintzun_emerald_stole', 'vth_tzungold', 'vth_indoverd')], fabric='cloth.silk')

    # Cloth-simulated Sovereign Regalia (`hang_from=core.WAIST`, half-sleeves clearing `voth_{s}_tzintzun_gloves`)
    robe = torso_tube(f'vth_{s}_tzin_robe_b', core.TOP - 0.008, core.KNEE + 0.04, 0.038, p_reg,
                      hang_from=core.WAIST, flare=0.115, rows=24, n=44)
    slv = sleeves(f'vth_{s}_tzin', 'elbow', 0.019, p_reg, rows=8)
    paul_l = pauldron(f'vth_{s}_tzin_pL', L, p_gold, reach=0.38, ease=0.026)
    paul_r = pauldron(f'vth_{s}_tzin_pR', R, p_gold, reach=0.38, ease=0.026)
    yoke = collar_disc(f'vth_{s}_tzin_yoke', 0.125, p_gold, drop=0.105, rows=9, scallop=0.08, ease=0.023)
    pect = _krug_mirror_disc(f'vth_{s}_tzin', robe, core.CHEST + 0.02, 0.086, p_gold, p_em)
    sash = sash_with_tail(f'vth_{s}_tzin_sash', p_em, p_gold, ease=0.041, tail=0.30)
    torso = _vth_assemble(
        f'vth_{s}_tzintzun_sovereign_robe', "Tzintzun's Cloth-Simulated Solar Sovereign Regalia", 'torso', 'chichani',
        [robe, slv, paul_l, paul_r, yoke, pect, sash],
    )

    # Radiant Golden Tzun Sun-Burst Halo on Spine2 mount
    bp, dpad = _dorsal_pad(f'vth_{s}_tzin_bk', p_gold)
    c_sun = np.array([0.0, bp[1] + 0.048, J('Neck')[2] + 0.105])
    r_out = 0.225
    r_in = 0.145
    pylons = [
        tube(f'vth_{s}_tzin_pyl_{tag}', [bp + np.array([sgn * 0.052, 0.018, 0.04]), c_sun + np.array([sgn * r_in * 0.55, 0.0, -r_in * 0.82])],
             0.011, p_gold, n=8, rigid_joint='Spine2')
        for sgn, tag in ((-1.0, 'r'), (1.0, 'l'))
    ]
    out_pts = [c_sun + np.array([r_out * math.sin(th), 0.0, r_out * math.cos(th)]) for th in np.linspace(0, 2 * math.pi, 17)]
    in_pts = [c_sun + np.array([r_in * math.sin(th), -0.003, r_in * math.cos(th)]) for th in np.linspace(0, 2 * math.pi, 17)]
    ring_o = tube(f'vth_{s}_tzin_ring_o', out_pts, 0.012, p_gold, n=8, rigid_joint='Spine2')
    ring_i = tube(f'vth_{s}_tzin_ring_i', in_pts, 0.009, p_em, n=8, rigid_joint='Spine2')
    rays = []
    for k in range(12):
        th = (k / 12.0) * 2.0 * math.pi
        dr = np.array([math.sin(th), 0.0, math.cos(th)])
        rays.append(horn(f'vth_{s}_tzin_ray_{k}', [c_sun + dr * (r_in - 0.005), c_sun + dr * (r_out + 0.075)],
                         0.013, 0.0025, p_gold, n=6, rows=6, rigid_joint='Spine2'))
    back = _vth_assemble(
        f'vth_{s}_tzintzun_sun_halo', "Tzintzun's Radiant Golden Sun-Burst Dorsal Halo", 'back', 'chichani',
        [dpad, pylons, ring_o, ring_i, rays],
    )
    return [torso, back]


# ===========================================================================================================
# PART B: `voth_arcologies` — PILLAR III & IV: TWIN ARCOLOGIES (`Drum` & `Torus`) + CROWN AUXILIARIES
# ===========================================================================================================
def _build_drum_fin_rigger(s):
    """17. Drum (Vinvolk) Sky-Gate Hoistman & Concrete-Fin Rigger (barely Voth-influenced + tiny white-diamond tally)."""
    p_canv = P('arc_canvas', 0.06, [B('bottom', 0.0, 0.03, 'solid', 'leather')], fabric='cloth.canvas.duck.army')
    p_lth = leathery(P('saddle', 0.05, [B('top', 0.0, 0.02, 'solid', 'iron')], fabric='leather.foundry.pigskin'))
    p_iron = _p_metal('iron', 'soot', 'metal.steel.brushed')

    # Head: Reclaimed Ancient polymer bump-cap + short visor peak (raised crown >= 1.15, ease >= 0.019)
    cap = _vth_cranial_shell(f'arc_{s}_rig_cap', P('arc_alloy', 0.04, fabric='armor.ancient.hex_weave'), f_top=1.16, f_bot=0.36, ease=0.020)
    peak = brim(f'arc_{s}_rig_brim', 0.63, 0.036, p_lth, ease=0.020, droop=0.010)
    head = _vth_assemble(
        f'arc_{s}_rigger_bumpcap', 'Reclaimed Ancient Polymer Bump-Cap', 'head', 'voth_arcologies',
        [cap, peak], covers_hair=True,
    )

    # Torso: Grey canvas utility jerkin + heavy leather hoist-pulley harness + TINY mandatory ash-white diamond tax-tally
    jerk = torso_tube(f'arc_{s}_rig_jerk', core.TOP - 0.010, core.WAIST - 0.055, 0.022, p_canv, rows=15, n=40)
    slv = sleeves(f'arc_{s}_rig', 'elbow', 0.017, p_canv, rows=7)
    harn = crossed_sash(f'arc_{s}_rig_harn', p_lth, width=0.054, ease=0.026)
    belt = pouch_belt(f'arc_{s}_rig_pb', p_lth, p_canv, ease=0.025)
    p_tag, d_tag = _snap_on_part(jerk, chest_front(core.CHEST + 0.05, 0.022, x=0.055), out_push=0.005)
    tally = rosette(f'arc_{s}_rig_tax_tag', p_tag, d_tag, np.array([1.0, 0.0, 0.0]), 0.018,
                    P('vth_ashwhite', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'vth_blitrit')]), n=4, thick=0.008)
    torso = _vth_assemble(
        f'arc_{s}_rigger_jerkin', 'Vinvolk Canvas Jerkin, Hoist Harness & Tax-Tally Tag', 'torso', 'voth_arcologies',
        [jerk, slv, harn, belt, tally],
    )

    # Gloves: Heavy riveted cable-hauling mitts
    gloves = _vth_assemble(
        f'arc_{s}_rigger_mitts', 'Riveted Leather Cable-Hauling Gauntlets', 'gloves', 'voth_arcologies',
        full_gloves(f'arc_{s}_rig_gv', p_lth, p_lth, knuckle_paint=p_iron),
    )

    # Legs: Patched polymer-canvas work trousers
    legs = _vth_assemble(
        f'arc_{s}_rigger_trousers', 'Patched Polymer-Canvas Fin-Rigger Trousers', 'legs', 'voth_arcologies',
        trousers(f'arc_{s}_rig_tr', P('repgreyd', 0.06, [B('bottom', 0.0, 0.05, 'solid', 'saddle')], fabric='cloth.canvas.duck.army'),
                 ease=0.018, bag=0.018),
        legged=True,
    )

    # Feet: Steel-toe salvaged deck boots
    feet = _vth_assemble(
        f'arc_{s}_rigger_boots', 'Steel-Toe Salvaged Sky-Gate Deck Boots', 'feet', 'voth_arcologies',
        boots(f'arc_{s}_rig_bt', p_iron, p_lth, top=0.42, cuff_paint=p_iron),
    )

    # Back: Coiled steel hoist-cable & iron pry-bar rig on Spine2 pad
    bp, dpad = _dorsal_pad(f'arc_{s}_rig_bk', p_lth)
    coil_c = bp + np.array([0.0, 0.038, 0.01])
    coil_pts = [coil_c + np.array([0.105 * math.cos(th), 0.006 * math.sin(2 * th), 0.105 * math.sin(th)]) for th in np.linspace(0, 2 * math.pi, 15)]
    coil = tube(f'arc_{s}_rig_coil', coil_pts, 0.018, p_iron, n=8, rigid_joint='Spine2')
    pry = tube(f'arc_{s}_rig_pry', [bp + np.array([-0.08, 0.052, -0.15]), bp + np.array([0.09, 0.052, 0.19])], 0.012, p_iron, n=6, rigid_joint='Spine2')
    back = _vth_assemble(
        f'arc_{s}_rigger_cable_rig', 'Coiled Steel Hoist-Cable & Iron Pry-Bar Rig', 'back', 'voth_arcologies',
        [dpad, coil, pry],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_torus_ring_terracer(s):
    """18. Torus (Rinkvolk) Forest-Ring Orchardist & Granary Miller (narrow purple tithe-cord only)."""
    p_straw = P('oat', 0.06, [B('bottom', 0.0, 0.025, 'solid', 'bark')], fabric='straw.plaited')
    p_hemp = P('linen', 0.06, [B('bottom', 0.0, 0.035, 'solid', 'moss')], fabric=COTTON)
    p_apron = P('khaki', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'saddle')], fabric='cloth.canvas.duck.army')
    p_tithe = P('vth_blitrit', 0.04, [B('bottom', 0.0, 0.02, 'vth_blitrit_diamond', 'vth_ashwhite', 'vth_blitrit')], fabric=COTTON)

    # Head: Broad woven straw/canvas Forest-Ring terrace sun-hat
    hat = conical_hat(f'arc_{s}_ter_hat', p_straw, f_base=0.66, f_top=1.14, r_base=0.30, r_top=0.03, rows=10, n=36)
    head = _vth_assemble(
        f'arc_{s}_terracer_sunhat', 'Woven Forest-Ring Terrace Sun-Hat', 'head', 'voth_arcologies',
        [hat], covers_hair=True,
    )

    # Torso: Unbleached linen tunic + orchard harvest apron + narrow mandatory purple granary tithe-cord
    tunic = torso_tube(f'arc_{s}_ter_tun', core.TOP - 0.010, core.WAIST - 0.048, 0.021, p_hemp, rows=15, n=40)
    slv = sleeves(f'arc_{s}_ter', 'elbow', 0.017, p_hemp, rows=7)
    apron = tabard(f'arc_{s}_ter_apr', core.CROTCH - 0.02, core.WAIST + 0.03, p_apron, width=0.23, ease=0.026, front=True, back=False)
    cord = belt_sash(f'arc_{s}_ter_tithe_cord', core.WAIST - 0.010, core.WAIST + 0.022, p_tithe, ease=0.025)
    torso = _vth_assemble(
        f'arc_{s}_terracer_tunic', 'Rinkvolk Linen Tunic, Orchard Apron & Purple Tithe-Cord', 'torso', 'voth_arcologies',
        [tunic, slv, apron, cord],
    )

    # Gloves: Canvas forearm wraps
    gloves = _vth_assemble(
        f'arc_{s}_terracer_wraps', 'Canvas Orchardist Forearm Wraps', 'gloves', 'voth_arcologies',
        [sleeve(f'arc_{s}_ter_wL', L, p_apron, f0=0.54, f1=0.94, ease=0.012),
         sleeve(f'arc_{s}_ter_wR', R, p_apron, f0=0.54, f1=0.94, ease=0.012)],
    )

    # Legs: Rolled-cuff terrace work breeches (`ankle_f=0.72`)
    legs = _vth_assemble(
        f'arc_{s}_terracer_breeches', 'Rolled-Cuff Hemp Terrace Work Breeches', 'legs', 'voth_arcologies',
        trousers(f'arc_{s}_ter_tr', P('drab', 0.06, fabric=COTTON), ankle_f=0.74, ease=0.018, bag=0.020),
        legged=True,
    )

    # Feet: Stout leather granary clogs (`ease_top=0.016` for snug ankle fit below rolled cuff)
    feet = _vth_assemble(
        f'arc_{s}_terracer_clogs', 'Stout Leather & Wood-Sole Granary Clogs', 'feet', 'voth_arcologies',
        boots(f'arc_{s}_ter_clg', P('bark', 0.08), P('leather', 0.06), top=0.28, ease_top=0.016),
    )

    # Back: Woven terraced fruit/grain ring-basket on Spine2 pad
    bp, dpad = _dorsal_pad(f'arc_{s}_ter_bk', p_straw)
    bsk = blob(f'arc_{s}_ter_bsk', bp + np.array([0.0, 0.062, 0.0]), (0.185, 0.120, 0.215),
               p_straw, n=12, rows=6, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2')
    fruit = blob(f'arc_{s}_ter_harvest', bp + np.array([0.0, 0.062, 0.105]), (0.145, 0.092, 0.068),
                 P('sunorange', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'weld')]), n=10, rows=4, rigid_joint='Spine2')
    back = _vth_assemble(
        f'arc_{s}_terracer_basket', 'Forest-Ring Woven Orchard & Grain Harvest Basket', 'back', 'voth_arcologies',
        [dpad, bsk, fruit],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_arcology_client_chief(s):
    """19. Drïm / Tors Court-Hall Client Chief (Ancient ceramic/alloy coat + reluctant Vothic purple sash)."""
    p_anc = P('ancient', 0.03, [
        B('bottom', 0.0, 0.065, 'ancient_hex', 'arc_alloy', 'charcoal'),
        B('top', 0.0, 0.025, 'solid', 'arc_alloy'),
    ], [
        PN(0.0, 1.0, 'ancient_hex', 'arc_alloy', 'ancient', 0.20),
    ], fabric='armor.ancient.hex_weave')
    p_alloy = _p_metal('arc_alloy', 'charcoal', 'metal.steel.brushed')
    p_fur = P('fur', 0.06, fabric='fur.wolf')
    p_sash = _p_blitrit('vth_blitrit', 'vth_ashwhite', 'cloth.silk')

    # Head: Salvaged Ancient brushed-alloy circlet (`ease=0.004`, `covers_hair=False`, passes Gate 2D!)
    head = _vth_assemble(
        f'arc_{s}_chief_circlet', 'Salvaged Ancient Brushed-Alloy Chieftain Circlet', 'head', 'voth_arcologies',
        [crown_band(f'arc_{s}_chief_circ', p_alloy, f0=0.58, f1=0.71, ease=0.004, flare=0.003, rows=5, n=36)],
        covers_hair=False,
    )

    # Torso: Reclaimed Ancient white-ceramic & wolf-fur chieftain coat + reluctant Vothic purple diplomatic sash
    coat = torso_tube(f'arc_{s}_chief_coat_b', core.TOP - 0.008, core.KNEE + 0.06, 0.036, p_anc,
                      hang_from=core.WAIST, flare=0.105, rows=22, n=42)
    slv = sleeves(f'arc_{s}_chief', 'wrist', 0.018, P('charcoal', 0.05, fabric=WOOL), rows=10)
    paul_l = pauldron(f'arc_{s}_chief_fL', L, p_fur, reach=0.35, ease=0.026)
    paul_r = pauldron(f'arc_{s}_chief_fR', R, p_fur, reach=0.35, ease=0.026)
    dip_sash = crossed_sash(f'arc_{s}_chief_vothsash', p_sash, width=0.062, ease=0.039)
    belt = belt_sash(f'arc_{s}_chief_belt', core.WAIST - 0.018, core.WAIST + 0.028, p_alloy, ease=0.039)
    torso = _vth_assemble(
        f'arc_{s}_chief_coat', 'Reclaimed Ancient Ceramic-Fur Coat & Reluctant Vothic Sash', 'torso', 'voth_arcologies',
        [coat, slv, paul_l, paul_r, dip_sash, belt],
    )

    # Gloves: Riveted alloy & leather bracers
    gloves = _vth_assemble(
        f'arc_{s}_chief_bracers', 'Riveted Ancient Alloy & Leather Bracers', 'gloves', 'voth_arcologies',
        full_gloves(f'arc_{s}_chief_gv', p_alloy, P('charcoal', 0.05), knuckle_paint=p_alloy),
    )

    # Legs: Tailored dark salvage breeches (`ease=0.014, bag=0.008` under coat)
    legs = _vth_assemble(
        f'arc_{s}_chief_breeches', 'Tailored Dark Arcology Salvage Breeches', 'legs', 'voth_arcologies',
        trousers(f'arc_{s}_chief_tr', P('charcoal', 0.05, fabric=WOOL), ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Strapped arcology chieftain boots
    feet = _vth_assemble(
        f'arc_{s}_chief_boots', 'Strapped Arcology Chieftain Boots', 'feet', 'voth_arcologies',
        boots(f'arc_{s}_chief_bt', P('soot', 0.08), P('charcoal', 0.05, fabric='leather.polished'), top=0.52, wraps=2, wrap_paint=p_alloy),
    )

    # Back: Salvaged Ancient alloy louver-crest mantle (`z_bot=core.CROTCH + 0.08, stiff=0.36, back_push=0.055`)
    back = _vth_assemble(
        f'arc_{s}_chief_louver_mantle', 'Ancient Brushed-Alloy Louver Mantle', 'back', 'voth_arcologies',
        [cape(f'arc_{s}_chief_cape', core.CROTCH + 0.08,
              P('charcoal', 0.04, [B('bottom', 0.0, 0.07, 'ancient_hex', 'arc_alloy', 'vth_blitrit')], fabric=WOOL),
              ease=0.025, flare=0.09, stiff=0.36, back_push=0.055)],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_scrap_vothic_militia(s):
    """20. Drum / Torus Tyre-Rampart 'Scrap-Ordinator' Watch (Mad Max / Fallout Salvage × Crude Vothic Paint)."""
    p_rust = P('arc_rustplate', 0.06, [
        B('bottom', 0.0, 0.04, 'solid', 'iron'),
    ], [
        PN(0.0, 1.0, 'arc_scrap_diamond', 'vth_ashwhite', 'arc_rustplate', 0.24),
    ], fabric='armor.salvage.tread_plate')
    p_tyre = P('arc_tyre', 0.06, [
        B('bottom', 0.0, 0.045, 'solid', 'vth_oldplum'),
    ], [
        PN(0.0, 1.0, 'arc_tyre_ichca', 'iron', 'arc_tyre', 0.16),
    ], fabric='rubber.tyre')
    p_rag = P('vth_oldplum', 0.07, [B('bottom', 0.0, 0.05, 'arc_scrap_diamond', 'vth_ashwhite', 'vth_blitrit')], fabric='cloth.weave.burlap')
    p_iron = _p_metal('iron', 'arc_rustplate', 'metal.iron')

    # Head: Welded rusted-steel "Scrap-Ordinator" faceplate helm w/ punched eye-slits & rebar/lawnmower-blade crest
    bowl = _vth_cranial_shell(f'arc_{s}_scord_bowl', p_iron, f_top=1.03, f_bot=-0.04, ease=0.014)
    fmask = _sculpted_visage_mask(f'arc_{s}_scord_mask', p_rust, p_iron, eye_paint=P('soot', 0.02), ease=0.014)
    blade_crest = crest(f'arc_{s}_scord_crest', 0.082, p_rust, rows=6, cols=13, sweep=0.04,
                        base_ease=0.014, thick=0.010, host_part=bowl)
    head = _vth_assemble(
        f'arc_{s}_scrap_ordinator_helm', 'Welded Rusted-Steel "Scrap-Ordinator" Faceplate Helm', 'head', 'voth_arcologies',
        [bowl, fmask, blade_crest], covers_hair=True, covers_face=True,
    )

    # Torso: Sculpted laminar rusted road-plate cuirass + gorget + asymmetric articulated scrap pauldrons + splash-painted krug
    p_rust_metal = P('arc_rustplate', 0.05, [
        B('bottom', 0.0, 0.03, 'solid', 'iron'),
    ], [
        PN(0.0, 1.0, 'arc_scrap_diamond', 'vth_ashwhite', 'arc_rustplate', 0.24),
    ], fabric='metal.iron')
    cuir_parts = cuirass_plate(f'arc_{s}_scord_vest', p_rust_metal, trim_paint=p_iron,
                               style='laminar', faulds=2, ease=0.023)
    gorg = gorget_guard(f'arc_{s}_scord_gorg', p_iron, trim_paint=p_rust_metal, ease=0.023)
    paul_l = articulated_pauldron(f'arc_{s}_scord_pL', L, p_iron, trim_paint=p_rust_metal, lames=3, haute_piece=True, ease=0.023)
    paul_r = articulated_pauldron(f'arc_{s}_scord_pR', R, p_rust_metal, trim_paint=p_iron, lames=2, haute_piece=False, ease=0.023)
    slv = sleeves(f'arc_{s}_scord', 'elbow', 0.017, p_rag, rows=7)
    krug = _krug_mirror_disc(f'arc_{s}_scord', cuir_parts[0], core.CHEST + 0.02, 0.076, p_rust_metal)
    belt = pouch_belt(f'arc_{s}_scord_pb', p_tyre, p_rag, ease=0.033)
    torso = _vth_assemble(
        f'arc_{s}_scrap_ichca_vest', 'Sculpted Road-Plate Laminar Cuirass & Splash-Painted Scrap-Krug', 'torso', 'voth_arcologies',
        [cuir_parts, gorg, paul_l, paul_r, slv, krug, belt],
    )

    # Gloves: Sculpted scrap-iron & rebar wasteland vambraces + couters
    gloves = _vth_assemble(
        f'arc_{s}_scrap_bracers', 'Sculpted Scrap-Iron & Rebar Wasteland Vambraces', 'gloves', 'voth_arcologies',
        sculpted_vambraces(f'arc_{s}_sc_vmb', p_rust_metal, trim_paint=p_iron, couter=True, ease=0.017),
    )

    # Legs: Patched Fallout-style road-leathers w/ tin-patchwork knee trim
    legs = _vth_assemble(
        f'arc_{s}_scrap_leathers', 'Patched Road-Leathers & Tin Knee-Cops', 'legs', 'voth_arcologies',
        trousers(f'arc_{s}_sc_tr', P('leather', 0.06, [B('bottom', 0.0, 0.06, 'tin_patchwork', 'iron', 'arc_rustplate')], fabric='leather.foundry.pigskin'),
                 ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Sculpted scrap-iron greaves & poleyns over combat boots
    feet = _vth_assemble(
        f'arc_{s}_scrap_boots', 'Sculpted Road-Plate Greaves & Tyre-Sole Combat Boots', 'feet', 'voth_arcologies',
        [boots(f'arc_{s}_sc_bt', p_tyre, P('saddle', 0.06), top=0.26, ease_top=0.022),
         sculpted_greaves(f'arc_{s}_sc_grv', p_rust_metal, trim_paint=p_iron, poleyn=True, ease=0.025)],
    )

    # Back: Octagonal scrap-metal & tyre-rim shield (scrap-chimalli) painted w/ dripping ash-white Vothic diamond
    bp, dpad = _dorsal_pad(f'arc_{s}_sc_bk', p_tyre)
    sh_c = bp + np.array([0.0, 0.036, 0.02])
    oct_sh = rosette(f'arc_{s}_scrap_chim', sh_c, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                     0.205, p_rust, n=8, thick=0.016, rigid_joint='Spine2')
    rim_pts = [sh_c + np.array([0.205 * math.cos(th), 0.004, 0.205 * math.sin(th)]) for th in np.linspace(0, 2 * math.pi, 9)]
    tyre_rim = tube(f'arc_{s}_scrap_rim', rim_pts, 0.015, p_tyre, n=8, rigid_joint='Spine2')
    back = _vth_assemble(
        f'arc_{s}_scrap_chimalli', 'Octagonal Road-Plate & Tyre-Rim "Scrap-Chimalli" Shield', 'back', 'voth_arcologies',
        [dpad, oct_sh, tyre_rim],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_scrap_vothic_enforcer(s):
    """21. Drïm Chief's Sky-Gate Heavy Shock-Guard ('Scrap-Börk' pot-helm & Ancient louver pauldron)."""
    p_pot = P('iron', 0.06, [
        B('bottom', 0.0, 0.04, 'solid', 'arc_rustplate'),
    ], [
        PN(0.0, 1.0, 'arc_scrap_diamond', 'vth_ashwhite', 'iron', 0.22),
    ], fabric='armor.salvage.tread_plate')
    p_rag = P('vth_blitrit', 0.07, [B('bottom', 0.0, 0.05, 'arc_scrap_diamond', 'vth_ashwhite', 'vth_oldplum')], fabric='cloth.weave.burlap')
    p_alloy = _p_metal('arc_alloy', 'arc_rustplate', 'metal.steel.brushed')
    p_tyre = P('arc_tyre', 0.06, [], [PN(0.0, 1.0, 'arc_tyre_ichca', 'iron', 'arc_tyre', 0.16)], fabric='rubber.tyre')

    # Head: Cut freon-tank "Scrap-Börk" pot-helm + ragged purple sleeve-tail + welded rebar cage visor
    pot = tower_hat(f'arc_{s}_enf_pot', 0.19, lambda u: 1.0 - 0.06 * u, p_pot, f=0.62, ease=0.015, rows=10, n=32)
    visor = _sculpted_visage_mask(f'arc_{s}_enf_visor', P('arc_rustplate', 0.06, fabric='metal.iron'), p_alloy,
                                  eye_paint=P('soot', 0.02), ease=0.014, mouth=False)
    a, b, up, bk, left = head_frame()
    p_bk_top, _ = _snap_on_part(pot, a + (b - a) * 1.05 + bk * 0.10, out_push=0.002)
    p_bk_bot = a + (b - a) * 0.14 + bk * 0.125
    rag_tail = tube(f'arc_{s}_enf_ragtail', [p_bk_top, 0.5 * (p_bk_top + p_bk_bot) + bk * 0.015, p_bk_bot], 0.035, p_rag, n=8, rigid_joint='Head')
    head = _vth_assemble(
        f'arc_{s}_scrap_bork_helm', 'Cut Freon-Tank "Scrap-Börk" Pot-Helm & Wire Visor', 'head', 'voth_arcologies',
        [pot, visor, rag_tail], covers_hair=True, covers_face=True,
    )

    # Torso: Sculpted angular alloy/steel shock-cuirass + gorget + articulated arcology-louver pauldrons + purple rag sash
    p_pot_metal = P('iron', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'arc_rustplate'),
    ], [
        PN(0.0, 1.0, 'arc_scrap_diamond', 'vth_ashwhite', 'iron', 0.22),
    ], fabric='metal.steel')
    cuir_parts = cuirass_plate(f'arc_{s}_enf_body', p_pot_metal, trim_paint=p_alloy,
                               style='cyber_plate', faulds=3, ease=0.024)
    gorg = gorget_guard(f'arc_{s}_enf_gorg', p_alloy, trim_paint=p_pot_metal, ease=0.024)
    pauls = articulated_pauldrons(f'arc_{s}_enf_pld', p_alloy, trim_paint=p_pot_metal,
                                  lames=3, haute_piece=True, ease=0.024)
    slv = sleeves(f'arc_{s}_enf', 'elbow', 0.018, p_tyre, rows=7)
    sash = sash_with_tail(f'arc_{s}_enf_sash', p_rag, p_rag, ease=0.035, tail=0.12)
    torso = _vth_assemble(
        f'arc_{s}_scrap_enforcer_harness', 'Arcology-Louver Articulated Pauldrons & Bolted Steel Shock-Cuirass', 'torso', 'voth_arcologies',
        [cuir_parts, gorg, pauls, slv, sash],
    )

    # Gloves: Sculpted scrap-steel vambraces + couters + pigskin gauntlets
    gloves = _vth_assemble(
        f'arc_{s}_scrap_gauntlets', 'Bolted Steel Shock-Vambraces & Pigskin Gauntlets', 'gloves', 'voth_arcologies',
        [sculpted_vambraces(f'arc_{s}_enf_vmb', p_pot_metal, trim_paint=p_alloy, couter=True, ease=0.021),
         full_gloves(f'arc_{s}_enf_gv', p_alloy, P('saddle', 0.06, fabric='leather.foundry.pigskin'), f0=0.86, knuckle_paint=p_alloy)],
    )

    # Legs: Tyre-tread breeches + 4-lame hinged bolted-steel thigh tassets
    legs = _vth_assemble(
        f'arc_{s}_scrap_tasset_breeches', 'Chain-Lashed Tyre Breeches & Bolted Steel Tassets', 'legs', 'voth_arcologies',
        [trousers(f'arc_{s}_enf_tr', p_tyre, ease=0.014, bag=0.008),
         hinged_tassets(f'arc_{s}_enf_tas', p_pot_metal, trim_paint=p_alloy, lames=4, ease=0.026)],
        legged=True,
    )

    # Feet: Sculpted bolted steel shin greaves & poleyns over wasteland boots
    feet = _vth_assemble(
        f'arc_{s}_scrap_shin_boots', 'Heavy Bolted Steel-Greave Wasteland Boots', 'feet', 'voth_arcologies',
        [boots(f'arc_{s}_enf_bt', p_tyre, p_pot_metal, top=0.26, ease_top=0.022),
         sculpted_greaves(f'arc_{s}_enf_grv', p_pot_metal, trim_paint=p_alloy, poleyn=True, ease=0.025)],
    )

    # Back: Salvaged hydraulic ram & ragged Vothic diamond scrap-banner rack
    bp, dpad = _dorsal_pad(f'arc_{s}_enf_bk', p_pot)
    ram = tube(f'arc_{s}_enf_ram', [bp + np.array([-0.045, 0.045, -0.14]), bp + np.array([-0.045, 0.045, 0.16])], 0.030, p_alloy, n=10, rigid_joint='Spine2')
    pole = tube(f'arc_{s}_enf_pole', [bp + np.array([0.045, 0.038, -0.06]), bp + np.array([0.045, 0.044, 0.34])], 0.010, p_pot, n=6, rigid_joint='Spine2')
    pennon = blob(f'arc_{s}_enf_flag', bp + np.array([0.045, 0.085, 0.25]), (0.022, 0.115, 0.145), p_rag, n=8, rows=5, rigid_joint='Spine2')
    back = _vth_assemble(
        f'arc_{s}_scrap_banner_rig', 'Salvaged Hydraulic Ram & Ragged Scrap-Vothic Banner', 'back', 'voth_arcologies',
        [dpad, ram, pole, pennon],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_aux_islander_marine(s):
    """22. Islander Auxiliary (Hetānini / Almua Bireme Marine & Port Guard)."""
    p_rattan = P('totorareed', 0.06, [B('bottom', 0.0, 0.03, 'solid', 'bark')], fabric='straw.reed.plaited')
    p_tapa = P('arc_tapa', 0.05, [
        B('bottom', 0.0, 0.080, 'arc_tapa_diamond', 'vth_ashwhite', 'vth_blitrit'),
        B('top', 0.0, 0.025, 'solid', 'vth_blitrit'),
    ], [
        PN(0.0, 1.0, 'islander_hukoa_tapa', 'soot', 'arc_tapa', 0.22),
    ], fabric='cloth.bark.tapa')
    p_ikat = P('arc_tapa', 0.05, [
        B('bottom', 0.0, 0.085, 'arc_tapa_diamond', 'vth_tzungold', 'vth_blitrit'),
    ], [
        PN(0.0, 1.0, 'islander_kautoa_ikat', 'vth_blitrit', 'arc_tapa', 0.22),
    ], fabric='cloth.bark.tapa')
    p_brass = _p_metal('brass', 'vth_blitrit', 'metal.bronze')
    p_purp = _p_blitrit('vth_blitrit', 'vth_ashwhite', 'cloth.cotton.coarse')

    # Head: Horned-ridge woven rattan & boar-tusk war-casque w/ Blïtrit-purple Vothic headband
    bowl = _vth_cranial_shell(f'arc_{s}_isl_bowl', p_rattan, f_top=1.03, f_bot=0.14, ease=0.013)
    hband = crown_band(f'arc_{s}_isl_band', p_purp, f0=0.58, f1=0.69, ease=0.016, flare=0.003, rows=4, n=36)
    ridge = crest(f'arc_{s}_isl_ridge', 0.058, p_rattan, rows=5, cols=13, base_ease=0.013, thick=0.012, host_part=bowl)
    a, b, up, bk, left = head_frame()
    tusks = []
    for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
        p_t0, _ = _snap_on_part(hband, a + (b - a) * 0.63 + left * (sgn * 0.085) - bk * 0.04, out_push=0.002)
        tusks.append(horn(f'arc_{s}_isl_tusk_{tag}', [
            p_t0,
            p_t0 + left * (sgn * 0.036) - bk * 0.032 + up * 0.022,
            p_t0 + left * (sgn * 0.018) - bk * 0.052 + up * 0.058,
        ], 0.010, 0.0025, P('ivory', 0.03), n=8, rows=7, rigid_joint='Head'))
    head = _vth_assemble(
        f'arc_{s}_islander_casque', 'Hetānini Woven Rattan & Boar-Tusk Casque w/ Vothic Band', 'head', 'voth_arcologies',
        [bowl, hband, ridge, tusks], covers_hair=True,
    )

    # Torso: Sikau tapa & coconut-coir corslet + stamped brass Vothic diamond gorget & purple waist-sash
    cors = torso_tube(f'arc_{s}_isl_cors', core.TOP - 0.012, core.WAIST - 0.036, 0.022, p_tapa, rows=15, n=40)
    gorget = collar_disc(f'arc_{s}_isl_gorget', 0.095, p_brass, drop=0.082, rows=8, scallop=0.06, ease=0.021)
    krug_d = _krug_mirror_disc(f'arc_{s}_isl_diam', cors, core.CHEST + 0.03, 0.055, p_purp, p_brass)
    sash = belt_sash(f'arc_{s}_isl_sash', core.WAIST - 0.004, core.WAIST + 0.034, p_purp, ease=0.026)
    torso = _vth_assemble(
        f'arc_{s}_islander_corslet', 'Sikau Tapa & Coir Corslet w/ Brass Vothic Diamond Gorget', 'torso', 'voth_arcologies',
        [cors, gorget, krug_d, sash], open_torso=True,
    )

    # Gloves: Shark-tooth & braided coir wrist-guards
    gloves = _vth_assemble(
        f'arc_{s}_islander_wristguards', 'Shark-Tooth & Braided Coir Marine Wrist-Guards', 'gloves', 'voth_arcologies',
        [sleeve(f'arc_{s}_isl_wL', L, P('totorareed', 0.06, [B('top', 0.0, 0.025, 'solid', 'ivory')], fabric='straw.reed.plaited'), f0=0.58, f1=0.95, ease=0.013),
         sleeve(f'arc_{s}_isl_wR', R, P('totorareed', 0.06, [B('top', 0.0, 0.025, 'solid', 'ivory')], fabric='straw.reed.plaited'), f0=0.58, f1=0.95, ease=0.013)],
    )

    # Legs: Patterned Islander tapa mariner kilt (malo / lava-lava) below rigid waist sash
    legs = _vth_assemble(
        f'arc_{s}_islander_malo_kilt', 'Hetānini Tapa & Vothic-Bordered Mariner Lava-Lava Kilt', 'legs', 'voth_arcologies',
        [skirt(f'arc_{s}_isl_kilt', core.KNEE + 0.04, core.WAIST - 0.018, p_ikat, ease=0.019, flare=0.082)],
        legged=False,
    )

    # Feet: Barefoot-grip braided coir deck-sandals
    feet = _vth_assemble(
        f'arc_{s}_islander_sandals', 'Braided Coconut-Coir Bireme Deck Sandals', 'feet', 'voth_arcologies',
        sandal(f'arc_{s}_isl_snd', p_rattan, p_purp, laces=2),
    )

    # Back: Carved outrigger boarding-hook & woven tapa quiver on Spine2 pad
    bp, dpad = _dorsal_pad(f'arc_{s}_isl_bk', p_rattan)
    quiv = tube(f'arc_{s}_isl_quiv', [bp + np.array([-0.04, 0.042, -0.12]), bp + np.array([-0.02, 0.046, 0.17])], 0.034, p_tapa, n=10, rigid_joint='Spine2')
    shaft = tube(f'arc_{s}_isl_pole', [bp + np.array([0.05, 0.038, -0.16]), bp + np.array([0.05, 0.042, 0.28])], 0.011, P('bark', 0.06), n=8, rigid_joint='Spine2')
    hk = horn(f'arc_{s}_isl_hook', [
        bp + np.array([0.05, 0.042, 0.27]),
        bp + np.array([0.095, 0.048, 0.30]),
        bp + np.array([0.105, 0.048, 0.23]),
    ], 0.010, 0.003, P('ivory', 0.03), n=8, rows=6, rigid_joint='Spine2')
    back = _vth_assemble(
        f'arc_{s}_islander_hook_quiver', 'Outrigger Boarding-Hook & Woven Tapa Quiver', 'back', 'voth_arcologies',
        [dpad, quiv, shaft, hk],
    )
    return [head, torso, gloves, legs, feet, back]


def _build_aux_scyvoi_outrider(s):
    """23. Scyvoi Auxiliary (Drum Frontier Paid Nomad / Lizard-Rider Levy)."""
    p_lam = P('soot', 0.04, [
        B('bottom', 0.0, 0.075, 'arc_scyvoi_khilat', 'vth_tzungold', 'soot'),
        B('top', 0.0, 0.025, 'solid', 'vth_oldbrass'),
    ], [
        PN(0.0, 1.0, 'scyvoi_ebon_lamellar', 'vth_oldbrass', 'soot', 0.20),
    ], fabric='armor.lamellar.rawhide')
    p_tamga = P('saddle', 0.05, [
        B('bottom', 0.0, 0.055, 'scyvoi_borunsa_tamga', 'cream', 'saddle'),
    ], [
        PN(0.0, 1.0, 'scyvoi_borunsa_tamga', 'soot', 'saddle', 0.22),
    ], fabric='cloth.felt.boiled')
    p_fur = P('darkfur', 0.06, fabric='fur.wolf')
    p_khilat = P('vth_blitrit', 0.03, [
        B('bottom', 0.0, 0.045, 'vth_ott_kemha', 'vth_tzungold', 'vth_blitrit'),
    ], [
        PN(0.0, 1.0, 'vth_blitrit_diamond', 'vth_tzungold', 'vth_blitrit', 0.18),
    ], fabric='cloth.silk')
    p_brass = _p_metal('vth_tzungold', 'vth_blitrit', 'metal.gold')

    # Head: Pointed Scyvoi malakhai fur-and-leather riding cap + brass Vothic diamond cockade
    cone = tower_hat(f'arc_{s}_scy_cone', 0.20, lambda u: max(0.08, 1.0 - 0.85 * (u ** 1.15)), p_tamga, f=0.63, ease=0.015, rows=12, n=36)
    fur_brim = crown_band(f'arc_{s}_scy_fbrim', p_fur, f0=0.58, f1=0.71, ease=0.018, flare=0.008, rows=5, n=36)
    nape = _vth_cranial_shell(f'arc_{s}_scy_nape', p_fur, f_top=0.75, f_bot=-0.06, ease=0.016)
    a, b, up, bk, left = head_frame()
    p_ck, _ = _snap_on_part(fur_brim, a + (b - a) * 0.65 - bk * 0.12, out_push=0.004)
    cockade = rosette(f'arc_{s}_scy_cockade', p_ck, -bk, left, 0.024, p_brass, n=4, thick=0.010, rigid_joint='Head')
    head = _vth_assemble(
        f'arc_{s}_scyvoi_malakhai', 'Scyvoi Fur Malakhai Cap w/ Brass Vothic Diamond Cockade', 'head', 'voth_arcologies',
        [nape, cone, fur_brim, cockade], covers_hair=True,
    )

    # Torso: Sculpted ebon-iron Scyvoi lamellar cuirass + gorget + articulated left pauldron + purple-and-gold khilat
    p_lam_metal = P('soot', 0.04, [
        B('bottom', 0.0, 0.040, 'arc_scyvoi_khilat', 'vth_tzungold', 'soot'),
        B('top', 0.0, 0.022, 'solid', 'vth_oldbrass'),
    ], [
        PN(0.0, 1.0, 'scyvoi_ebon_lamellar', 'vth_oldbrass', 'soot', 0.20),
    ], fabric='metal.iron')
    cuir_parts = cuirass_plate(f'arc_{s}_scy_coat', p_lam_metal, trim_paint=p_brass,
                               style='lamellar', faulds=3, ease=0.024)
    gorg = gorget_guard(f'arc_{s}_scy_gorg', p_lam_metal, trim_paint=p_brass, ease=0.024)
    paul_l = articulated_pauldron(f'arc_{s}_scy_pL', L, p_lam_metal, trim_paint=p_brass,
                                  lames=3, haute_piece=False, ease=0.023)
    slv = sleeves(f'arc_{s}_scy', 'wrist', 0.018, p_tamga, rows=10)
    khilat = crossed_sash(f'arc_{s}_scy_khilat', p_khilat, width=0.072, ease=0.034)
    belt = belt_sash(f'arc_{s}_scy_belt', core.WAIST - 0.018, core.WAIST + 0.028, p_khilat, ease=0.035)
    torso = _vth_assemble(
        f'arc_{s}_scyvoi_lamellar', 'Scyvoi Sculpted Ebon-Lamellar Cuirass & Vothic Khilat Shawl', 'torso', 'voth_arcologies',
        [cuir_parts, gorg, paul_l, slv, khilat, belt],
    )

    # Gloves: Horsehide & horn steppe archer bracers
    gloves = _vth_assemble(
        f'arc_{s}_scyvoi_bracers', 'Horsehide & Horn Scyvoi Archer Bracers', 'gloves', 'voth_arcologies',
        full_gloves(f'arc_{s}_scy_gv', p_lam, P('leather', 0.05), knuckle_paint=p_brass),
    )

    # Legs: Steppe horsehide riding trousers (`ease=0.014, bag=0.008` under lamellar coat)
    legs = _vth_assemble(
        f'arc_{s}_scyvoi_trousers', 'Scyvoi Steppe Horsehide Riding Trousers', 'legs', 'voth_arcologies',
        trousers(f'arc_{s}_scy_tr', p_tamga, ease=0.014, bag=0.008),
        legged=True,
    )

    # Feet: Upturned Scyvoi felt-and-leather riding boots
    feet = _vth_assemble(
        f'arc_{s}_scyvoi_boots', 'Upturned Scyvoi Felt-and-Leather Riding Boots', 'feet', 'voth_arcologies',
        boots(f'arc_{s}_scy_bt', P('soot', 0.08), p_tamga, top=0.52, cuff_paint=p_fur),
    )

    # Back: Curved Scyvoi bowcase (gorytos) & bronze-tipped lizard-goad quiver on Spine2 mount
    bp, dpad = _dorsal_pad(f'arc_{s}_scy_bk', p_tamga)
    gorytos = blob(f'arc_{s}_scy_gorytos', bp + np.array([-0.035, 0.045, 0.0]), (0.115, 0.058, 0.245),
                   p_tamga, n=10, rows=6, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2')
    bow_tip = horn(f'arc_{s}_scy_bowtip', [
        bp + np.array([-0.035, 0.048, 0.10]),
        bp + np.array([-0.065, 0.052, 0.21]),
        bp + np.array([-0.025, 0.055, 0.28]),
    ], 0.013, 0.004, _p_bonepaste('ivory', 'vth_oldbrass'), n=8, rows=7, rigid_joint='Spine2')
    goad = tube(f'arc_{s}_scy_goad', [bp + np.array([0.052, 0.042, -0.14]), bp + np.array([0.068, 0.046, 0.24])], 0.010, p_brass, n=6, rigid_joint='Spine2')
    back = _vth_assemble(
        f'arc_{s}_scyvoi_gorytos', 'Scyvoi Borunsa Bowcase (Gorytos) & Lizard-Goad Quiver', 'back', 'voth_arcologies',
        [dpad, gorytos, bow_tip, goad],
    )
    return [head, torso, gloves, legs, feet, back]


# ===========================================================================================================
# ROSTER ENTRIES (`chichani` & `voth_arcologies`), MANIFEST BUILDER & SELF-VERIFICATION
# ===========================================================================================================
CHICHANI_TIER_SHARES = [
    ['shim_reedcutter', 0.14],
    ['driyan_clan_elder', 0.06],
    ['azoth_dres_overseer', 0.06],
    ['azoth_march_warden', 0.07],
    ['heartland_fire_cantor', 0.05],
    ['heartland_sipahi', 0.07],
    ['voth_canton_citizen', 0.14],
    ['almua_port_factor', 0.07],
    ['zeydanin_colonist', 0.06],
    ['voth_palace_pasha', 0.05],
    ['caldera_scout', 0.07],
    ['chosen_janissary', 0.06],
    ['temple_ordinator', 0.05],
    ['sun_high_priest', 0.03],
    ['grey_penitent', 0.02],
    ['tzintzun_sovereign', 0.0],
]

CHICHANI_TIER_LABELS = {
    'shim_reedcutter': 'Shim Blïtrit Dye-Vat & Chinampa Peasant',
    'driyan_clan_elder': 'Driyan Kingsmoot Patrician & Shumari-Script Archivist',
    'azoth_dres_overseer': 'Azoth (Dres-Style) Blïtrit Estate Master & Slave-Taker',
    'azoth_march_warden': 'Azoth Shumar/Dalab Borderland Marcher-Warrior',
    'heartland_fire_cantor': 'Old Heartland Archaic Solstice Cantor & Sacrificer',
    'heartland_sipahi': 'Shim / Driyan Old-Style Ichcahuipilli Retainer',
    'voth_canton_citizen': 'Voth Causeway Artisan & Canal Guildsman',
    'almua_port_factor': 'Almua & Temora Arsenal & Spice-Port Purser',
    'zeydanin_colonist': "Zey'danin Throne-Gate Settler & Ranj Planter",
    'voth_palace_pasha': 'Voth Palace-Canton Patrician / Pasha',
    'caldera_scout': 'Inner Crater Ash-Waste Outrider & Secret-Police Hound',
    'chosen_janissary': 'Chosen of Tzintzun Solar Janissary Guard',
    'temple_ordinator': 'Temple Ordinator & Secret Police (Golden Ancestor War-Mask)',
    'sun_high_priest': 'Temple Canton Crimson-and-Gold High Hierophant',
    'grey_penitent': 'Temple Canton Ash-Smeared Grey Penitent Flagellant',
    'tzintzun_sovereign': 'Tzintzun, Undying Son of the Sun (Sovereign Regalia)',
}

ARC_TIER_SHARES = [
    ['drum_fin_rigger', 0.22],
    ['torus_ring_terracer', 0.24],
    ['arcology_client_chief', 0.06],
    ['scrap_vothic_militia', 0.18],
    ['scrap_vothic_enforcer', 0.10],
    ['aux_islander_marine', 0.10],
    ['aux_scyvoi_outrider', 0.10],
]

ARC_TIER_LABELS = {
    'drum_fin_rigger': 'Drum (Vinvolk) Sky-Gate Hoistman & Concrete-Fin Rigger',
    'torus_ring_terracer': 'Torus (Rinkvolk) Forest-Ring Orchardist & Granary Miller',
    'arcology_client_chief': 'Drïm / Tors Court-Hall Client Chief',
    'scrap_vothic_militia': 'Drum / Torus Tyre-Rampart "Scrap-Ordinator" Watch',
    'scrap_vothic_enforcer': "Drïm Chief's Sky-Gate Heavy Shock-Guard",
    'aux_islander_marine': 'Islander Auxiliary (Hetānini / Almua Bireme Marine)',
    'aux_scyvoi_outrider': 'Scyvoi Auxiliary (Drum Frontier Paid Nomad Levy)',
}


def _chichani_outfits_for_sex(s):
    return {
        # Pillar I — Old-Style Heartland (Shim / Driyan / Azoth)
        'shim_reedcutter': {
            'head': f'vth_{s}_shim_sunring',
            'torso': f'vth_{s}_shim_tilmatli',
            'gloves': f'vth_{s}_shim_reed_wraps',
            'legs': f'vth_{s}_shim_cueitl',
            'feet': f'vth_{s}_shim_sandals',
            'back': f'vth_{s}_shim_reed_basket',
            'region': 'heartland',
        },
        'driyan_clan_elder': {
            'head': f'vth_{s}_driyan_kafesi',
            'torso': f'vth_{s}_driyan_entari',
            'gloves': f'vth_{s}_driyan_bracers',
            'legs': f'vth_{s}_driyan_salvar',
            'feet': f'vth_{s}_driyan_yemeni',
            'back': f'vth_{s}_driyan_scroll_case',
            'region': 'heartland',
        },
        'azoth_dres_overseer': {
            'head': f'vth_{s}_azoth_dres_cowl',
            'torso': f'vth_{s}_azoth_overseer_corselet',
            'gloves': f'vth_{s}_azoth_whip_gauntlets',
            'legs': f'vth_{s}_azoth_estate_salvar',
            'feet': f'vth_{s}_azoth_stalker_boots',
            'back': f'vth_{s}_azoth_manacle_rack',
            'beard': None,
            'region': 'heartland',
        },
        'azoth_march_warden': {
            'head': f'vth_{s}_azoth_warden_casque',
            'torso': f'vth_{s}_azoth_warden_ichca',
            'gloves': f'vth_{s}_azoth_warden_vambraces',
            'legs': f'vth_{s}_azoth_warden_breeches',
            'feet': f'vth_{s}_azoth_warden_boots',
            'back': f'vth_{s}_azoth_javelin_chimalli',
            'region': 'heartland',
        },
        'heartland_fire_cantor': {
            'head': f'vth_{s}_cantor_skull_mitre',
            'torso': f'vth_{s}_cantor_dalmatic',
            'gloves': f'vth_{s}_cantor_scripture_wraps',
            'legs': f'vth_{s}_cantor_skirt',
            'feet': f'vth_{s}_cantor_sandals',
            'back': f'vth_{s}_cantor_brazier_rack',
            'beard': None,
            'region': 'heartland',
        },
        'heartland_sipahi': {
            'head': f'vth_{s}_sipahi_kettle_helm',
            'torso': f'vth_{s}_sipahi_ichcahuipilli',
            'gloves': f'vth_{s}_sipahi_vambraces',
            'legs': f'vth_{s}_sipahi_breeches',
            'feet': f'vth_{s}_sipahi_greave_sandals',
            'back': f'vth_{s}_sipahi_chimalli',
            'region': 'heartland',
        },
        # Pillar II — Inner Crater & Imperial Capital (Voth / Almua / Zey'danin / Temple)
        'voth_canton_citizen': {
            'head': f'vth_{s}_citizen_fez_kavuk',
            'torso': f'vth_{s}_citizen_dolama',
            'gloves': f'vth_{s}_citizen_cuffs',
            'legs': f'vth_{s}_citizen_salvar',
            'feet': f'vth_{s}_citizen_yemeni',
            'back': f'vth_{s}_citizen_satchel',
            'region': 'inner_crater',
        },
        'almua_port_factor': {
            'head': f'vth_{s}_almua_mariner_bork',
            'torso': f'vth_{s}_almua_kaftan',
            'gloves': f'vth_{s}_almua_rigger_cuffs',
            'legs': f'vth_{s}_almua_salvar',
            'feet': f'vth_{s}_almua_harbour_boots',
            'back': f'vth_{s}_almua_chart_case',
            'region': 'inner_crater',
        },
        'zeydanin_colonist': {
            'head': f'vth_{s}_zeydanin_goggle_kavuk',
            'torso': f'vth_{s}_zeydanin_mantle_entari',
            'gloves': f'vth_{s}_zeydanin_gauntlets',
            'legs': f'vth_{s}_zeydanin_salvar',
            'feet': f'vth_{s}_zeydanin_boots',
            'back': f'vth_{s}_zeydanin_ranj_pack',
            'beard': None,
            'region': 'inner_crater',
        },
        'voth_palace_pasha': {
            'head': f'vth_{s}_pasha_kavuk',
            'torso': f'vth_{s}_pasha_kemha_kaftan',
            'gloves': f'vth_{s}_pasha_ring_cuffs',
            'legs': f'vth_{s}_pasha_salvar',
            'feet': f'vth_{s}_pasha_court_boots',
            'back': f'vth_{s}_pasha_silk_mantle',
            'region': 'inner_crater',
        },
        'caldera_scout': {
            'head': f'vth_{s}_scout_ash_cowl',
            'torso': f'vth_{s}_scout_brigandine',
            'gloves': f'vth_{s}_scout_gloves',
            'legs': f'vth_{s}_scout_salvar',
            'feet': f'vth_{s}_scout_boots',
            'back': f'vth_{s}_scout_quiver_pack',
            'beard': None,
            'region': 'inner_crater',
        },
        'chosen_janissary': {
            'head': f'vth_{s}_janissary_bork',
            'torso': f'vth_{s}_janissary_dolama',
            'gloves': f'vth_{s}_janissary_vambraces',
            'legs': f'vth_{s}_janissary_salvar',
            'feet': f'vth_{s}_janissary_boots',
            'back': f'vth_{s}_janissary_tug_pennon',
            'region': 'temple_core',
        },
        'temple_ordinator': {
            'head': f'vth_{s}_ordinator_war_mask',
            'torso': f'vth_{s}_ordinator_cuirass',
            'gloves': f'vth_{s}_ordinator_gauntlets',
            'legs': f'vth_{s}_ordinator_tassets',
            'feet': f'vth_{s}_ordinator_greaves',
            'back': f'vth_{s}_ordinator_halo_seal',
            'beard': None,
            'region': 'temple_core',
        },
        'sun_high_priest': {
            'head': f'vth_{s}_priest_solar_mitre',
            'torso': f'vth_{s}_priest_vestment',
            'gloves': f'vth_{s}_priest_cuffs',
            'legs': f'vth_{s}_priest_underrobe',
            'feet': f'vth_{s}_priest_calcei',
            'back': f'vth_{s}_priest_sun_arch',
            'region': 'temple_core',
        },
        'grey_penitent': {
            'head': f'vth_{s}_penitent_hood',
            'torso': f'vth_{s}_penitent_sackcloth',
            'gloves': f'vth_{s}_penitent_shackles',
            'legs': f'vth_{s}_penitent_breeches',
            'feet': f'vth_{s}_penitent_sandals',
            'back': f'vth_{s}_penitent_chain_wheel',
            'beard': None,
            'region': 'temple_core',
        },
        'tzintzun_sovereign': {
            'head': f'voth_{s}_tzintzun_mask',
            'torso': f'vth_{s}_tzintzun_sovereign_robe',
            'gloves': f'voth_{s}_tzintzun_gloves',
            'legs': f'voth_{s}_tzintzun_pants',
            'feet': f'voth_{s}_tzintzun_boots',
            'back': f'vth_{s}_tzintzun_sun_halo',
            'hair': None,
            'beard': None,
            'type': 'important_npc',
            'region': 'temple_core',
        },
    }


def _arc_outfits_for_sex(s):
    return {
        'drum_fin_rigger': {
            'head': f'arc_{s}_rigger_bumpcap',
            'torso': f'arc_{s}_rigger_jerkin',
            'gloves': f'arc_{s}_rigger_mitts',
            'legs': f'arc_{s}_rigger_trousers',
            'feet': f'arc_{s}_rigger_boots',
            'back': f'arc_{s}_rigger_cable_rig',
            'region': 'arcology_civilian',
        },
        'torus_ring_terracer': {
            'head': f'arc_{s}_terracer_sunhat',
            'torso': f'arc_{s}_terracer_tunic',
            'gloves': f'arc_{s}_terracer_wraps',
            'legs': f'arc_{s}_terracer_breeches',
            'feet': f'arc_{s}_terracer_clogs',
            'back': f'arc_{s}_terracer_basket',
            'region': 'arcology_civilian',
        },
        'arcology_client_chief': {
            'head': f'arc_{s}_chief_circlet',
            'torso': f'arc_{s}_chief_coat',
            'gloves': f'arc_{s}_chief_bracers',
            'legs': f'arc_{s}_chief_breeches',
            'feet': f'arc_{s}_chief_boots',
            'back': f'arc_{s}_chief_louver_mantle',
            'region': 'arcology_civilian',
        },
        'scrap_vothic_militia': {
            'head': f'arc_{s}_scrap_ordinator_helm',
            'torso': f'arc_{s}_scrap_ichca_vest',
            'gloves': f'arc_{s}_scrap_bracers',
            'legs': f'arc_{s}_scrap_leathers',
            'feet': f'arc_{s}_scrap_boots',
            'back': f'arc_{s}_scrap_chimalli',
            'beard': None,
            'region': 'scrap_vothic',
        },
        'scrap_vothic_enforcer': {
            'head': f'arc_{s}_scrap_bork_helm',
            'torso': f'arc_{s}_scrap_enforcer_harness',
            'gloves': f'arc_{s}_scrap_gauntlets',
            'legs': f'arc_{s}_scrap_tasset_breeches',
            'feet': f'arc_{s}_scrap_shin_boots',
            'back': f'arc_{s}_scrap_banner_rig',
            'beard': None,
            'region': 'scrap_vothic',
        },
        'aux_islander_marine': {
            'head': f'arc_{s}_islander_casque',
            'torso': f'arc_{s}_islander_corslet',
            'gloves': f'arc_{s}_islander_wristguards',
            'legs': f'arc_{s}_islander_malo_kilt',
            'feet': f'arc_{s}_islander_sandals',
            'back': f'arc_{s}_islander_hook_quiver',
            'region': 'crown_auxiliary',
        },
        'aux_scyvoi_outrider': {
            'head': f'arc_{s}_scyvoi_malakhai',
            'torso': f'arc_{s}_scyvoi_lamellar',
            'gloves': f'arc_{s}_scyvoi_bracers',
            'legs': f'arc_{s}_scyvoi_trousers',
            'feet': f'arc_{s}_scyvoi_boots',
            'back': f'arc_{s}_scyvoi_gorytos',
            'region': 'crown_auxiliary',
        },
    }


def build_chichani_peoples_entry():
    return {
        'id': 'chichani',
        'name': 'Chichani · Vothic Kingdom',
        'note': (
            "Voth's ruling people (Tzintzuntzan — LORE.md §6.12): ashen-brown to ashen-grey skin, "
            "dark hair, amber-crimson eyes; equal ⅓ Mesoamerican + ⅓ Classical Ottoman + ⅓ Morrowind "
            "Dunmer synthesis (strictly non-chitin architectural ash-resin & calcined bone-paste armor). "
            "Spans Old-Style Heartland Shim/Driyan/Azoth (including Azoth's House-Dres Blïtrit slave-estates "
            "& Shumar/Dalab marcher-wardens) and New Inner-Crater Voth/Almua/Zey'danin/Temple Canton "
            "(Ordinators, Solar Janissaries, High Priests, Grey Penitents, and Sovereign Tzintzun; "
            "16 tiers at 100% M/F parity; tools/garments/cultures/vothic.py)."
        ),
        'ancestry': {
            'african': [0.15, 0.35],
            'asian': [0.35, 0.60],
            'caucasian': [0.15, 0.35],
        },
        'skin': ['#9a8c82', '#857669', '#6e6158', '#5a4f49'],
        'hair': ['#16120f', '#221a15', '#2c221b', '#3a2d24'],
        'eyes': ['#8a3a1c', '#a0521c', '#6b2a18', '#3b2414'],
        'grey': 0.55,
        'beard': 0.15,
        'morph': {
            'cheek-bones-decr-incr': [0.1, 0.6],
            'eye-eyefold-angle-down-up': [0.0, 0.5],
            'nose-hump-decr-incr': [0.0, 0.6],
        },
        'styles': {
            'male': [
                'short02', 'long01', 'ponytail01', 'braid01',
                'culturalibre_hair_02', 'punkduck_alpha7_long',
                'fourstrandbraid', 'Low_Fade',
            ],
            'female': [
                'braid01', 'long01', 'ponytail01', 'elvs_double_mh_braid',
                'o4saken_long01', 'rehmanpolanski_hair_bun_brown',
                'brunhilde', 'fourstrandbraid', 'elvs_braid_bun',
            ],
        },
        'tiers': CHICHANI_TIER_SHARES,
        'tier_labels': CHICHANI_TIER_LABELS,
        'outfits': {
            'male': _chichani_outfits_for_sex('m'),
            'female': _chichani_outfits_for_sex('f'),
        },
    }


def build_voth_arcologies_peoples_entry():
    return {
        'id': 'voth_arcologies',
        'name': 'Drum & Torus · Twin Arcologies & Auxiliaries',
        'note': (
            'Subject arcology chiefdoms of Drum (Vinvolk) & Torus (Rinkvolk) plus Vothic Crown Auxiliaries '
            '(settlements/drum/PLAN.md, settlements/torus/PLAN.md, LORE.md §6.12): unassimilated reclaimed-Ancient '
            'canvas riggers, Forest-Ring orchard terracers, and collaborating client chiefs bearing reluctant '
            'tax-tallies; Mad Max / Fallout "Scrap-Vothic" tyre-tread & welded road-plate militias painted with '
            'dripping ash-white Vothic diamonds; and Hetānini Islander bireme marines + Scyvoi frontier outriders '
            'in Vothic purple service sashes (7 tiers at 100% M/F parity; tools/garments/cultures/vothic.py).'
        ),
        'ancestry': {
            'african': [0.15, 0.40],
            'asian': [0.20, 0.50],
            'caucasian': [0.25, 0.60],
        },
        'skin': ['#d6b08c', '#ba8f69', '#9a714f', '#7d593d'],
        'hair': ['#14100d', '#241b15', '#3b2b1e', '#59402b'],
        'eyes': ['#2a1a10', '#3b2414', '#5a3a22', '#4e6a80'],
        'grey': 0.48,
        'beard': 0.40,
        'morph': {
            'muscle': [0.05, 0.55],
            'weight': [-0.15, 0.30],
        },
        'styles': {
            'male': [
                'short02', 'long01', 'ponytail01', 'braid01',
                'Short_Hair_B', 'Low_Fade', 'fourstrandbraid',
            ],
            'female': [
                'braid01', 'long01', 'ponytail01', 'elvs_double_mh_braid',
                'elvs_braid_bun', 'fourstrandbraid', 'bob02',
            ],
        },
        'tiers': ARC_TIER_SHARES,
        'tier_labels': ARC_TIER_LABELS,
        'outfits': {
            'male': _arc_outfits_for_sex('m'),
            'female': _arc_outfits_for_sex('f'),
        },
    }


def build_vothic_kit():
    """Compile all 268 procedural pieces across `mpfb_male` and `mpfb_female` inside `vothic_motif_scope()`."""
    builders = [
        # Pillar I — Heartland Chichani
        _build_shim_reedcutter,
        _build_driyan_clan_elder,
        _build_azoth_dres_overseer,
        _build_azoth_march_warden,
        _build_heartland_fire_cantor,
        _build_heartland_sipahi,
        # Pillar II — Inner Crater & Temple Core Chichani
        _build_voth_canton_citizen,
        _build_almua_port_factor,
        _build_zeydanin_colonist,
        _build_voth_palace_pasha,
        _build_caldera_scout,
        _build_chosen_janissary,
        _build_temple_ordinator,
        _build_sun_high_priest,
        _build_grey_penitent,
        _build_tzintzun_sovereign_new_pieces,
        # Pillar III & IV — Twin Arcologies & Crown Auxiliaries
        _build_drum_fin_rigger,
        _build_torus_ring_terracer,
        _build_arcology_client_chief,
        _build_scrap_vothic_militia,
        _build_scrap_vothic_enforcer,
        _build_aux_islander_marine,
        _build_aux_scyvoi_outrider,
    ]
    entries = []
    with vothic_motif_scope():
        for body_id, sex in (('mpfb_male', 'm'), ('mpfb_female', 'f')):
            set_body(body_id)
            for fn in builders:
                entries.extend(fn(sex))
    return entries


def _read_glb_pos_tris(glb_path: Path):
    d = glb_path.read_bytes()
    ln = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20 + ln])
    off = 20 + ln
    bl = struct.unpack('<I', d[off:off + 4])[0]
    b = d[off + 8:off + 8 + bl]
    nd = next(n for n in j['nodes'] if 'mesh' in n)
    pr = j['meshes'][nd['mesh']]['primitives'][0]
    P_arr = glbio.accessor(j, b, pr['attributes']['POSITION']).astype(np.float64)
    T_arr = glbio.accessor(j, b, pr['indices']).reshape(-1, 3)
    return j, b, nd, pr, P_arr, T_arr


def _mesh_components(n_verts, tris):
    re_i = np.concatenate([tris[:, 0], tris[:, 1], tris[:, 2]])
    ce_i = np.concatenate([tris[:, 1], tris[:, 2], tris[:, 0]])
    adj = csr_matrix((np.ones(len(re_i), dtype=np.int8), (re_i, ce_i)), shape=(n_verts, n_verts))
    n_comp, labels = connected_components(adj, directed=False)
    order = np.argsort(labels, kind='mergesort')
    counts = np.bincount(labels, minlength=n_comp)
    splits = np.cumsum(counts)[:-1]
    return [grp for grp in np.split(order, splits) if len(grp) > 1]


def _dense_samples(P_arr, T_arr):
    if not len(T_arr):
        return P_arr
    va, vb, vc = P_arr[T_arr[:, 0]], P_arr[T_arr[:, 1]], P_arr[T_arr[:, 2]]
    return np.vstack([
        P_arr,
        (va + vb + vc) / 3.0,
        0.5 * (va + vb), 0.5 * (vb + vc), 0.5 * (vc + va),
        0.6 * va + 0.2 * vb + 0.2 * vc,
        0.2 * va + 0.6 * vb + 0.2 * vc,
        0.2 * va + 0.2 * vb + 0.6 * vc,
    ])


def _self_verify(kit_entries, cultures_dict):
    """Comprehensive self-verification check across all 268 pieces and 23 tiers."""
    # 1. Verify peoples.json schema & exact 1.00 tier shares
    for cid, p_ent in cultures_dict.items():
        assert p_ent['id'] == cid
        for k in ('skin', 'hair', 'eyes'):
            vals = p_ent.get(k)
            assert isinstance(vals, list) and vals and all(isinstance(x, str) and x.startswith('#') for x in vals), (
                f'{cid}.{k} must be non-empty flat hex list!'
            )
        assert 'ancestry' in p_ent and set(p_ent['ancestry'].keys()) == {'african', 'asian', 'caucasian'}
        assert 'styles' in p_ent and 'male' in p_ent['styles'] and 'female' in p_ent['styles']
        sh_sum = sum(sh for tid, sh in p_ent['tiers'] if sh > 0.0)
        assert abs(sh_sum - 1.0) < 1e-9, f'{cid} tier shares sum to {sh_sum}, expected 1.00'
        m_keys = set(p_ent['outfits']['male'].keys())
        f_keys = set(p_ent['outfits']['female'].keys())
        assert m_keys == f_keys, f'{cid} M/F outfit parity mismatch: {m_keys ^ f_keys}'

    assert len(cultures_dict['chichani']['outfits']['male']) == 16
    assert len(cultures_dict['voth_arcologies']['outfits']['male']) == 7

    # 2. Index compiled kit_entries + existing Meshy tzintzun pieces
    by_body_id = {}
    for ent in kit_entries:
        b_id = ent.get('_body')
        gid = ent.get('id')
        assert b_id in ('mpfb_male', 'mpfb_female'), f'Invalid _body on {gid}'
        assert ent.get('culture') in ('chichani', 'voth_arcologies'), f'Invalid culture on {gid}: {ent.get("culture")}'
        key = (b_id, gid)
        assert key not in by_body_id, f'Duplicate kit entry: {key}'
        by_body_id[key] = ent

    existing_kits = {
        b_id: {it['id']: it for it in json.loads((ROOT / 'data' / b_id / 'kit.json').read_text(encoding='utf-8'))['items']}
        for b_id in ('mpfb_male', 'mpfb_female')
    }

    # Verify every outfit slot resolves to a valid GLB + .morph.bin
    for cid, p_ent in cultures_dict.items():
        for sex_key, body_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
            for tid, spec in p_ent['outfits'][sex_key].items():
                for req in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                    assert req in spec, f'{cid}.{sex_key}.{tid} missing {req}'
                    pid = spec[req]
                    if (body_id, pid) in by_body_id:
                        ent = by_body_id[(body_id, pid)]
                    else:
                        assert pid in existing_kits[body_id], f'Reused piece {pid} missing from {body_id}/kit.json!'
                        ent = existing_kits[body_id][pid]
                    assert ent['slot'] == req, f'Slot mismatch on {pid}: {ent["slot"]} != {req}'
                    glb_p = ROOT / ent['glb']
                    morph_p = glb_p.with_suffix('.morph.bin')
                    assert glb_p.exists() and glb_p.stat().st_size > 500, f'Missing/empty GLB: {glb_p}'
                    assert morph_p.exists() and morph_p.stat().st_size > 100, f'Missing/empty morph: {morph_p}'

    # 3. Geometry & Physics Audit on all 268 newly compiled GLBs (rigid skirts, <= 18mm islands, sandal hides, headband hover)
    max_island_mm = 0.0
    for body_id in ('mpfb_male', 'mpfb_female'):
        set_body(body_id)
        y_crotch = float(core.RIG.jpos[core.RIG.J['LeftUpLeg']][1])
        y_head = float(core.RIG.jpos[core.RIG.J['Head']][1])
        _, _, _, _, BP, BT = _read_glb_pos_tris(ROOT / 'pieces' / body_id / 'base.glb')
        body_dense = _dense_samples(BP, BT)
        body_tree = cKDTree(body_dense)
        skull_tree = cKDTree(body_dense[body_dense[:, 1] >= y_head - 0.04])

        for (b_id, gid), ent in by_body_id.items():
            if b_id != body_id:
                continue
            j, b, nd, pr, P_arr, T_arr = _read_glb_pos_tris(ROOT / ent['glb'])
            slot = ent['slot']

            # Rigid skirt check
            if slot == 'torso':
                min_y = float(P_arr[:, 1].min())
                assert not (min_y < y_crotch - 0.065 and 'cloth' not in ent), (
                    f'{body_id}/{gid} hangs below crotch without cloth!'
                )

            # Open sandal check
            if slot == 'feet' and 'sandal' in gid:
                assert ent.get('hides', 0) <= 40, f'{body_id}/{gid} sandal hides {ent.get("hides")} > 40 tris!'

            # Bare-head headband skull clearance (< 12mm)
            if slot == 'head' and not ent.get('covers_hair', False):
                d_sk, _ = skull_tree.query(P_arr)
                med_mm = float(np.median(d_sk)) * 1000.0
                assert med_mm <= 12.0, f'{body_id}/{gid} bare-head band hovers {med_mm:.1f}mm (>12.0mm)!'

            # Disconnected island check (<= 18.0mm)
            comps = _mesh_components(len(P_arr), T_arr)
            if len(comps) >= 2:
                has_cloth_v = np.zeros(len(P_arr), dtype=bool)
                if 'skin' in nd and 'JOINTS_0' in pr['attributes']:
                    sk = j['skins'][nd['skin']]
                    rnames = [j['nodes'][k].get('name', '') for k in sk['joints']]
                    cj = [idx for idx, nm in enumerate(rnames) if nm.startswith(('c_', 'cloth:'))]
                    if cj:
                        JJ = glbio.accessor(j, b, pr['attributes']['JOINTS_0'])
                        WW = glbio.accessor(j, b, pr['attributes']['WEIGHTS_0'])
                        has_cloth_v = (np.isin(JJ, cj) & (WW > 0.02)).any(axis=1)
                max_len = max(len(c) for c in comps)
                for comp in comps:
                    if len(comp) == max_len or len(comp) > 280 or has_cloth_v[comp].any():
                        continue
                    cp_chk = P_arr[comp]
                    d_body = float(body_tree.query(cp_chk)[0].min())
                    other_v = np.ones(len(P_arr), dtype=bool)
                    other_v[comp] = False
                    other_t = other_v[T_arr].all(axis=1)
                    ref_dense = _dense_samples(P_arr[other_v], np.zeros((0, 3), dtype=int))
                    if other_t.any():
                        ref_dense = np.vstack([P_arr[other_v], _dense_samples(P_arr, T_arr[other_t])])
                    d_garm = float(cKDTree(ref_dense).query(cp_chk)[0].min())
                    d_min_mm = min(d_body, d_garm) * 1000.0
                    max_island_mm = max(max_island_mm, d_min_mm)
                    assert d_min_mm <= 18.0, (
                        f'{body_id}/{gid} disconnected component ({len(comp)}v) floats {d_min_mm:.2f}mm (>18.0mm)!'
                    )

    print(f'[SELF-VERIFY PASS] All {len(kit_entries)} pieces & 23 M/F tiers verified (max island gap: {max_island_mm:.2f}mm <= 18.0mm).')


def main():
    t0 = time.perf_counter()
    kit_entries = build_vothic_kit()
    cultures_dict = {
        'chichani': build_chichani_peoples_entry(),
        'voth_arcologies': build_voth_arcologies_peoples_entry(),
    }
    _self_verify(kit_entries, cultures_dict)

    manifest_path = CULTURES_DIR / 'vothic_manifest.json'
    manifest_data = {
        'cultures': cultures_dict,
        'kit_entries': kit_entries,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Vothic & Arcology pieces ({n_m} male, {n_f} female) in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
