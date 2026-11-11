# Riding replayed in Godot (core/simulation/PLAN-RIDING.md sections 7 and 8c): every traveller's pose from the page's ride
# motion export (KRide.pose, the twin of SIM.pose with frame legs; the cars by KRide.car_pose) against the page's own trace
# at the same motion times: golden-ride.json (the Line's trains: node core/simulation/ride/test-ride.js --write) and
# golden-ride-ferry.json (a ferry turned into ride sources: test-ride-r6.js --write). Exits 0 when every row agrees, some
# rows are aboard a moving car, and the negative (each timetable 5 s late) moves the rows aboard.
#   godot --headless --path godot --script res://tests/ride/kride_test.gd
extends SceneTree


func _init() -> void:
	# the Line's trains (test-ride.js) and a ferry as ride sources (test-ride-r6.js: its far stop turns the track back)
	var ok := true
	for f in ["golden-ride.json", "golden-ride-ferry.json"]:
		ok = replay("res://tests/ride/" + f) and ok
	quit(0 if ok else 1)


func replay(file: String) -> bool:
	var M = KData.read_json(file)
	if not (M is Dictionary) or not M.has("ride"):
		print("FAIL: no %s (python3 godot/tools/sync_core.py)" % file)
		return false
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
	print("%s: %d rows (%d aboard), %d differ, worst %.6f m%s" % [file.get_file(), n, aboard, bad, worst, ("\n  first: " + first) if first != "" else ""])
	# the negative: every timetable 5 s late must move the rows aboard
	var M2: Dictionary = M.duplicate(true)
	for S in M2["ride"]["sources"]:
		S["timeline"]["phase"] = float(S["timeline"].get("phase", 0.0)) - 5.0
	var neg := 0
	for r in M["rows"]:
		var o := KRide.pose(M2, M2["actors"][int(r[1])], float(r[0]))
		if o["mode"] == "ride" and Vector3(o["x"] - float(r[4]), o["y"] - float(r[5]), o["z"] - float(r[6])).length() > 0.001:
			neg += 1
	print("  negative (every timetable 5 s late): %d of %d rows aboard differ%s" % [neg, aboard, "" if neg > 0 else "  NEGATIVE CONTROL PASSED: the check cannot fail"])
	return bad == 0 and n > 0 and aboard > 0 and neg > 0
