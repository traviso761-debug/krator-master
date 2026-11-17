# M7 "one world" (GODOT-PLAN.md section 8; the owner, 2026-11-16: "set up oidong/high rift/strongbow as a godot test"): the
# region openworld/oidong-highrift streams in Godot from the scale model's ground, its settlements open at 1:1 at their own
# places between the chunks, the roads join them, and the valley's books balance after a replayed week. The case is
#   python3 tools/harness.py lock -- python3 openworld/oidong-highrift/tools/godot_case.py   (index.json, chunks/, places/)
#   node openworld/oidong-highrift/tools/export-sim.js                                       (sim.json, golden.json)
# into godot/data/world-oidong-highrift, read by krator/world_stream.gd (KratorWorldStream) and krator/world_import.gd.
# Each check has a negative.
#   godot --headless --path godot --script res://tests/export/oidong_world_test.gd     exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

const KTags := preload("res://tests/tags/ktags.gd")
var CASE := "res://data/world-oidong-highrift/"
const LOAD_R := 20000.0   # metres: a chunk within this of the camera is loaded
const KEEP_R := 28000.0   # metres: a loaded chunk farther than this is freed (the gap keeps the edge from flickering)
const WALK := 2000.0      # metres: the camera's step along the road
const HELD_MAX := 16      # chunks: the most a 16 km grid can hold within KEEP_R of one point (a 72 km square: 5 x 5 = 25 cells; the road's band holds far fewer)
const GRID_TOL := 1e-3    # metres: the drawn ground's heights against the page's samples (float32 at 2,000-6,000 m keeps ~0.5 mm)
const JOIN_TOL := 1e-3    # metres: two chunks' samples on their shared edge
const BOOK_TOL := 1.0     # units: a settlement's books, as SIM.ledger's own tolerance (the export used tol 1)

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--case="):
			CASE = "res://data/%s/" % a.trim_prefix("--case=")
	if not FileAccess.file_exists(CASE + "index.json"):
		print("FAIL no case: run python3 tools/harness.py lock -- python3 openworld/oidong-highrift/tools/godot_case.py")
		quit(1)
		return
	var S := KratorWorldStream.open(CASE + "index.json")
	root.add_child(S)
	var I: Dictionary = S.index
	ok(I.get("format") == "krator-world-stream" and int(I.get("version", 0)) == 1 and (I["chunk"]["list"] as Array).size() > 0
		and (I["places"] as Array).size() == 5 and (I["roads"] as Array).size() > 0,
		"index.json: region %s, plan %s, %d chunks of %d m, %d places, %d roads" % [I.get("region"), I.get("plan"),
		I["chunk"]["list"].size(), int(I["chunk"]["size"]), I["places"].size(), I["roads"].size()])
	var route := _route(S)
	_stream(S, route)
	_stream_negative(route)
	_places(S)
	_roads(S)
	_books()
	print("\n%s: %d failed" % ["FAILED" if fails else "OK", fails])
	quit(1 if fails else 0)


# the route the camera walks: the Sultanate's road from Longsong to Strongbow (the index's route), Longsong first
func _route(S: KratorWorldStream) -> PackedVector2Array:
	var R: Dictionary = S.road(S.index["route"]["link"])
	var pts: Array = R.get("pts", [])
	if R.get("from") != S.index["route"]["from"]:
		pts = pts.duplicate()
		pts.reverse()
	var out := PackedVector2Array()
	var left := 0.0
	for k in pts.size():
		var p := Vector2(float(pts[k][0]), float(pts[k][1]))
		if k == 0:
			out.append(p)
			continue
		var q := Vector2(float(pts[k - 1][0]), float(pts[k - 1][1]))
		var d := p.distance_to(q)
		var t := WALK - left
		while t <= d:
			out.append(q.lerp(p, t / d))
			t += WALK
		left = d - (t - WALK)
	out.append(Vector2(float(pts[-1][0]), float(pts[-1][1])))
	return out


