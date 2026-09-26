#!/usr/bin/env python3
"""Build Yellowstone National Park: the city file and its map data, from the real ground and the real map.

    python3 tools/make-yellowstone.py            build from what is cached
    python3 tools/make-yellowstone.py --fetch    download anything not yet cached first (elevation and OSM)

A real place, so nothing here is invented that does not have to be. The ground is the AWS Terrain Tiles
(terrarium PNGs, from SRTM and NED) sampled on a 150 m grid over the whole park - about a hundred and six
kilometres by a hundred and nine - with the lowest point on the map, down the Yellowstone at Gardiner, as
y = 0. The lakes, rivers, roads, boardwalks, buildings, geysers and hot springs are OpenStreetMap's (ODbL),
cached under data/osm/raw/yellowstone/ and not committed.

What the map does not carry is written down here, from the published geography:

  the caldera       the rim of the 631,000-year-old Yellowstone Caldera (the Lava Creek eruption) as the USGS
                    draws it, simplified: seventy-odd kilometres by forty-five, north-east to south-west, with
                    the lake's West Thumb in its south-east corner. And its two resurgent domes, Sour Creek and
                    Mallard Lake, where the floor has been pushed back up since.
  the basins        where the ground is bare sinter rather than forest: the geyser basins, Mammoth's terraces,
                    Mud Volcano. Each is a centre and a radius, and the land cover and the steam use them.
  the land cover    a grid at the terrain's own step saying what is growing there (forest, meadow, sage,
                    wetland, rock above the trees, thermal ground, the 1988 burn), from the map's own
                    grassland and wetland where it has them and the elevation where it does not.

Writes data/cities/yellowstone-osm.json and data/cities/yellowstone.json.
"""
import glob
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "osm", "raw", "yellowstone")
OUT = os.path.join(ROOT, "data", "cities", "yellowstone-osm.json")
CFG = os.path.join(ROOT, "data", "cities", "yellowstone.json")
LANDF = os.path.join(ROOT, "data", "cities", "yellowstone-land.json")
UA = "WorldMenagerie-massing-model/1.0 (personal LAN project)"

S, W, N, E = 44.125, -111.160, 45.115, -109.820      # the park and a little round it
LAT0, LON0 = 44.62, -110.49                         # the middle of the map
M_LAT, M_LON = 111132.0, 111320.0 * math.cos(math.radians(LAT0))
STEP = 150                                          # the height grid, in metres
TZ = 12                                             # terrain tile zoom: about 28 m a pixel at this latitude


def xz(lat, lon):
    return ((lon - LON0) * M_LON, -(lat - LAT0) * M_LAT)


def q(v):   # metres -> integer decimetres
    return int(round(v * 10))


BX0, BZ0 = xz(N, W)
BX1, BZ1 = xz(S, E)


# ---------- fetching ----------
QUERIES = {
    "water": 'nwr["natural"="water"]({b});nwr["waterway"="riverbank"]({b});',
    "waterways": 'way["waterway"~"^(river|stream)$"]["name"]({b});',
    "roads": 'way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|service)$"]({b});'
             'way["highway"~"^(footway|path|track)$"]["name"]({b});way["highway"="footway"]["surface"="wood"]({b});',
    "buildings": 'way["building"]({b});relation["building"]({b});',
    "thermal": 'nwr["natural"~"^(hot_spring|geyser|fumarole|volcano|peak|waterfall|cliff)$"]({b});'
               'nwr["waterway"="waterfall"]({b});nwr["tourism"~"^(attraction|viewpoint)$"]({b});nwr["geological"]({b});',
    "land": 'nwr["natural"~"^(wood|grassland|heath|scrub|wetland|bare_rock|scree|sand)$"]({b});nwr["landuse"~"^(meadow|forest)$"]({b});',
    "boundary": 'relation["boundary"~"^(national_park|protected_area)$"]["name"="Yellowstone National Park"];',
}


def fetch():
    os.makedirs(RAW, exist_ok=True)
    b = f"{S - 0.025},{W - 0.02},{N + 0.015},{E + 0.02}"
    for name, body in QUERIES.items():
        f = os.path.join(RAW, name + "-0.json")
        if os.path.exists(f):
            continue
        data = urllib.parse.urlencode({"data": "[out:json][timeout:600];(" + body.format(b=b) + ");out geom;"}).encode()
        for attempt in range(6):
            try:
                req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=data, headers={"User-Agent": UA})
                raw = urllib.request.urlopen(req, timeout=660).read()
                json.loads(raw)
                open(f, "wb").write(raw)
                print(f"  {name}: {len(raw) // 1000} kB", flush=True)
                break
            except Exception as err:   # 429 and 504 from a busy server: back off and try again
                print(f"  {name}: retry ({err})", flush=True)
                time.sleep(30 * (attempt + 1))
    tdir = os.path.join(RAW, "terrain")
    os.makedirs(tdir, exist_ok=True)
    boxes = [(N + 0.015, W - 0.02, S - 0.025, E + 0.02, TZ)] + [(n, w, s, e, z) for _, s, w, n, e, _, z in PATCHES]
    for n, w, s, e, z in boxes:
        (x0, y0), (x1, y1) = tile_xy(n, w, z), tile_xy(s, e, z)
        for x in range(x0, x1 + 1):
            for y in range(y0, y1 + 1):
                f = os.path.join(tdir, f"{z}_{x}_{y}.png")
                if not os.path.exists(f):
                    url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
                    open(f, "wb").write(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read())


def tile_xy(lat, lon, z):
    n = 2 ** z
    la = math.radians(lat)
    return int((lon + 180) / 360 * n), int((1 - math.log(math.tan(la) + 1 / math.cos(la)) / math.pi) / 2 * n)


def load(name):
    f = os.path.join(RAW, name + "-0.json")
    return json.load(open(f))["elements"] if os.path.exists(f) else []


# ---------- geometry ----------
def way_pts(e):
    return [xz(p["lat"], p["lon"]) for p in e.get("geometry", []) if p]


def area(r):
    return 0.5 * sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))


def centroid(r):
    return (sum(p[0] for p in r) / len(r), sum(p[1] for p in r) / len(r))


def simplify(pts, eps):
    """Douglas-Peucker, iteratively: a lake shore can be ten thousand points and recursion runs out first."""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i0, i1 = stack.pop()
        a, b = pts[i0], pts[i1]
        dx, dz = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dz) or 1e-9
        dmax, idx = 0.0, 0
        for i in range(i0 + 1, i1):
            d = abs((pts[i][0] - a[0]) * dz - (pts[i][1] - a[1]) * dx) / L
            if d > dmax:
                dmax, idx = d, i
        if dmax > eps:
            keep[idx] = True
            stack += [(i0, idx), (idx, i1)]
    return [p for p, k in zip(pts, keep) if k]


