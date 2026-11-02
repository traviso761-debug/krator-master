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
# 2026-10-27 (core/water's core pass; godot/tests/water/core_pass_test.gd): CONFLUENCES (the section's group records, ext/55) as their grid on
# shaders/water_confluence.gdshader, each member ribbon fading out inside its disc (cf_disc on water_flow.gdshader); PANS and ICE (ext/54) on
# water_pan / water_ice.gdshader, the ice's drifts their own mesh; and build's `opts`, for what the page passed its drawings but the export
# does not carry as data:
#   keep      {surface id: Callable(x, z) -> 0..1, or a PackedFloat32Array a value per ribbon vertex}: drawFlow's keep. The record says only
#             ribbon.keep (the function is the host's): a port samples its own (the ribbon fades out where other water lies)
#   fall      {surface id: {footK, plungeR, lipK}}: drawFall's options (the curtain held to its foot, the plunge disc sized to its pool)
#   wet       the pans' wetness (the weather's W.wet; set "wet" on their materials each frame to follow it), default the record's or 0
#   breakup   true or a dict (WATER.BREAKUP's numbers over the defaults): every open, still, flow and confluence material takes the breakup
#             (shaders/lib/water_breakup.gdshaderinc), the ribbons and confluences with WATER.BREAKUP_FLOW's numbers and their current
class_name KratorWater
extends RefCounted

const SHADER := "res://shaders/water.gdshader"
const SHADERS := {"flow": "res://shaders/water_flow.gdshader", "fall": "res://shaders/water_fall.gdshader",
	"plunge": "res://shaders/water_plunge.gdshader", "still": "res://shaders/water_still.gdshader",
	"confluence": "res://shaders/water_confluence.gdshader", "pan": "res://shaders/water_pan.gdshader", "ice": "res://shaders/water_ice.gdshader"}


static func build(sec: Dictionary, box = null, atm: Object = null, spacing := 2.0, opts := {}) -> Node3D:
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
			for mi in _kind_nodes(k, opts):
				root.add_child(mi)
			rep["drawn"].append(k.id)
			continue
		if r.get("kind") in ["pan", "ice"]:
			for mi in _ext_nodes(r, opts):
				root.add_child(mi)
			rep["drawn"].append(str(r.get("id")))
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
		if opts.get("breakup"):
			_breakup_on(mat, opts["breakup"], false, w.period)
		mi.material_override = mat
		mi.extra_cull_margin = w.amp + 1.0
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		mi.set_meta("krator", {"id": w.id, "name": w.name, "level": w.level_at(0.0), "waves": w.waves.size(), "spacing": spacing,
			"rect": rect, "bed": w.bed != null})
		root.add_child(mi)
		rep["drawn"].append(w.id)
	# the confluences (the section's group records): their grids, and each member ribbon faded out inside its disc
	for g in sec.get("groups", []):
		if not (g is Dictionary) or g.get("kind") != "confluence":
			continue
		root.add_child(_confluence_node(g, sec, opts))
		rep["drawn"].append("confluence: " + str(g.get("name")))
		for fid in g.get("flows", []):
			var node := root.get_node_or_null(NodePath(("water:%s" % int(fid)).replace(":", "_")))
			if node == null:
				continue
			var m := (node as MeshInstance3D).material_override as ShaderMaterial
			var n: int = int(m.get_shader_parameter("cf_n")) if m.get_shader_parameter("cf_n") != null else 0
			if n >= 4:
				rep["gaps"]["confluences"] = "a ribbon in more than 4 confluences: the 5th and later do not fade it"
				continue
			var discs: Array = m.get_shader_parameter("cf_disc") if m.get_shader_parameter("cf_disc") is Array else [Vector4.ZERO, Vector4.ZERO, Vector4.ZERO, Vector4.ZERO]
			discs[n] = Vector4(float(g["at"][0]), float(g["at"][1]), float(g["r"]), float(g["feather"]))
			m.set_shader_parameter("cf_disc", discs)
			m.set_shader_parameter("cf_n", n + 1)
	root.set_meta("report", rep)
	root.set_meta("surfaces", by_id)
	return root


