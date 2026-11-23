# M9 step 1 (GODOT-PLAN.md, "the valley alive"): the valley's road traffic replayed from its week. The economy runs in the
# page (core/region 50, core/simulation's trade) and exports its log (godot/data/world-<region>/sim.json: every
# `trade out` and `trade in` by route and carrier, at its minute); the region's roads are the stream's index (their
# lines). Here each sim route is laid on the index's roads: its two settlements matched to the road network's nodes by
# their places, the path between them the shortest over the network (Longsong to the Singing Gjar by the Caldron House and
# the Mirror Grange). A settlement off the map (the Xanadu market, down Strongbow's elevator) reaches the network at its
# nearest node, and the carrier is off the map for that part of the trip.
#   KratorValleyTraffic.make(index, sim) -> the object (RefCounted; a Node to draw them: draw_node)
#   trips: [{route, carrier, from, to, m0, m1}]   every departure paired with its arrival (m1 -1: still under way at the end)
#   paths: {route: {pts: PackedVector2Array (region x, z), len, from_node, to_node, off_from, off_to}}
#   carriers_at(m) -> [{route, carrier, x, z, f, on_map}]   the carriers under way at sim minute m and where they are
class_name KratorValleyTraffic
extends RefCounted

const SNAP := 300.0       # metres: road ends nearer than this are one node of the network
const NEAR := 2500.0      # metres: a settlement this near a node stands on it; farther, it is off the map there

var index: Dictionary
var sim: Dictionary
var nodes: Array = []     # [Vector2]
var edges: Array = []     # [{a, b, pts: PackedVector2Array, len}]
var adj := {}             # node -> [[edge, other]]
var paths := {}
var trips: Array = []
var settlements := {}     # id -> Vector2
var unmapped: Array = []  # routes no path could be laid for


static func make(index_: Dictionary, sim_: Dictionary) -> KratorValleyTraffic:
	var T := KratorValleyTraffic.new()
	T.index = index_
	T.sim = sim_
	T._network()
	for s in sim_["valley"]["settlements"]:
		if s.get("x") != null:
			T.settlements[s["id"]] = Vector2(float(s["x"]), float(s["z"]))
	T._hubs()
	for r in sim_["valley"]["roads"]:
		T._lay(r)
	T._trips()
	return T


func _node(p: Vector2) -> int:
	for i in nodes.size():
		if (nodes[i] as Vector2).distance_to(p) < SNAP:
			return i
	nodes.append(p)
	return nodes.size() - 1


# the road network: each road split where another road's end joins it partway (a village road onto its site's trunk:
# core/world 48s), so the network's nodes are the roads' ends and those junctions
func _network() -> void:
	var lines := []
	for r in index.get("roads", []):
		var pts := PackedVector2Array()
		for q in r["pts"]:
			pts.append(Vector2(float(q[0]), float(q[1])))
		if pts.size() >= 2:
			lines.append({"id": r["id"], "pts": pts})
	var ends := []
	for l in lines:
		ends.append(l["pts"][0])
		ends.append(l["pts"][l["pts"].size() - 1])
	for l in lines:
		var pts: PackedVector2Array = l["pts"]
		# the arc positions where another road's end meets this one away from its own ends
		var cuts := []   # [s, point]
		var s0 := 0.0
		var cum := [0.0]
		for i in range(1, pts.size()):
			s0 += pts[i].distance_to(pts[i - 1])
			cum.append(s0)
		for p in ends:
			if p.distance_to(pts[0]) < SNAP or p.distance_to(pts[pts.size() - 1]) < SNAP:
				continue
			var best := INF
			var bs := 0.0
			var bq := Vector2.ZERO
			for i in range(1, pts.size()):
				var q := Geometry2D.get_closest_point_to_segment(p, pts[i - 1], pts[i])
				var d := q.distance_to(p)
				if d < best:
					best = d
					bq = q
					bs = float(cum[i - 1]) + q.distance_to(pts[i - 1])
			if best < SNAP:
				cuts.append([bs, bq])
		cuts.sort_custom(func(x, y): return x[0] < y[0])
		# the pieces between the cuts
		var piece := PackedVector2Array([pts[0]])
		var ci := 0
		for i in range(1, pts.size()):
			while ci < cuts.size() and float(cuts[ci][0]) <= float(cum[i]):
				piece.append(cuts[ci][1])
				_edge(piece, l["id"])
				piece = PackedVector2Array([cuts[ci][1]])
				ci += 1
			piece.append(pts[i])
		_edge(piece, l["id"])


