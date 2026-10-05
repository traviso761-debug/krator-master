# Yuni's KRATOR_EXPORT records (settlements/yuni/GAME_EXPORT.md) as a Godot scene: no meshes come across, only
# tagged records with stable ids, so this importer draws stand-ins (boxes, quads, lights) and puts every record's
# fields on its node as metadata. One building's interior is built in full: rooms, walls with -col collision,
# furniture markers, and the walk graph as NavigationRegion3D per level plus NavigationLink3D per stair, ladder and door.
class_name KratorRecords
extends RefCounted

const MAX_LIGHTS := 48   # real OmniLight3D nodes; the rest of the world's lights are markers


static func build(fixtures_path: String, building_path: String) -> Node3D:
	var t0 := Time.get_ticks_msec()
	var report := {"route": "records (KRATOR_EXPORT)", "file": fixtures_path, "gaps": {}, "counts": {}}
	var root := Node3D.new()
	root.name = "Records"
	var fx = KData.read_json(fixtures_path)
	if not (fx is Dictionary):
		report["gaps"]["load"] = "cannot read fixtures"
		root.set_meta("report", report)
		return root
	root.set_meta("krator", {"schema": fx.get("schema"), "coords": fx.get("coords")})

	# buildings: a node each (the tags need a node; a MultiMesh instance cannot carry metadata), a translucent box
	var bnode := Node3D.new()
	bnode.name = "Buildings"
	root.add_child(bnode)
	var box_mat := StandardMaterial3D.new()
	box_mat.albedo_color = Color(0.85, 0.7, 0.5, 0.35)
	box_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	box_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	var cultures := {}
	for b in fx["buildings"]:
		var n := Node3D.new()
		n.name = "Building_" + str(b["id"])
		n.position = Vector3(float(b["x"]), float(b["y"]), float(b["z"]))
		n.rotation.y = float(b["yaw"])
		var meta := {}
		for k in b:
			if k != "doors" and k != "windows" and k != "lights":
				meta[k] = b[k]
		n.set_meta("krator", meta)
		var mi := MeshInstance3D.new()
		var bm := BoxMesh.new()
		bm.size = Vector3(float(b["w"]), float(b["h"]), float(b["d"]))
		mi.mesh = bm
		mi.position.y = float(b["h"]) * 0.5
		mi.material_override = box_mat
		n.add_child(mi)
		bnode.add_child(n)
		cultures[b.get("culture", "?")] = cultures.get(b.get("culture", "?"), 0) + 1

	# doors and windows: thousands, so MultiMeshes (and the finding: per-instance tags need a side table)
	root.add_child(_fixture_mm("Doors", fx["doors"], Color(0.45, 0.25, 0.1), true))
	root.add_child(_fixture_mm("Windows", fx["windows"], Color(0.4, 0.6, 0.9), false))
	report["gaps"]["instanced tags"] = "doors and windows are MultiMesh instances here; their ids and tags sit in a side table (meta 'records') indexed by instance, since a MultiMesh instance has no metadata"

	# lights: the nearest MAX_LIGHTS to the chosen building become OmniLight3D, the rest only records
	var lights: Array = fx["lights"]
	var ln := Node3D.new()
	ln.name = "Lights"
	root.add_child(ln)
	ln.set_meta("records", lights)

	# the chosen building in full
	var bj: Dictionary = KData.read_json(building_path) if FileAccess.file_exists(building_path) else {}
	var focus := Vector3.ZERO
	if not bj.is_empty():
		var interior := _interior(bj, report)
		root.add_child(interior)
		# the stand-in box would hide the interior it stands for
		var shell := bnode.get_node_or_null("Building_" + str(bj.get("building", bj).get("id", "")))
		if shell:
			for c in shell.get_children():
				c.visible = false
		focus = interior.position
	root.set_meta("focus", focus)
	var near := lights.duplicate()
	near.sort_custom(func(a, b): return Vector3(a["x"], a["y"], a["z"]).distance_squared_to(focus) < Vector3(b["x"], b["y"], b["z"]).distance_squared_to(focus))
	for i in min(MAX_LIGHTS, near.size()):
		var l: Dictionary = near[i]
		var o := OmniLight3D.new()
		o.name = "Light_" + str(l["id"])
		o.position = Vector3(float(l["x"]), float(l["y"]), float(l["z"]))
		o.omni_range = float(l.get("radius", 6.0))
		o.light_energy = float(l.get("amp", 1.0))
		o.light_color = Color(1.0, 0.72, 0.42) if not l.get("electric", false) else Color(0.95, 0.95, 1.0)
		o.set_meta("krator", l)
		ln.add_child(o)
	report["gaps"]["light units"] = "light amp and radius are three.js PointLight numbers; Godot's energy and range are not the same units (retune, then put the factor in the export)"

	report["counts"] = {"buildings": fx["buildings"].size(), "doors": fx["doors"].size(), "windows": fx["windows"].size(),
		"lights": lights.size(), "cultures": cultures, "load_ms": Time.get_ticks_msec() - t0}
	report["gaps"]["meshes"] = "records carry no geometry: buildings are boxes here; the meshes need a second route (glTF or a builder port)"
	root.set_meta("report", report)
	return root


