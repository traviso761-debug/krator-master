# The Godot-native Host's minimap (krator/minimap.gd, the twin of core/minimap), the Gallery (gallery.tscn,
# krator/gallery_nav.gd) and the Host UI's Gallery and Map buttons (krator/host_ui.gd). Each check has a negative.
#   godot --headless --path godot --script res://tests/gallery/gallery_minimap_test.gd    exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

var fails := 0


func ok(name: String, pass_: bool, neg: bool, detail := "") -> void:
	var r := pass_ and neg
	if not r:
		fails += 1
	print(("PASS  " if r else "FAIL  ") + name + ("  (" + detail + ")" if detail != "" else "")
		+ ("  [its negative did not fail]" if pass_ and not neg else ""))


func _mean_luma(img: Image) -> float:
	var t := 0.0
	for y in img.get_height():
		for x in img.get_width():
			var c := img.get_pixel(x, y)
			t += c.r + c.g + c.b
	return t / float(img.get_width() * img.get_height() * 3)


var _frames := 0
var _ui_done := false


func _initialize() -> void:
	_minimap_checks()
	_catch_bowl_map_checks()
	_gallery_nav_checks()
	_spike_route_checks()


# the UI checks run on the first frame, once the root is in the tree and the nodes' _ready has run
func _process(_dt: float) -> bool:
	_frames += 1
	if _frames == 1:
		_ui_checks()
		_ui_done = true
		return false
	if _frames < 3:
		return false
	if not _ui_done:
		fails += 1
		print("FAIL  the UI checks ran to the end")
	print("%s: %d failed" % ["FAIL" if fails > 0 else "PASS", fails])
	quit(1 if fails > 0 else 0)
	return true


func _minimap_checks() -> void:
	var mm := KratorMinimap.new(256.0)
	mm.set_frame(0.0, 1000.0, 0.0, 500.0)
	# 1: the frame is widened to a square, and to_px / to_world are inverses
	var f: Array = mm.base_frame
	var p := mm.to_px(250.0, 400.0)
	var w := mm.to_world(p.x, p.y)
	ok("the frame is square and to_px/to_world round-trip",
		is_equal_approx(float(f[1]) - float(f[0]), float(f[3]) - float(f[2])) and w.distance_to(Vector2(250, 400)) < 0.01,
		mm.to_px(250.0, 400.0).distance_to(mm.to_px(400.0, 250.0)) > 1.0,
		"frame %s, %s -> %s" % [str(f), str(p), str(w)])

	# 2: the primitives, and pick takes the topmost by (y, seq)
	mm.add_rect(0, 100, 0, 100, {"tag": "building", "name": "Hall", "y": 1.0})
	mm.add_disc(50, 50, 10, {"tag": "site", "name": "Well", "y": 5.0})
	mm.add_obb(300, 300, 20, 5, 0.0, {"tag": "building", "name": "Long house", "y": 1.0})
	mm.add_strip(Vector2(500, 0), Vector2(500, 400), 12.0, {"tag": "road", "name": "North road", "y": 2.0})
	mm.add_poly([Vector2(700, 100), Vector2(800, 100), Vector2(750, 200)], {"tag": "floor", "name": "Yard", "y": 0.5})
	mm.add_label(900, 300, "Label only")
	var a := mm.pick(50, 50)
	var b := mm.pick(90, 90)
	ok("pick is topmost: the disc over the rect at its centre, the rect beside it",
		str(a.get("name", "")) == "Well" and str(b.get("name", "")) == "Hall",
		str(mm.pick(500, 500).get("name", "")) == "", "%s / %s" % [a.get("name"), b.get("name")])
	ok("obb, strip and poly hit inside and miss outside",
		str(mm.pick(315, 302).get("name", "")) == "Long house" and str(mm.pick(503, 200).get("name", "")) == "North road" and str(mm.pick(750, 150).get("name", "")) == "Yard",
		mm.pick(300, 310).is_empty() and mm.pick(520, 200).is_empty() and mm.pick(710, 190).is_empty())
	ok("a label is drawn last and never picked",
		str(mm.ordered_records()[-1].get("kind", "")) == "label", mm.pick(900, 300).is_empty())
	var ord := mm.ordered_records()
	var sorted_ok := true
	for i in range(1, ord.size()):
		if float(ord[i]["y"]) < float(ord[i - 1]["y"]):
			sorted_ok = false
	ok("records draw in (y, seq) order", sorted_ok, float(ord[0]["y"]) < float(ord[-1]["y"]))

	# 3: the relief is lit from the north-west: ground rising to the NW is brighter than ground rising to the SE
	var r := KratorMinimap.new(256.0)
	r.set_frame(0, 1000, 0, 1000)
	r.build_relief_from_callable(func(x: float, z: float) -> float: return -(x + z) * 0.1, 0.0, 32, false)
	var nw := _mean_luma(r.relief_img)
	r.build_relief_from_callable(func(x: float, z: float) -> float: return (x + z) * 0.1, 0.0, 32, false)
	var se := _mean_luma(r.relief_img)
	r.build_relief_from_callable(func(_x: float, _z: float) -> float: return 5.0, 0.0, 32, false)
	var flat := r.relief_img
	ok("the relief is NW-lit (NW-facing brighter than SE-facing)", nw > se + 0.02,
		flat.get_pixel(0, 0) == flat.get_pixel(31, 31), "nw %.3f se %.3f" % [nw, se])
	r.build_relief_from_callable(func(x: float, _z: float) -> float: return x - 500.0, 0.0, 32, true)
	var wl := r.relief_img.get_pixel(2, 16)
	var dl := r.relief_img.get_pixel(29, 16)
	ok("water (west, below 0) is blue, land (east) is not", wl.b > wl.r, not (dl.b > dl.r), "water %s land %s" % [str(wl), str(dl)])

	# 4: the viewer, the zoom follows it, and a click maps back to the world
	mm.set_viewer(Vector2(800, 200), Vector2(0, -1))
	mm.zoom = 4.0
	var af := mm.active_frame()
	var c := Vector2(0.5 * (float(af[0]) + float(af[1])), 0.5 * (float(af[2]) + float(af[3])))
	mm.follow_viewer = false
	var af2 := mm.active_frame()
	var c2 := Vector2(0.5 * (float(af2[0]) + float(af2[1])), 0.5 * (float(af2[2]) + float(af2[3])))
	ok("zoomed in, the map follows the viewer (and stops when Follow is off)", c.distance_to(Vector2(800, 200)) < 0.01,
		c2.distance_to(Vector2(800, 200)) > 1.0, "centre %s, unfollowed %s" % [str(c), str(c2)])
	mm.free()
	r.free()


