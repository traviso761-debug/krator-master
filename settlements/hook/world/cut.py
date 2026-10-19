#!/usr/bin/env python3
"""Cut Hook's piece of the Krator Scale Model: the data settlements/hook/src/76-hook-world.js stands on.

    python3 settlements/hook/world/cut.py <scale-model page.html>

The page is the artifact https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q as the Artifact tool saves it (version 4.21
when this was written). The cut is tools/scale-model/extract_region.py on a box of BOX_PX map pixels round Hook's
pixel (settlements.json: px 537,593 since 2026-10-19, when the owner moved it from 596 to the shore), so the shelf, the slope behind and the coast's bearing either
way are all in it (the extractor adds its own 20 km margin). The regions and settlements collections are the open
world's copies (openworld/little-demo/source); the Hook box is added to the regions list as a document of its own
('Hook cut'), so the cut is bounded by it. Output: region.json and the rasters, here beside this script.
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
SRC = os.path.join(ROOT, 'openworld', 'little-demo', 'source')
HOOK_PX = (537, 593)
BOX_PX = 10          # half-width of the cut round Hook's pixel, in map pixels (2 km each): a 40 km box


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    page = sys.argv[1]
    regions = json.load(open(os.path.join(SRC, 'regions.json'), encoding='utf-8'))
    x, y = HOOK_PX
    b = BOX_PX
    regions.append({'id': 'hook-cut', 'name': 'Hook cut', 'kind': 'geographic', 'color': '#c9803c',
                    'points': [[x - b, y - b], [x + b, y - b], [x + b, y + b], [x - b, y + b]],
                    'notes': 'settlements/hook/world/cut.py: the box Hook is cut on'})
    with tempfile.TemporaryDirectory() as td:
        rj = os.path.join(td, 'regions.json')
        with open(rj, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(regions, fh)
        cmd = [sys.executable, os.path.join(ROOT, 'tools', 'scale-model', 'extract_region.py'), page, rj,
               os.path.join(SRC, 'settlements.json'), 'Hook cut', HERE]
        sys.exit(subprocess.call(cmd))


if __name__ == '__main__':
    main()
