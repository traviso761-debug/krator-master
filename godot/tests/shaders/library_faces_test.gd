# The library surface's three shaders and who takes which (krator/kmat.gd; GODOT-LOOK-PLAN.md section 5, C5). Headless:
# the rule (a cut-out only for an alpha test with a map, both faces where three draws both, else opaque with its back
# faces culled), the two-sided twin, the two guards that keep back-face culling off what it would hide (mirrored
# instances, a merged mesh whose triangles wind against their normals: the export bakes a mirrored mesh's matrix and
# keeps its index order), and the count on a real export. Each check has a negative.
# tests/shaders/look_gpu_check.gd draws the three on a GPU.
#   godot --headless --path godot --script res://tests/shaders/library_faces_test.gd     exits 0 when every check passes
extends SceneTree

const CASE := "res://data/world-longsong/world.json"

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


# a box as an ArrayMesh; mirror: its vertices and normals mirrored in x with the index order kept, as the export bakes a
# mirrored mesh; half: only the triangles of its first three faces mirrored
func _box(mirror := false, half := false) -> ArrayMesh:
	var src := BoxMesh.new()
	src.size = Vector3(2.0, 1.0, 3.0)
	var arr := src.get_mesh_arrays()
	var v: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	var n: PackedVector3Array = arr[Mesh.ARRAY_NORMAL]
	var idx: PackedInt32Array = arr[Mesh.ARRAY_INDEX]
	if mirror:
		for i in v.size():
			v[i] = Vector3(-v[i].x, v[i].y, v[i].z)
			n[i] = Vector3(-n[i].x, n[i].y, n[i].z)
	if half:   # un-flip the second half of the triangles, so half wind with their normals
		for t in range(idx.size() / 6, idx.size() / 3):
			var a := idx[t * 3 + 1]
			idx[t * 3 + 1] = idx[t * 3 + 2]
			idx[t * 3 + 2] = a
	arr[Mesh.ARRAY_VERTEX] = v
	arr[Mesh.ARRAY_NORMAL] = n
	arr[Mesh.ARRAY_INDEX] = idx
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	return m


# a MultiMesh of one box an entry, its buffer written as the importer writes it (twelve floats an instance, a row of the
# basis and the origin's coordinate at a time): the headless server keeps no per-instance transform to read back
func _mm(bases: Array) -> MultiMesh:
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.mesh = _box()
	mm.instance_count = bases.size()
	var buf := PackedFloat32Array()
	buf.resize(bases.size() * 12)
	for i in bases.size():
		var b: Basis = bases[i]
		var o := Vector3(4.0 * i, 0.0, 0.0)
		for r in 3:
			buf[i * 12 + r * 4] = b.x[r]
			buf[i * 12 + r * 4 + 1] = b.y[r]
			buf[i * 12 + r * 4 + 2] = b.z[r]
			buf[i * 12 + r * 4 + 3] = o[r]
	mm.buffer = buf
	return mm


func _lib_mat(sh: Shader) -> ShaderMaterial:
	var sm := ShaderMaterial.new()
	sm.shader = sh
	sm.set_shader_parameter("roughness_k", 0.37)
	sm.set_meta("krator", {"material": "m", "shader": "library.gdshader"})
	return sm


