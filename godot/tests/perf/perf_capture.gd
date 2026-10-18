# The perf capture (ROADMAP.md section 11, item 4): one command measures each must-pass case on the machine it runs on
# and writes the table. Run it on the owner's GPU in Forward+ (the numbers from CI's llvmpipe or from --headless mean nothing:
# the headless run only proves the script works, tools/test_all.py --nightly smokes it that way).
#
#   godot --path godot --script res://tests/perf/perf_capture.gd -- --cases=world-sedesert,world-iziz
#     --frames=120      frames sampled at each pose (after --warmup=10 settle frames)
#     --out=res://      where perf-<case>.json and PERF.md go (the nightly uses --out=res://shots/perf, gitignored)
#     --compare         print the deltas against the perf-<case>.json already in --out before overwriting it
#     --compare=<dir>   ... against the perf-<case>.json in that directory
#     --size=1600x900   the window (the default; frame time depends on it, so the table says what it was)
#     --vsync           keep vsync (off by default, so frame time is the GPU's, not the monitor's)
#
# For each case: the spike's own loader (spike.gd _load_case: no importer is forked here) imports the world; the import
# wall time and the time to the first rendered frame are recorded; then the camera visits POSES (below), and at each pose
# samples --frames frames: frame time (the frame delta, mean and 95th percentile; Performance.TIME_PROCESS, which Godot
# refreshes once a second as the worst process step of that second, as the max seen), the
# RenderingServer's draw calls, primitives and objects in frame, video, texture and buffer memory, static memory, plus
# the scene's node count and its MultiMesh instance total. Written as perf-<case>.json (next to spike-report.json) and
# PERF.md (one table per case, one row per pose, the machine at the top), rebuilt from every perf-*.json in --out.
extends SceneTree

# The camera poses, relative to the case's focus (the box centre, on the ground). eye and at are offsets from the focus;
# an eye marked ground stands dy above the ground at its own (x, z) instead of above the focus (a low view at the tile's
# edge should not float or sink where the land slopes). The tiles are 300 m (sedesert) and 240 m (Iziz) square, the lens
# 75 degrees: a camera 360 m out sees the whole tile; the near pose is a walker's eye in the middle of it.
const POSES := [
	{"name": "whole tile, high oblique", "eye": [200.0, 160.0, 260.0], "at": [0.0, 0.0, 0.0]},        # every chunk in view, the far LOD
	{"name": "whole tile, from the far side", "eye": [-180.0, 220.0, -180.0], "at": [0.0, 0.0, 0.0]},  # the same, the other way: the sun side
	{"name": "edge, eye level, looking in", "eye": [-120.0, 8.0, 0.0], "at": [0.0, 4.0, 0.0], "ground": true},   # mid range, half the tile
	{"name": "near, a walker at the centre", "eye": [10.0, 1.7, 10.0], "at": [0.0, 1.0, 0.0], "ground": true},  # the near LOD, the ground up close
]

var cases: PackedStringArray = ["world-sedesert", "world-iziz"]
var frames := 120
var warmup := 10
var out_dir := "res://"
var compare_dir := ""
var spike   # the spike (spike.gd), untyped so its loader and counters can be called


func _initialize() -> void:
	var a := _args()
	if a.has("cases"):
		cases = str(a["cases"]).split(",", false)
	frames = int(a.get("frames", frames))
	warmup = int(a.get("warmup", warmup))
	out_dir = str(a.get("out", out_dir))
	if not out_dir.ends_with("/"):
		out_dir += "/"
	if a.has("compare"):
		compare_dir = out_dir if a["compare"] is bool else str(a["compare"])
		if not compare_dir.ends_with("/"):
			compare_dir += "/"
	var headless := DisplayServer.get_name() == "headless"
	if not headless:
		var size: PackedStringArray = str(a.get("size", "1600x900")).split("x")
		DisplayServer.window_set_size(Vector2i(int(size[0]), int(size[1])))
		if not a.has("vsync"):
			DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
	Engine.max_fps = 0
	# the spike's stage, camera and loader (driven: its _ready loads no case of its own); loaded here, not
	# preloaded: spike.gd names the Atmos autoload, which exists only once the autoloads are up, after this script is parsed
	var S = load("res://spike.gd")
	if S == null:
		print("FAIL cannot load res://spike.gd")
		quit(1)
		return
	spike = S.new()
	spike.driven = true
	root.add_child(spike)
	_run.call_deferred()


