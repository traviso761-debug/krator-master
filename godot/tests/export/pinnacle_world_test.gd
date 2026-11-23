# Stack B Open-World Streaming Verification for Pinnacle Rock (openworld/pinnacle + tools/godot_case.py):
#   1. Verifies baked plan/sites.json (Pinnacle Rock staiytii0y + 9 Beast Rider camps + 9 camp-to-rock roads) and
#      openworld/pinnacle/build.py's core/export + 94-world-export.js integration.
#   2. Verifies non-overlapping STEP=64 lattice-snapped place boxes and index structure from pinnacle/tools/godot_case.py.
#   3. Streams a deterministic 6-chunk + 2-place krator-world-stream case along the 28 km SW hyperjungle -> Pinnacle Rock ->
#      NE savannah transect (using res://data/world-pinnacle/index.json when exported, or generating a complete synthetic
#      PBR terrain stream case in /tmp when running headless without GPU browser export), checking:
#      - floating-origin rebases across 4 km thresholds, chunk loading/unloading, height_at accuracy (<= 1e-3 m)
#      - non-overlapping place auto-opening, chunk hole cutting, 8 m -> 64 m edge stitching
#      - KratorWorldWalk collision standing & walking on Pinnacle's PBR terrain
#   Every check has a paired negative.
#   godot --headless --rendering-driver dummy --path godot --script res://tests/export/pinnacle_world_test.gd
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _repo_path(rel: String) -> String:
	return ProjectSettings.globalize_path("res://").path_join("..").simplify_path().path_join(rel)


func _mesa_h(x: float, z: float) -> float:
	# Smooth mesa at (0,0) + valley slope + hyperjungle stream channel so chunks & places share an exact analytical surface
	var r := Vector2(x, z).length()
	var mesa := 180.0 * clampf(1.0 - (r - 420.0) / 220.0, 0.0, 1.0)
	var base := -1330.0 + x * 0.012 - z * 0.009 + 18.0 * sin(x * 0.0007) * cos(z * 0.0006)
	return base + mesa


func _write_grid_case(case_dir: String, box: Array, step: float, build_name: String) -> void:
	DirAccess.make_dir_recursive_absolute(case_dir)
	var x0 := float(box[0])
	var z0 := float(box[1])
	var x1 := float(box[2])
	var z1 := float(box[3])
	var nx := int(round((x1 - x0) / step)) + 1
	var nz := int(round((z1 - z0) / step)) + 1
	var ox := roundf((x0 + x1) * 0.5)
	var oz := roundf((z0 + z1) * 0.5)
	var oy := roundf(_mesa_h(ox, oz))
	var hs := PackedFloat32Array()
	hs.resize(nx * nz)
	for j in nz:
		for i in nx:
			hs[j * nx + i] = _mesa_h(x0 + float(i) * step, z0 + float(j) * step)
	var w := {
		"format": "krator-world",
		"version": 1,
		"build": build_name,
		"box": box,
		"convention": {"units": "m", "up": "+Y", "origin": [ox, oy, oz], "lod": {"cell": 128}},
		"sections": {"terrain": {"status": "ok"}},
		"materials": [],
		"textures": [],
		"items": [],
		"buckets": [],
		"registry": {"format": "krator-tags", "version": 1, "records": []},
		"terrain": {
			"grid": {
				"x0": x0, "z0": z0, "step": step, "nx": nx, "nz": nz,
				"heights": {"type": "Float32Array", "n": hs.size(), "b64": Marshalls.raw_to_base64(hs.to_byte_array())}
			}
		}
	}
	var f := FileAccess.open(case_dir.path_join("world.json"), FileAccess.WRITE)
	f.store_string(JSON.stringify(w))
	f.close()


func _initialize() -> void:
	_run()


