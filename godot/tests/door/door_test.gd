# core/door's leaves and glass in GDScript (krator/kdoor.gd, KDoor) against the page's own (core/door/10-core-door.js
# KDOOR.leaves, 20-core-glass.js KGLASS.SPEC). The golden (node godot/tools/door_golden.js) holds a KDOOR export() of every
# kind (swing either hand and on a given hinge, the double door, the double-acting saloon both ways, slide and bi-parting,
# portcullis, roller, floodgate, blast pair, garage, flap, bifold single and pair, iris, hatch, the hardware styles, a locked
# door, a narrow swing) and each one's leaves at five open fractions. Every leaf is rebuilt from its export record alone;
# the importer builds a node per door and a leaf per leaf, posed at the record's open; the glass kinds match KGLASS.SPEC and
# the importer's 'kglass:*' names resolve. Each check has a negative.
#   godot --headless --path godot --script res://tests/door/door_test.gd      exits 0 when every check passes
extends SceneTree

const TOL := 1e-6

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


static func _vv(a: Variant) -> Vector3:
	return Vector3(float(a[0]), float(a[1]), float(a[2]))


# the worst difference between KDoor's leaves and the page's for one record over every open fraction
static func worst(D: Dictionary, want: Array, opens: Array, dir := 1.0, rec_override := {}) -> float:
	var R := D.duplicate()
	for k in rec_override:
		R[k] = rec_override[k]
	var m := 0.0
	for i in opens.size():
		var got := KDoor.leaves(R, float(opens[i]), dir)
		var exp: Array = want[i]
		if got.size() != exp.size():
			return INF
		for j in got.size():
			var g: Dictionary = got[j]
			var e: Dictionary = exp[j]
			m = maxf(m, (g["p"] - _vv(e["p"])).length())
			m = maxf(m, absf(float(g["ang"]) - float(e["ang"])))
			m = maxf(m, (g["s"] - _vv(e["s"])).length())
			m = maxf(m, (g["size"] - _vv(e["size"])).length())
			var ax: Vector3 = g["ax"]
			var eax: Vector3 = Vector3.UP if typeof(e["ax"]) == TYPE_STRING else _vv(e["ax"])
			if absf(float(g["ang"])) > 1e-9:
				m = maxf(m, (ax - eax).length())
	return m


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/door/golden.json"))
	var doc: Dictionary = g["doors"]
	var opens: Array = g["opens"]
	ok(doc["format"] == "krator-doors" and doc["doors"].size() >= 20 and float(doc["swing"]) == KDoor.SWING,
		"the export: %d doors, krator-doors, the registry's swing %s rad is KDoor's" % [doc["doors"].size(), doc["swing"]])
	var by := {}
	for D in doc["doors"]:
		by[D["id"]] = D
	# every record's leaves, rebuilt from the record alone
	var bad: Array = []
	var kinds := {}
	for id in by:
		var w := worst(by[id], g["leaves"][id], opens)
		kinds[by[id].get("kind", "swing")] = true
		if w > TOL:
			bad.append("%s %.6f" % [id, w])
	ok(bad.is_empty() and kinds.size() == 7, "every door's leaves at five open fractions equal the page's within %s (%d doors, the seven kinds)%s" % [TOL, by.size(), (": " + ", ".join(bad)) if bad else ""])
	# the negatives: a door whose swing is read as the registry's (the narrow one's own 1.4 lost), the pair read as one leaf
	var n1 := worst(by["swing.narrow"], g["leaves"]["swing.narrow"], opens, 1.0, {"swing": null})
	var n2 := worst(by["double"], g["leaves"]["double"], opens, 1.0, {"pair": false})
	ok(n1 > 1e-3 and n2 > 1e-3, "negatives: the narrow door at the registry's swing is off by %.3f, the double door as one leaf by %s" % [n1, "INF" if n2 == INF else "%.3f" % n2])
	# the double-acting door swung from the other side (dir -1)
	var wb := worst(by["saloon"], g["leaves"]["saloon.back"], opens, -1.0)
	var wbn := worst(by["saloon"], g["leaves"]["saloon.back"], opens, 1.0)
	ok(wb <= TOL and wbn > 1e-3, "the saloon swung away from the other side (dir -1) equals the page's (%.9f); dir 1 does not (%.3f)" % [wb, wbn])
	# the importer: a node per door, a leaf per leaf, posed at the record's open; the glazed and hardware styles' parts
	var root := KDoor.build(doc)
	var leaves_n := 0
	var placed := 0
	for dn in root.get_children():
		var D: Dictionary = dn.get_meta("krator")
		leaves_n += dn.get_child_count()
		var LL := KDoor.leaves(D, float(D.get("open", 0.0)))
		for i in LL.size():
			if ((dn.get_child(i) as Node3D).transform.origin - (LL[i]["p"] as Vector3)).length() < 1e-5:
				placed += 1
	var want_leaves := 0
	for D in doc["doors"]:
		want_leaves += KDoor.leaf_count(D)
	var ger := root.get_node_or_null("ger")
	var vardo := root.get_node_or_null("vardo")
	var parts_ok: bool = ger != null and vardo != null and ger.get_child(0).get_node_or_null("hardware") != null and vardo.get_child(1).get_node_or_null("glass") != null \
		and root.get_node("swing").get_child(0).get_child_count() == 0
	ok(root.get_child_count() == by.size() and leaves_n == want_leaves and placed == want_leaves and parts_ok,
		"the importer: %d door nodes, %d leaves (the record's leafCount), %d posed at their records; the ger's brass and the vardo's light drawn, a plain leaf bare" % [root.get_child_count(), leaves_n, placed])
	# posing: the double door opened, its leaves where KDOOR.leaves puts them at 1
	var dd := root.get_node("double")
	KDoor.pose(dd, 1.0)
	var e1: Array = g["leaves"]["double"][4]
	var d1 := ((dd.get_child(0) as Node3D).transform.origin - _vv(e1[0]["p"])).length() + ((dd.get_child(1) as Node3D).transform.origin - _vv(e1[1]["p"])).length()
	var b0 := (dd.get_child(0) as Node3D).transform.basis.get_scale()
	ok(d1 < 1e-5 and absf(b0.x - float(e1[0]["size"][0])) < 1e-5, "KDoor.pose opens the double door to the page's poses (off %.9f), each leaf half the doorway (%.3f m)" % [d1, b0.x])
	# the glass: every kind as KGLASS.SPEC has it, and the export's material names resolve
	var gb: Array = []
	for kind in g["glass"]:
		var S: Dictionary = g["glass"][kind]
		var K: Dictionary = KDoor.SPEC.get(kind, {})
		for k in S:
			if not K.has(k) or (typeof(S[k]) in [TYPE_FLOAT, TYPE_INT] and absf(float(K[k]) - float(S[k])) > 1e-9) or (typeof(S[k]) == TYPE_BOOL and K[k] != S[k]):
				gb.append(kind + "." + k)
	var clear := KDoor.material_for_name("kglass:clear") as StandardMaterial3D
	var room := KDoor.material_for_name("kglass:room") as StandardMaterial3D
	var lit := KDoor.material_for_name("kglass:room-lit") as StandardMaterial3D
	var mats_ok: bool = clear != null and clear.transparency == BaseMaterial3D.TRANSPARENCY_ALPHA and absf(clear.albedo_color.a - 0.22) < 1e-6 \
		and room != null and room.transparency == BaseMaterial3D.TRANSPARENCY_DISABLED and lit != null and lit.emission_enabled \
		and KDoor.material_for_name("wood") == null
	ok(gb.is_empty() and g["glass"].size() == KDoor.SPEC.size() and mats_ok,
		"the glass: %d kinds equal KGLASS.SPEC%s; kglass:clear is alpha at 0.22, kglass:room opaque, kglass:room-lit glows, a plain name is not glass" % [KDoor.SPEC.size(), (" EXCEPT " + ", ".join(gb)) if gb else ""])
	# the negative for the glass: a spec read with the wrong opacity is caught
	var wrong := KDoor.glass_material("clear", {}, {"clear": {"color": 0xb4ccd2, "opacity": 0.5, "roughness": 0.05, "metalness": 0.1, "emissive": 0, "glow": 0.0, "transparent": true}})
	ok(absf(wrong.albedo_color.a - float(g["glass"]["clear"]["opacity"])) > 0.1, "negative: a pane at the wrong opacity (%.2f) differs from the page's" % wrong.albedo_color.a)
	root.free()
	print("door_test: %s" % ("all passed" if fails == 0 else "%d FAILED" % fails))
	quit(1 if fails else 0)
