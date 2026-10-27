#!/usr/bin/env python3
"""Concatenate Span's page (PLAN.md SP3) into dist/span.html: the arcology placed from its layout on the stand-in ground.

  00-head.html          page shell, opens <script>
  08-core-rand          core/rand (KRAND): every decision the layout and the pieces make
  10..69                the Ancients kit's runtime, READ IN PLACE from kits/ancients/src (the PRNG the kit's decor helpers
                        draw from, the instancing kit, surfaces, items, decor, the registry, concrete, salvage and the worn pass)
                        and its materials from core/materials (and the record, the bind); never copied
  20-core-space         core/space (KSPACE): the layout's overlap and road checks, the probe's index
  30-span-layout        THE LAYOUT as data ([G data]): every part, way and link by id (the one source)
  31-span-rules         its rules ([G data]): the checks, the walk graph, the area, the ground it needs (SPAN.groundAt)
  45-host-stage         HOST: renderer, lights, the stand-in ground (SPAN.groundAt meshed)
  50..53                core/tags (KTAGS): every part registered before it is drawn
  88x-matlib-pack       GENERATED: the kit's library pack (kits/ancients/materials.json, tex/), in a sidecar beside the page
  88y-ancients-matlib   the kit's binding of the pack onto MAT, read in place
  89-atmos-*            core/atmos: the core, presets, waves, sky light, the host binding, the shared sky and its host
  89z-host-sky          HOST: ATMOS.skyBiome at Span's place on the scale model
  8as0-span-parts       Span's pieces (kits/ancients/targets/span), read in place: SP2's seven builders
  8at-host-place        HOST: every part of the layout drawn at its place and state
  90..99                core/host FULL (camera, loop, panel, inspector, marks, pictures, minimap, editor, cutaway, probe)
  99-host-take          HOST: the views, the ground, the sky, the checks handed to KHOST.take
  99-tail.html          closes <script>

    python3 build.py              # writes dist/span.html and dist/span.tex.ancients.js (the kit's textures)
"""
import os, re, subprocess, sys

_cp = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', os.path.dirname(os.path.abspath(__file__))]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


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


HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = 'span.html'
core = lambda *p: os.path.join(ROOT, 'core', *p)
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}

# THE ANCIENTS KIT, read in place (kits/ancients): its runtime, and Span's pieces from its span target
ANC = os.path.join(ROOT, 'kits', 'ancients')
KIT_RUNTIME = ['10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
               '50-registry.js', '54-mat-concrete.js', '69-mat-salvage.js', '69w-worn.js', '88y-ancients-matlib.js']
# the materials the kit takes from core/materials (a copy in the kit's src/ wins, as the kit's own build.py resolves them)
CORE_MATERIALS = ['20-textures.js', '22-materials.js', '68-mat-v5.js']
for f in KIT_RUNTIME + CORE_MATERIALS:
    p = os.path.join(ANC, 'src', f)
    PATH[f] = p if os.path.isfile(p) else core('materials', f)
# (not core/materials/opt/69a-world-uv.js: the Dalab set's 69b-vern-mat.js declares its own vWorldUV, the one the set is
# tested with, and none of the kit's fragments here calls it)
for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js'):
    PATH[f] = core('materials', 'record', f)
PATH['8as0-span-parts.js'] = os.path.join(ANC, 'targets', 'span', '8as0-span-parts.js')

# THE DALAB SET, read in place (settlements/dalab/src; SP4): the Vernacular helpers it runs on (its own copies, which it is
# tested against), its items and helpers, the dwellings, trade, town types, civic and sacred buildings, and its binding of
# its library pack. Not taken: the ranch (74), the trades table (77), its light (94: no night here yet), its tags (91t:
# Span registers the layout's records), its biome (86-bio-*: Span's flora is the SW highlands kit's).
DALAB = os.path.join(ROOT, 'settlements', 'dalab')
DALAB_SET = ['69b-vern-mat.js', '69c-vern-helpers.js', '69d-dalab-mat.js', '69e-dalab-helpers.js', '70-dalab-dwellings.js',
             '71-dalab-trade.js', '71c-dalab-town.js', '72-dalab-civic.js', '72b-dalab-marks.js', '73-dalab-sacred.js', '88y-dalab-matlib.js']
for f in DALAB_SET:
    PATH[f] = os.path.join(DALAB, 'src', f)
