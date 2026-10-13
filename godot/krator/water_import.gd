# core/export's water section (krator-water, core/export/README.md "water") drawn: each open surface a MeshInstance3D on
# shaders/water.gdshader (the library's water include), its uniforms from KWater (krator/water.gd), the mesh a regular
# grid in world space over the part of the surface's extent inside the tile, `spacing` metres between vertices (waves
# finer than the grid are faded out of the displacement and kept in the shading, as on core/water's CDLOD mesh; a
# streamed world will want the CDLOD selection itself: core/water/README.md "Godot"). An open surface on a shore grid
# (Phase 2) discards what its flood never reached and draws its breakers. FLOW (Phase 3) is its ribbon (KWater.ribbon: the
# vertices WATER.ribbon builds) on shaders/water_flow.gdshader; FALL its arcing curtain (KWater.curtain) on
# water_fall.gdshader with a plunge disc on water_plunge.gdshader; STILL (Phase 4) a flat mesh at its level on
# water_still.gdshader. A shore band record has nothing of its own to draw (its open water draws it).
#   "Water"       a Node3D; children "water_<n>" per surface (a fall's plunge pool "water_<n>_plunge"), meta "krator"
#                 (id, name, kind, level, and per kind: waves and spacing; vertices)
# Root meta "report": surfaces, drawn, not_drawn, gaps; "surfaces": {id: KWater}.
class_name KratorWater
extends RefCounted

const SHADER := "res://shaders/water.gdshader"
const SHADERS := {"flow": "res://shaders/water_flow.gdshader", "fall": "res://shaders/water_fall.gdshader",
	"plunge": "res://shaders/water_plunge.gdshader", "still": "res://shaders/water_still.gdshader"}


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
		if r.get("kind") in ["flow", "fall", "still"]:
			var k := KWater.from_record(r, sec, atm)
			by_id[k.id] = k
			for mi in _kind_nodes(k):
				root.add_child(mi)
			rep["drawn"].append(k.id)
			continue
		if r.get("kind") != "open":
			rep["not_drawn"].append("%s (%s, %s): drawn by its open water" % [r.get("id"), r.get("name"), r.get("kind")])
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


# a flow, fall or still surface as MeshInstance3Ds on its shader, the uniforms from KWater.kind_uniforms. Godot's front
# faces wind clockwise seen from the front: core/water's meshes wind counter-clockwise (three's), so each triangle turns
static func _kind_nodes(k: KWater) -> Array:
	var out := []
	var L: Dictionary = k.look if k.look is Dictionary else {}
	var u := k.kind_uniforms()
	var mk := func(mesh: ArrayMesh, shader: String, suffix: String) -> MeshInstance3D:
		var mi := MeshInstance3D.new()
		mi.name = k.id.replace(":", "_") + suffix
		mi.mesh = mesh
		var mat := ShaderMaterial.new()
		mat.shader = load(shader)
		for key in u:
			mat.set_shader_parameter(key, u[key])
		mi.material_override = mat
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		return mi
	if k.kind == "flow":
		var R := k.ribbon(k.ribbon_opt)
		var P: PackedFloat64Array = R["pos"]
		var F: PackedFloat64Array = R["flow"]
		var v := PackedVector3Array()
		var c := PackedFloat32Array()
		for i in int(R["count"]):
			v.append(Vector3(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]))
			c.append_array([F[i * 2], F[i * 2 + 1], (R["slope"] as PackedFloat64Array)[i], (R["bank"] as PackedFloat64Array)[i]])
		var mi: MeshInstance3D = mk.call(_mesh(v, R["idx"], null, null, c), SHADERS["flow"], "")
		var m: ShaderMaterial = mi.material_override
		if L.has("shallow"):
			m.set_shader_parameter("shallow", _lin(L["shallow"]))
		if L.has("deep"):
			m.set_shader_parameter("deep", _lin(L["deep"]))
		m.set_shader_parameter("margin", float(k.ribbon_opt.get("margin", k.presets["flow"]["margin"])))
		mi.set_meta("krator", {"id": k.id, "name": k.name, "kind": "flow", "vertices": R["count"], "rows": R["rows"], "matches_page": _same_mesh(k.ribbon_opt, R["count"], P)})
		out.append(mi)
	elif k.kind == "fall":
		var M := k.curtain(k.curtain_opt)
		var P: PackedFloat64Array = M["pos"]
		var N: PackedFloat64Array = M["nrm"]
		var UV: PackedFloat64Array = M["uv"]
		var v := PackedVector3Array()
		var n := PackedVector3Array()
		var t := PackedVector2Array()
		for i in int(M["count"]):
			v.append(Vector3(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]))
			n.append(Vector3(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]))
			t.append(Vector2(UV[i * 2], UV[i * 2 + 1]))
		var mi: MeshInstance3D = mk.call(_mesh(v, M["idx"], n, t, null), SHADERS["fall"], "")
		if L.has("colour"):
			(mi.material_override as ShaderMaterial).set_shader_parameter("colour", _lin(L["colour"]))
		mi.set_meta("krator", {"id": k.id, "name": k.name, "kind": "fall", "vertices": M["count"], "drop": k.drop, "matches_page": _same_mesh(k.curtain_opt, M["count"], P)})
		out.append(mi)
		# the plunge pool: a disc 2.4 r across at the foot (WATER.drawFall's)
		var pl := k.plunge()
		var dv := PackedVector3Array([Vector3(pl[0], pl[1] + 0.06, pl[2])])
		var di := PackedInt32Array()
		for a in 48:
			var th := TAU * a / 48.0
			dv.append(Vector3(pl[0] + cos(th) * pl[3] * 2.4, pl[1] + 0.06, pl[2] + sin(th) * pl[3] * 2.4))
		for a in 48:
			di.append_array([0, 1 + (a + 1) % 48, 1 + a])
		var pm: MeshInstance3D = mk.call(_mesh(dv, di, null, null, null), SHADERS["plunge"], "_plunge")
		pm.set_meta("krator", {"id": k.id, "name": k.name, "kind": "plunge", "r": pl[3]})
		out.append(pm)
	elif k.kind == "still":
		var v := PackedVector3Array()
		var idx := PackedInt32Array()
		var y := float(k.level)
		if k.poly is Array:
			var P2 := PackedVector2Array()
			for p in k.poly:
				P2.append(Vector2(float(p[0]), float(p[1])))
				v.append(Vector3(float(p[0]), y, float(p[1])))
			idx = Geometry2D.triangulate_polygon(P2)
		else:
			var b: Array = k.bounds
			v = PackedVector3Array([Vector3(b[0], y, b[1]), Vector3(b[2], y, b[1]), Vector3(b[2], y, b[3]), Vector3(b[0], y, b[3])])
			idx = PackedInt32Array([0, 1, 2, 0, 2, 3])
		var mi: MeshInstance3D = mk.call(_mesh(v, idx, null, null, null, false, true), SHADERS["still"], "")
		if L.has("colour"):
			(mi.material_override as ShaderMaterial).set_shader_parameter("colour", _lin(L["colour"]))
		mi.set_meta("krator", {"id": k.id, "name": k.name, "kind": "still", "level": y})
		out.append(mi)
	return out


