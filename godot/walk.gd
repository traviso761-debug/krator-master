# M8 "walk the road" + Krator Host UI (GODOT-PLAN.md): any krator-world-stream case playable and inspectable.
# Streams default godot/data/world-oidong-highrift (or --case=world-pinnacle) round a dual-mode walker / free-fly
# host camera (krator/world_walk.gd) with Forward+ AgX + SSAO, 2,400 m 4-cascade sun shadows, optional --gi (SDFGI),
# live clock-driven sun & sky, indoor ambient dimming, and the Krator Host UI (krator/host_ui.gd):
#   - Case switcher & Points-of-Interest camera views dropdown (overview, places, Strongbow, all 9 Pinnacle camps, active pin)
#   - Toggleable Walk (1st/3rd person) <-> WASD+QE Free-Fly camera (F, V) + wheel-to-cursor zoom
#   - 3D Cursor Pin placement (Double-Click any surface, or C tool mode; Shift+Double-Click walks straight there)
#   - Live camera, look, ground & pin coordinates with clipboard export
#   - Hover/Click 3D Object & Record Inspector (I) and 3D Polygon / Distance / Area measurement tool (P)
extends Node3D

const DEFAULT_CASE := "res://data/world-oidong-highrift/index.json"
const KratorSky := preload("res://krator/sky.gd")
const KInteriorsLight := preload("res://krator/kinteriors_light.gd")
var case_index := DEFAULT_CASE
var W: KratorWorldWalk
var ui: KratorHostUI
var sky_node: Node3D
var env_res: Environment
var sun: DirectionalLight3D
var _origin_px := Vector2(1306.0, 1634.0)
var _m_per_px := 2000.0
var _gi_on := false
var _start_fly := false
var _no_ui := false
var _collide := true
var traffic: KratorValleyTraffic
var carts: MultiMeshInstance3D
var minute := 17.2 * 60.0    # sim minutes into the week (17:12 summer afternoon: sun 25° high, giant & rings lit in NNE)
var season_day := 75.0       # summer season offset so sun stands above the ring plane and high over 62°S Longsong
var rate := 60.0             # sim minutes a real second
var _saved_rate := 60.0
var _shown := 0
var _tt := 0.0
var _indoors := false
var _in_vault := false
var _indoor_room_id := ""
var _mask_indoor_sun := true
var _use_corner_ao := true
var _ls_lights: Array = []
var _ls_light_regs: Array = []
var _ls_light_timer := 0.0

# Mouse drag & click tracking
var _rmb_down := false
var _lmb_down := false
var _mmb_down := false
var _lmb_press_pos := Vector2.ZERO
var _lmb_dragged := false

# Layer & tool state
var _flora_vis := true
var _builds_vis := true
var _last_event_n := -1
var _last_places_n := -1

# 3D overlays (Pin beacon + Polygon/Measure immediate mesh)
var _overlays: Node3D
var _pin_node: Node3D
var _has_pin := false
var _pin_reg := Vector3.ZERO
var _poly_mi: MeshInstance3D
var _poly_imm: ImmediateMesh
var _poly_pts: Array = []    # Array of Vector3 in region metres
var _inspect_locked := false
var _hover_timer := 0.0


func _parse_args() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--case="):
			var v := a.trim_prefix("--case=")
			if v.ends_with(".json"):
				case_index = v if v.begins_with("res://") else "res://" + v.trim_prefix("/")
			else:
				case_index = "res://data/%s/index.json" % v.trim_suffix("/")
		elif a == "--gi":
			_gi_on = true
		elif a == "--fly":
			_start_fly = true
		elif a == "--no-ui":
			_no_ui = true
		elif a == "--no-collide":
			_collide = false
		elif a == "--no-flora":
			_flora_vis = false


func _ready() -> void:
	_parse_args()
	sky_node = KratorSky.new()
	sky_node.name = "KratorSky"
	sky_node.site_px = _origin_px
	add_child(sky_node)
	sky_node.set_process(false)   # driven deterministically in _update_sun_and_ambience
	env_res = sky_node.env
	sun = sky_node.sun
	sun.light_cull_mask = 1
	if sky_node.shine != null:
		sky_node.shine.light_cull_mask = 1
	env_res.tonemap_mode = Environment.TONE_MAPPER_AGX
	env_res.ssao_enabled = true
	env_res.ssao_radius = 1.4
	env_res.ssao_intensity = 1.55
	sky_node.preset["fogDensity"] = 0.000022
	if _gi_on:
		env_res.sdfgi_enabled = true
		env_res.sdfgi_use_occlusion = true
		env_res.sdfgi_read_sky_light = true
	sun.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_4_SPLITS
	sun.directional_shadow_max_distance = 2400.0
	sun.directional_shadow_blend_splits = true

	ui = KratorHostUI.new()
	ui.name = "HostUI"
	add_child(ui)
	_wire_ui()
	if _no_ui:
		ui.set_chrome_visible(false)

	_load_case(case_index, true)
	_update_sun_and_ambience(0.0, true)


func _wire_ui() -> void:
	ui.case_selected.connect(func(p: String): _load_case(p, false))
	ui.poi_selected.connect(_go_to_poi)
	ui.walk_toggled.connect(func(on: bool): W.set_walk_mode(on))
	ui.first_person_toggled.connect(func(on: bool):
		W.first_person = on
		if W.walk_mode:
			W._follow(true)
	)
	ui.ground_requested.connect(func(): W.to_ground())
	ui.ride_toggled.connect(_toggle_ride_road)
	ui.speed_selected.connect(func(mult: float): W.speed_mul = mult)
	ui.tool_changed.connect(_on_tool_changed)
	ui.pin_action.connect(_on_pin_action)
	ui.layer_toggled.connect(func(ln: String, on: bool):
		if ln == "flora":
			_flora_vis = on
		elif ln == "buildings":
			_builds_vis = on
		_apply_layers()
	)
	ui.gi_toggled.connect(func(on: bool):
		_gi_on = on
		env_res.sdfgi_enabled = on
		if on:
			env_res.sdfgi_use_occlusion = true
			env_res.sdfgi_read_sky_light = true
	)
	ui.hour_changed.connect(func(hr: float):
		var day_idx := int(minute / 1440.0)
		minute = float(day_idx) * 1440.0 + clampf(hr, 0.0, 23.999) * 60.0
		_update_sun_and_ambience(0.0, true)
	)
	ui.clock_rate_selected.connect(func(rv: float):
		rate = rv
		if rv > 0.0:
			_saved_rate = rv
	)
	ui.poly_action.connect(_on_poly_action)
	ui.btn_copy_cam.pressed.connect(_copy_camera_view)
	ui.btn_copy_xz.pressed.connect(_copy_xz)


