# M9 step 1 (GODOT-PLAN.md, "the valley alive"): the valley's road traffic in Godot (krator/valley_traffic.gd), replayed
# from its week (godot/data/world-oidong-highrift/sim.json's log) on the region's roads (index.json). Each check with a
# negative:
#   every departure has its arrival     each `trade out` paired with its route and carrier's next `trade in` (or still
#                                       under way when the week ends)
#   every route lies on the roads       each of the valley's routes laid on the index's road network
#   carriers keep to their trips        when it leaves a carrier stands at its origin's end of the path, when it lands at its
#                                       destination's, and between on the path's line
#   no carrier outruns a cart           no trip covers its path faster than MAX_SPEED
#   they stand on the ground            drawn round a walker on the stream's ground
#   godot --headless --path godot --script res://tests/export/oidong_traffic_test.gd     exits 0 when every check passes
extends SceneTree

const CASE := "res://data/world-oidong-highrift/"
const MAX_SPEED := 10.0   # m/s: a mule train, a cart or a caravan, its stops included, is far slower; a teleport is not
var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	_run()


func _run() -> void:
	var index: Dictionary = KData.read_json(CASE + "index.json")
	var sim: Dictionary = KData.read_json(CASE + "sim.json")
	var T := KratorValleyTraffic.make(index, sim)
	var outs := 0
	for e in sim["log"]:
		if e["kind"] == "trade out":
			outs += 1
	var done := 0
	for t in T.trips:
		if t["m1"] >= 0:
			done += 1
	ok(T.trips.size() == outs and done > 0, "every departure has its arrival: %d trips from %d departures, %d landed within the week, %d still on the road at its end"
		% [T.trips.size(), outs, done, T.trips.size() - done])
	var nolog := sim.duplicate(true)
	nolog["log"] = (sim["log"] as Array).filter(func(e): return e["kind"] != "trade in")
	var T0 := KratorValleyTraffic.make(index, nolog)
	ok(T0.trips.all(func(t): return t["m1"] < 0), "negative: with the arrivals left out of the log, no trip lands")
	var roads: Array = sim["valley"]["roads"]
	var offmap := []
	for id in T.paths:
		if T.paths[id]["off_from"] or T.paths[id]["off_to"]:
			offmap.append(id)
	ok(T.unmapped.is_empty() and T.paths.size() == roads.size(), "every route lies on the roads: %d of %d laid on the index's network (%d nodes, %d roads); off the map at one end: %s"
		% [T.paths.size(), roads.size(), T.nodes.size(), T.edges.size(), ", ".join(PackedStringArray(offmap))])
	var bad := sim.duplicate(true)
	bad["valley"]["roads"] = roads + [{"id": "nowhere", "from": "no-such-town", "to": "sq80bzd7ep", "minutes": 60}]
	var T1 := KratorValleyTraffic.make(index, bad)
	ok(T1.unmapped.has("nowhere"), "negative: a route from a town the valley does not hold is not laid (%s)" % ", ".join(PackedStringArray(T1.unmapped)))
	# carriers keep to their trips
	var at_ends := 0
	var mid_off := 0.0
	var end_off := 0.0
	var checked := 0
	var fast := 0.0
	var neg_end := 0.0
	for t in T.trips:
		if t["m1"] < 0 or not T.paths.has(t["route"]):
			continue
		var P: Dictionary = T.paths[t["route"]]
		var forward: bool = t["from"] == P["rfrom"]
		var pts: PackedVector2Array = P["pts"] if forward else KratorValleyTraffic._reversed(P["pts"])
		var dur: float = (float(t["m1"]) - float(t["m0"])) * 60.0
		fast = maxf(fast, float(P["len"]) / maxf(dur, 1.0))
		var a := T.pose(t, float(t["m0"]))
		var b := T.pose(t, float(t["m1"]))
		var c := T.pose(t, (float(t["m0"]) + float(t["m1"])) * 0.5)
		if a.get("on_map", false):
			end_off = maxf(end_off, Vector2(a["x"], a["z"]).distance_to(pts[0]))
			neg_end = maxf(neg_end, Vector2(a["x"], a["z"]).distance_to(pts[pts.size() - 1]))
		if b.get("on_map", false):
			end_off = maxf(end_off, Vector2(b["x"], b["z"]).distance_to(pts[pts.size() - 1]))
		if c.get("on_map", false):
			var p := Vector2(c["x"], c["z"])
			var best := INF
			for i in range(1, pts.size()):
				best = minf(best, p.distance_to(Geometry2D.get_closest_point_to_segment(p, pts[i - 1], pts[i])))
			mid_off = maxf(mid_off, best)
		checked += 1
	ok(checked > 0 and end_off < 1.0 and mid_off < 0.5, "carriers keep to their trips: %d landed trips; each leaves from its origin's end of the path and lands at its destination's (to %.2f m), and is on the path between (%.2f m)"
		% [checked, end_off, mid_off])
	ok(neg_end > 1000.0, "negative: a carrier's place when it leaves, read against the far end of its path, is %.0f m off" % neg_end)
	ok(fast <= MAX_SPEED, "no carrier outruns a cart: the fastest trip covers its path at %.2f m/s (limit %.0f)" % [fast, MAX_SPEED])
	# they stand on the ground: the carriers round Longsong at the week's busiest minute, drawn on the stream
	var busiest := 0.0
	var most := 0
	var ls: Vector2 = T.settlements["sq80bzd7ep"]
	for k in range(0, 10080, 30):
		var n := T.carriers_at(float(k)).filter(func(c): return c["on_map"] and Vector2(c["x"], c["z"]).distance_to(ls) < 15000.0).size()
		if n > most:
			most = n
			busiest = float(k)
	var S := KratorWorldStream.open(CASE + "index.json")
	root.add_child(S)
	S.rebase(ls.x, ls.y)
	S.update(ls, 20000.0, 28000.0)
	var mmi := MultiMeshInstance3D.new()
	S.add_child(mmi)
	var drawn := T.draw(S, mmi, busiest, ls, 15000.0)
	var dev := 0.0
	for v in mmi.get_meta("krator_carriers", []):
		var reg: Array = S.region(v)
		dev = maxf(dev, absf(float(reg[1]) - 0.9 - S.height_at(reg[0], reg[2])))
	ok(drawn > 0 and dev < 0.05, "they stand on the ground: at minute %d (%s), %d carriers within 15 km of Longsong drawn on the stream's ground (to %.3f m)"
		% [int(busiest), _clock(busiest), drawn, dev])
	var none := T.draw(S, mmi, busiest, ls + Vector2(400000, 0), 15000.0)
	ok(none == 0, "negative: drawn round a point 400 km off, %d carriers" % none)
	print("\n%s: %d failed" % ["FAILED" if fails else "OK", fails])
	quit(1 if fails else 0)


func _clock(m: float) -> String:
	return "day %d, %02d:%02d" % [int(m / 1440.0) + 1, int(fmod(m, 1440.0) / 60.0), int(fmod(m, 60.0))]
