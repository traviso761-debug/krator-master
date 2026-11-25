#!/usr/bin/env python3
"""Build settlements/arcodiga (Kōpa-Dīga / Arcodiga / Dī-Gā Wài-Sī) -> dist/arcodiga.html + .tex.*.js sidecars.

   python3 tools/build.py settlements/arcodiga          # builds dist/arcodiga.html (< 4.5 MB) + sidecars
   python3 settlements/arcodiga/build.py --list-sources # lists all read repo files (tools/dep_graph.py)
"""
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
        print('NOTE: $NODE=%s is not a node binary; looking elsewhere' % env)
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


def rd(p):
    with open(p, encoding='utf-8') as _fh:
        return _fh.read()


OUT = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'arcodiga.html'
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')} if os.path.isdir(SRC) else {}

# 1. Core modules: shader, export, rand, drawn, shadow, interiors, door, walk, space, hazard, mask, coast, ruins, sched, materials/record, tags, furnish
PATH.setdefault('06-core-khook.js', P('core', 'shader', '06-core-khook.js'))
PATH.setdefault('06b-core-kcolor.js', P('core', 'shader', '06b-core-kcolor.js'))
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, P('core', 'export', f))
PATH.setdefault('08-core-rand.js', P('core', 'rand', '08-core-rand.js'))
PATH.setdefault('10-core-drawn.js', P('core', 'drawn', '10-core-drawn.js'))
PATH.setdefault('10-core-shadow.js', P('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', P('core', 'shadow', 'host', '12-core-shadow-host.js'))
for f in ('10-core-door.js', '20-core-glass.js', '30-core-door-leaf.js'):
    PATH.setdefault(f, P('core', 'door', f))
PATH.setdefault('30h-core-door-host.js', P('core', 'door', '90-core-door-host.js'))
PATH.setdefault('20-core-walk.js', P('core', 'walk', '20-core-walk.js'))
PATH.setdefault('24-core-walk-box.js', P('core', 'walk', 'box', '24-core-walk-box.js'))
PATH.setdefault('20-core-space.js', P('core', 'space', '20-core-space.js'))
PATH.setdefault('20-core-hazard.js', P('core', 'hazard', '20-core-hazard.js'))
PATH.setdefault('21-core-hazard-flow.js', P('core', 'hazard', '21-core-hazard-flow.js'))
PATH.setdefault('20-core-ruins.js', P('core', 'ruins', '20-core-ruins.js'))
PATH.setdefault('21-core-ruins-host.js', P('core', 'ruins', '21-core-ruins-host.js'))
PATH.setdefault('20-core-sched.js', P('core', 'sched', '20-core-sched.js'))
PATH.setdefault('25-core-mask.js', P('core', 'mask', '25-core-mask.js'))
PATH.setdefault('27-core-mask-distance.js', P('core', 'mask', '27-core-mask-distance.js'))
PATH.setdefault('30-core-coast.js', P('core', 'coast', '30-core-coast.js'))
for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js', '27-matlib-m1.js'):
    PATH.setdefault(f, P('core', 'materials', 'record', f))
for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH.setdefault(f, P('core', 'tags', f))
for f in ('50-core-furnish.js', '52-core-furnish-draw.js', '53-core-furnish-host.js'):
    PATH.setdefault(f, P('core', 'furnish', f))

# 2. core/biome: CORE_BIOME_MIN + Crookshore extensions (dither, joint, variants, fungoid, bamboo, anim, traps, lean, env, export, stage)
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    'core/biome/31-core-dither.js', 'core/biome/31j-core-joint.js', 'core/biome/32-core-variants.js',
    'core/biome/33-core-fungoid.js', 'core/biome/33b-core-bamboo.js', 'core/biome/35-core-anim.js',
    'core/biome/37-core-traps.js', 'core/biome/39-core-lean.js', 'core/biome/41-core-env.js',
    'core/biome/42-core-export.js', 'core/biome/43-core-export-host.js', 'core/biome/44-core-stage.js',
]
for rel_b in CORE_BIOME:
    PATH.setdefault(os.path.basename(rel_b), P(*rel_b.split('/')))

