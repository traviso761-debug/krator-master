# A krator-field (core/terrain/30-core-field.js, read by KField: core/terrain/kfield.gd) as a Godot terrain:
#   "Terrain"    one MeshInstance3D on the field's own grid, every grid point a vertex (each inset a finer patch, the
#                base's cells under it left out), with the page's ground look when the export carries one
#   "Collision"  a StaticBody3D with one HeightMapShape3D per grid (the base, then each inset)
# The node keeps the KField as its "field" metadata, so KData.height_at samples it as the page does.
# HeightMapShape3D puts its samples one unit apart round its own origin, so each shape is scaled by the step (uniformly:
# the heights are divided by it) and centred on its grid. The shape's cells are two triangles, the field's are bilinear:
# the two agree at the grid points and differ inside a cell by at most the cell's twist (the report gives the number).
class_name KratorField
extends RefCounted


# look: the stage's ground (KSTAGE.ground: per-sample uv and colour, and its material) on look_grid ({x0, z0, step, nx,
# nz}: BIO.export's ground grid); each field vertex takes the look's uv and colour sampled bilinearly at its position
static func build(f: KField, look = null, look_grid: Dictionary = {}) -> Node3D:
	var t0 := Time.get_ticks_msec()
	var root := Node3D.new()
	root.name = "Field"
	var lk: Dictionary = look if look is Dictionary and look_grid.has("nx") and int(look.get("nx", -1)) == int(look_grid["nx"]) \
		and int(look.get("nz", -1)) == int(look_grid["nz"]) else {}
	var mi := MeshInstance3D.new()
	mi.name = "Terrain"
	mi.mesh = mesh(f, lk, look_grid)
	root.add_child(mi)
	var body := StaticBody3D.new()
	body.name = "Collision"
	body.add_child(collision_shape(f, "Base"))
	for k in f.insets.size():
		body.add_child(collision_shape(f.insets[k], "Inset%d" % k))
	root.add_child(body)
	var verts := f.nx * f.nz
	for g in f.insets:
		verts += g.nx * g.nz
	root.set_meta("field", f)
	root.set_meta("krator", {"format": "krator-field", "name": f.name, "step": f.step, "nx": f.nx, "nz": f.nz,
		"insets": f.insets.size(), "water": f.water.keys(), "vertices": verts, "look": not lk.is_empty(),
		"build_ms": Time.get_ticks_msec() - t0})
	return root


# the look's channels on its own grid, one PackedFloat32Array each (u, v, r, g, b), for KField.bilinear
static func _channels(lk: Dictionary) -> Array:
	var out := []
	for key in ["uv", "colour"]:
		if not lk.has(key) or lk[key] == null:
			out.append([])
			continue
		var a := KData.floats(lk[key])
		var n := 2 if key == "uv" else 3
		var ch := []
		for c in n:
			var p := PackedFloat32Array()
			p.resize(a.size() / n)
			for s in p.size():
				p[s] = a[s * n + c]
			ch.append(p)
		out.append(ch)
	return out


static func mesh(f: KField, lk: Dictionary = {}, lg: Dictionary = {}) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var ch := _channels(lk) if not lk.is_empty() else [[], []]
	var grids: Array[KField] = [f]
	grids.append_array(f.insets)
	var base := 0
	for gi in grids.size():
		var g: KField = grids[gi]
		for j in g.nz:
			for i in g.nx:
				var x := g.x0 + i * g.step
				var z := g.z0 + j * g.step
				if not lk.is_empty():
					var u := (x - float(lg["x0"])) / float(lg["step"])
					var v := (z - float(lg["z0"])) / float(lg["step"])
					var w: int = int(lg["nx"])
					var d: int = int(lg["nz"])
					if ch[0].size() == 2:
						st.set_uv(Vector2(KField.bilinear(ch[0][0], w, d, u, v), KField.bilinear(ch[0][1], w, d, u, v)))
					if ch[1].size() == 3:
						st.set_color(Color(KField.bilinear(ch[1][0], w, d, u, v), KField.bilinear(ch[1][1], w, d, u, v),
							KField.bilinear(ch[1][2], w, d, u, v)))
				st.add_vertex(Vector3(x, g.heights[j * g.nx + i], z))
		for j in g.nz - 1:
			for i in g.nx - 1:
				if gi == 0 and _under_inset(f, g.x0 + (i + 0.5) * g.step, g.z0 + (j + 0.5) * g.step):
					continue
				var a := base + j * g.nx + i
				# clockwise seen from above (+Y): Godot's front face
				st.add_index(a); st.add_index(a + 1); st.add_index(a + g.nx)
				st.add_index(a + 1); st.add_index(a + g.nx + 1); st.add_index(a + g.nx)
		base += g.nx * g.nz
	st.generate_normals()
	var m := st.commit()
	m.surface_set_material(0, KData.ground_material(lk, not lk.is_empty() and ch[1].size() == 3))
	return m


