# A krator-world-stream (openworld/<region>/tools/godot_case.py; GODOT-PLAN.md section 8, M7 "one world"): a region's
# ground in chunks and its places, each a krator-world case (core/export) in the region's frame, opened by KratorWorld.
#   KratorWorldStream.open(index_path) -> the node (its meta "index": the index JSON)
#   update(at, load_r, keep_r)   loads every chunk whose box lies within load_r of `at` (x, z: the camera on the ground's
#                                plane) and frees every loaded chunk farther than keep_r (keep_r > load_r: no chunk
#                                flickers in and out at the edge); returns {loaded: [ids], unloaded: [ids]}
#   height_at(x, z)              the ground under (x, z) from a loaded place/chunk, NAN where no loaded chunk covers it
#   open_place(id)               a place's case (a site at 1:1) as its own KratorWorld node, added under "Places"; a place
#                                with an `arcology` (Strongbow's page) or `monastery` (Longsong's page) gets it seated & turned
#   refresh_flora_at(cam_reg)    populates dual-LOD 3D StreamFlora MultiMeshes (lv=2 hero <=240 m, lv=1 mid <=2600 m)
#   chunk_box(id), place(id), road(id)   the index's entries
class_name KratorWorldStream
extends Node3D

const ROAD_SHADER := preload("res://shaders/road.gdshader")

var index: Dictionary = {}
var dir := ""
var chunks := {}          # id -> Node3D, the loaded ones
var _box := {}            # id -> [x0, z0, x1, z1]
var log: Array = []
var step := 0
var origin := [0.0, 0.0, 0.0]   # the stream's floating origin, the region's metres (doubles)
var rebases := 0
const REBASE := 4000.0
var collide := false
var auto_places := false
var places_open := {}     # id -> Node3D
signal rebased(delta: Vector3)

# Streamed 3D flora prototype library & per-chunk / outer-place placement tables
var flora_enabled := true
var _flora_lib_ready := false
var _flora_protos := {}       # pkey ("0|2|1|2") -> {"H": float, "crown_r": float, "parts": Array}
var _chunk_flora := {}        # id -> {"origin": Array, "keys": Array, "data": PackedFloat32Array, "box": Array}
var _place_flora := {}        # pid -> {"origin": Array, "keys": Array, "data": PackedFloat32Array, "box": Array}
var _stream_flora_root: Node3D = null
var _stream_flora_pools := {} # pkey -> Array[MultiMeshInstance3D]
var _last_flora_cam := Vector3(INF, INF, INF)


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
	var sf := Node3D.new()
	sf.name = "StreamFlora"
	s.add_child(sf)
	s._stream_flora_root = sf
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


func _seat(w: Node3D) -> void:
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	w.position = Vector3(float(o[0]) - origin[0], float(o[1]) - origin[1], float(o[2]) - origin[2])


func rebase(x: float, z: float) -> void:
	var was: Array = origin.duplicate()
	origin = [roundf(x), 0.0, roundf(z)]
	var delta := Vector3(float(was[0]) - origin[0], float(was[1]) - origin[1], float(was[2]) - origin[2])
	for id in chunks:
		_seat(chunks[id])
	for p in get_node("Places").get_children():
		_seat(p)
	for pkey in _stream_flora_pools:
		var mms: Array = _stream_flora_pools[pkey]
		if mms.is_empty():
			continue
		var mm0: MultiMesh = (mms[0] as MultiMeshInstance3D).multimesh
		if mm0 == null or mm0.instance_count <= 0:
			continue
		var stride := 12 + (4 if mm0.use_colors else 0) + (4 if mm0.use_custom_data else 0)
		var buf := mm0.buffer
		for i in mm0.instance_count:
			buf[i * stride + 3] += delta.x
			buf[i * stride + 7] += delta.y
			buf[i * stride + 11] += delta.z
		for mi in mms:
			(mi as MultiMeshInstance3D).multimesh.buffer = buf
	rebases += 1
	rebased.emit(delta)


func update(at: Vector2, load_r: float, keep_r: float) -> Dictionary:
	if absf(at.x - origin[0]) > REBASE or absf(at.y - origin[2]) > REBASE:
		rebase(at.x, at.y)
	var loaded := []
	var unloaded := []
	for id in _box:
		var d := box_dist(_box[id], at.x, at.y)
		if d <= load_r and not chunks.has(id) and not pending.has(id):
			if threaded:
				_enqueue("chunk", id)
			else:
				_attach("chunk", id, _build_chunk(id))
				loaded.append(id)
		elif d > keep_r:
			if chunks.has(id):
				var n: Node3D = chunks[id]
				chunks.erase(id)
				_chunk_flora.erase(id)
				remove_child(n)
				n.free()
				unloaded.append(id)
			_dequeue(id)
	if auto_places:
		var csz := float(index["chunk"]["size"])
		for p in index.get("places", []):
			var pid: String = p["id"]
			var d := box_dist(p["box"], at.x, at.y)
			if d <= load_r + csz and not places_open.has(pid) and not pending.has(pid):
				if threaded:
					_enqueue("place", pid)
				else:
					_attach("place", pid, _build_place(pid))
					loaded.append(pid)
			elif d > keep_r + csz:
				if places_open.has(pid):
					var n: Node3D = places_open[pid]
					places_open.erase(pid)
					_place_flora.erase(pid)
					n.get_parent().remove_child(n)
					n.free()
					unloaded.append(pid)
				_dequeue(pid)
	poll()
	if (not loaded.is_empty() or not unloaded.is_empty()) and is_finite(_last_flora_cam.x):
		refresh_flora_at(_last_flora_cam)
	elif not loaded.is_empty() and not is_finite(_last_flora_cam.x):
		var gh := height_at(at.x, at.y)
		if is_finite(gh):
			refresh_flora_at(Vector3(at.x, gh + 2.0, at.y))
	log.append({"step": step, "at": [at.x, at.y], "loaded": loaded, "unloaded": unloaded, "held": chunks.keys(), "origin": origin.duplicate()})
	step += 1
	return {"loaded": loaded, "unloaded": unloaded}


