#!/usr/bin/env python3
"""Ledge's page (PLAN.md section 9): the half-ruined Ancient arcology drawn at 1:1 on its own ground, from its layout.
python3 tools/build.py settlements/ledge (a plain python3 build.py comes through it by itself).

  00-head.html          page shell, opens <script>
  08-core-rand          core/rand (KRAND): every decision the page makes, by a record's id
  10-core-drawn         core/drawn (KDRAWN): the ground as drawn, for the eye check
  10..69                the Ancients kit's runtime, READ IN PLACE from kits/ancients/src, and its materials from core/materials
                        (the panel, the windows, the slabs the shell is drawn in; the core the Dalab set runs on)
  20-core-ruins         core/ruins (KRUINS): the shell and its wreckage watched (nothing floats, every wreck lies on the ground)
  20..51                core/water (the great lake), core/space (KSPACE: the layout's checks)
  30-ledge-layout       THE LAYOUT as data ([G data]): every deck, part, lift and way by id (the one source)
  31-ledge-rules        its rules ([G data]): the ground, the checks, the area, the census, the strike
  35-core-strata        core/terrain KSTRATA (the rift fill's beds on the cliff) and 37c KRUBBLE (the wreck heaps)
  45-host-stage         HOST: renderer, lights, the ground (LEDGE.groundAt meshed, KSTRATA and the library's grain)
  50..53                core/tags (KTAGS): every record registered before it is drawn
  69b..73, 88y          the Dalab set, read in place (settlements/dalab): VERN.place
  69t-tungang-bundle    GENERATED: the Tungang kit sealed as TG (kits/tungang/tungang_bundle.py): the Fellgang set, TG.fg.draw
  88x                   GENERATED: the library packs (kits/ancients, settlements/dalab, settlements/ledge) in a sidecar
  89-atmos-*            core/atmos: the shared sky, the clock and the waves; 89w-host-water: the lake on core/water
  8la..8ld              HOST: the shell, the head's and the foot's towns, the ruin, the checks' handles
  90..99                core/host FULL (camera, loop, panel, inspector, marks, pictures, minimap, editor, cutaway, probe)
  99-host-take          HOST: the views, the ground, the sky, the checks handed to KHOST.take
  99-tail.html          closes <script>
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)

if '--no-checks' not in sys.argv and subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places. Every build.py carries this function."""
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
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node', os.path.expanduser('~/.nvm/versions/node/*/bin/node'), os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
OUT = 'ledge.html'
core = lambda *p: os.path.join(ROOT, 'core', *p)
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}

# THE ANCIENTS KIT, read in place (kits/ancients): its runtime and materials (as settlements/span takes them)
ANC = os.path.join(ROOT, 'kits', 'ancients')
KIT_RUNTIME = ['10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
               '50-registry.js', '54-mat-concrete.js', '69-mat-salvage.js', '69w-worn.js', '88y-ancients-matlib.js']
CORE_MATERIALS = ['20-textures.js', '22-materials.js', '68-mat-v5.js']
for f in KIT_RUNTIME + CORE_MATERIALS:
    p = os.path.join(ANC, 'src', f)
    PATH[f] = p if os.path.isfile(p) else core('materials', f)
for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js'):
    PATH[f] = core('materials', 'record', f)

# THE DALAB SET, read in place (settlements/dalab/src), as Span takes it: the Vernacular helpers, its items and helpers, the
# dwellings, trade, town types, civic and sacred buildings, and its binding of its library pack
DALAB = os.path.join(ROOT, 'settlements', 'dalab')
DALAB_SET = ['69b-vern-mat.js', '69c-vern-helpers.js', '69d-dalab-mat.js', '69e-dalab-helpers.js', '70-dalab-dwellings.js',
             '71-dalab-trade.js', '71c-dalab-town.js', '72-dalab-civic.js', '72b-dalab-marks.js', '73-dalab-sacred.js', '88y-dalab-matlib.js']
for f in DALAB_SET:
    PATH[f] = os.path.join(DALAB, 'src', f)
SUBST = {'88y-dalab-matlib.js': [(r'\bMATLIB_BOUND\b', 'MATLIB_BOUND_DALAB')]}

# core/rand, core/drawn, core/tags, core/ruins, core/space (core/space also comes with the host's FULL list)
for f, p in (('08-core-rand.js', core('rand', '08-core-rand.js')), ('10-core-drawn.js', core('drawn', '10-core-drawn.js')),
             ('20-core-ruins.js', core('ruins', '20-core-ruins.js')), ('21-core-ruins-host.js', core('ruins', '21-core-ruins-host.js'))):
    PATH[f] = p
for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH[f] = core('tags', f)
# core/terrain: KSTRATA (the rift fill's beds on the cliff; its shade half keyed 35z so it sorts after the data) and KRUBBLE
PATH['35-core-strata.js'] = core('terrain', '35-core-strata.js')
PATH['35z-core-strata-shade.js'] = core('terrain', 'host', '35-core-strata-shade.js')
PATH['37c-core-rubble.js'] = core('terrain', '37c-core-rubble.js')
# core/water (the great lake: a still) and core/atmos (the shared sky, its clock and waves)
for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH[f] = core('water', f)
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-8-export.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):
    PATH[f] = core('atmos', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js'):
    PATH[f] = core('atmos', 'host', f)
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'):
    PATH[f] = core('atmos', 'sky', f)

# core/host FULL (core/host/host.py) and the one key map
sys.path.insert(0, core('host'))
import host as khost
CORE_HOST = khost.FULL + khost.KEYS
own = khost.resolve(PATH, CORE_HOST)
if own:
    print('NOTE: a local copy overrides core/host: ' + ', '.join(own))

# THE TUNGANG KIT sealed as TG (the Fellgang set: TG.fg.draw), its lean maps beside the page
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack
SIDE = {}


def tungang_bundle():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang'))
    import tungang_bundle as tb
    js, files = tb.bundle(tex='lean', with_files=True, side=SIDE)
    BSRC.note(*files)
    return js


BSRC.note('kits/tungang/tungang_bundle.py')
VIRTUAL = {'88x-matlib-pack.js': matlib_pack.fragment(ANC, 'ancients', side=SIDE),
           '88x-matlib-pack-dalab.js': matlib_pack.fragment(DALAB, 'dalab', side=SIDE),
           '88x-matlib-pack-ledge.js': matlib_pack.fragment(HERE, 'ledge', side=SIDE),
           khost.EDITS_JS: khost.edits_js(HERE, 'ledge')}
if not BSRC.LISTING:
    VIRTUAL['69t-tungang-bundle.js'] = tungang_bundle()
for f in VIRTUAL:
    PATH[f] = None

missing = [f for f in PATH if PATH[f] is not None and not os.path.isfile(PATH[f])]
if missing:
    sys.exit('missing fragments: ' + ', '.join('%s (%s)' % (f, PATH[f]) for f in missing))
BSRC.report([PATH[f] for f in sorted(PATH) if PATH[f]])     # --list-sources stops here, before the first write
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
    if f.endswith('.js') and f != '69t-tungang-bundle.js' and not re.match(r'[;(]*\s*\(?\s*(function|\(\)\s*=>)', code):
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
html = matlib_pack.write_sidecar(SIDE, html, DIST, 'ledge.tex.js')
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
