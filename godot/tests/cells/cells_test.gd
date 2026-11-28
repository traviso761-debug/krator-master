# Instanced items cut into cells (krator/cells.gd; GODOT-LOOK-PLAN.md section 5, C1 and C3). Headless, on an item made here:
# 1,000 instances along two kilometres with every side table a place's item carries. Every instance survives with its
# own row of every table, every cell is small, the range a cell keeps hides no instance that is in range of the eye, a
# small item casts no shadow, the nodes that must stay whole do, a list is cut heaviest first inside a budget of nodes,
# and a cell holds no instance-uniform slots. Each check has a negative.
#   godot --headless --path godot --script res://tests/cells/cells_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


# an item of n instances, the i-th at (2 i, 0, 40 sin i): its position names it, so a table's row can be checked against it
func _item(n: int, mesh_size: float, with_tables := true) -> MultiMeshInstance3D:
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.use_custom_data = true
	var box := BoxMesh.new()
	box.size = Vector3(mesh_size, mesh_size, mesh_size)
	mm.mesh = box
	mm.instance_count = n
	var buf := PackedFloat32Array()
	buf.resize(n * 20)
	var uids := PackedStringArray()
	var index := PackedInt32Array()
	var pts := PackedVector3Array()
	var owners := []
	var lab := PackedInt32Array()
	for i in n:
		var b := i * 20
		var sx := -1.0 if i == 7 else 1.0   # one mirrored instance
		buf[b] = sx; buf[b + 5] = 1.0; buf[b + 10] = 1.0
		buf[b + 3] = 2.0 * i; buf[b + 7] = 0.0; buf[b + 11] = 40.0 * sin(float(i))
		buf[b + 12] = float(i % 7) / 7.0; buf[b + 13] = 0.5; buf[b + 14] = 0.25; buf[b + 15] = 1.0
		buf[b + 16] = float(i); buf[b + 17] = 0.0; buf[b + 18] = 0.0; buf[b + 19] = 0.0
		uids.append("u%d" % i)
		index.append(i)
		pts.append(Vector3(2.0 * i, 0.0, 40.0 * sin(float(i))))
		owners.append("o%d" % (i / 10))
		lab.append(i % 3)
	mm.buffer = buf
	var n3 := MultiMeshInstance3D.new()
	n3.name = "item_0"
	n3.multimesh = mm
	n3.set_meta("krator", {"id": "test/item", "kit": "test", "name": "item", "label": "an item", "dynamic": false, "count": n})
	n3.set_meta("krator_rows", [{"item": 0, "id": "test/item", "from": 0, "count": n, "range": -1.0}])
	if with_tables:
		n3.set_meta("krator_records", uids)
		n3.set_meta("krator_index", index)
		n3.set_meta("furn_pts", pts)
		n3.set_meta("krator_owners", owners)
		n3.set_meta("krator_labels", {"names": PackedStringArray(["a", "b", "c"]), "index": lab})
		n3.set_meta("krator_set", {"id": "set"})
	return n3


