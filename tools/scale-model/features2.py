"""Scale model 4.13, on top of 4.12 (e412.npy, water412/whas412/wlev412.npy, feat412.npz):
  - a region turned wholly to shallow water, joined to the water beside it
  - the plateaus in a region smoothed down (lowered and rounded, not just weathered)
  - a band either side of part of a region's border smoothed, to ease a sheer cliff

  python3 features2.py <regions dir> --water <id> --flatten <id> --border <id> <km> --join <id>
"""
import sys, json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

args = sys.argv[1:]; rdir = args[0]
opt = lambda k, i=1: args[args.index(k) + i]
water_id, flat_id, border_id, BAND_KM = opt('--water'), opt('--flatten'), opt('--border'), float(opt('--border', 2))
join_id = opt('--join')
KM = 4.0

e = np.load('e412.npy'); e0 = e.copy()
water = np.load('water412.npy'); whas = np.load('whas412.npy'); wlev = np.load('wlev412.npy')
F = dict(np.load('feat412.npz'))
H, W = e.shape

def region(rid):
    d = json.load(open(f'{rdir}/{rid}.json')); d = d.get('data', d)
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon([(x / 2, y / 2) for x, y in d['points']], fill=1)
    return np.array(m).astype(bool), d['name'], d['points']

def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# ---- smooth the cliff along the northern border of a region ----
R, name, pts = region(border_id)
# the northern border: the run of edges between the westernmost and easternmost points, going
# over the top (the side with the smaller y on average)
P = np.array(pts, float) / 2
iw, ie = int(np.argmin(P[:, 0])), int(np.argmax(P[:, 0]))
run_a = [P[(iw + k) % len(P)] for k in range((ie - iw) % len(P) + 1)]
run_b = [P[(iw - k) % len(P)] for k in range((iw - ie) % len(P) + 1)]
north = run_a if np.mean([p[1] for p in run_a]) < np.mean([p[1] for p in run_b]) else run_b
line = Image.new('L', (W, H), 0); ImageDraw.Draw(line).line([tuple(p) for p in north], fill=1, width=1)
dL = nd.distance_transform_edt(~np.array(line).astype(bool))
B = BAND_KM / KM
src = np.where(whas, np.maximum(e, wlev), e)              # water counts as its surface
# ease the large-scale step, keep the fine relief (river cuts, ridges) laid back on top
blur = nd.gaussian_filter(src, B / 3.0, mode='nearest') + 0.85 * np.clip(src - nd.gaussian_filter(src, 1.5, mode='nearest'), -250, 250)   # a cliff is more than detail
w = (1 - sstep(0.7 * B, 1.05 * B, dL)) * ~(water | whas)
new = e + w * (blur - e)
# dry ground that stood above the nearby water stays above it
lvl = nd.grey_dilation(np.where(whas, wlev, -1e9), size=9)
new = np.where((e > lvl) & (lvl > -1e8), np.maximum(new, lvl + 10), new)
e = np.where(w > 0, new, e)
print(f'{name}: border of {len(north)} points, band {BAND_KM:.0f} km either side, {int((np.abs(e - e0) > 1).sum())} px changed')
cliff_zone = w > 0

# ---- smooth down the plateaus in a region: each one lowered toward the ground right round it ----
R, name, _ = region(flat_id)
Rx = nd.binary_dilation(R, iterations=4)
floor = np.percentile(e[R], 35)
top_cut = max(floor + 1500, np.percentile(e[R], 93))
lab, n = nd.label(Rx & (e > top_cut))
keep = [l for l in range(1, n + 1) if (lab == l).sum() >= 8 and (R & (lab == l)).any()]
M = np.zeros_like(water); Z = np.zeros_like(water); target = e.copy(); wz = np.zeros(e.shape)
soft = nd.gaussian_filter(e, 2.5)
for l in keep:
    m = lab == l
    ring = nd.binary_dilation(m, iterations=8) & ~nd.binary_dilation(m, iterations=4) & ~whas
    base = float(np.median(e[ring]))
    z = nd.binary_dilation(m, iterations=8) & ~water & ~whas
    dm = nd.distance_transform_edt(~m)
    t = np.where(soft > base, base + 0.4 * (soft - base), soft)     # keep 40% of the rise above its surroundings
    wl_ = (1 - sstep(4, 8, dm)) * z
    target = np.where(z, t, target); wz = np.maximum(wz, wl_)
    M |= m; Z |= z
    print(f'  plateau {m.sum()} px, top {e[m].max():.0f} m over ground at {base:.0f} m')
