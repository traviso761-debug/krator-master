# Material-library surfaces back on a glTF region: three's GLTFExporter keeps only a library material's base PBR
# values (its hooks, its roughness map and the break-up are lost), but the material's extras still name it
# ({lib, fam}). This rebuilds each one from the build's own pack (tools/textures/pack.py: tex/pack.json and the
# processed maps, which already carry the tint, brightness and roughness lift) as the library surface (one of its three
# shaders: `variant`).
# Run after GLTFDocument.generate_scene; returns a summary for the spike's report.
class_name KratorKmat
extends RefCounted

# The library surface's three shaders (shaders/library_body.gdshaderinc; GODOT-LOOK-PLAN.md C5). One body, three render
# setups: a shader that writes ALPHA at all is drawn in the transparent pass, and one that culls no face rasterises both.
const LIB := preload("res://shaders/library.gdshader")                     # opaque, back faces culled
const LIB_TWOSIDED := preload("res://shaders/library_twosided.gdshader")   # opaque, both faces
const LIB_CUTOUT := preload("res://shaders/library_cutout.gdshader")       # both faces, an alpha scissor
# the share of a merged mesh's triangles that may wind against their normals before it is drawn on both faces
const WINDS_AGAINST_MAX := 0.01


# a library surface, whichever of the three shaders draws it
static func is_lib(sh: Shader) -> bool:
	return sh != null and (sh == LIB or sh == LIB_TWOSIDED or sh == LIB_CUTOUT)


# The shader a record takes: the cut-out for an alpha test with a map to cut by (without a map the test never ran), both
# faces where three draws both (doubleSided), else the opaque one with its back faces culled.
static func variant(double_sided: bool, alpha_test := 0.0, has_map := false) -> Shader:
	if alpha_test > 0.0 and has_map:
		return LIB_CUTOUT
	return LIB_TWOSIDED if double_sided else LIB


# A material's two-sided twin: the same parameters on LIB_TWOSIDED. Made once and kept on the material (meta
# krator_twosided), so every node that needs it shares one. Any other material comes back as it is.
static func twosided(m: Material) -> Material:
	var sm := m as ShaderMaterial
	if sm == null or sm.shader != LIB:
		return m
	if sm.has_meta("krator_twosided"):
		return sm.get_meta("krator_twosided")
	var t := sm.duplicate() as ShaderMaterial
	t.shader = LIB_TWOSIDED
	if t.has_meta("krator") and t.get_meta("krator") is Dictionary:
		var km: Dictionary = (t.get_meta("krator") as Dictionary).duplicate()
		km["shader"] = "library_twosided.gdshader"
		t.set_meta("krator", km)
	sm.set_meta("krator_twosided", t)
	return t


# does any instance of a MultiMesh mirror its mesh (a negative determinant)? Neither three nor Godot flips the winding of
# one instance, but the scene export bakes a mirrored InstancedMesh's own matrix into every instance (core/export
# 10-core-export-scene.js), where three had flipped the whole mesh
static func mirrored(mm: MultiMesh) -> bool:
	if mm == null or mm.transform_format != MultiMesh.TRANSFORM_3D:
		return false
	var st := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
	var buf := mm.buffer
	var n := mini(mm.instance_count, buf.size() / st)
	for i in n:
		var b := i * st
		if Vector3(buf[b], buf[b + 4], buf[b + 8]).cross(Vector3(buf[b + 1], buf[b + 5], buf[b + 9])).dot(Vector3(buf[b + 2], buf[b + 6], buf[b + 10])) < 0.0:
			return true
	return false


# The share of a mesh's triangles that wind against their own normals, on at most `cap` of them, evenly spaced (Godot's
# front face is clockwise). The scene export bakes each mesh's world matrix into a bucket's vertices and leaves the
# index order alone, so a mirrored mesh, which three drew with its winding flipped, arrives inside out.
static func winds_against(mesh: Mesh, cap := 2000) -> float:
	if mesh == null:
		return 0.0
	var rev := 0
	var tested := 0
	for s in mesh.get_surface_count():
		var arr := mesh.surface_get_arrays(s)
		if arr.size() <= Mesh.ARRAY_INDEX or not (arr[Mesh.ARRAY_VERTEX] is PackedVector3Array) or not (arr[Mesh.ARRAY_NORMAL] is PackedVector3Array):
			continue
		var v: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
		var nv: PackedVector3Array = arr[Mesh.ARRAY_NORMAL]
		if nv.size() != v.size():
			continue
		var has_idx: bool = arr[Mesh.ARRAY_INDEX] is PackedInt32Array and (arr[Mesh.ARRAY_INDEX] as PackedInt32Array).size() > 0
		var idx: PackedInt32Array = arr[Mesh.ARRAY_INDEX] if has_idx else PackedInt32Array()
		var tris := (idx.size() if has_idx else v.size()) / 3
		var step := maxi(1, int(ceil(float(tris) / float(maxi(cap, 1)))))
		for t in range(0, tris, step):
			var i0 := idx[t * 3] if has_idx else t * 3
			var i1 := idx[t * 3 + 1] if has_idx else t * 3 + 1
			var i2 := idx[t * 3 + 2] if has_idx else t * 3 + 2
			var g := (v[i2] - v[i0]).cross(v[i1] - v[i0])
			if g.length_squared() < 1e-14:
				continue
			tested += 1
			if g.dot(nv[i0] + nv[i1] + nv[i2]) < 0.0:
				rev += 1
	return float(rev) / float(tested) if tested > 0 else 0.0


