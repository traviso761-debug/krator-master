"""Orchestrator for the 20-Tier Catch/Twins Caravaneers & Xanadu Foreign Expats Wardrobe.

Compiles all 240 procedural pieces (`120` Group A `car_{m|f}_*` + `120` Group B `xexp_{m|f}_*`)
for BOTH `mpfb_male` and `mpfb_female` without touching `kit.json`, `peoples.json`, `paint.py`,
or `core.py`, and writes `caravaneers_manifest.json` with:
- `'kit_entries'`: all 240 compiled piece dicts (preserving `'_body'`)
- `'peoples_entries'`: complete `peoples.json` objects for:
    1. `'catch_twins_caravaneers'` (10 symmetric M & F Group A tiers)
    2. `'glaziers'` (`0.94` scale pale big-eyed Laitwal *Mara* wearing `xan_glazier_steward` & `xan_glazier_cutter`)
    3. `'xanadu_expats'` (10 symmetric M & F Group B tiers)
- `'cross_links'`: tier cross-link map onto homeland phenotypes (`dalabites`, `hykkousoi`, `glaziers`,
  `yuni`, `izani`, `eternian`, `historians`, `geomancers`, `iron_republic`).
"""
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]          # core/charactermodels
CULTURES_DIR = Path(__file__).resolve().parent      # tools/garments/cultures
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

from garments.cultures.catch_caravans import build_catch_caravans_kit, GROUP_A_TIER_META
from garments.cultures.xanadu_expats import build_xanadu_expats_kit, GROUP_B_TIER_META


def _tier_outfit_dict(prefix, sex, h_s, t_s, g_s, l_s, f_s, b_s, covers_face=False, extra_mods=None):
    d = {
        'head': f'{prefix}_{sex}_{h_s}',
        'torso': f'{prefix}_{sex}_{t_s}',
        'gloves': f'{prefix}_{sex}_{g_s}',
        'legs': f'{prefix}_{sex}_{l_s}',
        'feet': f'{prefix}_{sex}_{f_s}',
        'back': f'{prefix}_{sex}_{b_s}',
    }
    if covers_face:
        d['beard'] = None
    if extra_mods:
        d['mods'] = list(extra_mods)
    return d


