"""What-if for the eastern abyss: the region's floor rebuilt as one steep-walled bowl, dropping
smoothly from its drawn edge to -2.6 km, with three low points (at the present lakes) holding
salt lakes. Then the climate the scale model's own rules would give it.

Reads the 4.14 state (e414.npy, water414/whas414/wlev414.npy, feat414.npz) and the region JSON;
writes new_e/water_new/whas_new/wlev_new and abyss_masks.npz for assemble.py, then the climate
pass (abyss_climate.py) recolours zones, classes and the climate map.
  python3 abyss.py <region.json> <wall km>
"""
import sys, json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

LO = -2600.0
KM = 4.0
reg_path = sys.argv[1]; WALL_KM = float(sys.argv[2]) if len(sys.argv) > 2 else 28.0
e = np.load('e414.npy'); e0 = e.copy()
water = np.load('water414.npy'); whas = np.load('whas414.npy'); wlev = np.load('wlev414.npy')
H, W = e.shape
rng = np.random.default_rng(5)

def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

P = json.load(open(reg_path)); P = P.get('data', P)['points']
m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(x / 2, y / 2) for x, y in P], fill=1)
R = np.array(m).astype(bool)

# the three present lakes: their centres become the low points
lab, n = nd.label(whas & nd.binary_dilation(R, iterations=3))
lakes = []
for l in range(1, n + 1):
    mm = lab == l
    if (mm & R).sum() >= 20:
        cy, cx = np.argwhere(mm).mean(0)
        lakes.append({'cy': cy, 'cx': cx, 'area': int(mm.sum()), 'old_level': float(wlev[mm].mean())})
lakes.sort(key=lambda L: L['cy'])
print(f"{len(lakes)} lakes:", [(int(L['cx'] * 2), int(L['cy'] * 2), L['area'], int(L['old_level'])) for L in lakes])

# the floor: -2.6 km at each low point, rising gently toward the saddles between them
yy, xx = np.mgrid[0:H, 0:W]
dLow = np.min([np.hypot(yy - L['cy'], xx - L['cx']) for L in lakes], axis=0)
which = np.argmin([np.hypot(yy - L['cy'], xx - L['cx']) for L in lakes], axis=0)
floor = LO + 450 * (1 - np.exp(-dLow / 22.0))           # ~-2.15 km at the saddles between the low points

# the wall: from the height at the drawn edge, an S-curve down to the floor over WALL_KM
dIn = nd.distance_transform_edt(R)
_, (ey, ex) = nd.distance_transform_edt(R, return_indices=True)   # nearest cell outside the region
rim = nd.gaussian_filter(np.where(R, e[ey, ex], e), 2.0)           # edge heights, smoothed along the rim
Dw = WALL_KM / KM
fall = sstep(0, Dw, dIn) ** 0.8                                    # steep, but smooth top and foot
target = rim + (floor - rim) * fall
target += 25 * nd.gaussian_filter(rng.standard_normal(e.shape), 1.2) * sstep(0, 2, dIn)
target = np.maximum(target, LO)
new = np.where(R, target, e)
# blend the outermost cell so the edge stays seamless
e = np.where(R, new * sstep(0, 1.0, dIn) + e * (1 - sstep(0, 1.0, dIn)), e)

# salt lakes in the low points, each about as large as the lake it replaces
water &= ~R; whas &= ~R; wlev = np.where(R, 0.0, wlev)
lake_mask = np.zeros_like(water)
for i, L in enumerate(lakes):
    basin = R & (which == i)
    hs = np.sort(e[basin])
    lvl = float(hs[min(L['area'], hs.size - 1)])
    lk = basin & (e < lvl)
    lab2, _ = nd.label(lk); keep = lab2[int(round(L['cy'])), int(round(L['cx']))]
    lk = lab2 == keep if keep else lk
    lake_mask |= lk; wlev = np.where(lk, lvl, wlev)
    L['new_level'] = lvl; L['new_area'] = int(lk.sum())
water |= lake_mask; whas |= lake_mask
print('new lakes:', [(L['new_area'], int(L['new_level'])) for L in lakes])

d = e - e0
print(f'region: {R.sum()} px; lowered up to {-d.min():.0f} m, raised up to {d.max():.0f} m; '
      f'floor below -1.2 km now {(R & (e < -1200)).sum() / R.sum():.0%} of it (was {(R & (e0 < -1200)).sum() / R.sum():.0%})')
np.save('new_e.npy', e)
np.save('water_new.npy', water); np.save('whas_new.npy', whas); np.save('wlev_new.npy', wlev)
F = dict(np.load('feat414.npz'))
F['abyss'] = R; F['abyss_lakes'] = lake_mask
np.savez('feat_masks.npz', **F)
json.dump(lakes, open('abyss_lakes.json', 'w'))
