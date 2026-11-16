#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the Labyrinth biome kit (PLAN.md; station 1, the Gate: PLAN-GATE.md).

  00-head.html      page shell, opens <script>
  10..44            CORE (biome core, terrain, rand, tags, space, water, atmos), the Ancients kit's runtime (read in place, renamed: below)
  41a, 41b          the Hall of Heroes' and its stacks' plans (kits/ancients targets/gatearc, [G data], read in place)
  44m-host-model    GENERATED: the scale model's heights round the site (2 km cells), for the land past the square
  44z-host-site     the station's site (scale model 5.1): a station replaces it
  45-host-stage     HOST binding (renderer, the land, the fields, BIO.init) -- must run before the flora
  50..70            the FLORA: the kit's own mammoth steppe (PLAN.md section 3: species 50, trees 55, floor 60, growth on structures 65, build 70)
  84..89            HOST (ground, far field, the knobs, sky, atmos, the Hall 89e-89g, water, build)
  99-tail.html      closes <script>

  python3 build.py                     dist/labyrinth.html, station 1: the Gate
  python3 build.py --station <name>    dist/labyrinth-<name>.html: stations/<name>/ added to src/

Core adoption (PLAN.md section 7, PLAN-GATE.md section 7): core/biome, core/rand, core/tags, core/terrain (KSTACKS, KRELIEF, KGROUND, KFAR,
KHORIZON), core/water, core/atmos, core/host, core/space, core/shadow, core/export, core/materials (the record, the library pack). Not taken:
core/city (the Hall is one complex, a ruin; the Kimr's pueblos are core/hamlet, a later station). core/hazard is taken (89h: falls, the
rope bridge's slip, the water).
"""
import os, re, subprocess, sys, json

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places. None when there is none.
    Every build.py carries this same function; a fix belongs in all of them."""
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
    hit = _sh.which('node')
    if hit:
        return hit
    ver = lambda p: [int(x) for x in re.findall(r'\d+', p)]
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node', os.path.expanduser('~/.nvm/versions/node/*/bin/node'), os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None

HERE=os.path.dirname(os.path.abspath(__file__)); SRC=os.path.join(HERE,'src'); DIST=os.path.join(HERE,'dist')
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
sys.path.insert(0, J('tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('labyrinth-%s.html'%STATION if STATION else 'labyrinth.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER[','PALISADE','KOFF']
SJ={'site':[376.5,1473.5]}   # station 1, the Gate (PLAN-GATE.md section 2)
if STATION:
    _sd=os.path.join(HERE,'stations',STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    _sj=os.path.join(_sd,'station.json')
    if os.path.isfile(_sj):
        with open(_sj,encoding='utf-8') as _fh: SJ=json.load(_fh)
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
# core/terrain, opt-in by name: 35 KSTRATA (the far walls' bedding: the Rift's recipe, the dome's rock), 37 KSTACKS (the Hall's stacks, the chaos's knobs), 38 KRELIEF, 43 KGROUND, 44 KFAR, 45 KHORIZON
CORE_TERRAIN=['35-core-strata.js','37-core-stacks.js','38-core-relief.js','38c-core-landforms.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
for f in ['44-core-farfield-draw.js','45-core-horizon-shade.js']: PATH.setdefault(f,J('core','terrain','host',f))
# the biome core from core/biome (31b: BIO.leafOn/leafQ, which 20-core-kit calls for a stem-held leaf; check_assembly asks for it)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','32-core-variants.js','34-core-impostor.js',
 '35-core-anim.js','39-core-lean.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
# core/hazard (KHAZ) and the one clock (KTRAPS.cycle): the rims, the torn bridges, the rope bridge, the pond and the river (89h)
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
PATH.setdefault('37-core-traps.js',J('core','biome','37-core-traps.js'))
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# THE ANCIENTS KIT, read in place for THE HALL OF HEROES (kits/ancients targets/gatearc), as biomes/ancientsvalley/build.py reads it for its engines:
# its runtime, the Arcube's skins (89d: MAT.ac*, the Hall's walls), its materials (a copy in the kit's src/ wins, else core/materials), and its
# names renamed where this page has them (the registry to ANC_REG / ANC_REGISTER, the error panel, the ground, the ticks); the files on disk are
# untouched. The target's plans go early (41a, 41b: the stage reads them), its drawing after the Arcube (89e, 89f), the host's call after (89g)
ANC=J('kits','ancients')
ANC_RUNTIME=['10-core.js','12-stats.js','30-kit.js','32-surfaces.js','34-kitdefs.js','36-decor.js','38-helpers2.js','50-registry.js','54-mat-concrete.js','69-mat-salvage.js','69w-worn.js','88y-ancients-matlib.js','88-plymouth.js','89d-arcube.js','89d1-arcube-faces.js','89d2-arcube-elevation.js','89d3-arcube-ruin.js']   # 89d1-3 continue 89d (kits/ancients build.py CONTINUES); 88 Plymouth: the Arcube's kit shapes (plymQuadGeo)
ANC_FILES={}
for f in ANC_RUNTIME: ANC_FILES[f]=os.path.join(ANC,'src',f)
for f in ['20-textures.js','22-materials.js','68-mat-v5.js']:
    p=os.path.join(ANC,'src',f); ANC_FILES[f]=p if os.path.isfile(p) else J('core','materials',f)
GA=os.path.join(ANC,'targets','gatearc')
ANC_FILES['41a-gatearc-plan.js']=os.path.join(GA,'8av0-gatearc-plan.js')
ANC_FILES['41b-gatestacks-plan.js']=os.path.join(GA,'8av2-gatestacks-plan.js')
ANC_FILES['89e-gatearc-draw.js']=os.path.join(GA,'8av1-gatearc-draw.js')
ANC_FILES['89f-gatestacks-draw.js']=os.path.join(GA,'8av3-gatestacks-draw.js')
ANC_SUBST=[(r'\bREGISTER\b','ANC_REGISTER'),(r'\bREG\b','ANC_REG')]
SUBST={f:list(ANC_SUBST) for f in ANC_FILES}
SUBST['10-core.js']=ANC_SUBST+[(r'\bERRS\b','ANC_ERRS'),(r'\breportErr\b','ancReportErr'),(r'\bterrainH\b','ancTerrainH'),(r'\bTICKS\b','ANC_TICKS'),(r'\btick\b','ancTick'),(r'\bwindow\.onerror\b','window.ancOnerror')]
SUBST['69-mat-salvage.js']=ANC_SUBST+[(r'!!NIGHT\b','!!window.NIGHT')]
for f,p in ANC_FILES.items():
    if f in PATH: sys.exit('build.py: the Ancients kit\'s %s shadows a fragment of this page' % f)
    PATH[f]=p
# the host shell from core/host, the whole interface and the authoring tools. src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
# the shared atmosphere (copperglacier's set, without the snow cover's need of a snow line on the floor: it lies on the walls only)
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
PATH['89-atmos-c-hostbind.js']=J('core','atmos','host','89-atmos-c-hostbind.js')
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js','89-atmos-fx-snowcover.js']: PATH[f]=J('core','atmos','fx',f)
# core/water: the pond WATER.open, the river WATER.flow, the stack's fall WATER.fall and its pools (89w-host-water.js), with the final rebuild's ext
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['56-core-water-breakup.js','57-core-water-audit.js','58-core-water-mirror.js','60-core-water-fields.js','61-core-water-plume.js']:
    PATH.setdefault(f,J('core','water','ext',f))
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
CORE_MAT=['23-mat-record.js','25-matlib-host.js','26-matlib-bind.js']
for f in CORE_MAT: PATH.setdefault(f,J('core','materials','record',f))
sys.path.insert(0,J('tools','textures'))
import matlib_pack as _mp
# the packs as SIDECARS beside the page (dist/labyrinth.tex.<pack>.js): this kit's own (the ground, the knobs' rock, the flora's bark and cards)
# and the Ancients kit's (the Hall's skins). --inline-packs puts them in the page.
SIDE=None if '--inline-packs' in sys.argv else {}
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'labyrinth',side=SIDE),
         '88x-matlib-pack-ancients.js':_mp.fragment(ANC,'ancients',side=SIDE),khost.EDITS_JS:khost.edits_js(HERE,'labyrinth')}
# THE SCALE MODEL'S HEIGHTS round the site (tools/scale-model/model/data via smodel.page, build time): 26 x 26 cells of 2 km, the page's middle at
# the site's px; the land past the square follows them (45: modelH), so the north wall's toe and the neck stand where the model has them
def model_heights(px,py,half=12):
    sys.path.insert(0,J('tools','scale-model'))
    from smodel import page as _pg
    D=_pg.load(); E,_w=_pg.heights(D)
    i0,j0=int(round(px-.5))-half+1,int(round(py-.5))-half+1;n=2*half
    h=[round(float(E[j0+j,i0+i]),1) for j in range(n) for i in range(n)]
    return {'n':n,'cell':2000,'x0':(i0-px)*2000,'z0':(j0-py)*2000,'h':h,'site':[px,py],'from':'scale model '+_pg.version()}
_px,_py=SJ['site']
VIRTUAL['44m-host-model.js']='// ==================== the scale model\'s heights round the station (build.py model_heights; tools/scale-model, build time)\nconst MODEL_H='+json.dumps(model_heights(_px,_py),separators=(',',':'))+';\n'
# OTHER KITS a station asks for by name (station.json "kits"), each read in place and sealed in a closure of its own so its engine's globals
# (MAT, KIT, REG, TAU, terrainH...) meet neither this page's nor the Ancients runtime's: "kimr", the Kimr's pueblos (kits/kimr/kit_bundle.py:
# KMK; 86p-host-pueblo.js places SITE.pueblos). Station 1 never takes it: the Kimr keep away from the Hall
STATION_KITS=SJ.get('kits',[])
for k in STATION_KITS:
    if k!='kimr': sys.exit('build.py: station.json asks for kit %r; this page knows "kimr"' % k)
    sys.path.insert(0,J('kits','kimr'))
    import kit_bundle as _kmk
    _kjs,_kfs=_kmk.bundle()
    VIRTUAL['85k-host-kimr-bundle.js']='// ==================== the Kimr kit, sealed (kits/kimr/kit_bundle.py, build time): '+', '.join(_kfs)+'\n'+_kjs
    BSRC_EXTRA=[J(*f.split('/')) for f in _kfs]
for f in VIRTUAL: PATH[f]=None
BSRC.report([p for p in PATH.values() if p]+globals().get('BSRC_EXTRA',[]))
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf-8').read()
    for pat,rep in SUBST.get(f,[]): s=re.sub(pat,rep,s)
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and 'core-water' not in f and f not in ANC_FILES:
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'labyrinth.tex.js',prune=False)
open(os.path.join(DIST,OUT),'w',encoding='utf-8',newline='\n').write(html)
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
