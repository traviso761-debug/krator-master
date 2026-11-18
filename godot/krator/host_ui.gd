# Krator Host UI for Godot (core/host twin: 90-host-camera, 92-host-panel, 93-host-inspect, 94-host-marks).
# Provides the dark-walnut & brass Krator toolbar, live region/camera/ground/pin coordinates with clipboard export,
# auto-populated Points of Interest (places, overlooks, Strongbow arcology, Beast-Rider camps, village roads, active pin),
# case switcher, Walk/Fly & 1st/3rd-person toggles, 3D cursor pin controls, hover/click Inspector, Polygon/Distance
# measurement readout, Flora/Buildings/SDFGI toggles, and live Time-of-Day clock controls.
class_name KratorHostUI
extends CanvasLayer

signal case_selected(index_path: String)
signal poi_selected(poi: Dictionary)
signal walk_toggled(on: bool)
signal first_person_toggled(on: bool)
signal ground_requested()
signal ride_toggled()
signal speed_selected(mult: float)
signal tool_changed(tool_name: String)
signal pin_action(action: String)
signal layer_toggled(layer_name: String, on: bool)
signal gi_toggled(on: bool)
signal hour_changed(hour_val: float)
signal clock_rate_selected(rate_val: float)
signal poly_action(action: String)

var cases: Array = []          # [{label, path}]
var pois: Array = []           # [{label, kind, eye: Vector3, target: Vector3, walk: bool}]
var active_tool := ""          # "", "pin", "inspect", "poly"
var chrome_visible := true

var left_panel: PanelContainer
var left_body: VBoxContainer
var btn_fold_left: Button
var title_lbl: Label
var case_opt: OptionButton
var poi_opt: OptionButton
var btn_walk: Button
var btn_fp: Button
var btn_ride: Button
var btn_pin_mode: Button
var btn_fly_pin: Button
var btn_walk_pin: Button
var btn_clr_pin: Button
var btn_inspect: Button
var btn_poly: Button
var btn_flora: Button
var btn_builds: Button
var btn_gi: Button
var hour_slider: HSlider
var clock_lbl: Label
var speed_btns := {}
var rate_btns := {}

var right_panel: PanelContainer
var right_body: VBoxContainer
var btn_fold_right: Button
var coords_lbl: Label
var btn_copy_cam: Button
var btn_copy_xz: Button

var detail_panel: PanelContainer
var detail_title: Label
var detail_lbl: Label
var poly_bar: HBoxContainer

var show_pill: Button
var _syncing := false
var _copy_flash := 0.0


func _ready() -> void:
	layer = 10
	_build_ui()


func _process(dt: float) -> void:
	if _copy_flash > 0.0:
		_copy_flash -= dt
		if _copy_flash <= 0.0 and btn_copy_cam != null:
			btn_copy_cam.text = "Copy View"


static func _box_style(bg: Color, border: Color, radius := 6, pad_x := 10, pad_y := 8) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = border
	s.set_border_width_all(1)
	s.set_corner_radius_all(radius)
	s.content_margin_left = pad_x
	s.content_margin_right = pad_x
	s.content_margin_top = pad_y
	s.content_margin_bottom = pad_y
	return s


static func _style_btn(b: Button) -> void:
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_size_override("font_size", 12)
	b.add_theme_color_override("font_color", Color(0.92, 0.86, 0.72))
	b.add_theme_color_override("font_hover_color", Color(1.0, 0.96, 0.86))
	b.add_theme_color_override("font_pressed_color", Color(1.0, 0.97, 0.88))
	b.add_theme_stylebox_override("normal", _box_style(Color(0.16, 0.13, 0.09, 0.94), Color(0.39, 0.28, 0.19, 0.85), 4, 7, 4))
	b.add_theme_stylebox_override("hover", _box_style(Color(0.25, 0.20, 0.13, 0.98), Color(0.72, 0.55, 0.24, 0.95), 4, 7, 4))
	b.add_theme_stylebox_override("pressed", _box_style(Color(0.60, 0.45, 0.12, 0.96), Color(0.94, 0.79, 0.36, 1.0), 4, 7, 4))
	b.add_theme_stylebox_override("disabled", _box_style(Color(0.11, 0.10, 0.08, 0.65), Color(0.25, 0.20, 0.15, 0.50), 4, 7, 4))


static func _make_btn(txt: String, tip := "", toggle := false) -> Button:
	var b := Button.new()
	b.text = txt
	b.tooltip_text = tip
	b.toggle_mode = toggle
	_style_btn(b)
	return b


