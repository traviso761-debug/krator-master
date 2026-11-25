#!/usr/bin/env python3
"""The road-class test bed for the Ancient network (openworld/ANCIENT-NETWORK.md): every road class of the network on uneven ground,
crossing each other, drawn with the Ancient Transit kit (kits/ancient-transit, read in place, unchanged).

    python3 build.py                 # dist/network-testbed.html (+ dist/network-testbed.tex.js, the kit's library pack as a sidecar)
    python3 verify.py dist/network-testbed.html --assert --out shots

The page is the kit's demo page with its stage swapped: the kit's fragments by path (its 45-host-stage, 70-host-stage and 99-host-take
left out), the same core modules, and this folder's src/ (45-nt-stage: the ground, the classes, the network, the viaduct, the trestle,
the guideway; 70-nt-stage: the drawing and the views; 99-nt-take: the checks and core/host). The kit's 47-host-land draws the ground.
"""
import os, sys                                   # item 25 (the survey): a plain run goes through tools/build.py
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'tools')); import buildlib; sys.path.pop(0)
buildlib.through_tools_build(__file__)           # build-inputs.json is always written (KRATOR_ALLOW_PLAIN_BUILD=1 skips it)
import hashlib, os, re, subprocess, sys, importlib.util

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist'); OUT = 'network-testbed.html'
KIT = os.path.join(ROOT, 'kits', 'ancient-transit'); KSRC = os.path.join(KIT, 'src'); CORE = os.path.join(ROOT, 'core')
SKIP = {'45-host-stage.js', '70-host-stage.js', '99-host-take.js'}

PATH = {f: os.path.join(KSRC, f) for f in os.listdir(KSRC) if not f.startswith('.') and f not in SKIP}
PATH.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')})


def core(folder, names):
    for f in names:
        if f not in PATH:
            PATH[f] = os.path.join(CORE, folder, f)


# the kit's core list (kits/ancient-transit/build.py), unchanged
core('rand', ['08-core-rand.js'])
core('tags', ['50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'])
core('space', ['20-core-space.js'])
core('shadow', ['10-core-shadow.js'])
core('shadow/host', ['12-core-shadow-host.js'])
core('walk', ['20-core-walk.js'])
core('biome', ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '34-core-impostor.js', '40-core-place.js', '42-core-export.js', '43-core-export-host.js'])
core('export', ['07-core-export.js', '09-core-export-adapters.js'])
core('materials/record', ['23-mat-record.js', '25-matlib-host.js'])
core('atmos', ['89-atmos-0-core.js', '89-atmos-0p-presets.js'])
core('atmos/sky', ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'])
core('atmos/host', ['89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js'])
sys.path.insert(0, os.path.join(CORE, 'host'))
import host as khost
khost.resolve(PATH, khost.SHELL + ['94-host-polytool.js'])
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp
SIDE = None if '--inline-packs' in sys.argv else {}
VIRTUAL = {'44z-host-matlib-pack.js': _mp.fragment(KIT, 'ancient-transit', side=SIDE, own=True)}
for f in VIRTUAL:
    PATH[f] = None

frags = sorted(PATH); out = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
    out.append('\n// ==================== %s\n' % f if f.endswith('.js') else ''); out.append(s)
html = ''.join(out).replace('<title>Krator — the Ancient Transit kit</title>', '<title>Krator — the Ancient network road test bed</title>')
os.makedirs(DIST, exist_ok=True)
if SIDE:
    html = _mp.write_sidecar(SIDE, html, DIST, 'network-testbed.tex.js')
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)
m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(m.group(1) if m else '')
import shutil
node = os.environ.get('NODE') or shutil.which('node') or (r'C:\Program Files\nodejs\node.exe' if os.path.exists(r'C:\Program Files\nodejs\node.exe') else None)
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
print('built dist/%s  (%d fragments, %d KB)  %s' % (OUT, len(frags), len(html) // 1024, 'syntax NOT CHECKED (no node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:1500]))
sys.exit(r.returncode if r else 0)
