#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (the Throne: flow history, species, trees, floor)
  45-host-stage     HOST binding (renderer, terrain, BIO.init) -- must run before 50
  80..98            HOST (sky, tower, build, camera, probe)
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
BSRC.variants([['--station',_s] for _s in sorted(os.listdir(os.path.join(HERE,'stations'))) if os.path.isfile(os.path.join(HERE,'stations',_s,'station.json'))])   # every station's page
OUT=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith("--") else "throne.html"
# STATIONS (NOTES.md, "Building it"): each station of the Throne is its own showcase page from the same kit.
#   python3 build.py                     station 1, the plume's edge: src/ as it is -> dist/throne.html
#   python3 build.py --station kipuka    stations/kipuka/: its host fragments replace src/'s of the same name, and its
#                                        station.json names the page ("out"), extra core files ("core") and other kits'
#                                        fragments read in place ("kits": {slot name: path from this folder})
STATION=None
# station 1's core/water fragments (a station names its own in station.json "water")
S1_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js','geyser/52-core-water-geyser.js','geyser/52b-core-water-geyser-draw.js']
if '--station' in sys.argv:
    STATION=sys.argv[sys.argv.index('--station')+1]
    import json as _json
    STN_DIR=os.path.join(HERE,'stations',STATION)
    STN=_json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf8'))
    OUT=STN['out']
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# shared fragments from core/terrain, opt-in by name (core/README.md): '36-core-carve.js' gives
# BIO.carve, overhangs on the heightfield. A local src/ copy with the same name wins.
# 2026-11-02, the final rebuild (BACKPORT.md section 1, every station): KGROUND (43: the ground's layers through THRONE.layGLSL), KHORIZON (45: its shadows),
# KTHERM (47: the ground's heat between the vents, src/89x-host-fields.js). KFAR is not taken: KNOWN_ISSUES.md, 'The far field'
CORE_TERRAIN=['43-core-ground.js','45-core-horizon.js','47-core-therm.js']
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome, the same way (core/README.md): one copy for every kit.
# A kit that lists nothing keeps its own src/ copies and builds as before.
# 31j the limbs' joints (BIO.flareJoin, 55's limb(); 2026-11-03), 34 the octahedral impostors (the far trees, 55), 41 the environmental fields (src/89x-host-fields.js) (2026-11-02)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31j-core-joint.js','34-core-impostor.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
PATH.setdefault('45-core-horizon-shade.js',os.path.join(CORE_T,'host','45-core-horizon-shade.js'))
# core/shadow (KSHADOW, the owner, 2026-11-03): the sun's shadows in one view-following box; the data half and its host, attached in src/89zz-host-core.js
PATH.setdefault('10-core-shadow.js',os.path.normpath(os.path.join(HERE,'..','..','core','shadow','10-core-shadow.js')))
PATH.setdefault('12-core-shadow-host.js',os.path.normpath(os.path.join(HERE,'..','..','core','shadow','host','12-core-shadow-host.js')))
if STATION:
    # src/89a-host-atmos.js (the atmosphere binding of station 1, 2, 6 and 11) is a station's only when station.json says "atmosHost"
    # (the others bind core/atmos in their own 89-host-atmos.js, with weather)
    if not STN.get('atmosHost'): PATH.pop('89a-host-atmos.js',None)
    # src/89w-host-water.js is station 1's water (core/water, 2026-10-26): a station draws its own water in its own 89w (or none)
    PATH.pop('89w-host-water.js',None)
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(STN_DIR,f)
    for f in STN.get('core',[]): CORE_BIOME=CORE_BIOME+[f] if f not in CORE_BIOME else CORE_BIOME
    # core/terrain fragments a station takes by path (station.json "terrain"; 2026-11-03: the glacier's KGLACIER, 44g and host/44h)
    for f in STN.get('terrain',[]): PATH[os.path.basename(f)]=os.path.join(CORE_T,os.path.normpath(f))
    # core/hazard (core/hazard/README.md, "Adopting it"; 2026-10-26): station.json "hazard": true takes it and the one clock
    # (core/biome/37-core-traps.js KTRAPS.cycle); the station's records carry tags.hazard and its 99 shows the overlay
    if STN.get('hazard'):
        PATH['20-core-hazard.js']=os.path.normpath(os.path.join(HERE,'..','..','core','hazard','20-core-hazard.js'))
        if '37-core-traps.js' not in CORE_BIOME: CORE_BIOME=CORE_BIOME+['37-core-traps.js']
    for slot,p in STN.get('kits',{}).items(): PATH[slot]=os.path.normpath(os.path.join(HERE,p))
    # the shared atmosphere (core/atmos/README.md): the open-water wave field a station's sea reads
    for f in STN.get('atmos',[]): PATH[os.path.basename(f)]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))   # a subfolder file (fx/...) keyed by its name
    # 2026-10-20 (phase 0 of the water migration): a station with no ATMOS.init of its own binds core/atmos through ATMOS.bindHost
    # (core/atmos/host/, a subfolder so the kits that take core/atmos whole are not changed): station.json "atmosHost": true
    # 2026-10-20 (phase 2 of the water migration): core/water fragments a station draws with, by explicit path ("water" in station.json)
    # 2026-10-26: keyed by the file's name, as the atmos list is, so a subfolder fragment (geyser/52-..., ext/53-...) sorts by its number
    for f in STN.get('water',[]): PATH[os.path.basename(f)]=os.path.normpath(os.path.join(HERE,'..','..','core','water',f))
    if STN.get('atmosHost'): PATH['89-atmos-c-hostbind.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-c-hostbind.js'))