func _args() -> Dictionary:
	var a := {}
	for s in OS.get_cmdline_user_args():
		var kv := s.trim_prefix("--").split("=", true, 1)
		a[kv[0]] = kv[1] if kv.size() > 1 else true
	return a


func _run() -> void:
	var machine := _machine()
	print("perf capture: %s, %s %s on %s%s" % [machine["godot"], machine["renderer"], machine["driver"], machine["gpu"] if machine["gpu"] != "" else "no GPU", " (HEADLESS: the numbers mean nothing)" if machine["headless"] else ""])
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(out_dir))
	var failed := false
	for c in cases:
		if not FileAccess.file_exists("res://data/%s/world.json" % c) and not DirAccess.dir_exists_absolute("res://data/" + c):
			print("=== %s: no data (godot/README.md, \"Re-exporting the data\")" % c)
			failed = true
			continue
		var r := await _capture(c)
		r["machine"] = machine
		var path := out_dir + "perf-%s.json" % c
		if compare_dir != "":
			_compare(c, compare_dir + "perf-%s.json" % c, r)
		var f := FileAccess.open(path, FileAccess.WRITE)
		if f:
			f.store_string(JSON.stringify(r, "  ") + "\n")
			f.close()
			print("wrote ", path)
		else:
			print("FAIL cannot write ", path)
			failed = true
	_write_md()
	quit(1 if failed else 0)


func _capture(c: String) -> Dictionary:
	print("=== %s" % c)
	var r := {"case": c, "poses": [], "frames": frames, "warmup": warmup}
	var t0 := Time.get_ticks_usec()
	var report: Dictionary = spike._load_case(c)
	r["import_ms"] = (Time.get_ticks_usec() - t0) / 1000.0           # _load_case: read, decode, build the nodes, the stage
	r["load_ms"] = report.get("counts", {}).get("load_ms", null)      # the importer's own clock, inside that
	await process_frame
	if DisplayServer.get_name() != "headless":   # headless never draws, so frame_post_draw never comes
		await RenderingServer.frame_post_draw                         # the first frame drawn with the world in it
	r["first_frame_ms"] = (Time.get_ticks_usec() - t0) / 1000.0
	r["gaps"] = report.get("gaps", {}).size()
	r["counts"] = report.get("counts", {})
	var ids: Dictionary = spike._count_ids(spike.world)
	r["nodes_world"] = _count_nodes(spike.world)
	r["nodes_total"] = int(Performance.get_monitor(Performance.OBJECT_NODE_COUNT))
	r["multimeshes"] = ids["multimeshes"]
	r["instances"] = ids["instances"]
	r["mesh_nodes"] = ids["nodes"]
	print("  import %.0f ms (importer %s ms), first frame at %.0f ms; %d nodes, %d mesh nodes, %d multimeshes, %d instances" % [
		r["import_ms"], str(r["load_ms"]), r["first_frame_ms"], r["nodes_world"], r["mesh_nodes"], r["multimeshes"], r["instances"]])
	var focus: Vector3 = spike.case_focus
	for p in POSES:
		var eye := focus + Vector3(p["eye"][0], p["eye"][1], p["eye"][2])
		var at := focus + Vector3(p["at"][0], p["at"][1], p["at"][2])
		if p.get("ground", false) and spike.ground:
			eye.y = KData.height_at(spike.ground, eye.x, eye.z) + p["eye"][1]
			at.y = KData.height_at(spike.ground, at.x, at.z) + p["at"][1]
		spike.cam.look_from(eye, at)
		var s := await _sample()
		s["name"] = p["name"]
		s["eye"] = [snappedf(eye.x, 0.01), snappedf(eye.y, 0.01), snappedf(eye.z, 0.01)]
		s["at"] = [snappedf(at.x, 0.01), snappedf(at.y, 0.01), snappedf(at.z, 0.01)]
		r["poses"].append(s)
		print("  %-32s frame %6.2f ms (p95 %6.2f)  process max %6.2f ms  draws %6d  prims %9d  objects %6d  vram %7.1f MB  tex %7.1f MB" % [
			s["name"], s["frame_ms_mean"], s["frame_ms_p95"], s["process_ms_max"], s["draw_calls"], s["primitives"], s["objects"], s["vram_mb"], s["tex_mb"]])
	return r


