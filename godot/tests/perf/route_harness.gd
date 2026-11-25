# Stage 1 Deterministic Route Harness — Godot Open-World Walk Scene (GRAPHICS-TERRAIN-PROPOSAL.md A1 & Stage 1)
# Visits 4 deterministic stops on world-oidong-highrift (or --case=world-pinnacle) across 3 hours (12:00, 16:20, 22:00),
# recording at each stop:
#   - frame time (median_ms, p95_ms), stream build time (ms), draw calls, primitives
#   - the viewport's measured render time on the GPU and on the CPU (gpu_ms, cpu_ms: frame delta hides which is which),
#     and the primitives against the tier's cap (GODOT-LOOK-PLAN.md section 12; krator/look.gd CAPS)
#   - the light rig it ran under (--look=low|high|photo|legacy and krator/look.gd's switches; without one, the adapter's
#     tier), its shadow texels, and what the stream cut into cells and made into occluders (krator/cells.gd, occluders.gd)
#   - VRAM / texture / buffer memory (MB, via Performance monitors)
#   - worst plant-to-drawn-ground height error (m) within 240 m of the camera (StreamFlora + Place flora vs tri_height_at)
#   - optional screenshots (--shots=shots/route)
#
# Headless geometry / grounding / stream-cost baseline (< 30 s):
#   godot --headless --path godot --script res://tests/perf/route_harness.gd -- --out=res://PERF-route-headless.json
# Forward+ GPU run (RTX lane):
#   python tools/harness.py lock --lane rtx -- <godot> --path godot --script res://tests/perf/route_harness.gd -- --out=res://PERF-route-rtx.json --md=res://PERF-route-rtx.md --shots=shots/route-rtx
# The rig as it was before 2026-11-23, for a before and after from the same stops (add --no-cells to a tier for the cut alone):
#   ... route_harness.gd -- --look=legacy --out=res://PERF-route-rtx-legacy.json
extends SceneTree

const KratorSky := preload("res://krator/sky.gd")
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
	var sg := S.get_node_or_null("StreamGrass")
	if sg != null:
		for ch in sg.get_children():
			if not (ch is MultiMeshInstance3D) or not (ch as Node3D).visible:
				continue
			var mmg := (ch as MultiMeshInstance3D).multimesh
			if mmg == null or mmg.instance_count <= 0:
				continue
			var stride_g := 12 + (4 if mmg.use_colors else 0) + (4 if mmg.use_custom_data else 0)
			var bufg := mmg.buffer
			var step_g := maxi(1, mmg.instance_count / 60)
			for i in range(0, mmg.instance_count, step_g):
				var bg := i * stride_g
				var reg_g: Array = S.region(Vector3(bufg[bg + 3], bufg[bg + 7], bufg[bg + 11]))
				var gx := float(reg_g[0]); var gy := float(reg_g[1]); var gz := float(reg_g[2])
				var ggh := S.tri_height_at(gx, gz)
				if is_finite(ggh):
					errs.append(absf(gy - ggh))
	errs.sort()
	var n := errs.size()
	return {
		"checked": n,
		"worst_m": snappedf(errs[n - 1], 0.0001) if n > 0 else 0.0,
		"p95_m": snappedf(errs[mini(n - 1, int(n * 0.95))], 0.0001) if n > 0 else 0.0,
	}


