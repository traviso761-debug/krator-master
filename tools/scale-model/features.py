"""Scale model 4.12, on top of the Inner Wall pass (new_e.npy from inner_wall_smooth.py):
weather the mesas inside the given regions, and carve a shallow bay off the Ring Sea.

  python3 features.py <regions dir> <mesa region id>... --bay <bay region id> --isles <region id> <share>

Writes new_e.npy (heights), water_new.npy (water flag), wlev_new.npy (water level), and
masks for the texture pass (feat_masks.npz).
"""
import sys, json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

LO, HI = -2600.0, 17100.0
args = sys.argv[1:]
rdir = args[0]
bay_id = args[args.index('--bay') + 1]
mesa_ids = [a for a in args[1:args.index('--bay')]]
isles_id = args[args.index('--isles') + 1]; ISLE_SHARE = float(args[args.index('--isles') + 2])

h = np.array(Image.open('h.png')).astype(np.int64)
water = h[..., 2] > 127
wl = np.array(Image.open('wl.png')).astype(np.int64)
whas = wl[..., 2] > 127
wlev = np.where(whas, LO + ((wl[..., 0] << 8) | wl[..., 1]) / 65535 * (HI - LO), 0.0)
e = np.load('e411.npy')             # heights after the Inner Wall pass (4.11)
e0 = e.copy()
H, W = e.shape

def region(rid):
    d = json.load(open(f'{rdir}/{rid}.json')); d = d.get('data', d)
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon([(x / 2, y / 2) for x, y in d['points']], fill=1)
    return np.array(m).astype(bool), d['name']

def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def fnoise(seed, scales, shape):
    """Deterministic fractal noise in about [-1, 1]."""
    rng = np.random.default_rng(seed); out = np.zeros(shape)
    for i, s in enumerate(scales):
        n = nd.gaussian_filter(rng.standard_normal(shape), s)
        out += n / (n.std() + 1e-9) * 0.5 ** i
    return out / 1.5

# ---- mesas: soften shoulders, gully the cliffs, roughen the tops, bank talus at the foot ----
mesa_zone = np.zeros_like(water)
for k, rid in enumerate(mesa_ids):
    R, name = region(rid)
    Rx = nd.binary_dilation(R, iterations=4)
    floor = np.percentile(e[R], 25)
    lab, n = nd.label(Rx & (e > 2400))
    keep = [l for l in range(1, n + 1) if (lab == l).sum() >= 20 and (R & (lab == l)).any()]
    M = np.isin(lab, keep)
    print(f'{name}: floor {floor:.0f} m, {len(keep)} mesas, {M.sum()} px')
    Z = nd.binary_dilation(M, iterations=6) & ~water & ~whas
    dM = nd.distance_transform_edt(~M); dIn = nd.distance_transform_edt(M)
    w = (1 - sstep(4, 7, dM)) * Z                      # the mesa and a ~25 km skirt
    soft = nd.gaussian_filter(e, 1.8)                  # rounded shoulders, spread foot
    gy, gx = np.gradient(e); slope = np.hypot(gx, gy)
    cliff = np.clip(slope / 600.0, 0, 1)               # ~600 m per 4 km px and up = cliff
    cliff = nd.gaussian_filter(cliff, 1.0)
    ridged = 1 - np.abs(fnoise(101 + k, [0.8, 1.6, 3.2], e.shape))   # gully lines
    gully = cliff * np.clip(ridged, 0, 1) ** 2 * 450   # up to ~450 m cut into the faces
    rough = fnoise(201 + k, [1.0, 2.5], e.shape) * 70 * sstep(1, 4, dIn)  # top texture, +-70 m
    target = soft - gully + rough
    new = e + w * (target - e)
    on = M; off = ~M & Z
    new[on] = np.minimum(e[on], new[on])               # the mesa only wears down
    new[off] = np.maximum(e[off], new[off])            # the foot only builds up (talus)
    e = np.where(Z, new, e)
    mesa_zone |= Z