# 3. core/terrain + core/world (WRELIEF + WMICRO v2)
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

# 5. core/city constructMesh + core/simulation + core/water + core/atmos + core/host
PATH.setdefault('54-city-host-construct.js', P('core', 'city', '54-city-host-construct.js'))

SIM_FILES = [
    '77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js',
    '77-sim-4-nav.js', '77-sim-5-motion.js', '77-sim-5r-routes.js', '77-sim-6-economy.js',
    '77-sim-6-items.js', '77-sim-6-needs.js', '77-sim-6-population.js', '77-sim-6-trade.js',
    '77-sim-7-stocks.js', '77-sim-8-export.js',
]
for f in SIM_FILES:
    PATH.setdefault(f, P('core', 'simulation', f))

for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH.setdefault(f, P('core', 'water', f))
PATH.setdefault('52f-core-water-farbed.js', P('core', 'water', 'farbed', '53-core-water-farbed.js'))
for f in ('56-core-water-breakup.js', '57-core-water-audit.js', '58-core-water-mirror.js', '58-core-water-shore.js', '62-core-water-flood.js'):
    PATH.setdefault(f, P('core', 'water', 'ext', f))

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
khost.resolve(PATH, khost.FULL + khost.KEYS + khost.UNDERGROUND)

# 6. biomes/crook read in place (CROOK_PHYS, CROOK_SITES, CROOK)
CROOK_DIR = P('biomes', 'crook')
PATH['40a-biome-crook-phys.js'] = os.path.join(CROOK_DIR, 'src', '40-biome-crook-phys.js')
PATH['41a-biome-crook-sites.js'] = os.path.join(CROOK_DIR, 'src', '41-biome-crook-sites.js')
PATH['50-biome-crook-species.js'] = os.path.join(CROOK_DIR, 'src', '50-biome-crook-species.js')
PATH['60a-biome-crook-place.js'] = os.path.join(CROOK_DIR, 'src', '60-biome-crook-place.js')
PATH['70a-biome-crook.js'] = os.path.join(CROOK_DIR, 'src', '70-biome-crook.js')

# 7. Sealed Read-in-Place Bundles & Sidecar Texture Packs
sys.path.insert(0, HERE)
import bundles  # noqa: E402
sys.path.insert(0, P('tools', 'textures'))
import matlib_pack  # noqa: E402

SIDE = None if '--inline-packs' in sys.argv else {}
ANC_DIR = P('kits', 'ancients')
HK_DIR = P('kits', 'hueru-kuran')
ET_DIR = P('kits', 'eternian')


def _excl_furn(bdir, extra=()):
    pj = os.path.join(bdir, 'tex', 'pack.json')
    if not os.path.isfile(pj):
        return list(extra)
    with open(pj, encoding='utf-8') as _fh:
        fams = sorted(json.load(_fh).get('families', {}))
    return [f for f in fams if f.startswith('f_') or f in extra]


def _excl_except(bdir, keep):
    pj = os.path.join(bdir, 'tex', 'pack.json')
    if not os.path.isfile(pj):
        return []
    with open(pj, encoding='utf-8') as _fh:
        fams = sorted(json.load(_fh).get('families', {}))
    return [f for f in fams if f not in keep]


_kcity_js, _kcity_src = bundles.kcity_bundle()
_hkk_js, _hkk_src = bundles.hkk_bundle()
_etk_js, _etk_src = bundles.etk_bundle()
_anc_js, _anc_src = bundles.anc_bundle()
_kcons_js, _kcons_src = bundles.kcons_bundle()
_rs_js, _rs_src = bundles.ringsea_bundle()
_fi_js, _fi_src = bundles.furn_and_interiors_bundle()
_pp_js, _pp_src = bundles.peoples_fragment()

