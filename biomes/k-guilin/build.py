#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: k-guilin, the Hykkousoi hinterlands (PLAN.md, NOTES.md):
the inland tower karst behind the NW bay, forked from biomes/guilin (Earth's South China karst, frozen as a reference).

  00-head.html        page shell, opens <script>
  10..44              BIOME CORE (core/biome), core/rand, core/tags, core/space, core/export, the material library;
                      core/terrain/37-core-stacks.js (KSTACKS: the towers, the fengcong's base, the stone forest's blades)
  41-hyperjungle-globals  the core's helpers as globals (TAU, clamp, smooth, fbm...), read in place from biomes/hyperjungle
  45-host-stage       HOST: renderer, light, the lake, the plain, the wadi, the rock as KSTACKS records
  46-biome-kguilin    THE KIT's layout (data): zones on the rock, the plain and the lake's shore, the paddies, the cliff points
  47-host-land        HOST: terrainH, the water, the fields, the ground and rock meshes, BIO.init
  48n0..48n9          biomes/nwbay's species, trees and variants READ IN PLACE in their own registry (BIO.kit('nwbay') in
                      48n0, BIO.kitEnd(NWBAY) in 48n9, both this kit's): the borrowed species (PLAN.md section 4)
  50..79              THE KIT: species, trees (its own and the borrowed ones placed by its zones), cliff dress, floor, build
  88-host-build       HOST: the build order
  89-atmos-*          core/atmos: core, presets, weather and its selector, export, waves, skylight, the shared sky
  89a-host-atmos      HOST: ATMOS.bindHost
  89s-host-sky        HOST: the shared sky at the page's pixel on the scale model; the cloud shade; the weather (ATMOS.bindWeather)
  89w-host-water      HOST: the lake, the wadi, the paddies and the pond on core/water (records made in 47)
  90..99              HOST (core/host's whole interface; core/edits, core/minimap)
  99-host-take        the page handed to core/host
  99-tail.html        closes <script>

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
# A STATION (the final rebuild, pair 13: the universal set's --station; python3 build.py --station <name> -> dist/k-guilin-<name>.html):
# stations/<name>/'s numbered fragments are added to src/'s (a name in both is the station's), and its station.json may name more core
# ("core": {"<fragment name>": "<path from the repo root>"}) or drop one of src/'s ("drop": [names]). k-guilin has no station yet
# (PLAN.md section 7: none planned); the flag is here so a station is a folder, not a build change.
import json as _json
_STD=os.path.join(HERE,'stations')
BSRC.variants([['--station',_s] for _s in (sorted(os.listdir(_STD)) if os.path.isdir(_STD) else []) if os.path.isdir(os.path.join(_STD,_s))])   # every station's page
_args=sys.argv[1:]
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
_args=[a for a in _args if not a.startswith('--')]
OUT=_args[0] if _args else ('k-guilin-%s.html'%STATION if STATION else 'k-guilin.html')
SJ={}
if STATION:
    _sd=os.path.join(_STD,STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    _sj=os.path.join(_sd,'station.json')
    if os.path.isfile(_sj):
        with open(_sj,encoding='utf-8') as _fh: SJ=_json.load(_fh)
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# core/terrain: KSTACKS (37: the towers, the fengcong's base and the stone forest); the final rebuild (pair 13, 2026-11-09; PLAN.md, "Core adoption"):
# 35 KSTRATA (the limestone's beds on the walls, its shader keyed 35z after it: Span's lesson), 43 KGROUND (the plain's layers), 45 KHORIZON
# (the towers' shadows on the plain at a low sun). Not taken: KFAR (44: the page draws its own karst beyond, 47, and the lake runs on north) and
# KSTACKS.contour (37b: the cliff scrub, figs and orchids are placed on the records' walls, so a contoured wall would leave them off it;
# KNOWN_ISSUES.md, the pair-13 section)
CORE_TERRAIN=['35-core-strata.js','37-core-stacks.js','43-core-ground.js','45-core-horizon.js']
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome (core/README.md): one copy for every kit
# The final rebuild (pair 13, 2026-11-09; PLAN.md, "Core adoption"): 31b leaves on stems (BIO.leafOn, leafQ: the core's opt-in leaf path),
# 31j a limb's joint to its parent (BIO.flareJoin: nwbay's limbs, NWBAY_LOOK.joints), 32 the variant pools and kin, 33 the fungoid parts (nwbay's
# species), 34 the octahedral impostors (this kit's far trees and nwbay's: BIO.impostor*), 41 the environmental fields (BIO.env); 44 KSTAGE
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js',
 '40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
# OTHER KITS read in place (biomes/WORLD.md): the hyperjungle's globals (the core's helpers by their old names); biomes/nwbay's
# species, trees and variants (the owner, 2026-10-26: read in place, so k-guilin follows nwbay), in the registry this kit opens
# for them (src/48n0-kguilin-nwbay-open.js: BIO.kit('nwbay'); src/48n9-kguilin-nwbay-close.js: BIO.kitEnd(NWBAY)), after this
# page's BIO.init (47) and before this kit (50), as biomes/ringisles reads its kits
HJ=os.path.normpath(os.path.join(HERE,'..','hyperjungle'))
NWB=os.path.normpath(os.path.join(HERE,'..','nwbay'))
KITS={'41-hyperjungle-globals.js':os.path.join(HJ,'src/41-hyperjungle-globals.js'),
      '48n1-nwbay-species.js':os.path.join(NWB,'src/50-biome-nwbay-species.js'),'48n2-nwbay-trees.js':os.path.join(NWB,'src/55-biome-nwbay-trees.js'),
      '48n3-nwbay-variants.js':os.path.join(NWB,'src/56-biome-nwbay-variants.js')}
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
    for f,pth in SJ.get('core',{}).items(): PATH.setdefault(f,J(pth))
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
# KSTRATA's three.js half keyed 35z (it reads KSTRATA when it loads), KHORIZON's
PATH.setdefault('35z-core-strata-shade.js',os.path.join(CORE_T,'host','35-core-strata-shade.js'))
PATH.setdefault('45-core-horizon-shade.js',os.path.join(CORE_T,'host','45-core-horizon-shade.js'))
# core/shadow (KSHADOW; the owner, 2026-11-03: toggleable, OFF by default: ?shadow=1 attaches it, src/88-host-build.js)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
for slot,p in KITS.items(): PATH[slot]=p
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
# core/water (core/water/README.md): the Li River a flow line, the paddies and the pond still water (records in
# 47-host-land.js, drawn in 89w-host-water.js) on core/atmos's clock, wave chunk and sky light; 8-export so the export's atmos section fills
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water',f))
# the final rebuild's water ext: the audit (57), the reflections switch (58: off at load), by path (tools/fragment_needs.json orders them)
for f in ['57-core-water-audit.js','58-core-water-mirror.js']: PATH.setdefault(f,J('core','water','ext',f))
# core/atmos: the core, presets, the weather (4) and its selector (9), the export, the waves, the skylight; ATMOS.bindHost,
# ATMOS.bindWeather and the shared sky's host (core/atmos/host) and the shared sky (core/atmos/sky, SKY-PLAN.md step S1), as
# biomes/swbay and biomes/nwouterwall take them: src/89a-host-atmos.js binds, src/89s-host-sky.js draws the sky and the weather
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-4-weather.js','89-atmos-8-export.js','89-atmos-9-host.js','89-atmos-a-waves.js','89-atmos-b-skylight.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
for f in ['89-atmos-c-hostbind.js','89-atmos-e-weatherhost.js','89-atmos-h-skyhost.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky',f))
# the final rebuild's air (src/89a-host-atmos.js): height fog with the valley mist (R1: the sky's chunk above and its host), the rain occlusion
# map (R10) and the branched lightning (the weather's storm)
PATH['89-atmos-j-heightfog.js']=J('core','atmos','host','89-atmos-j-heightfog.js')
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']: PATH[f]=J('core','atmos','fx',f)
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock (core/clock), the panel and
# the probe. src/99-host-take.js hands it the page (KHOST.take). A local src/ copy with the same name wins (KNOWN_ISSUES.md).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','core','host')))
import host as khost
CORE_HOST=khost.FULL   # the whole interface (core/host/README.md): the record-driven inspector, marks (which supersede the polygon tool), pictures, the minimap, the editor, the cutaway
khost.resolve(PATH,CORE_HOST)
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record, PLAN.md): the record and its browser half, and the packs of the library
# textures each kit's materials.json names, generated from the committed tex/ (tools/textures/pack.py). Without a
# tex/pack.json a pack is empty and its kit keeps its procedural textures (as in the open world, which carries none).
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
CORE_M=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record'))
for f in CORE_MAT:
    if f not in PATH: PATH[f]=os.path.join(CORE_M,f)
# SIDECAR PACKS (tools/textures/matlib_pack.py): the maps go in files beside the page (dist/k-guilin.tex.js), loaded by plain <script src> tags ahead of the page's code, so the page opened from
# disk keeps its textures. --inline-packs puts them back in the page (one self-contained file).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
# named -host- (the FORBID scan skips it: base64 may spell a forbidden word) and numbered 44: the host stage (45) reads it
# the borrowed species' maps: nwbay's committed pack read in place (its tex/; not its own-page families), keyed 'nwbay' as its
# species file asks KMAT for them
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'kguilin',side=SIDE),'44-host-matlib-pack-nwbay.js':_mp.fragment(NWB,'nwbay',side=SIDE),
         khost.EDITS_JS:khost.edits_js(HERE,'kguilin')}   # the page's edits (edits.json or this browser's draft)
for f in VIRTUAL: PATH[f]=None
for f in SJ.get('drop',[]): PATH.pop(f,None)   # a station's dropped fragments
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and not (PATH[f] and os.sep+'core'+os.sep in os.path.normpath(PATH[f])):   # the kit's own fragments (core/ is scanned by its own tests)
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
# a station's page shares the main page's sidecars: it writes them again, identical, and prunes nothing
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'k-guilin.tex.js',prune=not STATION)
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
