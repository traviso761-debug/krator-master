# KChar: the character record. The GDScript twin of kits/characters/src/10-rig.js (KCHAR) for the MakeHuman bodies
# (kit.style "mpfb"); held to it by tests/character/kchar_test.gd against kits/characters/tests/golden-mpfb.json.
#   morph_weights(rec, kit) -> PackedFloat64Array, one weight per kit.morph.targets entry
#   morph_joints(skel, kit, w) -> { d: Array[Vector3] (each joint's rest move, model space), t: Array[Vector3] (new rest offsets) }
#   parts(rec, kit) -> Array of { key, mesh, role, slot }      hidden(rec, kit) -> PackedByteArray, 1 per hidden skin triangle
#   stranger(seed, kit, people, spread) -> a record drawn from a people's ranges with KRand (core/rand)
#   blank(kit) -> an empty record
# skel and kit are the parsed data/mpfb_<body>/skeleton.json and kit.json; people is one entry of data/peoples.json.
# Read 10-rig.js's comments for what each field means; nothing here differs. (The earlier Meshy kit's pose sliders
# were not ported: that kit is no longer built by default.)
class_name KChar
extends RefCounted

const KRand := preload("res://tests/rand/krand.gd")
const SLOTS := ["feet", "legs", "torso", "hair", "beard", "head"]
const RACES := ["african", "asian", "caucasian"]
const AGE := [-0.6, 0.9]


static func _v(a: Array) -> Vector3:
	return Vector3(a[0], a[1], a[2])


static func _q(a: Array) -> Quaternion:
	return Quaternion(a[0], a[1], a[2], a[3])


# JS Math.round: halves go up (Godot's round() sends -2.5 to -3)
static func _round(x: float) -> float:
	return floor(x + 0.5)


static func fk(skel: Dictionary, t: Array) -> Dictionary:
	var J: Array = skel["joints"]
	var R := []
	var P := []
	for i in J.size():
		var p: int = int(J[i]["parent"])
		if p < 0:
			R.append(_q(J[i]["r"]))
			P.append(t[i])
		else:
			R.append(R[p] * _q(J[i]["r"]))
			P.append(P[p] + R[p] * t[i])
	return {"R": R, "P": P}


static func key(glb: String) -> String:
	return glb.trim_prefix("pieces/").trim_suffix(".glb")


static func item(rec: Dictionary, kit: Dictionary, slot: String) -> Variant:
	var id = rec.get(slot) if slot == "hair" or slot == "beard" else rec.get("armour", {}).get(slot)
	if id == null:
		return null
	for it in kit["items"]:
		if it["id"] == id and it["slot"] == slot and fits(it, rec, kit):
			return it
	return null


# body mods (kits/characters/tools/mods.py, kit items in slot "mods"): record.mods lists the ids worn, one of a group at
# a time; a mod granting arms 4 gives the body four (as KCHAR.mods / arms / fits)
static func mods(rec: Dictionary, kit: Dictionary) -> Array:
	var out := []
	var seen := {}
	for id in rec.get("mods", []):
		for it in kit["items"]:
			if it["id"] == id and it["slot"] == "mods" and not seen.has(it.get("group")):
				seen[it.get("group")] = true
				out.append(it)
	return out


static func arms(rec: Dictionary, kit: Dictionary) -> int:
	for m in mods(rec, kit):
		if int(m.get("grants", {}).get("arms", 2)) >= 4:
			return 4
	return 2


# a torso item is made for two arms or four (kit item arms, 2 by default)
static func fits(it: Dictionary, rec: Dictionary, kit: Dictionary) -> bool:
	return it["slot"] != "torso" or int(it.get("arms", 2)) == arms(rec, kit)


static func parts(rec: Dictionary, kit: Dictionary) -> Array:
	var out := [{"key": key(kit["base_glb"]), "mesh": "*", "role": "base", "slot": "base"}]
	var hat = item(rec, kit, "head")
	for slot in SLOTS:
		var it = item(rec, kit, slot)
		if it != null and not (slot == "hair" and hat != null and hat.get("covers_hair", false)):
			out.append({"key": key(it["glb"]), "mesh": "*", "role": slot if slot == "hair" or slot == "beard" else "armour", "slot": slot})
	for m in mods(rec, kit):
		out.append({"key": key(m["glb"]), "mesh": "*", "role": "mod", "slot": "mods"})
	return out


static func unbits(b64: String, n: int) -> PackedByteArray:
	var raw := Marshalls.base64_to_raw(b64)
	var out := PackedByteArray()
	out.resize(n)
	for i in n:
		out[i] = (raw[i >> 3] >> (i & 7)) & 1
	return out


