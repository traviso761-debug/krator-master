# M8 "walk the road" (GODOT-PLAN.md): the one world, playable. Streams any krator-world-stream case
# (default: godot/data/world-oidong-highrift; also godot/data/world-pinnacle via --case=world-pinnacle)
# round a walker (krator/world_walk.gd), on the case's ground and buildings with collision, Forward+ AgX + SSAO,
# 2,400 m 4-cascade sun shadows, optional --gi (SDFGI), live clock-driven sun & sky, and indoor ambient dimming.
#
#   godot --path godot res://walk.tscn                                   Longsong on the Sultanate's road
#   godot --path godot res://walk.tscn -- --at=strongbow                 Strongbow's plateau, behind its lip
#   godot --path godot res://walk.tscn -- --case=world-pinnacle          Pinnacle Rock's camp tracks & hyperjungle edge
#   godot --path godot res://walk.tscn -- --case=world-pinnacle --gi     with live SDFGI global illumination
#   godot --path godot res://walk.tscn -- --at=x,z                       start at a point in the region's metres
#
# Keys: WASD or the arrows walk, Shift runs (x5), Q / E or a right drag turn, R rides the nearest road,
# Esc stops riding, , and . slow and speed the clock.
extends Node3D

const DEFAULT_CASE := "res://data/world-oidong-highrift/index.json"
var case_index := DEFAULT_CASE
var W: KratorWorldWalk
var hud: Label
var env_res: Environment
var sky_mat: ProceduralSkyMaterial
var sun: DirectionalLight3D
var _drag := false
var _gi_on := false
var traffic: KratorValleyTraffic
var carts: MultiMeshInstance3D
var minute := 6.5 * 60.0     # sim minutes into the week (day 1, 06:30 golden morning light)
var rate := 60.0             # sim minutes a real second
var _shown := 0
var _tt := 0.0
var _indoors := false


func _parse_case() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--case="):
			var v := a.trim_prefix("--case=")
			if v.ends_with(".json"):
				case_index = v if v.begins_with("res://") else "res://" + v.trim_prefix("/")
			else:
				case_index = "res://data/%s/index.json" % v.trim_suffix("/")
		elif a == "--gi":
			_gi_on = true


func _ready() -> void:
	_parse_case()
	var env := WorldEnvironment.new()
	env_res = Environment.new()
	var sky := Sky.new()
	sky_mat = ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.19, 0.34, 0.62)
	sky_mat.sky_horizon_color = Color(0.62, 0.72, 0.84)
	sky_mat.ground_horizon_color = Color(0.46, 0.44, 0.40)
	sky_mat.ground_bottom_color = Color(0.16, 0.14, 0.12)
	sky.sky_material = sky_mat
	env_res.background_mode = Environment.BG_SKY
	env_res.sky = sky
	env_res.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env_res.ambient_light_sky_contribution = 1.0
	env_res.tonemap_mode = Environment.TONE_MAPPER_AGX
	env_res.ssao_enabled = true
	env_res.ssao_radius = 1.4
	env_res.ssao_intensity = 1.55
	env_res.fog_enabled = true
	env_res.fog_density = 0.000018
	env_res.fog_sky_affect = 0.28
	if _gi_on:
		env_res.sdfgi_enabled = true
		env_res.sdfgi_use_occlusion = true
		env_res.sdfgi_read_sky_light = true
	env.environment = env_res
	add_child(env)
	sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-42, 32, 0)
	sun.shadow_enabled = true
	sun.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_4_SPLITS
	sun.directional_shadow_max_distance = 2400.0
	sun.directional_shadow_blend_splits = true
	add_child(sun)
	W = KratorWorldWalk.make(case_index)
	W.interactive = true
	add_child(W)
	W.cam.current = true
	var at := _start()
	W.start_at(at.x, at.y)
	var sim_path := case_index.get_base_dir() + "/sim.json"
	if FileAccess.file_exists(sim_path):
		var sim = KData.read_json(sim_path)
		if sim is Dictionary:
			traffic = KratorValleyTraffic.make(W.stream.index, sim)
			carts = MultiMeshInstance3D.new()
			carts.name = "Carts"
			W.stream.add_child(carts)
	hud = Label.new()
	hud.position = Vector2(12, 10)
	var cl := CanvasLayer.new()
	cl.add_child(hud)
	add_child(cl)
	_update_sun_and_ambience(0.0, true)


