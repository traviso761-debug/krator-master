#!/usr/bin/env python3
"""The Shumari building kit's file list (kits/shumari/README.md; Phase SM6). A world build takes the kit in place
either by fragment list (`shumari.paths()`) or sealed in one closure (`kit_bundle.bundle()` -> `SMK`):

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'shumari'))
    import shumari as ksm
    paths.update({f: p for f, p in ksm.paths().items() if f not in paths})

Or for an open-world region (`openworld/shumar-north`, `openworld/shumar-south`) or `core/city` settlement (`settlements/shumar`):

    import kit_bundle as sm_bundle
    smk_js, smk_files = sm_bundle.bundle('SMK')
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')

FOUNDATION = [
    '26k-kit.js',
    '28-sm-mat.js',
    '40-sm-kit.js',
    '41-sm-dome.js',
    '68-sm-trades.js',
    '89-rows.js',
]

SETS = {
    'samples': ['45-sm-samples.js'],
    'dwellings': [
        '50-sm-dwell-poor.js',
        '51-sm-dwell-mid.js',
        '52-sm-dwell-rich.js',
        '56-sm-gorge-street.js',
    ],
    'cult': ['60-sm-cult.js'],
    'civic': ['61-sm-civic.js'],
    'defence': ['62-sm-defence.js'],
    'works': ['64-sm-works.js'],
    'trades': ['65-sm-trades.js'],
    'farms': ['66-sm-farms.js'],
}

BUILDINGS = sorted(f for fs in SETS.values() for f in fs)
FILES = sorted(FOUNDATION + BUILDINGS)


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}


def set_files(*sets):
    """FOUNDATION and the named sets' files, in filename order."""
    return sorted(FOUNDATION + [f for s in sets for f in SETS[s]])
