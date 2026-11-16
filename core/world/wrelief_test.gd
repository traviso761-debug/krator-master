# The Godot side of core/world/golden-relief.json (PLAN-RELIEF.md P9, P15): wrelief.gd run on the golden's own inputs (as
# test-golden-relief.js makes them) and compared to 1e-6. From the Godot project, with wrelief.gd, this file and
# golden-relief.json copied into res://tests/relief/ (godot/tests/relief/, as core/rand's are in godot/tests/rand/):
#   godot --headless --path godot --script res://tests/relief/wrelief_test.gd      exits 0 when every value matches
extends SceneTree

const WRelief := preload("wrelief.gd")


func _init() -> void:
	var f := FileAccess.open("res://tests/relief/golden-relief.json", FileAccess.READ)
	if f == null:
		print("FAIL  no golden-relief.json beside the test")
		quit(1)
		return
	var G: Dictionary = JSON.parse_string(f.get_as_text())
	WRelief.init(2000000.0, 3000000.0, 7)
	var S := {"terr": 0.75, "step": 55.0, "gully": 1.0, "peak": 1.0}
	var got := {"bench": [], "erode": [], "peaks": [], "caprock": []}
	for k in 300:
		var x := float((k * 7919) % 40000)
		var z := float((k * 104729) % 40000)
		got["bench"].append(WRelief.bench(500.0 + 0.05 * x, x, z, S, 600.0, 0.0))
		got["erode"].append(WRelief.erode(500.0, x, z, -0.15, 0.05, S, 800.0, 0.0))
		got["peaks"].append(WRelief.peaks(0.0, x, z, S, 1200.0, 0.8, 0.0))
		got["caprock"].append(WRelief.caprock(x, z, S, 600.0))
	var bad := 0
	for key in ["bench", "erode", "peaks", "caprock"]:
		var a: Array = got[key]
		var b: Array = G[key]
		var worst := 0.0
		var at := -1
		for i in a.size():
			var d := absf(float(a[i]) - float(b[i]))
			if d > worst:
				worst = d
				at = i
		var ok := worst <= 1e-6 and a.size() == b.size()
		if not ok:
			bad += 1
		print(("PASS  " if ok else "FAIL  ") + key + ": " + str(a.size()) + " values, the worst off by " + str(worst) + (" (at " + str(at) + ")" if not ok else ""))
	# the negative: a value nudged by 1e-5 is caught
	var nudged: Array = got["peaks"].duplicate()
	nudged[3] = float(nudged[3]) + 1e-5
	var caught := absf(float(nudged[3]) - float(G["peaks"][3])) > 1e-6
	print(("PASS  " if caught else "FAIL  ") + "negative: a value nudged by 1e-5 is caught")
	if not caught:
		bad += 1
	print("all passed" if bad == 0 else str(bad) + " FAILED")
	quit(0 if bad == 0 else 1)
