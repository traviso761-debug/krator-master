#!/usr/bin/env python3
"""Scale model 5.1, edit 36 (2026-11-26): the rain and climate of the north-west, the Ria and the Crook from the
prevailing winds (the owner: "let the rain and climate in the northwestern lands fall out natural from prevailing
winds, evaporation, and elevation/rain shadow effect, including in veiled mountain"; "do similarly for ria and crook").

    python tools/scale-model/edit_536_wind_climate.py [--dry]

A moisture budget carried by the wind, cell by cell, over the region's land and water (2 km cells):
- The winds, each its own pass, their rain summed by weight:
  - the prevailing north-westerlies (0.40), westerlies (0.20) and northerlies (0.15) off the ocean;
  - south-westerlies (0.15) and southerlies (0.10) off the interior seas.
- Over water the air takes up vapour toward 85 % of saturation at the water's temperature (a quarter of the gap per
  cell): the warm seas give the most.
- Over land the air holds at most 95 % of saturation at the cell's air temperature (its mean, which carries its height):
  - Half of what it carries over that rains out in the cell, the orographic rain, so rising and cooling air drops its
    water on the windward slopes.
  - A small share of what it carries (0.8 % a cell) falls anyway, frontal and convective rain.
  - The land gives 70 % of the rain back (evapotranspiration), so the interiors stay watered.
  - Air that crosses a high ridge arrives dry on the lee and stays dry while it descends and warms: the rain shadow.
  - The air mixes sideways along the wind's front (3 px), so it works round the crater's walls and through their gaps
    instead of being forced over them.
- Saturation is the Magnus vapour pressure, 6.11 exp(17.27 T / (T + 237.3)) hPa. The air arriving at the map's edge
  is the ocean's (at 80 % of its saturation).
- The rain in mm: the budget's rain, smoothed over ~3 km (the wind's spread). Its pattern is kept and its range
  calibrated: rain = a P^0.5, since real rain spans ~1:10-1:30 from the wettest coasts to the driest shadows and the raw
  budget far more. a is set so the region's land keeps its median rain, and the result is held to 4,000 mm (the
  model's scale).
The region: the north-west (x < 700, y < 1000), the Ria basin (x 480-1460, y < 330) and the Crook (x < 280,
y 540-1290), faded into the model's own rain over 30 px where it meets the rest of the map. Then every A, B, C, D and E
class there (the hyperalpine tiers, airless and water classes left) follows from its rain and temperatures (Köppen;
the season letter kept from the model where it had one, B by the annual threshold 20 tm + 140 mm). The rain and
climate maps are repainted. The temperatures are the model's own (they carry the height). No height changes.
Refuses to run twice (its report's mark in the model: rain_wind 5.1e36).
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA   # noqa: E402

BOXES = ((0, 700, 0, 1000), (480, 1460, 0, 330), (0, 280, 540, 1290))   # x0, x1, y0, y1
# (dx, dy) the wind blows toward, weight: the prevailing north-westerlies, westerlies and northerlies off the ocean,
# and the south-westerlies and southerlies off the interior seas
WINDS = (((1, 1), 0.40), ((1, 0), 0.20), ((0, 1), 0.15), ((1, -1), 0.15), ((0, -1), 0.10))
SPREAD = float(os.environ.get('W36_SPREAD', 3.0))    # the air's sideways mixing along the wind's front, px a cell
GAMMA = float(os.environ.get('W36_GAMMA', 0.5))     # the calibration's exponent (see main)
MARK = '5.1e36'
OROG = float(os.environ.get('W36_OROG', 0.5))        # the share of the air's excess over saturation that rains out in a cell
BASE = float(os.environ.get('W36_BASE', 0.008))      # the share of what it carries that falls anyway, a cell
RECYCLE = float(os.environ.get('W36_RECYCLE', 0.7))  # the share of the rain the land gives back


def esat(T):
    return 6.11 * np.exp(17.27 * T / (T + 237.3))


def budget(wet, Tair, Twater, wind):
    """One wind's pass; any (dx, dy) in {-1, 0, 1}^2: the grids flipped so the wind blows toward +x / +y, the pass run,
    the rain flipped back."""
    dx, dy = wind
    fl = lambda a: a[::(-1 if dy < 0 else 1), ::(-1 if dx < 0 else 1)]
    r = _budget(fl(wet), fl(Tair), fl(Twater), (abs(dx), abs(dy)))
    return fl(r)


def _budget(wet, Tair, Twater, wind):
    """One wind's pass toward +x / +y (wind in {0, 1}^2). Returns rain."""
    h, w = wet.shape
    dx, dy = wind
    cap_land = 0.95 * esat(Tair)
    sat_sea = 0.85 * esat(Twater)
    q = np.zeros((h, w)); rain = np.zeros((h, w))
    edge = 0.80 * esat(np.where(wet, Twater, Tair))
    # the order downwind: a cell's upwind neighbours are done before it
    if dx and dy:
        keys = range(h + w - 1)
        sel = lambda s: (np.arange(max(0, s - w + 1), min(h, s + 1)), None)
    for s in (range(h + w - 1) if (dx and dy) else range(w if dx else h)):
        if dx and dy:
            jj = np.arange(max(0, s - w + 1), min(h, s + 1)); ii = s - jj
            up = []
            if True:
                a = np.where(ii > 0, q[jj, np.maximum(ii - 1, 0)], edge[jj, ii])
                b = np.where(jj > 0, q[np.maximum(jj - 1, 0), ii], edge[jj, ii])
                qin = 0.5 * (a + b)
        elif dx:
            jj = np.arange(h); ii = np.full(h, s)
            qin = q[jj, ii - 1] if s > 0 else edge[jj, ii]
        else:
            ii = np.arange(w); jj = np.full(w, s)
            qin = q[jj - 1, ii] if s > 0 else edge[jj, ii]
        wt = wet[jj, ii]
        if SPREAD > 0 and len(qin) > 3:       # the air works round what stands in its way, mixing along the front
            qin = nd.gaussian_filter1d(qin, SPREAD, mode='nearest')
        qn = qin.copy(); r = np.zeros_like(qin)
        # over water: vapour taken up toward saturation at the water's temperature
        qn[wt] = qin[wt] + 0.25 * np.maximum(sat_sea[jj, ii][wt] - qin[wt], 0.0)
        # over land: what the air cannot hold rains out; a share falls anyway; the land gives some back
        L = ~wt
        cap = cap_land[jj, ii][L]
        cond = OROG * np.maximum(qin[L] - cap, 0.0)
        base = BASE * np.minimum(qin[L], cap)
        r[L] = cond + base
        qn[L] = qin[L] - r[L] + RECYCLE * r[L]
        q[jj, ii] = qn; rain[jj, ii] = r
    return rain


