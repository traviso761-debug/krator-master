# Verge's life layer replayed in Godot: every group member's pose from the krator-sim export (KratorVergeSim.pose)
# against the page's own SIM.golden() trace at the same motion times. Exits 0 when every row agrees.
#   godot --headless --path godot --script res://tests/verge/verge_sim_test.gd
extends SceneTree


func _init() -> void:
	var M := KratorVergeSim.load_sim("res://data/verge/sim.json")
	var G = KData.read_json("res://data/verge/golden.json")
	if M.is_empty() or not (G is Dictionary):
		print("FAIL: no data/verge/sim.json or golden.json (settlements/verge: verify.py --export godot/data/verge)")
		quit(1)
		return
	var idx := {}
	for i in M["groups"].size():
		idx[M["groups"][i]["id"]] = i
	var n := 0
	var bad := 0
	var worst := 0.0
	var first := ""
	for r in G["rows"]:
		var gi: int = idx[r[1]]
		var tau := KratorVergeSim.run_time(M, gi, float(r[0]), int(r[2]))
		var o := KratorVergeSim.pose(M, gi, int(r[3]), tau)
		n += 1
		var vis := 1 if o["vis"] else 0
		if vis != int(r[4]):
			bad += 1
			if first == "":
				first = "visibility differs: %s" % str(r)
			continue
		if vis == 0:
			continue
		var d := Vector3(o["x"] - float(r[5]), o["y"] - float(r[6]), o["z"] - float(r[7])).length()
		var dy := absf(angle_difference(o["yaw"], float(r[8])))
		worst = maxf(worst, d)
		if d > 0.02 or dy > 0.002:
			bad += 1
			if first == "":
				first = "row %s: godot (%.3f, %.3f, %.3f, %.4f)" % [str(r), o["x"], o["y"], o["z"], o["yaw"]]
	print("verge sim: %d rows, %d differ, worst %.4f m%s" % [n, bad, worst, ("\n  first: " + first) if first != "" else ""])
	quit(0 if bad == 0 and n > 0 else 1)
