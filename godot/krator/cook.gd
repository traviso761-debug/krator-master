# The cooks (GODOT-LOOK-PLAN.md section 11: N2 the meshes, N3 the textures). What a place needs made once is made once,
# kept on disk and read back the next time the place opens:
#   a map        decoded, its mipmaps made and compressed for the GPU (BC7 on a desktop: three quarters of a place's load
#                time before this), as the bytes the GPU takes
#   a world.glb  parsed through GLTFDocument, every mesh given its levels of detail (C7) and a shadow mesh (C4:
#                positions only, welded), as one binary resource
# A cache, not a build step: nothing in the repository is written, an entry is found by what it was made from (the
# file's own bytes, the settings, the engine's version, VERSION below), and a missing or unreadable entry is made
# again. Losing the folder costs one slow load.
#
# Where: user://krator-cook, or KRATOR_COOK_DIR. When: KRATOR_COOK=1 or =0; unset, on wherever a window is drawn and off
# headless, so a test run reads what the page exported and writes nothing outside its own folder (tests/cook turns it
# on in a folder of its own). `godot --headless --path godot --script res://tools/cook.gd -- <case folder>` cooks a
# case ahead of time, and `-- --stat` and `-- --clear` say what the folder holds and empty it.
#
# Called from the stream's worker thread and from the main thread: the counters and the stat index are under a mutex.
class_name KratorCook
extends RefCounted

const VERSION := 4
const TEX_MAGIC := 0x3154434B   # "KCT1", little-endian
# ImporterMesh.generate_lods' two angles, in degrees: normals closer than the first are merged before the mesh is
# simplified (the editor's import default is 20; 25 keeps a carved cornice's edge and merges a trunk's facets)
const LOD_MERGE_DEG := 25.0
const LOD_SPLIT_DEG := 60.0

static var on := -1            # -1: not decided yet (enabled() decides); 0 off; 1 on
static var dir := ""           # "": KRATOR_COOK_DIR, else user://krator-cook
static var lods := true        # the mesh cook makes levels of detail (KRATOR_LODS=0 for none)
static var shadow_meshes := true   # ... and a shadow mesh a mesh (KRATOR_SHADOW_MESH=0)
static var stats := {"tex_hit": 0, "tex_miss": 0, "tex_ms": 0.0, "tex_bytes": 0, "mesh_hit": 0, "mesh_miss": 0, "mesh_ms": 0.0, "mesh_bytes": 0,
	"lod_ms": 0.0, "shadow_ms": 0.0, "errors": 0}
static var _mx := Mutex.new()
static var _index := {}        # the stat index: path -> [size, modified, md5, hashed at], so a file is hashed once
static var _index_loaded := false
static var _index_dirty := false
static var _tmp := 0


static func enabled() -> bool:
	if on < 0:
		var e := OS.get_environment("KRATOR_COOK")
		on = (1 if e != "0" else 0) if e != "" else (0 if DisplayServer.get_name() == "headless" else 1)
		if OS.get_environment("KRATOR_LODS") == "0":
			lods = false
		if OS.get_environment("KRATOR_SHADOW_MESH") == "0":
			shadow_meshes = false
	return on == 1


static func root() -> String:
	if dir == "":
		var e := OS.get_environment("KRATOR_COOK_DIR")
		dir = e if e != "" else "user://krator-cook"
	return dir


# turn the cook on in a folder (a test, the cook tool); "" for the default folder
static func use(folder: String, enable := true) -> void:
	_mx.lock()
	dir = folder
	on = 1 if enable else 0
	_index = {}
	_index_loaded = false
	_index_dirty = false
	_mx.unlock()


static func reset_stats() -> void:
	_mx.lock()
	for k in stats:
		stats[k] = 0.0 if stats[k] is float else 0
	_mx.unlock()


static func _count(key: String, by) -> void:
	_mx.lock()
	stats[key] += by
	_mx.unlock()


# ---- keys ---------------------------------------------------------------------------------------------------------------

