# M5 (ROADMAP.md stage 2d, GODOT-PLAN.md section 8): a district of Iziz exported through core/export opens in Godot with
# its records, materials and ground. The case is written by
#   python3 tools/harness.py export settlements/iziz/dist/iziz.html --out godot/data/world-iziz --box <the box in meta.json>
# and imported by krator/world_import.gd (the same importer as M4's tile, extended for a city's records). Each check has a
# negative.
#   godot --headless --path godot --script res://tests/export/iziz_test.gd     exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

const KTags := preload("res://tests/tags/ktags.gd")
var CASE := "res://data/world-iziz/"   # -- --case=<name>: another city case under data/
var SHEET := false   # -- --sheet: a kit's sheet on Iziz's page (--kit; kits/pylon): flat ground and no weather (atmos empty)
const POS_TOL := 1e-4    # metres: a drawn instance or a record node against the position its record gives
const GRID_TOL := 1e-4   # metres: the ground through the page's sampled heights

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	for a in OS.get_cmdline_user_args():
		if a == "--sheet":
			SHEET = true
		if a.begins_with("--case="):
			CASE = "res://data/%s/" % a.trim_prefix("--case=")
	if not FileAccess.file_exists(CASE + "world.json"):
		print("FAIL no case: run python3 tools/harness.py export settlements/iziz/dist/iziz.html --out godot/data/world-iziz --box ...")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "world.json")
	var w := KratorWorld.build(CASE + "world.json")
	root.add_child(w)
	var rep: Dictionary = w.get_meta("report")
	ok(d["format"] == "krator-world" and not rep["gaps"].has("load") and not rep["gaps"].has("format"),
		"world.json and world.glb load (%d ms)" % rep["counts"]["load_ms"])
	ok((d["errors"] as Array).is_empty(), "the page reported no section errors")
	var bad_sec := []
	for s in ["items", "buckets", "materials", "textures", "registry", "terrain", "stage", "fixtures", "atmos"]:
		if rep["sections"].get(s) != "ok" and not (SHEET and s == "atmos" and rep["sections"].get(s) == "empty"):
			bad_sec.append(s)
	ok(bad_sec.is_empty(), "sections filled: %s" % JSON.stringify(rep["sections"]))
	ok(rep["sections"].get("interiors") == "empty" and rep["sections"].get("city") == "stub",
		"interiors answered empty (Iziz's buildings are shells) and city is the Voth branch's stub")
	var tags: Dictionary = w.get_meta("tags", {})

	# 1. every kit instance names its item set and carries a uid recomputed here from world.glb's TRANSLATION
	var items := w.get_node("Items").get_children()
	var bytes := FileAccess.get_file_as_bytes(CASE + "world.glb")
	var jl := bytes.decode_u32(12)
	var J: Dictionary = JSON.parse_string(bytes.slice(20, 20 + jl).get_string_from_utf8())
	var bin0 := 20 + jl + 8
	var inst := 0
	var kit_inst := 0
	var checked := 0
	var differ := 0
	var neg := 0
	var neg_same := 0
	var unresolved := 0
	var misplaced := 0
	var worst := 0.0
	var own_n := 0
	var own_ok := 0
	var own_bad := 0
	var own_null := 0
	for k in items.size():
		var n: MultiMeshInstance3D = items[k]
		var it: Dictionary = d["items"][k]
		var mm := n.multimesh
		inst += mm.instance_count
		var node: Dictionary = J["nodes"][_node_index(J, str(it["glb"]["node"]))]
		var T := _acc(J, bytes, bin0, int(node["extensions"]["EXT_mesh_gpu_instancing"]["attributes"]["TRANSLATION"]))
		var buf := mm.buffer
		var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
		for j in mm.instance_count:   # the instance Godot draws stands where world.glb says
			var e := (n.position + Vector3(buf[j * stride + 3], buf[j * stride + 7], buf[j * stride + 11]) - Vector3(T[j * 3], T[j * 3 + 1], T[j * 3 + 2])).length()
			worst = max(worst, e)
			if e > POS_TOL:
				misplaced += 1
		var ow = n.get_meta("krator_owners", null)
		if ow is Array:
			for o in ow:
				own_n += 1
				if o == null:
					own_null += 1
				elif tags.has(o) and tags[o]["class"] != "part":
					own_ok += 1
				else:
					own_bad += 1
		if it.get("kit") != "iziz":
			continue
		kit_inst += mm.instance_count
		var sid: String = n.get_meta("krator_record", "")
		if not tags.has(sid):
			unresolved += 1
			continue
		var rec: Dictionary = tags[sid]
		var side: PackedStringArray = n.get_meta("krator_records")
		for j in side.size():
			var p := [T[j * 3], T[j * 3 + 1], T[j * 3 + 2]]
			checked += 1
			if KTags.uid(rec["class"], rec["key"], p) != side[j]:
				differ += 1
			if j % 25 == 0:
				neg += 1
				if KTags.uid(rec["class"], rec["key"], [p[0], p[1], p[2] + 0.2]) == side[j]:
					neg_same += 1
	ok(items.size() == d["items"].size() and inst == int(d["stats"]["instances"]) and kit_inst > 0,
		"%d MultiMeshes, %d instances (the page's count: %d), %d of them the kit's" % [items.size(), inst, int(d["stats"]["instances"]), kit_inst])
	ok(unresolved == 0, "every kit MultiMesh's item set resolves in the registry (%d unresolved)" % unresolved)
	ok(checked == kit_inst and differ == 0, "every kit instance's uid recomputed in GDScript from world.glb's TRANSLATION: %d checked, %d differ" % [checked, differ])
	ok(neg > 0 and neg_same == 0, "negative: 20 cm off, %d sampled instances all get another uid (%d kept it)" % [neg, neg_same])
	ok(misplaced == 0, "every drawn instance stands at world.glb's translation (worst %s m, tolerance %s m)" % [str(worst), str(POS_TOL)])
	ok(own_n == inst and own_bad == 0 and own_ok > 0, "owners: %d instances, %d stand in a registered volume that resolves, %d stand in none, %d bad" % [own_n, own_ok, own_null, own_bad])
	ok(not tags.has("bld_99999") and not tags.has("part_00000#999999"), "negative: an owner id the page never made does not resolve")

	# 2. buckets name the volumes their triangles stand in; each resolves and its uid recomputes from its record
	var bnodes := w.get_node("Buckets").get_children()
	var vols := 0
	var vbad := 0
	var tris := 0
	for b in bnodes:
		var u: PackedStringArray = b.get_meta("krator_records", PackedStringArray())
		var bids: PackedStringArray = b.get_meta("krator_record_ids", PackedStringArray())
		for i in u.size():
			vols += 1
			var r: Dictionary = tags.get(bids[i], {})
			if r.is_empty() or r["uid"] != u[i] or KTags.uid(r["class"], r["key"], r["at"]) != u[i]:
				vbad += 1
		var mesh: Mesh = (b as MeshInstance3D).mesh
		for s in mesh.get_surface_count():
			tris += (mesh.surface_get_arrays(s)[Mesh.ARRAY_INDEX] as PackedInt32Array).size() / 3
	ok(vols > 0 and vbad == 0, "buckets name %d records, %d bad" % [vols, vbad])
	ok(tris == int(d["stats"]["triangles"]), "bucket triangles: %d in Godot, %d on the page" % [tris, int(d["stats"]["triangles"])])
	var r0: Dictionary = tags.get(bnodes[0].get_meta("krator_record_ids", PackedStringArray(["?"]))[0], {}) if bnodes.size() > 0 else {}
	ok(not r0.is_empty() and KTags.uid(r0["class"], r0["key"], [float(r0["at"][0]) + 0.2, r0["at"][1], r0["at"][2]]) != r0["uid"],
		"negative: a bucket's record moved 20 cm has another uid")

	# 3. the city's records as nodes: buildings at their record, fixtures children of their building, furniture placed
	var recs: Dictionary = rep.get("records", {})
	var R := w.get_node_or_null("Records")
	var fx := 0
	var fx_par := 0
	var fx_far := 0
	var fx_worst := 0.0
	var kinds := {}
	var b_far := 0
	if R:
		for bn in R.get_children():
			var r: Dictionary = bn.get_meta("krator", {})
			if r.get("class") == "building" and str(bn.name).begins_with("Building_"):
				var at: Array = r["at"]
				if ((bn as Node3D).position - Vector3(at[0], at[1], at[2])).length() > POS_TOL:
					b_far += 1
				for f in bn.get_children():
					var fr: Dictionary = f.get_meta("krator", {})
					fx += 1
					kinds[fr.get("kind")] = kinds.get(fr.get("kind"), 0) + 1
					if fr.get("parent") == r["id"] and tags.has(fr["parent"]) and tags[fr["parent"]]["class"] == "building" and tags.has(fr["id"]):
						fx_par += 1
					var g: Vector3 = (bn as Node3D).transform * (f as Node3D).transform.origin
					var e := (g - Vector3(fr["at"][0], fr["at"][1], fr["at"][2])).length()
					fx_worst = max(fx_worst, e)
					if e > POS_TOL:
						fx_far += 1
	var nfix: int = (d["fixtures"]["records"] as Array).size()
	ok(int(recs.get("buildings", 0)) > 0 and b_far == 0, "%d building records as Building nodes, each at its record (%d off)" % [recs.get("buildings", 0), b_far])
	ok(nfix > 0 and fx == nfix and fx_par == nfix, "%d fixtures (%s), every one a child of its building, its id and its parent resolving in the registry (%d)" % [nfix, JSON.stringify(kinds), fx_par])
	ok(fx_far == 0, "every fixture node stands at its record's position (worst %s m, tolerance %s m)" % [str(fx_worst), str(POS_TOL)])
	ok(kinds.has("door") and kinds.has("window"), "the district holds doors and windows")
	var fake: Dictionary = (d["fixtures"]["records"][0] as Dictionary).duplicate(true)
	fake["parent"] = "bld_99999"
	ok(not tags.has(fake["parent"]), "negative: a fixture whose parent the page never made does not resolve")
	ok(rep["sections"].get("furniture") in ["ok", "empty"] and int(recs.get("furniture", 0)) == int(recs.get("furniture_resolved", -1)),
		"furniture slots (%s: the registered plazas, statues, fountains and drains in the box): %d placements, %d resolve to their record and piece" % [rep["sections"].get("furniture"), recs.get("furniture", 0), recs.get("furniture_resolved", 0)])

	# 4. materials: every mesh has its material, every named map its image, every hook a library include
	var mats := {}
	for m in d["materials"]:
		mats[m["id"]] = m
	var texs := {}
	for t in d["textures"]:
		texs[t["id"]] = t
	var mat_bad := 0
	var map_bad := 0
	var lib_on := 0
	var wuv_on := 0
	var wuv_want := 0
	var hooks := {}
	for n in items + bnodes:
		var gi := n as GeometryInstance3D
		var mid = n.get_meta("krator")["material"]
		var mat := gi.material_override
		if mat == null or not mats.has(mid):
			mat_bad += 1
			continue
		var rec: Dictionary = mats[mid]
		if rec.get("hook") != null:
			hooks[rec["hook"]] = true
		if mat is ShaderMaterial:
			var sm := mat as ShaderMaterial
			if rec.get("map") != null and (not sm.get_shader_parameter("has_albedo") or sm.get_shader_parameter("albedo_tex") == null):
				map_bad += 1
			elif rec.get("map") != null and texs[rec["map"]].get("from") == "library":
				lib_on += 1
			if rec.get("worldUV") is Dictionary and n is MultiMeshInstance3D and not rec.get("transparent", false):
				wuv_want += 1
				if sm.get_shader_parameter("world_uv") and is_equal_approx((sm.get_shader_parameter("tile_m") as Vector2).x, 1.0 / float(rec["worldUV"]["K"])):
					wuv_on += 1
	var unknown := KHooks.survey(d["materials"])["unknown"] as Array
	ok(mat_bad == 0 and map_bad == 0, "every item and bucket has its material (%d missing) and every named map its image (%d missing)" % [mat_bad, map_bad])
	ok(lib_on > 0 and int(rep["counts"]["textures"]["library"]) > 0 and int(rep["counts"]["textures"]["missing"]) == 0,
		"library maps by reference load from tex/ (%d textures, on %d meshes); %d PNGs (the procedural maps)" % [rep["counts"]["textures"]["library"], lib_on, rep["counts"]["textures"]["png"]])
	ok(unknown.is_empty() and hooks.size() > 0, "every material's hook names library includes: %s" % JSON.stringify(hooks.keys()))
	ok(wuv_want > 0 and wuv_on == wuv_want, "world-uv: %d of %d instanced world-UV meshes tile at 1/K metres" % [wuv_on, wuv_want])
	ok((KHooks.resolve("world-uv+no-such-hook")["unknown"] as Array) == ["no-such-hook"], "negative: a hook no include answers is reported")
	var kmat_ok := 0
	var kmat_n := 0
	for m in d["materials"]:
		if m.get("kmat") != null:
			kmat_n += 1
			if mats.has(m["kmat"]):
				kmat_ok += 1
	ok(kmat_n > 0 and kmat_ok == kmat_n, "%d materials name their KMAT record, every one in the export" % kmat_n)

	# 5. the ground: sampled (Iziz bakes no core/terrain field); the drawn ground passes through every sample
	var g: Node3D = w.get_meta("ground")
	var gr: Dictionary = d["terrain"]["grid"]
	var H := KData.floats(gr["heights"])
	var nx: int = int(gr["nx"])
	var gmax := 0.0
	var gneg := 0
	var nz: int = int(gr["nz"])
	var gn := 0
	for k in H.size():   # every sample but the last column and row, where KData.height_at clamps its cell to nx - 1.001
		if k % nx == nx - 1 or k / nx == nz - 1:
			continue
		gn += 1
		var x := float(gr["x0"]) + (k % nx) * float(gr["step"])
		var z := float(gr["z0"]) + (k / nx) * float(gr["step"])
		gmax = max(gmax, abs(KData.height_at(g, x, z) - H[k]))
		if abs(KData.height_at(g, x + 0.5 * float(gr["step"]), z) - H[k]) > 1e-3:
			gneg += 1
	ok(d["terrain"]["source"] == "sampled" and gmax <= GRID_TOL, "terrain: the ground passes through its %d grid samples to %s m (tolerance %s m)" % [gn, str(gmax), str(GRID_TOL)])
	if SHEET:   # the sheet's ground is flat: half a step off reads the same height, so the check is that it is flat
		ok(gneg == 0 and H.size() > 0 and Array(H).max() - Array(H).min() < 1e-3, "the sheet's ground is flat (%d samples, every one at %s m)" % [H.size(), str(H[0])])
	else:
		ok(gneg > 0, "negative: half a step off, %d samples differ" % gneg)
	ok(w.has_meta("stage") and (w.get_meta("stage") as Dictionary).get("format") == "krator-stage", "the stage (light, fog, sky, the painted ground's look) is there")

	w.queue_free()
	print("iziz: %d instances, %d buckets, %d records, %d fixtures; %s" % [inst, bnodes.size(), tags.size(), nfix, "all passed" if fails == 0 else str(fails) + " failed"])
	quit(1 if fails else 0)


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
