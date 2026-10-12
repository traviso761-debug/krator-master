# The Godot side of core/terrain's golden test: golden-field.json's field (written by test-field.js) read by kfield.gd
# must give the same heights, normals, water and cover at the same points as the page's KFIELD did.
# From a Godot 4 project that holds kfield.gd, kfield_test.gd and golden-field.json in one folder (run --import once,
# so the KField class is registered):
#   godot --headless --path godot --script res://tests/terrain/kfield_test.gd       exits 0 when every sample matches
extends SceneTree

const TOL := 1e-9   # metres; the arithmetic is the same, so the expected difference is 0 (the JSON parse may cost an ulp)


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-field.json"))
	var t0 := Time.get_ticks_msec()
	var f := KField.from_export(g["field"])
	var bad := 0
	var worst := {"h": 0.0, "normal": 0.0, "lake": 0.0, "waterH": 0.0}
	var cover_bad := 0
	var pts: Array = g["points"]
	for k in pts.size():
		var x := float(pts[k][0])
		var z := float(pts[k][1])
		worst["h"] = max(worst["h"], abs(f.h(x, z) - float(g["h"][k])))
		var n := f.normal64(x, z)
		for c in 3:
			worst["normal"] = max(worst["normal"], abs(n[c] - float(g["normal"][k][c])))
		worst["lake"] = max(worst["lake"], abs(f.water_at("lake", x, z) - float(g["lake"][k])))
		worst["waterH"] = max(worst["waterH"], abs(f.water_h(x, z) - float(g["waterH"][k])))
		if f.cover_at(x, z) != int(g["cover"][k]):
			cover_bad += 1
	for key in worst:
		var pass_: bool = worst[key] <= TOL
		bad += 0 if pass_ else 1
		print("%s  %-7s max |difference| %s m over %d points" % ["PASS" if pass_ else "FAIL", key, String.num_scientific(worst[key]), pts.size()])
	print("%s  cover   %d of %d points differ" % ["PASS" if cover_bad == 0 else "FAIL", cover_bad, pts.size()])
	bad += 0 if cover_bad == 0 else 1
	# negative control: a field shifted by one step must NOT match (a check that cannot fail is reported)
	var d2: Dictionary = (g["field"] as Dictionary).duplicate()
	d2["x0"] = float(d2["x0"]) + float(d2["step"])
	var f2 := KField.from_export(d2)
	var moved := 0.0
	for k in pts.size():
		moved = max(moved, abs(f2.h(float(pts[k][0]), float(pts[k][1])) - float(g["h"][k])))
	var neg_ok := moved > 1e-3
	print("%s  negative: a field moved one step east differs by %.3f m" % ["PASS" if neg_ok else "FAIL (its negative passed)", moved])
	bad += 0 if neg_ok else 1
	var ins_ok := f.insets.size() == 1
	print("%s  the inset is read (%d)" % ["PASS" if ins_ok else "FAIL", f.insets.size()])
	bad += 0 if ins_ok else 1
	var refused := KField.from_export({"format": "krator-heightfield"}) == null
	print("%s  another format is refused" % ("PASS" if refused else "FAIL"))
	bad += 0 if refused else 1
	print("kfield: %d points, %dx%d grid, %d ms: %s" % [pts.size(), f.nx, f.nz, Time.get_ticks_msec() - t0, "all passed" if bad == 0 else "%d FAILED" % bad])
	quit(0 if bad == 0 else 1)