# a file's MD5, hashed once: the stat index remembers it by the file's size and modified time, as git's index does, so
# a hit costs no read and a fresh checkout of the same bytes (new times, the same hash) still finds its entries. A file
# changed within two seconds of being hashed is hashed again next time (a modified time counts in whole seconds, so a
# rewrite inside the same second with the same size would otherwise pass for the old bytes).
static func file_md5(path: String) -> String:
	var size := FileAccess.get_size(path)
	var mod := FileAccess.get_modified_time(path)
	_mx.lock()
	if not _index_loaded:
		_index_loaded = true
		var ip := root() + "/index.json"
		if FileAccess.file_exists(ip):
			var d = JSON.parse_string(FileAccess.get_file_as_string(ip))
			if d is Dictionary and int(d.get("v", 0)) == VERSION and d.get("files") is Dictionary:
				_index = d["files"]
	var e = _index.get(path)
	_mx.unlock()
	if e is Array and (e as Array).size() == 4 and int(e[0]) == size and int(e[1]) == mod and size > 0 and mod + 2 <= int(e[3]):
		return str(e[2])
	var now := int(Time.get_unix_time_from_system())
	var h := FileAccess.get_md5(path)
	if h == "":
		return ""
	_mx.lock()
	_index[path] = [size, mod, h, now]
	_index_dirty = true
	_mx.unlock()
	return h


# write the stat index back if it changed (the stream calls this when a place has opened; the tool when it is done)
static func flush() -> void:
	_mx.lock()
	var dirty := _index_dirty
	var text := JSON.stringify({"v": VERSION, "files": _index}) if dirty else ""
	_index_dirty = false
	_mx.unlock()
	if not dirty or not enabled():
		return
	DirAccess.make_dir_recursive_absolute(root())
	var tmp := _tmp_name(root() + "/index.json")
	var f := FileAccess.open(tmp, FileAccess.WRITE)
	if f == null:
		return
	f.store_string(text)
	f.close()
	DirAccess.rename_absolute(tmp, root() + "/index.json")


static func _tmp_name(path: String) -> String:
	_mx.lock()
	_tmp += 1
	var n := _tmp
	_mx.unlock()
	return "%s.tmp-%d-%d-%d" % [path, OS.get_process_id(), OS.get_thread_caller_id(), n]


static func _engine() -> String:
	return str(Engine.get_version_info().get("hex", 0))


static func key(parts: Array) -> String:
	return ("|".join(PackedStringArray(parts)) + "|v%d|%s" % [VERSION, _engine()]).md5_text()


# ---- textures (N3) ------------------------------------------------------------------------------------------------------

# a map file as an Image ready for the GPU: decoded, mipmaps made, compressed for `role` (KratorKmat.vram). rgba8 converts
# before the mipmaps (a texture array's layers share one format). null when the file does not decode.
static func image_file(path: String, role := "albedo", rgba8 := false) -> Image:
	if not FileAccess.file_exists(path):
		return null
	var mode := KratorKmat.vram_mode()
	var cached := enabled() and mode != "none"   # uncompressed, a map is quicker to decode than to read back at four bytes a pixel
	var cp := ""
	if cached:
		var h := file_md5(path)
		if h != "":
			cp = "%s/tex/%s.kimg" % [root(), key([h, role, mode, "rgba8" if rgba8 else "src"])]
			var img := _read_image(cp)
			if img != null:
				_count("tex_hit", 1)
				return img
	var t0 := Time.get_ticks_usec()
	var out := decode(FileAccess.get_file_as_bytes(path), path, role, rgba8)
	if out == null:
		return null
	_count("tex_ms", (Time.get_ticks_usec() - t0) / 1000.0)
	if cp != "":
		_count("tex_miss", 1)
		_write_image(cp, out)
	return out


# the same as a texture
static func texture_file(path: String, role := "albedo") -> ImageTexture:
	var img := image_file(path, role)
	return ImageTexture.create_from_image(img) if img != null else null


# decode, mipmaps, compression: what a load did before the cook, and what a miss does
static func decode(bytes: PackedByteArray, name: String, role := "albedo", rgba8 := false) -> Image:
	if bytes.is_empty():
		return null
	var img := Image.new()
	var ext := name.get_extension().to_lower()
	var err := img.load_webp_from_buffer(bytes) if ext == "webp" else (img.load_jpg_from_buffer(bytes) if ext in ["jpg", "jpeg"] else img.load_png_from_buffer(bytes))
	if err != OK:
		return null
	if rgba8 and img.get_format() != Image.FORMAT_RGBA8:
		img.convert(Image.FORMAT_RGBA8)
	img.generate_mipmaps()
	KratorKmat.vram(img, role)
	return img


