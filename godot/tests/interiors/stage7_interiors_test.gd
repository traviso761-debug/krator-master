# Stage 7 (I1-I4) Longsong Monastery Interiors Automated Test + Gate 5 Sun-Leak Probe + Visual Proof
# Headless data & light-rig check:
#   KRATOR_VRAM=none godot --headless --path godot --script res://tests/interiors/stage7_interiors_test.gd
# Offscreen OpenGL 4.5 GPU Sun-Leak Probe + Paired Negative + 4 Stage 7 Interior Shots:
#   KRATOR_VRAM=none xvfb-run -a godot --rendering-driver opengl3 --path godot --script res://tests/interiors/stage7_interiors_test.gd -- --shots=/path/to/shots
extends SceneTree

const KInteriorsLight := preload("res://krator/kinteriors_light.gd")
const MON_CASE := "res://data/world-oidong-highrift/places/sq80bzd7ep-monastery/world.json"
const MON_META := "res://data/world-oidong-highrift/places/sq80bzd7ep-monastery/interiors.json"

var passed := 0
var failed := 0
var shots_dir := ""


func _check(cond: bool, msg: String, detail := "") -> void:
	if cond:
		passed += 1
		print("  PASS  " + msg + ("" if detail == "" else " : " + detail))
	else:
		failed += 1
		print("  FAIL  " + msg + ("" if detail == "" else " : " + detail))


func _luma(c: Color) -> float:
	return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b


func _crop_diff(a: Image, b: Image, u0: float, v0: float, u1: float, v1: float) -> Dictionary:
	var w := a.get_width()
	var h := a.get_height()
	var x0 := clampi(int(roundf(float(w) * u0)), 0, w - 1)
	var x1 := clampi(int(roundf(float(w) * u1)), 0, w - 1)
	var y0 := clampi(int(roundf(float(h) * v0)), 0, h - 1)
	var y1 := clampi(int(roundf(float(h) * v1)), 0, h - 1)
	var mx := 0.0
	var sum := 0.0
	var sum_a := 0.0
	var cnt := 0
	for y in range(y0, y1 + 1, 2):
		for x in range(x0, x1 + 1, 2):
			var la := _luma(a.get_pixel(x, y))
			var lb := _luma(b.get_pixel(x, y))
			var d := absf(la - lb)
			mx = maxf(mx, d)
			sum += d
			sum_a += la
			cnt += 1
	return {
		"max": mx,
		"mean": sum / maxf(1.0, float(cnt)),
		"mean_luma": sum_a / maxf(1.0, float(cnt)),
		"samples": cnt,
	}


func _room_at_local(imeta: Dictionary, lp: Vector3, slack := 0.55) -> String:
	for r in imeta.get("rooms", []):
		if not (r is Dictionary) or not (r.get("box") is Array):
			continue
		var b: Array = r["box"]
		if lp.y < float(b[1]) - slack or lp.y > float(b[4]) + slack:
			continue
		if lp.x < float(b[0]) - slack or lp.x > float(b[3]) + slack or lp.z < float(b[2]) - slack or lp.z > float(b[5]) + slack:
			continue
		if r.get("circle") is Array:
			var c: Array = r["circle"]
			var rad := float(c[2]) + slack
			if Vector2(lp.x - float(c[0]), lp.z - float(c[1])).length_squared() > rad * rad:
				continue
		return str(r.get("id", ""))
	return ""


func _show_near_furniture(mon: Node3D, lp: Vector3, show_exterior := false) -> void:
	for top_ch in mon.get_children():
		if top_ch is Node3D and top_ch.name != "IndoorShells" and top_ch.name != "Items":
			(top_ch as Node3D).visible = show_exterior and top_ch.name == "Meshes"
	var m_items := mon.get_node_or_null("Items")
	if m_items != null:
		var near_xz2 := 38.0 * 38.0
		for ch in m_items.get_children():
			if ch is MultiMeshInstance3D:
				var mmi := ch as MultiMeshInstance3D
				if (ch as Node).has_meta("furn_pts"):
					var pts: PackedVector3Array = (ch as Node).get_meta("furn_pts")
					var show_f := false
					for fp in pts:
						if absf(fp.y - lp.y) <= 6.5:
							var dx := fp.x - lp.x
							var dz := fp.z - lp.z
							if dx * dx + dz * dz <= near_xz2:
								show_f = true
								break
					mmi.visible = show_f
				else:
					mmi.visible = false
	var ishells := mon.get_node_or_null("IndoorShells")
	if ishells != null:
		for sc in ishells.get_children():
			if sc is MeshInstance3D:
				var smi := sc as MeshInstance3D
				var aabb := smi.get_aabb()
				var closest := aabb.position + Vector3(
					clampf(lp.x - aabb.position.x, 0.0, aabb.size.x),
					clampf(lp.y - aabb.position.y, 0.0, aabb.size.y),
					clampf(lp.z - aabb.position.z, 0.0, aabb.size.z)
				)
				smi.visible = closest.distance_squared_to(lp) <= 55.0 * 55.0 and absf(closest.y - lp.y) <= 12.0


