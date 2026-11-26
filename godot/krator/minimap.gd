# Godot-native twin of core/minimap/88-core-minimap.js + 88a-core-minimap-host.js.
# Draws a 2D plan of any ported Krator world from plain data records and terrain relief (never extra 3D render passes):
#   - Hill-shaded NW-lit elevation + water relief texture (`ImageTexture`)
#   - All 6 KMAP primitives sorted by (y, seq): `rect`, `obb`, `strip`, `disc`, `poly`, `label`
#   - Interactive zoom (mouse wheel or +/-), viewer-follow vs middle/right-drag pan
#   - Hover feature hit-testing (`pick(x, z)`) and click-to-jump (`map_clicked(world_xz, shift_pressed, record)`)
#   - Live viewer position dot, view-direction cone, active 3D cursor pin, and moving entity dots (carts/caravans)
# Axes: x east, z south, metres; on the map north (-z) is up.
class_name KratorMinimap
extends Control

signal map_clicked(world_xz: Vector2, shift_pressed: bool, picked_record: Dictionary)
signal hover_changed(text: String, world_xz: Vector2)

var base_frame := [-1000.0, 1000.0, -1000.0, 1000.0]   # [x0, x1, z0, z1] widened to square aspect
var bg_color := Color(0.063, 0.078, 0.094, 1.0)         # #101418
var fallback_color := Color(0.604, 0.565, 0.502, 0.90)  # #9a9080
var palette := {
	"building": Color(0.84, 0.72, 0.52, 0.92),
	"arcology": Color(0.92, 0.78, 0.42, 0.96),
	"monastery": Color(0.88, 0.58, 0.36, 0.95),
	"road": Color(0.76, 0.66, 0.48, 0.88),
	"highway": Color(0.88, 0.76, 0.52, 0.94),
	"trail": Color(0.68, 0.58, 0.42, 0.78),
	"underground": Color(0.46, 0.78, 0.88, 0.78),
	"water": Color(0.18, 0.40, 0.58, 0.90),
	"floor": Color(0.56, 0.53, 0.47, 0.82),
	"cavern": Color(0.42, 0.38, 0.50, 0.78),
	"camp": Color(0.86, 0.52, 0.28, 0.92),
	"outlaw": Color(0.86, 0.28, 0.24, 0.92),
	"site": Color(0.94, 0.82, 0.46, 0.95),
	"flora": Color(0.28, 0.48, 0.28, 0.65),
}

var records: Array = []          # sorted on demand when _dirty_order is true
var _ordered: Array = []
var _seq := 0
var _dirty_order := false

var relief_tex: ImageTexture = null
var relief_img: Image = null     # the relief's pixels, kept CPU-side (tests read them; a headless texture has none)
var relief_frame := [-1000.0, 1000.0, -1000.0, 1000.0]

# View state (zoom & pan inside base_frame)
var zoom := 1.0
var follow_viewer := true
var pan_center := Vector2.ZERO
var _panning := false
var _pan_last := Vector2.ZERO

# Dynamic overlays
var has_viewer := false
var viewer_xz := Vector2.ZERO
var viewer_dir := Vector2(0.0, -1.0)
var has_pin := false
var pin_xz := Vector2.ZERO
var dynamic_dots: Array = []     # [{x, z, col: Color, r: float}]
var hover_text := ""
var hover_xz := Vector2.ZERO
var _mouse_inside := false


func _init(p_size := 256.0) -> void:
	custom_minimum_size = Vector2(p_size, p_size)
	size = Vector2(p_size, p_size)
	clip_contents = true
	mouse_filter = Control.MOUSE_FILTER_STOP
	mouse_default_cursor_shape = Control.CURSOR_CROSS


func clear() -> void:
	records.clear()
	_ordered.clear()
	_seq = 0
	_dirty_order = false
	relief_tex = null
	dynamic_dots.clear()
	hover_text = ""
	zoom = 1.0
	follow_viewer = true
	queue_redraw()


func set_frame(x0: float, x1: float, z0: float, z1: float) -> void:
	var ax0 := minf(x0, x1)
	var ax1 := maxf(x0, x1)
	var az0 := minf(z0, z1)
	var az1 := maxf(z0, z1)
	var w := maxf(1.0, ax1 - ax0)
	var d := maxf(1.0, az1 - az0)
	if w > d:
		var cz := 0.5 * (az0 + az1)
		az0 = cz - w * 0.5
		az1 = cz + w * 0.5
	elif d > w:
		var cx := 0.5 * (ax0 + ax1)
		ax0 = cx - d * 0.5
		ax1 = cx + d * 0.5
	base_frame = [ax0, ax1, az0, az1]
	pan_center = Vector2(0.5 * (ax0 + ax1), 0.5 * (az0 + az1))
	queue_redraw()


func active_frame() -> Array:
	var base_span := maxf(1.0, float(base_frame[1]) - float(base_frame[0]))
	var z := clampf(zoom, 0.35, 32.0)
	var span := base_span / z
	var c := viewer_xz if (follow_viewer and has_viewer and z > 1.02) else pan_center
	if follow_viewer and not (has_viewer and z > 1.02):
		c = Vector2(0.5 * (float(base_frame[0]) + float(base_frame[1])), 0.5 * (float(base_frame[2]) + float(base_frame[3])))
	return [c.x - span * 0.5, c.x + span * 0.5, c.y - span * 0.5, c.y + span * 0.5]


func to_px(wx: float, wz: float, f: Array = []) -> Vector2:
	var af := active_frame() if f.is_empty() else f
	var span := maxf(1e-4, float(af[1]) - float(af[0]))
	var s := minf(size.x, size.y)
	if s <= 1.0:
		s = maxf(custom_minimum_size.x, 256.0)
	return Vector2((wx - float(af[0])) / span * s, (wz - float(af[2])) / span * s)


func to_world(px: float, py: float, f: Array = []) -> Vector2:
	var af := active_frame() if f.is_empty() else f
	var span := maxf(1e-4, float(af[1]) - float(af[0]))
	var s := minf(size.x, size.y)
	if s <= 1.0:
		s = maxf(custom_minimum_size.x, 256.0)
	return Vector2(float(af[0]) + px / s * span, float(af[2]) + py / s * span)


func _parse_col(v, tag: String) -> Color:
	if v is Color:
		return v
	if v is String and v != "":
		return Color.from_string(v, palette.get(tag, fallback_color))
	return palette.get(tag, fallback_color)


func _add_rec(r: Dictionary, opts: Dictionary = {}) -> Dictionary:
	var tag := str(opts.get("tag", r.get("tag", "")))
	r["tag"] = tag
	r["col"] = _parse_col(opts.get("col", r.get("col", null)), tag)
	r["y"] = float(opts.get("y", r.get("y", 0.0)))
	r["name"] = str(opts.get("name", r.get("name", "")))
	r["seq"] = _seq
	_seq += 1
	records.append(r)
	_dirty_order = true
	return r