static func _tag_lbl(txt: String) -> Label:
	var l := Label.new()
	l.text = txt
	l.add_theme_font_size_override("font_size", 11)
	l.add_theme_color_override("font_color", Color(0.76, 0.68, 0.53))
	return l


func _build_ui() -> void:
	var panel_sb := _box_style(Color(0.094, 0.082, 0.059, 0.90), Color(0.44, 0.31, 0.21, 0.85), 6, 10, 8)

	# ---------------- Top-left Host Controls Panel
	left_panel = PanelContainer.new()
	left_panel.name = "HostPanel"
	left_panel.position = Vector2(12, 10)
	left_panel.add_theme_stylebox_override("panel", panel_sb)
	add_child(left_panel)

	var lv := VBoxContainer.new()
	lv.add_theme_constant_override("separation", 6)
	left_panel.add_child(lv)

	var hdr := HBoxContainer.new()
	hdr.add_theme_constant_override("separation", 6)
	lv.add_child(hdr)

	title_lbl = Label.new()
	title_lbl.text = "KRATOR HOST"
	title_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_lbl.add_theme_font_size_override("font_size", 13)
	title_lbl.add_theme_color_override("font_color", Color(0.90, 0.79, 0.52))
	hdr.add_child(title_lbl)

	case_opt = OptionButton.new()
	case_opt.tooltip_text = "Switch streamed open-world case (res://data/*/index.json)"
	case_opt.custom_minimum_size = Vector2(155, 0)
	_style_btn(case_opt)
	case_opt.item_selected.connect(_on_case_idx)
	hdr.add_child(case_opt)

	btn_fold_left = _make_btn("–", "Collapse / expand Host controls")
	btn_fold_left.pressed.connect(func():
		left_body.visible = not left_body.visible
		btn_fold_left.text = "–" if left_body.visible else "+"
	)
	hdr.add_child(btn_fold_left)

	var btn_hide := _make_btn("Hide (H)", "Hide all UI chrome for clean screenshots (press H or F1 to restore)")
	btn_hide.pressed.connect(func(): set_chrome_visible(false))
	hdr.add_child(btn_hide)

	left_body = VBoxContainer.new()
	left_body.add_theme_constant_override("separation", 5)
	lv.add_child(left_body)

	# Row 1: Points of Interest / Camera Views dropdown
	var r_poi := HBoxContainer.new()
	r_poi.add_theme_constant_override("separation", 4)
	left_body.add_child(r_poi)
	r_poi.add_child(_tag_lbl("View / POI:"))

	poi_opt = OptionButton.new()
	poi_opt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	poi_opt.custom_minimum_size = Vector2(250, 0)
	poi_opt.tooltip_text = "Jump camera or walker to any Point of Interest, Place, Arcology, or Camp"
	_style_btn(poi_opt)
	poi_opt.item_selected.connect(_on_poi_idx)
	r_poi.add_child(poi_opt)

	var btn_prev := _make_btn("<", "Previous Point of Interest")
	btn_prev.pressed.connect(func(): _step_poi(-1))
	r_poi.add_child(btn_prev)

	var btn_next := _make_btn(">", "Next Point of Interest")
	btn_next.pressed.connect(func(): _step_poi(1))
	r_poi.add_child(btn_next)

	# Row 2: Camera & Movement Mode
	var r_cam := HBoxContainer.new()
	r_cam.add_theme_constant_override("separation", 4)
	left_body.add_child(r_cam)
	r_cam.add_child(_tag_lbl("Camera:"))

	btn_walk = _make_btn("Walk (F)", "Toggle grounded Walk mode vs WASD+QE Free-Fly camera (F)", true)
	btn_walk.button_pressed = true
	btn_walk.toggled.connect(func(on: bool):
		if not _syncing:
			walk_toggled.emit(on)
	)
	r_cam.add_child(btn_walk)

	btn_fp = _make_btn("1st Person (V)", "Toggle 1st-person eye height vs 3rd-person chase camera in Walk mode (V)", true)
	btn_fp.toggled.connect(func(on: bool):
		if not _syncing:
			first_person_toggled.emit(on)
	)
	r_cam.add_child(btn_fp)

	var btn_gnd := _make_btn("Drop Ground", "Stand walker on terrain at current XZ")
	btn_gnd.pressed.connect(func(): ground_requested.emit())
	r_cam.add_child(btn_gnd)

	btn_ride = _make_btn("Ride Road (R)", "Autopilot along nearest road or route (R)", true)
	btn_ride.toggled.connect(func(_on: bool):
		if not _syncing:
			ride_toggled.emit()
	)
	r_cam.add_child(btn_ride)

	for sp in [[0.5, "0.5x"], [1.0, "1x"], [2.0, "2x"], [4.0, "4x"]]:
		var sb := _make_btn(sp[1], "Movement / fly speed multiplier %s" % sp[1], true)
		sb.button_pressed = is_equal_approx(float(sp[0]), 1.0)
		var mult_val := float(sp[0])
		sb.pressed.connect(func():
			_select_speed_btn(mult_val)
			speed_selected.emit(mult_val)
		)
		speed_btns[mult_val] = sb
		r_cam.add_child(sb)

	# Row 3: Cursor Pin, Inspector & Polygon Measure Tools
	var r_tool := HBoxContainer.new()
	r_tool.add_theme_constant_override("separation", 4)
	left_body.add_child(r_tool)
	r_tool.add_child(_tag_lbl("Cursor:"))

	btn_pin_mode = _make_btn("Pin Click (C)", "Click any 3D surface to place cursor pin (or Double-Click anytime!)", true)
	btn_pin_mode.toggled.connect(func(on: bool):
		if not _syncing:
			_set_tool_ui("pin" if on else "")
	)
	r_tool.add_child(btn_pin_mode)

	btn_fly_pin = _make_btn("Fly Pin (G)", "Fly camera to frame the active cursor pin (G)")
	btn_fly_pin.disabled = true
	btn_fly_pin.pressed.connect(func(): pin_action.emit("fly"))
	r_tool.add_child(btn_fly_pin)

	btn_walk_pin = _make_btn("Walk Pin", "Place walker on the active cursor pin (Shift+F)")
	btn_walk_pin.disabled = true
	btn_walk_pin.pressed.connect(func(): pin_action.emit("walk"))
	r_tool.add_child(btn_walk_pin)

	btn_clr_pin = _make_btn("Clr", "Remove active cursor pin")
	btn_clr_pin.disabled = true
	btn_clr_pin.pressed.connect(func(): pin_action.emit("clear"))
	r_tool.add_child(btn_clr_pin)

	btn_inspect = _make_btn("Inspect (I)", "Hover & click 3D objects to inspect core/tags records, flora & shaders (I)", true)
	btn_inspect.toggled.connect(func(on: bool):
		if not _syncing:
			_set_tool_ui("inspect" if on else "")
	)
	r_tool.add_child(btn_inspect)

	btn_poly = _make_btn("Poly/Dist (P)", "Click 3D points to measure distance & footprint area and copy JSON (P)", true)
	btn_poly.toggled.connect(func(on: bool):
		if not _syncing:
			_set_tool_ui("poly" if on else "")
	)
	r_tool.add_child(btn_poly)

	# Row 4: Layers & SDFGI
	var r_lay := HBoxContainer.new()
	r_lay.add_theme_constant_override("separation", 4)
	left_body.add_child(r_lay)
	r_lay.add_child(_tag_lbl("Layers:"))

	btn_flora = _make_btn("Flora", "Show / hide streamed flora & floor", true)
	btn_flora.button_pressed = true
	btn_flora.toggled.connect(func(on: bool):
		if not _syncing:
			layer_toggled.emit("flora", on)
	)
	r_lay.add_child(btn_flora)

	btn_builds = _make_btn("Buildings", "Show / hide settlement buildings, camps, bridges & arcology", true)
	btn_builds.button_pressed = true
	btn_builds.toggled.connect(func(on: bool):
		if not _syncing:
			layer_toggled.emit("buildings", on)
	)
	r_lay.add_child(btn_builds)

	btn_gi = _make_btn("SDFGI", "Toggle real-time Signed Distance Field Global Illumination", true)
	btn_gi.toggled.connect(func(on: bool):
		if not _syncing:
			gi_toggled.emit(on)
	)
	r_lay.add_child(btn_gi)

	# Row 5: Sun Clock & Time-of-Day Slider
	var r_clk := HBoxContainer.new()
	r_clk.add_theme_constant_override("separation", 5)
	left_body.add_child(r_clk)

	clock_lbl = _tag_lbl("06:30")
	clock_lbl.custom_minimum_size = Vector2(76, 0)
	clock_lbl.add_theme_color_override("font_color", Color(0.92, 0.84, 0.65))
	r_clk.add_child(clock_lbl)

	hour_slider = HSlider.new()
	hour_slider.min_value = 0.0
	hour_slider.max_value = 24.0
	hour_slider.step = 0.05
	hour_slider.value = 6.5
	hour_slider.focus_mode = Control.FOCUS_NONE
	hour_slider.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hour_slider.custom_minimum_size = Vector2(120, 0)
	hour_slider.tooltip_text = "Drag time of day (00:00 - 24:00)"
	hour_slider.value_changed.connect(func(v: float):
		if not _syncing:
			hour_changed.emit(v)
	)
	r_clk.add_child(hour_slider)

	for rt in [[0.0, "Hold"], [1.0, "1x"], [60.0, "60x"], [300.0, "300x"]]:
		var rb := _make_btn(rt[1], "Clock speed %s" % rt[1], true)
		rb.button_pressed = is_equal_approx(float(rt[0]), 60.0)
		var rv := float(rt[0])
		rb.pressed.connect(func():
			_select_rate_btn(rv)
			clock_rate_selected.emit(rv)
		)
		rate_btns[rv] = rb
		r_clk.add_child(rb)

	var hint := _tag_lbl("Dbl-click: drop Pin | Shift+Dbl-click: walk there | Right/Left drag: look | Mid drag: pan | Wheel: zoom")
	hint.add_theme_font_size_override("font_size", 10)
	hint.add_theme_color_override("font_color", Color(0.64, 0.58, 0.46))
	left_body.add_child(hint)

	# ---------------- Top-right Live Coordinates & Telemetry Panel
	right_panel = PanelContainer.new()
	right_panel.name = "CoordsPanel"
	right_panel.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	right_panel.grow_horizontal = Control.GROW_DIRECTION_BEGIN
	right_panel.position = Vector2(-12, 10)
	right_panel.add_theme_stylebox_override("panel", panel_sb)
	add_child(right_panel)

	var rv_box := VBoxContainer.new()
	rv_box.add_theme_constant_override("separation", 5)
	right_panel.add_child(rv_box)

	var rhdr := HBoxContainer.new()
	rhdr.add_theme_constant_override("separation", 5)
	rv_box.add_child(rhdr)

	var rtitle := Label.new()
	rtitle.text = "COORDINATES & TELEMETRY"
	rtitle.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rtitle.add_theme_font_size_override("font_size", 12)
	rtitle.add_theme_color_override("font_color", Color(0.90, 0.79, 0.52))
	rhdr.add_child(rtitle)

	btn_copy_cam = _make_btn("Copy View", "Copy camera & look coordinates JSON to clipboard")
	rhdr.add_child(btn_copy_cam)

	btn_copy_xz = _make_btn("Copy XZ", "Copy active Pin (or focus) region X, Z metres to clipboard")
	rhdr.add_child(btn_copy_xz)

	btn_fold_right = _make_btn("–", "Collapse / expand coordinates readout")
	btn_fold_right.pressed.connect(func():
		right_body.visible = not right_body.visible
		btn_fold_right.text = "–" if right_body.visible else "+"
	)
	rhdr.add_child(btn_fold_right)

	right_body = VBoxContainer.new()
	rv_box.add_child(right_body)

	coords_lbl = Label.new()
	coords_lbl.custom_minimum_size = Vector2(360, 0)
	coords_lbl.add_theme_font_size_override("font_size", 12)
	coords_lbl.add_theme_color_override("font_color", Color(0.93, 0.90, 0.82))
	right_body.add_child(coords_lbl)

	# ---------------- Bottom-left Inspector / Polygon Readout Card
	detail_panel = PanelContainer.new()
	detail_panel.name = "DetailPanel"
	detail_panel.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	detail_panel.grow_vertical = Control.GROW_DIRECTION_BEGIN
	detail_panel.position = Vector2(12, -12)
	detail_panel.visible = false
	detail_panel.add_theme_stylebox_override("panel", panel_sb)
	add_child(detail_panel)

	var dv := VBoxContainer.new()
	dv.add_theme_constant_override("separation", 5)
	detail_panel.add_child(dv)

	detail_title = Label.new()
	detail_title.text = "INSPECTOR"
	detail_title.add_theme_font_size_override("font_size", 12)
	detail_title.add_theme_color_override("font_color", Color(0.62, 0.91, 1.0))
	dv.add_child(detail_title)

	detail_lbl = Label.new()
	detail_lbl.custom_minimum_size = Vector2(380, 0)
	detail_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	detail_lbl.add_theme_font_size_override("font_size", 12)
	detail_lbl.add_theme_color_override("font_color", Color(0.92, 0.94, 0.96))
	dv.add_child(detail_lbl)

	poly_bar = HBoxContainer.new()
	poly_bar.add_theme_constant_override("separation", 5)
	poly_bar.visible = false
	dv.add_child(poly_bar)

	var b_undo := _make_btn("Undo Pt (Z)", "Remove last polygon/measure vertex")
	b_undo.pressed.connect(func(): poly_action.emit("undo"))
	poly_bar.add_child(b_undo)

	var b_clr := _make_btn("Clear Poly", "Clear all polygon/measure vertices")
	b_clr.pressed.connect(func(): poly_action.emit("clear"))
	poly_bar.add_child(b_clr)

	var b_cp := _make_btn("Copy Poly JSON", "Copy [[x, z], ...] polygon coordinates to clipboard")
	b_cp.pressed.connect(func(): poly_action.emit("copy"))
	poly_bar.add_child(b_cp)

	# ---------------- Minimized pill when chrome is hidden (H / F1)
	show_pill = _make_btn("UI (H)", "Restore Krator Host UI (H or F1)")
	show_pill.position = Vector2(10, 10)
	show_pill.visible = false
	show_pill.pressed.connect(func(): set_chrome_visible(true))
	add_child(show_pill)


