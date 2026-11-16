#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (eastern badlands species, trees, floor)
  45-host-stage     HOST binding (renderer, terrain, BIO.init) -- must run before 50
  80..98            HOST (sky, tower, build, camera, probe)
  99-tail.html      closes <script>

  python3 build.py                     dist/ebadlands.html, the transect (the overview)
  python3 build.py --station <name>    dist/ebadlands-<name>.html: stations/<name>/ added to src/ (PLAN-STATIONS.md;
                                       its fragments hand 45-host-stage.js STATION_STAGE). waste, canyons, montane, tundra

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
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('ebadlands-%s.html'%STATION if STATION else 'ebadlands.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# core/terrain, opt-in by name (core/README.md "terrain/"); the final rebuild (2026-11-02): 35 KSTRATA (the badland and canyon beds: src/35-core-strata.js,
# sedesert's legacy copy, is gone), 37 KSTACKS (domes and tors), 38 KRELIEF (wadis, talus, pavement), 43 KGROUND, 44 KFAR, 45 KHORIZON. A local src/ copy wins.
CORE_TERRAIN=['35-core-strata.js','37-core-stacks.js','38-core-relief.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome, the same way (core/README.md): one copy for every kit. 32 kin and variant pools, 33 the fungoid parts (the vents' crust),
# 31j a limb's joint to its parent (BIO.flareJoin), 34 the octahedral impostors, 41 the environmental fields, 44 the stage
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31j-core-joint.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
# a STATION's fragments (stations/<name>/, numbered): added to src/'s, a name in both is the station's
if STATION:
    _sd=os.path.join(HERE,'stations',STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
PATH.setdefault('35z-core-strata-shade.js',os.path.join(CORE_T,'host','35-core-strata-shade.js'))   # after 35 (Span's lesson: keyed 35z)
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
# core/hazard (KHAZ): the air's dust, alkali and visibility reach the walker through it (89a-host-atmos.js); KTRAPS.cycle, the clock its export reads
PATH.setdefault('20-core-hazard.js',os.path.normpath(os.path.join(HERE,'..','..','core','hazard','20-core-hazard.js')))
PATH.setdefault('37-core-traps.js',os.path.normpath(os.path.join(HERE,'..','..','core','biome','37-core-traps.js')))
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock (core/clock), the panel and
# the probe, and the whole interface (the final rebuild). src/99-host-take.js hands it the page (KHOST.take). A local src/ copy wins.
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','core','host')))
import host as khost
CORE_HOST=khost.FULL+['94-host-polytool.js']   # the authoring tools (inspect, polygon, path), once the kit's 93-host-polytool.js
khost.resolve(PATH,CORE_HOST)
# the shared atmosphere (core/atmos/README.md): its core, presets, export, the open-water wave field and the sky's light, bound once by
# 89a-host-atmos.js (ATMOS.bindHost); the weather (4) and its selector (9)
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
# core/water (core/water/README.md): the river a WATER.flow, the acid pools and the tarn WATER.still (records in 45-host-stage.js, drawn in
# 89w-host-water.js); the final rebuild's ext: the looks (54: the stations' ice and brine), breakup (56), the audit (57), the reflections switch (58),
# the shore's fields (60), by path (tools/fragment_needs.json has their order)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water',f))
for f in ['54-core-water-kinds-ext.js','54b-core-water-kinds-ext-draw.js','56-core-water-breakup.js','57-core-water-audit.js','58-core-water-mirror.js','60-core-water-fields.js']:
    PATH.setdefault(f,os.path.normpath(os.path.join(HERE,'..','..','core','water','ext',f)))
PATH['89-atmos-c-hostbind.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-c-hostbind.js'))   # ATMOS.bindHost, in core/atmos/host/ so the kits that take core/atmos whole are not changed
# the shared sky (core/atmos/SKY-PLAN.md section 9, 2026-10-26): the sky's model, presets and shader, its host and the biome call
# (src/89-host-sky.js: ATMOS.skyBiome)
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky',f))
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']:   # e-weatherhost: ATMOS.bindWeather (2026-10-26)
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host',f))
# the final rebuild's air (89a-host-atmos.js): height fog (R1), the rain occlusion map (R10), lightning, the dust the wind lifts and the air's load, snow that lies
PATH['89-atmos-j-fog.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky','89-atmos-j-fog.js'))
PATH['89-atmos-3-particles.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','89-atmos-3-particles.js'))
PATH['89-atmos-3d-dust.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','89-atmos-3d-dust.js'))
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js','89-atmos-fx-airload.js','89-atmos-fx-snowcover.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','fx',f))
# the syntax check cannot see a core fragment that is simply absent
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record, PLAN.md): the record and its browser half, and the pack of the library
# textures materials.json names, generated from the committed tex/ (tools/textures/pack.py). Without tex/pack.json the
# pack is empty and the kit keeps its procedural textures (as it does in the open world, which carries no pack).
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
CORE_M=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record'))
for f in CORE_MAT:
    if f not in PATH: PATH[f]=os.path.join(CORE_M,f)
