# THE CATCH-BOWL REGION, GODOT-NATIVE (the owner, 2026-11-25: "can we pull up the new region in godot and give me a
# godot native host so i can navigate and trigger different weather conditions").
#
#   godot --path godot catch_bowl.tscn
#   godot --path godot catch_bowl.tscn -- --at=jabal --weather=dust --step=2
#
# WHAT THIS IS. The region's ground at the SCALE MODEL'S OWN RESOLUTION, 2 km a sample, read from
# godot/data/catch-bowl (written by openworld/catch-bowl/tools/export_godot.py straight off the model's rasters). A
# 1,284 x 1,058 km box, 642 x 529 samples, heights -2,595 to 15,527 m, with the sixteen sites as markers and the seven
# weather kinds on a panel.
#
# WHAT IT IS NOT, and this matters before anyone judges the look: it is NOT the 1:1 streamed region. The region is not
# cut yet -- it waits on three map edits and on the owner's new scale model (openworld/catch-bowl/PLAN.md section 13),
# and cutting it twice is the one thing that plan says not to do. So there is no flora, no settlement drawn, no road,
# and the ground is a 2 km grid rather than the metre-scale heightfield krator/world_stream.gd streams. What it is good
# for is exactly what is wanted before a cut: flying the Catch's floor, the Godsgate, the Bowl's salt and the Stalker
# Gate's graben to see whether the country reads, and watching the region's own weather over it.
#
# WHEN THE REGION IS CUT this scene is replaced by the usual path (world_stream.gd on a proper export) and goes.
extends Node3D

const DATA := "res://data/catch-bowl/"
const VSCALE := 1.0            # metres per metre: the model's heights are already metres

var meta := {}
var fx: KratorAtmosFx
var cam: Camera3D
var env: WorldEnvironment
var sun: DirectionalLight3D
var terrain: MeshInstance3D
var _heights := PackedFloat32Array()
var _nx := 0
var _nz := 0
var _m := 2000.0               # metres a sample
var _lo := 0.0
var _hi := 1.0
var ui: CanvasLayer
var _label: RichTextLabel
var _pins: Node3D


func _ready() -> void:
	var f := FileAccess.open(DATA + "meta.json", FileAccess.READ)
	if f == null:
		push_error("catch_bowl: no " + DATA + "meta.json -- run python3 openworld/catch-bowl/tools/export_godot.py")
		return
	meta = JSON.parse_string(f.get_as_text())
	f.close()
	_m = float(meta.get("m_per_sample", 2000.0))
	_lo = float(meta["height"]["lo"])
	_hi = float(meta["height"]["hi"])
	_load_heights()
	_build_sky()
	_build_terrain()
	_build_pins()
	fx = KratorAtmosFx.new()
	fx.name = "AtmosFx"
	add_child(fx)
	# --nofog=1 turns the air off to look at the ground: the fx layer owns the fog, so setting env.fog_enabled here was
	# undone by the first weather apply -- which is why the early top-down shots were a flat wash
	if _arg("nofog", "") != "":
		fx.fog_scale = 0.0
	fx.bind(env, sun)
	_build_ui()
	_place_camera(_arg("at", "jabal"))
	var w := _arg("weather", "")
	if w != "":
		fx.set_kind(w)
	_shot = _arg("shot", "")
	print("catch-bowl: %d x %d samples at %.0f m (%s km), heights %.0f..%.0f m, %d sites, %d weather kinds"
		% [_nx, _nz, _m, str(meta.get("km", [])), _lo, _hi, (meta.get("sites", []) as Array).size(),
		   (meta.get("weather", []) as Array).size()])


func _arg(k: String, d: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + k + "="):
			return a.substr(k.length() + 3)
	return d


func _load_heights() -> void:
	var img := Image.new()
	if img.load(DATA + "height.png") != OK:
		push_error("catch_bowl: height.png will not load")
		return
	_nx = img.get_width()
	_nz = img.get_height()
	_heights.resize(_nx * _nz)
	# the export is 16-bit greyscale normalised over [lo, hi]; Godot gives it back as a float in 0..1
	for z in _nz:
		for x in _nx:
			_heights[z * _nx + x] = _lo + img.get_pixel(x, z).r * (_hi - _lo)


