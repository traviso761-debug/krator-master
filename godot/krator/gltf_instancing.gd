# EXT_mesh_gpu_instancing for Godot 4 (4.5 does not import it itself): a node that carries the extension becomes a
# MultiMeshInstance3D of its mesh, one instance per TRANSLATION / ROTATION / SCALE, coloured by a custom _COLOR
# (linear rgb) when there is one. godot/tools/spike_export.js writes it for three's InstancedMesh; core/export's world.glb
# (a node whose extras name a krator_item) also carries _AN, _AC2 (packed into the colour's alpha and the custom data, as
# the biome importer packs them), _AP0, _AP1 (kept as metadata) and _APH (an anim-phase beat), and a moving item its baked
# motion in extras.krator_motion, which a KMotion player replays (krator/kmotion.gd).
# Registered by krator/gltf_region.gd for runtime loads and by addons/krator_gltf for the editor's importer.
class_name KratorGltfInstancing
extends GLTFDocumentExtension

const EXT := "EXT_mesh_gpu_instancing"


func _get_supported_extensions() -> PackedStringArray:
	return PackedStringArray([EXT])


func _parse_node_extensions(state: GLTFState, gltf_node: GLTFNode, extensions: Dictionary) -> Error:
	if extensions.has(EXT):
		gltf_node.set_additional_data(EXT, extensions[EXT])
	return OK


