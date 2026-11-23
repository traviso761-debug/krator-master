# Godot 4.7.2 twin of core/kits/10-core-kits.js (KRATOR_KITS) + KCITY.constructOrder (54-city-host-construct.js).
# [G data] Plain data and pure functions: manifest indexing, '<kitId>:<pieceKey>' routing, Rulings #99-101 style unlocks,
# ward zoning, Giant door-height clearance, lot pinning, and triangle build-order sorting.
# Synced to godot/tests/kits/kkit.gd by godot/tools/sync_core.py.
class_name KratorKits
extends RefCounted

const CONSTRUCT_DEF := {"foot": 0.12, "band": 0.5, "slender": 4.0, "roofN": 0.3, "roofAt": 0.5, "cap": 0.25}

var manifest := {"version": 1, "kits": {}}
var by_qkey := {}


static func infer_tier(raw: Dictionary) -> int:
	if raw.has("tier") and raw["tier"] != null:
		return int(raw["tier"])
	var w = raw.get("wealth", 0.5)
	var fam := str(raw.get("family", "")).to_lower()
	var types: Array = raw.get("types", [])
	for t0 in types:
		var t := str(t0).to_lower()
		if t in ["civic", "palace", "landmark", "sacred", "temple", "fortress", "military"]:
			return 3
	if str(w) == "civic" or fam in ["civic", "palace", "sacred", "grand", "capital"]:
		return 3
	if fam in ["dwell", "dwelling", "dwellings", "housing", "houses", "poor", "small"]:
		if str(w) == "rich" or ((w is float or w is int) and float(w) > 0.72):
			return 2
		return 1
	for tj0 in types:
		var tj := str(tj0).to_lower()
		if tj in ["residential", "dwelling", "house"]:
			return 2 if (str(w) == "rich" or ((w is float or w is int) and float(w) > 0.72)) else 1
	return 2


static func matches_class(p: Dictionary, cls: String) -> bool:
	if cls.is_empty():
		return true
	var types: Array = p.get("types", [])
	var fam := str(p.get("family", "")).to_lower()
	var w = p.get("wealth", null)
	var key := str(p.get("key", ""))
	var has_type := func(sub: String) -> bool:
		for t in types:
			if str(t).to_lower().find(sub) >= 0:
				return true
		return false
	var is_res: bool = has_type.call("res") or has_type.call("dwell") or has_type.call("house") \
		or fam.find("dwell") >= 0 or fam.find("hous") >= 0 or fam in ["poor", "mid", "rich"]
	var wn := float(w) if (w is float or w is int) else -1.0
	if cls == "poor":
		return is_res and (str(w) == "poor" or (wn >= 0.0 and wn <= 0.36) or fam in ["poor", "small"])
	if cls == "middle":
		return is_res and (str(w) == "middle" or w == null or (wn > 0.30 and wn <= 0.72) or fam == "mid")
	if cls == "rich":
		return is_res and (str(w) == "rich" or wn > 0.65 or fam == "rich")
	if cls == "manor":
		return (is_res or fam in ["palace", "estate", "grand"]) and (str(w) in ["rich", "civic"] or wn >= 0.75 or float(p.get("w", 0.0)) >= 14.0)
	if cls == "shop":
		return has_type.call("commerc") or has_type.call("shop") or has_type.call("market") or has_type.call("trade") \
			or fam.find("trade") >= 0 or fam.find("shop") >= 0 or fam.find("market") >= 0
	if cls == "tavern":
		return has_type.call("hosp") or has_type.call("tavern") or has_type.call("inn") or fam.find("hosp") >= 0 \
			or key.find("tavern") >= 0 or key.find("inn") >= 0 or key.find("serai") >= 0 or key.find("tea") >= 0
	if cls == "industrial":
		return has_type.call("ind") or has_type.call("craft") or has_type.call("work") or has_type.call("prod") \
			or fam.find("work") >= 0 or fam.find("ind") >= 0 or fam.find("craft") >= 0
	if cls == "civic":
		return int(p.get("tier", 2)) == 3 or str(w) == "civic" or has_type.call("civic") or has_type.call("sacred") \
			or fam.find("civic") >= 0 or fam.find("sacred") >= 0
	return false


static func qualify(kit_id: String, key: String) -> String:
	if kit_id.is_empty():
		return key
	var idx := key.find(":")
	if idx > 0 and key.substr(0, idx) == kit_id:
		return key
	return kit_id + ":" + (key.substr(idx + 1) if idx > 0 else key)