func set_chrome_visible(vis: bool) -> void:
	chrome_visible = vis
	left_panel.visible = vis
	right_panel.visible = vis
	detail_panel.visible = vis and (active_tool == "inspect" or active_tool == "poly")
	show_pill.visible = not vis


func _set_tool_ui(t: String, emit_sig := true) -> void:
	active_tool = t
	_syncing = true
	btn_pin_mode.button_pressed = (t == "pin")
	btn_inspect.button_pressed = (t == "inspect")
	btn_poly.button_pressed = (t == "poly")
	_syncing = false
	poly_bar.visible = (t == "poly")
	detail_panel.visible = chrome_visible and (t == "inspect" or t == "poly")
	if t == "inspect":
		detail_title.text = "OBJECT & RECORD INSPECTOR (hover or click)"
	elif t == "poly":
		detail_title.text = "POLYGON & DISTANCE MEASURE (click points)"
	if emit_sig:
		tool_changed.emit(t)


func set_active_tool(t: String) -> void:
	_set_tool_ui(t, false)


func set_detail_text(title: String, body: String, show_poly_btns := false) -> void:
	detail_title.text = title
	detail_lbl.text = body
	poly_bar.visible = show_poly_btns
	detail_panel.visible = chrome_visible and body != ""


func flash_copied(msg := "Copied!") -> void:
	btn_copy_cam.text = msg
	_copy_flash = 1.4


