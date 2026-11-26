# The Godot side of core/terrain's varied-contacts golden test: golden-strata-vary.json's krator-strata-vary record (written by
# test-strata-vary.js) read by kstrata_vary.gd must give the same formation, bed, kind, colour, stratigraphic height, shift,
# contacts and thicknesses at the same points as the page's KSTRATA.vary did. Needs kstrata.gd beside it, krand.gd in rand/.
#   godot --headless --path godot --script res://tests/terrain/kstrata_vary_test.gd       exits 0 when every point matches
extends SceneTree

const TOL := 1e-9


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-strata-vary.json"))
	var t0 := Time.get_ticks_msec()
	var V := KStrataVary.from_export(g["record"])
	var miss := 0
	var worst := 0.0
	for q in g["cases"]:
		var p: Array = q["p"]
		var x := float(p[0])
		var y := float(p[1])
		var z := float(p[2])
		var a := V.at(x, y, z)
		if int(a["formation"]) != int(q["formation"]) or int(a["bed"]) != int(q["bed"]) or int(a["kid"]) != int(q["kid"]):
			miss += 1
		worst = maxf(worst, absf(float(a["yy"]) - float(q["yy"])))
		worst = maxf(worst, absf(float(a["varied"]) - float(q["varied"])))
		for k in 3:
			worst = maxf(worst, absf(float(a["colour"][k]) - float(q["colour"][k])))
		for k in 4:
			worst = maxf(worst, absf(V.contact(x, z, k + 1) - float(q["contact"][k])))
		for k in 5:
			worst = maxf(worst, absf(V.thickness(x, z, k) - float(q["thickness"][k])))
	var pass_ := miss == 0 and worst <= TOL
	print(("PASS  " if pass_ else "FAIL  ") + "%d points, %d mismatched, worst %s" % [g["cases"].size(), miss, str(worst)])
	# the negative: one contact's constant moved must change some point's rock
	var rec: Dictionary = g["record"].duplicate(true)
	rec["contacts"][2]["by"]["d"] = float(rec["contacts"][2]["by"]["d"]) + 30.0
	var W := KStrataVary.from_export(rec)
	var moved := 0
	for q in g["cases"]:
		var p: Array = q["p"]
		if int(W.at(float(p[0]), float(p[1]), float(p[2]))["formation"]) != int(q["formation"]):
			moved += 1
	var neg := moved > 0
	print(("PASS  " if neg else "FAIL  ") + "a contact moved 30 m changes the rock at %d points (the negative)" % moved)
	var bad := (0 if pass_ else 1) + (0 if neg else 1)
	print("kstrata_vary: %s in %d ms" % ["all passed" if bad == 0 else "%d FAILED" % bad, Time.get_ticks_msec() - t0])
	quit(1 if bad else 0)