func _start() -> Vector2:
	var I: Dictionary = W.stream.index
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--at="):
			var v := a.trim_prefix("--at=")
			if v == "strongbow":
				var p := W.stream.place("sfgtxw10kr")
				if p.get("arcology") is Dictionary:
					var at: Array = p["arcology"]["at"]
					return Vector2(float(at[0]) + 120.0, float(at[2]))   # behind the lip, on the page's plateau
				if p.has("pin"):
					return Vector2(p["pin"][0], p["pin"][1])
			var by_place := W.stream.place(v)
			if not by_place.is_empty() and by_place.has("pin"):
				return Vector2(float(by_place["pin"][0]), float(by_place["pin"][1]))
			for pl in I.get("places", []):
				if str(pl.get("name", "")).to_lower().find(v.to_lower()) >= 0 and pl.has("pin"):
					return Vector2(float(pl["pin"][0]), float(pl["pin"][1]))
			var xz := v.split(",")
			if xz.size() == 2:
				return Vector2(float(xz[0]), float(xz[1]))
	var r := _road(Vector2.ZERO)
	if r.size() > 0:
		return Vector2(r[0][0], r[0][1])
	var pls: Array = I.get("places", [])
	if pls.size() > 0 and pls[0].has("pin"):
		return Vector2(float(pls[0]["pin"][0]), float(pls[0]["pin"][1]))
	return Vector2.ZERO


# the primary route link if present (Longsong -> Strongbow), otherwise the road nearest `near`
func _road(near: Vector2) -> Array:
	var I: Dictionary = W.stream.index
	if I.get("route") is Dictionary and I["route"].has("link"):
		var R := W.stream.road(str(I["route"]["link"]))
		var pts := []
		for p in R.get("pts", []):
			pts.append([float(p[0]), float(p[1])])
		if R.get("from") != I["route"].get("from"):
			pts.reverse()
		return pts
	var best_pts := []
	var best_d := INF
	for R in I.get("roads", []):
		for p in R.get("pts", []):
			var d := Vector2(float(p[0]), float(p[1])).distance_to(near)
			if d < best_d:
				best_d = d
				best_pts = R.get("pts", [])
	var out := []
	for p in best_pts:
		out.append([float(p[0]), float(p[1])])
	return out


func _check_indoors() -> bool:
	var eye_local := W.walker.position + Vector3(0.0, 0.5, 0.0)
	for pid in W.stream.places_open:
		var pw: Node3D = W.stream.places_open[pid]
		var frame := pw.get_node_or_null("PageFrame") as Node3D
		var host: Node = frame if (frame != null and frame.has_meta("rooms")) else pw
		if host.has_meta("rooms"):
			var p_in_host := (host as Node3D).to_local(W.walker.global_position + Vector3(0.0, 0.5, 0.0)) if host is Node3D and (host as Node3D).is_inside_tree() else (eye_local - pw.position)
			if KratorLampPool.room_at(host.get_meta("rooms"), p_in_host) != "":
				return true
	return false