static func hidden(rec: Dictionary, kit: Dictionary) -> PackedByteArray:
	var n: int = int(kit["base_tris"])
	var o := PackedByteArray()
	o.resize(n)
	for slot in SLOTS:
		var it = item(rec, kit, slot)
		if it == null or not it.has("hide"):
			continue
		var b := unbits(it["hide"], n)
		for i in n:
			o[i] |= b[i]
	return o


static func blank(kit: Dictionary) -> Dictionary:
	return {"body": kit["body"], "hair": null, "beard": null, "armour": {"torso": null, "legs": null, "feet": null, "head": null},
		"sliders": {}, "morph": {}, "ancestry": null, "skin": null, "hair_color": null, "eye_color": null, "people": null, "dye": {}}


static func morph_weights(rec: Dictionary, kit: Dictionary) -> PackedFloat64Array:
	var M: Dictionary = kit["morph"]
	var w := PackedFloat64Array()
	w.resize(M["targets"].size())
	var mv: Dictionary = rec.get("morph", {}) if rec.get("morph") != null else {}
	for s in M["morphs"]:
		var v := float(mv.get(s["id"], 0.0)) * float(s.get("reach", 1.0))
		if v < 0 and s.has("minus"):
			w[int(s["minus"])] = -v
		elif v > 0 and s.has("plus"):
			w[int(s["plus"])] = v
	var a = rec.get("ancestry")
	var A: Dictionary = M["ancestry"]
	if a != null:
		var total := 0.0
		for r in RACES:
			total += maxf(0.0, float(a.get(r, 0.0)))
		var base: Array = A["base"]
		var bsum: float = base[0] + base[1] + base[2]
		if total > 0:
			for k in RACES.size():
				var r: String = RACES[k]
				if A.get(r) != null:
					w[int(A[r])] = maxf(0.0, float(a.get(r, 0.0))) / total - float(base[k]) / bsum
	return w


static func morph_joints(skel: Dictionary, kit: Dictionary, w: PackedFloat64Array) -> Dictionary:
	var M: Dictionary = kit["morph"]
	var J: Array = skel["joints"]
	var d := []
	for j in J:
		d.append(Vector3.ZERO)
	# float64 sums like the JS, then one Vector3 (float32) per joint
	var acc := []
	for j in J:
		acc.append([0.0, 0.0, 0.0])
	for t in M["morph_joints"]:
		var x: float = w[int(t)]
		if x == 0:
			continue
		for r in M["morph_joints"][t]:
			var v: Array = acc[int(r[0])]
			v[0] += x * float(r[1])
			v[1] += x * float(r[2])
			v[2] += x * float(r[3])
	for i in J.size():
		d[i] = Vector3(acc[i][0], acc[i][1], acc[i][2])
	for i in M["follow"]:
		var p: int = int(J[int(i)]["parent"])
		if p >= 0:
			d[int(i)] = d[p]
	var bind := []
	for j in J:
		bind.append(_v(j["t"]))
	var R: Array = fk(skel, bind)["R"]
	var t := []
	for i in J.size():
		var p: int = int(J[i]["parent"])
		if p < 0:
			t.append(bind[i] + d[i])
		else:
			t.append(bind[i] + R[p].inverse() * (d[i] - d[p]))
	return {"d": d, "t": t}


# ---- peoples ----
static func _hex(c: String) -> Array:
	return [c.substr(1, 2).hex_to_int(), c.substr(3, 2).hex_to_int(), c.substr(5, 2).hex_to_int()]


static func _tohex(v: Array) -> String:
	var s := "#"
	for x in v:
		s += "%02x" % int(clampf(_round(x), 0, 255))
	return s


static func along(stops: Array, u: float) -> String:
	if stops.size() == 1:
		return stops[0]
	var f := u * (stops.size() - 1)
	var i: int = mini(stops.size() - 2, int(floor(f)))
	var k := f - i
	var a := _hex(stops[i])
	var b := _hex(stops[i + 1])
	return _tohex([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k])


static func _mix(x: String, y: String, k: float) -> String:
	var a := _hex(x)
	var b := _hex(y)
	return _tohex([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k])


