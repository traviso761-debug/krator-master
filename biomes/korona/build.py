#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: Korona, the corona country under the giant (NOTES.md).

Stations, like the Throne's (NOTES.md, "Building it"): each is its own showcase page from the same kit.
  python3 build.py                     station 1, THE TEPUI: src/ as it is -> dist/korona.html
  python3 build.py --station hollow    station 2, THE PITCHER HOLLOW: stations/hollow/'s host fragments replace src/'s of
                                       the same name; its station.json names the page ("out")

  00-head.html        page shell, opens <script>
  10..44              BIOME CORE (core/biome, with 37-core-traps: the carnivores' trap rules), core/rand, core/tags,
                      core/space, core/export, the material library and the packs (korona, necanyons, hyperjungle);
                      core/terrain/37-core-stacks.js (KSTACKS: the tepui, the stacks)
  45-host-stage       HOST: renderer, light, the station's landform (the floor function, the rock as KSTACKS records), STAGE
  46-nec-layout       the NECANYONS kit's layout, read in place: zones on the rock (floor, foot, ledge, bench, cap), seeps, potholes
  47-host-land        HOST: terrainH, the water, Korona's fields (wet, poor, rich, warm...), the meshes, BIO.init
  48a..48f            the HYPERJUNGLE kit, read in place (the gorge floor's and the rim's forest)
  49a..49e            the NECANYONS kit, read in place: its canyon flora and its carnivores grow on Korona's rock
  50..79              THE KIT (KORONA): species, trees, the man-eaters, the summit and the hollow floor, build
  82-host-sky         the hyperjungle's sky, read in place (the standard Krator sky with the giant in the north-east)
  88-host-build       HOST: the build order
  90..98              HOST (core/host: camera, loop, panel, probe, the authoring tools)
  99-host-take        the page handed to core/host
  99-tail.html        closes <script>

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); build.py greps for the
forbidden names so a kit fragment cannot quietly grow a dependency on one world's engine.
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
OUT=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith("--") else "korona.html"
STATION=None
if '--station' in sys.argv:
    STATION=sys.argv[sys.argv.index('--station')+1]
    import json as _json
    STN_DIR=os.path.join(HERE,'stations',STATION)
    STN=_json.load(open(os.path.join(STN_DIR,'station.json'),encoding='utf-8'))
    OUT=STN['out']
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
CORE_TERRAIN=['37-core-stacks.js']   # KSTACKS: the tepui's beds, the stacks (core/terrain/37-core-stacks.js)
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome (core/README.md): one copy for every kit. 35-core-anim and 36-core-walker: the hyperjungle's fauna
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','35-core-anim.js','36-core-walker.js','37-core-traps.js','40-core-place.js','42-core-export.js','43-core-export-host.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page). The hyperjungle grows on the gorge floor (and the
# hollow's rim), in its own registry; the necanyons kit's flora and carnivores grow on the rock, in theirs; both slotted
# before this kit's fragments. The sky is the hyperjungle's (the standard Krator sky with the giant).
HJ=os.path.normpath(os.path.join(HERE,'..','hyperjungle'))
NEC=os.path.normpath(os.path.join(HERE,'..','necanyons'))
KITS={'41-hyperjungle-globals.js':(HJ,'src/41-hyperjungle-globals.js'),
      '46-nec-layout.js':(NEC,'src/46-biome-necanyons-layout.js'),
      '48a-hj-species.js':(HJ,'src/50-biome-hyperjungle-species.js'),'48b-hj-trees.js':(HJ,'src/55-biome-hyperjungle-trees.js'),
      '48c-hj-fauna.js':(HJ,'src/58-biome-hyperjungle-fauna.js'),'48d-hj-floor.js':(HJ,'src/60-biome-hyperjungle-floor.js'),
      '48e-hj-dress.js':(HJ,'src/65-biome-hyperjungle-dress.js'),'48f-hj-build.js':(HJ,'src/70-biome-hyperjungle.js'),
      '49a-nec-species.js':(NEC,'src/50-biome-necanyons-species.js'),'49b-nec-trees.js':(NEC,'src/55-biome-necanyons-trees.js'),
      '49c-nec-carnivores.js':(NEC,'src/57-biome-necanyons-carnivores.js'),'49d-nec-floor.js':(NEC,'src/60-biome-necanyons-floor.js'),
      '49e-nec-build.js':(NEC,'src/70-biome-necanyons.js'),
      '82-host-sky.js':(HJ,'src/82-host-sky.js')}
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
if STATION:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f]=os.path.join(STN_DIR,f)
    for f in STN.get('core',[]): CORE_BIOME=CORE_BIOME+[f] if f not in CORE_BIOME else CORE_BIOME
    for slot,p in STN.get('kits',{}).items(): PATH[slot]=os.path.normpath(os.path.join(HERE,p))   # another kit read in place (the gorge: sedesert)
for slot,(d,p) in KITS.items(): PATH[slot]=os.path.join(d,p)
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE_B,f)
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume the
# kit places is a core/tags record (core/biome/20-core-kit.js). A src/ copy wins.
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items():
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core',d,f))
CORE_EXPORT=['07-core-export.js','09-core-export-adapters.js']
for f in CORE_EXPORT:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','export',f))
for f in CORE_SPACE:
    if f not in PATH: PATH[f]=os.path.join(CORE_S,f)
# the host shell from core/host (core/host/README.md). src/99-host-take.js hands it the page (KHOST.take).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','core','host')))
import host as khost
CORE_HOST=khost.SHELL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record, PLAN.md) and the packs: this kit's (tex/, from materials.json by
# tools/textures/pack.py), the necanyons' and the hyperjungle's (their own tex/), as SIDECARS beside the page
# (tools/textures/matlib_pack.py): dist/korona.tex.<pack>.js, shared by every station. --inline-packs puts them in the page.
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
CORE_M=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record'))
for f in CORE_MAT:
    if f not in PATH: PATH[f]=os.path.join(CORE_M,f)
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'korona',side=SIDE),
         '44b-host-matlib-pack-necanyons.js':_mp.fragment(NEC,'necanyons',side=SIDE),
         '44c-host-matlib-pack-hyperjungle.js':_mp.fragment(HJ,'hyperjungle',side=SIDE)}
# a station's other kits' packs (station.json "packs": {pack: that kit's folder, from this one}), without their ground layers
if STATION:
    import json as _json2
    for _pn,_pd in STN.get('packs',{}).items():
        _pj=os.path.join(HERE,_pd,'tex','pack.json')
        _ex=[f for f in (sorted(_json2.load(open(_pj,encoding='utf-8')).get('families',{})) if os.path.isfile(_pj) else []) if f.startswith('ground') or f.startswith('tower') or f.startswith('jetty')]
        VIRTUAL['44d-host-matlib-pack-%s.js'%_pn]=_mp.fragment(os.path.normpath(os.path.join(HERE,_pd)),_pn,exclude=_ex,side=SIDE)
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf-8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f:
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'korona.tex.js',prune=False)
open(os.path.join(DIST,OUT),'w',encoding='utf-8',newline='\n').write(html)
# syntax check on the script body
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html,re.S)
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
