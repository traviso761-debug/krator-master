#!/usr/bin/env python3
"""Godshearth (PLAN.md): the caldera let down into the Godthrone's south flank, the Hearths' largest country. Concatenates a station's page.

Godshearth draws no engine of its own. A station is a geyser field on Godshearth's ground, read IN PLACE from the geyser kit (biomes/geyser: its src/
and its shared field stage, stations/field: the thermal layout, sinter, springs, geysers, the ground's paint, the far field, the sky, the take) with the
Hearths (biomes/hearths/src, read in place as a neighbour's kit: "kin") on KTHERM's heat, and this kit's own station fragments on top (a name in both
is this kit's). PLAN.md section 8 has the core adoption.

  biomes/geyser/src/*               the geyser kit (its species, layout, sinter, show, ground, sky, take)
  biomes/geyser/stations/field/*    the field stage: a geyser field on any ground, set by STATION_SITE (replaces the showcase's 45, 47, 85, 88, 89...)
  49m*                              the Hearths, read in place in their own registry (station.json "kin")
  44r-host-model                    generated: the scale model round the site (model_site.py): its vent records and heights
  stations/<name>/*                 the station: its site (44s), the heat and the hearth field (87), the lake and the air (89w, 89x), the walls (89y)
  core/*                            by path, as the geyser kit lists them, plus the station's "core" (KTHERM, the lean, the snow cover)

  python3 build.py                     dist/godshearth.html, station 1: the Hot Lake (stations/prismbasin)
  python3 build.py --station <name>    dist/godshearth-<name>.html (PLAN.md section 7: grove, headwall, spill are not written yet)

The kit fragments never reference a host global except through BIO.host; build.py greps for the forbidden names.
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
sys.path.insert(0,os.path.join(os.path.dirname(os.path.dirname(HERE)),'tools')); sys.path.insert(0,HERE); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
ROOT=os.path.normpath(os.path.join(HERE,'..','..'))
J=lambda *p:os.path.normpath(os.path.join(ROOT,*p))
GEY=J('biomes','geyser'); SRC=os.path.join(GEY,'src')   # the geyser kit, read in place
DEFAULT='prismbasin'   # station 1, the Hot Lake (PLAN.md section 7: "Station 1 comes first")
_args=[a for a in sys.argv[1:] if not a.startswith('--') or a=='--station']
STATION=_args[_args.index('--station')+1] if '--station' in _args else None
if STATION: _args=[a for a in _args if a not in ('--station',STATION)]
OUT=_args[0] if _args else ('godshearth-%s.html'%STATION if STATION and STATION!=DEFAULT else 'godshearth.html')
STATION=STATION or DEFAULT
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
import json as _json
_sd=os.path.join(HERE,'stations',STATION)
if not os.path.isdir(_sd): sys.exit('build.py: no station '+STATION+' (stations/'+STATION+'/)')
with open(os.path.join(_sd,'station.json'),encoding='utf-8') as _fh: SJ=_json.load(_fh)
# the geyser kit's src/, then its shared stage (stations/<base>, "field"), then this station's own (a name in both is the later one's)
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if re.match(r'\d',f)}
_bd=os.path.join(GEY,'stations',SJ.get('base','field'))
for f in os.listdir(_bd):
    if re.match(r'\d',f): PATH[f]=os.path.join(_bd,f)
for f in os.listdir(_sd):
    if re.match(r'\d',f): PATH[f]=os.path.join(_sd,f)
for f,pth in SJ.get('core',{}).items(): PATH.setdefault(f,J(pth))
# core/terrain (the geyser kit's list): 35 + 35b KSTRATA's lamina column (the sinter's couplets), 43 KGROUND, 44 KFAR, 45 KHORIZON. The station adds
# 47 KTHERM (the Hearths' heat) by its station.json
CORE_TERRAIN=['35-core-strata.js','35b-core-lamina.js','43-core-ground.js','44-core-farfield.js','45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f,J('core','terrain',f))
for f in ['44-core-farfield-draw.js','45-core-horizon-shade.js']: PATH.setdefault(f,J('core','terrain','host',f))
PATH.setdefault('35c-core-lamina-shade.js',J('core','terrain','host','35b-core-lamina-shade.js'))   # keyed 35c: it needs 35b, which sorts after its own name
# the biome core from core/biome (core/README.md): the geyser kit's list. 33 the fungoid parts (the hearth trees' feet and stalks), 35 the motion modes
# (the fans' breath), 37 the one clock core/hazard runs on; the station adds 39 the lean (the stalks bow to the sun)
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','31j-core-joint.js','32-core-variants.js','33-core-fungoid.js','34-core-impostor.js','35-core-anim.js',
 '36-core-walker.js','37-core-traps.js','40-core-place.js','41-core-env.js','42-core-export.js','43-core-export-host.js','44-core-stage.js']
# the geyser kit's globals (TAU, clamp, smooth, fbm...) live in the hyperjungle's 41; no jungle here, only its globals (the geyser stations' "nojungle")
PATH['41-hyperjungle-globals.js']=J('biomes','hyperjungle','src','41-hyperjungle-globals.js')
for f in CORE_BIOME: PATH.setdefault(f,J('core','biome',f))
# core/rand and core/tags: every item set, instance and registered volume is a core/tags record (BIO.init({tags}))
CORE_TAGS={'08-core-rand.js':'rand','50-core-tags.js':'tags','52-core-tags-vocab.js':'tags','53-core-tags-host.js':'tags'}
for f,d in CORE_TAGS.items(): PATH.setdefault(f,J('core',d,f))
for f in ['07-core-export.js','09-core-export-adapters.js']: PATH.setdefault(f,J('core','export',f))
PATH.setdefault('20-core-space.js',J('core','space','20-core-space.js'))
# core/hazard (KHAZ): the geysers on the one clock, the springs, the acid ground, the hot ground's crust (the geyser kit's), the hearth field's vent line
PATH.setdefault('20-core-hazard.js',J('core','hazard','20-core-hazard.js'))
# core/shadow (KSHADOW): the sun's shadows in one view-following box (the field stage's 88; ?shadow=0)
PATH.setdefault('10-core-shadow.js',J('core','shadow','10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js',J('core','shadow','host','12-core-shadow-host.js'))
# the shared atmosphere (core/atmos) and core/water: the springs (WATER.spring), the geysers (WATER.geyser), the hot lake (WATER.open, 89w)
CORE_ATMOS=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-3-particles.js','89-atmos-8-export.js','89-atmos-a-waves.js','89-atmos-b-skylight.js','89-atmos-4-weather.js','89-atmos-9-host.js']
for f in CORE_ATMOS: PATH.setdefault(f,J('core','atmos',f))
CORE_WATER=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f,J('core','water',f))
for f in ['52-core-water-geyser.js','52b-core-water-geyser-draw.js']:   # core/water/geyser/: opt-in
    PATH[f]=J('core','water','geyser',f)
for f in ['53-core-water-terraces.js','53b-core-water-terraces-draw.js','57-core-water-audit.js','61-core-water-plume.js']:
    PATH.setdefault(f,J('core','water','ext',f))
# the host shell from core/host: the camera, the frame loop and its clock (core/clock), the panel, the probe, the authoring tools
sys.path.insert(0,J('core','host'))
import host as khost
CORE_HOST=khost.SHELL+['94-host-polytool.js']
khost.resolve(PATH,CORE_HOST)
# the shared sky, height fog, the rain cover and the lightning (the geyser kit's), and the station's own air (fx: the snow that lies, bared by KTHERM)
for f in ['89-atmos-e-skymodel.js','89-atmos-f-skypresets.js','89-atmos-g-sky.js','89-atmos-j-fog.js']: PATH[f]=J('core','atmos','sky',f)
for f in ['89-atmos-h-skyhost.js','89-atmos-i-skybiome.js','89-atmos-e-weatherhost.js','89-atmos-j-heightfog.js']: PATH[f]=J('core','atmos','host',f)
for f in ['89-atmos-fx-raincover.js','89-atmos-fx-lightning.js']+SJ.get('fx',[]): PATH[f]=J('core','atmos','fx',f)
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME)'); sys.exit(1)
# the material library (core/materials/record): the record and its browser half, and the geyser kit's pack (its tex/), the stations' st.* sets only
# where this station's station.json lists them ("tex"). SIDECAR PACKS beside the page (dist/godshearth.tex.geyser.js); --inline-packs puts them inside
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
for f in CORE_MAT: PATH.setdefault(f,J('core','materials','record',f))
sys.path.insert(0,J('tools','textures'))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
_pjg=os.path.join(GEY,'tex','pack.json')
with open(_pjg,encoding='utf-8') as _fh: _famg=sorted(_json.load(_fh).get('families',{})) if os.path.isfile(_pjg) else []
_stx=[f for f in _famg if f.startswith('st.') and f not in SJ.get('tex',[])]
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(GEY,'geyser',exclude=_stx,side=SIDE),khost.EDITS_JS:khost.edits_js(HERE,'godshearth-'+STATION)}
# THE MODEL round the site (model_site.py, read at build time from tools/scale-model/model/data): the vent records (5.1 edit 2) in the page's metres and the
# heights over +-112 km at 2 km cells, as GH_MODEL (44r: before the site, 44s, which reads them). The far field and the caldera's walls are the model's
import model_site as _ms
_px,_py=SJ['site']
VIRTUAL['44r-host-model.js']='\n// the scale model round this station (model_site.py, build time)\nconst GH_MODEL='+_json.dumps(_ms.site(_px,_py),separators=(',',':'))+';\n'
# THE NEIGHBOURS' KITS read in place (the geyser kit's lines): station.json "kin": {"<kit>": [[fragments], "<API>", [pack families kept]]}; each kit's
# fragments slot after the host stage (45, 47) and before the geyser kit (50), in their own registry, closed by a one-line kitEnd
NEIGH={k:tuple(v) for k,v in SJ.get('kin',{}).items()}
for _i,(_k,(_fs,_api,_keep)) in enumerate(sorted(NEIGH.items())):
    _d=os.path.normpath(os.path.join(HERE,'..',_k.split('/')[0]));_c='mnopqrst'[_i];_kk=_k.replace('/','-')
    for _j,_f in enumerate(_fs): PATH['49%s%d-%s'%(_c,_j,os.path.basename(_f))]=os.path.join(_d,_f)
    VIRTUAL['49%s-%s-open.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');   // its own registry"%_k.split('/')[0]+chr(10)
    VIRTUAL['49%s9-%s-end.js'%(_c,_kk)]=chr(10)+"BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed"%(_k.split('/')[0],_api)+chr(10)
for f in VIRTUAL: PATH[f]=None
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=VIRTUAL[f] if PATH[f] is None else open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f and not re.match(r'49[m-t]',f) and not (PATH[f] and os.sep+'core'+os.sep in os.path.normpath(PATH[f])):
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST,exist_ok=True)
html=''.join(out)
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,OUT[:-5]+'.tex.js')
open(os.path.join(DIST,OUT),'w',encoding='utf8',newline='\n').write(html)
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
