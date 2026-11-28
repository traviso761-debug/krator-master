"""The Dasri Wardrobe Kit (`dasri` — Bedouin × Chiricahua/Mescalero Apache).

Replaces `eastern_nomads`' 3 male-only foreign-borrowed robes with 16 canon-organic Bedouin + Apache
syncretic tiers at 100% `mpfb_male` (`dsr_m_*`) & `mpfb_female` (`dsr_f_*`) parity (192 pieces across
`head`, `torso`, `gloves`, `legs`, `feet`, and `back`), preserving backward compatibility via
`"aliases": ["eastern_nomads", "nomad"]`.

Run standalone to compile all `.glb` + `.morph.bin` pieces and emit `dasri_manifest.json`:
    python tools/garments/cultures/dasri.py
"""
import json
import sys
import time
from pathlib import Path

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

if __package__:
    from .dasri_common import dasri_motif_scope
    from .dasri_jabal_bowl import build_dasri_jabal_bowl
    from .dasri_confederacy import build_dasri_confederacy
else:
    from garments.cultures.dasri_common import dasri_motif_scope
    from garments.cultures.dasri_jabal_bowl import build_dasri_jabal_bowl
    from garments.cultures.dasri_confederacy import build_dasri_confederacy


DASRI_TIER_SHARES = [
    ['peasant', 0.16],
    ['town', 0.12],
    ['mezcal_distiller', 0.07],
    ['train_drover', 0.07],
    ['mantis_incense', 0.06],
    ['clan_herder', 0.12],
    ['walker', 0.07],
    ['badland_prospector', 0.06],
    ['dune_raider', 0.06],
    ['canyon_warden', 0.06],
    ['horse_outrider', 0.05],
    ['aquifer_warden', 0.03],
    ['oracle', 0.03],
    ['jabal_syndic', 0.02],
    ['patriarch', 0.02],
    ['pc_mezcalero_corsair', 0.0],
]

DASRI_TIER_LABELS = {
    'peasant': 'Jabal Wadi & Agave Terrace Cultivator',
    'town': 'Jabal Tower-Quarter Citizen',
    'mezcal_distiller': 'Jabal & Arfwai Copper-Alembic Mezcalier',
    'train_drover': 'Train of Jabal Salt & Borax Factor',
    'mantis_incense': "Mantis Dragon's-Blood & Frankincense Harvester",
    'clan_herder': 'Free Qabila Dromedary & Goat Pastoralist',
    'walker': 'Chakipunku & Caliche Salt-Flat Trail-Runner',
    'badland_prospector': 'Rifar al-Dhahab High-Wadi Gold & Kimberlite Panner',
    'dune_raider': 'N1 Shade Dune Raider / Ndee-Bisht Lancer',
    'canyon_warden': 'Shade Canyon Guard & Khafara Escort',
    'horse_outrider': 'Wahat al-Shamal Steppe-Horse Outrider',
    'aquifer_warden': 'Warden of the Deep Aquifer (Shade Waterfall Shrine)',
    'oracle': 'Gaan-Horned Desert Spirit-Dancer & Sand-Oracle',
    'jabal_syndic': 'Jabal Mafraj Tower-Syndic / Qamariya Emir',
    'patriarch': 'Majlis Paramount Shaykh of the Horns',
    'pc_mezcalero_corsair': 'Crimson Bisht & Buckskin Desert-Stalker (PC Hero)',
}


