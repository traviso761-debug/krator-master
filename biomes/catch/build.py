#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<page>.html: the Catch, the sealed basin south-east of the Godthrone
(PLAN.md). Built as stations, like Korona's and the Throne's: each is its own page from the same kit.

  python3 build.py                     station 1, THE SAND SEA: src/ as it is -> dist/catch.html
  python3 build.py --station oasis     station 2, STAIR'S OASIS: stations/oasis/'s fragments replace src/'s of the same
                                       name; its station.json names the page ("out")
  python3 build.py --all               every station

  00-head.html          page shell, opens <script>
  07..44                core: export, rand, the biome core, core/terrain (KSTACKS: the lake-bed mesas; KBASIN: the old lake's
                        marks and the yardangs), core/space, core/water, the material library and the packs (catch, sedesert)
  45-host-scene         HOST: renderer, scene, lights, the error panel, the registry
  45b-host-stage        HOST: the station's land, its water records, its fields, BIO.init, STAGE (one per station)
  45c-host-ground       HOST: the painted ground with the library's layers, for any station
  46-host-rock          HOST: the stage's KSTACKS bodies as meshes (the castellated lake-bed mesas)
  49a..49d              the SEDESERT kit read in place (biomes/sedesert): the wadi palm and the mesquite at the oases, its
                        reeds and sedges; 49z ends its registry (its fauna fragment, which does, is not read: too hot for deer)
  50..70                THE KIT (CATCH): species, trees, floor, build
  79-host-mechs         GENERATED: the kits/mechs bundle, culture stalker only (KratorMechs)
  80-host-stalkers      HOST: the Stalker pair half-buried in the sand (set dressing)
  88-host-build         HOST: the build order
  89-atmos-*            core/atmos: the core, presets, dust, weather, export, waves, skylight, the shared sky, the bindings
  89a..89x              HOST: ATMOS.bindHost, the shared sky with the station's ridges, the water drawn, the weather
  89zz-host-core        HOST: the universal set (the final rebuild, pair 11): the wind and A2C, the far poplars' impostors, height fog,
                        KSHADOW (?shadow=1 only), the rain cover and KHORIZON by the ground's texture units, the water as fields
  98z-host-mirror       HOST: the reflections switch on the station's largest water (core/water ext/58), off at load
  90..98                HOST (core/host: camera, loop, panel, probe, the authoring tools)
  99-host-take          the page handed to core/host
  99-tail.html          closes <script>

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); the build greps for the
forbidden names so a kit fragment cannot quietly grow a dependency on one world's engine.
"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools'))
import build_sources as BSRC   # --list-sources (tools/dep_graph.py)

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places
    (/opt/node*/bin, /usr/local/bin, ~/.nvm, ~/.volta; the newest first). None when
    there is none: the build then says plainly that the syntax was NOT checked.
    Every build.py carries this same function; a fix belongs in all of them."""
    import glob as _g, shutil as _sh
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


HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
CORE = lambda *p: os.path.join(ROOT, 'core', *p)
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
STATIONS = ['oasis', 'lake', 'fan']

# core/terrain: KSTACKS (the lake-bed mesas), KBASIN (the old lake's strandlines, silt, salt and the wind's yardangs); the final rebuild
# (pair 11, 2026-11-09): KGROUND (43: the ground's library layers, hex-tiled, scaled with distance, blended by height: 45c) and KHORIZON
# (45: the land's shadow at a low sun, decided by the ground's texture units in 89zz)
CORE_TERRAIN = ['37-core-stacks.js', '40-core-basin.js', '43-core-ground.js', '45-core-horizon.js']
CORE_TERRAIN_HOST = {'45-core-horizon-shade.js': '45-core-horizon-shade.js'}   # core/terrain/host/: KHORIZON.shade
# core/biome (core/README.md): one copy for every kit. The final rebuild's lists (ringisles' and korona's): the leafset (31b: BIO.leafOn,
# which the sedesert kit read in place calls), the limb joint (31j: BIO.flareJoin), variant pools (32), the fungoid parts (33), octahedral
# impostors (34: the far poplars and, through the sedesert kit, BIO.impostor*), animation (35), the lean (39), the field contract (41), the stage (44)
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '31j-core-joint.js', '32-core-variants.js',
              '33-core-fungoid.js', '34-core-impostor.js', '35-core-anim.js', '37-core-traps.js', '39-core-lean.js', '40-core-place.js',
              '41-core-env.js', '42-core-export.js', '43-core-export-host.js', '44-core-stage.js']
# core/shadow (KSHADOW): attached only on ?shadow=1 (the owner, 2026-11-03: toggleable, off by default; 89zz)
CORE_SHADOW = {'10-core-shadow.js': ('shadow', '10-core-shadow.js'), '12-core-shadow-host.js': ('shadow', 'host', '12-core-shadow-host.js')}
# core/hazard (core/hazard/README.md, "Adopting it"; 2026-10-26): the Stalkers' sand is a hunter hazard (KHAZ.PREDATOR); it
# runs on the one clock (37-core-traps.js KTRAPS.cycle, above)
CORE_HAZARD = ['20-core-hazard.js']
CORE_SPACE = ['20-core-space.js']
# core/rand and core/tags: with BIO.init({tags}) every item set, instance and registered volume is a core/tags record
CORE_TAGS = {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}
CORE_EXPORT = ['07-core-export.js', '09-core-export-adapters.js']
# core/water: the soda lake (WATER.open, drawn in 89w), the oasis pools (WATER.still), the north fan's trickle (WATER.flow)
CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']
# the final rebuild: the edge audit, the reflections switch (off at load: 98z), the shore's fields (tools/fragment_needs.json orders them)
CORE_WATER_EXT = ['57-core-water-audit.js', '58-core-water-mirror.js', '60-core-water-fields.js']
# core/atmos: the core, presets, the dust off dry ground, the weather and its selector, the export, the wave chunk, the skylight
CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3d-dust.js', '89-atmos-4-weather.js', '89-atmos-8-export.js',
              '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js']
ATMOS_SKY = ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js']   # the shared sky (core/atmos/SKY-PLAN.md)
ATMOS_HOST = ['89-atmos-c-hostbind.js', '89-atmos-e-weatherhost.js', '89-atmos-h-skyhost.js', '89-atmos-j-heightfog.js']   # bindHost, bindWeather, ATMOS.sky, height fog
ATMOS_FOG = ['89-atmos-j-fog.js']   # core/atmos/sky: the height fog's chunk (R1; the page's own ShaderChunk fog is gone)
ATMOS_FX = ['89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js']   # the rain's occlusion map (R10), the storm's lightning
CORE_MAT = ['23-mat-record.js', '25-matlib-host.js']
# the SEDESERT kit read in place (biomes/WORLD.md: several kits on one page): its oasis trees and floor
SED = os.path.join(ROOT, 'biomes', 'sedesert')
KITS = {'49a-sed-species.js': 'src/50-biome-sedesert-species.js', '49b-sed-trees.js': 'src/55-biome-sedesert-trees.js',
        '49c-sed-floor.js': 'src/60-biome-sedesert-floor.js', '49d-sed-build.js': 'src/70-biome-sedesert.js'}


def build(station=None):
    PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
    out_name = 'catch.html'
    if station:
        sd = os.path.join(HERE, 'stations', station)
        stn = json.load(open(os.path.join(sd, 'station.json'), encoding='utf-8'))
        out_name = stn['out']
        for f in os.listdir(sd):
            if f.endswith('.js') or f.endswith('.html'):
                PATH[f] = os.path.join(sd, f)
    for f in CORE_TERRAIN:
        PATH.setdefault(f, CORE('terrain', f))
    for f, p in CORE_TERRAIN_HOST.items():
        PATH.setdefault(f, CORE('terrain', 'host', p))
    for f, p in CORE_SHADOW.items():
        PATH.setdefault(f, CORE(*p))
    for f in CORE_BIOME:
        PATH.setdefault(f, CORE('biome', f))
    for f, d in CORE_TAGS.items():
        PATH.setdefault(f, CORE(d, f))
    for f in CORE_EXPORT:
        PATH.setdefault(f, CORE('export', f))
    for f in CORE_SPACE:
        PATH.setdefault(f, CORE('space', f))
    for f in CORE_HAZARD:
        PATH.setdefault(f, CORE('hazard', f))
    for f in CORE_WATER:
        PATH.setdefault(f, CORE('water', f))
    for f in CORE_WATER_EXT:
        PATH.setdefault(f, CORE('water', 'ext', f))
    for f in CORE_ATMOS:
        PATH.setdefault(f, CORE('atmos', f))
    for f in ATMOS_SKY:
        PATH.setdefault(f, CORE('atmos', 'sky', f))
    for f in ATMOS_HOST:
        PATH.setdefault(f, CORE('atmos', 'host', f))
    for f in ATMOS_FOG:
        PATH.setdefault(f, CORE('atmos', 'sky', f))
    for f in ATMOS_FX:
        PATH.setdefault(f, CORE('atmos', 'fx', f))
    for f in CORE_MAT:
        PATH.setdefault(f, CORE('materials', 'record', f))
    for slot, p in KITS.items():
        PATH[slot] = os.path.join(SED, p)
    # the host shell (core/host/README.md): camera, loop and clock, panel, probe, and the authoring tools
    sys.path.insert(0, CORE('host'))
    import host as khost
    khost.resolve(PATH, khost.FULL + ['94-host-polytool.js'])   # the whole interface and the authoring tools (the final rebuild)
    miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js') if f not in PATH]
    if miss:
        print('NO BIOME CORE: ' + ', '.join(miss)); sys.exit(1)
    # generated: the library packs (this kit's and the sedesert kit's, without its ground layers) and the Stalker bundle
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack as _mp
    sed_pack = json.load(open(os.path.join(SED, 'tex', 'pack.json'), encoding='utf-8'))
    sed_ex = [f for f in sorted(sed_pack.get('families', {})) if f.startswith('ground') or f.startswith('tower') or f.startswith('jetty')]
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'mechs'))
    import mech_bundle
    VIRTUAL = {'44-host-matlib-pack.js': _mp.fragment(HERE, 'catch', own=True),
               '44b-host-matlib-pack-sedesert.js': _mp.fragment(SED, 'sedesert', exclude=sed_ex),
               '79-host-mechs.js': mech_bundle.bundle(['stalker']),
               khost.EDITS_JS: khost.edits_js(HERE, 'catch' if not station else 'catch-' + station)}
    for f in VIRTUAL:
        PATH[f] = None
    frags = sorted(PATH)
    out = []; bad = []
    for f in frags:
        s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
        n = int(re.match(r'(\d+)', f).group(1))
        if 10 <= n < 80 and '-host-' not in f:
            for w in FORBID:
                if w in s:
                    bad.append(f'{f}: uses {w}')
        out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
    if bad:
        print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad)); sys.exit(1)
    BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
    os.makedirs(DIST, exist_ok=True)
    html = ''.join(out)
    open(os.path.join(DIST, out_name), 'w', encoding='utf-8', newline='\n').write(html)
    m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
    js = m.group(1) if m else ''
    chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf-8', newline='\n').write(js)
    node = find_node()
    r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
    print(f'built dist/{out_name}  ({len(frags)} fragments, {len(html)//1024} KB)  ' +
          ('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
    return r.returncode if r else 0


if __name__ == '__main__':
    if '--all' in sys.argv:
        rc = build()
        for s in STATIONS:
            rc = build(s) or rc
    else:
        rc = build(sys.argv[sys.argv.index('--station') + 1] if '--station' in sys.argv else None)
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if op:
            print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
    sys.exit(rc)
