#!/usr/bin/env python3
"""The Ancient Transit kit for another build (kits/ancient-transit/transit_bundle.py).

    import sys, os; sys.path.insert(0, os.path.join(ROOT, 'kits', 'ancient-transit')); import transit_bundle
    js = transit_bundle.furniture()                 # ONE closure defining the global KratorTransitFurniture
    frags = transit_bundle.fragments()              # [(name, path)]: the KTRANSIT fragments to read in place, in order

The furniture closure wraps the master catalog's engine-neutral core (core/catalog/krator-furniture-core.js: makeFrame, the
mk* primitives, mat, FPAL, ASSET), the `ancient` culture's pieces (krator-transit-furniture.js) and the assembler
(transit-furnish.js); their top-level names (TAU, shade, mat, FPAL, ASSET ...) stay inside, so they never meet a host's own.
It needs a global THREE (r128) and KTRANSIT (src/40-tr-records.js, the kinds table) loaded before it.

The KTRANSIT fragments are read by path, as kits/metropolis's are (biomes/ancientsvalley/build.py MP_FRAGS): the data side
(40-44, [G data]) and the draw side (50-57); a host slots them where its own fragments want them (after core/rand, core/space,
core/materials/record and the biome core; before its stage). `fragments(data_only=True)` gives 40-44 alone (a node test, a
Godot export). The kit's library pack is tex/ (tools/textures/pack.py kits/ancient-transit): a host inlines it with
tools/textures/matlib_pack.py as its own, under the pack name 'ancient-transit' (KTRANSIT.mats reads KMAT.packed('ancient-transit', fam)).
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
CATALOG = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'catalog')   # the catalog core lives in core/catalog since the biome rebuild (2026-11-09)
PARTS = [(CATALOG, 'krator-furniture-core.js'), (HERE, 'krator-transit-furniture.js'), (HERE, 'transit-furnish.js')]
SRC = os.path.join(HERE, 'src')
DATA = ['40-tr-records.js', '41-tr-path.js', '41b-tr-network.js', '42-tr-highway.js', '43-tr-rail.js', '43b-tr-subway.js', '44-tr-dress.js', '44b-tr-war.js', '44c-tr-quake.js']
DRAW = ['46-tr-mats.js', '55-tr-draw-highway.js', '56-tr-draw-rail.js', '56b-tr-draw-subway.js', '57-tr-draw-dress.js']


def read(d, f):
    with open(os.path.join(d, f), encoding='utf-8') as fh:
        return fh.read()


def safe(js):
    """The text goes inline into a page's <script>: no script tag may appear in it (kits/catalog/furniture_bundle.py)."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def label(d, f):
    return ('core/catalog/' if d == CATALOG else 'kits/ancient-transit/') + f


def files():
    return list(PARTS)


def furniture():
    body = ''.join('/* ---- %s ---- */\n%s\n' % (label(d, f), read(d, f)) for d, f in PARTS)
    return safe('/* kits/ancient-transit furniture bundle (transit_bundle.py): %s. GENERATED; edit the kit files. */\n'
                'var KratorTransitFurniture = (function () {\n'
                "if (typeof KTRANSIT === 'undefined') throw new Error('KratorTransitFurniture: load kits/ancient-transit/src/40-tr-records.js first');\n"
                '%s\nreturn KTF_API;\n})();\n' % (', '.join(label(d, f) for d, f in PARTS), body))


def fragments(data_only=False):
    names = DATA if data_only else DATA + DRAW
    return [(f, os.path.join(SRC, f)) for f in names]


if __name__ == '__main__':
    print(furniture()[:400])
