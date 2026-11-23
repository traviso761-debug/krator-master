#!/usr/bin/env python3
"""Calculate Game-Ready Ships, Inland Barges & Overland Caravans for Krator 5.1 (branch: gemini-trade).

Translates the solved 94-good annual multimodal trade flows (cross-polity + domestic trunk/colonial)
into concrete carrier counts per route/corridor and per polity, strictly enforcing:
  1. Landlocked & non-seafaring nations NEVER own or sail open-sea ships (0 sea ships); all sea legs
     of their exports & imports ride the hulls of seagoing nations.
  2. Per LORE.md:648 ("no one from Krator has ever crossed this sea"), NW Outer Ocean voyages into
     Farport's Factory Quarter are sailed 100% by exterior pelagic visitors (Ria Valley & The Crook),
     while Eternal State operates Krator's largest inland canal, river & lake barge fleet.
  3. Pure island/pelagic polities own 0 mainland overland caravans; mainland freight breaks bulk at ports.
  4. Directional pairing max(A->B, B->A) sizes fleets on dominant haul so backhauls reuse returning hulls/wagons.

Outputs:
  - openworld/trade-fleets-gemini.json
"""
import argparse
import json
import math
import os
import pickle
import sys
from collections import defaultdict
import numpy as np
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import gemini_trade_model as gtm  # noqa: E402

SEAGOING_RINGSEA_POLS = {
    "Vothic Kingdom",
    "Empire of Iziz",
    "Shell Province",
    "League: Ys",
    "League: Tethys",
    "League: Trigon",
    "League: Pontus",
    "Kautoa",
    "West Ring Islanders",
    "Hookfleet",
    "Ring Sea Pirates",
}

SEAGOING_OCEAN_POLS = {
    "Ria Valley",
    "The Crook",
}

ALL_SEAGOING_POLS = SEAGOING_RINGSEA_POLS | SEAGOING_OCEAN_POLS

# Polities with genuine inland river, canal, or mountain/interior lake barge navigation:
TRUE_BARGE_POLS = {
    "Eternal State",            # Ling-Ma river, locked lowland canals & Palewharf on Jimjam's Lake
    "Empire of Iziz",           # Iziz Lake, Atton, Gioli & Port Tobin river lighterage
    "Vothic Kingdom",           # 50 m Shim River barges (Shim <-> Voth) & Lake Nazar
    "Xanadu Sultanate",         # Landlocked mountain Lake Xanadu (swan barges, dragon boats, bullion carracks)
    "Jimjam",                   # Jimjam's Lake (Jimjam <-> Palewharf) & Serai lake/canal
    "Realm of Dalab",           # Dapor lake/river port on Lake Nazar/Shim & Nulab reservoir
    "Silkhead (Korona Gateway)",# East Cut / Serai-Silkhead lake waterway
    "Tungang Union",            # Ledge-Nulab upper reservoir barges
    "Yuni Emirate",             # Ostrukh-on-Water reed/river barges
    "Spider Lake Guilds",       # Silk-rigged Spider Lake punts
    "Nomad Country",            # Reed river barges
    "Coyote Kingdom",           # Coyote Lake / Tarn boats
}

ISLAND_OR_EXTERIOR_NO_CARAVAN_POLS = {
    "Kautoa", "West Ring Islanders", "Hookfleet", "Ring Sea Pirates",
    "League: Ys", "League: Pontus", "Ria Valley", "The Crook",
}

# Passive-host nomadic kraals: Scyvoi never push merchant caravans out to border towns — outsiders come to them!
PASSIVE_HOST_NO_CARAVAN_POLS = {"Scyvoi"}

UMBRELLA_GROUPS = {"Nomad Country", "Coyote Kingdom", "Korona Tribes", "Scyvoi", "Catch Oasis Stations", "Sasquatch Tribes"}

UNIT_TONS = {"t": 1.0, "kg": 0.002}
GOOD_TONS = {
    "brick": 1.0, "ship-hulls": 0.0, "mounts": 0.55,
    "plaid": 0.08, "isle-spice": 0.05, "fungal": 0.06,
    "furniture": 0.25, "firearms": 0.08, "armor": 0.12, "weapons": 0.10,
    "goldwork": 0.03, "fine-ceramics": 0.15, "porcelain": 0.14,
    "almanacs": 0.04, "books": 0.05, "lenses": 0.03,
    "rockets": 0.35, "mech-parts": 0.50, "electrics": 0.18, "energy-cells": 0.08,
    "servomotors": 0.08, "power-relays": 0.10, "circuits": 0.03, "microchips": 0.01,
    "processor-cores": 0.04, "ancient-sensors": 0.05, "archaeotech": 0.05,
    "cybernetics": 0.04, "genecraft": 0.03, "scrapgoods": 0.22, "relics": 0.05,
    "oversea-luxuries": 0.08, "frost-coral": 0.08, "ria-amber": 0.08,
}

# Cultural vessel breakdowns per seagoing polity (grounded in kits/ringsea/README.md & LORE.md s9)
# Each entry lists [(class_name, std_coaster_equiv_per_hull, share_of_fleet_capacity), ...]
CULTURAL_FLEET_PROFILES = {
    "Empire of Iziz": {
        "tradition": "Izani Imperial Merchant & Salvage Marine",
        "ports": ["Marr", "Hook", "Port Tobin"],
        "classes": [
            ("Izani Dhoni Coaster (12 t)", 1.0, 0.52),
            ("Refloated Salvage Lighter (18 t)", 1.5, 0.28),
            ("Izani Wheel Galley / Heavy Transport (28 t)", 2.2, 0.20),
        ],
        "escort_note": "+ 4–6 Imperial Armoured Turtle Ships on naval blockade & convoy escort",
    },
    "League: Tethys": {
        "tradition": "Hykkousoi Merchant Marine & Nephtos Free-Traders",
        "ports": ["Tethis", "Nephtos", "Nereus"],
        "classes": [
            ("Amphora Corbita (14 t)", 1.15, 0.50),
            ("Scroll-Sail Galley (16 t)", 1.30, 0.26),
            ("Nephtos Fast Smuggler Brig (10 t)", 0.85, 0.24),
        ],
        "escort_note": "+ 3 Tethyan bronze-ram patrol galleys",
    },
    "League: Ys": {
        "tradition": "Hykkousoi High-Republic Galleon & Corbita Fleet",
        "ports": ["Ys", "Ybera", "Kierson"],
        "classes": [
            ("58 m Hykkousoi Sea Galleon (30 t)", 2.40, 0.36),
            ("Amphora Corbita (14 t)", 1.15, 0.46),
            ("Hykkousoi Pearl Baghlah (9 t)", 0.75, 0.18),
        ],
        "escort_note": "+ 4 Ysian squadron war-galleys",
    },
    "Vothic Kingdom": {
        "tradition": "Vothic Royal & Chichani Merchant Fleet",
        "ports": ["Voth", "Shim", "Almua", "Temora", "Zey'danin", "Tzinguard"],
        "classes": [
            ("Vothic Cargo Hulk / Merchant Junk (26 t)", 2.10, 0.44),
            ("Vothic Coastal Dhow (12 t)", 1.00, 0.56),
        ],
        "escort_note": "+ 5–7 Chitin Biremes on wartime commerce raiding & Tzinguard patrol",
    },
    "Kautoa": {
        "tradition": "Eastern Sikau Voyaging Fleet (& Beast Rider Naval Factor)",
        "ports": ["Kautoa", "Valapo", "Bipo"],
        "classes": [
            ("31 m Kautoan Great Drua (14 t)", 1.15, 0.50),
            ("Four-Hull Lakatoi Trading Raft (10 t)", 0.85, 0.36),
            ("Fast Oruwa Spice Outrigger (4 t)", 0.40, 0.14),
        ],
        "escort_note": "+ 3 Karakoa war outriggers guarding Kautoa & Beast Rider landings",
    },
    "League: Pontus": {
        "tradition": "Pontic Archipelago Galley & Tramp Line",
        "ports": ["Pontus", "Kyra Isle", "Skopelos Isle"],
        "classes": [
            ("Pontic Scroll-Sail Galley (15 t)", 1.20, 0.55),
            ("Amphora Corbita (12 t)", 1.00, 0.45),
        ],
        "escort_note": "+ 1–2 archipelago patrol galleys",
    },
    "Hookfleet": {
        "tradition": "Port Mira Salvager-Captains & Smuggler Flotilla",
        "ports": ["Port Mira"],
        "classes": [
            ("Gaff-Rigged Ancient Steel Salvage Tug (18 t)", 1.45, 0.55),
            ("Contraband & Prize Sloop (9 t)", 0.75, 0.45),
        ],
        "escort_note": "Enforces Port Mira's 50-km No-Shipjacking Truce Zone",
    },
    "Ring Sea Pirates": {
        "tradition": "Freebooter Raider & Prize-Fencing Flotilla",
        "ports": ["Noa's Regret", "Shanty", "Boiling Bay"],
        "classes": [
            ("Pirate Lanong Sweep-Raider (10 t)", 0.85, 0.60),
            ("Captured Prize Coaster (12 t)", 1.00, 0.40),
        ],
        "escort_note": "Preys on Ring Sea lanes outside Port Mira's 50-km truce waters",
    },
    "Ria Valley": {
        "tradition": "Exterior NW Ocean Pelagic Visitors (Farport Factory Quarter)",
        "ports": ["Ria Valley (Exterior) -> Farport"],
        "classes": [
            ("Ria Pelagic Trade Carrack (18 t luxury/bullion hold)", 1.00, 1.00),
        ],
        "escort_note": "Annual trans-oceanic visit; confined to Farport Factory Quarter (LORE.md:648)",
    },
    "The Crook": {
        "tradition": "Exterior Sub-Polar Pelagic Visitors (Farport Factory Quarter)",
        "ports": ["The Crook (Exterior) -> Farport"],
        "classes": [
            ("Ice-Sheathed Crook Pelagic Hulk (18 t luxury/bullion hold)", 1.00, 1.00),
        ],
        "escort_note": "Annual trans-oceanic visit; confined to Farport Factory Quarter (LORE.md:648)",
    },
    "League: Trigon": {
        "tradition": "Trigon Bay Coastal Merchantmen",
        "ports": ["Trigon", "Limnaia"],
        "classes": [
            ("Amphora Corbita (12 t)", 1.00, 0.65),
            ("Scroll-Sail Galley (15 t)", 1.20, 0.35),
        ],
        "escort_note": "+ 1 harbour guard galley",
    },
    "Shell Province": {
        "tradition": "Provincial Izani Timber & Potash Coasters",
        "ports": ["Shell", "Port Goto"],
        "classes": [
            ("Izani Dhoni Coaster (12 t)", 1.00, 1.00),
        ],
        "escort_note": "Operates under Izani convoy protection",
    },
    "West Ring Islanders": {
        "tradition": "Western Hikau Spice-Atoll Voyagers",
        "ports": ["Taikoro", "Kautono"],
        "classes": [
            ("Western Lakatoi Trading Raft (10 t)", 0.85, 0.60),
            ("Hikau Oruwa / Kora-Kora Trader (5 t)", 0.45, 0.40),
        ],
        "escort_note": "Supplemented by visiting League, Iziz, Voth & Hookfleet spice buyers",
    },
}