func _catch_bowl_map_checks() -> void:
	var f := FileAccess.open("res://data/catch-bowl/meta.json", FileAccess.READ)
	if f == null:
		ok("catch-bowl data present for the map checks", false, true, "no res://data/catch-bowl/meta.json")
		return
	var meta: Dictionary = JSON.parse_string(f.get_as_text())
	f.close()
	var gs := GDScript.new()
	gs.source_code = "extends Node3D\nfunc height_at(_x: float, _z: float) -> float:\n\treturn 0.0\n"
	gs.reload()
	var cb := Node3D.new()
	cb.set_script(gs)
	var mm := KratorMinimap.new(256.0)
	mm.populate_from_catch_bowl(cb, meta)
	var names := {}
	var routes := 0
	for rec in mm.records:
		names[str(rec.get("name", ""))] = true
		if str(rec.get("kind", "")) == "strip":
			routes += 1
	var bad := []
	for n in names:
		var nl := str(n).to_lower()
		if nl.contains("hub 01") or nl.contains("pressure"):
			bad.append(n)
	ok("the Catch map never names Hub 01 or the pressure", bad.is_empty(), names.has("Ranger HQ"), "bad %s" % str(bad))
	ok("the ruin is on the map, unmarked", names.has("Unmarked Ancient Ruin"), not names.has("Hub 01"))
	# no route reaches the ruin: every strip end stays well clear of it
	var ruin := Vector2.INF
	var box_px: Array = meta.get("box_px", [0, 0, 0, 0])
	for s in meta.get("sites", []):
		if bool(s.get("ancient_ruin", false)):
			ruin = Vector2((float(s["px"]) - float(box_px[0])) * 2000.0, (float(s["py"]) - float(box_px[1])) * 2000.0)
	var nearest := INF
	for rec in mm.records:
		if str(rec.get("kind", "")) == "strip":
			for e in [rec["a"], rec["b"]]:
				nearest = minf(nearest, Vector2(float(e[0]), float(e[1])).distance_to(ruin))
	ok("no road or trail on the map reaches the ruin", ruin != Vector2.INF and nearest > 8000.0, routes > 0,
		"%d route strips, nearest end %.0f m" % [routes, nearest])
	mm.free()
	cb.free()


