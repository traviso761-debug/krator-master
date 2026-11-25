#!/usr/bin/env python3
"""tools/scale-model/tides/bake_tides.py: bake the scale model's tides (model/data/tides.json).

    python3 tools/scale-model/tides/bake_tides.py            # the full bake (2 days spin-up + 2 days analysis)
    python3 tools/scale-model/tides/bake_tides.py --quick    # 1 + 1 days, for a smoke test (not for committing)

Decodes the model's heights (h.png) and water levels (wl.png), cuts each sea basin's depth grid at 2 km, and runs
solve_tides.js (the 2D Laplace tidal-equation solver and its harmonic analysis) on them. The result is the tidal record
core/water/tide (KTIDE) reads: per 6 km cell, amplitude and phase of the D1 (24 h) and D2 (12 h) constituents, the peak
current and the depth. Rerun after any edit that moves the coast or the sea floor (an edit_5xx.py on h.png or wl.png).

Basins: a box in model pixels and the band of water levels that is that sea. The open ocean takes the equilibrium tide
through its open west and north edges; an enclosed sea (the Ring Sea, 1,500 m down) only through its own forcing.
"""
import json
import os
import struct
import subprocess
import sys
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'model', 'data'))
OUT = os.path.join(DATA, 'tides.json')

BASINS = [
    {'id': 'nwocean', 'name': 'Western Ocean (NW, sea level 0 m)', 'x0': 0, 'y0': 0, 'w': 700, 'h': 720,
     'lev': [-10.0, 10.0], 'level': 0.0, 'open': True, 'cell': 3},
    {'id': 'ringsea', 'name': 'Ring Sea (enclosed, -1,500 m)', 'x0': 685, 'y0': 695, 'w': 370, 'h': 330,
     'lev': [-1515.0, -1485.0], 'level': -1500.0, 'open': False, 'cell': 3},
]


def decode():
    with open(os.path.join(DATA, 'model.json'), encoding='utf-8') as f:
        model = json.load(f)
    sc = {o['key']: o['value'] for o in model['keys'] if 'value' in o}
    W, H, LO, HI = sc['w'], sc['hh'], sc['lo'], sc['hi']
    span = HI - LO
    hb = Image.open(os.path.join(DATA, 'h.png')).convert('RGB').tobytes()
    wb = Image.open(os.path.join(DATA, 'wl.png')).convert('RGB').tobytes()
    return W, H, LO, span, hb, wb


def cut(W, LO, span, hb, wb, B):
    buf = bytearray(B['w'] * B['h'] * 4)
    lo, hi = B['lev']
    wet = 0
    for j in range(B['h']):
        row = (B['y0'] + j) * W
        for i in range(B['w']):
            o = (row + B['x0'] + i) * 3
            d = 0.0
            if hb[o + 2] > 127 and wb[o + 2] > 127:
                wl = LO + (((wb[o] << 8) | wb[o + 1]) / 65535.0) * span
                if lo <= wl <= hi:
                    el = LO + (((hb[o] << 8) | hb[o + 1]) / 65535.0) * span
                    d = max(2.0, wl - el)
                    wet += 1
            struct.pack_into('<f', buf, (j * B['w'] + i) * 4, d)
    return buf, wet


def main():
    quick = '--quick' in sys.argv
    out = OUT
    if '--out' in sys.argv:
        out = os.path.abspath(sys.argv[sys.argv.index('--out') + 1])
    W, H, LO, span, hb, wb = decode()
    with tempfile.TemporaryDirectory(prefix='krator-tides-') as work:
        spec = []
        for B in BASINS:
            buf, wet = cut(W, LO, span, hb, wb, B)
            with open(os.path.join(work, 'bathy_%s.bin' % B['id']), 'wb') as f:
                f.write(buf)
            print('%s: %dx%d px at 2 km, %d wet' % (B['id'], B['w'], B['h'], wet))
            spec.append({k: B[k] for k in ('id', 'name', 'x0', 'y0', 'w', 'h', 'level', 'open', 'cell')})
        with open(os.path.join(work, 'basins.json'), 'w', encoding='utf-8', newline='\n') as f:
            json.dump({'basins': spec}, f)
        cmd = ['node', os.path.join(HERE, 'solve_tides.js'), '--work', work, '--out', out] + (['--quick'] if quick else [])
        subprocess.run(cmd, check=True)


if __name__ == '__main__':
    main()
