#!/usr/bin/env python3
"""The building-kit engine's file list (core/engine/README.md; MODULARITY-PLAN.md step 2). A kit's build.py takes it the
way it takes the host shell (core/host/host.py):

    sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
    import engine as kengine
    paths.update(kengine.paths())        # {fragment name: path}, before the kit's own src/ (a src/ copy with an engine
                                         # file's name wins for that build: record why in its KNOWN_ISSUES.md)

The names are the ones the files had in kits/scyvoi/src, so they keep their place in each kit's filename order."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FILES = [
    '10-core.js',        # the page's core: the error panel, the h3 hash and noise, units and frames
    '27-mat.js',         # the materials (MAT), vertex-colour and library modes
    '30-geo.js',         # the geometry engine: every primitive merged into a bucket per material key
    '36-def.js',         # the registry and placement: defBuilding, the records, doors
    '36o-open.js',       # real doors and glass on core/door: svLeaf, svDoorway, svPane (the page loads core/door)
    '36s-stair.js',      # stairs a walker climbs: svStair (open, solid, ladder), svWell, svLanding, and their core/walk strips
    '37-wk-rec.js',      # every box a building draws read as core/walk floors and blocks (KWALKBOX), so the walker collides
    '90-scene.js',       # the scene: renderer, the placeholder sky, ground, the sheet's layout from 89-rows.js
    '91f-furnish.js',    # the furniture adapter onto core/furnish
    '91i-interiors.js',  # the interiors (kits/interiors) a kit opts into with interiors(): planned, furnished, cut storey by storey
    '91n-night.js',      # the night lights
    '92-world.js',       # builds the world and names the views
    '93-anim.js',        # the clock (?t= pins it), smoke, the export's material table
    '99-host-take.js',   # the page handed to core/host (KHOST.take)
    '99-tail.html',      # the page's tail
]


# the core folders every kit on the engine reads (its build.py CORE_DIRS): the walk (core/walk and its box reader) is in them, so
# every kit's walker stands on its buildings' floors and stairs and is stopped by their walls (TODO.md, Viewers)
CORE_DIRS = ('shader', 'rand', 'materials/record', 'tags', 'furnish', 'atmos', 'door', 'walk', 'walk/box')
# the host files every kit on the engine takes beside core/host's SHELL: the polygon tool and the one key map (KHOST.standard)
HOST = ['94-host-polytool.js', '92k-host-keys.js']
# a kit with interiors takes the host's cut-away too, and the bundle's globals must not clash with its own names
INTERIORS_HOST = ['99-host-cutaway.js']
INTERIORS_GLOBALS = ('KratorInteriors', 'ROOM', 'furnishRoom', 'KIT_INTERIORS')
INTERIORS_FRAGMENT = '39i-interiors-bundle.js'


def interiors(sets):
    """The generated fragment a kit with interior sets adds to its virtual bodies (core/engine/README.md, "Interiors"):
    kits/interiors' core and the named sets (kit_bundle.bundle), then KIT_INTERIORS, which turns 91i-interiors.js on.
    It sorts after the furniture bundle (38-), which the interiors' runtime adapter draws into. -> {name: text}"""
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(HERE)), 'kits', 'interiors'))
    import kit_bundle
    return {INTERIORS_FRAGMENT: kit_bundle.bundle(list(sets)) +
            '/* core/engine/engine.py interiors(): the sets this kit\'s buildings are planned from (91i-interiors.js) */\n'
            'const KIT_INTERIORS = { sets: [%s] };\n' % ', '.join("'%s'" % n for n in sets)}


def path(f):
    return os.path.join(HERE, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}
