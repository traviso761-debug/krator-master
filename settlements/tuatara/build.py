#!/usr/bin/env python3
"""Tuatara, the Lizardmen's copper town on the volcanic savanna (PLAN.md; kits/lizardmen/settle/GUIDE.md).
python3 tools/build.py settlements/tuatara (a plain python3 build.py comes through it by itself).

Built on kits/lizardmen/settle/lzv.py and kits/lizardmen/build.py --settlement, with no copy of the kit:
  - gen/69g-lzv-ground.js   scale model 5.1's heights round px 818,1554 (-1,704 m), bicubic (near 20 m, far 500 m)
  - gen/69k-kcity-bundle.js core/city and core/space sealed in one closure
  - gen/45q-res-geodata.js  kits/resources' geology field for KRES.near copper nodes

The modules the page takes (tools/check_core_use.py reads this list): core/rand, core/tags, core/host, core/atmos, core/door,
core/walk and core/furnish through the kit's build; core/engine; core/city and core/space (the bundle); core/water, core/drawn,
core/terrain (KGROUND), core/hamlet (with core/hamlet/lizardmen), core/region (LZ_TUNE), kits/crops and kits/resources through
settlement.json "core".

    python3 tools/build.py settlements/tuatara
    KRATOR_GL=gpu python3 settlements/tuatara/verify.py settlements/tuatara/dist/tuatara.html --assert --views "Overview,The nest hall"
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)

CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/atmos', 'core/door', 'core/walk', 'core/furnish', 'core/engine',
              'core/city', 'core/space', 'core/water', 'core/drawn', 'core/terrain', 'core/hamlet', 'core/region')

sys.path.insert(0, os.path.join(ROOT, 'kits', 'lizardmen', 'settle'))
import lzv                                        # noqa: E402

lzv.build(HERE, pin=(818.0, 1554.0), near=(-5400.0, 4500.0, -6100.0, 6400.0, 20.0), far=(-30000.0, 30000.0, -30000.0, 30000.0, 500.0))
