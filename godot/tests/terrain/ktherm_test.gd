# The Godot side of KTHERM's golden test: golden-therm.json's export (written by test-therm.js) read by ktherm.gd must give the same
# temperatures, contours and snow mask as the page's KTHERM did.
#   godot --headless --path godot --script res://tests/terrain/ktherm_test.gd       exits 0 when every sample matches
extends SceneTree

const TOL := 1e-9


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-therm.json"))
	var H := KTherm.from_export(g["therm"])
	var bad := 0
	var worst := 0.0
	var pts: Array = g["points"]
	for k in pts.size():
		worst = max(worst, abs(H.heat_at(float(pts[k][0]), float(pts[k][1])) - float(g["heat"][k])))
	if worst > TOL:
		bad += 1
		print("FAIL heat, worst %s" % worst)
	var box := [-120.0, -120.0, 120.0, 120.0]
	var F := H.bake(box, 16.0)
	for nm in [["contour0", 0.0], ["contour25", 25.0]]:
		var C: Array = KTherm.contour_of(F, nm[1])
		var G: Array = g[nm[0]]
		if C.size() != G.size():
			bad += 1
			print("FAIL %s: %d lines, the page %d" % [nm[0], C.size(), G.size()])
			continue
		for i in C.size():
			if C[i]["closed"] != G[i]["closed"] or C[i]["pts"].size() != G[i]["pts"].size():
				bad += 1
				print("FAIL %s line %d" % [nm[0], i])
				continue
			for q in C[i]["pts"].size():
				for c in 2:
					if abs(float(C[i]["pts"][q][c]) - float(G[i]["pts"][q][c])) > 1e-7:
						bad += 1
	var M := H.snow_mask(box, 16.0)
	for k in M.size():
		if M[k] != int(g["mask"][k]):
			bad += 1
	# the negative: another soil must not match
	var N := KTherm.from_export(g["therm"])
	N.soil_raster = {}
	N.soil_value = 40.0
	if abs(N.heat_at(float(pts[0][0]), float(pts[0][1])) - float(g["heat"][0])) < TOL:
		bad += 1
		print("FAIL the negative matched")
	print("ktherm: %d points, worst %s; %s" % [pts.size(), worst, "PASS" if bad == 0 else "FAIL %d" % bad])
	quit(0 if bad == 0 else 1)
