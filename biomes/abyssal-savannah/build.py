#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the abyssal savannah (PLAN.md).

  python3 build.py                     the main page, the rim slope (src/) -> dist/abyssal-savannah.html
  python3 build.py --station <name>    a savannah rim (PLAN.md section 14, "The savannah rims"; biomes/hyperjungle/PLAN-LANDS.md
                                       sections 4, 5, 9 and 14): src/rim/ (the rims' shared base) with stations/<name>/'s fragments
                                       added (a name in both is the station's) -> dist/abyssal-savannah-<name>.html. `serim` (station 1,
                                       the se rim: the incense country), `erim` (station 2, the e rim near Fridon), `north` (station 3,
                                       hyperjungle N's savannah). build_station() below; the main page never reads src/rim/

  00-head.html      page shell, opens <script>
  07..44            the cores: export, rand, biome, space, tags, materials and the generated packs
  45-host-stage     HOST: renderer, the rim slope's terrain and fields, BIO.init -- runs before the kits
  47a..47c          the EASTERN ABYSS kit read in place (its species and trees, for the jungle at the foot and in the gullies)
  50..79            BIOME LEAVES (the abyssal savannah's species, trees, floor, build)
  80..98            HOST (build order, the shared sky, the atmosphere, the water) and the host shell (core/host)
  99-host-take      the page handed to core/host; 99-tail.html closes <script>

The core and the biome leaves never reference a host global except through BIO.host (biomes/eastabyss/BIOME-API.md);
the FORBID scan below fails the build if a kit fragment grows a dependency on one world's engine.
"""
import os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places (the newest first). None when there
    is none: the build then says plainly that the syntax was NOT checked. Every build.py carries this same function."""
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
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
STN_ROOT = os.path.join(HERE, 'stations')
if os.path.isdir(STN_ROOT):
    BSRC.variants([['--station', _s] for _s in sorted(os.listdir(STN_ROOT)) if os.path.isfile(os.path.join(STN_ROOT, _s, 'station.json'))])   # every station's page
# The rims' own pack families (materials.json, the rims' part of its note): packed under the rims' kit key 'savannarim' (src/rim/50 SAVRIM.MAT,
# KMAT.packed('savannarim', ...)) on the station pages, left out of the main page. The rims take this kit's groundDetail as it is (one set, one entry)
RIM_PACK = ['blind', 'fan', 'grass', 'incensebark', 'palmbark', 'termite']


def build_station(station):
    """A savannah rim's page (folded in from biomes/savannarim, 2026-11-08; PLAN.md section 14): src/rim/ (the rims' shared base: the stage,
    the rims' species, trees and grass, the land's passes, the sky, the air, the water, the take) with stations/<station>/ added (its
    44l-host-land.js is the land's map and weights, an 87e-host-own.js its own passes); station.json names the page ("out"), the core fragments
    it adds ("core"), other fragments read in place ("kits", "paths") and its neighbours' kits ("neigh", below)."""
    import json as _json
    RIM = os.path.join(SRC, 'rim')
    STN_DIR = os.path.join(STN_ROOT, station)
    if not os.path.isfile(os.path.join(STN_DIR, 'station.json')):
        sys.exit('build.py: no station %r (stations/<name>/station.json; PLAN.md section 14)' % station)
    with open(os.path.join(STN_DIR, 'station.json'), encoding='utf-8') as fh:
        STN = _json.load(fh)
    OUT = STN['out']
    FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
    # shared fragments from core/terrain, opt-in by name (core/README.md): 43 KGROUND (the ground's library layers), 44 KFAR (the land past the map),
    # 45 KHORIZON, with their host halves below; 37 KSTACKS (H10: the termite cathedrals, KSTACKS.mounds)
    CORE_TERRAIN = ['37-core-stacks.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js']
    # the biome core from core/biome (core/README.md), as crater-drylands takes it (31b the leafset, 31j a limb's joint, 32 the variants and kin, 34 the
    # impostors, 41 the environmental fields, 44 the stage as data), plus what the savannah needs (PLAN-LANDS.md section 12): 33 BIO.fung (the
    # hyperjungle's brackets, read in place), 38 KFIRE (H3: the burn mosaic), 39 the lean toward the giant (H4: the e rim's cousins)
    CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31b-core-leafset.js', '31j-core-joint.js',
                  '32-core-variants.js', '33-core-fungoid.js', '34-core-impostor.js', '38-core-fire.js', '39-core-lean.js', '40-core-place.js',
                  '41-core-env.js', '42-core-export.js', '43-core-export-host.js', '44-core-stage.js']
    PATH = {f: os.path.join(RIM, f) for f in os.listdir(RIM) if not f.startswith('.')}
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'):
            PATH[f] = os.path.join(STN_DIR, f)
    for f in STN.get('core', []):
        if f not in CORE_BIOME:
            CORE_BIOME = CORE_BIOME + [f]
    for slot, p in STN.get('kits', {}).items():
        PATH[slot] = os.path.normpath(os.path.join(HERE, p))   # another fragment read in place
    for slot, p in STN.get('paths', {}).items():
        PATH.setdefault(slot, os.path.join(ROOT, p))   # a core fragment by path
    for f in CORE_TERRAIN:
        PATH.setdefault(f, core('terrain', f))
    PATH.setdefault('44-core-farfield-draw.js', core('terrain', 'host', '44-core-farfield-draw.js'))
    PATH.setdefault('45-core-horizon-shade.js', core('terrain', 'host', '45-core-horizon-shade.js'))
    # core/shadow (KSHADOW; the owner, 2026-11-03: toggleable, OFF by default: ?shadow=1 turns it on, src/rim/88-host-build.js)
    PATH.setdefault('10-core-shadow.js', core('shadow', '10-core-shadow.js'))
    PATH.setdefault('12-core-shadow-host.js', core('shadow', 'host', '12-core-shadow-host.js'))
    # core/hazard (KHAZ): the air's dust reaches the walker through it (src/rim/89a-host-atmos.js, the air's load)
    PATH.setdefault('20-core-hazard.js', core('hazard', '20-core-hazard.js'))
    # core/hazard runs on the one clock (KTRAPS.cycle): without it the export's hazards section errors (the GPU verify's export-profile,
    # 2026-11-09; crater-drylands' fix of 2026-11-08)
    PATH.setdefault('37-core-traps.js', core('biome', '37-core-traps.js'))
    for f in CORE_BIOME:
        PATH.setdefault(f, core('biome', f))
    # core/rand and core/tags: with BIO.init({tags}) every item set, instance and registered volume the kit places is a core/tags record
    for f, d in {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}.items():
        PATH.setdefault(f, core(d, f))
    # core/export: the krator-world container (EXPORT.world), filled by the biome core (42, 43) and the adapters
    for f in ['07-core-export.js', '09-core-export-adapters.js']:
        PATH.setdefault(f, core('export', f))
    PATH.setdefault('20-core-space.js', core('space', '20-core-space.js'))   # core/space (KSPACE)
    # the host shell from core/host: the whole interface and the authoring tools; src/rim/99-host-take.js hands it the page (KHOST.take)
    sys.path.insert(0, core('host'))
    import host as khost
    khost.resolve(PATH, khost.FULL + ['94-host-polytool.js'])
    # the shared atmosphere: its core, presets, export, the open-water wave field and the sky's light, bound once by src/rim/89a-host-atmos.js
    # (ATMOS.bindHost); the weather (4) and its selector (9); the particles (3) and the wind's dust (3d) the air's load reads
    for f in ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-3d-dust.js', '89-atmos-8-export.js',
              '89-atmos-a-waves.js', '89-atmos-b-skylight.js', '89-atmos-4-weather.js', '89-atmos-9-host.js']:
        PATH.setdefault(f, core('atmos', f))
    PATH['89-atmos-c-hostbind.js'] = core('atmos', 'host', '89-atmos-c-hostbind.js')   # ATMOS.bindHost
    # core/water: the seep as a WATER.still in src/rim/89w-host-water.js
    for f in ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']:
        PATH.setdefault(f, core('water', f))
    # the water ext (tools/fragment_needs.json has their order): breakup (56: the seep's glint), the audit (57), the shore's fields (60).
    # No reflections switch (58): the seep is 23 m across
    for f in ['56-core-water-breakup.js', '57-core-water-audit.js', '60-core-water-fields.js']:
        PATH.setdefault(f, core('water', 'ext', f))
    # the shared sky (core/atmos/SKY-PLAN.md section 9): its model, presets and shader, its host and the biome call (src/rim/89-host-sky.js)
    for f in ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js']:
        PATH[f] = core('atmos', 'sky', f)
    for f in ['89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js']:
        PATH[f] = core('atmos', 'host', f)
    # the final rebuild's air: the rain occlusion map (R10), lightning, the air's load
    for f in ['89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-airload.js']:
        PATH[f] = core('atmos', 'fx', f)
    # core/clock's flush (H7: the start of the rains, the rust miombo's copper; core/clock/opt), after the clock the host shell takes
    PATH.setdefault('21-core-clock-flush.js', core('clock', 'opt', '21-core-clock-flush.js'))
    miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js') if f not in PATH]
    if miss:
        print('NO BIOME CORE: ' + ', '.join(miss)); sys.exit(1)
    # the material library (core/materials/record) and the pack of the rims' families (RIM_PACK and groundDetail) under their kit's key
    for f in ('23-mat-record.js', '25-matlib-host.js'):
        PATH.setdefault(f, core('materials', 'record', f))
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack as _mp
    _pj = os.path.join(HERE, 'tex', 'pack.json')
    _fams = sorted(_json.load(open(_pj, encoding='utf-8')).get('families', {})) if os.path.isfile(_pj) else []
    VIRTUAL = {'44-host-matlib-pack.js': _mp.fragment(HERE, 'savannarim', exclude=[f for f in _fams if f not in RIM_PACK + ['groundDetail']]),
               khost.EDITS_JS: khost.edits_js(HERE, 'abyssal-savannah-rim')}   # the host's edit layer (core/host FULL)
    # THE NEIGHBOURS, read in place (PLAN-LANDS.md sections 1 and 4-5; nothing copied): each kit's fragments slotted after the host stage (45)
    # and before the rims' kit (50), in its own registry, closed by a one-line kitEnd, with a pack of only the families its builders draw here.
    # Every page: the hyperjungle (its globals 41, the six hypertrees for the gallery forest and the outliers, the lands' builders 54, 56 and
    # 57: the bone giants and the bloodwood, the comb tree and the elephant ear by reach). A station names more in its station.json "neigh"
    # (serim: sedesert and crater-drylands; erim: eastabyss and ehighlands)
    NEIGH_ALL = {'hyperjungle': (['50-biome-hyperjungle-species.js', '52-biome-hyperjungle-library.js', '54-biome-hyperjungle-lands.js',
                                  '55-biome-hyperjungle-trees.js', '56-biome-hyperjungle-savage.js', '57-biome-hyperjungle-north.js',
                                  '60-biome-hyperjungle-floor.js'], 'HYPERJUNGLE',
                                 ['bark0', 'bark1', 'bark2', 'bark3', 'bark4', 'bark5', 'leaf0', 'leaf1', 'leaf2', 'leaf3', 'leaf4', 'leaf5', 'limb',
                                  'raceme', 'under', 'under1', 'under2', 'under3', 'frond', 'hang', 'hang1', 'moss', 'bract', 'wood', 'bonewood', 'comb'])}
    NEIGH_KITS = {'eastabyss': (['50-biome-eastabyss-species.js', '55-biome-eastabyss-trees.js'], 'EASTABYSS',
                                ['bark0', 'bark1', 'bark2', 'bark3', 'bark4', 'bark5', 'cycfrond', 'frond', 'reed', 'clubmoss', 'strapfrond', 'seedfrond', 'bigfrond', 'under']),
                  'ehighlands': (['50-biome-ehigh-species.js', '55-biome-ehigh-trees.js'], 'EHIGH',
                                 ['bark.ragbark', 'leaf.broad', 'leaf.rag', 'skin.cushion', 'leaf.ichu', 'lichen']),
                  'sedesert': (['50-biome-sedesert-species.js', '55-biome-sedesert-trees.js'], 'SEDESERT',
                               ['bark0', 'bark1', 'bark2', 'bark3', 'bark4', 'aloe', 'bloom', 'column', 'needle', 'paddle', 'small', 'strap', 'pods']),
                  'crater-drylands': (['50-biome-craterdry-species.js', '55-biome-craterdry-trees.js'], 'CRATERDRY',
                                      ['bark.mallee', 'bark.gum', 'bark.pillar', 'leaf.frond', 'leaf.lance', 'leaf.small', 'leaf.twigs', 'leaf.bloom'])}
    NEIGH = dict(NEIGH_ALL)
    NEIGH.update({k: NEIGH_KITS[k] for k in STN.get('neigh', [])})
    ORDER = ['hyperjungle'] + sorted(k for k in NEIGH if k not in NEIGH_ALL)
    PATH['41-hyperjungle-globals.js'] = os.path.join(ROOT, 'biomes', 'hyperjungle', 'src', '41-hyperjungle-globals.js')   # the core's helpers as globals
    for _i, _k in enumerate(ORDER):
        _fs, _api, _keep = NEIGH[_k]; _d = os.path.join(ROOT, 'biomes', _k); _c = 'abcdefgh'[_i]
        for _j, _f in enumerate(_fs):
            PATH['47%s%d-%s' % (_c, _j, _f)] = os.path.join(_d, 'src', _f)
        VIRTUAL['47%s9-%s-end.js' % (_c, _k)] = chr(10) + 'BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)' % _api + chr(10)
        _npj = os.path.join(_d, 'tex', 'pack.json')
        _ex = [f for f in (sorted(_json.load(open(_npj, encoding='utf-8')).get('families', {})) if os.path.isfile(_npj) else []) if f not in _keep]
        VIRTUAL['44%s-host-matlib-pack-%s.js' % (_c, _k)] = _mp.fragment(_d, _k, exclude=_ex, own=(_k == 'hyperjungle'))
    for f in VIRTUAL:
        PATH[f] = None
    frags = sorted(PATH)
    out = []; bad = []
    for f in frags:
        if PATH[f] is None:
            s = VIRTUAL[f]
        else:
            with open(PATH[f], encoding='utf-8') as fh:
                s = fh.read()
        n = int(re.match(r'(\d+)', f).group(1))
        if 10 <= n < 80 and '-host-' not in f:
            for w in FORBID:
                if w in s:
                    bad.append(f'{f}: uses {w}')
        out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
    if bad:
        print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad)); sys.exit(1)
    BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
    return OUT, frags, ''.join(out)


