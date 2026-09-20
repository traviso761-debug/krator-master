#!/usr/bin/env python3
"""Download OpenStreetMap data for the Chicago model from the Overpass API, in tiles, with caching.

    python3 tools/fetch-osm.py chicago              fetch anything not yet cached
    python3 tools/fetch-osm.py portland --refresh   fetch everything again

The area and tiling come from "fetch" in data/cities/<city>.json. Raw responses go to data/osm/raw/<city>/
(not served, not committed). tools/build-osm-city.py <city> turns them into data/cities/<city>-osm.json.
Data © OpenStreetMap contributors, available under the Open Database License (ODbL).
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_ROOT = os.path.join(ROOT, "data", "osm", "raw")
URL = "https://overpass-api.de/api/interpreter"
UA = "WorldMenagerie-massing-model/1.0 (personal LAN project; contact via OSM)"


QUERIES = {
    # water: the lake shore, the river and harbour areas, marinas, beaches, breakwaters and piers
    "water": """(way["natural"="coastline"]({b});nwr["natural"="water"]({b});nwr["waterway"="riverbank"]({b});
                 nwr["leisure"="marina"]({b});nwr["natural"="beach"]({b});nwr["man_made"~"^(breakwater|pier|groyne)$"]({b}););out geom;""",
    # green and open land: parks, gardens, pitches, stadiums, nature reserves, plazas
    "land": """(nwr["leisure"~"^(park|garden|pitch|stadium|playground|nature_reserve|golf_course|track|dog_park|ice_rink)$"]({b});
                nwr["landuse"~"^(grass|recreation_ground|cemetery|railway)$"]({b});nwr["natural"~"^(wood|scrub|grassland|sand)$"]({b});
                nwr["place"="square"]({b});way["highway"="pedestrian"]["area"="yes"]({b});nwr["tourism"~"^(zoo|attraction|artwork|museum)$"]({b});
                nwr["amenity"="fountain"]({b}););out geom;""",
    # streets, alleys, trails and paths with names
    "roads": """(way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street|pedestrian)(_link)?$"]({b});
                 way["highway"="service"]["service"="alley"]({b});
                 way["highway"~"^(cycleway|footway|path)$"]["name"]({b});way["highway"~"^(cycleway|footway|path)$"]["bicycle"="designated"]({b}););out geom;""",
    # what the land is used for (residential yards, shops, industry), parking lots, school and hospital grounds, and mapped trees
    "landuse": """(nwr["landuse"~"^(residential|commercial|retail|industrial|construction|brownfield|garages|religious|education)$"]({b});
                   way["amenity"="parking"]({b});nwr["amenity"~"^(school|hospital|university|college)$"]({b});node["natural"="tree"]({b}););out geom;""",
    # river centre lines (the tour boats follow them)
    "waterways": """(way["waterway"~"^(river|canal)$"]({b}););out geom;""",
    # the L, Metra and freight lines
    "rail": """(way["railway"~"^(subway|light_rail|tram|rail|funicular)$"]({b});node["railway"="station"]({b});node["public_transport"="station"]({b}););out geom;""",
    # buildings and 3D building parts, in tiles because there are ~86,000
    "buildings": """(way["building"]({b});relation["building"]({b});way["building:part"]({b});relation["building:part"]({b}););out geom;""",
}
DEFAULT_TILES = {"buildings": (2, 2), "roads": (1, 2)}   # rows (south-north), columns (west-east); a city can override in its config


def fetch(query, dest):
    body = urllib.parse.urlencode({"data": "[out:json][timeout:300];" + query}).encode()
    for attempt in range(6):
        try:
            req = urllib.request.Request(URL, data=body, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=330) as r:
                data = r.read()
            json.loads(data)
            open(dest, "wb").write(data)
            return len(data)
        except Exception as e:   # 429/504 from a busy server: back off and retry
            wait = 20 * (attempt + 1)
            print(f"  retry in {wait}s ({e})", flush=True)
            time.sleep(wait)
    raise SystemExit(f"giving up on {dest}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        raise SystemExit("usage: fetch-osm.py <city> [--refresh]")
    city = args[0]
    refresh = "--refresh" in sys.argv
    cfg = json.load(open(os.path.join(ROOT, "data", "cities", city + ".json")))["fetch"]
    RAW = os.path.join(RAW_ROOT, city)
    os.makedirs(RAW, exist_ok=True)
    s, w, n, e = cfg["bbox"]
    tiles = {**DEFAULT_TILES, **{k: tuple(v) for k, v in cfg.get("tiles", {}).items()}}
    for name, q in QUERIES.items():
        rows, cols = tiles.get(name, (1, 1))
        for i in range(rows):
            for j in range(cols):
                b = (s + (n - s) * i / rows, w + (e - w) * j / cols, s + (n - s) * (i + 1) / rows, w + (e - w) * (j + 1) / cols)
                dest = os.path.join(RAW, f"{name}-{i}-{j}.json")
                if os.path.exists(dest) and not refresh:
                    print(f"{name} {i},{j}: cached")
                    continue
                size = fetch(q.replace("{b}", ",".join(f"{v:.5f}" for v in b)), dest)
                print(f"{name} {i},{j}: {size / 1e6:.1f} MB", flush=True)
                time.sleep(8)   # be polite to the public server


if __name__ == "__main__":
    main()
