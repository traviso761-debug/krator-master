# The Krator Worlds Gallery, Godot-native (the twin of gallery/index.template.html): every build in this checkout that
# has been ported to Godot (krator/gallery_nav.gd finds them), by register, with a search, and each opened in Godot.
# Every host scene has a "<< Gallery (F2)" button that comes back here.
#   godot --path godot                   (a bare launch opens the Gallery: spike.gd hands over)
#   godot --path godot gallery.tscn
# A build whose data is still a Git LFS pointer (or, for the Character Lab, not built locally) is listed with the
# command that fetches it instead of an Open button that would fail.
extends Control

const BG := Color(0.071, 0.063, 0.051)
const PANEL := Color(0.112, 0.098, 0.074, 0.96)
const BORDER := Color(0.44, 0.31, 0.21, 0.85)
const BRASS := Color(0.90, 0.79, 0.52)
const INK := Color(0.93, 0.89, 0.80)
const MUTED := Color(0.70, 0.63, 0.50)

var entries: Array = []
var section_filter := ""          # "" all, else a SECTIONS key
var ready_only := false
var search: LineEdit
var count_lbl: Label
var status_lbl: Label
var body: VBoxContainer
var scroll: ScrollContainer
var section_btns := {}
var cards: Array = []             # [{entry, node}] in the order drawn
var _status_t := 0.0


class Emblem extends Control:
	# A banded gas giant over the crater rim: the gallery page's mark, drawn
	func _init() -> void:
		custom_minimum_size = Vector2(64, 64)

	func _draw() -> void:
		var c := size * 0.5
		var r := minf(size.x, size.y) * 0.42
		draw_circle(c, r + 3.0, Color(0.44, 0.31, 0.21))
		var bands := [Color(0.82, 0.66, 0.42), Color(0.66, 0.45, 0.28), Color(0.88, 0.76, 0.55), Color(0.58, 0.38, 0.24), Color(0.78, 0.60, 0.38), Color(0.62, 0.43, 0.27)]
		var n := 28
		for i in n:
			var y0 := -r + 2.0 * r * float(i) / float(n)
			var y1 := -r + 2.0 * r * float(i + 1) / float(n)
			var ym := 0.5 * (y0 + y1)
			var hw := sqrt(maxf(0.0, r * r - ym * ym))
			draw_rect(Rect2(c.x - hw, c.y + y0, hw * 2.0, y1 - y0 + 0.6), bands[int(float(i) / float(n) * bands.size() * 1.7) % bands.size()])
		draw_arc(c, r * 1.45, deg_to_rad(200), deg_to_rad(340), 40, Color(0.90, 0.79, 0.52, 0.85), 2.0, true)
		draw_rect(Rect2(0, size.y * 0.80, size.x, size.y * 0.20), Color(0.071, 0.063, 0.051))
		var rim := PackedVector2Array([Vector2(0, size.y * 0.82), Vector2(size.x * 0.22, size.y * 0.74), Vector2(size.x * 0.42, size.y * 0.79),
			Vector2(size.x * 0.63, size.y * 0.70), Vector2(size.x * 0.85, size.y * 0.78), Vector2(size.x, size.y * 0.75)])
		draw_polyline(rim, Color(0.90, 0.79, 0.52), 2.0, true)


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	KratorGalleryNav.pending_entry = {}
	KratorGalleryNav.opened_from_gallery = false
	entries = KratorGalleryNav.discover_entries()
	_build()
	_refresh()
	search.grab_focus.call_deferred()


static func _sb(bg: Color, border: Color, radius := 6, px := 12, py := 10) -> StyleBoxFlat:
	return KratorHostUI._box_style(bg, border, radius, px, py)


