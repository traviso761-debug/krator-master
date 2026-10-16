# The Atmos autoload against core/atmos's own numbers (golden.json, written by godot/tools/atmos_golden.js from the
# JavaScript): night(), a light's hours, a halo's hours, the weather's targets, its eased steps, the lightning flash,
# the wave field's CPU twin (heights, slopes, the clock's wrap), and that shaders/atmos_waves.gdshaderinc is current;
# the cloud deck's twin and shaders/atmos_clouddeck.gdshaderinc the same way.
#   godot --headless --path godot --script res://tests/atmos/atmos_test.gd      exits 0 when every vector matches
extends SceneTree

const EPS := 1e-9
const WAVE_EPS := 1e-9   # relative (absolute under 1): sin and cos differ in the last bits between engines


func _init() -> void:
	var dir: String = get_script().resource_path.get_base_dir()
	var gold: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(dir + "/golden.json"))
	var A = load("res://krator/atmos.gd").new()
	A.clock = gold["presets"]["clock"]
	A.wind = gold["presets"]["wind"]
	A.weather_wind = gold["presets"]["wind"]["weather"]
	A.waves = gold["presets"]["waves"]
	if gold["presets"].has("clouddeck"):
		A.clouddeck = gold["presets"]["clouddeck"]
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
	var wv: Dictionary = gold["waves"]
	bad += _check("wave_wrap", wv["wrap"], func(r): return A.wave_wrap(r[0]), 1)
	var hb := 0
	for r in wv["height"]:
		if not _near(A.wave_height(r[0], r[1], r[2], r[3]), r[4]):
			hb += 1
			if hb < 4: print("  wave_height %s: got %.15f" % [str(r), A.wave_height(r[0], r[1], r[2], r[3])])
	print(("PASS" if hb == 0 else "FAIL") + "  wave_height (%d)" % wv["height"].size())
	var sb := 0
	for r in wv["slope"]:
		var s: PackedFloat64Array = A.wave_slope(r[0], r[1], r[2], r[3])
		if not (_near(s[0], r[4]) and _near(s[1], r[5]) and _near(s[2], r[6])):
			sb += 1
			if sb < 4: print("  wave_slope %s: got %s" % [str(r), str(s)])
	print(("PASS" if sb == 0 else "FAIL") + "  wave_slope (%d)" % wv["slope"].size())
	var inc := FileAccess.get_file_as_string("res://shaders/atmos_waves.gdshaderinc")
	var ib := 0 if inc == wv["include"] else 1
	print(("PASS" if ib == 0 else "FAIL") + "  shaders/atmos_waves.gdshaderinc is current" + ("" if ib == 0 else " (rerun node godot/tools/atmos_waves.js)"))
	bad += hb + sb + ib
	# the cloud deck (89-atmos-d-clouddeck.js): the twin's tops and slopes, and the generated include
	if gold.has("deck"):
		var dk: Dictionary = gold["deck"]
		bad += _check("deck_wrap", dk["wrap"], func(r): return A.deck_wrap(r[0]), 1)
		var dh := 0
		for r in dk["height"]:
			if not _near(A.deck_height(r[0], r[1], r[2], r[3]), r[4]):
				dh += 1
				if dh < 4: print("  deck_height %s: got %.15f" % [str(r), A.deck_height(r[0], r[1], r[2], r[3])])
		print(("PASS" if dh == 0 else "FAIL") + "  deck_height (%d)" % dk["height"].size())
		var ds := 0
		for r in dk["slope"]:
			var s: PackedFloat64Array = A.deck_slope(r[0], r[1], r[2], r[3])
			if not (_near(s[0], r[4]) and _near(s[1], r[5]) and _near(s[2], r[6]) and _near(s[3], r[7])):
				ds += 1
				if ds < 4: print("  deck_slope %s: got %s" % [str(r), str(s)])
		print(("PASS" if ds == 0 else "FAIL") + "  deck_slope (%d)" % dk["slope"].size())
		var dinc := FileAccess.get_file_as_string("res://shaders/atmos_clouddeck.gdshaderinc")
		var di := 0 if dinc == dk["include"] else 1
		print(("PASS" if di == 0 else "FAIL") + "  shaders/atmos_clouddeck.gdshaderinc is current" + ("" if di == 0 else " (rerun node godot/tools/atmos_clouddeck.js)"))
		bad += dh + ds + di
	A.free()
	print("all passed" if bad == 0 else "%d FAILED" % bad)
	quit(0 if bad == 0 else 1)


func _near(got: float, want: float) -> bool:
	return abs(got - want) <= WAVE_EPS * maxf(1.0, abs(want))


func _check(name: String, rows: Array, f: Callable, col: int) -> int:
	var n := 0
	for r in rows:
		var got: float = f.call(r)
		if abs(got - float(r[col])) > EPS:
			n += 1
			if n < 4: print("  %s %s: got %.12f" % [name, str(r), got])
	print(("PASS" if n == 0 else "FAIL") + "  %s (%d)" % [name, rows.size()])
	return n
