#!/usr/bin/env python3
"""Check a city's config against its map data and report what will go wrong before you load the page.

    python3 tools/check-city.py nyc
    python3 tools/check-city.py            # every city that has a data file

Every problem here is one that has actually bitten this project:

  * a viewpoint whose camera sits at or below its target - the orbit control clamps elevation, so the
    camera is thrown above the target instead and you get a bird's eye view where you asked for a street one
  * a height fix that would bury a tower the map already models properly as a stack of parts
  * a landmark whose position is not inside any mapped building, so its decor lands on the ground
  * a landmark naming a model the engine does not have
  * positions outside the map bounds, districts that cover nothing, empty focus areas

Exit status is 1 if anything was reported as an error, so it can gate a build.
"""
import json
import math
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CITIES = os.path.join(ROOT, "data", "cities")
# the models src/chicago/stages/04-landmarks.js knows how to build
MODELS = {"bean", "pavilion", "fountain", "wheel", "liftbridge", "bascule", "arch", "cablestay", "sign", "gate",
          "submarine", "tram", "mountain", "wrigley", "citadel", "nexus", "forcegate", "pylon", "strider",
          "gunships", "screenmast", "stacks", "suspension", "liberty", "ziggurat", "hallofjustice", "judgement", "baraddur", "orodruin", "blackgate", "morgul", "watchtower2"}
DECOR = {"mast", "spire", "statue", "crown", "floodlit", "cupola", "clocktower", "towers", "dome"}
ROOF_DECOR = {"mast", "spire", "statue", "crown", "cupola", "dome"}   # these stand on a roof; the rest build from the ground


class Report:
    def __init__(self, city):
        self.city = city
        self.errors = []
        self.warns = []
        self.notes = []

    def err(self, m):
        self.errors.append(m)

    def warn(self, m):
        self.warns.append(m)

    def note(self, m):
        self.notes.append(m)

    def show(self):
        print(f"\n=== {self.city}")
        for m in self.notes:
            print(f"  .  {m}")
        for m in self.warns:
            print(f"  ?  {m}")
        for m in self.errors:
            print(f"  !  {m}")
        if not self.errors and not self.warns:
            print("  ok")
        return len(self.errors)


def in_poly(x, z, ring):
    c = False
    for i in range(len(ring)):
        xi, zi = ring[i]
        xj, zj = ring[i - 1]
        if (zi > z) != (zj > z) and x < (xj - xi) * (z - zi) / (zj - zi) + xi:
            c = not c
    return c