def _outfits_for_sex(sex):
    outfits = {
        'peasant': {
            'head': f'dsr_{sex}_peasant_headband',
            'torso': f'dsr_{sex}_peasant_tunic',
            'gloves': f'dsr_{sex}_peasant_wraps',
            'legs': f'dsr_{sex}_peasant_sirwal',
            'feet': f'dsr_{sex}_peasant_boots',
            'back': f'dsr_{sex}_peasant_basket',
        },
        'town': {
            'head': f'dsr_{sex}_town_head',
            'torso': f'dsr_{sex}_town_robe',
            'gloves': f'dsr_{sex}_town_cuffs',
            'legs': f'dsr_{sex}_town_sirwal',
            'feet': f'dsr_{sex}_town_boots',
            'back': f'dsr_{sex}_town_bag',
        },
        'mezcal_distiller': {
            'head': f'dsr_{sex}_mezcal_hat',
            'torso': f'dsr_{sex}_mezcal_tunic',
            'gloves': f'dsr_{sex}_mezcal_gauntlets',
            'legs': f'dsr_{sex}_mezcal_trousers',
            'feet': f'dsr_{sex}_mezcal_boots',
            'back': f'dsr_{sex}_mezcal_alembic',
        },
        'train_drover': {
            'head': f'dsr_{sex}_drover_turban',
            'torso': f'dsr_{sex}_drover_bisht',
            'gloves': f'dsr_{sex}_drover_gloves',
            'legs': f'dsr_{sex}_drover_sirwal',
            'feet': f'dsr_{sex}_drover_boots',
            'back': f'dsr_{sex}_drover_panniers',
        },
        'mantis_incense': {
            'head': f'dsr_{sex}_mantis_cowl',
            'torso': f'dsr_{sex}_mantis_surcoat',
            'gloves': f'dsr_{sex}_mantis_wraps',
            'legs': f'dsr_{sex}_mantis_leggings',
            'feet': f'dsr_{sex}_mantis_boots',
            'back': f'dsr_{sex}_mantis_chest',
        },
        'clan_herder': {
            'head': f'dsr_{sex}_herder_headband',
            'torso': f'dsr_{sex}_herder_warshirt',
            'gloves': f'dsr_{sex}_herder_cuffs',
            'legs': f'dsr_{sex}_herder_clout',
            'feet': f'dsr_{sex}_herder_boots',
            'back': f'dsr_{sex}_herder_waterskin',
        },
        'walker': {
            'head': f'dsr_{sex}_walker_litham',
            'torso': f'dsr_{sex}_walker_robe',
            'gloves': f'dsr_{sex}_walker_wraps',
            'legs': f'dsr_{sex}_walker_sirwal',
            'feet': f'dsr_{sex}_walker_boots',
            'back': f'dsr_{sex}_walker_pack',
        },
        'badland_prospector': {
            'head': f'dsr_{sex}_prospector_cap',
            'torso': f'dsr_{sex}_prospector_coat',
            'gloves': f'dsr_{sex}_prospector_cuffs',
            'legs': f'dsr_{sex}_prospector_trousers',
            'feet': f'dsr_{sex}_prospector_boots',
            'back': f'dsr_{sex}_prospector_panpack',
        },
        'dune_raider': {
            'head': f'dsr_{sex}_raider_headband',
            'torso': f'dsr_{sex}_raider_cuirass',
            'gloves': f'dsr_{sex}_raider_bracers',
            'legs': f'dsr_{sex}_raider_sirwal',
            'feet': f'dsr_{sex}_raider_boots',
            'back': f'dsr_{sex}_raider_buckler',
        },
        'canyon_warden': {
            'head': f'dsr_{sex}_warden_helm',
            'torso': f'dsr_{sex}_warden_cuirass',
            'gloves': f'dsr_{sex}_warden_gauntlets',
            'legs': f'dsr_{sex}_warden_tassets',
            'feet': f'dsr_{sex}_warden_greaves',
            'back': f'dsr_{sex}_warden_cape',
        },
        'horse_outrider': {
            'head': f'dsr_{sex}_outrider_headband',
            'torso': f'dsr_{sex}_outrider_coat',
            'gloves': f'dsr_{sex}_outrider_bracers',
            'legs': f'dsr_{sex}_outrider_breeches',
            'feet': f'dsr_{sex}_outrider_boots',
            'back': f'dsr_{sex}_outrider_quiver',
        },
        'aquifer_warden': {
            'head': f'dsr_{sex}_aquifer_hood',
            'torso': f'dsr_{sex}_aquifer_robe',
            'gloves': f'dsr_{sex}_aquifer_cuffs',
            'legs': f'dsr_{sex}_aquifer_sirwal',
            'feet': f'dsr_{sex}_aquifer_moccasins',
            'back': f'dsr_{sex}_aquifer_amphora',
        },
        'oracle': {
            'head': f'dsr_{sex}_oracle_crown',
            'torso': f'dsr_{sex}_oracle_tunic',
            'gloves': f'dsr_{sex}_oracle_gauntlets',
            'legs': f'dsr_{sex}_oracle_kilt',
            'feet': f'dsr_{sex}_oracle_boots',
            'back': f'dsr_{sex}_oracle_wands',
        },
        'jabal_syndic': {
            'head': f'dsr_{sex}_syndic_imama',
            'torso': f'dsr_{sex}_syndic_bisht',
            'gloves': f'dsr_{sex}_syndic_cuffs',
            'legs': f'dsr_{sex}_syndic_sirwal',
            'feet': f'dsr_{sex}_syndic_boots',
            'back': f'dsr_{sex}_syndic_cape',
            'type': 'important_npc',
        },
        'patriarch': {
            'head': f'dsr_{sex}_patriarch_crown',
            'torso': f'dsr_{sex}_patriarch_coat',
            'gloves': f'dsr_{sex}_patriarch_bracers',
            'legs': f'dsr_{sex}_patriarch_sirwal',
            'feet': f'dsr_{sex}_patriarch_boots',
            'back': f'dsr_{sex}_patriarch_cape',
            'type': 'important_npc',
        },
        'pc_mezcalero_corsair': {
            'head': f'dsr_{sex}_pc_corsair_headband',
            'torso': f'dsr_{sex}_pc_corsair_vest',
            'gloves': f'dsr_{sex}_pc_corsair_bracers',
            'legs': f'dsr_{sex}_pc_corsair_pants',
            'feet': f'dsr_{sex}_pc_corsair_boots',
            'back': f'dsr_{sex}_pc_corsair_pack',
            'type': 'pc',
            'label': 'Crimson Bisht & Buckskin Desert-Stalker (PC Hero)',
        },
    }
    return outfits


