# M8 "walk the road" (GODOT-PLAN.md): the one world, playable. The oidong-highrift case (godot/data/world-oidong-highrift)
# streamed round a walker (krator/world_walk.gd), on the case's ground and buildings with collision.
#
#   godot --path godot res://walk.tscn                       start at Longsong, on the Sultanate's road
#   godot --path godot res://walk.tscn -- --at=strongbow     start on Strongbow's plateau, behind its lip
#   godot --path godot res://walk.tscn -- --at=x,z           start at a point in the region's metres
#
# Keys: WASD or the arrows walk, Shift runs (x5), Q / E or a right drag turn, R rides the road from the nearest point
# (40 m/s, toward Strongbow; R again stops), Esc stops riding. The panel says where you are, what the stream holds and
# the frame rate.
extends Node3D

const CASE := "res://data/world-oidong-highrift/index.json"
var W: KratorWorldWalk
var hud: Label
var _drag := false


func _ready() -> void:
	var env := WorldEnvironment.new()
	var e := Environment.new()
	var sky := Sky.new()
	var sm := ProceduralSkyMaterial.new()
	sky.sky_material = sm
	e.background_mode = Environment.BG_SKY
	e.sky = sky
	e.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	e.fog_enabled = true
	e.fog_density = 0.00002
	env.environment = e
	add_child(env)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-50, 30, 0)
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 600.0
	add_child(sun)
	W = KratorWorldWalk.make(CASE)
	W.interactive = true
	add_child(W)
	W.cam.current = true
	var at := _start()
	W.start_at(at.x, at.y)
	hud = Label.new()
	hud.position = Vector2(12, 10)
	var cl := CanvasLayer.new()
	cl.add_child(hud)
	add_child(cl)


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
				return Vector2(p["pin"][0], p["pin"][1])
			var xz := v.split(",")
			if xz.size() == 2:
				return Vector2(float(xz[0]), float(xz[1]))
	var r := _road()
	return Vector2(r[0][0], r[0][1]) if r.size() > 0 else Vector2.ZERO


# the Sultanate's road (the index's route link), Longsong first, as [[x, z], ...]
func _road() -> Array:
	var R := W.stream.road(str(W.stream.index["route"]["link"]))
	var pts := []
	for p in R.get("pts", []):
		pts.append([float(p[0]), float(p[1])])
	if R.get("from") != W.stream.index["route"]["from"]:
		pts.reverse()
	return pts


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
				var pts := _road()
				var here := W.region_xz()
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


func _process(dt: float) -> void:
	if Input.is_key_pressed(KEY_Q):
		W.turn(1.5 * dt)
	if Input.is_key_pressed(KEY_E):
		W.turn(-1.5 * dt)
	if not W.driving:
		W.speed = 6.0
	var p := W.region_xz()
	var g := W.stream.height_at(p.x, p.y)
	hud.text = "x %.0f  z %.0f  feet %.1f m (ground %.1f)\nchunks %d  places %s  rebases %d\n%d fps  %s\nWASD walk, Shift run, Q/E or right drag turn, R ride the road, Esc stop" % [
		p.x, p.y, W.feet_y(), g, W.stream.chunks.size(), ", ".join(PackedStringArray(W.stream.places_open.keys())),
		W.stream.rebases, Engine.get_frames_per_second(), "riding the road" if W.driving else ""]
