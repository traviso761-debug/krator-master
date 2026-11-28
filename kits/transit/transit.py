#!/usr/bin/env python3
"""Reusable post-Cataclysm canal & canal-vessel kit (kits/transit).

Host settlements (such as settlements/eternian-canal, Slussport, Marr, Dalab, Yuni, Voth) read these
fragments in place without duplicating canal hydraulic, miter-lock, transit-course, or vessel code:

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'transit'))
    import transit as ktransit
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')

DATA_FILES = [
    '40-tr-canal.js',
    '41-tr-locks.js',
    '42-tr-transit.js',
]

DRAW_FILES = [
    '70-tr-canal-draw.js',
    '72-tr-canal-vessels.js',
]

ALL_FILES = DATA_FILES + DRAW_FILES


def path(name):
    return os.path.join(SRC, name)


def paths(names=None):
    use = ALL_FILES if names is None else names
    return {f: path(f) for f in use}


def rel_paths(root, names=None):
    use = ALL_FILES if names is None else names
    return [os.path.relpath(path(f), root).replace(os.sep, '/') for f in use]
