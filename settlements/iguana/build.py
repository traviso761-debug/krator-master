#!/usr/bin/env python3
"""Iguana, the Lizardmen's granary town on the Pile's plateau (PLAN.md; kits/lizardmen/settle/GUIDE.md).
python3 tools/build.py settlements/iguana (a plain python3 build.py comes through it by itself).

Built on kits/lizardmen/settle/lzv.py and kits/lizardmen/build.py --settlement, with no copy of the kit:
  - gen/69g-lzv-ground.js   scale model 5.1's heights round proposed px 713,1569 (-373 m), bicubic (near 20 m, far 500 m)
  - gen/69k-kcity-bundle.js core/city and core/space sealed in one closure

The modules the page takes (tools/check_core_use.py reads this list): core/rand, core/tags, core/host, core/atmos, core/door,
core/walk and core/furnish through the kit's build; core/engine; core/city and core/space (the bundle); core/water, core/drawn,
core/terrain (KGROUND), core/hamlet (with core/hamlet/lizardmen), core/region (LZ_TUNE) and kits/crops through
settlement.json "core".

    python3 tools/build.py settlements/iguana
    KRATOR_GL=gpu python3 settlements/iguana/verify.py settlements/iguana/dist/iguana.html --assert --views "Overview,The Great Granary"
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

lzv.build(HERE, pin=(713.0, 1569.0), near=(-5100.0, 5000.0, -5000.0, 5000.0, 20.0), far=(-30000.0, 30000.0, -30000.0, 30000.0, 500.0))
