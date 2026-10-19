# krator-biome JSON (BIO.export(), core/biome/42-core-export.js) to a Godot scene, per biomes/GODOT.md:
# an item becomes a MultiMeshInstance3D, a bucket a MeshInstance3D with an ArrayMesh, a material one of the
# shared shaders in res://shaders/. Everything the contract leaves open, or the importer had to guess, goes in
# the report (KratorBiome.build(...).get_meta("report")), which is the spike's gap list for this route.
class_name KratorBiome
extends RefCounted

const FOLIAGE := preload("res://shaders/foliage.gdshader")
const BARK := preload("res://shaders/bark.gdshader")
const ANIM := preload("res://shaders/anim.gdshader")
const ANIM_ADD := preload("res://shaders/anim_add.gdshader")
const ANIM_PHASE := preload("res://shaders/anim_phase.gdshader")
const CHUNK := 1200.0   # BIO.LOD.chunk (three's LOD box; only named in the report now)
const CELL := 150.0     # the default LOD cell: finer than a 300 m tile, so a tile changes detail progressively
# the cell in force: convention.lod.cell of the file being built (core/export/README.md, "LOD"), else CELL (older exports,
# and the krator-biome JSON route, whose convention has no lod entry)
static var cell := CELL


# the cell a world's convention declares; CELL when it names none (or a nonsense one)
static func policy_cell(convention) -> float:
	if convention is Dictionary and convention.get("lod") is Dictionary:
		var c = convention["lod"].get("cell")
		if (c is float or c is int) and float(c) > 0.0:
			return float(c)
	return CELL