func height_at(x: float, z: float) -> float:
	if _nx == 0:
		return 0.0
	var fx0 := clampf(x / _m, 0.0, float(_nx - 1))
	var fz0 := clampf(z / _m, 0.0, float(_nz - 1))
	var ix := int(fx0)
	var iz := int(fz0)
	var tx := fx0 - ix
	var tz := fz0 - iz
	var jx: int = mini(ix + 1, _nx - 1)
	var jz: int = mini(iz + 1, _nz - 1)
	var h00 := _heights[iz * _nx + ix]
	var h10 := _heights[iz * _nx + jx]
	var h01 := _heights[jz * _nx + ix]
	var h11 := _heights[jz * _nx + jx]
	return lerpf(lerpf(h00, h10, tx), lerpf(h01, h11, tx), tz) * VSCALE


func _build_sky() -> void:
	env = WorldEnvironment.new()
	var e := Environment.new()
	e.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	sky.sky_material = ProceduralSkyMaterial.new()
	e.sky = sky
	e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	e.ambient_light_color = Color(0.62, 0.66, 0.74)
	e.ambient_light_energy = 0.55
	e.fog_enabled = true
	e.fog_density = 0.00004
	e.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.environment = e
	add_child(env)
	sun = DirectionalLight3D.new()
	# 34 degrees: low enough that a slope reads, high enough that the flats are not crushed. At 22 the whole region came
	# back at a third of its albedo and every tint collapsed into one brown; at 42 the relief vanished. The ambient is
	# raised with it so the away-facing slopes keep their colour instead of going black.
	sun.rotation_degrees = Vector3(-34, 38, 0)
	sun.light_energy = 1.1
	# no shadows: a directional shadow over 1,282 km of terrain is a few metres of texel and shows nothing but acne
	sun.shadow_enabled = false
	add_child(sun)


func _build_terrain() -> void:
	var step := maxi(1, int(_arg("step", "1")))
	var nx := int((_nx - 1) / step) + 1
	var nz := int((_nz - 1) / step) + 1
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for z in nz:
		for x in nx:
			var wx := float(x * step) * _m
			var wz := float(z * step) * _m
			var h := height_at(wx, wz)
			st.set_uv(Vector2(float(x) / maxf(1.0, nx - 1), float(z) / maxf(1.0, nz - 1)))
			# and the tint carries the local slope, so a scarp is darker than the bench above it. Two samples is enough
			# at 2 km: the gradient over a cell is what a shaded relief map draws.
			st.set_color(_tint(h).darkened(clampf(_slope(wx, wz) * 1.6, 0.0, 0.55)))
			st.add_vertex(Vector3(wx, h, wz))
	for z in nz - 1:
		for x in nx - 1:
			var a := z * nx + x
			var b := a + 1
			var c := a + nx
			var d := c + 1
			# WINDING: a, b, c then b, d, c. The first pass wound them the other way, the normals came out pointing
			# DOWN, and with back-face culling the whole region was invisible from above -- what showed through was the
			# procedural sky's own ground hemisphere, which is a convincing shade of desert and cost an hour.
			st.add_index(a); st.add_index(b); st.add_index(c)
			st.add_index(b); st.add_index(d); st.add_index(c)
	st.generate_normals()
	terrain = MeshInstance3D.new()
	terrain.name = "Terrain"
	terrain.mesh = st.commit()
	var mat := StandardMaterial3D.new()
	mat.vertex_color_use_as_albedo = true
	mat.roughness = 0.95
	terrain.material_override = mat
	add_child(terrain)
	var aabb := terrain.get_aabb()
	var fmt: int = terrain.mesh.surface_get_format(0)
	var arrs: Array = terrain.mesh.surface_get_arrays(0)
	var cols: PackedColorArray = arrs[Mesh.ARRAY_COLOR] if arrs.size() > Mesh.ARRAY_COLOR and arrs[Mesh.ARRAY_COLOR] != null else PackedColorArray()
	print("  terrain: %d surfaces, aabb %s size %s, format %d, colours %d (has COLOR %s), first %s last %s"
		% [terrain.mesh.get_surface_count(), str(aabb.position), str(aabb.size), fmt, cols.size(),
		   str((fmt & Mesh.ARRAY_FORMAT_COLOR) != 0), str(cols[0]) if cols.size() else "-", str(cols[cols.size() - 1]) if cols.size() else "-"])


