# Stage 1 Deterministic Route Harness — Godot Open-World Walk Scene (GRAPHICS-TERRAIN-PROPOSAL.md A1 & Stage 1)
# Visits 4 deterministic stops on world-oidong-highrift (or --case=world-pinnacle) across 3 hours (12:00, 16:20, 22:00),
# recording at each stop:
#   - frame time (median_ms, p95_ms), stream build time (ms), draw calls, primitives
#   - VRAM / texture / buffer memory (MB, via Performance monitors)
#   - worst plant-to-drawn-ground height error (m) within 240 m of the camera (StreamFlora + Place flora vs tri_height_at)
#   - optional screenshots (--shots=shots/route)
#
# Headless geometry / grounding / stream-cost baseline (< 30 s):
#   godot --headless --path godot --script res://tests/perf/route_harness.gd -- --out=res://PERF-route-headless.json
# Forward+ GPU run (RTX lane):
#   python tools/harness.py lock --lane rtx -- <godot> --path godot --script res://tests/perf/route_harness.gd -- --out=res://PERF-route-rtx.json --md=res://PERF-route-rtx.md --shots=shots/route-rtx
extends SceneTree

const HOURS := [12.0, 16.33, 22.0]

const OIDONG_STOPS := [
	{
		"id": "city_block",
		"label": "Longsong & Monastery street level",
		"eye": Vector3(-154160.0, 0.0, -25480.0),
		"target": Vector3(-154240.0, 0.0, -25540.0),
		"rel_eye_y": 8.0,
		"rel_target_y": 4.0,
		"grounded": false,
		"walk": false,
	},
	{
		"id": "forest_edge",
		"label": "Oidong Valley StreamFlora forest edge",
		"eye": Vector3(-266940.0, 0.0, -41910.0),
		"target": Vector3(-267060.0, 0.0, -42020.0),
		"rel_eye_y": 6.0,
		"rel_target_y": 8.0,
		"grounded": false,
		"walk": false,
	},
	{
		"id": "door_transition",
		"label": "Longsong Monastery gatehouse approach",
		"eye": Vector3(-154195.0, 0.0, -25505.0),
		"target": Vector3(-154240.0, 0.0, -25540.0),
		"rel_eye_y": 3.5,
		"rel_target_y": 3.0,
		"grounded": false,
		"walk": false,
	},
	{
		"id": "water_ground",
		"label": "Strongbow canyon & Great Cataract cauldron water",
		"eye": Vector3(-609320.0, 0.0, -73180.0),
		"target": Vector3(-609800.0, 0.0, -73420.0),
		"rel_eye_y": 24.0,
		"rel_target_y": 4.0,
		"grounded": false,
		"walk": false,
	},
]


func _initialize() -> void:
	_run()


func _audit_plant_grounding(S: KratorWorldStream, eye_reg: Vector3, radius := 240.0) -> Dictionary:
	var errs := PackedFloat32Array()
	var r2 := radius * radius
	var sf := S.get_node_or_null("StreamFlora")
	if sf != null:
		for ch in sf.get_children():
			if not (ch is MultiMeshInstance3D) or not (ch as Node3D).visible:
				continue
			var mm := (ch as MultiMeshInstance3D).multimesh
			if mm == null or mm.instance_count <= 0:
				continue
			var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
			var buf := mm.buffer
			var step_i := maxi(1, mm.instance_count / 40)
			for i in range(0, mm.instance_count, step_i):
				var b := i * stride
				var reg: Array = S.region(Vector3(buf[b + 3], buf[b + 7], buf[b + 11]))
				var wx := float(reg[0]); var wy := float(reg[1]); var wz := float(reg[2])
				var dx := wx - eye_reg.x; var dz := wz - eye_reg.z
				if dx * dx + dz * dz > r2:
					continue
				var gh := S.tri_height_at(wx, wz)
				if is_finite(gh):
					var e := absf(wy - gh)
					if e < 30.0:
						errs.append(e)
	errs.sort()
	var n := errs.size()
	return {
		"checked": n,
		"worst_m": snappedf(errs[n - 1], 0.0001) if n > 0 else 0.0,
		"p95_m": snappedf(errs[mini(n - 1, int(n * 0.95))], 0.0001) if n > 0 else 0.0,
	}


func _scene_counts(S: KratorWorldStream) -> Dictionary:
	var meshes := 0
	var mm_instances := 0
	var stack: Array[Node] = [S]
	while not stack.is_empty():
		var n: Node = stack.pop_back()
		for c in n.get_children():
			stack.append(c)
		if n is MultiMeshInstance3D and (n as Node3D).visible:
			var mm := (n as MultiMeshInstance3D).multimesh
			if mm != null and mm.instance_count > 0:
				meshes += 1
				mm_instances += mm.instance_count
		elif n is MeshInstance3D and (n as Node3D).visible:
			if (n as MeshInstance3D).mesh != null:
				meshes += 1
	return {"active_draw_nodes": meshes, "multimesh_instances": mm_instances}