def build_peoples_entries():
    """Construct complete `peoples.json` roster entries for `catch_twins_caravaneers`, `glaziers`, and `xanadu_expats`."""
    # 1. `catch_twins_caravaneers` (Group A: A1..A10)
    a_tiers = [[tid, share] for tid, share, *_ in GROUP_A_TIER_META]
    a_labels = {tid: label for tid, _, label, *_ in GROUP_A_TIER_META}
    a_outfits = {'male': {}, 'female': {}}
    for tid, _, _, h_s, t_s, g_s, l_s, f_s, b_s, cov_f in GROUP_A_TIER_META:
        a_outfits['male'][tid] = _tier_outfit_dict('car', 'm', h_s, t_s, g_s, l_s, f_s, b_s, covers_face=cov_f)
        a_outfits['female'][tid] = _tier_outfit_dict('car', 'f', h_s, t_s, g_s, l_s, f_s, b_s, covers_face=cov_f)

    catch_entry = {
        'id': 'catch_twins_caravaneers',
        'name': 'Caravaneers of the Catch & The Twins',
        'note': (
            'Multi-ethnic trans-divide corridor roster spanning The Twins (Al-Qaranan twin-volcano pass, '
            'Route A Dark-Tube Road & Route B Steaming-Stone Dash) and The Catch hyperarid alkali-salt basin '
            '(Stair Hill Arcology, Kolli, Arfwai, Bitta, Lasso, Salt al-Ban halite pans, and White Gills): '
            'Brotherhood of the Two Horns pass-masters, Train of Jabal Dasri salt-syndics & halite teamsters, '
            'Izani lava-tube pack-masters, anti-Stalker caravan outriders, Yuni oilskin wagon-factors, '
            'Geomancer explosive sappers, Stair polyglot well-bailiffs, Dead-Bore salvage divers, and '
            'White Gills lung-salt smugglers (tools/garments/cultures/catch_caravans.py)'
        ),
        'ancestry': {
            'african': [0.10, 0.45],
            'asian': [0.20, 0.65],
            'caucasian': [0.20, 0.65],
        },
        'skin': ['#e0bc9a', '#c99b72', '#ab7a52', '#875b3b', '#63412a'],
        'hair': ['#120e0c', '#211914', '#36271d', '#543b28'],
        'eyes': ['#2a1a10', '#3b2414', '#5a3a22', '#6e5a2e', '#4e6a80'],
        'grey': 0.48,
        'beard': 0.45,
        'morph': {
            'muscle': [0.05, 0.55],
            'weight': [-0.20, 0.25],
        },
        'styles': {
            'male': ['short02', 'long01', 'ponytail01', 'braid01', 'Short_Hair_B', 'Low_Fade'],
            'female': ['braid01', 'long01', 'ponytail01', 'elvs_braid_bun', 'o4saken_chinesebob01', 'bob02'],
        },
        'tiers': a_tiers,
        'tier_labels': a_labels,
        'outfits': a_outfits,
    }

    # 2. `glaziers` (Laitwal Mara — 0.94 scale, pale skin, big eyeshine eyes, wearing B6 & B7)
    glazier_rows = [row for row in GROUP_B_TIER_META if row[0] in ('xan_glazier_cutter', 'xan_glazier_steward')]
    g_outfits = {'male': {}, 'female': {}}
    g_labels = {}
    for tid, _, label, h_s, t_s, g_s, l_s, f_s, b_s, cov_f, _ in glazier_rows:
        g_labels[tid] = label
        g_outfits['male'][tid] = _tier_outfit_dict('xexp', 'm', h_s, t_s, g_s, l_s, f_s, b_s, covers_face=cov_f)
        g_outfits['female'][tid] = _tier_outfit_dict('xexp', 'f', h_s, t_s, g_s, l_s, f_s, b_s, covers_face=cov_f)

    glaziers_entry = {
        'id': 'glaziers',
        'name': 'Laitwal Glaziers (The Mara)',
        'note': (
            'Orientalized Tungang-Xanadu diaspora of Laitwal (Lightwall, kits/tungang/PLAN.md sections 1.4-1.5): '
            '0.94 scale compact tunnel-born opal-miners, potch-delvers, moonglass cutters, lens-grinders, and '
            'loj stewards with pale colourless skin, very large nocturnal eyes with eyeshine, cropped hair, and '
            'long bare tactile fingertips (tools/garments/cultures/xanadu_expats.py)'
        ),
        'scale': 0.94,
        'ancestry': {
            'african': [0.10, 0.35],
            'asian': [0.30, 0.65],
            'caucasian': [0.20, 0.55],
        },
        'skin': ['#ece9e4', '#e2ded8', '#d6d0c8'],
        'hair': ['#e8e6e0', '#d4d0c8', '#bab5ac', '#2a2830'],
        'eyes': ['#c8d2d8', '#aebcc4', '#d2ccb8', '#94a2ac'],
        'grey': 0.30,
        'beard': 0,
        'morph': {
            'height': [-0.75, -0.45],
            'muscle': [0.0, 0.35],
            'weight': [-0.20, 0.15],
            'proportions': [-0.30, 0.10],
            'eye-scale-decr-incr': [0.75, 1.0],
        },
        'styles': {
            'male': [
                'short04', 'short01', 'Low_Fade',
                'hair_s4_01_feathered_caesar_crop', 'hair_meso_01_cropped_fringe_cap',
            ],
            'female': [
                'short03', 'o4saken_chinesebob01', 'hair_s3_01_short_wavy_crop',
                'hair_s4_01_feathered_caesar_crop', 'hair_meso_01_cropped_fringe_cap',
            ],
        },
        'style_share': 1,
        'tiers': [
            ['xan_glazier_cutter', 0.65],
            ['xan_glazier_steward', 0.35],
        ],
        'tier_labels': g_labels,
        'outfits': g_outfits,
    }

    # 3. `xanadu_expats` (Group B: B1..B10 + homeland cross-link metadata)
    b_tiers = [[tid, share] for tid, share, *_ in GROUP_B_TIER_META]
    b_labels = {tid: label for tid, _, label, *_ in GROUP_B_TIER_META}
    b_outfits = {'male': {}, 'female': {}}
    cross_links = {}
    for tid, _, label, h_s, t_s, g_s, l_s, f_s, b_s, cov_f, home_people in GROUP_B_TIER_META:
        mods = ['mod_gills'] if tid == 'xan_pearl_comprador' else None
        m_dict = _tier_outfit_dict('xexp', 'm', h_s, t_s, g_s, l_s, f_s, b_s, covers_face=cov_f, extra_mods=mods)
        f_dict = _tier_outfit_dict('xexp', 'f', h_s, t_s, g_s, l_s, f_s, b_s, covers_face=cov_f, extra_mods=mods)
        b_outfits['male'][tid] = m_dict
        b_outfits['female'][tid] = f_dict
        cross_links.setdefault(home_people, {})[tid] = {
            'label': label,
            'male': m_dict,
            'female': f_dict,
        }

    expats_entry = {
        'id': 'xanadu_expats',
        'name': 'Foreign Traders, Concessionaires & Envoys in Xanadu',
        'note': (
            'Treaty-port factors, concession engineers, mercenaries, and diplomatic envoys resident across '
            'Erewhon, Qiblai, Strongbow, Thalaba, Gihon, and Laitwal, blending homeland dress with Xanadu '
            'climatic & sumptuary adaptations (tools/garments/cultures/xanadu_expats.py)'
        ),
        'ancestry': {
            'african': [0.10, 0.45],
            'asian': [0.25, 0.70],
            'caucasian': [0.20, 0.65],
        },
        'skin': ['#ebd3be', '#d7ae88', '#b88b62', '#8e6242', '#5e3f2a'],
        'hair': ['#120e0c', '#221a14', '#3b2a1e', '#6d4a2c'],
        'eyes': ['#2a1a10', '#3b2414', '#5a3a22', '#4e6a80', '#4a7c59'],
        'grey': 0.48,
        'beard': 0.35,
        'styles': {
            'male': ['short02', 'long01', 'ponytail01', 'Short_Hair_B', 'Low_Fade'],
            'female': ['o4saken_chinesebob01', 'elvs_braid_bun', 'braid01', 'long01', 'bob02'],
        },
        'tiers': b_tiers,
        'tier_labels': b_labels,
        'outfits': b_outfits,
    }

    return [catch_entry, glaziers_entry, expats_entry], cross_links


