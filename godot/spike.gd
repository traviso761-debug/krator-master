# The spike's one scene (GODOT-PLAN.md Phase 7): load one export case at a time and show what came through.
#
#   godot --path godot                          the window; keys 1-5 switch case, F1 help
#   godot --path godot -- --case=rift           start on a case
#   godot --headless --path godot -- --check    load every case, print the reports, write spike-report.json, quit
#   godot --path godot -- --case=girder --shot=shots/girder.png   render, save a screenshot, quit
#     (--eye=x,y,z --at=x,y,z place the camera relative to the case's focus; --hour=h sets the clock)
#
# Each case's report (counts and the gaps the importer met) is printed and shown on screen: that list is what
# GODOT-PLAN.md asks the spike for. README.md and CHECKLIST.md say what to look at.
extends Node3D

const CASES := ["hyperjungle", "rift", "girder", "iziz", "yuni"]
const ABOUT := {
	"hyperjungle": "krator-biome JSON: one hyperjungle tile (canvas textures, foliage hook, no LOD chunks)",
	"rift": "krator-biome JSON: one rift tile (every mesh LOD-chunked; irid bark and far impostors are hooked)",
	"girder": "glTF from three's GLTFExporter: a 60 m region of Girder (material library textures; hooks lost)",
	"iziz": "krator-atmos JSON for the whole city + a glTF region of the city centre",
	"yuni": "KRATOR_EXPORT records: every building, door, window and light as tagged records; one interior in full",
}

var current := ""
var world: Node3D
var cam: Camera3D
var sun: DirectionalLight3D
var env: Environment
var hud: Label
var help_on := true
var reports := {}
var _shot := ""
var _shot_frames := 0


func _ready() -> void:
	_build_stage()
	var args := _args()
	if args.has("check"):
		_check_all.call_deferred()
		return
	if args.has("shot"):
		_shot = args["shot"]
	_load_case(args.get("case", "hyperjungle"))


func _args() -> Dictionary:
	var a := {}
	for s in OS.get_cmdline_user_args():
		var kv := s.trim_prefix("--").split("=", true, 1)
		a[kv[0]] = kv[1] if kv.size() > 1 else true
	return a


func _build_stage() -> void:
	var we := WorldEnvironment.new()
	env = Environment.new()
	var sky := Sky.new()
	var psm := ProceduralSkyMaterial.new()
	psm.sky_top_color = Color(0.32, 0.5, 0.78)
	psm.sky_horizon_color = Color(0.72, 0.76, 0.8)
	psm.ground_horizon_color = Color(0.5, 0.48, 0.44)
	sky.sky_material = psm
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.8
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.fog_enabled = true
	env.fog_density = 0.0012
	env.fog_light_color = Color(0.7, 0.72, 0.74)
	env.glow_enabled = true
	we.environment = env
	add_child(we)
	sun = DirectionalLight3D.new()
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 400.0
	add_child(sun)
	_aim_sun()
	cam = Camera3D.new()
	cam.set_script(load("res://krator/fly_camera.gd"))
	cam.far = 8000.0
	add_child(cam)
	var layer := CanvasLayer.new()
	hud = Label.new()
	hud.position = Vector2(12, 10)
	hud.add_theme_color_override("font_color", Color(1, 1, 1))
	hud.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	hud.add_theme_constant_override("outline_size", 4)
	hud.add_theme_font_size_override("font_size", 14)
	layer.add_child(hud)
	add_child(layer)


func _aim_sun() -> void:
	var d: Vector3 = Atmos.sun_dir.normalized()
	sun.look_at_from_position(Vector3.ZERO, -d, Vector3.UP if abs(d.y) < 0.99 else Vector3.FORWARD)


