#!/usr/bin/env python3
"""The Painted Men (Kwéent'x̱ / Highland Raider Tribes) building kit (kits/painted-men/README.md).

Split out of `kits/highlands` so the Iron Republic (`republican`) and free alpine cantons (`rustic`) carry pure Slavic /
Carpathian / Novgorodian woodwork, while the Painted Men retain their Tlingit / Pacific-Northwest black-red-teal formline
crest panels, ovoid/U-form/trigon painting, Raven/Orca/Bear/Frog totem poles, Chilkat-style house-fronts, stilted bamboo
huts, arched rib-vault longhouses, cliff-hung cantilever dwellings, and painted salvage roundhouses.

A build takes the kit by name:

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'painted-men'))
    import painted_men as kpm
    paths.update({f: p for f, p in kpm.full_paths().items() if f not in paths})

`paths()` returns this kit's own fragments (`83-pm-tlingit.js`, `84-tri-dwell.js`, `85-tri-village.js`, `85b-tri-salvage.js`);
`full_paths()` includes the shared base timber, log, bamboo, opening and furnish helpers from `kits/highlands` (`FOUNDATION`
without its Republican trades or clock/waterwheel animation) so a build can load Painted Men standalone or alongside Highlands.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
_ROOT = os.path.dirname(os.path.dirname(HERE))
_HL_SRC = os.path.join(_ROOT, 'kits', 'highlands', 'src')

SHARED_BASE = [
    '70-hl-tex.js', '71-hl-mat.js', '71b-hl-motif.js', '71c-hl-openings.js',
    '72-hl-helpers.js', '72c-hl-plan.js', '73-hl-carve.js',
    '88-hl-dress.js', '89y-hl-furnish.js',
]
FOUNDATION = ['83-pm-tlingit.js']
SETS = {
    'tribal': ['84-tri-dwell.js', '85-tri-village.js', '85b-tri-salvage.js'],
}
FILES = sorted(FOUNDATION + [f for s in SETS.values() for f in s])

OPENINGS = {
    '10-core-door.js': os.path.join(_ROOT, 'core', 'door', '10-core-door.js'),
    '20-core-glass.js': os.path.join(_ROOT, 'core', 'door', '20-core-glass.js'),
    '30-core-door-leaf.js': os.path.join(_ROOT, 'core', 'door', '30-core-door-leaf.js'),
    '69e5-iziz-openings.js': os.path.join(_ROOT, 'kits', 'iziz-vernacular', 'src', '69e5-iziz-openings.js'),
}


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}


def full_paths():
    """Shared timber/bamboo/furnish base from kits/highlands plus this kit's Tlingit layer and dwellings."""
    out = {f: os.path.join(_HL_SRC, f) for f in SHARED_BASE}
    out.update(paths())
    return out
