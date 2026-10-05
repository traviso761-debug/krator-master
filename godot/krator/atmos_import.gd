# krator-atmos JSON (ATMOS.export(), core/atmos/89-atmos-8-export.js) to a Godot scene, per core/atmos/GODOT.md:
# the presets go to the Atmos autoload, lamps and lights become Light3D nodes run by their hours, halos a MultiMesh
# of billboards, props one MultiMeshInstance3D per set, smoke GPUParticles3D, fog banks FogVolume (Forward+ only).
# Colours in this export are display-space (sRGB), unlike the biome export's linear ones.
class_name KratorAtmos
extends RefCounted

const HALO := preload("res://shaders/halo.gdshader")


static func build(path: String) -> Node3D:
	var t0 := Time.get_ticks_msec()
	var root := Node3D.new()
	root.name = "Atmos"
	var report := {"route": "krator-atmos JSON", "file": path, "gaps": {}, "counts": {}}
	var d = KData.read_json(path)
	if not (d is Dictionary) or d.get("format") != "krator-atmos":
		report["gaps"]["format"] = "not a krator-atmos file"
		root.set_meta("report", report)
		return root
	Atmos.load_presets(d)
	var presets: Dictionary = d["presets"]

	var lights := Node3D.new()
	lights.name = "Lights"
	lights.set_script(load("res://krator/atmos_lights.gd"))
	root.add_child(lights)

	# street lamps: an OmniLight3D each (Forward+ clusters hundreds; Compatibility caps lights per mesh)
	for l in d["lamps"]:
		var o := OmniLight3D.new()
		o.position = _v3(l["at"])
		o.omni_range = 16.0
		o.light_color = Color(1.0, 0.85, 0.45).srgb_to_linear()
		o.set_meta("hours", l["hours"])
		o.set_meta("energy", 1.6)
		o.set_meta("kind", "lamp")
		lights.add_child(o)
	report["gaps"]["lamp light"] = "a lamp record has a position and hours only: range, colour and energy are guessed here (16 m, the glow's colour, 1.6)"

	# halos: one MultiMesh of camera-facing quads; hours in INSTANCE_CUSTOM
	var glow: Array = d["glow"]
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.use_custom_data = true
	var q := QuadMesh.new()
	q.size = Vector2(1, 1)
	mm.mesh = q
	mm.instance_count = glow.size()
	for i in glow.size():
		var g: Dictionary = glow[i]
		var s: float = float(g["size"])
		mm.set_instance_transform(i, Transform3D(Basis().scaled(Vector3(s, s, s)), _v3(g["at"])))
		mm.set_instance_color(i, KData.colour(g["color"], true))
		var hr: Array = g["hours"]
		mm.set_instance_custom_data(i, Color(float(hr[0]), float(hr[1]), 0, 0))
	var mmi := MultiMeshInstance3D.new()
	mmi.name = "Glow"
	mmi.multimesh = mm
	var hm := ShaderMaterial.new()
	hm.shader = HALO
	hm.set_shader_parameter("gain", float(presets.get("glow", {}).get("gain", 1.7)) * 0.6)
	mmi.material_override = hm
	mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	root.add_child(mmi)
	report["gaps"]["glow gain"] = "three draws halos with no tonemapper at gain 1.7; under Godot's Filmic tonemapper the spike uses 0.6x: retune and move the number into the preset"

	# prop sets
	var props := Node3D.new()
	props.name = "Props"
	root.add_child(props)
	var n_inst := 0
	for pname in d["props"]:
		var ps: Dictionary = d["props"][pname]
		var node := _prop_set(pname, ps, report)
		if node:
			props.add_child(node)
			n_inst += ps["instances"].size()

	# effects
	var fxn := Node3D.new()
	fxn.name = "Effects"
	root.add_child(fxn)
	var kinds := {}
	for f in d["fx"]:
		var t: String = f["type"]
		kinds[t] = kinds.get(t, 0) + 1
		match t:
			"floodlight":
				var o := OmniLight3D.new()
				o.position = _v3(f["at"])
				o.omni_range = float(f.get("range", 60))
				o.omni_attenuation = float(f.get("decay", 1.0))
				o.light_color = KData.colour(f.get("color", "#ffffff"), true)
				o.set_meta("hours", f.get("hours", [0, 0]))
				o.set_meta("energy", float(f.get("intensity", 1.0)) * 2.0)
				o.set_meta("kind", t)
				o.name = str(f["id"])
				lights.add_child(o)
			"brazier":
				var o := OmniLight3D.new()
				o.position = _v3(f.get("flame", f["at"]))
				o.omni_range = 14.0
				o.light_color = Color(1.0, 0.55, 0.2)
				o.set_meta("hours", f.get("hours", [0, 0]))
				o.set_meta("energy", 2.5)
				o.set_meta("kind", t)
				o.name = str(f["id"])
				lights.add_child(o)
			"searchlight", "spotcone", "beacon":
				var s := SpotLight3D.new()
				s.name = str(f["id"])
				s.position = _v3(f["at"])
				s.spot_range = float(f.get("len", 100))
				s.spot_angle = rad_to_deg(atan2(float(f.get("rad", 6)), float(f.get("len", 100))))
				s.light_color = KData.colour(f.get("color", "#ffffff"), true)
				s.light_volumetric_fog_energy = 2.0
				s.set_meta("hours", f.get("hours", [0, 0]))
				s.set_meta("energy", 6.0)
				s.set_meta("kind", t)
				if t == "spotcone":
					var dir := _v3(f["dir"]).normalized()
					s.look_at_from_position(s.position, s.position + dir, Vector3.UP if abs(dir.y) < 0.99 else Vector3.FORWARD)
				elif t == "searchlight":
					s.set_meta("heading", float(f.get("heading", 0)))
					s.set_meta("sweep", float(f.get("sweep", 0)))
					s.rotation.x = float(f.get("tilt", 0))
				else:
					s.set_meta("spin", float(f.get("spin", 1)))
				lights.add_child(s)
			"smoke":
				for e in f.get("emitters", []):
					fxn.add_child(_smoke(e, presets.get("smoke", {})))
			"fogbank":
				var size: Array = presets.get("fogbank", {}).get("size", [30, 70])
				for p in f.get("points", []):
					var fv := FogVolume.new()
					fv.position = _v3(p)
					fv.size = Vector3(float(size[1]), float(size[0]) * 0.6, float(size[1]))
					fv.shape = RenderingServer.FOG_VOLUME_SHAPE_ELLIPSOID
					var fm := FogMaterial.new()
					fm.density = 0.04
					fv.material = fm
					fxn.add_child(fv)
				report["gaps"]["fogbank"] = "fog banks are FogVolume ellipsoids (Forward+ with volumetric fog on; invisible on Compatibility): density guessed"
			_:
				pass
	for t in ["fireflies", "moths"]:
		if kinds.has(t):
			report["gaps"][t] = "%s are stateless sprites in three; the MultiMesh + vertex shader port is not written" % t
	if kinds.has("mist"):
		report["gaps"]["mist"] = "mist's 'curve' is a flat number list whose layout the contract does not state (radii round the moat?): not imported"
	if kinds.has("weather"):
		report["gaps"]["weather"] = "the weather state machine (rain, fog, storm, lightning) is not ported to the Atmos autoload: rain stays 0"
	for t in ["banner", "fountain", "drain", "outfall"]:
		if kinds.has(t):
			report["gaps"][t] = "%s: only its props are drawn (no flag shader, water jet, or flow)" % t
	report["counts"] = {"lamps": d["lamps"].size(), "glow": glow.size(), "prop_sets": d["props"].size(), "prop_instances": n_inst,
		"fx": kinds, "load_ms": Time.get_ticks_msec() - t0}
	root.set_meta("report", report)
	return root


