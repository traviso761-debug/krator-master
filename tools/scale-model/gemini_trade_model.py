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

    rs = json.load(open(os.path.join(ROOT, "openworld", "resources-settlements.json"), encoding="utf-8"))
    tg = json.load(open(os.path.join(ROOT, "openworld", "trade-goods.json"), encoding="utf-8"))
    ar = json.load(open(os.path.join(ROOT, "openworld", "ancient-roads-draft.json"), encoding="utf-8"))
    gr = json.load(open(os.path.join(ROOT, "openworld", "gods-road.json"), encoding="utf-8"))
    net51_path = os.path.join(ROOT, "openworld", "net51-gemini.json")
    net51 = json.load(open(net51_path, encoding="utf-8")) if os.path.exists(net51_path) else None

    return {
        "D": D, "OW": OW, "OH": OH, "GW": GW, "GH": GH,
        "E2": E2, "W2": W2, "E": E, "W": W, "TM": TM, "RAIN": RAIN,
        "layers": layers, "regs": regs, "rs": rs, "tg": tg, "ar": ar, "gr": gr, "net51": net51,
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
    # Painted Men canyon cliff-hold (TRADE-SCOPE s7.6: occasional neighbor raiders; small mineral/plant dye & medicine trade)
    {"name": "Painted Canyon Cliff-Hold", "px": 1055, "py": 622, "type": "village", "population": 650, "polity": "Painted Men", "reach_km": 15},
    # Parabola solar-furnace Bowl arcology (ANCIENT-NETWORK.md s8.11: Izani customs post, caravanserai & mirror-glass scree prospectors)
    {"name": "Parabola", "px": 970, "py": 1186, "type": "outpost", "population": 450, "polity": "Empire of Iziz", "reach_km": 12},
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
    {"id": "zinc", "label": "zinc & brass spelter", "class": "metal", "tier": "medium", "unit": "t", "note": "sphalerite ore & brass spelter for Roketstad optics, naval instruments & fittings"},
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
    {"id": "electrics", "label": "Geomancer generators, lamps & wire", "class": "specialty", "tier": "compact", "unit": "unit", "note": "Yuni & Locus Geomancer dynamos, arc-lamps & insulated wire"},
    {"id": "energy-cells", "label": "Ancient energy cells", "class": "specialty", "tier": "compact", "unit": "unit", "note": "sealed-vault Ancient power cells from Valley of the Ancient (via Yusar) & Stair; strong Eternian demand"},
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
        dem["zinc"] = (0.38 if pol in ("Iron Republic", "Eternal State", "Empire of Iziz", "Yuni Emirate", "Yusar (Cybernetics)") else 0.14) * kpop
        if nm == "Roketstad":
            dem["zinc"] = max(dem["zinc"], 8.5)  # brass telescope & sextant barrels!
        if gs.get("zinc_max", 0) >= 95 and pol not in ("Lizardmen", "Ring Sea Pirates"):
            sup["zinc"] = max(sup.get("zinc", 0.0), gs["zinc"] * 0.065 * (0.6 + 0.4 * min(kpop, 3.0)))
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
        if pol == "Eternal State":
            dem["energy-cells"] = 0.28 * kpop  # Eternal State high demand, sourced mostly from Valley of the Ancient via Yusar!
            if nm == "Veil":
                sup["energy-cells"] = 0.6      # minor State rim recovery
        elif pol in ("Realm of Dalab", "Empire of Iziz", "Iron Republic", "Yuni Emirate", "Xanadu Sultanate", "Tungang Union"):
            dem["energy-cells"] = 0.052 * kpop
        else:
            dem["energy-cells"] = 0.0
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
            # Harvests sealed-vault Ancient energy cells from adjacent Valley of the Ancient (primary supplier to Eternal State!)
            sup["energy-cells"] = 16.5 if nm == "Carcosa" else 8.5
            dem["energy-cells"] = 2.4 if nm == "Carcosa" else 1.2
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
            sup["energy-cells"] = 5.5  # charged Ancient energy cells from sealed Catch tunnel
            sup["electrics"] = 1.2     # salvaged tunnel switchgear & lamps
            sup["relics"] = 2.2        # uncorroded tunnel artifacts
            sup["nickel"] = 4.5        # preserved alloys
            sup["food"] = 10.0         # oasis dates only; imports food!

        if nm == "Longsong":
            sup["energy-cells"] = 1.4  # Order vault-recovered Ancient cells
            dem["energy-cells"] = 0.2

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
            sup["timber"] = max(sup.get("timber", 0.0), 1650.0)  # Dam-rim driftwood & conifer salvage

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

    # Blocked, wartime & raider-hazard polygons:
    #   - Autarkic hostile raiders (0 external trade): Lizardman Rift & Screamer Country
    #   - State of War (mutual port/land closure, naval commerce raids, smuggler/intermediary trade only): Empire of Iziz (+ Shell) <-> Vothic Kingdom
    #   - Hostile marches (raids common, few Iziz caravans cross): Beast Riders <-> Empire of Iziz
    #   - Fraught hostile frontier (0 direct bilateral trade with Eternal State): Yeti Kingdom
    #   - Neighbor-raiding & bandit groups: Painted Men, Fellgangs, Lizardmen border raids, Scyvoi,
    #     Vrivolci (raid Dalab & Voth), Boatmurder highwaymen (NE highways), SW Highlanders (raid neighbors except Dalab peace treaty),
    #     Coyotemen <-> Eastern Nomads border raids, and Eastern Nomad desert-crossing caravan bandits.
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
    mask_vrivolci_poly = poly_mask(world["regs"], {"vrivolci"}, GW, GH, OW, OH)
    mask_swhigh_poly = poly_mask(world["regs"], {"sw highlands"}, GW, GH, OW, OH)
    mask_beastrider_raw = poly_mask(world["regs"], {"hyperjungle n", "savage hyperjungle"}, GW, GH, OW, OH)
    mask_dam_ne = poly_mask(world["regs"], {"dam", "dam 2", "n semiarid"}, GW, GH, OW, OH)
    mask_coyote_full = poly_mask(world["regs"], {"coyote kingdom", "n outlands", "s outlands"}, GW, GH, OW, OH) & (~W)
    mask_nomad_full = poly_mask(world["regs"], {"nomad country", "e abyss", "e abysss", "e badlands"}, GW, GH, OW, OH) & (~W)
    mask_desert_polys = poly_mask(
        world["regs"],
        {"nomad country", "the bowl", "the catch", "e abyss", "e abysss", "e badlands", "sedesert"},
        GW, GH, OW, OH,
    )

    yy_g, xx_g = np.mgrid[0:GH, 0:GW]
    px_g, py_g = xx_g / su, yy_g / sv

    # 1. Lizardman core Rift floor (impassably hostile to human merchants) vs border raid belts into Xanadu & S Dalab/Fellgangs
    xanadu_core = (px_g >= 792.0) & (px_g <= 1050.0) & (py_g >= 1495.0) & (py_g <= 1625.0) & (~W)
    mask_lizard_hostile = (
        mask_lizard_poly | (ndimage.binary_dilation(mask_lizard_poly, iterations=5) & (E < 1400.0))
    ) & (~xanadu_core)
    for sid_lz, s_lz in setts.items():
        if s_lz["polity"] == "Lizardmen":
            li, lj = int(round(s_lz["px"] * su)), int(round(s_lz["py"] * sv))
            mask_lizard_hostile |= (((xx_g - li) ** 2 + (yy_g - lj) ** 2) <= 7 ** 2) & (E < 1400.0) & (~xanadu_core)

    # LORE.md s6.20: Xanadu's vigilance is waning and Lizardman raids reach the Vale; also occasional raids into S Dalab/Fellgangs
    mask_lizard_raid_xanadu = (
        mask_vale_xanadu | ((px_g >= 775.0) & (px_g <= 965.0) & (py_g >= 1485.0) & (py_g <= 1625.0))
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
    # Unescorted overland approach to ruined Port Visas (skirts Screamer wood & Scyvoi raiders unless guarded by Iziz!)
    mask_visas_unescorted = ((px_g >= 752.0) & (px_g <= 816.0) & (py_g >= 668.0) & (py_g <= 724.0)) & (~W)

    # 3. Yeti frontier & northern Eternian / Farside raid belt
    mask_yeti_raid = (mask_yeti_poly | ndimage.binary_dilation(mask_yeti_poly, iterations=4)) & (~W)

    # 4. Painted Men plateau & occasional neighbor-raiding halo (Pinnacle Rock, Korona, Free Clans, NW Nomad Country)
    mask_painted_core = mask_painted_poly & (~W)
    mask_painted_halo = (ndimage.binary_dilation(mask_painted_poly, iterations=5) & (~mask_painted_poly)) & (~W)

    # 5. Fellgang highland raider tribes & southern Dalab border halo
    mask_fellgang_core = mask_fellgang_poly & ((py_g >= 1368.0) | (E > 1800.0)) & (~W)
    mask_fellgang_halo = (ndimage.binary_dilation(mask_fellgang_poly, iterations=4) & (~mask_fellgang_core)) & (~W)

    # 6. Scyvoi drylands & lowland neighbor-raiding belt (League poleis, S Cut/Dilihan, N Voth/Drum/Tzunfort)
    mask_scyvoi_core = mask_scyvoi_poly & (~W)
    mask_scyvoi_halo = (ndimage.binary_dilation(mask_scyvoi_poly, iterations=5) & (~mask_scyvoi_poly) & (E < 950.0)) & (~W)

    # 7. Beast Riders (hyperjungle n & savage hyperjungle: hostile to Iziz, raids common, few Iziz caravans cross)
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

    # 9. Boatmurder Bandits — highwaymen on the NE highways (Dam Basin, Serai, Ardent N marches & N Semiarid trunks)
    ne_hwy_box = (px_g >= 690.0) & (px_g <= 1195.0) & (py_g >= 350.0) & (py_g <= 525.0)
    mask_boatmurder_bandits = (mask_dam_ne | ne_hwy_box) & (~W)

    # 10. SW Highlanders (SW Highland Frogmen) raiding neighbors EXCEPT Realm of Dalab (peace treaty via Span!)
    span_safe = ((xx_g - int(round(554 * su))) ** 2 + (yy_g - int(round(1010 * sv))) ** 2) <= 4 ** 2
    mask_swhigh_core = (mask_swhigh_poly & (~span_safe)) & (~W)
    mask_swhigh_halo = (
        ndimage.binary_dilation(mask_swhigh_poly, iterations=6) & (~mask_swhigh_poly) & (~mask_dalab_poly) & (~span_safe)
    ) & (~W)

    # 11. Coyotemen <-> Eastern Nomads border raids & Eastern Nomad desert-crossing caravan bandits
    mask_coyote_nomad_raid = ndimage.binary_dilation(mask_coyote_full, iterations=6) & ndimage.binary_dilation(mask_nomad_full, iterations=6) & (~W)
    mask_nomad_desert_bandits = (mask_desert_polys & (RAIN < 320.0)) & (~W)

    # Cold/airless N Rift Rim & SW Highlands barrier (severs Tallwalls <-> Erehwon & N Rift-rim grid shortcuts west of Stair;
    # the once-a-year Annual Great Caravan traverses the North Rift Bench via explicit SPECIAL_CORRIDORS)
    erehwon_pocket = (px_g >= 796.0) & (px_g <= 825.0) & (py_g >= 1506.0) & (py_g <= 1528.0)
    mask_north_rift_barrier = ((px_g >= 468.0) & (px_g <= 1022.0) & (py_g >= 1318.0) & (py_g <= 1509.0)) & (~erehwon_pocket)
    # Harsh S Rift Rim / W-Central Rift barrier (blocks unescorted southern Rift crossings where Lizardmen + Fellgangs raid)
    mask_south_rift_barrier = (px_g >= 468.0) & (px_g <= 788.0) & (py_g >= 1509.0) & (py_g <= 1722.0)

    # Rasterize native 5.1 road network from claude/ancient-network-9cc3e7 (openworld/net51-gemini.json) + God's Road
    road_mult = np.ones((GH, GW), dtype=np.float32)
    net_eng = np.zeros((GH, GW), dtype=bool)
    dx_leg, dy_leg = LEGACY_SHIFT

    SKIP_NET51_IDS = {
        "rift.chimes-cthonos", "rift.cthonos-tubes", "rift.tubes-pile", "rift.pile-theodiga",
        "rift.theodiga-strongbow", "rift.bowl.theodiga-stair", "ext.southwest",
    }
    CLASS_UP_MULT = {
        "trunk": {"kept": 0.55, "partly": 0.72, "shoddy": 0.76, "lapsed": 0.86, "decayed": 0.95},
        "line": {"kept": 0.56, "partly": 0.72, "shoddy": 0.76, "lapsed": 0.86, "decayed": 0.95},
        "branch": {"kept": 0.58, "partly": 0.74, "shoddy": 0.78, "lapsed": 0.87, "decayed": 0.95},
        "izani": {"kept": 0.62, "partly": 0.75, "shoddy": 0.78, "lapsed": 0.88, "decayed": 0.96},
        "vothic": {"kept": 0.62, "partly": 0.75, "shoddy": 0.78, "lapsed": 0.88, "decayed": 0.96},
        "trade": {"kept": 0.66, "partly": 0.76, "shoddy": 0.80, "lapsed": 0.88, "decayed": 0.96},
        "xanadu": {"kept": 0.66, "partly": 0.76, "shoddy": 0.80, "lapsed": 0.88, "decayed": 0.96},
        "yuni": {"kept": 0.66, "partly": 0.76, "shoddy": 0.80, "lapsed": 0.88, "decayed": 0.96},
    }
    DEFAULT_UP_MULT = {"kept": 0.78, "partly": 0.84, "shoddy": 0.86, "lapsed": 0.88, "decayed": 0.93}

    if world.get("net51"):
        for r in world["net51"].get("routes", []):
            if r.get("id") in SKIP_NET51_IDS:
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
    # Note: Hostile Lizardman & Screamer settlements never host external ships or barges!
    port_links = []
    for sid, s in setts.items():
        c = cell_of(s["px"], s["py"])
        s["cell"] = c
        if s["polity"] in ("Lizardmen", "Screamer Country"):
            s["water_cell"] = None
            s["is_ring_sea_port"] = False
            continue
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
            port_links.append((c, N_CELL + best_w[1], s["name"], s["polity"]))
        else:
            s["water_cell"] = None
            s["is_ring_sea_port"] = False

    # Engineered corridors, tunnels, lifts & mountain passes aligned with claude/ancient-network-9cc3e7 (ANCIENT-NETWORK.md)
    SPECIAL_CORRIDORS = [
        ("Tungang Rift-Line Train Bore", 477, 1108, 461, 1161, 115, 58.0, 72.0),
        ("Tungang Deep Hot Bore (>100 C)", 461, 1161, 457, 1269, 215, 108.0, 138.0),
        ("Tungang South Bore", 457, 1269, 437, 1330, 125, 68.0, 85.0),
        ("Loj Fower Cliff Lifts (Ledge-Nulab)", 437, 1330, 443, 1359, 60, 68.0, 54.0),
        ("Span Basin Tunnel", 477, 1108, 554, 1010, 240, 185.0, 155.0),
        ("Inner Wall Karst Tunnel (Drum-Cascade)", 673, 932, 568, 841, 275, 445.0, 250.0),
        ("Verge 16-Hairpin Scarp", 1240, 960, 1268, 949, 60, 115.0, 75.0),
        # Bowl solar-furnace arcology Parabola & Godsgate way (Eastern Nomad desert-bandit risk on arid Bowl/Catch crossings)
        ("Bowl Solar Road (Arcbeam-Parabola)", 1016, 1058, 970, 1186, 308, 295.0, 226.0),
        ("Izani Bowl Spur (Mantis-Parabola)", 1113, 1164, 970, 1186, 315, 308.0, 236.0),
        ("Godsgate Way N (Parabola-Bab al-Hawa)", 970, 1186, 1028, 1246, 175, 238.0, 174.0),
        ("Godsgate & Bab al-Hawa (Mantis-Godsgate)", 1113, 1164, 1028, 1246, 235, 320.0, 228.0),
        ("Catch North Oases (Godsgate-Arfwai)", 1028, 1246, 1038, 1324, 172, 240.0, 175.0),
        ("Catch Mid Oasis (Arfwai-Stair)", 1038, 1324, 1106, 1442, 278, 382.0, 274.0),
        ("Dasri Bowl-Catch Oasis Trail", 1219, 1148, 1038, 1324, 480, 675.0, 480.0),
        # Three Catch-Xanadu crossings (ANCIENT-NETWORK.md s8.16): The Twins, White Gills, & Theodiga-Stair dark dead bore (no trains)
        ("The Twins Lava-Tube & Steam Pass", 1106, 1442, 1042, 1525, 215, 290.0, 192.0),
        ("Twins-Strongbow Descent", 1042, 1525, 1001, 1596, 165, 220.0, 148.0),
        ("White Gills Breath-Pass (Stair-Gills)", 1106, 1442, 1035, 1535, 235, 340.0, 215.0),
        ("White Gills Descent (Gills-Strongbow)", 1035, 1535, 1001, 1596, 140, 210.0, 130.0),
        ("Theodiga-Stair Dead Bore E (Stair-Mid Bore)", 1106, 1442, 1006, 1490, 219, float("inf"), 225.0),
        ("Theodiga-Stair Dead Bore W (Mid Bore-Theodiga)", 1006, 1490, 908, 1535, 219, float("inf"), 225.0),
        # Strongbow 3,100 m scarp elevator + Vale of Xanadu roads (Lizardman raid hazard) + Oidong Valley floor road (xanadu.3.5)
        ("Strongbow Scarp Elevator & Vale Road (Strongbow-Qiblai)", 1001, 1596, 922, 1595, 166, 195.0, 148.0),
        ("Vale of Xanadu Road (Qiblai-Theodiga)", 922, 1595, 908, 1535, 126, 145.0, 112.0),
        ("Vale of Xanadu Royal Road (Theodiga-Erehwon)", 908, 1535, 805, 1516, 212, 248.0, 196.0),
        ("Vale South Road (Qiblai-Erehwon)", 922, 1595, 805, 1516, 282, 315.0, 242.0),
        ("Oidong Valley Road W (Strongbow-Mid Oidong)", 1001, 1596, 1111, 1602, 224, 245.0, 185.0),
        ("Oidong Valley Road E (Mid Oidong-Longsong)", 1111, 1602, 1229, 1621, 245, 268.0, 202.0),
        # Once-a-year Annual Great Caravan routed along the NORTH side of the Rift (above Lizardman floor, avoiding S Dalab/Fellgang/Lizardman raids)
        ("Annual Great Caravan N1 (Nulab-North Rift W Bench)", 443, 1359, 520, 1402, 180, float("inf"), 305.0),
        ("Annual Great Caravan N2 (North Rift Mid-W Terrace)", 520, 1402, 565, 1411, 98, float("inf"), 165.0),
        ("Annual Great Caravan N3 (North Rift Central Bench)", 565, 1411, 640, 1447, 172, float("inf"), 290.0),
        ("Annual Great Caravan N4 (North Rift East Shoulder)", 640, 1447, 720, 1501, 198, float("inf"), 330.0),
        ("Annual Great Caravan N5 (North Rift-West Vale Gate)", 720, 1501, 775, 1504, 115, float("inf"), 192.0),
        ("Annual Great Caravan N6 (West Vale Gate-Erehwon)", 775, 1504, 805, 1516, 68, float("inf"), 115.0),
        ("Talovolci Cliff-Lung Stairs (Torus-Spirladunon)", 777, 1005, 800, 1017, 52, 190.0, 82.0),
        ("Yeti Winter Pycrete Road (Qoold Lheek-Leng)", 410, 506, 490, 554, 185, 290.0, 185.0),
        ("Yeti North Rim Trail W (Leng-West Dam)", 490, 554, 575, 475, 215, 255.0, 185.0),
        ("Yeti North Rim Trail Mid (West Dam-Mid Dam)", 575, 475, 665, 435, 195, 220.0, 160.0),
        ("Yeti North Rim Trail E (Mid Dam-Boatmurder)", 665, 435, 766, 404, 212, 285.0, 208.0),
        ("Outland Gate & Hau-Gel Trough", 1288, 220, 1368, 272, 195, 180.0, 152.0),
        ("Hau-Gel Narrows to The Gate", 1368, 272, 1438, 326, 175, 160.0, 138.0),
        ("Tierhound Seed-Law Gate (Gate-Gate Tarn)", 1438, 326, 1544, 474, 365, 380.0, 310.0),
        ("SW Spillway & Arachnoid Gorge (Spider Lake-Ham-Tsek)", 1288, 220, 1055, 219, 466, 510.0, 370.0),
        ("Korona Guided Silk River (Ham-Tsek-K6-K1)", 1055, 219, 1006, 340, 265, 295.0, 215.0),
        ("Korona Ring Trail (K6-K1)", 1006, 340, 952, 423, 198, 220.0, 162.0),
        ("Korona West Descent (K1-Serai)", 952, 423, 826, 478, 275, 385.0, 298.0),
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

    # Armed Iziz-guarded caravan corridor between Dilihan and Port Visas along izani.dilihan-portvisas (152 km skirting Screamer wood;
    # Iziz's preferred lifeline to Dilihan, somewhat dangerous & costly due to guard escorts; unavailable to non-Iziz traders)
    IZIZ_VISAS_CORRIDORS = [
        ("Iziz-Guarded Visas Caravan W (Dilihan-Screamer Fringe)", 744, 663, 768, 686, 76, 122.0, 96.0),
        ("Iziz-Guarded Visas Caravan E (Screamer Fringe-Port Visas)", 768, 686, 800, 712, 76, 118.0, 94.0),
    ]

    idx = np.arange(N_CELL).reshape(GH, GW)

    def make_csr(sea_mult, riv_mult, road_scale, trail_mult, port_fee, use_bulk, regime="std"):
        rows, cols, costs = [], [], []
        is_iziz_reg = regime in ("iziz", "iziz_visas")
        is_voth_reg = regime == "voth"
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
            # Kept / partly-kept Ancient road & engineered viaducts/cuts/tunnels override steep local micro-relief
            eng_edge = net_eng.flat[a] | net_eng.flat[b]
            g_road = np.where(eng_edge, np.minimum(g, 0.045), g)
            c_road = d_km * rm * road_scale * (1.0 + 0.4 * (g_road / 0.08) ** 2)
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

            # Hostile autarkic Lizardman Rift & Screamer Country raid zones
            liz = mask_lizard_hostile.flat[a] | mask_lizard_hostile.flat[b]
            c_land = np.where(liz, c_land * (9.5 if use_bulk else 8.2), c_land)
            scr = mask_screamer_hostile.flat[a] | mask_screamer_hostile.flat[b]
            c_land = np.where(scr, c_land * (8.5 if use_bulk else 7.5), c_land)
            if regime != "iziz_visas":
                vis_un = mask_visas_unescorted.flat[a] | mask_visas_unescorted.flat[b]
                c_land = np.where(vis_un, c_land * (5.2 if use_bulk else 4.6), c_land)

            # Wartime land border blocks (Iziz <-> Voth in a state of war)
            if is_iziz_reg:
                voth_blk = mask_voth_poly.flat[a] | mask_voth_poly.flat[b]
                c_land = np.where(voth_blk, c_land * 9.5, c_land)
            elif is_voth_reg:
                iz_blk = mask_iziz_poly.flat[a] | mask_iziz_poly.flat[b] | mask_shell_poly.flat[a] | mask_shell_poly.flat[b]
                c_land = np.where(iz_blk, c_land * 9.5, c_land)

            # Neighbor-raiding & bandit hazard surcharges (raise danger & shift flows without blocking trade)
            yeti_r = mask_yeti_raid.flat[a] | mask_yeti_raid.flat[b]
            c_land = np.where(yeti_r, c_land * (2.15 if use_bulk else 1.85), c_land)

            pm_c = mask_painted_core.flat[a] | mask_painted_core.flat[b]
            pm_h = (mask_painted_halo.flat[a] | mask_painted_halo.flat[b]) & (~pm_c)
            c_land = np.where(pm_c, c_land * (2.25 if use_bulk else 1.95), c_land)
            c_land = np.where(pm_h, c_land * (1.45 if use_bulk else 1.35), c_land)

            fg_c = mask_fellgang_core.flat[a] | mask_fellgang_core.flat[b]
            fg_h = (mask_fellgang_halo.flat[a] | mask_fellgang_halo.flat[b]) & (~fg_c)
            c_land = np.where(fg_c, c_land * (1.95 if use_bulk else 1.75), c_land)
            c_land = np.where(fg_h, c_land * (1.42 if use_bulk else 1.32), c_land)

            lz_xan = mask_lizard_raid_xanadu.flat[a] | mask_lizard_raid_xanadu.flat[b]
            c_land = np.where(lz_xan, c_land * (1.55 if use_bulk else 1.42), c_land)
            lz_dal = mask_lizard_raid_dalab.flat[a] | mask_lizard_raid_dalab.flat[b]
            c_land = np.where(lz_dal, c_land * (1.35 if use_bulk else 1.28), c_land)

            scy_c = mask_scyvoi_core.flat[a] | mask_scyvoi_core.flat[b]
            scy_h = (mask_scyvoi_halo.flat[a] | mask_scyvoi_halo.flat[b]) & (~scy_c)
            c_land = np.where(scy_c, c_land * (1.75 if use_bulk else 1.55), c_land)
            c_land = np.where(scy_h, c_land * (1.38 if use_bulk else 1.28), c_land)

            # Beast Riders: hostile to Iziz (raids common — few Iziz caravans cross their territory)
            br_c = mask_beastrider_core.flat[a] | mask_beastrider_core.flat[b]
            br_h = (mask_beastrider_halo.flat[a] | mask_beastrider_halo.flat[b]) & (~br_c)
            if is_iziz_reg:
                c_land = np.where(br_c, c_land * (5.6 if use_bulk else 4.8), c_land)
            else:
                c_land = np.where(br_c, c_land * (1.35 if use_bulk else 1.28), c_land)
            c_land = np.where(br_h, c_land * (1.42 if use_bulk else 1.32), c_land)

            # Vrivolci Giants raiding Dalab & Voth
            vr_c = mask_vrivolci_core.flat[a] | mask_vrivolci_core.flat[b]
            vr_h = (mask_vrivolci_halo.flat[a] | mask_vrivolci_halo.flat[b]) & (~vr_c)
            c_land = np.where(vr_c, c_land * (1.75 if use_bulk else 1.58), c_land)
            c_land = np.where(vr_h, c_land * (1.38 if use_bulk else 1.30), c_land)

            # Boatmurder highwaymen ambushing the NE highways
            bm_b = mask_boatmurder_bandits.flat[a] | mask_boatmurder_bandits.flat[b]
            c_land = np.where(bm_b & has_road, c_land * (1.62 if use_bulk else 1.72), c_land)
            c_land = np.where(bm_b & (~has_road), c_land * (1.35 if use_bulk else 1.40), c_land)

            # SW Highlanders raiding neighbors EXCEPT Realm of Dalab (peace treaty)
            swh_c = mask_swhigh_core.flat[a] | mask_swhigh_core.flat[b]
            swh_h = (mask_swhigh_halo.flat[a] | mask_swhigh_halo.flat[b]) & (~swh_c)
            c_land = np.where(swh_c, c_land * (1.72 if use_bulk else 1.55), c_land)
            c_land = np.where(swh_h, c_land * (1.42 if use_bulk else 1.32), c_land)

            # Coyotemen <-> Eastern Nomads border raids & Eastern Nomad desert-crossing caravan bandits
            cn_r = mask_coyote_nomad_raid.flat[a] | mask_coyote_nomad_raid.flat[b]
            c_land = np.where(cn_r, c_land * (1.42 if use_bulk else 1.35), c_land)
            nd_b = mask_nomad_desert_bandits.flat[a] | mask_nomad_desert_bandits.flat[b]
            c_land = np.where(nd_b, c_land * (1.38 if use_bulk else 1.42), c_land)

            # Altitude hypoxia, cold/airless N Rift Rim barrier (Tallwalls-Erehwon impassable), & S Rift Rim unescorted block
            emax = np.maximum(ea, eb)
            high = emax > 4200.0
            c_land = np.where(high, c_land * (1.0 + ((np.maximum(emax, 4200.0) - 4200.0) / 1700.0) ** 2), c_land)
            rift_bar = (
                mask_north_rift_barrier.flat[a] | mask_north_rift_barrier.flat[b]
                | mask_south_rift_barrier.flat[a] | mask_south_rift_barrier.flat[b]
            )
            ring_w = is_ring_sea.flat[a] | is_ring_sea.flat[b]
            impass = (emax > 7500.0) | mask_valley.flat[a] | mask_valley.flat[b] | rift_bar | (wa & wb) | ring_w
            # Narrow 1-cell inland river/lake fords allowed on land at high bridge cost; ALL Ring Sea water blocked on Layer 0!
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
                liz_w = mask_lizard_hostile.flat[a[nwa]] | mask_lizard_hostile.flat[b[nwa]]
                cw = np.where(liz_w, cw * 10.0, cw)
                if is_iziz_reg or is_voth_reg:
                    # Iziz & Voth raid each other's Ring Sea shipping (convoy / privateer risk surcharge)
                    rs_w = is_ring_sea.flat[a[nwa]] | is_ring_sea.flat[b[nwa]]
                    cw = np.where(rs_w, cw * 1.18, cw)
                rows += [aw, bw]
                cols += [bw, aw]
                costs += [cw, cw]

        # Port break-of-bulk transfer edges (Layer 0 <-> Layer 1 ONLY at ports!)
        for c_land_idx, c_wat_idx, p_name, p_pol in port_links:
            pf = port_fee
            if is_iziz_reg and p_pol == "Vothic Kingdom":
                pf = np.inf  # Enemy ports closed during Iziz-Voth war
            elif is_voth_reg and p_pol in ("Empire of Iziz", "Shell Province"):
                pf = np.inf  # Enemy ports closed during Iziz-Voth war
            elif p_name == "Port Visas":
                # Ruined quays kept operational for Iziz convoys; non-Iziz ships avoid ruined Screamer-fringe quays for Hykkousoi ports!
                pf = (port_fee - 2.0) if regime == "iziz_visas" else ((port_fee + 8.0) if regime == "iziz" else 165.0)
            elif regime == "iziz_visas" and p_pol.startswith("League:") and p_name != "Nephtos":
                # LORE.md s6.2 & s6.16: Hykkousoi League wary of Izani imperial supply/reunification columns crossing League ports to Dilihan
                pf = port_fee + 175.0
            elif is_voth_reg and p_pol.startswith("League:"):
                # Voth and Hykkousoi are commercial rivals & discourage each other's shipping
                pf = port_fee + 58.0
            if not np.isfinite(pf):
                continue
            rows += [np.array([c_land_idx, c_wat_idx])]
            cols += [np.array([c_wat_idx, c_land_idx])]
            costs += [np.array([pf, pf], dtype=np.float64)]

        # Engineered tunnels, lifts & pass corridors on Layer 0 (+ Iziz-guarded Visas caravan on iziz_visas graph)
        corridor_list = SPECIAL_CORRIDORS + (IZIZ_VISAS_CORRIDORS if regime == "iziz_visas" else [])
        for cname, x0, y0, x1, y1, _, b_eq, c_eq in corridor_list:
            eq = b_eq if use_bulk else c_eq
            if not np.isfinite(eq):
                continue
            if is_iziz_reg and cname == "God's Road North (Pinnacle-Ria)":
                eq *= 3.8  # Originates at Beast Rider capital Pinnacle Rock — hostile raids on Iziz caravans!
            u = cell_of(*snap_to_land(world, x0, y0))
            v = cell_of(*snap_to_land(world, x1, y1))
            rows += [np.array([u, v])]
            cols += [np.array([v, u])]
            costs += [np.array([eq, eq], dtype=np.float64)]

        r_all = np.concatenate(rows)
        c_all = np.concatenate(cols)
        v_all = np.concatenate(costs)
        return coo_matrix((v_all, (r_all, c_all)), shape=(2 * N_CELL, 2 * N_CELL)).tocsr()

    G_bulk = make_csr(sea_mult=0.16, riv_mult=0.34, road_scale=1.15, trail_mult=1.35, port_fee=26.0, use_bulk=True, regime="std")
    G_comp = make_csr(sea_mult=0.28, riv_mult=0.45, road_scale=1.00, trail_mult=1.00, port_fee=22.0, use_bulk=False, regime="std")
    G_iziz_bulk = make_csr(sea_mult=0.16, riv_mult=0.34, road_scale=1.15, trail_mult=1.35, port_fee=26.0, use_bulk=True, regime="iziz")
    G_iziz_comp = make_csr(sea_mult=0.28, riv_mult=0.45, road_scale=1.00, trail_mult=1.00, port_fee=22.0, use_bulk=False, regime="iziz")
    G_izv_bulk = make_csr(sea_mult=0.16, riv_mult=0.34, road_scale=1.15, trail_mult=1.35, port_fee=26.0, use_bulk=True, regime="iziz_visas")
    G_izv_comp = make_csr(sea_mult=0.28, riv_mult=0.45, road_scale=1.00, trail_mult=1.00, port_fee=22.0, use_bulk=False, regime="iziz_visas")
    G_voth_bulk = make_csr(sea_mult=0.16, riv_mult=0.34, road_scale=1.15, trail_mult=1.35, port_fee=26.0, use_bulk=True, regime="voth")
    G_voth_comp = make_csr(sea_mult=0.28, riv_mult=0.45, road_scale=1.00, trail_mult=1.00, port_fee=22.0, use_bulk=False, regime="voth")

    sids = sorted(setts.keys())
    src_cells = [setts[sid]["cell"] for sid in sids]
    iziz_sids = [sid for sid in sids if setts[sid]["polity"] in ("Empire of Iziz", "Shell Province")]
    iziz_cells = [setts[sid]["cell"] for sid in iziz_sids]
    voth_sids = [sid for sid in sids if setts[sid]["polity"] == "Vothic Kingdom"]
    voth_cells = [setts[sid]["cell"] for sid in voth_sids]

    print(
        f"Running multimodal Dijkstra for {len(sids)} settlements "
        f"(+ {len(iziz_sids)} Iziz wartime/Visas & {len(voth_sids)} Voth wartime sources) across {2*N_CELL:,} graph nodes..."
    )
    dist_bulk, pred_bulk = dijkstra(G_bulk, directed=False, indices=src_cells, return_predecessors=True)
    dist_comp, pred_comp = dijkstra(G_comp, directed=False, indices=src_cells, return_predecessors=True)
    dist_iziz_bulk, pred_iziz_bulk = dijkstra(G_iziz_bulk, directed=False, indices=iziz_cells, return_predecessors=True)
    dist_iziz_comp, pred_iziz_comp = dijkstra(G_iziz_comp, directed=False, indices=iziz_cells, return_predecessors=True)
    dist_izv_bulk, pred_izv_bulk = dijkstra(G_izv_bulk, directed=False, indices=iziz_cells, return_predecessors=True)
    dist_izv_comp, pred_izv_comp = dijkstra(G_izv_comp, directed=False, indices=iziz_cells, return_predecessors=True)
    dist_voth_bulk, pred_voth_bulk = dijkstra(G_voth_bulk, directed=False, indices=voth_cells, return_predecessors=True)
    dist_voth_comp, pred_voth_comp = dijkstra(G_voth_comp, directed=False, indices=voth_cells, return_predecessors=True)

    return {
        "N_CELL": N_CELL, "GW": GW, "GH": GH,
        "sids": sids, "sid_to_idx": {sid: i for i, sid in enumerate(sids)},
        "iziz_sids": iziz_sids, "iziz_sid_to_idx": {sid: i for i, sid in enumerate(iziz_sids)},
        "voth_sids": voth_sids, "voth_sid_to_idx": {sid: i for i, sid in enumerate(voth_sids)},
        "dist_bulk": dist_bulk, "pred_bulk": pred_bulk,
        "dist_comp": dist_comp, "pred_comp": pred_comp,
        "dist_iziz_bulk": dist_iziz_bulk, "pred_iziz_bulk": pred_iziz_bulk,
        "dist_iziz_comp": dist_iziz_comp, "pred_iziz_comp": pred_iziz_comp,
        "dist_izv_bulk": dist_izv_bulk, "pred_izv_bulk": pred_izv_bulk,
        "dist_izv_comp": dist_izv_comp, "pred_izv_comp": pred_izv_comp,
        "dist_voth_bulk": dist_voth_bulk, "pred_voth_bulk": pred_voth_bulk,
        "dist_voth_comp": dist_voth_comp, "pred_voth_comp": pred_voth_comp,
        "is_ring_sea": is_ring_sea, "river_nav": river_nav, "canal_nav": canal_nav,
        "road_mult": road_mult, "special_corridors": SPECIAL_CORRIDORS + IZIZ_VISAS_CORRIDORS,
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
    }


# ---------------------------------------------------------------------------
# 6. Reconstruct Pairwise Paths, Mode Shares, Chokepoints & Pirate Exposure
# ---------------------------------------------------------------------------
IZIZ_IMPERIAL_POLS = {"Empire of Iziz", "Shell Province"}
CUT_VISAS_PARTNER_POLS = {"Dilihan Province", "Jimjam", "Dam Basin Salvagers", "Free Clans"}
BELLIGERENT_NAVAL_POLS = {"Empire of Iziz", "Shell Province", "Vothic Kingdom"}


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
    if uses_iziz_visas_regime(pol_a, pol_b):
        return "iziz_visas"
    if pol_a in IZIZ_IMPERIAL_POLS or pol_b in IZIZ_IMPERIAL_POLS:
        return "iziz"
    if pol_a == "Vothic Kingdom" or pol_b == "Vothic Kingdom":
        return "voth"
    return "std"


def analyze_pair_path(world, graph, setts, sid_src, sid_dst, tier):
    N_CELL, GW = graph["N_CELL"], graph["GW"]
    OW, OH, GH = world["OW"], world["OH"], world["GH"]
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)

    pol_s, pol_d = setts[sid_src]["polity"], setts[sid_dst]["polity"]
    reg = pick_pair_regime(pol_s, pol_d)

    u_src = setts[sid_src]["cell"]
    u_dst = setts[sid_dst]["cell"]

    if reg == "iziz_visas":
        if sid_src in graph["iziz_sid_to_idx"]:
            iz_i = graph["iziz_sid_to_idx"][sid_src]
            pred = graph["pred_izv_bulk"][iz_i] if tier == "bulk" else graph["pred_izv_comp"][iz_i]
            root_cell, leaf_cell, need_rev = u_src, u_dst, True
        else:
            iz_j = graph["iziz_sid_to_idx"][sid_dst]
            pred = graph["pred_izv_bulk"][iz_j] if tier == "bulk" else graph["pred_izv_comp"][iz_j]
            root_cell, leaf_cell, need_rev = u_dst, u_src, False
    elif reg == "iziz":
        if sid_src in graph["iziz_sid_to_idx"]:
            iz_i = graph["iziz_sid_to_idx"][sid_src]
            pred = graph["pred_iziz_bulk"][iz_i] if tier == "bulk" else graph["pred_iziz_comp"][iz_i]
            root_cell, leaf_cell, need_rev = u_src, u_dst, True
        else:
            iz_j = graph["iziz_sid_to_idx"][sid_dst]
            pred = graph["pred_iziz_bulk"][iz_j] if tier == "bulk" else graph["pred_iziz_comp"][iz_j]
            root_cell, leaf_cell, need_rev = u_dst, u_src, False
    elif reg == "voth":
        if sid_src in graph["voth_sid_to_idx"]:
            vt_i = graph["voth_sid_to_idx"][sid_src]
            pred = graph["pred_voth_bulk"][vt_i] if tier == "bulk" else graph["pred_voth_comp"][vt_i]
            root_cell, leaf_cell, need_rev = u_src, u_dst, True
        else:
            vt_j = graph["voth_sid_to_idx"][sid_dst]
            pred = graph["pred_voth_bulk"][vt_j] if tier == "bulk" else graph["pred_voth_comp"][vt_j]
            root_cell, leaf_cell, need_rev = u_dst, u_src, False
    else:
        i_src = graph["sid_to_idx"][sid_src]
        pred = graph["pred_bulk"][i_src] if tier == "bulk" else graph["pred_comp"][i_src]
        root_cell, leaf_cell, need_rev = u_src, u_dst, True

    nodes = []
    cur = leaf_cell
    steps_guard = 0
    while cur != root_cell and cur >= 0 and steps_guard < 10000:
        nodes.append(cur)
        cur = int(pred[cur])
        steps_guard += 1
    if cur != root_cell:
        return None
    nodes.append(root_cell)
    if need_rev:
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
            if "Xanadu" in cname or "Vale Gate" in cname:
                lizard_raid_km += rkm
            if "Loj Fower" in cname or "Nulab" in cname:
                fellgang_km += rkm
            if "Yeti North Rim" in cname or "Yeti Winter Pycrete" in cname:
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
        if la and lb:
            sea_km += step_km
            if graph["is_ring_sea"][aj, ai] or graph["is_ring_sea"][bj, bi]:
                ring_sea_km += step_km
                d_noa = 4.0 * math.hypot(0.5 * (ai + bi) - noa_i, 0.5 * (aj + bj) - noa_j)
                if d_noa < min_pirate_dist_km:
                    min_pirate_dist_km = d_noa
            mode = "sea"
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
        "Dilihan", "Port Visas", "Ardent", "Jimjam", "Talia", "Verge", "Parabola", "Stair", "Strongbow",
        "Roketstad", "Cascade", "Span", "Ledge", "The Gate", "The Sill (Sam-Lok)",
        "Spider Lake Weirs", "Hook", "Port Tobin", "Port Goto", "Ys", "Tethis",
        "Trigon", "Almua", "Zey'danin", "Dhelv", "Kautoa", "Farport", "Boatmurder",
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
    # Pirate capture rate on Ring Sea shipping: 2.5% baseline up to 7.5% near Noa's Regret,
    # PLUS 4.8% wartime naval commerce raiding when Empire of Iziz / Shell Province or Vothic Kingdom ships sail the Ring Sea!
    pirate_rate = 0.0
    naval_war_rate = 0.0
    if ring_sea_km >= 24.0:
        prox = math.exp(-max(0.0, min_pirate_dist_km - 40.0) / 260.0)
        pirate_rate = min(0.075, 0.025 + 0.050 * prox)
        if pol_s in BELLIGERENT_NAVAL_POLS or pol_d in BELLIGERENT_NAVAL_POLS:
            naval_war_rate = 0.048

    raider_tags = []
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
    if vrivolci_km >= 20:
        raider_tags.append("Vrivolci Giant Raids")
    if swhigh_km >= 20 and "Realm of Dalab" not in (pol_s, pol_d):
        raider_tags.append("SW Highlander Raids")
    if desert_bandit_km >= 32:
        raider_tags.append("Eastern Nomad Desert Bandits")
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

    return {
        "real_km": round(total_km),
        "sea_km": round(sea_km),
        "ring_sea_km": round(ring_sea_km),
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
        "raider_tags": raider_tags,
        "ports": ports_used,
        "corridors": corridors_used,
        "gateways": gateways_hit,
        "pirate_rate": pirate_rate,
        "naval_war_rate": naval_war_rate,
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
    iziz_sid_to_idx = graph["iziz_sid_to_idx"]
    voth_sid_to_idx = graph["voth_sid_to_idx"]
    pirate_sid = next(sid for sid, s in setts.items() if s["name"] == "Noa's Regret")
    dhelv_sid = next(sid for sid, s in setts.items() if s["name"] == "Dhelv")
    kautoa_sid = next(sid for sid, s in setts.items() if s["name"] == "Kautoa")
    neutral_intermediaries = [dhelv_sid, kautoa_sid]

    # Group settlements by polity
    pol_members = defaultdict(list)
    for sid in sids:
        pol_members[setts[sid]["polity"]].append(sid)

    path_cache = {}

    def single_leg_eff(sid_a, sid_b, is_bulk):
        pol_a, pol_b = setts[sid_a]["polity"], setts[sid_b]["polity"]
        reg = pick_pair_regime(pol_a, pol_b)
        if reg == "iziz_visas":
            if sid_a in iziz_sid_to_idx:
                dmat = graph["dist_izv_bulk"] if is_bulk else graph["dist_izv_comp"]
                return float(dmat[iziz_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            dmat = graph["dist_izv_bulk"] if is_bulk else graph["dist_izv_comp"]
            return float(dmat[iziz_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        if reg == "iziz":
            if sid_a in iziz_sid_to_idx:
                dmat = graph["dist_iziz_bulk"] if is_bulk else graph["dist_iziz_comp"]
                return float(dmat[iziz_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            dmat = graph["dist_iziz_bulk"] if is_bulk else graph["dist_iziz_comp"]
            return float(dmat[iziz_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        if reg == "voth":
            if sid_a in voth_sid_to_idx:
                dmat = graph["dist_voth_bulk"] if is_bulk else graph["dist_voth_comp"]
                return float(dmat[voth_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            dmat = graph["dist_voth_bulk"] if is_bulk else graph["dist_voth_comp"]
            return float(dmat[voth_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        ia = sid_to_idx[sid_a]
        dmat = graph["dist_bulk"] if is_bulk else graph["dist_comp"]
        return float(dmat[ia, setts[sid_b]["cell"]])

    def best_war_intermediary(sid_a, sid_b, is_bulk):
        best = (float("inf"), None)
        for mid_sid in neutral_intermediaries:
            e1 = single_leg_eff(sid_a, mid_sid, is_bulk)
            e2 = single_leg_eff(mid_sid, sid_b, is_bulk)
            tot = e1 + e2 + 42.0  # Smuggler / neutral intermediary transshipment & relabeling fee
            if tot < best[0]:
                best = (tot, mid_sid)
        return best

    def fast_eff(sid_a, sid_b, tier):
        pol_a, pol_b = setts[sid_a]["polity"], setts[sid_b]["polity"]
        is_bulk = tier == "bulk"
        if is_iziz_voth_war_pair(pol_a, pol_b):
            return best_war_intermediary(sid_a, sid_b, is_bulk)[0]
        return single_leg_eff(sid_a, sid_b, is_bulk)

    def compose_intermediary_path(sid_a, mid_sid, sid_b, tkey):
        p1 = analyze_pair_path(world, graph, setts, sid_a, mid_sid, tkey)
        p2 = analyze_pair_path(world, graph, setts, mid_sid, sid_b, tkey)
        if not p1 or not p2:
            return None
        mid_nm = setts[mid_sid]["name"]
        mid_pol = setts[mid_sid]["polity"]
        ports = list(p1["ports"])
        if mid_nm not in ports:
            ports.append(mid_nm)
        for p in p2["ports"]:
            if not ports or ports[-1] != p:
                ports.append(p)
        corrs = list(dict.fromkeys(p1["corridors"] + p2["corridors"]))
        gws = list(dict.fromkeys(p1["gateways"] + [mid_nm] + p2["gateways"]))
        full_poly = p1["full_poly"] + (p2["full_poly"][1:] if len(p2["full_poly"]) > 1 else [])
        seg_modes = p1["seg_modes"] + p2["seg_modes"]
        comb_pirate = 1.0 - (1.0 - p1["pirate_rate"]) * (1.0 - p2["pirate_rate"])
        comb_war = 0.065 if (p1["ring_sea_km"] + p2["ring_sea_km"]) >= 24 else 0.0
        tag_lead = f"WARTIME SMUGGLERS / INTERMEDIARY via {mid_nm} ({mid_pol})"
        rtags = [tag_lead] + [t for t in dict.fromkeys(p1["raider_tags"] + p2["raider_tags"]) if t != tag_lead]
        out = {}
        for k_num in (
            "real_km", "sea_km", "ring_sea_km", "river_km", "highway_km", "caravan_km", "corridor_km",
            "lizard_km", "lizard_raid_km", "screamer_km", "yeti_km", "painted_km", "fellgang_km", "scyvoi_km",
            "beastrider_km", "beastrider_core_km", "vrivolci_km", "boatmurder_km", "swhigh_km",
            "coyote_nomad_km", "desert_bandit_km",
        ):
            out[k_num] = p1[k_num] + p2[k_num]
        out.update({
            "raider_tags": rtags,
            "ports": ports,
            "corridors": corrs,
            "gateways": gws,
            "pirate_rate": comb_pirate,
            "naval_war_rate": comb_war,
            "poly_51": full_poly[::max(1, len(full_poly) // 45)] + ([full_poly[-1]] if full_poly else []),
            "seg_modes": seg_modes,
            "full_poly": full_poly,
        })
        return out

    def get_pair(sid_a, sid_b, tier):
        tkey = "bulk" if tier == "bulk" else "comp"
        key = (sid_a, sid_b, tkey)
        if key not in path_cache:
            pol_a, pol_b = setts[sid_a]["polity"], setts[sid_b]["polity"]
            if is_iziz_voth_war_pair(pol_a, pol_b):
                eff, mid_sid = best_war_intermediary(sid_a, sid_b, tkey == "bulk")
                info = compose_intermediary_path(sid_a, mid_sid, sid_b, tkey) if (np.isfinite(eff) and mid_sid) else None
            else:
                eff = single_leg_eff(sid_a, sid_b, tkey == "bulk")
                info = analyze_pair_path(world, graph, setts, sid_a, sid_b, tkey) if np.isfinite(eff) else None
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
                    # 1. Order of Historians banned from Voth (LORE.md:436)
                    if gid == "books" and s_pol == "Order of Historians" and b_pol == "Vothic Kingdom":
                        w_row.append(0.0)
                        continue
                    # 2. Firearms/rockets barred to Coyote Kingdom north of The Sill
                    if gid == "rockets" and b_pol in ("Coyote Kingdom", "Dilihan Province"):
                        w_row.append(0.0)
                        continue
                    # 3. Yeti Kingdom raids Eternal State & relations are fraught — no direct bilateral trade (LORE.md s6.19)
                    if {s_pol, b_pol} == {"Yeti Kingdom", "Eternal State"}:
                        w_row.append(0.0)
                        continue
                    # 4. Empire of Iziz (+ Shell) <-> Vothic Kingdom State of War:
                    #    Zero war materiel or direct open bulk trade; only covert smuggler / neutral-intermediary cargoes!
                    war_pair = is_iziz_voth_war_pair(s_pol, b_pol)
                    if war_pair and (gid in ("arms", "rockets") or tier == "bulk"):
                        w_row.append(0.0)
                        continue
                    # 5. Beast Riders <-> Empire of Iziz / Shell Province hostile (no arms exports to Beast Riders)
                    br_iz_pair = ("Beast Riders" in (s_pol, b_pol)) and (s_pol in IZIZ_IMPERIAL_POLS or b_pol in IZIZ_IMPERIAL_POLS)
                    if br_iz_pair and gid in ("arms", "rockets"):
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
                    # Bilateral war, hostilities, commercial rivalries & border-raider frictions:
                    if war_pair:
                        # Iziz <-> Voth at war: trade only via smugglers or neutral intermediaries (Dhelv / Kautoa)
                        w *= 0.085
                    if br_iz_pair:
                        # Beast Riders & Iziz hostile (not quite full war, raids common)
                        w *= 0.12
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
                    if "SW Highland Frogmen" in (s_pol, b_pol):
                        if "Realm of Dalab" in (s_pol, b_pol):
                            # Peace treaty via Span — Dalab is SW Highlanders' primary peaceful trade partner!
                            w *= 1.35
                        elif any(
                            nb in (s_pol, b_pol)
                            for nb in ("Vothic Kingdom", "Yusar (Cybernetics)", "Iron Republic", "Shumari", "Scyvoi", "Free Giants (Vrivolci)")
                        ):
                            # SW Highlanders raid neighbors except Dalab
                            w *= 0.22
                    if {s_pol, b_pol} == {"Coyote Kingdom", "Nomad Country"}:
                        # Coyotemen and Eastern Nomads occasionally raid each other
                        w *= 0.45

                    # Once-a-year Annual Great Caravan (Nulab <-> Erehwon North Rift Bench):
                    # bulk is already blocked (inf); medium cargo faces heavy annual-convoy capacity friction!
                    _, pinfo_chk = get_pair(s_sid, b_sid, tier)
                    if pinfo_chk and any("Annual Great Caravan" in c for c in pinfo_chk["corridors"]):
                        w *= (0.14 if tier == "medium" else 0.55)
                    # Yeti caravans cannot clear customs through Eternal State ports/cities (Lux, Fulcrum, Bastion, Farport)
                    if "Yeti Kingdom" in (s_pol, b_pol) and pinfo_chk:
                        if any(ep in pinfo_chk["ports"] or ep in pinfo_chk["gateways"] for ep in ("Lux", "Fulcrum", "Bastion", "Farport")):
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
                        pirate_ledger[gid]["victims"][setts[s_sid]["polity"]] += taken
                    raw_flows.append((s_sid, b_sid, delivered, eff_km, pinfo, False))

            # Pass 2a: Noa's Regret fences its captured maritime & privateer prizes by ship to Ring Sea buyers!
            if captured_pool > 1e-4:
                fence_cands = []
                for b_sid, b_need in buyers:
                    b_pol = setts[b_sid]["polity"]
                    if gid == "books" and b_pol == "Vothic Kingdom":
                        continue
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

            # Pass 2b: Wartime privateer prizes auctioned at neutral Ring Sea intermediaries (Kautoa & Dhelv [Zeijani])
            if war_prize_pool > 1e-4:
                for mid_sid, mid_share in ((kautoa_sid, 0.55), (dhelv_sid, 0.45)):
                    sub_pool = war_prize_pool * mid_share * 0.92
                    if sub_pool <= 1e-4:
                        continue
                    mid_pol = setts[mid_sid]["polity"]
                    mid_cands = []
                    for b_sid, b_need in buyers:
                        b_pol = setts[b_sid]["polity"]
                        if b_pol == mid_pol or (gid == "books" and b_pol == "Vothic Kingdom"):
                            continue
                        eff_km, pinfo = get_pair(mid_sid, b_sid, tier)
                        if np.isfinite(eff_km) and pinfo is not None and pinfo["sea_km"] > 0 and eff_km < 460.0:
                            mid_cands.append((b_sid, b_need / ((eff_km + 35.0) ** 1.2), eff_km, pinfo))
                    sw_m = sum(x[1] for x in mid_cands)
                    if sw_m > 0:
                        pirate_ledger[gid]["fenced"] += sub_pool
                        pol_surplus_map[mid_pol] = pol_surplus_map.get(mid_pol, 0.0) + sub_pool
                        for b_sid, w_m, eff_km, pinfo in mid_cands:
                            share_m = sub_pool * (w_m / sw_m)
                            if share_m > 1e-4:
                                pinfo_tag = dict(pinfo)
                                pinfo_tag["raider_tags"] = ["WARTIME PRIZE INTERMEDIARY"] + list(pinfo.get("raider_tags", []))
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

        selected_for_table = list(raw_flows[:8])
        if special_featured and not any(
            any("Annual Great Caravan" in c or "Iziz-Guarded Visas Caravan" in c for c in x[4]["corridors"])
            for x in selected_for_table[:5]
        ):
            if tot_flow > 0 and special_featured[0][2] / tot_flow >= 0.008:
                selected_for_table = list(raw_flows[:4]) + [special_featured[0]] + list(raw_flows[4:7])
        if war_smug_featured and not any(
            any("WARTIME SMUGGLERS / INTERMEDIARY" in t or "WARTIME PRIZE INTERMEDIARY" in t for t in x[4].get("raider_tags", []))
            for x in selected_for_table[:5]
        ):
            if tot_flow > 0 and war_smug_featured[0][2] / tot_flow >= 0.0025:
                selected_for_table = list(selected_for_table[:4]) + [war_smug_featured[0]] + list(selected_for_table[4:7])
        if pirate_flows and not any(x[5] for x in selected_for_table[:6]):
            selected_for_table = list(selected_for_table[:5]) + [pirate_flows[0]] + list(selected_for_table[5:7])

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
                    via_parts.append("via " + " -> ".join(mids[:3]))
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
        "Farport", "Fulcrum", "Carcosa", "Qoold Lheek", "Leng", "Jimjam", "Boatmurder",
        "Dilihan", "Port Visas", "Ardent", "Roketstad", "Ys", "Tethis", "Trigon", "Nephtos", "Hook",
        "Port Tobin", "Port Goto", "Shell", "Almua", "Zey'danin", "Voth", "Shim",
        "Dalab", "Span", "Ledge", "Nulab", "Wildcat", "Tallwalls", "Betun-Sumar",
        "Spirladunon", "Iziz", "Talia", "Verge", "Parabola", "Locus", "Mungo", "Reed",
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
            if nm == "Port Visas":
                x, y = int(s["px"]) + 7, int(s["py"]) - 14
            elif nm == "Ys":
                x, y = int(s["px"]) + 6, int(s["py"]) + 3
            elif nm == "The Sill (Sam-Lok)":
                x, y = int(s["px"]) - 142, int(s["py"]) - 8
            d2.text((x + 1, y + 1), nm, fill=(10, 12, 16), font=font)
            tcol = (255, 130, 130) if nm == "Noa's Regret" else (248, 246, 236)
            d2.text((x, y), nm, fill=tcol, font=font)

    # Label Autarkic Hostile Zones, Raider Frontier Zones & North-Rift Great Caravan
    def draw_tag(tx, ty, txt, col):
        d2.text((tx + 1, ty + 1), txt, fill=(10, 12, 16), font=font_b)
        d2.text((tx, ty), txt, fill=col, font=font_b)

    draw_tag(605, 1545, "LIZARDMAN RIFT (No Trade — Raids Xanadu & S. Dalab)", (255, 138, 138))
    draw_tag(768, 602, "SCREAMER COUNTRY (Raiders — No Trade)", (255, 145, 210))
    draw_tag(818, 952, "IZIZ–VOTH NAVAL WAR", (255, 122, 122))
    draw_tag(1030, 775, "BEAST RIDERS (Hostile to Iziz)", (255, 188, 120))
    draw_tag(785, 366, "BOATMURDER HIGHWAYMEN", (255, 188, 120))
    draw_tag(548, 1378, "Annual Great Caravan (North Rift Bench)", (255, 175, 215))
    draw_tag(352, 468, "YETI RAIDERS (No Eternian Trade)", (255, 188, 120))
    draw_tag(942, 560, "PAINTED MEN RAIDERS", (255, 188, 120))
    draw_tag(572, 782, "SCYVOI RAIDERS", (255, 188, 120))
    draw_tag(470, 955, "SW HIGHLAND RAIDERS", (255, 188, 120))
    draw_tag(578, 1222, "VRIVOLCI RAIDERS", (255, 188, 120))
    draw_tag(326, 1432, "FELLGANG RAIDERS", (255, 188, 120))
    draw_tag(1365, 650, "COYOTE–NOMAD RAIDS", (255, 188, 120))
    draw_tag(1130, 1285, "NOMAD DESERT BANDITS", (255, 188, 120))

    # Legend box (bottom-left)
    lx, ly = 28, OH - 232
    d2.rectangle((lx, ly, lx + 548, OH - 24), fill=(18, 24, 34), outline=(120, 140, 165), width=2)
    d2.text((lx + 14, ly + 10), "KRATOR 5.1 MULTIMODAL TRADE NETWORK (gemini-trade)", fill=(255, 240, 190), font=font_b)
    legend_rows = [
        ((64, 212, 255), "Sea Shipping Lanes (Iziz–Voth Naval War on Ring Sea)"),
        ((52, 235, 178), "Navigable Rivers, Lakes & Eternian Canals"),
        ((255, 210, 72), "Kept Ancient 30 m Highways"),
        ((255, 148, 66), "Overland Caravan Trunks (Camels / Lizards / Ostriches)"),
        ((255, 92, 140), "Tunnels, Armed Iziz-Visas Convoy & N-Rift Great Caravan"),
        ((240, 60, 60), "Noa's Regret Pirate & Privateer Prize Fence Lanes"),
        ((195, 48, 92), "Autarkic Raiders (No Trade): Lizardmen & Screamers"),
        ((212, 118, 52), "Raider & Bandit Zones (Beast Riders, Vrivolci, SW High, etc.)"),
    ]
    for idx_l, (c_rgb, lbl_txt) in enumerate(legend_rows):
        ry = ly + 38 + idx_l * 20
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
        f"> **Model Summary**: **{payload['good_count']} trade goods** (including `zinc` / brass spelter and dedicated `energy-cells`) solved across "
        f"**{payload['polity_count']} polities & maritime poleis** (`{payload['settlement_count']}` settlements & gateways) over a "
        "**four-regime two-layer 4 km Dijkstra multimodal graph** backed by the rebaked 5.1 geology and the `claude/ancient-network-9cc3e7` 5.1 road network (`142` routes).",
        "> - **`Empire of Iziz` (+ `Shell Province`) ↔ `Vothic Kingdom` State of War**: Mutual port and land-border closure (`0` open bulk trade, `0` war materiel), mutual **Ring Sea commerce raiding / privateering** (`+4.8%` wartime shipping interception on top of `Noa's Regret` piracy), and all wartime trade between them routed strictly via **smugglers or neutral Ring Sea intermediaries (`Dhelv` [Zeijani] & `Kautoa`)**.",
        "> - **Hostilities & Commercial Rivalries**: **`Beast Riders` ↔ `Empire of Iziz`** are hostile with frequent raids (`0.12x` bilateral trade, `4.8x–5.6x` ambush surcharge keeping Iziz caravans out of Beast Rider hyperjungle); **`Vothic Kingdom` ↔ `Hykkousoi League` (`League:*`)** are maritime rivals discouraging mutual trade (`0.20x` + `+58 eff km` rivalry port tariff); **`Iron Republic` ↔ `Dilihan Province` / `Free Clans` (`Ardent`)** are rivals discouraging bilateral trade (`0.20x`) and rival hub transit.",
        "> - **Raider Polities & Highway/Desert Banditry**:",
        ">   - **Autarkic Raiders (`0` External Trade)**: `Lizardmen` (also raid `Xanadu` & S. `Dalab`/`Fellgangs`) and `Screamer Country` (`Hexahedron`).",
        ">   - **Fraught Frontier**: `Yeti Kingdom` raids `Eternal State` (**`0` direct trade** or customs transit through Eternia).",
        ">   - **Border Raiders & Highwaymen**: **`Free Giants (Vrivolci)`** raid `Dalab` and `Voth` (`0.25x` bilateral + `1.30x–1.75x` march hazard); **`Boatmurder` highwaymen** ambush the NE highways (`1.62x–1.72x` road surcharge); **`SW Highlanders` (`SW Highland Frogmen`)** raid neighbors **except `Realm of Dalab` (peace treaty via `Span`)**; **`Coyotemen` & `Eastern Nomads`** occasionally raid each other (`0.45x` + frontier surcharge), while **Eastern Nomad desert bandits** raid Bowl, Catch, and Dasri desert-crossing caravans (`1.38x–1.42x`); **`Painted Men`**, **`Fellgangs`**, and **`Scyvoi`** raid neighboring marches.",
        "> - **Eternian Ancient Energy Cells (`energy-cells`) via `Yusar`**: `Eternal State` (`Fulcrum`, `Lux`, `Farport`) has strong demand for sealed Ancient power cells and sources **>90% of its `energy-cells` from `Valley of the Ancient` by way of `Yusar (Cybernetics)` (`Carcosa` & `Henge`)**, while `Stair` supplies the southern/eastern basins.",
        "> - **North-Side Rift `Annual Great Caravan` & `Dilihan ↔ Port Visas` Armed Iziz Convoys**: `Tallwalls ↔ Erehwon` remains impassable; `Nulab ↔ Erehwon` runs once a year along the **North Rift Bench** (`compact` only); `Iziz` uses **armed guard convoys** on `Dilihan ↔ Port Visas`, while all other polities use the Hykkousoi ports (`Ys`, `Tethis`, `Trigon`).",
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

    lines += [
        "",
        "---",
        "",
        "## 2. `Noa's Regret` Piracy & Iziz–Voth Wartime Commerce-Raiding Ledger",
        "",
        "| Good | Captured at Sea (Pirates + Privateers) | Fenced Onward (`Noa's Regret`, `Kautoa`, `Dhelv`) | Primary Victim Fleets | Primary Prize Buyers |",
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
        ("I. Metals, Bullion & Structural Salvage", ["iron", "copper", "tin", "bronze", "zinc", "nickel", "rare-earth", "gold", "silver", "scrap"]),
        ("II. Fuels, Industrial Minerals & Building Stone", ["coal", "oil", "salt", "sulfur", "saltpeter", "potash", "marble", "alabaster", "brick", "machine-wax", "pitch-tar"]),
        ("III. Timber, Naval Rigging, Fibres, Textiles, Beasts & Staples", ["timber", "cordage", "cotton", "silk", "qiviut", "plaid", "dye-tropical", "dye-temperate", "mounts", "food"]),
        ("IV. Spices, Stimulants, Incense, Medicines & Alchemicals", ["spice-tropical", "isle-spice", "spice-highland", "cacao", "coffee", "tea", "sugar", "tobacco", "incense", "medicine", "lung-salt", "reagent", "fungal"]),
        ("V. Gems, Kilnware, Knowledge, Optics, Arms & Ancient Tech", ["pearls", "gems", "goldwork", "fine-ceramics", "porcelain", "almanacs", "books", "lenses", "rockets", "arms", "electrics", "energy-cells", "cybernetics", "genecraft", "scrapgoods", "relics", "oversea-luxuries"]),
    ]

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
            entry["note"] = "Raids the Eternal State and relations are fraught — zero direct bilateral trade with Eternia; trades indirectly via Dam Basin Salvagers, Jimjam, Iron Republic, and Free Clans."
        elif pol in ("Empire of Iziz", "Shell Province"):
            entry["trade_regime"] = "wartime_belligerent_iziz"
            entry["note"] = "At war with Vothic Kingdom (mutual port closure, Ring Sea commerce raids, trade only via smugglers or neutral Dhelv/Kautoa intermediaries); hostile to Beast Riders; armed convoys on Dilihan-Port Visas."
        elif pol == "Vothic Kingdom":
            entry["trade_regime"] = "wartime_belligerent_voth"
            entry["note"] = "At war with Empire of Iziz & Shell Province (mutual port closure, Ring Sea commerce raids, trade only via smugglers or neutral Dhelv/Kautoa intermediaries); commercial rival of Hykkousoi League; raided by Vrivolci & SW Highlanders."
        elif pol == "SW Highland Frogmen":
            entry["trade_regime"] = "neighbor_raider_dalab_treaty"
            entry["note"] = "Raids neighboring marches (Voth, Yusar, Republic, Shumari) EXCEPT Realm of Dalab, with whom it maintains a peace treaty via Span."
        elif pol == "Dam Basin Salvagers":
            entry["trade_regime"] = "salvager_highwaymen"
            entry["note"] = "Boatmurder salvagers & highwaymen preying on caravans along the NE Dam Basin and semi-arid highways."
        elif pol in ("Painted Men", "Fellgangs", "Scyvoi", "Free Giants (Vrivolci)", "Beast Riders", "Coyote Kingdom", "Nomad Country"):
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
    out_md = os.path.join(ROOT, "openworld", "TRADE-GEMINI.md")
    write_trade_markdown(payload, out_md)


if __name__ == "__main__":
    main()
