#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (Northern Highlands species, trees, floor, dressing)
  45-host-stage     HOST binding (renderer, terrain, BIO.init) -- must run before 50
  80..98            HOST (sky, tower, build, camera, probe)
  99-tail.html      closes <script>

  python3 build.py                     dist/nhighlands.html, the wet old growth (station 1)
  python3 build.py --station <name>    dist/nhighlands-<name>.html: stations/<name>/ added to src/ (PLAN-STATIONS.md)

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
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('nhighlands-%s.html'%STATION if STATION else 'nhighlands.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
# a STATION (PLAN-STATIONS.md; python3 build.py --station <name> -> dist/nhighlands-<name>.html): stations/<name>/'s numbered fragments are added to src/'s
# (a name in both is the station's; a station drops one of src/'s by listing it in station.json "drop"), and its station.json may name more core
# ("core": {"<fragment name>": "<path from the repo root>"}). Station 1, the page as built, is the kit with no --station
import json as _json
SJ={}
if STATION:
    _sd=os.path.join(HERE,'stations',STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    _sj=os.path.join(_sd,'station.json')
    if os.path.isfile(_sj):
        with open(_sj,encoding='utf-8') as _fh: SJ=_json.load(_fh)
# a station on another's ground names it as its "base" (oidong's form; stations 3 and 4 on station 2's land, `montane`): the base's fragments first,
# then the station's own; the base's "drop", "core", "families" and "kin" join the station's
_BD=None
if STATION and SJ.get('base'):
    _BD=os.path.join(HERE,'stations',SJ['base'])
    _bj=os.path.join(_BD,'station.json');_B={}
    if os.path.isfile(_bj):
        with open(_bj,encoding='utf-8') as _fh: _B=_json.load(_fh)
    SJ['drop']=sorted(set(_B.get('drop',[]))|set(SJ.get('drop',[])))
    SJ['core']=dict(_B.get('core',{}),**SJ.get('core',{}))
    SJ['families']=sorted(set(_B.get('families',[]))|set(SJ.get('families',[])))
    SJ['kin']=dict(_B.get('kin',{}),**SJ.get('kin',{}))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in SJ.get('drop',[]): PATH.pop(f,None)
    for _d in ([_BD] if _BD else [])+[_sd]:
        for f in os.listdir(_d):
            if re.match(r'\d',f): PATH[f]=os.path.join(_d,f)
    for f,pth in SJ.get('core',{}).items(): PATH.setdefault(f,J(pth))
# core/terrain, opt-in by name (core/README.md "terrain/"): 43 KGROUND (the ground's library layers, 84-host-ground.js), 44 KFAR (the far country's lattice,
# 82-host-sky.js), 45 KHORIZON (its terrain shadows); the final rebuild (pair 7, 2026-11-03): 35 KSTRATA, the crater wall's megabreccia on the crag steps and
# pillars (kits/resources/ROCK-PROPOSAL.md, "Where the biomes must change" 1: the impact province; swhighlands' `crest` recipe). A local src/ copy wins
CORE_TERRAIN=['35-core-strata.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
PATH.setdefault('35z-core-strata-shade.js',J('core','terrain','host','35-core-strata-shade.js'))
PATH.setdefault('44-core-farfield-draw.js',J('core','terrain','host','44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js',J('core','terrain','host','45-core-horizon-shade.js'))
# the biome core from core/biome (core/README.md): one copy for every kit. The final rebuild (pair 7) adds 31j a limb's joint to its parent (BIO.flareJoin)
# and 41 the environmental fields (BIO.env, envCheck: the flora and the wet band on the water's own shore)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','33-core-fungoid.js','34-core-impostor.js','40-core-place.js','41-core-env.js',
 '42-core-export.js','43-core-export-host.js','44-core-stage.js']
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
# core/rand and core/tags (core/tags/README.md), the way the core/furnish builds take them: with BIO.init({tags}) every item
# set, instance and registered volume the kit places is a core/tags record (core/biome/20-core-kit.js). A src/ copy wins.
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
# core/export (core/export/README.md): the krator-world container (EXPORT.world); the biome core fills its items, buckets,
# materials, textures and terrain (42-core-export.js), 43 its stage, the adapters its registry. A src/ copy wins.
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md)
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
# core/shadow (KSHADOW; the owner, 2026-11-03: every turn measures it and skips it where it is unaffordable): the sun's shadows in one view-following box
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock (core/clock), the panel and
# the probe. src/99-host-take.js hands it the page (KHOST.take). A local src/ copy with the same name wins (KNOWN_ISSUES.md).
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL   # the whole interface (core/host/README.md): the record-driven inspector, marks (which supersede the polygon tool), pictures, the minimap, the editor
khost.resolve(PATH,CORE_HOST)
# the material library (core/materials/record: KMAT and the loader) and the GENERATED pack of the textures materials.json
# names (tools/textures/matlib_pack.py from tex/, written by tools/textures/pack.py). Without tex/pack.json the pack is
# empty and the kit keeps its procedural textures (as it does in the open world, which carries no pack).
for f in ('23-mat-record.js','25-matlib-host.js'): PATH.setdefault(f,J('core','materials','record',f))
sys.path.insert(0,J('tools','textures'))
import matlib_pack
# a family a station names in its station.json ("families") is packed into that station's page only: station 1 and the other stations leave it out
_sfam=set()
if os.path.isdir(os.path.join(HERE,'stations')):
    for _st in sorted(os.listdir(os.path.join(HERE,'stations'))):
        _p=os.path.join(HERE,'stations',_st,'station.json')
        if os.path.isfile(_p):
            with open(_p,encoding='utf-8') as _fh: _sfam.update(_json.load(_fh).get('families',[]))
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'nhighlands',exclude=sorted(_sfam-set(SJ.get('families',[])))),khost.EDITS_JS:khost.edits_js(HERE,'nhighlands')}
# THE CUT'S TWO NATIVES, read in place (biomes/cut/PLAN.md section 12, exchanges 7 and 8; 87-host-cut.js draws them with the warp off):
# the Cut kit's field, species, planners and kit surface by path, renamed to run after this kit's own 70 (so the Cut's BIO.kit('cut')
# and BIO.kitEnd pair up), and its pack's reed sheet only (the lichen's disc is its own canvas). A station that drops 87 drops them too
CUT_DIR=os.path.normpath(os.path.join(HERE,'..','cut'))
if '87-host-cut.js' in PATH:
    for _k,_f in [('71a-cut-field.js','41-cut-field.js'),('71b-cut-species.js','50-biome-cut-species.js'),('71c-cut-natives.js','55-biome-cut-natives.js'),
                  ('71d-cut-melon-lichen.js','57-biome-cut-melon-lichen.js'),('71e-cut-build.js','70-biome-cut.js')]:
        PATH[_k]=os.path.join(CUT_DIR,'src',_f)
    _cpj=os.path.join(CUT_DIR,'tex','pack.json')
    _cex=[]
    if os.path.isfile(_cpj):
        with open(_cpj,encoding='utf-8') as _fh: _cex=[f for f in sorted(_json.load(_fh).get('families',{})) if f!='reed']
    VIRTUAL['44b-host-matlib-pack-cut.js']=matlib_pack.fragment(CUT_DIR,'cut',exclude=_cex)