# --frames frames at the pose the camera is in now, after --warmup frames to let the LOD and the shaders settle
func _sample() -> Dictionary:
	for i in warmup:
		await process_frame
	var dts := PackedFloat64Array()
	var proc_max := 0.0
	var draws := 0.0
	var prims := 0.0
	var objs := 0.0
	var last := Time.get_ticks_usec()
	for i in frames:
		await process_frame
		var now := Time.get_ticks_usec()
		dts.append((now - last) / 1000.0)
		last = now
		proc_max = maxf(proc_max, Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0)
		draws += Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)
		prims += Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME)
		objs += Performance.get_monitor(Performance.RENDER_TOTAL_OBJECTS_IN_FRAME)
	var n := float(maxi(frames, 1))
	return {
		"frame_ms_mean": snappedf(_mean(dts), 0.001), "frame_ms_p95": snappedf(_p95(dts), 0.001),
		"process_ms_max": snappedf(proc_max, 0.001),
		"fps": snappedf(1000.0 / maxf(_mean(dts), 0.001), 0.1),
		"draw_calls": int(round(draws / n)), "primitives": int(round(prims / n)), "objects": int(round(objs / n)),
		"vram_mb": snappedf(Performance.get_monitor(Performance.RENDER_VIDEO_MEM_USED) / 1048576.0, 0.01),
		"tex_mb": snappedf(Performance.get_monitor(Performance.RENDER_TEXTURE_MEM_USED) / 1048576.0, 0.01),
		"buffer_mb": snappedf(Performance.get_monitor(Performance.RENDER_BUFFER_MEM_USED) / 1048576.0, 0.01),
		"static_mb": snappedf(Performance.get_monitor(Performance.MEMORY_STATIC) / 1048576.0, 0.01),
	}


func _mean(a: PackedFloat64Array) -> float:
	if a.is_empty():
		return 0.0
	var s := 0.0
	for v in a:
		s += v
	return s / a.size()


func _p95(a: PackedFloat64Array) -> float:
	if a.is_empty():
		return 0.0
	var b := a.duplicate()
	b.sort()
	return b[clampi(int(ceil(0.95 * b.size())) - 1, 0, b.size() - 1)]


func _count_nodes(n: Node) -> int:
	var k := 0
	var stack: Array[Node] = [n]
	while stack.size() > 0:
		var x: Node = stack.pop_back()
		k += 1
		for ch in x.get_children():
			stack.append(ch)
	return k


func _machine() -> Dictionary:
	var size := DisplayServer.window_get_size() if DisplayServer.get_name() != "headless" else Vector2i.ZERO
	return {
		"godot": Engine.get_version_info()["string"],
		"renderer": RenderingServer.get_current_rendering_method(),
		"driver": RenderingServer.get_current_rendering_driver_name(),
		"gpu": RenderingServer.get_video_adapter_name(),
		"gpu_vendor": RenderingServer.get_video_adapter_vendor(),
		"gpu_api": RenderingServer.get_video_adapter_api_version(),
		"os": OS.get_name(),
		"headless": DisplayServer.get_name() == "headless",
		"window": "%dx%d" % [size.x, size.y],
		"vsync": DisplayServer.get_name() != "headless" and DisplayServer.window_get_vsync_mode() != DisplayServer.VSYNC_DISABLED,
		"date": Time.get_datetime_string_from_system(true, true),
		"commit": _git_commit(),
	}


