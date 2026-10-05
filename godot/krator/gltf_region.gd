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
	var stack: Array[Node] = [scene]
	while stack.size() > 0:
		var n: Node = stack.pop_back()
		if n is MeshInstance3D and (n as MeshInstance3D).mesh:
			meshes += 1
			var mesh: Mesh = (n as MeshInstance3D).mesh
			for s in mesh.get_surface_count():
				var a := mesh.surface_get_arrays(s)
				var idx = a[Mesh.ARRAY_INDEX]
				tris += (idx.size() if idx != null else a[Mesh.ARRAY_VERTEX].size()) / 3
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
	report["gaps"]["instancing"] = "glTF r128 has no instancing: every InstancedMesh arrives merged into one big mesh (no MultiMesh, no per-instance tags)"
	if unlit > 0:
		report["gaps"]["unlit"] = "%d materials came through as KHR_materials_unlit (MeshBasicMaterial)" % unlit
	if keys.is_empty():
		report["gaps"]["tags"] = "no extras on any node: the page's userData held no tags to carry"
	report["counts"] = {"meshes": meshes, "triangles": tris, "materials": mats.size(), "images": json.get("images", []).size(),
		"nodes_with_extras": with_extras, "extras_keys": keys, "load_ms": Time.get_ticks_msec() - t0}
	root.set_meta("report", report)
	return root
