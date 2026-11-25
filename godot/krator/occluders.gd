# OCCLUDERS THE GROUND GIVES (GODOT-LOOK-PLAN.md section 5, C6: the first half). Godot's occlusion culling hides a node
# whose box lies wholly behind an occluder, and a place cut into cells (krator/cells.gd) is nodes small enough for that
# to pay: the trees behind a hill, the halls under a terrace. `terrain` builds a ground mesh's occluder from the mesh
# itself: a coarse grid, each node at the lowest height within one coarse cell of it, lowered by `drop`. It never rises
# above the ground (a quad's corners are each no higher than every ground vertex in the quad), so it hides only what
# the ground hides; and a quad is left out wherever the ground has a hole (a place cut out of a chunk, the shaft under
# the monastery), so nothing seen through a hole is hidden.
#   KratorOccluders.terrain(ground_mesh_instance)          # adds an OccluderInstance3D named "Occluder" under it
#   get_viewport().use_occlusion_culling = true            # krator/look.gd does this by tier
# Not here yet: buildings. A wall run is an occluder only minus its doors and windows (a room's box would hide the
# furniture seen through them), which takes the interiors' walls and fixtures together; the plan's C6 says what is left.
class_name KratorOccluders
extends RefCounted

const COARSE_M := 24.0     # the coarse cell aimed at, metres
const MAX_QUADS := 4096    # the most quads one ground's occluder holds: a 16 km chunk at 64 m takes 256 m cells
const DROP_M := 0.75       # how far under the lowest height the occluder sits


