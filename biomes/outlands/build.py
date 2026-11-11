#!/usr/bin/env python3
"""Concatenate src/* (filename order) and the core into dist/<target>.html (PLAN.md section 9).

  00-head.html      page shell, opens <script>
  10..47            CORE (biome, rand, tags, space, export, terrain: strata, relief, ground, far field, horizon)
  45-host-stage     HOST: renderer, the slope's land, its fields, BIO.init -- must run before 48
  48-outl-colony    the colony pass (OUTLCOL, [G data]): territories, seams (PLAN.md section 4)
  50..79            BIOME (the Outlands' forms, the colony placement, the build)
  80..98            HOST (ground, far field, sky, atmosphere and the fog belt, water, build, views)
  99-tail.html      closes <script>

  python3 build.py                     dist/outlands.html: station 1, the Fog Wall (the slope from the fog belt to the gem shoulder)
  python3 build.py --station <name>    dist/outlands-<name>.html: stations/<name>/ added to src/ (PLAN.md section 9: gems, plains,
                                       nursery, river, house, mires), with stations/_shared/'s host fragments its station.json "use"s

The colony pass's node test (tests/test-colony.js) runs first; --no-checks skips it with the port lint.
The core and the biome fragments never reference a host global except through BIO.host (BIOME-API.md); build.py greps
for the forbidden names so a biome fragment cannot quietly grow a dependency on one world's engine.
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
if os.path.isdir(_SD): BSRC.variants([['--station',_s] for _s in sorted(os.listdir(_SD)) if os.path.isfile(os.path.join(_SD,_s,'station.json'))])
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('outlands-%s.html'%STATION if STATION else 'outlands.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
# the colony pass's node test (PLAN.md section 4): same seeds, same territories and seams; the power rule against a scan
if '--no-checks' not in sys.argv and '--list-sources' not in sys.argv:
    _node=find_node()
    if _node and subprocess.call([_node,os.path.join(HERE,'tests','test-colony.js')],stdout=subprocess.DEVNULL)!=0:
        sys.exit('build.py: tests/test-colony.js failed (run it: node biomes/outlands/tests/test-colony.js)')
# a STATION (shighlands' convention): stations/<name>/'s numbered fragments are added to src/'s (a name in both is the station's;
# station.json "drop" removes one of src/'s, "core" names more: {"<fragment name>": "<path from the repo root>"})
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
    # "use": the host fragments every station after the first shares (stations/_shared/: the generic ground, far field, sky, air,
    # water, build, views and checks, each driven by the station's STAGE record in its own 45-host-stage.js); each replaces src/'s
    for f in SJ.get('use',[]): PATH[f]=os.path.join(_SD,'_shared',f)
# core/terrain, opt-in by name (core/README.md "terrain/"): 35 KSTRATA (the 'outland' recipe: red basalt over pale tuffs and red beds,
# the copper bands the miners follow; PLAN.md section 12, C3), 38 KRELIEF (the wadis and their fans, the open-cast pit: C4), 43 KGROUND
# (the ground's library layers), 44 KFAR (the land past the map), 45 KHORIZON (the wall's shadow on the slope)
CORE_TERRAIN=['35-core-strata.js','38-core-relief.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
PATH.setdefault('44-core-farfield-draw.js',J('core','terrain','host','44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js',J('core','terrain','host','45-core-horizon-shade.js'))
# the biome core (core/README.md), with 33 the fungoid parts (BIO.fung: PLAN.md section 12, C2): every form of the lineage is drawn on it
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','33-core-fungoid.js','40-core-place.js','42-core-export.js','43-core-export-host.js']
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
# core/rand and core/tags: every form, colony and zone the kit places is a core/tags record (BIO.init({tags}))
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
# core/space (KSPACE): the colony pass's index (48) and the biome core's keep-clear
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
# core/shadow (KSHADOW): off at page load, ?shadow=1 (the owner, 2026-11-03)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the host shell from core/host (core/host/README.md): the whole interface. src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL
khost.resolve(PATH,CORE_HOST)
# the material library (core/materials/record) and the pack of the textures materials.json names (tools/textures/pack.py writes tex/)
for f in ('23-mat-record.js','25-matlib-host.js'): PATH.setdefault(f,J('core','materials','record',f))
sys.path.insert(0,J('tools','textures'))
import matlib_pack
# the pack's families on this page only: station 1's six (the Fog Wall's), or the station's own list (station.json "families")
FAM1=['cap.violet','pleat.skin','fogcomber','ground.fogcrust','ground.cobble','ground.gravel','lace.copper','flesh.cells']
_keep=SJ.get('families',FAM1)
_pj=os.path.join(HERE,'tex','pack.json')
with open(_pj,encoding='utf-8') as _fh: _fams=sorted(_json.load(_fh).get('families',{})) if os.path.isfile(_pj) else []
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'outl',exclude=[f for f in _fams if f not in _keep],own=True),khost.EDITS_JS:khost.edits_js(HERE,'outlands')}
for f in VIRTUAL: PATH[f]=None
# the shared atmosphere (core/atmos/README.md): its core, presets, export, the sky's light, the weather, the shared sky; height fog and
# THE FOG BELT (sky/89-atmos-j-fog.js, ATMOS.fogBelt: PLAN.md section 12, C1), the rain cover
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-fx-raincover.js']+SJ.get('fx',[]): PATH[f]=J('core','atmos','fx',f)
# core/water (core/water/README.md): the wadis' pools after rain, WATER.still drawn in one mesh by drawPools (the ext 53 pair; 89zw-host-water.js)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['53-core-water-terraces.js','53b-core-water-terraces-draw.js','56-core-water-breakup.js','60-core-water-fields.js']: PATH.setdefault(f,J('core','water','ext',f))
# THE ANCIENTS KIT, read in place (station.json "ancients": {"builders": [...]}: station 7, Trickster's House, the ruined Arcoindian II), as
# biomes/ancientsvalley and kits/metropolis read it: its runtime, the named builders and its materials, the files on disk untouched. Its
# top-level names that this page declares too are renamed in its fragments only (anc*: its registry, error panel, ground, ticks, PRNG,
# noise, clamp, lerp, TAU, qEuler, qFacing); its library pack is left empty (KMAT.pack('ancients', {})): the kit's own procedural maps
ANC_FILES={};SUBST={}
if SJ.get('ancients'):
    ANC=J('kits','ancients')
    ANC_RUNTIME=['10-core.js','12-stats.js','30-kit.js','32-surfaces.js','34-kitdefs.js','36-decor.js','38-helpers2.js','50-registry.js','54-mat-concrete.js','69-mat-salvage.js','69w-worn.js','88y-ancients-matlib.js']
    for f in ANC_RUNTIME+SJ['ancients'].get('builders',[]): ANC_FILES[f]=os.path.join(ANC,'src',f)
    for f in ['20-textures.js','22-materials.js','68-mat-v5.js']:
        _p=os.path.join(ANC,'src',f); ANC_FILES[f]=_p if os.path.isfile(_p) else J('core','materials',f)
    for f,_p in ANC_FILES.items():
        if f in PATH: sys.exit('build.py: the Ancients kit\'s %s shadows a fragment of this page' % f)
        PATH[f]=_p
    PATH.setdefault('26-matlib-bind.js',J('core','materials','record','26-matlib-bind.js'))
    _names={'REGISTER':'ANC_REGISTER','REG':'ANC_REG','ERRS':'ANC_ERRS','reportErr':'ancReportErr','terrainH':'ancTerrainH','TICKS':'ANC_TICKS','tick':'ancTick',
            'reseed':'ancReseed','rng':'ancRng','rr':'ancRr','h3':'ancH3','vnoise':'ancVnoise','fbm':'ancFbm','clamp':'ancClamp','lerp':'ancLerp','TAU':'ANC_TAU',
            'qEuler':'ancQEuler','qFacing':'ancQFacing'}
    _sub=[(r'(?<![\w$.])%s(?![\w$])' % k, v) for k,v in _names.items()]+[(r'\bwindow\.onerror\b','window.ancOnerror'),(r'!!NIGHT\b','!!window.NIGHT')]
    for f in ANC_FILES: SUBST[f]=_sub
    VIRTUAL['88x-matlib-pack-ancients.js']="/* the Ancients kit's library pack, left empty on this page: its own procedural maps (KNOWN_ISSUES.md) */\nKMAT.pack('ancients', {});\n"
    PATH['88x-matlib-pack-ancients.js']=None
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME)'); sys.exit(1)
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf-8').read()
    for _a,_b in SUBST.get(f,[]): s=re.sub(_a,_b,s)
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and f not in ANC_FILES and not (PATH[f] and os.sep+'core'+os.sep in os.path.normpath(PATH[f])):
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf-8',newline='\n').write(html)
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