func _select_speed_btn(mult_val: float) -> void:
	_syncing = true
	for k in speed_btns:
		(speed_btns[k] as Button).button_pressed = is_equal_approx(float(k), mult_val)
	_syncing = false


func _select_rate_btn(rv: float) -> void:
	_syncing = true
	for k in rate_btns:
		(rate_btns[k] as Button).button_pressed = is_equal_approx(float(k), rv)
	_syncing = false


func populate_cases(current_index_path: String) -> void:
	cases.clear()
	case_opt.clear()
	var d := DirAccess.open("res://data")
	var names := PackedStringArray()
	if d != null:
		d.list_dir_begin()
		var nm := d.get_next()
		while nm != "":
			if d.current_is_dir() and not nm.begins_with("."):
				var ip := "res://data/%s/index.json" % nm
				if FileAccess.file_exists(ip):
					names.append(nm)
			nm = d.get_next()
		d.list_dir_end()
	names.sort()
	if current_index_path != "" and FileAccess.file_exists(current_index_path):
		var found := false
		for nm in names:
			if ("res://data/%s/index.json" % nm) == current_index_path:
				found = true
				break
		if not found:
			cases.append({"label": current_index_path.get_base_dir().get_file(), "path": current_index_path})
	for nm in names:
		cases.append({"label": nm, "path": "res://data/%s/index.json" % nm})
	_syncing = true
	var sel := 0
	for i in cases.size():
		case_opt.add_item(str(cases[i]["label"]), i)
		if str(cases[i]["path"]) == current_index_path:
			sel = i
	if cases.size() > 0:
		case_opt.select(sel)
	_syncing = false


