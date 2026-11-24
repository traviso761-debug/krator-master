# Decals for what is specific, not general (GODOT-LOOK-PLAN.md M11): ruts and puddles on a road, a worn patch, soot above a
# chimney, a leak below a sill. Decal nodes from a pool, on the marks nearest the camera, faded out by 40 m (they cost by
# the screen they cover and share the 512 clustered elements with the lights).
# Where the marks are is data. A stream case's roads give the first kind: along each road a mark every few metres, which
# one and how turned decided by the road's own id and the mark's index (core/rand), so a road wears the same way every
# visit. Soot and leaks need a chimney's and a sill's place, which no export carries yet (the plan's section 13): add()
# takes them when one does.
# The maps are made here at start (albedo with alpha, and an ORM for the puddle's gloss): a decal cannot take a shader.
class_name KratorDecals
extends Node3D

const KRand := preload("res://tests/rand/krand.gd")
const KINDS := ["rut", "puddle", "worn", "soot", "leak"]
const FADE_AT := 30.0     # metres: where a decal starts to go
const FADE_LEN := 10.0    # ... and how far it takes
const ROAD_STEP := 7.0    # metres between a road's marks
const EVERY := 0.5        # seconds between looks at which marks are near

var max_decals := 16
var wet := 0.0            # 0..1: puddles stand only in a wet world (krator/kair.gd's number)
var marks: Array = []     # [{kind, at (region metres), yaw, size: Vector3 (across, depth, along)}] added by hand or from records
var _road_marks: Array = []
var _road_key := ""
var _pool: Array[Decal] = []
var _since := 1e9
var stats := {"marks": 0, "drawn": 0}
static var _tex := {}     # kind -> {albedo, orm}


static func make(spec: Dictionary) -> KratorDecals:
	var d := KratorDecals.new()
	d.name = "Decals"
	d.max_decals = int(spec.get("decals", 16))
	return d


# a mark from a record: soot, a leak, a worn path
func add(kind: String, at: Vector3, yaw: float, size: Vector3) -> void:
	if kind in KINDS:
		marks.append({"kind": kind, "at": at, "yaw": yaw, "size": size})


# ---- the maps ------------------------------------------------------------------------------------------------------------

static func _smooth(a: float, b: float, x: float) -> float:
	return smoothstep(a, b, x)


# one kind's albedo (rgb the mark's colour, a how much of it) and ORM (g roughness, b metallic), n px square
static func images(kind: String, n := 128) -> Dictionary:
	var alb := Image.create(n, n, false, Image.FORMAT_RGBA8)
	var orm := Image.create(n, n, false, Image.FORMAT_RGBA8)
	var sd := KRand.child(7411, kind)
	for y in n:
		for x in n:
			var u := (x + 0.5) / n
			var v := (y + 0.5) / n
			var edge := _smooth(0.0, 0.14, u) * _smooth(0.0, 0.14, 1.0 - u) * _smooth(0.0, 0.14, v) * _smooth(0.0, 0.14, 1.0 - v)
			var nz := KRand.gfbm(u * 9.0, v * 9.0, 3, sd) * 0.5 + 0.5
			var col := Color(0.2, 0.17, 0.13)
			var a := 0.0
			var rough := 0.85
			if kind == "rut":       # two tracks down the mark, broken up
				var t := maxf(1.0 - absf(u - 0.3) / 0.09, 1.0 - absf(u - 0.7) / 0.09)
				a = clampf(t, 0.0, 1.0) * (0.35 + 0.55 * nz) * 0.75
				col = Color(0.16, 0.13, 0.10)
			elif kind == "puddle":  # a lobed pool: dark and smooth
				var r := Vector2(u - 0.5, v - 0.5).length() * 2.0
				a = _smooth(0.86, 0.6, r + (nz - 0.5) * 0.5) * 0.9
				col = Color(0.10, 0.10, 0.11)
				rough = 0.05
			elif kind == "worn":    # a paler, trodden patch
				var r2 := Vector2(u - 0.5, (v - 0.5) * 0.7).length() * 2.0
				a = _smooth(1.0, 0.35, r2 + (nz - 0.5) * 0.6) * 0.5
				col = Color(0.52, 0.47, 0.38)
			elif kind == "soot":    # a streak that widens upward (v 0 at the source)
				var w := 0.12 + 0.3 * v
				a = _smooth(w, w * 0.3, absf(u - 0.5)) * (1.0 - v) * (0.5 + 0.5 * nz) * 0.85
				col = Color(0.05, 0.05, 0.05)
			else:                   # leak: thin runs downward (v 0 at the sill)
				var run := KRand.gfbm(u * 22.0, 0.5, 2, sd) * 0.5 + 0.5
				a = _smooth(0.55, 0.8, run) * _smooth(1.0, 0.2, v) * (0.6 + 0.4 * nz) * 0.6
				col = Color(0.14, 0.15, 0.12)
			alb.set_pixel(x, y, Color(col.r, col.g, col.b, clampf(a * edge, 0.0, 1.0)))
			orm.set_pixel(x, y, Color(1.0, rough, 0.0, 1.0))
	alb.generate_mipmaps()
	orm.generate_mipmaps()
	return {"albedo": alb, "orm": orm}