static func build(path: String) -> Node3D:
	var t0 := Time.get_ticks_msec()
	var d = KData.read_json(path)
	var root := Node3D.new()
	root.name = "Biome"
	var report := {"route": "krator-biome JSON", "file": path, "gaps": {}, "counts": {}}
	if not (d is Dictionary) or d.get("format") != "krator-biome":
		report["gaps"]["format"] = "not a krator-biome file"
		root.set_meta("report", report)
		return root
	cell = policy_cell(d.get("convention"))
	root.set_meta("krator", {"kits": d["kits"], "box": d["box"], "core": d["core"], "convention": d["convention"]})

	# textures: PNG data URLs (sRGB images)
	var tex := {}
	var wraps := {}
	for t in d["textures"]:
		if t.has("png"):
			tex[t["id"]] = KData.texture_from_data_url(t["png"])
		wraps[str(t["wrap"])] = true
	if wraps.has("[1001, 1001]") or wraps.has("[1002, 1002]"):
		_gap(report, "texture wrap", "three's ClampToEdge/Mirrored wrap is not carried to the sampler (the shaders always repeat): %s" % [wraps.keys()])

	var mats := {}
	for m in d["materials"]:
		mats[m["id"]] = m
	var texrec := {}
	for t in d["textures"]:
		texrec[t["id"]] = t

	# the page's core/tags registry (tags.json beside the export, core/tags/README.md): each item's set record and each
	# volume a bucket merges, by id, so a node's ids resolve to records (root meta "tags")
	var by_id := {}
	var tp := path.get_base_dir() + "/tags.json"
	if FileAccess.file_exists(tp):
		var t = KData.read_json(tp)
		if t is Dictionary and t.get("format") == "krator-tags":
			for r in t["records"]:
				by_id[r["id"]] = r
			root.set_meta("tags", by_id)
	var ids := {"items": 0, "items_with_record": 0, "instances": 0, "instances_with_uid": 0, "buckets": 0, "buckets_with_records": 0, "bucket_records": 0, "sets_resolved": 0}

	var items := Node3D.new()
	items.name = "Items"
	root.add_child(items)
	var instances := 0
	var moving := 0   # instances a KMotion player moves
	for it in d["items"]:
		var m: Dictionary = mats[it["material"]]
		var mat := _material(m, tex, texrec, true, report)
		var mesh := KData.array_mesh(it["geometry"], mat, Vector3.ZERO)
		var n: int = int(it["count"])
		var groups := _item_cells(it, n)
		# a moving item's baked motion (biomes/GODOT.md, "Motion"): each cell's MultiMesh gets a KMotion player
		var track := KMotion.from_record(it.get("motion"))
		if it.get("motion") is Dictionary and (it["motion"] as Dictionary).has("error"):
			_gap(report, "motion " + str(it["name"]), "%s: the page's tick is not a function of the clock (%s), so no track was baked: it stands at its export pose" % [it["name"], it["motion"]["error"]])
		elif it["dynamic"] and track.is_empty():
			_gap(report, "motion", "moving items without a baked track (an export from before 2026-10-16, or motion:false): they stand at their export pose")
		# core/tags (biomes/GODOT.md, "Records"): the item set's id, and the side table by instance index: each instance's
		# uid (KTAGS.uid of its class, key and position) and its index in the set (its id is "<record>#<index>"). A cell
		# keeps the slice for its own instances, in its own instance order
		var recs: Array = it["records"] if it.get("records") is Array and (it["records"] as Array).size() == n else []
		var ridx := KData.ints(it["recordIndex"]) if recs.size() > 0 else PackedInt32Array()
		ids["items"] += 1
		ids["instances"] += n
		if recs.size() > 0:
			ids["items_with_record"] += 1
			if by_id.has(it["record"]):
				ids["sets_resolved"] += 1
			for u in recs:
				if str(u) != "":
					ids["instances_with_uid"] += 1
		for key in groups:
			var sel: PackedInt32Array = groups[key]
			var origin := _cell_origin(key)
			var mm := MultiMesh.new()
			mm.transform_format = MultiMesh.TRANSFORM_3D
			mm.use_colors = true
			mm.use_custom_data = true
			mm.mesh = mesh
			mm.instance_count = sel.size()
			mm.buffer = _instance_buffer(it, sel, origin, m, report)
			var mmi := MultiMeshInstance3D.new()
			mmi.name = "%s.%s" % [it["kit"], it["name"]] + ("" if key == "" else "@" + key)
			mmi.multimesh = mm
			mmi.position = origin
			_apply_lod(mmi, it, report)
			if not track.is_empty():
				KMotion.attach(mmi, track, sel, origin)
				moving += sel.size()
			mmi.set_meta("krator", {"kit": it["kit"], "name": it["name"], "label": it["label"], "material": m.get("key"),
				"kind": m["kind"], "dynamic": it["dynamic"], "count": sel.size(), "cell": key})
			if recs.size() > 0:
				var rs := PackedStringArray()
				var ri := PackedInt32Array()
				for i in sel:
					rs.append(str(recs[i]))
					ri.append(ridx[i] if i < ridx.size() else i)
				mmi.set_meta("krator_record", it["record"])
				mmi.set_meta("krator_records", rs)
				mmi.set_meta("krator_index", ri)
				if by_id.has(it["record"]):
					mmi.set_meta("krator_set", by_id[it["record"]])
			items.add_child(mmi)
		if it["dynamic"] and track.is_empty() and str((m["options"] if m["options"] != null else {}).get("mode", "orbit")) == "walk":
			_gap(report, "fauna walk", "walking fauna (anim mode 'walk') are moved by the page's own host tick (a herd's CPU path), which no export carries: they stand at their export pose, wings flapping")
		instances += n

	var buckets := Node3D.new()
	buckets.name = "Buckets"
	root.add_child(buckets)
	var tris := 0
	for b in d["buckets"]:
		var m: Dictionary = mats[b["material"]]
		var mat := _material(m, tex, texrec, false, report)
		var parts := _bucket_cells(b, mat)
		# one node per bucket holds its records (their pieces index the whole bucket's triangles), its cells as children
		var bn := Node3D.new()
		bn.name = "%s.%s" % [b["kit"], b["name"]]
		bn.set_meta("krator", {"kit": b["kit"], "name": b["name"], "label": b["label"], "material": m.get("key"), "kind": m["kind"], "cells": parts.size()})
		ids["buckets"] += 1
		if b.get("records") is Array:   # the volumes (trees, logs) whose pieces this bucket merges, by uid and by id
			bn.set_meta("krator_records", PackedStringArray(b["records"]))
			bn.set_meta("krator_record_ids", PackedStringArray(b["recordIds"]))
			bn.set_meta("krator_pieces", b.get("pieces", {}))
			ids["bucket_records"] += (b["records"] as Array).size()
			if (b["records"] as Array).size() > 0:
				ids["buckets_with_records"] += 1
		for key in parts:
			var mi := MeshInstance3D.new()
			mi.name = "cell" if key == "" else "@" + key
			mi.mesh = parts[key]
			mi.position = _cell_origin(key)
			_apply_lod(mi, b, report)
			mi.set_meta("krator", {"kit": b["kit"], "name": b["name"], "label": b["label"], "material": m.get("key"), "kind": m["kind"], "cell": key})
			bn.add_child(mi)
		buckets.add_child(bn)
		tris += int(b["triangles"])

	report["counts"] = {"items": d["items"].size(), "item_nodes": items.get_child_count(), "instances": instances, "moving": moving,
		"buckets": d["buckets"].size(), "bucket_nodes": buckets.get_child_count(), "triangles": tris,
		"materials": d["materials"].size(), "textures": d["textures"].size(), "load_ms": Time.get_ticks_msec() - t0}
	report["ids"] = ids
	if ids["items_with_record"] == 0:
		_gap(report, "tags", "no ids on items or buckets (an export from a page without BIO.init({tags}), or from before 2026-10-12): nothing to put in node metadata beyond name and label")
	elif ids["instances_with_uid"] < ids["instances"]:
		_gap(report, "tags", "%d of %d instances carry no uid" % [ids["instances"] - ids["instances_with_uid"], ids["instances"]])
	if ids["buckets"] > ids["buckets_with_records"]:
		_gap(report, "bucket records", "%d of %d buckets name no record: their pieces (boulders, ground cover, structures) lie in no registered volume" % [ids["buckets"] - ids["buckets_with_records"], ids["buckets"]])
	var look = d["stage"].get("ground") if d.get("stage") is Dictionary else null
	if d.has("ground") and (d["ground"] as Dictionary).has("field"):
		# the page's baked field (core/terrain, since 2026-10-08): the terrain mesh on its own grid and a HeightMapShape3D
		# collision body (krator/field_import.gd); the sampled ground grid only places the look and the water sheet
		var f := KField.from_export(d["ground"]["field"])
		if f == null:
			_gap(report, "field", "ground.field is not a readable krator-field")
		else:
			var g := KratorField.build(f, look, d["ground"])
			var wm := KData.water_sheet(d["ground"])
			if wm:
				g.add_child(wm)
			root.add_child(g)
			root.set_meta("ground", g)
			report["field"] = g.get_meta("krator")
	elif d.has("ground"):
		var g := KData.ground(d["ground"], look)
		root.add_child(g)
		root.set_meta("ground", g)
		_gap(report, "field", "the ground is terrainH sampled on the export's grid: the page bakes no core/terrain field (only biomes/sedesert does, since 2026-10-08)")
	else:
		_gap(report, "terrain", "no ground in the export (an export from before 2026-10-05): the spike samples terrainH into terrain.json")
	if d.get("stage") is Dictionary:
		root.set_meta("stage", d["stage"])
	root.set_meta("report", report)
	return root


