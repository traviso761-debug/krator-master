# A krator-world (core/export, core/export/README.md: world.json beside world.glb, the library maps in tex/) to a Godot
# scene. It reuses the spike's importers rather than forking them: the meshes come through GLTFDocument and
# krator/gltf_instancing.gd (each item a MultiMesh, packed as krator/biome_import.gd packs it), materials are
# KratorBiome._material on the shared shaders, the terrain KratorField (krator/field_import.gd) or KData's grid, the
# atmosphere KratorAtmos.build_from (loaded by path), the stage krator/stage.gd (the caller applies root meta "stage", as spike.gd does).
#   "Items"    a MultiMeshInstance3D per item: meta krator_record (its item set), krator_records (a uid per instance, in
#              instance order), krator_index (each instance's index in its set), krator_set (the set's registry record)
#   "Buckets"  a MeshInstance3D per bucket: meta krator_records and krator_record_ids (the volumes it merges)
#   "Field" or "Terrain", and "Atmos" when the world has one
# Root meta: report (counts, ids, the sections' status, the export's own errors, the gaps), tags ({id: record}), stage,
# ground (the terrain node), world (the JSON minus items and buckets).
class_name KratorWorld
extends RefCounted

const CHUNK := 1200.0   # BIO.LOD.chunk


static func build(path: String) -> Node3D:
	var t0 := Time.get_ticks_msec()
	var root := Node3D.new()
	root.name = "World"
	var report := {"route": "krator-world (core/export)", "file": path, "gaps": {}, "counts": {}}
	root.set_meta("report", report)
	var d = KData.read_json(path)
	if not (d is Dictionary) or d.get("format") != "krator-world":
		report["gaps"]["format"] = "not a krator-world file"
		return root
	var dir := path.get_base_dir()
	report["sections"] = {}
	for s in d["sections"]:
		report["sections"][s] = d["sections"][s]["status"]
		if d["sections"][s]["status"] == "stub":
			report["gaps"]["section " + s] = "a stub: no module fills it yet (its contract is core/export/README.md's)"
	report["export_errors"] = d.get("errors", [])
	if (d.get("errors", []) as Array).size() > 0:
		report["gaps"]["export errors"] = "%d contributors failed in the page: %s" % [d["errors"].size(), JSON.stringify(d["errors"])]

	# the registry (core/tags): by id, for the side tables
	var by_id := {}
	if d.get("registry") is Dictionary:
		for r in d["registry"]["records"]:
			by_id[r["id"]] = r
		root.set_meta("tags", by_id)

	# textures: a PNG data URL, or a library map by reference (the build's pack in tex/: pack.json names its files)
	var tex := {}
	var texrec := {}
	var packs := {}
	var tc := {"png": 0, "library": 0, "missing": 0}
	for t in d["textures"]:
		texrec[t["id"]] = t
		var img: Texture2D = null
		if t.get("from") == "library":
			img = _library(dir, t, packs)
			if img:
				tc["library"] += 1
		elif t.has("png"):
			img = KData.texture_from_data_url(t["png"])
			if img:
				tc["png"] += 1
		if img == null:
			tc["missing"] += 1
		tex[t["id"]] = img
	var mats := {}
	for m in d["materials"]:
		mats[m["id"]] = m

	# the meshes: world.glb through GLTFDocument with the instancing extension (krator/gltf_instancing.gd)
	var scene: Node = null
	var gp := dir + "/" + str(d.get("glb", {}).get("file", "world.glb"))
	if FileAccess.file_exists(gp):
		KratorGltf._register_instancing()
		var doc := GLTFDocument.new()
		var state := GLTFState.new()
		var err := doc.append_from_file(gp, state)
		if err != OK:
			report["gaps"]["load"] = "GLTFDocument.append_from_file failed on %s: %d" % [gp, err]
			return root
		scene = doc.generate_scene(state)
	else:
		report["gaps"]["load"] = "no %s: this importer reads the split form (tools/harness.py export without --json)" % gp
		return root

	var ids := {"items": 0, "items_with_record": 0, "instances": 0, "instances_with_uid": 0, "sets_resolved": 0,
		"buckets": 0, "buckets_with_records": 0, "bucket_records": 0, "bucket_records_resolved": 0, "materials_resolved": 0, "materials_missing": 0}
	var items := Node3D.new()
	items.name = "Items"
	root.add_child(items)
	var mat_cache := {}
	for k in d["items"].size():
		var it: Dictionary = d["items"][k]
		var node := scene.find_child(str(it["glb"]["node"]), true, false) as MultiMeshInstance3D
		if node == null:
			report["gaps"]["item nodes"] = "item %s: no node %s in world.glb" % [it["id"], it["glb"]["node"]]
			continue
		node.get_parent().remove_child(node)
		node.owner = null
		node.name = "item_%d" % k
		items.add_child(node)
		var n: int = node.multimesh.instance_count
		node.material_override = _mat(it["material"], mats, tex, texrec, mat_cache, ids, report)
		_lod(node, it, report)
		node.set_meta("krator", {"id": it["id"], "kit": it["kit"], "name": it["name"], "label": it["label"],
			"material": it["material"], "dynamic": it["dynamic"], "count": n})
		ids["items"] += 1
		ids["instances"] += n
		if it.get("records") is Array and (it["records"] as Array).size() == n:
			node.set_meta("krator_record", it["record"])
			node.set_meta("krator_records", PackedStringArray(it["records"]))
			node.set_meta("krator_index", KData.ints(it["recordIndex"]))
			ids["items_with_record"] += 1
			if by_id.has(it["record"]):
				node.set_meta("krator_set", by_id[it["record"]])
				ids["sets_resolved"] += 1
			for u in it["records"]:
				if str(u).length() == 8:
					ids["instances_with_uid"] += 1
		if it["dynamic"]:
			report["gaps"]["fauna"] = "dynamic items (fauna on aP0/aP1 paths) are placed static: the anim kind has no Godot shader yet"
	var buckets := Node3D.new()
	buckets.name = "Buckets"
	root.add_child(buckets)
	var tris := 0
	for k in d["buckets"].size():
		var b: Dictionary = d["buckets"][k]
		var node := scene.find_child(str(b["glb"]["node"]), true, false) as MeshInstance3D
		if node == null:
			report["gaps"]["bucket nodes"] = "bucket %s: no node %s in world.glb" % [b["id"], b["glb"]["node"]]
			continue
		node.get_parent().remove_child(node)
		node.owner = null
		node.name = "bucket_%d" % k
		buckets.add_child(node)
		node.material_override = _mat(b["material"], mats, tex, texrec, mat_cache, ids, report)
		_lod(node, b, report)
		node.set_meta("krator", {"id": b["id"], "kit": b["kit"], "name": b["name"], "label": b["label"], "material": b["material"]})
		ids["buckets"] += 1
		if b.get("records") is Array:
			node.set_meta("krator_records", PackedStringArray(b["records"]))
			node.set_meta("krator_record_ids", PackedStringArray(b["recordIds"]))
			node.set_meta("krator_pieces", b.get("pieces", {}))
			ids["bucket_records"] += (b["records"] as Array).size()
			if (b["records"] as Array).size() > 0:
				ids["buckets_with_records"] += 1
			for i in (b["recordIds"] as Array).size():
				if by_id.has(b["recordIds"][i]) and by_id[b["recordIds"][i]]["uid"] == b["records"][i]:
					ids["bucket_records_resolved"] += 1
		tris += int(b["triangles"])
	scene.free()
	if ids["buckets"] > ids["buckets_with_records"]:
		report["gaps"]["bucket records"] = "%d of %d buckets name no record (pieces in no registered volume)" % [ids["buckets"] - ids["buckets_with_records"], ids["buckets"]]

	# the terrain: the page's field where it has one (a mesh on its own grid and a HeightMapShape3D), else the sampled grid
	var look = d["stage"].get("ground") if d.get("stage") is Dictionary else null
	var t = d.get("terrain")
	if t is Dictionary:
		var grid: Dictionary = t["grid"] if t.get("grid") is Dictionary else {}
		var g: Node3D = null
		if t.get("field") is Dictionary:
			var f := KField.from_export(t["field"])
			if f == null:
				report["gaps"]["field"] = "terrain.field is not a readable krator-field"
			else:
				g = KratorField.build(f, look, grid)
				report["field"] = g.get_meta("krator")
				if t.get("probes") is Dictionary:   # the page's own h at points off the lattice, against KField.h here
					var mx := 0.0
					var pts: Array = t["probes"]["points"]
					for p in pts:
						mx = max(mx, abs(f.h(float(p[0]), float(p[1])) - float(p[2])))
					report["terrain_probes"] = {"points": pts.size(), "max_abs_m": mx}
		elif not grid.is_empty():
			g = KData.ground(grid, look)
			report["gaps"]["field"] = "the terrain is the page's h sampled on a grid: the build bakes no core/terrain field"
		if g != null:
			if not grid.is_empty() and grid.get("water") is Dictionary and t.get("field") is Dictionary:
				var wm := KData.water_sheet(grid)
				if wm:
					g.add_child(wm)
			root.add_child(g)
			root.set_meta("ground", g)
	else:
		report["gaps"]["terrain"] = "no terrain section"

	if d.get("atmos") is Dictionary and d["atmos"].get("format") == "krator-atmos":
		# loaded by path, not by class name: atmos_import.gd reads the Atmos autoload, which a --script run compiles late
		var a: Node3D = load("res://krator/atmos_import.gd").build_from(d["atmos"], path + "#atmos")
		root.add_child(a)
		report["atmos"] = a.get_meta("report")
	if d.get("stage") is Dictionary:
		root.set_meta("stage", d["stage"])
	var meta := {}
	for k in d:
		if not (k in ["items", "buckets", "textures", "stage", "registry", "terrain", "atmos"]):
			meta[k] = d[k]
	root.set_meta("world", meta)
	root.set_meta("krator", {"box": d["box"], "build": d["build"], "convention": d["convention"]})
	report["counts"] = {"items": d["items"].size(), "instances": ids["instances"], "buckets": d["buckets"].size(), "triangles": tris,
		"materials": d["materials"].size(), "textures": tc, "records": by_id.size(), "load_ms": Time.get_ticks_msec() - t0}
	report["ids"] = ids
	if tc["missing"] > 0:
		report["gaps"]["textures"] = "%d textures have no image (an export without an encoder, or a library pack not copied to tex/)" % tc["missing"]
	return root


