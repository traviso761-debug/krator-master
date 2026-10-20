#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: Longsong, the History Monks' monastery in the Oidong
Valley, built in situ on the scale model's land (PLAN.md, README.md; the programme is BLUEPRINT.md).

  00-head.html        page shell, opens <script>
  07..38              core/export, core/rand, the BIOME CORE (core/biome), core/space, core/tags, the material library,
                      core/terrain's 38-core-relief (KRELIEF: the noise the open world's fields take)
  39-ls-world-data    GENERATED (Pinnacle Rock's tools/world_data.py, read in place): the scale model round the site
                      (region/data, cut by tools/scale-model/extract_region.py), decoded at build time
  10..40 crop         the CROPS kit, read in place (kits/crops/src): what the valley can grow
  40-ls-plan          THE PLAN as data [G data]: the site, the rock, the ward, every building, the Vault, the sealed
                      things, the people and their schedules
  40b-ls-farms        THE FARMS AND GARDENS as data [G data]: fields, terraces, pools, groves, orchards, beds, herds
  41-world-fields     the open world's fields, read in place (openworld/little-demo/src): WORLD.H, the land at 1:1
  42-ls-world         HOST: WORLD.init, the page's origin on the model
  44-host-matlib-pack GENERATED (tools/textures/matlib_pack.py): Longsong's library maps and the Oidong kit's, as sidecars
  45-host-stage       HOST: renderer, light, the land and the plan's shapes on it, the fields, BIO.init
  50, 55, 60, 70      the OIDONG kit, read in place (biomes/oidong/src)
  62-ls-arch          HOST: the architecture kit (Tibetan massing in the Order's vocabulary; stone and lime, no earth)
  64-ls-monastery     HOST: the grounds and the monastery drawn from the plan's records
  66-ls-vault         HOST: the forbidden depths: the Vault and the Procrastinator
  68-ls-life          HOST: the people drawn from the plan's records (the life layer's scaffold)
  82-host-sky         the Oidong Valley's sky (the standard Krator sky with the giant), read in place
  84-ls-ground        HOST: the ground, the stream and the pond
  58-fauna-bundle     GENERATED (kits/fauna/fauna_bundle.py): the Fauna kit's farm group, KratorFauna (the herds)
  85-ls-farms         HOST: the farms and gardens drawn from 40b's records (the library's crop cards, the field walls)
  86-ls-far           HOST: the far terrain, the model's land to 60 km
  88-host-build       HOST: the build order (the monastery's records first, then the kit, then one bake)
  89-atmos, 20..51    core/atmos (the clock, the waves, the sky's light) and core/water, read in place
  89w-ls-water        HOST: the stream, the canal, the pond and the pools on core/water
  90..99              HOST (core/host: the whole interface) and 99-host-take, the page handed to it
  99-tail.html        closes <script>

The kit never references a host global except through BIO.host (BIOME-API.md); build.py greps its fragments for the
forbidden names.
"""
import json, os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
# tools/check_port.py checks this build before anything else; --no-checks skips it like the other checks.
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
OUT = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'longsong.html'
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
CORE_TERRAIN = ['38-core-relief.js']   # KRELIEF: the noise the open world's fields take
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js', '42-core-export.js', '43-core-export-host.js',
              '36-core-walker.js', '44-core-stage.js']   # 36: the herds walk (BIO.walker); 44: KSTAGE, the export's light, air and sky
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    PATH.setdefault(f, os.path.join(ROOT, 'core', 'terrain', f))
for f in CORE_BIOME:
    PATH.setdefault(f, os.path.join(ROOT, 'core', 'biome', f))
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every record the page makes is a core/tags record
for f, d in {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}.items():
    PATH.setdefault(f, os.path.join(ROOT, 'core', d, f))
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, os.path.join(ROOT, 'core', 'export', f))
# the OIDONG kit, read in place (biomes/oidong/src): the species, the trees, the floor and its build; its own stage (45),
# ground (84), build (88) and page (99) are this page's. Its sky (82) is read in place: the valley's light.
OD = os.path.join(ROOT, 'biomes', 'oidong')
for f in ('50-biome-oidong-species.js', '55-biome-oidong-trees.js', '60-biome-oidong-floor.js', '70-biome-oidong.js', '82-host-sky.js'):
    PATH[f] = os.path.join(OD, 'src', f)
# the Crops kit, read in place (kits/crops/API.md, "Reading it from a build"): what the Oidong Valley can grow; the farms
# (40b-ls-farms.js) sow only its ids, and the page checks them (FCHK.crops)
for f in ('10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '40-crop-query.js'):
    PATH[f] = os.path.join(ROOT, 'kits', 'crops', 'src', f)
# core/water and core/atmos (core/water/README.md, "Taking it into a build"; biomes/sedesert is the worked example): the
# stream and the canal are flows, the pond and the pools still water, drawn by 89w-ls-water.js on core/atmos's clock, wave
# chunk and sky light (8-export: ATMOS.export, so the export's atmos section fills)
for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH.setdefault(f, os.path.join(ROOT, 'core', 'water', f))
# core/simulation (SIM), read in place: the people's world (40d-ls-sim.js declares it; 68-ls-life.js draws SIM.pose)
for f in ('77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js', '77-sim-4-nav.js', '77-sim-5-motion.js',
          '77-sim-5r-routes.js', '77-sim-6-economy.js', '77-sim-6-items.js', '77-sim-6-needs.js', '77-sim-6-population.js', '77-sim-6-trade.js',
          '77-sim-7-stocks.js', '77-sim-8-export.js'):
    PATH.setdefault(f, os.path.join(ROOT, 'core', 'simulation', f))
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-2-lights.js', '89-atmos-3-particles.js', '89-atmos-4-weather.js', '89-atmos-7-cull.js',
          '89-atmos-8-export.js', '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):   # 3, 4, 7, 9: smoke, fireflies, the weather and its selector, culling (89z)
    PATH.setdefault(f, os.path.join(ROOT, 'core', 'atmos', f))
# core/walk (KWALK), read in place: the walker's floors and blocks (64 registers the Great Stair's flights, landings and
# the base's top as it draws them; 99 hands the registry to the camera: F walks up the stair)
PATH.setdefault('20-core-walk.js', os.path.join(ROOT, 'core', 'walk', '20-core-walk.js'))
# core/sched (KSCHED): motion as pure functions of time (the Procrastinator's glyph pulse, 66); core/lod: the finished
# scene's level of detail (97 takes the scene over before 99; window.LOD_OPTIONS from 89z)
PATH.setdefault('20-core-sched.js', os.path.join(ROOT, 'core', 'sched', '20-core-sched.js'))
# core/hamlet (KHAMLET, read in place) and the one core/city fragment it takes (33: KCITY.prim, standalone): the valley's
# lay villages outside the wall (40h lays them out, 85h draws them)
for f in ('10-hamlet-wood.js', '12-hamlet-gather.js', '20-hamlet-cultures.js', '30-hamlet-village.js', '40-hamlet-felling.js'):
    PATH.setdefault(f, os.path.join(ROOT, 'core', 'hamlet', f))
PATH.setdefault('33-city-strategies.js', os.path.join(ROOT, 'core', 'city', '33-city-strategies.js'))
for f in ('09-lod.js', '97-lod-auto.js'):
    PATH.setdefault(f, os.path.join(ROOT, 'core', 'lod', f))
# the open world's fields, read in place: the land round the site at 1:1
PATH['41-world-fields.js'] = os.path.join(ROOT, 'openworld', 'little-demo', 'src', '41-world-fields.js')
# the host shell from core/host, the whole interface (core/host/README.md): the inspector, marks, pictures, the minimap,
# the editor, the cutaway, and the core modules they read (core/edits, core/space, core/minimap)
sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost
khost.resolve(PATH, khost.FULL)
for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js'):
    if f not in PATH:
        sys.exit('NO BIOME CORE: ' + f)
# the material library (core/materials/record): the record and its browser half; the packs as sidecars beside the page
for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js'):   # 26: KMAT.bindMat, for the Xanadu kit's MAT (85h)
    PATH.setdefault(f, os.path.join(ROOT, 'core', 'materials', 'record', f))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp
SIDE = None if '--inline-packs' in sys.argv else {}
def _fauna_bundle():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'fauna'))
    import fauna_bundle
    return fauna_bundle.bundle(['farm'], tex=False, mdl=False) + '\n'
# GENERATED fragments 52 and 57b: the interiors (PLAN.md P4; ROOMS.md step 3; README "Furniture that is not always drawn
# is data first"; Mav's Refuge is the worked example). 52 is the catalog's furniture (kits/catalog/furniture_bundle.py:
# the Xanadu sets, the Order's harvested set, the abyss's and the generic goods, as the KratorFurniture closure) and the
# interiors core (kits/interiors/kit_bundle.py: KratorInteriors, ROOM, furnishRoom; no building set). 57b is the bake:
# interiors-bake.json, written by bake_interiors.py from a loaded page, every room's pieces. Its `kit` is the hash of
# what decides a plan (the bundle, 40c's rooms and 57a's programmes and layouts, CRLF read as LF): when it differs the
# bake is stale and is not inlined (the page then furnishes each storey when it is first shown).
FURN_CULTURES = ['xanadu', 'eastabyss', 'generic', 'generic-goods']
BAKE = os.path.join(HERE, 'interiors-bake.json')
def _interiors():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle, hashlib, json
    bundle = furniture_bundle.bundle(FURN_CULTURES, harvested=True) + kit_bundle.bundle([])
    src = ''.join(open(os.path.join(SRC, f), encoding='utf-8').read() for f in ('40c-ls-rooms.js', '57a-ls-interiors.js'))
    kit = hashlib.sha1((bundle + src).replace('\r\n', '\n').encode()).hexdigest()[:12]
    bake = None
    if os.path.isfile(BAKE):
        with open(BAKE, encoding='utf-8') as fh:
            bake = json.load(fh)
        if bake.get('kit') != kit:
            print('NOTE: interiors-bake.json is stale (kit %s, now %s): not inlined. Run python3 bake_interiors.py' % (bake.get('kit'), kit))
            bake = None
    else:
        print('NOTE: no interiors-bake.json: the page furnishes each storey when it is shown. Run python3 bake_interiors.py')
    body = ("/* GENERATED by build.py from interiors-bake.json (bake_interiors.py): every room's pieces. Do not edit. */\n"
            'LSIX.adoptBake(%s, %s);\n' % (json.dumps(bake, separators=(',', ':')) if bake else 'null', json.dumps(kit)))
    return bundle + '\n', body
_IXB, _IXBAKE = _interiors()
# the people dressed (PLAN.md P5b): core/charactermodels read in place (KCHAR: the records and KCHAR.stranger; KCharFigure:
# the drawing; the r128 GLTFLoader it parses pieces with), its data cut to the two peoples Longsong draws (the Order of
# Historians, Xanadu: their clothes, the hair their styles name, a few beards), and their pieces as SIDECARS beside the
# page (dist/kchar/<body>__<piece>.js, one script each, loaded only when a dressed figure first needs it; in LFS). A
# sidecar is remade from core/charactermodels/dist/pieces/<body>/<piece>.txt when that is here (its build.py writes them;
# pieces/ is not in Git), else the committed one stands.
CM = os.path.join(ROOT, 'core', 'charactermodels')
for f, src in (('47k-kchar-rig.js', os.path.join(CM, 'src', '10-rig.js')), ('47l-kchar-figure.js', os.path.join(CM, 'src', '50-figure.js')),
               ('47j-kchar-gltf.js', os.path.join(CM, 'tools', 'vendor', 'GLTFLoader.r128.js')),
               ('47m-kchar-crowd.js', os.path.join(CM, 'src', '60-crowd.js'))):   # KCharCrowd: the crowd past the figures (69)
    PATH[f] = src
KCHAR_PEOPLES = ('historians', 'xanadu')
KCHAR_BEARDS = {'mpfb_male': ['grinsegold_full_beard', 'wdg_scruffy_beard', 'grinsegold_moustache', 'Goatee'], 'mpfb_female': []}
def _kchar():
    import json
    J = lambda *p: json.load(open(os.path.join(CM, 'data', *p), encoding='utf-8'))
    peoples = [p for p in J('peoples.json')['peoples'] if p['id'] in KCHAR_PEOPLES]
    bodies, need = {}, []
    for b in ('mpfb_male', 'mpfb_female'):
        kit = J(b, 'kit.json')
        sty = {x for p in peoples for x in p['styles'][b[5:]]}
        kit['items'] = [it for it in kit['items'] if it.get('culture') in KCHAR_PEOPLES or (it['slot'] == 'hair' and it['id'] in sty)
                        or (it['slot'] == 'beard' and it['id'] in KCHAR_BEARDS[b])]
        bodies[b] = {'skeleton': J(b, 'skeleton.json'), 'kit': kit}
        need += [b + '/base', b + '/anims'] + [it['glb'][len('pieces/'):-len('.glb')] for it in kit['items']]
    kd = os.path.join(DIST, 'kchar')
    os.makedirs(kd, exist_ok=True)
    keep, missing = set(), []
    for k in need:
        src, out = os.path.join(CM, 'dist', 'pieces', k + '.txt'), os.path.join(kd, k.replace('/', '__') + '.js')
        keep.add(os.path.basename(out))
        if os.path.exists(src):
            t = open(src, encoding='utf-8').read().strip('\n')
            mo = os.path.join(CM, 'dist', 'pieces', k + '.morph.txt')
            if '\n' not in t and os.path.exists(mo):          # a piece whose deltas were published in a file of their own
                t += '\n' + open(mo, encoding='utf-8').read().strip('\n')
            body = 'KCHAR_SIDE(%s,%s);\n' % (json.dumps(k), json.dumps(t))
            if not os.path.exists(out) or open(out, encoding='utf-8').read() != body:
                with open(out, 'w', encoding='utf-8', newline='\n') as fh:
                    fh.write(body)
        elif not os.path.exists(out):
            missing.append(k)
    for f in os.listdir(kd):
        if f not in keep:
            os.remove(os.path.join(kd, f))
    if missing:
        sys.exit('KCHAR PIECES MISSING (build core/charactermodels, or fetch them from its published lab): ' + ', '.join(missing))
    data = {'sliders': J('sliders.json'), 'posture': J('posture.json'), 'peoples': peoples, 'bodies': bodies}
    return 'var LS_KCHAR=%s;\nLS_KCHAR.pieces=%s;\n' % (json.dumps(data, separators=(',', ':')), json.dumps(need))
# the Xanadu kit (settlements/xanadu/kit_bundle.py) and the isle demo's kit-piece flattener (isleFlatten, read in place)
XA = os.path.join(ROOT, 'settlements', 'xanadu')
XA_FAMS = ('cloth', 'clothR', 'corrugate', 'plaster', 'stone', 'tarp', 'thatch', 'white', 'wood', 'woodV', 'xBandC', 'xEarth', 'xMosC',
           'xMosD', 'xPenbey', 'xRubble', 'xSun', 'xTiles', 'xValance', 'xWash')   # the MAT keys the village buildings use (2026-10-20)
def _xa_skip():
    with open(os.path.join(XA, 'tex', 'pack.json'), encoding='utf-8') as f:
        return tuple(k for k in json.load(f)['families'] if k not in XA_FAMS)
def _xak():   # by path: kits/interiors/kit_bundle.py is already imported as kit_bundle
    import importlib.util
    spec = importlib.util.spec_from_file_location('xanadu_kit_bundle', os.path.join(XA, 'kit_bundle.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    js, _ = mod.bundle('XAK')
    return js
PATH.setdefault('58-isle-protos.js', os.path.join(ROOT, 'settlements', 'isle-demo', 'src', '58-isle-protos.js'))
# the world data: Pinnacle Rock's decoder, read in place (its tools/world_data.py), with this page's kit line
sys.path.insert(0, os.path.join(ROOT, 'settlements', 'pinnacle-rock', 'tools'))
import world_data as _wd
VIRTUAL = {'39-ls-world-data.js': _wd.fragment(os.path.join(HERE, 'region'),
                kits="var WORLD_KITS=[{name:'oidong',global:'OIDONG',overlay:'oidong valley'}];\n", name='39-ls-world-data.js'),
           '44-host-matlib-pack.js': _mp.fragment(HERE, 'longsong', side=SIDE),
           # the Fauna kit (kits/fauna/fauna_bundle.py): the farm group (the yak, the cattle) for the herds, without its
           # detail maps or its baked models (85 bakes each posed kind into one instanced mesh)
           '58-fauna-bundle.js': _fauna_bundle(),
           '52-ls-furniture-bundle.js': _IXB, '57b-ls-interiors-bake.js': _IXBAKE,
           '44b-host-matlib-pack-oidong.js': _mp.fragment(OD, 'oidong', side=SIDE),
           '47n-ls-kchar-data.js': _kchar(),
           # core/sockets read in place, in a closure with the host it expects (sockets/head.js: the globals it takes, drawn
           # through ARCH) and its API (sockets/tail.js: LSSOCK.mark); 65-ls-marks.js declares the buildings' sockets
           '63s-ls-sockets.js': ''.join(open(f, encoding='utf-8').read() + '\n' for f in (
               os.path.join(HERE, 'sockets', 'head.js'), os.path.join(ROOT, 'core', 'sockets', '37-sockets.js'),
               os.path.join(ROOT, 'core', 'sockets', '38-symbols.js'), os.path.join(ROOT, 'core', 'sockets', '80-cultures.js'),
               os.path.join(HERE, 'sockets', 'tail.js'))),
           # the Xanadu building kit for the valley's villages (85h): sealed as XAK (settlements/xanadu/kit_bundle.py, read in
           # place), its library pack beside the page with only the families the village buildings draw (XA_FAMS)
           '84x-ls-xanadu-kit.js': _xak(),
           '44c-host-matlib-pack-xanadu.js': _mp.fragment(XA, 'xanadu', exclude=_xa_skip(), side=SIDE),
           khost.EDITS_JS: khost.edits_js(HERE, 'longsong')}
for f in VIRTUAL:
    PATH[f] = None
frags = sorted(PATH)
out = []; bad = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
    n = int(re.match(r'(\d+)', f).group(1))
    if 10 <= n < 80 and '-biome-' in f:   # the kit's fragments
        for w in FORBID:
            if w in s:
                bad.append(f + ': uses ' + w)
    out.append('\n// ==================== ' + f + '\n' if f.endswith('.js') else '')
    out.append(s)
if bad:
    sys.exit('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad))
os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
if SIDE:
    html = _mp.write_sidecar(SIDE, html, DIST, 'longsong.tex.js')
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)
# syntax check on the script body
m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
print('built dist/%s  (%d fragments, %d KB)  ' % (OUT, len(frags), len(html) // 1024) +
      ('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op = [l for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
    if op:
        print('KNOWN_ISSUES.md: %d open item(s) -- read it before changing this build' % len(op))
sys.exit(r.returncode if r else 0)
