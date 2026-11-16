#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..44            CORE (biome core, terrain, rand, tags, space, the glacier)
  44z-host-site     the station's site (scale model 5.1, PLAN.md section 2): a station replaces it
  45-host-stage     HOST binding (renderer, terrain, BIO.init) -- must run before 50
  50..79            BIOME LEAVES (Copper Glacier's species and placement)
  80..98            HOST (ground, far field, the glacier's drawing, sky, water, build)
  99-tail.html      closes <script>

  python3 build.py                     dist/copperglacier.html, station 1: Copper Tarn
  python3 build.py --station <name>    dist/copperglacier-<name>.html: stations/<name>/ added to src/ (PLAN.md section 2): pass, icefield

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
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('copperglacier-%s.html'%STATION if STATION else 'copperglacier.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
# a STATION (PLAN.md section 2; python3 build.py --station <name> -> dist/copperglacier-<name>.html): stations/<name>/'s numbered fragments are added
# to src/'s (a name in both is the station's: every station has its own 44z-host-site.js), and its station.json names its site on the 5.1 map ("site")
import json as _json
SJ={'site':[156,1150]}   # station 1, Copper Tarn: the page's middle at the snout, the tarn to the west (PLAN.md section 2)
if STATION:
    _sd=os.path.join(HERE,'stations',STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    _sj=os.path.join(_sd,'station.json')
    if os.path.isfile(_sj):
        with open(_sj,encoding='utf-8') as _fh: SJ=_json.load(_fh)
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
# core/terrain, opt-in by name (core/README.md "terrain/"): 38 KRELIEF (the walls, the nunataks, the talus), 42 KFROST (patterned ground), 43 KGROUND,
# 44 KFAR, 44g KGLACIER (the ice, lifted from the Throne 2026-11-03) and its drawing (host/44h), 45 KHORIZON. KSTRATA left out: gneiss and granite, no beds
# (PLAN.md, Core adoption)
CORE_TERRAIN=['38-core-relief.js','42-core-frost.js','43-core-ground.js','44-core-farfield.js','44g-core-glacier.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
for f in ['44-core-farfield-draw.js','44h-core-glacier-draw.js','45-core-horizon-shade.js']: PATH.setdefault(f,J('core','terrain','host',f))
# the biome core from core/biome: 31j a limb's joint (BIO.flareJoin, the frost coral's limbs), 34 the impostors (listed: no tree passes 7 m, so none is
# baked), 35 the motion modes, 39 the lean, 41 the environmental fields
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31j-core-joint.js','32-core-variants.js','34-core-impostor.js',
 '35-core-anim.js','39-core-lean.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
# core/hazard (KHAZ) and the one clock (KTRAPS.cycle): the crevasses, the calving ice cliff, the thin air
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
PATH.setdefault('37-core-traps.js',J('core','biome','37-core-traps.js'))
# core/shadow (KSHADOW): the sun's shadows in one view-following box (measured: KNOWN_ISSUES.md)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the host shell from core/host, the whole interface and the authoring tools. src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
# the shared atmosphere: its core, presets, particles, export, waves, skylight, the weather and its selector (89a-host-atmos.js); height fog, the rain's
# occlusion map, lightning, snow that lies
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
PATH['89-atmos-c-hostbind.js']=J('core','atmos','host','89-atmos-c-hostbind.js')
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js','89-atmos-fx-snowcover.js']: PATH[f]=J('core','atmos','fx',f)
# core/water: the tarn and the proglacial ponds WATER.open, the meltwater streams WATER.flow (89w-host-water.js); the final rebuild's ext: breakup (56),
# the audit (57), the reflections switch (58), the shore's fields (60), the plume (61: a stream's silt into the tarn), by path (tools/fragment_needs.json)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['56-core-water-breakup.js','57-core-water-audit.js','58-core-water-mirror.js','60-core-water-fields.js','61-core-water-plume.js']:
    PATH.setdefault(f,J('core','water','ext',f))
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
for f in CORE_MAT: PATH.setdefault(f,J('core','materials','record',f))
sys.path.insert(0,J('tools','textures'))
import matlib_pack
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'copperglacier',own=True),khost.EDITS_JS:khost.edits_js(HERE,'copperglacier')}
# THE RESOURCE DATA round the site (kits/resources, read in place at build time: res_site.js): the nodes and the prospectivity cells as CG_RES, so the
# copper is the data's (PLAN.md section 1). geology.json (4.4 MB) stays out of the page
_node=find_node()
if not _node: sys.exit('build.py: node is needed to read the resource data (res_site.js)')
_px,_py=SJ['site']
# the files node reads, read here too so tools/build.py records them as inputs (a rebake of geology.json marks the pages stale)
for _f in [os.path.join(HERE,'res_site.js'),J('kits','resources','src','45r-res-field.js'),J('kits','resources','data','geology.json')]:
    with open(_f,'rb') as _fh: _fh.read()
_r=subprocess.run([_node,os.path.join(HERE,'res_site.js'),str(_px),str(_py),'3000'],capture_output=True,text=True,encoding='utf-8')
if _r.returncode: sys.exit('build.py: res_site.js failed\n'+_r.stderr[:800])
VIRTUAL['44r-host-res.js']='\n// the resource data round this station (res_site.js, from kits/resources/data/geology.json; build time)\nconst CG_RES='+_r.stdout+';\n'
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and 'core-water' not in f:
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
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
