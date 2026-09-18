#!/usr/bin/env python3
"""Shared machinery for generating a city data file the OSM engine can read.

A generated city (Vashrin, City 17) writes the same JSON shape that tools/build-osm-city.py produces for
a surveyed one, so src/chicago/stages/ renders it with no engine changes. This module holds the parts that
every generated city needs - projection-free metre coordinates, the terrain grid, water strips, the street
walker that bridges water, courtyard blocks and ring walls - so a new city is a layout, not a rewrite.

    from citylib import City, rect, smoothstep

    c = City(origin=(48.0, 20.0), half=2200.0, datum=96.0, seed=1748, attribution="...")
    c.terrain(step=20, height=my_height_fn)
    c.water_strip([(x0, z0), (x1, z1)], width=52, name="Route Kanal")
    c.street_grid(block=108, street=16, avenue=30, keep=my_keep_fn, names=[...])
    c.building(rect(cx, cz, w, d), h, kind="apartments", colour="#8a8880", roof="f")
    c.write("data/cities/mycity-osm.json")

Coordinates are metres east (x) and south (z) of the origin; the file stores decimetre integers.
Everything here is deterministic: the same inputs give the same city.
"""
import json
import math
import os


# ---------- small geometry helpers ----------
def q(v):
    """Metres to the decimetre integers the data file stores."""
    return int(round(v * 10))


def flat(pts):
    out = []
    for x, z in pts:
        out += [q(x), q(z)]
    return out


def rect(cx, cz, w, d, rot=0.0):
    """A rectangle ring centred on (cx, cz), optionally turned by rot radians."""
    c, s = math.cos(rot), math.sin(rot)
    return [(cx + x * c - z * s, cz + x * s + z * c) for x, z in
            ((-w / 2, -d / 2), (w / 2, -d / 2), (w / 2, d / 2), (-w / 2, d / 2))]


def circle(cx, cz, r, n=48):
    return [(cx + math.cos(i / n * math.tau) * r, cz + math.sin(i / n * math.tau) * r) for i in range(n)]


def smoothstep(a, b, v):
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


def simplify(pts, eps=1.0):
    """Douglas-Peucker: drop the points a dense walk added along a straight run.

    The engine walks streets in long steps (a light every 35 m, a parked car every 7 m), and those walkers
    stall on polylines whose segments are shorter than the step, so emitted roads must be minimal.
    """
    if len(pts) < 3:
        return pts
    ax, az = pts[0]
    bx, bz = pts[-1]
    dx, dz = bx - ax, bz - az
    L = math.hypot(dx, dz)
    worst, wi = 0.0, 0
    for i in range(1, len(pts) - 1):
        px, pz = pts[i]
        d = abs(dx * (az - pz) - dz * (ax - px)) / L if L else math.hypot(px - ax, pz - az)
        if d > worst:
            worst, wi = d, i
    if worst <= eps:
        return [pts[0], pts[-1]]
    return simplify(pts[:wi + 1], eps)[:-1] + simplify(pts[wi:], eps)


def dist_to_polyline(x, z, pts):
    best = 1e9
    for i in range(len(pts) - 1):
        ax, az = pts[i]
        bx, bz = pts[i + 1]
        dx, dz = bx - ax, bz - az
        L = dx * dx + dz * dz
        t = 0 if L == 0 else max(0, min(1, ((x - ax) * dx + (z - az) * dz) / L))
        best = min(best, math.hypot(x - ax - t * dx, z - az - t * dz))
    return best


def bbox_of(ring_flat):
    xs = [ring_flat[i] / 10 for i in range(0, len(ring_flat), 2)]
    zs = [ring_flat[i] / 10 for i in range(1, len(ring_flat), 2)]
    return min(xs), max(xs), min(zs), max(zs)


