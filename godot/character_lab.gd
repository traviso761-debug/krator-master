# The Character Lab in the Godot Gallery: one stranger from core/charactermodels' MakeHuman bodies (KCharFigure), with
# the body, the people, the clip and the seed to pick, an orbit camera, and the Gallery button.
#   godot --path godot character_lab.tscn
# The bodies' pieces are gitignored (core/charactermodels/tools/make_mpfb.py builds them, godot/tools/sync_core.py
# copies them to res://data/characters/pieces/): without them the lab says so instead of failing.
extends Node3D

const DIR := "res://data/characters"
const BODIES := ["mpfb_male", "mpfb_female", "mpfb_giant"]

var cam: Camera3D
var fig: KCharFigure = null
var peoples: Array = []
var body_opt: OptionButton
var people_opt: OptionButton
var clip_opt: OptionButton
var info_lbl: Label
var seed_val := 7
var _yaw := 0.6
var _pitch := -0.12
var _dist := 4.2
var _drag := false
var _target := Vector3(0, 0.95, 0)


func _ready() -> void:
	_stage()
	var pj = KData.read_json(DIR + "/peoples.json") if FileAccess.file_exists(DIR + "/peoples.json") else null
	if pj is Dictionary:
		peoples = pj.get("peoples", [])
	_build_ui()
	if not has_pieces():
		info_lbl.text = "The MakeHuman pieces are not in this checkout.\nThey are gitignored and built locally:\n  python3 core/charactermodels/tools/make_mpfb.py\n  python3 godot/tools/sync_core.py\nthen reopen the lab."
		return
	_rebuild()


static func has_pieces(body := "mpfb_male") -> bool:
	return DirAccess.dir_exists_absolute("%s/pieces/%s" % [DIR, body])


func _stage() -> void:
	var we := WorldEnvironment.new()
	var env := Environment.new()
	var sky := Sky.new()
	var psm := ProceduralSkyMaterial.new()
	psm.sky_top_color = Color(0.22, 0.24, 0.30)
	psm.sky_horizon_color = Color(0.46, 0.42, 0.38)
	psm.ground_horizon_color = Color(0.30, 0.27, 0.24)
	sky.sky_material = psm
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.7
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	we.environment = env
	add_child(we)
	var key := DirectionalLight3D.new()
	key.rotation_degrees = Vector3(-38, 35, 0)
	key.light_energy = 1.6
	key.shadow_enabled = true
	add_child(key)
	var rim := DirectionalLight3D.new()
	rim.rotation_degrees = Vector3(-20, 200, 0)
	rim.light_energy = 0.5
	add_child(rim)
	var floor_mi := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 3.0
	cyl.bottom_radius = 3.0
	cyl.height = 0.04
	var fm := StandardMaterial3D.new()
	fm.albedo_color = Color(0.30, 0.26, 0.21)
	fm.roughness = 0.9
	cyl.material = fm
	floor_mi.mesh = cyl
	floor_mi.position.y = -0.02
	add_child(floor_mi)
	cam = Camera3D.new()
	cam.fov = 40.0
	add_child(cam)
	cam.current = true
	_place_cam()


func _place_cam() -> void:
	var off := Vector3(sin(_yaw) * cos(_pitch), -sin(_pitch), cos(_yaw) * cos(_pitch)) * _dist
	cam.look_at_from_position(_target + off, _target, Vector3.UP)


