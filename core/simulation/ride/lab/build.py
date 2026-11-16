#!/usr/bin/env python3
"""Build the ride lab (core/simulation/PLAN-RIDING.md section 8): a stand-in Line of two segments and the gap between, its
trains carrying the walker (core/walk/frame), the travellers' journeys (core/simulation/ride) and goods (SIM.trade, the
porters), on core/host's shell with the opt-in ride host fragment (core/walk/frame/95-walk-frame-host.js).

    python3 build.py           # -> dist/ride-lab.html
    python3 verify.py --assert # the page's checks on the GPU lane, each with a negative

The world (40) is the node tests' (../test-ride.js, ../test-ride-cargo.js); the page adds the clock and the life (50),
the scene (60) and the take (98).
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SIMD = os.path.dirname(os.path.dirname(HERE))
CORE = os.path.dirname(SIMD)
ROOT = os.path.dirname(CORE)
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
sys.path.insert(0, os.path.join(CORE, 'host')); import host as khost
sys.path.insert(0, os.path.join(ROOT, 'kits', 'motor-vehicles')); import vehicle_bundle   # the Line's cars (KratorVehicles)

SIMF = sorted(f for f in os.listdir(SIMD) if f.startswith('77-sim-') and f.endswith('.js'))
FRAGS = ([os.path.join(HERE, '00-head.html')]
         + [khost.path(f) for f in khost.SHADER]
         + [os.path.join(CORE, 'rand', '08-core-rand.js'), khost.path('20-core-clock.js'), os.path.join(CORE, 'sched', '20-core-sched.js'),
            os.path.join(CORE, 'walk', '20-core-walk.js'), os.path.join(CORE, 'walk', 'frame', '26-core-walk-frame.js')]
         + [os.path.join(SIMD, f) for f in SIMF]
         + [os.path.join(SIMD, 'ride', '78-sim-ride.js'), os.path.join(SIMD, 'ride', '79-sim-ride-porters.js'),
            os.path.join(SIMD, 'ride', '80-sim-ride-line.js'), os.path.join(SIMD, 'ride', '81-sim-ride-choose.js')]
         + [os.path.join(HERE, f) for f in ('40-ride-lab-world.js', '50-ride-lab-run.js', '60-ride-lab-scene.js')]
         + [khost.path(f) for f in khost.SHELL if f != '20-core-clock.js']
         + [os.path.join(CORE, 'walk', 'frame', '95-walk-frame-host.js'), os.path.join(HERE, '98-ride-lab-take.js'), os.path.join(HERE, '99-tail.html')])
VEHICLES = vehicle_bundle.bundle(['ancient', 'line', 'tungang'])   # the Ancients' vehicles, the Line's cars, the Tungangs' stock
BSRC.report(FRAGS)   # --list-sources: what the page is made of (the bundle's reads are the audit hook's), then exit
out = []
for p in FRAGS:
    s = open(p, encoding='utf-8').read()
    if p.endswith('40-ride-lab-world.js'):
        out.append('\n// ==================== kits/motor-vehicles (vehicle_bundle.bundle: ancient, line, tungang)\n' + VEHICLES)
    out.append(('\n// ==================== %s\n' % os.path.relpath(p, CORE).replace(os.sep, '/') if p.endswith('.js') else '') + s)
html = ''.join(out)
os.makedirs(os.path.join(HERE, 'dist'), exist_ok=True)
dst = os.path.join(HERE, 'dist', 'ride-lab.html')
with open(dst, 'w', encoding='utf-8', newline='\n') as f:
    f.write(html)
print('built dist/ride-lab.html (%d fragments, %.0f KB)' % (len(FRAGS), os.path.getsize(dst) / 1024))
