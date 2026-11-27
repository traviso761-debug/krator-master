#!/usr/bin/env python3
"""Build settlements/floating-city (The Floating City of Ria Sound) -> dist/floating-city.html + .tex.*.js sidecars.

   python3 tools/build.py settlements/floating-city          # builds dist/floating-city.html + sidecars
   python3 settlements/floating-city/build.py --list-sources # lists all read repo files (tools/dep_graph.py)
"""
import importlib.util
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib  # noqa: E402
buildlib.through_tools_build(__file__)
import build_sources as BSRC  # noqa: E402

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and not BSRC.LISTING and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then common install locations."""
    import glob as _g
    import shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
    hit = _sh.which('node')
    if hit:
        return hit
    ver = lambda p: [int(x) for x in re.findall(r'\d+', p)]
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node',
                os.path.expanduser('~/.nvm/versions/node/*/bin/node'),
                os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


P = lambda *a: os.path.normpath(os.path.join(ROOT, *a))
NL = '\n'


def rd(p):
    with open(p, encoding='utf-8') as _fh:
        return _fh.read()


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def safe(js):
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def load_py_module(mod_name, file_path):
    spec = importlib.util.spec_from_file_location(mod_name, file_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


OUT = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'floating-city.html'
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}

# 1. Core modules (shader, export, rand, drawn, shadow, interiors, door, walk, space, hazard + tide, ruins, mask, coast, materials, tags)
PATH.setdefault('06-core-khook.js', P('core', 'shader', '06-core-khook.js'))
PATH.setdefault('06b-core-kcolor.js', P('core', 'shader', '06b-core-kcolor.js'))
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, P('core', 'export', f))
PATH.setdefault('08-core-rand.js', P('core', 'rand', '08-core-rand.js'))
PATH.setdefault('10-core-drawn.js', P('core', 'drawn', '10-core-drawn.js'))
PATH.setdefault('10-core-shadow.js', P('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', P('core', 'shadow', 'host', '12-core-shadow-host.js'))
PATH.setdefault('10-core-roomlight.js', P('core', 'interiors', '10-core-roomlight.js'))
for f in ('10-core-door.js', '20-core-glass.js', '90-core-door-host.js'):
    PATH.setdefault(f, P('core', 'door', f))
PATH.setdefault('20-core-walk.js', P('core', 'walk', '20-core-walk.js'))
PATH.setdefault('24-core-walk-box.js', P('core', 'walk', 'box', '24-core-walk-box.js'))
PATH.setdefault('20-core-space.js', P('core', 'space', '20-core-space.js'))
PATH.setdefault('19-core-clock.js', P('core', 'clock', '20-core-clock.js'))
PATH.setdefault('20-core-hazard.js', P('core', 'hazard', '20-core-hazard.js'))
PATH.setdefault('21-core-hazard-flow.js', P('core', 'hazard', '21-core-hazard-flow.js'))
PATH.setdefault('23-core-hazard-tide.js', P('core', 'hazard', '23-core-hazard-tide.js'))
PATH.setdefault('20-core-ruins.js', P('core', 'ruins', '20-core-ruins.js'))
PATH.setdefault('21-core-ruins-host.js', P('core', 'ruins', '21-core-ruins-host.js'))
PATH.setdefault('25-core-mask.js', P('core', 'mask', '25-core-mask.js'))
PATH.setdefault('27-core-mask-distance.js', P('core', 'mask', '27-core-mask-distance.js'))
PATH.setdefault('30-core-coast.js', P('core', 'coast', '30-core-coast.js'))
for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js', '27-matlib-m1.js'):
    PATH.setdefault(f, P('core', 'materials', 'record', f))
for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH.setdefault(f, P('core', 'tags', f))

# 2. core/biome (including 33b-core-bamboo.js for biomes/doubledelta bluffbamboo)
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    'core/biome/31-core-dither.js', 'core/biome/31j-core-joint.js', 'core/biome/32-core-variants.js',
    'core/biome/33-core-fungoid.js', 'core/biome/33b-core-bamboo.js', 'core/biome/35-core-anim.js',
    'core/biome/37-core-traps.js', 'core/biome/39-core-lean.js', 'core/biome/41-core-env.js',
    'core/biome/42-core-export.js', 'core/biome/43-core-export-host.js', 'core/biome/44-core-stage.js',
]
for rel_b in CORE_BIOME:
    PATH.setdefault(os.path.basename(rel_b), P(*rel_b.split('/')))

# 3. core/terrain + core/world
CORE_TERRAIN = [
    '35-core-strata.js', '36-core-carve.js', '37-core-stacks.js', '38-core-relief.js',
    '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js',
]
for f in CORE_TERRAIN:
    PATH.setdefault(f, P('core', 'terrain', f))
PATH.setdefault('35z-core-strata-shade.js', P('core', 'terrain', 'host', '35-core-strata-shade.js'))
PATH.setdefault('44-core-farfield-draw.js', P('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', P('core', 'terrain', 'host', '45-core-horizon-shade.js'))
PATH.setdefault('38w-world-relief.js', P('core', 'world', '43-world-relief.js'))
PATH.setdefault('38x-world-micro.js', P('core', 'world', '43m-world-micro.js'))

# 4. kits/crops read in place
PATH.setdefault('22a-crop-core.js', P('kits', 'crops', 'src', '10-crop-core.js'))
PATH.setdefault('22b-crop-records.js', P('kits', 'crops', 'src', '20-crop-records.js'))
PATH.setdefault('22c-crop-material.js', P('kits', 'crops', 'src', '22-crop-material.js'))
PATH.setdefault('22d-crop-query.js', P('kits', 'crops', 'src', '40-crop-query.js'))

# 5. core/water (+ two-basin tidal solver 63/63b loaded BEFORE 40-fc-tide-phys.js!) + core/city/float + core/simulation + core/atmos + core/host
for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH.setdefault(f, P('core', 'water', f))
PATH.setdefault('39t-core-water-tide.js', P('core', 'water', 'ext', '63-core-water-tide.js'))
PATH.setdefault('39u-core-water-tide-draw.js', P('core', 'water', 'ext', '63b-core-water-tide-draw.js'))
PATH.setdefault('52f-core-water-farbed.js', P('core', 'water', 'farbed', '53-core-water-farbed.js'))
for f in ('56-core-water-breakup.js', '57-core-water-audit.js', '58-core-water-mirror.js'):
    PATH.setdefault(f, P('core', 'water', 'ext', f))

PATH.setdefault('54-city-host-construct.js', P('core', 'city', '54-city-host-construct.js'))

SIM_FILES = [
    '77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js',
    '77-sim-4-nav.js', '77-sim-5-motion.js', '77-sim-5r-routes.js', '77-sim-6-economy.js',
    '77-sim-6-items.js', '77-sim-6-needs.js', '77-sim-6-population.js', '77-sim-6-trade.js',
    '77-sim-7-stocks.js', '77-sim-8-export.js',
]
for f in SIM_FILES:
    PATH.setdefault(f, P('core', 'simulation', f))

for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-4-weather.js',
          '89-atmos-8-export.js', '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):
    PATH.setdefault(f, P('core', 'atmos', f))
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js'):
    PATH[f] = P('core', 'atmos', 'sky', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js'):
    PATH[f] = P('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-smokegroups.js'):
    PATH[f] = P('core', 'atmos', 'fx', f)

sys.path.insert(0, P('core', 'host'))
import host as khost  # noqa: E402
khost.resolve(PATH, khost.FULL + ['92k-host-keys.js'])

# 6. biomes/doubledelta read in place (< +38 m intertidal byssus/sponges + >= +38 m Ria Sound bluff trees)
DDELTA_DIR = P('biomes', 'doubledelta')
PATH['28d-ddelta-mipvar.js'] = os.path.join(DDELTA_DIR, 'src', '28-vstack-mipvar.js')
PATH['40d-biome-ddelta-phys.js'] = os.path.join(DDELTA_DIR, 'src', '40-biome-ddelta-phys.js')
PATH['41d-biome-ddelta-sites.js'] = os.path.join(DDELTA_DIR, 'src', '41-biome-ddelta-sites.js')
PATH['49a-biome-ddelta-species.js'] = os.path.join(DDELTA_DIR, 'src', '50-biome-ddelta-species.js')
PATH['49b-biome-ddelta-place.js'] = os.path.join(DDELTA_DIR, 'src', '60-biome-ddelta-place.js')
PATH['49c-biome-ddelta.js'] = os.path.join(DDELTA_DIR, 'src', '70-biome-ddelta.js')

# 7. Sealed Read-in-Place Bundles: KCITY (+ float/44 & float/55 + multikit/53), RIK (kits/ria), KLK (kits/kulanewa), KCONS, RINGSEA, Furniture
CITY_JS = [
    '10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js',
    '25-city-site.js', '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js',
    '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js',
    'float/44-city-float.js', 'float/55-city-host-float.js',
]


def kcity_bundle():
    files = [P('core', 'city', f) for f in CITY_JS]
    body = ''
    for p in files:
        fn = os.path.basename(p)
        body += '/* ---- %s ---- */\n%s\n' % (rel(p), rd(p))
        if fn == '10-city-core.js':
            body += 'globalThis.KCITY = KCITY;\n'
    return safe(
        '/* KCITY: core/city + multikit + float sealed in one closure (settlements/floating-city/build.py). */\n'
        'var KCITY = (function(window){\n' + body +
        'KCITY.lib = { SL: SL, OCC: OCC, Raster: Raster, V: V, obb: obb, obbCorners: obbCorners, inPoly: inPoly, plan: function(){ return PLAN; } };\n'
        'return KCITY;\n})(Object.create(window));\n'
    ), [rel(p) for p in files]


RIA_DIR = P('kits', 'ria')
KL_DIR = P('kits', 'kulanewa')

_ria_mod = load_py_module('ria_kit_bundle', os.path.join(RIA_DIR, 'kit_bundle.py'))
_kl_mod = load_py_module('kl_kit_bundle', os.path.join(KL_DIR, 'kit_bundle.py'))
_rik_js, _rik_src = _ria_mod.bundle('RIK')
_klk_js, _klk_src = _kl_mod.bundle('KLK')
_rik_js = _rik_js.replace('window.onerror=', 'var _rikOnerror=').replace('window.KMAT_M1 =', 'var _rikKmatM1 =').replace('window.KMAT_M1=', 'var _rikKmatM1=')
_klk_js = _klk_js.replace('window.onerror=', 'var _klkOnerror=').replace('window.KMAT_M1 =', 'var _klkKmatM1 =').replace('window.KMAT_M1=', 'var _klkKmatM1=')


def kcons_bundle():
    files = [P('kits', 'construction', 'src', '10-cons-site.js'), P('kits', 'construction', 'src', '20-cons-lib.js')]
    body = ''.join('/* ---- %s ---- */\n%s\n' % (rel(p), rd(p)) for p in files)
    return safe(body), [rel(p) for p in files]


VESSELS = [
    '81-rs-voth-junk.js',
    '83-rs-voth-ferry.js',
    '84-rs-voth-taxi.js',
    '85-rs-voth-barge.js',
    '89g-rs-ark-ward.js',
    '89h-rs-hk-whaler.js',
    '89i-rs-ria-west-palace.js',
    '89j-rs-ria-east-palace.js',
    '89k-rs-ria-patrician-villa.js',
    '89l-rs-ria-noble-salon.js',
]


def ringsea_bundle():
    sys.path.insert(0, P('settlements', 'voth'))
    import ringsea
    ringsea.VESSELS = VESSELS
    return safe(ringsea.ringsea_fragment().replace('window.onerror=', 'var _rsOnerror=')), [rel(os.path.join(ringsea.RS_SRC, f)) for f in VESSELS] + ['settlements/voth/ringsea.py']


def furn_bundle():
    sys.path.insert(0, P('kits', 'catalog'))
    import furniture_bundle
    fb = furniture_bundle.bundle(['kulanewa', 'ria'], harvested=False)
    return safe(fb + '\n'), []


# 8. Sidecar Texture Packs (.tex.js) — loaded BEFORE RIK, KLK & DOUBLEDELTA so KMAT.packed() finds every slot!
sys.path.insert(0, P('tools', 'textures'))
import matlib_pack  # noqa: E402
SIDE = None if '--inline-packs' in sys.argv else {}

def _excl_pack(bdir, extra=()):
    pj = os.path.join(bdir, 'tex', 'pack.json')
    if not os.path.isfile(pj):
        return list(extra)
    with open(pj, encoding='utf-8') as _fh:
        fams = sorted(json.load(_fh).get('families', {}))
    return [f for f in fams if f.startswith(('f_', 'ground.', 'rock.')) or f in extra]


_kcity_js, _kcity_src = kcity_bundle()
_kcons_js, _kcons_src = kcons_bundle()
_rs_js, _rs_src = ringsea_bundle()
_fb_js, _fb_src = furn_bundle()

BSRC.note(*(_kcity_src + _rik_src + _klk_src + _kcons_src + _rs_src + _fb_src))

RIA_UNUSED = ('alabaster', 'bone', 'earth', 'ebony', 'flag', 'ground', 'lodestone', 'plain', 'sand', 'stone')
KL_UNUSED = ('alabaster', 'bone', 'coal', 'earth', 'flag', 'foliage', 'ground', 'kura', 'nickel', 'plain', 'sand', 'shingle', 'sootstone', 'stone')
DD_UNUSED = ('amber', 'brainsponge', 'brimreed', 'byssus', 'driftwood', 'glassbasket', 'hydroid', 'lotuspad', 'oyster', 'penshell', 'rackwood', 'reed', 'rice', 'seapen', 'sedge', 'tarfelt', 'whippen', 'wrack')

VIRTUAL = {
    '38-furniture-bundle.js': _fb_js,
    '39a-kcity-bundle.js': _kcity_js,
    '39c-kcons-bundle.js': _kcons_js,
    '39d-ringsea-bundle.js': _rs_js,
    '43a-host-matlib-pack-fc.js': matlib_pack.fragment(HERE, 'floating_city', side=SIDE, own=True),
    '43b-host-matlib-pack-ria.js': matlib_pack.fragment(RIA_DIR, 'ria', side=SIDE, exclude=_excl_pack(RIA_DIR, RIA_UNUSED)),
    '43c-host-matlib-pack-kulanewa.js': matlib_pack.fragment(KL_DIR, 'kulanewa', side=SIDE, exclude=_excl_pack(KL_DIR, KL_UNUSED)),
    '43d-host-matlib-pack-doubledelta.js': matlib_pack.fragment(DDELTA_DIR, 'doubledelta', side=SIDE, exclude=_excl_pack(DDELTA_DIR, DD_UNUSED)),
    '43m-rik-bundle.js': _rik_js,
    '43n-klk-bundle.js': _klk_js,
    khost.EDITS_JS: khost.edits_js(HERE, 'floating-city'),
}
for f in VIRTUAL:
    PATH[f] = None

frags = sorted(PATH)
out = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else rd(PATH[f])
    out.append('\n// ==================== %s\n' % f if f.endswith('.js') else '')
    out.append(s)

BSRC.report(PATH)

os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
if SIDE is not None:
    html = matlib_pack.write_sidecar(SIDE, html, DIST, 'floating-city.tex.js', prune=True)
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as _out:
    _out.write(html)

m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as _chk:
    _chk.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True, encoding='utf-8') if node else None
print('built dist/%s  (%d fragments, %d KB)  %s' % (
    OUT, len(frags), len(html) // 1024,
    'syntax NOT CHECKED (no node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]
))
sys.exit(r.returncode if r else 0)