func add_rect(x0: float, x1: float, z0: float, z1: float, opts: Dictionary = {}) -> Dictionary:
	return _add_rec({"kind": "rect", "rect": [minf(x0, x1), maxf(x0, x1), minf(z0, z1), maxf(z0, z1)]}, opts)


func add_obb(x: float, z: float, hx: float, hz: float, ry: float, opts: Dictionary = {}) -> Dictionary:
	return _add_rec({"kind": "obb", "x": x, "z": z, "hx": absf(hx), "hz": absf(hz), "ry": ry}, opts)


func add_strip(a: Vector2, b: Vector2, w: float, opts: Dictionary = {}) -> Dictionary:
	return _add_rec({"kind": "strip", "a": [a.x, a.y], "b": [b.x, b.y], "w": maxf(0.5, w)}, opts)


func add_disc(x: float, z: float, r: float, opts: Dictionary = {}) -> Dictionary:
	return _add_rec({"kind": "disc", "x": x, "z": z, "r": maxf(0.5, r)}, opts)


func add_poly(pts: Array, opts: Dictionary = {}) -> Dictionary:
	if pts.size() < 3:
		return {}
	var clean := []
	for p in pts:
		if p is Vector2:
			clean.append([p.x, p.y])
		elif p is Array and p.size() >= 2:
			clean.append([float(p[0]), float(p[1])])
	if clean.size() < 3:
		return {}
	return _add_rec({"kind": "poly", "pts": clean}, opts)


func add_label(x: float, z: float, text: String, opts: Dictionary = {}) -> Dictionary:
	var r := _add_rec({"kind": "label", "x": x, "z": z, "text": text, "size": int(opts.get("size", 10))}, opts)
	r["y"] = 1e9
	return r


func ordered_records() -> Array:
	if _dirty_order:
		_ordered = records.duplicate()
		_ordered.sort_custom(func(p: Dictionary, q: Dictionary) -> bool:
			var py := float(p.get("y", 0.0))
			var qy := float(q.get("y", 0.0))
			if not is_equal_approx(py, qy):
				return py < qy
			return int(p.get("seq", 0)) < int(q.get("seq", 0))
		)
		_dirty_order = false
	return _ordered


static func _inside_rec(r: Dictionary, x: float, z: float) -> bool:
	var k := str(r.get("kind", ""))
	if k == "rect":
		var rc: Array = r["rect"]
		return x >= float(rc[0]) and x <= float(rc[1]) and z >= float(rc[2]) and z <= float(rc[3])
	elif k == "disc":
		var dx := x - float(r["x"])
		var dz := z - float(r["z"])
		var rad := float(r["r"])
		return dx * dx + dz * dz <= rad * rad
	elif k == "obb":
		var dx := x - float(r["x"])
		var dz := z - float(r["z"])
		var ry := float(r["ry"])
		var c := cos(ry)
		var s := sin(ry)
		var lx := dx * c - dz * s
		var lz := dx * s + dz * c
		return absf(lx) <= float(r["hx"]) and absf(lz) <= float(r["hz"])
	elif k == "strip":
		var a: Array = r["a"]
		var b: Array = r["b"]
		var ax := float(a[0]); var az := float(a[1])
		var ex := float(b[0]) - ax; var ez := float(b[1]) - az
		var l2 := ex * ex + ez * ez
		var t := ((x - ax) * ex + (z - az) * ez) / l2 if l2 > 0.0 else 0.0
		if t < 0.0 or t > 1.0:
			return false
		var px := ax + ex * t - x
		var pz := az + ez * t - z
		var hw := maxf(float(r["w"]) * 0.5, 2.0)
		return px * px + pz * pz <= hw * hw
	elif k == "poly":
		var pts: Array = r["pts"]
		var inside := false
		var j := pts.size() - 1
		for i in pts.size():
			var u: Array = pts[i]
			var v: Array = pts[j]
			var ux := float(u[0]); var uz := float(u[1])
			var vx := float(v[0]); var vz := float(v[1])
			if ((uz > z) != (vz > z)) and (x < (vx - ux) * (z - uz) / (vz - uz) + ux):
				inside = not inside
			j = i
		return inside
	return false


func pick(x: float, z: float) -> Dictionary:
	var ord := ordered_records()
	for idx in range(ord.size() - 1, -1, -1):
		var r: Dictionary = ord[idx]
		if str(r.get("kind", "")) == "label":
			continue
		if (str(r.get("name", "")) != "" or str(r.get("tag", "")) != "") and _inside_rec(r, x, z):
			return r
	return {}


# Builds a NW-lit hill-shaded + water ImageTexture matching 88-core-minimap.js `reliefOf`
func build_relief_from_callable(h_fn: Callable, water_y := 0.0, grid_n := 128, has_water := true) -> void:
	var n := clampi(grid_n, 8, 512)
	var x0 := float(base_frame[0])
	var x1 := float(base_frame[1])
	var z0 := float(base_frame[2])
	var z1 := float(base_frame[3])
	var span := maxf(1.0, x1 - x0)
	var step := span / float(n)
	var H := PackedFloat32Array()
	H.resize((n + 1) * (n + 1))
	var lo := INF
	var hi := -INF
	for j in range(n + 1):
		var wz := z0 + float(j) * step
		for i in range(n + 1):
			var wx := x0 + float(i) * step
			var hv := float(h_fn.call(wx, wz))
			if not is_finite(hv):
				hv = water_y - 0.01 if has_water else 0.0
			H[j * (n + 1) + i] = hv
			if not has_water or hv >= water_y:
				lo = minf(lo, hv)
				hi = maxf(hi, hv)
	if not (hi > lo):
		lo = water_y if has_water else 0.0
		hi = lo + 1.0
	var bytes := PackedByteArray()
	bytes.resize(n * n * 3)
	for j in n:
		for i in n:
			var a := H[j * (n + 1) + i]
			var b := H[j * (n + 1) + i + 1]
			var c := H[(j + 1) * (n + 1) + i]
			var d := H[(j + 1) * (n + 1) + i + 1]
			var m := 0.25 * (a + b + c + d)
			var k := (j * n + i) * 3
			if has_water and m < water_y:
				var dep := clampf((water_y - m) / 20.0, 0.0, 1.0)
				bytes[k] = clampi(int(34.0 - dep * 14.0), 0, 255)
				bytes[k + 1] = clampi(int(62.0 - dep * 20.0), 0, 255)
				bytes[k + 2] = clampi(int(82.0 - dep * 16.0), 0, 255)
				continue
			var t := clampf((m - lo) / (hi - lo), 0.0, 1.0)
			var sx := ((b + d) - (a + c)) / (2.0 * step)
			var sz := ((c + d) - (a + b)) / (2.0 * step)
			var shade := clampf(1.0 + (-sx - sz) * 0.9, 0.55, 1.25)
			bytes[k] = clampi(int((70.0 + t * 70.0) * shade), 0, 255)
			bytes[k + 1] = clampi(int((74.0 + t * 58.0) * shade), 0, 255)
			bytes[k + 2] = clampi(int((60.0 + t * 48.0) * shade), 0, 255)
	var img := Image.create_from_data(n, n, false, Image.FORMAT_RGB8, bytes)
	relief_img = img
	relief_tex = ImageTexture.create_from_image(img)
	relief_frame = base_frame.duplicate()
	queue_redraw()


