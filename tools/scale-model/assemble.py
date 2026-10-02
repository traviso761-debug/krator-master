"""Assemble a scale-model version from the original rasters and the edited heights.

Inputs (working folder): the original rasters decoded from the artifact (h.png, wl.png, z.png,
c.png, st/t/rt/ct.jpg, tm/th/tl/tw/tc.png), old_e.npy (original heights), new_e.npy (edited),
water_new.npy, whas_new.npy, wlev_new.npy, feat_masks.npz, geysers_new.json, the East Ring
Isles region (east_isles.json, full-res px) and the source page (orig.html).

  python3 assemble.py <version label> <out.html>
"""
import sys, json, base64, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

LO, HI = -2600.0, 17100.0
FH, FW = 1393, 1549
label, out_html = sys.argv[1], sys.argv[2]
rng = np.random.default_rng(11)

h = np.array(Image.open('h.png')).astype(np.int64)
wl = np.array(Image.open('wl.png')).astype(np.int64)
Eo = np.load('old_e.npy'); En = np.load('new_e.npy')
water_o = h[..., 2] > 127; whas_o = wl[..., 2] > 127
wlev_o = np.where(whas_o, LO + ((wl[..., 0] << 8) | wl[..., 1]) / 65535 * (HI - LO), 0.0)
water_n = np.load('water_new.npy'); whas_n = np.load('whas_new.npy'); wlev_n = np.load('wlev_new.npy')
F = np.load('feat_masks.npz')
isle, isle_norm, bay, mesa_zone = F['isle'], F['isle_norm'], F['bay'], F['mesa_zone']

def enc(v):
    return np.round((v - LO) / (HI - LO) * 65535).astype(np.int64)

# ---- heights and water ----
q = np.where(np.abs(En - Eo) > 0.5, enc(En), (h[..., 0] << 8) | h[..., 1])
h2 = h.copy(); h2[..., 0] = q >> 8; h2[..., 1] = q & 255; h2[..., 2] = np.where(water_n, 255, 0)
Image.fromarray(h2.astype(np.uint8), 'RGB').save('h_new.png', optimize=True)
qw = np.where(whas_n, enc(wlev_n), 0)
wl2 = np.zeros_like(wl); wl2[..., 0] = qw >> 8; wl2[..., 1] = qw & 255; wl2[..., 2] = np.where(whas_n, 255, 0)
keep = (whas_n == whas_o) & (~whas_n | (np.abs(wlev_n - wlev_o) < 0.5))
wl2[keep] = wl[keep]
Image.fromarray(wl2.astype(np.uint8), 'RGB').save('wl_new.png', optimize=True)

# ---- full-res helpers ----
zoom = (FH / Eo.shape[0], FW / Eo.shape[1])
up = lambda a: nd.zoom(a.astype(float), zoom, order=1)
upm = lambda m: nd.zoom(m.astype(np.uint8), zoom, order=0).astype(bool)
EoF, EnF = up(Eo), up(En)
surf_o = up(np.where(whas_o, np.maximum(Eo, wlev_o), Eo)); surf_n = up(np.where(whas_n, np.maximum(En, wlev_n), En))
islF, bayF, mesaF = upm(isle), upm(bay), upm(mesa_zone)
inormF = up(isle_norm) * islF
seaF_o = upm(whas_o)

# East Ring Isles island pixels as colour donors, keyed by height above the water (0 shore .. 1 top)
P = json.load(open('east_isles.json')); P = P.get('data', P)['points']
m = Image.new('L', (FW, FH), 0); ImageDraw.Draw(m).polygon([tuple(p) for p in P], fill=1)
ER = np.array(m).astype(bool)
# each new island copies the painted face of an East Ring Isles island of similar size, scaled to fit
lab, n = nd.label(ER & ~seaF_o & (EoF > -1490))
idx = np.arange(1, n + 1)
area = nd.sum(np.ones_like(EoF), lab, idx); cy_e, cx_e = np.array(nd.center_of_mass(np.ones_like(EoF), lab, idx)).T
okd = area >= 40
donors = [(int(l), np.sqrt(area[l - 1] / np.pi), cy_e[l - 1], cx_e[l - 1]) for l in idx[okd]]
placed = json.load(open('isles_placed.json'))
nlab, _ = nd.label(islF)
SY = np.zeros(islF.shape, int); SX = np.zeros(islF.shape, int)
_, (ny0, nx0) = nd.distance_transform_edt(lab == 0, return_indices=True)
for (py, px, pr) in placed:
    cyf, cxf, rf = py * FH / Eo.shape[0], px * FW / Eo.shape[1], pr * FW / Eo.shape[1]
    l, re, ce_y, ce_x = donors[int(np.argmin([abs(d[1] - rf) + rng.uniform(0, 1.5) for d in donors]))]
    mine = islF & (np.hypot(*(np.mgrid[0:FH, 0:FW] - np.array([cyf, cxf])[:, None, None])) <= rf * 1.6)
    yy, xx = np.nonzero(mine)
    sy_ = np.clip(np.round(ce_y + (yy - cyf) * re / rf).astype(int), 0, FH - 1)
    sx_ = np.clip(np.round(ce_x + (xx - cxf) * re / rf).astype(int), 0, FW - 1)
    off = lab[sy_, sx_] != l                      # fell off the donor: take its nearest donor pixel
    sy_[off], sx_[off] = ny0[sy_[off], sx_[off]], nx0[sy_[off], sx_[off]]
    SY[yy, xx], SX[yy, xx] = sy_, sx_