func _on_case_idx(idx: int) -> void:
	if _syncing or idx < 0 or idx >= cases.size():
		return
	case_selected.emit(str(cases[idx]["path"]))


static func _pretty_id(raw: String) -> String:
	var tail := raw.split("/")[-1].replace("-", " ").replace("_", " ")
	var parts := tail.split(" ", false)
	var out := PackedStringArray()
	for p in parts:
		out.append(p.substr(0, 1).to_upper() + p.substr(1))
	return " ".join(out) if not out.is_empty() else raw


static func build_pois(stream: KratorWorldStream, pin_reg = null) -> Array:
	var list: Array = []
	if stream == null or stream.index.is_empty():
		return list
	var I: Dictionary = stream.index
	var pls: Array = I.get("places", [])

	# 1. Region Aerial Overview
	var bx0 := INF
	var bz0 := INF
	var bx1 := -INF
	var bz1 := -INF
	for p in pls:
		if p.get("box") is Array:
			var b: Array = p["box"]
			bx0 = minf(bx0, float(b[0])); bz0 = minf(bz0, float(b[1]))
			bx1 = maxf(bx1, float(b[2])); bz1 = maxf(bz1, float(b[3]))
	if not is_finite(bx0):
		for c in I.get("chunk", {}).get("list", []):
			var cb: Array = c["box"]
			bx0 = minf(bx0, float(cb[0])); bz0 = minf(bz0, float(cb[1]))
			bx1 = maxf(bx1, float(cb[2])); bz1 = maxf(bz1, float(cb[3]))
	if is_finite(bx0):
		var cx := 0.5 * (bx0 + bx1)
		var cz := 0.5 * (bz0 + bz1)
		var span := clampf(maxf(bx1 - bx0, bz1 - bz0) * 0.45, 900.0, 9500.0)
		var ch := stream.height_at(cx, cz)
		var base_y := ch if is_finite(ch) else 0.0
		list.append({
			"label": "[Overview] %s Region" % _pretty_id(str(I.get("region", "World"))),
			"kind": "overview",
			"eye": Vector3(cx + span * 0.45, base_y + span * 0.48, cz + span * 0.72),
			"target": Vector3(cx, base_y + 20.0, cz),
			"walk": false
		})

	# 2. Primary Route Start
	if I.get("route") is Dictionary and I["route"].has("link"):
		var rlink := stream.road(str(I["route"]["link"]))
		var rpts: Array = rlink.get("pts", [])
		if rpts.size() > 0:
			var first_pt: Array = rpts[-1] if rlink.get("from") != I["route"].get("from") else rpts[0]
			var rx := float(first_pt[0])
			var rz := float(first_pt[1])
			var ry := float(first_pt[2]) if first_pt.size() >= 3 else (stream.height_at(rx, rz) if is_finite(stream.height_at(rx, rz)) else 0.0)
			list.append({
				"label": "[Route] Start (%s km)" % str(I["route"].get("km", "?")),
				"kind": "route",
				"eye": Vector3(rx, ry + 2.0, rz + 8.0),
				"target": Vector3(rx, ry, rz),
				"walk": true
			})

	# 3. Every Place (both Overlook & Walk views, plus Arcology view & inner Villages/Monasteries when present)
	var seen_pts: Array = []
	for p in pls:
		var pid := str(p.get("id", ""))
		var pname := str(p.get("name", pid))
		var pin: Array = p.get("pin", [0.0, 0.0])
		var px := float(pin[0])
		var pz := float(pin[1])
		var py := stream.height_at(px, pz)
		if not is_finite(py):
			py = 0.0
		var pbox: Array = p.get("box", [px - 800.0, pz - 800.0, px + 800.0, pz + 800.0])
		var pspan := maxf(float(pbox[2]) - float(pbox[0]), float(pbox[3]) - float(pbox[1]))
		var dist := clampf(pspan * 0.26, 260.0, 720.0)
		if p.get("arcology") is Dictionary:
			var arc_at: Array = p["arcology"]["at"]
			var ax := float(arc_at[0])
			var ay := float(arc_at[1])
			var az := float(arc_at[2])
			list.append({
				"label": "[Arcology] %s Overlook" % pname,
				"kind": "arcology",
				"eye": Vector3(ax - 1550.0, ay - 80.0, az + 420.0),
				"target": Vector3(ax + 40.0, ay - 260.0, az),
				"walk": false
			})
			list.append({
				"label": "[Arcology] %s Canyon Floor" % pname,
				"kind": "arcology",
				"eye": Vector3(ax - 1150.0, ay - 460.0, az - 180.0),
				"target": Vector3(ax + 40.0, ay - 220.0, az),
				"walk": false
			})
			list.append({
				"label": "[Walk] %s Plateau" % pname,
				"kind": "place_walk",
				"eye": Vector3(ax + 132.0, ay + 3.0, az),
				"target": Vector3(ax + 120.0, ay, az),
				"walk": true
			})
		else:
			var hpois: Array = p.get("hamlet_pois", [])
			var on_pin := false
			for hp in hpois:
				if hp is Dictionary and Vector2(float(hp.get("x", px)), float(hp.get("z", pz))).distance_to(Vector2(px, pz)) < 250.0:
					on_pin = true
					break
			if not hpois.is_empty() and not on_pin:
				# Site pin is an unbuilt central plateau (e.g. Longsong): frame the primary built village & river crossing!
				var h0: Dictionary = hpois[0]
				var hx := float(h0.get("x", px))
				var hz := float(h0.get("z", pz))
				var hy := stream.height_at(hx, hz)
				if not is_finite(hy):
					hy = py
				list.append({
					"label": "[Overlook] %s (%s)" % [pname, pid],
					"kind": "place_overlook",
					"eye": Vector3(hx - 430.0, hy + 215.0, hz - 540.0),
					"target": Vector3(hx - 40.0, hy + 10.0, hz),
					"walk": false
				})
				list.append({
					"label": "[Walk] %s — %s" % [pname, str(h0.get("name", pid))],
					"kind": "place_walk",
					"eye": Vector3(hx, hy + 2.0, hz + 10.0),
					"target": Vector3(hx, hy, hz),
					"walk": true
				})
			else:
				list.append({
					"label": "[Overlook] %s (%s)" % [pname, pid],
					"kind": "place_overlook",
					"eye": Vector3(px + dist * 0.48, py + dist * 0.42, pz + dist * 0.68),
					"target": Vector3(px, py + 12.0, pz),
					"walk": false
				})
				list.append({
					"label": "[Walk] %s (%s)" % [pname, pid],
					"kind": "place_walk",
					"eye": Vector3(px, py + 2.0, pz + 9.0),
					"target": Vector3(px, py, pz),
					"walk": true
				})
			for hp in hpois:
				if not (hp is Dictionary):
					continue
				var vx := float(hp.get("x", px))
				var vz := float(hp.get("z", pz))
				seen_pts.append(Vector2(vx, vz))
				if on_pin and Vector2(vx, vz).distance_to(Vector2(px, pz)) < 80.0:
					continue
				var vy := stream.height_at(vx, vz)
				if not is_finite(vy):
					vy = py
				var focus_str := str(hp.get("focus", "village"))
				var vtag := "Monastery" if focus_str == "monastery" else "Village"
				var vname := str(hp.get("name", hp.get("id", vtag)))
				list.append({
					"label": "[%s] %s" % [vtag, vname],
					"kind": "village",
					"eye": Vector3(vx + 165.0, vy + 105.0, vz + 215.0),
					"target": Vector3(vx, vy + 8.0, vz),
					"walk": false
				})

	# 4. Camp & Village POIs from roads (e.g. all 9 Beast-Rider camps in Pinnacle, village approaches in High Rift)
	for rd in I.get("roads", []):
		var rkind := str(rd.get("kind", ""))
		if not (rkind in ["camp", "village", "hamlet"]):
			continue
		var pts: Array = rd.get("pts", [])
		if pts.is_empty():
			continue
		var p0: Array = pts[0]
		var cx := float(p0[0])
		var cz := float(p0[1])
		var dup := false
		for sp in seen_pts:
			if Vector2(cx, cz).distance_to(sp as Vector2) < 120.0:
				dup = true
				break
		if dup or seen_pts.size() >= 18:
			continue
		seen_pts.append(Vector2(cx, cz))
		var cy := float(p0[2]) if p0.size() >= 3 else stream.height_at(cx, cz)
		if not is_finite(cy):
			cy = 0.0
		var tag := "Camp" if rkind == "camp" else "Village"
		var raw_nm := str(rd.get("from", rd.get("id", tag)))
		var nice_nm := _pretty_id(raw_nm)
		var look_x := float(pts[mini(1, pts.size() - 1)][0])
		var look_z := float(pts[mini(1, pts.size() - 1)][1])
		var dir2 := Vector2(look_x - cx, look_z - cz)
		if dir2.length() < 1.0:
			dir2 = Vector2(0.0, -1.0)
		else:
			dir2 = dir2.normalized()
		list.append({
			"label": "[%s] %s" % [tag, nice_nm],
			"kind": rkind,
			"eye": Vector3(cx - dir2.x * 12.0, cy + 3.0, cz - dir2.y * 12.0),
			"target": Vector3(cx, cy, cz),
			"walk": true
		})

	# 5. Active Pin (when placed)
	if pin_reg is Vector3:
		var pv: Vector3 = pin_reg
		list.append({
			"label": "[Pin] Cursor Pin (%.0f, %.0f)" % [pv.x, pv.z],
			"kind": "pin",
			"eye": pv + Vector3(0.0, 38.0, 68.0),
			"target": pv,
			"walk": false
		})
	return list


