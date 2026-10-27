# The Godot side of core/terrain's strata golden test: each case's krator-strata record in golden-strata.json (written by
# test-strata.js) read by kstrata.gd must give the same formation, bed, kind, colour, hardness, lateral side, surface
# (wash and cover), terrace and ledge at the same points as the page's KSTRATA did, and bake the same bytes (sha256 of each
# texture) with the same shader parameters. Needs krand.gd one folder up (rand/), as in core/ and godot/tests/.
#   godot --headless --path godot --script res://tests/terrain/kstrata_test.gd       exits 0 when every point matches
extends SceneTree

const TOL := 1e-9   # the arithmetic is the same, so the expected difference is 0 (the JSON parse may cost an ulp)


func _sha(b: PackedByteArray) -> String:
	var h := HashingContext.new()
	h.start(HashingContext.HASH_SHA256)
	h.update(b)
	return h.finish().hex_encode()


func _num_diff(a, b) -> float:   # the largest difference between two nests of numbers (INF when the shapes differ)
	if typeof(b) == TYPE_ARRAY:
		if typeof(a) != TYPE_ARRAY or a.size() != b.size():
			return INF
		var w := 0.0
		for i in b.size():
			w = maxf(w, _num_diff(a[i], b[i]))
		return w
	if b == null:
		return 0.0 if a == null else INF
	return absf(float(a) - float(b))


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
					or bool(a["altered"]) != bool(q["altered"]) or int(a.get("side", 0)) != int(q["side"]):
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
			worst = maxf(worst, _num_diff(a["colour"], q["colour"]))
			worst = maxf(worst, absf(s.terrace(float(p[0]), float(p[2]), float(p[1])) - float(q["terrace"])))
			var sf := s.surface(float(p[0]), float(p[1]), float(p[2]), float(q["ny"]))
			if int(sf["kid"]) != int(q["skid"]):
				miss += 1
			worst = maxf(worst, _num_diff(sf["colour"], q["surface"]))
			worst = maxf(worst, _num_diff(sf["cover"], q["cover"]))
			worst = maxf(worst, absf(s.ledge(float(p[0]), float(p[2]), float(p[1]), float(q["slope"])) - float(q["ledge"])))
		# the bake: the same bytes, the same slots, blocks and shader parameters
		var gb: Dictionary = c["bake"]
		var b := s.bake(float(gb["res"]))
		var bake_bad := 0
		for k in ["W", "H", "NA", "NB", "nslots", "nblocks"]:
			if int(b[k]) != int(gb[k]):
				bake_bad += 1
		for k in ["col", "bed", "alt", "btab"]:
			if _sha(b[k]) != gb[k]:
				bake_bad += 1
		if _num_diff([b["res"], b["yA"], b["yB"]], [gb["res"], gb["yA"], gb["yB"]]) > TOL:
			bake_bad += 1
		if b["slots"].size() != gb["slots"].size() or b["blocks"].size() != gb["blocks"].size():
			bake_bad += 1
		var prm := s.params(b, {})
		for k in gb["params"]:
			if _num_diff(prm.get(k), gb["params"][k]) > TOL:
				bake_bad += 1
				print("  param %s: %s against %s" % [k, str(prm.get(k)), str(gb["params"][k])])
		var pass_ := miss == 0 and bake_bad == 0 and worst <= TOL
		if not pass_:
			bad += 1
		print(("PASS  " if pass_ else "FAIL  ") + ("%s: %d points, %d mismatched, worst %s; bake %s" % [c["name"], int(c["points"].size()), miss,
			str(worst), "the same bytes and parameters" if bake_bad == 0 else "%d differ" % bake_bad]))
	# the negative: a record with one bed's colour moved must bake other bytes
	var c0: Dictionary = g["cases"][0]
	var rec: Dictionary = c0["strata"].duplicate(true)
	rec["formations"][0]["beds"][3][3] = float(rec["formations"][0]["beds"][3][3]) + 0.01
	var neg: bool = _sha(KStrata.from_export(rec).bake(float(c0["bake"]["res"]))["col"]) != c0["bake"]["col"]
	if not neg:
		bad += 1
	print(("PASS  " if neg else "FAIL  ") + "a record with one bed's colour moved bakes other bytes (the negative)")
	print("kstrata: %s in %d ms" % ["all passed" if bad == 0 else "%d FAILED" % bad, Time.get_ticks_msec() - t0])
	quit(1 if bad else 0)
