# EXT_mesh_gpu_instancing for Godot 4 (4.5 does not import it itself): a node that carries the extension becomes a
# MultiMeshInstance3D of its mesh, one instance per TRANSLATION / ROTATION / SCALE, coloured by a custom _COLOR
# (linear rgb) when there is one. godot/tools/spike_export.js writes it for three's InstancedMesh.
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
	return mmi


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