# Back-face culling only where it is safe: a node drawn on the opaque, back-culled shader moves to its two-sided twin
# when its instances are mirrored (a MultiMesh) or too many of its triangles wind against their normals (a merged
# mesh). Returns why it moved, or "" when the node is left as it was (any other material is).
static func fit(gi: GeometryInstance3D) -> String:
	if gi == null:
		return ""
	var sm := gi.material_override as ShaderMaterial
	if sm == null or sm.shader != LIB:
		return ""
	var why := ""
	if gi is MultiMeshInstance3D:
		if mirrored((gi as MultiMeshInstance3D).multimesh):
			why = "mirrored instances"
	elif gi is MeshInstance3D:
		var share := winds_against((gi as MeshInstance3D).mesh)
		if share > WINDS_AGAINST_MAX:
			why = "%.1f%% of its triangles wind against their normals" % (share * 100.0)
	if why != "":
		gi.material_override = twosided(sm)
	return why


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
	# the catalog furniture's render families (extras {family}): vertex-coloured meshes with no UVs, whose map is a
	# DETAIL map the page projects triplanar from the mesh's own position (girder/src/48-detail.js), scaled by
	# 1/tile and brightened by 1/mean^2.2 so the vertex colours keep their brightness; those colours are sRGB values
	# the page linearises in its vertex shader (core/furnish srgbHook). StandardMaterial3D has all three built in
	for i in min(gmats.size(), imported.size()):
		var ex: Dictionary = gmats[i].get("extras", {})
		if not ex.has("family") or not (imported[i] is BaseMaterial3D):
			continue
		var bm := imported[i] as BaseMaterial3D
		bm.vertex_color_use_as_albedo = true
		bm.vertex_color_is_srgb = true
		var F = fams.get("f_" + str(ex["family"]))
		if F == null or bm.albedo_texture == null:
			out["unmatched"]["f_" + str(ex["family"])] = true
			continue
		var tile: float = F.get("scale", [1.0])[0]
		var mean: float = F.get("tint", {}).get("mean", 0.5)
		bm.uv1_triplanar = true
		bm.uv1_triplanar_sharpness = 4.0
		bm.uv1_scale = Vector3.ONE / max(tile, 0.01)
		# albedo_color is sRGB: 1/mean decodes to about 1/mean^2.2 in linear, the page's gain
		var g: float = 1.0 / max(mean, 0.05)
		bm.albedo_color = Color(g, g, g, bm.albedo_color.a)
		out["detail"] = out.get("detail", 0) + 1
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
						if nm.shader == LIB and mirrored((n as MultiMeshInstance3D).multimesh):   # the culled faces would be the visible ones
							nm = twosided(nm) as ShaderMaterial
							out["mirrored"] = out.get("mirrored", 0) + 1
					if (int(mesh.surface_get_format(s)) & Mesh.ARRAY_FORMAT_TANGENT) != 0:   # M10: the mesh's own frame for the normal map
						var tkey := [nm, "tangents"]
						if not cache.has(tkey):
							var tm := nm.duplicate() as ShaderMaterial
							tm.set_shader_parameter("mesh_tangents", true)
							cache[tkey] = tm
						nm = cache[tkey]
						out["tangents"] = out.get("tangents", 0) + 1
					mesh.surface_set_material(s, nm)
					out["replaced"] += 1
		for c in n.get_children():
			stack.append(c)
	return out