static func _write_image(path: String, img: Image) -> void:
	DirAccess.make_dir_recursive_absolute(path.get_base_dir())
	var tmp := _tmp_name(path)
	var f := FileAccess.open(tmp, FileAccess.WRITE)
	if f == null:
		_count("errors", 1)
		return
	var data := img.get_data()
	f.store_32(TEX_MAGIC)
	f.store_32(VERSION)
	f.store_32(img.get_format())
	f.store_32(img.get_width())
	f.store_32(img.get_height())
	f.store_32(1 if img.has_mipmaps() else 0)
	f.store_32(data.size())
	f.store_buffer(data)
	f.close()
	if DirAccess.rename_absolute(tmp, path) != OK:
		DirAccess.remove_absolute(tmp)
		_count("errors", 1)
		return
	_count("tex_bytes", data.size() + 28)


# null for a file that is not there, was cut short or was written by another version: the caller makes it again
static func _read_image(path: String) -> Image:
	if not FileAccess.file_exists(path):
		return null
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null or f.get_length() < 28:
		return null
	if f.get_32() != TEX_MAGIC or f.get_32() != VERSION:
		return null
	var fmt := f.get_32()
	var w := f.get_32()
	var h := f.get_32()
	var mips := f.get_32() == 1
	var n := f.get_32()
	if n <= 0 or f.get_length() != 28 + n or w <= 0 or h <= 0:
		return null
	var data := f.get_buffer(n)
	f.close()
	if data.size() != n:
		return null
	return Image.create_from_data(w, h, mips, fmt, data)


# ---- meshes (N2, C7, C4) ------------------------------------------------------------------------------------------------

# a world.glb as the flat scene KratorWorld.build takes its nodes from by name: read from the cache when its entry is
# there, else parsed through GLTFDocument (krator/gltf_instancing.gd for the instanced nodes), given its levels of detail
# and shadow meshes, and saved. out["cook"] says which. null when the glb does not load (out["error"] has the code).
# Without the cook this is the parse alone, as before.
static func scene(glb: String, out := {}) -> Node:
	var cp := ""
	if enabled():
		var h := file_md5(glb)
		if h != "":
			cp = "%s/mesh/%s.res" % [root(), key([h, "lods" if lods else "nolods", "shadow" if shadow_meshes else "noshadow", str(LOD_MERGE_DEG)])]
			var t0 := Time.get_ticks_usec()
			var sc := _read_scene(cp)
			if sc != null:
				_count("mesh_hit", 1)
				out["cook"] = {"from": "cache", "ms": (Time.get_ticks_usec() - t0) / 1000.0}
				return sc
	var t1 := Time.get_ticks_usec()
	KratorGltf._register_instancing()
	var doc := GLTFDocument.new()
	var state := GLTFState.new()
	var err := doc.append_from_file(glb, state)
	if err != OK:
		out["error"] = err
		return null
	var parsed := doc.generate_scene(state)
	if parsed == null:
		out["error"] = ERR_PARSE_ERROR
		return null
	var parse_ms := (Time.get_ticks_usec() - t1) / 1000.0
	if cp == "":
		for c in parsed.find_children("*", "MultiMeshInstance3D", true, false):
			if c.has_meta("krator_buf"):
				c.remove_meta("krator_buf")
		out["cook"] = {"from": "glb", "ms": parse_ms}
		return parsed
	var rep := {}
	var rec := _record(parsed, rep)
	parsed.free()
	var t2 := Time.get_ticks_usec()
	var saved := _write_scene(cp, rec)
	var ms := (Time.get_ticks_usec() - t1) / 1000.0
	_count("mesh_miss", 1)
	_count("mesh_ms", ms)
	out["cook"] = {"from": "glb, cooked", "ms": ms, "parse_ms": parse_ms, "save_ms": (Time.get_ticks_usec() - t2) / 1000.0, "saved": saved,
		"meshes": rep.get("meshes", 0), "with_lods": rep.get("with_lods", 0), "lod_ms": rep.get("lod_ms", 0.0), "shadow_ms": rep.get("shadow_ms", 0.0),
		"vertices": rep.get("vertices", 0), "shadow_vertices": rep.get("shadow_vertices", 0)}
	return _instance(rec)


