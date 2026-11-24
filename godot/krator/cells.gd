# INSTANCED ITEMS, CUT INTO CELLS (GODOT-LOOK-PLAN.md section 5: C1, C3). A MultiMesh is culled as one box, and a
# visibility range on it is measured from that box's centre (checked on 4.7.2: two instances a kilometre apart with a
# range of 100 m and the eye beside one of them draw nothing). A place's items come in as one MultiMesh an item over the
# whole place, with no range at all (their records carry lod: null), so the view and each of the sun's shadow splits drew
# every one of them (the plan's 3.2 has the counts before and after).
# `split` cuts one MultiMeshInstance3D into cells by its instances' positions: each cell is its own node with the same
# mesh, layers and side tables (sliced, in instance order), and a visibility range it can keep, because its box is
# small. An item with no range gets one from its size: the distance at which it is `px` pixels across.
# `split_items` cuts a place's list, heaviest item first (instances times triangles), inside a budget of nodes. A
# town's trees are a few hundred instances a species over two kilometres, three or four to a cell, so the cut is paid
# for in nodes: an item takes cells only as fine as leaves each `cell_tris` triangles on average (a node that culls
# fewer than a draw call is worth has cost more than it saved), and an item too light for two such cells stays whole.
#   var rep := KratorCells.split_items(world.get_node("Items"), {"px": 4.0})
# Left alone: a node the leaf and bark shaders already cull by row (its lod_* instance uniforms, KratorWorld._lod_uniforms),
# a moving item (KMotion, a dynamic record), a hidden one, a light one (under two cells' worth of triangles). The first cell
# is the node itself, so whoever holds it still holds an item's node; the rest are its siblings, named <node>_c<n>.
# A cell draws on its node's material, or on that material's rowless twin where the shader takes the per-row LOD
# (shaders/lib/lod.gdshaderinc): every node on a shader with instance uniforms takes 16 slots of the buffer for them,
# 4,096 nodes in all, and a cell has no rows to cull (`rowless`).
# Who casts (C3): an item smaller than `shadow_min_radius` casts no shadow; the rest keep their node's setting.
class_name KratorCells
extends RefCounted

const FOV_DEG := 58.0                 # the walk camera's vertical field (krator/world_walk.gd, the route harness)
const FRAME_LINES := 1080.0           # the frame the pixel rule is stated for
const RANGE_MIN := 40.0
const RANGE_MAX := 6000.0
const CELL_MIN := 32.0
const CELL_MAX := 256.0
const CELL_TRIS := 800                # the triangles a cell should hold on average: what a node and its draw are worth
const MAX_NODES := 12000              # new nodes one call of split_items may make
# per-instance side tables a node may carry: sliced with the instances (krator/world_import.gd, kinteriors_light.gd)
const TABLES := ["krator_records", "krator_index", "krator_owners", "furn_pts"]
const LOD_INC := '#include "res://shaders/lib/lod.gdshaderinc"'

static var _rowless := {}      # a shader -> the shader a cell draws on (its K_LOD_OFF twin, or itself)
static var _rowless_of := {}   # a twin -> the shader it was made from


# the angle one pixel spans
static func pixel_angle() -> float:
	return deg_to_rad(FOV_DEG) / FRAME_LINES


# the distance at which a sphere of `radius` metres is `px` pixels across
static func size_range(radius: float, px: float) -> float:
	return clampf(2.0 * radius / (maxf(px, 0.25) * pixel_angle()), RANGE_MIN, RANGE_MAX)


# the cell a range asks for: a quarter of it, on a 16 m lattice, 32 to 256 m
static func cell_for(rng: float) -> float:
	return clampf(snappedf(rng * 0.25, 16.0), CELL_MIN, CELL_MAX)


static func _stride(mm: MultiMesh) -> int:
	return 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)


# a mesh's triangles, from its surfaces' lengths (no array is read back)
static func mesh_tris(mesh: Mesh) -> int:
	if mesh == null:
		return 0
	var t := 0
	if mesh is ArrayMesh:
		var am := mesh as ArrayMesh
		for s in am.get_surface_count():
			var il := am.surface_get_array_index_len(s)
			t += (il if il > 0 else am.surface_get_array_len(s)) / 3
	else:
		t = mesh.get_faces().size() / 3
	return t