func _s3_chunk_telemetry(S: KratorWorldStream) -> Dictionary:
	var n_ch := 0
	var tot_ms := 0.0
	var max_ms := 0.0
	var tot_bytes := 0
	for cid in S.chunks:
		var cw: Node3D = S.chunks[cid]
		var mi := (cw.get_meta("ground", null) if cw.has_meta("ground") else null) as MeshInstance3D
		if mi != null and mi.has_meta("grid"):
			var gd: Dictionary = mi.get_meta("grid")
			var ms := float(gd.get("s3_ms", 0.0))
			var by := int(gd.get("s3_bytes", 0))
			if by > 0:
				n_ch += 1
				tot_ms += ms
				max_ms = maxf(max_ms, ms)
				tot_bytes += by
	return {
		"chunks": n_ch,
		"mean_ms": snappedf(tot_ms / float(maxi(1, n_ch)), 0.02),
		"max_ms": snappedf(max_ms, 0.02),
		"total_mb": snappedf(float(tot_bytes) / 1048576.0, 0.02),
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


# what the open places were cut into (krator/cells.gd, through the stream's cell_stats): nodes afterwards, items cut,
# instanced triangles in all and in the items that were cut
func _cells(S: KratorWorldStream) -> Dictionary:
	var out := {"nodes": 0, "split": 0, "light": 0, "over_budget": 0, "tris": 0, "tris_cut": 0, "ms": 0.0}
	for pid in S.cell_stats:
		for wn in S.cell_stats[pid]:
			var r: Dictionary = S.cell_stats[pid][wn]
			out["nodes"] += int(r.get("cells", 0))
			out["split"] += int(r.get("split", 0))
			out["light"] += int(r.get("light", 0))
			out["over_budget"] += int(r.get("over_budget", 0))
			out["tris"] += int(r.get("tris", 0))
			out["tris_cut"] += int(r.get("tris_cut", 0))
			out["ms"] += float(r.get("ms", 0.0))
	return out


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
	var look := KratorLook.from_args(OS.get_cmdline_user_args())

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

	var sky_node := KratorSky.new()
	sky_node.name = "KratorSky"
	sky_node.site_px = Vector2(1306.0, 1634.0)
	sky_node.day = 75.0
	host.add_child(sky_node)
	await process_frame
	sky_node.set_process(false)
	var e: Environment = sky_node.env
	var sun: DirectionalLight3D = sky_node.sun
	sky_node.preset["fogDensity"] = 0.000022
	sun.light_cull_mask = 1   # as walk.gd: the indoor layer is lit by its own lamps
	var plain := is_headless or RenderingServer.get_current_rendering_method() == "gl_compatibility"
	var look_rep := KratorLook.apply(look, e, sun, root)
	KratorLook.apply_sky(look, sky_node)
	if plain:   # as before: no sun shadow and no screen-space terms without the Forward+ renderer
		sun.shadow_enabled = false
		e.ssao_enabled = false
		e.ssil_enabled = false
		e.sdfgi_enabled = false
	print(KratorLook.describe(look))
	var vp_rid := root.get_viewport_rid()
	RenderingServer.viewport_set_measure_render_time(vp_rid, true)
	var caps: Dictionary = KratorLook.CAPS.get(str(look["tier"]), {})

	var S := KratorWorldStream.open(case_index)
	KratorLook.apply_stream(look, S)
	var air := KratorAir.make(look)
	root.add_child(air)
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
			S.cell_stats.erase(pid)
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
		var s3_tel := _s3_chunk_telemetry(S)
		var hours_out := []

		for hr_v in HOURS:
			var hr := float(hr_v)
			sky_node.hour = hr
			sky_node.site_px = Vector2(1306.0, 1634.0) + Vector2(eye.x, eye.z) / 2000.0
			sky_node.preset["clouds"]["height"] = maxf(1800.0, eye.y + 1650.0)
			sky_node.preset["clouds"]["cirrusHeight"] = maxf(9000.0, eye.y + 7200.0)
			sky_node._update()
			if sky_node.mat != null:
				sky_node.mat.set_shader_parameter("uCamPos", Vector3(fmod(eye.x, 260000.0), eye.y, fmod(eye.z, 260000.0)))
			sun.light_energy = clampf(sun.light_energy * 0.68, 0.0, 1.45)
			air.update(e, sun, sky_node.state, hr, sky_node.weather, S, eye, 1.0)   # the air's layers by the hour (krator/kair.gd)

			var ft := PackedFloat32Array()
			var gt := PackedFloat32Array()
			var ct := PackedFloat32Array()
			var frames_run := 2 if is_headless else n_frames
			var last_u := Time.get_ticks_usec()
			for _f in frames_run:
				await process_frame
				var now_u := Time.get_ticks_usec()
				ft.append((now_u - last_u) / 1000.0)
				last_u = now_u
				gt.append(RenderingServer.viewport_get_measured_render_time_gpu(vp_rid))
				ct.append(RenderingServer.viewport_get_measured_render_time_cpu(vp_rid) + RenderingServer.get_frame_setup_time_cpu())
			ft.sort()
			gt.sort()
			ct.sort()
			var med_ms := snappedf(ft[ft.size() / 2], 0.01) if not ft.is_empty() else 0.0
			var p95_ms := snappedf(ft[mini(ft.size() - 1, int(ft.size() * 0.95))], 0.01) if not ft.is_empty() else 0.0
			var dc := int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME))
			var pr := int(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME))

			var h_rec := {
				"hour": hr,
				"median_ms": med_ms,
				"p95_ms": p95_ms,
				"gpu_ms": snappedf(gt[gt.size() / 2], 0.01) if not gt.is_empty() else 0.0,
				"cpu_ms": snappedf(ct[ct.size() / 2], 0.01) if not ct.is_empty() else 0.0,
				"draws": dc,
				"prims": pr,
			}
			if caps.has("prims") and not plain:
				h_rec["prims_cap"] = int(caps["prims"])
				h_rec["over_cap"] = pr > int(caps["prims"])
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
			"s3_chunks": s3_tel,
			"s4_layers_mb": snappedf(float(KratorGroundLayers.s4_vram_bytes) / 1048576.0, 0.02),
			"s1_horizon_mb": snappedf(float(KratorGroundLayers.hz_vram_bytes) / 1048576.0, 0.02),
			"scene_counts": sc_cnt,
			"cells": _cells(S),
			"occluders": S.occluder_stats.duplicate(),
			"vram_mb": vram_mb,
			"tex_mb": tex_mb,
			"buf_mb": buf_mb,
			"plant_ground": pg_err,
			"hours": hours_out,
		})
		print("stop %-16s  stream=%.1f ms  s3=%.2f ms/ch (%.2f MB)  nodes=%d  mm=%d  flora=%d/%d  grass=%d/%d  vram=%.1f MB  plant_err=%.4f m" % [
			str(st["id"]), stream_ms, float(s3_tel["mean_ms"]), float(s3_tel["total_mb"]),
			int(sc_cnt["active_draw_nodes"]), int(sc_cnt["multimesh_instances"]),
			int(fl_counts["hero"]), int(fl_counts["mid"]),
			int(fl_counts.get("grass_near", 0)), int(fl_counts.get("grass_mid", 0)),
			vram_mb, float(pg_err["worst_m"])])

	var rep := {
		"format": "krator-godot-route-baseline",
		"version": 3,
		"case": case_index,
		"look": {"tier": str(look["tier"]), "described": KratorLook.describe(look), "shadow_texels_m": look_rep["texels"], "caps": caps,
			"spec": look, "sun_shadow": sun.shadow_enabled},
		"adapter": RenderingServer.get_video_adapter_name(),
		"api": RenderingServer.get_video_adapter_api_version(),
		"display": DisplayServer.get_name(),
		"godot": Engine.get_version_info()["string"],
		"s4_layers_mb": snappedf(float(KratorGroundLayers.s4_vram_bytes) / 1048576.0, 0.02),
		"s1_horizon_mb": snappedf(float(KratorGroundLayers.hz_vram_bytes) / 1048576.0, 0.02),
		"stops": stops_out,
	}

	if out_json != "":
		var f := FileAccess.open(out_json, FileAccess.WRITE)
		if f != null:
			f.store_string(JSON.stringify(rep, "\t") + "\n")
			f.close()
			print("wrote " + out_json)

	if out_md != "":
		var md := "# Godot Deterministic Route Baseline (Stages 3 + 4)\n\n- **Adapter:** `%s` (`%s`, display `%s`, Godot `%s`)\n- **Look:** %s\n\n" % [
			rep["adapter"], rep["api"], rep["display"], rep["godot"], KratorLook.describe(look)]
		md += "| Stop | Hour | Primitives (M) | Cap (M) | Draws | GPU (ms) | CPU (ms) | Frame med/p95 (ms) | Cells (nodes / triangles cut) |\n"
		md += "|---|---:|---:|---:|---:|---:|---:|---|---|\n"
		for s in stops_out:
			var cl: Dictionary = s["cells"]
			for h in s["hours"]:
				md += "| `%s` | `%.1f` | `%.1f`%s | `%s` | `%d` | `%.2f` | `%.2f` | `%.2f / %.2f` | `%d / %.0f%%` |\n" % [
					str(s["id"]), float(h["hour"]), float(h["prims"]) / 1e6, " **over**" if bool(h.get("over_cap", false)) else "",
					("%.0f" % (float(h["prims_cap"]) / 1e6)) if h.has("prims_cap") else "-", int(h["draws"]), float(h["gpu_ms"]), float(h["cpu_ms"]),
					float(h["median_ms"]), float(h["p95_ms"]), int(cl["nodes"]), 100.0 * float(cl["tris_cut"]) / maxf(1.0, float(cl["tris"]))]
		md += "\n"
		md += "| Stop | Stream (ms) | S3 Normals (ms/ch / MB) | Draw Nodes | MultiMesh Inst | Flora (Hero/Mid) | Grass (Near/Mid) | VRAM (MB) | Worst Plant Err (m) | Noon Med/p95 (ms) |\n"
		md += "|---|---:|---|---:|---:|---|---|---:|---:|---|\n"
		for s in stops_out:
			var h0: Dictionary = s["hours"][0]
			var fl: Dictionary = s["stream_flora"]
			var sc: Dictionary = s["scene_counts"]
			var pg: Dictionary = s["plant_ground"]
			var s3d: Dictionary = s["s3_chunks"]
			md += "| `%s` | `%.1f` | `%.2f / %.2f` | `%d` | `%d` | `%d / %d` | `%d / %d` | `%.1f` | `%.4f` | `%.2f / %.2f` |\n" % [
				str(s["id"]), float(s["stream_build_ms"]), float(s3d["mean_ms"]), float(s3d["total_mb"]),
				int(sc["active_draw_nodes"]), int(sc["multimesh_instances"]),
				int(fl["hero"]), int(fl["mid"]), int(fl.get("grass_near", 0)), int(fl.get("grass_mid", 0)),
				float(s["vram_mb"]), float(pg["worst_m"]),
				float(h0["median_ms"]), float(h0["p95_ms"])]
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
