# Stage 5 (M1) Material Slice Loader & Godot Benchmark Helper (GRAPHICS-TERRAIN-PROPOSAL.md Section 6)
class_name KratorM1Slice
extends RefCounted

const LIB_SHADER := preload("res://shaders/library.gdshader")
const ARR_SHADER := preload("res://shaders/library_m1_array.gdshader")
const SLICE_DIR := "res://data/m1_slice"


static func read_manifest() -> Dictionary:
	var d = KData.read_json(SLICE_DIR + "/manifest.json")
	return d if d is Dictionary else {}


static func _load_img(rel_path: String, vram_mode := "none") -> Image:
	var p := SLICE_DIR + "/" + rel_path
	var bytes := FileAccess.get_file_as_bytes(p)
	var img := Image.new()
	var err := img.load_webp_from_buffer(bytes)
	if err != OK:
		return null
	if img.get_format() != Image.FORMAT_RGBA8:
		img.convert(Image.FORMAT_RGBA8)
	img.generate_mipmaps()
	if vram_mode == "bptc" and RenderingServer.has_os_feature("bptc"):
		img.compress(Image.COMPRESS_BPTC, Image.COMPRESS_SOURCE_GENERIC)
	elif vram_mode == "s3tc" and RenderingServer.has_os_feature("s3tc"):
		img.compress(Image.COMPRESS_S3TC, Image.COMPRESS_SOURCE_GENERIC)
	return img


