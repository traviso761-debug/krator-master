#!/usr/bin/env python3
"""Average an XYZ survey (lon,lat,elevation per line, as the USGS's) into a lat/lon grid a city's terrain.lakeBed reads.

    tools/grid-xyz.py <survey.xyz|csv> <out.json> --step 20 [--source "..."]

The cells are `step` metres (at the survey's middle latitude); each holds the mean elevation of the points in it,
in decimetres above sea level, or null where the survey has none. The output:
    {"lat0","lon0" (the south-west cell's centre), "dlat","dlon", "nx","ny", "h": [ny*nx, south row first], "source"}
The survey itself stays out of the repo (Crater Lake's is 388 MB); the grid is what is committed.
"""
import argparse, json, math, sys
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("xyz"); ap.add_argument("out")
ap.add_argument("--step", type=float, default=20.0)
ap.add_argument("--source", default="")
a = ap.parse_args()

raw = open(a.xyz, "rb").read().replace(b"\r", b"").replace(b"\n", b",")
v = np.fromstring(raw, sep=",")   # noqa: the fast path for a plain comma/newline file
del raw
if v.size % 3:
    sys.exit(f"{a.xyz}: {v.size} numbers is not a multiple of three")
lon, lat, z = v[0::3], v[1::3], v[2::3]
print(f"{lon.size} points, lon {lon.min():.5f}..{lon.max():.5f}, lat {lat.min():.5f}..{lat.max():.5f}, z {z.min():.1f}..{z.max():.1f}")
mid = (lat.min() + lat.max()) / 2
dlat = a.step / 110540.0
dlon = a.step / (111320.0 * math.cos(math.radians(mid)))
lat0, lon0 = lat.min() + dlat / 2, lon.min() + dlon / 2
i = np.floor((lon - lon.min()) / dlon).astype(np.int64)
j = np.floor((lat - lat.min()) / dlat).astype(np.int64)
nx, ny = int(i.max()) + 1, int(j.max()) + 1
k = j * nx + i
s = np.bincount(k, weights=z, minlength=nx * ny)
n = np.bincount(k, minlength=nx * ny)
h = [None if c == 0 else int(round(t / c * 10)) for t, c in zip(s, n)]
out = {"lat0": round(lat0, 7), "lon0": round(lon0, 7), "dlat": round(dlat, 9), "dlon": round(dlon, 9), "nx": nx, "ny": ny,
       "step": a.step, "source": a.source, "h": h}
open(a.out, "w", encoding="utf-8", newline="\n").write(json.dumps(out, separators=(",", ":")))
filled = int((n > 0).sum())
print(f"{nx}x{ny} cells of {a.step:g} m, {filled} with soundings, {min(x for x in h if x is not None)/10:.1f}..{max(x for x in h if x is not None)/10:.1f} m -> {a.out}")
