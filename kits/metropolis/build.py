#!/usr/bin/env python3
"""Concatenate the fragments (filename order) into dist/metropolis.html: the test bed of the metropolis system (PLAN.md).

  00-head.html       page shell, opens <script>
  08..39             core/rand, core/tags, core/space, the biome core (BIO.impostor, BIO.LOD.fade), the material library and the pack,
                     the interiors (GENERATED: kits/catalog, kits/interiors, kits/ancients-interiors, each by its own bundle)
  40-44              [G data] the records, plans, facades, KSHELL's records, the audit: tests/test-metropolis.js runs them in node
  45-47              HOST: renderer, light, ground, BIO.init
  50-58              the heroes and the interiors' drawing
  60-62              KSHELL's host half (bake, draw) and the impostors
  70                 the test stage: what stands where, per view
  89..98             core/atmos (the shared sky), core/host
  99-host-take       the page handed to core/host; 99-tail.html closes <script>

Usage: python3 build.py [--no-checks]
"""
import hashlib, json, os, re, subprocess, sys, importlib.util

import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist'); OUT = 'metropolis.html'
CORE = os.path.join(ROOT, 'core')


def find_node():
    import shutil
    return os.environ.get('NODE') or shutil.which('node')


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}


def core(folder, names):
    for f in names:
        if f not in PATH:
            PATH[f] = os.path.join(CORE, folder, f)


