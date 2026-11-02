#!/usr/bin/env python3
"""Read an ArcInfo binary grid (a folder of .adf files, float cells) in a transverse Mercator projection, and write it
as the lat/lon grid a city's terrain.lakeBed reads (the same shape as tools/grid-xyz.py's).

    tools/grid-aig.py <grid folder> <out.json> --lon0 -90.5 --k0 0.9998 --fe 500000 [--fn 0] [--step 60]
                      [--add 1556] [--source "..."]

No GDAL: the format is small. hdr.adf says the cell type and the tile size, dblbnd.adf the bounds, w001001x.adf where
each tile is in w001001.adf; a float tile is a two-byte size and then its cells as big-endian float32, row by row.
--add is added to every value (a survey of depths below the lake's surface, as negative metres, becomes elevations
over sea level). Each output cell takes the grid's value at its centre (bilinear between the four cells round it,
or null where any is empty). The projection is WGS84 transverse Mercator: Guatemala's GTM is --lon0 -90.5 --k0 0.9998
--fe 500000. The output: {"lat0","lon0" (the south-west cell's centre), "dlat","dlon", "nx","ny", "h": [ny*nx,
decimetres above sea level, south row first], "source"}.
"""
import argparse, json, math, os, struct
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("grid"); ap.add_argument("out")
ap.add_argument("--lon0", type=float, required=True); ap.add_argument("--k0", type=float, default=0.9996)
ap.add_argument("--fe", type=float, default=500000.0); ap.add_argument("--fn", type=float, default=0.0)
ap.add_argument("--step", type=float, default=0.0, help="output cell in metres (default: the grid's own)")
ap.add_argument("--add", type=float, default=0.0)
ap.add_argument("--source", default="")
a = ap.parse_args()

rd = lambda n: open(os.path.join(a.grid, n), "rb").read()
hdr = rd("hdr.adf")
ctype = struct.unpack(">i", hdr[16:20])[0]
if ctype != 2:
    raise SystemExit(f"cell type {ctype}: only float grids (2) are read")
