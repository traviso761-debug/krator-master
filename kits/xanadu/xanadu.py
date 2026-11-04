#!/usr/bin/env python3
"""The Xanadu kit's file list (kits/xanadu/README.md; MODULARITY-PLAN.md step 4). A build takes the kit by name:

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'xanadu'))
    import xanadu as kxa
    paths.update({f: p for f, p in kxa.paths().items() if f not in paths})   # a local copy with the same name wins

The names are the ones the files had in settlements/xanadu/src (moved unchanged 2026-11-03), so they keep their place in
every build's filename order. The kit draws through the Ancients core (kits/ancients/src, core/materials) and the Iziz
Vernacular's materials and helpers (69b, 69c: kits/iziz-vernacular). Its library bind (88y-xanadu-matlib.js) and its
texture pack (materials.json, tex/) are still Xanadu's. kit_bundle.py seals the kit for another world's page (XAK).
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
FOUNDATION = ['70-xa-tex.js', '71-xa-mat.js', '71c-xa-openings.js', '72-xa-helpers.js', '88-xa-dress.js', '89-xa-trades.js']
BUILDINGS = ['74-xa-dwell.js', '75-xa-trade.js', '76-xa-farm.js', '77-xa-sacred.js', '78-xa-palace.js', '79-xa-guild.js',
             '80-xa-military.js', '81-xa-public.js', '82-xa-hill.js', '83-xa-turk.js', '84-xa-grandbath.js', '85-xa-water.js',
             '85b-xa-garden.js', '86-xa-vizier.js', '86b-xa-plants.js', '87-xa-spicer.js', '87b-xa-andean.js', '87c-xa-erewhon.js']
FILES = sorted(FOUNDATION + BUILDINGS)
# what the kit draws through, by name, and where each now lives
ANCIENTS_CORE = ['10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
                 '50-registry.js', '54-mat-concrete.js', '69-mat-salvage.js']          # kits/ancients/src
VERNACULAR = ['69b-vern-mat.js', '69c-vern-helpers.js']                                 # kits/iziz-vernacular/src
# the real doors and glass (71c-xa-openings.js) draw through the Vernacular's openings (69e5: IZDOOR.leaf, the vDoorLeaf and
# vWinClear items, kits/iziz-vernacular/src) and core/door's records and glass (KDOOR, KGLASS), read in place
OPENINGS_VERN = ['69e5-iziz-openings.js']                                               # kits/iziz-vernacular/src
DOOR = ['10-core-door.js', '20-core-glass.js', '30-core-door-leaf.js']                  # core/door (30: the leaves' look, KDOORLEAF)


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}
