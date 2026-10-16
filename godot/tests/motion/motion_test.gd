# The fauna a kit moves on the CPU, replayed from its baked motion (biomes/GODOT.md, "Motion"; krator/kmotion.gd).
#   godot --headless --path godot --script res://tests/motion/motion_test.gd     exits 0 when every check passes
# golden.json (godot/tools/motion_golden.py) holds, per case, a krator-biome export of a few moving animals with their
# baked tracks, and the page's own pose of each at pinned clocks (its ticks run at that clock). Here:
# 1. The importer (krator/biome_import.gd) builds the export: every moving item gets a KMotion player, and its
#    custom_aabb holds the animal at every clock.
# 2. The player at each clock puts every instance where the page put it: sedesert's buck (body, head, antlers, legs:
#    a declared period, so at every clock, 1000 s too) and four swifts, swbay's four soaring birds (loops: inside the
#    exact window, 0 to 118 s). On the 10 Hz grid to float32's error; off it within the lerp's (5 cm).
# 3. swbay's birds draw with shaders/anim_phase.gdshader (mode bird) and carry their beat (aPh) in INSTANCE_CUSTOM.x.
# 4. Negatives: half a second off misses; past its window a loop is not the page; inside the fade it blends. The loop's
#    seam is continuous.
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


static func dist(a: Transform3D, v: Array) -> float:
	var d := 0.0
	var f := [a.basis.x.x, a.basis.x.y, a.basis.x.z, a.basis.y.x, a.basis.y.y, a.basis.y.z, a.basis.z.x, a.basis.z.y, a.basis.z.z, a.origin.x, a.origin.y, a.origin.z]
	for q in 12:
		d = maxf(d, absf(float(f[q]) - float(v[q])))
	return d


# instance i's transform from a MultiMesh buffer (20 floats an instance: the 3x4 row by row; the headless renderer keeps
# the buffer but answers get_instance_transform with the identity)
static func tf_of(buf: PackedFloat32Array, i: int) -> Transform3D:
	var b := i * 20
	return Transform3D(Basis(Vector3(buf[b], buf[b + 4], buf[b + 8]), Vector3(buf[b + 1], buf[b + 5], buf[b + 9]), Vector3(buf[b + 2], buf[b + 6], buf[b + 10])),
		Vector3(buf[b + 3], buf[b + 7], buf[b + 11]))


static func on_grid(t: float) -> bool:
	return absf(t * 10.0 - roundf(t * 10.0)) < 1e-6


