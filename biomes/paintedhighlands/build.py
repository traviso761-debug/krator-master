#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the painted highlands (PLAN.md).

  00-head.html      page shell, opens <script>
  10..44            BIOME CORE (core/biome), core/rand, core/tags, core/space, core/export, core/terrain (KSTRATA's `badland` under
                    `danxia`, folded; KSTACKS and its contour; KRELIEF and its landforms; KCARVE; KGROUND, KFAR, KHORIZON), core/mask,
                    core/hazard, core/clock's season, the material library
  40, 41            PAINTED's sites and the bloom's calendar [G data]
  45-host-stage     HOST: renderer, light, the station's land from its site record, the strata stack, the fields, BIO.init (before 50)
  46-host-cliff     HOST: the cliff sites (alcoves, ledges, talus benches) as core/tags records, kept bare in a core/mask raster
  47a..47h          THE NEIGHBOURS' KITS read in place (ebadlands' juniper and pinyon: BIO.kin)
  50..79            THE KIT (PAINTED): species, the steppe and the bloom, build
  80..98            HOST (ground, far field, the danxia stacks, placement, sky, atmos, water, build, camera, probe)
  99-tail.html      closes <script>

  python3 build.py                     dist/paintedhighlands.html, the stripe badlands (station 1)
  python3 build.py --station <name>    dist/paintedhighlands-<name>.html: stations/<name>/ added to src/ (PLAN.md section 7): bloom, canyon, cliff
  python3 build.py --all               every page

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); build.py greps for the
forbidden names so a kit fragment cannot quietly grow a dependency on one world's engine.
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

HERE=os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0,os.path.join(os.path.dirname(os.path.dirname(HERE)),'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
BSRC.variants([['--station',_s] for _s in sorted(os.listdir(os.path.join(HERE,'stations'))) if os.path.isdir(os.path.join(HERE,'stations',_s))])   # every station's page
if '--all' in sys.argv:
    _r=[subprocess.call([sys.executable,os.path.abspath(__file__)]+[a for a in sys.argv[1:] if a!='--all'])]
    for _st in sorted(os.listdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'stations'))):
        _r.append(subprocess.call([sys.executable,os.path.abspath(__file__),'--station',_st]+[a for a in sys.argv[1:] if a!='--all']))
    sys.exit(max(_r))
