#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the NE outer wall, the Glass-Skarn Bastion (PLAN.md). Forked from
biomes/wouterwall's station 1 (origin/claude/cloud-kits-verify), itself forked from biomes/nwouterwall's.

Stations, as the NW outer wall's: each is its own showcase page from the same kit, on the scale model.
  python3 build.py                     station 1, VITREOUS HOLLOW: src/ as it is -> dist/neouterwall.html
  python3 build.py --station <name>    a later station (PLAN.md section 7: Garnet-Mirror, the Epidote Badlands, the Gate Shoulder, the
                                       Epidote-Steam Tarn): stations/<name>/'s fragments replace src/'s of the same name; its station.json
                                       names the page ("out") and its cut ("name")
  python3 build.py --station cave      station 5b, THE EPIDOTE CAVE (the Marble Hall): a cave page, its own frame (build_cave.py, stations/cave/)
  python3 build.py --all               every station
  --inline-packs                       the texture packs inside the page (one self-contained file) instead of a sidecar

  00-head.html        page shell, opens <script>
  07..44              core/export, core/rand, the BIOME CORE (core/biome), core/space, core/tags, core/terrain (KFIELD; KSTRATA's
                      megabreccia on the walls; KSTACKS: the dikes; KRELIEF.talus; KGROUND, KHORIZON), the material library, this kit's
                      pack and the NW outer wall's
  44n-host-region     GENERATED: the station's cut of the scale model (region/station-<name>.json, written by region/far.py)
  44s-host-site       HOST: the station's site: the spring apron, the dikes, the talus, the springs, the sinter stair
  45-host-stage       HOST: the station (its site on the model), the season, renderer, light, the ground's height
  46-biome-neow-layout THE KIT's fields and zones (data): the climate, the springs' heat bands, the zones
  46n-nwow-layout     biomes/nwouterwall's layout, READ IN PLACE (its passes ask NWOW for the fields and the zone: 47 binds them)
  47-core-therm       core/terrain KTHERM: the ground's temperature between the springs
  47-host-land        HOST: the springs' heat, terrainH, the fields, BIO.init, the ground (near and mid), the dikes, the water records
  48a..48d            biomes/nwouterwall's species, trees, floor and build, READ IN PLACE (PLAN.md section 4: its conifers, its floor)
  50-biome-neow-cauldron THE KIT (NEOW): the cauldron's own: the steam tree fern, the warm-shore reed
  70-biome-neow       THE KIT (NEOW): build
  89-atmos-*          core/atmos: core, presets, weather and its selector, export, waves, skylight, the shared sky, snow that lies
  89a-host-atmos      HOST: ATMOS.bindHost, the weather, the snow (bare over the springs' ground: KTHERM's mask)
  89s-host-sky        HOST: the shared sky at the station's pixel, its far land cast from the model (region/far.py)
  89w-host-water      HOST: the tarn (WATER.open), the springs (core/water/geyser), the sinter stair (WATER.terraces)
  89z-host-build      HOST: the build order (after the water), the impostors' bake, then the air on everything
  90..99              HOST (core/host's whole interface; core/edits, core/minimap)
  99-host-take        the page handed to core/host
  99-tail.html        closes <script>

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); build.py greps the kit's own
fragments (and the ones it reads in place) for the forbidden names so a kit fragment cannot quietly grow a dependency on one
world's engine.
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

