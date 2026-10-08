# The dhelv case (kits/zeijani/PLAN.md 9, P7): Dhelv's exports (settlements/dhelv: verify.py --export) as stand-ins.
#   place.json   every site a box over its footprint, coloured by district (a carved site's box behind its front)
#   walk.json    the walk floors drawn (they stand in for the cavern's rock, which is not meshed here) and baked into a
#                NavigationMesh between the outpost's gate and the temple (KratorDhelvNav), with a NavigationAgent3D that
#                walks that way through the stone door and the braid
#   sim.json     the ramblers: every actor a capsule, moved each frame by KSim.pose (core/simulation's motion twin)
#   lights.json  the 48 lamps nearest the temple as OmniLight3D with distance fade (the rest are records)
# Every guess is a gap in the report.
class_name KratorDhelv
extends RefCounted

const DISTRICT := {"hub": Color(0.86, 0.7, 0.5), "outpost": Color(0.7, 0.6, 0.45), "well": Color(0.6, 0.72, 0.55), "pit": Color(0.6, 0.72, 0.55),
	"works": Color(0.62, 0.6, 0.66), "catacombs": Color(0.5, 0.48, 0.55), "cistern": Color(0.5, 0.62, 0.75)}


static func _mat(c: Color, unshaded := false) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = c
	if unshaded:
		m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	return m


