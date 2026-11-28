#!/usr/bin/env python3
"""kits/cascade: Cascade — Iron Republic hydropowered industrial-agricultural arcology kit (inspired by Paolo Soleri's
Arcvillage I: refurbished Republic centerpiece, Ancient intact, and post-Cataclysm ruin) with 14 planned interior decks
(living, work, rec, civic), elevated headrace aqueduct, central waterfall cataracts, and twin circular crop gardens.

Build via:
    python3 tools/build.py kits/cascade
"""
import importlib.util, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)

# Port lint first (tools/check_port.py)
if '--no-checks' not in sys.argv and subprocess.call(
        [sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
OUT = 'cascade.html'
CORE = os.path.join(ROOT, 'core')


def find_node():
    import shutil
    return os.environ.get('NODE') or shutil.which('node')


def load_mod(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}


def add_rel(rel_list):
    for r in rel_list:
        f = os.path.basename(r)
        if f not in PATH:
            PATH[f] = os.path.join(ROOT, *r.split('/'))


# 1. Core data, PRNG, tags, drawn ground, space, walk, furnish, ruins, rubble, shadow, export, material records
CORE_RAND = ['core/rand/08-core-rand.js']
CORE_DRAWN = ['core/drawn/10-core-drawn.js']
CORE_BIOME = buildlib.CORE_BIOME_MIN + [
    'core/biome/31j-core-joint.js',
    'core/biome/33-core-fungoid.js',
    'core/biome/41-core-env.js',
    'core/biome/42-core-export.js',
    'core/biome/43-core-export-host.js',
    'core/biome/44-core-stage.js',
]
CORE_TAGS = ['core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js', 'core/tags/53-core-tags-host.js']
CORE_EXTRAS = [
    'core/export/07-core-export.js',
    'core/export/09-core-export-adapters.js',
    'core/shadow/10-core-shadow.js',
    'core/shadow/host/12-core-shadow-host.js',
    'core/ruins/20-core-ruins.js',
    'core/ruins/21-core-ruins-host.js',
    'core/space/20-core-space.js',
    'core/walk/20-core-walk.js',
    'core/materials/record/23-mat-record.js',
    'core/materials/record/25-matlib-host.js',
    'core/terrain/37c-core-rubble.js',
    'core/furnish/50-core-furnish.js',
    'core/furnish/52-core-furnish-draw.js',
]
CORE_WATER = [
    'core/water/20-core-water.js',
    'core/water/21-core-water-shore.js',
    'core/water/22-core-water-flow.js',
    'core/water/50-core-water-draw.js',
    'core/water/51-core-water-kinds.js',
    'core/water/ext/56-core-water-breakup.js',
    'core/water/ext/57-core-water-audit.js',
]
CORE_ATMOS = [
    'core/atmos/89-atmos-0-core.js',
    'core/atmos/89-atmos-0p-presets.js',
    'core/atmos/89-atmos-8-export.js',
    'core/atmos/89-atmos-9-host.js',
    'core/atmos/89-atmos-a-waves.js',
    'core/atmos/89-atmos-b-skylight.js',
    'core/atmos/host/89-atmos-c-hostbind.js',
    'core/atmos/sky/89-atmos-e-skymodel.js',
    'core/atmos/sky/89-atmos-f-skypresets.js',
    'core/atmos/sky/89-atmos-g-sky.js',
    'core/atmos/host/89-atmos-h-skyhost.js',
    'core/atmos/host/89-atmos-i-skybiome.js',
]
add_rel(CORE_RAND + CORE_DRAWN + CORE_BIOME + CORE_TAGS + CORE_EXTRAS + CORE_WATER + CORE_ATMOS)

# 2. Crops kit ([G data]: read in place before 44-av-site.js)
for ci, cf in enumerate(['10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '40-crop-query.js']):
    PATH['15%s-crops-%s' % ('abcd'[ci], cf)] = os.path.join(ROOT, 'kits', 'crops', 'src', cf)

# 3. Northern Highlands flora builders (read in place after 45-host-stage.js BIO.init and before 55-av-site-draw.js)
for nf in ['50-biome-nhighlands-species.js', '55-biome-nhighlands-trees.js', '60-biome-nhighlands-floor.js', '70-biome-nhighlands.js']:
    PATH['48a-flora-%s' % nf] = os.path.join(ROOT, 'biomes', 'nhighlands', 'src', nf)

# 4. Host shell (FULL + polytool + 99-host-section for live hatched cross-sections & horizontal deck cut-aways)
sys.path.insert(0, os.path.join(CORE, 'host'))
import host as khost                              # noqa: E402
khost.resolve(PATH, khost.FULL + ['94-host-polytool.js', '99-host-section.js'])

# 5. Packed material sidecar & bundled catalog/interiors runtime (republican, hl-republican, generic-goods, post-apoc, scrap)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp                         # noqa: E402
SIDE = None if '--inline-packs' in sys.argv else {}
fb = load_mod('av_furniture_bundle', os.path.join(ROOT, 'kits', 'catalog', 'furniture_bundle.py'))
ib = load_mod('av_ix_bundle', os.path.join(ROOT, 'kits', 'interiors', 'kit_bundle.py'))
ab = load_mod('av_ai_bundle', os.path.join(ROOT, 'kits', 'ancients-interiors', 'kit_bundle.py'))

VIRTUAL = {
    '44z-host-matlib-pack.js': _mp.fragment(HERE, 'cascade', side=SIDE),
    khost.EDITS_JS: khost.edits_js(HERE, 'cascade'),
    '39-av-interiors-bundle.js': (
        '/* GENERATED by kits/cascade/build.py */\n'
        + fb.bundle(['republican', 'hl-republican', 'generic', 'generic-goods', 'generic-fruit', 'jobs', 'arms', 'post-apoc', 'scrap'], harvested=True, tex=True)
        + ib.bundle(['noahs-regret', 'highlands'])
        + ab.bundle()
    ),
}
for f in VIRTUAL:
    PATH[f] = None

frags = sorted(PATH)
out = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
    if f.endswith('.js'):
        label = os.path.relpath(PATH[f], ROOT).replace(os.sep, '/') if PATH[f] else f
        out.append('\n// ==================== %s\n' % label)
    out.append(s)

BSRC.report(PATH)                                 # --list-sources stops here, before the first write

html = ''.join(out)
os.makedirs(DIST, exist_ok=True)
if SIDE:
    html = _mp.write_sidecar(SIDE, html, DIST, 'cascade.tex.js')

with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)

m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(m.group(1) if m else '')

node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
print('built dist/%s  (%d fragments, %d KB)  %s' % (
    OUT, len(frags), len(html) // 1024,
    'syntax NOT CHECKED (no node)' if r is None else ('syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:1500])
))
sys.exit(r.returncode if r else 0)
