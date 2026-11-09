#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (southern highlands species, trees, floor)
  45-host-stage     HOST binding (renderer, terrain, BIO.init) -- must run before 50
  80..98            HOST (ground, far field, sky, atmosphere, water, build, shadows, camera, probe)
  99-tail.html      closes <script>

  python3 build.py                     dist/shighlands.html, the cloud forest and the paramo (station 1)
  python3 build.py --station <name>    dist/shighlands-<name>.html: stations/<name>/ added to src/ (PLAN-STATIONS.md; none built yet)

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
_SD=os.path.join(HERE,'stations')
if os.path.isdir(_SD): BSRC.variants([['--station',_s] for _s in sorted(os.listdir(_SD)) if os.path.isfile(os.path.join(_SD,_s,'station.json'))])   # every station's page
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('shighlands-%s.html'%STATION if STATION else 'shighlands.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
# a STATION (PLAN-STATIONS.md; nhighlands' convention): stations/<name>/'s numbered fragments are added to src/'s (a name in both is the
# station's; station.json "drop" removes one of src/'s, "core" names more core: {"<fragment name>": "<path from the repo root>"}).
# Station 1, the page as built, is the kit with no --station. No station is built yet (the plan awaits the owner)
import json as _json
SJ={}
if STATION:
    _sd=os.path.join(_SD,STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    _sj=os.path.join(_sd,'station.json')
    if os.path.isfile(_sj):
        with open(_sj,encoding='utf-8') as _fh: SJ=_json.load(_fh)
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in SJ.get('drop',[]): PATH.pop(f,None)
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
    for f,pth in SJ.get('core',{}).items(): PATH.setdefault(f,J(pth))
# core/terrain, opt-in by name (core/README.md "terrain/"; the final rebuild, pair 12, BACKPORT.md's ground set): 43 KGROUND (the ground's library
# layers, 84-host-ground.js), 44 KFAR (the plateau past the map, 85-host-far.js), 45 KHORIZON (the scarp's and the tors' shadows). KSTRATA is not
# taken: the tors are granite and the scarp is drawn as ground (no beds; oidong's call on its granite walls). A local src/ copy wins
CORE_TERRAIN=['43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
PATH.setdefault('44-core-farfield-draw.js',J('core','terrain','host','44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js',J('core','terrain','host','45-core-horizon-shade.js'))
# the biome core from core/biome (core/README.md): one copy for every kit. The final rebuild adds 31b the leaf set (BIO.leafOn, leafQ), 31j a limb's
# joint to its parent (BIO.flareJoin), 34 the octahedral impostors (the far trees)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','34-core-impostor.js','40-core-place.js','42-core-export.js','43-core-export-host.js']
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
# core/rand and core/tags (core/tags/README.md), the way the core/furnish builds take them: with BIO.init({tags}) every item
# set, instance and registered volume the kit places is a core/tags record (core/biome/20-core-kit.js). A src/ copy wins.
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
# core/export (core/export/README.md): the krator-world container (EXPORT.world); the biome core fills its items, buckets,
# materials, textures and terrain (42-core-export.js), 43 its stage, the adapters its registry. A src/ copy wins.
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md)
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
# core/shadow (KSHADOW; the owner, 2026-11-03: toggleable, OFF by default, ?shadow=1 or the panel's button; src/89zx-host-build.js attaches it)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the host shell from core/host (core/host/README.md): the whole interface (khost.FULL: the camera, the frame loop and its clock, the panel, the
# probe, the record-driven inspector, marks (which supersede the polygon tool), pictures, the minimap, the editor). src/99-host-take.js hands it
# the page (KHOST.take). A local src/ copy with the same name wins
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL
khost.resolve(PATH,CORE_HOST)
# the material library (core/materials/record: KMAT and the loader) and the GENERATED pack of the textures materials.json names (the shared
# writer, tools/textures/matlib_pack.py, from tex/, written by tools/textures/pack.py; it was an inline copy here). Without tex/pack.json the pack
# is empty and the kit keeps its procedural textures (as it does in the open world, which carries no pack).
for f in ('23-mat-record.js','25-matlib-host.js'): PATH.setdefault(f,J('core','materials','record',f))
sys.path.insert(0,J('tools','textures'))
import matlib_pack
# a family a station names in its station.json ("families") is packed into that station's page only: station 1 and the other stations leave it out
_sfam=set()
if os.path.isdir(_SD):
    for _st in sorted(os.listdir(_SD)):
        _p=os.path.join(_SD,_st,'station.json')
        if os.path.isfile(_p):
            with open(_p,encoding='utf-8') as _fh: _sfam.update(_json.load(_fh).get('families',[]))
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'shigh',exclude=sorted(_sfam-set(SJ.get('families',[]))),own=True),khost.EDITS_JS:khost.edits_js(HERE,'shighlands')}
for f in VIRTUAL: PATH[f]=None
# the shared atmosphere (core/atmos/README.md): its core, presets, export, the open-water wave field, the sky's light, the weather and its selector,
# and the cloud deck (89-atmos-d-clouddeck.js), bound by 89z-host-atmos.js. The deck is a field written from the presets, so a game engine draws
# the same cloud (GODOT.md). The shared sky (SKY-PLAN.md section 9: its model, presets, shader, host and the biome call, 89-host-sky.js:
# ATMOS.skyBiome); the final rebuild's air (BACKPORT.md section 1): height fog (R1) and the fog belt on the scarp, the rain occlusion map (R10),
# the branched lightning
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js','89-atmos-d-clouddeck.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']+SJ.get('fx',[]): PATH[f]=J('core','atmos','fx',f)
# core/water (core/water/README.md; 2026-10-25, migration phase 4): the tarn and the bog pools WATER.still, the ravine streams WATER.flow (records
# in 45-host-stage.js, drawn in 89zw-host-water.js, after the atmosphere binds). Explicit paths, never the folder. drawPools lives in the ext 53
# pair; the final rebuild's ext, by path (tools/fragment_needs.json): breakup (56: the streams), the audit (57), the reflections switch (58: the
# tarn), the shore's fields (60: the trees off the water, the host's edge check)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['53-core-water-terraces.js','53b-core-water-terraces-draw.js','56-core-water-breakup.js','57-core-water-audit.js','58-core-water-mirror.js','60-core-water-fields.js']:
    PATH.setdefault(f,J('core','water','ext',f))
# the syntax check cannot see a core fragment that is simply absent
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf-8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and not (PATH[f] and os.sep+'core'+os.sep in os.path.normpath(PATH[f])):
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf-8',newline='\n').write(html)
# syntax check on the script body
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html,re.S)
js=m.group(1) if m else ''
chk=os.path.join(HERE,'.syntax.js'); open(chk,'w',encoding='utf-8',newline='\n').write(js)
node=find_node()
r=subprocess.run([node,'--check',chk],capture_output=True,text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  '+('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode==0 else 'SYNTAX ERROR\n'+r.stderr[:800]))
ki=os.path.join(HERE,'KNOWN_ISSUES.md')
if os.path.exists(ki):
    with open(ki,encoding='utf-8') as _fh: op=[l for l in _fh if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