func _edge(pts: PackedVector2Array, id: String, na := -1, nb := -1) -> void:
	if pts.size() < 2:
		return
	var L := 0.0
	for i in range(1, pts.size()):
		L += pts[i].distance_to(pts[i - 1])
	if L < 1.0:
		return
	var a := na if na >= 0 else _node(pts[0])
	var b := nb if nb >= 0 else _node(pts[pts.size() - 1])
	if a == b:
		return
	var e := edges.size()
	edges.append({"a": a, "b": b, "pts": pts, "len": L, "id": id})
	adj[a] = adj.get(a, []) + [[e, b]]
	adj[b] = adj.get(b, []) + [[e, a]]


# each settlement a node of its own, joined by a straight street to every road end within NEAR of it (a link starts at its
# site's reach, about 800 m out, a village road at its lane end: core/world 48s), or to the nearest when none is that near
# (off the map: the Xanadu market, down Strongbow's elevator)
var hub := {}   # settlement id -> node
func _hubs() -> void:
	var road_nodes := nodes.size()
	for id in settlements:
		var p: Vector2 = settlements[id]
		var h := nodes.size()
		nodes.append(p)
		hub[id] = h
		var near := []
		var best := -1
		var bd := INF
		for i in road_nodes:
			var d := (nodes[i] as Vector2).distance_to(p)
			if d <= NEAR:
				near.append(i)
			if d < bd:
				bd = d
				best = i
		if near.is_empty() and best >= 0:
			near.append(best)
		for i in near:
			_edge(PackedVector2Array([p, nodes[i]]), "street:" + str(id), h, i)


func _nearest(p: Vector2) -> Array:   # [node, distance]
	var best := -1
	var bd := INF
	for i in nodes.size():
		var d := (nodes[i] as Vector2).distance_to(p)
		if d < bd:
			bd = d
			best = i
	return [best, bd]


# Dijkstra over the network: the edges from node a to node b, each with its direction, or [] when none joins them
func _nearest_road(p: Vector2) -> Array:   # the nearest road end (not a hub) and its distance
	var best := -1
	var bd := INF
	var hubs := hub.values()
	for i in nodes.size():
		if hubs.has(i):
			continue
		var d := (nodes[i] as Vector2).distance_to(p)
		if d < bd:
			bd = d
			best = i
	return [best, bd]


func _route(a: int, b: int) -> Array:
	var dist := {a: 0.0}
	var prev := {}
	var open := [a]
	var done := {}
	while not open.is_empty():
		var u: int = open[0]
		for n in open:
			if dist[n] < dist[u]:
				u = n
		open.erase(u)
		if u == b:
			break
		done[u] = true
		for pair in adj.get(u, []):
			var e: int = pair[0]
			var v: int = pair[1]
			if done.has(v):
				continue
			var nd: float = dist[u] + float(edges[e]["len"])
			if not dist.has(v) or nd < dist[v]:
				dist[v] = nd
				prev[v] = [u, e]
				if not open.has(v):
					open.append(v)
	if not dist.has(b):
		return []
	var out := []
	var c := b
	while c != a:
		var pe: Array = prev[c]
		out.push_front([pe[1], int(edges[pe[1]]["a"]) == int(pe[0])])   # [edge, forward]
		c = pe[0]
	return out


func _lay(r: Dictionary) -> void:
	var fa = settlements.get(r["from"])
	var fb = settlements.get(r["to"])
	if fa == null or fb == null:
		unmapped.append(r["id"])
		return
	var ra := _nearest_road(fa)
	var rb := _nearest_road(fb)
	var na := [hub[r["from"]], ra[1]]
	var nb := [hub[r["to"]], rb[1]]
	var pts := PackedVector2Array()
	if na[0] != nb[0]:
		var R := _route(na[0], nb[0])
		if R.is_empty():
			unmapped.append(r["id"])
			return
		for step in R:
			var ep: PackedVector2Array = edges[step[0]]["pts"]
			var seg := ep if step[1] else _reversed(ep)
			for k in seg.size():
				if pts.size() > 0 and k == 0:
					continue
				pts.append(seg[k])
	else:
		pts.append(nodes[na[0]])
	var L := 0.0
	for i in range(1, pts.size()):
		L += pts[i].distance_to(pts[i - 1])
	paths[r["id"]] = {"pts": pts, "len": L, "from_node": na[0], "to_node": nb[0], "off_from": float(na[1]) > NEAR, "off_to": float(nb[1]) > NEAR,
		"minutes": float(r["minutes"]), "rfrom": r["from"]}


