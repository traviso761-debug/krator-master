#!/usr/bin/env python3
"""Build the culture socket sheet: the smallest world that uses core/sockets/.

It borrows the post-apoc kit's engine fragments (page shell, rng, textures, materials, geometry, registry, scene, probe, camera) and adds
core/sockets/ (the socket + culture system) and one tiny demo building. The output shows the same wall dressed in every culture pack side by side.

    python3 build.py                      # -> sockets-example.html next to this file
    python3 ../../../kits/post-apoc/verify.py sockets-example.html --views "Cultures"

To start your own build on the socket system: copy the fragment list below, replace 40-demo.js with your buildings, keep 37-sockets.js and 80-cultures.js from core/sockets/.
"""
import os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
KIT = os.path.join(ROOT, 'kits', 'post-apoc', 'src'); CORE = os.path.join(HERE, '..')
FRAGS = [(KIT, f) for f in ('00-head.html', '10-core.js', '20-tex.js', '22-mat.js', '30-geo.js', '34-adds.js', '36-def.js', '90-scene.js', '91-probe.js', '91n-night.js', '92-camera.js', '99-tail.html')]
FRAGS += [(CORE, '37-sockets.js'), (CORE, '80-cultures.js'), (HERE, '40-demo.js'), (HERE, '89-rows.js')]
FRAGS.sort(key=lambda t: t[1])
html = ''.join(open(os.path.join(d, f), encoding='utf-8', newline='').read() for d, f in FRAGS)
html = re.sub(r'<title>.*?</title>', '<title>Culture Socket Sheet</title>', html, count=1)
out = os.path.join(HERE, 'sockets-example.html'); open(out, 'w', encoding='utf-8', newline='').write(html)
body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]; chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf-8').write(body)
try:
    r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
    if r.returncode: print(r.stderr); sys.exit(1)
    print('built sockets-example.html (%d fragments, %.0f KB)  syntax OK' % (len(FRAGS), os.path.getsize(out) / 1024))
except FileNotFoundError: print('built (no node: syntax not checked)')
