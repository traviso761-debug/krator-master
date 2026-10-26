#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the abyssal savannah (PLAN.md).

  00-head.html      page shell, opens <script>
  07..44            the cores: export, rand, biome, space, tags, materials and the generated packs
  45-host-stage     HOST: renderer, the rim slope's terrain and fields, BIO.init -- runs before the kits
  47a..47c          the EASTERN ABYSS kit read in place (its species and trees, for the jungle at the foot and in the gullies)
  50..79            BIOME LEAVES (the abyssal savannah's species, trees, floor, build)
  80..98            HOST (build order, the shared sky, the atmosphere, the water) and the host shell (core/host)
  99-host-take      the page handed to core/host; 99-tail.html closes <script>

The core and the biome leaves never reference a host global except through BIO.host (biomes/eastabyss/BIOME-API.md);
the FORBID scan below fails the build if a kit fragment grows a dependency on one world's engine.
"""
import os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places (the newest first). None when there
    is none: the build then says plainly that the syntax was NOT checked. Every build.py carries this same function."""
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


HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = next((a for a in sys.argv[1:] if not a.startswith('--')), 'abyssal-savannah.html')
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
core = lambda *p: os.path.normpath(os.path.join(ROOT, 'core', *p))
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
# the biome core from core/biome (core/README.md): one copy for every kit
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '32-core-variants.js', '40-core-place.js',
              '42-core-export.js', '43-core-export-host.js', '44-core-stage.js']
for f in CORE_BIOME:
    PATH.setdefault(f, core('biome', f))
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume is a record.
# KRAND seeds every placement cell (PLAN.md section 11).
CORE_TAGS = {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}
for f, d in CORE_TAGS.items():
    PATH.setdefault(f, core(d, f))
# core/export: the krator-world container (EXPORT.world), filled by the biome core (42, 43) and the adapters
CORE_EXPORT = ['07-core-export.js', '09-core-export-adapters.js']
for f in CORE_EXPORT:
    PATH.setdefault(f, core('export', f))
# core/space (KSPACE): the keep-clear between the trees and the kopjes, and the core's own obstacle index
CORE_SPACE = ['20-core-space.js']
for f in CORE_SPACE:
    PATH.setdefault(f, core('space', f))
# OTHER KITS read in place (biomes/WORLD.md: several kits on one page). The jungle at the foot of the slope and up the gullies is
# the eastern abyss's: its species and its tree builders (EASTABYSS.make / grow, one tree alone), slotted after the host stage
# (45) and before this kit (50), in its own registry. 47c closes its registry (BIO.kitEnd), which its fauna fragment does on its own page.
EA = os.path.normpath(os.path.join(HERE, '..', 'eastabyss'))
KITS = {'47a-ea-species.js': 'src/50-biome-eastabyss-species.js', '47b-ea-trees.js': 'src/55-biome-eastabyss-trees.js'}
for slot, p in KITS.items():
    PATH[slot] = os.path.join(EA, p)
# the host shell (core/host/README.md): camera, frame loop and clock (core/clock), panel, probe; the authoring tools (inspect,
# polygon, path: README.md "DEV TOOLS"). src/99-host-take.js hands it the page (KHOST.take).
sys.path.insert(0, core('host'))
import host as khost
CORE_HOST = khost.SHELL + ['94-host-polytool.js']
khost.resolve(PATH, CORE_HOST)
# the material library (core/materials/record: KMAT and the loader) and the GENERATED packs of the textures each kit's
# materials.json names (tools/textures/matlib_pack.py from tex/, written by tools/textures/pack.py). Without tex/pack.json a
# pack is empty and its kit keeps its procedural textures. The eastern abyss's pack goes with its fragments (its own 'own'
# families stay out: they belong to its page's 52-library fragment).
for f in ('23-mat-record.js', '25-matlib-host.js'):
    PATH.setdefault(f, core('materials', 'record', f))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack
VIRTUAL = {'44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'abyssal-savannah', own=True),
           '44b-host-matlib-pack-eastabyss.js': matlib_pack.fragment(EA, 'eastabyss')}
for f in VIRTUAL:
    PATH[f] = None
# core/atmos (core/atmos/README.md): its core, presets, export, the wave field and the sky's light, bound by 89a-host-atmos.js
CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-4-weather.js', '89-atmos-8-export.js', '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js']   # 4, 9: the weather and its selector (2026-10-26)
for f in CORE_ATMOS:
    PATH.setdefault(f, core('atmos', f))
PATH['89-atmos-c-hostbind.js'] = core('atmos', 'host', '89-atmos-c-hostbind.js')   # ATMOS.bindHost
PATH['89-atmos-e-weatherhost.js'] = core('atmos', 'host', '89-atmos-e-weatherhost.js')   # ATMOS.bindWeather (src/89a-host-atmos.js, 2026-10-26)
# the shared sky (core/atmos/SKY-PLAN.md): its model, presets and shader, and the host that draws it (src/89s-host-sky.js)
for f in ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js']:
    PATH[f] = core('atmos', 'sky', f)
PATH['89-atmos-h-skyhost.js'] = core('atmos', 'host', '89-atmos-h-skyhost.js')
# core/water (core/water/README.md): the gully stream as WATER.flow, its pools and the pan as WATER.still (89w-host-water.js)
CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']
for f in CORE_WATER:
    PATH.setdefault(f, core('water', f))
miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js') if f not in PATH]
if miss:
    print('NO BIOME CORE: ' + ', '.join(miss)); sys.exit(1)
frags = sorted(PATH)
out = []; bad = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
    n = int(re.match(r'(\d+)', f).group(1))
    own = PATH[f] is not None and os.path.dirname(PATH[f]) == SRC
    if 10 <= n < 80 and '-host-' not in f and own:   # this kit's own fragments (core/ and the kits read in place are scanned by their own builds)
        for w in FORBID:
            if w in s:
                bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad:
    print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad)); sys.exit(1)
os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)
m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  ' + ('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    with open(ki, encoding='utf-8') as fh:
        op = [l for l in fh if l.startswith('- [ ]')]
    if op:
        print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