# the checkout's HEAD commit (best effort: a worktree's .git file, a symbolic ref, packed refs), "unknown" otherwise
func _git_commit() -> String:
	var repo := ProjectSettings.globalize_path("res://").path_join("..")
	var gitdir := repo.path_join(".git")
	var common := gitdir
	if FileAccess.file_exists(gitdir):   # a worktree: ".git" is a file naming its gitdir
		var line := FileAccess.get_file_as_string(gitdir).strip_edges()
		if line.begins_with("gitdir:"):
			gitdir = line.trim_prefix("gitdir:").strip_edges()
			if gitdir.is_relative_path():
				gitdir = repo.path_join(gitdir)
			common = gitdir
			if FileAccess.file_exists(gitdir.path_join("commondir")):
				common = FileAccess.get_file_as_string(gitdir.path_join("commondir")).strip_edges()
				if common.is_relative_path():
					common = gitdir.path_join(common)
	if not FileAccess.file_exists(gitdir.path_join("HEAD")):
		return "unknown"
	var head := FileAccess.get_file_as_string(gitdir.path_join("HEAD")).strip_edges()
	if not head.begins_with("ref:"):
		return head.substr(0, 12)
	var ref := head.trim_prefix("ref:").strip_edges()
	for d in [gitdir, common]:
		if FileAccess.file_exists(d.path_join(ref)):
			return FileAccess.get_file_as_string(d.path_join(ref)).strip_edges().substr(0, 12)
	if FileAccess.file_exists(common.path_join("packed-refs")):
		for ln in FileAccess.get_file_as_string(common.path_join("packed-refs")).split("\n"):
			if ln.ends_with(" " + ref):
				return ln.substr(0, 12)
	return "unknown (" + ref + ")"


# --compare: the previous capture of this case against the new one, a line per figure that moved
func _compare(c: String, prev_path: String, r: Dictionary) -> void:
	if not FileAccess.file_exists(prev_path):
		print("  compare: no previous %s" % prev_path)
		return
	var prev = JSON.parse_string(FileAccess.get_file_as_string(prev_path))
	if not (prev is Dictionary):
		print("  compare: %s is not a capture" % prev_path)
		return
	var pm: Dictionary = prev.get("machine", {})
	print("  compare %s: %s %s on %s, %s, %s  ->  now" % [c, pm.get("renderer", "?"), pm.get("godot", "?"), pm.get("gpu", "?") if str(pm.get("gpu", "")) != "" else "no GPU", pm.get("date", "?"), pm.get("commit", "?")])
	for k in ["import_ms", "first_frame_ms", "nodes_world", "instances", "multimeshes"]:
		_delta("  " + k, prev.get(k), r.get(k))
	var by_name := {}
	for p in prev.get("poses", []):
		by_name[p["name"]] = p
	for p in r["poses"]:
		var q = by_name.get(p["name"])
		if q == null:
			print("    %s: new pose" % p["name"])
			continue
		for k in ["frame_ms_mean", "frame_ms_p95", "process_ms_max", "draw_calls", "primitives", "objects", "vram_mb", "tex_mb"]:
			_delta("    %s %s" % [p["name"], k], q.get(k), p.get(k))


func _delta(label: String, a, b) -> void:
	if a == null or b == null:
		return
	var fa := float(a)
	var fb := float(b)
	if is_equal_approx(fa, fb):
		return
	var pct := "" if abs(fa) < 1e-9 else " (%+.1f%%)" % (100.0 * (fb - fa) / fa)
	print("%s: %s -> %s%s" % [label, _fmt(fa), _fmt(fb), pct])


