# M4 (ROADMAP.md stage 2d, GODOT-PLAN.md section 8): a biome tile exported through core/export opens in Godot with its
# records, materials and terrain. The case is biomes/sedesert's tile round the pond, written by
#   python3 tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert --box 80,490,380,790
# and imported by krator/world_import.gd. Each check has a negative.
#   godot --headless --path godot --script res://tests/export/world_test.gd     exits 0 when every check passes
# (a fresh checkout runs godot --headless --path godot --import once first, so the class names register)
extends SceneTree

const KTags := preload("res://tests/tags/ktags.gd")
var CASE := "res://data/world-sedesert/"   # -- --case=<name>: another krator-world case under data/
const PROBE_TOL := 1e-4   # metres: KField.h here against the page's own h at the export's probes (one float32 field, one arithmetic)
const GRID_TOL := 1e-2    # metres: a ray onto the collision at a lattice point against KField.h

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
		print("FAIL no case: run python3 tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert --box 80,490,380,790")
		quit(1)
		return
	var d: Dictionary = KData.read_json(CASE + "world.json")
	var w := KratorWorld.build(CASE + "world.json")
	root.add_child(w)
	var rep: Dictionary = w.get_meta("report")
	ok(d["format"] == "krator-world" and int(d["version"]) == 1 and not rep["gaps"].has("load") and not rep["gaps"].has("format"),
		"world.json and world.glb load (%d ms)" % rep["counts"]["load_ms"])
	ok((d["errors"] as Array).is_empty(), "the page reported no section errors")
	var want_ok := ["items", "buckets", "materials", "textures", "registry", "terrain", "stage"]
	var bad_sec := []
	for s in want_ok:
		if rep["sections"].get(s) != "ok":
			bad_sec.append(s)
	ok(bad_sec.is_empty(), "sections filled: %s" % JSON.stringify(rep["sections"]))
	ok(rep["sections"].get("city") == "stub" and rep["gaps"].has("section city"), "the stubs arrive as stubs, and the report names them")

	# 1. every instance carries its record uid, aligned with the instances
	var tags: Dictionary = w.get_meta("tags", {})
	var items := w.get_node("Items").get_children()
	var inst := 0
	var named := 0
	for n in items:
		var mm: MultiMesh = (n as MultiMeshInstance3D).multimesh
		inst += mm.instance_count
		var side: PackedStringArray = n.get_meta("krator_records", PackedStringArray())
		if side.size() == mm.instance_count:
			for u in side:
				if u.length() == 8:
					named += 1
	ok(items.size() == d["items"].size() and inst == int(d["stats"]["instances"]) and named == inst and inst > 0,
		"%d MultiMeshes, %d instances (the page's count: %d), %d carry a uid" % [items.size(), inst, int(d["stats"]["instances"]), named])

	# 2. each uid recomputed in GDScript from the instance's translation as world.glb stores it (read here on its own)
	var bytes := FileAccess.get_file_as_bytes(CASE + "world.glb")
	var jl := bytes.decode_u32(12)
	var J: Dictionary = JSON.parse_string(bytes.slice(20, 20 + jl).get_string_from_utf8())
	var bin0 := 20 + jl + 8
	ok(bytes.decode_u32(0) == 0x46546C67 and bytes.decode_u32(20 + jl + 4) == 0x004E4942, "world.glb is a glb with a JSON and a BIN chunk")
	var checked := 0
	var differ := 0
	var neg := 0
	var neg_same := 0
	var unresolved := 0
	var misplaced := 0
	var worst_pos := 0.0
	for k in items.size():
		var n: MultiMeshInstance3D = items[k]
		var it: Dictionary = d["items"][k]
		var set_id: String = n.get_meta("krator_record", "")
		if not tags.has(set_id):
			unresolved += 1
			continue
		var rec: Dictionary = tags[set_id]
		var node: Dictionary = J["nodes"][_node_index(J, str(it["glb"]["node"]))]
		var T := _acc(J, bytes, bin0, int(node["extensions"]["EXT_mesh_gpu_instancing"]["attributes"]["TRANSLATION"]))
		var side: PackedStringArray = n.get_meta("krator_records")
		# the instance as Godot will draw it, read from the MultiMesh's buffer (headless, the dummy renderer keeps the
		# buffer but answers get_instance_transform with the identity): rows of the 3x4, then colour, then custom data
		var mm: MultiMesh = n.multimesh
		var buf := mm.buffer
		var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
		for j in side.size():
			var p := [T[j * 3], T[j * 3 + 1], T[j * 3 + 2]]
			checked += 1
			if KTags.uid(rec["class"], rec["key"], p) != side[j]:
				differ += 1
			if j % 40 == 0:   # the negative: 20 cm off, another uid
				neg += 1
				if KTags.uid(rec["class"], rec["key"], [p[0] + 0.2, p[1], p[2]]) == side[j]:
					neg_same += 1
			# the instance Godot draws stands where the record says
			var g := n.position + Vector3(buf[j * stride + 3], buf[j * stride + 7], buf[j * stride + 11])
			var e: float = (g - Vector3(p[0], p[1], p[2])).length()
			worst_pos = max(worst_pos, e)
			if e > 1e-4:
				misplaced += 1
	ok(unresolved == 0, "every MultiMesh's item set resolves in the registry (%d unresolved)" % unresolved)
	ok(checked == inst and differ == 0, "every uid recomputed in GDScript from world.glb's TRANSLATION matches: %d checked, %d differ" % [checked, differ])
	ok(neg > 0 and neg_same == 0, "negative: 20 cm off, %d sampled instances all get another uid (%d kept it)" % [neg, neg_same])
	ok(misplaced == 0, "every drawn instance stands at its record's position (worst %s m)" % str(worst_pos))
	var shifted := 0
	var side0: PackedStringArray = items[0].get_meta("krator_records")
	var rec0: Dictionary = tags.get(items[0].get_meta("krator_record", ""), {})
	var T0 := _acc(J, bytes, bin0, int(J["nodes"][_node_index(J, str(d["items"][0]["glb"]["node"]))]["extensions"]["EXT_mesh_gpu_instancing"]["attributes"]["TRANSLATION"]))
	for j in side0.size() - 1:
		if KTags.uid(rec0["class"], rec0["key"], [T0[j * 3], T0[j * 3 + 1], T0[j * 3 + 2]]) == side0[j + 1]:
			shifted += 1
	ok(side0.size() > 1 and shifted == 0, "negative: the side table read one row out of step matches no instance (%d of %d)" % [shifted, side0.size() - 1])

	# 3. buckets name the volumes they merge; each resolves, and its uid recomputes from its record
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
	var compacted := 0
	for b in d["buckets"]:
		if b.get("compacted") is Dictionary and int(b["compacted"]["dropped"]) > 0:
			compacted += 1
	ok(compacted == d["buckets"].size(), "every bucket's vertex list was compacted to the tile (ROADMAP finding 10)")

	# 4. materials resolve: every mesh has its material, every map its image (the library's from tex/, by reference)
	var mat_bad := 0
	var map_bad := 0
	var lib_used := 0
	var mats := {}
	for m in d["materials"]:
		mats[m["id"]] = m
	var texs := {}
	for t in d["textures"]:
		texs[t["id"]] = t
	for n in items + bnodes:
		var gi := n as GeometryInstance3D
		var sm := gi.material_override as ShaderMaterial
		var mid = n.get_meta("krator")["material"]
		if sm == null or not mats.has(mid):
			mat_bad += 1
			continue
		var map_id = mats[mid]["map"]
		if map_id != null:
			if not sm.get_shader_parameter("has_tex") or sm.get_shader_parameter("albedo_tex") == null:
				map_bad += 1
			elif texs[map_id].get("from") == "library":
				lib_used += 1
	ok(mat_bad == 0 and map_bad == 0, "every item and bucket has its material (%d missing) and every named map its image (%d missing)" % [mat_bad, map_bad])
	ok(lib_used > 0 and int(rep["counts"]["textures"]["library"]) > 0 and int(rep["counts"]["textures"]["missing"]) == 0,
		"library maps by reference load from tex/ (%d textures, on %d meshes); %d PNGs" % [rep["counts"]["textures"]["library"], lib_used, rep["counts"]["textures"]["png"]])
	ok(KratorWorld._library(CASE.trim_suffix("/"), {"family": "no-such-family", "slot": "map"}, {}) == null, "negative: a family the pack lacks gives no image")

	# 5. terrain: the field, sampled here, against the page's own h at the export's probes; rays onto the collision.
	# A build without a field (terrain.source "sampled") is held to its grid: the drawn ground passes through every sample
	var g: Node3D = w.get_meta("ground")
	var pts: Array = d["terrain"]["probes"]["points"]
	if g.has_meta("field"):
		var f: KField = g.get_meta("field")
		var pmax := 0.0
		var nmax := 0
		for p in pts:
			pmax = max(pmax, abs(f.h(float(p[0]), float(p[1])) - float(p[2])))
			if abs(f.h(float(p[0]) + 3.0, float(p[1])) - float(p[2])) > PROBE_TOL:
				nmax += 1
		ok(pts.size() == 256 and pmax <= PROBE_TOL, "terrain: KField.h at %d probes off the lattice matches the page's h to %s m (tolerance %s m)" % [pts.size(), str(pmax), str(PROBE_TOL)])
		ok(nmax > pts.size() / 2, "negative: read 3 m away, %d of %d probes leave the tolerance" % [nmax, pts.size()])
		await physics_frame
		await physics_frame
		var col := KratorField.check_collision(g)
		var space := g.get_world_3d().direct_space_state
		var rmax := 0.0
		var rmiss := 0
		for p in pts:
			var hit := space.intersect_ray(PhysicsRayQueryParameters3D.create(Vector3(float(p[0]), f.max_h + 100.0, float(p[1])), Vector3(float(p[0]), f.min_h - 100.0, float(p[1]))))
			if hit.is_empty():
				rmiss += 1
				continue
			rmax = max(rmax, abs((hit["position"] as Vector3).y - float(p[2])))
		ok(col["missed"] == 0 and col["grid_points"] > 0 and float(col["grid_max"]) <= GRID_TOL,
			"collision: rays at %d lattice points land on KField.h to %s m (tolerance %s m)" % [col["grid_points"], str(col["grid_max"]), str(GRID_TOL)])
		print("     between lattice points the HeightMapShape3D's triangles and the field's bilinear cells differ by up to %.3f m (%d rays); at the page's probes by up to %.3f m (%d missed)" % [col["between_max"], col["between_points"], rmax, rmiss])
	else:
		var gr: Dictionary = d["terrain"]["grid"]
		var H := KData.floats(gr["heights"])
		var nx: int = int(gr["nx"])
		var gmax := 0.0
		var gneg := 0
		for k in range(0, H.size(), 37):
			var x := float(gr["x0"]) + (k % nx) * float(gr["step"])
			var z := float(gr["z0"]) + (k / nx) * float(gr["step"])
			gmax = max(gmax, abs(KData.height_at(g, x, z) - H[k]))
			if abs(KData.height_at(g, x + 0.5 * float(gr["step"]), z) - H[k]) > 1e-3:
				gneg += 1
		var pmax := 0.0
		for p in pts:
			pmax = max(pmax, abs(KData.height_at(g, float(p[0]), float(p[1])) - float(p[2])))
		ok(d["terrain"]["source"] == "sampled" and gmax <= PROBE_TOL, "terrain (sampled: the build bakes no field): the ground passes through its grid samples to %s m" % str(gmax))
		ok(gneg > 0, "negative: half a step off, %d samples differ" % gneg)
		print("     between samples the grid's interpolation and the page's own h differ by up to %.3f m at the %d probes (the page reads a closure, not a field: nothing holds between samples but the closure itself)" % [pmax, pts.size()])
	ok(w.has_meta("stage") and (w.get_meta("stage") as Dictionary).get("format") == "krator-stage", "the stage (light, fog, sky, ground look) is there for stage.gd")

	w.queue_free()
	print("world: %d instances, %d buckets, %d records; %s" % [inst, bnodes.size(), tags.size(), "all passed" if fails == 0 else str(fails) + " failed"])
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
