#!/usr/bin/env python3
"""The Locus kit's file list (kits/locus/README.md; MODULARITY-PLAN.md step 4): the abyssal-desert town's buildings (the
Geomancers' chapterhouse, dwellings and tents, the salt-rice farm, the petroleum works, power and fuel, infrastructure,
crops and marsh plants) on the Yuni engine, moved unchanged from settlements/locus/src on 2026-11-03. A build takes it
by name (a local copy with the same name wins):

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'locus'))
    import locuskit
    for f, p in locuskit.paths().items(): paths.setdefault(f, p)
"""
import glob, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
FILES = sorted(os.path.basename(p) for p in glob.glob(os.path.join(SRC, '64-locus-*.js')))


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}
