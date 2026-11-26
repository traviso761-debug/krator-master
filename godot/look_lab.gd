# THE LOOK LAB (GODOT-LOOK-PLAN.md section 11.2, N5): swatches of a case's heaviest library surfaces under the light rig,
# where the weathering stack's amounts are tuned against reference and Gate 7's swatches are shot. Each swatch is a
# wall, a ledge, a pitched slab and a ball of one material record, tiled at the record's own scale, with its class
# (krator/kweather.gd) and amounts beside it.
#   godot --path godot res://look_lab.tscn -- --case=res://data/world-oidong-highrift/places/sq80bzd7ep/world.json --look=high
#   ... -- --shot=/abs/path.png            one frame, then quit; an A/B is two runs (add --no-weather, --no-detail, --no-tangents)
#   ... -- --only=plaster,stone --top=4    the records whose family holds one of the words; the heaviest N (12)
#   ... -- --hour=16.3 --wet=0.6           the hour; how wet the world is
# Every switch of krator/look.gd works here (--look=low|high|photo|legacy and the rest).
# Keys: T tier, H / J the hour back and on, W weathering, D detail, N the mesh's tangents, R wet, V the debug views
# (unshaded, lighting, overdraw, wireframe, normals, SSAO, the shadow splits), arrows and PageUp / PageDown to move, Esc.
extends Node3D

const KratorSky := preload("res://krator/sky.gd")
const DEBUG_VIEWS := [Viewport.DEBUG_DRAW_DISABLED, Viewport.DEBUG_DRAW_UNSHADED, Viewport.DEBUG_DRAW_LIGHTING, Viewport.DEBUG_DRAW_OVERDRAW,
	Viewport.DEBUG_DRAW_WIREFRAME, Viewport.DEBUG_DRAW_NORMAL_BUFFER, Viewport.DEBUG_DRAW_SSAO, Viewport.DEBUG_DRAW_PSSM_SPLITS]
const DEBUG_NAMES := ["lit", "unshaded", "lighting", "overdraw", "wireframe", "normals", "SSAO", "shadow splits"]
const COLS := 4
const PITCH := Vector2(5.2, 6.4)

var look: Dictionary
var sky: Node3D
var cam: Camera3D
var hud: Label
var hour := 16.33
var shot := ""
var swatches: Array = []      # [{id, lib, cls, tris}]
var bench: Node3D             # the swatches and the eye, turned so the sun rakes the walls at the first hour
var _debug := 0
var _shot_frames := 0