def build_caravaneers_kit():
    """Compile all 240 Group A + Group B procedural pieces across `mpfb_male` and `mpfb_female`."""
    entries = []
    entries.extend(build_catch_caravans_kit())
    entries.extend(build_xanadu_expats_kit())
    return entries


def main():
    t0 = time.time()
    kit_entries = build_caravaneers_kit()
    peoples_entries, cross_links = build_peoples_entries()

    # Post-compile manifest integrity checks
    assert len(kit_entries) == 240, f'Expected 240 compiled pieces, got {len(kit_entries)}'
    by_body_ids = {'mpfb_male': set(), 'mpfb_female': set()}
    for e in kit_entries:
        b_id = e.get('_body')
        assert b_id in ('mpfb_male', 'mpfb_female'), f"Missing/invalid _body on {e.get('id')}: {b_id}"
        glb_path = ROOT / e['glb']
        morph_path = glb_path.with_suffix('.morph.bin')
        assert glb_path.exists() and glb_path.stat().st_size > 100, f'Missing GLB: {glb_path}'
        assert morph_path.exists() and morph_path.stat().st_size > 16, f'Missing morph.bin: {morph_path}'
        by_body_ids[b_id].add(e['id'])

    for p_entry in peoples_entries:
        for sex_key, body_key in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
            for tid, odict in p_entry['outfits'][sex_key].items():
                for slot_k in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                    gid_ref = odict[slot_k]
                    assert gid_ref in by_body_ids[body_key], (
                        f"Missing {body_key} piece {gid_ref} referenced by {p_entry['id']}.{sex_key}.{tid}.{slot_k}"
                    )

    manifest_path = CULTURES_DIR / 'caravaneers_manifest.json'
    manifest = {
        'cultures': ['catch_twins_caravaneers', 'glaziers', 'xanadu_expats'],
        'total_pieces': len(kit_entries),
        'kit_entries': kit_entries,
        'peoples_entries': peoples_entries,
        'cross_links': cross_links,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    dt = time.time() - t0
    print(f'\nSUCCESS: Compiled {len(kit_entries)} pieces (120 male + 120 female) across 20 tiers in {dt:.1f}s.')
    print(f'Wrote manifest -> {manifest_path}')


if __name__ == '__main__':
    main()
