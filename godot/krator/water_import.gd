# core/export's water section (krator-water, core/export/README.md "water") drawn: each open surface a MeshInstance3D on
# shaders/water.gdshader (the library's water include), its uniforms from KWater (krator/water.gd), the mesh a regular
# grid in world space over the part of the surface's extent inside the tile, `spacing` metres between vertices (waves
# finer than the grid are faded out of the displacement and kept in the shading, as on core/water's CDLOD mesh; a
# streamed world will want the CDLOD selection itself: core/water/README.md "Godot"). Flow, fall, still and shore
# surfaces are recorded, not drawn: core/water draws none of them yet either (its phases 2 to 4).
#   "Water"       a Node3D; children "water:<n>" per open surface, meta "krator" (id, name, level, waves, spacing)
# Root meta "report": surfaces, drawn, not_drawn, gaps; "surfaces": {id: KWater}.
class_name KratorWater
extends RefCounted

const SHADER := "res://shaders/water.gdshader"


static func build(sec: Dictionary, box = null, atm: Object = null, spacing := 2.0) -> Node3D:
	var root := Node3D.new()
	root.name = "Water"
	var rep := {"surfaces": 0, "drawn": [], "not_drawn": [], "gaps": {}}
	var by_id := {}
	if sec.get("format") != "krator-water":
		rep["gaps"]["format"] = "not a krator-water section"
		root.set_meta("report", rep)
		return root
	if sec.get("field") == "atmos" and atm == null:
		rep["gaps"]["field"] = "the surfaces take a share of the shared wave field, and no Atmos was given: drawn without it"
	if atm != null and absf(float(atm.waves["period"]) - float(sec.get("period", 600))) > 1e-9:
		rep["gaps"]["period"] = "the section's period (%s s) is not Atmos's wave period (%s s): atm_wave_t wraps at the wrong time" % [sec.get("period"), atm.waves["period"]]
	for r in sec.get("surfaces", []):
		rep["surfaces"] += 1
		if r.get("kind") != "open":
			rep["not_drawn"].append("%s (%s, %s): core/water draws no %s surface yet" % [r.get("id"), r.get("name"), r.get("kind"), r.get("kind")])
			continue
		var w := KWater.from_record(r, sec, atm)
		by_id[w.id] = w
		var e = w.extent if w.extent is Array else w.bounds
		var rect := _rect(e, box)
		if rect.is_empty():
			rep["not_drawn"].append("%s (%s): unbounded and no tile box: nothing to size its grid by" % [w.id, w.name])
			continue
		var mi := MeshInstance3D.new()
		mi.name = w.id.replace(":", "_")
		mi.mesh = grid(rect, w.level_at(0.0), spacing)
		var mat := ShaderMaterial.new()
		mat.shader = load(SHADER)
		apply(mat, w, spacing)
		mi.material_override = mat
		mi.extra_cull_margin = w.amp + 1.0
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		mi.set_meta("krator", {"id": w.id, "name": w.name, "level": w.level_at(0.0), "waves": w.waves.size(), "spacing": spacing,
			"rect": rect, "bed": w.bed != null})
		root.add_child(mi)
		rep["drawn"].append(w.id)
	root.set_meta("report", rep)
	root.set_meta("surfaces", by_id)
	return root


