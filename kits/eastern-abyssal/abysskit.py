#!/usr/bin/env python3
"""The Eastern Abyssal kit's file list (kits/eastern-abyssal/README.md; MODULARITY-PLAN.md step 4): the Eastern Abyssal
culture's buildings (housing, shops, hospitality and civic, the temple of the altar, the Headman's palace, Lower Verge's
mayor's compound, the wall system and the fort, farming and storage, the plants it needs) on the Yuni engine, moved
unchanged from settlements/locus/src on 2026-11-03. A build takes it by name (a local copy with the same name wins):

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'eastern-abyssal'))
    import abysskit
    for f, p in abysskit.paths().items(): paths.setdefault(f, p)
"""
import glob, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
FILES = sorted(os.path.basename(p) for p in glob.glob(os.path.join(SRC, '65-abyss-*.js')))


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}
