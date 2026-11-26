#!/usr/bin/env python3
"""Scale model 5.1, edit 28b (2026-11-24): the rest of the Ria basin's old painted threads out of the satellite and relief
maps. Edit 28 took out what lay within 4 px of the old courses, but the old paint ran up to ~10 px off its own records:
here every river-coloured thread (bluer and darker than the paint round it, a median of 11 px) within 12 px of an old
basin course and more than 2 px from a new one is painted over from its surroundings (`paint.inpaint`).

    python tools/scale-model/edit_528b_ria_threads.py <git rev holding the old rivers.json> [--dry]
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA   # noqa: E402
from edit_528_ria_network import basin   # noqa: E402


def lines_mask(lines, shape, r):
    im = Image.new('L', (shape[1], shape[0]), 0)
    d = ImageDraw.Draw(im)
    for pts in lines:
        d.line([tuple(p) for p in pts], fill=1, width=1)
    return nd.distance_transform_edt(~np.array(im).astype(bool)) <= r


def main():
    rev = sys.argv[1]
    dry = '--dry' in sys.argv
    D = P.load()
    old_R = json.loads(subprocess.run(['git', 'show', rev + ':tools/scale-model/model/data/rivers.json'], cwd=HERE,
                                      capture_output=True, text=True, encoding='utf-8').stdout)
    by_old = {str(r['id']): r for r in old_R}
    B = basin(by_old)
    by_new = {str(r['id']): r for r in D['rivers']}
    assert by_new['9101'].get('net528'), 'edit 28 first'
    shape = P.heights(D)[0].shape
    whas = P.water_levels(D)[0]
    band = lines_mask([by_old[k]['px'] for k in B], shape, 12) & ~lines_mask([by_new[k]['px'] for k in B], shape, 2) & ~whas
    rep = {}
    for key in ('st', 't'):
        arr = P.raster(D, key)
        a = arr.astype(float)
        med = np.stack([nd.median_filter(a[..., c], 11) for c in range(3)], -1)
        lum, mlum = a.mean(-1), med.mean(-1)
        thread = band & ((a[..., 2] - a[..., 0]) - (med[..., 2] - med[..., 0]) > 4) & (lum - mlum < -4)
        hole = nd.binary_dilation(thread, iterations=1) & band
        rep[key] = int(hole.sum())
        if not dry:
            D[key] = P.jpeg_like(D, key, PA.inpaint(arr, hole))
    print('threads painted over (px):', rep)
    if not dry:
        P.save(D)
        r = json.load(open(os.path.join(HERE, 'edit_528_ria_network.report.json'), encoding='utf-8'))
        r['threads_removed_px_28b'] = rep
        json.dump(r, open(os.path.join(HERE, 'edit_528_ria_network.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
