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
from .historians import build_historians_kit
from .xanadu import build_xanadu_kit

# Culture-indexed registry of outfit builder functions
CULTURE_BUILDERS = {
    'chichani': [
        _b2.build_voth_scout,
        _b1.build_voth_confessor,
        _b2.build_voth_ordinator,
        _b2.build_voth_priest,
        _b2.build_voth_chosen,
        _b2.build_voth_cantor,
        _b2.build_voth_tzintzun,
    ],
    'beast_riders': [
        _b1.build_beast_stalker,
        _b1.build_beast_lancer,
        _b1.build_beast_cataphract,
        _b2.build_beast_amazon,
    ],
    'izani': [
        _b1.build_iziz_aedile,
        _b1.build_iziz_praetorian,
        _b1.build_iziz_watch,
        _b1.build_iziz_skirmisher,
        _b1.build_hykk_hierophant,
        _b1.build_hykk_heliarch,
        _b1.build_dalab_heliophant,
        _b2.build_iziz_phil,
    ],
    'hykkousoi': [],
    'dalabites': [],
    'iron_republic': [
        _b1.build_rep_magistrate,
        _b2.build_rep_commissar,
    ],
    'rustic_clansmen': [
        _b1.build_rustic_envoy,
        _b2.build_rustic_axeman,
    ],
    'painted_men': [
        _b1.build_painted_warden,
    ],
    'eastern_nomads': [
        _b1.build_nomad_patriarch,
        _b1.build_nomad_walker,
        _b1.build_nomad_oracle,
    ],
    'abyssal': [
        _b1.build_abyssal_dredger,
    ],
    'xanadu': [
        build_xanadu_kit,
    ],
    'jimjam': [
        _b1.build_jimjam_sibyl,
    ],
    'islanders': [
        _b1.build_island_shaman,
    ],
    'yuni': [
        build_yuni_kit,
        _b1.build_yuni_sentinel,
        _b2.build_yuni_breacher,
    ],
    'eternian': [
        _b2.build_eternian_prefect,
        _b2.build_eternian_censor,
        _b2.build_eternian_archivist,
        _b2.build_eternian_minister,
        _b2.build_eternian_warden,
    ],
    'yusar': [
        _b2.build_yusar_lightkeeper,
        _b2.build_yusar_dronemaster,
        _b2.build_yusar_electropriest,
        _b2.build_yusar_electromonk,
        _b2.build_yusar_corsair,
        _b2.build_yusar_hierophant,
    ],
    'historians': [
        build_historians_kit,
    ],
}


def build_culture(culture_id):
    """Build all extended outfits for a given culture_id and return their kit entries."""
    entries = []
    for fn in CULTURE_BUILDERS.get(culture_id, ()):
        entries.extend(fn())
    return entries
