"""Climate for the eastern-abyss what-if, by the scale model's own rules, after assemble.py.

  - air pressure from height (the page's formula, 1.6 atm datum, 8 km scale height)
  - temperatures: the change in ground height at 5.5 C/km (the model's lapse, 4.8-6.2)
  - class: abyssal (above 1.85 atm, below about -1.16 km) by annual rain, with the thresholds the
    map itself uses (XW < 400 mm, XS < 800, XV < 1350, XA above); salt lakes WX; elsewhere the old class
  - zones: salt basin below -1.2 km, lake for the lakes
  - textures: the satellite and relief maps recoloured by the new height (donors of like height
    from the abyss and its rim), the climate map repainted in the new class colours
  - rain is the generator's field, unchanged: its moisture routing is not in this repo

  python3 abyss_climate.py <label> <out.html>
"""
import sys, json, base64, numpy as np
from PIL import Image
from scipy import ndimage as nd

label, out_html = sys.argv[1], sys.argv[2]
LO, HI = -2600.0, 17100.0
FH, FW = 1393, 1549
rng = np.random.default_rng(3)
F = np.load('feat_masks.npz')
up = lambda a: nd.zoom(a.astype(float), (FH / a.shape[0], FW / a.shape[1]), order=1)
upm = lambda m: nd.zoom(m.astype(np.uint8), (FH / m.shape[0], FW / m.shape[1]), order=0).astype(bool)

R = upm(F['abyss']); LK = upm(F['abyss_lakes'])
h = np.array(Image.open('h.png')).astype(np.int64)
E0 = LO + ((h[..., 0] << 8) | h[..., 1]) / 65535 * (HI - LO)       # the 4.9 heights
wl0 = np.array(Image.open('wl.png')).astype(np.int64); wh0 = wl0[..., 2] > 127
wlev0 = np.where(wh0, LO + ((wl0[..., 0] << 8) | wl0[..., 1]) / 65535 * (HI - LO), 0)
En = np.load('new_e.npy'); whn = np.load('whas_new.npy'); wlevn = np.load('wlev_new.npy')
S0 = up(np.where(wh0, np.maximum(E0, wlev0), E0)); Sn = up(np.where(whn, np.maximum(En, wlevn), En))
E0F, EnF = up(E0), up(En)

lines = open('orig.html').read().split('\n'); s = lines[201]
data = json.loads(s[s.index('{'):s.rindex('}') + 1])
CL = data['climate']['classes']; code = {c['code']: i for i, c in enumerate(CL)}
rain = np.array(Image.open('p.png')).astype(float)[..., 0] / 255 * 4000 if np.array(Image.open('p.png')).ndim == 3 else np.array(Image.open('p.png')).astype(float) / 255 * 4000

# ---- temperatures ----
dS = Sn - S0
for k in ['tm', 'th', 'tl', 'tw', 'tc']:
    t0 = np.array(Image.open(k + '.png')).astype(float) - 90
    tn = np.array(Image.open(k + '_new.png')).astype(float) - 90
    ok = R & (t0 > -89)
    tn[ok] = np.round(t0[ok] - 5.5 * dS[ok] / 1000)
    Image.fromarray(np.clip(tn + 90, 0, 255).astype(np.uint8), 'L').save(k + '_new.png', optimize=True)

# ---- class and zone ----
c_old = np.array(Image.open('c_new.png')); c = c_old.copy()
z = np.array(Image.open('z_new.png'))
pres = 1.6 * np.exp(-Sn / 8000)
aby = R & ~LK & (pres > 1.85)
xc = np.where(rain < 400, code['XW'], np.where(rain < 800, code['XS'], np.where(rain < 1350, code['XV'], code['XA'])))
c[aby] = xc[aby]
c[R & LK] = code['WX']
# ground that was lake and is now dry but not abyssal: like its dry neighbours
was_w = R & ~LK & ~aby & np.isin(c_old, [code['WS'], code['WX'], code['WH']])
if was_w.any():
    dry = R & ~np.isin(c, [code['WS'], code['WX'], code['WH']]) & ~was_w
    _, (iy, ix) = nd.distance_transform_edt(~dry, return_indices=True)
    c[was_w] = c[iy[was_w], ix[was_w]]
z[R & (EnF < -1200)] = 5; z[R & LK] = 4
z[R & ~LK & (z == 4)] = 0
Image.fromarray(c, 'L').save('c_new.png', optimize=True); Image.fromarray(z, 'L').save('z_new.png', optimize=True)