# Loads a `krator-minimap` export dictionary directly (`M.export()` from 88-core-minimap.js)
func load_kmap_export(doc: Dictionary) -> void:
	clear()
	if doc.get("frame") is Array and (doc["frame"] as Array).size() >= 4:
		var fr: Array = doc["frame"]
		set_frame(float(fr[0]), float(fr[1]), float(fr[2]), float(fr[3]))
	if doc.get("relief") is Dictionary:
		var rel: Dictionary = doc["relief"]
		var n := int(rel.get("n", 0))
		var rgb = rel.get("rgb")
		if n >= 2 and rgb is Array and (rgb as Array).size() >= n * n * 3:
			var arr: Array = rgb
			var bytes := PackedByteArray()
			bytes.resize(n * n * 3)
			for idx in n * n * 3:
				bytes[idx] = clampi(int(arr[idx]), 0, 255)
			var img := Image.create_from_data(n, n, false, Image.FORMAT_RGB8, bytes)
			relief_img = img
			relief_tex = ImageTexture.create_from_image(img)
			relief_frame = base_frame.duplicate()
	for r in doc.get("records", []):
		if not (r is Dictionary):
			continue
		var k := str(r.get("kind", ""))
		var opts := {"tag": r.get("tag", ""), "col": r.get("col", ""), "y": r.get("y", 0.0), "name": r.get("name", ""), "size": r.get("size", 10)}
		match k:
			"rect":
				var rc: Array = r.get("rect", [0, 1, 0, 1])
				add_rect(float(rc[0]), float(rc[1]), float(rc[2]), float(rc[3]), opts)
			"obb":
				add_obb(float(r.get("x", 0)), float(r.get("z", 0)), float(r.get("hx", 1)), float(r.get("hz", 1)), float(r.get("ry", 0)), opts)
			"strip":
				var a: Array = r.get("a", [0, 0]); var b: Array = r.get("b", [1, 1])
				add_strip(Vector2(float(a[0]), float(a[1])), Vector2(float(b[0]), float(b[1])), float(r.get("w", 2.0)), opts)
			"disc":
				add_disc(float(r.get("x", 0)), float(r.get("z", 0)), float(r.get("r", 2.0)), opts)
			"poly":
				add_poly(r.get("pts", []), opts)
			"label":
				add_label(float(r.get("x", 0)), float(r.get("z", 0)), str(r.get("text", "")), opts)
	queue_redraw()


# Populates floors from a KWALK export (`walk.json`: `rect`, `strip`, `poly`)
func add_from_walk(walk_doc: Dictionary) -> int:
	var added := 0
	for fl in walk_doc.get("floors", []):
		if not (fl is Dictionary):
			continue
		var k := str(fl.get("kind", ""))
		var fy := 0.0
		if k == "rect":
			fy = float(fl.get("y", 0.0))
		elif k == "strip":
			var a0: Array = fl.get("a", [0, 0, 0]); var b0: Array = fl.get("b", [0, 0, 0])
			fy = 0.5 * (float(a0[2] if a0.size() >= 3 else 0.0) + float(b0[2] if b0.size() >= 3 else 0.0))
		elif k == "poly":
			var pts0: Array = fl.get("pts", [])
			if pts0.size() < 3:
				continue
			for p in pts0:
				fy += float(p[2] if (p is Array and p.size() >= 3) else 0.0)
			fy /= float(pts0.size())
		else:
			continue
		var t_elev := clampf((fy + 20.0) / 80.0, 0.0, 1.0)
		var col := Color(0.36 + t_elev * 0.28, 0.34 + t_elev * 0.24, 0.30 + t_elev * 0.18, 0.85)
		var opts := {"y": fy, "col": col, "tag": str(fl.get("tag", "floor")), "name": str(fl.get("name", fl.get("tag", "walk floor")))}
		if k == "rect":
			var rc: Array = fl["rect"]
			add_rect(float(rc[0]), float(rc[1]), float(rc[2]), float(rc[3]), opts)
			added += 1
		elif k == "strip":
			var sa: Array = fl["a"]; var sb: Array = fl["b"]
			add_strip(Vector2(float(sa[0]), float(sa[1])), Vector2(float(sb[0]), float(sb[1])), float(fl.get("w", 2.5)), opts)
			added += 1
		elif k == "poly":
			add_poly(fl["pts"], opts)
			added += 1
	return added