# ---------------------------------------------------------------- loading off the main thread (M8)
var threaded := false
var pending := {}        # id -> true: queued or building
var events: Array = []   # [{id, kind, build_ms, attach_ms}]
var _queue: Array = []   # [[kind, id]]
var _task := -1
var _job: Array = []
var _built: Node3D = null
var _build_ms := 0.0


func _enqueue(kind: String, id: String) -> void:
	pending[id] = true
	_queue.append([kind, id])


func _dequeue(id: String) -> void:
	for i in range(_queue.size() - 1, -1, -1):
		if _queue[i][1] == id:
			_queue.remove_at(i)
			pending.erase(id)


func poll() -> void:
	if _task >= 0 and WorkerThreadPool.is_task_completed(_task):
		WorkerThreadPool.wait_for_task_completion(_task)
		_task = -1
		var t0 := Time.get_ticks_usec()
		_attach(_job[0], _job[1], _built)
		events.append({"id": _job[1], "kind": _job[0], "build_ms": _build_ms, "attach_ms": (Time.get_ticks_usec() - t0) / 1000.0})
		_built = null
		if is_finite(_last_flora_cam.x):
			refresh_flora_at(_last_flora_cam)
	if _task < 0 and not _queue.is_empty():
		_job = _queue.pop_front()
		_task = WorkerThreadPool.add_task(_run_job, false, "krator stream: " + str(_job[1]))


func busy() -> bool:
	return _task >= 0 or not _queue.is_empty()


func _run_job() -> void:
	var t0 := Time.get_ticks_usec()
	_built = _build_chunk(_job[1]) if _job[0] == "chunk" else _build_place(_job[1])
	_build_ms = (Time.get_ticks_usec() - t0) / 1000.0


func _load_flora_table(f_path: String, fallback_box: Array) -> Dictionary:
	if not FileAccess.file_exists(f_path):
		return {}
	var fd = KData.read_json(f_path)
	if not (fd is Dictionary) or fd.get("format") != "krator-chunk-flora" or not (fd.get("data") is Dictionary):
		return {}
	return {
		"origin": fd.get("origin", [0.0, 0.0, 0.0]),
		"keys": fd.get("keys", []),
		"data": KData.floats(fd["data"]),
		"count": int(fd.get("count", 0)),
		"box": fd.get("box", fallback_box)
	}


func _build_chunk(id: String) -> Node3D:
	var cpath := _case(id)
	var path := dir + "/" + cpath + "/world.json"
	var w := KratorWorld.build(path)
	w.name = "Chunk_" + id
	w.set_meta("case_path", path)
	var cbox: Array = _box[id]
	_hole(w, cbox)
	_build_roads(w, cbox, false)
	var ft := _load_flora_table(dir + "/" + cpath + "/flora.json", cbox)
	if not ft.is_empty():
		w.set_meta("chunk_flora", ft)
	if collide:
		collide_case(w)
	return w


func _build_place(id: String) -> Node3D:
	var p := place(id)
	if p.is_empty():
		return null
	var pcase := str(p["case"])
	var w := KratorWorld.build(dir + "/" + pcase + "/world.json")
	w.name = "Place_" + id
	stitches += _stitch(w)
	var mon_node: Node3D = null
	if p.get("monastery") is Dictionary:
		var M: Dictionary = p["monastery"]
		if FileAccess.file_exists(dir + "/" + str(M.get("case", "")) + "/world.json"):
			mon_node = monastery(p, w)
			_hole_place_under_monastery(w, M)
	_build_roads(w, p["box"], true)
	if p.get("arcology") is Dictionary:
		if FileAccess.file_exists(dir + "/" + str(p["arcology"].get("case", "")) + "/world.json"):
			w.add_child(arcology(p, w))
	if mon_node != null:
		w.add_child(mon_node)
	var ft := _load_flora_table(dir + "/" + pcase + "/flora.json", p["box"])
	if not ft.is_empty():
		w.set_meta("place_flora", ft)
	if collide:
		collide_case(w)
		if w.get_node_or_null("Arcology"):
			collide_case(w.get_node("Arcology"))
		if w.get_node_or_null("Monastery"):
			collide_case(w.get_node("Monastery"))
	return w


# Exact triangle height on a KData._grid Terrain MeshInstance3D (matching cell diagonal (0,0)-(1,0)-(0,1) vs (1,0)-(1,1)-(0,1))
static func terrain_tri_height(mi: MeshInstance3D, lx: float, lz: float) -> float:
	if mi == null:
		return NAN
	if mi.has_meta("field"):
		return (mi.get_meta("field") as KField).h(lx, lz)
	if not mi.has_meta("grid"):
		return NAN
	var g: Dictionary = mi.get_meta("grid")
	var h: PackedFloat32Array = mi.get_meta("stitched_h") if mi.has_meta("stitched_h") else g["h"]
	var nx: int = int(g["nx"])
	var nz: int = int(g["nz"])
	var step_m := float(g["step"])
	var fx := clampf((lx - float(g["x0"])) / step_m, 0.0, float(nx - 1) - 1e-5)
	var fz := clampf((lz - float(g["z0"])) / step_m, 0.0, float(nz - 1) - 1e-5)
	var i := mini(int(floor(fx)), nx - 2)
	var j := mini(int(floor(fz)), nz - 2)
	var u := fx - float(i)
	var v := fz - float(j)
	var h00: float = h[j * nx + i]
	var h10: float = h[j * nx + i + 1]
	var h01: float = h[(j + 1) * nx + i]
	var h11: float = h[(j + 1) * nx + i + 1]
	if u + v <= 1.0:
		return h00 + u * (h10 - h00) + v * (h01 - h00)
	return h11 + (1.0 - u) * (h01 - h11) + (1.0 - v) * (h10 - h11)