static func _reversed(p: PackedVector2Array) -> PackedVector2Array:
	var o := PackedVector2Array()
	for i in range(p.size() - 1, -1, -1):
		o.append(p[i])
	return o


# each `trade out` paired with the next `trade in` of the same route and carrier (a carrier still on the road at the week's
# end has m1 -1)
func _trips() -> void:
	var open := {}
	for e in sim["log"]:
		var k: String = str(e.get("route")) + "#" + str(e.get("carrier"))
		if e["kind"] == "trade out":
			if open.has(k):   # a second departure before an arrival: the first trip had no arrival logged
				trips.append(open[k])
			open[k] = {"route": e["route"], "carrier": int(e["carrier"]), "from": e["from"], "to": e["to"], "m0": float(e["m"]), "m1": -1.0}
		elif e["kind"] == "trade in" and open.has(k):
			var t: Dictionary = open[k]
			t["m1"] = float(e["m"])
			trips.append(t)
			open.erase(k)
	for k in open:
		trips.append(open[k])


# where a trip's carrier is at minute m: the fraction f of its trip, the point that far along the route's path in the trip's
# direction (the path runs from the route's `from`; a return trip runs it backwards). Off the map: the part of the trip
# that belongs to an off-map end (in proportion to the off-map distance) has on_map false
func pose(t: Dictionary, m: float) -> Dictionary:
	var P: Dictionary = paths.get(t["route"], {})
	if P.is_empty():
		return {}
	var m1: float = t["m1"] if t["m1"] >= 0 else t["m0"] + float(P["minutes"])
	if m < t["m0"] or m > m1:
		return {}
	var f: float = clampf((m - t["m0"]) / maxf(1.0, m1 - t["m0"]), 0.0, 1.0)
	var forward: bool = t["from"] == P["rfrom"]
	var off_a: bool = P["off_from"] if forward else P["off_to"]
	var off_b: bool = P["off_to"] if forward else P["off_from"]
	# an off-map end: the carrier spends the matching share of the trip off the map (its distance from the node, at the
	# road's own pace); the on-map share is laid along the path
	var pts: PackedVector2Array = P["pts"] if forward else _reversed(P["pts"])
	var Lon: float = float(P["len"])
	var da := 0.0
	var db := 0.0
	var A = settlements.get(t["from"])
	var B = settlements.get(t["to"])
	if off_a and A != null: da = (A as Vector2).distance_to(pts[0])
	if off_b and B != null: db = (B as Vector2).distance_to(pts[pts.size() - 1])
	var tot := Lon + da + db
	var s := f * tot
	if s < da or s > da + Lon:
		return {"route": t["route"], "carrier": t["carrier"], "f": f, "on_map": false}
	var p := _along(pts, s - da)
	return {"route": t["route"], "carrier": t["carrier"], "f": f, "on_map": true, "x": p.x, "z": p.y}


static func _along(pts: PackedVector2Array, s: float) -> Vector2:
	if pts.size() == 1:
		return pts[0]
	for i in range(1, pts.size()):
		var seg := pts[i].distance_to(pts[i - 1])
		if s <= seg:
			return pts[i - 1].lerp(pts[i], s / maxf(seg, 1e-6))
		s -= seg
	return pts[pts.size() - 1]


func carriers_at(m: float) -> Array:
	var out := []
	for t in trips:
		var p := pose(t, m)
		if not p.is_empty():
			out.append(p)
	return out


# the carriers on the map within `reach` of the stream's walker, as stand-in carts (a box each) on the stream's ground,
# under `node` (a MultiMeshInstance3D made the first time)
func draw(stream: KratorWorldStream, node: MultiMeshInstance3D, m: float, at: Vector2, reach := 20000.0) -> int:
	if node.multimesh == null:
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		var bx := BoxMesh.new()
		bx.size = Vector3(2.2, 1.8, 4.5)
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.55, 0.38, 0.2)
		bx.material = mat
		mm.mesh = bx
		node.multimesh = mm
	var shown := []
	for c in carriers_at(m):
		if c["on_map"] and Vector2(c["x"], c["z"]).distance_to(at) <= reach:
			var h := stream.height_at(c["x"], c["z"])
			if is_finite(h):
				shown.append([c["x"], h, c["z"]])
	node.multimesh.instance_count = shown.size()
	var placed := []
	for i in shown.size():
		var v := stream.local(shown[i][0], shown[i][1] + 0.9, shown[i][2])
		node.multimesh.set_instance_transform(i, Transform3D(Basis(), v))
		placed.append(v)
	node.set_meta("krator_carriers", placed)   # the positions drawn (headless, the dummy renderer keeps no instance transforms)
	return shown.size()