SRC=os.path.join(HERE,'src'); DIST=os.path.join(HERE,'dist')
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('paintedhighlands-%s.html'%STATION if STATION else 'paintedhighlands.html')
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
# a STATION (PLAN.md section 7; python3 build.py --station <name> -> dist/paintedhighlands-<name>.html): stations/<name>/'s numbered fragments are added to src/'s
# (a name in both is the station's), and its station.json may name more core ("core": {"<fragment name>": "<path from the repo root>"}) and the
# neighbours' kits it reads in place ("kin", as ebadlands)
import json as _json
SJ={}
if STATION:
    _sd=os.path.join(HERE,'stations',STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
    _sj=os.path.join(_sd,'station.json')
    if os.path.isfile(_sj):
        with open(_sj,encoding='utf-8') as _fh: SJ=_json.load(_fh)
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    # a station on another's ground names it as its "base" (the Cold Hearths on the passes' cold desert): the base's fragments first, then its own
    _base=SJ.get('base')
    if _base:
        _bd=os.path.join(HERE,'stations',_base)
        for f in os.listdir(_bd):
            if re.match(r'\d',f): PATH[f]=os.path.join(_bd,f)
    for f in os.listdir(_sd):
        if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
    for f,pth in SJ.get('core',{}).items(): PATH.setdefault(f,J(pth))
# core/terrain, opt-in by name (core/README.md "terrain/"; PLAN.md section 8): 35 KSTRATA (the beds), 36 KCARVE (the alcoves), 37 KSTACKS with 37b
# its contour (the danxia fins and hoodoos), 38 KRELIEF with 38c its landforms (the washes, the talus, the stepped ledges), 43 KGROUND, 44 KFAR,
# 45 KHORIZON. A local src/ copy wins.
CORE_TERRAIN=['35-core-strata.js','36-core-carve.js','37-core-stacks.js','37b-core-stacks-contour.js','38-core-relief.js','38c-core-landforms.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
# core/mask (KMASK): the cliff sites and the pits kept bare, as a raster the placement reads (never getImageData)
PATH.setdefault('25-core-mask.js',J('core','mask','25-core-mask.js'))
# core/camp (KCAMP): the pigment works as a work camp over the bright beds (PLAN.md section 5; 10 makes KCAMP, 40 the work camp)
for f in ['10-camp-cultures.js','40-camp-work.js']: PATH.setdefault('26-'+f,J('core','camp',f))
PATH.setdefault('44-core-farfield-draw.js',J('core','terrain','host','44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js',J('core','terrain','host','45-core-horizon-shade.js'))
PATH.setdefault('35s-core-strata-shade.js',J('core','terrain','host','35-core-strata-shade.js'))   # keyed to sort after 35-core-strata.js ('-' < '.')
# the biome core from core/biome (core/README.md): one copy for every kit. The final rebuild adds 31j a limb's joint to its parent (BIO.flareJoin),
# 32 the variant pools and kin, 33 the fungoid parts, 33b the bamboo parts, 34 the octahedral impostors, 35 the motion modes, 39 the lean,
# 41 the environmental fields
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31-core-dither.js','31b-core-leafset.js','31j-core-joint.js','32-core-variants.js','33-core-fungoid.js','33b-core-bamboo.js','34-core-impostor.js',
 '35-core-anim.js','37-core-traps.js','39-core-lean.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
# core/space (KSPACE), core/rand and core/tags, core/export: as before
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
# core/hazard (KHAZ) and the one clock (KTRAPS.cycle): the flash floods, the wet clay, the cliffs and the rockfall (PLAN.md section 6)
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
PATH.setdefault('21-core-hazard-flow.js',J('core','hazard','21-core-hazard-flow.js'))
# core/shadow (KSHADOW; off at load, ?shadow=1): the sun's shadows in one view-following box; the data half before the host's
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the host shell from core/host (core/host/README.md), the whole interface and the authoring tools. src/99-host-take.js hands it the page (KHOST.take)
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.FULL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
# the shared atmosphere (core/atmos/README.md): its core, presets, particles (the plunge's spray, the vents' steam), export, waves, skylight, the weather and
# its selector, bound by 89a-host-atmos.js; the final rebuild's air: height fog (R1), the rain occlusion map (R10), lightning, snow that lies
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-3d-dust.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
PATH['89-atmos-c-hostbind.js']=J('core','atmos','host','89-atmos-c-hostbind.js')
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
# the air's load and the dry season's dust (crater-drylands' lines): light dust off the playas and the bare clay in late summer (PLAN.md section 3)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js','89-atmos-fx-snowcover.js','89-atmos-fx-smokegroups.js','89-atmos-fx-airload.js','89-atmos-fx-dustseason.js']: PATH[f]=J('core','atmos','fx',f)
# core/water (core/water/README.md): the pools WATER.still in one draw (53, 53b), the stream a WATER.flow, the cataract a WATER.fall (89w-host-water.js);
# the final rebuild's ext: breakup (56: the stream), the audit (57), the reflections switch (58), the shore's fields (60), by path (tools/fragment_needs.json)
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['53-core-water-terraces.js','53b-core-water-terraces-draw.js','56-core-water-breakup.js','57-core-water-audit.js','58-core-water-mirror.js','60-core-water-fields.js','61-core-water-plume.js']:
    PATH.setdefault(f,J('core','water','ext',f))
# the seeps at the alcoves' backs (PLAN.md section 5a): WATER.spring (core/water/geyser 52), cool and clear
for f in ['52-core-water-geyser.js','52b-core-water-geyser-draw.js']: PATH.setdefault(f,J('core','water','geyser',f))
# the syntax check cannot see a core fragment that is simply absent
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record, PLAN.md): the record and its browser half, and the pack of the library
# textures materials.json names, generated from the committed tex/ (tools/textures/pack.py). Without tex/pack.json the
# pack is empty and the kit keeps its procedural textures (as it does in the open world, which carries no pack).
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
for f in CORE_MAT: PATH.setdefault(f,J('core','materials','record',f))
# the library pack (core/materials/PLAN.md): the shared writer, tools/textures/matlib_pack.py (the inline copy dropped a slot's `cell`, so a celled card
# showed its whole sheet; TODO.md, "The inline pack writers that drop cell")
sys.path.insert(0,J('tools','textures'))
import matlib_pack
VIRTUAL={'44-host-matlib-pack.js':matlib_pack.fragment(HERE,'paintedhighlands',own=True),khost.EDITS_JS:khost.edits_js(HERE,'paintedhighlands')}
# THE NEIGHBOURS' KITS, read in place (ebadlands' lines; highrift's loader): a station adds its own in station.json ("kin": {"<kit>": [[fragments],
# "<API>", [pack families]]}); each kit's fragments slot after the host stage (45) and before this kit (50), in their own registry, closed by a one-line
# kitEnd. Every page reads the eastern badlands' trees (the Great Basin kit: Utah juniper and pinyon, grown by BIO.kin with ebadlands' own builder)
KIN_ALL={'ebadlands':[['src/50-biome-ebadlands-species.js','src/55-biome-ebadlands-trees.js'],'EBADLANDS',['bark.juniper','leaf.needle','leaf.scale','leaf.lobed','leaf.round']]}
KIN=dict(KIN_ALL);KIN.update(SJ.get('kin',{}))
NEIGH={k:tuple(v) for k,v in KIN.items()}
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(NEIGH.items())):
    _d=os.path.normpath(os.path.join(HERE,'..',_k.split('/')[0]));_c='abcdefgh'[_i];_kk=_k.replace('/','-')
    for _j,_f in enumerate(_fs): PATH['47%s%d-%s'%(_c,_j,os.path.basename(_f))]=os.path.join(_d,_f)
    VIRTUAL['47%s-%s-open.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');   // its own registry"%_k.split('/')[0]+chr(10)
    VIRTUAL['47%s9-%s-end.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)"%(_k.split('/')[0],_api)+chr(10)
    _pj=os.path.join(_d,'tex','pack.json')
    _fam=[]
    if os.path.isfile(_pj):
        with open(_pj,encoding='utf-8') as _fh: _fam=sorted(_json.load(_fh).get('families',{}))
    VIRTUAL['44%s-host-matlib-pack-%s.js'%(_c,_kk)]=matlib_pack.fragment(_d,_k.split('/')[0],exclude=[f for f in _fam if f not in _keep])
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and 'core-water' not in f and not re.match(r'47[a-h]',f):   # the neighbours' kits are their own builds' to lint
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out); open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
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
