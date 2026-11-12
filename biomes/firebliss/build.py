#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the Firebliss Range (PLAN.md).

  00-head.html      page shell, opens <script>
  10..44            CORE (biome core, terrain, rand, tags, space, hazard, camp)
  44m-host-model    GENERATED (model_site.py): the scale model 5.1 round the station, its heights, water and climate
  44z-host-site     the station's site (PLAN.md sections 7, 7a): a station replaces it
  45-host-stage     HOST: renderer, lights, the land from the model and the site (before the thermal ground)
  46-geyser-layout  the geyser kit's layout, read in place (biomes/geyser: GEYSER.lay)
  47-host-land      HOST: the thermal layout laid, terrainH, waterH, the fields, BIO.init
  49*               OTHER KITS read in place (the Throne, Copper Glacier, the geyser kit's flora and show)
  50..79            THIS KIT (Firebliss: its species, its floor, the hunters)
  80..98            HOST (ground, far field, hazards, sky, air, water, build)
  99-tail.html      closes <script>

  python3 build.py                     dist/firebliss.html, station 1: the Great Firebliss Vale
  python3 build.py --station <name>    dist/firebliss-<name>.html: stations/<name>/ added to src/: glen, east, mons

THE BRANCH'S PIECES. Three core pieces the plan asks for (the crust and the night air of core/hazard 22, the plume of core/atmos
fx/ashplume) are on origin/claude/core-plan-features-229d2a, not yet on main. They are read IN PLACE: from the working tree when
the branch is merged, else from the branch by `git show`. Nothing is copied into this kit. A checkout that has neither stops
the build with a message naming the branch (KNOWN_ISSUES.md).
"""
import os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
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
OUT=_args[0] if _args else ('firebliss-%s.html'%STATION if STATION else 'firebliss.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
import json as _json
# a STATION (PLAN.md section 7a): stations/<name>/'s numbered fragments are added to src/'s (a name in both is the station's: every station has its
# own 44z-host-site.js), and its station.json names its centre on the 5.1 map ("site")
SJ={'site':[183,1315],'key':'vale'}   # station 1, the Great Firebliss Vale: the lake's north shore (PLAN.md sections 7, 7a)
_sd=None
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
# the biome core from core/biome: 31b leaves on stems and 31j a limb's joint (the borrowed kits' builders call them), 32 the variant pools and kin (the
# Throne's ash pine and tree fern as this kit's kin), 33 the fungoid parts, 34 the octahedral impostors (the ash pine passes 7 m), 35 the motion modes,
# 36 the walker, 37 the one clock (KTRAPS.cycle: the geyser kit's hazards), 39 the lean, 41 the environmental fields
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js',
 '35-core-anim.js','36-core-walker.js','37-core-traps.js','39-core-lean.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
# core/terrain, opt-in by name (PLAN.md section 8): 38 KRELIEF (the Warras graded), 42 KFROST (sorted circles on the high ash flats), 43 KGROUND, 44 KFAR,
# 45 KHORIZON, 47 KTHERM (the ground's heat between the vents); KSTRATA, KLAVA and KGLACIER are not taken (PLAN.md section 8, a line each)
CORE_TERRAIN=['38-core-relief.js','42-core-frost.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js','47-core-therm.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
for f in ['44-core-farfield-draw.js','45-core-horizon-shade.js']: PATH.setdefault(f,J('core','terrain','host',f))
# core/hazard (KHAZ, 21 its shapes that flow and pool) and the one clock (KTRAPS.cycle, 37 above); core/camp (KCAMP: the census and the pitch)
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
PATH.setdefault('21-core-hazard-flow.js',J('core','hazard','21-core-hazard-flow.js'))
for f in ['10-camp-cultures.js','20-camp-census.js','30-camp-pitch.js']: PATH.setdefault(f,J('core','camp',f))
# core/shadow (KSHADOW): off at load (BACKPORT.md section 1)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the host shell from core/host, the whole interface and the authoring tools. src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
# the shared atmosphere: its core, presets, particles, export, waves, skylight, the weather and its selector; height fog, the rain's occlusion map,
# lightning, snow that lies
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
PATH['89-atmos-c-hostbind.js']=J('core','atmos','host','89-atmos-c-hostbind.js')
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js','89-atmos-fx-snowcover.js']: PATH[f]=J('core','atmos','fx',f)
# core/water: the tarns (WATER.open), the Warras (WATER.flow); ext 56 breakup, 57 the audit, 58 the reflections switch, 60 the shore's fields, 61 the
# plume of a stream's silt; geyser/52 and 52b the springs and geysers (the geyser kit's show draws through them)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['56-core-water-breakup.js','57-core-water-audit.js','58-core-water-mirror.js','60-core-water-fields.js','61-core-water-plume.js']:
    PATH.setdefault(f,J('core','water','ext',f))
for f in ['52-core-water-geyser.js','52b-core-water-geyser-draw.js']: PATH.setdefault(f,J('core','water','geyser',f))
# THE BRANCH'S PIECES (the docstring): core/hazard 22 (KHAZ.crust, under, night, front) and core/atmos fx/ashplume (ATMOS.ashPlume)
BRANCH='origin/claude/core-plan-features-229d2a'
OWED={'22-core-hazard-env.js':'core/hazard/22-core-hazard-env.js','89-atmos-fx-ashplume.js':'core/atmos/fx/89-atmos-fx-ashplume.js'}
LISTING='--list-sources' in sys.argv   # tools/build_sources.py: no subprocess may run before report(); the files those read are named instead
VIRTUAL={}
for f,rel in OWED.items():
    if os.path.isfile(J(rel)): PATH[f]=J(rel); continue
    if LISTING: continue
    _g=subprocess.run(['git','show',BRANCH+':'+rel],cwd=ROOT,capture_output=True,text=True,encoding='utf-8')
    if _g.returncode: sys.exit('build.py: %s is neither in the working tree nor on %s (git fetch origin, or merge that branch first): KNOWN_ISSUES.md'%(rel,BRANCH))
    VIRTUAL[f]=_g.stdout.replace('\r\n','\n')
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page; biomes/ringisles/build.py reads them the same way). Each kit is ONE block of its
# fragments in its own order (BIO.kit at the top of its first, BIO.kitEnd at the end of its last): the slots sort after this page's BIO.init (47) and
# before this kit (50). The geyser kit's layout (46) is data, read before the land is made (its relief is part of the land).
KITS={'46-geyser-layout.js':'geyser/src/46-biome-geyser-layout.js',
 '49a1-throne-flows.js':'throne/src/46-biome-throne-flows.js','49a2-throne-species.js':'throne/src/50-biome-throne-species.js',
 '49a3-throne-trees.js':'throne/src/55-biome-throne-trees.js','49a4-throne-floor.js':'throne/src/60-biome-throne-floor.js',
 '49a5-throne-build.js':'throne/src/70-biome-throne.js',
 '49c1-copperglacier-species.js':'copperglacier/src/50-biome-copperglacier.js','49c2-copperglacier-floor.js':'copperglacier/src/60-biome-copperglacier-floor.js',
 '49c3-copperglacier-build.js':'copperglacier/src/70-biome-copperglacier.js',
 '49e1-geyser-species.js':'geyser/src/50-biome-geyser-species.js','49e2-geyser-trees.js':'geyser/src/55-biome-geyser-trees.js',
 '49e3-geyser-sinter.js':'geyser/src/57-biome-geyser-sinter.js','49e4-geyser-floor.js':'geyser/src/60-biome-geyser-floor.js',
 '49e5-geyser-show.js':'geyser/src/65-biome-geyser-show.js','49e6-geyser-build.js':'geyser/src/70-biome-geyser.js'}
LAST={'throne':'49a5-throne-build.js','copperglacier':'49c3-copperglacier-build.js','geyser':'49e6-geyser-build.js'}
for slot,p in KITS.items(): PATH[slot]=os.path.join(ROOT,'biomes',p)
for f in SJ.get('drop',[]): PATH.pop(f,None)
for k,slot in LAST.items():
    if slot not in PATH: continue
    if not re.search(r'^[^/\n]*BIO\.kitEnd\(',open(PATH[slot],encoding='utf8').read(),re.M):
        sys.exit('KIT %s: its last listed fragment (%s) does not call BIO.kitEnd: list the fragment that does'%(k,KITS[slot]))
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
for f in CORE_MAT: PATH.setdefault(f,J('core','materials','record',f))
# SIDECAR PACKS (tools/textures/matlib_pack.py, as ringisles writes them): the maps in files beside the page (dist/firebliss.tex.<kit>.js); the borrowed
# kits' packs carry only the maps of the species read here. --inline-packs puts them back in the page
sys.path.insert(0,J('tools','textures'))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
def _fams(kit):
    pj=os.path.join(ROOT,'biomes',kit,'tex','pack.json')
    return sorted(_json.load(open(pj,encoding='utf8')).get('families',{})) if os.path.isfile(pj) else []
# the Throne: the ash pine's and the tree fern's maps only (their barks, LIBBARK 1 and 8 in its 50: bark.charcoal, bark.twisted; needles and fronds)
THRONE_KEEP={'bark.charcoal','bark.twisted','leaf.needle','leaf.fern','card.treefern','card.ferngreen'}
EXCL={'throne':[f for f in _fams('throne') if f not in THRONE_KEEP],
      'geyser':[f for f in _fams('geyser') if f.startswith('ground.')],   # this host paints its own ground (84)
      'copperglacier':[f for f in _fams('copperglacier') if f.startswith('ground.') or f.startswith('ice.') or f.startswith('rock.gneiss') or f=='rock.granite']}
VIRTUAL.update({'44-host-matlib-pack.js':_mp.fragment(HERE,'firebliss',own=True,side=SIDE),khost.EDITS_JS:khost.edits_js(HERE,'firebliss')})
for i,k in enumerate(['throne','copperglacier','geyser']):
    VIRTUAL['44%s-host-matlib-pack-%s.js'%('bcd'[i],k)]=_mp.fragment(os.path.join(ROOT,'biomes',k),k,exclude=EXCL[k],side=SIDE)
# THE SCALE MODEL round the station (model_site.py, at build time): the page stands on the model's heights
sys.path.insert(0,HERE)
import model_site as _ms
_px,_py=SJ['site']
VIRTUAL['44m-host-model.js']=_ms.fragment(_px,_py,SJ.get('key','vale'))
# THE RESOURCE DATA round the site (kits/resources, read in place by Copper Glacier's res_site.js): the nodes in the square, as FB_RES
_node=find_node()
if not _node and not LISTING: sys.exit('build.py: node is needed to read the resource data (res_site.js)')
for _f in [J('biomes','copperglacier','res_site.js'),J('kits','resources','src','45r-res-field.js'),J('kits','resources','data','geology.json')]:
    with open(_f,'rb') as _fh: _fh.read()
if LISTING: _r=type('R',(),{'returncode':0,'stdout':'{}'})()
else: _r=subprocess.run([_node,J('biomes','copperglacier','res_site.js'),str(_px),str(_py),'2700'],capture_output=True,text=True,encoding='utf-8')
if _r.returncode: sys.exit('build.py: res_site.js failed\n'+_r.stderr[:800])
VIRTUAL['44r-host-res.js']='\n// the resource data round this station (biomes/copperglacier/res_site.js, read in place, from kits/resources/data/geology.json; build time)\nconst FB_RES='+_r.stdout+';\n'
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and 'core-water' not in f and f not in OWED:
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
# a station's page shares the main page's sidecars (the same kits, the same packs): it writes them again, identical, and prunes nothing
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'firebliss.tex.js',prune=not STATION)
open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html,re.S)
js=m.group(1) if m else ''
chk=os.path.join(HERE,'.syntax.js'); open(chk,'w',encoding='utf8',newline='\n').write(js)
node=find_node()
r=subprocess.run([node,'--check',chk],capture_output=True,text=True) if node else None
side=sum(os.path.getsize(os.path.join(DIST,f)) for f in os.listdir(DIST) if f.startswith('firebliss.tex.'))
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB; sidecar packs {side//1024} KB)  '+('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode==0 else 'SYNTAX ERROR\n'+r.stderr[:800]))
ki=os.path.join(HERE,'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op=[l for l in open(ki,encoding='utf8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