class City:
    """Accumulates a city and writes the data file.

    half   the map runs from -half to +half in both x and z, in metres
    datum  the elevation the water sits at, recorded for the attribution line only
    """

    def __init__(self, origin, half, datum=0.0, seed=0, attribution="", units=None):
        self.origin = list(origin)
        self.half = float(half)
        self.seed = seed
        self.out = {
            "attribution": attribution,
            "units": units or "decimetres east (x) and south (z) of origin",
            "origin": list(origin),
            "bounds": self.bounds(),
            "lake": [], "islands": [], "water": [], "marina": [], "beach": [], "pier": [],
            "areas": [], "roads": [], "rail": [], "stations": [], "waterways": [],
            "pois": [], "buildings": [], "trees": [],
        }
        self.datum = datum
        self.in_water = lambda x, z: False   # set by water_strip/set_water_test

    # ---- the box the engine reads as the map's extent ----
    def bounds(self):
        lat0, lon0 = self.origin
        m_lat, m_lon = 111132.0, 111320.0 * math.cos(math.radians(lat0))
        dlat, dlon = self.half / m_lat, self.half / m_lon
        return [round(lat0 - dlat, 6), round(lon0 - dlon, 6), round(lat0 + dlat, 6), round(lon0 + dlon, 6)]

    def latlon(self, x, z):
        """Where a metre position lands in the [lat, lon] the city config uses for landmarks and views."""
        lat0, lon0 = self.origin
        return [round(lat0 - z / 111132.0, 6), round(lon0 + x / (111320.0 * math.cos(math.radians(lat0))), 6)]

    # ---- ground ----
    def terrain(self, step, height, edge_fade=280.0):
        """Sample a height function onto the grid the engine turns into ground.

        height(x, z) returns metres above the water datum; water should come back at or below zero.
        The last edge_fade metres ease down to the datum so the map has no cliff at its rim.
        """
        half = self.half
        nx = int(2 * half) // step + 2
        hs = []
        for j in range(nx):
            for i in range(nx):
                x, z = -half + i * step, -half + j * step
                h = height(x, z)
                if edge_fade:
                    h *= smoothstep(half, half - edge_fade, max(abs(x), abs(z)))
                hs.append(h)
        self.out["terrain"] = {"step": step, "nx": nx, "nz": nx, "x0": q(-half), "z0": q(-half),
                               "datum": self.datum, "h": [int(round(h * 10)) for h in hs]}
        return self

    def set_water_test(self, fn):
        """Tell the builder how to ask 'is this point wet', used by the street walker and block placer."""
        self.in_water = fn
        return self

    # ---- water ----
    def water_strip(self, centre, width, name="", waterway=True):
        """A channel of constant width along a centreline: a river, a canal, a cut."""
        left, right = [], []
        for i in range(len(centre) - 1):
            ax, az = centre[i]
            bx, bz = centre[i + 1]
            dx, dz = bx - ax, bz - az
            L = math.hypot(dx, dz) or 1
            nx, nz = -dz / L * width / 2, dx / L * width / 2
            left += [(ax + nx, az + nz), (bx + nx, bz + nz)]
            right += [(ax - nx, az - nz), (bx - nx, bz - nz)]
        self.out["water"].append({"o": flat(left + right[::-1]), "i": [], "n": name})
        if waterway:
            self.out["waterways"].append({"n": name, "p": flat(centre)})
        return self

    def water_poly(self, ring, holes=(), name=""):
        self.out["water"].append({"o": flat(ring), "i": [flat(h) for h in holes], "n": name})
        return self

    # ---- streets ----
    def road(self, pts, cls, w, name="", bridge=0):
        pts = simplify(pts)
        if len(pts) < 2:
            return self
        r = {"c": cls, "w": round(w, 1), "p": flat(pts)}
        if name:
            r["n"] = name
        if bridge:
            r["b"] = bridge
        self.out["roads"].append(r)
        return self

    def walk_line(self, pts, cls, w, name="", keep=None, bridged=False, step=12, ramp=45):
        """Lay street over dry ground along a line, and a bridge deck over every water crossing.

        keep(x, z) says whether the city exists at that point at all; where it does not the street stops
        and starts again on the far side, which is how exclusion zones and map edges cut the grid.
        """
        dense = []
        for i in range(len(pts) - 1):
            ax, az = pts[i]
            bx, bz = pts[i + 1]
            L = math.hypot(bx - ax, bz - az)
            n = max(1, int(L // step))
            for k in range(n):
                u = k / n
                dense.append((ax + (bx - ax) * u, az + (bz - az) * u))
        dense.append(pts[-1])
        run, wet = [], []
        for x, z in dense:
            if keep and not keep(x, z):
                if len(run) > 1:
                    self.road(run, cls, w, name)
                run = []
                continue
            if self.in_water(x, z):
                wet.append((x, z))
                if len(run) > 1:
                    self.road(run, cls, w, name)
                run = []
            else:
                if wet:
                    if bridged and len(wet) > 1:
                        a, b = wet[0], wet[-1]
                        dx, dz = b[0] - a[0], b[1] - a[1]
                        L = math.hypot(dx, dz) or 1
                        self.road([(a[0] - dx / L * ramp, a[1] - dz / L * ramp),
                                   (b[0] + dx / L * ramp, b[1] + dz / L * ramp)], cls, w, name, bridge=1)
                    wet = []
                run.append((x, z))
        if len(run) > 1:
            self.road(run, cls, w, name)
        return self

    # ---- land, rail, the rest ----
    def area(self, kind, name, ring, holes=()):
        self.out["areas"].append({"k": kind, "n": name, "o": flat(ring), "i": [flat(h) for h in holes]})
        return self

    def rail(self, kind, pts, name="", elevated=0):
        self.out["rail"].append({"t": kind, "e": 1 if elevated else 0, "n": name, "p": flat(pts)})
        return self

    def station(self, name, x, z):
        self.out["stations"].append({"n": name, "x": q(x), "z": q(z)})
        return self

    def poi(self, name, x, z, kind="", ang=0.0):
        self.out["pois"].append({"n": name, "x": q(x), "z": q(z), "k": kind, "ang": round(ang, 3)})
        return self

    def tree(self, x, z):
        self.out["trees"] += [q(x), q(z)]
        return self

    def building(self, ring, h, kind=None, colour=None, name=None, roof=None, minh=None, levels=None):
        b = {"p": flat(ring), "h": round(h, 1)}
        if kind:
            b["t"] = kind
        if colour:
            b["c"] = colour
        if name:
            b["n"] = name
        if roof:
            b["r"] = roof
        if minh:
            b["m"] = round(minh, 1)
        if levels:
            b["lv"] = levels
        self.out["buildings"].append(b)
        return self

    # ---- the pieces every occupied-looking city wants ----
    def ring_wall(self, cx, cz, radius, height, thickness, segments=150, gaps=(), gap_half=0.055,
                  kind="wall", colour="#454a50", tower_every=0, tower_h=0, tower_w=0, tower_colour=None):
        """A wall on a circle, with gaps left at the given angles and a tower every so many segments."""
        seg = math.tau / segments
        for k in range(segments):
            a0 = k * seg
            if any(abs(((a0 - g + math.pi) % math.tau) - math.pi) < gap_half for g in gaps):
                continue
            a1 = a0 + seg * 0.97
            p0 = (cx + math.cos(a0) * radius, cz + math.sin(a0) * radius)
            p1 = (cx + math.cos(a1) * radius, cz + math.sin(a1) * radius)
            dx, dz = p1[0] - p0[0], p1[1] - p0[1]
            L = math.hypot(dx, dz) or 1
            nx, nz = -dz / L * thickness / 2, dx / L * thickness / 2
            self.building([(p0[0] + nx, p0[1] + nz), (p1[0] + nx, p1[1] + nz),
                           (p1[0] - nx, p1[1] - nz), (p0[0] - nx, p0[1] - nz)], height, kind, colour, roof="f")
            if tower_every and k % tower_every == 0:
                self.building(rect(cx + math.cos(a0) * radius, cz + math.sin(a0) * radius, tower_w, tower_w, a0),
                              tower_h, "tower", tower_colour or colour, roof="f")
        return self

    def plot_span(self, i, block, street, avenue, major_every=5, setback=2.0):
        """The ground one block gets between the two street lines either side of it: (centre, width).

        Street widths differ, so a block next to an avenue is shorter than one between side streets; using
        this keeps the carriageway off the building line and the streets at their real width.
        """
        def w(k):
            return avenue if k % major_every == 0 else street
        lo = i * block + w(i) / 2 + setback
        hi = (i + 1) * block - w(i + 1) / 2 - setback
        return (lo + hi) / 2, hi - lo

    def write(self, path, quiet=False):
        d = os.path.dirname(os.path.abspath(path))
        if d:
            os.makedirs(d, exist_ok=True)
        json.dump(self.out, open(path, "w"), separators=(",", ":"))
        if not quiet:
            t = self.out.get("terrain")
            print(f"wrote {path}: {os.path.getsize(path)/1e6:.1f} MB; buildings {len(self.out['buildings'])}; "
                  f"roads {len(self.out['roads'])}; areas {len(self.out['areas'])}; "
                  f"terrain {t['nx']}x{t['nz']} at {t['step']} m; trees {len(self.out['trees'])//2}"
                  if t else f"wrote {path}")
        return self
