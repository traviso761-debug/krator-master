#!/usr/bin/env python3
"""Build the weather demo: the moving weather (W5) and the cloudscape (W6) of STAGE-8/G-weather.md on one page.

    python3 build.py [--out dist/wx-demo.html]

Weather cells (core/atmos/wx/) drift over a 16 km country on the shared sky: the sky's cover drawn from them, rain shafts
and virga, branched lightning in the storms and its thunder, splashes on the ground and on a village's roofs, the cells'
minimap; five climates (`?climate=`), the views `front`, `under`, `village`, `aerial` (`?view=`), `?weather=clear` to hold
the weather, `?hold=1` to pin the clock. Nothing here is a runtime dependency: the page is a viewer. three.js r128 is
inlined from a local copy. Deterministic.
"""
import argparse, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ATMOS = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(ATMOS))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)

C = lambda *p: os.path.join(ROOT, 'core', *p)
X = lambda *p: os.path.join(ATMOS, *p)
FRAGMENTS = [
    C('rand', '08-core-rand.js'),
    C('shader', '06-core-khook.js'),
    C('shader', '06b-core-kcolor.js'),
    C('clock', '20-core-clock.js'),
    os.path.join(ROOT, 'kits', 'crops', 'src', '10-crop-core.js'),   # the crops kit's axes for each biome (warmth, aridity, air)
    X('89-atmos-0-core.js'),
    X('89-atmos-0p-presets.js'),
    X('89-atmos-4-weather.js'),
    X('89-atmos-9-host.js'),
    X('sky', '89-atmos-e-skymodel.js'),
    X('sky', '89-atmos-f-skypresets.js'),
    X('sky', '89-atmos-g-sky.js'),
    X('host', '89-atmos-h-skyhost.js'),
    X('host', '89-atmos-e-weatherhost.js'),
    X('fx', '89-atmos-fx-lightning.js'),
    X('fx', '89-atmos-fx-raincover.js'),
    X('wx', '89-atmos-wx-cells.js'),
    X('wx', '89-atmos-wx-host.js'),
    C('audio', '24-core-audio-sky.js'),   # the thunder heard (KSKYSOUND: the stand-in synth until the clips are wired)
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
    ap.add_argument('--out', default=os.path.join(HERE, 'dist', 'wx-demo.html'))
    ap.add_argument('--list-sources', action='store_true')
    a = ap.parse_args()
    three = find_three()
    BSRC.report(FRAGMENTS + [three, os.path.join(HERE, 'src', '00-head.html')])   # --list-sources: what the page reads, then exit
    js = '\n'.join('// ---- ' + os.path.relpath(p, ROOT).replace(os.sep, '/') + '\n' + read(p) for p in FRAGMENTS)
    page = read(os.path.join(HERE, 'src', '00-head.html')).replace('/*THREE*/', read(three)).replace('/*JS*/', js)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(page)
    print('wrote', os.path.relpath(a.out, ROOT).replace(os.sep, '/'), '%.0f KB' % (len(page.encode('utf-8')) / 1024))


if __name__ == '__main__':
    main()