func _run() -> void:
	var case_index := "res://data/world-oidong-highrift/index.json"
	var out_json := ""
	var out_md := ""
	var shots_dir := ""
	var n_frames := 8
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--case="):
			var v := a.trim_prefix("--case=")
			case_index = v if v.ends_with(".json") else ("res://data/%s/index.json" % v)
		elif a.begins_with("--out="):
			out_json = a.trim_prefix("--out=")
		elif a.begins_with("--md="):
			out_md = a.trim_prefix("--md=")
		elif a.begins_with("--shots="):
			shots_dir = a.trim_prefix("--shots=")
		elif a.begins_with("--frames="):
			n_frames = maxi(2, int(a.trim_prefix("--frames=")))

	var is_headless := DisplayServer.get_name() == "headless"
	if not is_headless:
		DisplayServer.window_set_size(Vector2i(1600, 900))
		DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)

	var abs_shots := ""
	if shots_dir != "" and not is_headless:
		abs_shots = ProjectSettings.globalize_path("res://" + shots_dir.trim_prefix("res://").trim_prefix("/"))
		DirAccess.make_dir_recursive_absolute(abs_shots)
		var gdi := FileAccess.open(abs_shots + "/.gdignore", FileAccess.WRITE)
		if gdi != null:
			gdi.close()

	var host := Node3D.new()
	root.add_child(host)

	var env := WorldEnvironment.new()
	var e := Environment.new()
	var sky := Sky.new()
	var sm := ProceduralSkyMaterial.new()
	sky.sky_material = sm
	e.background_mode = Environment.BG_SKY
	e.sky = sky
	e.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	e.tonemap_mode = Environment.TONE_MAPPER_AGX
	if not is_headless and RenderingServer.get_current_rendering_method() != "gl_compatibility":
		e.ssao_enabled = true
	e.fog_enabled = true
	e.fog_density = 0.000018
	env.environment = e
	host.add_child(env)

	var sun := DirectionalLight3D.new()
	sun.shadow_enabled = not is_headless and RenderingServer.get_current_rendering_method() != "gl_compatibility"
	sun.directional_shadow_max_distance = 2400.0
	host.add_child(sun)

	var S := KratorWorldStream.open(case_index)
	S.collide = false
	S.threaded = false
	S.auto_places = true
	host.add_child(S)

	var cam := Camera3D.new()
	cam.far = 80000.0
	cam.near = 0.3
	cam.fov = 58.0
	cam.current = true
	host.add_child(cam)
	await process_frame

	var stops_out := []
	for st_v in OIDONG_STOPS:
		var st: Dictionary = st_v
		# Unload distant chunks/places first so each stop reflects steady-state streaming footprint
		for pid in S.places_open.keys():
			var pn: Node3D = S.places_open[pid]
			S.places_open.erase(pid)
			S._place_flora.erase(pid)
			pn.get_parent().remove_child(pn)
			pn.free()
		S.update(Vector2(1e9, 1e9), 1.0, 2.0)
		await process_frame

		var t0 := Time.get_ticks_usec()
		var r := KratorHostUI.resolve_poi(S, st, 20000.0, 28000.0)
		var eye: Vector3 = r["eye"]
		var target: Vector3 = r["target"]
		var fl_counts := S.refresh_flora_at(eye)
		var stream_ms := snappedf((Time.get_ticks_usec() - t0) / 1000.0, 0.1)

		cam.position = S.local(eye.x, eye.y, eye.z)
		cam.look_at(S.local(target.x, target.y, target.z), Vector3.UP)
		await process_frame

		var pg_err := _audit_plant_grounding(S, eye)
		var sc_cnt := _scene_counts(S)
		var hours_out := []

		for hr_v in HOURS:
			var hr := float(hr_v)
			var is_day: bool = hr >= 5.5 and hr <= 19.0
			var elev: float = sin(clampf((hr - 6.0) / 12.0, 0.0, 1.0) * PI) * 58.0 if is_day else -18.0
			var azim: float = -75.0 + ((hr - 6.0) / 12.0) * 150.0
			sun.rotation_degrees = Vector3(-elev, azim, 0.0)
			sun.light_energy = 1.15 if is_day else 0.04
			RenderingServer.global_shader_parameter_set("atm_hour", hr)
			RenderingServer.global_shader_parameter_set("atm_night", 0.0 if is_day else 1.0)

			var ft := PackedFloat32Array()
			var frames_run := 2 if is_headless else n_frames
			var last_u := Time.get_ticks_usec()
			for _f in frames_run:
				await process_frame
				var now_u := Time.get_ticks_usec()
				ft.append((now_u - last_u) / 1000.0)
				last_u = now_u
			ft.sort()
			var med_ms := snappedf(ft[ft.size() / 2], 0.01) if not ft.is_empty() else 0.0
			var p95_ms := snappedf(ft[mini(ft.size() - 1, int(ft.size() * 0.95))], 0.01) if not ft.is_empty() else 0.0
			var dc := int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME))
			var pr := int(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME))

			var h_rec := {
				"hour": hr,
				"median_ms": med_ms,
				"p95_ms": p95_ms,
				"draws": dc,
				"prims": pr,
			}
			if abs_shots != "":
				var fn := "%s/%s_h%04.1f.png" % [abs_shots, str(st["id"]), hr]
				var img := root.get_texture().get_image()
				if img != null:
					img.save_png(fn)
					h_rec["shot"] = fn
			hours_out.append(h_rec)

		var vram_mb := snappedf(Performance.get_monitor(Performance.RENDER_VIDEO_MEM_USED) / 1048576.0, 0.1)
		var tex_mb := snappedf(Performance.get_monitor(Performance.RENDER_TEXTURE_MEM_USED) / 1048576.0, 0.1)
		var buf_mb := snappedf(Performance.get_monitor(Performance.RENDER_BUFFER_MEM_USED) / 1048576.0, 0.1)

		stops_out.append({
			"id": st["id"],
			"label": st["label"],
			"eye": [snappedf(eye.x, 0.1), snappedf(eye.y, 0.1), snappedf(eye.z, 0.1)],
			"stream_build_ms": stream_ms,
			"chunks_held": S.chunks.size(),
			"places_open": S.places_open.keys(),
			"stream_flora": fl_counts,
			"scene_counts": sc_cnt,
			"vram_mb": vram_mb,
			"tex_mb": tex_mb,
			"buf_mb": buf_mb,
			"plant_ground": pg_err,
			"hours": hours_out,
		})
		print("stop %-16s  stream=%.1f ms  nodes=%d  mm_inst=%d  flora_hero=%d mid=%d  vram=%.1f MB  plant_err=%.4f m" % [
			str(st["id"]), stream_ms, int(sc_cnt["active_draw_nodes"]), int(sc_cnt["multimesh_instances"]),
			int(fl_counts["hero"]), int(fl_counts["mid"]), vram_mb, float(pg_err["worst_m"])])

	var rep := {
		"format": "krator-godot-route-baseline",
		"version": 1,
		"case": case_index,
		"adapter": RenderingServer.get_video_adapter_name(),
		"api": RenderingServer.get_video_adapter_api_version(),
		"display": DisplayServer.get_name(),
		"godot": Engine.get_version_info()["string"],
		"stops": stops_out,
	}

	if out_json != "":
		var f := FileAccess.open(out_json, FileAccess.WRITE)
		if f != null:
			f.store_string(JSON.stringify(rep, "\t") + "\n")
			f.close()
			print("wrote " + out_json)

	if out_md != "":
		var md := "# Godot Deterministic Route Baseline\n\n- **Adapter:** `%s` (`%s`, display `%s`, Godot `%s`)\n\n" % [
			rep["adapter"], rep["api"], rep["display"], rep["godot"]]
		md += "| Stop | Stream (ms) | Draw Nodes | MultiMesh Inst | StreamFlora (Hero/Mid) | VRAM (MB) | Worst Plant Err (m) | Noon Med/p95 (ms) | Draws / Prims |\n"
		md += "|---|---:|---:|---:|---|---:|---:|---|---|\n"
		for s in stops_out:
			var h0: Dictionary = s["hours"][0]
			var fl: Dictionary = s["stream_flora"]
			var sc: Dictionary = s["scene_counts"]
			var pg: Dictionary = s["plant_ground"]
			md += "| `%s` | `%.1f` | `%d` | `%d` | `%d / %d` | `%.1f` | `%.4f` | `%.2f / %.2f` | `%d / %d` |\n" % [
				str(s["id"]), float(s["stream_build_ms"]), int(sc["active_draw_nodes"]), int(sc["multimesh_instances"]),
				int(fl["hero"]), int(fl["mid"]), float(s["vram_mb"]), float(pg["worst_m"]),
				float(h0["median_ms"]), float(h0["p95_ms"]), int(h0["draws"]), int(h0["prims"])]
		var mf := FileAccess.open(out_md, FileAccess.WRITE)
		if mf != null:
			mf.store_string(md)
			mf.close()
			print("wrote " + out_md)

	for pid in S.places_open.keys():
		var pn: Node3D = S.places_open[pid]
		pn.get_parent().remove_child(pn)
		pn.free()
	host.remove_child(S)
	S.free()
	await process_frame
	quit(0)