# VRAM compression of a loaded map (GRAPHIC-LOAD.md, recommendation 4): on by default since 2026-10-26, BC7 (BPTC) on a
# desktop GPU that has it, ASTC on mobile; KRATOR_VRAM=none keeps RGBA8 (the behaviour before), =s3tc (BC1/BC3), =bptc or
# =astc picks one. At load, not as an import preset: the maps are read at run time from an export's tex/ (webp and png
# through Image.load_*_from_buffer), never imported as resources, so a preset would not reach them. A renderer that reports
# no such format (the headless dummy) keeps RGBA8. role: albedo (sRGB), normal (two channels) or data (roughness, linear)
static func vram(img: Image, role := "albedo") -> void:
	var m := vram_mode()
	if m == "none":
		return
	var mode := Image.COMPRESS_S3TC if m == "s3tc" else (Image.COMPRESS_BPTC if m == "bptc" else Image.COMPRESS_ASTC)
	var src := Image.COMPRESS_SOURCE_NORMAL if role == "normal" else (Image.COMPRESS_SOURCE_GENERIC if role == "data" else Image.COMPRESS_SOURCE_SRGB)
	img.compress(mode, src)


# the compression in force: KRATOR_VRAM when set, else bptc on desktop and astc on mobile where the GPU has it, else none
static func vram_mode() -> String:
	var m := OS.get_environment("KRATOR_VRAM")
	if m != "":
		return m if m in ["none", "s3tc", "bptc", "astc"] else "none"
	if OS.has_feature("mobile"):
		return "astc" if RenderingServer.has_os_feature("astc") else "none"
	return "bptc" if RenderingServer.has_os_feature("bptc") else "none"


static func _tex(path: String, cache: Dictionary, role := "albedo") -> Texture2D:
	if cache.has(path):
		return cache[path]
	var img := Image.new()
	var bytes := FileAccess.get_file_as_bytes(path)
	var err := img.load_webp_from_buffer(bytes) if path.ends_with(".webp") else img.load_png_from_buffer(bytes)
	var t: Texture2D = null
	if err == OK:
		img.generate_mipmaps()
		vram(img, role)
		t = ImageTexture.create_from_image(img)
	cache[path] = t
	return t


static func _material(F: Dictionary, old: Material, tex_dir: String, cache: Dictionary, double_sided: bool) -> ShaderMaterial:
	var sm := ShaderMaterial.new()
	sm.shader = variant(double_sided)   # glTF carries three's side per material; a pack family has no alpha test
	var files: Dictionary = F.get("files", {})
	if files.has("map"):
		sm.set_shader_parameter("albedo_tex", _tex(tex_dir + "/" + files["map"], cache))
	if int(F.get("packVersion", 1)) == 2 and files.has("nrcMap"):
		sm.set_shader_parameter("use_nrc", true)
		sm.set_shader_parameter("nrc_tex", _tex(tex_dir + "/" + files["nrcMap"], cache, "data"))
		sm.set_shader_parameter("normal_enc", 1 if str(F.get("normalEncoding", "xy6")) == "oct8" else 0)
		sm.set_shader_parameter("pom_depth", float(F.get("pomDepth", 0.0)))
		var mv: Array = F.get("mipVariance", [])
		if mv.size() >= 8:
			sm.set_shader_parameter("mip_var_lo", Vector4(float(mv[0]), float(mv[1]), float(mv[2]), float(mv[3])))
			sm.set_shader_parameter("mip_var_hi", Vector4(float(mv[4]), float(mv[5]), float(mv[6]), float(mv[7])))
		sm.set_shader_parameter("has_normal", true)
		sm.set_shader_parameter("has_rough", true)
	else:
		sm.set_shader_parameter("use_nrc", false)
		sm.set_shader_parameter("has_normal", files.has("normalMap"))
		if files.has("normalMap"):
			sm.set_shader_parameter("normal_tex", _tex(tex_dir + "/" + files["normalMap"], cache, "normal"))
		sm.set_shader_parameter("has_rough", files.has("roughnessMap"))
		if files.has("roughnessMap"):
			sm.set_shader_parameter("rough_tex", _tex(tex_dir + "/" + files["roughnessMap"], cache, "data"))
	sm.set_shader_parameter("normal_scale", float(F.get("normalScale", 1.0)))
	sm.set_shader_parameter("weather_k", KratorWeather.amounts(F.get("lib")))   # the weathering stack's amounts, by class
	var d_sc = F.get("scale", [2.0, 2.0])
	KratorDetail.set_on(sm, KratorWeather.class_of(F.get("lib")) if files.has("map") else "", Vector2(float(d_sc[0]), float(d_sc[1])))
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
	sm.set_meta("krator", {"lib": F.get("lib"), "double_sided": double_sided, "pack_version": int(F.get("packVersion", 1))})
	return sm