func tri_height_at(x: float, z: float) -> float:
	var pid := place_covering(x, z)
	if pid != "":
		var pw: Node3D = places_open[pid]
		var mon := pw.get_node_or_null("Monastery")
		if mon != null and mon.has_meta("monastery"):
			var mh := _monastery_height_at(mon, x, z)
			if is_finite(mh):
				return mh
		var pg := (pw.get_meta("ground", null) if pw.has_meta("ground") else null) as MeshInstance3D
		if pg != null:
			var po: Array = pw.get_meta("origin", [0.0, 0.0, 0.0])
			var ph := terrain_tri_height(pg, x - float(po[0]), z - float(po[2])) + float(po[1])
			if is_finite(ph):
				return ph
	var id := covering(x, z)
	if id == "":
		return NAN
	var w: Node3D = chunks[id]
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var cg := (w.get_meta("ground", null) if w.has_meta("ground") else null) as MeshInstance3D
	return terrain_tri_height(cg, x - float(o[0]), z - float(o[2])) + float(o[1])


var stitches := 0
func _stitch(w: Node3D) -> int:
	var mi := (w.get_meta("ground") if w.has_meta("ground") else null) as MeshInstance3D
	if mi == null or not mi.has_meta("grid"):
		return 0
	var g: Dictionary = mi.get_meta("grid")
	var nx: int = int(g["nx"])
	var nz: int = int(g["nz"])
	var step_m := float(g["step"])
	var x0 := float(g["x0"])
	var z0 := float(g["z0"])
	var lat := float(index["chunk"]["step"])
	var r := int(roundf(lat / step_m))
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var gx0: float = x0 + float(o[0])
	var gz0: float = z0 + float(o[2])
	var x_off := absf(fposmod(gx0, lat)) > 0.01 and absf(fposmod(gx0, lat) - lat) > 0.01
	var z_off := absf(fposmod(gz0, lat)) > 0.01 and absf(fposmod(gz0, lat) - lat) > 0.01
	if r < 2 or (nx - 1) % r != 0 or (nz - 1) % r != 0 or x_off or z_off:
		return 0
	var arr := mi.mesh.surface_get_arrays(0)
	var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	var h_arr: PackedFloat32Array = (g["h"] as PackedFloat32Array).duplicate()
	var v_at := PackedInt32Array()
	v_at.resize(nx * nz)
	v_at.fill(-1)
	for vi in V.size():
		var gi := int(roundf((V[vi].x - x0) / step_m))
		var gj := int(roundf((V[vi].z - z0) / step_m))
		if gi >= 0 and gi < nx and gj >= 0 and gj < nz:
			v_at[gj * nx + gi] = vi
	var moved := 0
	var top := []
	var bot := []
	for i in nx:
		top.append([v_at[i], i, 0])
		bot.append([v_at[(nz - 1) * nx + i], i, nz - 1])
	var lef := []
	var rig := []
	for j in nz:
		lef.append([v_at[j * nx], 0, j])
		rig.append([v_at[j * nx + nx - 1], nx - 1, j])
	for edge in [top, bot, lef, rig]:
		for k in edge.size():
			if k % r == 0:
				continue
			var entry: Array = edge[k]
			var vk: int = int(entry[0])
			var va: int = int(edge[k - k % r][0])
			var vb: int = int(edge[k - k % r + r][0])
			if vk < 0 or va < 0 or vb < 0:
				continue
			var v: Vector3 = V[vk]
			v.y = lerpf(V[va].y, V[vb].y, float(k % r) / float(r))
			V[vk] = v
			h_arr[int(entry[2]) * nx + int(entry[1])] = v.y
			moved += 1
	arr[Mesh.ARRAY_VERTEX] = V
	arr[Mesh.ARRAY_TANGENT] = null
	var mat := mi.mesh.surface_get_material(0)
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	m.surface_set_material(0, mat)
	mi.mesh = m
	mi.set_meta("stitched_h", h_arr)
	mi.set_meta("stitched", moved)
	return moved


func _attach(kind: String, id: String, w: Node3D) -> void:
	pending.erase(id)
	if w == null:
		return
	_seat(w)
	if kind == "chunk":
		if chunks.has(id):
			w.free()
			return
		add_child(w)
		chunks[id] = w
		if w.has_meta("chunk_flora"):
			_chunk_flora[id] = w.get_meta("chunk_flora")
	else:
		if places_open.has(id):
			w.free()
			return
		get_node("Places").add_child(w)
		places_open[id] = w
		if w.has_meta("place_flora"):
			_place_flora[id] = w.get_meta("place_flora")


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


func place_covering(x: float, z: float) -> String:
	for pid in places_open:
		var p := place(str(pid))
		if p.get("box") is Array:
			var b: Array = p["box"]
			if x >= float(b[0]) and x <= float(b[2]) and z >= float(b[1]) and z <= float(b[3]):
				return str(pid)
	return ""


func _monastery_local(M: Dictionary, x: float, z: float) -> Vector2:
	var at: Array = M["at"]
	var ry := float(M.get("ry", 0.0))
	var dx := x - float(at[0])
	var dz := z - float(at[2])
	var c := cos(-ry)
	var s := sin(-ry)
	return Vector2(dx * c + dz * s, -dx * s + dz * c)


func _monastery_height_at(mon: Node3D, x: float, z: float) -> float:
	var M: Dictionary = mon.get_meta("monastery", {})
	var mbox: Array = M.get("box", [])
	if mbox.size() < 4:
		return NAN
	var lp := _monastery_local(M, x, z)
	var inset := 16.0
	if lp.x < float(mbox[0]) + inset or lp.x > float(mbox[2]) - inset or lp.y < float(mbox[1]) + inset or lp.y > float(mbox[3]) - inset:
		return NAN
	var mg: Node3D = mon.get_meta("ground", null) if mon.has_meta("ground") else null
	if mg == null:
		return NAN
	var mo: Array = mon.get_meta("origin", [0.0, 0.0, 0.0])
	var h := KData.height_at(mg, lp.x - float(mo[0]), lp.y - float(mo[2])) + float(mo[1])
	if not is_finite(h):
		return NAN
	var at: Array = M["at"]
	return h + float(at[1])


