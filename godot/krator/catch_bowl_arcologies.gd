# Ancient Arcologies placed on the Catch & Bowl map (openworld/catch-bowl/PLAN-SITES.md):
#   - Parabola (scyeauyek7, px 970,1186): Bowl parabolic solar-furnace dish arcology (kits/ancients parabola, d=1)
#   - Arcbeam / North-Road Iziz Arcology (skz25tuq0w, px 1016,1058): refurbished plateau arcology (kits/ancients arckibuz, d=3)
#   - Stair (s2o8f4p123, px 1106,1442): ruined terraced Hill Arcology above Stair's oasis (kits/ancients hill, d=1)
#   - Unmarked Ancient Ruin (sodpa02bfv, px 1344,1409): ruined 1,100 m Slab Monolith — unlit, unlabelled, no road/trail
class_name KratorCatchBowlArcologies
extends Node3D

const KRand := preload("res://tests/rand/krand.gd")
const ROCK_SHADER := preload("res://shaders/desert_rock.gdshader")
const MANIFEST_PATH := "res://data/catch-bowl/arcologies/arcologies.json"

var host: Node3D
var cam: Camera3D
var arcology_nodes := {}          # site_id -> Node3D
var arcology_records := {}        # site_id -> Dictionary
var _geom_by_site := {}           # site_id -> Array[GeometryInstance3D]
var _shadow_on := {}              # site_id -> bool


func bind(h: Node3D, c: Camera3D) -> void:
	host = h
	cam = c
	_load_all()
	_update_culling()


func _process(_dt: float) -> void:
	_update_culling()


func _update_culling() -> void:
	if cam == null:
		return
	var eye := cam.global_position
	for sid in arcology_nodes:
		var holder := arcology_nodes[sid] as Node3D
		if holder == null:
			continue
		var dist := eye.distance_to(holder.global_position)
		holder.visible = dist <= 185000.0
		var want_sh := dist <= 12000.0
		if _shadow_on.get(sid, false) != want_sh:
			_shadow_on[sid] = want_sh
			var setting := GeometryInstance3D.SHADOW_CASTING_SETTING_ON if want_sh else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			for gi in _geom_by_site.get(sid, []):
				if is_instance_valid(gi):
					(gi as GeometryInstance3D).cast_shadow = setting


func loaded_count() -> int:
	return arcology_nodes.size()


func has_site(site_id: String) -> bool:
	return arcology_nodes.has(site_id)


func _load_all() -> void:
	if host == null or not FileAccess.file_exists(MANIFEST_PATH):
		print("  arcologies: no manifest at %s (run openworld/catch-bowl/tools/export_assets_godot.py)" % MANIFEST_PATH)
		return
	var doc = KData.read_json(MANIFEST_PATH)
	if not (doc is Dictionary) or not (doc.get("arcologies") is Array):
		return
	var meta: Dictionary = host.meta if "meta" in host else {}
	var off: Array = meta.get("origin_offset_m", [0.0, 0.0])
	var sites_by_id := {}
	for s in meta.get("sites", []):
		if s is Dictionary and s.has("id"):
			sites_by_id[String(s["id"])] = s

	var base_dir := MANIFEST_PATH.get_base_dir() + "/"
	for rec in doc["arcologies"]:
		if not (rec is Dictionary):
			continue
		var sid := String(rec.get("site_id", ""))
		var key := String(rec.get("key", ""))
		var glb_path := base_dir + String(rec.get("glb", key + ".glb"))
		if not sites_by_id.has(sid) or not FileAccess.file_exists(glb_path):
			continue
		var srec: Dictionary = sites_by_id[sid]
		var wx := float(srec["x"]) - float(off[0])
		var wz := float(srec["z"]) - float(off[1])
		var half_m := float(rec.get("half_m", 900.0))
		var ruined := bool(rec.get("ruined", false))
		var yaw_deg := float(rec.get("yaw_deg", 0.0))

		var g_center: float = host.height_at(wx, wz)
		var g_min := g_center
		var g_max_inner := g_center
		for i in 16:
			var ang := TAU * float(i) / 16.0
			var r_out := half_m * 0.78
			var r_in := half_m * 0.36
			var ho: float = host.height_at(wx + cos(ang) * r_out, wz + sin(ang) * r_out)
			var hi: float = host.height_at(wx + cos(ang) * r_in, wz + sin(ang) * r_in)
			g_min = minf(g_min, ho)
			g_max_inner = maxf(g_max_inner, hi)

		var seat_y := g_center
		if key == "hill":
			seat_y = g_center - 6.0
		elif key == "parabola":
			# Seat Parabola on a mountainside bench so uphill rim clears the slope and downhill piers stand on a plinth
			seat_y = lerpf(g_center, g_max_inner, 0.45)

		var holder := Node3D.new()
		holder.name = "Arcology_" + key
		holder.position = Vector3(wx, seat_y, wz)
		holder.rotation.y = deg_to_rad(yaw_deg)

		# Build a battered stone/bedrock bench plinth whenever the footprint overhangs sloping 2 km ground
		var drop := (seat_y - g_min) + 28.0
		if key != "hill" and drop > 18.0:
			var bench_r := half_m * (0.68 if key == "parabola" else (0.48 if key == "monolith" else 0.76))
			var plinth := _build_bench_plinth(bench_r, drop, wx, wz, key)
			holder.add_child(plinth)

		var built := KratorGltf.build(glb_path)
		built.name = "Model"
		holder.add_child(built)
		var geoms: Array = []
		_tune_materials(holder, ruined, geoms)
		_geom_by_site[sid] = geoms
		_shadow_on[sid] = false
		add_child(holder)

		arcology_nodes[sid] = holder
		arcology_records[sid] = rec

		# Replace the grey placeholder BoxMesh for sodpa02bfv (and hide near-pin spike right on top of placed arcologies)
		if "_pins" in host and host._pins != null:
			var pin := (host._pins as Node3D).get_node_or_null(sid)
			if pin != null and bool(rec.get("unlabelled", false)):
				pin.get_parent().remove_child(pin)
				pin.queue_free()

	print("  arcologies: placed %d megastructures (%s)" % [arcology_nodes.size(), ", ".join(PackedStringArray(arcology_nodes.keys()))])


