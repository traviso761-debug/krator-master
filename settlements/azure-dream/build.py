#!/usr/bin/env python3
"""Grēṭ-Āil, the head monastery of the Order of the Azure Dream (PLAN.md; the owner, 2026-11-16: "build the page next").

The page is built on Xanadu's page, as Qiblai's city is (settlements/qiblai/build.py): settlements/xanadu/build.py --kit
takes this folder's kit.json, src/ (the Order's own buildings, qb_ad_*, on the Qiblai kit's helpers: seeds 34000-34199) and
targets/, with the Qiblai kit's fragments read in place (kit.json "externalDirs") and its texture pack ("packFrom").

The ground is the scale model's, at 1:1, as Longsong's is: region/data is the cut round the cove (tools/scale-model/
extract_region.py, from the scale-model line with edit 517 and edit_517_azure.py; region/source holds its inputs), decoded
here into gen/39ad-world-data.js by Pinnacle Rock's tools/world_data.py (read in place), and drawn by the open world's fields
(openworld/isle-demo/src/world/41-world-fields.js, read in place) on core/terrain's KRELIEF. core/atmos and core/water draw
the sky in the lake and the lake itself (kit.json "files").

    python3 build.py                 # dist/azure-dream.html
    KRATOR_GL=gpu python3 verify.py dist/azure-dream.html --assert --views "Overview,From the barge"
"""
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
# through Xanadu's build (rand, tags, host, door, lod, atmos), kit.json "files" (atmos, water) and "external" (terrain, walk)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/atmos', 'core/water', 'core/terrain', 'core/walk', 'core/biome', 'core/space', 'core/city', 'core/hamlet')
GEN = os.path.join(HERE, 'gen')
REGION = os.path.join(HERE, 'region')
# the kits the world's fields know here: the Vale of Xanadu (the page's own vendored biome, XANADU)
WORLD_KITS = "var WORLD_KITS=[{name:'xanadu',global:'XANADU',overlay:'xanadu'}];\n"


def write_gen():
    sys.path.insert(0, os.path.join(ROOT, 'settlements', 'pinnacle-rock', 'tools'))
    import world_data
    os.makedirs(GEN, exist_ok=True)
    out = os.path.join(GEN, '39ad-world-data.js')
    new = world_data.fragment(REGION, kits=WORLD_KITS, name='39ad-world-data.js')
    old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
    if old != new:
        with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(new)


BSRC.note(*[os.path.join(REGION, 'data', f) for f in sorted(os.listdir(os.path.join(REGION, 'data')))])
BSRC.note(os.path.join(ROOT, 'settlements', 'pinnacle-rock', 'tools', 'world_data.py'))
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