# Populates from a streamed open world (`KratorWorldStream`: `world-oidong-highrift`, `world-pinnacle`, etc.)
func populate_from_stream(stream: KratorWorldStream) -> void:
	clear()
	if stream == null or stream.index.is_empty():
		return
	var I: Dictionary = stream.index
	var bx0 := INF; var bz0 := INF; var bx1 := -INF; var bz1 := -INF
	for c in I.get("chunk", {}).get("list", []):
		if c.get("box") is Array:
			var cb: Array = c["box"]
			bx0 = minf(bx0, float(cb[0])); bz0 = minf(bz0, float(cb[1]))
			bx1 = maxf(bx1, float(cb[2])); bz1 = maxf(bz1, float(cb[3]))
	for p in I.get("places", []):
		if p.get("box") is Array:
			var pb: Array = p["box"]
			bx0 = minf(bx0, float(pb[0])); bz0 = minf(bz0, float(pb[1]))
			bx1 = maxf(bx1, float(pb[2])); bz1 = maxf(bz1, float(pb[3]))
	if not is_finite(bx0):
		bx0 = -4000.0; bx1 = 4000.0; bz0 = -4000.0; bz1 = 4000.0
	set_frame(bx0, bx1, bz0, bz1)

	# Build relief from currently loaded chunks/horizon or coarse chunk heights
	build_relief_from_callable(func(wx: float, wz: float) -> float:
		var h := stream.height_at(wx, wz)
		return h if is_finite(h) else NAN
	, 0.0, 96, false)

	# Roads & links
	var span := maxf(1.0, float(base_frame[1]) - float(base_frame[0]))
	var vis_w := clampf(span * 0.0045, 6.0, 140.0)
	for rd in I.get("roads", []):
		if not (rd is Dictionary):
			continue
		var pts: Array = rd.get("pts", [])
		var rkind := str(rd.get("kind", "road"))
		var rname := str(rd.get("name", rd.get("id", rkind)))
		var step_i := maxi(1, int(pts.size() / 90))
		var i := 0
		while i + 1 < pts.size():
			var j := mini(i + step_i, pts.size() - 1)
			var p0: Array = pts[i]; var p1: Array = pts[j]
			add_strip(Vector2(float(p0[0]), float(p0[1])), Vector2(float(p1[0]), float(p1[1])),
				vis_w * (1.35 if rkind == "highway" else 0.85),
				{"tag": "highway" if rkind == "highway" else ("camp" if rkind == "camp" else "road"), "y": 5.0, "name": rname})
			i = j

	# Places, arcologies, monasteries, and hamlets
	var disc_r := clampf(span * 0.012, 35.0, 420.0)
	for pl in I.get("places", []):
		if not (pl is Dictionary):
			continue
		var pid := str(pl.get("id", ""))
		var pname := str(pl.get("name", pid))
		if pl.get("box") is Array:
			var pb2: Array = pl["box"]
			add_rect(float(pb2[0]), float(pb2[2]), float(pb2[1]), float(pb2[3]),
				{"tag": "floor", "col": Color(0.32, 0.30, 0.24, 0.28), "y": 1.0, "name": pname})
		if pl.get("pin") is Array:
			var pn: Array = pl["pin"]
			var px := float(pn[0]); var pz := float(pn[1])
			var ptag := "arcology" if pl.has("arcology") else ("monastery" if pl.has("monastery") else "site")
			add_disc(px, pz, disc_r, {"tag": ptag, "y": 20.0, "name": "%s (%s)" % [pname, pid]})
			add_label(px, pz - disc_r * 1.35, pname, {"size": 10})
		for hp in pl.get("hamlet_pois", []):
			if hp is Dictionary:
				var hx := float(hp.get("x", 0.0)); var hz := float(hp.get("z", 0.0))
				var hnm := str(hp.get("name", hp.get("id", "Village")))
				add_disc(hx, hz, disc_r * 0.65, {"tag": "building", "y": 18.0, "name": hnm})

	# Zoom in around viewer by default on giant multi-100km regions so local roads/towns read clearly
	if span > 25000.0:
		zoom = clampf(span / 12000.0, 2.0, 12.0)
	queue_redraw()


# Refresh streamed terrain relief around current active frame when new chunks stream in
func refresh_stream_relief(stream: KratorWorldStream) -> void:
	if stream == null:
		return
	var af := active_frame()
	var n := 96
	var x0 := float(af[0]); var x1 := float(af[1])
	var z0 := float(af[2]); var z1 := float(af[3])
	var span := maxf(1.0, x1 - x0)
	var step := span / float(n)
	var H := PackedFloat32Array()
	H.resize((n + 1) * (n + 1))
	var lo := INF; var hi := -INF
	var valid := 0
	for j in range(n + 1):
		var wz := z0 + float(j) * step
		for i in range(n + 1):
			var wx := x0 + float(i) * step
			var hv := stream.height_at(wx, wz)
			if is_finite(hv):
				valid += 1
				lo = minf(lo, hv)
				hi = maxf(hi, hv)
			H[j * (n + 1) + i] = hv
	if valid == 0:
		return
	if not (hi > lo):
		hi = lo + 1.0
	var bytes := PackedByteArray()
	bytes.resize(n * n * 3)
	for j in n:
		for i in n:
			var a := H[j * (n + 1) + i]
			var b := H[j * (n + 1) + i + 1]
			var c := H[(j + 1) * (n + 1) + i]
			var d := H[(j + 1) * (n + 1) + i + 1]
			var k := (j * n + i) * 3
			if not (is_finite(a) and is_finite(b) and is_finite(c) and is_finite(d)):
				bytes[k] = 20; bytes[k + 1] = 24; bytes[k + 2] = 28
				continue
			var m := 0.25 * (a + b + c + d)
			var t := clampf((m - lo) / (hi - lo), 0.0, 1.0)
			var sx := ((b + d) - (a + c)) / (2.0 * step)
			var sz := ((c + d) - (a + b)) / (2.0 * step)
			var shade := clampf(1.0 + (-sx - sz) * 0.9, 0.55, 1.25)
			bytes[k] = clampi(int((66.0 + t * 74.0) * shade), 0, 255)
			bytes[k + 1] = clampi(int((70.0 + t * 60.0) * shade), 0, 255)
			bytes[k + 2] = clampi(int((56.0 + t * 48.0) * shade), 0, 255)
	var img := Image.create_from_data(n, n, false, Image.FORMAT_RGB8, bytes)
	relief_img = img
	relief_tex = ImageTexture.create_from_image(img)
	relief_frame = af.duplicate()
	queue_redraw()