# the local gradient, as a 0..1 steepness (1 is about 45 degrees over a 2 km cell, which on this grid is a wall)
func _slope(x: float, z: float) -> float:
	var d := _m
	var hx := (height_at(x + d, z) - height_at(x - d, z)) / (2.0 * d)
	var hz := (height_at(x, z + d) - height_at(x, z - d)) / (2.0 * d)
	return clampf(sqrt(hx * hx + hz * hz), 0.0, 1.0)


# The country by height. The bands are wider apart in value than a photograph's would be, on purpose: at 2 km a sample
# there is no texture and no shadow, so the only thing telling salt from floor from rock is its tone.
func _tint(h: float) -> Color:
	if h < -800.0:
		return Color(0.93, 0.91, 0.86)       # the Bowl's salt: the brightest thing in the region
	if h < 600.0:
		return Color(0.78, 0.63, 0.39)       # the Catch's floor
	if h < 2600.0:
		return Color(0.55, 0.44, 0.31)       # the fans and the benches
	if h < 4600.0:
		return Color(0.38, 0.34, 0.32)       # rock
	if h < 6800.0:
		return Color(0.52, 0.52, 0.54)       # bare, above the air
	return Color(0.97, 0.98, 1.00)           # the crests


func _build_pins() -> void:
	_pins = Node3D.new()
	_pins.name = "Sites"
	add_child(_pins)
	var off: Array = meta.get("origin_offset_m", [0, 0])
	for s in meta.get("sites", []):
		# the export gives x,z from the region's origin pixel; the mesh starts at the box's corner
		var wx := float(s["x"]) - float(off[0])
		var wz := float(s["z"]) - float(off[1])
		var m := MeshInstance3D.new()
		var cyl := CylinderMesh.new()
		cyl.top_radius = 0.0
		cyl.bottom_radius = 3500.0
		cyl.height = 26000.0
		m.mesh = cyl
		var mt := StandardMaterial3D.new()
		mt.albedo_color = Color(0.86, 0.62, 0.22)
		mt.emission_enabled = true
		mt.emission = Color(0.86, 0.62, 0.22)
		mt.emission_energy_multiplier = 0.6
		m.material_override = mt
		m.position = Vector3(wx, height_at(wx, wz) + 13000.0, wz)
		m.name = String(s["id"])
		_pins.add_child(m)
		var lb := Label3D.new()
		lb.text = String(s["name"]).split(",")[0]
		lb.font_size = 180
		lb.position = Vector3(wx, height_at(wx, wz) + 30000.0, wz)
		lb.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		lb.no_depth_test = true
		_pins.add_child(lb)


func site(nameish: String) -> Dictionary:
	var want := nameish.to_lower()
	for s in meta.get("sites", []):
		if String(s["id"]).to_lower() == want or String(s["name"]).to_lower().begins_with(want):
			return s
	return {}