static func _gap(report: Dictionary, key: String, text: String) -> void:
	report["gaps"][key] = text


# A LOD-chunked item or bucket is split into `cell`-sized cells (instances by position, buckets by connected piece),
# one node per cell at the cell's centre. Godot's visibility range is measured from the node, three's from the
# chunk's box (BIO.lodTick). Placed per chunk, a 300 m tile inside one 1.2 km chunk changed detail all at one moment
# (GODOT-PLAN.md, finding 16); per cell, detail thins progressively and the range is widened only by the cell's
# half-diagonal. A record without `lod` stays one node at the origin (cell key "").
static func _cell_key(x: float, z: float) -> String:
	return "%d,%d" % [int(floor(x / cell)), int(floor(z / cell))]


static func _cell_origin(key: String) -> Vector3:
	if key == "":
		return Vector3.ZERO
	var c: PackedStringArray = key.split(",")
	return Vector3((float(c[0]) + 0.5) * cell, 0.0, (float(c[1]) + 0.5) * cell)


# cell key -> the indices of the instances in that cell
static func _item_cells(it: Dictionary, n: int) -> Dictionary:
	var out := {}
	if it.get("lod") == null:
		var all := PackedInt32Array()
		all.resize(n)
		for i in n:
			all[i] = i
		out[""] = all
		return out
	var M := KData.floats(it["matrices"])
	for i in n:
		var key := _cell_key(M[i * 16 + 12], M[i * 16 + 14])
		if not out.has(key):
			out[key] = []
		out[key].append(i)
	for key in out:   # grouped in Arrays: a PackedInt32Array in a Dictionary is a copy, append would not stick
		out[key] = PackedInt32Array(out[key])
	return out