static func _v3(a: Array) -> Vector3:
	return Vector3(float(a[0]), float(a[1]), float(a[2]))


# the unit geometry kinds A.geoKinds() names: posts and cones stand on y=0, boxes and balls are centred
static func _unit_mesh(kind: String, size) -> Mesh:
	match kind:
		"post", "post16":
			var c := CylinderMesh.new()
			c.top_radius = 1.0
			c.bottom_radius = 1.0
			c.height = 1.0
			c.radial_segments = 16 if kind == "post16" else 8
			return _lift(c)
		"cone":
			var c := CylinderMesh.new()
			c.top_radius = 0.0
			c.bottom_radius = 1.0
			c.height = 1.0
			c.radial_segments = 7
			return _lift(c)
		"ball":
			var s := SphereMesh.new()
			s.radius = 1.0
			s.height = 2.0
			s.radial_segments = 8
			s.rings = 6
			return s
		"box", "flag":
			var b := BoxMesh.new()
			b.size = Vector3.ONE
			return b
		"PlaneGeometry":
			var q := QuadMesh.new()
			q.size = Vector2(1, 1)
			return q
	return null


# a primitive centred on the origin, moved up so it stands on y=0
static func _lift(m: PrimitiveMesh) -> Mesh:
	var st := SurfaceTool.new()
	st.create_from(m, 0)
	var am := st.commit()
	var arr := am.surface_get_arrays(0)
	var v: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	for i in v.size():
		v[i].y += 0.5
	arr[Mesh.ARRAY_VERTEX] = v
	var out := ArrayMesh.new()
	out.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	return out