def ring_simplify(r, eps):
    if len(r) > 3 and r[0] == r[-1]:
        r = r[:-1]
    if len(r) < 3:
        return r
    s = simplify(r + [r[0]], eps)[:-1]
    return s if len(s) >= 3 else r


def join_rings(ways):
    chains = [list(w) for w in ways if len(w) >= 2]
    rings = []
    while chains:
        c = chains.pop()
        changed = True
        while changed and c[0] != c[-1]:
            changed = False
            for i, d in enumerate(chains):
                if d[0] == c[-1]:
                    c += d[1:]
                elif d[-1] == c[-1]:
                    c += d[::-1][1:]
                elif d[-1] == c[0]:
                    c = d[:-1] + c
                elif d[0] == c[0]:
                    c = d[::-1][:-1] + c
                else:
                    continue
                chains.pop(i)
                changed = True
                break
        rings.append(c)
    return rings


def inside(p, r):
    x, z = p
    c = False
    j = len(r) - 1
    for i in range(len(r)):
        xi, zi = r[i]
        xj, zj = r[j]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / ((zj - zi) or 1e-12) + xi:
            c = not c
        j = i
    return c


def polys_of(e):
    if e["type"] == "way":
        pts = way_pts(e)
        return [(pts, [])] if len(pts) >= 4 and pts[0] == pts[-1] else []
    if e["type"] == "relation":
        outers = [way_pts(m) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") in ("outer", "")]
        inners = [way_pts(m) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") == "inner"]
        o = [r for r in join_rings(outers) if len(r) >= 4 and r[0] == r[-1]]
        i = [r for r in join_rings(inners) if len(r) >= 4 and r[0] == r[-1]]
        return [(r, [h for h in i if inside(centroid(h), r)]) for r in o]
    return []


def flat(pts):
    out = []
    for x, z in pts:
        out += [q(x), q(z)]
    return out


def in_bounds(p, pad=0):
    return BX0 - pad <= p[0] <= BX1 + pad and BZ0 - pad <= p[1] <= BZ1 + pad


# ---------- the ground ----------
def elevation(TZ=TZ):
    from PIL import Image
    tiles = {}
    for f in glob.glob(os.path.join(RAW, "terrain", f"{TZ}_*.png")):
        _, x, y = os.path.basename(f)[:-4].split("_")
        tiles[(int(x), int(y))] = Image.open(f).convert("RGB").load()
    n = 2 ** TZ * 256

    def elev(lat, lon):   # bilinear over the terrarium pixels: height = R*256 + G + B/256 - 32768
        la = math.radians(lat)
        px = (lon + 180) / 360 * n - 0.5
        py = (1 - math.log(math.tan(la) + 1 / math.cos(la)) / math.pi) / 2 * n - 0.5
        x0, y0 = int(math.floor(px)), int(math.floor(py))
        fx, fy = px - x0, py - y0
        tot = wsum = 0.0
        for dx, dy, wgt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
            X, Y = x0 + dx, y0 + dy
            t = tiles.get((X // 256, Y // 256))
            if t is None:
                continue
            r, g, b = t[X % 256, Y % 256]
            tot += wgt * (r * 256 + g + b / 256 - 32768)
            wsum += wgt
        return tot / wsum if wsum else 2000.0
    return elev


# ---------- what the map does not carry ----------
# The rim of the Yellowstone Caldera, [lat, lon], after the USGS outline, simplified. It is not a wall: most of
# it is buried under the lava flows that filled it afterwards, and on the ground you see it as the edge of the
# plateaus and the scarps at Gibbon Falls, Lewis Falls and Lake Butte.
CALDERA = [(44.795, -110.555), (44.790, -110.470), (44.765, -110.390), (44.735, -110.305), (44.690, -110.245),
           (44.625, -110.225), (44.560, -110.260), (44.505, -110.300), (44.455, -110.355), (44.400, -110.420),
           (44.345, -110.500), (44.305, -110.575), (44.285, -110.660), (44.300, -110.745), (44.345, -110.830),
           (44.400, -110.905), (44.460, -110.960), (44.525, -110.985), (44.590, -110.975), (44.640, -110.925),
           (44.680, -110.855), (44.720, -110.775), (44.755, -110.690), (44.782, -110.620)]
DOMES = [{"n": "Sour Creek Dome", "at": (44.655, -110.345), "r": 9000},
         {"n": "Mallard Lake Dome", "at": (44.445, -110.745), "r": 7000}]
# Where the 150 m grid is not enough: [name, south, west, north, east, step, tile zoom]. The Grand Canyon of the
# Yellowstone is three hundred metres deep and in places not much wider at the top, and at 150 m it comes out as a
# shallow V. Here the ground is sampled again at 25 m from finer tiles; the page cuts the coarse grid out under the
# patch and lays this in, matched to it along the edge (src/yellowstone/landmarks.js, nature.js).
PATCHES = [("Grand Canyon of the Yellowstone", 44.700, -110.515, 44.765, -110.395, 25, 14)]
# The thermal ground: [name, lat, lon, radius in metres, steam 0-1]. The radius is the bare sinter and the
# steam is how much of it is venting; the named springs and geysers inside each come from the map.
BASINS = [
    ("Upper Geyser Basin", 44.466, -110.836, 1500, 1.0), ("Black Sand Basin", 44.4625, -110.853, 350, 0.6),
    ("Biscuit Basin", 44.485, -110.852, 400, 0.6), ("Midway Geyser Basin", 44.525, -110.836, 650, 1.0),
    ("Lower Geyser Basin", 44.545, -110.800, 2600, 0.9), ("Norris Geyser Basin", 44.727, -110.705, 900, 1.0),
    ("Mammoth Hot Springs", 44.969, -110.707, 700, 0.5), ("West Thumb Geyser Basin", 44.418, -110.572, 450, 0.8),
    ("Mud Volcano", 44.624, -110.433, 400, 0.7), ("Artists' Paintpots", 44.695, -110.742, 300, 0.6),
    ("Monument Geyser Basin", 44.688, -110.725, 250, 0.4), ("Gibbon Geyser Basin", 44.700, -110.760, 450, 0.5),
    ("Shoshone Geyser Basin", 44.357, -110.797, 500, 0.6), ("Heart Lake Geyser Basin", 44.298, -110.520, 450, 0.5),
    ("Lone Star Geyser Basin", 44.418, -110.807, 200, 0.4), ("Sylvan Springs", 44.690, -110.779, 250, 0.4),
    ("Hot Springs Basin", 44.680, -110.170, 900, 0.6), ("Crater Hills", 44.653, -110.483, 350, 0.5),
    ("Washburn Hot Springs", 44.766, -110.430, 300, 0.4), ("Sulphur Caldron", 44.622, -110.428, 200, 0.6),
    ("Brimstone Basin", 44.465, -110.190, 900, 0.3), ("Imperial Geyser", 44.529, -110.883, 200, 0.4),
]
# The valleys that are open ground rather than lodgepole, [name, lat, lon, rx, rz, turn]: the map's grassland
# does not cover them all, and they are what the park is for if you are a bison.
MEADOWS = [("Hayden Valley", 44.655, -110.455, 7000, 4200, 0.3), ("Lamar Valley", 44.885, -110.195, 9500, 2200, -0.5),
           ("Pelican Valley", 44.625, -110.270, 5000, 2600, 0.2), ("Swan Lake Flat", 44.915, -110.725, 2400, 1600, 0),
           ("Blacktail Deer Plateau", 44.955, -110.590, 4800, 2400, 0.2), ("Gibbon Meadows", 44.702, -110.763, 1100, 700, 0),
           ("Elk Park", 44.715, -110.740, 800, 600, 0), ("Madison Valley", 44.645, -110.940, 4200, 900, 0.1),
           ("Firehole meadows", 44.540, -110.815, 3200, 1600, -1.2), ("Bechler Meadows", 44.200, -111.020, 4200, 2600, 0.4),
           ("Little America Flats", 44.915, -110.370, 3500, 1800, 0.2), ("Slough Creek", 44.950, -110.300, 2600, 900, -0.8),
           ("Upper Lamar", 44.845, -110.120, 3200, 900, -0.8), ("Fountain Flat", 44.572, -110.830, 1500, 900, 0)]


def main():
    if "--fetch" in sys.argv:
        fetch()
    elev = elevation()

    # ---- the height grid
    nx, nz = int((BX1 - BX0) // STEP) + 2, int((BZ1 - BZ0) // STEP) + 2
    abs_h = []
    for j in range(nz):
        z = BZ0 + j * STEP
        for i in range(nx):
            x = BX0 + i * STEP
            abs_h.append(elev(LAT0 - z / M_LAT, LON0 + x / M_LON))
    datum = math.floor(min(abs_h))
    H = [h - datum for h in abs_h]

    def gh(x, z):
        fx, fz = (x - BX0) / STEP, (z - BZ0) / STEP
        i, j = max(0, min(nx - 2, int(fx))), max(0, min(nz - 2, int(fz)))
        tx, tz = max(0.0, min(1.0, fx - i)), max(0.0, min(1.0, fz - j))
        a, b, c, d = H[j * nx + i], H[j * nx + i + 1], H[(j + 1) * nx + i], H[(j + 1) * nx + i + 1]
        return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz

    out = {"attribution": "Map data © OpenStreetMap contributors (ODbL) · elevation: AWS Terrain Tiles (SRTM/NED)",
           "units": "decimetres east (x) and south (z) of origin", "origin": [LAT0, LON0], "bounds": [S, W, N, E],
           "terrain": {"step": STEP, "nx": nx, "nz": nz, "x0": q(BX0), "z0": q(BZ0), "datum": datum,
                       "h": [int(round(h * 10)) for h in H],
                       "_": "heights in decimetres above the lowest point on the map (datum, metres above sea level)"},
           "lake": [], "islands": [], "marina": [], "beach": [], "pier": [], "rail": [], "stations": [], "trees": []}

    # ---- lakes: each at its own level. Yellowstone Lake is 2,357 m up and the Yellowstone at Gardiner is 1,600;
    # the engine's single water sheet cannot hold both, so every lake carries its y, which is its shore's height
    # off the ground grid (the tiles' surface over a lake is the lake).
    water = []
    for e in load("water"):
        t = e.get("tags", {})
        if t.get("water") in ("river", "stream", "canal") or t.get("waterway") == "riverbank" or "hot_spring" in (t.get("natural"), t.get("water")):
            continue
        for o, holes in polys_of(e):
            a = abs(area(o))
            if a < (1500 if t.get("name") else 12000) or not in_bounds(centroid(o), -500):
                continue
            r = ring_simplify(o, 4 if a < 1e6 else 12)
            ys = sorted(gh(x, z) for x, z in r[::max(1, len(r) // 60)])
            level = ys[len(ys) // 4]   # the lower quartile of the shore: the grid is coarse and the shore rises
            water.append({"o": flat(r), "i": [flat(ring_simplify(h, 6)) for h in holes if abs(area(h)) > 800],
                          "n": t.get("name", ""), "y": round(level + 0.4, 1), "a": a})
    water.sort(key=lambda w: -w["a"])
    for w in water:
        del w["a"]
    out["water"] = water

    # ---- rivers, as centre lines: the engine draws them as ribbons on the ground (src/yellowstone/rivers.js)
    rivers = []
    for e in load("waterways"):
        t = e.get("tags", {})
        pts = [p for p in way_pts(e)]
        if len(pts) < 2 or not any(in_bounds(p) for p in pts):
            continue
        big = t.get("waterway") == "river"
        rivers.append({"n": t.get("name", ""), "w": 18 if big else 5, "p": flat(simplify(pts, 6 if big else 12))})
    out["waterways"] = rivers

    # ---- the fine patches' rectangles, snapped to the coarse grid; their heights are sampled further down
    prects = []
    for name, ps, pw, pn, pe, pstep, pz in PATCHES:
        ax, az = xz(pn, pw)
        bx, bz = xz(ps, pe)
        i0, i1 = int((ax - BX0) // STEP), int(math.ceil((bx - BX0) / STEP))
        j0, j1 = int((az - BZ0) // STEP), int(math.ceil((bz - BZ0) / STEP))
        prects.append((BX0 + i0 * STEP, BZ0 + j0 * STEP, BX0 + i1 * STEP, BZ0 + j1 * STEP))
    in_patch = lambda x, z: any(x0 <= x <= x1 and z0 <= z <= z1 for x0, z0, x1, z1 in prects)

    # ---- roads, the boardwalks through the basins, and the named trails
    WIDTH = {"motorway": 20, "trunk": 14, "primary": 11, "secondary": 10, "tertiary": 9, "unclassified": 7, "residential": 7, "service": 5}
    roads, patch_roads = [], []
    for e in load("roads"):
        t = e.get("tags", {})
        hw = t.get("highway")
        pts = way_pts(e)
        if e["type"] != "way" or len(pts) < 2 or not any(in_bounds(p, 50) for p in pts) or t.get("tunnel") == "yes":
            continue
        if hw in WIDTH:
            if hw == "service" and t.get("service") in ("driveway", "parking_aisle", "drive-through"):
                continue
            r = {"c": "alley" if hw == "service" else hw, "w": WIDTH[hw], "p": flat(simplify(pts, 1.5))}
        else:
            wood = t.get("surface") == "wood"
            if not wood and hw == "track":
                continue
            r = {"c": "trail", "w": 2.4 if wood else 1.6, "p": flat(simplify(pts, 1.0 if wood else 4.0))}
            if wood:
                r["bw"] = 1
        if t.get("name"):
            r["n"] = t["name"]
        if t.get("bridge") not in (None, "no"):
            r["b"] = 1
        # A road through a fine patch would be laid on the coarse ground by the engine, and float over the canyon
        # or sink into its rim. The parts inside a patch are handed to the page instead, which lays them on the
        # patch (src/yellowstone/nature.js).
        rp = [(r["p"][k] / 10, r["p"][k + 1] / 10) for k in range(0, len(r["p"]), 2)]
        if prects and any(in_patch(x, z) for x, z in rp):
            dense = []
            for k in range(len(rp) - 1):
                (ax_, az_), (bx_, bz_) = rp[k], rp[k + 1]
                n = max(1, int(math.hypot(bx_ - ax_, bz_ - az_) // 20))
                dense += [(ax_ + (bx_ - ax_) * u / n, az_ + (bz_ - az_) * u / n) for u in range(n)]
            dense.append(rp[-1])
            runs, cur, inside_ = [], [dense[0]], in_patch(*dense[0])
            for pt in dense[1:]:
                ins = in_patch(*pt)
                cur.append(pt)
                if ins != inside_:
                    runs.append((inside_, cur))
                    cur, inside_ = [pt], ins
            runs.append((inside_, cur))
            for ins, run in runs:
                if len(run) < 2:
                    continue
                rr = dict(r, p=flat(simplify(run, 1.0)))
                (patch_roads if ins else roads).append(rr)
            continue
        roads.append(r)
    out["roads"] = roads

    # ---- buildings: the lodges, the stores, the ranger stations, the cabins. The ones built as models
    # (src/yellowstone/landmarks.js) are left out so they are not drawn twice.
    MODELLED = ("old faithful inn", "lake yellowstone hotel", "roosevelt arch")
    DEF_H = {"house": 6, "cabin": 4.5, "hotel": 14, "commercial": 7, "retail": 6, "garage": 4, "shed": 3, "hut": 3.5,
             "toilets": 3.5, "church": 10, "barn": 7, "public": 7, "yes": 5.5}
    buildings = []
    for e in load("buildings"):
        t = e.get("tags", {})
        if (t.get("name") or "").lower() in MODELLED:
            continue
        for o, holes in polys_of(e):
            if not any(in_bounds(p) for p in o) or abs(area(o)) < 10:
                continue
            r = ring_simplify(o, 0.4)
            if area(r) < 0:
                r = r[::-1]
            typ = t.get("building", "yes")
            h = None
            try:
                h = float(str(t.get("height", "")).split()[0])
            except (ValueError, IndexError):
                pass
            if h is None and t.get("building:levels"):
                try:
                    h = float(t["building:levels"]) * 3.2 + 1.5
                except ValueError:
                    pass
            rec = {"p": flat(r), "h": round(h or DEF_H.get(typ, 5.5), 1), "r": "g" if abs(area(r)) < 900 else "h"}
            if typ != "yes":
                rec["t"] = typ
            if t.get("name"):
                rec["n"] = t["name"]
            buildings.append(rec)
    out["buildings"] = buildings

    # ---- the thermal features, the falls, the peaks and the viewpoints, as points
    pois = []
    for e in load("thermal"):
        t = e.get("tags", {})
        nat = t.get("natural") or ("waterfall" if t.get("waterway") == "waterfall" else None) or t.get("tourism") or ("geological" if t.get("geological") else None)
        if e["type"] == "node":
            p = xz(e["lat"], e["lon"])
            ring = None
        else:
            g = [pt for m in ([e] if e["type"] == "way" else e.get("members", [])) for pt in way_pts(m)]
            if not g:
                continue
            p = centroid(g)
            ring = g if e["type"] == "way" and len(g) > 3 and g[0] == g[-1] else None
        if not in_bounds(p) or nat not in ("hot_spring", "geyser", "fumarole", "volcano", "peak", "waterfall", "viewpoint", "attraction", "cliff"):
            continue
        if nat in ("peak", "viewpoint", "attraction", "cliff") and not t.get("name"):
            continue
        rec = {"n": t.get("name", ""), "x": q(p[0]), "z": q(p[1]), "k": nat}
        if ring:   # a mapped pool: its size, so Grand Prismatic is the size it is
            rec["w"] = round(math.sqrt(abs(area(ring))), 1)
        if nat == "peak" and t.get("ele"):
            try:
                rec["h"] = round(float(t["ele"]))
            except ValueError:
                pass
        pois.append(rec)
    out["pois"] = pois

    # ---- land cover, on the terrain grid: what the forest stage and the ground colours read
    #   0 lodgepole forest  1 meadow and grassland  2 sagebrush steppe  3 wetland  4 rock and alpine
    #   5 thermal ground    6 the 1988 burn          7 water
    from PIL import Image, ImageDraw
    img = Image.new("L", (nx, nz), 0)
    dr = ImageDraw.Draw(img)
    gx = lambda x: (x - BX0) / STEP
    gz = lambda z: (z - BZ0) / STEP

    def paint(ring, v):
        if len(ring) >= 3:
            dr.polygon([(gx(x), gz(z)) for x, z in ring], fill=v)

    # the elevation first: sage in the dry low country round Gardiner and the Lamar, forest up the middle,
    # rock and alpine meadow on the Absarokas and the Gallatins above the trees
    for j in range(nz):
        for i in range(nx):
            a = abs_h[j * nx + i]
            # the slope, from the neighbours: a cliff has nothing growing on it
            hx = abs_h[j * nx + min(nx - 1, i + 1)] - abs_h[j * nx + max(0, i - 1)]
            hz = abs_h[min(nz - 1, j + 1) * nx + i] - abs_h[max(0, j - 1) * nx + i]
            slope = math.hypot(hx, hz) / (2 * STEP)
            n = math.sin(i * 0.37 + j * 0.11) * 0.5 + math.sin(i * 0.071 - j * 0.23) * 0.5
            v = 0
            if a > 2950 + 60 * n or slope > 0.85:
                v = 4
            elif a < 1950 + 90 * n:
                v = 2
            if v:
                img.putpixel((i, j), v)
    # the map's own grassland, meadows and wetland
    LAND = {"grassland": 1, "heath": 2, "scrub": 2, "meadow": 1, "wetland": 3, "bare_rock": 4, "scree": 4, "sand": 4}
    nland = 0
    for e in load("land"):
        t = e.get("tags", {})
        v = LAND.get(t.get("natural")) or LAND.get(t.get("landuse"))
        if not v:
            continue
        for o, holes in polys_of(e):
            paint(o, v)
            for h in holes:
                paint(h, 0)
            nland += 1
    # The slope of every cell, for the meadows: a valley's open ground is its flat floor, not the slopes round it.
    slope_at = [0.0] * (nx * nz)
    for j in range(nz):
        for i in range(nx):
            hx = abs_h[j * nx + min(nx - 1, i + 1)] - abs_h[j * nx + max(0, i - 1)]
            hz = abs_h[min(nz - 1, j + 1) * nx + i] - abs_h[max(0, j - 1) * nx + i]
            slope_at[j * nx + i] = math.hypot(hx, hz) / (2 * STEP)

    def hashn(i, j, k):
        v = math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453
        return v - math.floor(v)

    def vnoise(x, y, k):   # value noise over the grid, for ragged edges
        i, j = int(math.floor(x)), int(math.floor(y))
        fx, fy = x - i, y - j
        fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
        a, b, c, d = hashn(i, j, k), hashn(i + 1, j, k), hashn(i, j + 1, k), hashn(i + 1, j + 1, k)
        return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy

    def fill_where(ring, test):
        tmp = Image.new("L", (nx, nz), 0)
        ImageDraw.Draw(tmp).polygon([(gx(x), gz(z)) for x, z in ring], fill=1)
        bb = tmp.getbbox()
        if not bb:
            return
        px = tmp.load()
        for j in range(bb[1], bb[3]):
            for i in range(bb[0], bb[2]):
                if px[i, j]:
                    v = test(i, j)
                    if v is not None:
                        img.putpixel((i, j), v)

    for name, la, lo, rx, rz, turn in MEADOWS:
        cx, cz = xz(la, lo)
        c, s = math.cos(turn), math.sin(turn)
        ring = []
        for k in range(28):
            u = k / 28 * math.tau
            ex, ez = math.cos(u) * rx * 1.25, math.sin(u) * rz * 1.25
            ring.append((cx + ex * c - ez * s, cz + ex * s + ez * c))
        # open where the floor is flat, with the forest coming down into it in tongues
        fill_where(ring, lambda i, j: 1 if slope_at[j * nx + i] < 0.07 + 0.08 * vnoise(i / 6, j / 6, 3) and img.getpixel((i, j)) in (0, 6) else None)
    # the 1988 fires took a third of the park. What grew back is a lot of young lodgepole among grey snags, and
    # from the air it still reads as a patchwork: burned where the fire crowned, green where it ran along the
    # ground or skipped. So each fire is an area, and inside it the burn is noise.
    import random
    R = random.Random(1988)
    for _ in range(70):
        la, lo = R.uniform(44.30, 44.95), R.uniform(-111.05, -110.10)
        cx, cz = xz(la, lo)
        rad = R.uniform(2500, 7000)
        ring = [(cx + math.cos(k / 16 * math.tau) * rad * R.uniform(0.6, 1.3), cz + math.sin(k / 16 * math.tau) * rad * R.uniform(0.6, 1.3)) for k in range(16)]
        k0 = R.random() * 100
        fill_where(ring, lambda i, j: 6 if img.getpixel((i, j)) == 0 and vnoise(i / 4.0, j / 4.0, k0) * 0.65 + vnoise(i / 1.5, j / 1.5, k0 + 9) * 0.35 > 0.55 else None)
    # The basins are bare only on the flat: the sinter lies where the water runs off, and the hills round a basin
    # are forest like anywhere else. The edge is broken up, because a basin fades into meadow and lodgepole.
    for name, la, lo, rad, steam in BASINS:
        cx, cz = xz(la, lo)
        ring = [(cx + math.cos(k / 20 * math.tau) * rad * (1 + 0.15 * math.sin(k * 2.7)), cz + math.sin(k / 20 * math.tau) * rad * (1 + 0.15 * math.cos(k * 1.9))) for k in range(20)]
        fill_where(ring, lambda i, j: 5 if slope_at[j * nx + i] < 0.09 and vnoise(i / 2.0, j / 2.0, 17) > 0.3 * min(1.0, math.hypot(BX0 + i * STEP - cx, BZ0 + j * STEP - cz) / rad) + 0.12 else None)
    for w in water:
        o = [(w["o"][k] / 10, w["o"][k + 1] / 10) for k in range(0, len(w["o"]), 2)]
        paint(o, 7)
    cover = list(img.getdata())
    # run-length encoded, because most of it is forest in long runs
    rle, k = [], 0
    while k < len(cover):
        v, n = cover[k], 1
        while k + n < len(cover) and cover[k + n] == v and n < 60000:
            n += 1
        rle += [v, n]
        k += n
    land = {}
    land["cover"] = {"step": STEP, "nx": nx, "nz": nz, "rle": rle,
                    "_": "0 forest, 1 meadow, 2 sage, 3 wetland, 4 rock/alpine, 5 thermal, 6 1988 burn, 7 water"}

    # ---- the park boundary, as a line
    bnd = []
    for e in load("boundary"):
        outers = [way_pts(m) for m in e.get("members", []) if m.get("type") == "way" and m.get("role") in ("outer", "")]
        for r in join_rings(outers):
            bnd.append(flat(simplify(r, 40)))
    land["boundary"] = bnd

    # ---- the caldera and the basins
    land["caldera"] = {"rim": flat([xz(*p) for p in CALDERA]),
                       "domes": [{"n": d["n"], "x": q(xz(*d["at"])[0]), "z": q(xz(*d["at"])[1]), "r": d["r"]} for d in DOMES]}
    land["basins"] = [{"n": n, "x": q(xz(la, lo)[0]), "z": q(xz(la, lo)[1]), "r": r, "s": s} for n, la, lo, r, s in BASINS]
    land["rivers"] = rivers
    # ---- the fine patches, snapped to the coarse grid so their edges lie on its lines
    patches = []
    for name, ps, pw, pn, pe, pstep, pz in PATCHES:
        fine = elevation(pz)
        ax, az = xz(pn, pw)
        bx, bz = xz(ps, pe)
        i0, i1 = int((ax - BX0) // STEP), int(math.ceil((bx - BX0) / STEP))
        j0, j1 = int((az - BZ0) // STEP), int(math.ceil((bz - BZ0) / STEP))
        k = STEP // pstep
        pnx, pnz = (i1 - i0) * k + 1, (j1 - j0) * k + 1
        hs = []
        for j in range(pnz):
            for i in range(pnx):
                x, z = BX0 + i0 * STEP + i * pstep, BZ0 + j0 * STEP + j * pstep
                # blended into the coarse ground over the outer two coarse cells, so the edge matches it exactly
                edge = min(i, j, pnx - 1 - i, pnz - 1 - j) / (2 * k)
                w = max(0.0, min(1.0, edge))
                w = w * w * (3 - 2 * w)
                h = fine(LAT0 - z / M_LAT, LON0 + x / M_LON) - datum
                hs.append(int(round((gh(x, z) * (1 - w) + h * w) * 10)))
        patches.append({"n": name, "x0": q(BX0 + i0 * STEP), "z0": q(BZ0 + j0 * STEP), "step": pstep, "nx": pnx, "nz": pnz, "h": hs})
    land["patches"] = patches
    land["patchRoads"] = patch_roads
    land["_"] = "What the engine does not read and src/yellowstone/ does: the land cover grid, the park boundary, the caldera, the thermal basins, and the rivers with their widths. Decimetres, like the map file. Written by tools/make-yellowstone.py."
    out["areas"] = []

    json.dump(out, open(OUT, "w"), separators=(",", ":"), ensure_ascii=False)
    json.dump(land, open(LANDF, "w"), separators=(",", ":"), ensure_ascii=False)
    print(f"wrote {LANDF}: {os.path.getsize(LANDF) / 1e6:.1f} MB")
    print(f"wrote {OUT}: {os.path.getsize(OUT) / 1e6:.1f} MB; terrain {nx}x{nz} at {STEP} m, datum {datum} m, "
          f"relief {max(H):.0f} m; lakes {len(water)}; rivers {len(rivers)}; roads {len(roads)}; buildings {len(buildings)}; "
          f"pois {len(pois)} ({sum(1 for p in pois if p['k'] == 'geyser')} geysers, {sum(1 for p in pois if p['k'] == 'hot_spring')} springs); "
          f"land polygons {nland}")
    def gh_fine(x, z):
        for P in patches:
            x0, z0 = P["x0"] / 10, P["z0"] / 10
            fx, fz = (x - x0) / P["step"], (z - z0) / P["step"]
            if 0 <= fx <= P["nx"] - 1 and 0 <= fz <= P["nz"] - 1:
                i, j = min(P["nx"] - 2, int(fx)), min(P["nz"] - 2, int(fz))
                tx, tz = fx - i, fz - j
                h, n = P["h"], P["nx"]
                return ((h[j * n + i] * (1 - tx) + h[j * n + i + 1] * tx) * (1 - tz) + (h[(j + 1) * n + i] * (1 - tx) + h[(j + 1) * n + i + 1] * tx) * tz) / 10
        return gh(x, z)
    write_config(gh_fine, datum)


# ---------- the city file ----------
def write_config(gh, datum):
    def at(la, lo):
        return [round(la, 5), round(lo, 5)]

    def view(f, t, fh, th):
        """A viewpoint, heights given above the ground under each end rather than above the datum."""
        fx, fz = xz(*f)
        tx, tz = xz(*t)
        return [[f[0], f[1], round(gh(fx, fz) + fh)], [t[0], t[1], round(gh(tx, tz) + th)]]

    def canyon_view():
        """Down the canyon from the east, over the river, at the height of the rim: the falls at the end of it.
        Artist Point's own spot is a few metres from the edge, and on a 25 m grid the edge is not where it is."""
        fx, fz = xz(44.71800, -110.49610)
        cx, cz = xz(44.7213, -110.4745)
        rim = max(gh(cx + dx, cz + dz) for dx in range(-400, 401, 50) for dz in range(-400, 401, 50))
        la, lo = LAT0 - cz / M_LAT, LON0 + cx / M_LON
        return [[round(la, 5), round(lo, 5), round(rim + 25)], [44.71800, -110.49610, round(gh(fx, fz) - 30)]]

    L = []

    def lm(name, la, lo, info, model=None, **kw):
        d = {"name": name, "at": at(la, lo), "info": info}
        if model:
            d["model"] = model
        d.update(kw)
        L.append(d)

    # geysers: height in metres, interval and duration in seconds of the page's clock. Real intervals are
    # compressed - Old Faithful's ninety minutes would mean nobody ever saw it go - but they are kept in
    # proportion to one another, so Old Faithful still goes more often than Grand, and Steamboat hardly ever.
    lm("Old Faithful", 44.46044, -110.82815, "The most predictable big geyser in the world, which is the whole of its fame: every sixty to a hundred and ten minutes, thirty to fifty-five metres of water for one and a half to five minutes. Its cone is geyserite laid down a grain at a time over centuries. Here it goes every two minutes, because nobody would wait ninety.", "geyser", height=42, interval=120, duration=26, cone=16, phase=100)
    lm("Castle Geyser", 44.46360, -110.83637, "Its cone is the biggest in the basin and perhaps the oldest - thousands of years of sinter. Goes about every fourteen hours for twenty minutes, then roars with steam for half an hour more.", "geyser", height=27, interval=420, duration=60, cone=11, phase=200)
    lm("Grand Geyser", 44.46520, -110.83950, "The tallest predictable geyser: a fountain rather than a column, in bursts, up to sixty metres, every six hours or so.", "geyser", height=55, interval=520, duration=45, cone=4, phase=90, fountain=1)
    lm("Beehive Geyser", 44.46260, -110.83290, "A narrow cone like a nozzle, and a column to match: fifty metres, straight up, once or twice a day.", "geyser", height=50, interval=610, duration=24, cone=5, phase=400)
    lm("Riverside Geyser", 44.46940, -110.84550, "Leans out over the Firehole in an arch, every six hours, for twenty minutes.", "geyser", height=22, interval=360, duration=50, cone=3, phase=150, lean=0.6, turn=0.9)
    lm("Daisy Geyser", 44.46800, -110.84550, "Goes at an angle, a fan of water every couple of hours.", "geyser", height=25, interval=240, duration=16, cone=3, phase=60, lean=0.35, turn=2.2)
    lm("Great Fountain Geyser", 44.53770, -110.80170, "Lower Geyser Basin's big one: a wide terraced sinter platform that floods, and then bursts of up to sixty metres over an hour.", "geyser", height=45, interval=560, duration=70, cone=2, phase=260, fountain=1, apron=40)
    lm("Steamboat Geyser", 44.72330, -110.70360, "The tallest active geyser in the world - over ninety metres - and the least predictable: years can go by between major eruptions, or days. It splashes in between. Here it goes rarely, and when it does it is enormous.", "geyser", height=95, interval=900, duration=40, cone=6, phase=700, fountain=1)
    lm("Echinus Geyser", 44.72230, -110.70440, "An acid geyser - rare anywhere - in a pool rimmed with iron-red and black.", "geyser", height=18, interval=300, duration=20, cone=2, phase=10, fountain=1)
    lm("Clepsydra Geyser", 44.55120, -110.80760, "Has hardly stopped erupting since the 1959 Hebgen Lake earthquake.", "geyser", height=10, interval=20, duration=19, cone=2, phase=0, fountain=1)
    lm("Lone Star Geyser", 44.41820, -110.80510, "Out on its own up the Firehole, with a cone five metres tall. Every three hours.", "geyser", height=14, interval=330, duration=40, cone=7, phase=120)
    # the pools
    lm("Grand Prismatic Spring", 44.52513, -110.83818, "The largest hot spring in the United States: a hundred and twelve metres across and fifty deep, blue in the middle where it is too hot for anything to live, and then green, yellow, orange and red outward where the bacterial mats grow at the temperature each can stand. The steam over it takes the colour on a still morning.", "hotspring", r=56, ring=1, apron=150, steam=1.0, palette="prismatic")
    lm("Excelsior Geyser Crater", 44.52390, -110.83550, "A crater of a spring, a hundred metres by two hundred, that pours four thousand gallons a minute into the Firehole. It erupted three hundred feet in the 1880s and blew itself apart.", "hotspring", r=46, rx=90, steam=1.2, palette="blue", wall=6)
    lm("Morning Glory Pool", 44.47460, -110.84400, "It used to be blue all the way down. A century of coins, rocks and rubbish thrown in has blocked the vent, the water has cooled, and the orange and yellow bacteria have moved in from the edge.", "hotspring", r=6, palette="glory", steam=0.3)
    lm("Sapphire Pool", 44.48520, -110.85300, "Biscuit Basin's deep clear blue, named for the colour.", "hotspring", r=8, palette="blue", steam=0.5)
    lm("Opal Pool", 44.52600, -110.83380, "", "hotspring", r=10, palette="opal", steam=0.3)
    lm("Emerald Pool", 44.46440, -110.85150, "Green because yellow bacteria line a blue pool.", "hotspring", r=12, palette="emerald", steam=0.4)
    lm("Abyss Pool", 44.41640, -110.57050, "West Thumb: sixteen metres deep and you can see the bottom.", "hotspring", r=8, palette="blue", steam=0.5)
    lm("Fishing Cone", 44.41790, -110.56990, "A cone standing in the lake itself. Anglers used to catch a trout off it and boil it on the hook without moving.", "geyser", height=2, interval=10000, duration=1, cone=3, phase=0, inlake=1)
    lm("Mammoth Hot Springs Terraces", 44.96930, -110.70630, "Travertine, not sinter: limestone dissolved underground and laid back down as the water cools and loses its gas, two tonnes a day. The terraces grow, go dry and white, and start somewhere else. Minerva is the famous one, and it switches on and off by the decade.", "terraces", w=520, d=380, turn=-0.2, steps=7)
    lm("Liberty Cap", 44.97140, -110.70400, "A hot-spring cone eleven metres tall, built up by one vent over perhaps two and a half thousand years, which then stopped.", "sintercone", height=11, colour="#d8cbb0")
    lm("Mud Volcano", 44.62440, -110.43300, "Acid ground where there is too little water for a spring: the rock rots to clay and boils. Dragon's Mouth Spring roars in its cave mouth. The Mud Volcano itself blew its own cone off in the 1870s.", "mudpots", r=60)
    lm("Fountain Paint Pot", 44.55020, -110.80770, "Mud boiling in shades of cream and pink, with the colour from iron oxides; thick in late summer when it is dry, thin in spring.", "mudpots", r=25)
    # the falls and the canyon
    lm("Lower Falls of the Yellowstone", 44.71800, -110.49610, "Ninety-four metres, twice Niagara's height, where the river goes over the edge of a lava flow into the canyon it has cut through the rotten, hydrothermally-altered rhyolite behind it. The green stripe down the face is where the water is deepest.", "waterfall", drop=94, width=38, turn=1.95, river="Yellowstone River", mist=1.4)
    lm("Upper Falls of the Yellowstone", 44.71250, -110.49930, "Thirty-three metres, four hundred metres upstream of the Lower Falls, over the edge of a harder flow.", "waterfall", drop=33, width=34, turn=2.3, mist=0.7)
    lm("Grand Canyon of the Yellowstone", 44.72400, -110.47000, "Thirty-two kilometres long, up to three hundred and sixty metres deep and twelve hundred wide. The yellow and pink of its walls is not the stone but what hot water has done to it - rhyolite rotted by the hot springs that once filled it - and the river has cut through it like cheese.")
    lm("Artist Point", 44.72020, -110.47950, "The view down the canyon to the Lower Falls that Thomas Moran painted in 1872. The painting is in the Capitol and helped get the park made.", None)
    lm("Tower Fall", 44.89280, -110.38720, "Tower Creek over a drop of forty metres, between columns of volcanic breccia that stand like the towers it is named for.", "waterfall", drop=40, width=5, turn=0.9, mist=0.4)
    lm("Gibbon Falls", 44.65330, -110.77150, "Twenty-six metres down a stepped face that is a piece of the caldera's rim.", "waterfall", drop=26, width=22, turn=1.9, cascade=1, mist=0.5)
    lm("Lewis Falls", 44.31000, -110.62800, "Where the Lewis River comes over the south rim of the caldera.", "waterfall", drop=11, width=16, turn=2.7, mist=0.3)
    lm("Kepler Cascades", 44.44600, -110.80500, "The Firehole in a flight of steps, thirty metres in all.", "waterfall", drop=30, width=10, turn=0.3, cascade=1, mist=0.3)
    lm("Firehole Falls", 44.63440, -110.86600, "Twelve metres, in the Firehole Canyon, in walls of rhyolite lava.", "waterfall", drop=12, width=20, turn=0.2, mist=0.3)
    lm("Fairy Falls", 44.51850, -110.86900, "Sixty metres down a cliff of the Madison Plateau: a thin ribbon that goes to spray before it lands.", "waterfall", drop=60, width=4, turn=-1.3, mist=0.5)
    # the buildings
    lm("Old Faithful Inn", 44.45970, -110.83040, "Built in the winter of 1903-04 of lodgepole and local rhyolite, with a lobby open seven storeys to the roof and a chimney of stone in the middle of it. The biggest log building in the world, and the house style of every national park lodge built after it.", "inn", turn=0.05)
    lm("Lake Yellowstone Hotel", 44.55090, -110.40040, "The oldest hotel in the park, 1891, and the only one painted lemon yellow with a colonnade of Ionic columns on the lake - the colonial revival came in 1903, when the railway wanted something grander.", "lakehotel", turn=-0.35)
    lm("Roosevelt Arch", 45.02980, -110.70890, "The North Entrance, at Gardiner. Theodore Roosevelt laid its cornerstone in 1903. 'For the benefit and enjoyment of the people', it says across the top, from the Act of 1872 that made this the first national park in the world.", "arch", turn=0.0)
    lm("Mount Washburn Fire Lookout", 44.79740, -110.43440, "Three thousand one hundred and twenty-two metres up, on the rim of the older caldera, and on a clear day you can see the whole of the young one from it.", "lookout")
    lm("Fort Yellowstone", 44.97650, -110.70000, "The army ran the park from 1886 until the Park Service existed, and built these for it: sandstone and brick, red roofs, a parade ground.", None)
    # the land
    lm("Yellowstone Caldera", 44.53, -110.60, "Six hundred and thirty-one thousand years ago, the Lava Creek eruption emptied a magma chamber under here - a thousand cubic kilometres of ash, enough to bury the western half of the continent - and the roof fell in. This is the hole: seventy-odd kilometres by forty-five. Lava flows filled most of it since, and the rim is a scarp here and there rather than a wall. Under it, five to fifteen kilometres down, is the reservoir that is still partly molten. Press Caldera in the bar to see both.", "calderamark")
    lm("Sour Creek Dome", 44.655, -110.345, "One of the caldera's two resurgent domes: the floor pushed back up by magma underneath. It rises and falls by centimetres a year.", None)
    lm("Mallard Lake Dome", 44.445, -110.745, "The other resurgent dome, west of the lake, cut by faults across its top.", None)
    lm("Yellowstone Lake", 44.43, -110.36, "The largest high-altitude lake in North America: 350 km² at 2,357 m, frozen half the year. West Thumb is a caldera of its own inside the big one, and the floor of the lake has hot springs and explosion craters on it.", None)
    lm("Hayden Valley", 44.655, -110.455, "An old lake bed, silt and clay over the lava, where trees do not do well - so it is open grass, and the bison and the elk are here, and the traffic stops for them.", "herd", count=220, rx=4200, rz=2400)
    lm("Lamar Valley", 44.885, -110.195, "The Serengeti of North America, they call it: the big herds, and the wolves that were brought back in 1995.", "herd", count=320, rx=6800, rz=1500, turn=-0.5)
    lm("Eagle Peak", 44.2957, -110.0106, "The highest point in the park, 3,462 m, out in the Absarokas on the south-east boundary.", None)
    lm("Obsidian Cliff", 44.8230, -110.7290, "A lava flow that cooled to glass. People came from all over the continent for it for eleven thousand years, and Yellowstone obsidian turns up in burial mounds in Ohio.", None)
    lm("Norris Geyser Basin", 44.7260, -110.7040, "The hottest, oldest and most acid of the basins, where three faults cross; the ground changes year to year and the milky blue of the Porcelain Basin is silica in the water.", None)

    views = {
        "Old Faithful": view((44.4570, -110.8255), (44.46044, -110.82815), 60, 20),
        "Upper Geyser Basin": view((44.4555, -110.8215), (44.4660, -110.8380), 240, 0),
        "Grand Prismatic Spring": view((44.5190, -110.8330), (44.52513, -110.83818), 220, 0),
        "Grand Prismatic from the Fairy Falls trail": view((44.5215, -110.8455), (44.52513, -110.83818), 70, 0),
        "Lower Falls from Artist Point": canyon_view(),
        "The Grand Canyon of the Yellowstone": view((44.7300, -110.4520), (44.7160, -110.4960), 420, 0),
        "Mammoth Hot Springs": view((44.9655, -110.7000), (44.96930, -110.70630), 90, 0),
        "Norris Geyser Basin": view((44.7185, -110.6960), (44.72500, -110.70500), 200, 0),
        "Hayden Valley": view((44.6250, -110.4200), (44.6600, -110.4600), 260, 0),
        "Lamar Valley": view((44.8600, -110.1400), (44.8900, -110.2100), 1100, 0),
        "Yellowstone Lake": view((44.5700, -110.4300), (44.4300, -110.3300), 1500, 0),
        "Roosevelt Arch": view((45.0290, -110.7086), (45.02980, -110.70890), 9, 7),
        "Lake Yellowstone Hotel": view((44.5480, -110.3960), (44.55090, -110.40040), 45, 8),
        "Old Faithful Inn": view((44.4585, -110.8275), (44.45970, -110.83040), 40, 10),
        "Mount Washburn": view((44.7780, -110.4050), (44.79740, -110.43440), 1100, 0),
        "The caldera from above": view((44.30, -110.60), (44.56, -110.60), 29000, 0),
        "The whole park": view((44.37, -110.49), (44.66, -110.49), 33000, 0),
        "West Thumb": view((44.4140, -110.5640), (44.4178, -110.5712), 90, 0),
        "Tower Fall": view((44.8960, -110.3800), (44.89280, -110.38720), 160, -10),
    }
    cfg = {
        "name": "Yellowstone National Park",
        "note": "Generated by tools/make-yellowstone.py, which writes this file and yellowstone-osm.json: edit the script, not this. A real place on the shared engine, the size of a small country - 106 by 110 km - with the real ground (AWS Terrain Tiles on a 150 m grid, y = 0 at the lowest point on the map) and OpenStreetMap's lakes, rivers, roads, boardwalks and buildings. The caldera, the thermal basins, the geysers, the falls, the lodges and the wildlife are src/yellowstone/. Positions are [lat, lon]; view heights are above the datum.",
        "origin": [LAT0, LON0], "defaultSeed": 1872, "defaultHour": 9.0, "defaultView": "Grand Prismatic Spring",
        "bounds": [S, W, N, E], "osm": "data/cities/yellowstone-osm.json",
        "attribution": "Map data © <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> contributors · elevation: AWS Terrain Tiles (SRTM/NED) · caldera after the USGS",
        "sky": {"day": {"top": "#4f82c4", "hor": "#c9dcea"}, "dusk": {"top": "#2f3a62", "hor": "#e8a064"}, "night": {"top": "#04060c", "hor": "#101624"}},
        "fog": 6e-06, "overcast": 0.12,
        "terrainColours": {"low": "#5d6a45", "high": "#3c5236", "steep": "#7a7062", "far": "#34452f"},
        "farLevel": 300, "waterColour": "#2b5a78",
        "litWindows": 0.5, "streetTrees": 0, "parkedCars": 0.35, "traffic": 0.25, "people": 0.2, "streetFurniture": False,
        "beacons": False, "lowRiseFar": 9000, "flight": True, "riverBoats": {"sail": 0, "motor": 0, "kayak": 0},
        "roofPitch": 0.75, "roofColours": ["#5a3a2a", "#6a4a36", "#4a4a44", "#6e2e24", "#3e4a3a"],
        "roadColours": {"trail": "#b8a888"},
        "districts": {"_": "[name, hex colour, base height, tallest, box]",
                      "outer": ["Yellowstone", "#8a6a4a", 3, 12, None]},
        "focus": [], "landmarks": L, "views": views,
        "yellowstone": {"_": "src/yellowstone/: the forest, the steam, the caldera view and the herds",
                        "datum": datum, "forestNear": 3200, "forestTile": 800, "forestPerTile": 3400, "steamPerBasin": 90,
                        "magmaTop": 5000, "magmaBottom": 17000},
    }
    json.dump(cfg, open(CFG, "w"), indent=1, ensure_ascii=False)
    print(f"wrote {CFG}: {len(L)} landmarks, {len(views)} views")


if __name__ == "__main__":
    main()