func refresh_pois(stream: KratorWorldStream, pin_reg = null) -> void:
	pois = build_pois(stream, pin_reg)
	_syncing = true
	poi_opt.clear()
	poi_opt.add_item("— Select Point of Interest (%d) —" % pois.size(), 0)
	for i in pois.size():
		poi_opt.add_item(str(pois[i]["label"]), i + 1)
	poi_opt.select(0)
	_syncing = false


func _on_poi_idx(item_idx: int) -> void:
	if _syncing or item_idx <= 0 or item_idx - 1 >= pois.size():
		return
	poi_selected.emit(pois[item_idx - 1])


func _step_poi(delta_idx: int) -> void:
	if pois.is_empty():
		return
	var cur := poi_opt.selected - 1
	var nxt := posmod((0 if cur < 0 else cur + delta_idx), pois.size())
	_syncing = true
	poi_opt.select(nxt + 1)
	_syncing = false
	poi_selected.emit(pois[nxt])


func sync_state(W: KratorWorldWalk, region_name: String, minute: float, rate: float, gi_on: bool, has_pin: bool) -> void:
	_syncing = true
	title_lbl.text = "KRATOR HOST — %s" % region_name.to_upper()
	btn_walk.button_pressed = W.walk_mode
	btn_walk.text = "Walk (F)" if W.walk_mode else "Free Fly (F)"
	btn_fp.disabled = not W.walk_mode
	btn_fp.button_pressed = W.first_person
	btn_fp.text = "1st Person (V)" if W.first_person else "3rd Person (V)"
	btn_ride.button_pressed = W.driving
	btn_gi.button_pressed = gi_on
	btn_fly_pin.disabled = not has_pin
	btn_walk_pin.disabled = not has_pin
	btn_clr_pin.disabled = not has_pin
	var hr := fmod(minute, 1440.0) / 60.0
	if not hour_slider.has_focus():
		hour_slider.value = hr
	clock_lbl.text = "D%d %02d:%02d" % [int(minute / 1440.0) + 1, int(hr), int(fmod(minute, 60.0))]
	_select_rate_btn(rate)
	_syncing = false


