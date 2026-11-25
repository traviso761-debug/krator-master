# THE CATCH-BOWL NETWORK, CARAVANS, OUTLAWS & AMBIENT HAZARDS IN GODOT (`krator/catch_bowl_network.gd`)
# Drawn on top of `catch_bowl.gd`'s 2 km scale-model terrain before the 1:1 region cut:
#   - Surface highways, graben trails, Twins trails and caravan tracks as terrain-hugging ribbons (`R` toggles);
#   - Underground Ancient bores and Route A lava tubes as dashed subterranean lines (`U` toggles — off by default);
#   - Kept wayhouses (10 on the Stalker Gate + 5 Twins oases + Bab al-Hawa + Rangers' Last Cairn + 5 highland tarns)
#     and the 39 unmanned day-march bothies;
#   - Live moving caravan trains along the 7 provisioned rounds (`CATCH_TUNE`, `BOWL_TUNE`, `STALKER_TUNE`), plus
#     outlaw brotherhood HQs & sub-camps (`BF-05` Salt-Thirsters, `BF-06` Glass-Eaters, `BF-07` Tin-Skulls, `O` toggles);
#   - Live `KHAZ`-equivalent ambient & weather hazard evaluator (`pressure_atm`, `temp_c`, `thin_air`, `hot`, `cold`,
#     `caustic_dust`, `death_zone`, `stalker_risk`) — strictly keeping Stalkers invisible in the scene/markers and
#     NEVER naming Hub 01 (`sodpa02bfv`) or `"pressure"` (its hidden source counter) in any UI text!
class_name KratorCatchBowlNetwork
extends Node3D

const KRand := preload("res://tests/rand/krand.gd")

var host: Node3D
var cam: Camera3D
var fx: KratorAtmosFx

var surface_routes_node: Node3D
var under_routes_node: Node3D
var stops_node: Node3D
var outlaws_node: Node3D
var caravans_node: Node3D

var sim_day := 0.0
var sim_speed_days_per_sec := 0.25   # 1 sim day every 4 real seconds when unpaused
var paused := false

var _temp_img: Image
var _water_img: Image
var _box_x0 := 0.0
var _box_y0 := 0.0
var _m := 2000.0
var _trains: Array[Dictionary] = []

const ROUTE_COLORS := {
	"trunk": Color(0.86, 0.72, 0.42),
	"izani": Color(0.92, 0.56, 0.22),
	"yuni": Color(0.36, 0.78, 0.56),
	"stalker_gate": Color(0.42, 0.84, 0.62),
	"twins_trail": Color(0.94, 0.76, 0.34),
	"twins_path": Color(0.84, 0.88, 0.96),
	"caravan": Color(0.88, 0.66, 0.36),
	"line": Color(0.46, 0.62, 0.92),
	"possible": Color(0.55, 0.48, 0.78),
	"twins_tube": Color(0.86, 0.38, 0.26),
}


func bind(h: Node3D, c: Camera3D, atmos: KratorAtmosFx) -> void:
	host = h
	cam = c
	fx = atmos
	var meta: Dictionary = host.meta
	var bx: Array = meta.get("box_px", [0, 0, 0, 0])
	_box_x0 = float(bx[0])
	_box_y0 = float(bx[1])
	_m = float(meta.get("m_per_sample", 2000.0))
	_load_rasters()
	_build_routes(meta)
	_build_stops_and_bothies(meta)
	_build_outlaws(meta)
	_build_caravans(meta)


func _load_rasters() -> void:
	var ti := Image.new()
	if ti.load("res://data/catch-bowl/temp.png") == OK:
		_temp_img = ti
	var wi := Image.new()
	if wi.load("res://data/catch-bowl/water.png") == OK:
		_water_img = wi


func px_to_world(px: float, py: float) -> Vector3:
	var wx := (px - _box_x0) * _m
	var wz := (py - _box_y0) * _m
	var wy := float(host.height_at(wx, wz)) if host != null else 0.0
	return Vector3(wx, wy, wz)


# Barometric pressure law matching core/world/41-world-fields.js (`M.pressure: {atm0: 1.60, scale_m: 8000}`:
# `1.86 atm` at -1,206 m Bowl floor, `1.03 atm` at +3,550 m Godsgate, `< 0.60 atm` thin-air above ~7,850 m, `0.07 atm` Godthrone rim)
static func pressure_at_elev(elev_m: float) -> float:
	return clampf(1.60 * exp(-elev_m / 8000.0), 0.02, 2.20)


