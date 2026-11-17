# M8 "walk the road" (GODOT-PLAN.md), on the GPU: the walk of tests/export/oidong_walk_test.gd rendered in a window,
# frame time and hitches measured per stretch, and every stream update that loaded or freed a case timed. Writes
# godot/PERF-road.md. Run it on the RTX lane (the numbers from --headless mean nothing):
#   python3 tools/harness.py lock --lane rtx -- <godot> --path godot --script res://tests/perf/road_perf.gd
#     -- --size=1600x900 (the window) --speed=30 (m/s) --out=res://PERF-road.md
extends SceneTree

const CASE := "res://data/world-oidong-highrift/index.json"
const HITCH_MS := 33.3
var speed := 30.0
var size := Vector2i(1600, 900)
var out := "res://PERF-road.md"


func _initialize() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--speed="): speed = float(a.trim_prefix("--speed="))
		elif a.begins_with("--size="): var s := a.trim_prefix("--size=").split("x"); size = Vector2i(int(s[0]), int(s[1]))
		elif a.begins_with("--out="): out = a.trim_prefix("--out=")
	DisplayServer.window_set_size(size)
	DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
	_run()


func _road(W: KratorWorldWalk) -> Array:
	var R := W.stream.road(str(W.stream.index["route"]["link"]))
	var pts := []
	for p in R.get("pts", []):
		pts.append([float(p[0]), float(p[1])])
	if R.get("from") != W.stream.index["route"]["from"]:
		pts.reverse()
	return pts


func _slice(pts: Array, a: float, b: float) -> Array:
	var out_ := []
	var s := 0.0
	for i in pts.size():
		if i > 0:
			s += Vector2(pts[i][0], pts[i][1]).distance_to(Vector2(pts[i - 1][0], pts[i - 1][1]))
		if s >= a and s <= b:
			out_.append(pts[i])
	return out_


func _len(pts: Array) -> float:
	var s := 0.0
	for i in range(1, pts.size()):
		s += Vector2(pts[i][0], pts[i][1]).distance_to(Vector2(pts[i - 1][0], pts[i - 1][1]))
	return s


func _run() -> void:
	var host := Node3D.new()
	root.add_child(host)
	var env := WorldEnvironment.new()
	var e := Environment.new()
	var sky := Sky.new()
	sky.sky_material = ProceduralSkyMaterial.new()
	e.background_mode = Environment.BG_SKY
	e.sky = sky
	e.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.environment = e
	host.add_child(env)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-50, 30, 0)
	sun.shadow_enabled = true
	host.add_child(sun)
	var W := KratorWorldWalk.make(CASE)
	host.add_child(W)
	W.cam.current = true
	var road := _road(W)
	var L := _len(road)
	var rows := []
	for s in [["out of Longsong", 1000.0], ["the valley's middle", L * 0.5], ["the last climb to Strongbow", L - 3000.0]]:
		var pts := _slice(road, s[1], s[1] + 3000.0)
		var t0 := Time.get_ticks_msec()
		W.updates.clear()
		W.start_at(pts[0][0], pts[0][1])
		var load_ms := Time.get_ticks_msec() - t0
		for k in 60:
			await process_frame
		W.drive(pts.slice(1), speed)
		var ft := PackedFloat32Array()
		var last := Time.get_ticks_usec()
		var maxdc := 0
		var maxprim := 0
		var t_end := Time.get_ticks_msec() + int(_len(pts) / speed * 2000.0) + 20000   # twice the drive's time: a stuck walker ends the stretch
		while W.driving and Time.get_ticks_msec() < t_end:
			await process_frame
			var now := Time.get_ticks_usec()
			ft.append((now - last) / 1000.0)
			last = now
			maxdc = maxi(maxdc, int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)))
			maxprim = maxi(maxprim, int(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME)))
		var sorted := ft.duplicate()
		sorted.sort()
		var mean := 0.0
		var hitches := 0
		for v in ft:
			mean += v
			if v > HITCH_MS: hitches += 1
		mean /= maxf(1.0, ft.size())
		var upd := []
		for u in W.updates:
			upd.append("%.0f ms (%s%s)" % [u["ms"], "+" + ",".join(PackedStringArray(u["loaded"])) if (u["loaded"] as Array).size() else "", " -" + ",".join(PackedStringArray(u["unloaded"])) if (u["unloaded"] as Array).size() else ""])
		var reached := not W.driving
		W.driving = false
		rows.append({"name": s[0] + ("" if reached else " (NOT REACHED)"), "km": s[1] / 1000.0, "start_ms": load_ms, "frames": ft.size(), "mean": mean,
			"p95": sorted[int(sorted.size() * 0.95)] if sorted.size() else 0.0, "worst": sorted[sorted.size() - 1] if sorted.size() else 0.0,
			"hitches": hitches, "draws": maxdc, "prims": maxprim, "updates": upd,
			"vram_mb": Performance.get_monitor(Performance.RENDER_VIDEO_MEM_USED) / 1048576.0})
		print("%s: %d frames, mean %.1f ms, p95 %.1f, worst %.1f, %d hitches; updates %s" % [s[0], ft.size(), mean, rows[-1]["p95"], rows[-1]["worst"], hitches, ", ".join(PackedStringArray(upd))])
	var md := "# The road on the GPU (GODOT-PLAN.md M8)\n\n%s, %s, %dx%d, vsync off, Godot %s; `tests/perf/road_perf.gd`, the walker driven at %d m/s over 3 km of road a stretch.\n\n" % [
		RenderingServer.get_video_adapter_name(), RenderingServer.get_video_adapter_api_version(), size.x, size.y, Engine.get_version_info()["string"], int(speed)]
	md += "| Stretch | Start (ms) | Frames | Mean (ms) | 95th (ms) | Worst (ms) | Hitches > 33 ms | Draw calls (max) | Primitives (max) | VRAM (MB) |\n|---|---|---|---|---|---|---|---|---|---|\n"
	for r in rows:
		md += "| %s (km %.0f) | %d | %d | %.1f | %.1f | %.1f | %d | %d | %d | %.0f |\n" % [r["name"], r["km"], r["start_ms"], r["frames"], r["mean"], r["p95"], r["worst"], r["hitches"], r["draws"], r["prims"], r["vram_mb"]]
	md += "\nThe stream's updates that loaded (+) or freed (-) a case, during each drive (each runs on the main thread: its time is a hitch):\n\n"
	for r in rows:
		md += "- %s: %s\n" % [r["name"], ", ".join(PackedStringArray(r["updates"])) if r["updates"].size() else "none"]
	var f := FileAccess.open(out, FileAccess.WRITE)
	f.store_string(md)
	f.close()
	print("wrote " + out)
	quit(0)