# cell key -> ArrayMesh (vertices relative to the cell's centre). Triangles are grouped into connected pieces
# (union-find over shared vertices), and each piece goes whole to the cell of its centroid.
static func _bucket_cells(b: Dictionary, mat: Material) -> Dictionary:
	var whole := KData.array_mesh(b["geometry"], mat, Vector3.ZERO)
	if b.get("lod") == null:
		return {"": whole}
	var arrays := whole.surface_get_arrays(0)
	var v3: PackedVector3Array = arrays[Mesh.ARRAY_VERTEX]
	var idx: PackedInt32Array = arrays[Mesh.ARRAY_INDEX]
	var nv := v3.size()
	var parent := PackedInt32Array()
	parent.resize(nv)
	for i in nv:
		parent[i] = i
	for t in range(0, idx.size() - 2, 3):
		var r0 := _find(parent, idx[t])
		var r1 := _find(parent, idx[t + 1])
		if r1 != r0:
			parent[r1] = r0
		var r2 := _find(parent, idx[t + 2])
		if r2 != r0:
			parent[r2] = r0
	var sum := {}   # root -> (sum x, sum z, vertex count)
	for i in nv:
		var r := _find(parent, i)
		sum[r] = sum.get(r, Vector3.ZERO) + Vector3(v3[i].x, v3[i].z, 1.0)
	var cell_of := {}
	for r in sum:
		var s: Vector3 = sum[r]
		cell_of[r] = _cell_key(s.x / s.z, s.y / s.z)
	var tris := {}   # cell key -> offsets of its triangles in idx
	for t in range(0, idx.size() - 2, 3):
		var key: String = cell_of[_find(parent, idx[t])]
		if not tris.has(key):
			tris[key] = []
		tris[key].append(t)
	var out := {}
	for key in tris:
		out[key] = _sub_mesh(arrays, PackedInt32Array(tris[key]), _cell_origin(key), mat)
	return out


static func _find(parent: PackedInt32Array, i: int) -> int:
	while parent[i] != i:
		parent[i] = parent[parent[i]]
		i = parent[i]
	return i


