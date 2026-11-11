#!/usr/bin/env python3
"""The Highlands kit's file list (kits/highlands/README.md; MODULARITY-PLAN.md step 4). A build takes the kit by name:

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'highlands'))
    import highlands as khl
    paths.update({f: p for f, p in khl.paths().items() if f not in paths})   # a local copy with the same name wins

The names are the ones the files had in settlements/highlands/src (moved unchanged 2026-11-03), so they keep their place
in every build's filename order. The kit draws through the Ancients core and the Iziz Vernacular's materials and helpers
(69b, 69c: kits/iziz-vernacular), which a build takes as before; its library bind (88y-highlands-matlib.js) is still
Highlands'. One culture's buildings are FOUNDATION + that culture's set (SETS), in filename order.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
# shared by the three sets: textures, materials, motifs, helpers, carving, the timber frame, the dress, the trades
# table, the furniture glue (catalog pieces placed through FURNISH) and the clocks' and orreries' animation. 71c-hl-openings.js
# (the real doors and glass) draws through the Vernacular's openings, 69e5-iziz-openings.js, and core/door's 10 and 20
# (KDOOR, KGLASS), which a build takes with it (OPENINGS below)
FOUNDATION = ['70-hl-tex.js', '71-hl-mat.js', '71b-hl-motif.js', '71c-hl-openings.js', '72-hl-helpers.js', '73-hl-carve.js', '73b-hl-frame.js',
              '88-hl-dress.js', '89-hl-trades.js', '89y-hl-furnish.js', '94-hl-anim.js']
SETS = {
    'republican': ['74-rep-dwell.js', '75-rep-trade.js', '76-rep-civic.js', '76c-rep-capital.js', '77-rep-guild.js',
                   '77b-rep-guild2.js', '78-rep-grand.js', '79-rep-land.js', '79b-rep-salvage.js', '79c-rep-apoc.js',
                   '79d-rep-scrap2.js', '79e-rep-arco.js', '79f-rep-shipbreak.js'],
    'rustic': ['80-rus-dwell.js', '81-rus-village.js', '81b-rus-salvage.js'],
    'tribal': ['84-tri-dwell.js', '85-tri-village.js', '85b-tri-salvage.js'],
}
FILES = sorted(FOUNDATION + [f for s in SETS.values() for f in s])


# what 71c-hl-openings.js draws through, read in place: the Vernacular's openings (IZDOOR, vnOpening, the vDoorLeaf and
# vWinClear items) and core/door's records and glass, by the names a build orders them under
_ROOT = os.path.dirname(os.path.dirname(HERE))
OPENINGS = {'10-core-door.js': os.path.join(_ROOT, 'core', 'door', '10-core-door.js'),
            '20-core-glass.js': os.path.join(_ROOT, 'core', 'door', '20-core-glass.js'),
            '30-core-door-leaf.js': os.path.join(_ROOT, 'core', 'door', '30-core-door-leaf.js'),   # the leaves' look (KDOORLEAF)
            '69e5-iziz-openings.js': os.path.join(_ROOT, 'kits', 'iziz-vernacular', 'src', '69e5-iziz-openings.js')}


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}


def culture_files(*sets):
    """FOUNDATION and the named sets' files, in filename order (a build that takes one culture, e.g. 'republican')."""
    return sorted(FOUNDATION + [f for s in sets for f in SETS[s]])
