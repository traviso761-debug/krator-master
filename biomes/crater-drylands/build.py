#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  python3 build.py                     station 1, the burn mosaic (src/ as it is) -> dist/crater-drylands.html
  python3 build.py --station <name>    a station (stations/<name>/: its host fragments replace src/'s of the same name; its
                                       station.json names the page, "out"): edge (station 3, the savannah edge) and salt (station 4, the
                                       salt floor); south (station 2) waits on biomes/savannarim (PLAN-STATIONS.md)

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (crater drylands species, fire history, trees, floor)
  45-host-stage     HOST binding (renderer, terrain, BIO.init) -- must run before 50
  80..98            HOST (the ground 84, the far field and horizon 87, build 88, fire, sky, air 89a, water 89w; core/host: camera,
                    loop, panel, probe, the whole interface)
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
# STATIONS (PLAN-STATIONS.md; the Throne's and Korona's pattern): python3 build.py --station <name> builds stations/<name>/, whose host
# fragments replace src/'s of the same name; its station.json names the page ("out"). Built: `edge`, `salt`; `south` waits (PLAN-STATIONS.md)
STN_ROOT=os.path.join(HERE,'stations')
if os.path.isdir(STN_ROOT):
    BSRC.variants([['--station',_s] for _s in sorted(os.listdir(STN_ROOT)) if os.path.isfile(os.path.join(STN_ROOT,_s,'station.json'))])   # every station's page
