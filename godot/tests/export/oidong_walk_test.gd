# M8 "walk the road" (GODOT-PLAN.md), headless: a walker (krator/world_walk.gd: a CharacterBody3D on the stream's
# collision) driven along stretches of the Sultanate's road in the oidong-highrift case: out of Longsong, the valley's
# middle, and the last climb to Strongbow and on over the page's plateau to its lip. For each stretch, each check with
# a negative:
#   it gets there              the end of the stretch within twice its time at the drive's speed
#   its feet stay on the ground  the ground a ray down finds (the collision: the region's ground, or the page's plateau
#                                over it): never under it (FALL_TOL; a walker slipped in under the page's plateau reads
#                                as under), never floating over it (FLOAT_TOL)
#   it stays on the road         within ROAD_TOL of the road's line
#   no jump at a rebase          no step moves it more than the drive allows, across every rebase of the floating origin
# and at the end it stands on Strongbow's plateau at the lip's level. Negative: the first stretch again with no collision
# falls through the ground.
#   godot --headless --path godot --script res://tests/export/oidong_walk_test.gd     exits 0 when every check passes
# (the case: tools/harness.py lock -- python3 openworld/oidong-highrift/tools/godot_case.py, as oidong_world_test.gd)
extends SceneTree

const CASE := "res://data/world-oidong-highrift/index.json"
const SPEED := 30.0       # m/s: a rider, so a stretch is a minute or two of physics
const STRETCH := 5000.0   # metres of road a stretch: past the floating origin's rebase distance (4 km), so every stretch crosses one
const FALL_TOL := 0.5     # metres the feet may sit under the region's ground (the capsule's rounded foot on a slope)
const FLOAT_TOL := 1.5    # metres over it, on the road
const PLATEAU_TOL := 7.0  # metres over it on Strongbow's plateau (the page's plateau over the cut's bowl, 6 m at most)
const ROAD_TOL := 8.0     # metres off the road's line (the carriageway is 6 m wide; corners are cut at 30 m/s)
var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	if not FileAccess.file_exists(CASE):
		print("FAIL no case: run python3 tools/harness.py lock -- python3 openworld/oidong-highrift/tools/godot_case.py")
		quit(1)
		return
	_run()


func _road(W: KratorWorldWalk) -> Array:
	var R := W.stream.road(str(W.stream.index["route"]["link"]))
	var pts := []
	for p in R.get("pts", []):
		pts.append([float(p[0]), float(p[1])])
	if R.get("from") != W.stream.index["route"]["from"]:
		pts.reverse()
	return pts


# the road's points from metre a to metre b along it
func _slice(pts: Array, a: float, b: float) -> Array:
	var out := []
	var s := 0.0
	for i in pts.size():
		if i > 0:
			s += Vector2(pts[i][0], pts[i][1]).distance_to(Vector2(pts[i - 1][0], pts[i - 1][1]))
		if s >= a and s <= b:
			out.append(pts[i])
	return out


func _length(pts: Array) -> float:
	var s := 0.0
	for i in range(1, pts.size()):
		s += Vector2(pts[i][0], pts[i][1]).distance_to(Vector2(pts[i - 1][0], pts[i - 1][1]))
	return s


func _off_road(pts: Array, p: Vector2) -> float:
	var best := INF
	for i in range(1, pts.size()):
		var a := Vector2(pts[i - 1][0], pts[i - 1][1])
		var b := Vector2(pts[i][0], pts[i][1])
		best = minf(best, p.distance_to(Geometry2D.get_closest_point_to_segment(p, a, b)))
	return best


# drive the walker along pts from their first point; returns what the walk measured
func _walk(W: KratorWorldWalk, pts: Array, road: Array, plateau_from := -1) -> Dictionary:
	W.start_at(pts[0][0], pts[0][1])
	for k in 30:   # settle onto the ground
		await physics_frame
	W.drive(pts.slice(1), SPEED)
	var m := {"under": 0.0, "over": 0.0, "over_plateau": 0.0, "off": 0.0, "jump": 0.0, "steps": 0, "reached": false, "rebases": W.stream.rebases}
	var budget := int(_length(pts) / SPEED * 2.0 * 60.0) + 600
	var last := W.region_xz()
	var dt := 1.0 / Engine.physics_ticks_per_second
	for k in budget:
		await physics_frame
		var p := W.region_xz()
		var q := PhysicsRayQueryParameters3D.create(W.walker.position + Vector3(0, 30, 0), W.walker.position - Vector3(0, 300, 0))
		q.exclude = [W.walker.get_rid()]
		var hit := W.get_world_3d().direct_space_state.intersect_ray(q)
		if not hit.is_empty():
			var d: float = (W.walker.position.y - KratorWorldWalk.HEIGHT * 0.5) - float(hit["position"].y)
			m["under"] = maxf(m["under"], -d)
			if plateau_from >= 0 and W.route_i + 1 >= plateau_from:
				m["over_plateau"] = maxf(m["over_plateau"], d)
			else:
				m["over"] = maxf(m["over"], d)
		else:   # nothing under it to hit (no collision: the negative): the data's ground
			var g := W.stream.height_at(p.x, p.y)
			if is_finite(g):
				m["under"] = maxf(m["under"], g - W.feet_y())
		if road.size() > 1 and (plateau_from < 0 or W.route_i + 1 < plateau_from):
			m["off"] = maxf(m["off"], _off_road(road, p))
		m["jump"] = maxf(m["jump"], p.distance_to(last) - SPEED * dt)
		last = p
		m["steps"] += 1
		if not W.driving:
			m["reached"] = true
			break
	m["rebases"] = W.stream.rebases - int(m["rebases"])
	m["end"] = W.region_xz()
	m["feet"] = W.feet_y()
	return m