def check(city):
    r = Report(city)
    cfg_path = os.path.join(CITIES, city + ".json")
    cfg = json.load(open(cfg_path))
    if "osm" not in cfg or "origin" not in cfg:
        r.note("not an OSM-engine city (the Iziz pages have their own schema): skipped")
        return r
    osm_path = os.path.join(ROOT, cfg["osm"]) if "osm" in cfg else None
    osm = json.load(open(osm_path)) if osm_path and os.path.exists(osm_path) else None
    if osm is None:
        r.warn(f"no map data at {cfg.get('osm')}: config checked on its own")

    lat0, lon0 = cfg["origin"]
    m_lat, m_lon = 111132.0, 111320.0 * math.cos(math.radians(lat0))

    def P(at):
        return ((at[1] - lon0) * m_lon, -(at[0] - lat0) * m_lat)

    s, w, n, e = cfg["bounds"]
    bx0, bz0 = (w - lon0) * m_lon, -(n - lat0) * m_lat
    bx1, bz1 = (e - lon0) * m_lon, -(s - lat0) * m_lat
    r.note(f"map {abs(bx1-bx0)/1000:.1f} x {abs(bz1-bz0)/1000:.1f} km")

    # ---- viewpoints: the orbit camera cannot sit below what it looks at ----
    for name, v in (cfg.get("views") or {}).items():
        (fa, fo, fy), (ta, to, ty) = v[0], v[1]
        fx, fz = P([fa, fo])
        tx, tz = P([ta, to])
        horiz = math.hypot(fx - tx, fz - tz)
        if horiz < 1:
            r.err(f"view {name!r}: camera and target are in the same place")
            continue
        el = math.atan2(fy - ty, horiz)
        if el < 0.03:
            r.err(f"view {name!r}: camera {fy:.0f} m looks up at a target {ty:.0f} m "
                  f"({math.degrees(el):+.1f} deg) - the control will clamp it and put the camera overhead instead")
        if not (min(bx0, bx1) - 6000 < tx < max(bx0, bx1) + 6000 and min(bz0, bz1) - 6000 < tz < max(bz0, bz1) + 6000):
            r.warn(f"view {name!r}: target is a long way outside the map")
    if cfg.get("defaultView") and cfg["defaultView"] not in (cfg.get("views") or {}):
        r.err(f"defaultView {cfg['defaultView']!r} is not one of the viewpoints")

    # ---- landmarks ----
    rings = []
    if osm:
        for b in osm["buildings"]:
            p = b["p"]
            ring = [(p[i] / 10, p[i + 1] / 10) for i in range(0, len(p), 2)]
            xs = [q[0] for q in ring]
            zs = [q[1] for q in ring]
            rings.append((ring, b.get("h", 0), min(xs), max(xs), min(zs), max(zs)))

    for L in cfg.get("landmarks", []):
        nm = L.get("name", "(unnamed)")
        if "at" not in L:
            r.err(f"landmark {nm!r}: no position")
            continue
        x, z = P(L["at"])
        if L.get("model") and L["model"] not in MODELS:
            r.err(f"landmark {nm!r}: model {L['model']!r} is not one the engine builds")
        for d in L.get("decor", []):
            if d and d[0] not in DECOR:
                r.err(f"landmark {nm!r}: decor {d[0]!r} is not one the engine builds")
        if not (min(bx0, bx1) - 400 < x < max(bx0, bx1) + 400 and min(bz0, bz1) - 400 < z < max(bz0, bz1) + 400):
            if L.get("model") not in ("mountain", "liberty"):
                r.warn(f"landmark {nm!r}: outside the map")
            continue
        if not osm:
            continue
        under = [(h, ring) for ring, h, x0, x1, z0, z1 in rings if x0 <= x <= x1 and z0 <= z <= z1 and in_poly(x, z, ring)]
        tallest = max([h for h, _ in under], default=0)
        # decor sits on whatever roof is under the landmark point
        if any(d and d[0] in ROOF_DECOR for d in L.get("decor", [])) and not under:
            r.err(f"landmark {nm!r}: roof decor but no mapped building under it - it will sit on the ground")
        if L.get("height"):
            if L.get("model"):
                pass          # the landmark builds its own massing, so it needs nothing mapped under it
            elif not under:
                r.warn(f"landmark {nm!r}: height {L['height']} m but nothing mapped under it")
            elif tallest >= L["height"] * 0.6:
                r.note(f"landmark {nm!r}: height fix dropped, the map already has {tallest:.0f} m here")
            else:
                low = min(h for h, _ in under)
                area = max((max(q[0] for q in ring) - min(q[0] for q in ring)) *
                           (max(q[1] for q in ring) - min(q[1] for q in ring)) for h, ring in under if h == low)
                if area > 3000:
                    r.warn(f"landmark {nm!r}: height {L['height']} m will be forced onto a {low:.0f} m "
                           f"footprint of {area:,.0f} m2 - check it is the tower and not its podium")

    # ---- districts and focus areas ----
    ds = cfg.get("districts") or {}
    if ds and "outer" not in ds:
        r.err("no district called 'outer': the engine falls back to that name for anything outside a box, "
              "and without it every readout and colour lookup throws")
    for k, d in ds.items():
        if k == "_" or not isinstance(d, list) or len(d) < 5 or d[4] is None:
            continue
        ds, dw, dn, de = d[4]
        if ds >= dn or dw >= de:
            r.err(f"district {k!r}: box is inside out")
    for f in cfg.get("focus", []):
        fx, fz = P(f["at"])
        if not (min(bx0, bx1) < fx < max(bx0, bx1) and min(bz0, bz1) < fz < max(bz0, bz1)):
            r.warn(f"focus {f.get('name')!r}: outside the map")

    # ---- the map data itself ----
    if osm:
        t = osm.get("terrain")
        r.note(f"{len(osm['buildings']):,} buildings, {len(osm['roads']):,} roads, {len(osm['areas']):,} areas, "
               f"{len(osm.get('water') or []):,} water, {len(osm.get('trees') or [])//2:,} trees, "
               + (f"terrain {t['nx']}x{t['nz']} at {t['step']} m" if t else "flat"))
        if not osm["buildings"]:
            r.err("no buildings in the map data")
        if not osm["roads"]:
            r.err("no roads in the map data")
        if t:
            hs = t["h"]
            lo, hi = min(hs) / 10, max(hs) / 10
            r.note(f"ground from {lo:.0f} m to {hi:.0f} m")
            if hi - lo < 1:
                r.warn("the terrain is flat: check the elevation tiles were downloaded")
        if cfg.get("seaLevelWater") and not osm.get("seaLevelWater"):
            r.err("config asks for seaLevelWater but the data was not built with it: rerun build-osm-city.py")
        named = sum(1 for road in osm["roads"] if road.get("n"))
        if named < len(osm["roads"]) * 0.05:
            r.warn(f"only {named} of {len(osm['roads'])} roads are named: crossings and signals need names")
    return r


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if args:
        names = args
    else:
        names = sorted(f[:-5] for f in os.listdir(CITIES)
                       if f.endswith(".json") and not f.endswith("-osm.json") and f != "lexicon.json")
    bad = 0
    for c in names:
        try:
            bad += check(c).show()
        except FileNotFoundError as err:
            print(f"\n=== {c}\n  !  {err}")
            bad += 1
    print()
    raise SystemExit(1 if bad else 0)


if __name__ == "__main__":
    main()