func _initialize() -> void:
	# 1. the rules: the range an item's size gives, the cell a range gives
	var r_flower := KratorCells.size_range(0.25, 4.0)
	var r_tree := KratorCells.size_range(5.0, 4.0)
	ok(absf(r_flower - 0.5 / (4.0 * KratorCells.pixel_angle())) < 1e-3 and r_flower > 120.0 and r_flower < 145.0 and r_tree > 2500.0 and r_tree < 2800.0,
		"a half-metre item is four pixels across at %.0f m, a ten-metre one at %.0f m" % [r_flower, r_tree])
	ok(KratorCells.size_range(0.001, 4.0) == KratorCells.RANGE_MIN and KratorCells.size_range(500.0, 4.0) == KratorCells.RANGE_MAX, "ranges are held to %d..%d m" % [KratorCells.RANGE_MIN, KratorCells.RANGE_MAX])
	ok(KratorCells.cell_for(133.0) == 32.0 and KratorCells.cell_for(600.0) == 144.0 and KratorCells.cell_for(5000.0) == 256.0, "cells are a quarter of the range on a 16 m lattice, 32 to 256 m")
	ok(KratorCells.size_range(0.25, 8.0) < r_flower, "negative: a larger pixel size is a shorter range")

	# 2. the cut: every instance, once, with its own row of every table
	var items := Node3D.new()
	items.name = "Items"
	root.add_child(items)
	var it := _item(1000, 0.5)
	items.add_child(it)
	var before: PackedFloat32Array = it.multimesh.buffer.duplicate()
	var rep := KratorCells.split(it, {"px": 4.0})
	var nodes: Array = rep["nodes"]
	var seen := {}
	var total := 0
	var rows_ok := true
	var bytes_ok := true
	var small := true
	var conservative := true
	var mirrored_cells := 0
	var rng := float(rep["range"])
	for nd in nodes:
		var c := nd as MultiMeshInstance3D
		var cm := c.multimesh
		var cb := cm.buffer
		var uids: PackedStringArray = c.get_meta("krator_records")
		var index: PackedInt32Array = c.get_meta("krator_index")
		var pts: PackedVector3Array = c.get_meta("furn_pts")
		var owners: Array = c.get_meta("krator_owners")
		var lab: PackedInt32Array = c.get_meta("krator_labels")["index"]
		var cell: Dictionary = c.get_meta("krator_cell")
		if bool(cell["mirrored"]):
			mirrored_cells += 1
		var lo := Vector3(INF, INF, INF)
		var hi := Vector3(-INF, -INF, -INF)
		for j in cm.instance_count:
			var b := j * 20
			var i := int(roundf(cb[b + 3] / 2.0))
			if seen.has(i):
				rows_ok = false
			seen[i] = true
			lo = lo.min(Vector3(cb[b + 3], cb[b + 7], cb[b + 11]))
			hi = hi.max(Vector3(cb[b + 3], cb[b + 7], cb[b + 11]))
			if uids[j] != "u%d" % i or index[j] != i or pts[j].distance_to(Vector3(2.0 * i, 0.0, 40.0 * sin(float(i)))) > 1e-4 or str(owners[j]) != "o%d" % (i / 10) or lab[j] != i % 3:
				rows_ok = false
			for k in 20:
				if cb[b + k] != before[i * 20 + k]:
					bytes_ok = false
		total += cm.instance_count
		if (hi - lo).x > float(rep["cell"]) + 1e-3 or (hi - lo).z > float(rep["cell"]) + 1e-3:
			small = false
		# the engine measures a range from the node's box centre: every instance within rng of an eye must still be inside it
		var centre := (lo + hi) * 0.5
		for j in cm.instance_count:
			var p := Vector3(cb[j * 20 + 3], cb[j * 20 + 7], cb[j * 20 + 11])
			if c.visibility_range_end < rng + p.distance_to(centre):
				conservative = false
		if int((c.get_meta("krator_rows") as Array)[0]["count"]) != cm.instance_count or int((c.get_meta("krator") as Dictionary)["count"]) != cm.instance_count:
			rows_ok = false
	ok(nodes.size() > 20 and total == 1000 and seen.size() == 1000, "1,000 instances over 2 km become %d cells of %.0f m, each instance in one of them" % [nodes.size(), float(rep["cell"])])
	ok(bytes_ok, "an instance's transform, colour and custom data are its own, to the bit")
	ok(rows_ok, "records, index, points, owners, labels, rows and count are sliced with the instances")
	ok(small, "no cell is wider than the cell size")
	ok(conservative, "a cell's range hides no instance that is within the item's range of the eye (range %.0f m, a cell's end from %.0f m)" % [rng, (nodes[0] as MultiMeshInstance3D).visibility_range_end])
	ok(nodes[0] == it and items.get_child_count() == nodes.size() and str((nodes[1] as Node).name) == "item_0_c1" and (nodes[1] as Node).get_parent() == items,
		"the first cell is the node itself; the rest are its siblings, in order")
	ok(mirrored_cells == 1, "the one mirrored instance marks its cell, and only its cell")
	ok((nodes[3] as Node).get_meta("krator_set") == it.get_meta("krator_set"), "a table that is not per instance is carried as it is")

	# 3. negative: the whole item, as it came, could not keep that range (its box centre is a kilometre from an end)
	var whole := _item(1000, 0.5)
	items.add_child(whole)
	var end_to_centre := 999.0
	ok(rng + 24.0 < end_to_centre, "negative: uncut, a range of %.0f m at the box centre would hide the instances at either end" % rng)

	# 4. who casts: a small item casts nothing, a large one keeps its setting
	var tiny := _item(200, 0.2, false)
	items.add_child(tiny)
	var rt := KratorCells.split(tiny, {})
	var tiny_off := true
	for nd in rt["nodes"]:
		tiny_off = tiny_off and (nd as MultiMeshInstance3D).cast_shadow == GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	ok(tiny_off and float(rt["radius"]) < 0.3 and int(rt["cells"]) > 1, "an item of radius %.2f m casts no shadow, in any of its %d cells" % [float(rt["radius"]), int(rt["cells"])])
	ok(it.cast_shadow == GeometryInstance3D.SHADOW_CASTING_SETTING_ON, "negative: one of radius %.2f m keeps its node's setting" % float(rep["radius"]))
	var big := _item(40, 6.0, false)
	items.add_child(big)
	var rb := KratorCells.split(big, {})
	ok(big.cast_shadow == GeometryInstance3D.SHADOW_CASTING_SETTING_ON and float(rb["radius"]) > 5.0 and float(rb["range"]) > 2000.0 and float(rb["cell"]) == 256.0 and int(rb["cells"]) <= 2,
		"a six-metre item keeps its shadow, takes a range of %.0f m and 256 m cells, and 80 m long stays in %d" % [float(rb["range"]), int(rb["cells"])])

	# 5. what stays whole
	var rowed := _item(100, 0.5, false)
	items.add_child(rowed)
	rowed.set_instance_shader_parameter("lod_y", Vector4(0.0, 1.0, 0.15, 1.0))
	var dyn := _item(100, 0.5, false)
	dyn.set_meta("krator", {"dynamic": true})
	items.add_child(dyn)
	var hidden := _item(100, 0.5, false)
	hidden.visible = false
	items.add_child(hidden)
	ok(str(KratorCells.split(rowed)["skipped"]) == "rows" and str(KratorCells.split(dyn)["skipped"]) == "moving" and str(KratorCells.split(hidden)["skipped"]) == "hidden"
		and str(KratorCells.split(it)["skipped"]) == "cut", "a node the shader culls by row, a moving item, a hidden one and a cell stay as they are")
	ok(rowed.multimesh.instance_count == 100 and rowed.visibility_range_end == 0.0, "negative: the row-culled node keeps its hundred instances and its own range")

	# 6. a node with a range of its own keeps it as the item's range (the monastery's furniture: 185 m)
	var furn := _item(400, 0.9, false)
	furn.visibility_range_end = 185.0
	items.add_child(furn)
	var rf := KratorCells.split(furn, {"y_cell": 12.0})
	ok(float(rf["range"]) == 185.0 and float(rf["cell"]) == 48.0 and int(rf["cells"]) > 10, "a node's own range is the item's: 185 m in 48 m cells (%d of them)" % int(rf["cells"]))

	# 7. the whole list: only the items that hold the triangles are cut
	var items2 := Node3D.new()
	root.add_child(items2)
	for k in 3:
		items2.add_child(_item(300, 0.5 + k, false))
	var d2 := _item(50, 0.5, false)
	d2.set_meta("krator", {"dynamic": true})
	items2.add_child(d2)
	var tiny2 := _item(12, 0.2, false)     # 144 triangles: under two cells' worth
	items2.add_child(tiny2)
	var all := KratorCells.split_items(items2, {"cell_tris": 100})
	ok(int(all["items"]) == 5 and int(all["split"]) == 3 and int(all["instances"]) == 900 and int(all["skipped"].get("moving", 0)) == 1 and int(all["light"]) == 1
		and int(all["cells"]) == items2.get_child_count() and (all["new_nodes"] as Array).size() == items2.get_child_count() - 5
		and int(all["tris"]) == 12 * 912 and int(all["tris_cut"]) == 12 * 900,
		"split_items cuts the three items of 3,600 triangles into %d nodes, and says what it left: one moving, one light" % items2.get_child_count())
	ok(tiny2.multimesh.instance_count == 12 and not tiny2.has_meta("krator_cell") and tiny2.cast_shadow == GeometryInstance3D.SHADOW_CASTING_SETTING_OFF and int(all["no_shadow"]) == 1,
		"the light item stays whole, and still loses the shadow its size cannot cast")
	var items3 := Node3D.new()
	root.add_child(items3)
	items3.add_child(_item(300, 0.5, false))
	var coarse := KratorCells.split_items(items3, {})
	var c3: Dictionary = (items3.get_child(0) as Node).get_meta("krator_cell")
	ok(int(coarse["split"]) == 1 and items3.get_child_count() == 4 and float(c3["cell"]) == 512.0 and KratorCells.CELL_TRIS == 800,
		"at the default (%d triangles a cell) an item of 3,600 triangles takes four cells, of 512 m, where its range alone asked for 64 m" % KratorCells.CELL_TRIS)
	var items3b := Node3D.new()
	root.add_child(items3b)
	items3b.add_child(_item(100, 0.5, false))
	var none := KratorCells.split_items(items3b, {})
	ok(int(none["split"]) == 0 and int(none["light"]) == 1 and items3b.get_child_count() == 1 and not (items3b.get_child(0) as Node).has_meta("krator_cell"),
		"negative: one of 1,200 triangles is under two cells' worth and stays whole")

	# 8. the budget of nodes: the heaviest item first, larger cells for the one that does not fit, whole when nothing fits
	var items4 := Node3D.new()
	root.add_child(items4)
	var lighter := _item(200, 0.5, false)     # first in the tree, second by weight
	items4.add_child(lighter)
	var heavy := _item(1000, 0.5, false)
	items4.add_child(heavy)
	var bud := KratorCells.split_items(items4, {"cell_tris": 1, "max_nodes": 70})
	var heavy_cell := float((heavy.get_meta("krator_cell") as Dictionary)["cell"])
	var lighter_cell := float((lighter.get_meta("krator_cell") as Dictionary)["cell"])
	ok(heavy_cell == 64.0 and lighter_cell == 128.0 and (bud["new_nodes"] as Array).size() == 63 + 7 and int(bud["over_budget"]) == 0,
		"70 new nodes: the heavy item takes 63 at its own 64 m cells, the lighter one the 7 left at 128 m")
	var conservative2 := true
	for nd in items4.get_children():
		var c4 := nd as MultiMeshInstance3D
		var kc: Dictionary = c4.get_meta("krator_cell")
		if c4.visibility_range_end < float(kc["range"]) + float(kc["half"]):
			conservative2 = false
	ok(conservative2, "a larger cell keeps a longer range: still no instance in range is hidden")
	var items5 := Node3D.new()
	root.add_child(items5)
	var lone := _item(1000, 0.5, false)
	items5.add_child(lone)
	var broke := KratorCells.split_items(items5, {"cell_tris": 1, "max_nodes": 0})
	ok(int(broke["over_budget"]) == 1 and int(broke["split"]) == 0 and items5.get_child_count() == 1 and lone.multimesh.instance_count == 1000 and not lone.has_meta("krator_cell"),
		"negative: with no budget at all the item stays whole")

	# 9. a mesh's triangles, without reading it back
	var bm := BoxMesh.new()
	var am := ArrayMesh.new()
	am.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, bm.get_mesh_arrays())
	ok(KratorCells.mesh_tris(bm) == 12 and KratorCells.mesh_tris(am) == 12 and KratorCells.mesh_tris(null) == 0, "a box is twelve triangles, as a primitive and as an ArrayMesh")

	# 10. a cell takes no instance-uniform slots: on a shader with the per-row LOD it draws on the K_LOD_OFF twin
	var sh_rows := Shader.new()
	sh_rows.code = "shader_type spatial;\n" + KratorCells.LOD_INC + "\nuniform vec3 tint_k;\nvoid fragment() { ALBEDO = tint_k; }\n"
	var sh_plain := Shader.new()
	sh_plain.code = "shader_type spatial;\nuniform vec3 tint_k;\nvoid fragment() { ALBEDO = tint_k; }\n"
	var tw := KratorCells.rowless_shader(sh_rows)
	ok(tw != sh_rows and tw.code.find("#define K_LOD_OFF") >= 0 and tw.code.find("#define K_LOD_OFF") < tw.code.find(KratorCells.LOD_INC)
		and KratorCells.rowless_shader(sh_rows) == tw and KratorCells.source_shader(tw) == sh_rows,
		"a shader that includes the per-row LOD has one twin with K_LOD_OFF defined before the include, and the twin names its source")
	ok(KratorCells.rowless_shader(sh_plain) == sh_plain and KratorCells.rowless_shader(tw) == tw and KratorCells.source_shader(sh_plain) == sh_plain and KratorCells.rowless_shader(null) == null,
		"negative: a shader without it, and the twin itself, are their own")
	var lodinc := FileAccess.get_file_as_string("res://shaders/lib/lod.gdshaderinc")
	var off0 := lodinc.find("#ifdef K_LOD_OFF")
	var off1 := lodinc.find("#else", off0)
	ok(off0 >= 0 and off1 > off0 and lodinc.substr(off0, off1 - off0).find("instance uniform") < 0 and lodinc.substr(off1).find("instance uniform") > 0
		and FileAccess.get_file_as_string("res://shaders/foliage.gdshader").contains(KratorCells.LOD_INC) and FileAccess.get_file_as_string("res://shaders/bark.gdshader").contains(KratorCells.LOD_INC),
		"the include's K_LOD_OFF branch declares no instance uniform, and the leaf and bark shaders include it by the line the twin is made from")
	var m_rows := ShaderMaterial.new()
	m_rows.shader = sh_rows
	m_rows.set_shader_parameter("tint_k", Vector3(0.2, 0.4, 0.6))
	var items6 := Node3D.new()
	root.add_child(items6)
	var rowed_item := _item(400, 0.5, false)
	rowed_item.material_override = m_rows
	items6.add_child(rowed_item)
	var plain_item := _item(400, 0.5, false)
	var m_plain := ShaderMaterial.new()
	m_plain.shader = sh_plain
	plain_item.material_override = m_plain
	items6.add_child(plain_item)
	KratorCells.split_items(items6, {"cell_tris": 1})
	var twins := {}
	var plain_kept := true
	for nd in items6.get_children():
		var c6 := nd as MultiMeshInstance3D
		if str((c6.get_meta("krator_cell") as Dictionary)["of"]) == str(rowed_item.name):
			twins[c6.material_override] = true
		elif c6.material_override != m_plain:
			plain_kept = false
	var twin_m := KratorCells.rowless(m_rows) as ShaderMaterial
	ok(twins.size() == 1 and twins.has(twin_m) and twin_m != m_rows and twin_m.shader == tw and twin_m.get_shader_parameter("tint_k") == Vector3(0.2, 0.4, 0.6) and rowed_item.material_override == twin_m,
		"every cell of an item on that shader, the node itself among them, draws on one twin material with the same parameters")
	ok(plain_kept and KratorCells.rowless(m_plain) == m_plain and KratorCells.rowless(null) == null, "negative: an item on another shader keeps its material")

	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
