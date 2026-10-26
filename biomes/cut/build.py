#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the Cut, the eigenweapon's bowl (PLAN.md).

Stations, like the Throne's and Korona's: each is its own showcase page from the same kit (PLAN.md section 8).
  python3 build.py                     station 1, THE FLOOR (by the upper lake): src/ as it is -> dist/cut.html
  python3 build.py --station wall      station 2, THE WALL: stations/wall/'s host fragments replace src/'s of the same name
  python3 build.py --station face      station 3, THE CUT FACE
  (a station's station.json names its page ("out"), the kits it reads in place ("kits") and their packs ("packs"))

  00-head.html        page shell, opens <script>
  07..44              core/export, core/rand, BIOME CORE (core/biome), core/tags, core/space, the material library and the
                      packs (cut, and each read-in kit's as a sidecar), core/terrain (KRELIEF, carve), core/water
  41-cut-field        THE CUT's data side: the bowl on the 4.22 survey, the field, the warp ([G data]; tests/test-cut.js)
  45-host-stage       HOST: the station's say (STAGE): its site, ground, zones, fields, layers, views
  46-biome-cut-warp   the warp laid on a kit read in place (CUT.warpKit), as it builds
  47-host-land        HOST: renderer, light, the ground mesh, BIO.init
  48a..48d            the NWLOWLANDS kit, read in place (the shore's, the creek's and the walls' trees)
  48e..48h            the NHIGHLANDS kit, read in place (station 3: the lip's forest), from station.json
  50..70              THE KIT (CUT): the natives, the camp, build
  88-host-build       HOST: the build order (the natives, then the read-in kits under their masks, warped; one bake)
  89a, 89s, 89t, 89w  HOST: core/atmos bound; the shared sky (the walls as ridges cast from the bowl); the weather; the lake
  90..98              HOST (core/host: camera, loop, panel, probe, the authoring tools)
  99-host-take        the page handed to core/host
  99-tail.html        closes <script>

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); build.py greps for the
forbidden names so a kit fragment cannot quietly grow a dependency on one world's engine.
"""
import os, re, subprocess, sys, json

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
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
CORE=os.path.normpath(os.path.join(HERE,'..','..','core'))
OUT=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith("--") else "cut.html"
STATION=None;STN={}
if '--station' in sys.argv:
    STATION=sys.argv[sys.argv.index('--station')+1]
    STN_DIR=os.path.join(HERE,'stations',STATION)
    STN=json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf-8'))
    OUT=STN['out']
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# core/terrain: KRELIEF (the face's relief stamp, station 3) and the carve; listed by name
CORE_TERRAIN=['36-core-carve.js','38-core-relief.js']
# the biome core from core/biome (core/README.md): one copy for every kit
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','32-core-variants.js','40-core-place.js','42-core-export.js','43-core-export-host.js']
CORE_SPACE=['20-core-space.js']
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page): nwlowlands on every station (PLAN.md section 4: the
# floor's shore and creek, the walls' columns, the lip's conifers), slotted before this kit's fragments; a station adds more
# (nhighlands on the face) through its station.json "kits"
NW=os.path.normpath(os.path.join(HERE,'..','nwlowlands'))
KITS={'48a-nwlow-species.js':(NW,'src/50-biome-nwlowlands-species.js'),'48b-nwlow-trees.js':(NW,'src/55-biome-nwlowlands-trees.js'),
      '48c-nwlow-floor.js':(NW,'src/60-biome-nwlowlands-floor.js'),'48d-nwlow-build.js':(NW,'src/70-biome-nwlowlands.js')}
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE,'terrain',f)
if STATION:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(STN_DIR,f)
    for slot,p in STN.get('kits',{}).items(): PATH[slot]=os.path.normpath(os.path.join(HERE,p))
for slot,(d,p) in KITS.items(): PATH[slot]=os.path.join(d,p)
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE,'biome',f)
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume is a record
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items():
    if f not in PATH: PATH[f]=os.path.join(CORE,d,f)
CORE_EXPORT=['07-core-export.js','09-core-export-adapters.js']
for f in CORE_EXPORT:
    if f not in PATH: PATH[f]=os.path.join(CORE,'export',f)
for f in CORE_SPACE:
    if f not in PATH: PATH[f]=os.path.join(CORE,'space',f)
# core/water (core/water/README.md): the lake (WATER.open; its far reach a second open surface), a station's still pools
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.join(CORE,'water',f)
# core/atmos: the core, presets, export, waves, skylight, the weather (4) and its selector (9); the host binding, the weather
# binding (ATMOS.bindWeather) and the shared sky (SKY-PLAN.md S1: model, presets, shader, host), by path
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-4-weather.js','89-atmos-8-export.js','89-atmos-9-host.js','89-atmos-a-waves.js','89-atmos-b-skylight.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.join(CORE,'atmos',f)
for f in ['89-atmos-c-hostbind.js','89-atmos-e-weatherhost.js','89-atmos-h-skyhost.js']:
    PATH[f]=os.path.join(CORE,'atmos','host',f)
# snow that lies (core/atmos/fx): the cold station's weather binding builds it while it snows (ATMOS.bindWeather climate.cold)
PATH['89-atmos-fx-snowcover.js']=os.path.join(CORE,'atmos','fx','89-atmos-fx-snowcover.js')
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js']:
    PATH[f]=os.path.join(CORE,'atmos','sky',f)
# the host shell from core/host (core/host/README.md). src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,os.path.join(CORE,'host'))
import host as khost
CORE_HOST=khost.SHELL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record) and the packs: this kit's (tex/, from materials.json by tools/textures/pack.py)
# and each read-in kit's (its own tex/, without its ground and tower layers), as SIDECARS beside the page
# (dist/cut.tex.<pack>.js, shared by every station). --inline-packs puts them in the page.
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
for f in CORE_MAT:
    if f not in PATH: PATH[f]=os.path.join(CORE,'materials','record',f)
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'cut',side=SIDE)}
PACKS=dict({'nwlowlands':'../nwlowlands'},**STN.get('packs',{}))
for _k,(_pn,_pd) in enumerate(sorted(PACKS.items())):
    _pj=os.path.join(HERE,_pd,'tex','pack.json')
    _ex=[f for f in (sorted(json.load(open(_pj,encoding='utf-8')).get('families',{})) if os.path.isfile(_pj) else []) if f.startswith('ground') or f.startswith('tower') or f.startswith('jetty')]
    VIRTUAL['44%s-host-matlib-pack-%s.js'%('bcdefg'[_k],_pn)]=_mp.fragment(os.path.normpath(os.path.join(HERE,_pd)),_pn,exclude=_ex,side=SIDE)
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf-8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f:
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'cut.tex.js',prune=False)
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
