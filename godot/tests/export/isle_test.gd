# P8 (settlements/isle-demo/PLAN.md sections 7 and 9): a town's centre exported through core/export opens in
# Godot with its buildings, its registry, its citizens walking and its canoes. The case is written by
#   python3 tools/harness.py export settlements/isle-demo/dist/isle-city.html --query "?town=Kautoa&simAt=362" --out godot/data/world-isle-kautoa --box=320,780,820,1220
# (the sim run to 05:55, people on their way to work) and imported by krator/world_import.gd, the citizens and canoes by
# krator/isle_sim.gd (KratorIsleSim). Each check has a negative.
#   godot --headless --path godot --script res://tests/export/isle_test.gd     exits 0 when every check passes
extends SceneTree

const KTags := preload("res://tests/tags/ktags.gd")
var CASE := "res://data/world-isle-kautoa/"   # -- --case=world-isle-valapo --town=valapo: Valapo's case
var TOWN := "kautoa"
const POS_TOL := 1e-4    # metres: a drawn instance against world.glb's translation
const AT_TOL := 0.02     # metres: a piece against its lot's record, a sim place against its record (the page rounds to 1 cm)
const POSE_TOL := 0.002  # metres: KSim.pose against the page's SIM.pose
const H_TOL := 0.0005    # radians

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--case="):
			CASE = "res://data/%s/" % a.trim_prefix("--case=")
		if a.begins_with("--town="):
			TOWN = a.trim_prefix("--town=")
	print("case %s, town %s" % [CASE, TOWN])
	if not FileAccess.file_exists(CASE + "world.json"):
		print("FAIL no case: run python3 tools/harness.py export settlements/isle-demo/dist/isle-city.html --query \"?town=Kautoa&simAt=362\" --out godot/data/world-isle-kautoa --box=320,780,820,1220")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "world.json")
	var w := KratorWorld.build(CASE + "world.json")
	root.add_child(w)
	var rep: Dictionary = w.get_meta("report")
	ok(d["format"] == "krator-world" and not rep["gaps"].has("load"), "world.json and world.glb load (%d ms)" % rep["counts"]["load_ms"])
	ok((d["errors"] as Array).is_empty(), "the page reported no section errors")
	var bad_sec := []
	for s in ["items", "buckets", "materials", "textures", "registry", "terrain", "sim", "city", "fixtures", "stage"]:
		if d["sections"][s]["status"] != "ok":
			bad_sec.append(s)
	ok(bad_sec.is_empty(), "sections filled: items, buckets, materials, textures, registry, terrain, sim, city, fixtures, stage%s" % ("" if bad_sec.is_empty() else " (NOT: %s)" % ", ".join(bad_sec)))
	ok(d["sections"]["interiors"]["status"] == "empty" and d["sections"]["furniture"]["status"] == "empty",
		"interiors and furniture answered empty (the city page draws the kit's buildings as shells, unfurnished)")
	ok(w.has_meta("stage") and (w.get_meta("stage") as Dictionary).get("format") == "krator-stage" and (d["stage"].get("sky") is Dictionary),
		"the stage (light, fog, the sky panorama, the ground's look) is there")
	var tags: Dictionary = w.get_meta("tags", {})

	# 1. the buildings: every MultiMesh and instance Godot draws stands where world.glb says; every kit piece's instance is
	#    owned by its lot's record, which stands where the piece does
	var items := w.get_node("Items").get_children()
	var bytes := FileAccess.get_file_as_bytes(CASE + "world.glb")
	var jl := bytes.decode_u32(12)
	var J: Dictionary = JSON.parse_string(bytes.slice(20, 20 + jl).get_string_from_utf8())
	var bin0 := 20 + jl + 8
	var inst := 0
	var misplaced := 0
	var worst := 0.0
	var kit_n := 0
	var kit_ok := 0
	var kit_bad: Array = []
	for k in items.size():
		var n: MultiMeshInstance3D = items[k]
		var it: Dictionary = d["items"][k]
		var mm := n.multimesh
		inst += mm.instance_count
		var node: Dictionary = J["nodes"][_node_index(J, str(it["glb"]["node"]))]
		var T := _acc(J, bytes, bin0, int(node["extensions"]["EXT_mesh_gpu_instancing"]["attributes"]["TRANSLATION"]))
		var buf := mm.buffer
		var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
		for j in mm.instance_count:
			var e := (n.position + Vector3(buf[j * stride + 3], buf[j * stride + 7], buf[j * stride + 11]) - Vector3(T[j * 3], T[j * 3 + 1], T[j * 3 + 2])).length()
			worst = max(worst, e)
			if e > POS_TOL:
				misplaced += 1
		if it["kit"] == "isle":
			continue
		var ow: Array = it.get("owners", [])
		for j in mm.instance_count:
			kit_n += 1
			var o = ow[j] if j < ow.size() else null
			var r: Dictionary = tags.get(o, {}) if o != null else {}
			if r.is_empty() or absf(float(r["at"][0]) - T[j * 3]) > AT_TOL or absf(float(r["at"][2]) - T[j * 3 + 2]) > AT_TOL:
				if kit_bad.size() < 3:
					kit_bad.append("%s #%d: %s" % [it["id"], j, str(o)])
				continue
			kit_ok += 1
	ok(items.size() == d["items"].size() and inst == int(d["stats"]["instances"]), "%d MultiMeshes, %d instances (the page's count: %d)" % [items.size(), inst, int(d["stats"]["instances"])])
	ok(misplaced == 0, "every drawn instance stands at world.glb's translation (worst %s m)" % str(worst))
	ok(kit_n > 0 and kit_ok == kit_n, "every kit piece's instance is owned by its lot's record, standing where the piece does: %d of %d%s" % [kit_ok, kit_n, ("; " + ", ".join(kit_bad)) if not kit_bad.is_empty() else ""])

	# 2. the registry: every record's uid recomputed in GDScript (KTags.uid of its class, key and position)
	var nrec := 0
	var ubad := 0
	for id in tags:
		var r: Dictionary = tags[id]
		nrec += 1
		if KTags.uid(r["class"], r["key"], r["at"]) != r["uid"]:
			ubad += 1
	ok(nrec == d["registry"]["records"].size() and ubad == 0, "every registry record's uid recomputed: %d records, %d differ" % [nrec, ubad])
	var r0: Dictionary = tags.values()[0]
	ok(KTags.uid(r0["class"], r0["key"], [float(r0["at"][0]) + 0.2, r0["at"][1], r0["at"][2]]) != r0["uid"], "negative: a record moved 20 cm has another uid")

	# 2b. the doors: one for every building and landmark in the case, at its front face (local +z) at the ground, its uid
	#     recomputed, a building's under its Building node; most within reach of the walking graph's entry the sim uses
	var recs: Dictionary = rep.get("records", {})
	var FX: Array = d["fixtures"]["records"]
	var hosts := 0
	var bld := 0
	for id in tags:
		var hr: Dictionary = tags[id]
		if (hr["class"] == "building" or hr["class"] == "landmark") and hr.get("size") is Array:
			hosts += 1
			if hr["class"] == "building":
				bld += 1
	var fx_bad: Array = []
	var fuid := 0
	var near := 0
	for fr in FX:
		var pr: Dictionary = tags.get(fr["parent"], {})
		if pr.is_empty():
			fx_bad.append(str(fr["id"]))
			continue
		var dx := float(fr["at"][0]) - float(pr["at"][0])
		var dz := float(fr["at"][2]) - float(pr["at"][2])
		var c := cos(float(pr.get("ry", 0.0)))
		var sn := sin(float(pr.get("ry", 0.0)))
		if absf(dx * c - dz * sn) > 0.01 or absf(dx * sn + dz * c - float(pr["size"][1]) / 2.0) > 0.01:
			fx_bad.append(str(fr["id"]))
		if KTags.uid("fixture", fr["key"], fr["at"]) == fr["uid"]:
			fuid += 1
		var e = fr.get("entry")
		if e is Dictionary and Vector2(float(e["x"]) - float(fr["at"][0]), float(e["z"]) - float(fr["at"][2])).length() < 25.0:
			near += 1
	ok(FX.size() == hosts and fx_bad.is_empty(), "a door for each of the %d buildings and landmarks, at its front face%s" % [hosts, ("; OFF: " + ", ".join(fx_bad.slice(0, 3))) if not fx_bad.is_empty() else ""])
	ok(fuid == FX.size(), "every door's uid recomputed: %d of %d" % [fuid, FX.size()])
	ok(int(recs.get("fixtures_parented", 0)) == bld, "every building's door is a child of its Building node: %d of %d" % [int(recs.get("fixtures_parented", 0)), bld])
	ok(near * 5 >= FX.size() * 4, "most doors are within 25 m of the walking graph's entry the sim's people use: %d of %d" % [near, FX.size()])
	var fk: Dictionary = (FX[0] as Dictionary).duplicate(true)
	fk["at"] = [float(fk["at"][0]) + 0.2, fk["at"][1], fk["at"][2]]
	ok(KTags.uid("fixture", fk["key"], fk["at"]) != fk["uid"], "negative: a door moved 20 cm has another uid")

	# 3. the sim joins the registry: every place of the town whose record is in the case is that record, at it (the town's frame)
	var S: Dictionary = d["sim"]
	var F: Dictionary = {}
	for T2 in S["settlements"]:
		if T2["id"] == TOWN:
			F = T2["frame"]
	var joined := 0
	var jbad: Array = []
	for p in S["places"]:
		if p.get("settlement") != TOWN or not (p.get("tags") is Dictionary) or not tags.has(p["tags"].get("tag")):
			continue
		var r: Dictionary = tags[p["tags"]["tag"]]
		if r["key"] != p["tags"].get("key") or absf(float(p["x"]) - float(F["x"]) - float(r["at"][0])) > AT_TOL or absf(float(p["z"]) - float(F["z"]) - float(r["at"][2])) > AT_TOL:
			if jbad.size() < 3:
				jbad.append("%s -> %s" % [p["id"], r["id"]])
			continue
		joined += 1
	ok(joined > 0 and jbad.is_empty(), "every sim place of a record in the case is that record, at it: %d joined%s" % [joined, ("; OFF: " + ", ".join(jbad)) if not jbad.is_empty() else ""])
	var ppl := {}
	for a in S["actors"]:
		if a.get("settlement") != null and not a.get("driven", false):   # driven: the carts
			ppl[a["settlement"]] = int(ppl.get(a["settlement"], 0)) + 1
	var pc: Array = []
	var pok := true
	for T3 in S["settlements"]:
		pc.append("%s %d of %d" % [T3["id"], int(ppl.get(T3["id"], 0)), int(T3["people"])])
		pok = pok and int(ppl.get(T3["id"], 0)) == int(T3["people"])
	ok(pok, "every town's people are its actors: %s" % ", ".join(pc))

	# 4. the citizens: the motion block replayed by KSim.pose against the page's SIM.pose rows, then drawn
	var M: Dictionary = S["motion"]
	var A: Array = M["actors"]
	var rows := 0
	var moving := 0
	var pbad := 0
	var pworst := 0.0
	for r in M["rows"]:
		var o := KSim.pose(M, A[int(r[1])], float(r[0]))
		rows += 1
		if (1 if o["hidden"] else 0) != int(r[2]) or (1 if o["moving"] else 0) != int(r[3]):
			pbad += 1
			continue
		moving += int(r[3])
		var e := Vector3(o["x"] - float(r[4]), o["y"] - float(r[5]), o["z"] - float(r[6])).length()
		pworst = maxf(pworst, e)
		if e > POSE_TOL or absf(angle_difference(o["h"], float(r[7]))) > H_TOL:
			pbad += 1
	ok(rows > 0 and moving > 0 and pbad == 0, "the citizens' poses: %d rows of %d people (%d moving) replayed, %d differ (worst %.5f m)" % [rows, A.size(), moving, pbad, pworst])
	var M2: Dictionary = M.duplicate(true)
	for a in M2["actors"]:
		if a.get("task") is Dictionary:
			for L in a["task"]["legs"]:
				L["speed"] = float(L["speed"]) * 1.1
	var neg := 0
	for r in M["rows"]:
		if int(r[3]) == 1:
			var o2 := KSim.pose(M2, M2["actors"][int(r[1])], float(r[0]))
			if Vector3(o2["x"] - float(r[4]), o2["y"] - float(r[5]), o2["z"] - float(r[6])).length() > POSE_TOL:
				neg += 1
	ok(neg > 0, "negative: every leg 10%% faster, %d of %d moving rows differ" % [neg, moving])
	var t0 := float(M["times"][0])
	var cn := KratorIsleSim.build_citizens(S, w, t0)
	var shown := 0
	var inbox := 0
	var B: Array = M["box"]
	for c in KratorIsleSim.citizens(S, t0):
		if not c["hidden"]:
			shown += 1
			if c["x"] >= B[0] - 200 and c["x"] < B[2] + 200 and c["z"] >= B[1] - 200 and c["z"] < B[3] + 200:
				inbox += 1
	ok(cn.multimesh.instance_count == shown and shown > 0 and inbox > 0, "the citizens drawn at the export's moment: %d stand-ins (%d outdoors near the case)" % [shown, inbox])

	# 5. the canoes: every carrier of every line docked at its settlement's canoe stop or at sea, its cargo the route's
	var cs := KratorIsleSim.canoes(S)
	var docked := 0
	var sea := 0
	var sea_cargo := 0
	var cbad: Array = []
	for c in cs:
		if c["state"] == "docked":
			docked += 1
			if c["place"] == null:
				cbad.append("%s docked at %s with no canoe stop" % [c["id"], str(c["settlement"])])
		else:
			sea += 1
			sea_cargo += int(c["cargo"])
	var route_sea := 0
	for R in S["routes"]:
		for k in R["sea"]:
			for g in R["sea"][k]:
				route_sea += int(R["sea"][k][g])
	ok(cs.size() > 0 and cbad.is_empty() and sea_cargo == route_sea, "the canoes: %d carriers, %d docked at their canoe stop, %d at sea carrying %d (the routes say %d)%s" % [cs.size(), docked, sea, sea_cargo, route_sea, ("; " + ", ".join(cbad)) if not cbad.is_empty() else ""])
	var hulls := KratorIsleSim.build_canoes(S, w, TOWN)
	var kd := cs.filter(func(c): return c["state"] == "docked" and c["settlement"] == TOWN).size()
	ok(hulls.size() == kd, "the canoes docked at %s drawn at its canoe stop: %d (the export's moment)" % [TOWN, hulls.size()])
	# a carrier docked at Kautoa (the moment holds none: all three at sea at 06:02) draws one hull at Kautoa's canoe stop
	var Sd: Dictionary = S.duplicate(true)
	Sd["routes"][0]["carriers"][0]["at"] = TOWN
	var hd := KratorIsleSim.build_canoes(Sd, w, TOWN)
	var stop_p: Dictionary = {}
	for p in S["places"]:
		if p.get("kind") == "canoe stop" and p.get("settlement") == TOWN:
			stop_p = p
	var want := Vector3(float(stop_p.get("x", 0)) - float(F["x"]), 0.75, float(stop_p.get("z", 0)) - float(F["z"]))
	ok(not stop_p.is_empty() and hd.size() == kd + 1 and hd.any(func(h): return (h.position - want).length() < 1e-3),
		"a canoe docked at %s is drawn at its canoe stop (%.1f, %.1f in the town's frame)" % [TOWN, want.x, want.z])
	var S2: Dictionary = S.duplicate(true)
	S2["routes"][0]["carriers"][0]["cargo"].append({"good": "salt", "n": 5})
	S2["routes"][0]["carriers"][0]["at"] = null
	var cs2 := KratorIsleSim.canoes(S2)
	var c2 := 0
	for c in cs2:
		if c["state"] == "sea":
			c2 += int(c["cargo"])
	ok(c2 != route_sea, "negative: a canoe put to sea with 5 more salt no longer matches the routes (%d against %d)" % [c2, route_sea])

	print("isle case: %d failed" % fails)
	quit(1 if fails > 0 else 0)


static func _node_index(J: Dictionary, name: String) -> int:
	var nodes: Array = J["nodes"]
	for i in nodes.size():
		if nodes[i].get("name") == name:
			return i
	return -1


static func _acc(J: Dictionary, bytes: PackedByteArray, bin0: int, ix: int) -> PackedFloat32Array:
	var a: Dictionary = J["accessors"][ix]
	var v: Dictionary = J["bufferViews"][int(a["bufferView"])]
	var comps: int = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]]
	var start := bin0 + int(v.get("byteOffset", 0)) + int(a.get("byteOffset", 0))
	return bytes.slice(start, start + int(a["count"]) * comps * 4).to_float32_array()
