# Dhelv's walk export as a navigation mesh (kits/zeijani/PLAN.md 9: "the walk export is the navmesh source"), and its walk
# graph (nav.json, DHN) for comparison. Used by the dhelv case (spike.gd) and tests/dhelv/dhelv_nav_test.gd.
#
#   KratorDhelvNav.source(walk, box, skip)   NavigationMeshSourceGeometryData3D from the floors (both windings: the walkable
#                                           side is up whatever the order) and the blocks' four sides, inside box (AABB);
#                                           skip(floor) -> true leaves a floor out (the tests' negative control)
#   KratorDhelvNav.bake(src, box)            a NavigationMesh baked from it (Recast): walker radius 0.25, height 1.7, step 0.6
#   KratorDhelvNav.map_with(nm)              a navigation map holding it, active (query it after a physics frame)
#   KratorDhelvNav.graph_route(nav, a, b, ok) the shortest way on DHN's graph (Dijkstra on 3D length): {len, ids}; ok(edge)
#   KratorDhelvNav.node(nav, id)             a node's Vector3
class_name KratorDhelvNav
extends RefCounted

const CELL := 0.25
const CELL_H := 0.1
const RADIUS := 0.25
const HEIGHT := 1.7
const CLIMB := 0.6
const SLOPE := 50.0


static func _quad(f: PackedVector3Array, a: Vector3, b: Vector3, c: Vector3, d: Vector3, both: bool) -> void:
	f.append_array([a, b, c, a, c, d])
	if both:
		f.append_array([a, c, b, a, d, c])


static func _in(box: AABB, p: Vector3) -> bool:
	return p.x >= box.position.x and p.x <= box.end.x and p.z >= box.position.z and p.z <= box.end.z


static func source(walk: Dictionary, box: AABB, skip: Callable = Callable()) -> NavigationMeshSourceGeometryData3D:
	var f := PackedVector3Array()
	var nf := 0
	for F in walk["floors"]:
		if skip.is_valid() and skip.call(F):
			continue
		match F["kind"]:
			"strip":
				var a := Vector3(F["a"][0], F["a"][2], F["a"][1])
				var b := Vector3(F["b"][0], F["b"][2], F["b"][1])
				if not (_in(box, a) or _in(box, b)):
					continue
				var d := Vector2(b.x - a.x, b.z - a.z)
				if d.length() < 1e-6:
					continue
				d = d.normalized() * float(F["w"]) * 0.5
				var n := Vector3(-d.y, 0, d.x)
				_quad(f, a - n, b - n, b + n, a + n, true)
				nf += 1
			"poly":
				var P: Array = F["pts"]
				var p0 := Vector3(P[0][0], P[0][2], P[0][1])
				var bb := AABB(p0, Vector3.ZERO)
				for p in P:
					bb = bb.expand(Vector3(p[0], p[2], p[1]))
				if not (bb.position.x <= box.end.x and bb.end.x >= box.position.x and bb.position.z <= box.end.z and bb.end.z >= box.position.z):
					continue   # (by its bounds: the apron's ellipse starts far round its rim)
				for i in range(1, P.size() - 1):
					var p1 := Vector3(P[i][0], P[i][2], P[i][1])
					var p2 := Vector3(P[i + 1][0], P[i + 1][2], P[i + 1][1])
					f.append_array([p0, p1, p2, p0, p2, p1])
				nf += 1
			"rect":
				var r: Array = F["rect"]
				var y := float(F["y"])
				var c := Vector3((r[0] + r[1]) * 0.5, y, (r[2] + r[3]) * 0.5)
				if not _in(box, c):
					continue
				_quad(f, Vector3(r[0], y, r[2]), Vector3(r[1], y, r[2]), Vector3(r[1], y, r[3]), Vector3(r[0], y, r[3]), true)
				nf += 1
	var nb := 0
	for K in walk["blocks"]:
		var q: Array = K["box"]   # [x0, x1, z0, z1, y0, y1]
		var c := Vector3((q[0] + q[1]) * 0.5, q[4], (q[2] + q[3]) * 0.5)
		if not _in(box, c):
			continue
		var A := Vector3(q[0], q[4], q[2])
		var B := Vector3(q[1], q[4], q[2])
		var C := Vector3(q[1], q[4], q[3])
		var D := Vector3(q[0], q[4], q[3])
		var up := Vector3(0, float(q[5]) - float(q[4]), 0)
		_quad(f, A, B, B + up, A + up, false)
		_quad(f, B, C, C + up, B + up, false)
		_quad(f, C, D, D + up, C + up, false)
		_quad(f, D, A, A + up, D + up, false)
		nb += 1
	var src := NavigationMeshSourceGeometryData3D.new()
	src.add_faces(f, Transform3D.IDENTITY)
	src.set_meta("counts", {"floors": nf, "blocks": nb, "triangles": f.size() / 3})
	return src