func _build() -> void:
	var bgr := ColorRect.new()
	bgr.color = BG
	bgr.set_anchors_preset(Control.PRESET_FULL_RECT)
	bgr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bgr)

	var root := MarginContainer.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right", "top", "bottom"]:
		root.add_theme_constant_override("margin_" + side, 18)
	add_child(root)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 12)
	root.add_child(col)

	# Header
	var hdr := HBoxContainer.new()
	hdr.add_theme_constant_override("separation", 14)
	col.add_child(hdr)
	hdr.add_child(Emblem.new())
	var tv := VBoxContainer.new()
	tv.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hdr.add_child(tv)
	var title := Label.new()
	title.text = "KRATOR WORLDS — GODOT GALLERY"
	title.add_theme_font_size_override("font_size", 26)
	title.add_theme_color_override("font_color", BRASS)
	tv.add_child(title)
	var sub := Label.new()
	sub.text = "Every build ported to Godot in this checkout, opened in the engine. In any world: << Gallery (F2) comes back here."
	sub.add_theme_font_size_override("font_size", 13)
	sub.add_theme_color_override("font_color", MUTED)
	tv.add_child(sub)
	count_lbl = Label.new()
	count_lbl.add_theme_font_size_override("font_size", 13)
	count_lbl.add_theme_color_override("font_color", INK)
	tv.add_child(count_lbl)
	var bq := KratorHostUI._make_btn("Quit", "Close Godot")
	bq.pressed.connect(func(): get_tree().quit())
	hdr.add_child(bq)

	# Toolbar
	var bar := PanelContainer.new()
	bar.add_theme_stylebox_override("panel", _sb(PANEL, BORDER, 6, 10, 8))
	col.add_child(bar)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	bar.add_child(row)
	search = LineEdit.new()
	search.placeholder_text = "Search builds: name, source, tag…  (Enter opens the first, Esc clears)"
	search.custom_minimum_size = Vector2(380, 0)
	search.clear_button_enabled = true
	search.text_changed.connect(func(_t: String): _refresh())
	search.text_submitted.connect(func(_t: String): _open_first())
	row.add_child(search)
	var sb_all := KratorHostUI._make_btn("All", "Every register", true)
	sb_all.pressed.connect(func(): _set_section(""))
	section_btns[""] = sb_all
	row.add_child(sb_all)
	for s in KratorGalleryNav.SECTIONS:
		var key := str(s["key"])
		var b := KratorHostUI._make_btn(str(s["title"]), str(s["note"]), true)
		b.pressed.connect(func(): _set_section(key))
		section_btns[key] = b
		row.add_child(b)
	var sp := Control.new()
	sp.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(sp)
	var br := KratorHostUI._make_btn("Ready only", "Hide builds whose data is not in this checkout yet", true)
	br.toggled.connect(func(on: bool):
		ready_only = on
		_refresh()
	)
	row.add_child(br)

	# Cards
	scroll = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	col.add_child(scroll)
	body = VBoxContainer.new()
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	body.add_theme_constant_override("separation", 10)
	scroll.add_child(body)

	status_lbl = Label.new()
	status_lbl.add_theme_font_size_override("font_size", 12)
	status_lbl.add_theme_color_override("font_color", MUTED)
	status_lbl.text = "Click a card to open it. Data that is still a Git LFS pointer shows the command that fetches it."
	col.add_child(status_lbl)


func _set_section(key: String) -> void:
	section_filter = key
	_refresh()
	scroll.scroll_vertical = 0


func matches(e: Dictionary, q: String) -> bool:
	if section_filter != "" and str(e.get("section", "")) != section_filter:
		return false
	if ready_only and not bool(e.get("ready", false)):
		return false
	if q == "":
		return true
	var hay := " ".join([str(e.get("name", "")), str(e.get("source", "")), str(e.get("tag", "")), str(e.get("blurb", "")), str(e.get("id", ""))]).to_lower()
	for w in q.to_lower().split(" ", false):
		if not hay.contains(w):
			return false
	return true


func _refresh() -> void:
	for k in section_btns:
		section_btns[k].button_pressed = (k == section_filter)
	for c in body.get_children():
		c.queue_free()
	cards.clear()
	var q := search.text.strip_edges() if search != null else ""
	var shown := 0
	var n_ready := 0
	for e in entries:
		if bool(e.get("ready", false)):
			n_ready += 1
	for s in KratorGalleryNav.SECTIONS:
		var key := str(s["key"])
		var list: Array = []
		for e in entries:
			if str(e.get("section", "")) == key and matches(e, q):
				list.append(e)
		if list.is_empty():
			continue
		var h := Label.new()
		h.text = "%s  (%d)" % [str(s["title"]).to_upper(), list.size()]
		h.add_theme_font_size_override("font_size", 16)
		h.add_theme_color_override("font_color", BRASS)
		body.add_child(h)
		var note := Label.new()
		note.text = str(s["note"])
		note.add_theme_font_size_override("font_size", 12)
		note.add_theme_color_override("font_color", MUTED)
		body.add_child(note)
		var flow := HFlowContainer.new()
		flow.add_theme_constant_override("h_separation", 10)
		flow.add_theme_constant_override("v_separation", 10)
		flow.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		body.add_child(flow)
		for e in list:
			var card := _card(e)
			flow.add_child(card)
			cards.append({"entry": e, "node": card})
			shown += 1
	if shown == 0:
		var none := Label.new()
		none.text = "No build matches \"%s\"." % q
		none.add_theme_color_override("font_color", MUTED)
		body.add_child(none)
	count_lbl.text = "%d ported builds, %d ready to open in this checkout%s" % [entries.size(), n_ready,
		("  —  showing %d" % shown) if shown != entries.size() else ""]