# Populates from Catch-Bowl Godot region (`catch_bowl.gd` + `meta.json`)
func populate_from_catch_bowl(cb: Node3D, meta: Dictionary) -> void:
	clear()
	var sz: Array = meta.get("size", [642, 529])
	var m_step := float(meta.get("m_per_sample", 2000.0))
	var w_m := float(sz[0]) * m_step
	var d_m := float(sz[1]) * m_step
	set_frame(0.0, w_m, 0.0, d_m)

	# Relief + water raster
	var wimg := Image.new()
	var has_wimg := wimg.load("res://data/catch-bowl/water.png") == OK
	var n := 160
	var x0 := float(base_frame[0]); var z0 := float(base_frame[2])
	var span := maxf(1.0, float(base_frame[1]) - x0)
	var step := span / float(n)
	var lo := float(meta.get("height", {}).get("lo", -2595.0))
	var hi := float(meta.get("height", {}).get("hi", 15527.0))
	var bytes := PackedByteArray()
	bytes.resize(n * n * 3)
	for j in n:
		var wz := z0 + (float(j) + 0.5) * step
		for i in n:
			var wx := x0 + (float(i) + 0.5) * step
			var k := (j * n + i) * 3
			if wx < 0.0 or wx > w_m or wz < 0.0 or wz > d_m:
				bytes[k] = 16; bytes[k + 1] = 20; bytes[k + 2] = 24
				continue
			if has_wimg:
				var ix := clampi(int(wx / m_step), 0, wimg.get_width() - 1)
				var iz := clampi(int(wz / m_step), 0, wimg.get_height() - 1)
				if wimg.get_pixel(ix, iz).r > 0.5:
					bytes[k] = 36; bytes[k + 1] = 74; bytes[k + 2] = 104
					continue
			var h0: float = cb.call("height_at", wx, wz)
			var hx: float = cb.call("height_at", minf(w_m, wx + step), wz)
			var hz: float = cb.call("height_at", wx, minf(d_m, wz + step))
			var t := clampf((h0 - lo) / maxf(1.0, hi - lo), 0.0, 1.0)
			var shade := clampf(1.0 + (-(hx - h0) - (hz - h0)) / maxf(1.0, step) * 1.4, 0.50, 1.30)
			bytes[k] = clampi(int((78.0 + t * 82.0) * shade), 0, 255)
			bytes[k + 1] = clampi(int((68.0 + t * 66.0) * shade), 0, 255)
			bytes[k + 2] = clampi(int((52.0 + t * 56.0) * shade), 0, 255)
	var img := Image.create_from_data(n, n, false, Image.FORMAT_RGB8, bytes)
	relief_img = img
	relief_tex = ImageTexture.create_from_image(img)
	relief_frame = base_frame.duplicate()

	var box_px: Array = meta.get("box_px", [0, 0, 0, 0])
	var ox := float(box_px[0]); var oy := float(box_px[1])
	var px_to_local := func(px: float, py: float) -> Vector2:
		return Vector2((px - ox) * 2000.0, (py - oy) * 2000.0)

	# 23 surface & underground routes (zero trail to Hub 01)
	for r in meta.get("routes", []):
		if not (r is Dictionary):
			continue
		var pts: Array = r.get("px", [])
		var under := bool(r.get("underground", false))
		var rname := str(r.get("name", r.get("id", "route")))
		var rtag := "underground" if under else ("highway" if str(r.get("kind", "")) == "highway" else "trail")
		for idx in range(pts.size() - 1):
			var a := px_to_local.call(float(pts[idx][0]), float(pts[idx][1])) as Vector2
			var b := px_to_local.call(float(pts[idx + 1][0]), float(pts[idx + 1][1])) as Vector2
			add_strip(a, b, 5500.0 if rtag == "highway" else 3600.0, {"tag": rtag, "y": 4.0 if under else 8.0, "name": rname})

	# Stops & kept wayhouses
	for sp in meta.get("stops", []):
		if sp is Dictionary:
			var p := px_to_local.call(float(sp.get("px", 0.0)), float(sp.get("py", 0.0))) as Vector2
			var sk := str(sp.get("kind", "stop"))
			add_disc(p.x, p.y, 7000.0, {"tag": "water" if sk == "tarn" else "camp", "y": 14.0, "name": str(sp.get("name", ""))})

	# Outlaw brotherhood HQs (BF-05, BF-06, BF-07 — never Stalkers)
	for ol in meta.get("outlaws", []):
		if ol is Dictionary and ol.get("hq_px") is Array:
			var hq: Array = ol["hq_px"]
			var p2 := px_to_local.call(float(hq[0]), float(hq[1])) as Vector2
			add_disc(p2.x, p2.y, 9500.0, {"tag": "outlaw", "y": 18.0, "name": "%s — HQ (%s)" % [str(ol.get("name", "")), str(ol.get("boss", ""))]})

	# 16 sites (Hub 01 kept strictly unlabelled dark ruin, never named Hub 01)
	for s in meta.get("sites", []):
		if not (s is Dictionary):
			continue
		var spx := px_to_local.call(float(s.get("px", 0.0)), float(s.get("py", 0.0))) as Vector2
		if bool(s.get("ancient_ruin", false)):
			add_disc(spx.x, spx.y, 6500.0, {"col": Color(0.28, 0.26, 0.30, 0.75), "y": 12.0, "name": "Unmarked Ancient Ruin"})
		else:
			var sname := str(s.get("name", s.get("id", "")))
			add_disc(spx.x, spx.y, 11000.0, {"tag": "site", "y": 24.0, "name": sname})
			add_label(spx.x, spx.y - 14000.0, sname, {"size": 9})

	zoom = 2.2
	queue_redraw()


