# Strongbow's walk and interiors as Godot's navigation (settlements/strongbow: the walk up, src/32-sb-walk.js, and the rooms,
# src/33-sb-rooms.js): for each region of data/strongbow/walk.json (settlements/strongbow/export-walk.js), a NavigationMesh baked
# (Recast, KratorDhelvNav's source: walker radius 0.25, height 1.7, step 0.7 as core/host's) from the walk floors and the solid walls, and a path asked
# of the NavigationServer from the region's start to its goal:
#   foot  the town's ground before the lobby -> a room of T1's ring, on foot (the lobby's door, the great stair, the first
#         drum's switchbacks, the neck's flight to T1's plate, the neck's door, the deck, a ring room's door)
#   lip   W5's top stop -> a room on the Order's gatehouse's top storey (the post, the yard, the gatehouse's door, its hall's
#         switchback through seven storeys)
# Each must reach its goal and climb to its height; the negative: the same bake with the region's shut door put back (the
# lobby's door; the gatehouse's door from the yard) must not reach it.
#   godot --headless --path godot --script res://tests/strongbow/strongbow_walk_test.gd
extends SceneTree

var _step := 0
var _cases: Array = []
var _fails := 0


func _ok(cond: bool, what: String) -> void:
	print(("ok   " if cond else "FAIL ") + what)
	if not cond:
		_fails += 1


func _v(a: Array) -> Vector3:
	return Vector3(a[0], a[1], a[2])


# KratorDhelvNav's bake with core/host's step (0.7 m: the plaza's and the treads' risers), not Dhelv's 0.6
func _bake(src: NavigationMeshSourceGeometryData3D, box: AABB) -> NavigationMesh:
	var nm := NavigationMesh.new()
	nm.cell_size = KratorDhelvNav.CELL
	nm.cell_height = KratorDhelvNav.CELL_H
	nm.agent_radius = KratorDhelvNav.RADIUS
	nm.agent_height = KratorDhelvNav.HEIGHT
	nm.agent_max_climb = 0.7
	nm.agent_max_slope = KratorDhelvNav.SLOPE
	nm.filter_baking_aabb = box
	nm.region_min_size = 4.0
	NavigationServer3D.bake_from_source_geometry_data(nm, src)
	return nm


# a path with no cap on the polygons searched (the server's map_get_path stops at 4096: the way up the drums crosses more)
func _path(m: RID, a: Vector3, b: Vector3) -> PackedVector3Array:
	var q := NavigationPathQueryParameters3D.new()
	q.map = m
	q.start_position = a
	q.target_position = b
	q.path_search_max_polygons = 0
	var r := NavigationPathQueryResult3D.new()
	NavigationServer3D.query_path(q, r)
	return r.get_path()


func _initialize() -> void:
	var W = KData.read_json("res://data/strongbow/walk.json")
	if not (W is Dictionary):
		print("FAIL: no data/strongbow/walk.json (node settlements/strongbow/export-walk.js)")
		quit(1)
		return
	for g in W["regions"]:
		var b: Array = g["box"]
		var box := AABB(Vector3(b[0], b[1], b[2]), Vector3(b[3] - b[0], b[4] - b[1], b[5] - b[2]))
		var t0 := Time.get_ticks_msec()
		var src := KratorDhelvNav.source(W, box)
		var nm := _bake(src, box)
		print("%s baked %s: %d polygons, %d ms" % [g["id"], str(src.get_meta("counts")), nm.get_polygon_count(), Time.get_ticks_msec() - t0])
		_ok(nm.get_polygon_count() > 100, "%s: the floors bake into a navigation mesh" % g["id"])
		# the negative: the shut door's block put back
		var shut: Array = []
		for s in g["shut"]:
			if s["box"] != null:
				shut.append({"box": s["box"], "tag": "shut"})
		var W2 := {"floors": W["floors"], "blocks": W["blocks"] + shut}
		var nm2 := _bake(KratorDhelvNav.source(W2, box), box)
		_cases.append({"g": g, "maps": [KratorDhelvNav.map_with(nm), KratorDhelvNav.map_with(nm2)], "nshut": shut.size()})


