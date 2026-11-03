# The Godot side of the flush's golden test: KCLOCK.flush's vectors (golden-flush.json, written by test-flush.js) run on
# kseason.gd's KSeason.flush. From a Godot 4 project that holds kseason.gd, this file and golden-flush.json in one folder:
#   godot --headless --path godot --script res://tests/clock/kseason_flush_test.gd      exits 0 when every vector matches
extends SceneTree

const KSeason := preload("kseason.gd")
const EPS := 1e-9


func _initialize() -> void:
	var dir: String = get_script().resource_path.get_base_dir()
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/golden-flush.json"))
	var bad := 0
	for c in gold["cases"]:
		var f: Dictionary = KSeason.flush(float(c["day"]), float(c["hour"]), c["o"])
		for k in ["flush", "since"]:
			if absf(float(f[k]) - float(c["out"][k])) > EPS:
				bad += 1
				printerr("FAIL day %s %s: %s, want %s" % [c["day"], k, f[k], c["out"][k]])
	# a negative: the winter rains' onset is half a year from the summer rains'
	var a: float = KSeason.flush(100.0, 0.0, {})["since"]
	var b: float = KSeason.flush(100.0, 0.0, {"wetIn": "winter"})["since"]
	if absf(absf(a - b) - 182.5) > 1e-6:
		bad += 1
		printerr("FAIL the negative: winter rains %s days from summer's, want 182.5" % absf(a - b))
	print("kseason flush: %d cases, %s" % [gold["cases"].size(), "all passed" if bad == 0 else "%d FAILED" % bad])
	quit(1 if bad else 0)
