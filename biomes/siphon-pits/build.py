#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html. Started from biomes/highrift's build.py (PLAN.md section 6),
with biomes/geyser's --list-sources hook (tools/build_sources.py).

  00-head.html      page shell, opens <script>
  10..44            CORE (core/biome, core/rand, core/tags, core/terrain, core/mask, core/hazard...), read by path
  39-...-stations   VIRTUAL: every stations/<name>/station.json's record (the survey, PLAN.md section 0) [G data]
  40                SIPHON's sites: each station's layout on its record [G data]
  45-host-stage     HOST binding (renderer, the land on KFIELD, BIO.init) -- must run before 50
  47..              the neighbours' kits read in place (station.json "kin": the Throne for the woolly siphon)
  50..79            THE KIT (species, placement, build)
  80..98            HOST (ground, far field, heat, sky, air, water, build)
  99-tail.html      closes <script>

  python3 build.py                     dist/siphon-pits.html: station 3, the Siphon Maar Floor (stations/pitfloor)
  python3 build.py --station <name>    dist/siphon-pits-<name>.html: terraces (1), scarp (2), arete (4)
  python3 build.py --all               every page

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

HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
sys.path.insert(0,os.path.join(ROOT,'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
STATIONS=['terraces','scarp','pitfloor','arete']   # the plan's order, 1..4
DEFAULT='pitfloor'
if '--all' in sys.argv:
    _a=[a for a in sys.argv[1:] if a!='--all']
    _r=[subprocess.call([sys.executable,os.path.abspath(__file__)]+_a)]
    for _st in STATIONS:
        if _st!=DEFAULT: _r.append(subprocess.call([sys.executable,os.path.abspath(__file__),'--station',_st]+_a))
    sys.exit(max(_r))
SRC=os.path.join(HERE,'src'); DIST=os.path.join(HERE,'dist')
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
STATION=STATION or DEFAULT
if STATION not in STATIONS: sys.exit('build.py: no station '+STATION+' ('+', '.join(STATIONS)+')')
OUT=_args[0] if _args else ('siphon-pits.html' if STATION==DEFAULT else 'siphon-pits-%s.html'%STATION)
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
import json as _json
def _sj(name):
    with open(os.path.join(HERE,'stations',name,'station.json'),encoding='utf-8') as fh: return _json.load(fh)
SJ=_sj(STATION)
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
_sd=os.path.join(HERE,'stations',STATION)
for f in os.listdir(_sd):
    if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
for f,pth in SJ.get('core',{}).items(): PATH.setdefault(f,J(pth))
# THE STATIONS' RECORDS (PLAN.md section 0): station.json is the survey's one copy; the page carries all four (the inspector and verify read them)
VIRTUAL={'39-biome-siphon-stations.js':'// ================================================================= SIPHON PITS - the stations\' records (stations/*/station.json, inlined by build.py)  [G data]\n'
  +'var SIPHON_STATIONS='+_json.dumps({k:dict(_sj(k)['site'],fog=_sj(k).get('fog'),wind=_sj(k).get('wind'),water=_sj(k).get('water',[]),crops=_sj(k).get('crops'),out=_sj(k)['out']) for k in STATIONS},sort_keys=True,ensure_ascii=False)+';\n'
  +'var STATION_KEY='+_json.dumps(STATION)+';\n'}
# core/terrain, opt-in by name (core/README.md "terrain/"): 30 KFIELD (the ground as data), 38 + 38c KRELIEF (scarp, stepcut, terraces, columns, wadi),
# 42 KFROST, 35 KSTRATA, 43 KGROUND, 44 KFAR, 45 KHORIZON, 47 KTHERM. A station adds its own in station.json "core" (the geode's cavern)
CORE_TERRAIN=['30-core-field.js','35-core-strata.js','38-core-relief.js','38c-core-landforms.js','42-core-frost.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js','47-core-therm.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
PATH.setdefault('44-core-farfield-draw.js',J('core','terrain','host','44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js',J('core','terrain','host','45-core-horizon-shade.js'))
PATH.setdefault('35s-core-strata-shade.js',J('core','terrain','host','35-core-strata-shade.js'))   # keyed to sort after 35-core-strata.js
# the biome core from core/biome: 32 the kin (the woolly siphon), 33 the fungoid parts (galls, cushions), 34 impostors, 41 the fields, 44 the stage
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js',
 '35-core-anim.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
# core/space (KSPACE), core/rand, core/tags, core/export, core/mask (KMASK: the farm plan and the camp as a raster, PLAN.md section 6)
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
for f in ['25-core-mask.js','27-core-mask-distance.js']: PATH.setdefault(f,J('core','mask',f))
# core/hazard (KHAZ): the falls, the hunters' lairs, the vents, the rime; the air as ambient fields from each station's record
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
PATH.setdefault('37-core-traps.js',J('core','biome','37-core-traps.js'))   # KTRAPS.cycle: the one clock core/hazard runs on
# core/shadow (KSHADOW), off at load (?shadow=1)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the host shell from core/host, the whole interface and the authoring tools
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
# the shared atmosphere: core, presets, particles (the vents' steam), export, waves, skylight, the weather (the blizzard), host bind, the shared sky,
# height fog (the amber deck as its mist), the rain cover, snow that lies, the smoke groups (steam)
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
PATH['89-atmos-c-hostbind.js']=J('core','atmos','host','89-atmos-c-hostbind.js')
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js','89-atmos-fx-snowcover.js','89-atmos-fx-smokegroups.js']: PATH[f]=J('core','atmos','fx',f)
# core/water: the braided meltwater (WATER.flow), the vent well (WATER.geyser), the mud pots and hot pools (WATER.spring); ext: breakup, audit, fields
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['56-core-water-breakup.js','57-core-water-audit.js','60-core-water-fields.js']: PATH.setdefault(f,J('core','water','ext',f))
for f in ['52-core-water-geyser.js','52b-core-water-geyser-draw.js']: PATH.setdefault(f,J('core','water','geyser',f))
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)); sys.exit(1)
# the material library (core/materials/record) and the pack of the sets materials.json names (tools/textures/pack.py)
for f in ['23-mat-record.js','25-matlib-host.js']: PATH.setdefault(f,J('core','materials','record',f))
sys.path.insert(0,J('tools','textures'))
import matlib_pack
VIRTUAL['44-host-matlib-pack.js']=matlib_pack.fragment(HERE,'siphon',own=True)
VIRTUAL[khost.EDITS_JS]=khost.edits_js(HERE,'siphon-pits')
# THE NEIGHBOURS' KITS, read in place (highrift's lines): station.json "kin": {"<kit>": [[fragments], "<API>", [pack families kept]]}; each kit's
# fragments slot after the host stage (45) and before this kit (50), in their own registry, closed by a one-line kitEnd
NEIGH={k:tuple(v) for k,v in SJ.get('kin',{}).items()}
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(NEIGH.items())):
    _d=os.path.normpath(os.path.join(HERE,'..',_k));_c='abcdefgh'[_i]
    for _j,_f in enumerate(_fs): PATH['47%s%d-%s'%(_c,_j,os.path.basename(_f))]=os.path.join(_d,_f)
    VIRTUAL['47%s-%s-open.js'%(_c,_k)]=chr(10)+"BIO.kit('%s');   // its own registry"%_k+chr(10)
    VIRTUAL['47%s9-%s-end.js'%(_c,_k)]=chr(10)+"BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed"%(_k,_api)+chr(10)
    _pj=os.path.join(_d,'tex','pack.json');_fam=[]
    if os.path.isfile(_pj):
        with open(_pj,encoding='utf-8') as _fh: _fam=sorted(_json.load(_fh).get('families',{}))
    VIRTUAL['44%s-host-matlib-pack-%s.js'%(_c,_k)]=matlib_pack.fragment(_d,_k,exclude=[f for f in _fam if f not in _keep])
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and not re.match(r'47[a-h]',f) and not (PATH[f] and os.sep+'core'+os.sep in os.path.normpath(PATH[f])) and not (PATH[f] and os.sep+'kits'+os.sep in os.path.normpath(PATH[f])):
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH,[os.path.join(HERE,'stations',k,'station.json') for k in STATIONS])   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
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
