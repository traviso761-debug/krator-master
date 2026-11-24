# The cooks (krator/cook.gd; GODOT-LOOK-PLAN.md section 11, N2 and N3, with C4 and C7). Headless, in a folder of its
# own under user://, which it empties when done. A map comes back from the cache as the bytes it was made as; a mesh
# keeps its surfaces and gains levels of detail and a shadow mesh that draws the same triangles from welded positions; a
# world.glb read back from the cache is the parsed one node for node; and the importer takes either. Each check has a
# negative.
#   godot --headless --path godot --script res://tests/cook/cook_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0
var folder := ""


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	var C := KratorCook
	folder = "user://cook-test-%d" % OS.get_process_id()
	# 1. off headless unless asked: a test run writes nothing outside its own folder
	C.on = -1
	var env := OS.get_environment("KRATOR_COOK")
	ok(C.enabled() == (env != "0" if env != "" else false), "headless, the cook is on only when KRATOR_COOK asks (here: %s)" % ("off" if not C.enabled() else "on"))
	OS.set_environment("KRATOR_VRAM", "bptc")   # the compression the cook exists for; the module is in a headless build too
	C.use(folder)
	C.reset_stats()
	ok(C.enabled() and C.root() == folder and int(C.usage()["files"]) == 0, "use() turns it on in an empty folder of its own")

	_textures()
	_meshes()
	_scenes()
	_wiring()

	var left := C.clear()
	var gone: int = C.usage()["files"]
	for sub in ["tex", "mesh", ""]:
		DirAccess.remove_absolute(folder + "/" + sub)
	for f in ["a.png", "b.png"]:
		DirAccess.remove_absolute(folder + "-src/" + f)
	DirAccess.remove_absolute(folder + "-src")
	ok(left > 0 and gone == 0 and not DirAccess.dir_exists_absolute(folder), "clear() empties the folder (%d files), and the test leaves nothing behind" % left)
	C.use("", false)
	C.on = -1
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)


func _png(path: String, seed_: int) -> void:
	var img := Image.create(64, 64, false, Image.FORMAT_RGBA8)
	for y in 64:
		for x in 64:
			var v := float((x * 7 + y * 13 + seed_ * 31) % 97) / 96.0
			img.set_pixel(x, y, Color(v, 1.0 - v, float((x ^ y) & 31) / 31.0, 1.0))
	img.save_png(path)


