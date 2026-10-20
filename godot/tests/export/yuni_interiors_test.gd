# Yuni's interiors through core/export (core/export/README.md, "Interiors"; GODOT-PLAN.md finding 19): the Foundry's
# box exported as a krator-world carries the room graph of every planned building (the interiors section, since
# 2026-10-18), and krator/world_import.gd builds it under Records/Building_<id>: rooms as floor polygons with their
# record, walls as StaticBody3D boxes named -col, a Marker3D per link with its kind, and the spike's navigation
# (a NavigationRegion3D per storey and one for the yard, a NavigationLink3D per door link). The scripted nav check
# finding 19 asked for: a path from one room of bld_00005 to another leaves through its door link, crosses the yard
# and enters through the other's; with the links removed the rooms are cut off (the negative). The case is written by
#   python3 tools/harness.py export settlements/yuni/yuni.html --out godot/data/world-yuni --box 140,-80,340,90 --profile registry,fixtures,interiors
#   godot --headless --path godot --script res://tests/export/yuni_interiors_test.gd     exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

const CASE := "res://data/world-yuni/"
const BLD := "bld_00005"

var fails := 0
var _step := 0
var _phase := 0
var _map: RID
var _ctx := {}


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	if not FileAccess.file_exists(CASE + "world.json"):
		print("FAIL no case: run python3 tools/harness.py export settlements/yuni/yuni.html --out godot/data/world-yuni --box 140,-80,340,90 --profile registry,fixtures,interiors")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "world.json")
	var w := KratorWorld.build(CASE + "world.json")
	root.add_child(w)
	var rep: Dictionary = w.get_meta("report")
	var recs: Dictionary = rep.get("records", {})
	ok(rep["sections"].get("interiors") == "ok", "the interiors section reads ok (sections: %s)" % JSON.stringify(rep["sections"]))
	var I: Dictionary = d.get("interiors", {})
	var nb: int = (I.get("buildings", []) as Array).size()
	ok(I.get("format") == "krator-interiors" and nb > 0 and str(I.get("frame", "")).begins_with("building-local"),
		"krator-interiors, building-local: %d buildings with a plan in the box" % nb)
	ok(int(recs.get("interiors", 0)) == nb and int(recs.get("interiors_unparented", 0)) == 0,
		"every one built under its Building node (%d; rooms %d, walls %d, links %d)" % [recs.get("interiors", 0), recs.get("rooms", 0), recs.get("walls", 0), recs.get("links", 0)])

	# 1. the compound: its rooms, walls and links as nodes with their records
	var B: Dictionary = {}
	for b in I.get("buildings", []):
		if b["id"] == BLD:
			B = b
	ok(not B.is_empty(), "%s (the Foundry) has an interior in the section" % BLD)
	var bn := w.get_node_or_null("Records/Building_%s" % BLD) as Node3D
	var itn := bn.get_node_or_null("Interior_%s" % BLD) as Node3D if bn else null
	ok(itn != null, "Records/Building_%s/Interior_%s exists" % [BLD, BLD])
	if B.is_empty() or itn == null:
		quit(1)
		return
	var rooms := []
	for S in B.get("storeys", []):
		for r in S.get("rooms", []):
			rooms.append(r)
	var room_nodes := 0
	var room_recs := 0
	var by_room := {}   # a node's name drops the id's dots (Room_bld_00005room0), so the rooms are found by their record
	for c in itn.get_children():
		if c is MeshInstance3D and str(c.name).begins_with("Room_"):
			var recm = c.get_meta("records", [])
			if recm is Array and recm.size() == 1 and recm[0] is Dictionary:
				by_room[recm[0].get("id")] = c
	for r in rooms:
		if by_room.has(r["id"]):
			room_nodes += 1
			if (by_room[r["id"]] as Node).get_meta("krator", {}).get("id") == r["id"]:
				room_recs += 1
	ok(rooms.size() > 1 and room_nodes == rooms.size() and room_recs == rooms.size(),
		"%d rooms as floor polygons, each carrying its record in `records` (%d nodes, %d records)" % [rooms.size(), room_nodes, room_recs])
	var walls: Array = B.get("walls", [])
	var col := 0
	var bodies := 0
	for wl in walls:
		var wn := itn.get_node_or_null("Walls/Wall_%s-col" % str(wl["id"]).replace(".", "_"))
		if wn is StaticBody3D and wn.get_child_count() > 0 and (wn as StaticBody3D).find_children("*", "CollisionShape3D", false, false).size() == 1:
			bodies += 1
		if wl.get("col") == true:
			col += 1
	ok(walls.size() > 0 and col == walls.size() and bodies == walls.size(),
		"%d walls, every one col: true, each a StaticBody3D named -col with one collision shape (%d)" % [walls.size(), bodies])
	var links: Array = B.get("links", [])
	var markers := 0
	var kinds := {}
	var door_fix := 0
	var fx_ids := {}
	for fr in d.get("fixtures", {}).get("records", []):
		fx_ids[fr["id"]] = true
	for l in links:
		var mn := itn.get_node_or_null("Links/" + ("Link_%s" % str(l["id"])).validate_node_name())
		if mn is Marker3D and mn.get_meta("krator_kind") == l["kind"]:
			markers += 1
		kinds[l["kind"]] = kinds.get(l["kind"], 0) + 1
		if l["kind"] == "door" and fx_ids.has(l["id"]):
			door_fix += 1
	ok(links.size() > 0 and markers == links.size(), "%d links as Marker3D with their kind (%s)" % [links.size(), JSON.stringify(kinds)])
	var door_refs := 0
	var door_ok := 0
	var link_ids := {}
	for l in links:
		link_ids[l["id"]] = true
	for r in rooms:
		for did in r.get("doors", []):
			door_refs += 1
			if fx_ids.has(did) or link_ids.has(did):
				door_ok += 1
	ok(door_refs > 0 and door_ok == door_refs and door_fix > 0,
		"every room's door resolves (%d of %d: a fixture record of the fixtures section, or a link of the building; %d exterior doors are fixtures)" % [door_ok, door_refs, door_fix])
	ok(not fx_ids.has("door_99999") and not link_ids.has("door_99999"), "negative: a door id the page never made resolves nowhere")
	var navlinks := itn.find_children("*", "NavigationLink3D", false, false)
	var regions := itn.find_children("*", "NavigationRegion3D", false, false)
	ok(navlinks.size() > 0 and regions.size() >= 2 and itn.get_node_or_null("Nav_yard") != null,
		"navigation: %d regions (a storey each, and the yard) and %d NavigationLink3D" % [regions.size(), navlinks.size()])

	# 2. the nav check (finding 19): from one room to another through the door links, once the server has synced
	var xf := bn.transform * itn.transform   # Records and World stand at the origin; the tree is not live yet, so no global_transform
	var pick := func(r: Dictionary) -> Vector3:
		var c := Vector2.ZERO
		for p in r["poly"]:
			c += Vector2(float(p[0]), float(p[1]))
		c /= float((r["poly"] as Array).size())
		return xf * Vector3(c.x, float(r.get("y", 0)), c.y)
	var r0: Dictionary = rooms[0]
	var r1: Dictionary = rooms[rooms.size() - 1]
	var doors_at := []
	for l in links:
		if l["kind"] == "door":
			var at: Array = l["at"]
			doors_at.append(xf * Vector3(float(at[0]), float(at[1]), float(at[2])))
	_ctx = {"a": pick.call(r0), "b": pick.call(r1), "ra": r0["id"], "rb": r1["id"], "doors": doors_at, "navlinks": navlinks}
	_map = root.world_3d.navigation_map


