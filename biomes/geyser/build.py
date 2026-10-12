#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html.

  00-head.html      page shell, opens <script>
  10..44            BIOME CORE  (core/biome: the engine-independent kit), the material library
  45-host-stage     HOST: renderer, light, the land before the thermal ground
  46-biome-geyser   THE KIT's layout (data): the features, their run-off, relief, heat, cycles
  47-host-land      HOST: the land with the kit's relief, the fields, the creek, BIO.init
  48a..48f          the HYPERJUNGLE kit, read in place from biomes/hyperjungle/src (the jungle that walls the basin in)
  50..79            THE KIT: species, trees, sinter, floor, the show (water, eruptions, steam), build
  80..98            HOST (sky, ground, sea and creek, build, camera, probe)
  99-tail.html      closes <script>

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

HERE=os.path.dirname(os.path.abspath(__file__)); SRC=os.path.join(HERE,'src'); DIST=os.path.join(HERE,'dist')
OUT=sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith("--") else "geyser.html"
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
CORE_TERRAIN=[]   # no carve patches in this kit's showcase
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome (core/README.md): one copy for every kit. 35-core-anim: the hyperjungle's fauna
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','35-core-anim.js','40-core-place.js','42-core-export.js','43-core-export-host.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page). The showcase's jungle walls are the hyperjungle's,
# in its own registry; its fragments keep their numbers' order, slotted before this kit's (the Throne's kipuka does the same)
HJ=os.path.normpath(os.path.join(HERE,'..','hyperjungle'))
KITS={'41-hyperjungle-globals.js':'src/41-hyperjungle-globals.js','48a-hj-species.js':'src/50-biome-hyperjungle-species.js',
      '48b-hj-trees.js':'src/55-biome-hyperjungle-trees.js','48c-hj-fauna.js':'src/58-biome-hyperjungle-fauna.js',
      '48d-hj-floor.js':'src/60-biome-hyperjungle-floor.js','48e-hj-dress.js':'src/65-biome-hyperjungle-dress.js',
      '48f-hj-build.js':'src/70-biome-hyperjungle.js'}
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
for slot,p in KITS.items(): PATH[slot]=os.path.join(HJ,p)
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE_B,f)
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
# the material library (core/materials/record, PLAN.md): the record and its browser half, and the packs of the library
# textures each kit's materials.json names, generated from the committed tex/ (tools/textures/pack.py). Without a
# tex/pack.json a pack is empty and its kit keeps its procedural textures (as in the open world, which carries none).
CORE_MAT=['23-mat-record.js','25-matlib-host.js']
CORE_M=os.path.normpath(os.path.join(HERE,'..','..','core','materials','record'))
for f in CORE_MAT:
    if f not in PATH: PATH[f]=os.path.join(CORE_M,f)
# SIDECAR PACKS (tools/textures/matlib_pack.py): the maps go in files beside the page (dist/geyser.tex.geyser.js,
# dist/geyser.tex.hyperjungle.js), loaded by plain <script src> tags ahead of the page's code, so the page opened from
# disk keeps its textures. --inline-packs puts them back in the page (one self-contained file).
sys.path.insert(0,os.path.normpath(os.path.join(HERE,'..','..','tools','textures')))
import matlib_pack as _mp
SIDE=None if '--inline-packs' in sys.argv else {}
# named -host- (the FORBID scan skips it: base64 may spell a forbidden word) and numbered 44: the host stage (45) reads it
VIRTUAL={'44-host-matlib-pack.js':_mp.fragment(HERE,'geyser',side=SIDE),
         '44b-host-matlib-pack-hyperjungle.js':_mp.fragment(HJ,'hyperjungle',side=SIDE)}
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
if SIDE: html=_mp.write_sidecar(SIDE,html,DIST,'geyser.tex.js')
open(os.path.join(DIST,OUT),'w',encoding='utf8').write(html)
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
