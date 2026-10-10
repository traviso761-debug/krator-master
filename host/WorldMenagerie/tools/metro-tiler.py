#!/usr/bin/env python3
"""Cut a regional OpenStreetMap extract into streamable tiles for a city that is too big to load at once.

    data/osm/raw/venv/bin/python tools/metro-tiler.py tokyo            (pyosmium is in that venv)

Reads data/cities/<city>.json "metro": {pbf, box: [s, w, n, e], tile: m, core: [[s, w, n, e], ...], skyline: {block, minH}}
and writes data/metro/<city>/:
    index.json              the manifest: origin, datum, tile size, every tile [ix, iz, buildings, tallest]
    t/<ix>_<iz>.json.gz     a tile: buildings (rings, heights, kinds), roads, rail, areas (clipped to the tile), terrain
    s/<bx>_<bz>.json.gz     a skyline block: the tall buildings only, for the distance

Coordinates are the city's own (metres east and south of its origin, as the engine has them); in a tile, decimetres
from the tile's corner. Heights are metres above the city's datum (its -osm.json terrain), so the tiles meet the
detailed core. What falls inside a core box is left out: the core is drawn by the engine from <city>-osm.json.
The sea needs nothing: the terrain grid carries it (below 0.3 m is water, and the page leaves it out).
Map data (c) OpenStreetMap contributors, ODbL. Elevation: AWS Terrain Tiles.
"""
import gzip, io, json, math, os, sys, time, urllib.request
from collections import defaultdict

import osmium

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
city = sys.argv[1] if len(sys.argv) > 1 else "tokyo"
CITY = json.load(open(os.path.join(ROOT, "data", "cities", city + ".json")))
M = CITY["metro"]
LAT0, LON0 = CITY["origin"]
M_LAT, M_LON = 111132.0, 111320.0 * math.cos(math.radians(LAT0))
S, W, N, E = M["box"]
TILE = M.get("tile", 1000)
CORE = [tuple(b) for b in M.get("core", [])]
DATUM = json.load(open(os.path.join(ROOT, CITY["osm"])))["terrain"].get("datum", 0) if M.get("datumFromCore", True) else 0
OUT = os.path.join(ROOT, "data", "metro", city)
TMP = os.path.join(ROOT, "data", "osm", "raw", "metro-" + city + "-tmp")
os.makedirs(os.path.join(OUT, "t"), exist_ok=True); os.makedirs(os.path.join(OUT, "s"), exist_ok=True); os.makedirs(TMP, exist_ok=True)

def xz(lat, lon):
    return ((lon - LON0) * M_LON, -(lat - LAT0) * M_LAT)

def in_core(lat, lon):
    return any(s <= lat <= n and w <= lon <= e for s, w, n, e in CORE)

def in_box(lat, lon):
    return S <= lat <= N and W <= lon <= E

# ---- heights: tags first, then levels, then a default by kind, spread a little by place ----
DEF = {"house": 7, "detached": 7, "residential": 9, "apartments": 15, "terrace": 7, "garage": 3, "garages": 3, "shed": 3, "roof": 4,
       "commercial": 14, "retail": 9, "office": 24, "industrial": 9, "warehouse": 10, "school": 13, "university": 15, "hospital": 18,
       "hotel": 30, "train_station": 12, "temple": 10, "shrine": 7, "yes": 8}
KIND = {k: i for i, k in enumerate(["yes", "house", "detached", "residential", "apartments", "commercial", "retail", "office", "industrial",
                                    "warehouse", "school", "university", "hospital", "hotel", "train_station", "temple", "shrine", "garage", "roof", "other"])}
def num(v):
    try:
        return float(str(v).split()[0].replace("m", "").replace(",", "."))
    except Exception:
        return None
def height_of(t, cx, cz):
    h = num(t.get("height"))
    lv = num(t.get("building:levels"))
    if h is None and lv:
        h = lv * 3.2 + 1
    if h is None:
        h = DEF.get(t.get("building", "yes"), 8)
        h *= 0.85 + 0.3 * ((math.sin(cx * 12.9898 + cz * 78.233) * 43758.5453) % 1)
    mh = num(t.get("min_height")) or 0
    return max(2.5, min(h, 650)), mh