func height_at(x: float, z: float) -> float:
	var pid := place_covering(x, z)
	if pid != "":
		var pw: Node3D = places_open[pid]
		var mon := pw.get_node_or_null("Monastery")
		if mon != null and mon.has_meta("monastery"):
			var mh := _monastery_height_at(mon, x, z)
			if is_finite(mh):
				return mh
		var pg = pw.get_meta("ground", null) if pw.has_meta("ground") else null
		if pg != null:
			var po: Array = pw.get_meta("origin", [0.0, 0.0, 0.0])
			var ph := KData.height_at(pg, x - float(po[0]), z - float(po[2])) + float(po[1])
			if is_finite(ph):
				return ph
	var id := covering(x, z)
	if id == "":
		return NAN
	var w: Node3D = chunks[id]
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	return KData.height_at(w.get_meta("ground", null), x - float(o[0]), z - float(o[2])) + float(o[1])


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
	var w := _build_place(id)
	if w == null:
		return null
	_seat(w)
	get_node("Places").add_child(w)
	places_open[id] = w
	if w.has_meta("place_flora"):
		_place_flora[id] = w.get_meta("place_flora")
	return w


# Drop chunk triangles whose 3 vertices fall within any place box (with 0.5 m tolerance against float32 step rounding on 64 m lines)
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
			if x >= float(b[0]) - 0.5 and x <= float(b[2]) + 0.5 and z >= float(b[1]) - 0.5 and z <= float(b[3]) + 0.5:
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
	arr[Mesh.ARRAY_TANGENT] = null
	var mat := mi.mesh.surface_get_material(0)
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	m.surface_set_material(0, mat)
	mi.mesh = m
	mi.set_meta("holes", {"places": boxes.size(), "triangles_dropped": dropped})