# the triangles at the offsets `tris` of a surface's arrays, their vertices renumbered and moved by -origin
static func _sub_mesh(arrays: Array, tris: PackedInt32Array, origin: Vector3, mat: Material) -> ArrayMesh:
	var idx: PackedInt32Array = arrays[Mesh.ARRAY_INDEX]
	var remap := {}
	var order := PackedInt32Array()
	var out_idx := PackedInt32Array()
	out_idx.resize(tris.size() * 3)
	var w := 0
	for t in tris:
		for k in 3:
			var v := idx[t + k]
			if not remap.has(v):
				remap[v] = order.size()
				order.append(v)
			out_idx[w] = remap[v]
			w += 1
	var sub := []
	sub.resize(Mesh.ARRAY_MAX)
	var v3: PackedVector3Array = arrays[Mesh.ARRAY_VERTEX]
	var pv := PackedVector3Array()
	pv.resize(order.size())
	for j in order.size():
		pv[j] = v3[order[j]] - origin
	sub[Mesh.ARRAY_VERTEX] = pv
	for slot in [Mesh.ARRAY_NORMAL, Mesh.ARRAY_TEX_UV, Mesh.ARRAY_COLOR]:
		var src = arrays[slot]
		if src == null:
			continue
		var dst = src.duplicate()
		dst.resize(order.size())
		for j in order.size():
			dst[j] = src[order[j]]
		sub[slot] = dst
	sub[Mesh.ARRAY_INDEX] = out_idx
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, sub)
	if mat:
		m.surface_set_material(0, mat)
	return m


# half: the half-diagonal of the box the node stands at the centre of (a cell here; world_import.gd places whole chunks)
static func _apply_lod(gi: GeometryInstance3D, rec: Dictionary, report: Dictionary, half := -1.0) -> void:
	var lod = rec.get("lod")
	if lod == null:
		return
	if half < 0.0:
		half = cell * 0.7071
	# three measures to the chunk's box, Godot to the node: widen by the half-diagonal of the box the node stands for
	gi.visibility_range_end = float(lod["range"]) + half
	gi.visibility_range_end_margin = 60.0
	if float(lod["minRange"]) > 0.0:
		gi.visibility_range_begin = max(0.0, float(lod["minRange"]) - half)
		gi.visibility_range_begin_margin = 60.0
	gi.visibility_range_fade_mode = GeometryInstance3D.VISIBILITY_RANGE_FADE_SELF
	_gap(report, "lod", "LOD is per chunk box in three (%.0f m) and per node point in Godot: LOD-chunked items and buckets are split into %.0f m cells (instances by position, buckets by connected piece), one node per cell at its centre, ranges widened by the cell half-diagonal (%.0f m), so a tile's detail thins cell by cell; stand-ins and impostors are not LOD levels of what they replace" % [CHUNK, cell, half])


