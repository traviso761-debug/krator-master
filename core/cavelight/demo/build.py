#!/usr/bin/env python3
"""Build the cave-light demo: a stretch of the Line on core/cavelight (KCAVELIGHT), the tunnels' hazards and the cleft's quartz.

    python3 build.py [--out dist/cavelight-demo.html]

A test page for the module (core/cavelight/README.md, "demo/"): an 800 m bore under a hill, its portal onto daylight, a light
shaft, the Tungang lamp code, a wax-lit refuge with a smoky-quartz cleft shrine (KSPELEO.SMOKY), the hot stretch's still-lit
strips, and the tunnels' hazards (core/hazard/22-core-hazard-tunnel.js) registered on core/tags. Stand-in geometry: it tests the
light, not the Line's look. three.js r128 is inlined from a local copy. Deterministic.
"""
import argparse, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MOD = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(MOD))
J = lambda *p: os.path.join(ROOT, *p)

FRAGMENTS = [
    J('core', 'rand', '08-core-rand.js'),
    J('core', 'tags', '50-core-tags.js'),
    J('core', 'tags', '52-core-tags-vocab.js'),
    J('core', 'biome', '37-core-traps.js'),
    J('core', 'hazard', '20-core-hazard.js'),
    J('core', 'hazard', '22-core-hazard-tunnel.js'),
    J('core', 'terrain', '39-core-cavern.js'),
    J('core', 'terrain', '39b-core-speleo.js'),
    J('core', 'terrain', '39b2-core-speleo-cleft.js'),
    os.path.join(MOD, '10-core-cavelight.js'),
    os.path.join(MOD, '90-core-cavelight-host.js'),
    os.path.join(HERE, 'src', '10-demo.js'),
]


def find_three():
    for c in (J('kits', 'ancients', 'three.min.js'), J('kits', 'ringsea', 'three.min.js'), J('kits', 'motor-vehicles', 'three.min.js')):
        if os.path.isfile(c) and os.path.getsize(c) > 100000:
            return c
    sys.exit('build.py: no local three.min.js (r128) found (an LFS pointer is not enough: git lfs pull)')


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(HERE, 'dist', 'cavelight-demo.html'))
    a = ap.parse_args()
    js = '\n'.join('// ---- ' + os.path.relpath(p, ROOT).replace(os.sep, '/') + '\n' + read(p) for p in FRAGMENTS)
    page = read(os.path.join(HERE, 'src', '00-head.html')).replace('/*THREE*/', read(find_three())).replace('/*JS*/', js)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(page)
    print('wrote', os.path.relpath(a.out, ROOT).replace(os.sep, '/'), '%.0f KB' % (len(page.encode('utf-8')) / 1024))


if __name__ == '__main__':
    main()
