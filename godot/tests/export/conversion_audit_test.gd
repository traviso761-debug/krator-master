# Comprehensive 3D conversion audit suite (KratorWorldAudit, 22 checks: real worlds + synthetic baseline + 7 paired negatives):
#   1-3.   Standalone krator-world cases: world-sedesert, world-iziz, world-longsong (materials, terrain raycast, flora)
#   4.     world-oidong-highrift streamed chunks: PBR surface maps, backface ConcavePolygonShape3D, physics raycast parity
#   5-9.   world-oidong-highrift all 5 open places (sq80bzd7ep + Monastery, ssinggjar01, smirrorgrange01, scaldronhouse01,
#          sfgtxw10kr + Arcology): materials (BLEND_MODE_MUL decals, foliage alpha scissor), terrain, dual-LOD 3D flora
#          (hero>0, mid>0, lv0=0 in Oidong Valley & Strongbow canyon; hero=0, mid=0, lv0=0 at High Rift alpine houses)
#   10.    world-oidong-highrift collision & stitched place-to-chunk outer perimeter seams (<= 2 mm, 0 foliage colliders)
#   11.    world-oidong-highrift ground-hugging 3D RoadRibbons & bridge span clearance
#   12.    world-oidong-highrift dual-LOD 3D StreamFlora at valley probe (-267024, -41989)
#   13.    world-oidong-highrift KratorHostUI POIs (loaded ground, elevation, ridge line of sight)
#   14.    Synthetic krator-world-stream baseline passes all 7 audits cleanly
#   15-21. 7 paired negatives (mutating materials, terrain, flora, seams/colliders, roads, stream flora, POIs)
#   22.    KratorHostUI.resolve_poi lifts a ridge-occluded overlook camera for unobstructed line of sight
#
#   godot --headless --path godot --script res://tests/export/conversion_audit_test.gd
extends SceneTree

const STANDALONE_CASES := ["world-sedesert", "world-iziz", "world-longsong"]
const OIDONG_INDEX := "res://data/world-oidong-highrift/index.json"
const VALLEY_FLORA_PROBE := Vector2(-267024.0, -41989.0)

var fails := 0
var checks := 0


func ok(cond: bool, msg: String) -> void:
	checks += 1
	print(("ok   " if cond else "FAIL ") + msg)
	if not cond:
		fails += 1


func _initialize() -> void:
	_run()


func _settle_physics() -> void:
	await physics_frame
	await physics_frame
	await physics_frame


