# A krator-world-stream (openworld/<region>/tools/godot_case.py; GODOT-PLAN.md section 8, M7 "one world"): a region's
# ground in chunks and its places, each a krator-world case (core/export) in the region's frame, opened by KratorWorld.
#   KratorWorldStream.open(index_path) -> the node (its meta "index": the index JSON)
#   update(at, load_r, keep_r)   loads every chunk whose box lies within load_r of `at` (x, z: the camera on the ground's
#                                plane) and frees every loaded chunk farther than keep_r (keep_r > load_r: no chunk
#                                flickers in and out at the edge); returns {loaded: [ids], unloaded: [ids]}
#   height_at(x, z)              the ground under (x, z) from a loaded chunk (KData.height_at on its sampled grid), NAN
#                                where no loaded chunk covers it
#   open_place(id)               a place's case (a site at 1:1) as its own KratorWorld node, added under "Places"
#   chunk_box(id), place(id), road(id)   the index's entries
# The log (meta "log": [{step, at, loaded, unloaded, held}]) is what the test reads. Chunks are krator-world boxes too, so
# a chunk is KratorWorld.build of its world.json; it holds the ground (terrain section) and the records standing in it.
# Coordinates: the region's metres, as the page's. KratorWorld places vertices at those coordinates, so far from the
# region's origin (the High Rift is 600 km out) a float32 vertex keeps ~6 cm: a floating origin is owed (the report says).
class_name KratorWorldStream
extends Node3D

var index: Dictionary = {}
var dir := ""
var chunks := {}          # id -> Node3D, the loaded ones
var _box := {}            # id -> [x0, z0, x1, z1]
var log: Array = []
var step := 0


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


func update(at: Vector2, load_r: float, keep_r: float) -> Dictionary:
	var loaded := []
	var unloaded := []
	for id in _box:
		var d := box_dist(_box[id], at.x, at.y)
		if d <= load_r and not chunks.has(id):
			var path := dir + "/" + _case(id) + "/world.json"
			var w := KratorWorld.build(path)
			w.name = "Chunk_" + id
			w.set_meta("case_path", path)   # its world.json (the importer's "world" meta leaves the terrain out)
			add_child(w)
			chunks[id] = w
			loaded.append(id)
		elif d > keep_r and chunks.has(id):
			var n: Node3D = chunks[id]
			chunks.erase(id)
			remove_child(n)
			n.free()
			unloaded.append(id)
	log.append({"step": step, "at": [at.x, at.y], "loaded": loaded, "unloaded": unloaded, "held": chunks.keys()})
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
	return KData.height_at((chunks[id] as Node3D).get_meta("ground", null), x, z)


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
	get_node("Places").add_child(w)
	return w