# ---- textures ----
def hexrgb(hx): return np.array([int(hx[i:i + 2], 16) for i in (1, 3, 5)], float)
pal = np.array([hexrgb(cc['color']) for cc in CL])
# donors of like height: the abyss and a 60 km ring round it, from the 4.9 textures
ring = upm(nd.binary_dilation(F['abyss'], iterations=15))
for k in ['st', 't']:
    src = Image.open(k + '_new.jpg'); im = np.array(src.convert('RGB')).astype(float)
    orig = np.array(Image.open(k + '.jpg').convert('RGB')).astype(float)
    don = ring & ~upm(wh0)
    dy, dx = np.nonzero(don); key = E0F[dy, dx]; o = np.argsort(key); dy, dx, key = dy[o], dx[o], key[o]
    tgt = R & ~LK & (np.abs(EnF - E0F) > 150)
    ty, tx = np.nonzero(tgt)
    pick = np.clip(np.searchsorted(key, EnF[ty, tx]) + rng.integers(-60, 61, ty.size), 0, key.size - 1)
    res = im.copy()
    res[ty, tx] = orig[dy[pick], dx[pick]]
    # lakes: the old lakes' own colour
    lak = upm(wh0) & R
    if lak.any():
        _, (ly, lx) = nd.distance_transform_edt(~lak, return_indices=True)
        q = R & LK; res[q] = orig[ly[q], lx[q]]
    sm = nd.gaussian_filter(res, (1.4, 1.4, 0))
    res = np.where((tgt | (R & LK))[..., None], sm, res)
    # keep the relief shading from assemble's pass: carry its light ratio over
    shade = np.clip((im.mean(-1) + 1) / (nd.gaussian_filter(im, (6, 6, 0)).mean(-1) + 1), 0.6, 1.5)
    res[tgt] = res[tgt] * shade[tgt, None]
    Image.fromarray(np.clip(res, 0, 255).round().astype(np.uint8)).save(k + '_new.jpg', qtables=src.quantization, subsampling=2)
src = Image.open('ct_new.jpg'); ct = np.array(src.convert('RGB')).astype(float)
chg = R & (c != c_old)
lum = lambda a: a @ np.array([0.299, 0.587, 0.114])
f = np.clip(lum(ct) / np.maximum(lum(pal[c_old]), 1), 0.4, 1.6)
ct[chg] = np.clip(pal[c[chg]] * f[chg, None], 0, 255)
Image.fromarray(ct.round().astype(np.uint8)).save('ct_new.jpg', qtables=src.quantization, subsampling=2)

# ---- report ----
def area(mask, cls): return {CL[i]['code']: int(n) * 4 for i, n in zip(*np.unique(cls[mask], return_counts=True))}
before, after = area(R, c_old), area(R, c)
rep = {'region_km2': int(R.sum()) * 4,
       'classes_before_km2': dict(sorted(before.items(), key=lambda x: -x[1])),
       'classes_after_km2': dict(sorted(after.items(), key=lambda x: -x[1])),
       'pressure_atm_mean_before': round(float((1.6 * np.exp(-S0 / 8000))[R].mean()), 2),
       'pressure_atm_mean_after': round(float(pres[R].mean()), 2), 'pressure_atm_max_after': round(float(pres[R].max()), 2),
       'mean_temp_C_before': round(float((np.array(Image.open('tm.png')).astype(float) - 90)[R & ~upm(wh0)].mean()), 1),
       'mean_temp_C_after': round(float((np.array(Image.open('tm_new.png')).astype(float) - 90)[R & ~LK].mean()), 1),
       'hottest_afternoon_C_after': int((np.array(Image.open('th_new.png')).astype(float) - 90)[R].max()),
       'rain_mm_median': int(np.median(rain[R]))}
json.dump(rep, open('abyss_report.json', 'w'), indent=1); print(json.dumps(rep, indent=1))

# ---- the page ----
lines = open(sys.argv[3] if len(sys.argv) > 3 else 'terrain_abyss.html').read().split('\n')
idx = [i for i, l in enumerate(lines) if l.startswith('const DATA = ')][0]; s = lines[idx]
for k, fn in {'c': 'c_new.png', 'z': 'z_new.png', 'st': 'st_new.jpg', 't': 't_new.jpg', 'ct': 'ct_new.jpg',
              'tm': 'tm_new.png', 'th': 'th_new.png', 'tl': 'tl_new.png', 'tw': 'tw_new.png', 'tc': 'tc_new.png'}.items():
    key = '"%s": "' % k; assert s.count(key) == 1, k
    a = s.index(key) + len(key); b = s.index('"', a)
    s = s[:a] + base64.b64encode(open(fn, 'rb').read()).decode() + s[b:]
lines[idx] = s
open(out_html, 'w').write('\n'.join(lines))
