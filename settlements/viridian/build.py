#!/usr/bin/env python3
"""The Order of Viridian Thought's head monastery and master tea and herb estate (PLAN.md). Two targets on one build:
  sheet   dist/viridian-sheet.html: the Order's own buildings (src/, qb_vt_* on the Qiblai kit's helpers, seeds 34200-34399)
          beside the green monastery (step V3)
  estate  dist/viridian.html: the head house and its tea estate at 1:1 on the scale model's ground (step V6, a first pass)

Both are targets on Xanadu's page, as the Qiblai kit's, the Azure Dream's and Kirstabal's are: settlements/xanadu/build.py --kit
takes this folder's kit.json, src/ and targets/, with the Qiblai kit's fragments read in place (kit.json "externalDirs") and its
texture pack ("packFrom"). The estate's ground is the scale model's cut round px 962,1562 (region/data: tools/scale-model/
extract_region.py, its inputs in region/source), decoded here into gen/39vt-world-data.js by Pinnacle Rock's tools/world_data.py
(read in place) and drawn through core/world's fields on core/terrain's KRELIEF (kit.json "files"). The page takes core/rand,
core/tags, core/host, core/door and core/lod through Xanadu's build; CORE_TAKEN names them for tools/check_core_use.py.

    python3 build.py                     # both pages (through tools/build.py: build-inputs.json is written)
    KRATOR_GL=gpu python3 verify.py dist/viridian.html --assert --views "Overview,The head house"
    KRATOR_GL=gpu python3 verify.py dist/viridian-sheet.html --assert --views "Opening,Overview"
    node tests/test-vt-records.js        # the records headless: every def built, on its lot, seeds in the block
    node tests/test-vt-estate.js         # the estate's records: terraces, hedges, beds

The pages read the Qiblai and Xanadu texture packs: in a fresh worktree run `python3 tools/lfs_needs.py settlements/viridian
--pull` first, or the surfaces build black.
"""
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/atmos', 'core/water', 'core/terrain', 'core/world', 'core/biome')   # through Xanadu's build and kit.json
GEN = os.path.join(HERE, 'gen')
REGION = os.path.join(HERE, 'region')
# the kits the world's fields know here: the Vale of Xanadu (the page's own vendored biome, XANADU)
WORLD_KITS = "var WORLD_KITS=[{name:'xanadu',global:'XANADU',overlay:'xanadu'}];\n"


def write_gen():
    sys.path.insert(0, os.path.join(ROOT, 'settlements', 'pinnacle-rock', 'tools'))
    import world_data
    os.makedirs(GEN, exist_ok=True)
    out = os.path.join(GEN, '39vt-world-data.js')
    new = world_data.fragment(REGION, kits=WORLD_KITS, name='39vt-world-data.js')
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
    BSRC.report()   # --list-sources: Xanadu's build printed what the page is made of; this adds this build.py
sys.exit(_rc)