# an item's radius: its mesh's bounding sphere about the instance's origin, times the largest scale among its instances
# (64 of them, evenly spaced). buf: the MultiMesh's buffer when the caller already holds it (reading it back is a stall
# on a GPU)
static func item_radius(mm: MultiMesh, buf := PackedFloat32Array()) -> float:
	if mm == null or mm.mesh == null:
		return 0.0
	var bb := mm.mesh.get_aabb()
	var r := 0.0
	for k in 8:
		r = maxf(r, bb.get_endpoint(k).length())
	if buf.is_empty():
		buf = mm.buffer
	var st := _stride(mm)
	var n := mm.instance_count
	if n <= 0 or buf.size() < n * st:
		return r
	var smax := 0.0
	var step := maxi(1, n / 64)
	for i in range(0, n, step):
		var b := i * st
		smax = maxf(smax, maxf(Vector3(buf[b], buf[b + 4], buf[b + 8]).length(), maxf(Vector3(buf[b + 1], buf[b + 5], buf[b + 9]).length(), Vector3(buf[b + 2], buf[b + 6], buf[b + 10]).length())))
	return r * (smax if smax > 0.0 else 1.0)


# why a node is left whole, or "" when it can be cut
static func skip_reason(mmi: MultiMeshInstance3D) -> String:
	if mmi == null or mmi.multimesh == null:
		return "no multimesh"
	var mm := mmi.multimesh
	if mm.transform_format != MultiMesh.TRANSFORM_3D:
		return "2d"
	if mm.instance_count < 1:
		return "empty"
	if not mmi.visible:
		return "hidden"
	if mmi.get_script() != null or mmi.has_meta("krator_motion") or mmi.has_meta("krator_ap0"):
		return "moving"
	if mmi.has_meta("krator") and mmi.get_meta("krator") is Dictionary and bool((mmi.get_meta("krator") as Dictionary).get("dynamic", false)):
		return "moving"
	var y = mmi.get_instance_shader_parameter("lod_y")
	if y is Vector4 and (y as Vector4).w > 0.5:
		return "rows"
	if mmi.has_meta("krator_cell"):
		return "cut"
	if mmi.get_parent() == null:
		return "orphan"
	return ""


# The shader a cell draws on: the node's own, or, where that takes the per-row LOD, a twin compiled with K_LOD_OFF (the
# same text with one define before the include: no instance uniforms, nothing culled by row). Made once a shader.
static func rowless_shader(sh: Shader) -> Shader:
	if sh == null:
		return null
	if _rowless.has(sh):
		return _rowless[sh]
	var out := sh
	var code := sh.code
	if code.contains(LOD_INC) and not code.contains("K_LOD_OFF"):
		out = Shader.new()
		out.code = code.replace(LOD_INC, "#define K_LOD_OFF\n" + LOD_INC)
		_rowless_of[out] = sh
	_rowless[sh] = out
	return out


# the shader a cell's twin was made from; any other shader is its own source. A check that names a shader asks for
# this: KratorCells.source_shader(sm.shader) == KratorBiome.FOLIAGE
static func source_shader(sh: Shader) -> Shader:
	return _rowless_of.get(sh, sh)


# a material's rowless twin: the same parameters on `rowless_shader`. Made once and kept on the material (meta
# krator_rowless); a material whose shader has no per-row LOD comes back as it is
static func rowless(m: Material) -> Material:
	var sm := m as ShaderMaterial
	if sm == null or sm.shader == null:
		return m
	var sh := rowless_shader(sm.shader)
	if sh == sm.shader:
		return m
	if sm.has_meta("krator_rowless"):
		return sm.get_meta("krator_rowless")
	var t := sm.duplicate() as ShaderMaterial
	t.shader = sh
	sm.set_meta("krator_rowless", t)
	return t


