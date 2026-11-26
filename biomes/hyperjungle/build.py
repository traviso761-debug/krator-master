#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (hyperjungle species, trees, fauna, understorey, dressing)
  45-host-stage     HOST binding (renderer, terrain, BIO.init) -- must run before 50
  80..98            HOST (sky, tower, build); 90-95 the host shell from core/host (CORE_HOST)
  99-host-take      the page handed to the shell: views, inspector words, probe checks (KHOST.take)
  99-tail.html      closes <script>

The core and the biome leaf never reference a host global except through
BIO.host (see BIOME-API.md); build.py greps for the forbidden names so a
biome fragment cannot quietly grow a dependency on one world's engine.
"""
import os, re, subprocess, sys

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
sys.path.insert(0,os.path.join(os.path.dirname(os.path.dirname(HERE)),'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
# THE STATIONS (PLAN-STATIONS.md, 2026-10-27, the final rebuild): `python3 build.py --station <name>` builds
# dist/hyperjungle-<name>.html from src/ with the station's own fragments (stations/<name>/*) in place of src/'s of the same
# name: `savanna` (the savanna edge) and `lake` (the lake and the flooded forest), built 2026-10-27; `savage` (PLAN-LANDS.md section 9's
# station 2, the savage hyperjungle: J2, 2026-11-08) and `north` (its station 3, Screamer wood: J3)
_args=[a for a in sys.argv[1:] if a!='--no-checks']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('hyperjungle-%s.html'%STATION if STATION else 'hyperjungle.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# shared fragments from core/terrain, opt-in by name (core/README.md): '36-core-carve.js' gives
# BIO.carve, overhangs on the heightfield. A local src/ copy with the same name wins.
# 2026-10-27, the final rebuild: KGROUND (the ground's layers), KFAR (the forest's far country: src/83-host-far.js), KHORIZON
# (its shadows); the savanna station adds KSTACKS (the termite cathedrals, STATION_CORE below)
CORE_TERRAIN=['43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome, the same way (core/README.md): one copy for every kit.
# A kit that lists nothing keeps its own src/ copies and builds as before.
# 33 BIO.fung (the brackets and caps), 34 the octahedral impostors, 38 KFIRE (the savanna's burn mosaic) (2026-10-27)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js','35-core-anim.js','36-core-walker.js','38-core-fire.js','40-core-place.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    _sd=os.path.join(HERE,'stations',STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
# what a station takes beyond the page's core (by path from the repo root, keyed by the fragment name it loads under)
# the lands (J2-J3, 2026-11-08): core/biome's leafset (31b: BIO.clumpOn's held cards), its traps (37: the savage land's sky pitcher, carrion
# arum and snare liana) and bamboo (33b, H5: the north's howl bamboo), core/tags' sound record (H9: the howl bamboo's groves), and the fauna by land (kits/fauna's fauna-lands.js and its host
# half, H8; the bundle below)
STATION_CORE={'savanna':{'37-core-stacks.js':'core/terrain/37-core-stacks.js'},
              'savage':{'31b-core-leafset.js':'core/biome/31b-core-leafset.js','37-core-traps.js':'core/biome/37-core-traps.js','86g-fauna-lands.js':'kits/fauna/fauna-lands.js','86h-fauna-lands-host.js':'kits/fauna/fauna-lands-host.js'},
              'north':{'31b-core-leafset.js':'core/biome/31b-core-leafset.js','33b-core-bamboo.js':'core/biome/33b-core-bamboo.js','54-core-tags-sound.js':'core/tags/opt/54-core-tags-sound.js','86g-fauna-lands.js':'kits/fauna/fauna-lands.js','86h-fauna-lands-host.js':'kits/fauna/fauna-lands-host.js'},
              'lake':{'55-core-water-confluence.js':'core/water/ext/55-core-water-confluence.js','55b-core-water-confluence-draw.js':'core/water/ext/55b-core-water-confluence-draw.js'}}
for f,p in STATION_CORE.get(STATION,{}).items():
    PATH.setdefault(f,os.path.normpath(os.path.join(HERE,'..','..',p)))
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
PATH.setdefault('44-core-farfield-draw.js',os.path.join(CORE_T,'host','44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js',os.path.join(CORE_T,'host','45-core-horizon-shade.js'))
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE_B,f)
# core/rand and core/tags (core/tags/README.md), the way the core/furnish builds take them: with BIO.init({tags}) every item
# set, instance and registered volume the kit places is a core/tags record (core/biome/20-core-kit.js). A src/ copy wins.
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items():
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core',d,f))
# core/export (core/export/README.md): the krator-world container (EXPORT.world); the biome core fills its items, buckets,
# materials, textures and terrain (42-core-export.js), 43 its stage, the adapters its registry. A src/ copy wins.
CORE_EXPORT=['07-core-export.js','09-core-export-adapters.js']
for f in CORE_EXPORT:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','export',f))
for f in CORE_SPACE:
    if f not in PATH: PATH[f]=os.path.join(CORE_S,f)
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock (core/clock), the panel and
# the probe. src/99-host-take.js hands it the page (KHOST.take). A local src/ copy with the same name wins (KNOWN_ISSUES.md).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','core','host')))
import host as khost
CORE_HOST=khost.SHELL
khost.resolve(PATH,CORE_HOST)
# the material library (core/materials/record: KMAT and the loader) and the GENERATED pack of the textures materials.json
# names (tools/textures/matlib_pack.py from tex/, written by tools/textures/pack.py). Without tex/pack.json the pack is
# empty and the kit keeps its procedural textures (as it does in the open world, which carries no pack).
for f in ('23-mat-record.js','25-matlib-host.js'):
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record',f))
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack
# the lands' own families (materials.json, "own": PLAN-LANDS.md J2-J3) ride only on their station's page: station 1 and the others
# carry none of them (the pack's bytes are the page's)
LAND_FAMS={'savage':['figbark','comb'],'north':['bonewood','howlculm','howlleaf']}
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'hyperjungle',own=True,exclude=[f for k,v in LAND_FAMS.items() if k!=STATION for f in v])}
for f in VIRTUAL: PATH[f]=None
# the shared atmosphere (core/atmos/README.md; 2026-10-20, phase 0 of the water migration): its core, presets, export, the open-water
# wave field and the sky's light, bound once by 89a-host-atmos.js (ATMOS.bindHost). Nothing is drawn by the binding alone: the page's own
# sky, fog, sun and water are unchanged; core/water draws here in a later phase.
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
# core/water (core/water/README.md; 2026-10-20, phase 2): the brook as a WATER.flow (record in 45-host-stage.js, drawn in 89w-host-water.js). Explicit paths:
# the open-water draw (50) and the flow/fall/still kinds (51) as well as the data.
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water',f))
PATH.setdefault('56-core-water-breakup.js',os.path.normpath(os.path.join(HERE,'..','..','core','water','ext','56-core-water-breakup.js')))   # the breakup (core/water ext/56), on by default since 2026-11-09
PATH['89-atmos-c-hostbind.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-c-hostbind.js'))   # ATMOS.bindHost, in core/atmos/host/ so the kits that take core/atmos whole are not changed
# the shared sky (core/atmos/SKY-PLAN.md section 9, 2026-10-26): core/atmos's core where the kit had none, the sky's model,
# presets and shader, its host and the biome call (src/89-host-sky.js: ATMOS.skyBiome); they replace the painted dome
for f in ['89-atmos-0-core.js','89-atmos-0p-presets.js']:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky',f))
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']:   # e-weatherhost: ATMOS.bindWeather, with the weather (4) and its selector (9) in CORE_ATMOS (2026-10-26)
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host',f))
# height fog (R1: the sky's chunk and its host, above), the rain occlusion map (R10) and the branched lightning (2026-10-27, the final rebuild)
PATH['89-atmos-j-fog.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky','89-atmos-j-fog.js'))
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','fx',f))
# THE NEIGHBOURS, read in place (EXCHANGES.md, 2026-10-27: the hyperjungle as receiver; each station's 87-host-kin.js grows them):
# the lake station takes geyser's stilt pandan (its species and tree builders); the savanna station takes eastabyss's sigillaria
# and cycad as cousins (PLAN-LANDS.md 5.1's fire scale-tree and monsoon cycad). Each kit's two fragments slotted after the host
# stage (45) and before this kit (50), each in its own registry, closed by a one-line kitEnd; its pack carries only the
# families those builders draw with
import json as _json
NEIGH={'lake':{'geyser':(['50-biome-geyser-species.js','55-biome-geyser-trees.js'],'GEYSER',['bark0','strap','rosette'])},
       'savanna':{'eastabyss':(['50-biome-eastabyss-species.js','55-biome-eastabyss-trees.js'],'EASTABYSS',{'drop':['groundCrack','groundDetail','towerConcrete','towerRust','matreed','reed','samphire','rope','rock','under','under1','under2','under3','hang','hang1','beard','clubmoss','moss','bloom','fungus']})},
       # Screamer wood's savannah gaps (J4, 2026-11-08): the savannah rims' blind grass, their species and grass passes read in place
       'north':{'savannarim':(['50-biome-savrim-species.js','55-biome-savrim-trees.js','60-biome-savrim-floor.js'],'SAVRIM',['blind','grass'])}}.get(STATION,{})
# where a neighbour's kit lives when it is not biomes/<its key>: the savannah rims (registry and pack key 'savannarim') are abyssal-savannah's
# stations (PLAN-LANDS.md section 14, answer 1), their shared fragments in its src/rim/, their pack families in its tex/
HOMES={'savannarim':('abyssal-savannah','src/rim')}
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(NEIGH.items())):
    _hd,_sd=HOMES.get(_k,(_k,'src'));_d=os.path.normpath(os.path.join(HERE,'..',_hd));_c='abcdefgh'[_i]
    for _j,_f in enumerate(_fs): PATH['47%s%d-%s'%(_c,_j,_f)]=os.path.join(_d,_sd,_f)
    VIRTUAL['47%s9-%s-end.js'%(_c,_k)]=chr(10)+'BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)'%_api+chr(10)
    if _k=='geyser':   # the geyser kit's namespace is made by its layout fragment (46), which this page does not take
        VIRTUAL['47%s-%s-ns.js'%(_c,_k)]=chr(10)+'var GEYSER={};   // the namespace its own page makes in 46-biome-geyser-layout.js'+chr(10);PATH['47%s-%s-ns.js'%(_c,_k)]=None
    _pj=os.path.join(_d,'tex','pack.json')
    _ex=[f for f in (sorted(_json.load(open(_pj,encoding='utf-8')).get('families',{})) if os.path.isfile(_pj) else []) if (f in _keep['drop'] if isinstance(_keep,dict) else _keep is not None and f not in _keep)]   # a list keeps, {'drop': [...]} drops
    VIRTUAL['44%s-host-matlib-pack-%s.js'%(_c,_k)]=matlib_pack.fragment(_d,_k,exclude=_ex)
    PATH['44%s-host-matlib-pack-%s.js'%(_c,_k)]=None;PATH['47%s9-%s-end.js'%(_c,_k)]=None
# THE FAUNA BUNDLE (kits/fauna, H8): the savage land's beasts (the Riders' four, the beetle, the spider, the flyers) and the kit's own
# hyperjungle animals, as KratorFauna, vertex-coloured (no packed detail maps); placed and drawn by the station's 87 (FAUNALANDS)
FAUNA_GROUPS={'savage':['riders','hyperjungle','crawlers','flyers','voth'],'north':['hyperjungle','crawlers']}.get(STATION)
if FAUNA_GROUPS:
    sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','kits','fauna')))
    import fauna_bundle as _fb
    VIRTUAL['86f-host-fauna-bundle.js']=_fb.bundle(FAUNA_GROUPS,tex=False);PATH['86f-host-fauna-bundle.js']=None
PATH.pop('82-host-sky.js',None)   # the old dome stays in src/ for the builds that still read it in place; this page draws the shared sky
# the syntax check cannot see a core fragment that is simply absent
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f:
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf8', newline='\n').write(html)
# syntax check on the script body
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html,re.S)
js=m.group(1) if m else ''
chk=os.path.join(HERE,'.syntax.js'); open(chk,'w',encoding='utf8').write(js)
node=find_node()
r=subprocess.run([node,'--check',chk],capture_output=True,text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  '+('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode==0 else 'SYNTAX ERROR\n'+r.stderr[:800]))
ki=os.path.join(HERE,'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op=[l for l in open(ki,encoding='utf8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
