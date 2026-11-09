#!/usr/bin/env python3
"""The Yuni kit's file list (kits/yuni/README.md; MODULARITY-PLAN.md step 4b). A build takes the kit by name:

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'yuni'))
    import yunikit
    for f, p in yunikit.paths().items():
        paths.setdefault(f, p)          # a local copy with the same name wins

The names are the ones the files had in settlements/yuni/src (moved unchanged 2026-11-03), so they keep their place in
every build's filename order: 59a-59c continue 59-civic.js (one reseed stream, one unit for the build rules). The kit
draws through the Yuni engine (05-palette, 10-core, 45-kit, 47-texture, 51-fixtures, 53-assets), which stays in each
world that runs it.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
FILES = ['55-mid-example.js', '56-mid.js', '57-poor.js', '58-rich.js',
         '59-civic.js', '59a-civic-park.js', '59b-civic-library.js', '59c-civic-furniture.js']


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}
