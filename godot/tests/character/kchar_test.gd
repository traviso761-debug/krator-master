# kits/characters in Godot: kchar.gd against the JS golden, and a figure built from the pieces.
#   godot --headless --path godot --script res://tests/character/kchar_test.gd      exits 0 when everything matches
# The data is vendored into res://data/characters by tools/sync_core.py.
extends SceneTree

const DIR := "res://data/characters"
var fails := 0


func ok(c: bool, msg: String) -> void:
	if not c:
		fails += 1
		print("FAIL ", msg)


func j(name: String):
	return JSON.parse_string(FileAccess.get_file_as_string(DIR + "/" + name + ".json"))


func near_v(a: Vector3, b: Array, e := 1e-5) -> bool:
	return absf(a.x - b[0]) <= e and absf(a.y - b[1]) <= e and absf(a.z - b[2]) <= e


func _init() -> void:
	var skel = j("skeleton")
	var sliders = j("sliders")
	var outfits = j("outfits")
	var golden = j("golden-pose")
	var faces := {}
	for o in outfits["outfits"]:
		faces[o["id"]] = o["face"]

	# 1. the pose, number for number (to float32: Godot's Vector3)
	for g in golden["poses"]:
		var p := KChar.pose(skel, sliders, g["values"], faces[g["head"]])
		var tag := "%s %s" % [g["head"], JSON.stringify(g["values"]).left(40)]
		ok(absf(p["root"] - g["root"]) < 1e-6, "root " + tag)
		ok(absf(p["lift"] - g["lift"]) < 1e-6, "lift %f vs %f %s" % [p["lift"], g["lift"], tag])
		for i in p["t"].size():
			if not near_v(p["t"][i], g["t"][i]) or not near_v(p["s"][i], g["s"][i], 1e-6):
				ok(false, "joint %d %s" % [i, tag])
				break

	# 2. band visibility
	for g in golden["visible"]:
		var got := []
		for v in KChar.visible({"slots": g["slots"]}, outfits):
			got.append(v["outfit"] + ":" + v["mesh"])
		ok(got == g["meshes"], "visible %s" % JSON.stringify(g["slots"]))

	# 3. random records: the same KRand stream, the same rounding
	for g in golden["random"]:
		var r := KChar.random(int(g["seed"]), sliders, outfits)
		ok(r["slots"] == g["record"]["slots"], "random slots seed %d" % g["seed"])
		for k in g["record"]["sliders"]:
			ok(absf(float(r["sliders"][k]) - float(g["record"]["sliders"][k])) < 1e-9, "random %s seed %d" % [k, g["seed"]])

	# 4. a figure from the pieces
	var fig := KCharFigure.new()
	fig.load_dir(DIR)
	root.add_child(fig)
	var rec := {"slots": {"head": "phil", "torso": "bronze", "hands": "hide", "legs": "scout", "feet": "bone"}, "sliders": {}, "dye": {"torso": "#a04030"}}
	fig.apply(rec)
	var shown := 0
	for mi in fig.skeleton.get_children():
		if mi is MeshInstance3D and mi.visible:
			shown += 1
			ok(mi.skin != null and mi.skin.get_bind_count() > 0, "skin on " + mi.name)
	ok(shown == KChar.visible(rec, outfits).size(), "figure shows %d meshes" % shown)
	ok(fig.player.has_animation("walk") and fig.player.has_animation("idle"), "clips retargeted: %s" % fig.player.get_animation_list())
	# at rest every bone's global pose times its bind pose is identity: the pieces sit where they were fitted
	var worst := 0.0
	var worst_at := ""
	for mi in fig.skeleton.get_children():
		if not (mi is MeshInstance3D and mi.visible):
			continue
		for k in mi.skin.get_bind_count():
			var b: int = mi.skin.get_bind_bone(k)    # glTF skins bind by index, in skeleton.json order
			# a face joint carries weights only on the head piece; the others keep their own donor's (unused) place
			if fig.skeleton.get_bone_name(b).begins_with("face_") and mi.get_meta("slot") != "head":
				continue
			var m: Transform3D = fig.skeleton.get_bone_global_pose(b) * mi.skin.get_bind_pose(k)
			var e := m.origin.length() + (m.basis.x - Vector3.RIGHT).length()
			if e > worst:
				worst = e
				worst_at = "%s %s" % [mi.name, fig.skeleton.get_bone_name(b)]
	ok(worst < 1e-3, "rest pose x bind = identity (worst %f at %s)" % [worst, worst_at])
	# longer legs: the feet stay on the ground
	var foot := fig.skeleton.find_bone("LeftFoot")
	var y0 := fig.skeleton.get_bone_global_pose(foot).origin.y
	rec["sliders"] = {"legs": 1.0}
	fig.apply(rec)
	var y1 := fig.skeleton.get_bone_global_pose(foot).origin.y
	ok(absf(y1 - y0) < 0.005, "legs +1: foot %f -> %f" % [y0, y1])
	# a clip moves the bones
	fig.play("walk")
	var q0 := fig.skeleton.get_bone_pose_rotation(fig.skeleton.find_bone("LeftUpLeg"))
	fig._process(0.4)
	var q1 := fig.skeleton.get_bone_pose_rotation(fig.skeleton.find_bone("LeftUpLeg"))
	ok(not q0.is_equal_approx(q1), "walk moves the thigh")

	print("kchar_test: %s" % ("all passed" if fails == 0 else "%d failed" % fails))
	quit(1 if fails else 0)