static func _under_inset(f: KField, x: float, z: float) -> bool:
	for g in f.insets:
		if x > g.x0 and z > g.z0 and x < g.x1 and z < g.z1:
			return true
	return false


static func collision_shape(g: KField, label: String) -> CollisionShape3D:
	var hm := HeightMapShape3D.new()
	hm.map_width = g.nx
	hm.map_depth = g.nz
	var d := PackedFloat32Array()
	d.resize(g.nx * g.nz)
	for k in d.size():
		d[k] = g.heights[k] / g.step
	# under an inset the base's coarse cells would stand above the finer surface in places: its grid points strictly
	# inside an inset are a hole (NaN) in the base's shape, so the inset's own shape is what a ray or a body meets
	for ins in g.insets:
		for j in g.nz:
			for i in g.nx:
				var x := g.x0 + i * g.step
				var z := g.z0 + j * g.step
				if x > ins.x0 and z > ins.z0 and x < ins.x1 and z < ins.z1:
					d[j * g.nx + i] = NAN
	hm.map_data = d
	var cs := CollisionShape3D.new()
	cs.name = label
	cs.shape = hm
	cs.scale = Vector3.ONE * g.step
	cs.position = Vector3(g.x0 + (g.nx - 1) * 0.5 * g.step, 0.0, g.z0 + (g.nz - 1) * 0.5 * g.step)
	return cs


# rays straight down onto the collision at the field's grid points and at points between them, against KField.h: the
# grid points must agree (to float32 rounding); between them the shape's triangles and the field's bilinear cells
# differ by the cell's twist. Needs the node in a tree and one physics frame. Returns the numbers for the report.
static func check_collision(node: Node3D, n := 400) -> Dictionary:
	var f: KField = node.get_meta("field")
	var space := node.get_world_3d().direct_space_state
	var out := {"grid_points": 0, "grid_max": 0.0, "between_points": 0, "between_max": 0.0, "missed": 0}
	var rs := 12345
	for k in n:
		rs = (rs * 1103515245 + 12345) % 2147483648
		var i := rs % maxi(1, f.nx - 1)
		rs = (rs * 1103515245 + 12345) % 2147483648
		var j := rs % maxi(1, f.nz - 1)
		var on_grid := k % 2 == 0
		var x := f.x0 + (i + (0.0 if on_grid else 0.37)) * f.step
		var z := f.z0 + (j + (0.0 if on_grid else 0.71)) * f.step
		var q := PhysicsRayQueryParameters3D.create(Vector3(x, f.max_h + 100.0, z), Vector3(x, f.min_h - 100.0, z))
		var hit := space.intersect_ray(q)
		if hit.is_empty() and on_grid:
			# Godot 4.5's heightmap ray can slip through a vertical ray exactly on a grid vertex (found here: 10 of 200);
			# counted, and cast again a millimetre off the vertex
			out["vertex_slips"] = out.get("vertex_slips", 0) + 1
			x += 0.001
			z += 0.001
			q = PhysicsRayQueryParameters3D.create(Vector3(x, f.max_h + 100.0, z), Vector3(x, f.min_h - 100.0, z))
			hit = space.intersect_ray(q)
		if hit.is_empty():
			out["missed"] += 1
			if not out.has("first_miss"):
				out["first_miss"] = [i, j, on_grid, x, z]
			continue
		var d: float = abs((hit["position"] as Vector3).y - f.h(x, z))
		var key := "grid" if on_grid else "between"
		out[key + "_points"] += 1
		out[key + "_max"] = max(out[key + "_max"], d)
	return out
