#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (biome-core: engine-independent kit)
  50..79            BIOME LEAVES (southwest bay species, trees, floor, dressing)
  45-host-stage     HOST binding (renderer, terrain, BIO.init) -- must run before 50
  80..98            HOST (sky, tower, build, camera, probe)
  99-tail.html      closes <script>

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
OUT=sys.argv[1] if len(sys.argv)>1 else "swbay.html"
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# shared fragments from core/terrain, opt-in by name (core/README.md): '36-core-carve.js' gives
# BIO.carve, overhangs on the heightfield. A local src/ copy with the same name wins.
CORE_TERRAIN=['43-core-ground.js','44-core-farfield.js','45-core-horizon.js']   # KGROUND (the ground's library layers), KFAR (the far country's lattice), KHORIZON (its terrain shadows): the final rebuild, 2026-10-27; 45-host-stage.js, 88-host-build.js
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome, the same way (core/README.md): one copy for every kit.
# A kit that lists nothing keeps its own src/ copies and builds as before.
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31b-core-leafset.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js','35-core-anim.js','36-core-walker.js','40-core-place.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read; core/README.md), listed the same way
CORE_SPACE=['20-core-space.js']
CORE_S=os.path.normpath(os.path.join(HERE,'..','..','core','space'))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
# their three.js halves (core/terrain/host), as biomes/nwbay lists them
PATH.setdefault('44-core-farfield-draw.js',os.path.join(CORE_T,'host','44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js',os.path.join(CORE_T,'host','45-core-horizon-shade.js'))
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
CORE_HOST=khost.SHELL
khost.resolve(PATH,CORE_HOST)
# the material library (core/materials/record: KMAT and the loader) and the GENERATED pack of the textures materials.json
# names (tools/textures/matlib_pack.py from tex/, written by tools/textures/pack.py). Without tex/pack.json the pack is
# empty and the kit keeps its procedural textures (as it does in the open world, which carries no pack).
for f in ('23-mat-record.js','25-matlib-host.js'):
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record',f))
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'swbay',own=True)}
# THE NEIGHBOURS' COUSINS, read in place (the final rebuild, 2026-10-27; src/87-host-kin.js grows them by BIO.kin): the SW highlands'
# fungoid lineage come down to the bay (PLAN-FLORA.md: the stilt pod tree, the weeping wisp, the bead cone, the shelf coral, the coral
# melon, the fishing bridge and the floor's glow tubes, bearded triplets, bulb heath, arrowheads and blue-berry bracts) and nwbay's cinder
# pine and flame-crown (EXCHANGES.md, nwbay -> swbay). Each kit's fragments slotted after the host stage (45) and before this kit (50),
# each in its own registry, closed by a one-line kitEnd; its pack carries only the families those builders draw with. Their load-time draws
# cannot move the bay: 50 reseeds before it paints (reseed(500021)) and every pass reseeds
import json as _json
NEIGH={'nwbay':(['50-biome-nwbay-species.js','55-biome-nwbay-trees.js','56-biome-nwbay-variants.js'],'NWBAY',['bark3','bark7','fernleaf','cneedle','bloom','moss']),
       'swhighlands':(['50-biome-swhighlands-species.js','55-biome-swhighlands-trees.js','57-biome-swhighlands-pillars.js','58-biome-swhighlands-rainwall.js',
                       '59-biome-swhighlands-tableland.js','59c-biome-swhighlands-coast.js'],'SWHI',['coneCap','coneStalk','eggs','heath','crust','moss','coral'])}
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(NEIGH.items())):
    _d=os.path.normpath(os.path.join(HERE,'..',_k));_c='abcdefgh'[_i]
    for _j,_f in enumerate(_fs): PATH['47%s%d-%s'%(_c,_j,_f)]=os.path.join(_d,'src',_f)
    VIRTUAL['47%s-%s-open.js'%(_c,_k)]=chr(10)+"BIO.kit('%s');   // its own registry (nwbay's 50 does not open it: its page's 45 does)"%_k+chr(10)
    VIRTUAL['47%s9-%s-end.js'%(_c,_k)]=chr(10)+"BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)"%(_k,_api)+chr(10)
    _pj=os.path.join(_d,'tex','pack.json')
    with open(_pj,encoding='utf-8') as _fh: _fam=sorted(_json.load(_fh).get('families',{})) if os.path.isfile(_pj) else []
    VIRTUAL['44%s-host-matlib-pack-%s.js'%(_c,_k)]=matlib_pack.fragment(_d,_k,exclude=[f for f in _fam if f not in _keep])