func _textures() -> void:
	var C := KratorCook
	DirAccess.make_dir_recursive_absolute(folder + "-src")
	var a := folder + "-src/a.png"
	_png(a, 1)
	var first := C.image_file(a, "albedo")
	var s1 := C.stats.duplicate()
	var again := C.image_file(a, "albedo")
	var s2 := C.stats.duplicate()
	ok(first != null and first.is_compressed() and first.has_mipmaps() and first.get_format() == Image.FORMAT_BPTC_RGBA and first.get_width() == 64,
		"a map comes out compressed (BC7) with its mipmaps")
	ok(int(s1["tex_miss"]) == 1 and int(s1["tex_hit"]) == 0 and int(s2["tex_miss"]) == 1 and int(s2["tex_hit"]) == 1 and int(C.usage()["tex"]) == 1,
		"the first load makes it and writes one entry; the second reads the entry and compresses nothing")
	ok(again != null and again.get_format() == first.get_format() and again.has_mipmaps() and again.get_data() == first.get_data(), "the entry is the image to the byte")
	var plain := C.decode(FileAccess.get_file_as_bytes(a), a, "albedo")
	ok(plain.get_data() == first.get_data(), "and it is what a load without the cook makes")
	var tex := C.texture_file(a, "albedo")
	ok(tex != null and tex.get_width() == 64 and tex.get_format() == Image.FORMAT_BPTC_RGBA and int(C.stats["tex_hit"]) == 2, "texture_file hands the same entry over as a texture")
	# negatives: another role is another entry; other bytes under the same name are another entry at once
	var nrm := C.image_file(a, "normal")
	ok(nrm != null and int(C.stats["tex_miss"]) == 2 and int(C.usage()["tex"]) == 2, "negative: the same file as a normal map is made again, under its own entry")
	_png(a, 2)   # the same size, inside the same second
	var changed := C.image_file(a, "albedo")
	ok(changed != null and int(C.stats["tex_miss"]) == 3 and changed.get_data() != first.get_data(),
		"negative: the file rewritten in place (the same size, the same second) is hashed again and made again, not served stale")
	# a cut-short entry and one from another version are made again
	var b := folder + "-src/b.png"
	_png(b, 3)
	var good := C.image_file(b, "data")
	var d := DirAccess.open(folder + "/tex")
	var newest := ""
	var newest_t := 0
	for f in d.get_files():
		var p := folder + "/tex/" + f
		if FileAccess.get_file_as_bytes(p).size() - 28 == good.get_data().size() and FileAccess.get_file_as_bytes(p).slice(28) == good.get_data():
			newest = p
	ok(newest != "", "the entry is one file: a 28-byte header and the image's bytes")
	var whole := FileAccess.get_file_as_bytes(newest)
	var fw := FileAccess.open(newest, FileAccess.WRITE)
	fw.store_buffer(whole.slice(0, whole.size() / 2))
	fw.close()
	var miss0: int = C.stats["tex_miss"]
	var healed := C.image_file(b, "data")
	ok(healed != null and healed.get_data() == good.get_data() and int(C.stats["tex_miss"]) == miss0 + 1 and FileAccess.get_file_as_bytes(newest) == whole,
		"negative: an entry cut short is not read: the map is made again and the entry rewritten whole")
	var bad := whole.duplicate()
	bad.encode_u32(4, C.VERSION + 1)
	fw = FileAccess.open(newest, FileAccess.WRITE)
	fw.store_buffer(bad)
	fw.close()
	var v2 := C.image_file(b, "data")
	ok(v2 != null and int(C.stats["tex_miss"]) == miss0 + 2, "negative: an entry written by another version is made again")
	ok(C.image_file(folder + "-src/none.png", "albedo") == null and int(C.stats["errors"]) == 0, "negative: a file that is not there gives null and no entry")
	# uncompressed, a map is not kept (quicker to decode than to read back at four bytes a pixel)
	OS.set_environment("KRATOR_VRAM", "none")
	var n_before: int = C.usage()["tex"]
	var raw := C.image_file(b, "albedo")
	ok(raw != null and not raw.is_compressed() and raw.has_mipmaps() and int(C.usage()["tex"]) == n_before, "with no compression in force a map is decoded each time and nothing is kept")
	OS.set_environment("KRATOR_VRAM", "bptc")
	# a texture array's layers: converted to RGBA8 before the mipmaps, under an entry of their own
	var layer := C.image_file(b, "albedo", true)
	ok(layer != null and layer.get_format() == Image.FORMAT_BPTC_RGBA and int(C.usage()["tex"]) == n_before + 1, "a layer for a texture array has its own entry")


# a UV sphere with a seam and split poles (its positions repeat), and a box with a normal a face (24 vertices on 8 corners)
func _sphere(compress: bool) -> ArrayMesh:
	var sm := SphereMesh.new()
	sm.radius = 2.0
	sm.height = 4.0
	sm.radial_segments = 48
	sm.rings = 24
	var arr := sm.get_mesh_arrays()
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr, [], {}, Mesh.ARRAY_FLAG_COMPRESS_ATTRIBUTES if compress else 0)
	var bm := BoxMesh.new()
	bm.size = Vector3(1, 2, 3)
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, bm.get_mesh_arrays(), [], {}, Mesh.ARRAY_FLAG_COMPRESS_ATTRIBUTES if compress else 0)
	m.surface_set_name(0, "ball")
	m.surface_set_name(1, "box")
	return m


func _lods_of(m: ArrayMesh, s: int) -> Array:
	var d := RenderingServer.mesh_get_surface(m.get_rid(), s)
	var out := []
	var wide: bool = int(d["vertex_count"]) > 65536
	for l in d.get("lods", []):
		var raw: PackedByteArray = l["index_data"]
		var idx := PackedInt32Array()
		if wide:
			idx = raw.to_int32_array()
		else:
			idx.resize(raw.size() / 2)
			for i in idx.size():
				idx[i] = raw.decode_u16(i * 2)
		out.append({"edge": float(l["edge_length"]), "idx": idx})
	return out


# every triangle corner of `idx` in the shadow surface stands on the position the cooked surface has there
func _same_corners(pos: PackedVector3Array, idx: PackedInt32Array, spos: PackedVector3Array, sidx: PackedInt32Array) -> bool:
	if idx.size() != sidx.size():
		return false
	for k in idx.size():
		if pos[idx[k]] != spos[sidx[k]]:
			return false
	return true