# the library pack (core/materials/PLAN.md): the shared writer, tools/textures/matlib_pack.py (2026-10-25: it was an inline copy that
# dropped a slot's `cell`, so a celled card showed its whole sheet; TODO.md, "Card sheets shown whole")
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'ebadlands',own=True),khost.EDITS_JS:khost.edits_js(HERE,'ebadlands')}
# THE NEIGHBOURS' SPECIES, read in place (EXCHANGES.md "ebadlands": the kit as receiver; src/87-host-kin.js grows them): a station names the kits whose
# species it grows in its stations/<name>/station.json ("kin": {"<kit>": [[fragments], "<API>", [pack families]]}). Each kit's fragments slot after the host
# stage (45) and before this kit (50), in their own registry, closed by a one-line kitEnd; its pack carries only the families those builders draw with
import json as _json
NEIGH={}
if STATION:
    _sj=os.path.join(HERE,'stations',STATION,'station.json')
    if os.path.isfile(_sj):
        with open(_sj,encoding='utf-8') as _fh: NEIGH={k:tuple(v) for k,v in _json.load(_fh).get('kin',{}).items()}
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(NEIGH.items())):
    _d=os.path.normpath(os.path.join(HERE,'..',_k.split('/')[0]));_c='abcdefgh'[_i];_kk=_k.replace('/','-')
    for _j,_f in enumerate(_fs): PATH['47%s%d-%s'%(_c,_j,os.path.basename(_f))]=os.path.join(_d,_f)
    VIRTUAL['47%s-%s-open.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');   // its own registry"%_k.split('/')[0]+chr(10)
    VIRTUAL['47%s9-%s-end.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)"%(_k.split('/')[0],_api)+chr(10)
    _pj=os.path.join(_d,'tex','pack.json')
    with open(_pj,encoding='utf-8') as _fh: _fam=sorted(_json.load(_fh).get('families',{})) if os.path.isfile(_pj) else []
    VIRTUAL['44%s-host-matlib-pack-%s.js'%(_c,_kk)]=matlib_pack.fragment(_d,_k.split('/')[0],exclude=[f for f in _fam if f not in _keep])
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and 'core-water' not in f and not re.match(r'47[a-h]',f):   # the neighbours' kits (47*) are their own builds' to lint; core/water/ext says RIVER in its options
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
# syntax check on the script body
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html,re.S)
js=m.group(1) if m else ''
chk=os.path.join(HERE,'.syntax.js'); open(chk,'w',encoding='utf8',newline='\n').write(js)
node=find_node()
r=subprocess.run([node,'--check',chk],capture_output=True,text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  '+('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode==0 else 'SYNTAX ERROR\n'+r.stderr[:800]))
ki=os.path.join(HERE,'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op=[l for l in open(ki,encoding='utf8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