static func _fixture_mm(nm: String, recs: Array, col: Color, is_door: bool) -> MultiMeshInstance3D:
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	var bm := BoxMesh.new()
	bm.size = Vector3(1, 1, 0.12)
	mm.mesh = bm
	mm.instance_count = recs.size()
	for i in recs.size():
		var r: Dictionary = recs[i]
		var w := float(r.get("w", 1.0))
		var h := float(r.get("h", 2.0))
		var basis := Basis(Vector3.UP, float(r.get("yaw", 0.0))).scaled(Vector3(w, h, 1.0))
		# a door's y is its sill, a window's the centre of the pane
		var y := float(r["y"]) + (h * 0.5 if is_door else 0.0)
		mm.set_instance_transform(i, Transform3D(basis, Vector3(float(r["x"]), y, float(r["z"]))))
	var mmi := MultiMeshInstance3D.new()
	mmi.name = nm
	mmi.multimesh = mm
	var mat := StandardMaterial3D.new()
	mat.albedo_color = col
	mmi.material_override = mat
	mmi.set_meta("records", recs)
	return mmi


static func _interior(bj: Dictionary, report: Dictionary) -> Node3D:
	var b: Dictionary = bj.get("building", bj)
	var n := Node3D.new()
	n.name = "Interior_" + str(b.get("id", "?"))
	n.position = Vector3(float(b.get("x", 0)), float(b.get("y", 0)), float(b.get("z", 0)))
	n.rotation.y = float(b.get("yaw", 0))
	n.set_meta("krator", b)
	var it: Dictionary = bj.get("interior", {})
	if it.is_empty():
		report["gaps"]["interior"] = "the chosen building has no planned interior"
		return n
	var floor_mat := StandardMaterial3D.new()
	floor_mat.albedo_color = Color(0.55, 0.45, 0.35)
	floor_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	var wall_mat := StandardMaterial3D.new()
	wall_mat.albedo_color = Color(0.82, 0.76, 0.66)

	var levels := {}
	for r in it.get("rooms", []):
		var poly := PackedVector2Array()
		for p in r["poly"]:
			poly.append(Vector2(float(p[0]), float(p[1])))
		var tri := Geometry2D.triangulate_polygon(poly)
		if tri.is_empty():
			report["gaps"]["room poly"] = "a room polygon did not triangulate (self-intersecting or wrongly wound)"
			continue
		var y := float(r.get("y", 0))
		var st := SurfaceTool.new()
		st.begin(Mesh.PRIMITIVE_TRIANGLES)
		st.set_normal(Vector3.UP)
		for k in tri:
			st.add_vertex(Vector3(poly[k].x, y, poly[k].y))
		var mi := MeshInstance3D.new()
		mi.name = "Room_" + str(r["id"])
		mi.mesh = st.commit()
		mi.material_override = floor_mat
		mi.set_meta("krator", r)
		n.add_child(mi)
		var lv: int = int(r.get("lvl", 0))
		if not levels.has(lv):
			levels[lv] = []
		levels[lv].append([poly, tri, y])

	# walls: boxes from a to b; the -col hint gets trimesh collision in the editor importer, here a StaticBody3D
	var walls := Node3D.new()
	walls.name = "Walls"
	n.add_child(walls)
	for w in it.get("walls", []):
		var a := Vector2(float(w["a"][0]), float(w["a"][1]))
		var c := Vector2(float(w["b"][0]), float(w["b"][1]))
		var wl := a.distance_to(c)
		if wl < 0.01:
			continue
		var h := float(w.get("h", 2.6))
		var th := float(w.get("thick", 0.2))
		var body := StaticBody3D.new()
		body.name = "Wall_%s-col" % str(w["id"]).replace(".", "_")
		var mid := (a + c) * 0.5
		body.position = Vector3(mid.x, float(w.get("y", 0)) + h * 0.5, mid.y)
		body.rotation.y = -atan2(c.y - a.y, c.x - a.x)
		var mi := MeshInstance3D.new()
		var bm := BoxMesh.new()
		bm.size = Vector3(wl, h, th)
		mi.mesh = bm
		mi.material_override = wall_mat
		body.add_child(mi)
		var cs := CollisionShape3D.new()
		var sh := BoxShape3D.new()
		sh.size = bm.size
		cs.shape = sh
		body.add_child(cs)
		body.set_meta("krator", w)
		walls.add_child(body)
	if it.get("walls", []).size() > 0:
		report["gaps"]["wall openings"] = "walls are solid boxes: openings (u, w, y0, y1) need CSG or a wall builder to cut doors and windows"

	# furniture: markers carrying the record (the catalog key resolves to a mesh only through kits/catalog)
	var fn := Node3D.new()
	fn.name = "Furniture"
	n.add_child(fn)
	var fmat := StandardMaterial3D.new()
	fmat.albedo_color = Color(0.3, 0.5, 0.3)
	for f in it.get("furniture", []):
		if f.get("virtual", false):
			continue
		var mi := MeshInstance3D.new()
		mi.name = "Furniture_" + str(f["id"]).replace(".", "_")
		var bm := BoxMesh.new()
		bm.size = Vector3(0.6, 0.6, 0.6)
		mi.mesh = bm
		mi.material_override = fmat
		var at: Array = f.get("at", [0, 0])
		mi.position = Vector3(float(at[0]), float(f.get("y", 0)) + 0.3, float(at[1]))
		mi.rotation.y = float(f.get("yaw", 0))
		mi.set_meta("krator", f)
		fn.add_child(mi)
	report["gaps"]["furniture meshes"] = "furniture arrives as catalog keys (furn, variant, seed): no catalog exporter yet, so markers"

	# navigation: one region per level from the room triangles, a link per stair, ladder and door edge
	for lv in levels:
		var nm := NavigationMesh.new()
		var verts := PackedVector3Array()
		for entry in levels[lv]:
			var poly: PackedVector2Array = entry[0]
			var tri: PackedInt32Array = entry[1]
			var y: float = entry[2]
			for t in range(0, tri.size(), 3):
				var base := verts.size()
				# NavigationMesh polygons wind clockwise seen from above
				verts.append(Vector3(poly[tri[t]].x, y, poly[tri[t]].y))
				verts.append(Vector3(poly[tri[t + 2]].x, y, poly[tri[t + 2]].y))
				verts.append(Vector3(poly[tri[t + 1]].x, y, poly[tri[t + 1]].y))
				nm.add_polygon(PackedInt32Array([base, base + 1, base + 2]))
		nm.vertices = verts
		var reg := NavigationRegion3D.new()
		reg.name = "Nav_level_%d" % lv
		reg.navigation_mesh = nm
		n.add_child(reg)
	var nav: Dictionary = it.get("nav", {})
	var nodes := {}
	for nd in nav.get("nodes", []):
		nodes[nd["id"]] = nd
	var links := 0
	for e in nav.get("edges", []):
		if not (e["kind"] in ["stair", "ladder", "door"]):
			continue
		if not (nodes.has(e["a"]) and nodes.has(e["b"])):
			continue
		var na: Dictionary = nodes[e["a"]]
		var nb: Dictionary = nodes[e["b"]]
		var link := NavigationLink3D.new()
		link.name = "Link_%s_%d" % [e["kind"], links]
		link.start_position = Vector3(float(na["x"]), float(na["y"]), float(na["z"]))
		link.end_position = Vector3(float(nb["x"]), float(nb["y"]), float(nb["z"]))
		link.set_meta("krator", e)
		n.add_child(link)
		links += 1
	report["counts_interior"] = {"rooms": it.get("rooms", []).size(), "walls": it.get("walls", []).size(),
		"furniture": it.get("furniture", []).size(), "nav_nodes": nodes.size(), "nav_links": links, "levels": levels.size()}
	if str(it.get("frame", "")).begins_with("building-local") == false:
		report["gaps"]["nav space"] = "the interior does not state its frame: links are parented under the building, assuming building-local"
	return n
