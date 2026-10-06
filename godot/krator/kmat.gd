# Material-library surfaces back on a glTF region: three's GLTFExporter keeps only a library material's base PBR
# values (its hooks, its roughness map and the break-up are lost), but the material's extras still name it
# ({lib, fam}). This rebuilds each one from the build's own pack (tools/textures/pack.py: tex/pack.json and the
# processed maps, which already carry the tint, brightness and roughness lift) as shaders/library.gdshader.
# Run after GLTFDocument.generate_scene; returns a summary for the spike's report.
class_name KratorKmat
extends RefCounted

const LIB := preload("res://shaders/library.gdshader")


static func apply(scene: Node, state: GLTFState, tex_dir: String) -> Dictionary:
	var out := {"replaced": 0, "families": {}, "unmatched": {}}
	var pack = KData.read_json(tex_dir + "/pack.json")
	if not (pack is Dictionary):
		out["error"] = "no pack at " + tex_dir
		return out
	var fams: Dictionary = pack["families"]
	var by_lib := {}
	for f in fams:
		if not by_lib.has(fams[f]["lib"]):
			by_lib[fams[f]["lib"]] = f
	var gmats: Array = state.json.get("materials", [])
	var imported: Array = state.get_materials()
	var swap := {}
	var cache := {}
	for i in min(gmats.size(), imported.size()):
		var ex: Dictionary = gmats[i].get("extras", {})
		if not ex.has("lib"):
			continue
		var fam = ex.get("fam")
		if fam == null or not fams.has(fam):
			fam = by_lib.get(ex["lib"])
		if fam == null:
			out["unmatched"][ex["lib"]] = true
			continue
		swap[imported[i]] = _material(fams[fam], imported[i], tex_dir, cache, gmats[i].get("doubleSided", false))
		out["families"][fam] = out["families"].get(fam, 0) + 1
	var stack: Array[Node] = [scene]
	while stack.size() > 0:
		var n: Node = stack.pop_back()
		var mesh: Mesh = null
		if n is MeshInstance3D:
			mesh = (n as MeshInstance3D).mesh
		elif n is MultiMeshInstance3D and (n as MultiMeshInstance3D).multimesh:
			mesh = (n as MultiMeshInstance3D).multimesh.mesh
		if mesh:
			for s in mesh.get_surface_count():
				var m := mesh.surface_get_material(s)
				if m and swap.has(m):
					var nm: ShaderMaterial = swap[m]
					if n is MultiMeshInstance3D:   # an instanced primitive: three tiles it in world units (applyWorldUV)
						if not cache.has(nm):
							var w := nm.duplicate() as ShaderMaterial
							w.set_shader_parameter("world_uv", true)
							cache[nm] = w
						nm = cache[nm]
						out["world_uv"] = out.get("world_uv", 0) + 1
					mesh.surface_set_material(s, nm)
					out["replaced"] += 1
		for c in n.get_children():
			stack.append(c)
	return out


static func _tex(path: String, cache: Dictionary) -> Texture2D:
	if cache.has(path):
		return cache[path]
	var img := Image.new()
	var bytes := FileAccess.get_file_as_bytes(path)
	var err := img.load_webp_from_buffer(bytes) if path.ends_with(".webp") else img.load_png_from_buffer(bytes)
	var t: Texture2D = null
	if err == OK:
		img.generate_mipmaps()
		t = ImageTexture.create_from_image(img)
	cache[path] = t
	return t


static func _material(F: Dictionary, old: Material, tex_dir: String, cache: Dictionary, double_sided: bool) -> ShaderMaterial:
	var sm := ShaderMaterial.new()
	sm.shader = LIB
	var files: Dictionary = F.get("files", {})
	if files.has("map"):
		sm.set_shader_parameter("albedo_tex", _tex(tex_dir + "/" + files["map"], cache))
	sm.set_shader_parameter("has_normal", files.has("normalMap"))
	if files.has("normalMap"):
		sm.set_shader_parameter("normal_tex", _tex(tex_dir + "/" + files["normalMap"], cache))
	sm.set_shader_parameter("has_rough", files.has("roughnessMap"))
	if files.has("roughnessMap"):
		sm.set_shader_parameter("rough_tex", _tex(tex_dir + "/" + files["roughnessMap"], cache))
	sm.set_shader_parameter("normal_scale", float(F.get("normalScale", 1.0)))
	sm.set_shader_parameter("metal", float(F.get("metal", 0.0)))
	sm.set_shader_parameter("specular_k", float(F.get("specular", 0.5)))
	var sc = F.get("scale", [2.0, 2.0])   # metres per tile
	sm.set_shader_parameter("tile_m", Vector2(float(sc[0]), float(sc[1])))
	var b = F.get("breakup")
	if b is Dictionary:
		sm.set_shader_parameter("bu_mix", float(b.get("mix", 0.0)))
		sm.set_shader_parameter("bu_macro", float(b.get("macro", 0.0)))
		sm.set_shader_parameter("bu_cell", float(b.get("cell", 8.0)))
	if old is BaseMaterial3D:   # the glTF texture transform (KHR_texture_transform) the importer put on the old material
		sm.set_shader_parameter("uv_scale", (old as BaseMaterial3D).uv1_scale)
		sm.set_shader_parameter("uv_offset", (old as BaseMaterial3D).uv1_offset)
	sm.set_meta("krator", {"lib": F.get("lib"), "double_sided": double_sided})
	return sm