static func _prop_set(name: String, ps: Dictionary, report: Dictionary) -> MultiMeshInstance3D:
	var mesh := _unit_mesh(str(ps["geometry"]), ps.get("size"))
	if mesh == null:
		report["gaps"]["prop " + name] = "prop set %s has geometry kind '%s' the importer does not know" % [name, ps["geometry"]]
		return null
	var m: Dictionary = ps["material"]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color.html(m["color"]) if m.get("color") != null else Color.WHITE   # StandardMaterial3D takes sRGB
	mat.vertex_color_use_as_albedo = true
	mat.vertex_color_is_srgb = true
	if m.get("roughness") != null:
		mat.roughness = float(m["roughness"])
	if m.get("metalness") != null:
		mat.metallic = float(m["metalness"])
	if m.get("emissive") == "unlit":
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	if m.get("transparent"):
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mat.albedo_color.a = float(m.get("opacity", 1.0))
	if str(ps["geometry"]) == "PlaneGeometry":
		mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	if m.get("shader") == "flag":
		report["gaps"]["flag shader"] = "banner cloth is a plain box: the flag's downwind swing and ripple shader is not ported"
	var inst: Array = ps["instances"]
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.mesh = mesh
	mm.instance_count = inst.size()
	for i in inst.size():
		var o: Array = inst[i]
		var r = o[6]
		var basis: Basis
		if r is Array:
			basis = Basis.from_euler(Vector3(float(r[0]), float(r[1]), float(r[2])), EULER_ORDER_YXZ)
		else:
			basis = Basis(Vector3.UP, float(r))
		basis = basis.scaled_local(Vector3(float(o[3]), float(o[4]), float(o[5])))
		mm.set_instance_transform(i, Transform3D(basis, Vector3(float(o[0]), float(o[1]), float(o[2]))))
		mm.set_instance_color(i, Color.html(o[7]) if o[7] != null else Color.WHITE)
	var mmi := MultiMeshInstance3D.new()
	mmi.name = name
	mmi.multimesh = mm
	mmi.material_override = mat
	mmi.set_meta("krator", {"set": name, "geometry": ps["geometry"], "material": m})
	return mmi


static func _smoke(e: Array, preset: Dictionary) -> GPUParticles3D:
	var kind: String = str(e[3]) if e.size() > 3 else "chimney"
	var p: Dictionary = preset.get(kind, preset.get("chimney", {}))
	var rate := float(p.get("rate", 0.15))
	var life := 1.0 / maxf(rate, 0.01)
	var gp := GPUParticles3D.new()
	gp.position = Vector3(float(e[0]), float(e[1]), float(e[2]))
	gp.amount = int(p.get("n", 12))
	gp.lifetime = life
	gp.preprocess = life
	gp.visibility_aabb = AABB(Vector3(-30, -5, -30), Vector3(60, 60, 60))
	var pm := ParticleProcessMaterial.new()
	pm.direction = Vector3(0, 1, 0)
	pm.spread = 8.0
	pm.initial_velocity_min = float(p.get("rise", 10)) / life
	pm.initial_velocity_max = pm.initial_velocity_min * 1.2
	pm.gravity = Vector3(float(p.get("drift", 4)) / life, 0, 0)   # downwind drift; a process shader reading atm_wind_at is the real port
	pm.turbulence_enabled = true
	var sz: Array = p.get("size", [1, 4])
	pm.scale_min = float(sz[0])
	pm.scale_max = float(sz[0])
	var curve := Curve.new()
	curve.max_value = float(sz[1]) / maxf(float(sz[0]), 0.01)
	curve.add_point(Vector2(0, 1))
	curve.add_point(Vector2(1, curve.max_value))
	var ct := CurveTexture.new()
	ct.curve = curve
	pm.scale_curve = ct
	gp.process_material = pm
	var q := QuadMesh.new()
	q.size = Vector2(1, 1)
	var sm := StandardMaterial3D.new()
	sm.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES
	sm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	sm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	var col: Array = p.get("color", [0.5, 0.5, 0.5])
	sm.albedo_color = Color(float(col[0]), float(col[1]), float(col[2]), float(p.get("alpha", 0.3)))
	sm.albedo_texture = _puff()
	q.material = sm
	gp.draw_pass_1 = q
	gp.name = "Smoke_" + kind
	return gp


static var _puff_tex: Texture2D


static func _puff() -> Texture2D:
	if _puff_tex:
		return _puff_tex
	var g := GradientTexture2D.new()
	g.fill = GradientTexture2D.FILL_RADIAL
	g.fill_from = Vector2(0.5, 0.5)
	g.fill_to = Vector2(1.0, 0.5)
	var gr := Gradient.new()
	gr.set_color(0, Color(1, 1, 1, 1))
	gr.set_color(1, Color(1, 1, 1, 0))
	g.gradient = gr
	_puff_tex = g
	return g