# ---- the Bay of Voth: a shallow arm of the Ring Sea ----
B, name = region(bay_id)
lab, _ = nd.label(whas)
# the water body the bay opens into: the one with the most cells within ~8 px of the outline
near = nd.binary_dilation(B, iterations=8) & whas
ids, cnt = np.unique(lab[near], return_counts=True)
sea = lab == ids[np.argmax(cnt)]
level = float(np.median(wlev[sea]))
print(f'{name}: opens into water at {level:.0f} m ({sea.sum()} px)')
dB = nd.distance_transform_edt(B)                      # depth into the bay from its outline
DEPTH = 60.0                                           # m below the water at the middle
bed = level - 8 - (DEPTH - 8) * sstep(0, 3, dB)        # just under water at the shore, ~60 m mid-bay
# outside the outline the banks ease down to the shore over ~2 px
dOut = nd.distance_transform_edt(~B)
bank = level + 25 + (np.maximum(e, level + 25) - (level + 25)) * sstep(0, 4.5, dOut)
eb = np.where(B, np.minimum(e, bed), np.where(dOut <= 4.5, np.minimum(e, bank), e))
bay = B & (eb < level)
e = eb
water2 = water | bay
whas2 = whas | bay
wlev2 = np.where(bay, level, wlev)
print(f'{name}: {bay.sum()} px of new water, bed down to {e[bay].min():.0f} m')

# ---- geyser islands in the West Ring isles, like the East Ring Isles: ~20-35 km domes,
#      0.6-1.2 km out of the water, a shallow shelf round each, one or two geysers near the top ----
WR, name = region(isles_id)
open_w = WR & whas2 & ~bay
target_px = ISLE_SHARE * open_w.sum()
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:H, 0:W]
land_d = nd.distance_transform_edt(open_w)             # distance from shore or region edge
cand = np.argwhere(open_w & (land_d >= 2))
rng.shuffle(cand)
isle = np.zeros_like(water); isle_norm = np.zeros(e.shape); geysers = []
placed = []
for cy, cx in cand:
    if isle.sum() >= target_px: break
    r = rng.uniform(2.6, 4.6)                          # px; 4 km a px
    if any((cy - py) ** 2 + (cx - px) ** 2 < (r + pr + 2.2) ** 2 for py, px, pr in placed): continue
    if land_d[cy, cx] < r + 0.5: continue
    Hm = rng.uniform(600, 1200)
    lv = wlev2[cy, cx]
    # a lumpy dome: radius wobbles with angle, a little noise on the slopes
    ang = np.arctan2(yy - cy, xx - cx)
    wob = 1 + 0.18 * np.sin(2 * ang + rng.uniform(0, 6.3)) + 0.10 * np.sin(3 * ang + rng.uniform(0, 6.3))
    dn = np.hypot(yy - cy, xx - cx) / (r * wob)
    dome = lv + Hm * np.clip(1 - dn ** 2, 0, 1) ** 1.3 - 40 * (dn > 1)
    shelf = lv - 25 - 120 * sstep(1.0, 1.7, dn)        # shallows round the island
    z = np.where(dn <= 1, dome, shelf)
    sel = (dn <= 1.7) & open_w
    e = np.where(sel, np.maximum(e, z), e)
    land = sel & (e > lv)
    isle |= land
    isle_norm = np.where(land, np.clip((e - lv) / Hm, 0, 1), isle_norm)
    placed.append((cy, cx, r))
    # geysers: one, sometimes two, near the top (map px are full-res, 2 per cell)
    for g in range(1 if rng.random() < 0.6 else 2):
        oy, ox = (rng.uniform(-0.35, 0.35, 2) * r) if g else (0.0, 0.0)
        gy_, gx_ = int(round(cy + oy)), int(round(cx + ox))
        geysers.append({'px': [gx_ * 2 + 1, gy_ * 2 + 1], 'floor': float(e[gy_, gx_] - 60),
                        'scale': 0.1, 'radius': 0.9, 'kind': 'geyser'})
water2 &= ~isle; whas2 &= ~isle; wlev2 = np.where(isle, 0.0, wlev2)
print(f'{name}: {len(placed)} islands, {isle.sum()} px of land = {isle.sum() / open_w.sum():.0%} of its water, {len(geysers)} geysers')

d = e - e0
print('this pass: changed px', int((np.abs(d) > 1).sum()), 'raise %.0f cut %.0f' % (d.max(), d.min()))
np.save('new_e.npy', e)
np.save('water_new.npy', water2); np.save('whas_new.npy', whas2); np.save('wlev_new.npy', wlev2)
json.dump(geysers, open('geysers_new.json', 'w'))
json.dump([[int(a), int(b), float(c)] for a, b, c in placed], open('isles_placed.json', 'w'))
np.savez('feat_masks.npz', mesa_zone=mesa_zone, isle=isle, isle_norm=isle_norm, bay=bay, bay_area=B | (dOut <= 4.5), sea=sea, level=level)