func _tune_materials(root: Node, ruined: bool, geoms: Array) -> void:
	var stack: Array[Node] = [root]
	while stack.size() > 0:
		var n: Node = stack.pop_back()
		if n is GeometryInstance3D:
			var gi := n as GeometryInstance3D
			gi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			geoms.append(gi)
			if gi.material_override != null and ruined:
				_strip_emissive(gi.material_override)
		var mesh: Mesh = null
		if n is MeshInstance3D:
			mesh = (n as MeshInstance3D).mesh
		elif n is MultiMeshInstance3D and (n as MultiMeshInstance3D).multimesh != null:
			mesh = (n as MultiMeshInstance3D).multimesh.mesh
		if mesh != null and ruined:
			for s in mesh.get_surface_count():
				var sm := mesh.surface_get_material(s)
				if sm != null:
					_strip_emissive(sm)
		for c in n.get_children():
			stack.append(c)


func _strip_emissive(m: Material) -> void:
	if m is BaseMaterial3D:
		(m as BaseMaterial3D).emission_enabled = false
		(m as BaseMaterial3D).emission_energy_multiplier = 0.0
	elif m is ShaderMaterial:
		var sm := m as ShaderMaterial
		sm.set_shader_parameter("emissive_energy", 0.0)
		sm.set_shader_parameter("emissive", Color(0.0, 0.0, 0.0))


func _build_bench_plinth(top_r: float, drop_m: float, wx: float, wz: float, key: String) -> MeshInstance3D:
	var segs := 28
	var rings := 4
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var base_col: Color = host.surface_tint_at(wx, wz) if host.has_method("surface_tint_at") else Color(0.54, 0.42, 0.31)
	var rock_col := base_col.darkened(0.14)
	var salt: int = KRand.cell(9103, key.hash() & 0xffff, 17)
	var verts_per_ring := segs + 1
	for ri in range(rings + 1):
		var t := float(ri) / float(rings)
		var y := 0.2 - t * drop_m
		var flare := top_r + t * drop_m * 0.72
		for si in range(verts_per_ring):
			var si_wrap := si % segs
			var a := TAU * float(si_wrap) / float(segs)
			var wob := 0.92 + 0.14 * KRand.unit(KRand.mix32(salt + si_wrap * 131 + ri * 17))
			var rr := flare * (1.0 if ri == 0 else wob)
			st.set_color(rock_col)
			st.set_custom_format(0, SurfaceTool.CUSTOM_RGBA_FLOAT)
			st.set_custom(0, Color(base_col.r, base_col.g, base_col.b, maxf(24.0, drop_m)))
			st.add_vertex(Vector3(cos(a) * rr, y, sin(a) * rr))
	for ri in range(rings):
		for si in range(segs):
			var a0 := ri * verts_per_ring + si
			var b0 := a0 + 1
			var c0 := a0 + verts_per_ring
			var d0 := c0 + 1
			st.add_index(a0); st.add_index(b0); st.add_index(c0)
			st.add_index(b0); st.add_index(d0); st.add_index(c0)
	# Top terrace deck cap at y = 0.2 m (proper non-zero radial triangles around center)
	var center_idx := (rings + 1) * verts_per_ring
	st.set_color(rock_col)
	st.set_custom(0, Color(base_col.r, base_col.g, base_col.b, maxf(24.0, drop_m)))
	st.add_vertex(Vector3(0.0, 0.2, 0.0))
	for si in range(segs):
		st.add_index(center_idx)
		st.add_index(si + 1)
		st.add_index(si)
	st.generate_normals()
	var mi := MeshInstance3D.new()
	mi.name = "BenchPlinth"
	mi.mesh = st.commit()
	var mat := ShaderMaterial.new()
	mat.shader = ROCK_SHADER
	mat.set_shader_parameter("family_mode", 0)
	mat.set_shader_parameter("skirt_height", 12.0)
	mat.set_shader_parameter("varnish_strength", 0.55)
	if "layer_albedo_arr" in host and host.layer_albedo_arr != null and host.layer_nr_arr != null:
		mat.set_shader_parameter("gl_albedo", host.layer_albedo_arr)
		mat.set_shader_parameter("gl_nr", host.layer_nr_arr)
		mat.set_shader_parameter("has_layers", true)
	mi.material_override = mat
	return mi