for f in VIRTUAL: PATH[f]=None
# the shared atmosphere (core/atmos/README.md; 2026-10-20, phase 0 of the water migration): its core, presets, export, the open-water
# wave field and the sky's light, bound once by 89a-host-atmos.js (ATMOS.bindHost). Nothing is drawn by the binding alone: the page's own
# sky, fog, sun and water are unchanged; core/water draws here in a later phase.
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js']
for f in CORE_ATMOS:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
# core/atmos's particles: the cataracts' spray (WATER.drawFalls draws it with ATMOS.smoke; 2026-10-26, the waterfall risers)
PATH['89-atmos-3-particles.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','89-atmos-3-particles.js'))
# core/water (core/water/README.md; 2026-10-20, phase 3): the bay and the outer water as WATER.open, the river a WATER.flow, the cataracts WATER.fall (records in
# 45-host-stage.js and 89w-host-water.js). Explicit paths: the open-water draw (50) and the flow/fall/still kinds (51) as well as the data.
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
# 54/54b (the final rebuild, 2026-10-27): the looks (the clear river), the karst springs (W.karstSpring), comb-weed; by path, after 22 and 51
PATH['22b-core-water-kinds-ext.js']=os.path.normpath(os.path.join(HERE,'..','..','core','water','ext','54-core-water-kinds-ext.js'))
PATH['51b-core-water-kinds-ext-draw.js']=os.path.normpath(os.path.join(HERE,'..','..','core','water','ext','54b-core-water-kinds-ext-draw.js'))
for f in CORE_WATER:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water',f))
# the falls in two draw calls in all (WATER.drawFalls: ext/53 + 53b; 2026-10-25), explicit paths as biomes/nwbay does
for f in ['53-core-water-terraces.js','53b-core-water-terraces-draw.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','water','ext',f))
PATH['89-atmos-c-hostbind.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-c-hostbind.js'))   # ATMOS.bindHost, in core/atmos/host/ so the kits that take core/atmos whole are not changed
# the shared sky (core/atmos/SKY-PLAN.md, step S1, 2026-10-26): its model, presets and shader, and the host that draws it
# (src/89s-host-sky.js calls ATMOS.sky); they replace the painted dome and the giant mesh of the old 82-host-sky.js
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky',f))
PATH['89-atmos-h-skyhost.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host','89-atmos-h-skyhost.js'))
# the weather (2026-10-26): core/atmos's weather and its selector, ATMOS.bindWeather; height fog (R1: the sky's chunk and its
# host), the rain occlusion map (R10) and the branched lightning (core/atmos/fx/)
for f in ['89-atmos-4-weather.js','89-atmos-9-host.js']:
    if f not in PATH: PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos',f))
for f in ['89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','host',f))
PATH['89-atmos-j-fog.js']=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','sky','89-atmos-j-fog.js'))
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']:
    PATH[f]=os.path.normpath(os.path.join(HERE,'..','..','core','atmos','fx',f))
# the syntax check cannot see a core fragment that is simply absent
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and not f.startswith(('53-core-water','53b-core-water','22b-core-water','51b-core-water')) and not re.match(r'47[a-h]',f):   # the neighbours' kits (47*) are their own builds' to lint   # core/water/ext says RIVER in its own words
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf8').write(html)
# syntax check on the script body
m=re.search(r'<script>\n(?!document)(.*)</script>\s*</body>',html,re.S)
js=m.group(1) if m else ''
chk=os.path.join(HERE,'.syntax.js'); open(chk,'w',encoding='utf8').write(js)
node=find_node()
r=subprocess.run([node,'--check',chk],capture_output=True,text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  '+('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode==0 else 'SYNTAX ERROR\n'+r.stderr[:800]))
ki=os.path.join(HERE,'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op=[l for l in open(ki,encoding='utf8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