# MultiMesh.buffer: per instance 12 floats (the 3x4 transform, row by row), 4 colour, 4 custom.
# COLOR = (r, g, b, c2.r), INSTANCE_CUSTOM = (oct(aN).x, oct(aN).y, c2.g, c2.b) (biomes/GODOT.md); an animated body
# (aP0, aP1: kind 'anim') packs COLOR = (r, g, b, aP0.w), INSTANCE_CUSTOM = aP1 (shaders/anim_body.gdshaderinc); an
# anim-phase body (aPh) INSTANCE_CUSTOM.x = aPh (shaders/anim_phase.gdshader)
static func _instance_buffer(it: Dictionary, sel: PackedInt32Array, origin: Vector3, m: Dictionary, report: Dictionary) -> PackedFloat32Array:
	var M := KData.floats(it["matrices"])
	var C := KData.floats(it["colours"]) if it["colours"] != null else PackedFloat32Array()
	var ex: Dictionary = it["extras"]
	var AN := KData.floats(ex["aN"]["data"]) if ex.has("aN") else PackedFloat32Array()
	var C2 := KData.floats(ex["aC2"]["data"]) if ex.has("aC2") else PackedFloat32Array()
	var P0 := KData.floats(ex["aP0"]["data"]) if ex.has("aP0") else PackedFloat32Array()
	var P1 := KData.floats(ex["aP1"]["data"]) if ex.has("aP1") else PackedFloat32Array()
	var PH := KData.floats(ex["aPh"]["data"]) if ex.has("aPh") else PackedFloat32Array()
	for k in ex:
		if not (k in ["aN", "aC2", "aP0", "aP1", "aPh"]):
			_gap(report, "extras." + k, "per-instance attribute %s has no slot in the MultiMesh packing" % k)
	var buf := PackedFloat32Array()
	buf.resize(sel.size() * 20)
	for j in sel.size():
		var i := sel[j]
		var o := i * 16
		var b := j * 20
		# row r of the 3x4 is m[r], m[4+r], m[8+r], m[12+r] in three's column-major order
		buf[b] = M[o]; buf[b + 1] = M[o + 4]; buf[b + 2] = M[o + 8]; buf[b + 3] = M[o + 12] - origin.x
		buf[b + 4] = M[o + 1]; buf[b + 5] = M[o + 5]; buf[b + 6] = M[o + 9]; buf[b + 7] = M[o + 13] - origin.y
		buf[b + 8] = M[o + 2]; buf[b + 9] = M[o + 6]; buf[b + 10] = M[o + 10]; buf[b + 11] = M[o + 14] - origin.z
		if C.size() > 0:
			buf[b + 12] = C[i * 3]; buf[b + 13] = C[i * 3 + 1]; buf[b + 14] = C[i * 3 + 2]
		else:
			buf[b + 12] = 1.0; buf[b + 13] = 1.0; buf[b + 14] = 1.0
		buf[b + 15] = C2[i * 3] if C2.size() > 0 else 1.0
		if AN.size() > 0:
			var e := KData.oct_encode(Vector3(AN[i * 3], AN[i * 3 + 1], AN[i * 3 + 2]))
			buf[b + 16] = e.x; buf[b + 17] = e.y
		buf[b + 18] = C2[i * 3 + 1] if C2.size() > 0 else 1.0
		buf[b + 19] = C2[i * 3 + 2] if C2.size() > 0 else 1.0
		if P1.size() > 0:   # an animated body: its path's radius and aP1
			buf[b + 15] = P0[i * 4 + 3] if P0.size() > 0 else 0.0
			buf[b + 16] = P1[i * 4]; buf[b + 17] = P1[i * 4 + 1]; buf[b + 18] = P1[i * 4 + 2]; buf[b + 19] = P1[i * 4 + 3]
		if PH.size() > 0:   # an anim-phase body's beat (shaders/anim_phase.gdshader): INSTANCE_CUSTOM.x
			buf[b + 16] = PH[i]
	return buf


# o.swayW is a GLSL expression in the export. The three the kits use map to c + dot(w, position); anything else is a gap.
static func _sway(expr: String) -> Array:
	var e := expr.replace(" ", "")
	match e:
		"", "1.0", "1":
			return [1.0, Vector3.ZERO, true]
		"0.0", "0":
			return [0.0, Vector3.ZERO, true]
		"(-position.y)", "-position.y":
			return [0.0, Vector3(0, -1, 0), true]
		"(position.y)", "position.y":
			return [0.0, Vector3(0, 1, 0), true]
		"(position.x)", "position.x":
			return [0.0, Vector3(1, 0, 0), true]
		"(-position.x)", "-position.x":
			return [0.0, Vector3(-1, 0, 0), true]
	return [1.0, Vector3.ZERO, false]


