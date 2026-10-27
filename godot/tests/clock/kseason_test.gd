# The Godot side of the season's golden test: KCLOCK.season's vectors (golden-season.json, written by test-clock.js)
# run on kseason.gd. From a Godot 4 project that holds kseason.gd, kseason_test.gd and golden-season.json in one folder:
#   godot --headless --path godot --script res://tests/clock/kseason_test.gd      exits 0 when every vector matches
extends SceneTree

const KSeason := preload("kseason.gd")
const EPS := 1e-9


func _initialize() -> void:
	var dir: String = get_script().resource_path.get_base_dir()
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/golden-season.json"))
	var bad := 0
	for c in gold["cases"]:
		var o: Dictionary = gold["opts"][int(c["opts"])]
		var s: Dictionary = KSeason.season(float(c["day"]), float(c["hour"]), o)
		var g: Dictionary = c["s"]
		var tag := "day %s hour %s opts %s" % [c["day"], c["hour"], c["opts"]]
		for k in ["yearDay", "phase", "summer", "wet", "dry"]:
			if absf(float(s[k]) - float(g[k])) > EPS:
				bad += 1
				printerr("FAIL %s %s: %s, want %s" % [tag, k, s[k], g[k]])
		if int(s["quarter"]) != int(g["quarter"]) or s["name"] != g["name"]:
			bad += 1
			printerr("FAIL %s quarter: %s %s, want %s %s" % [tag, s["quarter"], s["name"], g["quarter"], g["name"]])
	# a negative: the solstice half a year out must not give the midsummer wet
	var off: Dictionary = KSeason.season(91.0, 0.0, {"year": {"yearD": 365.0, "startDay": 259.0, "solsticeDay": 167.5}})
	if absf(float(off["wet"]) - 1.0) < EPS:
		bad += 1
		printerr("FAIL the negative (the solstice moved) matched")
	print("kseason: %d cases, %s" % [gold["cases"].size(), "all passed" if bad == 0 else "%d FAILED" % bad])
	quit(1 if bad else 0)