static func stranger(sd: int, kit: Dictionary, people = null, spread := 0.45) -> Dictionary:
	var r = KRand.Stream.new(sd)
	var rec := blank(kit)
	var P: Dictionary = people if people != null else {}
	var styles = P.get("styles", {}).get(String(kit["body"]).trim_prefix("mpfb_"))
	# a people with its own clothes dresses a stranger in one tier's outfit (as KCHAR.stranger)
	var outfits = P.get("outfits", {}).get(String(kit["body"]).trim_prefix("mpfb_"))
	var outfit = null
	if outfits != null and P.has("tiers"):
		var x: float = r.next()
		var acc := 0.0
		var tiers: Array = P["tiers"]
		for t in tiers.size():
			acc += float(tiers[t][1])
			if x < acc or t == tiers.size() - 1:
				rec["tier"] = tiers[t][0]
				outfit = outfits.get(rec["tier"])
				break
	# a people's mods and its tier's, where the body has them (no draw of their own)
	var md := []
	for id in P.get("mods", []) + (outfit.get("mods", []) if outfit != null else []):
		for it in kit["items"]:
			if it["id"] == id and it["slot"] == "mods":
				md.append(id)
	if md.size():
		rec["mods"] = md
	for slot in SLOTS:
		if outfit != null and slot != "hair" and slot != "beard":
			var want = outfit.get(slot)
			var ok := false
			for it in kit["items"]:
				if want != null and it["id"] == want and it["slot"] == slot and fits(it, rec, kit):
					ok = true
			rec["armour"][slot] = want if ok else null
			continue
		if slot == "head":                 # headgear only comes with a people's outfit
			rec["armour"]["head"] = null
			continue
		var have := []
		for it in kit["items"]:            # a culture's own clothes go only to its people's strangers
			if it["slot"] == slot and (it.get("culture") == null or it.get("culture") == P.get("id")) and fits(it, rec, kit):
				have.append(it)
		if slot == "hair" and styles != null:
			var pref := []
			for it in have:
				if styles.has(it["id"]):
					pref.append(it)
			if pref.size() and r.next() < 0.75:
				have = pref
		var odds: float = float(P.get("beard", 0.4)) if slot == "beard" else (0.92 if slot == "hair" else 0.9)
		var id = null
		if have.size() and r.next() < odds:
			id = have[int(floor(r.next() * have.size()))]["id"]
		if slot == "hair" or slot == "beard":
			rec[slot] = id
		else:
			rec["armour"][slot] = id
	rec["morph"] = {}
	var bias: Dictionary = P.get("morph", {})
	for s in kit["morph"]["morphs"]:
		var v: float
		if bias.has(s["id"]):
			var lr: Array = bias[s["id"]]
			v = lr[0] + (lr[1] - lr[0]) * r.next()
		elif s["id"] == "age":
			v = AGE[0] + (AGE[1] - AGE[0]) * r.next()
		else:
			v = (r.next() * 2 - 1) * spread * (1.0 if s["group"] == "Face" else 0.8)
		v = _round(v * 100) / 100
		if v != 0:
			rec["morph"][s["id"]] = v
	var A: Dictionary = P.get("ancestry", {"african": [0, 1], "asian": [0, 1], "caucasian": [0, 1]})
	rec["ancestry"] = {}
	for k in RACES:
		var lr: Array = A.get(k, [0, 0])
		rec["ancestry"][k] = _round((lr[0] + (lr[1] - lr[0]) * r.next()) * 100) / 100
	rec["skin"] = along(P.get("skin", ["#f1d2bd", "#c58c63", "#5a3a26"]), r.next())
	var hairs: Array = P.get("hair", ["#2a1d15", "#5a3a22", "#8a6238", "#c9a35a"])
	var hair: String = hairs[int(floor(r.next() * hairs.size()))]
	var age := float(rec["morph"].get("age", 0.0))
	var grey := float(P.get("grey", 0.45))
	if age > grey:
		hair = _mix(hair, "#b8b4ae", minf(1.0, (age - grey) / (1 - grey) * (0.6 + 0.6 * r.next())))
	rec["hair_color"] = hair
	var eyes: Array = P.get("eyes", ["#3b2414", "#5a3a22", "#6e5a2e", "#4a5a3a", "#4e6a80"])
	rec["eye_color"] = eyes[int(floor(r.next() * eyes.size()))]
	rec["people"] = P.get("id")
	return rec


# the capsules a garment's cloth chains stay out of, their radii under morph weights w (as KCHAR.colliders)
static func colliders(skel: Dictionary, w: PackedFloat64Array) -> Array:
	var out := []
	for c in skel.get("colliders", []):
		var r: float = float(c["r"])
		for t in c.get("dr", {}):
			var ti := int(t)
			if ti < w.size():
				r += w[ti] * float(c["dr"][t])
		out.append({"a": int(c["a"]), "b": int(c["b"]), "r": maxf(0.01, r)})
	return out