# 1. the region streams: the camera walks the road; the chunk under it is always loaded, every chunk on the road loads
#    and is freed again once left behind, and no more than HELD_MAX are held at once. The ground of each chunk as it
#    loads is its samples (the drawn mesh and KData.height_at), and two neighbours agree on their shared edge.
func _stream(S: KratorWorldStream, route: PackedVector2Array) -> void:
	var ever := {}
	var unloads := 0
	var held_max := 0
	var misses := 0
	var vmax := 0.0
	var hmax := 0.0
	var xyerr := 0.0
	var checked := 0
	var pmax := 0.0
	var pn := 0
	var far := 0.0   # the farthest a held chunk's node stands from the stream's origin
	for at in route:
		var r := S.update(at, LOAD_R, KEEP_R)
		unloads += (r["unloaded"] as Array).size()
		held_max = max(held_max, S.chunks.size())
		for id in S.chunks:
			far = max(far, Vector2((S.chunks[id] as Node3D).position.x, (S.chunks[id] as Node3D).position.z).length())
		if S.covering(at.x, at.y) == "":
			misses += 1
		for id in r["loaded"]:
			ever[id] = true
			var g := _ground_check(S.chunks[id])
			vmax = max(vmax, g["vmax"])
			hmax = max(hmax, g["hmax"])
			xyerr = max(xyerr, g["xy"])
			pmax = max(pmax, g["pmax"])
			pn += g["probes"]
			checked += 1
	var n: int = S.index["chunk"]["list"].size()
	ok(ever.size() == n and misses == 0, "the camera walked the road %s (%d steps of %d m): every one of its %d chunks loaded, the chunk under the camera every step (%d misses)"
		% [S.index["route"]["link"], route.size(), int(WALK), n, misses])
	ok(unloads > 0 and held_max <= HELD_MAX, "chunks left behind are freed: %d unloads, at most %d held at once (limit %d)" % [unloads, held_max, HELD_MAX])
	var reach := KEEP_R + 0.75 * float(S.index["chunk"]["size"]) + KratorWorldStream.REBASE * 1.5
	ok(S.rebases > 0 and far <= reach, "a floating origin: the stream moved its origin %d times along the road, so every held chunk's node stood within %.0f m of it (limit %.0f; the road runs %.0f km from the region's origin)"
		% [S.rebases, far, reach, absf(route[route.size() - 1].x) / 1000.0])
	ok(checked == n and vmax <= GRID_TOL and hmax <= GRID_TOL,
		"each chunk's drawn ground passes through the page's samples: %d chunks, heights to %s m, KData.height_at at the samples to %s m" % [checked, str(vmax), str(hmax)])
	print("     between samples (every %d m) the grid's bilinear cells and the page's own WORLD.H differ by up to %.2f m at %d probes; the lattice's x and z land on their samples to %.4f m (each chunk's grid about its own origin)"
		% [int(S.index["chunk"]["step"]), pmax, pn, xyerr])
	# two loaded neighbours: their samples on the shared edge agree (the same WORLD.H at the same points)
	S.update(route[0], 1e9, 1e9)   # every chunk, to compare the pairs
	var pairs := 0
	var emax := 0.0
	var ids: Array = S.chunks.keys()
	for a in ids:
		for b in ids:
			var A: Array = S.chunk_box(a)
			var B: Array = S.chunk_box(b)
			if a == b or not (is_equal_approx(float(A[2]), float(B[0])) and is_equal_approx(float(A[1]), float(B[1]))):   # b east of a
				continue
			pairs += 1
			# the samples themselves (KData.height_at clamps its last column a thousandth of a cell inside the grid)
			var ga: Dictionary = KData.read_json((S.chunks[a] as Node3D).get_meta("case_path"))["terrain"]["grid"]
			var gb: Dictionary = KData.read_json((S.chunks[b] as Node3D).get_meta("case_path"))["terrain"]["grid"]
			var Ha := KData.floats(ga["heights"])
			var Hb := KData.floats(gb["heights"])
			var na := int(ga["nx"])
			var nb := int(gb["nx"])
			if int(ga["nz"]) != int(gb["nz"]) or not is_equal_approx(float(ga["x0"]) + (na - 1) * float(ga["step"]), float(gb["x0"])):
				emax = INF
				continue
			for j in int(ga["nz"]):
				emax = max(emax, absf(Ha[j * na + na - 1] - Hb[j * nb]))
	ok(pairs > 0 and emax <= JOIN_TOL, "neighbours join: %d east-west pairs agree on their shared edge to %s m" % [pairs, str(emax)])
	var neg := 0
	for id in ids:
		var b: Array = S.chunk_box(id)
		var x := float(b[0]) + 0.5 * float(S.index["chunk"]["step"])
		if absf(_h(S.chunks[id], x, float(b[1])) - _h(S.chunks[id], float(b[0]), float(b[1]))) > 1e-3:
			neg += 1
	ok(neg > 0, "negative: half a step along an edge, %d chunks differ" % neg)


