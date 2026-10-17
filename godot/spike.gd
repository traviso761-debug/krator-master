# The spike's one scene (GODOT-PLAN.md Phase 7): load one export case at a time and show what came through.
#
#   godot --path godot                          the window; keys 1-9 switch case, F1 help
#   godot --path godot -- --case=rift           start on a case
#   godot --headless --path godot -- --check    load every case, print the reports, write spike-report.json, quit
#   godot --path godot -- --case=girder --shot=shots/girder.png   render, save a screenshot, quit
#     (--eye=x,y,z --at=x,y,z place the camera relative to the case's focus; --hour=h sets the clock; --clock=T pins the module clock, atm_time)
#
# Each case's report (counts and the gaps the importer met) is printed and shown on screen: that list is what
# GODOT-PLAN.md asks the spike for. README.md and CHECKLIST.md say what to look at.
extends Node3D

const CASES := ["hyperjungle", "rift", "girder", "iziz", "yuni", "verge", "dhelv", "sedesert", "world-sedesert", "world-iziz", "world-sedesert-falls"]   # keys 1-9; world-iziz and world-sedesert-falls by name (tools/shot.sh world-iziz)
const ABOUT := {
	"hyperjungle": "krator-biome JSON: one hyperjungle tile (canvas textures, foliage hook, no LOD chunks)",
	"rift": "krator-biome JSON: one rift tile (every mesh LOD-chunked; irid bark and far impostors are hooked)",
	"girder": "glTF from three's GLTFExporter: a 60 m region of Girder (material library textures; hooks lost)",
	"iziz": "krator-atmos JSON for the whole city + a glTF region of the city centre",
	"yuni": "KRATOR_EXPORT records: every building, door, window and light as tagged records; one interior in full",
	"verge": "krator-sim + krator-verge-place: the twin cities' buildings as stand-ins and the caravans, porters, nomads and patrols moved by the exported timetable (KratorVergeSim)",
	"dhelv": "krator-dhelv-place + krator-walk + krator-sim motion: the cave city's sites as stand-ins, its walk floors baked to a navmesh with an agent walking gate to temple, the ramblers posed by KSim (core/simulation's twin)",
	"sedesert": "krator-biome JSON with a krator-field ground: one sedesert tile round the pond, its ground the page's baked core/terrain field (terrain mesh + HeightMapShape3D)",
	"world-sedesert-falls": "krator-world (core/export): sedesert's notch, the river's last reach, the cataract and its plunge pool (core/water phases 3 and 4)",
	"world-sedesert": "krator-world (core/export, M4): the same sedesert tile through the one container: world.json (records, materials, library maps by reference, the field, the stage) beside world.glb (EXT_mesh_gpu_instancing)",
	"world-iziz": "krator-world (core/export, M5): a district of Iziz through the same container: the kit's instances with their item sets and owners, the plain meshes by material, the library and procedural maps, the sampled ground and its painted look, the buildings with their doors, windows and lamps (Records)",
}

