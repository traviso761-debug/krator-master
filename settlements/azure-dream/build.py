#!/usr/bin/env python3
"""Grēṭ-Āil, the head monastery of the Order of the Azure Dream (PLAN.md; the owner, 2026-11-16: "build the page next").

The page is built on Xanadu's page, as Qiblai's city is (settlements/qiblai/build.py): settlements/xanadu/build.py --kit
takes this folder's kit.json, src/ (the Order's own buildings, qb_ad_*, on the Qiblai kit's helpers: seeds 34000-34199) and
targets/, with the Qiblai kit's fragments read in place (kit.json "externalDirs") and its texture pack ("packFrom").

The ground is the scale model's, at 1:1, as Longsong's is: region/data is the cut round the cove (tools/scale-model/
extract_region.py, from the scale-model line with edit 517 and edit_517_azure.py; region/source holds its inputs), decoded
here into gen/39ad-world-data.js by Pinnacle Rock's tools/world_data.py (read in place), and drawn by the open world's fields
(core/world/41-world-fields.js, read in place) on core/terrain's KRELIEF. core/atmos and core/water draw
the sky in the lake and the lake itself (kit.json "files").

    python3 build.py                 # dist/azure-dream.html
    KRATOR_GL=gpu python3 verify.py dist/azure-dream.html --assert --views "Overview,From the barge"
"""
import os, sys                                   # item 25 (the survey): a plain run goes through tools/build.py
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools')); import buildlib; sys.path.pop(0)
buildlib.through_tools_build(__file__)           # build-inputs.json is always written (KRATOR_ALLOW_PLAIN_BUILD=1 skips it)
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
# through Xanadu's build (rand, tags, host, door, lod, atmos), kit.json "files" (atmos, water), "external" (terrain, walk,
# sched, crops) and gen/69ad-kcity-bundle.js (space, city, hamlet)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/atmos', 'core/water', 'core/terrain', 'core/walk', 'core/biome', 'core/space', 'core/city', 'core/hamlet', 'core/sched')
GEN = os.path.join(HERE, 'gen')
# core/space, core/city and core/hamlet in one closure (as settlements/qiblai/build.py's kcity_bundle): core/city's globals (SL,
# PLAN, TUNE, clamp...) stay inside, and so does KSPACE (core/space writes it onto `window`: the closure hands each module a
# window of its own), because Xanadu's page keeps core/space out of its global scope (its vendored biome's scatter takes another
# path when KSPACE is global). KCITY is the closure's return; KHAMLET leaves through globalThis (core/hamlet 10), and its
# functions read the closure's KCITY and KSPACE. The villages (src/89zac) are its one user.
CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '35-city-squares.js', '40-city-kcity.js',
           '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js']   # the multi-kit host (Stage 8 D8): inert until called
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '20-hamlet-cultures.js', '30-hamlet-village.js']
SPACE = 'core/space/20-core-space.js'
REGION = os.path.join(HERE, 'region')
# the kits the world's fields know here: the Vale of Xanadu (the page's own vendored biome, XANADU)
WORLD_KITS = "var WORLD_KITS=[{name:'xanadu',global:'XANADU',overlay:'xanadu'}];\n"


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
        if f == '10-city-core.js':
            body += 'globalThis.KCITY = KCITY;\n'
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd('core/hamlet/' + f))
    return ('/* KCITY and KHAMLET: core/space, core/city and core/hamlet in one closure (settlements/azure-dream/build.py). '
            'GENERATED: edit core/. */\n'
            'var KCITY = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, KSPACE: KSPACE };\n'
            'return KCITY;\n})(Object.create(window));\n')


def write_gen():
    sys.path.insert(0, os.path.join(ROOT, 'settlements', 'pinnacle-rock', 'tools'))
    import world_data
    os.makedirs(GEN, exist_ok=True)
    for name, new in (('39ad-world-data.js', world_data.fragment(REGION, kits=WORLD_KITS, name='39ad-world-data.js')),
                      ('69ad-kcity-bundle.js', kcity_bundle())):
        out = os.path.join(GEN, name)
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*[os.path.join(REGION, 'data', f) for f in sorted(os.listdir(os.path.join(REGION, 'data')))])
BSRC.note(os.path.join(ROOT, 'settlements', 'pinnacle-rock', 'tools', 'world_data.py'))
BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS] + ['core/hamlet/' + f for f in HAMLET_JS]))
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