# a material by id, built once (KratorBiome._material: the foliage and bark shaders, the kits' kinds)
static func _mat(id: Variant, mats: Dictionary, tex: Dictionary, texrec: Dictionary, cache: Dictionary, ids: Dictionary, report: Dictionary) -> Material:
	if cache.has(id):
		ids["materials_resolved"] += 1
		return cache[id]
	if not mats.has(id):
		ids["materials_missing"] += 1
		report["gaps"]["materials"] = "a mesh names material %s, which the world does not hold" % id
		return null
	ids["materials_resolved"] += 1
	var m := KratorBiome._material(mats[id], tex, texrec, true, report)
	cache[id] = m
	return m


# a library map by reference: <dir>/tex/pack.json's family names its file for the slot (tools/textures/pack.py's output)
static func _library(dir: String, t: Dictionary, packs: Dictionary) -> Texture2D:
	var pj := dir + "/tex/pack.json"
	if not packs.has(pj):
		packs[pj] = KData.read_json(pj) if FileAccess.file_exists(pj) else {}
	var fams: Dictionary = (packs[pj] as Dictionary).get("families", {})
	var fam: Dictionary = fams.get(t["family"], {})
	var file = fam.get("files", {}).get(t["slot"])
	if file == null:
		return null
	var bytes := FileAccess.get_file_as_bytes(dir + "/tex/" + str(file))
	var img := Image.new()
	var err := img.load_webp_from_buffer(bytes) if str(file).ends_with(".webp") else img.load_png_from_buffer(bytes)
	if err != OK:
		return null
	img.generate_mipmaps()
	return ImageTexture.create_from_image(img)