var current := ""
var ground: Node3D   # the case's ground (a field, an export's sampled ground or terrain.json), for --check's collision rays
var world: Node3D
var cam: Camera3D
var sun: DirectionalLight3D
var env: Environment
var hud: Label
var help_on := true
var reports := {}
var _shot := ""
var _stage_base := {}   # the stage's sun, ambient and fog, which the clock and the weather scale
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
	var wfx := Node3D.new()
	wfx.set_script(load("res://krator/weather_fx.gd"))
	wfx.set("cam", cam)
	wfx.name = "Weather"
	add_child(wfx)
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
	var stage = KData.read_json(dir + "stage.json") if FileAccess.file_exists(dir + "stage.json") else null
	if FileAccess.file_exists(dir + "terrain.json"):
		terrain = KData.heightfield(dir + "terrain.json", stage.get("ground") if stage is Dictionary else null)
		world.add_child(terrain)
	match name:
		"world-sedesert", "world-iziz", "world-sedesert-falls":   # core/export's krator-world (krator/world_import.gd): the M4 tile, the M5 district
			var wv := KratorWorld.build(dir + "world.json")
			world.add_child(wv)
			report = wv.get_meta("report")
			var wbox: Array = wv.get_meta("krator", {}).get("box", [0, 0, 0, 0])
			focus = Vector3((wbox[0] + wbox[2]) * 0.5, 0, (wbox[1] + wbox[3]) * 0.5)
			if wv.has_meta("stage"):
				stage = wv.get_meta("stage")
			if wv.has_meta("ground"):
				if terrain:
					terrain.queue_free()
				terrain = wv.get_meta("ground")
		"hyperjungle", "rift", "sedesert":
			var b := KratorBiome.build(dir + "biome.json")
			world.add_child(b)
			report = b.get_meta("report")
			var box: Array = b.get_meta("krator", {}).get("box", [0, 0, 0, 0])
			focus = Vector3((box[0] + box[2]) * 0.5, 0, (box[1] + box[3]) * 0.5)
			if b.has_meta("stage"):
				stage = b.get_meta("stage")
			if b.has_meta("ground"):   # the export's own ground (since 2026-10-05) replaces the sampled terrain.json
				if terrain:
					terrain.queue_free()
				terrain = b.get_meta("ground")
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
			if FileAccess.file_exists(dir + "lamps.json"):   # the page's flames and halos as data (krator/lamps_import.gd)
				var lp := KratorLamps.build(dir + "lamps.json", focus)
				world.add_child(lp)
				reports[name + "-lamps"] = lp.get_meta("report")
				_print_report(name + "-lamps", reports[name + "-lamps"])
		"verge":
			var v := KratorVergeSim.build(dir + "sim.json", dir + "place.json")
			world.add_child(v)
			report = v.get_meta("report")
			focus = v.get_meta("focus", Vector3.ZERO)
		"dhelv":
			var dv := KratorDhelv.build(dir)
			world.add_child(dv)
			report = dv.get_meta("report")
			focus = dv.get_meta("focus", Vector3.ZERO)
			if terrain:   # the city is underground: the land over it drawn faint
				for m in ([terrain] if terrain is MeshInstance3D else []) + terrain.find_children("*", "MeshInstance3D", true, false):
					var tm := StandardMaterial3D.new()
					tm.albedo_color = Color(0.45, 0.42, 0.38, 0.18)
					tm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
					m.material_override = tm
		"yuni":
			var r := KratorRecords.build(dir + "fixtures.json", dir + "building.json")
			world.add_child(r)
			report = r.get_meta("report")
			focus = r.get_meta("focus", Vector3.ZERO)
	ground = terrain
	if terrain:
		focus.y = KData.height_at(terrain, focus.x, focus.z)
	_stage_base = {}
	if stage is Dictionary and not _args().has("nostage"):   # --nostage: the spike's own stock light, to compare   # the page's light, fog, tonemapping and sky (krator/stage.gd)
		_stage_base = load("res://krator/stage.gd").apply(stage, env, sun, world)
		report["stage"] = _stage_base.get("report", {})
	else:
		_default_stage()
	# FogVolumes (Iziz's fog banks) draw only with the environment's volumetric fog on; its own density stays 0, so only
	# the volumes show (Forward+ only: the Compatibility renderer ignores both)
	env.volumetric_fog_enabled = not world.find_children("*", "FogVolume", true, false).is_empty()
	env.volumetric_fog_density = 0.0
	var span := 60.0 if name in ["girder", "yuni"] else 900.0 if name == "verge" else 160.0 if name == "dhelv" else 140.0
	cam.look_from(focus + Vector3(span * 0.6, span * 0.45, span * 0.8), focus)
	cam.set("speed", span * 0.25)
	var args := _args()
	if args.has("eye") and args.has("at"):   # --eye=x,y,z --at=x,y,z (relative to the case's focus)
		var e: PackedFloat64Array = str(args["eye"]).split_floats(",")
		var a: PackedFloat64Array = str(args["at"]).split_floats(",")
		cam.look_from(focus + Vector3(e[0], e[1], e[2]), focus + Vector3(a[0], a[1], a[2]))
	if args.has("eyew") and args.has("atw"):   # --eyew=x,y,z --atw=x,y,z: world coordinates (godot/tools/compare_shots.py)
		var ew: PackedFloat64Array = str(args["eyew"]).split_floats(",")
		var aw: PackedFloat64Array = str(args["atw"]).split_floats(",")
		cam.look_from(Vector3(ew[0], ew[1], ew[2]), Vector3(aw[0], aw[1], aw[2]))
	if args.has("fov"):
		cam.fov = float(args["fov"])
	if args.has("nohud"):
		hud.visible = false
	if args.has("hour"):
		Atmos.hour = float(args["hour"])
	if args.has("clock"):   # --clock=T: the module clock (atm_time: sway, fauna paths, waves) pinned at T seconds, to match a page's
		Atmos.t = float(args["clock"])
		Atmos.paused = true
	if args.has("weather"):   # --weather=rain|storm|fog|clear|auto
		Atmos.set_weather(str(args["weather"]))
		Atmos.W["rain"] = 1.0 if args["weather"] in ["rain", "storm"] else 0.0   # start at full strength, for a screenshot
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


