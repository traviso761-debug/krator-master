# The per-row LOD, the labels and the hazards through core/export and krator/world_import.gd (GRAPHIC-LOAD.md,
# recommendations 3 and 4). The case is a merged LOD page built in node (BIO.LOD.merge, fade and cull; leaves a tree owns in
# two ranges, one labelled Blossom per instance; a bark bucket; loose floor tufts; two hazards), written by
#   node godot/tools/lod_fixture.js        (godot/data/world-lod: world.json, world.glb, expect.json)
# expect.json holds what the page's rule shows from five cameras (three's chunk box, or the instance's own origin for a loose
# item) and each leaf row's label. Each check has a negative.
#   godot --headless --path godot --script res://tests/export/lod_test.gd     exits 0 when every check passes
extends SceneTree

const CASE := "res://data/world-lod/"

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	if not FileAccess.file_exists(CASE + "world.json"):
		print("FAIL no case: run node godot/tools/lod_fixture.js")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "world.json")
	var X: Dictionary = KData.read_json(CASE + "expect.json")
	var w := KratorWorld.build(CASE + "world.json")
	root.add_child(w)
	var rep: Dictionary = w.get_meta("report")
	ok(not rep["gaps"].has("load") and (d["errors"] as Array).is_empty(), "the fixture loads (%d ms)" % rep["counts"]["load_ms"])

	# 1. the split: the export wrote one record per range, none with lod.ranges; the loose tufts say so
	var split := 0
	var ranged := 0
	for it in d["items"]:
		if it["lod"].has("ranges"):
			ranged += 1
		if str(it["id"]).contains(":"):
			split += 1
	ok(d["items"].size() == 4 and split == 4 and ranged == 0, "the export split each merged chunk mesh by range: %d records, %d with lod.ranges" % [d["items"].size(), ranged])

	# 2. the importer merges a chunk's ranges back into one node, rows longest range first
	var items := w.get_node("Items").get_children()
	var lr: Dictionary = rep["lod_rows"]
	ok(items.size() == 2 and int(lr["merged"]) == 2 and int(lr["rows"]) == 2 and int(lr["loose"]) == 1,
		"4 records in 2 nodes (one leaf, one tuft): %s" % JSON.stringify(lr))
	var leaf: MultiMeshInstance3D = null
	var tuft: MultiMeshInstance3D = null
	for n in items:
		if n.get_meta("krator")["name"] == "leaf":
			leaf = n
		elif n.get_meta("krator")["name"] == "tuft":
			tuft = n
	var rows: Array = leaf.get_meta("krator_rows")
	ok(rows.size() == 2 and float(rows[0]["range"]) == 1200.0 and float(rows[1]["range"]) == 800.0 and int(rows[1]["from"]) == int(rows[0]["count"])
		and leaf.multimesh.instance_count == int(rows[0]["count"]) + int(rows[1]["count"]),
		"the leaf node's rows: %s" % JSON.stringify(rows))
	var ly: Vector4 = leaf.get_instance_shader_parameter("lod_y")
	var le: Vector4 = leaf.get_instance_shader_parameter("lod_e")
	var lrr: Vector4 = leaf.get_instance_shader_parameter("lod_r")
	ok(ly.w == 1.0 and is_equal_approx(ly.z, 0.15) and le.x == float(rows[1]["from"]) and lrr.x == 1200.0 and lrr.y == 800.0
		and leaf.get_instance_shader_parameter("lod_box") == Vector4(0, 0, 1200, 1200),
		"the leaf node's uniforms: box %s, y %s, ranges %s, ends %s (mode 1: the chunk box)" % [leaf.get_instance_shader_parameter("lod_box"), ly, lrr, le])
	var ty: Vector4 = tuft.get_instance_shader_parameter("lod_y")
	ok(ty.w == 2.0, "the tufts no tree owns are measured per instance (mode %s)" % ty.w)
	ok(abs(leaf.visibility_range_end - (1200.0 + 1200.0 * 0.7071)) < 0.01 and leaf.visibility_range_fade_mode == GeometryInstance3D.VISIBILITY_RANGE_FADE_DISABLED,
		"the node's own range is the coarse cull at the longest range plus the half-diagonal, unfaded (%.1f m)" % leaf.visibility_range_end)

	# 3. the shader's rule (its CPU twin) shows what the page's rule shows, from every camera
	var bnodes := w.get_node("Buckets").get_children()
	var bad := []
	var seen := 0
	for c in X["cameras"]:
		var cam := Vector3(float(c["cam"][0]), float(c["cam"][1]), float(c["cam"][2]))
		var got := {}
		for n in items + bnodes:
			got.merge(KratorWorld.lod_shown(n, cam))
		for id in c["rows"]:
			seen += 1
			if int(got.get(id, -1)) != int(c["rows"][id]):
				bad.append("%s at %s: %s, the page %s" % [id, cam, got.get(id), c["rows"][id]])
	ok(seen == 30 and bad.is_empty(), "rows drawn match the page's rule at 5 cameras, 6 records each (%d checked): %s" % [seen, "; ".join(PackedStringArray(bad))])
	var all_shown := 0
	var neg := MultiMeshInstance3D.new()
	neg.multimesh = leaf.multimesh
	neg.set_meta("krator_rows", rows)
	for v in KratorWorld.lod_shown(neg, Vector3(5000, 0, 5000)).values():
		all_shown += int(v)
	neg.free()
	ok(all_shown == leaf.multimesh.instance_count, "negative: a node without the uniforms draws every row from anywhere (%d of %d)" % [all_shown, leaf.multimesh.instance_count])
	var far := KratorWorld.lod_shown(leaf, Vector3(5000, 0, 5000))
	ok(int(far[rows[0]["id"]]) == 0 and int(far[rows[1]["id"]]) == 0, "negative: 5 km out, the leaf node draws no row")
	ok(KratorWorld._lod_uniforms(MeshInstance3D.new(), {"chunk": "0,0", "range": 1e9, "minRange": 1200.0}) == false, "negative: a stand-in (minRange > 0) keeps its node range alone")
	var bb := 0
	for b in bnodes:
		var by: Vector4 = b.get_instance_shader_parameter("lod_y")
		if by.w == 1.0:
			bb += 1
	ok(bnodes.size() == 2 and bb == 2 and int(lr["buckets"]) == 2, "the bark bucket's two range records are two nodes, each culled at its own chunk box")

	# 4. the labels: one table for the merged node, each row its own label
	var L: Dictionary = leaf.get_meta("krator_labels", {})
	var want: Array = []
	for id in [rows[0]["id"], rows[1]["id"]]:
		want.append_array(X["labels"][id])
	var lab_bad := 0
	for j in want.size():
		if L.is_empty() or L["names"][L["index"][j]] != want[j]:
			lab_bad += 1
	ok(not L.is_empty() and (L["index"] as PackedInt32Array).size() == leaf.multimesh.instance_count and lab_bad == 0 and int(rep["ids"]["items_with_labels"]) == 2,
		"labels: %d rows read their own label (%s), %d wrong" % [want.size(), ", ".join(L.get("names", PackedStringArray())), lab_bad])
	ok(not tuft.has_meta("krator_labels"), "negative: the tufts carry no label table")
	var blossom := 0
	var buf := leaf.multimesh.buffer
	for j in want.size():
		if (abs(buf[j * 20 + 7] - 11.0) < 0.01) != (want[j] == "Blossom"):
			blossom += 1
	ok(blossom == 0, "labels: the Blossom rows are the middle leaf of each tree in the merged buffer (%d off)" % blossom)

	# 5. the hazards: one Area3D a record, its shape, its registry record
	ok(rep["sections"].get("hazards") == "ok" and w.has_node("Hazards"), "the hazards section arrives (%s)" % rep["sections"].get("hazards"))
	var hz := w.get_node("Hazards").get_children()
	var hbad := 0
	for k in hz.size():
		var a := hz[k] as Area3D
		var want_h: Dictionary = X["hazards"][k]
		var cs := a.get_child(0) as CollisionShape3D
		if a.position != Vector3(float(want_h["at"][0]), float(want_h["at"][1]), float(want_h["at"][2])) or not (cs and cs.shape is CylinderShape3D) \
				or not a.monitoring or a.monitorable or not a.has_meta("krator_record") or a.get_meta("krator_hazard")["id"] != want_h["id"]:
			hbad += 1
	var cy := (hz[1].get_child(0) as CollisionShape3D)
	ok(hz.size() == 2 and hbad == 0 and int(rep["hazards"]["unresolved"]) == 0 and is_equal_approx((cy.shape as CylinderShape3D).radius, 30.0)
		and is_equal_approx((cy.shape as CylinderShape3D).height, 8.0) and is_equal_approx(cy.position.y, 4.0),
		"2 Area3Ds at their records, cylinders of the record's r and h, monitoring, each resolving its registry record")
	var nh := KratorWorld.hazards({"records": [{"id": "feature_99999", "at": [0, 0, 0], "shape": {"type": "box", "w": 2, "d": 4, "h": 1}, "hazard": {}},
		{"id": "x", "at": [0, 0, 0], "shape": {"type": "blob"}, "hazard": {}}]}, {})
	var nr: Dictionary = nh.get_meta("report")
	ok(int(nr["unresolved"]) == 2 and (nr["bad"] as Array) == ["x"] and (nh.get_child(0).get_child(0) as CollisionShape3D).shape is BoxShape3D,
		"negative: records the registry lacks are counted, an unknown shape is reported, a box is a box")
	nh.free()
	var poly := KratorWorld.hazards({"records": [{"id": "p", "at": [10, 0, 0], "ry": 0.5, "shape": {"type": "poly", "pts": [[0, 0], [4, 0], [0, 3]], "h": 2}, "hazard": {}}]}, {})
	var cp := poly.get_child(0).get_child(0) as CollisionPolygon3D
	ok(cp != null and cp.polygon.size() == 3 and cp.depth == 2.0 and is_equal_approx(poly.get_child(0).rotation.y, 0.5)
		and (cp.transform * Vector3(4, 3, 0)).is_equal_approx(Vector3(4, 1, 3)),
		"a poly is a CollisionPolygon3D laid in x, z (a point (4, 3) of the outline lands at z = 3), extruded over its height")
	poly.free()

	# 6. the shaders carry the rule; VRAM compression is the default where the GPU has it
	var fs: String = KratorBiome.FOLIAGE.code
	var bs: String = KratorBiome.BARK.code
	ok(fs.contains("lib/lod.gdshaderinc") and fs.contains("klod(") and bs.contains("lib/lod.gdshaderinc") and bs.contains("klod("), "the leaf and bark shaders include the per-row LOD")
	var env := OS.get_environment("KRATOR_VRAM")
	OS.set_environment("KRATOR_VRAM", "")
	var dflt := KratorKmat.vram_mode()
	ok(dflt == ("bptc" if RenderingServer.has_os_feature("bptc") else "none"), "VRAM: the default is BC7 where the renderer has it, else none (here: %s)" % dflt)
	OS.set_environment("KRATOR_VRAM", "none")
	var off := KratorKmat.vram_mode()
	OS.set_environment("KRATOR_VRAM", "nonsense")
	var junk := KratorKmat.vram_mode()
	OS.set_environment("KRATOR_VRAM", "s3tc")
	var s3 := KratorKmat.vram_mode()
	OS.set_environment("KRATOR_VRAM", env)
	ok(off == "none" and junk == "none" and s3 == "s3tc", "VRAM: KRATOR_VRAM=none opts out, s3tc picks one, a value it does not know is none")
	var img := Image.create(64, 64, true, Image.FORMAT_RGBA8)
	OS.set_environment("KRATOR_VRAM", "s3tc")
	KratorKmat.vram(img)
	OS.set_environment("KRATOR_VRAM", env)
	ok(img.is_compressed(), "VRAM: a map compresses when asked (%s)" % img.get_format())

	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
