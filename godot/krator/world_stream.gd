# A krator-world-stream (openworld/<region>/tools/godot_case.py; GODOT-PLAN.md section 8, M7 "one world"): a region's
# ground in chunks and its places, each a krator-world case (core/export) in the region's frame, opened by KratorWorld.
#   KratorWorldStream.open(index_path) -> the node (its meta "index": the index JSON)
#   update(at, load_r, keep_r)   loads every chunk whose box lies within load_r of `at` (x, z: the camera on the ground's
#                                plane) and frees every loaded chunk farther than keep_r (keep_r > load_r: no chunk
#                                flickers in and out at the edge); returns {loaded: [ids], unloaded: [ids]}
#   height_at(x, z)              the ground under (x, z) from a loaded chunk (KData.height_at on its sampled grid), NAN
#                                where no loaded chunk covers it
#   open_place(id)               a place's case (a site at 1:1) as its own KratorWorld node, added under "Places"; a place
#                                with an `arcology` (Strongbow's page) gets it as a child "Arcology", seated and turned
#   chunk_box(id), place(id), road(id)   the index's entries
# The log (meta "log": [{step, at, loaded, unloaded, held}]) is what the test reads. Chunks are krator-world boxes too, so
# a chunk is KratorWorld.build of its world.json; it holds the ground (terrain section) and the records standing in it.
# Coordinates: the region's metres, as the page's, in the index and in every argument here (doubles). A floating origin
# (2026-11-16): each case is written about its own origin (core/export README, "origin"; KratorWorld's meta "origin"), and
# the stream holds one of its own (`origin`, doubles), so a case's node stands at its origin less the stream's: every
# vertex and transform Godot holds (float32) stays small near the camera, where 600 km out a float32 keeps ~6 cm.
#   rebase(x, z)                 moves the stream's origin to (x, z) in whole metres and every case's node with it;
#                                update() calls it when the camera is more than REBASE from the origin
#   local(x, y, z) -> Vector3    a region point in the stream's frame (taken off in double precision)
#   region(v) -> Array           a point in the stream's frame back in the region's metres, [x, y, z] in doubles
class_name KratorWorldStream
extends Node3D

var index: Dictionary = {}
var dir := ""
var chunks := {}          # id -> Node3D, the loaded ones
var _box := {}            # id -> [x0, z0, x1, z1]
var log: Array = []
var step := 0
var origin := [0.0, 0.0, 0.0]   # the stream's floating origin, the region's metres (doubles)
var rebases := 0
const REBASE := 4000.0
# M8 (GODOT-PLAN.md, "walk the road"): a walkable stream. collide: every case's ground and buildings get static bodies;
# auto_places: update() opens the places within its load radius plus a chunk (so a chunk is never loaded without the
# places inside it) and frees them beyond its keep radius plus a chunk. A chunk's ground leaves out the cells wholly inside
# a place's square, where the place's own finer ground stands (64 m cells would smear Strongbow's face over its page)
var collide := false
var auto_places := false
var places_open := {}     # id -> Node3D
signal rebased(delta: Vector3)   # what every node the stream holds moved by: a caller moves its own (the walker) the same


static func open(path: String) -> KratorWorldStream:
	var s := KratorWorldStream.new()
	s.name = "WorldStream"
	s.dir = path.get_base_dir()
	var d = KData.read_json(path)
	if d is Dictionary and d.get("format") == "krator-world-stream":
		s.index = d
		for c in d["chunk"]["list"]:
			s._box[c["id"]] = c["box"]
	s.set_meta("index", s.index)
	s.set_meta("log", s.log)
	var p := Node3D.new()
	p.name = "Places"
	s.add_child(p)
	return s


func chunk_box(id: String) -> Array:
	return _box.get(id, [])


static func box_dist(b: Array, x: float, z: float) -> float:
	var dx := maxf(maxf(float(b[0]) - x, 0.0), x - float(b[2]))
	var dz := maxf(maxf(float(b[1]) - z, 0.0), z - float(b[3]))
	return sqrt(dx * dx + dz * dz)


