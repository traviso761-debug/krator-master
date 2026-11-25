#!/usr/bin/env python3
"""Concatenate Arcoforte (`kits/arcoforte`) into `dist/arcoforte.html` and `dist/arcoforte.tex.ancients.js`.

    python3 tools/build.py kits/arcoforte     # writes dist/arcoforte.html, dist/arcoforte.tex.ancients.js & build-inputs.json
    python3 kits/arcoforte/build.py           # re-runs through tools/build.py automatically (item 25)
    python3 kits/arcoforte/build.py --list-sources
"""
import importlib.util, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = 'arcoforte.html'

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)

if '--no-checks' not in sys.argv and not BSRC.LISTING and \
        subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places."""
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
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


core = lambda *p: os.path.join(ROOT, 'core', *p)
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}

# 1. core/shader, core/rand, core/drawn, core/door, core/ruins, core/walk
PATH['06-core-khook.js'] = core('shader', '06-core-khook.js')
PATH['06b-core-kcolor.js'] = core('shader', '06b-core-kcolor.js')
PATH['08-core-rand.js'] = core('rand', '08-core-rand.js')
PATH['10-core-door.js'] = core('door', '10-core-door.js')
PATH['10-core-drawn.js'] = core('drawn', '10-core-drawn.js')
PATH['20-core-ruins.js'] = core('ruins', '20-core-ruins.js')
PATH['21-core-ruins-host.js'] = core('ruins', '21-core-ruins-host.js')
PATH['20-core-walk.js'] = core('walk', '20-core-walk.js')
PATH['72-core-door-host.js'] = core('door', '90-core-door-host.js')

# 2. The Ancients kit runtime, READ IN PLACE from kits/ancients/src + core/materials (material tails keyed 56..58y before 60-draw)
ANC = os.path.join(ROOT, 'kits', 'ancients')
ANC_EARLY = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js',
             '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js', '50-registry.js', '54-mat-concrete.js']
for f in ANC_EARLY:
    p = os.path.join(ANC, 'src', f)
    PATH[f] = p if os.path.isfile(p) else core('materials', f)
PATH['56-mat-v5.js'] = core('materials', '68-mat-v5.js')
PATH['57-mat-salvage.js'] = os.path.join(ANC, 'src', '69-mat-salvage.js')
PATH['57w-worn.js'] = os.path.join(ANC, 'src', '69w-worn.js')
PATH['58y-ancients-matlib.js'] = os.path.join(ANC, 'src', '88y-ancients-matlib.js')

for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js'):
    PATH[f] = core('materials', 'record', f)

# 3. core/terrain (coastal strata + KRUBBLE heaps), core/tags, core/furnish, core/water, core/atmos
PATH['35-core-strata.js'] = core('terrain', '35-core-strata.js')
PATH['35z-core-strata-shade.js'] = core('terrain', 'host', '35-core-strata-shade.js')
PATH['37c-core-rubble.js'] = core('terrain', '37c-core-rubble.js')

for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH[f] = core('tags', f)
for f in ('50-core-furnish.js', '52-core-furnish-draw.js', '53-core-furnish-host.js'):
    PATH[f] = core('furnish', f)
for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH[f] = core('water', f)

for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-8-export.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):
    PATH[f] = core('atmos', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js'):
    PATH[f] = core('atmos', 'host', f)
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'):
    PATH[f] = core('atmos', 'sky', f)

# 4. core/host FULL + KEYS (camera, loop, panel, one-key-map, inspector, marks, pictures, minimap, editor, cutaway, probe, core/space)
sys.path.insert(0, core('host'))
import host as khost                              # noqa: E402
CORE_HOST = khost.FULL + khost.KEYS
khost.resolve(PATH, CORE_HOST)

# 5. Catalog furniture + kits/interiors + kits/ancients-interiors bundles, and Ancients material library sidecar
for d in (('kits', 'catalog'), ('kits', 'interiors'), ('tools', 'textures')):
    sys.path.insert(0, os.path.join(ROOT, *d))
import furniture_bundle, kit_bundle as ix_bundle, matlib_pack   # noqa: E402

_ai_spec = importlib.util.spec_from_file_location('ai_bundle', os.path.join(ROOT, 'kits', 'ancients-interiors', 'kit_bundle.py'))
ai_bundle = importlib.util.module_from_spec(_ai_spec)
_ai_spec.loader.exec_module(ai_bundle)

FURN_CULTURES = ['post-apoc', 'scrap', 'generic', 'generic-goods', 'iziz', 'xanadu', 'republican', 'jobs']
BUNDLES = {
    '70d-interiors-bundle.js': lambda: (
        furniture_bundle.bundle(FURN_CULTURES, harvested=True)
        + ix_bundle.bundle(['noahs-regret', 'post-apoc'])
        + ai_bundle.bundle()
    )
}

SIDE = {}
VIRTUAL = {
    '58x-matlib-pack.js': matlib_pack.fragment(ANC, 'ancients', side=SIDE),
    khost.EDITS_JS: khost.edits_js(HERE, 'arcoforte')
}
VIRTUAL.update({f: fn() for f, fn in BUNDLES.items()})
for f in VIRTUAL:
    PATH[f] = None

SUBST = {
    '10-core.js': [(r'function\s+terrainH\s*\(\s*x\s*,\s*z\s*\)\s*\{\s*return\s+0;\s*\}',
                    'function terrainH(x,z){return typeof AF_STAGE!=="undefined"?AF_STAGE.ground(x,z):0;}')],
    '57-mat-salvage.js': [(r'!!NIGHT\b', '!!(typeof NIGHT!=="undefined"&&NIGHT)')]
}

missing = [f for f in PATH if PATH[f] is not None and not os.path.isfile(PATH[f])]
if missing:
    sys.exit('missing fragments: ' + ', '.join('%s (%s)' % (f, PATH[f]) for f in missing))

frags = sorted(PATH)
out = []
DECL = re.compile(r'^(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=)', re.M)
seen, clash = {}, []
for f in frags:
    if PATH[f] is None:
        s = VIRTUAL[f]
        marker = f
    else:
        with open(PATH[f], encoding='utf-8') as fh:
            s = fh.read()
        marker = os.path.relpath(PATH[f], ROOT).replace(os.sep, '/')
    for rx, rep in SUBST.get(f, []):
        s = re.sub(rx, rep, s)
    code = re.sub(r'^\s*(//[^\n]*\n|/\*.*?\*/\s*)*', '', s, flags=re.S)
    if f.endswith('.js') and f not in BUNDLES and not re.match(r'[;(]*\s*\(?\s*(function|\(\)\s*=>)', code):
        for m in DECL.finditer(s):
            n = m.group(1) or m.group(2)
            if n in seen and seen[n] != f:
                clash.append('%s (%s, %s)' % (n, seen[n], f))
            seen.setdefault(n, f)
    out.append('\n// ==================== %s\n' % marker if f.endswith('.js') else '')
    out.append(s)

if clash:
    sys.exit('top-level names declared twice: ' + '; '.join(clash))

# Report all read sources for tools/dep_graph.py (--list-sources exits 0 here before any write)
BSRC.report(PATH)

os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
html = matlib_pack.write_sidecar(SIDE, html, DIST, 'arcoforte.tex.js')
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)

m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
node = find_node()
r = None
if node and js:
    fd, chk = tempfile.mkstemp(prefix='arcoforte-syntax-', suffix='.js')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(js)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True, encoding='utf-8', errors='replace')
    finally:
        try:
            os.remove(chk)
        except OSError:
            pass

print('built dist/%s  (%d fragments, %d KB)  %s' % (
    OUT, len(frags), len(html) // 1024,
    'syntax NOT CHECKED' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]
))
sys.exit(r.returncode if r else 0)
