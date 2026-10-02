"""Soften the outer flank of the Inner Wall on the Krator scale model.

Works on the half-res height raster (774x696, 4 km a pixel) decoded from the artifact into the
working folder (h.png, wl.png). Run: python3 inner_wall_smooth.py 5 10 16 (sigma, reach up the
wall, reach out from it, all in pixels); then inner_wall_reshade.py. The crater-facing half of the wall,
the crater itself and all water cells are left as they are.
"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd

SIGMA = float(sys.argv[1]) if len(sys.argv) > 1 else 4.0   # blur, px
A_IN = float(sys.argv[2]) if len(sys.argv) > 2 else 9.0     # how far up the wall's outer face it reaches
A_OUT = float(sys.argv[3]) if len(sys.argv) > 3 else 14.0   # how far out the apron reaches
LO, HI = -2600.0, 17100.0

h = np.array(Image.open('h.png')).astype(np.int64)
e = LO + ((h[..., 0] << 8) | h[..., 1]) / 65535 * (HI - LO)
water = h[..., 2] > 127
wl = np.array(Image.open('wl.png')).astype(np.int64)
wlev = LO + ((wl[..., 0] << 8) | wl[..., 1]) / 65535 * (HI - LO)
whas = wl[..., 2] > 127

# crater: the below-sea-level basin round the Ring Sea, closed and with the volcano island filled
lab, _ = nd.label(e < 0)
K = lab == lab[252, 247]
K = nd.binary_fill_holes(nd.binary_closing(K, iterations=6))
dK = nd.distance_transform_edt(~K)

# the wall: high ground (>2.5 km) touching the crater, within ~45 px of it
hiG = (e > 2500) & (dK < 70) & ~K
lab, _ = nd.label(hiG)
touch = np.unique(lab[(dK <= 6) & hiG])
W = np.isin(lab, touch[touch > 0])
W = nd.binary_fill_holes(W | K) & ~K   # include small low pockets inside the wall

# inside: the crater grown through low ground that is not wall, a limited number of steps,
# so pockets and inlets against the crater-facing face count as inside and stay untouched
I = K.copy()
for _ in range(12):
    I = nd.binary_dilation(I) & ~W | I
dI = nd.distance_transform_edt(~I)

# outer drop edge: wall cells whose outside neighbour (not crater) lies >600 m lower
pad = np.pad(e, 1, mode='edge'); pW = np.pad(W | I, 1)
edge = np.zeros_like(W)
for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]:
    ne = pad[1 + dy:1 + dy + e.shape[0], 1 + dx:1 + dx + e.shape[1]]
    nw = pW[1 + dy:1 + dy + e.shape[0], 1 + dx:1 + dx + e.shape[1]]
    edge |= W & ~nw & (ne < e - 600)
dO = nd.distance_transform_edt(~edge)

def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# source for the blur: the crater replaced by its nearest rim value (so it never pulls the
# outer flank down), water by its surface level (so lake beds don't either)
src = e.copy()
src[whas] = np.maximum(src[whas], wlev[whas])
_, (iy, ix) = nd.distance_transform_edt(K, return_indices=True)
src[K] = e[iy[K], ix[K]]
blur = nd.gaussian_filter(src, SIGMA, mode='nearest')

w = np.zeros_like(e)
# on the wall: strongest at the outer edge, gone by A_IN px in, and never on the crater-facing half
ww = (1 - sstep(0, A_IN, dO)) * sstep(0.45, 0.62, dI / np.maximum(dI + dO, 1e-6)) * sstep(4, 9, dI)
w[W] = ww[W]
out = ~W & ~I
wo = 1 - sstep(0, A_OUT, dO)
w[out] = wo[out]
w[water | whas] = 0

new = e + w * (blur - e)
new[W] = np.minimum(e[W], new[W])        # the wall only comes down
new[out] = np.maximum(e[out], new[out])  # the ground outside only comes up
# keep land outside at least a little above any adjoining lake surface it already cleared
d = new - e
print('changed px:', int((np.abs(d) > 1).sum()), ' max raise %.0f m, max cut %.0f m' % (d.max(), d.min()))
assert np.abs(d[I]).max() == 0 and np.abs(d[water]).max() == 0
np.save('new_e.npy', new); np.save('old_e.npy', e)
np.save('masks.npy', np.stack([I, W, edge]))

q = np.round((new - LO) / (HI - LO) * 65535).astype(np.int64)
qold = (h[..., 0] << 8) | h[..., 1]
ch = np.abs(d) > 0.5
q = np.where(ch, q, qold)
h2 = h.copy(); h2[..., 0] = q >> 8; h2[..., 1] = q & 255
Image.fromarray(h2.astype(np.uint8), 'RGB').save('h_new.png', optimize=True)