func _load_case(name: String) -> Dictionary:
	if world:
		world.queue_free()
	world = Node3D.new()
	world.name = "World_" + name
	add_child(world)
	current = name
	Atmos.reset_defaults()
	Atmos.hour = 11.0
	Atmos.hour_rate = 0.0
	var dir := "res://data/%s/" % name
	var focus := Vector3.ZERO
	var report := {}
	var terrain: Node3D = null
	if FileAccess.file_exists(dir + "terrain.json"):
		terrain = KData.heightfield(dir + "terrain.json")
		world.add_child(terrain)
	match name:
		"hyperjungle", "rift":
			var b := KratorBiome.build(dir + "biome.json")
			world.add_child(b)
			report = b.get_meta("report")
			var box: Array = b.get_meta("krator", {}).get("box", [0, 0, 0, 0])
			focus = Vector3((box[0] + box[2]) * 0.5, 0, (box[1] + box[3]) * 0.5)
		"girder", "iziz":
			if terrain:
				terrain.position.y = -0.25   # the region carries its own ground: keep the sampled one just under it
			if name == "iziz" and FileAccess.file_exists(dir + "atmos.json"):
				var a := KratorAtmos.build(dir + "atmos.json")
				world.add_child(a)
				reports["iziz-atmos"] = a.get_meta("report")
				_print_report("iziz-atmos", reports["iziz-atmos"])
				Atmos.hour = 19.5   # the evening, so the lamps and halos show
			var g := KratorGltf.build(dir + "region.glb")
			world.add_child(g)
			report = g.get_meta("report")
			var box: Array = g.get_meta("krator", {}).get("box", [0, 0, 0, 0])
			focus = Vector3((box[0] + box[2]) * 0.5, 0, (box[1] + box[3]) * 0.5)
		"yuni":
			var r := KratorRecords.build(dir + "fixtures.json", dir + "building.json")
			world.add_child(r)
			report = r.get_meta("report")
			focus = r.get_meta("focus", Vector3.ZERO)
	if terrain:
		focus.y = KData.height_at(terrain, focus.x, focus.z)
	var span := 60.0 if name in ["girder", "yuni"] else 140.0
	cam.look_from(focus + Vector3(span * 0.6, span * 0.45, span * 0.8), focus)
	cam.set("speed", span * 0.25)
	var args := _args()
	if args.has("eye") and args.has("at"):   # --eye=x,y,z --at=x,y,z (relative to the case's focus)
		var e: PackedFloat64Array = str(args["eye"]).split_floats(",")
		var a: PackedFloat64Array = str(args["at"]).split_floats(",")
		cam.look_from(focus + Vector3(e[0], e[1], e[2]), focus + Vector3(a[0], a[1], a[2]))
	if args.has("hour"):
		Atmos.hour = float(args["hour"])
	reports[name] = report
	_print_report(name, report)
	_update_hud()
	return report


func _print_report(name: String, r: Dictionary) -> void:
	print("=== %s: %s" % [name, r.get("route", "?")])
	print("  counts: ", JSON.stringify(r.get("counts", {})))
	if r.has("counts_interior"):
		print("  interior: ", JSON.stringify(r["counts_interior"]))
	for k in r.get("gaps", {}):
		print("  gap [%s] %s" % [k, r["gaps"][k]])


func _check_all() -> void:
	var ok := true
	var only = _args().get("case", "")
	for c in CASES:
		if only != "" and c != only:
			continue
		if not DirAccess.dir_exists_absolute("res://data/" + c):
			print("=== %s: no data (run godot/tools/export_spike.py %s)" % [c, c])
			ok = false
			continue
		var r := _load_case(c)
		if r.get("gaps", {}).has("load") or r.get("gaps", {}).has("format"):
			ok = false
		await get_tree().process_frame
	var f := FileAccess.open("res://spike-report.json", FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(reports, "  "))
		f.close()
	print("wrote spike-report.json")
	get_tree().quit(0 if ok else 1)


func _process(_d: float) -> void:
	var n: float = Atmos.night(Atmos.hour)
	sun.light_energy = lerpf(1.6, 0.04, n)
	env.ambient_light_energy = lerpf(0.8, 0.12, n)
	env.background_energy_multiplier = lerpf(1.0, 0.08, n)
	env.fog_light_color = Color(0.7, 0.72, 0.74).lerp(Color(0.05, 0.06, 0.09), n)
	if _shot != "":
		_shot_frames += 1
		if _shot_frames == 30:
			var img := get_viewport().get_texture().get_image()
			DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://" + _shot.get_base_dir()))
			img.save_png("res://" + _shot)
			print("saved ", _shot)
			get_tree().quit()
	if Engine.get_frames_drawn() % 15 == 0:
		_update_hud()


func _update_hud() -> void:
	if not hud:
		return
	var s := "%s: %s\nhour %.1f  wind %s  fps %d" % [current, ABOUT.get(current, ""), Atmos.hour, str(Atmos.wind_now().snapped(Vector2(0.01, 0.01))), Engine.get_frames_per_second()]
	if help_on:
		s += "\n1-5 case (%s)   RMB+mouse look   WASD QE move   Shift fast   wheel speed\n[ ] hour   T time-lapse   P pause clock   F1 hide help   F2 print report" % " ".join(CASES)
	hud.text = s


func _unhandled_input(e: InputEvent) -> void:
	if not (e is InputEventKey and e.pressed and not e.echo):
		return
	var k := (e as InputEventKey).keycode
	if k >= KEY_1 and k <= KEY_5:
		_load_case(CASES[k - KEY_1])
	elif k == KEY_F1:
		help_on = not help_on
	elif k == KEY_F2:
		_print_report(current, reports.get(current, {}))
	elif k == KEY_BRACKETLEFT:
		Atmos.hour = fmod(Atmos.hour + 23.0, 24.0)
	elif k == KEY_BRACKETRIGHT:
		Atmos.hour = fmod(Atmos.hour + 1.0, 24.0)
	elif k == KEY_T:
		Atmos.hour_rate = 0.0 if Atmos.hour_rate > 0.0 else 1.0
	elif k == KEY_P:
		Atmos.paused = not Atmos.paused
	_update_hud()
