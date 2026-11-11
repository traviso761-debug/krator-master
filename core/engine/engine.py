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
    '90-scene.js',       # the scene: renderer, the placeholder sky, ground, the sheet's layout from 89-rows.js
    '91f-furnish.js',    # the furniture adapter onto core/furnish
    '91n-night.js',      # the night lights
    '92-world.js',       # builds the world and names the views
    '93-anim.js',        # the clock (?t= pins it), smoke, the export's material table
    '99-host-take.js',   # the page handed to core/host (KHOST.take)
    '99-tail.html',      # the page's tail
]


def path(f):
    return os.path.join(HERE, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}