# Ground-hugging 3D RoadRibbon per case: follows Terrain triangles across carriageway + feathered shoulders, skipping bridge spans
func _build_roads(w: Node3D, box: Array, is_place: bool) -> void:
	var mi := (w.get_meta("ground") if w.has_meta("ground") else null) as MeshInstance3D
	if mi == null or (not mi.has_meta("grid") and not mi.has_meta("field")):
		return
	var rds: Array = index.get("roads", [])
	if rds.is_empty():
		return
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var ox := float(o[0])
	var oy := float(o[1])
	var oz := float(o[2])
	var bx0 := float(box[0])
	var bz0 := float(box[1])
	var bx1 := float(box[2])
	var bz1 := float(box[3])
	var gstep := float((mi.get_meta("grid") as Dictionary).get("step", 8.0)) if mi.has_meta("grid") else 8.0
	var sub_step := clampf(gstep * 0.45, 3.0, 12.0)

	var excl_boxes := []
	if not is_place:
		for p in index.get("places", []):
			var pb: Array = p["box"]
			if float(pb[0]) < bx1 and float(pb[2]) > bx0 and float(pb[1]) < bz1 and float(pb[3]) > bz0:
				excl_boxes.append(pb)
	var mon_spec: Dictionary = {}
	if is_place and w.name == "Place_sq80bzd7ep":
		var pl_ls := place("sq80bzd7ep")
		if pl_ls.get("monastery") is Dictionary and FileAccess.file_exists(dir + "/" + str(pl_ls["monastery"].get("case", "")) + "/world.json"):
			mon_spec = pl_ls["monastery"]

	var verts := PackedVector3Array()
	var norms := PackedVector3Array()
	var uvs := PackedVector2Array()
	var indices := PackedInt32Array()
	var road_ids := []
	var total_rows := 0
	var run_count := 0
	var spans_skipped := 0

	for rd in rds:
		var pts: Array = rd.get("pts", [])
		if pts.size() < 2:
			continue
		var rx0 := INF; var rz0 := INF; var rx1 := -INF; var rz1 := -INF
		for pt in pts:
			var px := float(pt[0]); var pz := float(pt[1])
			rx0 = minf(rx0, px); rz0 = minf(rz0, pz); rx1 = maxf(rx1, px); rz1 = maxf(rz1, pz)
		if rx1 < bx0 - 16.0 or rx0 > bx1 + 16.0 or rz1 < bz0 - 16.0 or rz0 > bz1 + 16.0:
			continue
		var is_span := PackedByteArray()
		is_span.resize(pts.size() - 1)
		is_span.fill(0)
		for sp in rd.get("spans", []):
			if sp is Array and (sp as Array).size() >= 2:
				var s0 := maxi(0, int(sp[0]))
				var s1 := mini(pts.size() - 1, int(sp[1]))
				for si in range(s0, s1):
					is_span[si] = 1
					spans_skipped += 1

		var runs := []
		var cur_run := []
		var arc := 0.0
		for seg_i in range(pts.size() - 1):
			var ax := float(pts[seg_i][0]); var az := float(pts[seg_i][1])
			var bx := float(pts[seg_i + 1][0]); var bz := float(pts[seg_i + 1][1])
			var seg_len := Vector2(bx - ax, bz - az).length()
			if seg_len < 0.05:
				continue
			if is_span[seg_i] != 0:
				if cur_run.size() >= 2:
					runs.append(cur_run)
				cur_run = []
				arc += seg_len
				continue
			if maxf(ax, bx) < bx0 - 8.0 or minf(ax, bx) > bx1 + 8.0 or maxf(az, bz) < bz0 - 8.0 or minf(az, bz) > bz1 + 8.0:
				if cur_run.size() >= 2:
					runs.append(cur_run)
				cur_run = []
				arc += seg_len
				continue
			var n_sub := maxi(1, int(ceil(seg_len / sub_step)))
			for k in range(n_sub + 1):
				if k == 0 and not cur_run.is_empty():
					continue
				var t := float(k) / float(n_sub)
				var sx := lerpf(ax, bx, t)
				var sz := lerpf(az, bz, t)
				var sarc := arc + seg_len * t
				var in_box := sx >= bx0 - 0.5 and sx <= bx1 + 0.5 and sz >= bz0 - 0.5 and sz <= bz1 + 0.5
				if in_box and not excl_boxes.is_empty():
					for eb in excl_boxes:
						if sx > float(eb[0]) + 0.5 and sx < float(eb[2]) - 0.5 and sz > float(eb[1]) + 0.5 and sz < float(eb[3]) - 0.5:
							in_box = false
							break
				if in_box and not mon_spec.is_empty():
					var mlp := _monastery_local(mon_spec, sx, sz)
					var mb: Array = mon_spec["box"]
					if mlp.x > float(mb[0]) + 16.0 and mlp.x < float(mb[2]) - 16.0 and mlp.y > float(mb[1]) + 16.0 and mlp.y < float(mb[3]) - 16.0:
						in_box = false
				if in_box:
					cur_run.append(Vector3(sx, sarc, sz))
				else:
					if cur_run.size() >= 2:
						runs.append(cur_run)
					cur_run = []
			arc += seg_len
		if cur_run.size() >= 2:
			runs.append(cur_run)
		if runs.is_empty():
			continue

		road_ids.append(str(rd.get("id", "")))
		var hw := 3.0 if str(rd.get("kind", "")) == "link" else 2.1
		var sh := 1.25
		var lats := [-hw - sh, -hw, 0.0, hw, hw + sh]
		var uvxs := [-1.42, -1.0, 0.0, 1.0, 1.42]

		for run in runs:
			var rpts: Array = run
			var nr := rpts.size()
			var row_nrms := []
			var deck_y := PackedFloat32Array()
			deck_y.resize(nr)
			for i in nr:
				var p_prev: Vector3 = rpts[maxi(0, i - 1)]
				var p_next: Vector3 = rpts[mini(nr - 1, i + 1)]
				var tx := p_next.x - p_prev.x
				var tz := p_next.z - p_prev.z
				var tl := sqrt(tx * tx + tz * tz)
				var rn := Vector2(-tz / tl, tx / tl) if tl > 1e-4 else Vector2(1.0, 0.0)
				row_nrms.append(rn)
				var p: Vector3 = rpts[i]
				var ymax := -INF
				for s_mul in [-1.0, -0.5, 0.0, 0.5, 1.0]:
					var th := terrain_tri_height(mi, (p.x + rn.x * hw * s_mul) - ox, (p.z + rn.y * hw * s_mul) - oz)
					if is_finite(th):
						ymax = maxf(ymax, th)
				deck_y[i] = (ymax if is_finite(ymax) else 0.0) + 0.09
			# Lift adjacent row pairs over any intervening terrain diagonal/ridge midpoint so no chord dips under Terrain
			for i in range(nr - 1):
				var pa: Vector3 = rpts[i]
				var pb: Vector3 = rpts[i + 1]
				var rna: Vector2 = row_nrms[i]
				var rnb: Vector2 = row_nrms[i + 1]
				var rnm := (rna + rnb).normalized() if (rna + rnb).length() > 1e-4 else rna
				var mx := 0.5 * (pa.x + pb.x)
				var mz := 0.5 * (pa.z + pb.z)
				var mid_max := -INF
				for s_mul in [-1.0, 0.0, 1.0]:
					var th := terrain_tri_height(mi, (mx + rnm.x * hw * s_mul) - ox, (mz + rnm.y * hw * s_mul) - oz)
					if is_finite(th):
						mid_max = maxf(mid_max, th)
				if is_finite(mid_max):
					var need := mid_max + 0.08 - 0.5 * (deck_y[i] + deck_y[i + 1])
					if need > 0.0:
						deck_y[i] += need
						deck_y[i + 1] += need

			var base_v := verts.size()
			for i in nr:
				var p: Vector3 = rpts[i]
				var rn: Vector2 = row_nrms[i]
				var dy := deck_y[i]
				for c in 5:
					var lat_d := float(lats[c])
					var lx := (p.x + rn.x * lat_d) - ox
					var lz := (p.z + rn.y * lat_d) - oz
					var vy := dy
					if c == 1 or c == 3:
						vy = dy - 0.02
					elif c == 0 or c == 4:
						var toe_h := terrain_tri_height(mi, lx, lz)
						vy = (toe_h if is_finite(toe_h) else (dy - 0.12)) + 0.015
					verts.append(Vector3(lx, vy - oy, lz))
					norms.append(Vector3.UP)
					uvs.append(Vector2(float(uvxs[c]), p.y))
			for i in range(nr - 1):
				for c in 4:
					var a := base_v + i * 5 + c
					var b := a + 5
					# Clockwise seen from above (+Y): Godot front face
					indices.append_array([a, a + 1, b, a + 1, b + 1, b])
			total_rows += nr
			run_count += 1

	if indices.is_empty():
		return
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = verts
	arr[Mesh.ARRAY_NORMAL] = norms
	arr[Mesh.ARRAY_TEX_UV] = uvs
	arr[Mesh.ARRAY_INDEX] = indices
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	var rmat := ShaderMaterial.new()
	rmat.shader = ROAD_SHADER
	mesh.surface_set_material(0, rmat)
	var rmi := MeshInstance3D.new()
	rmi.name = "RoadRibbon"
	rmi.mesh = mesh
	rmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	rmi.position.y = 0.0
	rmi.set_meta("krator_roads", {"roads": road_ids, "runs": run_count, "rows": total_rows, "spans_skipped": spans_skipped})
	w.add_child(rmi)


static func _is_foliage_bucket(b: MeshInstance3D) -> bool:
	var sm := b.material_override as ShaderMaterial
	if sm == null:
		return false
	if sm.shader == KratorBiome.FOLIAGE:
		return true
	if sm.shader == KratorKmat.LIB:
		var at_p = sm.get_shader_parameter("alpha_test")
		if (at_p is int or at_p is float) and float(at_p) > 0.0:
			var rids: PackedStringArray = b.get_meta("krator_record_ids", PackedStringArray())
			return rids.is_empty()
	return false