# the cells of n instances: [order (the keys, in the order their first instance comes: the same on every machine),
# counts, of (the cell of each instance)]. Plain packed arrays: a packed array held in a Dictionary is a copy when it is
# read back, and appending to it there changes nothing
static func _group(buf: PackedFloat32Array, n: int, st: int, cell: float, y_cell: float) -> Array:
	var cell_of := {}
	var order := []
	var counts := PackedInt32Array()
	var of := PackedInt32Array()
	of.resize(n)
	for i in n:
		var b := i * st
		var key := Vector3i(int(floor(buf[b + 3] / cell)), int(floor(buf[b + 7] / y_cell)) if y_cell > 0.0 else 0, int(floor(buf[b + 11] / cell)))
		var c: int
		if cell_of.has(key):
			c = cell_of[key]
		else:
			c = order.size()
			cell_of[key] = c
			order.append(key)
			counts.append(0)
		of[i] = c
		counts[c] += 1
	return [order, counts, of]


# Cut one node. opts: px (4: the size in pixels an item is culled at, when it has no range of its own), range (0: a
# range to use instead), cell (0: by the range), y_cell (0: no storeys; else the height of a slab, for interiors),
# shadow_min_radius (0.3 m), max_cells (0: any number; else the cell doubles, up to 2 km, until the item fits, and an
# item that never fits is left whole: skipped "budget"). Returns {nodes (the cells, the node itself first), cells,
# instances, range, radius, cell, skipped (why nothing was cut, when nothing was)}. A node that is cut, or that is one
# cell, ends with a range, a margin and its shadow rule.
static func split(mmi: MultiMeshInstance3D, opts := {}) -> Dictionary:
	var out := {"nodes": [mmi] if mmi != null else [], "cells": 1, "instances": 0, "range": 0.0, "radius": 0.0, "cell": 0.0, "skipped": ""}
	var why := skip_reason(mmi)
	if why != "":
		out["skipped"] = why
		return out
	var mm := mmi.multimesh
	var n := mm.instance_count
	var st := _stride(mm)
	var buf := mm.buffer
	if buf.size() < n * st:
		out["skipped"] = "buffer"
		return out
	var radius := item_radius(mm, buf)
	var rng := float(opts.get("range", 0.0))
	if rng <= 0.0:
		rng = mmi.visibility_range_end if mmi.visibility_range_end > 0.0 else size_range(radius, float(opts.get("px", 4.0)))
	var cell := float(opts.get("cell", 0.0))
	if cell <= 0.0:
		cell = cell_for(rng)
	var y_cell := float(opts.get("y_cell", 0.0))
	out["instances"] = n
	out["range"] = rng
	out["radius"] = radius
	if radius < float(opts.get("shadow_min_radius", 0.3)):
		mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF

	var max_cells := int(opts.get("max_cells", 0))
	var g := _group(buf, n, st, cell, y_cell)
	while max_cells > 0 and (g[0] as Array).size() > max_cells and cell < 2048.0:
		cell *= 2.0
		g = _group(buf, n, st, cell, y_cell)
	if max_cells > 0 and (g[0] as Array).size() > max_cells:
		out["skipped"] = "budget"
		return out
	out["cell"] = cell
	var order: Array = g[0]
	var counts: PackedInt32Array = g[1]
	var of: PackedInt32Array = g[2]
	var starts := PackedInt32Array()
	starts.resize(order.size())
	var acc := 0
	for c in order.size():
		starts[c] = acc
		acc += counts[c]
	var by_cell := PackedInt32Array()
	by_cell.resize(n)
	var fill := starts.duplicate()
	for i in n:
		by_cell[fill[of[i]]] = i
		fill[of[i]] += 1

	var tables := {}
	for t in TABLES:
		if mmi.has_meta(t):
			var v = mmi.get_meta(t)
			if (v is Array or v is PackedStringArray or v is PackedInt32Array or v is PackedVector3Array or v is PackedFloat32Array) and v.size() == n:
				tables[t] = v
	var labels = mmi.get_meta("krator_labels") if mmi.has_meta("krator_labels") else null
	var has_labels: bool = labels is Dictionary and (labels as Dictionary).get("index") is PackedInt32Array and ((labels as Dictionary)["index"] as PackedInt32Array).size() == n
	var rows0 = mmi.get_meta("krator_rows") if mmi.has_meta("krator_rows") else null
	var one_row: bool = rows0 is Array and (rows0 as Array).size() == 1 and (rows0 as Array)[0] is Dictionary
	var kmeta = mmi.get_meta("krator") if mmi.has_meta("krator") else null
	var parent := mmi.get_parent()
	var base_name := str(mmi.name)
	var margin := clampf(rng * 0.04, 2.0, 24.0)
	var mat := rowless(mmi.material_override)   # no rows to cull: no instance uniforms to hold a slot for
	mmi.material_override = mat
	var nodes := []
	var ci := 0
	for key in order:
		var ids := by_cell.slice(starts[ci], starts[ci] + counts[ci])
		var m := ids.size()
		var cut := order.size() > 1
		var nb := PackedFloat32Array()
		if cut:
			nb.resize(m * st)
		var lo := Vector3(INF, INF, INF)
		var hi := Vector3(-INF, -INF, -INF)
		var mirrored := false
		for j in m:
			var s0 := ids[j] * st
			if cut:
				var d0 := j * st
				for k in st:
					nb[d0 + k] = buf[s0 + k]
			var p := Vector3(buf[s0 + 3], buf[s0 + 7], buf[s0 + 11])
			lo = lo.min(p)
			hi = hi.max(p)
			if not mirrored:
				var bx := Vector3(buf[s0], buf[s0 + 4], buf[s0 + 8])
				var by := Vector3(buf[s0 + 1], buf[s0 + 5], buf[s0 + 9])
				var bz := Vector3(buf[s0 + 2], buf[s0 + 6], buf[s0 + 10])
				mirrored = bx.cross(by).dot(bz) < 0.0
		var node: MultiMeshInstance3D = mmi
		var cmm: MultiMesh = mm
		if cut:
			if ci > 0:
				cmm = MultiMesh.new()
				cmm.transform_format = MultiMesh.TRANSFORM_3D
				cmm.use_colors = mm.use_colors
				cmm.use_custom_data = mm.use_custom_data
				cmm.mesh = mm.mesh
				node = MultiMeshInstance3D.new()
				node.name = "%s_c%d" % [base_name, ci]
				node.multimesh = cmm
				node.transform = mmi.transform
				node.material_override = mat
				node.material_overlay = mmi.material_overlay
				node.layers = mmi.layers
				node.cast_shadow = mmi.cast_shadow
				node.gi_mode = mmi.gi_mode
				node.extra_cull_margin = mmi.extra_cull_margin
				node.visible = mmi.visible
				for mk in mmi.get_meta_list():
					if not (str(mk) in TABLES) and str(mk) != "krator_labels" and str(mk) != "krator_rows" and str(mk) != "krator":
						node.set_meta(mk, mmi.get_meta(mk))
			cmm.instance_count = 0
			cmm.instance_count = m
			cmm.buffer = nb
			for t in tables:
				node.set_meta(t, _slice(tables[t], ids))
			if has_labels:
				node.set_meta("krator_labels", {"names": (labels as Dictionary)["names"], "index": _slice((labels as Dictionary)["index"], ids)})
			if one_row:
				var r: Dictionary = ((rows0 as Array)[0] as Dictionary).duplicate()
				r["from"] = 0
				r["count"] = m
				node.set_meta("krator_rows", [r])
			if kmeta is Dictionary:
				var km: Dictionary = (kmeta as Dictionary).duplicate()
				km["count"] = m
				node.set_meta("krator", km)
		# the range the cell can keep: no instance within `rng` of the eye is past it, wherever in the cell the eye is nearest
		var half := (hi - lo).length() * 0.5
		node.visibility_range_end = rng + half + 2.0 * radius + margin
		node.visibility_range_end_margin = margin
		node.visibility_range_fade_mode = GeometryInstance3D.VISIBILITY_RANGE_FADE_DISABLED
		node.set_meta("krator_cell", {"of": base_name, "key": [key.x, key.y, key.z], "cell": cell, "range": rng, "radius": radius, "half": half, "mirrored": mirrored})
		nodes.append(node)
		ci += 1
	# the siblings go in after the node, in order
	if parent != null and nodes.size() > 1:
		var at := mmi.get_index() + 1
		for k in range(1, nodes.size()):
			parent.add_child(nodes[k])
			parent.move_child(nodes[k], at + k - 1)
	out["nodes"] = nodes
	out["cells"] = nodes.size()
	return out


