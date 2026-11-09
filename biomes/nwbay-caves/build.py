#!/usr/bin/env python3
"""Concatenate a station's fragments and the core (filename order) into dist/nwbay-caves-<station>.html (PLAN.md).

The bay's drowned caves under nwbay's cenotes (biomes/KARST-SITES-5.1.md site 1). A cave page draws no surface: nwbay's page is not
touched, its ground is read in as a raster (stations/<name>/44z-host-site.js). Started from biomes/hearths, the nearest cave kit.

  stations/<name>/00-head.html     page shell, opens <script>
  10..47                           CORE (biome core, rand, tags, space, the cavern and its floor, KSPELEO, KKARST, KGROUND)
  44z-host-site                    the station's site in nwbay's frame, the ground raster, the network's arguments ([G data])
  48-nwbay-caves                   the cave's records: the network, the cenote, the dress, the water, the hazards ([G data])
  49-host-stage                    HOST: renderer, light, the floor under the eye, BIO.init
  84..98                           HOST (the rock, the dress, the water and the light, the build)
  99-host-take                     the views and the checks, KHOST.take
  99-tail.html                     closes <script>

  python3 build.py                     dist/nwbay-caves-cenote.html (station 1, the cave under the NE cenote)
  python3 build.py --station cenote    the same

The station's fragments never reference a host global except through BIO.host; build.py greps for the forbidden names.
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

HERE=os.path.dirname(os.path.abspath(__file__)); DIST=os.path.join(HERE,'dist')
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else 'cenote'
if '--station' in _args: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else 'nwbay-caves-%s.html'%STATION
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
# a STATION (PLAN.md): stations/<name>/'s numbered fragments are the page; its station.json names its site on the 5.1 map ("site")
import json as _json
_sd=os.path.join(HERE,'stations',STATION)
if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
with open(os.path.join(_sd,'station.json'),encoding='utf-8') as _fh: SJ=_json.load(_fh)
# "base": another station whose fragments this one starts from, its own replacing them by name
PATH={}
if SJ.get('base'):
    _bd=os.path.join(HERE,'stations',SJ['base'])
    PATH.update({f:os.path.join(_bd,f) for f in os.listdir(_bd) if re.match(r'\d',f)})
PATH.update({f:os.path.join(_sd,f) for f in os.listdir(_sd) if re.match(r'\d',f)})
# core/terrain, opt-in by name (core/README.md "terrain/"): 39 KCAVERN (the voids, meshed by chunk), 39b KSPELEO (the limestone dress), 39c KKARST
# (the drowned branchwork), 39d the floor under the eye, 43 KGROUND (the rock's layers, triplanar on the walls) (PLAN.md section 4)
CORE_TERRAIN=['39-core-cavern.js','39b-core-speleo.js','39c-core-karst.js','39d-core-cavern-floor.js','43-core-ground.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
PATH.setdefault('39e-core-cavern-draw.js',J('core','terrain','host','39e-core-cavern-draw.js'))   # KCAVERN.drawRock (39d: the floor under the eye)
# the biome core from core/biome: the host binding, the records, the export (no flora: a drowned cave)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','40-core-place.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
# core/hazard (KHAZ) and the one clock (KTRAPS.cycle): the drowning (for air-breathers), the fall into the cenote
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
PATH.setdefault('37-core-traps.js',J('core','biome','37-core-traps.js'))
# core/shadow (KSHADOW): off at page load, ?shadow=1 (the owner, 2026-11-03)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the host shell from core/host, the whole interface. stations/<name>/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL
khost.resolve(PATH,CORE_HOST)
# the shared atmosphere: its core, presets, particles (the motes in the water), the evening's cones (the cenote's shaft of light), export, the host
# binding. No sky, no weather and no height fog (it reads the sky's uniforms): underground, the haze is the scene's fog
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-2-lights.js','89-atmos-3-particles.js','89-atmos-8-export.js','89-atmos-9-host.js',
 '89-atmos-a-waves.js']   # the waves' uniforms core/water's surface reads
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
PATH['89-atmos-c-hostbind.js']=J('core','atmos','host','89-atmos-c-hostbind.js')
# core/water: the cenote's surface, a still WATER.open
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
miss=[f for f in ('10-core-head.js','20-core-kit.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME)'); sys.exit(1)
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
for f in CORE_MAT: PATH.setdefault(f,J('core','materials','record',f))
sys.path.insert(0,J('tools','textures'))
import matlib_pack
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'nwbay-caves',own=True),khost.EDITS_JS:khost.edits_js(HERE,'nwbay-caves-'+STATION)}
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
