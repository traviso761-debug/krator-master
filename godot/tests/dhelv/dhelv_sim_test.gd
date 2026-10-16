# Dhelv's ramblers replayed in Godot: every actor's pose from the krator-sim export's motion block (KSim.pose, the twin of
# core/simulation's SIM.pose) against the page's own trace at the same motion times (golden.json, one snapshot with the
# motion). Exits 0 when every row agrees.
#   godot --headless --path godot --script res://tests/dhelv/dhelv_sim_test.gd
extends SceneTree


func _init() -> void:
	var S = KData.read_json("res://data/dhelv/sim.json")
	var G = KData.read_json("res://data/dhelv/golden.json")
	if not (S is Dictionary) or not S.has("motion") or not (G is Dictionary):
		print("FAIL: no data/dhelv/sim.json (with motion) or golden.json (settlements/dhelv: verify.py --export ../../godot/data/dhelv)")
		quit(1)
		return
	var M: Dictionary = S["motion"]
	var A: Array = M["actors"]
	var n := 0
	var bad := 0
	var moving := 0
	var worst := 0.0
	var first := ""
	for r in G["rows"]:
		var o := KSim.pose(M, A[int(r[1])], float(r[0]))
		n += 1
		var hid := 1 if o["hidden"] else 0
		var mov := 1 if o["moving"] else 0
		if hid != int(r[2]) or mov != int(r[3]):
			bad += 1
			if first == "":
				first = "hidden/moving differ: %s, godot %d %d" % [str(r), hid, mov]
			continue
		moving += mov
		var d := Vector3(o["x"] - float(r[4]), o["y"] - float(r[5]), o["z"] - float(r[6])).length()
		var dh := absf(angle_difference(o["h"], float(r[7])))
		worst = maxf(worst, d)
		if d > 0.002 or dh > 0.0005:
			bad += 1
			if first == "":
				first = "row %s: godot (%.4f, %.4f, %.4f, %.5f)" % [str(r), o["x"], o["y"], o["z"], o["h"]]
	print("dhelv sim: %d rows (%d moving), %d differ, worst %.5f m%s" % [n, moving, bad, worst, ("\n  first: " + first) if first != "" else ""])
	# the negative: a leg's speed changed must move the moving rows
	var neg := 0
	var M2: Dictionary = M.duplicate(true)
	for a in M2["actors"]:
		if a.get("task") is Dictionary:
			for L in a["task"]["legs"]:
				L["speed"] = float(L["speed"]) * 1.1
	for r in G["rows"]:
		if int(r[3]) == 1:
			var o := KSim.pose(M2, M2["actors"][int(r[1])], float(r[0]))
			if Vector3(o["x"] - float(r[4]), o["y"] - float(r[5]), o["z"] - float(r[6])).length() > 0.002:
				neg += 1
	print("  negative (every leg 10%% faster): %d of %d moving rows differ%s" % [neg, moving, "" if neg > 0 else "  NEGATIVE CONTROL PASSED: the check cannot fail"])
	quit(0 if bad == 0 and n > 0 and moving > 0 and neg > 0 else 1)
