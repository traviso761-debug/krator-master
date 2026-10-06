#!/usr/bin/env python3
"""Build the SIM example sheet: the smallest world that runs on core/simulation alone (PLAN.md Phase 1's acceptance).

20 townsfolk (farmers, artisans, traders, children) in four homes on a street grid, a market, a tavern, a workshop, a
yard, a shrine, a well and a field, and a caravan that comes in by the east road, waters at the well, trades at the
market and leaves west. No THREE: a 2D canvas draws SIM.pose. The fragments are core/rand, core/clock, every
core/simulation/77-sim-*.js, and this folder's own (the world declaration, the drawing, the checks).

    python3 build.py      # -> sim-example.html next to this file
    python3 check.py      # the sheet's checks, each with a negative, and determinism across loads

To start a settlement's life layer on SIM: copy 40-world.js's order (SCHEMA.md, "How a world is declared"), replace the
streets and places with what the build placed, and move WORLD into the settlement's world/*.json.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__)); CORE = os.path.dirname(os.path.dirname(HERE))
FRAGS = [os.path.join(HERE, '00-head.html'), os.path.join(CORE, 'rand', '08-core-rand.js'), os.path.join(CORE, 'clock', '20-core-clock.js')]
FRAGS += [os.path.join(CORE, 'simulation', f) for f in sorted(os.listdir(os.path.join(CORE, 'simulation'))) if re.match(r'77-sim-.*\.js$', f)]
FRAGS += [os.path.join(HERE, f) for f in ('40-world.js', '80-draw.js', '90-checks.js', '99-tail.html')]
out = []
for p in FRAGS:
    s = open(p, encoding='utf-8').read()
    out.append(('\n// ==================== %s\n' % os.path.relpath(p, CORE).replace(os.sep, '/') if p.endswith('.js') else '') + s)
html = ''.join(out)
dst = os.path.join(HERE, 'sim-example.html'); open(dst, 'w', encoding='utf-8', newline='\n').write(html)
print('built sim-example.html (%d fragments, %.0f KB); python3 check.py runs its checks' % (len(FRAGS), os.path.getsize(dst) / 1024))