func _process(_delta: float) -> bool:
	_step += 1
	var ready := true
	for c in _cases:
		for m in c["maps"]:
			if NavigationServer3D.map_get_iteration_id(m) < 2:
				ready = false
	if _step < 900 and not ready:
		return false   # the server syncs its maps on the physics frames
	for c in _cases:
		var g: Dictionary = c["g"]
		var id: String = g["id"]
		var from := _v(g["from"])
		var to := _v(g["to"])
		var m: RID = c["maps"][0]
		var a := NavigationServer3D.map_get_closest_point(m, from)
		var b := NavigationServer3D.map_get_closest_point(m, to)
		_ok(a.distance_to(from) < 2.0, "%s: the start is on the mesh (%.2f m off)" % [id, a.distance_to(from)])
		_ok(b.distance_to(to) < 2.0, "%s: the goal is on the mesh (%.2f m off)" % [id, b.distance_to(to)])
		var path := _path(m, from, to)
		var L := 0.0
		var top := -INF
		for i in path.size():
			top = maxf(top, path[i].y)
			if i > 0:
				L += path[i - 1].distance_to(path[i])
		var end := path[path.size() - 1] if path.size() > 0 else Vector3(INF, INF, INF)
		_ok(path.size() > 1 and end.distance_to(to) < 2.0, "%s: a path reaches the goal (%d points, %.0f m, climbs to %.1f m, ends %.2f m off)" % [id, path.size(), L, top, end.distance_to(to)])
		for v in g.get("via", []):
			var q := _v(v["at"])
			var d := INF
			for i in range(1, path.size()):
				d = minf(d, q.distance_to(Geometry3D.get_closest_point_to_segment(q, path[i - 1], path[i])))
			print("     %s passes %s at %.1f m" % [id, v["name"], d])
		print("     %s ends at (%.1f, %.1f, %.1f)" % [id, end.x, end.y, end.z])
		# leg by leg (start, the waypoints, the goal): which join the mesh does not make
		var pts: Array = [from]
		for v in g.get("via", []):
			pts.append(_v(v["at"]))
		pts.append(to)
		for i in range(1, pts.size()):
			var lp := _path(m, pts[i - 1], pts[i])
			var le := lp[lp.size() - 1] if lp.size() > 0 else Vector3(INF, INF, INF)
			var nm_a: String = "start" if i == 1 else g["via"][i - 2]["name"]
			var nm_b: String = "goal" if i == pts.size() - 1 else g["via"][i - 1]["name"]
			print("     leg %s -> %s: %s (ends %.1f m off at %.1f, %.1f, %.1f; on mesh %.1f m off)" % [nm_a, nm_b, "ok" if le.distance_to(pts[i]) < 1.5 else "BROKEN", le.distance_to(pts[i]), le.x, le.y, le.z, NavigationServer3D.map_get_closest_point(m, pts[i]).distance_to(pts[i])])
		_ok(absf(end.y - to.y) < 1.0, "%s: it ends on the goal's floor (%.1f m, the goal %.1f m)" % [id, end.y, to.y])
		_ok(L >= from.distance_to(to), "%s: no shorter than the straight line (%.0f m against %.0f m)" % [id, L, from.distance_to(to)])
		var path2 := _path(c["maps"][1], from, to)
		var end2 := path2[path2.size() - 1] if path2.size() > 0 else Vector3(INF, INF, INF)
		_ok(c["nshut"] > 0 and end2.distance_to(to) > 5.0, "%s: negative: with %s shut the goal is not reached (ends %.0f m off)" % [id, ", ".join(g["shut"].map(func(s): return s["id"])), end2.distance_to(to)])
	print("strongbow walk: %s" % ("all passed" if _fails == 0 else "%d failed" % _fails))
	for c in _cases:
		for mm in c["maps"]:
			for r in NavigationServer3D.map_get_regions(mm):
				NavigationServer3D.free_rid(r)
			NavigationServer3D.free_rid(mm)
	quit(0 if _fails == 0 else 1)
	return true