func local(x: float, y: float, z: float) -> Vector3:
	return Vector3(x - origin[0], y - origin[1], z - origin[2])


func region(v: Vector3) -> Array:
	return [float(v.x) + origin[0], float(v.y) + origin[1], float(v.z) + origin[2]]


# a case's node at its origin less the stream's (KratorWorld's meta "origin")
func _seat(w: Node3D) -> void:
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	w.position = Vector3(o[0] - origin[0], o[1] - origin[1], o[2] - origin[2])


func rebase(x: float, z: float) -> void:
	var was: Array = origin.duplicate()
	origin = [roundf(x), 0.0, roundf(z)]
	for id in chunks:
		_seat(chunks[id])
	for p in get_node("Places").get_children():
		_seat(p)
	rebases += 1
	rebased.emit(Vector3(was[0] - origin[0], was[1] - origin[1], was[2] - origin[2]))


func update(at: Vector2, load_r: float, keep_r: float) -> Dictionary:
	if absf(at.x - origin[0]) > REBASE or absf(at.y - origin[2]) > REBASE:
		rebase(at.x, at.y)
	var loaded := []
	var unloaded := []
	for id in _box:
		var d := box_dist(_box[id], at.x, at.y)
		if d <= load_r and not chunks.has(id):
			var path := dir + "/" + _case(id) + "/world.json"
			var w := KratorWorld.build(path)
			w.name = "Chunk_" + id
			w.set_meta("case_path", path)   # its world.json (the importer's "world" meta leaves the terrain out)
			_hole(w, _box[id])
			_seat(w)
			add_child(w)
			if collide:
				collide_case(w)
			chunks[id] = w
			loaded.append(id)
		elif d > keep_r and chunks.has(id):
			var n: Node3D = chunks[id]
			chunks.erase(id)
			remove_child(n)
			n.free()
			unloaded.append(id)
	if auto_places:
		var csz := float(index["chunk"]["size"])
		for p in index.get("places", []):
			var pid: String = p["id"]
			var d := box_dist(p["box"], at.x, at.y)
			if d <= load_r + csz and not places_open.has(pid):
				places_open[pid] = open_place(pid)
				loaded.append(pid)
			elif d > keep_r + csz and places_open.has(pid):
				var n: Node3D = places_open[pid]
				places_open.erase(pid)
				n.get_parent().remove_child(n)
				n.free()
				unloaded.append(pid)
	log.append({"step": step, "at": [at.x, at.y], "loaded": loaded, "unloaded": unloaded, "held": chunks.keys(), "origin": origin.duplicate()})
	step += 1
	return {"loaded": loaded, "unloaded": unloaded}


func _case(id: String) -> String:
	for c in index["chunk"]["list"]:
		if c["id"] == id:
			return c["case"]
	return ""


func covering(x: float, z: float) -> String:
	for id in chunks:
		var b: Array = _box[id]
		if x >= float(b[0]) and x <= float(b[2]) and z >= float(b[1]) and z <= float(b[3]):
			return id
	return ""


func height_at(x: float, z: float) -> float:
	var id := covering(x, z)
	if id == "":
		return NAN
	var w: Node3D = chunks[id]   # its ground's grid stands about the case's origin
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	return KData.height_at(w.get_meta("ground", null), x - o[0], z - o[2]) + o[1]


func place(id: String) -> Dictionary:
	for p in index.get("places", []):
		if p["id"] == id:
			return p
	return {}


func road(id: String) -> Dictionary:
	for r in index.get("roads", []):
		if r["id"] == id:
			return r
	return {}


func open_place(id: String) -> Node3D:
	var p := place(id)
	if p.is_empty():
		return null
	var w := KratorWorld.build(dir + "/" + str(p["case"]) + "/world.json")
	w.name = "Place_" + id
	_seat(w)
	get_node("Places").add_child(w)
	if p.get("arcology") is Dictionary:
		w.add_child(arcology(p, w))
	if collide:
		collide_case(w)
		if w.get_node_or_null("Arcology"):
			collide_case(w.get_node("Arcology"))
	return w


