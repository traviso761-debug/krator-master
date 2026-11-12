# The Godot side of KRELIEF.slab's golden test: golden-slab.json's record (written by test-slab.js) read by kslab.gd must give the same
# heights, parts, spurs and scar weights as the page's KRELIEF did.
#   godot --headless --path godot --script res://tests/terrain/kslab_test.gd       exits 0 when every sample matches
extends SceneTree

const TOL := 1e-6


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-slab.json"))
	var R := KSlab.from_export(g["slab"])
	var bad := 0
	var worst := 0.0
	var pts: Array = g["points"]
	for k in pts.size():
		var x := float(pts[k][0])
		var z := float(pts[k][1])
		var e := absf(R.shape(x, z, 3290.0) - float(g["shape"][k]))
		worst = maxf(worst, e)
		var A := R.at(x, z)
		var G = g["at"][k]
		if G == null:
			if not A.is_empty():
				bad += 1
				if bad < 8:
					print("FAIL at (%s, %s): %s, the page null" % [x, z, A["part"]])
			continue
		if A.is_empty() or A["part"] != G[0] or int(A["spur"]) != int(G[1]) or absf(float(A["fresh"]) - float(G[2])) > 1e-9 \
				or absf(float(A["share"]) - float(G[3])) > 1e-9:
			bad += 1
			if bad < 8:
				print("FAIL at (%s, %s): %s, the page %s" % [x, z, A, G])
	if worst > TOL:
		bad += 1
		print("FAIL shape, worst %s m" % worst)
	var refused := KSlab.from_export({"format": "krator-scarp"}) == null
	if not refused:
		bad += 1
		print("FAIL took a record that is not a krator-slab")
	print("kslab: %d points, worst %s m, %s" % [pts.size(), worst, "all passed" if bad == 0 else "%d FAILED" % bad])
	quit(0 if bad == 0 else 1)
