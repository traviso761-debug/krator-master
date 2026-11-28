"""Cross-Cutting Environmental Hazmat, Salvage Divers, Cryo-Sleepers & Civic Trades Kit (`hazmat_and_trades`).

Builds all 14 M+F paired Hazmat, Cryo-Vault & Universal `44`-Trade Civic Worker tiers
(`mpfb_male` `hzm_m_*` & `mpfb_female` `hzm_f_*`):

Environmental, Barometric, Ruin-Anomaly, Diving & Cryo Tiers (`0.42` subtotal):
  1. `hypobaric_pass_rebreather` (`0.06`) — High-Pass Hypobaric Bellows-Rebreather Suit (`0.48–0.65 atm`)
  2. `valley_rad_delver`         (`0.07`) — Ancient's Valley Faraday & Leaded-Glass Anomaly Delver
  3. `fumarole_acid_suit`        (`0.06`) — Boiling-Bay / Throne `pH 2.5` Acid-Fumarole Oilskin Suit
  4. `blade_plague_doctor`       (`0.06`) — `Blade` Biogel-Quarantine Beaked Plague-Physician
  5. `copper_hardhat_diver`      (`0.06`) — `Tethis` / `Dorado` 12-Bolt Copper Hard-Hat Salvage Diver
  6. `cryo_vault_sleeper`        (`0.05`) — Newly Thawed Ancient Cryo-Vault Stasis Sleeper
  7. `tattered_stasis_survivor`  (`0.06`) — Breached-Pod Foil-Wrapped Stasis Survivor

Universal `44`-Trade Civic Worker Overlay Tiers (`0.58` subtotal, `total = 1.00`):
  8. `town_blacksmith`           (`0.10`) — Scorched Foundry-Pigskin Forge Blacksmith & Farrier
  9. `butcher_tanner`            (`0.08`) — Slaughterhouse Butcher & Alum-Lime Hide Tanner
 10. `guild_baker_brewer`        (`0.09`) — Flour-Dusted Guild Oven-Baker & Malt-Kettle Brewer
 11. `tavern_innkeeper`          (`0.09`) — Caravanserai Publican & Taproom Innkeeper
 12. `harbour_stevedore`         (`0.09`) — Quayside Bale-Hook Stevedore & Warehouse Porter
 13. `town_chirurgeon`           (`0.07`) — Civic Barber-Chirurgeon & Apothecary Healer
 14. `ossuary_undertaker`        (`0.06`) — Catacomb Ossuary Undertaker & Lime-Sexton

Run standalone in manifest-only mode:
    python -u tools/garments/cultures/hazmat_and_trades.py
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
from garments.paint import P, B, PN, C, WOOL, COTTON
from garments.types.torso import (
    torso_tube, collar, collar_disc, tabard, crossed_sash, pauldron,
)
from garments.types.limbs import sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_landmarks_exact, head_rings, sculpted_faceplate, hood, brim, tower_hat, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, pouch_belt, button_row, tube, rosette,
)

BACK_DIR = np.array([0.0, 1.0, 0.0], dtype=np.float64)

FULL_HEAD_HIDE_PARTS = [
    'Human.lips',
    'Human.ears',
    'Human.eyebrow001',
    'Human.eyebrow002',
    'Human.eyelashes01',
    'Human.eyelashes02',
    'Human.low-poly',
]

# Scoped Linear RGB Palette (`hzm_*`)
HZM_COLORS = {
    'hzm_pass_ochre':    (0.560, 0.385, 0.165),  # Waxed high-altitude pass canvas
    'hzm_bellows_brass': (0.735, 0.545, 0.195),  # Barometric rebreather brass
    'hzm_lead_slate':    (0.205, 0.225, 0.245),  # Oiled lead-lined Faraday weave
    'hzm_rad_amber':     (0.920, 0.520, 0.060),  # Leaded amber radiation-glass
    'hzm_dosimeter':     (0.180, 0.860, 0.720),  # Glowing Cherenkov/dosimeter teal
    'hzm_acid_sulphur':  (0.760, 0.640, 0.095),  # Vulcanized sulfur-proof yellow oilskin
    'hzm_tar_pitch':     (0.075, 0.072, 0.070),  # Acid-neutralizing coal-tar seam pitch
    'hzm_plague_wax':    (0.085, 0.080, 0.088),  # Carbolic-waxed Blade quarantine coat
    'hzm_plague_bone':   (0.840, 0.810, 0.735),  # Bleached herb-stuffed beak leather
    'hzm_quarantine_red':(0.580, 0.055, 0.065),  # Biogel quarantine cordon crimson
    'hzm_diver_copper':  (0.520, 0.195, 0.065),  # Hammered Tethis 12-bolt diving copper-bronze
    'hzm_diver_canvas':  (0.245, 0.315, 0.265),  # Heavy sea-olive waterproofed salvage-diver dress
    'hzm_cryo_white':    (0.895, 0.915, 0.935),  # Clean Ancient stasis-pod white elastomer
    'hzm_cryo_cyan':     (0.210, 0.790, 0.920),  # Cryo-biomonitor telemetry cyan
    'hzm_mylar_gold':    (0.865, 0.655, 0.145),  # Crinkled emergency stasis thermal foil
    'hzm_forge_pigskin': (0.285, 0.145, 0.080),  # Scorched foundry pigskin leather
    'hzm_ember_soot':    (0.125, 0.110, 0.105),  # Coal-forge clinker soot
    'hzm_butcher_ox':    (0.420, 0.065, 0.060),  # Slaughterhouse blood-and-alum stain
    'hzm_tanner_lime':   (0.790, 0.780, 0.715),  # Slaked hide-pit lime crust
    'hzm_flour_cream':   (0.925, 0.900, 0.835),  # Sieved wheat/barley flour-dusted linen
    'hzm_malt_amber':    (0.540, 0.310, 0.115),  # Roasted brewer's malt-kettle brown
    'hzm_tavern_wine':   (0.365, 0.065, 0.110),  # Publican burgundy waistcoat wool
    'hzm_chirurgeon_grn':(0.145, 0.335, 0.255),  # Boiled apothecary-chirurgeon clinical green
    'hzm_ossuary_ash':   (0.135, 0.130, 0.145),  # Catacomb sexton mourning wool
    'hzm_lens_void':     (0.016, 0.018, 0.024),  # Deep dark goggle/porthole ocular cavity
}
for _k, _v in HZM_COLORS.items():
    C.setdefault(_k, _v)

HAZMAT_TRADES_TIER_SHARES = [
    ['hypobaric_pass_rebreather', 0.06],
    ['valley_rad_delver', 0.07],
    ['fumarole_acid_suit', 0.06],
    ['blade_plague_doctor', 0.06],
    ['copper_hardhat_diver', 0.06],
    ['cryo_vault_sleeper', 0.05],
    ['tattered_stasis_survivor', 0.06],
    ['town_blacksmith', 0.10],
    ['butcher_tanner', 0.08],
    ['guild_baker_brewer', 0.09],
    ['tavern_innkeeper', 0.09],
    ['harbour_stevedore', 0.09],
    ['town_chirurgeon', 0.07],
    ['ossuary_undertaker', 0.06],
]

HAZMAT_TRADES_TIER_LABELS = {
    'hypobaric_pass_rebreather': 'High-Pass Hypobaric Bellows-Rebreather Suit',
    'valley_rad_delver': 'Valley Faraday & Lead-Glass Anomaly Delver',
    'fumarole_acid_suit': 'Fumarole pH 2.5 Acid-Rain Oilskin Suit',
    'blade_plague_doctor': 'Blade Biogel-Quarantine Plague Physician',
    'copper_hardhat_diver': 'Tethis 12-Bolt Copper Hard-Hat Salvage Diver',
    'cryo_vault_sleeper': 'Newly Thawed Cryo-Vault Stasis Sleeper',
    'tattered_stasis_survivor': 'Foil-Wrapped Tattered Stasis Survivor',
    'town_blacksmith': 'Scorched-Apron Town Blacksmith & Farrier',
    'butcher_tanner': 'Slaughterhouse Butcher & Lime-Pit Tanner',
    'guild_baker_brewer': 'Flour-Dusted Guild Baker & Malt Brewer',
    'tavern_innkeeper': 'Caravanserai Publican & Tavern Innkeeper',
    'harbour_stevedore': 'Quayside Bale-Hook Harbour Stevedore',
    'town_chirurgeon': 'Civic Barber-Chirurgeon & Apothecary',
    'ossuary_undertaker': 'Catacomb Ossuary Undertaker & Sexton',
}

HZM_CUSTOM_MOTIFS = {
    'hzm_faraday_grid',
    'hzm_acid_tar_seam',
    'hzm_cryo_rib',
    'hzm_mylar_crinkle',
    'hzm_butcher_splatter',
    'hzm_tapster_stripe',
}


def _hzm_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'hzm_faraday_grid':
        # Woven copper-wire Faraday cage mesh over dark oiled lead-slate cloth
        gu = np.abs(((u * 16.0) % 1.0) - 0.5) < 0.08
        gv = np.abs(((v * 16.0) % 1.0) - 0.5) < 0.08
        warn = (v > 0.82) & (v < 0.92) & (((u * 10.0 + v * 6.0) % 1.0) < 0.5)
        img[gu | gv] = fg
        img[warn] = C['hzm_rad_amber']
        return np.clip(img, 0.0, 1.0)

    if style == 'hzm_acid_tar_seam':
        # Vulcanized sulfur-yellow oilskin with heavy pitched double-riveted waterproof seams
        seam_u = (np.abs(u - 0.25) < 0.022) | (np.abs(u - 0.50) < 0.022) | (np.abs(u - 0.75) < 0.022)
        seam_v = np.abs(v - 0.55) < 0.020
        sheen = 0.88 + 0.14 * np.cos(u * 2.0 * math.pi * 6.0)
        img[:] = np.asarray(bg)[None, None, :] * sheen[:, :, None]
        img[seam_u | seam_v] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'hzm_cryo_rib':
        # Clean ergonomic Ancient cryo-stasis thermal ribs with cyan telemetry piping
        rib = np.abs(((v * 18.0) % 1.0) - 0.5) < 0.14
        pipe = (np.abs(u - 0.18) < 0.016) | (np.abs(u - 0.82) < 0.016)
        img[rib] = 0.82 * np.asarray(bg) + 0.18 * np.asarray(C['slate'])
        img[pipe] = fg
        return np.clip(img, 0.0, 1.0)

    if style == 'hzm_mylar_crinkle':
        # Faceted gold emergency stasis foil blanket over frayed cryo-fabric
        f1 = np.sin(u * 31.0 + v * 19.0) * np.cos(u * 17.0 - v * 27.0)
        spec = f1 > 0.38
        fold = np.abs(f1) < 0.07
        img[:] = np.asarray(bg)[None, None, :]
        img[spec] = fg
        img[fold] = 0.65 * np.asarray(bg)
        return np.clip(img, 0.0, 1.0)

    if style == 'hzm_butcher_splatter':
        # Slaked lime & oxblood work-stains across heavy oiled butcher/tanner leather
        blot = (np.sin(u * 13.0 + v * 9.0) + 0.6 * np.cos(u * 23.0 - v * 15.0)) > 0.45
        lime = (v > 0.74) & ((np.cos(u * 19.0 + v * 11.0)) > 0.20)
        img[blot] = fg
        img[lime] = C['hzm_tanner_lime']
        return np.clip(img, 0.0, 1.0)

    if style == 'hzm_tapster_stripe':
        # Crisp vertical woven tavern-apron ticking stripes
        tick = ((u * 18.0) % 1.0) < 0.24
        hem = v > 0.90
        img[tick | hem] = fg
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def _hzm_motif_ctx():
    orig = paint_mod.motif

    def _patched(style, w, h, fg, bg, aspect=1.0):
        if style in HZM_CUSTOM_MOTIFS:
            return _hzm_motif(style, w, h, fg, bg, aspect=aspect)
        return orig(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched
    try:
        yield
    finally:
        paint_mod.motif = orig


# ===========================================================================================================
# GEOMETRY HELPERS (SEALED HAZMAT / DIVER / PLAGUE HELMS & FLUSH DORSAL RIGS)
# ===========================================================================================================
def _nearest_pt(pts_flat, target):
    t = np.asarray(target, dtype=np.float64)
    idx = int(np.argmin(np.linalg.norm(pts_flat - t, axis=1)))
    return pts_flat[idx].copy()


def _dorsal_pad(gid, pad_paint, z_off=-0.01, pad_size=(0.18, 0.044, 0.22), clearance=0.018):
    c_sp = spine_at(core.CHEST + z_off)
    anc = surface_out(c_sp, BACK_DIR, clearance, bvh=core.BVH_T)
    pad = blob(f'{gid}_pad', anc, pad_size, pad_paint, n=14, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    return pad, anc


def _open_brow_bowl(name, paint, f_low=0.06, f_brow=0.62, high=1.14, ease=0.018, rows=12, n=36):
    a, b, up, bk, left = head_frame()
    high_eff = max(float(high), 1.13)
    ease_eff = max(float(ease), 0.018)
    angles = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angles]
    f_rim = np.full(n, f_low, dtype=np.float64)
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
        u = i / float(rows - 1)
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
    apex = a + (b - a) * high_eff + up * 0.010
    if float(np.dot(apex - b, up)) < 0.028:
        apex = b + up * 0.028
    Q[-1] = apex + (Q[-1] - apex) * 0.05
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _sealed_hazmat_head(gid, dome_paint, face_paint, rim_paint, mode='rebreather'):
    """Closed hazmat/plague/diving headgear with proud +4.5mm dark goggle/porthole lenses + brow/nasal bars."""
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    fwd = -bk
    ease_d = 0.022 if mode == 'diver' else 0.015
    high_d = 1.14 if mode == 'diver' else 1.08
    bowl = _open_brow_bowl(f'{gid}_cowl', dome_paint, f_low=-0.02, f_brow=0.62, high=high_d, ease=ease_d)
    face = sculpted_faceplate(f'{gid}_mask', face_paint, f_top=0.76, f_bot=-0.06, ease=ease_d,
                              brow_relief=0.012, nose_relief=0.018, chin_relief=0.010)
    parts = [bowl, face]
    fp_flat = face.P.reshape(-1, 3)
    bw_flat = bowl.P.reshape(-1, 3)
    void_p = P('hzm_lens_void', 0.02, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='metal.iron')

    # Brow & nasal framing bars (+4.5mm proud of faceplate)
    b_l = _nearest_pt(fp_flat, a + (b - a) * f_brow + left * 0.058 + fwd * 0.10)
    b_m = _nearest_pt(fp_flat, a + (b - a) * (f_brow + 0.01) + fwd * 0.115)
    b_r = _nearest_pt(fp_flat, a + (b - a) * f_brow - left * 0.058 + fwd * 0.10)
    parts.append(tube(f'{gid}_brow_bar', [b_r + fwd * 0.0045, b_m + fwd * 0.0050, b_l + fwd * 0.0045],
                      0.0055, rim_paint, n=8, rigid_joint='Head'))

    n_top = _nearest_pt(fp_flat, a + (b - a) * f_brow + fwd * 0.115)
    n_mid = _nearest_pt(fp_flat, a + (b - a) * f_nose + fwd * 0.125)
    parts.append(tube(f'{gid}_nasal_bar', [n_top + fwd * 0.0045, n_mid + fwd * 0.0048],
                      0.0052, rim_paint, n=8, rigid_joint='Head'))

    if mode == 'diver':
        # Central grilled brass viewport + twin lateral brass portholes
        p_vp = _nearest_pt(fp_flat, a + (b - a) * f_eyes + fwd * 0.12)
        parts.append(rosette(f'{gid}_front_porthole', p_vp + fwd * 0.0055, fwd, left, 0.044,
                             void_p, n=14, thick=0.012, rigid_joint='Head'))
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            p_sp = _nearest_pt(bw_flat, a + (b - a) * f_eyes + left * (sgn * 0.095))
            parts.append(rosette(f'{gid}_side_port_{tag}', p_sp + left * (sgn * 0.0045), left * sgn, fwd, 0.030,
                                 rim_paint, n=12, thick=0.010, rigid_joint='Head'))
    else:
        # Twin proud +5mm dark ocular goggle/visor lenses
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            p_eye = _nearest_pt(fp_flat, a + (b - a) * f_eyes + left * (sgn * x_eye) + fwd * 0.11)
            parts.append(rosette(f'{gid}_goggle_{tag}', p_eye + fwd * 0.0050, fwd, left, 0.022,
                                 void_p, n=12, thick=0.010, rigid_joint='Head'))

    p_snout = _nearest_pt(fp_flat, a + (b - a) * (f_nose - 0.10) + fwd * 0.12)
    if mode == 'plague':
        # Wide waxed brim + iconic curved 10.5cm aromatic-herb plague beak
        parts.append(brim(f'{gid}_wax_brim', 0.64, 0.095, dome_paint, ease=0.015, rows=5, n=40, droop=0.016))
        parts.append(horn(f'{gid}_herb_beak',
                          [p_snout - fwd * 0.003,
                           p_snout + fwd * 0.062 - up * 0.014,
                           p_snout + fwd * 0.108 - up * 0.042],
                          0.028, 0.006, face_paint, n=12, rows=7, rigid_joint='Head'))
    elif mode == 'rebreather':
        # Corrugated brass breathing snout + valve canister
        parts.append(horn(f'{gid}_bellows_snout', [p_snout - fwd * 0.003, p_snout + fwd * 0.048 - up * 0.022],
                          0.024, 0.018, rim_paint, n=12, rows=6, rigid_joint='Head'))
    elif mode == 'rad':
        # Twin cheek charcoal/zeolite filter canisters anchored to faceplate cheeks
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            p_chk = _nearest_pt(fp_flat, a + (b - a) * 0.16 + left * (sgn * 0.048) + fwd * 0.09)
            parts.append(horn(f'{gid}_filter_{tag}',
                              [p_chk - fwd * 0.002, p_chk + fwd * 0.034 + left * (sgn * 0.022) - up * 0.016],
                              0.020, 0.022, rim_paint, n=10, rows=5, rigid_joint='Head'))
    elif mode == 'acid':
        # Soda-lime alkaline scrubber canister snout
        parts.append(horn(f'{gid}_lime_scrubber', [p_snout - fwd * 0.003, p_snout + fwd * 0.052 - up * 0.026],
                          0.026, 0.024, rim_paint, n=12, rows=6, rigid_joint='Head'))
    return parts


# ===========================================================================================================
# 14 HAZMAT, DIVER, CRYO & CIVIC TRADE TIERS (`hzm_{s}_*`)
# ===========================================================================================================
def _build_hazmat_and_trades_tiers(sex):
    entries = []
    a, b, up, bk, left = head_frame()
    fwd = -bk

    brass_p = P('hzm_bellows_brass', 0.03, fabric='metal.bronze')

    # -------------------------------------------------------------------------------------------------------
    # 1. hypobaric_pass_rebreather — High-Pass Hypobaric Bellows-Rebreather Suit (`0.48–0.65 atm`)
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_hypobaric_rebreather_helm'
    fur_cowl_p = P('saddle', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'fur')], fabric='fur.caribou')
    rb_parts = _sealed_hazmat_head(gid_h, fur_cowl_p, P('leather', 0.05, fabric='leather.cuir_bouilli'),
                                   brass_p, mode='rebreather')
    e_rb = assemble_garment(gid_h, 'Fur-Lined Brass Bellows Hypobaric Rebreather Cowl', 'head', 'hazmat_and_trades',
                            rb_parts, covers_hair=True, covers_face=True)
    e_rb['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_rb)

    gid_t = f'hzm_{sex}_hypobaric_parka'
    pk_p = P('hzm_pass_ochre', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'fur'),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'saddle', 'hzm_pass_ochre', 0.16)], fabric='cloth.quilted.diamond')
    pk_body = torso_tube(f'{gid_t}_parka', core.TOP, core.WAIST - 0.038, 0.024, pk_p, n=40, rows=12)
    pk_col = collar(f'{gid_t}_fur_collar', P('fur', 0.06, fabric='fur.wolf'), height=0.036, flare=0.018, ease=0.025)
    pk_gauge = rosette(f'{gid_t}_barometer_dial', chest_front(core.CHEST + 0.03, 0.030, x=-0.048),
                       np.array([0.0, -1.0, 0.0]), left, 0.024, brass_p, n=12, thick=0.010, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Quilted High-Pass Parka & Aneroid Barometer Chest-Gauge', 'torso', 'hazmat_and_trades',
        [pk_body, pk_col, sleeves(gid_t, 'wrist', 0.019, pk_p), pouch_belt(gid_t, brass_p, pk_p, ease=0.026), pk_gauge],
    ))

    gid_g = f'hzm_{sex}_hypobaric_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Fur-Cuffed Barometric Mountaineer Gauntlets', 'gloves', 'hazmat_and_trades',
        full_gloves(gid_g, P('fur', 0.06, fabric='fur.wolf'), P('saddle', 0.05, fabric='leather.buckskin'),
                    knuckle_paint=brass_p),
    ))

    gid_l = f'hzm_{sex}_hypobaric_trousers'
    entries.append(assemble_garment(
        gid_l, 'Quilted Goose-Down High-Pass Thermal Breeches', 'legs', 'hazmat_and_trades',
        trousers(gid_l, pk_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_hypobaric_crampon_boots'
    entries.append(assemble_garment(
        gid_f, 'Brass-Crampon Insulated Pass Mukluks', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('iron', 0.05, fabric='metal.iron'), P('saddle', 0.05, fabric='leather.cuir_bouilli'),
              top=0.42, ease_top=0.026, cuff_paint=P('fur', 0.06, fabric='fur.wolf')),
    ))

    gid_b = f'hzm_{sex}_hypobaric_bellows_pack'
    pad, anc = _dorsal_pad(gid_b, pk_p, clearance=0.018)
    cyl_l = horn(f'{gid_b}_o2_cyl_L', [anc + left * 0.055 - up * 0.11 + BACK_DIR * 0.022,
                                        anc + left * 0.055 + up * 0.12 + BACK_DIR * 0.022],
                 0.036, 0.034, brass_p, n=12, rows=6, rigid_joint='Spine2')
    cyl_r = horn(f'{gid_b}_o2_cyl_R', [anc - left * 0.055 - up * 0.11 + BACK_DIR * 0.022,
                                        anc - left * 0.055 + up * 0.12 + BACK_DIR * 0.022],
                 0.036, 0.034, brass_p, n=12, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Twin Brass Chlorate-Candle & Bellows Rebreather Pack', 'back',
                                    'hazmat_and_trades', [pad, cyl_l, cyl_r]))

    # -------------------------------------------------------------------------------------------------------
    # 2. valley_rad_delver — Ancient's Valley Faraday & Leaded-Glass Anomaly Delver
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_rad_delver_hood'
    lead_p = P('hzm_lead_slate', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'copper'),
    ], [PN(0.0, 1.0, 'hzm_faraday_grid', 'copper', 'hzm_lead_slate', 0.18)], fabric='cloth.lead.oiled')
    amber_p = P('hzm_rad_amber', 0.03, fabric='glass.moonglass.leaded')
    rd_parts = _sealed_hazmat_head(gid_h, lead_p, amber_p, P('copper', 0.03, fabric='metal.bronze'), mode='rad')
    e_rd = assemble_garment(gid_h, 'Lead-Lined Faraday Hood & Leaded Moonglass Respirator', 'head',
                            'hazmat_and_trades', rd_parts, covers_hair=True, covers_face=True)
    e_rd['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_rd)

    gid_t = f'hzm_{sex}_rad_faraday_smock'
    rd_coat = torso_tube(f'{gid_t}_smock', core.TOP, core.KNEE + 0.02, 0.035, lead_p,
                         n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    rd_yoke = collar_disc(f'{gid_t}_lead_yoke', 0.125, P('copper', 0.03, fabric='metal.bronze'),
                          drop=0.095, scallop=0.0, ease=0.023)
    rd_dos = blob(f'{gid_t}_dosimeter', chest_front(core.CHEST + 0.03, 0.040, x=0.052), (0.032, 0.016, 0.048),
                  P('hzm_dosimeter', 0.02, [B('top', 0.0, 0.02, 'solid', 'copper')], fabric='glass.moonglass.leaded'),
                  n=10, rows=5, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Lead-Weave & Copper-Mesh Faraday Vault Delver Smock', 'torso', 'hazmat_and_trades',
        [rd_coat, rd_yoke, sleeves(gid_t, 'wrist', 0.019, lead_p), rd_dos],
    ))

    gid_g = f'hzm_{sex}_rad_lead_gloves'
    entries.append(assemble_garment(
        gid_g, 'Leaded Rubber & Copper-Mesh Vault Gauntlets', 'gloves', 'hazmat_and_trades',
        full_gloves(gid_g, P('copper', 0.03, fabric='metal.bronze'),
                    P('hzm_lead_slate', 0.05, fabric='rubber.tyre')),
    ))

    gid_l = f'hzm_{sex}_rad_lead_trousers'
    entries.append(assemble_garment(
        gid_l, 'Oiled Lead-Cloth Anomaly Delver Trousers', 'legs', 'hazmat_and_trades',
        trousers(gid_l, lead_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_rad_vault_boots'
    entries.append(assemble_garment(
        gid_f, 'Copper-Grounded Vulcanized Lead Vault Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('hzm_tar_pitch', 0.06, fabric='rubber.tyre'),
              P('hzm_lead_slate', 0.05, [B('top', 0.0, 0.04, 'solid', 'hzm_rad_amber')], fabric='rubber.tyre'),
              top=0.42, ease_top=0.026),
    ))

    gid_b = f'hzm_{sex}_rad_geiger_pack'
    pad, anc = _dorsal_pad(gid_b, lead_p, clearance=0.018)
    gbox = blob(f'{gid_b}_scrubber_case', anc + BACK_DIR * 0.024, (0.19, 0.070, 0.23),
                P('copper', 0.03, [B('top', 0.0, 0.04, 'solid', 'hzm_dosimeter')], fabric='metal.bronze'),
                n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Faraday Grounding-Coil & Phosphor Dosimeter Pack', 'back',
                                    'hazmat_and_trades', [pad, gbox]))

    # -------------------------------------------------------------------------------------------------------
    # 3. fumarole_acid_suit — Boiling-Bay / Throne `pH 2.5` Acid-Fumarole Oilskin Suit
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_acid_fumarole_hood'
    acid_p = P('hzm_acid_sulphur', 0.05, [
        B('bottom', 0.0, 0.06, 'solid', 'hzm_tar_pitch'),
    ], [PN(0.0, 1.0, 'hzm_acid_tar_seam', 'hzm_tar_pitch', 'hzm_acid_sulphur', 0.22)],
       fabric='cloth.oilskin.tarred_seams')
    pitch_p = P('hzm_tar_pitch', 0.05, fabric='rubber.tyre')
    ac_parts = _sealed_hazmat_head(gid_h, acid_p, acid_p, pitch_p, mode='acid')
    e_ac = assemble_garment(gid_h, 'Tar-Seamed Sulfur Oilskin Acid-Fumarole Respirator Hood', 'head',
                            'hazmat_and_trades', ac_parts, covers_hair=True, covers_face=True)
    e_ac['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_ac)

    gid_t = f'hzm_{sex}_acid_oilskin_coat'
    ac_coat = torso_tube(f'{gid_t}_oilskin', core.TOP, core.KNEE + 0.02, 0.035, acid_p,
                         n=42, rows=20, hang_from=core.WAIST, flare=0.12)
    ac_cape = collar_disc(f'{gid_t}_storm_flap', 0.145, acid_p, drop=0.115, scallop=0.03, ease=0.023)
    entries.append(assemble_garment(
        gid_t, 'Vulcanized pH-2.5 Acid-Proof Tarred-Seam Oilskin Coat', 'torso', 'hazmat_and_trades',
        [ac_coat, ac_cape, sleeves(gid_t, 'wrist', 0.019, acid_p)],
    ))

    gid_g = f'hzm_{sex}_acid_rubber_gloves'
    entries.append(assemble_garment(
        gid_g, 'Vulcanized Coal-Tar Acid-Handling Gauntlets', 'gloves', 'hazmat_and_trades',
        full_gloves(gid_g, acid_p, pitch_p),
    ))

    gid_l = f'hzm_{sex}_acid_oilskin_waders'
    entries.append(assemble_garment(
        gid_l, 'Tar-Pitched Acid-Marsh Oilskin Wader Trousers', 'legs', 'hazmat_and_trades',
        trousers(gid_l, acid_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_acid_wader_boots'
    entries.append(assemble_garment(
        gid_f, 'Pitch-Sealed Sulfur-Vent Rubber Wader Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, pitch_p, pitch_p, top=0.44, ease_top=0.026, cuff_paint=acid_p),
    ))

    gid_b = f'hzm_{sex}_acid_lime_scrubber'
    pad, anc = _dorsal_pad(gid_b, pitch_p, clearance=0.018)
    vat = horn(f'{gid_b}_lime_tank', [anc - up * 0.12 + BACK_DIR * 0.024, anc + up * 0.13 + BACK_DIR * 0.024],
               0.062, 0.058,
               P('hzm_tanner_lime', 0.05, [B('top', 0.0, 0.04, 'solid', 'hzm_tar_pitch'),
                                           B('bottom', 0.0, 0.04, 'solid', 'hzm_acid_sulphur')],
                 fabric='metal.tin.patchwork'),
               n=14, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Slaked-Lime Alkaline Mist-Neutralizer Tank', 'back',
                                    'hazmat_and_trades', [pad, vat]))

    # -------------------------------------------------------------------------------------------------------
    # 4. blade_plague_doctor — `Blade` Biogel-Quarantine Beaked Plague-Physician
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_plague_beak_hat'
    plg_wax = P('hzm_plague_wax', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'hzm_quarantine_red')],
                fabric='leather.polished')
    plg_beak = P('hzm_plague_bone', 0.04, [B('top', 0.0, 0.03, 'solid', 'brass')], fabric='leather.cuir_bouilli')
    pl_parts = _sealed_hazmat_head(gid_h, plg_wax, plg_beak, brass_p, mode='plague')
    e_pl = assemble_garment(gid_h, 'Blade Quarantine Waxed Hat & Herb-Stuffed Plague Beak', 'head',
                            'hazmat_and_trades', pl_parts, covers_hair=True, covers_face=True)
    e_pl['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_pl)

    gid_t = f'hzm_{sex}_plague_waxed_greatcoat'
    pl_coat = torso_tube(f'{gid_t}_greatcoat', core.TOP, core.KNEE - 0.03, 0.033, plg_wax,
                         n=42, rows=21, hang_from=core.WAIST, flare=0.125)
    pl_pelerine = collar_disc(f'{gid_t}_pelerine', 0.140,
                              P('hzm_plague_wax', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'hzm_quarantine_red')],
                                fabric='leather.polished'),
                              drop=0.110, scallop=0.04, ease=0.023)
    pl_sash = crossed_sash(f'{gid_t}_phial_bandolier',
                           P('hzm_quarantine_red', 0.04, [B('top', 0.0, 0.02, 'beads', 'brass', 'hzm_quarantine_red', 0.03)],
                             fabric='leather.polished'),
                           width=0.062, ease=0.038)
    entries.append(assemble_garment(
        gid_t, 'Carbolic-Waxed Quarantine Greatcoat & Antitoxin Bandolier', 'torso', 'hazmat_and_trades',
        [pl_coat, pl_pelerine, sleeves(gid_t, 'wrist', 0.019, plg_wax), pl_sash],
    ))

    gid_g = f'hzm_{sex}_plague_wax_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Carbolic-Sealed Waxed Leather Quarantine Gauntlets', 'gloves', 'hazmat_and_trades',
        full_gloves(gid_g, P('hzm_quarantine_red', 0.04, fabric='leather.polished'), plg_wax),
    ))

    gid_l = f'hzm_{sex}_plague_wax_breeches'
    entries.append(assemble_garment(
        gid_l, 'Waxed Sable Quarantine Breeches', 'legs', 'hazmat_and_trades',
        trousers(gid_l, plg_wax, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_plague_buckle_boots'
    entries.append(assemble_garment(
        gid_f, 'Brass-Buckled Quarantine Ward Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('soot', 0.08), plg_wax, top=0.42, ease_top=0.026, wraps=2, wrap_paint=brass_p),
    ))

    gid_b = f'hzm_{sex}_plague_censer_rig'
    pad, anc = _dorsal_pad(gid_b, plg_wax, clearance=0.018)
    censer = horn(f'{gid_b}_fumigator', [anc - up * 0.11 + BACK_DIR * 0.024, anc + up * 0.13 + BACK_DIR * 0.024],
                  0.056, 0.048,
                  P('hzm_bellows_brass', 0.03, [B('top', 0.0, 0.04, 'solid', 'hzm_quarantine_red')], fabric='metal.bronze'),
                  n=14, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Perforated Brass Fumigation Censer & Carbolic Tank', 'back',
                                    'hazmat_and_trades', [pad, censer]))

    # -------------------------------------------------------------------------------------------------------
    # 5. copper_hardhat_diver — `Tethis` / `Dorado` 12-Bolt Copper Hard-Hat Salvage Diver
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_copper_diver_helmet'
    cop_div = P('hzm_diver_copper', 0.03, [
        B('bottom', 0.0, 0.06, 'beads', 'brass', 'verdigris', 0.035),
        B('top', 0.0, 0.04, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'hzm_faraday_grid', 'brass', 'hzm_diver_copper', 0.14)], fabric='metal.bronze')
    dv_parts = _sealed_hazmat_head(gid_h, cop_div, cop_div, brass_p, mode='diver')
    e_dv = assemble_garment(gid_h, 'Tethis 12-Bolt Domed Copper & Brass Salvage Diving Helmet', 'head',
                            'hazmat_and_trades', dv_parts, covers_hair=True, covers_face=True)
    e_dv['hide_parts'] = FULL_HEAD_HIDE_PARTS
    entries.append(e_dv)

    gid_t = f'hzm_{sex}_copper_diver_dress'
    dv_canv = P('hzm_diver_canvas', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'brass'),
        B('top', 0.0, 0.04, 'solid', 'verdigris'),
    ], [PN(0.0, 1.0, 'hzm_acid_tar_seam', 'hzm_tar_pitch', 'hzm_diver_canvas', 0.24)], fabric='cloth.canvas.oiled')
    dv_suit = torso_tube(f'{gid_t}_dress', core.TOP, core.WAIST - 0.038, 0.024, dv_canv, n=40, rows=12)
    dv_corselet = collar_disc(f'{gid_t}_twelve_bolt_corselet', 0.150, cop_div, drop=0.125, scallop=0.0, ease=0.023)
    dv_flange = collar(f'{gid_t}_neck_flange', brass_p, height=0.032, flare=0.008, ease=0.025)
    dv_pld_l = pauldron(f'{gid_t}_pauldron_L', L, cop_div, reach=0.28, ease=0.024)
    dv_pld_r = pauldron(f'{gid_t}_pauldron_R', R, cop_div, reach=0.28, ease=0.024)
    dv_lead = blob(f'{gid_t}_lead_weight', chest_front(core.CHEST - 0.01, 0.032), (0.095, 0.026, 0.105),
                   P('hzm_lead_slate', 0.05, [B('top', 0.0, 0.03, 'solid', 'brass')], fabric='metal.iron'),
                   n=12, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Waterproofed Salvage-Diver Dress, 12-Bolt Corselet & Lead Chest-Weight', 'torso', 'hazmat_and_trades',
        [dv_suit, dv_corselet, dv_flange, dv_pld_l, dv_pld_r, sleeves(gid_t, 'wrist', 0.019, dv_canv),
         belt_sash(f'{gid_t}_weight_belt', core.WAIST - 0.014, core.WAIST + 0.028, P('hzm_lead_slate', 0.05, fabric='metal.iron'), ease=0.027),
         dv_lead],
    ))

    gid_g = f'hzm_{sex}_copper_diver_gloves'
    entries.append(assemble_garment(
        gid_g, 'Brass-Clamped Waterproof Rubber Diver Gauntlets', 'gloves', 'hazmat_and_trades',
        full_gloves(gid_g, brass_p, P('hzm_tar_pitch', 0.05, fabric='rubber.tyre')),
    ))

    gid_l = f'hzm_{sex}_copper_diver_trousers'
    entries.append(assemble_garment(
        gid_l, 'Weighted Canvas Deep-Sump Diving Trousers', 'legs', 'hazmat_and_trades',
        trousers(gid_l, dv_canv, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_copper_diver_leadboots'
    entries.append(assemble_garment(
        gid_f, 'Lead-Soled & Brass-Capped Deep Salvage Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('hzm_lead_slate', 0.06, fabric='metal.iron'), cop_div, top=0.40, ease_top=0.026,
              cuff_paint=brass_p),
    ))

    gid_b = f'hzm_{sex}_copper_diver_airtanks'
    pad, anc = _dorsal_pad(gid_b, cop_div, clearance=0.018)
    t_l = horn(f'{gid_b}_air_L', [anc + left * 0.058 - up * 0.12 + BACK_DIR * 0.022,
                                  anc + left * 0.058 + up * 0.13 + BACK_DIR * 0.022],
               0.038, 0.036, cop_div, n=12, rows=6, rigid_joint='Spine2')
    t_r = horn(f'{gid_b}_air_R', [anc - left * 0.058 - up * 0.12 + BACK_DIR * 0.022,
                                  anc - left * 0.058 + up * 0.13 + BACK_DIR * 0.022],
               0.038, 0.036, P('verdigris', 0.04, fabric='metal.bronze.verdigris'), n=12, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Twin Copper & Verdigris Air-Reservoir Manifold', 'back',
                                    'hazmat_and_trades', [pad, t_l, t_r]))

    # -------------------------------------------------------------------------------------------------------
    # 6. cryo_vault_sleeper — Newly Thawed Ancient Cryo-Vault Stasis Sleeper
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_cryo_telemetry_band'
    cr_hb = head_rings(f'{gid_h}_headband', 0.60, 0.70, 0.004,
                       P('hzm_cryo_white', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'hzm_cryo_cyan')],
                         fabric='armor.ancient.hex_weave'),
                       n=36, rows=5)
    p_tem = cr_hb.P[2, 18].copy()
    cr_node = rosette(f'{gid_h}_neural_node', p_tem + fwd * 0.004, fwd, left, 0.016,
                      P('hzm_cryo_cyan', 0.02, fabric='glass.moonglass.leaded'), n=10, thick=0.007, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Ancient Cryo-Pod Neural Telemetry Browband', 'head',
                                    'hazmat_and_trades', [cr_hb, cr_node], covers_hair=False))

    gid_t = f'hzm_{sex}_cryo_stasis_top'
    cryo_p = P('hzm_cryo_white', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'hzm_cryo_cyan'),
        B('top', 0.0, 0.03, 'stencil:07', 'slate', 'hzm_cryo_white', 0.18),
    ], [PN(0.0, 1.0, 'hzm_cryo_rib', 'hzm_cryo_cyan', 'hzm_cryo_white', 0.18)], fabric='cloth.cryo.elastomer')
    cr_suit = torso_tube(f'{gid_t}_suit', core.TOP, core.WAIST - 0.036, 0.018, cryo_p, n=40, rows=12)
    cr_puck = rosette(f'{gid_t}_biomonitor', chest_front(core.CHEST + 0.03, 0.024), np.array([0.0, -1.0, 0.0]), left,
                      0.028, P('hzm_cryo_cyan', 0.02, [B('top', 0.0, 0.02, 'solid', 'hzm_cryo_white')],
                               fabric='glass.moonglass.leaded'),
                      n=14, thick=0.010, rigid_joint='Spine2')
    entries.append(assemble_garment(
        gid_t, 'Ribbed White Cryo-Stasis Jumpsuit & Cyan Biomonitor', 'torso', 'hazmat_and_trades',
        [cr_suit, sleeves(gid_t, 'wrist', 0.016, cryo_p), cr_puck],
    ))

    gid_g = f'hzm_{sex}_cryo_biometric_cuffs'
    entries.append(assemble_garment(
        gid_g, 'Cryo-Pod Biometric IV Wrist-Seals', 'gloves', 'hazmat_and_trades',
        [sleeve(f'{gid_g}_L', L, cryo_p, f0=0.68, f1=0.95, ease=0.012, flare=0.002, rows=6, n=18),
         sleeve(f'{gid_g}_R', R, cryo_p, f0=0.68, f1=0.95, ease=0.012, flare=0.002, rows=6, n=18)],
    ))

    gid_l = f'hzm_{sex}_cryo_stasis_leggings'
    entries.append(assemble_garment(
        gid_l, 'Form-Fitted Cryo-Stasis Thermal Leggings', 'legs', 'hazmat_and_trades',
        trousers(gid_l, cryo_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.006, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_cryo_pod_slippers'
    entries.append(assemble_garment(
        gid_f, 'Soft-Soled White Stasis-Pod Thermal Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('slate', 0.04), cryo_p, top=0.34, ease_top=0.024),
    ))

    gid_b = f'hzm_{sex}_cryo_umbilical_port'
    pad, anc = _dorsal_pad(gid_b, cryo_p, pad_size=(0.15, 0.036, 0.18), clearance=0.017)
    port = rosette(f'{gid_b}_cryo_socket', anc + BACK_DIR * 0.018, BACK_DIR, left, 0.062,
                   P('hzm_cryo_cyan', 0.02, [B('top', 0.0, 0.02, 'solid', 'silver')], fabric='metal.steel.brushed'),
                   n=14, thick=0.018, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Frost-Rimed Dorsal Cryo-Umbilical Socket', 'back',
                                    'hazmat_and_trades', [pad, port]))

    # -------------------------------------------------------------------------------------------------------
    # 7. tattered_stasis_survivor — Breached-Pod Foil-Wrapped Stasis Survivor
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_survivor_bandage_band'
    sv_hb = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004,
                       P('linen', 0.06, [B('bottom', 0.0, 0.03, 'solid', 'hzm_mylar_gold')], fabric=COTTON),
                       n=36, rows=5)
    entries.append(assemble_garment(gid_h, 'Vault-Gauze & Foil Glare-Strip Browband', 'head',
                                    'hazmat_and_trades', [sv_hb], covers_hair=False))

    gid_t = f'hzm_{sex}_survivor_mylar_wrap'
    worn_cryo = P('ash', 0.06, [B('bottom', 0.0, 0.05, 'solid', 'slate')], fabric='cloth.cryo.elastomer')
    mylar_p = P('hzm_mylar_gold', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'silver'),
    ], [PN(0.0, 1.0, 'hzm_mylar_crinkle', 'gold', 'hzm_mylar_gold', 0.18)], fabric='cloth.mylar.foil')
    sv_top = torso_tube(f'{gid_t}_torn_suit', core.TOP, core.WAIST - 0.038, 0.019, worn_cryo, n=38, rows=11)
    sv_shawl = crossed_sash(f'{gid_t}_foil_blanket', mylar_p, width=0.092, ease=0.025)
    entries.append(assemble_garment(
        gid_t, 'Tattered Stasis Undershirt & Gold Emergency Thermal-Foil Wrap', 'torso', 'hazmat_and_trades',
        [sv_top, sleeve(f'{gid_t}_slL', L, worn_cryo, f0=0.0, f1=0.88, ease=0.017),
         sleeve(f'{gid_t}_slR', R, worn_cryo, f0=0.0, f1=0.45, ease=0.017),
         sv_shawl, pouch_belt(gid_t, P('slate', 0.05), mylar_p, ease=0.025)],
    ))

    gid_g = f'hzm_{sex}_survivor_tape_wraps'
    tape_p = P('silver', 0.04, [B('top', 0.0, 0.03, 'solid', 'hzm_mylar_gold')], fabric='cloth.mylar.foil')
    entries.append(assemble_garment(
        gid_g, 'Duct-Tape & Thermal-Foil Forearm Binds', 'gloves', 'hazmat_and_trades',
        [sleeve(f'{gid_g}_L', L, tape_p, f0=0.62, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'{gid_g}_R', R, tape_p, f0=0.62, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    gid_l = f'hzm_{sex}_survivor_patched_pants'
    pat_p = P('slate', 0.06, [B('bottom', 0.0, 0.05, 'solid', 'hzm_mylar_gold')], fabric='cloth.canvas.oiled')
    entries.append(assemble_garment(
        gid_l, 'Foil-Patched Breached-Pod Stasis Trousers', 'legs', 'hazmat_and_trades',
        trousers(gid_l, pat_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_survivor_lashed_boots'
    entries.append(assemble_garment(
        gid_f, 'Cord-Lashed Salvaged Stasis Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('soot', 0.08), worn_cryo, top=0.38, ease_top=0.026, wraps=2, wrap_paint=mylar_p),
    ))

    gid_b = f'hzm_{sex}_survivor_ration_roll'
    pad, anc = _dorsal_pad(gid_b, worn_cryo, clearance=0.018)
    roll = horn(f'{gid_b}_foil_bedroll',
                [anc - left * 0.10 + up * 0.06 + BACK_DIR * 0.022,
                 anc + left * 0.10 + up * 0.06 + BACK_DIR * 0.022],
                0.044, 0.044, mylar_p, n=12, rows=6, rigid_joint='Spine2')
    can = blob(f'{gid_b}_ration_case', anc - up * 0.06 + BACK_DIR * 0.022, (0.17, 0.060, 0.16),
               P('hzm_cryo_white', 0.04, [B('top', 0.0, 0.03, 'solid', 'hzm_cryo_cyan')]),
               n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Scavenged Vault Ration-Case & Thermal Foil Roll', 'back',
                                    'hazmat_and_trades', [pad, can, roll]))

    # -------------------------------------------------------------------------------------------------------
    # 8. town_blacksmith — Scorched Foundry-Pigskin Forge Blacksmith & Farrier
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_smith_spark_goggles'
    sm_hb = head_rings(f'{gid_h}_headband', 0.60, 0.72, 0.004,
                       P('hzm_forge_pigskin', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'brass')],
                         fabric='leather.foundry.pigskin'),
                       n=36, rows=5)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        pass
    p_gl_l = sm_hb.P[2, 16].copy()
    p_gl_r = sm_hb.P[2, 20].copy()
    g_l = rosette(f'{gid_h}_mica_L', p_gl_l + fwd * 0.004, fwd, left, 0.018, brass_p, n=10, thick=0.008, rigid_joint='Head')
    g_r = rosette(f'{gid_h}_mica_R', p_gl_r + fwd * 0.004, fwd, left, 0.018, brass_p, n=10, thick=0.008, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Smoked-Mica Forge Spark-Goggle Browstrap', 'head',
                                    'hazmat_and_trades', [sm_hb, g_l, g_r], covers_hair=False))

    gid_t = f'hzm_{sex}_smith_pigskin_apron'
    pig_p = P('hzm_forge_pigskin', 0.06, [
        B('bottom', 0.0, 0.07, 'solid', 'hzm_ember_soot'),
        B('top', 0.0, 0.03, 'beads', 'brass', 'hzm_forge_pigskin', 0.03),
    ], fabric='leather.foundry.pigskin')
    sm_shirt = torso_tube(f'{gid_t}_shirt', core.TOP, core.WAIST - 0.038, 0.020,
                          P('oat', 0.06, fabric=COTTON), n=38, rows=11)
    sm_apron = tabard(f'{gid_t}_apron', core.KNEE + 0.03, core.CHEST + 0.05, pig_p,
                      width=0.23, front=True, back=False, ease=0.031)
    entries.append(assemble_garment(
        gid_t, 'Scorched Foundry-Pigskin Forge Apron & Rolled-Sleeve Shirt', 'torso', 'hazmat_and_trades',
        [sm_shirt, sleeves(gid_t, 'elbow', 0.018, P('oat', 0.06, fabric=COTTON)), sm_apron],
    ))

    gid_g = f'hzm_{sex}_smith_forge_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Heat-Charred Welted Pigskin Forge Gauntlets', 'gloves', 'hazmat_and_trades',
        full_gloves(gid_g, pig_p, P('hzm_ember_soot', 0.06, fabric='leather.foundry.pigskin')),
    ))

    gid_l = f'hzm_{sex}_smith_soot_trousers'
    entries.append(assemble_garment(
        gid_l, 'Clinker-Dusted Heavy Duck Forge Trousers', 'legs', 'hazmat_and_trades',
        trousers(gid_l, P('hzm_ember_soot', 0.06, fabric='cloth.canvas.duck.army'),
                 cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_smith_iron_boots'
    entries.append(assemble_garment(
        gid_f, 'Iron-Capped Foundry Safety Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('iron', 0.05, fabric='metal.iron'), pig_p, top=0.38, ease_top=0.026),
    ))

    gid_b = f'hzm_{sex}_smith_bellows_rack'
    pad, anc = _dorsal_pad(gid_b, pig_p, clearance=0.018)
    bellows = blob(f'{gid_b}_forge_bellows', anc + BACK_DIR * 0.024, (0.20, 0.068, 0.24),
                   P('saddle', 0.05, [B('top', 0.0, 0.04, 'solid', 'iron')], fabric='leather.cuir_bouilli'),
                   n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Portable Hand-Bellows & Iron Tongs Rack', 'back',
                                    'hazmat_and_trades', [pad, bellows]))

    # -------------------------------------------------------------------------------------------------------
    # 9. butcher_tanner — Slaughterhouse Butcher & Alum-Lime Hide Tanner
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_butcher_linen_cap'
    bt_cap = _open_brow_bowl(f'{gid_h}_cap',
                             P('hzm_tanner_lime', 0.06, [B('bottom', 0.0, 0.03, 'solid', 'hzm_butcher_ox')], fabric=COTTON),
                             f_low=0.52, f_brow=0.64, high=1.14, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Lime-Washed Slaughterhouse Linen Cap', 'head',
                                    'hazmat_and_trades', [bt_cap], covers_hair=True))

    gid_t = f'hzm_{sex}_butcher_lime_apron'
    bt_ap_p = P('saddle', 0.06, [
        B('bottom', 0.0, 0.06, 'solid', 'hzm_tanner_lime'),
    ], [PN(0.0, 1.0, 'hzm_butcher_splatter', 'hzm_butcher_ox', 'saddle', 0.20)], fabric='leather.cuir_bouilli')
    bt_shirt = torso_tube(f'{gid_t}_shirt', core.TOP, core.WAIST - 0.038, 0.020,
                          P('shroudtaupe', 0.06, fabric=COTTON), n=38, rows=11)
    bt_apron = tabard(f'{gid_t}_apron', core.KNEE + 0.02, core.CHEST + 0.05, bt_ap_p,
                      width=0.23, front=True, back=False, ease=0.031)
    entries.append(assemble_garment(
        gid_t, 'Blood & Slaked-Lime Stained Butcher-Tanner Leather Apron', 'torso', 'hazmat_and_trades',
        [bt_shirt, sleeves(gid_t, 'elbow', 0.018, P('shroudtaupe', 0.06, fabric=COTTON)), bt_apron],
    ))

    gid_g = f'hzm_{sex}_butcher_alum_bracers'
    entries.append(assemble_garment(
        gid_g, 'Alum-Cured Rawhide Scraping Cuff-Guards', 'gloves', 'hazmat_and_trades',
        [sleeve(f'{gid_g}_L', L, bt_ap_p, f0=0.58, f1=0.95, ease=0.014, flare=0.004, rows=6, n=18),
         sleeve(f'{gid_g}_R', R, bt_ap_p, f0=0.58, f1=0.95, ease=0.014, flare=0.004, rows=6, n=18)],
    ))

    gid_l = f'hzm_{sex}_butcher_oiled_trousers'
    entries.append(assemble_garment(
        gid_l, 'Lime-Pit Oiled Canvas Tanner Trousers', 'legs', 'hazmat_and_trades',
        trousers(gid_l, P('duneumber', 0.06, [B('bottom', 0.0, 0.05, 'solid', 'hzm_tanner_lime')],
                          fabric='cloth.oiled.alkali'),
                 cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_butcher_pit_clogs'
    entries.append(assemble_garment(
        gid_f, 'Thick Alder-Soled Tanning-Pit Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('oat', 0.06), P('hzm_butcher_ox', 0.05, fabric='leather.cuir_bouilli'),
              top=0.38, ease_top=0.026),
    ))

    gid_b = f'hzm_{sex}_butcher_hide_frame'
    pad, anc = _dorsal_pad(gid_b, bt_ap_p, clearance=0.018)
    pelt_roll = horn(f'{gid_b}_cured_hides',
                     [anc - up * 0.12 + BACK_DIR * 0.022, anc + up * 0.14 + BACK_DIR * 0.024],
                     0.062, 0.058, P('hide', 0.06, [B('top', 0.0, 0.04, 'solid', 'hzm_tanner_lime')],
                                     fabric='hide.panels.sewn'),
                     n=14, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Bundled Alum-Cured Hides & Fleshing-Knife Rack', 'back',
                                    'hazmat_and_trades', [pad, pelt_roll]))

    # -------------------------------------------------------------------------------------------------------
    # 10. guild_baker_brewer — Flour-Dusted Guild Oven-Baker & Malt-Kettle Brewer
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_baker_linen_toque'
    fl_p = P('hzm_flour_cream', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'hzm_malt_amber')], fabric='cloth.cotton.muslin')
    toque = tower_hat(f'{gid_h}_toque', 0.14, lambda s: 1.0 + 0.18 * math.sin(s * math.pi),
                      fl_p, f=0.64, ease=0.014, rows=10, n=36)
    entries.append(assemble_garment(gid_h, 'Puffed White-Linen Guild Baker Toque', 'head',
                                    'hazmat_and_trades', [toque], covers_hair=True))

    gid_t = f'hzm_{sex}_baker_flour_smock'
    bk_shirt = torso_tube(f'{gid_t}_shirt', core.TOP, core.WAIST - 0.036, 0.020,
                          P('hzm_malt_amber', 0.05, fabric=COTTON), n=38, rows=11)
    bk_skirt_apron = torso_tube(f'{gid_t}_wrap_apron', core.WAIST + 0.015, core.KNEE + 0.03, 0.034, fl_p,
                                n=40, rows=14, hang_from=core.WAIST, flare=0.11)
    entries.append(assemble_garment(
        gid_t, 'Malt-Brown Brewer Tunic & Flour-Dusted Wrap-Around Baker Apron', 'torso', 'hazmat_and_trades',
        [bk_shirt, sleeves(gid_t, 'elbow', 0.018, P('hzm_malt_amber', 0.05, fabric=COTTON)), bk_skirt_apron],
    ))

    gid_g = f'hzm_{sex}_baker_oven_mitts'
    mitt_p = P('hzm_flour_cream', 0.06, [B('top', 0.0, 0.03, 'solid', 'hzm_malt_amber')], fabric='cloth.quilted')
    entries.append(assemble_garment(
        gid_g, 'Quilted Canvas Peel-Handler Oven Gauntlets', 'gloves', 'hazmat_and_trades',
        full_gloves(gid_g, mitt_p, mitt_p),
    ))

    gid_l = f'hzm_{sex}_baker_oat_trousers'
    entries.append(assemble_garment(
        gid_l, 'Flour-Dusted Oat-Twill Bakehouse Trousers', 'legs', 'hazmat_and_trades',
        trousers(gid_l, P('oat', 0.05, fabric='cloth.weave.twill'),
                 cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_baker_work_shoes'
    entries.append(assemble_garment(
        gid_f, 'Flour-Dusted Leather Bakehouse Shoes', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('earth', 0.06), P('hzm_malt_amber', 0.05, fabric='leather.buckskin'),
              top=0.32, ease_top=0.026),
    ))

    gid_b = f'hzm_{sex}_baker_grain_keg'
    pad, anc = _dorsal_pad(gid_b, P('hzm_malt_amber', 0.05), clearance=0.018)
    keg = horn(f'{gid_b}_yeast_tun', [anc - up * 0.11 + BACK_DIR * 0.024, anc + up * 0.12 + BACK_DIR * 0.024],
               0.068, 0.068,
               P('hzm_malt_amber', 0.05, [B('top', 0.0, 0.03, 'solid', 'copper'),
                                          B('bottom', 0.0, 0.03, 'solid', 'copper')], fabric='leather.cuir_bouilli'),
               n=16, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Copper-Hooped Brewer Yeast-Keg & Grain Sack', 'back',
                                    'hazmat_and_trades', [pad, keg]))

    # -------------------------------------------------------------------------------------------------------
    # 11. tavern_innkeeper — Caravanserai Publican & Taproom Innkeeper
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_innkeeper_felt_cap'
    inn_cap = _open_brow_bowl(f'{gid_h}_cap',
                              P('hzm_tavern_wine', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='cloth.felt.boiled'),
                              f_low=0.54, f_brow=0.64, high=1.14, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Boiled-Felt Caravanserai Publican Cap', 'head',
                                    'hazmat_and_trades', [inn_cap], covers_hair=True))

    gid_t = f'hzm_{sex}_innkeeper_vest_apron'
    vest_p = P('hzm_tavern_wine', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'gold')], fabric='cloth.velvet.cut')
    tap_p = P('cream', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'hzm_tavern_wine'),
    ], [PN(0.0, 1.0, 'hzm_tapster_stripe', 'hzm_tavern_wine', 'cream', 0.18)], fabric=COTTON)
    in_shirt = torso_tube(f'{gid_t}_shirt', core.TOP, core.WAIST - 0.038, 0.019, P('cream', 0.04, fabric='cloth.cotton.muslin'),
                          n=38, rows=11)
    in_vest = torso_tube(f'{gid_t}_waistcoat', core.CHEST + 0.06, core.WAIST - 0.034, 0.025, vest_p, n=40, rows=9)
    in_apron = tabard(f'{gid_t}_tap_apron', core.KNEE + 0.04, core.WAIST + 0.01, tap_p,
                      width=0.23, front=True, back=False, ease=0.033)
    entries.append(assemble_garment(
        gid_t, 'Burgundy Publican Waistcoat, Linen Sleeves & Striped Tapster Apron', 'torso', 'hazmat_and_trades',
        [in_shirt, in_vest, button_row(gid_t, core.CHEST + 0.04, core.WAIST + 0.02, 4, brass_p, ease=0.028),
         sleeves(gid_t, 'wrist', 0.018, P('cream', 0.04, fabric='cloth.cotton.muslin')), in_apron],
    ))

    gid_g = f'hzm_{sex}_innkeeper_cuff_garters'
    entries.append(assemble_garment(
        gid_g, 'Brass-Buckled Publican Sleeve-Garters & Cuffs', 'gloves', 'hazmat_and_trades',
        [sleeve(f'{gid_g}_L', L, vest_p, f0=0.62, f1=0.92, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'{gid_g}_R', R, vest_p, f0=0.62, f1=0.92, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    gid_l = f'hzm_{sex}_innkeeper_breeches'
    entries.append(assemble_garment(
        gid_l, 'Tailored Umber Wool Taproom Breeches', 'legs', 'hazmat_and_trades',
        trousers(gid_l, P('umber', 0.05, fabric=WOOL), cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_innkeeper_buckle_shoes'
    entries.append(assemble_garment(
        gid_f, 'Polished Brass-Buckle Innkeeper Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('soot', 0.08), P('leather', 0.04, fabric='leather.polished'),
              top=0.36, ease_top=0.026, cuff_paint=brass_p),
    ))

    gid_b = f'hzm_{sex}_innkeeper_tap_cask'
    pad, anc = _dorsal_pad(gid_b, vest_p, clearance=0.018)
    cask = horn(f'{gid_b}_brandy_cask',
                [anc - left * 0.09 + BACK_DIR * 0.024, anc + left * 0.09 + BACK_DIR * 0.024],
                0.062, 0.062,
                P('saddle', 0.05, [B('top', 0.0, 0.03, 'solid', 'brass'),
                                   B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='leather.cuir_bouilli'),
                n=16, rows=6, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Brass-Spigoted Cordial Cask & Cellar Rack', 'back',
                                    'hazmat_and_trades', [pad, cask]))

    # -------------------------------------------------------------------------------------------------------
    # 12. harbour_stevedore — Quayside Bale-Hook Stevedore & Warehouse Porter
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_stevedore_bandana'
    stv_cap = _open_brow_bowl(f'{gid_h}_bandana',
                              P('tileblue', 0.05, [B('bottom', 0.0, 0.03, 'stripes', 'cream', 'tileblue', 0.03)],
                                fabric='cloth.slops.abaca_stripe'),
                              f_low=0.48, f_brow=0.63, high=1.14, ease=0.018)
    entries.append(assemble_garment(gid_h, 'Knotted Striped Abaca Quayside Bandana', 'head',
                                    'hazmat_and_trades', [stv_cap], covers_hair=True))

    gid_t = f'hzm_{sex}_stevedore_yoke_vest'
    stv_vest = torso_tube(f'{gid_t}_vest', core.TOP, core.WAIST - 0.038, 0.020,
                          P('sealinen', 0.06, fabric='cloth.gansey.sea_knit'), n=38, rows=11)
    stv_yoke = collar_disc(f'{gid_t}_carry_pad', 0.150, P('saddle', 0.06, fabric='leather.cuir_bouilli'),
                           drop=0.115, scallop=0.0, ease=0.023)
    entries.append(assemble_garment(
        gid_t, 'Padded Leather Porter Shoulder-Yoke & Sea-Knit Gansey Vest', 'torso', 'hazmat_and_trades',
        [stv_vest, stv_yoke, pouch_belt(gid_t, P('saddle', 0.06), P('iron', 0.04, fabric='metal.iron'), ease=0.025)],
    ))

    gid_g = f'hzm_{sex}_stevedore_cord_wraps'
    cord_p = P('oat', 0.06, [B('top', 0.0, 0.03, 'solid', 'tileblue')], fabric='cloth.weave.burlap')
    entries.append(assemble_garment(
        gid_g, 'Tarred Hemp Bale-Hauler Wristwraps', 'gloves', 'hazmat_and_trades',
        [sleeve(f'{gid_g}_L', L, cord_p, f0=0.60, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18),
         sleeve(f'{gid_g}_R', R, cord_p, f0=0.60, f1=0.95, ease=0.013, flare=0.003, rows=6, n=18)],
    ))

    gid_l = f'hzm_{sex}_stevedore_abaca_slops'
    slop_p = P('sealinen', 0.06, [
        B('bottom', 0.0, 0.05, 'stripes', 'tileblue', 'sealinen', 0.035),
    ], fabric='cloth.slops.abaca_stripe')
    entries.append(assemble_garment(
        gid_l, 'Rolled Striped Abaca Quayside Docker Slops', 'legs', 'hazmat_and_trades',
        trousers(gid_l, slop_p, cuff=core.ANKLE + 0.10, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_stevedore_rope_sandals'
    entries.append(assemble_garment(
        gid_f, 'Braided Coir & Tar-Leather Dock Sandals', 'feet', 'hazmat_and_trades',
        sandal(gid_f, P('saddle', 0.06), P('oat', 0.06), guard=True, laces=2),
    ))

    gid_b = f'hzm_{sex}_stevedore_crate_frame'
    pad, anc = _dorsal_pad(gid_b, P('saddle', 0.06), clearance=0.018)
    crate = blob(f'{gid_b}_bale_crate', anc + up * 0.02 + BACK_DIR * 0.026, (0.22, 0.080, 0.25),
                 P('oat', 0.06, [B('top', 0.0, 0.04, 'stencil:44', 'soot', 'oat', 0.18)],
                   fabric='cloth.weave.burlap'),
                 n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Cord-Lashed Stencilled Wharf Cargo Bale', 'back',
                                    'hazmat_and_trades', [pad, crate]))

    # -------------------------------------------------------------------------------------------------------
    # 13. town_chirurgeon — Civic Barber-Chirurgeon & Apothecary Healer
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_chirurgeon_mirror_coif'
    coif_p = P('ivory', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'hzm_chirurgeon_grn')], fabric='cloth.cotton.muslin')
    ch_coif = _open_brow_bowl(f'{gid_h}_coif', coif_p, f_low=0.12, f_brow=0.64, high=1.14, ease=0.018)
    p_mir = _nearest_pt(ch_coif.P.reshape(-1, 3), a + (b - a) * 0.76 + fwd * 0.11)
    mir = rosette(f'{gid_h}_reflector_disc', p_mir + fwd * 0.004, fwd, left, 0.026,
                  P('silver', 0.02, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='metal.steel.brushed'),
                  n=14, thick=0.009, rigid_joint='Head')
    entries.append(assemble_garment(gid_h, 'Boiled-Linen Chirurgeon Coif & Forehead Reflector', 'head',
                                    'hazmat_and_trades', [ch_coif, mir], covers_hair=True))

    gid_t = f'hzm_{sex}_chirurgeon_clinical_smock'
    clin_p = P('hzm_chirurgeon_grn', 0.04, [
        B('bottom', 0.0, 0.06, 'solid', 'ivory'),
    ], fabric='cloth.cotton.muslin')
    ch_smock = torso_tube(f'{gid_t}_smock', core.TOP, core.KNEE + 0.02, 0.034, clin_p,
                          n=42, rows=20, hang_from=core.WAIST, flare=0.115)
    ch_bib = tabard(f'{gid_t}_sterile_bib', core.KNEE + 0.04, core.CHEST + 0.05,
                    P('ivory', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'hzm_quarantine_red')], fabric='cloth.cotton.muslin'),
                    width=0.20, front=True, back=False, ease=0.038)
    entries.append(assemble_garment(
        gid_t, 'Apothecary-Green Chirurgeon Smock & Boiled-Linen Surgical Apron', 'torso', 'hazmat_and_trades',
        [ch_smock, sleeves(gid_t, 'wrist', 0.018, clin_p), ch_bib],
    ))

    gid_g = f'hzm_{sex}_chirurgeon_lancet_gloves'
    entries.append(assemble_garment(
        gid_g, 'Carbolic-Dipped Fine Gutskin Surgical Gloves', 'gloves', 'hazmat_and_trades',
        full_gloves(gid_g, P('ivory', 0.03), P('buck', 0.03, fabric='hide.gut')),
    ))

    gid_l = f'hzm_{sex}_chirurgeon_slate_trousers'
    entries.append(assemble_garment(
        gid_l, 'Clean Slate-Linen Apothecary Trousers', 'legs', 'hazmat_and_trades',
        trousers(gid_l, P('slate', 0.04, fabric='cloth.plain'),
                 cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_chirurgeon_ward_boots'
    entries.append(assemble_garment(
        gid_f, 'Quiet-Soled Calfskin Ward Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('soot', 0.08), P('leather', 0.04, fabric='leather.polished'),
              top=0.38, ease_top=0.026),
    ))

    gid_b = f'hzm_{sex}_chirurgeon_apothecary_chest'
    pad, anc = _dorsal_pad(gid_b, clin_p, clearance=0.018)
    mchest = blob(f'{gid_b}_medicine_box', anc + BACK_DIR * 0.024, (0.19, 0.068, 0.22),
                  P('saddle', 0.04, [B('top', 0.0, 0.03, 'solid', 'brass'),
                                     B('bottom', 0.0, 0.03, 'solid', 'ivory')], fabric='leather.polished'),
                  n=12, rows=6, out=BACK_DIR, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Brass-Bound Mahogany Apothecary Phial-Chest', 'back',
                                    'hazmat_and_trades', [pad, mchest]))

    # -------------------------------------------------------------------------------------------------------
    # 14. ossuary_undertaker — Catacomb Ossuary Undertaker & Lime-Sexton
    # -------------------------------------------------------------------------------------------------------
    gid_h = f'hzm_{sex}_undertaker_mourning_hood'
    oss_p = P('hzm_ossuary_ash', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'violet'),
    ], fabric='cloth.wool.fulled')
    u_hood = hood(f'{gid_h}_hood', oss_p, ease=0.026, ease_low=0.045, open_front=0.90, low=-0.20, rows=13, n=34, peak=0.05)
    entries.append(assemble_garment(gid_h, 'Deep-Cowled Ash-Wool Ossuary Sexton Hood', 'head',
                                    'hazmat_and_trades', [u_hood], covers_hair=True))

    gid_t = f'hzm_{sex}_undertaker_cassock'
    u_cass = torso_tube(f'{gid_t}_cassock', core.TOP, core.KNEE - 0.03, 0.033, oss_p,
                        n=42, rows=21, hang_from=core.WAIST, flare=0.12)
    u_stole = tabard(f'{gid_t}_mourning_stole', core.KNEE - 0.01, core.TOP - 0.01,
                     P('violet', 0.04, [B('bottom', 0.0, 0.06, 'rays', 'bone', 'violet', 0.025)], fabric='cloth.velvet.cut'),
                     width=0.15, front=True, back=False, ease=0.038)
    entries.append(assemble_garment(
        gid_t, 'Solemn Ash-Black Sexton Cassock & Bone-Fringed Violet Stole', 'torso', 'hazmat_and_trades',
        [u_cass, sleeves(gid_t, 'wrist', 0.019, oss_p), u_stole],
    ))

    gid_g = f'hzm_{sex}_undertaker_lime_gloves'
    entries.append(assemble_garment(
        gid_g, 'Quicklime-Dusted Dark Leather Sexton Gloves', 'gloves', 'hazmat_and_trades',
        full_gloves(gid_g, P('bone', 0.04), P('hzm_ossuary_ash', 0.05, fabric='leather.cuir_bouilli')),
    ))

    gid_l = f'hzm_{sex}_undertaker_wool_trousers'
    entries.append(assemble_garment(
        gid_l, 'Fulled Charcoal Catacomb Sexton Trousers', 'legs', 'hazmat_and_trades',
        trousers(gid_l, oss_p, cuff=core.ANKLE + 0.08, ease=0.014, bag=0.008, rows=14, n=22),
        legged=True,
    ))

    gid_f = f'hzm_{sex}_undertaker_grave_boots'
    entries.append(assemble_garment(
        gid_f, 'Lime-Caked Iron-Heeled Graveyard Boots', 'feet', 'hazmat_and_trades',
        boots(gid_f, P('hzm_tanner_lime', 0.06), P('soot', 0.05, fabric='leather.cuir_bouilli'),
              top=0.42, ease_top=0.026),
    ))

    gid_b = f'hzm_{sex}_undertaker_lantern_rig'
    pad, anc = _dorsal_pad(gid_b, oss_p, clearance=0.018)
    lant = horn(f'{gid_b}_ossuary_lantern',
                [anc - up * 0.12 + BACK_DIR * 0.024, anc + up * 0.14 + BACK_DIR * 0.024],
                0.052, 0.046,
                P('iron', 0.04, [B('top', 0.0, 0.04, 'solid', 'violet'),
                                 B('bottom', 0.0, 0.04, 'solid', 'bone')], fabric='metal.iron'),
                n=12, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(gid_b, 'Wrought-Iron Catacomb Dead-Lantern & Spade Frame', 'back',
                                    'hazmat_and_trades', [pad, lant]))

    return entries


def _outfits_for_sex(sex):
    return {
        'hypobaric_pass_rebreather': {
            'head': f'hzm_{sex}_hypobaric_rebreather_helm',
            'torso': f'hzm_{sex}_hypobaric_parka',
            'gloves': f'hzm_{sex}_hypobaric_gauntlets',
            'legs': f'hzm_{sex}_hypobaric_trousers',
            'feet': f'hzm_{sex}_hypobaric_crampon_boots',
            'back': f'hzm_{sex}_hypobaric_bellows_pack',
        },
        'valley_rad_delver': {
            'head': f'hzm_{sex}_rad_delver_hood',
            'torso': f'hzm_{sex}_rad_faraday_smock',
            'gloves': f'hzm_{sex}_rad_lead_gloves',
            'legs': f'hzm_{sex}_rad_lead_trousers',
            'feet': f'hzm_{sex}_rad_vault_boots',
            'back': f'hzm_{sex}_rad_geiger_pack',
        },
        'fumarole_acid_suit': {
            'head': f'hzm_{sex}_acid_fumarole_hood',
            'torso': f'hzm_{sex}_acid_oilskin_coat',
            'gloves': f'hzm_{sex}_acid_rubber_gloves',
            'legs': f'hzm_{sex}_acid_oilskin_waders',
            'feet': f'hzm_{sex}_acid_wader_boots',
            'back': f'hzm_{sex}_acid_lime_scrubber',
        },
        'blade_plague_doctor': {
            'head': f'hzm_{sex}_plague_beak_hat',
            'torso': f'hzm_{sex}_plague_waxed_greatcoat',
            'gloves': f'hzm_{sex}_plague_wax_gauntlets',
            'legs': f'hzm_{sex}_plague_wax_breeches',
            'feet': f'hzm_{sex}_plague_buckle_boots',
            'back': f'hzm_{sex}_plague_censer_rig',
        },
        'copper_hardhat_diver': {
            'head': f'hzm_{sex}_copper_diver_helmet',
            'torso': f'hzm_{sex}_copper_diver_dress',
            'gloves': f'hzm_{sex}_copper_diver_gloves',
            'legs': f'hzm_{sex}_copper_diver_trousers',
            'feet': f'hzm_{sex}_copper_diver_leadboots',
            'back': f'hzm_{sex}_copper_diver_airtanks',
        },
        'cryo_vault_sleeper': {
            'head': f'hzm_{sex}_cryo_telemetry_band',
            'torso': f'hzm_{sex}_cryo_stasis_top',
            'gloves': f'hzm_{sex}_cryo_biometric_cuffs',
            'legs': f'hzm_{sex}_cryo_stasis_leggings',
            'feet': f'hzm_{sex}_cryo_pod_slippers',
            'back': f'hzm_{sex}_cryo_umbilical_port',
        },
        'tattered_stasis_survivor': {
            'head': f'hzm_{sex}_survivor_bandage_band',
            'torso': f'hzm_{sex}_survivor_mylar_wrap',
            'gloves': f'hzm_{sex}_survivor_tape_wraps',
            'legs': f'hzm_{sex}_survivor_patched_pants',
            'feet': f'hzm_{sex}_survivor_lashed_boots',
            'back': f'hzm_{sex}_survivor_ration_roll',
        },
        'town_blacksmith': {
            'head': f'hzm_{sex}_smith_spark_goggles',
            'torso': f'hzm_{sex}_smith_pigskin_apron',
            'gloves': f'hzm_{sex}_smith_forge_gauntlets',
            'legs': f'hzm_{sex}_smith_soot_trousers',
            'feet': f'hzm_{sex}_smith_iron_boots',
            'back': f'hzm_{sex}_smith_bellows_rack',
        },
        'butcher_tanner': {
            'head': f'hzm_{sex}_butcher_linen_cap',
            'torso': f'hzm_{sex}_butcher_lime_apron',
            'gloves': f'hzm_{sex}_butcher_alum_bracers',
            'legs': f'hzm_{sex}_butcher_oiled_trousers',
            'feet': f'hzm_{sex}_butcher_pit_clogs',
            'back': f'hzm_{sex}_butcher_hide_frame',
        },
        'guild_baker_brewer': {
            'head': f'hzm_{sex}_baker_linen_toque',
            'torso': f'hzm_{sex}_baker_flour_smock',
            'gloves': f'hzm_{sex}_baker_oven_mitts',
            'legs': f'hzm_{sex}_baker_oat_trousers',
            'feet': f'hzm_{sex}_baker_work_shoes',
            'back': f'hzm_{sex}_baker_grain_keg',
        },
        'tavern_innkeeper': {
            'head': f'hzm_{sex}_innkeeper_felt_cap',
            'torso': f'hzm_{sex}_innkeeper_vest_apron',
            'gloves': f'hzm_{sex}_innkeeper_cuff_garters',
            'legs': f'hzm_{sex}_innkeeper_breeches',
            'feet': f'hzm_{sex}_innkeeper_buckle_shoes',
            'back': f'hzm_{sex}_innkeeper_tap_cask',
        },
        'harbour_stevedore': {
            'head': f'hzm_{sex}_stevedore_bandana',
            'torso': f'hzm_{sex}_stevedore_yoke_vest',
            'gloves': f'hzm_{sex}_stevedore_cord_wraps',
            'legs': f'hzm_{sex}_stevedore_abaca_slops',
            'feet': f'hzm_{sex}_stevedore_rope_sandals',
            'back': f'hzm_{sex}_stevedore_crate_frame',
        },
        'town_chirurgeon': {
            'head': f'hzm_{sex}_chirurgeon_mirror_coif',
            'torso': f'hzm_{sex}_chirurgeon_clinical_smock',
            'gloves': f'hzm_{sex}_chirurgeon_lancet_gloves',
            'legs': f'hzm_{sex}_chirurgeon_slate_trousers',
            'feet': f'hzm_{sex}_chirurgeon_ward_boots',
            'back': f'hzm_{sex}_chirurgeon_apothecary_chest',
        },
        'ossuary_undertaker': {
            'head': f'hzm_{sex}_undertaker_mourning_hood',
            'torso': f'hzm_{sex}_undertaker_cassock',
            'gloves': f'hzm_{sex}_undertaker_lime_gloves',
            'legs': f'hzm_{sex}_undertaker_wool_trousers',
            'feet': f'hzm_{sex}_undertaker_grave_boots',
            'back': f'hzm_{sex}_undertaker_lantern_rig',
        },
    }


def build_hazmat_and_trades_peoples_entry():
    return {
        'id': 'hazmat_and_trades',
        'name': 'Hazmat Delvers, Cryo-Sleepers & Civic Trades',
        'note': (
            "Cross-cutting environmental survival gear, vault sleepers, and universal settlement trades: "
            "0.48-atm hypobaric pass rebreathers, Valley Faraday/lead-glass delvers, pH-2.5 fumarole acid suits, "
            "Blade biogel-quarantine plague physicians, Tethis 12-bolt copper hard-hat divers, thawed cryo-vault "
            "sleepers, and seven universal civic trade overlays (blacksmith, butcher-tanner, baker-brewer, "
            "innkeeper, stevedore, chirurgeon, and ossuary undertaker)."
        ),
        'ancestry': {'african': [0.15, 0.45], 'asian': [0.20, 0.55], 'caucasian': [0.15, 0.45]},
        'skin': ['#dfb795', '#c2926e', '#986b4d', '#6d4b37'],
        'hair': ['#16120e', '#2b1e16', '#4a3322', '#6e4e32'],
        'eyes': ['#322015', '#523822', '#44585c', '#5a6342'],
        'grey': 0.50,
        'beard': 0.40,
        'styles': {
            'male': ['short02', 'short01', 'cortu_short_messy_hair', 'Low_Fade', 'Short_Hair_B', 'ponytail01'],
            'female': ['bob02', 'rehmanpolanski_hair_bun_brown', 'ponytail01', 'braid01', 'short03', 'toigo_blunt_bob_with_bangs'],
        },
        'tiers': HAZMAT_TRADES_TIER_SHARES,
        'tier_labels': HAZMAT_TRADES_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_hazmat_and_trades_kit():
    entries = []
    with _hzm_motif_ctx():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            entries.extend(_build_hazmat_and_trades_tiers(sex))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_hazmat_and_trades_kit()
    peoples_entry = build_hazmat_and_trades_peoples_entry()
    manifest_path = CULTURES_DIR / 'hazmat_and_trades_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'hazmat_and_trades',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Hazmat & Trades pieces ({n_m} male, {n_f} female) across 14 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