static func build(dir: String) -> Node3D:
	var root := Node3D.new()
	root.name = "Dhelv"
	var report := {"route": "krator-dhelv-place, krator-walk, krator-sim (motion), krator-lights (settlements/dhelv)", "counts": {}, "gaps": {}}
	var place = KData.read_json(dir + "place.json")
	var walk = KData.read_json(dir + "walk.json")
	var nav = KData.read_json(dir + "nav.json")
	var sim = KData.read_json(dir + "sim.json")
	var lights = KData.read_json(dir + "lights.json")
	if not (place is Dictionary and walk is Dictionary and nav is Dictionary):
		report["gaps"]["load"] = "no place.json, walk.json or nav.json in " + dir
		root.set_meta("report", report)
		return root
	# the sites
	var sites: Array = place["sites"]
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	var box := BoxMesh.new()
	box.size = Vector3.ONE
	mm.mesh = box
	var keep: Array = sites.filter(func(s): return s["w"] != null and s["y"] != null)
	mm.instance_count = keep.size()
	for i in keep.size():
		var s: Dictionary = keep[i]
		var ry := float(s["ry"])
		var w := float(s["w"])
		var d := float(s["d"])
		var h := float(s["h"]) if s["h"] != null else 4.0
		var c := Vector3(float(s["x"]), float(s["y"]) + h * 0.5, float(s["z"]))
		if s["origin"] == "front":   # the footprint runs back from the front, into the rock
			c -= Vector3(sin(ry), 0, cos(ry)) * d * 0.5
		mm.set_instance_transform(i, Transform3D(Basis(Vector3.UP, ry).scaled(Vector3(w, h, d)), c))
		mm.set_instance_color(i, DISTRICT.get(s["district"], Color(0.7, 0.7, 0.7)))
	var smi := MultiMeshInstance3D.new()
	smi.name = "Sites"
	smi.multimesh = mm
	var sm := _mat(Color.WHITE)
	sm.vertex_color_use_as_albedo = true
	sm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	sm.albedo_color = Color(1, 1, 1, 0.55)
	smi.material_override = sm
	root.add_child(smi)
	report["counts"]["sites"] = keep.size()
	if keep.size() < sites.size():
		report["gaps"]["sites"] = "%d sites with no declared footprint are not drawn" % (sites.size() - keep.size())
	# the walk floors, drawn (one upward winding) over the whole city
	var all := AABB(Vector3(-1e5, -1e5, -1e5), Vector3(2e5, 2e5, 2e5))
	var src := KratorDhelvNav.source(walk, all)
	var verts := src.get_vertices()
	var idx := src.get_indices()
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for k in range(0, idx.size(), 3):
		var a := Vector3(verts[idx[k] * 3], verts[idx[k] * 3 + 1], verts[idx[k] * 3 + 2])
		var b := Vector3(verts[idx[k + 1] * 3], verts[idx[k + 1] * 3 + 1], verts[idx[k + 1] * 3 + 2])
		var c := Vector3(verts[idx[k + 2] * 3], verts[idx[k + 2] * 3 + 1], verts[idx[k + 2] * 3 + 2])
		var n := (b - a).cross(c - a)
		if n.y > 1e-6 * n.length() and n.length() > 0:   # floors only, their downward twin and the blocks' sides left out
			st.add_vertex(a)
			st.add_vertex(c)
			st.add_vertex(b)
	st.generate_normals()
	var fmi := MeshInstance3D.new()
	fmi.name = "WalkFloors"
	fmi.mesh = st.commit()
	fmi.material_override = _mat(Color(0.78, 0.66, 0.5))
	fmi.material_override.cull_mode = BaseMaterial3D.CULL_DISABLED
	root.add_child(fmi)
	report["counts"]["walk_floors"] = src.get_meta("counts")["floors"]
	report["counts"]["walk_blocks"] = src.get_meta("counts")["blocks"]
	report["gaps"]["cavern"] = "the cavern's rock is not meshed: cavern.json is KCAVERN's plan and its marching cubes are not ported; the walk floors stand in"
	report["gaps"]["furniture"] = "no furniture or interiors exported (IX.exportBuilding, the catalog's records)"
	report["gaps"]["materials"] = "the material library (tex/pack.json) is not read: flat district colours"
	# the navigation: a mesh baked between the gate and the temple, an agent walking it
	var gate := KratorDhelvNav.node(nav, "o.gate")
	var door := ""
	for d in nav["doors"]:
		if d["key"] == "zj_temple":
			door = d["node"]
	var temple := KratorDhelvNav.node(nav, door)
	var lo := Vector3(minf(gate.x, temple.x) - 60, -400, minf(gate.z, temple.z) - 140)
	var hi := Vector3(maxf(gate.x, temple.x) + 60, 400, maxf(gate.z, temple.z) + 140)
	var nbox := AABB(lo, hi - lo)
	var t0 := Time.get_ticks_msec()
	var nm := KratorDhelvNav.bake(KratorDhelvNav.source(walk, nbox), nbox)
	report["counts"]["navmesh_polygons"] = nm.get_polygon_count()
	report["counts"]["navmesh_bake_ms"] = Time.get_ticks_msec() - t0
	var reg := NavigationRegion3D.new()
	reg.name = "Navigation"
	reg.navigation_mesh = nm
	root.add_child(reg)
	var mover := Node3D.new()
	mover.name = "Life"
	mover.set_script(load("res://krator/dhelv_sim_node.gd"))
	root.add_child(mover)
	var walker := CharacterBody3D.new()
	walker.name = "Walker"
	var body := MeshInstance3D.new()
	var cap := CapsuleMesh.new()
	cap.radius = 0.3
	cap.height = 1.7
	body.mesh = cap
	body.position.y = 0.85
	body.material_override = _mat(Color(0.95, 0.3, 0.2), true)
	walker.add_child(body)
	var agent := NavigationAgent3D.new()
	agent.name = "Agent"
	agent.radius = KratorDhelvNav.RADIUS
	agent.height = KratorDhelvNav.HEIGHT
	agent.path_desired_distance = 1.0
	agent.target_desired_distance = 1.5
	walker.add_child(agent)
	walker.position = gate
	root.add_child(walker)
	mover.set("walker", walker)
	mover.set("agent", agent)
	mover.set("goal", temple)
	# the ramblers
	if sim is Dictionary and sim.has("motion"):
		var M: Dictionary = sim["motion"]
		var pm := MultiMesh.new()
		pm.transform_format = MultiMesh.TRANSFORM_3D
		pm.use_colors = true
		var pc := CapsuleMesh.new()
		pc.radius = 0.28
		pc.height = 1.65
		pm.mesh = pc
		pm.instance_count = M["actors"].size()
		var pmi := MultiMeshInstance3D.new()
		pmi.name = "Ramblers"
		pmi.multimesh = pm
		var pmat := _mat(Color.WHITE)
		pmat.vertex_color_use_as_albedo = true
		pmi.material_override = pmat
		root.add_child(pmi)
		mover.set("model", M)
		mover.set("people", pm)
		mover.set("t", float(M["t"]))
		report["counts"]["ramblers"] = M["actors"].size()
	else:
		report["gaps"]["sim"] = "no sim.json with a motion block"
	# the lamps nearest the temple
	if lights is Dictionary:
		var L: Array = lights["lights"].duplicate()
		L.sort_custom(func(a, b): return Vector3(a["x"], a["y"], a["z"]).distance_squared_to(temple) < Vector3(b["x"], b["y"], b["z"]).distance_squared_to(temple))
		for i in mini(48, L.size()):
			var l: Dictionary = L[i]
			var o := OmniLight3D.new()
			o.position = Vector3(l["x"], l["y"], l["z"])
			o.light_color = Color(l["color"][0], l["color"][1], l["color"][2])
			o.omni_range = 9.0 if l["big"] else 5.0
			o.light_energy = 1.6 if l["big"] else 0.8
			o.distance_fade_enabled = true
			o.distance_fade_begin = 120.0
			root.add_child(o)
		report["counts"]["lights"] = "%d records, %d lit" % [L.size(), mini(48, L.size())]
	root.set_meta("report", report)
	root.set_meta("focus", temple)
	return root
