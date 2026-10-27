# core/water's core-pass pieces (2026-10-27) in Godot: krator/water_import.gd draws a confluence from the export's group record (its grid as the
# page's C.mesh(), its member ribbons fading in its disc), a ribbon's keep from the port's own function, drawFall's footK and plungeR, a pan and an
# ice lake (its bake, its drift mesh), and the breakup on every material; KWater.breakup against WATER.breakup. Each check has a negative.
#   godot --headless --path godot --script res://tests/water/core_pass_test.gd     exits 0 when all pass
# (the golden: node godot/tools/water_core_pass_golden.js)
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


static func sci(v: float) -> String:
	if v == 0.0:
		return "0"
	var e := floori(log(absf(v)) / log(10.0))
	return "%.1fe%d" % [v / pow(10.0, e), e]


func node(root: Node, id: String) -> MeshInstance3D:
	return root.get_node_or_null(NodePath(id.replace(":", "_"))) as MeshInstance3D


func _initialize() -> void:
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/water/core_pass_golden.json"))
	var sec: Dictionary = g["section"]
	var ids: Dictionary = g["ids"]
	# ---- the importer without options: the old drawings plus the new kinds
	var plain := KratorWater.build(sec)
	var rep: Dictionary = plain.get_meta("report")
	ok(rep["drawn"].has(ids["pan"]) and rep["drawn"].has(ids["ice"]) and str(rep["drawn"]).contains("confluence: "), "the importer draws the pan, the ice and the confluence (drawn: %d)" % rep["drawn"].size())
	# ---- the confluence's grid
	var cn: MeshInstance3D = null
	for c in plain.get_children():
		if str(c.name).begins_with("confluence_"):
			cn = c
	var meta: Dictionary = cn.get_meta("krator") if cn != null else {}
	var gc: Dictionary = g["confluence"]
	var es := 0.0
	if cn != null:
		for k in 3:
			es = maxf(es, absf(float(meta["sum"][k]) - float(gc["sum"][k])))
	ok(cn != null and int(meta["triangles"]) == int(gc["triangles"]) and int(gc["triangles"]) == int(gc["page_triangles"]) and es < 1e-6,
		"the confluence's grid is the page's: %s triangles (the page's C.mesh(): %s), its vertices' sums within %s" % [meta.get("triangles"), gc["page_triangles"], sci(es)])
	var rm := node(plain, ids["river"]).material_override as ShaderMaterial
	var sm := node(plain, ids["stream"]).material_override as ShaderMaterial
	var fm := node(plain, ids["fall"]).material_override as ShaderMaterial
	var disc: Vector4 = (rm.get_shader_parameter("cf_disc") as Array)[0]
	ok(int(rm.get_shader_parameter("cf_n")) == 1 and int(sm.get_shader_parameter("cf_n")) == 1 and absf(disc.z - float(gc["r"])) < 1e-9 and absf(disc.x - float(gc["at"][0])) < 1e-9 and absf(disc.w - float(gc["feather"])) < 1e-9,
		"both member ribbons fade in its disc (cf_n 1, the disc at %s, r %s, feather %s)" % [disc.x, disc.z, disc.w])
	ok(fm.get_shader_parameter("cf_disc") == null and not bool(rm.get_shader_parameter("use_keep")) and fm.get_shader_parameter("foot_k") == null and rm.get_shader_parameter("bk_on") == null,
		"...negative: the fall is no member; without options no keep, no footK, no breakup")
	# ---- the pan and the ice
	var pm := node(plain, ids["pan"]).material_override as ShaderMaterial
	ok(absf(float(pm.get_shader_parameter("wet")) - 0.6) < 1e-9 and absf(float(pm.get_shader_parameter("cell")) - 3.0) < 1e-9, "the pan's material from its record (its wetness .6, its cells 3 m)")
	var B: Dictionary = node(plain, ids["ice"]).get_meta("bake")
	var gb: Dictionary = g["bake"]
	var bad_b := 0
	for s in gb["samples"]:
		var k := int(s[0]) * 4
		if (B["data"] as PackedByteArray)[k] != int(s[1]) or (B["data"] as PackedByteArray)[k + 1] != int(s[2]):
			bad_b += 1
	ok(int(B["nx"]) == int(gb["nx"]) and int(B["nz"]) == int(gb["nz"]) and absf(float(B["x0"]) - float(gb["x0"])) < 1e-9 and bad_b == 0,
		"the ice's bake is the page's I.bake (%d x %d, %d of %d sampled bytes off)" % [B["nx"], B["nz"], bad_b, gb["samples"].size()])
	var dn := node(plain, ids["ice"] + "_drifts")
	var dm: Dictionary = dn.get_meta("krator") if dn != null else {}
	var gd: Dictionary = g["drifts"]
	var ed := 0.0
	if dn != null:
		for k in 3:
			ed = maxf(ed, absf(float(dm["sum"][k]) - float(gd["sum"][k])))
	ok(dn != null and int(dm["vertices"]) == int(gd["count"]) and int(dm["triangles"]) == int(gd["triangles"]) and ed < 1e-6 * float(gd["count"]),
		"the drifts are the page's driftMesh (%s vertices, %s triangles, sums within %s)" % [dm.get("vertices"), dm.get("triangles"), sci(ed)])
	# ---- with options: keep, the fall's footK and plungeR, the breakup
	var keep := func(x: float, z: float) -> float: return clampf((140.0 - x) / 100.0, 0.0, 1.0)
	var opts := {"keep": {ids["stream"]: keep}, "fall": {ids["fall"]: {"footK": 0.8, "plungeR": 9.0, "lipK": 0.85}}, "wet": 0.2, "breakup": true}
	var full := KratorWater.build(sec, null, null, 2.0, opts)
	var sn := node(full, ids["stream"])
	var arr := sn.mesh.surface_get_arrays(0)
	var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	var K1: PackedFloat32Array = arr[Mesh.ARRAY_CUSTOM1]
	var ek := 0.0
	for i in V.size():
		ek = maxf(ek, absf(K1[i * 4] - keep.call(V[i].x, V[i].z)))
	ok(K1.size() == V.size() * 4 and ek < 1e-6 and bool((sn.material_override as ShaderMaterial).get_shader_parameter("use_keep")) and sn.get_meta("krator")["keep"],
		"keep: the port's function sampled at each of the stream's %d vertices (CUSTOM1.x, %s off), use_keep on" % [V.size(), sci(ek)])
	var ff := node(full, ids["fall"]).material_override as ShaderMaterial
	var pn := node(full, ids["fall"] + "_plunge")
	var pv: PackedVector3Array = pn.mesh.surface_get_arrays(0)[Mesh.ARRAY_VERTEX]
	var pr := Vector2(pv[1].x - pv[0].x, pv[1].z - pv[0].z).length()
	ok(absf(float(ff.get_shader_parameter("foot_k")) - 0.8) < 1e-9 and absf(float(ff.get_shader_parameter("lip_k")) - 0.85) < 1e-9 and absf(pr - 9.0) < 1e-4
		and absf(((pn.material_override as ShaderMaterial).get_shader_parameter("plunge_fade") as Vector3).z - 9.0) < 1e-9,
		"the fall: footK .8 and lipK .85 on its curtain, its plunge disc 9 m (plungeR) with the outer quarter's fade (unset: %.1f m)" % float(node(plain, ids["fall"] + "_plunge").get_meta("krator")["disc"]))
	var fl := node(full, ids["river"]).material_override as ShaderMaterial
	var cf: ShaderMaterial = null
	for c in full.get_children():
		if str(c.name).begins_with("confluence_"):
			cf = (c as MeshInstance3D).material_override
	ok(bool(fl.get_shader_parameter("bk_on")) and absf(float(fl.get_shader_parameter("bk_amp")) - 0.07) < 1e-9 and bool(cf.get_shader_parameter("bk_on")) and absf(float(cf.get_shader_parameter("bk_size")) - 2.6) < 1e-9
		and absf(float((node(full, ids["pan"]).material_override as ShaderMaterial).get_shader_parameter("wet")) - 0.2) < 1e-9,
		"breakup: true gives the ribbons and the confluence BREAKUP_FLOW's numbers (amp .07, size 2.6); opts.wet sets the pan's (.2)")
	# ---- KWater.breakup against WATER.breakup
	var per := float(sec.get("period", 600.0))
	var eb := 0.0
	var moved := 0.0
	for s in g["breakup"]:
		var flow: bool = s["flow"]
		var Bo := KWater.breakup_opt(null, flow)
		var n := PackedFloat64Array(s["n"])
		var r := KWater.breakup(n, float(s["x"]), float(s["z"]), float(s["t"]), Bo, per, s["v"] if flow else null)
		for k in 3:
			eb = maxf(eb, absf(r[k] - float(s["r"][k])))
			moved = maxf(moved, absf(r[k] - n[k]))
	ok(eb < 1e-12 and moved > 1e-3, "KWater.breakup equals WATER.breakup at %d points, open and flow (%s; it moves the normal by up to %s)" % [g["breakup"].size(), sci(eb), sci(moved)])
	var u := KWater.breakup_uniforms(KWater.breakup_opt(null, false), per)
	ok(absf((u["bk_t"] as Vector2).x * (u["bk_t"] as Vector2).y - 1.0) < 1e-12 and absf((u["bk_t"] as Vector2).y - per / roundf(per / 7.0)) < 1e-12, "...its uniforms: whole cycles per wave period (bk_t %s)" % u["bk_t"])
	plain.free()
	full.free()
	print("core_pass_test: %s" % ("all passed" if fails == 0 else "%d FAILED" % fails))
	quit(1 if fails else 0)
