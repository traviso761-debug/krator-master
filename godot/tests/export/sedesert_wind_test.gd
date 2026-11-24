# The wind fields through to Godot (GODOT-LOOK-PLAN.md section 13, P4): a small tile of the SE desert exported with
# ?form=1 (core/biome 20-core-kit.js: stiffness and phase a vertex on bark, in the glb's second UV set).
#   python3 tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert-wind --box=180,590,280,690 --query '?form=1'
# Headless. tests/shaders/cook_air_gpu_check.gd draws it. Each check has a negative in the plain desert case.
#   godot --headless --path godot --script res://tests/export/sedesert_wind_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	var wind := "res://data/world-sedesert-wind/world.json"
	var plain := "res://data/world-sedesert/world.json"
	if not FileAccess.file_exists(wind) or not FileAccess.file_exists(plain):
		print("FAIL no case: see this file's header")
		quit(1)
		return
	var w := KratorWorld.build(wind)
	var rep: Dictionary = w.get_meta("report")
	var n_wind := 0
	var lo := 9.0
	var hi := -9.0
	var phases := {}
	for n in w.get_node("Buckets").get_children():
		var mi := n as MeshInstance3D
		var sm := mi.material_override as ShaderMaterial
		if sm == null or sm.get_shader_parameter("wind_uv2") != true:
			continue
		n_wind += 1
		for uv in (mi.mesh.surface_get_arrays(0)[Mesh.ARRAY_TEX_UV2] as PackedVector2Array):
			lo = minf(lo, uv.x)
			hi = maxf(hi, uv.x)
			phases[snappedf(uv.y, 0.0001)] = true
	ok(not rep["gaps"].has("load") and n_wind >= 1 and int(rep.get("wind_buckets", 0)) == n_wind, "the case loads, and its bark draws on the twin that reads the wind fields (%d bucket)" % n_wind)
	ok(lo > -0.01 and lo < 0.1 and hi > 0.9 and hi < 1.01 and phases.size() > 3, "stiffness runs from a twig's tip (%.2f) to a trunk (%.2f), over %d branches' phases" % [lo, hi, phases.size()])
	var p := KratorWorld.build(plain)
	var none := true
	for n in p.get_node("Buckets").get_children():
		var sm := (n as MeshInstance3D).material_override as ShaderMaterial
		if sm != null and sm.get_shader_parameter("wind_uv2") == true:
			none = false
	ok(none and int(p.get_meta("report").get("wind_buckets", 0)) == 0, "negative: the plain desert case has none")
	var sh := FileAccess.get_file_as_string("res://shaders/bark.gdshader")
	ok(sh.contains("uniform bool wind_uv2 = false") and sh.contains("if (wind_uv2)"), "the bark shader reads them only where its material says the mesh has them")
	w.free()
	p.free()
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
