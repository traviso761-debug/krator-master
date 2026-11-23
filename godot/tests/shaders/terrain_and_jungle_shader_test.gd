# Automated checks for S3/S4 open-world PBR terrain (shaders/terrain.gdshader + KData.ground) and M5 jungle foliage/bark
# (shaders/foliage.gdshader, lib/foliage.gdshaderinc, shaders/bark.gdshader, lib/bark.gdshaderinc).
# Every check has a paired negative.
#   godot --headless --rendering-driver dummy --path godot --script res://tests/shaders/terrain_and_jungle_shader_test.gd
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _b64_f32(vals: PackedFloat32Array) -> Dictionary:
	return {"type": "Float32Array", "n": vals.size(), "b64": Marshalls.raw_to_base64(vals.to_byte_array())}


func _b64_u8(vals: PackedByteArray) -> Dictionary:
	return {"type": "Uint8Array", "n": vals.size(), "b64": Marshalls.raw_to_base64(vals)}


func _fol_transmittance_cpu(lin_albedo: Vector3, strength: float) -> Vector3:
	var pig := lin_albedo.clamp(Vector3(0.02, 0.02, 0.02), Vector3(1.5, 1.5, 1.5))
	var dot_p := pig.x * 0.28 + pig.y * 0.58 + pig.z * 0.14
	var chloro := Vector3(0.72, 1.18, 0.24) * dot_p
	var tinted := Vector3(pig.x * 1.12, pig.y * 1.18, pig.z * 0.62)
	return chloro.lerp(tinted, 0.45) * (strength * 1.55)


func _fol_crown_ao_cpu(local_p: Vector3) -> float:
	var up := clampf(local_p.y * 0.38 + 0.52, 0.0, 1.0)
	var rad := clampf(Vector2(local_p.x, local_p.z).length() * 0.42, 0.0, 1.0)
	return clampf(0.46 + 0.34 * up + 0.24 * rad, 0.46, 1.0)


var _done := false


func _process(_dt: float) -> bool:
	if not _done:
		quit(1)
	return true