px, py = struct.unpack(">dd", hdr[256:272])
tpr = struct.unpack(">i", hdr[288:292])[0]
tx, ty = struct.unpack(">i", hdr[296:300])[0], struct.unpack(">i", hdr[304:308])[0]
x0, y0, x1, y1 = struct.unpack(">dddd", rd("dblbnd.adf"))
W, H = int(round((x1 - x0) / px)), int(round((y1 - y0) / py))
idx, dat = rd("w001001x.adf"), rd("w001001.adf")
A = np.full((H, W), np.nan, dtype=np.float64)
for t in range((len(idx) - 100) // 8):
    off, size = struct.unpack(">ii", idx[100 + t * 8:108 + t * 8])
    if size == 0:
        continue
    r, c = divmod(t, tpr)
    p = off * 2 + 2
    v = np.frombuffer(dat[p:p + tx * ty * 4], dtype=">f4").astype(np.float64)
    if v.size < tx * ty:
        continue
    v = v.reshape(ty, tx)
    v[v < -1e30] = np.nan
    ra, ca = r * ty, c * tx
    if ra >= H or ca >= W:
        continue
    A[ra:min(H, ra + ty), ca:min(W, ca + tx)] = v[:min(ty, H - ra), :min(tx, W - ca)]
ok = np.isfinite(A)
print(f"{W}x{H} cells of {px:.2f} m, {ok.sum()} with values, {np.nanmin(A):.1f}..{np.nanmax(A):.1f}")

# WGS84 transverse Mercator, forward (Snyder, Map Projections, eq. 8-9 to 8-10)
AE, F = 6378137.0, 1 / 298.257223563
E2 = F * (2 - F); EP2 = E2 / (1 - E2)
def tm(lat, lon):
    p, l = math.radians(lat), math.radians(lon - a.lon0)
    N = AE / math.sqrt(1 - E2 * math.sin(p) ** 2); T = math.tan(p) ** 2; C = EP2 * math.cos(p) ** 2; Aa = l * math.cos(p)
    M = AE * ((1 - E2 / 4 - 3 * E2 ** 2 / 64 - 5 * E2 ** 3 / 256) * p - (3 * E2 / 8 + 3 * E2 ** 2 / 32 + 45 * E2 ** 3 / 1024) * math.sin(2 * p)
              + (15 * E2 ** 2 / 256 + 45 * E2 ** 3 / 1024) * math.sin(4 * p) - (35 * E2 ** 3 / 3072) * math.sin(6 * p))
    x = a.k0 * N * (Aa + (1 - T + C) * Aa ** 3 / 6 + (5 - 18 * T + T * T + 72 * C - 58 * EP2) * Aa ** 5 / 120)
    y = a.k0 * (M + N * math.tan(p) * (Aa * Aa / 2 + (5 - T + 9 * C + 4 * C * C) * Aa ** 4 / 24 + (61 - 58 * T + T * T + 600 * C - 330 * EP2) * Aa ** 6 / 720))
    return x + a.fe, y + a.fn
# the inverse, by Newton's method on the forward: good to millimetres in a few steps
def inv(x, y, lat, lon):
    for _ in range(6):
        fx, fy = tm(lat, lon); d = 1e-6
        ax, ay = tm(lat + d, lon); bx, by = tm(lat, lon + d)
        j = np.array([[(ax - fx) / d, (bx - fx) / d], [(ay - fy) / d, (by - fy) / d]])
        dl = np.linalg.solve(j, [x - fx, y - fy]); lat += dl[0]; lon += dl[1]
    return lat, lon
la_s, lo_w = inv(x0, y0, 14.6, a.lon0 - 0.6)
la_n, lo_e = inv(x1, y1, la_s, lo_w)
la_n2, lo_w2 = inv(x0, y1, la_n, lo_w)
la_s2, lo_e2 = inv(x1, y0, la_s, lo_e)
S, N_, Wl, El = min(la_s, la_s2), max(la_n, la_n2), min(lo_w, lo_w2), max(lo_e, lo_e2)
step = a.step or px
mid = (S + N_) / 2
dlat, dlon = step / 110574.0, step / (111320.0 * math.cos(math.radians(mid)))
nx, ny = int((El - Wl) / dlon), int((N_ - S) / dlat)
lat0, lon0 = S + dlat / 2, Wl + dlon / 2
h = []
for j in range(ny):
    for i in range(nx):
        x, y = tm(lat0 + j * dlat, lon0 + i * dlon)
        c, r = (x - x0) / px - 0.5, (y1 - y) / py - 0.5          # row 0 is the north edge
        ci, ri = int(math.floor(c)), int(math.floor(r))
        if ci < 0 or ri < 0 or ci + 1 >= W or ri + 1 >= H:
            h.append(None); continue
        q = A[ri:ri + 2, ci:ci + 2]
        if not np.isfinite(q).all():
            h.append(None); continue
        u, v = c - ci, r - ri
        z = q[0, 0] * (1 - u) * (1 - v) + q[0, 1] * u * (1 - v) + q[1, 0] * (1 - u) * v + q[1, 1] * u * v
        h.append(int(round((z + a.add) * 10)))
out = {"lat0": round(lat0, 7), "lon0": round(lon0, 7), "dlat": round(dlat, 9), "dlon": round(dlon, 9), "nx": nx, "ny": ny,
       "step": round(step, 2), "source": a.source, "h": h}
open(a.out, "w", encoding="utf-8", newline="\n").write(json.dumps(out, separators=(",", ":")))
print(f"wrote {a.out}: {nx}x{ny} at {step:.1f} m, {sum(v is not None for v in h)} with values; lat {S:.5f}..{N_:.5f}, lon {Wl:.5f}..{El:.5f}")
