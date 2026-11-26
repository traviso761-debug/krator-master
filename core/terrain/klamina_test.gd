# The Godot side of the lamina's golden test: golden-lamina.json's export (written by test-lamina.js) read by klamina.gd must give the
# same years, days, bands, depths and bake bytes as the page's KSTRATA.lamina did.
#   godot --headless --path godot --script res://tests/terrain/klamina_test.gd       exits 0 when every sample matches
extends SceneTree

const TOL := 1e-9


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-lamina.json"))
	var L := KLamina.from_export(g["lamina"])
	var bad := 0
	if L.years != int(g["years"]) or L.days != int(g["days"]) or L.first_day != int(g["firstDay"]):
		bad += 1
		print("FAIL the column: %d years %d days, the page %d %d" % [L.years, L.days, int(g["years"]), int(g["days"])])
	var worst := 0.0
	var D: Array = g["depths"]
	for k in D.size():
		var p := L.at(float(D[k]))
		var q = g["at"][k]
		if q == null:
			if not p.is_empty():
				bad += 1
			continue
		for f in ["year", "yearDay", "day", "daysAgo"]:
			if int(p[f]) != int(q[f]):
				bad += 1
				print("FAIL at %s: %s %s, the page %s" % [D[k], f, p[f], q[f]])
		for f in ["half", "layer"]:
			if String(p[f]) != String(q[f]):
				bad += 1
		if bool(p["wet"]) != bool(q["wet"]) or str(p["marker"]) != str(q["marker"]):
			bad += 1
			print("FAIL at %s: wet or marker" % D[k])
		worst = max(worst, abs(float(p["phase"]) - float(q["phase"])), abs(float(p["thick"]) - float(q["thick"])))
		for c in 3:
			worst = max(worst, abs(float(p["colour"][c]) - float(q["colour"][c])))
	if worst > TOL:
		bad += 1
		print("FAIL at: worst %s" % worst)
	var dl: Array = g["dayList"]
	for k in dl.size():
		var z := L.depth_of(int(dl[k]))
		var w = g["depthOf"][k]
		if (w == null and z >= 0.0) or (w != null and abs(z - float(w)) > TOL):
			bad += 1
			print("FAIL depth_of %s: %s, the page %s" % [dl[k], z, w])
	var B := L.bake(float(g["bakeRes"]))
	var GB: Array = g["bake"]
	var diff := 0
	if B.size() != GB.size():
		diff = -1
	else:
		for k in B.size():
			if B[k] != int(GB[k]):
				diff += 1
	if diff != 0:
		bad += 1
		print("FAIL bake: %d bytes differ" % diff)
	# the negative: another seed must not match
	var e2: Dictionary = g["lamina"].duplicate(true)
	e2["opts"]["seed"] = int(e2["opts"]["seed"]) + 1
	var N := KLamina.from_export(e2)
	if N.at(10.0)["day"] == L.at(10.0)["day"] and N.years == L.years:
		bad += 1
		print("FAIL the negative matched")
	print("klamina: %d depths, %d days, %d bake bytes, worst %s; %s" % [D.size(), dl.size(), B.size(), worst, "PASS" if bad == 0 else "FAIL %d" % bad])
	quit(0 if bad == 0 else 1)