func _ready() -> void:
	var args := OS.get_cmdline_user_args()
	var case_path := "res://data/world-oidong-highrift/places/sq80bzd7ep/world.json"
	var top := 12
	var only := ""
	for a in args:
		if a.begins_with("--case="):
			case_path = a.trim_prefix("--case=")
		elif a.begins_with("--hour="):
			hour = float(a.trim_prefix("--hour="))
		elif a.begins_with("--shot="):
			shot = a.trim_prefix("--shot=")
		elif a.begins_with("--top="):
			top = maxi(1, int(a.trim_prefix("--top=")))
		elif a.begins_with("--only="):
			only = a.trim_prefix("--only=").to_lower()
	look = KratorLook.from_args(args)

	sky = KratorSky.new()
	sky.name = "KratorSky"
	sky.site_px = Vector2(1306.0, 1634.0)
	sky.day = 75.0
	add_child(sky)
	sky.set_process(false)
	sky.sun.light_cull_mask = 1
	bench = Node3D.new()
	bench.name = "Bench"
	add_child(bench)
	cam = Camera3D.new()
	cam.fov = 50.0
	cam.far = 4000.0
	bench.add_child(cam)
	cam.current = true
	var layer := CanvasLayer.new()
	add_child(layer)
	hud = Label.new()
	hud.position = Vector2(12, 8)
	hud.add_theme_font_size_override("font_size", 14)
	layer.add_child(hud)
	hud.visible = shot == ""
	if shot == "":   # back to the Godot Gallery (F2), top right, out of the readout's way
		var bg := KratorHostUI._make_btn("<< Gallery (F2)", "Back to the Krator Worlds Gallery (F2)")
		bg.add_theme_color_override("font_color", Color(1.0, 0.88, 0.56))
		bg.set_anchors_preset(Control.PRESET_TOP_RIGHT)
		bg.grow_horizontal = Control.GROW_DIRECTION_BEGIN
		bg.position = Vector2(-12, 10)
		bg.pressed.connect(func(): KratorGalleryNav.return_to_gallery(get_tree()))
		layer.add_child(bg)

	var floor_mi := MeshInstance3D.new()
	var pm := PlaneMesh.new()
	pm.size = Vector2(400.0, 400.0)
	floor_mi.mesh = pm
	var fm := StandardMaterial3D.new()
	fm.albedo_color = Color(0.22, 0.21, 0.19)
	fm.roughness = 0.95
	floor_mi.material_override = fm
	add_child(floor_mi)

	_swatches(case_path, top, only)
	_frame()
	_apply()
	# the walls face +z: turn the bench so the sun comes from the eye's side, 40 degrees off the walls' normal
	var to_sun: Vector3 = sky.sun.global_transform.basis.z
	if Vector2(to_sun.x, to_sun.z).length() > 0.05:
		bench.rotation.y = atan2(to_sun.x, to_sun.z) - deg_to_rad(40.0)


# the case's library materials, heaviest first (triangles drawn), as swatches
func _swatches(case_path: String, top: int, only: String) -> void:
	var d = KData.read_json(case_path)
	if not (d is Dictionary):
		push_error("look lab: no case at " + case_path)
		return
	var recs := {}
	for m in d.get("materials", []):
		recs[m["id"]] = m
	var w := KratorWorld.build(case_path)
	var by_id := {}
	for grp in ["Items", "Buckets"]:
		var g := w.get_node_or_null(grp)
		if g == null:
			continue
		for ch in g.get_children():
			var gi := ch as GeometryInstance3D
			var sm := gi.material_override as ShaderMaterial if gi != null else null
			if sm == null or not KratorKmat.is_lib(sm.shader) or not gi.has_meta("krator"):
				continue
			var id := str((gi.get_meta("krator") as Dictionary).get("material", ""))
			var tris := 0
			if gi is MultiMeshInstance3D:
				tris = KratorCells.mesh_tris((gi as MultiMeshInstance3D).multimesh.mesh) * (gi as MultiMeshInstance3D).multimesh.instance_count
			elif gi is MeshInstance3D:
				tris = KratorCells.mesh_tris((gi as MeshInstance3D).mesh)
			var e: Dictionary = by_id.get(id, {"id": id, "tris": 0, "mat": sm})
			e["tris"] += tris
			if sm.get_shader_parameter("albedo_tex") != null:
				e["mat"] = sm
			by_id[id] = e
	var list := by_id.values()
	list.sort_custom(func(a, b): return a["tris"] > b["tris"] or (a["tris"] == b["tris"] and str(a["id"]) < str(b["id"])))
	for e in list:
		var rec: Dictionary = recs.get(e["id"], {})
		var lib := str(rec.get("lib")) if rec.get("lib") != null else str(rec.get("family", "?"))
		if only != "":
			var hit := false
			for word in only.split(",", false):
				hit = hit or lib.to_lower().contains(word)
			if not hit:
				continue
		if swatches.size() >= top:
			break
		var cls := KratorWeather.class_of(rec.get("lib"), str(rec.get("family", "")))
		swatches.append({"id": e["id"], "lib": lib, "cls": cls, "tris": e["tris"]})
		_swatch(swatches.size() - 1, e["mat"], lib, cls, int(e["tris"]))
	w.free()