func _load_case(index_path: String, use_cmdline_at: bool) -> void:
	case_index = index_path
	if W != null:
		remove_child(W)
		W.queue_free()
		W = null
	traffic = null
	carts = null
	_shown = 0
	_has_pin = false
	_poly_pts.clear()
	_inspect_locked = false
	_last_event_n = -1
	_last_places_n = -1

	W = KratorWorldWalk.make(case_index, _collide)
	W.stream.flora_enabled = _flora_vis
	W.interactive = true
	add_child(W)
	W.cam.current = true
	W.stream.rebased.connect(_on_stream_rebased)
	var rframe = W.stream.index.get("frame")
	if rframe is Dictionary and rframe.get("origin_px") is Array and (rframe["origin_px"] as Array).size() >= 2:
		var opx: Array = rframe["origin_px"]
		_origin_px = Vector2(float(opx[0]), float(opx[1]))
		_m_per_px = float(rframe.get("m_per_px", 2000.0))
	else:
		var rname := str(W.stream.index.get("region", ""))
		_origin_px = Vector2(1007.0, 686.0) if rname == "pinnacle" else Vector2(1306.0, 1634.0)
		_m_per_px = 2000.0
	_build_overlays()

	var at := _start(use_cmdline_at)
	W.start_at(at.x, at.y)
	if _start_fly and use_cmdline_at:
		W.set_walk_mode(false)

	var sim_path := case_index.get_base_dir() + "/sim.json"
	if FileAccess.file_exists(sim_path):
		var sim = KData.read_json(sim_path)
		if sim is Dictionary:
			traffic = KratorValleyTraffic.make(W.stream.index, sim)
			carts = MultiMeshInstance3D.new()
			carts.name = "Carts"
			W.stream.add_child(carts)

	ui.populate_cases(case_index)
	ui.refresh_pois(W.stream, null)
	_apply_layers()
	_update_sun_and_ambience(0.0, true)


func _build_overlays() -> void:
	_overlays = Node3D.new()
	_overlays.name = "HostOverlays"
	W.add_child(_overlays)

	# 3D Gold Cursor Pin Beacon (survey rod + diamond crown + ground ring)
	_pin_node = Node3D.new()
	_pin_node.name = "CursorPin"
	_pin_node.visible = false
	_overlays.add_child(_pin_node)

	var pin_mat := StandardMaterial3D.new()
	pin_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	pin_mat.albedo_color = Color(1.0, 0.82, 0.24)
	pin_mat.cull_mode = BaseMaterial3D.CULL_DISABLED

	var pole := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.08
	cyl.bottom_radius = 0.05
	cyl.height = 6.0
	pole.mesh = cyl
	pole.position = Vector3(0.0, 3.0, 0.0)
	pole.material_override = pin_mat
	pole.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_pin_node.add_child(pole)

	var head_mi := MeshInstance3D.new()
	var sph := SphereMesh.new()
	sph.radius = 0.45
	sph.height = 0.90
	sph.radial_segments = 8
	sph.rings = 4
	head_mi.mesh = sph
	head_mi.position = Vector3(0.0, 6.2, 0.0)
	head_mi.material_override = pin_mat
	head_mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_pin_node.add_child(head_mi)

	var ring_mi := MeshInstance3D.new()
	var tor := TorusMesh.new()
	tor.inner_radius = 1.35
	tor.outer_radius = 1.65
	tor.rings = 24
	tor.ring_segments = 8
	ring_mi.mesh = tor
	ring_mi.position = Vector3(0.0, 0.12, 0.0)
	ring_mi.material_override = pin_mat
	ring_mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_pin_node.add_child(ring_mi)

	# 3D Polygon / Distance ImmediateMesh
	_poly_mi = MeshInstance3D.new()
	_poly_mi.name = "PolyOverlay"
	_poly_imm = ImmediateMesh.new()
	_poly_mi.mesh = _poly_imm
	var poly_mat := StandardMaterial3D.new()
	poly_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	poly_mat.vertex_color_use_as_albedo = true
	poly_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_poly_mi.material_override = poly_mat
	_poly_mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_overlays.add_child(_poly_mi)

	# Pooled OmniLight3D rig for Longsong indoor rooms (butter lamps + window daylight portals) and the subterranean Vault
	_ls_lights.clear()
	_ls_light_regs.clear()
	var is_compat_l := RenderingServer.get_current_rendering_method() == "gl_compatibility"
	for li in 10:
		var ol := OmniLight3D.new()
		ol.name = "LongsongLamp_%d" % li
		ol.visible = false
		ol.shadow_enabled = false
		ol.omni_shadow_mode = OmniLight3D.SHADOW_CUBE if is_compat_l else OmniLight3D.SHADOW_DUAL_PARABOLOID
		ol.shadow_bias = 0.04
		ol.shadow_normal_bias = 1.15
		ol.shadow_blur = 1.25
		ol.light_cull_mask = KInteriorsLight.INDOOR_LAYER
		ol.omni_attenuation = 1.3
		_overlays.add_child(ol)
		_ls_lights.append(ol)
		_ls_light_regs.append(Vector3.ZERO)


func _on_stream_rebased(_delta: Vector3) -> void:
	if _has_pin and _pin_node != null:
		_pin_node.position = W.stream.local(_pin_reg.x, _pin_reg.y, _pin_reg.z)
	if not _poly_pts.is_empty():
		_redraw_poly()
	for li in _ls_lights.size():
		var ol := _ls_lights[li] as OmniLight3D
		if ol != null and ol.visible and li < _ls_light_regs.size():
			var rp: Vector3 = _ls_light_regs[li]
			ol.position = W.stream.local(rp.x, rp.y, rp.z)


