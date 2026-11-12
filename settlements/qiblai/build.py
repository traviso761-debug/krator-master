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
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/atmos')   # through Xanadu's build and gen/

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


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    out = os.path.join(GEN, '69q-kcity-bundle.js')
    new = kcity_bundle()
    old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
    if old != new:
        with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(new)


BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS]))
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
