# The Godot side of core/world/golden-relief.json (PLAN-RELIEF.md P9, P15): the relief's GDScript twins run on the golden's
# own inputs (as test-golden-relief.js makes them) and compared to 1e-6, strings exactly: wsmooth.gd (curve, line,
# heights), wrelief.gd (bench, erode, peaks, caprock), wstreams.gd (trace, decode), wland.gd on core/terrain's kstacks.gd
# (records, land, fissures, cut). From the Godot project, with the twins and golden-relief.json copied into
# res://tests/relief/ and kstacks.gd into res://tests/terrain/ (as core/rand's krand.gd is in godot/tests/rand/):
#   godot --headless --path godot --script res://tests/relief/wrelief_test.gd      exits 0 when every value matches
extends SceneTree

const KRand := preload("../rand/krand.gd")
const WRelief := preload("wrelief.gd")
const WSmooth := preload("wsmooth.gd")
const WStreams := preload("wstreams.gd")
const WLand := preload("wland.gd")
const WMicro := preload("wmicro.gd")
const KStacks := preload("../terrain/kstacks.gd")

var worst := 0.0


# the first difference between a and b ("" when none), numbers to 1e-6; the largest numeric difference into `worst`
func diff(a, b, at: String) -> String:
	var na: bool = a is int or a is float
	var nb: bool = b is int or b is float
	if na and nb:
		var d := absf(float(a) - float(b))
		worst = maxf(worst, d)
		return "" if d <= 1e-6 else at + ": " + str(a) + " against " + str(b)
	if a is Array and b is Array:
		if a.size() != b.size():
			return at + ": " + str(a.size()) + " values against " + str(b.size())
		for i in a.size():
			var r := diff(a[i], b[i], at + "[" + str(i) + "]")
			if r != "":
				return r
		return ""
	if a is Dictionary and b is Dictionary:
		var ks := {}
		for k in a.keys():
			ks[k] = 1
		for k in b.keys():
			ks[k] = 1
		for k in ks.keys():
			var r := diff(a.get(k), b.get(k), at + "." + str(k))
			if r != "":
				return r
		return ""
	return "" if a == b else at + ": " + JSON.stringify(a) + " against " + JSON.stringify(b)


static func ground(x: float, z: float) -> float:
	return 100 + 0.01 * x + 20 * KRand.vnoise(x / 3000, z / 3000, 0.5, 3)