func _start(use_cmdline_at := true) -> Vector2:
	var I: Dictionary = W.stream.index
	if use_cmdline_at:
		for a in OS.get_cmdline_user_args():
			if a.begins_with("--at="):
				var v := a.trim_prefix("--at=")
				if v == "strongbow":
					var p := W.stream.place("sfgtxw10kr")
					if p.get("arcology") is Dictionary:
						var at: Array = p["arcology"]["at"]
						return Vector2(float(at[0]) + 120.0, float(at[2]))
					if p.has("pin"):
						return Vector2(p["pin"][0], p["pin"][1])
				var by_place := W.stream.place(v)
				if not by_place.is_empty() and by_place.has("pin"):
					return Vector2(float(by_place["pin"][0]), float(by_place["pin"][1]))
				for pl in I.get("places", []):
					if str(pl.get("name", "")).to_lower().find(v.to_lower()) >= 0 and pl.has("pin"):
						return Vector2(float(pl["pin"][0]), float(pl["pin"][1]))
				var xz := v.split(",")
				if xz.size() == 2:
					return Vector2(float(xz[0]), float(xz[1]))
	var r := _road(Vector2.ZERO)
	if r.size() > 0:
		return Vector2(r[0][0], r[0][1])
	var pls: Array = I.get("places", [])
	if pls.size() > 0 and pls[0].has("pin"):
		return Vector2(float(pls[0]["pin"][0]), float(pls[0]["pin"][1]))
	return Vector2.ZERO


func _road(near: Vector2) -> Array:
	var I: Dictionary = W.stream.index
	if I.get("route") is Dictionary and I["route"].has("link"):
		var R := W.stream.road(str(I["route"]["link"]))
		var pts := []
		for p in R.get("pts", []):
			pts.append([float(p[0]), float(p[1])])
		if R.get("from") != I["route"].get("from"):
			pts.reverse()
		return pts
	var best_pts := []
	var best_d := INF
	for R in I.get("roads", []):
		for p in R.get("pts", []):
			var d := Vector2(float(p[0]), float(p[1])).distance_to(near)
			if d < best_d:
				best_d = d
				best_pts = R.get("pts", [])
	var out := []
	for p in best_pts:
		out.append([float(p[0]), float(p[1])])
	return out


func _toggle_ride_road() -> void:
	if W.driving:
		W.driving = false
		return
	var here := W.focus_region_xz()
	var pts := _road(here)
	if pts.is_empty():
		return
	var best := 0
	var bd := INF
	for i in pts.size():
		var d := Vector2(pts[i][0], pts[i][1]).distance_to(here)
		if d < bd:
			bd = d
			best = i
	W.drive(pts.slice(best), 40.0)


func _go_to_poi(poi: Dictionary) -> void:
	if poi.is_empty():
		return
	var rpoi := KratorHostUI.resolve_poi(W.stream, poi, KratorWorldWalk.LOAD_R, KratorWorldWalk.KEEP_R)
	var eye: Vector3 = rpoi["eye"]
	var target: Vector3 = rpoi["target"]
	var as_walk := bool(rpoi.get("walk", false))
	var exact_eye := bool(rpoi.get("exact", false)) or str(rpoi.get("kind", "")) in ["interior", "vault"]
	W.set_view_region(eye, target, as_walk, exact_eye)
	_last_event_n = W.stream.events.size()
	_last_places_n = W.stream.places_open.size()
	_apply_layers()
	_update_sun_and_ambience(0.0, true)


func _place_pin(reg_pt: Vector3) -> void:
	_has_pin = true
	_pin_reg = reg_pt
	_pin_node.position = W.stream.local(reg_pt.x, reg_pt.y, reg_pt.z)
	_pin_node.visible = true
	ui.refresh_pois(W.stream, _pin_reg)


func _clear_pin() -> void:
	_has_pin = false
	if _pin_node != null:
		_pin_node.visible = false
	ui.refresh_pois(W.stream, null)


func _on_pin_action(act: String) -> void:
	if not _has_pin:
		return
	if act == "fly":
		W.fly_to_point(_pin_reg, 75.0)
	elif act == "walk":
		W.walk_at(_pin_reg.x, _pin_reg.z)
	elif act == "clear":
		_clear_pin()


func _on_tool_changed(t: String) -> void:
	_inspect_locked = false
	if t == "poly":
		_update_poly_readout()
	elif t == "inspect":
		ui.set_detail_text("OBJECT & RECORD INSPECTOR", "Hover any terrain, building, camp piece, or tree to inspect its core/tags record and shader; click to lock.", false)


func _on_poly_action(act: String) -> void:
	if act == "undo" and not _poly_pts.is_empty():
		_poly_pts.pop_back()
		_redraw_poly()
		_update_poly_readout()
	elif act == "clear":
		_poly_pts.clear()
		_redraw_poly()
		_update_poly_readout()
	elif act == "copy" and not _poly_pts.is_empty():
		var arr := []
		for p in _poly_pts:
			var pv: Vector3 = p
			arr.append([snappedf(pv.x, 0.1), snappedf(pv.z, 0.1)])
		DisplayServer.clipboard_set(JSON.stringify(arr))
		ui.flash_copied("Copied Poly!")


func _redraw_poly() -> void:
	if _poly_imm == null:
		return
	_poly_imm.clear_surfaces()
	if _poly_pts.is_empty():
		return
	_poly_imm.surface_begin(Mesh.PRIMITIVE_LINES)
	var c_post := Color(1.0, 0.84, 0.28)
	var c_seg := Color(0.38, 0.92, 1.0)
	var c_close := Color(1.0, 0.65, 0.24)
	for i in _poly_pts.size():
		var p: Vector3 = _poly_pts[i]
		var lp := W.stream.local(p.x, p.y + 0.18, p.z)
		_poly_imm.surface_set_color(c_post)
		_poly_imm.surface_add_vertex(lp)
		_poly_imm.surface_add_vertex(lp + Vector3(0.0, 2.2, 0.0))
		if i > 0:
			var prev: Vector3 = _poly_pts[i - 1]
			var lprev := W.stream.local(prev.x, prev.y + 0.24, prev.z)
			_poly_imm.surface_set_color(c_seg)
			_poly_imm.surface_add_vertex(lprev)
			_poly_imm.surface_add_vertex(lp + Vector3(0.0, 0.06, 0.0))
	if _poly_pts.size() >= 3:
		var p_last: Vector3 = _poly_pts[-1]
		var p_first: Vector3 = _poly_pts[0]
		_poly_imm.surface_set_color(c_close)
		_poly_imm.surface_add_vertex(W.stream.local(p_last.x, p_last.y + 0.24, p_last.z))
		_poly_imm.surface_add_vertex(W.stream.local(p_first.x, p_first.y + 0.24, p_first.z))
	_poly_imm.surface_end()


