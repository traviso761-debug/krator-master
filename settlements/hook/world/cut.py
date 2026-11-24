#!/usr/bin/env python3
"""Cut Hook's piece of the Krator Scale Model: the data settlements/hook/src/75d-hook-world.js stands on.

    python3 settlements/hook/world/cut.py           # region.json and the rasters, here beside this script
    python3 settlements/hook/world/cut.py --dry     # print the box and the command, write nothing

The cut is tools/scale-model/extract_region.py on the model's own data (tools/scale-model/model/data, the 5.1 canvas,
never a saved page) and its own settlement list (`model`), as tools/scale-model/cut_site.py cuts a region: a box of BOX_PX
map pixels round Hook's pin (sm3ft5vrof, px 809,923 on the 5.1 canvas: the owner moved it to the shore on 2026-10-19,
537,593 on the old one), with the extractor's own 20 km margin, so the shelf, the slope behind and the coast's bearing
either way are all in it. The box is written beside the model's regions as a document of kind 'tool' (never read as a
biome), so the overlays are the model's own. The upsampling is the extractor's default for a cut this size (4: 500 m
cells); no smoothing and no relief (region.json asks for neither, so the page lists neither 40 nor 43).

Then Hook's own landform records (landforms.json beside this script: the spit the model's 2 km cells cannot hold, in the
model's own format) are added to region.json's `landforms` unless the model already carries their ids, so the page's
core/world/41l-world-landforms.js stamps them as it stamps the model's.

Hook's page reads the result through core/world/41-world-fields.js and 41l, read in place (WORLD.init on core/world/
world_data.py's decoding), as settlements/pinnacle-rock reads its own cut. Deterministic: the same model data gives the same cut.
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
SM = os.path.join(ROOT, 'tools', 'scale-model')
HOOK_ID = 'sm3ft5vrof'
BOX_PX = 10          # half-width of the cut round Hook's pin, in map pixels (2 km each): a 40 km box


def main():
    sys.path.insert(0, SM)
    import extract_region as XR
    pin = [s for s in XR.load_model_defaults('settlements') if s['id'] == HOOK_ID]
    if not pin:
        sys.exit('cut.py: Hook (%s) is not in the model\'s settlement list (model/src/60-settlements.js)' % HOOK_ID)
    x, y, b = pin[0]['px'], pin[0]['py'], BOX_PX
    box = {'id': 'cut-hook', 'name': 'Hook cut', 'kind': 'tool',
           'points': [[x - b, y - b], [x + b, y - b], [x + b, y + b], [x - b, y + b]],
           'notes': 'settlements/hook/world/cut.py: the box Hook is cut on'}
    print('Hook cut: pin px %d,%d, box px %d..%d x %d..%d' % (x, y, x - b, x + b, y - b, y + b))
    with tempfile.TemporaryDirectory() as td:
        rj = os.path.join(td, 'regions.json')
        with open(rj, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(XR.load_model_defaults('regions') + [box], fh, ensure_ascii=False, indent=0)
        cmd = [sys.executable, os.path.join(SM, 'extract_region.py'), os.path.join(SM, 'model', 'data'), rj, 'model',
               'Hook cut', HERE, '--upsample', 'auto']
        if '--dry' in sys.argv:
            print(' '.join(cmd))
            return 0
        r = subprocess.call(cmd)
        if r:
            sys.exit('cut.py: extract_region.py failed (%d)' % r)
    rp = os.path.join(HERE, 'region.json')
    M = json.load(open(rp, encoding='utf-8'))
    # Hook's own landform records (landforms.json: the spit, in the model's format), added as extract_region.py adds the
    # model's (x and z of the record's px in the cut's frame), unless the model already carries the id
    cx, cy = M['frame']['origin_px']
    have = {r.get('id') for r in M.get('landforms', [])}
    own = json.load(open(os.path.join(HERE, 'landforms.json'), encoding='utf-8'))['landforms']
    added = []
    for r in own:
        if r['id'] in have:
            continue
        r = dict(r, x=round((r['px'] - cx) * 2000.0, 1), z=round((r['py'] - cy) * 2000.0, 1), source='settlements/hook/world/landforms.json')
        M.setdefault('landforms', []).append(r)
        added.append(r['id'])
    print('Hook\'s own landforms added: %s' % (', '.join(added) or 'none (the model carries them all)'))
    M['cut'] = {'by': 'settlements/hook/world/cut.py', 'pin': HOOK_ID, 'px': [x, y], 'box_px': BOX_PX, 'own_landforms': added}
    with open(rp, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(M, fh, ensure_ascii=False, indent=1)
    print('cut Hook: origin px %s, box px %s, heights %s' % (M['frame']['origin_px'], M['frame']['box_px'], M['heights']['grid']))
    return 0


if __name__ == '__main__':
    sys.exit(main())
