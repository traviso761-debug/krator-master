#!/usr/bin/env python3
"""Lāiṭwāl, the Light Wall: a town of 5,000 in Opal Valley, half Glaziers in their carved wall, half Xanadui on the bench
below it (PLAN.md; kits/tungang/PLAN.md 1.4). Steps L2 and L3 of PLAN.md section 6: the town's own page.

The town is built on Xanadu's page, as Qiblai and Erewhon are: settlements/xanadu/build.py --kit takes this folder's kit.json
and targets/, with the Qiblai kit's fragments read in place (kit.json "externalDirs": the Decree's buildings, its ground sets
by "packFrom"), core/terrain's cavern read in place (KCAVERN, its draw and its rock cut), and two closures generated here at
every build, never edited by hand:
  gen/69l-kcity-bundle.js    core/city and core/space in one closure (as Qiblai's), with the raster's Raster and OCC handed
                             out on KCITY.lib so the bench's own site steps (targets/town/89zl-lw-site.js) can lay its ground
  gen/69t-tungang-bundle.js  the Tungang kit sealed as TG (kits/tungang/tungang_bundle.py, tex='glazier' with its maps beside
                             the page in dist/lightwall.tex.tungang.js, furniture=True): the
                             Glaziers' gz-* fronts and void plans (TG.gz.draw, TG.gz.carve)
The page takes core/rand, core/tags (+ core/tags/glazier, opt-in), core/host, core/door, core/lod, core/atmos, core/water and
core/walk through Xanadu's build; core/city, core/space and the Tungang kit through gen/; core/terrain's cavern by kit.json.

    python3 build.py                 # dist/lightwall.html: the town
    KRATOR_GL=gpu python3 verify.py dist/lightwall.html --assert --views "Overview,From the lake,The Stair Foot"
"""
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written (tools/checks_optin.json 'recorded')
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/atmos', 'core/terrain', 'core/water', 'core/walk')

# core/city in one closure (settlements/qiblai/build.py's kcity_bundle, the nested-squares file left out: the bench is laid by
# this town's own site steps). Raster and OCC go out on KCITY.lib with SL, PLAN and KSPACE
CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js']
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')
DIST = os.path.join(HERE, 'dist')
SIDE = {}   # the Tungang kit's library pack, written beside the page after Xanadu's build (lightwall.tex.tungang.js)


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    return ('/* KCITY: core/city and core/space in one closure (settlements/lightwall/build.py). GENERATED: edit core/city. */\n'
            'var KCITY = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC };\n'
            'return KCITY;\n})(Object.create(window));\n')


def tungang_bundle():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang'))
    import tungang_bundle as tb
    js, files = tb.bundle(tex='glazier', furniture=True, with_files=True, side=SIDE, res=True)   # the maps beside the page (the 16 MB cap); res: the Resources kit's opal nodes (TG.res)
    BSRC.note(*files)
    return js


# Opal Valley's flora (KNOWN_ISSUES.md: "the flora is the Vale of Xanadu's"): today's core/biome with the Vale of Xanadu kit (the
# source of Opal Valley's kin, BIO.kin('xanadu.<key>')) and the Opal Valley kit, sealed in one closure as Qiblai's
# (settlements/qiblai/build.py flora_bundle: Xanadu's page runs its own older vendored biome core, without BIO.kit, kin or the
# impostors these kits need). Each kit in its own closure inside it; the closure's BIO on a window of its own. targets/town/
# 90s-lw-flora.js binds it to the town's ground and grows the middle terrace's station (middlebed) over the bench
FLORA_CORE = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31-core-dither.js',
              '31b-core-leafset.js', '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js', '33b-core-bamboo.js',
              '34-core-impostor.js', '35-core-anim.js', '35b-core-anim-turn.js', '40-core-place.js']
FLORA_KITS = [('xanadu', 'XANADU', ['50-biome-xanadu-species.js', '52-biome-xanadu-library.js', '55-biome-xanadu-trees.js', '70-biome-xanadu.js']),
              ('opalvalley', 'OPAL', ['40-biome-opal-sites.js', '50-biome-opal-species.js', '55-biome-opal-place.js', '70-biome-opal.js'])]