static func _slice(v, ids: PackedInt32Array):
	if v is PackedStringArray:
		var o := PackedStringArray()
		o.resize(ids.size())
		for j in ids.size():
			o[j] = v[ids[j]]
		return o
	if v is PackedInt32Array:
		var o2 := PackedInt32Array()
		o2.resize(ids.size())
		for j in ids.size():
			o2[j] = v[ids[j]]
		return o2
	if v is PackedVector3Array:
		var o3 := PackedVector3Array()
		o3.resize(ids.size())
		for j in ids.size():
			o3[j] = v[ids[j]]
		return o3
	if v is PackedFloat32Array:
		var o4 := PackedFloat32Array()
		o4.resize(ids.size())
		for j in ids.size():
			o4[j] = v[ids[j]]
		return o4
	var o5 := []
	o5.resize(ids.size())
	for j in ids.size():
		o5[j] = v[ids[j]]
	return o5


# Every MultiMeshInstance3D directly under `items` (a world's "Items"), heaviest first. opts as `split`, and cell_tris
# (CELL_TRIS: an item is cut into at most its triangles over this many cells, so a light item takes large cells and one
# under two cells' worth is left whole) and max_nodes (MAX_NODES: the new nodes this call may make; an item that does
# not fit takes larger cells, and is left whole when it still does not). Returns {items, split
# (cut into more than one cell), cells (nodes afterwards), instances (in cut items), tris (instanced, in all), tris_cut
# (in items that were cut or are one cell), light, over_budget, skipped: {reason: count}, no_shadow (items too small to
# cast), ms, new_nodes}
static func split_items(items: Node, opts := {}) -> Dictionary:
	var rep := {"items": 0, "split": 0, "cells": 0, "instances": 0, "tris": 0, "tris_cut": 0, "light": 0, "over_budget": 0, "skipped": {}, "no_shadow": 0, "ms": 0.0, "new_nodes": []}
	if items == null:
		return rep
	var t0 := Time.get_ticks_usec()
	var cell_tris := maxi(1, int(opts.get("cell_tris", CELL_TRIS)))
	var left := int(opts.get("max_nodes", MAX_NODES))
	var smin := float(opts.get("shadow_min_radius", 0.3))
	var todo := []
	var k := 0
	for ch in items.get_children():
		var mmi := ch as MultiMeshInstance3D
		if mmi == null:
			continue
		rep["items"] += 1
		rep["cells"] += 1
		var why := skip_reason(mmi)
		if why != "":
			rep["skipped"][why] = int(rep["skipped"].get(why, 0)) + 1
			continue
		var tris := mesh_tris(mmi.multimesh.mesh) * mmi.multimesh.instance_count
		rep["tris"] += tris
		if tris < 2 * cell_tris:
			rep["light"] += 1
			if item_radius(mmi.multimesh) < smin:   # the shadow rule holds for an item left whole too
				mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
				rep["no_shadow"] += 1
			continue
		todo.append([tris, k, mmi])
		k += 1
	todo.sort_custom(func(a, b): return a[0] > b[0] or (a[0] == b[0] and a[1] < b[1]))
	for e in todo:
		var mmi: MultiMeshInstance3D = e[2]
		var o: Dictionary = opts.duplicate()
		o["max_cells"] = mini(left + 1, maxi(1, int(e[0]) / cell_tris))
		var r := split(mmi, o)
		if float(r["radius"]) < smin:
			rep["no_shadow"] += 1
		if str(r["skipped"]) != "":
			rep["over_budget"] += 1
			continue
		var made := int(r["cells"]) - 1
		left -= made
		rep["cells"] += made
		rep["instances"] += int(r["instances"])
		rep["tris_cut"] += int(e[0])
		if made > 0:
			rep["split"] += 1
		for j in range(1, (r["nodes"] as Array).size()):
			(rep["new_nodes"] as Array).append(r["nodes"][j])
	rep["ms"] = (Time.get_ticks_usec() - t0) / 1000.0
	return rep