func _generate_scene_node(state: GLTFState, gltf_node: GLTFNode, scene_parent: Node) -> Node3D:
	var ext = gltf_node.get_additional_data(EXT)
	if ext == null or gltf_node.mesh < 0:
		return null
	var attrs: Dictionary = ext.get("attributes", {})
	var T := _floats(state, attrs.get("TRANSLATION", -1))
	var R := _floats(state, attrs.get("ROTATION", -1))
	var S := _floats(state, attrs.get("SCALE", -1))
	var C := _floats(state, attrs.get("_COLOR", -1))
	var n := T.size() / 3 if T.size() > 0 else (R.size() / 4 if R.size() > 0 else S.size() / 3)
	var mesh: Mesh = state.get_meshes()[gltf_node.mesh].mesh.get_mesh()
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	var gi := state.get_nodes().find(gltf_node)
	var ex = (state.json["nodes"][gi] as Dictionary).get("extras", {}) if gi >= 0 else {}
	if ex is Dictionary and ex.has("krator_item"):
		# core/export's world.glb (core/export/07-core-export.js): a biome item, packed as krator/biome_import.gd packs it
		# (biomes/GODOT.md, "In Godot"): COLOR = (r, g, b, c2.r), INSTANCE_CUSTOM = (oct(aN).x, oct(aN).y, c2.g, c2.b)
		var AN := _floats(state, attrs.get("_AN", -1))
		var C2 := _floats(state, attrs.get("_AC2", -1))
		# an animated body (kind 'anim'): COLOR.a its path's radius (aP0.w), INSTANCE_CUSTOM = aP1 (shaders/anim_body.gdshaderinc)
		var P0 := _floats(state, attrs.get("_AP0", -1))
		var P1 := _floats(state, attrs.get("_AP1", -1))
		var PH := _floats(state, attrs.get("_APH", -1))   # an anim-phase body's beat: INSTANCE_CUSTOM.x
		mm.use_colors = true
		mm.use_custom_data = true
		mm.mesh = mesh
		mm.instance_count = n
		var buf := PackedFloat32Array()
		buf.resize(n * 20)
		for i in n:
			var q := Quaternion(R[i * 4], R[i * 4 + 1], R[i * 4 + 2], R[i * 4 + 3]) if R.size() > 0 else Quaternion.IDENTITY
			var s := Vector3(S[i * 3], S[i * 3 + 1], S[i * 3 + 2]) if S.size() > 0 else Vector3.ONE
			var bs := Basis(q).scaled_local(s)
			var b := i * 20
			buf[b] = bs.x.x; buf[b + 1] = bs.y.x; buf[b + 2] = bs.z.x; buf[b + 3] = T[i * 3] if T.size() > 0 else 0.0
			buf[b + 4] = bs.x.y; buf[b + 5] = bs.y.y; buf[b + 6] = bs.z.y; buf[b + 7] = T[i * 3 + 1] if T.size() > 0 else 0.0
			buf[b + 8] = bs.x.z; buf[b + 9] = bs.y.z; buf[b + 10] = bs.z.z; buf[b + 11] = T[i * 3 + 2] if T.size() > 0 else 0.0
			buf[b + 12] = C[i * 3] if C.size() > 0 else 1.0
			buf[b + 13] = C[i * 3 + 1] if C.size() > 0 else 1.0
			buf[b + 14] = C[i * 3 + 2] if C.size() > 0 else 1.0
			buf[b + 15] = C2[i * 3] if C2.size() > 0 else 1.0
			if AN.size() > 0:
				var e := KData.oct_encode(Vector3(AN[i * 3], AN[i * 3 + 1], AN[i * 3 + 2]))
				buf[b + 16] = e.x; buf[b + 17] = e.y
			buf[b + 18] = C2[i * 3 + 1] if C2.size() > 0 else 1.0
			buf[b + 19] = C2[i * 3 + 2] if C2.size() > 0 else 1.0
			if P1.size() > 0:
				buf[b + 15] = P0[i * 4 + 3] if P0.size() > 0 else 0.0
				buf[b + 16] = P1[i * 4]; buf[b + 17] = P1[i * 4 + 1]; buf[b + 18] = P1[i * 4 + 2]; buf[b + 19] = P1[i * 4 + 3]
			if PH.size() > 0:
				buf[b + 16] = PH[i]
		mm.buffer = buf
		var it := MultiMeshInstance3D.new()
		it.multimesh = mm
		it.name = gltf_node.resource_name
		it.set_meta("krator_instances", n)
		it.set_meta("krator_item", ex["krator_item"])
		for k in ["_AP0", "_AP1"]:   # a fauna path (biomes/GODOT.md): packed above for the anim shader, and kept as data
			if attrs.has(k):
				it.set_meta("krator" + k.to_lower(), _floats(state, attrs[k]))
		# a moving item's baked motion (biomes/GODOT.md, "Motion"): its fields in the extras, its arrays as accessors
		var mo = ex.get("krator_motion")
		if mo is Dictionary and mo.has("error"):
			it.set_meta("krator_motion_error", mo)
		elif mo is Dictionary:
			var tr := {"t0": float(mo["t0"]), "hz": float(mo["hz"]), "loop": float(mo["loop"]), "fade": float(mo["fade"]),
				"stride": int(mo["stride"]), "channels": mo["channels"], "period": _floats(state, int(mo["period"])),
				"start": _uints(state, int(mo["start"])), "frames": _uints(state, int(mo["frames"])), "data": _floats(state, int(mo["data"]))}
			var sel := PackedInt32Array()
			sel.resize(n)
			for i in n:
				sel[i] = i
			KMotion.attach(it, tr, sel, Vector3.ZERO)
		return it
	mm.use_colors = C.size() > 0
	mm.mesh = mesh
	mm.instance_count = n
	for i in n:
		var q := Quaternion(R[i * 4], R[i * 4 + 1], R[i * 4 + 2], R[i * 4 + 3]) if R.size() > 0 else Quaternion.IDENTITY
		var s := Vector3(S[i * 3], S[i * 3 + 1], S[i * 3 + 2]) if S.size() > 0 else Vector3.ONE
		var t := Vector3(T[i * 3], T[i * 3 + 1], T[i * 3 + 2]) if T.size() > 0 else Vector3.ZERO
		mm.set_instance_transform(i, Transform3D(Basis(q).scaled_local(s), t))
		if C.size() > 0:
			mm.set_instance_color(i, Color(C[i * 3], C[i * 3 + 1], C[i * 3 + 2]))
	if C.size() > 0:   # an instance colour reaches a StandardMaterial3D only through its vertex colour
		for si in mesh.get_surface_count():
			var m := mesh.surface_get_material(si)
			if m is BaseMaterial3D:
				(m as BaseMaterial3D).vertex_color_use_as_albedo = true
	var mmi := MultiMeshInstance3D.new()
	mmi.multimesh = mm
	mmi.name = gltf_node.resource_name
	mmi.set_meta("krator_instances", n)
	# core/tags: the side table the exporter writes in the node's extras (krator_records: one uid per instance, in the
	# order of the TRS rows above), so the editor's import route keeps it too (krator/gltf_region.gd does the same at runtime)
	if gi >= 0:
		if ex is Dictionary and ex.get("krator_records") is Array and (ex["krator_records"] as Array).size() == n:
			mmi.set_meta("krator_records", PackedStringArray(ex["krator_records"]))
			if ex.has("krator"):
				mmi.set_meta("krator_record", str(ex["krator"]))
			if ex.get("krator_index") is Array:
				mmi.set_meta("krator_index", PackedInt32Array(ex["krator_index"]))
	return mmi


# a uint32 accessor (componentType 5125), tightly packed
static func _uints(state: GLTFState, idx: int) -> PackedInt32Array:
	if idx < 0:
		return PackedInt32Array()
	var j: Dictionary = state.json
	var a: Dictionary = j["accessors"][idx]
	var v: Dictionary = j["bufferViews"][int(a["bufferView"])]
	var start := int(v.get("byteOffset", 0)) + int(a.get("byteOffset", 0))
	var buf: PackedByteArray = state.buffers[int(v["buffer"])]
	return buf.slice(start, start + int(a["count"]) * 4).to_int32_array()


# a float accessor, tightly packed (as the spike's exporter writes it)
static func _floats(state: GLTFState, idx: int) -> PackedFloat32Array:
	if idx < 0:
		return PackedFloat32Array()
	var j: Dictionary = state.json
	var a: Dictionary = j["accessors"][idx]
	var v: Dictionary = j["bufferViews"][int(a["bufferView"])]
	var comps := {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]] as int
	var start := int(v.get("byteOffset", 0)) + int(a.get("byteOffset", 0))
	var buf: PackedByteArray = state.buffers[int(v["buffer"])]
	return buf.slice(start, start + int(a["count"]) * comps * 4).to_float32_array()