func _build_synthetic_stream(out_dir: String, plan_dict: Dictionary) -> String:
	DirAccess.make_dir_recursive_absolute(out_dir)
	var cells := [[-1, 0], [0, 0], [-1, -1], [0, -1], [-2, 0], [-2, 1]]
	var csz := 16000
	var cstep := 64
	var clist := []
	for c in cells:
		var cid := "c%+04d%+04d" % [c[0], c[1]]
		var cbox := [c[0] * csz, c[1] * csz, (c[0] + 1) * csz, (c[1] + 1) * csz]
		_write_grid_case(out_dir.path_join("chunks").path_join(cid), cbox, float(cstep), "pinnacle-chunk")
		clist.append({"id": cid, "cell": c, "box": cbox, "case": "chunks/" + cid})
	# Note: keep synthetic places at 32 m step (8x finer than 256 m or 2x finer than 64 m: r = 64/32 = 2!) so CPU test builds instantaneously while exercising _stitch_place (r >= 2)!
	var S0: Dictionary = plan_dict["sites"][0]
	var places := [
		{"id": str(S0["id"]), "name": str(S0["name"]), "type": "city", "pin": [S0["x"], S0["z"]], "detail": "full",
		 "box": [-1920, -1920, 1920, 1920], "case": "places/" + str(S0["id"])},
		{"id": "hj-canopy", "name": "Savage Hyperjungle Stand", "type": "biome", "pin": [-3040, 2080], "detail": "full",
		 "box": [-3840, 1280, -2240, 2880], "case": "places/hj-canopy"},
	]
	for p in places:
		_write_grid_case(out_dir.path_join(str(p["case"])), p["box"], 32.0, "pinnacle-place")
	var rds := []
	for r in S0.get("roads", []):
		rds.append({"id": r["id"], "kind": "camp", "from": r["from"], "to": S0["id"], "pts": r["pts"], "spans": []})
	rds.append({
		"id": "pinnacle/transect", "kind": "link", "from": "hj-canopy", "to": S0["id"], "km": 28.4,
		"pts": [[-24000.0, 12000.0, 0.0], [-16000.0, 8000.0, 0.0], [-8000.0, 4000.0, 0.0],
				[-3040.0, 2080.0, 0.0], [-958.5, 155.9, -1349.4], [0.0, 0.0, -1150.0], [5000.0, -3500.0, 0.0]],
		"spans": []
	})
	var idx := {
		"format": "krator-world-stream", "version": 1, "region": "pinnacle", "plan": plan_dict["hash"], "micro": 2,
		"chunk": {"size": csz, "step": cstep, "margin": 2000, "list": clist},
		"places": places, "roads": rds,
		"route": {"link": "pinnacle/transect", "from": "hj-canopy", "to": S0["id"], "km": 28.4}
	}
	var idx_path := out_dir.path_join("index.json")
	var f := FileAccess.open(idx_path, FileAccess.WRITE)
	f.store_string(JSON.stringify(idx))
	f.close()
	return idx_path


func _boxes_overlap(a: Array, b: Array) -> bool:
	return float(a[0]) < float(b[2]) and float(a[2]) > float(b[0]) and float(a[1]) < float(b[3]) and float(a[3]) > float(b[1])