STATION = sys.argv[sys.argv.index('--station') + 1] if '--station' in sys.argv else None
OUT = next((a for a in sys.argv[1:] if not a.startswith('--') and a != STATION), 'abyssal-savannah.html')
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
core = lambda *p: os.path.normpath(os.path.join(ROOT, 'core', *p))


def write_page(OUT, frags, html):
    """Write dist/<OUT>, check its script's syntax, name the open known issues; exits with the check's code."""
    os.makedirs(DIST, exist_ok=True)
    with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
    js = m.group(1) if m else ''
    chk = os.path.join(HERE, '.syntax.js')
    with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    node = find_node()
    r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
    print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  ' + ('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        with open(ki, encoding='utf-8') as fh:
            op = [l for l in fh if l.startswith('- [ ]')]
        if op:
            print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
    sys.exit(r.returncode if r else 0)


if STATION:
    write_page(*build_station(STATION))
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.') and os.path.isfile(os.path.join(SRC, f))}   # src/rim/ is the stations' (build_station)
# the biome core from core/biome (core/README.md): one copy for every kit
# The final rebuild (pair 8, 2026-11-03; PLAN.md "Core adoption"): 31j a limb's joint to its parent (BIO.flareJoin), 33 the fungoid parts, 34 the
# octahedral impostors (the far trees), 35 the motion modes, 39 the lean, 41 the environmental fields (BIO.env)
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js',
              '34-core-impostor.js', '35-core-anim.js', '39-core-lean.js', '40-core-place.js', '41-core-env.js',
              '42-core-export.js', '43-core-export-host.js', '44-core-stage.js']