else:
    # station 1 (the plume's edge): core, presets, export, the wave field and the sky's light, bound by src/89a-host-atmos.js
    for f in ('89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-4-weather.js','89-atmos-8-export.js','89-atmos-9-host.js','89-atmos-a-waves.js','89-atmos-b-skylight.js'): PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))   # 4, 9: the weather and its selector (2026-10-26)
    PATH['89-atmos-c-hostbind.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-c-hostbind.js'))
    PATH['89-atmos-e-weatherhost.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-e-weatherhost.js'))   # ATMOS.bindWeather (src/89a-host-atmos.js; a station lists it in station.json "atmos")
    # 2026-10-26 (the water migration, station 1): the acid lake on WATER.still, the hot pools on WATER.spring (src/89w-host-water.js)
    for f in S1_WATER: PATH[os.path.basename(f)]=os.path.normpath(os.path.join(HERE,'..','..','core','water',f))
# THE FINAL REBUILD (2026-11-02), every page with core/water: the audit (57), the reflections switch (58, off at page load; src/89y-host-core.js
# installs it on a station's largest still), the shore's fields (60: WATER.fieldAt for the wet ground and the flora); tools/fragment_needs.json has their order
if '20-core-water.js' in PATH:
    for f in ['57-core-water-audit.js','58-core-water-mirror.js','60-core-water-fields.js']:
        PATH.setdefault(f,os.path.normpath(os.path.join(HERE,'..','..','core','water','ext',f)))
