# The Godot side of KLAVA's golden test: golden-lava.json's case (written by test-lava.js --write) run by klava.gd must give
# the page's steps, mass and sample cells. pow is each engine's own (the cube root is pow(x, 1/3) in both), so the match is to a tolerance.
#   godot --headless --path godot --script res://tests/terrain/klava_test.gd       exits 0 when every number matches
extends SceneTree

const TOL_H := 1e-4    # metres: the engines' pow differ by an ulp, and 663 steps carry it to ~2e-6 m (2026-10-27)
const TOL_T := 1e-3    # kelvin
const TOL_REL := 1e-7  # of the erupted volume


func _init() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(get_script().resource_path.get_base_dir() + "/golden-lava.json"))
	var H := Marshalls.base64_to_raw(g["heights"]).to_float32_array()
	var t0 := Time.get_ticks_msec()
	var s := KLava.new(H, int(g["nx"]), int(g["nz"]), float(g["x0"]), float(g["z0"]), float(g["step"]), {"seed": 7, "rough": 0.4, "dtMax": 30.0})
	var Q := func(t: float) -> float: return 300.0 * (1.0 - t / (4.0 * 3600.0)) if t < 4.0 * 3600.0 else 0.0
	s.vent({"x": 1000.0, "z": 1000.0, "r": 30.0, "Q": Q})
	s.run(2.0 * 3600.0)
	var ms := Time.get_ticks_msec() - t0
	var bad := 0
	var ok := func(name: String, pass_: bool) -> void:
		print(("PASS  " if pass_ else "FAIL  ") + name)
	var m := s.mass()
	var gm: Dictionary = g["mass"]
	var p1: bool = s.steps == int(g["steps"])
	ok.call("the same number of steps (%d, the page %d)" % [s.steps, int(g["steps"])], p1); bad += 0 if p1 else 1
	var er: float = float(gm["erupted"])
	var p2: bool = abs(m["erupted"] - er) <= TOL_REL * er and abs(m["molten"] - float(gm["molten"])) <= TOL_REL * er and abs(m["frozen"] - float(gm["frozen"])) <= TOL_REL * er
	ok.call("the mass: erupted, molten, frozen within %s of the erupted volume" % String.num_scientific(TOL_REL), p2); bad += 0 if p2 else 1
	var p3: bool = abs(m["error"]) <= 1e-9 * er
	ok.call("mass conserved (error %s m3)" % String.num_scientific(m["error"]), p3); bad += 0 if p3 else 1
	var wh := 0.0
	var wt := 0.0
	for c in g["cells"]:
		var k := int(c["k"])
		wh = max(wh, abs(s.h[k] - float(c["h"])), abs(s.dep[k] - float(c["dep"])))
		wt = max(wt, abs(s.T[k] - float(c["T"])))
	var sh := 0.0
	for k in s.n_cells:
		sh += s.h[k]
	var p4: bool = wh <= TOL_H and wt <= TOL_T and abs(sh - float(g["sumH"])) <= TOL_H * s.n_cells
	ok.call("the sample cells: h and dep within %s m (worst %s), T within %s K (worst %s)" % [String.num_scientific(TOL_H), String.num_scientific(wh), String.num_scientific(TOL_T), String.num_scientific(wt)], p4); bad += 0 if p4 else 1
	# negative control: another roughness seed must NOT match (a check that cannot fail is reported)
	var s2 := KLava.new(H, int(g["nx"]), int(g["nz"]), float(g["x0"]), float(g["z0"]), float(g["step"]), {"seed": 8, "rough": 0.4, "dtMax": 30.0})
	s2.vent({"x": 1000.0, "z": 1000.0, "r": 30.0, "Q": Q})
	s2.run(2.0 * 3600.0)
	var moved := 0.0
	for c in g["cells"]:
		moved = max(moved, abs(s2.h[int(c["k"])] - float(c["h"])))
	var p5: bool = moved > TOL_H
	ok.call("negative: seed 8 differs (by %s m)" % String.num_scientific(moved), p5); bad += 0 if p5 else 1
	print("%d steps in %d ms" % [s.steps, ms])
	print("all passed" if bad == 0 else "%d FAILED" % bad)
	quit(0 if bad == 0 else 1)