func _fmt(v: float) -> String:
	return str(int(round(v))) if is_equal_approx(v, round(v)) and abs(v) >= 100.0 else "%.2f" % v


# PERF.md from every perf-*.json in --out (so a run of one case keeps the others' tables)
func _write_md() -> void:
	var names := []
	var dir := DirAccess.open(out_dir)
	if dir:
		for f in dir.get_files():
			if f.begins_with("perf-") and f.ends_with(".json"):
				names.append(f)
	names.sort()
	var md := "# The spike's perf table\n\n"
	md += "Written by `godot --path godot --script res://tests/perf/perf_capture.gd -- --cases=...` (`godot/README.md`, \"The perf capture\"): "
	md += "one table per must-pass case, one row per camera pose (`POSES` in the script), the machine above each. "
	md += "**Only a run in Forward+ on a real GPU counts** (`godot/CHECKLIST.md`, item 7); a headless or llvmpipe run only proves the script runs, and says so in its header. "
	md += "Frame time is the frame delta with vsync off at the window size shown; p95 is the 95th percentile; process is `Performance.TIME_PROCESS` (Godot refreshes it once a second as that second's worst process step: the max seen at the pose); "
	md += "draws, prims and objects are the RenderingServer's per-frame totals; VRAM, textures and buffers are `RENDER_*_MEM_USED`. Paste a real run's tables into `GODOT-PLAN.md`'s findings.\n\n"
	if names.is_empty():
		md += "No capture yet.\n"
	for f in names:
		var d = JSON.parse_string(FileAccess.get_file_as_string(out_dir + f))
		if not (d is Dictionary):
			continue
		var m: Dictionary = d.get("machine", {})
		md += "## %s\n\n" % d.get("case", f)
		md += "- %s, **%s** (%s), GPU: %s%s\n" % [m.get("godot", "?"), m.get("renderer", "?"), m.get("driver", "?"), m.get("gpu", "?") if str(m.get("gpu", "")) != "" else "none",
			"  **HEADLESS: the numbers mean nothing**" if m.get("headless", false) else ""]
		md += "- %s, commit `%s`, %s, window %s, vsync %s, %d frames per pose after %d warm-up\n" % [m.get("os", "?"), m.get("commit", "?"), m.get("date", "?"), m.get("window", "?"), "on" if m.get("vsync", false) else "off", int(d.get("frames", 0)), int(d.get("warmup", 0))]
		md += "- import %.0f ms (the importer's own clock %s ms), first frame at %.0f ms; %d nodes, %d mesh nodes, %d MultiMeshes with %d instances; %d gaps reported\n\n" % [
			float(d.get("import_ms", 0)), str(d.get("load_ms", "?")), float(d.get("first_frame_ms", 0)), int(d.get("nodes_world", 0)), int(d.get("mesh_nodes", 0)), int(d.get("multimeshes", 0)), int(d.get("instances", 0)), int(d.get("gaps", 0))]
		md += "| Pose | Frame ms | p95 | fps | Process max ms | Draws | Prims | Objects | VRAM MB | Tex MB | Buf MB | Static MB |\n"
		md += "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n"
		for p in d.get("poses", []):
			md += "| %s | %.2f | %.2f | %.0f | %.2f | %d | %d | %d | %.1f | %.1f | %.1f | %.1f |\n" % [p.get("name", "?"), float(p.get("frame_ms_mean", 0)), float(p.get("frame_ms_p95", 0)), float(p.get("fps", 0)),
				float(p.get("process_ms_max", 0)), int(p.get("draw_calls", 0)), int(p.get("primitives", 0)), int(p.get("objects", 0)),
				float(p.get("vram_mb", 0)), float(p.get("tex_mb", 0)), float(p.get("buffer_mb", 0)), float(p.get("static_mb", 0))]
		md += "\n"
	var f := FileAccess.open(out_dir + "PERF.md", FileAccess.WRITE)
	if f:
		f.store_string(md)
		f.close()
		print("wrote %sPERF.md" % out_dir)