func _update_poly_readout() -> void:
	if _poly_pts.is_empty():
		ui.set_detail_text("POLYGON & DISTANCE MEASURE (P)", "Click points in 3D to measure path distance, elevation delta, and closed polygon area.", true)
		return
	var total := 0.0
	var last_seg := 0.0
	for i in range(1, _poly_pts.size()):
		last_seg = (_poly_pts[i] as Vector3).distance_to(_poly_pts[i - 1] as Vector3)
		total += last_seg
	var dy := (_poly_pts[-1] as Vector3).y - (_poly_pts[0] as Vector3).y
	var area := 0.0
	if _poly_pts.size() >= 3:
		for i in _poly_pts.size():
			var a: Vector3 = _poly_pts[i]
			var b: Vector3 = _poly_pts[(i + 1) % _poly_pts.size()]
			area += a.x * b.z - b.x * a.z
		area = absf(area) * 0.5
	var p_last: Vector3 = _poly_pts[-1]
	var txt := "Vertices: %d   Last: [%.1f, %.1f, %.1f]\nPath length: %.1f m   Last seg: %.1f m   Δy: %+.1f m" % [
		_poly_pts.size(), p_last.x, p_last.y, p_last.z, total, last_seg, dy]
	if _poly_pts.size() >= 3:
		var close_d := (_poly_pts[-1] as Vector3).distance_to(_poly_pts[0] as Vector3)
		txt += "\nClosed perimeter: %.1f m   2D Area: %.1f m² (%.2f ha)" % [total + close_d, area, area / 10000.0]
	ui.set_detail_text("POLYGON & DISTANCE MEASURE (P)", txt, true)


func _copy_camera_view() -> void:
	var cr := W.cam_region()
	var lk := W.look_region(50.0)
	var payload := {
		"region": str(W.stream.index.get("region", "")),
		"mode": "walk" if W.walk_mode else "fly",
		"cam": [snappedf(cr.x, 0.1), snappedf(cr.y, 0.1), snappedf(cr.z, 0.1)],
		"look": [snappedf(lk.x, 0.1), snappedf(lk.y, 0.1), snappedf(lk.z, 0.1)],
		"yaw_deg": snappedf(fposmod(rad_to_deg(W._yaw), 360.0), 0.1),
		"pitch_deg": snappedf(rad_to_deg(W._pitch), 0.1)
	}
	if _has_pin:
		payload["pin"] = [snappedf(_pin_reg.x, 0.1), snappedf(_pin_reg.y, 0.1), snappedf(_pin_reg.z, 0.1)]
	DisplayServer.clipboard_set(JSON.stringify(payload))
	ui.flash_copied("Copied View!")


func _copy_xz() -> void:
	var xz := Vector2(_pin_reg.x, _pin_reg.z) if _has_pin else W.focus_region_xz()
	DisplayServer.clipboard_set("%.1f, %.1f" % [xz.x, xz.y])
	ui.flash_copied("Copied XZ!")


func _apply_layers() -> void:
	if W == null:
		return
	W.stream.set_flora_visible(_flora_vis)
	for pid in W.stream.places_open:
		var pw: Node3D = W.stream.places_open[pid]
		var items := pw.get_node_or_null("Items")
		if items != null:
			for it in items.get_children():
				if it is Node3D:
					var is_flora := str((it.get_meta("krator", {}) as Dictionary).get("kit", "")) == "flora"
					(it as Node3D).visible = _flora_vis if is_flora else _builds_vis
		var bk := pw.get_node_or_null("Buckets")
		if bk != null:
			for b in bk.get_children():
				if b is MeshInstance3D:
					var is_fl := KratorWorldStream._is_foliage_bucket(b as MeshInstance3D)
					(b as MeshInstance3D).visible = _flora_vis if is_fl else _builds_vis
		var arc := pw.get_node_or_null("Arcology") as Node3D
		if arc != null:
			arc.visible = _builds_vis
		var mon := pw.get_node_or_null("Monastery") as Node3D
		if mon != null:
			mon.visible = _builds_vis or _flora_vis
			var m_it := mon.get_node_or_null("Items")
			if m_it != null:
				for it in m_it.get_children():
					if it is Node3D:
						var is_mfl := str((it.get_meta("krator", {}) as Dictionary).get("kit", "")) == "flora"
						(it as Node3D).visible = _flora_vis if is_mfl else _builds_vis
			var m_bk := mon.get_node_or_null("Buckets")
			if m_bk != null:
				for b in m_bk.get_children():
					if b is MeshInstance3D:
						var is_bfl := KratorWorldStream._is_foliage_bucket(b as MeshInstance3D)
						(b as MeshInstance3D).visible = _flora_vis if is_bfl else _builds_vis
			var m_gnd := mon.get_node_or_null("Terrain") as Node3D
			if m_gnd != null:
				m_gnd.visible = true
	_refresh_longsong_lights(true, 0.0)