def build_dasri_peoples_entry():
    """Construct complete `peoples.json` entry for `dasri` preserving `eastern_nomads` phenotype."""
    return {
        'id': 'dasri',
        'aliases': ['eastern_nomads', 'nomad'],
        'name': 'Dasri',
        'note': (
            "The Dasri of the Jabal Shiekdom, sunken red-rock Shade, Mantis, and the Free Confederacy "
            "(LORE.md §6.8, PROPOSAL-JABAL-EAST-NOMADS.md, settlements/shade): Bedouin and Chiricahua/Mescalero "
            "Apache syncretism under the Sign of the Horns — flowing bisht/aba coats, keffiyeh/litham wraps bound "
            "with double black goat-hair 'iqal coils, Sana'a/Jabal juss chevron & qamariya brocades, silver hirz "
            "talisman cases, and curved jambiya daggers fused with smoke-ochre buckskin fringed war-shirts, "
            "crimson concho war-headbands, knee-high folded-top upturned-toe Apache ndee cactus-boots, copper "
            "mezcal alembic packs, and horned Gaan spirit-crowns (tools/garments/cultures/dasri.py)."
        ),
        'ancestry': {
            'african': [0.1, 0.3],
            'asian': [0.05, 0.2],
            'caucasian': [0.5, 0.75],
        },
        'skin': [
            '#d6ad86',
            '#bb8d63',
            '#9a6e48',
            '#7a5436',
        ],
        'hair': [
            '#120e0c',
            '#1f1813',
            '#2f231a',
        ],
        'eyes': [
            '#2a1a10',
            '#3b2414',
            '#5a3a22',
            '#6e5a2e',
        ],
        'grey': 0.45,
        'beard': 0.7,
        'styles': {
            'male': [
                'short02',
                'Short_Hair_B',
                'long01',
                'braid01',
                'ponytail01',
                'fourstrandbraid',
            ],
            'female': [
                'long01',
                'braid01',
                'fhair01',
                'elvs_island_princess_hair',
                'elvs_double_mh_braid',
                'fourstrandbraid',
            ],
        },
        'tiers': DASRI_TIER_SHARES,
        'tier_labels': DASRI_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_dasri_kit():
    """Compile all 16 Dasri tiers across `mpfb_male` and `mpfb_female` inside `dasri_motif_scope()`."""
    with dasri_motif_scope():
        entries = []
        entries.extend(build_dasri_jabal_bowl())
        entries.extend(build_dasri_confederacy())
    return entries


def _validate_manifest(kit_entries, peoples_entry):
    stranger_sum = sum(sh for tid, sh in peoples_entry['tiers'] if not tid.startswith('pc_'))
    assert abs(stranger_sum - 1.0) < 1e-9, f'Stranger tier shares sum to {stranger_sum}, expected 1.00'

    by_body_id = {}
    for ent in kit_entries:
        b_id = ent.get('_body')
        gid = ent.get('id')
        assert b_id in ('mpfb_male', 'mpfb_female'), f'Missing/invalid _body on {gid}: {b_id}'
        assert ent.get('culture') == 'dasri', f'Unexpected culture on {gid}: {ent.get("culture")}'
        key = (b_id, gid)
        assert key not in by_body_id, f'Duplicate kit_entry for {key}'
        by_body_id[key] = ent
        glb_p = ROOT / ent['glb']
        morph_p = glb_p.with_suffix('.morph.bin')
        assert glb_p.exists() and glb_p.stat().st_size > 500, f'Missing or empty GLB: {glb_p}'
        assert morph_p.exists() and morph_p.stat().st_size > 100, f'Missing or empty morph.bin: {morph_p}'

    for sex_key, body_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        sex_outfits = peoples_entry['outfits'][sex_key]
        assert len(sex_outfits) == 16, f'Expected 16 {sex_key} tiers, got {len(sex_outfits)}'
        for tid, spec in sex_outfits.items():
            for slot in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                if slot in spec:
                    pid = spec[slot]
                    assert (body_id, pid) in by_body_id, f'Outfit {sex_key}.{tid}.{slot} -> {pid} missing from {body_id}'
                    assert by_body_id[(body_id, pid)]['slot'] == slot, (
                        f'Slot mismatch on {pid}: expected {slot}, got {by_body_id[(body_id, pid)]["slot"]}'
                    )


def main():
    t0 = time.perf_counter()
    kit_entries = build_dasri_kit()
    peoples_entry = build_dasri_peoples_entry()
    _validate_manifest(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'dasri_manifest.json'
    manifest_data = {
        'culture': 'dasri',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Dasri pieces ({n_m} male, {n_f} female) across 16 tiers in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
