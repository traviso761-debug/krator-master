# KChar: the character record and its pose. The GDScript twin of kits/characters/src/10-rig.js (KCHAR); the two are
# held together by tests/character/kchar_test.gd against kits/characters/tests/golden-pose.json (written by the JS).
#   pose(skel, sliders, values, face_rest) -> { t: Array[Vector3], s: Array[Vector3], root: float, lift: float }
#   visible(rec, outfits) -> Array of { outfit, mesh }
#   random(seed, sliders, outfits) -> a record drawn from KRand (core/rand)
# skel, sliders and outfits are the parsed data/skeleton.json, sliders.json and outfits.json. Read 10-rig.js's header
# for what each field means; nothing here differs.
class_name KChar
extends RefCounted

const KRand := preload("res://tests/rand/krand.gd")


static func _v(a: Array) -> Vector3:
	return Vector3(a[0], a[1], a[2])


static func _q(a: Array) -> Quaternion:
	return Quaternion(a[0], a[1], a[2], a[3])


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


static func index(skel: Dictionary) -> Dictionary:
	var ix := {}
	var J: Array = skel["joints"]
	for i in J.size():
		ix[J[i]["name"]] = i
	return ix


static func face_offsets(skel: Dictionary, face_rest) -> Array:
	var ix := index(skel)
	var t := []
	for j in skel["joints"]:
		t.append(_v(j["t"]))
	if face_rest == null:
		return t
	var w := fk(skel, t)
	var h: int = ix["Head"]
	var qi: Quaternion = w["R"][h].inverse()
	for n in face_rest:
		if ix.has(n):
			t[ix[n]] = qi * (_v(face_rest[n]) - w["P"][h])
	return t


static func pose(skel: Dictionary, sliders: Dictionary, values: Dictionary, face_rest = null) -> Dictionary:
	var J: Array = skel["joints"]
	var ix := index(skel)
	var bind := face_offsets(skel, face_rest)
	var t := bind.duplicate()
	var s := []
	var kids := []
	for i in J.size():
		s.append(Vector3.ONE)
		kids.append([])
	for i in J.size():
		if int(J[i]["parent"]) >= 0:
			kids[int(J[i]["parent"])].append(i)
	var root := 1.0
	for sl in sliders["sliders"]:
		var v: float = float(values.get(sl["id"], 0.0))
		if v == 0.0:
			continue
		v = clampf(v, -1.0, 1.0)
		for op in sl["ops"]:
			if op["op"] == "root":
				root *= pow(float(op["f"]), v)
				continue
			for name in op.get("joints", []):
				if not ix.has(name):
					continue
				var i: int = ix[name]
				match op["op"]:
					"scale":
						s[i] = s[i] * Vector3(pow(op["s"][0], v), pow(op["s"][1], v), pow(op["s"][2], v))
					"girth":
						var k := pow(float(op["f"]), v)
						s[i] = s[i] * Vector3(k, 1.0, k)
					"len":
						var k := pow(float(op["f"]), v)
						s[i] = s[i] * Vector3(1.0, k, 1.0)
						for c in kids[i]:
							t[c] = t[c] * k
					"grow":
						var k := pow(float(op["f"]), v)
						for c in _sub(kids, i, []):
							s[c] = s[c] * k
							if c != i:
								t[c] = t[c] * k
					"move":
						t[i] = t[i] + _v(op["d"]) * v
	var lift := 0.0
	var feet := []
	for nm in ["LeftFoot", "RightFoot"]:
		if ix.has(nm):
			feet.append(ix[nm])
	if feet.size() > 0:
		var a0: Array = fk(skel, bind)["P"]
		var a1: Array = fk(skel, t)["P"]
		for i in feet:
			lift += (a0[i].y - a1[i].y) / feet.size()
	return {"t": t, "s": s, "root": root, "lift": lift}


static func _sub(kids: Array, i: int, out: Array) -> Array:
	out.append(i)
	for c in kids[i]:
		_sub(kids, c, out)
	return out


static func visible(rec: Dictionary, outfits: Dictionary) -> Array:
	var out := []
	var by := {}
	for o in outfits["outfits"]:
		by[o["id"]] = o
	for slot in outfits["slots"]:
		var id = rec["slots"].get(slot)
		if not by.has(id):
			continue
		for m in by[id]["meshes"]:
			var parts: PackedStringArray = String(m).split("~")
			if parts[0] != slot:
				continue
			if parts.size() == 1 or rec["slots"].get(parts[1]) != id:
				out.append({"outfit": id, "mesh": m})
	return out


static func random(sd: int, sliders: Dictionary, outfits: Dictionary, spread := 0.6) -> Dictionary:
	var r = KRand.Stream.new(sd)
	var rec := {"slots": {}, "sliders": {}, "dye": {}}
	var list: Array = outfits["outfits"]
	for slot in outfits["slots"]:
		rec["slots"][slot] = list[int(floor(r.next() * list.size()))]["id"]
	for sl in sliders["sliders"]:
		# floor(x + 0.5) is JS Math.round; Godot's round() sends -2.5 to -3, not -2
		rec["sliders"][sl["id"]] = floor((r.next() * 2.0 - 1.0) * spread * 100.0 + 0.5) / 100.0
	return rec


static func blank(outfits: Dictionary, id := "") -> Dictionary:
	var rec := {"slots": {}, "sliders": {}, "dye": {}}
	for slot in outfits["slots"]:
		rec["slots"][slot] = id if id != "" else outfits["outfits"][0]["id"]
	return rec
