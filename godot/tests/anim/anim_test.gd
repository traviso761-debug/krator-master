# The animated fauna (material kind 'anim'; shaders/lib/anim.gdshaderinc, its GDScript twin krator/kanim.gd).
#   godot --headless --path godot --script res://tests/anim/anim_test.gd     exits 0 when every check passes
# 1. The twin against BIO.animHook's own GLSL run on a GPU (golden.json, godot/tools/anim_golden.py): every mode and
#    option the kits use (orbit, flit, walk; flap, legs), 72 cases: the pose offset, the turn and the moved vertex.
#    The GPU ran in float32 with clocks in the hundreds of seconds, so an angle carries ~1e-4 of float32 error: the
#    offset is held to 1e-3 per metre of path radius, the turn to 2e-3, the vertex to 1e-3.
# 2. The importer on the hyperjungle tile: each anim item draws with the anim shader (motes, basic and additive, with
#    anim_add), its options as uniforms, and each instance packs its path's radius (aP0.w) in COLOR.a and aP1 in
#    INSTANCE_CUSTOM, cell by cell.
# 3. Negatives: an eccentricity floor of 0.25 for three's 0.15, and a flap that forgets the walk gait's phase, must miss.
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


static func v3(a: Array) -> Vector3:
	return Vector3(float(a[0]), float(a[1]), float(a[2]))


static func v4(a: Array) -> Vector4:
	return Vector4(float(a[0]), float(a[1]), float(a[2]), float(a[3]))


# the case as the importer and shader run it: options rounded as three writes them into its GLSL
static func run(c: Dictionary, ecc_floor := 0.15, walk_phase := true) -> Dictionary:
	var o: Dictionary = c["opts"]
	var mode: int = KAnim.MODES[str(o["mode"])]
	var p1 := v4(c["p1"])
	var t := float(c["t"])
	var rad := float(c["rad"])
	if ecc_floor != 0.15:
		p1.w = maxf(p1.w, ecc_floor)
	var q := KAnim.pose(mode, rad, p1, t)
	var pos := v3(c["pos"])
	var tr := pos
	if o.has("flap"):
		var f: Dictionary = o["flap"]
		tr = KAnim.flap(pos, tr, t, p1, mode == 2 and walk_phase, snappedf(float(f["rate"]), 0.01), snappedf(float(f["amp"]), 0.001), snappedf(float(f["root"]), 0.001))
	if o.has("legs"):
		var lg: Dictionary = o["legs"]
		tr = KAnim.legs(pos, tr, p1, snappedf(float(lg["top"]), 0.001), snappedf(float(lg["amp"]), 0.001), snappedf(float(lg["amp"]) * 0.35, 0.001))
	return {"M": q["M"], "P": q["P"], "T": tr}


static func miss(c: Dictionary, r: Dictionary) -> Array:
	var rad := float(c["rad"])
	var M: Basis = r["M"]
	var g: Array = c["M"]
	var dm := 0.0
	for k in 3:
		dm = maxf(dm, (M[k] - Vector3(float(g[k * 3]), float(g[k * 3 + 1]), float(g[k * 3 + 2]))).length())
	return [((r["P"] as Vector3) - v3(c["P"])).length() / maxf(1.0, rad), dm, ((r["T"] as Vector3) - v3(c["T"])).length()]