static func collide_case(w: Node3D) -> void:
	var g = w.get_meta("ground") if w.has_meta("ground") else null
	var g_mi: MeshInstance3D = g as MeshInstance3D if g is MeshInstance3D else (g.get_node_or_null("Terrain") as MeshInstance3D if g is Node3D else null)
	if g_mi != null and g_mi.mesh != null and g_mi.get_node_or_null("Collision") == null:
		var gshape := g_mi.mesh.create_trimesh_shape()
		if gshape != null:
			gshape.backface_collision = true
			var gbody := StaticBody3D.new()
			gbody.name = "Collision"
			var gcs := CollisionShape3D.new()
			gcs.shape = gshape
			gbody.add_child(gcs)
			g_mi.add_child(gbody)
	var bk := w.get_node_or_null("Buckets")
	if bk:
		for b in bk.get_children():
			if b is MeshInstance3D and (b as MeshInstance3D).mesh != null and not _is_foliage_bucket(b as MeshInstance3D):
				if (b as MeshInstance3D).get_node_or_null("Collision") != null:
					continue
				var shape: Shape3D = (b as MeshInstance3D).mesh.create_trimesh_shape()
				if shape == null:
					continue
				var body := StaticBody3D.new()
				body.name = "Collision"
				var cs := CollisionShape3D.new()
				cs.shape = shape
				body.add_child(cs)
				(b as MeshInstance3D).add_child(body)


func arcology(p: Dictionary, w: Node3D) -> Node3D:
	var A: Dictionary = p["arcology"]
	var a := KratorWorld.build(dir + "/" + str(A["case"]) + "/world.json")
	a.name = "Arcology"
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var at: Array = A["at"]
	a.transform = Transform3D(Basis(Vector3.UP, float(A["ry"])), Vector3(float(at[0]) - float(o[0]), float(at[1]) - float(o[1]), float(at[2]) - float(o[2])))
	a.set_meta("arcology", A)
	return a


# Longsong Monastery (settlements/longsong -> places/sq80bzd7ep-monastery): seated at pin, turned by ry (-LS.SITE.rot),
# its skirt blended smoothly into Place_sq80bzd7ep's valley apron and overlapping wild valley flora/ground cut away
func monastery(p: Dictionary, w: Node3D) -> Node3D:
	var M: Dictionary = p["monastery"]
	var m := KratorWorld.build(dir + "/" + str(M["case"]) + "/world.json")
	m.name = "Monastery"
	var atm_n := m.get_node_or_null("Atmos")
	if atm_n != null:
		m.remove_child(atm_n)
		atm_n.free()
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var at: Array = M["at"]
	var ry := float(M["ry"])
	m.transform = Transform3D(Basis(Vector3.UP, ry), Vector3(float(at[0]) - float(o[0]), float(at[1]) - float(o[1]), float(at[2]) - float(o[2])))
	m.set_meta("monastery", M)

	# Blend the outer 28 m skirt of Monastery's ground mesh smoothly into Place_sq80bzd7ep's 8 m terrain
	var pg := (w.get_meta("ground") if w.has_meta("ground") else null) as MeshInstance3D
	var mg_node: Node3D = m.get_meta("ground") if m.has_meta("ground") else null
	var mg_mi: MeshInstance3D = mg_node as MeshInstance3D if mg_node is MeshInstance3D else (mg_node.get_node_or_null("Terrain") as MeshInstance3D if mg_node != null else null)
	var mbox: Array = M.get("box", [])
	if pg != null and mg_mi != null and mg_mi.mesh != null and mbox.size() == 4:
		var mo: Array = m.get_meta("origin", [0.0, 0.0, 0.0])
		var rot_b := Basis(Vector3.UP, ry)
		var arr := mg_mi.mesh.surface_get_arrays(0)
		var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
		var band := 28.0
		var changed := false
		for i in V.size():
			var lv := V[i]
			var lx := float(lv.x) + float(mo[0])
			var lz := float(lv.z) + float(mo[2])
			var d_edge := minf(minf(lx - float(mbox[0]), float(mbox[2]) - lx), minf(lz - float(mbox[1]), float(mbox[3]) - lz))
			if d_edge < band:
				var t := clampf(d_edge / band, 0.0, 1.0)
				t = t * t * (3.0 - 2.0 * t)
				var rw := rot_b * Vector3(lx, 0.0, lz)
				var wx := float(at[0]) + rw.x
				var wz := float(at[2]) + rw.z
				var ph := terrain_tri_height(pg, wx - float(o[0]), wz - float(o[2])) + float(o[1])
				if is_finite(ph):
					var target_ly := (ph - float(at[1])) - float(mo[1])
					lv.y = lerpf(target_ly, lv.y, t)
					V[i] = lv
					changed = true
		if changed:
			arr[Mesh.ARRAY_VERTEX] = V
			arr[Mesh.ARRAY_TANGENT] = null
			var smat := mg_mi.mesh.surface_get_material(0)
			var nmesh := ArrayMesh.new()
			nmesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
			nmesh.surface_set_material(0, smat)
			mg_mi.mesh = nmesh
	return m