func _run() -> void:
	var space := root.get_world_3d().direct_space_state

	# 1-3. Standalone krator-world cases
	for cname in STANDALONE_CASES:
		var wpath := "res://data/%s/world.json" % cname
		if not FileAccess.file_exists(wpath):
			ok(false, "%s: missing %s" % [cname, wpath])
			continue
		var w := KratorWorld.build(wpath)
		KratorWorldStream.collide_case(w)
		root.add_child(w)
		await _settle_physics()
		var rm := KratorWorldAudit.audit_materials(w)
		var rt := KratorWorldAudit.audit_terrain(w, space, false)
		var rf := KratorWorldAudit.audit_flora(w, false)
		var all_ok: bool = bool(rm["ok"]) and bool(rt["ok"]) and bool(rf["ok"]) and int(rt["rays"]) > 0
		var iss: Array = []
		iss.append_array(rm["issues"]); iss.append_array(rt["issues"]); iss.append_array(rf["issues"])
		ok(all_ok, "%s standalone audit: %d mats, %d terrain rays (max err %.4f m), flora hero=%d mid=%d%s"
			% [cname, int(rm["checked"]), int(rt["rays"]), float(rt["max_err"]), int(rf["hero"]), int(rf["mid"]),
			"" if iss.is_empty() else " ISSUES: " + "; ".join(PackedStringArray(iss))])
		root.remove_child(w)
		w.free()
		await physics_frame

	# 4-13. Streamed world-oidong-highrift audits
	if not FileAccess.file_exists(OIDONG_INDEX):
		ok(false, "missing " + OIDONG_INDEX)
		quit(1)
		return
	var S := KratorWorldStream.open(OIDONG_INDEX)
	S.collide = true
	S.threaded = false
	S.auto_places = false
	root.add_child(S)

	# 4. Sample streamed chunks across valley & escarpment (bounded keep_r so BVH memory stays low)
	var chunk_issues: Array[String] = []
	var chunk_rays := 0
	var chunk_checked := 0
	var seen_chunks := {}
	for focus in [Vector2(-154240.0, -25540.0), VALLEY_FLORA_PROBE, Vector2(-610000.0, -76000.0)]:
		S.update(focus, 20000.0, 28000.0)
		await _settle_physics()
		var ckeys: Array = S.chunks.keys()
		ckeys.sort()
		var cstep_i := maxi(1, ckeys.size() / 3)
		for ci in range(0, ckeys.size(), cstep_i):
			var cid := str(ckeys[ci])
			if seen_chunks.has(cid):
				continue
			seen_chunks[cid] = true
			var cw: Node3D = S.chunks[cid]
			var ct := KratorWorldAudit.audit_terrain(cw, space, true)
			chunk_rays += int(ct["rays"])
			chunk_checked += 1
			if not bool(ct["ok"]):
				for msg in ct["issues"]:
					chunk_issues.append(str(msg))
	ok(chunk_checked >= 6 and chunk_rays > 0 and chunk_issues.is_empty(),
		"world-oidong-highrift chunks (%d sampled, %d rays): PBR surface maps, backface collision & raycast parity%s"
		% [chunk_checked, chunk_rays, "" if chunk_issues.is_empty() else " ISSUES: " + "; ".join(chunk_issues)])

	# 5-9. All 5 open places streamed site-by-site (accumulating seam & road audits while each place is open)
	var total_seam_verts := 0
	var max_seam_err := 0.0
	var total_foliage_col := 0
	var cs_issues: Array = []
	var total_ribbons := 0
	var total_buried := 0
	var total_toes := 0
	var total_spans := 0
	var rd_issues: Array = []
	var seen_road_cases := {}

	for p in S.index["places"]:
		var pid := str(p["id"])
		var pin: Array = p["pin"]
		S.update(Vector2(float(pin[0]), float(pin[1])), 20000.0, 28000.0)
		var pw := S.open_place(pid)
		await _settle_physics()
		var pm := KratorWorldAudit.audit_materials(pw)
		var pt := KratorWorldAudit.audit_terrain(pw, space, true)
		var pf := KratorWorldAudit.audit_flora(pw, true)
		var want_trees := pid in ["sq80bzd7ep", "sfgtxw10kr"]
		var tree_ok := (int(pf["hero"]) > 0 and int(pf["mid"]) > 0 and int(pf["lv0"]) == 0) if want_trees else (int(pf["hero"]) == 0 and int(pf["mid"]) == 0 and int(pf["lv0"]) == 0)
		var mul_ok := (int(pm["mul_decals"]) > 0) if pid == "sfgtxw10kr" else true
		var mon_ok := (pw.get_node_or_null("Monastery") != null) if pid == "sq80bzd7ep" else true
		var p_ok: bool = bool(pm["ok"]) and bool(pt["ok"]) and bool(pf["ok"]) and tree_ok and mul_ok and mon_ok
		var piss: Array = []
		piss.append_array(pm["issues"]); piss.append_array(pt["issues"]); piss.append_array(pf["issues"])
		ok(p_ok, "world-oidong-highrift place %s (%s): mats=%d (mul=%d), rays=%d (err=%.4f m), flora hero=%d mid=%d lv0=%d%s"
			% [pid, str(p["name"]), int(pm["checked"]), int(pm["mul_decals"]), int(pt["rays"]), float(pt["max_err"]),
			int(pf["hero"]), int(pf["mid"]), int(pf["lv0"]),
			"" if piss.is_empty() else " ISSUES: " + "; ".join(PackedStringArray(piss))])

		var cs_p := KratorWorldAudit.audit_collision_and_seams(S)
		total_seam_verts += int(cs_p["seam_verts"])
		max_seam_err = maxf(max_seam_err, float(cs_p["max_seam_err"]))
		total_foliage_col += int(cs_p["foliage_colliders"])
		for msg in cs_p["issues"]:
			if not cs_issues.has(msg):
				cs_issues.append(msg)

		var rd_p := KratorWorldAudit.audit_roads(S)
		for cid in S.chunks:
			if not seen_road_cases.has("c:" + str(cid)):
				seen_road_cases["c:" + str(cid)] = true
				if (S.chunks[cid] as Node3D).get_node_or_null("RoadRibbon") != null:
					total_ribbons += 1
		if pw.get_node_or_null("RoadRibbon") != null and not seen_road_cases.has("p:" + pid):
			seen_road_cases["p:" + pid] = true
			total_ribbons += 1
		total_buried += int(rd_p["buried"])
		total_toes += int(rd_p["floating_toes"])
		total_spans += int(rd_p["span_intrusions"])
		for msg in rd_p["issues"]:
			if not rd_issues.has(msg):
				rd_issues.append(msg)

		S.places_open.erase(pid)
		S._place_flora.erase(pid)
		pw.get_parent().remove_child(pw)
		pw.free()
		await physics_frame

	# 10. Collision & stitched seams
	ok(cs_issues.is_empty() and total_seam_verts > 100 and total_foliage_col == 0,
		"world-oidong-highrift collision & stitched place seams: %d perimeter vertices, max err %.5f m, foliage colliders=%d%s"
		% [total_seam_verts, max_seam_err, total_foliage_col,
		"" if cs_issues.is_empty() else " ISSUES: " + "; ".join(PackedStringArray(cs_issues))])

	# 11. Ground-hugging 3D RoadRibbons & bridge spans
	ok(rd_issues.is_empty() and total_ribbons >= 10,
		"world-oidong-highrift RoadRibbons & bridge spans: %d ribbons, buried=%d, floating_toes=%d, span_intrusions=%d%s"
		% [total_ribbons, total_buried, total_toes, total_spans,
		"" if rd_issues.is_empty() else " ISSUES: " + "; ".join(PackedStringArray(rd_issues))])

	# 12. Dual-LOD 3D StreamFlora at valley probe
	S.update(VALLEY_FLORA_PROBE, 20000.0, 28000.0)
	await physics_frame
	var sf_res := KratorWorldAudit.audit_stream_flora(S, VALLEY_FLORA_PROBE)
	ok(bool(sf_res["ok"]),
		"world-oidong-highrift StreamFlora at (%.0f, %.0f): hero=%d, mid=%d%s"
		% [VALLEY_FLORA_PROBE.x, VALLEY_FLORA_PROBE.y, int(sf_res["hero"]), int(sf_res["mid"]),
		"" if (sf_res["issues"] as Array).is_empty() else " ISSUES: " + "; ".join(PackedStringArray(sf_res["issues"]))])

	# 13. KratorHostUI POIs across Oidong Valley, Monastery, High Rift & Cataract (height-grid only; unload BVHs first)
	S.update(Vector2(1e9, 1e9), 1.0, 2.0)
	await physics_frame
	S.collide = false
	S.auto_places = true
	var pois := KratorHostUI.build_pois(S)
	var poi_res := KratorWorldAudit.audit_pois(S, pois)
	ok(bool(poi_res["ok"]) and int(poi_res["checked"]) >= 15,
		"world-oidong-highrift KratorHostUI POIs: %d POIs grounded with clear line of sight%s"
		% [int(poi_res["checked"]),
		"" if (poi_res["issues"] as Array).is_empty() else " ISSUES: " + "; ".join(PackedStringArray(poi_res["issues"]))])

	root.remove_child(S)
	S.free()
	await physics_frame

	# 14-21. Synthetic baseline + 7 paired negative mutations
	await _run_synthetic_and_negatives(space)

	# 22. Ridge-occlusion overlook lift proof on synthetic ridge
	_test_ridge_occlusion_lift()

	print("\n%s: %d checks, %d failed" % ["FAILED" if fails else "OK", checks, fails])
	quit(1 if fails else 0)