func _apply_pool(lights: Array, chosen: Array, max_l: int, is_compat: bool) -> Dictionary:
	var vis := 0
	var shad := 0
	for i in lights.size():
		var ol := lights[i] as OmniLight3D
		if i < mini(max_l, chosen.size()):
			var c_entry: Dictionary = chosen[i]
			ol.position = c_entry["reg_pos"] as Vector3
			ol.light_color = c_entry["color"]
			ol.light_energy = float(c_entry["energy"]) * (1.25 if is_compat else 1.0)
			ol.omni_range = float(c_entry["range"])
			ol.omni_attenuation = 1.25
			ol.shadow_enabled = bool(c_entry.get("shadow", false))
			ol.visible = true
			vis += 1
			if ol.shadow_enabled:
				shad += 1
		else:
			ol.visible = false
			ol.shadow_enabled = false
			ol.light_energy = 0.0
	return {"visible": vis, "shadows": shad}


func _initialize() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--shots="):
			shots_dir = a.trim_prefix("--shots=")
	call_deferred("_run")


func _run() -> void:
	var is_headless := DisplayServer.get_name() == "headless"
	var is_compat := RenderingServer.get_current_rendering_method() == "gl_compatibility"
	if not is_headless:
		DisplayServer.window_set_size(Vector2i(960, 540))
		root.size = Vector2i(960, 540)
	print("=== Stage 7 Longsong Monastery Interiors Test (headless=%s, method=%s) ===" % [
		str(is_headless), RenderingServer.get_current_rendering_method()
	])

	var scene_root := Node3D.new()
	scene_root.name = "Stage7Root"
	root.add_child(scene_root)

	var psky := ProceduralSkyMaterial.new()
	psky.sky_top_color = Color(0.28, 0.46, 0.74)
	psky.sky_horizon_color = Color(0.68, 0.76, 0.86)
	psky.ground_horizon_color = Color(0.52, 0.56, 0.60)
	psky.ground_bottom_color = Color(0.22, 0.24, 0.26)
	var sky_obj := Sky.new()
	sky_obj.sky_material = psky
	var env_res := Environment.new()
	env_res.background_mode = Environment.BG_SKY
	env_res.sky = sky_obj
	env_res.tonemap_mode = Environment.TONE_MAPPER_AGX
	env_res.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env_res.ambient_light_color = Color(0.18, 0.16, 0.15)
	env_res.ambient_light_energy = 1.0
	env_res.ambient_light_sky_contribution = 0.95
	var wenv := WorldEnvironment.new()
	wenv.environment = env_res
	scene_root.add_child(wenv)

	var sun := DirectionalLight3D.new()
	sun.name = "Sun"
	sun.light_color = Color(1.0, 0.96, 0.90)
	sun.light_energy = 1.25
	sun.light_cull_mask = 1
	sun.shadow_enabled = false
	sun.transform.basis = Basis.looking_at(Vector3(0.28, -0.82, 0.50).normalized(), Vector3.UP)
	scene_root.add_child(sun)

	var cam := Camera3D.new()
	cam.fov = 58.0
	cam.near = 0.2
	cam.far = 900.0
	cam.current = true
	cam.look_at_from_position(Vector3(-30.0, 51.4, 118.0), Vector3(-38.0, 49.1, 126.0), Vector3.UP)
	scene_root.add_child(cam)

	var pool_lights: Array = []
	for li in 10:
		var ol := OmniLight3D.new()
		ol.name = "LongsongLamp_%d" % li
		ol.visible = false
		ol.shadow_enabled = false
		ol.omni_shadow_mode = OmniLight3D.SHADOW_CUBE if is_compat else OmniLight3D.SHADOW_DUAL_PARABOLOID
		ol.shadow_bias = 0.04
		ol.shadow_normal_bias = 1.15
		ol.shadow_blur = 1.25
		ol.light_cull_mask = KInteriorsLight.INDOOR_LAYER
		ol.omni_attenuation = 1.25
		scene_root.add_child(ol)
		pool_lights.append(ol)

	var imeta_raw = KData.read_json(MON_META)
	_check(imeta_raw is Dictionary and int(imeta_raw.get("version", 0)) >= 2, "monastery-interiors-meta-v2", "interiors.json v2 loaded")
	var imeta: Dictionary = imeta_raw as Dictionary
	var M_local := {"at": [0.0, 0.0, 0.0], "ry": 0.0}

	var mon := KratorWorld.build(MON_CASE)
	mon.name = "Monastery"
	for skip_nm in ["Atmos", "Water"]:
		var sn := mon.get_node_or_null(skip_nm)
		if sn != null:
			mon.remove_child(sn)
			sn.free()
	var pf := mon.get_node_or_null("PageFrame")
	if pf != null:
		var pfw := pf.get_node_or_null("Water")
		if pfw != null:
			pfw.visible = false
	var m_items := mon.get_node_or_null("Items")
	if m_items != null:
		for ch in m_items.get_children():
			if ch is MultiMeshInstance3D:
				var km: Dictionary = (ch as Node).get_meta("krator", {}) if (ch as Node).has_meta("krator") else {}
				if str(km.get("kit", "")) == "furniture":
					var fmmi := ch as MultiMeshInstance3D
					var fmm := fmmi.multimesh
					if fmm != null and fmm.instance_count > 0:
						var fstride := 12 + (4 if fmm.use_colors else 0) + (4 if fmm.use_custom_data else 0)
						var fbuf := fmm.buffer
						var pts := PackedVector3Array()
						pts.resize(fmm.instance_count)
						for fi in fmm.instance_count:
							var fo := fi * fstride
							pts[fi] = Vector3(fbuf[fo + 3], fbuf[fo + 7], fbuf[fo + 11])
						fmmi.set_meta("furn_pts", pts)
				else:
					(ch as MultiMeshInstance3D).visible = false
	mon.set_meta("interiors_meta", imeta)
	mon.set_meta("monastery", M_local)
	KInteriorsLight.setup_monastery(mon, imeta)
	scene_root.add_child(mon)
	_show_near_furniture(mon, Vector3(-30.0, 51.4, 118.0))

	_check(mon.has_meta("stage7_interiors"), "stage7-setup-monastery", "Monastery node has stage7_interiors metadata")
	var st7: Dictionary = mon.get_meta("stage7_interiors")
	var stats: Dictionary = st7.get("stats", {})
	print("Stage 7 setup stats: ", JSON.stringify(stats))
	_check(int(stats.get("indoor_tris", 0)) > 30000, "I1-shell-split-indoor-tris", "indoor_tris=%d exterior_kept=%d" % [
		int(stats.get("indoor_tris", 0)), int(stats.get("exterior_kept_tris", 0))
	])
	_check(int(stats.get("furn_indoor_inst", 0)) > 18000, "I1-furniture-tagged-instances", "furn_indoor=%d furn_outdoor=%d" % [
		int(stats.get("furn_indoor_inst", 0)), int(stats.get("furn_outdoor_inst", 0))
	])
	_check(float(stats.get("corner_ao_min", 1.0)) <= 0.48 and float(stats.get("corner_ao_max", 0.0)) >= 0.99,
		"I4-baked-corner-ao-range", "min=%.3f max=%.3f" % [float(stats.get("corner_ao_min", 1.0)), float(stats.get("corner_ao_max", 0.0))])

	# I2: BFS room-graph monotonicity & zero cross-wall bleed
	var rtab: Dictionary = imeta.get("room_table", {})
	var by_id: Dictionary = rtab.get("byId", {})
	var dl_cat := float(by_id.get("wp.k0.w.out.cataclysm", {}).get("daylight", 0.0))
	var dl_cor := float(by_id.get("wp.k1.cells-iw.corridor", {}).get("daylight", 0.0))
	var dl_cel := float(by_id.get("wp.k1.cells-iw.a06", {}).get("daylight", 0.0))
	var dl_vlt := float(by_id.get("lv.open-vault", {}).get("daylight", 1.0))
	_check(dl_cat > dl_cor and dl_cor > dl_cel and dl_cel > 0.05 and dl_vlt == 0.0,
		"I2-room-graph-daylight-monotonic",
		"cataclysm=%.3f > corridor=%.3f > inner_cell=%.3f > vault=%.3f" % [dl_cat, dl_cor, dl_cel, dl_vlt])

	var cell_box: Array = []
	for r_d in imeta.get("rooms", []):
		if str(r_d.get("id", "")) == "wp.k1.cells-iw.a06":
			cell_box = r_d["box"]
			break
	var cell_mid := Vector3(0.5 * (float(cell_box[0]) + float(cell_box[3])), float(cell_box[1]) + 1.6, 0.5 * (float(cell_box[2]) + float(cell_box[5])))
	var cell_picks := KInteriorsLight.pick_pool(imeta, M_local, cell_mid, "wp.k1.cells-iw.a06", 0.0, 10, 2)
	var cross_wall := 0
	for pk in cell_picks:
		var prm := str((pk as Dictionary).get("room", ""))
		if prm != "wp.k1.cells-iw.a06" and prm != "wp.k1.cells-iw.corridor":
			cross_wall += 1
	_check(cross_wall == 0 and cell_picks.size() >= 1,
		"I2-I3-zero-cross-wall-bleed",
		"picks=%d cross_wall_leaks=%d" % [cell_picks.size(), cross_wall])

	# I3: Active room-gated pool & 2 shadowed hero OmniLight3Ds in Archive Stacks I
	var max_pool := 6 if is_compat else 10
	var stacks_eye := Vector3(-13.2, 51.6, 97.2)
	var stacks_rid := _room_at_local(imeta, stacks_eye, 0.55)
	_show_near_furniture(mon, stacks_eye)
	var stacks_picks := KInteriorsLight.pick_pool(imeta, M_local, stacks_eye, stacks_rid, 0.15, max_pool, 2)
	var pstat := _apply_pool(pool_lights, stacks_picks, max_pool, is_compat)
	_check(stacks_rid == "rp.k2.stacks-peoples" and int(pstat["visible"]) >= 4 and int(pstat["visible"]) <= max_pool and int(pstat["shadows"]) == 2,
		"I3-room-gated-pool-and-2-hero-shadows",
		"room=%s active_lights=%d hero_shadows=%d" % [stacks_rid, int(pstat["visible"]), int(pstat["shadows"])])

	# GPU Gate 5 Automated Sun-Leak Probe + Paired Negative + Stage 7 Visual Proof Shots
	if not is_headless:
		var probe_views := [
			["Archive Stacks floor & reading tables", Vector3(-30.0, 51.4, 118.0), Vector3(-38.0, 49.1, 126.0)],
			["Room of Slow Water floor & basin", Vector3(32.8, -2.3, -95.2), Vector3(35.9, -4.2, -88.0)],
			["West monk cell floor & desk", Vector3(-90.0, 46.4, 42.6), Vector3(-93.2, 44.6, 41.2)],
		]
		sun.shadow_enabled = false
		sun.global_transform.basis = Basis.looking_at(Vector3(0.05, -0.998, 0.04).normalized(), Vector3.FORWARD)
		for ol_off in pool_lights:
			var l_off := ol_off as OmniLight3D
			l_off.visible = false
			l_off.shadow_enabled = false

		for pv in probe_views:
			var label := str(pv[0])
			var pv_eye := pv[1] as Vector3
			var pv_tgt := pv[2] as Vector3
			_show_near_furniture(mon, pv_eye)
			cam.look_at_from_position(pv_eye, pv_tgt, Vector3.UP)
			KInteriorsLight.update_uniforms(mon, 0.55, 0.85, true, true)
			sun.light_energy = 2.5
			await process_frame
			await process_frame
			var img_noon := root.get_texture().get_image()

			sun.light_energy = 0.0
			await process_frame
			await process_frame
			var img_zero := root.get_texture().get_image()

			var diff := _crop_diff(img_noon, img_zero, 0.20, 0.25, 0.80, 0.85)
			_check(float(diff["max"]) <= 0.005 and float(diff["mean"]) < 0.0005 and float(diff["mean_luma"]) > 0.001,
				"Gate5-sun-leak-probe: " + label,
				"max_luma_diff=%.5f mean_diff=%.5f indoor_luma=%.3f" % [
					float(diff["max"]), float(diff["mean"]), float(diff["mean_luma"])
				])

		# Paired Negative Control: disabling I1 mask (`mask_sun = false`) MUST fail (leak bright overhead noon sun onto floor/desk!)
		_show_near_furniture(mon, Vector3(-90.0, 46.4, 42.6))
		cam.look_at_from_position(Vector3(-90.0, 46.4, 42.6), Vector3(-93.2, 44.6, 41.2), Vector3.UP)
		KInteriorsLight.update_uniforms(mon, 0.55, 0.85, false, true)
		sun.light_energy = 2.5
		await process_frame
		await process_frame
		var neg_noon := root.get_texture().get_image()
		sun.light_energy = 0.0
		await process_frame
		await process_frame
		var neg_zero := root.get_texture().get_image()
		var neg_diff := _crop_diff(neg_noon, neg_zero, 0.20, 0.25, 0.80, 0.85)
		_check(float(neg_diff["max"]) > 0.15,
			"negative: Gate5-unmasked-indoor-sun-leaks",
			"unmasked max_luma_diff=%.4f (probe catches leak > 0.15)" % float(neg_diff["max"]))

		# I4 GPU Corner AO check: toggling use_corner_ao darkens room creases measurably
		_show_near_furniture(mon, Vector3(32.8, -2.3, -95.2))
		cam.look_at_from_position(Vector3(32.8, -2.3, -95.2), Vector3(35.9, -3.2, -88.0), Vector3.UP)
		KInteriorsLight.update_uniforms(mon, 0.85, 1.35, true, true)
		await process_frame
		await process_frame
		var img_ao_on := root.get_texture().get_image()
		KInteriorsLight.update_uniforms(mon, 0.85, 1.35, true, false)
		await process_frame
		await process_frame
		var img_ao_off := root.get_texture().get_image()
		var ao_diff := _crop_diff(img_ao_on, img_ao_off, 0.08, 0.08, 0.92, 0.92)
		_check(float(ao_diff["max"]) > 0.025,
			"I4-gpu-corner-ao-visible",
			"max_crease_darken=%.4f mean_darken=%.4f" % [float(ao_diff["max"]), float(ao_diff["mean"])])

		if shots_dir != "":
			DirAccess.make_dir_recursive_absolute(shots_dir)
			var shot_specs := [
				["29_ls_cataclysm_lecture_daylight.png", 1.0, Vector3(0.22, -0.78, 0.58), "wp.k0.w.out.cataclysm", Vector3(-64.75, 42.8, 50.8), Vector3(-69.75, 41.0, 31.8), true],
				["30_ls_great_assembly_hall_stage7.png", 0.95, Vector3(-0.18, -0.76, 0.62), "wp.assembly", Vector3(-3.0, 43.4, 68.4), Vector3(1.0, 42.2, 88.0), false],
				["31_ls_archive_stacks_shadowed_lamps.png", 0.12, Vector3(-0.72, -0.18, 0.67), "rp.k2.stacks-peoples", Vector3(-13.2, 51.6, 97.2), Vector3(-48.52, 49.8, 136.53), false],
				["32_ls_slow_water_corner_ao.png", 1.0, Vector3(0.22, -0.78, 0.58), "ward.hall-of-forms.slow-water", Vector3(32.8, -2.3, -95.2), Vector3(35.9, -3.0, -88.0), false],
			]
			for sp in shot_specs:
				var fn := shots_dir.path_join(str(sp[0]))
				var sun_up := float(sp[1])
				var sdir: Vector3 = (sp[2] as Vector3).normalized()
				var rid := str(sp[3])
				var eye_v := sp[4] as Vector3
				var tgt_v := sp[5] as Vector3
				var show_ext := bool(sp[6])
				var night_k := 1.0 - sun_up
				var rm_dl := float(by_id.get(rid, {}).get("daylight", 0.5))
				var eff_nk := maxf(night_k, clampf(1.0 - rm_dl * 4.0, 0.0, 1.0))
				psky.sky_top_color = Color(0.05, 0.08, 0.16).lerp(Color(0.28, 0.46, 0.74), sun_up)
				psky.sky_horizon_color = Color(0.18, 0.14, 0.20).lerp(Color(0.68, 0.76, 0.86), sun_up)
				sun.transform.basis = Basis.looking_at(sdir, Vector3.UP)
				sun.light_energy = 1.15 * sun_up
				sun.light_color = Color(1.0, 0.68, 0.42).lerp(Color(1.0, 0.96, 0.90), sun_up)
				KInteriorsLight.update_uniforms(mon, sun_up, 0.72 + 1.05 * eff_nk, true, true)
				_show_near_furniture(mon, eye_v, show_ext)
				cam.look_at_from_position(eye_v, tgt_v, Vector3.UP)
				var picks := KInteriorsLight.pick_pool(imeta, M_local, eye_v, rid, sun_up, max_pool, 2)
				_apply_pool(pool_lights, picks, max_pool, is_compat)
				await process_frame
				await process_frame
				await process_frame
				var shot_img := root.get_texture().get_image()
				shot_img.save_png(fn)
				print("saved Stage 7 shot: ", fn)

	print("=== Stage 7 Summary: %d passed, %d failed ===" % [passed, failed])
	quit(0 if failed == 0 else 1)
