# The ground's occluders (krator/occluders.gd; GODOT-LOOK-PLAN.md section 5, C6). Headless, on grids made here in
# KData._grid's layout: the occluder never rises above the ground it is made from, leaves out every quad the ground has
# a hole in, and is not made for a mesh that is not the grid. Each check has a negative.
#   godot --headless --path godot --script res://tests/occluders/occluders_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


# rolling ground with a ridge and one spike
func _h(x: float, z: float) -> float:
	var y := 40.0 + 12.0 * sin(x * 0.011) * cos(z * 0.013) + 0.05 * x
	y += 30.0 * exp(-pow((x - 300.0) / 40.0, 2.0))
	if absf(x - 520.0) < 1.0 and absf(z - 200.0) < 1.0:
		y += 25.0
	return y


# a ground mesh in KData._grid's layout (nx by nz vertices in row order, a, a+1, a+nx and a+1, a+nx+1, a+nx a cell),
# without the fine cells listed in `holes` (Vector2i of cell column and row)
func _grid(nx: int, nz: int, step: float, holes := []) -> MeshInstance3D:
	var V := PackedVector3Array()
	var N := PackedVector3Array()
	var h := PackedFloat32Array()
	for j in nz:
		for i in nx:
			var y := _h(i * step, j * step)
			V.append(Vector3(i * step, y, j * step))
			N.append(Vector3.UP)
			h.append(y)
	var gone := {}
	for c in holes:
		gone[c] = true
	var idx := PackedInt32Array()
	for j in nz - 1:
		for i in nx - 1:
			if gone.has(Vector2i(i, j)):
				continue
			var a := j * nx + i
			idx.append_array([a, a + 1, a + nx, a + 1, a + nx + 1, a + nx])
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = V
	arr[Mesh.ARRAY_NORMAL] = N
	arr[Mesh.ARRAY_INDEX] = idx
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	var mi := MeshInstance3D.new()
	mi.name = "Terrain"
	mi.mesh = mesh
	mi.set_meta("grid", {"h": h, "nx": nx, "nz": nz, "x0": 0.0, "z0": 0.0, "step": step})
	return mi


# the worst an occluder rises over the ground: over its vertices and nine points inside each of its triangles
func _worst_over(mi: MeshInstance3D, occ: ArrayOccluder3D) -> float:
	var v := occ.vertices
	var ix := occ.indices
	var worst := -INF
	for t in ix.size() / 3:
		var a := v[ix[t * 3]]
		var b := v[ix[t * 3 + 1]]
		var c := v[ix[t * 3 + 2]]
		for u in [0.0, 0.25, 0.5, 0.75, 1.0]:
			for w in [0.0, 0.25, 0.5, 0.75, 1.0]:
				if u + w > 1.0:
					continue
				var p: Vector3 = a + (b - a) * float(u) + (c - a) * float(w)
				var gh := KratorWorldStream.terrain_tri_height(mi, p.x, p.z)
				if is_finite(gh):
					worst = maxf(worst, p.y - gh)
	return worst


