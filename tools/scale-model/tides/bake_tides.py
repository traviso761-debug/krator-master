#!/usr/bin/env python3
"""tools/scale-model/tides/bake_tides.py: bake the scale model's tides (model/data/tides.json).

    python3 tools/scale-model/tides/bake_tides.py            # the full bake (2 days spin-up + 2 days analysis)
    python3 tools/scale-model/tides/bake_tides.py --quick    # 1 + 1 days, for a smoke test (not for committing)

Decodes the model's heights (h.png) and water levels (wl.png), cuts each sea basin's depth grid at 2 km, and runs
solve_tides.js (the 2D Laplace tidal-equation solver and its harmonic analysis) on them. The result is the tidal record
core/water/tide (KTIDE) reads: per 6 km cell, amplitude and phase of the D1 (24 h) and D2 (12 h) constituents, the peak
current and the depth. Rerun after any edit that moves the coast or the sea floor (an edit_5xx.py on h.png or wl.png).

Springs and neaps (`inferred`): the Week's and the Thirteen's semidiurnal tides are not solved; they are inferred from
the solved D2 by the credo of smoothness (a constituent near D2 in frequency answers the basin as D2 does), with the
ratio of their forcing to D2's. They beat against D2 every half synodic month (3.5 and 6.5 days) and are in phase with
it at the Double Dark (both moons new), so the greatest springs come every 91 days. Only these few numbers change:

    python3 tools/scale-model/tides/bake_tides.py --inferred-only     # rewrite `inferred` in tides.json, no re-solve

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

# Springs and neaps: the moons that beat against D2 (core/atmos/sky/89-atmos-e-skymodel.js: periodD, doubleDark, yearD).
# ratio: the moon's semidiurnal forcing over D2's (solar S2 + the Day's close pass + the Four-Day's share), an owner's
# number, not a solved one: the Week (4,000 km of ice at 700,000 km) 0.28, the Thirteen (4,600 km carbon world at
# 1,050,000 km) 0.17, so the semidiurnal tide runs from 0.55 (neaps at the Count's half) to 1.45 (the Double Dark).
YEAR_D = 365.0
DOUBLE_DARK_D = -0.5          # world days from game start's midnight (t = 0): both moons new
INFERRED = [('Week', 6.87, 0.28), ('Thirteen', 12.55, 0.17)]


def inferred():
    import math
    day = 86400.0
    w2 = 2.0 * 2.0 * math.pi / day
    out = []
    for name, period_d, ratio in INFERRED:
        syn = 1.0 / (1.0 / period_d - 1.0 / YEAR_D)          # phases: the moon's month against the sun
        omega = w2 - 2.0 * 2.0 * math.pi / (syn * day)        # its semidiurnal tide, slower than D2
        out.append({'name': name, 'from': 2, 'ratio': ratio, 'omega': float('%.12g' % omega),
                    'epoch': DOUBLE_DARK_D * day, 'beatD': round(syn / 2.0, 4), 'synodicD': round(syn, 4)})
    return out


def add_inferred(path):
    with open(path, encoding='utf-8') as f:
        rec = json.load(f)
    out = {}
    for k, v in rec.items():
        if k == 'inferred':
            continue
        out[k] = v
        if k == 'constituents':
            out['inferred'] = inferred()
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, separators=(',', ':'))
    print('%s: inferred %s' % (os.path.basename(path), ', '.join('%s (beat %.2f d)' % (c['name'], c['beatD'])
                                                                   for c in out['inferred'])))


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
    if '--inferred-only' in sys.argv:
        add_inferred(out)
        return
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
    add_inferred(out)


if __name__ == '__main__':
    main()