# the breakup's uniforms on a material (KWater.breakup_uniforms): B true or a dict over WATER.BREAKUP (flow: BREAKUP_FLOW's numbers)
static func _breakup_on(mat: ShaderMaterial, B, flow: bool, per: float) -> void:
	var u := KWater.breakup_uniforms(KWater.breakup_opt(B if B is Dictionary else null, flow), per)
	for key in u:
		mat.set_shader_parameter(key, u[key])


# a confluence's grid (KWater.confluence_mesh) on water_confluence.gdshader, shaded as its first flow (the river) is
static func _confluence_node(g: Dictionary, sec: Dictionary, opts: Dictionary) -> MeshInstance3D:
	var M := KWater.confluence_mesh(g)
	var P: PackedFloat64Array = M["pos"]
	var n: int = int(g["n"])
	var v := PackedVector3Array()
	var c0 := PackedFloat32Array()
	var c1 := PackedFloat32Array()
	for i in n * n:
		v.append(Vector3(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]))
		c0.append_array([float(g["vx"][i]), float(g["vz"][i]), float(g["slope"][i]), float(g["bank"][i])])
		c1.append_array([float(g["fade"][i]), float(g["meetV"][i]), 0.0, 0.0])
	var mi := MeshInstance3D.new()
	mi.name = "confluence_" + str(g.get("name", "")).validate_node_name()
	mi.mesh = _mesh(v, M["idx"], null, null, c0, true, false, c1)
	var mat := ShaderMaterial.new()
	mat.shader = load(SHADERS["confluence"])
	# the flow uniforms (the ripple, rapids, the clock's phases) from the river's record: a disc is drawn in its river's water
	var river = null
	for r in sec.get("surfaces", []):
		if r.get("kind") == "flow" and (g.get("flows", []) as Array).size() and str(r.get("id")) == "water:%s" % int(g["flows"][0]):
			river = r
	if river != null:
		var k := KWater.from_record(river, sec, null)
		var u := k.kind_uniforms()
		for key in u:
			mat.set_shader_parameter(key, u[key])
		var L: Dictionary = k.look if k.look is Dictionary else {}
		if L.has("shallow"):
			mat.set_shader_parameter("shallow", _lin(L["shallow"]))
		if L.has("deep"):
			mat.set_shader_parameter("deep", _lin(L["deep"]))
	mat.set_shader_parameter("margin", float(g.get("margin", 1.5)))
	mat.set_shader_parameter("meet_k", float(g.get("meet", 0.12)))
	if opts.get("breakup"):
		_breakup_on(mat, opts["breakup"], true, float(sec.get("period", 600.0)))
	mi.material_override = mat
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mi.set_meta("krator", {"kind": "confluence", "name": g.get("name"), "vertices": n * n, "triangles": (M["idx"] as PackedInt32Array).size() / 3, "flows": g.get("flows"), "sum": _sum3(P)})
	return mi


static func _sum3(P: PackedFloat64Array) -> Array:
	var c := [0.0, 0.0, 0.0]
	for i in P.size():
		c[i % 3] += P[i]
	return c