func _meshes() -> void:
	var C := KratorCook
	for compress in [false, true]:
		var tag := "compressed" if compress else "plain"
		var src := _sphere(compress)
		var rep := {}
		var out := C.cook_mesh(src, rep)
		var same := out.get_surface_count() == 2 and out.surface_get_name(0) == "ball" and out.surface_get_name(1) == "box"
		for s in 2:
			var a := src.surface_get_arrays(s)
			var b := out.surface_get_arrays(s)
			same = same and src.surface_get_format(s) == out.surface_get_format(s) and src.surface_get_array_len(s) == out.surface_get_array_len(s)
			same = same and a[Mesh.ARRAY_VERTEX] == b[Mesh.ARRAY_VERTEX] and a[Mesh.ARRAY_INDEX] == b[Mesh.ARRAY_INDEX] and a[Mesh.ARRAY_NORMAL] == b[Mesh.ARRAY_NORMAL] and a[Mesh.ARRAY_TEX_UV] == b[Mesh.ARRAY_TEX_UV]
			same = same and out.surface_get_material(s) == null
			var ps: Dictionary = RenderingServer.mesh_get_surface(src.get_rid(), s)
			var po: Dictionary = RenderingServer.mesh_get_surface(out.get_rid(), s)
			same = same and ps["vertex_data"] == po["vertex_data"] and ps["attribute_data"] == po["attribute_data"] and ps["index_data"] == po["index_data"] and ps["aabb"] == po["aabb"]
		ok(same and out.get_aabb() == src.get_aabb() and ((int(out.surface_get_format(0)) & Mesh.ARRAY_FLAG_COMPRESS_ATTRIBUTES) != 0) == compress,
			"%s: a cooked mesh keeps each surface's bytes, format, name and bounds, and carries no material" % tag)
		var ball := _lods_of(out, 0)
		var base_n: int = out.surface_get_array_index_len(0)
		var falls := ball.size() >= 2
		var last_n := base_n
		var last_e := 0.0
		for l in ball:
			var n: int = (l["idx"] as PackedInt32Array).size()
			falls = falls and n >= 3 and n % 3 == 0 and n < last_n and float(l["edge"]) > last_e
			for i in (l["idx"] as PackedInt32Array):
				if i < 0 or i >= out.surface_get_array_len(0):
					falls = false
					break
			last_n = n
			last_e = float(l["edge"])
		ok(falls and _lods_of(src, 0).is_empty() and int(rep.get("with_lods", 0)) == 1,
			"%s: the sphere gains %d levels of detail, each coarser and with fewer triangles (%d to %d), on the surface's own vertices" % [tag, ball.size(), base_n / 3, last_n / 3])
		# the shadow mesh
		var sh := out.shadow_mesh
		var good := sh != null and sh.get_surface_count() == 2
		var welded := [0, 0]
		if good:
			for s in 2:
				var a := out.surface_get_arrays(s)
				var b := sh.surface_get_arrays(s)
				var spos: PackedVector3Array = b[Mesh.ARRAY_VERTEX]
				welded[s] = spos.size()
				var distinct := {}
				for v in (a[Mesh.ARRAY_VERTEX] as PackedVector3Array):
					distinct[v] = true
				good = good and spos.size() == distinct.size() and _same_corners(a[Mesh.ARRAY_VERTEX], a[Mesh.ARRAY_INDEX], spos, b[Mesh.ARRAY_INDEX])
				good = good and ((int(sh.surface_get_format(s)) & Mesh.ARRAY_FLAG_COMPRESS_ATTRIBUTES) != 0) == ((int(out.surface_get_format(s)) & Mesh.ARRAY_FLAG_COMPRESS_ATTRIBUTES) != 0)
				good = good and (int(sh.surface_get_format(s)) & (Mesh.ARRAY_FORMAT_TEX_UV | Mesh.ARRAY_FORMAT_COLOR)) == 0
				var lm := _lods_of(out, s)
				var ls := _lods_of(sh, s)
				good = good and lm.size() == ls.size()
				for l in mini(lm.size(), ls.size()):
					good = good and is_equal_approx(float(lm[l]["edge"]), float(ls[l]["edge"])) and _same_corners(a[Mesh.ARRAY_VERTEX], lm[l]["idx"], spos, ls[l]["idx"])
		ok(good and welded[1] == 8 and welded[0] < out.surface_get_array_len(0) and sh.get_aabb() == out.get_aabb(),
			"%s: the shadow mesh draws the same triangles at every level from welded positions (the box's 24 vertices on 8, the sphere's %d on %d), in the surface's own layout" % [tag, out.surface_get_array_len(0), welded[0]])
		ok(int(rep.get("vertices", 0)) == out.surface_get_array_len(0) + 24 and int(rep.get("shadow_vertices", 0)) == welded[0] + 8, "%s: the report counts both" % tag)
	# negatives: each half has its switch, and a mesh with blend shapes is left as it came
	var src2 := _sphere(false)
	C.lods = false
	var no_lod := C.cook_mesh(src2)
	C.lods = true
	C.shadow_meshes = false
	var no_sh := C.cook_mesh(src2)
	C.shadow_meshes = true
	ok(_lods_of(no_lod, 0).is_empty() and no_lod.shadow_mesh != null and _lods_of(no_lod.shadow_mesh, 0).is_empty(), "negative: with levels of detail off a mesh and its shadow mesh have one level")
	ok(no_sh.shadow_mesh == null and not _lods_of(no_sh, 0).is_empty(), "negative: with shadow meshes off a mesh has none")
	# the far twin (C8): the coarsest level within an error, as the mesh's own triangles
	var cooked := C.cook_mesh(src2)
	var lv := _lods_of(cooked, 0)
	var mid_err: float = lv[lv.size() / 2]["edge"]
	var far := C.far_mesh(cooked, mid_err)
	var want: PackedInt32Array = lv[lv.size() / 2]["idx"]
	var got: PackedInt32Array = far.surface_get_arrays(0)[Mesh.ARRAY_INDEX]
	ok(far != cooked and got == want and far.surface_get_array_len(0) == cooked.surface_get_array_len(0) and _lods_of(far, 0).size() == lv.size() - lv.size() / 2 - 1
		and far.surface_get_arrays(0)[Mesh.ARRAY_VERTEX] == cooked.surface_get_arrays(0)[Mesh.ARRAY_VERTEX],
		"a far twin draws the coarsest level within its error (%d triangles of %d) from the same vertices, and keeps the coarser levels under it" % [got.size() / 3, cooked.surface_get_array_index_len(0) / 3])
	ok(C.far_mesh(cooked, mid_err) == far, "and is made once")
	ok(C.far_mesh(cooked, 0.0) == cooked and C.far_mesh(cooked, float(lv[0]["edge"]) * 0.5) == cooked and C.far_mesh(no_lod, 1.0) == no_lod,
		"negative: with no error allowed, or none of the levels within it, or no levels at all, the far twin is the mesh itself")
	var S := KratorWorldStream.new()
	S.flora_lod_px = 1.0
	var e0 := S._flora_band_error("0")
	var e1 := S._flora_band_error("1")
	var e2 := S._flora_band_error("2")
	var em := S._flora_band_error("m")
	S.flora_lod_px = 0.0
	ok(e0 == 0.0 and e1 > 0.05 and e1 < e2 and e2 < em and em > 0.4 and em < 0.5 and S._flora_band_error("m") == 0.0,
		"the stream's flora bands allow a pixel's error at their near edge (%.2f, %.2f, %.2f m), none in the nearest, and none with the look's levels of detail off" % [e1, e2, em])
	S.free()
	var bs := ArrayMesh.new()
	bs.add_blend_shape("open")
	var sarr := SphereMesh.new().get_mesh_arrays()
	var shape := []
	shape.resize(Mesh.ARRAY_MAX)
	shape[Mesh.ARRAY_VERTEX] = sarr[Mesh.ARRAY_VERTEX]
	shape[Mesh.ARRAY_NORMAL] = sarr[Mesh.ARRAY_NORMAL]
	shape[Mesh.ARRAY_TANGENT] = sarr[Mesh.ARRAY_TANGENT]
	bs.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, sarr, [shape])
	ok(C.cook_mesh(bs) == bs, "negative: a mesh with blend shapes is kept as it came")