# ---- geometry ----
def simplify(pts, tol):
    if len(pts) < 4:
        return pts
    def rdp(a, b):
        (ax, az), (bx, bz) = pts[a], pts[b]
        dx, dz = bx - ax, bz - az
        L2 = dx * dx + dz * dz or 1e-9
        best, bi = 0, -1
        for i in range(a + 1, b):
            px, pz = pts[i]
            t = max(0, min(1, ((px - ax) * dx + (pz - az) * dz) / L2))
            d = math.hypot(px - ax - dx * t, pz - az - dz * t)
            if d > best:
                best, bi = d, i
        if best > tol:
            return rdp(a, bi)[:-1] + rdp(bi, b)
        return [pts[a], pts[b]]
    return rdp(0, len(pts) - 1)

def clip(ring, x0, z0, x1, z1):
    """Sutherland-Hodgman: a ring cut to a rectangle."""
    def cut(pts, inside, inter):
        out = []
        for i in range(len(pts)):
            p, q = pts[i], pts[(i + 1) % len(pts)]
            if inside(q):
                if not inside(p):
                    out.append(inter(p, q))
                out.append(q)
            elif inside(p):
                out.append(inter(p, q))
        return out
    def ix(v):
        return lambda p, q: (v, p[1] + (q[1] - p[1]) * (v - p[0]) / ((q[0] - p[0]) or 1e-9))
    def iz(v):
        return lambda p, q: (p[0] + (q[0] - p[0]) * (v - p[1]) / ((q[1] - p[1]) or 1e-9), v)
    r = ring
    for inside, inter in ((lambda p: p[0] >= x0, ix(x0)), (lambda p: p[0] <= x1, ix(x1)), (lambda p: p[1] >= z0, iz(z0)), (lambda p: p[1] <= z1, iz(z1))):
        if not r:
            break
        r = cut(r, inside, inter)
    return r

# ---- the buffers: features go to per-tile temporary files, flushed in batches (the region is too big to hold) ----
BUF = defaultdict(list)
NBUF = [0]
STATS = defaultdict(int)
def emit(tx, tz, rec):
    BUF[(tx, tz)].append(rec)
    NBUF[0] += 1
    if NBUF[0] > 300000:
        flush()
def flush():
    for (tx, tz), recs in BUF.items():
        with open(os.path.join(TMP, f"{tx}_{tz}.jsonl"), "a") as f:
            for r in recs:
                f.write(json.dumps(r, separators=(",", ":")) + "\n")
    BUF.clear()
    NBUF[0] = 0

def tile_of(x, z):
    return int(math.floor(x / TILE)), int(math.floor(z / TILE))
def local(pts, tx, tz):
    return [v for x, z in pts for v in (round((x - tx * TILE) * 10), round((z - tz * TILE) * 10))]

ROADC = {"motorway": 22, "trunk": 18, "primary": 15, "secondary": 13, "tertiary": 11, "residential": 7, "unclassified": 7, "living_street": 6,
         "pedestrian": 6, "service": 4.5, "motorway_link": 8, "trunk_link": 8, "primary_link": 8, "secondary_link": 7, "tertiary_link": 7}
AREAK = (("natural", "water", "water"), ("waterway", "riverbank", "water"), ("water", None, "water"), ("leisure", "park", "park"), ("leisure", "garden", "garden"),
         ("landuse", "forest", "wood"), ("natural", "wood", "wood"), ("landuse", "grass", "grass"), ("leisure", "golf_course", "golf"), ("landuse", "cemetery", "cemetery"),
         ("leisure", "pitch", "pitch"), ("landuse", "farmland", "farm"), ("landuse", "railway", "railyard"), ("landuse", "industrial", "industrial"),
         ("amenity", "parking", "parking"), ("leisure", "stadium", "stadium"))

def area_kind(t):
    for k, v, kind in AREAK:
        if k in t and (v is None or t.get(k) == v):
            return kind
    return None