# Returns {node, quads, skipped, tris, cell, why}: the occluder made for `mi` (a KData._grid mesh: nx by nz vertices in
# row order, meta "grid"), or why none was (`why`). opts: coarse (COARSE_M), drop (DROP_M), max_quads (MAX_QUADS).
static func terrain(mi: MeshInstance3D, opts := {}) -> Dictionary:
	var out := {"node": null, "quads": 0, "skipped": 0, "tris": 0, "cell": 0.0, "why": ""}
	if mi == null or mi.mesh == null or not mi.has_meta("grid"):
		out["why"] = "no grid"
		return out
	if mi.get_node_or_null("Occluder") != null:
		out["why"] = "has one"
		return out
	var g: Dictionary = mi.get_meta("grid")
	var nx := int(g.get("nx", 0))
	var nz := int(g.get("nz", 0))
	var step := float(g.get("step", 0.0))
	if nx < 3 or nz < 3 or step <= 0.0 or mi.mesh.get_surface_count() < 1:
		out["why"] = "small"
		return out
	var arr := mi.mesh.surface_get_arrays(0)
	var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	if V.size() != nx * nz or not (arr[Mesh.ARRAY_INDEX] is PackedInt32Array):
		out["why"] = "not the grid's vertices"
		return out
	var idx: PackedInt32Array = arr[Mesh.ARRAY_INDEX]
	# which fine cells still hold both their triangles (KData._grid: a, a+1, a+nx and a+1, a+nx+1, a+nx). A ground no one
	# cut holds them all, and is not walked
	var holed := idx.size() != (nx - 1) * (nz - 1) * 6
	var have := PackedByteArray()
	if holed:
		have.resize((nx - 1) * (nz - 1))
		for t in idx.size() / 3:
			var i0 := idx[t * 3]
			var i1 := idx[t * 3 + 1]
			var i2 := idx[t * 3 + 2]
			var lo := mini(i0, mini(i1, i2))
			var hi := maxi(i0, maxi(i1, i2))
			var mid := i0 + i1 + i2 - lo - hi
			var a := lo if mid - lo == 1 else lo - 1
			if hi - a != nx and hi - a != nx + 1:
				continue
			var ci := a % nx
			var cj := a / nx
			if ci >= 0 and ci < nx - 1 and cj >= 0 and cj < nz - 1:
				have[cj * (nx - 1) + ci] += 1
	# the coarse cell: the size asked for, or larger where the ground is so wide that it would be over `max_quads`
	var k := clampi(int(round(float(opts.get("coarse", COARSE_M)) / step)), 1, 64)
	var max_quads := maxi(1, int(opts.get("max_quads", MAX_QUADS)))
	while ((nx - 1) / k) * ((nz - 1) / k) > max_quads and k < maxi(nx, nz):
		k += 1
	var drop := float(opts.get("drop", DROP_M))
	var cnx := (nx - 1) / k + 1
	var cnz := (nz - 1) / k + 1
	if cnx < 2 or cnz < 2:
		out["why"] = "small"
		return out
	# block minima: bm[J * cnx + I] is the lowest ground vertex with i in [I k, I k + k] and j in [J k, J k + k]. A coarse
	# node's height is the lowest of the four blocks that meet at it: every vertex within one coarse cell of it, each way
	var rowmin := PackedFloat32Array()
	rowmin.resize(nz * cnx)
	for j in nz:
		var row := j * nx
		for I in cnx:
			var m := INF
			for i in range(I * k, mini(nx - 1, I * k + k) + 1):
				m = minf(m, V[row + i].y)
			rowmin[j * cnx + I] = m
	var bm := PackedFloat32Array()
	bm.resize(cnz * cnx)
	for J in cnz:
		for I in cnx:
			var m := INF
			for j in range(J * k, mini(nz - 1, J * k + k) + 1):
				m = minf(m, rowmin[j * cnx + I])
			bm[J * cnx + I] = m
	var ch := PackedFloat32Array()
	ch.resize(cnx * cnz)
	var finite := true
	for J in cnz:
		for I in cnx:
			var m := bm[J * cnx + I]
			if I > 0:
				m = minf(m, bm[J * cnx + I - 1])
			if J > 0:
				m = minf(m, bm[(J - 1) * cnx + I])
				if I > 0:
					m = minf(m, bm[(J - 1) * cnx + I - 1])
			ch[J * cnx + I] = m - drop
			if not is_finite(m):
				finite = false
	var verts := PackedVector3Array()
	verts.resize(cnx * cnz)
	for J in cnz:
		for I in cnx:
			var p := V[J * k * nx + I * k]
			verts[J * cnx + I] = Vector3(p.x, ch[J * cnx + I], p.z)
	var oi := PackedInt32Array()
	for J in cnz - 1:
		for I in cnx - 1:
			var whole := finite or (is_finite(ch[J * cnx + I]) and is_finite(ch[J * cnx + I + 1]) and is_finite(ch[(J + 1) * cnx + I]) and is_finite(ch[(J + 1) * cnx + I + 1]))
			if whole and holed:
				for j in range(J * k, J * k + k):
					for i in range(I * k, I * k + k):
						if have[j * (nx - 1) + i] != 2:
							whole = false
							break
					if not whole:
						break
			if not whole:
				out["skipped"] += 1
				continue
			var a := J * cnx + I
			oi.append_array([a, a + 1, a + cnx, a + 1, a + cnx + 1, a + cnx])
			out["quads"] += 1
	out["cell"] = k * step
	if oi.is_empty():
		out["why"] = "all holes"
		return out
	var occ := ArrayOccluder3D.new()
	occ.set_arrays(verts, oi)
	var node := OccluderInstance3D.new()
	node.name = "Occluder"
	node.occluder = occ
	node.set_meta("krator_occluder", {"of": str(mi.name), "cell": k * step, "drop": drop, "quads": out["quads"], "skipped": out["skipped"]})
	mi.add_child(node)
	out["node"] = node
	out["tris"] = oi.size() / 3
	return out


# the ground of a world (its meta "ground": the mesh itself, or a node holding "Terrain")
static func ground_of(w: Node) -> MeshInstance3D:
	if w == null or not w.has_meta("ground"):
		return null
	var g = w.get_meta("ground")
	if g is MeshInstance3D:
		return g
	return (g as Node).get_node_or_null("Terrain") as MeshInstance3D if g is Node else null