static func build_variant_scene(manifest: Dictionary, mode_key: String, vram_mode := "none") -> Dictionary:
	var t0 := Time.get_ticks_usec()
	var lit_order: Array = manifest.get("litOrder", [])
	var variants: Dictionary = manifest.get("variants", {})

	var disk_key := "v1"
	var use_arrays := false
	match mode_key:
		"v1_three_maps":
			disk_key = "v1"; use_arrays = false
		"v2_two_maps_xy6":
			disk_key = "v2_xy6"; use_arrays = false
		"v2_two_maps_xy8":
			disk_key = "v2_xy8"; use_arrays = false
		"v2_two_maps_oct8":
			disk_key = "v2_oct8"; use_arrays = false
		"v3_arrays_three_maps":
			disk_key = "v1"; use_arrays = true
		"v4_arrays_two_maps":
			disk_key = "v2_oct8"; use_arrays = true

	var vd: Dictionary = variants.get(disk_key, {})
	var fams: Dictionary = vd.get("families", {})
	var pfmt := int(vd.get("packFormat", 1))
	var nenc := 1 if str(vd.get("normalEncoding", "xy6")) == "oct8" else 0

	var root_n := Node3D.new()
	root_n.name = "M1Slice_" + mode_key

	var img_bytes := 0
	var tex_objects := 0
	var max_samplers_ground := 0
	var max_samplers_hero := 0
	var ground_mat: ShaderMaterial = null
	var swatch_mats := {}

	if use_arrays:
		var alb_imgs: Array[Image] = []
		var nrc_imgs: Array[Image] = []
		var rgh_imgs: Array[Image] = []
		for fam_v in lit_order:
			var fam := str(fam_v)
			var e: Dictionary = fams[fam]
			var files: Dictionary = e["files"]
			var ia := _load_img(str(files["map"]), vram_mode)
			alb_imgs.append(ia)
			img_bytes += ia.get_data().size()
			if pfmt == 1:
				var inr := _load_img(str(files["normalMap"]), vram_mode)
				var irg := _load_img(str(files["roughnessMap"]), vram_mode)
				nrc_imgs.append(inr)
				rgh_imgs.append(irg)
				img_bytes += inr.get_data().size() + irg.get_data().size()
			else:
				var inc := _load_img(str(files["nrcMap"]), vram_mode)
				nrc_imgs.append(inc)
				img_bytes += inc.get_data().size()

		var alb_arr := Texture2DArray.new()
		alb_arr.create_from_images(alb_imgs)
		var nrc_arr := Texture2DArray.new()
		nrc_arr.create_from_images(nrc_imgs)
		var rgh_arr: Texture2DArray = null
		if pfmt == 1:
			rgh_arr = Texture2DArray.new()
			rgh_arr.create_from_images(rgh_imgs)
			tex_objects = 3
			max_samplers_ground = 3
			max_samplers_hero = 3
		else:
			tex_objects = 2
			max_samplers_ground = 2
			max_samplers_hero = 2

		ground_mat = ShaderMaterial.new()
		ground_mat.shader = ARR_SHADER
		ground_mat.set_shader_parameter("alb_arr", alb_arr)
		ground_mat.set_shader_parameter("nrc_arr", nrc_arr)
		if rgh_arr != null:
			ground_mat.set_shader_parameter("rgh_arr", rgh_arr)
		ground_mat.set_shader_parameter("use_nrc", pfmt == 2)
		ground_mat.set_shader_parameter("normal_enc", nenc)
		ground_mat.set_shader_parameter("blend_ground", true)
		ground_mat.set_shader_parameter("uv_repeat", 4.0)

		for idx in range(3, lit_order.size()):
			var fam := str(lit_order[idx])
			var e: Dictionary = fams[fam]
			var sm := ShaderMaterial.new()
			sm.shader = ARR_SHADER
			sm.set_shader_parameter("alb_arr", alb_arr)
			sm.set_shader_parameter("nrc_arr", nrc_arr)
			if rgh_arr != null:
				sm.set_shader_parameter("rgh_arr", rgh_arr)
			sm.set_shader_parameter("use_nrc", pfmt == 2)
			sm.set_shader_parameter("normal_enc", nenc)
			sm.set_shader_parameter("blend_ground", false)
			sm.set_shader_parameter("layer_idx", float(idx))
			sm.set_shader_parameter("uv_repeat", 2.0)
			sm.set_shader_parameter("specular_k", float(e.get("specular", 0.35)))
			sm.set_shader_parameter("pom_depth", float(e.get("pomDepth", 0.0)))
			var mv: Array = e.get("mipVariance", [])
			if mv.size() >= 8:
				sm.set_shader_parameter("mip_var_lo", Vector4(float(mv[0]), float(mv[1]), float(mv[2]), float(mv[3])))
				sm.set_shader_parameter("mip_var_hi", Vector4(float(mv[4]), float(mv[5]), float(mv[6]), float(mv[7])))
			swatch_mats[fam] = sm
	else:
		var cache := {}
		for fam_v in lit_order:
			var fam := str(fam_v)
			var e: Dictionary = fams[fam]
			var sm := KratorKmat._material(e, null, SLICE_DIR, cache, false)
			sm.set_shader_parameter("uv_scale", Vector3(4.0, 4.0, 1.0) if fam.begins_with("ground_") else Vector3(2.0, 2.0, 1.0))
			if fam == "ground_grass":
				ground_mat = sm
			elif not fam.begins_with("ground_"):
				swatch_mats[fam] = sm
		for k in cache:
			var t := cache[k] as Texture2D
			if t != null and t.get_image() != null:
				img_bytes += t.get_image().get_data().size()
				tex_objects += 1
		max_samplers_ground = 9 if pfmt == 1 else 6
		max_samplers_hero = 3 if pfmt == 1 else 2

	# Assemble swatch gallery geometry: ground plane + masonry wall + ashlar wall + granite boulder + glazed curved cylinder
	var g_mi := MeshInstance3D.new()
	g_mi.name = "Ground"
	var pm := PlaneMesh.new()
	pm.size = Vector2(14.0, 9.0)
	pm.material = ground_mat
	g_mi.mesh = pm
	root_n.add_child(g_mi)

	var m_mi := MeshInstance3D.new()
	m_mi.name = "MasonryWall"
	var bm1 := BoxMesh.new()
	bm1.size = Vector3(2.1, 2.2, 0.35)
	bm1.material = swatch_mats.get("masonry_wall")
	m_mi.mesh = bm1
	m_mi.position = Vector3(-3.45, 1.12, -0.3)
	m_mi.rotation.y = 0.28
	root_n.add_child(m_mi)

	var a_mi := MeshInstance3D.new()
	a_mi.name = "AshlarWall"
	var bm2 := BoxMesh.new()
	bm2.size = Vector3(2.1, 2.2, 0.35)
	bm2.material = swatch_mats.get("ashlar_wall")
	a_mi.mesh = bm2
	a_mi.position = Vector3(-1.12, 1.12, -0.45)
	a_mi.rotation.y = 0.16
	root_n.add_child(a_mi)

	var r_mi := MeshInstance3D.new()
	r_mi.name = "CliffRock"
	var sm_rock := SphereMesh.new()
	sm_rock.radius = 1.08
	sm_rock.height = 2.16
	sm_rock.radial_segments = 48
	sm_rock.rings = 24
	sm_rock.material = swatch_mats.get("cliff_rock")
	r_mi.mesh = sm_rock
	r_mi.position = Vector3(1.22, 1.08, -0.25)
	root_n.add_child(r_mi)

	var c_mi := MeshInstance3D.new()
	c_mi.name = "GlazedCeramic"
	var cm := CylinderMesh.new()
	cm.top_radius = 0.92
	cm.bottom_radius = 0.98
	cm.height = 2.15
	cm.radial_segments = 64
	cm.rings = 16
	cm.material = swatch_mats.get("glazed_ceramic")
	c_mi.mesh = cm
	c_mi.position = Vector3(3.42, 1.08, -0.15)
	root_n.add_child(c_mi)

	var build_ms := float(Time.get_ticks_usec() - t0) / 1000.0
	return {
		"node": root_n,
		"mode": mode_key,
		"loadMs": snappedf(build_ms, 0.01),
		"loadedImageMB": snappedf(float(img_bytes) / 1048576.0, 0.01),
		"textureObjects": tex_objects,
		"groundSamplers": max_samplers_ground,
		"heroSamplers": max_samplers_hero,
		"swatchMats": swatch_mats,
		"groundMat": ground_mat,
	}
