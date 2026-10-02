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
OUT=sys.argv[1] if len(sys.argv)>1 else "swbay.html"
FORBID=['kdef(','kput(','kbake(','BUCKET[','MBK[','FAMMAT[','PLATS','BRIDGES','TOWERS','RIVER','PALISADE','KOFF']
# shared fragments from core/terrain, opt-in by name (core/README.md): '36-core-carve.js' gives
# BIO.carve, overhangs on the heightfield. A local src/ copy with the same name wins.
CORE_TERRAIN=[]
CORE_T=os.path.normpath(os.path.join(HERE,'..','..','core','terrain'))
# the biome core from core/biome, the same way (core/README.md): one copy for every kit.
# A kit that lists nothing keeps its own src/ copies and builds as before.
CORE_BIOME=['10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js','42-core-export.js']
CORE_B=os.path.normpath(os.path.join(HERE,'..','..','core','biome'))
PATH={f:os.path.join(SRC,f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in CORE_TERRAIN:
    if f not in PATH: PATH[f]=os.path.join(CORE_T,f)
for f in CORE_BIOME:
    if f not in PATH: PATH[f]=os.path.join(CORE_B,f)
# the syntax check cannot see a core fragment that is simply absent
miss=[f for f in ('10-core-head.js','20-core-kit.js','30-core-foliage.js','40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: '+', '.join(miss)+' (list them in CORE_BIOME or keep a src/ copy)'); sys.exit(1)
frags=sorted(PATH)
out=[]; bad=[]
for f in frags:
    s=open(PATH[f],encoding='utf8').read()
    n=int(re.match(r'(\d+)',f).group(1))
    if 10<=n<80 and '-host-' not in f:
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  '+'\n  '.join(bad)); sys.exit(1)
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
