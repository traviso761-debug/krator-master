#!/usr/bin/env python3
"""Filter a built city's height grid in place, for a city whose raw map data is not at hand.

    python3 tools/filter-terrain.py <city> [...]

The AWS terrain tiles under a city carry its surface: towers stand in them as spikes (Manhattan's reach 44 m),
tree canopy as plateaus, and pits of metres lie on flat ground; every street laid over them dips and climbs.
tools/build-osm-city.py filters the grid as it builds when the city file sets terrain.filter (metres: open,
close, blur); this applies the same filter to data/cities/<city>-osm.json without rebuilding it from raw data.
The grid is marked with the filter it had, so running this twice does nothing more. The city's views are moved
up or down with the ground under each of their two points, so a street-level view stays at street level.
"""
import json
import math
import os
import sys

import numpy as np
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def apply(A, step, flt):
    cells = lambda m: max(1, int(round(m / step)) | 1)
    A = ndimage.grey_opening(A, size=cells(flt.get("open", 150)))
    A = ndimage.grey_closing(A, size=cells(flt.get("close", 36)))
    return ndimage.uniform_filter(A, size=cells(flt.get("blur", 48)), mode="nearest")


def main(city):
    cp = os.path.join(ROOT, "data", "cities", f"{city}.json")
    op = os.path.join(ROOT, "data", "cities", f"{city}-osm.json")
    C = json.load(open(cp))
    flt = {k: v for k, v in ((C.get("terrain") or {}).get("filter") or {}).items() if k != "_"}
    if not flt:
        print(f"{city}: no terrain.filter in its city file")
        return
    D = json.load(open(op))
    T = D.get("terrain")
    if not T:
        print(f"{city}: no height grid")
        return
    if T.get("filtered") == flt:
        print(f"{city}: already filtered")
        return
    if T.get("filtered"):
        print(f"{city}: filtered with other settings ({T['filtered']}); rebuild it from raw data first")
        return
    A0 = np.array(T["h"], dtype=np.float32).reshape(T["nz"], T["nx"]) / 10
    A = apply(A0, T["step"], flt)
    T["h"] = [int(round(v * 10)) for v in A.ravel()]
    T["filtered"] = flt
    json.dump(D, open(op, "w"), ensure_ascii=False, separators=(",", ":"))

    # the views, with the ground under them
    LAT0, LON0 = C["origin"]
    ML, MO = 111132.0, 111320.0 * math.cos(math.radians(LAT0))
    def under(G, la, lo):
        x, z = (lo - LON0) * MO, -(la - LAT0) * ML
        fx, fz = (x - T["x0"] / 10) / T["step"], (z - T["z0"] / 10) / T["step"]
        if not (0 <= fx < T["nx"] - 1 and 0 <= fz < T["nz"] - 1):
            return 0.0
        i, j = int(fx), int(fz)
        u, v = fx - i, fz - j
        return float((G[j, i] * (1 - u) + G[j, i + 1] * u) * (1 - v) + (G[j + 1, i] * (1 - u) + G[j + 1, i + 1] * u) * v)
    moved = 0
    for v in (C.get("views") or {}).values():
        if not (isinstance(v, list) and len(v) == 2 and all(isinstance(p, list) and len(p) == 3 for p in v)):
            continue
        for p in v:
            d = under(A, p[0], p[1]) - under(A0, p[0], p[1])
            if abs(d) > 0.05:
                p[2] = round(p[2] + d, 1)
                moved += 1
    json.dump(C, open(cp, "w"), ensure_ascii=False, indent=1)
    d = A - A0
    print(f"{city}: filtered {T['nx']}x{T['nz']} at {T['step']} m; lowered >3 m on {np.mean(d < -3) * 100:.1f}%, "
          f"at most {d.min():.1f} m; {moved} view points moved")


if __name__ == "__main__":
    for c in sys.argv[1:]:
        main(c)
