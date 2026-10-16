# Dhelv's walk export as Godot's navigation (kits/zeijani/PLAN.md 9, P7): a NavigationMesh baked (Recast) from the walk
# floors and blocks between the outpost's gate and the temple, and a path asked of the NavigationServer from the gate to
# the temple's door. It must reach the door, pass the braid (the two strands from the stone door to the hall), and be about
# as long as the way on the page's own walk graph (DHN, nav.json). The negative: the same bake without the floors at the
# stone door (the only way in for the public) must not reach the temple.
#   godot --headless --path godot --script res://tests/dhelv/dhelv_nav_test.gd
extends SceneTree

var _step := 0
var _maps: Array = []
var _ctx := {}
var _fails := 0


func _ok(cond: bool, what: String) -> void:
	print(("ok   " if cond else "FAIL ") + what)
	if not cond:
		_fails += 1


func _initialize() -> void:
	var W = KData.read_json("res://data/dhelv/walk.json")
	var N = KData.read_json("res://data/dhelv/nav.json")
	if not (W is Dictionary) or not (N is Dictionary):
		print("FAIL: no data/dhelv/walk.json or nav.json (settlements/dhelv: verify.py --export ../../godot/data/dhelv)")
		quit(1)
		return
	var gate := KratorDhelvNav.node(N, "o.gate")
	var door_id := ""
	for d in N["doors"]:
		if d["key"] == "zj_temple":
			door_id = d["node"]
	var temple := KratorDhelvNav.node(N, door_id)
	var sdoor := KratorDhelvNav.node(N, "t.door")
	var lo := Vector3(minf(gate.x, temple.x) - 60, -400, minf(gate.z, temple.z) - 140)
	var hi := Vector3(maxf(gate.x, temple.x) + 60, 400, maxf(gate.z, temple.z) + 140)
	var box := AABB(lo, hi - lo)
	var t0 := Time.get_ticks_msec()
	var src := KratorDhelvNav.source(W, box)
	var nm := KratorDhelvNav.bake(src, box)
	var ms := Time.get_ticks_msec() - t0
	print("baked %s: %d polygons, %d vertices, %d ms" % [str(src.get_meta("counts")), nm.get_polygon_count(), nm.get_vertices().size(), ms])
	_ok(nm.get_polygon_count() > 100, "the walk floors bake into a navigation mesh")
	# the negative: the stone door's floors left out
	var skip := func(F) -> bool:
		var p: Array = F["a"] if F["kind"] == "strip" else F["pts"][0] if F["kind"] == "poly" else [F["rect"][0], F["rect"][2], F["y"]]
		return Vector2(p[0] - sdoor.x, p[1] - sdoor.z).length() < 9.0 and absf(float(p[2]) - sdoor.y) < 4.0
	var nm2 := KratorDhelvNav.bake(KratorDhelvNav.source(W, box, skip), box)
	_maps = [KratorDhelvNav.map_with(nm), KratorDhelvNav.map_with(nm2)]
	_ctx = {"N": N, "gate": gate, "temple": temple, "door_id": door_id}


func _process(_delta: float) -> bool:
	_step += 1
	if _step < 900 and (NavigationServer3D.map_get_iteration_id(_maps[0]) < 2 or NavigationServer3D.map_get_iteration_id(_maps[1]) < 2):
		return false   # the server syncs its maps on the physics frames (the first iteration holds no regions yet)
	var N: Dictionary = _ctx["N"]
	var gate: Vector3 = _ctx["gate"]
	var temple: Vector3 = _ctx["temple"]
	var m: RID = _maps[0]
	var a := NavigationServer3D.map_get_closest_point(m, gate)
	var b := NavigationServer3D.map_get_closest_point(m, temple)
	_ok(a.distance_to(gate) < 2.0, "the gate is on the mesh (%.2f m off)" % a.distance_to(gate))
	_ok(b.distance_to(temple) < 2.0, "the temple's door is on the mesh (%.2f m off)" % b.distance_to(temple))
	var path := NavigationServer3D.map_get_path(m, gate, temple, true)
	var L := 0.0
	for i in range(1, path.size()):
		L += path[i - 1].distance_to(path[i])
	var end := path[path.size() - 1] if path.size() > 0 else Vector3(INF, INF, INF)
	_ok(path.size() > 1 and end.distance_to(temple) < 2.0, "a path from the gate reaches the temple (%d points, %.0f m, ends %.2f m off)" % [path.size(), L, end.distance_to(temple)])
	# the braid's two strands: a1-a2 (7 m wide) and b1-b2 (5 m); the path keeps to one of them, through the stone door
	var near := {}
	for id in ["t.door", "a1", "a2", "b1", "b2"]:
		var q := KratorDhelvNav.node(N, id)
		var d := INF
		for i in range(1, path.size()):
			d = minf(d, q.distance_to(Geometry3D.get_closest_point_to_segment(q, path[i - 1], path[i])))
		near[id] = d
	_ok(near["t.door"] < 3.0, "it goes through the stone door (%.1f m)" % near["t.door"])
	var strand := maxf(near["a1"], near["a2"]) < 6.0 or maxf(near["b1"], near["b2"]) < 6.0
	_ok(strand, "it keeps to a strand of the braid (a: %.1f, %.1f m; b: %.1f, %.1f m)" % [near["a1"], near["a2"], near["b1"], near["b2"]])
	var G := KratorDhelvNav.graph_route(N, "o.gate", _ctx["door_id"], func(e): return e["zone"] != "secret")
	var GL: float = G.get("len", INF)
	_ok(G.size() > 0 and L > 0.8 * GL and L < 1.15 * GL, "as long as the walk graph's way (%.0f m on DHN, %d nodes): ratio %.2f" % [GL, G.get("ids", []).size(), L / GL if GL > 0 else 0.0])
	var path2 := NavigationServer3D.map_get_path(_maps[1], gate, temple, true)
	var end2 := path2[path2.size() - 1] if path2.size() > 0 else Vector3(INF, INF, INF)
	_ok(end2.distance_to(temple) > 20.0, "negative: without the stone door's floors the temple is not reached (ends %.0f m off)" % end2.distance_to(temple))
	print("dhelv nav: %s" % ("all passed" if _fails == 0 else "%d failed" % _fails))
	for mm in _maps:
		for r in NavigationServer3D.map_get_regions(mm):
			NavigationServer3D.free_rid(r)
		NavigationServer3D.free_rid(mm)
	quit(0 if _fails == 0 else 1)
	return true
