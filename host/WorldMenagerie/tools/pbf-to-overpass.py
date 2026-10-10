#!/usr/bin/env python3
"""Write a city's raw OpenStreetMap files from a Geofabrik extract instead of the Overpass API.

    data/osm/raw/venv/bin/python tools/pbf-to-overpass.py <city> <extract.osm.pbf>

When Overpass is too busy to answer (it timed out on most of Edinburgh's tiles), this reads a local .osm.pbf with
pyosmium and writes data/osm/raw/<city>/<category>-pbf.json in the shape `out geom` gives: nodes with lat and lon,
ways with their geometry, relations with their members' geometry. The categories and their tag filters are the
ones tools/fetch-osm.py asks Overpass for, inside the city's fetch.bbox; tools/build-osm-city.py reads every
<category>-*.json file and drops repeated elements, so these mix with any tiles Overpass did return.
A city's fetch.extraRoads (named service ways, steps) is honoured for the two forms Edinburgh uses.
"""
import json
import os
import re
import sys

import osmium

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

M = lambda k, rx: (lambda t: bool(re.fullmatch(rx, t.get(k, ""))))
EQ = lambda k, v: (lambda t: t.get(k) == v)
HAS = lambda k: (lambda t: k in t)
ANY = lambda *fs: (lambda t: any(f(t) for f in fs))
ALL = lambda *fs: (lambda t: all(f(t) for f in fs))

# (category, predicate, element types) - the same filters as tools/fetch-osm.py's QUERIES
CATS = {
    "water": (ANY(EQ("natural", "coastline"), EQ("natural", "water"), EQ("waterway", "riverbank"), EQ("leisure", "marina"),
                  EQ("natural", "beach"), M("man_made", "breakwater|pier|groyne")), "nwr"),
    "land": (ANY(M("leisure", "park|garden|pitch|stadium|playground|nature_reserve|golf_course|track|dog_park|ice_rink"),
                 M("landuse", "grass|recreation_ground|cemetery|railway"), M("natural", "wood|scrub|grassland|sand|heath|bare_rock|cliff"),
                 EQ("place", "square"), ALL(EQ("highway", "pedestrian"), EQ("area", "yes")),
                 M("tourism", "zoo|attraction|artwork|museum"), EQ("amenity", "fountain"), EQ("landuse", "forest")), "nwr"),
    "roads": (ANY(M("highway", "(motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street|pedestrian)(_link)?"),
                  ALL(EQ("highway", "service"), EQ("service", "alley")),
                  ALL(M("highway", "cycleway|footway|path"), HAS("name")), ALL(M("highway", "cycleway|footway|path"), EQ("bicycle", "designated"))), "w"),
    "landuse": (ANY(M("landuse", "residential|commercial|retail|industrial|construction|brownfield|garages|religious|education"),
                    EQ("amenity", "parking"), M("amenity", "school|hospital|university|college"), EQ("natural", "tree")), "nwr"),
    "waterways": (M("waterway", "river|canal"), "w"),
    "rail": (ANY(M("railway", "subway|light_rail|tram|rail|funicular"), EQ("railway", "station"), EQ("public_transport", "station")), "nw"),
    "buildings": (ANY(HAS("building"), HAS("building:part")), "wr"),
}


def main(city, pbf):
    C = json.load(open(os.path.join(ROOT, "data", "cities", f"{city}.json")))
    F = C.get("fetch", {})
    S, W, N, E = F.get("bbox") or C["bounds"]
    inb = lambda la, lo: S <= la <= N and W <= lo <= E
    extra = F.get("extraRoads", "")
    cats = dict(CATS)
    if extra:
        fs = []
        if '"service"' in extra and '"name"' in extra:
            fs.append(ALL(EQ("highway", "service"), HAS("name")))
        if '"steps"' in extra:
            fs.append(EQ("highway", "steps"))
        if fs:
            cats["roads-extra"] = (ANY(*fs), "w")
    out = {k: [] for k in cats}
    want_rel_ways = {}    # way id -> geometry, for the members of the relations kept
    rels = []
    wgeom = {}
    # pass 1: nodes and ways with their locations; relations remembered
    for o in osmium.FileProcessor(pbf).with_locations():
        t = dict(o.tags)
        if o.is_relation():
            if not t:
                continue
            for k, (pred, kinds) in cats.items():
                if "r" in kinds and pred(t):
                    rels.append((k, o.id, t, [(m.type, m.ref, m.role) for m in o.members]))
                    for m in o.members:
                        if m.type == "w":
                            want_rel_ways[m.ref] = None
            continue
        if o.is_node():
            if not t or not inb(o.location.lat, o.location.lon):
                continue
            for k, (pred, kinds) in cats.items():
                if "n" in kinds and pred(t):
                    out[k].append({"type": "node", "id": o.id, "lat": o.location.lat, "lon": o.location.lon, "tags": t})
            continue
        if o.is_way():
            try:
                geom = [{"lat": round(n.lat, 7), "lon": round(n.lon, 7)} for n in o.nodes]
            except osmium.InvalidLocationError:
                continue
            inside = any(inb(p["lat"], p["lon"]) for p in geom)
            if inside:
                wgeom[o.id] = geom
            if not t or not inside:
                continue
            for k, (pred, kinds) in cats.items():
                if "w" in kinds and pred(t):
                    out[k].append({"type": "way", "id": o.id, "nodes": [n.ref for n in o.nodes], "geometry": geom, "tags": t})
    # pass 2: every member way of the relations, whole, wherever it runs (as Overpass's `out geom` gives them): a
    # river's ring leaves the box and comes back, and with only the ways inside it the ring would not close
    missing = {r for r in want_rel_ways if r not in wgeom}
    if missing:
        for o in osmium.FileProcessor(pbf, osmium.osm.NODE | osmium.osm.WAY).with_locations():
            if o.is_way() and o.id in missing:
                try:
                    wgeom[o.id] = [{"lat": round(n.lat, 7), "lon": round(n.lon, 7)} for n in o.nodes]
                except osmium.InvalidLocationError:
                    pass
    inbox = lambda g: any(inb(p["lat"], p["lon"]) for p in g)
    # the relations that reach the box, with all their member ways
    for k, rid, t, members in rels:
        mem = [{"type": "way", "ref": ref, "role": role, "geometry": wgeom[ref]} for typ, ref, role in members if typ == "w" and ref in wgeom]
        if any(inbox(m["geometry"]) for m in mem):
            out[k].append({"type": "relation", "id": rid, "members": mem, "tags": t})
    raw = os.path.join(ROOT, "data", "osm", "raw", city)
    os.makedirs(raw, exist_ok=True)
    for k, els in out.items():
        name = (k[:-6] + "-extra-pbf") if k.endswith("-extra") else (k + "-pbf")
        json.dump({"elements": els}, open(os.path.join(raw, name + ".json"), "w"), separators=(",", ":"))
        print(f"  {name}: {len(els)} elements")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
