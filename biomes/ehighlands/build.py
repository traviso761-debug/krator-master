#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

Stations, like Korona's (PLAN-STATIONS.md; none built yet: the plan awaits the owner):
  python3 build.py                     the showcase, src/ as it is -> dist/ehighlands.html
  python3 build.py --station <name>    stations/<name>/'s fragments replace src/'s of the same name; its station.json names
                                       the page ("out"), and may add core/biome fragments ("core")

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (eastern highlands species, trees, floor)
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
_STN=os.path.join(HERE,'stations')
BSRC.variants([['--station',_s] for _s in (sorted(os.listdir(_STN)) if os.path.isdir(_STN) else []) if os.path.isfile(os.path.join(_STN,_s,'station.json'))])   # every station's page
OUT=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith("--") else "ehighlands.html"
STATION=None
if '--station' in sys.argv:
    STATION=sys.argv[sys.argv.index('--station')+1]
    import json as _json
    STN_DIR=os.path.join(_STN,STATION)
    STN=_json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf-8'))
    OUT=STN['out']
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# shared fragments from core/terrain, opt-in by name (core/README.md): '36-core-carve.js' gives
# BIO.carve, overhangs on the heightfield. A local src/ copy with the same name wins.
# The final rebuild (pair 13, 2026-11-09; KNOWN_ISSUES.md, "The final rebuild"): 43 KGROUND (the library layers of the ground), 44 KFAR (the
# plateau and the range past the map), 45 KHORIZON (the range's and the tors' shadow on the ground and, after the bake, on the flora). No carve
# patches; no KSTRATA (the range is basalt flows under scree and snow, drawn by the ground's paint: no bedded wall to band)
CORE_TERRAIN=['43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome, the same way (core/README.md): one copy for every kit.
# A kit that lists nothing keeps its own src/ copies and builds as before.
# The final rebuild adds 31 the dither, 31b the leaf set (BIO.leafOn, leafQ: 30's clumpOn calls them; check_assembly's MISSING), 31j a limb's
# joint to its parent (BIO.flareJoin: the ragbark's limbs), 32 the variant pools and kin, 34 the octahedral impostors (the far ragbarks and
# flowering spikes), 41 the environmental fields (BIO.env)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31-core-dither.js','31b-core-leafset.js','31j-core-joint.js','32-core-variants.js','34-core-impostor.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(STN_DIR,f)
    for f in STN.get('core',[]): CORE_BIOME=CORE_BIOME+[f] if f not in CORE_BIOME else CORE_BIOME
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
for f,h in (('44-core-farfield-draw.js','44-core-farfield-draw.js'),('45-core-horizon-shade.js','45-core-horizon-shade.js')):
    PATH.setdefault(f,os.path.join(CORE_T,'host',h))
# core/shadow (KSHADOW; the owner, 2026-11-03: toggleable, OFF by default: ?shadow=1 turns it on, src/89z-host-build.js): the data half before the host's
PATH.setdefault('10-core-shadow.js',os.path.normpath(os.path.join(HERE,'..','..','core','shadow','10-core-shadow.js')))
PATH.setdefault('12-core-shadow-host.js',os.path.normpath(os.path.join(HERE,'..','..','core','shadow','host','12-core-shadow-host.js')))
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
CORE_HOST=khost.FULL+['94-host-polytool.js']   # the whole interface (the final rebuild: the record-driven inspector, marks, pictures, the minimap, the editor) and the authoring tools
khost.resolve(PATH,CORE_HOST)
# the shared atmosphere (core/atmos/README.md; 2026-10-20, phase 0 of the water migration): its core, presets, export, the open-water
# wave field and the sky's light, bound once by 89a-host-atmos.js (ATMOS.bindHost). Nothing is drawn by the binding alone: the page's own
# sky, fog, sun and water are unchanged; core/water draws here in a later phase.
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
PATH['89-atmos-c-hostbind.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-c-hostbind.js'))   # ATMOS.bindHost, in core/atmos/host/ so the kits that take core/atmos whole are not changed
# core/water (core/water/README.md; 2026-10-25, migration phase 4): the stream a WATER.flow, the bog's pools and the tarn's water WATER.still
# (records in 45-host-stage.js, drawn in 89w-host-water.js). Explicit paths, never the folder; drawPools is in the ext pair.
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water',f))
for f in ['53-core-water-terraces.js','53b-core-water-terraces-draw.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water','ext',f))
# the final rebuild's water ext: breakup (56: the stream's glint), the audit (57), the shore's fields (60), by path (tools/fragment_needs.json). No
# reflections switch (58): no still here is over 400 m (the tarn is ice; the bog's pools are 5-17 m)
for f in ['56-core-water-breakup.js','57-core-water-audit.js','60-core-water-fields.js']:
    PATH.setdefault(f,os.path.normpath(os.path.join(HERE,'..','..','core','water','ext',f)))