# a pan or an ice record (ext/54) as its flat mesh at its level (+ lift), the ice's drifts as a second mesh
static func _ext_nodes(r: Dictionary, opts: Dictionary) -> Array:
	var out := []
	var kind := str(r["kind"])
	var P: Array = r["poly"]
	var lift := 0.02 if kind == "pan" else 0.01
	var y := float(r["level"]) + lift
	var v := PackedVector3Array()
	var P2 := PackedVector2Array()
	for p in P:
		P2.append(Vector2(float(p[0]), float(p[1])))
		v.append(Vector3(float(p[0]), y, float(p[1])))
	var mi := MeshInstance3D.new()
	mi.name = str(r["id"]).replace(":", "_")
	mi.mesh = _mesh(v, Geometry2D.triangulate_polygon(P2), null, null, null, false, true)
	var mat := ShaderMaterial.new()
	mat.shader = load(SHADERS[kind])
	var K: Dictionary = r["colours"]
	if kind == "pan":
		for key in ["cell", "jitter", "crack", "flood"]:
			mat.set_shader_parameter(key, float(r[key]))
		mat.set_shader_parameter("salt", _v3(KWater.rgb_of(K["salt"])))
		mat.set_shader_parameter("crack_colour", _v3(KWater.rgb_of(K["crack"])))
		mat.set_shader_parameter("damp_k", float(K["damp"]))
		mat.set_shader_parameter("brine", Vector3(float(r["brine"][0]), float(r["brine"][1]), float(r["brine"][2])))
		mat.set_shader_parameter("rough", Vector2(float(r["roughness"][0]), float(r["roughness"][1])))
		var wet = opts.get("wet", r.get("wet"))
		mat.set_shader_parameter("wet", float(wet) if wet != null else 0.0)
	else:
		var B := KWater.ice_bake(r, float(opts.get("ice_cell", 2.0)))
		var img := Image.create_from_data(int(B["nx"]), int(B["nz"]), false, Image.FORMAT_RGBA8, B["data"])
		mat.set_shader_parameter("ice_map", ImageTexture.create_from_image(img))
		mat.set_shader_parameter("box", Vector4(float(B["x0"]), float(B["z0"]), float(B["cell"]) * int(B["nx"]), float(B["cell"]) * int(B["nz"])))
		var Kc: Dictionary = r["cracks"]
		mat.set_shader_parameter("crack_cell", float(Kc["cell"]))
		mat.set_shader_parameter("crack_jitter", float(Kc["jitter"]))
		mat.set_shader_parameter("crack_width", float(Kc["width"]))
		mat.set_shader_parameter("salt_rim", bool(r["rim"]["salt"]))
		for key in ["ice", "salt", "snow"]:
			mat.set_shader_parameter(key, _v3(KWater.rgb_of(K[key])))
		mat.set_shader_parameter("crack_colour", _v3(KWater.rgb_of(K["crack"])))
		mi.set_meta("bake", B)
	mi.material_override = mat
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mi.set_meta("krator", {"id": r["id"], "name": r.get("name"), "kind": kind, "level": float(r["level"])})
	out.append(mi)
	if kind == "ice" and (r["drifts"] as Array).size():
		var D := KWater.drift_mesh(r, int(opts.get("drift_res", 8)), 0.02)
		var DP: PackedFloat64Array = D["pos"]
		var DN: PackedFloat64Array = D["nrm"]
		var dv := PackedVector3Array()
		var dn := PackedVector3Array()
		for i in int(D["count"]):
			dv.append(Vector3(DP[i * 3], DP[i * 3 + 1], DP[i * 3 + 2]))
			dn.append(Vector3(DN[i * 3], DN[i * 3 + 1], DN[i * 3 + 2]))
		var dm := MeshInstance3D.new()
		dm.name = mi.name + "_drifts"
		dm.mesh = _mesh(dv, D["idx"], dn, null, null)
		var sm := StandardMaterial3D.new()
		var sc := KWater.rgb_of(K["snow"])
		sm.albedo_color = Color(sc[0], sc[1], sc[2])
		sm.roughness = 0.9
		dm.material_override = sm
		dm.set_meta("krator", {"id": r["id"], "kind": "drifts", "vertices": D["count"], "triangles": (D["idx"] as PackedInt32Array).size() / 3, "sum": _sum3(DP)})
		out.append(dm)
	return out


static func _v3(c: PackedFloat64Array) -> Vector3:
	return Vector3(c[0], c[1], c[2])