func temp_at_px(px: float, py: float, elev_m: float, weather_id: String = "clear", hour: float = 14.0) -> float:
	var base := 16.0 - (elev_m - 1500.0) * 0.0062
	if _temp_img != null:
		var ix := clampi(int(round(px - _box_x0)), 0, _temp_img.get_width() - 1)
		var iz := clampi(int(round(py - _box_y0)), 0, _temp_img.get_height() - 1)
		base = _temp_img.get_pixel(ix, iz).r * 255.0 - 90.0
	# Diurnal + weather shifts (deadheat pushes the Bowl floor past +47 degC; God-Bore & whiteout plunge passes below -18 degC)
	var diur := -cos((hour - 3.0) / 24.0 * TAU) * 6.5
	var w_shift := 0.0
	if weather_id == "deadheat":
		w_shift = 14.0
	elif weather_id == "gale":
		w_shift = -14.0
	elif weather_id == "whiteout":
		w_shift = -18.0
	elif weather_id == "dust":
		w_shift = 4.0
	return base + diur + w_shift


# Pure hazard evaluation at `(px, py, elev_m)` for both the HUD and headless Godot tests (`catch_bowl_test.gd`).
# Note: NEVER exposes any reference to Hub 01 (`sodpa02bfv`); Stalkers are reported ONLY as an anonymous ambient danger
# envelope for simulation logic, never as a visible marker or named source!
static func evaluate_hazards(meta: Dictionary, px: float, py: float, elev_m: float, base_temp_c: float, weather_id: String, wind_mult: float = 1.0) -> Dictionary:
	var rules: Dictionary = meta.get("hazard_rules", {})
	var atm := pressure_at_elev(elev_m)
	var thin_start := float(rules.get("thin_air_start_atm", 0.60))
	var thin_lethal := float(rules.get("thin_air_lethal_atm", 0.18))
	var hot_start := float(rules.get("hot_start_c", 38.0))
	var hot_worst := float(rules.get("hot_worst_c", 52.0))
	var cold_start := float(rules.get("cold_start_c", 0.0))
	var cold_worst := float(rules.get("cold_worst_c", -30.0))

	var doses := {}
	if atm < thin_start:
		doses["thin-air"] = snappedf(clampf((thin_start - atm) / maxf(0.05, thin_start - thin_lethal), 0.0, 1.0), 0.01)
	if base_temp_c > hot_start:
		doses["hot"] = snappedf(clampf((base_temp_c - hot_start) / maxf(1.0, hot_worst - hot_start), 0.0, 1.0), 0.01)
	if base_temp_c < cold_start:
		var wind_bite := 1.0 + maxf(0.0, wind_mult - 1.0) * 0.35
		doses["cold"] = snappedf(clampf(((cold_start - base_temp_c) / maxf(1.0, cold_start - cold_worst)) * wind_bite, 0.0, 1.0), 0.01)
	# Caustic alkali dust: fierce in the Catch's black storms (and Salt-Draught upslope), mild ochre dust in the Bowl
	if weather_id == "dust" or weather_id == "duststorm_season":
		var in_catch_or_wall := py >= 1220.0 and px <= 1220.0
		var alk := 0.85 if (weather_id == "dust" and in_catch_or_wall) else (0.35 if in_catch_or_wall else 0.08)
		if alk >= 0.20:
			doses["caustic-dust"] = snappedf(alk, 0.01)
		doses["dust"] = 0.90 if weather_id == "dust" else 0.40

	# Anonymous Stalker hunting envelope check (zero tell on UI unless caller explicitly queries internal simulation risk)
	var in_stalker_ground := false
	for env in meta.get("stalker_envelopes", []):
		if env is Dictionary and env.get("center_px") is Array:
			var c: Array = env["center_px"]
			var d_km := Vector2(px - float(c[0]), py - float(c[1])).length() * 2.0
			if d_km <= float(env.get("radius_km", 80.0)) and elev_m < 6500.0:
				in_stalker_ground = true
				break

	return {
		"atm": snappedf(atm, 0.01),
		"temp_c": snappedf(base_temp_c, 0.1),
		"death_zone": elev_m >= float(rules.get("death_zone_m", 8000.0)),
		"doses": doses,
		"stalker_ground": in_stalker_ground
	}