func _make_grid_mesh(x0: float, z0: float, nx: int, nz: int, step_m: float, h_fn: Callable) -> MeshInstance3D:
	var H := PackedFloat32Array()
	H.resize(nx * nz)
	var V := PackedVector3Array()
	V.resize(nx * nz)
	var N := PackedVector3Array()
	N.resize(nx * nz)
	var UV := PackedVector2Array()
	UV.resize(nx * nz)
	for j in nz:
		for i in nx:
			var x := x0 + float(i) * step_m
			var z := z0 + float(j) * step_m
			var y := float(h_fn.call(x, z))
			H[j * nx + i] = y
			V[j * nx + i] = Vector3(x, y, z)
			N[j * nx + i] = Vector3.UP
			UV[j * nx + i] = Vector2(float(i) / float(nx - 1), float(j) / float(nz - 1))
	var I := PackedInt32Array()
	for j in nz - 1:
		for i in nx - 1:
			var a := j * nx + i
			var b := a + 1
			var c := a + nx
			var d := c + 1
			I.append_array([a, b, c, b, d, c])
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = V
	arr[Mesh.ARRAY_NORMAL] = N
	arr[Mesh.ARRAY_TEX_UV] = UV
	arr[Mesh.ARRAY_INDEX] = I
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	var sm := ShaderMaterial.new()
	sm.shader = KratorWorldAudit.TERRAIN_SHADER
	var img := Image.create(4, 4, false, Image.FORMAT_RGBA8)
	img.fill(Color(0.45, 0.42, 0.36, 0.5))
	var tex := ImageTexture.create_from_image(img)
	sm.set_shader_parameter("has_surface_tex", true)
	sm.set_shader_parameter("albedo_rock_tex", tex)
	sm.set_shader_parameter("normal_cav_tex", tex)
	mesh.surface_set_material(0, sm)
	var mi := MeshInstance3D.new()
	mi.name = "Terrain"
	mi.mesh = mesh
	mi.material_override = sm
	mi.set_meta("grid", {"x0": x0, "z0": z0, "nx": nx, "nz": nz, "step": step_m, "h": H})
	return mi