# Raycasts physics (Terrain, Buckets, Arcology) and falls back to heightfield ray-marching for distant chunks
func _raycast_world(screen_pos: Vector2) -> Dictionary:
	if W == null or not W.cam.is_inside_tree():
		return {}
	var ro := W.cam.project_ray_origin(screen_pos)
	var rd := W.cam.project_ray_normal(screen_pos)
	if get_world_3d() != null:
		var sp := get_world_3d().direct_space_state
		var q := PhysicsRayQueryParameters3D.create(ro, ro + rd * 14000.0)
		q.exclude = [W.walker.get_rid()]
		var hit := sp.intersect_ray(q)
		if not hit.is_empty():
			var hp_local := W.to_local(hit["position"] as Vector3)
			var reg_arr: Array = W.stream.region(hp_local)
			return {
				"local": hp_local,
				"region": Vector3(float(reg_arr[0]), float(reg_arr[1]), float(reg_arr[2])),
				"normal": hit.get("normal", Vector3.UP),
				"collider": hit.get("collider"),
				"dist": ro.distance_to(hit["position"] as Vector3)
			}
	# Fallback heightfield march for distant uncollided terrain
	var cr := W.cam_region()
	var prev_t := 2.0
	var prev_above := INF
	for step_i in range(1, 65):
		var t := 2.0 + pow(float(step_i) / 64.0, 2.1) * 28000.0
		var pt := cr + rd * t
		var gh := W.stream.height_at(pt.x, pt.z)
		if is_finite(gh):
			var above := pt.y - gh
			if above <= 0.0 and prev_above > 0.0 and is_finite(prev_above):
				var lo := prev_t
				var hi := t
				for _b in 8:
					var mid := 0.5 * (lo + hi)
					var mp := cr + rd * mid
					var mh := W.stream.height_at(mp.x, mp.z)
					if is_finite(mh) and mp.y <= mh:
						hi = mid
					else:
						lo = mid
				var hit_reg := cr + rd * hi
				var fh := W.stream.height_at(hit_reg.x, hit_reg.z)
				if is_finite(fh):
					hit_reg.y = fh
				return {
					"local": W.stream.local(hit_reg.x, hit_reg.y, hit_reg.z),
					"normal": Vector3.UP,
					"region": hit_reg,
					"collider": null,
					"dist": hi
				}
			prev_above = above
		prev_t = t
	return {}


# Picks MultiMesh instances (trees, bridges, camp items, Monastery furniture) as well as solid Buckets & Terrain for the Inspector
func _inspect_at(screen_pos: Vector2) -> String:
	var hit := _raycast_world(screen_pos)
	var ro := W.cam.project_ray_origin(screen_pos)
	var rd := W.cam.project_ray_normal(screen_pos)
	var best_t: float = float(hit.get("dist", 4000.0))

	# Check nearby MultiMesh instances in open places & nested Monastery (flora, bridges, site items, indoor furniture)
	var best_inst := {}
	for pid in W.stream.places_open:
		var pw: Node3D = W.stream.places_open[pid]
		var roots := [pw]
		var mon_n := pw.get_node_or_null("Monastery") as Node3D
		if mon_n != null and mon_n.visible:
			roots.append(mon_n)
		for rnode in roots:
			var items := (rnode as Node3D).get_node_or_null("Items")
			if items == null or not items.visible:
				continue
			var tags: Dictionary = (rnode as Node3D).get_meta("tags", pw.get_meta("tags", {}))
			for child in items.get_children():
				var mmi := child as MultiMeshInstance3D
				if mmi == null or not mmi.visible or mmi.multimesh == null or mmi.multimesh.mesh == null:
					continue
				var mm := mmi.multimesh
				var aabb := mm.mesh.get_aabb()
				var buf := mm.buffer
				var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
				for i in mm.instance_count:
					var o := i * stride
					var sx := Vector3(buf[o], buf[o + 4], buf[o + 8]).length()
					var sy := Vector3(buf[o + 1], buf[o + 5], buf[o + 9]).length()
					var base_w := mmi.to_global(Vector3(buf[o + 3], buf[o + 7], buf[o + 11]))
					var c_w := base_w + Vector3(0.0, (aabb.position.y + aabb.size.y * 0.5) * sy, 0.0)
					var rad := maxf(maxf(aabb.size.x, aabb.size.z) * 0.45 * sx, 0.35)
					var half_h := maxf(aabb.size.y * 0.5 * sy, 0.35)
					var to_c := c_w - ro
					var proj := to_c.dot(rd)
					if proj < 0.3 or proj > best_t + rad:
						continue
					var closest := ro + rd * proj
					var dxz := Vector2(closest.x - c_w.x, closest.z - c_w.z).length()
					var dy := absf(closest.y - c_w.y)
					if dxz <= rad and dy <= half_h and proj - rad * 0.35 < best_t:
						best_t = maxf(0.3, proj - rad * 0.35)
						var r_arr: Array = W.stream.region(W.to_local(base_w))
						var reg_pos := Vector3(float(r_arr[0]), float(r_arr[1]), float(r_arr[2]))
						best_inst = {"mmi": mmi, "idx": i, "place": pid, "tags": tags, "pos": reg_pos, "dist": proj, "height": aabb.size.y * sy}

	if not best_inst.is_empty():
		var mmi: MultiMeshInstance3D = best_inst["mmi"]
		var idx: int = best_inst["idx"]
		var kmeta: Dictionary = mmi.get_meta("krator", {})
		var tags: Dictionary = best_inst["tags"]
		var p: Vector3 = best_inst["pos"]
		var uids: PackedStringArray = mmi.get_meta("krator_records", PackedStringArray())
		var uid := uids[idx] if idx < uids.size() else ""
		var set_id := str(mmi.get_meta("krator_record", ""))
		var owners: Array = mmi.get_meta("krator_owners", [])
		var own_id := str(owners[idx]) if idx < owners.size() and owners[idx] != null else ""
		var rec: Dictionary = tags.get(own_id, tags.get(set_id, {}))
		var sh_name := _shader_label(mmi.material_override)
		var lines := PackedStringArray()
		lines.append("Item:     %s  (instance #%d of %d, %.1f m away)" % [str(kmeta.get("label", kmeta.get("name", "?"))), idx, int(kmeta.get("count", 0)), float(best_inst["dist"])])
		lines.append("Coords:   x %.1f   y %.1f   z %.1f   (H ~%.1f m, place %s)" % [p.x, p.y, p.z, float(best_inst["height"]), str(best_inst["place"])])
		if not rec.is_empty():
			lines.append("Record:   id=%s  class=%s  kind=%s  name=%s%s" % [
				str(rec.get("id", set_id)), str(rec.get("class", "?")), str(rec.get("kind", "?")),
				str(rec.get("name", "?")), ("  uid=" + uid if uid != "" else "")])
		lines.append("Shader:   %s   mat=%s" % [sh_name, str(kmeta.get("material", "?"))])
		return "\n".join(lines)

	if hit.is_empty():
		return "Sky / Horizon (no surface under cursor)"

	var reg: Vector3 = hit["region"]
	var dist := float(hit["dist"])
	var col = hit.get("collider")
	var parent_mi := (col as Node).get_parent() as MeshInstance3D if col is Node else null
	if parent_mi != null and parent_mi.name.begins_with("bucket_"):
		var pw := parent_mi.get_parent().get_parent()
		var tags: Dictionary = pw.get_meta("tags", {}) if pw != null and pw.has_meta("tags") else {}
		var kmeta: Dictionary = parent_mi.get_meta("krator", {})
		var rids: PackedStringArray = parent_mi.get_meta("krator_record_ids", PackedStringArray())
		var best_rec := _nearest_record_at(tags, rids, reg)
		var lines := PackedStringArray()
		lines.append("Bucket:   %s  (%s, %.1f m away)" % [str(kmeta.get("label", "?")), parent_mi.name, dist])
		lines.append("Coords:   x %.1f   y %.1f   z %.1f" % [reg.x, reg.y, reg.z])
		if not best_rec.is_empty():
			lines.append("Record:   id=%s  uid=%s  class=%s  kind=%s  name=%s" % [
				str(best_rec.get("id", "?")), str(best_rec.get("uid", "?")),
				str(best_rec.get("class", "?")), str(best_rec.get("kind", "?")), str(best_rec.get("name", best_rec.get("kind", "?")))])
		lines.append("Shader:   %s   mat=%s" % [_shader_label(parent_mi.material_override), str(kmeta.get("material", "?"))])
		return "\n".join(lines)

	var nrm: Vector3 = hit.get("normal", Vector3.UP)
	var slope_deg := rad_to_deg(acos(clampf(absf(nrm.y), 0.0, 1.0)))
	var plc := W.stream.place_covering(reg.x, reg.z)
	var chk := W.stream.covering(reg.x, reg.z)
	return "Terrain:  %s  (%.1f m away)\nCoords:   x %.1f   y %.1f   z %.1f   slope %.1f°\nShader:   terrain.gdshader (S3/S4 PBR detail + cavity AO)" % [
		("Place " + plc + " (8 m grid)" if plc != "" else "Chunk " + chk + " (64 m grid)"),
		dist, reg.x, reg.y, reg.z, slope_deg]