# the parsed scene as a record: its nodes flat (name, kind, transform, metadata, the MultiMesh's rows as floats, a moving
# item's track) and its meshes once each, with levels of detail and shadow meshes
static func _record(scene_root: Node, rep: Dictionary) -> Dictionary:
	var meshes: Array[ArrayMesh] = []
	var mesh_ix := {}
	var nodes := []
	var stack: Array[Node] = [scene_root]
	while not stack.is_empty():   # in the glb's own order (parent, then its children first to last)
		var n: Node = stack.pop_back()
		var kids := n.get_children()
		for ci in range(kids.size() - 1, -1, -1):
			stack.append(kids[ci])
		var r := {}
		var src: Mesh = null
		if n is MultiMeshInstance3D:
			var mmi := n as MultiMeshInstance3D
			var mm := mmi.multimesh
			if mm == null:
				continue
			src = mm.mesh
			# the rows as the instancing extension left them for the cook (krator_buf: no read back from the GPU), else the buffer's
			r = {"kind": "mmi", "tf": mm.transform_format, "colors": mm.use_colors, "custom": mm.use_custom_data, "n": mm.instance_count,
				"buf": mmi.get_meta("krator_buf") if mmi.has_meta("krator_buf") else mm.buffer}
			if mmi.custom_aabb.size != Vector3.ZERO:
				r["aabb"] = mmi.custom_aabb
			var mo := mmi.get_node_or_null("Motion") as KMotion
			if mo != null:
				r["motion"] = {"track": mo.track, "sel": mo.sel, "origin": mo.origin}
		elif n is MeshInstance3D:
			src = (n as MeshInstance3D).mesh
			r = {"kind": "mi"}
		else:
			continue
		r["name"] = str(n.name)
		r["xf"] = (n as Node3D).transform
		var meta := {}
		for k in n.get_meta_list():
			if str(k) != "krator_buf":
				meta[str(k)] = n.get_meta(k)
		r["meta"] = meta
		r["mesh"] = -1
		if src is ArrayMesh:
			if not mesh_ix.has(src):
				mesh_ix[src] = meshes.size()
				meshes.append(cook_mesh(src as ArrayMesh, rep))
			r["mesh"] = mesh_ix[src]
		nodes.append(r)
	rep["meshes"] = meshes.size()
	return {"v": VERSION, "nodes": nodes, "meshes": meshes}


# one mesh as the cook keeps it: each surface's own bytes (so it draws as the parsed mesh does, to the bit), its
# material dropped (the importer overrides every one, and a glTF material would only weigh the entry down), levels of
# detail added (C7: ImporterMesh.generate_lods, the simplifier the editor's import runs) and a shadow mesh (C4)
static func cook_mesh(mesh: ArrayMesh, rep := {}) -> ArrayMesh:
	var src = mesh.get("_surfaces")
	if mesh.get_blend_shape_count() > 0 or not (src is Array) or (src as Array).is_empty():   # no blend shapes in a world.glb; one that has them is kept as it came
		return mesh
	var t0 := Time.get_ticks_usec()
	var im := ImporterMesh.from_mesh(mesh)
	if lods:
		im.generate_lods(LOD_MERGE_DEG, LOD_SPLIT_DEG, [])
	var t1 := Time.get_ticks_usec()
	var surfaces := []
	var shadows := []
	var any_lod := false
	var shadow_ok := shadow_meshes
	for s in (src as Array).size():
		var d: Dictionary = ((src as Array)[s] as Dictionary).duplicate()
		d.erase("material")
		d.erase("lods")
		var vc := int(d["vertex_count"])
		var levels := []   # [edge length, indices] a level, finest first
		var arr := im.get_surface_arrays(s)
		if lods and int(d["primitive"]) == Mesh.PRIMITIVE_TRIANGLES and int(d.get("index_count", 0)) > 0 and (arr[Mesh.ARRAY_VERTEX] as PackedVector3Array).size() == vc:
			for l in im.get_surface_lod_count(s):
				var li := im.get_surface_lod_indices(s, l)
				if li.size() >= 3 and li.size() < int(d["index_count"]):
					levels.append([im.get_surface_lod_size(s, l), li])
		if not levels.is_empty():
			any_lod = true
			var flat := []
			for lv in levels:
				flat.append(lv[0])
				flat.append(_index_bytes(lv[1], vc))
			d["lods"] = flat
		surfaces.append(d)
		if shadow_ok:
			var sd := _shadow_surface(d, arr, levels, rep)
			if sd.is_empty():
				shadow_ok = false   # a layout this does not know: the mesh goes without, and draws its own vertices in the depth passes
				rep["shadow_skipped"] = int(rep.get("shadow_skipped", 0)) + 1
			else:
				shadows.append(sd)
	var out := ArrayMesh.new()
	out.set("_surfaces", surfaces)
	if shadow_ok and shadows.size() == surfaces.size():
		var sh := ArrayMesh.new()
		sh.set("_surfaces", shadows)
		if sh.get_surface_count() == out.get_surface_count():
			out.shadow_mesh = sh
	out.resource_name = mesh.resource_name
	if any_lod:
		rep["with_lods"] = int(rep.get("with_lods", 0)) + 1
	rep["lod_ms"] = float(rep.get("lod_ms", 0.0)) + (t1 - t0) / 1000.0
	_count("lod_ms", (t1 - t0) / 1000.0)
	return out