HERE=os.path.dirname(os.path.abspath(__file__)); SRC=os.path.join(HERE,'src'); DIST=os.path.join(HERE,'dist')
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
sys.path.insert(0,os.path.join(ROOT,'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
os.makedirs(os.path.join(HERE,'stations'),exist_ok=True)
BSRC.variants([['--station',_s] for _s in sorted(os.listdir(os.path.join(HERE,'stations'))) if os.path.isfile(os.path.join(HERE,'stations',_s,'station.json'))])   # every station's page
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
if '--all' in sys.argv:
    rest=[a for a in sys.argv[1:] if a!='--all']
    rc=0
    for st in [None]+sorted(d for d in os.listdir(os.path.join(HERE,'stations')) if os.path.isfile(os.path.join(HERE,'stations',d,'station.json'))):
        rc|=subprocess.call([sys.executable,os.path.abspath(__file__)]+rest+(['--station',st] if st else []))
    sys.exit(rc)
STN={'name':'vitreous','out':'neouterwall.html'};STN_DIR=None
if '--station' in sys.argv:
    STN_DIR=os.path.join(HERE,'stations',sys.argv[sys.argv.index('--station')+1])
    STN=json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf-8'))
# A CAVE STATION (stations/cave: "frame": "cave"): not this heightfield frame; build_cave.py assembles the cave page from that folder, and exits
if STN.get('frame')=='cave':
    import runpy
    runpy.run_path(os.path.join(HERE,'build_cave.py'),run_name='__main__')
    sys.exit(0)
OUT=STN['out']
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STN_DIR:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(STN_DIR,f)
# core/terrain: KFIELD (the baked ground the export carries), KSTRATA and its shader (35: the `megabreccia` recipe's blocks on the walls,
# the impact rim's host rock; the skarn's banded recipe is PLAN.md's amendment 1), KSTACKS (37: the dikes, fins in rows along their
# strike), KRELIEF (38: the talus against the fins' feet), KGROUND (the ground's library layers hex-tiled and height-blended, with triplanar
# sides on the walls), KHORIZON (the terrain's shadows at a low sun) with its shade, KTHERM (47: the ground's temperature between the
# springs: the zones, the colour, the snow), KCARVE (36: the Epidote Cave's mouths at stations 5 and 5a). Not taken: KFROST and KGLACIER (the rim's
# ice is off the page: the far land carries it). 38c, the landform kinds: station 3's badland gullies (KRELIEF.gully, `liang` tops)
CORE_TERRAIN=['30-core-field.js','35-core-strata.js','36-core-carve.js','37-core-stacks.js','38-core-relief.js','38c-core-landforms.js','43-core-ground.js','45-core-horizon.js','47-core-therm.js']
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=J('core','terrain',f)
PATH.setdefault('45-core-horizon-shade.js',J('core','terrain','host','45-core-horizon-shade.js'))
PATH.setdefault('35z-core-strata-shade.js',J('core','terrain','host','35-core-strata-shade.js'))   # KSTRATA.shade: the breccia's blocks on the walls (47); slotted after 35-core-strata.js, which it reads
# the biome core from core/biome (core/README.md): one copy for every kit, as the NW outer wall takes it (31j the limbs' joints, 34 the
# impostors, 41 the environmental fields, 44 KSTAGE); 31b the leafset, which 20's opt-in leaf path names (check_assembly: no missing names)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','34-core-impostor.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=J('core','biome',f)
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume the kit
# places is a core/tags record (core/biome/20-core-kit.js)
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items():
    if f not in PATH: PATH[f]=J('core',d,f)
# core/export (core/export/README.md): the krator-world container (EXPORT.world); the biome core fills it
CORE_EXPORT=['07-core-export.js','09-core-export-adapters.js']
for f in CORE_EXPORT:
    if f not in PATH: PATH[f]=J('core','export',f)
# core/space (KSPACE: keep-clear between trees, the obstacle index)
CORE_SPACE=['20-core-space.js']
for f in CORE_SPACE:
    if f not in PATH: PATH[f]=J('core','space',f)
# THE NW OUTER WALL'S FLORA, read in place (PLAN.md section 4; biomes/WORLD.md: several kits on one page, as geyser reads the hyperjungle):
# its layout before the host's land (47 binds NWOW to this page's fields), its species, trees, floor and build after it (they need
# BIO.init), each under a slot of this page's order; nothing copied. Its texture pack goes beside this kit's (below)
NW=J('biomes','nwouterwall')
NW_KIT={'46n-nwow-layout.js':'src/46-biome-nwow-layout.js','48a-nwow-species.js':'src/50-biome-nwow-species.js','48b-nwow-trees.js':'src/55-biome-nwow-trees.js',
        '48c-nwow-floor.js':'src/60-biome-nwow-floor.js','48d-nwow-build.js':'src/70-biome-nwow.js'}
for slot,p in NW_KIT.items(): PATH.setdefault(slot,os.path.join(NW,p))
# a station's other kits read in place (station.json "kits": {slot: path from this folder})
for slot,p in STN.get('kits',{}).items(): PATH[slot]=os.path.normpath(os.path.join(HERE,p))
# core/water (core/water/README.md): the tarn a WATER.open (no surf, no breakers), the springs WATER.spring (the geyser subfolder, 52 and its
# drawing 52b), the sinter stair WATER.terraces (ext 53 and its drawing 53b)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=J('core','water',f)
for f in ['52-core-water-geyser.js','52b-core-water-geyser-draw.js']: PATH.setdefault(f,J('core','water','geyser',f))
# the water ext, by path (tools/fragment_needs.json): the terraces (53, 53b), the audit (57), the shore's fields (60). Not breakup (56: no
# flowing stream) nor the reflections switch (58: KNOWN_ISSUES.md)
for f in ['53-core-water-terraces.js','53b-core-water-terraces-draw.js','57-core-water-audit.js','60-core-water-fields.js']: PATH.setdefault(f,J('core','water','ext',f))
# core/shadow (KSHADOW; the owner, 2026-11-03: toggleable and OFF by default; ?shadow=1 turns it on, src/89z-host-build.js)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# core/atmos: the core, presets, the weather (4) and its selector (9), the export, the waves, the skylight; ATMOS.bindHost and
# ATMOS.bindWeather (core/atmos/host); the shared sky (core/atmos/sky, SKY-PLAN.md S1) and its host; snow that lies (core/atmos/fx)
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-4-weather.js','89-atmos-8-export.js','89-atmos-9-host.js','89-atmos-a-waves.js','89-atmos-b-skylight.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=J('core','atmos',f)
for f in ['89-atmos-c-hostbind.js','89-atmos-e-weatherhost.js','89-atmos-h-skyhost.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js']: PATH[f]=J('core','atmos','sky',f)
PATH['89-atmos-fx-snowcover.js']=J('core','atmos','fx','89-atmos-fx-snowcover.js')
# the final rebuild's air (BACKPORT.md's universal set, "Sky and air"): height fog (R1: the sky's fog chunk and its host), the rain occlusion map (R10), lightning
PATH['89-atmos-j-fog.js']=J('core','atmos','sky','89-atmos-j-fog.js')
PATH['89-atmos-j-heightfog.js']=J('core','atmos','host','89-atmos-j-heightfog.js')
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']: PATH[f]=J('core','atmos','fx',f)
# the host shell from core/host (core/host/README.md), the whole interface. src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL
khost.resolve(PATH,CORE_HOST)
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record): the record and its browser half, and this kit's pack (tex/, from materials.json
# by tools/textures/pack.py) and the NW outer wall's (its flora's cards and barks, read in place) as a SIDECAR beside the page
# (dist/neouterwall.tex.js, shared by every station)
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
for f in CORE_MAT:
    if f not in PATH: PATH[f]=J('core','materials','record',f)
sys.path.insert(0,J('tools','textures'))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
# THE STATION'S CUT OF THE SCALE MODEL (region/station-<name>.json, written by region/far.py from extract_region.py's cut): its
# site, the model's heights round it, its far land for the sky. Plain data, named -host- (the FORBID scan skips it)
REGION=json.load(open(os.path.join(HERE,'region','station-%s.json'%STN['name']),encoding='utf-8'))
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'neouterwall',side=SIDE),
         '44m-host-matlib-pack-nwow.js':_mp.fragment(NW,'nwouterwall',side=SIDE),
         '44n-host-region.js':'// the station on the scale model (region/far.py; generated: rerun it, do not edit)\nconst NEOW_REGION='+json.dumps(REGION,separators=(',',':'))+';\n',
         khost.EDITS_JS:khost.edits_js(HERE,'neouterwall')}   # the page's edits (edits.json or this browser's draft)
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf-8').read()
    if '-neow-' in f or '-nwow-' in f:   # the kit's own fragments, and the ones it reads in place
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH,[os.path.join(HERE,'region','station-%s.json'%STN['name']),os.path.join(NW,'materials.json')])   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'neouterwall.tex.js',prune=False)
open(os.path.join(DIST,OUT),'w',encoding='utf-8',newline='\n').write(html)
# syntax check on the script body
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html,re.S)
js=m.group(1) if m else ''
chk=os.path.join(HERE,'.syntax.js'); open(chk,'w',encoding='utf-8',newline='\n').write(js)
node=find_node()
r=subprocess.run([node,'--check',chk],capture_output=True,text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  '+('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode==0 else 'SYNTAX ERROR\n'+r.stderr[:800]))
ki=os.path.join(HERE,'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op=[l for l in open(ki,encoding='utf-8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