func _hole_place_under_monastery(w: Node3D, M: Dictionary) -> void:
	var mbox: Array = M.get("box", [])
	if mbox.size() < 4:
		return
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var inset := 18.0
	var mi := (w.get_meta("ground") if w.has_meta("ground") else null) as MeshInstance3D
	if mi != null and mi.mesh != null:
		var arr := mi.mesh.surface_get_arrays(0)
		var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
		var I: PackedInt32Array = arr[Mesh.ARRAY_INDEX]
		var keep := PackedInt32Array()
		var dropped := 0
		for t in range(0, I.size(), 3):
			var in_all := true
			for k in 3:
				var v := V[I[t + k]]
				var lp := _monastery_local(M, float(v.x) + float(o[0]), float(v.z) + float(o[2]))
				if lp.x < float(mbox[0]) + inset or lp.x > float(mbox[2]) - inset or lp.y < float(mbox[1]) + inset or lp.y > float(mbox[3]) - inset:
					in_all = false
					break
			if in_all:
				dropped += 1
				continue
			keep.append(I[t]); keep.append(I[t + 1]); keep.append(I[t + 2])
		if dropped > 0:
			arr[Mesh.ARRAY_INDEX] = keep
			arr[Mesh.ARRAY_TANGENT] = null
			var mat := mi.mesh.surface_get_material(0)
			var m := ArrayMesh.new()
			m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
			m.surface_set_material(0, mat)
			mi.mesh = m
			mi.set_meta("monastery_hole", dropped)

	# Hide wild valley flora instances inside the monastery's walled grounds (preserving krator_records UIDs on kept instances)
	var items := w.get_node_or_null("Items")
	if items != null:
		for child in items.get_children():
			if not (child is MultiMeshInstance3D):
				continue
			var mmi := child as MultiMeshInstance3D
			if str((mmi.get_meta("krator", {}) as Dictionary).get("kit", "")) != "flora":
				continue
			var mm := mmi.multimesh
			if mm == null or mm.instance_count == 0:
				continue
			var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
			var buf := mm.buffer
			var tf := Transform3D.IDENTITY
			var pnode: Node = mmi
			while pnode != null and pnode != w:
				if pnode is Node3D:
					tf = (pnode as Node3D).transform * tf
				pnode = pnode.get_parent()
			var has_uids := mmi.has_meta("krator_records")
			var old_uids: PackedStringArray = mmi.get_meta("krator_records", PackedStringArray())
			var old_idx: PackedInt32Array = mmi.get_meta("krator_index", PackedInt32Array())
			var new_buf := PackedFloat32Array()
			var new_uids := PackedStringArray()
			var new_idx := PackedInt32Array()
			var kept := 0
			for i in mm.instance_count:
				var b0 := i * stride
				var lpos := tf * Vector3(buf[b0 + 3], buf[b0 + 7], buf[b0 + 11])
				var lp := _monastery_local(M, float(lpos.x) + float(o[0]), float(lpos.z) + float(o[2]))
				if lp.x >= float(mbox[0]) - 4.0 and lp.x <= float(mbox[2]) + 4.0 and lp.y >= float(mbox[1]) - 4.0 and lp.y <= float(mbox[3]) + 4.0:
					continue
				for q in stride:
					new_buf.append(buf[b0 + q])
				if has_uids and i < old_uids.size():
					new_uids.append(old_uids[i])
				if i < old_idx.size():
					new_idx.append(old_idx[i])
				kept += 1
			if kept < mm.instance_count:
				mm.instance_count = kept
				if kept > 0:
					mm.buffer = new_buf
				else:
					mmi.visible = false
				if has_uids:
					mmi.set_meta("krator_records", new_uids)
				if not old_idx.is_empty():
					mmi.set_meta("krator_index", new_idx)
				var km: Dictionary = (mmi.get_meta("krator", {}) as Dictionary).duplicate()
				km["count"] = kept
				mmi.set_meta("krator", km)


# ---------------------------------------------------------------- Dual-LOD 3D StreamFlora (Hero lv=2 <= 240 m, Mid lv=1 <= 2600 m)
func _ensure_flora_lib() -> void:
	if _flora_lib_ready:
		return
	_flora_lib_ready = true
	var pjson := dir + "/flora/protos.json"
	var wjson := dir + "/flora/world.json"
	if not FileAccess.file_exists(pjson) or not FileAccess.file_exists(wjson):
		return
	var pd = KData.read_json(pjson)
	if not (pd is Dictionary) or not (pd.get("protos") is Array):
		return
	var meta_by_key := {}
	for pr in pd["protos"]:
		if pr is Dictionary and pr.has("key"):
			meta_by_key[str(pr["key"])] = pr
	var lib_w := KratorWorld.build(wjson)
	var items := lib_w.get_node_or_null("Items")
	if items != null:
		for child in items.get_children():
			if not (child is MultiMeshInstance3D):
				continue
			var mmi := child as MultiMeshInstance3D
			var km: Dictionary = mmi.get_meta("krator", {})
			var nm := str(km.get("name", ""))
			if not nm.begins_with("flora/"):
				continue
			var parts_s := nm.split("/")
			if parts_s.size() < 2:
				continue
			var pkey := str(parts_s[1])
			var pm: Dictionary = meta_by_key.get(pkey, {})
			if not _flora_protos.has(pkey):
				_flora_protos[pkey] = {
					"H": float(pm.get("H", 10.0)),
					"crown_r": float(pm.get("crownR", 4.0)),
					"parts": []
				}
			var mm := mmi.multimesh
			if mm != null and mm.mesh != null:
				(_flora_protos[pkey]["parts"] as Array).append({
					"mesh": mm.mesh,
					"material": mmi.material_override,
					"use_colors": mm.use_colors,
					"krator": km.duplicate()
				})
	lib_w.free()


func _ensure_flora_pool(pkey: String) -> Array:
	if _stream_flora_pools.has(pkey):
		return _stream_flora_pools[pkey]
	var proto: Dictionary = _flora_protos.get(pkey, {})
	var parts: Array = proto.get("parts", [])
	var nodes := []
	var lv := 2 if (pkey.ends_with("|2") or pkey.ends_with("|s")) else 1
	for pi in parts.size():
		var pt: Dictionary = parts[pi]
		var mmi := MultiMeshInstance3D.new()
		mmi.name = ("Flora_%s_%d" % [pkey.replace("|", "_"), pi]).validate_node_name()
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.use_colors = bool(pt.get("use_colors", false))
		mm.use_custom_data = false
		mm.mesh = pt["mesh"]
		mm.instance_count = 0
		mmi.multimesh = mm
		mmi.material_override = pt["material"]
		mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if lv == 2 else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		mmi.visible = false
		mmi.set_meta("flora_key", pkey)
		mmi.set_meta("flora_lv", lv)
		mmi.set_meta("krator", pt.get("krator", {}))
		_stream_flora_root.add_child(mmi)
		nodes.append(mmi)
	_stream_flora_pools[pkey] = nodes
	return nodes