static func format_coords(W: KratorWorldWalk, indoors: bool, pin_reg: Variant, carts_shown: int) -> String:
	var cr := W.cam_region()
	var lk := W.look_region(50.0)
	var wxz := W.region_xz()
	var focus := W.focus_region_xz()
	var gh := W.stream.height_at(focus.x, focus.y)
	var agl := cr.y - gh if is_finite(gh) else NAN
	var plc := W.stream.place_covering(focus.x, focus.y)
	var src_tag := "8m place:%s" % plc if plc != "" else ("64m %s" % W.stream.covering(focus.x, focus.y) if W.stream.covering(focus.x, focus.y) != "" else "unloaded")
	var mode_str := ("ROAD AUTOPILOT" if W.driving else ("WALK 1st" if W.first_person else "WALK 3rd")) if W.walk_mode else ("FREE FLY (%.0f m/s)" % W.fly_speed_mps())
	if indoors:
		mode_str += "  [INDOORS]"
	var yaw_deg := fposmod(rad_to_deg(W._yaw), 360.0)
	var pitch_deg := rad_to_deg(W._pitch)
	var lines := PackedStringArray()
	lines.append("Mode:   %s" % mode_str)
	lines.append("Cam:    x %8.1f   y %7.1f   z %8.1f  (AGL %s m)" % [cr.x, cr.y, cr.z, "%.1f" % agl if is_finite(agl) else "?"])
	lines.append("Look:   yaw %5.1f°   pitch %+5.1f°   -> [%.0f, %.0f, %.0f]" % [yaw_deg, pitch_deg, lk.x, lk.y, lk.z])
	lines.append("Ground: %s m (%s)   feet %.1f m" % ["%.1f" % gh if is_finite(gh) else "?", src_tag, W.feet_y()])
	if pin_reg is Vector3:
		var pv: Vector3 = pin_reg
		lines.append("Pin:    x %8.1f   y %7.1f   z %8.1f  (%.0f m away)" % [pv.x, pv.y, pv.z, cr.distance_to(pv)])
	else:
		lines.append("Walker: x %8.1f   z %8.1f   (double-click to Pin)" % [wxz.x, wxz.y])
	var draws := RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME)
	var prims := RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_PRIMITIVES_IN_FRAME)
	var open_pl := ", ".join(PackedStringArray(W.stream.places_open.keys()))
	if open_pl == "":
		open_pl = "none"
	var traf := " | carts %d" % carts_shown if carts_shown > 0 else ""
	lines.append("Perf:   %d FPS | %d draws | %.2fM tris | chunks %d | places %s | reb %d%s" % [
		Engine.get_frames_per_second(), draws, float(prims) / 1000000.0,
		W.stream.chunks.size(), open_pl, W.stream.rebases, traf])
	return "\n".join(lines)