func _run() -> void:
	var W := KratorWorldWalk.make(CASE)
	root.add_child(W)
	var road := _road(W)
	var L := _length(road)
	var stretches := [["out of Longsong", 1000.0], ["the valley's middle", L * 0.5]]
	for s in stretches:
		var pts := _slice(road, s[1], s[1] + STRETCH)
		var m: Dictionary = await _walk(W, pts, pts)
		ok(m["reached"] and m["under"] <= FALL_TOL and m["over"] <= FLOAT_TOL and m["off"] <= ROAD_TOL and m["jump"] <= 0.5,
			"%s (km %.0f, %.0f m at %d m/s): there in %d steps; feet at most %.2f m under and %.2f m over the ground, %.1f m off the road, %d rebases, the largest jump %.2f m"
			% [s[0], s[1] / 1000.0, _length(pts), int(SPEED), m["steps"], m["under"], m["over"], m["off"], m["rebases"], m["jump"]])
	# the last climb, then on over Strongbow's plateau to 60 m behind its lip (the page's anchor, godot_case.py ARCOLOGY)
	var last := _slice(road, L - STRETCH, L + 1.0)
	var A: Dictionary = W.stream.place("sfgtxw10kr").get("arcology", {})
	var at: Array = A.get("at", [0.0, 0.0, 0.0])
	var end := [float(at[0]) + 60.0, float(at[2])]
	var climb := last.duplicate()
	var from := climb.size()
	var e0 := Vector2(last[last.size() - 1][0], last[last.size() - 1][1])
	var n := int(e0.distance_to(Vector2(end[0], end[1])) / 20.0)
	for k in range(1, n + 1):
		var t := float(k) / n
		climb.append([lerpf(e0.x, end[0], t), lerpf(e0.y, end[1], t)])
	var m2: Dictionary = await _walk(W, climb, last, from)
	var lip := float(at[1])
	ok(m2["reached"] and m2["under"] <= FALL_TOL and m2["over"] <= FLOAT_TOL and m2["over_plateau"] <= PLATEAU_TOL and m2["off"] <= ROAD_TOL and m2["jump"] <= 0.5
		and absf(float(m2["feet"]) - lip) <= 3.0,
		"the last climb to Strongbow and over its plateau: there in %d steps; feet at most %.2f m under the ground, %.2f m over it on the road and %.2f m on the plateau, %.1f m off the road, %d rebases, the largest jump %.2f m; it stands %.0f m behind the lip with its feet at %.1f m (the lip %.1f m)"
		% [m2["steps"], m2["under"], m2["over"], m2["over_plateau"], m2["off"], m2["rebases"], m2["jump"], float(m2["end"].x) - float(at[0]), m2["feet"], lip])
	# the stream's loading ran off the main thread: cases built on the worker thread and attached by poll()
	var ev: Array = W.stream.events
	var bmax := 0.0
	var amax := 0.0
	for e in ev:
		bmax = maxf(bmax, float(e["build_ms"]))
		amax = maxf(amax, float(e["attach_ms"]))
	ok(ev.size() > 0, "loading off the main thread: %d cases built on the worker thread during the walk (the longest build %.0f ms, off the main thread), each attached in at most %.1f ms on it"
		% [ev.size(), bmax, amax])
	root.remove_child(W)
	W.free()
	var Sy := KratorWorldWalk.make(CASE, true, false)
	root.add_child(Sy)
	var my: Dictionary = await _walk(Sy, _slice(road, 1000.0, 1600.0), [])
	ok(Sy.stream.events.is_empty(), "negative: a synchronous stream builds nothing on the worker thread (%d events)" % Sy.stream.events.size())
	root.remove_child(Sy)
	Sy.free()
	# negative: the first stretch without collision
	var N := KratorWorldWalk.make(CASE, false)
	root.add_child(N)
	var pts0 := _slice(road, 1000.0, 1600.0)
	var mn: Dictionary = await _walk(N, pts0, pts0)
	ok(mn["under"] > 20.0, "negative: the same road with no collision: the walker falls %.0f m through the ground" % mn["under"])
	print("\n%s: %d failed" % ["FAILED" if fails else "OK", fails])
	quit(1 if fails else 0)