static func _nearest_record_at(tags: Dictionary, rids: PackedStringArray, reg: Vector3) -> Dictionary:
	var best := {}
	var best_d := INF
	for id in rids:
		if tags.has(id):
			var r: Dictionary = tags[id]
			if r.get("at") is Array:
				var at: Array = r["at"]
				var d := Vector2(float(at[0]) - reg.x, float(at[2]) - reg.z).length()
				if d < best_d:
					best_d = d
					best = r
	if best.is_empty() and rids.size() > 0 and tags.has(rids[0]):
		return tags[rids[0]]
	return best


static func _shader_label(mat: Material) -> String:
	if mat is ShaderMaterial and (mat as ShaderMaterial).shader != null:
		return (mat as ShaderMaterial).shader.resource_path.get_file()
	if mat is StandardMaterial3D:
		return "StandardMaterial3D"
	return "none"


func _check_indoors() -> bool:
	_in_vault = false
	_indoor_room_id = ""
	var probe_reg: Vector3
	if not W.walk_mode:
		probe_reg = W.cam_region()
	else:
		var wxz := W.region_xz()
		probe_reg = Vector3(wxz.x, W.feet_y() + 1.15, wxz.y)
	var mrm := W.stream.monastery_room_at(probe_reg, 0.55)
	if not mrm.is_empty():
		_in_vault = bool(mrm.get("vault", false))
		_indoor_room_id = str(mrm.get("id", ""))
		return true
	var probe_g := W.cam.global_position if not W.walk_mode else (W.walker.global_position + Vector3(0.0, 0.5, 0.0))
	for pid in W.stream.places_open:
		var pw: Node3D = W.stream.places_open[pid]
		var frame := pw.get_node_or_null("PageFrame") as Node3D
		var host: Node = frame if (frame != null and frame.has_meta("rooms")) else pw
		if host.has_meta("rooms") and host is Node3D and (host as Node3D).is_inside_tree():
			var p_in_host := (host as Node3D).to_local(probe_g)
			var rid_other := KratorLampPool.room_at(host.get_meta("rooms"), p_in_host)
			if rid_other != "":
				_indoor_room_id = rid_other
				return true
	return false


