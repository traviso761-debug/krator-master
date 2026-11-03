#!/usr/bin/env python3
"""The Iziz Vernacular kit's file list (kits/iziz-vernacular/README.md; MODULARITY-PLAN.md step 4). A build takes the kit
by name, the way it takes core/engine or the host shell:

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'iziz-vernacular'))
    import vernacular as kvern
    paths.update({f: p for f, p in kvern.paths().items() if f not in paths})   # a local copy with the same name wins

The names are the ones the files had in settlements/iziz/src (moved unchanged 2026-11-03), so they keep their place in
every build's filename order. The kit draws through the Ancients core (kits/ancients/src: 10-core ... 69-mat-salvage,
core/materials), which a build takes as before; the Vernacular's own library bind (88y-iziz-matlib.js) is still Iziz's.
"""
import glob, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
# the kit's foundation, in filename order: materials and kit items, helpers, hollow bodies, openings, fixtures
BASE = ['69b-vern-mat.js', '69c-vern-helpers.js', '69e-vern-hollow.js', '69e5-iziz-openings.js', '69f-iziz-fixtures.js']
# the buildings: dwellings, trades, civic, infrastructure, works, land, guilds, the frontier, and the trades table
BUILDINGS = ['70-vern-dwellings.js', '71-vern-trade.js', '71a-vern-food.js', '71b-vern-cloth.js', '71c-vern-craft.js',
             '72-vern-civic.js', '73-vern-infra.js', '73b-vern-works.js', '73c-vern-land.js', '74-vern-guilds.js',
             '74b-vern-frontier.js', '74z-vern-trades.js']
FILES = BASE + BUILDINGS


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}


def building_files():
    """The building fragments a bundle takes, in filename order (the isle demo's and Verge's 7[0-4]*-vern-* globs)."""
    return sorted(glob.glob(os.path.join(SRC, '7[0-4]*-vern-*.js')))
