"""Layer 2: Garment-Type Structural Primitives."""

from .torso import (
    torso_tube,
    collar,
    stand_collar,
    izani_collar,
    collar_disc,
    cape,
    tabard,
    band,
    crossed_sash,
    pauldron,
    neck_ring,
)
from .limbs import (
    limb_tube,
    sleeve,
    sleeves,
    armbands,
    trousers,
    skirt,
)
from .footwear import (
    boot,
    boots,
    sandal,
)
from .headgear import (
    head_rings,
    sculpted_faceplate,
    sculpted_cranium,
    hood,
    brim,
    tower_hat,
    conical_hat,
    cone_hat,
    crown_band,
    fan,
    crest,
    wing,
    horn,
    turban,
)
from .accoutrements import (
    flap,
    blob,
    belt_sash,
    pouch_belt,
    izani_belt,
    sash_with_tail,
    izani_sash,
    stacked_belts,
    animal_belts,
    button_row,
    _buttons,
    eye_disc,
    pendants,
    tube,
    strap,
    tassel,
    rosette,
)

__all__ = [
    'torso_tube', 'collar', 'stand_collar', 'izani_collar', 'collar_disc',
    'cape', 'tabard', 'band', 'crossed_sash', 'pauldron', 'neck_ring',
    'limb_tube', 'sleeve', 'sleeves', 'armbands', 'trousers', 'skirt',
    'boot', 'boots', 'sandal',
    'head_rings', 'sculpted_faceplate', 'sculpted_cranium', 'hood', 'brim',
    'tower_hat', 'conical_hat', 'cone_hat', 'crown_band', 'fan', 'crest',
    'wing', 'horn', 'turban',
    'flap', 'blob', 'belt_sash', 'pouch_belt', 'izani_belt', 'sash_with_tail',
    'izani_sash', 'stacked_belts', 'animal_belts', 'button_row', '_buttons',
    'eye_disc', 'pendants', 'tube', 'strap', 'tassel', 'rosette',
]
