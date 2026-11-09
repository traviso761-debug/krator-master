#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: FARSIDE, the crater's one ocean shore, where the sea's plants
have come ashore (PLAN.md).

Stations, like Korona's and the Throne's: each is its own showcase page from the same kit.
  python3 build.py                     station 1, FARPORT'S KELP COAST: src/ as it is -> dist/farside.html
  python3 build.py --station front     station 2, THE FRONT: stations/front/'s host fragments replace src/'s of the same name;
                                       its station.json names the page ("out")
  python3 build.py --station strand    station 3, THE STRAND
  python3 build.py --station cloud     station 4, THE FOG BELT
  python3 build.py --all               all four
  python3 build.py --inline-packs      the texture packs inside the page (else sidecars dist/farside.tex.<pack>.js)

  00-head.html        page shell, opens <script>
  07..44              the shared cores: core/export, rand, biome, space, tags, the material record and the packs (44*)
  45-host-stage       HOST: renderer, light, the station's landform and its say (STAGE: the coast, the rise, the fields)
  47-host-land        HOST: terrainH, the fields, the ground mesh, the far country, BIO.init (the same for every station)
  49a..49d            the NWLOWLANDS kit, read in place in its own registry: the native forest at the front and inland
  50..70              THE KIT (FARSIDE): species, the sea flora's builders, the floor, the dressing, build
  86-host-works       HOST: the people's works (kelp and lime kilns, wrack heaps, terraces, folds, racks), Eternian furniture
  88-host-build       HOST: the build order
  89-atmos/water      CORE: core/atmos (the shared sky, the waves, the sky light, the weather) and core/water
  89a/89s/89w         HOST: the atmosphere bound, the sky at the station's pixel, the sea and the streams on core/water
  90..98              HOST (core/host: camera, loop, panel, probe, the authoring tools)
  99-host-take        the page handed to core/host
  99-tail.html        closes <script>

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); build.py greps for the
forbidden names so a kit fragment cannot quietly grow a dependency on one world's engine.
"""
import json, os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', os.path.dirname(os.path.abspath(__file__))]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


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
if '--all' in sys.argv:
    rest=[a for a in sys.argv[1:] if a!='--all']
    rc=subprocess.call([sys.executable,__file__]+rest)
    for st in sorted(os.listdir(os.path.join(HERE,'stations'))):
        if os.path.isfile(os.path.join(HERE,'stations',st,'station.json')):
            rc=subprocess.call([sys.executable,__file__,'--station',st,'--no-checks']+rest) or rc
    sys.exit(rc)
OUT='farside.html'; STATION=None; STN={}
if '--station' in sys.argv:
    STATION=sys.argv[sys.argv.index('--station')+1]
    STN_DIR=os.path.join(HERE,'stations',STATION)
    STN=json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf-8'))
    OUT=STN['out']
core=lambda *p: os.path.normpath(os.path.join(ROOT,'core',*p))
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(STN_DIR,f)
# the biome core (core/biome): one copy for every kit. 32: the variants; 44: the stage the export carries. The final rebuild (pair 10,
# 2026-11-04; BACKPORT.md's universal set): 31j a limb's joint to its parent (BIO.flareJoin: the snags' limbs, 55), 34 the octahedral
# impostors (the native forest's far trees: nwlowlands' 55 makes them when the fragment is on the page)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31-core-dither.js','31j-core-joint.js','32-core-variants.js','34-core-impostor.js','40-core-place.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=core('biome',f)
# core/terrain (the final rebuild): 43 KGROUND (the ground's seven library layers, hex-tiled and height-blended, 47; its 'sand' kind on the
# strand), 44 KFAR (the far country, 47), 45 KHORIZON (its shadows on the ground and, after the bake, on the flora, 88). A src/ copy wins.
CORE_TERRAIN=['43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,core('terrain',f))
for f in ['44-core-farfield-draw.js','45-core-horizon-shade.js']: PATH.setdefault(f,core('terrain','host',f))
# core/shadow (KSHADOW; the owner, 2026-11-03: toggleable, OFF at page load): attached off on core's own switch (88, 99); core's 'shadows' button or ?shadow=1 at load
PATH.setdefault('10-core-shadow.js',core('shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',core('shadow','host','12-core-shadow-host.js'))
# core/rand and core/tags: with BIO.init({tags}) every item set, instance and registered volume is a core/tags record
for f,d in {'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}.items():
    if f not in PATH: PATH[f]=core(d,f)
for f in ['07-core-export.js','09-core-export-adapters.js']:
    if f not in PATH: PATH[f]=core('export',f)
# THE NATIVE FOREST, read in place (biomes/WORLD.md: several kits on one page): the north-western lowlands' kit in its own
# registry; it grows where the host's mask lets it (47-host-land.js: off the invaded coast). Its look flags (NWLOW_LOOK) stay off
# for a reader (its PLAN.md, "Core adoption"); its 52 (the library's lobes) is not read: Farside textures the lobes itself (88)
NWL=os.path.normpath(os.path.join(HERE,'..','nwlowlands'))
KITS={'49a-nwlow-species.js':'src/50-biome-nwlowlands-species.js','49b-nwlow-trees.js':'src/55-biome-nwlowlands-trees.js',
      '49c-nwlow-floor.js':'src/60-biome-nwlowlands-floor.js','49d-nwlow-build.js':'src/70-biome-nwlowlands.js'}
for slot,p in KITS.items(): PATH[slot]=os.path.join(NWL,p)
# the host shell (core/host) with the authoring tools (the polygon tool); core/space rides with it
sys.path.insert(0,core('host'))
import host as khost
CORE_HOST=khost.SHELL+['94-host-polytool.js','20-core-space.js']
khost.resolve(PATH,CORE_HOST)
# the material library (core/materials/record) and the packs: this kit's (tex/, from materials.json) and the native
# forest's (biomes/nwlowlands/tex), as sidecars beside the page shared by every station; --inline-packs puts them inside
for f in ('23-mat-record.js','25-matlib-host.js'):
    if f not in PATH: PATH[f]=core('materials','record',f)
sys.path.insert(0,os.path.join(ROOT,'tools','textures'))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'farside',side=SIDE,own=True),
         '44b-host-matlib-pack-nwlowlands.js':_mp.fragment(NWL,'nwlowlands',side=SIDE)}
for f in VIRTUAL: PATH[f]=None
# core/atmos: its core, presets, the weather and its selector, the export, the wave field and the sky light; ATMOS.bindHost
# and ATMOS.bindWeather from core/atmos/host (89a-host-atmos.js calls both); the shared sky (SKY-PLAN.md S1: 89s-host-sky.js).
# The final rebuild's air: height fog (R1: the fog belt, 89s), the rain occlusion map (R10) and the branched lightning
for f in ['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-4-weather.js','89-atmos-8-export.js','89-atmos-9-host.js','89-atmos-a-waves.js','89-atmos-b-skylight.js']:
    if f not in PATH: PATH[f]=core('atmos',f)
for f in ['89-atmos-c-hostbind.js','89-atmos-e-weatherhost.js','89-atmos-h-skyhost.js','89-atmos-j-heightfog.js']:
    PATH[f]=core('atmos','host',f)
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']:
    PATH[f]=core('atmos','sky',f)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']:
    PATH[f]=core('atmos','fx',f)
# core/water: the sea (an open surface with a shore grid and a tint field) and the streams (flows). The final rebuild's ext: 57 the audit
# (the water's edges, 99's check), 58 the reflections switch (OFF at load: the saline lagoon, station 1), 58 the shore from the ground
# (the lagoon's and the harbour's masks), 61 the plume (Ling-Ma's silt out of the harbour mouth on a current, station 1)
for f in ['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']:
    if f not in PATH: PATH[f]=core('water',f)
for f,src in [('57-core-water-audit.js','57-core-water-audit.js'),('58-core-water-mirror.js','58-core-water-mirror.js'),
              ('58-core-water-shore.js','58-core-water-shore.js'),('61-core-water-plume.js','61-core-water-plume.js')]:
    PATH.setdefault(f,core('water','ext',src))
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)); sys.exit(1)
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
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'farside.tex.js',prune=False)
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
