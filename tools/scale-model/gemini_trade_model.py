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
# 1. Load 5.1 Rasters, Geology, Polygons & Base Censuses (Read-Only)
# ---------------------------------------------------------------------------
def load_world():
    D = load_page()
    OW, OH = D["fullW"], D["fullH"]  # 1821 x 1723 (2 km/px)
    h_img = raster(D, "h")
    lo, hi = D["lo"], D["hi"]
    E2 = lo + ((h_img[..., 0].astype(np.int32) << 8) | h_img[..., 1]) / 65535.0 * (hi - lo)
    W2 = h_img[..., 2] > 127

    tm_img = raster(D, "tm")[..., 0].astype(np.float32) / 255.0 * 110.0 - 50.0
    rain_img = (raster(D, "p")[..., 0].astype(np.float32) / 255.0) ** 2 * 5000.0

    G = json.load(open(os.path.join(ROOT, "kits", "resources", "data", "geology.json"), encoding="utf-8"))
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

    reg_txt = open(os.path.join(HERE, "model", "src", "51-region-store.js"), encoding="utf-8").read()
    regs = json.loads(re.search(r"const defRegs = (\[.*?\]);\n", reg_txt, re.S).group(1))

    rs = json.load(open(os.path.join(ROOT, "openworld", "resources-settlements.json"), encoding="utf-8"))
    tg = json.load(open(os.path.join(ROOT, "openworld", "trade-goods.json"), encoding="utf-8"))
    ar = json.load(open(os.path.join(ROOT, "openworld", "ancient-roads-draft.json"), encoding="utf-8"))
    gr = json.load(open(os.path.join(ROOT, "openworld", "gods-road.json"), encoding="utf-8"))

    return {
        "D": D, "OW": OW, "OH": OH, "GW": GW, "GH": GH,
        "E2": E2, "W2": W2, "E": E, "W": W, "TM": TM, "RAIN": RAIN,
        "layers": layers, "regs": regs, "rs": rs, "tg": tg, "ar": ar, "gr": gr,
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
                "alkali", "nickel", "marble", "stone", "clay", "wood"):
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
    "Tethis": "League: Tethys",
    "Trigon": "League: Trigon",
    "Pontus": "League: Pontus",
    "Nereus": "League: Pontus",
    "Kierson": "League: Kierson",
}

RUIN_LIVING_OVERRIDES = {
    "Span": {"type": "fort", "population": 1400, "polity": "Realm of Dalab", "reach_km": 15},
    "Blade": {"type": "fort", "population": 500, "polity": "Realm of Dalab", "reach_km": 12},
    "Carcosa": {"type": "town", "population": 3500, "polity": "Yusar (Cybernetics)", "reach_km": 20},
    "Henge": {"type": "town", "population": 1800, "polity": "Yusar (Cybernetics)", "reach_km": 15},
    "Leng": {"type": "outpost", "population": 600, "polity": "Yeti Kingdom", "reach_km": 15},
    "Stair": {"type": "outpost", "population": 250, "polity": "Stair Divers (Catch)", "reach_km": 12},
    "Noa's Regret": {"type": "outpost", "population": 800, "polity": "Ring Sea Pirates", "reach_km": 12},
}

PIN_OVERRIDES = {
    "Port Goto": {"px": 920, "py": 703, "polity": "Shell Province", "population": 1100},
    "Spirladunon": {"type": "town", "population": 2500, "polity": "Talovolci Chiefs"},
    "Tallwalls": {"type": "town", "population": 2500, "polity": "Free Giants (Vrivolci)"},
    "Furrow": {"type": "town", "population": 2500, "polity": "Nomad Country"},
    "The Gate": {"type": "fort", "population": 800, "polity": "Coyote Kingdom"},
    "Zey'danin": {"polity": "Vothic Kingdom"},
    "Dhelv": {"polity": "Zeijani"},
    "Longsong": {"polity": "Order of Historians", "population": 1500},
    "Loj Twenny": {"polity": "Tungang Union", "population": 650},
    "Ledge": {"polity": "Tungang Union", "population": 2200},
    "Boatmurder": {"polity": "Dam Basin Salvagers", "population": 900},
}

# New settlements added in gemini-trade (owner-approved polities, gateways & TRADE-SCOPE pins)
NEW_SETTLEMENTS = [
    # Yeti capital at frozen lake
    {"name": "Qoold Lheek", "px": 410, "py": 506, "type": "town", "population": 2200, "polity": "Yeti Kingdom", "reach_km": 20},
    # Tethys colony in Ring Isles
    {"name": "Nephtos", "px": 919, "py": 762, "type": "town", "population": 1250, "polity": "League: Tethys", "reach_km": 15},
    # Western Spice Isles
    {"name": "Hetanini Spice Port", "px": 755, "py": 836, "type": "village", "population": 950, "polity": "Western Spice Isles", "reach_km": 15},
    {"name": "Vana Clove Atoll", "px": 773, "py": 842, "type": "village", "population": 650, "polity": "Western Spice Isles", "reach_km": 15},
    # Shumari on Shumar plateau
    {"name": "Betun-Sumar", "px": 738, "py": 1193, "type": "town", "population": 2500, "polity": "Shumari", "reach_km": 20},
    {"name": "Urudiru Keep", "px": 717, "py": 1175, "type": "fort", "population": 700, "polity": "Shumari", "reach_km": 15},
    # SW Highland Frogmen above Span
    {"name": "Kroak-Rim Village", "px": 562, "py": 1020, "type": "village", "population": 700, "polity": "SW Highland Frogmen", "reach_km": 15},
    {"name": "Pillar-Pool Hamlet", "px": 553, "py": 969, "type": "village", "population": 500, "polity": "SW Highland Frogmen", "reach_km": 15},
    # Outlands Coyote nodes & Great Chasm Sill
    {"name": "Coyote Lake Village", "px": 1220, "py": 564, "type": "village", "population": 500, "polity": "Coyote Kingdom", "reach_km": 15},
    {"name": "Gate Tarn Mires", "px": 1544, "py": 474, "type": "village", "population": 900, "polity": "Coyote Kingdom", "reach_km": 18},
    {"name": "The Sill (Sam-Lok)", "px": 1697, "py": 1028, "type": "outpost", "population": 450, "polity": "Coyote Kingdom", "reach_km": 12},
    {"name": "Peak Coyote Plume-Camp", "px": 1654, "py": 701, "type": "town", "population": 1400, "polity": "Coyote Kingdom", "reach_km": 20},
    # Spider Lake & Arachnoid River receiving post
    {"name": "Spider Lake Weirs", "px": 1288, "py": 220, "type": "village", "population": 900, "polity": "Spider Lake Guilds", "reach_km": 18},
    {"name": "Ham-Tsek Silk Post", "px": 1055, "py": 219, "type": "outpost", "population": 350, "polity": "Spider Lake Guilds", "reach_km": 12},
    # Scyvoi Baelu seats (counted once across seasonal bands per TRADE-SCOPE s11)
    {"name": "Baelu North (B4)", "px": 703, "py": 733, "type": "fort", "population": 800, "polity": "Scyvoi", "reach_km": 15},
    {"name": "Baelu Mid (B3)", "px": 683, "py": 802, "type": "fort", "population": 800, "polity": "Scyvoi", "reach_km": 15},
    {"name": "Baelu South (B1)", "px": 651, "py": 857, "type": "fort", "population": 800, "polity": "Scyvoi", "reach_km": 15},
    # Korona Tribes representative ring & hoar-table villages (TRADE-SCOPE s12)
    {"name": "Tong-Ham Ring (K1)", "px": 952, "py": 423, "type": "village", "population": 900, "polity": "Korona Tribes", "reach_km": 15},
    {"name": "Hoar-Table Village (K7)", "px": 1033, "py": 354, "type": "village", "population": 700, "polity": "Korona Tribes", "reach_km": 15},
    {"name": "Sing-Ham Crest (K2)", "px": 909, "py": 499, "type": "village", "population": 850, "polity": "Korona Tribes", "reach_km": 15},
    {"name": "East Korona Lake (E1)", "px": 1143, "py": 596, "type": "village", "population": 750, "polity": "Korona Tribes", "reach_km": 15},
    # Dasri & Tabisti additions (TRADE-SCOPE s9, s13)
    {"name": "Dasri Bowl Khan", "px": 1219, "py": 1148, "type": "town", "population": 2200, "polity": "Nomad Country", "reach_km": 20},
    {"name": "Catch Salt Works", "px": 1080, "py": 1428, "type": "outpost", "population": 350, "polity": "Nomad Country", "reach_km": 15},
    {"name": "Bowl Salt Works", "px": 1169, "py": 1150, "type": "outpost", "population": 400, "polity": "Empire of Iziz", "reach_km": 15},
    {"name": "Rifar al-Dhahab", "px": 1333, "py": 886, "type": "village", "population": 600, "polity": "Nomad Country", "reach_km": 15},
    {"name": "West Abyss Rim (W1)", "px": 1270, "py": 745, "type": "village", "population": 600, "polity": "Nomad Country", "reach_km": 15},
    {"name": "Mid-Abyss Tabist Town", "px": 1311, "py": 761, "type": "town", "population": 2200, "polity": "Nomad Country", "reach_km": 18},
    # Yuni SE Frontier (TRADE-SCOPE s2.5c, s9)
    {"name": "Sista Riba Village", "px": 1311, "py": 982, "type": "village", "population": 600, "polity": "Yuni Emirate", "reach_km": 15},
    {"name": "Ostrukh-on-Water", "px": 1516, "py": 1471, "type": "town", "population": 1800, "polity": "Yuni Emirate", "reach_km": 20},
    {"name": "Spindle Fan", "px": 1561, "py": 1140, "type": "village", "population": 700, "polity": "Yuni Emirate", "reach_km": 15},
    {"name": "Siphon Maar Works", "px": 1678, "py": 1542, "type": "outpost", "population": 400, "polity": "Yuni Emirate", "reach_km": 15},
    # Xanadu Opal Valley, White Gills & High Rift Quartz
    {"name": "Opal Valley Mines", "px": 1038, "py": 1662, "type": "village", "population": 850, "polity": "Xanadu Sultanate", "reach_km": 15},
    {"name": "White Gills Hermitage", "px": 1035, "py": 1535, "type": "outpost", "population": 120, "polity": "Order of Historians", "reach_km": 12},
    {"name": "Singing Gjar Quartz", "px": 1572, "py": 1643, "type": "outpost", "population": 200, "polity": "Order of Historians", "reach_km": 12},
]