func _h(w: Node3D, x: float, z: float) -> float:   # x, z in the region's metres; the ground stands about the case's origin
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	return KData.height_at(w.get_meta("ground", null), x - o[0], z - o[2]) + o[1]


func _ground_check(w: Node3D) -> Dictionary:
	var d: Dictionary = KData.read_json(w.get_meta("case_path"))
	var gr: Dictionary = d["terrain"]["grid"]
	var H := KData.floats(gr["heights"])
	var nx := int(gr["nx"])
	var st := float(gr["step"])
	var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
	var x0: float = float(gr["x0"]) - float(o[0])   # the grid about the case's origin, as the importer builds it
	var z0: float = float(gr["z0"]) - float(o[2])
	var g: Node3D = w.get_meta("ground", null)
	var out := {"vmax": INF, "hmax": INF, "xy": 0.0, "pmax": 0.0, "probes": 0}
	var mi := g as MeshInstance3D
	if mi == null:
		return out
	var vmax := 0.0
	var xy := 0.0
	var seen := 0
	for v in (mi.mesh.surface_get_arrays(0)[Mesh.ARRAY_VERTEX] as PackedVector3Array):
		var fi := (float(v.x) - x0) / st
		var fj := (float(v.z) - z0) / st
		var i := int(roundf(fi))
		var j := int(roundf(fj))
		xy = max(xy, max(absf(fi - i), absf(fj - j)) * st)
		vmax = max(vmax, absf(v.y - H[j * nx + i]))
		seen += 1
	var hmax := 0.0
	var nz := int(gr["nz"])
	for k in H.size():
		if k % nx == nx - 1 or k / nx == nz - 1:
			continue
		hmax = max(hmax, absf(KData.height_at(g, x0 + (k % nx) * st, z0 + (k / nx) * st) - H[k]))
	var pmax := 0.0
	var pts: Array = d["terrain"]["probes"]["points"]
	for p in pts:
		pmax = max(pmax, absf(KData.height_at(g, float(p[0]) - o[0], float(p[1]) - o[2]) - float(p[2])))
	out["vmax"] = vmax if seen == H.size() else INF
	out["hmax"] = hmax
	out["xy"] = xy
	out["pmax"] = pmax
	out["probes"] = pts.size()
	return out


# the negative of the stream: a stream that never frees (keep_r unbounded) holds every chunk it ever loaded
func _stream_negative(route: PackedVector2Array) -> void:
	var N := KratorWorldStream.open(CASE + "index.json")
	root.add_child(N)
	var unloads := 0
	var held_max := 0
	for at in route:
		unloads += (N.update(at, LOAD_R, 1e12)["unloaded"] as Array).size()
		held_max = max(held_max, N.chunks.size())
	ok(not (unloads > 0 and held_max <= HELD_MAX), "negative: a stream that never frees: %d unloads, %d held at the end" % [unloads, held_max])
	root.remove_child(N)
	N.free()