# a LOD-chunked mesh: visibility measured from the chunk's centre, as KratorBiome places it (the node moves to the
# centre and its instances or vertices move back by as much)
static func _lod(gi: GeometryInstance3D, rec: Dictionary, report: Dictionary) -> void:
	var lod = rec.get("lod")
	if lod == null:
		return
	var c: PackedStringArray = str(lod["chunk"]).split(",")
	var o := Vector3((float(c[0]) + 0.5) * CHUNK, 0.0, (float(c[1]) + 0.5) * CHUNK)
	if gi is MultiMeshInstance3D:
		var mm: MultiMesh = (gi as MultiMeshInstance3D).multimesh
		var buf := mm.buffer   # through the buffer: headless, get_instance_transform answers the identity
		var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
		for i in mm.instance_count:
			buf[i * stride + 3] -= o.x
			buf[i * stride + 7] -= o.y
			buf[i * stride + 11] -= o.z
		mm.buffer = buf
	elif gi is MeshInstance3D:
		var src: Mesh = (gi as MeshInstance3D).mesh
		var out := ArrayMesh.new()
		for s in src.get_surface_count():
			var a := src.surface_get_arrays(s)
			var v: PackedVector3Array = a[Mesh.ARRAY_VERTEX]
			for i in v.size():
				v[i] -= o
			a[Mesh.ARRAY_VERTEX] = v
			out.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, a)
			out.surface_set_material(s, src.surface_get_material(s))
		(gi as MeshInstance3D).mesh = out
	gi.position = o
	KratorBiome._apply_lod(gi, rec, report)
