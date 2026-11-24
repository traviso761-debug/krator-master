# The export form through to Godot (GODOT-LOOK-PLAN.md section 13): the Eternian sheet's tile exported with ?form=1
# (core/engine 90-scene.js: chamfered boxes, buildings out of true, the height field) beside the same tile as it was.
#   python3 tools/harness.py export kits/eternian/dist/eternian.html --out godot/data/world-eternian-form --box=-30,-200,10,-165 --query '?form=1'
# Headless: the formed case loads, its buckets carry the field as a second UV set and draw on the form's twin of their
# material, and it has more triangles on about the same vertices. Each check has a negative in the plain case.
#   godot --headless --path godot --script res://tests/export/eternian_form_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _count(w: Node3D) -> Dictionary:
	var out := {"tris": 0, "verts": 0, "uv2": 0, "form_mat": 0, "nodes": 0, "h_min": 1e9, "h_max": -1e9, "outside": 0}
	for n in w.get_node("Buckets").get_children():
		var mi := n as MeshInstance3D
		out["nodes"] += 1
		out["tris"] += KratorCells.mesh_tris(mi.mesh)
		out["verts"] += (mi.mesh as ArrayMesh).surface_get_array_len(0)
		var sm := mi.material_override as ShaderMaterial
		if sm != null and sm.get_shader_parameter("form_uv2") == true:
			out["form_mat"] += 1
		if (int((mi.mesh as ArrayMesh).surface_get_format(0)) & Mesh.ARRAY_FORMAT_TEX_UV2) != 0:
			out["uv2"] += 1
			for uv in (mi.mesh.surface_get_arrays(0)[Mesh.ARRAY_TEX_UV2] as PackedVector2Array):
				if uv.x < 0.0:
					out["outside"] += 1
				else:
					out["h_min"] = minf(out["h_min"], uv.x)
					out["h_max"] = maxf(out["h_max"], uv.x)
	return out


func _initialize() -> void:
	var formed := "res://data/world-eternian-form/world.json"
	var plain := "res://data/world-eternian/world.json"
	if not FileAccess.file_exists(formed) or not FileAccess.file_exists(plain):
		print("FAIL no case: see this file's header")
		quit(1)
		return
	var wf := KratorWorld.build(formed)
	var wp := KratorWorld.build(plain)
	var rf: Dictionary = wf.get_meta("report")
	var rp: Dictionary = wp.get_meta("report")
	var f := _count(wf)
	var p := _count(wp)
	ok(not rf["gaps"].has("load") and not rf["gaps"].has("form") and int(f["nodes"]) >= 15, "the formed case loads: %d buckets" % f["nodes"])
	ok(int(f["uv2"]) >= 15 and int(rf.get("form_buckets", 0)) == int(f["form_mat"]) and int(f["form_mat"]) >= 15,
		"its buckets carry the field as a second UV set (%d) and the library ones draw on their material's form twin (%d)" % [f["uv2"], f["form_mat"]])
	ok(float(f["h_min"]) > -0.6 and float(f["h_min"]) < 0.5 and float(f["h_max"]) > 8.0 and float(f["h_max"]) < 60.0 and int(f["outside"]) > 0,
		"the heights run from a building's base (%.2f m) to its top (%.1f m), and what is no building's says so (%d vertices)" % [f["h_min"], f["h_max"], f["outside"]])
	ok(int(p["uv2"]) == 0 and int(p["form_mat"]) == 0 and int(rp.get("form_buckets", 0)) == 0, "negative: the plain case has no second UV set and no form twin")
	ok(int(f["tris"]) > int(p["tris"]) * 1.2 and int(f["verts"]) < int(p["verts"]) * 1.1,
		"chamfered, the tile has %d triangles to the plain one's %d on about the same vertices (%d, %d)" % [f["tris"], p["tris"], f["verts"], p["verts"]])
	var d: Dictionary = KData.read_json(formed)
	var closed := 0
	for b in d["buckets"]:
		closed += 1 if bool(b.get("closed", false)) else 0
	ok(closed > 0 and (d["materials"] as Array).size() > 0, "%d of its buckets are marked closed solids" % closed)
	var body := FileAccess.get_file_as_string("res://shaders/library_body.gdshaderinc")
	var inc := FileAccess.get_file_as_string("res://shaders/lib/weather.gdshaderinc")
	ok(body.contains("uniform bool form_uv2 = false") and body.count("kw_foot(") == 1 and inc.contains("void kw_foot(float h, vec3 wp, vec3 wn"),
		"the library surface reads the height only where its material says the mesh has it, and the foot band is the weathering's")
	wf.free()
	wp.free()
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