func set_flora_visible(on: bool) -> void:
	flora_enabled = on
	if _stream_flora_root != null:
		_stream_flora_root.visible = on


func refresh_flora_at(cam_reg: Vector3, hero_r := 240.0, mid_r := 2600.0) -> Dictionary:
	_last_flora_cam = cam_reg
	if not flora_enabled or _stream_flora_root == null:
		for pkey in _stream_flora_pools:
			for mi in _stream_flora_pools[pkey]:
				(mi as MultiMeshInstance3D).multimesh.instance_count = 0
				(mi as MultiMeshInstance3D).visible = false
		return {"hero": 0, "mid": 0, "pools": 0}
	_ensure_flora_lib()
	if _flora_protos.is_empty():
		return {"hero": 0, "mid": 0, "pools": 0}

	var bufs := {}   # pkey -> Array of floats (reference type: O(1) in-place append, converted once via PackedFloat32Array)
	var cnts := {}   # pkey -> int
	var hero_n := 0
	var mid_n := 0
	var mid_r2 := mid_r * mid_r

	var sources := []
	for cid in _chunk_flora:
		var ft: Dictionary = _chunk_flora[cid]
		var fb: Array = ft["box"]
		if box_dist(fb, cam_reg.x, cam_reg.z) <= mid_r + 64.0:
			sources.append(ft)
	for pid in _place_flora:
		if places_open.has(pid):
			var ft: Dictionary = _place_flora[pid]
			var fb: Array = ft["box"]
			if box_dist(fb, cam_reg.x, cam_reg.z) <= mid_r + 64.0:
				sources.append(ft)

	var ox_s := float(origin[0])
	var oy_s := float(origin[1])
	var oz_s := float(origin[2])
	var cx_cam := cam_reg.x
	var cy_cam := cam_reg.y
	var cz_cam := cam_reg.z
	for ft in sources:
		var fo: Array = ft["origin"]
		var fox := float(fo[0])
		var foz := float(fo[2])
		var keys: Array = ft["keys"]
		var nkeys := keys.size()
		var D: PackedFloat32Array = ft["data"]
		var nrows := D.size() / 6
		for i in nrows:
			var o6 := i * 6
			var rx := fox + D[o6]
			var dx := rx - cx_cam
			if dx > mid_r or dx < -mid_r:
				continue
			var rz := foz + D[o6 + 2]
			var dz := rz - cz_cam
			if dz > mid_r or dz < -mid_r:
				continue
			var ry := D[o6 + 1]
			var dy := ry - cy_cam
			var d2 := dx * dx + dy * dy + dz * dz
			if d2 > mid_r2:
				continue
			var ki := int(D[o6 + 5])
			if ki < 0 or ki >= nkeys:
				continue
			var d := sqrt(d2)
			var bk := str(keys[ki])
			var pkey := ""
			var is_hero := false
			if bk.ends_with("|s"):
				if d > hero_r * 1.2:
					continue
				pkey = bk
				is_hero = true
			elif d <= hero_r:
				pkey = bk + "|2"
				if not _flora_protos.has(pkey):
					pkey = bk + "|1"
				is_hero = pkey.ends_with("|2")
			else:
				pkey = bk + "|1"
				if not _flora_protos.has(pkey):
					pkey = bk + "|2"
				is_hero = pkey.ends_with("|2")
			if not _flora_protos.has(pkey):
				continue
			var proto: Dictionary = _flora_protos[pkey]
			var sc := clampf(D[o6 + 4] / maxf(float(proto["H"]), 0.25), 0.12, 8.0)
			var rot := D[o6 + 3]
			var cr := cos(rot) * sc
			var sr := sin(rot) * sc
			var lx := rx - ox_s
			var ly := ry - oy_s
			var lz := rz - oz_s
			var list_b: Array
			if bufs.has(pkey):
				list_b = bufs[pkey]
			else:
				list_b = []
				bufs[pkey] = list_b
				cnts[pkey] = 0
			list_b.append(cr); list_b.append(0.0); list_b.append(sr); list_b.append(lx)
			list_b.append(0.0); list_b.append(sc); list_b.append(0.0); list_b.append(ly)
			list_b.append(-sr); list_b.append(0.0); list_b.append(cr); list_b.append(lz)
			cnts[pkey] = int(cnts[pkey]) + 1
			if is_hero:
				hero_n += 1
			else:
				mid_n += 1

	for pkey in _stream_flora_pools:
		if not cnts.has(pkey):
			for mi in _stream_flora_pools[pkey]:
				(mi as MultiMeshInstance3D).multimesh.instance_count = 0
				(mi as MultiMeshInstance3D).visible = false
	var active_pools := 0
	for pkey in cnts:
		var n_inst: int = int(cnts[pkey])
		var nodes := _ensure_flora_pool(pkey)
		if nodes.is_empty():
			continue
		var raw12 := PackedFloat32Array(bufs[pkey] as Array)
		for mi in nodes:
			var mmi := mi as MultiMeshInstance3D
			var mm := mmi.multimesh
			mm.instance_count = n_inst
			if mm.use_colors:
				var cbuf := PackedFloat32Array()
				cbuf.resize(n_inst * 16)
				for j in n_inst:
					var s0 := j * 12
					var d0 := j * 16
					for q in 12:
						cbuf[d0 + q] = raw12[s0 + q]
					cbuf[d0 + 12] = 1.0; cbuf[d0 + 13] = 1.0; cbuf[d0 + 14] = 1.0; cbuf[d0 + 15] = 1.0
				mm.buffer = cbuf
			else:
				mm.buffer = raw12
			mmi.visible = n_inst > 0 and flora_enabled
		if n_inst > 0:
			active_pools += 1
	return {"hero": hero_n, "mid": mid_n, "pools": active_pools}
