# The weather cells (godot/krator/atmos_cells.gd) against the page's own numbers: core/atmos/wx/golden-cells.json, written by
# node core/atmos/wx/test-cells.js --write. Three systems (a temperate, a desert and a cold ash climate): their weights, the
# cells of six slots at four times, the local weather at 24 places and times, a 16 x 16 coverage map, the strikes of 50 minutes
# and the shafts. Every draw is an integer hash and the arithmetic is the JavaScript's, so the match is exact (1e-9 relative);
# the map to 2e-6 (the page keeps it in float32).
#   godot --headless --path godot --script res://tests/atmos/cells_test.gd      exits 0 when every vector matches
extends SceneTree

const EPS := 1e-9


func _near(a, b, e := EPS) -> bool:
	return abs(float(a) - float(b)) <= e * maxf(1.0, abs(float(b)))


func _init() -> void:
	var path := ProjectSettings.globalize_path("res://").path_join("../core/atmos/wx/golden-cells.json").simplify_path()
	var gold = JSON.parse_string(FileAccess.get_file_as_string(path))
	if gold == null:
		print("FAIL  cannot read " + path)
		quit(1)
		return
	var C = load("res://krator/atmos_cells.gd").new(gold["preset"], [0.8, 0.35])
	var bad := 0
	for Y in gold["systems"]:
		var inp: Dictionary = Y["input"]
		var S: Dictionary = C.system(inp)
		var name := "seed %d" % int(inp["seed"])
		var n := 0
		for k in ["rain", "storm", "fog", "snow", "dust", "ash", "clear", "aridity"]:
			if not _near(S["weights"][k], Y["weights"][k]):
				n += 1
				print("  %s weight %s: %.15f want %.15f" % [name, k, S["weights"][k], Y["weights"][k]])
		if not (_near(S["vx"], Y["vx"]) and _near(S["vz"], Y["vz"]) and _near(S["reach"], Y["reach"]) and _near(S["virga"], Y["virga"])):
			n += 1
			print("  %s system: %s" % [name, str([S["vx"], S["vz"], S["reach"], S["virga"]])])
		print(("PASS" if n == 0 else "FAIL") + "  %s: weights and the steering wind" % name)
		bad += n
		n = 0
		for r in Y["cells"]:
			var c = C.cell(S, int(r["ix"]), int(r["iz"]), int(r["k"]), float(r["t"]))
			var w = r["c"]
			if (c == null) != (w == null):
				n += 1
				if n < 4: print("  %s cell %s: got %s want %s" % [name, str([r["ix"], r["iz"], r["k"], r["t"]]), str(c), str(w)])
				continue
			if c == null:
				continue
			var good: bool = int(c["id"]) == int(w["id"]) and c["kind"] == w["kind"]
			for f in ["x", "z", "r", "el", "s", "env", "born", "life", "age"]:
				good = good and _near(c[f], w[f])
			if not good:
				n += 1
				if n < 4: print("  %s cell %s: got %s want %s" % [name, str([r["ix"], r["iz"], r["k"], r["t"]]), str(c), str(w)])
		print(("PASS" if n == 0 else "FAIL") + "  %s: cells (%d)" % [name, Y["cells"].size()])
		bad += n
		n = 0
		for p in Y["points"]:
			var g: Dictionary = C.weather_at(float(p["x"]), float(p["z"]), float(p["t"]), S)
			var good := true
			for f in ["rain", "fog", "snow", "dust", "ash", "storm", "wet", "wind", "cover", "dark"]:
				good = good and _near(g[f], p["w"][f])
			if not good:
				n += 1
				if n < 4: print("  %s weather at %s: got %s want %s" % [name, str([p["x"], p["z"], p["t"]]), str(g), str(p["w"])])
		print(("PASS" if n == 0 else "FAIL") + "  %s: weather_at (%d)" % [name, Y["points"].size()])
		bad += n
		var m: PackedFloat64Array = C.cover_map(S, 4321.0, 500.0, -700.0, 16, 48000.0)
		n = 0
		for i in m.size():
			if abs(m[i] - float(Y["map16"][i])) > 2e-6:
				n += 1
				if n < 4: print("  %s map[%d]: got %.7f want %.7f" % [name, i, m[i], Y["map16"][i]])
		print(("PASS" if n == 0 else "FAIL") + "  %s: the coverage map (16 x 16)" % name)
		bad += n
		var st: Array = C.strikes(S, 0.0, 3000.0, 0.0, 0.0, 20000.0)
		n = 0 if st.size() == Y["strikes"].size() else 1
		if n == 0:
			for i in st.size():
				var a: Dictionary = st[i]
				var b: Dictionary = Y["strikes"][i]
				if not (int(a["seed"]) == int(b["seed"]) and _near(a["t"], b["t"]) and _near(a["x"], b["x"]) and _near(a["z"], b["z"]) and _near(a["power"], b["power"]) and a["ash"] == b["ash"]):
					n += 1
					if n < 4: print("  %s strike %d: got %s want %s" % [name, i, str(a), str(b)])
		else:
			print("  %s strikes: got %d want %d" % [name, st.size(), Y["strikes"].size()])
		print(("PASS" if n == 0 else "FAIL") + "  %s: strikes (%d)" % [name, Y["strikes"].size()])
		bad += n
		var sh: Array = C.shafts(S, 0.0, 0.0, 3000.0)
		n = 0 if sh.size() == Y["shafts"].size() else 1
		if n == 0:
			for i in sh.size():
				if int(sh[i]["id"]) != int(Y["shafts"][i]["id"]) or int(sh[i]["virga"]) != int(Y["shafts"][i]["virga"]) or not _near(sh[i]["k"], Y["shafts"][i]["k"]):
					n += 1
		print(("PASS" if n == 0 else "FAIL") + "  %s: shafts (%d)" % [name, Y["shafts"].size()])
		bad += n
	# the Atmos autoload's step takes the live sample as it is
	var A = load("res://krator/atmos.gd").new()
	var W: Dictionary = A.weather_state("live")
	var S0: Dictionary = C.system(gold["systems"][0]["input"])
	W["live"] = C.weather_at(1000.0, 1000.0, 7000.0, S0)
	A.weather_step(W, 14.0, 1.0 / 60.0)
	var lv := 0 if (W["rain"] == W["live"]["rain"] and W["wet"] == W["live"]["wet"] and W["wind"] == W["live"]["wind"]) else 1
	print(("PASS" if lv == 0 else "FAIL") + "  Atmos.weather_step takes the live sample")
	bad += lv
	A.free()
	print("all passed" if bad == 0 else "%d FAILED" % bad)
	quit(0 if bad == 0 else 1)