# one material as a wall, a ledge, a pitched slab and a ball, its uv in the record's own tiles
func _swatch(k: int, src: ShaderMaterial, lib: String, cls: String, tris: int) -> void:
	var at := Vector3((k % COLS) * PITCH.x, 0.0, -(k / COLS) * PITCH.y)
	var mat := src.duplicate() as ShaderMaterial
	var ds: Vector2 = src.get_shader_parameter("detail_scale") if src.get_shader_parameter("detail_scale") != null else Vector2(6.25, 6.25)
	var tile := ds * KratorDetail.TILE_M   # the metres one tile of this surface covers (KratorDetail.set_on stored it as a ratio)
	mat.set_shader_parameter("world_uv", false)
	mat.set_shader_parameter("uv_scale", Vector3.ONE)
	mat.set_shader_parameter("uv_offset", Vector3.ZERO)
	mat.set_shader_parameter("mesh_tangents", true)
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	# the wall (3 by 2.4 m, facing +z), a ledge at its foot, a slab pitched at 35 degrees beside it
	_quad(st, Vector3(0, 0, 0), Vector3(3.0, 0, 0), Vector3(0, 2.4, 0), tile)
	_quad(st, Vector3(0, 0.02, 1.2), Vector3(3.0, 0, 0), Vector3(0, 0, -1.2), tile)
	_quad(st, Vector3(3.2, 0.3, 0.9), Vector3(1.4, 0, 0), Vector3(0, 1.4 * sin(deg_to_rad(35.0)), -1.4 * cos(deg_to_rad(35.0))), tile)
	st.generate_normals()
	st.generate_tangents()
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	mi.material_override = mat
	mi.position = at
	bench.add_child(mi)
	var ball := MeshInstance3D.new()
	var sp := SphereMesh.new()
	sp.radius = 0.45
	sp.height = 0.9
	ball.mesh = sp
	var bmat := mat.duplicate() as ShaderMaterial
	bmat.set_shader_parameter("uv_scale", Vector3(2.83 / tile.x, 1.41 / tile.y, 1.0))   # the ball's girth and half girth, in tiles
	ball.material_override = bmat
	ball.position = at + Vector3(3.9, 1.75, 0.5)
	bench.add_child(ball)
	var lab := Label3D.new()
	var amt := KratorWeather.amounts(lib if lib.contains(".") or lib.contains("/") else null, lib)
	lab.text = "%s\n%s   drift %.2f  run-off %.2f  moss %.2f  top %.2f\n%s triangles" % [lib, cls, amt.x, amt.y, amt.z, amt.w, str(tris)]
	lab.font_size = 28
	lab.pixel_size = 0.004
	lab.position = at + Vector3(1.5, 2.75, 0.0)
	lab.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	lab.modulate = Color(1, 1, 1)
	lab.outline_size = 8
	lab.visible = shot == ""
	bench.add_child(lab)


# a quad from its corner and two edges, clockwise seen from its front (the side edge u cross edge v points away from),
# with its uv in tiles of `tile` metres
func _quad(st: SurfaceTool, o: Vector3, eu: Vector3, ev: Vector3, tile: Vector2) -> void:
	var lu := eu.length() / maxf(tile.x, 0.05)
	var lv := ev.length() / maxf(tile.y, 0.05)
	var p := [o, o + eu, o + eu + ev, o + ev]
	var uv := [Vector2(0, lv), Vector2(lu, lv), Vector2(lu, 0), Vector2(0, 0)]
	for i in [0, 2, 1, 0, 3, 2]:
		st.set_uv(uv[i])
		st.add_vertex(p[i])


# the eye: all the swatches, or one from three metres
func _frame() -> void:
	var n := maxi(1, swatches.size())
	var cols := mini(COLS, n)
	var rows := (n - 1) / COLS + 1
	var mid := Vector3((cols - 1) * PITCH.x * 0.5 + 2.2, 1.2, -(rows - 1) * PITCH.y * 0.5)
	var back := 4.2 if n == 1 else maxf(cols * PITCH.x * 0.62, rows * PITCH.y * 0.9) + 3.0
	cam.position = mid + Vector3(0.0, 1.0 + back * 0.32, back)
	cam.look_at(mid, Vector3.UP)


