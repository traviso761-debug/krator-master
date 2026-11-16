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
ROOT = os.path.dirname(os.path.dirname(HERE))
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


# the Ancients core the kit draws through, in filename order: the Ancients kit's files, and core/materials' (opt/ for the
# opt-in world-UV hook). Iziz vendors the first group byte for byte (its --vendor-check), so a bundle takes them from the kit.
ANCIENTS_CORE = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js',
                 '38-helpers2.js', '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js', '69a-world-uv.js']
# what a bundle takes of the kit's foundation (69f-iziz-fixtures notes the fixtures for a page's core/tags: not a bundle's)
BUNDLE_BASE = ['69b-vern-mat.js', '69c-vern-helpers.js', '69e-vern-hollow.js', '69e5-iziz-openings.js']


def core_path(f):
    """An Ancients-core name: the Ancients kit's src/, else core/materials, else core/materials/opt."""
    for d in (os.path.join(ROOT, 'kits', 'ancients', 'src'), os.path.join(ROOT, 'core', 'materials'),
              os.path.join(ROOT, 'core', 'materials', 'opt')):
        p = os.path.join(d, f)
        if os.path.exists(p):
            return p
    raise FileNotFoundError('no Ancients-core file ' + f)


# core/door: the doors' records (KDOOR) and the glass (KGLASS) 69e5 draws with; a bundle carries them ahead of the kit
DOOR = [os.path.join(ROOT, 'core', 'door', f) for f in ('10-core-door.js', '20-core-glass.js', '30-core-door-leaf.js')]   # KDOORLEAF: the leaf styles' geometry


def bundle_files():
    """THE Vernacular bundle (settlements/iziz/VASSAL-KITS.md, "The bundle": one list, no third copy): the Ancients core,
    the kit's foundation and every building fragment, in filename order. Verge's and the isle demo's IZV take it and add
    their own extras (Verge: the Ancients funicular; the isle demo: Iziz's library bind, 88y-iziz-matlib.js)."""
    return DOOR + [core_path(f) for f in ANCIENTS_CORE] + [path(f) for f in BUNDLE_BASE] + building_files()


def building_files():
    """The building fragments a bundle takes, in filename order (the isle demo's and Verge's 7[0-4]*-vern-* globs)."""
    return sorted(glob.glob(os.path.join(SRC, '7[0-4]*-vern-*.js')))