static func parse_key(qkey: String, default_kit = null) -> Dictionary:
	var idx := qkey.find(":")
	if idx > 0:
		var kid := qkey.substr(0, idx)
		var raw := qkey.substr(idx + 1)
		return {"kitId": kid, "key": raw, "qkey": kid + ":" + raw}
	var dk = null if default_kit == null else str(default_kit)
	return {"kitId": dk, "key": qkey, "qkey": (str(dk) + ":" + qkey) if dk != null else qkey}


func load_manifest(data: Dictionary) -> Dictionary:
	if not data.has("kits") or not (data["kits"] is Dictionary):
		return manifest
	manifest["version"] = int(data.get("version", 1))
	var kids: Array = (data["kits"] as Dictionary).keys()
	kids.sort()
	for kid0 in kids:
		var kid := str(kid0)
		var entry: Dictionary = data["kits"][kid]
		var def_door := float(entry.get("defaultDoorH", 2.2))
		var def_acc := str(entry.get("access", "ground"))
		var K := {
			"id": kid,
			"name": str(entry.get("name", kid)),
			"culture": str(entry.get("culture", kid)),
			"lineage": str(entry.get("lineage", "unknown")),
			"pack": entry.get("pack", null),
			"defaultDoorH": def_door,
			"access": def_acc,
			"pieces": {},
			"order": [],
			"trades": {}
		}
		var src_pieces: Dictionary = entry.get("pieces", {})
		var keys: Array = entry["order"] if entry.has("order") else src_pieces.keys()
		if not entry.has("order"):
			keys.sort()
		for k0 in keys:
			var k := str(k0)
			if not src_pieces.has(k):
				continue
			var raw: Dictionary = src_pieces[k]
			var raw_types = raw.get("types", [])
			var types_arr: Array = raw_types.duplicate() if raw_types is Array else ([raw_types] if raw_types != null else [])
			var np := {
				"qkey": kid + ":" + k,
				"kit": kid,
				"key": k,
				"name": str(raw.get("name", k)),
				"w": float(raw.get("w", 6.0)),
				"d": float(raw.get("d", 6.0)),
				"h": float(raw.get("h", 6.0)),
				"fw": float(raw["fw"]) if raw.has("fw") and raw["fw"] != null else null,
				"fd": float(raw["fd"]) if raw.has("fd") and raw["fd"] != null else null,
				"variants": max(1, int(raw.get("variants", 1))),
				"wealth": raw.get("wealth", 0.5),
				"family": str(raw.get("family", "misc")),
				"types": types_arr,
				"doorH": float(raw.get("doorH", def_door)),
				"access": str(raw.get("access", def_acc)),
				"tier": 2
			}
			np["tier"] = infer_tier({"tier": raw.get("tier", null), "wealth": np["wealth"], "family": np["family"], "types": types_arr})
			K["pieces"][k] = np
			K["order"].append(k)
			by_qkey[np["qkey"]] = np
		var src_trades: Dictionary = entry.get("trades", {})
		for tr in src_trades:
			var clean := []
			for rk0 in src_trades[tr]:
				var rks := str(rk0)
				var rk := rks.split(":")[1] if rks.find(":") > 0 else rks
				if K["pieces"].has(rk):
					clean.append(rk)
			if not clean.is_empty():
				K["trades"][tr] = clean
		manifest["kits"][kid] = K
	return manifest


func list_kits() -> Array:
	var ks: Array = manifest["kits"].keys()
	ks.sort()
	return ks


func dims(qkey: String, v := 0, default_kit = null):
	var P := parse_key(qkey, default_kit)
	var rec = by_qkey.get(P["qkey"], null) if P["kitId"] != null else null
	if rec == null and P["kitId"] == null:
		for kid in list_kits():
			var K: Dictionary = manifest["kits"][kid]
			if K["pieces"].has(P["key"]):
				rec = K["pieces"][P["key"]]
				P = {"kitId": kid, "key": P["key"], "qkey": rec["qkey"]}
				break
	if rec == null:
		return null
	var out := {
		"key": rec["qkey"] if P["kitId"] != null else rec["key"],
		"qkey": rec["qkey"],
		"rawKey": rec["key"],
		"kit": rec["kit"],
		"v": int(v),
		"w": rec["w"],
		"d": rec["d"],
		"h": rec["h"],
		"variants": rec["variants"],
		"wealth": rec["wealth"],
		"family": rec["family"],
		"types": (rec["types"] as Array).duplicate(),
		"doorH": rec["doorH"],
		"access": rec["access"],
		"tier": rec["tier"]
	}
	if rec["fw"] != null:
		out["fw"] = rec["fw"]
	if rec["fd"] != null:
		out["fd"] = rec["fd"]
	return out