func _place_camera(at: String) -> void:
	cam = Camera3D.new()
	cam.set_script(load("res://krator/fly_camera.gd"))
	# NEAR MATTERS AS MUCH AS FAR in a world 1,282 km across. The first pass left near at Godot's 0.05 and set far to
	# 4,000,000: a ratio of eighty million, which empties the depth buffer, and the terrain simply did not draw -- what
	# looked like ground in the early shots was the procedural sky's own ground hemisphere. At 120 m to 900 km the ratio
	# is 7,500 and the mesh appears.
	cam.near = 120.0
	cam.far = 900000.0
	cam.fov = 60.0
	var s := site(at)
	var off: Array = meta.get("origin_offset_m", [0, 0])
	var wx := float(_nx) * _m * 0.5
	var wz := float(_nz) * _m * 0.5
	if not s.is_empty():
		wx = float(s["x"]) - float(off[0])
		wz = float(s["z"]) - float(off[1])
	# add_child BEFORE look_at: look_at wants the node in the tree, and the first run said so
	# 7 km up and 16 km back: an aerial view a real atmosphere allows. The first attempt put the eye 61 km up and 90 km
	# back and the picture came out a flat wash -- correctly, because the fog densities here are the honest ones
	# (Koschmieder: density = 3 / visibility_m), so 60 km of clear air already swallows the ground. If you want the
	# whole 1,284 km box at once, that is a map, not a view: fly up and the fog will tell you the same thing.
	var g := height_at(wx, wz)
	var up := float(_arg("up", "16000"))
	var back := float(_arg("back", "48000"))
	cam.position = Vector3(wx, g + up, wz + back)
	add_child(cam)
	cam.look_at(Vector3(wx, g, wz))
	cam.current = true
	if "speed" in cam:
		cam.speed = 12000.0


func _build_ui() -> void:
	ui = CanvasLayer.new()
	add_child(ui)
	var panel := PanelContainer.new()
	panel.position = Vector2(18, 18)
	panel.custom_minimum_size = Vector2(330, 0)
	ui.add_child(panel)
	var box := VBoxContainer.new()
	panel.add_child(box)
	var title := Label.new()
	title.text = "The Catch & the Bowl — weather"
	box.add_child(title)
	for k in KratorAtmosFx.order():
		var row: Dictionary = KratorAtmosFx.KINDS[k]
		var b := Button.new()
		b.text = "%s" % row["name"]
		b.tooltip_text = _note(k)
		b.pressed.connect(func() -> void: fx.set_kind(k))
		box.add_child(b)
	_label = RichTextLabel.new()
	_label.custom_minimum_size = Vector2(312, 150)
	_label.bbcode_enabled = true
	_label.fit_content = true
	box.add_child(_label)
	var help := Label.new()
	help.text = "WASD/QE fly, drag to look, Shift x5, Ctrl+wheel speed\n1-7 switch weather"
	help.autowrap_mode = TextServer.AUTOWRAP_WORD
	box.add_child(help)


func _note(k: String) -> String:
	for w in meta.get("weather", []):
		if String(w.get("id", "")) == k:
			return String(w.get("note", ""))
	return ""


func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventKey and e.pressed and not e.echo:
		var ks := KratorAtmosFx.order()
		var n := (e as InputEventKey).keycode - KEY_1
		if n >= 0 and n < ks.size():
			fx.set_kind(ks[n])


# --shot=shots/catch-bowl.png: render, let the weather settle, save a screenshot, quit (spike.gd's idiom)
var _shot := ""
var _shot_frames := 0


func _shot_tick() -> void:
	if _shot == "":
		return
	_shot_frames += 1
	if _shot_frames == 90:   # 90 frames: the weather's ease is 2.5 s, so the picture is of the settled condition
		var img := get_viewport().get_texture().get_image()
		DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://" + _shot.get_base_dir()))
		img.save_png("res://" + _shot)
		print("saved ", _shot)
		get_tree().quit()


func _process(_d: float) -> void:
	_shot_tick()
	if _label == null or cam == null or fx == null:
		return
	var p := cam.global_position
	var g := height_at(p.x, p.z)
	var n := fx._now()
	var px := int(round(p.x / 2000.0)) + int(meta.get("box_px", [0, 0, 0, 0])[0])
	var pz := int(round(p.z / 2000.0)) + int(meta.get("box_px", [0, 0, 0, 0])[1])
	_label.text = ("[b]%s[/b]\nvisibility %s\nwind x%.2f  sun x%.2f\n%s\n\neye %.0f m, ground %.0f m\npx %d,%d"
		% [n["name"],
		   ("%.0f km" % n["visibility_km"]) if float(n["visibility_km"]) >= 1.0 else ("%.0f m" % (float(n["visibility_km"]) * 1000.0)),
		   n["wind"], n["sun"],
		   ("[color=#c89a3a]hides a Stalker[/color]" if bool(n["hides"]) else ""),
		   p.y, g, px, pz])