static func _material(m: Dictionary, tex: Dictionary, texrec: Dictionary, instanced: bool, report: Dictionary) -> ShaderMaterial:
	var sm := ShaderMaterial.new()
	var o: Dictionary = m["options"] if m["options"] != null else {}
	var map_id = m["map"]
	var kind: String = m["kind"]
	if kind == "leaf":
		sm.shader = FOLIAGE
		sm.set_shader_parameter("alpha_test", float(m["alphaTest"]) if float(m["alphaTest"]) > 0.0 else 0.42)
		sm.set_shader_parameter("sway_a", float(o.get("swayA", 0.06)) if o.get("swayA") != null else 0.06)
		sm.set_shader_parameter("sway_axis", int(o.get("axis", 0)) if o.get("axis") != null else 0)
		sm.set_shader_parameter("use_an", bool(o.get("aN", false)))
		sm.set_shader_parameter("irid", bool(o.get("irid", false)))
		var sd = m.get("sway")   # the export's sway as data (since 2026-10-05): weight = c + dot(w, position)
		if sd is Dictionary and sd.has("c"):
			var w: Array = sd["w"]
			sm.set_shader_parameter("sway_c", float(sd["c"]))
			sm.set_shader_parameter("sway_w", Vector3(float(w[0]), float(w[1]), float(w[2])))
		else:
			var sw := _sway(str(o.get("swayW", "1.0")) if o.get("swayW") != null else "1.0")
			sm.set_shader_parameter("sway_c", sw[0])
			sm.set_shader_parameter("sway_w", sw[1])
			if not sw[2]:
				_gap(report, "swayW:" + str(o.get("swayW")), "foliage sway weight '%s' is GLSL text the export could not turn into data" % o.get("swayW"))
			elif sd == null:
				_gap(report, "sway data", "an export from before 2026-10-05: sway read from the GLSL text")
		if o.get("dist"):
			_gap(report, "leaf.dist", "foliage option dist=true (%s) is not ported" % m.get("key"))
	elif kind == "anim":   # BIO.animMat: the path, wings and legs in the vertex stage (shaders/lib/anim.gdshaderinc)
		anim_material(sm, o)
	else:
		sm.shader = BARK
		match kind:
			"anim-phase":   # swbay's and nwbay's animMat: the beat on the instance's phase (aPh); the path is the baked motion
				sm.shader = ANIM_PHASE
				sm.set_shader_parameter("mode", {"bird": 0, "swim": 1}.get(str(o.get("mode", "bird")), 2))
			"irid":   # BIO.iridBarkMat: the bark's colour swings between two tints with the view angle
				var a: Array = o.get("a", [0.78, 1.18, 0.92])
				var b: Array = o.get("b", [1.45, 0.82, 0.74])
				sm.set_shader_parameter("mode", 1)
				sm.set_shader_parameter("irid_a", Vector3(float(a[0]), float(a[1]), float(a[2])))
				sm.set_shader_parameter("irid_b", Vector3(float(b[0]), float(b[1]), float(b[2])))
			"gloss":  # barkMat2: the map's red is brightness, green a mask toward a second colour; a sun highlight
				var alt: Array = o.get("alt", [0.22, 0.22, 0.22])
				sm.set_shader_parameter("mode", 2)
				sm.set_shader_parameter("gloss_alt", Vector3(float(alt[0]), float(alt[1]), float(alt[2])))
				sm.set_shader_parameter("gloss_mean", float(o.get("mean", 0.55)))
				sm.set_shader_parameter("gloss_gain", float(o.get("gain", 0.52)))
				sm.set_shader_parameter("gloss_k", float(o.get("gloss", 0.0)))
			"far":   # the far impostors: what the uvs pack says which
				var pk := str(o.get("pack", ""))
				if pk == "c2-rule":
					sm.set_shader_parameter("mode", 3)
				elif pk == "gloss":
					sm.set_shader_parameter("mode", 4)
				else:
					_gap(report, "far", "a far impostor material without `pack` (an export from before 2026-10-05): drawn plain")
			"hang":  # nhighlands' bulbs and pods: the sway and the night glow
				sm.set_shader_parameter("mode", 5)
				sm.set_shader_parameter("hang_a", float(o.get("swayA", 0.05)))
				var nk: Array = o.get("night", [0.0, 1.0])
				sm.set_shader_parameter("night_k", Vector2(float(nk[0]), float(nk[1])))
				if m.get("emissive") != null:
					sm.set_shader_parameter("emissive", KData.colour(m["emissive"], false))
	if kind != "leaf" and m["alphaTest"] > 0.0:
		sm.set_shader_parameter("alpha_test", float(m["alphaTest"]))
	if m.get("hooked") and not (kind in ["leaf", "anim", "anim-phase", "irid", "gloss", "far", "hang"]):
		_gap(report, "hooked:" + str(m.get("key")), "kind '%s' material %s carries a kit shader hook the export does not name: drawn plain" % [kind, m.get("key")])
	# material colours are three's linear working values written as hex (convention.colours.materials): no conversion
	sm.set_shader_parameter("colour", KData.colour(m["colour"], false) if m["colour"] != null else Color(1, 1, 1))
	if map_id != null and tex.has(map_id) and tex[map_id] != null:
		sm.set_shader_parameter("albedo_tex", tex[map_id])
		sm.set_shader_parameter("data_tex", tex[map_id])
		sm.set_shader_parameter("has_tex", true)
		var r: Array = texrec[map_id]["repeat"]
		sm.set_shader_parameter("uv_repeat", Vector2(float(r[0]), float(r[1])))
		if texrec[map_id].get("offset") is Array:   # core/export's records carry three's offset (a library card's one cell)
			var of: Array = texrec[map_id]["offset"]
			sm.set_shader_parameter("uv_offset", Vector2(float(of[0]), float(of[1])))
		if texrec[map_id].has("flipY"):
			sm.set_shader_parameter("flip_v", bool(texrec[map_id]["flipY"]))
		else:
			_gap(report, "flipY", "texture records without flipY (an export from before 2026-10-05): every map assumed flipped, so DataTexture cards read upside down")
	else:
		sm.set_shader_parameter("has_tex", false)
		if map_id != null:
			_gap(report, "missing images", "a material names a texture the export holds no image for (%s): drawn untextured" % texrec.get(map_id, {}).get("error", "no png"))
	if not m.get("doubleSided", true):
		_gap(report, "single-sided", "some materials are single-sided in three; every Godot shader here is cull_disabled")
	return sm