# the mesh built here against the page's own (the record's count and coordinate sums): true, false, or null (not recorded)
static func _same_mesh(rec: Dictionary, count: int, pos: PackedFloat64Array):
	if not rec.has("count") or not rec.has("sum"):
		return null
	var c := [0.0, 0.0, 0.0]
	for i in pos.size():
		c[i % 3] += pos[i]
	var tol := 1e-6 * maxf(1.0, float(count))
	return int(rec["count"]) == count and absf(c[0] - float(rec["sum"][0])) < tol * 1000.0 and absf(c[1] - float(rec["sum"][1])) < tol * 1000.0 and absf(c[2] - float(rec["sum"][2])) < tol * 1000.0


# an ArrayMesh from vertices and core/water's indices (turned for Godot, unless turn is false), with normals, UVs and
# CUSTOM0 (RGBA float) when given; face_up: wind every triangle to face +y (a polygon from Geometry2D comes either way)
static func _mesh(v: PackedVector3Array, idx: PackedInt32Array, n, uv, c, turn := true, face_up := false) -> ArrayMesh:
	var ix := PackedInt32Array()
	for i in range(0, idx.size(), 3):
		var a := idx[i]
		var b := idx[i + 1]
		var d := idx[i + 2]
		if face_up:
			# Godot's front face is clockwise seen from above: (b - a) x (d - a) must point down
			var ny := (v[b] - v[a]).cross(v[d] - v[a]).y
			if ny > 0.0:
				ix.append_array([a, d, b])
			else:
				ix.append_array([a, b, d])
		elif turn:
			ix.append_array([a, d, b])
		else:
			ix.append_array([a, b, d])
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = v
	arr[Mesh.ARRAY_INDEX] = ix
	if n != null:
		arr[Mesh.ARRAY_NORMAL] = n
	else:
		var up := PackedVector3Array()
		up.resize(v.size())
		up.fill(Vector3.UP)
		arr[Mesh.ARRAY_NORMAL] = up
	if uv != null:
		arr[Mesh.ARRAY_TEX_UV] = uv
	var fmt := 0
	if c != null:
		arr[Mesh.ARRAY_CUSTOM0] = c
		fmt = Mesh.ARRAY_CUSTOM_RGBA_FLOAT << Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr, [], {}, fmt)
	return m


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
# (a river's probes carry its current too: [x, z, t, h, id, vx, vz, speed, slope])
static func check_probes(sec: Dictionary, surfaces: Dictionary, dt := 0.0, steps := 5) -> Dictionary:
	var mx := 0.0
	var mf := 0.0
	var n := 0
	var nf := 0
	var missing := 0
	for p in sec.get("probes", []):
		var w: KWater = surfaces.get(str(p[4]))
		if w == null:
			missing += 1
			continue
		if w.kind == "flow":
			mx = maxf(mx, absf(w.flow_height(float(p[0]), float(p[1])) - float(p[3])))
			var fl := w.flow_at(float(p[0]), float(p[1]))
			for k in 4:
				mf = maxf(mf, absf(fl[k] - float(p[5 + k])))
			nf += 1
		else:
			mx = maxf(mx, absf(w.height_at(float(p[0]), float(p[1]), float(p[2]) + dt, steps) - float(p[3])))
		n += 1
	return {"points": n, "missing": missing, "max_abs_m": mx, "flow": nf, "max_flow": mf}