func _node_sig(n: Node) -> Dictionary:
	var sig := {"name": str(n.name), "class": n.get_class(), "xf": (n as Node3D).transform, "meta": {}}
	for k in n.get_meta_list():
		if str(k) != "krator_buf":
			sig["meta"][str(k)] = n.get_meta(k)
	var mesh: Mesh = null
	if n is MultiMeshInstance3D:
		var mm := (n as MultiMeshInstance3D).multimesh
		mesh = mm.mesh
		sig["mm"] = [mm.transform_format, mm.use_colors, mm.use_custom_data, mm.instance_count, mm.buffer]
		sig["aabb"] = (n as MultiMeshInstance3D).custom_aabb
		var mo := n.get_node_or_null("Motion") as KMotion
		if mo != null:
			sig["motion"] = [mo.track, mo.sel, mo.origin]
	elif n is MeshInstance3D:
		mesh = (n as MeshInstance3D).mesh
	if mesh != null:
		var surf := []
		for s in mesh.get_surface_count():
			var a := mesh.surface_get_arrays(s)
			surf.append([mesh.surface_get_format(s), a[Mesh.ARRAY_VERTEX], a[Mesh.ARRAY_INDEX], a[Mesh.ARRAY_NORMAL], a[Mesh.ARRAY_TEX_UV], a[Mesh.ARRAY_COLOR], a[Mesh.ARRAY_CUSTOM0]])
		sig["mesh"] = surf
	return sig