func _build_routes(meta: Dictionary) -> void:
	surface_routes_node = Node3D.new()
	surface_routes_node.name = "SurfaceRoutes"
	add_child(surface_routes_node)

	under_routes_node = Node3D.new()
	under_routes_node.name = "UndergroundRoutes"
	under_routes_node.visible = false   # Ruined bores & lava tubes hidden by default (`U` toggles)
	add_child(under_routes_node)

	for r in meta.get("routes", []):
		if not (r is Dictionary):
			continue
		var pts: Array = r.get("px", [])
		if pts.size() < 2:
			continue
		var under := bool(r.get("underground", false))
		var rcls := String(r.get("cls", "trunk"))
		var col: Color = ROUTE_COLORS.get(rcls, Color(0.85, 0.70, 0.40))
		var half_w := 280.0 if (rcls == "trunk" or rcls == "izani" or rcls == "yuni") else 180.0
		var lift := -120.0 if under else 55.0
		var mesh := _ribbon_mesh(pts, half_w, lift, col, under)
		if mesh == null:
			continue
		var mi := MeshInstance3D.new()
		mi.name = String(r.get("id", "route"))
		mi.mesh = mesh
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		var mat := StandardMaterial3D.new()
		mat.vertex_color_use_as_albedo = true
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		mat.cull_mode = BaseMaterial3D.CULL_DISABLED
		if under:
			mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mi.material_override = mat
		if under:
			under_routes_node.add_child(mi)
		else:
			surface_routes_node.add_child(mi)


func _ribbon_mesh(pts: Array, half_w: float, lift: float, col: Color, dashed: bool) -> ArrayMesh:
	# Resample at <= 1.5 px (3 km) intervals so the ribbon drapes smoothly over every 2 km ridge and graben floor
	var dense: Array[Vector3] = []
	for i in pts.size() - 1:
		var a: Array = pts[i]
		var b: Array = pts[i + 1]
		var dist_px := Vector2(float(b[0]) - float(a[0]), float(b[1]) - float(a[1])).length()
		var steps := maxi(1, int(ceil(dist_px / 0.75)))
		var start_k := 0 if i == 0 else 1
		for k in range(start_k, steps + 1):
			var t := float(k) / float(steps)
			var px := lerpf(float(a[0]), float(b[0]), t)
			var py := lerpf(float(a[1]), float(b[1]), t)
			var p := px_to_world(px, py)
			p.y += lift
			dense.append(p)
	if dense.size() < 2:
		return null
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var c := col
	if dashed:
		c.a = 0.65
	var quad_n := 0
	for i in dense.size() - 1:
		if dashed and (i % 2 == 1):
			continue
		var p0 := dense[i]
		var p1 := dense[i + 1]
		var dir := Vector2(p1.x - p0.x, p1.z - p0.z)
		if dir.length() < 1.0:
			continue
		dir = dir.normalized()
		var nx := -dir.y * half_w
		var nz := dir.x * half_w
		var v0 := Vector3(p0.x - nx, p0.y, p0.z - nz)
		var v1 := Vector3(p0.x + nx, p0.y, p0.z + nz)
		var v2 := Vector3(p1.x + nx, p1.y, p1.z + nz)
		var v3 := Vector3(p1.x - nx, p1.y, p1.z - nz)
		for v in [v0, v1, v2, v3]:
			st.set_color(c)
			st.set_normal(Vector3.UP)
			st.add_vertex(v)
		var base := quad_n * 4
		st.add_index(base); st.add_index(base + 1); st.add_index(base + 2)
		st.add_index(base); st.add_index(base + 2); st.add_index(base + 3)
		quad_n += 1
	return st.commit() if quad_n > 0 else null