# the air (core/atmos/README.md, "Adopting the final rebuild's atmos items"): height fog, the rain's occlusion map and the branched lightning on every page that
# binds the weather (every page but the tube, underground); src/89y-host-core.js calls them with each station's numbers (ATMOS_AIR in its 45)
if not (STATION and STATION=='tube'):
    for f,d in [('89-atmos-j-heightfog.js','host'),('89-atmos-j-fog.js','sky'),('89-atmos-fx-raincover.js','fx'),('89-atmos-fx-lightning.js','fx'),('89-atmos-3-particles.js','')]:
        PATH.setdefault(f,os.path.normpath(os.path.join(HERE,'..','..','core','atmos',d,f)))
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE_B,f)
# core/rand and core/tags (core/tags/README.md), the way the core/furnish builds take them: with BIO.init({tags}) every item
# set, instance and registered volume the kit places is a core/tags record (core/biome/20-core-kit.js). A src/ copy wins.
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items():
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core',d,f))
for f in CORE_SPACE:
    if f not in PATH: PATH[f]=os.path.join(CORE_S,f)
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock (core/clock), the panel and
# the probe. src/99-host-take.js hands it the page (KHOST.take). A local src/ copy with the same name wins (KNOWN_ISSUES.md).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','core','host')))
import host as khost
CORE_HOST=khost.SHELL+['94-host-polytool.js']   # the authoring tools (inspect, polygon, path), once the kit's 93-host-polytool.js
khost.resolve(PATH,CORE_HOST)
# the shared sky (core/atmos/SKY-PLAN.md section 9, 2026-10-26): core/atmos's core where the kit had none, the sky's model,
# presets and shader, its host and the biome call (src/89-host-sky.js: ATMOS.skyBiome); they replace the painted dome
for f in ['89-atmos-0-core.js','89-atmos-0p-presets.js']:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky',f))
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host',f))
if '--station' in sys.argv and not os.path.exists(os.path.join(STN_DIR,'89-host-sky.js')):   # a station still on its own dome takes none of it
    for f in ['89-host-sky.js','89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-h-skyhost.js','89-atmos-i-skybiome.js']: PATH.pop(f,None)
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
TEX_DIR=os.path.join(HERE,'tex')
# SIDECAR PACKS (tools/textures/matlib_pack.py): the maps go in files beside the page, not in it, one per pack and shared
# by every station: dist/throne.tex.throne.js, and dist/throne.tex.hyperjungle.js for the stations that read the
# hyperjungle. Eleven pages that each carried the same 14 MB of maps now carry a few hundred KB of code. The files load by
# plain <script src> tags ahead of the page's code, so a page opened from disk keeps its textures; publish them beside the
# pages (gallery/build_throne.py does). --inline-packs puts the maps back in the page (one self-contained file).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack as _mp
SIDE={}
INLINE='--inline-packs' in sys.argv
def matlib_pack(pname='throne',tex_dir=None):
    """GENERATED fragment: the library textures materials.json names, as data URLs (KMAT.pack). It reads the committed
    tex/ files only, never the library or an image encoder, so the build stays deterministic (Girder's, the same).
    pname/tex_dir: another kit's pack (a station's 'packs'), the same way. Unless --inline-packs, the maps go into SIDE
    (the sidecar) and the fragment is the loader that reads them back."""
    import base64, json
    tex_dir=tex_dir or TEX_DIR
    pj=os.path.join(tex_dir,'pack.json')
    if not os.path.isfile(pj): return "/* no tex/pack.json: the kit runs on its procedural textures */\nKMAT.pack('%s', {});\n"%pname
    pack=json.load(open(pj,encoding='utf-8'));out=[]
    for fam in sorted(pack['families']):
        e=pack['families'][fam]
        f={'lib':e['lib'],'scale':e['scale'],'metal':e['metal'],'normalScale':e['normalScale'],'specular':e.get('specular',.5),
           'breakup':e.get('breakup'),'tint':e['tint']['keep'],'mean':e['tint']['mean'] if e['tint']['mean'] is not None else e['tint'].get('sourceMean')}
        if e.get('cell'): f['cell']=e['cell']   # one cell of a card sheet (TODO.md, "The inline pack writers that drop cell"; nsemiarid's line): no slot here has one yet, the sheets are cut by hand (50's sheet())
        for k,name in sorted(e['files'].items()):
            f[k]='data:image/webp;base64,'+base64.b64encode(open(os.path.join(tex_dir,name),'rb').read()).decode()
        out.append(' %s: %s'%(json.dumps(fam),json.dumps(f,sort_keys=True)))
    if not INLINE:
        SIDE[pname]='{\n'+',\n'.join(out)+'\n}'
        return _mp.loader(pname)
    return ('/* ============================== LIBRARY PACK (generated) ==============================\n'
            '   build.py writes this from tex/ (tools/textures/pack.py from materials.json). Do not edit. */\n'
            "KMAT.pack('"+pname+"', {\n" + ',\n'.join(out) + '\n});\n')
# named -host- (the FORBID scan skips it: base64 may spell a forbidden word) and numbered 44: the host stage (45) reads it
VIRTUAL={'44-host-matlib-pack.js':matlib_pack()}
# a station's other kits' packs (station.json 'packs': {pack name: that kit's folder, from this one}), inlined the same way
if STATION:
    for _pn,_pd in STN.get('packs',{}).items():
        VIRTUAL['44b-host-matlib-pack-%s.js'%_pn]=matlib_pack(_pn,os.path.join(os.path.normpath(os.path.join(HERE,_pd)),'tex'))
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    # the scan is for this kit's own leaves: a shared core/water fragment may name a river (ext/53's comments say RIVER) (2026-10-26)
    if 10<=n<80 and '-host-' not in f and not (PATH[f] and os.path.normpath(PATH[f]).startswith(os.path.normpath(os.path.join(HERE,'..','..','core','water')))):
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
# the sidecars: throne.tex.<pack>.js, the same files for every station (prune=False: one station's build must not
# delete a pack another station's page loads)
html=_mp.write_sidecar(SIDE,html,DIST,'throne.tex.js',prune=False)
open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
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
