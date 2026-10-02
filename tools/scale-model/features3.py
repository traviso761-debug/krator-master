"""Scale model 4.14, on top of 4.13 (e413.npy, water413/whas413/wlev413.npy, feat413.npz):
  - raise the water in a region to low land, bridging two landmasses (checked connected)
  - add a few geysers on land in a region, each placed as far as possible from every vent

  python3 features3.py <regions dir> <page with vents> --bridge <id> <a x,y> <b x,y> --geysers <id> <n>
  (a, b: full-res map px on the two landmasses the bridge must join)
"""
import sys, json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

args = sys.argv[1:]; rdir, page = args[0], args[1]
opt = lambda k, i=1: args[args.index(k) + i]
bridge_id = opt('--bridge'); A = [int(v) // 2 for v in opt('--bridge', 2).split(',')]; Bp = [int(v) // 2 for v in opt('--bridge', 3).split(',')]
gey_id, NG = opt('--geysers'), int(opt('--geysers', 2))

e = np.load('e413.npy'); e0 = e.copy()
water = np.load('water413.npy'); whas = np.load('whas413.npy'); wlev = np.load('wlev413.npy')
F = dict(np.load('feat413.npz'))
H, W = e.shape
rng = np.random.default_rng(41)

def region(rid):
    d = json.load(open(f'{rdir}/{rid}.json')); d = d.get('data', d)
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon([(x / 2, y / 2) for x, y in d['points']], fill=1)
    return np.array(m).astype(bool), d['name']

def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# ---- the land bridge ----
R, name = region(bridge_id)
lvl = float(np.median(wlev[R & whas])) if (R & whas).any() else -1500.0
noise = nd.gaussian_filter(rng.standard_normal(e.shape), 1.2); noise /= noise.std()
signed = np.where(R, nd.distance_transform_edt(R), -nd.distance_transform_edt(~R))
newland = ((signed + 0.9 * noise) > 0.6) & whas & nd.binary_dilation(R, iterations=2)
def joined(nl):
    lab, _ = nd.label(~(whas & ~nl))
    return lab[A[1], A[0]] != 0 and lab[A[1], A[0]] == lab[Bp[1], Bp[0]]
grow = 0
while not joined(newland) and grow < 6:          # widen into the water until the two sides meet
    newland |= nd.binary_dilation(newland | (R & ~whas), iterations=1) & whas & nd.binary_dilation(R, iterations=3 + grow)
    grow += 1
land0 = ~whas & nd.binary_dilation(R, iterations=6)
num = nd.gaussian_filter(np.where(land0, np.clip(e, lvl, lvl + 1500), 0.0), 3.0); den = nd.gaussian_filter(land0.astype(float), 3.0)
fillh = np.where(den > 1e-3, num / np.maximum(den, 1e-6), lvl + 80)
fillh = np.maximum(fillh, lvl + 40 + 60 * sstep(0, 3, nd.distance_transform_edt(newland)))
fillh += 25 * nd.gaussian_filter(rng.standard_normal(e.shape), 1.0)
e = np.where(newland, np.maximum(fillh, lvl + 30), e)
water &= ~newland; whas &= ~newland; wlev = np.where(newland, 0.0, wlev)
print(f'{name}: {newland.sum()} px of water to land (widened {grow}x); joined: {joined(np.zeros_like(newland))}')

# ---- geysers on land, away from every existing vent ----
G, gname = region(gey_id)
lines = open(page).read().split('\n'); s = [l for l in lines if l.startswith('const DATA = ')][0]
vents = json.loads(s[s.index('{'):s.rindex('}') + 1])['vents'] + json.load(open('geysers_new.json'))
seen = set(); allv = []
for v in vents:
    k = (round(v['px'][0]), round(v['px'][1]))
    if k not in seen: seen.add(k); allv.append(v)
vm = np.zeros_like(water)
for v in allv:
    x, y = int(v['px'][0] // 2), int(v['px'][1] // 2)
    if 0 <= x < W and 0 <= y < H: vm[y, x] = True
dEdge = nd.distance_transform_edt(G)
okland = (dEdge >= 5) & ~whas & (nd.distance_transform_edt(~whas) >= 2) & (e < 2000)   # dry, off the shore, below the wall top
new_g = []
for _ in range(NG):
    dV = nd.distance_transform_edt(~vm)
    score = np.where(okland, np.minimum(dV, 1.6 * dEdge), -1)    # far from vents, and well inside the region
    y, x = np.unravel_index(np.argmax(score), score.shape)
    if score[y, x] < 7: break                       # nothing left at least ~32 km from a vent
    new_g.append({'px': [int(x * 2 + 1), int(y * 2 + 1)], 'floor': float(e[y, x] + 5), 'scale': 0.1, 'radius': 0.9, 'kind': 'geyser'})
    vm[y, x] = True
    print(f'  geyser at map ({x * 2 + 1}, {y * 2 + 1}), ground {e[y, x]:.0f} m, {score[y, x] * 4:.0f} km from the nearest vent')
print(f'{gname}: {len(new_g)} geysers added')
json.dump(json.load(open('geysers_new.json')) + new_g, open('geysers_new.json.tmp', 'w'))
json.dump(new_g, open('geysers_land.json', 'w'))

d = e - e0
print('this pass: changed px', int((np.abs(d) > 1).sum()))
np.save('new_e.npy', e)
np.save('water_new.npy', water); np.save('whas_new.npy', whas); np.save('wlev_new.npy', wlev)
F['join_land'] = F['join_land'] | newland
np.savez('feat_masks.npz', **F)