def flora_bundle():
    part = lambda rel: '/* ---- %s ---- */\n%s\n' % (rel, rd(rel))
    boot = ('/* the bootstrap: THREE before the kits load (their fragment 50 makes textures); the town binds its scene and '
            'ground later (targets/town/90s-lw-flora.js) */\n'
            'BIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, mask: function () { return 0; }, obstacles: [],\n'
            '  ticks: function () {}, seed: 9450, origin: [[0, 0]], center: [0, 0], fields: {} });\n')
    kits = ''.join('var %s = (function () {\n%s\nreturn %s;\n})();\n' % (g, ''.join(part('biomes/%s/src/%s' % (k, f)) for f in fs), g)
                   for k, g, fs in FLORA_KITS)
    return ('/* LW_FLORA: core/biome and the Vale of Xanadu and Opal Valley kits in one closure (settlements/lightwall/build.py). '
            'GENERATED: edit core/biome and biomes/. */\n'
            'var LW_FLORA = (function (window) {\n' +
            "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });   /* the closure's own BIO, on its own window */\n" +
            ''.join(part('core/biome/' + f) for f in FLORA_CORE) + boot + kits +
            'return { BIO: BIO, reseed: reseed, kits: { xanadu: XANADU, opalvalley: OPAL } };\n})(Object.create(window));\n')


# the open world's ground round the town (KNOWN_ISSUES.md: "the town's page and its open-world site are two grounds"; the owner,
# 2026-11-23: the page reads the world's ground, its own relief seated on it): core/world/bake_ground.py runs the region's own
# land chain in node (its rasters, roads, coasts, hooks) and samples WORLD.H round the site, a 16 m grid over 6 km and a 64 m
# one over 24 km (at minWave 96, as the region's far chunks ask); targets/town/89zl-lw-site.js stands the page on it. The node run (~30 s: the
# region's coasts at init) is skipped when the key (every input's bytes) is the one in the generated file
REGION, SITE_ID = 'xanadu-oidong-highrift', 'slaitwal0001'
WORLD_LEVELS = [(3000, 3000, 3000, 16), (12000, 12000, 12000, 64, 96)]   # minWave 96: 1.5 of the cell, as core/world 81's chunks ask
WORLD_PROBES = [(0, 6000), (-2000, 6000), (2000, 6000)]   # the great lake 6 km south: the world's water there
sys.path.insert(0, os.path.join(ROOT, 'core', 'world')); import bake_ground   # noqa: E402
BSRC.note(*bake_ground.inputs(REGION))


def world_ground():
    out = os.path.join(GEN, '41w-lw-world-ground.js')
    k = bake_ground.key(REGION, SITE_ID, WORLD_LEVELS, WORLD_PROBES)
    if os.path.exists(out):
        with io.open(out, encoding='utf-8') as fh:
            if ('key %s)' % k) in fh.readline():
                return None   # current: write_gen leaves it
    return bake_ground.fragment(bake_ground.bake(REGION, SITE_ID, WORLD_LEVELS, WORLD_PROBES), '41w-lw-world-ground.js', 'LW_WORLD')


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    wg = world_ground()
    if wg is not None:
        with io.open(os.path.join(GEN, '41w-lw-world-ground.js'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(wg)
    for name, make in (('69l-kcity-bundle.js', kcity_bundle), ('69t-tungang-bundle.js', tungang_bundle), ('69r-lw-flora-bundle.js', flora_bundle)):
        out = os.path.join(GEN, name)
        new = make()
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS] + ['kits/tungang/tungang_bundle.py'] + ['core/biome/' + f for f in FLORA_CORE] +
            ['biomes/%s/src/%s' % (k, f) for k, g, fs in FLORA_KITS for f in fs]))
# the Xanadui script the Qiblai kit lifts from the chart (kits/qiblai/xanadui_script.py), current before its fragments are read
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
    # the Tungang kit's maps beside the page (tools/textures/matlib_pack.py): the closure registers KMAT_SIDE.tungang
    if SIDE and not BSRC.LISTING:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures')); import matlib_pack
        _page = os.path.join(DIST, 'lightwall.html')
        with io.open(_page, encoding='utf-8') as fh:
            _html = fh.read()
        if 'lightwall.tex.tungang.js' not in _html:
            _html = matlib_pack.write_sidecar(SIDE, _html, DIST, 'lightwall.tex.js', prune=True)
            with io.open(_page, 'w', encoding='utf-8', newline='') as fh:
                fh.write(_html)
sys.exit(_rc)