# a chunk's ground without the cells wholly inside a place's square (the place's own ground stands there): its mesh
# rebuilt from the importer's, the triangles whose three corners lie in a place box dropped. A cell half in, half out is
# kept, so the two grounds overlap by up to a cell at a place's edge and never leave a gap
func _hole(w: Node3D, cbox: Array) -> void:
	var boxes := []
	for p in index.get("places", []):
		var b: Array = p["box"]
		if float(b[0]) < float(cbox[2]) and float(b[2]) > float(cbox[0]) and float(b[1]) < float(cbox[3]) and float(b[3]) > float(cbox[1]):
			boxes.append(b)
	var mi := (w.get_meta("ground") if w.has_meta("ground") else null) as MeshInstance3D
	if boxes.is_empty() or mi == null:
		return
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var arr := mi.mesh.surface_get_arrays(0)
	var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	var I: PackedInt32Array = arr[Mesh.ARRAY_INDEX]
	var inside := func(v: Vector3) -> bool:
		var x: float = float(v.x) + float(o[0])
		var z: float = float(v.z) + float(o[2])
		for b in boxes:
			if x >= float(b[0]) and x <= float(b[2]) and z >= float(b[1]) and z <= float(b[3]):
				return true
		return false
	var keep := PackedInt32Array()
	var dropped := 0
	for t in range(0, I.size(), 3):
		if inside.call(V[I[t]]) and inside.call(V[I[t + 1]]) and inside.call(V[I[t + 2]]):
			dropped += 1
			continue
		keep.append(I[t]); keep.append(I[t + 1]); keep.append(I[t + 2])
	if dropped == 0:
		return
	arr[Mesh.ARRAY_INDEX] = keep
	var mat := mi.mesh.surface_get_material(0)
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	m.surface_set_material(0, mat)
	mi.mesh = m
	mi.set_meta("holes", {"places": boxes.size(), "triangles_dropped": dropped})


# static bodies for a case: its ground (the importer's ground mesh) and its buckets (the buildings' plain meshes) as
# trimesh shapes; items (flora, massing boxes) are left without (GODOT-PLAN.md M8)
static func collide_case(w: Node3D) -> void:
	var meshes := []
	var g = w.get_meta("ground") if w.has_meta("ground") else null   # (a page of its own, Strongbow's, has none)
	if g is MeshInstance3D:
		meshes.append(g)
	var bk := w.get_node_or_null("Buckets")
	if bk:
		for b in bk.get_children():
			if b is MeshInstance3D:
				meshes.append(b)
	for mi in meshes:
		var shape: Shape3D = (mi as MeshInstance3D).mesh.create_trimesh_shape()
		if shape == null:
			continue
		var body := StaticBody3D.new()
		body.name = "Collision"
		var cs := CollisionShape3D.new()
		cs.shape = shape
		body.add_child(cs)
		(mi as MeshInstance3D).add_child(body)


# a place's page of its own (Strongbow's arcology, godot_case.py ARCOLOGY): its case is written about the page's anchor
# (its origin), which stands at the place's `at`, the page turned by `ry` about +Y. Under the place's node, so it rides
# the place's seat: its own transform is small (at less the place's origin, in doubles)
func arcology(p: Dictionary, w: Node3D) -> Node3D:
	var A: Dictionary = p["arcology"]
	var a := KratorWorld.build(dir + "/" + str(A["case"]) + "/world.json")
	a.name = "Arcology"
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var at: Array = A["at"]
	a.transform = Transform3D(Basis(Vector3.UP, float(A["ry"])), Vector3(float(at[0]) - o[0], float(at[1]) - o[1], float(at[2]) - o[2]))
	a.set_meta("arcology", A)
	return a