# 2. every settlement opens at its own place: its case (a 1.6 km square round its pin, the page settled at it) loads with
#    every section it should fill and no export error; its pin is in it and on its ground; each item carries a uid per
#    instance; each bucket's records resolve in the place's own registry; every material and map resolves
func _places(S: KratorWorldStream) -> void:
	var regs := {}
	for p in S.index["places"]:
		var w := S.open_place(p["id"])
		var rep: Dictionary = w.get_meta("report")
		var d: Dictionary = w.get_meta("world")
		var tags: Dictionary = w.get_meta("tags", {})
		regs[p["id"]] = tags
		var built: bool = (p["hamlets"] as Array).size() > 0
		# in full a place's villages are buckets (the kit's pieces by material) and its flora items; in massing a box a
		# building, an item (godot_case.py FULL_PLACES)
		var want := ["registry", "terrain"] + ((["items", "buckets", "materials", "textures"] if p.get("detail") == "full" else ["items", "materials"]) if built else [])
		var bad := []
		for s in want:
			if rep["sections"].get(s) != "ok":
				bad.append("%s %s" % [s, rep["sections"].get(s)])
		var box: Array = p["box"]
		var pin: Array = p["pin"]
		var inbox: bool = float(pin[0]) > float(box[0]) and float(pin[0]) < float(box[2]) and float(pin[1]) > float(box[1]) and float(pin[1]) < float(box[3])
		var gh := _h(w, float(pin[0]), float(pin[1]))
		var items := w.get_node_or_null("Items")
		var inst := 0
		var floras := 0
		var uids := {}
		var nouid := 0
		if items:
			for it in items.get_children():
				var mm: MultiMesh = (it as MultiMeshInstance3D).multimesh if it is MultiMeshInstance3D else null
				var n := mm.instance_count if mm else 0
				inst += n
				# a building's instance names the record it stands in (krator_owners); a flora pool's plants name none (no
				# item set: the gap below)
				var own: Array = it.get_meta("krator_owners", [])
				var flora: bool = str((it.get_meta("krator", {}) as Dictionary).get("kit", "")) == "flora"   # 94: itemKit
				if flora:   # a flora pool's plants: a uid each from its item set (_flora_uids checks them)
					floras += n
					if (it.get_meta("krator_records", PackedStringArray()) as PackedStringArray).size() != n or not tags.has(it.get_meta("krator_record", "")):
						nouid += n
				elif own.size() != n:
					nouid += n
				else:
					for o in own:
						if o == null or not tags.has(o):
							nouid += 1
						else:
							uids[o] = true
		var bk := w.get_node_or_null("Buckets")
		var brec := 0
		var bmiss := 0
		if bk:
			for b in bk.get_children():
				for id in b.get_meta("krator_record_ids", []):
					brec += 1
					if not tags.has(id):
						bmiss += 1
		var mgaps := []
		for k in rep["gaps"]:
			if "material" in k or "hook" in k or "texture" in k:
				mgaps.append(k)
		var hams := 0
		for id in tags:
			var r: Dictionary = tags[id]
			if str(id).begins_with("sites:") and r.get("at") is Array:
				hams += 1
		ok(bad.is_empty() and (d.get("errors", []) as Array).is_empty() and inbox and is_finite(gh)
			and (not built or (inst - floras + brec > 0 and nouid == 0 and bmiss == 0 and hams > 0)) and mgaps.is_empty(),
			"%s opens at its own place, its villages %s (pin %.0f, %.0f on its ground at %.1f m): %s; %d building instances each standing in its record (%d records), %d bucket records resolved in its registry, %d plants, materials %s"
			% [p["name"], (p.get("detail", "?") if built else "none drawn by the region"), float(pin[0]), float(pin[1]), gh, "sections ok" if bad.is_empty() else "NOT " + ", ".join(bad),
			inst - floras, uids.size(), brec - bmiss, floras, "resolved" if mgaps.is_empty() else "GAPS " + ", ".join(mgaps)])
	_precision(S)
	_flora_uids(S)
	_arcology(S)
	# negative: a place's bucket records read against another place's registry do not resolve
	var a: Dictionary = S.index["places"][0]
	var b: Dictionary = S.index["places"][1]
	var wa := S.get_node("Places/Place_" + str(a["id"]))
	var miss := 0
	var bka := wa.get_node_or_null("Buckets")
	if bka:
		for bb in bka.get_children():
			for id in bb.get_meta("krator_record_ids", []):
				if not (regs[b["id"]] as Dictionary).has(id):
					miss += 1
	ok(miss > 0, "negative: %s's buckets read against %s's registry, %d records do not resolve" % [a["name"], b["name"], miss])


# 2b. a floating origin: the massing places' buildings (88s villageMass: a box a building, at its record's x, low, z)
#     stand where their records say, to PREC_TOL, from the instance's float32 translation in the case plus the case's
#     origin in double. The negative holds the same positions as float32 in the region's frame (no floating origin):
#     the Order's houses are 120 to 530 km out, where a float32 keeps 1 to 6 cm
const PREC_TOL := 0.005
# an instance's origin from the MultiMesh's buffer (rows of the basis, the origin's component last), as iziz_test.gd reads it
func _inst_origin(b: PackedFloat32Array, mm: MultiMesh, j: int) -> Vector3:
	var o := j * (12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0))
	return Vector3(b[o + 3], b[o + 7], b[o + 11])