# Populates from any standalone Godot spike/world case (`world-*`, `dhelv`, `verge`, `girder`, `qiblai`, `iziz`, `yuni`, `hyperjungle`, `rift`, `sedesert`)
func populate_from_case(case_name: String, dir_path: String, world_node: Node3D, ground_node: Node3D) -> void:
	clear()
	var dir := dir_path if dir_path.ends_with("/") else (dir_path + "/")
	var bx0 := INF; var bz0 := INF; var bx1 := -INF; var bz1 := -INF

	# 1. Check meta.json or world.json box
	var meta_d = KData.read_json(dir + "meta.json") if FileAccess.file_exists(dir + "meta.json") else null
	if meta_d is Dictionary and meta_d.get("box") is Array and (meta_d["box"] as Array).size() >= 4:
		var mb: Array = meta_d["box"]
		bx0 = float(mb[0]); bz0 = float(mb[1]); bx1 = float(mb[2]); bz1 = float(mb[3])

	var wdoc = KData.read_json(dir + "world.json") if FileAccess.file_exists(dir + "world.json") else null
	if not is_finite(bx0) and wdoc is Dictionary and wdoc.get("box") is Array and (wdoc["box"] as Array).size() >= 4:
		var wb: Array = wdoc["box"]
		bx0 = float(wb[0]); bz0 = float(wb[1]); bx1 = float(wb[2]); bz1 = float(wb[3])

	var bdoc = KData.read_json(dir + "biome.json") if FileAccess.file_exists(dir + "biome.json") else null
	if not is_finite(bx0) and bdoc is Dictionary and bdoc.get("box") is Array and (bdoc["box"] as Array).size() >= 4:
		var bb: Array = bdoc["box"]
		bx0 = float(bb[0]); bz0 = float(bb[1]); bx1 = float(bb[2]); bz1 = float(bb[3])

	# 2. Walk floors (`dhelv`, `verge`) & caverns (`dhelv`)
	var walk_doc = KData.read_json(dir + "walk.json") if FileAccess.file_exists(dir + "walk.json") else null
	if walk_doc is Dictionary:
		for fl in walk_doc.get("floors", []):
			if fl is Dictionary and fl.get("rect") is Array:
				var rc: Array = fl["rect"]
				bx0 = minf(bx0, float(rc[0])); bx1 = maxf(bx1, float(rc[1]))
				bz0 = minf(bz0, float(rc[2])); bz1 = maxf(bz1, float(rc[3]))

	var place_doc = KData.read_json(dir + "place.json") if FileAccess.file_exists(dir + "place.json") else null
	if place_doc is Dictionary:
		for b in place_doc.get("buildings", place_doc.get("sites", [])):
			if b is Dictionary:
				var px := float(b.get("x", b.get("at", [0, 0, 0])[0] if b.get("at") is Array else 0.0))
				var pz := float(b.get("z", b.get("at", [0, 0, 0])[2] if b.get("at") is Array else 0.0))
				bx0 = minf(bx0, px - 25.0); bx1 = maxf(bx1, px + 25.0)
				bz0 = minf(bz0, pz - 25.0); bz1 = maxf(bz1, pz + 25.0)

	# 3. Fallback to scene MeshInstance3D bounds
	if not is_finite(bx0) and world_node != null:
		for mi in world_node.find_children("*", "MeshInstance3D", true, false):
			var m := mi as MeshInstance3D
			if m != null and m.mesh != null:
				var aabb := m.global_transform * m.mesh.get_aabb()
				bx0 = minf(bx0, aabb.position.x); bx1 = maxf(bx1, aabb.end.x)
				bz0 = minf(bz0, aabb.position.z); bz1 = maxf(bz1, aabb.end.z)

	if not is_finite(bx0):
		bx0 = -120.0; bx1 = 120.0; bz0 = -120.0; bz1 = 120.0
	var pad := maxf(8.0, maxf(bx1 - bx0, bz1 - bz0) * 0.06)
	set_frame(bx0 - pad, bx1 + pad, bz0 - pad, bz1 + pad)

	# 4. Terrain relief if ground_node is available
	var water_y := -99999.0
	var has_water := false
	if wdoc is Dictionary and wdoc.get("water") is Dictionary:
		var wd: Dictionary = wdoc["water"]
		if wd.has("level"):
			water_y = float(wd["level"])
			has_water = true
	if ground_node != null:
		build_relief_from_callable(func(wx: float, wz: float) -> float:
			return KData.height_at(ground_node, wx, wz)
		, water_y, 96, has_water)

	# 5. Cavern polygons (`dhelv`)
	if FileAccess.file_exists(dir + "cavern.json"):
		var cdoc = KData.read_json(dir + "cavern.json")
		if cdoc is Dictionary:
			for rm in cdoc.get("rooms", []):
				if rm is Dictionary and rm.get("poly") is Array:
					add_poly(rm["poly"], {"tag": "cavern", "y": -5.0, "name": str(rm.get("name", rm.get("id", "cavern")))})

	# 6. Walk floors (`walk.json`)
	if walk_doc is Dictionary:
		add_from_walk(walk_doc)

	# 7. Registry records (`world.json` registry or `tags.json`)
	var reg_list: Array = []
	if wdoc is Dictionary and wdoc.get("registry") is Dictionary:
		var rsec: Dictionary = wdoc["registry"]
		if rsec.get("records") is Array:
			reg_list = rsec["records"]
		elif rsec.get("byId") is Dictionary:
			reg_list = (rsec["byId"] as Dictionary).values()
	elif FileAccess.file_exists(dir + "tags.json"):
		var tdoc = KData.read_json(dir + "tags.json")
		if tdoc is Dictionary and tdoc.get("records") is Array:
			reg_list = tdoc["records"]
		elif tdoc is Array:
			reg_list = tdoc

	for rec in reg_list:
		if not (rec is Dictionary):
			continue
		var cls := str(rec.get("class", ""))
		if cls in ["door", "window", "furniture", "prop", "light", "lamp"]:
			continue
		var rname := str(rec.get("name", rec.get("kind", rec.get("id", ""))))
		var tag := "building" if cls in ["building", "structure", "bridge", "tower", "wall"] else ("flora" if cls in ["tree", "flora", "plant"] else "floor")
		if rec.get("obb") is Dictionary:
			var ob: Dictionary = rec["obb"]
			add_obb(float(ob.get("x", 0)), float(ob.get("z", 0)), float(ob.get("hx", 3)), float(ob.get("hz", 3)), float(ob.get("ry", 0)),
				{"tag": tag, "y": 10.0 if tag == "building" else 3.0, "name": rname})
		elif rec.get("box") is Array and (rec["box"] as Array).size() >= 4:
			var rb: Array = rec["box"]
			if rb.size() >= 6:
				add_rect(float(rb[0]), float(rb[3]), float(rb[2]), float(rb[5]), {"tag": tag, "y": 10.0 if tag == "building" else 3.0, "name": rname})
			else:
				add_rect(float(rb[0]), float(rb[2]), float(rb[1]), float(rb[3]), {"tag": tag, "y": 10.0 if tag == "building" else 3.0, "name": rname})
		elif rec.get("at") is Array and (rec["at"] as Array).size() >= 3:
			var at: Array = rec["at"]
			var rad := float(rec.get("r", 3.5 if tag == "building" else 1.8))
			if tag == "building" and rec.has("w") and rec.has("d"):
				add_obb(float(at[0]), float(at[2]), float(rec["w"]) * 0.5, float(rec["d"]) * 0.5, float(rec.get("ry", 0.0)),
					{"tag": "building", "y": 10.0, "name": rname})
			elif tag == "building" or reg_list.size() <= 400:
				add_disc(float(at[0]), float(at[2]), rad, {"tag": tag, "y": 8.0 if tag == "building" else 2.0, "name": rname})

	# 8. `place.json` (`verge`, `dhelv`) & `building.json` (`yuni`)
	if place_doc is Dictionary:
		for b in place_doc.get("buildings", place_doc.get("sites", [])):
			if not (b is Dictionary):
				continue
			var bx := float(b.get("x", b.get("at", [0, 0, 0])[0] if b.get("at") is Array else 0.0))
			var bz := float(b.get("z", b.get("at", [0, 0, 0])[2] if b.get("at") is Array else 0.0))
			var bw := float(b.get("w", 10.0)) * 0.5
			var bd := float(b.get("d", 10.0)) * 0.5
			var bnm := str(b.get("name", b.get("trade", b.get("kind", b.get("id", "building")))))
			add_obb(bx, bz, maxf(2.0, bw), maxf(2.0, bd), float(b.get("ry", 0.0)), {"tag": "building", "y": 12.0, "name": bnm})

	if FileAccess.file_exists(dir + "building.json"):
		var ydoc = KData.read_json(dir + "building.json")
		if ydoc is Dictionary:
			for rm in ydoc.get("rooms", []):
				if rm is Dictionary and rm.get("box") is Array:
					var ybox: Array = rm["box"]
					if ybox.size() >= 6:
						add_rect(float(ybox[0]), float(ybox[3]), float(ybox[2]), float(ybox[5]),
							{"tag": "building", "y": float(ybox[1]), "name": str(rm.get("name", rm.get("kind", "room")))})

	# 9. If still sparse (e.g. raw glTF `girder`, `qiblai`, `iziz`), add top MeshInstance3D footprints
	if records.size() < 4 and world_node != null:
		for mi in world_node.find_children("*", "MeshInstance3D", true, false):
			var m := mi as MeshInstance3D
			if m == null or m == ground_node or m.mesh == null:
				continue
			var aabb := m.global_transform * m.mesh.get_aabb()
			var max_span := float(base_frame[1]) - float(base_frame[0])
			if aabb.size.x > max_span * 0.85 and aabb.size.z > max_span * 0.85:
				continue
			if aabb.size.x >= 1.2 or aabb.size.z >= 1.2:
				add_rect(aabb.position.x, aabb.end.x, aabb.position.z, aabb.end.z,
					{"tag": "building", "y": aabb.position.y, "name": str(m.name)})

	add_label(0.5 * (bx0 + bx1), bz0 + pad * 0.35, case_name, {"size": 10})
	queue_redraw()


