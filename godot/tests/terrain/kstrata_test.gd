# The Godot side of core/terrain's strata golden test: each case's krator-strata record in golden-strata.json (written by
# test-strata.js) read by kstrata.gd must give the same formation, bed, kind, colour, hardness and terrace at the same
# points as the page's KSTRATA did. Needs krand.gd one folder up (rand/), as in core/ and godot/tests/.
#   godot --headless --path godot --script res://tests/terrain/kstrata_test.gd       exits 0 when every point matches
extends SceneTree

const TOL := 1e-9   # the arithmetic is the same, so the expected difference is 0 (the JSON parse may cost an ulp)


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-strata.json"))
	var t0 := Time.get_ticks_msec()
	var bad := 0
	for c in g["cases"]:
		var s := KStrata.from_export(c["strata"])
		var worst := 0.0
		var miss := 0
		for q in c["points"]:
			var p: Array = q["p"]
			var a := s.at(float(p[0]), float(p[1]), float(p[2]))
			if int(a["formation"]) != int(q["formation"]) or int(a["bed"]) != int(q["bed"]) or int(a["kid"]) != int(q["kid"]) \
					or bool(a["altered"]) != bool(q["altered"]):
				miss += 1
			if (a["cell"] == null) != (q["cell"] == null):
				miss += 1
			elif a["cell"] != null:
				for k in 3:
					if int(a["cell"][k]) != int(q["cell"][k]):
						miss += 1
			worst = maxf(worst, absf(float(a["yy"]) - float(q["yy"])))
			worst = maxf(worst, absf(float(a["hard"]) - float(q["hard"])))
			worst = maxf(worst, absf(float(a["f"]) - float(q["f"])))
			worst = maxf(worst, absf(float(a["edge"]) - float(q["edge"])))
			for k in 3:
				worst = maxf(worst, absf(float(a["colour"][k]) - float(q["colour"][k])))
			worst = maxf(worst, absf(s.terrace(float(p[0]), float(p[2]), float(p[1])) - float(q["terrace"])))
		var pass_ := miss == 0 and worst <= TOL
		if not pass_:
			bad += 1
		print(("PASS  " if pass_ else "FAIL  ") + ("%s: %d points, %d mismatched, worst %s" % [c["name"], int(c["points"].size()), miss, str(worst)]))
	print("kstrata: %s in %d ms" % ["all passed" if bad == 0 else "%d FAILED" % bad, Time.get_ticks_msec() - t0])
	quit(1 if bad else 0)