OUT=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith("--") else "crater-drylands.html"
STATION=None; STN={}
if '--station' in sys.argv:
    STATION=sys.argv[sys.argv.index('--station')+1]
    import json as _json
    STN_DIR=os.path.join(STN_ROOT,STATION)
    if not os.path.isfile(os.path.join(STN_DIR,'station.json')): sys.exit('build.py: no station %r (stations/<name>/station.json; PLAN-STATIONS.md)'%STATION)
    STN=_json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf-8'))
    OUT=STN['out']
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
# shared fragments from core/terrain, opt-in by name (core/README.md). The final rebuild (pair 12, 2026-11-09; PLAN-STATIONS.md, "Core adoption"):
# 43 KGROUND (the ground's five library layers, 84-host-ground.js), 44 KFAR (the crater floor past the map), 45 KHORIZON (the kopjes' horizon on the
# plain and on what stands on it), with their host halves below. No carve patches, no strata on station 1 (the tibasalt beds are S's, station `south`)
CORE_TERRAIN=['43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
CORE_T=os.path.join(ROOT,'core','terrain')
# the biome core from core/biome, the same way (core/README.md): one copy for every kit. The final rebuild adds 31b the leafset (BIO.leafOn and
# BIO.leafQ, which 20's BIO.cards calls: check_assembly's MISSING), 31j a limb's joint to its parent (BIO.flareJoin), 32 the variant pools and kin
# (the exchanges), 34 the octahedral impostors (the far living trees, 55), 38 KFIRE (the fire history: 52 is an adapter onto it, 2026-11-09),
# 41 the environmental fields (BIO.env), 44 the stage as data (the export)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','32-core-variants.js','34-core-impostor.js','38-core-fire.js',
            '40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
CORE_B=os.path.join(ROOT,'core','biome')
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.join(ROOT,'core','space')
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(STN_DIR,f)
    # station.json: "core" {fragment name: its path from the repo root} (more core modules), "kits" {slot: a fragment of another kit, from this
    # folder} (a kit read in place: the salt floor's abyssal savannah, the edge's swbay trees), "packs" {pack: that kit's folder} (its library),
    # "drop" [names] (a src/ fragment the station has no use for)
    for f,p in STN.get('core',{}).items(): PATH[f]=os.path.join(ROOT,p)
    for slot,p in STN.get('kits',{}).items(): PATH[slot]=os.path.normpath(os.path.join(HERE,p))
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
for f,h in (('44-core-farfield-draw.js','44-core-farfield-draw.js'),('45-core-horizon-shade.js','45-core-horizon-shade.js')):
    PATH.setdefault(f,os.path.join(CORE_T,'host',h))
# core/shadow (KSHADOW; the owner, 2026-11-03: toggleable, OFF by default: ?shadow=1 turns it on, src/88-host-build.js): the data half before the host's
PATH.setdefault('10-core-shadow.js',os.path.join(ROOT,'core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',os.path.join(ROOT,'core','shadow','host','12-core-shadow-host.js'))
# core/hazard (KHAZ): the air's dust reaches the walker through it (89a-host-atmos.js, the air's load)
PATH.setdefault('20-core-hazard.js',os.path.join(ROOT,'core','hazard','20-core-hazard.js'))
# core/hazard runs on the one clock (KTRAPS.cycle): without it the export's hazards section errors (2026-11-08, export-profile)
PATH.setdefault('37-core-traps.js',os.path.join(ROOT,'core','biome','37-core-traps.js'))
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE_B,f)
# core/rand and core/tags (core/tags/README.md), the way the core/furnish builds take them: with BIO.init({tags}) every item
# set, instance and registered volume the kit places is a core/tags record (core/biome/20-core-kit.js). A src/ copy wins.
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items():
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core',d,f)
# core/export (core/export/README.md): the krator-world container (EXPORT.world); the biome core fills its items, buckets,
# materials, textures and terrain (42-core-export.js), 43 its stage, the adapters its registry. A src/ copy wins.
CORE_EXPORT=['07-core-export.js','09-core-export-adapters.js']
for f in CORE_EXPORT:
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core','export',f)
for f in CORE_SPACE:
    if f not in PATH: PATH[f]=os.path.join(CORE_S,f)
# the host shell from core/host (core/host/README.md): the whole interface (khost.FULL: the shell, the inspector, marks, pictures, minimap, editor,
# cutaway and the core modules they read), the authoring tools (inspect, polygon, path). src/99-host-take.js hands it the page (KHOST.take).
sys.path.insert(0,os.path.join(ROOT,'core','host'))
import host as khost
CORE_HOST=khost.FULL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
# the shared atmosphere (core/atmos/README.md): its core, presets, export, the open-water wave field and the sky's light, bound once by
# 89a-host-atmos.js (ATMOS.bindHost); the weather (4) and its selector (9); the particles (3) and the wind's dust (3d) the air's load reads
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-3d-dust.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core','atmos',f)
PATH['89-atmos-c-hostbind.js']=os.path.join(ROOT,'core','atmos','host','89-atmos-c-hostbind.js')   # ATMOS.bindHost, in core/atmos/host/ so the kits that take core/atmos whole are not changed
# core/water (core/water/README.md; 2026-10-25, phase 4): the seep as a WATER.still in 89w-host-water.js. Explicit paths.
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core','water',f)
# the final rebuild's water ext, by path (tools/fragment_needs.json has their order): breakup (56: the seep's glint), the audit (57), the shore's
# fields (60: the flora's and the ground's wet band from the water the eye sees). No reflections switch (58): the seep is 23 m across
for f in ['56-core-water-breakup.js','57-core-water-audit.js','60-core-water-fields.js']:
    PATH.setdefault(f,os.path.join(ROOT,'core','water','ext',f))
# the shared sky (core/atmos/SKY-PLAN.md section 9, 2026-10-26): the sky's model, presets and shader, its host and the biome call
# (src/89-host-sky.js: ATMOS.skyBiome); they replace the painted dome
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']:
    PATH[f]=os.path.join(ROOT,'core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']:   # e-weatherhost: ATMOS.bindWeather (2026-10-26)
    PATH[f]=os.path.join(ROOT,'core','atmos','host',f)
# the final rebuild's air (BACKPORT.md section 1, and the row's dust): height fog (R1), the rain occlusion map (R10), lightning, the air's load
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js','89-atmos-fx-airload.js','89-atmos-fx-dustseason.js']:   # dustseason: the dry season drives the dust (2026-11-09)
    PATH[f]=os.path.join(ROOT,'core','atmos','fx',f)
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
# the pack, from tools/textures/matlib_pack.py (the shared generator: it carries a card sheet's cell, which this kit's own copy dropped), in the page.
# Named -host- (the FORBID scan skips it: base64 may spell a forbidden word) and numbered 44: the host stage (45) reads it
sys.path.insert(0,os.path.join(ROOT,'tools','textures'))
import matlib_pack as _mp
sys.path.insert(0,os.path.join(ROOT,'kits','fauna'))
import fauna_bundle as _fb
def _mp_fams(d):
    import json as _j
    pj=os.path.join(d,'tex','pack.json')
    return sorted(_j.load(open(pj,encoding='utf-8')).get('families',{})) if os.path.isfile(pj) else []
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'craterdry'),
         **{'44b-host-matlib-pack-%s.js'%_pn:_mp.fragment(os.path.normpath(os.path.join(HERE,_pd)),_pn,exclude=[f for f in _mp_fams(os.path.normpath(os.path.join(HERE,_pd)))
             if (f not in STN.get('packOnly',{}).get(_pn,[]) and f.startswith(('ground','tower','jetty'))) or (_pn in STN.get('packOnly',{}) and f not in STN['packOnly'][_pn])])
            for _pn,_pd in STN.get('packs',{}).items()},   # a station's other kits' packs, without their ground layers; "packOnly" {pack: [families]} keeps only those
         khost.EDITS_JS:khost.edits_js(HERE,'crater-drylands'),   # the host's edit layer (core/host FULL)
         # kits/fauna's groups that hold this biome's animals (KratorFauna: the ash runner, the salamander, the burn-hawk, the hot-spring axolotl,
         # the char beetle, the Scyvoi's mounts, the wild steppe's), for the editor's fauna mode (99-host-take.js; sedesert's way); no texture pack,
         # as sedesert's. The hyperjungle group is needed by the wild one (its species call faHiMix at load: a page without it threw there)
         '39-host-fauna.js':_fb.bundle(['wild','ash','livestock','mounts','hyperjungle'],tex=False)}
for f in VIRTUAL: PATH[f]=None
for f in STN.get('drop',[]): PATH.pop(f,None)
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
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf-8',newline='\n').write(html)
# THE N/S SPLIT (PLAN-STATIONS.md, the owner 2026-10-27): station 1 is crater drylands N's page, dist/crater-drylands-n.html; the old name is
# kept as a copy of it until its readers (the gallery, verify.py, the baseline) point at -n. S's page is --station south (crater-drylands-s.html)
if not STATION and OUT=='crater-drylands.html': open(os.path.join(DIST,'crater-drylands-n.html'),'w',encoding='utf-8',newline='\n').write(html)
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