iy, ix = np.nonzero(islF)
miss = (SY[iy, ix] == 0) & (SX[iy, ix] == 0)
if miss.any():                                     # any stray island pixel: nearest painted neighbour
    got = islF & ~((SY == 0) & (SX == 0)); _, (gy0, gx0) = nd.distance_transform_edt(~got, return_indices=True)
    SY[iy[miss], ix[miss]] = SY[gy0[iy[miss], ix[miss]], gx0[iy[miss], ix[miss]]]
    SX[iy[miss], ix[miss]] = SX[gy0[iy[miss], ix[miss]], gx0[iy[miss], ix[miss]]]
sy, sx = SY[iy, ix], SX[iy, ix]
# the bay takes the colour of the sea it opens into, sampled from water within ~20 px
near_sea = seaF_o & nd.binary_dilation(bayF, iterations=20) & ~bayF
by, bx = np.nonzero(bayF); ny_, nx_ = np.nonzero(near_sea)
bpick = rng.integers(0, ny_.size, by.size)

def lam(E, zf, az, alt=45):
    gy, gx = np.gradient(E / 1000 * zf, 2.0)
    a = np.radians(az); l = np.radians(alt)
    lx, ly, lz = np.cos(l) * np.sin(a), -np.cos(l) * np.cos(a), np.sin(l)
    return (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1)

D = EnF - EoF
region = nd.binary_dilation(np.abs(D) > 1, iterations=3)
out = {}
for k in ['st', 't', 'rt', 'ct']:
    src = Image.open(k + '.jpg'); im = np.array(src.convert('RGB')).astype(float)
    L = im.mean(-1); Ll = nd.uniform_filter(L, 25) + 1
    mfit = nd.binary_dilation(region, iterations=20); y = (L / Ll - 1)[mfit]; best = None
    for az in range(255, 390, 15):
        for zf in [1, 2, 3, 5, 10]:
            so = lam(EoF, zf, az); x = (so - nd.uniform_filter(so, 25))[mfit]
            g = float((x * y).sum() / (x * x).sum()); r = np.corrcoef(x, y)[0, 1]
            if best is None or r > best[0]: best = (r, az, zf, g)
    r, az, zf, g = best
    res = im.copy()
    # weathered mesas: soften the painted outline a little to match the worn ground
    soft = nd.gaussian_filter(im, (2.0, 2.0, 0))
    res[mesaF] = soft[mesaF]
    # islands and bay: repaint first, so the re-shading below lights them too
    res[iy, ix] = im[sy, sx]
    nm = near_sea.astype(float)
    den = nd.gaussian_filter(nm, 6)
    fill = nd.gaussian_filter(im * nm[..., None], (6, 6, 0)) / np.maximum(den, 1e-6)[..., None]
    fill = np.where((den < 0.02)[..., None], im[near_sea].mean(0), fill)
    alpha = np.clip(nd.gaussian_filter(bayF.astype(float), 1.2) * 1.8, 0, 1)[..., None]
    res = res * (1 - alpha) + fill * alpha
    edge = nd.binary_dilation(islF | bayF, iterations=1) & ~(islF | bayF)
    res = np.where(edge[..., None], nd.gaussian_filter(res, (0.8, 0.8, 0)), res)
    f = np.clip(1 + g * (lam(EnF, zf, az) - lam(EoF, zf, az)), 0.6, 1.6)
    res[region] = res[region] * f[region, None]
    Image.fromarray(np.clip(res, 0, 255).round().astype(np.uint8)).save(k + '_new.jpg', qtables=src.quantization, subsampling=2)
    print(k, 'light az %d zf %d gain %.2f (corr %.2f)' % (az, zf, g, r))

# ---- zones and climate class: islands like their donors, the bay as sea ----
for k in ['z', 'c']:
    a = np.array(Image.open(k + '.png'))
    a[iy, ix] = a[sy, sx]
    a[by, bx] = a[ny_[bpick], nx_[bpick]]
    Image.fromarray(a, 'L').save(k + '_new.png', optimize=True)

# ---- temperatures: lapse with the change in surface height ----
DS = surf_n - surf_o
for k in ['tm', 'th', 'tl', 'tw', 'tc']:
    a = np.array(Image.open(k + '.png')).astype(float); v = a - 90
    ok = (v > -89) & (np.abs(DS) > 1)
    v2 = np.where(ok, np.round(v - 6.5 * DS / 1000), v)
    Image.fromarray(np.clip(v2 + 90, 0, 255).astype(np.uint8), 'L').save(k + '_new.png', optimize=True)

# ---- the page ----
lines = open('orig.html').read().split('\n'); s = lines[201]
i = s.index('{'); data = json.loads(s[i:s.rindex('}') + 1])
rep = {'h': 'h_new.png', 'wl': 'wl_new.png', 'z': 'z_new.png', 'c': 'c_new.png'}
for k in ['st', 't', 'rt', 'ct']: rep[k] = k + '_new.jpg'
for k in ['tm', 'th', 'tl', 'tw', 'tc']: rep[k] = k + '_new.png'
for k, f in rep.items():
    key = '"%s": "' % k; assert s.count(key) == 1, k
    a = s.index(key) + len(key); b = s.index('"', a)
    s = s[:a] + base64.b64encode(open(f, 'rb').read()).decode() + s[b:]
key = '"vents": ['; assert s.count(key) == 1
a = s.index(key) + len(key)
vents = data['vents'] + json.load(open('geysers_new.json'))
b = a; depth = 1
while depth:
    b += 1; depth += {'[': 1, ']': -1}.get(s[b], 0)
s = s[:a] + json.dumps(vents)[1:-1] + s[b:]
lines[201] = s
html = '\n'.join(lines).replace('scale model 4.9 ·', 'scale model %s ·' % label)
assert ('scale model %s ·' % label) in html
open(out_html, 'w').write(html)
print('vents', len(data['vents']), '->', len(vents), '| page', len(html), 'bytes')
