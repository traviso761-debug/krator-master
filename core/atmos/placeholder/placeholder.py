#!/usr/bin/env python3
"""The placeholder sky's file list (core/atmos/placeholder/README.md; MODULARITY-PLAN.md step 1). A kit's viewer page takes
it by path instead of keeping a copy:

    sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder'))
    import placeholder as psky
    paths.update(psky.paths(psky.SKY))          # {fragment name: path}; a kit whose core has h3() takes SKY
    paths.update(psky.paths(psky.SKY_H3))       # a kit with no h3() of its own (the catalog engine) takes SKY_H3

The names keep the place the vendored copies had in each build's filename order, so taking them from here moves no byte of
any page. A src/ copy with the same name is drift: delete it (`--vendor-check` reports it as a shadow where a build has one)."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SKY = ['81-sky.js']                        # KratorSky
SKY_H3 = ['80-sky-hash.js', '81-sky.js']   # KratorSky and the h3() it reads, for a build whose core has no h3()


def path(f):
    return os.path.join(HERE, f)


def paths(names):
    return {f: path(f) for f in names}