# THE POST-APOC KIT (kits/post-apoc), as one closure (apoc_bundle.py: its own MAT, TEX and stream never meet the page's): the
# arena, the highlanders' salvage houses and the barricade (Dalab's Line) with the compound's wall pieces it is built from. Its
# furniture glue needs the catalog's furniture and the interiors core as globals (kits/catalog/furniture_bundle.py,
# kits/interiors/kit_bundle.py) and core/walk (KWALK); settlements/screamers is the worked example. Generated, never in src/.
for d in (('kits', 'catalog'), ('kits', 'interiors'), ('kits', 'post-apoc')):
    sys.path.insert(0, os.path.join(ROOT, *d))
import furniture_bundle, kit_bundle, apoc_bundle
FURN_CULTURES = ['post-apoc', 'scrap', 'generic']
APOC_DEFS = ['40-dw-small.js', '42-lg-dwell.js', '53-barricade.js', '54-compound.js', '56-arena.js']
CORE_WALK = ['20-core-walk.js']
PATH['20-core-walk.js'] = core('walk', '20-core-walk.js')
BUNDLES = {'70d-furniture-bundle.js': lambda: furniture_bundle.bundle(FURN_CULTURES) + kit_bundle.bundle(['post-apoc']),
           '70e-apoc-bundle.js': lambda: apoc_bundle.bundle(APOC_DEFS)}
# build-time renames where two sets read in place declare the same name (the files on disk are untouched)
SUBST = {'88y-dalab-matlib.js': [(r'\bMATLIB_BOUND\b', 'MATLIB_BOUND_DALAB')]}

# core/rand, core/tags (core/space comes with the host's FULL list)
CORE_RAND = ['08-core-rand.js']
CORE_TAGS = ['50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js']
PATH['08-core-rand.js'] = core('rand', '08-core-rand.js')
for f in CORE_TAGS:
    PATH[f] = core('tags', f)

# core/atmos: its core, presets, export, waves and sky light; the host binding; the shared sky and its host (SKY-PLAN.md 9)
CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-8-export.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js']
for f in CORE_ATMOS:
    PATH[f] = core('atmos', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js'):
    PATH[f] = core('atmos', 'host', f)
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'):
    PATH[f] = core('atmos', 'sky', f)

# core/host FULL (core/host/host.py): the shell, the inspector, marks, pictures, minimap, editor, cutaway, core/space
sys.path.insert(0, core('host'))
import host as khost
CORE_HOST = khost.FULL
own = khost.resolve(PATH, CORE_HOST)
if own:
    print('NOTE: a local copy overrides core/host: ' + ', '.join(own))

# the kit's material library pack (kits/ancients/materials.json -> tex/), written beside the page as a sidecar
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack
SIDE = {}
VIRTUAL = {'88x-matlib-pack.js': matlib_pack.fragment(ANC, 'ancients', side=SIDE),
           '88x-matlib-pack-dalab.js': matlib_pack.fragment(DALAB, 'dalab', side=SIDE),
           khost.EDITS_JS: khost.edits_js(HERE, 'span')}
VIRTUAL.update({f: fn() for f, fn in BUNDLES.items()})
for f in VIRTUAL:
    PATH[f] = None

missing = [f for f in PATH if PATH[f] is not None and not os.path.isfile(PATH[f])]
if missing:
    sys.exit('missing fragments: ' + ', '.join('%s (%s)' % (f, PATH[f]) for f in missing))
frags = sorted(PATH)
out = []
# one shared scope: a name two fragments both declare at column 0 is a clash (a function silently replaces the other)
DECL = re.compile(r'^(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=)', re.M)
seen, clash = {}, []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
    for rx, rep in SUBST.get(f, []):
        s = re.sub(rx, rep, s)
    code = re.sub(r'^\s*(//[^\n]*\n|/\*.*?\*/\s*)*', '', s, flags=re.S)
    if f.endswith('.js') and f not in BUNDLES and not re.match(r'[;(]*\s*\(?\s*(function|\(\)\s*=>)', code):   # a fragment that is one closure declares nothing shared
        for m in DECL.finditer(s):
            n = m.group(1) or m.group(2)
            if n in seen and seen[n] != f:
                clash.append('%s (%s, %s)' % (n, seen[n], f))
            seen.setdefault(n, f)
    out.append('\n// ==================== %s\n' % f if f.endswith('.js') else '')
    out.append(s)
if clash:
    sys.exit('top-level names declared twice: ' + '; '.join(clash))
os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
html = matlib_pack.write_sidecar(SIDE, html, DIST, 'span.tex.js')
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)
m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
print('built dist/%s  (%d fragments, %d KB)  %s' % (OUT, len(frags), len(html) // 1024,
      'syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
sys.exit(r.returncode if r else 0)
