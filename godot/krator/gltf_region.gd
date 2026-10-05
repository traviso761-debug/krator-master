# A glTF region (godot/tools/spike_export.js: three's own GLTFExporter over part of a page) loaded at runtime.
# This is the "cheapest mesh path" of GODOT-PLAN.md Phase 7 item 4. Godot's runtime GLTFDocument does not turn
# extras into metadata, so they are copied here from the parsed JSON, node by node; the editor's importer has an
# option for it ("Import extras as metadata" / per-version naming: check the .glb's Import dock), which the spike
# should also try by dropping region.glb into the FileSystem dock.
class_name KratorGltf
extends RefCounted


static func build(path: String) -> Node3D:
	var t0 := Time.get_ticks_msec()
	var report := {"route": "glTF (three GLTFExporter r128)", "file": path, "gaps": {}, "counts": {}}
	_register_instancing()
	var doc := GLTFDocument.new()
	var state := GLTFState.new()
	var err := doc.append_from_file(path, state)
	if err != OK:
		var fail := Node3D.new()
		report["gaps"]["load"] = "GLTFDocument.append_from_file failed: %d" % err
		fail.set_meta("report", report)
		return fail
	var scene: Node = doc.generate_scene(state)
	var root := Node3D.new()
	root.name = "Region"
	root.add_child(scene)

	# extras -> metadata, by glTF node index
	var json: Dictionary = state.json
	var nodes: Array = json.get("nodes", [])
	var with_extras := 0
	for i in nodes.size():
		var nd: Dictionary = nodes[i]
		if not nd.has("extras"):
			continue
		var gn: Node = state.get_scene_node(i)
		if gn == null and nd.has("name"):
			# generate_scene can leave the index map short: fall back to the node's (unique) name
			gn = scene.find_child(str(nd["name"]).validate_node_name(), true, false)
		if gn == null:
			continue
		gn.set_meta("extras", nd["extras"])
		with_extras += 1
	# core/lod's render copies (extras.lodCopy): a page draws them in place of the originals, which it keeps in the scene
	# (on a layer the camera skips) with full detail and every tag. Both reach the glTF, so drawn together they
	# z-fight; the originals stay, and Godot's own LOD (visibility ranges, mesh LOD) takes the copies' job.
	var lod_copies := 0
	var drop: Array[Node] = []
	var walk: Array[Node] = [scene]
	while walk.size() > 0:
		var n: Node = walk.pop_back()
		var ex = n.get_meta("extras", {})
		if ex is Dictionary and ex.get("lodCopy", false):
			drop.append(n)
			continue
		for c in n.get_children():
			walk.append(c)
	for n in drop:
		lod_copies += 1
		n.get_parent().remove_child(n)
		n.queue_free()
	if lod_copies > 0:
		report["gaps"]["lod copies"] = "%d core/lod render copies dropped (the originals are in the file too; the exporter could leave them out)" % lod_copies
	var keys := {}
	for nd in nodes:
		if nd.has("extras"):
			for k in nd["extras"]:
				keys[k] = keys.get(k, 0) + 1

	# what came through: materials, textures, vertex colours
	var mats: Array = json.get("materials", [])
	var unlit := 0
	for m in mats:
		if m.has("extensions") and m["extensions"].has("KHR_materials_unlit"):
			unlit += 1
	var meshes := 0
	var tris := 0
	var instanced := 0
	var instances := 0
	var stack: Array[Node] = [scene]
	while stack.size() > 0:
		var n: Node = stack.pop_back()
		var mesh: Mesh = null
		var copies := 1
		if n is MeshInstance3D:
			mesh = (n as MeshInstance3D).mesh
		elif n is MultiMeshInstance3D and (n as MultiMeshInstance3D).multimesh:
			mesh = (n as MultiMeshInstance3D).multimesh.mesh
			copies = (n as MultiMeshInstance3D).multimesh.instance_count
			instanced += 1
			instances += copies
		if mesh:
			meshes += 1
			for s in mesh.get_surface_count():
				var a := mesh.surface_get_arrays(s)
				var idx = a[Mesh.ARRAY_INDEX]
				tris += (idx.size() if idx != null else a[Mesh.ARRAY_VERTEX].size()) / 3 * copies
		for c in n.get_children():
			stack.append(c)

	# library materials rebuilt from the build's pack (godot/data/<case>/tex: tools/textures/pack.py's output)
	var tex_dir := path.get_base_dir() + "/tex"
	if FileAccess.file_exists(tex_dir + "/pack.json"):
		var k := KratorKmat.apply(scene, state, tex_dir)
		report["materials_library"] = k
		if k.get("replaced", 0) > 0:
			report["gaps"]["library materials"] = "%d library surfaces rebuilt from the pack (%s) with the break-up; three's other hooks (wind, glow, the night light volume) stay lost" % [k["replaced"], ", ".join(PackedStringArray(k["families"].keys()))]

	# the exporter's own record of what it could not carry (region.dropped.json beside the .glb)
	var dropped_path := path.get_basename() + ".dropped.json"
	if FileAccess.file_exists(dropped_path):
		var dr: Dictionary = KData.read_json(dropped_path)
		root.set_meta("krator", dr)
		var dd: Dictionary = dr.get("dropped", {})
		if dd.get("hookedMaterials", 0) > 0:
			report["gaps"]["shader hooks"] = "%d materials carried a three.js onBeforeCompile hook (library break-up, tint, wind, glow): glTF keeps only the base PBR values" % dd["hookedMaterials"]
		if dd.get("shaderMaterials", 0) > 0:
			report["gaps"]["ShaderMaterial"] = "%d ShaderMaterials (water, sky, glow) became magenta stand-ins" % dd["shaderMaterials"]
		if dd.has("attributes"):
			report["gaps"]["attributes"] = "custom vertex attributes dropped: %s" % [dd["attributes"]]
		if dd.get("dataTextures", 0) > 0:
			report["gaps"]["DataTexture"] = "%d DataTextures could not be written as images" % dd["dataTextures"]
	if instanced > 0:
		report["gaps"]["instancing"] = "%d instanced meshes (%d instances) came in as MultiMeshes through EXT_mesh_gpu_instancing (krator/gltf_instancing.gd: Godot 4.5 has no importer for it); instances carry a colour, no tags" % [instanced, instances]
	else:
		report["gaps"]["instancing"] = "no instancing in this file: every InstancedMesh arrived merged into one mesh (an export without EXT_mesh_gpu_instancing)"
	if unlit > 0:
		report["gaps"]["unlit"] = "%d materials came through as KHR_materials_unlit (MeshBasicMaterial)" % unlit
	if keys.is_empty():
		report["gaps"]["tags"] = "no extras on any node: the page's userData held no tags to carry"
	report["counts"] = {"meshes": meshes, "triangles": tris, "multimeshes": instanced, "instances": instances, "materials": mats.size(), "images": json.get("images", []).size(),
		"nodes_with_extras": with_extras, "extras_keys": keys, "load_ms": Time.get_ticks_msec() - t0}
	# the page's core/tags records (tags.json beside the region, core/tags/README.md): kept whole on the root as
	# {id: record} in meta "tags", for gameplay queries. Meshes do not yet name their record (a glTF node carries no id)
	var tp := path.get_base_dir() + "/tags.json"
	if FileAccess.file_exists(tp):
		var t = KData.read_json(tp)
		if t is Dictionary and t.get("format") == "krator-tags":
			var by := {}
			var cls := {}
			for r in t["records"]:
				by[r["id"]] = r
				cls[r["class"]] = cls.get(r["class"], 0) + 1
			root.set_meta("tags", by)
			report["tags"] = {"build": t.get("build"), "records": by.size(), "classes": cls}
			report["gaps"]["tag nodes"] = "the core/tags records arrive as data (root meta 'tags', %d records); no mesh names its record yet: the exporter has to write each record's id into its node's extras" % by.size()
	root.set_meta("report", report)
	return root


static var _ext: GLTFDocumentExtension


static func _register_instancing() -> void:
	if _ext == null:
		_ext = preload("res://krator/gltf_instancing.gd").new()
		GLTFDocument.register_gltf_document_extension(_ext)