static func bake(src: NavigationMeshSourceGeometryData3D, box: AABB) -> NavigationMesh:
	var nm := NavigationMesh.new()
	nm.cell_size = CELL
	nm.cell_height = CELL_H
	nm.agent_radius = RADIUS
	nm.agent_height = HEIGHT
	nm.agent_max_climb = CLIMB
	nm.agent_max_slope = SLOPE
	nm.filter_baking_aabb = box
	nm.region_min_size = 4.0
	NavigationServer3D.bake_from_source_geometry_data(nm, src)
	return nm


static func map_with(nm: NavigationMesh) -> RID:
	var map := NavigationServer3D.map_create()
	NavigationServer3D.map_set_cell_size(map, CELL)
	NavigationServer3D.map_set_cell_height(map, CELL_H)
	NavigationServer3D.map_set_up(map, Vector3.UP)
	NavigationServer3D.map_set_active(map, true)
	var reg := NavigationServer3D.region_create()
	NavigationServer3D.region_set_map(reg, map)
	NavigationServer3D.region_set_navigation_mesh(reg, nm)
	return map


static func node(nav: Dictionary, id: String) -> Vector3:
	for n in nav["nodes"]:
		if n["id"] == id:
			return Vector3(n["x"], n["y"], n["z"])
	return Vector3(INF, INF, INF)


static func graph_route(nav: Dictionary, from_id: String, to_id: String, ok: Callable = Callable()) -> Dictionary:
	var idx := {}
	var pos: Array[Vector3] = []
	for n in nav["nodes"]:
		idx[n["id"]] = pos.size()
		pos.append(Vector3(n["x"], n["y"], n["z"]))
	var adj: Array = []
	adj.resize(pos.size())
	for i in pos.size():
		adj[i] = []
	for e in nav["edges"]:
		if ok.is_valid() and not ok.call(e):
			continue
		var a: int = idx.get(e["a"], -1)
		var b: int = idx.get(e["b"], -1)
		if a < 0 or b < 0:
			continue
		var L := pos[a].distance_to(pos[b])
		adj[a].append([b, L])
		adj[b].append([a, L])
	var s: int = idx.get(from_id, -1)
	var t: int = idx.get(to_id, -1)
	if s < 0 or t < 0:
		return {}
	var dist := PackedFloat64Array()
	dist.resize(pos.size())
	dist.fill(INF)
	var prev := PackedInt32Array()
	prev.resize(pos.size())
	prev.fill(-1)
	dist[s] = 0.0
	var heap: Array = [[0.0, s]]   # a binary heap of [d, node]
	while heap.size() > 0:
		var top: Array = heap[0]
		var last: Array = heap.pop_back()
		if heap.size() > 0:
			heap[0] = last
			var i := 0
			while true:
				var l := 2 * i + 1
				var r := l + 1
				var m := i
				if l < heap.size() and heap[l][0] < heap[m][0]:
					m = l
				if r < heap.size() and heap[r][0] < heap[m][0]:
					m = r
				if m == i:
					break
				var tmp = heap[i]
				heap[i] = heap[m]
				heap[m] = tmp
				i = m
		var d: float = top[0]
		var u: int = top[1]
		if d > dist[u]:
			continue
		if u == t:
			break
		for q in adj[u]:
			var v: int = q[0]
			var nd: float = d + float(q[1])
			if nd < dist[v]:
				dist[v] = nd
				prev[v] = u
				heap.append([nd, v])
				var j := heap.size() - 1
				while j > 0:
					var p := (j - 1) >> 1
					if heap[p][0] <= heap[j][0]:
						break
					var tmp2 = heap[p]
					heap[p] = heap[j]
					heap[j] = tmp2
					j = p
	if dist[t] == INF:
		return {}
	var ids: Array = []
	var k := t
	var names: Array = nav["nodes"].map(func(n): return n["id"])
	while k >= 0:
		ids.push_front(names[k])
		k = prev[k]
	return {"len": dist[t], "ids": ids}