func snapshot() -> Dictionary:
	var G := {}
	# WSMOOTH: a curve through a zigzag with its meander, a relaxed line, the contour smoothing of a staircase grid
	var Z := [[0.0, 0.0, 1.0], [250.0, 0.0, 2.0], [500.0, 250.0, 3.0], [750.0, 250.0, 4.0], [1000.0, 500.0, 5.0], [1250.0, 500.0, 6.0]]
	G.curve = WSmooth.curve(Z, {"step": 60.0, "meander": {"amp": 20.0, "wave": 150.0, "seed": KRand.child(7, "streams"), "ox": 1e6, "oz": 2e6}})
	G.line = WSmooth.line(Z, {"step": 80.0, "relax": 4})
	var hx := 24
	var hy := 20
	var HE := PackedFloat64Array()
	HE.resize(hx * hy)
	for j in hy:
		for i in hx:
			HE[j * hx + i] = 100 * floorf((i + 0.6 * j) / 4)
	var Hs := WSmooth.heights(HE, hx, hy, {"px": 4.0, "cell": 500.0})
	G.heights = []
	for k in Hs.size():
		if k % 7 == 0:
			G.heights.append(Hs[k])
	# WRELIEF: the benches, the erosion filter and the peaks at 300 points (a world-absolute frame)
	WRelief.init(2000000.0, 3000000.0, 7)
	var S := {"terr": 0.75, "step": 55.0, "gully": 1.0, "peak": 1.0}
	G.bench = []
	G.erode = []
	G.peaks = []
	G.caprock = []
	for k in 300:
		var x := float((k * 7919) % 40000)
		var z := float((k * 104729) % 40000)
		G.bench.append(WRelief.bench(500.0 + 0.05 * x, x, z, S, 600.0, 0.0))
		G.erode.append(WRelief.erode(500.0, x, z, -0.15, 0.05, S, 800.0, 0.0))
		G.peaks.append(WRelief.peaks(0.0, x, z, S, 1200.0, 0.8, 0.0))
		G.caprock.append(WRelief.caprock(x, z, S, 600.0))
	# WMICRO (PLAN-MICRO.md): the hills, the drainage (its height and the slope it leaves) and the grain
	WMicro.init(2000000.0, 3000000.0, 9)
	var SM := {"hill": 40.0, "gully": 0.8, "rough": 1.0}
	G.mhills = []
	G.merode = []
	G.mgrain = []
	for k in 300:
		var x := float((k * 7919) % 40000)
		var z := float((k * 104729) % 40000)
		G.mhills.append(WMicro.hills(x, z, SM, 600.0, 0.0))
		var gm := [0.0, 0.0]
		var hm := WMicro.erode(500.0, x, z, -0.08, 0.05, SM, 600.0, 0.0, gm)
		G.merode.append([hm, gm[0], gm[1]])
		G.mgrain.append(WMicro.grain(x, z, 0.3, 0.2, -0.1, SM, 0.0))
	# WSTREAMS: the trace on a valley with a depression, its lines as region.json keeps them, their decode, the tarns
	var nx := 60
	var ny := 80
	var cell := 250.0
	var n := nx * ny
	var E := PackedFloat32Array()
	E.resize(n)
	var K := PackedByteArray()
	K.resize(n)
	var RW := PackedFloat32Array()
	RW.resize(n)
	var RM := PackedFloat32Array()
	RM.resize(n)
	for j in ny:
		for i in nx:
			var c := j * nx + i
			var d := WStreams.hypot(i - 30, j - 40)
			E[c] = (ny - j) * cell * 0.015 + absi(i - 30) * cell * 0.03 + (KRand.vnoise(i / 3.7, j / 3.7, 0.5, 11) - 0.5) * 6 - (120 * (1 - d / 5) if d < 5 else 0.0)
			RM[c] = 900.0
			RW[c] = 900 * cell * cell / 1e6 / 16
	var T := WStreams.trace({"nx": nx, "ny": ny, "cell": cell, "x0": 0.0, "z0": 0.0, "E": E, "K": K, "RW": RW, "RM": RM, "amin": 200.0, "chanMin": 3e4,
		"wetMM": 450.0, "minLen": 1000.0, "incise": {"k": 8.0, "sigma": 1.5, "iters": 2}})
	G.trace = {"lines": T.lines, "ponds": T.ponds, "cells": T.cells, "heads": T.heads}
	G.decode = WStreams.decode(T.lines[0], {"cell": cell, "x0": 0.0, "z0": 0.0})
	# WLAND: the records a savanna and the High Rift place, and the land with them at points
	var gr := func(x, z): return ground(x, z)
	WLand.reset()
	WLand.init({"ox": 0.0, "oz": 0.0, "seed": 77, "ground": gr, "styleName": func(_x, _z): return "savanna", "overlay": func(_x, _z): return "",
		"caprock": func(_x, _z): return 1.0, "keep": func(_x, _z): return false, "sites": []})
	var A := WLand.list(0, 0, 12000, 12000)
	G.records = A.map(func(B): return [B.id, B.x, B.z, 0.0 if B.get("top") == null else B.top, B.R])
	G.land = []
	for B in A.slice(0, 20):
		G.land.append(WLand.apply(ground(B.x, B.z), B.x + B.R * 0.3, B.z, 0))
	WLand.reset()
	WLand.init({"ox": 0.0, "oz": 0.0, "seed": 77, "ground": gr, "styleName": func(_x, _z): return "steps", "overlay": func(_x, _z): return "high rift",
		"caprock": func(_x, _z): return 0.0, "keep": func(_x, _z): return false, "sites": []})
	var F := WLand.list(0, 0, 12000, 12000)
	G.fissures = F.map(func(B): return [B.id, B.x, B.z, B.w, B.d])
	G.cut = []
	for B in F.slice(0, 20):
		G.cut.append(WLand.apply(ground(B.x, B.z), B.x + 1, B.z, 0))
	# the badland's spires and fins, the karst's towers
	WLand.reset()
	WLand.init({"ox": 0.0, "oz": 0.0, "seed": 78, "ground": gr, "styleName": func(x, _z): return "badland" if x < 6000 else "karst", "overlay": func(_x, _z): return "",
		"caprock": func(_x, _z): return 1.0, "keep": func(_x, _z): return false, "sites": []})
	var S2 := WLand.list(0, 0, 12000, 8000)
	G.records2 = S2.map(func(B): return [B.id, B.x, B.z, 0.0 if B.get("top") == null else B.top, B.R])
	G.land2 = []
	for B in S2.slice(0, 24):
		G.land2.append(WLand.apply(ground(B.x, B.z), B.x + B.R * 0.3, B.z, 0))
	# a pinned mesa and the master gja, in a region whose box takes the gja in (its middle at local 6000, 6000)
	WLand.reset()
	WLand.pin(func(o): return [KStacks.make({"id": "pin:mesa", "kind": "mesa", "x": -4000.0, "z": 9000.0, "y0": o.ground.call(-4000.0, 9000.0) - 5, "seed": 9, "tiers": [{"h": 150.0, "r": 260.0}]})])
	WLand.init({"ox": 1569 * 2000.0 - 6000, "oz": 1643 * 2000.0 - 6000, "seed": 79, "ground": gr, "styleName": func(_x, _z): return "none", "overlay": func(_x, _z): return "",
		"caprock": func(_x, _z): return 0.0, "keep": func(_x, _z): return false, "sites": [{"x": -4000.0, "z": 9000.0, "pinned": 1}],
		"inside": func(x, z): return x > -20000 and x < 32000 and z > -20000 and z < 32000})
	G.pins = WLand.pins().map(func(B): return [B.id, B.x, B.z, B.R, B.bed if B.get("carve") else B.top])
	G.gja = []
	var a := 20 * PI / 180
	var t := -10000
	while t <= 10000:
		var s := -420
		while s <= 420:
			var x := 6000 + sin(a) * t + cos(a) * s
			var z := 6000 - cos(a) * t + sin(a) * s
			G.gja.append(WLand.apply(ground(x, z), x, z, 0))
			s += 60
		t += 2500
	G.pinned = []
	for p in [[-4000.0, 9000.0], [-3900.0, 9100.0], [-4250.0, 8800.0], [-3600.0, 9000.0], [-4000.0, 9330.0]]:
		var A2 = WLand.at(p[0], p[1])
		G.pinned.append([WLand.apply(ground(p[0], p[1]), p[0], p[1], 0), null if A2 == null else (A2.cut if A2.get("cut") != null else A2.top)])
	return G