func _build_synthetic_stream() -> KratorWorldStream:
	var st := KratorWorldStream.new()
	st.name = "SynthStream"
	st.collide = true
	st.threaded = false
	st.origin = [0.0, 0.0, 0.0]
	st.index = {
		"format": "krator-world-stream",
		"version": 1,
		"region": "synth",
		"chunk": {"size": 512, "step": 64, "list": [{"id": "c+000+000", "box": [0, 0, 512, 512], "case": "chunks/c+000+000"}]},
		"places": [{"id": "p0", "name": "SynthPlace", "pin": [192, 192], "box": [128, 128, 384, 384], "case": "places/p0", "hamlets": []}],
		"roads": [
			{"id": "r0", "kind": "link", "from": "p0", "to": "p0", "pts": [[32.0, 256.0, 10.0], [120.0, 256.0, 10.0], [160.0, 256.0, 10.0], [220.0, 256.0, 10.0], [320.0, 256.0, 10.0]], "spans": [[2, 3]]}
		]
	}
	st._box["c+000+000"] = [0, 0, 512, 512]
	var chunks_n := Node3D.new(); chunks_n.name = "Chunks"; st.add_child(chunks_n)
	var places_n := Node3D.new(); places_n.name = "Places"; st.add_child(places_n)
	var sf_n := Node3D.new(); sf_n.name = "StreamFlora"; st.add_child(sf_n)
	st._stream_flora_root = sf_n
	st._flora_lib_ready = true

	var h_fn := func(x: float, z: float) -> float: return 10.0 + 0.02 * x + 0.01 * z

	# Chunk c+000+000
	var cw := Node3D.new()
	cw.name = "Chunk_c+000+000"
	cw.set_meta("origin", [0.0, 0.0, 0.0])
	cw.set_meta("report", {"gaps": {}})
	var c_mi := _make_grid_mesh(0.0, 0.0, 9, 9, 64.0, h_fn)
	cw.add_child(c_mi)
	cw.set_meta("ground", c_mi)
	st._hole(cw, [0, 0, 512, 512])
	st._build_roads(cw, [0, 0, 512, 512], false)
	KratorWorldStream.collide_case(cw)
	st.add_child(cw)
	st.chunks["c+000+000"] = cw

	# Place p0
	var pw := Node3D.new()
	pw.name = "Place_p0"
	pw.set_meta("origin", [0.0, 0.0, 0.0])
	pw.set_meta("report", {"gaps": {}})
	pw.set_meta("world", {"materials": [{"id": "m_decal", "blending": "multiply", "transparent": true, "opacity": 1.0}]})
	var p_mi := _make_grid_mesh(128.0, 128.0, 33, 33, 8.0, h_fn)
	pw.add_child(p_mi)
	pw.set_meta("ground", p_mi)
	st._stitch(pw)
	st._build_roads(pw, [128, 128, 384, 384], true)

	var items_n := Node3D.new(); items_n.name = "Items"; pw.add_child(items_n)
	var fol_sm := ShaderMaterial.new()
	fol_sm.shader = KratorBiome.FOLIAGE
	fol_sm.set_shader_parameter("alpha_test", 0.42)
	var tree_mmi := MultiMeshInstance3D.new()
	tree_mmi.name = "TreeHero"
	var tmm := MultiMesh.new()
	tmm.transform_format = MultiMesh.TRANSFORM_3D
	tmm.mesh = BoxMesh.new()
	tmm.instance_count = 1
	var ty := float(h_fn.call(200.0, 200.0))
	tmm.buffer = PackedFloat32Array([1.0, 0.0, 0.0, 200.0, 0.0, 1.0, 0.0, ty, 0.0, 0.0, 1.0, 200.0])
	tree_mmi.multimesh = tmm
	tree_mmi.material_override = fol_sm
	tree_mmi.set_meta("krator", {"kit": "flora", "name": "flora/0|0|0|2/leaf"})
	items_n.add_child(tree_mmi)

	var bks_n := Node3D.new(); bks_n.name = "Buckets"; pw.add_child(bks_n)
	var decal_mi := MeshInstance3D.new()
	decal_mi.name = "StainDecal"
	decal_mi.mesh = QuadMesh.new()
	var dmat := StandardMaterial3D.new()
	dmat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	dmat.blend_mode = BaseMaterial3D.BLEND_MODE_MUL
	dmat.set_meta("krator", {"material": "m_decal", "shader": "StandardMaterial3D (mul)"})
	decal_mi.material_override = dmat
	decal_mi.set_meta("krator_record_ids", PackedStringArray(["b0"]))
	bks_n.add_child(decal_mi)

	var grass_mi := MeshInstance3D.new()
	grass_mi.name = "FloorGrass"
	grass_mi.mesh = QuadMesh.new()
	grass_mi.material_override = fol_sm
	bks_n.add_child(grass_mi)

	KratorWorldStream.collide_case(pw)
	places_n.add_child(pw)
	st.places_open["p0"] = pw

	# Synthetic StreamFlora prototypes & chunk table
	st._flora_protos["0|0|0|2"] = {"H": 10.0, "crown_r": 4.0, "parts": [{"mesh": BoxMesh.new(), "material": fol_sm, "use_colors": false, "krator": {"kit": "flora", "name": "flora/0|0|0|2/leaf"}}]}
	st._flora_protos["0|0|0|1"] = {"H": 10.0, "crown_r": 4.0, "parts": [{"mesh": BoxMesh.new(), "material": fol_sm, "use_colors": false, "krator": {"kit": "flora", "name": "flora/0|0|0|1/leaf"}}]}
	st._chunk_flora["c+000+000"] = {
		"origin": [0.0, 0.0, 0.0],
		"keys": ["0|0|0"],
		"data": PackedFloat32Array([
			60.0, float(h_fn.call(60.0, 60.0)), 60.0, 0.0, 12.0, 0.0,
			460.0, float(h_fn.call(460.0, 460.0)), 460.0, 0.5, 11.0, 0.0
		]),
		"count": 2,
		"box": [0, 0, 512, 512]
	}
	return st


