"""Learn the scale model's rain from its terrain, then estimate rain over edited terrain.

The generator's rain is a moisture model (NW wind; moisture from lakes, sea and air over the rim;
wrung out on rising ground). Its code is not here, so: fit rain from terrain features the legend
names, on the map itself, test on held-out blocks, and apply the fitted *change* to the edit:
  rain_new = rain_old * exp(model(new terrain) - model(old terrain))
so the generator's own values stay where nothing changed.

  python3 rainfit.py           (uses e414.npy/whas414 as "old", new_e.npy/whas_new as "new")
"""
import json, numpy as np
from PIL import Image
from scipy import ndimage as nd
from sklearn.ensemble import HistGradientBoostingRegressor

LO, HI = -2600.0, 17100.0
h = np.array(Image.open('h.png')).astype(np.int64)
E9 = LO + ((h[..., 0] << 8) | h[..., 1]) / 65535 * (HI - LO)
wl = np.array(Image.open('wl.png')).astype(np.int64); W9 = wl[..., 2] > 127
H, W = E9.shape
rainF = np.array(Image.open('p.png')).astype(float) / 255 * 4000
rain = nd.zoom(rainF, (H / rainF.shape[0], W / rainF.shape[1]), order=1)
zF = np.array(Image.open('z.png'))
zone = nd.zoom(zF, (H / zF.shape[0], W / zF.shape[1]), order=0)

WIND = np.array([1.0, 1.0]) / np.sqrt(2)    # toward the SE in map px (x right, y down): NW wind

def shift(a, dx, dy):
    return nd.shift(a, (dy, dx), order=1, mode='nearest')

def features(E, wat):
    f = {}
    s = np.where(wat, np.maximum(E, -1500), E)
    f['h'] = s
    for r in (3, 8, 20):                           # local relief: height against the surroundings
        f[f'rel{r}'] = s - nd.uniform_filter(s, 2 * r + 1)
    for d in (4, 10, 25, 50):                       # rising/falling along the wind; barriers upwind
        up = shift(s, d * WIND[0], d * WIND[1])     # value d px upwind (shift brings the NW value here)
        f[f'rise{d}'] = s - up
    upmax = np.full_like(s, -1e9)
    for d in range(2, 61, 3):
        upmax = np.maximum(upmax, shift(s, d * WIND[0], d * WIND[1]))
    f['shadow'] = upmax - s
    wf = wat.astype(float)
    for d in (10, 30):
        f[f'wetup{d}'] = shift(nd.uniform_filter(wf, 2 * d + 1), d * WIND[0], d * WIND[1])
    f['wet_near'] = nd.uniform_filter(wf, 15)
    f['x'] = np.tile(np.arange(W, dtype=float), (H, 1)); f['y'] = np.tile(np.arange(H, dtype=float)[:, None], (1, W))
    names = sorted(f)
    return np.stack([f[k] for k in names], -1), names

X, names = features(E9, W9)
valid = (zone != 2) & ~W9 & (E9 < 9000)            # air (not the airless rim), on land
y = np.log1p(rain)
# hold out 20% of 40x40-px blocks
blk = ((np.arange(H)[:, None] // 40) * 1000 + np.arange(W)[None, :] // 40)
rng = np.random.default_rng(0); ub = np.unique(blk); test_b = rng.choice(ub, len(ub) // 5, replace=False)
test = np.isin(blk, test_b)
tr, te = valid & ~test, valid & test
m = HistGradientBoostingRegressor(max_iter=400, learning_rate=0.08, max_leaf_nodes=63, random_state=0)
m.fit(X[tr], y[tr])
pr = m.predict(X[te])
r2 = 1 - ((pr - y[te]) ** 2).sum() / ((y[te] - y[te].mean()) ** 2).sum()
mae = np.median(np.abs(np.expm1(pr) - rain[te]))
print(f'held-out blocks: R2 (log rain) {r2:.2f}, median abs error {mae:.0f} mm/yr')
ab = valid & (E9 < -1200)
pa = m.predict(X[te & ab]); ya = y[te & ab]
print(f'  abyssal ground only: R2 {1 - ((pa - ya) ** 2).sum() / ((ya - ya.mean()) ** 2).sum():.2f}, '
      f'median abs error {np.median(np.abs(np.expm1(pa) - rain[te & ab])):.0f} mm/yr ({(te & ab).sum()} px)')
m.fit(X[valid], y[valid])                           # final model on everything

Eo, Wo = np.load('e414.npy'), np.load('whas414.npy')
En, Wn = np.load('new_e.npy'), np.load('whas_new.npy')
Xo, _ = features(Eo, Wo); Xn, _ = features(En, Wn)
R = np.load('feat_masks.npz')['abyss']
zoneR = nd.binary_dilation(R, iterations=12)        # rain shadows reach a little past the rim
delta = np.zeros((H, W))
idx = np.nonzero(zoneR)
delta[idx] = m.predict(Xn[idx]) - m.predict(Xo[idx])
delta = nd.gaussian_filter(delta, 1.0) * zoneR
np.save('rain_delta_log.npy', delta)
ratio = np.exp(delta)
print(f'rain change in the region: median x{np.median(ratio[R]):.2f}, '
      f'10-90% x{np.percentile(ratio[R], 10):.2f}..x{np.percentile(ratio[R], 90):.2f}')
newrain = rain * ratio
print(f'region rain median {np.median(rain[R]):.0f} -> {np.median(newrain[R]):.0f} mm/yr; '
      f'floor below -1.2 km: {np.median(rain[R & (En < -1200)]):.0f} -> {np.median(newrain[R & (En < -1200)]):.0f} mm/yr')
json.dump({'r2_heldout_log': round(float(r2), 3), 'mae_heldout_mm': round(float(mae)), 'features': names}, open('rainfit_report.json', 'w'))
