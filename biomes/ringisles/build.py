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
  49a..49e          OTHER KITS read in place, each one block in its own order (BIO.kit .. BIO.kitEnd): the Throne,
                    swbay, eastabyss, sedesert, geyser. This kit grows their trees by their own make/grow (or treeAt)
  50..70            THE KIT: species, trees, floor, gardens, build
  80..98            HOST (sky, ground, build, the sea on core/water, fauna from kits/fauna, take)
  89-atmos/water    CORE: core/atmos and core/water, read in place
  99-tail.html      closes <script>

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); build.py greps for the
forbidden names so a kit fragment cannot quietly grow a dependency on one world's engine.

  python3 build.py                 dist/ringisles.html (+ the sidecar texture packs dist/ringisles.tex.<kit>.js)
  python3 build.py --inline-packs  one self-contained file
  python3 build.py --no-fauna      leave the kits/fauna bundle out
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
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
OUT=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith("--") else "ringisles.html"
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# the biome core from core/biome (core/README.md): one copy for every kit
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','35-core-anim.js','36-core-walker.js','40-core-place.js','42-core-export.js','43-core-export-host.js']
CORE_B=os.path.join(ROOT,'core','biome')
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.join(ROOT,'core','space')
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page; openworld/isle-demo/build.py reads its kits the
# same way). Each kit is ONE block of its fragments in its own order (BIO.kit at the top of its first, BIO.kitEnd at the end
# of its last): the slots below sort that way, after this page's BIO.init (47) and before this kit (50). The geyser kit's
# layout (46) is data, read before the land is made (its relief is part of the land).
KITS={
 '41-hyperjungle-globals.js':'hyperjungle/src/41-hyperjungle-globals.js',
 '35-core-strata.js':'sedesert/src/35-core-strata.js',
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
 '49e5-geyser-show.js':'geyser/src/65-biome-geyser-show.js','49e6-geyser-build.js':'geyser/src/70-biome-geyser.js'}
# each kit's last listed fragment must close its registry (a kit that moves BIO.kitEnd to a new fragment would otherwise
# leave every later kit's items in its registry): the same check openworld/isle-demo/build.py makes
LAST={'throne':'49a5-throne-build.js','swbay':'49b6-swbay-fauna.js','eastabyss':'49c6-eastabyss-fauna.js',
      'sedesert':'49d6-sedesert-fauna.js','geyser':'49e6-geyser-build.js'}
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for slot,p in KITS.items(): PATH[slot]=os.path.join(ROOT,'biomes',p)
for k,slot in LAST.items():
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
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js']
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']   # 2026-10-20 (phase 3): the shore grid (21), the still pools and the wet beach (51; 22 is its flow half)
CORE_WATER_GEYSER=['52-core-water-geyser.js','52b-core-water-geyser-draw.js']   # core/water/geyser/: opt-in, NOT pooled by builds that list core/water (README)   # 52 and 52b: the geyser kit's show draws its springs and columns through them
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core','atmos',f)
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.join(ROOT,'core','water',f)
for f in CORE_WATER_GEYSER:
    PATH[f]=os.path.join(ROOT,'core','water','geyser',f)
# the host shell from core/host (core/host/README.md); src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,os.path.join(ROOT,'core','host'))
import host as khost
CORE_HOST=khost.SHELL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
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
THRONE_KEEP={'bark.armored','bark.palm','bark.mangrove','bark.twisted','bark.coir','card.frond.coconut','card.fractal',
 'card.treefern','card.aloeflower','card.ferngreen','card.bromeliad','card.mossclump','leaf.fern','cap.disc','cap.tier'}
DROP=lambda k:k.startswith('tower') or k.startswith('jetty') or k.startswith('ground')
EXCL={'throne':[f for f in _fams('throne') if f not in THRONE_KEEP],
      'swbay':[f for f in _fams('swbay') if DROP(f)],'eastabyss':[f for f in _fams('eastabyss') if DROP(f)],
      'sedesert':[f for f in _fams('sedesert') if DROP(f)],
      # the geyser's own ground layers the thermal paint reads (84-host-ground.js): sinter, clay, mud, mat
      'geyser':[f for f in _fams('geyser') if f.startswith('ground.') and f not in ('ground.sinter','ground.clay','ground.mud','ground.mat')]}
# named -host- (the FORBID scan skips it: base64 may spell a forbidden word) and numbered 44: the stage (45) reads them
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'ringisles',side=SIDE)}
for i,k in enumerate(['throne','swbay','eastabyss','sedesert','geyser']):
    VIRTUAL['44%s-host-matlib-pack-%s.js'%('bcdef'[i],k)]=_mp.fragment(os.path.join(ROOT,'biomes',k),k,exclude=EXCL[k],side=SIDE)
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
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'ringisles.tex.js')
open(os.path.join(DIST,OUT),'w',encoding='utf8').write(html)
# syntax check on the script body
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html,re.S)
js=m.group(1) if m else ''
chk=os.path.join(HERE,'.syntax.js'); open(chk,'w',encoding='utf8').write(js)
node=find_node()
r=subprocess.run([node,'--check',chk],capture_output=True,text=True) if node else None
side=sum(os.path.getsize(os.path.join(DIST,f)) for f in os.listdir(DIST) if f.startswith('ringisles.tex.'))
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB; sidecar packs {side//1024} KB)  '+('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode==0 else 'SYNTAX ERROR\n'+r.stderr[:800]))
ki=os.path.join(HERE,'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op=[l for l in open(ki,encoding='utf8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
