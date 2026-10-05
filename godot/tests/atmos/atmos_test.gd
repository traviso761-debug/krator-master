# The Atmos autoload against core/atmos's own numbers (golden.json, written by godot/tools/atmos_golden.js from the
# JavaScript): night(), a light's hours, a halo's hours, the weather's targets, its eased steps, the lightning flash.
#   godot --headless --path godot --script res://tests/atmos/atmos_test.gd      exits 0 when every vector matches
extends SceneTree

const EPS := 1e-9


func _init() -> void:
	var dir: String = get_script().resource_path.get_base_dir()
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/golden.json"))
	var A = load("res://krator/atmos.gd").new()
	A.clock = gold["presets"]["clock"]
	A.wind = gold["presets"]["wind"]
	A.weather_wind = gold["presets"]["wind"]["weather"]
	var bad := 0
	bad += _check("night", gold["night"], func(r): return A.night(r[0]), 1)
	bad += _check("lit", gold["lit"], func(r): return A.lit(r[0], r[1], r[2]), 3)
	bad += _check("glow_lit", gold["glowLit"], func(r): return A.glow_lit(r[0], r[1], r[2]), 3)
	var tb := 0
	for r in gold["target"]:
		var g: Dictionary = A.weather_target(r[0], r[1])
		if abs(g["rain"] - r[2]) > EPS or abs(g["fog"] - r[3]) > EPS or abs(g["wind"] - r[4]) > EPS:
			tb += 1
			if tb < 4: print("  target %s at %.2f: %s, want %s" % [r[0], r[1], g, r.slice(2)])
	print(("PASS" if tb == 0 else "FAIL") + "  weather targets (%d)" % gold["target"].size())
	bad += tb
	for run in gold["runs"]:
		var W: Dictionary = A.weather_state(run["mode"])
		for k in run["start"]:
			W[k] = float(run["start"][k])
		var h: float = run["hour"]
		var rb := 0
		var j := 0
		for i in int(run["n"]):
			A.weather_step(W, h, run["dt"])
			h = fmod(h + float(run["dt"]) * float(run["hourRate"]), 24.0)
			if i % 10 == 9:
				var s: Array = run["states"][j]
				j += 1
				if abs(W["rain"] - s[0]) > EPS or abs(W["fog"] - s[1]) > EPS or abs(W["wet"] - s[2]) > EPS or abs(W["wind"] - s[3]) > EPS:
					rb += 1
		print(("PASS" if rb == 0 else "FAIL") + "  weather run: " + run["name"] + ("" if rb == 0 else " (%d states differ)" % rb))
		bad += rb
	bad += _check("flash", gold["flash"], func(r): return A.flash_at(r[0]), 1)
	A.free()
	print("all passed" if bad == 0 else "%d FAILED" % bad)
	quit(0 if bad == 0 else 1)


func _check(name: String, rows: Array, f: Callable, col: int) -> int:
	var n := 0
	for r in rows:
		var got: float = f.call(r)
		if abs(got - float(r[col])) > EPS:
			n += 1
			if n < 4: print("  %s %s: got %.12f" % [name, str(r), got])
	print(("PASS" if n == 0 else "FAIL") + "  %s (%d)" % [name, rows.size()])
	return n