def koppen(tw, tc, tm, P, old):
    """A class from the warm, cold and mean month temperatures and the annual rain; the season letter (s, w) kept from
    the old class where it had one."""
    season = old[1] if len(old) == 3 and old[0] in 'CD' and old[1] in 'sw' else 'f'
    if tw < 10:
        return 'ET' if tw > 0 else 'EF'
    pth = 20.0 * tm + 140.0
    if P < pth:
        return ('BW' if P < pth / 2 else 'BS') + ('h' if tm >= 18 else 'k')
    if tc >= 18:
        return 'Af' if P >= 2000 else ('Am' if P >= 1500 else 'Aw')
    third = 'a' if tw >= 22 else ('b' if tw >= 14 else 'c')
    if tc > -3:
        return 'C' + season + third
    if tc < -38:
        third = 'd'
    return 'D' + season + third


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    if D.get('rain_wind') == MARK:
        sys.exit('edit_536 has run already')
    E, W0 = P.heights(D)
    wh, wl = P.water_levels(D)
    sh = E.shape
    codes = [c['code'] for c in D['climate']['classes']]
    T = {k: P.raster(D, k, 'L').astype(float) - 90 for k in ('tm', 'tw', 'tc')}
    cls0 = P.raster(D, 'c', 'L')
    rain0 = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    reg = np.zeros(sh, bool)
    for x0, x1, y0, y1 in BOXES:
        reg[y0:y1, x0:x1] = True
    X1 = max(b[1] for b in BOXES) + 40; Y1 = max(b[3] for b in BOXES) + 40
    win = (slice(0, min(sh[0], Y1)), slice(0, min(sh[1], X1)))
    wet = wh[win]
    airless = (T['tm'] <= -89.5) | (cls0 == codes.index('O'))
    Tair = np.where(airless, -60.0, T['tm'])[win]
    Twat = np.where(wh, np.where(T['tm'] > -89.5, T['tm'], 20.0), 20.0)[win]
    # the water's temperature where the raster has none for it: its nearest water cell's
    tot = np.zeros(wet.shape)
    for wd, wgt in WINDS:
        tot += wgt * budget(wet, Tair, Twat, wd)
    tot = nd.gaussian_filter(tot, 3.0)        # the wind's spread (~6 km), and no streaks along the passes' grid lines
    full = np.zeros(sh); full[win] = tot
    land = reg & ~wh & ~airless
    # the budget's pattern kept, its range calibrated: rain = a P^GAMMA (real rain spans ~1:10-1:30 from the wettest
    # coasts to the driest shadows, a raw budget ~1:100 and more), a set so the region's land keeps its median rain
    pw = np.power(np.maximum(full, 0.0), GAMMA)
    k = float(np.median(rain0[land]) / max(np.median(pw[land]), 1e-12))
    rain_new = np.clip(pw * k, 0.0, 4000.0)
    rain_new[airless] = rain0[airless]
    # faded into the model's own rain over 30 px where the region meets the rest of the map
    din = nd.distance_transform_edt(np.pad(reg, 1, constant_values=True))[1:-1, 1:-1]
    wgt = np.clip(din / 30.0, 0, 1)
    edge_of_map = np.zeros(sh, bool)
    wgt = np.where(reg, wgt, 0.0)
    rain2 = rain0 * (1 - wgt) + rain_new * wgt
    # the classes from the rain and the temperatures
    cls2 = cls0.copy()
    changed = 0
    m = reg & ~wh & ~airless
    names = np.array(codes)
    keep = np.isin(names[cls0], ['HT', 'HF', 'O', 'WS', 'WX', 'WH', 'XA', 'XV', 'XS', 'XW'])
    cache = {}
    for j, i in zip(*np.nonzero(m & ~keep & (wgt > 0.5))):
        old = codes[cls0[j, i]]
        key = (old, int(round(T['tw'][j, i])), int(round(T['tc'][j, i])), int(round(T['tm'][j, i])), int(round(rain2[j, i] / 50.0)))
        c = cache.get(key)
        if c is None:
            c = koppen(key[1], key[2], key[3], key[4] * 50.0, old)
            c = c if c in codes else old
            cache[key] = c
        if c != old:
            cls2[j, i] = codes.index(c); changed += 1
    names2 = names[cls2]
    rep = {'edit': '5.1 edit 36: the rain and climate of the north-west, the Ria and the Crook from the winds', 'date': '2026-11-26',
           'scale_k': round(k, 2), 'region_land_rain_mm': {'before_median': round(float(np.median(rain0[land]))), 'after_median': round(float(np.median(rain2[land]))),
                                                           'after_p10': round(float(np.percentile(rain2[land], 10))), 'after_p90': round(float(np.percentile(rain2[land], 90)))},
           'classes_changed': changed}

    def area(name, x0, x1, y0, y1):
        mm = np.zeros(sh, bool); mm[y0:y1, x0:x1] = True; mm &= land
        u, c = np.unique(names2[mm], return_counts=True)
        return {'rain_median_mm': round(float(np.median(rain2[mm]))), 'classes': {a: int(b) for a, b in sorted(zip(u, c), key=lambda t: -t[1])[:6]}}
    rep['samples'] = {'Veiled Mountains': area('vm', 180, 336, 610, 886), "Matron's Coast": area('mc', 261, 517, 304, 488),
                      'Ria basin': area('ria', 600, 1400, 40, 260), 'Crook': area('crook', 30, 250, 600, 1200),
                      'tsunami coast': area('ts', 100, 330, 300, 660)}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    out = os.path.join(HERE, 'edit_536_wind_climate.report.json')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    hexrgb = lambda hx: tuple(int(hx.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
    col = np.array([hexrgb(cc['color']) for cc in D['climate']['classes']])
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[cls0], col[cnow], cnow != cls0)
    D['rain_wind'] = MARK
    P.save(D)
    print('saved')


if __name__ == '__main__':
    main()