# ---------------------------------------------------------------- Rulings #99-101 Style Unlocks & Ward Policy
static func _ensure_entry(state: Dictionary, kit_id: String) -> Dictionary:
	if not state["unlocked"].has(kit_id):
		state["unlocked"][kit_id] = {
			"kitId": kit_id,
			"blueprintTier": 0,
			"blueprintKeys": [],
			"schematics": [],
			"masters": 0,
			"apprentices": 0,
			"wardPractitioners": {},
			"everBuilt": false
		}
	return state["unlocked"][kit_id]


static func create_style_state(founding_kit, opt := {}) -> Dictionary:
	var state := {
		"foundingKit": founding_kit,
		"minDoorH": float(opt.get("minDoorH", 0.0)),
		"unlocked": {},
		"wards": {},
		"pinnedLots": {}
	}
	if founding_kit != null and not str(founding_kit).is_empty():
		var fk := str(founding_kit)
		var e := _ensure_entry(state, fk)
		e["blueprintTier"] = 3
		e["schematics"].append("founding:" + fk)
		e["everBuilt"] = true
	return state


static func kit_status(state: Dictionary, kit_id: String) -> Dictionary:
	if not state["unlocked"].has(kit_id):
		return {"kitId": kit_id, "active": false, "effectiveTier": 0, "tradesmanTier": 0, "blueprintTier": 0, "blueprintKeys": [], "standingOnly": false, "practitioners": 0}
	var e: Dictionary = state["unlocked"][kit_id]
	var prac := int(e["masters"]) + int(e["apprentices"])
	var t_tier := 3 if int(e["masters"]) >= 3 else (2 if prac > 0 else 0)
	var eff := maxi(int(e["blueprintTier"]), t_tier)
	var active: bool = eff > 0 or (e["blueprintKeys"] as Array).size() > 0
	return {
		"kitId": kit_id,
		"active": active,
		"effectiveTier": eff,
		"tradesmanTier": t_tier,
		"blueprintTier": int(e["blueprintTier"]),
		"blueprintKeys": (e["blueprintKeys"] as Array).duplicate(),
		"practitioners": prac,
		"standingOnly": (not active) and bool(e["everBuilt"])
	}


static func update_tradesmen(state: Dictionary, kit_id: String, info := {}) -> Dictionary:
	var e := _ensure_entry(state, kit_id)
	if info.has("masters") and info["masters"] != null:
		e["masters"] = maxi(0, int(info["masters"]))
	if info.has("apprentices") and info["apprentices"] != null:
		e["apprentices"] = maxi(0, int(info["apprentices"]))
	if info.has("wardId") and info["wardId"] != null:
		var wid := str(info["wardId"])
		var wc := (int(e["masters"]) + int(e["apprentices"])) if not info.has("wardCount") or info["wardCount"] == null else maxi(0, int(info["wardCount"]))
		if wc > 0:
			e["wardPractitioners"][wid] = wc
		else:
			e["wardPractitioners"].erase(wid)
	if int(e["masters"]) + int(e["apprentices"]) > 0:
		e["everBuilt"] = true
	return kit_status(state, kit_id)


static func unlock_blueprint(state: Dictionary, spec := {}):
	var kit_id = spec.get("kitId", null)
	var keys: Array = spec.get("keys", [])
	if (kit_id == null or str(kit_id).is_empty()) and not keys.is_empty():
		kit_id = parse_key(str(keys[0]), state["foundingKit"])["kitId"]
	if kit_id == null or str(kit_id).is_empty():
		return null
	var kid := str(kit_id)
	var e := _ensure_entry(state, kid)
	if spec.has("tier") and spec["tier"] != null and int(spec["tier"]) > int(e["blueprintTier"]):
		e["blueprintTier"] = clampi(int(spec["tier"]), 0, 3)
	for k0 in keys:
		var P := parse_key(str(k0), kid)
		var target := _ensure_entry(state, str(P["kitId"]))
		if not (target["blueprintKeys"] as Array).has(P["key"]):
			target["blueprintKeys"].append(P["key"])
		target["everBuilt"] = true
	if spec.has("id") and spec["id"] != null and not (e["schematics"] as Array).has(str(spec["id"])):
		e["schematics"].append(str(spec["id"]))
	e["everBuilt"] = true
	return kit_status(state, kid)


