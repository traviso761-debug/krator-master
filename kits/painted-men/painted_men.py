#!/usr/bin/env python3
"""The Painted Men (Payntja-Mana) building kit of the Northeast Danxia & Badland Cliffs (kits/painted-men/PLAN.md).

Rebuilt onto `core/engine` around an Australian Aboriginal (Arnhem Land rarrk cross-hatching, X-ray & Wandjina rock art,
Yanta-Rringka stencilled open hands, feathered Pukamani & Lorrkon poles) + Amazonian (bent canyon-oak & Stripe-bunchgrass
maloca halls) + Mesa Verde / Dogon seep-alcove architecture strictly dictated by `biomes/paintedhighlands` (zero bamboo,
zero kiln-fired brick/pottery, <= 4.20 m juniper viga spans).

For a world or settlement page, prefer the sealed closure bundle (`kit_bundle.bundle('PMK')`), which isolates all
`core/engine` globals cleanly:

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'painted-men'))
    import kit_bundle as kpm_bundle
    js, used_files = kpm_bundle.bundle('PMK')

`painted_men.py` also retains `path()`, `paths()`, `full_paths()`, and `bundle()` so any caller importing `painted_men`
works seamlessly.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
_ROOT = os.path.dirname(os.path.dirname(HERE))

KIT_ID = 'painted-men'
CULTURE = 'painted'
BUNDLE_KEY = 'PMK'

FOUNDATION = [
    '26k-kit.js',
    '27v-pm-vstack.js',
    '27z-pm-matfix.js',
    '34-pm-trades.js',
    '39-pm-furn.js',
    '40-pm-kit.js',
    '41-pm-rarrk.js',
]

SETS = {
    'dwellings': ['50-pm-dwell.js'],
    'sacred_defence': ['54-pm-sacred-def.js'],
    'works_salvage': ['62-pm-works-salvage.js'],
    'showcase': ['70-pm-cliff-alcove.js'],
}

FILES = FOUNDATION + SETS['dwellings'] + SETS['sacred_defence'] + SETS['works_salvage'] + SETS['showcase']


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}


def full_paths():
    """Core-engine + Painted Men kit fragments for a standalone core/engine host."""
    sys.path.insert(0, os.path.join(_ROOT, 'core', 'engine'))
    import engine as kengine
    out = dict(kengine.paths())
    out.update(paths())
    return out


def bundle(key=BUNDLE_KEY):
    """Sealed world bundle (`var PMK = (function(){ ... })();`)."""
    import kit_bundle
    return kit_bundle.bundle(key)