# a node's transform in its place's frame (not global_transform: the place's own seat in the stream is far from it in float32)
func _in_place(n: Node, w: Node) -> Transform3D:
	var t := Transform3D.IDENTITY
	var p := n
	while p != null and p != w:
		if p is Node3D:
			t = (p as Node3D).transform * t
		p = p.get_parent()
	return t

func _precision(S: KratorWorldStream) -> void:
	var emax := 0.0
	var nmax := 0.0
	var n := 0
	var out_km := 0.0
	for p in S.index["places"]:
		if p.get("detail") != "massing":
			continue
		var w := S.get_node("Places/Place_" + str(p["id"]))
		var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
		var tags: Dictionary = w.get_meta("tags", {})
		var items := w.get_node_or_null("Items")
		if items == null:
			continue
		for it in items.get_children():
			if not (it is MultiMeshInstance3D):
				continue
			var own: Array = it.get_meta("krator_owners", [])
			var mm: MultiMesh = (it as MultiMeshInstance3D).multimesh
			var buf := mm.buffer   # headless, the dummy renderer answers get_instance_transform with the identity
			for i in mini(own.size(), mm.instance_count):
				var r = tags.get(own[i]) if own[i] != null else null
				if not (r is Dictionary) or r.get("class") != "building" or not (r.get("at") is Array):
					continue
				var t: Vector3 = _in_place(it, w) * _inst_origin(buf, mm, i)   # the importer's LOD chunk node has its own place
				var at: Array = r["at"]
				var e := 0.0
				var e32 := 0.0
				for k in 3:
					e = max(e, absf(float(t[k]) + float(o[k]) - float(at[k])))
					var abs32 := Vector3(float(t.x) + o[0], float(t.y) + o[1], float(t.z) + o[2])   # float32 in the region's frame
					e32 = max(e32, absf(float(abs32[k]) - float(at[k])))
				emax = max(emax, e)
				nmax = max(nmax, e32)
				out_km = max(out_km, absf(float(at[0])) / 1000.0)
				n += 1
	ok(n > 0 and emax <= PREC_TOL, "a floating origin: %d buildings in the Order's houses (to %.0f km out) stand on their records' positions to %.5f m (limit %.3f)" % [n, out_km, emax, PREC_TOL])
	ok(nmax > PREC_TOL, "negative: the same positions held as float32 in the region's frame are off by up to %.3f m" % nmax)


# 2c. the flora's uids (core/world 94: a pool an item set): every plant instance in a place carries the uid
#     KTags.uid('flora', its set's key, its position), recomputed here from the instance's translation plus the case's
#     origin. A place's origin is the flora's own floating origin (core/world 94), so a plant's translation is its row in
#     the page bit for bit and the sum here (row + origin, in doubles) is the page's own position: every uid reproduces.
#     Only a plant within EDGE_TOL of a decimetre's rounding edge would be excused, and the check wants none
const EDGE_TOL := 0.001
func _flora_uids(S: KratorWorldStream) -> void:
	var n := 0
	var same := 0
	var edge := 0
	var bad := 0
	var sets := {}
	var neg := 0
	for p in S.index["places"]:
		var w := S.get_node("Places/Place_" + str(p["id"]))
		var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
		var tags: Dictionary = w.get_meta("tags", {})
		var items := w.get_node_or_null("Items")
		if items == null:
			continue
		for it in items.get_children():
			if str((it.get_meta("krator", {}) as Dictionary).get("kit", "")) != "flora":
				continue
			var set_id: String = it.get_meta("krator_record", "")
			var uids: PackedStringArray = it.get_meta("krator_records", PackedStringArray())
			var mm: MultiMesh = (it as MultiMeshInstance3D).multimesh
			var buf := mm.buffer   # headless, the dummy renderer answers get_instance_transform with the identity
			if not tags.has(set_id) or uids.size() != mm.instance_count:
				bad += mm.instance_count
				continue
			var rec: Dictionary = tags[set_id]
			sets[set_id] = true
			for i in mm.instance_count:
				var t: Vector3 = _in_place(it, w) * _inst_origin(buf, mm, i)   # the importer's LOD chunk node has its own place
				var at := [float(t.x) + o[0], float(t.y) + o[1], float(t.z) + o[2]]
				n += 1
				if KTags.uid("flora", rec["key"], at) == uids[i]:
					same += 1
				else:
					var near := false
					for k in 3:
						var f: float = at[k] * 10.0 + 0.5
						near = near or absf(f - roundf(f)) * 0.1 <= EDGE_TOL
					if near:
						edge += 1
					else:
						bad += 1
				if KTags.uid("flora", rec["key"], [float(t.x), float(t.y), float(t.z)]) != uids[i]:
					neg += 1
	ok(n > 0 and bad == 0 and edge == 0, "the flora's uids: %d plants in %d item sets (a pool each), %d uids recomputed here from position and case origin, %d within %.0f mm of a decimetre's rounding edge, %d otherwise wrong"
		% [n, sets.size(), same, edge, EDGE_TOL * 1000.0, bad])
	ok(neg > n * 0.99, "negative: the same uids from the positions without the case's origin: %d of %d differ" % [neg, n])