func set_viewer(xz: Vector2, dir_xz: Vector2) -> void:
	has_viewer = true
	viewer_xz = xz
	if dir_xz.length_squared() > 1e-6:
		viewer_dir = dir_xz.normalized()
	queue_redraw()


func set_pin(enabled: bool, xz := Vector2.ZERO) -> void:
	has_pin = enabled
	pin_xz = xz
	queue_redraw()


func zoom_by(factor: float) -> void:
	var af_before := active_frame()
	var center_before := Vector2(0.5 * (float(af_before[0]) + float(af_before[1])), 0.5 * (float(af_before[2]) + float(af_before[3])))
	zoom = clampf(zoom * factor, 0.35, 32.0)
	if not follow_viewer:
		pan_center = center_before
	queue_redraw()


func reset_view() -> void:
	zoom = 1.0
	follow_viewer = true
	pan_center = Vector2(0.5 * (float(base_frame[0]) + float(base_frame[1])), 0.5 * (float(base_frame[2]) + float(base_frame[3])))
	queue_redraw()


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_WHEEL_UP and mb.pressed:
			zoom_by(1.25)
			accept_event()
		elif mb.button_index == MOUSE_BUTTON_WHEEL_DOWN and mb.pressed:
			zoom_by(0.80)
			accept_event()
		elif (mb.button_index == MOUSE_BUTTON_RIGHT or mb.button_index == MOUSE_BUTTON_MIDDLE):
			if mb.pressed:
				if follow_viewer:
					var af0 := active_frame()
					pan_center = Vector2(0.5 * (float(af0[0]) + float(af0[1])), 0.5 * (float(af0[2]) + float(af0[3])))
					follow_viewer = false
				_panning = true
				_pan_last = mb.position
			else:
				_panning = false
			accept_event()
		elif mb.button_index == MOUSE_BUTTON_LEFT and mb.pressed:
			var w := to_world(mb.position.x, mb.position.y)
			var picked := pick(w.x, w.y)
			map_clicked.emit(w, mb.shift_pressed, picked)
			accept_event()
	elif event is InputEventMouseMotion:
		var mm := event as InputEventMouseMotion
		_mouse_inside = true
		if _panning:
			var af := active_frame()
			var span := float(af[1]) - float(af[0])
			var s := maxf(1.0, minf(size.x, size.y))
			var delta_p := mm.position - _pan_last
			_pan_last = mm.position
			pan_center -= delta_p * (span / s)
			queue_redraw()
			accept_event()
			return
		var w2 := to_world(mm.position.x, mm.position.y)
		hover_xz = w2
		var pk := pick(w2.x, w2.y)
		var nxt := str(pk.get("name", pk.get("tag", ""))) if not pk.is_empty() else ""
		if nxt != hover_text:
			hover_text = nxt
			hover_changed.emit(hover_text, hover_xz)
		queue_redraw()


func _notification(what: int) -> void:
	if what == NOTIFICATION_MOUSE_EXIT:
		_mouse_inside = false
		_panning = false
		if hover_text != "":
			hover_text = ""
			hover_changed.emit("", Vector2.ZERO)
		queue_redraw()


static func _nice_scale_m(raw_m: float) -> float:
	var exp10 := pow(10.0, floorf(log(maxf(1.0, raw_m)) / log(10.0)))
	var frac := raw_m / exp10
	if frac >= 5.0:
		return 5.0 * exp10
	elif frac >= 2.0:
		return 2.0 * exp10
	return exp10


