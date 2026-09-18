#!/usr/bin/env python3
"""Download elevation tiles for a city's map area, so the ground can be modelled with its real hills.

    python3 tools/fetch-terrain.py portland
    python3 tools/fetch-terrain.py chicago --refresh

Source: the AWS Terrain Tiles public dataset (terrarium PNGs, built from SRTM, NED and other public
surveys). Tiles are cached under data/osm/raw/<city>/terrain/ and are not committed.
tools/build-osm-city.py turns them into the height grid in data/cities/<city>-osm.json.
"""
import json
import math
import os
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
UA = "CityofIziz-massing-model/1.0 (personal LAN project)"


def tile_xy(lat, lon, z):
    n = 2 ** z
    la = math.radians(lat)
    return (int((lon + 180) / 360 * n), int((1 - math.log(math.tan(la) + 1 / math.cos(la)) / math.pi) / 2 * n))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        raise SystemExit("usage: fetch-terrain.py <city> [--refresh]")
    city = args[0]
    refresh = "--refresh" in sys.argv
    cfg = json.load(open(os.path.join(ROOT, "data", "cities", city + ".json")))
    z = cfg.get("terrain", {}).get("zoom", 14)
    s, w, n, e = cfg["fetch"]["bbox"]
    dest = os.path.join(ROOT, "data", "osm", "raw", city, "terrain")
    os.makedirs(dest, exist_ok=True)
    x0, y0 = tile_xy(n, w, z)
    x1, y1 = tile_xy(s, e, z)
    got = new = 0
    for x in range(min(x0, x1), max(x0, x1) + 1):
        for y in range(min(y0, y1), max(y0, y1) + 1):
            f = os.path.join(dest, f"{z}_{x}_{y}.png")
            if os.path.exists(f) and not refresh:
                got += 1
                continue
            req = urllib.request.Request(URL.format(z=z, x=x, y=y), headers={"User-Agent": UA})
            for attempt in range(4):
                try:
                    data = urllib.request.urlopen(req, timeout=60).read()
                    open(f, "wb").write(data)
                    new += 1
                    break
                except Exception as err:
                    print(f"  retry {x},{y}: {err}", flush=True)
                    time.sleep(5 * (attempt + 1))
            time.sleep(0.2)
    print(f"{city}: {new} tiles downloaded, {got} already cached, zoom {z} -> {dest}")


if __name__ == "__main__":
    main()