func _build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var panel := PanelContainer.new()
	panel.position = Vector2(12, 10)
	panel.add_theme_stylebox_override("panel", KratorHostUI._box_style(Color(0.094, 0.082, 0.059, 0.90), Color(0.44, 0.31, 0.21, 0.85), 6, 10, 8))
	layer.add_child(panel)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 6)
	panel.add_child(v)
	var hdr := HBoxContainer.new()
	hdr.add_theme_constant_override("separation", 6)
	v.add_child(hdr)
	var bg := KratorHostUI._make_btn("<< Gallery (F2)", "Back to the Krator Worlds Gallery (F2)")
	bg.add_theme_color_override("font_color", Color(1.0, 0.88, 0.56))
	bg.pressed.connect(func(): KratorGalleryNav.return_to_gallery(get_tree()))
	hdr.add_child(bg)
	var title := Label.new()
	title.text = "CHARACTER LAB"
	title.add_theme_font_size_override("font_size", 13)
	title.add_theme_color_override("font_color", Color(0.90, 0.79, 0.52))
	hdr.add_child(title)

	body_opt = _row(v, "Body:")
	for b in BODIES:
		body_opt.add_item(b)
	body_opt.item_selected.connect(func(_i: int): _rebuild())
	people_opt = _row(v, "People:")
	for p in peoples:
		people_opt.add_item(str(p.get("name", p.get("id", "?"))))
	people_opt.item_selected.connect(func(_i: int): _rebuild())
	clip_opt = _row(v, "Clip:")
	clip_opt.item_selected.connect(func(i: int):
		if fig != null:
			fig.play(clip_opt.get_item_text(i))
	)
	var roll := KratorHostUI._make_btn("Roll new stranger (R)", "Draw another stranger from the same people")
	roll.pressed.connect(_roll)
	v.add_child(roll)
	info_lbl = KratorHostUI._tag_lbl("")
	info_lbl.custom_minimum_size = Vector2(320, 0)
	info_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	v.add_child(info_lbl)
	v.add_child(KratorHostUI._tag_lbl("Drag: orbit | Wheel: zoom"))


func _row(parent: Control, label: String) -> OptionButton:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 6)
	parent.add_child(h)
	var l := KratorHostUI._tag_lbl(label)
	l.custom_minimum_size = Vector2(56, 0)
	h.add_child(l)
	var o := OptionButton.new()
	o.custom_minimum_size = Vector2(240, 0)
	KratorHostUI._style_btn(o)
	h.add_child(o)
	return o


func _roll() -> void:
	seed_val += 1
	_rebuild()


func _rebuild() -> void:
	var body: String = BODIES[maxi(0, body_opt.selected)]
	if not has_pieces(body):
		info_lbl.text = "No pieces for %s in res://data/characters/pieces/ (make_mpfb.py, then sync_core.py)." % body
		return
	if fig != null:
		fig.queue_free()
		fig = null
	fig = KCharFigure.new()
	fig.load_body(DIR, body)
	add_child(fig)
	var people = peoples[people_opt.selected] if people_opt.selected >= 0 and people_opt.selected < peoples.size() else null
	fig.apply(KChar.stranger(seed_val, fig.kit, people))
	var prev := clip_opt.get_item_text(clip_opt.selected) if clip_opt.selected >= 0 else "idle"
	clip_opt.clear()
	var sel := 0
	var i := 0
	for c in fig.skel.get("clips", []):
		var nm := str(c.get("name", ""))
		if nm == "":
			continue
		clip_opt.add_item(nm)
		if nm == prev:
			sel = i
		i += 1
	if clip_opt.item_count > 0:
		clip_opt.select(sel)
		fig.play(clip_opt.get_item_text(sel))
	_target = Vector3(0, 0.95 * fig.size, 0)
	_dist = 4.2 * fig.size
	_place_cam()
	info_lbl.text = "%s, %s, seed %d" % [body, str(people.get("name", "no people")) if people is Dictionary else "no people", seed_val]


func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventMouseButton:
		var mb := e as InputEventMouseButton
		if mb.button_index in [MOUSE_BUTTON_LEFT, MOUSE_BUTTON_RIGHT]:
			_drag = mb.pressed
		elif mb.pressed and mb.button_index == MOUSE_BUTTON_WHEEL_UP:
			_dist = maxf(0.8, _dist / 1.1)
			_place_cam()
		elif mb.pressed and mb.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_dist = minf(40.0, _dist * 1.1)
			_place_cam()
	elif e is InputEventMouseMotion and _drag:
		var mm := e as InputEventMouseMotion
		_yaw -= mm.relative.x * 0.008
		_pitch = clampf(_pitch + mm.relative.y * 0.006, -1.2, 0.6)
		_place_cam()
	elif e is InputEventKey and e.pressed and not e.echo:
		var k := (e as InputEventKey).keycode
		if k == KEY_F2:
			KratorGalleryNav.return_to_gallery(get_tree())
		elif k == KEY_R:
			_roll()