core('rand', ['08-core-rand.js'])
core('terrain', ['37c-core-rubble.js'])   # KRUBBLE: a ruin's rubble heaps (57-mp-debris.js)
core('shadow', ['10-core-shadow.js'])   # KSHADOW: the sun's shadow box that follows the view (47-host-land.js attaches it)
core('shadow/host', ['12-core-shadow-host.js'])
core('tags', ['50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'])
core('space', ['20-core-space.js'])
core('walk', ['20-core-walk.js'])
core('furnish', ['50-core-furnish.js', '52-core-furnish-draw.js'])
core('biome', ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '34-core-impostor.js', '40-core-place.js', '42-core-export.js', '43-core-export-host.js'])
core('export', ['07-core-export.js', '09-core-export-adapters.js'])
core('materials/record', ['23-mat-record.js', '25-matlib-host.js'])
core('atmos', ['89-atmos-0-core.js', '89-atmos-0p-presets.js'])
core('atmos/sky', ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'])
core('atmos/host', ['89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js'])
# THE LOWLAND KITS' PLANTS, read in place (the owner, 2026-11-03: the Terrarium takes plants vended from the southwestern and northwestern
# lowlands, importing as little of them as possible; 59d-mp-flora.js vends them): each kit's species and trees (its builders) and its last
# fragment (BIO.kitEnd), the southwest's floor too (its floor plants, SWLOW.plantAt). No pass of theirs runs, no dress, no library pack.
# A kit's fragments run together (its registry is current from its first to its kitEnd), after core/biome and BIO.init (47-host-land.js)
FLORA_KITS = [('swlowlands', ['50-biome-swlowlands-species.js', '55-biome-swlowlands-trees.js', '60-biome-swlowlands-floor.js', '70-biome-swlowlands.js']),
              ('nwlowlands', ['50-biome-nwlowlands-species.js', '55-biome-nwlowlands-trees.js', '70-biome-nwlowlands.js'])]
for ki, (kit, names) in enumerate(FLORA_KITS):
    for f in names:
        PATH['48%s-flora-%s' % ('ab'[ki], f)] = os.path.join(ROOT, 'biomes', kit, 'src', f)
# THE ANCIENTS KIT, read in place (kits/ancients, as settlements/span does): its runtime and the builders 55-mp-ancients.js places as
# heroes (the owner, 2026-11-03: the bunker, Sky A, the honeycomb blocks, the laboratories and the low and mid rises round them). Its
# materials come from core/materials (a copy in the kit's src/ wins, as the kit's own build.py resolves them). Where the kit declares
# a name this page already has (the error panel, the ground, the ticks: same signatures) its own is renamed at build time, so its
# builders call the page's; its registry is renamed to ANC_REG / ANC_REGISTER (its builders' REGISTER calls with it): the files on
# disk are untouched.
ANC = os.path.join(ROOT, 'kits', 'ancients')
ANC_RUNTIME = ['10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
               '50-registry.js', '54-mat-concrete.js', '69-mat-salvage.js', '69w-worn.js', '88y-ancients-matlib.js', '8ap-host-0-lib.js']
# (64, 66, 80 and 8ak-alt-b only for the helpers a builder here calls: domRoom, officeC, aaBattery, adLoft)
ANC_BUILDERS = ['42-offices.js', '46-bunker.js', '48-library.js', '52-sky-abc.js', '64-houses-def.js', '66-office-c.js', '73-police.js',
                '80-aa-battery.js', '81-houses-abc.js', '82-apartments.js', '8ak-alt-b-civic.js',
                '89-lab.js', '8ak-alt-a-houses.js', '8ak-alt-c-works.js', '8am-yv-a-quad.js', '8am-yv-b-comb.js', '8ap-host-d-stalks.js',
                '8ap-host-e-bellhall.js',
                # industry (the owner, 2026-11-03: the ruins need industry): the data center, the robot factory, the factory and the fuel station, each
                # the kit's two (the Vault and the Perforated Stacks, the Assembler and the Rig, the Foundry and the Pilotis Works, the Well and its alt)
                '40-factory-extras.js', '62-robotics.js', '72-datacenter.js', '78-factory-silo.js', '84-fuel.js', '88-factory.js',
                '8al-alt-00-lib.js', '8al-alt-08-robotics.js', '8al-alt-09-datacenter.js']
ANC_FILES = {}
for f in ANC_RUNTIME + ANC_BUILDERS:
    ANC_FILES[f] = os.path.join(ANC, 'src', f)
for f in ['20-textures.js', '22-materials.js', '68-mat-v5.js']:
    p = os.path.join(ANC, 'src', f)
    ANC_FILES[f] = p if os.path.isfile(p) else os.path.join(CORE, 'materials', f)
for f, p in ANC_FILES.items():
    if f in PATH:
        sys.exit('build.py: the Ancients kit\'s %s shadows a fragment of this page' % f)
    PATH[f] = p
core('materials/record', ['26-matlib-bind.js'])
ANC_SUBST = [(r'\bREGISTER\b', 'ANC_REGISTER'), (r'\bREG\b', 'ANC_REG')]
SUBST = {f: list(ANC_SUBST) for f in ANC_FILES}
SUBST['10-core.js'] = ANC_SUBST + [(r'\bERRS\b', 'ANC_ERRS'), (r'\breportErr\b', 'ancReportErr'), (r'\bterrainH\b', 'ancTerrainH'),
                                   (r'\bTICKS\b', 'ANC_TICKS'), (r'\btick\b', 'ancTick'), (r'\bwindow\.onerror\b', 'window.ancOnerror')]
# the kit's fire flicker reads its own page's NIGHT (92-camera.js, not taken here): no night of the kit's on this page
SUBST['69-mat-salvage.js'] = ANC_SUBST + [(r'!!NIGHT\b', '!!window.NIGHT')]

sys.path.insert(0, os.path.join(CORE, 'host'))
import host as khost
khost.resolve(PATH, khost.SHELL + ['94-host-polytool.js'])
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp
SIDE = None if '--inline-packs' in sys.argv else {}
fb = load('mp_furniture_bundle', os.path.join(ROOT, 'kits', 'catalog', 'furniture_bundle.py'))
ib = load('mp_ix_bundle', os.path.join(ROOT, 'kits', 'interiors', 'kit_bundle.py'))
ab = load('mp_ai_bundle', os.path.join(ROOT, 'kits', 'ancients-interiors', 'kit_bundle.py'))
VIRTUAL = {'44z-host-matlib-pack.js': _mp.fragment(HERE, 'metropolis', side=SIDE),
           '88x-matlib-pack-ancients.js': _mp.fragment(ANC, 'ancients', side=SIDE),
           '39-mp-interiors-bundle.js': '/* GENERATED by build.py */\n' + fb.bundle(['generic-goods', 'post-apoc', 'scrap'], harvested=True, tex=True) + ib.bundle(['noahs-regret']) + ab.bundle()}
for f in VIRTUAL:
    PATH[f] = None

frags = sorted(PATH); out = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
    for pat, rep in SUBST.get(f, []):
        s = re.sub(pat, rep, s)
    out.append('\n// ==================== %s\n' % f if f.endswith('.js') else ''); out.append(s)
html = ''.join(out)
os.makedirs(DIST, exist_ok=True)
if SIDE:
    html = _mp.write_sidecar(SIDE, html, DIST, 'metropolis.tex.js')
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)
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
with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
    json.dump(inputs, fh, indent=0, sort_keys=True)
print('built dist/%s  (%d fragments, %d KB)  %s' % (OUT, len(frags), len(html) // 1024, 'syntax NOT CHECKED (no node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:1500]))
sys.exit(r.returncode if r else 0)
