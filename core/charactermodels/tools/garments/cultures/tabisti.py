"""The Tabisti (`tabisti` / *Ibisen* & Reed-Lake — Maghrebi Amazigh + Andean) Complete 15-Tier Wardrobe.

Orchestrates `tabisti_terraces_reed.py` (Tiers 1–8) and `tabisti_abyss_altar.py` (Tiers 9–15)
across both `mpfb_male` (`m`) and `mpfb_female` (`f`) (`174` procedural pieces total, `0` Meshy hero splits),
validates 100% Male & Female outfit slot parity across all 15 tiers, and writes `tabisti_manifest.json`
without modifying shared repository manifests (`kit.json`, `peoples.json`, `paint.py`, `core.py`).
"""
import json
from pathlib import Path

if __package__ in (None, ''):
    import sys
    _TOOLS = Path(__file__).resolve().parents[2]
    if str(_TOOLS) not in sys.path:
        sys.path.insert(0, str(_TOOLS))
    from garments.cultures.tabisti_terraces_reed import build_tabisti_terraces_reed_for_sex
    from garments.cultures.tabisti_abyss_altar import build_tabisti_abyss_altar_for_sex
else:
    from .tabisti_terraces_reed import build_tabisti_terraces_reed_for_sex
    from .tabisti_abyss_altar import build_tabisti_abyss_altar_for_sex


MANIFEST_PATH = Path(__file__).resolve().parent / 'tabisti_manifest.json'


def _outfits_for_sex(sex):
    """Return the complete 15-tier outfit dictionary for `sex` (`'m'` or `'f'`)."""
    return {
        'peasant': {
            'head': f'tab_{sex}_peasant_chullo',
            'torso': 'tab_m_peasant_uncu' if sex == 'm' else 'tab_f_peasant_anacu',
            'legs': 'tab_m_peasant_wara' if sex == 'm' else 'tab_f_peasant_pollera',
            'feet': f'tab_{sex}_peasant_ojota',
            'back': f'tab_{sex}_peasant_qepi',
        },
        'scarp_porter': {
            'head': f'tab_{sex}_porter_chullo',
            'torso': f'tab_{sex}_porter_uncu',
            'gloves': f'tab_{sex}_porter_gloves',
            'legs': f'tab_{sex}_porter_trousers',
            'feet': f'tab_{sex}_porter_boots',
            'back': f'tab_{sex}_porter_rack',
        },
        'reed_weaver': {
            'head': f'tab_{sex}_weaver_montera',
            'torso': f'tab_{sex}_weaver_tunic',
            'legs': f'tab_{sex}_weaver_breeches',
            'feet': f'tab_{sex}_weaver_sandals',
            'back': f'tab_{sex}_weaver_creel',
        },
        'trade': {
            'head': f'tab_{sex}_trade_tagelmust',
            'torso': f'tab_{sex}_trade_jellaba',
            'legs': f'tab_{sex}_trade_serouel',
            'feet': f'tab_{sex}_trade_babouche',
            'back': f'tab_{sex}_trade_satchel',
        },
        'dredger': {
            'head': f'tab_{sex}_dredger_wrap',
            'torso': f'tab_{sex}_dredger_tunic',
            'gloves': f'tab_{sex}_dredger_gauntlets',
            'legs': f'tab_{sex}_dredger_leggings',
            'feet': f'tab_{sex}_dredger_boots',
            'back': f'tab_{sex}_dredger_hod',
        },
        'tin_smith': {
            'head': f'tab_{sex}_smith_pillbox',
            'torso': f'tab_{sex}_smith_tabard',
            'gloves': f'tab_{sex}_smith_cuffs',
            'legs': f'tab_{sex}_smith_trousers',
            'feet': f'tab_{sex}_smith_boots',
            'back': f'tab_{sex}_smith_rack',
        },
        'scarp_slinger': {
            'head': f'tab_{sex}_slinger_chullo',
            'torso': f'tab_{sex}_slinger_vest',
            'gloves': f'tab_{sex}_slinger_bracers',
            'legs': f'tab_{sex}_slinger_breeches',
            'feet': f'tab_{sex}_slinger_boots',
            'back': f'tab_{sex}_slinger_buckler',
        },
        'palisade_halberdier': {
            'head': f'tab_{sex}_halberdier_cabasset',
            'torso': f'tab_{sex}_halberdier_cuirass',
            'gloves': f'tab_{sex}_halberdier_gauntlets',
            'legs': f'tab_{sex}_halberdier_trousers',
            'feet': f'tab_{sex}_halberdier_boots',
            'back': f'tab_{sex}_halberdier_badge',
        },
        'lizard_lancer': {
            'head': f'tab_{sex}_lancer_tagelmust',
            'torso': f'tab_{sex}_lancer_selham',
            'gloves': f'tab_{sex}_lancer_gauntlets',
            'legs': f'tab_{sex}_lancer_serouel',
            'feet': f'tab_{sex}_lancer_boots',
            'back': f'tab_{sex}_lancer_quiver',
        },
        'altar_priest': {
            'head': f'tab_{sex}_priest_mitre',
            'torso': f'tab_{sex}_priest_robe',
            'gloves': f'tab_{sex}_priest_cuffs',
            'legs': f'tab_{sex}_priest_undertrousers',
            'feet': f'tab_{sex}_priest_sandals',
            'back': f'tab_{sex}_priest_banner',
            'type': 'important_npc',
        },
        'salt_oracle': {
            'head': f'tab_{sex}_oracle_hood',
            'torso': f'tab_{sex}_oracle_robe',
            'gloves': f'tab_{sex}_oracle_wraps',
            'legs': f'tab_{sex}_oracle_trousers',
            'feet': f'tab_{sex}_oracle_sandals',
            'back': f'tab_{sex}_oracle_satchel',
        },
        'verge_mayor': {
            'head': f'tab_{sex}_mayor_tagelmust',
            'torso': f'tab_{sex}_mayor_selham',
            'gloves': f'tab_{sex}_mayor_gloves',
            'legs': f'tab_{sex}_mayor_serouel',
            'feet': f'tab_{sex}_mayor_boots',
            'back': f'tab_{sex}_mayor_case',
            'type': 'important_npc',
        },
        'headman': {
            'head': f'tab_{sex}_headman_crown',
            'torso': f'tab_{sex}_headman_uncu',
            'gloves': f'tab_{sex}_headman_bracers',
            'legs': f'tab_{sex}_headman_serouel',
            'feet': f'tab_{sex}_headman_boots',
            'back': f'tab_{sex}_headman_standard',
            'type': 'important_npc',
        },
        'pc_azure_emir': {
            'head': f'tab_{sex}_pc_emir_tagelmust',
            'torso': f'tab_{sex}_pc_emir_selham',
            'gloves': f'tab_{sex}_pc_emir_gloves',
            'legs': f'tab_{sex}_pc_emir_serouel',
            'feet': f'tab_{sex}_pc_emir_boots',
            'back': f'tab_{sex}_pc_emir_pack',
            'type': 'pc',
            'label': 'Indigo Tagelmust & Tocapu-Mirror Envoy (PC)',
        },
        'pc_scarp_warden': {
            'head': f'tab_{sex}_pc_warden_helm',
            'torso': f'tab_{sex}_pc_warden_cuirass',
            'gloves': f'tab_{sex}_pc_warden_gauntlets',
            'legs': f'tab_{sex}_pc_warden_greaves',
            'feet': f'tab_{sex}_pc_warden_boots',
            'back': f'tab_{sex}_pc_warden_buckler',
            'type': 'pc',
            'label': 'Atlas-Burnous & Uncu Cliff-Champion (PC)',
        },
    }