new = e + wz * (target - e)
new = np.where(M, np.minimum(new, e), new)
e = np.where(Z, nd.gaussian_filter(new, 0.8) * (wz > 0) + new * (wz == 0), e)
print(f'{name}: {len(keep)} plateaus ({M.sum()} px), tops now {e[M].max():.0f} m (were {e0[M].max():.0f} m)')

# ---- a region wholly to shallow water ----
R, name, _ = region(water_id)
lab, _ = nd.label(whas)
near = nd.binary_dilation(R, iterations=6) & whas & ~R
ids, cnt = np.unique(lab[near], return_counts=True)
level = float(np.median(wlev[lab == ids[np.argmax(cnt)]]))
dR = nd.distance_transform_edt(R)
bed = level - 10 - 30 * sstep(0, 2, dR)                  # 10 m at the edge, ~40 m in the middle
newly = R & ~whas
R_water = R.copy()
e = np.where(R, bed, e)                                   # shallow throughout, whatever was there
dOut = nd.distance_transform_edt(~R)
bank = (dOut <= 3) & ~whas & ~R
e = np.where(bank, np.minimum(e, level + 20 + (np.maximum(e, level + 20) - level - 20) * sstep(0, 3, dOut)), e)
water |= R; whas |= R; wlev = np.where(R, level, wlev)
print(f'{name}: {newly.sum()} px of land to water at {level:.0f} m, bed down to {e[R].max():.0f}..{e[R].min():.0f} m')

# ---- join an island group into one landmass: the water inside the outline becomes low land ----
R, name, _ = region(join_id)
rng = np.random.default_rng(23)
inner = R & whas
lvl = float(np.median(wlev[inner])) if inner.any() else -1500.0
land0 = R & ~whas
# a slightly ragged coast: the outline, nibbled in or pushed out by a cell or so
noise = nd.gaussian_filter(rng.standard_normal(e.shape), 1.2); noise /= noise.std()
dIn = nd.distance_transform_edt(R); dOut = nd.distance_transform_edt(~R)
signed = np.where(R, dIn, -dOut)
coast = (signed + 0.9 * noise) > 0.6
newland = coast & whas
newland &= nd.binary_dilation(R, iterations=2)
# heights: spread the existing land's heights in over the water, at least a little above the sea
known = land0.astype(float); val = np.where(land0, e, 0.0)
num = nd.gaussian_filter(val, 3.0); den = nd.gaussian_filter(known, 3.0)
fillh = np.where(den > 1e-3, num / np.maximum(den, 1e-6), lvl + 80)
fillh = np.maximum(fillh, lvl + 40 + 60 * sstep(0, 3, nd.distance_transform_edt(newland | land0)))
fillh += 25 * nd.gaussian_filter(rng.standard_normal(e.shape), 1.0)
e = np.where(newland, np.maximum(fillh, lvl + 30), e)
water &= ~newland; whas &= ~newland; wlev = np.where(newland, 0.0, wlev)
lab, n = nd.label(R & ~whas)
print(f'{name}: {newland.sum()} px of water to land; land inside it now {n} piece(s), {int((R & ~whas).sum())} px')
join_land = newland

d = e - e0
print('this pass: changed px', int((np.abs(d) > 1).sum()), 'raise %.0f cut %.0f' % (d.max(), d.min()))
np.save('new_e.npy', e)
np.save('water_new.npy', water); np.save('whas_new.npy', whas); np.save('wlev_new.npy', wlev)
F['bay'] = F['bay'] | R_water                               # painted as open sea, like the bay
F['mesa_zone'] = F['mesa_zone'] | Z | (cliff_zone & (np.abs(d) > 300))   # painted outlines softened where the ground moved
F['join_land'] = join_land; F['join_region'] = R
np.savez('feat_masks.npz', **F)
