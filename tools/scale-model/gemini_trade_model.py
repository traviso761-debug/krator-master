#!/usr/bin/env python3
"""Multimodal Long-Distance Trade & Entrepot Model for Krator 5.1 (branch: gemini-trade).

Reads (without modifying) the 5.1 scale-model rasters, geology.json, region polygons,
ancient-roads-draft.json, gods-road.json, resources-settlements.json, and trade-goods.json.

Implements all four owner-approved design upgrades:
  1. Multimodal 4 km Dijkstra cost graph (Land/Highway/River/Canal/Pass Layer 0 +
     Ship Layer 1 connected only at ports/landings with break-of-bulk transfer costs)
     plus three cargo distance-decay tiers (bulk, medium, compact) and entrepot accounting.
  2. Living ruin communities restored (Span, Blade, Carcosa & Henge [Yusar], Leng +
     Qoold Lheek [Yeti], Stair [Catch Divers], and Noa's Regret [Ring Sea Pirates], which
     captures a share of Ring Sea ship-borne cargoes and fences captured prizes by sea).
  3. Unpinned polities & gateways added (Shumari on Shumar, SW Highland Frogmen above Span,
     Nephtos, Western Spice Isles, Outlands Coyote villages + The Gate & The Sill,
     Spider Lake & Ham-Tsek post, Scyvoi B1-B7, Korona tribes, Dasri/Tabisti/Yuni SE pins),
     and League of Amphitriton split into competing maritime poleis (Ys, Tethys, Pontus,
     Trigon, Kierson).
  4. Books produced domestically across literate societies with Longsong exporting curated
     rare histories/codices (strictly zero to Voth); Jimjam ("Kiln Country") importing
     contact-belt marble up The Cut while exporting alabaster, fine-ceramics, and almanacs;
     Port Goto nudged to shoreline (920,703); Shade kept as northern Dasri oasis market.

Outputs (additive files only):
  - openworld/trade-gemini.json
  - openworld/trade-routes-gemini.jpg
  - openworld/TRADE-GEMINI.md
"""
import base64
import hashlib
import io
import json
import math
import os
import re
import sys
from collections import defaultdict

import numpy as np
from matplotlib.path import Path
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from smodel.page import LEGACY_SHIFT, load as load_page, raster  # noqa: E402


# ---------------------------------------------------------------------------
# 1. Load 5.1 Rasters, Rebaked Geology, Polygons & Base Censuses (Read-Only)
# ---------------------------------------------------------------------------
def load_world(model_data_dir=None, regs_js_path=None, geo_json_path=None):
    D = load_page(model_data_dir) if model_data_dir else load_page()
    OW, OH = D["fullW"], D["fullH"]  # 1821 x 1723 (2 km/px)
    h_img = raster(D, "h")
    lo, hi = D["lo"], D["hi"]
    E2 = lo + ((h_img[..., 0].astype(np.int32) << 8) | h_img[..., 1]) / 65535.0 * (hi - lo)
    W2 = h_img[..., 2] > 127

    tm_img = raster(D, "tm")[..., 0].astype(np.float32) / 255.0 * 110.0 - 50.0
    rain_img = (raster(D, "p")[..., 0].astype(np.float32) / 255.0) ** 2 * 5000.0

    default_geo = os.path.join(ROOT, "kits", "resources", "data", "geology-gemini.json")
    if not os.path.isfile(default_geo):
        default_geo = os.path.join(ROOT, "kits", "resources", "data", "geology.json")
    G = json.load(open(geo_json_path or default_geo, encoding="utf-8"))
    GW, GH = G["grid"]["w"], G["grid"]["h"]  # 911 x 862 (4 km/cell)

    # Subsample 2 km rasters onto 4 km geology grid
    ys = np.linspace(0, OH - 1, GH).round().astype(int)
    xs = np.linspace(0, OW - 1, GW).round().astype(int)
    E = E2[np.ix_(ys, xs)]
    W = W2[np.ix_(ys, xs)]
    TM = tm_img[np.ix_(ys, xs)]
    RAIN = rain_img[np.ix_(ys, xs)]

    layers = {}
    for k, b64 in G["layers"].items():
        b = np.frombuffer(base64.b64decode(b64), dtype=np.uint8)
        layers[k] = np.repeat(b[1::2], b[0::2].astype(np.int32) + 1).reshape(GH, GW)

    rpath = regs_js_path or os.path.join(HERE, "model", "src", "51-region-store.js")
    reg_txt = open(rpath, encoding="utf-8").read()
    regs = json.loads(re.search(r"const defRegs = (\[.*?\]);\r?\n", reg_txt, re.S).group(1))
    wpins_path = os.path.join(ROOT, "openworld", "world-pins-gemini.json")
    wpins = json.load(open(wpins_path, encoding="utf-8")) if os.path.exists(wpins_path) else None
    if wpins and wpins.get("polygons"):
        regs = wpins["polygons"]

    rs = json.load(open(os.path.join(ROOT, "openworld", "resources-settlements.json"), encoding="utf-8"))
    tg = json.load(open(os.path.join(ROOT, "openworld", "trade-goods.json"), encoding="utf-8"))
    ar = json.load(open(os.path.join(ROOT, "openworld", "ancient-roads-draft.json"), encoding="utf-8"))
    gr = json.load(open(os.path.join(ROOT, "openworld", "gods-road.json"), encoding="utf-8"))
    net51_path = os.path.join(ROOT, "openworld", "net51-gemini.json")
    net51 = json.load(open(net51_path, encoding="utf-8")) if os.path.exists(net51_path) else None

    return {
        "D": D, "OW": OW, "OH": OH, "GW": GW, "GH": GH,
        "E2": E2, "W2": W2, "E": E, "W": W, "TM": TM, "RAIN": RAIN,
        "layers": layers, "regs": regs, "rs": rs, "tg": tg, "ar": ar, "gr": gr,
        "net51": net51, "wpins": wpins,
    }


def poly_mask(regs, names_lower, GW, GH, OW, OH):
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)
    mask = np.zeros((GH, GW), dtype=bool)
    yy, xx = np.mgrid[0:GH, 0:GW]
    pts_grid = np.column_stack([xx.ravel(), yy.ravel()])
    for r in regs:
        nm = (r.get("name") or "").strip().lower()
        if nm in names_lower:
            pts = np.array(r["points"], dtype=float)
            pts[:, 0] *= su
            pts[:, 1] *= sv
            p = Path(pts)
            mask |= p.contains_points(pts_grid).reshape(GH, GW)
    return mask


def make_id(tag):
    h = int(hashlib.sha1(tag.encode("utf-8")).hexdigest(), 16)
    s = ""
    for _ in range(9):
        h, r = divmod(h, 36)
        s += "0123456789abcdefghijklmnopqrstuvwxyz"[r]
    return "s" + s


# ---------------------------------------------------------------------------
# 2. Scan Local 4 km Geology Raster Around New/Adjusted Pins
# ---------------------------------------------------------------------------
def scan_site_geo(world, px, py, reach_km=15):
    GW, GH, OW, OH = world["GW"], world["GH"], world["OW"], world["OH"]
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)
    ci, cj = int(round(px * su)), int(round(py * sv))
    rad = max(1, int(round(reach_km / 4.0)))
    j0, j1 = max(0, cj - rad), min(GH, cj + rad + 1)
    i0, i1 = max(0, ci - rad), min(GW, ci + rad + 1)
    yy, xx = np.ogrid[j0:j1, i0:i1]
    disk = (xx - ci) ** 2 + (yy - cj) ** 2 <= rad ** 2
    land = disk & (~world["W"][j0:j1, i0:i1])
    sea = disk & world["W"][j0:j1, i0:i1]
    out = {"sea_cells": int(sea.sum()), "land_cells": int(land.sum())}
    for fam in ("iron", "copper", "gold", "tin", "silver", "rare-earth", "coal",
                "sulfur", "saltpeter", "oil", "gypsum", "halite", "potash",
                "alkali", "nickel", "marble", "zinc", "stone", "clay", "wood"):
        if fam not in world["layers"]:
            out[fam] = 0.0
            out[fam + "_max"] = 0
            continue
        arr = world["layers"][fam][j0:j1, i0:i1]
        vals = arr[land] if land.any() else arr[disk]
        out[fam] = float(vals.mean()) if vals.size else 0.0
        out[fam + "_max"] = int(vals.max()) if vals.size else 0
    out["h_m"] = float(world["E"][cj, ci])
    out["temp_c"] = float(world["TM"][cj, ci])
    out["rain_mm"] = float(world["RAIN"][cj, ci])
    return out


def snap_to_land(world, px, py):
    GW, GH, OW, OH = world["GW"], world["GH"], world["OW"], world["OH"]
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)
    ci, cj = int(round(px * su)), int(round(py * sv))
    if not world["W"][cj, ci]:
        return px, py
    best = None
    for dj in range(-6, 7):
        for di in range(-6, 7):
            nj, ni = cj + dj, ci + di
            if 0 <= nj < GH and 0 <= ni < GW and not world["W"][nj, ni]:
                d = dj * dj + di * di
                if best is None or d < best[0]:
                    best = (d, int(round(ni / su)), int(round(nj / sv)))
    return (best[1], best[2]) if best else (px, py)


# ---------------------------------------------------------------------------
# 3. Build Settlements & Polities Roster (Base + Approved Additions/Overrides)
# ---------------------------------------------------------------------------
LEAGUE_POLIS_MAP = {
    "Ys": "League: Ys",
    "Kierson": "League: Ys",     # Ys colony in East Ring Isles
    "Ybera": "League: Ys",       # Ys colony on Throne
    "Tethis": "League: Tethys",
    "Nereus": "League: Tethys",  # Tethys colony in West Ring Isles
    "Trigon": "League: Trigon",
    "Pontus": "League: Pontus",
}

RUIN_LIVING_OVERRIDES = {
    "Span": {"type": "fort", "population": 1400, "polity": "Realm of Dalab", "reach_km": 15},
    "Blade": {"type": "fort", "population": 500, "polity": "Realm of Dalab", "reach_km": 12},
    "Carcosa": {"type": "inhabited ruin", "population": 3500, "polity": "Yusar (Cybernetics)", "reach_km": 20},
    "Henge": {"type": "inhabited ruin", "population": 1800, "polity": "Yusar (Cybernetics)", "reach_km": 15},
    "Leng": {"type": "inhabited ruin", "population": 600, "polity": "Yeti Kingdom", "reach_km": 15},
    "Stair": {"type": "inhabited ruin", "population": 250, "polity": "Stair Divers (Catch)", "reach_km": 12},
    "Noa's Regret": {"type": "inhabited ruin", "population": 800, "polity": "Ring Sea Pirates", "reach_km": 12},
}

PIN_OVERRIDES = {
    # Imperial metropolises modeled at 120,000 economic population (rendered smaller in-game for playability/graphics load):
    "Iziz": {"population": 120000},
    "Fulcrum": {"population": 120000},
    # Claude ancient-network-9cc3e7 road-map placement precedence:
    "Dalab": {"px": 464, "py": 1112},
    "Roketstad": {"px": 609, "py": 684},
    "Verge": {"px": 1263, "py": 946},
    "Ys": {"px": 789, "py": 738},
    "Talia": {"px": 1072, "py": 936},
    # Owner explicit river-mouth relocation for Port Tobin + pin-stage upgrades (town / inhabited ruin / fort):
    "Port Tobin": {"id": "s06eu913kl", "px": 956, "py": 943, "type": "town", "polity": "Empire of Iziz", "population": 1600},
    "Port Goto": {"px": 920, "py": 703, "type": "town", "polity": "Shell Province", "population": 1100},
    "Port Visas": {"type": "inhabited ruin"},
    "Kierson": {"polity": "League: Ys", "population": 750},
    "Nereus": {"polity": "League: Tethys", "population": 750},
    "Spirladunon": {"type": "town", "population": 2500, "polity": "Talovolci Chiefs"},
    "Tallwalls": {"type": "town", "population": 2500, "polity": "Free Giants (Vrivolci)"},
    "Pinnacle Rock": {"type": "town"},
    "Mav's Refuge": {"type": "town"},
    "Nulab": {"type": "town"},
    "Furrow": {"type": "town", "population": 2500, "polity": "Nomad Country"},
    "Pontus": {"type": "town"},
    "Mantis": {"type": "town"},
    "Serai": {"type": "town"},
    "Locus": {"type": "town"},
    "Mungo": {"type": "town"},
    "Mirabilis": {"type": "town"},
    "Glaive": {"type": "town"},
    "The Gate": {"type": "fort", "population": 800, "polity": "Coyote Kingdom"},
    "Bastion": {"type": "fort", "polity": "Eternal State"},
    "Fort Vaklu": {"type": "fort"},
    "Tzunfort": {"type": "fort"},
    "Strongwall": {"type": "fort"},
    "Veil": {"type": "fort"},
    "Tallhouse": {"type": "fort"},
    "Zey'danin": {"polity": "Vothic Kingdom"},
    "Dhelv": {"polity": "Zeijani"},
    "Longsong": {"type": "town", "polity": "Order of Historians", "population": 1500},
    "Loj Twenny": {"polity": "Tungang Union", "population": 650},
    "Ledge": {"polity": "Tungang Union", "population": 2200},
    "Boatmurder": {"polity": "Dam Basin Salvagers", "population": 900},
}

# Superseded placeholder IDs/names in trade-goods.json replaced by canonical named settlements
SUPERSEDED_TG_NAMES = {"Tabist town (to be named)", "Singing Gjar outpost"}

# Canonical new settlements (user 2026-11-13 export + claude/ancient-network-9cc3e7 precedence + approved gateways + town/fort/inhabited-ruin stages)
NEW_SETTLEMENTS = [
    # Hookfleet (rump Hook navy on SE Throne — pirate & smuggling haven with 50-kil truce waters!)
    {"id": "sgre336q61", "name": "Port Mira", "px": 865, "py": 895, "type": "town", "population": 1800, "polity": "Hookfleet", "reach_km": 18},
    # Andaru (Throne ash-nomads & vent-shoulder villagers; kin of Zeijani, raid colonizers, export plume fungal goods & Ranj)
    {"name": "Ṣunu-Ašru", "px": 892, "py": 852, "type": "town", "population": 1400, "polity": "Andaru", "reach_km": 18},
    {"name": "Šadū-Qarnu", "px": 895, "py": 825, "type": "village", "population": 900, "polity": "Andaru", "reach_km": 15},
    # Frogmen (SW Highlands natives, peace treaty with Dalab)
    {"id": "sks1pzfrfg", "name": "Krrmt", "px": 643, "py": 1023, "type": "village", "population": 800, "polity": "Frogmen", "reach_km": 15},
    {"id": "sfuf85wred", "name": "Jrrmiah", "px": 557, "py": 959, "type": "village", "population": 650, "polity": "Frogmen", "reach_km": 15},
    # Vothic Kingdom additions (Driyan on Claude's ancient-network at 705,1129; Azoth; Sethas inland town; Tzinguard naval fort)
    {"id": "sxvb4k4024", "name": "Driyan", "px": 705, "py": 1129, "type": "city", "population": 8500, "polity": "Vothic Kingdom", "reach_km": 20},
    {"id": "s5zcvs194o", "name": "Azoth", "px": 651, "py": 1160, "type": "city", "population": 7500, "polity": "Vothic Kingdom", "reach_km": 20},
    {"id": "skwjynoxko", "name": "Sethas", "px": 688, "py": 1141, "type": "town", "population": 1400, "polity": "Vothic Kingdom", "reach_km": 18},
    {"id": "sziebkh7y3", "name": "Tzinguard", "px": 773, "py": 922, "type": "fort", "population": 900, "polity": "Vothic Kingdom", "reach_km": 14},
    # Realm of Dalab additions (Dayshun former Shumar city; Rokwal; Nufelds; Dapor = Dalab's Ostia port town on Lake Nazar/Shim!)
    {"id": "s5xupuwq1h", "name": "Dayshun", "px": 608, "py": 1168, "type": "city", "population": 8000, "polity": "Realm of Dalab", "reach_km": 20},
    {"id": "sgnwyt5n59", "name": "Rokwal", "px": 413, "py": 1088, "type": "village", "population": 900, "polity": "Realm of Dalab", "reach_km": 15},
    {"id": "sdfnky6vm8", "name": "Nufelds", "px": 442, "py": 1053, "type": "village", "population": 1100, "polity": "Realm of Dalab", "reach_km": 15},
    {"id": "svvu4ssvzc", "name": "Dapor", "px": 485, "py": 1105, "type": "town", "population": 1800, "polity": "Realm of Dalab", "reach_km": 18},
    # Shumari on Shumar plateau (Amaro on Claude's ancient-network at 734,1182; Urundashi)
    {"id": "ssgsv5zbd2", "name": "Amaro", "px": 734, "py": 1182, "type": "town", "population": 6500, "polity": "Shumari", "reach_km": 20},
    {"id": "srbp1bvh1r", "name": "Urundashi", "px": 779, "py": 1153, "type": "village", "population": 1100, "polity": "Shumari", "reach_km": 15},
    # Ring Sea Pirates new coves (Steampits Boiling Bay & East Ring Isles Shanty)
    {"id": "sskj0rbfy4", "name": "Boiling Bay", "px": 866, "py": 723, "type": "outpost", "population": 550, "polity": "Ring Sea Pirates", "reach_km": 12},
    {"id": "skjtxiqwjk", "name": "Shanty", "px": 975, "py": 846, "type": "outpost", "population": 600, "polity": "Ring Sea Pirates", "reach_km": 12},
    # Empire of Iziz additions (+ Daridel: Talovolci settlement under Iziz sovereignty; Marr = smuggler-friendly port)
    {"id": "sxmeztkqg7", "name": "Marr", "px": 926, "py": 1017, "type": "city", "population": 9000, "polity": "Empire of Iziz", "reach_km": 20},
    {"id": "si23cxlc1r", "name": "Atton", "px": 1008, "py": 972, "type": "village", "population": 1200, "polity": "Empire of Iziz", "reach_km": 15},
    {"id": "slvxyhg4o4", "name": "Gioli", "px": 983, "py": 1023, "type": "village", "population": 1100, "polity": "Empire of Iziz", "reach_km": 15},
    {"id": "sr4lzat7j3", "name": "Seto", "px": 930, "py": 922, "type": "village", "population": 1000, "polity": "Empire of Iziz", "reach_km": 15},
    {"id": "sory54g10c", "name": "Daridel", "px": 937, "py": 1068, "type": "town", "population": 1400, "polity": "Empire of Iziz", "reach_km": 16},
    # Independent Jabal Shiekdom (Bowl) & Independent Tabisti Cities + Cline (Dasri V4)
    {"id": "sa5o6dvjdv", "name": "Jabal", "px": 1225, "py": 1149, "type": "city", "population": 15000, "polity": "Jabal Shiekdom", "reach_km": 22},
    {"id": "sn98ob5duu", "name": "Sfenops", "px": 1282, "py": 663, "type": "city", "population": 10000, "polity": "Tabisti: Sfenops", "reach_km": 20},
    {"id": "sdi0nzz51a", "name": "Liikofi", "px": 1316, "py": 797, "type": "city", "population": 10000, "polity": "Tabisti: Liikofi", "reach_km": 20},
    {"id": "sr666p3u3p", "name": "Cline", "px": 1225, "py": 646, "type": "village", "population": 750, "polity": "Nomad Country", "reach_km": 15},
    # Tiguantin (Iziz tributary on the Eastern Highlands & Lesser Throne; capital town Guari at 1095,911)
    {"name": "Guari", "px": 1095, "py": 911, "type": "town", "population": 5500, "polity": "Tiguantin", "reach_km": 20},
    # Xanadu Sultanate additions (Kirstabal plantation town, Thalaba Godshearth expedition base & Xanadu Goldfields on lode:xanadu-gold)
    {"id": "sl758m2396", "name": "Kirstabal", "px": 989, "py": 1600, "type": "town", "population": 2200, "polity": "Xanadu Sultanate", "reach_km": 18},
    {"id": "shvo49k0y2", "name": "Thalaba", "px": 825, "py": 1481, "type": "village", "population": 750, "polity": "Xanadu Sultanate", "reach_km": 15},
    {"name": "Xanadu Goldfields", "px": 911, "py": 1665, "type": "village", "population": 950, "polity": "Xanadu Sultanate", "reach_km": 18},
    # Eternal State additions (Tone, Sheritu, & Palewharf lakeshore barge village on western Jimjam's Lake)
    {"id": "sgzl17vqfx", "name": "Tone", "px": 368, "py": 776, "type": "village", "population": 1100, "polity": "Eternal State", "reach_km": 15},
    {"id": "s5qv4dxo1j", "name": "Sheritu", "px": 384, "py": 666, "type": "village", "population": 950, "polity": "Eternal State", "reach_km": 15},
    {"name": "Palewharf", "px": 565, "py": 604, "type": "village", "population": 850, "polity": "Eternal State", "reach_km": 15},
    # Kimr sacred arcology & Pleistocene megafauna market in the Labyrinth (Kimr polygon rmwelrhij6khp)
    {"id": "s3zzt8dujb", "name": "Hall of Heroes", "px": 365, "py": 1474, "type": "inhabited ruin", "population": 1600, "polity": "Kimr", "reach_km": 22},
    # Iron Republic addition
    {"id": "sgxc1s0gyh", "name": "Stahlborn", "px": 627, "py": 868, "type": "town", "population": 1800, "polity": "Iron Republic", "reach_km": 18},
    # Silkhead (gateway town to Korona, K1) & Skywatch (Jimjam royal observatory town)
    {"id": "slm5ul15lp", "name": "Silkhead", "px": 932, "py": 425, "type": "town", "population": 4500, "polity": "Silkhead (Korona Gateway)", "reach_km": 18},
    {"id": "s8921htcjy", "name": "Skywatch", "px": 776, "py": 470, "type": "town", "population": 1400, "polity": "Jimjam", "reach_km": 16},
    # Hykkousoi League colonies & nearshore villages (Ybera -> Ys; Nephtos -> Tethys; Trigon lakeshore; Pontus adjacent isles)
    {"id": "scrnfzyanu", "name": "Ybera", "px": 898, "py": 787, "type": "town", "population": 1350, "polity": "League: Ys", "reach_km": 16},
    {"name": "Nephtos", "px": 919, "py": 762, "type": "town", "population": 1250, "polity": "League: Tethys", "reach_km": 16},
    {"name": "Limnaia", "px": 736, "py": 712, "type": "village", "population": 700, "polity": "League: Trigon", "reach_km": 15},
    {"name": "Kyra Isle", "px": 726, "py": 820, "type": "village", "population": 450, "polity": "League: Pontus", "reach_km": 12},
    {"name": "Skopelos Isle", "px": 724, "py": 847, "type": "village", "population": 450, "polity": "League: Pontus", "reach_km": 12},
    # Yeti capital at frozen lake
    {"name": "Qoold Lheek", "px": 410, "py": 506, "type": "town", "population": 2200, "polity": "Yeti Kingdom", "reach_km": 20},
    # West Ring Islanders (two Hikau villages on distinct western islands: Taikoro on N West Isle, Kautono on S West Isle off Almua)
    {"id": "syen8wxax5", "name": "Taikoro", "px": 752, "py": 781, "type": "village", "population": 850, "polity": "West Ring Islanders", "reach_km": 15},
    {"id": "szru86us3f", "name": "Kautono", "px": 749, "py": 894, "type": "village", "population": 750, "polity": "West Ring Islanders", "reach_km": 15},
    # Outlands Coyote nodes & Great Chasm Sill fort
    {"name": "Coyote Lake Village", "px": 1220, "py": 564, "type": "village", "population": 500, "polity": "Coyote Kingdom", "reach_km": 15},
    {"name": "Gate Tarn Mires", "px": 1544, "py": 474, "type": "village", "population": 900, "polity": "Coyote Kingdom", "reach_km": 18},
    {"name": "The Sill (Sam-Lok)", "px": 1697, "py": 1028, "type": "fort", "population": 450, "polity": "Coyote Kingdom", "reach_km": 14},
    {"name": "Peak Coyote Plume-Camp", "px": 1654, "py": 701, "type": "town", "population": 1400, "polity": "Coyote Kingdom", "reach_km": 20},
    # Spider Lake & Arachnoid River receiving post
    {"name": "Spider Lake Weirs", "px": 1288, "py": 220, "type": "town", "population": 1100, "polity": "Spider Lake Guilds", "reach_km": 18},
    {"name": "Ham-Tsek Silk Post", "px": 1055, "py": 219, "type": "outpost", "population": 350, "polity": "Spider Lake Guilds", "reach_km": 12},
    # Scyvoi Baelu seats (counted once across seasonal bands per TRADE-SCOPE s11)
    {"name": "Baelu North (B4)", "px": 703, "py": 733, "type": "fort", "population": 800, "polity": "Scyvoi", "reach_km": 15},
    {"name": "Baelu Mid (B3)", "px": 683, "py": 802, "type": "fort", "population": 800, "polity": "Scyvoi", "reach_km": 15},
    {"name": "Baelu South (B1)", "px": 651, "py": 857, "type": "fort", "population": 800, "polity": "Scyvoi", "reach_km": 15},
    # Korona Tribes interior hoar-table & crest villages (Silkhead K1 is now an independent gateway town above)
    {"name": "Hoar-Table Village (K7)", "px": 1033, "py": 354, "type": "village", "population": 700, "polity": "Korona Tribes", "reach_km": 15},
    {"name": "Sing-Ham Crest (K2)", "px": 909, "py": 499, "type": "village", "population": 850, "polity": "Korona Tribes", "reach_km": 15},
    {"name": "East Korona Lake (E1)", "px": 1143, "py": 596, "type": "village", "population": 750, "polity": "Korona Tribes", "reach_km": 15},
    # Dasri salt works & Rifar al-Dhahab (Bowl Salt Works lies inside Jabal Shiekdom polygon rmwelppnigssz)
    {"name": "Catch Salt Works", "px": 1080, "py": 1428, "type": "outpost", "population": 350, "polity": "Nomad Country", "reach_km": 15},
    {"name": "Bowl Salt Works", "px": 1169, "py": 1150, "type": "outpost", "population": 400, "polity": "Jabal Shiekdom", "reach_km": 15},
    {"name": "Rifar al-Dhahab", "px": 1333, "py": 886, "type": "village", "population": 600, "polity": "Nomad Country", "reach_km": 15},
    # Yuni SE Frontier (TRADE-SCOPE s2.5c, s9)
    {"name": "Sista Riba Village", "px": 1311, "py": 982, "type": "village", "population": 600, "polity": "Yuni Emirate", "reach_km": 15},
    {"name": "Ostrukh-on-Water", "px": 1516, "py": 1471, "type": "town", "population": 1800, "polity": "Yuni Emirate", "reach_km": 20},
    {"name": "Spindle Fan", "px": 1561, "py": 1140, "type": "village", "population": 700, "polity": "Yuni Emirate", "reach_km": 15},
    {"name": "Siphon Maar Works", "px": 1678, "py": 1542, "type": "outpost", "population": 400, "polity": "Yuni Emirate", "reach_km": 15},
    # Xanadu Opal Valley, White Gills & High Rift Quartz
    {"name": "Opal Valley Mines", "px": 1038, "py": 1662, "type": "village", "population": 850, "polity": "Xanadu Sultanate", "reach_km": 15},
    {"name": "White Gills Hermitage", "px": 1035, "py": 1535, "type": "outpost", "population": 120, "polity": "Order of Historians", "reach_km": 12},
    {"name": "Singing Gjar Quartz", "px": 1572, "py": 1643, "type": "outpost", "population": 200, "polity": "Order of Historians", "reach_km": 12},
    # Painted Men canyon cliff-hold (TRADE-SCOPE s7.6)
    {"name": "Painted Canyon Cliff-Hold", "px": 1055, "py": 622, "type": "village", "population": 650, "polity": "Painted Men", "reach_km": 15},
    # Parabola solar-furnace Bowl inhabited ruin (ANCIENT-NETWORK.md s8.11) + Catch & Twins Oasis/Pass Stops
    {"name": "Parabola", "px": 970, "py": 1186, "type": "inhabited ruin", "population": 450, "polity": "Empire of Iziz", "reach_km": 14},
    {"name": "Bab al-Hawa (Godsgate)", "px": 1028, "py": 1246, "type": "outpost", "population": 320, "polity": "Catch Oasis Stations", "reach_km": 14},
    {"name": "Kolli Oasis", "px": 1058, "py": 1367, "type": "village", "population": 550, "polity": "Catch Oasis Stations", "reach_km": 15},
    {"name": "Arfwai Oasis", "px": 1090, "py": 1387, "type": "village", "population": 650, "polity": "Catch Oasis Stations", "reach_km": 15},
    {"name": "The Twins", "px": 1042, "py": 1525, "type": "fort", "population": 420, "polity": "Twins Pass Wardenry", "reach_km": 14},
    # Abstract exterior maritime trade regions (shipped exclusively into Farport's Factory Quarter and disseminated from there)
    {"name": "Ria Valley (Sea Trade)", "px": 520, "py": 185, "type": "abstract_region", "population": 28000, "polity": "Ria Valley", "reach_km": 20, "abstract_region": True},
    {"name": "The Crook (Sea Trade)", "px": 120, "py": 595, "type": "abstract_region", "population": 22000, "polity": "The Crook", "reach_km": 20, "abstract_region": True},
]


def build_settlements(world):
    tg_setts = world["tg"]["settlements"]
    rs_by_name = {s["name"]: s for s in world["rs"]["settlements"]}
    setts = {}

    # 1. Existing living settlements from trade-goods.json
    for sid, s in tg_setts.items():
        if s["name"] in SUPERSEDED_TG_NAMES:
            continue
        rec = dict(s)
        rec["id"] = sid
        rec["supply"] = dict(s.get("supply", {}))
        rec["demand"] = dict(s.get("demand", {}))
        nm = rec["name"]
        if nm in LEAGUE_POLIS_MAP:
            rec["polity"] = LEAGUE_POLIS_MAP[nm]
        if nm in PIN_OVERRIDES:
            old_pop = max(rec["population"], 1)
            ov = PIN_OVERRIDES[nm]
            new_pop = ov.get("population", old_pop)
            if new_pop != old_pop:
                scale = new_pop / old_pop
                for k in list(rec["demand"].keys()):
                    rec["demand"][k] *= scale
                if nm in ("Iziz", "Fulcrum"):
                    # Modeled as having the supply & demand of 120k people (6x 20k rendered scale);
                    # cap fixed-site vault/arsenal constants (relics, arms) at 2.5x and keep bedrock precious-metal lodes at 1.0x.
                    FIXED_VAULT_KEYS = {"relics", "arms"}
                    BEDROCK_PRECIOUS_KEYS = {"gold", "silver"}
                    for k in list(rec["supply"].keys()):
                        if k in BEDROCK_PRECIOUS_KEYS:
                            continue
                        rec["supply"][k] *= (2.5 if k in FIXED_VAULT_KEYS else scale)
                else:
                    for k in ("plaid", "saltpeter", "tin", "nickel"):
                        if k in rec["supply"]:
                            rec["supply"][k] *= math.sqrt(scale)
            rec.update(ov)
            sid = rec["id"]
        rec["px"], rec["py"] = snap_to_land(world, rec["px"], rec["py"])
        rec["geo_scan"] = scan_site_geo(world, rec["px"], rec["py"], rec.get("reach_km", 15))
        setts[sid] = rec

    # 2. Restored living communities on ruin / ruined-arcology pins
    for nm, ov in RUIN_LIVING_OVERRIDES.items():
        if any(v["name"] == nm for v in setts.values()):
            continue
        rs_s = rs_by_name.get(nm)
        sid = rs_s["id"] if rs_s else make_id("ruin:" + nm)
        px, py = rs_s["px"] if rs_s else [896, 866]
        px, py = snap_to_land(world, px, py)
        setts[sid] = {
            "id": sid, "name": nm, "px": px, "py": py,
            "type": ov["type"], "population": ov["population"],
            "polity": ov["polity"], "reach_km": ov["reach_km"],
            "supply": {}, "demand": {},
            "geo_scan": scan_site_geo(world, px, py, ov["reach_km"]),
            "source_note": "restored living community on ruin pin",
        }

    # 3. Newly added settlements, gateways & abstract maritime regions
    for ns in NEW_SETTLEMENTS:
        if any(v["name"] == ns["name"] for v in setts.values()):
            continue
        sid = ns.get("id") or make_id("gemini:" + ns["name"])
        px, py = snap_to_land(world, ns["px"], ns["py"])
        setts[sid] = {
            "id": sid, "name": ns["name"], "px": px, "py": py,
            "type": ns["type"], "population": ns["population"],
            "polity": ns["polity"], "reach_km": ns["reach_km"],
            "abstract_region": bool(ns.get("abstract_region", False)),
            "supply": {}, "demand": {},
            "geo_scan": scan_site_geo(world, px, py, ns["reach_km"]),
            "source_note": "abstract exterior maritime trade region" if ns.get("abstract_region") else "added in gemini-trade",
        }

    return setts


# ---------------------------------------------------------------------------
# 4. Complete 94-Good Catalog & Supply/Demand Synthesis
# ---------------------------------------------------------------------------
GOODS = [
    # Metals & Salvage (10)
    {"id": "iron", "label": "iron & steel", "class": "metal", "tier": "bulk", "unit": "t", "note": "mined iron ore & smelted bar; heavy bulk cargo feeding weapons, armor, firearms & tools"},
    {"id": "copper", "label": "copper", "class": "metal", "tier": "medium", "unit": "t", "note": "bronze base, roofing, wire, coin & distillery pot-stills"},
    {"id": "tin", "label": "tin", "class": "metal", "tier": "compact", "unit": "t", "note": "scarce alloying half of bronze; carries long range"},
    {"id": "bronze", "label": "bronze", "class": "metal", "tier": "medium", "unit": "t", "note": "cast fittings, bells, naval cannon, armor/weapon mounts & Eternian window tracery"},
    {"id": "zinc", "label": "zinc & brass spelter", "class": "metal", "tier": "medium", "unit": "t", "note": "sphalerite ore & brass spelter for Roketstad optics, firearm locks, furniture mounts & instruments"},
    {"id": "nickel", "label": "nickel & alloy steel", "class": "metal", "tier": "medium", "unit": "t", "note": "high-strength alloy steel for cuirass armor plate, firearm barrels & Forgemaster mechs"},
    {"id": "magnets", "label": "Compass Hills magnetized lodestone & permanent magnets", "class": "metal", "tier": "compact", "unit": "t", "note": "iron-rich Compass Hills ores magnetized by a central Ancient installation; enters the crater via the Spider Silk / Korona route for maritime compasses, Geomancer dynamos & high-tech servos"},
    {"id": "rare-earth", "label": "rare earths", "class": "metal", "tier": "compact", "unit": "t", "note": "extracted only by Yuni, Eternia, Order & Tungangs"},
    {"id": "gold", "label": "gold", "class": "precious", "tier": "compact", "unit": "kg", "note": "Vale of Xanadu bonanza bullion, coin & gilt leaf"},
    {"id": "silver", "label": "silver", "class": "precious", "tier": "compact", "unit": "kg", "note": "trade coinage, Republic Mint bullion, Heirs' rank plate"},
    {"id": "scrap", "label": "Ancient scrap metal", "class": "salvage", "tier": "bulk", "unit": "t", "note": "ruin & ship-graveyard structural steel"},
    # Fuels, Glass Feedstock, Alkali, Gunpowder Minerals & Stone (15)
    {"id": "coal", "label": "coal", "class": "fuel", "tier": "bulk", "unit": "t", "note": "smelting, glasshouse, distillery & arsenal fuel (Gunpowder & Steel Triangle leg 1); overwhelmingly waterborne"},
    {"id": "peat", "label": "bog peat & malting turf", "class": "fuel", "tier": "bulk", "unit": "t", "note": "Footfall / Iron Republic & northern highland blanket-bog peat fuel and essential malting-kiln smoke input for scotch"},
    {"id": "oil", "label": "crude oil & petrol", "class": "fuel", "tier": "bulk", "unit": "t", "note": "extracted by Yuni Geomancers (incl. Locus), Eternia & Order"},
    {"id": "salt", "label": "salt", "class": "mineral", "tier": "bulk", "unit": "t", "note": "dietary & curing staple; Catch/Bowl supply Xanadu"},
    {"id": "sulfur", "label": "volcanic & fumarole sulfur", "class": "mineral", "tier": "medium", "unit": "t", "note": "Gunpowder & Steel Triangle leg 2 + East Abyss rubber vulcanization: Kautoa, Throne & Godshearth sulfur"},
    {"id": "saltpeter", "label": "playa & guano-tube saltpeter", "class": "mineral", "tier": "medium", "unit": "t", "note": "Gunpowder & Steel Triangle leg 3: Bowl/Catch playas, Tallwalls Da-Holwey guano tubes & East Abyss pans"},
    {"id": "potash", "label": "potash (fertilizer, powder & forest-glass salt)", "class": "mineral", "tier": "bulk", "unit": "t", "note": "Bowl, Catch & dry-basin sylvite/potash for crop fields, black-powder conversion, forest glass & soft soap"},
    {"id": "alkali", "label": "Catch alkali salts (soda, borax & lithium)", "class": "mineral", "tier": "medium", "unit": "t", "note": "caustic Catch soda-lake natron, borates & lithium for soda-lime/borosilicate glassmaking, energy-cell rebuilding, paper delignification, glazes & bullion flux"},
    {"id": "silica-sand", "label": "quartz sand, vein-quartz & melt-glass cullet", "class": "mineral", "tier": "bulk", "unit": "t", "note": "Glass Production Chain leg 1: low-iron washed quartz sand, Singing Gjar/Korona vein-quartz & Ancients' Valley melt-glass cullet"},
    {"id": "glass", "label": "clear crown glass, hollowware & bottles", "class": "craft", "tier": "medium", "unit": "t", "note": "Glass Production Chain leg 2 (silica-sand + alkali/potash + coal/peat): window glass, Geomancer bulbs & bottles for champagne, wine & fine spirits"},
    {"id": "marble", "label": "carved contact-belt marble", "class": "stone", "tier": "bulk", "unit": "t", "note": "NW & SW Bay contact-marble belts shipped to Jimjam & courts"},
    {"id": "alabaster", "label": "translucent alabaster", "class": "stone", "tier": "medium", "unit": "t", "note": "Jimjam gypsum-alabaster barged across Jimjam's Lake to Palewharf for Eternian palace windows"},
    {"id": "brick", "label": "Jimjam silt brick", "class": "bulk", "tier": "bulk", "unit": "unit", "note": "red & yellow flood-silt brick; short-haul & Cut masonry"},
    {"id": "machine-wax", "label": "Woolly Siphon machine-wax", "class": "mineral", "tier": "medium", "unit": "t", "note": "Yuni SE Siphon Pit high-temp lubricant for firearm locks, lifts, crawlers & mechs"},
    {"id": "pitch-tar", "label": "hull pitch, tar-black & prismgum", "class": "mineral", "tier": "medium", "unit": "t", "note": "Naval Stores Chain leg 2: hyperjungle prismgum, Ring Isles tar-black bitumen & Yeti birch-tar"},
    # Timber, Shipbuilding Chain, East Abyss Rubber, Fibres, Beasts & Staples (14)
    {"id": "timber", "label": "structural, cask & joinery timber", "class": "bulk", "tier": "bulk", "unit": "t", "note": "construction, cooperage cask & furniture timber shipped regionally to treeless basins"},
    {"id": "ship-timber", "label": "naval spar & hull timber", "class": "bulk", "tier": "bulk", "unit": "t", "note": "Naval Stores Chain leg 1: tall straight tier-cedar, column-kauri & sky-meranti from Spirladunon, Kautoa, Shell, Nephtos & Mav's Refuge"},
    {"id": "ship-hulls", "label": "commissioned sea-going hulls", "class": "craft", "tier": "medium", "unit": "unit", "note": "finished hulls & careened ships from Nephtos, Almua/Shim, Kautoa (incl. Beast Rider fleet), Port Mira & Farport"},
    {"id": "cordage", "label": "salt-proof rigging & Golden Cable", "class": "craft", "tier": "medium", "unit": "t", "note": "Naval Stores Chain leg 3: Spider Lake 1.3 GPa Golden Cable, Cliff-Lung Scinropos, Ring Isles rope-banana & ramie"},
    {"id": "rubber", "label": "East Abyss rubber scale-tree latex", "class": "crop", "tier": "medium", "unit": "t", "note": "coagulated & sulfur-vulcanized latex tapped from East Abyss Carboniferous rubber scale-trees (Sfenops, Liikofi, Locus, Mungo, Reed) for gaskets, insulation, oilskins & bottle stoppers"},
    {"id": "cotton", "label": "cotton, sea-linen flax & ramie", "class": "crop", "tier": "medium", "unit": "t", "note": "woven cloth feedstock & salt-proof flax/ramie/cotton sailcloth canvas"},
    {"id": "silk", "label": "silk, gossamer & beadcone-silk", "class": "luxury", "tier": "compact", "unit": "t", "note": "mulberry/lotus silk, Spider Lake Gossamer & SW Highland beadcone-silk feeding luxury clothes & upholstery"},
    {"id": "qiviut", "label": "Yeti qiviut & Cloud-Fleece", "class": "luxury", "tier": "compact", "unit": "t", "note": "musk-ox qiviut & Spider Lake waterproof thermal felt for high-pass parkas"},
    {"id": "cushion-wool", "label": "Tiguantin cushion-puna wool", "class": "specialty", "tier": "medium", "unit": "t", "note": "Eastern Highlands cushion-bog & woolback puna fleece exported by Tiguantin"},
    {"id": "plaid", "label": "Talovolci checked plaid", "class": "specialty", "tier": "medium", "unit": "unit", "note": "three-dye highland wool brought down Cliff-Lung stairs"},
    {"id": "dye-tropical", "label": "tropical & murex dyes", "class": "crop", "tier": "compact", "unit": "t", "note": "Shim Blitrit purple, Ys murex, Nephtos indigo & annatto"},
    {"id": "dye-temperate", "label": "temperate & lichen dyes", "class": "crop", "tier": "compact", "unit": "t", "note": "Talovolci woad/madder, Korona hoar-table lichens, Red Gills pigment"},
    {"id": "mounts", "label": "mounts, draught beasts & hides", "class": "beast", "tier": "medium", "unit": "head", "note": "camels, pack-lizards, beetles, flyers, Scyvoi salamanders, Coyote ostriches"},
    {"id": "food", "label": "grain, paddy rice, salt-rice & dried fish", "class": "staple", "tier": "bulk", "unit": "t", "note": "dietary staple & malting/brewing/distilling grain (beer, whiskey, scotch, sake)"},
    # Fermented Beverages, Distilled Spirits & High-Tier Luxury Bottlings (10)
    {"id": "beer", "label": "malted grain beer & hopped ale", "class": "staple", "tier": "medium", "unit": "t", "note": "all grain + fuel + wooden casks -> regional casked beer & strong ale shipped to ports, mines & oases"},
    {"id": "sake", "label": "paddy-rice & Abyssal salt-rice sake", "class": "specialty", "tier": "medium", "unit": "t", "note": "rice / East Abyss salt-rice + ceramic/glass flasks + fuel -> dry Abyssal salt-rice sake (Sfenops, Liikofi, Locus, Mungo) & Eternian/Vale rice sake"},
    {"id": "wine", "label": "Eternian & hillside vintage wine", "class": "luxury", "tier": "medium", "unit": "t", "note": "grapes + casks/glass bottles -> Eternal State nwlowlands vintage wine ('famed for their wine') & Dalab/Dilihan/Trigon hillside wines"},
    {"id": "champagne", "label": "Eternian sparkling champagne", "class": "luxury", "tier": "compact", "unit": "t", "note": "high-tier luxury: Eternian wine grapes + imported cane sugar (first-step tirage dosage) + heavy pressure-proof glass bottles & rubber stoppers"},
    {"id": "rum", "label": "cane-sugar & molasses rum", "class": "craft", "tier": "medium", "unit": "t", "note": "sugar cane + still fuel + casks/glass bottles -> Ring Isles, Shim, Voth, Kautoa & Spice Isles naval & tavern rum"},
    {"id": "ranjrum", "label": "Throne spiced Ranj-rum", "class": "luxury", "tier": "compact", "unit": "t", "note": "high-tier luxury: sugar cane + Throne Ranj (isle-spice infused at first step) + glass bottles + fuel -> distilled by Throne powers (Port Mira, Ybera, Zey'danin, Nephtos, Andaru)"},
    {"id": "whiskey", "label": "distilled grain whiskey", "class": "craft", "tier": "medium", "unit": "t", "note": "grain + still fuel + charred oak casks & glass bottles -> heartland grain whiskey from Dalab, Iziz, Ledge, Jimjam & Tallwalls"},
    {"id": "scotch", "label": "peat-smoked single-malt scotch", "class": "luxury", "tier": "compact", "unit": "t", "note": "high-tier luxury: malted grain + bog peat (kiln-smoked at first step) + glass bottles -> Iron Republic Footfall peat-bog distilleries (Stahlborn, Roketstad, Cascade) & Ardent"},
    {"id": "tequila", "label": "cultivated blue-agave tequila", "class": "craft", "tier": "compact", "unit": "t", "note": "cultivated warm-bench agave + oven fuel + glass bottles -> distilled in Dalab chaparral, Shumari, dry Izani benches & Driyan"},
    {"id": "mezcal", "label": "wild desert-agave mezcal", "class": "luxury", "tier": "compact", "unit": "t", "note": "pit-roasted wild desert agave + fuel + glass/glazed-ceramic flasks -> signature Dasri spirit led by Jabal Shiekdom (Jabal) & Nomad/Catch oases"},
    # Spices, Stimulants, Cigars, Opium, Resins & Botanicals (18)
    {"id": "spice-tropical", "label": "tropical spice (clove, citron)", "class": "crop", "tier": "compact", "unit": "t", "note": "East & West Ring Isles and Throne plantations"},
    {"id": "isle-spice", "label": "West Spice Isles & Throne Ranj", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Ranj & isle spice supplied by Port Mira, Ybera, West Ring Islanders (Taikoro & Kautono), Temora, Zey'danin & Andaru (also feeds ranjrum)"},
    {"id": "spice-highland", "label": "Vale & Oidong saffron", "class": "crop", "tier": "compact", "unit": "t", "note": "native Vale of Xanadu & Oidong monastery saffron carried north across The Twins & Catch"},
    {"id": "cacao", "label": "cacao", "class": "crop", "tier": "compact", "unit": "t", "note": "native Vale of Xanadu cacao (Erehwon, Qiblai, Theodiga, Kirstabal, Strongbow) plus minor transplanted Kautoan groves"},
    {"id": "coffee", "label": "coffee", "class": "crop", "tier": "compact", "unit": "t", "note": "Throne converted estates, Voth & foothill coffee"},
    {"id": "tea", "label": "mist tea & ivan-chai", "class": "crop", "tier": "compact", "unit": "t", "note": "Oidong/cloud-forest mist tea & northern ivan-chai"},
    {"id": "sugar", "label": "cane sugar & manna syrup", "class": "crop", "tier": "medium", "unit": "t", "note": "Ring Isles, Shim & Throne cane sugar + Dasri tamarisk-manna (feeds rum, ranjrum & Eternian champagne)"},
    {"id": "tobacco", "label": "inner-crater cured tobacco leaf", "class": "crop", "tier": "compact", "unit": "t", "note": "native inner-crater leaf (Voth, Nephtos, League, Kautoa, Port Mira, Marr/Iziz) feeding pipe trade & cigar manufactories"},
    {"id": "cigars", "label": "hand-rolled inner-crater cigars", "class": "luxury", "tier": "compact", "unit": "t", "note": "cured inner-crater tobacco leaf + cedar/Abyssal-lacquered humidor boxes -> rolled in Voth, Nephtos, Marr, Port Mira, Kautoa & Ys"},
    {"id": "hashish", "label": "Dalab hashish & pressed hemp-resin", "class": "crop", "tier": "compact", "unit": "t", "note": "pressed SW Lowlands hemp-resin native to Realm of Dalab (Dalab, Dapor, Dayshun, Nufelds, Rokwal, Span) and transplanted to the Rift Rim (Ledge & Nulab)"},
    {"id": "opium", "label": "Vale of Xanadu sky-poppy opium", "class": "luxury", "tier": "compact", "unit": "t", "note": "scored sky-poppy capsule latex refined in the Vale of Xanadu (Erehwon, Qiblai, Kirstabal, Theodiga, Strongbow) plus minor Oidong surgical physic"},
    {"id": "incense", "label": "swamp copal, myrrh & brush-oil incense", "class": "crop", "tier": "compact", "unit": "t", "note": "East Abyss Carboniferous swamp copal (Sfenops & Liikofi), Bowl myrrh, Outlands comb-mast & SW brush-oil"},
    {"id": "abyss-lac", "label": "East Abyss lac, scale-shellac & swamp-amber", "class": "specialty", "tier": "compact", "unit": "t", "note": "unique East Abyss scale-insect shellac & cordaite swamp-amber from Sfenops & Liikofi for marine varnish, furniture lacquer & wire insulation"},
    {"id": "medicine", "label": "medicines & anti-scurvy stores", "class": "crop", "tier": "compact", "unit": "t", "note": "rimdew, ginseng, Hykkousoi gill-salve, pyre-thistle & ember-plum scurvy powder"},
    {"id": "wormwick", "label": "wormwick parasitic fungus medicine", "class": "specialty", "tier": "compact", "unit": "kg", "note": "high-altitude parasitic caterpillar-fungus medicine worth its weight in silver, exported by Tiguantin (Guari) & Fridon"},
    {"id": "lung-salt", "label": "White Gills lung-salt & goldroot", "class": "specialty", "tier": "compact", "unit": "t", "note": "oxygen-carrying Lag Solt & Yeti goldroot enabling >5 km thin-air passes"},
    {"id": "reagent", "label": "alchemical reagents & snow-lotus", "class": "crop", "tier": "compact", "unit": "t", "note": "camphor, sky-poppy seed/tincture, tower honey & Korona hoar-table snow-lotus"},
    {"id": "fungal", "label": "Zeijani & Andaru fungal goods & distillates", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Dhelv cavern-grown fungal spirits & Andaru Throne ash-tube mycological cultures"},
    # Finished Apparel, Joinery, Personal Arms & Armor (5)
    {"id": "clothes", "label": "tailored clothes, silk robes & oilskins", "class": "craft", "tier": "compact", "unit": "t", "note": "woven, dyed & tailored garments (cotton, silk, plaid, cushion-wool, dyes & Abyssal rubber oilskins) from Fulcrum, Iziz, Voth, Ys, Erehwon, Dalab & Kautoa"},
    {"id": "furniture", "label": "joinery, lacquered & inlaid furniture", "class": "craft", "tier": "medium", "unit": "unit", "note": "cabinetry, kauri/mahogany joinery, Abyssal-lacquered screens & nacre/ivory-inlaid furniture from Eternia, Nephtos/Ys, Xanadu, Dalab & Voth"},
    {"id": "firearms", "label": "arquebuses, muskets, rifles & pistols", "class": "specialty", "tier": "compact", "unit": "unit", "note": "precision small arms from Iron Republic (Roketstad, Stahlborn, Cascade), Voth, Iziz, Fulcrum & Ledge (dependent on steel, machine-wax & gunpowder)"},
    {"id": "armor", "label": "alloy plate armor, mail, cuirasses & carapace", "class": "craft", "tier": "medium", "unit": "unit", "note": "nickel-steel cuirasses, highland mail & carapace lamellar from Iziz, Iron Republic, Ledge, Spirladunon, Amaro, Fulcrum & Kimr"},
    {"id": "weapons", "label": "forged melee weapons (swords, pikes & halberds)", "class": "craft", "tier": "medium", "unit": "unit", "note": "watered-steel sabres, Forgemaster halberds & highland broadswords from Shumari (Amaro), Iziz, Ledge, Ardent, Tallwalls, Stahlborn & Xanadu"},
    # Gems, Photonic Opals, Kilnware, Paper, Books, High Tech & Exterior Luxuries (22)
    {"id": "pearls", "label": "pearls & worked nacre", "class": "luxury", "tier": "compact", "unit": "kg", "note": "Hykkousoi deep-shelf & Kautoan free-diver pearls"},
    {"id": "ivory", "label": "Kimr mammoth ivory, horn & megafauna pelts", "class": "luxury", "tier": "compact", "unit": "t", "note": "Labyrinth Pleistocene mammoth/pachyderm ivory, glyptodont shell & great aurochs horn traded at Hall of Heroes"},
    {"id": "gems", "label": "Opal Valley black/fire opals, emeralds & quartz", "class": "precious", "tier": "compact", "unit": "kg", "note": "Opal Valley black & fire opals (4-8x northern markup via Strongbow/Xanadu), Coyote emeralds & High Rift quartz"},
    {"id": "photonic-opals", "label": "Opal Valley photonic crystal opals", "class": "precious", "tier": "compact", "unit": "kg", "note": "Opal Valley photonic-bandgap crystal opals exported via Strongbow/Xanadu to Carcosa Yusar, Iron Republic optical labs & Yuni Geomancers"},
    {"id": "goldwork", "label": "Xanadu goldwork & prayer wheels", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Vale of Xanadu Goldsmiths' bullion craft"},
    {"id": "fine-ceramics", "label": "Jimjam kilnware & glazed ceramics", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Jimjam ('Kiln Country') painted kilnware, sake/mezcal flasks & glazed tile"},
    {"id": "porcelain", "label": "Eternian imperial porcelain & celadon", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Eternal State kaolin porcelain & celadon kilnware (plus Yeti raid booty)"},
    {"id": "paper", "label": "rag, bamboo & marsh-reed paper", "class": "craft", "tier": "medium", "unit": "t", "note": "alkali-pulped bamboo, mulberry, rag & marsh-reed paper from Eternal State mills, Longsong's Order paper mill, Abyssal reed-mills & Dalab"},
    {"id": "almanacs", "label": "Jimjam Long Count almanacs", "class": "specialty", "tier": "compact", "unit": "unit", "note": "universal caravan & port contract-dating calendars & eclipse tables"},
    {"id": "books", "label": "books, codices & copied records", "class": "specialty", "tier": "compact", "unit": "unit", "note": "domestic presses in literate states; rare histories exported by Longsong (banned in Voth)"},
    {"id": "lenses", "label": "telescopes, sextants & lenses", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Roketstad Astronomers' Guild optics ground from optical borosilicate glass, High Rift quartz & photonic opals"},
    {"id": "rockets", "label": "rocket racks & heavy artillery", "class": "specialty", "tier": "medium", "unit": "unit", "note": "Iron Republic Arsenal solid-fuel rocket batteries & siege/naval artillery (dependent on coal, sulfur & saltpeter)"},
    {"id": "arms", "label": "Forgemaster mech parts & siege ordnance", "class": "specialty", "tier": "medium", "unit": "unit", "note": "Iziz, Voth, Yuni & Tungang war-walker/mech assemblies & heavy ordnance"},
    {"id": "electrics", "label": "Geomancer generators, lamps & wire", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Yuni & Locus Geomancer dynamos, glass arc-lamps & rubber/lac-insulated wire"},
    {"id": "energy-cells", "label": "Ancient energy cells", "class": "specialty", "tier": "compact", "unit": "unit", "note": "sealed-vault Ancient power cells from Valley of the Ancient (via Yusar) & Stair; strong Eternian demand"},
    {"id": "cybernetics", "label": "Yusar cybernetics & servo-craft", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Carcosa & Henge Yusar implants and photonic-core mech-servos"},
    {"id": "genecraft", "label": "Dalab gene-craft & pressure mods", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Genepriest altitude/pressure/cold adaptations & healers"},
    {"id": "scrapgoods", "label": "Abyssal recycled scrap-wares", "class": "specialty", "tier": "medium", "unit": "unit", "note": "Locus & Mungo worked tin-mirror & ruin craft"},
    {"id": "relics", "label": "licensed Ancient relics", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Eternal State Valley monopoly & Stair sealed-tunnel artifacts (plus Yeti raid booty)"},
    {"id": "oversea-luxuries", "label": "Farport pelagic luxuries", "class": "luxury", "tier": "compact", "unit": "unit", "note": "pelagic imports landed at Farport's Factory Quarter under State monopoly"},
    {"id": "frost-coral", "label": "Crook frost-coral, verdigris jade & glacier pelts", "class": "luxury", "tier": "compact", "unit": "unit", "note": "unique sub-polar luxury of The Crook shipped exclusively to Farport and disseminated from there"},
    {"id": "ria-amber", "label": "Ria Valley river-amber, hexapod musk & sea-byssus", "class": "luxury", "tier": "compact", "unit": "unit", "note": "unique drowned-valley luxury of the Ria Valley shipped exclusively to Farport and disseminated from there"},
]
GOOD_BY_ID = {g["id"]: g for g in GOODS}


def populate_supply_demand(world, setts):
    """Synthesize raster-backed + lore-accurate supply & demand for new/restored nodes and new goods."""
    # Literacy & domestic book self-sufficiency by polity (owner item #4)
    LITERATE_BOOK_SELF = {
        "Eternal State": 1.04,       # woodblock & movable-type bureaucracy, slight export
        "Empire of Iziz": 0.96,      # imperial academies & presses
        "Vothic Kingdom": 1.00,      # Ordinator state scriptoria (closed to Order!)
        "Realm of Dalab": 0.95,      # scribal halls & genepriest archives
        "Yuni Emirate": 0.95,        # madrasas & Geomancer treatises
        "Jimjam": 1.06,              # almanac presses & Long Count chronicles
        "League: Ys": 1.02,          # philosophical schools & pilot charts
        "League: Tethys": 0.94,
        "League: Trigon": 0.90,
        "League: Pontus": 0.88,
        "Iron Republic": 0.94,       # technical ordinances & astronomer tables
        "Xanadu Sultanate": 0.92,    # monastic sutras & court annals
        "Dilihan Province": 0.92,
        "Tungang Union": 0.82,
        "Yusar (Cybernetics)": 0.90,
        "Hookfleet": 0.80,
        "Silkhead (Korona Gateway)": 0.72,
        "Jabal Shiekdom": 0.68,
        "Tabisti: Sfenops": 0.65,
        "Tabisti: Liikofi": 0.65,
    }

    OIL_ALLOWED = {"Yuni Emirate", "Eternal State", "Order of Historians"}
    RE_ALLOWED = {"Yuni Emirate", "Eternal State", "Order of Historians", "Tungang Union"}

    for sid, s in setts.items():
        pop = s["population"]
        kpop = pop / 1000.0
        pol = s["polity"]
        nm = s["name"]
        gs = s["geo_scan"]
        sup, dem = s["supply"], s["demand"]

        # Abstract exterior maritime trade regions (The Crook & Ria Valley):
        # Strictly export their signature luxury via ship into Farport, and demand gold, silver,
        # and the unique regional resources of Krator (shipped out through Farport).
        if pol in ("Ria Valley", "The Crook"):
            sup.clear()
            dem.clear()
            sc = 1.15 if pol == "Ria Valley" else 0.95
            if pol == "Ria Valley":
                sup["ria-amber"] = 62.0
                sup["magnets"] = 2.2  # minor river-borne trickle running past haunted Weeping Valley to Farport
            else:
                sup["frost-coral"] = 56.0
            dem.update({
                "gold": 32.0 * sc,
                "silver": 140.0 * sc,
                # Unique regional resources of Krator:
                "cacao": 5.5 * sc,
                "spice-highland": 2.2 * sc,
                "hashish": 4.2 * sc,
                "paper": 6.0 * sc,
                "isle-spice": 12.0 * sc,
                "wormwick": 8.5 * sc,
                "fungal": 11.0 * sc,
                "abyss-lac": 4.2 * sc,
                "ivory": 2.2 * sc,
                "gems": 6.5 * sc,
                "photonic-opals": 2.6 * sc,
                "pearls": 18.0 * sc,
                "goldwork": 2.4 * sc,
                "porcelain": 14.0 * sc,
                "fine-ceramics": 2.8 * sc,
                "silk": 1.4 * sc,
                "qiviut": 0.9 * sc,
                "cushion-wool": 4.5 * sc,
                "plaid": 2.2 * sc,
                "cybernetics": 1.2 * sc,
                "genecraft": 1.1 * sc,
                "lenses": 0.8 * sc,
                "almanacs": 2.6 * sc,
                "lung-salt": 0.9 * sc,
                "relics": 4.5 * sc,
                "machine-wax": 2.4 * sc,
                "ship-hulls": 1.6 * sc,
                # Newly added unique Krator high-tier spirits, narcotics, Abyssal rubber & finished crafts:
                "champagne": 5.5 * sc,
                "ranjrum": 4.8 * sc,
                "scotch": 4.5 * sc,
                "mezcal": 4.2 * sc,
                "sake": 5.0 * sc,
                "wine": 6.5 * sc,
                "opium": 4.0 * sc,
                "cigars": 4.5 * sc,
                "rubber": 6.5 * sc,
                "glass": 5.0 * sc,
                "clothes": 4.8 * sc,
                "furniture": 3.6 * sc,
            })
            continue

        # If this is a newly added or restored settlement with empty baseline demand, give standard per-1k demand
        if not dem:
            dem.update({
                "iron": 5.5 * kpop, "copper": 0.30 * kpop, "tin": 0.03 * kpop, "bronze": 0.28 * kpop,
                "gold": 0.45 * kpop, "silver": 2.8 * kpop, "nickel": 0.005 * kpop,
                "coal": 1.4 * kpop, "oil": 0.6 * kpop, "salt": 8.5 * kpop,
                "saltpeter": 0.06 * kpop, "sulfur": 0.03 * kpop, "potash": 0.28 * kpop,
                "scrap": 0.8 * kpop, "timber": 420.0 * kpop, "food": 250.0 * kpop,
                "cacao": 0.25 * kpop, "coffee": 0.35 * kpop, "tea": 0.38 * kpop,
                "spice-tropical": 0.14 * kpop, "spice-highland": 0.006 * kpop,
                "sugar": 2.8 * kpop, "silk": 0.025 * kpop, "cotton": 1.0 * kpop,
                "tobacco": 0.28 * kpop, "dye-tropical": 0.07 * kpop, "dye-temperate": 0.07 * kpop,
                "medicine": 0.02 * kpop, "reagent": 0.02 * kpop, "mounts": 10.0 * kpop,
                "pearls": 1.5 * kpop, "almanacs": 0.18 * kpop, "goldwork": 0.09 * kpop,
                "rockets": 0.07 * kpop, "lenses": 0.01 * kpop, "books": 0.025 * kpop,
                "electrics": 0.05 * kpop, "arms": 0.045 * kpop, "genecraft": 0.02 * kpop,
                "scrapgoods": 0.10 * kpop, "relics": 0.01 * kpop, "porcelain": 0.09 * kpop,
                "isle-spice": 0.08 * kpop, "fungal": 0.14 * kpop, "plaid": 0.09 * kpop,
            })
            # Baseline raster-backed supply for new/restored pins
            if gs["iron_max"] >= 80:
                sup["iron"] = gs["iron"] * 0.45 * (1 + 0.2 * kpop)
            if gs["copper_max"] >= 70:
                sup["copper"] = gs["copper"] * 0.22
            if gs["tin_max"] >= 60:
                sup["tin"] = gs["tin"] * 0.04
            if gs["gold_max"] >= 60:
                sup["gold"] = gs["gold"] * 0.25
            if gs["silver_max"] >= 60:
                sup["silver"] = gs["silver"] * 0.9
            if gs["coal_max"] >= 90:
                sup["coal"] = gs["coal"] * 4.5
            if gs["sulfur_max"] >= 80:
                sup["sulfur"] = gs["sulfur"] * 0.8
            if gs["saltpeter_max"] >= 70:
                sup["saltpeter"] = gs["saltpeter"] * 0.12
            if gs["halite_max"] >= 80 or gs["sea_cells"] > 8:
                sup["salt"] = max(gs["halite"] * 2.5, gs["sea_cells"] * 12.0)
            if gs["potash_max"] >= 70:
                sup["potash"] = gs["potash"] * 0.6
            if gs["wood"] >= 110:
                sup["timber"] = gs["wood"] * 55.0 * max(1.0, 0.45 * kpop)
            if gs["rain_mm"] >= 450 and -2.0 <= gs["temp_c"] <= 35.0:
                sup["food"] = max(255.0 * kpop, gs["land_cells"] * 38.0)
            elif (
                gs["sea_cells"] > 5
                and gs["rain_mm"] >= 260
                and gs.get("halite_max", 0) < 150
                and gs.get("alkali_max", 0) < 120
                and nm not in ("Catch Salt Works", "Bowl Salt Works", "Noa's Regret", "Boiling Bay", "Shanty")
            ):
                sup["food"] = 225.0 * kpop + gs["sea_cells"] * 25.0

        # Apply TRADE-SCOPE s2.4 extraction gate on oil & rare-earth (except Geomancer concessions)
        if pol not in OIL_ALLOWED and nm not in ("Mungo",):
            sup["oil"] = 0.0
        if pol not in RE_ALLOWED and nm not in ("White Gills Hermitage",):
            sup["rare-earth"] = 0.0
        if nm == "Locus":
            sup["oil"] = max(sup.get("oil", 0.0), 420.0)  # Locus oil lode (TRADE-SCOPE s2.4)
            sup["abyss-lac"] = 4.0                        # Northern Abyssal margin resin
        if nm == "Mungo":
            sup["oil"] = max(sup.get("oil", 0.0), 180.0)  # Geomancer fuel depot
        if nm == "Reed":
            sup["abyss-lac"] = 3.0
        if nm in ("Reed", "Sfenops", "Liikofi"):
            sup["food"] = max(sup.get("food", 0.0), 305.0 * kpop)  # lifted N abyss + salt-rice (TRADE-SCOPE s10)

        # --- Baseline demand for new & wired-in goods across ALL Krator settlements ---
        is_port = gs["sea_cells"] > 0 or nm in ("Voth", "Fulcrum", "Erehwon", "Theodiga", "Spider Lake Weirs", "Shim", "Dapor", "Port Tobin", "Port Mira", "Marr", "Nephtos")
        is_high = gs["h_m"] > 2200 or pol in ("Realm of Dalab", "Xanadu Sultanate", "Tungang Union", "Order of Historians", "Yuni Emirate", "Empire of Iziz")
        kpop_lux = min(kpop, 30.0 + 0.42 * max(0.0, kpop - 30.0))  # smooth metropolitan scaling on scarce single-region specialties
        st_type = s["type"]
        urb_mult = 1.0 if st_type in ("city", "arcology") else (0.58 if st_type == "town" else (0.35 if st_type == "inhabited ruin" else 0.15))

        dem["ivory"] = 0.12 * urb_mult * kpop_lux
        dem["marble"] = (0.75 if st_type in ("city", "arcology") else (0.42 if st_type == "town" else 0.15)) * kpop
        dem["zinc"] = (0.38 if pol in ("Iron Republic", "Eternal State", "Empire of Iziz", "Yuni Emirate", "Yusar (Cybernetics)") else 0.14) * kpop
        if nm == "Roketstad":
            dem["zinc"] = max(dem["zinc"], 8.5)  # brass telescope & sextant barrels!
        if nm == "Skywatch":
            dem["lenses"] = max(dem.get("lenses", 0.0), 2.2)  # Jimjam royal observatory optics!
            dem["zinc"] = max(dem["zinc"], 1.8)
        if gs.get("zinc_max", 0) >= 95 and pol not in ("Lizardmen", "Ring Sea Pirates"):
            sup["zinc"] = max(sup.get("zinc", 0.0), gs["zinc"] * 0.065 * (0.6 + 0.4 * min(kpop, 3.0)))
        if nm == "Jimjam":
            dem["marble"] = 68.0  # brick-built Jimjam imports contact-belt marble up The Cut!
            dem["coal"] = max(dem.get("coal", 0.0), 195.0)  # kiln fuel for Kiln Country!
        elif nm in ("Iziz", "Fulcrum", "Hook", "Yuni", "Jabal"):
            dem["marble"] = max(dem["marble"], 24.0 * (kpop_lux / 12.0))
        if pol in ("Nomad Country", "Jabal Shiekdom"):
            dem["coal"] = min(dem.get("coal", 0.0), 0.6 * kpop)
        if pol == "Order of Historians":
            dem["coal"] = min(dem.get("coal", 0.0), 1.5 * kpop)
        dem["alabaster"] = (1.15 if pol == "Eternal State" else 0.24) * kpop_lux
        dem["machine-wax"] = (0.30 if pol in ("Iron Republic", "Empire of Iziz", "Tungang Union", "Eternal State", "Yusar (Cybernetics)") else 0.07) * kpop_lux
        dem["pitch-tar"] = (2.2 if is_port else 0.14) * kpop_lux
        dem["cordage"] = (2.6 if is_port else 0.32) * kpop_lux
        dem["qiviut"] = (0.075 if gs["temp_c"] < 14 or st_type == "city" else (0.045 if st_type == "town" else 0.018)) * kpop_lux
        dem["cushion-wool"] = (0.13 if gs["temp_c"] < 17 or pol in ("Empire of Iziz", "Iron Republic", "Jimjam", "Realm of Dalab", "Eternal State", "Xanadu Sultanate") else 0.04) * kpop
        dem["incense"] = (0.20 if pol in ("Xanadu Sultanate", "Realm of Dalab", "Vothic Kingdom", "Eternal State", "Empire of Iziz", "Yuni Emirate") else 0.06) * kpop
        dem["abyss-lac"] = (
            0.14 if pol in ("Xanadu Sultanate", "Eternal State", "Yuni Emirate", "Empire of Iziz", "Iron Republic")
            else (0.07 if is_port else 0.025)
        ) * kpop
        dem["wormwick"] = (
            0.22 if pol in ("Empire of Iziz", "Eternal State", "Xanadu Sultanate", "Realm of Dalab", "Vothic Kingdom", "Yuni Emirate")
            else 0.07
        ) * kpop
        dem["lung-salt"] = (0.11 if is_high else 0.02) * kpop_lux
        dem["gems"] = (0.48 if pol == "Yusar (Cybernetics)" else 0.48 * urb_mult) * kpop_lux
        dem["photonic-opals"] = (
            0.08 if pol in ("Eternal State", "Empire of Iziz", "Realm of Dalab", "Xanadu Sultanate") and st_type in ("city", "arcology")
            else 0.0
        ) * (kpop_lux / 10.0)
        dem["fine-ceramics"] = 0.18 * kpop_lux
        dem["cybernetics"] = (0.12 if pol in ("Eternal State", "Realm of Dalab", "Empire of Iziz", "Yuni Emirate", "Order of Historians") else 0.015) * kpop_lux
        if pol == "Eternal State":
            dem["energy-cells"] = 0.16 * kpop  # Eternal State metropolitan demand (~22.3 units), sourced >85% from Valley of the Ancient via Yusar!
            if nm == "Veil":
                sup["energy-cells"] = 0.6      # minor State rim recovery
        elif pol in ("Realm of Dalab", "Empire of Iziz", "Iron Republic", "Yuni Emirate", "Xanadu Sultanate", "Tungang Union"):
            dem["energy-cells"] = 0.042 * kpop_lux
        else:
            dem["energy-cells"] = 0.0
        dem["oversea-luxuries"] = 0.16 * urb_mult * kpop_lux
        dem["frost-coral"] = 0.11 * urb_mult * kpop
        dem["ria-amber"] = 0.12 * urb_mult * kpop

        # Wire Zeijani & Andaru fungal goods across Krator's medical, alchemical, Genepriest & tavern demand network:
        dem["fungal"] = max(
            dem.get("fungal", 0.0),
            (0.24 if pol in ("Realm of Dalab", "Empire of Iziz", "Eternal State", "Xanadu Sultanate", "Yuni Emirate", "Order of Historians", "Yusar (Cybernetics)", "Vothic Kingdom") or is_port else 0.08) * kpop,
        )
        if nm == "Dalab":
            dem["fungal"] = max(dem["fungal"], 14.0)   # Genepriest mycological cultures
        elif nm in ("Port Mira", "Marr", "Hook", "Ys", "Nephtos"):
            dem["fungal"] = max(dem["fungal"], 4.5)    # Ring Sea port tavern & smuggler demand for Dhelv fungal spirits

        # --- Owner Item #4: Literate societies produce domestic books; Longsong exports curated rare histories ---
        dem["books"] = max(dem.get("books", 0.0), 0.18 * kpop)
        if pol == "Order of Historians":
            sup["books"] = 6.5 if nm == "Longsong" else 0.8
        else:
            ratio = LITERATE_BOOK_SELF.get(pol, 0.20)
            sup["books"] = dem["books"] * ratio

        # --- Contact-Belt Marble, Jimjam Alabaster, Fine Ceramics & Skywatch Royal Observatory ---
        MARBLE_QUARRIES = {"Almua": 185.0, "Dilihan": 145.0, "Tethis": 125.0, "Ys": 85.0, "Tallwalls": 75.0}
        if nm in MARBLE_QUARRIES:
            sup["marble"] = MARBLE_QUARRIES[nm]
        elif gs["marble_max"] >= 110:
            sup["marble"] = gs["marble"] * 2.2
        if nm == "Jimjam":
            sup["alabaster"] = 125.0      # 4,156-cell gypsum/alabaster basin supplying 120k Fulcrum!
            sup["fine-ceramics"] = 32.0   # Kiln Country signature export!
            sup["almanacs"] = max(sup.get("almanacs", 0.0), 28.0)
        elif nm == "Skywatch":
            sup["almanacs"] = 18.0        # Jimjam royal observatory town — astronomical tables & Long Count almanacs!
        elif nm == "Serai":
            sup["alabaster"] = 22.0
            sup["fine-ceramics"] = 5.5
        elif pol == "Yuni Emirate" and nm in ("Yuni", "Locus"):
            sup["fine-ceramics"] = 4.5 * (kpop / 6.0)
        elif pol == "Xanadu Sultanate" and nm == "Erehwon":
            sup["fine-ceramics"] = 6.5

        # --- Farport Pelagic Monopoly (plus gateway clearinghouse for Ria Valley & The Crook) ---
        if nm == "Farport":
            sup["oversea-luxuries"] = 36.0

        # --- Specialized Regional Producers ---
        if pol == "Yusar (Cybernetics)":
            sup["cybernetics"] = 11.5 if nm == "Carcosa" else 5.5
            sup["energy-cells"] = 22.5 if nm == "Carcosa" else 11.5  # Valley of the Ancient power-cell harvest!
            dem["energy-cells"] = 2.4 if nm == "Carcosa" else 1.2
            dem["scrap"] = max(dem.get("scrap", 0.0), 28.0 * kpop)
            dem["electrics"] = max(dem.get("electrics", 0.0), 1.2 * kpop)
            dem["gems"] = max(dem.get("gems", 0.0), 2.2 * kpop)  # photonic opals
            dem["rare-earth"] = max(dem.get("rare-earth", 0.0), 0.8 * kpop)

        if pol == "Yeti Kingdom":
            # Upland resources + Eternian raid booty exported along the hazardous Qoold Lheek–Jimjam dirt road!
            # Subalpine birch/conifer taiga & frozen-lake fisheries make Yetis locally self-sufficient in bulk timber & food
            # (bulk wagon hauls are impractical on the dangerous northern upland dirt road).
            sup["qiviut"] = 7.5 if nm == "Qoold Lheek" else 2.4
            sup["lung-salt"] = 4.5 if nm == "Qoold Lheek" else 1.5   # goldroot hypoxia adaptogen
            sup["pitch-tar"] = 24.0 if nm == "Qoold Lheek" else 8.0  # subalpine birch-tar
            sup["tea"] = 14.0 if nm == "Qoold Lheek" else 5.0        # northern ivan-chai
            sup["silver"] = max(sup.get("silver", 0.0), 52.0 if nm == "Qoold Lheek" else 16.0)
            sup["mounts"] = max(sup.get("mounts", 0.0), 34.0 if nm == "Qoold Lheek" else 12.0)
            # Plundered Eternian raid booty (fenced east down the Qoold Lheek–Jimjam trail while direct Yeti<->Eternia trade is 0):
            sup["porcelain"] = dem.get("porcelain", 0.0) + (11.0 if nm == "Qoold Lheek" else 3.5)
            sup["oversea-luxuries"] = dem.get("oversea-luxuries", 0.0) + (4.5 if nm == "Qoold Lheek" else 1.4)
            sup["relics"] = dem.get("relics", 0.0) + (3.8 if nm == "Qoold Lheek" else 1.2)
            sup["silk"] = dem.get("silk", 0.0) + (2.6 if nm == "Qoold Lheek" else 0.8)
            sup["champagne"] = (2.8 if nm == "Qoold Lheek" else 0.9)
            sup["wine"] = (3.5 if nm == "Qoold Lheek" else 1.1)
            sup["clothes"] = (2.2 if nm == "Qoold Lheek" else 0.7)
            dem["iron"] = 0.0
            dem["salt"] = 0.0
            dem["coal"] = 0.0
            sup["saltpeter"] = 0.0  # frozen snowfields cannot solar-evaporate desert nitre!
            dem["timber"] = 95.0 * kpop
            sup["timber"] = max(sup.get("timber", 0.0), dem["timber"] * 1.04)
            dem["food"] = 240.0 * kpop
            sup["food"] = max(sup.get("food", 0.0), dem["food"] * 1.03)
            dem["arms"] = max(dem.get("arms", 0.0), 1.4 * kpop)
            dem["bronze"] = max(dem.get("bronze", 0.0), 1.8 * kpop)
            dem["cotton"] = max(dem.get("cotton", 0.0), 2.2 * kpop)

        if pol == "Eternal State":
            # Humid oceanic Eternian lowlands lack dry evaporite gypsum/alabaster beds -> imported by lake barge from Jimjam via Palewharf!
            sup["alabaster"] = 0.0
            if nm == "Fulcrum":
                dem["alabaster"] = max(dem.get("alabaster", 0.0), 22.0)
        if nm == "Jimjam":
            # Dry NE Dam-Basin evaporite & travertine shore quarries at the eastern head of Jimjam's Lake!
            sup["alabaster"] = max(sup.get("alabaster", 0.0), 46.0)
        if nm == "Palewharf":
            # Eternian lakeshore village port on the western cove of Jimjam's Lake — primary barge receiving & stone-dressing wharf for Jimjam alabaster!
            dem["alabaster"] = max(dem.get("alabaster", 0.0), 18.5)
            dem["fine-ceramics"] = max(dem.get("fine-ceramics", 0.0), 2.8)
            sup["porcelain"] = max(sup.get("porcelain", 0.0), 3.4)
            sup["food"] = max(sup.get("food", 0.0), 340.0)

        if pol == "Catch Oasis Stations":
            dem["timber"] = 28.0 * kpop
            sup["timber"] = dem["timber"] * 1.02
            if nm == "Bab al-Hawa (Godsgate)":
                sup["incense"] = 5.5
                sup["mounts"] = 22.0
                sup["food"] = 35.0
                dem["food"] = 110.0
                dem["lung-salt"] = max(dem.get("lung-salt", 0.0), 0.65)
                dem["cotton"] = max(dem.get("cotton", 0.0), 1.6)
                dem["tea"] = max(dem.get("tea", 0.0), 0.9)
            elif nm == "Kolli Oasis":
                sup["sugar"] = 38.0
                sup["mounts"] = 28.0
                sup["incense"] = 4.2
                sup["food"] = 125.0
                dem["food"] = 165.0
                dem["cotton"] = max(dem.get("cotton", 0.0), 2.2)
                dem["tea"] = max(dem.get("tea", 0.0), 1.2)
                dem["fine-ceramics"] = max(dem.get("fine-ceramics", 0.0), 0.8)
            elif nm == "Arfwai Oasis":
                sup["salt"] = 165.0
                sup["saltpeter"] = 9.5
                sup["mounts"] = 34.0
                sup["sugar"] = 44.0
                sup["food"] = 140.0
                dem["food"] = 195.0
                dem["cotton"] = max(dem.get("cotton", 0.0), 2.6)
                dem["tea"] = max(dem.get("tea", 0.0), 1.5)
                dem["almanacs"] = max(dem.get("almanacs", 0.0), 0.85)
                dem["arms"] = max(dem.get("arms", 0.0), 0.65)

        if pol == "Twins Pass Wardenry":
            # High geothermal steam-vent pass fort (4,448 m) between Stair and Strongbow
            dem["timber"] = 22.0 * kpop
            sup["timber"] = dem["timber"] * 1.02
            sup["sulfur"] = 18.0
            sup["reagent"] = 3.4
            sup["mounts"] = 18.0
            sup["food"] = 22.0
            dem["food"] = 118.0
            dem["lung-salt"] = max(dem.get("lung-salt", 0.0), 2.2)
            dem["qiviut"] = max(dem.get("qiviut", 0.0), 0.85)
            dem["tea"] = max(dem.get("tea", 0.0), 1.4)
            dem["arms"] = max(dem.get("arms", 0.0), 0.7)

        if nm == "Stair":
            sup["energy-cells"] = 5.5  # charged Ancient energy cells from sealed Catch tunnel
            sup["electrics"] = 1.2     # salvaged tunnel switchgear & lamps
            sup["relics"] = 2.2        # uncorroded tunnel artifacts
            sup["nickel"] = 4.5        # preserved alloys
            sup["food"] = 10.0         # oasis dates only; imports food!

        if nm == "Longsong":
            sup["energy-cells"] = 1.4  # Order vault-recovered Ancient cells
            dem["energy-cells"] = 0.2

        # --- Ranj (isle-spice) Rebalancing: Port Mira & Ybera as major Ranj suppliers alongside Spice Isles, Temora/Zey'danin & Andaru ---
        if nm == "Zey'danin":
            sup["isle-spice"] = 38.0   # Vothic Throne outpost (plantations partially blighted per throne/NOTES.md; down from old 160)
        elif nm == "Temora":
            sup["isle-spice"] = 32.0   # Vothic Ring Isles Ranj & spice station

        # --- Hookfleet (Port Mira on SE Throne: pirate & smuggler haven, accepts all ships, major Ranj supplier) ---
        if pol == "Hookfleet":
            sup["coffee"] = 12.0
            sup["spice-tropical"] = 10.5
            sup["isle-spice"] = 85.0   # Major Throne Ranj supplier!
            sup["pitch-tar"] = 22.0
            sup["timber"] = max(sup.get("timber", 0.0), 2800.0)
            dem["cordage"] = max(dem.get("cordage", 0.0), 14.0)
            dem["arms"] = max(dem.get("arms", 0.0), 2.2)

        # --- Zeijani & Andaru (Throne native peoples: friendly with each other, raid colonizers, wired into fungal network) ---
        if nm == "Dhelv":
            sup["fungal"] = 100.0      # Cavern-grown Zeijani fungal spirits & alchemical distillates
        if pol == "Andaru":
            # Throne ash-nomads & vent-shoulder villagers (brother people of Zeijani; LORE.md:585, biomes/throne/NOTES.md:380-390)
            sup["fungal"] = 44.0 if nm == "Ṣunu-Ašru" else 28.0      # Ash-tube & plume-shoulder fungal cultures & tonics
            sup["isle-spice"] = 18.0 if nm == "Ṣunu-Ašru" else 12.0  # Wild plume-edge Ranj harvests
            sup["sulfur"] = 22.0 if nm == "Ṣunu-Ašru" else 14.0      # Fumarole sulfur
            sup["medicine"] = 6.5 if nm == "Ṣunu-Ašru" else 4.0      # Pyre-thistle surgical anaesthetic
            sup["reagent"] = 4.5 if nm == "Ṣunu-Ašru" else 2.8       # Plume-adapted volcanic botanicals
            sup["mounts"] = 32.0 if nm == "Ṣunu-Ašru" else 18.0      # Ash-adapted pack beasts
            sup["food"] = max(sup.get("food", 0.0), dem.get("food", 0.0) * 1.04)
            sup["timber"] = max(sup.get("timber", 0.0), dem.get("timber", 0.0) * 1.05)

        # --- Hykkousoi League Colonies & Nearshore Villages ---
        if nm == "Nephtos":
            sup["copper"] = 48.0
            sup["pearls"] = 62.0     # water-breather shelf pearls
            sup["timber"] = 14500.0  # finished ship hulls & island mahogany
            sup["dye-tropical"] = 9.5
            sup["tobacco"] = 14.0
        elif nm == "Ybera":
            # Ys colony on Throne — major Ranj supplier!
            sup["coffee"] = 10.5
            sup["spice-tropical"] = 9.5
            sup["isle-spice"] = 72.0  # Major Throne Ranj supplier!
            sup["timber"] = max(sup.get("timber", 0.0), 2200.0)
        elif nm == "Kierson":
            sup["pearls"] = max(sup.get("pearls", 0.0), 16.0)
            sup["spice-tropical"] = max(sup.get("spice-tropical", 0.0), 4.5)
        elif nm == "Nereus":
            sup["pearls"] = max(sup.get("pearls", 0.0), 14.0)
            sup["dye-tropical"] = max(sup.get("dye-tropical", 0.0), 3.8)
        elif nm in ("Kyra Isle", "Skopelos Isle"):
            sup["pearls"] = 14.0
            sup["spice-tropical"] = 3.2
            sup["pitch-tar"] = 6.5
        elif nm == "Limnaia":
            sup["cotton"] = max(sup.get("cotton", 0.0), 6.5)  # Trigon Lake sea-linen flax
            sup["food"] = max(sup.get("food", 0.0), 320.0)

        if pol == "West Ring Islanders":
            sup["isle-spice"] = 50.0 if nm == "Taikoro" else 42.0
            sup["spice-tropical"] = 18.0 if nm == "Taikoro" else 14.0
            sup["sugar"] = 180.0
            sup["pearls"] = 24.0

        if pol == "Spider Lake Guilds":
            sup["cordage"] = 56.0 if "Spider Lake" in nm else 16.0  # Golden Cable rigging
            sup["silk"] = 7.5 if "Spider Lake" in nm else 2.2       # Lake-Sheen Gossamer
            sup["qiviut"] = 3.6 if "Spider Lake" in nm else 1.0     # Cloud-Fleece parkas
            # Compass Hills Ancient-magnetized iron ores (Ham-Tsek at 1055,219 sits inside Compass Hills; enters crater via Korona / Spider Silk route):
            sup["magnets"] = 4.5 if "Spider Lake" in nm else 28.0

        # --- Frogmen (SW Highlands natives at Krrmt & Jrrmiah; peace treaty with Dalab) ---
        if pol == "Frogmen":
            sup["silk"] = 3.8 if nm == "Krrmt" else 3.0      # beadcone-silk traded through Span
            sup["incense"] = 5.5 if nm == "Krrmt" else 4.2   # brush-oil
            sup["gems"] = max(sup.get("gems", 0.0), 4.8)     # SW highland opal-shell ammolite
        if nm == "Span":
            sup["silk"] = max(sup.get("silk", 0.0), 1.8)
            sup["incense"] = max(sup.get("incense", 0.0), 2.8)

        # --- Kimr (Hall of Heroes in the Labyrinth: sacred Pleistocene megafauna ivory, horn & hides market) ---
        if pol == "Kimr":
            sup["ivory"] = 26.0      # mammoth & pachyderm ivory, great aurochs horn, glyptodont shell
            sup["mounts"] = 58.0     # heavy Pleistocene megafauna hides, pelts & sinew leather
            sup["qiviut"] = 2.8      # woolly mammoth & woolly rhino underwool
            sup["food"] = max(sup.get("food", 0.0), dem.get("food", 0.0) * 1.05)  # mammoth-steppe herds & wild melons
            dem["iron"] = max(dem.get("iron", 0.0), 14.0)
            dem["salt"] = max(dem.get("salt", 0.0), 28.0)    # curing hides!
        elif nm == "Wildcat":
            sup["ivory"] = max(sup.get("ivory", 0.0), 3.2)   # Fellgang summer Firebliss hunt (TRADE-SCOPE s7.1)

        # --- Shumari (Amaro & Urundashi) + former Shumar cities (Driyan, Azoth, Dayshun) ---
        if pol == "Shumari":
            dem["timber"] = dem.get("timber", 0.0) * 0.08  # dry Shumar plateau stone & mudbrick architecture
            sup["timber"] = max(sup.get("timber", 0.0), dem["timber"] * 1.02)
            sup["food"] = 244.0 * kpop  # hardy Shumar plateau pastoral herds, highland barley & dryland terraces (~97.6% self-feeding!)
            sup["mounts"] = 215.0 if nm == "Amaro" else 55.0  # premier Shumar Mamluk war-mounts & steppe cavalry stock!
            sup["saltpeter"] = 5.5 if nm == "Amaro" else 2.0
            dem["arms"] = max(dem.get("arms", 0.0), 1.4 * kpop)  # Mamluk Sword-Caste demand
        if nm in ("Driyan", "Azoth", "Dayshun"):
            sup["mounts"] = max(sup.get("mounts", 0.0), 14.0 * kpop)
            sup["cotton"] = max(sup.get("cotton", 0.0), 2.2 * kpop)
            sup["sugar"] = max(sup.get("sugar", 0.0), 4.5 * kpop)
        if nm == "Tzinguard":
            # Voth naval base guarding Western Ring Sea
            dem["pitch-tar"] = max(dem.get("pitch-tar", 0.0), 14.0)
            dem["cordage"] = max(dem.get("cordage", 0.0), 16.0)
            dem["rockets"] = max(dem.get("rockets", 0.0), 1.4)
            dem["arms"] = max(dem.get("arms", 0.0), 1.6)
        if nm == "Dapor":
            # Dalab's Ostia-style lake port
            sup["pitch-tar"] = max(sup.get("pitch-tar", 0.0), 8.0)

        # --- Empire of Iziz / Shell Province updates (Marr smuggler entrepot, Fridon wormwick, Daridel plaid) ---
        if nm == "Daridel":
            sup["plaid"] = 6.5           # Talovolci three-dye checked wool under Iziz sovereignty
            sup["dye-temperate"] = 2.4
            sup["tea"] = 2.2
        elif nm == "Marr":
            sup["cotton"] = max(sup.get("cotton", 0.0), 18.0)
            sup["arms"] = max(sup.get("arms", 0.0), 3.2)
            dem["isle-spice"] = max(dem.get("isle-spice", 0.0), 5.5)  # smuggler-friendly Izani entrepot demand!
        elif nm == "Fridon":
            # Cloud-zone Eastern Highlands flank (TRADE-SCOPE s7.5): secondary gatherer of parasitic wormwick!
            sup["wormwick"] = dem.get("wormwick", 0.0) + 22.0
            sup["medicine"] = 34.0       # non-wormwick herbal simples (split from old 76.1)
        elif nm == "Stahlborn":
            sup["iron"] = max(sup.get("iron", 0.0), 85.0)
            sup["coal"] = max(sup.get("coal", 0.0), 110.0)
            sup["rockets"] = max(sup.get("rockets", 0.0), 1.8)

        # --- Jabal Shiekdom & Independent East Abyss Tabisti Cities (Sfenops & Liikofi — NO ARCOLOGY SCRAP!) ---
        if pol == "Jabal Shiekdom":
            dem["timber"] = dem.get("timber", 0.0) * 0.15  # arid mudbrick & stone architecture
            if nm == "Jabal":
                sup["incense"] = dem.get("incense", 0.0) + 28.0  # premier Bowl/badlands myrrh caravan market
                sup["mounts"] = dem.get("mounts", 0.0) + 180.0   # Dasri camel & pack-beast fair
                sup["sugar"] = dem.get("sugar", 0.0) + 65.0      # Bowl tamarisk-manna syrup
                sup["salt"] = max(sup.get("salt", 0.0), 420.0)
                sup["saltpeter"] = max(sup.get("saltpeter", 0.0), 8.5)
                sup["food"] = 245.5 * kpop                       # irrigated Bowl fan date-palms, qanat wheat & Dasri flocks (only modest grain supplement!)
        elif pol in ("Tabisti: Sfenops", "Tabisti: Liikofi"):
            # NO arcology down in the East Abyss! Zero scrap & scrapgoods exports; instead export Carboniferous
            # swamp-copal incense AND unique East Abyss lac / scale-shellac / swamp-amber (abyss-lac)!
            dem["timber"] = dem.get("timber", 0.0) * 0.18        # Abyssal stone, reed & mudbrick architecture
            sup["timber"] = min(sup.get("timber", 0.0), dem["timber"] * 0.85)  # East Abyss basin has swamp-reeds/scrub, not bulk sawtimber surplus
            sup["scrap"] = 0.0
            sup["scrapgoods"] = 0.0
            sup["incense"] = dem.get("incense", 0.0) + (34.0 if nm == "Sfenops" else 30.0)    # Carboniferous cordaite swamp copal
            sup["abyss-lac"] = dem.get("abyss-lac", 0.0) + (28.0 if nm == "Sfenops" else 25.0)  # unique East Abyss lac & swamp-amber!
            sup["cordage"] = max(sup.get("cordage", 0.0), dem.get("cordage", 0.0) + 14.0)     # totora mat-reed cordage
            sup["cotton"] = max(sup.get("cotton", 0.0), dem.get("cotton", 0.0) + 18.0)
            sup["sugar"] = max(sup.get("sugar", 0.0), dem.get("sugar", 0.0) + 42.0)
            sup["coal"] = max(sup.get("coal", 0.0), 140.0)

        # --- Tiguantin (Iziz tributary on Eastern Highlands & Lesser Throne; capital Guari at 1095,911) ---
        if pol == "Tiguantin":
            # Exports cushion-puna wool (cushion-wool) AND parasitic caterpillar-fungus medicine (wormwick) as its own separate good!
            sup["cushion-wool"] = dem.get("cushion-wool", 0.0) + 58.0  # Tiguantin cushion-puna & woolback fleece!
            sup["wormwick"] = dem.get("wormwick", 0.0) + 95.0          # Parasitic caterpillar-fungus medicine (worth its weight in silver)!
            sup["medicine"] = dem.get("medicine", 0.0) + 3.5           # Non-wormwick montane simples
            sup["reagent"] = dem.get("reagent", 0.0) + 4.8             # Pallidine tower honey & cloud-forest alkaloid extracts
            sup["fungal"] = dem.get("fungal", 0.0) + 6.0               # Cushion-mire mycological cultures
            sup["qiviut"] = dem.get("qiviut", 0.0) + 3.6               # Fine underfleece
            sup["plaid"] = dem.get("plaid", 0.0) + 6.5                 # Andean-style terraced highland woven cloth
            sup["tea"] = dem.get("tea", 0.0) + 5.2                     # Wet-face cloud-montane terrace tea
            sup["silver"] = max(sup.get("silver", 0.0), dem.get("silver", 0.0) + 4.5)
            sup["copper"] = max(sup.get("copper", 0.0), dem.get("copper", 0.0) + 16.0)
            sup["sulfur"] = max(sup.get("sulfur", 0.0), dem.get("sulfur", 0.0) + 14.0)  # Lesser Throne fumaroles
            sup["relics"] = dem.get("relics", 0.0) + 1.4               # Entombed First Monastery Lava-Tube Vaults (tube_lesser_06)
            sup["books"] = dem.get("books", 0.0) + 0.9                 # First Monastery preserved codices
            sup["food"] = max(sup.get("food", 0.0), dem.get("food", 0.0) * 1.03)

        # --- Silkhead (K1 Gateway to Korona) & Korona Tribes ---
        if pol == "Silkhead (Korona Gateway)":
            sup["silk"] = dem.get("silk", 0.0) + 5.8           # Korona Silk River trade assembly
            sup["cordage"] = dem.get("cordage", 0.0) + 14.0
            sup["dye-temperate"] = dem.get("dye-temperate", 0.0) + 3.8  # Korona orchil & stone dyes
            sup["reagent"] = dem.get("reagent", 0.0) + 2.6     # snow-lotus brought down from Hoar-Tables
        if pol == "Korona Tribes":
            sup["dye-temperate"] = 4.5 if "K7" in nm else 1.8
            sup["reagent"] = 3.2 if "K7" in nm else 1.1  # snow-lotus

        # --- Xanadu Additions: Kirstabal Plantation Town & Thalaba (Godshearth Expeditions) ---
        if nm == "Kirstabal":
            sup["cacao"] = 16.0
            sup["coffee"] = 14.0
            sup["sugar"] = 145.0
            sup["tea"] = 9.5
            sup["spice-tropical"] = 6.5
            sup["cotton"] = 12.0
        elif nm == "Thalaba":
            # North shore of Lake Xanadu; runs expeditions up into Godshearth caldera & ruined Nazar!
            sup["sulfur"] = max(sup.get("sulfur", 0.0), 18.0)     # Godshearth fumarole sulfur
            sup["machine-wax"] = 10.5                             # Hearth-tree tallow & lamp wax (TRADE-SCOPE s7.1)
            sup["medicine"] = 3.2                                 # Hearth stoke cold remedy
            sup["reagent"] = 2.8                                  # geothermal caldera botanicals
            sup["dye-temperate"] = 2.6                            # "Pele's amber" orange titanium-glass pigment
            sup["relics"] = 0.9                                   # Nazar bench expedition finds

        if pol == "Scyvoi":
            sup["mounts"] = 38.0    # salamander draught beasts & hides
            sup["incense"] = 3.2    # fire-season dryland resins

        if pol == "Coyote Kingdom":
            if nm in ("Gate Tarn Mires", "Peak Coyote Plume-Camp"):
                sup["gems"] = 32.0 if "Peak" in nm else 20.0  # Peak emeralds & N Outlands turquoise
                sup["mounts"] = 45.0                          # riding ostriches & plumes
                sup["incense"] = 6.5                          # comb-mast incense
            if nm == "The Gate":
                sup["food"] = max(sup.get("food", 0.0), 420.0)  # Seed Law fodder monopoly!

        if nm == "Siphon Maar Works":
            sup["machine-wax"] = 48.0
        elif nm == "Ostrukh-on-Water":
            sup["food"] = 2400.0     # Woolly Ghaunt-Ox breadbasket
            sup["machine-wax"] = 9.5
        elif nm == "Spindle Fan":
            sup["cordage"] = 28.0    # spinner-cord

        if nm == "Opal Valley Mines":
            sup["gems"] = 92.0           # black & fire opals for court lapidaries
            sup["photonic-opals"] = 34.0 # photonic crystal-lattice opals (highest-markup compact gem in Krator!)
        elif nm == "Strongbow":
            sup["gems"] = max(sup.get("gems", 0.0), 22.0)
            sup["photonic-opals"] = 9.5  # Xanadu royal opal-cutting guildhouse
        if nm == "White Gills Hermitage":
            sup["lung-salt"] = 11.5  # Lag Solt scraped from charged collars
            sup["rare-earth"] = 6.5  # ferromanganese pipe crust
        if nm == "Singing Gjar Quartz":
            sup["gems"] = 18.0       # optical quartz & chalcedony
        if nm == "Roketstad":
            dem["gems"] = max(dem.get("gems", 0.0), 9.0)            # optical quartz & lapidary bearings
            dem["photonic-opals"] = max(dem.get("photonic-opals", 0.0), 7.5)  # Republic optical & astronomer workshops!
        elif nm == "Glaive":
            dem["photonic-opals"] = max(dem.get("photonic-opals", 0.0), 2.8)
        elif nm == "Carcosa":
            dem["photonic-opals"] = max(dem.get("photonic-opals", 0.0), 14.5) # Yusar cybernetic optical/neural resonators!
        elif nm == "Henge":
            dem["photonic-opals"] = max(dem.get("photonic-opals", 0.0), 6.8)
        elif nm == "Yuni":
            dem["photonic-opals"] = max(dem.get("photonic-opals", 0.0), 4.2)  # Geomancer harmonic survey instruments!
        elif nm == "Locus":
            dem["photonic-opals"] = max(dem.get("photonic-opals", 0.0), 2.4)
        elif nm == "Mungo":
            dem["photonic-opals"] = max(dem.get("photonic-opals", 0.0), 1.8)
        elif nm == "Longsong":
            dem["photonic-opals"] = max(dem.get("photonic-opals", 0.0), 1.4)

        if nm in ("Catch Salt Works", "Bowl Salt Works"):
            sup["salt"] = 1850.0
            sup["saltpeter"] = 38.0 if nm == "Catch Salt Works" else 34.0
            sup["food"] = 0.0  # Hostile hypersaline salt/soda pans (TRADE-SCOPE s4: Salt al-Ban & Solta) produce ZERO food!
        if nm in ("Opal Valley Mines", "Xanadu Goldfields", "Siphon Maar Works", "Singing Gjar Quartz", "White Gills Hermitage", "Parabola"):
            sup["food"] = 0.0  # Arid mining, maar & high-pass hermitage outposts import food!
        if pol == "Xanadu Sultanate":
            # TRADE-SCOPE s2.2: Xanadu imports salt across the Catch
            sup["salt"] = min(sup.get("salt", 0.0), 35.0)

        if pol == "Nomad Country" and nm not in ("Catch Salt Works",):
            sup["incense"] = max(sup.get("incense", 0.0), 3.6 * max(kpop, 0.4))  # badlands myrrh
            sup["mounts"] = max(sup.get("mounts", 0.0), 28.0 * max(kpop, 0.4))

        if nm == "Spirladunon":
            sup["cordage"] = 34.0    # Scinropos rot-proof cliff-lung rope
        if nm in ("Kautoa", "Valapo", "Bipo"):
            sup["cordage"] = max(sup.get("cordage", 0.0), 24.0 * max(kpop, 0.5))   # rope-banana abaca
            sup["pitch-tar"] = max(sup.get("pitch-tar", 0.0), 22.0 * max(kpop, 0.5))  # tar-black seeps
        if nm in ("Mav's Refuge", "Voth", "Shim", "Shell"):
            sup["pitch-tar"] = max(sup.get("pitch-tar", 0.0), 24.0)  # hyperjungle prismgum

        # --- Shipbuilding & Naval Stores Chain (ship-timber, pitch-tar, salt-proof cordage/canvas -> ship-hulls) ---
        SHIP_TIMBER_SUP = {
            "Spirladunon": 520.0,   # Talovolci giant curved ribs & knees floated down to Ring Sea
            "Kautoa": 440.0,        # Ring Isles crooked shipbuilding timber & spars
            "Valapo": 180.0,
            "Bipo": 160.0,
            "Nephtos": 380.0,       # Tethys colony mahogany & hull-planking
            "Mav's Refuge": 260.0,  # Hyperjungle rot-resistant ironwood knees
            "Shell": 220.0,
            "Port Goto": 140.0,
            "Shim": 210.0,          # SW Bay coastal cedar & hardwood spars
            "Sheritu": 195.0,       # Eternian highland ship-cedar brought down mid-quality State highways
            "Mirabilis": 170.0,
            "Boatmurder": 85.0,     # Dam-rim conifer mast salvage
        }
        SHIP_TIMBER_DEM = {
            "Voth": 185.0, "Almua": 160.0, "Tzinguard": 65.0,
            "Iziz": 240.0, "Marr": 115.0, "Port Tobin": 85.0,
            "Hook": 150.0, "Port Mira": 115.0,
            "Ys": 165.0, "Tethis": 185.0, "Trigon": 85.0, "Pontus": 75.0,
            "Farport": 220.0, "Dapor": 95.0, "Noa's Regret": 35.0,
        }
        if nm in SHIP_TIMBER_SUP:
            sup["ship-timber"] = SHIP_TIMBER_SUP[nm]
        if nm in SHIP_TIMBER_DEM:
            dem["ship-timber"] = SHIP_TIMBER_DEM[nm]
        elif is_port and st_type in ("city", "town"):
            dem["ship-timber"] = max(dem.get("ship-timber", 0.0), 8.0 * min(kpop, 6.0))

        # Commissioned Ship Hulls (Nephtos builds for League/Tethys; Kautoa builds for Beast Riders & neutrals; Almua/Shim, Port Mira, Farport, Shell)
        SHIP_HULL_SUP = {
            "Nephtos": 16.5,     # League shipyard colony on contested island!
            "Kautoa": 14.5,      # Kautoan master shipwrights (effective navy & shipbuilder for Beast Riders!)
            "Valapo": 4.5,
            "Almua": 8.5,        # Vothic royal arsenal slipways
            "Shim": 6.5,         # Shim River estuary yards
            "Port Mira": 6.0,    # Hookfleet sloop & prize-refit yards
            "Farport": 9.5,      # Eternian pelagic dockyards
            "Shell": 5.5,
        }
        SHIP_HULL_DEM = {
            "Ys": 5.5, "Tethis": 4.8, "Trigon": 3.8, "Pontus": 3.2,
            "Iziz": 9.5, "Marr": 3.2, "Port Tobin": 2.2,
            "Hook": 4.4, "Dapor": 3.4,
            "Mantis": 4.2,       # Beast Riders commission coastal factor craft via Kautoa!
            "Taikoro": 1.6, "Erehwon": 2.2, "Reed": 1.8, "Ostrukh-on-Water": 1.6,
        }
        if nm in SHIP_HULL_SUP:
            sup["ship-hulls"] = SHIP_HULL_SUP[nm]
        if nm in SHIP_HULL_DEM:
            dem["ship-hulls"] = SHIP_HULL_DEM[nm]
        elif pol == "Beast Riders":
            dem["ship-hulls"] = max(dem.get("ship-hulls", 0.0), 0.75)

        # Ensure major shipyards demand complementary caulking pitch-tar, salt-proof cordage & sailcloth cotton
        if nm in ("Nephtos", "Kautoa", "Almua", "Shim", "Voth", "Ys", "Tethis", "Hook", "Port Mira", "Iziz", "Marr", "Farport", "Dapor"):
            yard_sc = SHIP_HULL_SUP.get(nm, 3.0)
            dem["pitch-tar"] = max(dem.get("pitch-tar", 0.0), 4.2 * yard_sc)
            dem["cordage"] = max(dem.get("cordage", 0.0), 4.8 * yard_sc)
            dem["cotton"] = max(dem.get("cotton", 0.0), dem.get("cotton", 0.0) + 1.8 * yard_sc)
        if nm in ("Ys", "Tethis", "Nephtos", "Hook"):
            # Timber/island yards lack tar seeps & spider/abaca cordage
            sup["pitch-tar"] = min(sup.get("pitch-tar", 0.0), 2.5)
            sup["cordage"] = min(sup.get("cordage", 0.0), 3.0)

        # --- Gunpowder & Steel Triangle (coal + volcanic sulfur + playa/guano saltpeter -> rockets & arms) ---
        # Wet/temperate states (>500 mm/yr rain) cannot solar-evaporate desert playa saltpeter outdoors;
        # only arid playas (Bowl, Catch, Cut sumps, East Abyss) & Da-Holwey guano lava tubes (Tallwalls) export bulk saltpeter!
        if gs["rain_mm"] > 500.0 and nm not in ("Tallwalls", "Dilihan", "Amaro"):
            sup["saltpeter"] = min(sup.get("saltpeter", 0.0), 0.8)
        if pol in ("Iron Republic", "Eternal State", "Realm of Dalab", "Tungang Union"):
            # Lack active volcanic fumaroles -> must import volcanic sulfur!
            sup["sulfur"] = min(sup.get("sulfur", 0.0), 1.2)
        if pol in ("Empire of Iziz", "Shell Province"):
            # Mainland Iziz lacks fumaroles & desert playas (relies on tributary Tiguantin, Bowl/Catch & Ring Sea sulfur/saltpeter!)
            sup["sulfur"] = min(sup.get("sulfur", 0.0), 2.0)
            if nm != "Parabola":
                sup["saltpeter"] = min(sup.get("saltpeter", 0.0), 1.8)

        SALTPETER_HUBS = {
            "Tallwalls": 28.0,    # Da-Holwey giant bat/swiftlet guano lava tubes!
            "Dilihan": 22.0,      # Arid Cut rain-shadow evaporite sumps!
            "Jabal": 16.0,        # Bowl playa nitre beds
            "Parabola": 6.5,      # Bowl solar-furnace saltpan nitre
            "Mungo": 16.0,        # East Abyss margin nitre crust
            "Sfenops": 14.0,
            "Liikofi": 12.0,
            "Amaro": 12.0,        # Dry Shumar plateau nitre pans
        }
        if nm in SALTPETER_HUBS:
            sup["saltpeter"] = max(sup.get("saltpeter", 0.0), SALTPETER_HUBS[nm])

        SULFUR_HUBS = {
            "Kautoa": 36.0, "Valapo": 14.0,
            "Dhelv": 34.0, "Ṣunu-Ašru": 28.0, "Šadū-Qarnu": 16.0,
            "Port Mira": 26.0, "Zey'danin": 24.0, "Temora": 16.0,
            "Guari": 24.0,        # Lesser Throne fumaroles (tributary to Iziz!)
            "Thalaba": 24.0,      # Godshearth caldera fumarole expeditions
            "Boiling Bay": 12.0,
        }
        if nm in SULFUR_HUBS:
            sup["sulfur"] = max(sup.get("sulfur", 0.0), SULFUR_HUBS[nm])

        # Link military arsenal output (arms + rockets) + state garrisons directly to gunpowder & coking-coal input demand!
        ord_out = sup.get("arms", 0.0) + 1.35 * sup.get("rockets", 0.0)
        if ord_out > 0.2 or nm in ("Iziz", "Marr", "Voth", "Almua", "Tzinguard", "Roketstad", "Glaive", "Stahlborn", "Hook", "Fulcrum", "Bastion", "Dalab", "Ledge", "Yuni"):
            arsenal_wt = max(ord_out, 0.22 * kpop_lux)
            dem["saltpeter"] = max(dem.get("saltpeter", 0.0), 1.65 * arsenal_wt)
            dem["sulfur"] = max(dem.get("sulfur", 0.0), 1.35 * arsenal_wt)
            if pol in ("Vothic Kingdom", "Iron Republic", "Eternal State"):
                dem["coal"] = max(dem.get("coal", 0.0), 5.5 * kpop_lux)

        if nm == "Boatmurder":
            sup["scrap"] = 680.0     # Dam Basin stranded-freighter hull salvage!
            sup["timber"] = max(sup.get("timber", 0.0), 1650.0)  # Dam-rim driftwood & conifer salvage

        if nm == "Boiling Bay":
            sup["sulfur"] = max(sup.get("sulfur", 0.0), 12.0)     # Steampits cove vents

        if pol == "Painted Men":
            # TRADE-SCOPE s7.6: cliff settlements raid neighbors occasionally & trade small black/red/teal dyes + paintbrush medicine
            for k in list(dem.keys()):
                dem[k] *= 0.35
            sup["dye-temperate"] = 3.2
            sup["medicine"] = 1.4
            sup["food"] = max(sup.get("food", 0.0), dem.get("food", 0.0))
            sup["timber"] = max(sup.get("timber", 0.0), dem.get("timber", 0.0))

        if nm == "Parabola":
            # ANCIENT-NETWORK.md s8.11: Bowl solar-furnace arcology — Izani customs post, caravanserai & mirror-glass scree prospectors
            sup["scrap"] = max(sup.get("scrap", 0.0), 48.0)
            sup["lenses"] = max(sup.get("lenses", 0.0), 1.8)
            sup["scrapgoods"] = max(sup.get("scrapgoods", 0.0), 4.5)
            sup["energy-cells"] = max(sup.get("energy-cells", 0.0), 0.5)

        if nm == "Port Visas":
            # LORE.md s6.2 & s6.7: burnt-out ruin sacked by Screamers where ~1,000 people keep the few working quays for Iziz;
            # Dilihan Province's commercial surpluses originate at Dilihan, not unlogged Screamer-fringe jungle round the ruin!
            for k in list(sup.keys()):
                if k not in ("food", "salt", "scrap"):
                    sup[k] = min(sup[k], dem.get(k, 0.0) * 0.9)
            sup["food"] = 260.0
            sup["scrap"] = max(sup.get("scrap", 0.0), 28.0)

        # --- Climate & Architectural Timber Calibration + Domestic Lowland Draught-Stock Self-Sufficiency ---
        # Arid, plateau, cavern & mudbrick/stone polities do NOT consume 420 t/1k wood-cabin construction timber;
        # raw construction logs only move on short regional/waterborne hauls, whereas naval spars move as ship-timber!
        TIMBER_ARCH_SCALE = {
            "Nomad Country": 0.08,
            "Coyote Kingdom": 0.12,
            "Stair Divers (Catch)": 0.08,
            "Tabisti: Sfenops": 0.15,
            "Tabisti: Liikofi": 0.15,
            "Tiguantin": 0.16,
            "Scyvoi": 0.15,
            "Zeijani": 0.12,
            "Andaru": 0.12,
            "Order of Historians": 0.16,
            "Yuni Emirate": 0.22,
            "Kimr": 0.12,
            "Korona Tribes": 0.18,
            "Silkhead (Korona Gateway)": 0.25,
            "Xanadu Sultanate": 0.35,
            "Tungang Union": 0.22,
        }
        if pol in TIMBER_ARCH_SCALE:
            dem["timber"] = dem.get("timber", 0.0) * TIMBER_ARCH_SCALE[pol]
        if pol in ("Nomad Country", "Coyote Kingdom", "Stair Divers (Catch)", "Scyvoi", "Kimr", "Korona Tribes", "Zeijani", "Tiguantin"):
            sup["timber"] = max(sup.get("timber", 0.0), dem.get("timber", 0.0) * 1.02)

        # Settled agricultural heartlands breed domestic plough-oxen, mules & cart-stock (~72% of routine draught demand),
        # so cross-polity `mounts` flows represent specialized pastoral war-mounts, desert caravan camels & inner-crater pack-beasts!
        if pol in (
            "Empire of Iziz", "Eternal State", "Vothic Kingdom", "Realm of Dalab",
            "Jimjam", "Iron Republic", "Yuni Emirate", "Xanadu Sultanate", "Tungang Union",
        ):
            sup["mounts"] = max(sup.get("mounts", 0.0), dem.get("mounts", 0.0) * 0.72)

        # --- NEW RECALIBRATIONS: (1) Xanadu Gold Exporter, (2) Native Vale Cacao, (3) Dalab Hashish, (4) Separate Paper, (5) Catch Alkali Salts ---

        # 1. Xanadu Bonanza Gold Province + Rebaked Geology Gold Gate (geology-gemini.json lodes + placers):
        # Pre-fix trade-goods.json gave large cities on 0-90 background cells (Voth 212, Yuni 141, Tallwalls 110, Dilihan 85)
        # phantom gold from old gneiss rules. Under rebaked geology-gemini.json, commercial gold mining requires genuine
        # hydrothermal/placer mineralization (gold_max >= 115: Xanadu 234-251 bonanza belt, Throne Dhelv/Zey'danin 140, Verge 153, Kautoa 140).
        if pol == "Xanadu Sultanate":
            XAN_GOLD_BONANZA = {
                "Xanadu Goldfields": 155.0,  # South Rift-scarp bonanza lode (911,1665; gold_max=251)
                "Qiblai": 105.0,             # South Vale hydrothermal veins & Lake Xanadu placers (gold_max=235)
                "Erehwon": 98.0,             # West Vale bounding-fault epithermal veins & Pleasure-Dome placers (gold_max=244)
                "Theodiga": 82.0,            # Godthrone south-toe boiling-zone hot-spring gold sinters (gold_max=239)
                "Kirstabal": 44.0,           # East Vale Rift-margin veins (gold_max=234)
                "Strongbow": 42.0,           # Eastern scarp gold-quartz lodes (gold_max=234)
                "Strongwall": 28.0,          # Upper Strongwall bench veins (gold_max=173)
                "Thalaba": 8.5,
                "Opal Valley Mines": 6.5,
            }
            sup["gold"] = max(gs["gold"] * 0.42, XAN_GOLD_BONANZA.get(nm, gs["gold"] * 0.30))
            dem["gold"] = 1.65 * kpop + (24.0 if nm == "Erehwon" else (16.0 if nm in ("Qiblai", "Theodiga") else 0.0))
        else:
            if pol == "West Ring Islanders":
                sup["gold"] = 0.0  # low coral spice atolls, not bedrock Throne mines
            elif gs["gold_max"] >= 115:
                # Genuine rebaked hydrothermal/epithermal/placer gold provinces (Throne Dhelv/Zey'danin, Verge, Kautoa, Singing Gjar)
                THRONE_AND_RIFT_GOLD = {
                    "Dhelv": 48.0,           # Zeijani Silbaru Au-Ag veins (TRADE-SCOPE s2.6)
                    "Šurpu-Dhelv": 18.0,
                    "Qarnu-Tūbu": 18.0,
                    "Zey'danin": 48.0,       # Vothic Throne gold mines
                    "Port Mira": 16.0,
                    "Verge": 54.0,           # Yuni Stalker/East-Wall gold veins
                    "Kautoa": 24.0,
                    "Singing Gjar Quartz": 16.0,
                }
                sup["gold"] = THRONE_AND_RIFT_GOLD.get(nm, min(22.0, gs["gold"] * 0.16))
            else:
                # Background trace rock (<=90) yields minor alluvial panning at most, not commercial bullion mines
                sup["gold"] = min(sup.get("gold", 0.0), 4.5 if gs["gold_max"] >= 85 else 0.0)
            GOLD_MINT_COURTS = {
                "Iziz": 96.0,       # 120k Imperial Treasury & golden dome leaf
                "Fulcrum": 108.0,   # 120k Eternal State Imperial Court (replaces raw 6x=384 kg artifact)
                "Voth": 44.0,       # Vothic Royal Treasury & Ordinator shrines (imports Throne & Vale bullion)
                "Lux": 20.0,        # Rich Eternian river-port merchant houses
                "Farport": 22.0,    # Pelagic bullion clearinghouse
                "Dalab": 36.0,      # Sacred Temple of The God & Genepriest coffers
                "Roketstad": 24.0,  # Iron Republic Mint bullion reserve
                "Jimjam": 26.0,     # Kiln Country temple gilding & caravan banking
                "Yuni": 24.0,       # Emirate gold coinage & Geomancer contacts
                "Ys": 18.0,         # League commercial coinage
                "Tethis": 14.0,
                "Marr": 12.0,
                "Jabal": 18.0,
            }
            if nm in GOLD_MINT_COURTS:
                dem["gold"] = GOLD_MINT_COURTS[nm]

        # 2. Native Crop Rule on Cacao (TRADE-SCOPE s2.5 & s8.2 #3):
        # Cacao is native to the Vale of Xanadu (main producer/exporter!), with only minor transplanted groves in Kautoa (isle-demo/PLAN.md:515).
        # Pre-fix warm lowlands (Eternal State / Lux & Fulcrum, Voth, Jimjam, Dalab, Iziz, Yuni) do NOT grow cacao!
        XAN_CACAO_SUP = {
            "Erehwon": 62.0,
            "Qiblai": 42.0,
            "Theodiga": 32.0,
            "Kirstabal": 28.0,
            "Strongbow": 14.0,
        }
        KAUTOA_TRANSPLANT_CACAO = {
            "Kautoa": 12.5,
            "Valapo": 4.5,
            "Bipo": 2.5,
        }
        if nm in XAN_CACAO_SUP:
            sup["cacao"] = XAN_CACAO_SUP[nm]
            dem["cacao"] = 0.72 * kpop  # 3x cultural Pleasure-Dome chocolate consumption, leaving ~140+ t/yr net export!
        elif nm in KAUTOA_TRANSPLANT_CACAO:
            sup["cacao"] = KAUTOA_TRANSPLANT_CACAO[nm]
            dem["cacao"] = 0.28 * kpop
        else:
            sup["cacao"] = 0.0
            dem["cacao"] = (0.30 if st_type in ("city", "arcology") else (0.18 if st_type == "town" else 0.08)) * kpop_lux
            if nm in ("Iziz", "Fulcrum", "Voth", "Dalab", "Jimjam", "Lux", "Ys", "Tethis", "Roketstad", "Yuni", "Marr"):
                dem["cacao"] = max(dem["cacao"], 0.34 * kpop_lux)

        # 3. Dalab Hashish (TRADE-SCOPE s2.5, lines 26, 166, 374):
        # Native to swlowlands (Realm of Dalab) and transplanted by Dalab to the Rift Rim (Ledge & Nulab).
        DALAB_HASHISH_SUP = {
            "Dalab": 36.0,
            "Dapor": 16.5,
            "Dayshun": 14.5,
            "Nufelds": 10.5,
            "Rokwal": 9.0,
            "Daranch": 6.5,
            "Span": 5.5,
            # Transplanted by Dalab to the Rift Rim (riftrim):
            "Ledge": 12.0,
            "Nulab": 8.5,
        }
        sup["hashish"] = DALAB_HASHISH_SUP.get(nm, 0.0)
        if pol == "Vothic Kingdom":
            dem["hashish"] = 0.07 * kpop_lux  # Ordinator censorate restricts open consumption
        elif pol in ("Realm of Dalab", "Tungang Union"):
            dem["hashish"] = 0.28 * kpop
        elif is_port or pol in ("Hookfleet", "Ring Sea Pirates", "Nomad Country", "Jabal Shiekdom", "Empire of Iziz", "Iron Republic", "Xanadu Sultanate", "Yuni Emirate", "Jimjam"):
            dem["hashish"] = 0.24 * kpop_lux
        else:
            dem["hashish"] = 0.12 * kpop_lux
        if nm in ("Marr", "Port Mira", "Nephtos", "Hook", "Iziz", "Jabal"):
            dem["hashish"] = max(dem["hashish"], 3.8 if nm not in ("Iziz",) else 14.5)

        # 4. Paper as Its Own Good (unbundled from porcelain; LORE.md:748, 762 & TRADE-SCOPE.md:562):
        # Produced by Eternal State bamboo/mulberry/rag mills (pneumatic-tube bureaucracy surplus), Order of Historians' Longsong paper mill,
        # East/North Abyss marsh-reed (totora) mills (Sfenops, Liikofi, Reed, Locus), and Dalab hemp-hurd/rag mills (Dalab, Dapor).
        PAPER_MILLS = {
            "Fulcrum": 96.0,      # Imperial water-powered rag & bamboo paper mills
            "Lux": 54.0,          # Lowland river-canal bamboo & mulberry paper center!
            "Mirabilis": 24.0,
            "Farport": 18.0,
            "Palewharf": 10.0,    # Ships Eternian paper bales across Jimjam's Lake to Jimjam's almanac presses!
            "Longsong": 16.5,     # Order of Historians paper mill (BLUEPRINT.md:94; banned in Voth!)
            "Sfenops": 32.0,      # East Abyss totora marsh-reed & cotton-rag paper mills
            "Liikofi": 28.0,
            "Reed": 10.0,         # North Abyss reed-bed paper works
            "Locus": 14.0,
            "Dalab": 42.0,        # SW Lowlands hemp-hurd (by-product of hashish hemp!) & rag paper mills
            "Dapor": 24.0,
            "Shim": 14.0,         # Lake Shim blood-reed/papyrus domestic Vothic mill (covers part of Voth's registries)
            "Erehwon": 8.5,       # Vale mulberry/lotus-bast court paper (partial self-supply)
        }
        sup["paper"] = PAPER_MILLS.get(nm, 0.0)
        if pol == "Yeti Kingdom":
            # Plundered Eternian paper bundles fenced east down the Qoold Lheek-Jimjam trail alongside porcelain!
            sup["paper"] = 3.6 if nm == "Qoold Lheek" else 1.1
            dem["paper"] = 0.15 * kpop
        else:
            # Demand driven by book presses, Long Count almanac printing, pneumatic/imperial bureaucracies, customs posts & academies:
            lit_w = LITERATE_BOOK_SELF.get(pol, 0.22)
            dem["paper"] = (0.58 * lit_w) * kpop + 0.85 * sup.get("books", 0.0) + 0.11 * sup.get("almanacs", 0.0)
            if nm == "Fulcrum":
                dem["paper"] = 62.0   # pneumatic-tube ministries consume huge volumes while still leaving major export surplus
            elif nm == "Iziz":
                dem["paper"] = 58.0   # 120k Imperial chancellery, courts & academies (imports reams by sea & highway!)
            elif nm == "Jimjam":
                dem["paper"] = max(dem["paper"], 38.0)  # Kiln Country's massive Long Count almanac & chronicle presses!
            elif nm == "Skywatch":
                dem["paper"] = max(dem["paper"], 9.5)   # Royal observatory star-tables & eclipse almanacs
            elif nm in ("Roketstad", "Ys", "Voth", "Talia", "Marr"):
                dem["paper"] = max(dem["paper"], 8.5 if nm != "Voth" else 22.0)

        # 5. Catch Alkali Salts (soda ash / natron / trona + borates + lithium; biomes/catch/PLAN.md:178-196 & LORE.md:86-87):
        # The Catch is Krator's one great soda-lake alkali field (226 cells >80, peak 255), with only minor coastal kelp-ash soda at Kautoa.
        # Concrete industrial uses wired directly into demand:
        #   (a) Rebuilding sealed Ancient energy-cells & wet-cell electrolytes (Yusar Carcosa/Henge, Yuni/Locus Geomancers, Xanadu engine-keepers)
        #   (b) Caustic soda-lye delignification for bamboo, mulberry & marsh-reed paper mills (Eternal State, Longsong, Sfenops, Liikofi, Reed, Dalab)
        #   (c) Low-iron optical borosilicate crown glass for telescopes & sextants (Roketstad, Glaive, Longsong)
        #   (d) Alkaline turquoise fritware & celadon ceramic glazes (Jimjam, Serai, Yuni, Eternal State)
        #   (e) Goldsmith & Mint borax assaying/soldering flux + armourers' brazing & cloth scouring (Xanadu Qiblai/Strongbow, Iziz, Marr, Voth, Ys)
        ALKALI_PRODUCERS = {
            "Catch Salt Works": 235.0,  # Terminal Catch soda-lake crust & borate/lithium pans (alkali_max = 226-255!)
            "Stair": 76.0,              # Stair oasis merchants selling Catch soda/lithium salts alongside sealed cells (catch/PLAN.md:194)
            "Arfwai Oasis": 56.0,       # South-Central Catch soda playa scrapers
            "Kolli Oasis": 24.0,        # Mid-Catch natron pans
            "Kautoa": 32.0,             # Minor maritime competitor: burned sea-kelp wrack soda ash (LORE.md:644; TRADE-SCOPE.md:566)
            "Valapo": 10.5,
        }
        sup["alkali"] = ALKALI_PRODUCERS.get(nm, 0.0)
        dem["alkali"] = (
            0.22 * sup.get("paper", 0.0)           # (b) soda/Kraft pulp delignification
            + 0.45 * sup.get("energy-cells", 0.0)  # (a) lithium/alkaline cell reconditioning electrolyte
            + 0.06 * sup.get("electrics", 0.0)     # (a) Geomancer wet-cell storage banks
            + 0.07 * sup.get("lenses", 0.0)        # (c) borosilicate optical glass melting
            + 0.25 * sup.get("fine-ceramics", 0.0) # (d) alkaline fritware glazes
            + 0.05 * kpop_lux                      # baseline soap & cloth-bleaching
        )
        ALKALI_INDUSTRIAL_HUBS = {
            "Carcosa": 24.0,     # Yusar cybernetics & Valley energy-cell rebuilding baths (catch/PLAN.md:195)
            "Henge": 11.5,
            "Yuni": 26.0,        # Geomancer alkaline storage batteries, condensers & turquoise glazes (catch/PLAN.md:196)
            "Locus": 16.5,
            "Mungo": 6.5,
            "Roketstad": 19.5,   # Astronomers' Guild low-iron borosilicate optical glass & Mint assaying flux!
            "Glaive": 6.5,
            "Jimjam": 24.0,      # Kiln Country alkaline turquoise glazes & fritware!
            "Iziz": 28.0,        # Imperial armourers' brazing flux (catch/PLAN.md:196), glassworks & textile bleaching
            "Marr": 8.5,
            "Fulcrum": 34.0,     # State bamboo-paper delignification & celadon flux
            "Lux": 18.0,
            "Erehwon": 15.0,     # Xanadu salvaged Ancient engine-keepers (catch/PLAN.md:196) & court glass
            "Qiblai": 13.5,      # Xanadu goldsmiths' borax soldering & bullion-assaying flux!
            "Theodiga": 8.5,
            "Strongbow": 6.5,    # Opal-polishing & goldsmith flux right below The Twins!
            "Voth": 14.0,
            "Ys": 9.5,           # League clear glass & purple-dye scouring
        }
        if nm in ALKALI_INDUSTRIAL_HUBS:
            dem["alkali"] = max(dem["alkali"], ALKALI_INDUSTRIAL_HUBS[nm])
        if nm in ALKALI_PRODUCERS:
            dem["alkali"] = min(dem["alkali"], 1.5)

        # --- EXPANSION TO 94 GOODS: Unbundled Arms, Native Sugar/Tobacco Gates, Glass Chain,
        #     East Abyss Rubber, Fermented/Distilled Luxury Beverages, Cigars, Opium & Finished Crafts ---

        # 6a. Unbundle legacy `rockets` (rocket batteries & heavy artillery) and `arms` (Forgemaster mechs & siege ordnance)
        #     so personal `firearms`, `armor`, and melee `weapons` are cleanly modeled as separate goods:
        sup["rockets"] = sup.get("rockets", 0.0) * 0.58
        dem["rockets"] = dem.get("rockets", 0.0) * 0.58
        sup["arms"] = sup.get("arms", 0.0) * 0.45
        dem["arms"] = dem.get("arms", 0.0) * 0.45

        # 6b. Native Crop Gate on Cane Sugar & Tamarisk-Manna (TRADE-SCOPE.md:162):
        #     Sugar cane grows in the warm Ring Isles, SW Bay, Throne/Inner Crater coasts, Kirstabal (East Vale), and East Abyss;
        #     arid Dasri oases (Jabal, Kolli, Arfwai) harvest desert tamarisk-manna syrup.
        #     Temperate/cool-coastal Eternal State, Iron Republic, Jimjam, Dalab, Yuni uplands & highlands grow 0 cane —
        #     so Eternal State MUST import `sugar` to ferment `champagne`!
        SUGAR_PRODUCER_POLS = {
            "West Ring Islanders", "Kautoa", "Hookfleet", "Shell Province",
            "League: Ys", "League: Tethys", "League: Trigon", "League: Pontus",
            "Tabisti: Sfenops", "Tabisti: Liikofi", "Jabal Shiekdom", "Catch Oasis Stations",
        }
        SUGAR_EXPLICIT_SUP = {
            "Shim": 220.0, "Voth": 145.0, "Almua": 85.0, "Temora": 95.0, "Zey'danin": 68.0,
            "Driyan": 52.0, "Azoth": 38.0,
            "Marr": 115.0, "Port Tobin": 62.0, "Shell": 135.0, "Port Goto": 55.0,
            "Port Mira": 110.0,
            "Ys": 125.0, "Ybera": 95.0, "Kierson": 42.0,
            "Tethis": 95.0, "Nephtos": 88.0, "Nereus": 36.0,
            "Trigon": 55.0, "Pontus": 58.0, "Kyra Isle": 28.0, "Skopelos Isle": 24.0,
            "Kautoa": 175.0, "Valapo": 68.0, "Bipo": 48.0,
            "Taikoro": 185.0, "Kautono": 155.0,
            "Kirstabal": 155.0, "Erehwon": 18.0,
            "Locus": 36.0,
        }
        if nm in SUGAR_EXPLICIT_SUP:
            sup["sugar"] = SUGAR_EXPLICIT_SUP[nm]
        elif pol not in SUGAR_PRODUCER_POLS:
            sup["sugar"] = 0.0
        dem["sugar"] = max(dem.get("sugar", 0.0) * 0.52, 1.35 * kpop)

        # 6c. Native Crop Gate on Inner-Crater Tobacco (TRADE-SCOPE.md:169):
        #     Tobacco is native strictly to the inner crater (Ring Isles, League, Voth, Kautoa, Spice Isles, Throne, Iziz bay, Dilihan, Beast Riders).
        INNER_TOBACCO_SUP = {
            "Voth": 68.0, "Shim": 52.0, "Almua": 26.0, "Drum": 22.0, "Torus": 18.0,
            "Temora": 28.0, "Zey'danin": 20.0, "Sethas": 14.0,
            "Nephtos": 48.0, "Tethis": 26.0, "Nereus": 12.0,
            "Ys": 32.0, "Ybera": 24.0, "Kierson": 10.0,
            "Trigon": 16.0, "Pontus": 15.0, "Kyra Isle": 8.0,
            "Kautoa": 46.0, "Valapo": 18.0, "Bipo": 12.0,
            "Taikoro": 24.0, "Kautono": 20.0,
            "Port Mira": 36.0,
            "Shell": 30.0, "Port Goto": 14.0, "Dilihan": 24.0,
            "Marr": 42.0, "Port Tobin": 20.0, "Hook": 18.0, "Iziz": 24.0, "Talia": 16.0,
            "Mav's Refuge": 18.0, "Talon": 9.0, "Pinnacle Rock": 7.0,
        }
        sup["tobacco"] = INNER_TOBACCO_SUP.get(nm, 0.0)
        dem["tobacco"] = (0.34 if is_port else 0.24) * kpop

        # 6c-ii. Native Crop Gates on `coffee`, `spice-tropical`, `dye-tropical`, `tea`, `silk` & `spice-highland` (saffron) (TRADE-SCOPE.md s2.5, lines 149-217, 540):
        # Pre-fix `trade-goods.json` grew coffee, clove, tropical dyes, tea, silk & saffron anywhere Koppen climate fit.
        # Enforce canon home biomes + recorded transplants:
        # (1) `coffee` (home: `ringisles` + Throne converted Ranj estates per LORE.md:460 + warm SW Bay/Shell/Kirstabal; 0 in Eternal State!):
        COFFEE_SUP = {
            "Zey'danin": 48.0, "Temora": 34.0, "Shim": 36.0, "Voth": 24.0, "Almua": 14.0,
            "Kautoa": 44.0, "Valapo": 18.0, "Bipo": 12.0,
            "Ybera": 32.0, "Ys": 16.0, "Kierson": 8.5,
            "Nephtos": 28.0, "Tethis": 12.0, "Nereus": 9.5,
            "Pontus": 11.0, "Kyra Isle": 6.5, "Skopelos Isle": 6.0,
            "Port Mira": 28.0,
            "Taikoro": 22.0, "Kautono": 18.0,
            "Shell": 26.0, "Port Goto": 10.0, "Marr": 16.0,
            "Kirstabal": 22.0, "Erehwon": 8.0,
        }
        sup["coffee"] = COFFEE_SUP.get(nm, 0.0)
        dem["coffee"] = (0.42 if st_type in ("city", "arcology") or is_port else 0.24) * kpop_lux

        # (2) `spice-tropical` (clove, rosette-vanilla & tropical island spice — home: `ringisles`, `swbay`, `throne`, `hyperjungle`; 0 in Eternal State!):
        SPICE_TROPICAL_SUP = {
            "Temora": 26.0, "Zey'danin": 22.0, "Shim": 20.0, "Voth": 14.0,  # incl. SW Bay rosette-vanilla (TRADE-SCOPE s2.5a)
            "Kautoa": 28.0, "Valapo": 12.0, "Bipo": 9.0,
            "Taikoro": 20.0, "Kautono": 18.0,
            "Port Mira": 16.0, "Ybera": 15.0, "Nephtos": 14.0,
            "Nereus": 7.5, "Kierson": 7.5, "Kyra Isle": 5.5, "Skopelos Isle": 5.5,
            "Shell": 16.0, "Port Goto": 8.0, "Mav's Refuge": 9.5,
            "Kirstabal": 10.5,
        }
        sup["spice-tropical"] = SPICE_TROPICAL_SUP.get(nm, 0.0)
        dem["spice-tropical"] = (0.18 if st_type in ("city", "arcology") or is_port else 0.10) * kpop_lux

        # (3) `dye-tropical` (Shim Blitrit purple, Ys murex, Ring Isles/Bay/Throne/Hyperjungle indigo & annatto — 0 in Eternal State!):
        DYE_TROPICAL_SUP = {
            "Shim": 34.0, "Voth": 16.0, "Almua": 10.0, "Temora": 8.5, "Zey'danin": 7.5,  # Blitrit blood-reed & bay-purple!
            "Ys": 24.0, "Kierson": 6.5, "Ybera": 7.5,                                     # Ys murex purple!
            "Nephtos": 16.0, "Tethis": 8.5, "Nereus": 6.5, "Trigon": 7.5, "Pontus": 6.5,  # Ring Isles/Bay indigo & annatto
            "Kautoa": 18.0, "Valapo": 7.5, "Bipo": 5.0,
            "Port Mira": 8.5, "Taikoro": 6.8, "Kautono": 6.2,
            "Shell": 12.0, "Dilihan": 9.5, "Mav's Refuge": 8.5, "Girder": 4.0,
        }
        sup["dye-tropical"] = DYE_TROPICAL_SUP.get(nm, 0.0)
        dem["dye-tropical"] = (0.11 if st_type in ("city", "arcology") else 0.06) * kpop_lux

        # (4) `tea` (TRADE-SCOPE.md:161, 163, 165, 193 — native to `xanadu`, `oidong`, and `nwlowlands` Eternian tea + Yeti ivan-chai & Tiguantin; cuts Republic/Dalab/Giants!):
        TEA_SUP = {
            "Fulcrum": 48.0, "Lux": 38.0, "Mirabilis": 24.0, "Tone": 20.0, "Sheritu": 14.0,  # Native `nwlowlands` Eternian tea
            "Erehwon": 38.0, "Qiblai": 26.0, "Theodiga": 22.0, "Kirstabal": 18.0, "Strongbow": 10.0,  # Vale mist tea
            "Longsong": 18.5,                                                                 # Oidong monastery mist tea
            "Guari": 9.5, "Daridel": 3.5,                                                     # Wet-face montane tea
            "Qoold Lheek": 14.0, "Leng": 5.0,                                                 # Northern ivan-chai
        }
        sup["tea"] = TEA_SUP.get(nm, 0.0)
        dem["tea"] = (0.42 if pol in ("Eternal State", "Xanadu Sultanate", "Order of Historians", "Yuni Emirate", "Jimjam", "Nomad Country", "Jabal Shiekdom") else 0.26) * kpop_lux

        # (5) `silk` (TRADE-SCOPE.md:163, 213, 572 — Vale/Eternian mulberry, Oidong lotus, Spider Lake Gossamer, Korona Silkhead, SW beadcone-silk & Beast Rider spider silk; cuts cold Republic/Giants!):
        SILK_SUP = {
            "Erehwon": 22.0, "Qiblai": 15.0, "Theodiga": 11.0, "Kirstabal": 9.5,   # Vale mulberry & lotus silk
            "Lux": 24.0, "Fulcrum": 20.0, "Mirabilis": 11.0,                       # Eternian mulberry silk
            "Longsong": 8.5,                                                        # Oidong lotus silk
            "Spider Lake Weirs": 9.5, "Ham-Tsek Silk Post": 3.2,                    # Spider Lake Gossamer
            "Silkhead": 8.5,                                                        # Korona Silk River
            "Krrmt": 5.5, "Jrrmiah": 4.2, "Span": 4.5, "Shim": 6.5, "Voth": 5.5,    # SW Highland & Bay beadcone-silk
            "Pinnacle Rock": 5.5, "Mav's Refuge": 5.0,                              # Beast Rider spider silk
            "Qoold Lheek": 3.2, "Leng": 1.0,                                        # Plundered Eternian silk raid booty
        }
        sup["silk"] = SILK_SUP.get(nm, 0.0)
        dem["silk"] = (0.14 if st_type in ("city", "arcology") else 0.06) * kpop_lux

        # (6) `spice-highland` — Vale of Xanadu & Oidong Saffron (TRADE-SCOPE.md:149, 161, 217, 540; LORE.md:502, 553-554):
        #     Native exclusively to the Vale of Xanadu (`xanadu`) and Oidong (`Order of Historians` at Longsong);
        #     0 in northern Koppen holdovers so prized saffron travels north across The Twins & Catch to courts, dye-houses & ports!
        SAFFRON_SUP = {
            "Erehwon": 18.0, "Qiblai": 14.5, "Theodiga": 11.0, "Strongbow": 9.5, "Kirstabal": 7.5,  # Vale of Xanadu saffron!
            "Longsong": 14.5,                                                                       # Oidong monastery saffron terraces!
        }
        if nm in SAFFRON_SUP:
            sup["spice-highland"] = SAFFRON_SUP[nm]
            dem["spice-highland"] = (1.15 if nm == "Longsong" else 0.22) * kpop  # monastic saffron-robe dye & Broken-Wheel temple rites
        else:
            sup["spice-highland"] = 0.0
            dem["spice-highland"] = (0.115 if st_type in ("city", "arcology") else (0.068 if st_type == "town" else 0.030)) * kpop_lux
            if nm in ("Iziz", "Fulcrum", "Lux", "Voth", "Dalab", "Yuni", "Jabal", "Ys", "Tethis", "Roketstad", "Jimjam", "Marr", "Kautoa", "Port Mira"):
                dem["spice-highland"] = max(dem["spice-highland"], 0.14 * kpop_lux)

        # Boost Throne & Spice Isles Ranj (`isle-spice`) slightly so Throne estates supply both raw Ranj trade & Ranj-rum stills:
        RANJ_BOOST = {
            "Port Mira": 102.0, "Ybera": 88.0, "Zey'danin": 48.0, "Temora": 38.0,
            "Taikoro": 54.0, "Kautono": 48.0,
            "Ṣunu-Ašru": 22.0, "Šadū-Qarnu": 14.0,
        }
        if nm in RANJ_BOOST:
            sup["isle-spice"] = RANJ_BOOST[nm]

        # 6d. Bog Peat (`peat` — biomes/nhighlands/PLAN-STATIONS.md:57: Footfall / Iron Republic & N Highland blanket peat bogs):
        PEAT_BOGS = {
            "Stahlborn": 185.0, "Cascade": 150.0, "Lipp": 135.0, "Roketstad": 80.0, "Glaive": 68.0,
            "Ardent": 95.0, "Spirladunon": 65.0,
            "Gate Tarn Mires": 78.0, "Coyote Lake Village": 32.0,
            "Hoar-Table Village (K7)": 45.0,
            "Pylon": 55.0, "Daridel": 38.0,
            "Reed": 62.0, "Mungo": 38.0,
        }
        sup["peat"] = PEAT_BOGS.get(nm, 0.0)
        if pol in ("Iron Republic", "Free Clans", "Talovolci Chiefs", "Coyote Kingdom", "Korona Tribes"):
            dem["peat"] = 3.2 * kpop
        elif pol in ("Order of Historians", "Silkhead (Korona Gateway)", "Free Giants (Vrivolci)", "Jimjam", "Yusar (Cybernetics)", "League: Trigon", "Dam Basin Salvagers") or nm in ("Sheritu", "Bastion", "Palewharf", "Veil", "Tone", "Mirabilis", "Fulcrum", "Locus", "Sfenops", "Liikofi"):
            dem["peat"] = (0.65 if nm == "Fulcrum" else 2.4) * kpop
        else:
            dem["peat"] = 0.0

        # 6e. Glass Production Chain (`silica-sand` + `alkali`/`potash` + `coal`/`peat` ---> `glass`):
        SILICA_SAND_SUP = {
            "Singing Gjar Quartz": 155.0,  # High-purity optical vein-quartz scree (Order of Historians)
            "Silkhead": 55.0,              # Korona crystal-quartz outwash
            "Serai": 105.0,                # Jimjam dam-basin washed white quartz sand
            "Jimjam": 45.0,
            "Carcosa": 78.0,               # Valley of the Ancient fused melt-glass cullet!
            "Henge": 42.0,
            "Parabola": 54.0,              # Bowl solar-furnace mirror-scree cullet!
            "Veil": 36.0,                  # Eternian rim melt-glass & quartz
            "Farport": 72.0,               # NW quartz foreshore sand
            "Mirabilis": 42.0,
            "Kautoa": 88.0,                # Pure Ring Isles quartz beach sand (TRADE-SCOPE.md:566)
            "Valapo": 32.0,
            "Shim": 92.0,                  # Shim River estuary quartz bars
            "Almua": 52.0,
            "Nereus": 68.0,                # League white-quartz beaches
            "Limnaia": 55.0,
            "Cascade": 58.0,               # Republic glacial outwash quartz sand
            "Lipp": 42.0,
            "Sista Riba Village": 68.0,    # East Wall quartz scree feeding Yuni/Locus glassworks
            "Verge": 36.0,
            "Bowl Salt Works": 48.0,       # Clean aeolian quartz dune sand
            "Arfwai Oasis": 38.0,
        }
        sup["silica-sand"] = SILICA_SAND_SUP.get(nm, 0.0)
        dem["silica-sand"] = 0.05 * kpop  # foundry casting sand baseline; major demand added from glasshouses below!

        GLASSHOUSES = {
            "Fulcrum": 76.0,     # Eternian crown window glass & heavy pressure-proof champagne bottles
            "Lux": 58.0,
            "Mirabilis": 34.0,
            "Farport": 24.0,
            "Roketstad": 48.0,   # Iron Republic low-iron optical borosilicate & scotch bottles
            "Cascade": 28.0,
            "Glaive": 14.0,
            "Kautoa": 38.0,      # Kautoan kelp-soda & quartz-sand island glasshouse (TRADE-SCOPE.md:566)
            "Valapo": 11.0,
            "Jimjam": 34.0,      # Kiln Country blown hollowware & spirit flasks
            "Serai": 10.0,
            "Ys": 28.0,          # League clear crown glass & decanters
            "Tethis": 22.0,
            "Voth": 26.0,        # Vothic royal glassworks
            "Shim": 18.0,
            "Yuni": 32.0,        # Geomancer arc-lamp bulbs, vacuum tubes & turquoise glass
            "Locus": 18.0,
        }
        sup["glass"] = GLASSHOUSES.get(nm, 0.0)
        dem["glass"] = (0.36 if st_type in ("city", "arcology") else (0.20 if st_type == "town" else 0.07)) * kpop

        # 6f. East Abyss Carboniferous `'rubber scale'` tree ---> `rubber` (coagulated & sulfur-vulcanized latex):
        RUBBER_SCALE_GROVES = {
            "Sfenops": 66.0,
            "Liikofi": 60.0,
            "Locus": 44.0,
            "Mungo": 25.0,
            "Reed": 19.0,
            "Reed upriver fields (to be named)": 12.0,
            "Furrow": 8.5,
        }
        sup["rubber"] = RUBBER_SCALE_GROVES.get(nm, 0.0)
        if pol in ("Eternal State", "Iron Republic", "Yuni Emirate", "Yusar (Cybernetics)", "Tungang Union"):
            dem["rubber"] = 0.28 * kpop_lux
        elif is_port or pol in ("Empire of Iziz", "Vothic Kingdom", "Realm of Dalab", "Jimjam", "Xanadu Sultanate", "Hookfleet"):
            dem["rubber"] = 0.20 * kpop_lux
        else:
            dem["rubber"] = 0.06 * kpop_lux
        if nm in ("Carcosa", "Henge"):
            dem["rubber"] = max(dem["rubber"], 6.5 if nm == "Carcosa" else 3.2)

        # 6g. Fermented Beverages, Distilled Spirits & High-Tier Luxury Bottlings (10 goods):
        # (i) `beer`: all grain ---> regional casked beer & hopped ale (<= 380 eff-km)
        BEER_BREWERIES = {
            "Fulcrum": 86.0, "Lux": 64.0, "Tone": 30.0,
            "Iziz": 94.0, "Talia": 48.0, "Atton": 36.0, "Seto": 28.0, "Hook": 26.0,
            "Voth": 68.0, "Drum": 40.0, "Torus": 36.0, "Shim": 28.0,
            "Dalab": 56.0, "Nufelds": 36.0, "Dapor": 24.0,
            "Jimjam": 62.0, "Serai": 20.0,
            "Ostrukh-on-Water": 72.0, "Yuni": 26.0,
            "Cascade": 32.0, "Roketstad": 22.0,
            "Ardent": 24.0, "Tallwalls": 26.0,
            "Erehwon": 30.0, "Qiblai": 22.0,
        }
        sup["beer"] = BEER_BREWERIES.get(nm, 0.0)
        dem["beer"] = (1.15 if (is_port or st_type in ("city", "town", "fort")) else 0.65) * kpop
        if pol in ("Zeijani", "Andaru"):
            dem["beer"] = 0.15 * kpop  # drink cavern fungal spirits instead

        # (ii) `sake`: rice / East Abyss `salt-rice` ---> sake (TRADE-SCOPE.md:564, 779)
        SAKE_BREWERIES = {
            # East Abyss halophytic `salt-rice` brewers:
            "Sfenops": 36.0, "Liikofi": 32.0, "Locus": 28.0, "Mungo": 16.5, "Reed": 14.5,
            # Warm lowland paddy-rice brewers:
            "Lux": 38.0, "Fulcrum": 32.0, "Palewharf": 14.5,
            "Erehwon": 22.0, "Qiblai": 14.0,
            "Longsong": 9.5,
        }
        sup["sake"] = SAKE_BREWERIES.get(nm, 0.0)
        dem["sake"] = (
            0.34 if pol in ("Eternal State", "Xanadu Sultanate", "Yuni Emirate", "Jimjam", "Order of Historians", "Empire of Iziz", "Iron Republic", "Yusar (Cybernetics)")
            else (0.18 if is_port else 0.08)
        ) * kpop_lux

        # (iii) `wine`: grapes ----> wine (Eternal State `nwlowlands` famed for wine, plus Dalab/Dilihan/Trigon hillsides)
        WINE_VINTNERS = {
            "Lux": 70.0, "Fulcrum": 58.0, "Mirabilis": 44.0, "Tone": 38.0, "Sheritu": 24.0, "Palewharf": 14.0,
            "Rokwal": 26.0, "Dayshun": 22.0, "Dalab": 18.0,
            "Dilihan": 22.0, "Trigon": 18.0, "Pontus": 14.0,
        }
        if pol != "Yeti Kingdom":
            sup["wine"] = WINE_VINTNERS.get(nm, 0.0)
        dem["wine"] = (0.58 if st_type in ("city", "arcology") else (0.32 if st_type == "town" else 0.12)) * kpop_lux

        # (iv) `champagne`: Eternian wine grapes + imported cane `sugar` (first-step tirage) + heavy `glass` bottles + `rubber` stoppers
        CHAMPAGNE_HOUSES = {
            "Lux": 29.0, "Fulcrum": 25.0, "Mirabilis": 16.5, "Tone": 12.5,
        }
        if pol != "Yeti Kingdom":
            sup["champagne"] = CHAMPAGNE_HOUSES.get(nm, 0.0)
        dem["champagne"] = (0.20 * urb_mult) * kpop_lux
        if nm in ("Iziz", "Voth", "Erehwon", "Dalab", "Ys", "Tethis", "Roketstad", "Jimjam", "Yuni", "Port Mira", "Marr", "Jabal"):
            dem["champagne"] = max(dem["champagne"], 0.24 * kpop_lux)

        # (v) `rum`: sugar cane + still fuel + casks/bottles ---> naval & tavern rum
        RUM_DISTILLERIES = {
            "Shim": 44.0, "Voth": 24.0, "Temora": 18.5, "Almua": 14.0,
            "Kautoa": 35.0, "Valapo": 12.5,
            "Taikoro": 24.0, "Kautono": 20.0,
            "Ys": 24.0, "Tethis": 18.0, "Pontus": 12.0,
            "Port Mira": 22.0,
            "Shell": 20.0, "Marr": 16.0,
            "Kirstabal": 22.0,
        }
        sup["rum"] = RUM_DISTILLERIES.get(nm, 0.0)
        dem["rum"] = (0.68 if (is_port or pol in ("Hookfleet", "Ring Sea Pirates", "Iron Republic", "Eternal State", "Free Clans", "Free Giants (Vrivolci)", "Talovolci Chiefs", "Dam Basin Salvagers")) else 0.28) * kpop_lux

        # (vi) `ranjrum`: sugar cane + `isle-spice` (Ranj at first step) + `glass` bottles + fuel ---> Throne spiced Ranj-rum
        RANJRUM_STILLS = {
            "Port Mira": 23.0,          # Hookfleet SE Throne flagship Ranj-rum!
            "Ybera": 19.0,              # League: Ys Throne plantation colony
            "Ys": 5.5,
            "Zey'danin": 15.5,          # Vothic Throne outpost stills
            "Temora": 9.5,
            "Nephtos": 11.0,            # League: Tethys Throne-strait island (imports raw Ranj & sugar!)
            "Ṣunu-Ašru": 6.5,           # Andaru volcanic pot-stills (traders come to buy)
            "Taikoro": 8.5,             # West Ring Islanders Ranj-cane reserve
        }
        sup["ranjrum"] = RANJRUM_STILLS.get(nm, 0.0)
        dem["ranjrum"] = (0.24 if is_port else 0.15) * urb_mult * kpop_lux
        if nm in ("Iziz", "Marr", "Fulcrum", "Farport", "Voth", "Dalab", "Roketstad", "Erehwon", "Yuni", "Jimjam", "Hook"):
            dem["ranjrum"] = max(dem["ranjrum"], 0.22 * kpop_lux)

        # (vii) `whiskey`: unpeated heartland grain + still fuel + charred oak casks & `glass` bottles ---> whiskey
        WHISKEY_STILLS = {
            "Dalab": 30.0, "Nufelds": 22.0, "Daranch": 12.0,
            "Talia": 28.0, "Atton": 20.0, "Iziz": 18.0,
            "Jimjam": 24.0,
            "Ledge": 18.5,
            "Tallwalls": 16.5,
            "Ostrukh-on-Water": 22.0,
        }
        sup["whiskey"] = WHISKEY_STILLS.get(nm, 0.0)
        dem["whiskey"] = (0.42 if (gs["temp_c"] < 18 or st_type in ("city", "town", "fort")) else 0.22) * kpop_lux

        # (viii) `scotch`: malted grain + bog `peat` (first-step kiln smoke) + `glass` bottles ---> Iron Republic Footfall scotch
        SCOTCH_DISTILLERIES = {
            "Stahlborn": 19.5, "Cascade": 18.0, "Roketstad": 16.0, "Lipp": 11.0, "Glaive": 6.5,
            "Ardent": 9.5, "Spirladunon": 5.5,
        }
        sup["scotch"] = SCOTCH_DISTILLERIES.get(nm, 0.0)
        dem["scotch"] = (0.20 * urb_mult) * kpop_lux
        if nm in ("Fulcrum", "Lux", "Farport", "Iziz", "Voth", "Dalab", "Erehwon", "Jimjam", "Ys", "Tethis", "Yuni", "Port Mira"):
            dem["scotch"] = max(dem["scotch"], 0.22 * kpop_lux)

        # (ix) `tequila`: cultivated warm-bench agave + masonry oven fuel + `glass` bottles ---> Dalab, Shumari & dry-bench tequila
        TEQUILA_STILLS = {
            "Rokwal": 22.0, "Daranch": 16.5, "Dayshun": 15.0, "Dalab": 12.0,
            "Amaro": 17.0, "Urundashi": 8.5,
            "Gioli": 11.0, "Arcbeam": 9.5,
            "Driyan": 11.5, "Azoth": 7.5,
        }
        sup["tequila"] = TEQUILA_STILLS.get(nm, 0.0)
        dem["tequila"] = (0.26 if st_type in ("city", "town") or is_port else 0.12) * kpop_lux

        # (x) `mezcal`: pit-roasted wild desert agave + imported `glass` & `fine-ceramics` flasks ---> Dasri mezcal (led by Jabal!)
        MEZCAL_PALENQUES = {
            "Jabal": 38.0,              # Premier Dasri wild-agave mezcal guild & caravan market!
            "Bowl Salt Works": 8.0,
            "Rifar al-Dhahab": 9.5,     # Dasri Nomad Country wild-agave camps
            "Shade": 7.5,
            "Cline": 6.5,
            "Furrow": 4.5,
            "Arfwai Oasis": 8.5,        # Dasri Catch oases
            "Kolli Oasis": 6.5,
            "Bab al-Hawa (Godsgate)": 4.5,
            "Sista Riba Village": 4.5,
        }
        sup["mezcal"] = MEZCAL_PALENQUES.get(nm, 0.0)
        dem["mezcal"] = (0.22 * urb_mult if pol not in ("Jabal Shiekdom", "Nomad Country", "Catch Oasis Stations") else 0.26) * kpop_lux
        if nm in ("Iziz", "Arcbeam", "Parabola", "Yuni", "Erehwon", "Strongbow", "Jimjam", "Fulcrum", "Dalab", "Port Mira", "Ys"):
            dem["mezcal"] = max(dem["mezcal"], 0.24 * kpop_lux)

        # 6h. Cigars (`tobacco` ----> `cigars`) & Vale Opium (`poppy` ---> `opium` in Xanadu):
        CIGAR_FACTORIES = {
            "Voth": 22.0, "Shim": 14.0, "Temora": 7.5,
            "Nephtos": 16.5, "Tethis": 6.5,
            "Marr": 15.0, "Port Tobin": 6.0,
            "Port Mira": 13.5,
            "Kautoa": 12.5,
            "Ys": 10.5, "Ybera": 5.5,
            "Shell": 8.5,
        }
        sup["cigars"] = CIGAR_FACTORIES.get(nm, 0.0)
        dem["cigars"] = (0.28 if (is_port or st_type in ("city", "arcology")) else 0.12) * kpop_lux

        OPIUM_REFINERIES = {
            # Vale of Xanadu sky-poppy heartland (TRADE-SCOPE.md:161, 163; >95% of world export!):
            "Erehwon": 35.0, "Qiblai": 25.0, "Kirstabal": 22.5, "Theodiga": 16.5, "Strongbow": 11.0,
            # Minor Oidong surgical sky-poppy tincture (Order of Historians; banned in Voth):
            "Longsong": 4.5,
        }
        sup["opium"] = OPIUM_REFINERIES.get(nm, 0.0)
        if pol == "Vothic Kingdom":
            dem["opium"] = 0.06 * kpop_lux  # Ordinator censorate restricts open dens; illicit/surgical only
        elif pol == "Xanadu Sultanate":
            dem["opium"] = 0.42 * kpop      # Pleasure-Dome domestic consumption, leaving ~95 t net export!
        elif is_port or pol in ("Empire of Iziz", "Eternal State", "Realm of Dalab", "Hookfleet", "Ring Sea Pirates", "Yuni Emirate", "Jimjam", "Iron Republic"):
            dem["opium"] = 0.24 * kpop_lux
        else:
            dem["opium"] = 0.09 * kpop_lux
        if nm in ("Iziz", "Marr", "Port Mira", "Fulcrum", "Farport", "Dalab", "Yuni", "Jimjam", "Ys"):
            dem["opium"] = max(dem["opium"], 0.28 * kpop_lux)

        # 6i. Finished Craft & Military Goods (`clothes`, `furniture`, `firearms`, `armor`, `weapons`):
        CLOTHES_CENTERS = {
            "Fulcrum": 58.0, "Lux": 42.0, "Farport": 18.0,
            "Iziz": 48.0, "Marr": 18.0, "Daridel": 12.0,
            "Voth": 42.0, "Shim": 18.0,
            "Ys": 28.0, "Tethis": 18.0,
            "Erehwon": 26.0, "Qiblai": 14.0,
            "Dalab": 28.0, "Dapor": 12.0,
            "Yuni": 20.0, "Spindle Fan": 11.0,
            "Guari": 14.0,
            "Spirladunon": 10.0,
            "Silkhead": 9.5,
            "Kautoa": 11.0,
        }
        if pol != "Yeti Kingdom":
            sup["clothes"] = CLOTHES_CENTERS.get(nm, 0.0)
        dem["clothes"] = (0.72 if st_type in ("city", "arcology") else (0.55 if st_type == "town" else 0.38)) * kpop

        FURNITURE_CENTERS = {
            "Fulcrum": 54.0, "Mirabilis": 34.0, "Lux": 32.0, "Sheritu": 18.0,
            "Nephtos": 32.0, "Tethis": 16.0, "Ys": 24.0,
            "Erehwon": 28.0, "Theodiga": 14.0,
            "Voth": 30.0, "Shim": 18.0,
            "Dalab": 26.0, "Span": 12.0,
            "Kautoa": 20.0,
            "Shell": 16.0,
        }
        sup["furniture"] = FURNITURE_CENTERS.get(nm, 0.0)
        dem["furniture"] = (0.62 if st_type in ("city", "arcology") else (0.38 if st_type == "town" else 0.16)) * kpop

        FIREARMS_ARSENALS = {
            "Roketstad": 35.0, "Stahlborn": 33.0, "Cascade": 22.0, "Glaive": 12.0,  # Iron Republic #1 precision gunsmiths!
            "Voth": 28.0, "Almua": 16.0, "Drum": 10.0,
            "Iziz": 28.0, "Hook": 12.0,
            "Fulcrum": 24.0, "Bastion": 10.0,
            "Ledge": 16.5,
            "Yuni": 14.0,
        }
        sup["firearms"] = FIREARMS_ARSENALS.get(nm, 0.0)
        if pol in ("Coyote Kingdom", "Dilihan Province", "Frogmen", "Painted Men"):
            dem["firearms"] = 0.0
        else:
            dem["firearms"] = (0.48 if st_type == "fort" or pol in ("Empire of Iziz", "Vothic Kingdom", "Hookfleet", "Shumari", "Realm of Dalab", "Tungang Union", "Jabal Shiekdom", "Nomad Country", "Xanadu Sultanate", "Jimjam") else 0.32) * kpop

        ARMOR_ARMOURIES = {
            "Stahlborn": 34.0, "Cascade": 20.0, "Roketstad": 14.0,
            "Iziz": 34.0, "Pylon": 14.0,
            "Ledge": 20.0,
            "Amaro": 22.0,
            "Spirladunon": 14.0, "Ardent": 12.0, "Tallwalls": 14.0,
            "Voth": 24.0, "Drum": 12.0,
            "Fulcrum": 24.0, "Bastion": 12.0,
            "Hall of Heroes": 11.0,  # Kimr mammoth-hide & glyptodont-shell heavy lamellar
            "Mav's Refuge": 9.5,     # Beast Rider giant-chitin carapace armor (inner-crater trade)
        }
        sup["armor"] = ARMOR_ARMOURIES.get(nm, 0.0)
        dem["armor"] = (0.44 if st_type == "fort" or pol in ("Empire of Iziz", "Vothic Kingdom", "Eternal State", "Realm of Dalab", "Xanadu Sultanate", "Jimjam", "Hookfleet", "Beast Riders", "Yeti Kingdom", "Jabal Shiekdom") else 0.28) * kpop

        WEAPONS_BLADESMITHS = {
            "Amaro": 36.0, "Urundashi": 11.0,      # Shumari Sword-Caste watered-steel sabres & lances!
            "Stahlborn": 30.0, "Cascade": 18.0, "Glaive": 11.0,
            "Ardent": 18.5,                        # Free Clans highland claymores & broadswords
            "Tallwalls": 20.0,                     # Free Giants Da-Holwey forge-guild halberds & greatswords
            "Ledge": 18.0,
            "Iziz": 30.0, "Pylon": 12.0,
            "Qiblai": 18.0, "Strongbow": 11.0,     # Vale of Xanadu gilt-hilted wootz scimitars
            "Voth": 22.0, "Drum": 12.0,
            "Dalab": 18.0, "Blade": 14.5,          # Dalab & frontier sword-town of Blade!
            "Fulcrum": 22.0, "Bastion": 10.0,
        }
        sup["weapons"] = WEAPONS_BLADESMITHS.get(nm, 0.0)
        dem["weapons"] = (0.48 if st_type == "fort" or pol in ("Empire of Iziz", "Vothic Kingdom", "Eternal State", "Xanadu Sultanate", "Jimjam", "Hookfleet", "Beast Riders", "Yeti Kingdom", "Nomad Country", "Jabal Shiekdom", "Coyote Kingdom") else 0.30) * kpop

    # --- Pass 3: Explicit Multi-Step Input-Output Wiring Across All Production Chains ---
    # Wire upstream raw/intermediate goods (`silica-sand`, `alkali`, `potash`, `coal`, `peat`, `glass`,
    # `fine-ceramics`, `sugar`, `isle-spice`, `tobacco`, `sulfur`, `rubber`, `abyss-lac`, `cotton`, `silk`,
    # `iron`, `nickel`, `bronze`, `zinc`, `machine-wax`, `saltpeter`, `food`, `timber`) directly into the
    # industrial demand of settlements producing downstream finished goods!
    for sid, s in setts.items():
        pol = s["polity"]
        if pol in ("Ria Valley", "The Crook", "Lizardmen", "Screamer Country", "Ring Sea Pirates"):
            continue
        sup, dem = s["supply"], s["demand"]

        # 1. Glasshouses (`silica-sand` + `alkali`/`potash` + `coal`/`peat` -> `glass`):
        g_out = sup.get("glass", 0.0)
        if g_out > 0:
            dem["silica-sand"] = dem.get("silica-sand", 0.0) + 1.22 * g_out
            dem["alkali"] = dem.get("alkali", 0.0) + 0.22 * g_out
            dem["potash"] = dem.get("potash", 0.0) + 0.16 * g_out
            if pol == "Iron Republic":
                dem["peat"] = dem.get("peat", 0.0) + 0.55 * g_out
                dem["coal"] = dem.get("coal", 0.0) + 0.35 * g_out
            else:
                dem["coal"] = dem.get("coal", 0.0) + 0.75 * g_out
        # Optical `lenses` & Geomancer `electrics` consume clear `glass` blanks/bulbs:
        dem["glass"] = dem.get("glass", 0.0) + 0.35 * sup.get("lenses", 0.0) + 0.28 * sup.get("electrics", 0.0)

        # Compass Hills `magnets` supply (Korona/Silkhead gateway relay) & demand (maritime compasses + high-tech dynamos/servos/mechs):
        if nm == "Hoar-Table Village (K7)":
            sup["magnets"] = max(sup.get("magnets", 0.0), 4.0)
        elif nm == "Silkhead":
            sup["magnets"] = max(sup.get("magnets", 0.0), 6.0)
        mag_dem = (
            0.32 * sup.get("ship-hulls", 0.0)       # binnacle compasses for newly built hulls
            + 0.22 * sup.get("lenses", 0.0)         # Roketstad/Ys surveying & marine compasses
            + 0.26 * sup.get("electrics", 0.0)      # Yuni/Locus Geomancer dynamo field magnets
            + 0.28 * sup.get("cybernetics", 0.0)    # Carcosa/Henge Yusar servo-motors
            + 0.14 * sup.get("arms", 0.0)           # Forgemaster war-walker actuators & gyro-compasses
            + 0.10 * sup.get("energy-cells", 0.0)   # magnetic containment / regulator coils
        )
        if gs["sea_cells"] > 0 and pol in ("Vothic Kingdom", "Eternal State", "Empire of Iziz", "League: Ys", "League: Tethys", "League: Pontus", "League: Trigon", "Hookfleet", "Kautoa", "Shell Province", "West Ring Islanders", "Ring Sea Pirates"):
            mag_dem += 0.12 + 0.035 * (s["population"] / 1000.0)
        if nm in ("Fulcrum", "Iziz", "Yuni", "Roketstad", "Carcosa", "Dalab", "Erehwon", "Longsong", "Ledge"):
            mag_dem = max(mag_dem, 0.45 + 0.025 * min(s["population"] / 1000.0, 40.0))
        if mag_dem > 0 and pol not in ("Spider Lake Guilds", "Korona Tribes", "Silkhead (Korona Gateway)"):
            dem["magnets"] = round(dem.get("magnets", 0.0) + mag_dem, 3)

        # 2. East Abyss Rubber Vulcanization (`sulfur` + swamp `peat`/`coal` -> `rubber`):
        rub_out = sup.get("rubber", 0.0)
        if rub_out > 0:
            dem["sulfur"] = dem.get("sulfur", 0.0) + 0.15 * rub_out
            dem["peat"] = dem.get("peat", 0.0) + 0.22 * rub_out

        # 3. Luxury & Fermented Beverage Chains (first-step ingredients + containers + kiln/still fuel):
        if pol != "Yeti Kingdom":  # Yeti wine/champagne is plundered raid booty, not fermented on-site
            ch_out = sup.get("champagne", 0.0)
            if ch_out > 0:
                dem["sugar"] = dem.get("sugar", 0.0) + 0.52 * ch_out    # Eternal State imports cane sugar!
                dem["glass"] = dem.get("glass", 0.0) + 0.45 * ch_out    # Heavy pressure-proof bottles
                dem["rubber"] = dem.get("rubber", 0.0) + 0.09 * ch_out  # Airtight Abyssal rubber stoppers!
            wi_out = sup.get("wine", 0.0)
            if wi_out > 0:
                dem["glass"] = dem.get("glass", 0.0) + 0.16 * wi_out
                dem["timber"] = dem.get("timber", 0.0) + 0.35 * wi_out

        rr_out = sup.get("ranjrum", 0.0)
        if rr_out > 0:
            dem["sugar"] = dem.get("sugar", 0.0) + 1.35 * rr_out
            dem["isle-spice"] = dem.get("isle-spice", 0.0) + 0.45 * rr_out
            dem["glass"] = dem.get("glass", 0.0) + 0.42 * rr_out
            dem["coal"] = dem.get("coal", 0.0) + 0.45 * rr_out

        ru_out = sup.get("rum", 0.0)
        if ru_out > 0:
            dem["sugar"] = dem.get("sugar", 0.0) + 1.20 * ru_out
            dem["glass"] = dem.get("glass", 0.0) + 0.14 * ru_out
            dem["timber"] = dem.get("timber", 0.0) + 0.30 * ru_out

        sc_out = sup.get("scotch", 0.0)
        if sc_out > 0:
            dem["peat"] = dem.get("peat", 0.0) + 2.35 * sc_out          # Malted over bog peat smoke at step 1!
            dem["food"] = dem.get("food", 0.0) + 2.20 * sc_out          # Malting barley
            dem["glass"] = dem.get("glass", 0.0) + 0.42 * sc_out

        wh_out = sup.get("whiskey", 0.0)
        if wh_out > 0:
            dem["food"] = dem.get("food", 0.0) + 1.85 * wh_out
            dem["glass"] = dem.get("glass", 0.0) + 0.22 * wh_out
            dem["timber"] = dem.get("timber", 0.0) + 0.35 * wh_out

        tq_out = sup.get("tequila", 0.0)
        if tq_out > 0:
            dem["glass"] = dem.get("glass", 0.0) + 0.38 * tq_out
            dem["coal"] = dem.get("coal", 0.0) + 0.30 * tq_out

        mz_out = sup.get("mezcal", 0.0)
        if mz_out > 0:
            dem["glass"] = dem.get("glass", 0.0) + 0.32 * mz_out        # Dasri/Jabal imports glass bottles!
            dem["fine-ceramics"] = dem.get("fine-ceramics", 0.0) + 0.14 * mz_out  # Glazed ceramic mezcal flasks!

        sk_out = sup.get("sake", 0.0)
        if sk_out > 0:
            dem["food"] = dem.get("food", 0.0) + 1.45 * sk_out
            dem["fine-ceramics"] = dem.get("fine-ceramics", 0.0) + 0.10 * sk_out
            dem["glass"] = dem.get("glass", 0.0) + 0.14 * sk_out

        br_out = sup.get("beer", 0.0)
        if br_out > 0:
            dem["food"] = dem.get("food", 0.0) + 0.95 * br_out
            dem["timber"] = dem.get("timber", 0.0) + 0.25 * br_out

        # 4. Cigars (`tobacco` + `abyss-lac`/cedar humidors) & Opium (`fine-ceramics`/`glass` phials):
        cg_out = sup.get("cigars", 0.0)
        if cg_out > 0:
            dem["tobacco"] = dem.get("tobacco", 0.0) + 1.15 * cg_out
            dem["abyss-lac"] = dem.get("abyss-lac", 0.0) + 0.04 * cg_out

        op_out = sup.get("opium", 0.0)
        if op_out > 0:
            dem["fine-ceramics"] = dem.get("fine-ceramics", 0.0) + 0.08 * op_out
            dem["glass"] = dem.get("glass", 0.0) + 0.10 * op_out

        # 5. Tailored `clothes`, Joinery `furniture`, and Personal `firearms`, `armor` & `weapons`:
        if pol != "Yeti Kingdom":
            cl_out = sup.get("clothes", 0.0)
            if cl_out > 0:
                dem["cotton"] = dem.get("cotton", 0.0) + 0.55 * cl_out
                dem["silk"] = dem.get("silk", 0.0) + 0.06 * cl_out
                dem["dye-tropical"] = dem.get("dye-tropical", 0.0) + 0.04 * cl_out
                dem["dye-temperate"] = dem.get("dye-temperate", 0.0) + 0.04 * cl_out
                dem["rubber"] = dem.get("rubber", 0.0) + 0.06 * cl_out  # waterproof oilskins & soles

        fu_out = sup.get("furniture", 0.0)
        if fu_out > 0:
            dem["timber"] = dem.get("timber", 0.0) + 1.80 * fu_out
            dem["abyss-lac"] = dem.get("abyss-lac", 0.0) + 0.08 * fu_out
            dem["bronze"] = dem.get("bronze", 0.0) + 0.04 * fu_out
            dem["cotton"] = dem.get("cotton", 0.0) + 0.12 * fu_out

        fa_out = sup.get("firearms", 0.0)
        if fa_out > 0:
            dem["iron"] = dem.get("iron", 0.0) + 0.45 * fa_out
            dem["nickel"] = dem.get("nickel", 0.0) + 0.04 * fa_out
            dem["zinc"] = dem.get("zinc", 0.0) + 0.08 * fa_out
            dem["machine-wax"] = dem.get("machine-wax", 0.0) + 0.07 * fa_out
            dem["saltpeter"] = dem.get("saltpeter", 0.0) + 0.18 * fa_out
            dem["sulfur"] = dem.get("sulfur", 0.0) + 0.12 * fa_out
            dem["coal"] = dem.get("coal", 0.0) + 0.55 * fa_out

        ar_out = sup.get("armor", 0.0)
        if ar_out > 0:
            dem["iron"] = dem.get("iron", 0.0) + 0.65 * ar_out
            dem["nickel"] = dem.get("nickel", 0.0) + 0.06 * ar_out
            dem["bronze"] = dem.get("bronze", 0.0) + 0.06 * ar_out
            dem["coal"] = dem.get("coal", 0.0) + 0.50 * ar_out

        wp_out = sup.get("weapons", 0.0)
        if wp_out > 0:
            dem["iron"] = dem.get("iron", 0.0) + 0.55 * wp_out
            dem["nickel"] = dem.get("nickel", 0.0) + 0.04 * wp_out
            dem["coal"] = dem.get("coal", 0.0) + 0.45 * wp_out
            dem["timber"] = dem.get("timber", 0.0) + 0.25 * wp_out


# ---------------------------------------------------------------------------
# 5. Supplemental Polity Highways / Dirt Roads + 3-Layer Directed Multimodal Graph
#    (Layer 0 Overland + Layer 1 Sea/Lake + Layer 2 Directed Navigable Rivers/Canals)
# ---------------------------------------------------------------------------
HIGHWAY_POLITIES = {
    "Empire of Iziz", "Shell Province", "Dilihan Province",
    "Vothic Kingdom", "Realm of Dalab", "Tungang Union",
    "Eternal State", "Iron Republic", "Xanadu Sultanate",
    "Yuni Emirate", "Jimjam", "Shumari",
    "Tiguantin", "Jabal Shiekdom",
}


def is_highway_polity(pol):
    return pol in HIGHWAY_POLITIES or pol.startswith("League:")


def build_supplemental_roads(
    world, setts, road_mult, net_eng, is_ring_sea,
    mask_lizard_hostile, mask_screamer_hostile, mask_valley,
    mask_north_rift_barrier, mask_south_rift_barrier, mask_eternal_poly,
):
    """Connect terrestrial settlements to their polity's road network by highway,
    build Eternal State mid-quality highways linking highland & lowland villages to Fulcrum,
    build the hazardous navigable dirt road from Jimjam to Qoold Lheek,
    and connect stateless / independent / tribal settlements by dirt road.
    Saves polylines to openworld/roads-supplement-gemini.json and updates road_mult in-place.
    """
    GW, GH, OW, OH = world["GW"], world["GH"], world["OW"], world["OH"]
    N_CELL = GW * GH
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)
    E, W = world["E"], world["W"]

    # Strict terrestrial landmass components (exclude open water & Ring Sea cells)
    land_ok = (~W) & (~is_ring_sea)
    land_lbl, _ = ndimage.label(land_ok)

    # Build 8-connected overland road-survey CSR graph on N_CELL
    idx = np.arange(N_CELL).reshape(GH, GW)
    yy_s, xx_s = np.mgrid[0:GH, 0:GW]
    px_s, py_s = xx_s / su, yy_s / sv
    rows, cols, costs = [], [], []
    rows_ye, cols_ye, costs_ye = [], [], []
    impass_cell = (
        W | is_ring_sea | (E > 7200.0) | mask_valley
        | mask_lizard_hostile | mask_screamer_hostile
        | mask_north_rift_barrier | mask_south_rift_barrier
    )
    # Yeti hazardous northern dirt road skirts strictly NORTH of Jimjam's Lake & outside Eternal State land!
    impass_yeti = impass_cell | mask_eternal_poly | ((px_s < 665.0) & (py_s > 560.0)) | ((px_s >= 560.0) & (px_s <= 740.0) & (py_s > 515.0))

    for dj, di in ((0, 1), (1, 0), (1, 1), (1, -1)):
        a = idx[max(0, -dj):GH - max(0, dj), max(0, -di):GW - max(0, di)].ravel()
        b = idx[max(0, dj):GH + min(0, dj) or None, max(0, di):GW + min(0, di) or None].ravel()
        d_km = 4.0 * math.hypot(dj, di)
        bad = impass_cell.flat[a] | impass_cell.flat[b]
        ea, eb = E.flat[a], E.flat[b]
        g = np.abs(eb - ea) / (d_km * 1000.0)
        # Prefer gentle grades and reuse existing road corridors (0.14x cost on existing roads)
        c = d_km * (1.0 + 3.2 * (g / 0.065) ** 2)
        ex_road = (road_mult.flat[a] < 0.90) & (road_mult.flat[b] < 0.90)
        c_surv = np.where(ex_road, c * 0.14, c)
        c_surv[bad] = np.inf
        ok = np.isfinite(c_surv)
        rows += [a[ok], b[ok]]
        cols += [b[ok], a[ok]]
        costs += [c_surv[ok], c_surv[ok]]

        # Yeti upland dirt-road survey avoids Eternal State territory completely
        bad_ye = impass_yeti.flat[a] | impass_yeti.flat[b]
        c_ye = c.copy()
        c_ye[bad_ye] = np.inf
        ok_ye = np.isfinite(c_ye)
        rows_ye += [a[ok_ye], b[ok_ye]]
        cols_ye += [b[ok_ye], a[ok_ye]]
        costs_ye += [c_ye[ok_ye], c_ye[ok_ye]]

    G_surv = coo_matrix((np.concatenate(costs), (np.concatenate(rows), np.concatenate(cols))), shape=(N_CELL, N_CELL)).tocsr()
    G_yeti = coo_matrix((np.concatenate(costs_ye), (np.concatenate(rows_ye), np.concatenate(cols_ye))), shape=(N_CELL, N_CELL)).tocsr()

    # Group settlements by polity network family (Iziz + Shell + Dilihan + tributary Tiguantin share Imperial Izani network; Dalab + Tungang share Dalab network)
    def net_family(pol):
        if pol in ("Empire of Iziz", "Shell Province", "Dilihan Province", "Tiguantin"):
            return "Izani"
        if pol in ("Realm of Dalab", "Tungang Union"):
            return "Dalab"
        return pol

    existing_road_mask = (road_mult < 0.90) & (~impass_cell)
    supp_routes = []

    def trace_cell_chain(pred_arr, src_cell, dst_cell, max_steps=4000):
        out_c = []
        cur = dst_cell
        guard = 0
        while cur != src_cell and cur >= 0 and guard < max_steps:
            out_c.append(cur)
            cur = int(pred_arr[cur])
            guard += 1
        if cur != src_cell:
            return None
        out_c.append(src_cell)
        out_c.reverse()
        return out_c

    # 1. Eternal State mid-quality highways (0.72x) linking highland & lowland villages directly to Fulcrum (409, 621)
    fulcrum_s = next((s for s in setts.values() if s["name"] == "Fulcrum"), None)
    if fulcrum_s is not None:
        fx, fy = snap_to_land(world, fulcrum_s["px"], fulcrum_s["py"])
        fc_cell = int(round(fy * sv)) * GW + int(round(fx * su))
        et_trunk_cells = {fc_cell}
        et_vil_list = [
            s for s in sorted(setts.values(), key=lambda x: -x["population"])
            if s["polity"] == "Eternal State" and s["name"] != "Fulcrum" and not s.get("abstract_region")
        ]
        for s_et in et_vil_list:
            sx, sy = snap_to_land(world, s_et["px"], s_et["py"])
            sc_et = int(round(sy * sv)) * GW + int(round(sx * su))
            dist_et, pred_et = dijkstra(G_surv, directed=False, indices=sc_et, return_predecessors=True, limit=950.0)
            best_t = min(et_trunk_cells, key=lambda tc: float(dist_et[tc]), default=None)
            if best_t is not None and np.isfinite(dist_et[best_t]):
                p_cells = trace_cell_chain(pred_et, sc_et, best_t)
                if p_cells:
                    pts_px = []
                    for idx_c, pc in enumerate(p_cells):
                        pj, pi = divmod(pc, GW)
                        road_mult[pj, pi] = min(road_mult[pj, pi], 0.72)  # mid-quality Eternal State highway!
                        if E[pj, pi] > 650.0:
                            net_eng[pj, pi] = True  # engineered State switchbacks up to Sheritu / Mirabilis / Veil
                        existing_road_mask[pj, pi] = True
                        et_trunk_cells.add(pc)
                        if idx_c == 0 or idx_c == len(p_cells) - 1 or idx_c % 2 == 0:
                            pts_px.append([round(pi / su, 1), round(pj / sv, 1)])
                    if len(pts_px) >= 2:
                        supp_routes.append({
                            "id": f"supp.eternal_mid_hwy.{s_et['id']}",
                            "settlement": f"{s_et['name']} -> Fulcrum",
                            "polity": "Eternal State",
                            "class": "polity_highway",
                            "quality": "mid",
                            "km": round(4.0 * (len(p_cells) - 1), 1),
                            "px": pts_px,
                        })

    # 2. Hazardous, navigable dirt road stretching from Qoold Lheek (410,506) via Leng (490,554) to Jimjam (745,546)
    qoold_s = next((s for s in setts.values() if s["name"] == "Qoold Lheek"), None)
    leng_s = next((s for s in setts.values() if s["name"] == "Leng"), None)
    jimjam_s = next((s for s in setts.values() if s["name"] == "Jimjam"), None)
    if qoold_s and leng_s and jimjam_s:
        qx, qy = snap_to_land(world, qoold_s["px"], qoold_s["py"])
        lx, ly = snap_to_land(world, leng_s["px"], leng_s["py"])
        jx, jy = snap_to_land(world, jimjam_s["px"], jimjam_s["py"])
        qc = int(round(qy * sv)) * GW + int(round(qx * su))
        lc = int(round(ly * sv)) * GW + int(round(lx * su))
        jc = int(round(jy * sv)) * GW + int(round(jx * su))
        _, pred_q = dijkstra(G_yeti, directed=False, indices=qc, return_predecessors=True)
        _, pred_l = dijkstra(G_yeti, directed=False, indices=lc, return_predecessors=True)
        leg1 = trace_cell_chain(pred_q, qc, lc)
        leg2 = trace_cell_chain(pred_l, lc, jc)
        if leg1 and leg2:
            full_yj = leg1 + leg2[1:]
            pts_yj = []
            for idx_c, pc in enumerate(full_yj):
                pj, pi = divmod(pc, GW)
                road_mult[pj, pi] = min(road_mult[pj, pi], 0.84)
                existing_road_mask[pj, pi] = True
                if idx_c == 0 or idx_c == len(full_yj) - 1 or idx_c % 2 == 0:
                    pts_yj.append([round(pi / su, 1), round(pj / sv, 1)])
            supp_routes.append({
                "id": "supp.jimjam_qoold_lheek_dirt",
                "settlement": "Qoold Lheek <-> Leng <-> Jimjam",
                "polity": "Yeti Kingdom / Jimjam",
                "class": "dirt_road",
                "quality": "hazardous_navigable",
                "km": round(4.0 * (len(full_yj) - 1), 1),
                "px": pts_yj,
            })

    # Candidate settlements to connect (skip autarkic Lizardmen & Screamers, and skip abstract exterior sea regions)
    cand_sids = [
        sid for sid, s in sorted(setts.items(), key=lambda kv: (-int(is_highway_polity(kv[1]["polity"])), -kv[1]["population"]))
        if s["polity"] not in ("Lizardmen", "Screamer Country") and not s.get("abstract_region")
    ]

    # Also include unpinned minor Catch desert oasis stations (Bitta, Lasso) as dirt-road stations
    extra_oases = [
        ("oasis_bitta", "Bitta", 1088.0, 1455.0),
        ("oasis_lasso", "Lasso", 1083.0, 1474.0),
    ]

    # Pre-collect cells per network family
    fam_cells = defaultdict(list)
    all_sett_cells = []
    for sid in cand_sids:
        s = setts[sid]
        sx, sy = snap_to_land(world, s["px"], s["py"])
        ci, cj = int(round(sx * su)), int(round(sy * sv))
        if 0 <= cj < GH and 0 <= ci < GW and not impass_cell[cj, ci]:
            c = cj * GW + ci
            fam_cells[net_family(s["polity"])].append((sid, c, int(land_lbl[cj, ci])))
            all_sett_cells.append((sid, c, int(land_lbl[cj, ci])))

    for sid in cand_sids:
        s = setts[sid]
        pol = s["polity"]
        if pol == "Eternal State":
            continue  # handled above with explicit mid-quality highways to Fulcrum
        is_hwy = is_highway_polity(pol)
        sx, sy = snap_to_land(world, s["px"], s["py"])
        ci, cj = int(round(sx * su)), int(round(sy * sv))
        if not (0 <= cj < GH and 0 <= ci < GW) or impass_cell[cj, ci]:
            continue
        src_c = cj * GW + ci
        lcomp = int(land_lbl[cj, ci])
        if lcomp == 0:
            continue

        # Check if already right on a road of appropriate grade (within 1 cell = 4 km)
        nb_rm = road_mult[max(0, cj - 1):min(GH, cj + 2), max(0, ci - 1):min(GW, ci + 2)]
        if is_hwy and float(nb_rm.min()) <= 0.76:
            continue
        if (not is_hwy) and float(nb_rm.min()) <= 0.88:
            continue

        # Determine target cells on the SAME landmass component
        targets = set()
        if is_hwy:
            fam = net_family(pol)
            for osid, oc, olc in fam_cells[fam]:
                if osid != sid and olc == lcomp:
                    targets.add(oc)
                    # Also include existing road cells within 8 cells (32 km) of same-polity settlements
                    oj, oi = divmod(oc, GW)
                    for dj_r in range(-8, 9):
                        for di_r in range(-8, 9):
                            rj, ri = oj + dj_r, oi + dj_r
                            if 0 <= rj < GH and 0 <= ri < GW and existing_road_mask[rj, ri] and land_lbl[rj, ri] == lcomp:
                                targets.add(rj * GW + ri)
        else:
            # Stateless / independent / tribal settlement -> dirt road to nearest road or settlement on same landmass
            for osid, oc, olc in all_sett_cells:
                if osid != sid and olc == lcomp:
                    targets.add(oc)
            # Existing road cells within 45 cells (180 km) on same landmass
            y0, y1 = max(0, cj - 45), min(GH, cj + 46)
            x0, x1 = max(0, ci - 45), min(GW, ci + 46)
            sub_mask = existing_road_mask[y0:y1, x0:x1] & (land_lbl[y0:y1, x0:x1] == lcomp)
            ry_arr, rx_arr = np.nonzero(sub_mask)
            for ry_i, rx_i in zip(ry_arr, rx_arr):
                targets.add((y0 + int(ry_i)) * GW + (x0 + int(rx_i)))

        if not targets:
            continue

        # Bounded local window Dijkstra via single-source on G_surv (fast: stops via distance threshold)
        max_limit = 780.0 if is_hwy else 520.0
        dist_s, pred_s = dijkstra(G_surv, directed=False, indices=src_c, return_predecessors=True, limit=max_limit)
        best_t = None
        best_d = float("inf")
        for tc in targets:
            d_val = float(dist_s[tc])
            if d_val < best_d:
                best_d = d_val
                best_t = tc
        if best_t is None or not np.isfinite(best_d):
            continue

        # Trace cell path src_c -> ... -> best_t
        path_cells = trace_cell_chain(pred_s, src_c, best_t)
        if not path_cells:
            continue

        m_target = 0.65 if is_hwy else 0.84
        rclass = "polity_highway" if is_hwy else "dirt_road"
        pts_px = []
        new_km = 0.0
        for idx_c, pc in enumerate(path_cells):
            pj, pi = divmod(pc, GW)
            if road_mult[pj, pi] > m_target:
                new_km += 4.0
            road_mult[pj, pi] = min(road_mult[pj, pi], m_target)
            existing_road_mask[pj, pi] = True
            if idx_c == 0 or idx_c == len(path_cells) - 1 or idx_c % 2 == 0:
                pts_px.append([round(pi / su, 1), round(pj / sv, 1)])

        if len(pts_px) >= 2 and new_km >= 4.0:
            supp_routes.append({
                "id": f"supp.{sid}",
                "settlement": s["name"],
                "polity": pol,
                "class": rclass,
                "km": round(4.0 * (len(path_cells) - 1), 1),
                "px": pts_px,
            })

    # Connect unpinned Catch oases (Kolli, Arfwai, Bitta, Lasso) by dirt road along the Catch chain
    for oid, onm, opx, opy in extra_oases:
        sx, sy = snap_to_land(world, opx, opy)
        ci, cj = int(round(sx * su)), int(round(sy * sv))
        if not (0 <= cj < GH and 0 <= ci < GW) or impass_cell[cj, ci]:
            continue
        src_c = cj * GW + ci
        lcomp = int(land_lbl[cj, ci])
        y0, y1 = max(0, cj - 40), min(GH, cj + 41)
        x0, x1 = max(0, ci - 40), min(GW, ci + 41)
        sub_mask = existing_road_mask[y0:y1, x0:x1] & (land_lbl[y0:y1, x0:x1] == lcomp)
        ry_arr, rx_arr = np.nonzero(sub_mask)
        targets = {(y0 + int(ry_i)) * GW + (x0 + int(rx_i)) for ry_i, rx_i in zip(ry_arr, rx_arr)} - {src_c}
        if not targets:
            continue
        dist_s, pred_s = dijkstra(G_surv, directed=False, indices=src_c, return_predecessors=True, limit=420.0)
        best_t = min(targets, key=lambda tc: float(dist_s[tc]), default=None)
        if best_t is None or not np.isfinite(dist_s[best_t]):
            continue
        path_cells = []
        cur = best_t
        while cur != src_c and cur >= 0 and len(path_cells) < 2000:
            path_cells.append(cur)
            cur = int(pred_s[cur])
        if cur == src_c:
            path_cells.append(src_c)
            path_cells.reverse()
            pts_px = []
            for idx_c, pc in enumerate(path_cells):
                pj, pi = divmod(pc, GW)
                road_mult[pj, pi] = min(road_mult[pj, pi], 0.84)
                existing_road_mask[pj, pi] = True
                if idx_c == 0 or idx_c == len(path_cells) - 1 or idx_c % 2 == 0:
                    pts_px.append([round(pi / su, 1), round(pj / sv, 1)])
            if len(pts_px) >= 2:
                supp_routes.append({
                    "id": f"supp.{oid}",
                    "settlement": onm,
                    "polity": "Catch Oasis (Stateless)",
                    "class": "dirt_road",
                    "km": round(4.0 * (len(path_cells) - 1), 1),
                    "px": pts_px,
                })

    # Wire engineered mountain switchback road across Strongbow–Kirstabal scarp (connecting xanadu.1.3 [992,1596] to Strongbow [1001,1596]
    # so ALL intra-Xanadu trade moves on Xanadu roads!) and the Twins / White Gills mountain pass roads from Stair to Strongbow:
    engineered_pass_chains = [
        ("supp.xanadu_strongbow_scarp_hwy", "Strongbow <-> Kirstabal <-> Vale Road", "Xanadu Sultanate", "polity_highway", 0.64, True,
         [(1001.0, 1596.0), (992.0, 1596.0), (989.0, 1600.0)]),
        ("supp.catch_twins_pass", "Stair <-> The Twins <-> Strongbow", "Twins Pass Wardenry", "dirt_road", 0.78, True,
         [(1106.0, 1442.0), (1042.0, 1525.0), (1001.0, 1596.0)]),
        ("supp.catch_white_gills_pass", "Stair <-> White Gills Hermitage <-> Strongbow", "Order of Historians", "dirt_road", 0.80, True,
         [(1106.0, 1442.0), (1035.0, 1535.0), (1001.0, 1596.0)]),
    ]
    for pid, pset, ppol, pcls, pmul, peng, wpts in engineered_pass_chains:
        pts_chain = []
        cell_count = 0
        for kw in range(len(wpts) - 1):
            wx0, wy0 = snap_to_land(world, wpts[kw][0], wpts[kw][1])
            wx1, wy1 = snap_to_land(world, wpts[kw + 1][0], wpts[kw + 1][1])
            x0c, y0c = wx0 * su, wy0 * sv
            x1c, y1c = wx1 * su, wy1 * sv
            st_n = max(2, int(math.hypot(x1c - x0c, y1c - y0c) * 2) + 1)
            for t_v in np.linspace(0.0, 1.0, st_n):
                ci_p, cj_p = int(round(x0c + t_v * (x1c - x0c))), int(round(y0c + t_v * (y1c - y0c)))
                if 0 <= cj_p < GH and 0 <= ci_p < GW and not W[cj_p, ci_p]:
                    road_mult[cj_p, ci_p] = min(road_mult[cj_p, ci_p], pmul)
                    if peng:
                        net_eng[cj_p, ci_p] = True
                    existing_road_mask[cj_p, ci_p] = True
                    cell_count += 1
            pts_chain.append([round(wx0, 1), round(wy0, 1)])
        pts_chain.append([round(wpts[-1][0], 1), round(wpts[-1][1], 1)])
        supp_routes.append({
            "id": pid,
            "settlement": pset,
            "polity": ppol,
            "class": pcls,
            "km": round(2.2 * cell_count, 1),
            "px": pts_chain,
        })

    out_supp = os.path.join(ROOT, "openworld", "roads-supplement-gemini.json")
    with open(out_supp, "w", encoding="utf-8") as f:
        json.dump(
            {
                "format": "krator-roads-supplement-gemini",
                "version": 1,
                "highway_count": sum(1 for r in supp_routes if r["class"] == "polity_highway"),
                "dirt_road_count": sum(1 for r in supp_routes if r["class"] == "dirt_road"),
                "routes": supp_routes,
            },
            f,
            indent=2,
        )
    print(
        f"Saved supplemental roads: {out_supp} "
        f"({sum(1 for r in supp_routes if r['class'] == 'polity_highway')} polity highways, "
        f"{sum(1 for r in supp_routes if r['class'] == 'dirt_road')} dirt roads)"
    )
    return supp_routes


def build_multimodal_graphs(world, setts):
    GW, GH, OW, OH = world["GW"], world["GH"], world["OW"], world["OH"]
    N_CELL = GW * GH
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)
    E, W, RAIN = world["E"], world["W"], world["RAIN"]

    # Identify sea vs inland lake water components
    lbl, ncomp = ndimage.label(W)
    comp_sizes = np.bincount(lbl.ravel())
    # Ring Sea & Farside Ocean are huge (>5000 cells); Iziz Lake, Erehwon, Spider Lake, Shim, Trigon lakes >= 12 cells
    nav_water = W & (comp_sizes[lbl] >= 12)
    inland_lake = nav_water & (comp_sizes[lbl] < 5000)
    # Identify Ring Sea water component specifically (840, 910 is open strait water off Hook; NOT Throne island!)
    rs_i, rs_j = int(round(840 * su)), int(round(910 * sv))
    ring_sea_comp = int(lbl[rs_j, rs_i])
    assert ring_sea_comp > 0, "Expected Ring Sea water component > 0"
    is_ring_sea = (lbl == ring_sea_comp)

    # Blocked, wartime & raider-hazard polygons:
    mask_valley = poly_mask(world["regs"], {"ancient's valley", "ancients valley"}, GW, GH, OW, OH)
    mask_korona = poly_mask(world["regs"], {"korona / ne"}, GW, GH, OW, OH)
    mask_lizard_poly = poly_mask(world["regs"], {"lizardmen"}, GW, GH, OW, OH)
    mask_screamer_poly = poly_mask(world["regs"], {"screamer country"}, GW, GH, OW, OH)
    mask_yeti_poly = poly_mask(world["regs"], {"yeti kingdom"}, GW, GH, OW, OH)
    mask_painted_poly = poly_mask(world["regs"], {"painted men"}, GW, GH, OW, OH)
    mask_fellgang_poly = poly_mask(world["regs"], {"fellgangs"}, GW, GH, OW, OH)
    mask_scyvoi_poly = poly_mask(world["regs"], {"scyvoi"}, GW, GH, OW, OH)
    mask_vale_xanadu = poly_mask(world["regs"], {"vale of xanadu"}, GW, GH, OW, OH)
    mask_iziz_poly = poly_mask(world["regs"], {"empire of iziz"}, GW, GH, OW, OH)
    mask_shell_poly = poly_mask(world["regs"], {"shell province"}, GW, GH, OW, OH)
    mask_kautoa_poly = poly_mask(world["regs"], {"kautoa"}, GW, GH, OW, OH)
    mask_voth_poly = poly_mask(world["regs"], {"vothic kingdom"}, GW, GH, OW, OH)
    mask_dalab_poly = poly_mask(world["regs"], {"realm of dalab"}, GW, GH, OW, OH)
    mask_eternal_poly = poly_mask(world["regs"], {"eternal state"}, GW, GH, OW, OH)
    mask_throne_poly = poly_mask(world["regs"], {"throne"}, GW, GH, OW, OH)
    mask_vrivolci_poly = poly_mask(world["regs"], {"vrivolci"}, GW, GH, OW, OH)
    mask_swhigh_poly = poly_mask(world["regs"], {"sw highlands", "frogmen"}, GW, GH, OW, OH)
    mask_beastrider_raw = poly_mask(world["regs"], {"hyperjungle n", "savage hyperjungle"}, GW, GH, OW, OH)
    mask_dam_ne = poly_mask(world["regs"], {"dam", "dam 2", "n semiarid"}, GW, GH, OW, OH)
    mask_coyote_full = poly_mask(world["regs"], {"coyote kingdom", "n outlands", "s outlands"}, GW, GH, OW, OH) & (~W)
    mask_nomad_full = poly_mask(world["regs"], {"nomad country", "e abyss", "e abysss", "e badlands"}, GW, GH, OW, OH) & (~W)
    mask_desert_polys = poly_mask(
        world["regs"],
        {
            "nomad country", "n outlands", "s outlands", "coyote kingdom", "the tiers",
            "the bowl", "the catch", "e abyss", "e abysss", "e badlands", "sedesert",
        },
        GW, GH, OW, OH,
    )

    yy_g, xx_g = np.mgrid[0:GH, 0:GW]
    px_g, py_g = xx_g / su, yy_g / sv
    mask_desert_polys |= (px_g >= 980.0) & (py_g >= 340.0) & (py_g <= 1515.0) & (RAIN < 430.0)

    # 1. Lizardman core Rift floor (impassably hostile to human merchants) vs border raid belts into Xanadu & S Dalab/Fellgangs
    xanadu_core = (mask_vale_xanadu | ((px_g >= 792.0) & (px_g <= 1050.0) & (py_g >= 1475.0) & (py_g <= 1625.0))) & (~W)
    mask_lizard_hostile = (
        mask_lizard_poly | (ndimage.binary_dilation(mask_lizard_poly, iterations=5) & (E < 1400.0))
    ) & (~xanadu_core)
    for sid_lz, s_lz in setts.items():
        if s_lz["polity"] == "Lizardmen":
            li, lj = int(round(s_lz["px"] * su)), int(round(s_lz["py"] * sv))
            mask_lizard_hostile |= (((xx_g - li) ** 2 + (yy_g - lj) ** 2) <= 7 ** 2) & (E < 1400.0) & (~xanadu_core)

    mask_lizard_raid_xanadu = (
        mask_vale_xanadu | ((px_g >= 775.0) & (px_g <= 965.0) & (py_g >= 1475.0) & (py_g <= 1625.0))
    ) & (~W) & (~mask_lizard_hostile)
    mask_lizard_raid_dalab = (
        (px_g >= 395.0) & (px_g <= 585.0) & (py_g >= 1345.0) & (py_g <= 1575.0)
    ) & (~W) & (~mask_lizard_hostile)

    # 2. Screamer Country core (Hexahedron) + unescorted Dilihan-Port Visas Screamer-wood fringe
    mask_screamer_hostile = (mask_screamer_poly | ndimage.binary_dilation(mask_screamer_poly, iterations=2)) & (~W)
    for sid_sc, s_sc in setts.items():
        if s_sc["polity"] == "Screamer Country":
            si_, sj_ = int(round(s_sc["px"] * su)), int(round(s_sc["py"] * sv))
            mask_screamer_hostile |= (((xx_g - si_) ** 2 + (yy_g - sj_) ** 2) <= 6 ** 2) & (~W)
    mask_visas_unescorted = ((px_g >= 752.0) & (px_g <= 816.0) & (py_g >= 668.0) & (py_g <= 724.0)) & (~W)

    # 3. Yeti frontier & northern Eternian / Farside raid belt
    mask_yeti_raid = (mask_yeti_poly | ndimage.binary_dilation(mask_yeti_poly, iterations=4)) & (~W)

    # 4. Painted Men plateau & occasional neighbor-raiding halo
    mask_painted_core = mask_painted_poly & (~W)
    mask_painted_halo = (ndimage.binary_dilation(mask_painted_poly, iterations=5) & (~mask_painted_poly)) & (~W)

    # 5. Fellgang highland raider tribes & southern Dalab border halo
    mask_fellgang_core = mask_fellgang_poly & ((py_g >= 1368.0) | (E > 1800.0)) & (~W)
    mask_fellgang_halo = (ndimage.binary_dilation(mask_fellgang_poly, iterations=4) & (~mask_fellgang_core)) & (~W)

    # 6. Scyvoi drylands & lowland neighbor-raiding belt
    mask_scyvoi_core = mask_scyvoi_poly & (~W)
    mask_scyvoi_halo = (ndimage.binary_dilation(mask_scyvoi_poly, iterations=5) & (~mask_scyvoi_poly) & (E < 950.0)) & (~W)

    # 7. Beast Riders (hyperjungle n & savage hyperjungle: hostile to Iziz)
    kautoa_shell_safe = mask_kautoa_poly | mask_shell_poly | (py_g >= 902.0)
    br_disks = np.zeros((GH, GW), dtype=bool)
    for sid_br, s_br in setts.items():
        if s_br["polity"] == "Beast Riders":
            bi_, bj_ = int(round(s_br["px"] * su)), int(round(s_br["py"] * sv))
            br_disks |= ((xx_g - bi_) ** 2 + (yy_g - bj_) ** 2) <= 10 ** 2
        elif s_br["name"] in ("Kautoa", "Valapo", "Bipo", "Port Goto", "Shell", "Fort Vaklu", "Fridon", "Talia"):
            si_k, sj_k = int(round(s_br["px"] * su)), int(round(s_br["py"] * sv))
            kautoa_shell_safe |= ((xx_g - si_k) ** 2 + (yy_g - sj_k) ** 2) <= 4 ** 2
    mask_beastrider_core = ((mask_beastrider_raw | br_disks) & (~kautoa_shell_safe)) & (~W)
    mask_beastrider_halo = (ndimage.binary_dilation(mask_beastrider_core, iterations=4) & (~mask_beastrider_core)) & (~W)

    # 8. Free Giants (Vrivolci) raiding Realm of Dalab & Vothic Kingdom
    mask_vrivolci_core = mask_vrivolci_poly & (~W)
    mask_vrivolci_halo = (ndimage.binary_dilation(mask_vrivolci_poly, iterations=6) & (~mask_vrivolci_poly)) & (~W)

    # 9. Boatmurder Bandits — highwaymen on the NE highways
    ne_hwy_box = (px_g >= 690.0) & (px_g <= 1195.0) & (py_g >= 350.0) & (py_g <= 525.0)
    mask_boatmurder_bandits = (mask_dam_ne | ne_hwy_box) & (~W)

    # 10. Frogmen / SW Highlanders raiding neighbors EXCEPT Realm of Dalab (peace treaty via Span!)
    span_safe = ((xx_g - int(round(554 * su))) ** 2 + (yy_g - int(round(1010 * sv))) ** 2) <= 4 ** 2
    mask_swhigh_core = (mask_swhigh_poly & (~span_safe)) & (~W)
    mask_swhigh_halo = (
        ndimage.binary_dilation(mask_swhigh_poly, iterations=6) & (~mask_swhigh_poly) & (~mask_dalab_poly) & (~span_safe)
    ) & (~W)

    # 11. Coyotemen <-> Eastern Nomads border raids & Desert Nomad bandits ranging across the WHOLE eastern & northern desert
    mask_coyote_nomad_raid = ndimage.binary_dilation(mask_coyote_full, iterations=6) & ndimage.binary_dilation(mask_nomad_full, iterations=6) & (~W)
    mask_nomad_desert_bandits = (mask_desert_polys & ((RAIN < 480.0) | mask_nomad_full)) & (~W)

    # Cold/airless N Rift Rim & SW Highlands barrier (exempting Vale of Xanadu AND the Twins / White Gills pass pocket!)
    twins_pass_pocket = (px_g >= 990.0) & (px_g <= 1118.0) & (py_g >= 1435.0) & (py_g <= 1605.0)
    erehwon_pocket = ((px_g >= 796.0) & (px_g <= 845.0) & (py_g >= 1476.0) & (py_g <= 1528.0)) | mask_vale_xanadu | twins_pass_pocket
    mask_north_rift_barrier = ((px_g >= 468.0) & (px_g <= 1022.0) & (py_g >= 1318.0) & (py_g <= 1509.0)) & (~erehwon_pocket)
    mask_south_rift_barrier = (px_g >= 468.0) & (px_g <= 788.0) & (py_g >= 1509.0) & (py_g <= 1722.0)

    # Rasterize native 5.1 road network from claude/ancient-network-9cc3e7 (openworld/net51-gemini.json) + God's Road
    road_mult = np.ones((GH, GW), dtype=np.float32)
    net_eng = np.zeros((GH, GW), dtype=bool)
    dx_leg, dy_leg = LEGACY_SHIFT

    SKIP_NET51_IDS = {
        "rift.chimes-cthonos", "rift.cthonos-tubes", "rift.tubes-pile", "rift.pile-theodiga",
        "rift.theodiga-strongbow", "rift.bowl.theodiga-stair", "ext.southwest",
        "r.sevq8lqqjy.s1ugpi6uas",  # dead/severed Leng-to-Lux link across hostile Yeti-Eternia frontier!
    }
    CLASS_UP_MULT = {
        "trunk": {"kept": 0.55, "partly": 0.72, "shoddy": 0.76, "lapsed": 0.86, "decayed": 0.95},
        "line": {"kept": 0.56, "partly": 0.72, "shoddy": 0.76, "lapsed": 0.86, "decayed": 0.95},
        "branch": {"kept": 0.58, "partly": 0.74, "shoddy": 0.78, "lapsed": 0.87, "decayed": 0.95},
        "izani": {"kept": 0.62, "partly": 0.75, "shoddy": 0.78, "lapsed": 0.88, "decayed": 0.96},
        "vothic": {"kept": 0.62, "partly": 0.75, "shoddy": 0.78, "lapsed": 0.88, "decayed": 0.96},
        "trade": {"kept": 0.66, "partly": 0.76, "shoddy": 0.80, "lapsed": 0.88, "decayed": 0.96},
        "xanadu": {"kept": 0.64, "partly": 0.72, "shoddy": 0.78, "lapsed": 0.86, "decayed": 0.94},
        "yuni": {"kept": 0.66, "partly": 0.76, "shoddy": 0.80, "lapsed": 0.88, "decayed": 0.96},
    }
    DEFAULT_UP_MULT = {"kept": 0.78, "partly": 0.84, "shoddy": 0.86, "lapsed": 0.88, "decayed": 0.93}

    if world.get("net51"):
        for r in world["net51"].get("routes", []):
            rid = r.get("id")
            if rid in SKIP_NET51_IDS:
                continue
            rcls = r.get("class", "dirt")
            up_list = r.get("up", [])
            form_list = r.get("form", [])
            pts = r.get("px", [])
            cmap = CLASS_UP_MULT.get(rcls, DEFAULT_UP_MULT)
            for idx_p in range(len(pts) - 1):
                st = up_list[min(idx_p, len(up_list) - 1)] if up_list else "lapsed"
                fm = form_list[min(idx_p, len(form_list) - 1)] if form_list else "open"
                m_val = cmap.get(st, 0.92)
                is_eng = fm in ("tunnel", "viaduct", "causeway", "cut") and st in ("kept", "partly", "shoddy", "lapsed")
                # No functional ancient tubes between Parabola and Arcbeam — open surface Ancient highway ONLY!
                if rid in ("r.skz25tuq0w.tbd.bowl", "izani.mantis-bowl"):
                    m_val = min(m_val, 0.58 if rid == "r.skz25tuq0w.tbd.bowl" else 0.66)
                    is_eng = False
                elif rid == "rift.bowl.stair-bowl-arcology":
                    # Active Catch desert oasis caravan road linking Parabola -> Bab al-Hawa -> Kolli -> Arfwai -> Stair
                    m_val = min(m_val, 0.66)
                    is_eng = True
                x0, y0 = pts[idx_p][0] * su, pts[idx_p][1] * sv
                x1, y1 = pts[idx_p + 1][0] * su, pts[idx_p + 1][1] * sv
                steps = max(2, int(math.hypot(x1 - x0, y1 - y0) * 2) + 1)
                for t in np.linspace(0, 1, steps):
                    ci, cj = int(round(x0 + t * (x1 - x0))), int(round(y0 + t * (y1 - y0)))
                    if 0 <= cj < GH and 0 <= ci < GW and not W[cj, ci]:
                        road_mult[cj, ci] = min(road_mult[cj, ci], m_val)
                        if is_eng:
                            net_eng[cj, ci] = True
    else:
        for r in world["ar"]["routes"]:
            up = r.get("upkeep", [])
            pts = r.get("px", [])
            for idx_p in range(len(pts) - 1):
                st = up[min(idx_p, len(up) - 1)] if up else "broken"
                if st not in ("kept", "partly"):
                    continue
                m_val = 0.58 if st == "kept" else 0.78
                x0, y0 = (pts[idx_p][0] + dx_leg) * su, (pts[idx_p][1] + dy_leg) * sv
                x1, y1 = (pts[idx_p + 1][0] + dx_leg) * su, (pts[idx_p + 1][1] + dy_leg) * sv
                steps = max(2, int(math.hypot(x1 - x0, y1 - y0) * 2) + 1)
                for t in np.linspace(0, 1, steps):
                    ci, cj = int(round(x0 + t * (x1 - x0))), int(round(y0 + t * (y1 - y0)))
                    if 0 <= cj < GH and 0 <= ci < GW and not W[cj, ci]:
                        road_mult[cj, ci] = min(road_mult[cj, ci], m_val)

    for pts_src in [world["gr"].get("px", [])]:
        for idx_p in range(len(pts_src) - 1):
            x0, y0 = (pts_src[idx_p][0] + dx_leg) * su, (pts_src[idx_p][1] + dy_leg) * sv
            x1, y1 = (pts_src[idx_p + 1][0] + dx_leg) * su, (pts_src[idx_p + 1][1] + dy_leg) * sv
            steps = max(2, int(math.hypot(x1 - x0, y1 - y0) * 2) + 1)
            for t in np.linspace(0, 1, steps):
                ci, cj = int(round(x0 + t * (x1 - x0))), int(round(y0 + t * (y1 - y0)))
                if 0 <= cj < GH and 0 <= ci < GW and not W[cj, ci]:
                    road_mult[cj, ci] = min(road_mult[cj, ci], 0.80)

    # Generate Polity Highways, Eternal State mid-quality highways, Qoold Lheek-Jimjam dirt road & Stateless Dirt Roads
    supp_roads = build_supplemental_roads(
        world, setts, road_mult, net_eng, is_ring_sea,
        mask_lizard_hostile, mask_screamer_hostile, mask_valley,
        mask_north_rift_barrier, mask_south_rift_barrier, mask_eternal_poly,
    )

    # Zeijani & Andaru anti-colonial raiding zone across interior Throne shoulders
    mask_throne_native_raid = np.zeros((GH, GW), dtype=bool)
    for s_th in setts.values():
        if s_th["polity"] in ("Zeijani", "Andaru"):
            ti, tj = int(round(s_th["px"] * su)), int(round(s_th["py"] * sv))
            mask_throne_native_raid |= (((xx_g - ti) ** 2 + (yy_g - tj) ** 2) <= 6 ** 2) & mask_throne_poly & (~W)

    # Rasterize river discharge Q (for unbridged ford penalties on Layer 0) AND
    # cataract-free directed navigable river edges (Q >= 22 m3/s, slope < 0.0045) for Layer 2
    # (plus engineered lock/portage navigation on massive >5,000 m3/s Lake Shim outlet river Riv 0!).
    river_nav = np.zeros((GH, GW), dtype=bool)
    river_max_q = np.zeros((GH, GW), dtype=np.float32)
    directed_river_steps = {}  # (u_cell, v_cell) -> (step_km, slope, max_q)

    for rv in world["D"]["rivers"]:
        pts = rv.get("px", [])
        qs = rv.get("q_m3s", [])
        beds = rv.get("bed_m", [])
        rv_max_q = max((float(x) for x in qs), default=0.0)
        is_shim_outlet = rv_max_q > 5000.0  # Riv 0 (Shim River, 5,744 m3/s linking Lake Shim & Shim directly to Ring Sea!)
        for k in range(len(pts) - 1):
            q = float(qs[min(k, len(qs) - 1)]) if qs else 0.0
            x0, y0 = pts[k][0] * su, pts[k][1] * sv
            x1, y1 = pts[k + 1][0] * su, pts[k + 1][1] * sv
            steps = max(2, int(math.hypot(x1 - x0, y1 - y0) * 3) + 1)
            chain = []
            for t in np.linspace(0, 1, steps):
                ci, cj = int(round(x0 + t * (x1 - x0))), int(round(y0 + t * (y1 - y0)))
                if 0 <= cj < GH and 0 <= ci < GW:
                    if q > river_max_q[cj, ci]:
                        river_max_q[cj, ci] = q
                    c_cur = cj * GW + ci
                    if not chain or chain[-1] != c_cur:
                        chain.append(c_cur)
            if q < 22.0:
                continue
            dist_m = max(500.0, math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]) * 2000.0)
            drop = abs(beds[k + 1] - beds[k]) if len(beds) > k + 1 else 0.0
            slope = drop / dist_m
            if slope >= 0.0045 and not is_shim_outlet:
                continue  # cataract / gorge blocks barges on unengineered rivers!
            slope_eff = min(slope, 0.0085) if is_shim_outlet else slope
            for c_cur in chain:
                rj, ri = divmod(c_cur, GW)
                river_nav[rj, ri] = True
            for idx_ch in range(len(chain) - 1):
                uc, vc = chain[idx_ch], chain[idx_ch + 1]
                uj, ui = divmod(uc, GW)
                vj, vi = divmod(vc, GW)
                skm = 4.0 * math.hypot(vi - ui, vj - uj)
                prev = directed_river_steps.get((uc, vc))
                if prev is None or q > prev[2]:
                    directed_river_steps[(uc, vc)] = (skm, slope_eff, q)

    # Eternian locked-canal lowland triangle (Fulcrum-Lux-Bastion-Farport)
    et_box = np.zeros((GH, GW), dtype=bool)
    et_box[int(540 * sv):int(710 * sv), int(280 * su):int(560 * su)] = True
    canal_nav = et_box & (~W) & (E >= -5) & (E <= 420)

    def cell_of(px, py):
        return int(round(py * sv)) * GW + int(round(px * su))

    # Canonical shoreline & island ports allowed a wider coastal snap; all other settlements must sit directly on water (<= 1.41 cells)
    # so inland/bluff/cavern towns like Dhelv (inland Throne cavern!), Sethas, Azoth, Dayshun, Dilihan, Guari, etc. NEVER get fake sea ports!
    EXPLICIT_COASTAL_PORTS = {
        "Farport", "Palewharf", "Jimjam", "Voth", "Shim", "Dapor", "Almua", "Tzinguard", "Temora", "Zey'danin",
        "Port Mira", "Hook", "Ys", "Ybera", "Tethis", "Nephtos", "Trigon", "Limnaia",
        "Pontus", "Nereus", "Kierson", "Kyra Isle", "Skopelos Isle",
        "Taikoro", "Kautono",
        "Kautoa", "Valapo", "Bipo", "Shell", "Port Goto", "Port Tobin", "Marr", "Iziz",
        "Torus", "Port Visas", "Erehwon", "Kirstabal", "Thalaba",
        "Spider Lake Weirs", "Reed", "Ostrukh-on-Water",
        "Noa's Regret", "Shanty", "Boiling Bay",
        "Ria Valley (Sea Trade)", "The Crook (Sea Trade)",
    }

    # Polities with ZERO fleets of their own (traders must come to them via overland trails or neighboring coastal anchorages!):
    NO_FLEET_POLS = {"Lizardmen", "Screamer Country", "Beast Riders", "Zeijani", "Andaru", "Tiguantin"}

    # Assign settlement cells, sea/lake port links (Layer 0 <-> Layer 1), & river barge landings (Layer 0 <-> Layer 2)
    port_links = []
    barge_links = []
    estuary_links = []
    abstract_land_mask = np.zeros((GH, GW), dtype=bool)
    shim_mouth_links = []
    for sid, s in setts.items():
        c = cell_of(s["px"], s["py"])
        s["cell"] = c
        cj, ci = divmod(c, GW)
        if s.get("abstract_region"):
            abstract_land_mask[cj, ci] = True

        # Lizardmen, Screamers, Beast Riders, Zeijani, Andaru & Tiguantin have ZERO fleets (traders must come to them; Dhelv is inland!);
        # Eternal State restricts pelagic sea shipping exclusively to Farport's Factory Quarter, while Palewharf operates lake barges on Jimjam's Lake!
        if s["polity"] in NO_FLEET_POLS or (
            s["polity"] == "Eternal State" and s["name"] not in ("Farport", "Palewharf")
        ):
            s["water_cell"] = None
            s["is_ring_sea_port"] = False
            if s["polity"] in NO_FLEET_POLS:
                s["river_cell"] = None
                continue
        else:
            # Check shoreline proximity for navigable sea/lake water (Palewharf connects strictly to inland_lake Jimjam's Lake!)
            best_w = None
            rad_w = 5 if s["name"] in EXPLICIT_COASTAL_PORTS else 1
            for dj in range(-rad_w, rad_w + 1):
                for di in range(-rad_w, rad_w + 1):
                    if rad_w == 1 and (dj * dj + di * di) > 2:
                        continue
                    nj, ni = cj + dj, ci + di
                    if 0 <= nj < GH and 0 <= ni < GW and nav_water[nj, ni]:
                        if s["name"] == "Palewharf" and not inland_lake[nj, ni]:
                            continue
                        d = dj * dj + di * di
                        if best_w is None or d < best_w[0]:
                            best_w = (d, nj * GW + ni)
            if best_w is not None:
                s["water_cell"] = best_w[1]
                s["is_ring_sea_port"] = bool(is_ring_sea.flat[best_w[1]])
                port_links.append((c, N_CELL + best_w[1], s["name"], s["polity"]))
            else:
                s["water_cell"] = None
                s["is_ring_sea_port"] = False

        if s.get("abstract_region"):
            s["river_cell"] = None
            continue

        # Check within 2 cells (8 km; 4 cells at Shim's lake-outlet basin) of navigable river / Eternian canal for Layer 2 barge wharf
        # (Exclude inland bluff/foothill towns like Sethas so Lake Shim river traffic routes cleanly through Shim & Dapor!)
        best_r = None
        if s["name"] not in ("Sethas",):
            rad_r = 4 if s["name"] == "Shim" else 2
            for dj in range(-rad_r, rad_r + 1):
                for di in range(-rad_r, rad_r + 1):
                    nj, ni = cj + dj, ci + di
                    if 0 <= nj < GH and 0 <= ni < GW and (river_nav[nj, ni] or canal_nav[nj, ni]):
                        d = dj * dj + di * di
                        if best_r is None or d < best_r[0]:
                            best_r = (d, nj * GW + ni)
        if best_r is not None:
            s["river_cell"] = best_r[1]
            barge_links.append((c, 2 * N_CELL + best_r[1], s["name"], s["polity"]))
            if s["water_cell"] is not None:
                # Estuary port lighterage directly between river barge (Layer 2) and sea/lake ship (Layer 1)
                estuary_links.append((2 * N_CELL + best_r[1], N_CELL + s["water_cell"], s["name"], s["polity"]))
        else:
            s["river_cell"] = None

    # Also wire natural major river-mouth lighterage where trunk rivers (Q >= 250 m3/s, esp. Shim River Riv 0!) enter open sea
    open_sea = nav_water & (~inland_lake)
    existing_est_riv = {x[0] for x in estuary_links}
    farport_mouth_links = []
    ry_m, rx_m = np.nonzero(river_nav & (river_max_q >= 250.0))
    for rj, ri in zip(ry_m, rx_m):
        rc2 = 2 * N_CELL + int(rj) * GW + int(ri)
        if rc2 in existing_est_riv:
            continue
        best_sea = None
        for dj in range(-2, 3):
            for di in range(-2, 3):
                nj, ni = int(rj) + dj, int(ri) + di
                if 0 <= nj < GH and 0 <= ni < GW and open_sea[nj, ni]:
                    d = dj * dj + di * di
                    if best_sea is None or d < best_sea[0]:
                        best_sea = (d, nj * GW + ni)
        if best_sea is not None:
            px_m, py_m = ri / su, rj / sv
            # Shim River mouth at SW Bay (699, 1025) operates under Shim / Vothic Kingdom river-customs!
            if 660.0 <= px_m <= 730.0 and 1000.0 <= py_m <= 1060.0:
                estuary_links.append((rc2, N_CELL + best_sea[1], "Shim", "Vothic Kingdom"))
                shim_mouth_links.append((rc2, N_CELL + best_sea[1]))
            # Farside Ocean estuary lighterage operates strictly through Eternal State's Farport Factory Quarter!
            elif px_m < 480.0 and py_m < 660.0:
                estuary_links.append((rc2, N_CELL + best_sea[1], "Farport", "Eternal State"))
                farport_mouth_links.append((rc2, N_CELL + best_sea[1]))
            else:
                estuary_links.append((rc2, N_CELL + best_sea[1], "River Estuary", "Neutral"))

    # Precompute inland-lake <-> navigable-river slackwater connections (Layer 2 <-> Layer 1 on calm lakes)
    lake_river_links = []
    ry_all, rx_all = np.nonzero(river_nav | canal_nav)
    for rj, ri in zip(ry_all, rx_all):
        rc = int(rj) * GW + int(ri)
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                nj, ni = int(rj) + dj, int(ri) + di
                if 0 <= nj < GH and 0 <= ni < GW and inland_lake[nj, ni]:
                    lake_river_links.append((2 * N_CELL + rc, N_CELL + nj * GW + ni))
                    break
            else:
                continue
            break

    # Precompute highway bridge river landings (Layer 0 <-> Layer 2 where kept/polity highways cross navigable rivers)
    bridge_barge_cells = []
    hy_b, hx_b = np.nonzero(river_nav & (~W) & (road_mult <= 0.76) & (~mask_lizard_hostile) & (~mask_screamer_hostile))
    for bj_i, bi_i in zip(hy_b, hx_b):
        bridge_barge_cells.append(int(bj_i) * GW + int(bi_i))

    # Precompute directed river array & symmetric canal array for fast CSR assembly
    if directed_river_steps:
        dr_u = np.array([k[0] for k in directed_river_steps.keys()], dtype=np.int32)
        dr_v = np.array([k[1] for k in directed_river_steps.keys()], dtype=np.int32)
        dr_km = np.array([v[0] for v in directed_river_steps.values()], dtype=np.float64)
        dr_sl = np.array([v[1] for v in directed_river_steps.values()], dtype=np.float64)
        dr_q = np.array([v[2] for v in directed_river_steps.values()], dtype=np.float64)
    else:
        dr_u = dr_v = np.zeros(0, dtype=np.int32)
        dr_km = dr_sl = dr_q = np.zeros(0, dtype=np.float64)

    # Engineered corridors, tunnels, lifts & mountain passes aligned with claude/ancient-network-9cc3e7 + updated 5.1 pins
    # NOTE:
    # - Intra-Xanadu trade moves 100% on Layer 0 Xanadu roads (zero SPECIAL_CORRIDORS inside Xanadu).
    # - Parabola <-> Arcbeam & Mantis <-> Parabola move 100% on open surface Ancient highways on Layer 0 (zero ancient tubes).
    # - Catch & Twins caravan stops move on Layer 0 desert oasis tracks & mountain pass switchbacks.
    # - Qoold Lheek <-> Leng <-> Jimjam moves on the Layer 0 northern dirt road supp.jimjam_qoold_lheek_dirt.
    SPECIAL_CORRIDORS = [
        ("Tungang Rift-Line Train Bore", 464, 1112, 461, 1161, 115, 58.0, 72.0),
        ("Tungang Deep Hot Bore (>100 C)", 461, 1161, 457, 1269, 215, 108.0, 138.0),
        ("Tungang South Bore", 457, 1269, 437, 1330, 125, 68.0, 85.0),
        ("Loj Fower Cliff Lifts (Ledge-Nulab)", 437, 1330, 443, 1359, 60, 68.0, 54.0),
        ("Span Basin Tunnel", 464, 1112, 554, 1010, 240, 185.0, 155.0),
        ("Inner Wall Karst Tunnel (Drum-Cascade)", 673, 932, 568, 841, 275, 445.0, 250.0),
        ("Verge 16-Hairpin Scarp", 1240, 960, 1263, 946, 60, 115.0, 75.0),
        # Once-a-year Annual Great Caravan routed along the NORTH side of the Rift
        ("Annual Great Caravan N1 (Nulab-North Rift W Bench)", 443, 1359, 520, 1402, 180, float("inf"), 305.0),
        ("Annual Great Caravan N2 (North Rift Mid-W Terrace)", 520, 1402, 565, 1411, 98, float("inf"), 165.0),
        ("Annual Great Caravan N3 (North Rift Central Bench)", 565, 1411, 640, 1447, 172, float("inf"), 290.0),
        ("Annual Great Caravan N4 (North Rift East Shoulder)", 640, 1447, 720, 1501, 198, float("inf"), 330.0),
        ("Annual Great Caravan N5 (North Rift-West Vale Gate)", 720, 1501, 775, 1504, 115, float("inf"), 192.0),
        ("Annual Great Caravan N6 (West Vale Gate-Erehwon)", 775, 1504, 805, 1516, 68, float("inf"), 115.0),
        ("Talovolci Cliff-Lung Stairs (Torus-Spirladunon)", 777, 1005, 800, 1017, 52, 190.0, 82.0),
        # Kautoa serves as the Beast Riders' effective navy and coastal presence:
        ("Kautoa–Beast Rider Drua Factor (Mav's Refuge–Bipo)", 1049, 841, 1000, 814, 108, 34.0, 26.0),
        ("Kautoa–Beast Rider North Factor (Talon–Kautoa)", 1026, 760, 964, 725, 142, 44.0, 34.0),
        ("Outland Gate & Hau-Gel Trough", 1288, 220, 1368, 272, 195, 180.0, 152.0),
        ("Hau-Gel Narrows to The Gate", 1368, 272, 1438, 326, 175, 160.0, 138.0),
        ("Tierhound Seed-Law Gate (Gate-Gate Tarn)", 1438, 326, 1544, 474, 365, 380.0, 310.0),
        ("SW Spillway & Arachnoid Gorge (Spider Lake-Ham-Tsek)", 1288, 220, 1055, 219, 466, 510.0, 370.0),
        ("Korona Guided Silk River (Ham-Tsek-K6)", 1055, 219, 1006, 340, 265, 295.0, 215.0),
        ("Korona Ring Trail (K6-Silkhead)", 1006, 340, 934, 424, 220, 238.0, 175.0),
        ("Korona West Descent (Silkhead-Serai)", 934, 424, 826, 478, 242, 345.0, 268.0),
        ("God's Road North (Pinnacle-Ria)", 1018, 678, 1165, 395, 630, 790.0, 540.0),
        ("God's Road Upper (Ria-Spider Lake)", 1165, 395, 1288, 220, 430, 460.0, 315.0),
        ("Outlands Rim to Great Chasm", 1654, 701, 1685, 785, 180, 215.0, 152.0),
        ("Great Chasm East Bench Road", 1685, 785, 1708, 915, 268, 320.0, 225.0),
        ("East Bench to The Sill (Sam-Lok)", 1708, 915, 1697, 1028, 228, 272.0, 192.0),
        ("Loom-Chasms Trail (Sill-Spindle Fan)", 1697, 1028, 1628, 1075, 168, 205.0, 148.0),
        ("Klira Guli to Spindle Fan", 1628, 1075, 1561, 1140, 188, 225.0, 165.0),
        ("Yuni SE Scarp Pass (Ostrukh-Scarp)", 1516, 1471, 1559, 1457, 92, 115.0, 82.0),
        ("Arete Basalt Chain-Bridges (Scarp-Siphon)", 1559, 1457, 1678, 1542, 295, 365.0, 255.0),
        ("High Rift Quartz Pack Train (Longsong-Singing Gjar)", 1229, 1621, 1572, 1643, 690, 980.0, 620.0),
    ]

    IZIZ_VISAS_CORRIDORS = [
        ("Iziz-Guarded Visas Caravan W (Dilihan-Screamer Fringe)", 744, 663, 768, 686, 76, 122.0, 96.0),
        ("Iziz-Guarded Visas Caravan E (Screamer Fringe-Port Visas)", 768, 686, 800, 712, 76, 118.0, 94.0),
    ]

    idx = np.arange(N_CELL).reshape(GH, GW)

    def apply_regime_hazards(c_arr, a_arr, b_arr, use_bulk, regime, on_road_arr=None):
        is_iziz_reg = regime in ("iziz", "iziz_visas")
        is_voth_reg = regime == "voth"
        liz = mask_lizard_hostile.flat[a_arr] | mask_lizard_hostile.flat[b_arr]
        c_arr = np.where(liz, c_arr * (9.5 if use_bulk else 8.2), c_arr)
        scr = mask_screamer_hostile.flat[a_arr] | mask_screamer_hostile.flat[b_arr]
        c_arr = np.where(scr, c_arr * (8.5 if use_bulk else 7.5), c_arr)
        if regime != "iziz_visas":
            vis_un = mask_visas_unescorted.flat[a_arr] | mask_visas_unescorted.flat[b_arr]
            c_arr = np.where(vis_un, c_arr * (5.2 if use_bulk else 4.6), c_arr)

        if is_iziz_reg:
            voth_blk = mask_voth_poly.flat[a_arr] | mask_voth_poly.flat[b_arr]
            c_arr = np.where(voth_blk, c_arr * 9.5, c_arr)
        elif is_voth_reg:
            iz_blk = mask_iziz_poly.flat[a_arr] | mask_iziz_poly.flat[b_arr] | mask_shell_poly.flat[a_arr] | mask_shell_poly.flat[b_arr]
            c_arr = np.where(iz_blk, c_arr * 9.5, c_arr)

        yeti_r = mask_yeti_raid.flat[a_arr] | mask_yeti_raid.flat[b_arr]
        c_arr = np.where(yeti_r, c_arr * (2.15 if use_bulk else 1.85), c_arr)

        pm_c = mask_painted_core.flat[a_arr] | mask_painted_core.flat[b_arr]
        pm_h = (mask_painted_halo.flat[a_arr] | mask_painted_halo.flat[b_arr]) & (~pm_c)
        c_arr = np.where(pm_c, c_arr * (2.25 if use_bulk else 1.95), c_arr)
        c_arr = np.where(pm_h, c_arr * (1.45 if use_bulk else 1.35), c_arr)

        fg_c = mask_fellgang_core.flat[a_arr] | mask_fellgang_core.flat[b_arr]
        fg_h = (mask_fellgang_halo.flat[a_arr] | mask_fellgang_halo.flat[b_arr]) & (~fg_c)
        c_arr = np.where(fg_c, c_arr * (1.95 if use_bulk else 1.75), c_arr)
        c_arr = np.where(fg_h, c_arr * (1.42 if use_bulk else 1.32), c_arr)

        lz_xan = mask_lizard_raid_xanadu.flat[a_arr] | mask_lizard_raid_xanadu.flat[b_arr]
        c_arr = np.where(lz_xan, c_arr * (1.55 if use_bulk else 1.42), c_arr)
        lz_dal = mask_lizard_raid_dalab.flat[a_arr] | mask_lizard_raid_dalab.flat[b_arr]
        c_arr = np.where(lz_dal, c_arr * (1.35 if use_bulk else 1.28), c_arr)

        scy_c = mask_scyvoi_core.flat[a_arr] | mask_scyvoi_core.flat[b_arr]
        scy_h = (mask_scyvoi_halo.flat[a_arr] | mask_scyvoi_halo.flat[b_arr]) & (~scy_c)
        c_arr = np.where(scy_c, c_arr * (1.75 if use_bulk else 1.55), c_arr)
        c_arr = np.where(scy_h, c_arr * (1.38 if use_bulk else 1.28), c_arr)

        br_c = mask_beastrider_core.flat[a_arr] | mask_beastrider_core.flat[b_arr]
        br_h = (mask_beastrider_halo.flat[a_arr] | mask_beastrider_halo.flat[b_arr]) & (~br_c)
        if is_iziz_reg:
            c_arr = np.where(br_c, c_arr * (5.6 if use_bulk else 4.8), c_arr)
        else:
            c_arr = np.where(br_c, c_arr * (1.35 if use_bulk else 1.28), c_arr)
        c_arr = np.where(br_h, c_arr * (1.42 if use_bulk else 1.32), c_arr)

        vr_c = mask_vrivolci_core.flat[a_arr] | mask_vrivolci_core.flat[b_arr]
        vr_h = (mask_vrivolci_halo.flat[a_arr] | mask_vrivolci_halo.flat[b_arr]) & (~vr_c)
        c_arr = np.where(vr_c, c_arr * (1.75 if use_bulk else 1.58), c_arr)
        c_arr = np.where(vr_h, c_arr * (1.38 if use_bulk else 1.30), c_arr)

        bm_b = mask_boatmurder_bandits.flat[a_arr] | mask_boatmurder_bandits.flat[b_arr]
        if on_road_arr is not None:
            c_arr = np.where(bm_b & on_road_arr, c_arr * (1.62 if use_bulk else 1.72), c_arr)
            c_arr = np.where(bm_b & (~on_road_arr), c_arr * (1.35 if use_bulk else 1.40), c_arr)
        else:
            c_arr = np.where(bm_b, c_arr * 1.40, c_arr)

        swh_c = mask_swhigh_core.flat[a_arr] | mask_swhigh_core.flat[b_arr]
        swh_h = (mask_swhigh_halo.flat[a_arr] | mask_swhigh_halo.flat[b_arr]) & (~swh_c)
        c_arr = np.where(swh_c, c_arr * (1.72 if use_bulk else 1.55), c_arr)
        c_arr = np.where(swh_h, c_arr * (1.42 if use_bulk else 1.32), c_arr)

        cn_r = mask_coyote_nomad_raid.flat[a_arr] | mask_coyote_nomad_raid.flat[b_arr]
        c_arr = np.where(cn_r, c_arr * (1.42 if use_bulk else 1.35), c_arr)
        nd_b = mask_nomad_desert_bandits.flat[a_arr] | mask_nomad_desert_bandits.flat[b_arr]
        c_arr = np.where(nd_b, c_arr * (1.38 if use_bulk else 1.42), c_arr)
        if is_iziz_reg or is_voth_reg:
            th_r = mask_throne_native_raid.flat[a_arr] | mask_throne_native_raid.flat[b_arr]
            c_arr = np.where(th_r, c_arr * (1.48 if use_bulk else 1.38), c_arr)
        return c_arr

    yeti_eternia_block = mask_eternal_poly | ((px_g < 665.0) & (py_g >= 556.0) & (py_g <= 666.0))

    def make_csr(sea_mult, road_scale, trail_mult, port_fee, barge_fee, use_bulk, regime="std"):
        rows, cols, costs = [], [], []
        is_iziz_reg = regime in ("iziz", "iziz_visas")
        is_voth_reg = regime == "voth"
        is_yeti_reg = regime == "yeti"

        for dj, di in ((0, 1), (1, 0), (1, 1), (1, -1)):
            a = idx[max(0, -dj):GH - max(0, dj), max(0, -di):GW - max(0, di)].ravel()
            b = idx[max(0, dj):GH + min(0, dj) or None, max(0, di):GW + min(0, di) or None].ravel()
            d_km = 4.0 * math.hypot(dj, di)

            # --- Layer 0: Overland Movement (Wagons, Pack Caravans, Polity Highways & Dirt Roads) ---
            wa, wb = W.flat[a], W.flat[b]
            ea, eb = E.flat[a], E.flat[b]
            g = np.abs(eb - ea) / (d_km * 1000.0)
            slope_pen = 1.0 + (2.6 if use_bulk else 1.4) * (g / 0.075) ** 2
            rm = 0.5 * (road_mult.flat[a] + road_mult.flat[b])
            has_road = rm < 0.95
            eng_edge = net_eng.flat[a] | net_eng.flat[b]
            is_bridged_hwy = (rm <= 0.78) | eng_edge

            c_land = np.full(a.shape, d_km * trail_mult, dtype=np.float64) * slope_pen
            g_road = np.where(eng_edge, np.minimum(g, 0.045), g)
            c_road = d_km * rm * road_scale * (1.0 + 0.4 * (g_road / 0.08) ** 2)
            c_land = np.where(has_road, np.minimum(c_land, c_road), c_land)

            # Unbridged major-river crossing surcharge on dirt roads & trails (ferries / fording bulk wagons)
            # Only applies when entering/crossing a major river cell from non-river ground (not walking parallel!)
            ra_maj80 = river_max_q.flat[a] >= 80.0
            rb_maj80 = river_max_q.flat[b] >= 80.0
            cross_80 = ra_maj80 ^ rb_maj80
            cross_250 = (river_max_q.flat[a] >= 250.0) ^ (river_max_q.flat[b] >= 250.0)
            ford_pen = np.zeros_like(c_land)
            ford_pen = np.where(cross_80 & is_bridged_hwy, 1.5 if use_bulk else 0.6, ford_pen)
            ford_pen = np.where(cross_80 & (~is_bridged_hwy) & has_road, 11.0 if use_bulk else 4.0, ford_pen)
            ford_pen = np.where(cross_80 & (~has_road), 17.0 if use_bulk else 6.0, ford_pen)
            ford_pen = np.where(cross_250 & (~is_bridged_hwy) & has_road, 22.0 if use_bulk else 8.0, ford_pen)
            ford_pen = np.where(cross_250 & (~has_road), 32.0 if use_bulk else 11.5, ford_pen)
            c_land = c_land + ford_pen

            # Arid off-road surcharge, hyper-arid waterless Catch/Bowl playa penalty (caravans MUST follow oasis wells!) & Korona maze penalty
            arid = ((RAIN.flat[a] < 260) | (RAIN.flat[b] < 260)) & (~has_road)
            c_land = np.where(arid, c_land * 1.35, c_land)
            hyper_arid_catch = (
                ((RAIN.flat[a] < 175) | (RAIN.flat[b] < 175) | ((px_g.flat[a] >= 940.0) & (px_g.flat[a] <= 1240.0) & (py_g.flat[a] >= 1170.0) & (py_g.flat[a] <= 1545.0)))
                & (~has_road)
            )
            c_land = np.where(hyper_arid_catch, c_land * 2.45, c_land)
            kor = (mask_korona.flat[a] | mask_korona.flat[b]) & (~has_road)
            c_land = np.where(kor, c_land * 3.6, c_land)

            c_land = apply_regime_hazards(c_land, a, b, use_bulk, regime, on_road_arr=has_road)

            emax = np.maximum(ea, eb)
            high = emax > 4200.0
            c_land = np.where(high, c_land * (1.0 + ((np.maximum(emax, 4200.0) - 4200.0) / 1700.0) ** 2), c_land)
            rift_bar = (
                mask_north_rift_barrier.flat[a] | mask_north_rift_barrier.flat[b]
                | mask_south_rift_barrier.flat[a] | mask_south_rift_barrier.flat[b]
            )
            ring_w = is_ring_sea.flat[a] | is_ring_sea.flat[b]
            abs_bar = abstract_land_mask.flat[a] | abstract_land_mask.flat[b]  # abstract sea regions move ONLY via ship to Farport!
            impass = (emax > 7500.0) | mask_valley.flat[a] | mask_valley.flat[b] | rift_bar | (wa & wb) | ring_w | abs_bar
            if use_bulk:
                # Bulk wagon transport is impractical on the hazardous Yeti highland dirt road!
                impass = impass | mask_yeti_poly.flat[a] | mask_yeti_poly.flat[b]
            if is_yeti_reg:
                # Yeti trade NEVER cuts south through Eternian land — exits strictly east via Jimjam & the eastern highway!
                impass = impass | yeti_eternia_block.flat[a] | yeti_eternia_block.flat[b]
            one_w = wa ^ wb
            c_land = np.where(one_w, c_land * 4.5, c_land)
            c_land[impass] = np.inf

            ok0 = np.isfinite(c_land)
            rows += [a[ok0], b[ok0]]
            cols += [b[ok0], a[ok0]]
            costs += [c_land[ok0], c_land[ok0]]

            # --- Layer 1: Maritime & Lake Shipping (N_CELL .. 2*N_CELL - 1) ---
            nwa = nav_water.flat[a] & nav_water.flat[b]
            if nwa.any():
                aw, bw = a[nwa] + N_CELL, b[nwa] + N_CELL
                cw = np.full(aw.shape, d_km * sea_mult, dtype=np.float64)
                liz_w = mask_lizard_hostile.flat[a[nwa]] | mask_lizard_hostile.flat[b[nwa]]
                cw = np.where(liz_w, cw * 10.0, cw)
                if is_iziz_reg or is_voth_reg:
                    rs_w = is_ring_sea.flat[a[nwa]] | is_ring_sea.flat[b[nwa]]
                    cw = np.where(rs_w, cw * 1.18, cw)
                rows += [aw, bw]
                cols += [bw, aw]
                costs += [cw, cw]

            # --- Layer 2a: Eternian Locked Canals (2*N_CELL .. 3*N_CELL - 1, symmetric slackwater) ---
            cna = canal_nav.flat[a] & canal_nav.flat[b] & (g < 0.008)
            if is_yeti_reg:
                cna = cna & (~yeti_eternia_block.flat[a]) & (~yeti_eternia_block.flat[b])
            if cna.any():
                ac, bc = a[cna] + 2 * N_CELL, b[cna] + 2 * N_CELL
                cc = np.full(ac.shape, d_km * (0.22 if use_bulk else 0.34), dtype=np.float64)
                cc = apply_regime_hazards(cc, a[cna], b[cna], use_bulk, regime)
                rows += [ac, bc]
                cols += [bc, ac]
                costs += [cc, cc]

        # --- Layer 2b: Directed Navigable Rivers (2*N_CELL .. 3*N_CELL - 1, Downstream vs Upstream!) ---
        if len(dr_u) > 0:
            # Larger rivers (Q >= 250 m3/s) take bigger scows/barges at lower per-ton friction
            big_q_bonus = np.where(dr_q >= 250.0, 0.88, 1.0)
            if use_bulk:
                # Downstream floats with current (0.18-0.23 eq-km/km); upstream requires towing/poling against slope!
                c_down = dr_km * (0.20 + 4.0 * dr_sl) * big_q_bonus
                c_up = dr_km * (0.37 + 42.0 * dr_sl) * big_q_bonus
            else:
                c_down = dr_km * (0.30 + 3.0 * dr_sl) * big_q_bonus
                c_up = dr_km * (0.46 + 28.0 * dr_sl) * big_q_bonus
            c_down = apply_regime_hazards(c_down, dr_u, dr_v, use_bulk, regime)
            c_up = apply_regime_hazards(c_up, dr_v, dr_u, use_bulk, regime)
            riv_impass = (
                mask_valley.flat[dr_u] | mask_valley.flat[dr_v]
                | mask_north_rift_barrier.flat[dr_u] | mask_north_rift_barrier.flat[dr_v]
                | mask_south_rift_barrier.flat[dr_u] | mask_south_rift_barrier.flat[dr_v]
            )
            if is_yeti_reg:
                riv_impass = riv_impass | yeti_eternia_block.flat[dr_u] | yeti_eternia_block.flat[dr_v]
            c_down[riv_impass] = np.inf
            c_up[riv_impass] = np.inf
            ok_d = np.isfinite(c_down)
            ok_u = np.isfinite(c_up)
            rows += [dr_u[ok_d] + 2 * N_CELL, dr_v[ok_u] + 2 * N_CELL]
            cols += [dr_v[ok_d] + 2 * N_CELL, dr_u[ok_u] + 2 * N_CELL]
            costs += [c_down[ok_d], c_up[ok_u]]

        # Port tariff helper (shared by Layer 0 <-> Layer 1 ports & Layer 2 <-> Layer 1 estuary lighterage)
        def calc_port_tariff(base_fee, p_name, p_pol):
            if is_yeti_reg and (p_pol == "Eternal State" or p_name in ("Palewharf", "Farport", "Jimjam")):
                return np.inf
            # Port Mira (Hookfleet) is an open pirate & smuggler haven — accepts ALL ships under every flag!
            if p_name == "Port Mira":
                return base_fee * 0.68
            # Nephtos (League: Tethys) is a major Ring Sea smuggling haven (not a piracy haven)
            if p_name == "Nephtos":
                return base_fee * 0.74
            if is_iziz_reg and p_pol == "Vothic Kingdom":
                return np.inf
            if is_voth_reg and p_pol in ("Empire of Iziz", "Shell Province"):
                return np.inf
            # Marr remains friendly to smugglers despite crackdowns and is their preferred Izani entrepot
            if p_name == "Marr":
                return base_fee * 0.58
            # Kautoa's relations with Empire of Iziz are cool because Kautoa serves as the Beast Riders' navy
            if is_iziz_reg and p_pol == "Kautoa":
                return base_fee + 42.0
            if p_name == "Port Visas":
                return (base_fee - 2.0) if regime == "iziz_visas" else ((base_fee + 8.0) if regime == "iziz" else 165.0)
            if regime == "iziz_visas" and p_pol.startswith("League:") and p_name != "Nephtos":
                return base_fee + 175.0
            if is_voth_reg and p_pol.startswith("League:"):
                return base_fee + 58.0
            return base_fee

        # 1. Sea & Lake Port Break-of-Bulk (Layer 0 <-> Layer 1)
        for c_land_idx, c_wat_idx, p_name, p_pol in port_links:
            pf = calc_port_tariff(port_fee, p_name, p_pol)
            if np.isfinite(pf):
                rows += [np.array([c_land_idx, c_wat_idx])]
                cols += [np.array([c_wat_idx, c_land_idx])]
                costs += [np.array([pf, pf], dtype=np.float64)]

        # 2. River & Canal Barge Wharves at Settlements (Layer 0 <-> Layer 2)
        for c_land_idx, c_riv_idx, p_name, p_pol in barge_links:
            if is_yeti_reg and p_pol == "Eternal State":
                continue
            if is_iziz_reg and p_pol == "Vothic Kingdom":
                continue
            if is_voth_reg and p_pol in ("Empire of Iziz", "Shell Province"):
                continue
            rows += [np.array([c_land_idx, c_riv_idx])]
            cols += [np.array([c_riv_idx, c_land_idx])]
            costs += [np.array([barge_fee, barge_fee], dtype=np.float64)]

        # 3. Estuary Lighterage at River-Mouth Ports (Layer 2 <-> Layer 1, e.g. Port Tobin & Farport!)
        est_base = 12.0 if use_bulk else 14.0
        for c_riv_idx, c_wat_idx, p_name, p_pol in estuary_links:
            ef = calc_port_tariff(est_base, p_name, p_pol)
            if np.isfinite(ef):
                rows += [np.array([c_riv_idx, c_wat_idx])]
                cols += [np.array([c_wat_idx, c_riv_idx])]
                costs += [np.array([ef, ef], dtype=np.float64)]

        # 4. Calm Inland Lake <-> River Slackwater Continuation (Layer 2 <-> Layer 1, e.g. Iziz Lake -> Riv 12!)
        if lake_river_links:
            lr_a = np.array([x[0] for x in lake_river_links], dtype=np.int32)
            lr_b = np.array([x[1] for x in lake_river_links], dtype=np.int32)
            lr_c = np.full(lr_a.shape, 3.0, dtype=np.float64)
            rows += [lr_a, lr_b]
            cols += [lr_b, lr_a]
            costs += [lr_c, lr_c]

        # 5. Highway Bridge River Landings (Layer 0 <-> Layer 2)
        if bridge_barge_cells:
            bb_0 = np.array(bridge_barge_cells, dtype=np.int32)
            bb_2 = bb_0 + 2 * N_CELL
            bb_c = np.full(bb_0.shape, barge_fee + 5.0, dtype=np.float64)
            if is_yeti_reg:
                bb_c = np.where(yeti_eternia_block.flat[bb_0], np.inf, bb_c)
            elif is_iziz_reg:
                bb_c = np.where(mask_voth_poly.flat[bb_0], np.inf, bb_c)
            elif is_voth_reg:
                bb_c = np.where(mask_iziz_poly.flat[bb_0] | mask_shell_poly.flat[bb_0], np.inf, bb_c)
            ok_bb = np.isfinite(bb_c)
            rows += [bb_0[ok_bb], bb_2[ok_bb]]
            cols += [bb_2[ok_bb], bb_0[ok_bb]]
            costs += [bb_c[ok_bb], bb_c[ok_bb]]

        # 6. Engineered tunnels, lifts & pass corridors on Layer 0 (+ Iziz-guarded Visas caravan on iziz_visas graph)
        corridor_list = SPECIAL_CORRIDORS + (IZIZ_VISAS_CORRIDORS if regime == "iziz_visas" else [])
        for cname, x0, y0, x1, y1, _, b_eq, c_eq in corridor_list:
            eq = b_eq if use_bulk else c_eq
            if not np.isfinite(eq):
                continue
            if is_iziz_reg and cname == "God's Road North (Pinnacle-Ria)":
                eq *= 3.8
            u = cell_of(*snap_to_land(world, x0, y0))
            v = cell_of(*snap_to_land(world, x1, y1))
            rows += [np.array([u, v])]
            cols += [np.array([v, u])]
            costs += [np.array([eq, eq], dtype=np.float64)]

        r_all = np.concatenate(rows)
        c_all = np.concatenate(cols)
        v_all = np.concatenate(costs)
        return coo_matrix((v_all, (r_all, c_all)), shape=(3 * N_CELL, 3 * N_CELL)).tocsr()

    G_bulk = make_csr(sea_mult=0.16, road_scale=1.15, trail_mult=1.35, port_fee=26.0, barge_fee=9.0, use_bulk=True, regime="std")
    G_comp = make_csr(sea_mult=0.28, road_scale=1.00, trail_mult=1.00, port_fee=22.0, barge_fee=11.0, use_bulk=False, regime="std")
    G_iziz_bulk = make_csr(sea_mult=0.16, road_scale=1.15, trail_mult=1.35, port_fee=26.0, barge_fee=9.0, use_bulk=True, regime="iziz")
    G_iziz_comp = make_csr(sea_mult=0.28, road_scale=1.00, trail_mult=1.00, port_fee=22.0, barge_fee=11.0, use_bulk=False, regime="iziz")
    G_izv_bulk = make_csr(sea_mult=0.16, road_scale=1.15, trail_mult=1.35, port_fee=26.0, barge_fee=9.0, use_bulk=True, regime="iziz_visas")
    G_izv_comp = make_csr(sea_mult=0.28, road_scale=1.00, trail_mult=1.00, port_fee=22.0, barge_fee=11.0, use_bulk=False, regime="iziz_visas")
    G_voth_bulk = make_csr(sea_mult=0.16, road_scale=1.15, trail_mult=1.35, port_fee=26.0, barge_fee=9.0, use_bulk=True, regime="voth")
    G_voth_comp = make_csr(sea_mult=0.28, road_scale=1.00, trail_mult=1.00, port_fee=22.0, barge_fee=11.0, use_bulk=False, regime="voth")
    G_yeti_bulk = make_csr(sea_mult=0.16, road_scale=1.15, trail_mult=1.35, port_fee=26.0, barge_fee=9.0, use_bulk=True, regime="yeti")
    G_yeti_comp = make_csr(sea_mult=0.28, road_scale=1.00, trail_mult=1.00, port_fee=22.0, barge_fee=11.0, use_bulk=False, regime="yeti")

    sids = sorted(setts.keys())
    src_cells = [setts[sid]["cell"] for sid in sids]
    iziz_sids = [sid for sid in sids if setts[sid]["polity"] in ("Empire of Iziz", "Shell Province", "Tiguantin")]
    iziz_cells = [setts[sid]["cell"] for sid in iziz_sids]
    voth_sids = [sid for sid in sids if setts[sid]["polity"] == "Vothic Kingdom"]
    voth_cells = [setts[sid]["cell"] for sid in voth_sids]
    yeti_sids = [sid for sid in sids if setts[sid]["polity"] == "Yeti Kingdom"]
    yeti_cells = [setts[sid]["cell"] for sid in yeti_sids]

    print(
        f"Running directed 3-layer multimodal Dijkstra for {len(sids)} settlements "
        f"(+ {len(iziz_sids)} Iziz, {len(voth_sids)} Voth & {len(yeti_sids)} Yeti regime sources) across {3*N_CELL:,} graph nodes..."
    )
    dist_bulk, pred_bulk = dijkstra(G_bulk, directed=True, indices=src_cells, return_predecessors=True)
    dist_comp, pred_comp = dijkstra(G_comp, directed=True, indices=src_cells, return_predecessors=True)

    dist_iziz_bulk, pred_iziz_bulk = dijkstra(G_iziz_bulk, directed=True, indices=iziz_cells, return_predecessors=True)
    dist_iziz_comp, pred_iziz_comp = dijkstra(G_iziz_comp, directed=True, indices=iziz_cells, return_predecessors=True)
    dist_iziz_bulk_rev, pred_iziz_bulk_rev = dijkstra(G_iziz_bulk.T, directed=True, indices=iziz_cells, return_predecessors=True)
    dist_iziz_comp_rev, pred_iziz_comp_rev = dijkstra(G_iziz_comp.T, directed=True, indices=iziz_cells, return_predecessors=True)

    dist_izv_bulk, pred_izv_bulk = dijkstra(G_izv_bulk, directed=True, indices=iziz_cells, return_predecessors=True)
    dist_izv_comp, pred_izv_comp = dijkstra(G_izv_comp, directed=True, indices=iziz_cells, return_predecessors=True)
    dist_izv_bulk_rev, pred_izv_bulk_rev = dijkstra(G_izv_bulk.T, directed=True, indices=iziz_cells, return_predecessors=True)
    dist_izv_comp_rev, pred_izv_comp_rev = dijkstra(G_izv_comp.T, directed=True, indices=iziz_cells, return_predecessors=True)

    dist_voth_bulk, pred_voth_bulk = dijkstra(G_voth_bulk, directed=True, indices=voth_cells, return_predecessors=True)
    dist_voth_comp, pred_voth_comp = dijkstra(G_voth_comp, directed=True, indices=voth_cells, return_predecessors=True)
    dist_voth_bulk_rev, pred_voth_bulk_rev = dijkstra(G_voth_bulk.T, directed=True, indices=voth_cells, return_predecessors=True)
    dist_voth_comp_rev, pred_voth_comp_rev = dijkstra(G_voth_comp.T, directed=True, indices=voth_cells, return_predecessors=True)

    dist_yeti_bulk, pred_yeti_bulk = dijkstra(G_yeti_bulk, directed=True, indices=yeti_cells, return_predecessors=True)
    dist_yeti_comp, pred_yeti_comp = dijkstra(G_yeti_comp, directed=True, indices=yeti_cells, return_predecessors=True)
    dist_yeti_bulk_rev, pred_yeti_bulk_rev = dijkstra(G_yeti_bulk.T, directed=True, indices=yeti_cells, return_predecessors=True)
    dist_yeti_comp_rev, pred_yeti_comp_rev = dijkstra(G_yeti_comp.T, directed=True, indices=yeti_cells, return_predecessors=True)

    return {
        "N_CELL": N_CELL, "GW": GW, "GH": GH,
        "sids": sids, "sid_to_idx": {sid: i for i, sid in enumerate(sids)},
        "iziz_sids": iziz_sids, "iziz_sid_to_idx": {sid: i for i, sid in enumerate(iziz_sids)},
        "voth_sids": voth_sids, "voth_sid_to_idx": {sid: i for i, sid in enumerate(voth_sids)},
        "yeti_sids": yeti_sids, "yeti_sid_to_idx": {sid: i for i, sid in enumerate(yeti_sids)},
        "dist_bulk": dist_bulk, "pred_bulk": pred_bulk,
        "dist_comp": dist_comp, "pred_comp": pred_comp,
        "dist_iziz_bulk": dist_iziz_bulk, "pred_iziz_bulk": pred_iziz_bulk,
        "dist_iziz_comp": dist_iziz_comp, "pred_iziz_comp": pred_iziz_comp,
        "dist_iziz_bulk_rev": dist_iziz_bulk_rev, "pred_iziz_bulk_rev": pred_iziz_bulk_rev,
        "dist_iziz_comp_rev": dist_iziz_comp_rev, "pred_iziz_comp_rev": pred_iziz_comp_rev,
        "dist_izv_bulk": dist_izv_bulk, "pred_izv_bulk": pred_izv_bulk,
        "dist_izv_comp": dist_izv_comp, "pred_izv_comp": pred_izv_comp,
        "dist_izv_bulk_rev": dist_izv_bulk_rev, "pred_izv_bulk_rev": pred_izv_bulk_rev,
        "dist_izv_comp_rev": dist_izv_comp_rev, "pred_izv_comp_rev": pred_izv_comp_rev,
        "dist_voth_bulk": dist_voth_bulk, "pred_voth_bulk": pred_voth_bulk,
        "dist_voth_comp": dist_voth_comp, "pred_voth_comp": pred_voth_comp,
        "dist_voth_bulk_rev": dist_voth_bulk_rev, "pred_voth_bulk_rev": pred_voth_bulk_rev,
        "dist_voth_comp_rev": dist_voth_comp_rev, "pred_voth_comp_rev": pred_voth_comp_rev,
        "dist_yeti_bulk": dist_yeti_bulk, "pred_yeti_bulk": pred_yeti_bulk,
        "dist_yeti_comp": dist_yeti_comp, "pred_yeti_comp": pred_yeti_comp,
        "dist_yeti_bulk_rev": dist_yeti_bulk_rev, "pred_yeti_bulk_rev": pred_yeti_bulk_rev,
        "dist_yeti_comp_rev": dist_yeti_comp_rev, "pred_yeti_comp_rev": pred_yeti_comp_rev,
        "is_ring_sea": is_ring_sea, "inland_lake": inland_lake, "river_nav": river_nav, "canal_nav": canal_nav,
        "road_mult": road_mult, "supp_roads": supp_roads,
        "special_corridors": SPECIAL_CORRIDORS + IZIZ_VISAS_CORRIDORS,
        "mask_lizard_hostile": mask_lizard_hostile, "mask_lizard_poly": mask_lizard_poly,
        "mask_lizard_raid_xanadu": mask_lizard_raid_xanadu, "mask_lizard_raid_dalab": mask_lizard_raid_dalab,
        "mask_screamer_hostile": mask_screamer_hostile, "mask_screamer_poly": mask_screamer_poly,
        "mask_yeti_poly": mask_yeti_poly, "mask_yeti_raid": mask_yeti_raid,
        "mask_painted_poly": mask_painted_poly, "mask_painted_raid": mask_painted_core | mask_painted_halo,
        "mask_fellgang_poly": mask_fellgang_poly, "mask_fellgang_raid": mask_fellgang_core | mask_fellgang_halo,
        "mask_scyvoi_poly": mask_scyvoi_poly, "mask_scyvoi_raid": mask_scyvoi_core | mask_scyvoi_halo,
        "mask_beastrider_core": mask_beastrider_core, "mask_beastrider_raid": mask_beastrider_core | mask_beastrider_halo,
        "mask_vrivolci_poly": mask_vrivolci_poly, "mask_vrivolci_raid": mask_vrivolci_core | mask_vrivolci_halo,
        "mask_boatmurder_bandits": mask_boatmurder_bandits,
        "mask_swhigh_poly": mask_swhigh_poly, "mask_swhigh_raid": mask_swhigh_core | mask_swhigh_halo,
        "mask_coyote_nomad_raid": mask_coyote_nomad_raid,
        "mask_nomad_desert_bandits": mask_nomad_desert_bandits,
        "mask_throne_native_raid": mask_throne_native_raid,
        "shim_mouth_links": shim_mouth_links,
        "farport_mouth_links": farport_mouth_links,
    }


# ---------------------------------------------------------------------------
# 6. Reconstruct Pairwise Paths, Mode Shares, Chokepoints & Pirate Exposure
# ---------------------------------------------------------------------------
IZIZ_IMPERIAL_POLS = {"Empire of Iziz", "Shell Province", "Tiguantin"}
CUT_VISAS_PARTNER_POLS = {"Dilihan Province", "Jimjam", "Dam Basin Salvagers", "Free Clans"}
BELLIGERENT_NAVAL_POLS = {"Empire of Iziz", "Shell Province", "Vothic Kingdom"}
THRONE_COLONIAL_POLS = {"Vothic Kingdom", "Empire of Iziz", "Shell Province", "League: Ys", "League: Tethys", "League: Trigon", "League: Pontus"}
# Polities situated inside or bordering the Inner Crater (Beast Riders — incl. wide-ranging Millipede Tribe — never leave the inner crater!)
INNER_CRATER_POLS = {
    "Beast Riders", "Kautoa", "Empire of Iziz", "Shell Province", "Dilihan Province",
    "Vothic Kingdom", "League: Ys", "League: Tethys", "League: Trigon", "League: Pontus",
    "Hookfleet", "West Ring Islanders", "Zeijani", "Andaru",
    "Shumari", "Scyvoi", "Free Giants (Vrivolci)",
}


def uses_iziz_visas_regime(pol_a, pol_b):
    return (pol_a in IZIZ_IMPERIAL_POLS and pol_b in CUT_VISAS_PARTNER_POLS) or (
        pol_b in IZIZ_IMPERIAL_POLS and pol_a in CUT_VISAS_PARTNER_POLS
    )


def is_iziz_voth_war_pair(pol_a, pol_b):
    return (pol_a in IZIZ_IMPERIAL_POLS and pol_b == "Vothic Kingdom") or (
        pol_b in IZIZ_IMPERIAL_POLS and pol_a == "Vothic Kingdom"
    )


def pick_pair_regime(pol_a, pol_b):
    if is_iziz_voth_war_pair(pol_a, pol_b):
        return "war_intermediary"
    if "Yeti Kingdom" in (pol_a, pol_b):
        return "yeti"
    if uses_iziz_visas_regime(pol_a, pol_b):
        return "iziz_visas"
    if pol_a in IZIZ_IMPERIAL_POLS or pol_b in IZIZ_IMPERIAL_POLS:
        return "iziz"
    if pol_a == "Vothic Kingdom" or pol_b == "Vothic Kingdom":
        return "voth"
    return "std"


def downsample_poly_and_modes(full_poly, seg_modes, target_pts=55):
    if len(full_poly) <= 2 or not seg_modes:
        return list(full_poly), list(seg_modes[:max(0, len(full_poly) - 1)])
    step = max(1, (len(full_poly) - 1) // target_pts)
    idxs = list(range(0, len(full_poly) - 1, step))
    if idxs[-1] != len(full_poly) - 1:
        idxs.append(len(full_poly) - 1)
    ds_poly = [full_poly[i] for i in idxs]
    ds_modes = []
    for k in range(len(idxs) - 1):
        chunk = seg_modes[idxs[k]:idxs[k + 1]]
        if not chunk:
            ds_modes.append(seg_modes[min(idxs[k], len(seg_modes) - 1)])
        else:
            counts = defaultdict(int)
            for m in chunk:
                counts[m] += 1
            ds_modes.append(max(counts.items(), key=lambda kv: kv[1])[0])
    return ds_poly, ds_modes


def analyze_pair_path(world, graph, setts, sid_src, sid_dst, tier):
    N_CELL, GW = graph["N_CELL"], graph["GW"]
    OW, OH, GH = world["OW"], world["OH"], world["GH"]
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)

    pol_s, pol_d = setts[sid_src]["polity"], setts[sid_dst]["polity"]
    reg = pick_pair_regime(pol_s, pol_d)

    u_src = setts[sid_src]["cell"]
    u_dst = setts[sid_dst]["cell"]

    if reg == "yeti":
        if sid_src in graph["yeti_sid_to_idx"]:
            yt_i = graph["yeti_sid_to_idx"][sid_src]
            pred = graph["pred_yeti_bulk"][yt_i] if tier == "bulk" else graph["pred_yeti_comp"][yt_i]
            root_cell, leaf_cell, need_rev = u_src, u_dst, True
        else:
            yt_j = graph["yeti_sid_to_idx"][sid_dst]
            pred = graph["pred_yeti_bulk_rev"][yt_j] if tier == "bulk" else graph["pred_yeti_comp_rev"][yt_j]
            root_cell, leaf_cell, need_rev = u_dst, u_src, False
    elif reg == "iziz_visas":
        if sid_src in graph["iziz_sid_to_idx"]:
            iz_i = graph["iziz_sid_to_idx"][sid_src]
            pred = graph["pred_izv_bulk"][iz_i] if tier == "bulk" else graph["pred_izv_comp"][iz_i]
            root_cell, leaf_cell, need_rev = u_src, u_dst, True
        else:
            iz_j = graph["iziz_sid_to_idx"][sid_dst]
            pred = graph["pred_izv_bulk_rev"][iz_j] if tier == "bulk" else graph["pred_izv_comp_rev"][iz_j]
            root_cell, leaf_cell, need_rev = u_dst, u_src, False
    elif reg == "iziz":
        if sid_src in graph["iziz_sid_to_idx"]:
            iz_i = graph["iziz_sid_to_idx"][sid_src]
            pred = graph["pred_iziz_bulk"][iz_i] if tier == "bulk" else graph["pred_iziz_comp"][iz_i]
            root_cell, leaf_cell, need_rev = u_src, u_dst, True
        else:
            iz_j = graph["iziz_sid_to_idx"][sid_dst]
            pred = graph["pred_iziz_bulk_rev"][iz_j] if tier == "bulk" else graph["pred_iziz_comp_rev"][iz_j]
            root_cell, leaf_cell, need_rev = u_dst, u_src, False
    elif reg == "voth":
        if sid_src in graph["voth_sid_to_idx"]:
            vt_i = graph["voth_sid_to_idx"][sid_src]
            pred = graph["pred_voth_bulk"][vt_i] if tier == "bulk" else graph["pred_voth_comp"][vt_i]
            root_cell, leaf_cell, need_rev = u_src, u_dst, True
        else:
            vt_j = graph["voth_sid_to_idx"][sid_dst]
            pred = graph["pred_voth_bulk_rev"][vt_j] if tier == "bulk" else graph["pred_voth_comp_rev"][vt_j]
            root_cell, leaf_cell, need_rev = u_dst, u_src, False
    else:
        i_src = graph["sid_to_idx"][sid_src]
        pred = graph["pred_bulk"][i_src] if tier == "bulk" else graph["pred_comp"][i_src]
        root_cell, leaf_cell, need_rev = u_src, u_dst, True

    nodes = []
    cur = leaf_cell
    steps_guard = 0
    while cur != root_cell and cur >= 0 and steps_guard < 12000:
        nodes.append(cur)
        cur = int(pred[cur])
        steps_guard += 1
    if cur != root_cell:
        return None
    nodes.append(root_cell)
    if need_rev:
        nodes.reverse()

    # Map coastal/lake port transitions (involving Layer 1) vs inland river-wharf transitions (Layer 0 <-> Layer 2)
    cell_to_sea_port = {}
    cell_to_barge_wharf = {}
    for sid, s in setts.items():
        if s["water_cell"] is not None and not s.get("abstract_region"):
            cell_to_sea_port[s["cell"]] = s["name"]
            cell_to_sea_port[N_CELL + s["water_cell"]] = s["name"]
            if s.get("river_cell") is not None:
                cell_to_sea_port[2 * N_CELL + s["river_cell"]] = s["name"]
        elif s.get("river_cell") is not None and not s.get("abstract_region"):
            cell_to_barge_wharf[s["cell"]] = s["name"]
            cell_to_barge_wharf[2 * N_CELL + s["river_cell"]] = s["name"]
    # Credit Shim & Farport where their trunk river estuaries transfer directly onto open sea shipping
    for rc2_sh, wc1_sh in graph.get("shim_mouth_links", []):
        cell_to_sea_port.setdefault(rc2_sh, "Shim")
        cell_to_sea_port.setdefault(wc1_sh, "Shim")
    for rc2_fp, wc1_fp in graph.get("farport_mouth_links", []):
        cell_to_sea_port.setdefault(rc2_fp, "Farport")
        cell_to_sea_port.setdefault(wc1_fp, "Farport")

    spec_lookup = {}
    for cname, x0, y0, x1, y1, rkm, _, _ in graph["special_corridors"]:
        u = int(round(snap_to_land(world, x0, y0)[1] * sv)) * GW + int(round(snap_to_land(world, x0, y0)[0] * su))
        v = int(round(snap_to_land(world, x1, y1)[1] * sv)) * GW + int(round(snap_to_land(world, x1, y1)[0] * su))
        spec_lookup[(u, v)] = (cname, rkm)
        spec_lookup[(v, u)] = (cname, rkm)

    sea_km = riv_km = hwy_km = trail_km = spec_km = 0.0
    ring_sea_km = 0.0
    exposed_ring_sea_km = 0.0
    mira_truce_km = 0.0
    lizard_km = 0.0
    lizard_raid_km = 0.0
    screamer_km = 0.0
    yeti_km = 0.0
    painted_km = 0.0
    fellgang_km = 0.0
    scyvoi_km = 0.0
    beastrider_km = 0.0
    beastrider_core_km = 0.0
    vrivolci_km = 0.0
    boatmurder_km = 0.0
    swhigh_km = 0.0
    coyote_nomad_km = 0.0
    desert_bandit_km = 0.0
    throne_native_km = 0.0
    min_pirate_dist_km = 9999.0
    pirate_cove_coords = [(s["px"] * su, s["py"] * sv) for s in setts.values() if s["polity"] in ("Ring Sea Pirates", "Hookfleet")]
    mira_s = next((s for s in setts.values() if s["name"] == "Port Mira"), None)
    mira_ci, mira_cj = (mira_s["px"] * su, mira_s["py"] * sv) if mira_s else (-999.0, -999.0)

    ports_used = []
    barge_hubs_used = []
    corridors_used = []
    poly_51 = []
    seg_modes = []

    for k in range(len(nodes) - 1):
        a, b = nodes[k], nodes[k + 1]
        la, lb = a // N_CELL, b // N_CELL  # 0=overland, 1=sea/lake, 2=river/canal
        ca, cb = a % N_CELL, b % N_CELL
        aj, ai = divmod(ca, GW)
        bj, bi = divmod(cb, GW)
        px_a, py_a = ai / su, aj / sv
        px_b, py_b = bi / su, bj / sv
        if k == 0:
            poly_51.append([round(px_a, 1), round(py_a, 1)])

        if la != lb:
            if 1 in (la, lb):
                pname = cell_to_sea_port.get(a) or cell_to_sea_port.get(b)
                if pname and (not ports_used or ports_used[-1] != pname):
                    ports_used.append(pname)
            else:
                bname = cell_to_barge_wharf.get(a) or cell_to_barge_wharf.get(b)
                if bname and bname not in barge_hubs_used:
                    barge_hubs_used.append(bname)
            continue

        if la == 0 and (a, b) in spec_lookup:
            cname, rkm = spec_lookup[(a, b)]
            spec_km += rkm
            if cname not in corridors_used:
                corridors_used.append(cname)
            if "Xanadu" in cname or "Vale Gate" in cname:
                lizard_raid_km += rkm
            if "Loj Fower" in cname or "Nulab" in cname:
                fellgang_km += rkm
            if "Yeti North Rim" in cname or "Qoold Lheek–Jimjam Dirt Road" in cname:
                yeti_km += rkm
            if "Boatmurder" in cname or "Serai" in cname:
                boatmurder_km += rkm
            if "Bowl" in cname or "Godsgate" in cname or "Catch" in cname:
                desert_bandit_km += rkm
            if "God's Road North" in cname:
                painted_km += 80.0
                beastrider_core_km += 120.0
                beastrider_km += 120.0
            poly_51.append([round(px_b, 1), round(py_b, 1)])
            seg_modes.append("corridor")
            continue

        step_km = 4.0 * math.hypot(bi - ai, bj - aj)
        if la == 1:
            if graph["is_ring_sea"][aj, ai] or graph["is_ring_sea"][bj, bi]:
                sea_km += step_km
                ring_sea_km += step_km
                mx_i, my_j = 0.5 * (ai + bi), 0.5 * (aj + bj)
                # Port Mira's 50-km rule: NO shipjacking within 50 km of Port Mira!
                d_mira_km = 4.0 * math.hypot(mx_i - mira_ci, my_j - mira_cj)
                if d_mira_km <= 50.0:
                    mira_truce_km += step_km
                else:
                    exposed_ring_sea_km += step_km
                    for pci, pcj in pirate_cove_coords:
                        d_pir = 4.0 * math.hypot(mx_i - pci, my_j - pcj)
                        if d_pir < min_pirate_dist_km:
                            min_pirate_dist_km = d_pir
                mode = "sea"
            else:
                # Farside Ocean vs calm inland lake (Jimjam's Lake, Lake Shim, Iziz Lake, Lake Xanadu, Spider Lake):
                # Open ocean (px < 465 and py < 630) counts as sea; calm inland lakes count as lake barging ("river")!
                if px_a < 465.0 and py_a < 630.0:
                    sea_km += step_km
                    mode = "sea"
                else:
                    riv_km += step_km
                    mode = "river"
        else:
            if graph["mask_lizard_hostile"][aj, ai] or graph["mask_lizard_hostile"][bj, bi]:
                lizard_km += step_km
            if (
                graph["mask_lizard_raid_xanadu"][aj, ai] or graph["mask_lizard_raid_xanadu"][bj, bi]
                or graph["mask_lizard_raid_dalab"][aj, ai] or graph["mask_lizard_raid_dalab"][bj, bi]
            ):
                lizard_raid_km += step_km
            if graph["mask_screamer_hostile"][aj, ai] or graph["mask_screamer_hostile"][bj, bi]:
                screamer_km += step_km
            if graph["mask_yeti_raid"][aj, ai] or graph["mask_yeti_raid"][bj, bi]:
                yeti_km += step_km
            if graph["mask_painted_raid"][aj, ai] or graph["mask_painted_raid"][bj, bi]:
                painted_km += step_km
            if graph["mask_fellgang_raid"][aj, ai] or graph["mask_fellgang_raid"][bj, bi]:
                fellgang_km += step_km
            if graph["mask_scyvoi_raid"][aj, ai] or graph["mask_scyvoi_raid"][bj, bi]:
                scyvoi_km += step_km
            if graph["mask_beastrider_core"][aj, ai] or graph["mask_beastrider_core"][bj, bi]:
                beastrider_core_km += step_km
            if graph["mask_beastrider_raid"][aj, ai] or graph["mask_beastrider_raid"][bj, bi]:
                beastrider_km += step_km
            if graph["mask_vrivolci_raid"][aj, ai] or graph["mask_vrivolci_raid"][bj, bi]:
                vrivolci_km += step_km
            if graph["mask_boatmurder_bandits"][aj, ai] or graph["mask_boatmurder_bandits"][bj, bi]:
                boatmurder_km += step_km
            if graph["mask_swhigh_raid"][aj, ai] or graph["mask_swhigh_raid"][bj, bi]:
                swhigh_km += step_km
            if graph["mask_coyote_nomad_raid"][aj, ai] or graph["mask_coyote_nomad_raid"][bj, bi]:
                coyote_nomad_km += step_km
            if graph["mask_nomad_desert_bandits"][aj, ai] or graph["mask_nomad_desert_bandits"][bj, bi]:
                desert_bandit_km += step_km
            if graph["mask_throne_native_raid"][aj, ai] or graph["mask_throne_native_raid"][bj, bi]:
                throne_native_km += step_km

            if la == 2:
                riv_km += step_km
                mode = "river"
            elif graph["road_mult"][aj, ai] < 0.95 and graph["road_mult"][bj, bi] < 0.95:
                hwy_km += step_km
                mode = "highway"
            else:
                trail_km += step_km
                mode = "caravan"

        poly_51.append([round(px_b, 1), round(py_b, 1)])
        seg_modes.append(mode)

    # Detect key land/river gateway settlements passed within 12 km (3 cells)
    GATEWAY_NAMES = [
        "Dilihan", "Port Visas", "Ardent", "Jimjam", "Leng", "Palewharf", "Bastion", "Talia", "Verge",
        "Arcbeam", "Mantis", "Parabola", "Bab al-Hawa (Godsgate)", "Kolli Oasis", "Arfwai Oasis",
        "Catch Salt Works", "Stair", "The Twins", "White Gills Hermitage", "Strongbow", "Kirstabal", "Qiblai", "Theodiga",
        "Roketstad", "Cascade", "Span", "Ledge", "The Gate", "The Sill (Sam-Lok)",
        "Spider Lake Weirs", "Hook", "Port Mira", "Port Tobin", "Port Goto", "Marr", "Ys", "Tethis", "Nephtos",
        "Trigon", "Almua", "Zey'danin", "Dhelv", "Kautoa", "Bipo", "Farport", "Fulcrum", "Boatmurder",
        "Dapor", "Silkhead", "Jabal", "Hall of Heroes", "Shim", "Guari", "Ṣunu-Ašru",
    ]
    gw_cells = [
        (nm, setts[sid]["cell"] % N_CELL)
        for sid, s in setts.items()
        for nm in [s["name"]]
        if nm in GATEWAY_NAMES and not s.get("abstract_region")
    ]
    gateways_hit = list(barge_hubs_used)
    land_pts = [(n % N_CELL) for n in nodes if (n // N_CELL) in (0, 2)]
    for gname, gc in gw_cells:
        gj, gi = divmod(gc, GW)
        for lp in land_pts:
            lj, li = divmod(lp, GW)
            if (lj - gj) ** 2 + (li - gi) ** 2 <= 25:
                if gname not in gateways_hit:
                    gateways_hit.append(gname)
                break

    total_km = max(1.0, sea_km + riv_km + hwy_km + trail_km + spec_km)
    pirate_rate = 0.0
    naval_war_rate = 0.0
    # Enforce Port Mira's 50-km truce zone: zero shipjacking inside 50 km of Port Mira;
    # voyages passing partially outside scale exposure by exposed_ring_sea_km / ring_sea_km!
    if exposed_ring_sea_km >= 12.0 and ring_sea_km > 0.0:
        exp_frac = min(1.0, exposed_ring_sea_km / max(ring_sea_km, 1.0))
        prox = math.exp(-max(0.0, min_pirate_dist_km - 40.0) / 260.0)
        pirate_rate = min(0.078, 0.025 + 0.053 * prox) * exp_frac
        if pol_s in BELLIGERENT_NAVAL_POLS or pol_d in BELLIGERENT_NAVAL_POLS:
            naval_war_rate = 0.048 * exp_frac

    raider_tags = []
    if mira_truce_km >= 16.0 and exposed_ring_sea_km < 12.0:
        raider_tags.append("Port Mira 50-Kil Truce Zone (No Shipjacking)")
    if naval_war_rate > 0:
        raider_tags.append("Iziz-Voth Naval War (Shipping Raids)")
    if any("Iziz-Guarded Visas Caravan" in c for c in corridors_used):
        raider_tags.append("ARMED IZIZ GUARD ESCORT (Screamer Fringe)")
    elif screamer_km > 12:
        raider_tags.append(f"Screamer Raid Zone ({round(screamer_km)} km)")
    if lizard_km > 20:
        raider_tags.append(f"Hostile Rift Floor ({round(lizard_km)} km)")
    elif lizard_raid_km >= 28:
        raider_tags.append("Lizardman Raid Hazard")
    if boatmurder_km >= 24:
        raider_tags.append("Boatmurder Highwaymen (NE Highways)")
    if beastrider_km >= 20:
        raider_tags.append("Beast Rider Raids")
    if (
        (pol_s in ("Zeijani", "Andaru") and pol_d in THRONE_COLONIAL_POLS)
        or (pol_d in ("Zeijani", "Andaru") and pol_s in THRONE_COLONIAL_POLS)
        or (throne_native_km >= 16 and (pol_s in THRONE_COLONIAL_POLS or pol_d in THRONE_COLONIAL_POLS))
    ):
        raider_tags.append("Zeijani & Andaru Anti-Colonial Raids")
    if vrivolci_km >= 20:
        raider_tags.append("Vrivolci Giant Raids")
    if swhigh_km >= 20 and "Realm of Dalab" not in (pol_s, pol_d):
        raider_tags.append("Frogmen / SW Highlander Raids")
    if desert_bandit_km >= 32:
        raider_tags.append("Desert Nomad Bandits")
    if coyote_nomad_km >= 20:
        raider_tags.append("Coyote-Nomad Border Raids")
    if fellgang_km >= 24:
        raider_tags.append("Fellgang Raider Risk")
    if scyvoi_km >= 24:
        raider_tags.append("Scyvoi Lowland Raids")
    if painted_km >= 24:
        raider_tags.append("Painted Men Raid Risk")
    if yeti_km >= 24:
        raider_tags.append("Yeti Raid Frontier")

    ds_poly, ds_modes = downsample_poly_and_modes(poly_51, seg_modes, target_pts=55)
    return {
        "real_km": round(total_km),
        "sea_km": round(sea_km),
        "ring_sea_km": round(ring_sea_km),
        "exposed_ring_sea_km": round(exposed_ring_sea_km),
        "mira_truce_km": round(mira_truce_km),
        "river_km": round(riv_km),
        "highway_km": round(hwy_km),
        "caravan_km": round(trail_km),
        "corridor_km": round(spec_km),
        "lizard_km": round(lizard_km),
        "lizard_raid_km": round(lizard_raid_km),
        "screamer_km": round(screamer_km),
        "yeti_km": round(yeti_km),
        "painted_km": round(painted_km),
        "fellgang_km": round(fellgang_km),
        "scyvoi_km": round(scyvoi_km),
        "beastrider_km": round(beastrider_km),
        "beastrider_core_km": round(beastrider_core_km),
        "vrivolci_km": round(vrivolci_km),
        "boatmurder_km": round(boatmurder_km),
        "swhigh_km": round(swhigh_km),
        "coyote_nomad_km": round(coyote_nomad_km),
        "desert_bandit_km": round(desert_bandit_km),
        "throne_native_km": round(throne_native_km),
        "raider_tags": raider_tags,
        "ports": ports_used,
        "corridors": corridors_used,
        "gateways": gateways_hit,
        "pirate_rate": pirate_rate,
        "naval_war_rate": naval_war_rate,
        "poly_51": ds_poly,
        "poly_modes": ds_modes,
        "seg_modes": seg_modes,
        "full_poly": poly_51,
    }


# ---------------------------------------------------------------------------
# 7. Solve Cross-Polity Trade Flows, Pirate Interception & Entrepot Throughput
# ---------------------------------------------------------------------------
TIER_ALPHA = {"bulk": 2.15, "medium": 1.48, "compact": 1.08}


def solve_trade(world, setts, graph):
    sids = graph["sids"]
    sid_to_idx = graph["sid_to_idx"]
    iziz_sid_to_idx = graph["iziz_sid_to_idx"]
    voth_sid_to_idx = graph["voth_sid_to_idx"]
    yeti_sid_to_idx = graph["yeti_sid_to_idx"]
    noas_sid = next(sid for sid, s in setts.items() if s["name"] == "Noa's Regret")
    shanty_sid = next(sid for sid, s in setts.items() if s["name"] == "Shanty")
    boiling_sid = next(sid for sid, s in setts.items() if s["name"] == "Boiling Bay")
    port_mira_sid = next(sid for sid, s in setts.items() if s["name"] == "Port Mira")
    nephtos_sid = next(sid for sid, s in setts.items() if s["name"] == "Nephtos")
    marr_sid = next(sid for sid, s in setts.items() if s["name"] == "Marr")
    kautoa_sid = next(sid for sid, s in setts.items() if s["name"] == "Kautoa")
    # Pirate prize fencing havens: Port Mira (pirate & smuggler haven accepting all ships!) + 3 Ring Sea Pirate coves.
    # NOTE: Nephtos is strictly a SMUGGLING haven, NEVER a piracy haven!
    pirate_cove_shares = [(port_mira_sid, 0.34), (noas_sid, 0.31), (shanty_sid, 0.20), (boiling_sid, 0.15)]
    # Wartime smuggling intermediaries between Iziz & Voth:
    # Nephtos (northern/eastern Ring Sea smuggling haven!) & Port Mira (southern Throne smuggling & pirate haven!);
    # Dhelv excluded (inland cavern, Zeijani have zero fleet!) and Kautoa excluded (cool with Iziz as Beast Riders' navy!).
    neutral_intermediaries = [(nephtos_sid, 18.0), (port_mira_sid, 20.0)]

    # Group settlements by polity
    pol_members = defaultdict(list)
    for sid in sids:
        pol_members[setts[sid]["polity"]].append(sid)

    path_cache = {}

    def single_leg_eff(sid_a, sid_b, is_bulk):
        pol_a, pol_b = setts[sid_a]["polity"], setts[sid_b]["polity"]
        reg = pick_pair_regime(pol_a, pol_b)
        if reg == "yeti":
            if sid_a in yeti_sid_to_idx:
                dmat = graph["dist_yeti_bulk"] if is_bulk else graph["dist_yeti_comp"]
                return float(dmat[yeti_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            dmat = graph["dist_yeti_bulk_rev"] if is_bulk else graph["dist_yeti_comp_rev"]
            return float(dmat[yeti_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        if reg == "iziz_visas":
            if sid_a in iziz_sid_to_idx:
                dmat = graph["dist_izv_bulk"] if is_bulk else graph["dist_izv_comp"]
                return float(dmat[iziz_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            dmat = graph["dist_izv_bulk_rev"] if is_bulk else graph["dist_izv_comp_rev"]
            return float(dmat[iziz_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        if reg == "iziz":
            if sid_a in iziz_sid_to_idx:
                dmat = graph["dist_iziz_bulk"] if is_bulk else graph["dist_iziz_comp"]
                return float(dmat[iziz_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            dmat = graph["dist_iziz_bulk_rev"] if is_bulk else graph["dist_iziz_comp_rev"]
            return float(dmat[iziz_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        if reg == "voth":
            if sid_a in voth_sid_to_idx:
                dmat = graph["dist_voth_bulk"] if is_bulk else graph["dist_voth_comp"]
                return float(dmat[voth_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            dmat = graph["dist_voth_bulk_rev"] if is_bulk else graph["dist_voth_comp_rev"]
            return float(dmat[voth_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        ia = sid_to_idx[sid_a]
        dmat = graph["dist_bulk"] if is_bulk else graph["dist_comp"]
        return float(dmat[ia, setts[sid_b]["cell"]])

    def izani_leg_with_marr(sid_x, mid_sid, is_bulk, forward=True):
        """Marr is friendly to smugglers despite official efforts to stamp it out, making it their preferred Izani entrepot."""
        base = single_leg_eff(sid_x, mid_sid, is_bulk) if forward else single_leg_eff(mid_sid, sid_x, is_bulk)
        if setts[sid_x]["polity"] in ("Empire of Iziz", "Tiguantin") and sid_x != marr_sid:
            if forward:
                via_m = single_leg_eff(sid_x, marr_sid, is_bulk) + single_leg_eff(marr_sid, mid_sid, is_bulk) - 18.0
            else:
                via_m = single_leg_eff(mid_sid, marr_sid, is_bulk) + single_leg_eff(marr_sid, sid_x, is_bulk) - 18.0
            if via_m < base:
                return via_m, True
        return base, False

    def best_war_intermediary(sid_a, sid_b, is_bulk):
        best = (float("inf"), None, False)
        for mid_sid, mid_fee in neutral_intermediaries:
            e1, m1 = izani_leg_with_marr(sid_a, mid_sid, is_bulk, forward=True)
            e2, m2 = izani_leg_with_marr(sid_b, mid_sid, is_bulk, forward=False)
            tot = e1 + e2 + mid_fee
            if tot < best[0]:
                best = (tot, mid_sid, m1 or m2)
        return best

    def fast_eff(sid_a, sid_b, tier):
        pol_a, pol_b = setts[sid_a]["polity"], setts[sid_b]["polity"]
        is_bulk = tier == "bulk"
        if is_iziz_voth_war_pair(pol_a, pol_b):
            return best_war_intermediary(sid_a, sid_b, is_bulk)[0]
        return single_leg_eff(sid_a, sid_b, is_bulk)

    def compose_two_legs(p1, p2, mid_nm, lead_tag=None):
        ports = list(p1["ports"])
        if mid_nm and mid_nm not in ports:
            ports.append(mid_nm)
        for p in p2["ports"]:
            if not ports or ports[-1] != p:
                ports.append(p)
        corrs = list(dict.fromkeys(p1["corridors"] + p2["corridors"]))
        gws = list(dict.fromkeys(p1["gateways"] + ([mid_nm] if mid_nm else []) + p2["gateways"]))
        full_poly = p1["full_poly"] + (p2["full_poly"][1:] if len(p2["full_poly"]) > 1 else [])
        seg_modes = p1["seg_modes"] + p2["seg_modes"]
        comb_pirate = 1.0 - (1.0 - p1["pirate_rate"]) * (1.0 - p2["pirate_rate"])
        tot_rs = p1["ring_sea_km"] + p2["ring_sea_km"]
        exp_rs = p1["exposed_ring_sea_km"] + p2["exposed_ring_sea_km"]
        comb_war = (0.065 * min(1.0, exp_rs / max(tot_rs, 1.0))) if exp_rs >= 16.0 else 0.0
        rtags = ([lead_tag] if lead_tag else []) + [
            t for t in dict.fromkeys(p1["raider_tags"] + p2["raider_tags"]) if t != lead_tag
        ]
        out = {}
        for k_num in (
            "real_km", "sea_km", "ring_sea_km", "exposed_ring_sea_km", "mira_truce_km",
            "river_km", "highway_km", "caravan_km", "corridor_km",
            "lizard_km", "lizard_raid_km", "screamer_km", "yeti_km", "painted_km", "fellgang_km", "scyvoi_km",
            "beastrider_km", "beastrider_core_km", "vrivolci_km", "boatmurder_km", "swhigh_km",
            "coyote_nomad_km", "desert_bandit_km", "throne_native_km",
        ):
            out[k_num] = p1[k_num] + p2[k_num]
        ds_poly_c, ds_modes_c = downsample_poly_and_modes(full_poly, seg_modes, target_pts=55)
        out.update({
            "raider_tags": rtags,
            "ports": ports,
            "corridors": corrs,
            "gateways": gws,
            "pirate_rate": comb_pirate,
            "naval_war_rate": comb_war,
            "poly_51": ds_poly_c,
            "poly_modes": ds_modes_c,
            "seg_modes": seg_modes,
            "full_poly": full_poly,
        })
        return out

    def compose_intermediary_path(sid_a, mid_sid, sid_b, tkey, use_marr=False):
        is_bulk = tkey == "bulk"
        if use_marr and setts[sid_a]["polity"] in ("Empire of Iziz", "Tiguantin") and sid_a != marr_sid:
            pa1 = analyze_pair_path(world, graph, setts, sid_a, marr_sid, tkey)
            pa2 = analyze_pair_path(world, graph, setts, marr_sid, mid_sid, tkey)
            p1 = compose_two_legs(pa1, pa2, "Marr", "Marr Smuggler Entrepôt") if (pa1 and pa2) else analyze_pair_path(world, graph, setts, sid_a, mid_sid, tkey)
        else:
            p1 = analyze_pair_path(world, graph, setts, sid_a, mid_sid, tkey)

        if use_marr and setts[sid_b]["polity"] in ("Empire of Iziz", "Tiguantin") and sid_b != marr_sid:
            pb1 = analyze_pair_path(world, graph, setts, mid_sid, marr_sid, tkey)
            pb2 = analyze_pair_path(world, graph, setts, marr_sid, sid_b, tkey)
            p2 = compose_two_legs(pb1, pb2, "Marr", "Marr Smuggler Entrepôt") if (pb1 and pb2) else analyze_pair_path(world, graph, setts, mid_sid, sid_b, tkey)
        else:
            p2 = analyze_pair_path(world, graph, setts, mid_sid, sid_b, tkey)

        if not p1 or not p2:
            return None
        mid_nm = setts[mid_sid]["name"]
        mid_pol = setts[mid_sid]["polity"]
        tag_lead = f"WARTIME SMUGGLERS / INTERMEDIARY via {mid_nm} ({mid_pol})"
        return compose_two_legs(p1, p2, mid_nm, tag_lead)

    def get_pair(sid_a, sid_b, tier):
        tkey = "bulk" if tier == "bulk" else "comp"
        key = (sid_a, sid_b, tkey)
        if key not in path_cache:
            pol_a, pol_b = setts[sid_a]["polity"], setts[sid_b]["polity"]
            if is_iziz_voth_war_pair(pol_a, pol_b):
                eff, mid_sid, use_marr = best_war_intermediary(sid_a, sid_b, tkey == "bulk")
                info = compose_intermediary_path(sid_a, mid_sid, sid_b, tkey, use_marr) if (np.isfinite(eff) and mid_sid) else None
            else:
                eff = single_leg_eff(sid_a, sid_b, tkey == "bulk")
                info = analyze_pair_path(world, graph, setts, sid_a, sid_b, tkey) if np.isfinite(eff) else None
            path_cache[key] = (eff, info)
        return path_cache[key]

    per_good = {}
    polity_exports = defaultdict(lambda: defaultdict(float))
    polity_imports = defaultdict(lambda: defaultdict(float))
    sett_exports = defaultdict(lambda: defaultdict(float))
    sett_imports = defaultdict(lambda: defaultdict(float))
    entrepot_totals = defaultdict(lambda: {"sea_tons": 0.0, "land_tons": 0.0, "flows": 0, "goods": defaultdict(float)})
    pirate_ledger = defaultdict(lambda: {"captured": 0.0, "fenced": 0.0, "victims": defaultdict(float), "buyers": defaultdict(float)})
    rendered_corridors = []  # collected weighted polylines for map visualization
    FLEETLESS_VICTIM_POLS = {"Zeijani", "Andaru", "Tiguantin", "Beast Riders"}
    MILITARY_GOODS = {"arms", "rockets", "firearms", "armor", "weapons"}

    for g in GOODS:
        gid = g["id"]
        tier = g["tier"]
        alpha = TIER_ALPHA[tier]

        # 1. Net within each polity first (as TRADE-GOODS.md does, with League split per polis)
        sellers = []  # (sid, net_surplus)
        buyers = []   # (sid, net_deficit)
        pol_surplus_map = {}
        pol_deficit_map = {}

        for pol, members in pol_members.items():
            if pol in ("Ring Sea Pirates", "Lizardmen", "Screamer Country"):
                continue  # Pirates fence prizes in Pass 2; Lizardmen & Screamers never trade externally (raid caravans)!
            tot_s = sum(setts[m]["supply"].get(gid, 0.0) for m in members)
            tot_d = sum(setts[m]["demand"].get(gid, 0.0) for m in members)
            if tot_s > tot_d + 1e-6:
                net_s = tot_s - tot_d
                pol_surplus_map[pol] = net_s
                # Attribute polity's exportable surplus across its producing settlements
                pos = [(m, max(0.0, setts[m]["supply"].get(gid, 0.0) - setts[m]["demand"].get(gid, 0.0))) for m in members]
                sum_pos = sum(v for _, v in pos) or 1.0
                for m, v in pos:
                    if v > 0:
                        sellers.append((m, net_s * (v / sum_pos)))
            elif tot_d > tot_s + 1e-6:
                net_d = tot_d - tot_s
                pol_deficit_map[pol] = net_d
                neg = [(m, max(0.0, setts[m]["demand"].get(gid, 0.0) - setts[m]["supply"].get(gid, 0.0))) for m in members]
                sum_neg = sum(v for _, v in neg) or 1.0
                for m, v in neg:
                    if v > 0:
                        buyers.append((m, net_d * (v / sum_neg)))

        total_avail = sum(v for _, v in sellers)
        total_need = sum(v for _, v in buyers)
        market_vol = min(total_avail, total_need)

        raw_flows = []
        captured_pool = 0.0

        if market_vol > 1e-6 and sellers and buyers:
            # Gravity allocation over multimodal effective_km with political/taboo blocks
            buyer_weights = []
            for b_sid, b_need in buyers:
                b_pol = setts[b_sid]["polity"]
                w_row = []
                for s_sid, s_avail in sellers:
                    s_pol = setts[s_sid]["polity"]
                    if s_pol == b_pol:
                        w_row.append(0.0)
                        continue
                    # Lore bans & fraught bilateral embargoes:
                    # 1. Order of Historians banned from Voth (LORE.md:436; TRADE-SCOPE.md:593)
                    if {s_pol, b_pol} == {"Order of Historians", "Vothic Kingdom"}:
                        w_row.append(0.0)
                        continue
                    # 2. Firearms/rockets barred to Coyote Kingdom north of The Sill & Dilihan
                    if gid in ("rockets", "firearms") and b_pol in ("Coyote Kingdom", "Dilihan Province"):
                        w_row.append(0.0)
                        continue
                    # 3. Yeti Kingdom raids Eternal State & relations are fraught — no direct bilateral trade (LORE.md s6.19)
                    if {s_pol, b_pol} == {"Yeti Kingdom", "Eternal State"}:
                        w_row.append(0.0)
                        continue
                    # 3b. Abstract exterior maritime trade regions (Ria Valley & The Crook) trade with Krator via Farport, not directly with each other
                    if {s_pol, b_pol} == {"Ria Valley", "The Crook"}:
                        w_row.append(0.0)
                        continue
                    # 4. Empire of Iziz (+ Shell) <-> Vothic Kingdom State of War:
                    #    Zero war materiel or direct open bulk trade; only covert smuggler / neutral-intermediary cargoes!
                    war_pair = is_iziz_voth_war_pair(s_pol, b_pol)
                    if war_pair and (gid in MILITARY_GOODS or tier == "bulk"):
                        w_row.append(0.0)
                        continue
                    # 5. Beast Riders (incl. wide-ranging Millipede Tribe) NEVER leave the inner crater
                    #    and rely on Kautoa as their effective navy & coastal presence; hostile to Iziz!
                    if "Beast Riders" in (s_pol, b_pol):
                        other_pol = b_pol if s_pol == "Beast Riders" else s_pol
                        if other_pol not in INNER_CRATER_POLS:
                            w_row.append(0.0)
                            continue
                    br_iz_pair = ("Beast Riders" in (s_pol, b_pol)) and (s_pol in IZIZ_IMPERIAL_POLS or b_pol in IZIZ_IMPERIAL_POLS)
                    if br_iz_pair and gid in MILITARY_GOODS:
                        w_row.append(0.0)
                        continue
                    # 6. Kautoa <-> Iziz cool relations (because Kautoa serves as Beast Riders' navy) &
                    #    Kautoa <-> League: Tethys / Hykkousoi League hostility over Nephtos's claimed island!
                    ka_iz_pair = ("Kautoa" in (s_pol, b_pol)) and (s_pol in IZIZ_IMPERIAL_POLS or b_pol in IZIZ_IMPERIAL_POLS)
                    if ka_iz_pair and gid in MILITARY_GOODS:
                        w_row.append(0.0)
                        continue
                    if {s_pol, b_pol} == {"Kautoa", "League: Tethys"} and (gid in MILITARY_GOODS or gid == "ship-hulls"):
                        w_row.append(0.0)
                        continue
                    if ("Kautoa" in (s_pol, b_pol)) and (s_pol.startswith("League:") or b_pol.startswith("League:")) and gid in MILITARY_GOODS:
                        w_row.append(0.0)
                        continue
                    # 7. Colonizing powers on Throne do not sell military goods to Zeijani or Andaru raiders
                    if s_pol in THRONE_COLONIAL_POLS and b_pol in ("Zeijani", "Andaru") and gid in MILITARY_GOODS:
                        w_row.append(0.0)
                        continue
                    # 8. Bulk transport is impractical on the hazardous Yeti highland dirt road!
                    if "Yeti Kingdom" in (s_pol, b_pol) and tier == "bulk":
                        w_row.append(0.0)
                        continue
                    eff_km = fast_eff(s_sid, b_sid, tier)
                    if not np.isfinite(eff_km):
                        w_row.append(0.0)
                        continue
                    # Regional range caps on heavy staples, raw construction logs, bog peat & casked beer:
                    if gid == "food" and eff_km > 240.0:
                        w_row.append(0.0)
                        continue
                    if gid == "timber" and eff_km > 250.0:
                        w_row.append(0.0)
                        continue
                    if gid == "peat" and eff_km > 480.0:
                        w_row.append(0.0)
                        continue
                    if gid == "beer" and eff_km > 450.0:
                        w_row.append(0.0)
                        continue
                    if gid == "brick" and eff_km > 210.0:
                        w_row.append(0.0)
                        continue
                    # Bulk economic transport ceiling (~4,800 km by ship / ~2,200 km by river,
                    # but blocks uneconomic 1,000+ km overland pack-train hauls of coal/marble/scrap;
                    # dietary salt to salt-poor Xanadu carries up to 1,180 effective km).
                    if tier == "bulk":
                        max_bulk_eff = 1180.0 if gid == "salt" else 780.0
                        if eff_km > max_bulk_eff:
                            w_row.append(0.0)
                            continue
                    if gid == "mounts":
                        # Live riding/pack beasts require fodder & watering and suffer heavy sea-stallage mortality on long voyages:
                        _, pinfo_m = get_pair(s_sid, b_sid, tier)
                        sea_m = pinfo_m["sea_km"] if pinfo_m else 0.0
                        eff_m = eff_km + 0.60 * sea_m
                        if eff_m > 460.0 or sea_m > 420.0:
                            w_row.append(0.0)
                            continue
                        w = s_avail / ((eff_m + 45.0) ** 1.65)
                    elif gid == "spice-highland":
                        # Saffron is ultra-high-value per kg -> minimal distance decay so Vale & Oidong saffron travels all across Krator!
                        w = s_avail / ((eff_km + 65.0) ** (alpha * 0.55))
                    else:
                        w = s_avail / ((eff_km + 45.0) ** alpha)
                    # Bilateral war, hostilities, commercial rivalries & border-raider frictions:
                    # Shumari & Vothic Kingdom: centuries of war drove Shumar onto the plateau; escaped Nazari slaves flee Voth to join Shumar (LORE.md s6.23)
                    if {s_pol, b_pol} == {"Vothic Kingdom", "Shumari"}:
                        if gid in MILITARY_GOODS:
                            w_row.append(0.0)
                            continue
                        w *= 0.14
                    # Tiguantin is an Empire of Iziz tributary — strong tributary trade orientation toward Iziz!
                    if {s_pol, b_pol} == {"Tiguantin", "Empire of Iziz"}:
                        w *= 1.55
                    if war_pair:
                        # Iziz <-> Voth at war: trade only via smugglers (Port Mira / Nephtos / Marr) or neutral Dhelv
                        w *= 0.085
                    if br_iz_pair:
                        # Beast Riders & Iziz hostile (not quite full war, raids common)
                        w *= 0.12
                    if {s_pol, b_pol} == {"Beast Riders", "Kautoa"}:
                        # Beast Riders rely on Kautoa as their coastal factor & effective navy!
                        w *= 2.15
                    if ka_iz_pair:
                        # Kautoa's relations with Iziz are cool because Kautoa serves as Beast Riders' coastal presence
                        w *= 0.32
                    if {s_pol, b_pol} == {"Kautoa", "League: Tethys"}:
                        # Increasingly hostile as Nephtos was founded on an island Kautoa claims!
                        w *= 0.08
                    elif ("Kautoa" in (s_pol, b_pol)) and (s_pol.startswith("League:") or b_pol.startswith("League:")):
                        w *= 0.28
                    if {s_pol, b_pol} == {"Zeijani", "Andaru"}:
                        # Brother peoples on Throne — friendly with each other!
                        w *= 1.85
                    elif (s_pol in ("Zeijani", "Andaru") and b_pol in THRONE_COLONIAL_POLS) or (
                        b_pol in ("Zeijani", "Andaru") and s_pol in THRONE_COLONIAL_POLS
                    ):
                        # Zeijani & Andaru raid colonizing powers from time to time
                        w *= 0.48
                    if marr_sid in (s_sid, b_sid) and (
                        s_pol in ("Hookfleet", "League: Tethys", "Zeijani", "Andaru", "West Ring Islanders")
                        or b_pol in ("Hookfleet", "League: Tethys", "Zeijani", "Andaru", "West Ring Islanders")
                    ):
                        # Marr is friendly to smugglers despite official efforts to stamp it out -> preferred Izani entrepot!
                        w *= 1.80
                    if (s_pol == "Vothic Kingdom" and b_pol.startswith("League:")) or (
                        b_pol == "Vothic Kingdom" and s_pol.startswith("League:")
                    ):
                        # Voth and Hykkousoi League are rivals & discourage merchants from trading with each other
                        w *= 0.20
                    if (s_pol == "Iron Republic" and b_pol in ("Dilihan Province", "Free Clans")) or (
                        b_pol == "Iron Republic" and s_pol in ("Dilihan Province", "Free Clans")
                    ):
                        # Iron Republic and Dilihan / Ardent (Free Clans) are commercial & political rivals
                        w *= 0.20
                    if "Free Giants (Vrivolci)" in (s_pol, b_pol) and (
                        "Realm of Dalab" in (s_pol, b_pol) or "Vothic Kingdom" in (s_pol, b_pol)
                    ):
                        # Vrivolci raid Dalab and Voth
                        w *= 0.25
                    if "Frogmen" in (s_pol, b_pol):
                        if "Realm of Dalab" in (s_pol, b_pol):
                            # Peace treaty via Span — Dalab is Frogmen's primary peaceful trade partner!
                            w *= 1.35
                        elif any(
                            nb in (s_pol, b_pol)
                            for nb in ("Vothic Kingdom", "Yusar (Cybernetics)", "Iron Republic", "Shumari", "Scyvoi", "Free Giants (Vrivolci)")
                        ):
                            # Frogmen / SW Highlanders raid neighbors except Dalab
                            w *= 0.22
                    if {s_pol, b_pol} == {"Coyote Kingdom", "Nomad Country"}:
                        # Coyotemen and Eastern Nomads occasionally raid each other
                        w *= 0.45

                    # Once-a-year Annual Great Caravan (Nulab <-> Erehwon North Rift Bench):
                    # bulk is already blocked (inf); medium cargo faces heavy annual-convoy capacity friction!
                    _, pinfo_chk = get_pair(s_sid, b_sid, tier)
                    if pinfo_chk and any("Annual Great Caravan" in c for c in pinfo_chk["corridors"]):
                        w *= (0.14 if tier == "medium" else 0.55)
                    # Beast Riders rely on Kautoa (Kautoa/Valapo/Bipo) as their coastal port & navy when trading across water!
                    if "Beast Riders" in (s_pol, b_pol) and pinfo_chk and pinfo_chk["sea_km"] > 0:
                        if any(kp in pinfo_chk["ports"] or kp in pinfo_chk["gateways"] for kp in ("Kautoa", "Valapo", "Bipo")):
                            w *= 1.65
                        else:
                            w *= 0.20
                    # Yeti caravans cannot clear customs through Eternal State ports/cities (Lux, Fulcrum, Bastion, Palewharf, Farport)
                    if "Yeti Kingdom" in (s_pol, b_pol) and pinfo_chk:
                        if any(ep in pinfo_chk["ports"] or ep in pinfo_chk["gateways"] for ep in ("Lux", "Fulcrum", "Bastion", "Palewharf", "Farport")):
                            w = 0.0
                    # Rivalry transit discouragement:
                    # - Hykkousoi merchants avoid transiting Vothic ports to third parties
                    if (s_pol.startswith("League:") or b_pol.startswith("League:")) and ("Vothic Kingdom" not in (s_pol, b_pol)) and pinfo_chk:
                        if any(vp in pinfo_chk["ports"] for vp in ("Voth", "Shim", "Almua", "Zey'danin", "Torus")):
                            w *= 0.35
                    # - Iron Republic & Dilihan/Ardent rivals avoid transiting each other's hubs
                    if "Iron Republic" in (s_pol, b_pol) and pinfo_chk:
                        if any(dp in pinfo_chk["ports"] or dp in pinfo_chk["gateways"] for dp in ("Dilihan", "Port Visas", "Ardent")):
                            if b_pol not in ("Dilihan Province", "Free Clans") and s_pol not in ("Dilihan Province", "Free Clans"):
                                w *= 0.38
                    # Occasional tribal isolation friction for Painted Men canyon holds (TRADE-SCOPE s7.6: rare traders)
                    if "Painted Men" in (s_pol, b_pol):
                        w *= 0.45
                    w_row.append(w)
                buyer_weights.append((b_sid, b_need, w_row))

            # Normalize so neither seller surplus nor buyer deficit is exceeded (2-round IPF)
            F = np.zeros((len(sellers), len(buyers)), dtype=np.float64)
            for j, (_, b_need, w_row) in enumerate(buyer_weights):
                sw = sum(w_row)
                if sw > 0:
                    for i, w in enumerate(w_row):
                        F[i, j] = b_need * (w / sw)
            for _ in range(4):
                row_sums = F.sum(axis=1)
                for i, (_, s_avail) in enumerate(sellers):
                    if row_sums[i] > s_avail and row_sums[i] > 0:
                        F[i, :] *= s_avail / row_sums[i]
                col_sums = F.sum(axis=0)
                for j, (_, b_need) in enumerate(buyers):
                    if col_sums[j] > b_need and col_sums[j] > 0:
                        F[:, j] *= b_need / col_sums[j]

            war_prize_pool = 0.0
            for i, (s_sid, _) in enumerate(sellers):
                for j, (b_sid, _) in enumerate(buyers):
                    amt = float(F[i, j])
                    if amt <= 1e-4:
                        continue
                    eff_km, pinfo = get_pair(s_sid, b_sid, tier)
                    # Check Ring Sea pirate interception (Noa's Regret) + Iziz-Voth wartime naval commerce raiding!
                    prate = pinfo["pirate_rate"]
                    wrate = pinfo.get("naval_war_rate", 0.0)
                    tot_rate = min(0.18, prate + wrate)
                    taken = amt * tot_rate
                    delivered = amt - taken
                    if taken > 1e-4:
                        # Freebooter share + half of wartime privateer captures fenced via Noa's Regret;
                        # remaining wartime privateer prizes auctioned via neutral Kautoa / Dhelv (Zeijani)!
                        taken_pir = amt * prate + 0.50 * (amt * wrate)
                        taken_mid = max(0.0, taken - taken_pir)
                        captured_pool += taken_pir
                        war_prize_pool += taken_mid
                        pirate_ledger[gid]["captured"] += taken
                        vic_pol = setts[b_sid]["polity"] if setts[s_sid]["polity"] in FLEETLESS_VICTIM_POLS else setts[s_sid]["polity"]
                        pirate_ledger[gid]["victims"][vic_pol] += taken
                    raw_flows.append((s_sid, b_sid, delivered, eff_km, pinfo, False))

            # Pass 2a: Port Mira (pirate & smuggler haven) + Ring Sea Pirates (Noa's Regret, Shanty, Boiling Bay)
            # fence captured maritime & privateer prizes! Nephtos is strictly excluded (smuggling, NOT piracy haven!).
            if captured_pool > 1e-4:
                tot_pir_fenced = 0.0
                for pir_sid, pir_share in pirate_cove_shares:
                    cove_pool = captured_pool * pir_share * 0.92  # 8% consumed/lost at pirate haven
                    if cove_pool <= 1e-4:
                        continue
                    pir_pol = setts[pir_sid]["polity"]
                    fence_cands = []
                    for b_sid, b_need in buyers:
                        b_pol = setts[b_sid]["polity"]
                        if b_sid == nephtos_sid or b_pol == pir_pol:
                            continue  # Nephtos rejects pirated prizes!
                        if gid == "books" and b_pol == "Vothic Kingdom":
                            continue
                        eff_km, pinfo = get_pair(pir_sid, b_sid, tier)
                        if np.isfinite(eff_km) and pinfo is not None and pinfo["sea_km"] > 0 and eff_km < 430.0:
                            wf = b_need / ((eff_km + 35.0) ** 1.2)
                            if b_sid == marr_sid:
                                wf *= 2.6  # Marr is smugglers' & contraband buyers' preferred Izani entrepot!
                            fence_cands.append((b_sid, wf, eff_km, pinfo))
                    sw_f = sum(x[1] for x in fence_cands)
                    if sw_f > 0:
                        if pir_pol == "Ring Sea Pirates":
                            tot_pir_fenced += cove_pool
                        else:
                            pol_surplus_map[pir_pol] = pol_surplus_map.get(pir_pol, 0.0) + cove_pool
                        pirate_ledger[gid]["fenced"] += cove_pool
                        for b_sid, w_f, eff_km, pinfo in fence_cands:
                            share_f = cove_pool * (w_f / sw_f)
                            if share_f > 1e-4:
                                pirate_ledger[gid]["buyers"][setts[b_sid]["polity"]] += share_f
                                if pir_sid == port_mira_sid:
                                    wt_prize_eq = share_f if g["unit"] == "t" else share_f * 0.05
                                    entrepot_totals["Port Mira"]["sea_tons"] += wt_prize_eq
                                    entrepot_totals["Port Mira"]["flows"] += 1
                                    entrepot_totals["Port Mira"]["goods"][gid] += share_f
                                raw_flows.append((pir_sid, b_sid, share_f, eff_km, pinfo, True))
                if tot_pir_fenced > 0:
                    pol_surplus_map["Ring Sea Pirates"] = tot_pir_fenced

            # Pass 2b: Wartime privateer prizes auctioned via Port Mira (Hookfleet)
            # (Nephtos excluded — smuggling, NOT piracy haven; Dhelv excluded — inland cavern & fleetless Zeijani!)
            if war_prize_pool > 1e-4:
                for mid_sid, mid_share in ((port_mira_sid, 1.0),):
                    sub_pool = war_prize_pool * mid_share * 0.92
                    if sub_pool <= 1e-4:
                        continue
                    mid_pol = setts[mid_sid]["polity"]
                    mid_cands = []
                    for b_sid, b_need in buyers:
                        b_pol = setts[b_sid]["polity"]
                        if b_sid == nephtos_sid or b_pol == mid_pol or (gid == "books" and b_pol == "Vothic Kingdom"):
                            continue
                        eff_km, pinfo = get_pair(mid_sid, b_sid, tier)
                        if np.isfinite(eff_km) and pinfo is not None and pinfo["sea_km"] > 0 and eff_km < 460.0:
                            wm = b_need / ((eff_km + 35.0) ** 1.2)
                            if b_sid == marr_sid:
                                wm *= 2.6  # Marr preferred smuggler entrepot!
                            mid_cands.append((b_sid, wm, eff_km, pinfo))
                    sw_m = sum(x[1] for x in mid_cands)
                    if sw_m > 0:
                        pirate_ledger[gid]["fenced"] += sub_pool
                        pol_surplus_map[mid_pol] = pol_surplus_map.get(mid_pol, 0.0) + sub_pool
                        for b_sid, w_m, eff_km, pinfo in mid_cands:
                            share_m = sub_pool * (w_m / sw_m)
                            if share_m > 1e-4:
                                pinfo_tag = dict(pinfo)
                                pinfo_tag["raider_tags"] = ["WARTIME PRIZE INTERMEDIARY"] + list(pinfo.get("raider_tags", []))
                                if setts[mid_sid]["name"] not in pinfo_tag["ports"]:
                                    pinfo_tag["ports"] = [setts[mid_sid]["name"]] + list(pinfo_tag["ports"])
                                wt_prize_eq = share_m if g["unit"] == "t" else share_m * 0.05
                                entrepot_totals[setts[mid_sid]["name"]]["sea_tons"] += wt_prize_eq
                                entrepot_totals[setts[mid_sid]["name"]]["flows"] += 1
                                entrepot_totals[setts[mid_sid]["name"]]["goods"][gid] += share_m
                                pirate_ledger[gid]["buyers"][setts[b_sid]["polity"]] += share_m
                                raw_flows.append((mid_sid, b_sid, share_m, eff_km, pinfo_tag, False))

        # Tally polity balances, mode shares & entrepot hub volumes
        raw_flows.sort(key=lambda x: x[2], reverse=True)
        tot_flow = sum(x[2] for x in raw_flows)
        mode_km_wt = {"sea": 0.0, "river": 0.0, "highway": 0.0, "caravan": 0.0, "corridor": 0.0}

        for s_sid, b_sid, amt, eff_km, pinfo, is_pirate in raw_flows:
            s_pol, b_pol = setts[s_sid]["polity"], setts[b_sid]["polity"]
            polity_exports[s_pol][gid] += amt
            polity_imports[b_pol][gid] += amt
            sett_exports[gid][s_sid] += amt
            sett_imports[gid][b_sid] += amt

            rkm = max(1.0, pinfo["real_km"])
            mode_km_wt["sea"] += amt * (pinfo["sea_km"] / rkm)
            mode_km_wt["river"] += amt * (pinfo["river_km"] / rkm)
            mode_km_wt["highway"] += amt * (pinfo["highway_km"] / rkm)
            mode_km_wt["caravan"] += amt * (pinfo["caravan_km"] / rkm)
            mode_km_wt["corridor"] += amt * (pinfo["corridor_km"] / rkm)

            # Credit transit ports & land gateways (excluding origin/destination settlement itself)
            wt_ton_eq = amt if g["unit"] == "t" else amt * 0.05
            for p_nm in pinfo["ports"]:
                if p_nm not in (setts[s_sid]["name"], setts[b_sid]["name"]):
                    entrepot_totals[p_nm]["sea_tons"] += wt_ton_eq
                    entrepot_totals[p_nm]["flows"] += 1
                    entrepot_totals[p_nm]["goods"][gid] += amt
            for g_nm in pinfo["gateways"]:
                if g_nm not in (setts[s_sid]["name"], setts[b_sid]["name"]) and g_nm not in pinfo["ports"]:
                    entrepot_totals[g_nm]["land_tons"] += wt_ton_eq
                    entrepot_totals[g_nm]["flows"] += 1
                    entrepot_totals[g_nm]["goods"][gid] += amt

        # Save top 8 flows of each good + key Annual Great Caravan & Iziz-Port Visas corridors + pirate lanes for map visualization
        for s_sid, b_sid, amt, eff_km, pinfo, is_pirate in raw_flows[:8]:
            if tot_flow > 0 and amt / tot_flow >= 0.03:
                rendered_corridors.append({
                    "good": gid, "tier": tier, "share": amt / tot_flow,
                    "is_pirate": is_pirate, "poly": pinfo["full_poly"], "modes": pinfo["seg_modes"],
                })
        special_featured = [
            x for x in raw_flows
            if not x[5] and (
                any("Annual Great Caravan" in c or "Iziz-Guarded Visas Caravan" in c for c in x[4]["corridors"])
                or "Port Visas" in x[4]["ports"]
            )
        ]
        for s_sid, b_sid, amt, eff_km, pinfo, is_pirate in special_featured[:2]:
            if tot_flow > 0 and amt / tot_flow >= 0.005:
                rendered_corridors.append({
                    "good": gid, "tier": tier, "share": max(0.045, amt / tot_flow * 2.0),
                    "is_pirate": False, "poly": pinfo["full_poly"], "modes": pinfo["seg_modes"],
                })
        pirate_flows = [x for x in raw_flows if x[5]]
        for s_sid, b_sid, amt, eff_km, pinfo, is_pirate in pirate_flows[:2]:
            if tot_flow > 0 and amt / tot_flow >= 0.004:
                rendered_corridors.append({
                    "good": gid, "tier": tier, "share": max(0.04, amt / tot_flow * 2.5),
                    "is_pirate": True, "poly": pinfo["full_poly"], "modes": pinfo["seg_modes"],
                })

        # Format producer & importer lists (polity-level AND top settlement-level)
        prod_pols = sorted(pol_surplus_map.items(), key=lambda kv: kv[1], reverse=True)
        imp_pols = sorted(pol_deficit_map.items(), key=lambda kv: kv[1], reverse=True)
        sum_surp = sum(v for _, v in prod_pols) or 1.0
        sum_def = sum(v for _, v in imp_pols) or 1.0

        denom_m = sum(mode_km_wt.values()) or 1.0
        mode_pct = {k: round(100.0 * v / denom_m, 1) for k, v in mode_km_wt.items()}

        war_smug_featured = [
            x for x in raw_flows
            if not x[5] and any("WARTIME SMUGGLERS / INTERMEDIARY" in t or "WARTIME PRIZE INTERMEDIARY" in t for t in x[4].get("raider_tags", []))
        ]

        selected_for_table = list(raw_flows[:14])
        if special_featured and not any(
            any("Annual Great Caravan" in c or "Iziz-Guarded Visas Caravan" in c for c in x[4]["corridors"])
            for x in selected_for_table[:6]
        ):
            if tot_flow > 0 and special_featured[0][2] / tot_flow >= 0.008:
                selected_for_table = list(raw_flows[:5]) + [special_featured[0]] + [x for x in raw_flows[5:13] if x is not special_featured[0]]
        if war_smug_featured and not any(
            any("WARTIME SMUGGLERS / INTERMEDIARY" in t or "WARTIME PRIZE INTERMEDIARY" in t for t in x[4].get("raider_tags", []))
            for x in selected_for_table[:6]
        ):
            if tot_flow > 0 and war_smug_featured[0][2] / tot_flow >= 0.0025:
                selected_for_table = list(selected_for_table[:5]) + [war_smug_featured[0]] + [x for x in selected_for_table[5:13] if x is not war_smug_featured[0]]
        if pirate_flows and not any(x[5] for x in selected_for_table[:8]):
            selected_for_table = list(selected_for_table[:6]) + [pirate_flows[0]] + [x for x in selected_for_table[6:13] if x is not pirate_flows[0]]

        routes_out = []
        for s_sid, b_sid, amt, eff_km, pinfo, is_pirate in selected_for_table:
            via_parts = []
            if pinfo["ports"]:
                via_parts.append("ports: " + " -> ".join(pinfo["ports"][:3]))
            if pinfo["corridors"]:
                if any("Annual Great Caravan" in c for c in pinfo["corridors"]):
                    via_parts.append("Annual Great Caravan (North Rift Bench)")
                elif any("Iziz-Guarded Visas Caravan" in c for c in pinfo["corridors"]):
                    via_parts.append("Iziz-Guarded Visas Caravan (Dilihan-Port Visas)")
                else:
                    via_parts.append(" + ".join(pinfo["corridors"][:2]))
            elif pinfo["gateways"]:
                mids = [x for x in pinfo["gateways"] if x not in (setts[s_sid]["name"], setts[b_sid]["name"])]
                if mids:
                    via_parts.append("via " + " -> ".join(mids[:4]))
            for rtag in pinfo.get("raider_tags", [])[:2]:
                if rtag not in "; ".join(via_parts):
                    via_parts.append(rtag)
            if is_pirate:
                via_parts.insert(0, "PIRATE PRIZE FENCE")

            dom_mode = "ship" if pinfo["sea_km"] > 0.35 * pinfo["real_km"] else (
                "barge/canal" if pinfo["river_km"] > 0.30 * pinfo["real_km"] else (
                    "train/pass" if pinfo["corridor_km"] > 0.30 * pinfo["real_km"] else (
                        "highway" if pinfo["highway_km"] > 0.35 * pinfo["real_km"] else "caravan"
                    )
                )
            )
            routes_out.append({
                "from_id": s_sid,
                "from": setts[s_sid]["name"],
                "from_polity": setts[s_sid]["polity"],
                "from_pos": [round(setts[s_sid]["px"], 1), round(setts[s_sid]["py"], 1)],
                "to_id": b_sid,
                "to": setts[b_sid]["name"],
                "to_polity": setts[b_sid]["polity"],
                "to_pos": [round(setts[b_sid]["px"], 1), round(setts[b_sid]["py"], 1)],
                "amount": round(amt, 3),
                "km": pinfo["real_km"],
                "effective_km": round(eff_km, 1),
                "mode": dom_mode,
                "sea_km": pinfo["sea_km"],
                "river_km": pinfo["river_km"],
                "via": "; ".join(via_parts) if via_parts else "direct trail",
                "pirate_fenced": is_pirate,
                "poly": pinfo["poly_51"],
                "poly_modes": pinfo["poly_modes"],
            })

        top_prod_setts = sorted(sett_exports[gid].items(), key=lambda kv: kv[1], reverse=True)
        top_imp_setts = sorted(sett_imports[gid].items(), key=lambda kv: kv[1], reverse=True)

        per_good[gid] = {
            "id": gid,
            "label": g["label"],
            "class": g["class"],
            "tier": tier,
            "unit": g["unit"],
            "note": g["note"],
            "total_traded": round(tot_flow, 2),
            "pirate_captured": round(pirate_ledger[gid]["captured"], 3),
            "mode_pct": mode_pct,
            "producers": [
                {"polity": p, "surplus": round(v, 2), "share_pct": round(100.0 * v / sum_surp, 1),
                 "exported": round(polity_exports[p].get(gid, 0.0), 2)}
                for p, v in prod_pols[:10]
            ],
            "importers": [
                {"polity": p, "deficit": round(v, 2), "share_pct": round(100.0 * v / sum_def, 1),
                 "imported": round(polity_imports[p].get(gid, 0.0), 2)}
                for p, v in imp_pols[:10]
            ],
            "producer_settlements": [
                {"id": sid_p, "name": setts[sid_p]["name"], "polity": setts[sid_p]["polity"],
                 "pos": [round(setts[sid_p]["px"], 1), round(setts[sid_p]["py"], 1)], "exported": round(v_p, 2)}
                for sid_p, v_p in top_prod_setts[:12] if v_p > 1e-3
            ],
            "importer_settlements": [
                {"id": sid_i, "name": setts[sid_i]["name"], "polity": setts[sid_i]["polity"],
                 "pos": [round(setts[sid_i]["px"], 1), round(setts[sid_i]["py"], 1)], "imported": round(v_i, 2)}
                for sid_i, v_i in top_imp_setts[:12] if v_i > 1e-3
            ],
            "routes": routes_out,
        }

    # Assemble step-by-step caravan trade ledger along The Catch & The Twins (Parabola <-> Strongbow)
    CATCH_TWINS_CHAIN = [
        ("Parabola", "Bowl Solar-Furnace Arcology & Izani Customs Caravanserai"),
        ("Bab al-Hawa (Godsgate)", "North Catch Gate & Wind-Gap Caravanserai"),
        ("Kolli Oasis", "Mid-North Catch Artesian Date & Camel Oasis"),
        ("Arfwai Oasis", "South-Central Catch Oasis, Nitre Pan & Dasri Trail Junction"),
        ("Catch Salt Works", "Hyper-Arid Catch Playa Salt & Saltpeter Works"),
        ("Stair", "Sealed Catch Tunnel-Mouth Oasis & Relic/Cell Salvage Station"),
        ("The Twins", "4,448 m Geothermal Steam-Vent Pass Fort into Xanadu"),
        ("White Gills Hermitage", "Charged-Collar Lag Solt (Lung-Salt) Breath-Pass Hermitage"),
        ("Strongbow", "Eastern Vale of Xanadu Scarp Switchback & Royal Opal Gate"),
    ]
    name_to_sid = {s["name"]: sid for sid, s in setts.items()}
    catch_twins_stops = []
    for st_nm, st_role in CATCH_TWINS_CHAIN:
        sid_c = name_to_sid.get(st_nm)
        if not sid_c:
            continue
        sc = setts[sid_c]
        ed = entrepot_totals.get(st_nm, {"sea_tons": 0.0, "land_tons": 0.0, "flows": 0, "goods": {}})
        loc_exp = sorted(
            [(gid_x, sett_exports[gid_x].get(sid_c, 0.0)) for gid_x in GOOD_BY_ID if sett_exports[gid_x].get(sid_c, 0.0) > 0.01],
            key=lambda kv: -kv[1],
        )
        loc_imp = sorted(
            [(gid_x, sett_imports[gid_x].get(sid_c, 0.0)) for gid_x in GOOD_BY_ID if sett_imports[gid_x].get(sid_c, 0.0) > 0.01],
            key=lambda kv: -kv[1],
        )
        tr_g = sorted(ed["goods"].items(), key=lambda kv: -kv[1])[:6]
        ey = max(0, min(world["OH"] - 1, int(round(sc["py"]))))
        ex = max(0, min(world["OW"] - 1, int(round(sc["px"]))))
        catch_twins_stops.append({
            "stop": st_nm,
            "polity": sc["polity"],
            "type": sc["type"],
            "pos": [round(sc["px"], 1), round(sc["py"], 1)],
            "elev_m": round(float(world["E2"][ey, ex])),
            "population": sc["population"],
            "role": st_role,
            "local_exports": [f"{gx} ({round(vx, 2)} {GOOD_BY_ID[gx]['unit']})" for gx, vx in loc_exp[:5]],
            "local_imports": [f"{gx} ({round(vx, 2)} {GOOD_BY_ID[gx]['unit']})" for gx, vx in loc_imp[:5]],
            "transit_tons_eq": round(ed["land_tons"] + ed["sea_tons"], 1),
            "transit_flows": ed["flows"],
            "top_transit_goods": [f"{gx} ({round(vx, 1)} {GOOD_BY_ID[gx]['unit']})" for gx, vx in tr_g],
        })

    return {
        "per_good": per_good,
        "polity_exports": polity_exports,
        "polity_imports": polity_imports,
        "sett_exports": sett_exports,
        "sett_imports": sett_imports,
        "entrepot_totals": entrepot_totals,
        "pirate_ledger": pirate_ledger,
        "rendered_corridors": rendered_corridors,
        "catch_twins_stops": catch_twins_stops,
    }


# ---------------------------------------------------------------------------
# 8. Render High-Resolution Multimodal Trade Route Map (1821 x 1723)
# ---------------------------------------------------------------------------
def render_trade_map(world, setts, graph, results, out_jpg):
    OW, OH = world["OW"], world["OH"]
    GW, GH = world["GW"], world["GH"]
    E2, W2 = world["E2"], world["W2"]

    # Shaded hypsometric relief base
    norm = np.clip((E2 - (-2000.0)) / 11000.0, 0.0, 1.0)
    gy, gx = np.gradient(E2)
    shade = np.clip(0.72 - 0.00035 * (gx + gy), 0.38, 1.12)

    rgb = np.zeros((OH, OW, 3), dtype=np.float32)
    # Warm parchment/stone hypsometry on land, deep slate-blue on water
    rgb[..., 0] = (58 + 135 * (norm ** 0.7)) * shade
    rgb[..., 1] = (66 + 122 * (norm ** 0.75)) * shade
    rgb[..., 2] = (58 + 102 * (norm ** 0.85)) * shade

    rgb[W2, 0] = 24
    rgb[W2, 1] = 48
    rgb[W2, 2] = 74

    # Raider territory hazard shading:
    # 1. Crimson/magenta cross-hatch on autarkic no-trade raider zones (Lizardmen & Screamers)
    # 2. Subtle burnt-ochre stipple on neighbor-raiding territories (Yeti, Painted Men, Fellgangs, Scyvoi)
    yy_2, xx_2 = np.mgrid[0:OH, 0:OW]
    gi = np.clip(np.round(xx_2 * (GW - 1) / (OW - 1)).astype(int), 0, GW - 1)
    gj = np.clip(np.round(yy_2 * (GH - 1) / (OH - 1)).astype(int), 0, GH - 1)
    liz_2 = graph["mask_lizard_poly"][gj, gi] & (~W2)
    hatch = liz_2 & (((xx_2 + yy_2) % 9) <= 2)
    rgb[liz_2, 0] = rgb[liz_2, 0] * 0.78 + 48.0
    rgb[liz_2, 1] = rgb[liz_2, 1] * 0.72 + 12.0
    rgb[liz_2, 2] = rgb[liz_2, 2] * 0.72 + 12.0
    rgb[hatch] = [195.0, 48.0, 48.0]

    scr_2 = graph["mask_screamer_poly"][gj, gi] & (~W2)
    hatch_sc = scr_2 & (((xx_2 - yy_2) % 9) <= 2)
    rgb[scr_2, 0] = rgb[scr_2, 0] * 0.76 + 46.0
    rgb[scr_2, 1] = rgb[scr_2, 1] * 0.70 + 10.0
    rgb[scr_2, 2] = rgb[scr_2, 2] * 0.76 + 38.0
    rgb[hatch_sc] = [205.0, 56.0, 138.0]

    raid_nb_2 = (
        graph["mask_yeti_poly"][gj, gi]
        | graph["mask_painted_poly"][gj, gi]
        | graph["mask_fellgang_poly"][gj, gi]
        | graph["mask_scyvoi_poly"][gj, gi]
        | graph["mask_beastrider_core"][gj, gi]
        | graph["mask_vrivolci_poly"][gj, gi]
        | graph["mask_swhigh_poly"][gj, gi]
        | graph["mask_nomad_desert_bandits"][gj, gi]
    ) & (~W2) & (~liz_2) & (~scr_2)
    stipple_nb = raid_nb_2 & (((xx_2 + 2 * yy_2) % 11) == 0)
    rgb[raid_nb_2, 0] = rgb[raid_nb_2, 0] * 0.88 + 26.0
    rgb[raid_nb_2, 1] = rgb[raid_nb_2, 1] * 0.85 + 14.0
    rgb[raid_nb_2, 2] = rgb[raid_nb_2, 2] * 0.84 + 6.0
    rgb[stipple_nb] = [212.0, 118.0, 52.0]

    base_img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), mode="RGB").convert("RGBA")
    overlay = Image.new("RGBA", (OW, OH), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Subtle 5.1 road infrastructure underlay from claude/ancient-network-9cc3e7 (net51-gemini.json)
    if world.get("net51"):
        for r_net in world["net51"].get("routes", []):
            if r_net.get("id") == "ext.southwest":
                continue
            pts_n = r_net.get("px", [])
            up_n = r_net.get("up", [])
            for kn in range(len(pts_n) - 1):
                st_n = up_n[min(kn, len(up_n) - 1)] if up_n else "lapsed"
                if st_n == "decayed":
                    rcol = (145, 130, 112, 62)
                elif st_n in ("kept", "partly"):
                    rcol = (212, 188, 132, 108)
                else:
                    rcol = (176, 156, 122, 82)
                draw.line([tuple(pts_n[kn]), tuple(pts_n[kn + 1])], fill=rcol, width=1)

    # Supplemental polity highways & stateless dirt roads generated in build_supplemental_roads
    for sr in graph.get("supp_roads", []):
        pts_s = sr.get("px", [])
        if sr.get("class") == "polity_highway":
            scol, sw = (232, 196, 98, 132), 2
        else:
            scol, sw = (184, 146, 102, 112), 1
        for ks in range(len(pts_s) - 1):
            draw.line([tuple(pts_s[ks]), tuple(pts_s[ks + 1])], fill=scol, width=sw)

    MODE_COLORS = {
        "sea": (64, 218, 255, 165),      # bright cyan shipping lanes
        "river": (52, 238, 178, 175),    # emerald/teal barge rivers & canals
        "highway": (255, 214, 72, 180),  # gold kept Ancient highways
        "corridor": (255, 96, 150, 195), # magenta/crimson tunnels, lifts, armed Visas convoys & Great Caravan
        "caravan": (255, 152, 66, 155),  # warm amber caravan trails
    }

    for rc in results["rendered_corridors"]:
        pts = rc["poly"]
        modes = rc["modes"]
        w_px = max(2, min(6, int(2.0 + 7.5 * rc["share"])))
        for k in range(min(len(pts) - 1, len(modes))):
            col = (255, 65, 65, 200) if rc["is_pirate"] else MODE_COLORS.get(modes[k], (255, 160, 80, 150))
            draw.line([tuple(pts[k]), tuple(pts[k + 1])], fill=col, width=w_px)

    comp = Image.alpha_composite(base_img, overlay).convert("RGB")
    d2 = ImageDraw.Draw(comp)
    try:
        font = ImageFont.truetype("arial.ttf", 15)
        font_b = ImageFont.truetype("arialbd.ttf", 17)
        font_t = ImageFont.truetype("arialbd.ttf", 24)
    except Exception:
        font = font_b = font_t = ImageFont.load_default()

    MAJOR_LABELS = {
        "Farport", "Palewharf", "Fulcrum", "Mirabilis", "Sheritu", "Carcosa", "Qoold Lheek", "Leng", "Jimjam", "Boatmurder", "Silkhead",
        "Dilihan", "Port Visas", "Ardent", "Roketstad", "Ys", "Ybera", "Tethis", "Trigon", "Nephtos", "Hook", "Port Mira",
        "Ṣunu-Ašru", "Dhelv", "Port Tobin", "Port Goto", "Shell", "Almua", "Zey'danin", "Voth", "Shim", "Driyan", "Dayshun", "Amaro",
        "Dalab", "Dapor", "Span", "Ledge", "Nulab", "Wildcat", "Tallwalls", "Hall of Heroes",
        "Spirladunon", "Iziz", "Marr", "Talia", "Guari", "Verge", "Arcbeam", "Parabola", "Bab al-Hawa (Godsgate)",
        "Kolli Oasis", "Arfwai Oasis", "Jabal", "Locus", "Mungo", "Reed",
        "Sfenops", "Liikofi", "Yuni", "Ostrukh-on-Water", "Spindle Fan", "The Sill (Sam-Lok)",
        "Spider Lake Weirs", "The Gate", "Stair", "The Twins", "Strongbow", "Erehwon", "Kirstabal",
        "Opal Valley Mines", "Longsong", "Kautoa", "Noa's Regret", "Boiling Bay", "Shanty", "Taikoro", "Kautono",
    }

    # Draw Port Mira's 50-km (25 px @ 2 km/px) No-Shipjacking Truce Circle on the Ring Sea
    pm_s = next((s for s in setts.values() if s["name"] == "Port Mira"), None)
    if pm_s is not None:
        pmx, pmy = int(pm_s["px"]), int(pm_s["py"])
        rad_px = 25  # 50 km @ 2 km/px
        for deg in range(0, 360, 12):
            a0, a1 = math.radians(deg), math.radians(deg + 7)
            p0 = (pmx + rad_px * math.cos(a0), pmy + rad_px * math.sin(a0))
            p1 = (pmx + rad_px * math.cos(a1), pmy + rad_px * math.sin(a1))
            d2.line([p0, p1], fill=(120, 245, 225), width=2)

    for sid, s in setts.items():
        x, y = int(s["px"]), int(s["py"])
        nm = s["name"]
        if s.get("abstract_region"):
            d2.rectangle((x - 7, y - 7, x + 7, y + 7), fill=(88, 212, 255), outline=(255, 232, 140), width=2)
        elif s["polity"] == "Ring Sea Pirates":
            d2.ellipse((x - 5, y - 5, x + 5, y + 5), fill=(240, 50, 50), outline=(255, 255, 255), width=2)
        elif nm in MAJOR_LABELS:
            col = (80, 225, 255) if (s.get("water_cell") is not None or s.get("river_cell") is not None) else (255, 220, 110)
            d2.ellipse((x - 4, y - 4, x + 4, y + 4), fill=col, outline=(20, 20, 20), width=1)
        else:
            d2.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(215, 215, 215))

    for sid, s in setts.items():
        nm = s["name"]
        if s.get("abstract_region"):
            if s["polity"] == "The Crook":
                x, y = int(s["px"]) - 92, int(s["py"]) + 12
            else:
                x, y = int(s["px"]) + 11, int(s["py"]) - 9
            lbl_abs = f"{s['polity']} (Sea Trade -> Farport)"
            d2.text((x + 1, y + 1), lbl_abs, fill=(10, 12, 16), font=font_b)
            d2.text((x, y), lbl_abs, fill=(145, 235, 255), font=font_b)
            continue
        if nm in MAJOR_LABELS:
            x, y = int(s["px"]) + 6, int(s["py"]) - 8
            if nm == "Port Visas":
                x, y = int(s["px"]) + 7, int(s["py"]) - 14
            elif nm == "Ys":
                x, y = int(s["px"]) + 6, int(s["py"]) + 3
            elif nm == "Port Mira":
                x, y = int(s["px"]) - 72, int(s["py"]) - 14
            elif nm == "Dalab":
                x, y = int(s["px"]) - 44, int(s["py"]) - 8
            elif nm == "Dapor":
                x, y = int(s["px"]) + 6, int(s["py"]) - 6
            elif nm == "Guari":
                x, y = int(s["px"]) + 6, int(s["py"]) - 12
            elif nm == "Kirstabal":
                x, y = int(s["px"]) - 68, int(s["py"]) + 4
            elif nm == "Hall of Heroes":
                x, y = int(s["px"]) + 6, int(s["py"]) - 10
            elif nm == "The Sill (Sam-Lok)":
                x, y = int(s["px"]) - 142, int(s["py"]) - 8
            d2.text((x + 1, y + 1), nm, fill=(10, 12, 16), font=font)
            tcol = (255, 130, 130) if s["polity"] == "Ring Sea Pirates" else (248, 246, 236)
            d2.text((x, y), nm, fill=tcol, font=font)

    # Label Autarkic Hostile Zones, Raider Frontier Zones & North-Rift Great Caravan
    def draw_tag(tx, ty, txt, col):
        d2.text((tx + 1, ty + 1), txt, fill=(10, 12, 16), font=font_b)
        d2.text((tx, ty), txt, fill=col, font=font_b)

    draw_tag(605, 1545, "LIZARDMAN RIFT (No Trade — Raids Xanadu & S. Dalab)", (255, 138, 138))
    draw_tag(768, 602, "SCREAMER COUNTRY (Raiders — No Trade)", (255, 145, 210))
    draw_tag(818, 956, "IZIZ–VOTH NAVAL WAR (Mira 50-km Truce)", (255, 122, 122))
    draw_tag(1030, 775, "BEAST RIDERS (Inner Crater — Kautoa Navy)", (255, 188, 120))
    draw_tag(785, 366, "BOATMURDER HIGHWAYMEN", (255, 188, 120))
    draw_tag(548, 1378, "Annual Great Caravan (North Rift Bench)", (255, 175, 215))
    draw_tag(530, 488, "Qoold Lheek–Jimjam Yeti Dirt Road", (255, 208, 132))
    draw_tag(352, 468, "YETI RAIDERS (No Eternian Trade)", (255, 188, 120))
    draw_tag(942, 560, "PAINTED MEN RAIDERS", (255, 188, 120))
    draw_tag(572, 782, "SCYVOI RAIDERS", (255, 188, 120))
    draw_tag(470, 955, "FROGMEN RAIDERS (Dalab Treaty)", (255, 188, 120))
    draw_tag(578, 1222, "VRIVOLCI RAIDERS", (255, 188, 120))
    draw_tag(326, 1432, "FELLGANG RAIDERS", (255, 188, 120))
    draw_tag(1365, 650, "COYOTE–NOMAD RAIDS", (255, 188, 120))
    draw_tag(1155, 720, "DESERT NOMAD BANDITS (North Desert)", (255, 188, 120))
    draw_tag(1130, 1285, "DESERT NOMAD BANDITS (Bowl & Catch)", (255, 188, 120))

    # Legend box (bottom-left, below Hall of Heroes y=1474)
    lx, ly = 24, OH - 218
    d2.rectangle((lx, ly, lx + 572, OH - 18), fill=(18, 24, 34), outline=(120, 140, 165), width=2)
    d2.text((lx + 14, ly + 8), "KRATOR 5.1 MULTIMODAL TRADE NETWORK (gemini-trade)", fill=(255, 240, 190), font=font_b)
    legend_rows = [
        ((64, 212, 255), "Sea Shipping Lanes (Iziz–Voth Naval War on Ring Sea)"),
        ((52, 235, 178), "Directed Navigable Rivers, Lakes & Eternian Canals"),
        ((255, 210, 72), "Ancient & Polity Highways (Bridged River Crossings)"),
        ((184, 146, 102), "Stateless / Tribal Dirt Roads & Desert Oasis Tracks"),
        ((255, 148, 66), "Overland Caravan Trunks (Camels / Lizards / Ostriches)"),
        ((255, 92, 140), "Tunnels, Armed Iziz-Visas Convoy & N-Rift Great Caravan"),
        ((240, 60, 60), "Ring Sea Pirate Coves & Port Mira Smuggler Prize Lanes"),
        ((195, 48, 92), "Autarkic Raiders (No Trade): Lizardmen & Screamers"),
        ((212, 118, 52), "Raider & Bandit Zones (Beast Riders, Vrivolci, Frogmen, etc.)"),
    ]
    for idx_l, (c_rgb, lbl_txt) in enumerate(legend_rows):
        ry = ly + 33 + idx_l * 18
        d2.line([(lx + 16, ry + 8), (lx + 52, ry + 8)], fill=c_rgb, width=4)
        d2.text((lx + 64, ry), lbl_txt, fill=(230, 235, 242), font=font)

    comp.save(out_jpg, quality=90)
    print("Saved trade map:", out_jpg)


def write_trade_markdown(payload, out_md):
    lines = [
        "# State of Trade & Trade Goods on Krator (5.1 Multimodal Network — Rebaked Geology)",
        "",
        "Generated by [gemini_trade_model.py](file:///C:/Users/travi/Documents/krator-trade/tools/scale-model/gemini_trade_model.py) "
        "from [geology-gemini.json](file:///C:/Users/travi/Documents/krator-trade/kits/resources/data/geology-gemini.json) "
        "and the native 5.1 road network [net51-gemini.json](file:///C:/Users/travi/Documents/krator-trade/openworld/net51-gemini.json) (`claude/ancient-network-9cc3e7`) "
        "into [trade-gemini.json](file:///C:/Users/travi/Documents/krator-trade/openworld/trade-gemini.json) on branch `gemini-trade` (leaving all base files untouched).",
        "",
        "> [!IMPORTANT]",
        f"> **Model Summary**: **{payload['good_count']} trade goods** (including `ship-timber` & `ship-hulls`, Opal Valley `photonic-opals`, Tiguantin `cushion-wool` & separate `wormwick`, East Abyss `abyss-lac`, and exterior pelagic `frost-coral` & `ria-amber`) solved across "
        f"**{payload['polity_count']} polities, maritime poleis & abstract exterior regions** (`{payload['settlement_count']}` settlements & gateways) over a "
        "**four-regime three-layer directed 4 km Dijkstra multimodal graph** (`Layer 0` Overland + `Layer 1` Sea/Lake + `Layer 2` Directed Navigable Rivers & Eternian Canals) "
        f"backed by the rebaked 5.1 geology, `135` reconciled regions ([world-pins-gemini.json](file:///C:/Users/travi/Documents/krator-trade/openworld/world-pins-gemini.json)), "
        f"`claude/ancient-network-9cc3e7` ([net51-gemini.json](file:///C:/Users/travi/Documents/krator-trade/openworld/net51-gemini.json)), and `{payload.get('supplemental_road_count', 0)}` supplemental polity highways & stateless dirt roads ([roads-supplement-gemini.json](file:///C:/Users/travi/Documents/krator-trade/openworld/roads-supplement-gemini.json)).",
        "> - **120,000 Metropolitan Economic Scale (`Iziz` & `Fulcrum`) + Exterior Sea Gateways (`The Crook` & `Ria Valley`)**: `Iziz` and `Fulcrum` are modeled at their full **120,000** metropolitan economic demand & supply (rendered smaller in-game for playability). Abstract exterior regions **`The Crook`** (`frost-coral`) and **`Ria Valley`** (`ria-amber`) arrive exclusively by ship into **`Farport`** and draw **`gold`, `silver`, and Krator's unique regional specialties** back out through Farport.",
        "> - **Directed River & Lake Barges (`Jimjam -> Palewharf` Alabaster, `Shim` River Outlet), Surface `Arcbeam–Parabola` Highway, Intra-Xanadu Roads & `Catch/Twins` Stops**: `Layer 2` & calm `inland_lake` `Layer 1` model bulk river and lake barges (`Jimjam -> Palewharf` `alabaster` across Jimjam's Lake, `Shim` `Riv 0`, `Port Tobin` `Riv 12`, `Farport`, `Reed`, `Ostrukh-on-Water`, `Dapor`), **mid-quality Eternal State highways (`0.72x`)** linking `Palewharf`, `Bastion`, `Sheritu`, `Mirabilis`, `Veil`, `Tone`, `Lux`, and `Farport` to `Fulcrum`, pure **surface Ancient highway** between `Arcbeam` and `Parabola` (zero ancient tubes), **intra-Xanadu trade on surface roads** (zero ancient routes), explicit stop-by-stop trade along **`The Catch` & `The Twins`** (`Parabola -> Bab al-Hawa -> Kolli Oasis -> Arfwai Oasis -> Catch Salt Works -> Stair -> The Twins / White Gills -> Strongbow`), and the northern **`Qoold Lheek ↔ Leng ↔ Jimjam` dirt road** exiting exclusively down the eastern highway (zero Eternian transit, zero bulk log transport).",
        "> - **Shipbuilding & Naval Stores Chain + Gunpowder & Steel Triangle + Opal Valley Three Grades**: Shipbuilding splits crooked knees/spars (`ship-timber`) and caulking/rigging (`pitch-tar`, `cordage`, `cotton` canvas) from commissioned hulls (`ship-hulls`, built at `Nephtos` for the League, `Kautoa` for the `Beast Riders`, `Almua`/`Shim`, `Port Mira`, `Farport`, `Shell`). No military power is self-sufficient in gunpowder (`coal` + volcanic `sulfur` + arid playa / *Da-Holwey* guano `saltpeter`). `Opal Valley` exports both court `gems` (`black`/`fire` opals) and `photonic-opals` (`Yusar` cybernetics, `Roketstad` optics, `Yuni` Geomancers).",
        "> - **Glass Chain, East Abyss Rubber Scale-Tree, Fermented/Distilled Luxury Spirits, Vale Opium & Finished Crafts/Arms**: `silica-sand` + Catch/kelp `alkali` + `coal`/`peat` feed glasshouses (`glass` windows, bulbs & spirit bottles); East Abyss Carboniferous **`rubber scale-trees`** (`Sfenops`, `Liikofi`, `Locus`, `Mungo`, `Reed`) yield sulfur-vulcanized `rubber`; fermented & botanical chains convert grain -> `beer`/`whiskey` (`+ peat` -> Iron Republic `scotch`), rice/`salt-rice` -> `sake`, Eternian grapes -> `wine` (`+ sugar` -> `champagne`), cane -> `rum` (`+ isle-spice` -> Throne `ranjrum`), cultivated agave -> `tequila` vs wild Dasri agave -> `mezcal` (led by `Jabal`), inner-crater `tobacco` -> `cigars`, and Xanadu sky-poppy -> `opium`, alongside finished `clothes`, `furniture`, `firearms`, `armor`, and melee `weapons`.",
        "> - **Ring Sea Smuggling, 50-km `Port Mira` Truce Zone & Fleetless Peoples**: **`Port Mira`** (`Hookfleet`) is both a major **Ranj (`isle-spice`)** supplier (alongside **`Ybera`**, `West Ring Islanders` (`Taikoro` & `Kautono`), `Zey'danin`/`Temora`, and `Andaru`) and a **pirate + smuggler haven** accepting all ships under a strict **50-km no-piracy zone**. **`Nephtos`** (`League: Tethys`) is a **smuggling (never piracy) haven** whose contested island claim makes **`Kautoa`** hostile to `Tethys` (`0.08x`) and the `League` (`0.28x`). **`Marr`** remains friendly to smugglers as their preferred Izani entrepôt. **`Zeijani`**, **`Andaru`**, **`Tiguantin`**, and **`Beast Riders`** have **zero fleets** (`Dhelv` is strictly an inland Throne cavern — maritime traders must come to neighboring anchorages or overland trails to trade with them).",
        "",
        "## 1. Top Maritime Port & Overland Chokepoint Entrepôts",
        "",
        "| Rank | Hub / Chokepoint | Sea Break-of-Bulk (t-eq) | Land Transit (t-eq) | Active Flows | Top Transit Cargoes |",
        "|---:|:---|---:|---:|---:|:---|",
    ]
    for rk, e in enumerate(payload["entrepots"][:24], 1):
        lines.append(
            f"| {rk} | **{e['hub']}** | {e['sea_tons_eq']} | {e['land_tons_eq']} | {e['flow_count']} | {', '.join(e['top_transit_goods'][:4])} |"
        )

    if payload.get("catch_twins_stops"):
        lines += [
            "",
            "---",
            "",
            "## 1b. Caravan Stops Along `The Catch` & `The Twins` (`Parabola ↔ Strongbow`)",
            "",
            "| Stop (`N -> S`) | Polity | Coords (`px, py`) | Elev | Local Exports | Station Imports | Transit (`t-eq` / flows) | Top Transit Cargoes |",
            "|:---|:---|:---|---:|:---|:---|---:|:---|",
        ]
        for cs in payload["catch_twins_stops"]:
            lines.append(
                f"| **{cs['stop']}** | {cs['polity']} | `{cs['pos'][0]}, {cs['pos'][1]}` | {cs['elev_m']} m | "
                f"{', '.join(cs['local_exports']) or '—'} | {', '.join(cs['local_imports']) or '—'} | "
                f"`{cs['transit_tons_eq']}` ({cs['transit_flows']}) | {', '.join(cs['top_transit_goods'][:4]) or '—'} |"
            )

    lines += [
        "",
        "---",
        "",
        "## 2. Ring Sea Piracy (`Port Mira`, `Noa's Regret`, `Shanty`, `Boiling Bay`) & Wartime Prize Ledger",
        "",
        "| Good | Captured at Sea (Outside Port Mira 50-km Truce) | Fenced Onward (`Port Mira`, `Noa's Regret`, `Shanty`, `Boiling Bay`) | Primary Victim Fleets | Primary Prize Buyers (`Nephtos` Excluded; `Marr` Preferred) |",
        "|:---|---:|---:|:---|:---|",
    ]
    for p in payload["noas_regret_piracy"][:24]:
        lines.append(
            f"| **`{p['good']}`** ({p['unit']}) | {p['captured']} | {p['fenced']} | {', '.join(p['top_victims'])} | {', '.join(p['top_fence_buyers'])} |"
        )

    lines += [
        "",
        "---",
        "",
        "## 3. Trade Balances by Polity & Maritime Polis",
        "",
        "| Polity / Polis | Setts | Pop | Top Exports (Net Cross-Polity Outflow) | Top Imports (Cross-Polity Inflow) |",
        "|:---|---:|---:|:---|:---|",
    ]
    pol_sorted = sorted(payload["polities"].values(), key=lambda x: -x["population"])
    for pol in pol_sorted:
        if pol.get("trade_regime") == "internal_autarky_hostile":
            exp_str = "*(0 — internal Rift trade only; hostile to humans)*"
            imp_str = "*(0 — internal Rift trade only; raids Xanadu & S. Dalab)*"
        elif pol.get("trade_regime") == "raider_autarky_hostile":
            exp_str = "*(0 — Screamer raiders do not trade; raid for supplies & captives)*"
            imp_str = "*(0 — Screamer raiders do not trade; hazard to passing caravans)*"
        else:
            exp_str = ", ".join(f"`{x['good']}` ({x['amount']} {x['unit']})" for x in pol["top_exports"][:5]) or "*(minimal)*"
            imp_str = ", ".join(f"`{x['good']}` ({x['amount']} {x['unit']})" for x in pol["top_imports"][:5]) or "*(minimal)*"
        lines.append(f"| **{pol['polity']}** | {pol['settlement_count']} | {pol['population']:,} | {exp_str} | {imp_str} |")

    SECTIONS = [
        ("I. Metals, Compass Magnets, Bullion & Structural Salvage", ["iron", "copper", "tin", "bronze", "zinc", "nickel", "magnets", "rare-earth", "gold", "silver", "scrap"]),
        ("II. Fuels, Bog Peat, Gunpowder Minerals, Catch Alkali, Glass Chain & Stone", ["coal", "peat", "oil", "salt", "sulfur", "saltpeter", "potash", "alkali", "silica-sand", "glass", "marble", "alabaster", "brick", "machine-wax", "pitch-tar"]),
        ("III. Timber, Shipbuilding, East Abyss Rubber, Fibres, Tailored Clothes, Furniture & Staples", ["timber", "ship-timber", "ship-hulls", "cordage", "rubber", "cotton", "silk", "qiviut", "cushion-wool", "plaid", "dye-tropical", "dye-temperate", "clothes", "furniture", "mounts", "food"]),
        ("IV. Fermented Beverages, Distilled Spirits & High-Tier Luxury Bottlings", ["beer", "sake", "wine", "champagne", "rum", "ranjrum", "whiskey", "scotch", "tequila", "mezcal"]),
        ("V. Spices, Vale Cacao, Tobacco & Cigars, Dalab Hashish, Vale Opium, Resins & Botanicals", ["spice-tropical", "isle-spice", "spice-highland", "cacao", "coffee", "tea", "sugar", "tobacco", "cigars", "hashish", "opium", "incense", "abyss-lac", "wormwick", "medicine", "lung-salt", "reagent", "fungal"]),
        ("VI. Personal Arms, Ordnance, Gems, Opals, Kilnware, Paper, Books, High Tech & Exterior Luxuries", ["firearms", "armor", "weapons", "rockets", "arms", "pearls", "gems", "photonic-opals", "ivory", "goldwork", "fine-ceramics", "porcelain", "paper", "almanacs", "books", "lenses", "electrics", "energy-cells", "cybernetics", "genecraft", "scrapgoods", "relics", "oversea-luxuries", "frost-coral", "ria-amber"]),
    ]
    assert sum(len(gids) for _, gids in SECTIONS) == len(GOODS), f"SECTIONS count mismatch vs GOODS ({len(GOODS)})"

    lines += ["", "---", "", f"## 4. Complete Good-by-Good Atlas (All {payload['good_count']} Goods)", ""]
    for sec_title, gids in SECTIONS:
        lines += [f"### {sec_title}", ""]
        for gid in gids:
            gd = payload["per_good"][gid]
            mp = gd["mode_pct"]
            lines.append(f"#### `{gid}` — {gd['label'].title()} (`{gd['tier']}`, unit: `{gd['unit']}`)")
            lines.append(f"- **Role**: {gd['note']}")
            lines.append(
                f"- **Cross-Polity Volume**: **`{gd['total_traded']} {gd['unit']}/yr`** · **Pirate Capture**: `{gd['pirate_captured']} {gd['unit']}` · "
                f"**Mode Split**: Ship `{mp.get('sea', 0.0)}%` | River/Canal `{mp.get('river', mp.get('river_canal', 0.0))}%` | Highway `{mp.get('highway', 0.0)}%` | Caravan `{mp.get('caravan', 0.0)}%` | Tunnel/Pass `{mp.get('corridor', 0.0)}%`"
            )
            prod_s = ", ".join(f"**{p['polity']}** (`{p['exported']}` exp / `{p['surplus']}` surp, {p['share_pct']}%)" for p in gd["producers"][:6])
            imp_s = ", ".join(f"**{p['polity']}** (`{p['imported']}` imp / `{p['deficit']}` need, {p['share_pct']}%)" for p in gd["importers"][:6])
            lines.append(f"- **Producers (Exporters)**: {prod_s or '*(none)*'}")
            lines.append(f"- **Importers (Customers)**: {imp_s or '*(none)*'}")
            lines.append("")
            lines.append("| Flow (`Origin -> Destination`) | Origin Polity -> Buyer Polity | Volume | Dist (`eff km`) | Mode | Ports, Passes & Corridors Traversed |")
            lines.append("|:---|:---|---:|---:|:---|:---|")
            top_r = [r for r in gd["routes"] if not r["pirate_fenced"]][:5]
            pir_r = [r for r in gd["routes"] if r["pirate_fenced"]][:1]
            for r in top_r + pir_r:
                lines.append(
                    f"| **{r['from']} -> {r['to']}** | {r['from_polity']} -> {r['to_polity']} | "
                    f"`{r['amount']} {gd['unit']}` | {r['km']} km (`{r['effective_km']}`) | `{r['mode']}` | {r['via']} |"
                )
            lines.append("")

    with open(out_md, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("Saved Markdown:", out_md)


# ---------------------------------------------------------------------------
# 9. Write JSON & Repo Summary Doc (100% Additive on gemini-trade)
# ---------------------------------------------------------------------------
def main(argv=None):
    argv = argv if argv is not None else sys.argv[1:]
    mdata = argv[argv.index("--model-data") + 1] if "--model-data" in argv else None
    rpath = argv[argv.index("--regions") + 1] if "--regions" in argv else None
    gpath = argv[argv.index("--geology") + 1] if "--geology" in argv else None

    world = load_world(mdata, rpath, gpath)
    setts = build_settlements(world)
    populate_supply_demand(world, setts)
    graph = build_multimodal_graphs(world, setts)
    res = solve_trade(world, setts, graph)

    out_jpg = os.path.join(ROOT, "openworld", "trade-routes-gemini.jpg")
    render_trade_map(world, setts, graph, res, out_jpg)

    # Assemble polity summary
    pol_summary = {}
    pol_members = defaultdict(list)
    for sid, s in setts.items():
        pol_members[s["polity"]].append(s)

    for pol, members in sorted(pol_members.items()):
        exps = sorted(res["polity_exports"][pol].items(), key=lambda kv: kv[1], reverse=True)
        imps = sorted(res["polity_imports"][pol].items(), key=lambda kv: kv[1], reverse=True)
        entry = {
            "polity": pol,
            "settlement_count": len(members),
            "population": sum(m["population"] for m in members),
            "settlements": [m["name"] for m in sorted(members, key=lambda x: -x["population"])],
            "top_exports": [{"good": g, "amount": round(v, 2), "unit": GOOD_BY_ID[g]["unit"]} for g, v in exps[:10] if v > 0.01],
            "top_imports": [{"good": g, "amount": round(v, 2), "unit": GOOD_BY_ID[g]["unit"]} for g, v in imps[:10] if v > 0.01],
        }
        if pol == "Lizardmen":
            entry["trade_regime"] = "internal_autarky_hostile"
            entry["note"] = "Trades strictly internally among Sauropolis, Komodo, Gila, and Tuatara; hostile to humans — zero external trade, and raids Vale of Xanadu and southern Dalab/Fellgangs."
        elif pol == "Screamer Country":
            entry["trade_regime"] = "raider_autarky_hostile"
            entry["note"] = "Screamer raiders (Hexahedron) do not trade externally — raid passing caravans and neighboring marches for supplies and captives; zero external exports or imports."
        elif pol == "Yeti Kingdom":
            entry["trade_regime"] = "raider_fraught_eternia_embargo"
            entry["note"] = "Raids the Eternal State (zero direct bilateral trade or transit through Eternia, zero bulk log transport); exports compact/medium upland qiviut, lung-salt, birch-tar, silver, and plundered Eternian raid booty east along the northern Qoold Lheek–Leng–Jimjam dirt road and down the eastern highway."
        elif pol in ("Empire of Iziz", "Shell Province"):
            entry["trade_regime"] = "wartime_belligerent_iziz"
            entry["note"] = "Iziz modeled at 120,000 economic population; at war with Vothic Kingdom (mutual port closure, Ring Sea commerce raids outside Port Mira's 50-km truce zone, wartime smuggling via Port Mira & Nephtos landing preferentially at smuggler-friendly Marr); cool relations with Kautoa; hostile to Beast Riders."
        elif pol == "Vothic Kingdom":
            entry["trade_regime"] = "wartime_belligerent_voth"
            entry["note"] = "At war with Empire of Iziz & Shell Province; SW Bay maritime & Lake Shim river-barge trade routed through Shim (Riv 0, 5,744 m³/s) rather than inland Sethas; commercial rival of Hykkousoi League."
        elif pol == "Eternal State":
            entry["trade_regime"] = "metropolitan_monopoly_state"
            entry["note"] = "Fulcrum modeled at 120,000 economic population; mid-quality State highways link Palewharf (receiving Jimjam lake-barge alabaster across Jimjam's Lake), Bastion, Sheritu, Mirabilis, Veil, Tone, Lux, and Farport to Fulcrum; Farport's Factory Quarter monopolizes exterior pelagic trade with The Crook (frost-coral) and Ria Valley (ria-amber)."
        elif pol == "Hookfleet":
            entry["trade_regime"] = "pirate_and_smuggler_haven_truce_zone"
            entry["note"] = "Port Mira on SE Throne is a major Ranj (isle-spice) supplier AND a pirate + smuggler haven accepting all ships under one strict rule: zero shipjacking within 50 km of the city."
        elif pol == "League: Tethys":
            entry["trade_regime"] = "maritime_polis_nephtos_smuggler_haven"
            entry["note"] = "Includes Nephtos (smuggling, NOT piracy haven & master shipyard colony) founded on an island claimed by Kautoa, driving severe hostility with Kautoa."
        elif pol == "League: Ys":
            entry["trade_regime"] = "maritime_polis_ybera_ranj"
            entry["note"] = "Leading Hykkousoi maritime polis; Throne colony Ybera is a major Ranj (isle-spice) plantation supplier."
        elif pol == "Kautoa":
            entry["trade_regime"] = "beastrider_navy_hostile_league"
            entry["note"] = "Serves as effective navy, master shipwright, and coastal factor for the inner-crater Beast Riders; cool relations with Iziz as a result, and increasingly hostile to the Hykkousoi League (especially Tethys) over Nephtos's island claim."
        elif pol == "Beast Riders":
            entry["trade_regime"] = "inner_crater_tribes_kautoa_navy"
            entry["note"] = "Includes the wide-ranging Millipede Tribe, which never leaves the inner crater; zero independent shipping — relies on Kautoa as its coastal presence and effective navy."
        elif pol in ("Zeijani", "Andaru"):
            entry["trade_regime"] = "throne_native_kin_fleetless"
            entry["note"] = "Brother native peoples of Throne (friendly with each other, raid colonizing powers from time to time); possess NO fleets (Dhelv is strictly an inland Throne cavern — traders must come to them); wired into Krator's fungal goods, Ranj, and volcanic sulfur networks."
        elif pol == "Ring Sea Pirates":
            entry["trade_regime"] = "maritime_freebooters"
            entry["note"] = "Maritime freebooters operating out of Noa's Regret, Shanty (East Ring Isles), and Boiling Bay (Steampits), intercepting Ring Sea shipping outside Port Mira's 50-km truce zone."
        elif pol == "Frogmen":
            entry["trade_regime"] = "neighbor_raider_dalab_treaty"
            entry["note"] = "SW Highlands native Frogmen (Krrmt & Jrrmiah); raid neighboring marches EXCEPT Realm of Dalab, with whom they maintain a peace treaty via Span."
        elif pol == "Tiguantin":
            entry["trade_regime"] = "iziz_tributary_highland_fleetless"
            entry["note"] = "Fleetless Iziz tributary polity on the Eastern Highlands & Lesser Throne centered at town Guari (1095, 911); traders come to them overland/coastal-anchorages for cushion-wool, separate parasitic caterpillar-fungus medicine (wormwick), fumarole sulfur, and First Monastery relics."
        elif pol == "Jabal Shiekdom":
            entry["trade_regime"] = "bowl_oasis_sheikhdom"
            entry["note"] = "Independent Dasri oasis sheikhdom in the eastern Bowl (Jabal & Bowl Salt Works); major exporter of salt, saltpeter, pack camels/mounts, myrrh incense, and tamarisk-manna sugar."
        elif pol == "Kimr":
            entry["trade_regime"] = "megafauna_steppe_hunters"
            entry["note"] = "Semi-nomadic Pleistocene megafauna hunters gathered round the inhabited ruin of Hall of Heroes in the Labyrinth; primary exporter of mammoth/pachyderm ivory, horn, and heavy hides via dirt trails."
        elif pol in ("Tabisti: Sfenops", "Tabisti: Liikofi"):
            entry["trade_regime"] = "independent_abyssal_city"
            entry["note"] = "Independent East Abyss Tabisti city-state (no arcology in the East Abyss — zero scrap exports); exports Carboniferous swamp-copal incense, unique East Abyss lac & swamp-amber (abyss-lac), saltpeter, reed cordage, cotton, and coal."
        elif pol in ("Ria Valley", "The Crook"):
            entry["trade_regime"] = "abstract_exterior_sea_region"
            entry["note"] = "Abstract exterior region whose trade arrives exclusively by ship at Farport (exporting ria-amber / frost-coral) while drawing gold, silver, and Krator's unique regional resources."
        elif pol == "Silkhead (Korona Gateway)":
            entry["trade_regime"] = "independent_mountain_gateway"
            entry["note"] = "Independent gateway town at the foot of the Korona Silk River assembling wild silk, cordage, orchil dyes, and snow-lotus reagents."
        elif pol == "Dam Basin Salvagers":
            entry["trade_regime"] = "salvager_highwaymen"
            entry["note"] = "Boatmurder salvagers & highwaymen preying on caravans along the NE Dam Basin and semi-arid highways."
        elif pol in ("Painted Men", "Fellgangs", "Scyvoi", "Free Giants (Vrivolci)", "Coyote Kingdom", "Nomad Country"):
            entry["trade_regime"] = "neighbor_raider_trading"
            entry["note"] = "Participates in external trade while conducting frontier or desert raids that raise escort costs and shift cargo flows."
        pol_summary[pol] = entry

    entrepots = []
    for nm, ed in sorted(res["entrepot_totals"].items(), key=lambda kv: -(kv[1]["sea_tons"] + kv[1]["land_tons"])):
        top_g = sorted(ed["goods"].items(), key=lambda kv: -kv[1])[:6]
        entrepots.append({
            "hub": nm,
            "sea_tons_eq": round(ed["sea_tons"], 1),
            "land_tons_eq": round(ed["land_tons"], 1),
            "total_tons_eq": round(ed["sea_tons"] + ed["land_tons"], 1),
            "flow_count": ed["flows"],
            "top_transit_goods": [f"{g} ({round(v,1)} {GOOD_BY_ID[g]['unit']})" for g, v in top_g],
        })

    pirates_out = []
    for gid, pd in sorted(res["pirate_ledger"].items(), key=lambda kv: -kv[1]["captured"]):
        if pd["captured"] > 0.01:
            pirates_out.append({
                "good": gid,
                "unit": GOOD_BY_ID[gid]["unit"],
                "captured": round(pd["captured"], 2),
                "fenced": round(pd["fenced"], 2),
                "top_victims": [f"{p} ({round(v,2)})" for p, v in sorted(pd["victims"].items(), key=lambda x: -x[1])[:3]],
                "top_fence_buyers": [f"{p} ({round(v,2)})" for p, v in sorted(pd["buyers"].items(), key=lambda x: -x[1])[:3]],
            })

    out_json = os.path.join(ROOT, "openworld", "trade-gemini.json")
    payload = {
        "format": "krator-trade-gemini",
        "version": 2,
        "date": "2026-11-13",
        "map": "5.1",
        "branch": "gemini-trade",
        "settlement_count": len(setts),
        "polity_count": len(pol_summary),
        "good_count": len(GOODS),
        "supplemental_road_count": len(graph.get("supp_roads", [])),
        "entrepots": entrepots[:35],
        "catch_twins_stops": res.get("catch_twins_stops", []),
        "noas_regret_piracy": pirates_out,
        "polities": pol_summary,
        "per_good": res["per_good"],
    }
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"Saved JSON: {out_json} ({len(GOODS)} goods, {len(pol_summary)} polities, {len(setts)} settlements)")
    out_md = os.path.join(ROOT, "openworld", "TRADE-GEMINI.md")
    write_trade_markdown(payload, out_md)


if __name__ == "__main__":
    main()