# The drawn nodes (MeshInstance3D, MultiMeshInstance3D) under n0 and how many name a core/tags record: a node by its meta
# krator_record, krator_uid or a non-empty krator_records (a bucket's merged volumes), or the yuni case's "krator" record;
# a MultiMesh's instances by its side table (krator_records uids, or the yuni case's "records")
func _count_ids(n0: Node) -> Dictionary:
	var c := {"nodes": 0, "nodes_with_id": 0, "multimeshes": 0, "instances": 0, "instances_with_id": 0}
	var stack: Array[Node] = [n0]
	while stack.size() > 0:
		var n: Node = stack.pop_back()
		for ch in n.get_children():
			stack.append(ch)
		if n is MultiMeshInstance3D and (n as MultiMeshInstance3D).multimesh:
			var k: int = (n as MultiMeshInstance3D).multimesh.instance_count
			c["nodes"] += 1
			c["multimeshes"] += 1
			c["instances"] += k
			var side = n.get_meta("krator_records") if n.has_meta("krator_records") else (n.get_meta("records") if n.has_meta("records") else [])
			var named := 0
			if side != null:
				for u in side:
					if (u is String and u != "") or (u is Dictionary and (u as Dictionary).has("id")):
						named += 1
			c["instances_with_id"] += mini(named, k)
			if n.has_meta("krator_record") or named > 0:
				c["nodes_with_id"] += 1
		elif n is MeshInstance3D:
			c["nodes"] += 1
			var rec = n.get_meta("krator") if n.has_meta("krator") else null
			var side = n.get_meta("krator_records", PackedStringArray())
			if n.has_meta("krator_record") or n.has_meta("krator_uid") or side.size() > 0 or (rec is Dictionary and (rec as Dictionary).has("id")):
				c["nodes_with_id"] += 1
	return c


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
		r["id_coverage"] = _count_ids(world)   # how many drawn nodes and instances name their core/tags record
		print("  ids: ", JSON.stringify(r["id_coverage"]))
		if ground and ground.has_meta("field"):   # a krator-field: rays onto its HeightMapShape3D against KField.h
			await get_tree().physics_frame
			await get_tree().physics_frame
			var col := KratorField.check_collision(ground)
			r["collision"] = col
			print("  collision: ", JSON.stringify(col))
			if col["grid_points"] == 0 or col["missed"] > 0 or col["grid_max"] > 0.01:
				ok = false
	var f := FileAccess.open("res://spike-report.json", FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(reports, "  "))
		f.close()
	print("wrote spike-report.json")
	get_tree().quit(0 if ok else 1)


func _process(_d: float) -> void:
	var n: float = Atmos.night(Atmos.hour)
	var B := _stage_base if not _stage_base.is_empty() else {"sun": 1.6, "ambient": 0.8, "fog_density": 0.0012, "fog_colour": Color(0.7, 0.72, 0.74)}
	sun.light_energy = float(B["sun"]) * lerpf(1.0, 0.025, n) * (1.0 - 0.5 * Atmos.rain) + 4.0 * Atmos.flash   # a strike lights the scene
	env.fog_density = float(B["fog_density"]) * (1.0 + 3.0 * Atmos.fog)
	env.ambient_light_energy = float(B["ambient"]) * lerpf(1.0, 0.15, n)
	env.background_energy_multiplier = lerpf(1.0, 0.08, n)
	env.fog_light_color = (B["fog_colour"] as Color).lerp(Color(0.05, 0.06, 0.09), n)
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
	var s := "%s: %s\nhour %.1f  wind %s  weather %s (rain %.2f fog %.2f)  fps %d" % [current, ABOUT.get(current, ""), Atmos.hour, str(Atmos.wind_now().snapped(Vector2(0.01, 0.01))),
		Atmos.W["mode"] if Atmos.weather_on else "off", Atmos.rain, Atmos.fog, Engine.get_frames_per_second()]
	if help_on:
		s += "
1-9 case (%s)   drag look   MMB orbit   arrows turn   WASD QE move   Shift fast   wheel zoom   Ctrl+wheel speed   +/- lens
[ ] hour   T time-lapse   P pause clock   F3 weather   F1 hide help   F2 print report" % " ".join(CASES)
	hud.text = s


func _unhandled_input(e: InputEvent) -> void:
	if not (e is InputEventKey and e.pressed and not e.echo):
		return
	var k := (e as InputEventKey).keycode
	if k >= KEY_1 and k <= KEY_9 and k - KEY_1 < CASES.size():
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
	elif k == KEY_F3:   # F3: the next weather mode (Shift+W also moved the camera)
		var i := Atmos.MODES.find(Atmos.W["mode"]) if Atmos.weather_on else -1
		Atmos.set_weather(Atmos.MODES[(i + 1) % Atmos.MODES.size()])
	_update_hud()


# the spike's own stage when an export carries none (Yuni's records): a stock sky, Filmic, a fixed sun
func _default_stage() -> void:
	var psm := ProceduralSkyMaterial.new()
	psm.sky_top_color = Color(0.32, 0.5, 0.78)
	psm.sky_horizon_color = Color(0.72, 0.76, 0.8)
	psm.ground_horizon_color = Color(0.5, 0.48, 0.44)
	env.sky.sky_material = psm
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.tonemap_exposure = 1.0
	env.fog_enabled = true
	env.fog_mode = Environment.FOG_MODE_EXPONENTIAL
	_aim_sun()
	sun.light_color = Color.WHITE