func _card(e: Dictionary) -> Control:
	var ready := bool(e.get("ready", false))
	var p := PanelContainer.new()
	p.custom_minimum_size = Vector2(340, 196)
	p.add_theme_stylebox_override("panel", _sb(PANEL, BORDER if ready else Color(0.35, 0.28, 0.22, 0.7), 8, 12, 10))
	p.tooltip_text = str(e.get("id", ""))
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 5)
	p.add_child(v)
	var top := HBoxContainer.new()
	top.add_theme_constant_override("separation", 6)
	v.add_child(top)
	var nm := Label.new()
	nm.text = str(e.get("name", e.get("id", "?")))
	nm.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	nm.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	nm.custom_minimum_size = Vector2(200, 0)
	nm.add_theme_font_size_override("font_size", 15)
	nm.add_theme_color_override("font_color", INK if ready else MUTED)
	top.add_child(nm)
	top.add_child(_badge(str(e.get("tag", "")), Color(0.30, 0.22, 0.10), BRASS))
	if not ready:
		top.add_child(_badge("needs data", Color(0.32, 0.12, 0.08), Color(1.0, 0.62, 0.45)))
	var bl := Label.new()
	bl.text = str(e.get("blurb", ""))
	bl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	bl.custom_minimum_size = Vector2(310, 0)
	bl.size_flags_vertical = Control.SIZE_EXPAND_FILL
	bl.add_theme_font_size_override("font_size", 12)
	bl.add_theme_color_override("font_color", Color(0.84, 0.80, 0.72))
	bl.max_lines_visible = 4
	v.add_child(bl)
	var meta := PackedStringArray()
	if str(e.get("source", "")) != "":
		meta.append(str(e["source"]))
	if float(e.get("mb", 0.0)) > 0.05:
		meta.append("%.1f MB" % float(e["mb"]))
	if int(e.get("tris", 0)) > 0:
		meta.append("%s tris" % _thousands(int(e["tris"])))
	if int(e.get("records", 0)) > 0:
		meta.append("%s records" % _thousands(int(e["records"])))
	var ml := Label.new()
	ml.text = "  ·  ".join(meta)
	ml.add_theme_font_size_override("font_size", 11)
	ml.add_theme_color_override("font_color", MUTED)
	v.add_child(ml)
	var act := HBoxContainer.new()
	v.add_child(act)
	if ready:
		var b := KratorHostUI._make_btn("Open in Godot  →", "Open %s (%s)" % [str(e.get("name", "")), str(e.get("scene", ""))])
		b.add_theme_color_override("font_color", Color(1.0, 0.90, 0.60))
		b.pressed.connect(func(): open(e))
		act.add_child(b)
	else:
		var hint := str(e.get("lfs_hint", ""))
		var b2 := KratorHostUI._make_btn("Copy fetch command", hint)
		b2.pressed.connect(func():
			DisplayServer.clipboard_set(hint)
			_status("Copied: %s   (run it in the repo root, then reopen the Gallery)" % hint)
		)
		act.add_child(b2)
		var b3 := KratorHostUI._make_btn("Try anyway", "Open it without the data: the scene says what is missing")
		b3.pressed.connect(func(): open(e))
		act.add_child(b3)
	return p


static func _thousands(n: int) -> String:
	var s := str(absi(n))
	var out := ""
	while s.length() > 3:
		out = "," + s.right(3) + out
		s = s.left(s.length() - 3)
	return ("-" if n < 0 else "") + s + out


func _badge(txt: String, bg: Color, fg: Color) -> Control:
	var pc := PanelContainer.new()
	pc.add_theme_stylebox_override("panel", _sb(bg, fg.darkened(0.3), 4, 6, 2))
	var l := Label.new()
	l.text = txt
	l.add_theme_font_size_override("font_size", 10)
	l.add_theme_color_override("font_color", fg)
	pc.add_child(l)
	return pc


func open(e: Dictionary) -> void:
	_status("Opening %s…" % str(e.get("name", "")))
	KratorGalleryNav.open_entry(get_tree(), e)


func _open_first() -> void:
	for c in cards:
		if bool(c["entry"].get("ready", false)):
			open(c["entry"])
			return
	_status("No ready build matches the search.")


func _status(t: String) -> void:
	status_lbl.text = t
	_status_t = 6.0


func _process(dt: float) -> void:
	if _status_t > 0.0:
		_status_t -= dt


func _unhandled_input(ev: InputEvent) -> void:
	if ev is InputEventKey and ev.pressed and not ev.echo and (ev as InputEventKey).keycode == KEY_ESCAPE:
		search.text = ""
		_refresh()


func _input(ev: InputEvent) -> void:
	# Esc inside the search box clears it too (the LineEdit keeps the key from _unhandled_input)
	if ev is InputEventKey and ev.pressed and not ev.echo and (ev as InputEventKey).keycode == KEY_ESCAPE and search.has_focus():
		search.text = ""
		_refresh()
		get_viewport().set_input_as_handled()