func _refresh_longsong_lights(force: bool, dt := 0.0) -> void:
	if W == null or _ls_lights.is_empty():
		return
	_ls_light_timer += dt
	if not force and _ls_light_timer < 0.18:
		return
	_ls_light_timer = 0.0
	var mon: Node3D = null
	for pid in W.stream.places_open:
		var pw: Node3D = W.stream.places_open[pid]
		var mn := pw.get_node_or_null("Monastery") as Node3D
		if mn != null and mn.has_meta("interiors_meta") and mn.has_meta("monastery"):
			mon = mn
			break
	if mon == null:
		for ol in _ls_lights:
			var l0 := ol as OmniLight3D
			l0.visible = false
			l0.shadow_enabled = false
		return
	var sun_up := clampf((-sun.global_transform.basis.z.y + 0.06) / 0.28, 0.0, 1.0) if sun != null else 1.0
	var night_k := 1.0 - sun_up
	KInteriorsLight.update_uniforms(mon, sun_up, 0.72 + 1.05 * night_k, _mask_indoor_sun, _use_corner_ao)
	var M: Dictionary = mon.get_meta("monastery")
	var imeta: Dictionary = mon.get_meta("interiors_meta")
	var mat_at: Array = M.get("at", [0.0, 0.0, 0.0])
	var m_orig := Vector3(float(mat_at[0]), float(mat_at[1]), float(mat_at[2]))
	var ry := float(M.get("ry", 0.0))
	var m_rot := Basis(Vector3.UP, ry)
	var cr := W.cam_region()
	var lp := Basis(Vector3.UP, -ry) * (cr - m_orig)
	if absf(lp.x) > 360.0 or absf(lp.z) > 320.0:
		for ol in _ls_lights:
			var l1 := ol as OmniLight3D
			l1.visible = false
			l1.shadow_enabled = false
		return
	var is_compat := RenderingServer.get_current_rendering_method() == "gl_compatibility"
	var max_l := mini(6 if is_compat else 10, _ls_lights.size())
	var chosen := []   # Array of Dictionaries {reg_pos, color, energy, range, shadow}
	if _in_vault or lp.y < -1.5:
		var Ldict: Dictionary = imeta.get("lights", {})
		var pulse := 0.88 + 0.18 * sin(Time.get_ticks_msec() * 0.0012)
		var lk_reg := W.look_region(14.0)
		var lk_lp := Basis(Vector3.UP, -ry) * (lk_reg - m_orig)
		var v_cand := []
		for vl in Ldict.get("vault", []):
			var vp := Vector3(float(vl[0]), float(vl[1]), float(vl[2]))
			var d_eye := vp.distance_to(lp)
			var d_lk := vp.distance_to(lk_lp)
			var d_eff := minf(d_eye, d_lk * 0.85)
			if d_eff <= 96.0:
				var col := KData.colour(str(vl[3]), true)
				var raw_k := float(vl[4])
				var raw_r := float(vl[5])
				var en := raw_k * 3.4 * (pulse if vp.y < -30.0 else 1.0)
				var rng := maxf(11.0, raw_r * 1.4)
				var sort_key := (d_eff + 3.5) / maxf(0.35, raw_k * (raw_r / 11.0))
				v_cand.append({"score": sort_key, "reg_pos": m_orig + m_rot * vp, "color": col, "energy": en, "range": rng, "shadow": false})
		v_cand.sort_custom(func(a, b): return float(a["score"]) < float(b["score"]))
		for vi in mini(max_l, v_cand.size()):
			var vd: Dictionary = v_cand[vi]
			if vi < 2:
				vd["shadow"] = true
			chosen.append(vd)
	elif _indoors and _indoor_room_id != "":
		chosen = KInteriorsLight.pick_pool(imeta, M, lp, _indoor_room_id, sun_up, max_l, 2)
	var m_items := mon.get_node_or_null("Items")
	if m_items != null and _builds_vis:
		var near_xz2 := 46.0 * 46.0 if _indoors else 195.0 * 195.0
		var near_y := 8.5 if _indoors else 140.0
		for ch in m_items.get_children():
			if ch is MultiMeshInstance3D and (ch as Node).has_meta("furn_pts"):
				var pts: PackedVector3Array = (ch as Node).get_meta("furn_pts")
				var show_f := false
				for fp in pts:
					if absf(fp.y - lp.y) <= near_y:
						var dx := fp.x - lp.x
						var dz := fp.z - lp.z
						if dx * dx + dz * dz <= near_xz2:
							show_f = true
							break
				(ch as MultiMeshInstance3D).visible = show_f
	for i in _ls_lights.size():
		var ol := _ls_lights[i] as OmniLight3D
		if i < mini(max_l, chosen.size()):
			var c_entry: Dictionary = chosen[i]
			var rpos: Vector3 = c_entry["reg_pos"]
			_ls_light_regs[i] = rpos
			ol.position = W.stream.local(rpos.x, rpos.y, rpos.z)
			ol.light_color = c_entry["color"]
			ol.light_energy = float(c_entry["energy"]) * (1.25 if is_compat else 1.0)
			ol.omni_range = float(c_entry["range"])
			ol.omni_attenuation = 0.72 if _in_vault else 1.25
			ol.shadow_enabled = bool(c_entry.get("shadow", false))
			ol.visible = true
		else:
			ol.visible = false
			ol.shadow_enabled = false
			ol.light_energy = 0.0


func _update_sun_and_ambience(dt: float, snap: bool) -> void:
	var hr := fmod(minute, 1440.0) / 60.0
	var day_idx := floorf(minute / 1440.0)
	if W != null:
		_indoors = _check_indoors()
	if sky_node != null:
		if rate > 0.0:
			sky_node._t += dt
		sky_node.hour = hr
		sky_node.day = season_day + day_idx
		var base_y := 0.0
		var cr := Vector3(0.0, 1.7, 0.0)
		if W != null:
			cr = W.cam_region()
			sky_node.site_px = _origin_px + Vector2(cr.x, cr.z) / maxf(1.0, _m_per_px)
			var gh := W.stream.height_at(cr.x, cr.z)
			base_y = maxf(0.0, gh if is_finite(gh) else cr.y)
		sky_node.preset["clouds"]["height"] = maxf(1800.0, base_y + 1650.0)
		sky_node.preset["clouds"]["cirrusHeight"] = maxf(9000.0, base_y + 7200.0)
		sky_node._update()
		if W != null and sky_node.mat != null:
			sky_node.mat.set_shader_parameter("uCamPos", Vector3(fmod(cr.x, 260000.0), cr.y, fmod(cr.z, 260000.0)))
		# Stage 7 I1: Indoor faces mask directional sun in library_interior.gdshader, so outdoor sun stays full-bright for views out windows!
		sun.light_energy = 0.0 if _in_vault else clampf(sun.light_energy * 0.68, 0.0, 1.45)
		if sky_node.shine != null:
			sky_node.shine.light_energy = 0.0 if _in_vault else sky_node.shine.light_energy
	var atm = get_node_or_null("/root/Atmos")
	if atm != null and "hour" in atm:
		atm.hour = hr
	env_res.ambient_light_color = Color(0.24, 0.22, 0.27) if _in_vault else Color(0.18, 0.16, 0.15)
	env_res.ambient_light_energy = 1.0
	var want_sky := 0.0 if _in_vault else 0.95
	env_res.ambient_light_sky_contribution = want_sky if snap else lerpf(env_res.ambient_light_sky_contribution, want_sky, clampf(dt * 5.0, 0.0, 1.0))
	_refresh_longsong_lights(snap, dt)


