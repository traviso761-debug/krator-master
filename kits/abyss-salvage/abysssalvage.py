#!/usr/bin/env python3
"""The Abyssal Salvage kit (Kenshi-swamp-influenced salvage architecture for East Abyss hamlets,
small villages, and marsh suburbs), read in place on the Locus/Yuni ASSET frame:

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'abyss-salvage'))
    import abysssalvage
    for f, p in abysssalvage.paths().items(): paths.setdefault(f, p)
"""
import glob, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
FILES = sorted(os.path.basename(p) for p in glob.glob(os.path.join(SRC, '65s-*.js')))


def path(f):
    return os.path.join(SRC, f)


def paths(names=None):
    return {f: path(f) for f in (FILES if names is None else names)}
