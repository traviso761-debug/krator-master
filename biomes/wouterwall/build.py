#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the W outer wall, the loess bench (PLAN.md). Forked from biomes/nwouterwall's.

Stations, as the NW outer wall's: each is its own showcase page from the same kit, on the scale model.
  python3 build.py                     station 1, THE LOESS TABLELANDS: src/ as it is -> dist/wouterwall.html
  python3 build.py --station <name>    a later station (PLAN.md section 7: slumps, sturzstrom, edge): stations/<name>/'s fragments
                                       replace src/'s of the same name; its station.json names the page ("out") and its cut ("name")
  python3 build.py --all               every station
  --inline-packs                       the texture packs inside the page (one self-contained file) instead of a sidecar

  00-head.html        page shell, opens <script>
  07..44              core/export, core/rand, the BIOME CORE (core/biome), core/space, core/tags, core/terrain (KFIELD; KSTACKS: the
                      earth pillars; KGROUND, KHORIZON), the material library, this kit's pack and the NW outer wall's
  44n-host-region     GENERATED: the station's cut of the scale model (region/station-<name>.json, written by region/far.py)
  44s-host-site       HOST: the station's site: the gullies, the yuan, the knolls, the terraces, the pillars, the brook
  45-host-stage       HOST: the station (its site on the model), the season, renderer, light, the ground's height
  46-biome-wow-layout THE KIT's fields and zones (data): the bench's bands, the climate, the spring line, the zones
  46n-nwow-layout     biomes/nwouterwall's layout, READ IN PLACE (its passes ask NWOW for the fields and the zone: 47 binds them)
  47-host-land        HOST: terrainH, the fields, BIO.init, the ground (near and mid), the pillars, the water records
  48a..48d            biomes/nwouterwall's species, trees, floor and build, READ IN PLACE (PLAN.md section 3: its larch, its steppe)
  70-biome-wow        THE KIT (WOW): build
  89-atmos-*          core/atmos: core, presets, weather and its selector, export, waves, skylight, the shared sky, snow that lies
  89a-host-atmos      HOST: ATMOS.bindHost, the weather, the snow
  89s-host-sky        HOST: the shared sky at the station's pixel, its far land cast from the model (region/far.py)
  89w-host-water      HOST: the brook (and a station's still water) on core/water
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
STN={'name':'tablelands','out':'wouterwall.html'};STN_DIR=None
if '--station' in sys.argv:
    STN_DIR=os.path.join(HERE,'stations',sys.argv[sys.argv.index('--station')+1])
    STN=json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf-8'))
OUT=STN['out']
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STN_DIR:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(STN_DIR,f)
# core/terrain: KFIELD (the baked ground the export carries), KSTACKS (the earth pillars: 'balanced', a column under its cap), KRELIEF and its
# landforms (38, 38c: the station's gullies with their yuan and mao tops, and the terraces; PLAN.md section 2's table), KCARVE (36: the cave
# houses' mouths, alcoves in the gully wall), KSTRATA and its shader (35: the `loess` recipe's beds on the walls), KGROUND (the
# ground's library layers hex-tiled and height-blended, with triplanar sides on the loess walls), KHORIZON (the terrain's shadows at a low
# sun) with its shade. KFROST is taken by a station that asks (station.json "frost": station 3; station 1 lies at +7 °C, far under the permafrost: PLAN.md section 4)
CORE_TERRAIN=['30-core-field.js','35-core-strata.js','36-core-carve.js','37-core-stacks.js','38-core-relief.js','38c-core-landforms.js','43-core-ground.js','45-core-horizon.js']
# KFROST (42) on a station that asks for it (SITE.frost: station 3's solifluction lobes on the permafrost's edge); the others leave it out
if STN.get('frost'): CORE_TERRAIN.append('42-core-frost.js')
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=J('core','terrain',f)
PATH.setdefault('45-core-horizon-shade.js',J('core','terrain','host','45-core-horizon-shade.js'))
PATH.setdefault('35z-core-strata-shade.js',J('core','terrain','host','35-core-strata-shade.js'))   # KSTRATA.shade: the loess's beds on the walls (47); slotted after 35-core-strata.js, which it reads
# the biome core from core/biome (core/README.md): one copy for every kit, as the NW outer wall takes it (31j the limbs' joints, 34 the
# impostors, 41 the environmental fields, 44 KSTAGE)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','32-core-variants.js','34-core-impostor.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']   # 31b: BIO.leafOn (20 calls it; the lowland kits' trees use it); 32: BIO.kin (the lowlands' species on the bench, 88k)
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
# THE NW OUTER WALL'S FLORA, read in place (PLAN.md section 3; biomes/WORLD.md: several kits on one page, as geyser reads the hyperjungle):
# its layout before the host's land (47 binds NWOW to this page's fields), its species, trees, floor and build after it (they need
# BIO.init), each under a slot of this page's order; nothing copied. Its texture pack goes beside this kit's (below)
NW=J('biomes','nwouterwall')
NW_KIT={'46n-nwow-layout.js':'src/46-biome-nwow-layout.js','48a-nwow-species.js':'src/50-biome-nwow-species.js','48b-nwow-trees.js':'src/55-biome-nwow-trees.js',
        '48c-nwow-floor.js':'src/60-biome-nwow-floor.js','48d-nwow-build.js':'src/70-biome-nwow.js'}
for slot,p in NW_KIT.items(): PATH.setdefault(slot,os.path.join(NW,p))
# THE LOWLANDS' SPECIES, read in place by key (PLAN.md section 4: the bench takes a few of each lowland kit's, blue-grey in the north over the
# NW lowlands, red in the south over the SW lowlands; src/88k-host-lowlands.js grows them by BIO.kitBuilder, never the source kit's build).
# A station names the kits it reads (station.json "lowlands"; station 1 the north's): each kit's species and tree builders after the NW outer
# wall's (48a-48d, which need BIO.init) and before this kit's own (50), each in its own registry closed by a one-line kitEnd, its pack carrying
# only the families those species draw with (as nwlowlands reads its neighbours)
import json as _json
LOWLANDS={'nwlowlands':(['50-biome-nwlowlands-species.js','55-biome-nwlowlands-trees.js'],'NWLOW',['bk.plate','bk.fibre','bk.birch','needle','broad','feather','wood']),
          'swlowlands':(['50-biome-swlowlands-species.js','55-biome-swlowlands-trees.js'],'SWLOW',['bk.furrow','bk.ember','needle','broad','glossy','lance','wood'])}
LOW_PACKS={}
for _i,_k in enumerate(sorted(STN.get('lowlands',['nwlowlands']))):
    _fs,_api,_keep=LOWLANDS[_k];_d=J('biomes',_k);_c='efgh'[_i]
    for _j,_f in enumerate(_fs): PATH.setdefault('48%s%d-%s'%(_c,_j,_f),os.path.join(_d,'src',_f))
    PATH['48%s9-%s-end.js'%(_c,_k)]=None;LOW_PACKS['48%s9-%s-end.js'%(_c,_k)]=chr(10)+'BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)'%_api+chr(10)
    _pj=os.path.join(_d,'tex','pack.json')
    _ex=[f for f in (sorted(_json.load(open(_pj,encoding='utf-8')).get('families',{})) if os.path.isfile(_pj) else []) if f not in _keep]
    LOW_PACKS['44%s-host-matlib-pack-%s.js'%(_c,_k)]=(_d,_k,_ex);PATH['44%s-host-matlib-pack-%s.js'%(_c,_k)]=None
# kits/crops, read in place (kits/crops/API.md, "Reading it from a build"; as nwouterwall reads it): the Hayrant's terrace crops (the wouterwall
# records and biome entry, 2026-11-10), on a station with terraced fields (station.json "crops"; station 1 by default): 88c picks each field's
# crop from it, 50 names the items after it
if STN.get('crops',STN['name']=='tablelands'):
    for f in ('10-crop-core.js','20-crop-records.js','22-crop-material.js','40-crop-query.js'):
        PATH.setdefault('48'+f[:2]+'-'+f[3:],J('kits','crops','src',f))
# a station's other kits read in place (station.json "kits": {slot: path from this folder})
for slot,p in STN.get('kits',{}).items(): PATH[slot]=os.path.normpath(os.path.join(HERE,p))
# core/water (core/water/README.md): the spring brook a WATER.flow, a station's still water a WATER.still
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=J('core','water',f)
# the water ext, by path (tools/fragment_needs.json): breakup (56: the brook's glint), the audit (57), the shore's fields (60). Not the reflections
# switch (58): station 1 has no still water for it
for f in ['56-core-water-breakup.js','57-core-water-audit.js','60-core-water-fields.js']: PATH.setdefault(f,J('core','water','ext',f))
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
# (dist/wouterwall.tex.js, shared by every station)
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
for f in CORE_MAT:
    if f not in PATH: PATH[f]=J('core','materials','record',f)
sys.path.insert(0,J('tools','textures'))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
# THE STATION'S CUT OF THE SCALE MODEL (region/station-<name>.json, written by region/far.py from extract_region.py's cut): its
# site, the model's heights round it, its far land for the sky. Plain data, named -host- (the FORBID scan skips it)
REGION=json.load(open(os.path.join(HERE,'region','station-%s.json'%STN['name']),encoding='utf-8'))
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'wouterwall',side=SIDE),
         '44m-host-matlib-pack-nwow.js':_mp.fragment(NW,'nwouterwall',side=SIDE),
         '44n-host-region.js':'// the station on the scale model (region/far.py; generated: rerun it, do not edit)\nconst WOW_REGION='+json.dumps(REGION,separators=(',',':'))+';\n',
         khost.EDITS_JS:khost.edits_js(HERE,'wouterwall')}   # the page's edits (edits.json or this browser's draft)
for _f,_v in LOW_PACKS.items(): VIRTUAL[_f]=_v if isinstance(_v,str) else _mp.fragment(_v[0],_v[1],side=SIDE,exclude=_v[2])
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf-8').read()
    if '-wow-' in f or '-nwow-' in f:   # the kit's own fragments, and the ones it reads in place
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH,[os.path.join(HERE,'region','station-%s.json'%STN['name']),os.path.join(NW,'materials.json')])   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'wouterwall.tex.js',prune=False)
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