def build_tabisti_peoples_entry():
    """Return the complete `peoples.json` entry dict for `tabisti` (preserving phenotype/sliders + aliases)."""
    tiers = [
        ['peasant', 0.20],
        ['scarp_porter', 0.11],
        ['reed_weaver', 0.11],
        ['trade', 0.10],
        ['dredger', 0.09],
        ['tin_smith', 0.06],
        ['scarp_slinger', 0.08],
        ['palisade_halberdier', 0.06],
        ['lizard_lancer', 0.05],
        ['altar_priest', 0.04],
        ['salt_oracle', 0.03],
        ['verge_mayor', 0.04],
        ['headman', 0.03],
        ['pc_azure_emir', 0.00],
        ['pc_scarp_warden', 0.00],
    ]
    stranger_sum = round(sum(sh for tid, sh in tiers if not tid.startswith('pc_')), 6)
    assert stranger_sum == 1.0, f'Stranger tier shares must sum to 1.00, got {stranger_sum}'

    return {
        'id': 'tabisti',
        'aliases': ['abyssal', 'eastabyss', 'reed_lake'],
        'name': 'Tabisti (Ibisen & Reed Lake)',
        'note': (
            'The Ibisen (Tabisti, speaking Amazigh-template Tabist) of the hyperbaric East Abyss salt-deltas '
            '(Tabist, Liikofi, Mungo, Lower Verge) and their Reed Lake & sub-rim cataract-terrace kinsfolk '
            '(LORE.md §6.9–6.10, tongues-of-krator.html): Maghrebi Atlas burnous/selham/tagelmust cloaks, '
            'triangular silver tizerzai fibulae, curved koummya daggers, Tifinagh-like Yaz (ⵣ) salt-marks, '
            'and sacred glinting tin-mirror cladding fused seamlessly with Andean warp-faced uncu tunics, '
            'ear-flap chullo caps, braided warak\'a brow-slings, awayo/q\'epi cliff-packs, vulcanized rubber '
            'ojota sandals, and the stepped salt-white Temple of the Altar (tools/garments/cultures/tabisti.py).'
        ),
        'ancestry': {
            'african': [0.05, 0.2],
            'asian': [0.6, 0.85],
            'caucasian': [0.05, 0.2],
        },
        'skin': ['#c69870', '#aa7b54', '#8a603e'],
        'hair': ['#110e0c', '#1b1612', '#2a2119'],
        'eyes': ['#2a1a10', '#3b2414'],
        'grey': 0.5,
        'beard': 0.1,
        'morph': {
            'height': [-0.6, 0.0],
        },
        'styles': {
            'male': ['short02', 'long01', 'braid01', 'ponytail01'],
            'female': ['braid01', 'elvs_double_mh_braid', 'long01', 'ponytail01'],
        },
        'tiers': tiers,
        'tier_labels': {
            'peasant': 'Sub-Rim Cataract Terrace & Salt-Rice Cultivator',
            'scarp_porter': "Verge & Furrow Cliff-Switchback Q'epi Porter",
            'reed_weaver': 'Reed Lake Totora Boatman & Chakana Weaver',
            'trade': 'Mungo & Liikofi Shore-Market Factor',
            'dredger': 'Abyssal Brine-Pan & Relic-Container Dredger',
            'tin_smith': 'Ibisen Tin-Mirror & Silver Tizerzai Artisan',
            'scarp_slinger': "Cataract-Terrace Warak'a Slinger",
            'palisade_halberdier': 'Tabisti Palisade & Lower-Verge Toll Halberdier',
            'lizard_lancer': 'Dense-Air Riding-Lizard & Marsh-Emu Outrider',
            'altar_priest': 'Priest of the Crystal-Fire Altar (Yaz Banner-Keeper)',
            'salt_oracle': 'Tifinagh Salt-Mark Diviner & Swamp-Copal Mystic',
            'verge_mayor': 'Lower Verge Magistracy & Treaty-Port Syndic',
            'headman': 'Kasbah-Pukara Headman of Tabist & Liikofi',
            'pc_azure_emir': 'Indigo Tagelmust & Tocapu-Mirror Envoy (PC)',
            'pc_scarp_warden': 'Atlas-Burnous & Uncu Cliff-Champion (PC)',
        },
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_tabisti_kit(write_manifest=True):
    """Compile all 174 Tabisti M+F garment pieces across all 15 tiers and optionally write `tabisti_manifest.json`."""
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(build_tabisti_terraces_reed_for_sex(sex, body_id))
        entries.extend(build_tabisti_abyss_altar_for_sex(sex, body_id))

    peoples_entry = build_tabisti_peoples_entry()

    # Validate 100% Male/Female outfit slot parity and compiled entry coverage
    by_body_id = {(e['_body'], e['id']): e for e in entries}
    slots_check = ('head', 'torso', 'gloves', 'legs', 'feet', 'back')
    m_out = peoples_entry['outfits']['male']
    f_out = peoples_entry['outfits']['female']
    assert list(m_out.keys()) == list(f_out.keys()), 'Male and female tier lists differ!'
    assert len(m_out) == 15, f'Expected 15 Tabisti tiers, got {len(m_out)}'
    for tid in m_out:
        for sl in slots_check:
            assert (sl in m_out[tid]) == (sl in f_out[tid]), f'Slot parity mismatch on {tid}.{sl}!'
            if sl in m_out[tid]:
                mgid = m_out[tid][sl]
                fgid = f_out[tid][sl]
                assert ('mpfb_male', mgid) in by_body_id, f'Missing male entry {mgid} for {tid}.{sl}'
                assert ('mpfb_female', fgid) in by_body_id, f'Missing female entry {fgid} for {tid}.{sl}'
                assert by_body_id[('mpfb_male', mgid)]['slot'] == sl
                assert by_body_id[('mpfb_female', fgid)]['slot'] == sl

    if write_manifest:
        manifest = {
            'culture': 'tabisti',
            'kit_entries': entries,
            'peoples_entry': peoples_entry,
        }
        MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
        print(f'Wrote {MANIFEST_PATH} ({len(entries)} compiled pieces across {len(m_out)} M+F tiers).')
    return entries


if __name__ == '__main__':
    build_tabisti_kit(write_manifest=True)