func _initialize() -> void:
	# 1. the golden cases
	var g: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/anim/golden.json"))
	var worst := [0.0, 0.0, 0.0]
	var bad := 0
	var by_mode := {}
	for c in g["cases"]:
		var e := miss(c, run(c))
		for k in 3:
			worst[k] = maxf(worst[k], e[k])
		var b: bool = e[0] > 1e-3 or e[1] > 2e-3 or e[2] > 1e-3
		if b:
			bad += 1
		var key := str(c["opts"]["mode"]) + ("+flap" if c["opts"].has("flap") else "") + ("+legs" if c["opts"].has("legs") else "")
		by_mode[key] = by_mode.get(key, 0) + 1
	ok(bad == 0 and g["cases"].size() == 72, "%d golden cases (%s): worst offset %s per metre of radius, turn %s, vertex %s" % [g["cases"].size(), ", ".join(PackedStringArray(by_mode.keys())), String.num_scientific(worst[0]), String.num_scientific(worst[1]), String.num_scientific(worst[2])])

	# 3. negatives
	var nb := 0
	for c in g["cases"]:
		if str(c["opts"]["mode"]) != "walk":
			var e := miss(c, run(c, 0.25))
			if e[0] > 1e-3 or e[1] > 2e-3:
				nb += 1
	ok(nb >= 5, "negative: an eccentricity floor of 0.25 misses %d orbit and flit cases" % nb)
	var nw := 0
	for c in g["cases"]:
		if str(c["opts"]["mode"]) == "walk" and c["opts"].has("flap"):
			if miss(c, run(c, 0.15, false))[2] > 1e-3:
				nw += 1
	ok(nw >= 4, "negative: a flap without the walk gait's phase misses %d walking cases" % nw)

	# 2. the importer on the hyperjungle tile
	var path := "res://data/hyperjungle/biome.json"
	if not FileAccess.file_exists(path):
		ok(false, "no hyperjungle case: python3 godot/tools/export_spike.py hyperjungle")
	else:
		var d: Dictionary = KData.read_json(path)
		var mats := {}
		for m in d["materials"]:
			mats[m["id"]] = m
		var want := {}   # item name -> [aP0, aP1, options]
		for it in d["items"]:
			if mats[it["material"]]["kind"] == "anim":
				want[it["name"]] = [KData.floats(it["extras"]["aP0"]["data"]), KData.floats(it["extras"]["aP1"]["data"]), mats[it["material"]]["options"], int(it["count"])]
		var root: Node3D = KratorBiome.build(path)
		var seen := {}
		var packed_bad := 0
		var shader_bad := []
		for node in root.get_node("Items").get_children():
			var meta: Dictionary = node.get_meta("krator")
			var nm: String = meta["name"]
			if not want.has(nm):
				continue
			var w: Array = want[nm]
			var o: Dictionary = w[2]
			var sm := (node as MultiMeshInstance3D).multimesh.mesh.surface_get_material(0) as ShaderMaterial
			var expect_add: bool = o.get("basic", false) and o.get("additive", false)
			if sm.shader != (KratorBiome.ANIM_ADD if expect_add else KratorBiome.ANIM) or int(sm.get_shader_parameter("mode")) != KAnim.MODES[str(o["mode"])] \
					or bool(sm.get_shader_parameter("billboard")) != bool(o.get("billboard", false)) or bool(sm.get_shader_parameter("flap_on")) != o.has("flap"):
				shader_bad.append(nm)
			# each instance in this cell: find it in the export by its translation, compare the packed path
			var mm := (node as MultiMeshInstance3D).multimesh
			var buf := mm.buffer
			var M := KData.floats(d["items"].filter(func(x): return x["name"] == nm)[0]["matrices"])
			for j in mm.instance_count:
				var b := j * 20
				var wx: float = buf[b + 3] + node.position.x
				var wz: float = buf[b + 11] + node.position.z
				# a swarm's motes share their centre: an instance is found by its translation and its path together
				var hit := -1
				var got := Vector4(buf[b + 16], buf[b + 17], buf[b + 18], buf[b + 19])
				for i in w[3]:
					if absf(M[i * 16 + 12] - wx) < 1e-3 and absf(M[i * 16 + 14] - wz) < 1e-3 and absf(buf[b + 15] - w[0][i * 4 + 3]) < 1e-6 							and got.distance_to(Vector4(w[1][i * 4], w[1][i * 4 + 1], w[1][i * 4 + 2], w[1][i * 4 + 3])) < 1e-6:
						hit = i
						break
				if hit < 0:
					packed_bad += 1
				seen[nm] = seen.get(nm, 0) + 1
		var counts_ok := true
		for nm in want:
			counts_ok = counts_ok and seen.get(nm, 0) == want[nm][3]
		ok(not want.is_empty() and counts_ok and packed_bad == 0 and shader_bad.is_empty(),
			"hyperjungle tile: %s on the anim shaders, every instance's radius and aP1 packed (%d bad, shaders wrong on %s)" % [
				", ".join(PackedStringArray(want.keys().map(func(k): return "%s %d" % [k, want[k][3]]))), packed_bad, shader_bad])
		root.free()

	print("anim: %s" % ("all passed" if fails == 0 else "%d FAILED" % fails))
	quit(1 if fails else 0)
