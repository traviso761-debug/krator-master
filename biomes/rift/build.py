#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (Rift species, trees, floor, dressing)
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
# THE STATIONS (PLAN-STATIONS.md, 2026-10-27): `python3 build.py --station <name>` builds dist/rift-<name>.html from src/ with the
# station's own fragments (stations/<name>/*) in place of src/'s of the same name (its map 45m, water 89w, sky 89, views 99...)
_args=[a for a in sys.argv[1:] if a!='--no-checks']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('rift-%s.html'%STATION if STATION else 'rift.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# shared fragments from core/terrain, opt-in by name (core/README.md): '36-core-carve.js' gives
# BIO.carve, overhangs on the heightfield. A local src/ copy with the same name wins.
CORE_TERRAIN=['35-core-strata.js','44-core-farfield.js']   # KFAR: a station's far country from the model (stations/<name>/89f-host-far.js)
# KSTRATA: the `rift` recipe on the ridge's faces (src/45-host-stage.js; core/terrain/STRATA-PLAN.md)
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome, the same way (core/README.md): one copy for every kit.
# A kit that lists nothing keeps its own src/ copies and builds as before.
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js','40-core-place.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    _sd=os.path.join(HERE,'stations',STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE_B,f)
PATH.setdefault('44-core-farfield-draw.js',os.path.join(CORE_T,'host','44-core-farfield-draw.js'))   # KFAR.mesh
PATH.setdefault('35b-core-strata-shade.js',os.path.join(CORE_T,'host','35-core-strata-shade.js'))   # the strata's three.js half (KSTRATA.shade, BIO.strata)
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
CORE_HOST=khost.SHELL
khost.resolve(PATH,CORE_HOST)
# the material library (core/materials/record: KMAT and the loader) and the GENERATED pack of the textures materials.json
# names (tools/textures/matlib_pack.py from tex/, written by tools/textures/pack.py). Without tex/pack.json the pack is
# empty and the kit keeps its procedural textures (as it does in the open world, which carries no pack).
for f in ('23-mat-record.js','25-matlib-host.js'):
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record',f))
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'rift',own=True)}
# a station may read other kits in place (stations/<name>/read.json): {"fragments": {published name: path from this kit},
# "packs": {published name: [kit dir, pack key, [families taken]]}}: the fragments are slotted by their published names (after this
# kit's 70, so their BIO.kit / kitEnd pair up), the packs carry only the families named (the rest excluded)
if STATION and os.path.isfile(os.path.join(HERE,'stations',STATION,'read.json')):
    import json as _json
    _rd=_json.load(open(os.path.join(HERE,'stations',STATION,'read.json'),encoding='utf-8'))
    for _k,_f in _rd.get('fragments',{}).items(): PATH[_k]=os.path.normpath(os.path.join(HERE,_f))
    for _k,(_d,_key,_take) in _rd.get('packs',{}).items():
        _dd=os.path.normpath(os.path.join(HERE,_d)); _pj=os.path.join(_dd,'tex','pack.json')
        _all=sorted(_json.load(open(_pj,encoding='utf-8')).get('families',{})) if os.path.isfile(_pj) else []
        VIRTUAL[_k]=matlib_pack.fragment(_dd,_key,exclude=[f for f in _all if f not in _take])
for f in VIRTUAL: PATH[f]=None
# the shared atmosphere (core/atmos/README.md; 2026-10-20, phase 0 of the water migration): its core, presets, export, the open-water
# wave field and the sky's light, bound once by 89a-host-atmos.js (ATMOS.bindHost). Nothing is drawn by the binding alone: the page's own
# sky, fog, sun and water are unchanged; core/water draws here in a later phase.
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
PATH['89-atmos-c-hostbind.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-c-hostbind.js'))   # ATMOS.bindHost, in core/atmos/host/ so the kits that take core/atmos whole are not changed
# core/water (core/water/README.md; 2026-10-20, phase 3): the algal lake as WATER.open and the streams' last reach as WATER.flow (89w-host-water.js). Explicit paths:
# the open-water draw (50) and the flow/fall/still kinds (51) as well as the data.
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water',f))
PATH.setdefault('56-core-water-breakup.js',os.path.normpath(os.path.join(HERE,'..','..','core','water','ext','56-core-water-breakup.js')))   # the breakup (core/water ext/56), on by default since 2026-11-09
# the shared sky (core/atmos/SKY-PLAN.md section 9, 2026-10-26): core/atmos's core where the kit had none, the sky's model,
# presets and shader, its host and the biome call (src/89-host-sky.js: ATMOS.skyBiome); they replace the painted dome
for f in ['89-atmos-0-core.js','89-atmos-0p-presets.js']:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky',f))
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']:   # e-weatherhost: ATMOS.bindWeather, with the weather (4) and its selector (9) in CORE_ATMOS (2026-10-26)
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host',f))
# height fog (R1: the sky's chunk sky/89-atmos-j-fog.js and its host, above), the rain occlusion map (R10) and the branched lightning
# (core/atmos/fx/), as nhighlands takes them (2026-10-27, the final rebuild)
PATH['89-atmos-j-fog.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky','89-atmos-j-fog.js'))
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','fx',f))
# a CAVE station (stations/<name>/station.json "page": "cave"; stations/maze, 2026-11-09): a whole underground page, as the Hearths' Cave of
# Crystals is. None of the above: the station's numbered fragments, the core its station.json names ("core": {name: path from the repo root}),
# core/host's shell ("host": a list name in core/host/host.py), and the material packs: this kit's own families named in "own", and other kits'
# read in place ("packs", as read.json's). Every other page is assembled exactly as before.
_cj=os.path.join(HERE,'stations',STATION,'station.json') if STATION else None
if _cj and os.path.isfile(_cj):
    import json as _json
    with open(_cj,encoding='utf-8') as _fh: _cs=_json.load(_fh)
    if _cs.get('page')=='cave':
        _sd=os.path.join(HERE,'stations',STATION)
        PATH={f:os.path.join(_sd,f) for f in os.listdir(_sd) if re.match(r'\d',f)}
        for _k,_p in _cs.get('core',{}).items(): PATH.setdefault(_k,os.path.normpath(os.path.join(HERE,'..','..',_p)))
        khost.resolve(PATH,getattr(khost,_cs.get('host','FULL')))
        _pj=os.path.join(HERE,'tex','pack.json')
        _all=sorted(_json.load(open(_pj,encoding='utf-8')).get('families',{})) if os.path.isfile(_pj) else []
        VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'rift',exclude=[f for f in _all if f not in _cs.get('own',[])],own=True),
                 khost.EDITS_JS:khost.edits_js(HERE,'rift-'+STATION)}
        for _k,(_d,_key,_take) in _cs.get('packs',{}).items():
            _dd=os.path.normpath(os.path.join(HERE,_d)); _pj=os.path.join(_dd,'tex','pack.json')
            _all=sorted(_json.load(open(_pj,encoding='utf-8')).get('families',{})) if os.path.isfile(_pj) else []
            VIRTUAL[_k]=matlib_pack.fragment(_dd,_key,exclude=[f for f in _all if f not in _take])
        for f in VIRTUAL: PATH[f]=None
# the syntax check cannot see a core fragment that is simply absent
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f:
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