func _draw() -> void:
	var s := minf(size.x, size.y)
	if s <= 2.0:
		return
	var map_rect := Rect2(Vector2.ZERO, Vector2(s, s))
	draw_rect(map_rect, bg_color, true)

	var af := active_frame()
	var span := maxf(1e-4, float(af[1]) - float(af[0]))

	# 1. Relief texture mapped into active_frame
	if relief_tex != null:
		var rp0 := to_px(float(relief_frame[0]), float(relief_frame[2]), af)
		var rp1 := to_px(float(relief_frame[1]), float(relief_frame[3]), af)
		draw_texture_rect(relief_tex, Rect2(rp0, rp1 - rp0), false)

	# 2. Subtle grid lines
	var grid_col := Color(1.0, 1.0, 1.0, 0.05)
	for g in [0.25, 0.5, 0.75]:
		draw_line(Vector2(s * g, 0.0), Vector2(s * g, s), grid_col, 1.0)
		draw_line(Vector2(0.0, s * g), Vector2(s, s * g), grid_col, 1.0)

	# 3. Vector records in (y, seq) order
	var font := ThemeDB.fallback_font
	for r in ordered_records():
		var k := str(r.get("kind", ""))
		var col: Color = r.get("col", fallback_color)
		if k == "rect":
			var rc: Array = r["rect"]
			var a := to_px(float(rc[0]), float(rc[2]), af)
			var b := to_px(float(rc[1]), float(rc[3]), af)
			if b.x < 0.0 or a.x > s or b.y < 0.0 or a.y > s:
				continue
			draw_rect(Rect2(a, Vector2(maxf(1.5, b.x - a.x), maxf(1.5, b.y - a.y))), col, true)
		elif k == "disc":
			var cpx := to_px(float(r["x"]), float(r["z"]), af)
			var rad_px := clampf(float(r["r"]) / span * s, 2.2, s * 0.5)
			if cpx.x + rad_px < 0.0 or cpx.x - rad_px > s or cpx.y + rad_px < 0.0 or cpx.y - rad_px > s:
				continue
			draw_circle(cpx, rad_px, col)
		elif k == "strip":
			var sa: Array = r["a"]; var sb: Array = r["b"]
			var p0 := to_px(float(sa[0]), float(sa[1]), af)
			var p1 := to_px(float(sb[0]), float(sb[1]), af)
			if maxf(p0.x, p1.x) < -8.0 or minf(p0.x, p1.x) > s + 8.0 or maxf(p0.y, p1.y) < -8.0 or minf(p0.y, p1.y) > s + 8.0:
				continue
			var w_px := clampf(float(r["w"]) / span * s, 1.4, 14.0)
			draw_line(p0, p1, col, w_px)
		elif k == "obb":
			var hx := float(r["hx"]); var hz := float(r["hz"])
			if hx / span * s > 0.9 or hz / span * s > 0.9:
				var ry := float(r["ry"])
				var cs := cos(ry); var sn := sin(ry)
				var ox := float(r["x"]); var oz := float(r["z"])
				var pts := PackedVector2Array([
					to_px(ox + (-hx) * cs + (-hz) * sn, oz - (-hx) * sn + (-hz) * cs, af),
					to_px(ox + hx * cs + (-hz) * sn, oz - hx * sn + (-hz) * cs, af),
					to_px(ox + hx * cs + hz * sn, oz - hx * sn + hz * cs, af),
					to_px(ox + (-hx) * cs + hz * sn, oz - (-hx) * sn + hz * cs, af),
				])
				draw_colored_polygon(pts, col)
			else:
				var cp := to_px(float(r["x"]), float(r["z"]), af)
				if cp.x >= 0.0 and cp.x <= s and cp.y >= 0.0 and cp.y <= s:
					draw_rect(Rect2(cp - Vector2(0.8, 0.8), Vector2(1.6, 1.6)), col, true)
		elif k == "poly":
			var raw_pts: Array = r["pts"]
			var ppoly := PackedVector2Array()
			for q in raw_pts:
				ppoly.append(to_px(float(q[0]), float(q[1]), af))
			if ppoly.size() >= 3:
				draw_colored_polygon(ppoly, col)
		elif k == "label" and font != null:
			var lp := to_px(float(r["x"]), float(r["z"]), af)
			if lp.x < -20.0 or lp.x > s + 20.0 or lp.y < 8.0 or lp.y > s + 4.0:
				continue
			var fsz := clampi(int(r.get("size", 10)), 8, 14)
			var txt := str(r.get("text", ""))
			var tw := font.get_string_size(txt, HORIZONTAL_ALIGNMENT_LEFT, -1, fsz).x
			draw_string(font, Vector2(lp.x - tw * 0.5 + 1.0, lp.y + 1.0), txt, HORIZONTAL_ALIGNMENT_LEFT, -1, fsz, Color(0, 0, 0, 0.78))
			draw_string(font, Vector2(lp.x - tw * 0.5, lp.y), txt, HORIZONTAL_ALIGNMENT_LEFT, -1, fsz, Color(0.93, 0.89, 0.78, 0.95))

	# 4. Dynamic dots (moving carts / caravan trains)
	for d in dynamic_dots:
		if d is Dictionary:
			var dp := to_px(float(d.get("x", 0.0)), float(d.get("z", 0.0)), af)
			if dp.x >= 0.0 and dp.x <= s and dp.y >= 0.0 and dp.y <= s:
				draw_circle(dp, float(d.get("r", 2.6)), d.get("col", Color(1.0, 0.86, 0.42, 0.95)))

	# 5. Active 3D Cursor Pin (gold diamond)
	if has_pin:
		var pp := to_px(pin_xz.x, pin_xz.y, af)
		var dm := PackedVector2Array([pp + Vector2(0, -6), pp + Vector2(5, 0), pp + Vector2(0, 6), pp + Vector2(-5, 0)])
		draw_colored_polygon(dm, Color(1.0, 0.82, 0.22, 0.98))
		draw_polyline(PackedVector2Array([dm[0], dm[1], dm[2], dm[3], dm[0]]), Color(0.12, 0.09, 0.04, 0.95), 1.3)

	# 6. Viewer position dot + directional view wedge
	if has_viewer:
		var vp := to_px(viewer_xz.x, viewer_xz.y, af)
		var fwd := viewer_dir.normalized()
		var left_v := fwd.rotated(-0.46)
		var right_v := fwd.rotated(0.46)
		var wedge_len := 22.0
		var wedge := PackedVector2Array([vp, vp + left_v * wedge_len, vp + fwd * (wedge_len * 1.12), vp + right_v * wedge_len])
		draw_colored_polygon(wedge, Color(0.42, 0.86, 1.0, 0.28))
		draw_line(vp, vp + fwd * wedge_len, Color(0.62, 0.93, 1.0, 0.85), 1.5)
		draw_circle(vp, 5.2, Color(0.06, 0.08, 0.10, 0.95))
		draw_circle(vp, 3.6, Color(0.48, 0.92, 1.0, 1.0))

	# 7. Compass "N" badge (top-left) & Scale bar (bottom-right)
	if font != null:
		draw_rect(Rect2(Vector2(5, 5), Vector2(18, 16)), Color(0.05, 0.06, 0.07, 0.76), true)
		draw_string(font, Vector2(9, 17), "N", HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.90, 0.79, 0.52))

		var bar_m := _nice_scale_m(span * 0.26)
		var bar_px := clampf(bar_m / span * s, 24.0, s * 0.48)
		var bar_lbl := ("%.0f km" % (bar_m / 1000.0)) if bar_m >= 1000.0 else ("%.0f m" % bar_m)
		var bx := s - bar_px - 8.0
		var by := s - (24.0 if (hover_text != "" or _mouse_inside) else 8.0)
		draw_rect(Rect2(Vector2(bx - 4.0, by - 13.0), Vector2(bar_px + 8.0, 16.0)), Color(0.05, 0.06, 0.07, 0.72), true)
		draw_line(Vector2(bx, by), Vector2(bx + bar_px, by), Color(0.92, 0.84, 0.65), 2.0)
		draw_line(Vector2(bx, by - 3.0), Vector2(bx, by + 1.0), Color(0.92, 0.84, 0.65), 1.5)
		draw_line(Vector2(bx + bar_px, by - 3.0), Vector2(bx + bar_px, by + 1.0), Color(0.92, 0.84, 0.65), 1.5)
		draw_string(font, Vector2(bx + 2.0, by - 3.0), bar_lbl, HORIZONTAL_ALIGNMENT_LEFT, -1, 9, Color(0.92, 0.86, 0.72))

		# 8. Hover banner (bottom strip)
		if hover_text != "" or _mouse_inside:
			draw_rect(Rect2(Vector2(0, s - 18.0), Vector2(s, 18.0)), Color(0.05, 0.06, 0.08, 0.86), true)
			var msg := hover_text if hover_text != "" else ("x %.0f, z %.0f  (click to go)" % [hover_xz.x, hover_xz.y])
			draw_string(font, Vector2(6.0, s - 5.0), msg, HORIZONTAL_ALIGNMENT_LEFT, s - 12.0, 10, Color(0.95, 0.91, 0.80))

	# Crisp brass border
	draw_rect(map_rect, Color(0.44, 0.31, 0.21, 0.85), false, 1.0)
