#!/usr/bin/env python3
"""Cut Longsong's page region off the scale model (5.1): a square of HALF map pixels round the model's Longsong pin, at
500 m height cells, into region/data, with the polygon and the model's regions in region/source. The page's origin
(LS.SITE in src/40-ls-plan.js) is the pin, given in the cut's frame (metres from the box's centre pixel).

    python3 settlements/longsong/tools/cut_region.py

The model's data is tools/scale-model/model/data (always the 5.1 canvas); the pin is the model's settlement list
(tools/scale-model/model/src/60-settlements.js, its SETT_MOVED edits applied: '5.1e7' put Longsong on the Biruk
al-Ghaym, 2026-11-11). Deterministic: the same model gives the same cut."""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.dirname(HERE)
ROOT = os.path.normpath(os.path.join(PAGE, '..', '..'))
SM = os.path.join(ROOT, 'tools', 'scale-model')
sys.path.insert(0, SM)
import extract_region as XR   # noqa: E402

LONGSONG = 'sq80bzd7ep'
HALF = 30            # map pixels (2 km each): a 120 km square, as the 4.21 cut's 60 x 60 px box with its margin
NAME = 'longsong surroundings'


def main():
    sett = {s['id']: s for s in XR.load_model_defaults('settlements')}
    S = sett[LONGSONG]
    px, py = S['px'], S['py']
    cx, cy = round(px), round(py)
    box = [[cx - HALF, cy - HALF], [cx + HALF, cy - HALF], [cx + HALF, cy + HALF], [cx - HALF, cy + HALF]]
    src, data = os.path.join(PAGE, 'region', 'source'), os.path.join(PAGE, 'region', 'data')
    os.makedirs(src, exist_ok=True)
    regs = XR.load_model_defaults('regions') + [{'id': 'cut-longsong', 'name': NAME, 'kind': 'tool', 'points': box,
                                                  'notes': "Longsong's page region (settlements/longsong/tools/cut_region.py)"}]
    with open(os.path.join(src, 'regions.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(regs, f, ensure_ascii=False, indent=0)
    with open(os.path.join(src, 'box.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump([{'name': NAME, 'map_px': box, 'pin': [px, py]}], f, ensure_ascii=False, indent=1)
    for stale in ('regions-cut.json', 'settlements.json'):   # the 4.21 cut's (2026-10-19)
        p = os.path.join(src, stale)
        if os.path.exists(p):
            os.remove(p)
    cmd = [sys.executable, os.path.join(SM, 'extract_region.py'), os.path.join(SM, 'model', 'data'),
           os.path.join(src, 'regions.json'), 'model', NAME, data, '--upsample', '4']
    r = subprocess.call(cmd)
    if r:
        sys.exit('cut_region: extract_region.py failed (%d)' % r)
    M = json.load(open(os.path.join(data, 'region.json'), encoding='utf-8'))
    ox, oy = M['frame']['origin_px']
    print('cut %s: box px %s, origin px %s; the pin %.2f,%.2f is world x %.0f, z %.0f in the cut'
          % (NAME, M['frame']['box_px'], M['frame']['origin_px'], px, py, (px - ox) * 2000, (py - oy) * 2000))


if __name__ == '__main__':
    main()