func _apply() -> void:
	sky.hour = hour
	sky._update()
	KratorLook.apply(look, sky.env, sky.sun, get_viewport())
	KratorLook.apply_sky(look, sky)
	get_viewport().debug_draw = DEBUG_VIEWS[_debug]
	hud.text = "%s\nhour %.2f   weather %.2f   wet %.2f   arid %.2f   detail %.2f   tangents %s   view: %s\n%d swatches   T tier  H/J hour  W weather  A arid  R wet  D detail  N tangents  V view" % [
		KratorLook.describe(look), hour, float(look["weather"]), float(look["wet"]), float(look.get("aridity", 0.0)), float(look["detail"]), "mesh" if bool(look["tangents"]) else "derivative", DEBUG_NAMES[_debug], swatches.size()]


func _process(dt: float) -> void:
	if shot != "":
		_shot_frames += 1
		if _shot_frames == 8:
			var img := get_viewport().get_texture().get_image()
			var path := shot if shot.is_absolute_path() or shot.begins_with("res://") or shot.begins_with("user://") else "res://" + shot
			img.save_png(path)
			print("look lab: wrote %s (%s; %d swatches: %s)" % [path, KratorLook.describe(look), swatches.size(), ", ".join(PackedStringArray(swatches.map(func(s): return str(s["lib"]))))])
			get_tree().quit()
		return
	var v := Vector3.ZERO
	if Input.is_key_pressed(KEY_LEFT):
		v.x -= 1.0
	if Input.is_key_pressed(KEY_RIGHT):
		v.x += 1.0
	if Input.is_key_pressed(KEY_UP):
		v.z -= 1.0
	if Input.is_key_pressed(KEY_DOWN):
		v.z += 1.0
	if Input.is_key_pressed(KEY_PAGEUP):
		v.y += 1.0
	if Input.is_key_pressed(KEY_PAGEDOWN):
		v.y -= 1.0
	if v != Vector3.ZERO:
		cam.position += (cam.transform.basis * Vector3(v.x, 0, v.z) + Vector3(0, v.y, 0)) * 6.0 * dt


func _unhandled_key_input(ev: InputEvent) -> void:
	var k := ev as InputEventKey
	if k == null or not k.pressed or k.echo:
		return
	match k.keycode:
		KEY_ESCAPE:
			if KratorGalleryNav.opened_from_gallery:
				KratorGalleryNav.return_to_gallery(get_tree())
			else:
				get_tree().quit()
		KEY_F2:
			KratorGalleryNav.return_to_gallery(get_tree())
			return
		KEY_T:
			var names: Array = KratorLook.TIER_NAMES
			var keep_w := float(look["wet"])
			var keep_a := float(look.get("aridity", 0.0))
			look = KratorLook.tier(names[(names.find(str(look["tier"])) + 1) % names.size()])
			look["wet"] = keep_w
			look["aridity"] = keep_a
		KEY_H:
			hour = fposmod(hour - 0.5, 24.0)
		KEY_J:
			hour = fposmod(hour + 0.5, 24.0)
		KEY_W:
			look["weather"] = 0.0 if float(look["weather"]) > 0.0 else 1.0
		KEY_D:
			look["detail"] = 0.0 if float(look["detail"]) > 0.0 else 0.6
		KEY_N:
			look["tangents"] = not bool(look["tangents"])
		KEY_R:
			look["wet"] = 0.0 if float(look["wet"]) > 0.0 else 0.7
		KEY_A:
			var ar := float(look.get("aridity", 0.0))
			look["aridity"] = 0.5 if ar < 0.25 else (1.0 if ar < 0.75 else 0.0)
		KEY_V:
			_debug = (_debug + 1) % DEBUG_VIEWS.size()
		_:
			return
	_apply()