_site_json = os.path.join(HERE, 'site', 'arcodiga-site.json')
_site_js = 'var ADG_SITE_PATCH = %s;\n' % (rd(_site_json).strip() if os.path.isfile(_site_json) else '{}')

BSRC.note(*(
    _kcity_src + _hkk_src + _etk_src + _anc_src + _kcons_src + _rs_src + _fi_src + _pp_src +
    ['settlements/arcodiga/bundles.py', 'settlements/arcodiga/site/arcodiga-site.json']
))

ANC_EXCL = ('brick', 'corrugate', 'paving', 'rubbleK', 'tarp', 'whiteWorn')
HK_EXCL = (
    'baleen', 'banner', 'bone', 'brass', 'cassiterite', 'coal', 'driftwood', 'earth', 'efflor',
    'flag', 'floor', 'galena', 'gossan', 'ground', 'ivory', 'jade', 'malachite', 'marble',
    'pegmatite', 'plain', 'potash', 'quartz', 'reed', 'sand', 'schistem', 'soda', 'stone',
    'sulphur', 'tar', 'turq', 'verdigris', 'wood',
)
ET_EXCL = ('gilt', 'ground', 'onyx', 'screen', 'screenB', 'titanium')
CROOK_KEEP = (
    'bark.cedar', 'bark.cypress', 'bark.fir', 'bark.maple', 'bark.spruce',
    'beard', 'blossom', 'cedar', 'maple', 'rhodo',
    'rock.basalt', 'sponge.chimney', 'sponge.cup', 'sponge.cushion', 'spruce',
)

VIRTUAL = {
    # Sidecar texture packs register KMAT.pack BEFORE HKK, ETK, ANC & CROOK bind materials!
    '38a-furn-interiors-bundle.js': _fi_js,
    '38m-matlib-pack-arcodiga.js': matlib_pack.fragment(HERE, 'arcodiga', side=SIDE, own=True),
    '38n-matlib-pack-ancients.js': matlib_pack.fragment(ANC_DIR, 'ancients', side=SIDE, exclude=ANC_EXCL),
    '38o-matlib-pack-hueru-kuran.js': matlib_pack.fragment(HK_DIR, 'hueru-kuran', side=SIDE, exclude=_excl_furn(HK_DIR, HK_EXCL)),
    '38p-matlib-pack-eternian.js': matlib_pack.fragment(ET_DIR, 'eternian', side=SIDE, exclude=_excl_furn(ET_DIR, ET_EXCL)),
    '38q-matlib-pack-crook.js': matlib_pack.fragment(CROOK_DIR, 'crook', side=SIDE, own=True, exclude=_excl_except(CROOK_DIR, CROOK_KEEP)),
    '39a-kcity-bundle.js': _kcity_js,
    '39b-hkk-bundle.js': _hkk_js,
    '39c-etk-bundle.js': _etk_js,
    '39d-anc-bundle.js': _anc_js,
    '39e-kcons-bundle.js': _kcons_js,
    '39f-ringsea-bundle.js': _rs_js,
    '39g-peoples-data.js': _pp_js,
    '39h-site-patch.js': _site_js,
    khost.EDITS_JS: khost.edits_js(HERE, 'arcodiga'),
}
for f in VIRTUAL:
    PATH[f] = None

frags = sorted(PATH)
out = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else rd(PATH[f])
    out.append('\n// ==================== %s\n' % f if f.endswith('.js') else '')
    out.append(s)

BSRC.report(PATH, [_site_json])

os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
if SIDE is not None:
    html = matlib_pack.write_sidecar(SIDE, html, DIST, 'arcodiga.tex.js', prune=True)
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as _out:
    _out.write(html)

m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as _chk:
    _chk.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True, encoding='utf-8') if node else None
if os.path.exists(chk):
    os.remove(chk)
print('built dist/%s  (%d fragments, %d KB)  %s' % (
    OUT, len(frags), len(html) // 1024,
    'syntax NOT CHECKED (no node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]
))
sys.exit(r.returncode if r else 0)
