#!/usr/bin/env python3
"""Download elevation tiles for a city's map area, so the ground can be modelled with its real hills.

    python3 tools/fetch-terrain.py portland
    python3 tools/fetch-terrain.py chicago --refresh

Source: the AWS Terrain Tiles public dataset (terrarium PNGs, built from SRTM, NED and other public
surveys). Tiles are cached under data/osm/raw/<city>/terrain/ and are not committed.
A city whose terrain sets "source": "3dep" (a US city where the tiles are poor: Yachats, whose coastal tiles carry flat
fills and spikes of -2,700 m) takes the USGS 3D Elevation Program instead: one GeoTIFF over the map (bare earth, lidar
where there is any, 1/3 arc-second elsewhere) from the National Map's exportImage, cached as terrain/3dep.tif with its
box in terrain/3dep.json.
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
UA = "WorldMenagerie-massing-model/1.0 (personal LAN project)"


def tile_xy(lat, lon, z):
    n = 2 ** z
    la = math.radians(lat)
    return (int((lon + 180) / 360 * n), int((1 - math.log(math.tan(la) + 1 / math.cos(la)) / math.pi) / 2 * n))


URL_3DEP = ("https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage"
            "?bbox={w},{s},{e},{n}&bboxSR=4326&imageSR=4326&size={nx},{ny}&format=tiff&pixelType=F32"
            "&interpolation=RSP_BilinearInterpolation&noData=-9999&noDataInterpretation=esriNoDataMatchAny&f=image")


def fetch_3dep(city, cfg, dest, refresh):
    """One F32 GeoTIFF over the map's box, padded 300 m, at `res` metres a pixel (default 5)."""
    f, meta = os.path.join(dest, "3dep.tif"), os.path.join(dest, "3dep.json")
    if os.path.exists(f) and os.path.exists(meta) and not refresh:
        print(f"{city}: 3dep.tif already cached -> {dest}")
        return
    s, w, n, e = cfg.get("bounds") or cfg["fetch"]["bbox"]
    pad_lat, pad_lon = 300 / 111132.0, 300 / (111320.0 * math.cos(math.radians((s + n) / 2)))
    s, w, n, e = s - pad_lat, w - pad_lon, n + pad_lat, e + pad_lon
    res = cfg.get("terrain", {}).get("res", 5)
    ny = int(round((n - s) * 111132.0 / res))
    nx = int(round((e - w) * 111320.0 * math.cos(math.radians((s + n) / 2)) / res))
    if max(nx, ny) > 4000:
        raise SystemExit(f"3dep: {nx}x{ny} pixels is over the server's 4000; raise terrain.res")
    req = urllib.request.Request(URL_3DEP.format(w=w, s=s, e=e, n=n, nx=nx, ny=ny), headers={"User-Agent": UA})
    for attempt in range(4):
        try:
            data = urllib.request.urlopen(req, timeout=300).read()
            if data[:2] not in (b"II", b"MM"):
                raise ValueError("not a TIFF: " + data[:200].decode("utf-8", "replace"))
            open(f, "wb").write(data)
            break
        except Exception as err:
            print(f"  retry 3dep: {err}", flush=True)
            time.sleep(5 * (attempt + 1))
    else:
        raise SystemExit("3dep: could not download")
    json.dump({"bbox": [s, w, n, e], "size": [nx, ny], "res": res, "source": "USGS 3DEP (National Map exportImage)"},
              open(meta, "w", encoding="utf-8"), indent=1)
    print(f"{city}: 3dep.tif {nx}x{ny} at {res} m -> {dest}")


def fetch_patch(city, pt, dest, refresh):
    """terrain.patches: [{name, at: [lat, lon], r (metres), res (metres, default 1)}]: a small 3DEP lidar patch round a
    feature too narrow for the map's grid (Devil's Churn, Cook's Chasm), cached as terrain/patch-<name>.tif; the
    city's own land script reads it (tools/make-yachats.py)."""
    f = os.path.join(dest, "patch-" + pt["name"] + ".tif")
    if os.path.exists(f) and not refresh:
        return
    la, lo = pt["at"]
    r, res = pt["r"], pt.get("res", 1)
    dla, dlo = r / 111132.0, r / (111320.0 * math.cos(math.radians(la)))
    n = int(round(2 * r / res))
    url = URL_3DEP.format(w=lo - dlo, s=la - dla, e=lo + dlo, n=la + dla, nx=n, ny=n)
    data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=300).read()
    if data[:2] not in (b"II", b"MM"):
        raise SystemExit("patch " + pt["name"] + ": not a TIFF")
    open(f, "wb").write(data)
    print(f"{city}: patch {pt['name']} {n}x{n} at {res} m -> {f}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        raise SystemExit("usage: fetch-terrain.py <city> [--refresh]")
    city = args[0]
    refresh = "--refresh" in sys.argv
    cfg = json.load(open(os.path.join(ROOT, "data", "cities", city + ".json")))
    z = cfg.get("terrain", {}).get("zoom", 14)
    s, w, n, e = cfg.get("bounds") or cfg["fetch"]["bbox"]   # the whole of a city that has grown past its first box
    dest = os.path.join(ROOT, "data", "osm", "raw", city, "terrain")
    os.makedirs(dest, exist_ok=True)
    for pt in cfg.get("terrain", {}).get("patches", []):
        fetch_patch(city, pt, dest, refresh)
    if cfg.get("terrain", {}).get("source") == "3dep":
        return fetch_3dep(city, cfg, dest, refresh)
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
