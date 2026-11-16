#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (eastern high desert species, trees, floor, dressing)
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
OUT=sys.argv[1] if len(sys.argv)>1 else "sedesert.html"
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# shared fragments from core/terrain, opt-in by name (core/README.md): '30-core-field.js' gives KFIELD, the baked
# heightmap the ground is read from; '36-core-carve.js' gives BIO.carve, overhangs on the heightfield. A local src/
# copy with the same name wins.
CORE_TERRAIN=['30-core-field.js','31-core-field-brush.js','36-core-carve.js','37-core-stacks.js','38-core-relief.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']   # the final rebuild (2026-10-27): 37 KSTACKS (the domes), 38 KRELIEF (the talus, the wadi, the pavement), 44 KFAR (the far country)   # 43 KGROUND: the ground's library layers; 45 KHORIZON: its terrain shadows (src/45-host-stage.js)   # 31: the ground brushes (core/host's editor, step 4)
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome, the same way (core/README.md): one copy for every kit.
# A kit that lists nothing keeps its own src/ copies and builds as before.
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','32-core-variants.js','34-core-impostor.js','35-core-anim.js','40-core-place.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
# core/terrain's three.js side, by explicit path (core/terrain/host/): KHORIZON.shade, the horizon's shading
PATH.setdefault('45-core-horizon-shade.js',os.path.join(CORE_T,'host','45-core-horizon-shade.js'))
PATH.setdefault('44-core-farfield-draw.js',os.path.join(CORE_T,'host','44-core-farfield-draw.js'))
# KSTRATA (core/terrain 35 and its shader, the final rebuild 2026-10-27): the kit's own src/35-core-strata.js stays for the builds that read it in
# place (ringisles, verge, shade, the open worlds: KNOWN_ISSUES.md) but this page takes the core's, whose BIO.strata with no recipe is the same shader
PATH['35-core-strata.js']=os.path.join(CORE_T,'35-core-strata.js')
PATH.setdefault('35s-core-strata-shade.js',os.path.join(CORE_T,'host','35-core-strata-shade.js'))   # keyed 35s: it reads KSTRATA when it loads
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
# core/water (core/water/README.md): the pond as a WATER.open surface (45-host-stage.js, drawn by the page itself), and
# since 2026-10-13 the river, the cataract and its plunge pool (records in 45, drawn by core/water in 89w-host-water.js on
# core/atmos's clock, wave chunk and sky light). A src/ copy wins.
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water',f))
# 54/54b (the final rebuild, 2026-10-27): the looks (the Bowl's brine) and the pan (its shore's salt crust); by path, after 22 and 51
PATH['22b-core-water-kinds-ext.js']=os.path.normpath(os.path.join(HERE,'..','..','core','water','ext','54-core-water-kinds-ext.js'))
PATH['51b-core-water-kinds-ext-draw.js']=os.path.normpath(os.path.join(HERE,'..','..','core','water','ext','54b-core-water-kinds-ext-draw.js'))
# 55/55b the Bowl delta's apex as one water (WATER.confluence), 56 the ribbons' ripple breakup (WATER.breakupFlows); after the top-level core/water
for f in ['55-core-water-confluence.js','55b-core-water-confluence-draw.js','56-core-water-breakup.js']:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water','ext',f))
# core/hazard (KHAZ; the final rebuild 2026-10-27): the dust storm's fields (dust, alkali, visibility: 89x-host-air.js) reach the walker through it
PATH.setdefault('20-core-hazard.js',os.path.normpath(os.path.join(HERE,'..','..','core','hazard','20-core-hazard.js')))
PATH.setdefault('37-core-traps.js',os.path.normpath(os.path.join(HERE,'..','..','core','biome','37-core-traps.js')))   # KTRAPS.cycle, the one clock core/hazard's export reads
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']   # 8-export: ATMOS.export, so the export's atmos section fills (its profile requires it)
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock (core/clock), the panel and
# the probe. src/99-host-take.js hands it the page (KHOST.take). A local src/ copy with the same name wins (KNOWN_ISSUES.md).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','core','host')))
import host as khost
CORE_HOST=khost.FULL   # the whole interface (step 4: fauna mode and the ground brushes on KFIELD; core/host/README.md)
khost.resolve(PATH,CORE_HOST)
# the material library (core/materials/record: KMAT and the loader) and the GENERATED pack of the textures materials.json
# names (tools/textures/matlib_pack.py from tex/, written by tools/textures/pack.py). Without tex/pack.json the pack is
# empty and the kit keeps its procedural textures (as it does in the open world, which carries no pack).
for f in ('23-mat-record.js','25-matlib-host.js'):
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record',f))
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack
# kits/fauna's desert group (KratorFauna: the kit's copies of this biome's animals and the rest of the desert's), for the editor's
# fauna mode (src/99-host-take.js), and the page's edits (core/host/host.py edits_js: edits.json or this browser's draft)
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','kits','fauna')))
import fauna_bundle
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'sedesert'),'39-host-fauna.js':fauna_bundle.bundle(['desert'],tex=False),
         khost.EDITS_JS:khost.edits_js(HERE,'sedesert')}
