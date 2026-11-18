# Automated checks for I1-I3 room-gated interior lighting (krator/lamp_pool.gd + krator/world_import.gd):
#   1. 20 cm solid-wall isolation: a bulb 0.20 m across a solid wall in unlinked Room B NEVER bleeds into Room A
#      (negative: without room records, pick() chooses Room B's 0.20 m bulb first!)
#   2. Portal doorway spill: a bulb in portal-linked Room C spills softly into Room A behind Room A's own bulb
#   3. Exterior stone wall isolation vs open exterior doorway threshold
#   4. Outdoor street-lamp blocking inside windowless interior rooms
#   5. Hero-bulb shadow budget (hero_shadows = 1 enables shadows on Pool0 only)
#   6. KratorWorld.records() rotated building-local krator-interiors -> room_defs + portals + InteriorLampPool
#   godot --headless --rendering-driver dummy --path godot --script res://tests/qiblai/room_lamp_pool_test.gd
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _ids(picked: Array) -> Array:
	var out := []
	for e in picked:
		out.append(str((e[1] as Dictionary).get("id", "")))
	return out


var _done := false


func _process(_dt: float) -> bool:
	if not _done:
		quit(1)
	return true


func _initialize() -> void:
	# Two adjacent rooms sharing a thin wall at x = 5.0 (eye at 4.90, Room B bulb at 5.10 -> 20 cm apart!),
	# plus Room C sharing an open doorway with Room A at z = 6.0, and an exterior door on Room A at (0.0, 1.2, 3.0).
	var rooms := [
		{"id": "A", "box": [0.0, 0.0, 0.0, 5.0, 3.2, 6.0], "portals": ["C"], "doors": [[0.0, 1.2, 3.0]]},
		{"id": "B", "box": [5.001, 0.0, 0.0, 10.0, 3.2, 6.0], "portals": [], "doors": []},
		{"id": "C", "box": [0.0, 0.0, 6.001, 5.0, 3.2, 12.0], "portals": ["A"], "doors": []},
	]
	var lamps := [
		{"id": "bulb_A", "kind": "bulb", "at": [1.5, 2.4, 3.0], "color": "#ffd6a0", "radius": 9.0, "amp": 1.0, "hours": [0.0, 24.0]},
		{"id": "bulb_B_20cm", "kind": "bulb", "at": [5.10, 1.7, 3.0], "color": "#ffd6a0", "radius": 9.0, "amp": 1.0, "hours": [0.0, 24.0]},
		{"id": "bulb_C_portal", "kind": "bulb", "at": [2.5, 2.4, 7.2], "color": "#ffd6a0", "radius": 9.0, "amp": 1.0, "hours": [0.0, 24.0]},
		{"id": "street_back", "kind": "lamp", "at": [7.5, 6.0, -3.0], "color": "#ffd6a0", "radius": 24.0, "amp": 1.0, "hours": [17.2, 30.8]},
	]
	var A = load("res://krator/atmos.gd").new()

	# 1. 20 cm solid-wall bleed test (eye in Room A at x = 4.90, 20 cm from bulb_B_20cm at x = 5.10)
	var eye_wall := Vector3(4.90, 1.7, 3.0)
	var gated := _ids(KratorLampPool.pick_rooms(lamps, eye_wall, 21.5, A, 8, rooms))
	var ungated := _ids(KratorLampPool.pick(lamps, eye_wall, 21.5, A, 8))
	ok(gated.size() >= 1 and gated[0] == "bulb_A" and not ("bulb_B_20cm" in gated),
		"20 cm solid wall: Room A eye at x=4.90 picks bulb_A and blocks unlinked bulb_B_20cm at x=5.10 (%s)" % str(gated))
	ok(ungated.size() >= 1 and ungated[0] == "bulb_B_20cm",
		"negative: without room records, ungated pick() selects bulb_B_20cm across the 20 cm wall first (%s)" % str(ungated))

	# 2. Portal-linked doorway spill test
	ok("bulb_C_portal" in gated and gated.find("bulb_A") < gated.find("bulb_C_portal"),
		"portal link: portal-connected Room C bulb spills into Room A behind Room A's own bulb (%s)" % str(gated))
	var in_b := _ids(KratorLampPool.pick_rooms(lamps, Vector3(6.5, 1.7, 3.0), 21.5, A, 8, rooms))
	ok(in_b == ["bulb_B_20cm"],
		"negative: sealed windowless Room B receives ONLY its own bulb — neither Room A/C bulbs nor outdoor street_back (%s)" % str(in_b))

	# 3. Outdoor solid exterior wall vs open exterior doorway threshold
	var out_solid := _ids(KratorLampPool.pick_rooms(lamps, Vector3(2.5, 1.7, -1.5), 12.0, A, 8, rooms))
	var out_door := _ids(KratorLampPool.pick_rooms(lamps, Vector3(-1.8, 1.7, 3.0), 12.0, A, 8, rooms))
	ok(out_solid.is_empty(),
		"negative (exterior wall): standing 1.5 m outside solid windowless north wall at noon admits zero indoor bulbs (%s)" % str(out_solid))
	ok("bulb_A" in out_door and not ("bulb_B_20cm" in out_door),
		"exterior doorway threshold: standing 1.8 m outside Room A's open door admits warm doorway spill from bulb_A only (%s)" % str(out_door))

	# 4. Hero-bulb shadow pool check
	var pool := KratorLampPool.new()
	pool.lamps = lamps
	pool.rooms = rooms
	pool.atmos_override = A
	pool.hour_override = 21.5
	pool.focus_override = eye_wall
	pool.hero_shadows = 1
	root.add_child(pool)
	pool._ready() if pool.get_child_count() == 0 else null
	var lit_n := pool.refresh()
	var p0 := pool.get_child(0) as OmniLight3D
	var p1 := pool.get_child(1) as OmniLight3D
	ok(lit_n >= 2 and p0.shadow_enabled and not p1.shadow_enabled and pool.eye_is_indoors(eye_wall),
		"hero_shadows=1 enables dynamic shadows on nearest room bulb (Pool0) while keeping secondary lights unshadowed")
	pool.hero_shadows = 0
	pool.refresh()
	ok(not p0.shadow_enabled and not pool.eye_is_indoors(Vector3(-3.0, 1.7, 3.0)),
		"negative: hero_shadows=0 disables shadows on all pool lights, and outdoor point reports eye_is_indoors=false")
	pool.free()

	# 5. KratorWorld.records() integration on a rotated building with krator-interiors + light fixtures
	# Building bld_test at (100, 10, -50) rotated +90 deg (+PI/2) about +Y:
	# Local (+x, +z) maps under Basis(UP, PI/2) to world (+z, -x) -> local [0..4]x[0..6] becomes world [100..106] in x? Wait:
	# Basis(UP, PI/2) * Vector3(lx, ly, lz) = Vector3(lz, ly, -lx)!
	var by_id := {
		"bld_test": {"id": "bld_test", "class": "building", "at": [100.0, 10.0, -50.0], "ry": PI * 0.5}
	}
	var world_dict := {
		"fixtures": {
			"records": [
				# Local room r0 centre (2, 2.2, 2) -> world (100 + 2, 12.2, -50 - 2) = (102, 12.2, -52)
				{"id": "fix_l0", "kind": "light", "parent": "bld_test", "at": [102.0, 12.2, -52.0], "ry": 0.0, "color": "#ffd49a", "radius": 8.5},
				# Local room r1 centre (2, 2.2, 6) -> world (100 + 6, 12.2, -50 - 2) = (106, 12.2, -52)
				{"id": "fix_l1", "kind": "light", "parent": "bld_test", "at": [106.0, 12.2, -52.0], "ry": 0.0, "color": "#ffd49a", "radius": 8.5},
			]
		},
		"interiors": {
			"format": "krator-interiors",
			"frame": "building-local",
			"buildings": [{
				"id": "bld_test",
				"storeys": [{
					"k": 0, "h": 3.0,
					"rooms": [
						{"id": "r0", "y": 0.0, "poly": [[0, 0], [4, 0], [4, 4], [0, 4]]},
						{"id": "r1", "y": 0.0, "poly": [[0, 4], [4, 4], [4, 8], [0, 8]]},
						{"id": "r2_sealed", "y": 0.0, "poly": [[4, 0], [8, 0], [8, 4], [4, 4]]},
					]
				}],
				"walls": [],
				"links": [
					# Interior door between r0 (z=3.5) and r1 (z=4.5)
					{"id": "door_01", "kind": "door", "at": [2.0, 0.0, 4.0], "from": [2.0, 0.0, 3.5], "to": [2.0, 0.0, 4.5]},
					# Exterior door from yard (z=-0.6) into r0 (z=0.6)
					{"id": "door_ext", "kind": "door", "at": [2.0, 0.0, 0.0], "from": [2.0, 0.0, -0.6], "to": [2.0, 0.0, 0.6]},
				]
			}]
		}
	}
	var holder := Node3D.new()
	root.add_child(holder)
	var rep := KratorWorld.records(holder, world_dict, by_id)
	var rdefs: Array = holder.get_meta("rooms", [])
	var ipool := holder.get_node_or_null("Records/InteriorLampPool") as KratorLampPool
	var rm_r0 := KratorLampPool.room_at(rdefs, Vector3(102.0, 11.5, -52.0))
	var rm_r2 := KratorLampPool.room_at(rdefs, Vector3(102.0, 11.5, -56.0))
	var rm_out := KratorLampPool.room_at(rdefs, Vector3(95.0, 11.5, -52.0))
	ok(int(rep.get("rooms", 0)) == 3 and int(rep.get("interior_lamps", 0)) == 2 and ipool != null
		and rm_r0 == "bld_test:r0" and rm_r2 == "bld_test:r2_sealed" and rm_out == "",
		"KratorWorld.records builds rotated room_defs (%d rooms) + InteriorLampPool (%d bulbs) and classifies rotated world points" % [rdefs.size(), int(rep.get("interior_lamps", 0))])
	var sealed_pick := _ids(KratorLampPool.pick_rooms(ipool.lamps, Vector3(102.0, 11.5, -54.2), 21.0, A, 8, rdefs))
	var linked_pick := _ids(KratorLampPool.pick_rooms(ipool.lamps, Vector3(102.0, 11.5, -53.8), 21.0, A, 8, rdefs))
	ok(sealed_pick.is_empty() and linked_pick == ["fix_l0", "fix_l1"],
		"negative + positive across rotated wall: r2_sealed 20 cm across wall gets [] while r0 gets [fix_l0, portal fix_l1] (%s)" % str(linked_pick))

	holder.free()
	A.free()
	_done = true
	print("room lamp pool: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(0 if fails == 0 else 1)
