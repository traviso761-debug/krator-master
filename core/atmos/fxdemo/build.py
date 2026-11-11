#!/usr/bin/env python3
"""Build the effects demo: the shared effects the Ancient's Valley's next stations need, on one page.

    python3 build.py [--out dist/fx-demo.html]

The scenes (`#scene=`): `stilled` (the Stilled Ground: rain, dust, steam, a fall, an explosion and birds held by a time
zone of core/anomaly, against the same things running outside it), `press` (the Press: the heavy walk, stunted and sunk
growth, a pancaked ruin, a short hard fall, the flat pall), `yards` (plumes, toxic pools, spill ground, slag glow, sparks and
an arc) and `terraces` (the crop rows in the wind, chaff, a broken aqueduct's spills, a pylon line arcing).
biomes/ancientsvalley/PLAN-ANOMALIES.md 14 and PLAN.md 15 say
what each is for. Nothing here is a runtime dependency: the page is a viewer. three.js r128 is inlined from a local copy.
Deterministic.
"""
import argparse, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ATMOS = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(ATMOS))

C = lambda *p: os.path.join(ROOT, 'core', *p)
FRAGMENTS = [
    C('rand', '08-core-rand.js'),
    C('shader', '06-core-khook.js'),
    C('shader', '06b-core-kcolor.js'),
    C('tags', '50-core-tags.js'),
    C('tags', '52-core-tags-vocab.js'),
    C('biome', '37-core-traps.js'),             # KTRAPS: core/hazard's one clock
    C('hazard', '20-core-hazard.js'),
    C('anomaly', '20-core-anomaly.js'),
    C('anomaly', 'host', '90-anomaly-walker.js'),
    C('host', '90-host-camera.js'),
    os.path.join(ATMOS, '89-atmos-0-core.js'),
    os.path.join(ATMOS, '89-atmos-0p-presets.js'),
    os.path.join(ATMOS, '89-atmos-3-particles.js'),
    os.path.join(ATMOS, 'fx', '89-atmos-fx-localtime.js'),
    os.path.join(ATMOS, 'fx', '89-atmos-fx-plumes.js'),
    os.path.join(ATMOS, 'fx', '89-atmos-fx-sparks.js'),
    os.path.join(ATMOS, 'fx', '89-atmos-fx-sludge.js'),
    os.path.join(ATMOS, 'fx', '89-atmos-fx-slag.js'),
    os.path.join(ATMOS, 'fx', '89-atmos-fx-spill.js'),
    os.path.join(ATMOS, 'fx', '89-atmos-fx-gustsheen.js'),
    os.path.join(HERE, 'src', '10-demo.js'),
]


def find_three():
    for c in (os.path.join(ROOT, 'kits', 'ancients', 'three.min.js'), os.path.join(ROOT, 'kits', 'ringsea', 'three.min.js')):
        if os.path.isfile(c) and os.path.getsize(c) > 100000:
            return c
    sys.exit('build.py: no local three.min.js (r128) found (an LFS pointer is not enough: git lfs pull)')


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(HERE, 'dist', 'fx-demo.html'))
    ap.add_argument('--list-sources', action='store_true')
    a = ap.parse_args()
    three = find_three()
    if a.list_sources:
        for p in FRAGMENTS + [three, os.path.join(HERE, 'src', '00-head.html')]:
            print(os.path.relpath(p, ROOT).replace(os.sep, '/'))
        return
    js = '\n'.join('// ---- ' + os.path.relpath(p, ROOT).replace(os.sep, '/') + '\n' + read(p) for p in FRAGMENTS)
    page = read(os.path.join(HERE, 'src', '00-head.html')).replace('/*THREE*/', read(three)).replace('/*JS*/', js)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(page)
    print('wrote', os.path.relpath(a.out, ROOT).replace(os.sep, '/'), '%.0f KB' % (len(page.encode('utf-8')) / 1024))


if __name__ == '__main__':
    main()
