#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..44            BIOME CORE  (core/biome: the engine-independent kit), the material library
  45-host-stage     HOST: renderer, light, the land before the thermal ground
  46-biome-geyser   THE KIT's layout (data): the features, their run-off, relief, heat, cycles
  47-host-land      HOST: the land with the kit's relief, the fields, the creek, BIO.init
  48a..48f          the HYPERJUNGLE kit, read in place from biomes/hyperjungle/src (the jungle that walls the basin in)
  50..79            THE KIT: species, trees, sinter, floor, the show (water, eruptions, steam), build
  80..98            HOST (sky, ground, the creek, build, the sea on core/water, camera, probe)
  20, 50, 89-atmos   CORE: core/water (data, drawing) and core/atmos (the wave field, the sky's light), read in place
  99-tail.html      closes <script>

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); build.py greps for the
forbidden names so a kit fragment cannot quietly grow a dependency on one world's engine.
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
# python3 build.py                    dist/geyser.html, the showcase basin in the Steampits (station 1)
# python3 build.py --station <name>   dist/geyser-<name>.html: stations/<name>/ added to src/ (PLAN-STATIONS.md): stills
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('geyser-%s.html'%STATION if STATION else 'geyser.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
# a STATION (PLAN-STATIONS.md; the oidong lines): stations/<name>/'s numbered fragments are added to src/'s (a name in both is the station's), and its
# station.json may name more core ("core": {"<fragment name>": "<path from the repo root>"}) and the neighbours' kits it reads in place ("kin")
import json as _json
SJ={}
if STATION:
    _sd=os.path.join(HERE,'stations',STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    _sj=os.path.join(_sd,'station.json')
    if os.path.isfile(_sj):
        with open(_sj,encoding='utf-8') as _fh: SJ=_json.load(_fh)
    if SJ.get('baseOnly'): sys.exit('build.py: stations/'+STATION+'/ is a shared base, never built alone (its stations name it as their "base")')
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    # a station on another's ground names it as its "base" (stations 2-5 share stations/field: a geyser field on any ground, set by the station's site record);
    # the base's fragments first, then the station's own (a name in both is the station's)
    _base=SJ.get('base')
    if _base:
        _bd=os.path.join(HERE,'stations',_base)
        for f in os.listdir(_bd):
            if re.match(r'\d',f): PATH[f]=os.path.join(_bd,f)
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
    for f,pth in SJ.get('core',{}).items(): PATH.setdefault(f,J(pth))
# core/terrain, opt-in by name (core/README.md "terrain/"). The final rebuild (pair 7, 2026-11-03): 43 KGROUND (the library's ground layers, 84), 44 KFAR (the
# country past the map, 85), 45 KHORIZON (its shadows), 35 + 35b KSTRATA's lamina column (the Stair's curtains and the cones laid down in couplets, 84). A src/ copy wins.
CORE_TERRAIN=['35-core-strata.js','35b-core-lamina.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
for f in ['44-core-farfield-draw.js','45-core-horizon-shade.js']: PATH.setdefault(f,J('core','terrain','host',f))
PATH.setdefault('35c-core-lamina-shade.js',J('core','terrain','host','35b-core-lamina-shade.js'))   # keyed 35c: '35b-core-lamina-shade' sorts before '35b-core-lamina.js', which it needs
# the biome core from core/biome (core/README.md): one copy for every kit. 35-core-anim: the hyperjungle's fauna; 37: the one clock (KTRAPS.cycle) core/hazard
# runs on. The final rebuild adds 31j a limb's joint to its parent (BIO.flareJoin), 32 the variant pools, 33 the fungoid parts (the hyperjungle's brackets),
# 34 the octahedral impostors (the hyperjungle's far trees and this kit's), 41 the environmental fields, 44 the stage record
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31j-core-joint.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js','35-core-anim.js',
 '36-core-walker.js','37-core-traps.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page). The showcase's jungle walls are the hyperjungle's,
# in its own registry; its fragments keep their numbers' order, slotted before this kit's (the Throne's kipuka does the same)
HJ=J('biomes','hyperjungle')
KITS={'41-hyperjungle-globals.js':'src/41-hyperjungle-globals.js','48a-hj-species.js':'src/50-biome-hyperjungle-species.js',
      '48b-hj-trees.js':'src/55-biome-hyperjungle-trees.js','48c-hj-fauna.js':'src/58-biome-hyperjungle-fauna.js',
      '48d-hj-floor.js':'src/60-biome-hyperjungle-floor.js','48e-hj-dress.js':'src/65-biome-hyperjungle-dress.js',
      '48f-hj-build.js':'src/70-biome-hyperjungle.js'}
for slot,p in KITS.items():
    if SJ.get('nojungle') and slot!='41-hyperjungle-globals.js': continue   # a station with no jungle keeps only its globals (TAU, clamp, smooth, fbm...)
    PATH[slot]=os.path.join(HJ,p)
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume the kit places is a core/tags record
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
# core/export (core/export/README.md): the krator-world container; core/space (KSPACE: the spatial index the core's keep-clear and scatter read)
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
# core/hazard (core/hazard/README.md, "Adopting it"; 2026-10-26): the geysers on the one clock (46: GEYSER.hazard, GEYSER.state), the springs, the acid flats
# and (the final rebuild) the hot ground's crust; 99 hands the overlay to the host (layers: hazards). A src/ copy wins.
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
# core/shadow (KSHADOW; the owner, 2026-11-03: the rebuild turns take it where affordable): the sun's shadows in one view-following box (89z; ?shadow=0)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the shared atmosphere (core/atmos/README.md: its core, presets, the open-water wave field and the sky's light) and core/water
# (core/water/README.md: the open surface, its CPU twins, the CDLOD water mesh): the sea is a WATER.open surface (89w-host-sea.js).
# The final rebuild's air: height fog (R1), the rain occlusion map (R10), lightning; the particles for a station's steam groups
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
# core/water: 21 the shore (WATER.PRESETS.shore: the wet ground's chunk reads it; without it the page died at render, 2026-11-03)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['52-core-water-geyser.js','52b-core-water-geyser-draw.js']:   # core/water/geyser/: opt-in, NOT pooled by builds that list core/water (README)
    PATH[f]=J('core','water','geyser',f)
# core/water/ext/: the pools in one mesh (drawPools, 53), and the final rebuild's: the audit (57: the creek on its ground, 99's check) and the outflows'
# plume on the sea (61, tintFlow). Not taken: the reflections switch (58: no large still the mirror can patch; PLAN-STATIONS.md, "Core adoption")
for f in ['53-core-water-terraces.js','53b-core-water-terraces-draw.js','57-core-water-audit.js','61-core-water-plume.js']:
    PATH.setdefault(f,J('core','water','ext',f))
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock (core/clock), the panel and
# the probe. src/99-host-take.js hands it the page (KHOST.take). A local src/ copy with the same name wins (KNOWN_ISSUES.md).
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.SHELL+['94-host-polytool.js']   # the authoring tools (inspect, polygon, path), once the kit's 93-host-polytool.js
khost.resolve(PATH,CORE_HOST)
# the shared sky (core/atmos/SKY-PLAN.md section 9, 2026-10-26): the sky's model, presets and shader, its host and the biome call (src/89-host-sky.js:
# ATMOS.skyBiome); height fog's chunk and host, the rain cover and the lightning (the final rebuild)
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']: PATH[f]=J('core','atmos','fx',f)
for f in SJ.get('fx',[]): PATH[f]=J('core','atmos','fx',f)   # a station's own air (the Stills' shimmer, their steam groups)
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record, PLAN.md): the record and its browser half, and the packs of the library
# textures each kit's materials.json names, generated from the committed tex/ (tools/textures/pack.py). Without a
# tex/pack.json a pack is empty and its kit keeps its procedural textures (as in the open world, which carries none).
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
CORE_M=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record'))
for f in CORE_MAT:
    if f not in PATH: PATH[f]=os.path.join(CORE_M,f)
# SIDECAR PACKS (tools/textures/matlib_pack.py): the maps go in files beside the page (dist/geyser.tex.geyser.js,
# dist/geyser.tex.hyperjungle.js), loaded by plain <script src> tags ahead of the page's code, so the page opened from
# disk keeps its textures. --inline-packs puts them back in the page (one self-contained file).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
# named -host- (the FORBID scan skips it: base64 may spell a forbidden word) and numbered 44: the host stage (45) reads it
# THE STATIONS' OWN SETS: materials.json slots keyed 'st.<name>' (the cold stations' snow, ice, needles, bunch grass...) go only into the pages of the stations
# whose station.json lists them ("tex"), so the showcase and the Stills carry none of them
_pjg=os.path.join(HERE,'tex','pack.json')
with open(_pjg,encoding='utf-8') as _fh: _famg=sorted(_json.load(_fh).get('families',{})) if os.path.isfile(_pjg) else []
_stx=[f for f in _famg if f.startswith('st.') and f not in SJ.get('tex',[])]
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'geyser',exclude=_stx,side=SIDE),
         **({} if SJ.get('nojungle') else {'44b-host-matlib-pack-hyperjungle.js':_mp.fragment(HJ,'hyperjungle',side=SIDE)})}
# THE NEIGHBOURS' KITS a station reads in place (oidong's lines): station.json "kin": {"<kit>": [[fragments], "<API>", [pack families kept]]}; each kit's
# fragments slot after the host stage (45) and the hyperjungle (48) and before this kit (50), in their own registry, closed by a one-line kitEnd
NEIGH={k:tuple(v) for k,v in SJ.get('kin',{}).items()}
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(NEIGH.items())):
    _d=os.path.normpath(os.path.join(HERE,'..',_k.split('/')[0]));_c='mnopqrst'[_i];_kk=_k.replace('/','-')
    for _j,_f in enumerate(_fs): PATH['49%s%d-%s'%(_c,_j,os.path.basename(_f))]=os.path.join(_d,_f)
    VIRTUAL['49%s-%s-open.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');   // its own registry"%_k.split('/')[0]+chr(10)
    VIRTUAL['49%s9-%s-end.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed"%(_k.split('/')[0],_api)+chr(10)
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and not re.match(r'49[m-t]',f) and not (PATH[f] and os.sep+'core'+os.sep in os.path.normpath(PATH[f])):   # the kit's own fragments (core/ is scanned by its own tests)
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,OUT[:-5]+'.tex.js')
open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
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
