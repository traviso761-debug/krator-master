# core/water's planned-biome water (ext/54, 2026-10-26) in GDScript (krator/water.gd, KWater's static twins) against WATER's own: a look's ramp,
# the polygon cells and their cracks, a salt pan by wetness, an ice's drifts, salt rim and colour, a blood fall's rust, a weed blade's sway.
# Each check has a negative.   godot --headless --path godot --script res://tests/water/kinds_ext_test.gd     exits 0 when all pass
# (the golden: node godot/tools/water_kinds_ext_golden.js)
extends SceneTree

const TOL := 1e-9

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


static func sci(v: float) -> String:
	if v == 0.0:
		return "0"
	var e := floori(log(absf(v)) / log(10.0))
	return "%.1fe%d" % [v / pow(10.0, e), e]


static func err(a, b) -> float:
	var e := 0.0
	for k in a.size():
		e = maxf(e, absf(float(a[k]) - float(b[k])))
	return e


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/water/kinds_ext_golden.json"))
	# ---- the looks
	var e := 0.0
	for k in g["looks"]:
		for s in g["looks"][k]["samples"]:
			e = maxf(e, err(KWater.look_ramp(g["looks"][k]["stops"], float(s["t"])), s["c"]))
	ok(e < TOL, "look_ramp equals WATER.rampAt for the %d looks (%s)" % [g["looks"].size(), sci(e)])
	var br: Array = g["looks"]["brine"]["stops"]
	ok(err(KWater.look_ramp(br, 0.0), KWater.look_ramp(br, 1.0)) > 0.5, "...negative: the brine's deep and rim are far apart")
	# ---- the cells
	e = 0.0
	var ec := 0.0
	for s in g["cells"]:
		var C := KWater.cells_at(float(s["x"]), float(s["z"]), float(s["cell"]), float(s["jit"]))
		e = maxf(e, err(C, s["c"]))
		ec = maxf(ec, absf(KWater.crack_of(C, 0.07) - float(s["crack"])))
	ok(e < TOL and ec < TOL, "cells_at and crack_of equal WATER.cellsAt and crackOf at %d points (%s, %s)" % [g["cells"].size(), sci(e), sci(ec)])
	var s0: Dictionary = g["cells"][0]
	ok(err(KWater.cells_at(float(s0["x"]) + 0.7, float(s0["z"]), float(s0["cell"]), float(s0["jit"])), s0["c"]) > 1e-3, "...negative: a point 0.7 m away has other distances")
	# ---- the pan
	var P: Dictionary = g["pan"]["rec"]
	e = 0.0
	var wet_film := 0
	for s in g["pan"]["samples"]:
		var v := KWater.pan_at(P, float(s["x"]), float(s["z"]), float(s["wet"]))
		e = maxf(e, err(v, s["v"]))
		if float(s["wet"]) == 1.0 and v[3] > 0.5:
			wet_film += 1
	ok(e < TOL and P["kind"] == "pan", "pan_at equals WATER.panAt (colour, film, crack, the cell's flood order) at %d points over four wetnesses (%s)" % [g["pan"]["samples"].size(), sci(e)])
	var sp: Dictionary = g["pan"]["samples"][3]
	ok(wet_film > 0 and KWater.pan_at(P, float(sp["x"]), float(sp["z"]), 0.0)[3] == 0.0, "...negative: dry, no film (%d wet points under brine)" % wet_film)
	# ---- the ice
	var I: Dictionary = g["ice"]["rec"]
	var ed := 0.0
	var er := 0.0
	e = 0.0
	for s in g["ice"]["samples"]:
		ed = maxf(ed, absf(KWater.ice_drift_at(I, float(s["x"]), float(s["z"])) - float(s["drift"])))
		er = maxf(er, absf(KWater.ice_rim_at(I, float(s["x"]), float(s["z"])) - float(s["rim"])))
		e = maxf(e, err(KWater.ice_colour_at(I, float(s["x"]), float(s["z"])), s["c"]))
	ok(ed < TOL and er < TOL and e < TOL, "the ice from its record: drifts (%d placed), salt rim and colour equal I.driftAt, rimAt, colourAt at %d points (%s, %s, %s)" % [(I["drifts"] as Array).size(), g["ice"]["samples"].size(), sci(ed), sci(er), sci(e)])
	var d0: Dictionary = I["drifts"][0]
	ok(KWater.ice_drift_at(I, float(d0["x"]), float(d0["z"])) == float(d0["depth"]) and KWater.ice_drift_at(I, 1000.0, 0.0) == 0.0, "...negative: a drift's centre is its depth, far off the ice none")
	# ---- the blood fall
	var B: Dictionary = g["blood"]
	e = 0.0
	for s in B["samples"]:
		e = maxf(e, err(KWater.blood_colour(PackedFloat64Array(B["fresh"]), PackedFloat64Array(B["red"]), float(B["age0"]), float(B["tau"]), float(B["tFall"]), float(s["f"])), s["c"]))
		e = maxf(e, absf(KWater.rust_at(float(B["age0"]) + float(s["f"]) * float(B["tFall"]), float(B["tau"])) - float(s["rust"])))
	ok(e < TOL, "blood_colour and rust_at equal B.colourAt and B.rustF down the curtain (%s)" % sci(e))
	ok(KWater.rust_at(0.0, 1.0) == 0.0 and KWater.rust_at(-2.0, 1.0) == 0.0 and KWater.rust_at(5.0, 1.0) > 0.99, "...negative: nothing rusts before it leaves the ice")
	# ---- the weed's sway
	e = 0.0
	var per := float(g["sway"]["period"])
	for s in g["sway"]["samples"]:
		e = maxf(e, absf(KWater.weed_sway(float(s["x"]), float(s["z"]), float(s["t"]), float(s["u"]), float(s["sway"]), per) - float(s["v"])))
	ok(e < TOL, "weed_sway equals WATER.weedSway (%s)" % sci(e))
	ok(KWater.weed_sway(3.0, 4.0, 10.0, 0.0, 0.12, per) == 0.0, "...negative: the root does not sway")
	print("kinds_ext_test: %s" % ("all passed" if fails == 0 else "%d FAILED" % fails))
	quit(1 if fails else 0)