for f in CORE_BIOME:
    PATH.setdefault(f, core('biome', f))
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume is a record.
# KRAND seeds every placement cell (PLAN.md section 11).
CORE_TAGS = {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}
for f, d in CORE_TAGS.items():
    PATH.setdefault(f, core(d, f))
# core/export: the krator-world container (EXPORT.world), filled by the biome core (42, 43) and the adapters
CORE_EXPORT = ['07-core-export.js', '09-core-export-adapters.js']
for f in CORE_EXPORT:
    PATH.setdefault(f, core('export', f))
# core/space (KSPACE): the keep-clear between the trees and the kopjes, and the core's own obstacle index
CORE_SPACE = ['20-core-space.js']
for f in CORE_SPACE:
    PATH.setdefault(f, core('space', f))
# core/terrain, opt-in by name (the final rebuild, BACKPORT.md's universal set): 35 KSTRATA (the caprock's beds, coloured on the ground's rim faces
# on the CPU: no texture unit), 43 KGROUND (the library's ground layers on documented masks), 44 KFAR (the country past the map), 45 KHORIZON
CORE_TERRAIN = ['35-core-strata.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, core('terrain', f))
PATH.setdefault('44-core-farfield-draw.js', core('terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', core('terrain', 'host', '45-core-horizon-shade.js'))
# core/shadow (KSHADOW; the owner, 2026-11-03): the sun's shadows in one view-following box; the data half before the host's. ?shadow=0 off
PATH.setdefault('10-core-shadow.js', core('shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', core('shadow', 'host', '12-core-shadow-host.js'))
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page). The jungle at the foot of the slope and up the gullies is
# the eastern abyss's: its species and its tree builders (EASTABYSS.make / grow, one tree alone), slotted after the host stage
# (45) and before this kit (50), in its own registry. 47c closes its registry (BIO.kitEnd), which its fauna fragment does on its own page.
EA = os.path.normpath(os.path.join(HERE, '..', 'eastabyss'))
KITS = {'47a-ea-species.js': 'src/50-biome-eastabyss-species.js', '47b-ea-trees.js': 'src/55-biome-eastabyss-trees.js'}
for slot, p in KITS.items():
    PATH[slot] = os.path.join(EA, p)
# the host shell (core/host/README.md): camera, frame loop and clock (core/clock), panel, probe; the authoring tools (inspect,
# polygon, path: README.md "DEV TOOLS"). src/99-host-take.js hands it the page (KHOST.take).
sys.path.insert(0, core('host'))
import host as khost
CORE_HOST = khost.FULL + ['94-host-polytool.js']   # the whole interface (the final rebuild: the edit requests' marks, the inspector)
khost.resolve(PATH, CORE_HOST)
# the material library (core/materials/record: KMAT and the loader) and the GENERATED packs of the textures each kit's
# materials.json names (tools/textures/matlib_pack.py from tex/, written by tools/textures/pack.py). Without tex/pack.json a
# pack is empty and its kit keeps its procedural textures. The eastern abyss's pack goes with its fragments (its own 'own'
# families stay out: they belong to its page's 52-library fragment).
for f in ('23-mat-record.js', '25-matlib-host.js'):
    PATH.setdefault(f, core('materials', 'record', f))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack
VIRTUAL = {'44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'abyssal-savannah', exclude=RIM_PACK, own=True),   # the rims' families are the stations'
           '44b-host-matlib-pack-eastabyss.js': matlib_pack.fragment(EA, 'eastabyss'),
           khost.EDITS_JS: khost.edits_js(HERE, 'abyssal-savannah')}
for f in VIRTUAL:
    PATH[f] = None
# core/atmos (core/atmos/README.md): its core, presets, export, the wave field and the sky's light, bound by 89a-host-atmos.js
CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-4-weather.js', '89-atmos-8-export.js', '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js']   # 4, 9: the weather and its selector (2026-10-26); 3 the particles (the rain)
for f in CORE_ATMOS:
    PATH.setdefault(f, core('atmos', f))
PATH['89-atmos-c-hostbind.js'] = core('atmos', 'host', '89-atmos-c-hostbind.js')   # ATMOS.bindHost
PATH['89-atmos-e-weatherhost.js'] = core('atmos', 'host', '89-atmos-e-weatherhost.js')   # ATMOS.bindWeather (src/89a-host-atmos.js, 2026-10-26)
# the shared sky (core/atmos/SKY-PLAN.md): its model, presets and shader, and the host that draws it (src/89s-host-sky.js)
for f in ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js']:
    PATH[f] = core('atmos', 'sky', f)
PATH['89-atmos-h-skyhost.js'] = core('atmos', 'host', '89-atmos-h-skyhost.js')
# the final rebuild's air (BACKPORT.md's universal set, "Sky and air"): height fog, the sky bound to the biome, the rain cover, lightning
PATH['89-atmos-j-fog.js'] = core('atmos', 'sky', '89-atmos-j-fog.js')
for f in ['89-atmos-i-skybiome.js', '89-atmos-j-heightfog.js']:
    PATH[f] = core('atmos', 'host', f)
for f in ['89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js']:
    PATH[f] = core('atmos', 'fx', f)
# core/water (core/water/README.md): the gully stream as WATER.flow, its pools and the pan as WATER.still (89w-host-water.js)
CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']
for f in CORE_WATER:
    PATH.setdefault(f, core('water', f))
# the final rebuild's water ext (tools/fragment_needs.json declares their order): breakup (56: the stream), the audit (57), the reflections switch (58,
# off at load), the water as fields (60: the shore the flora and the wet band read)
for f in ['56-core-water-breakup.js', '57-core-water-audit.js', '58-core-water-mirror.js', '60-core-water-fields.js']:
    PATH.setdefault(f, core('water', 'ext', f))
miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js') if f not in PATH]
if miss:
    print('NO BIOME CORE: ' + ', '.join(miss)); sys.exit(1)
frags = sorted(PATH)
out = []; bad = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
    n = int(re.match(r'(\d+)', f).group(1))
    own = PATH[f] is not None and os.path.dirname(PATH[f]) == SRC
    if 10 <= n < 80 and '-host-' not in f and own:   # this kit's own fragments (core/ and the kits read in place are scanned by their own builds)
        for w in FORBID:
            if w in s:
                bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad:
    print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
write_page(OUT, frags, ''.join(out))