def build_settlements(world):
    tg_setts = world["tg"]["settlements"]
    rs_by_name = {s["name"]: s for s in world["rs"]["settlements"]}
    setts = {}

    # 1. Existing living settlements from trade-goods.json
    for sid, s in tg_setts.items():
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
                # Scale labour-capped crafts modestly when downsizing city->town
                for k in ("plaid", "saltpeter", "tin", "nickel"):
                    if k in rec["supply"]:
                        rec["supply"][k] *= math.sqrt(scale)
            rec.update(ov)
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

    # 3. Newly added settlements & gateways
    for ns in NEW_SETTLEMENTS:
        if any(v["name"] == ns["name"] for v in setts.values()):
            continue
        sid = make_id("gemini:" + ns["name"])
        px, py = snap_to_land(world, ns["px"], ns["py"])
        setts[sid] = {
            "id": sid, "name": ns["name"], "px": px, "py": py,
            "type": ns["type"], "population": ns["population"],
            "polity": ns["polity"], "reach_km": ns["reach_km"],
            "supply": {}, "demand": {},
            "geo_scan": scan_site_geo(world, px, py, ns["reach_km"]),
            "source_note": "added in gemini-trade",
        }

    return setts


# ---------------------------------------------------------------------------
# 4. Complete 59-Good Catalog & Supply/Demand Synthesis
# ---------------------------------------------------------------------------
GOODS = [
    # Metals & Salvage
    {"id": "iron", "label": "iron & steel", "class": "metal", "tier": "bulk", "unit": "t", "note": "mined iron ore & smelted bar; heavy bulk cargo"},
    {"id": "copper", "label": "copper", "class": "metal", "tier": "medium", "unit": "t", "note": "bronze base, roofing, wire, coin"},
    {"id": "tin", "label": "tin", "class": "metal", "tier": "compact", "unit": "t", "note": "scarce alloying half of bronze; carries long range"},
    {"id": "bronze", "label": "bronze", "class": "metal", "tier": "medium", "unit": "t", "note": "cast fittings, bells, naval cannon, Eternian window tracery"},
    {"id": "nickel", "label": "nickel & alloy steel", "class": "metal", "tier": "medium", "unit": "t", "note": "armour plate & high-grade alloys"},
    {"id": "rare-earth", "label": "rare earths", "class": "metal", "tier": "compact", "unit": "t", "note": "extracted only by Yuni, Eternia, Order & Tungangs"},
    {"id": "gold", "label": "gold", "class": "precious", "tier": "compact", "unit": "kg", "note": "bullion, coin, Xanadu leaf"},
    {"id": "silver", "label": "silver", "class": "precious", "tier": "compact", "unit": "kg", "note": "trade coinage, Republic Mint bullion, Heirs' rank plate"},
    {"id": "scrap", "label": "Ancient scrap metal", "class": "salvage", "tier": "bulk", "unit": "t", "note": "ruin & ship-graveyard structural steel"},
    # Fuels, Minerals & Stone
    {"id": "coal", "label": "coal", "class": "fuel", "tier": "bulk", "unit": "t", "note": "smelting & kiln fuel; overwhelmingly waterborne"},
    {"id": "oil", "label": "crude oil & petrol", "class": "fuel", "tier": "bulk", "unit": "t", "note": "extracted by Yuni Geomancers (incl. Locus), Eternia & Order"},
    {"id": "salt", "label": "salt", "class": "mineral", "tier": "bulk", "unit": "t", "note": "dietary & curing staple; Catch/Bowl supply Xanadu"},
    {"id": "sulfur", "label": "sulfur", "class": "mineral", "tier": "medium", "unit": "t", "note": "gunpowder, vulcanizing, Steampits & Throne vents"},
    {"id": "saltpeter", "label": "saltpeter", "class": "mineral", "tier": "medium", "unit": "t", "note": "gunpowder & rockets; playas and lava-tube guano"},
    {"id": "potash", "label": "potash & soda ash", "class": "mineral", "tier": "bulk", "unit": "t", "note": "glass, soap, ceramic glazes"},
    {"id": "marble", "label": "carved contact-belt marble", "class": "stone", "tier": "bulk", "unit": "t", "note": "NW & SW Bay contact-marble belts shipped to Jimjam & courts"},
    {"id": "alabaster", "label": "translucent alabaster", "class": "stone", "tier": "medium", "unit": "t", "note": "Jimjam gypsum-alabaster for Eternian bronze-tracery palace windows"},
    {"id": "brick", "label": "Jimjam silt brick", "class": "bulk", "tier": "bulk", "unit": "unit", "note": "red & yellow flood-silt brick; short-haul & Cut masonry"},
    {"id": "machine-wax", "label": "Woolly Siphon machine-wax", "class": "mineral", "tier": "medium", "unit": "t", "note": "Yuni SE Siphon Pit high-temp lubricant for lifts, crawlers & mechs"},
    {"id": "pitch-tar", "label": "hull pitch, tar & prismgum", "class": "mineral", "tier": "medium", "unit": "t", "note": "naval caulking from hyperjungle prismgum, Ring Isles tar & Yeti birch-tar"},
    # Timber, Fibres, Cordage, Textiles & Food
    {"id": "timber", "label": "ship & structural timber", "class": "bulk", "tier": "bulk", "unit": "t", "note": "tier-cedar, column-kauri & meranti shipped by water to treeless ports"},
    {"id": "cordage", "label": "naval rigging & Golden Cable", "class": "craft", "tier": "medium", "unit": "t", "note": "Spider Lake 1.3 GPa Golden Cable, Cliff-Lung Scinropos, abaca & spinner-cord"},
    {"id": "cotton", "label": "cotton, flax & ramie", "class": "crop", "tier": "medium", "unit": "t", "note": "cloth & sea-linen sailcloth fibre"},
    {"id": "silk", "label": "silk, gossamer & beadcone-silk", "class": "luxury", "tier": "compact", "unit": "t", "note": "mulberry/lotus silk, Spider Lake Gossamer & SW Highland beadcone-silk"},
    {"id": "qiviut", "label": "Yeti qiviut & Cloud-Fleece", "class": "luxury", "tier": "compact", "unit": "t", "note": "musk-ox qiviut & Spider Lake waterproof thermal felt for high-pass parkas"},
    {"id": "plaid", "label": "Talovolci checked plaid", "class": "specialty", "tier": "medium", "unit": "unit", "note": "three-dye highland wool brought down Cliff-Lung stairs"},
    {"id": "dye-tropical", "label": "tropical & murex dyes", "class": "crop", "tier": "compact", "unit": "t", "note": "Shim Blitrit purple, Ys murex, Nephtos indigo & annatto"},
    {"id": "dye-temperate", "label": "temperate & lichen dyes", "class": "crop", "tier": "compact", "unit": "t", "note": "Talovolci woad/madder, Korona hoar-table lichens, Red Gills pigment"},
    {"id": "mounts", "label": "mounts, draught beasts & hides", "class": "beast", "tier": "medium", "unit": "head", "note": "camels, pack-lizards, beetles, flyers, Scyvoi salamanders, Coyote ostriches"},
    {"id": "food", "label": "grain, salt-rice & dried fish", "class": "staple", "tier": "bulk", "unit": "t", "note": "short-haul overland; medium-haul by Cargo Hulk & River Barge"},
    # Spices, Stimulants & Botanicals
    {"id": "spice-tropical", "label": "tropical spice (clove, citron)", "class": "crop", "tier": "compact", "unit": "t", "note": "East & West Ring Isles and Throne plantations"},
    {"id": "isle-spice", "label": "West Spice Isles & Ranj", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Western Spice Isles & Throne Ranj re-exported via Temora & Zey'danin"},
    {"id": "spice-highland", "label": "highland spice (saffron, umbel)", "class": "crop", "tier": "compact", "unit": "t", "note": "high-valley saffron & aromatics"},
    {"id": "cacao", "label": "cacao", "class": "crop", "tier": "compact", "unit": "t", "note": "Vale of Xanadu & warm basin cacao"},
    {"id": "coffee", "label": "coffee", "class": "crop", "tier": "compact", "unit": "t", "note": "Throne converted estates, Voth & foothill coffee"},
    {"id": "tea", "label": "mist tea & ivan-chai", "class": "crop", "tier": "compact", "unit": "t", "note": "Oidong/cloud-forest mist tea & northern ivan-chai"},
    {"id": "sugar", "label": "cane sugar & manna syrup", "class": "crop", "tier": "medium", "unit": "t", "note": "Shim & Ring Isles cane sugar, Dasri tamarisk-manna"},
    {"id": "tobacco", "label": "tobacco", "class": "crop", "tier": "compact", "unit": "t", "note": "Nephtos, Voth & lowland cured leaf"},
    {"id": "incense", "label": "myrrh, brush-oil & comb-mast incense", "class": "crop", "tier": "compact", "unit": "t", "note": "Dasri badlands myrrh, Outlands comb-mast, SW Highland brush-oil"},
    {"id": "medicine", "label": "medicines & anti-scurvy stores", "class": "crop", "tier": "compact", "unit": "t", "note": "rimdew, ginseng, Hykkousoi gill-salve, ember-plum scurvy powder"},
    {"id": "lung-salt", "label": "White Gills lung-salt & goldroot", "class": "specialty", "tier": "compact", "unit": "t", "note": "oxygen-carrying Lag Solt & Yeti goldroot enabling >5 km thin-air passes"},
    {"id": "reagent", "label": "alchemical reagents & snow-lotus", "class": "crop", "tier": "compact", "unit": "t", "note": "sky-poppy, camphor & Korona hoar-table snow-lotus"},
    {"id": "fungal", "label": "Zeijani fungal distillates", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Dhelv cavern-grown alchemical spirits"},
    # Gems, Kilnware, Knowledge & High Tech
    {"id": "pearls", "label": "pearls & worked nacre", "class": "luxury", "tier": "compact", "unit": "kg", "note": "Hykkousoi deep-shelf & Kautoan free-diver pearls"},
    {"id": "gems", "label": "opals, Outland emeralds & optical quartz", "class": "precious", "tier": "compact", "unit": "kg", "note": "Opal Valley black/fire/photonic opals, Coyote emeralds/turquoise, High Rift quartz"},
    {"id": "goldwork", "label": "Xanadu goldwork & prayer wheels", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Vale of Xanadu Goldsmiths' bullion craft"},
    {"id": "fine-ceramics", "label": "Jimjam kilnware & glazed ceramics", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Jimjam ('Kiln Country') painted kilnware & glazed tile, plus Yuni/Xanadu glazes"},
    {"id": "porcelain", "label": "Eternian imperial porcelain & paper", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Eternal State kaolin porcelain, celadon & rag/bamboo paper"},
    {"id": "almanacs", "label": "Jimjam Long Count almanacs", "class": "specialty", "tier": "compact", "unit": "unit", "note": "universal caravan & port contract-dating calendars & eclipse tables"},
    {"id": "books", "label": "books, codices & copied records", "class": "specialty", "tier": "compact", "unit": "unit", "note": "domestic presses in literate states; rare histories exported by Longsong (banned in Voth)"},
    {"id": "lenses", "label": "telescopes, sextants & lenses", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Roketstad Astronomers' Guild optics ground from Ancient glass & High Rift quartz"},
    {"id": "rockets", "label": "rockets, muskets & artillery", "class": "specialty", "tier": "medium", "unit": "unit", "note": "Iron Republic Arsenal firearms & rocket racks"},
    {"id": "arms", "label": "Forgemaster mech parts & steel arms", "class": "specialty", "tier": "medium", "unit": "unit", "note": "Iziz & Yuni weapons/mech parts (firearms barred north of Great Chasm Sill)"},
    {"id": "electrics", "label": "generators, lamps & Stair cells", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Yuni/Locus Geomancer electrics & Stair Catch-divers' charged Ancient cells"},
    {"id": "cybernetics", "label": "Yusar cybernetics & servo-craft", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Carcosa & Henge Yusar implants and mech-servos"},
    {"id": "genecraft", "label": "Dalab gene-craft & pressure mods", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Genepriest altitude/pressure/cold adaptations & healers"},
    {"id": "scrapgoods", "label": "Abyssal recycled scrap-wares", "class": "specialty", "tier": "medium", "unit": "unit", "note": "Locus, Mungo & Tabisti worked tin-mirror & ruin craft"},
    {"id": "relics", "label": "licensed Ancient relics", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Eternal State Valley monopoly & Stair sealed-tunnel artifacts"},
    {"id": "oversea-luxuries", "label": "Farport over-the-sea luxuries", "class": "luxury", "tier": "compact", "unit": "unit", "note": "off-map pelagic imports landed at Farport's Factory Quarter under State monopoly"},
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
        "League: Kierson": 0.80,
        "Iron Republic": 0.94,       # technical ordinances & astronomer tables
        "Xanadu Sultanate": 0.92,    # monastic sutras & court annals
        "Dilihan Province": 0.92,
        "Tungang Union": 0.82,
        "Yusar (Cybernetics)": 0.90,
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
                "isle-spice": 0.08 * kpop, "fungal": 0.025 * kpop, "plaid": 0.09 * kpop,
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
                sup["timber"] = gs["wood"] * 55.0
            if gs["rain_mm"] >= 450 and -2.0 <= gs["temp_c"] <= 35.0:
                sup["food"] = max(180.0 * kpop, gs["land_cells"] * 38.0)
            elif gs["sea_cells"] > 5:
                sup["food"] = 210.0 * kpop + gs["sea_cells"] * 25.0

        # Apply TRADE-SCOPE s2.4 extraction gate on oil & rare-earth (except Geomancer concessions)
        if pol not in OIL_ALLOWED and nm not in ("Mungo",):
            sup["oil"] = 0.0
        if pol not in RE_ALLOWED and nm not in ("White Gills Hermitage",):
            sup["rare-earth"] = 0.0
        if nm == "Locus":
            sup["oil"] = max(sup.get("oil", 0.0), 420.0)  # Locus oil lode (TRADE-SCOPE s2.4)
        if nm == "Mungo":
            sup["oil"] = max(sup.get("oil", 0.0), 180.0)  # Geomancer fuel depot
        if nm in ("Reed", "Tabist town", "Mid-Abyss Tabist Town"):
            sup["food"] = max(sup.get("food", 0.0), 320.0 * kpop)  # lifted N abyss + salt-rice (TRADE-SCOPE s10)

        # --- Baseline demand for the 12 new goods across ALL settlements ---
        is_port = gs["sea_cells"] > 0 or nm in ("Voth", "Fulcrum", "Erehwon", "Theodiga", "Spider Lake Weirs", "Shim")
        is_high = gs["h_m"] > 2200 or pol in ("Realm of Dalab", "Xanadu Sultanate", "Tungang Union", "Order of Historians", "Yuni Emirate", "Empire of Iziz")

        dem["marble"] = (0.75 if s["type"] in ("city", "arcology") else 0.15) * kpop
        if nm == "Jimjam":
            dem["marble"] = 68.0  # brick-built Jimjam imports contact-belt marble up The Cut!
            dem["coal"] = max(dem.get("coal", 0.0), 195.0)  # kiln fuel for Kiln Country!
        elif nm in ("Iziz", "Fulcrum", "Hook", "Yuni"):
            dem["marble"] = max(dem["marble"], 28.0 * (kpop / 12.0))
        if pol == "Nomad Country":
            dem["coal"] = min(dem.get("coal", 0.0), 0.6 * kpop)
        if pol == "Order of Historians":
            dem["coal"] = min(dem.get("coal", 0.0), 1.5 * kpop)
        dem["alabaster"] = (1.6 if pol == "Eternal State" else 0.28) * kpop
        dem["machine-wax"] = (0.35 if pol in ("Iron Republic", "Empire of Iziz", "Tungang Union", "Eternal State", "Yusar (Cybernetics)") else 0.08) * kpop
        dem["pitch-tar"] = (2.4 if is_port else 0.15) * kpop
        dem["cordage"] = (2.8 if is_port else 0.35) * kpop
        dem["qiviut"] = (0.09 if gs["temp_c"] < 14 or s["type"] == "city" else 0.02) * kpop
        dem["incense"] = (0.22 if pol in ("Xanadu Sultanate", "Realm of Dalab", "Vothic Kingdom", "Eternal State", "Empire of Iziz", "Yuni Emirate") else 0.06) * kpop
        dem["lung-salt"] = (0.14 if is_high else 0.025) * kpop
        dem["gems"] = (0.55 if s["type"] in ("city", "arcology") or pol == "Yusar (Cybernetics)" else 0.08) * kpop
        dem["fine-ceramics"] = 0.22 * kpop
        dem["cybernetics"] = (0.14 if pol in ("Eternal State", "Realm of Dalab", "Empire of Iziz", "Yuni Emirate", "Order of Historians") else 0.015) * kpop
        dem["oversea-luxuries"] = (0.20 if s["type"] in ("city", "arcology") else 0.03) * kpop

        # --- Owner Item #4: Literate societies produce domestic books; Longsong exports curated rare histories ---
        dem["books"] = max(dem.get("books", 0.0), 0.18 * kpop)
        if pol == "Order of Historians":
            sup["books"] = 6.5 if nm == "Longsong" else 0.8
        else:
            ratio = LITERATE_BOOK_SELF.get(pol, 0.20)
            sup["books"] = dem["books"] * ratio

        # --- Contact-Belt Marble, Jimjam Alabaster & Fine Ceramics ("Kiln Country") ---
        MARBLE_QUARRIES = {"Almua": 185.0, "Dilihan": 145.0, "Tethis": 125.0, "Ys": 85.0, "Tallwalls": 75.0}
        if nm in MARBLE_QUARRIES:
            sup["marble"] = MARBLE_QUARRIES[nm]
        elif gs["marble_max"] >= 110:
            sup["marble"] = gs["marble"] * 2.2
        if nm == "Jimjam":
            sup["alabaster"] = 95.0       # 4,156-cell gypsum/alabaster basin
            sup["fine-ceramics"] = 24.0   # Kiln Country signature export!
            sup["almanacs"] = max(sup.get("almanacs", 0.0), 28.0)
        elif nm == "Serai":
            sup["alabaster"] = 18.0
            sup["fine-ceramics"] = 4.5
        elif pol == "Yuni Emirate" and nm in ("Yuni", "Locus"):
            sup["fine-ceramics"] = 4.5 * (kpop / 6.0)
        elif pol == "Xanadu Sultanate" and nm == "Erehwon":
            sup["fine-ceramics"] = 5.5

        # --- Farport Over-the-Sea Monopoly ---
        if nm == "Farport":
            sup["oversea-luxuries"] = 26.0

        # --- Specialized Regional Producers ---
        if pol == "Yusar (Cybernetics)":
            sup["cybernetics"] = 8.5 if nm == "Carcosa" else 4.0
            dem["scrap"] = max(dem.get("scrap", 0.0), 28.0 * kpop)
            dem["electrics"] = max(dem.get("electrics", 0.0), 1.2 * kpop)
            dem["gems"] = max(dem.get("gems", 0.0), 2.2 * kpop)  # photonic opals
            dem["rare-earth"] = max(dem.get("rare-earth", 0.0), 0.8 * kpop)

        if pol == "Yeti Kingdom":
            sup["qiviut"] = 4.2 if nm == "Qoold Lheek" else 1.2
            sup["lung-salt"] = 2.8 if nm == "Qoold Lheek" else 0.9  # goldroot hypoxia adaptogen
            sup["pitch-tar"] = 18.0 if nm == "Qoold Lheek" else 6.0  # birch-tar
            sup["tea"] = max(sup.get("tea", 0.0), 8.0)               # ivan-chai
            dem["iron"] = max(dem.get("iron", 0.0), 18.0 * kpop)
            dem["food"] = max(dem.get("food", 0.0), 310.0 * kpop)
            sup["food"] = 190.0 * kpop

        if nm == "Stair":
            sup["electrics"] = 5.5   # charged Ancient energy cells from sealed tunnel
            sup["relics"] = 2.2      # uncorroded tunnel artifacts
            sup["nickel"] = 4.5      # preserved alloys
            sup["food"] = 10.0       # oasis dates only; imports food!

        if nm == "Nephtos":
            sup["copper"] = 48.0
            sup["pearls"] = 62.0     # water-breather shelf pearls
            sup["timber"] = 14500.0  # finished ship hulls & island mahogany
            sup["dye-tropical"] = 9.5
            sup["tobacco"] = 14.0

        if pol == "Western Spice Isles":
            sup["isle-spice"] = 18.0 if "Hetanini" in nm else 12.0
            sup["spice-tropical"] = 16.0 if "Hetanini" in nm else 11.0
            sup["sugar"] = 180.0
            sup["pearls"] = 22.0

        if pol == "Spider Lake Guilds":
            sup["cordage"] = 52.0 if "Spider Lake" in nm else 14.0  # Golden Cable rigging
            sup["silk"] = 6.8 if "Spider Lake" in nm else 1.8       # Lake-Sheen Gossamer
            sup["qiviut"] = 3.2 if "Spider Lake" in nm else 0.8     # Cloud-Fleece parkas

        if pol == "SW Highland Frogmen":
            sup["silk"] = 3.4       # beadcone-silk traded through Span
            sup["incense"] = 4.8    # brush-oil
        if nm == "Span":
            sup["silk"] = max(sup.get("silk", 0.0), 1.6)
            sup["incense"] = max(sup.get("incense", 0.0), 2.5)

        if pol == "Shumari":
            sup["mounts"] = 42.0 if "Betun" in nm else 15.0
            sup["saltpeter"] = 3.5
            sup["spice-highland"] = 1.4
            dem["arms"] = max(dem.get("arms", 0.0), 1.8 * kpop)  # Mamluk Sword-Caste demand

        if pol == "Scyvoi":
            sup["mounts"] = 38.0    # salamander draught beasts & hides
            sup["incense"] = 3.2    # fire-season dryland resins

        if pol == "Korona Tribes":
            sup["dye-temperate"] = 4.5 if "K7" in nm else 1.8
            sup["reagent"] = 3.2 if "K7" in nm else 1.1  # snow-lotus

        if pol == "Coyote Kingdom":
            if nm in ("Gate Tarn Mires", "Peak Coyote Plume-Camp"):
                sup["gems"] = 28.0 if "Peak" in nm else 18.0  # Peak emeralds & N Outlands turquoise
                sup["mounts"] = 45.0                          # riding ostriches & plumes
                sup["incense"] = 6.5                          # comb-mast incense
            if nm == "The Gate":
                sup["food"] = max(sup.get("food", 0.0), 420.0)  # Seed Law fodder monopoly!

        if nm == "Siphon Maar Works":
            sup["machine-wax"] = 42.0
        elif nm == "Ostrukh-on-Water":
            sup["food"] = 2400.0     # Woolly Ghaunt-Ox breadbasket
            sup["machine-wax"] = 8.0
        elif nm == "Spindle Fan":
            sup["cordage"] = 28.0    # spinner-cord

        if nm == "Opal Valley Mines":
            sup["gems"] = 54.0       # black, fire & photonic opals
        if nm == "White Gills Hermitage":
            sup["lung-salt"] = 9.5   # Lag Solt scraped from charged collars
            sup["rare-earth"] = 6.5  # ferromanganese pipe crust
        if nm == "Singing Gjar Quartz":
            sup["gems"] = 16.0       # optical quartz & chalcedony
        if nm == "Roketstad":
            dem["gems"] = max(dem.get("gems", 0.0), 9.0)  # optical quartz for lenses!

        if nm in ("Catch Salt Works", "Bowl Salt Works"):
            sup["salt"] = 1850.0
            sup["saltpeter"] = 8.5
        if pol == "Xanadu Sultanate":
            # TRADE-SCOPE s2.2: Xanadu imports salt across the Catch
            sup["salt"] = min(sup.get("salt", 0.0), 35.0)

        if pol == "Nomad Country" and nm not in ("Catch Salt Works",):
            sup["incense"] = max(sup.get("incense", 0.0), 3.6 * max(kpop, 0.4))  # badlands myrrh
            sup["mounts"] = max(sup.get("mounts", 0.0), 28.0 * max(kpop, 0.4))

        if nm == "Spirladunon":
            sup["cordage"] = 24.0    # Scinropos rot-proof cliff-lung rope
        if nm in ("Kautoa", "Valapo", "Bipo"):
            sup["cordage"] = max(sup.get("cordage", 0.0), 18.0 * max(kpop, 0.5))  # rope-banana abaca
            sup["pitch-tar"] = max(sup.get("pitch-tar", 0.0), 16.0 * max(kpop, 0.5))  # tar-black seeps
        if nm in ("Mav's Refuge", "Voth", "Shim", "Shell"):
            sup["pitch-tar"] = max(sup.get("pitch-tar", 0.0), 22.0)  # hyperjungle prismgum

        if nm == "Boatmurder":
            sup["scrap"] = 680.0     # Dam Basin stranded-freighter hull salvage!


# ---------------------------------------------------------------------------
# 5. Build Two-Layer Multimodal 4 km Dijkstra Graph (Land Layer 0 + Ship Layer 1)
# ---------------------------------------------------------------------------
def build_multimodal_graphs(world, setts):
    GW, GH, OW, OH = world["GW"], world["GH"], world["OW"], world["OH"]
    N_CELL = GW * GH
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)
    E, W, RAIN = world["E"], world["W"], world["RAIN"]

    # Identify sea vs inland lake water components
    lbl, ncomp = ndimage.label(W)
    comp_sizes = np.bincount(lbl.ravel())
    # Ring Sea & Farside Ocean are huge (>5000 cells); Erehwon, Spider Lake, Shim, Abyssal lakes >= 12 cells
    nav_water = W & (comp_sizes[lbl] >= 12)
    # Identify Ring Sea water component specifically (840, 910 is open strait water off Hook; NOT Throne island!)
    rs_i, rs_j = int(round(840 * su)), int(round(910 * sv))
    ring_sea_comp = int(lbl[rs_j, rs_i])
    assert ring_sea_comp > 0, "Expected Ring Sea water component > 0"
    is_ring_sea = (lbl == ring_sea_comp)

    # Blocked & penalized polygons
    mask_valley = poly_mask(world["regs"], {"ancient's valley", "ancients valley"}, GW, GH, OW, OH)
    mask_korona = poly_mask(world["regs"], {"korona / ne"}, GW, GH, OW, OH)

    # Rasterize kept / partly-kept Ancient highways & God's Road (remember +272,+330 legacy shift!)
    road_mult = np.ones((GH, GW), dtype=np.float32)
    dx_leg, dy_leg = LEGACY_SHIFT
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
                if 0 <= cj < GH and 0 <= ci < GW:
                    road_mult[cj, ci] = min(road_mult[cj, ci], m_val)

    for pts_src in [world["gr"].get("px", [])]:
        for idx_p in range(len(pts_src) - 1):
            x0, y0 = (pts_src[idx_p][0] + dx_leg) * su, (pts_src[idx_p][1] + dy_leg) * sv
            x1, y1 = (pts_src[idx_p + 1][0] + dx_leg) * su, (pts_src[idx_p + 1][1] + dy_leg) * sv
            steps = max(2, int(math.hypot(x1 - x0, y1 - y0) * 2) + 1)
            for t in np.linspace(0, 1, steps):
                ci, cj = int(round(x0 + t * (x1 - x0))), int(round(y0 + t * (y1 - y0)))
                if 0 <= cj < GH and 0 <= ci < GW:
                    road_mult[cj, ci] = min(road_mult[cj, ci], 0.80)

    # Rasterize cataract-free navigable rivers (Q >= 35 m3/s and slope < 0.004)
    river_nav = np.zeros((GH, GW), dtype=bool)
    for rv in world["D"]["rivers"]:
        pts = rv.get("px", [])
        qs = rv.get("q_m3s", [])
        beds = rv.get("bed_m", [])
        for k in range(len(pts) - 1):
            q = qs[min(k, len(qs) - 1)] if qs else 0.0
            if q < 35.0:
                continue
            dist_m = max(500.0, math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]) * 2000.0)
            drop = abs(beds[k + 1] - beds[k]) if len(beds) > k + 1 else 0.0
            if drop / dist_m >= 0.0045:
                continue  # cataract / gorge blocks barges!
            x0, y0 = pts[k][0] * su, pts[k][1] * sv
            x1, y1 = pts[k + 1][0] * su, pts[k + 1][1] * sv
            steps = max(2, int(math.hypot(x1 - x0, y1 - y0) * 2) + 1)
            for t in np.linspace(0, 1, steps):
                ci, cj = int(round(x0 + t * (x1 - x0))), int(round(y0 + t * (y1 - y0)))
                if 0 <= cj < GH and 0 <= ci < GW:
                    river_nav[cj, ci] = True

    # Eternian locked-canal lowland triangle (Fulcrum-Lux-Bastion-Farport)
    et_box = np.zeros((GH, GW), dtype=bool)
    et_box[int(540 * sv):int(710 * sv), int(280 * su):int(560 * su)] = True
    canal_nav = et_box & (~W) & (E >= 0) & (E <= 420)

    def cell_of(px, py):
        return int(round(py * sv)) * GW + int(round(px * su))

    # Assign settlement cells & identify ports/harbours connected to Layer 1 (N_CELL + cell)
    port_links = []
    for sid, s in setts.items():
        c = cell_of(s["px"], s["py"])
        s["cell"] = c
        cj, ci = divmod(c, GW)
        # Check if within 3 cells (12 km) of navigable sea/lake water
        best_w = None
        for dj in range(-3, 4):
            for di in range(-3, 4):
                nj, ni = cj + dj, ci + di
                if 0 <= nj < GH and 0 <= ni < GW and nav_water[nj, ni]:
                    d = dj * dj + di * di
                    if best_w is None or d < best_w[0]:
                        best_w = (d, nj * GW + ni)
        if best_w is not None:
            s["water_cell"] = best_w[1]
            s["is_ring_sea_port"] = bool(is_ring_sea.flat[best_w[1]])
            port_links.append((c, N_CELL + best_w[1]))
        else:
            s["water_cell"] = None
            s["is_ring_sea_port"] = False

    # Engineered corridors, tunnels, lifts & mountain passes broken into natural terrain waypoints
    SPECIAL_CORRIDORS = [
        ("Tungang Rift-Line Train Bore", 477, 1108, 461, 1161, 115, 58.0, 72.0),
        ("Tungang Deep Hot Bore (>100 C)", 461, 1161, 457, 1269, 215, 108.0, 138.0),
        ("Tungang South Bore", 457, 1269, 437, 1330, 125, 68.0, 85.0),
        ("Loj Fower Cliff Lifts (Ledge-Nulab)", 437, 1330, 443, 1359, 60, 52.0, 42.0),
        ("Span Basin Tunnel", 477, 1108, 554, 1010, 240, 185.0, 155.0),
        ("Inner Wall Karst Tunnel (Drum-Cascade)", 673, 932, 568, 841, 275, 420.0, 235.0),
        ("Verge 16-Hairpin Scarp", 1240, 960, 1268, 949, 60, 115.0, 75.0),
        ("Godsgate & Bab al-Hawa", 1113, 1164, 1033, 1258, 245, 290.0, 205.0),
        ("Catch North Oases (Kolli-Arfwai)", 1033, 1258, 1072, 1355, 210, 250.0, 178.0),
        ("Catch Mid Oasis (Arfwai-Stair)", 1072, 1355, 1106, 1442, 190, 225.0, 160.0),
        ("Dasri Bowl-Catch Oasis Trail", 1219, 1148, 1072, 1355, 480, 575.0, 405.0),
        ("The Twins Lava-Tube & Steam Pass", 1106, 1442, 1042, 1525, 215, 290.0, 192.0),
        ("Twins-Strongbow Descent", 1042, 1525, 1001, 1596, 165, 220.0, 148.0),
        ("White Gills Breath-Pass (Stair-Gills)", 1106, 1442, 1035, 1535, 235, 340.0, 215.0),
        ("White Gills Descent (Gills-Strongbow)", 1035, 1535, 1001, 1596, 140, 210.0, 130.0),
        ("Talovolci Cliff-Lung Stairs (Torus-Spirladunon)", 777, 1005, 800, 1017, 52, 190.0, 82.0),
        ("Yeti Winter Pycrete Road (Qoold Lheek-Leng)", 410, 506, 490, 554, 185, 290.0, 185.0),
        ("Yeti Descent (Leng-Lux)", 490, 554, 495, 645, 182, 260.0, 175.0),
        ("Outland Gate & Hau-Gel Trough", 1288, 220, 1368, 272, 195, 180.0, 152.0),
        ("Hau-Gel Narrows to The Gate", 1368, 272, 1438, 326, 175, 160.0, 138.0),
        ("Tierhound Seed-Law Gate (Gate-Gate Tarn)", 1438, 326, 1544, 474, 365, 380.0, 310.0),
        ("Web-Cleaver Gorge (Spider Lake-Ham-Tsek)", 1288, 220, 1055, 219, 466, 510.0, 370.0),
        ("Korona Guided Silk River (Ham-Tsek-K6-K1)", 1055, 219, 1006, 340, 265, 295.0, 215.0),
        ("Korona Ring Trail (K6-K1)", 1006, 340, 952, 423, 198, 220.0, 162.0),
        ("Korona West Descent (K1-Serai)", 952, 423, 826, 478, 275, 320.0, 245.0),
        ("God's Road North (Pinnacle-Ria)", 1018, 678, 1165, 395, 630, 680.0, 465.0),
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

    idx = np.arange(N_CELL).reshape(GH, GW)

    def make_csr(sea_mult, riv_mult, road_scale, trail_mult, port_fee, use_bulk):
        rows, cols, costs = [], [], []
        for dj, di in ((0, 1), (1, 0), (1, 1), (1, -1)):
            a = idx[max(0, -dj):GH - max(0, dj), max(0, -di):GW - max(0, di)].ravel()
            b = idx[max(0, dj):GH + min(0, dj) or None, max(0, di):GW + min(0, di) or None].ravel()
            d_km = 4.0 * math.hypot(dj, di)

            # --- Layer 0: Land / Highway / Navigable River / Canal ---
            wa, wb = W.flat[a], W.flat[b]
            ea, eb = E.flat[a], E.flat[b]
            g = np.abs(eb - ea) / (d_km * 1000.0)
            slope_pen = 1.0 + (2.6 if use_bulk else 1.4) * (g / 0.075) ** 2
            rm = 0.5 * (road_mult.flat[a] + road_mult.flat[b])
            has_road = rm < 0.95

            c_land = np.full(a.shape, d_km * trail_mult, dtype=np.float64) * slope_pen
            # Kept / partly-kept Ancient road overrides steep local micro-relief
            c_road = d_km * rm * road_scale * (1.0 + 0.4 * (g / 0.08) ** 2)
            c_land = np.where(has_road, np.minimum(c_land, c_road), c_land)

            # Navigable river or Eternian canal
            is_riv = (river_nav.flat[a] & river_nav.flat[b]) | (canal_nav.flat[a] & canal_nav.flat[b])
            c_land = np.where(is_riv, np.minimum(c_land, d_km * riv_mult), c_land)

            # Arid off-road surcharge
            arid = ((RAIN.flat[a] < 260) | (RAIN.flat[b] < 260)) & (~has_road) & (~is_riv)
            c_land = np.where(arid, c_land * 1.25, c_land)

            # Korona maze penalty (TRADE-SCOPE s7.6 x4)
            kor = (mask_korona.flat[a] | mask_korona.flat[b]) & (~has_road)
            c_land = np.where(kor, c_land * 3.6, c_land)

            # Altitude hypoxia & airless rim block (>7,500 m impassable overland)
            emax = np.maximum(ea, eb)
            high = emax > 4200.0
            c_land = np.where(high, c_land * (1.0 + ((np.maximum(emax, 4200.0) - 4200.0) / 1700.0) ** 2), c_land)
            impass = (emax > 7500.0) | mask_valley.flat[a] | mask_valley.flat[b] | (wa & wb)
            # Narrow 1-cell river/strait bridges allowed on land at high bridge cost; open water blocked on Layer 0
            one_w = wa ^ wb
            c_land = np.where(one_w & (~is_riv), c_land * 4.5, c_land)
            c_land[impass] = np.inf

            ok0 = np.isfinite(c_land)
            rows += [a[ok0], b[ok0]]
            cols += [b[ok0], a[ok0]]
            costs += [c_land[ok0], c_land[ok0]]

            # --- Layer 1: Maritime & Lake Shipping (only on nav_water cells) ---
            nwa = nav_water.flat[a] & nav_water.flat[b]
            if nwa.any():
                aw, bw = a[nwa] + N_CELL, b[nwa] + N_CELL
                cw = np.full(aw.shape, d_km * sea_mult, dtype=np.float64)
                rows += [aw, bw]
                cols += [bw, aw]
                costs += [cw, cw]

        # Port break-of-bulk transfer edges (Layer 0 <-> Layer 1 ONLY at ports!)
        for c_land_idx, c_wat_idx in port_links:
            rows += [np.array([c_land_idx, c_wat_idx])]
            cols += [np.array([c_wat_idx, c_land_idx])]
            costs += [np.array([port_fee, port_fee], dtype=np.float64)]

        # Engineered tunnels, lifts & pass corridors on Layer 0
        for _, x0, y0, x1, y1, _, b_eq, c_eq in SPECIAL_CORRIDORS:
            u = cell_of(*snap_to_land(world, x0, y0))
            v = cell_of(*snap_to_land(world, x1, y1))
            eq = b_eq if use_bulk else c_eq
            rows += [np.array([u, v])]
            cols += [np.array([v, u])]
            costs += [np.array([eq, eq], dtype=np.float64)]

        r_all = np.concatenate(rows)
        c_all = np.concatenate(cols)
        v_all = np.concatenate(costs)
        return coo_matrix((v_all, (r_all, c_all)), shape=(2 * N_CELL, 2 * N_CELL)).tocsr()

    G_bulk = make_csr(sea_mult=0.16, riv_mult=0.34, road_scale=1.15, trail_mult=1.35, port_fee=26.0, use_bulk=True)
    G_comp = make_csr(sea_mult=0.28, riv_mult=0.45, road_scale=1.00, trail_mult=1.00, port_fee=22.0, use_bulk=False)

    sids = sorted(setts.keys())
    src_cells = [setts[sid]["cell"] for sid in sids]

    print(f"Running multimodal Dijkstra for {len(sids)} settlements across {2*N_CELL:,} graph nodes...")
    dist_bulk, pred_bulk = dijkstra(G_bulk, directed=False, indices=src_cells, return_predecessors=True)
    dist_comp, pred_comp = dijkstra(G_comp, directed=False, indices=src_cells, return_predecessors=True)

    return {
        "N_CELL": N_CELL, "GW": GW, "GH": GH,
        "sids": sids, "sid_to_idx": {sid: i for i, sid in enumerate(sids)},
        "dist_bulk": dist_bulk, "pred_bulk": pred_bulk,
        "dist_comp": dist_comp, "pred_comp": pred_comp,
        "is_ring_sea": is_ring_sea, "river_nav": river_nav, "canal_nav": canal_nav,
        "road_mult": road_mult, "special_corridors": SPECIAL_CORRIDORS,
    }


# ---------------------------------------------------------------------------
# 6. Reconstruct Pairwise Paths, Mode Shares, Chokepoints & Pirate Exposure
# ---------------------------------------------------------------------------
def analyze_pair_path(world, graph, setts, i_src, j_dst, tier):
    N_CELL, GW = graph["N_CELL"], graph["GW"]
    OW, OH, GH = world["OW"], world["OH"], world["GH"]
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)

    pred = graph["pred_bulk"][i_src] if tier == "bulk" else graph["pred_comp"][i_src]
    sids = graph["sids"]
    u_start = setts[sids[i_src]]["cell"]
    cur = setts[sids[j_dst]]["cell"]

    nodes = []
    steps_guard = 0
    while cur != u_start and cur >= 0 and steps_guard < 10000:
        nodes.append(cur)
        cur = int(pred[cur])
        steps_guard += 1
    if cur != u_start:
        return None
    nodes.append(u_start)
    nodes.reverse()

    # Map port water/land transitions & mode distances
    cell_to_port = {}
    for sid, s in setts.items():
        if s["water_cell"] is not None:
            cell_to_port[s["cell"]] = s["name"]
            cell_to_port[N_CELL + s["water_cell"]] = s["name"]

    # Map special corridor endpoints
    spec_lookup = {}
    for cname, x0, y0, x1, y1, rkm, _, _ in graph["special_corridors"]:
        u = int(round(snap_to_land(world, x0, y0)[1] * sv)) * GW + int(round(snap_to_land(world, x0, y0)[0] * su))
        v = int(round(snap_to_land(world, x1, y1)[1] * sv)) * GW + int(round(snap_to_land(world, x1, y1)[0] * su))
        spec_lookup[(u, v)] = (cname, rkm)
        spec_lookup[(v, u)] = (cname, rkm)

    sea_km = riv_km = hwy_km = trail_km = spec_km = 0.0
    ring_sea_km = 0.0
    min_pirate_dist_km = 9999.0
    noa_i, noa_j = 896 * su, 866 * sv

    ports_used = []
    corridors_used = []
    poly_51 = []  # downsampled [[px, py], ...] on 5.1 canvas for map rendering
    seg_modes = []

    for k in range(len(nodes) - 1):
        a, b = nodes[k], nodes[k + 1]
        la, lb = a >= N_CELL, b >= N_CELL
        ca, cb = a % N_CELL, b % N_CELL
        aj, ai = divmod(ca, GW)
        bj, bi = divmod(cb, GW)
        px_a, py_a = ai / su, aj / sv
        px_b, py_b = bi / su, bj / sv
        if k == 0:
            poly_51.append([round(px_a, 1), round(py_a, 1)])

        if la != lb:
            # Port boarding or alighting!
            pname = cell_to_port.get(a) or cell_to_port.get(b)
            if pname and (not ports_used or ports_used[-1] != pname):
                ports_used.append(pname)
            continue

        if not la and (a, b) in spec_lookup:
            cname, rkm = spec_lookup[(a, b)]
            spec_km += rkm
            if cname not in corridors_used:
                corridors_used.append(cname)
            poly_51.append([round(px_b, 1), round(py_b, 1)])
            seg_modes.append("corridor")
            continue

        step_km = 4.0 * math.hypot(bi - ai, bj - aj)
        if la and lb:
            sea_km += step_km
            if graph["is_ring_sea"][aj, ai] or graph["is_ring_sea"][bj, bi]:
                ring_sea_km += step_km
                d_noa = 4.0 * math.hypot(0.5 * (ai + bi) - noa_i, 0.5 * (aj + bj) - noa_j)
                if d_noa < min_pirate_dist_km:
                    min_pirate_dist_km = d_noa
            mode = "sea"
        else:
            if (graph["river_nav"][aj, ai] and graph["river_nav"][bj, bi]) or (
                graph["canal_nav"][aj, ai] and graph["canal_nav"][bj, bi]
            ):
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

    # Detect key land gateway settlements passed within 16 km (4 cells)
    GATEWAY_NAMES = [
        "Dilihan", "Jimjam", "Talia", "Verge", "Stair", "Strongbow",
        "Roketstad", "Cascade", "Span", "Ledge", "The Gate", "The Sill (Sam-Lok)",
        "Spider Lake Weirs", "Hook", "Port Tobin", "Port Goto", "Ys", "Tethis",
        "Almua", "Zey'danin", "Kautoa", "Farport",
    ]
    gw_cells = [(nm, setts[sid]["cell"] % N_CELL) for sid, s in setts.items() for nm in [s["name"]] if nm in GATEWAY_NAMES]
    gateways_hit = []
    land_pts = [(n % N_CELL) for n in nodes[::2] if n < N_CELL]
    for gname, gc in gw_cells:
        gj, gi = divmod(gc, GW)
        for lp in land_pts:
            lj, li = divmod(lp, GW)
            if (lj - gj) ** 2 + (li - gi) ** 2 <= 9:
                if gname not in gateways_hit:
                    gateways_hit.append(gname)
                break

    total_km = max(1.0, sea_km + riv_km + hwy_km + trail_km + spec_km)
    # Pirate capture rate on Ring Sea shipping: 3.5% baseline up to 7.5% when passing near Noa's Regret
    pirate_rate = 0.0
    if ring_sea_km >= 24.0:
        prox = math.exp(-max(0.0, min_pirate_dist_km - 40.0) / 260.0)
        pirate_rate = min(0.075, 0.025 + 0.050 * prox)

    return {
        "real_km": round(total_km),
        "sea_km": round(sea_km),
        "ring_sea_km": round(ring_sea_km),
        "river_km": round(riv_km),
        "highway_km": round(hwy_km),
        "caravan_km": round(trail_km),
        "corridor_km": round(spec_km),
        "ports": ports_used,
        "corridors": corridors_used,
        "gateways": gateways_hit,
        "pirate_rate": pirate_rate,
        "poly_51": poly_51[::max(1, len(poly_51) // 45)] + ([poly_51[-1]] if poly_51 else []),
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
    pirate_sid = next(sid for sid, s in setts.items() if s["name"] == "Noa's Regret")

    # Group settlements by polity
    pol_members = defaultdict(list)
    for sid in sids:
        pol_members[setts[sid]["polity"]].append(sid)

    path_cache = {}

    def fast_eff(sid_a, sid_b, tier):
        ia = sid_to_idx[sid_a]
        dmat = graph["dist_bulk"] if tier == "bulk" else graph["dist_comp"]
        return float(dmat[ia, setts[sid_b]["cell"]])

    def get_pair(sid_a, sid_b, tier):
        key = (sid_a, sid_b, "bulk" if tier == "bulk" else "comp")
        if key not in path_cache:
            ia, ib = sid_to_idx[sid_a], sid_to_idx[sid_b]
            eff = fast_eff(sid_a, sid_b, tier)
            info = analyze_pair_path(world, graph, setts, ia, ib, "bulk" if tier == "bulk" else "comp") if np.isfinite(eff) else None
            path_cache[key] = (eff, info)
        return path_cache[key]

    per_good = {}
    polity_exports = defaultdict(lambda: defaultdict(float))
    polity_imports = defaultdict(lambda: defaultdict(float))
    entrepot_totals = defaultdict(lambda: {"sea_tons": 0.0, "land_tons": 0.0, "flows": 0, "goods": defaultdict(float)})
    pirate_ledger = defaultdict(lambda: {"captured": 0.0, "fenced": 0.0, "victims": defaultdict(float), "buyers": defaultdict(float)})
    rendered_corridors = []  # collected weighted polylines for map visualization

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
            if pol == "Ring Sea Pirates":
                continue  # Pirates don't produce normal goods; handled in Pass 2!
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
                    # Lore bans:
                    # 1. Order of Historians banned from Voth (LORE.md:436)
                    if gid == "books" and s_pol == "Order of Historians" and b_pol == "Vothic Kingdom":
                        w_row.append(0.0)
                        continue
                    # 2. Firearms/rockets barred to Coyote Kingdom north of The Sill
                    if gid == "rockets" and b_pol in ("Coyote Kingdom", "Dilihan Province"):
                        w_row.append(0.0)
                        continue
                    eff_km = fast_eff(s_sid, b_sid, tier)
                    if not np.isfinite(eff_km):
                        w_row.append(0.0)
                        continue
                    # Staple food range cap: <= 240 effective km (~180 km overland OR ~1,100 km by ship!)
                    if gid == "food" and eff_km > 240.0:
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
                    w = s_avail / ((eff_km + 45.0) ** alpha)
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

            for i, (s_sid, _) in enumerate(sellers):
                for j, (b_sid, _) in enumerate(buyers):
                    amt = float(F[i, j])
                    if amt <= 1e-4:
                        continue
                    eff_km, pinfo = get_pair(s_sid, b_sid, tier)
                    # Check Ring Sea pirate interception by Noa's Regret!
                    prate = pinfo["pirate_rate"]
                    taken = amt * prate
                    delivered = amt - taken
                    if taken > 1e-4:
                        captured_pool += taken
                        pirate_ledger[gid]["captured"] += taken
                        pirate_ledger[gid]["victims"][setts[s_sid]["polity"]] += taken
                    raw_flows.append((s_sid, b_sid, delivered, eff_km, pinfo, False))

            # Pass 2: Noa's Regret fences its captured maritime prizes by ship to Ring Sea buyers!
            if captured_pool > 1e-4:
                fence_cands = []
                for b_sid, b_need in buyers:
                    b_pol = setts[b_sid]["polity"]
                    # Pirates fence to coastal/reachable buyers (excluding Voth Ordinator navy blockades on banned books)
                    eff_km, pinfo = get_pair(pirate_sid, b_sid, tier)
                    if np.isfinite(eff_km) and pinfo is not None and pinfo["sea_km"] > 0 and eff_km < 420.0:
                        fence_cands.append((b_sid, b_need / ((eff_km + 35.0) ** 1.2), eff_km, pinfo))
                sw_f = sum(x[1] for x in fence_cands)
                if sw_f > 0:
                    fenced_amt = captured_pool * 0.92  # 8% consumed/lost at Noa's Regret
                    pirate_ledger[gid]["fenced"] += fenced_amt
                    pol_surplus_map["Ring Sea Pirates"] = fenced_amt
                    for b_sid, w_f, eff_km, pinfo in fence_cands:
                        share_f = fenced_amt * (w_f / sw_f)
                        if share_f > 1e-4:
                            pirate_ledger[gid]["buyers"][setts[b_sid]["polity"]] += share_f
                            raw_flows.append((pirate_sid, b_sid, share_f, eff_km, pinfo, True))

        # Tally polity balances, mode shares & entrepot hub volumes
        raw_flows.sort(key=lambda x: x[2], reverse=True)
        tot_flow = sum(x[2] for x in raw_flows)
        mode_km_wt = {"sea": 0.0, "river": 0.0, "highway": 0.0, "caravan": 0.0, "corridor": 0.0}

        for s_sid, b_sid, amt, eff_km, pinfo, is_pirate in raw_flows:
            s_pol, b_pol = setts[s_sid]["polity"], setts[b_sid]["polity"]
            polity_exports[s_pol][gid] += amt
            polity_imports[b_pol][gid] += amt

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

        # Save top 8 flows of each good + top pirate prize-fence lanes for map visualization
        for s_sid, b_sid, amt, eff_km, pinfo, is_pirate in raw_flows[:8]:
            if tot_flow > 0 and amt / tot_flow >= 0.03:
                rendered_corridors.append({
                    "good": gid, "tier": tier, "share": amt / tot_flow,
                    "is_pirate": is_pirate, "poly": pinfo["full_poly"], "modes": pinfo["seg_modes"],
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

        selected_for_table = list(raw_flows[:8])
        if pirate_flows and not any(x[5] for x in selected_for_table[:6]):
            selected_for_table = list(raw_flows[:5]) + [pirate_flows[0]] + list(raw_flows[5:7])

        routes_out = []
        for s_sid, b_sid, amt, eff_km, pinfo, is_pirate in selected_for_table:
            via_parts = []
            if pinfo["ports"]:
                via_parts.append("ports: " + " -> ".join(pinfo["ports"][:3]))
            if pinfo["corridors"]:
                via_parts.append(" + ".join(pinfo["corridors"][:2]))
            elif pinfo["gateways"]:
                mids = [x for x in pinfo["gateways"] if x not in (setts[s_sid]["name"], setts[b_sid]["name"])]
                if mids:
                    via_parts.append("via " + " -> ".join(mids[:3]))
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
                "to_id": b_sid,
                "to": setts[b_sid]["name"],
                "to_polity": setts[b_sid]["polity"],
                "amount": round(amt, 3),
                "km": pinfo["real_km"],
                "effective_km": round(eff_km, 1),
                "mode": dom_mode,
                "sea_km": pinfo["sea_km"],
                "river_km": pinfo["river_km"],
                "via": "; ".join(via_parts) if via_parts else "direct trail",
                "pirate_fenced": is_pirate,
            })

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
                for p, v in prod_pols[:8]
            ],
            "importers": [
                {"polity": p, "deficit": round(v, 2), "share_pct": round(100.0 * v / sum_def, 1),
                 "imported": round(polity_imports[p].get(gid, 0.0), 2)}
                for p, v in imp_pols[:8]
            ],
            "routes": routes_out,
        }

    return {
        "per_good": per_good,
        "polity_exports": polity_exports,
        "polity_imports": polity_imports,
        "entrepot_totals": entrepot_totals,
        "pirate_ledger": pirate_ledger,
        "rendered_corridors": rendered_corridors,
    }


# ---------------------------------------------------------------------------
# 8. Render High-Resolution Multimodal Trade Route Map (1821 x 1723)
# ---------------------------------------------------------------------------
def render_trade_map(world, setts, results, out_jpg):
    OW, OH = world["OW"], world["OH"]
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

    base_img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), mode="RGB").convert("RGBA")
    overlay = Image.new("RGBA", (OW, OH), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    MODE_COLORS = {
        "sea": (64, 218, 255, 165),      # bright cyan shipping lanes
        "river": (52, 238, 178, 175),    # emerald/teal barge rivers & canals
        "highway": (255, 214, 72, 180),  # gold kept Ancient highways
        "corridor": (255, 96, 150, 195), # magenta/crimson tunnels, lifts & high passes
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
        "Farport", "Fulcrum", "Carcosa", "Qoold Lheek", "Jimjam", "Boatmurder",
        "Dilihan", "Ardent", "Roketstad", "Ys", "Tethis", "Nephtos", "Hook",
        "Port Tobin", "Port Goto", "Shell", "Almua", "Zey'danin", "Voth", "Shim",
        "Dalab", "Span", "Ledge", "Nulab", "Tallwalls", "Betun-Sumar",
        "Spirladunon", "Iziz", "Talia", "Verge", "Locus", "Mungo", "Reed",
        "Yuni", "Ostrukh-on-Water", "Spindle Fan", "The Sill (Sam-Lok)",
        "Spider Lake Weirs", "The Gate", "Stair", "Strongbow", "Erehwon",
        "Opal Valley Mines", "Longsong", "Kautoa", "Noa's Regret", "Hetanini Spice Port",
    }

    for sid, s in setts.items():
        x, y = int(s["px"]), int(s["py"])
        nm = s["name"]
        if nm == "Noa's Regret":
            d2.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(240, 50, 50), outline=(255, 255, 255), width=2)
        elif nm in MAJOR_LABELS:
            col = (80, 225, 255) if s.get("water_cell") is not None else (255, 220, 110)
            d2.ellipse((x - 4, y - 4, x + 4, y + 4), fill=col, outline=(20, 20, 20), width=1)
        else:
            d2.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(215, 215, 215))

    for sid, s in setts.items():
        nm = s["name"]
        if nm in MAJOR_LABELS:
            x, y = int(s["px"]) + 6, int(s["py"]) - 8
            d2.text((x + 1, y + 1), nm, fill=(10, 12, 16), font=font)
            tcol = (255, 130, 130) if nm == "Noa's Regret" else (248, 246, 236)
            d2.text((x, y), nm, fill=tcol, font=font)

    # Legend box (bottom-left)
    lx, ly = 28, OH - 188
    d2.rectangle((lx, ly, lx + 470, OH - 24), fill=(18, 24, 34), outline=(120, 140, 165), width=2)
    d2.text((lx + 14, ly + 10), "KRATOR 5.1 MULTIMODAL TRADE NETWORK (gemini-trade)", fill=(255, 240, 190), font=font_b)
    legend_rows = [
        ((64, 212, 255), "Sea Shipping Lanes (Ring Sea & Farside Ocean)"),
        ((52, 235, 178), "Navigable Rivers, Lakes & Eternian Canals"),
        ((255, 210, 72), "Kept Ancient 30 m Highways"),
        ((255, 148, 66), "Overland Caravan Trunks (Camels / Lizards / Ostriches)"),
        ((255, 92, 140), "Tunnels, Cliff Lifts, Lava Tubes & Thin-Air Passes"),
        ((240, 60, 60), "Noa's Regret Pirate Prize Fence Lanes"),
    ]
    for idx_l, (c_rgb, lbl_txt) in enumerate(legend_rows):
        ry = ly + 38 + idx_l * 20
        d2.line([(lx + 16, ry + 8), (lx + 52, ry + 8)], fill=c_rgb, width=4)
        d2.text((lx + 64, ry), lbl_txt, fill=(230, 235, 242), font=font)

    comp.save(out_jpg, quality=90)
    print("Saved trade map:", out_jpg)


# ---------------------------------------------------------------------------
# 9. Write JSON & Repo Summary Doc (100% Additive on gemini-trade)
# ---------------------------------------------------------------------------
def main():
    world = load_world()
    setts = build_settlements(world)
    populate_supply_demand(world, setts)
    graph = build_multimodal_graphs(world, setts)
    res = solve_trade(world, setts, graph)

    out_jpg = os.path.join(ROOT, "openworld", "trade-routes-gemini.jpg")
    render_trade_map(world, setts, res, out_jpg)

    # Assemble polity summary
    pol_summary = {}
    pol_members = defaultdict(list)
    for sid, s in setts.items():
        pol_members[s["polity"]].append(s)

    for pol, members in sorted(pol_members.items()):
        exps = sorted(res["polity_exports"][pol].items(), key=lambda kv: kv[1], reverse=True)
        imps = sorted(res["polity_imports"][pol].items(), key=lambda kv: kv[1], reverse=True)
        pol_summary[pol] = {
            "polity": pol,
            "settlement_count": len(members),
            "population": sum(m["population"] for m in members),
            "settlements": [m["name"] for m in sorted(members, key=lambda x: -x["population"])],
            "top_exports": [{"good": g, "amount": round(v, 2), "unit": GOOD_BY_ID[g]["unit"]} for g, v in exps[:10] if v > 0.01],
            "top_imports": [{"good": g, "amount": round(v, 2), "unit": GOOD_BY_ID[g]["unit"]} for g, v in imps[:10] if v > 0.01],
        }

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
        "version": 1,
        "date": "2026-11-12",
        "map": "5.1",
        "branch": "gemini-trade",
        "settlement_count": len(setts),
        "polity_count": len(pol_summary),
        "good_count": len(GOODS),
        "entrepots": entrepots[:25],
        "noas_regret_piracy": pirates_out,
        "polities": pol_summary,
        "per_good": res["per_good"],
    }
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"Saved JSON: {out_json} ({len(GOODS)} goods, {len(pol_summary)} polities, {len(setts)} settlements)")


if __name__ == "__main__":
    main()