# an 'anim' material's options (BIO.animHook's o: mode, flap {rate, amp, root}, legs {top, amp}, billboard, basic,
# additive) as the anim shader's uniforms, rounded as three writes them into its GLSL (toFixed)
static func anim_material(sm: ShaderMaterial, o: Dictionary) -> void:
	sm.shader = ANIM_ADD if o.get("basic") and o.get("additive") else ANIM
	sm.set_shader_parameter("mode", {"orbit": 0, "flit": 1, "walk": 2}.get(str(o.get("mode", "orbit")), 0))
	sm.set_shader_parameter("billboard", bool(o.get("billboard", false)))
	var fl = o.get("flap")
	sm.set_shader_parameter("flap_on", fl is Dictionary)
	if fl is Dictionary:
		sm.set_shader_parameter("flap_rate", snappedf(float(fl.get("rate", 6.0) if fl.get("rate") else 6.0), 0.01))
		sm.set_shader_parameter("flap_amp", snappedf(float(fl.get("amp", 0.35) if fl.get("amp") else 0.35), 0.001))
		sm.set_shader_parameter("flap_root", snappedf(float(fl["root"]) if fl.get("root") != null else 0.12, 0.001))
	var lg = o.get("legs")
	sm.set_shader_parameter("legs_on", lg is Dictionary)
	if lg is Dictionary:
		var amp := float(lg.get("amp", 0.18) if lg.get("amp") else 0.18)
		sm.set_shader_parameter("legs_top", snappedf(float(lg.get("top", 0.5) if lg.get("top") else 0.5), 0.001))
		sm.set_shader_parameter("legs_amp", snappedf(amp, 0.001))
		sm.set_shader_parameter("legs_lift", snappedf(amp * 0.35, 0.001))