# 2d. Strongbow's arcology (godot_case.py ARCOLOGY: kits/ancients' strongbow-today page, from its own branch, as the page
#     draws it from afar) on the region's ground cut to its face (src/48-world-site.js OHR_CUT; tests/test_cut.py proves the
#     cut drains): it opens under Strongbow's place with its meshes and materials, its anchor (the lip at the bay's centre)
#     on the cut's lip level, turned to face west, and the ground stands just under the page: under its plateau within
#     PLATEAU_TOL below the lip, under its floor within FLOOR_TOL below the floor (the lip less the face). Negative: the
#     page unturned (facing south) puts the same points on uncut ground, hundreds of metres over its floor
const PLATEAU_TOL := 1.0   # Strongbow's top is the region's ground at the lip's level (the page draws no plateau of its own), falling 0.5 m to the lip
const FLOOR_TOL := 10.0
func _arcology(S: KratorWorldStream) -> void:
	var p := S.place("sfgtxw10kr")
	var w := S.get_node_or_null("Places/Place_sfgtxw10kr")
	var a: Node3D = w.get_node_or_null("Arcology") if w else null
	if a == null or not (p.get("arcology") is Dictionary):
		ok(false, "Strongbow's arcology: no Arcology node under its place (index: %s)" % str(p.has("arcology")))
		return
	var A: Dictionary = p["arcology"]
	var rep: Dictionary = a.get_meta("report")
	var mgaps := []
	for k in rep["gaps"]:
		if "material" in k or "hook" in k or "texture" in k or "load" in k:
			mgaps.append(k)
	var c: Dictionary = rep["counts"]
	var at: Array = A["at"]
	var lip := float(at[1])
	var fl := lip - float((A.get("cut", {}) as Dictionary).get("lip", 900))
	# the region's ground under a point of the page's frame (u along the face, v ahead of the lip), the page turned by ry
	var under := func(ry: float, u: float, v: float) -> float:
		var q := Basis(Vector3.UP, ry) * Vector3(u, 0, v)
		return _h(w, float(at[0]) + q.x, float(at[2]) + q.z)
	var ry := float(A["ry"])
	var pl := [INF, -INF]
	var fr := [INF, -INF]
	for u in [-600.0, 0.0, 600.0]:
		for v in [-100.0, -300.0, -600.0]:
			var d: float = lip - under.call(ry, u, v)
			pl = [minf(pl[0], d), maxf(pl[1], d)]
		for v in [150.0, 300.0, 500.0]:
			var d: float = fl - under.call(ry, u, v)
			fr = [minf(fr[0], d), maxf(fr[1], d)]
	var face := (a.transform.basis * Vector3(0, 0, 1)).normalized()
	var good: bool = pl[0] >= 0.0 and pl[1] <= PLATEAU_TOL and fr[0] >= 0.0 and fr[1] <= FLOOR_TOL
	ok(int(c["items"]) + int(c["buckets"]) > 0 and mgaps.is_empty() and face.dot(Vector3(-1, 0, 0)) > 0.999 and good,
		"Strongbow's arcology stands at its site (%s on %s): %d items, %d buckets, %d triangles, materials %s; its lip at %.1f m, its face turned west (%.3f); the ground %.1f to %.1f m under its plateau and %.1f to %.1f m under its floor (%.1f m)"
		% [A["page"], A.get("branch"), int(c["items"]), int(c["buckets"]), int(c["triangles"]), "resolved" if mgaps.is_empty() else "GAPS " + ", ".join(mgaps),
		lip, face.dot(Vector3(-1, 0, 0)), pl[0], pl[1], fr[0], fr[1], fl])
	var worst := 0.0
	for u in [-600.0, 0.0, 600.0]:
		for v in [150.0, 300.0, 500.0]:
			worst = maxf(worst, absf(fl - under.call(0.0, u, v)))
	ok(worst > FLOOR_TOL, "negative: the page unturned (facing south) puts its floor up to %.0f m off the ground under it" % worst)