# a flow, fall or still surface as MeshInstance3Ds on its shader, the uniforms from KWater.kind_uniforms. Godot's front
# faces wind clockwise seen from the front: core/water's meshes wind counter-clockwise (three's), so each triangle turns
static func _kind_nodes(k: KWater, opts := {}) -> Array:
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
		# drawFlow's keep: the host's function sampled at each vertex, or its values (opts.keep[id]); the record only says it had one
		var kp = opts.get("keep", {}).get(k.id)
		var c1 = null
		if kp != null:
			c1 = PackedFloat32Array()
			for i in int(R["count"]):
				var kv: float = float(kp.call(P[i * 3], P[i * 3 + 2])) if kp is Callable else float(kp[i])
				c1.append_array([clampf(kv, 0.0, 1.0), 0.0, 0.0, 0.0])
		var mi: MeshInstance3D = mk.call(_mesh(v, R["idx"], null, null, c, true, false, c1), SHADERS["flow"], "")
		var m: ShaderMaterial = mi.material_override
		if c1 != null:
			m.set_shader_parameter("use_keep", true)
		if opts.get("breakup"):
			_breakup_on(m, opts["breakup"], true, k.period)
		if L.has("shallow"):
			m.set_shader_parameter("shallow", _lin(L["shallow"]))
		if L.has("deep"):
			m.set_shader_parameter("deep", _lin(L["deep"]))
		m.set_shader_parameter("margin", float(k.ribbon_opt.get("margin", k.presets["flow"]["margin"])))
		mi.set_meta("krator", {"id": k.id, "name": k.name, "kind": "flow", "vertices": R["count"], "rows": R["rows"], "matches_page": _same_mesh(k.ribbon_opt, R["count"], P),
			"keep": c1 != null, "keep_noted": bool(k.ribbon_opt.get("keep", false))})
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
		# a margin or edge (core/water W1, 2026-10-26): the side fade in metres, as WATER.drawFall's
		if k.curtain_opt.get("margin") != null or k.curtain_opt.get("edge") != null:
			var fm := mi.material_override as ShaderMaterial
			fm.set_shader_parameter("side_margin", float(k.curtain_opt.get("margin", 0.0)))
			fm.set_shader_parameter("side_edge", float(k.curtain_opt["edge"]) if k.curtain_opt.get("edge") != null else 0.08 * k.lip_w)
			fm.set_shader_parameter("lip_w", k.lip_w)
		var fo: Dictionary = opts.get("fall", {}).get(k.id, {})
		if fo.get("lipK") != null:
			(mi.material_override as ShaderMaterial).set_shader_parameter("lip_k", float(fo["lipK"]))
		if fo.get("footK") != null:
			(mi.material_override as ShaderMaterial).set_shader_parameter("foot_k", float(fo["footK"]))
		mi.set_meta("krator", {"id": k.id, "name": k.name, "kind": "fall", "vertices": M["count"], "drop": k.drop, "matches_page": _same_mesh(k.curtain_opt, M["count"], P)})
		out.append(mi)
		# the plunge pool: a disc 2.4 r across at the foot (WATER.drawFall's), or plungeR m with its outer quarter faded
		var pl := k.plunge()
		var pr: float = float(fo["plungeR"]) if fo.get("plungeR") != null else pl[3] * 2.4
		var dv := PackedVector3Array([Vector3(pl[0], pl[1] + 0.06, pl[2])])
		var di := PackedInt32Array()
		for a in 48:
			var th := TAU * a / 48.0
			dv.append(Vector3(pl[0] + cos(th) * pr, pl[1] + 0.06, pl[2] + sin(th) * pr))
		for a in 48:
			di.append_array([0, 1 + (a + 1) % 48, 1 + a])
		var pm: MeshInstance3D = mk.call(_mesh(dv, di, null, null, null), SHADERS["plunge"], "_plunge")
		if fo.get("plungeR") != null:
			(pm.material_override as ShaderMaterial).set_shader_parameter("plunge_fade", Vector3(pl[0], pl[2], pr))
		pm.set_meta("krator", {"id": k.id, "name": k.name, "kind": "plunge", "r": pl[3], "disc": pr})
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
		if opts.get("breakup"):
			_breakup_on(mi.material_override as ShaderMaterial, opts["breakup"], false, k.period)
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
static func _mesh(v: PackedVector3Array, idx: PackedInt32Array, n, uv, c, turn := true, face_up := false, c1 = null) -> ArrayMesh:
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
	if c1 != null:
		arr[Mesh.ARRAY_CUSTOM1] = c1
		fmt |= Mesh.ARRAY_CUSTOM_RGBA_FLOAT << Mesh.ARRAY_FORMAT_CUSTOM1_SHIFT
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