static func piece_unlocked(state: Dictionary, kit_id: String, raw_key: String, piece_rec = null) -> bool:
	var st := kit_status(state, kit_id)
	if not bool(st["active"]):
		return false
	if (st["blueprintKeys"] as Array).has(raw_key):
		return true
	var req_tier := int(piece_rec["tier"]) if (piece_rec is Dictionary and piece_rec.has("tier")) else 2
	return int(st["effectiveTier"]) >= req_tier


static func set_ward_policy(state: Dictionary, ward_id: String, policy := {}) -> Dictionary:
	state["wards"][ward_id] = {
		"wardId": ward_id,
		"pinnedKit": policy.get("pinnedKit", null),
		"allowedKits": (policy["allowedKits"] as Array).duplicate() if policy.get("allowedKits", null) is Array else null,
		"weights": (policy.get("weights", {}) as Dictionary).duplicate(),
		"minDoorH": float(policy.get("minDoorH", 0.0)),
		"access": policy.get("access", null)
	}
	return state["wards"][ward_id]


static func pin_lot(state: Dictionary, lot_id: String, qkey = null):
	if qkey == null:
		state["pinnedLots"].erase(lot_id)
		return null
	var P := parse_key(str(qkey), state["foundingKit"])
	state["pinnedLots"][lot_id] = P["qkey"]
	return P["qkey"]


static func _kit_weight_in_ward(state: Dictionary, kit_id: String, ward) -> float:
	if ward is Dictionary and (ward["weights"] as Dictionary).has(kit_id):
		return maxf(0.0, float(ward["weights"][kit_id]))
	if not state["unlocked"].has(kit_id):
		return 0.0
	var e: Dictionary = state["unlocked"][kit_id]
	if state["foundingKit"] != null and kit_id == str(state["foundingKit"]):
		return 1.0
	var w_prac := int(e["masters"]) + int(e["apprentices"])
	if ward is Dictionary and (e["wardPractitioners"] as Dictionary).has(ward["wardId"]):
		w_prac = int(e["wardPractitioners"][ward["wardId"]])
	var base := 0.35 * float(e["blueprintTier"]) if int(e["blueprintTier"]) > 0 else 0.15
	return base + 0.25 * float(mini(8, w_prac))


func candidates(state: Dictionary, query := {}) -> Array:
	var ward = state["wards"].get(str(query["wardId"]), null) if query.has("wardId") and query["wardId"] != null else null
	var min_door := maxf(float(state.get("minDoorH", 0.0)), float(ward["minDoorH"]) if ward is Dictionary else 0.0)
	if query.has("minDoorH") and query["minDoorH"] != null:
		min_door = maxf(min_door, float(query["minDoorH"]))
	var req_access = query.get("access", null)
	if req_access == null and ward is Dictionary:
		req_access = ward.get("access", null)

	if query.has("lotId") and query["lotId"] != null and state["pinnedLots"].has(str(query["lotId"])):
		var P := parse_key(str(state["pinnedLots"][str(query["lotId"])]), state["foundingKit"])
		var rec = by_qkey.get(P["qkey"], null)
		if rec != null and piece_unlocked(state, P["kitId"], P["key"], rec) and float(rec["doorH"]) >= min_door \
				and (req_access == null or str(rec["access"]) == str(req_access)):
			var dm: Dictionary = dims(rec["qkey"], 0)
			dm["weight"] = 1.0
			return [dm]

	var kit_ids: Array = state["unlocked"].keys()
	kit_ids.sort()
	if ward is Dictionary and ward["pinnedKit"] != null:
		kit_ids = [str(ward["pinnedKit"])]
	elif ward is Dictionary and ward["allowedKits"] is Array:
		var allowed: Array = ward["allowedKits"]
		var filt := []
		for k in kit_ids:
			if allowed.has(k):
				filt.append(k)
		kit_ids = filt

	var out := []
	var q_trade := str(query.get("trade", ""))
	var q_cls := str(query.get("cls", ""))
	for kid0 in kit_ids:
		var kid := str(kid0)
		if not manifest["kits"].has(kid):
			continue
		var K: Dictionary = manifest["kits"][kid]
		var st := kit_status(state, kid)
		if not bool(st["active"]):
			continue
		var kw := _kit_weight_in_ward(state, kid, ward)
		if not (kw > 0.0):
			continue
		var keys: Array = K["trades"].get(q_trade, []) if not q_trade.is_empty() else K["order"]
		for rk0 in keys:
			var rk := str(rk0)
			if not K["pieces"].has(rk):
				continue
			var pr: Dictionary = K["pieces"][rk]
			if not piece_unlocked(state, kid, rk, pr):
				continue
			if float(pr["doorH"]) < min_door:
				continue
			if req_access != null and str(pr["access"]) != str(req_access):
				continue
			if q_trade.is_empty() and not q_cls.is_empty() and not matches_class(pr, q_cls):
				continue
			var item: Dictionary = dims(pr["qkey"], 0)
			item["weight"] = snappedf(kw / float(maxi(1, keys.size())), 0.00001)
			out.append(item)
	return out


