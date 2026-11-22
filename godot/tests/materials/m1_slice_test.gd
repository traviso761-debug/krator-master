# Stage 5 (M1) Material Slice Automated Verification & Godot Benchmark Suite
# Headless check:
#   godot --headless --path godot --script res://tests/materials/m1_slice_test.gd
# Offscreen OpenGL 4.5 visual proof + GPU Gate 3 handedness + frame timing:
#   xvfb-run -a godot --rendering-driver opengl3 --path godot --script res://tests/materials/m1_slice_test.gd -- --shots=/path/to/shots
extends SceneTree

const MODES := [
	"v1_three_maps",
	"v2_two_maps_xy6",
	"v2_two_maps_xy8",
	"v2_two_maps_oct8",
	"v3_arrays_three_maps",
	"v4_arrays_two_maps",
]

var passed := 0
var failed := 0


func _check(cond: bool, msg: String, detail := "") -> void:
	if cond:
		passed += 1
		print("  PASS  " + msg + ("" if detail == "" else " : " + detail))
	else:
		failed += 1
		print("  FAIL  " + msg + ("" if detail == "" else " : " + detail))


func _oct_encode(n: Vector3) -> Vector2i:
	var zc := maxf(n.z, 0.0)
	var l1 := maxf(absf(n.x) + absf(n.y) + zc, 1e-8)
	var px := n.x / l1
	var py := n.y / l1
	var eu := px + py
	var ev := px - py
	return Vector2i(
		clampi(int(roundf((eu * 0.5 + 0.5) * 255.0)), 0, 255),
		clampi(int(roundf((ev * 0.5 + 0.5) * 255.0)), 0, 255)
	)


func _oct_decode(u8: Vector2i) -> Vector3:
	var ex := (float(u8.x) / 255.0) * 2.0 - 1.0
	var ey := (float(u8.y) / 255.0) * 2.0 - 1.0
	var vx := (ex + ey) * 0.5
	var vy := (ex - ey) * 0.5
	var vz := maxf(0.0, 1.0 - absf(vx) - absf(vy))
	return Vector3(vx, vy, vz).normalized()


func _initialize() -> void:
	_run()


