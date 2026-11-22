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
var _road_hash_ready := false
var _road_hash := {}          # cell_key -> Array of [ax, az, bx, bz, clear_r2]
var _built_hash_n := -1
var _built_vols := []         # Array of [x, z, r2] for village footprints & arcology
var _mon_specs := []          # Array of Monastery Dictionaries
var _last_gnrm := Vector3.UP


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


func _load_flora_table(f_path: String, fallback_box: Array, ground_mi: MeshInstance3D = null, case_origin: Array = [0.0, 0.0, 0.0]) -> Dictionary:
	if not FileAccess.file_exists(f_path):
		return {}
	var fd = KData.read_json(f_path)
	if not (fd is Dictionary) or fd.get("format") != "krator-chunk-flora" or not (fd.get("data") is Dictionary):
		return {}
	var fbox: Array = fd.get("box", fallback_box)
	var fo: Array = fd.get("origin", [0.0, 0.0, 0.0])
	var fox := float(fo[0])
	var foz := float(fo[2])
	var bx0 := float(fbox[0])
	var bz0 := float(fbox[1])
	var span_x := maxf(1.0, float(fbox[2]) - bx0)
	var span_z := maxf(1.0, float(fbox[3]) - bz0)
	var cox := float(case_origin[0])
	var coy := float(case_origin[1])
	var coz := float(case_origin[2])
	var data_dict: Dictionary = fd["data"]
	var dtype := str(data_dict.get("type", "Float32Array"))
	var D := PackedFloat32Array()
	var cnt := int(fd.get("count", 0))
	if dtype == "Uint16Array":
		var raw := KData.raw(data_dict)
		if cnt <= 0:
			cnt = raw.size() / 8
		D.resize(cnt * 6)
		for i in cnt:
			var b8 := i * 8
			var rx := bx0 + (float(raw.decode_u16(b8)) / 65535.0) * span_x
			var rz := bz0 + (float(raw.decode_u16(b8 + 2)) / 65535.0) * span_z
			var rot := (float(raw.decode_u16(b8 + 4)) / 65535.0) * TAU
			var u3 := raw.decode_u16(b8 + 6)
			var ht := float((u3 >> 8) & 0xFF) / 2.5
			var ki := float(u3 & 0xFF)
			var ry := 0.0
			if ground_mi != null:
				var th := terrain_tri_height(ground_mi, rx - cox, rz - coz)
				ry = (th + coy - 0.25) if is_finite(th) else 0.0
			var o6 := i * 6
			D[o6] = rx - fox
			D[o6 + 1] = ry
			D[o6 + 2] = rz - foz
			D[o6 + 3] = rot
			D[o6 + 4] = ht
			D[o6 + 5] = ki
	else:
		D = KData.floats(data_dict)
		cnt = D.size() / 6
		if ground_mi != null:
			for i in cnt:
				var o6 := i * 6
				var rx := fox + D[o6]
				var rz := foz + D[o6 + 2]
				var th := terrain_tri_height(ground_mi, rx - cox, rz - coz)
				if is_finite(th):
					D[o6 + 1] = th + coy - 0.25
	var sub_n := int(fd.get("subN", 0))
	var offs := PackedInt32Array()
	if sub_n > 0 and fd.get("cellOffsets") is Array:
		var raw_offs: Array = fd["cellOffsets"]
		offs.resize(raw_offs.size())
		for k in raw_offs.size():
			offs[k] = int(raw_offs[k])
	return {
		"origin": fo,
		"keys": fd.get("keys", []),
		"data": D,
		"count": cnt,
		"box": fbox,
		"sub_n": sub_n,
		"offs": offs,
		"covered": str(fd.get("covered", ""))
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
	var cg := (w.get_meta("ground", null) if w.has_meta("ground") else null) as MeshInstance3D
	var co: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var ft := _load_flora_table(dir + "/" + cpath + "/flora.json", cbox, cg, co)
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
	var pg := (w.get_meta("ground", null) if w.has_meta("ground") else null) as MeshInstance3D
	var po: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var ft := _load_flora_table(dir + "/" + pcase + "/flora.json", p["box"], pg, po)
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


static func _is_nonstructural_bucket(b: MeshInstance3D) -> bool:
	if _is_foliage_bucket(b):
		return true
	if b.material_override is StandardMaterial3D and (b.material_override as StandardMaterial3D).transparency != BaseMaterial3D.TRANSPARENCY_DISABLED:
		return true
	var km: Dictionary = b.get_meta("krator", {}) if b.has_meta("krator") else {}
	var bnm := str(km.get("name", "")).split("~")[0]
	return bnm in ["rug", "books", "mural", "valance", "twig", "mosaic", "glyph", "glow", "cloth", "v-cloth", "v-mandala", "gilt", "v-gilt", "v-glyphband", "v-field", "still", "pane"]


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
			if b is MeshInstance3D and (b as MeshInstance3D).mesh != null and not _is_nonstructural_bucket(b as MeshInstance3D):
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
	var ipath := str(M.get("interiors", M["case"] + "/interiors.json"))
	if FileAccess.file_exists(dir + "/" + ipath):
		var imeta = KData.read_json(dir + "/" + ipath)
		if imeta is Dictionary:
			m.set_meta("interiors_meta", imeta)
	var m_items := m.get_node_or_null("Items")
	if m_items != null:
		for ch in m_items.get_children():
			if ch is MultiMeshInstance3D:
				var km: Dictionary = (ch as Node).get_meta("krator", {}) if (ch as Node).has_meta("krator") else {}
				if str(km.get("kit", "")) == "furniture":
					var fmmi := ch as MultiMeshInstance3D
					fmmi.visibility_range_end = 185.0
					fmmi.visibility_range_end_margin = 20.0
					fmmi.visibility_range_fade_mode = GeometryInstance3D.VISIBILITY_RANGE_FADE_DISABLED
					fmmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
					var fmm := fmmi.multimesh
					if fmm != null and fmm.instance_count > 0:
						var fstride := 12 + (4 if fmm.use_colors else 0) + (4 if fmm.use_custom_data else 0)
						var fbuf := fmm.buffer
						var pts := PackedVector3Array()
						pts.resize(fmm.instance_count)
						for fi in fmm.instance_count:
							var fo := fi * fstride
							pts[fi] = Vector3(fbuf[fo + 3], fbuf[fo + 7], fbuf[fo + 11])
						fmmi.set_meta("furn_pts", pts)

	# Blend the outer 28 m skirt of Monastery's ground mesh smoothly into Place_sq80bzd7ep's 8 m terrain, and open Deep Stair shaft
	var pg := (w.get_meta("ground") if w.has_meta("ground") else null) as MeshInstance3D
	var mg_node: Node3D = m.get_meta("ground") if m.has_meta("ground") else null
	var mg_mi: MeshInstance3D = mg_node as MeshInstance3D if mg_node is MeshInstance3D else (mg_node.get_node_or_null("Terrain") as MeshInstance3D if mg_node != null else null)
	var mbox: Array = M.get("box", [])
	var dstair: Array = M.get("deep_stair", [40.0, 96.0, 48.0, 150.0])
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
			if lx >= -91.5 and lx <= 91.5 and lz >= 11.4 and lz <= 20.0:
				var min_terrace_y := 40.04 - float(mo[1])
				if lv.y < min_terrace_y:
					lv.y = min_terrace_y
					V[i] = lv
					changed = true
		var I_arr: PackedInt32Array = arr[Mesh.ARRAY_INDEX]
		if dstair.size() == 4 and not I_arr.is_empty():
			var ds_x0 := float(dstair[0]) + 0.1
			var ds_z0 := float(dstair[1]) + 0.1
			var ds_x1 := float(dstair[2]) - 0.1
			var ds_z1 := float(dstair[3]) - 0.1
			var keep_i := PackedInt32Array()
			var dropped_ds := 0
			for ti in range(0, I_arr.size(), 3):
				var va := V[I_arr[ti]]; var vb := V[I_arr[ti + 1]]; var vc := V[I_arr[ti + 2]]
				var cx := (va.x + vb.x + vc.x) / 3.0 + float(mo[0])
				var cz := (va.z + vb.z + vc.z) / 3.0 + float(mo[2])
				if cx >= ds_x0 and cx <= ds_x1 and cz >= ds_z0 and cz <= ds_z1:
					dropped_ds += 1
					continue
				keep_i.append(I_arr[ti]); keep_i.append(I_arr[ti + 1]); keep_i.append(I_arr[ti + 2])
			if dropped_ds > 0:
				arr[Mesh.ARRAY_INDEX] = keep_i
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


# Returns {id, vault: bool, floor_reg_y: float} when reg_pos stands inside a Longsong Monastery room or subterranean Vault chamber
func monastery_room_at(reg_pos: Vector3, slack := 0.55) -> Dictionary:
	for pid in places_open:
		var pw: Node3D = places_open[pid]
		var mon := pw.get_node_or_null("Monastery") as Node3D
		if mon == null or not mon.has_meta("interiors_meta") or not mon.has_meta("monastery"):
			continue
		var M: Dictionary = mon.get_meta("monastery")
		var imeta: Dictionary = mon.get_meta("interiors_meta")
		var mat: Array = M.get("at", [0.0, 0.0, 0.0])
		var m_orig := Vector3(float(mat[0]), float(mat[1]), float(mat[2]))
		var lp := Basis(Vector3.UP, -float(M.get("ry", 0.0))) * (reg_pos - m_orig)
		if absf(lp.x) > 400.0 or absf(lp.z) > 400.0:
			continue
		for r in imeta.get("rooms", []):
			if not (r is Dictionary) or not (r.get("box") is Array):
				continue
			var b: Array = r["box"]
			if lp.y < float(b[1]) - slack or lp.y > float(b[4]) + slack:
				continue
			if lp.x < float(b[0]) - slack or lp.x > float(b[3]) + slack or lp.z < float(b[2]) - slack or lp.z > float(b[5]) + slack:
				continue
			if r.get("circle") is Array:
				var c: Array = r["circle"]
				var rad := float(c[2]) + slack
				if Vector2(lp.x - float(c[0]), lp.z - float(c[1])).length_squared() > rad * rad:
					continue
			return {
				"id": str(r.get("id", "")),
				"vault": bool(r.get("vault", false)),
				"floor_reg_y": m_orig.y + float(b[1]),
				"ceil_reg_y": m_orig.y + float(b[4])
			}
	return {}


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
	var is_ug := pkey.begins_with("ug|")
	var lv := 2 if (is_ug or pkey.ends_with("|2") or pkey.ends_with("|s")) else 1
	var cast_sh := (not is_ug and lv == 2) or pkey.begins_with("ug|oid_boulder") or pkey.begins_with("ug|oid_stones")
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
		mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if cast_sh else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
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


static func _ug_mul32(a: int, b: int) -> int:
	return (a * (b & 0xFFFF) + (((a * (b >> 16)) & 0xFFFF) << 16)) & 0xFFFFFFFF


static func _ug_hash(x: int, z: int, s: int) -> int:
	var h := _ug_mul32(x & 0xFFFFFFFF, 1597334677) ^ _ug_mul32(z & 0xFFFFFFFF, 3812015801) ^ _ug_mul32(s & 0xFFFFFFFF, 2654435769)
	h ^= h >> 16
	h = _ug_mul32(h, 2146121005)
	h ^= h >> 15
	h = _ug_mul32(h, 2221713035)
	return (h ^ (h >> 16)) & 0x7FFFFFFF


static func _ug_u01(h: int) -> float:
	return float(h & 0xFFFFFF) / 16777216.0


func _ensure_road_and_built_caches() -> void:
	if not _road_hash_ready:
		_road_hash_ready = true
		_road_hash.clear()
		_mon_specs.clear()
		for p in index.get("places", []):
			if p is Dictionary and p.get("monastery") is Dictionary:
				_mon_specs.append(p["monastery"])
		var cell_s := 64.0
		for rd in index.get("roads", []):
			var pts: Array = rd.get("pts", [])
			var clear_r := 7.5 if str(rd.get("kind", "")) == "link" else 5.5
			var r2 := clear_r * clear_r
			for k in range(pts.size() - 1):
				var ax := float(pts[k][0]); var az := float(pts[k][1])
				var bx := float(pts[k + 1][0]); var bz := float(pts[k + 1][1])
				var gx0 := int(floor((minf(ax, bx) - clear_r) / cell_s))
				var gx1 := int(floor((maxf(ax, bx) + clear_r) / cell_s))
				var gz0 := int(floor((minf(az, bz) - clear_r) / cell_s))
				var gz1 := int(floor((maxf(az, bz) + clear_r) / cell_s))
				var seg := [ax, az, bx, bz, r2]
				for gz in range(gz0, gz1 + 1):
					for gx in range(gx0, gx1 + 1):
						var ck := gx * 100003 + gz
						if not _road_hash.has(ck):
							_road_hash[ck] = []
						(_road_hash[ck] as Array).append(seg)
	if _built_hash_n != places_open.size():
		_built_hash_n = places_open.size()
		_built_vols.clear()
		for pid in places_open:
			var p := place(str(pid))
			if p.get("arcology") is Dictionary and p["arcology"].get("at") is Array:
				var aat: Array = p["arcology"]["at"]
				_built_vols.append([float(aat[0]), float(aat[2]), 520.0 * 520.0])
			var pw: Node3D = places_open[pid]
			var tags: Dictionary = pw.get_meta("tags", {}) if pw.has_meta("tags") else {}
			for rk in tags:
				var rec = tags[rk]
				if rec is Dictionary and rec.get("at") is Array and rec.get("size") is Array:
					var rat: Array = rec["at"]
					var rsz: Array = rec["size"]
					var rad := 0.5 * maxf(float(rsz[0]), float(rsz[1])) + 4.5
					_built_vols.append([float(rat[0]), float(rat[2]), rad * rad])


func _is_clear_for_undergrowth(x: float, z: float, extra_pad := 0.0) -> bool:
	for M in _mon_specs:
		var mbox: Array = M.get("box", [])
		if mbox.size() >= 4:
			var lp := _monastery_local(M, x, z)
			if lp.x >= float(mbox[0]) - 6.0 and lp.x <= float(mbox[2]) + 6.0 and lp.y >= float(mbox[1]) - 6.0 and lp.y <= float(mbox[3]) + 6.0:
				return false
	for bv in _built_vols:
		var dx := x - float(bv[0])
		var dz := z - float(bv[1])
		if dx * dx + dz * dz <= float(bv[2]):
			return false
	var ck := int(floor(x / 64.0)) * 100003 + int(floor(z / 64.0))
	if _road_hash.has(ck):
		for seg in _road_hash[ck]:
			var ax := float(seg[0]); var az := float(seg[1])
			var vx := float(seg[2]) - ax; var vz := float(seg[3]) - az
			var l2 := vx * vx + vz * vz
			var t := clampf(((x - ax) * vx + (z - az) * vz) / l2, 0.0, 1.0) if l2 > 1e-4 else 0.0
			var px := ax + vx * t - x
			var pz := az + vz * t - z
			var lim2 := float(seg[4]) + extra_pad * extra_pad
			if px * px + pz * pz <= lim2:
				return false
	return true


# Returns Vector4(ground_y, rock_w, wet_or_submerged, slope) and updates _last_gnrm; ground_y is NAN if unloaded
func _sample_surface_at(x: float, z: float) -> Vector4:
	var mi: MeshInstance3D = null
	var ox := 0.0; var oy := 0.0; var oz := 0.0
	var pid := place_covering(x, z)
	if pid != "":
		var pw: Node3D = places_open[pid]
		mi = (pw.get_meta("ground", null) if pw.has_meta("ground") else null) as MeshInstance3D
		var po: Array = pw.get_meta("origin", [0.0, 0.0, 0.0])
		ox = float(po[0]); oy = float(po[1]); oz = float(po[2])
	else:
		var cid := covering(x, z)
		if cid != "":
			var cw: Node3D = chunks[cid]
			mi = (cw.get_meta("ground", null) if cw.has_meta("ground") else null) as MeshInstance3D
			var co: Array = cw.get_meta("origin", [0.0, 0.0, 0.0])
			ox = float(co[0]); oy = float(co[1]); oz = float(co[2])
	if mi == null or not mi.has_meta("grid"):
		_last_gnrm = Vector3.UP
		return Vector4(NAN, 0.0, 0.0, 0.0)
	var lx := x - ox
	var lz := z - oz
	var gy := terrain_tri_height(mi, lx, lz)
	if not is_finite(gy):
		_last_gnrm = Vector3.UP
		return Vector4(NAN, 0.0, 0.0, 0.0)
	gy += oy
	var g: Dictionary = mi.get_meta("grid")
	var nx := int(g["nx"])
	var nz := int(g["nz"])
	var step_m := float(g["step"])
	var gi := clampi(int(roundf((lx - float(g["x0"])) / step_m)), 0, nx - 1)
	var gj := clampi(int(roundf((lz - float(g["z0"])) / step_m)), 0, nz - 1)
	var o4 := (gj * nx + gi) * 4
	var ar: PackedByteArray = g.get("ar", PackedByteArray())
	var nc: PackedByteArray = g.get("nc", PackedByteArray())
	var rock_w := float(ar[o4 + 3]) / 255.0 if o4 + 3 < ar.size() else 0.0
	var wet_w := 0.0
	var nrm := Vector3.UP
	if o4 + 3 < nc.size():
		var fnx := (float(nc[o4]) / 255.0) * 2.0 - 1.0
		var fnz := (float(nc[o4 + 1]) / 255.0) * 2.0 - 1.0
		var fny := sqrt(maxf(0.02, 1.0 - fnx * fnx - fnz * fnz))
		nrm = Vector3(fnx, fny, fnz).normalized()
		wet_w = 1.0 if nc[o4 + 3] >= 250 else float(nc[o4 + 3]) / 255.0
	_last_gnrm = nrm
	var slope := 1.0 - clampf(nrm.y, 0.0, 1.0)
	return Vector4(gy, rock_w, wet_w, slope)


func _append_basis_row(bufs: Dictionary, cnts: Dictionary, pkey: String, pos: Vector3, yaw: float, sc: float, nrm: Vector3, tilt_k: float) -> void:
	var up := Vector3.UP.lerp(nrm, tilt_k).normalized()
	var fwd0 := Vector3(sin(yaw), 0.0, cos(yaw))
	var rgt := up.cross(fwd0)
	if rgt.length_squared() < 1e-5:
		rgt = Vector3.RIGHT
	else:
		rgt = rgt.normalized()
	var fwd := rgt.cross(up).normalized()
	rgt *= sc; up *= sc; fwd *= sc
	var list_b: Array
	if bufs.has(pkey):
		list_b = bufs[pkey]
	else:
		list_b = []
		bufs[pkey] = list_b
		cnts[pkey] = 0
	list_b.append(rgt.x); list_b.append(up.x); list_b.append(fwd.x); list_b.append(pos.x)
	list_b.append(rgt.y); list_b.append(up.y); list_b.append(fwd.y); list_b.append(pos.y)
	list_b.append(rgt.z); list_b.append(up.z); list_b.append(fwd.z); list_b.append(pos.z)
	cnts[pkey] = int(cnts[pkey]) + 1


func _append_undergrowth(cam_reg: Vector3, bufs: Dictionary, cnts: Dictionary) -> int:
	if not _flora_protos.has("ug|oid_fern|a") and not _flora_protos.has("ug|hr_tussock|a"):
		return 0
	_ensure_road_and_built_caches()
	var vents: Array = index.get("vents", [])
	var ox_s := float(origin[0])
	var oy_s := float(origin[1])
	var oz_s := float(origin[2])
	var added := 0

	# Pass 1: Lush 3D undergrowth (ferns, mosses, poppies, shrubs, bamboo shoots, alpine cushions, High Rift tussocks/heath/opal cane)
	var cell_u := 6.4
	var rad_u := 188.0
	var rad_u2 := rad_u * rad_u
	var ix0 := int(floor((cam_reg.x - rad_u) / cell_u))
	var ix1 := int(floor((cam_reg.x + rad_u) / cell_u))
	var iz0 := int(floor((cam_reg.z - rad_u) / cell_u))
	var iz1 := int(floor((cam_reg.z + rad_u) / cell_u))
	for iz in range(iz0, iz1 + 1):
		for ix in range(ix0, ix1 + 1):
			var h0 := _ug_hash(ix, iz, 9103)
			var rx := (float(ix) + 0.12 + 0.76 * _ug_u01(h0)) * cell_u
			var rz := (float(iz) + 0.12 + 0.76 * _ug_u01(_ug_hash(ix, iz, 9109))) * cell_u
			var dx := rx - cam_reg.x
			var dz := rz - cam_reg.z
			if dx * dx + dz * dz > rad_u2:
				continue
			var sf := _sample_surface_at(rx, rz)
			var gy := sf.x
			if not is_finite(gy) or sf.z >= 0.98 or sf.w > 0.42 or sf.y > 0.78:
				continue
			if dx * dx + (gy - cam_reg.y) * (gy - cam_reg.y) + dz * dz > rad_u2:
				continue
			var in_place := place_covering(rx, rz) != ""
			var dens := (0.64 if in_place else 0.88) * (1.0 - smoothstep(0.45, 0.78, sf.y)) * (1.0 - smoothstep(0.24, 0.42, sf.w))
			if gy > 4350.0:
				continue
			if gy > 3650.0:
				dens *= 1.0 - smoothstep(3650.0, 4350.0, gy)
			var u_acc := _ug_u01(_ug_hash(ix, iz, 9127))
			if u_acc > dens:
				continue
			if not _is_clear_for_undergrowth(rx, rz, 1.5):
				continue
			var nrm := _last_gnrm
			var u_kind := _ug_u01(_ug_hash(ix, iz, 9137))
			var v_tag := "a" if (_ug_hash(ix, iz, 9151) & 1) == 0 else "b"
			var hr_w := smoothstep(-75000.0, -22000.0, rx)
			var pkey := ""
			if _ug_u01(_ug_hash(ix, iz, 9161)) < hr_w and _flora_protos.has("ug|hr_tussock|a"):
				var vd_ratio := 999.0
				for v in vents:
					var vr := maxf(250.0, float(v[2]))
					var dd := Vector2(rx - float(v[0]), rz - float(v[1])).length() / vr
					if dd < vd_ratio:
						vd_ratio = dd
				if vd_ratio < 1.35:
					pkey = "ug|hr_warm|" + v_tag
				elif vd_ratio < 5.2 or sf.z > 0.36:
					pkey = "ug|hr_heath|" + v_tag
				else:
					pkey = "ug|hr_tussock|" + v_tag
			elif gy > 3080.0 and _ug_u01(_ug_hash(ix, iz, 9173)) < smoothstep(3080.0, 3360.0, gy):
				pkey = "ug|oid_alp|" + v_tag
			else:
				if sf.z > 0.40:
					pkey = ("ug|oid_bamboo|" if u_kind < 0.46 else "ug|oid_fern|") + v_tag
				elif sf.y > 0.28 or sf.z < 0.08:
					pkey = ("ug|oid_flats|" if u_kind < 0.55 else "ug|oid_shrub|") + v_tag
				else:
					if u_kind < 0.36:
						pkey = "ug|oid_fern|" + v_tag
					elif u_kind < 0.70:
						pkey = "ug|oid_meadow|" + v_tag
					elif u_kind < 0.88:
						pkey = "ug|oid_shrub|" + v_tag
					else:
						pkey = "ug|oid_bamboo|" + v_tag
			if not _flora_protos.has(pkey):
				continue
			var yaw := _ug_u01(_ug_hash(ix, iz, 9181)) * TAU
			var sc := 0.78 + 0.52 * _ug_u01(_ug_hash(ix, iz, 9187))
			_append_basis_row(bufs, cnts, pkey, Vector3(rx - ox_s, gy - 0.04 - oy_s, rz - oz_s), yaw, sc, nrm, 0.38)
			added += 1

	# Pass 2: 3D mossy granite boulders, rocky scarp outcrops & standing-stone trios out to 760 m
	if _flora_protos.has("ug|oid_boulder|a"):
		var cell_b := 23.0
		var rad_b := 760.0
		var rad_b2 := rad_b * rad_b
		var bx0 := int(floor((cam_reg.x - rad_b) / cell_b))
		var bx1 := int(floor((cam_reg.x + rad_b) / cell_b))
		var bz0 := int(floor((cam_reg.z - rad_b) / cell_b))
		var bz1 := int(floor((cam_reg.z + rad_b) / cell_b))
		for bz in range(bz0, bz1 + 1):
			for bx in range(bx0, bx1 + 1):
				var hb0 := _ug_hash(bx, bz, 9311)
				var rx := (float(bx) + 0.14 + 0.72 * _ug_u01(hb0)) * cell_b
				var rz := (float(bz) + 0.14 + 0.72 * _ug_u01(_ug_hash(bx, bz, 9319))) * cell_b
				var dx := rx - cam_reg.x
				var dz := rz - cam_reg.z
				if dx * dx + dz * dz > rad_b2:
					continue
				var sf := _sample_surface_at(rx, rz)
				var gy := sf.x
				if not is_finite(gy) or sf.z >= 0.98 or sf.w > 0.55:
					continue
				if dx * dx + (gy - cam_reg.y) * (gy - cam_reg.y) + dz * dz > rad_b2:
					continue
				var b_prob := 0.09 + 0.42 * smoothstep(0.14, 0.58, sf.y) + 0.18 * smoothstep(0.08, 0.32, sf.w)
				if _ug_u01(_ug_hash(bx, bz, 9323)) > b_prob:
					continue
				if not _is_clear_for_undergrowth(rx, rz, 4.0):
					continue
				var nrm := _last_gnrm
				var pkey_b := ""
				if rx < -35000.0 and gy < 3100.0 and sf.w < 0.09 and _ug_u01(_ug_hash(bx, bz, 9337)) < 0.035 and _flora_protos.has("ug|oid_stones|a"):
					pkey_b = "ug|oid_stones|a"
				else:
					pkey_b = "ug|oid_boulder|" + ("a" if (_ug_hash(bx, bz, 9341) & 1) == 0 else "b")
				var yaw := _ug_u01(_ug_hash(bx, bz, 9343)) * TAU
				var sc := (0.68 + 0.95 * _ug_u01(_ug_hash(bx, bz, 9349))) * (1.18 if sf.y > 0.35 else 0.92)
				_append_basis_row(bufs, cnts, pkey_b, Vector3(rx - ox_s, gy - 0.12 * sc - oy_s, rz - oz_s), yaw, sc, nrm, 0.55)
				added += 1
	return added


static func _patch_noise(x: float, z: float, scale_m: float, salt: int) -> float:
	var fx := x / scale_m
	var fz := z / scale_m
	var ix := int(floor(fx))
	var iz := int(floor(fz))
	var u := fx - float(ix)
	var v := fz - float(iz)
	u = u * u * (3.0 - 2.0 * u)
	v = v * v * (3.0 - 2.0 * v)
	var a := _ug_u01(_ug_hash(ix, iz, salt))
	var b := _ug_u01(_ug_hash(ix + 1, iz, salt))
	var c := _ug_u01(_ug_hash(ix, iz + 1, salt))
	var d := _ug_u01(_ug_hash(ix + 1, iz + 1, salt))
	return lerpf(lerpf(a, b, u), lerpf(c, d, u), v)


func _is_subcell_covered(x: float, z: float) -> bool:
	if place_covering(x, z) != "":
		return true
	var cid := covering(x, z)
	if cid == "":
		return true
	if not _chunk_flora.has(cid):
		return false
	var ft: Dictionary = _chunk_flora[cid]
	var cov := str(ft.get("covered", ""))
	if cov == "":
		return true
	var sub_n := int(ft.get("sub_n", 16))
	if sub_n <= 0 or cov.length() < sub_n * sub_n:
		return true
	var fbox: Array = ft["box"]
	var sx := clampi(int(floor((x - float(fbox[0])) / maxf(1.0, float(fbox[2]) - float(fbox[0])) * float(sub_n))), 0, sub_n - 1)
	var sz := clampi(int(floor((z - float(fbox[1])) / maxf(1.0, float(fbox[3]) - float(fbox[1])) * float(sub_n))), 0, sub_n - 1)
	return cov.unicode_at(sz * sub_n + sx) == 49


func _append_wild_forest(cam_reg: Vector3, hero_r: float, mid_r: float, bufs: Dictionary, cnts: Dictionary) -> Vector2i:
	if not _flora_protos.has("0|1|0|2") or cam_reg.x > -15000.0:
		return Vector2i.ZERO
	_ensure_road_and_built_caches()
	var ox_s := float(origin[0])
	var oy_s := float(origin[1])
	var oz_s := float(origin[2])
	var add_hero := 0
	var add_mid := 0
	var inner_r := minf(680.0, mid_r)
	var inner_r2 := inner_r * inner_r

	# Ring 1 (0 .. 680 m, 23 m cell): Full Oidong canopy, flowering cherry/haze, maple, birch, cedar, pine & bamboo groves (Hero <= hero_r, Mid <= 680 m)
	var c1 := 23.0
	var ix0 := int(floor((cam_reg.x - inner_r) / c1))
	var ix1 := int(floor((cam_reg.x + inner_r) / c1))
	var iz0 := int(floor((cam_reg.z - inner_r) / c1))
	var iz1 := int(floor((cam_reg.z + inner_r) / c1))
	for iz in range(iz0, iz1 + 1):
		for ix in range(ix0, ix1 + 1):
			var rx := (float(ix) + 0.14 + 0.72 * _ug_u01(_ug_hash(ix, iz, 9503))) * c1
			var rz := (float(iz) + 0.14 + 0.72 * _ug_u01(_ug_hash(ix, iz, 9509))) * c1
			var dx := rx - cam_reg.x
			var dz := rz - cam_reg.z
			var d2_xz := dx * dx + dz * dz
			if d2_xz > inner_r2 or rx > -22000.0 or _is_subcell_covered(rx, rz):
				continue
			var sf := _sample_surface_at(rx, rz)
			var gy := sf.x
			if not is_finite(gy) or sf.z >= 0.98 or gy > 3380.0 or sf.w > 0.44 or sf.y > 0.72:
				continue
			var patch := _patch_noise(rx, rz, 260.0, 9521)
			var grove := _patch_noise(rx + 410.0, rz - 290.0, 190.0, 9529)
			var tree_line := 1.0 - smoothstep(2920.0, 3380.0, gy)
			var east_fade := 1.0 - smoothstep(-72000.0, -24000.0, rx)
			var dens := 0.74 * tree_line * east_fade * (0.28 + 0.92 * patch) * (1.0 - smoothstep(0.42, 0.72, sf.y)) * (1.0 - smoothstep(0.24, 0.44, sf.w))
			if _ug_u01(_ug_hash(ix, iz, 9533)) > dens:
				continue
			if not _is_clear_for_undergrowth(rx, rz, 3.5):
				continue
			var u_sp := _ug_u01(_ug_hash(ix, iz, 9539))
			var u_ht := _ug_u01(_ug_hash(ix, iz, 9547))
			var sp := 14
			var ht := 18.0
			if sf.z > 0.36:
				if u_sp < 0.28:
					sp = 8; ht = lerpf(13.0, 22.0, u_ht)
				elif u_sp < 0.50:
					sp = 7; ht = lerpf(12.0, 20.0, u_ht)
				elif u_sp < 0.72:
					sp = 11; ht = lerpf(8.5, 14.5, u_ht)
				elif u_sp < 0.88:
					sp = 2; ht = lerpf(9.5, 16.0, u_ht)
				else:
					sp = 10; ht = lerpf(8.0, 13.5, u_ht)
			elif gy > 2580.0 or sf.y > 0.28:
				if u_sp < 0.38:
					sp = 4; ht = lerpf(13.0, 25.0, u_ht)
				elif u_sp < 0.72:
					sp = 16; ht = lerpf(16.0, 29.0, u_ht)
				elif u_sp < 0.90:
					sp = 14; ht = lerpf(16.0, 28.0, u_ht)
				else:
					sp = 3; ht = lerpf(12.0, 21.0, u_ht)
			elif grove > 0.68 and u_sp < 0.58:
				sp = 11; ht = lerpf(8.5, 15.0, u_ht)
			else:
				if u_sp < 0.13:
					sp = 1; ht = lerpf(22.0, 36.0, u_ht)
				elif u_sp < 0.27:
					sp = 14; ht = lerpf(18.0, 31.0, u_ht)
				elif u_sp < 0.39:
					sp = 15; ht = lerpf(18.0, 29.0, u_ht)
				elif u_sp < 0.52:
					sp = 3; ht = lerpf(13.0, 23.0, u_ht)
				elif u_sp < 0.65:
					sp = 2; ht = lerpf(9.5, 16.5, u_ht)
				elif u_sp < 0.76:
					sp = 6; ht = lerpf(10.5, 18.0, u_ht)
				elif u_sp < 0.85:
					sp = 13; ht = lerpf(7.5, 13.0, u_ht)
				elif u_sp < 0.93:
					sp = 12; ht = lerpf(9.0, 15.5, u_ht)
				elif u_sp < 0.992:
					sp = 5; ht = lerpf(8.5, 14.0, u_ht)
				else:
					sp = 18; ht = lerpf(5.5, 9.0, u_ht)
			var v := _ug_hash(ix, iz, 9551) & 3
			var d3 := sqrt(d2_xz + (gy - cam_reg.y) * (gy - cam_reg.y))
			var is_hero := d3 <= hero_r
			var pkey := "0|%d|%d|%s" % [sp, v, "2" if is_hero else "1"]
			if not _flora_protos.has(pkey):
				pkey = "0|%d|%d|%s" % [sp, v, "1" if is_hero else "2"]
				if not _flora_protos.has(pkey):
					continue
				is_hero = pkey.ends_with("|2")
			var proto: Dictionary = _flora_protos[pkey]
			var sc := clampf(ht / maxf(float(proto["H"]), 0.25), 0.15, 6.0)
			var yaw := _ug_u01(_ug_hash(ix, iz, 9563)) * TAU
			_append_basis_row(bufs, cnts, pkey, Vector3(rx - ox_s, gy - 0.25 - oy_s, rz - oz_s), yaw, sc, Vector3.UP, 0.0)
			if is_hero:
				add_hero += 1
			else:
				add_mid += 1

	# Ring 2 (680 m .. mid_r, 54 m cell): Distant Mid (lv=1) canopy trees clothing valleys, slopes, and ridges to 2.8 km
	if mid_r > inner_r + 20.0:
		var c2 := 54.0
		var mid_r2 := mid_r * mid_r
		var jx0 := int(floor((cam_reg.x - mid_r) / c2))
		var jx1 := int(floor((cam_reg.x + mid_r) / c2))
		var jz0 := int(floor((cam_reg.z - mid_r) / c2))
		var jz1 := int(floor((cam_reg.z + mid_r) / c2))
		const FAR_SPS := [1, 14, 15, 4, 16, 3, 6, 8]
		const FAR_H0 := [22.0, 18.0, 18.0, 14.0, 17.0, 14.0, 12.0, 14.0]
		const FAR_H1 := [36.0, 32.0, 30.0, 26.0, 30.0, 24.0, 19.0, 23.0]
		for jz in range(jz0, jz1 + 1):
			for jx in range(jx0, jx1 + 1):
				var rx := (float(jx) + 0.14 + 0.72 * _ug_u01(_ug_hash(jx, jz, 9601))) * c2
				var rz := (float(jz) + 0.14 + 0.72 * _ug_u01(_ug_hash(jx, jz, 9613))) * c2
				var dx := rx - cam_reg.x
				var dz := rz - cam_reg.z
				var d2_xz := dx * dx + dz * dz
				if d2_xz <= inner_r2 or d2_xz > mid_r2 or rx > -22000.0 or _is_subcell_covered(rx, rz):
					continue
				var sf := _sample_surface_at(rx, rz)
				var gy := sf.x
				if not is_finite(gy) or sf.z >= 0.98 or gy > 3380.0 or sf.w > 0.44 or sf.y > 0.70:
					continue
				var d2_3d := d2_xz + (gy - cam_reg.y) * (gy - cam_reg.y)
				if d2_3d > mid_r2:
					continue
				var patch := _patch_noise(rx, rz, 260.0, 9521)
				var dens := 0.78 * (1.0 - smoothstep(2920.0, 3380.0, gy)) * (1.0 - smoothstep(-72000.0, -24000.0, rx)) * (0.25 + 0.95 * patch) * (1.0 - smoothstep(0.42, 0.70, sf.y))
				if _ug_u01(_ug_hash(jx, jz, 9619)) > dens:
					continue
				var k_idx := _ug_hash(jx, jz, 9623) & 7
				if gy > 2600.0 and k_idx < 3:
					k_idx = 3 + (k_idx & 1)
				var sp: int = FAR_SPS[k_idx]
				var ht := lerpf(float(FAR_H0[k_idx]), float(FAR_H1[k_idx]), _ug_u01(_ug_hash(jx, jz, 9629)))
				var v := _ug_hash(jx, jz, 9631) & 3
				var pkey := "0|%d|%d|1" % [sp, v]
				if not _flora_protos.has(pkey):
					pkey = "0|%d|%d|2" % [sp, v]
					if not _flora_protos.has(pkey):
						continue
				var proto: Dictionary = _flora_protos[pkey]
				var sc := clampf(ht / maxf(float(proto["H"]), 0.25), 0.15, 6.0)
				var yaw := _ug_u01(_ug_hash(jx, jz, 9643)) * TAU
				_append_basis_row(bufs, cnts, pkey, Vector3(rx - ox_s, gy - 0.25 - oy_s, rz - oz_s), yaw, sc, Vector3.UP, 0.0)
				add_mid += 1
	return Vector2i(add_hero, add_mid)


func refresh_flora_at(cam_reg: Vector3, hero_r := 420.0, mid_r := 2800.0) -> Dictionary:
	_last_flora_cam = cam_reg
	if not flora_enabled or _stream_flora_root == null:
		for pkey in _stream_flora_pools:
			for mi in _stream_flora_pools[pkey]:
				(mi as MultiMeshInstance3D).multimesh.instance_count = 0
				(mi as MultiMeshInstance3D).visible = false
		return {"hero": 0, "mid": 0, "undergrowth": 0, "pools": 0}
	_ensure_flora_lib()
	if _flora_protos.is_empty():
		return {"hero": 0, "mid": 0, "undergrowth": 0, "pools": 0}

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
		var sub_n := int(ft.get("sub_n", 0))
		var offs: PackedInt32Array = ft.get("offs", PackedInt32Array())
		var ranges := []
		if sub_n > 0 and offs.size() == sub_n * sub_n + 1:
			var fbox: Array = ft["box"]
			var fbx0 := float(fbox[0]); var fbz0 := float(fbox[1])
			var fsp_x := maxf(1.0, float(fbox[2]) - fbx0)
			var fsp_z := maxf(1.0, float(fbox[3]) - fbz0)
			var sx0 := clampi(int(floor((cx_cam - mid_r - fbx0) / fsp_x * float(sub_n))), 0, sub_n - 1)
			var sx1 := clampi(int(floor((cx_cam + mid_r - fbx0) / fsp_x * float(sub_n))), 0, sub_n - 1)
			var sz0 := clampi(int(floor((cz_cam - mid_r - fbz0) / fsp_z * float(sub_n))), 0, sub_n - 1)
			var sz1 := clampi(int(floor((cz_cam + mid_r - fbz0) / fsp_z * float(sub_n))), 0, sub_n - 1)
			for sz in range(sz0, sz1 + 1):
				for sx in range(sx0, sx1 + 1):
					var ci := sz * sub_n + sx
					if offs[ci + 1] > offs[ci]:
						ranges.append([offs[ci], offs[ci + 1]])
		elif nrows > 0:
			ranges.append([0, nrows])

		for rg in ranges:
			var r_lo := int(rg[0])
			var r_hi := int(rg[1])
			for i in range(r_lo, r_hi):
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
				var ht_row := D[o6 + 4]
				if d > 1050.0:
					if ht_row < 13.0:
						continue
					if d > 1650.0 and (i & 1) != 0:
						continue
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
				var sc := clampf(ht_row / maxf(float(proto["H"]), 0.25), 0.12, 8.0) * (1.14 if d > 1650.0 else 1.0)
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

	var wf := _append_wild_forest(cam_reg, hero_r, mid_r, bufs, cnts)
	hero_n += wf.x
	mid_n += wf.y
	var ug_n := _append_undergrowth(cam_reg, bufs, cnts)

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
	return {"hero": hero_n, "mid": mid_n, "undergrowth": ug_n, "pools": active_pools}
