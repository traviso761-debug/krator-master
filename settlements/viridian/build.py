#!/usr/bin/env python3
"""The Order of Viridian Thought's head monastery and master tea and herb estate (PLAN.md). Step V3: the Order's own
buildings (src/, qb_vt_* on the Qiblai kit's helpers, seeds 34200-34399) on a sheet beside the green monastery.

The sheet is a target on Xanadu's page, as the Qiblai kit's and the Azure Dream's are: settlements/xanadu/build.py --kit takes
this folder's kit.json, src/ and targets/, with the Qiblai kit's fragments read in place (kit.json "externalDirs") and its
texture pack ("packFrom"). The page takes core/rand, core/tags, core/host, core/door and core/lod through Xanadu's build, and
core/atmos and core/water through kit.json "files"; CORE_TAKEN names them for tools/check_core_use.py.

    python3 build.py                     # dist/viridian-sheet.html (through tools/build.py: build-inputs.json is written)
    KRATOR_GL=gpu python3 verify.py dist/viridian-sheet.html --assert --views "Overview,Viridian Thought — the tea works"
    node tests/test-vt-records.js        # the records headless: every def built, on its lot, seeds in the block

The page reads the Qiblai and Xanadu texture packs: in a fresh worktree run `python3 tools/lfs_needs.py settlements/viridian
--pull` first, or the surfaces build black.
"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/atmos', 'core/water')   # through Xanadu's build and kit.json

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + sys.argv[1:],
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()   # --list-sources: Xanadu's build printed what the page is made of; this adds this build.py
sys.exit(_rc)