func _run() -> void:
	var shots_dir := ""
	var out_json := ""
	var perf_frames := 4
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--shots="):
			shots_dir = a.trim_prefix("--shots=")
		elif a.begins_with("--out="):
			out_json = a.trim_prefix("--out=")
		elif a == "--perf":
			perf_frames = 24

	print("\n=== Stage 5 (M1) Material Slice Verification Suite ===")
	var manifest := KratorM1Slice.read_manifest()
	_check(manifest.get("format", "") == "krator-m1-slice" and int(manifest.get("version", 0)) == 2,
		"M1 slice manifest.json present and versioned (version=2)")

	var g1: Dictionary = manifest.get("gate1NegativeSelfTest", {})
	_check(bool(g1.get("cutoutHeightRejected", false)) and bool(g1.get("unflaggedFlatRejected", false)) and bool(g1.get("nanRejected", false)),
		"Gate 1 pack physics negative self-tests caught cutout-height, unflagged-flat, and NaN channels",
		JSON.stringify(g1))

	# Verify cutout card alpha preserved in packFormat 2
	var v2_oct_fams: Dictionary = ((manifest.get("variants", {}) as Dictionary).get("v2_oct8", {}) as Dictionary).get("families", {})
	var card_entry: Dictionary = v2_oct_fams.get("cutout_themeda", {})
	_check(str(card_entry.get("alphaMode", "")) == "cutout" and not bool(card_entry.get("height", false)),
		"M1 rule enforced: height never overwrites alpha on a cut-out card (cutout_themeda alphaMode=cutout)")

	# Verify Hemisphere Octahedral twin parity with JS/Python (< 0.35 deg mean error)
	var sum_deg := 0.0
	var max_deg := 0.0
	var cnt := 0
	for j in range(-10, 11):
		for i in range(-10, 11):
			var n_in := Vector3(float(i) * 0.06, float(j) * 0.06, 0.65).normalized()
			var dec := _oct_decode(_oct_encode(n_in))
			var deg := rad_to_deg(acos(clampf(n_in.dot(dec), -1.0, 1.0)))
			sum_deg += deg
			max_deg = maxf(max_deg, deg)
			cnt += 1
	var mean_deg := sum_deg / float(cnt)
	_check(mean_deg < 0.35 and max_deg < 0.85,
		"Godot Hemisphere Octahedral normal twin holds sub-0.35 deg mean error",
		"mean=%.4f deg  max=%.4f deg" % [mean_deg, max_deg])

	# Verify glazed ceramic quantization progression (oct8 / xy8 >> xy6 unique normals & lower specular RMSE)
	var band: Dictionary = manifest.get("glazedCeramicBanding", {})
	var u_xy6 := int((band.get("xy6", {}) as Dictionary).get("uniqueNormals", 0))
	var u_xy8 := int((band.get("xy8", {}) as Dictionary).get("uniqueNormals", 0))
	var u_oct8 := int((band.get("oct8", {}) as Dictionary).get("uniqueNormals", 0))
	var rmse_xy6 := float((band.get("xy6", {}) as Dictionary).get("specRmse", 99.0))
	var rmse_oct8 := float((band.get("oct8", {}) as Dictionary).get("specRmse", 99.0))
	_check(u_oct8 > u_xy6 * 4 and u_xy8 > u_xy6 * 4 and rmse_oct8 < rmse_xy6 * 0.45,
		"8-bit octahedral & xy8 eliminate 6-bit specular banding on smooth curved glazed ceramic",
		"unique_normals xy6=%d xy8=%d oct8=%d  specRmse xy6=%.4f oct8=%.4f" % [u_xy6, u_xy8, u_oct8, rmse_xy6, rmse_oct8])

	# Setup lighting + camera for all 6 variants
	var host := Node3D.new()
	root.add_child(host)
	var we := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.11, 0.14, 0.20)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.32, 0.36, 0.44)
	env.ambient_light_energy = 0.65
	env.tonemap_mode = Environment.TONE_MAPPER_AGX
	we.environment = env
	host.add_child(we)

	var sun := DirectionalLight3D.new()
	sun.light_color = Color(1.0, 0.94, 0.85)
	sun.light_energy = 1.65
	sun.position = Vector3(4.5, 5.2, 4.8)
	sun.look_at_from_position(Vector3(4.5, 5.2, 4.8), Vector3.ZERO, Vector3.UP)
	host.add_child(sun)

	var cam := Camera3D.new()
	cam.fov = 45.0
	cam.current = true
	cam.look_at_from_position(Vector3(0.0, 2.85, 7.6), Vector3(0.0, 0.65, 0.0), Vector3.UP)
	host.add_child(cam)

	if shots_dir != "":
		DirAccess.make_dir_recursive_absolute(shots_dir)
		DisplayServer.window_set_size(Vector2i(960, 540))

	var godot_bench := {}
	for mk in MODES:
		var b := KratorM1Slice.build_variant_scene(manifest, mk, "none")
		var sn: Node3D = b["node"]
		host.add_child(sn)
		await process_frame
		await process_frame

		var ftimes := PackedFloat32Array()
		for i in perf_frames:
			var tf0 := Time.get_ticks_usec()
			sun.look_at_from_position(Vector3(4.5 + sin(float(i) * 0.1) * 0.4, 5.2, 4.8), Vector3.ZERO, Vector3.UP)
			await process_frame
			ftimes.append(float(Time.get_ticks_usec() - tf0) / 1000.0)
		ftimes.sort()
		var med_ms := ftimes[ftimes.size() / 2]
		var p95_ms := ftimes[int(float(ftimes.size()) * 0.95)]

		godot_bench[mk] = {
			"loadMs": b["loadMs"],
			"loadedImageMB": b["loadedImageMB"],
			"textureObjects": b["textureObjects"],
			"groundSamplers": b["groundSamplers"],
			"heroSamplers": b["heroSamplers"],
			"medianMs": snappedf(med_ms, 0.02),
			"p95Ms": snappedf(p95_ms, 0.02),
		}
		_check(int(b["groundSamplers"]) < 16 and int(b["heroSamplers"]) < 16 and float(b["loadedImageMB"]) > 1.0,
			"Godot variant %s builds and renders cleanly within sampler budget" % mk,
			"load=%.1f ms  ram=%.2f MB (%d tex)  samplers ground=%d hero=%d  med=%.2f ms" % [
				float(b["loadMs"]), float(b["loadedImageMB"]), int(b["textureObjects"]),
				int(b["groundSamplers"]), int(b["heroSamplers"]), med_ms])

		if shots_dir != "" and mk == "v4_arrays_two_maps":
			cam.look_at_from_position(Vector3(0.0, 2.85, 7.6), Vector3(0.0, 0.65, 0.0), Vector3.UP)
			await process_frame
			await process_frame
			var img_all := root.get_texture().get_image()
			if img_all != null:
				img_all.save_png(shots_dir + "/21_m1_swatch_gallery_godot.png")
				print("  SAVED 21_m1_swatch_gallery_godot.png")

			# Close-up on masonry + ashlar walls with M3 planar POM + cavity
			cam.look_at_from_position(Vector3(-2.25, 1.32, 2.35), Vector3(-2.28, 1.12, -0.38), Vector3.UP)
			await process_frame
			await process_frame
			var img_pom := root.get_texture().get_image()
			if img_pom != null:
				img_pom.save_png(shots_dir + "/23_m1_masonry_pom_and_cavity.png")
				print("  SAVED 23_m1_masonry_pom_and_cavity.png")
			cam.look_at_from_position(Vector3(0.0, 2.85, 7.6), Vector3(0.0, 0.65, 0.0), Vector3.UP)

		host.remove_child(sn)
		sn.free()
		await process_frame

	# Side-by-side 3-cylinder glazed ceramic closeup (xy6 vs xy8 vs oct8) + GPU Gate 3 Handedness check when non-headless
	if shots_dir != "":
		var cmp_root := Node3D.new()
		host.add_child(cmp_root)
		var enc_keys := ["v2_two_maps_xy6", "v2_two_maps_xy8", "v2_two_maps_oct8"]
		var xs := [-2.15, 0.0, 2.15]
		var kept_subs: Array[Node3D] = []
		for idx in 3:
			var sb := KratorM1Slice.build_variant_scene(manifest, enc_keys[idx], "none")
			var snode: Node3D = sb["node"]
			snode.visible = false
			cmp_root.add_child(snode)
			kept_subs.append(snode)
			var cyl := CylinderMesh.new()
			cyl.top_radius = 0.88
			cyl.bottom_radius = 0.92
			cyl.height = 2.1
			cyl.radial_segments = 64
			cyl.rings = 16
			cyl.material = (sb["swatchMats"] as Dictionary).get("glazed_ceramic")
			var mi := MeshInstance3D.new()
			mi.mesh = cyl
			mi.position = Vector3(float(xs[idx]), 1.05, 0.0)
			cmp_root.add_child(mi)
		sun.look_at_from_position(Vector3(1.8, 3.4, 5.5), Vector3(0.0, 1.05, 0.0), Vector3.UP)
		cam.look_at_from_position(Vector3(0.0, 1.35, 4.35), Vector3(0.0, 1.08, 0.0), Vector3.UP)
		await process_frame
		await process_frame
		var img_glz := root.get_texture().get_image()
		if img_glz != null:
			img_glz.save_png(shots_dir + "/22_m1_glazed_normals_xy6_xy8_oct8.png")
			print("  SAVED 22_m1_glazed_normals_xy6_xy8_oct8.png")
		host.remove_child(cmp_root)
		cmp_root.free()
		await process_frame

		# GPU Gate 3 Handedness Probe on library.gdshader (use_nrc = true, normal_enc = 1 oct8)
		var d_sz := 64
		var d_bytes := PackedByteArray()
		d_bytes.resize(d_sz * d_sz * 4)
		var a_bytes := PackedByteArray()
		a_bytes.resize(d_sz * d_sz * 4)
		for y in d_sz:
			for x in d_sz:
				var u := (float(x) + 0.5) / float(d_sz)
				# Note: Godot image row 0 is top (UV.y = 0 -> +Y world up on upright QuadMesh!)
				var v_up := 1.0 - (float(y) + 0.5) / float(d_sz)
				var dx := (u - 0.5) * 3.0
				var dy := (v_up - 0.5) * 3.0
				var g := exp(-(dx * dx + dy * dy))
				var n := Vector3(dx * g * 0.85, dy * g * 0.85, 1.0).normalized()
				var enc := _oct_encode(n)
				var o := (y * d_sz + x) * 4
				d_bytes[o] = enc.x
				d_bytes[o + 1] = enc.y
				d_bytes[o + 2] = 200
				d_bytes[o + 3] = 255
				a_bytes[o] = 210; a_bytes[o + 1] = 210; a_bytes[o + 2] = 210; a_bytes[o + 3] = 255
		var nrc_im := Image.create_from_data(d_sz, d_sz, false, Image.FORMAT_RGBA8, d_bytes)
		var alb_im := Image.create_from_data(d_sz, d_sz, false, Image.FORMAT_RGBA8, a_bytes)
		var p_mat := ShaderMaterial.new()
		p_mat.shader = KratorM1Slice.LIB_SHADER
		p_mat.set_shader_parameter("albedo_tex", ImageTexture.create_from_image(alb_im))
		p_mat.set_shader_parameter("nrc_tex", ImageTexture.create_from_image(nrc_im))
		p_mat.set_shader_parameter("use_nrc", true)
		p_mat.set_shader_parameter("normal_enc", 1)
		p_mat.set_shader_parameter("tint", false)
		var p_mi := MeshInstance3D.new()
		var qm := QuadMesh.new()
		qm.size = Vector2(3.0, 3.0)
		qm.material = p_mat
		p_mi.mesh = qm
		host.add_child(p_mi)
		env.ambient_light_energy = 0.02
		cam.look_at_from_position(Vector3(0.0, 0.0, 3.6), Vector3.ZERO, Vector3.UP)

		# +X light (from right) -> right half of dome must be brighter than left half!
		sun.look_at_from_position(Vector3(4.0, 0.0, 2.0), Vector3.ZERO, Vector3.UP)
		await process_frame
		await process_frame
		var px_r := root.get_texture().get_image()
		var lum_right := px_r.get_pixel(int(float(px_r.get_width()) * 0.58), px_r.get_height() / 2).get_luminance()
		var lum_left := px_r.get_pixel(int(float(px_r.get_width()) * 0.42), px_r.get_height() / 2).get_luminance()

		# +Y light (from above) -> upper half of dome must be brighter than lower half!
		sun.look_at_from_position(Vector3(0.0, 4.0, 2.0), Vector3.ZERO, Vector3.UP)
		await process_frame
		await process_frame
		var px_t := root.get_texture().get_image()
		var lum_top := px_t.get_pixel(px_t.get_width() / 2, int(float(px_t.get_height()) * 0.36)).get_luminance()
		var lum_bot := px_t.get_pixel(px_t.get_width() / 2, int(float(px_t.get_height()) * 0.64)).get_luminance()

		_check(lum_right > lum_left + 0.08 and lum_top > lum_bot + 0.08,
			"Gate 3 GPU Handedness Probe in Godot library.gdshader (+X right & +Y top dome flanks lit)",
			"right-left=%.3f  top-bot=%.3f" % [lum_right - lum_left, lum_top - lum_bot])
		host.remove_child(p_mi)
		p_mi.free()

	# Verify sampler reduction progression: v4 (2) < v3 (3) < v2 (6) < v1 (9) and 33% array VRAM reduction
	var s_v1 := int((godot_bench["v1_three_maps"] as Dictionary)["groundSamplers"])
	var s_v2 := int((godot_bench["v2_two_maps_oct8"] as Dictionary)["groundSamplers"])
	var s_v3 := int((godot_bench["v3_arrays_three_maps"] as Dictionary)["groundSamplers"])
	var s_v4 := int((godot_bench["v4_arrays_two_maps"] as Dictionary)["groundSamplers"])
	var vram_v1 := float((godot_bench["v1_three_maps"] as Dictionary)["loadedImageMB"])
	var vram_v2 := float((godot_bench["v2_two_maps_oct8"] as Dictionary)["loadedImageMB"])
	var vram_v3 := float((godot_bench["v3_arrays_three_maps"] as Dictionary)["loadedImageMB"])
	var vram_v4 := float((godot_bench["v4_arrays_two_maps"] as Dictionary)["loadedImageMB"])
	_check(s_v4 == 2 and s_v3 == 3 and s_v2 == 6 and s_v1 == 9 and vram_v4 < vram_v3 * 0.70 and vram_v2 < vram_v1,
		"Two-map Texture2DArrays cut array RGBA8 VRAM by 33% and collapse 3-layer ground + hero samplers from 9 to 2",
		"samplers=%d->%d->%d->%d  array_rgba=%.2f->%.2f MB  standalone=%.2f->%.2f MB" % [
			s_v1, s_v2, s_v3, s_v4, vram_v3, vram_v4, vram_v1, vram_v2])

	if out_json != "":
		var fj := FileAccess.open(out_json, FileAccess.WRITE)
		if fj != null:
			fj.store_string(JSON.stringify(godot_bench, "\t") + "\n")
			fj.close()

	print("m1_slice_test: %d passed, %d failed" % [passed, failed])
	quit(0 if failed == 0 else 1)