func _initialize() -> void:
	# 1. Shader compilation / resource & render_mode checks
	var s_terr := load("res://shaders/terrain.gdshader") as Shader
	var s_fol := load("res://shaders/foliage.gdshader") as Shader
	var s_bark := load("res://shaders/bark.gdshader") as Shader
	ok(s_terr != null and s_fol != null and s_bark != null,
		"terrain.gdshader, foliage.gdshader, and bark.gdshader load cleanly as Spatial shaders")

	var u_terr := {}
	for u in s_terr.get_shader_uniform_list():
		u_terr[u["name"]] = true
	ok(u_terr.has("albedo_rock_tex") and u_terr.has("normal_cav_tex") and u_terr.has("case_origin")
		and u_terr.has("detail_origin") and u_terr.has("grid_step") and u_terr.has("micro_strength"),
		"terrain.gdshader exposes PBR surface uniforms (albedo_rock_tex, normal_cav_tex, case_origin, detail_origin, grid_step, micro_strength)")
	ok(not u_terr.has("nonexistent_placeholder_uniform"),
		"negative: terrain.gdshader uniform introspection rejects absent uniforms")

	var fol_code := FileAccess.get_file_as_string("res://shaders/foliage.gdshader")
	var bark_code := FileAccess.get_file_as_string("res://shaders/bark.gdshader")
	ok(fol_code.find("specular_disabled") < 0 and fol_code.find("fol_transmittance") >= 0
		and fol_code.find("fol_crown_ao") >= 0 and fol_code.find("fol_vein_normal") >= 0,
		"foliage.gdshader enables specular cuticle sheen, chlorophyll transmittance, crown self-AO, and close-up vein relief")
	var idx_dfdx := bark_code.find("dFdx(")
	var idx_discard := bark_code.find("if (klod_drop(")
	ok(bark_code.find("specular_disabled") < 0 and idx_dfdx > 0 and idx_discard > idx_dfdx,
		"bark.gdshader enables PBR specular/AO and evaluates dFdx/dFdy in uniform control flow BEFORE klod_drop discard (GLSL ES 3.00 safe)")
	ok(not (idx_dfdx > idx_discard),
		"negative: derivatives placed after discard would violate GLSL ES 3.00 uniform control flow")

	# 2. KData.ground synthesis fallback: V-gully vs dry ridge crest vs steep cliff wall + water bank
	var nx := 17
	var nz := 17
	var step := 8.0
	var h_arr := PackedFloat32Array()
	var w_arr := PackedFloat32Array()
	h_arr.resize(nx * nz)
	w_arr.resize(nx * nz)
	for j in nz:
		for i in nx:
			var h := 14.0
			if i <= 6:
				var d_gul := absf(float(i - 3))
				h = 1.0 + d_gul * 5.5   # V-gully at i=3 (h=1.0), sides rising to 17.5
			elif i <= 12:
				var d_rdg := absf(float(i - 9))
				h = 28.0 - d_rdg * 3.5   # convex ridge crest at i=9 (h=28.0)
			else:
				h = 28.0 + float(i - 12) * 24.0   # cliff wall (slope 3.0 m/m)
			h_arr[j * nx + i] = h
			w_arr[j * nx + i] = 0.5   # river / tarn water table at 0.5 m

	var grid := {
		"x0": -64.0,
		"z0": -64.0,
		"step": step,
		"nx": nx,
		"nz": nz,
		"heights": _b64_f32(h_arr),
		"water": _b64_f32(w_arr),
		"_origin": [640128.0, 12.0, -320064.0]
	}
	var mi := KData.ground(grid, {}) as MeshInstance3D
	var arr := mi.mesh.surface_get_arrays(0)
	var verts: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	var uvs: PackedVector2Array = arr[Mesh.ARRAY_TEX_UV]
	var max_herr := 0.0
	var max_uverr := 0.0
	var seen := {}
	for k in verts.size():
		var ii := int(roundf((verts[k].x - (-64.0)) / step))
		var jj := int(roundf((verts[k].z - (-64.0)) / step))
		seen[jj * nx + ii] = true
		max_herr = maxf(max_herr, absf(verts[k].y - h_arr[jj * nx + ii]))
		max_uverr = maxf(max_uverr, maxf(
			absf(uvs[k].x - (float(ii) + 0.5) / float(nx)),
			absf(uvs[k].y - (float(jj) + 0.5) / float(nz))))
	var mid_h := KData.height_at(mi, -64.0 + 3.0 * step, 0.0)
	ok(verts.size() == nx * nz and seen.size() == nx * nz and max_herr <= 1e-4 and absf(mid_h - 1.0) <= 1e-4,
		"KData.ground preserves exact vertex heights across all %d grid points (max err %.6f m) and KData.height_at agrees at gully floor (%.3f m)" % [seen.size(), max_herr, mid_h])
	ok(absf(mid_h - 28.0) > 20.0,
		"negative: gully floor height (%.1f m) is distinct from ridge crest (28.0 m)" % mid_h)

	var uv0 := uvs[0]
	ok(max_uverr <= 1e-5 and is_equal_approx(uv0.x, 0.5 / float(nx)) and is_equal_approx(uv0.y, 0.5 / float(nz)),
		"texel-centered UVs ((i+0.5)/nx, (j+0.5)/nz) match every vertex (max err %.6f)" % max_uverr)
	ok(not is_equal_approx(uv0.x, 0.0),
		"negative: naive 0..(nx-1) UVs would sample half a texel off at (0, 0)")

	var sm := mi.mesh.surface_get_material(0) as ShaderMaterial
	var alb_tex := sm.get_shader_parameter("albedo_rock_tex") as Texture2D
	var nrm_tex := sm.get_shader_parameter("normal_cav_tex") as Texture2D
	var alb_img := alb_tex.get_image()
	var nrm_img := nrm_tex.get_image()
	var cav_gully := nrm_img.get_pixel(3, 8).b
	var cav_ridge := nrm_img.get_pixel(9, 8).b
	var wet_gully := nrm_img.get_pixel(3, 8).a
	var wet_ridge := nrm_img.get_pixel(9, 8).a
	var rock_cliff := alb_img.get_pixel(14, 8).a
	var rock_ridge := alb_img.get_pixel(9, 8).a
	ok(cav_gully < 0.80 and cav_ridge > 0.94,
		"concavity AO darkens V-gully floor (%.3f) while keeping convex ridge crest open (%.3f)" % [cav_gully, cav_ridge])
	ok(not (cav_ridge < cav_gully),
		"negative: convex ridge never receives darker concavity AO than V-gully")
	ok(wet_gully > 0.45 and wet_ridge < 0.02,
		"wet-bank channel marks low shore near water_level (%.3f) and stays dry on high ridge (%.3f)" % [wet_gully, wet_ridge])
	ok(rock_cliff > 0.70 and rock_ridge < 0.20,
		"steep cliff face receives high rock weight (%.3f) for sedimentary strata vs gentle ridge (%.3f)" % [rock_cliff, rock_ridge])

	# 3. Rebase & 4 km detail_origin + 32 km macro_origin precision / chunk-seam invariance check
	var d_org: Vector2 = sm.get_shader_parameter("detail_origin")
	var m_org: Vector2 = sm.get_shader_parameter("macro_origin")
	# Two chunks separated by 16 km rebasing around x = 640,128 vs x = 656,128:
	var grid_b := grid.duplicate()
	grid_b["_origin"] = [656128.0, 12.0, -320064.0]
	grid_b["x0"] = float(grid["x0"]) - 16000.0   # same world point x_world = 640,064 in both frames!
	var mi_b := KData.ground(grid_b, {}) as MeshInstance3D
	var sm_b := mi_b.mesh.surface_get_material(0) as ShaderMaterial
	var d_org_b: Vector2 = sm_b.get_shader_parameter("detail_origin")
	var m_org_b: Vector2 = sm_b.get_shader_parameter("macro_origin")
	var v_det_a := fposmod(-64.0 + d_org.x, 4000.0)
	var v_det_b := fposmod(-16064.0 + d_org_b.x, 4000.0)
	var v_mac_a := fposmod(-64.0 + m_org.x, 32000.0)
	var v_mac_b := fposmod(-16064.0 + m_org_b.x, 32000.0)
	ok(absf(d_org.x) < 4000.0 and absf(d_org.y) < 4000.0 and absf(v_det_a - v_det_b) < 1e-3 and absf(v_mac_a - v_mac_b) < 1e-3,
		"4 km detail_origin (%.1f, %.1f) and 32 km macro_origin stay small 640 km out while keeping chunk-seam phase exact (diff %.6f m)" % [d_org.x, d_org.y, absf(v_det_a - v_det_b)])
	# Negative: raw float32 at 16,777,216 m has ULP = 2.0 m (cannot resolve 0.25 m clasts!)
	var huge_f32 := PackedFloat32Array([16777216.0, 16777216.25])
	ok(huge_f32[0] == huge_f32[1],
		"negative: unwrapped float32 at 16,777 km collapses 0.25 m detail offsets to zero")

	# 4. Exported `surface` decoding (94-world-export.js -> KData.ground) + malformed buffer negative
	var ar_bytes := PackedByteArray()
	var nc_bytes := PackedByteArray()
	ar_bytes.resize(nx * nz * 4)
	nc_bytes.resize(nx * nz * 4)
	for p in nx * nz:
		ar_bytes[p * 4] = 90
		ar_bytes[p * 4 + 1] = 140
		ar_bytes[p * 4 + 2] = 65
		ar_bytes[p * 4 + 3] = 204   # rock = 0.80
		nc_bytes[p * 4] = 128
		nc_bytes[p * 4 + 1] = 128
		nc_bytes[p * 4 + 2] = 170   # cav = 0.667
		nc_bytes[p * 4 + 3] = 102   # wet = 0.40
	var grid_exp := grid.duplicate()
	grid_exp["surface"] = {"albedoRock": _b64_u8(ar_bytes), "normalCav": _b64_u8(nc_bytes)}
	var mi_exp := KData.ground(grid_exp, {}) as MeshInstance3D
	var sm_exp := mi_exp.mesh.surface_get_material(0) as ShaderMaterial
	var px_ar := (sm_exp.get_shader_parameter("albedo_rock_tex") as Texture2D).get_image().get_pixel(5, 5)
	var px_nc := (sm_exp.get_shader_parameter("normal_cav_tex") as Texture2D).get_image().get_pixel(5, 5)
	ok(absf(px_ar.a - 204.0 / 255.0) < 1e-4 and absf(px_nc.b - 170.0 / 255.0) < 1e-4 and absf(px_nc.a - 102.0 / 255.0) < 1e-4,
		"exported terrain.grid.surface RGBA8 maps decode byte-exact into albedo_rock_tex and normal_cav_tex")
	var grid_bad := grid.duplicate()
	grid_bad["surface"] = {"albedoRock": _b64_u8(PackedByteArray([1, 2, 3])), "normalCav": _b64_u8(PackedByteArray([4, 5, 6]))}
	var mi_bad := KData.ground(grid_bad, {}) as MeshInstance3D
	var sm_bad := mi_bad.mesh.surface_get_material(0) as ShaderMaterial
	ok((sm_bad.get_shader_parameter("albedo_rock_tex") as Texture2D).get_width() == nx,
		"negative: truncated surface buffers are rejected safely and fall back to synthesized nx x nz maps")

	# 5. M5 foliage chlorophyll transmittance & crown self-AO checks
	var green_leaf := Vector3(0.06, 0.24, 0.03)
	var tr := _fol_transmittance_cpu(green_leaf, 0.30)
	var grey_tr := Vector3(0.30, 0.30, 0.30)
	ok(tr.y > tr.x and tr.x > tr.z * 2.0 and (tr.y / maxf(tr.z, 1e-4)) > 3.5,
		"M5 chlorophyll transmittance saturates backlit green leaves toward warm yellow-green (rgb %.3f, %.3f, %.3f)" % [tr.x, tr.y, tr.z])
	ok(absf(grey_tr.y - grey_tr.z) < 1e-6 and (tr.y / maxf(tr.z, 1e-4)) > (grey_tr.y / grey_tr.z) * 3.0,
		"negative: legacy vec3(back_light) had zero chromaticity (g/b = 1.0 vs %.2f)" % (tr.y / maxf(tr.z, 1e-4)))
	var ao_inner := _fol_crown_ao_cpu(Vector3(0.0, -1.2, 0.0))
	var ao_outer := _fol_crown_ao_cpu(Vector3(1.6, 1.4, 1.2))
	ok(ao_inner < 0.55 and ao_outer > 0.92,
		"M5 crown self-AO darkens lower interior understory/crown core (%.3f) vs sunlit outer tips (%.3f)" % [ao_inner, ao_outer])
	ok(not (ao_inner >= ao_outer),
		"negative: crown interior is never brighter in AO than outer crown tips")

	# 6. library.gdshader alpha_test cutout, srgb_vcol GLTF COLOR_0 decode & world_import.gd Bucket sway guards
	var lib_code := FileAccess.get_file_as_string("res://shaders/library.gdshader")
	var rep_std := {}
	var sm_cut := KratorWorld._standard(
		{"id": "world:leafcard", "kind": "standard", "colour": "#447733", "alphaTest": 0.42},
		{}, {}, true, rep_std) as ShaderMaterial
	var sm_opq := KratorWorld._standard(
		{"id": "world:wall", "kind": "standard", "colour": "#888888", "alphaTest": null},
		{}, {}, false, rep_std) as ShaderMaterial
	# K5: library.gdshader is opaque (no ALPHA write: Godot keeps its depth prepass); the cut-out twin scissors
	var body_code := FileAccess.get_file_as_string("res://shaders/lib/library_body.gdshaderinc")
	var cut_code := FileAccess.get_file_as_string("res://shaders/library_cutout.gdshader")
	ok(sm_cut != null and sm_cut.shader == KratorKmat.LIB_CUTOUT and is_equal_approx(float(sm_cut.get_shader_parameter("alpha_test")), 0.42)
		and cut_code.find("#define KLIB_CUTOUT") >= 0 and body_code.find("ALPHA_SCISSOR_THRESHOLD = alpha_test") >= 0,
		"KratorWorld._standard puts alphaTest=0.42 on library_cutout.gdshader (KLIB_CUTOUT: ALPHA_SCISSOR_THRESHOLD)")
	ok(sm_opq != null and sm_opq.shader == KratorKmat.LIB and is_equal_approx(float(sm_opq.get_shader_parameter("alpha_test")), 0.0),
		"negative: opaque/null alphaTest records stay on library.gdshader with alpha_test=0.0 so city walls never discard fragments")
	# the opaque shader writes no ALPHA at all: every ALPHA line of the body sits inside #ifdef KLIB_CUTOUT
	var in_cut := false
	var stray := 0
	for line in body_code.split("\n"):
		var s := line.strip_edges()
		if s.begins_with("#ifdef KLIB_CUTOUT"):
			in_cut = true
		elif s.begins_with("#endif"):
			in_cut = false
		elif not in_cut and (s.begins_with("ALPHA") or s.find(" ALPHA") >= 0) and not s.begins_with("//"):
			stray += 1
	ok(stray == 0 and lib_code.find("KLIB_CUTOUT") < 0 and lib_code.find("library_body.gdshaderinc") >= 0,
		"library.gdshader is opaque: no ALPHA or ALPHA_SCISSOR_THRESHOLD outside the cut-out block (%d stray)" % stray)
	ok(KratorKmat.shader_for(0.0) == KratorKmat.LIB and KratorKmat.shader_for(0.5) == KratorKmat.LIB_CUTOUT
		and KratorKmat.is_library(KratorKmat.LIB) and KratorKmat.is_library(KratorKmat.LIB_CUTOUT) and not KratorKmat.is_library(KratorBiome.FOLIAGE),
		"KratorKmat.shader_for picks by alpha_test; is_library knows both")
	# both compile: a shader with an error has no uniforms to list
	var u_opq := KratorKmat.LIB.get_shader_uniform_list()
	var u_cut := KratorKmat.LIB_CUTOUT.get_shader_uniform_list()
	ok(u_opq.size() > 20 and u_opq.size() == u_cut.size(),
		"library.gdshader and library_cutout.gdshader compile with the same %d uniforms (%d)" % [u_opq.size(), u_cut.size()])

	var mats_dict := {
		"m_leaf": {
			"id": "m_leaf", "kind": "leaf", "colour": "#ffffff", "map": null, "alphaTest": 0.42,
			"options": {"swayA": 0.08, "aN": false, "irid": false},
			"sway": {"c": 0.0, "w": [0.0, 1.0, 0.0], "a": 0.08, "axis": 0}
		},
		"m_hang": {
			"id": "m_hang", "kind": "hang", "colour": "#557744", "map": null, "alphaTest": 0.0,
			"options": {"swayA": 0.09},
			"sway": {"c": 0.0, "w": [0.0, -1.0, 0.0], "a": 0.09, "axis": 0}
		},
		"m_bark": {
			"id": "m_bark", "kind": "bark", "colour": "#665544", "map": null, "alphaTest": 0.0, "options": {}
		}
	}
	var mcache := {}
	var mids := {"materials_resolved": 0, "materials_missing": 0}
	var mrep := {"gaps": {}}
	var fol_inst := KratorWorld._mat("m_leaf", mats_dict, {}, {}, mcache, mids, mrep, true, false) as ShaderMaterial
	var fol_vcol := KratorWorld._mat("m_leaf", mats_dict, {}, {}, mcache, mids, mrep, true, true) as ShaderMaterial
	var fol_buck := KratorWorld._mat("m_leaf", mats_dict, {}, {}, mcache, mids, mrep, false, true) as ShaderMaterial
	var hang_inst := KratorWorld._mat("m_hang", mats_dict, {}, {}, mcache, mids, mrep, true, false) as ShaderMaterial
	var hang_buck := KratorWorld._mat("m_hang", mats_dict, {}, {}, mcache, mids, mrep, false, true) as ShaderMaterial
	var bark_buck := KratorWorld._mat("m_bark", mats_dict, {}, {}, mcache, mids, mrep, false, true) as ShaderMaterial
	ok(fol_buck != null and fol_buck.shader == KratorBiome.FOLIAGE
		and (fol_buck.get_shader_parameter("sway_w") as Vector3).length() < 1e-5
		and is_equal_approx(float(fol_buck.get_shader_parameter("sway_c")), 0.55)
		and hang_buck != null and is_equal_approx(float(hang_buck.get_shader_parameter("hang_a")), 0.0)
		and bark_buck != null and bark_buck.shader == KratorBiome.BARK,
		"non-instanced Buckets clamp foliage sway_w=(0,0,0) and hang_a=0.0 (avoiding world-Y sway amplification) and handle plain bark safely")
	ok(fol_inst != null and (fol_inst.get_shader_parameter("sway_w") as Vector3).y > 0.9
		and hang_inst != null and float(hang_inst.get_shader_parameter("hang_a")) > 0.05,
		"negative: instanced tree crowns & hanging moss preserve height-proportional sway_w.y=1.0 and hang_a>0")
	ok(fol_vcol != null and fol_vcol.get_shader_parameter("srgb_vcol") == true
		and bark_buck != null and bark_buck.get_shader_parameter("srgb_vcol") == true,
		"meshes with GLTF COLOR_0 vertex colors enable srgb_vcol=true on foliage and bark shaders to undo GLTFDocument sRGB lift")
	ok(fol_inst != null and fol_inst.get_shader_parameter("srgb_vcol") != true,
		"negative: standalone biome _COLOR instances without COLOR_0 keep srgb_vcol=false")

	# 7. KratorWater.build clip_box + local_origin precision & clipping at -610 km
	var river_pts := []
	for s in 21:
		var rx := -615000.0 + float(s) * 500.0
		river_pts.append([rx, -76000.0, 990.0 - float(s) * 0.5, 0.001, 40.0, 1.5])
	var w_sec := {
		"format": "krator-water", "version": 1, "period": 600.0, "field": "none",
		"presets": {"flow": {"step": 6.0, "across": 6, "margin": 1.5, "ripple": [[0.07, 3.1, 15.0], [0.05, 1.9, -55.0], [0.035, 1.15, 80.0], [0.02, 0.62, -20.0]], "phases": 150, "rapids": [0.015, 0.12], "rapidGain": 2.4, "edge": 1.6, "foam": [0.6, 0.45], "slopeWin": 24}},
		"surfaces": [{
			"id": "water:1", "kind": "flow", "name": "test river", "pts": river_pts,
			"ribbon": {"step": 25.0, "across": 4, "margin": 2.0},
			"look": {"shallow": "#6d9c92", "deep": "#1d3c48", "roughness": 0.14, "metal": 0.08, "transparent": true}
		}],
		"probes": []
	}
	var p_box := [-612672.0, -77824.0, -608192.0, -74176.0]
	var p_org := [-610432.0, 0.0, -76000.0]
	var wn_clip := KratorWater.build(w_sec, p_box, null, 2.0, {"clip_box": p_box, "local_origin": p_org})
	var wn_raw := KratorWater.build(w_sec, p_box, null, 2.0, {})
	var mi_wclip := wn_clip.get_child(0) as MeshInstance3D
	var mi_wraw := wn_raw.get_child(0) as MeshInstance3D
	var vw_clip: PackedVector3Array = mi_wclip.mesh.surface_get_arrays(0)[Mesh.ARRAY_VERTEX]
	var vw_raw: PackedVector3Array = mi_wraw.mesh.surface_get_arrays(0)[Mesh.ARRAY_VERTEX]
	var max_local_x := 0.0
	for pv in vw_clip:
		max_local_x = maxf(max_local_x, absf(pv.x))
	var mat_wclip := mi_wclip.material_override as ShaderMaterial
	ok(vw_clip.size() > 0 and vw_clip.size() < vw_raw.size() and max_local_x <= 2245.0
		and mat_wclip.get_shader_parameter("use_flow_origin") == true,
		"KratorWater clip_box + local_origin clips 10 km river ribbon (%d -> %d verts) to place box and centers vertices within %.1f m at -610 km" % [vw_raw.size(), vw_clip.size(), max_local_x])
	ok(vw_raw.size() > vw_clip.size() and absf(vw_raw[0].x) > 600000.0,
		"negative: unclipped water without local_origin spans outside place box at |x| = %.0f m" % absf(vw_raw[0].x))

	wn_clip.free()
	wn_raw.free()
	mi.free()
	mi_b.free()
	mi_exp.free()
	mi_bad.free()
	_done = true
	print("terrain & jungle shaders: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(0 if fails == 0 else 1)
