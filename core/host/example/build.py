#!/usr/bin/env python3
"""Build the core/host example: a toy economy on core/simulation (its own test's world) drawn in three.js, with the whole
interface on core/host (the shell, the inspector and what things hold, the stocks panel, marks, pictures, the minimap, the
editor, the cutaway). The reference for a build adopting core/host (core/host/README.md, "The whole interface").

    python3 build.py      # -> host-example.html next to this file
    python3 check.py      # headless: the stocks panel, the contents, the editor's ops, each with a negative
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__)); HOST = os.path.dirname(HERE); CORE = os.path.dirname(HOST)
sys.path.insert(0, HOST)
import host as khost

FRAGS = [os.path.join(HERE, '00-head.html'), os.path.join(CORE, 'rand', '08-core-rand.js')]
FRAGS += [os.path.join(CORE, 'tags', f) for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js')]
FRAGS += [os.path.join(CORE, 'simulation', f) for f in sorted(os.listdir(os.path.join(CORE, 'simulation'))) if re.match(r'77-sim-.*\.js$', f)]
FRAGS += [khost.path(f) for f in sorted(khost.FULL)]
FRAGS += [os.path.join(HERE, f) for f in ('40-world.js', '60-scene.js', '98-take.js', '99-tail.html')]
out = []
for p in FRAGS:
    s = open(p, encoding='utf-8').read()
    out.append(('\n// ==================== %s\n' % os.path.relpath(p, CORE).replace(os.sep, '/') if p.endswith('.js') else '') + s)
    if p.endswith('00-head.html'):
        out.append(khost.edits_js(HERE, 'host-example'))
html = ''.join(out)
dst = os.path.join(HERE, 'host-example.html')
with open(dst, 'w', encoding='utf-8', newline='\n') as f:
    f.write(html)
print('built host-example.html (%d fragments, %.0f KB)' % (len(FRAGS), os.path.getsize(dst) / 1024))
