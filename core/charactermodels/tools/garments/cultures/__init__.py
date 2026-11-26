"""Layer 4: Culture-Specific Wardrobe Modules (`tools/garments/cultures/`).

Consolidates all procedural outfit builders by culture so no culture or batch
vendors helper functions from another culture or batch. All outfit builders
import shared geometry primitives from `garments.types`, motifs from `garments.paint`,
and rig/GLB assembly from `garments.core`.
"""
from pathlib import Path
import sys

# the batch builders live beside this file (brought in from Gemini's scratch folder on 2026-11-06; the review,
# section 1): they put their own folder on sys.path and import each other by name, so this does the same
HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import build_inspired_outfits as _b1
import build_batch2_outfits as _b2
from .yuni import build_yuni_kit
from .build_yuni_military import build_yuni_military_kit
from .historians import build_historians_kit
from .xanadu import build_xanadu_kit
from .tungang import build_tungang_kit
from .dasri import build_dasri_kit
from .tabisti import build_tabisti_kit
from .catch_caravans import build_catch_caravans_kit
from .xanadu_expats import build_xanadu_expats_kit
from .kimr import build_kimr_kit
from .cyber_liches import build_cyber_liches_kit
from .fellgangs import build_fellgangs_kit
from .iziz import build_iziz_kit
from .eternian import build_eternian_kit
from .extraplanar import build_extraplanar_kit
from .vothic import build_vothic_kit
from .iron_republic_full import build_iron_republic_kit
from .free_clans import build_free_clans_kit
from .yusar_full import build_yusar_full_kit
from .khaayken import build_khaayken_kit
from .jimjam import build_jimjam_kit
from .painted_men import build_painted_men_kit
from .islanders import build_islanders_kit
from .coyote_men import build_coyote_men_kit
from .bandits import build_bandits_kit
from .ring_sea_mariners import build_ring_sea_mariners_kit
from .screamers import build_screamers_kit
from .lizardmen import build_lizardmen_kit
from .frogmen import build_frogmen_kit
from .captives_and_arena import build_captives_and_arena_kit
from .hazmat_and_trades import build_hazmat_and_trades_kit
from .valley_mutants import build_valley_mutants_kit

# Culture-indexed registry of outfit builder functions
CULTURE_BUILDERS = {
    'chichani': [
        build_vothic_kit,
    ],
    'voth_arcologies': [
        build_vothic_kit,
    ],
    'beast_riders': [
        _b1.build_beast_stalker,
        _b1.build_beast_lancer,
        _b1.build_beast_cataphract,
        _b2.build_beast_amazon,
    ],
    'izani': [
        build_iziz_kit,
        _b1.build_hykk_hierophant,
        _b1.build_hykk_heliarch,
        _b1.build_dalab_heliophant,
        _b2.build_iziz_phil,
    ],
    'hykkousoi': [],
    'dalabites': [
        _b2.build_dalab_genepriest,
    ],
    'iron_republic': [
        build_iron_republic_kit,
    ],
    'rustic_clansmen': [
        build_free_clans_kit,
    ],
    'painted_men': [
        build_painted_men_kit,
    ],
    'eastern_nomads': [
        build_dasri_kit,
    ],
    'dasri': [
        build_dasri_kit,
    ],
    'abyssal': [
        build_tabisti_kit,
    ],
    'tabisti': [
        build_tabisti_kit,
    ],
    'catch_twins_caravaneers': [
        build_catch_caravans_kit,
    ],
    'xanadu_expats': [
        build_xanadu_expats_kit,
    ],
    'xanadu': [
        build_xanadu_kit,
    ],
    'jimjam': [
        build_jimjam_kit,
    ],
    'islanders': [
        build_islanders_kit,
    ],
    'yuni': [
        build_yuni_kit,
        _b1.build_yuni_sentinel,
        _b2.build_yuni_breacher,
        build_yuni_military_kit,
    ],
    'eternian': [
        build_eternian_kit,
    ],
    'yusar': [
        build_yusar_full_kit,
    ],
    'historians': [
        build_historians_kit,
    ],
    'tungang': [
        build_tungang_kit,
    ],
    'kimr': [
        build_kimr_kit,
    ],
    'cyber_liches': [
        build_cyber_liches_kit,
    ],
    'fellgangs': [
        build_fellgangs_kit,
    ],
    'extraplanar': [
        build_extraplanar_kit,
    ],
    'khaayken': [
        build_khaayken_kit,
    ],
    'coyote_men': [
        build_coyote_men_kit,
    ],
    'bandits': [
        build_bandits_kit,
    ],
    'ring_sea_mariners': [
        build_ring_sea_mariners_kit,
    ],
    'screamers': [
        build_screamers_kit,
    ],
    'lizardmen': [
        build_lizardmen_kit,
    ],
    'frogmen': [
        build_frogmen_kit,
    ],
    'captives_and_arena': [
        build_captives_and_arena_kit,
    ],
    'hazmat_and_trades': [
        build_hazmat_and_trades_kit,
    ],
    'valley_mutants': [
        build_valley_mutants_kit,
    ],
}


def build_culture(culture_id):
    """Build all extended outfits for a given culture_id and return their kit entries."""
    entries = []
    for fn in CULTURE_BUILDERS.get(culture_id, ()):
        entries.extend(fn())
    return entries
