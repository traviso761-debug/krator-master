# Section 12b (HANDOFF-VERTICAL-STACK.md / GRAPHICS-TERRAIN-PROPOSAL.md 12b):
# Captures the three reference views of world-oidong-highrift at hour 15:30:
#   1. highrift_flank  — High Rift stepped flank near The Singing Gjar
#   2. valley_floor    — Oidong Valley floor & braided stream corridor
#   3. town_edge       — Longsong's outer band where town ground meets eroded valley flank
#
# Desktop Forward+ (RTX lane):
#   python tools/harness.py lock --lane rtx -- <godot> --path godot --script res://tests/export/vertical_stack_shots.gd -- --out=shots/vertical-stack
# Headless container (Xvfb + Mesa llvmpipe Compatibility):
#   xvfb-run -a -s "-screen 0 1600x900x24" <godot> --path godot --rendering-method gl_compatibility --rendering-driver opengl3 --script res://tests/export/vertical_stack_shots.gd -- --out=shots/vertical-stack
extends SceneTree

const INDEX := "res://data/world-oidong-highrift/index.json"
const HOUR := 15.5

const VIEWS := [
	{
		"name": "highrift_flank",
		"label": "High Rift Flank (Singing Gjar)",
		"eye": Vector3(120620.0, 0.0, 68480.0),
		"target": Vector3(119880.0, 0.0, 67820.0),
		"rel_eye_y": 210.0,
		"rel_target_y": 25.0,
		"grounded": false,
		"walk": false,
	},
	{
		"name": "valley_floor",
		"label": "Oidong Valley Floor",
		"eye": Vector3(-266780.0, 0.0, -41720.0),
		"target": Vector3(-267320.0, 0.0, -42210.0),
		"rel_eye_y": 85.0,
		"rel_target_y": 8.0,
		"grounded": false,
		"walk": false,
	},
	{
		"name": "town_edge",
		"label": "Longsong Town Edge",
		"eye": Vector3(-153380.0, 0.0, -24920.0),
		"target": Vector3(-154240.0, 0.0, -25540.0),
		"rel_eye_y": 145.0,
		"rel_target_y": 18.0,
		"grounded": false,
		"walk": false,
	},
]


func _initialize() -> void:
	_run()


func _run() -> void:
	var out_dir := "shots/vertical-stack"
	var tag := ""
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="):
			out_dir = a.trim_prefix("--out=")
		elif a.begins_with("--tag="):
			tag = a.trim_prefix("--tag=")

	var abs_out := ProjectSettings.globalize_path("res://" + out_dir.trim_prefix("res://").trim_prefix("/"))
	DirAccess.make_dir_recursive_absolute(abs_out)
	var gdignore := FileAccess.open(abs_out + "/.gdignore", FileAccess.WRITE)
	if gdignore != null:
		gdignore.close()

	var is_compat := RenderingServer.get_current_rendering_method() == "gl_compatibility"
	if is_compat:
		root.msaa_3d = Viewport.MSAA_DISABLED
	DisplayServer.window_set_size(Vector2i(800, 450) if is_compat else Vector2i(1600, 900))

	var host := Node3D.new()
	root.add_child(host)

	var env := WorldEnvironment.new()
	var e := Environment.new()
	var sky := Sky.new()
	var sm := ProceduralSkyMaterial.new()
	sm.sky_top_color = Color(0.18, 0.33, 0.61)
	sm.sky_horizon_color = Color(0.68, 0.74, 0.82)
	sm.ground_horizon_color = Color(0.46, 0.43, 0.39)
	sm.ground_bottom_color = Color(0.16, 0.14, 0.12)
	sky.sky_material = sm
	e.background_mode = Environment.BG_SKY
	e.sky = sky
	e.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	e.tonemap_mode = Environment.TONE_MAPPER_AGX
	e.fog_enabled = true
	e.fog_density = 0.000018
	e.fog_sky_affect = 0.28
	env.environment = e
	host.add_child(env)

	# Sun at 15:30 afternoon azimuth/elevation
	var phase := (HOUR - 6.0) / 12.0 * PI
	var elev_deg := sin(phase) * 58.0
	var azim_deg := -75.0 + ((HOUR - 6.0) / 12.0) * 150.0
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-elev_deg, azim_deg, 0.0)
	sun.light_energy = 1.15
	sun.light_color = Color(1.0, 0.94, 0.86)
	sun.shadow_enabled = not is_compat
	sun.directional_shadow_max_distance = 2400.0
	host.add_child(sun)
	await process_frame
	RenderingServer.global_shader_parameter_set("atm_hour", HOUR)
	RenderingServer.global_shader_parameter_set("atm_sun_dir", sun.global_transform.basis.z.normalized())

	var S := KratorWorldStream.open(INDEX)
	S.collide = false
	S.threaded = false
	S.auto_places = not is_compat
	S.flora_enabled = not is_compat
	host.add_child(S)

	var cam := Camera3D.new()
	cam.far = 80000.0
	cam.near = 0.5
	cam.fov = 58.0
	cam.current = true
	host.add_child(cam)

	var summary := []
	for v in VIEWS:
		var t0 := Time.get_ticks_usec()
		# Unload distant chunks between views to keep memory low
		S.update(Vector2(1e9, 1e9), 1.0, 2.0)
		await process_frame
		var r := KratorHostUI.resolve_poi(S, v, 16000.0 if is_compat else 20000.0, 22000.0 if is_compat else 28000.0)
		var eye: Vector3 = r["eye"]
		var target: Vector3 = r["target"]
		S.refresh_flora_at(eye, 180.0 if is_compat else 240.0, 1200.0 if is_compat else 2600.0)
		var build_ms := (Time.get_ticks_usec() - t0) / 1000.0
		cam.position = S.local(eye.x, eye.y, eye.z)
		cam.look_at(S.local(target.x, target.y, target.z), Vector3.UP)
		for _i in (2 if is_compat else 6):
			await process_frame
		var suffix := ("-" + tag) if tag != "" else ""
		var fn := "%s/godot-%s%s.png" % [abs_out, str(v["name"]), suffix]
		var img := root.get_texture().get_image()
		if img != null:
			img.save_png(fn)
		var dc := int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME))
		var pr := int(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME))
		summary.append({"view": v["name"], "file": fn, "eye": [eye.x, eye.y, eye.z], "target": [target.x, target.y, target.z], "stream_ms": build_ms, "draws": dc, "prims": pr})
		print("saved %s (stream %.1f ms, %d draws, %d prims)" % [fn, build_ms, dc, pr])

	var rep := FileAccess.open(abs_out + "/godot-shots.json", FileAccess.WRITE)
	if rep != null:
		rep.store_string(JSON.stringify({"adapter": RenderingServer.get_video_adapter_name(), "api": RenderingServer.get_video_adapter_api_version(), "hour": HOUR, "views": summary}, "\t"))
		rep.close()

	host.remove_child(S)
	S.free()
	await process_frame
	quit(0)