# A mesh's far twin (C8): the same vertices drawn from the coarsest level of detail whose error is within max_error
# metres, the coarser levels kept under it. For what is only ever drawn far off and stands all round the camera (the
# stream's flora pools), where the engine's own choice by the distance to a node's box cannot work. The mesh itself
# when it has no levels or none is within the error. Kept on the mesh, one a millimetre of error.
static func far_mesh(mesh: ArrayMesh, max_error: float) -> ArrayMesh:
	if mesh == null or max_error <= 0.0:
		return mesh
	var mk := "krator_far_%d" % int(round(max_error * 1000.0))
	if mesh.has_meta(mk):
		return mesh.get_meta(mk)
	var src = mesh.get("_surfaces")
	var out_s := []
	var changed := false
	if src is Array:
		for sd in (src as Array):
			var d: Dictionary = (sd as Dictionary).duplicate()
			var levels: Array = d.get("lods", [])
			var pick := -1
			for l in range(0, levels.size() - 1, 2):
				if float(levels[l]) <= max_error:
					pick = l
			if pick >= 0 and int(d.get("index_count", 0)) > 0:
				var stride := 2 if int(d["vertex_count"]) <= 65536 else 4
				var bytes: PackedByteArray = levels[pick + 1]
				d["index_data"] = bytes
				d["index_count"] = bytes.size() / stride
				var rest := levels.slice(pick + 2)
				if rest.is_empty():
					d.erase("lods")
				else:
					d["lods"] = rest
				changed = true
			out_s.append(d)
	var far := mesh
	if changed:
		far = ArrayMesh.new()
		far.set("_surfaces", out_s)
		far.resource_name = mesh.resource_name
	mesh.set_meta(mk, far)
	return far


# an index list as a surface stores it: 16 bits an index up to 65,536 vertices, else 32
static func _index_bytes(idx: PackedInt32Array, vertex_count: int) -> PackedByteArray:
	if vertex_count > 65536:
		return idx.to_byte_array()
	var n := idx.size()
	var pairs := PackedInt32Array()
	pairs.resize((n + 1) / 2)
	var k := 0
	var p := 0
	while k + 1 < n:
		pairs[p] = idx[k] | (idx[k + 1] << 16)
		k += 2
		p += 1
	if k < n:
		pairs[p] = idx[k]
	var out := pairs.to_byte_array()
	out.resize(n * 2)
	return out


# the same through a table (a vertex to its welded one)
static func _index_bytes_mapped(idx: PackedInt32Array, remap: PackedInt32Array, vertex_count: int) -> PackedByteArray:
	var n := idx.size()
	if vertex_count > 65536:
		var wide := PackedInt32Array()
		wide.resize(n)
		for k in n:
			wide[k] = remap[idx[k]]
		return wide.to_byte_array()
	var pairs := PackedInt32Array()
	pairs.resize((n + 1) / 2)
	var k := 0
	var p := 0
	while k + 1 < n:
		pairs[p] = remap[idx[k]] | (remap[idx[k + 1]] << 16)
		k += 2
		p += 1
	if k < n:
		pairs[p] = remap[idx[k]]
	var out := pairs.to_byte_array()
	out.resize(n * 2)
	return out


const _SHADOW_KEEP := Mesh.ARRAY_FORMAT_VERTEX | Mesh.ARRAY_FORMAT_INDEX
const _FLAGS_FROM := 1 << 25   # ARRAY_COMPRESS_FLAGS_BASE: the layout flags and the format's version sit from here up