# 3. the roads join them: every link leaves its first site and reaches its second (within the site's reach of its pin),
#    every village road runs from one of its site's villages to the site, and no road has a gap (consecutive points
#    within GAP of each other)
const GAP := 250.0   # metres: the plan's points are 40-60 m apart on a bend and at most 200 m on a straight (core/world 48s)
func _roads(S: KratorWorldStream) -> void:
	var pins := {}
	for p in S.index["places"]:
		pins[p["id"]] = Vector2(float(p["pin"][0]), float(p["pin"][1]))
	var links := 0
	var lbad := []
	var vill := 0
	var vbad := []
	var gaps := 0
	for r in S.index["roads"]:
		var pts: Array = r["pts"]
		for k in range(1, pts.size()):
			if Vector2(float(pts[k][0]), float(pts[k][1])).distance_to(Vector2(float(pts[k - 1][0]), float(pts[k - 1][1]))) > GAP:
				gaps += 1
		var p0 := Vector2(float(pts[0][0]), float(pts[0][1]))
		var p1 := Vector2(float(pts[-1][0]), float(pts[-1][1]))
		if r["kind"] == "link":
			links += 1
			var a: Vector2 = pins.get(r["from"], Vector2.INF)
			var b: Vector2 = pins.get(r["to"], Vector2.INF)
			if not (min(p0.distance_to(a), p1.distance_to(a)) <= 900.0 and min(p0.distance_to(b), p1.distance_to(b)) <= 900.0):
				lbad.append(r["id"])
		else:
			vill += 1
			var s: Vector2 = pins.get(r["to"], Vector2.INF)
			# a village road ends at its site, or on another road of its site where it joins the trunk (48s road.join)
			if min(p0.distance_to(s), p1.distance_to(s)) > 2500.0 and not (_on_road(S, p0, r) or _on_road(S, p1, r)):
				vbad.append(r["id"])
	ok(links > 0 and lbad.is_empty() and vill > 0 and vbad.is_empty() and gaps == 0,
		"the roads join the places: %d links from site to site, %d village roads to their sites or onto their site's trunk, %d gaps over %d m%s"
		% [links, vill, gaps, int(GAP), "" if lbad.is_empty() and vbad.is_empty() else " (NOT: %s)" % ", ".join(lbad + vbad)])
	# negative: a link read as ending at the wrong site
	var wrong := 0
	for r in S.index["roads"]:
		if r["kind"] != "link":
			continue
		var p1 := Vector2(float(r["pts"][-1][0]), float(r["pts"][-1][1]))
		for id in pins:
			if id != r["to"] and id != r["from"] and p1.distance_to(pins[id]) > 900.0:
				wrong += 1
				break
	ok(wrong > 0, "negative: %d links read as ending at another site do not reach it" % wrong)


func _on_road(S: KratorWorldStream, p: Vector2, self_r: Dictionary) -> bool:
	for r in S.index["roads"]:
		if r["id"] == self_r["id"] or r["to"] != self_r["to"] and r["from"] != self_r["to"]:
			continue
		var P: Array = r["pts"]
		for k in range(1, P.size()):
			var a := Vector2(float(P[k - 1][0]), float(P[k - 1][1]))
			var b := Vector2(float(P[k][0]), float(P[k][1]))
			if p.distance_to(Geometry2D.get_closest_point_to_segment(p, a, b)) <= 15.0:
				return true
	return false