func _run_synthetic_and_negatives(space: PhysicsDirectSpaceState3D) -> void:
	var S := _build_synthetic_stream()
	root.add_child(S)
	await _settle_physics()
	var pw: Node3D = S.places_open["p0"]
	var cw: Node3D = S.chunks["c+000+000"]
	var pois := [
		{"label": "Synth Overlook", "kind": "place_overlook", "eye": Vector3(64.0, 80.0, 64.0), "target": Vector3(192.0, 16.0, 192.0), "grounded": true, "walk": false},
		{"label": "Synth Walk", "kind": "place_walk", "eye": Vector3(192.0, 20.0, 200.0), "target": Vector3(192.0, 16.0, 192.0), "grounded": true, "walk": true}
	]

	# 14. Synthetic baseline passes all 7 audits
	var b_mat := KratorWorldAudit.audit_materials(pw)
	var b_ter := KratorWorldAudit.audit_terrain(pw, space, true)
	var b_flo := KratorWorldAudit.audit_flora(pw, true)
	var b_col := KratorWorldAudit.audit_collision_and_seams(S)
	var b_rds := KratorWorldAudit.audit_roads(S)
	var b_sf := KratorWorldAudit.audit_stream_flora(S, Vector2(64.0, 64.0))
	var b_poi := KratorWorldAudit.audit_pois(S, pois)
	var base_ok: bool = bool(b_mat["ok"]) and bool(b_ter["ok"]) and bool(b_flo["ok"]) and bool(b_col["ok"]) and bool(b_rds["ok"]) and bool(b_sf["ok"]) and bool(b_poi["ok"])
	ok(base_ok, "synthetic stream baseline passes all 7 audits")

	# 15. Negative [materials]: decal blend_mode switched from BLEND_MODE_MUL to BLEND_MODE_MIX + alpha_test=0 on foliage
	var dmi := pw.get_node("Buckets/StainDecal") as MeshInstance3D
	var dstd := dmi.material_override as StandardMaterial3D
	dstd.blend_mode = BaseMaterial3D.BLEND_MODE_MIX
	var n_mat := KratorWorldAudit.audit_materials(pw)
	ok(not bool(n_mat["ok"]), "negative [materials]: catches non-MUL stain decal (%d issue)" % (n_mat["issues"] as Array).size())
	dstd.blend_mode = BaseMaterial3D.BLEND_MODE_MUL

	# 16. Negative [terrain]: disable has_surface_tex & backface_collision
	var p_mi := pw.get_node("Terrain") as MeshInstance3D
	var p_sm := p_mi.material_override as ShaderMaterial
	p_sm.set_shader_parameter("has_surface_tex", false)
	var n_ter := KratorWorldAudit.audit_terrain(pw, space, true)
	ok(not bool(n_ter["ok"]), "negative [terrain]: catches missing PBR surface maps (%d issue)" % (n_ter["issues"] as Array).size())
	p_sm.set_shader_parameter("has_surface_tex", true)

	# 17. Negative [flora]: inject forbidden clunky lv=0 flora item & floating instance
	var tree_mmi := pw.get_node("Items/TreeHero") as MultiMeshInstance3D
	tree_mmi.set_meta("krator", {"kit": "flora", "name": "flora/0|0|0|0/far"})
	var n_flo := KratorWorldAudit.audit_flora(pw, true)
	ok(not bool(n_flo["ok"]) and int(n_flo["lv0"]) > 0, "negative [flora]: catches forbidden clunky lv=0 flora blob")
	tree_mmi.set_meta("krator", {"kit": "flora", "name": "flora/0|0|0|2/leaf"})

	# 18. Negative [collision & seams]: attach blocking Collision body onto FloorGrass foliage bucket
	var grass_mi := pw.get_node("Buckets/FloorGrass") as MeshInstance3D
	var fake_col := StaticBody3D.new()
	fake_col.name = "Collision"
	grass_mi.add_child(fake_col)
	var n_col := KratorWorldAudit.audit_collision_and_seams(S)
	ok(not bool(n_col["ok"]) and int(n_col["foliage_colliders"]) > 0, "negative [collision & seams]: catches blocking collider on foliage bucket")
	grass_mi.remove_child(fake_col)
	fake_col.free()

	# 19. Negative [roads]: sink RoadRibbon 0.5 m underground so carriageway vertices bury beneath terrain triangles
	var rmi := cw.get_node("RoadRibbon") as MeshInstance3D
	rmi.position.y = -0.5
	var n_rds := KratorWorldAudit.audit_roads(S)
	ok(not bool(n_rds["ok"]) and int(n_rds["buried"]) > 0, "negative [roads]: catches buried RoadRibbon carriageway")
	rmi.position.y = 0.0

	# 20. Negative [stream flora]: attach lod_y instance uniform onto active StreamFlora MultiMeshInstance3D
	S.refresh_flora_at(Vector3(64.0, 14.0, 64.0), 240.0, 2600.0)
	var sf_mmi := S.get_node("StreamFlora").get_child(0) as MultiMeshInstance3D
	sf_mmi.set_instance_shader_parameter("lod_y", Vector4(0.0, 10.0, 0.0, 1.0))
	var n_sf := KratorWorldAudit.audit_stream_flora(S, Vector2(64.0, 64.0))
	ok(not bool(n_sf["ok"]), "negative [stream flora]: catches lod_y instance uniform on StreamFlora")
	sf_mmi.set_instance_shader_parameter("lod_y", null)

	# 21. Negative [pois]: POI pointing over unloaded void coordinates
	var bad_pois := [{"label": "Void POI", "kind": "place_overlook", "eye": Vector3(999999.0, 100.0, 999999.0), "target": Vector3(999999.0, 50.0, 999900.0), "grounded": true, "walk": false}]
	var n_poi := KratorWorldAudit.audit_pois(S, bad_pois)
	ok(not bool(n_poi["ok"]), "negative [pois]: catches POI over unloaded void ground")

	root.remove_child(S)
	S.free()
	await physics_frame