# the mesh-bearing nodes of a scene by name, in the order a walk of the tree meets them
func _sigs(scene: Node) -> Array:
	var out := []
	var stack: Array[Node] = [scene]
	while not stack.is_empty():
		var n: Node = stack.pop_back()
		var kids := n.get_children()
		for ci in range(kids.size() - 1, -1, -1):
			stack.append(kids[ci])
		if n is MultiMeshInstance3D or n is MeshInstance3D:
			out.append(_node_sig(n))
	return out


func _first_diff(a: Array, b: Array) -> String:
	if a.size() != b.size():
		return "%d nodes against %d" % [a.size(), b.size()]
	for i in a.size():
		for k in a[i]:
			if not b[i].has(k) or a[i][k] != b[i][k]:
				return "node %d (%s): %s" % [i, a[i]["name"], k]
	return ""


func _scenes() -> void:
	var C := KratorCook
	for case in ["res://data/world-lod/world.glb", "res://data/world-sedesert/world.glb"]:
		if not FileAccess.file_exists(case):
			ok(false, "%s is not in this checkout" % case)
			continue
		var tag: String = str(case).get_base_dir().get_file()
		var o1 := {}
		var o2 := {}
		var o3 := {}
		var cooked := C.scene(case, o1)
		var cached := C.scene(case, o2)
		C.on = 0
		var parsed := C.scene(case, o3)
		C.on = 1
		ok(cooked != null and cached != null and parsed != null and str(o1["cook"]["from"]) == "glb, cooked" and bool(o1["cook"]["saved"]) and str(o2["cook"]["from"]) == "cache" and str(o3["cook"]["from"]) == "glb",
			"%s: the first open parses and cooks it, the second reads the entry, and with the cook off it is parsed as before" % tag)
		var a := _sigs(parsed)
		var b := _sigs(cooked)
		var c := _sigs(cached)
		var motions := 0
		var instanced := 0
		for s in a:
			motions += 1 if s.has("motion") else 0
			instanced += 1 if s.has("mm") else 0
		ok(a.size() > 0 and _first_diff(a, b) == "" and _first_diff(a, c) == "",
			"%s: cooked and read back, its %d nodes (%d instanced, %d with a track) are the parsed ones: name, transform, metadata, rows, track and every surface's arrays (%s%s)" % [tag, a.size(), instanced, motions, _first_diff(a, b), _first_diff(a, c)])
		# every name the importer looks a node up by finds the same node
		var by_name := true
		for s in a:
			var n := cached.find_child(str(s["name"]), true, false)
			by_name = by_name and n != null and n.get_class() == str(s["class"])
		var lodded := 0
		var shadowed := 0
		var meshes := {}
		for n in cached.get_children():
			var mesh: Mesh = (n as MultiMeshInstance3D).multimesh.mesh if n is MultiMeshInstance3D else (n as MeshInstance3D).mesh
			if mesh == null or meshes.has(mesh):
				continue
			meshes[mesh] = true
			shadowed += 1 if (mesh as ArrayMesh).shadow_mesh != null else 0
			for s in mesh.get_surface_count():
				if not _lods_of(mesh as ArrayMesh, s).is_empty():
					lodded += 1
					break
		# (world-lod's meshes are boxes of twelve triangles: nothing to simplify)
		ok(by_name and shadowed == meshes.size() and (lodded > 0 or tag == "world-lod"), "%s: each is found by its name; of %d meshes read back %d have levels of detail and %d a shadow mesh" % [tag, meshes.size(), lodded, shadowed])
		var none := true
		for n in parsed.find_children("*", "MeshInstance3D", true, false) + parsed.find_children("*", "MultiMeshInstance3D", true, false):
			var mesh: Mesh = (n as MultiMeshInstance3D).multimesh.mesh if n is MultiMeshInstance3D else (n as MeshInstance3D).mesh
			if mesh is ArrayMesh and ((mesh as ArrayMesh).shadow_mesh != null or not _lods_of(mesh as ArrayMesh, 0).is_empty()):
				none = false
			if n.has_meta("krator_buf"):
				none = false
		ok(none, "negative: %s parsed without the cook has neither, and no node is left holding its rows twice" % tag)
		if tag == "world-sedesert":
			ok(motions > 0, "the case has moving items, so the track's round trip was checked")
		cooked.free()
		cached.free()
		parsed.free()
	# the importer takes either: the same world, the cook named in its report
	var wj := "res://data/world-lod/world.json"
	var w1 := KratorWorld.build(wj)
	C.on = 0
	var w0 := KratorWorld.build(wj)
	C.on = 1
	var r1: Dictionary = w1.get_meta("report")
	var r0: Dictionary = w0.get_meta("report")
	var items_same := w1.get_node("Items").get_child_count() == w0.get_node("Items").get_child_count() and w1.get_node("Buckets").get_child_count() == w0.get_node("Buckets").get_child_count()
	for i in mini(w1.get_node("Items").get_child_count(), w0.get_node("Items").get_child_count()):
		var x := w1.get_node("Items").get_child(i) as MultiMeshInstance3D
		var y := w0.get_node("Items").get_child(i) as MultiMeshInstance3D
		items_same = items_same and x.multimesh.buffer == y.multimesh.buffer and x.transform == y.transform and x.get_meta("krator") == y.get_meta("krator") and x.visible == y.visible
	var c1: Dictionary = (r1["counts"] as Dictionary).duplicate()
	var c0: Dictionary = (r0["counts"] as Dictionary).duplicate()
	c1.erase("load_ms")
	c0.erase("load_ms")
	ok(items_same and str(r1["cook"]["from"]) == "cache" and str(r0["cook"]["from"]) == "glb" and JSON.stringify(r1["gaps"]) == JSON.stringify(r0["gaps"]) and JSON.stringify(c1) == JSON.stringify(c0),
		"KratorWorld.build makes the same world from the entry as from the glb (%d items, %d buckets), and its report says which" % [w1.get_node("Items").get_child_count(), w1.get_node("Buckets").get_child_count()])
	w1.free()
	w0.free()
	# the stat index: written once, read back, and a hit hashes nothing
	C.flush()
	var ix = JSON.parse_string(FileAccess.get_file_as_string(folder + "/index.json"))
	ok(ix is Dictionary and int(ix["v"]) == C.VERSION and (ix["files"] as Dictionary).has("res://data/world-lod/world.glb") and str(ix["files"]["res://data/world-lod/world.glb"][2]) == FileAccess.get_md5("res://data/world-lod/world.glb"),
		"the stat index names each file by its size, time and MD5")
	var u := C.usage()
	ok(int(u["mesh"]) == 2 and int(u["mesh_bytes"]) > 0 and int(u["files"]) == int(u["tex"]) + int(u["mesh"]), "usage() counts the folder: %d maps, %d scenes, %.1f MB" % [u["tex"], u["mesh"], int(u["bytes"]) / 1048576.0])
	# negative: other settings are another entry
	C.lods = false
	var o4 := {}
	var nl := C.scene("res://data/world-lod/world.glb", o4)
	C.lods = true
	ok(nl != null and str(o4["cook"]["from"]) == "glb, cooked" and int(C.usage()["mesh"]) == 3, "negative: the same glb with levels of detail off is cooked again under its own entry")
	nl.free()


func _wiring() -> void:
	var wi := FileAccess.get_file_as_string("res://krator/world_import.gd")
	var km := FileAccess.get_file_as_string("res://krator/kmat.gd")
	var gl := FileAccess.get_file_as_string("res://krator/kground_layers.gd")
	ok(wi.contains("KratorCook.scene(gp, cooked)") and wi.contains("KratorCook.texture_file(") and km.contains("KratorCook.texture_file(path, role)") and gl.count("KratorCook.image_file(") == 3,
		"the world importer, the pack materials and the ground's layers all load through the cook")
	ok(not wi.contains("GLTFDocument.new()") and not wi.contains("load_webp_from_buffer") and not km.contains("load_webp_from_buffer"),
		"negative: none of them parses a glb or decodes a map on its own any more")
