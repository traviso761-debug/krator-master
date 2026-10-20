# Longsong through core/export (settlements/longsong/src/94-ls-export.js on core/export; core/export/README.md, "Iziz" is
# its template): a 240 x 260 m box over the palaces, the Great Stair and the ward opens in Godot with the Oidong kit's
# flora as items, the buildings, the depths and the villages as buckets (ARCH's meshes by material, a triangle by its
# centroid, with the registered volumes it stands in), the cropped registry, the materials and the library maps, the
# ground sampled (Longsong bakes no core/terrain field), the stage, the weather and the still water. The case is written by
#   python3 tools/harness.py export settlements/longsong/dist/longsong.html --out godot/data/world-longsong --box=-120,-60,120,200
# and imported by krator/world_import.gd. It holds Longsong to a city's rules where world_test.gd (the biome tile's) does
# not fit: a bucket keeps the triangles whose centroid lies in the box, so a mesh wholly inside drops no vertex; a city
# material is drawn on library.gdshader (has_albedo), a biome one on the biome shader (has_tex); the ground is read off
# the drawn mesh at every sample, its last row and column too (KData.height_at clamps there). Each check has a negative.
#   godot --headless --path godot --script res://tests/export/longsong_test.gd     exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

const KTags := preload("res://tests/tags/ktags.gd")
var CASE := "res://data/world-longsong/"   # -- --case=<name>: another Longsong box under data/
const BOX := [-120.0, -60.0, 120.0, 200.0]  # the case's box (x0, z0, x1, z1): the palaces, the Great Stair, the ward's south half
const POS_TOL := 1e-4    # metres: a drawn instance against world.glb's translation
const Q_STEPS := 2.0     # steps of a bucket's AABB / 65535: the glTF importer's compressed positions against world.glb's
const GRID_TOL := 1e-4   # metres: the drawn ground against the page's sampled heights
const WATER_TOL := 1e-3  # metres: a still surface's vertex sums against the page's mesh

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--case="):
			CASE = "res://data/%s/" % a.trim_prefix("--case=")
	if not FileAccess.file_exists(CASE + "world.json"):
		print("FAIL no case: run python3 tools/harness.py export settlements/longsong/dist/longsong.html --out godot/data/world-longsong --box=-120,-60,120,200")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "world.json")
	var w := KratorWorld.build(CASE + "world.json")
	root.add_child(w)
	var rep: Dictionary = w.get_meta("report")
	ok(d["format"] == "krator-world" and int(d["version"]) == 1 and not rep["gaps"].has("load") and not rep["gaps"].has("format"),
		"world.json and world.glb load (%d ms)" % rep["counts"]["load_ms"])
	ok((d["errors"] as Array).is_empty() and not rep["gaps"].has("export errors"), "the page reported no section errors")
	var box: Array = d["box"]
	ok(box.size() == 4 and _same_box(box, BOX), "the box is the case's: %s (x0, z0, x1, z1)" % JSON.stringify(box))
	var bad_sec := []
	for s in ["items", "buckets", "materials", "textures", "registry", "terrain", "stage", "atmos", "water"]:
		if rep["sections"].get(s) != "ok":
			bad_sec.append(s)
	ok(bad_sec.is_empty(), "sections filled: items, buckets, materials, textures, registry, terrain, stage, atmos, water%s" % ("" if bad_sec.is_empty() else " (NOT: %s)" % ", ".join(bad_sec)))
	var stubs := []
	for s in ["fixtures", "interiors", "furniture", "sim", "city"]:
		if rep["sections"].get(s) != "stub" or not rep["gaps"].has("section " + s):
			stubs.append(s)
	ok(stubs.is_empty(), "fixtures, interiors, furniture, sim and city arrive as stubs, and the report names each (the rooms and the walk floors are not sections yet: KNOWN_ISSUES.md)%s" % ("" if stubs.is_empty() else " (NOT: %s)" % ", ".join(stubs)))
	var lod = d["convention"].get("lod")
	ok(lod is Dictionary and float(lod.get("cell", 0)) == 150.0 and KratorBiome.cell == 150.0, "convention.lod: cell 150 m, read by the importer")
	var tags: Dictionary = w.get_meta("tags", {})

	# 1. the registry, cropped to the box: every record's uid recomputed in GDScript; the box's landmarks are there
	var nrec := 0
	var ubad := 0
	var classes := {}
	for id in tags:
		var r: Dictionary = tags[id]
		nrec += 1
		classes[r["class"]] = int(classes.get(r["class"], 0)) + 1
		if KTags.uid(r["class"], r["key"], r["at"]) != r["uid"]:
			ubad += 1
	var reg: Dictionary = d["registry"]
	ok(nrec == (reg["records"] as Array).size() and nrec == int(reg["cropped"]["kept"]) and int(reg["cropped"]["from"]) > nrec and ubad == 0,
		"registry: %d records kept of the page's %d (%s), every uid recomputed (%d differ)" % [nrec, int(reg["cropped"]["from"]), JSON.stringify(classes), ubad])
	var r0: Dictionary = tags.values()[0] if nrec > 0 else {}
	ok(not r0.is_empty() and KTags.uid(r0["class"], r0["key"], [float(r0["at"][0]) + 0.2, r0["at"][1], r0["at"][2]]) != r0["uid"],
		"negative: a record moved 20 cm has another uid")
	var by_key := {}
	for id in tags:
		by_key[tags[id]["key"]] = id
	var want := ["longsong_white-palace", "longsong_red-palace", "longsong_lower-gate", "longsong_debate-court", "longsong_assembly", "longsong_great_stair", "longsong_wall", "longsong_drill"]
	var drawn_ids := {}
	for b in d["buckets"]:
		for rid in b.get("recordIds", []):
			drawn_ids[rid] = true
	var missing := []
	for k in want:
		if not by_key.has(k) or not drawn_ids.has(by_key[k]):
			missing.append(k)
	ok(missing.is_empty(), "the palaces, the Great Stair, the wall and the ward's drill ground are registered and drawn by a bucket%s" % ("" if missing.is_empty() else " (NOT: %s)" % ", ".join(missing)))
	# the crop (registry.cropped.rule): a record is kept when an item or a bucket names it, when its position lies in the
	# box (an item set's does not count), or when it is a kept record's parent
	for it in d["items"]:
		drawn_ids[it["record"]] = true
	var parents := {}
	for id in tags:
		if tags[id].get("parent") != null:
			parents[tags[id]["parent"]] = true
	var crop_bad := []
	for id in tags:
		var r: Dictionary = tags[id]
		if not (drawn_ids.has(id) or parents.has(id) or (not r.get("set", false) and _in_box(float(r["at"][0]), float(r["at"][2]), BOX, 0.0))):
			crop_bad.append(id)
	ok(crop_bad.is_empty(), "every kept record is drawn by an item or a bucket, stands in the box, or is a kept record's parent%s" % ("" if crop_bad.is_empty() else " (NOT: %s)" % ", ".join(PackedStringArray(crop_bad.slice(0, 5)))))
	ok(not by_key.has("longsong_gatehouse") and not by_key.has("longsong_paper-mill") and not tags.has("bld_99999"),
		"negative: records outside the box (the Great Gate at z -200, the paper mill at z -178) and one the page never made do not resolve")

	# 2. the items (the Oidong kit's flora): every MultiMesh names its item set, every instance stands where world.glb
	#    says, inside the box, and its uid recomputes from world.glb's TRANSLATION
	var items := w.get_node("Items").get_children()
	var bytes := FileAccess.get_file_as_bytes(CASE + "world.glb")
	var jl := bytes.decode_u32(12)
	var J: Dictionary = JSON.parse_string(bytes.slice(20, 20 + jl).get_string_from_utf8())
	var bin0 := 20 + jl + 8
	ok(bytes.decode_u32(0) == 0x46546C67 and bytes.decode_u32(20 + jl + 4) == 0x004E4942, "world.glb is a glb with a JSON and a BIN chunk")
	var inst := 0
	var checked := 0
	var differ := 0
	var neg := 0
	var neg_same := 0
	var unresolved := 0
	var misplaced := 0
	var outside := 0
	var worst := 0.0
	var T0 := PackedFloat32Array()
	var set_cls := {}
	for k in items.size():
		var n: MultiMeshInstance3D = items[k]
		var it: Dictionary = d["items"][k]
		var mm := n.multimesh
		inst += mm.instance_count
		var node: Dictionary = J["nodes"][_node_index(J, str(it["glb"]["node"]))]
		var T := _acc(J, bytes, bin0, int(node["extensions"]["EXT_mesh_gpu_instancing"]["attributes"]["TRANSLATION"]))
		if k == 0:
			T0 = T
		var buf := mm.buffer
		var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
		for j in mm.instance_count:
			var e := (n.position + Vector3(buf[j * stride + 3], buf[j * stride + 7], buf[j * stride + 11]) - Vector3(T[j * 3], T[j * 3 + 1], T[j * 3 + 2])).length()
			worst = max(worst, e)
			if e > POS_TOL:
				misplaced += 1
			if not _in_box(T[j * 3], T[j * 3 + 2], BOX, 0.0):
				outside += 1
		var sid: String = n.get_meta("krator_record", "")
		var rec: Dictionary = tags.get(sid, {})
		if rec.is_empty() or rec["class"] != it.get("recordClass") or rec["key"] != it.get("recordKey") or rec["class"] == "part":
			unresolved += 1
			continue
		set_cls[rec["class"]] = int(set_cls.get(rec["class"], 0)) + 1
		var side: PackedStringArray = n.get_meta("krator_records")
		for j in side.size():
			var p := [T[j * 3], T[j * 3 + 1], T[j * 3 + 2]]
			checked += 1
			if KTags.uid(rec["class"], rec["key"], p) != side[j]:
				differ += 1
			if j % 10 == 0:
				neg += 1
				if KTags.uid(rec["class"], rec["key"], [p[0], p[1], p[2] + 0.2]) == side[j]:
					neg_same += 1
	ok(items.size() == d["items"].size() and inst == int(d["stats"]["instances"]) and inst > 0,
		"%d MultiMeshes, %d instances (the page's count: %d)" % [items.size(), inst, int(d["stats"]["instances"])])
	ok(unresolved == 0, "every MultiMesh's item set resolves in the registry, its class and key the item's (%s; %d unresolved)" % [JSON.stringify(set_cls), unresolved])
	ok(checked == inst and differ == 0, "every instance's uid recomputed in GDScript from world.glb's TRANSLATION: %d checked, %d differ" % [checked, differ])
	ok(neg > 0 and neg_same == 0, "negative: 20 cm off, %d sampled instances all get another uid (%d kept it)" % [neg, neg_same])
	ok(misplaced == 0, "every drawn instance stands at world.glb's translation (worst %s m, tolerance %s m)" % [str(worst), str(POS_TOL)])
	ok(outside == 0, "every instance's origin lies in the box (x0 <= x < x1, z0 <= z < z1): %d outside" % outside)
	var shifted := 0
	var side0: PackedStringArray = items[0].get_meta("krator_records", PackedStringArray()) if items.size() > 0 else PackedStringArray()
	var rec0: Dictionary = tags.get(items[0].get_meta("krator_record", ""), {}) if items.size() > 0 else {}
	for j in side0.size() - 1:
		if KTags.uid(rec0["class"], rec0["key"], [T0[j * 3], T0[j * 3 + 1], T0[j * 3 + 2]]) == side0[j + 1]:
			shifted += 1
	ok(side0.size() > 1 and shifted == 0, "negative: the side table read one row out of step matches no instance (%d of %d)" % [shifted, side0.size() - 1])

	# 3. the buckets: each names the registered volumes its triangles stand in, each resolving and its uid recomputed; a
	#    Longsong bucket keeps the triangles whose centroid lies in the box (94's rule), compacted to the vertices they use
	var bnodes := w.get_node("Buckets").get_children()
	var vols := 0
	var vbad := 0
	var named := 0
	var tris := 0
	var ls_n := 0
	var ls_tris := 0
	var c_out := 0
	var c_out_neg := 0
	var c_worst := 0.0
	var vx_bad := []
	var unused := 0
	var whole := 0
	var by_bad := 0
	var kits := {}
	var compressed := 0
	var q_bad := 0
	var q_neg_same := 0
	var q_worst := 0.0
	var dev_max := 0.0
	for k in bnodes.size():
		var bn := bnodes[k] as MeshInstance3D
		var b: Dictionary = d["buckets"][k]
		kits[b["kit"]] = int(kits.get(b["kit"], 0)) + 1
		var u: PackedStringArray = bn.get_meta("krator_records", PackedStringArray())
		var bids: PackedStringArray = bn.get_meta("krator_record_ids", PackedStringArray())
		if u.size() > 0:
			named += 1
		for i in u.size():
			vols += 1
			var r: Dictionary = tags.get(bids[i], {})
			if r.is_empty() or r["uid"] != u[i] or KTags.uid(r["class"], r["key"], r["at"]) != u[i]:
				vbad += 1
		# Godot's triangles and vertices as drawn; the page's own (world.glb's POSITION and indices, float32 as written) for
		# the box rule, since the glTF importer stores positions compressed (ARRAY_FLAG_COMPRESS_ATTRIBUTES: 16 bits over
		# the mesh's AABB): a vertex moves by up to Q_STEPS steps of the AABB's longest side / 65535 (1.5 measured here)
		var mesh: Mesh = bn.mesh
		var xf := _xf(bn)
		var nv := 0
		var GV := PackedVector3Array()
		for s in mesh.get_surface_count():
			var arr := mesh.surface_get_arrays(s)
			GV.append_array(arr[Mesh.ARRAY_VERTEX] as PackedVector3Array)
			tris += (arr[Mesh.ARRAY_INDEX] as PackedInt32Array).size() / 3
			if (mesh.surface_get_format(s) & Mesh.ARRAY_FLAG_COMPRESS_ATTRIBUTES) != 0:
				compressed += 1
		nv = GV.size()
		var prim: Dictionary = J["meshes"][int(J["nodes"][_node_index(J, str(b["glb"]["node"]))]["mesh"])]["primitives"][0]
		var P := _acc(J, bytes, bin0, int(prim["attributes"]["POSITION"]))
		var PI := _acc_i(J, bytes, bin0, int(prim["indices"]))
		var step := Q_STEPS * mesh.get_aabb().get_longest_axis_size() / 65535.0 + 1e-5
		var dev := 0.0
		var dev_neg := 0.0
		if GV.size() * 3 == P.size():
			for i in GV.size():
				var gp: Vector3 = xf * GV[i]
				dev = max(dev, (gp - Vector3(P[i * 3], P[i * 3 + 1], P[i * 3 + 2])).length())
				if i + 1 < GV.size():
					dev_neg = max(dev_neg, (gp - Vector3(P[i * 3 + 3], P[i * 3 + 4], P[i * 3 + 5])).length())
		else:
			dev = INF
		q_worst = max(q_worst, dev / step)
		dev_max = max(dev_max, dev)
		if dev > step:
			q_bad += 1
		if GV.size() > 1 and dev_neg <= step:
			q_neg_same += 1
		if b["kit"] == "longsong":
			var used := {}
			ls_tris += PI.size() / 3
			for t in range(0, PI.size(), 3):
				var cx := 0.0
				var cz := 0.0
				for v in 3:
					var iv: int = PI[t + v]
					used[iv] = true
					cx += P[iv * 3]
					cz += P[iv * 3 + 2]
				cx /= 3.0
				cz /= 3.0
				c_worst = max(c_worst, _outside_by(cx, cz, BOX))
				if not _in_box(cx, cz, BOX, 0.0):
					c_out += 1
				if not _in_box(cx, cz, [BOX[0] + 1.0, BOX[1] + 1.0, BOX[2] - 1.0, BOX[3] - 1.0], 0.0):
					c_out_neg += 1
			unused += P.size() / 3 - used.size()
		if b.get("compacted") is Dictionary and int(b["compacted"]["vertices"]) != nv:
			vx_bad.append("%s: %d in Godot, %d on the page" % [b["id"], nv, int(b["compacted"]["vertices"])])
		if b["kit"] == "longsong":
			ls_n += 1
			if int(b["compacted"]["dropped"]) == 0:
				whole += 1
			var br: Dictionary = b["pieces"].get("byRecord", {})
			var bk := br.keys()
			bk.sort()
			var cnt := 0
			for kk in br:
				cnt += int(br[kk])
			if bk != Array(b["recordIds"]) or cnt > int(b["triangles"]):
				by_bad += 1
	ok(tris == int(d["stats"]["triangles"]), "bucket triangles: %d in Godot, %d on the page" % [tris, int(d["stats"]["triangles"])])
	ok(bnodes.size() == d["buckets"].size() and named == bnodes.size() and vols > 0 and vbad == 0,
		"%d buckets (%s), every one names its volumes: %d records, %d bad" % [bnodes.size(), JSON.stringify(kits), vols, vbad])
	var bb: Dictionary = tags.get(bnodes[0].get_meta("krator_record_ids", PackedStringArray(["?"]))[0], {}) if bnodes.size() > 0 else {}
	ok(not bb.is_empty() and KTags.uid(bb["class"], bb["key"], [float(bb["at"][0]) + 0.2, bb["at"][1], bb["at"][2]]) != bb["uid"],
		"negative: a bucket's record moved 20 cm has another uid")
	ok(ls_n > 0 and by_bad == 0, "every Longsong bucket's triangles by volume (pieces.byRecord) name exactly its recordIds (%d of %d do not)" % [by_bad, ls_n])
	ok(ls_tris > 0 and c_out == 0, "every Longsong bucket triangle's centroid (world.glb's vertices) lies in the box (x0 <= x < x1, z0 <= z < z1): %d triangles, %d outside (worst %s m past an edge)" % [ls_tris, c_out, str(c_worst)])
	ok(c_out_neg > 0, "negative: against the box 1 m smaller on every side, %d centroids fall outside" % c_out_neg)
	ok(q_bad == 0, "Godot draws every bucket vertex where world.glb puts it, within the importer's 16-bit compression (%d of %d buckets compressed; worst %s m, %.2f of the tolerance, %s steps of the AABB / 65535; %d buckets off)" % [compressed, bnodes.size(), str(dev_max), q_worst, str(Q_STEPS), q_bad])
	ok(q_neg_same == 0, "negative: world.glb's vertices read one row out of step leave the step in every bucket (%d kept it)" % q_neg_same)
	ok(vx_bad.is_empty() and unused == 0, "every bucket is compacted: Godot draws the page's kept vertex count (%d differ%s), every Longsong vertex used by a kept triangle (%d unused); %d of %d Longsong buckets lie wholly in the box and dropped none" % [vx_bad.size(), ("" if vx_bad.is_empty() else ": " + "; ".join(PackedStringArray(vx_bad.slice(0, 3)))), unused, whole, ls_n])

	# 4. materials: every mesh has its material, every named map its image (a city record on library.gdshader sets
	#    has_albedo, a biome one on the biome shader has_tex), the library's maps from tex/, every hook a library include
	var mats := {}
	for m in d["materials"]:
		mats[m["id"]] = m
	var texs := {}
	for t in d["textures"]:
		texs[t["id"]] = t
	var mat_bad := 0
	var map_bad := 0
	var lib_on := 0
	var on_lib := 0
	var on_bio := 0
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
		var has_img := false
		if mat is ShaderMaterial:
			var sm := mat as ShaderMaterial
			if sm.shader == KratorKmat.LIB:
				on_lib += 1
				has_img = bool(sm.get_shader_parameter("has_albedo")) and sm.get_shader_parameter("albedo_tex") != null
			else:
				on_bio += 1
				has_img = bool(sm.get_shader_parameter("has_tex")) and sm.get_shader_parameter("albedo_tex") != null
		elif mat is StandardMaterial3D:
			has_img = (mat as StandardMaterial3D).albedo_texture != null
		if rec.get("map") != null:
			if not has_img:
				map_bad += 1
			elif texs[rec["map"]].get("from") == "library":
				lib_on += 1
	ok(mat_bad == 0 and map_bad == 0, "every item and bucket has its material (%d missing) and every named map its image (%d missing): %d on library.gdshader, %d on the biome shader" % [mat_bad, map_bad, on_lib, on_bio])
	ok(on_lib > 0 and on_bio > 0, "the city's materials draw on the library shader and the flora's on the biome shader (%d, %d)" % [on_lib, on_bio])
	ok(lib_on > 0 and int(rep["counts"]["textures"]["library"]) > 0 and int(rep["counts"]["textures"]["missing"]) == 0 and not rep["gaps"].has("textures"),
		"library maps by reference load from tex/ (%d textures, on %d meshes, %d missing); %d PNGs (the marks' banners and signs, the flora's cards)" % [rep["counts"]["textures"]["library"], lib_on, rep["counts"]["textures"]["missing"], rep["counts"]["textures"]["png"]])
	ok(KratorWorld._library(CASE.trim_suffix("/"), {"family": "no-such-family", "slot": "map"}, {}) == null, "negative: a family the pack lacks gives no image")
	var unknown := KHooks.survey(d["materials"])["unknown"] as Array
	ok(unknown.is_empty() and not rep["gaps"].has("hooks") and hooks.size() > 0, "every material's hook names library includes: %s" % JSON.stringify(hooks.keys()))
	ok((KHooks.resolve("leaf+no-such-hook")["unknown"] as Array) == ["no-such-hook"], "negative: a hook no include answers is reported")

	# 5. the ground: sampled (Longsong bakes no field: its platforms and terrace walls are vertical steps); the drawn mesh
	#    passes through every sample, the last row and column too, and KData.height_at agrees inside them
	var g: Node3D = w.get_meta("ground", null)
	var gr: Dictionary = d["terrain"]["grid"]
	var H := KData.floats(gr["heights"])
	var nx: int = int(gr["nx"])
	var nz: int = int(gr["nz"])
	var st := float(gr["step"])
	var vmax := 0.0
	var vn := 0
	var hmax := 0.0
	var hn := 0
	var gneg := 0
	var gmi := g as MeshInstance3D
	# the drawn mesh's vertices by lattice point (SurfaceTool's generate_normals re-indexes, so they are not in sample order)
	var at := {}
	var off_lattice := 0
	if gmi != null:
		var gxf := _xf(gmi)
		for v in (gmi.mesh.surface_get_arrays(0)[Mesh.ARRAY_VERTEX] as PackedVector3Array):
			var q: Vector3 = gxf * v
			var fi := (q.x - float(gr["x0"])) / st
			var fj := (q.z - float(gr["z0"])) / st
			if absf(fi - roundf(fi)) > 1e-4 or absf(fj - roundf(fj)) > 1e-4:
				off_lattice += 1
				continue
			at[int(roundf(fj)) * nx + int(roundf(fi))] = q.y
	for k in H.size():
		var x := float(gr["x0"]) + (k % nx) * st
		var z := float(gr["z0"]) + (k / nx) * st
		if at.has(k):
			vn += 1
			vmax = max(vmax, absf(float(at[k]) - H[k]))
		if k % nx == nx - 1 or k / nx == nz - 1:
			continue
		hn += 1
		hmax = max(hmax, abs(KData.height_at(g, x, z) - H[k]))
		if abs(KData.height_at(g, x + 0.5 * st, z) - H[k]) > 1e-3:
			gneg += 1
	ok(d["terrain"]["source"] == "sampled" and d["terrain"].get("field") == null and rep["gaps"].has("field"),
		"terrain: sampled on the export's grid (%d x %d at %s m), no krator-field, and the report says so" % [nx, nz, str(st)])
	ok(gmi != null and vn == H.size() and nx * nz == H.size() and off_lattice == 0 and vmax <= GRID_TOL, "the drawn ground has a vertex on every one of its %d samples, the last row and column too, to %s m (tolerance %s m; %d off the lattice)" % [vn, str(vmax), str(GRID_TOL), off_lattice])
	ok(hn > 0 and hmax <= GRID_TOL, "KData.height_at passes through the %d samples inside the last row and column to %s m" % [hn, str(hmax)])
	ok(gneg > 0, "negative: half a step off, %d samples differ" % gneg)
	var pts: Array = d["terrain"]["probes"]["points"]
	var pmax := 0.0
	var pn := 0
	for p in pts:
		var e := absf(KData.height_at(g, float(p[0]), float(p[1])) - float(p[2]))
		pmax = max(pmax, e)
		if e > 0.5:
			pn += 1
	print("     between samples the grid's bilinear cells and the page's own h differ by up to %.3f m at the %d probes (%d past 0.5 m: the terrace walls and the platforms' vertical steps fall between samples)" % [pmax, pts.size(), pn])
	var gm := gmi.mesh.surface_get_material(0) as ShaderMaterial if gmi != null else null
	var ga := gmi.mesh.surface_get_arrays(0) if gmi != null else []
	ok(gm != null and gm.shader.resource_path.ends_with("ground.gdshader") and ga[Mesh.ARRAY_TEX_UV] != null and (ga[Mesh.ARRAY_TEX_UV] as PackedVector2Array).size() == H.size()
		and ga[Mesh.ARRAY_COLOR] != null and (ga[Mesh.ARRAY_COLOR] as PackedColorArray).size() == H.size(),
		"the stage's ground look (the page's ground material, a uv and a colour per sample) is on the drawn ground")

	# 6. the stage, the weather and the still water
	var stg: Dictionary = w.get_meta("stage", {})
	ok(stg.get("format") == "krator-stage" and stg.get("sky") is Dictionary and stg.get("ground") is Dictionary and stg.get("lights") is Dictionary and (stg["lights"] as Dictionary).has("directional"),
		"the stage (light, fog, the sky panorama, the ground's look) is there for stage.gd")
	var ar: Dictionary = rep.get("atmos", {})
	var A: Dictionary = d["atmos"]
	ok(ar.has("counts") and not (ar["gaps"] as Dictionary).has("format") and int(ar["counts"]["glow"]) == int(A["stats"]["glow"]) and int(ar["counts"]["glow"]) > 0,
		"atmos: the weather imported, %d glow halos of the page's %d (the butter lamps, the windows), fx %s" % [int(ar.get("counts", {}).get("glow", -1)), int(A["stats"]["glow"]), JSON.stringify(ar.get("counts", {}).get("fx", {}))])
	var bad_atm: Node3D = load("res://krator/atmos_import.gd").build_from({"format": "no-such-format"}, "negative")
	ok((bad_atm.get_meta("report")["gaps"] as Dictionary).has("format"), "negative: an atmos section in another format is reported, not drawn")
	bad_atm.free()
	var wr: Dictionary = rep.get("water", {})
	var WN := w.get_node_or_null("Water")
	var S: Array = d["water"]["surfaces"]
	var w_bad := []
	var w_neg := 0
	for r in S:
		var mi: MeshInstance3D = null
		if WN:
			for c in WN.get_children():
				if (c.get_meta("krator", {}) as Dictionary).get("id") == r["id"]:
					mi = c
		if mi == null or r["kind"] != "still":
			w_bad.append("%s not drawn as still" % r["id"])
			continue
		var arr := mi.mesh.surface_get_arrays(0)
		var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
		var I = arr[Mesh.ARRAY_INDEX]
		var nt: int = (I as PackedInt32Array).size() / 3 if I != null else V.size() / 3
		var sx := 0.0
		var sy := 0.0
		var sz := 0.0
		for v in V:
			var q: Vector3 = _xf(mi) * v
			sx += q.x
			sy += q.y
			sz += q.z
		var sum := Vector3(sx, sy, sz)
		var want_sum := Vector3(float(r["mesh"]["sum"][0]), float(r["mesh"]["sum"][1]), float(r["mesh"]["sum"][2]))
		if nt != int(r["mesh"]["triangles"]) or (sum - want_sum).length() > WATER_TOL or absf(float(mi.get_meta("krator")["level"]) - float(r["level"])) > WATER_TOL:
			w_bad.append("%s: %d triangles (page %d), vertex sum %s (page %s)" % [r["id"], nt, int(r["mesh"]["triangles"]), str(sum), str(want_sum)])
		if absf((sum + Vector3(0, 0.5 * V.size(), 0) - want_sum).length()) > WATER_TOL:
			w_neg += 1
	ok(S.size() > 0 and (wr.get("drawn", []) as Array).size() == S.size() and (wr.get("not_drawn", []) as Array).is_empty() and w_bad.is_empty(),
		"water: %d still surfaces (%s) drawn at their level, each mesh the page's (its triangles and vertex sums)%s" % [S.size(), ", ".join(S.map(func(x): return str(x["name"]))), ("" if w_bad.is_empty() else "; " + "; ".join(PackedStringArray(w_bad)))])
	ok(not rep["gaps"].has("water period") and not rep["gaps"].has("water field") and not rep["gaps"].has("water format"), "water: the section's wave period is the Atmos autoload's and its field is given")
	ok(w_neg == S.size(), "negative: a surface 50 cm higher has another vertex sum (%d of %d)" % [w_neg, S.size()])

	w.queue_free()
	print("longsong: %d instances, %d buckets (%d triangles), %d records, %d water surfaces; %s" % [inst, bnodes.size(), tris, nrec, S.size(), "all passed" if fails == 0 else str(fails) + " failed"])
	quit(1 if fails else 0)


