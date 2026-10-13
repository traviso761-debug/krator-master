# sedesert's notch, cataract and plunge pool through core/export (godot/data/world-sedesert-falls: python3
# tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert-falls --box 2850,-320,3450,280):
# the water section's flow (the river's last reach and the rest of its line), fall and still surfaces are rebuilt by
# KWater and drawn by krator/water_import.gd, each mesh the page's own (its vertex count and sums), and the page's own
# heights and currents at the probes equal KWater's. Negative: the probes read a second late, and the river's line
# moved 1 m, must miss.
#   godot --headless --path godot --script res://tests/water/falls_case_test.gd      exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	var path := "res://data/world-sedesert-falls/world.json"
	if not FileAccess.file_exists(path):
		ok(false, "no case: run the export named at the top of this file")
		quit(1)
		return
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	var sec: Dictionary = d["water"]
	var kinds := {}
	for r in sec["surfaces"]:
		kinds[r["kind"]] = kinds.get(r["kind"], 0) + 1
	ok(kinds.get("flow", 0) == 1 and kinds.get("fall", 0) == 1 and kinds.get("still", 0) == 1,
		"the tile's water section holds the river, the cataract and the plunge pool (%s)" % JSON.stringify(kinds))
	var wn := KratorWater.build(sec, d.get("box"), null)
	var same := 0
	var meshes := 0
	var drawn := {}
	for c in wn.get_children():
		var m: Dictionary = c.get_meta("krator", {})
		drawn[m.get("kind", "open")] = m
		if m.has("matches_page"):
			meshes += 1
			if m["matches_page"] == true:
				same += 1
	ok(drawn.has("flow") and drawn.has("fall") and drawn.has("plunge") and drawn.has("still") and meshes == 2 and same == 2,
		"drawn: the river's ribbon (%d vertices), the curtain (%d vertices, %s m drop), its plunge disc and the pool; both meshes the page's own (%d of %d)"
		% [drawn.get("flow", {}).get("vertices", 0), drawn.get("fall", {}).get("vertices", 0), drawn.get("fall", {}).get("drop", 0), same, meshes])
	var pr := KratorWater.check_probes(sec, wn.get_meta("surfaces"))
	ok(pr["missing"] == 0 and pr["flow"] > 0 and pr["max_abs_m"] < 1e-9 and pr["max_flow"] < 1e-9,
		"the page's probes: %d heights (%d on the river, with its current), max %s m, current %s m/s" % [pr["points"], pr["flow"], str(pr["max_abs_m"]), str(pr["max_flow"])])
	# negatives: the river moved 1 m east
	var S: Dictionary = wn.get_meta("surfaces")
	for id in S:
		var w: KWater = S[id]
		if w.kind == "flow":
			for p in w.pts:
				p["x"] += 1.0
	var moved := KratorWater.check_probes(sec, S)
	ok(moved["max_abs_m"] > 1e-4 or moved["max_flow"] > 1e-4, "negative: the river's line moved 1 m misses the page's probes (%.4f m, %.4f m/s)" % [moved["max_abs_m"], moved["max_flow"]])
	wn.free()
	print("falls case: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(1 if fails else 0)