func _update_sun_and_ambience(dt: float, snap: bool) -> void:
	var hr := fmod(minute, 1440.0) / 60.0
	var phase := (hr - 6.0) / 12.0 * PI   # 06:00 sunrise -> 12:00 zenith -> 18:00 sunset
	var elev_sin := sin(phase)
	var day := clampf((elev_sin + 0.12) / 0.32, 0.0, 1.0)
	var warm := clampf(1.0 - absf(elev_sin) * 1.8, 0.0, 1.0) * day
	var pitch := -clampf(rad_to_deg(asin(clampf(absf(elev_sin), 0.06, 0.96))), 6.0, 76.0)
	var yaw := 28.0 + (hr - 6.0) * 11.5
	sun.rotation_degrees = Vector3(pitch, yaw, 0.0)
	sun.light_energy = lerpf(0.06, 1.25, day)
	sun.light_color = Color(1.0, 0.97, 0.92).lerp(Color(1.0, 0.72, 0.46), warm)
	sky_mat.sky_top_color = Color(0.02, 0.03, 0.07).lerp(Color(0.18, 0.34, 0.62), day)
	sky_mat.sky_horizon_color = Color(0.05, 0.06, 0.11).lerp(Color(0.62, 0.72, 0.84).lerp(Color(0.92, 0.58, 0.36), warm * 0.65), day)
	var atm = get_node_or_null("/root/Atmos")
	if atm != null and "hour" in atm:
		atm.hour = hr
	_indoors = _check_indoors()
	var want_sky := 0.18 if _indoors else 1.0
	env_res.ambient_light_sky_contribution = want_sky if snap else lerpf(env_res.ambient_light_sky_contribution, want_sky, clampf(dt * 5.0, 0.0, 1.0))


func _unhandled_input(ev: InputEvent) -> void:
	if ev is InputEventMouseButton and ev.button_index == MOUSE_BUTTON_RIGHT:
		_drag = ev.pressed
	elif ev is InputEventMouseMotion and _drag:
		W.turn(-ev.relative.x * 0.005)
	elif ev is InputEventKey and ev.pressed and not ev.echo:
		if ev.keycode == KEY_R:
			if W.driving:
				W.driving = false
			else:
				var here := W.region_xz()
				var pts := _road(here)
				var best := 0
				var bd := INF
				for i in pts.size():
					var d := Vector2(pts[i][0], pts[i][1]).distance_to(here)
					if d < bd:
						bd = d
						best = i
				W.drive(pts.slice(best), 40.0)
		elif ev.keycode == KEY_ESCAPE:
			W.driving = false
		elif ev.keycode == KEY_COMMA:
			rate = maxf(1.0, rate / 2.0)
		elif ev.keycode == KEY_PERIOD:
			rate = minf(3840.0, rate * 2.0)


func _process(dt: float) -> void:
	if Input.is_key_pressed(KEY_Q):
		W.turn(1.5 * dt)
	if Input.is_key_pressed(KEY_E):
		W.turn(-1.5 * dt)
	if not W.driving:
		W.speed = 6.0
	var p := W.region_xz()
	var g := W.stream.height_at(p.x, p.y)
	minute = fmod(minute + rate * dt, 10080.0)
	_update_sun_and_ambience(dt, false)
	_tt += dt
	if traffic and _tt >= 0.1:   # the carts redrawn ten times a second, at the stream's origin as it is now
		_tt = 0.0
		_shown = traffic.draw(W.stream, carts, minute, p, 20000.0)
	var reg := str(W.stream.index.get("region", "?"))
	var mic := "  micro v%s" % str(W.stream.index["micro"]) if W.stream.index.has("micro") else ""
	var gi_tag := "  SDFGI" if _gi_on else ""
	var ind_tag := "  [indoors]" if _indoors else ""
	var traf_tag := ", %d carts in sight" % _shown if traffic != null else ""
	hud.text = "%s%s%s%s  x %.0f  z %.0f  feet %.1f m (ground %.1f)\nchunks %d  places %s  rebases %d\nday %d, %02d:%02d (x%d)%s\n%d fps  %s\nWASD walk, Shift run, Q/E or right drag turn, R ride road, Esc stop, , . clock" % [
		reg, mic, gi_tag, ind_tag, p.x, p.y, W.feet_y(), g, W.stream.chunks.size(),
		", ".join(PackedStringArray(W.stream.places_open.keys())),
		W.stream.rebases, int(minute / 1440.0) + 1, int(fmod(minute, 1440.0) / 60.0), int(fmod(minute, 60.0)),
		int(rate), traf_tag, Engine.get_frames_per_second(), "riding the road" if W.driving else ""]