# a surface's shadow twin (C4): its positions welded, every index list (the surface's and each level's) pointing at the
# welded ones, so a depth pass draws the same triangles from fewer vertices. Each welded vertex is the bytes of the first
# vertex at its position, copied, never encoded again: a depth pass must land on the depth the surface itself draws at.
# A compressed surface (positions as 16 bits within the bounds, a normal and tangent packed beside them) keeps that
# layout and those bounds, so it carries one normal and tangent a vertex; a plain one keeps positions alone.
# {} for a layout this does not handle (a skinned surface, a stride it has no view for).
static func _shadow_surface(d: Dictionary, arr: Array, levels: Array, rep: Dictionary) -> Dictionary:
	var t0 := Time.get_ticks_usec()
	var fmt := int(d["format"])
	var vc := int(d["vertex_count"])
	var verts: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	if (fmt & (Mesh.ARRAY_FORMAT_BONES | Mesh.ARRAY_FORMAT_WEIGHTS | Mesh.ARRAY_FLAG_USE_2D_VERTICES)) != 0 or verts.size() != vc or vc == 0:
		return {}
	var compressed := (fmt & Mesh.ARRAY_FLAG_COMPRESS_ATTRIBUTES) != 0
	var ps := RenderingServer.mesh_surface_get_format_vertex_stride(fmt, vc)
	var nts := RenderingServer.mesh_surface_get_format_normal_tangent_stride(fmt, vc)
	var vdata: PackedByteArray = d["vertex_data"]
	if vdata.size() != (ps + nts) * vc or not (ps == 12 or ps == 8) or (compressed and not (nts == 4 or nts == 8 or nts == 0)):
		return {}
	# weld by the position a vertex decodes to
	var remap := PackedInt32Array()
	remap.resize(vc)
	var first := PackedInt32Array()   # for each welded vertex, the first source vertex at its position
	var seen := {}
	for i in vc:
		var j = seen.get(verts[i])
		if j == null:
			j = first.size()
			seen[verts[i]] = j
			first.append(i)
		remap[i] = j
	var nw := first.size()
	# the welded vertices' bytes: the position block first, then (compressed) the normal and tangent block
	var out_v := PackedByteArray()
	if ps == 12:
		var pf := vdata.slice(0, 12 * vc).to_float32_array()
		var wf := PackedFloat32Array()
		wf.resize(nw * 3)
		for j in nw:
			var b := first[j] * 3
			wf[j * 3] = pf[b]
			wf[j * 3 + 1] = pf[b + 1]
			wf[j * 3 + 2] = pf[b + 2]
		out_v = wf.to_byte_array()
	else:
		var pq := vdata.slice(0, 8 * vc).to_int64_array()
		var wq := PackedInt64Array()
		wq.resize(nw)
		for j in nw:
			wq[j] = pq[first[j]]
		out_v = wq.to_byte_array()
	var keep := _SHADOW_KEEP
	if compressed and nts > 0:
		keep |= fmt & (Mesh.ARRAY_FORMAT_NORMAL | Mesh.ARRAY_FORMAT_TANGENT)
		if nts == 4:
			var nq := vdata.slice(ps * vc).to_int32_array()
			var wn := PackedInt32Array()
			wn.resize(nw)
			for j in nw:
				wn[j] = nq[first[j]]
			out_v.append_array(wn.to_byte_array())
		else:
			var nq8 := vdata.slice(ps * vc).to_int64_array()
			var wn8 := PackedInt64Array()
			wn8.resize(nw)
			for j in nw:
				wn8[j] = nq8[first[j]]
			out_v.append_array(wn8.to_byte_array())
	var sfmt := (fmt & keep) | Mesh.ARRAY_FORMAT_INDEX | (fmt & ~(_FLAGS_FROM - 1))
	# the surface's own triangles, and each level's, on the welded vertices
	var base := PackedInt32Array()
	if int(d.get("index_count", 0)) > 0 and arr[Mesh.ARRAY_INDEX] is PackedInt32Array:
		base = arr[Mesh.ARRAY_INDEX]
	else:
		base.resize(vc)
		for i in vc:
			base[i] = i
	var sd := {"format": sfmt, "primitive": d["primitive"], "vertex_data": out_v, "vertex_count": nw, "aabb": d["aabb"], "uv_scale": d.get("uv_scale", Vector4()),
		"index_data": _index_bytes_mapped(base, remap, nw), "index_count": base.size()}
	if not levels.is_empty():
		var flat := []
		for lv in levels:
			flat.append(lv[0])
			flat.append(_index_bytes_mapped(lv[1], remap, nw))
		sd["lods"] = flat
	rep["vertices"] = int(rep.get("vertices", 0)) + vc
	rep["shadow_vertices"] = int(rep.get("shadow_vertices", 0)) + nw
	var ms := (Time.get_ticks_usec() - t0) / 1000.0
	rep["shadow_ms"] = float(rep.get("shadow_ms", 0.0)) + ms
	_count("shadow_ms", ms)
	return sd