func _build_stops_and_bothies(meta: Dictionary) -> void:
	stops_node = Node3D.new()
	stops_node.name = "StopsAndWaystations"
	add_child(stops_node)

	var kept_mat := StandardMaterial3D.new()
	kept_mat.albedo_color = Color(0.36, 0.80, 0.62)
	kept_mat.emission_enabled = true
	kept_mat.emission = Color(0.24, 0.60, 0.45)
	kept_mat.emission_energy_multiplier = 0.35

	var setpiece_mat := StandardMaterial3D.new()
	setpiece_mat.albedo_color = Color(0.94, 0.76, 0.34)
	setpiece_mat.emission_enabled = true
	setpiece_mat.emission = Color(0.84, 0.62, 0.20)
	setpiece_mat.emission_energy_multiplier = 0.35

	var tarn_mat := StandardMaterial3D.new()
	tarn_mat.albedo_color = Color(0.35, 0.72, 0.95)
	tarn_mat.emission_enabled = true
	tarn_mat.emission = Color(0.25, 0.58, 0.85)
	tarn_mat.emission_energy_multiplier = 0.30

	var box_mesh := BoxMesh.new()
	box_mesh.size = Vector3(420.0, 900.0, 420.0)

	for sp in meta.get("stops", []):
		if not (sp is Dictionary):
			continue
		var p := px_to_world(float(sp["px"]), float(sp["py"]))
		var m := MeshInstance3D.new()
		m.name = String(sp["id"])
		m.mesh = box_mesh
		var skind := String(sp.get("kind", "waystation"))
		m.material_override = tarn_mat if skind == "tarn" else (kept_mat if bool(sp.get("kept", false)) else setpiece_mat)
		m.position = Vector3(p.x, p.y + 450.0, p.z)
		stops_node.add_child(m)
		var lb := Label3D.new()
		lb.text = String(sp.get("name", sp["id"])).split("(")[0].strip_edges()
		lb.font_size = 46
		lb.fixed_size = true
		lb.pixel_size = 0.0005
		lb.outline_size = 12
		lb.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		lb.no_depth_test = false
		lb.position = Vector3(p.x, p.y + 1500.0, p.z)
		stops_node.add_child(lb)

	# MultiMesh for the 39 unmanned day-march bothies along the Stalker Gate graben trails
	var bothies: Array = meta.get("bothies", [])
	if not bothies.is_empty():
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		var bm := BoxMesh.new()
		bm.size = Vector3(220.0, 380.0, 220.0)
		var bmat := StandardMaterial3D.new()
		bmat.albedo_color = Color(0.68, 0.72, 0.66)
		bm.material = bmat
		mm.mesh = bm
		mm.instance_count = bothies.size()
		for i in bothies.size():
			var b: Dictionary = bothies[i]
			var bp := px_to_world(float(b["px"]), float(b["py"]))
			mm.set_instance_transform(i, Transform3D(Basis.IDENTITY, Vector3(bp.x, bp.y + 190.0, bp.z)))
		var mmi := MultiMeshInstance3D.new()
		mmi.name = "UnmannedBothies"
		mmi.multimesh = mm
		stops_node.add_child(mmi)


func _build_outlaws(meta: Dictionary) -> void:
	outlaws_node = Node3D.new()
	outlaws_node.name = "OutlawCamps"
	add_child(outlaws_node)

	var hq_mat := StandardMaterial3D.new()
	hq_mat.albedo_color = Color(0.86, 0.24, 0.18)
	hq_mat.emission_enabled = true
	hq_mat.emission = Color(0.75, 0.16, 0.12)
	hq_mat.emission_energy_multiplier = 0.45

	var sub_mat := StandardMaterial3D.new()
	sub_mat.albedo_color = Color(0.82, 0.42, 0.20)

	var hq_mesh := PrismMesh.new()
	hq_mesh.size = Vector3(650.0, 1400.0, 650.0)
	var sub_mesh := PrismMesh.new()
	sub_mesh.size = Vector3(380.0, 750.0, 380.0)

	for ol in meta.get("outlaws", []):
		if not (ol is Dictionary):
			continue
		var hq_px: Array = ol.get("hq_px", [1100, 1200])
		var hp := px_to_world(float(hq_px[0]), float(hq_px[1]))
		var hm := MeshInstance3D.new()
		hm.name = String(ol["id"]) + "_HQ"
		hm.mesh = hq_mesh
		hm.material_override = hq_mat
		hm.position = Vector3(hp.x, hp.y + 700.0, hp.z)
		outlaws_node.add_child(hm)

		var lb := Label3D.new()
		lb.text = "%s HQ (%dT bounty)" % [String(ol.get("id", "")), int(ol.get("bounty_talents", 500))]
		lb.modulate = Color(1.0, 0.55, 0.45)
		lb.font_size = 44
		lb.fixed_size = true
		lb.pixel_size = 0.0005
		lb.outline_size = 12
		lb.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		lb.no_depth_test = false
		lb.position = Vector3(hp.x, hp.y + 1900.0, hp.z)
		outlaws_node.add_child(lb)

		var subs: Array = ol.get("subs_px", [])
		for idx in subs.size():
			var spx: Array = subs[idx]
			var sp := px_to_world(float(spx[0]), float(spx[1]))
			var sm := MeshInstance3D.new()
			sm.name = "%s_sub_%d" % [String(ol["id"]), idx + 1]
			sm.mesh = sub_mesh
			sm.material_override = sub_mat
			sm.position = Vector3(sp.x, sp.y + 375.0, sp.z)
			outlaws_node.add_child(sm)