# 4. the valley's books after the replayed week (openworld/oidong-highrift/tools/export-sim.js): each settlement's
#    holdings of a good changed by what it made and imported, less what it consumed, spoiled and exported; every load a
#    road shipped landed or is at sea; and the answers are the page's (golden.json: SIM.ledger)
func _books() -> void:
	var D = KData.read_json(CASE + "sim.json")
	var G = KData.read_json(CASE + "golden.json")
	if not (D is Dictionary) or not (G is Dictionary) or D.get("format") != "krator-sim":
		ok(false, "no sim.json or golden.json (node openworld/oidong-highrift/tools/export-sim.js)")
		return
	var V: Dictionary = D["valley"]
	var r := _ledger(V["ledger"]["start"], V["ledger"]["end"])
	var agree := 0
	var differ := 0
	for t in r["towns"]:
		for g in r["towns"][t]:
			var mine: float = r["towns"][t][g]
			var page = G["ledger"]["towns"].get(t, {}).get(g, {}).get("residual")
			if page == null or absf(float(page) - mine) > 1e-6:
				differ += 1
			else:
				agree += 1
	ok(r["bad"] == 0 and r["routes_bad"] == 0 and differ == 0 and G["ledger"]["ok"] == true,
		"the valley's books balance after %d days: %d settlements, %d goods' books, %d road legs; every residual is the page's (%d agree, %d differ)"
		% [int(V["days"]), r["towns"].size(), r["n"], r["legs"], agree, differ])
	# negative: a settlement booked as making 500 more of a good than it did
	var E: Dictionary = (V["ledger"]["end"] as Dictionary).duplicate(true)
	var t0: String = (E["towns"] as Dictionary).keys()[0]
	var g0: String = (E["towns"][t0] as Dictionary).keys()[0]
	E["towns"][t0][g0]["made"] = float(E["towns"][t0][g0]["made"]) + 500.0
	var rn := _ledger(V["ledger"]["start"], E)
	ok(rn["bad"] > 0, "negative: %s booked as making 500 more %s: %d books off" % [t0, g0, rn["bad"]])


func _ledger(a: Dictionary, b: Dictionary) -> Dictionary:
	var out := {"towns": {}, "bad": 0, "n": 0, "legs": 0, "routes_bad": 0}
	for t in b["towns"]:
		var B: Dictionary = b["towns"][t]
		var A: Dictionary = a["towns"].get(t, {})
		out["towns"][t] = {}
		for g in B:
			var rb: Dictionary = B[g]
			var ra: Dictionary = A.get(g, {})
			var d := func(f: String) -> float: return float(rb.get(f, 0.0)) - float(ra.get(f, 0.0))
			var spoiled: float = d.call("spoiled")
			var consumed: float = d.call("used") - d.call("bought") + d.call("eaten") - spoiled
			var res: float = float(rb.get("total", 0.0)) - (float(ra.get("total", 0.0)) + d.call("made") + d.call("imported") - consumed - spoiled - d.call("exported"))
			out["towns"][t][g] = res
			out["n"] += 1
			if absf(res) > BOOK_TOL:
				out["bad"] += 1
	var v := func(o, k: String, g: String) -> float:
		if o is Dictionary and (o as Dictionary).has(k) and (o[k] as Dictionary).has(g):
			return float(o[k][g])
		return 0.0
	for id in b["routes"]:
		var Rb: Dictionary = b["routes"][id]
		var Ra: Dictionary = a["routes"].get(id, {})
		var keys := {}
		for o in [Rb.get("shipped", {}), Rb.get("landed", {}), b["sea"].get(id, {}), a["sea"].get(id, {})]:
			for k in o:
				keys[k] = true
		for k in keys:
			var gs := {}
			for o in [Rb.get("shipped", {}).get(k, {}), Rb.get("landed", {}).get(k, {}), b["sea"].get(id, {}).get(k, {}), a["sea"].get(id, {}).get(k, {})]:
				for g in o:
					gs[g] = true
			for g in gs:
				out["legs"] += 1
				var sh: float = v.call(Rb.get("shipped", {}), k, g) - v.call(Ra.get("shipped", {}), k, g)
				var la: float = v.call(Rb.get("landed", {}), k, g) - v.call(Ra.get("landed", {}), k, g)
				var s0: float = v.call(a["sea"].get(id, {}), k, g)
				var s1: float = v.call(b["sea"].get(id, {}), k, g)
				if absf(s0 + sh - la - s1) > BOOK_TOL:
					out["routes_bad"] += 1
	return out