# the shared sky (core/atmos/SKY-PLAN.md section 9, 2026-10-26): core/atmos's core where the kit had none, the sky's model,
# presets and shader, its host and the biome call (src/89-host-sky.js: ATMOS.skyBiome); they replace the painted dome
for f in ['89-atmos-0-core.js','89-atmos-0p-presets.js']:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky',f))
# the final rebuild's air (BACKPORT.md section 1): height fog (R1), the rain occlusion map (R10), lightning with the weather's storms
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','fx',f))
PATH['89-atmos-j-heightfog.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-j-heightfog.js'))
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js']:   # e-weatherhost: ATMOS.bindWeather, with the weather (4) and its selector (9) in CORE_ATMOS (2026-10-26)
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host',f))
PATH['89-atmos-fx-snowcover.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','fx','89-atmos-fx-snowcover.js'))   # snow that lies while it snows (ATMOS.snowCover, started by bindWeather: a cold climate)
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
def matlib_pack():
    """GENERATED fragment: the library textures materials.json names, as data URLs (KMAT.pack). It reads the committed
    tex/ files only, never the library or an image encoder, so the build stays deterministic (Girder's, the same)."""
    import base64, json
    pj=os.path.join(TEX_DIR,'pack.json')
    if not os.path.isfile(pj): return "/* no tex/pack.json: the kit runs on its procedural textures */\nKMAT.pack('ehigh', {});\n"
    pack=json.load(open(pj,encoding='utf-8'));out=[]
    # each page carries the families it draws (station.json "packSkip"; the showcase skips the stations' own). The ground's turf, sinter
    # and puna stay on every page: 84-host-ground.js takes the library ground only with all three
    S2=['laurel','bigfrond','fern','beard','epi','brom','moss','bark4','ground.moss'];S3=['ground.ash','ground.scoria'];S4=['needle','bark5','beech','bark6','ground.needles']
    skip=set(STN.get('packSkip',[])) if STATION else set(S2+S3+S4)
    for fam in sorted(f for f in pack['families'] if f not in skip):
        e=pack['families'][fam]
        f={'lib':e['lib'],'scale':e['scale'],'metal':e['metal'],'normalScale':e['normalScale'],'specular':e.get('specular',.5),
           'breakup':e.get('breakup'),'tint':e['tint']['keep'],'mean':e['tint']['mean'] if e['tint']['mean'] is not None else e['tint'].get('sourceMean')}
        for k,name in sorted(e['files'].items()):
            f[k]='data:image/webp;base64,'+base64.b64encode(open(os.path.join(TEX_DIR,name),'rb').read()).decode()
        out.append(' %s: %s'%(json.dumps(fam),json.dumps(f,sort_keys=True)))
    return ('/* ============================== LIBRARY PACK (generated) ==============================\n'
            '   build.py writes this from tex/ (tools/textures/pack.py from materials.json). Do not edit. */\n'
            "KMAT.pack('ehigh', {\n" + ',\n'.join(out) + '\n});\n')
# named -host- (the FORBID scan skips it: base64 may spell a forbidden word) and numbered 44: the host stage (45) reads it
VIRTUAL={'44-host-matlib-pack.js':matlib_pack()}
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
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
    op=[l for l in open(ki,encoding='utf8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
