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

const CASES := ["hyperjungle", "rift", "girder", "iziz", "yuni", "verge", "dhelv", "sedesert", "world-sedesert", "world-iziz", "world-sedesert-falls", "world-yuni", "qiblai"]   # keys 1-9; world-iziz, world-sedesert-falls and world-yuni by name (tools/shot.sh world-iziz)
const LEGACY_WORLDS := ["world-nhighlands", "world-nhighlands-wide", "world-rift-jungle"]   # framed as before (140 m)
const ABOUT := {
	"hyperjungle": "krator-biome JSON: one hyperjungle tile (canvas textures, foliage hook, no LOD chunks)",
	"rift": "krator-biome JSON: one rift tile (every mesh LOD-chunked; irid bark and far impostors are hooked)",
	"qiblai": "glTF + krator-lamps: a 260 m reach of Qiblai's south avenue, its poles and wires, and its street lamps (halos; the nearest become OmniLight3D): the electric light of 2026-11-16",
	"girder": "glTF from three's GLTFExporter: a 60 m region of Girder (material library textures; hooks lost)",
	"iziz": "krator-atmos JSON for the whole city + a glTF region of the city centre",
	"yuni": "KRATOR_EXPORT records: every building, door, window and light as tagged records; one interior in full",
	"verge": "krator-sim + krator-verge-place: the twin cities' buildings as stand-ins and the caravans, porters, nomads and patrols moved by the exported timetable (KratorVergeSim)",
	"dhelv": "krator-dhelv-place + krator-walk + krator-sim motion: the cave city's sites as stand-ins, its walk floors baked to a navmesh with an agent walking gate to temple, the ramblers posed by KSim (core/simulation's twin)",
	"sedesert": "krator-biome JSON with a krator-field ground: one sedesert tile round the pond, its ground the page's baked core/terrain field (terrain mesh + HeightMapShape3D)",
	"world-sedesert-falls": "krator-world (core/export): sedesert's notch, the river's last reach, the cataract and its plunge pool (core/water phases 3 and 4)",
	"world-sedesert": "krator-world (core/export, M4): the same sedesert tile through the one container: world.json (records, materials, library maps by reference, the field, the stage) beside world.glb (EXT_mesh_gpu_instancing)",
	"world-iziz": "krator-world (core/export, M5): a district of Iziz through the same container: the kit's instances with their item sets and owners, the plain meshes by material, the library and procedural maps, the sampled ground and its painted look, the buildings with their doors, windows and lamps (Records)",
	"world-yuni": "krator-world (core/export): the Foundry's box of Yuni, records only: the buildings with their doors, windows and lights, and every planned interior (the interiors section: rooms, walls with -col, door links, a navmesh per storey and yard)",
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
var case_focus := Vector3.ZERO   # the loaded case's focus (the box centre on the ground): tests/perf/perf_capture.gd poses its camera from it
var driven := false   # set by a driver before add_child (tests/perf/perf_capture.gd): _ready builds the stage and loads no case of its own


var ui: KratorHostUI = null   # the Host UI (krator/host_ui.gd) in an interactive run; null under --check, --shot, --nohud, driven
var _from_gallery := false
var _pin_node: MeshInstance3D
var _has_pin := false
var _pin_pos := Vector3.ZERO
var _case_box := [0.0, 0.0, 0.0, 0.0]


func _ready() -> void:
	_build_stage()
	var args := _args()
	if args.has("check"):
		_check_all.call_deferred()
		return
	if driven:
		return
	var pend := KratorGalleryNav.pending_entry
	var pend_case := str(pend.get("case_id", "")) if not pend.is_empty() else ""
	if not args.has("case") and not args.has("shot") and pend_case == "" and not args.has("spike"):
		# A bare launch opens the Gallery (--spike keeps the old start on hyperjungle)
		if FileAccess.file_exists("res://gallery.tscn"):
			get_tree().change_scene_to_file.call_deferred("res://gallery.tscn")
			return
	if args.has("shot"):
		_shot = args["shot"]
	if _shot == "" and not args.has("nohud"):
		_mount_ui()
	_from_gallery = pend_case != ""
	_load_case(pend_case if pend_case != "" else str(args.get("case", "hyperjungle")))


func _args() -> Dictionary:
	var a := {}
	for s in OS.get_cmdline_user_args():
		var kv := s.trim_prefix("--").split("=", true, 1)
		a[kv[0]] = kv[1] if kv.size() > 1 else true
	return a


# Every case this checkout can load: the spike's own list, then any res://data/<dir> with world.json, biome.json or
# region.glb, then the Oidong place boxes.
static func all_cases() -> Array:
	var out: Array = []
	var seen := {}
	for c in CASES:
		if DirAccess.dir_exists_absolute("res://data/" + c):
			out.append(c)
			seen[c] = true
	var d := DirAccess.open("res://data")
	var extra := PackedStringArray()
	if d != null:
		d.list_dir_begin()
		var nm := d.get_next()
		while nm != "":
			if d.current_is_dir() and not nm.begins_with(".") and not seen.has(nm):
				var dir := "res://data/%s/" % nm
				if FileAccess.file_exists(dir + "world.json") or FileAccess.file_exists(dir + "biome.json") or FileAccess.file_exists(dir + "region.glb"):
					extra.append(nm)
			nm = d.get_next()
		d.list_dir_end()
	extra.sort()
	out.append_array(extra)
	var pd := DirAccess.open("res://data/world-oidong-highrift/places")
	var pl := PackedStringArray()
	if pd != null:
		pd.list_dir_begin()
		var pn := pd.get_next()
		while pn != "":
			if pd.current_is_dir() and not pn.begins_with(".") and FileAccess.file_exists("res://data/world-oidong-highrift/places/%s/world.json" % pn):
				pl.append("world-oidong-highrift/places/" + pn)
			pn = pd.get_next()
		pd.list_dir_end()
	pl.sort()
	out.append_array(pl)
	return out


# Which importer a case takes: by name for the spike's own cases, else by the files in its folder
static func route_for(name: String, dir: String) -> String:
	match name:
		"world-sedesert", "world-iziz", "world-sedesert-falls", "world-yuni", "world-nhighlands", "world-nhighlands-wide", "world-rift-jungle":
			return "world"
		"hyperjungle", "rift", "sedesert":
			return "biome"
		"girder", "iziz", "qiblai":
			return "gltf"
		"verge", "dhelv", "yuni":
			return name
	if FileAccess.file_exists(dir + "world.json"):
		return "world"
	if FileAccess.file_exists(dir + "biome.json"):
		return "biome"
	if FileAccess.file_exists(dir + "region.glb"):
		return "gltf"
	return ""


# The file an importer opens first; if it is still a Git LFS pointer the case cannot load
static func _key_files(route: String, dir: String) -> PackedStringArray:
	match route:
		"world":
			return PackedStringArray([dir + "world.json", dir + "world.glb"])
		"biome":
			return PackedStringArray([dir + "biome.json"])
		"gltf":
			return PackedStringArray([dir + "region.glb"])
		"verge":
			return PackedStringArray([dir + "sim.json", dir + "place.json"])
		"yuni":
			return PackedStringArray([dir + "fixtures.json", dir + "building.json"])
	return PackedStringArray()


func _mount_ui() -> void:
	ui = KratorHostUI.new()
	ui.name = "HostUI"
	add_child(ui)
	ui.set_standalone_mode(true)
	ui.btn_inspect.visible = false
	ui.btn_poly.visible = false
	ui.btn_flora.visible = false
	ui.btn_builds.visible = false
	ui.btn_copy_xz.visible = false
	var list: Array = []
	for c in all_cases():
		list.append({"label": c, "path": c})
	ui.set_custom_cases(list, "")
	ui.gallery_requested.connect(func(): KratorGalleryNav.return_to_gallery(get_tree()))
	ui.case_selected.connect(func(p: String): _load_case(p))
	ui.poi_selected.connect(func(poi: Dictionary): cam.look_from(poi["eye"], poi["target"]))
	ui.hour_changed.connect(func(h: float): Atmos.hour = h)
	ui.clock_rate_selected.connect(func(rv: float): Atmos.hour_rate = rv / 60.0)   # sim minutes a second -> hours a second
	ui.gi_toggled.connect(func(on: bool): env.sdfgi_enabled = on)
	ui.tool_changed.connect(func(_t: String): pass)
	ui.pin_action.connect(func(act: String):
		if act == "fly" and _has_pin:
			_fly_to(_pin_pos, 60.0)
		elif act == "clear":
			_set_pin(false)
	)
	ui.minimap_picked.connect(func(xz: Vector2, _shift: bool, _rec: Dictionary):
		_fly_to(Vector3(xz.x, _ground_y(xz.x, xz.y), xz.y), -1.0)
	)
	ui.btn_copy_cam.pressed.connect(func():
		var p := cam.global_position
		var f := -cam.global_transform.basis.z
		DisplayServer.clipboard_set(JSON.stringify({"case": current, "eye": [snappedf(p.x, 0.1), snappedf(p.y, 0.1), snappedf(p.z, 0.1)],
			"look": [snappedf(p.x + f.x * 50.0, 0.1), snappedf(p.y + f.y * 50.0, 0.1), snappedf(p.z + f.z * 50.0, 0.1)]}))
		ui.flash_copied("Copied View!")
	)
	ui.hour_slider.value = Atmos.hour
	ui.clock_lbl.text = "%02d:00" % int(Atmos.hour)
	ui._select_rate_btn(0.0)
	hud.visible = false
	_pin_node = MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.6
	cyl.bottom_radius = 0.15
	cyl.height = 12.0
	var pm := StandardMaterial3D.new()
	pm.albedo_color = Color(1.0, 0.78, 0.25)
	pm.emission_enabled = true
	pm.emission = Color(1.0, 0.7, 0.2)
	pm.emission_energy_multiplier = 2.0
	pm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	cyl.material = pm
	_pin_node.mesh = cyl
	_pin_node.visible = false
	add_child(_pin_node)


func _ground_y(x: float, z: float) -> float:
	if ground:
		var h := KData.height_at(ground, x, z)
		if is_finite(h):
			return h
	return case_focus.y


# Keep the camera's heading and pitch, frame `pt` from `dist` metres (dist < 0: keep the current distance to the ground)
func _fly_to(pt: Vector3, dist: float) -> void:
	var f := -cam.global_transform.basis.z
	if f.y > -0.15:
		f = Vector3(f.x, -0.5, f.z).normalized()
	var d := dist
	if d < 0.0:
		d = clampf(cam.global_position.y - _ground_y(cam.global_position.x, cam.global_position.z), 30.0, 900.0) * 1.4
	cam.look_from(pt - f * d, pt)


func _set_pin(on: bool, p := Vector3.ZERO) -> void:
	_has_pin = on
	_pin_pos = p
	if _pin_node:
		_pin_node.visible = on
		_pin_node.position = p + Vector3(0, 6.0, 0)


# A screen point onto the case's ground: a ray marched against KData.height_at (no colliders needed)
func _ground_hit(screen_pos: Vector2) -> Variant:
	var o := cam.project_ray_origin(screen_pos)
	var dv := cam.project_ray_normal(screen_pos)
	var step := 2.0
	var t := 0.0
	var prev := o
	while t < cam.far:
		var p := o + dv * t
		if p.y <= _ground_y(p.x, p.z):
			for _i in 8:   # bisect between the last point above and this one
				var mid := (prev + p) * 0.5
				if mid.y <= _ground_y(mid.x, mid.z):
					p = mid
				else:
					prev = mid
			return Vector3(p.x, _ground_y(p.x, p.z), p.z)
		prev = p
		t += step
		step = minf(step * 1.04, 40.0)
	return null


func _views_for(focus: Vector3, span: float) -> Array:
	var v: Array = [{"label": "Overview", "eye": focus + Vector3(span * 0.6, span * 0.45, span * 0.8), "target": focus}]
	for q in [["North", Vector3(0, 0, -1)], ["East", Vector3(1, 0, 0)], ["South", Vector3(0, 0, 1)], ["West", Vector3(-1, 0, 0)]]:
		var dirv: Vector3 = q[1]
		v.append({"label": "From the %s" % q[0], "eye": focus + dirv * span * 0.9 + Vector3(0, span * 0.35, 0), "target": focus})
	v.append({"label": "Top down", "eye": focus + Vector3(0.0, span * 1.6, span * 0.08), "target": focus})
	var w := maxf(0.0, float(_case_box[2]) - float(_case_box[0]))
	if w > 0.0:
		v.append({"label": "Street level", "eye": Vector3(focus.x - span * 0.15, _ground_y(focus.x - span * 0.15, focus.z + span * 0.2) + 1.7, focus.z + span * 0.2), "target": focus + Vector3(0, 2.0, 0)})
	return v


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
	world.name = "World_" + name.replace("/", "_")
	add_child(world)
	current = name
	Atmos.reset_defaults()
	Atmos.hour = 11.0
	Atmos.hour_rate = 0.0
	var dir := "res://data/%s/" % name
	var focus := Vector3.ZERO
	var report := {}
	var terrain: Node3D = null
	_case_box = [0.0, 0.0, 0.0, 0.0]
	_set_pin(false)
	var route := route_for(name, dir)
	var lfs := PackedStringArray()
	for kf in _key_files(route, dir):
		if KratorGalleryNav.is_lfs_pointer(kf):
			lfs.append(kf)
	if not lfs.is_empty():
		report = {"route": "unpulled", "counts": {}, "gaps": {"load": "Git LFS pointer, not data: %s (git lfs pull --include=\"%s**\")" % [", ".join(lfs), dir.replace("res://", "godot/")]}}
		route = "lfs"
	var stage = KData.read_json(dir + "stage.json") if FileAccess.file_exists(dir + "stage.json") and route != "lfs" else null
	if FileAccess.file_exists(dir + "terrain.json") and route != "lfs" and not KratorGalleryNav.is_lfs_pointer(dir + "terrain.json"):
		terrain = KData.heightfield(dir + "terrain.json", stage.get("ground") if stage is Dictionary else null)
		world.add_child(terrain)
	match route:
		"world":   # core/export's krator-world (krator/world_import.gd): the M4 tile, the M5 district, Yuni's records
			var wv := KratorWorld.build(dir + "world.json")
			world.add_child(wv)
			report = wv.get_meta("report")
			var wbox: Array = wv.get_meta("krator", {}).get("box", [0, 0, 0, 0])
			_case_box = wbox.duplicate()
			focus = Vector3((wbox[0] + wbox[2]) * 0.5, 0, (wbox[1] + wbox[3]) * 0.5)
			if wv.has_meta("stage"):
				stage = wv.get_meta("stage")
			if wv.has_meta("ground"):
				if terrain:
					terrain.queue_free()
				terrain = wv.get_meta("ground")
		"biome":
			var b := KratorBiome.build(dir + "biome.json")
			world.add_child(b)
			report = b.get_meta("report")
			var box: Array = b.get_meta("krator", {}).get("box", [0, 0, 0, 0])
			_case_box = box.duplicate()
			focus = Vector3((box[0] + box[2]) * 0.5, 0, (box[1] + box[3]) * 0.5)
			if b.has_meta("stage"):
				stage = b.get_meta("stage")
			if b.has_meta("ground"):   # the export's own ground (since 2026-10-05) replaces the sampled terrain.json
				if terrain:
					terrain.queue_free()
				terrain = b.get_meta("ground")
		"gltf":
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
			_case_box = box.duplicate()
			focus = Vector3((box[0] + box[2]) * 0.5, 0, (box[1] + box[3]) * 0.5)
			if FileAccess.file_exists(dir + "lamps.json"):   # the page's flames and halos as data (krator/lamps_import.gd)
				var lp := KratorLamps.build(dir + "lamps.json", focus, name == "qiblai")   # Qiblai: the pool that follows the eye (krator/lamp_pool.gd)
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
	case_focus = focus
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
	var bw := maxf(absf(float(_case_box[2]) - float(_case_box[0])), absf(float(_case_box[3]) - float(_case_box[1])))
	if not (name in CASES or name in LEGACY_WORLDS) and bw > 1.0:   # a case found by folder: frame its box
		span = clampf(bw * 0.75, 60.0, 2500.0)
		cam.far = maxf(8000.0, span * 6.0)
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
	if ui:
		_refresh_ui_case(name, dir, focus, span, report)
	return report


func _refresh_ui_case(name: String, dir: String, focus: Vector3, span: float, report: Dictionary) -> void:
	ui.set_custom_cases(ui.cases, name)
	ui.set_custom_pois(_views_for(focus, span))
	ui.minimap.populate_from_case(name, dir, world, ground)
	ui.minimap_title.text = "MAP — %s" % name.get_file().to_upper()
	ui.minimap.set_viewer(Vector2(focus.x, focus.z), Vector2(0, -1))
	var gaps: Dictionary = report.get("gaps", {})
	if gaps.has("load"):
		ui.set_detail_text("CASE DID NOT LOAD", str(gaps["load"]))
		ui.detail_panel.visible = true
	else:
		ui.detail_panel.visible = false


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
	if ui:
		_update_ui()


func _update_ui() -> void:
	ui.sync_standalone_state(current.get_file(), Atmos.hour, Atmos.hour_rate * 60.0, env.sdfgi_enabled, _has_pin)
	if ui.chrome_visible:
		var p := cam.global_position
		var r: Dictionary = reports.get(current, {})
		var extra := "Case:   %s  [%s]\n        %s\nImport: %s\nGaps:   %d%s" % [current, str(r.get("route", "?")), ABOUT.get(current, "core/export krator-world"),
			JSON.stringify(r.get("counts", {})).left(150), r.get("gaps", {}).size(),
			("  (F4 prints them)" if r.get("gaps", {}).size() > 0 else "")]
		extra += "\nWeather: %s  rain %.2f  fog %.2f" % [Atmos.W["mode"] if Atmos.weather_on else "off", Atmos.rain, Atmos.fog]
		ui.coords_lbl.text = KratorHostUI.format_standalone_coords(cam, _ground_y(p.x, p.z), _pin_pos if _has_pin else null, extra)
		if ui.minimap_open:
			var f := -cam.global_transform.basis.z
			ui.minimap.set_viewer(Vector2(p.x, p.z), Vector2(f.x, f.z))
			ui.minimap.set_pin(_has_pin, Vector2(_pin_pos.x, _pin_pos.z))


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
	if ui and e is InputEventMouseButton and e.pressed and (e as InputEventMouseButton).button_index == MOUSE_BUTTON_LEFT \
			and ((e as InputEventMouseButton).double_click or ui.active_tool == "pin"):
		var hit = _ground_hit((e as InputEventMouseButton).position)
		if hit is Vector3:
			_set_pin(true, hit)
		return
	if not (e is InputEventKey and e.pressed and not e.echo):
		return
	var k := (e as InputEventKey).keycode
	if k >= KEY_1 and k <= KEY_9 and k - KEY_1 < CASES.size():
		_load_case(CASES[k - KEY_1])
	elif k == KEY_F1 or (ui and k == KEY_H):
		if ui:
			ui.set_chrome_visible(not ui.chrome_visible)
		else:
			help_on = not help_on
	elif k == KEY_F2:
		if ui:   # the Host UI's F2: back to the Gallery (F4 prints the report)
			KratorGalleryNav.return_to_gallery(get_tree())
		else:
			_print_report(current, reports.get(current, {}))
	elif k == KEY_F4:
		_print_report(current, reports.get(current, {}))
	elif ui and k == KEY_M:
		ui.toggle_minimap()
	elif ui and k == KEY_C:
		ui.set_active_tool("" if ui.active_tool == "pin" else "pin")
	elif ui and k == KEY_G and _has_pin:
		_fly_to(_pin_pos, 60.0)
	elif ui and k == KEY_ESCAPE:
		if ui.active_tool != "":
			ui.set_active_tool("")
		elif _has_pin:
			_set_pin(false)
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
