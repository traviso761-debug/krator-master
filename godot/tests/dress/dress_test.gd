# The dressing (GODOT-LOOK-PLAN.md step 7: M11 decals, P7 underfoot, P8 the sward). Headless: the roads' marks from a
# case's road records (krator/kdecals.gd), the decal maps, the pool; the underfoot meshes and the switch that leaves the
# sward as it was (krator/world_grass.gd). Each check has a negative.
#   godot --headless --path godot --script res://tests/dress/dress_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


class StubStream extends Node3D:
	var index := {}
	var origin := [0.0, 0.0, 0.0]
	var places_open := {}
	func height_at(_x: float, _z: float) -> float:
		return 5.0
	func local(x: float, y: float, z: float) -> Vector3:
		return Vector3(x, y, z)


func _initialize() -> void:
	var D := KratorDecals
	# 1. the roads' marks: a straight 700 m link road and a village street, [x, z, y] a vertex
	var link := {"id": "a/link/b", "kind": "link", "pts": []}
	for i in 36:
		(link["pts"] as Array).append([float(i) * 20.0, 0.0, 5.0])
	var street := {"id": "v/street", "kind": "village", "pts": [[0.0, 300.0, 5.0], [200.0, 300.0, 5.0]]}
	var at := Vector3(350.0, 5.0, 0.0)
	var m1 := D.road_marks([link, street], at, 100.0)
	var m2 := D.road_marks([link, street], at, 100.0)
	var kinds := {}
	var on_road := true
	var spaced := true
	for m in m1:
		kinds[m["kind"]] = int(kinds.get(m["kind"], 0)) + 1
		on_road = on_road and absf((m["at"] as Vector3).z) < 1.0 and absf((m["at"] as Vector3).x - 350.0) < 165.0
	ok(m1.size() >= 30 and m1.size() <= 45 and on_road, "a road within reach carries a mark about every %d m (%d on 280 m of it), each on the road" % [int(D.ROAD_STEP), m1.size()])
	ok(JSON.stringify(m1) == JSON.stringify(m2), "the same road wears the same marks every time")
	ok(int(kinds.get("rut", 0)) > int(kinds.get("puddle", 0)) and int(kinds.get("puddle", 0)) > 0 and int(kinds.get("rut", 0)) > int(kinds.get("worn", 0)), "a link road is mostly rutted, with puddles and a few worn patches (%s)" % JSON.stringify(kinds))
	var sm := D.road_marks([street], Vector3(100.0, 5.0, 300.0), 100.0)
	var s_rut := 0
	for m in sm:
		s_rut += 1 if m["kind"] == "rut" else 0
	ok(sm.size() > 10 and s_rut == 0, "negative: a village street is trodden, never rutted")
	ok(D.road_marks([link], Vector3(350.0, 5.0, 5000.0), 100.0).is_empty(), "negative: a road out of reach gives none")
	var other := link.duplicate(true)
	other["id"] = "c/link/d"
	ok(JSON.stringify(D.road_marks([other], at, 100.0)) != JSON.stringify(D.road_marks([link], at, 100.0)), "negative: another road wears differently")

	# 2. the maps
	var all_ok := true
	var report := []
	for k in D.KINDS:
		var im: Dictionary = D.images(k, 64)
		var alb: Image = im["albedo"]
		var cover := 0
		var edge_a := 0.0
		for y in 64:
			for x in 64:
				var a := alb.get_pixel(x, y).a
				cover += 1 if a > 0.1 else 0
				if x == 0 or y == 0 or x == 63 or y == 63:
					edge_a = maxf(edge_a, a)
		all_ok = all_ok and cover > 60 and cover < 64 * 64 * 0.8 and edge_a < 0.05 and alb.has_mipmaps()
		report.append("%s %d%%" % [k, cover * 100 / 4096])
	ok(all_ok, "each kind's map covers part of its square and fades to nothing at the edge (%s)" % ", ".join(PackedStringArray(report)))
	ok((D.images("puddle", 32)["orm"] as Image).get_pixel(16, 16).g < 0.1 and (D.images("rut", 32)["orm"] as Image).get_pixel(16, 16).g > 0.5, "a puddle's ORM is smooth; a rut's is not")

	# 3. the pool
	var S := StubStream.new()
	S.index = {"roads": [link, street]}
	root.add_child(S)
	var dec := D.make({"decals": 6})
	root.add_child(dec)
	dec.update(S, at, 1.0)
	var shown := 0
	var puddles := 0
	var far_ok := true
	for c in dec.get_children():
		var dc := c as Decal
		if dc.visible:
			shown += 1
			puddles += 1 if dc.texture_orm != null else 0
			far_ok = far_ok and dc.position.distance_to(at) < D.FADE_AT + D.FADE_LEN + 4.0 and dc.distance_fade_enabled and dc.distance_fade_begin == D.FADE_AT
	ok(shown == 6 and int(dec.stats["drawn"]) == 6 and far_ok and absf((dec.get_child(0) as Decal).position.y - 5.0) < 1e-6, "the pool draws the nearest marks up to its size, on the ground, each faded out by %d m" % int(D.FADE_AT + D.FADE_LEN))
	ok(puddles == 0, "negative: dry, no puddle is drawn")
	var by_puddle := at
	for m in m1:
		if m["kind"] == "puddle":
			by_puddle = m["at"]
	dec.wet = 1.0
	dec._since = 1e9
	dec.max_decals = 40
	dec.update(S, by_puddle, 1.0)
	puddles = 0
	for c in dec.get_children():
		puddles += 1 if (c as Decal).visible and (c as Decal).texture_orm != null else 0
	ok(puddles > 0, "wet, the puddles stand (%d near)" % puddles)
	dec.add("soot", at + Vector3(2, 3, 0), 0.0, Vector3(1, 0.5, 2))
	dec.add("nonsense", at, 0.0, Vector3.ONE)
	ok(dec.marks.size() == 1, "add() takes a mark of a known kind from a record, and no other")
	# leaks under the sills an export marks (core/export's marks section, read from a world's meta)
	var world := Node3D.new()
	var recs := []
	for i in 60:
		recs.append({"kind": "sill", "at": [350.0 + i * 0.5, 7.0, 3.0], "yaw": 0.4, "w": 0.9, "key": "house"})
	recs.append({"kind": "smoke", "at": [350.0, 12.0, 3.0], "r": 0.3, "source": "chimney"})
	world.set_meta("marks", recs)
	S.add_child(world)
	var sills := KratorAir.marks_of(S, "sill")
	var leaks := D.sill_marks(sills)
	var lk_ok := leaks.size() > 8 and leaks.size() < 35
	for l in leaks:
		lk_ok = lk_ok and l["kind"] == "leak" and bool(l["wall"]) and (l["at"] as Vector3).y < 7.0 and absf((l["size"] as Vector3).x - 0.9) < 1e-5 and (l["size"] as Vector3).z <= 1.2
	ok(sills.size() == 60 and lk_ok and JSON.stringify(leaks) == JSON.stringify(D.sill_marks(sills)), "about one sill in three stains (%d of 60), the same ones each time, a streak hung below the sill on the wall" % leaks.size())
	ok(KratorAir.marks_of(S, "smoke").size() == 1 and D.sill_marks(KratorAir.marks_of(S, "smoke")).size() <= 1 and KratorAir.marks_of(S, "soot").is_empty(), "negative: marks are read by kind")
	S.places_open = {"p": true}
	dec._since = 1e9
	dec.max_decals = 60
	dec.update(S, Vector3(355.0, 6.0, 3.0), 1.0)
	var on_wall := 0
	for c in dec.get_children():
		var dc := c as Decal
		if dc.visible and absf(dc.basis.y.y) < 0.01 and absf(dc.basis.z.y + 1.0) < 0.01:
			on_wall += 1
	ok(on_wall > 0, "a leak's decal projects along the wall's normal and runs down it (%d near)" % on_wall)
	var none := D.make({"decals": 0})
	root.add_child(none)
	none.update(S, at, 1.0)
	ok(none.get_child_count() == 0, "negative: a tier with no decals makes none")

	# 4. underfoot and the sward's switch
	var G := KratorWorldGrass
	var tris := {}
	var petals := false
	for k in G.UNDER_KINDS:
		var mesh := G.under_mesh(k)
		tris[k] = KratorCells.mesh_tris(mesh)
		var col = mesh.surface_get_arrays(0)[Mesh.ARRAY_COLOR]
		if k == "flower":
			for c in (col as PackedColorArray):
				petals = petals or c.r > 0.5
		var box := mesh.get_aabb()
		if box.size.x > 0.5 or box.size.y > 0.25 or box.size.z > 0.5:
			tris[k] = -1
	ok(int(tris["stone"]) > 8 and int(tris["twig"]) > 8 and int(tris["litter"]) == 6 and int(tris["flower"]) > 8 and petals, "four small meshes underfoot, none over half a metre (%s); a flower's petals are marked" % JSON.stringify(tris))
	var total := 0
	for k in tris:
		total += int(tris[k])
	ok(total < 120, "negative: together they are %d triangles: geometry at arm's length, not a second forest" % total)
	ok(G.dress == false, "negative: with no look applied the dressing is off, and the sward is placed as it was")
	var stream := KratorWorldStream.new()
	KratorLook.apply_stream(KratorLook.tier("high"), stream)
	var on := G.dress
	KratorLook.apply_stream(KratorLook.tier("legacy"), stream)
	ok(on and not G.dress, "the high tier turns it on and the legacy tier off")
	stream.free()
	var gsrc := FileAccess.get_file_as_string("res://krator/world_grass.gd")
	var ush := FileAccess.get_file_as_string("res://shaders/underfoot.gdshader")
	ok(gsrc.contains("elif dress:") and gsrc.contains("_populate_under(stream, cam_reg, ox, oy, oz) if dress") and gsrc.contains("SHADOW_CASTING_SETTING_OFF") and ush.contains("atm_wet") and ush.contains("smoothstep(fade_start, fade_end"),
		"the sward's bare patches and the underfoot ring sit behind the switch; nothing underfoot casts a shadow, and it shrinks away at the ring's edge")
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
