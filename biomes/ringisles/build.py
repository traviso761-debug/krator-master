#!/usr/bin/env python3
"""Concatenate src/* and the kits it reads in place (filename order of their slots) into dist/<target>.html.

THE RING SEA ISLES (settlements/isle-demo/PLAN.md, section 2): one kit whose zones are chosen by the scale model's
climate class (Koppen as fields: BIO.field('koppen:Aw') and its siblings), its showcase one synthetic island whose bands
run from wet windward rainforest through savanna and steppe to a salt pan, ringed by a beach, with a mangrove lagoon,
a reef flat and one geyser field.

  00-head.html      page shell, opens <script>
  07..44            the shared cores (core/export, rand, biome, space, tags, materials record), the library packs (44*)
  41-hyperjungle-globals   the core's helpers as globals (biomes/hyperjungle/src): the host fragments and the sky use them
  45-host-stage     HOST: renderer, light, the demo island (land, sea floor, reef, lagoon, pans, tide pools, gardens),
                    its climate (dryness, the classes as soft weights)
  46 (geyser)       the GEYSER kit's layout, read in place (GEYSER.cluster, GEYSER.lay: the thermal field round the vent)
  47-host-land      HOST: the land with the thermal relief, the water, the fields (cached), BIO.init
  49a..49h          OTHER KITS read in place, each one block in its own order (BIO.kit .. BIO.kitEnd): the Throne,
                    swbay, eastabyss, sedesert, geyser, and (2026-10-26) the Rift, nwlowlands and the hyperjungle for a few
                    species. This kit grows their trees by their own make/grow (or treeAt), their small plants by KIT.small
  50..70            THE KIT: species, trees, floor, gardens, build
  80..98            HOST (sky, ground, build, the sea on core/water, fauna from kits/fauna, take)
  89-atmos/water    CORE: core/atmos and core/water, read in place
  99-tail.html      closes <script>

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); build.py greps for the
forbidden names so a kit fragment cannot quietly grow a dependency on one world's engine.

  python3 build.py                 dist/ringisles.html (+ the sidecar texture packs dist/ringisles.tex.<kit>.js)
  python3 build.py --inline-packs  one self-contained file
  python3 build.py --no-fauna      leave the kits/fauna bundle out
  python3 build.py --station <name>  dist/ringisles-<name>.html: stations/<name>/ added to src/ (PLAN-STATIONS.md); its
                                   station.json may name more core ("core": {fragment: path}) as oidong's do
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
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
_args=sys.argv[1:]
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
_args=[a for a in _args if not a.startswith('--')]
OUT=_args[0] if _args else ('ringisles-%s.html'%STATION if STATION else 'ringisles.html')
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# the biome core from core/biome (core/README.md): one copy for every kit
# The final rebuild (pair 8, 2026-11-03; PLAN-STATIONS.md, "Core adoption"): 31b leaves on stems (the kit core's BIO.leafOn, leafQ), 31j a limb's joint
# to its parent (BIO.flareJoin), 32 the variant pools and kin, 33 the fungoid parts, 34 the octahedral impostors (the borrowed kits' far trees: the
# Throne's, swbay's, eastabyss', sedesert's, the Rift's and nwlowlands' trees call BIO.impostorItem when it is there), 37 the one clock (KTRAPS.cycle:
# the geyser kit's hazards), 39 the lean, 41 the environmental fields, 44 the stage
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','31j-core-joint.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js',
 '35-core-anim.js','36-core-walker.js','37-core-traps.js','39-core-lean.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
CORE_B=os.path.join(ROOT,'core','biome')
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.join(ROOT,'core','space')
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page; openworld/isle-demo/build.py reads its kits the
# same way). Each kit is ONE block of its fragments in its own order (BIO.kit at the top of its first, BIO.kitEnd at the end
# of its last): the slots below sort that way, after this page's BIO.init (47) and before this kit (50). The geyser kit's
# layout (46) is data, read before the land is made (its relief is part of the land).
KITS={
 '41-hyperjungle-globals.js':'hyperjungle/src/41-hyperjungle-globals.js',
 '46-geyser-layout.js':'geyser/src/46-biome-geyser-layout.js',
 '49a1-throne-flows.js':'throne/src/46-biome-throne-flows.js','49a2-throne-species.js':'throne/src/50-biome-throne-species.js',
 '49a3-throne-trees.js':'throne/src/55-biome-throne-trees.js','49a4-throne-floor.js':'throne/src/60-biome-throne-floor.js',
 '49a5-throne-build.js':'throne/src/70-biome-throne.js',
 '49b1-swbay-species.js':'swbay/src/50-biome-swbay-species.js','49b2-swbay-trees.js':'swbay/src/55-biome-swbay-trees.js',
 '49b3-swbay-floor.js':'swbay/src/60-biome-swbay-floor.js','49b4-swbay-dress.js':'swbay/src/65-biome-swbay-dress.js',
 '49b5-swbay-build.js':'swbay/src/70-biome-swbay.js','49b6-swbay-fauna.js':'swbay/src/75-biome-swbay-fauna.js',
 '49c1-eastabyss-species.js':'eastabyss/src/50-biome-eastabyss-species.js','49c2-eastabyss-trees.js':'eastabyss/src/55-biome-eastabyss-trees.js',
 '49c3-eastabyss-floor.js':'eastabyss/src/60-biome-eastabyss-floor.js','49c4-eastabyss-dress.js':'eastabyss/src/65-biome-eastabyss-dress.js',
 '49c5-eastabyss-build.js':'eastabyss/src/70-biome-eastabyss.js','49c6-eastabyss-fauna.js':'eastabyss/src/75-biome-eastabyss-fauna.js',
 '49d1-sedesert-species.js':'sedesert/src/50-biome-sedesert-species.js','49d2-sedesert-trees.js':'sedesert/src/55-biome-sedesert-trees.js',
 '49d3-sedesert-floor.js':'sedesert/src/60-biome-sedesert-floor.js','49d4-sedesert-dress.js':'sedesert/src/65-biome-sedesert-dress.js',
 '49d5-sedesert-build.js':'sedesert/src/70-biome-sedesert.js','49d6-sedesert-fauna.js':'sedesert/src/75-biome-sedesert-fauna.js',
 '49e1-geyser-species.js':'geyser/src/50-biome-geyser-species.js','49e2-geyser-trees.js':'geyser/src/55-biome-geyser-trees.js',
 '49e3-geyser-sinter.js':'geyser/src/57-biome-geyser-sinter.js','49e4-geyser-floor.js':'geyser/src/60-biome-geyser-floor.js',
 '49e5-geyser-show.js':'geyser/src/65-biome-geyser-show.js','49e6-geyser-build.js':'geyser/src/70-biome-geyser.js',
 # 2026-10-26: the Rift's acacia and termite spires (RIFT.make/grow, RIFT.small), nwlowlands' she-oak (NWLOW.make/grow), the
 # hyperjungle's understorey palm and screwpine (HYPERJUNGLE.small): their species, trees or floor and build, nothing else
 '49f1-rift-species.js':'rift/src/50-biome-rift-species.js','49f2-rift-trees.js':'rift/src/55-biome-rift-trees.js',
 '49f3-rift-floor.js':'rift/src/60-biome-rift-floor.js','49f4-rift-build.js':'rift/src/70-biome-rift.js',
 '49g1-nwlowlands-species.js':'nwlowlands/src/50-biome-nwlowlands-species.js','49g2-nwlowlands-trees.js':'nwlowlands/src/55-biome-nwlowlands-trees.js',
 '49g3-nwlowlands-build.js':'nwlowlands/src/70-biome-nwlowlands.js',
 '49h1-hyperjungle-species.js':'hyperjungle/src/50-biome-hyperjungle-species.js','49h2-hyperjungle-floor.js':'hyperjungle/src/60-biome-hyperjungle-floor.js',
 '49h3-hyperjungle-build.js':'hyperjungle/src/70-biome-hyperjungle.js'}
# each kit's last listed fragment must close its registry (a kit that moves BIO.kitEnd to a new fragment would otherwise
# leave every later kit's items in its registry): the same check openworld/isle-demo/build.py makes
LAST={'throne':'49a5-throne-build.js','swbay':'49b6-swbay-fauna.js','eastabyss':'49c6-eastabyss-fauna.js',
      'sedesert':'49d6-sedesert-fauna.js','geyser':'49e6-geyser-build.js',
      'rift':'49f4-rift-build.js','nwlowlands':'49g3-nwlowlands-build.js','hyperjungle':'49h3-hyperjungle-build.js'}
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
# a STATION (PLAN-STATIONS.md; python3 build.py --station <name> -> dist/ringisles-<name>.html): stations/<name>/'s numbered fragments are added to src/'s
# (a name in both is the station's), and its station.json may name more core ("core": {"<fragment name>": "<path from the repo root>"}) or drop one of
# src/'s ("drop": [names]: the lagoon has no vent, so no geyser field)
import json as _json
SJ={}
if STATION:
    _sd=os.path.join(HERE,'stations',STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    _sj=os.path.join(_sd,'station.json')
    if os.path.isfile(_sj):
        with open(_sj,encoding='utf-8') as _fh: SJ=_json.load(_fh)
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
    for f,pth in SJ.get('core',{}).items(): PATH.setdefault(f,J(pth))
for slot,p in KITS.items(): PATH[slot]=os.path.join(ROOT,'biomes',p)
for f in SJ.get('drop',[]): PATH.pop(f,None)   # a station's dropped fragments (src/'s or a read kit's slot)
# core/terrain, opt-in by name (core/README.md "terrain/"); the final rebuild: 35 KSTRATA (the core's, in place of sedesert's src/ copy this page read
# before: BIO.strata with no recipe is the same shader), 43 KGROUND (the ground's library layers, 84), 44 KFAR (the sea floor and the shelf past the
# map, 85), 45 KHORIZON (the mountain's shadow on the land and the flora); the drawing halves by path (core/terrain/host/). A src/ copy wins.
for f in ['35-core-strata.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']: PATH.setdefault(f,J('core','terrain',f))
PATH.setdefault('35s-core-strata-shade.js',J('core','terrain','host','35-core-strata-shade.js'))   # keyed 35s: it reads KSTRATA when it loads
PATH.setdefault('44-core-farfield-draw.js',J('core','terrain','host','44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js',J('core','terrain','host','45-core-horizon-shade.js'))
# core/hazard (KHAZ): the geyser kit's vents and hot ground reach the walker through it (the one clock is core/biome 37)
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
# core/shadow (KSHADOW): the sun's shadows in one view-following box, decided at load by the ground's texture units (89zz-host-core.js: r128 declares
# the shadow map in every lit material, and this ground reads the library's fourteen layers)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
for k,slot in LAST.items():
    if slot not in PATH: continue   # a station that drops the kit
    if not re.search(r'^[^/\n]*BIO\.kitEnd\(',open(PATH[slot],encoding='utf8').read(),re.M):
        sys.exit('KIT %s: its last listed fragment (%s) does not call BIO.kitEnd: list the fragment that does'%(k,KITS[slot]))
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE_B,f)
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume the
# kit places is a core/tags record (core/biome/20-core-kit.js). A src/ copy wins.
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items():
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core',d,f)
CORE_EXPORT=['07-core-export.js','09-core-export-adapters.js']
for f in CORE_EXPORT:
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core','export',f)
for f in CORE_SPACE:
    if f not in PATH: PATH[f]=os.path.join(CORE_S,f)
# the shared atmosphere and core/water: the sea is a WATER.open surface (89w-host-sea.js)
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']   # 2026-10-20 (phase 3): the shore grid (21), the still pools and the wet beach (51; 22 is its flow half)
CORE_WATER_EXT=['57-core-water-audit.js','58-core-water-mirror.js','60-core-water-fields.js']   # the final rebuild: the audit, the reflections switch (off at load), the shore's fields (tools/fragment_needs.json orders them)
CORE_WATER_GEYSER=['52-core-water-geyser.js','52b-core-water-geyser-draw.js']   # core/water/geyser/: opt-in, NOT pooled by builds that list core/water (README)   # 52 and 52b: the geyser kit's show draws its springs and columns through them
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core','atmos',f)
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core','water',f)
for f in CORE_WATER_EXT: PATH.setdefault(f,J('core','water','ext',f))
for f in CORE_WATER_GEYSER:
    PATH[f]=os.path.join(ROOT,'core','water','geyser',f)
# the host shell from core/host (core/host/README.md); src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,os.path.join(ROOT,'core','host'))
import host as khost
CORE_HOST=khost.FULL+['94-host-polytool.js']   # the whole interface and the authoring tools (the final rebuild)
khost.resolve(PATH,CORE_HOST)
# the shared sky (core/atmos/SKY-PLAN.md section 9, 2026-10-26): core/atmos's core where the kit had none, the sky's model,
# presets and shader, its host and the biome call (src/89-host-sky.js: ATMOS.skyBiome); they replace the painted dome
for f in ['89-atmos-0-core.js','89-atmos-0p-presets.js']:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky',f))
# the final rebuild's air (89a-host-atmos.js): the host binding, height fog (the sea haze), the rain's occlusion map, lightning
PATH['89-atmos-c-hostbind.js']=J('core','atmos','host','89-atmos-c-hostbind.js')
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']: PATH[f]=J('core','atmos','fx',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']:   # e-weatherhost: ATMOS.bindWeather, with the weather (4) and its selector (9) in CORE_ATMOS (2026-10-26)
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host',f))
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record, PLAN.md): the record, its browser half, and one pack per kit on the page
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
for f in CORE_MAT:
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core','materials','record',f)
# SIDECAR PACKS (tools/textures/matlib_pack.py): the maps go in files beside the page (dist/ringisles.tex.<kit>.js), loaded
# by plain <script src> tags ahead of the page's code. --inline-packs puts them back in the page. The other kits' packs
# leave out what this page never draws (their towers, jetties and ground layers: this host paints its own ground), so
# the sidecars carry only the maps of the species read here.
sys.path.insert(0,os.path.join(ROOT,'tools','textures'))
import json as _json, matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
def _fams(kit):
    pj=os.path.join(ROOT,'biomes',kit,'tex','pack.json')
    return sorted(_json.load(open(pj,encoding='utf8')).get('families',{})) if os.path.isfile(pj) else []
# the Throne: only the isle's and the savanna's trees (lehua, tree fern, arch palm, palm frill, mangrove, coconut, star aloe,
# gill-parasol) and the small plants this kit borrows from it
# (2026-11-09) and the elfin tree's bark and hanging moss for station 2's cloud forest (stations/high: the Throne's elfin read in place)
THRONE_KEEP={'bark.elfin','card.mosshang','bark.armored','bark.palm','bark.mangrove','bark.twisted','bark.coir','card.frond.coconut','card.fractal',
 'card.treefern','card.aloeflower','card.ferngreen','card.bromeliad','card.mossclump','leaf.fern','cap.disc','cap.tier'}
DROP=lambda k:k.startswith('tower') or k.startswith('jetty') or k.startswith('ground')
EXCL={'throne':[f for f in _fams('throne') if f not in THRONE_KEEP],
      'swbay':[f for f in _fams('swbay') if DROP(f)],'eastabyss':[f for f in _fams('eastabyss') if DROP(f)],
      'sedesert':[f for f in _fams('sedesert') if DROP(f)],
      # the geyser's own ground layers the thermal paint reads (84-host-ground.js): sinter, clay, mud, mat
      'geyser':[f for f in _fams('geyser') if f.startswith('ground.') and f not in ('ground.sinter','ground.clay','ground.mud','ground.mat')],
      # the three kits read for a few species (2026-10-26): only the maps those draw
      'rift':[f for f in _fams('rift') if f not in ('bark2','leaflet','rock')],
      'nwlowlands':[f for f in _fams('nwlowlands') if f not in ('bk.fibre','drape','wood')],
      'hyperjungle':[f for f in _fams('hyperjungle') if f not in ('frond','under','limb')]}
# named -host- (the FORBID scan skips it: base64 may spell a forbidden word) and numbered 44: the stage (45) reads them
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'ringisles',side=SIDE),khost.EDITS_JS:khost.edits_js(HERE,'ringisles')}
for i,k in enumerate(['throne','swbay','eastabyss','sedesert','geyser','rift','nwlowlands','hyperjungle']):
    VIRTUAL['44%s-host-matlib-pack-%s.js'%('bcdefghi'[i],k)]=_mp.fragment(os.path.join(ROOT,'biomes',k),k,exclude=EXCL[k],side=SIDE)
# THE FAUNA (kits/fauna: one kit for every animal, biomes/README.md): the Ring Sea's and the savanna's animals, placed by
# the host (89f-host-fauna.js) from the bundle. --no-fauna leaves it out (the host then places none)
if '--no-fauna' not in sys.argv:
    sys.path.insert(0,os.path.join(ROOT,'kits','fauna'))
    import fauna_bundle as _fb
    VIRTUAL['89e-host-fauna-bundle.js']=_fb.bundle(['wild','bay','ringsea','hyperjungle','voth'],tex=True)
for f in VIRTUAL: PATH[f]=None
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
html=''.join(out)
# a station's page shares the main page's sidecars (the same kits, the same packs): it writes them again, identical, and prunes nothing
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'ringisles.tex.js',prune=not STATION)
open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
# syntax check on the script body
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html,re.S)
js=m.group(1) if m else ''
chk=os.path.join(HERE,'.syntax.js'); open(chk,'w',encoding='utf8',newline='\n').write(js)
node=find_node()
r=subprocess.run([node,'--check',chk],capture_output=True,text=True) if node else None
side=sum(os.path.getsize(os.path.join(DIST,f)) for f in os.listdir(DIST) if f.startswith('ringisles.tex.'))
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB; sidecar packs {side//1024} KB)  '+('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode==0 else 'SYNTAX ERROR\n'+r.stderr[:800]))
ki=os.path.join(HERE,'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op=[l for l in open(ki,encoding='utf8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