func _build_caravans(meta: Dictionary) -> void:
	caravans_node = Node3D.new()
	caravans_node.name = "Caravans"
	add_child(caravans_node)
	_trains.clear()

	var train_mesh := BoxMesh.new()
	train_mesh.size = Vector3(340.0, 320.0, 720.0)

	for cv in meta.get("caravans", []):
		if not (cv is Dictionary):
			continue
		var pts: Array = cv.get("px", [])
		if pts.size() < 2:
			continue
		# Precompute cumulative km along the round (out-and-back ping-pong)
		var cum_km: Array[float] = [0.0]
		for i in range(1, pts.size()):
			var a: Array = pts[i - 1]
			var b: Array = pts[i]
			cum_km.append(cum_km[i - 1] + Vector2(float(b[0]) - float(a[0]), float(b[1]) - float(a[1])).length() * 2.0)
		var total_km := cum_km[cum_km.size() - 1]
		if total_km < 1.0:
			continue
		var col := Color.from_string(String(cv.get("color", "#e6b830")), Color(0.9, 0.72, 0.25))
		var mat := StandardMaterial3D.new()
		mat.albedo_color = col
		mat.emission_enabled = true
		mat.emission = col
		mat.emission_energy_multiplier = 0.55

		var n_trains := maxi(1, int(cv.get("trains", 2)))
		var speed_km := float(cv.get("speed_km_day", 28.0))
		for k in n_trains:
			var mi := MeshInstance3D.new()
			mi.name = "%s_%d" % [String(cv["id"]), k + 1]
			mi.mesh = train_mesh
			mi.material_override = mat
			caravans_node.add_child(mi)
			var phase_km := (float(k) / float(n_trains)) * (total_km * 2.0)
			_trains.append({
				"node": mi,
				"round_id": String(cv["id"]),
				"pts": pts,
				"cum_km": cum_km,
				"total_km": total_km,
				"speed_km_day": speed_km,
				"phase_km": phase_km
			})
	_update_caravans(0.0)


# Deterministic position of train `idx` at `day` (pure math so headless tests can verify movement)
func train_pos_at_day(idx: int, day: float) -> Vector3:
	if idx < 0 or idx >= _trains.size():
		return Vector3.ZERO
	var tr: Dictionary = _trains[idx]
	var total_km: float = tr["total_km"]
	var cycle := total_km * 2.0
	var u := fposmod(float(tr["phase_km"]) + day * float(tr["speed_km_day"]), cycle)
	var d_km := u if u <= total_km else (cycle - u)
	var cum: Array = tr["cum_km"]
	var pts: Array = tr["pts"]
	var seg := 1
	while seg < cum.size() - 1 and float(cum[seg]) < d_km:
		seg += 1
	var seg_len := maxf(0.001, float(cum[seg]) - float(cum[seg - 1]))
	var t := clampf((d_km - float(cum[seg - 1])) / seg_len, 0.0, 1.0)
	var a: Array = pts[seg - 1]
	var b: Array = pts[seg]
	var px := lerpf(float(a[0]), float(b[0]), t)
	var py := lerpf(float(a[1]), float(b[1]), t)
	var p := px_to_world(px, py)
	p.y += 220.0
	return p


func _update_caravans(day: float) -> void:
	for i in _trains.size():
		var tr: Dictionary = _trains[i]
		var mi: MeshInstance3D = tr["node"]
		var p0 := train_pos_at_day(i, day)
		var p1 := train_pos_at_day(i, day + 0.05)
		mi.position = p0
		var dir := Vector3(p1.x - p0.x, 0.0, p1.z - p0.z)
		if dir.length_squared() > 1.0:
			mi.rotation.y = atan2(dir.x, dir.z)


func _process(delta: float) -> void:
	if not paused:
		sim_day += delta * sim_speed_days_per_sec
		_update_caravans(sim_day)
	# Cull stop/outlaw labels by visibility reach just like site pins
	if cam != null and fx != null:
		var reach: float = float(fx.row().get("visibility_km", 200.0)) * 1000.0 * 1.4
		var eye := cam.global_position
		for grp in [stops_node, outlaws_node]:
			if grp == null or not grp.visible:
				continue
			for ch in grp.get_children():
				if ch is Label3D:
					var d := eye.distance_to((ch as Node3D).global_position)
					(ch as Node3D).visible = d <= reach and d > 1800.0
