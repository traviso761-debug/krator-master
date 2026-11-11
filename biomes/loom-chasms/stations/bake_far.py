#!/usr/bin/env python3
"""Bake the scale model round a Loom-Chasms station into its data fragment (PLAN.md sections 7 and 8: the land and KFAR).

    python3 biomes/loom-chasms/stations/bake_far.py --all            # every station in SITES
    python3 biomes/loom-chasms/stations/bake_far.py <station> <px> <py> [--radius 60]

The Great Chasm's bake, read in place (biomes/greatchasm/stations/bake_far.py: its `load` and `bake`), writing into this kit's
stations/<name>/44f-host-far-data.js: the model's heights on its own 2 km cells round the site (120 km each way), each cell's climate
class, and the site's numbers. Deterministic: no randomness.
"""
import argparse, importlib.util, os, sys
sys.dont_write_bytecode = True   # no __pycache__ in the Great Chasm's stations/ (check_views reads every folder there as a station)

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('gc_bake', os.path.join(HERE, '..', '..', 'greatchasm', 'stations', 'bake_far.py'))
GC = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(GC)

# the stations built so far, on the 5.1 canvas (PLAN.md section 7b: the Loom moved from 1662,1162, mid-wall, to the mesa's rim)
SITES = {'loom': (1664, 1161), 'cradle': (1558, 1140)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('station', nargs='?'); ap.add_argument('px', nargs='?', type=int); ap.add_argument('py', nargs='?', type=int)
    ap.add_argument('--radius', type=int, default=60); ap.add_argument('--all', action='store_true')
    a = ap.parse_args()
    jobs = [(s, xy[0], xy[1]) for s, xy in SITES.items()] if a.all else [(a.station, a.px, a.py)]
    D, E, C, codes, T, P = GC.load()
    for name, px, py in jobs:
        if name is None or px is None:
            sys.exit('bake_far.py: give <station> <px> <py>, or --all')
        GC.bake(D, E, C, codes, T, P, name, px, py, a.radius, out_dir=HERE, by='biomes/loom-chasms/stations/bake_far.py')


if __name__ == '__main__':
    main()