static func textures(kind: String) -> Dictionary:
	if not _tex.has(kind):
		var im := images(kind)
		_tex[kind] = {"albedo": ImageTexture.create_from_image(im["albedo"]), "orm": ImageTexture.create_from_image(im["orm"])}
	return _tex[kind]


# ---- the roads' marks ----------------------------------------------------------------------------------------------------

# The marks along the roads within `reach` of a point, from the roads' own polylines ([x, z, y] a vertex): one every
# ROAD_STEP metres, each a rut, a puddle (a wet world only: drawn when `wet` is up) or a worn patch by the road's id
# and the mark's index. A village street is trodden; a link road is rutted.
static func road_marks(roads: Array, at: Vector3, reach: float) -> Array:
	var out := []
	var r2 := (reach + 40.0) * (reach + 40.0)
	for rd in roads:
		var pts: Array = rd.get("pts", [])
		if pts.size() < 2:
			continue
		var sd := KRand.child(9127, str(rd.get("id", "")))
		var street := str(rd.get("kind", "")) == "village"
		var carry := 0.0
		var mark_i := 0
		for i in pts.size() - 1:
			var a := Vector3(float(pts[i][0]), float(pts[i][2]), float(pts[i][1]))
			var b := Vector3(float(pts[i + 1][0]), float(pts[i + 1][2]), float(pts[i + 1][1]))
			var seg := a.distance_to(b)
			if seg < 0.01:
				continue
			var near := Vector2(a.x - at.x, a.z - at.z).length_squared() < r2 or Vector2(b.x - at.x, b.z - at.z).length_squared() < r2
			var t := ROAD_STEP - carry
			while t <= seg:
				if near:
					var p := a.lerp(b, t / seg)
					var h := KRand.hash_ints(sd, [mark_i])
					var u := KRand.unit(h)
					var u2 := KRand.unit(KRand.mix32(h + 17))
					var kind := "puddle" if u < 0.22 else ("worn" if (street or u > 0.8) else "rut")
					var yaw := atan2(b.x - a.x, b.z - a.z)
					var size := Vector3(2.6, 1.6, 6.5) if kind == "rut" else (Vector3(1.6 + 2.0 * u2, 1.2, 1.4 + 1.8 * u2) if kind == "puddle" else Vector3(2.4 + 1.5 * u2, 1.4, 3.0 + 2.5 * u2))
					var side := (u2 - 0.5) * (0.0 if kind == "rut" else 1.6)
					out.append({"kind": kind, "at": p + Vector3(cos(yaw), 0.0, -sin(yaw)) * side, "yaw": yaw + (0.0 if kind == "rut" else u2 * TAU), "size": size})
				mark_i += 1
				t += ROAD_STEP
			carry = seg - (t - ROAD_STEP)
	return out


# each frame: which marks the pool is on. cam_region in region metres.
func update(stream: Node, cam_region: Vector3, dt: float) -> void:
	_since += dt
	if _since < EVERY or stream == null:
		return
	_since = 0.0
	var key := "%d,%d" % [int(floor(cam_region.x / 60.0)), int(floor(cam_region.z / 60.0))]
	if key != _road_key:
		_road_key = key
		_road_marks = road_marks(stream.index.get("roads", []), cam_region, 100.0)
	var reach := FADE_AT + FADE_LEN
	var near := []
	for src in [_road_marks, marks]:
		for m in src:
			if str(m["kind"]) == "puddle" and wet < 0.2:
				continue
			var d := (m["at"] as Vector3).distance_to(cam_region)
			if d < reach + 4.0:
				near.append([d, m])
	near.sort_custom(func(a, b): return a[0] < b[0])
	var n := mini(near.size(), max_decals)
	while _pool.size() < n:
		var dc := Decal.new()
		dc.distance_fade_enabled = true
		dc.distance_fade_begin = FADE_AT
		dc.distance_fade_length = FADE_LEN
		dc.upper_fade = 0.4
		dc.lower_fade = 0.4
		dc.normal_fade = 0.3
		dc.cull_mask = 1
		add_child(dc)
		_pool.append(dc)
	for j in _pool.size():
		var dc := _pool[j]
		dc.visible = j < n
		if j >= n:
			continue
		var m: Dictionary = near[j][1]
		var tx := textures(str(m["kind"]))
		dc.texture_albedo = tx["albedo"]
		dc.texture_orm = tx["orm"] if str(m["kind"]) == "puddle" else null
		dc.albedo_mix = 1.0 if str(m["kind"]) != "puddle" else clampf(wet * 1.2, 0.0, 1.0)
		var at: Vector3 = m["at"]
		var gh: float = stream.height_at(at.x, at.z)   # the ground as drawn, not the road record's own height
		dc.size = m["size"]
		dc.position = stream.local(at.x, gh if is_finite(gh) else at.y, at.z)
		dc.rotation = Vector3(0.0, float(m["yaw"]), 0.0)
	stats = {"marks": _road_marks.size() + marks.size(), "drawn": n}
