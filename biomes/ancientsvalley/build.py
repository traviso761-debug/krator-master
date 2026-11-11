#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the Ancient's Valley, the overlay on the two lowlands (PLAN.md).

Stations, like the Cut's and the lowland kits': each is its own page from the same kit (PLAN.md section 12).
  python3 build.py                        station 0, THE OVERLOOK: src/ as it is -> dist/ancientsvalley.html
  python3 build.py --station <name>       stations/<name>/'s fragments replace src/'s of the same name; its station.json
                                          names its page ("out"), its region record ("region"), more kits ("kits", "packs")

  00-head.html        page shell, opens <script>
  07..44              core/export, core/rand, the BIOME CORE (core/biome), core/tags, core/space, core/walk, core/shadow,
                      core/terrain (KRUBBLE, the relief, KGROUND), the material library and the packs (this kit's; each
                      read-in kit's as a sidecar), core/water, core/atmos
  39-mp-interiors-bundle  (generated) kits/interiors and kits/ancients-interiors, which the metropolis's plans draw their
                      windows from
  39v-mp-vehicles-bundle  (generated) kits/motor-vehicles' Ancients culture with its ruin states (KratorVehicles): the wrecks
  39x-xp-bundle       (generated) kits/extraplanar (KratorExtraplanar): the hunters, the phenomena and the portals of the drowned city's theme
  40..46              THE METROPOLIS KIT's data side, read in place (kits/metropolis: the towers' records, plans, facades,
                      shells, designs)
  41-av-field         THE VALLEY's data side: the model's ground, the fields (zone, scar, feral, taint), the city's plan
                      ([G data]; tests/test-av.js)
  41b-av-wrecks       the ruined vehicles' records on the streets (AV.wrecks; [G data]; tests/test-av.js)
  44n-host-region     (generated) the station's record cut from the scale model (region/station-<name>.json: AV_REGION)
  46z-host-stage      HOST: the station's say (STAGE): its site, ground, zones, fields, layers, views (after the metropolis records: it reads their footprints)
  46-av-feral         the feral wrap laid on a kit read in place (AV.feralKit): the scale, the species kept, the tint
  47-host-land        HOST: renderer, light, the ground mesh (KGROUND), BIO.init
  48a..48d            the SWLOWLANDS kit, read in place (species, trees, floor, build)
  48e..48h            the NWLOWLANDS kit, read in place
  50..60              THE METROPOLIS KIT's drawing side, read in place (the hero kit, the heroes, the designs, the rubble,
                      the floors and ruins, the shells' bake and draw); not its stage, land, sky or take
  70-host-city        HOST: the valley's city stage: the towers as records on the ground, the tiers each frame, the lines
  73-host-wrecks      HOST: the ruined vehicles drawn from KratorVehicles (prototypes cloned; a pool of the nearest to the eye)
  75-host-extraplanar HOST: the extraplanars from KratorExtraplanar: three hunters on rounds, the phenomena and the portals as records, drawn
  88-host-build       HOST: the build order (the kits under their masks, feral; one bake; the tint)
  89a, 89s, 89t, 89w  HOST: core/atmos bound; the shared sky (the model's ridges); the weather; the lake
  90..98              HOST (core/host: camera, loop, panel, probe, the authoring tools)
  99-host-take        the page handed to core/host
  99-tail.html        closes <script>

The core and the kits never reference a host global except through BIO.host (biomes/cut/BIOME-API.md); build.py greps the
valley's own biome fragments for the forbidden names. The metropolis kit's fragments are another kit's and are not scanned.
"""
import os, re, subprocess, sys, json

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


def load(name, path):
    import importlib.util
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


HERE=os.path.dirname(os.path.abspath(__file__)); SRC=os.path.join(HERE,'src'); DIST=os.path.join(HERE,'dist')
ROOT=os.path.normpath(os.path.join(HERE,'..','..')); CORE=os.path.join(ROOT,'core')
OUT=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith("--") else "ancientsvalley.html"
STATION=None;STN={'region':'overlook'}
if '--station' in sys.argv:
    STATION=sys.argv[sys.argv.index('--station')+1]
    STN_DIR=os.path.join(HERE,'stations',STATION)
    STN=dict(STN,**json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf-8')))
    OUT=STN['out']
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# core/terrain: KRUBBLE (the ruins' heaps, kits/metropolis 57), KRELIEF (noise and landforms), KGROUND (the ground's layers); listed by name
CORE_TERRAIN=['37c-core-rubble.js','38-core-relief.js','43-core-ground.js']
# the biome core from core/biome (core/README.md): one copy for every kit; 31b and 34 for the metropolis's leaf sets and impostors
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','32-core-variants.js','33-core-fungoid.js','33b-core-bamboo.js','34-core-impostor.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
CORE_SPACE=['20-core-space.js']
CORE_WALK=['20-core-walk.js']
CORE_SHADOW={'10-core-shadow.js':'shadow','12-core-shadow-host.js':'shadow/host'}
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page). The two lowlands under the overlay (PLAN.md section 5:
# the south-west on the floor and the shelf, the north-west on the north strip; the page's zones mask them), slotted after
# BIO.init (47) and before the metropolis kit's drawing fragments; a station adds more through its station.json "kits"
SW=os.path.normpath(os.path.join(HERE,'..','swlowlands')); NW=os.path.normpath(os.path.join(HERE,'..','nwlowlands'))
KITS={'48a-swlow-species.js':(SW,'src/50-biome-swlowlands-species.js'),'48b-swlow-trees.js':(SW,'src/55-biome-swlowlands-trees.js'),
      '48c-swlow-floor.js':(SW,'src/60-biome-swlowlands-floor.js'),'48d-swlow-build.js':(SW,'src/70-biome-swlowlands.js'),
      '48e-nwlow-species.js':(NW,'src/50-biome-nwlowlands-species.js'),'48f-nwlow-trees.js':(NW,'src/55-biome-nwlowlands-trees.js'),
      '48g-nwlow-floor.js':(NW,'src/60-biome-nwlowlands-floor.js'),'48h-nwlow-build.js':(NW,'src/70-biome-nwlowlands.js')}
# THE METROPOLIS KIT, read in place (kits/metropolis; PLAN-ANOMALIES.md section 13): its records and plans ([G data]) and its
# drawing side; its own stage (70), land (47), sky (89) and take (99) stay out, and so do its interiors (56), its cut-away (58),
# the Ancients kit's builders (55, 46e: they bring kits/ancients with them; a later station) and its flora vend (59d)
MPD=os.path.join(ROOT,'kits','metropolis')
MP_FRAGS=['40-mp-records.js','41-mp-plans.js','42-mp-facade.js','43-mp-shell.js','44-mp-audit.js','46-mp-designs.js','46b-mp-ancients.js','46c-mp-planned.js','46d-mp-gridplan.js',
          '50-mp-kit.js','52-mp-hero-spindle.js','53-mp-hero-ledger.js','54-mp-hero-designs.js','55-mp-hero-ancients.js','57-mp-debris.js','59-mp-floors.js','59b-mp-ruin-design.js','60-mp-shell-host.js']
# a station's own fragments of the kit (station.json "mp"; the Yards: 46e, the industry's third of each kind, and the yards' pieces)
MP_FRAGS=MP_FRAGS+[f for f in STN.get('mp',[]) if f not in MP_FRAGS]
# THE ANCIENTS KIT, read in place for THE ENGINES (the owner, 2026-11-04: an Ancient Engine or two, sparingly, for the sense of scale; kits/ancients
# 8ah-engines.js, 8ai-engines2.js: cyclopean machines the size of a town), as kits/metropolis/build.py reads it: its runtime, the two engine files,
# its materials (a copy in the kit's src/ wins, else core/materials), and its names renamed where this page has them (the registry to ANC_REG /
# ANC_REGISTER, the error panel, the ground, the ticks), so the files on disk are untouched. 70-av-city.js runs a builder into a hero (avEngine)
ANC=os.path.join(ROOT,'kits','ancients')
ANC_RUNTIME=['10-core.js','12-stats.js','30-kit.js','32-surfaces.js','34-kitdefs.js','36-decor.js','38-helpers2.js','50-registry.js','54-mat-concrete.js','69-mat-salvage.js','69w-worn.js','88y-ancients-matlib.js','8ap-host-0-lib.js']
ANC_BUILDERS=['8ah-engines.js','8ai-engines2.js']
# a station's own builders of the kit (station.json "anc"; the Yards: the industry, as kits/metropolis/build.py lists them)
ANC_BUILDERS=ANC_BUILDERS+[f for f in STN.get('anc',[]) if f not in ANC_BUILDERS]
ANC_FILES={}
for f in ANC_RUNTIME+ANC_BUILDERS: ANC_FILES[os.path.basename(f)]=os.path.join(ANC,f) if '/' in f else os.path.join(ANC,'src',f)   # a path (targets/engines/8aj-engines3.js) is the kit's target fragment
for f in ['20-textures.js','22-materials.js','68-mat-v5.js']:
    p=os.path.join(ANC,'src',f); ANC_FILES[f]=p if os.path.isfile(p) else os.path.join(CORE,'materials',f)
ANC_SUBST=[(r'\bREGISTER\b','ANC_REGISTER'),(r'\bREG\b','ANC_REG')]
SUBST={f:list(ANC_SUBST) for f in ANC_FILES}
SUBST['10-core.js']=ANC_SUBST+[(r'\bERRS\b','ANC_ERRS'),(r'\breportErr\b','ancReportErr'),(r'\bterrainH\b','ancTerrainH'),(r'\bTICKS\b','ANC_TICKS'),(r'\btick\b','ancTick'),(r'\bwindow\.onerror\b','window.ancOnerror')]
SUBST['69-mat-salvage.js']=ANC_SUBST+[(r'!!NIGHT\b','!!window.NIGHT')]
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE,'terrain',f)
if STATION:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(STN_DIR,f)
    for slot,p in STN.get('kits',{}).items(): PATH[slot]=os.path.normpath(os.path.join(HERE,p))
for slot,(d,p) in KITS.items(): PATH[slot]=os.path.join(d,p)
for f in MP_FRAGS:
    if f in PATH: sys.exit('build.py: the metropolis kit\'s %s shadows a fragment of this page' % f)
    PATH[f]=os.path.join(MPD,'src',f)
for f,p in ANC_FILES.items():
    if f in PATH: sys.exit('build.py: the Ancients kit\'s %s shadows a fragment of this page' % f)
    PATH[f]=p
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE,'biome',f)
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume is a record
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items():
    if f not in PATH: PATH[f]=os.path.join(CORE,d,f)
CORE_EXPORT=['07-core-export.js','09-core-export-adapters.js']
for f in CORE_EXPORT:
    if f not in PATH: PATH[f]=os.path.join(CORE,'export',f)
for f in CORE_SPACE:
    if f not in PATH: PATH[f]=os.path.join(CORE,'space',f)
for f in CORE_WALK:
    if f not in PATH: PATH[f]=os.path.join(CORE,'walk',f)
for f,d in CORE_SHADOW.items():
    if f not in PATH: PATH[f]=os.path.join(CORE,d,f)
# core/water (core/water/README.md): the lake and its drowned inlets (WATER.open), the far lake to the horizon
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.join(CORE,'water',f)
# core/atmos: the core, presets, export, waves, skylight, the weather (4) and its selector (9); the host binding, the weather
# binding (ATMOS.bindWeather) and the shared sky (SKY-PLAN.md S1: model, presets, shader, host), by path
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-4-weather.js','89-atmos-8-export.js','89-atmos-9-host.js','89-atmos-a-waves.js','89-atmos-b-skylight.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.join(CORE,'atmos',f)
for f in ['89-atmos-c-hostbind.js','89-atmos-e-weatherhost.js','89-atmos-h-skyhost.js']:
    PATH[f]=os.path.join(CORE,'atmos','host',f)
# the height fog (the smog: 89v-host-smog.js): the chunk in sky/, its host binding in host/
PATH['89-atmos-j-fog.js']=os.path.join(CORE,'atmos','sky','89-atmos-j-fog.js')
PATH['89-atmos-j-heightfog.js']=os.path.join(CORE,'atmos','host','89-atmos-j-heightfog.js')
PATH['89-atmos-fx-lightning.js']=os.path.join(CORE,'atmos','fx','89-atmos-fx-lightning.js')   # the mood's lightning strikes visible bolts with it (2026-11-09)
for f in ['89-atmos-fx-rainwall.js','89-atmos-fx-acid.js','89-atmos-fx-radiation.js']:   # the oily rain over the polluted half (89x-host-oilrain.js, 2026-11-09): curtains on a field, the toxic dose; radiation over the scars (89wr-host-radiation.js, 2026-11-10)
    PATH[f]=os.path.join(CORE,'atmos','fx',f)
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-k-cloudmood.js']:   # k: the clouds' mood (2026-11-09)
    PATH[f]=os.path.join(CORE,'atmos','sky',f)
# the host shell from core/host (core/host/README.md). src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,os.path.join(CORE,'host'))
import host as khost
CORE_HOST=khost.SHELL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
PATH['20-core-walk.js']=os.path.join(CORE,'walk','20-core-walk.js')   # KWALK: the House's floors and walls for the walker (75-host-house.js, 2026-11-09)
PATH['07-core-kwarp.js']=os.path.join(CORE,'shader','07-core-kwarp.js')   # KWARP, the warp the cosmetic distortions bend with (89y-host-anomaly.js, 2026-11-09)
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record) and the packs: this kit's (tex/, from materials.json by tools/textures/pack.py),
# each read-in lowland kit's (its own tex/, without its ground and tower layers) and the metropolis kit's (the towers' skins),
# as SIDECARS beside the page (dist/ancientsvalley.tex.<pack>.js, shared by every station). --inline-packs puts them in the page.
CORE_MAT=['23-mat-record.js','25-matlib-host.js','26-matlib-bind.js']
for f in CORE_MAT:
    if f not in PATH: PATH[f]=os.path.join(CORE,'materials','record',f)
sys.path.insert(0,os.path.join(ROOT,'tools','textures'))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'ancientsvalley',side=SIDE),'88x-matlib-pack-ancients.js':_mp.fragment(ANC,'ancients',side=SIDE)}
PACKS=dict({'swlowlands':'../swlowlands','nwlowlands':'../nwlowlands','metropolis':'../../kits/metropolis','ancient-transit':'../../kits/ancient-transit'},**STN.get('packs',{}))   # ancient-transit: KTRANSIT.mats reads KMAT.packed('ancient-transit', fam)
for _k,(_pn,_pd) in enumerate(sorted(PACKS.items())):
    _pj=os.path.join(HERE,_pd,'tex','pack.json')
    _ex=[f for f in (sorted(json.load(open(_pj,encoding='utf-8')).get('families',{})) if os.path.isfile(_pj) else []) if _pn!='metropolis' and (f.startswith('ground') or f.startswith('tower') or f.startswith('jetty'))]
    VIRTUAL['44%s-host-matlib-pack-%s.js'%('bcdefg'[_k],_pn)]=_mp.fragment(os.path.normpath(os.path.join(HERE,_pd)),_pn,exclude=_ex,side=SIDE)
# the station's record from the scale model (region/site.py: the ground, the water, the ridges, the cities and the basins)
_rg=os.path.join(HERE,'region','station-%s.json'%STN['region'])
VIRTUAL['44n-host-region.js']='// ==================== the station\'s record, cut from the scale model (region/site.py)\nconst AV_REGION='+open(_rg,encoding='utf-8').read().strip()+';\n'
# the interiors kits the metropolis's plans draw their windows from (kits/interiors, kits/ancients-interiors: MP.storey, MP.levelFacade);
# no furniture: this page opens no storey
ib=load('av_ix_bundle',os.path.join(ROOT,'kits','interiors','kit_bundle.py'))
ab=load('av_ai_bundle',os.path.join(ROOT,'kits','ancients-interiors','kit_bundle.py'))
VIRTUAL['39-mp-interiors-bundle.js']='/* GENERATED by build.py */\n'+ib.bundle(['noahs-regret'])+ab.bundle(reception=True)
# the Ancient transit kit (kits/ancient-transit, read in place as the metropolis is: the records 40-44c [G data], the materials 46, the drawing 55-57;
# its furniture as ONE closure, KratorTransitFurniture, after 40): the street grid, the highway, the lines, the subway, the war (PLAN.md section 14)
tb=load('av_transit_bundle',os.path.join(ROOT,'kits','ancient-transit','transit_bundle.py'))
for _f,_p in tb.fragments(): PATH[_f]=_p
VIRTUAL['49-tr-furniture-bundle.js']='/* GENERATED by build.py: kits/ancient-transit, the furniture (KratorTransitFurniture) */'+chr(10)+tb.furniture()
mb=load('av_mech_bundle',os.path.join(ROOT,'kits','mechs','mech_bundle.py'))
VIRTUAL['39k-mp-mechs-bundle.js']='/* GENERATED by build.py: kits/mechs, the Ancients (culture ancient: the valley\'s feral keepers, feigners and hunters; session valley-robots, 2026-11-09) */'+chr(10)+mb.bundle(['ancient'])
# the Motor Vehicles kit's Ancients culture with its ruin states (kits/motor-vehicles vehicle_bundle.py, as Locus takes it): KratorVehicles,
# about 1 MB, for the wrecks in the streets (41b-av-wrecks.js records them, 73-host-wrecks.js draws them)
vb=load('av_vb_bundle',os.path.join(ROOT,'kits','motor-vehicles','vehicle_bundle.py'))
VIRTUAL['39v-mp-vehicles-bundle.js']='/* GENERATED by build.py: kits/motor-vehicles, the ancient culture */\n'+vb.bundle(['ancient'])
# the Extraplanar kit (kits/extraplanar extraplanar_bundle.py): KratorExtraplanar, one closure with the mechs machinery inside it (its culture,
# 'extraplanar', never reaches KratorMechs), for the hunters, the phenomena and the portals (75-host-extraplanar.js); after the mechs bundle
xb=load('av_xp_bundle',os.path.join(ROOT,'kits','extraplanar','extraplanar_bundle.py'))
VIRTUAL['39x-xp-bundle.js']='/* GENERATED by build.py: kits/extraplanar, the Ancient\'s Valley\'s extraplanar entities (session valley-extraplanar, 2026-11-09) */'+chr(10)+xb.bundle()
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf-8').read()
    for pat,rep in SUBST.get(f,[]): s=re.sub(pat,rep,s)
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and '-mp-' not in f and not f.endswith('-bundle.js') and f not in ANC_FILES:   # a generated bundle is another kit's code, scanned by its own build
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'ancientsvalley.tex.js',prune=False)
# THE BUILD YIELDS (2026-11-10): 88-host-build.js builds the forest in stages that give the browser a turn between them, so what follows it on the page
# must wait: the fragments after it go in a text block (av-after) that the build runs when it finishes (88's AV_AFTER). Classic scripts share the
# page's globals, so the block runs as if it had followed in place. The split is checked: nothing after it may close a script itself.
SPLIT='\n</script>\n<script type="text/plain" id="av-after">'
_after=[f for f in frags if f>'88-host-build.js' and f.endswith('.js')]
if '88-host-build.js' in frags and _after:
    _mk=f'\n// ==================== {_after[0]}\n'
    _i=html.find(_mk)
    if _i<0: print('BUILD SPLIT: no marker for '+_after[0]); sys.exit(1)
    if len(re.findall(r'</script',html[_i:],re.I))!=1: print('BUILD SPLIT: the fragments after 88 close a script themselves; the deferred block would break'); sys.exit(1)
    html=html[:_i]+SPLIT+html[_i:]
open(os.path.join(DIST,OUT),'w',encoding='utf-8',newline='\n').write(html)
# syntax check on the script body
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html.replace(SPLIT,''),re.S)
js=m.group(1) if m else ''
chk=os.path.join(HERE,'.syntax.js'); open(chk,'w',encoding='utf-8',newline='\n').write(js)
node=find_node()
r=subprocess.run([node,'--check',chk],capture_output=True,text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  '+('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode==0 else 'SYNTAX ERROR\n'+r.stderr[:800]))
ki=os.path.join(HERE,'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op=[l for l in open(ki,encoding='utf-8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
