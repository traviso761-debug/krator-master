#!/usr/bin/env python3
"""Build the underground test page: a small hold on KCAVERN with every opt-in underground piece of core/host on it (the follow
camera, the cut-away's caps, decks, band and section, the map's deck band and line map, the dither fade and the x-ray).
core/host/UNDERGROUND.md is the plan and the interfaces.

    python3 build.py      # -> underground.html next to this file
    python3 check.py      # headless (KRATOR_GL=gpu for the real GPU): every piece, each with a negative, and the shots
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__)); HOST = os.path.dirname(HERE); CORE = os.path.dirname(HOST)
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
sys.path.insert(0, HOST)
import host as khost

FRAGS = [os.path.join(HERE, '00-head.html')] + [khost.path(f) for f in khost.SHADER]
FRAGS += [os.path.join(CORE, 'rand', '08-core-rand.js'), os.path.join(CORE, 'walk', '20-core-walk.js')]
FRAGS += [os.path.join(CORE, 'tags', f) for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js')]
FRAGS += [os.path.join(CORE, 'terrain', '39-core-cavern.js'), os.path.join(CORE, 'terrain', 'host', '39e-core-cavern-draw.js'),
          os.path.join(CORE, 'terrain', 'host', '39h-core-cavern-cut.js')]
FRAGS += [khost.path(f) for f in sorted(khost.FULL + khost.UNDERGROUND)]
FRAGS += [os.path.join(HERE, f) for f in ('40-world.js', '60-scene.js', '98-take.js', '99-tail.html')]
out = []
for p in FRAGS:
    with open(p, encoding='utf-8') as fh:
        s = fh.read()
    out.append(('\n// ==================== %s\n' % os.path.relpath(p, CORE).replace(os.sep, '/') if p.endswith('.js') else '') + s)
    if p.endswith('00-head.html'):
        out.append(khost.edits_js(HERE, 'underground'))
BSRC.report(FRAGS)   # --list-sources: what the page is made of, then exit
html = ''.join(out)
dst = os.path.join(HERE, 'underground.html')
with open(dst, 'w', encoding='utf-8', newline='\n') as f:
    f.write(html)
print('built underground.html (%d fragments, %.0f KB)' % (len(FRAGS), os.path.getsize(dst) / 1024))