func _process(_delta: float) -> bool:
	_step += 1
	if _step > 900:
		ok(false, "the navigation map never synced")
		quit(1)
		return true
	var it := NavigationServer3D.map_get_iteration_id(_map)
	if _phase == 0:
		if it < 2:
			return false   # the server syncs on the physics frames; the first iteration holds no regions yet
		var a: Vector3 = _ctx["a"]
		var b: Vector3 = _ctx["b"]
		var ca := NavigationServer3D.map_get_closest_point(_map, a)
		var cb := NavigationServer3D.map_get_closest_point(_map, b)
		ok(ca.distance_to(a) < 0.5 and cb.distance_to(b) < 0.5, "both rooms' centres lie on the navmesh (%.2f, %.2f m off)" % [ca.distance_to(a), cb.distance_to(b)])
		var path := NavigationServer3D.map_get_path(_map, a, b, true)
		var L := 0.0
		for i in range(1, path.size()):
			L += path[i - 1].distance_to(path[i])
		var end := path[path.size() - 1] if path.size() > 0 else Vector3(INF, INF, INF)
		ok(path.size() > 1 and end.distance_to(b) < 0.5, "a path from %s reaches %s (%d points, %.1f m, ends %.2f m off)" % [_ctx["ra"], _ctx["rb"], path.size(), L, end.distance_to(b)])
		var through := 0
		for q in _ctx["doors"]:
			var dmin := INF
			for i in range(1, path.size()):
				dmin = minf(dmin, (q as Vector3).distance_to(Geometry3D.get_closest_point_to_segment(q, path[i - 1], path[i])))
			if dmin < 1.5:
				through += 1
		ok(through >= 2, "it goes through door links: %d thresholds within 1.5 m of the path (out of one room, into the other)" % through)
		_ctx["len"] = L
		for n in _ctx["navlinks"]:   # the negative: no links, no way out of a room
			(n as Node).queue_free()
		_ctx["it"] = it
		_phase = 1
		return false
	if _phase == 1:
		if it <= int(_ctx["it"]):   # the server syncs the freed links away on the next physics frame
			return false
		var a: Vector3 = _ctx["a"]
		var b: Vector3 = _ctx["b"]
		var path := NavigationServer3D.map_get_path(_map, a, b, true)
		var end := path[path.size() - 1] if path.size() > 0 else Vector3(INF, INF, INF)
		ok(end.distance_to(b) > 1.0, "negative: without the door links the other room is not reached (ends %.1f m off)" % end.distance_to(b))
		print("yuni interiors: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
		quit(0 if fails == 0 else 1)
		return true
	return false
