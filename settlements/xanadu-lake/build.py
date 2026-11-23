#!/usr/bin/env python3
"""The lake towns of Erewhon's lake: one shared target for twenty towns (PLAN.md; step L0, Māuṭh the first).

One page, dist/xanadu-lake.html, holds every specified town's records and draws the town its query names (?town=<key>, the
default mouth). It is built on Xanadu's page, as Phēr's is (settlements/pher): settlements/xanadu/build.py --kit takes this
folder's kit.json and targets/, with core/city sealed in one closure (KCITY: gen/69p-kcity-bundle.js, generated here at
every build from core/city and core/space, never edited by hand). Two more fragments are generated, read from core at
every build under names that put them in the page's order: core/biome's 31b leafset (Phēr's BIO_MIN) and the Sultanate's
tune (core/region/data/xan-tune.js as gen/89zk-xl-tune.js, before the specs that read XAN_TUNE.lake in place). The
buildings are the Xanadu kit's (kits/xanadu, through the page, and its opt-in pieces in extra/: kit.json "external");
core/rand, core/tags, core/host and the interiors through Xanadu's build, core/atmos, core/water, core/drawn and core/ruins
through kit.json "files", core/city and core/space through the bundle, core/region and kits/crops through gen/ (CORE_TAKEN
names them for tools/check_core_use.py).

    python3 tools/build.py settlements/xanadu-lake        # dist/xanadu-lake.html (a plain python3 build.py comes through it)
    python3 tools/fit_lake_town.py mouth                   # a town's ground fitted to its region (targets/town/89zm-xl-fit.js)
    node settlements/xanadu-lake/tests/test-xl-towns.js    # the specs against the tune, each town's plan in node
    node settlements/xanadu-lake/tests/test-xl-site.js     # each town's ground against its region's
    KRATOR_GL=gpu python3 settlements/xanadu-lake/verify.py "settlements/xanadu-lake/dist/xanadu-lake.html?town=mouth" --assert
"""
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/atmos', 'core/water', 'core/drawn', 'core/region',
              'core/biome', 'core/ruins')   # through Xanadu's build, kit.json and gen/

# core/city in one closure (settlements/pher/build.py's kcity_bundle): its globals stay inside, and so does core/space, which
# writes KSPACE onto `window` (the closure hands every module a window of its own). Every data fragment of core/city (the
# host fragments are the page's to draw, and this page draws its own: targets/town/90r)
CITY_JS = sorted(f for f in os.listdir(os.path.join(ROOT, 'core', 'city')) if f[:2].isdigit() and f.endswith('.js') and '-host-' not in f)
SPACE = 'core/space/20-core-space.js'
TUNE = 'core/region/data/xan-tune.js'
# kits/crops (its API.md, "Reading it from a build"): the records and queries, sealed in one closure as gen/89zc-crops-bundle.js
# (its fragments share top-level names, `R`, which Xanadu's page scope may not hold); CROPS lands on globalThis
CROPS_JS = ['kits/crops/src/10-crop-core.js', 'kits/crops/src/20-crop-records.js', 'kits/crops/src/22-crop-material.js', 'kits/crops/src/40-crop-query.js']
GEN = os.path.join(HERE, 'gen')


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
        if f == '10-city-core.js':
            body += 'globalThis.KCITY = KCITY;\n'
    return ('/* KCITY: core/city and core/space in one closure (settlements/xanadu-lake/build.py). GENERATED: edit core/city. */\n'
            'var KCITY = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC, obb: obb, obbCorners: obbCorners };\n'
            'return KCITY;\n})(Object.create(window));\n')


# a core/biome fragment of buildlib.CORE_BIOME_MIN that Xanadu's page (its vendored src/86-bio-*) lacks, read from core at
# every build under a name that sorts it after its 86-bio-30 foliage (Phēr's BIO_MIN; settlements/pher/KNOWN_ISSUES.md)
BIO_MIN = {'86-bio-31b-core-leafset.js': 'core/biome/31b-core-leafset.js'}


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    outs = {'69p-kcity-bundle.js': kcity_bundle(),
            # the tune, read in place: XAN_TUNE.lake (people, px, trade, hub, province) for the specs (89zl), never copied
            '89zk-xl-tune.js': '/* %s, read from core at every build (settlements/xanadu-lake/build.py). GENERATED: edit core/region. */\n%s' % (TUNE, rd(TUNE)),
            # the crops: what a town's benches may grow (Ḍāiyar's dye plants), read in place at every build
            '89zc-crops-bundle.js': '/* CROPS: kits/crops in one closure (settlements/xanadu-lake/build.py). GENERATED: edit kits/crops. */\n(function(){\n' +
                                    ''.join('\n/* ---- %s ---- */\n%s\n' % (f, rd(f)) for f in CROPS_JS) + '\n})();\n'}
    for f, rel in BIO_MIN.items():
        outs[f] = '/* %s, read from core at every build (settlements/xanadu-lake/build.py BIO_MIN). GENERATED: edit core/biome. */\n%s' % (rel, rd(rel))
    for f, new in outs.items():
        out = os.path.join(GEN, f)
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*([SPACE, TUNE] + CROPS_JS + ['core/city/' + f for f in CITY_JS] + sorted(BIO_MIN.values())))
if not BSRC.LISTING:
    write_gen()

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + sys.argv[1:],
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()
sys.exit(_rc)