static func kits_used_by_lots(lots: Array, default_kit = null) -> Array:
	var seen := {}
	var out := []
	for L in lots:
		if not (L is Dictionary) or L.get("died", null) != null:
			continue
		var fb = L.get("kit", null)
		if fb == null:
			fb = default_kit
		var P := parse_key(str(L.get("key", "")), fb)
		if P["kitId"] != null and not seen.has(P["kitId"]):
			seen[P["kitId"]] = true
			out.append(str(P["kitId"]))
	out.sort()
	return out


# Twin of KCITY.constructOrder (core/city/54-city-host-construct.js)
static func construct_order(pos: Array, index = null, y0_in = null, h_in = null, opt := {}) -> Dictionary:
	var O := CONSTRUCT_DEF.duplicate()
	for k in opt:
		O[k] = opt[k]
	var has_idx: bool = index is Array and (index as Array).size() > 0
	var nt: int = int((index as Array).size() / 3) if has_idx else int(pos.size() / 9)
	var y0: float = INF
	var y1: float = -INF
	if y0_in != null:
		y0 = float(y0_in)
	else:
		for a in range(1, pos.size(), 3):
			var py := float(pos[a])
			if py < y0:
				y0 = py
			if py > y1:
				y1 = py
	var H: float = 1.0
	if h_in != null:
		H = float(h_in)
	else:
		if not (y1 > -INF):
			for b in range(1, pos.size(), 3):
				var py2 := float(pos[b])
				if py2 > y1:
					y1 = py2
		H = maxf(1e-6, y1 - y0)

	var keys := PackedFloat64Array()
	keys.resize(nt)
	var bands := maxi(1, int(ceil(H / float(O["band"]))))
	for t in nt:
		var i0: int = (int(index[t * 3]) if has_idx else (t * 3)) * 3
		var i1: int = (int(index[t * 3 + 1]) if has_idx else (t * 3 + 1)) * 3
		var i2: int = (int(index[t * 3 + 2]) if has_idx else (t * 3 + 2)) * 3
		var ax := float(pos[i0]); var ay := float(pos[i0 + 1]); var az := float(pos[i0 + 2])
		var bx := float(pos[i1]); var by := float(pos[i1 + 1]); var bz := float(pos[i1 + 2])
		var cx := float(pos[i2]); var cy := float(pos[i2 + 1]); var cz := float(pos[i2 + 2])
		var ymin := minf(ay, minf(by, cy)) - y0
		var ymax := maxf(ay, maxf(by, cy)) - y0
		var u := Vector3(bx - ax, by - ay, bz - az)
		var v := Vector3(cx - ax, cy - ay, cz - az)
		var n := u.cross(v)
		var n2 := n.length()
		var area := n2 * 0.5
		var e := maxf(u.length(), maxf(v.length(), Vector3(cx - bx, cy - by, cz - bz).length()))
		var slim: bool = (e / sqrt(area) >= float(O["slender"])) if area > 0.0 else true
		var h := clampf(ymin / H, 0.0, 1.0)
		var k: float = 0.0
		if ymax / H < float(O["foot"]):
			k = 0.0 + (h / float(O["foot"])) * 0.9
		elif n2 > 0.0 and absf(n.y / n2) >= float(O["roofN"]) and h >= float(O["roofAt"]) and not (absf(n.y / n2) > 0.95 and area < float(O["cap"])):
			k = 2.0 + ((h - float(O["roofAt"])) / maxf(1e-6, 1.0 - float(O["roofAt"]))) * 0.9
		else:
			var bnd := mini(bands - 1, int(floor(h * H / float(O["band"]))))
			k = 1.0 + (float(bnd) + (0.25 if slim else 0.75)) / float(bands) * 0.9
		keys[t] = k

	var pairs := []
	for t in nt:
		pairs.append([keys[t], t])
	pairs.sort_custom(func(p, r): return p[0] < r[0] if p[0] != r[0] else p[1] < r[1])
	var tris := PackedInt32Array()
	var sk := PackedFloat64Array()
	tris.resize(nt)
	sk.resize(nt)
	for s in nt:
		tris[s] = int(pairs[s][1])
		sk[s] = float(pairs[s][0])
	return {"tris": tris, "keys": sk, "y0": y0, "H": H}
