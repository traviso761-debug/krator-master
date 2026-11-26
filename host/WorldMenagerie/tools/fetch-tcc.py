#!/usr/bin/env python3
"""Fetch the tree canopy cover over a city's bounds and write it on the city's own grid.

  tools/fetch-tcc.py mthood              the 2021 canopy, on a 30 m grid (or the config's canopy.step)
  tools/fetch-tcc.py portland --year 2016

The source is the NLCD Tree Canopy Cover (TCC), the USDA Forest Service's per-pixel percent of the ground under
tree crowns, at 30 m, served by the MRLC's WCS (www.mrlc.gov/geoserver/mrlc_download/wcs). It is a public US
government product with no restrictions; credit "USDA Forest Service, NLCD Tree Canopy Cover".

The server returns a clip reprojected to latitude and longitude, rotated inside its tile, so the request is padded
past the city's bounds and resampled (bilinearly) onto the city's grid: metres east (x) and south (z) of the config's
origin, as tools/build-osm-city.py has them. The clip goes in data/osm/raw/<city>/ (not committed); the output,
data/cities/<city>-canopy.json, is {x0, z0, step, nx, nz, data}: data is the base64 of nx*nz bytes, row by row from
the north-west, each the percent canopy (0-100), 255 where the survey has none (water is 0, outside the clip 255).
A page names it as "canopy" in its config; the engine reads it (src/engine/stages/00-start.js, ctx.canopy).
"""
import argparse
import base64
import io
import json
import math
import os
import sys
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WCS = ("https://www.mrlc.gov/geoserver/mrlc_download/wcs?service=WCS&version=2.0.1&request=GetCoverage"
       "&coverageId=mrlc_download__nlcd_tcc_conus_{year}_v2021-4&format=image/geotiff"
       "&subsettingCrs=http://www.opengis.net/def/crs/EPSG/0/4326&outputCrs=http://www.opengis.net/def/crs/EPSG/0/4326"
       "&subset=Lat({s},{n})&subset=Long({w},{e})")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("city")
    ap.add_argument("--year", type=int, default=None, help="2011 to 2021 (default: the config's canopy.year, or 2021)")
    ap.add_argument("--step", type=float, default=None, help="grid step in metres (default: the config's canopy.step, or 30)")
    ap.add_argument("--refetch", action="store_true", help="download again even if the clip is cached")
    a = ap.parse_args()
    cfg = json.load(open(os.path.join(ROOT, "data", "cities", a.city + ".json"), encoding="utf-8"))
    K = cfg.get("canopyFetch", {})
    year = a.year or K.get("year", 2021)
    step = a.step or K.get("step", 30)
    S, W, N, E = cfg["bounds"]
    lat0, lon0 = cfg["origin"]
    m_lat, m_lon = 111132.0, 111320.0 * math.cos(math.radians(lat0))

    raw = os.path.join(ROOT, "data", "osm", "raw", a.city)
    os.makedirs(raw, exist_ok=True)
    tif = os.path.join(raw, "tcc-%d.tif" % year)
    if a.refetch or not os.path.exists(tif):
        pad = 0.08
        url = WCS.format(year=year, s=S - pad, n=N + pad, w=W - pad * 1.4, e=E + pad * 1.4)
        req = urllib.request.Request(url, headers={"User-Agent": "world-menagerie-fetch-tcc/1"})
        print("fetching the %d canopy for %s ..." % (year, a.city), file=sys.stderr)
        body = urllib.request.urlopen(req, timeout=300).read()
        if not body.startswith((b"II", b"MM")):
            sys.exit("the server did not send a TIFF: " + body[:300].decode("utf-8", "replace"))
        open(tif, "wb").write(body)

    im = Image.open(tif)
    t = im.tag_v2.get(34264)   # ModelTransformationTag: lon = a*col + d, lat = e*row + h (pixel corners)
    if not t:
        sys.exit("no georeference in " + tif)
    dx, lonL, dy, latT = t[0], t[3], t[5], t[7]
    w, h = im.size
    px = im.tobytes()   # palette indices, which are the percent

    def val(c, r):
        if c < 0 or r < 0 or c >= w or r >= h:
            return None
        v = px[r * w + c]
        return None if v > 100 else v

    def sample(lat, lon):
        fc, fr = (lon - lonL) / dx - 0.5, (lat - latT) / dy - 0.5   # pixel centres
        c0, r0 = math.floor(fc), math.floor(fr)
        u, v = fc - c0, fr - r0
        tot = wt = 0.0
        for cc, rr, k in ((c0, r0, (1 - u) * (1 - v)), (c0 + 1, r0, u * (1 - v)), (c0, r0 + 1, (1 - u) * v), (c0 + 1, r0 + 1, u * v)):
            x = val(cc, rr)
            if x is not None and k > 0:
                tot += x * k
                wt += k
        return 255 if wt < 0.25 else int(round(tot / wt))

    x0, x1 = (W - lon0) * m_lon, (E - lon0) * m_lon
    z0, z1 = -(N - lat0) * m_lat, -(S - lat0) * m_lat
    nx, nz = int(math.ceil((x1 - x0) / step)) + 1, int(math.ceil((z1 - z0) / step)) + 1
    out = bytearray(nx * nz)
    for j in range(nz):
        lat = lat0 - (z0 + j * step) / m_lat
        for i in range(nx):
            out[j * nx + i] = sample(lat, lon0 + (x0 + i * step) / m_lon)
    have = [v for v in out if v != 255]
    if not have:
        sys.exit("the clip does not cover the bounds")
    res = {"attribution": "Tree canopy: USDA Forest Service, NLCD Tree Canopy Cover %d (MRLC)" % year,
           "units": "percent canopy; metres east (x) and south (z) of origin; 255 = no data",
           "year": year, "x0": round(x0, 2), "z0": round(z0, 2), "step": step, "nx": nx, "nz": nz,
           "data": base64.b64encode(bytes(out)).decode("ascii")}
    dst = os.path.join(ROOT, "data", "cities", a.city + "-canopy.json")
    with open(dst, "w", encoding="utf-8", newline="\n") as f:
        json.dump(res, f, separators=(",", ":"))
    print("wrote %s: %dx%d at %g m, mean canopy %.1f%%, %d%% of cells over 50%%, %d without data; %.1f MB" % (
        os.path.relpath(dst, ROOT).replace(os.sep, "/"), nx, nz, step, sum(have) / len(have),
        100 * sum(1 for v in have if v > 50) // len(have), len(out) - len(have), os.path.getsize(dst) / 1e6))


if __name__ == "__main__":
    main()