# the record as nodes under one root, as GLTFDocument.generate_scene's are for what the importer does with them: found by
# name, each with its own transform, mesh, rows and metadata
static func _instance(rec: Dictionary) -> Node:
	var root_n := Node3D.new()
	root_n.name = "Cooked"
	var meshes: Array = rec["meshes"]
	for r in rec["nodes"]:
		var mesh: ArrayMesh = meshes[int(r["mesh"])] if int(r["mesh"]) >= 0 else null
		var n: Node3D = null
		if str(r["kind"]) == "mmi":
			var mm := MultiMesh.new()
			mm.transform_format = int(r["tf"])
			mm.use_colors = bool(r["colors"])
			mm.use_custom_data = bool(r["custom"])
			mm.mesh = mesh
			mm.instance_count = int(r["n"])
			var buf: PackedFloat32Array = r["buf"]
			if int(r["n"]) > 0 and buf.size() > 0:
				mm.buffer = buf
			var mmi := MultiMeshInstance3D.new()
			mmi.multimesh = mm
			n = mmi
			if r.has("motion"):
				var mo: Dictionary = r["motion"]
				KMotion.attach(mmi, mo["track"], mo["sel"], mo["origin"])
			if r.has("aabb"):
				mmi.custom_aabb = r["aabb"]
		else:
			var mi := MeshInstance3D.new()
			mi.mesh = mesh
			n = mi
		n.name = str(r["name"])
		n.transform = r["xf"]
		var meta: Dictionary = r["meta"]
		for k in meta:
			n.set_meta(k, meta[k])
		root_n.add_child(n)
	return root_n


static func _write_scene(path: String, rec: Dictionary) -> bool:
	DirAccess.make_dir_recursive_absolute(path.get_base_dir())
	var res := Resource.new()
	res.set_meta("krator_cook", rec)
	var tmp := _tmp_name(path) + ".res"
	var err := ResourceSaver.save(res, tmp)
	if err != OK:
		_count("errors", 1)
		DirAccess.remove_absolute(tmp)
		return false
	_count("mesh_bytes", FileAccess.get_size(tmp))
	if DirAccess.rename_absolute(tmp, path) != OK:
		DirAccess.remove_absolute(tmp)
		_count("errors", 1)
		return false
	return true


static func _read_scene(path: String) -> Node:
	if not FileAccess.file_exists(path):
		return null
	var res := ResourceLoader.load(path, "", ResourceLoader.CACHE_MODE_IGNORE)
	if res == null or not res.has_meta("krator_cook"):
		return null
	var rec = res.get_meta("krator_cook")
	if not (rec is Dictionary) or int((rec as Dictionary).get("v", 0)) != VERSION or not ((rec as Dictionary).get("nodes") is Array) or not ((rec as Dictionary).get("meshes") is Array):
		return null
	return _instance(rec)


# ---- the folder ---------------------------------------------------------------------------------------------------------

# what the folder holds: {files, bytes, tex, mesh}
static func usage() -> Dictionary:
	var out := {"files": 0, "bytes": 0, "tex": 0, "mesh": 0, "tex_bytes": 0, "mesh_bytes": 0}
	for sub in ["tex", "mesh"]:
		var d := DirAccess.open(root() + "/" + sub)
		if d == null:
			continue
		for f in d.get_files():
			var n := FileAccess.get_size(root() + "/" + sub + "/" + f)
			out["files"] += 1
			out["bytes"] += n
			out[sub] += 1
			out[sub + "_bytes"] += n
	return out


# empty the folder (every entry and the stat index); returns how many files went
static func clear() -> int:
	var n := 0
	for sub in ["tex", "mesh"]:
		var d := DirAccess.open(root() + "/" + sub)
		if d == null:
			continue
		for f in d.get_files():
			if d.remove(f) == OK:
				n += 1
	if FileAccess.file_exists(root() + "/index.json"):
		DirAccess.remove_absolute(root() + "/index.json")
	_mx.lock()
	_index = {}
	_index_dirty = false
	_mx.unlock()
	return n