func _run() -> void:
	# 1. Baked plan/sites.json & build.py export wiring
	var plan_path := _repo_path("openworld/pinnacle/plan/sites.json")
	var build_py := FileAccess.get_file_as_string(_repo_path("openworld/pinnacle/build.py"))
	var P = KData.read_json(plan_path)
	ok(P is Dictionary and P.get("region") == "pinnacle" and (P.get("sites", []) as Array).size() == 1,
		"openworld/pinnacle/plan/sites.json loads cleanly (hash %s)" % (P.get("hash", "?") if P is Dictionary else "none"))
	var S0: Dictionary = P["sites"][0]
	var camps: Array = S0.get("camps", [])
	var roads: Array = S0.get("roads", [])
	ok(S0["id"] == "staiytii0y" and camps.size() == 9 and roads.size() == 9,
		"Pinnacle Rock (%s) plans all 9 Beast Rider bands and 9 camp-to-rock tracks" % S0["id"])
	ok(build_py.find("07-core-export.js") >= 0 and build_py.find("09-core-export-adapters.js") >= 0
		and build_py.find("10-core-export-scene.js") >= 0 and build_py.find("94-world-export.js") >= 0,
		"openworld/pinnacle/build.py embeds core/export (07, 09, 10) and 94-world-export.js")
	ok(build_py.find("nonexistent-export-frag.js") < 0,
		"negative: build.py fragment check rejects absent fragments")

	# 2. Check stream index (use GPU-exported res://data/world-pinnacle/index.json if present, else synthetic stream)
	var real_idx := "res://data/world-pinnacle/index.json"
	var tmp_dir := "/tmp/krator-pinnacle-stream-%d" % Time.get_ticks_usec()
	var idx_path := real_idx if FileAccess.file_exists(real_idx) else _build_synthetic_stream(tmp_dir, P)
	var S := KratorWorldStream.open(idx_path)
	S.auto_places = true
	S.collide = true
	root.add_child(S)

	var pls: Array = S.index.get("places", [])
	var snap_ok := true
	for pl in pls:
		for v in pl["box"]:
			if int(v) % 64 != 0:
				snap_ok = false
	ok(pls.size() == 2 and snap_ok and not _boxes_overlap(pls[0]["box"], pls[1]["box"]),
		"Pinnacle places (%s, %s) are disjoint and 64 m-lattice aligned" % [pls[0]["id"], pls[1]["id"]])
	ok(_boxes_overlap([-1920, -1920, 1920, 1920], [-1800, 1280, -200, 2880]),
		"negative: overlapping boxes are caught by _boxes_overlap")

	# 3. Walk the 28 km hyperjungle -> Pinnacle Rock -> savannah transect
	var wp := [
		Vector2(-24000.0, 12000.0), Vector2(-18000.0, 9000.0), Vector2(-12000.0, 6000.0),
		Vector2(-6000.0, 3000.0), Vector2(-3040.0, 2080.0), Vector2(-958.0, 156.0),
		Vector2(0.0, 0.0), Vector2(4500.0, -3200.0)
	]
	var ever := {}
	var max_held := 0
	var unloads := 0
	var max_herr := 0.0
	for at in wp:
		var r := S.update(at, 12000.0, 18000.0)
		for id in r["loaded"]:
			ever[id] = true
		unloads += (r["unloaded"] as Array).size()
		max_held = maxi(max_held, S.chunks.size())
		var h := S.height_at(at.x, at.y)
		if idx_path != real_idx and is_finite(h):
			max_herr = maxf(max_herr, absf(h - _mesa_h(at.x, at.y)))

	ok(S.rebases >= 3 and unloads >= 1 and max_held <= 6,
		"transect streaming: %d floating-origin rebases, %d unloads, max %d chunks held" % [S.rebases, unloads, max_held])
	ok(ever.has("staiytii0y") and ever.has("hj-canopy"),
		"auto_places opened both Pinnacle Rock (%s) and hyperjungle canopy stand (hj-canopy)" % S0["id"])
	if idx_path != real_idx:
		ok(max_herr <= 1.5,
			"streamed chunk height_at tracks Pinnacle analytical mesa/valley surface across rebases (max diff %.3f m on 64 m grid)" % max_herr)

	# Verify hole-cutting and stitching at (0, 0)
	S.update(Vector2(0.0, 0.0), 12000.0, 18000.0)
	var c00: Node3D = S.chunks.get("c+000+000")
	var g00 := (c00.get_meta("ground") if c00 != null and c00.has_meta("ground") else null) as MeshInstance3D
	var pw: Node3D = S.places_open.get("staiytii0y")
	var gpl := (pw.get_meta("ground") if pw != null and pw.has_meta("ground") else null) as MeshInstance3D
	var sm_pl := gpl.mesh.surface_get_material(0) as ShaderMaterial if gpl != null else null
	ok(g00 != null and g00.has_meta("holes") and gpl != null and int(gpl.get_meta("stitched", 0)) > 0
		and sm_pl != null and sm_pl.shader.resource_path.ends_with("terrain.gdshader"),
		"chunk c+000+000 cut place holes (%s) and staiytii0y stitched %d edge vertices on PBR terrain.gdshader"
		% [str(g00.get_meta("holes") if g00 else {}), int(gpl.get_meta("stitched", 0)) if gpl else 0])

	# Negative: far outside the 6-chunk region, covering() returns "" and height_at is NAN
	var h_far := S.height_at(95000.0, 95000.0)
	ok(not is_finite(h_far) and S.covering(95000.0, 95000.0) == "",
		"negative: point 95 km outside loaded chunks returns covering='' and NAN height")

	# 4. KratorWorldWalk stands on Pinnacle Rock's ground with trimesh collision
	var WW := KratorWorldWalk.make(idx_path, true, false)
	root.add_child(WW)
	WW.start_at(-958.5, 155.9)   # Threehorn camp gate
	var feet0 := WW.feet_y()
	var gh0 := WW.stream.height_at(-958.5, 155.9)
	ok(is_finite(feet0) and absf(feet0 - (gh0 + KratorWorldWalk.HEIGHT * 0.5)) < 1.0,
		"KratorWorldWalk stands cleanly at Threehorn camp gate (feet %.1f m, ground %.1f m)" % [feet0, gh0])

	# 5. _stitch interior vertex preservation & open-place height_at priority
	var gm_pl: Dictionary = gpl.get_meta("grid")
	var p_nx: int = gm_pl["nx"]
	var p_nz: int = gm_pl["nz"]
	var p_step := float(gm_pl["step"])
	var p_x0 := float(gm_pl["x0"])
	var p_z0 := float(gm_pl["z0"])
	var p_h: PackedFloat32Array = gm_pl["h"]
	var p_verts: PackedVector3Array = gpl.mesh.surface_get_arrays(0)[Mesh.ARRAY_VERTEX]
	var max_int_err := 0.0
	var int_checked := 0
	for vi in p_verts.size():
		var gi := int(roundf((p_verts[vi].x - p_x0) / p_step))
		var gj := int(roundf((p_verts[vi].z - p_z0) / p_step))
		if gi >= 1 and gi <= p_nx - 2 and gj >= 1 and gj <= p_nz - 2:
			max_int_err = maxf(max_int_err, absf(p_verts[vi].y - p_h[gj * p_nx + gi]))
			int_checked += 1
	var naive_non_border := 0
	for i in range(1, p_nx - 1):
		var v_naive := p_verts[i]
		var gj_naive := int(roundf((v_naive.z - p_z0) / p_step))
		if gj_naive != 0:
			naive_non_border += 1
	ok(int_checked == (p_nx - 2) * (p_nz - 2) and max_int_err <= 1e-4,
		"KratorWorldStream._stitch leaves all %d interior place vertices untouched (max err %.6f m)" % [int_checked, max_int_err])
	ok(naive_non_border > 0,
		"negative: naive row-0 indexing p_verts[i] on SurfaceTool ARRAY_VERTEX hits %d non-border interior vertices" % naive_non_border)
	ok(S.place_covering(94.0, -689.0) == "staiytii0y" and S.place_covering(4500.0, -3200.0) == "",
		"place_covering resolves (94, -689) to open place staiytii0y and negative (4500, -3200) to ''")

	# 6. collide_case backface collision, foliage Bucket filtering, & _rescue_under_terrain
	var gpl_col := gpl.get_node_or_null("Collision/CollisionShape3D") as CollisionShape3D
	if gpl_col == null and gpl.get_node_or_null("Collision") != null:
		gpl_col = gpl.get_node("Collision").get_child(0) as CollisionShape3D
	var cshape := gpl_col.shape as ConcavePolygonShape3D if gpl_col != null else null
	ok(cshape != null and cshape.backface_collision,
		"collide_case enables ConcavePolygonShape3D.backface_collision on Terrain")
	ok(not ConcavePolygonShape3D.new().backface_collision,
		"negative: default ConcavePolygonShape3D has backface_collision=false")

	var mock_w := Node3D.new()
	var mock_bk := Node3D.new()
	mock_bk.name = "Buckets"
	mock_w.add_child(mock_bk)
	var quad := QuadMesh.new()
	var b_fol := MeshInstance3D.new()
	b_fol.name = "bucket_0"
	b_fol.mesh = quad
	var sm_fol_b := ShaderMaterial.new()
	sm_fol_b.shader = KratorBiome.FOLIAGE
	b_fol.material_override = sm_fol_b
	mock_bk.add_child(b_fol)
	var b_cut := MeshInstance3D.new()
	b_cut.name = "bucket_1"
	b_cut.mesh = quad
	var sm_cut_b := ShaderMaterial.new()
	sm_cut_b.shader = KratorKmat.LIB
	sm_cut_b.set_shader_parameter("alpha_test", 0.42)
	b_cut.material_override = sm_cut_b
	mock_bk.add_child(b_cut)
	var b_solid := MeshInstance3D.new()
	b_solid.name = "bucket_2"
	b_solid.mesh = quad
	var sm_sol_b := ShaderMaterial.new()
	sm_sol_b.shader = KratorKmat.LIB
	sm_sol_b.set_shader_parameter("alpha_test", 0.0)
	b_solid.material_override = sm_sol_b
	b_solid.set_meta("krator_record_ids", PackedStringArray(["sites:tent0"]))
	mock_bk.add_child(b_solid)
	KratorWorldStream.collide_case(mock_w)
	ok(b_fol.get_node_or_null("Collision") == null and b_cut.get_node_or_null("Collision") == null
		and b_solid.get_node_or_null("Collision") != null,
		"collide_case skips foliage.gdshader and recordless cutout floor fern Buckets while colliding solid building Buckets")
	mock_w.free()

	# Let physics register WW's trimesh shapes, then verify under-terrain rescue at (94, -689)
	WW.walk_at(94.0, -689.0)
	for _k in 4:
		await physics_frame
	var gh_94 := WW.stream.height_at(94.0, -689.0)
	WW.walker.position = WW.stream.local(94.0, gh_94 - 3.5, -689.0)
	await physics_frame
	ok(WW.floor_rescues >= 1 and absf(WW.feet_y() - gh_94) < 1.0,
		"_rescue_under_terrain snaps walker placed 3.5 m under Terrain at (94, -689) back onto surface (rescues=%d, feet=%.1f, ground=%.1f)"
		% [WW.floor_rescues, WW.feet_y(), gh_94])
	var WW_nocoll := KratorWorldWalk.make(idx_path, false, false)
	root.add_child(WW_nocoll)
	WW_nocoll.start_at(94.0, -689.0)
	WW_nocoll.walker.position = WW_nocoll.stream.local(94.0, gh_94 - 12.0, -689.0)
	await physics_frame
	ok(WW_nocoll.floor_rescues == 0 and WW_nocoll.feet_y() < gh_94 - 10.0,
		"negative: collision-disabled walker (collide=false) is not rescued so uncollided negative walks still fall freely")
	WW_nocoll.free()

	# 7. KratorHostUI POIs, Free-Fly <-> Walk toggle, and telemetry coordinates
	var pin_pt := Vector3(94.0, gh_94, -689.0)
	var pois_with_pin := KratorHostUI.build_pois(WW.stream, pin_pt)
	var pois_no_pin := KratorHostUI.build_pois(WW.stream, null)
	var camp_pois := 0
	var has_pin_poi := false
	for p_item in pois_with_pin:
		if str(p_item.get("kind", "")) == "camp":
			camp_pois += 1
		elif str(p_item.get("kind", "")) == "pin":
			has_pin_poi = true
	ok(camp_pois == 9 and has_pin_poi and pois_with_pin.size() >= 15,
		"KratorHostUI.build_pois populates Overview, Route, Places, all %d Beast-Rider camps, and Active Pin (%d total POIs)"
		% [camp_pois, pois_with_pin.size()])
	ok(pois_no_pin.size() == pois_with_pin.size() - 1,
		"negative: KratorHostUI.build_pois without an active pin omits the [Pin] entry (%d vs %d)" % [pois_no_pin.size(), pois_with_pin.size()])

	var host_ui := KratorHostUI.new()
	root.add_child(host_ui)
	host_ui.refresh_pois(WW.stream, pin_pt)
	WW.set_walk_mode(false)
	host_ui.sync_state(WW, "pinnacle", 6.5 * 60.0, 60.0, false, true)
	var coords_fly := KratorHostUI.format_coords(WW, false, pin_pt, 0)
	var fly_ok := coords_fly.find("FREE FLY") >= 0 and coords_fly.find("Pin:") >= 0 and not host_ui.btn_fly_pin.disabled
	WW.set_walk_mode(true, Vector2(-958.5, 155.9))
	host_ui.sync_state(WW, "pinnacle", 6.5 * 60.0, 60.0, false, false)
	var coords_walk := KratorHostUI.format_coords(WW, false, null, 0)
	ok(fly_ok,
		"KratorHostUI syncs Free-Fly mode, enables Pin actions, and formats live Cam/Look/Ground/Pin coordinates")
	ok(coords_walk.find("WALK 3rd") >= 0 and coords_walk.find("Pin:") < 0 and host_ui.btn_fly_pin.disabled,
		"negative: switching back to Walk mode without Pin disables Pin buttons and displays Walker coordinates")
	host_ui.free()

	WW.free()
	S.free()
	if idx_path != real_idx:
		OS.execute("rm", ["-rf", tmp_dir])
	print("pinnacle world stream: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(0 if fails == 0 else 1)
