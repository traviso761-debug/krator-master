#!/usr/bin/env python3
"""Qiblai, the holy city of the Decree (PLAN.md; kits/qiblai/PLAN.md sections 2b, 3 and 7, phase Q7).

The city is built on Xanadu's page, as Erewhon is (settlements/xanadu/targets/erewhon): settlements/xanadu/build.py --kit
takes this folder's kit.json and targets/, with the Qiblai kit's fragments read in place (kit.json "external": every
kits/qiblai/src fragment), its texture pack (kit.json "packFrom"), and core/city sealed in one closure as Verge seals it
(KCITY: gen/69q-kcity-bundle.js, generated here at every build from core/city and core/space, never edited by hand).
The page takes core/rand, core/tags, core/host, core/door, core/lod and core/atmos through Xanadu's build; core/city and
core/space through the bundle (CORE_TAKEN names them for tools/check_core_use.py).

    python3 build.py                 # dist/qiblai.html: the city
    KRATOR_GL=gpu python3 verify.py dist/qiblai.html --assert --views "Overview,From the south gate"
"""
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/atmos', 'core/biome')   # through Xanadu's build and gen/

# core/city in one closure (as settlements/verge/build.py's kcity_bundle): its globals (SL, PLAN, TUNE, V, obb, clamp...) stay
# inside, and so does core/space, which writes KSPACE onto `window`: the closure hands every module a window of its own
# (Object.create(window): reads reach the page, writes stay inside), because Xanadu's page keeps core/space out (its vendored
# biome's scatter takes another path when KSPACE is global). The nested-squares site (35-city-squares.js) joins the list.
CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '35-city-squares.js', '40-city-kcity.js']
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
        if f == '10-city-core.js':
            # the nested-squares module extends globalThis.KCITY (its root): the closure's own object, before the closure
            # has returned it (the page's `var KCITY` gets the same object when it does)
            body += 'globalThis.KCITY = KCITY;\n'
    return ('/* KCITY: core/city and core/space in one closure (settlements/qiblai/build.py). GENERATED: edit core/city. */\n'
            'var KCITY = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, KSPACE: KSPACE };\n'
            'return KCITY;\n})(Object.create(window));\n')


# the meditation gardens' flora (the owner, 2026-11-11: "pick flora tastefully by color... can import Rift, Rift-Rim, Oidong,
# opal valley, or high rift flora"): today's core/biome and three biome kits, read from their folders, sealed in one closure
# (as settlements/voth/build.py's biome_fragment), because Xanadu's page runs its own vendored biome core (version
# 'xanadu-1', without BIO.kit, kin, impostor or flareJoin, which these kits need). Each kit in a closure of its own inside
# it (the kits share names: PAL, SP, T3, buildFar...); the closure's BIO hides the page's, and the closure hands its files a
# window of its own (Object.create(window)) carrying that BIO (30s-core-season-flush.js finds BIO on its root); it exports QC_FLORA only
# (targets/city/90s-qc-flora.js plants one named tree at a point, bakes, ticks its LOD). Opal Valley has no code yet
# (biomes/opalvalley/PLAN.md); High Rift's ground plants place only as the whole grid (HRIFT.buildRift) and are left out.
FLORA_CORE = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31-core-dither.js',
              '31b-core-leafset.js', '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js', '33b-core-bamboo.js',
              '34-core-impostor.js', '35-core-anim.js', '35b-core-anim-turn.js', '40-core-place.js']
FLORA_KITS = [('rift', 'RIFT', ['50-biome-rift-species.js', '52-biome-rift-library.js', '55-biome-rift-trees.js', '70-biome-rift.js']),
              ('riftrim', 'RRIM', ['50-biome-riftrim-species.js', '55-biome-riftrim-trees.js', '70-biome-riftrim.js']),
              ('oidong', 'OIDONG', ['50-biome-oidong-species.js', '55-biome-oidong-trees.js', '70-biome-oidong.js'])]


def flora_bundle():
    part = lambda rel: '/* ---- %s ---- */\n%s\n' % (rel, rd(rel))
    boot = ('/* the bootstrap: THREE before the kits load (their fragment 50 makes textures); the city binds its scene and '
            'ground later (90s-qc-flora.js) */\n'
            'BIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, mask: function () { return 0; }, obstacles: [],\n'
            '  ticks: function (fn) { var last = null; (window._frameHooks = window._frameHooks || []).push(function (now) { var t = now / 1000, '
            'dt = last == null ? 0.016 : Math.min(0.1, t - last); last = t; fn(dt, t); }); },\n'
            '  seed: 33960, origin: [[0, 0]], center: [0, 0], fields: {} });\n')
    kits = ''.join('var %s = (function () {\n%s\nreturn %s;\n})();\n' % (g, ''.join(part('biomes/%s/src/%s' % (k, f)) for f in fs), g)
                   for k, g, fs in FLORA_KITS)
    return ('/* QC_FLORA: core/biome and the Rift, Rift-Rim and Oidong kits in one closure (settlements/qiblai/build.py). '
            'GENERATED: edit core/biome and biomes/. */\n'
            'var QC_FLORA = (function (window) {\n' +
            "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });   /* the closure's own BIO, on its own window */\n" +
            ''.join(part('core/biome/' + f) for f in FLORA_CORE) + boot + kits +
            'return { BIO: BIO, reseed: reseed, kits: { rift: RIFT, riftrim: RRIM, oidong: OIDONG } };\n})(Object.create(window));\n')


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69q-kcity-bundle.js', kcity_bundle), ('69r-flora-bundle.js', flora_bundle)):
        out = os.path.join(GEN, name)
        new = make()
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS] + ['core/biome/' + f for f in FLORA_CORE] +
            ['biomes/%s/src/%s' % (k, f) for k, g, fs in FLORA_KITS for f in fs]))
# the Xanadui script the kit lifts from the chart (kits/qiblai/xanadui_script.py), current before the kit's fragments are read
sys.path.insert(0, os.path.join(ROOT, 'kits', 'qiblai')); import xanadui_script
BSRC.note(xanadui_script.CHART, os.path.join(ROOT, 'kits', 'qiblai', 'xanadui_script.py'))
if not BSRC.LISTING:
    write_gen()
    xanadui_script.write()

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + sys.argv[1:],
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()
sys.exit(_rc)
