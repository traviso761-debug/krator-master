# Riding replayed in Godot (core/simulation/PLAN-RIDING.md section 7): every traveller's pose from the page's ride motion
# export (KRide.pose, the twin of SIM.pose with frame legs; the cars by KRide.car_pose) against the page's own trace at the
# same motion times (golden-ride.json, written by node core/simulation/ride/test-ride.js --write). Exits 0 when every row
# agrees, some rows are aboard a moving car, and the negative (each train's timetable 5 s late) moves the rows aboard.
#   godot --headless --path godot --script res://tests/ride/kride_test.gd
extends SceneTree


func _init() -> void:
	var M = KData.read_json("res://tests/ride/golden-ride.json")
	if not (M is Dictionary) or not M.has("ride"):
		print("FAIL: no tests/ride/golden-ride.json (python3 godot/tools/sync_core.py)")
		quit(1)
		return
	var A: Array = M["actors"]
	var n := 0
	var bad := 0
	var aboard := 0
	var worst := 0.0
	var first := ""
	for r in M["rows"]:
		var o := KRide.pose(M, A[int(r[1])], float(r[0]))
		n += 1
		if o["mode"] == "ride":
			aboard += 1
		var hid := 1 if o["hidden"] else 0
		var mov := 1 if o["moving"] else 0
		if hid != int(r[2]) or mov != int(r[3]):
			bad += 1
			if first == "":
				first = "hidden/moving differ: %s, godot %d %d" % [str(r), hid, mov]
			continue
		var d := Vector3(o["x"] - float(r[4]), o["y"] - float(r[5]), o["z"] - float(r[6])).length()
		var dh := absf(angle_difference(o["h"], float(r[7])))
		worst = maxf(worst, d)
		if d > 0.001 or dh > 0.0005:
			bad += 1
			if first == "":
				first = "row %s: godot (%.4f, %.4f, %.4f, %.5f)" % [str(r), o["x"], o["y"], o["z"], o["h"]]
	print("ride: %d rows (%d aboard a car), %d differ, worst %.6f m%s" % [n, aboard, bad, worst, ("\n  first: " + first) if first != "" else ""])
	# the cars themselves: a car's pose at the trace's times agrees with the frame legs' (checked through them above); the
	# negative: every train's timetable 5 s late must move the rows aboard
	var M2: Dictionary = M.duplicate(true)
	for S in M2["ride"]["sources"]:
		S["timeline"]["phase"] = float(S["timeline"].get("phase", 0.0)) - 5.0
	var neg := 0
	for r in M["rows"]:
		var o := KRide.pose(M2, M2["actors"][int(r[1])], float(r[0]))
		if o["mode"] == "ride" and Vector3(o["x"] - float(r[4]), o["y"] - float(r[5]), o["z"] - float(r[6])).length() > 0.001:
			neg += 1
	print("  negative (every timetable 5 s late): %d of %d rows aboard differ%s" % [neg, aboard, "" if neg > 0 else "  NEGATIVE CONTROL PASSED: the check cannot fail"])
	quit(0 if bad == 0 and n > 0 and aboard > 0 and neg > 0 else 1)
