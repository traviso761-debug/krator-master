#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: Pinnacle Rock (PLAN.md), its rock and its site (P0-P1).

  00-head.html        page shell, opens <script>
  10..38              BIOME CORE (core/biome), core/rand, core/tags, core/space, core/export, the material library;
                      core/terrain: 37-core-stacks (KSTACKS: the rock), 38-core-relief (KRELIEF: the open world's noise)
  39-pr-world-data    GENERATED (tools/world_data.py): the scale model round the site (region/data, cut by
                      tools/scale-model/extract_region.py), decoded at build time
  40-pr-layout        THE PLAN as data (the settled layout, PLAN.md section 1)
  41-world-fields     the open world's fields, read in place (openworld/little-demo/src): WORLD.H, the land at 1:1
  42-pr-world         HOST: WORLD.init, the knoll's height at the south foot
  45-host-stage       HOST: renderer, light, the floor (the model's), the rock (KSTACKS records from the plan), LAND
  46, 47, 50..70      the NECANYONS kit and its land fragment, read in place (biomes/necanyons/src)
  48a..48f            the HYPERJUNGLE kit, read in place (biomes/hyperjungle/src)
  82-host-sky         the hyperjungle's sky, read in place
  86-pr-far           HOST: the far terrain, the model's land to 60 km
  88-host-build       HOST: the build order (the kit off the town's ground, the forest out of the farms)
  90..98              HOST (core/host)
  99-host-take        the page handed to core/host
  99-tail.html        closes <script>

The kits never reference a host global except through BIO.host (BIOME-API.md); build.py greps their fragments for the
forbidden names (this page's own fragments name PALISADE and RIVER, so they are not scanned).
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
OUT=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith("--") else "pinnacle-rock.html"
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
CORE_TERRAIN=['37-core-stacks.js','38-core-relief.js','39-core-cavern.js']   # KSTACKS (the rock); KRELIEF (the noise the open world's fields take); KCAVERN (the Deep Root cavern, P3d)
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome (core/README.md): one copy for every kit. 35-core-anim: the hyperjungle's fauna
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','35-core-anim.js','36-core-walker.js','37-core-traps.js','40-core-place.js','42-core-export.js','43-core-export-host.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page). The canyon floor's forest is the hyperjungle's, in its
# own registry, slotted before this kit's fragments; its sky (the standard Krator sky with the giant) is read in place too
HJ=os.path.normpath(os.path.join(HERE,'..','..','biomes','hyperjungle'))
KITS={'41-hyperjungle-globals.js':'src/41-hyperjungle-globals.js','48a-hj-species.js':'src/50-biome-hyperjungle-species.js',
      '48b-hj-trees.js':'src/55-biome-hyperjungle-trees.js','48c-hj-fauna.js':'src/58-biome-hyperjungle-fauna.js',
      '48d-hj-floor.js':'src/60-biome-hyperjungle-floor.js','48e-hj-dress.js':'src/65-biome-hyperjungle-dress.js',
      '48f-hj-build.js':'src/70-biome-hyperjungle.js','82-host-sky.js':'src/82-host-sky.js'}
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
for slot,p in KITS.items(): PATH[slot]=os.path.join(HJ,p)
# the NECANYONS kit and its land fragment (47: the height, the fields, the meshes; LAND in 45 says what differs here), read
# in place: its own stage (45), build (88) and page (99) are this page's
NC=os.path.normpath(os.path.join(HERE,'..','..','biomes','necanyons'))
for f in ('46-biome-necanyons-layout.js','47-host-land.js','50-biome-necanyons-species.js','55-biome-necanyons-trees.js',
          '57-biome-necanyons-carnivores.js','60-biome-necanyons-floor.js','70-biome-necanyons.js'):
    PATH[f]=os.path.join(NC,'src',f)
# the open world's fields (openworld/little-demo/src/41-world-fields.js), read in place: the land round the site at 1:1
PATH['41-world-fields.js']=os.path.normpath(os.path.join(HERE,'..','..','openworld','little-demo','src','41-world-fields.js'))
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
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock (core/clock), the panel and
# the probe. src/99-host-take.js hands it the page (KHOST.take). A local src/ copy with the same name wins (KNOWN_ISSUES.md).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','core','host')))
import host as khost
# THE WHOLE VIEWER (owner, 2026-10-19: "make sure pinnacle rock is accommodating ALL relevant core modules including the
# viewer"): host.FULL, the shell and the record inspector, stocks, marks (they supersede the polytool), pictures, the
# minimap, the editor and the cutaway, with core/edits, core/space and core/minimap; the page's edits log inlined
# (host.edits_js: <build>/edits.json, or a newer browser draft)
CORE_HOST=khost.FULL
khost.resolve(PATH,CORE_HOST)
# core/walk (KWALK): the floors a walker stands on that the ground does not carry (the decks, the climbs, the bridges, the
# Stair, the lift road, the Deep Root: 89h-host-walk.js, and KCAVERN writes its own); core/lod (every build takes it:
# 09 defines LOD, 97 applies it to the finished scene); core/atmos's core, presets, wave clock and sky light with
# core/water (the still water: the paddies, the spring, the seep pond, the rain pool: 89w-host-water.js)
CORE_X={'20-core-walk.js':('walk','20-core-walk.js'),'09-lod.js':('lod','09-lod.js'),'97-lod-auto.js':('lod','97-lod-auto.js')}
for f in ('89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-a-waves.js','89-atmos-b-skylight.js'): CORE_X[f]=('atmos',f)
for f in ('20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js'): CORE_X[f]=('water',f)
for f,(d,n) in CORE_X.items():
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core',d,n))
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record, PLAN.md): the record and its browser half, and the packs of the library
# textures each kit's materials.json names, generated from the committed tex/ (tools/textures/pack.py). Without a
# tex/pack.json a pack is empty and its kit keeps its procedural textures (as in the open world, which carries none).
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
CORE_M=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record'))
for f in CORE_MAT:
    if f not in PATH: PATH[f]=os.path.join(CORE_M,f)
# SIDECAR PACKS (tools/textures/matlib_pack.py): the maps go in files beside the page (dist/pinnacle-rock.tex.js), loaded by plain <script src> tags ahead of the page's code, so the page opened from
# disk keeps its textures. --inline-packs puts them back in the page (one self-contained file).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
# named -host- (the FORBID scan skips it: base64 may spell a forbidden word) and numbered 44: the host stage (45) reads it
sys.path.insert(0,os.path.join(HERE,'tools'))
import world_data as _wd
# the Beast Riders kit's detail maps (kits/beast-riders/materials.json), only the families the roosts draw with (89-host-roosts.js)
BRK=os.path.normpath(os.path.join(HERE,'..','..','kits','beast-riders'))
BR_FAMS=('wood','timber','shingle','rope','straw','sandstone','yard')   # yard: the town's streets (89c)
import json as _json
BR_SKIP=tuple(f for f in _json.load(open(os.path.join(BRK,'materials.json'),encoding='utf-8'))['families'] if f not in BR_FAMS)
# THE TOWN (PLAN.md P3a): core/city (KCITY) and the Beast Riders' buildings (CAT), each READ IN PLACE and sealed in a closure
# of its own: KCITY as the isle demo and Verge bundle it (settlements/isle-demo/bundles.py kcity_bundle); CAT the catalog's
# core, the kit's own buildings (its mounts' houses, trades, larger houses, rock-cut pieces and tents) and its ports of
# Girder's and Mav's Refuge's buildings (kits/beast-riders/towns.py: the towns' maps beside the page, .tex.brtowns.js),
# the catalog's runtime and its detail maps (KF_TEX, the catalog's and the kit's packs: .tex.kftex.js). No furniture: the
# catalog's pieces are not on this page (a building's F.furn notes the key and places nothing). CAT.proto(key, v) builds
# one at the origin into a group; the isle demo's src/58-isle-protos.js (read in place) flattens it for instancing.
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','isle-demo')))
import bundles as _isle
CATD=os.path.normpath(os.path.join(HERE,'..','..','kits','catalog'))
CAT_OWN=['50-br-mounts.js','51-br-trades.js','52-br-trades-b.js','53-br-trades-c.js','54-br-houses.js','55-br-rockcut.js',
         '56-br-rockcut-b.js','70-br-tent-kit.js','71-br-tents-dwell.js','72-br-tents-trade.js','73-br-tents-pens.js',
         '74-br-tents-bands.js','75-br-tents-bounds.js','79-br-camp.js']
def kf_tex_json():
    """KF_TEX (kits/beast-riders/build.py kf_tex): the catalog's packed detail maps with the kit's over them by family"""
    import base64
    out={}
    for d in (os.path.join(CATD,'tex'),os.path.join(BRK,'tex')):
        pack=_json.load(open(os.path.join(d,'pack.json'),encoding='utf-8'))
        for fam,e in sorted(pack['families'].items()):
            name=e['files'].get('map')
            if name:
                out[fam]={'lib':e['lib'],'scale':e['scale'][0],'mean':e['tint']['mean'],
                          'map':'data:image/webp;base64,'+base64.b64encode(open(os.path.join(d,name),'rb').read()).decode()}
    return _json.dumps(out,sort_keys=True)
CAT_PROTO=r'''
/* CAT.proto(key, v, o): the building at the origin (y 0, front +z) in a new group, out of the closure's scene; the kit's own
   meshes take the library's detail maps (KF_API.detailize, as the kit's sheet does), a port keeps its town's materials */
function catProto(key, v, o) {
  var A = ASSET_BY_KEY[key]; if (!A) return null;
  /* o: {span, seed} for a parametric piece (a hedge's or a fence's run, BR_RUN) */
  var g = buildAsset(key, 0, 0, 0, { variant: v | 0, seed: o && o.seed != null ? o.seed : 1, y: 0, span: o ? o.span : undefined }); if (!g) return null;
  scene.remove(g); INSTANCES.length = 0;
  if (!A.port) { g.traverse(function (m) { if (m.isMesh) m.userData.furniture = true; }); KF_API.detailize(g); }
  var D = (A.variantDims && A.variantDims[v | 0]) || A;
  g.userData = { key: key, v: v | 0, w: D.w, d: D.d, h: D.h, error: g.userData.error, port: A.port || null };
  return g;
}
function catDims(key, v) { var A = ASSET_BY_KEY[key]; if (!A) return null; var D = (A.variantDims && A.variantDims[v | 0]) || A; return { w: D.w, d: D.d, h: D.h, variants: A.variants || 1 }; }
return { proto: catProto, dims: catDims, ASSET_BY_KEY: ASSET_BY_KEY, PORTS: BR_PORTS, TRADES: (typeof BR_TRADES !== 'undefined' ? BR_TRADES : null),
  CAMP: (typeof BR_CAMP !== 'undefined' ? BR_CAMP : null), RUN: (typeof BR_RUN !== 'undefined' ? BR_RUN : null),
  TRIBES: (typeof BR_CAMP_TRIBES !== 'undefined' ? BR_CAMP_TRIBES : null) };
'''
def cat_fragment(side):
    if BRK not in sys.path: sys.path.insert(0,BRK)
    import towns
    tjs,_tf=towns.bundle(side)
    if side is not None:
        side['kftex']=kf_tex_json()
        kft='var KF_TEX = (typeof KMAT_SIDE !== \'undefined\' && KMAT_SIDE.kftex) || null;\n'
    else:
        kft='var KF_TEX = %s;\n'%kf_tex_json()
    return _isle.safe('/* CAT: the Beast Riders\' buildings in one closure (settlements/pinnacle-rock/build.py cat_fragment). GENERATED: edit '
                      'kits/catalog, kits/beast-riders and the towns (kits/beast-riders/towns.py). */\n'
                      'var CAT = (function(){\nvar scene = new THREE.Group();\n'+_isle.body([os.path.join(CATD,'krator-furniture-core.js')])+
                      _isle.body([os.path.join(BRK,'src',f) for f in CAT_OWN])+
                      '/* ---- the towns sealed (GENERATED: kits/beast-riders/towns.py) ---- */\n'+tjs+'\n'+
                      _isle.body([os.path.join(BRK,'src','60-br-ports.js'),os.path.join(CATD,'krator-furniture-runtime.js')])+kft+
                      _isle.body([os.path.join(CATD,'krator-furniture-detail.js')])+CAT_PROTO+'})();\n')
# the isle demo's prototype flattener, read in place (its header: CAT.proto's group into one geometry per material)
PATH['89a-host-isle-protos.js']=os.path.normpath(os.path.join(HERE,'..','isle-demo','src','58-isle-protos.js'))
# THE FLYERS (PLAN.md P2; flyers/README.md): Girder's flyers READ IN PLACE (settlements/girder/src 84-flyers.js, 84b, the
# generic sections of 84a and 84c lifted by their section markers; its palette and detail maps), sealed in one closure
# with this page's world, obstacles, bays and starting circuits (flyers/). Girder's 84 opens a closure its 84d closes;
# this page does not take 84d (its hooks and audits are Girder's towers'), so the sandbox closes it.
GIRDER=os.path.normpath(os.path.join(HERE,'..','..','settlements','girder'))
FLYD=os.path.join(HERE,'flyers')
def _rd(p):
    with open(p,encoding='utf-8') as f: return f.read()
def _lift(path,start,end=None):
    s=_rd(path);i=s.find(start) if start else 0
    if i<0: sys.exit('build.py: %s has lost the marker %r (the flyers lift its sections by it)'%(path,start))
    j=len(s) if end is None else s.find(end,i)
    if j<0: sys.exit('build.py: %s has lost the marker %r (the flyers lift its sections by it)'%(path,end))
    return s[i:j]
def flyers_fragment():
    G=lambda f:os.path.join(GIRDER,'src',f);F=lambda f:_rd(os.path.join(FLYD,f))
    A,C=G('84a-flyers-routes.js'),G('84c-flyers-update.js');SEC='/* ------------------------------------------------------------------ '
    parts=[('flyers/10-shim.js',F('10-shim.js')),('settlements/girder/src/05-palette.js',_rd(G('05-palette.js'))),('flyers/20-world.js',F('20-world.js')),
      ('settlements/girder/src/48-detail.js',_rd(G('48-detail.js'))),('settlements/girder/src/84-flyers.js',_rd(G('84-flyers.js'))),
      ('flyers/30-routes.js',F('30-routes.js')),
      ('settlements/girder/src/84a-flyers-routes.js: paths',_lift(A,SEC+'paths',SEC+'roost bays')),
      ('settlements/girder/src/84a-flyers-routes.js: flyCurveHit, flyCurveTight',_lift(A,'var flyLastHit = null;','function flyBV(')),
      ('settlements/girder/src/84a-flyers-routes.js: arrivals, departures, routes, meshes',_lift(A,'function flyBV(')),
      ('settlements/girder/src/84b-flyers-animals.js',_rd(G('84b-flyers-animals.js'))),
      ('settlements/girder/src/84c-flyers-update.js: pose, circuits',_lift(C,None,SEC+'initial population')),
      ('flyers/40-start.js',F('40-start.js')),
      ('settlements/girder/src/84c-flyers-update.js: scheduler, update',_lift(C,SEC+'scheduler + per-frame update')),
      ('flyers/90-out.js',F('90-out.js'))]
    body=''.join('/* ---- %s ---- */\n%s\n'%(n,s) for n,s in parts)
    return ('/* PRFLY: Girder\'s flyers on Pinnacle Rock\'s roosts (build.py flyers_fragment). GENERATED: edit flyers/ and settlements/girder/src. */\n'
            'var PRFLY=null;\ntry{PRFLY=(function(pageTerrainH){\nvar _PRFLY_OUT=null;\n'+body+'})();   /* Girder\'s 84 closure, closed here (84d is not taken) */\n'
            'return _PRFLY_OUT;\n})(terrainH);}catch(e){reportErr(\'flyers: \'+(e&&e.stack||e));}\n_mark(\'flyers\');\n')
GFLY=tuple(f for f in _json.load(open(os.path.join(GIRDER,'tex','pack.json'),encoding='utf-8'))['families'] if not f.startswith('fly'))
VIRTUAL={'39-pr-world-data.js':_wd.fragment(os.path.join(HERE,'region')),
         khost.EDITS_JS:khost.edits_js(HERE,'pinnacle-rock'),
         '49a-pr-kcity.js':_isle.kcity_bundle(),
         '49b-host-cat.js':cat_fragment(SIDE),
         '44d-host-matlib-pack-girder-flyers.js':_mp.fragment(GIRDER,'girder',exclude=GFLY,side=SIDE),
         '89b-host-flyers.js':flyers_fragment(),
         '44-host-matlib-pack.js':_mp.fragment(NC,'necanyons',side=SIDE),
         '44b-host-matlib-pack-hyperjungle.js':_mp.fragment(HJ,'hyperjungle',side=SIDE),
         '44c-host-matlib-pack-beast-riders.js':_mp.fragment(BRK,'beast-riders',exclude=BR_SKIP,side=SIDE)}
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and ('-biome-' in f or f.startswith('48')):   # the kits' fragments
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'pinnacle-rock.tex.js')
open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
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