# the surface's uniforms and look on a material (shaders/water.gdshader)
static func apply(mat: ShaderMaterial, w: KWater, spacing := 2.0) -> void:
	var u := w.uniforms(0.0)
	for k in u:
		mat.set_shader_parameter(k, u[k])
	mat.set_shader_parameter("spacing", spacing)
	mat.set_shader_parameter("period", w.period)
	var L: Dictionary = w.look if w.look is Dictionary else {}
	# WATER.draw's defaults (its colours are three's working values: linear, as the export's convention says)
	mat.set_shader_parameter("colour", _lin(L.get("colour", "#06222e")))
	mat.set_shader_parameter("shallow", _lin(L.get("shallow", "#2a524d")))
	mat.set_shader_parameter("deep", _lin(L.get("deep", "#0d2c30")))
	mat.set_shader_parameter("roughness", float(L.get("roughness", 0.2)))
	mat.set_shader_parameter("metal", float(L.get("metal", 0.2)))
	mat.set_shader_parameter("transparent", bool(L.get("transparent", false)))
	mat.set_shader_parameter("unlit", bool(L.get("unlit", false)))
	if L.get("sky") is Dictionary:   # the page's own flat sky in its water (a page that draws its water itself)
		mat.set_shader_parameter("sky_colour", _lin(L["sky"].get("colour", "#bfccd6")))
		mat.set_shader_parameter("sky_k", Vector2(float(L["sky"].get("base", 0.0)), float(L["sky"].get("grazing", 0.0))))
	var F: Dictionary = w.presets.get("foam", {})
	if F.has("color"):
		mat.set_shader_parameter("foam_colour", Vector3(float(F["color"][0]), float(F["color"][1]), float(F["color"][2])))
	if F.has("noise"):
		mat.set_shader_parameter("foam_noise", Vector2(float(F["noise"][0]), float(F["noise"][1])))
	if w.bounds is Array:
		mat.set_shader_parameter("bounds", Vector4(float(w.bounds[0]), float(w.bounds[1]), float(w.bounds[2]), float(w.bounds[3])))


static func _lin(hex) -> Vector3:
	var c := Color(str(hex))   # the hex as written: no conversion (linear already)
	return Vector3(c.r, c.g, c.b)


# the extent clipped to the box ([x0, z0, x1, z1]), or [] when there is nothing to draw
static func _rect(e, box) -> Array:
	var r := [-INF, -INF, INF, INF]
	if e is Array:
		r = [float(e[0]), float(e[1]), float(e[2]), float(e[3])]
	if box is Array:
		r = [maxf(r[0], float(box[0])), maxf(r[1], float(box[1])), minf(r[2], float(box[2])), minf(r[3], float(box[3]))]
	if not (is_finite(r[0]) and is_finite(r[1]) and is_finite(r[2]) and is_finite(r[3])) or r[2] <= r[0] or r[3] <= r[1]:
		return []
	return r


# a flat grid at y over rect, every vertex a rest point (the vertex shader moves it): clockwise from above, Godot's front
static func grid(rect: Array, y: float, spacing: float) -> ArrayMesh:
	var nx := int(ceil((rect[2] - rect[0]) / spacing)) + 1
	var nz := int(ceil((rect[3] - rect[1]) / spacing)) + 1
	var v := PackedVector3Array()
	v.resize(nx * nz)
	var n := PackedVector3Array()
	n.resize(nx * nz)
	for j in nz:
		for i in nx:
			v[j * nx + i] = Vector3(minf(rect[0] + i * spacing, rect[2]), y, minf(rect[1] + j * spacing, rect[3]))
			n[j * nx + i] = Vector3.UP
	var idx := PackedInt32Array()
	idx.resize((nx - 1) * (nz - 1) * 6)
	var k := 0
	for j in nz - 1:
		for i in nx - 1:
			var a := j * nx + i
			idx[k] = a; idx[k + 1] = a + 1; idx[k + 2] = a + nx
			idx[k + 3] = a + 1; idx[k + 4] = a + nx + 1; idx[k + 5] = a + nx
			k += 6
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = v
	arr[Mesh.ARRAY_NORMAL] = n
	arr[Mesh.ARRAY_INDEX] = idx
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	return m


# the probes the page wrote (WATER's own heights at fixed (x, z, t)) against KWater here: the largest difference
static func check_probes(sec: Dictionary, surfaces: Dictionary, dt := 0.0, steps := 5) -> Dictionary:
	var mx := 0.0
	var n := 0
	var missing := 0
	for p in sec.get("probes", []):
		var w: KWater = surfaces.get(str(p[4]))
		if w == null:
			missing += 1
			continue
		mx = maxf(mx, absf(w.height_at(float(p[0]), float(p[1]), float(p[2]) + dt, steps) - float(p[3])))
		n += 1
	return {"points": n, "missing": missing, "max_abs_m": mx}