# THE NEIGHBOURS' SPECIES, read in place (EXCHANGES.md, 2026-10-27: sedesert as receiver; src/87-host-kin.js grows them by BIO.kin), the kit's
# own page only: eastabyss's jade shrub on the Abyss floor under the cataract. Its species and tree builders slotted after the host stage (45)
# and before this kit (50, which reseeds before it paints), in its own registry, closed by a one-line kitEnd; its pack only the families the
# jade draws with. The other rows wait for their vendors' turns (KNOWN_ISSUES.md)
import json as _json
NEIGH={} if '--station' in sys.argv else {'eastabyss':(['50-biome-eastabyss-species.js','55-biome-eastabyss-trees.js'],'EASTABYSS',['bark2','paddle','bloom'])}
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(NEIGH.items())):
    _d=os.path.normpath(os.path.join(HERE,'..',_k));_c='abcdefgh'[_i]
    for _j,_f in enumerate(_fs): PATH['47%s%d-%s'%(_c,_j,_f)]=os.path.join(_d,'src',_f)
    VIRTUAL['47%s9-%s-end.js'%(_c,_k)]=chr(10)+"BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)"%(_k,_api)+chr(10)
    _pj=os.path.join(_d,'tex','pack.json')
    with open(_pj,encoding='utf-8') as _fh: _fam=sorted(_json.load(_fh).get('families',{})) if os.path.isfile(_pj) else []
    VIRTUAL['44%s-host-matlib-pack-%s.js'%(_c,_k)]=matlib_pack.fragment(_d,_k,exclude=[f for f in _fam if f not in _keep])
for f in VIRTUAL: PATH[f]=None
# STATIONS (PLAN-STATIONS.md; laid out as the Throne's): python3 build.py --station bowl builds stations/bowl/ into the page
# its station.json names ("out"). The station's .js and .html files replace src/'s of the same name or add to them; "drop"
# removes src/ fragments it has no use for; "core" adds core files by path from core/; its own textures are a second pack
# (stations/<name>/materials.json -> tools/textures/pack.py -> stations/<name>/tex/, the pack named by "pack"). Without
# --station nothing here runs and the kit's own page is built as before.
if '--station' in sys.argv:
    import json as _json
    STATION=sys.argv[sys.argv.index('--station')+1]
    STN_DIR=os.path.join(HERE,'stations',STATION)
    STN=_json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf-8'))
    OUT=STN['out']
    # "base": another station whose files and settings this one starts from (its own files then replace them by name)
    CHAIN=[]
    _d,_s=STN_DIR,STN
    while True:
        CHAIN.insert(0,(_d,_s))
        if not _s.get('base'): break
        _d=os.path.join(HERE,'stations',_s['base']);_s=_json.load(open(os.path.join(_d,'station.json'),encoding='utf-8'))
    for _d,_s in CHAIN:
        for f in _s.get('drop',[]): PATH.pop(f,None)
        for f in os.listdir(_d):
            if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(_d,f)
        for f in _s.get('core',[]): PATH[os.path.basename(f)]=os.path.normpath(os.path.join(HERE,'..','..','core',f))
        # "kits": other kits' fragments read in place, {slot name on this page: path from this folder} (as the Throne's stations)
        for slot,p in _s.get('kits',{}).items(): PATH[slot]=os.path.normpath(os.path.join(HERE,p))
        if _s.get('pack'):
            VIRTUAL['44-host-matlib-pack.js']=VIRTUAL['44-host-matlib-pack.js']+matlib_pack.fragment(_d,_s['pack'])
        # "packs": other kits' library packs, {pack name: that kit's folder from this one}
        for name,p in _s.get('packs',{}).items():
            VIRTUAL['44-host-matlib-pack.js']=VIRTUAL['44-host-matlib-pack.js']+matlib_pack.fragment(os.path.normpath(os.path.join(HERE,p)),name)
# the shared sky (core/atmos/SKY-PLAN.md section 9, 2026-10-26): core/atmos's core where the kit had none, the sky's model,
# presets and shader, its host and the biome call (src/89-host-sky.js: ATMOS.skyBiome); they replace the painted dome
for f in ['89-atmos-0-core.js','89-atmos-0p-presets.js']:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky',f))
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']:   # e-weatherhost: ATMOS.bindWeather, with the weather (4) and its selector (9) in CORE_ATMOS (2026-10-26)
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host',f))
# the final rebuild's air (2026-10-27, src/89x-host-air.js): height fog (R1: the sky's chunk and its host), the rain occlusion map (R10), the dust
# the wind lifts (3d-dust) and the air's load (the dust storm, the fog drawn from the sight, KHAZ's fields)
PATH['89-atmos-j-fog.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky','89-atmos-j-fog.js'))
PATH['89-atmos-3d-dust.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','89-atmos-3d-dust.js'))
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-airload.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','fx',f))
# the syntax check cannot see a core fragment that is simply absent
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and not f.startswith(('22b-core-water','51b-core-water')) and not re.match(r'47[a-h]',f):   # the neighbours' kits (47*) are their own builds' to lint   # core/water/ext says RIVER in its own words
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf8', newline='\n').write(html)
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