func _unhandled_input(ev: InputEvent) -> void:
	if W == null:
		return
	if ev is InputEventMouseButton:
		var mb := ev as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_WHEEL_UP and mb.pressed:
			var h_in := _raycast_world(mb.position)
			W.dolly_wheel(h_in.get("local"), true, mb.shift_pressed)
		elif mb.button_index == MOUSE_BUTTON_WHEEL_DOWN and mb.pressed:
			var h_out := _raycast_world(mb.position)
			W.dolly_wheel(h_out.get("local"), false, mb.shift_pressed)
		elif mb.button_index == MOUSE_BUTTON_RIGHT:
			_rmb_down = mb.pressed
		elif mb.button_index == MOUSE_BUTTON_MIDDLE:
			_mmb_down = mb.pressed
		elif mb.button_index == MOUSE_BUTTON_LEFT:
			if mb.pressed:
				if mb.double_click:
					var dhit := _raycast_world(mb.position)
					if not dhit.is_empty():
						var rpt: Vector3 = dhit["region"]
						_place_pin(rpt)
						if mb.shift_pressed:
							W.walk_at(rpt.x, rpt.z)
					_lmb_down = false
				else:
					_lmb_down = true
					_lmb_press_pos = mb.position
					_lmb_dragged = false
			else:
				if _lmb_down and not _lmb_dragged:
					_handle_viewport_click(mb.position)
				_lmb_down = false
	elif ev is InputEventMouseMotion:
		var mm := ev as InputEventMouseMotion
		if _lmb_down and mm.position.distance_to(_lmb_press_pos) > 5.0:
			_lmb_dragged = true
		if _mmb_down or (_rmb_down and mm.shift_pressed and not W.walk_mode):
			W.pan_drag(mm.relative.x, mm.relative.y)
		elif _rmb_down or (_lmb_down and _lmb_dragged):
			W.look_drag(mm.relative.x * 0.0042, mm.relative.y * 0.0042)
	elif ev is InputEventKey and ev.pressed and not ev.echo:
		var kc := (ev as InputEventKey).keycode
		if kc == KEY_H or kc == KEY_F1:
			ui.set_chrome_visible(not ui.chrome_visible)
		elif kc == KEY_F:
			if ev.shift_pressed and _has_pin:
				W.walk_at(_pin_reg.x, _pin_reg.z)
			else:
				W.set_walk_mode(not W.walk_mode)
		elif kc == KEY_V:
			if W.walk_mode:
				W.first_person = not W.first_person
				W._follow(true)
		elif kc == KEY_G:
			if ev.shift_pressed or not _has_pin:
				W.to_ground()
			else:
				W.fly_to_point(_pin_reg, 75.0)
		elif kc == KEY_C:
			ui.set_active_tool("" if ui.active_tool == "pin" else "pin")
			_on_tool_changed(ui.active_tool)
		elif kc == KEY_I:
			ui.set_active_tool("" if ui.active_tool == "inspect" else "inspect")
			_on_tool_changed(ui.active_tool)
		elif kc == KEY_P:
			ui.set_active_tool("" if ui.active_tool == "poly" else "poly")
			_on_tool_changed(ui.active_tool)
		elif (kc == KEY_Z or kc == KEY_BACKSPACE) and ui.active_tool == "poly":
			_on_poly_action("undo")
		elif kc == KEY_R:
			_toggle_ride_road()
		elif kc == KEY_ESCAPE:
			if W.driving:
				W.driving = false
			elif _inspect_locked:
				_inspect_locked = false
			elif ui.active_tool != "":
				ui.set_active_tool("")
				_on_tool_changed("")
			elif _has_pin:
				_clear_pin()
		elif kc == KEY_0:
			if rate > 0.0:
				_saved_rate = rate
				rate = 0.0
			else:
				rate = maxf(1.0, _saved_rate)
		elif kc == KEY_COMMA or kc == KEY_BRACKETLEFT:
			rate = 0.0 if rate <= 1.0 else maxf(1.0, rate / 2.0)
		elif kc == KEY_PERIOD or kc == KEY_BRACKETRIGHT:
			rate = 1.0 if rate <= 0.0 else minf(3840.0, rate * 2.0)


func _handle_viewport_click(screen_pos: Vector2) -> void:
	if ui.active_tool == "pin":
		var hit := _raycast_world(screen_pos)
		if not hit.is_empty():
			_place_pin(hit["region"] as Vector3)
	elif ui.active_tool == "poly":
		var phit := _raycast_world(screen_pos)
		if not phit.is_empty():
			_poly_pts.append(phit["region"] as Vector3)
			_redraw_poly()
			_update_poly_readout()
	elif ui.active_tool == "inspect":
		var txt := _inspect_at(screen_pos)
		if txt.begins_with("Sky /"):
			_inspect_locked = false
			ui.set_detail_text("OBJECT & RECORD INSPECTOR (hover or click)", txt, false)
		else:
			_inspect_locked = not _inspect_locked
			var ttl := "OBJECT & RECORD INSPECTOR [LOCKED — click sky or Esc to unlock]" if _inspect_locked else "OBJECT & RECORD INSPECTOR (hover or click)"
			ui.set_detail_text(ttl, txt, false)


func _process(dt: float) -> void:
	if W == null:
		return
	var focus_owner := get_viewport().gui_get_focus_owner()
	W.keyboard_enabled = not (focus_owner is LineEdit or focus_owner is TextEdit)
	if W.walk_mode and W.keyboard_enabled:
		if Input.is_key_pressed(KEY_Q):
			W.turn(1.5 * dt)
		if Input.is_key_pressed(KEY_E):
			W.turn(-1.5 * dt)
	if not W.driving:
		W.speed = 6.0

	if W.stream.events.size() != _last_event_n or W.stream.places_open.size() != _last_places_n:
		_last_event_n = W.stream.events.size()
		_last_places_n = W.stream.places_open.size()
		_apply_layers()

	minute = fmod(minute + rate * dt, 10080.0)
	_update_sun_and_ambience(dt, false)

	_tt += dt
	if traffic and _tt >= 0.1:
		_tt = 0.0
		_shown = traffic.draw(W.stream, carts, minute, W.focus_region_xz(), 20000.0)

	if ui.active_tool == "inspect" and not _inspect_locked and ui.chrome_visible:
		_hover_timer += dt
		if _hover_timer >= 0.08:
			_hover_timer = 0.0
			ui.set_detail_text("OBJECT & RECORD INSPECTOR (hover or click)", _inspect_at(get_viewport().get_mouse_position()), false)

	var reg := str(W.stream.index.get("region", "?"))
	ui.sync_state(W, reg, minute, rate, _gi_on, _has_pin)
	ui.coords_lbl.text = KratorHostUI.format_coords(W, _indoors, _pin_reg if _has_pin else null, _shown)