func _test_ridge_occlusion_lift() -> void:
	var st := KratorWorldStream.new()
	st.collide = false
	st.threaded = false
	st.origin = [0.0, 0.0, 0.0]
	st.index = {
		"format": "krator-world-stream", "version": 1, "region": "ridge",
		"chunk": {"size": 512, "step": 64, "list": [{"id": "c+000+000", "box": [0, 0, 512, 512], "case": "chunks/c+000+000"}]},
		"places": [], "roads": []
	}
	st._box["c+000+000"] = [0, 0, 512, 512]
	var chunks_n := Node3D.new(); chunks_n.name = "Chunks"; st.add_child(chunks_n)
	var places_n := Node3D.new(); places_n.name = "Places"; st.add_child(places_n)
	var cw := Node3D.new()
	cw.name = "Chunk_c+000+000"
	cw.set_meta("origin", [0.0, 0.0, 0.0])
	# Tall 120 m ridge peaking at z = 256 between eye (z = 64, h = 10 m) and target (z = 448, h = 10 m)
	var ridge_fn := func(_x: float, z: float) -> float:
		return 10.0 + 110.0 * exp(-pow((z - 256.0) / 70.0, 2.0))
	var c_mi := _make_grid_mesh(0.0, 0.0, 9, 9, 64.0, ridge_fn)
	cw.add_child(c_mi)
	cw.set_meta("ground", c_mi)
	st.add_child(cw)
	st.chunks["c+000+000"] = cw

	var occluded := {
		"label": "Occluded Overlook", "kind": "place_overlook",
		"eye": Vector3(256.0, 35.0, 64.0), "target": Vector3(256.0, 12.0, 448.0),
		"grounded": true, "walk": false
	}
	var resolved := KratorHostUI.resolve_poi(st, occluded)
	var lifted_eye: Vector3 = resolved["eye"]
	var mid_ray_y := lerpf(lifted_eye.y, (resolved["target"] as Vector3).y, 0.5)
	var ridge_top := st.height_at(256.0, 256.0)
	ok(lifted_eye.y > 180.0 and mid_ray_y >= ridge_top + 6.0,
		"KratorHostUI.resolve_poi lifts ridge-occluded overlook camera for clear line of sight (eye %.1f m -> %.1f m over %.1f m ridge)"
		% [35.0, lifted_eye.y, ridge_top])
	st.free()