func _init() -> void:
	var f := FileAccess.open("res://tests/relief/golden-relief.json", FileAccess.READ)
	if f == null:
		print("FAIL  no golden-relief.json beside the test")
		quit(1)
		return
	var GOLD: Dictionary = JSON.parse_string(f.get_as_text())
	var t0 := Time.get_ticks_msec()
	var G := snapshot()
	var bad := 0
	for key in GOLD.keys():
		worst = 0.0
		var d := diff(G.get(key), GOLD[key], key)
		if d != "":
			bad += 1
		print(("PASS  " if d == "" else "FAIL  ") + key + (": as the golden, the worst off by " + str(worst) if d == "" else ": " + d))
	# the negative: a value nudged by 1e-5 is caught
	var N: Dictionary = G.duplicate(true)
	var caught := false
	if N.get("peaks") is Array and N.peaks.size() > 3:
		N.peaks[3] = float(N.peaks[3]) + 1e-5
		caught = diff(N, GOLD, "") != "" and diff(G, GOLD, "") == ""
	print(("PASS  " if caught else "FAIL  ") + "negative: a value nudged by 1e-5 is caught")
	if not caught:
		bad += 1
	print(("all passed" if bad == 0 else str(bad) + " FAILED") + " (" + str(Time.get_ticks_msec() - t0) + " ms)")
	quit(0 if bad == 0 else 1)