func _initialize() -> void:
	var g = KData.read_json("res://tests/motion/golden.json")
	ok(g is Dictionary and g.get("format") == "krator-motion-golden", "golden.json read (%d cases)" % (g["cases"].size() if g is Dictionary else 0))
	for c in g["cases"]:
		var path := "user://motion_%s.biome.json" % c["name"]
		var f := FileAccess.open(path, FileAccess.WRITE)
		f.store_string(JSON.stringify(c["export"]))
		f.close()
		var root := KratorBiome.build(path)
		var rep: Dictionary = root.get_meta("report")
		var want := 0
		for k in c["keep"]:
			want += (c["keep"][k] as Array).size()
		ok(int(rep["counts"].get("moving", 0)) == want and not rep["gaps"].has("motion"), "%s: the importer gives every moving item a player (%d instances; gaps %s)" % [c["name"], want, rep["gaps"].keys()])
		var worst_grid := 0.0
		var worst_lerp := 0.0
		var worst_far := 0.0   # a period's instance past the loop's window (the buck at 250.7 s and 1000.05 s)
		var loop_far := 1e9    # a loop's instance past its window: must NOT match
		var loop_fade := 1e9   # a loop's instance inside its fade (-1 s): blended, not the page
		var shifted := 0.0     # half a second off: some animal must be elsewhere (a deer at a stop is not)
		var aabb_ok := true
		var seam := 0.0
		for mmi in root.get_node("Items").get_children():
			var name: String = (mmi.get_meta("krator") as Dictionary)["name"]
			var player := mmi.get_node_or_null("Motion") as KMotion
			ok(player != null, "%s %s: a KMotion player" % [c["name"], name])
			if player == null:
				continue
			var mm: MultiMesh = mmi.multimesh
			var periodic: bool = player.track["period"][0] > 0.0
			for ts in c["truth"]:
				var t := float(ts)
				player.apply(t)
				var rows: Array = c["truth"][ts][name]
				for i in rows.size():
					var tf: Transform3D = tf_of(mm.buffer, i)
					tf.origin += mmi.position
					var d := dist(tf, rows[i])
					if not mmi.custom_aabb.has_point(Vector3(float(rows[i][9]), float(rows[i][10]), float(rows[i][11])) - mmi.position):
						aabb_ok = false
					var inside := t >= 0.0 and t < 118.0
					if periodic or inside:
						if periodic and not inside:
							worst_far = maxf(worst_far, d)
						elif on_grid(t):
							worst_grid = maxf(worst_grid, d)
						else:
							worst_lerp = maxf(worst_lerp, d)
					elif t < 0.0:
						loop_fade = minf(loop_fade, d)
					else:
						loop_far = minf(loop_far, d)
				player.apply(t + 0.5)
				for i in rows.size():
					var tf2: Transform3D = tf_of(mm.buffer, i)
					tf2.origin += mmi.position
					shifted = maxf(shifted, dist(tf2, rows[i]))
			for j in player.sel:
				# across the seam an animal moves as far as it does in the same 20 ms just before it
				var a0 := KMotion.transform(KMotion.sample(player.track, j, 117.97)).origin
				var a := KMotion.transform(KMotion.sample(player.track, j, 117.99)).origin
				var b := KMotion.transform(KMotion.sample(player.track, j, 118.01)).origin
				seam = maxf(seam, a.distance_to(b) / maxf(a0.distance_to(a), 1e-3))
			if (mmi.get_meta("krator") as Dictionary)["kind"] == "anim-phase":
				var sm := mm.mesh.surface_get_material(0) as ShaderMaterial
				var ph: Array = []
				var it: Dictionary = {}
				for x in c["export"]["items"]:
					if x["name"] == name:
						it = x
				var PH := KData.floats(it["extras"]["aPh"]["data"])
				var cx := true
				for i in mm.instance_count:
					cx = cx and absf(mm.buffer[i * 20 + 16] - PH[i]) < 1e-6
				ok(sm != null and sm.shader.resource_path.ends_with("anim_phase.gdshader") and int(sm.get_shader_parameter("mode")) == 0 and cx,
					"%s %s: the beat's shader (anim_phase, mode bird) and each bird's aPh in INSTANCE_CUSTOM.x" % [c["name"], name])
		ok(worst_grid < 2e-3, "%s: on the 10 Hz grid the replay is the page (worst %.6f)" % [c["name"], worst_grid])
		ok(worst_lerp < 0.05, "%s: between frames within the lerp (worst %.4f m)" % [c["name"], worst_lerp])
		if c["name"] == "sedesert":
			ok(worst_far < 0.05, "sedesert: the buck's declared period holds past the loop, at 250.7 s and 1000.05 s (worst %.4f m)" % worst_far)
		ok(loop_far > 1.0, "%s: negative: past its window a loop is not the page (nearest %.1f m off)" % [c["name"], loop_far])
		ok(loop_fade > 0.01, "%s: negative: inside the fade (-1 s) the loop blends (nearest %.3f off)" % [c["name"], loop_fade])
		ok(shifted > 0.1, "%s: negative: half a second off misses (farthest %.3f m)" % [c["name"], shifted])
		ok(seam < 1.5, "%s: no jump at the loop's seam: 117.99 s to 118.01 s is %.2f times the 20 ms before it" % [c["name"], seam])
		ok(aabb_ok, "%s: every pose lies in its node's custom_aabb (never culled)" % c["name"])
		root.free()
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