func _initialize() -> void:
	# 1. a whole grid: 8 m ground, 24 m occluder cells
	var mi := _grid(97, 73, 8.0)
	root.add_child(mi)
	var r := KratorOccluders.terrain(mi)
	var node := r["node"] as OccluderInstance3D
	var occ := node.occluder as ArrayOccluder3D if node != null else null
	ok(node != null and occ != null and node.get_parent() == mi and str(node.name) == "Occluder" and float(r["cell"]) == 24.0 and int(r["quads"]) == 32 * 24 and int(r["skipped"]) == 0
		and int(r["tris"]) == 2 * 32 * 24 and occ.vertices.size() == 33 * 25, "a 768 by 576 m ground at 8 m gets an occluder of %d quads of 24 m, under the mesh" % int(r["quads"]))
	var over := _worst_over(mi, occ)
	ok(over <= -KratorOccluders.DROP_M + 1e-3, "it is never above the ground: at its highest it is %.2f m under it (the drop is %.2f m)" % [-over, KratorOccluders.DROP_M])
	# the spike: one vertex 25 m up does not raise the occluder under it
	var spike_occ := -INF
	for p in occ.vertices:
		if absf(p.x - 520.0) < 24.0 and absf(p.z - 200.0) < 24.0:
			spike_occ = maxf(spike_occ, p.y)
	ok(spike_occ < _h(512.0, 208.0) and _h(520.0, 200.0) - _h(512.0, 200.0) > 20.0, "a spike in the ground lifts nothing: the occluder there stays at %.1f m under a %.1f m spike" % [spike_occ, _h(520.0, 200.0)])
	# negative: the same surface raised by a metre would stand above the ground
	var up := PackedVector3Array()
	for p in occ.vertices:
		up.append(p + Vector3(0, 12.0, 0))
	var bad := ArrayOccluder3D.new()
	bad.set_arrays(up, occ.indices)
	ok(_worst_over(mi, bad) > 0.0, "negative: the check finds an occluder that does rise above the ground")
	ok(str(KratorOccluders.terrain(mi)["why"]) == "has one" and mi.get_child_count() == 1, "a second call adds nothing")

	# 2. holes: a place cut out of the ground, and one missing cell
	var holes := []
	for j in range(20, 32):
		for i in range(30, 45):
			holes.append(Vector2i(i, j))
	holes.append(Vector2i(70, 60))
	var hm := _grid(97, 73, 8.0, holes)
	root.add_child(hm)
	var rh := KratorOccluders.terrain(hm)
	var hocc := (rh["node"] as OccluderInstance3D).occluder as ArrayOccluder3D
	var covered := 0
	for t in hocc.indices.size() / 3:
		var c := (hocc.vertices[hocc.indices[t * 3]] + hocc.vertices[hocc.indices[t * 3 + 1]] + hocc.vertices[hocc.indices[t * 3 + 2]]) / 3.0
		if (c.x > 240.0 and c.x < 360.0 and c.z > 160.0 and c.z < 256.0) or (c.x > 552.0 and c.x < 576.0 and c.z > 480.0 and c.z < 504.0):
			covered += 1
	var touched := {}   # the 24 m quads a missing 8 m cell lies in
	for c in holes:
		touched[Vector2i(c.x / 3, c.y / 3)] = true
	ok(covered == 0 and int(rh["skipped"]) == touched.size() and touched.size() == 26 and int(rh["quads"]) == 32 * 24 - 26,
		"no occluder over a hole: the %d quads a 120 by 96 m cut and one missing cell touch are left out" % int(rh["skipped"]))
	ok(int(r["skipped"]) == 0, "negative: the whole ground leaves none out")

	# 3. what is not the grid gets none
	var box := MeshInstance3D.new()
	box.mesh = BoxMesh.new()
	root.add_child(box)
	var odd := _grid(97, 73, 8.0)
	odd.set_meta("grid", {"h": PackedFloat32Array(), "nx": 50, "nz": 50, "x0": 0.0, "z0": 0.0, "step": 8.0})
	root.add_child(odd)
	ok(str(KratorOccluders.terrain(box)["why"]) == "no grid" and str(KratorOccluders.terrain(odd)["why"]) == "not the grid's vertices" and str(KratorOccluders.terrain(null)["why"]) == "no grid"
		and box.get_child_count() == 0 and odd.get_child_count() == 0, "a mesh with no grid, or one whose vertices are not the grid's, gets no occluder")

	# 4. a finer ground takes more of its vertices a cell; the coarse cell can be asked for
	var fine := _grid(121, 121, 2.0)
	root.add_child(fine)
	var rf := KratorOccluders.terrain(fine, {"coarse": 16.0, "drop": 0.25})
	ok(float(rf["cell"]) == 16.0 and int(rf["quads"]) == 15 * 15 and _worst_over(fine, (rf["node"] as OccluderInstance3D).occluder as ArrayOccluder3D) <= -0.25 + 1e-3,
		"a 2 m ground asked for 16 m cells and a 0.25 m drop gets them, still under the ground")

	# 4b. a wide ground: the cells grow until the occluder is within its budget of quads, and it is still under the ground
	var wide := _grid(201, 201, 16.0)
	root.add_child(wide)
	var rw := KratorOccluders.terrain(wide, {"max_quads": 400})
	ok(int(rw["quads"]) == 400 and float(rw["cell"]) == 160.0 and _worst_over(wide, (rw["node"] as OccluderInstance3D).occluder as ArrayOccluder3D) <= -KratorOccluders.DROP_M + 1e-3,
		"a 3.2 km ground held to 400 quads takes 160 m cells, still under the ground")
	var wide2 := _grid(201, 201, 16.0)
	root.add_child(wide2)
	var rw2 := KratorOccluders.terrain(wide2)
	ok(int(rw2["quads"]) == 50 * 50 and float(rw2["cell"]) == 64.0 and KratorOccluders.MAX_QUADS == 4096,
		"negative: at the default budget (%d quads) the same ground takes 64 m cells, where 24 m was asked for" % KratorOccluders.MAX_QUADS)

	# 5. a world's ground
	var w := Node3D.new()
	root.add_child(w)
	var holder := Node3D.new()
	w.add_child(holder)
	var t2 := _grid(9, 9, 8.0)
	holder.add_child(t2)
	w.set_meta("ground", holder)
	var w2 := Node3D.new()
	root.add_child(w2)
	ok(KratorOccluders.ground_of(w) == t2 and KratorOccluders.ground_of(w2) == null and KratorOccluders.ground_of(null) == null, "ground_of finds a world's Terrain, and nothing where there is none")

	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