def flow_tons(gid, unit, amt, leg_kind):
    if gid == "ship-hulls":
        return 0.0
    if gid == "mounts":
        return amt * 0.55 if leg_kind in ("sea", "barge") else 0.0
    if gid in GOOD_TONS:
        return amt * GOOD_TONS[gid]
    return amt * UNIT_TONS.get(unit, 0.05)


def allocate_cultural_hulls(pol, std_equiv_total):
    prof = CULTURAL_FLEET_PROFILES[pol]
    if std_equiv_total <= 0.05:
        return [], 0
    out = []
    tot_hulls = 0
    for cname, eq_per_hull, cap_share in prof["classes"]:
        raw_hulls = (std_equiv_total * cap_share) / eq_per_hull
        n_hulls = max(1, int(round(raw_hulls))) if raw_hulls >= 0.35 else 0
        if n_hulls > 0:
            out.append({"vessel_class": cname, "count": n_hulls})
            tot_hulls += n_hulls
    if tot_hulls == 0:
        cname, _, _ = prof["classes"][0]
        out.append({"vessel_class": cname, "count": 1})
        tot_hulls = 1
    return out, tot_hulls


def extract_flows_from_model():
    """Run full node-by-node multimodal flow extraction directly from gemini_trade_model."""
    world = gtm.load_world()
    setts = gtm.build_settlements(world)
    if isinstance(setts, tuple):
        setts = setts[0]
    gtm.populate_supply_demand(world, setts)
    graph = gtm.build_multimodal_graphs(world, setts)

    N_CELL, GW = graph["N_CELL"], graph["GW"]
    OW, OH, GH = world["OW"], world["OH"], world["GH"]
    su, sv = (GW - 1) / (OW - 1), (GH - 1) / (OH - 1)

    phys_setts = [(s["name"], s["polity"], (s["cell"] % N_CELL) // GW, (s["cell"] % N_CELL) % GW)
                  for s in setts.values() if not s.get("abstract_region")]
    kd = cKDTree([(x[2], x[3]) for x in phys_setts])

    def nearest_hub(c0):
        cj, ci = divmod(c0 % N_CELL, GW)
        _, idx = kd.query((cj, ci))
        nm, pol, _, _ = phys_setts[int(idx)]
        return nm, pol

    cell_to_port = {}
    cell_to_wharf = {}
    for sid, s in setts.items():
        if s.get("abstract_region"):
            cell_to_port[s["cell"]] = s["name"]
            if s.get("water_cell") is not None:
                cell_to_port[N_CELL + s["water_cell"]] = s["name"]
            continue
        if s.get("water_cell") is not None:
            cell_to_port[s["cell"]] = s["name"]
            cell_to_port[N_CELL + s["water_cell"]] = s["name"]
            if s.get("river_cell") is not None:
                cell_to_port[2 * N_CELL + s["river_cell"]] = s["name"]
        elif s.get("river_cell") is not None:
            cell_to_wharf[s["cell"]] = s["name"]
            cell_to_wharf[2 * N_CELL + s["river_cell"]] = s["name"]
    for rc2_sh, wc1_sh in graph.get("shim_mouth_links", []):
        cell_to_port.setdefault(rc2_sh, "Shim")
        cell_to_port.setdefault(wc1_sh, "Shim")
    for rc2_fp, wc1_fp in graph.get("farport_mouth_links", []):
        cell_to_port.setdefault(rc2_fp, "Farport")
        cell_to_port.setdefault(wc1_fp, "Farport")

    spec_lookup = {}
    for cname, x0, y0, x1, y1, rkm, _, _ in graph["special_corridors"]:
        p0 = gtm.snap_to_land(world, x0, y0)
        p1 = gtm.snap_to_land(world, x1, y1)
        u = int(round(p0[1] * sv)) * GW + int(round(p0[0] * su))
        v = int(round(p1[1] * sv)) * GW + int(round(p1[0] * su))
        spec_lookup[(u, v)] = (cname, rkm)
        spec_lookup[(v, u)] = (cname, rkm)

    def get_nodes(sid_src, sid_dst, tkey):
        pol_s, pol_d = setts[sid_src]["polity"], setts[sid_dst]["polity"]
        reg = gtm.pick_pair_regime(pol_s, pol_d)
        u_src, u_dst = setts[sid_src]["cell"], setts[sid_dst]["cell"]
        if reg == "yeti":
            if sid_src in graph["yeti_sid_to_idx"]:
                pred = (graph["pred_yeti_bulk"] if tkey == "bulk" else graph["pred_yeti_comp"])[graph["yeti_sid_to_idx"][sid_src]]
                root_cell, leaf_cell, need_rev = u_src, u_dst, True
            else:
                pred = (graph["pred_yeti_bulk_rev"] if tkey == "bulk" else graph["pred_yeti_comp_rev"])[graph["yeti_sid_to_idx"][sid_dst]]
                root_cell, leaf_cell, need_rev = u_dst, u_src, False
        elif reg == "iziz_visas":
            if sid_src in graph["iziz_sid_to_idx"]:
                pred = (graph["pred_izv_bulk"] if tkey == "bulk" else graph["pred_izv_comp"])[graph["iziz_sid_to_idx"][sid_src]]
                root_cell, leaf_cell, need_rev = u_src, u_dst, True
            else:
                pred = (graph["pred_izv_bulk_rev"] if tkey == "bulk" else graph["pred_izv_comp_rev"])[graph["iziz_sid_to_idx"][sid_dst]]
                root_cell, leaf_cell, need_rev = u_dst, u_src, False
        elif reg == "iziz":
            if sid_src in graph["iziz_sid_to_idx"]:
                pred = (graph["pred_iziz_bulk"] if tkey == "bulk" else graph["pred_iziz_comp"])[graph["iziz_sid_to_idx"][sid_src]]
                root_cell, leaf_cell, need_rev = u_src, u_dst, True
            else:
                pred = (graph["pred_iziz_bulk_rev"] if tkey == "bulk" else graph["pred_iziz_comp_rev"])[graph["iziz_sid_to_idx"][sid_dst]]
                root_cell, leaf_cell, need_rev = u_dst, u_src, False
        elif reg == "voth":
            if sid_src in graph["voth_sid_to_idx"]:
                pred = (graph["pred_voth_bulk"] if tkey == "bulk" else graph["pred_voth_comp"])[graph["voth_sid_to_idx"][sid_src]]
                root_cell, leaf_cell, need_rev = u_src, u_dst, True
            else:
                pred = (graph["pred_voth_bulk_rev"] if tkey == "bulk" else graph["pred_voth_comp_rev"])[graph["voth_sid_to_idx"][sid_dst]]
                root_cell, leaf_cell, need_rev = u_dst, u_src, False
        else:
            pred = (graph["pred_bulk"] if tkey == "bulk" else graph["pred_comp"])[graph["sid_to_idx"][sid_src]]
            root_cell, leaf_cell, need_rev = u_src, u_dst, True

        nodes = []
        cur = leaf_cell
        steps = 0
        while cur != root_cell and cur >= 0 and steps < 12000:
            nodes.append(cur)
            cur = int(pred[cur])
            steps += 1
        if cur != root_cell:
            return None
        nodes.append(root_cell)
        if need_rev:
            nodes.reverse()
        return nodes

    def decompose_nodes(nodes, sid_src, sid_dst):
        legs = []
        cur_leg = None
        last_hub = setts[sid_src]["name"]

        def flush_leg(end_hub):
            nonlocal cur_leg
            if cur_leg and cur_leg["km"] > 0.1:
                cur_leg["end_hub"] = end_hub or cur_leg["end_hub"]
                cur_leg["sub_km"] = dict(cur_leg["sub_km"])
                legs.append(cur_leg)
            cur_leg = None

        for k in range(len(nodes) - 1):
            a, b = nodes[k], nodes[k + 1]
            la, lb = a // N_CELL, b // N_CELL
            ca, cb = a % N_CELL, b % N_CELL
            aj, ai = divmod(ca, GW)
            bj, bi = divmod(cb, GW)

            if la != lb:
                if 1 in (la, lb):
                    hub = cell_to_port.get(a) or cell_to_port.get(b) or nearest_hub(ca)[0]
                else:
                    hub = cell_to_wharf.get(a) or cell_to_wharf.get(b) or nearest_hub(ca)[0]
                flush_leg(hub)
                last_hub = hub
                continue

            cname = None
            if la == 0 and (a, b) in spec_lookup:
                cname, rkm = spec_lookup[(a, b)]
                step_km = rkm
                if "Drua Factor" in cname or "North Factor" in cname:
                    step_kind = "sea"
                    sub_type = "ring_sea_drua"
                else:
                    step_kind = "land"
                    sub_type = "corridor"
            else:
                step_km = 4.0 * math.hypot(bi - ai, bj - aj)
                if la == 1:
                    if graph["is_ring_sea"][aj, ai] or graph["is_ring_sea"][bj, bi]:
                        step_kind = "sea"
                        sub_type = "ring_sea"
                    elif (not graph["inland_lake"][aj, ai]) or (not graph["inland_lake"][bj, bi]):
                        step_kind = "sea"
                        sub_type = "nw_ocean"
                    else:
                        step_kind = "barge"
                        sub_type = "lake"
                elif la == 2:
                    step_kind = "barge"
                    sub_type = "canal" if (graph["canal_nav"][aj, ai] or graph["canal_nav"][bj, bi]) else "river"
                else:
                    step_kind = "land"
                    sub_type = "highway" if (graph["road_mult"][aj, ai] < 0.95 and graph["road_mult"][bj, bi] < 0.95) else "caravan"

            if cur_leg is not None and cur_leg["kind"] != step_kind:
                hub = cell_to_port.get(a) or cell_to_wharf.get(a) or nearest_hub(ca)[0]
                flush_leg(hub)
                last_hub = hub

            if cur_leg is None:
                cur_leg = {
                    "kind": step_kind,
                    "start_hub": last_hub,
                    "end_hub": setts[sid_dst]["name"],
                    "km": 0.0,
                    "sub_km": defaultdict(float),
                    "corridors": [],
                    "pol_cells": defaultdict(float),
                }
            cur_leg["km"] += step_km
            cur_leg["sub_km"][sub_type] += step_km
            if cname and cname not in cur_leg["corridors"]:
                cur_leg["corridors"].append(cname)
            if step_kind in ("land", "barge"):
                _, near_pol = nearest_hub(ca)
                cur_leg["pol_cells"][near_pol] += step_km

        flush_leg(setts[sid_dst]["name"])
        for lg in legs:
            lg["pol_cells"] = dict(lg["pol_cells"])
        return legs

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
    pirate_cove_shares = [(port_mira_sid, 0.34), (noas_sid, 0.31), (shanty_sid, 0.20), (boiling_sid, 0.15)]
    neutral_intermediaries = [(nephtos_sid, 18.0), (port_mira_sid, 20.0)]

    pol_members = defaultdict(list)
    for sid in sids:
        pol_members[setts[sid]["polity"]].append(sid)

    def single_leg_eff(sid_a, sid_b, is_bulk):
        pol_a, pol_b = setts[sid_a]["polity"], setts[sid_b]["polity"]
        reg = gtm.pick_pair_regime(pol_a, pol_b)
        if reg == "yeti":
            if sid_a in yeti_sid_to_idx:
                return float((graph["dist_yeti_bulk"] if is_bulk else graph["dist_yeti_comp"])[yeti_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            return float((graph["dist_yeti_bulk_rev"] if is_bulk else graph["dist_yeti_comp_rev"])[yeti_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        if reg == "iziz_visas":
            if sid_a in iziz_sid_to_idx:
                return float((graph["dist_izv_bulk"] if is_bulk else graph["dist_izv_comp"])[iziz_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            return float((graph["dist_izv_bulk_rev"] if is_bulk else graph["dist_izv_comp_rev"])[iziz_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        if reg == "iziz":
            if sid_a in iziz_sid_to_idx:
                return float((graph["dist_iziz_bulk"] if is_bulk else graph["dist_iziz_comp"])[iziz_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            return float((graph["dist_iziz_bulk_rev"] if is_bulk else graph["dist_iziz_comp_rev"])[iziz_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        if reg == "voth":
            if sid_a in voth_sid_to_idx:
                return float((graph["dist_voth_bulk"] if is_bulk else graph["dist_voth_comp"])[voth_sid_to_idx[sid_a], setts[sid_b]["cell"]])
            return float((graph["dist_voth_bulk_rev"] if is_bulk else graph["dist_voth_comp_rev"])[voth_sid_to_idx[sid_b], setts[sid_a]["cell"]])
        return float((graph["dist_bulk"] if is_bulk else graph["dist_comp"])[sid_to_idx[sid_a], setts[sid_b]["cell"]])

    def izani_leg_with_marr(sid_x, mid_sid, is_bulk, forward=True):
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
        if gtm.is_iziz_voth_war_pair(pol_a, pol_b):
            return best_war_intermediary(sid_a, sid_b, is_bulk)[0]
        return single_leg_eff(sid_a, sid_b, is_bulk)

    def compose_two_pinfo(p1, p2, mid_nm):
        comb_pirate = 1.0 - (1.0 - p1["pirate_rate"]) * (1.0 - p2["pirate_rate"])
        tot_rs = p1["ring_sea_km"] + p2["ring_sea_km"]
        exp_rs = p1["exposed_ring_sea_km"] + p2["exposed_ring_sea_km"]
        comb_war = (0.065 * min(1.0, exp_rs / max(tot_rs, 1.0))) if exp_rs >= 16.0 else 0.0
        ports = list(p1["ports"])
        if mid_nm and mid_nm not in ports:
            ports.append(mid_nm)
        for p in p2["ports"]:
            if not ports or ports[-1] != p:
                ports.append(p)
        return {
            "sea_km": p1["sea_km"] + p2["sea_km"],
            "ring_sea_km": tot_rs,
            "exposed_ring_sea_km": exp_rs,
            "ports": ports,
            "corridors": list(dict.fromkeys(p1["corridors"] + p2["corridors"])),
            "gateways": list(dict.fromkeys(p1["gateways"] + ([mid_nm] if mid_nm else []) + p2["gateways"])),
            "pirate_rate": comb_pirate,
            "naval_war_rate": comb_war,
        }

    pair_cache = {}

    def get_pair_full(sid_a, sid_b, tier):
        tkey = "bulk" if tier == "bulk" else "comp"
        key = (sid_a, sid_b, tkey)
        if key not in pair_cache:
            pol_a, pol_b = setts[sid_a]["polity"], setts[sid_b]["polity"]
            if gtm.is_iziz_voth_war_pair(pol_a, pol_b):
                eff, mid_sid, use_marr = best_war_intermediary(sid_a, sid_b, tkey == "bulk")
                if not np.isfinite(eff) or not mid_sid:
                    pair_cache[key] = (eff, None, [])
                    return pair_cache[key]
                hops = []
                if use_marr and setts[sid_a]["polity"] in ("Empire of Iziz", "Tiguantin") and sid_a != marr_sid:
                    pa1 = gtm.analyze_pair_path(world, graph, setts, sid_a, marr_sid, tkey)
                    pa2 = gtm.analyze_pair_path(world, graph, setts, marr_sid, mid_sid, tkey)
                    p1 = compose_two_pinfo(pa1, pa2, "Marr") if (pa1 and pa2) else gtm.analyze_pair_path(world, graph, setts, sid_a, mid_sid, tkey)
                    hops += [(sid_a, marr_sid), (marr_sid, mid_sid)]
                else:
                    p1 = gtm.analyze_pair_path(world, graph, setts, sid_a, mid_sid, tkey)
                    hops.append((sid_a, mid_sid))
                if use_marr and setts[sid_b]["polity"] in ("Empire of Iziz", "Tiguantin") and sid_b != marr_sid:
                    pb1 = gtm.analyze_pair_path(world, graph, setts, mid_sid, marr_sid, tkey)
                    pb2 = gtm.analyze_pair_path(world, graph, setts, marr_sid, sid_b, tkey)
                    p2 = compose_two_pinfo(pb1, pb2, "Marr") if (pb1 and pb2) else gtm.analyze_pair_path(world, graph, setts, mid_sid, sid_b, tkey)
                    hops += [(mid_sid, marr_sid), (marr_sid, sid_b)]
                else:
                    p2 = gtm.analyze_pair_path(world, graph, setts, mid_sid, sid_b, tkey)
                    hops.append((mid_sid, sid_b))
                pinfo = compose_two_pinfo(p1, p2, setts[mid_sid]["name"]) if (p1 and p2) else None
                if pinfo:
                    pinfo.pop("pts", None)
                    pinfo["war_via"] = setts[mid_sid]["name"]
                all_legs = []
                for ha, hb in hops:
                    ns = get_nodes(ha, hb, tkey)
                    if ns:
                        all_legs.extend(decompose_nodes(ns, ha, hb))
                pair_cache[key] = (eff, pinfo, all_legs)
            else:
                eff = single_leg_eff(sid_a, sid_b, tkey == "bulk")
                if not np.isfinite(eff):
                    pair_cache[key] = (eff, None, [])
                    return pair_cache[key]
                pinfo = gtm.analyze_pair_path(world, graph, setts, sid_a, sid_b, tkey)
                if pinfo:
                    pinfo.pop("pts", None)
                ns = get_nodes(sid_a, sid_b, tkey)
                all_legs = decompose_nodes(ns, sid_a, sid_b) if ns else []
                pair_cache[key] = (eff, pinfo, all_legs)
        return pair_cache[key]

    cross_flows = []
    domestic_flows = []
    MILITARY_GOODS = {"mech-parts", "rockets", "firearms", "armor", "weapons", "gunpowder"}

    for g in gtm.GOODS:
        gid = g["id"]
        unit = g["unit"]
        tier = g["tier"]
        alpha = gtm.TIER_ALPHA[tier]
        sellers, buyers = [], []

        for pol, members in pol_members.items():
            if pol in ("Ring Sea Pirates", "Lizardmen", "Screamer Country"):
                continue
            tot_s = sum(setts[m]["supply"].get(gid, 0.0) for m in members)
            tot_d = sum(setts[m]["demand"].get(gid, 0.0) for m in members)

            if len(members) >= 2 and pol not in UMBRELLA_GROUPS:
                dom_s = [(m, setts[m]["supply"].get(gid, 0.0) - setts[m]["demand"].get(gid, 0.0))
                         for m in members if setts[m]["supply"].get(gid, 0.0) > setts[m]["demand"].get(gid, 0.0) + 1e-6]
                dom_b = [(m, setts[m]["demand"].get(gid, 0.0) - setts[m]["supply"].get(gid, 0.0))
                         for m in members if setts[m]["demand"].get(gid, 0.0) > setts[m]["supply"].get(gid, 0.0) + 1e-6]
                if dom_s and dom_b:
                    F_dom = np.zeros((len(dom_s), len(dom_b)), dtype=np.float64)
                    for j_d, (mb, b_nd) in enumerate(dom_b):
                        ws_d = []
                        for ms, s_av in dom_s:
                            ek = fast_eff(ms, mb, tier)
                            if not np.isfinite(ek):
                                ws_d.append(0.0); continue
                            if gid == "milk" and ek > 200.0:
                                ws_d.append(0.0); continue
                            if gid == "food" and ek > 260.0:
                                ws_d.append(0.0); continue
                            if gid == "timber" and ek > 260.0:
                                ws_d.append(0.0); continue
                            if gid == "eggs" and ek > 330.0:
                                ws_d.append(0.0); continue
                            if gid == "fruit" and ek > 430.0:
                                ws_d.append(0.0); continue
                            if gid == "brick" and ek > 210.0:
                                ws_d.append(0.0); continue
                            if tier == "bulk" and ek > (1180.0 if gid == "salt" else 780.0):
                                ws_d.append(0.0); continue
                            ws_d.append(s_av / ((ek + 25.0) ** alpha))
                        sw_d = sum(ws_d)
                        if sw_d > 0:
                            for i_d, w_d in enumerate(ws_d):
                                F_dom[i_d, j_d] = b_nd * (w_d / sw_d)
                    for _ in range(4):
                        rs_d = F_dom.sum(axis=1)
                        for i_d, (_, s_av) in enumerate(dom_s):
                            if rs_d[i_d] > s_av and rs_d[i_d] > 0:
                                F_dom[i_d, :] *= s_av / rs_d[i_d]
                        cs_d = F_dom.sum(axis=0)
                        for j_d, (_, b_nd) in enumerate(dom_b):
                            if cs_d[j_d] > b_nd and cs_d[j_d] > 0:
                                F_dom[:, j_d] *= b_nd / cs_d[j_d]
                    for i_d, (ms, _) in enumerate(dom_s):
                        for j_d, (mb, _) in enumerate(dom_b):
                            amt_d = float(F_dom[i_d, j_d])
                            if amt_d > 1e-3:
                                _, _, d_legs = get_pair_full(ms, mb, tier)
                                domestic_flows.append({
                                    "gid": gid, "unit": unit, "tier": tier, "pol": pol,
                                    "s_sid": ms, "b_sid": mb, "amt": amt_d, "legs": d_legs,
                                })

            if tot_s > tot_d + 1e-6:
                net_s = tot_s - tot_d
                pos = [(m, max(0.0, setts[m]["supply"].get(gid, 0.0) - setts[m]["demand"].get(gid, 0.0))) for m in members]
                sum_pos = sum(v for _, v in pos) or 1.0
                for m, v in pos:
                    if v > 0:
                        sellers.append((m, net_s * (v / sum_pos)))
            elif tot_d > tot_s + 1e-6:
                net_d = tot_d - tot_s
                neg = [(m, max(0.0, setts[m]["demand"].get(gid, 0.0) - setts[m]["supply"].get(gid, 0.0))) for m in members]
                sum_neg = sum(v for _, v in neg) or 1.0
                for m, v in neg:
                    if v > 0:
                        buyers.append((m, net_d * (v / sum_neg)))

        market_vol = min(sum(v for _, v in sellers), sum(v for _, v in buyers))
        raw_flows_g = []
        captured_pool = 0.0

        if market_vol > 1e-6 and sellers and buyers:
            buyer_weights = []
            for b_sid, b_need in buyers:
                b_pol = setts[b_sid]["polity"]
                w_row = []
                for s_sid, s_avail in sellers:
                    s_pol = setts[s_sid]["polity"]
                    if s_pol == b_pol:
                        w_row.append(0.0); continue
                    if {s_pol, b_pol} == {"Order of Historians", "Vothic Kingdom"}:
                        w_row.append(0.0); continue
                    if gid in ("rockets", "firearms", "gunpowder") and b_pol in ("Coyote Kingdom", "Dilihan Province"):
                        w_row.append(0.0); continue
                    if {s_pol, b_pol} == {"Yeti Kingdom", "Eternal State"} or {s_pol, b_pol} == {"Sasquatch Tribes", "Eternal State"}:
                        w_row.append(0.0); continue
                    if {s_pol, b_pol} == {"Ria Valley", "The Crook"}:
                        w_row.append(0.0); continue
                    war_pair = gtm.is_iziz_voth_war_pair(s_pol, b_pol)
                    if war_pair and (gid in MILITARY_GOODS or tier == "bulk"):
                        w_row.append(0.0); continue
                    if "Beast Riders" in (s_pol, b_pol):
                        other_pol = b_pol if s_pol == "Beast Riders" else s_pol
                        if other_pol not in gtm.INNER_CRATER_POLS:
                            w_row.append(0.0); continue
                    br_iz_pair = ("Beast Riders" in (s_pol, b_pol)) and (s_pol in gtm.IZIZ_IMPERIAL_POLS or b_pol in gtm.IZIZ_IMPERIAL_POLS)
                    if br_iz_pair and gid in MILITARY_GOODS:
                        w_row.append(0.0); continue
                    ka_iz_pair = ("Kautoa" in (s_pol, b_pol)) and (s_pol in gtm.IZIZ_IMPERIAL_POLS or b_pol in gtm.IZIZ_IMPERIAL_POLS)
                    if ka_iz_pair and gid in MILITARY_GOODS:
                        w_row.append(0.0); continue
                    if {s_pol, b_pol} == {"Kautoa", "League: Tethys"} and (gid in MILITARY_GOODS or gid == "ship-hulls"):
                        w_row.append(0.0); continue
                    if ("Kautoa" in (s_pol, b_pol)) and (s_pol.startswith("League:") or b_pol.startswith("League:")) and gid in MILITARY_GOODS:
                        w_row.append(0.0); continue
                    if s_pol in gtm.THRONE_COLONIAL_POLS and b_pol in ("Zeijani", "Andaru") and gid in MILITARY_GOODS:
                        w_row.append(0.0); continue
                    if (s_pol in ("Yeti Kingdom", "Sasquatch Tribes") or b_pol in ("Yeti Kingdom", "Sasquatch Tribes")) and tier == "bulk":
                        w_row.append(0.0); continue
                    if "Nomad Country" in (s_pol, b_pol):
                        if setts[s_sid]["name"] not in gtm.EASTERN_NOMAD_ALLOWED_PINS or setts[b_sid]["name"] not in gtm.EASTERN_NOMAD_ALLOWED_PINS:
                            w_row.append(0.0); continue
                    eff_km = fast_eff(s_sid, b_sid, tier)
                    if not np.isfinite(eff_km):
                        w_row.append(0.0); continue
                    if gid == "milk" and eff_km > 190.0:
                        w_row.append(0.0); continue
                    if gid == "food" and eff_km > 240.0:
                        w_row.append(0.0); continue
                    if gid == "timber" and eff_km > 300.0:
                        w_row.append(0.0); continue
                    if gid == "eggs" and eff_km > 320.0:
                        w_row.append(0.0); continue
                    if gid == "fruit" and eff_km > 420.0:
                        w_row.append(0.0); continue
                    if gid == "peat" and eff_km > 480.0:
                        w_row.append(0.0); continue
                    if gid == "beer" and eff_km > 450.0:
                        w_row.append(0.0); continue
                    if gid == "brick" and eff_km > 210.0:
                        w_row.append(0.0); continue
                    if tier == "bulk" and eff_km > (1180.0 if gid == "salt" else 780.0):
                        w_row.append(0.0); continue
                    _, pinfo_chk, _ = get_pair_full(s_sid, b_sid, tier)
                    if gid == "mounts":
                        sea_m = pinfo_chk["sea_km"] if pinfo_chk else 0.0
                        eff_m = eff_km + 0.60 * sea_m
                        if eff_m > 460.0 or sea_m > 420.0:
                            w_row.append(0.0); continue
                        w = s_avail / ((eff_m + 45.0) ** 1.65)
                    elif gid == "spice-highland":
                        w = s_avail / ((eff_km + 65.0) ** (alpha * 0.55))
                    else:
                        w = s_avail / ((eff_km + 45.0) ** alpha)

                    if {s_pol, b_pol} == {"Vothic Kingdom", "Shumari"}:
                        if gid in MILITARY_GOODS:
                            w_row.append(0.0); continue
                        w *= 0.14
                    if {s_pol, b_pol} == {"Tiguantin", "Empire of Iziz"}:
                        w *= 1.55
                    if war_pair:
                        w *= 0.085
                    if br_iz_pair:
                        w *= 0.12
                    if {s_pol, b_pol} == {"Beast Riders", "Kautoa"}:
                        w *= 2.15
                    if ka_iz_pair:
                        w *= 0.32
                    if {s_pol, b_pol} == {"Kautoa", "League: Tethys"}:
                        w *= 0.08
                    elif ("Kautoa" in (s_pol, b_pol)) and (s_pol.startswith("League:") or b_pol.startswith("League:")):
                        w *= 0.28
                    if {s_pol, b_pol} == {"Zeijani", "Andaru"}:
                        w *= 1.85
                    elif (s_pol in ("Zeijani", "Andaru") and b_pol in gtm.THRONE_COLONIAL_POLS) or (b_pol in ("Zeijani", "Andaru") and s_pol in gtm.THRONE_COLONIAL_POLS):
                        w *= 0.48
                    if marr_sid in (s_sid, b_sid) and (
                        s_pol in ("Hookfleet", "League: Tethys", "Zeijani", "Andaru", "West Ring Islanders")
                        or b_pol in ("Hookfleet", "League: Tethys", "Zeijani", "Andaru", "West Ring Islanders")
                    ):
                        w *= 1.80
                    if (s_pol == "Vothic Kingdom" and b_pol.startswith("League:")) or (b_pol == "Vothic Kingdom" and s_pol.startswith("League:")):
                        w *= 0.20
                    if (s_pol == "Iron Republic" and b_pol in ("Dilihan Province", "Free Clans")) or (b_pol == "Iron Republic" and s_pol in ("Dilihan Province", "Free Clans")):
                        w *= 0.20
                    if "Free Giants (Vrivolci)" in (s_pol, b_pol) and ("Realm of Dalab" in (s_pol, b_pol) or "Vothic Kingdom" in (s_pol, b_pol)):
                        w *= 0.25
                    if "Frogmen" in (s_pol, b_pol):
                        if "Realm of Dalab" in (s_pol, b_pol):
                            w *= 1.35
                        elif any(nb in (s_pol, b_pol) for nb in ("Vothic Kingdom", "Yusar (Cybernetics)", "Iron Republic", "Shumari", "Scyvoi", "Free Giants (Vrivolci)")):
                            w *= 0.22
                    if {s_pol, b_pol} == {"Coyote Kingdom", "Nomad Country"}:
                        w *= 0.45
                    if pinfo_chk and any("Annual Great Caravan" in c for c in pinfo_chk.get("corridors", [])):
                        w *= (0.14 if tier == "bulk" else 0.55)
                    if "Beast Riders" in (s_pol, b_pol) and pinfo_chk and pinfo_chk.get("sea_km", 0) > 0:
                        if any(kp in pinfo_chk.get("ports", []) or kp in pinfo_chk.get("gateways", []) for kp in ("Kautoa", "Valapo", "Bipo")):
                            w *= 1.65
                        else:
                            w *= 0.20
                    if "Yeti Kingdom" in (s_pol, b_pol) and pinfo_chk:
                        if any(ep in pinfo_chk.get("ports", []) or ep in pinfo_chk.get("gateways", []) for ep in ("Lux", "Fulcrum", "Bastion", "Palewharf", "Farport")):
                            w = 0.0
                    if "Nomad Country" in (s_pol, b_pol):
                        if not pinfo_chk or pinfo_chk.get("sea_km", 0.0) > 0.0:
                            w = 0.0
                        elif any(bp in pinfo_chk.get("ports", []) or bp in pinfo_chk.get("gateways", []) for bp in gtm.EASTERN_NOMAD_BLOCKED_TRANSIT):
                            w = 0.0
                    if (s_pol.startswith("League:") or b_pol.startswith("League:")) and ("Vothic Kingdom" not in (s_pol, b_pol)) and pinfo_chk:
                        if any(vp in pinfo_chk.get("ports", []) for vp in ("Voth", "Shim", "Almua", "Zey'danin", "Torus")):
                            w *= 0.35
                    if "Iron Republic" in (s_pol, b_pol) and pinfo_chk:
                        if any(dp in pinfo_chk.get("ports", []) or dp in pinfo_chk.get("gateways", []) for dp in ("Dilihan", "Port Visas", "Ardent")):
                            if b_pol not in ("Dilihan Province", "Free Clans") and s_pol not in ("Dilihan Province", "Free Clans"):
                                w *= 0.38
                    if "Painted Men" in (s_pol, b_pol):
                        w *= 0.45
                    w_row.append(w)
                buyer_weights.append((b_sid, b_need, w_row))

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
                    _, pinfo, f_legs = get_pair_full(s_sid, b_sid, tier)
                    prate = pinfo["pirate_rate"] if pinfo else 0.0
                    wrate = pinfo.get("naval_war_rate", 0.0) if pinfo else 0.0
                    tot_rate = min(0.18, prate + wrate)
                    taken = amt * tot_rate
                    delivered = amt - taken
                    if taken > 1e-4:
                        taken_pir = amt * prate + 0.50 * (amt * wrate)
                        taken_mid = max(0.0, taken - taken_pir)
                        captured_pool += taken_pir
                        war_prize_pool += taken_mid
                    raw_flows_g.append((s_sid, b_sid, delivered, False, pinfo.get("war_via") if pinfo else None, f_legs))

            if captured_pool > 1e-4:
                for pir_sid, pir_share in pirate_cove_shares:
                    cove_pool = captured_pool * pir_share * 0.92
                    if cove_pool <= 1e-4:
                        continue
                    pir_pol = setts[pir_sid]["polity"]
                    fence_cands = []
                    for b_sid, b_need in buyers:
                        b_pol = setts[b_sid]["polity"]
                        if b_sid == nephtos_sid or b_pol == pir_pol or b_pol == "Nomad Country" or (gid == "books" and b_pol == "Vothic Kingdom"):
                            continue
                        eff_km, pinfo, f_legs = get_pair_full(pir_sid, b_sid, tier)
                        if np.isfinite(eff_km) and pinfo is not None and pinfo["sea_km"] > 0 and eff_km < 430.0:
                            wf = b_need / ((eff_km + 35.0) ** 1.2)
                            if b_sid == marr_sid:
                                wf *= 2.6
                            fence_cands.append((b_sid, wf, f_legs))
                    sw_f = sum(x[1] for x in fence_cands)
                    if sw_f > 0:
                        for b_sid, w_f, f_legs in fence_cands:
                            share_f = cove_pool * (w_f / sw_f)
                            if share_f > 1e-4:
                                raw_flows_g.append((pir_sid, b_sid, share_f, True, None, f_legs))

            if war_prize_pool > 1e-4:
                for mid_sid, mid_share in ((port_mira_sid, 1.0),):
                    sub_pool = war_prize_pool * mid_share * 0.92
                    if sub_pool <= 1e-4:
                        continue
                    mid_pol = setts[mid_sid]["polity"]
                    mid_cands = []
                    for b_sid, b_need in buyers:
                        b_pol = setts[b_sid]["polity"]
                        if b_sid == nephtos_sid or b_pol == mid_pol or b_pol == "Nomad Country" or (gid == "books" and b_pol == "Vothic Kingdom"):
                            continue
                        eff_km, pinfo, f_legs = get_pair_full(mid_sid, b_sid, tier)
                        if np.isfinite(eff_km) and pinfo is not None and pinfo["sea_km"] > 0 and eff_km < 460.0:
                            wm = b_need / ((eff_km + 35.0) ** 1.2)
                            if b_sid == marr_sid:
                                wm *= 2.6
                            mid_cands.append((b_sid, wm, f_legs))
                    sw_m = sum(x[1] for x in mid_cands)
                    if sw_m > 0:
                        for b_sid, w_m, f_legs in mid_cands:
                            share_m = sub_pool * (w_m / sw_m)
                            if share_m > 1e-4:
                                raw_flows_g.append((mid_sid, b_sid, share_m, False, "Port Mira (Prize)", f_legs))

        for s_sid, b_sid, amt, is_pir, war_via, f_legs in raw_flows_g:
            cross_flows.append({
                "gid": gid, "unit": unit, "tier": tier,
                "s_sid": s_sid, "b_sid": b_sid, "amt": amt,
                "is_pirate": is_pir, "war_via": war_via, "legs": f_legs,
            })

    sett_meta = {
        sid: {
            "id": sid, "name": s["name"], "polity": s["polity"],
            "px": s["px"], "py": s["py"], "population": s["population"],
            "type": s["type"], "is_ring_sea_port": s.get("is_ring_sea_port", False),
            "has_water": s.get("water_cell") is not None,
            "has_river": s.get("river_cell") is not None,
            "abstract_region": s.get("abstract_region", False),
        }
        for sid, s in setts.items()
    }
    return {"setts": sett_meta, "goods": gtm.GOODS, "cross_flows": cross_flows, "domestic_flows": domestic_flows}


def load_or_build_flows(cache_path=None):
    if cache_path and os.path.exists(cache_path):
        return pickle.load(open(cache_path, "rb"))
    data = extract_flows_from_model()
    if cache_path:
        pickle.dump(data, open(cache_path, "wb"))
    return data


def classify_named_overland_corridor(a, b, lg, s_name, b_name):
    """Group fragmented overland segments onto major recognizable Game World Trade Corridors."""
    corrs = " | ".join(lg["corridors"])
    pts = {a, b, s_name, b_name}
    if "Annual Great Caravan" in corrs:
        return "Annual Great Caravan (Nulab <-> Erehwon North Rift Bench)"
    if "Iziz-Guarded Visas Caravan" in corrs or ("Dilihan" in pts and "Port Visas" in pts):
        return "Iziz-Guarded Visas Corridor (Dilihan <-> Port Visas)"
    if "Tungang" in corrs or "Loj Fower" in corrs:
        return "Tungang Rift-Line Bore & Cliff Lifts (Dalab <-> Shelf <-> Ledge <-> Nulab)"
    if "Span Basin Tunnel" in corrs or ("Span" in (a, b) and ("Dalab" in (a, b) or "Cascade" in (a, b))):
        return "Span Basin Tunnel Corridor (Dalab <-> Span <-> SW Highlands)"
    if "Inner Wall Karst Tunnel" in corrs or ({a, b} == {"Cascade", "Drum"}):
        return "Inner Wall Karst Tunnel (Cascade <-> Drum)"
    if any(x in (a, b) for x in ("Parabola", "Bab al-Hawa (Godsgate)", "Kolli Oasis", "Arfwai Oasis", "Catch Salt Works", "Stair", "The Twins", "White Gills Hermitage", "Strongbow")):
        return "Catch & Twins Trans-Rift Caravan Chain (Marr/Parabola <-> Catch <-> Twins <-> Strongbow)"
    if "God's Road" in corrs or ("Spider Lake Weirs" in (a, b) and "Pinnacle Rock" in (a, b)):
        return "God's Road North (Pinnacle Rock <-> Spider Lake)"
    if "Korona" in corrs or "Arachnoid Gorge" in corrs or "Ham-Tsek" in corrs:
        return "Korona Guided Silk & Tepui Trail (Silkhead <-> Korona <-> Spider Lake)"
    if any(x in corrs for x in ("Outland Gate", "Hau-Gel", "Tierhound", "Great Chasm", "East Bench", "Loom-Chasms", "Klira Guli")):
        return "Outlands & East Rim Trail (Spider Lake <-> Gate <-> Sill <-> Spindle Fan)"
    if "Arete Basalt" in corrs or "Yuni SE Scarp" in corrs:
        return "Yuni SE Scarp & Siphon Basalt Bridges (Yuni <-> Ostrukh <-> Siphon)"
    if "High Rift Quartz" in corrs or "Longsong" in (a, b):
        return "Oidong High-Rift Monastery Trail (Strongbow <-> Longsong <-> Singing Gjar)"
    if any(x in (a, b) for x in ("Qoold Lheek", "Leng")):
        return "Northern Yeti Frontier Dirt Road (Qoold Lheek <-> Leng <-> Jimjam)"
    if any(x in (a, b) for x in ("Carcosa", "Henge")):
        return "Valley of the Ancients Rim Trail (Carcosa/Henge <-> Palewharf/Fulcrum)"
    if ("Lux" in (a, b) or "Palewharf" in (a, b) or "Fulcrum" in (a, b)) and any(x in (a, b) for x in ("Tethis", "Trigon", "Dilihan", "Jimjam")):
        return "The Cut & NW Wall Trunk Highway (Eternia/Jimjam <-> Tethis/Ring Sea)"
    if any(x in (a, b) for x in ("Roketstad", "Cascade", "Stahlborn", "Glaive")) and any(x in (a, b) for x in ("Tethis", "Trigon", "Pontus", "Almua")):
        return "Iron Republic–Ring Sea Trunk Highway (Roketstad/Cascade <-> Tethis/Almua)"
    if any(x in (a, b) for x in ("Iziz", "Marr", "Port Tobin", "Hook", "Pylon", "Arcbeam")) and any(x in (a, b) for x in ("Iziz", "Marr", "Port Tobin", "Hook", "Pylon", "Arcbeam")):
        return "Izani Heartland Port-to-Capital Highways (Marr/Port Tobin/Hook <-> Iziz)"
    if any(x in (a, b) for x in ("Yuni", "Locus", "Verge", "Talia", "Jabal", "Bowl Salt Works", "Sfenops", "Liikofi")):
        return "Dasri & East Abyss Trunk Network (Talia/Jabal <-> Verge <-> Yuni <-> Abyss)"
    if any(x in (a, b) for x in ("Voth", "Shim", "Driyan", "Azoth", "Sethas", "Amaro", "Tallwalls", "Torus", "Spirladunon")):
        return "SW Bay, Shumar & Highland Foothill Roads (Voth/Shim <-> Driyan/Torus/Amaro)"
    return f"{min(a, b)} <-> {max(a, b)}"


def build_fleets_json(cache_path=None):
    data = load_or_build_flows(cache_path=cache_path)
    setts = data["setts"]
    name_to_pol = {s["name"]: s["polity"] for s in setts.values()}
    tg_json = json.load(open(os.path.join(ROOT, "openworld", "trade-gemini.json"), encoding="utf-8"))

    def reclassify_leg(lg):
        a, b = lg["start_hub"], lg["end_hub"]
        pol_a, pol_b = name_to_pol.get(a, ""), name_to_pol.get(b, "")
        corrs = lg["corridors"]
        if lg["kind"] == "barge":
            # Coastal bay/lagoon cells adjacent to Ring Sea ports are coastal sea hops, NOT river barges!
            if pol_a in ("League: Trigon", "Kautoa", "West Ring Islanders", "Hookfleet", "League: Tethys", "League: Ys", "League: Pontus", "Shell Province") and pol_b not in TRUE_BARGE_POLS:
                return "sea", "ring_sea"
            if pol_b in ("League: Trigon", "Kautoa", "West Ring Islanders", "Hookfleet", "League: Tethys", "League: Ys", "League: Pontus", "Shell Province") and pol_a not in TRUE_BARGE_POLS:
                return "sea", "ring_sea"
            # Hypersaline Bowl salt pan & unnavigable upland creeks -> overland caravan
            if "Bowl Salt Works" in (a, b) or "Mantis" in (a, b) or (pol_a not in TRUE_BARGE_POLS and pol_b not in TRUE_BARGE_POLS):
                return "land", "pack_trail"
            sub = max(lg["sub_km"].items(), key=lambda kv: kv[1])[0] if lg["sub_km"] else "river"
            return "barge", sub
        if lg["kind"] == "sea":
            if lg["sub_km"].get("nw_ocean", 0.0) > 0.2 * lg["km"] or pol_a in SEAGOING_OCEAN_POLS or pol_b in SEAGOING_OCEAN_POLS:
                return "sea", "nw_ocean"
            return "sea", "ring_sea"
        if any("Annual Great Caravan" in c for c in corrs):
            return "land", "annual_caravan"
        if any("Tungang" in c for c in corrs) or lg["sub_km"].get("highway", 0.0) >= 0.45 * lg["km"]:
            return "land", "highway"
        return "land", "pack_trail"

    def assign_sea_flags(a, b, sub_cls, s_pol, b_pol, is_pirate, war_via, is_dom):
        pol_a, pol_b = name_to_pol.get(a, ""), name_to_pol.get(b, "")
        if sub_cls == "nw_ocean":
            if "Ria Valley" in (pol_a, pol_b, s_pol, b_pol):
                return {"Ria Valley": 1.0}
            if "The Crook" in (pol_a, pol_b, s_pol, b_pol):
                return {"The Crook": 1.0}
            return {"Ria Valley": 0.55, "The Crook": 0.45}

        if "Beast Riders" in (pol_a, pol_b) or a in ("Mav's Refuge", "Talon") or b in ("Mav's Refuge", "Talon"):
            return {"Kautoa": 1.0}

        if is_pirate:
            if pol_a == "Ring Sea Pirates" or s_pol == "Ring Sea Pirates":
                return {"Ring Sea Pirates": 1.0}
            if pol_a == "Hookfleet" or s_pol == "Hookfleet":
                if pol_b in SEAGOING_RINGSEA_POLS and pol_b != "Hookfleet":
                    return {"Hookfleet": 0.75, pol_b: 0.25}
                return {"Hookfleet": 1.0}
            return {"Ring Sea Pirates": 1.0}

        if war_via:
            if "Nephtos" in war_via:
                other = pol_b if pol_a == "League: Tethys" else pol_a
                if other in SEAGOING_RINGSEA_POLS and other != "League: Tethys":
                    return {"League: Tethys": 0.65, "League: Ys": 0.15, other: 0.20}
                return {"League: Tethys": 0.80, "League: Ys": 0.20}
            if "Port Mira" in war_via:
                other = pol_b if pol_a == "Hookfleet" else pol_a
                if other in SEAGOING_RINGSEA_POLS and other != "Hookfleet":
                    return {"Hookfleet": 0.72, other: 0.28}
                return {"Hookfleet": 1.0}

        sg_a = pol_a if pol_a in SEAGOING_RINGSEA_POLS else None
        sg_b = pol_b if pol_b in SEAGOING_RINGSEA_POLS else None
        if is_dom and sg_a and sg_a == sg_b:
            return {sg_a: 1.0}

        scores = defaultdict(float)

        def add_pool(sg_pol, is_owner):
            if not sg_pol:
                return
            wm = 1.20 if is_owner else 1.0
            if sg_pol == "League: Tethys" and ("Tethis" in (a, b)):
                scores["League: Tethys"] += 0.62 * wm
                scores["League: Ys"] += 0.38 * wm
                scores["League: Trigon"] += 0.12 * wm
                scores["League: Pontus"] += 0.10 * wm
                scores["Hookfleet"] += 0.08
            elif sg_pol == "West Ring Islanders":
                scores["West Ring Islanders"] += 0.55 * wm
                scores["League: Ys"] += 0.16
                scores["League: Tethys"] += 0.14
                scores["Hookfleet"] += 0.08
            elif sg_pol == "Kautoa":
                scores["Kautoa"] += 0.85 * wm
                scores["League: Ys"] += 0.10
                scores["Hookfleet"] += 0.08
            else:
                wt = {"League: Ys": 1.35, "League: Tethys": 1.25, "Hookfleet": 1.30,
                      "League: Trigon": 1.15, "League: Pontus": 1.15,
                      "Vothic Kingdom": 1.05, "Empire of Iziz": 1.05, "Shell Province": 0.90}.get(sg_pol, 1.0)
                scores[sg_pol] += wt * wm

        add_pool(sg_a, sg_a in (s_pol, b_pol))
        add_pool(sg_b, sg_b in (s_pol, b_pol))

        if pol_a == "Vothic Kingdom" or pol_b == "Vothic Kingdom":
            scores.pop("Empire of Iziz", None)
            scores.pop("Shell Province", None)
        if pol_a in ("Empire of Iziz", "Shell Province") or pol_b in ("Empire of Iziz", "Shell Province"):
            scores.pop("Vothic Kingdom", None)

        tot = sum(scores.values())
        return {k: v / tot for k, v in scores.items()} if tot > 0 else {"League: Ys": 0.5, "League: Tethys": 0.5}

    def assign_barge_flags(a, b):
        a_pol, b_pol_h = name_to_pol.get(a, ""), name_to_pol.get(b, "")
        pair_pols = {a_pol, b_pol_h}
        if "Jimjam" in (a, b) or ("Palewharf" in (a, b) and "Jimjam" in pair_pols):
            return {"Jimjam": 0.58, "Eternal State": 0.42}
        if "Serai" in (a, b) or "Silkhead" in (a, b):
            return {"Jimjam": 0.60, "Silkhead (Korona Gateway)": 0.40}
        if pair_pols <= {"Eternal State"} or any(x in (a, b) for x in ("Fulcrum", "Lux", "Mirabilis", "Bastion", "Farport", "Sheritu", "Tone", "Palewharf")):
            return {"Eternal State": 1.0}
        if "Dapor" in (a, b) and ("Shim" in (a, b) or "Voth" in (a, b)):
            return {"Realm of Dalab": 0.55, "Vothic Kingdom": 0.45}
        if pair_pols <= {"Vothic Kingdom"} or "Shim" in (a, b) or "Voth" in (a, b):
            return {"Vothic Kingdom": 1.0}
        if "Ledge" in (a, b) or "Nulab" in (a, b):
            return {"Realm of Dalab": 0.55, "Tungang Union": 0.45}
        if pair_pols <= {"Empire of Iziz"} or any(x in (a, b) for x in ("Iziz", "Atton", "Gioli", "Port Tobin", "Pylon")):
            return {"Empire of Iziz": 1.0}
        if pair_pols <= {"Xanadu Sultanate"} or any(x in (a, b) for x in ("Erehwon", "Kirstabal", "Theodiga", "Thalaba", "Qiblai")):
            return {"Xanadu Sultanate": 1.0}
        if "Spider Lake Weirs" in (a, b):
            return {"Spider Lake Guilds": 1.0}
        if "Ostrukh-on-Water" in (a, b) or "Yuni Emirate" in pair_pols:
            return {"Yuni Emirate": 1.0}
        if "Reed" in (a, b) or "Nomad Country" in pair_pols:
            return {"Nomad Country": 1.0}
        if "Coyote Kingdom" in pair_pols:
            return {"Coyote Kingdom": 1.0}
        for c in (a_pol, b_pol_h):
            if c in TRUE_BARGE_POLS:
                return {c: 1.0}
        return {"Eternal State": 1.0}

    def assign_land_flags(a, b, lg, s_pol, b_pol, is_dom):
        no_carav = ISLAND_OR_EXTERIOR_NO_CARAVAN_POLS | PASSIVE_HOST_NO_CARAVAN_POLS
        enomad_leg_ok = (a in gtm.EASTERN_NOMAD_ALLOWED_PINS and b in gtm.EASTERN_NOMAD_ALLOWED_PINS)
        if is_dom and s_pol not in no_carav:
            return {s_pol: 1.0}
        a_pol, b_pol_h = name_to_pol.get(a, ""), name_to_pol.get(b, "")
        scores = defaultdict(float)
        for p, km in lg["pol_cells"].items():
            if p not in no_carav and p not in ("Lizardmen", "Screamer Country"):
                if p == "Nomad Country" and not enomad_leg_ok:
                    continue
                scores[p] += km * 0.75
        for hp in (a_pol, b_pol_h):
            if hp and hp not in no_carav and hp not in ("Lizardmen", "Screamer Country"):
                if hp == "Nomad Country" and not enomad_leg_ok:
                    continue
                scores[hp] += 0.35 * lg["km"]
        for ep in (s_pol, b_pol):
            if ep in scores and ep not in no_carav:
                scores[ep] *= 1.20
        for carav in ("Yuni Emirate", "Jimjam", "Nomad Country", "Jabal Shiekdom", "Catch Oasis Stations", "Realm of Dalab"):
            if carav in scores:
                scores[carav] *= 1.25
        tot = sum(scores.values())
        if tot > 0:
            return {k: v / tot for k, v in scores.items()}
        for cand in (a_pol, b_pol_h, s_pol, b_pol):
            if cand and cand not in no_carav and not (cand == "Nomad Country" and not enomad_leg_ok):
                return {cand: 1.0}
        return {"Empire of Iziz": 1.0}

    corridors = defaultdict(lambda: {
        "fwd_cross": 0.0, "rev_cross": 0.0,
        "fwd_dom": 0.0, "rev_dom": 0.0,
        "km_wt": 0.0, "tot_t": 0.0,
        "flag_cross": defaultdict(float),
        "flag_dom": defaultdict(float),
        "goods_t": defaultdict(float),
        "corridor_names": set(),
    })

    # Also aggregate overland macro-corridors for clean game-world corridor summary!
    macro_land = defaultdict(lambda: {
        "fwd_t": 0.0, "rev_t": 0.0, "ton_km": 0.0, "tot_t": 0.0,
        "carriers_cross": 0.0, "carriers_total": 0.0,
        "hwy_carriers": 0.0, "pack_carriers": 0.0,
        "flags": defaultdict(float), "goods_t": defaultdict(float),
    })

    foreign_flag_dep = defaultdict(lambda: defaultdict(float))
    hull_deliveries = defaultdict(float)
    mount_droves_pol = defaultdict(float)

    for fl, is_dom in [(f, False) for f in data["cross_flows"]] + [(f, True) for f in data["domestic_flows"]]:
        gid = fl["gid"]
        amt = fl["amt"]
        s_name = setts[fl["s_sid"]]["name"]
        b_name = setts[fl["b_sid"]]["name"]
        s_pol = setts[fl["s_sid"]]["polity"]
        b_pol = setts[fl["b_sid"]]["polity"]
        if gid == "ship-hulls" and not is_dom:
            hull_deliveries[s_pol] += amt

        for lg in fl["legs"]:
            kind, sub_cls = reclassify_leg(lg)
            a, b = lg["start_hub"], lg["end_hub"]
            if a == b:
                if lg["km"] < 16.0:
                    continue
                if kind == "barge":
                    if a == "Fulcrum":
                        a, b = "Fulcrum", "Lux"
                    elif a in ("Shim", "Voth"):
                        a, b = "Shim", "Voth"
                    elif a == "Dapor":
                        a, b = "Dapor", "Shim"
                    else:
                        a, b = a, f"{a} Waterway"
                elif kind == "sea":
                    continue
                else:
                    a, b = a, f"{a} Hinterland"

            if gid == "mounts" and kind == "land":
                sh = assign_land_flags(a, b, lg, s_pol, b_pol, is_dom)
                for p, frac in sh.items():
                    mount_droves_pol[p] += amt * lg["km"] * frac
                continue

            t = flow_tons(gid, fl["unit"], amt, kind)
            if t <= 1e-6:
                continue

            # Consolidate Annual Great Caravan onto single trunk key ("Nulab", "Erehwon")!
            if kind == "land" and sub_cls == "annual_caravan":
                # Check west->east vs east->west direction by x-coordinate!
                sx, bx = setts[fl["s_sid"]]["px"], setts[fl["b_sid"]]["px"]
                u, v = "Erehwon", "Nulab"
                is_fwd = (sx > bx)  # Erehwon -> Nulab if True, Nulab -> Erehwon if False
                leg_km_eff = 831.0  # North Rift Bench N1..N6 exact length (180+98+172+198+115+68 = 831 km)
            else:
                u, v = (a, b) if a < b else (b, a)
                is_fwd = (a < b)
                leg_km_eff = lg["km"]

            if kind == "sea":
                shares = assign_sea_flags(a, b, sub_cls, s_pol, b_pol, fl.get("is_pirate", False), fl.get("war_via"), is_dom)
                if not is_dom:
                    for end_pol in (s_pol, b_pol):
                        if end_pol not in ALL_SEAGOING_POLS:
                            for sg_pol, frac in shares.items():
                                foreign_flag_dep[end_pol][sg_pol] += t * frac
            elif kind == "barge":
                shares = assign_barge_flags(a, b)
            else:
                shares = assign_land_flags(a, b, lg, s_pol, b_pol, is_dom)

            rec = corridors[(kind, sub_cls, u, v)]
            if is_dom:
                if is_fwd:
                    rec["fwd_dom"] += t
                else:
                    rec["rev_dom"] += t
                for p, frac in shares.items():
                    rec["flag_dom"][p] += t * frac
            else:
                if is_fwd:
                    rec["fwd_cross"] += t
                else:
                    rec["rev_cross"] += t
                for p, frac in shares.items():
                    rec["flag_cross"][p] += t * frac
            rec["km_wt"] += leg_km_eff * t
            rec["tot_t"] += t
            rec["goods_t"][gid] += t
            rec["macro_name"] = classify_named_overland_corridor(a, b, lg, s_name, b_name) if kind == "land" else ""
            for cn in lg["corridors"]:
                rec["corridor_names"].add(cn)

    RESERVE_MULT = 1.15

    def cycle_and_cap(kind, sub_cls, km):
        if kind == "sea":
            if sub_cls == "nw_ocean":
                return 18.0, 260.0, 260.0, 1.0
            turn = 6.0 if km < 150.0 else 12.0
            rt = (2.0 * km) / 60.0 + turn
            act = 250.0
            return 9.0, rt, act, act / rt
        if kind == "barge":
            spd = 58.0 if sub_cls == "lake" else 48.0
            rt = (2.0 * km) / spd + 6.0
            act = 285.0
            return 18.5, rt, act, act / rt
        if sub_cls == "annual_caravan":
            return 4.5, 90.0, 90.0, 1.0
        if sub_cls == "highway":
            rt = (2.0 * km) / 34.0 + 5.0
            act = 290.0
            return 11.5, rt, act, act / rt
        rt = (2.0 * km) / 24.0 + 6.0
        act = 260.0
        return 4.5, rt, act, act / rt

    roster = defaultdict(lambda: defaultdict(float))
    sea_lanes_out = []
    barge_lanes_out = []

    for (kind, sub_cls, u, v), rec in corridors.items():
        km = rec["km_wt"] / max(rec["tot_t"], 1e-6)
        dom_cross = max(rec["fwd_cross"], rec["rev_cross"])
        dom_all = max(rec["fwd_cross"] + rec["fwd_dom"], rec["rev_cross"] + rec["rev_dom"])
        cap_t, rt_days, act_days, trips_yr = cycle_and_cap(kind, sub_cls, km)

        req_cross = (dom_cross / (cap_t * trips_yr)) * RESERVE_MULT if dom_cross > 0 else 0.0
        req_all = (dom_all / (cap_t * trips_yr)) * RESERVE_MULT if dom_all > 0 else 0.0
        req_dom = max(0.0, req_all - req_cross)

        tot_fc = sum(rec["flag_cross"].values())
        if tot_fc > 0 and req_cross > 0:
            for p, ft in rec["flag_cross"].items():
                sh = ft / tot_fc
                if kind == "sea":
                    roster[p]["sea_cross"] += req_cross * sh
                elif kind == "barge":
                    roster[p]["barge_cross"] += req_cross * sh
                elif sub_cls == "annual_caravan":
                    roster[p]["annual_units"] += req_cross * sh
                    roster[p]["pack_cross"] += req_cross * sh
                elif sub_cls == "highway":
                    roster[p]["hwy_cross"] += req_cross * sh
                else:
                    roster[p]["pack_cross"] += req_cross * sh

        tot_fd = sum(rec["flag_dom"].values())
        if tot_fd > 0 and req_dom > 0:
            for p, ft in rec["flag_dom"].items():
                sh = ft / tot_fd
                if kind == "sea":
                    roster[p]["sea_dom"] += req_dom * sh
                elif kind == "barge":
                    roster[p]["barge_dom"] += req_dom * sh
                elif sub_cls == "highway":
                    roster[p]["hwy_dom"] += req_dom * sh
                else:
                    roster[p]["pack_dom"] += req_dom * sh

        comb_flags = {k: rec["flag_cross"].get(k, 0.0) + rec["flag_dom"].get(k, 0.0)
                      for k in set(rec["flag_cross"]) | set(rec["flag_dom"])}
        tot_fl = sum(comb_flags.values()) or 1.0
        flag_pct = {p: round(100.0 * val / tot_fl, 1)
                    for p, val in sorted(comb_flags.items(), key=lambda kv: -kv[1])[:4]}
        top_g = [f"{g} ({round(vt, 1)} t)" for g, vt in sorted(rec["goods_t"].items(), key=lambda kv: -kv[1])[:5]]
        every_d = round(act_days / max(req_all * trips_yr, 0.01), 1) if req_all >= 0.05 else None

        row = {
            "u": u, "v": v, "u_polity": name_to_pol.get(u, ""), "v_polity": name_to_pol.get(v, ""),
            "sub_class": sub_cls, "km": round(km, 1),
            "u_to_v_tons": round(rec["fwd_cross"] + rec["fwd_dom"], 1),
            "v_to_u_tons": round(rec["rev_cross"] + rec["rev_dom"], 1),
            "intl_dominant_tons": round(dom_cross, 1),
            "total_dominant_tons": round(dom_all, 1),
            "round_trip_days": round(rt_days, 1),
            "trips_per_year": round(trips_yr, 2),
            "carriers_intl": round(req_cross, 2),
            "carriers_total": round(req_all, 2),
            "departure_every_days": every_d,
            "flag_shares_pct": flag_pct,
            "top_goods": top_g,
        }
        if kind == "sea":
            sea_lanes_out.append(row)
        elif kind == "barge":
            barge_lanes_out.append(row)
        else:
            mn = rec["macro_name"]
            ml = macro_land[mn]
            ml["fwd_t"] += rec["fwd_cross"] + rec["fwd_dom"]
            ml["rev_t"] += rec["rev_cross"] + rec["rev_dom"]
            ml["ton_km"] += km * rec["tot_t"]
            ml["tot_t"] += rec["tot_t"]
            ml["carriers_cross"] += req_cross
            ml["carriers_total"] += req_all
            if sub_cls == "highway":
                ml["hwy_carriers"] += req_all
            else:
                ml["pack_carriers"] += req_all
            for p, val in comb_flags.items():
                ml["flags"][p] += val
            for g, vt in rec["goods_t"].items():
                ml["goods_t"][g] += vt

    for p, hkm in mount_droves_pol.items():
        roster[p]["droves"] = (hkm / 14000.0) * RESERVE_MULT

    sea_lanes_out.sort(key=lambda x: -x["carriers_total"])
    barge_lanes_out.sort(key=lambda x: -x["carriers_total"])

    CORRIDOR_CANON_KM = {
        "Oidong High-Rift Monastery Trail (Strongbow <-> Longsong <-> Singing Gjar)": 480.0,
        "Yuni SE Scarp & Siphon Basalt Bridges (Yuni <-> Ostrukh <-> Siphon)": 410.0,
        "God's Road North (Pinnacle Rock <-> Spider Lake)": 640.0,
        "Korona Guided Silk & Tepui Trail (Silkhead <-> Korona <-> Spider Lake)": 520.0,
        "Inner Wall Karst Tunnel (Cascade <-> Drum)": 390.0,
    }

    land_corridors_out = []
    for mn, ml in sorted(macro_land.items(), key=lambda kv: -kv[1]["carriers_total"]):
        if ml["carriers_total"] < 0.45:
            continue
        tf = sum(ml["flags"].values()) or 1.0
        avg_km = CORRIDOR_CANON_KM.get(mn, round(ml["ton_km"] / max(ml["tot_t"], 1e-6), 1))
        land_corridors_out.append({
            "corridor": mn,
            "avg_leg_km": avg_km,
            "gross_tons_moved": round(ml["tot_t"], 1),
            "highway_wagon_convoys": round(ml["hwy_carriers"], 1),
            "pack_caravans": round(ml["pack_carriers"], 1),
            "carriers_intl": round(ml["carriers_cross"], 1),
            "carriers_total": round(ml["carriers_total"], 1),
            "operator_shares_pct": {p: round(100.0 * v / tf, 1) for p, v in sorted(ml["flags"].items(), key=lambda kv: -kv[1])[:4]},
            "top_goods": [f"{g} ({round(vt, 1)} t)" for g, vt in sorted(ml["goods_t"].items(), key=lambda kv: -kv[1])[:5]],
        })

    # Assemble complete 52-polity roster
    polities_out = []
    for pol, pmeta in sorted(tg_json["polities"].items(), key=lambda kv: -kv[1].get("population", 0)):
        r = roster[pol]
        sea_tot = r["sea_cross"] + r["sea_dom"]
        barge_tot = r["barge_cross"] + r["barge_dom"]
        hwy_tot = r["hwy_cross"] + r["hwy_dom"]
        pack_tot = r["pack_cross"] + r["pack_dom"]
        droves_tot = r["droves"]

        if pol in SEAGOING_RINGSEA_POLS:
            m_status = "Seagoing (Ring Sea)"
            assert sea_tot >= 0.0
            hull_list, phys_ships = allocate_cultural_hulls(pol, sea_tot)
            prof_note = CULTURAL_FLEET_PROFILES[pol]["escort_note"]
        elif pol in SEAGOING_OCEAN_POLS:
            m_status = "Exterior Pelagic Visitor (NW Ocean)"
            hull_list, phys_ships = allocate_cultural_hulls(pol, sea_tot)
            prof_note = CULTURAL_FLEET_PROFILES[pol]["escort_note"]
        else:
            assert sea_tot == 0.0, f"VIOLATION: {pol} got {sea_tot} sea ships!"
            hull_list, phys_ships = [], 0
            prof_note = ""
            if pol in TRUE_BARGE_POLS and barge_tot >= 0.2:
                m_status = "Inland Barge Only (0 Sea Ships)"
            elif pol in ("Lizardmen", "Screamer Country"):
                m_status = "Hostile / Closed (0 Trade)"
            else:
                m_status = "Landlocked / Non-Seafaring (0 Sea Ships)"

        n_barges = int(round(barge_tot)) if barge_tot >= 0.4 else (1 if barge_tot >= 0.12 else 0)
        n_wagons = int(round(hwy_tot)) if hwy_tot >= 0.4 else (1 if hwy_tot >= 0.15 else 0)
        n_packs = int(round(pack_tot)) if pack_tot >= 0.4 else (1 if pack_tot >= 0.15 else 0)
        n_droves = int(round(droves_tot)) if droves_tot >= 0.35 else 0

        # Foreign-flag shipping reliance for non-seagoing polities
        deps = sorted(foreign_flag_dep[pol].items(), key=lambda kv: -kv[1])
        tot_dep = sum(v for _, v in deps)
        if pol in ALL_SEAGOING_POLS:
            foreign_carriers = ["Own merchant fleet"]
        elif tot_dep > 0.5:
            foreign_carriers = [f"{kp} ({round(100.0 * vp / tot_dep)}%)" for kp, vp in deps[:3]]
        else:
            foreign_carriers = ["None (purely overland trade)" if (n_wagons + n_packs) > 0 else "None (closed)"]

        # Estimated beasts & crew/guards in active long-distance logistics
        beasts_est = n_wagons * 20 + n_packs * 35 + n_droves * 25
        hands_est = phys_ships * 18 + n_barges * 8 + n_wagons * 14 + n_packs * 12 + n_droves * 6

        polities_out.append({
            "polity": pol,
            "population": pmeta.get("population", 0),
            "maritime_status": m_status,
            "sea_ships_std_equiv": {"intl": round(r["sea_cross"], 2), "domestic": round(r["sea_dom"], 2), "total": round(sea_tot, 2)},
            "sea_ships_physical_hulls": phys_ships,
            "sea_hull_breakdown": hull_list,
            "naval_escort_note": prof_note,
            "inland_barges": {"intl": round(r["barge_cross"], 1), "domestic": round(r["barge_dom"], 1), "active_hulls": n_barges},
            "highway_wagon_convoys": {"intl": round(r["hwy_cross"], 1), "domestic": round(r["hwy_dom"], 1), "active_convoys": n_wagons},
            "pack_caravans": {"intl": round(r["pack_cross"], 1), "domestic": round(r["pack_dom"], 1), "active_caravans": n_packs,
                              "annual_great_caravan_units": round(r["annual_units"], 2)},
            "live_mount_droves": n_droves,
            "shipyard_exported_hulls_per_yr": round(hull_deliveries.get(pol, 0.0), 1),
            "foreign_sea_carriers_used": foreign_carriers,
            "est_draught_and_pack_beasts": beasts_est,
            "est_sailors_teamsters_guards": hands_est,
        })

    payload = {
        "format": "krator-trade-fleets-gemini",
        "version": 1,
        "date": "2026-11-14",
        "branch": "gemini-trade",
        "carrier_specs": {
            "ring_sea_standard_coaster": {
                "rated_cargo_t": 12.0, "avg_dominant_load_t": 9.0, "speed_km_day": 60.0,
                "port_turnaround_rt_days": 12.0, "active_days_yr": 250, "reserve_factor": 1.15,
                "examples": "Izani dhoni, Hykkousoi amphora corbita, Voth dhow, Kautoan drua, Hookfleet salvage tug",
            },
            "nw_ocean_pelagic_trader": {
                "rated_cargo_t": 24.0, "avg_dominant_load_t": 18.0, "trips_per_year": 1.0,
                "examples": "Ria Valley & The Crook trans-oceanic carracks calling at Farport Factory Quarter",
            },
            "inland_river_canal_lake_barge": {
                "rated_cargo_t": 25.0, "avg_dominant_load_t": 18.5, "speed_km_day_river": 48.0,
                "speed_km_day_lake": 58.0, "turnaround_rt_days": 6.0, "active_days_yr": 285,
                "examples": "50 m Shim river barge, Eternian canal lighter, Jimjam lake barge, Xanadu swan/bullion barge",
            },
            "highway_wagon_convoy": {
                "wagons": 10, "beasts": 20, "teamsters_and_guards": 14,
                "rated_cargo_t": 15.0, "avg_dominant_load_t": 11.5, "speed_km_day": 34.0,
                "turnaround_rt_days": 5.0, "active_days_yr": 290,
            },
            "pack_caravan": {
                "pack_beasts": 35, "drovers_and_stalker_guards": 12,
                "rated_cargo_t": 6.0, "avg_dominant_load_t": 4.5, "speed_km_day": 24.0,
                "turnaround_rt_days": 6.0, "active_days_yr": 260,
            },
            "annual_great_caravan": {
                "route": "Nulab <-> Erehwon (831 km North Rift Bench)",
                "trips_per_year": 1.0, "expedition_days_rt": 90.0,
                "note": "Single heavily-guarded annual mega-expedition carrying 100% of North Rift Bench freight in one muster",
            },
        },
        "world_totals": {
            "open_sea_sailing_ships_physical": sum(p["sea_ships_physical_hulls"] for p in polities_out),
            "open_sea_sailing_ships_std_equiv": round(sum(p["sea_ships_std_equiv"]["total"] for p in polities_out), 1),
            "inland_barges_active": sum(p["inland_barges"]["active_hulls"] for p in polities_out),
            "highway_wagon_convoys_active": sum(p["highway_wagon_convoys"]["active_convoys"] for p in polities_out),
            "pack_caravans_active": sum(p["pack_caravans"]["active_caravans"] for p in polities_out),
            "live_mount_droves_active": sum(p["live_mount_droves"] for p in polities_out),
            "total_draught_and_pack_beasts": sum(p["est_draught_and_pack_beasts"] for p in polities_out),
            "total_logistics_workforce": sum(p["est_sailors_teamsters_guards"] for p in polities_out),
        },
        "annual_great_caravan_expedition": (
            lambda agc: {
                "route": "Nulab <-> Erehwon (North Rift Bench, 831 km)",
                "erehwon_to_nulab_tons": round(agc["fwd_cross"] + agc["fwd_dom"], 1),
                "nulab_to_erehwon_tons": round(agc["rev_cross"] + agc["rev_dom"], 1),
                "dominant_direction_tons": round(max(agc["fwd_cross"] + agc["fwd_dom"], agc["rev_cross"] + agc["rev_dom"]), 1),
                "expedition_days_round_trip": 90,
                "pack_caravan_units_mustered": round((max(agc["fwd_cross"] + agc["fwd_dom"], agc["rev_cross"] + agc["rev_dom"]) / 4.5) * RESERVE_MULT, 1),
                "pack_beasts_mustered": int(round(((max(agc["fwd_cross"] + agc["fwd_dom"], agc["rev_cross"] + agc["rev_dom"]) / 4.5) * RESERVE_MULT) * 35)),
                "drovers_and_stalker_guards": int(round(((max(agc["fwd_cross"] + agc["fwd_dom"], agc["rev_cross"] + agc["rev_dom"]) / 4.5) * RESERVE_MULT) * 12)),
                "top_goods": [f"{g} ({round(vt, 1)} t)" for g, vt in sorted(agc["goods_t"].items(), key=lambda kv: -kv[1])[:8]],
            }
        )(corridors[("land", "annual_caravan", "Erehwon", "Nulab")]),
        "sea_lanes": sea_lanes_out[:45],
        "inland_barge_waterways": barge_lanes_out[:25],
        "overland_corridors": land_corridors_out,
        "polities": polities_out,
    }

    out_path = os.path.join(ROOT, "openworld", "trade-fleets-gemini.json")
    with open(out_path, "w", encoding="utf-8") as fp:
        json.dump(payload, fp, indent=2, ensure_ascii=False)
    print(f"Wrote {out_path}")
    print("World Totals:", json.dumps(payload["world_totals"], indent=2))
    print("Annual Great Caravan:", json.dumps(payload["annual_great_caravan_expedition"], indent=2))
    return payload


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Calculate Krator 5.1 game-ready fleets, barges & caravans.")
    ap.add_argument("--cache", default=None, help="Optional pickle cache path for pre-extracted multimodal flows.")
    args = ap.parse_args()
    build_fleets_json(cache_path=args.cache)