func _initialize() -> void:
	var K := KratorKmat
	# 1. the rule
	ok(K.variant(false) == K.LIB and K.variant(true) == K.LIB_TWOSIDED and K.variant(false, 0.4, true) == K.LIB_CUTOUT and K.variant(true, 0.4, true) == K.LIB_CUTOUT,
		"a record takes the opaque shader, the two-sided one where three draws both faces, the cut-out for an alpha test with a map")
	ok(K.variant(false, 0.4, false) == K.LIB and K.variant(true, 0.0, true) == K.LIB_TWOSIDED, "negative: an alpha test with no map to cut by, or a map with no alpha test, is no cut-out")
	ok(K.is_lib(K.LIB) and K.is_lib(K.LIB_TWOSIDED) and K.is_lib(K.LIB_CUTOUT) and not K.is_lib(KratorBiome.FOLIAGE) and not K.is_lib(null), "is_lib answers for all three, and for no other shader")

	# 2. the three shaders: one body, three render setups, and ALPHA written only by the cut-out
	var body := FileAccess.get_file_as_string("res://shaders/library_body.gdshaderinc")
	var texts := {}
	for f in ["library", "library_twosided", "library_cutout"]:
		texts[f] = FileAccess.get_file_as_string("res://shaders/%s.gdshader" % f)
	var one_body := true
	for f in texts:
		one_body = one_body and str(texts[f]).contains('#include "res://shaders/library_body.gdshaderinc"') and not str(texts[f]).contains("void fragment")
	ok(one_body and body.contains("void fragment") and body.contains("void vertex"), "the three shaders share one body, and hold no code of their own")
	ok(str(texts["library"]).contains("render_mode cull_back;") and str(texts["library_twosided"]).contains("render_mode cull_disabled;") and str(texts["library_cutout"]).contains("render_mode cull_disabled;"),
		"the opaque one culls its back faces; the other two draw both")
	var a0 := body.find("#ifdef K_LIB_CUTOUT")
	var a1 := body.find("#endif", a0)
	var outside := body.substr(0, a0) + body.substr(a1)
	var rx := RegEx.new()
	rx.compile("\\bALPHA\\w*\\s*=")
	ok(a0 >= 0 and a1 > a0 and rx.search(outside) == null and rx.search(body.substr(a0, a1 - a0)) != null,
		"the body writes ALPHA only inside its K_LIB_CUTOUT block (a shader that writes it at all leaves the opaque pass)")
	ok(str(texts["library_cutout"]).contains("#define K_LIB_CUTOUT") and not str(texts["library"]).contains("K_LIB_CUTOUT") and not str(texts["library_twosided"]).contains("K_LIB_CUTOUT"),
		"negative: only the cut-out shader defines K_LIB_CUTOUT")

	# 3. the two-sided twin
	var m0 := _lib_mat(K.LIB)
	var t0 := K.twosided(m0) as ShaderMaterial
	ok(t0 != m0 and t0.shader == K.LIB_TWOSIDED and is_equal_approx(float(t0.get_shader_parameter("roughness_k")), 0.37) and K.twosided(m0) == t0
		and str((t0.get_meta("krator") as Dictionary)["shader"]) == "library_twosided.gdshader" and str((m0.get_meta("krator") as Dictionary)["shader"]) == "library.gdshader",
		"a material's two-sided twin keeps its parameters, is made once, and says which shader draws it")
	var m_cut := _lib_mat(K.LIB_CUTOUT)
	var std := StandardMaterial3D.new()
	ok(K.twosided(m_cut) == m_cut and K.twosided(t0) == t0 and K.twosided(std) == std and K.twosided(null) == null, "negative: any other material comes back as it is")

	# 4. mirrored instances
	var plain := _mm([Basis.IDENTITY, Basis.IDENTITY.rotated(Vector3.UP, 1.1), Basis.IDENTITY.scaled(Vector3(2.0, 0.5, 3.0))])
	var flipped := _mm([Basis.IDENTITY, Basis.IDENTITY.scaled(Vector3(-1.0, 1.0, 1.0)), Basis.IDENTITY])
	var turned := _mm([Basis.IDENTITY.scaled(Vector3(-1.0, 1.0, -1.0))])   # two axes negated: a half turn, not a mirror
	ok(K.mirrored(flipped) and not K.mirrored(plain), "one instance scaled by -1 on one axis is a mirrored MultiMesh")
	ok(not K.mirrored(turned) and not K.mirrored(null), "negative: two axes negated is a half turn, which mirrors nothing")

	# 5. a merged mesh that winds against its normals
	var good := _box()
	var bad := _box(true)
	var mixed := _box(true, true)
	ok(K.winds_against(good) == 0.0 and K.winds_against(bad) == 1.0, "a box winds with its normals; mirrored with its index order kept, every triangle winds against them")
	ok(absf(K.winds_against(mixed) - 0.5) < 0.01 and K.winds_against(null) == 0.0, "half a mesh mirrored is half its triangles (%.2f)" % K.winds_against(mixed))

	# 6. fit: back-face culling only where it hides nothing
	var host := Node3D.new()
	root.add_child(host)
	var mi_bad := MeshInstance3D.new()
	mi_bad.mesh = bad
	var mat_a := _lib_mat(K.LIB)
	mi_bad.material_override = mat_a
	host.add_child(mi_bad)
	var why_bad := K.fit(mi_bad)
	var mi_good := MeshInstance3D.new()
	mi_good.mesh = good
	mi_good.material_override = mat_a
	host.add_child(mi_good)
	var why_good := K.fit(mi_good)
	ok(why_bad.contains("wind against") and (mi_bad.material_override as ShaderMaterial).shader == K.LIB_TWOSIDED and mi_bad.material_override == K.twosided(mat_a),
		"a merged mesh that winds against its normals moves to the two-sided twin (%s)" % why_bad)
	ok(why_good == "" and mi_good.material_override == mat_a, "negative: one that winds with them keeps its back faces culled, on the same material")
	var mmi_f := MultiMeshInstance3D.new()
	mmi_f.multimesh = flipped
	mmi_f.material_override = mat_a
	host.add_child(mmi_f)
	var mmi_p := MultiMeshInstance3D.new()
	mmi_p.multimesh = plain
	mmi_p.material_override = mat_a
	host.add_child(mmi_p)
	ok(K.fit(mmi_f) == "mirrored instances" and (mmi_f.material_override as ShaderMaterial).shader == K.LIB_TWOSIDED and K.fit(mmi_p) == "" and mmi_p.material_override == mat_a,
		"an item with a mirrored instance moves to the twin; one without stays")
	var mi_cut := MeshInstance3D.new()
	mi_cut.mesh = bad
	mi_cut.material_override = m_cut
	host.add_child(mi_cut)
	ok(K.fit(mi_cut) == "" and mi_cut.material_override == m_cut and K.fit(null) == "", "negative: a node on another shader is not looked at")

	# 7. the world importer's records
	var rep := {"gaps": {}}
	var img := ImageTexture.create_from_image(Image.create(4, 4, false, Image.FORMAT_RGBA8))
	var r_single := KratorWorld._standard({"id": "w:a", "kind": "standard", "colour": "#888888", "doubleSided": false}, {}, {}, false, rep) as ShaderMaterial
	var r_double := KratorWorld._standard({"id": "w:b", "kind": "standard", "colour": "#888888", "doubleSided": true}, {}, {}, false, rep) as ShaderMaterial
	var r_old := KratorWorld._standard({"id": "w:c", "kind": "standard", "colour": "#888888"}, {}, {}, false, rep) as ShaderMaterial
	var r_cut := KratorWorld._standard({"id": "w:d", "kind": "standard", "colour": "#888888", "doubleSided": false, "alphaTest": 0.5, "map": "t"}, {"t": img}, {}, false, rep) as ShaderMaterial
	var r_nomap := KratorWorld._standard({"id": "w:e", "kind": "standard", "colour": "#888888", "doubleSided": false, "alphaTest": 0.5}, {}, {}, false, rep) as ShaderMaterial
	ok(r_single.shader == K.LIB and r_double.shader == K.LIB_TWOSIDED and r_cut.shader == K.LIB_CUTOUT
		and str((r_single.get_meta("krator") as Dictionary)["shader"]) == "library.gdshader" and str((r_cut.get_meta("krator") as Dictionary)["shader"]) == "library_cutout.gdshader",
		"a record's doubleSided and alphaTest pick its shader, and its meta names the file")
	ok(r_old.shader == K.LIB_TWOSIDED and r_nomap.shader == K.LIB, "negative: a record without the field is drawn on both faces, as before; an alpha test with no image is opaque")

	# 7b. what the export says of sides and solid_cs (GODOT-LOOK-PLAN.md section 13): side back, and closed
	var rep_b := {"gaps": {}}
	var r_back := KratorWorld._standard({"id": "w:f", "kind": "standard", "colour": "#888888", "doubleSided": false, "side": "back"}, {}, {}, false, rep_b) as ShaderMaterial
	var r_front := KratorWorld._standard({"id": "w:g", "kind": "standard", "colour": "#888888", "doubleSided": false, "side": "front"}, {}, {}, false, rep) as ShaderMaterial
	ok(r_back.shader == K.LIB_TWOSIDED and (rep_b["gaps"] as Dictionary).has("back side") and r_front.shader == K.LIB and not (rep["gaps"] as Dictionary).has("back side"),
		"a record three draws from inside only is drawn on both faces, not culled away, and the report says so; a front one is culled as before")
	var solid_c := MeshInstance3D.new()
	solid_c.mesh = _box()
	solid_c.material_override = r_double
	var rep_c := {"gaps": {}}
	KratorWorld._closed(solid_c, {"closed": true}, rep_c)
	var culled := solid_c.material_override as ShaderMaterial
	ok(culled.shader == K.LIB and culled != r_double and int(rep_c.get("closed_culled", 0)) == 1 and K.onesided(r_double) == culled and K.fit(solid_c) == "",
		"a closed solid on a double-sided material culls its back faces, on a twin made once")
	var sheet_c := MeshInstance3D.new()
	sheet_c.mesh = _box()
	sheet_c.material_override = r_double
	KratorWorld._closed(sheet_c, {"closed": false}, rep_c)
	var cutm := MeshInstance3D.new()
	cutm.mesh = _box()
	cutm.material_override = r_cut
	KratorWorld._closed(cutm, {"closed": true}, rep_c)
	ok(sheet_c.material_override == r_double and cutm.material_override == r_cut and int(rep_c["closed_culled"]) == 1, "negative: one not marked closed, and a cut-out, keep their shaders")
	var mirr_c := MultiMeshInstance3D.new()
	mirr_c.multimesh = _mm([Basis.from_scale(Vector3(-1, 1, 1))])
	mirr_c.material_override = r_double
	KratorWorld._closed(mirr_c, {"closed": true}, rep_c)
	var why_f := K.fit(mirr_c)
	ok(why_f != "" and (mirr_c.material_override as ShaderMaterial).shader == K.LIB_TWOSIDED, "negative: a closed solid whose instances are mirrored is put back on both faces (%s)" % why_f)
	for n in [solid_c, sheet_c, cutm, mirr_c]:
		n.free()

	# 8. a real export: Longsong's lower town, every library node counted, none moved
	if not FileAccess.file_exists(CASE):
		ok(false, "no case at %s" % CASE)
	else:
		var d: Dictionary = KData.read_json(CASE)
		var want := {"culled": 0, "two_sided": 0, "cutout": 0}
		var mats := {}
		for m in d["materials"]:
			mats[m["id"]] = m
		var w := KratorWorld.build(CASE)
		var f: Dictionary = (w.get_meta("report") as Dictionary).get("faces", {})
		var agree := true
		var seen := 0
		for grp in ["Items", "Buckets"]:
			for ch in w.get_node(grp).get_children():
				var sm := (ch as GeometryInstance3D).material_override as ShaderMaterial
				if sm == null or not K.is_lib(sm.shader):
					continue
				seen += 1
				var rec: Dictionary = mats[(ch.get_meta("krator") as Dictionary)["material"]]
				var cut: bool = float(rec.get("alphaTest", 0.0)) > 0.0 and rec.get("map") != null
				var expect: Shader = K.LIB_CUTOUT if cut else (K.LIB_TWOSIDED if bool(rec.get("doubleSided", true)) else K.LIB)
				want["cutout" if expect == K.LIB_CUTOUT else ("two_sided" if expect == K.LIB_TWOSIDED else "culled")] += 1
				if sm.shader != expect:
					agree = false
		ok(agree and seen > 60 and int(f.get("culled", -1)) == want["culled"] and int(f.get("two_sided", -1)) == want["two_sided"] and int(f.get("cutout", -1)) == want["cutout"],
			"Longsong: %d library nodes, %d with their back faces culled, %d on both faces, %d cut out, each as its record says" % [seen, want["culled"], want["two_sided"], want["cutout"]])
		ok(want["culled"] > 20 and want["two_sided"] > 20 and (f.get("moved", []) as Array).is_empty(), "both kinds are there, and no node had to be moved off the culled shader (%s)" % str(f.get("moved", [])))
		w.free()
	host.free()
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