def main():
    t0 = time.time()
    flt = osmium.filter.KeyFilter("building", "highway", "railway", "landuse", "leisure", "natural", "waterway", "water", "amenity")
    fp = osmium.FileProcessor(M["pbf"]).with_locations().with_areas().with_filter(flt)
    n = 0
    for o in fp:
        n += 1
        if n % 2000000 == 0:
            print(f"  {n / 1e6:.0f}M objects, {time.time() - t0:.0f}s, buildings {STATS['b']}, roads {STATS['r']}", flush=True)
        if o.is_area():
            t = dict(o.tags)
            isb = "building" in t and t.get("building") != "no"
            kind = None if isb else area_kind(t)
            if not isb and not kind:
                continue
            for outer in o.outer_rings():
                try:
                    ll = [(nd.lat, nd.lon) for nd in outer]
                except osmium.InvalidLocationError:
                    continue
                if len(ll) < 4:
                    continue
                clat = sum(p[0] for p in ll) / len(ll); clon = sum(p[1] for p in ll) / len(ll)
                if not in_box(clat, clon) and not isb and not any(in_box(*p) for p in ll[::max(1, len(ll) // 8)]):
                    continue
                pts = [xz(*p) for p in ll[:-1]]
                if isb:
                    if not in_box(clat, clon) or in_core(clat, clon):
                        continue
                    pts = simplify(pts + [pts[0]], 0.4)[:-1]
                    if len(pts) < 3:
                        continue
                    cx, cz = xz(clat, clon)
                    h, mh = height_of(t, cx, cz)
                    tx, tz = tile_of(cx, cz)
                    rec = {"k": "b", "p": local(pts, tx, tz), "h": round(h * 10), "t": KIND.get(t.get("building"), KIND["other"])}
                    if mh:
                        rec["m"] = round(mh * 10)
                    if t.get("building:colour"):
                        rec["c"] = t["building:colour"]
                    emit(tx, tz, rec)
                    STATS["b"] += 1
                else:
                    # an area: clipped to every tile it covers (a park, a river, a forest crosses tiles), the core left to the engine
                    pts = simplify(pts + [pts[0]], 1.0)[:-1]
                    xs = [p[0] for p in pts]; zs = [p[1] for p in pts]
                    for tx in range(int(math.floor(min(xs) / TILE)), int(math.floor(max(xs) / TILE)) + 1):
                        for tz in range(int(math.floor(min(zs) / TILE)), int(math.floor(max(zs) / TILE)) + 1):
                            c = clip(pts, tx * TILE, tz * TILE, (tx + 1) * TILE, (tz + 1) * TILE)
                            if len(c) >= 3:
                                emit(tx, tz, {"k": "a", "a": kind, "p": local(c, tx, tz)})
                                STATS["a"] += 1
        elif o.is_way():
            t = dict(o.tags)
            hw, rw = t.get("highway"), t.get("railway")
            if not ((hw in ROADC) or rw in ("rail", "light_rail", "subway", "monorail", "tram")):
                continue
            if t.get("tunnel") in ("yes", "building_passage") or str(t.get("layer", "0")).startswith("-") or t.get("area") == "yes":
                continue
            try:
                ll = [(nd.lat, nd.lon) for nd in o.nodes]
            except osmium.InvalidLocationError:
                continue
            if len(ll) < 2 or not any(in_box(*p) for p in ll):
                continue
            pts = simplify([xz(*p) for p in ll], 0.8)
            layer = int(num(t.get("layer")) or 0) if str(t.get("layer", "0")).lstrip("-").isdigit() else 0
            br = 1 if t.get("bridge") not in (None, "no") else 0
            # pieces: consecutive segments whose middles fall in the same tile, and not in the core
            cur, curt = [], None
            def out(seg, tt):
                if len(seg) >= 2:
                    rec = {"k": "r" if hw else "l", "p": local(seg, *tt)}
                    if hw:
                        rec["c"] = hw.replace("_link", ""); rec["w"] = ROADC[hw]
                    else:
                        rec["c"] = rw
                        if t.get("name"):
                            rec["n"] = t["name"]
                    if br or layer > 0:
                        rec["b"] = max(1, layer)
                    emit(tt[0], tt[1], rec)
                    STATS["r" if hw else "l"] += 1
            for i in range(len(pts) - 1):
                (ax, az), (bx, bz) = pts[i], pts[i + 1]
                mx, mz = (ax + bx) / 2, (az + bz) / 2
                lat, lon = LAT0 - mz / M_LAT, LON0 + mx / M_LON
                tt = None if in_core(lat, lon) or not in_box(lat, lon) else tile_of(mx, mz)
                if tt != curt:
                    if curt is not None:
                        out(cur, curt)
                    cur = [pts[i]] if tt is not None else []
                    curt = tt
                if tt is not None:
                    cur.append(pts[i + 1])
            if curt is not None:
                out(cur, curt)
    flush()
    print(f"read in {time.time() - t0:.0f}s: {dict(STATS)}", flush=True)

def terrain_and_write():
    """Each tile's ground: a 33 x 33 grid from the AWS terrarium tiles (z13), heights over the city's datum."""
    from PIL import Image
    Z = M.get("terrainZoom", 13)
    cache = os.path.join(ROOT, "data", "osm", "raw", "metro-terrain-z%d" % Z)
    os.makedirs(cache, exist_ok=True)
    imgs = {}
    def tile_img(x, y):
        k = (x, y)
        if k not in imgs:
            fn = os.path.join(cache, f"{x}_{y}.png")
            if not os.path.exists(fn):
                for attempt in range(4):
                    try:
                        urllib.request.urlretrieve(f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png", fn)
                        break
                    except Exception:
                        time.sleep(3 * (attempt + 1))
            imgs[k] = Image.open(fn).convert("RGB").load() if os.path.exists(fn) else None
            if len(imgs) > 400:
                imgs.pop(next(iter(imgs)))
        return imgs[k]
    # The elevation, filtered once over the whole box. Around Tokyo the terrarium tiles carry the city's surface
    # (towers stand in them as spikes of up to 50 m) and pits of several metres on flat ground, and every road laid
    # over them would dip and climb. A grey opening takes out anything raised and narrower than ~150 m (a building,
    # not a hill), a closing fills the pits, and a box blur takes off what is left of the noise.
    import numpy as np
    from scipy import ndimage
    n2 = 2 ** Z
    def gxy(lat, lon):
        return ((lon + 180) / 360 * n2 * 256,
                (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n2 * 256)
    pad = 2
    tx0, ty0 = int(gxy(N, W)[0] // 256) - pad, int(gxy(N, W)[1] // 256) - pad
    tx1, ty1 = int(gxy(S, E)[0] // 256) + pad, int(gxy(S, E)[1] // 256) + pad
    DEM = np.zeros(((ty1 - ty0 + 1) * 256, (tx1 - tx0 + 1) * 256), dtype=np.float32)
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            im = tile_img(tx, ty)
            if im is None:
                continue
            a = np.asarray(Image.open(os.path.join(cache, f"{tx}_{ty}.png")).convert("RGB"), dtype=np.float32)
            DEM[(ty - ty0) * 256:(ty - ty0 + 1) * 256, (tx - tx0) * 256:(tx - tx0 + 1) * 256] = a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768
    OPEN, CLOSE, BLUR = M.get("demOpen", 9), M.get("demClose", 5), M.get("demBlur", 5)
    DEM = ndimage.uniform_filter(ndimage.grey_closing(ndimage.grey_opening(DEM, size=OPEN), size=CLOSE), size=BLUR)
    print(f"  elevation: {DEM.shape[1]} x {DEM.shape[0]} px filtered (open {OPEN}, close {CLOSE}, blur {BLUR})", flush=True)
    def elev(lat, lon):
        fx, fy = gxy(lat, lon)
        fx -= tx0 * 256 + 0.5; fy -= ty0 * 256 + 0.5
        i, j = int(math.floor(fx)), int(math.floor(fy)); u, v = fx - i, fy - j
        if i < 0 or j < 0 or i + 1 >= DEM.shape[1] or j + 1 >= DEM.shape[0]:
            return 0
        return float((DEM[j, i] * (1 - u) + DEM[j, i + 1] * u) * (1 - v) + (DEM[j + 1, i] * (1 - u) + DEM[j + 1, i + 1] * u) * v)
    G = 33
    # the tiles that have anything, plus every land tile in the box (the ground is wanted where there are no buildings too)
    names = {tuple(map(int, f[:-6].split("_"))) for f in os.listdir(TMP) if f.endswith(".jsonl")}
    x0, z0 = xz(N, W); x1, z1 = xz(S, E)
    for tx in range(int(math.floor(x0 / TILE)), int(math.floor(x1 / TILE)) + 1):
        for tz in range(int(math.floor(z0 / TILE)), int(math.floor(z1 / TILE)) + 1):
            names.add((tx, tz))
    index, skyline = [], defaultdict(list)
    COVER = {}
    def _core_touch(tx, tz):
        for (s_, w_, n_, e_) in CORE:
            la1, la0_ = LAT0 - tz * TILE / M_LAT, LAT0 - (tz + 1) * TILE / M_LAT
            lo0_, lo1 = LON0 + tx * TILE / M_LON, LON0 + (tx + 1) * TILE / M_LON
            yield la0_ < n_ and la1 > s_ and lo0_ < e_ and lo1 > w_
    RAIL = []   # every rail piece in the region, in world coordinates, for the trains (which run across tiles)
    MASKS = {}
    SB = M.get("skyline", {}).get("block", 4000); SMIN = M.get("skyline", {}).get("minH", 30)
    done = 0
    for tx, tz in sorted(names):
        hs, land = [], 0
        for j in range(G):
            for i in range(G):
                x = tx * TILE + i * TILE / (G - 1); z = tz * TILE + j * TILE / (G - 1)
                lat, lon = LAT0 - z / M_LAT, LON0 + x / M_LON
                h = elev(lat, lon) - DATUM
                hs.append(round(h * 10)); land += h > -DATUM + 0.3
        fn = os.path.join(TMP, f"{tx}_{tz}.jsonl")
        recs = [json.loads(l) for l in open(fn)] if os.path.exists(fn) else []
        # land, from the map: wherever there is a building, a road or a non-water area within ~60 m, the ground is land
        # even where the elevation says it is at or below the sea (eastern Tokyo's zero-metre zones stand behind dikes)
        mask = bytearray(G * G)
        def mark(px, pz):
            i0, j0 = int(round(px / TILE * (G - 1))), int(round(pz / TILE * (G - 1)))
            for j in range(max(0, j0 - 2), min(G, j0 + 3)):
                for i in range(max(0, i0 - 2), min(G, i0 + 3)):
                    mask[j * G + i] = 1
        for r in recs:
            if r["k"] == "a" and r.get("a") == "water":
                continue
            p = r["p"]
            for q in range(0, len(p) - 1, 2 if r["k"] != "a" else 6):
                mark(p[q] / 10, p[q + 1] / 10)
        SEA = -DATUM
        for k in range(G * G):
            if mask[k] and hs[k] / 10 < SEA + 0.6:
                hs[k] = round((SEA + 0.6) * 10)
        land = sum(1 for k in range(G * G) if hs[k] / 10 > SEA + 0.3)
        MASKS[(tx, tz)] = mask
        if not recs and land == 0:
            continue   # open sea, nothing on it
        clat, clon = LAT0 - (tz + 0.5) * TILE / M_LAT, LON0 + (tx + 0.5) * TILE / M_LON
        core_all = all(in_core(LAT0 - (tz + v) * TILE / M_LAT, LON0 + (tx + u) * TILE / M_LON) for u in (0.05, 0.95) for v in (0.05, 0.95))
        b = [r for r in recs if r["k"] == "b"]
        for r in recs:
            if r["k"] == "l" and r["c"] in ("rail", "subway", "light_rail", "monorail"):
                RAIL.append([[round(r["p"][i] / 10 + (tx if i % 2 == 0 else tz) * TILE, 1) for i in range(len(r["p"]))], r.get("n", ""), r["c"], r.get("b", 0)])
        tile = {"b": [[r["p"], r["h"], r.get("m", 0), r["t"], r.get("c", "")] for r in b],
                "r": [[r["p"], r["c"], r["w"], r.get("b", 0)] for r in recs if r["k"] == "r"],
                "l": [[r["p"], r["c"], r.get("b", 0)] for r in recs if r["k"] == "l"],
                "a": [[r["p"], r["a"]] for r in recs if r["k"] == "a"],
                "g": hs, "core": core_all}
        with gzip.open(os.path.join(OUT, "t", f"{tx}_{tz}.json.gz"), "wt", compresslevel=6) as f:
            json.dump(tile, f, separators=(",", ":"))
        tallest = max([r["h"] for r in b] or [0]) / 10
        index.append([tx, tz, len(b), round(tallest), 1 if core_all else 0])
        # how much of the tile is roofed (the bay islands have few buildings, but big ones); a tile the core touches
        # counts as built-up, since its buildings are the engine's, not in the tile
        roofed = 0.0
        for r in b:
            q = r["p"]
            roofed += abs(sum(q[i] * q[(i + 3) % len(q)] - q[(i + 2) % len(q)] * q[i + 1] for i in range(0, len(q), 2))) / 200.0
        COVER[(tx, tz)] = 1.0 if any(_core_touch(tx, tz)) else roofed / (TILE * TILE)
        for r in b:
            if r["h"] / 10 >= SMIN:
                ox, oz = tx * TILE, tz * TILE
                bx, bz = int(math.floor(ox / SB)), int(math.floor(oz / SB))
                pts = [(r["p"][i] / 10 + ox - bx * SB, r["p"][i + 1] / 10 + oz - bz * SB) for i in range(0, len(r["p"]), 2)]
                gi = min(G * G - 1, int(round((sum(p[1] for p in pts) / len(pts) + bz * SB - tz * TILE) / TILE * (G - 1))) * G + int(round((sum(p[0] for p in pts) / len(pts) + bx * SB - tx * TILE) / TILE * (G - 1))))
                skyline[(bx, bz)].append([[round(v * 10) for p in pts for v in p], r["h"], hs[max(0, min(len(hs) - 1, gi))], r.get("c", "")])
        done += 1
        if done % 200 == 0:
            print(f"  {done} tiles written", flush=True)
    for (bx, bz), bs in skyline.items():
        with gzip.open(os.path.join(OUT, "s", f"{bx}_{bz}.json.gz"), "wt", compresslevel=6) as f:
            json.dump({"b": bs}, f, separators=(",", ":"))
    # the far ground: the whole box every 250 m, and how built-up it is there (buildings per km² from the tiles)
    CS = M.get("coarse", 250)
    dens = {(t[0], t[1]): t[2] for t in index}
    gx0, gz0 = x0, z0
    nx, nz = int((x1 - x0) / CS) + 1, int((z1 - z0) / CS) + 1
    ch, cd = [], []
    for j in range(nz):
        for i in range(nx):
            x, z = gx0 + i * CS, gz0 + j * CS
            e = elev(LAT0 - z / M_LAT, LON0 + x / M_LON) - DATUM
            tk = (int(math.floor(x / TILE)), int(math.floor(z / TILE)))
            mk = MASKS.get(tk)
            if mk is not None:
                gi = int(round((z - tk[1] * TILE) / TILE * (G - 1))) * G + int(round((x - tk[0] * TILE) / TILE * (G - 1)))
                if mk[min(len(mk) - 1, gi)] and e < -DATUM + 0.6:
                    e = -DATUM + 0.6
            ch.append(round(e * 10))
            tk2 = (int(math.floor(x / TILE)), int(math.floor(z / TILE)))
            cd.append(min(255, max(dens.get(tk2, 0) // 8, int(COVER.get(tk2, 0) * 700))))
    with gzip.open(os.path.join(OUT, "ground.json.gz"), "wt", compresslevel=6) as f:
        json.dump({"x0": round(gx0, 1), "z0": round(gz0, 1), "step": CS, "nx": nx, "nz": nz, "h": ch, "d": cd}, f, separators=(",", ":"))
    with gzip.open(os.path.join(OUT, "rail.json.gz"), "wt", compresslevel=6) as f:
        json.dump({"l": RAIL}, f, separators=(",", ":"))
    man = {"city": city, "origin": [LAT0, LON0], "datum": DATUM, "tile": TILE, "grid": G, "box": M["box"], "core": M.get("core", []),
           "skylineBlock": SB, "tiles": index, "skyline": sorted([list(k) for k in skyline]),
           "attribution": "Map data (c) OpenStreetMap contributors, ODbL. Elevation: AWS Terrain Tiles.", "built": time.strftime("%Y-%m-%d")}
    json.dump(man, open(os.path.join(OUT, "index.json"), "w"), separators=(",", ":"))
    print(f"wrote {len(index)} tiles, {len(skyline)} skyline blocks to {OUT}", flush=True)

if __name__ == "__main__":
    if "--write-only" not in sys.argv:
        for f in os.listdir(TMP):
            os.remove(os.path.join(TMP, f))
        main()
    terrain_and_write()