# a node's transform in the world's frame (its own composed with its Node3D parents': KratorWorld's root stands at the origin)
static func _xf(n: Node3D) -> Transform3D:
	var t := n.transform
	var p := n.get_parent()
	while p is Node3D:
		t = (p as Node3D).transform * t
		p = p.get_parent()
	return t


# x0 <= x < x1, z0 <= z < z1 (convention.box), widened by tol
static func _in_box(x: float, z: float, b: Array, tol: float) -> bool:
	return x >= float(b[0]) - tol and x < float(b[2]) + tol and z >= float(b[1]) - tol and z < float(b[3]) + tol


static func _outside_by(x: float, z: float, b: Array) -> float:
	return max(0.0, max(max(float(b[0]) - x, x - float(b[2])), max(float(b[1]) - z, z - float(b[3]))))


static func _same_box(a: Array, b: Array) -> bool:
	for i in 4:
		if absf(float(a[i]) - float(b[i])) > 1e-9:
			return false
	return true


static func _node_index(J: Dictionary, name: String) -> int:
	var nodes: Array = J["nodes"]
	for i in nodes.size():
		if nodes[i].get("name") == name:
			return i
	return -1


static func _acc_i(J: Dictionary, bytes: PackedByteArray, bin0: int, ix: int) -> PackedInt32Array:
	var a: Dictionary = J["accessors"][ix]
	var v: Dictionary = J["bufferViews"][int(a["bufferView"])]
	var start := bin0 + int(v.get("byteOffset", 0)) + int(a.get("byteOffset", 0))
	var n := int(a["count"])
	var out := PackedInt32Array()
	out.resize(n)
	for i in n:
		out[i] = bytes.decode_u16(start + i * 2) if int(a["componentType"]) == 5123 else int(bytes.decode_u32(start + i * 4))
	return out


static func _acc(J: Dictionary, bytes: PackedByteArray, bin0: int, ix: int) -> PackedFloat32Array:
	var a: Dictionary = J["accessors"][ix]
	var v: Dictionary = J["bufferViews"][int(a["bufferView"])]
	var comps: int = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]]
	var start := bin0 + int(v.get("byteOffset", 0)) + int(a.get("byteOffset", 0))
	return bytes.slice(start, start + int(a["count"]) * comps * 4).to_float32_array()
