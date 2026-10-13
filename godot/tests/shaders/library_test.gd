# The shader library (ROADMAP.md stage 2e; godot/README.md, "The shader library"): every hook in the table has its
# include, a record's hook resolves (aliases, '+' lists; an unknown name is reported, never guessed); and on the
# world-sedesert case (core/export) the two things the M4 side-by-side lacked are there: the ground's crack and detail
# layers (a material record with hook world-uv and role ground) on the terrain's ground.gdshader, and the pond (the
# water section) on the library's water shader, its heights equal to the page's own probes. Each check has a negative.
# Headless: this checks the data and the wiring; tests/shaders/library_gpu_check.gd compiles and runs the includes.
#   godot --headless --path godot --script res://tests/shaders/library_test.gd     exits 0 when every check passes
extends SceneTree

var CASE := "res://data/world-sedesert/"
var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	# 1. the table: an include per hook, each guarded so a shader may include it twice
	var missing := []
	for id in KHooks.TABLE:
		var p := KHooks.include(id)
		if not FileAccess.file_exists(p) or FileAccess.get_file_as_string(p).find("#ifndef K_") < 0:
			missing.append(id)
	ok(missing.is_empty() and KHooks.TABLE.size() == 9, "%d hooks, each with a guarded include in %s: %s" % [KHooks.TABLE.size(), KHooks.LIB, ", ".join(PackedStringArray(KHooks.TABLE.keys()))])
	var r1 := KHooks.resolve("world-uv+cloth-sway")
	var r2 := KHooks.resolve("leaf")
	var r3 := KHooks.resolve("irid+gloss")
	ok(r1["ids"] == ["world-uv", "cloth-sway"] and r2["ids"] == ["foliage"] and r3["ids"] == ["bark"] and r1["unknown"].is_empty(),
		"hooks resolve: 'world-uv+cloth-sway' to both, the biome kind 'leaf' to foliage, 'irid+gloss' to bark once")
	var r4 := KHooks.resolve("anim+world-uv")
	var sv := KHooks.survey([{"hook": "unnamed"}, {"hook": "leaf"}, {"hook": null}])
	ok(r4["unknown"] == ["anim"] and r4["ids"] == ["world-uv"] and sv["unknown"] == ["unnamed"] and sv["hooks"]["leaf"] == ["foliage"],
		"negative: a name no library shader answers ('anim', 'unnamed') is reported as unknown, not guessed")

	# 2. the world-sedesert case
	if not FileAccess.file_exists(CASE + "world.json"):
		ok(false, "no case: python3 tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert --box 80,490,380,790")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "world.json")
	var w := KratorWorld.build(CASE + "world.json")
	root.add_child(w)
	var rep: Dictionary = w.get_meta("report")
	var unk := []
	for h in rep["hooks"]:
		if (rep["hooks"][h] as Array).is_empty():
			unk.append(h)
	ok(not rep["gaps"].has("hooks") and unk.is_empty() and rep["hooks"].has("world-uv") and rep["hooks"].has("leaf"),
		"every material's hook in the tile resolves to the library: %s" % JSON.stringify(rep["hooks"]))

	# 2a. the ground's layers
	var grec: Dictionary = {}
	for m in d["materials"]:
		if m.get("role") == "ground":
			grec = m
	var gl: Dictionary = rep.get("ground_layers", {})
	ok(not grec.is_empty() and grec["hook"] == "world-uv" and not gl.has("gap") and gl.get("maps") == 3 and gl.get("terms") == 2 and gl.get("weights") == ["crack"],
		"the ground's layers arrive as one record (hook world-uv): %d maps in %d terms, weighted by %s" % [gl.get("maps", 0), gl.get("terms", 0), str(gl.get("weights"))])
	var terr := w.get_meta("ground").get_node("Terrain") as MeshInstance3D
	var mat := terr.mesh.surface_get_material(0) as ShaderMaterial
	var l0: Texture2D = mat.get_shader_parameter("layer0")
	var l2: Texture2D = mat.get_shader_parameter("layer2")
	var tk: Array = mat.get_shader_parameter("term_k")
	ok(mat.shader.resource_path.ends_with("ground.gdshader") and l0 != null and l2 != null and l0 != l2 and int(mat.get_shader_parameter("layer_n")) == 3
		and int(mat.get_shader_parameter("term_n")) == 2 and is_equal_approx((tk[0] as Vector4).x, 1.12) and is_equal_approx((tk[0] as Vector4).y, 0.85)
		and int((tk[1] as Vector4).z) == 0 and int((tk[0] as Vector4).z) == -1,
		"on the terrain's ground.gdshader: the detail map twice and the crack map (%d x %d, %d x %d, from tex/), the detail term's gain 1.12 and amount 0.85, the crack term on weight channel 0" % [l0.get_width(), l0.get_height(), l2.get_width(), l2.get_height()])
	var st: Array = mat.get_shader_parameter("layer_st")
	ok(is_equal_approx((st[0] as Vector4).x, 0.165) and is_equal_approx((st[1] as Vector4).x, 0.021) and is_equal_approx((st[1] as Vector4).z, 0.37) and is_equal_approx((st[2] as Vector4).x, 0.14),
		"each map at the page's own world scale and offset (0.165; 0.021 + 0.37; the cracks 0.14 per metre)")
	var wimg: Image = terr.get_meta("krator_ground_weights")
	var W: Dictionary = grec["weights"]
	var wv := KData.floats(W["values"])
	var worst := 0.0
	var cracked := 0
	for s in range(0, wv.size(), 97):
		var i := s % int(W["nx"])
		var j := s / int(W["nx"])
		worst = maxf(worst, absf(wimg.get_pixel(i, j).r - wv[s]))
		if wv[s] > 0.2:
			cracked += 1
	ok(wimg.get_width() == int(W["nx"]) and wimg.get_height() == int(W["nz"]) and worst <= 0.5 / 255.0 + 1e-6 and cracked > 0,
		"the crack weight on the tile's %s m grid as a %d x %d texture, to a byte of the page's field (worst %.4f); %d sampled points cracked" % [W["step"], wimg.get_width(), wimg.get_height(), worst, cracked])
	var bad := grec.duplicate(true)
	bad["layers"]["terms"][1]["maps"][0]["map"] = "tex:nowhere"
	var g2 := KratorWorld.ground_layers(w.get_meta("ground"), bad, {}, {})
	var bad2 := grec.duplicate(true)
	bad2["layers"]["terms"][1]["weight"] = "moss"
	var g3 := KratorWorld.ground_layers(w.get_meta("ground"), bad2, {}, {})
	ok(g2.has("gap") and str(g2["gap"]).find("tex:nowhere") >= 0 and g3.has("gap") and str(g3["gap"]).find("moss") >= 0 and mat.get_shader_parameter("layer2") == l2,
		"negative: a layer naming a map the export lacks, or a weight it lacks, is a gap, and leaves the ground as it was")

	# 2b. the water
	var wr: Dictionary = rep.get("water", {})
	var wn := w.get_node_or_null("Water")
	var pond: MeshInstance3D = wn.get_child(0) as MeshInstance3D if wn != null and wn.get_child_count() > 0 else null
	ok(wr.get("drawn", []) == ["water:0"] and pond != null and (pond.material_override as ShaderMaterial).shader.resource_path.ends_with("water.gdshader"),
		"the pond (water:0, %s) is drawn by the library's water shader" % (d["water"]["surfaces"][0]["name"] if d.get("water") else "?"))
	var wm := pond.material_override as ShaderMaterial
	var bed: Texture2D = wm.get_shader_parameter("wtr_bed")
	var S0: Dictionary = d["water"]["surfaces"][0]
	ok(int(wm.get_shader_parameter("wtr_n")) == 3 and bool(wm.get_shader_parameter("wtr_has_bed")) and bed.get_width() == int(S0["bed"]["nx"])
		and is_equal_approx(float(wm.get_shader_parameter("wtr_level")), float(S0["level"])) and bool(wm.get_shader_parameter("transparent")),
		"its three ripples, its bed (%d x %d texels), its level %.3f m and its look are the shader's uniforms" % [bed.get_width(), bed.get_height(), float(S0["level"])])
	var pr: Dictionary = wr.get("probes", {})
	ok(pr.get("points", 0) == 108 and pr.get("max_abs_m", 1.0) < 1e-9,
		"KWater's heights equal the page's WATER.heightAt at its %d probes: max %s m (tolerance 1e-9 m)" % [pr.get("points", 0), str(pr.get("max_abs_m"))])
	var late := KratorWater.check_probes(d["water"], wn.get_meta("surfaces"), 0.5)
	ok(late["max_abs_m"] > 1e-3, "negative: half a second late, the probes differ by up to %.4f m" % late["max_abs_m"])
	var sheet := false
	for c in (w.get_meta("ground") as Node).get_children():
		if c.name == "Water":
			sheet = true
	ok(not sheet, "the flat stand-in sheet (KData.water_sheet) is gone where the water section draws the water")
	print("library: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(1 if fails else 0)
