#!/usr/bin/env python3
"""Concatenate the fragments (filename order) into dist/extraplanar.html, the Extraplanar kit's demo page on the biome core, and
write dist/krator-extraplanar.js, the bundle alone (extraplanar_bundle.py).

  00-head.html        page shell, opens <script>
  06..20              core/shader (khost.resolve adds it), core/rand, core/tags, core/space, core/clock
  10..40 (biome)      core/biome: BIO.init (the tags registry, the ground, the ticks, the registered volumes the probe reads)
  45-host-stage.js    HOST: renderer, light, the error panel, TICKS, REGISTER
  47-host-land.js     HOST: the ground, a plain with a gentle swell (the feet check walks over it), BIO.init
  49-xp-bundle.js     GENERATED: the kit's bundle, ONE closure exposing KratorExtraplanar (the hunters on the mechs machinery,
                      the records, the drawing, the far tier)
  89-atmos-*          core/atmos: the core, the presets, the lights (the glow), the particles (the mist and the plumes), the shared
                      sky and its mood, the host binding
  89-host-sky.js      HOST: ATMOS.skyBiome
  89a-host-atmos.js   HOST: ATMOS.bindHost
  90-xp-stage.js      the stage: the hunters in lanes with their far-tier cards, the phenomena and portals in a field (records on the
                      registry first, drawn after, their weather on core/atmos), the tick, window._xp
  90..95 (host)       core/host: the camera, the loop, the panel, the probe, the inspector, the polygon tool
  99-host-take.js     the page handed to core/host; 99-tail.html closes <script>

Usage: python3 build.py [--no-checks]
"""
import hashlib, json, os, re, subprocess, sys

import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and _os.path.isfile(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'PORT.md')) and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist'); OUT = 'extraplanar.html'
CORE = os.path.join(ROOT, 'core')
sys.path.insert(0, HERE)
import extraplanar_bundle  # noqa: E402

BUNDLE = '49-xp-bundle.js'   # virtual: generated, never written to src/


def find_node():
    import shutil
    return os.environ.get('NODE') or shutil.which('node')


PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}


def core(folder, names):
    for f in names:
        if f not in PATH:
            PATH[f] = os.path.join(CORE, folder, f)


core('rand', ['08-core-rand.js'])
core('tags', ['50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'])
core('space', ['20-core-space.js'])
core('biome', ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '34-core-impostor.js', '40-core-place.js'])   # the kit's own needs (20 calls 31b's leafOn), as kits/metropolis lists them
core('atmos', ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-2-lights.js', '89-atmos-3-particles.js'])
core('atmos/sky', ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-k-cloudmood.js'])
core('atmos/host', ['89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js'])
sys.path.insert(0, os.path.join(CORE, 'host'))
import host as khost  # noqa: E402
khost.resolve(PATH, khost.SHELL + ['93-host-inspect.js', '94-host-polytool.js'])
VIRTUAL = {BUNDLE: extraplanar_bundle.bundle()}
for f in VIRTUAL:
    PATH[f] = None

RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)


def check(parts):
    """A top-level name declared in two files would clobber or throw: refuse it (the bundle declares only KratorExtraplanar)."""
    errs, decl = [], {}
    for name, body in parts:
        if not name.endswith('.js'):
            continue
        names = ['KratorExtraplanar'] if name == BUNDLE else [m.group(1) for m in RE_DECL.finditer(body)]
        for n in names:
            decl.setdefault(n, set()).add(name)
    for n, fs in sorted(decl.items()):
        if len(fs) > 1 and not n.startswith('_'):
            errs.append('top-level name `%s` declared in more than one file: %s' % (n, ', '.join(sorted(fs))))
    return errs


frags = sorted(PATH); out = []; parts = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
    parts.append((f, s))
    out.append('\n// ==================== %s\n' % f if f.endswith('.js') else ''); out.append(s)
if '--no-checks' not in sys.argv:
    errs = check([(f, s) for f, s in parts if f.endswith('.js') and (PATH[f] is None or PATH[f].startswith(SRC))])
    if errs:
        print('BUILD RULES FAILED:')
        for e in errs:
            print('  -', e)
        sys.exit(1)
html = ''.join(out)
os.makedirs(DIST, exist_ok=True)
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)
with open(os.path.join(DIST, 'krator-extraplanar.js'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(VIRTUAL[BUNDLE])
m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(m.group(1) if m else '')
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
inputs = {}
for f in frags:
    if PATH[f]:
        with open(PATH[f], 'rb') as fh:
            inputs[os.path.relpath(PATH[f], ROOT).replace(os.sep, '/')] = hashlib.sha1(fh.read()).hexdigest()
for rel in extraplanar_bundle.fragments():
    with open(os.path.join(ROOT, rel), 'rb') as fh:
        inputs['bundle:' + rel] = hashlib.sha1(fh.read()).hexdigest()
with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
    json.dump(inputs, fh, indent=0, sort_keys=True)
print('built dist/%s  (%d fragments, %d KB; bundle %d KB)  %s' % (OUT, len(frags), len(html) // 1024, len(VIRTUAL[BUNDLE].encode()) // 1024,
                                                                  'syntax NOT CHECKED (no node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:1500]))
ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    opened = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
    if opened:
        print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(opened))
        for l in opened:
            print('  ' + l[6:])
sys.exit(r.returncode if r else 0)
