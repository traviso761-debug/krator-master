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
import sys, os, json, base64, numpy as np
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

# ---- rain: the fitted change (rainfit.py), if present ----
rain0 = rain.copy()
import os
if os.path.exists('rain_delta_log.npy'):
    ratio = np.exp(up(np.load('rain_delta_log.npy')))
    rain = np.clip(rain0 * ratio, 0, 4000)
    Image.fromarray(np.round(rain / 4000 * 255).astype(np.uint8), 'L').save('p_new.png', optimize=True)
    RZ = upm(nd.binary_dilation(F['abyss'], iterations=12))
else:
    RZ = R

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
# outside the abyssal floor, only the Koppen dryness test can change with rain (Peel et al. 2007:
# threshold 2*MAT+14 mm; steppe below 10x, desert below 5x; h if MAT >= 18 C), which the map's own
# B classes follow; A/C/D detail depends on seasonality the rain field does not carry, so it stays
tset = {k: np.array(Image.open(k + '_new.png')).astype(float) - 90 for k in ['tm']}
B_ids = [code[k] for k in ('BWh', 'BWk', 'BSh', 'BSk')]
cand = RZ & ~aby & ~(R & LK) & (tset['tm'] > -89) & ~np.isin(c_old, [code[k] for k in ('WS', 'WX', 'WH', 'O')]) & (pres <= 1.85)
def dryclass(P, T):
    th = 2 * T + 14
    hk = np.where(T >= 18, 'h', 'k')
    out = np.full(P.shape, -1)
    for kind, lim in (('W', 5), ('S', 10)):
        for t in ('h', 'k'):
            m = (out < 0) & (P < lim * th) & (hk == t); out[m] = code['B' + kind + t]
    return out
d_old = dryclass(rain0, tset['tm']); d_new = dryclass(rain, tset['tm'])
wasB = np.isin(c_old, B_ids)
up_ = rain > rain0; dn_ = rain < rain0
# a dry cell turns humid only if rain rose and the test now says humid; a dry cell changes dry
# class only in the direction rain moved; a humid cell turns dry only if rain fell, the test called
# it humid before and dry now
humid_now = cand & wasB & up_ & (d_new < 0) & (d_old >= 0)
rank = {code['BWh']: 0, code['BWk']: 0, code['BSh']: 1, code['BSk']: 1}
r_old = np.vectorize(lambda v: rank.get(int(v), 2))(c_old); r_new = np.vectorize(lambda v: rank.get(int(v), 2))(np.where(d_new >= 0, d_new, -1))
r_test0 = np.vectorize(lambda v: rank.get(int(v), 2))(np.where(d_old >= 0, d_old, -1))
dry_now = cand & (d_new >= 0) & (((wasB) & (r_test0 == r_old) & (r_new != r_old) & ((up_ & (r_new > r_old)) | (dn_ & (r_new < r_old)))) |
                                  ((~wasB) & dn_ & (d_old < 0)))
c[dry_now] = d_new[dry_now]
if humid_now.any():
    humid = ~np.isin(c_old, B_ids + [code[k] for k in ('WS', 'WX', 'WH', 'O')]) & (pres <= 1.85) & ~upm(F['abyss'])
    _, (iy, ix) = nd.distance_transform_edt(~humid, return_indices=True)
    c[humid_now] = c_old[iy[humid_now], ix[humid_now]]
moved = dry_now | humid_now
print(f'Koppen dryness changed {moved.sum()} px outside the abyssal floor ({dry_now.sum()} drier/steppe-desert shifts, {humid_now.sum()} to humid)')
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
RAMP = [(0, 'd6b278'), (.06, 'decd96'), (.15, 'bed296'), (.25, '78beaa'), (.40, '3c96aa'), (.60, '1e5fa0'), (1.0, '14286e')]
def ramp(v):
    t = np.clip(v / 4000, 0, 1); out = np.zeros(v.shape + (3,))
    for (a, ca), (b, cb) in zip(RAMP[:-1], RAMP[1:]):
        m = (t >= a) & (t <= b); f = ((t - a) / (b - a))[m][:, None]
        out[m] = hexrgb('#' + ca) * (1 - f) + hexrgb('#' + cb) * f
    return out
if os.path.exists('p_new.png'):
    src = Image.open('rt_new.jpg'); rt = np.array(src.convert('RGB')).astype(float)
    ch = RZ & (np.abs(rain - rain0) > 15)
    lumr = lambda a: a @ np.array([0.299, 0.587, 0.114])
    fr = np.clip(lumr(rt) / np.maximum(lumr(ramp(rain0)), 1), 0.4, 1.6)
    rt[ch] = np.clip(ramp(rain)[ch] * fr[ch, None], 0, 255)
    Image.fromarray(rt.round().astype(np.uint8)).save('rt_new.jpg', qtables=src.quantization, subsampling=2)
src = Image.open('ct_new.jpg'); ct = np.array(src.convert('RGB')).astype(float)
chg = RZ & (c != c_old)
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
       'rain_mm_median_before': int(np.median(rain0[R])), 'rain_mm_median_after': int(np.median(rain[R])),
       'rain_mm_west_floor_before': int(np.median(rain0[R & (EnF < -1200) & (np.arange(FW)[None, :] < 1000)])),
       'rain_mm_west_floor_after': int(np.median(rain[R & (EnF < -1200) & (np.arange(FW)[None, :] < 1000)])),
       'classes_changed_outside_region_km2': int((RZ & ~R & (c != c_old)).sum()) * 4}
json.dump(rep, open('abyss_report.json', 'w'), indent=1); print(json.dumps(rep, indent=1))

# ---- the page ----
lines = open(sys.argv[3] if len(sys.argv) > 3 else 'terrain_abyss.html').read().split('\n')
idx = [i for i, l in enumerate(lines) if l.startswith('const DATA = ')][0]; s = lines[idx]
emb = {'c': 'c_new.png', 'z': 'z_new.png', 'st': 'st_new.jpg', 't': 't_new.jpg', 'ct': 'ct_new.jpg',
              'tm': 'tm_new.png', 'th': 'th_new.png', 'tl': 'tl_new.png', 'tw': 'tw_new.png', 'tc': 'tc_new.png'}
if os.path.exists('p_new.png'): emb.update({'p': 'p_new.png', 'rt': 'rt_new.jpg'})
for k, fn in emb.items():
    key = '"%s": "' % k; assert s.count(key) == 1, k
    a = s.index(key) + len(key); b = s.index('"', a)
    s = s[:a] + base64.b64encode(open(fn, 'rb').read()).decode() + s[b:]
lines[idx] = s
open(out_html, 'w').write('\n'.join(lines))