# THE NEIGHBOURS' KITS, read in place (oidong's and ebadlands' lines): a station names them in station.json ("kin": {"<kit>": [[fragments], "<API>", [pack families]]});
# each kit's fragments slot after the host stage (45) and before this kit (50), in their own registry, closed by a one-line kitEnd (station 3: swlowlands' oaks)
NEIGH={k:tuple(v) for k,v in SJ.get('kin',{}).items()}
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(NEIGH.items())):
    _d=os.path.normpath(os.path.join(HERE,'..',_k.split('/')[0]));_c='abcdefgh'[_i];_kk=_k.replace('/','-')
    for _j,_f in enumerate(_fs): PATH['47%s%d-%s'%(_c,_j,os.path.basename(_f))]=os.path.join(_d,_f)
    VIRTUAL['47%s-%s-open.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');   // its own registry"%_k.split('/')[0]+chr(10)
    VIRTUAL['47%s9-%s-end.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)"%(_k.split('/')[0],_api)+chr(10)
    _pj=os.path.join(_d,'tex','pack.json')
    _fam=[]
    if os.path.isfile(_pj):
        with open(_pj,encoding='utf-8') as _fh: _fam=sorted(_json.load(_fh).get('families',{}))
    VIRTUAL['44%s-host-matlib-pack-%s.js'%(chr(ord(_c)+2),_kk)]=matlib_pack.fragment(_d,_k.split('/')[0],exclude=[f for f in _fam if f not in _keep])
for f in VIRTUAL: PATH[f]=None
# the shared atmosphere (core/atmos/README.md): its core, presets, export, the open-water wave field and the sky's light, bound once by 89a-host-atmos.js
# (ATMOS.bindHost); the shared sky (SKY-PLAN.md section 9: its model, presets, shader, host and the biome call, 89-host-sky.js: ATMOS.skyBiome); the weather
# and its selector (ATMOS.bindWeather), height fog (R1), the rain occlusion map (R10), the branched lightning; the final rebuild: snow that lies (snowcover)
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
PATH['89-atmos-c-hostbind.js']=J('core','atmos','host','89-atmos-c-hostbind.js')
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']+SJ.get('fx',[]): PATH[f]=J('core','atmos','fx',f)
# core/water (core/water/README.md): the stream a WATER.flow, its falls WATER.fall, the tarn WATER.still (records in 45-host-stage.js, drawn in 89w-host-water.js);
# the final rebuild's ext, by path (tools/fragment_needs.json): breakup (56: the stream), the audit (57), the reflections switch (58), the shore's fields (60)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['56-core-water-breakup.js','57-core-water-audit.js','58-core-water-mirror.js','60-core-water-fields.js']: PATH.setdefault(f,J('core','water','ext',f))
# the syntax check cannot see a core fragment that is simply absent
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and 'core-water' not in f and not re.match(r'47[a-h]',f):   # the neighbours' kits are their own builds' to lint
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
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
