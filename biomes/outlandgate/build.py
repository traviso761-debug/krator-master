#!/usr/bin/env python3
"""Concatenate src/* (filename order) and the core into dist/<target>.html (PLAN.md section 7).

  00-head.html      page shell, opens <script>
  10..47            CORE (biome, rand, tags, space, export, terrain: strata, relief, ground, far field, horizon)
  44f-og-far-data   the far field's heights from the scale model (tools/far_grid.py, [G data])
  45-host-stage     HOST: renderer, the station's land, its fields, BIO.init -- must run before the kin and the kit
  47*               THE NEIGHBOURS' SPECIES, read in place (KIN below: ebadlands' cottonwood, oak and maple), each in its own registry
  50..79            BIOME (the Outland Gate kit: its reed beds and the kin's placement on the floor)
  80..98            HOST (ground, far field, the Gate's works, the fauna bundle and its land, the hazards, sky, the atmosphere and the
                    gap's wind, water, build, views)
  99-tail.html      closes <script>

  python3 build.py                     dist/outlandgate.html: station 1, the Narrows and the Gate
  python3 build.py --station <name>    dist/outlandgate-<name>.html: stations/<name>/ added to src/ (none yet)
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
OUT=_args[0] if _args else ('outlandgate-%s.html'%STATION if STATION else 'outlandgate.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
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
# core/terrain, opt-in by name (core/README.md "terrain/"): 38 KRELIEF (the river's meander, its bars), 43 KGROUND (the ground's library
# layers), 44 KFAR (the walls past the map, on the model's own heights), 45 KHORIZON (the walls' shadow on the floor)
CORE_TERRAIN=['38-core-relief.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
PATH.setdefault('44-core-farfield-draw.js',J('core','terrain','host','44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js',J('core','terrain','host','45-core-horizon-shade.js'))
# the biome core (core/README.md); 32 the kin (BIO.kin: the neighbours' species read in place), 33 the fungoid parts (the reed stems' rods)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','32-core-variants.js','33-core-fungoid.js','37-core-traps.js','40-core-place.js','42-core-export.js','43-core-export-host.js']   # 37: KTRAPS, the hazards' one clock
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
# core/rand and core/tags: every tree, bed, work and hazard the page places is a core/tags record (BIO.init({tags}))
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
# core/space (KSPACE): the kin's keep-clear and the biome core's
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
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'ogate',own=True),khost.EDITS_JS:khost.edits_js(HERE,'outlandgate')}
# THE NEIGHBOURS' SPECIES, read in place (as biomes/eastabyss and ebadlands' stations read theirs): ebadlands' Fremont cottonwood (the braid
# bars and the banks), Gambel oak and bigtooth maple (the floor's edges), grown by core/biome's BIO.kin in src/60. Each kit's species and
# tree builders slot after the host stage (45) and before this kit (50), in their own registry, closed by a one-line kitEnd; its pack
# carries only the families those builders draw with
KIN={'ebadlands':(['50-biome-ebadlands-species.js','55-biome-ebadlands-trees.js'],'EBADLANDS',['bark.aspen','leaf.round','leaf.lobed','wood.silver'])}
KIN.update({k:tuple(v) for k,v in SJ.get('kin',{}).items()})
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(KIN.items())):
    _d=os.path.normpath(os.path.join(HERE,'..',_k));_c='abcdefgh'[_i]
    for _j,_f in enumerate(_fs): PATH['47%s%d-%s'%(_c,_j,_f)]=os.path.join(_d,'src',_f)
    VIRTUAL['47%s9-%s-end.js'%(_c,_k)]=chr(10)+'BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)'%_api+chr(10)
    _pj=os.path.join(_d,'tex','pack.json')
    with open(_pj,encoding='utf-8') as _fh: _fam=sorted(_json.load(_fh).get('families',{})) if os.path.isfile(_pj) else []
    VIRTUAL['44%s-host-matlib-pack-%s.js'%(_c,_k)]=matlib_pack.fragment(_d,_k,exclude=[f for f in _fam if f not in _keep])
# core/hazard (KHAZ, PLAN.md section 6): the river's drowning, the outburst flood on its cycle, the summer heat (87-host-hazards.js)
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
# THE FAUNA (kits/fauna, PLAN.md section 4): the bundle's groups this land draws from (its own 'outlands': the hexapods, the ostrich, the
# runner bird and the golden bird, on the 'wild' file's builders and the 'hyperjungle' file's bird; 'livestock' the goat), vertex-coloured
# (no packed detail maps); placed by FAUNALANDS (kits/fauna's fauna by land, read by path) in 87b-host-fauna.js
sys.path.insert(0,J('kits','fauna'))
import fauna_bundle as _fb
VIRTUAL['86f-host-fauna-bundle.js']=_fb.bundle(['hyperjungle','wild','livestock','outlands'],tex=False)
for f,pth in {'86g-fauna-lands.js':'kits/fauna/fauna-lands.js','86h-fauna-lands-host.js':'kits/fauna/fauna-lands-host.js'}.items(): PATH.setdefault(f,J(pth))
for f in VIRTUAL: PATH[f]=None
# the shared atmosphere (core/atmos/README.md): its core, presets, export, the sky's light, the weather, the shared sky; height fog and
# THE FOG BELT (sky/89-atmos-j-fog.js, ATMOS.fogBelt: PLAN.md section 12, C1), the rain cover
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
# 89-atmos-fx-katabatic: the gap's wind (the shared amendment: the Outland Bore down the gap by night, the Silk-Draught up it by day)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-katabatic.js']+SJ.get('fx',[]): PATH[f]=J('core','atmos','fx',f)
# core/water (core/water/README.md): Hau-Gel's braids as WATER.flow ribbons (89zw-host-water.js)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['53-core-water-terraces.js','53b-core-water-terraces-draw.js','56-core-water-breakup.js','60-core-water-fields.js']: PATH.setdefault(f,J('core','water','ext',f))
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME)'); sys.exit(1)
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf-8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and not f.startswith('47') and not (PATH[f] and os.sep+'core'+os.sep in os.path.normpath(PATH[f])):   # the kin are their own builds' to lint
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