func _gallery_nav_checks() -> void:
	var es := KratorGalleryNav.discover_entries()
	var secs := {}
	var ids := {}
	var dup := 0
	for e in es:
		secs[str(e.get("section", ""))] = true
		if ids.has(e["id"]):
			dup += 1
		ids[e["id"]] = true
	ok("the Gallery finds the ported builds in every register", es.size() >= 28 and secs.size() >= 5 and dup == 0,
		not secs.has(""), "%d entries, sections %s, %d duplicate ids" % [es.size(), str(secs.keys()), dup])
	var cb := {}
	for e in es:
		if str(e["id"]) == "native:catch-bowl":
			cb = e
	ok("the catch-bowl host is listed with its scene", str(cb.get("scene", "")) == "res://catch_bowl.tscn",
		not ids.has("native:nowhere"))
	# readiness follows the files: a pointer header is an LFS pointer, real JSON is not
	var tmp := FileAccess.open("user://lfs_probe.bin", FileAccess.WRITE)
	tmp.store_string("version https://git-lfs.github.com/spec/v1\noid sha256:00\nsize 1\n")
	tmp.close()
	ok("an LFS pointer is told from data", KratorGalleryNav.is_lfs_pointer("user://lfs_probe.bin"),
		not KratorGalleryNav.is_lfs_pointer("res://data/catch-bowl/meta.json"))
	var consistent := true
	var n_ready := 0
	for e in es:
		if bool(e["ready"]):
			n_ready += 1
		if str(e.get("data_dir", "")) != "" and str(e["id"]) != "lab:characters":
			var info := KratorGalleryNav.inspect_data_dir(str(e["data_dir"]))
			if bool(info["ready"]) != bool(e["ready"]):
				consistent = false
		if not bool(e["ready"]) and str(e.get("lfs_hint", "")) == "":
			consistent = false
	ok("each entry's ready flag matches its files, and every unready one carries a fetch command", consistent, n_ready > 0,
		"%d of %d ready" % [n_ready, es.size()])


func _spike_route_checks() -> void:
	var S = load("res://spike.gd")
	ok("spike routes a world.json folder to the krator-world importer",
		S.route_for("world-longsong", "res://data/world-longsong/") == "world" and S.route_for("dhelv", "res://data/dhelv/") == "dhelv",
		S.route_for("no-such-case", "res://data/no-such-case/") == "")
	var cases: Array = S.all_cases()
	ok("spike's case list holds its own cases and the ported worlds", cases.has("dhelv") and cases.has("world-longsong"),
		not cases.has("ground_layers"), "%d cases" % cases.size())


func _ui_checks() -> void:
	var ui := KratorHostUI.new()
	root.add_child(ui)
	ok("the Host UI has the Gallery button, the Map button and the minimap",
		ui.btn_gallery != null and ui.btn_map != null and ui.minimap is KratorMinimap and ui.minimap_panel.visible,
		ui.btn_gallery.text.contains("Gallery"))
	ui.toggle_minimap()
	var closed := not ui.minimap_panel.visible and not ui.btn_map.button_pressed
	ui.set_chrome_visible(false)
	ui.set_chrome_visible(true)
	var still_closed := not ui.minimap_panel.visible
	ui.toggle_minimap()
	ok("M closes and opens the map, and restoring the chrome keeps a closed map closed", closed and still_closed and ui.minimap_panel.visible,
		ui.minimap_open)
	var picked := []
	ui.minimap_picked.connect(func(xz: Vector2, sh: bool, _r: Dictionary): picked.append([xz, sh]))
	ui.minimap.map_clicked.emit(Vector2(10, 20), true, {})
	ok("a map click reaches the host as minimap_picked", picked.size() == 1 and picked[0][0] == Vector2(10, 20) and picked[0][1] == true,
		picked.size() != 2)
	ui.queue_free()

	var g: Control = load("res://gallery.tscn").instantiate()
	root.add_child(g)
	var all_n: int = g.cards.size()
	g.search.text = "catch"
	g._refresh()
	var found := false
	for c in g.cards:
		if str(c["entry"]["id"]) == "native:catch-bowl":
			found = true
	var catch_n: int = g.cards.size()
	g.search.text = "zzqqxx-nothing"
	g._refresh()
	ok("the Gallery draws a card per build and its search filters them", all_n >= 28 and found and catch_n < all_n,
		g.cards.size() == 0, "%d cards, %d for 'catch'" % [all_n, catch_n])
	g.search.text = ""
	g._set_section("lab")
	var labs_only := true
	for c in g.cards:
		if str(c["entry"]["section"]) != "lab":
			labs_only = false
	ok("a register filter shows only that register", labs_only and g.cards.size() >= 1, g.cards.size() < all_n)
	g.queue_free()
